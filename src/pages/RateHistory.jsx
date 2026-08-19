import { useCallback, useEffect, useState } from 'react'
import Section from '@/components/Section'
import CurrencyPicker from '@/components/CurrencyPicker'
import { supabase, backendEnabled } from '@/lib/supabase'
import { fetchCurrencies, fetchRate } from '@/lib/fx'
import { cn } from '@/lib/utils'

/*
 * The mid-market rate for one corridor, day by day, from our own fx_rates
 * table.
 *
 * The honest quirk of this chart is that the data is whatever the site has
 * recorded: a day gets a row the first time anyone asks about that base
 * currency, so young corridors have short histories. The page says how many
 * days it has rather than smoothing over the gaps, and the button below the
 * chart records today for corridors nobody has asked about yet.
 */

const COMMON = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'MXN', 'INR', 'PHP', 'NGN', 'KES', 'PKR', 'BDT']

const num = (n, dp = 4) =>
  Number.isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
    : '—'

function Chart({ rows }) {
  const W = 640
  const H = 220
  const PAD = 10

  const rates = rows.map((r) => r.rate)
  const min = Math.min(...rates)
  const max = Math.max(...rates)
  const span = max - min || min * 0.001 || 1

  const x = (i) => (rows.length === 1 ? W / 2 : PAD + (i / (rows.length - 1)) * (W - 2 * PAD))
  const y = (v) => PAD + (1 - (v - min) / span) * (H - 2 * PAD)
  const points = rows.map((r, i) => `${x(i).toFixed(1)},${y(r.rate).toFixed(1)}`).join(' ')

  return (
    <div>
      <div className="flex items-baseline justify-between text-xs tabular-nums text-muted-foreground">
        <span>high {num(max)}</span>
        <span>low {num(min)}</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 h-56 w-full rounded-xl border border-border bg-card"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          points={points}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {rows.length === 1 && (
          <circle cx={W / 2} cy={y(rows[0].rate)} r="5" fill="var(--primary)" />
        )}
      </svg>
      <div className="mt-2 flex items-baseline justify-between text-xs tabular-nums text-muted-foreground">
        <span>{rows[0].day}</span>
        <span>{rows[rows.length - 1].day}</span>
      </div>
    </div>
  )
}

export default function RateHistory() {
  const [pair, setPair] = useState({ from: 'USD', to: 'MXN' })
  const [currencies, setCurrencies] = useState([])
  const [state, setState] = useState({ status: 'loading', rows: [] })
  const [recording, setRecording] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchCurrencies().then(({ currencies: list }) => {
      if (!cancelled && list?.length) setCurrencies(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const load = useCallback(async (from, to) => {
    if (!supabase) return setState({ status: 'nobackend', rows: [] })
    setState({ status: 'loading', rows: [] })
    const { data, error } = await supabase
      .from('fx_rates')
      .select('day, rate, source')
      .eq('base', from)
      .eq('quote', to)
      .order('day', { ascending: true })
      .limit(400)
    if (error) return setState({ status: 'error', rows: [], message: error.message })
    setState({
      status: 'ready',
      rows: (data ?? []).map((r) => ({ ...r, rate: Number(r.rate) })),
    })
  }, [])

  useEffect(() => {
    load(pair.from, pair.to)
  }, [pair, load])

  /* Asking for the rate is what records it: the fx path stores the whole base
     for today on a miss, so this button is just a lookup with a purpose. */
  const recordToday = async () => {
    setRecording(true)
    await fetchRate(pair.from, pair.to)
    await load(pair.from, pair.to)
    setRecording(false)
  }

  const set = (key) => (e) => setPair((p) => ({ ...p, [key]: e.target.value }))
  const options = currencies.length ? currencies : COMMON.map((code) => ({ code, name: code }))
  const rows = state.rows
  const sources = [...new Set(rows.map((r) => r.source))]

  return (
    <>
      <Section className="pt-12">
        <h1 className="text-3xl sm:text-4xl">Rate history</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed">
          The mid-market rate for a corridor, one point per day, from this site&rsquo;s own
          records. A day is recorded the first time anyone asks about it, so the history
          grows as the site is used.
        </p>

        <div className="mt-10 grid max-w-lg gap-3 sm:grid-cols-2">
          <CurrencyPicker
            label="From"
            value={pair.from}
            onChange={(code) => setPair((p) => ({ ...p, from: code }))}
            options={options}
          />
          <CurrencyPicker
            label="To"
            value={pair.to}
            onChange={(code) => setPair((p) => ({ ...p, to: code }))}
            options={options}
          />
        </div>

        <div className="mt-8 max-w-3xl">
          {state.status === 'nobackend' && (
            <p className="rounded-2xl border border-border p-6 text-sm leading-relaxed text-muted-foreground">
              This tool reads the site&rsquo;s rate records and needs the backend, which is
              not configured in this build.
            </p>
          )}
          {state.status === 'error' && (
            <p className="rounded-2xl border border-border p-6 text-sm leading-relaxed text-muted-foreground">
              Could not load the records: {state.message}
            </p>
          )}
          {state.status === 'loading' && (
            <p className="text-sm text-muted-foreground">Loading recorded days…</p>
          )}

          {state.status === 'ready' && rows.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8">
              <p className="font-bold">
                No days recorded yet for {pair.from} to {pair.to}
              </p>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                Nobody has asked this site about this corridor before. Record today and the
                history starts here.
              </p>
            </div>
          )}

          {state.status === 'ready' && rows.length > 0 && (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                <span className="font-bold tabular-nums text-foreground">{rows.length}</span>{' '}
                {rows.length === 1 ? 'day' : 'days'} recorded, {pair.to} per 1 {pair.from}.
                Source: {sources.join(', ')}.
              </p>
              <Chart rows={rows} />

              {/* The last few values as text, for anyone the chart is no use to. */}
              <ul className="mt-4 space-y-1 text-sm tabular-nums text-muted-foreground">
                {rows.slice(-3).map((r) => (
                  <li key={r.day}>
                    {r.day}: {num(r.rate)}
                  </li>
                ))}
              </ul>
            </>
          )}

          {(state.status === 'ready' || state.status === 'error') && (
            <button
              onClick={recordToday}
              disabled={recording}
              className={cn(
                'mt-6 text-sm font-bold text-primary underline-offset-4 hover:underline',
                recording && 'opacity-60',
              )}
            >
              {recording ? 'Recording…' : "Record today's rate"}
            </button>
          )}

          <p className="mt-8 max-w-prose text-xs leading-relaxed text-muted-foreground">
            Mid-market reference rates, dated per day, from the sources named above. A
            reference rate is the market midpoint, not a rate any provider offers
            customers. Days before this site started asking about a corridor are not
            backfilled, which is why histories start on different dates.
          </p>
        </div>
      </Section>
    </>
  )
}
