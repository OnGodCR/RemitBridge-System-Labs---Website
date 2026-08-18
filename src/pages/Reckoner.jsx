import { useState } from 'react'
import { Link } from 'react-router-dom'
import Section from '@/components/Section'
import { figures } from '@/data/figures'
import { cn } from '@/lib/utils'

/*
 * The yearly cost of sending money, from three inputs.
 *
 * TrueCost prices one receipt. This multiplies: the same transfer, made every
 * week or month for a year, and what the total charge comes to at the cost the
 * sender is actually paying versus the two published benchmarks. Everything is
 * arithmetic on the visitor's own numbers, computed in the browser, and the
 * page says which parts are benchmarks and which are multiplication.
 */

const FREQUENCIES = [
  { id: 'weekly', label: 'Every week', perYear: 52 },
  { id: 'fortnightly', label: 'Every two weeks', perYear: 26 },
  { id: 'monthly', label: 'Every month', perYear: 12 },
  { id: 'quarterly', label: 'Every three months', perYear: 4 },
]

const FIELD =
  'w-full rounded-xl border border-border bg-card px-4 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const num = (n, dp = 0) =>
  Number.isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
    : '—'

export default function Reckoner() {
  const [amount, setAmount] = useState('200')
  const [freq, setFreq] = useState('monthly')
  const [costPct, setCostPct] = useState('')

  const perYear = FREQUENCIES.find((f) => f.id === freq)?.perYear ?? 12
  const amt = Number(amount)
  const pct = Number(costPct)

  const validAmount = Number.isFinite(amt) && amt > 0
  const validPct = costPct !== '' && Number.isFinite(pct) && pct >= 0 && pct <= 50
  const yearlySent = validAmount ? amt * perYear : null

  /* One row per rate: theirs, the global average, and the UN target. The
     saving is stated against the target because the target is the number the
     world already agreed to, not a rate this lab invented. */
  const rows =
    yearlySent === null
      ? []
      : [
          validPct && {
            key: 'yours',
            label: 'At the rate you pay',
            pct,
            note: 'from the cost you entered',
            emphasis: true,
          },
          {
            key: 'average',
            label: 'At the global average',
            pct: figures.globalCostPct,
            note: `${figures.globalCostPct}% on a $200 transfer, World Bank, listed on the sources page`,
          },
          {
            key: 'target',
            label: 'At the UN target',
            pct: figures.targetPct,
            note: `${figures.targetPct}% by 2030, the goal governments agreed to`,
          },
        ].filter(Boolean)

  const saving =
    yearlySent !== null && validPct && pct > figures.targetPct
      ? (yearlySent * (pct - figures.targetPct)) / 100
      : null

  return (
    <>
      <Section className="pt-12">
        <h1 className="text-3xl sm:text-4xl">What a year of sending costs</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed">
          Transfer costs hide by being small and frequent. A few percent, dozens of times a
          year, adds up to money nobody agreed to give away. This multiplies it out.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
          <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
            <label className="block">
              <span className="block font-medium">Amount each time</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                In whatever currency you send
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="200"
                className={cn(FIELD, 'mt-2')}
              />
            </label>

            <label className="block">
              <span className="block font-medium">How often</span>
              <select
                value={freq}
                onChange={(e) => setFreq(e.target.value)}
                className={cn(FIELD, 'mt-2')}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block font-medium">Total cost of one transfer, in percent</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                Fee and exchange-rate markup together.{' '}
                <Link to="/truecost" className="font-medium text-primary hover:underline">
                  Work yours out from a receipt
                </Link>
                , or leave it blank to see the benchmarks alone.
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={costPct}
                onChange={(e) => setCostPct(e.target.value)}
                placeholder={String(figures.globalCostPct)}
                className={cn(FIELD, 'mt-2')}
              />
            </label>
          </div>

          <div>
            {yearlySent === null ? (
              <div className="rounded-2xl border border-dashed border-border p-8">
                <h2 className="text-xl">Your year appears here</h2>
                <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">
                  Enter an amount and how often it goes. Nothing is sent anywhere and
                  nothing is saved.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl bg-primary p-8 text-primary-foreground">
                  <p className="text-xs font-bold uppercase tracking-widest text-current/80">
                    Sent over a year
                  </p>
                  <p className="mt-3 text-4xl font-extrabold tabular-nums sm:text-5xl">
                    {num(yearlySent, 2)}
                  </p>
                  <p className="mt-3 leading-relaxed text-current/90">
                    {num(amt, 2)} sent {perYear} times. Multiplication, not a forecast: it
                    assumes every transfer looks like this one.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    What the year costs in charges
                  </p>
                  <ul className="mt-4 divide-y divide-border border-y border-border">
                    {rows.map((r) => (
                      <li key={r.key} className="flex items-baseline justify-between gap-4 py-3">
                        <div>
                          <p className={cn('text-sm', r.emphasis ? 'font-bold' : 'font-medium')}>
                            {r.label}{' '}
                            <span className="tabular-nums text-muted-foreground">({num(r.pct, 2)}%)</span>
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{r.note}</p>
                        </div>
                        <p
                          className={cn(
                            'shrink-0 text-lg font-extrabold tabular-nums',
                            r.emphasis ? 'text-primary' : 'text-foreground',
                          )}
                        >
                          {num((yearlySent * r.pct) / 100, 2)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {saving !== null && (
                    <p className="mt-5 leading-relaxed">
                      If your corridor cost the {figures.targetPct}% the world agreed to,{' '}
                      <span className="font-extrabold tabular-nums text-primary">
                        {num(saving, 2)}
                      </span>{' '}
                      of that would stay with your family this year.
                    </p>
                  )}
                  {!validPct && (
                    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                      The benchmark rows show what a year at the published averages costs.
                      Add your own rate above to see where you stand against them.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}
