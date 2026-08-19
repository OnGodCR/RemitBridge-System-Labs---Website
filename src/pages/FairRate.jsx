import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Section from '@/components/Section'
import CurrencyPicker from '@/components/CurrencyPicker'
import { fetchCurrencies, fetchRate, sourceOf } from '@/lib/fx'
import { figures } from '@/data/figures'
import { cn } from '@/lib/utils'

/*
 * What a fair exchange rate looks like, before sending.
 *
 * TrueCost works backwards from a receipt. This works forwards from a quote:
 * here is the mid-market rate right now, here is what your amount would be at
 * it, and here is what each point of markup takes. The slider is the teaching
 * device, because watching the received amount fall as the markup climbs is
 * the whole lesson in one control.
 */

const COMMON = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'MXN', 'INR', 'PHP', 'NGN', 'KES', 'PKR', 'BDT']

const FIELD =
  'w-full rounded-xl border border-border bg-card px-4 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const num = (n, dp = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
    : '—'

export default function FairRate() {
  const [form, setForm] = useState({ amount: '200', from: 'USD', to: 'MXN' })
  const [markup, setMarkup] = useState(3)
  const [currencies, setCurrencies] = useState([])
  const [fx, setFx] = useState({ state: 'loading' })

  useEffect(() => {
    let cancelled = false
    fetchCurrencies().then(({ currencies: list }) => {
      if (!cancelled && list?.length) setCurrencies(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setFx({ state: 'loading' })
    fetchRate(form.from, form.to).then((r) => {
      if (cancelled) return
      setFx(r.error ? { state: 'error', message: r.error } : { state: 'ready', ...r })
    })
    return () => {
      cancelled = true
    }
  }, [form.from, form.to])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const options = currencies.length ? currencies : COMMON.map((code) => ({ code, name: code }))

  const amt = Number(form.amount)
  const ready = fx.state === 'ready' && Number.isFinite(amt) && amt > 0
  const atMid = ready ? amt * fx.rate : null
  const marked = ready ? fx.rate * (1 - markup / 100) : null
  const atMarked = ready ? amt * marked : null
  const lost = ready ? atMid - atMarked : null

  return (
    <>
      <Section className="pt-12">
        <h1 className="text-3xl sm:text-4xl">What would a fair rate give you?</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed">
          The mid-market rate is the midpoint of what banks pay each other, published
          daily. Nobody sends money at exactly it, but it is the honest yardstick: the
          further a quote sits below it, the more of your transfer the rate is quietly
          taking.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
          <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
            <label className="block">
              <span className="block font-medium">Amount to send</span>
              <input
                type="text"
                inputMode="decimal"
                value={form.amount}
                onChange={set('amount')}
                placeholder="200"
                className={cn(FIELD, 'mt-2')}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <CurrencyPicker
                label="From"
                value={form.from}
                onChange={(code) => setForm((f) => ({ ...f, from: code }))}
                options={options}
              />
              <CurrencyPicker
                label="To"
                value={form.to}
                onChange={(code) => setForm((f) => ({ ...f, to: code }))}
                options={options}
              />
            </div>

            <label className="block">
              <span className="flex items-baseline justify-between font-medium">
                Exchange-rate markup
                <span className="tabular-nums text-primary">{num(markup, 1)}%</span>
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                Drag to see what each point below mid-market costs. Fees are separate and
                come on top.
              </span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={markup}
                onChange={(e) => setMarkup(Number(e.target.value))}
                className="mt-3 w-full accent-[var(--primary)]"
              />
            </label>
          </div>

          <div>
            {fx.state === 'loading' && (
              <p className="text-sm text-muted-foreground">Fetching the mid-market rate…</p>
            )}
            {fx.state === 'error' && (
              <p className="rounded-2xl border border-border p-6 text-sm leading-relaxed">
                {fx.message}
              </p>
            )}
            {ready && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Mid-market right now
                  </p>
                  <p className="mt-3 text-3xl font-extrabold tabular-nums text-primary sm:text-4xl">
                    {num(fx.rate, 4)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {form.to} per 1 {form.from}, published for {fx.date}
                    {fx.source ? `, ${sourceOf(fx.source).name}` : ''}.
                  </p>
                  <p className="mt-4 border-t border-border pt-4 leading-relaxed">
                    At this rate your {num(amt)} {form.from} would be{' '}
                    <span className="font-bold tabular-nums">
                      {num(atMid)} {form.to}
                    </span>
                    .
                  </p>
                </div>

                <div className="rounded-2xl bg-primary p-8 text-primary-foreground">
                  <p className="text-xs font-bold uppercase tracking-widest text-current/80">
                    With a {num(markup, 1)}% markup on the rate
                  </p>
                  <p className="mt-3 text-4xl font-extrabold tabular-nums sm:text-5xl">
                    {num(atMarked)} <span className="text-2xl">{form.to}</span>
                  </p>
                  <p className="mt-4 leading-relaxed text-current/90">
                    The quoted rate becomes {num(marked, 4)}, and{' '}
                    <span className="font-bold tabular-nums">
                      {num(lost)} {form.to}
                    </span>{' '}
                    never arrives. Nothing on the receipt calls it a charge, which is why
                    comparing the quoted rate to mid-market is the first thing worth doing.
                  </p>
                </div>

                <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                  For scale: the World Bank puts the global average total cost of sending
                  $200 at {figures.globalCostPct}%, fees included, against a UN target of{' '}
                  {figures.targetPct}%. Both are listed with sources on the{' '}
                  <Link to="/sources" className="font-medium text-primary hover:underline">
                    sources page
                  </Link>
                  . Got a receipt already?{' '}
                  <Link to="/truecost" className="font-medium text-primary hover:underline">
                    Check what it actually cost
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}
