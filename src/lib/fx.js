/**
 * Mid-market reference rates, from Frankfurter.
 *
 * https://frankfurter.dev — no key, no account, open source. It aggregates
 * daily reference rates published by central banks.
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

const API = 'https://api.frankfurter.dev/v2'

/** Per-session, in memory. Nothing is written to storage. */
const rateCache = new Map()
let currencyCache = null

/** One retry, then give up and let the caller offer manual entry. */
async function getJson(url) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(url)
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
 * @returns {Promise<{rate, date, requestedDate, isStale} | {error}>}
 *          `date` is the day the rate is actually for. `isStale` is true when
 *          that is not the day that was asked for, which the UI has to say out
 *          loud rather than quietly showing a different day's number.
 */
export async function fetchRate(base, quote, date) {
  if (!base || !quote) return { error: 'Pick both currencies first.' }

  // Same currency both ends: no lookup, and the answer is exactly 1.
  if (base === quote) {
    return { rate: 1, date: date ?? null, requestedDate: date ?? null, isStale: false }
  }

  const key = `${base}|${quote}|${date ?? 'latest'}`
  if (rateCache.has(key)) return rateCache.get(key)

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

  const result = {
    rate: row.rate,
    date: row.date,
    requestedDate: date ?? null,
    isStale: Boolean(date && row.date !== date),
  }
  rateCache.set(key, result)
  return result
}

/** Today in the API's format, in the user's own timezone. */
export function today() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export const FX_SOURCE = {
  name: 'Frankfurter',
  href: 'https://frankfurter.dev',
  description:
    'Daily reference rates aggregated from central bank publications. Reference rates are a daily snapshot, not the rate at the moment any particular transfer was processed.',
}
