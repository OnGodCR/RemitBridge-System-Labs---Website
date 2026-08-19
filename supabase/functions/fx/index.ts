/**
 * Mid-market rates for the TrueCost receipt checker.
 *
 * The unit of work here is a base currency and a day, not a single pair.
 * Frankfurter returns every quote for a base in one free request, for past days
 * as well as today, so asking about USD to MXN costs the same upstream call as
 * asking about all 165 USD pairs. Fetching one pair at a time was paying full
 * price for a fraction of the answer.
 *
 * What that means in practice: one upstream call per base per day, ever. Not
 * per visitor, not per corridor, and not again tomorrow for a day already
 * stored, because a past day's rate cannot change.
 *
 * Twelve Data sits in front of that when TWELVEDATA_API_KEY is set. It prices
 * one pair per credit rather than a whole base, so it is asked only for the
 * corridors listed in CORE_QUOTES plus whatever was actually requested, and
 * only for today. Frankfurter still fills the rest of the base behind it. Rows
 * carry the source that produced them, so a real-time rate and a daily one can
 * sit in the same table without either being misattributed.
 *
 * There is no scheduled job. The first lookup of the day fills the table for
 * that whole base and every request after it is served from Postgres, which is
 * the same daily refresh a cron would give without a second thing to deploy or
 * a silent failure to notice. The browser reads the table directly, so most
 * lookups never reach this function at all.
 *
 * Why the function exists rather than a fetch from the browser: a live provider
 * authenticates, and a key in a Vite bundle is a public key. It is set with
 * `supabase secrets set` and never appears in this repo.
 *
 * Set up: see supabase/functions/README.md.
 */

const FRANKFURTER = 'https://api.frankfurter.dev/v2'
const TWELVEDATA = 'https://api.twelvedata.com/exchange_rate'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

/*
 * Both inputs are attacker controlled: this endpoint is public and takes no
 * auth. A currency code is three letters and a date is a calendar date, so
 * anything else is rejected before it reaches a URL or a REST filter.
 */
const isCode = (v: string) => /^[A-Z]{3}$/.test(v)
const isDay = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))

/*
 * The oldest date worth answering.
 *
 * A base and a day that has never been asked for is a guaranteed upstream call,
 * and this endpoint is public. Without a bound, walking every date back to 1999
 * empties a month's allowance in one script. Ten years is well past any receipt
 * someone would still be checking, and anything older falls through to manual
 * entry rather than being refused outright.
 */
const OLDEST_DAY = () => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 10)
  return d.toISOString().slice(0, 10)
}

/**
 * How long today's stored rates are still worth serving.
 *
 * Only ever applied to today. A past day is immutable and is never refetched.
 * Six hours rather than a full day so a corridor picks up the new publication
 * within the morning instead of the following one.
 */
const TODAY_TTL_MS = 6 * 60 * 60 * 1000

type Quote = { quote: string; rate: number; day: string }
type Batch = { rows: Quote[]; source: string; live: boolean }

