import { useCallback, useEffect, useRef, useState } from 'react'
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

/**
 * The rate over time.
 *
 * Hand-drawn SVG rather than a charting library: the whole thing is a path, an
 * axis and a hover, and a dependency for that would be larger than the site's
 * own code.
 *
 * `preserveAspectRatio` is deliberately left at its default here. The previous
 * version stretched the viewBox to fill the container, which scales the stroke
 * with it: the line came out thick and blurred on a wide screen and pinched on
 * a narrow one. Fixed geometry with a responsive container keeps a 2px line 2px
 * everywhere.
 */
function Chart({ rows, base, quote }) {
  const [hover, setHover] = useState(null)
  const svgRef = useRef(null)

  const W = 720
  const H = 260
  const PAD = { top: 16, right: 16, bottom: 30, left: 58 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const rates = rows.map((r) => r.rate)
  const lo = Math.min(...rates)
  const hi = Math.max(...rates)

  /*
   * A flat series has no range to scale against, and dividing by it would put
   * the line at infinity. Padding the band by a little either side draws it
   * through the middle instead, which is the honest picture: nothing moved.
   */
  const flat = hi - lo < Number.EPSILON
  const pad = flat ? Math.max(hi * 0.002, 0.0001) : (hi - lo) * 0.12
  const min = lo - pad
  const max = hi + pad
  const span = max - min

  const x = (i) => (rows.length === 1 ? PAD.left + plotW / 2 : PAD.left + (i / (rows.length - 1)) * plotW)
  const y = (v) => PAD.top + (1 - (v - min) / span) * plotH

  const line = rows.map((r, i) => `${x(i).toFixed(1)},${y(r.rate).toFixed(1)}`).join(' ')
  // Closed back along the baseline, so the area under the line can be tinted.
  const area = `${PAD.left + (rows.length === 1 ? plotW / 2 : 0)},${H - PAD.bottom} ${line} ${x(rows.length - 1)},${H - PAD.bottom}`

  // Four gridlines, labelled with the rate they sit at.
  const ticks = [0, 1, 2, 3].map((i) => min + (span * i) / 3)

  /** Nearest point to the pointer, in viewBox coordinates. */
  const onMove = (e) => {
    const svg = svgRef.current
    if (!svg) return
    const box = svg.getBoundingClientRect()
    const vx = ((e.clientX - box.left) / box.width) * W
    let nearest = 0
    rows.forEach((_, i) => {
      if (Math.abs(x(i) - vx) < Math.abs(x(nearest) - vx)) nearest = i
    })
    setHover(nearest)
  }

  const active = hover === null ? rows.length - 1 : hover
  const point = rows[active]

  return (
    <figure className="m-0">
      <div className="relative rounded-2xl border border-border bg-card p-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none"
          role="img"
          aria-label={`${quote} per 1 ${base}, ${rows.length} recorded days from ${rows[0].day} to ${rows[rows.length - 1].day}. Low ${num(lo)}, high ${num(hi)}.`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {ticks.map((t, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--border)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 8}
                y={y(t) + 4}
                textAnchor="end"
                className="fill-[var(--muted-foreground)] text-[11px] tabular-nums"
              >
                {num(t, 4)}
              </text>
            </g>
          ))}

          <polygon points={area} fill="var(--primary)" opacity="0.08" />
          <polyline
            points={line}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Every recorded day gets a dot once the series is short enough for
              them not to merge into a bead chain. */}
          {rows.length <= 60 &&
            rows.map((r, i) => (
              <circle key={r.day} cx={x(i)} cy={y(r.rate)} r="2.5" fill="var(--primary)" />
            ))}

          {point && (
            <g>
              <line
                x1={x(active)}
                x2={x(active)}
                y1={PAD.top}
                y2={H - PAD.bottom}
                stroke="var(--primary)"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.5"
              />
              <circle
                cx={x(active)}
                cy={y(point.rate)}
                r="5"
                fill="var(--primary)"
                stroke="var(--card)"
                strokeWidth="2"
              />
            </g>
          )}

          <text
            x={PAD.left}
            y={H - 8}
            className="fill-[var(--muted-foreground)] text-[11px] tabular-nums"
          >
            {rows[0].day}
          </text>
          {rows.length > 1 && (
            <text
              x={W - PAD.right}
              y={H - 8}
              textAnchor="end"
              className="fill-[var(--muted-foreground)] text-[11px] tabular-nums"
            >
              {rows[rows.length - 1].day}
            </text>
          )}
        </svg>

        {/* The read-out sits outside the SVG so it inherits the page's type
            rather than needing font sizes in user units. */}
        {point && (
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 border-t border-border pt-3">
            <span className="text-lg font-extrabold tabular-nums text-primary">
              {num(point.rate)}
            </span>
            <span className="text-sm text-muted-foreground">
              {quote} per 1 {base}
            </span>
            <time className="ml-auto text-sm tabular-nums text-muted-foreground">
              {point.day}
              {hover === null && rows.length > 1 && ' · latest'}
            </time>
          </div>
        )}
      </div>

      <figcaption className="mt-2 text-xs text-muted-foreground">
        {flat
          ? 'The rate has not moved across the days recorded, so the line is flat.'
          : `Range across the recorded days: ${num(lo)} to ${num(hi)}.`}{' '}
        {rows.length > 1 && 'Hover or drag across the chart to read a single day.'}
      </figcaption>
    </figure>
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
              <Chart rows={rows} base={pair.from} quote={pair.to} />

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
