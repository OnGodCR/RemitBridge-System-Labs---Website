import { Container } from './Section'
import { figures, sources } from '@/data/figures'

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
 * The $200 benchmark, as a plain list.
 *
 * This was a scroll-driven countdown: a sticky total that fell as the stages
 * scrolled past. It went. The mechanics needed three triggers to survive
 * environments that starve scroll events, read as broken whenever any of them
 * hiccuped, and the pageful of machinery was carrying four numbers a reader
 * can take in at a glance. What every visitor now gets is what reduced-motion
 * visitors always got, which is also the version that cannot break.
 */
export default function TwoHundred() {
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

        <p className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
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