/** A fetch with a deadline. A provider that hangs must not hang the page. */
async function getJson(url: string, ms = 8000): Promise<any | null> {
  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), ms)
  try {
    const res = await fetch(url, { signal: abort.signal })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/*
 * The corridors worth spending a credit on.
 *
 * Twelve Data prices one pair per credit, unlike Frankfurter which returns a
 * whole base in one free request. So a metered provider gets asked for a
 * bounded list rather than all 165 pairs: the currencies people send from,
 * so cross-rates between them work, plus the receiving currencies this lab
 * exists for. The pair actually requested is always added, whatever is here.
 *
 * Roughly 40 credits per fill, at most four fills a day per base under the
 * six-hour TTL, and only when somebody actually uses the tool. Against a free
 * allowance of 800 a day that leaves a wide margin.
 */
const CORE_QUOTES = [
  // Sending side.
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'JPY', 'SGD', 'NZD', 'NOK', 'SEK',
  'AED', 'SAR', 'QAR', 'KWD', 'ILS',
  // Receiving side: the high-cost corridors the research is about.
  'MXN', 'INR', 'PHP', 'NGN', 'KES', 'PKR', 'BDT', 'GHS', 'NPR', 'VND',
  'GTQ', 'HTG', 'EGP', 'LKR', 'IDR', 'THB', 'COP', 'PEN', 'BRL', 'MAD',
  'UGX', 'TZS', 'ZAR', 'ETB', 'KHR', 'DOP', 'HNL', 'JMD', 'MMK', 'UZS',
]

/**
 * Reads one Twelve Data payload into rows.
 *
 * Two response shapes, which is the trap: a single symbol returns a flat
 * object, several symbols return an object keyed by "USD/INR". Both are
 * handled rather than assumed, because the batch call degrades to a single
 * call below and the parser has to survive either.
 */
function readTwelveData(payload: unknown, base: string): Quote[] {
  const rows: Quote[] = []

  const take = (entry: any) => {
    const rate = Number(entry?.rate)
    if (!Number.isFinite(rate) || rate <= 0) return
    const quote = String(entry?.symbol ?? '').split('/')[1]?.toUpperCase()
    if (!isCode(quote) || quote === base) return
    // The provider stamps each quote with the second it was priced. That
    // second, in UTC, is the day the row belongs to.
    const at = Number(entry?.timestamp)
    const day = new Date(Number.isFinite(at) ? at * 1000 : Date.now())
      .toISOString()
      .slice(0, 10)
    rows.push({ quote, rate, day })
  }

  const data = payload as Record<string, any>
  if (!data || typeof data !== 'object') return rows
  if (typeof data.symbol === 'string') take(data)
  else for (const entry of Object.values(data)) take(entry)
  return rows
}

/**
 * The live provider. Real-time mid-market rates, free tier, 800 calls a day.
 *
 * Today only. Its history lives behind a different endpoint that costs a
 * credit per day per pair, where Frankfurter serves any past date for free and
 * with a longer record, so historical lookups are left to Frankfurter
 * deliberately rather than for want of trying.
 *
 * Returns null on anything unexpected, so the caller falls through.
 */
async function fromTwelveData(
  base: string,
  quote: string,
  day: string | null,
): Promise<Batch | null> {
  const key = Deno.env.get('TWELVEDATA_API_KEY')
  if (!key || day) return null

  const quotes = [...new Set([quote, ...CORE_QUOTES])].filter((q) => q !== base)
  const ask = (symbols: string[]) =>
    getJson(
      `${TWELVEDATA}?symbol=${symbols.map((q) => `${base}/${q}`).join(',')}` +
        `&apikey=${encodeURIComponent(key)}`,
    )

  /*
   * Batch first, then the single pair.
   *
   * Whether a free key may batch is a plan detail that can change under us, so
   * the fallback is not defensive padding: it is the difference between a live
   * rate for the pair somebody asked about and no live rate at all. Frankfurter
   * still fills the rest of the base behind it either way.
   */
  let rows = readTwelveData(await ask(quotes), base)
  if (!rows.length) rows = readTwelveData(await ask([quote]), base)

  return rows.length ? { rows, source: 'Twelve Data', live: true } : null
}

/** The no-key fallback, whole base at a time. */
async function fromFrankfurter(base: string, day: string | null): Promise<Batch | null> {
  const params = new URLSearchParams({ base })
  if (day) params.set('date', day)

  const data = await getJson(`${FRANKFURTER}/rates?${params}`)
  if (!Array.isArray(data)) return null

  /*
   * The date is read per row, not taken from the request. This API returns
   * different dates for different currencies in one response: a thinly traded
   * currency can be a day behind the rest. Stamping them all with the day that
   * was asked for would quietly backdate real numbers.
   */
  const rows: Quote[] = []
  for (const r of data) {
    if (isCode(r?.quote) && typeof r?.rate === 'number' && r.rate > 0 && isDay(r?.date)) {
      rows.push({ quote: r.quote, rate: r.rate, day: r.date })
    }
  }
  return rows.length ? { rows, source: 'Frankfurter', live: false } : null
}

/* ---- storage ------------------------------------------------------------ */

const dbUrl = Deno.env.get('SUPABASE_URL') ?? ''
const dbKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const restHeaders = {
  apikey: dbKey,
  Authorization: `Bearer ${dbKey}`,
  'Content-Type': 'application/json',
}

/**
 * PostgREST directly rather than the JS client: two calls, no dependency, and
 * nothing here needs a session. Both carry the service key, which the platform
 * injects and which never appears in this repo.
 */
async function restGet(path: string): Promise<any[] | null> {
  if (!dbUrl || !dbKey) return null
  try {
    const res = await fetch(`${dbUrl}/rest/v1/${path}`, { headers: restHeaders })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/** The whole base in one write. ~165 rows, one round trip. */
async function store(base: string, batch: Batch): Promise<void> {
  if (!dbUrl || !dbKey) return
  const now = new Date().toISOString()
  const rows = batch.rows
    // A base priced against itself is 1 by definition and not worth a row.
    .filter((r) => r.quote !== base)
    .map((r) => ({
      base,
      quote: r.quote,
      day: r.day,
      rate: r.rate,
      source: batch.source,
      live: batch.live,
      fetched_at: now,
    }))
  if (!rows.length) return

  try {
    await fetch(`${dbUrl}/rest/v1/fx_rates?on_conflict=base,quote,day`, {
      method: 'POST',
      headers: { ...restHeaders, Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(rows),
    })
  } catch {
    // A write that fails costs one extra upstream call next time. It is never a
    // reason to fail the request the visitor actually made.
  }
}

/* ---- handler ------------------------------------------------------------ */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const url = new URL(req.url)
  const base = (url.searchParams.get('base') ?? '').toUpperCase()
  const quote = (url.searchParams.get('quote') ?? '').toUpperCase()
  const dayParam = url.searchParams.get('date')

  if (!isCode(base) || !isCode(quote)) {
    return json({ error: 'base and quote must each be a three letter currency code' }, 400)
  }
  if (dayParam !== null && !isDay(dayParam)) {
    return json({ error: 'date must be YYYY-MM-DD' }, 400)
  }
  if (dayParam !== null && dayParam < OLDEST_DAY()) {
    return json({ error: 'Rates before ten years ago are not looked up here.' }, 400)
  }

  // Same currency both ends is arithmetic, not a lookup.
  if (base === quote) {
    return json({ rate: 1, day: dayParam, source: 'identity', live: false, cached: false })
  }

  const today = new Date().toISOString().slice(0, 10)
  // A future date is not an error, it just means "the most recent".
  const day = dayParam && dayParam <= today ? dayParam : null
  const isPast = Boolean(day && day < today)

  const rows = await restGet(
    day
      ? `fx_rates?base=eq.${base}&quote=eq.${quote}&day=eq.${day}&limit=1&select=rate,day,source,live,fetched_at`
      : `fx_rates?base=eq.${base}&quote=eq.${quote}&order=day.desc&limit=1&select=rate,day,source,live,fetched_at`,
  )
  const hit = rows?.[0]

  if (hit) {
    const fresh = Date.now() - Date.parse(hit.fetched_at) < TODAY_TTL_MS
    // A past day cannot change, so how long ago it was fetched is irrelevant.
    if (isPast || fresh) {
      return json({
        rate: Number(hit.rate),
        day: hit.day,
        source: hit.source,
        live: hit.live,
        cached: true,
      })
    }
  }

  /*
   * Twelve Data answers with a real-time rate but only for the pairs it was
   * asked about. Frankfurter then fills the rest of the base for free, so the
   * next visitor asking about a different corridor is served from Postgres.
   * Each row records which source it came from, so a live rate and a daily one
   * sitting in the same table are still each attributed correctly.
   */
  const live = await fromTwelveData(base, quote, day)
  const daily = await fromFrankfurter(base, day)

  /*
   * Daily first, then live. The upsert conflicts on (base, quote, day), so
   * whichever writes last wins the row, and the real-time rate has to be the
   * one that survives. Reversing these two lines silently downgrades every
   * pair Twelve Data just priced back to the daily reference.
   */
  if (daily) await store(base, daily)
  if (live) await store(base, live)

  const batch = live ?? daily

  if (batch) {
    const row = batch.rows.find((r) => r.quote === quote)
    if (row) {
      return json({
        rate: row.rate,
        day: row.day,
        source: batch.source,
        live: batch.live,
        cached: false,
      })
    }
  }

  /*
   * Serve a stale hit rather than nothing. An hour-old mid-market rate is far
   * more use than an error, as long as its date travels with it, which it does.
   */
  if (hit) {
    return json({
      rate: Number(hit.rate),
      day: hit.day,
      source: hit.source,
      live: hit.live,
      cached: true,
      stale: true,
    })
  }

  return json({ error: `No reference rate available for ${base} to ${quote}.` }, 502)
})
