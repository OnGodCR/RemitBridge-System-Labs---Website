import { Link } from 'react-router-dom'
import Section, { Container, PageHeader } from '@/components/Section'
import Backdrop from '@/components/Backdrop'
import { measures, measuredCount, measured as measuredOnes, waitingByUnlock } from '@/data/measures'
import { recentCorrections, correctionCount, PROMPT_LABEL } from '@/data/corrections'
import { cn } from '@/lib/utils'

/*
 * What we measure.
 *
 * The page previously listed six measurement methods and no measurements,
 * which read as six results to anyone skimming. Each row now carries what has
 * actually been collected, or says plainly that nothing has been and when it
 * will be.
 *
 * Three rules hold everywhere below:
 *   a value of zero renders as zero, never a dash and never hidden
 *   a value and its collection date render together or neither renders
 *   nothing renders a projection or a target dressed as an achievement
 *
 * The six were six identical cards reading "not measured yet", which is a true
 * page nobody finishes. They are now split by whether there is a figure today,
 * and the rest grouped by the one event that starts them. That is the same
 * information: it was already sitting in each note, one sentence at a time,
 * where you could not see that two of them are waiting on the same workshop.
 */

/** How much of the programme has a figure, at a glance. One segment each. */
function Meter({ filled, total }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-2 flex-1 rounded-full',
            i < filled ? 'bg-primary' : 'bg-border',
          )}
        />
      ))}
    </div>
  )
}

/** The two fields that make a measure checkable, at any width. */
function Method({ m, muted = false }) {
  return (
    <dl className={cn('space-y-2.5 text-sm leading-relaxed', muted && 'text-muted-foreground')}>
      <div>
        <dt className="font-bold text-foreground">How it is counted</dt>
        <dd className="mt-0.5 text-muted-foreground">{m.measure}</dd>
      </div>
      <div>
        <dt className="font-bold text-foreground">What proves it</dt>
        <dd className="mt-0.5 text-muted-foreground">{m.evidence}</dd>
      </div>
    </dl>
  )
}

