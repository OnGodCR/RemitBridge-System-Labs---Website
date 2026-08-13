import Section, { PageHeader } from '@/components/Section'
import { seriesTheme } from '@/lib/palette'
import { cn } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const hues = ['series1', 'series2', 'series3', 'series4', 'series5', 'series1']

const pillars = [
  {
    title: 'Research quality',
    measure: 'How many setups we tested, how many test runs finished, and whether someone else could rerun them.',
    evidence: 'Public code repository, methods paper, version history, replication log.',
  },
  {
    title: 'Community reach',
    measure: 'Workshops held, how many people came, how many languages, and where.',
    evidence: 'Head counts and locations. No names, nothing sensitive.',
  },
  {
    title: 'Did people learn anything',
    measure: 'Whether attendees could work out a full transfer cost and spot a scam afterward when they could not before. We are aiming for +20%.',
    evidence: 'Anonymous surveys before and after each session.',
  },
  {
    title: 'Student leadership',
    measure: 'Active fellows, finished deliverables, hours put in, and talks given.',
    evidence: 'Quarterly delivery logs from each team.',
  },
  {
    title: 'Is anyone using the tools',
    measure: 'Calculator sessions, guide downloads, and anyone citing the papers.',
    evidence: 'Aggregate counts only. We do not track individual users.',
  },
  {
    title: 'Does the work hold up',
    measure: 'Adult reviewers who checked it, revisions we had to make, and any awards.',
    evidence: 'Review letters, revision logs, acceptance records.',
  },
]

export default function Impact() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="What we measure"
        intro="Six things we track, and the evidence we keep for each one. If we cannot point at the evidence, we try not to make the claim."
      />

      <Section>
        <p className="mb-8 max-w-3xl leading-relaxed text-muted-foreground">
          It is easy for a student project to say it helped people and never check. So each
          row below pairs a thing we measure with the specific record that backs it up. The
          right-hand column is the part that matters.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-40">What</TableHead>
                <TableHead className="min-w-64">How we measure it</TableHead>
                <TableHead className="min-w-56">What proves it</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pillars.map((p, i) => (
                <TableRow key={p.title}>
                  <TableCell className="align-top">
                    <span
                      className={cn(
                        'inline-block rounded-full border px-3 py-1 text-xs font-bold',
                        seriesTheme[hues[i]].tint,
                        seriesTheme[hues[i]].ink,
                        seriesTheme[hues[i]].border,
                      )}
                    >
                      {p.title}
                    </span>
                  </TableCell>
                  <TableCell className="align-top text-sm leading-relaxed">{p.measure}</TableCell>
                  <TableCell className="align-top text-sm leading-relaxed text-muted-foreground">
                    {p.evidence}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section tone="card" title="The annual brief">
        <p className="max-w-3xl leading-relaxed text-muted-foreground">
          Once a year we put out a Cross-Border Payment Access Brief. It collects the
          RemitBench results, the questions people kept asking at workshops, what the
          calculator turned up, and what we think should change. It also has a section on
          what went wrong and what we could not figure out, which is usually the more useful
          half.
        </p>
      </Section>
    </>
  )
}
