import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { fetchCurrencies, fetchRate, today, FX_SOURCE } from '@/lib/fx'
import { computeReceipt, validateReceipt, annualise } from '@/lib/receipt'
import { figures } from '@/data/figures'
import { getBenchmarks } from '@/data/corridors'
import { cn } from '@/lib/utils'

/*
 * Check my receipt.
 *
 * Someone enters what they were actually charged and finds out the real total,
 * including the exchange-rate markup the receipt did not itemise. It works on a
 * receipt from any provider anywhere, including a cash agent no comparison site
 * covers, because the numbers come from the person holding the paper.
 *
 * Everything runs in the browser. The only request that leaves is a currency
 * pair and sometimes a date, to fetch a reference rate. No amount, no fee, no
 * identifier, nothing stored.
 */

/* A short list first, because most people will find their pair here without
   opening a 165-entry select. The full list follows underneath. */
const COMMON = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'MXN', 'INR', 'PHP', 'NGN', 'KES', 'PKR', 'BDT']

const num = (n, dp = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
    : '—'

const FIELD =
  'w-full rounded-xl border border-border bg-card px-4 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/** Everything that defines a result, so it can live in the URL. */
const PARAMS = ['sent', 'from', 'to', 'fee', 'rate', 'pickup', 'date', 'manual']

function readUrl() {
  if (typeof window === 'undefined') return {}
  const q = new URLSearchParams(window.location.search)
  const out = {}
  for (const key of PARAMS) if (q.has(key)) out[key] = q.get(key)
  return out
}

export default function ReceiptChecker() {
  const fromUrl = useMemo(readUrl, [])

  const [form, setForm] = useState({
    sent: fromUrl.sent ?? '',
    from: fromUrl.from ?? 'USD',
    to: fromUrl.to ?? 'MXN',
    fee: fromUrl.fee ?? '',
    rate: fromUrl.rate ?? '',
    pickup: fromUrl.pickup ?? '',
    date: fromUrl.date ?? today(),
  })

  const [currencies, setCurrencies] = useState([])
  const [fx, setFx] = useState({ state: 'idle' })
  const [manualRate, setManualRate] = useState(fromUrl.manual ?? '')
  const [annual, setAnnual] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  /* Currency list, once. A failure here is not fatal: the selects fall back to
     the short list and the manual rate path still works. */
  useEffect(() => {
    let cancelled = false
    fetchCurrencies().then(({ currencies: list }) => {
      if (!cancelled && list?.length) setCurrencies(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  /* The reference rate. Never blocks the form: the fields are usable from the
     first paint and this settles underneath them. */
  const loadRate = useCallback(async (from, to, date) => {
    setFx({ state: 'loading' })
    const result = await fetchRate(from, to, date)
    setFx(result.error ? { state: 'error', message: result.error } : { state: 'ready', ...result })
  }, [])

  useEffect(() => {
    loadRate(form.from, form.to, form.date)
  }, [form.from, form.to, form.date, loadRate])

  const usingManual = fx.state === 'error' && manualRate !== ''
  const midRate = usingManual ? Number(manualRate) : fx.state === 'ready' ? fx.rate : null

  const check = validateReceipt({
    sent: form.sent,
    fee: form.fee,
    quotedRate: form.rate,
    midRate,
  })

  const result = check.ok
    ? computeReceipt({
        sent: form.sent,
        fee: form.fee,
        quotedRate: form.rate,
        midRate,
        pickupCharge: form.pickup,
      })
    : null

  /* The result in the address bar, so it can be texted or reopened. Replaces
     rather than pushes, so the back button still leaves the page. */
  useEffect(() => {
    if (!result) return
    const q = new URLSearchParams()
    q.set('sent', form.sent)
    q.set('from', form.from)
    q.set('to', form.to)
    if (form.fee !== '') q.set('fee', form.fee)
    q.set('rate', form.rate)
    if (form.pickup !== '') q.set('pickup', form.pickup)
    if (form.date) q.set('date', form.date)
    if (usingManual) q.set('manual', manualRate)
    window.history.replaceState(null, '', `${window.location.pathname}?${q}`)
  }, [result, form, usingManual, manualRate])

  const options = currencies.length
    ? currencies
    : COMMON.map((code) => ({ code, name: code }))

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
      <Form
        form={form}
        set={set}
        options={options}
        fx={fx}
        manualRate={manualRate}
        setManualRate={setManualRate}
        usingManual={usingManual}
      />

      <Result
        result={result}
        problems={check.problems}
        notes={check.notes}
        form={form}
        midRate={midRate}
        usingManual={usingManual}
        annual={annual}
        setAnnual={setAnnual}
        hasInput={form.sent !== '' || form.rate !== ''}
      />
    </div>
  )
}

/* ------------------------------------------------------------------- form */

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block font-medium">{label}</span>
      {hint && <span className="mt-0.5 block text-sm text-muted-foreground">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  )
}

function Form({ form, set, options, fx, manualRate, setManualRate, usingManual }) {
  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-6 print:border-0 print:p-0">
      <Field label="Amount you sent" hint={`In ${form.from}, before any fee`}>
        <input
          type="text"
          inputMode="decimal"
          value={form.sent}
          onChange={set('sent')}
          placeholder="200"
          className={FIELD}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="From">
          <select value={form.from} onChange={set('from')} className={FIELD}>
            {options.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </Field>
        <Field label="To">
          <select value={form.to} onChange={set('to')} className={FIELD}>
            {options.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Fee charged" hint="The fee on the receipt. Enter 0 if there was none.">
        <input
          type="text"
          inputMode="decimal"
          value={form.fee}
          onChange={set('fee')}
          placeholder="0"
          className={FIELD}
        />
      </Field>

      <Field
        label="Exchange rate you were given"
        hint={`How many ${form.to} for 1 ${form.from}`}
      >
        <input
          type="text"
          inputMode="decimal"
          value={form.rate}
          onChange={set('rate')}
          placeholder="16.20"
          className={FIELD}
        />
      </Field>

      <Field
        label="Charge at pickup"
        hint={`Optional. Anything deducted on collection, in ${form.to}.`}
      >
        <input
          type="text"
          inputMode="decimal"
          value={form.pickup}
          onChange={set('pickup')}
          placeholder="0"
          className={FIELD}
        />
      </Field>

      <Field label="Date of transfer" hint="Optional. Used to look up the rate for that day.">
        <input type="date" value={form.date} onChange={set('date')} className={FIELD} />
      </Field>

      <Separator />

      <MidRate
        fx={fx}
        form={form}
        manualRate={manualRate}
        setManualRate={setManualRate}
        usingManual={usingManual}
      />
    </div>
  )
}

/* The reference rate, and the manual path when there is not one. The block has
   a reserved minimum height so nothing on the page moves when it resolves. */
function MidRate({ fx, form, manualRate, setManualRate, usingManual }) {
  return (
    <div className="min-h-28" aria-live="polite">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Mid-market rate
      </p>

      {fx.state === 'loading' && (
        <p className="mt-2 text-sm text-muted-foreground">Loading the reference rate…</p>
      )}

      {fx.state === 'ready' && (
        <>
          <p className="mt-2 text-2xl font-extrabold tabular-nums text-primary">
            {num(fx.rate, 4)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {form.to} per 1 {form.from}
            {fx.date ? `, published for ${fx.date}` : ''}.
          </p>
          {fx.isStale && (
            <p className="mt-2 text-sm">
              You asked for {fx.requestedDate}. The most recent rate published on or before
              that day is {fx.date}, so that is the one used.
            </p>
          )}
        </>
      )}

      {fx.state === 'error' && (
        <div className="mt-2">
          <p className="text-sm leading-relaxed">{fx.message}</p>
          <label className="mt-3 block">
            <span className="text-sm font-medium">
              Mid-market rate for {form.from} to {form.to}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={manualRate}
              onChange={(e) => setManualRate(e.target.value)}
              placeholder="17.05"
              className={cn(FIELD, 'mt-2')}
            />
            <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
              Search for the pair on any rate site, or check a central bank page for the
              receiving country. The mid-market rate is the one with no margin added, so
              it is the number quoted between banks rather than to customers.
            </span>
          </label>
          {usingManual && (
            <p className="mt-2 text-sm font-medium">
              Everything below uses the rate you entered.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ----------------------------------------------------------------- result */

function Line({ label, value, sub, emphasis }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <span className={cn('leading-snug', emphasis && 'font-bold')}>
        {label}
        {sub && <span className="mt-0.5 block text-sm font-normal text-muted-foreground">{sub}</span>}
      </span>
      <span
        className={cn(
          'shrink-0 tabular-nums',
          emphasis ? 'text-lg font-extrabold text-primary' : 'font-medium',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function Result({
  result,
  problems,
  notes,
  form,
  midRate,
  usingManual,
  annual,
  setAnnual,
  hasInput,
}) {
  const liveRef = useRef(null)

  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8">
        <h3 className="text-xl">Your result appears here</h3>
        <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">
          Fill in the amount, the fee and the exchange rate from your receipt. Nothing is
          sent anywhere and nothing is saved.
        </p>
        {hasInput && problems.length > 0 && (
          <ul className="mt-5 space-y-2">
            {problems.map((p) => (
              <li key={p} className="text-sm leading-relaxed">
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  const year = annualise(result)
  const gain = result.totalCostSend < 0

  return (
    <div className="space-y-6" ref={liveRef}>
      {notes.length > 0 && (
        <div className="rounded-xl border border-border bg-muted p-4">
          {notes.map((n) => (
            <p key={n} className="text-sm leading-relaxed">
              {n}
            </p>
          ))}
        </div>
      )}

      {/* Announced when the numbers change, for anyone not looking at them. */}
      <p className="sr-only" role="status" aria-live="polite">
        Total cost {num(result.totalCostPct)} percent, {num(result.totalCostSend)} {form.from}.
        {' '}
        {num(result.receivedLocal)} {form.to} received, {num(result.shortfallLocal)} {form.to}{' '}
        less than the mid-market rate would have given.
      </p>

      {/* What landed. First, and heaviest: this is the number a family thinks in. */}
      <div className="rounded-2xl bg-primary p-8 text-primary-foreground">
        <p className="text-xs font-bold uppercase tracking-widest text-current/80">
          What landed
        </p>
        <p className="mt-3 text-4xl font-extrabold tabular-nums sm:text-5xl">
          {num(result.receivedLocal)} <span className="text-2xl sm:text-3xl">{form.to}</span>
        </p>
        <p className="mt-4 leading-relaxed text-current/90">
          At the mid-market rate the same {num(Number(form.sent))} {form.from} would have been{' '}
          <span className="font-bold tabular-nums">{num(result.benchmarkLocal)} {form.to}</span>.
          {gain ? ' You came out ahead by ' : ' The difference is '}
          <span className="font-bold tabular-nums">
            {num(Math.abs(result.shortfallLocal))} {form.to}
          </span>
          .
        </p>
      </div>

      {/* What it cost. */}
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            What it cost you
          </p>
          {usingManual && (
            <p className="text-xs text-muted-foreground">using the rate you entered</p>
          )}
        </div>

        <p className="mt-3 text-4xl font-extrabold tabular-nums text-primary sm:text-5xl">
          {num(Math.abs(result.totalCostPct))}%
        </p>
        <p className="mt-1 text-lg">
          {gain ? 'less than nothing, ' : ''}
          <span className="font-bold tabular-nums">
            {num(Math.abs(result.totalCostSend))} {form.from}
          </span>{' '}
          {gain ? 'in your favour' : `of the ${num(Number(form.sent))} ${form.from} you sent`}
        </p>

        <div className="mt-6 divide-y divide-border border-y border-border">
          <Line label="Fee you could see" value={`${num(result.feeSend)} ${form.from}`} />
          <Line
            label="Lost in the exchange rate"
            sub={`${num(Math.abs(result.fxMarginPct))}% ${
              result.fxMarginPct < 0 ? 'better than' : 'below'
            } mid-market, applied to the ${num(result.converted)} ${form.from} actually converted`}
            value={`${num(result.fxLossSend)} ${form.from}`}
            emphasis
          />
          <Line label="Charged at pickup" value={`${num(result.pickupInSend)} ${form.from}`} />
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={annual}
            onChange={(e) => setAnnual(e.target.checked)}
            className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
          />
          <span>
            <span className="font-medium">I send this every month</span>
            {annual && (
              <span className="mt-2 block leading-relaxed">
                Twelve identical transfers would cost{' '}
                <span className="font-bold tabular-nums">
                  {num(Math.abs(year.totalCostSend))} {form.from}
                </span>{' '}
                a year, or{' '}
                <span className="font-bold tabular-nums">
                  {num(Math.abs(year.shortfallLocal))} {form.to}
                </span>{' '}
                less reaching the other end. This assumes twelve transfers identical to
                this one. It is multiplication, not a forecast.
              </span>
            )}
          </span>
        </label>
      </div>

      <Scale totalCostPct={result.totalCostPct} corridor={`${form.from}_${form.to}`} />
    </div>
  )
}

/* -------------------------------------------------------------- reference */

/**
 * The result against what it is supposed to cost.
 *
 * The corridor average and SmaRT benchmark are a third marker that renders only
 * once corridor data exists. Until then the slot is absent rather than showing
 * a placeholder, because a marker with no number behind it would still read as
 * a claim.
 */
function Scale({ totalCostPct, corridor }) {
  const benchmarks = getBenchmarks(corridor)
  const value = Math.max(0, totalCostPct)
  const max = Math.max(12, value * 1.15, figures.globalCostPct * 1.5)
  const at = (pct) => `${Math.min(100, (pct / max) * 100)}%`

  const markers = [
    { pct: figures.targetPct, label: `${figures.targetPct}% UN target for 2030` },
    { pct: figures.globalCostPct, label: `${figures.globalCostPct}% global average` },
    ...(benchmarks
      ? [
          { pct: benchmarks.averageCostPct, label: `${benchmarks.averageCostPct}% corridor average` },
          { pct: benchmarks.smartCostPct, label: `${benchmarks.smartCostPct}% cheapest three (SmaRT)` },
        ]
      : []),
  ]

  return (
    <div className="rounded-2xl border border-border p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Against the benchmarks
      </p>

      <div className="relative mt-8 h-4 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: at(value) }}
        />
        {markers.map((m) => (
          <span
            key={m.label}
            className="absolute top-0 h-4 w-0.5 bg-foreground/40"
            style={{ left: at(m.pct) }}
            aria-hidden
          />
        ))}
      </div>

      <p className="mt-4 text-lg">
        <span className="font-extrabold tabular-nums text-primary">{num(totalCostPct)}%</span>{' '}
        is what this transfer cost.
      </p>

      <ul className="mt-3 space-y-1">
        {markers.map((m) => (
          <li key={m.label} className="text-sm text-muted-foreground">
            {m.label}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Reference rate from{' '}
        <a href={FX_SOURCE.href} className="underline underline-offset-2">
          {FX_SOURCE.name}
        </a>
        . Benchmarks from the World Bank and the UN, listed on the sources page.
      </p>
    </div>
  )
}
