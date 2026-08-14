import { Link } from 'react-router-dom'
import { Container } from './Section'
import Backdrop from './Backdrop'
import { figures, derived } from '@/data/figures'
import { useCountUp, useInView, usePrefersReducedMotion } from '@/lib/useInView'
import { cn } from '@/lib/utils'

/*
 * One colour, alternating surfaces. The hero above paints nothing, so this
 * opens green, then the backdrop shows through, then green again. The rhythm
 * does the separating that colour was doing before.
 *
 * Earlier versions used amber and rose alongside the green to mark "bad" and
 * "worst". It read as a palette borrowed from somewhere else.
 */

function Stat({ value, decimals = 0, prefix = '', suffix = '', label, note, onGreen }) {
  const [ref, shown] = useCountUp(value, { decimals })
  return (
    <div ref={ref}>
      <p
        className={cn(
          'text-4xl font-extrabold tabular-nums sm:text-5xl',
          onGreen ? 'text-primary-foreground' : 'text-primary',
        )}
      >
        {prefix}
        {decimals ? shown.toFixed(decimals) : Math.round(shown).toLocaleString()}
        {suffix}
      </p>
      <p className="mt-3 font-bold">{label}</p>
      {/* /90 rather than a muted token: measured 5.2:1 on green, where the
          normal muted grey lands nearer 1.1:1. */}
      <p
        className={cn(
          'mt-1 text-sm leading-relaxed',
          onGreen ? 'text-current/90' : 'text-muted-foreground',
        )}
      >
        {note}
      </p>
    </div>
  )
}

/**
 * The cost comparison, between the two green bands.
 *
 * Bars are green at three weights. Length already encodes the value, and the
 * labels say which is which, so the weight reinforces an order the reader can
 * already see rather than being the only signal.
 *
 * Paints no surface of its own, so the site-wide backdrop shows through. The
 * rules top and bottom separate it from the green now that a block of white is
 * not doing that job.
 */
function CostBars() {
  const [ref, inView] = useInView()
  const reduced = usePrefersReducedMotion()
  const grown = inView || reduced

  const max = figures.ssaCostPct
  const rows = [
    {
      label: 'Sub-Saharan Africa',
      note: 'the most expensive region in the world to receive money',
      value: figures.ssaCostPct,
      weight: 'bg-primary',
    },
    {
      label: 'Global average',
      note: 'more than double what was agreed',
      value: figures.globalCostPct,
      weight: 'bg-primary/70',
    },
    {
      label: 'UN target for 2030',
      note: 'where the cost is supposed to be',
      value: figures.targetPct,
      weight: 'bg-primary/40',
    },
  ]

  return (
    <section ref={ref} className="border-y border-border py-20 sm:py-24">
      <Container>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-2xl sm:text-3xl">What a $200 transfer costs</h3>
          <p className="text-sm text-muted-foreground">as a share of the amount sent</p>
        </div>

        <div className="mt-10 space-y-6">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-bold">{row.label}</span>
                <span className="text-sm font-extrabold tabular-nums text-primary">
                  {row.value}%
                </span>
              </div>
              <div className="mt-2 h-4 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-1000 ease-out',
                    row.weight,
                  )}
                  style={{ width: grown ? `${(row.value / max) * 100}%` : '0%' }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{row.note}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-3xl border-t border-border pt-8 text-lg leading-relaxed">
          Every point above that 3% line is money meant for rent, school fees or a doctor.
          Across{' '}
          <span className="font-extrabold tabular-nums">${figures.flowsUsdBn} billion</span> a
          year, the gap between what the world charges and what it agreed to charge comes
          to roughly{' '}
          <span className="font-extrabold tabular-nums text-primary">
            ${derived.annualOverpayUsdBn} billion
          </span>
          .
        </p>
      </Container>
    </section>
  )
}

/**
 * Speed, as a plain comparison.
 *
 * This was two filling progress bars. Both ended at 100%, and a full bar reads
 * as "done", so the picture said the two were equivalent, the opposite of the
 * point. The gap is also about five orders of magnitude, which no honest bar
 * can show side by side. Type carries it better.
 */
function Speed() {
  return (
    <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-24">
      <Backdrop onDark fadeClass={null} />
      <Container className="relative">
        <h3 className="text-2xl sm:text-3xl">And then there is the waiting</h3>
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {[
            {
              figure: 'Seconds',
              label: 'What the rails can already do',
              note: 'Off-chain payment channels settle in under a tenth of a second in our own testbed.',
            },
            {
              figure: '1 to 5 days',
              label: 'What a bank transfer takes',
              note: 'A rent deadline does not wait for a transfer to settle. Neither does a medical bill.',
            },
          ].map((row) => (
            <div key={row.figure}>
              <p className="text-4xl font-extrabold sm:text-5xl">{row.figure}</p>
              <p className="mt-3 font-bold">{row.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-current/90">{row.note}</p>
            </div>
          ))}
        </div>

        <p className="mt-14 border-t border-white/25 pt-8 text-sm text-current/90">
          Figures from the World Bank and the UN.{' '}
          <Link to="/sources" className="font-bold underline underline-offset-4">
            See exactly which, and where each one is used
          </Link>
          .
        </p>
      </Container>
    </section>
  )
}

export default function WhyItMatters() {
  return (
    <>
      {/* Green (the hero above is white) */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-28">
        {/* The site backdrop is fixed behind the document, so a band that
            paints a surface covers it. These two carry their own copy, drawn
            in the foreground colour so it survives the green. */}
        <Backdrop onDark fadeClass={null} />
        <Container className="relative">
          <h2 className="max-w-3xl text-3xl sm:text-4xl">
            Migrants send $905 billion home a year. The world takes a cut of every dollar.
          </h2>

          <dl className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              value={figures.flowsUsdBn}
              prefix="$"
              suffix="B"
              onGreen
              label="Sent home each year"
              note="Money migrant workers send to family in other countries."
            />
            <Stat
              value={figures.globalCostPct}
              decimals={2}
              suffix="%"
              onGreen
              label="Average cost to send"
              note="The global average on a $200 transfer."
            />
            <Stat
              value={figures.targetPct}
              suffix="%"
              onGreen
              label="What it should be"
              note="The UN target the world agreed to hit by 2030."
            />
            <Stat
              value={derived.annualOverpayUsdBn}
              prefix="$"
              suffix="B"
              onGreen
              label="The gap, every year"
              note="Our estimate of what closing it would return to families."
            />
          </dl>
        </Container>
      </section>

      {/* White */}
      <CostBars />

      {/* Green */}
      <Speed />
    </>
  )
}
