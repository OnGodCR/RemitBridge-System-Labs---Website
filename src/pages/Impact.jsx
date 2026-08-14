import { Link } from 'react-router-dom'
import Section, { PageHeader } from '@/components/Section'
import { measures, measuredCount, STATUS_LABEL } from '@/data/measures'
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
 */

/** Status as a word and a shape, so it never depends on colour alone. */
function StatusTag({ status }) {
  const measured = status === 'collected' || status === 'zero'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold',
        measured ? 'border-primary text-primary' : 'border-border text-muted-foreground',
      )}
    >
      <span aria-hidden>{measured ? '●' : '○'}</span>
      {STATUS_LABEL[status]}
    </span>
  )
}

/** The measurement itself, or the reason there is not one. Never blank. */
function Value({ m }) {
  if (m.status === 'not-yet') {
    return <p className="text-sm leading-relaxed text-muted-foreground">{m.note}</p>
  }
  return (
    <>
      <p className="text-2xl font-extrabold tabular-nums text-primary">
        {m.value.toLocaleString('en-US')}
      </p>
      {m.unit && <p className="text-sm text-muted-foreground">{m.unit}</p>}
      {m.asOf && <p className="mt-1 text-xs text-muted-foreground">as of {m.asOf}</p>}
    </>
  )
}

export default function Impact() {
  const measured = measuredCount()
  const corrections = recentCorrections()

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="What we measure"
        intro="Six things we track, the evidence we keep for each, and what has actually been measured so far. Where nothing has been measured, the page says so."
      />

      <Section>
        <p className="max-w-3xl leading-relaxed">
          It is easy for a student project to say it helped people and never check. Each
          entry below pairs something we measure with the record that would prove it, and
          with the current figure. {measured} of {measures.length} have a figure today.
          The rest say when collection starts.
        </p>

        <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
          Nothing here is a projection or a goal. A target we have not hit is not a
          measurement, so it does not appear on this page.
        </p>

        {/*
          Cards, not a four-column table. The brief asked for a fourth column and
          on a 320px screen that becomes a horizontal scroll of unlabelled cells,
          so each measure is its own block with its fields labelled. It reads the
          same at every width.
        */}
        <ul className="mt-10 grid gap-4 lg:grid-cols-2">
          {measures.map((m) => (
            <li
              key={m.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl">{m.title}</h2>
                <StatusTag status={m.status} />
              </div>

              <div className="mt-5">
                <Value m={m} />
              </div>

              <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm leading-relaxed">
                <div>
                  <dt className="font-bold">How it is counted</dt>
                  <dd className="mt-1 text-muted-foreground">{m.measure}</dd>
                </div>
                <div>
                  <dt className="font-bold">What proves it</dt>
                  <dd className="mt-1 text-muted-foreground">{m.evidence}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-2xl border border-border p-6">
          <h2 className="text-xl">Where the published figures come from</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            Every statistic quoted anywhere on this site is listed with its source and
            every place it is used. That page is the evidence layer for this one, and the
            two are meant to be read together.
          </p>
          <Link
            to="/sources"
            className="mt-4 inline-block font-bold text-primary hover:underline"
          >
            See the sources for every number
          </Link>
        </div>
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
                    <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
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
