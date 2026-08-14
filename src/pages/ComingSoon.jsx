import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Section, { Container } from '@/components/Section'
import Backdrop from '@/components/Backdrop'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/*
 * Things being built, stated plainly.
 *
 * No dates. A student lab works around school terms, and a date we miss is
 * worse than no date at all. Each entry says what it is, how far along it
 * actually is, and what it is waiting on.
 *
 * One entry, because one thing is actually being worked on. Corridor pages and
 * extra workshop languages were listed here and were removed: neither was
 * planned, and a roadmap of things nobody has started is the same overclaim as
 * an unsourced number.
 *
 * No standing page header either. One item under a full-height title read as a
 * mostly empty page, so it opens on the thing itself, the way the blog and the
 * contact page do.
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
]

export default function ComingSoon() {
  return (
    <>
      <Section className="pt-12">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl">Coming soon</h1>
          <p className="text-sm text-muted-foreground">
            {upcoming.length === 1
              ? 'One thing being worked on'
              : `${upcoming.length} things being worked on`}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          {upcoming.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                {/* A dot rather than a spinner. Nothing is happening on this
                    page, and a spinner would imply something is. */}
                <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                {item.stage}
              </span>

              <h2 className="mt-5 text-2xl sm:text-3xl">{item.title}</h2>
              <p className="mt-4 text-lg leading-relaxed">{item.what}</p>

              <div className="mt-6 rounded-xl bg-muted p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Waiting on
                </p>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {item.waitingOn}
                </p>
              </div>

              {item.to && (
                <Link
                  to={item.to}
                  className="group mt-6 inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
                >
                  {item.linkLabel}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          ))}

          {/* Sits beside the card rather than under it, so the page has two
              columns of content instead of one narrow strip. */}
          <aside className="rounded-2xl border border-border p-8">
            <h2 className="text-xl">Why the list is short</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Because it only holds work that has actually started. A page of things
              nobody has begun is a wish list, and it would tell you nothing about what
              the lab is really doing.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Finished work moves off this page and onto the{' '}
              <Link to="/blog" className="font-bold text-primary hover:underline">
                blog
              </Link>{' '}
              or{' '}
              <Link to="/papers" className="font-bold text-primary hover:underline">
                research papers
              </Link>
              .
            </p>
          </aside>
        </div>
      </Section>

      {/* Green, because the section above it is white. */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-24">
        <Backdrop onDark fadeClass={null} />
        <Container width="prose" className="relative">
          <h2 className="text-3xl sm:text-4xl">Something you want built?</h2>
          <p className="mt-5 text-lg leading-relaxed text-current/90">
            If there is a number you keep wanting and cannot find, or a corridor nobody
            covers, tell us. Requests are how most of what we build gets chosen, and it
            is the most useful mail we get.
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