export default function Impact() {
  const total = measures.length
  const done = measuredCount()
  const withFigures = measuredOnes()
  const waiting = waitingByUnlock()
  const corrections = recentCorrections()

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="What we measure"
        intro="Six things we track, the record that would prove each one, and what has actually been measured so far."
      />

      {/* The state of it, before any explanation. A reader who leaves after the
          first screen should still have the honest answer. */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[22rem_1fr] lg:items-start">
          <div>
            <p className="text-5xl font-extrabold tabular-nums text-primary sm:text-6xl">
              {done}
              <span className="text-muted-foreground">/{total}</span>
            </p>
            <p className="mt-3 font-bold">have a figure today</p>
            <div className="mt-4">
              <Meter filled={done} total={total} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The programmes have not run yet. That is the whole reason the other{' '}
              {total - done} are empty, and it is worth more than a filled-in number
              would be.
            </p>
          </div>

          <div className="max-w-2xl space-y-4 leading-relaxed">
            <p>
              It is easy for a student project to say it helped people and never check. So
              each of the six below is paired with the record that would prove it, and with
              whatever the current figure is.
            </p>
            <p className="text-muted-foreground">
              Nothing here is a projection or a goal. A target we have not hit is not a
              measurement, so it does not appear on this page. A figure without the date it
              was collected does not appear either.
            </p>
            <p>
              <Link to="/sources" className="font-bold text-primary hover:underline">
                Every statistic on this site, with its source
              </Link>{' '}
              is the evidence layer for this page. The two are meant to be read together.
            </p>
          </div>
        </div>
      </Section>

      {/* Green. What has actually been measured, given the room a result gets. */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-24">
        <Backdrop onDark fadeClass={null} />
        <Container className="relative">
          <h2 className="text-2xl sm:text-3xl">Measured today</h2>

          {/*
            The closing note is the last cell of the same grid, not a block
            under it. With one figure measured it sits alongside and fills the
            empty half; as more land it falls into place after them.
          */}
          <ul className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2">
            {withFigures.map((m) => (
              <li key={m.id}>
                <p className="text-5xl font-extrabold tabular-nums sm:text-6xl">
                  {m.value.toLocaleString('en-US')}
                </p>
                {m.unit && <p className="mt-2 font-bold">{m.unit}</p>}
                <p className="mt-1 text-sm leading-relaxed text-current/90">{m.title}</p>
                {m.asOf && (
                  <p className="mt-1 text-xs text-current/80">as of {m.asOf}</p>
                )}
                <p className="mt-4 border-t border-white/25 pt-4 text-sm leading-relaxed text-current/90">
                  {m.evidence}
                </p>
              </li>
            ))}

            <li className="self-center">
              <p className="leading-relaxed text-current/90">
                Zero corrections is a measurement, not a blank. It will stop being zero,
                and when it does the number goes up on this page rather than quietly
                staying put.
              </p>
              <Link
                to="/contact"
                className="mt-4 inline-block font-bold underline underline-offset-4"
              >
                Tell us if something here is wrong
              </Link>
            </li>
          </ul>
        </Container>
      </section>

      {/* White. The rest, as a sequence rather than five identical blanks. */}
      <Section title="What starts the rest">
        <p className="max-w-3xl leading-relaxed text-muted-foreground">
          Each of the remaining {total - done} is waiting on one specific thing. Grouped by
          what that is, because two of them are waiting on the same workshop and five
          separate cards saying &ldquo;not yet&rdquo; would hide it.
        </p>

        <ol className="mt-10 space-y-10">
          {waiting.map((group, i) => (
            <li key={group.unlock}>
              <div className="flex items-baseline gap-4">
                <span
                  className="w-6 shrink-0 text-lg font-extrabold tabular-nums text-muted-foreground"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-xl">{group.unlock}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    unlocks {group.items.length}{' '}
                    {group.items.length === 1 ? 'measure' : 'measures'}
                  </p>
                </div>
              </div>

              <ul className="mt-5 grid gap-4 sm:ml-12 lg:grid-cols-2">
                {group.items.map((m) => (
                  <li key={m.id} className="rounded-2xl border border-border bg-card p-6">
                    <h4 className="text-lg">{m.title}</h4>
                    {/* A div, not a p: Method renders a dl, which a p cannot
                        legally contain and the parser closes early around. */}
                    <div className="mt-3 border-t border-border pt-4">
                      <Method m={m} />
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      {/* Corrections. The second half of the page, at the same weight as the first. */}
      <Section
        tone="card"
        title="Corrections"
        description="Every change made to a claim after it was published, with what it said before."
      >
        <p className="max-w-3xl leading-relaxed">
          A lab that publishes and never corrects is not being careful, it is not checking.
          So corrections are counted on this page rather than quietly absorbed, and the
          count is treated as a credibility figure.
        </p>

        {corrections.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-8">
            <p className="text-lg font-bold">Nothing has been corrected yet</p>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
              When a number, a claim or a source on this site turns out to be wrong, the
              change is recorded here: what it said before, what it says now, the date, who
              found it, and what prompted it. Nothing is edited away quietly.
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              If something here looks wrong, telling us is the most useful mail we get.
              Point at the page and say what is off.
            </p>
            <Link
              to="/contact"
              className="mt-5 inline-block font-bold text-primary hover:underline"
            >
              Report something wrong on this site
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm text-muted-foreground">
              {correctionCount()} {correctionCount() === 1 ? 'correction' : 'corrections'} so
              far, newest first.
            </p>
            <ol className="mt-6 border-t border-border">
              {corrections.map((c) => (
                <li key={`${c.date}-${c.page}`} className="border-b border-border py-6">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <time className="text-sm font-bold tabular-nums">{c.date}</time>
                    <span className="text-sm text-muted-foreground">{c.page}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {PROMPT_LABEL[c.prompt] ?? c.prompt}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        It said
                      </dt>
                      <dd className="mt-1 leading-relaxed line-through decoration-muted-foreground/50">
                        {c.claimed}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        It now says
                      </dt>
                      <dd className="mt-1 leading-relaxed">{c.correctedTo}</dd>
                    </div>
                  </dl>

                  <p className="mt-3 text-sm text-muted-foreground">
                    Found by {c.reportedBy}.
                  </p>
                </li>
              ))}
            </ol>
          </>
        )}
      </Section>

      <Section title="The annual brief">
        <div className="max-w-3xl space-y-4 leading-relaxed">
          <p>
            Once a year the lab intends to publish a Cross-Border Payment Access Brief. It
            will collect the RemitBench results, the questions that came up repeatedly at
            workshops, what the calculator turned up, and what we think should change.
          </p>
          <p>
            It will also carry a section on what went wrong and what we could not work out,
            which is usually the more useful half and is the part most likely to be left out
            of a document like this.
          </p>
          <p className="font-bold">
            It has not been published. There has been no first edition, and there is no date
            for one until there are results worth collecting.
          </p>
          <p className="text-muted-foreground">
            When it exists, this section becomes a link to it.
          </p>
        </div>
      </Section>
    </>
  )
}
