/**
 * Mid-market reference rates.
 *
 * Three paths, in this order:
 *
 *   1. The stored rates table, read straight from Postgres. Public reference
 *      data, so this needs no function and no key: about 100ms. Almost every
 *      lookup ends here, because one upstream call stores every pair for a
 *      base currency on a given day.
 *   2. The `fx` edge function, on a miss. It talks to a live rate provider with
 *      a key that cannot live in this bundle, fills the table for the whole
 *      base, and answers. About 1.5s, once per base per day.
 *   3. Frankfurter directly, when the backend is not configured at all or both
 *      of the above fail.
 *
 * The fallback is not a broken state. Frankfurter is a real source with real
 * dated history, and it is what the site used before any provider existed. Both
 * paths return the source, and the page names it rather than implying one
 * number came from somewhere better than it did.
 *
 * On Frankfurter specifically: https://frankfurter.dev — no key, no account,
 * open source. It aggregates daily reference rates published by central banks.
 *
 * Verified against the live API rather than taken from documentation, because
 * the documented `llms.txt` returns 404 and two widely repeated claims about
 * this API turned out not to hold for v2:
 *
 *   - v1 is the ECB set: 30 currencies. v2 returns 165, including KES, NGN,
 *     PKR, GHS, BDT, NPR, VND, GTQ and HTG. Those are exactly the high-cost
 *     corridors this tool exists for, so v2 is the one worth using.
 *   - v2 returns rates on Saturdays and Sundays, so the "ECB working days only"
 *     description does not fit it. What the response does do is return the date
 *     the rate is actually for, which can differ from the date asked for and
 *     can differ between currencies in one response. That date is carried
 *     through to the UI rather than assumed.
 *
 * Response shape, confirmed: [{ date, base, quote, rate }].
 *
 * Nothing about the user goes over the wire. A request carries a currency pair
 * and sometimes a date. No amount, no fee, no identifier.
 */

import { supabase } from '@/lib/supabase'

const API = 'https://api.frankfurter.dev/v2'

/*
 * The edge function, when the backend is configured. Built from the same env
 * the client uses, so a deploy without Supabase simply has no function to call
 * and every lookup goes straight to Frankfurter.
 */
