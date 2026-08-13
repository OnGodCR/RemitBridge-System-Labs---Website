import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Section, { PageHeader, Container } from '@/components/Section'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/*
 * Things being built, stated plainly.
 *
 * No dates. A student lab works around school terms, and a date we miss is
 * worse than no date at all. Each entry says what it is, how far along it
 * actually is, and what it is waiting on.
 */
const upcoming = [
  {
    title: 'RemitBench',
    stage: 'In development',
    what: 'A testbed for comparing payment rails against a normal bank transfer, on the same synthetic workloads, so the comparison is like for like rather than one vendor quoting its own best case.',
    waitingOn:
      'The methodology has to be settled and reviewed before any results go up. Numbers published from a benchmark nobody can rerun are worth nothing.',
    to: '/remitbench',
    linkLabel: 'Read the current design',
  },
  {
    title: 'Corridor pages',
    stage: 'Planned',
    what: 'One page per corridor, starting with the routes families in King County actually use, showing what a $200 transfer costs and how that has moved over the last year.',
    waitingOn: 'Enough collected price data per corridor to say anything honest about a trend.',
  },
  {
    title: 'Workshop materials in more languages',
    stage: 'Planned',
    what: 'The handouts already exist in six languages. The next set depends on which languages people actually ask for.',
    waitingOn: 'Requests, and a native speaker to check each translation before it goes out.',
    to: '/workshops',
    linkLabel: 'See the current workshops',
  },
]

export default function ComingSoon() {
  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Coming soon"
        intro="What we are working on next, and roughly where each one has got to. Nothing here is finished, which is why it is on this page and not on the site proper."
      />

      <Section>
        <ul className="border-t border-border">
          {upcoming.map((item) => (
            <li key={item.title} className="border-b border-border py-10">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <h2 className="text-2xl">{item.title}</h2>
                <span className="rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {item.stage}
                </span>
              </div>

              <p className="mt-4 max-w-3xl leading-relaxed">{item.what}</p>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                <span className="font-bold">Waiting on:</span> {item.waitingOn}
              </p>

              {item.to && (
                <Link
                  to={item.to}
                  className="group mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                >
                  {item.linkLabel}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {/* Green, because the section above it is white. */}
      <section className="bg-primary py-20 text-primary-foreground sm:py-24">
        <Container width="prose">
          <h2 className="text-3xl sm:text-4xl">Something you want built?</h2>
          <p className="mt-5 text-lg leading-relaxed text-current/90">
            This list is short on purpose, and most of what is on it came from someone
            asking. If there is a number you keep wanting and cannot find, or a corridor
            nobody covers, tell us. It is the most useful mail we get.
          </p>
          <Link
            to="/contact"
            className={cn(
              buttonVariants({ size: 'hero' }),
              'mt-8 bg-card text-primary hover:bg-card/90',
            )}
          >
            Suggest something
            <ArrowRight className="size-4" />
          </Link>
        </Container>
      </section>
    </>
  )
}
