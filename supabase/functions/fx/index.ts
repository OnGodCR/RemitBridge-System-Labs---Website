/**
 * One mid-market rate, from a live provider when one is configured.
 *
 * Why this is a function and not a fetch from the browser:
 *
 *   - Every live rate provider authenticates with a key. A key in a Vite bundle
 *     is a public key, so it has to be read server side. It is set with
 *     `supabase secrets set` and never appears in this repo.
 *   - Providers charge by the request. Everyone checking the same corridor on
 *     the same day is asking one question, so the answer is cached in Postgres
 *     and one upstream call serves all of them. A free tier of 1,500 requests a
 *     month is workable with a cache and is gone in a week without one.
 *
 * Falls back to Frankfurter whenever the provider is unset, out of quota, or
 * does not answer, so the tool works with no key and no bill. That fallback is
 * not a degraded mode to hide: which source answered is returned and the page
 * says so.
 *
 * Set up: see supabase/functions/README.md.
 */

const FRANKFURTER = 'https://api.frankfurter.dev/v2'
const EXCHANGERATE = 'https://v6.exchangerate-api.com/v6'

/*
 * How long a cached rate is still worth serving.
 *
 * A rate for a past day never changes, so it is kept forever. Today's rate is
 * only as good as the provider's own update cycle: the paid ExchangeRate-API
 * tiers refresh hourly, Frankfurter publishes once a day. Holding a daily rate
 * for six hours rather than a day means a corridor picks up the new publication
 * within the morning instead of the following one.
 */
const LIVE_TTL_MS = 55 * 60 * 1000
const DAILY_TTL_MS = 6 * 60 * 60 * 1000

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
 * anything else is rejected before it reaches a URL or a SQL filter.
 */
const isCode = (v: string) => /^[A-Z]{3}$/.test(v)
const isDay = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))

/*
 * The oldest date worth answering.
 *
 * The cache only protects the quota for questions that repeat. A distinct pair
 * and date is a guaranteed miss and so a guaranteed upstream call, and this
 * endpoint is public and unauthenticated: without a bound, walking every date
 * back to 1999 across a few pairs empties a month's quota in one script.
 *
 * Ten years is well past any receipt someone would still be checking, and
 * anything older falls back to manual entry rather than being refused outright.
 */
const OLDEST_DAY = () => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 10)
  return d.toISOString().slice(0, 10)
}

type Answer = { rate: number; day: string; source: string; live: boolean }

/** A fetch with a deadline. A provider that hangs must not hang the page. */
async function getJson(url: string, ms = 6000): Promise<any | null> {
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
 * The paid provider. Returns null on anything unexpected, including the 403
 * a free-tier key gets from the history endpoint, so the caller falls through.
 */
async function fromExchangeRate(
  base: string,
  quote: string,
  day: string | null,
): Promise<Answer | null> {
  const key = Deno.env.get('EXCHANGERATE_API_KEY')
  if (!key) return null

  if (day) {
    const [y, m, d] = day.split('-').map(Number)
    const data = await getJson(`${EXCHANGERATE}/${key}/history/${base}/${y}/${m}/${d}`)
    const rate = data?.conversion_rates?.[quote]
    if (data?.result !== 'success' || typeof rate !== 'number') return null
    return { rate, day, source: 'ExchangeRate-API', live: false }
  }

  const data = await getJson(`${EXCHANGERATE}/${key}/pair/${base}/${quote}`)
  if (data?.result !== 'success' || typeof data.conversion_rate !== 'number') return null

  // time_last_update_utc is when the provider last recalculated, which is the
  // day the rate is for. Falling back to today rather than trusting a parse.
  const stamp = Date.parse(data.time_last_update_utc ?? '')
  const asOf = Number.isNaN(stamp) ? new Date() : new Date(stamp)
  return {
    rate: data.conversion_rate,
    day: asOf.toISOString().slice(0, 10),
    source: 'ExchangeRate-API',
    live: true,
  }
}

/** The no-key fallback. Same source the site used before any of this. */
async function fromFrankfurter(
  base: string,
  quote: string,
  day: string | null,
): Promise<Answer | null> {
  const params = new URLSearchParams({ base, quotes: quote })
  if (day) params.set('date', day)

  const data = await getJson(`${FRANKFURTER}/rates?${params}`)
  const row = Array.isArray(data) ? data.find((r: any) => r.quote === quote) : null
  if (!row || typeof row.rate !== 'number' || typeof row.date !== 'string') return null

  // v2 returns the day the rate is actually for, which can differ from the day
  // asked for. That date is what gets stored, never the requested one.
  return { rate: row.rate, day: row.date, source: 'Frankfurter', live: false }
}

/* ---- cache -------------------------------------------------------------- */

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

async function restUpsert(row: Record<string, unknown>): Promise<void> {
  if (!dbUrl || !dbKey) return
  try {
    await fetch(`${dbUrl}/rest/v1/fx_rates?on_conflict=base,quote,day`, {
      method: 'POST',
      headers: { ...restHeaders, Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(row),
    })
  } catch {
    // A cache write that fails costs one extra upstream call next time. It is
    // never a reason to fail the request the visitor actually made.
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
  const historical = Boolean(dayParam && dayParam < today)
  const day = dayParam && dayParam <= today ? dayParam : null

  const rows = await restGet(
    day
      ? `fx_rates?base=eq.${base}&quote=eq.${quote}&day=eq.${day}&limit=1&select=rate,day,source,live,fetched_at`
      : `fx_rates?base=eq.${base}&quote=eq.${quote}&order=day.desc&limit=1&select=rate,day,source,live,fetched_at`,
  )
  const hit = rows?.[0]

  if (hit) {
    const age = Date.now() - Date.parse(hit.fetched_at)
    const ttl = hit.live ? LIVE_TTL_MS : DAILY_TTL_MS
    // A past day cannot change, so age is irrelevant to it.
    if (historical || age < ttl) {
      return json({
        rate: Number(hit.rate),
        day: hit.day,
        source: hit.source,
        live: hit.live,
        cached: true,
      })
    }
  }

  const answer = (await fromExchangeRate(base, quote, day)) ?? (await fromFrankfurter(base, quote, day))

  if (!answer) {
    // Serve a stale hit rather than nothing: an hour-old mid-market rate is far
    // more use than an error, as long as its date travels with it.
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
  }

  await restUpsert({
    base,
    quote,
    day: answer.day,
    rate: answer.rate,
    source: answer.source,
    live: answer.live,
    fetched_at: new Date().toISOString(),
  })

  return json({ ...answer, cached: false })
})
