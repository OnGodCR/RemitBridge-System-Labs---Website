/**
 * Mid-market rates for the TrueCost receipt checker.
 *
 * The unit of work here is a base currency and a day, not a single pair.
 * Both providers return every quote for a base in one request, for past days
 * as well as today, so asking about USD to MXN costs exactly the same upstream
 * call as asking about all 165 USD pairs. Fetching one pair at a time was
 * paying full price for a fraction of the answer.
 *
 * What that means in practice: one upstream call per base per day, ever. Not
 * per visitor, not per corridor, and not again tomorrow for a day already
 * stored, because a past day's rate cannot change. A 1,500 request monthly
 * allowance covers roughly fifty base-days a day.
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
const EXCHANGERATE = 'https://v6.exchangerate-api.com/v6'

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

/**
 * The paid provider, whole base at a time.
 *
 * Returns null on anything unexpected, including the 403 a free-tier key gets
 * from the history endpoint, so the caller falls through to Frankfurter.
 */
async function fromExchangeRate(base: string, day: string | null): Promise<Batch | null> {
  const key = Deno.env.get('EXCHANGERATE_API_KEY')
  if (!key) return null

  const url = day
    ? (([y, m, d]) => `${EXCHANGERATE}/${key}/history/${base}/${y}/${m}/${d}`)(
        day.split('-').map(Number),
      )
    : `${EXCHANGERATE}/${key}/latest/${base}`

  const data = await getJson(url)
  if (data?.result !== 'success' || typeof data.conversion_rates !== 'object') return null

  // For today's rates the provider's own last-update stamp is the day they are
  // for. Falling back to the current date rather than trusting a bad parse.
  const stamp = Date.parse(data.time_last_update_utc ?? '')
  const asOf = day ?? (Number.isNaN(stamp) ? new Date() : new Date(stamp)).toISOString().slice(0, 10)

  const rows: Quote[] = []
  for (const [quote, rate] of Object.entries(data.conversion_rates)) {
    if (isCode(quote) && typeof rate === 'number' && rate > 0) {
      rows.push({ quote, rate, day: asOf })
    }
  }
  return rows.length ? { rows, source: 'ExchangeRate-API', live: !day } : null
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

  const batch = (await fromExchangeRate(base, day)) ?? (await fromFrankfurter(base, day))

  if (batch) {
    // Stored before answering, so the next visitor asking about any of the
    // other 164 pairs for this base is served without another upstream call.
    await store(base, batch)
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
