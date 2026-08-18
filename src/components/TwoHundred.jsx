import { useEffect, useRef, useState } from 'react'
import { Container } from './Section'
import { figures, sources } from '@/data/figures'
import { usePrefersReducedMotion } from '@/lib/useInView'
import { cn } from '@/lib/utils'

const sent = figures.benchmarkUsd
const ssaFee = (sent * figures.ssaCostPct) / 100
const targetFee = (sent * figures.targetPct) / 100

const stages = [
  {
    amount: sent,
    heading: 'A family sends $200',
    body: 'The World Bank prices every corridor in the world on this exact amount, which is why it turns up everywhere in this research.',
  },
  {
    amount: sent - sent * 0.02,
    heading: 'The fee comes off first',
    body: 'This is the number on the receipt and in the advertisement. It is the part everyone compares, and it is rarely the biggest part.',
  },
  {
    amount: sent - ssaFee,
    heading: 'Then the exchange rate takes its share',
    body: `Quoted at a rate slightly worse than the real one, and the difference is kept. Across Sub-Saharan Africa the two together average ${figures.ssaCostPct}%, the highest of any region.`,
  },
  {
    amount: sent - ssaFee,
    heading: `$${(sent - ssaFee).toFixed(2)} arrives`,
    body: `At the UN's 3% target the same transfer would deliver $${(sent - targetFee).toFixed(2)}. The difference, $${(ssaFee - targetFee).toFixed(2)}, is roughly a day of groceries, on every single transfer.`,
  },
]

/**
 * Scroll-driven countdown of the $200 benchmark.
 *
 * The panel is sticky and the stages scroll past it, so the page scrollbar
 * behaves exactly as normal: no scroll hijacking, no scroll-jacked snapping.
 * Under `prefers-reduced-motion` the whole thing renders as a plain list.
 */
export default function TwoHundred() {
  const trackRef = useRef(null)
  const [active, setActive] = useState(0)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const track = trackRef.current
    if (!track) return

    const panels = Array.from(track.querySelectorAll('[data-stage]'))
    if (!panels.length) return

    const recompute = () => {
      const mid = window.innerHeight / 2
      let next = 0
      panels.forEach((panel, i) => {
        if (panel.getBoundingClientRect().top < mid) next = i
      })
      setActive((prev) => (prev === next ? prev : next))
    }

    recompute()

    /*
     * Two independent triggers on purpose. Scroll events are the responsive
     * one; the observer is the safety net for environments that throttle or
     * never dispatch them. If both are unavailable the stages still read fine:
     * every one of them is on the page, only the running total stops moving.
     */
    window.addEventListener('scroll', recompute, { passive: true })
    window.addEventListener('resize', recompute)

    let observer
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(recompute, {
        threshold: [0, 0.25, 0.5, 0.75, 1],
      })
      panels.forEach((panel) => observer.observe(panel))
    }

    /*
     * Third trigger. Measured, not hypothetical: in at least one embedded
     * browser context this page runs in, the document scrolls while zero
     * scroll events fire and IntersectionObserver stays silent, which froze
     * the number at $200 through all four stages. Four getBoundingClientRect
     * calls every 300ms is nothing, and it is the difference between a
     * countdown and a broken page wherever events are throttled or absent.
     */
    const poll = setInterval(recompute, 300)

    return () => {
      window.removeEventListener('scroll', recompute)
      window.removeEventListener('resize', recompute)
      observer?.disconnect()
      clearInterval(poll)
    }
  }, [reduced])

  if (reduced) {
    return (
      <section className="border-b border-border bg-card py-16">
        <Container width="prose">
          <h2 className="text-2xl">Where a $200 transfer goes</h2>
          <ol className="mt-8 space-y-8">
            {stages.map((s) => (
              <li key={s.heading}>
                <p className="text-3xl font-extrabold tabular-nums text-primary">
                  ${s.amount.toFixed(2)}
                </p>
                <h3 className="mt-2 text-xl">{s.heading}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    )
  }

  return (
    <section className="border-b border-border bg-card">
      <Container>
        <div ref={trackRef} className="grid gap-10 py-16 md:grid-cols-2">
          {/* Sticky number. Stays put while the stages scroll past it. On a
              phone there is no second column and nothing for it to stick
              beside, so it hides and each stage carries its own amount. */}
          <div className="hidden md:sticky md:top-28 md:block md:h-fit md:py-10">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              Where a $200 transfer goes
            </p>
            <p className="mt-4 text-6xl font-extrabold tabular-nums transition-all duration-500 sm:text-7xl">
              ${stages[active].amount.toFixed(2)}
            </p>
            <div className="mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${(stages[active].amount / sent) * 100}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {active === 0
                ? 'before anyone takes anything'
                : `${(((sent - stages[active].amount) / sent) * 100).toFixed(2)}% gone`}
            </p>
          </div>

          {/* Stages. Each one is a normal block in the flow. */}
          <ol>
            {stages.map((s, i) => (
              <li
                key={s.heading}
                data-stage={i}
                className={cn(
                  'flex min-h-[70vh] flex-col justify-center transition-opacity duration-500',
                  i === active ? 'opacity-100' : 'opacity-60',
                )}
              >
                {/* The running total, on the stage itself, small screens only. */}
                <p className="mb-3 text-4xl font-extrabold tabular-nums text-primary md:hidden">
                  ${s.amount.toFixed(2)}
                </p>
                <h3 className="text-2xl">{s.heading}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <p className="pb-12 text-xs leading-relaxed text-muted-foreground">
          Regional average cost from{' '}
          <a href={sources.rpw.href} className="underline underline-offset-2">
            {sources.rpw.title}
          </a>
          . The split between fee and exchange-rate markup is illustrative; the calculator
          below lets you set both.
        </p>
      </Container>
    </section>
  )
}