const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fx`
  : null
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''

/** Matches the edge function's rule, so the two never disagree about freshness. */
const TODAY_TTL_MS = 6 * 60 * 60 * 1000

/**
 * Today in UTC, which is what the stored `day` column is in.
 *
 * Deliberately not `today()` below, which is the user's own timezone and is
 * what the date field on the form should default to. Comparing a local date
 * against a UTC one decides "is this in the past" wrongly for anyone west of
 * Greenwich for part of every day.
 */
const todayUtc = () => new Date().toISOString().slice(0, 10)

/** Per-session, in memory. Nothing is written to storage. */
const rateCache = new Map()
let currencyCache = null

/** One retry, then give up and let the caller offer manual entry. */
async function getJson(url, headers) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(url, headers ? { headers } : undefined)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return { data: await res.json() }
    } catch (error) {
      if (attempt === 1) return { error }
    }
  }
  return { error: new Error('unreachable') }
}

/**
 * Currency codes the API can price, with their names.
 *
 * Fetched once and cached. Used to decide whether to offer a rate lookup or go
 * straight to manual entry, so a currency it cannot price is never silently
 * swapped for one it can.
 */
export async function fetchCurrencies() {
  if (currencyCache) return currencyCache

  const { data, error } = await getJson(`${API}/currencies`)
  if (error || !Array.isArray(data)) {
    // An empty list is honest: nothing is known to be supported, so every pair
    // falls through to manual entry rather than being wrongly refused.
    return { currencies: [], error: describe(error) }
  }

  const currencies = data
    .map((c) => ({ code: c.iso_code, name: c.name }))
    .filter((c) => c.code)
    .sort((a, b) => a.code.localeCompare(b.code))

  currencyCache = { currencies }
  return currencyCache
}

/** Turns a fetch failure into something that says what to do next. */
function describe(error) {
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false
  if (offline) {
    return 'You appear to be offline, so the reference rate could not be loaded. Enter the mid-market rate yourself and the rest still works.'
  }
  return `The reference rate service did not answer${
    error?.message ? ` (${error.message})` : ''
  }. Enter the mid-market rate yourself and the rest still works.`
}

/**
 * One mid-market rate.
 *
 * @param {string} base   sending currency
 * @param {string} quote  receiving currency
 * @param {string} [date] YYYY-MM-DD. Omit for the most recent.
 * @returns {Promise<{rate, date, requestedDate, isStale, source, live} | {error}>}
 *          `date` is the day the rate is actually for. `isStale` is true when
 *          that is not the day that was asked for, which the UI has to say out
 *          loud rather than quietly showing a different day's number. `source`
 *          names whoever answered, and `live` says whether that source updates
 *          during the day or publishes once.
 */
export async function fetchRate(base, quote, date) {
  if (!base || !quote) return { error: 'Pick both currencies first.' }

  // Same currency both ends: no lookup, and the answer is exactly 1.
  if (base === quote) {
    return {
      rate: 1,
      date: date ?? null,
      requestedDate: date ?? null,
      isStale: false,
      source: null,
      live: false,
    }
  }

  const key = `${base}|${quote}|${date ?? 'latest'}`
  if (rateCache.has(key)) return rateCache.get(key)

  const result =
    (await viaTable(base, quote, date)) ??
    (await viaFunction(base, quote, date)) ??
    (await viaFrankfurter(base, quote, date))

  if (!result.error) rateCache.set(key, result)
  return result
}

/**
 * The stored rates, read directly. Null means "not stored", not "failed".
 *
 * Only serves today's rate if it was fetched recently, matching the function's
 * own rule. A past day is immutable, so how long ago it was stored does not
 * matter and it is served whatever its age.
 */
async function viaTable(base, quote, date) {
  if (!supabase) return null

  const today = todayUtc()
  const day = date && date <= today ? date : null

  let query = supabase
    .from('fx_rates')
    .select('rate, day, source, live, fetched_at')
    .eq('base', base)
    .eq('quote', quote)

  query = day ? query.eq('day', day) : query.order('day', { ascending: false })

  const { data, error } = await query.limit(1)
  const row = data?.[0]
  if (error || !row) return null

  const isPast = Boolean(day && day < today)
  if (!isPast && Date.now() - Date.parse(row.fetched_at) > TODAY_TTL_MS) return null

  return {
    rate: Number(row.rate),
    date: row.day,
    requestedDate: date ?? null,
    isStale: Boolean(date && row.day !== date),
    source: row.source,
    live: Boolean(row.live),
  }
}

/**
 * The edge function. Returns null, not an error, on anything unexpected: a
 * missing deploy and a provider outage both mean "try the other path", and
 * neither is worth showing a visitor who is about to get an answer anyway.
 */
async function viaFunction(base, quote, date) {
  if (!FUNCTIONS_URL) return null

  const params = new URLSearchParams({ base, quote })
  if (date) params.set('date', date)

  const { data, error } = await getJson(`${FUNCTIONS_URL}?${params}`, {
    Authorization: `Bearer ${ANON_KEY}`,
    apikey: ANON_KEY,
  })
  if (error || !data || typeof data.rate !== 'number') return null

  return {
    rate: data.rate,
    date: data.day ?? null,
    requestedDate: date ?? null,
    isStale: Boolean(date && data.day && data.day !== date),
    source: data.source ?? null,
    live: Boolean(data.live),
  }
}

/** Frankfurter, straight from the browser. No key, so nothing to protect. */
async function viaFrankfurter(base, quote, date) {
  const params = new URLSearchParams({ base, quotes: quote })
  if (date) params.set('date', date)

  const { data, error } = await getJson(`${API}/rates?${params}`)
  if (error) return { error: describe(error) }

  const row = Array.isArray(data) ? data.find((r) => r.quote === quote) : null
  if (!row || typeof row.rate !== 'number') {
    return {
      error: `No reference rate is published for ${base} to ${quote}. Enter the mid-market rate yourself and the rest still works.`,
    }
  }

  return {
    rate: row.rate,
    date: row.date,
    requestedDate: date ?? null,
    isStale: Boolean(date && row.date !== date),
    source: 'Frankfurter',
    live: false,
  }
}

/** Today in the API's format, in the user's own timezone. */
export function today() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/**
 * Who each source is, keyed by the name the lookup reports.
 *
 * Attribution is per answer rather than a constant on the page. Two sources can
 * serve the same tool now, and a page that names one while showing the other's
 * number is exactly the sort of unchecked claim this site is about.
 */
const SOURCES = {
  Frankfurter: {
    name: 'Frankfurter',
    href: 'https://frankfurter.dev',
    description:
      'Daily reference rates aggregated from central bank publications. A daily snapshot, not the rate at the moment any particular transfer was processed.',
  },
  'Twelve Data': {
    name: 'Twelve Data',
    href: 'https://twelvedata.com',
    description:
      'Real-time mid-market rates, priced to the second. Still a reference rate: it is the market midpoint, not a price any provider offered you.',
  },
}

/** Falls back to naming the source plainly if it is one we have no note for. */
export function sourceOf(name) {
  if (!name) return null
  return SOURCES[name] ?? { name, href: null, description: 'Mid-market reference rate.' }
}

/** What to say before any lookup has happened. */
export const FX_SOURCE = SOURCES.Frankfurter
