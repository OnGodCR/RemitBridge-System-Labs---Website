import Section, { PageHeader } from '@/components/Section'
import { papers, statuses } from '@/data/researchPapers'
import { cn } from '@/lib/utils'

export default function Papers() {
  const published = papers.filter((p) => p.status === 'published')

  return (
    <>
      <PageHeader
        eyebrow="Reading"
        title="Research papers"
        intro="Long-form work by lab members, with methods and references. Shorter explainers live on the blog."
      />

      <Section>
        {published.length === 0 && (
          <div className="mb-10 rounded-2xl border border-border bg-muted p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              Nothing published yet
            </p>
            {/* Reads "All 1 are still in progress" otherwise, and the list is
                one paper long now. */}
            <h2 className="mt-3 text-2xl">
              {papers.length === 1
                ? 'The one paper is still in progress'
                : `All ${papers.length} are still in progress`}
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
              A paper goes up here once it has been through the team and then the adult
              advisory group, and once the data and code behind it can be published
              alongside it. Until then this page lists what is being worked on and how far
              along it is.
            </p>
          </div>
        )}

        <ul className="space-y-4">
          {papers.map((paper) => {
            const status = statuses[paper.status]
            return (
              <li
                key={paper.id}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-bold',
                      paper.status === 'published'
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border bg-muted text-muted-foreground',
                    )}
                  >
                    {status.label}
                  </span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {paper.year}
                  </span>
                </div>

                <h3 className="mt-4 text-xl leading-snug">{paper.title}</h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  {paper.authors.join(', ')}
                </p>

                {/* The research question, set apart and in full. It is the
                    thing the paper is accountable to, so it should not be
                    paraphrased into the abstract. */}
                {paper.question && (
                  <div className="mt-5 max-w-3xl border-l-4 border-primary pl-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">
                      Research question
                    </p>
                    <p className="mt-2 leading-relaxed">{paper.question}</p>
                  </div>
                )}

                <p className="mt-5 max-w-3xl leading-relaxed text-muted-foreground">
                  {paper.abstract}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {paper.topics.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {paper.pdf ? (
                  <a
                    href={paper.pdf}
                    className="mt-5 inline-block text-sm font-bold text-primary underline-offset-4 hover:underline"
                  >
                    Read the paper
                  </a>
                ) : (
                  <p className="mt-5 text-sm text-muted-foreground">{status.note}</p>
                )}
              </li>
            )
          })}
        </ul>
      </Section>
    </>
  )
}
