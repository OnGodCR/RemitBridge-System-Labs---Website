import Section, { PageHeader, SectionImage } from '@/components/Section'
import { Card, CardContent } from '@/components/ui/card'
import { seriesTheme } from '@/lib/palette'
import { cn } from '@/lib/utils'
import libraryImage from '@/assets/fellowships-library.jpg'

const teams = [
  {
    title: 'Systems',
    desc: 'Builds and maintains RemitBench. Designing the tests, running the simulations, keeping the code clean enough that someone else can rerun it.',
  },
  {
    title: 'Economics',
    desc: 'Collects corridor fees and exchange-rate markups by hand, tracks pickup charges, and reads up on how the remittance market is actually structured.',
  },
  {
    title: 'Community education',
    desc: 'Runs the workshops, writes the family guides, and handles talking with partner organisations.',
  },
  {
    title: 'Language and evaluation',
    desc: 'Coordinates translators and reviewers, and builds the before-and-after surveys we use to check whether a workshop taught anyone anything.',
  },
]

const phaseHues = ['series1', 'series2', 'series3']

const phases = [
  {
    stage: 'Year 1',
    badge: 'Now',
    title: 'Build it and check that it works',
    items: [
      'Get RemitBench 1.0 finished and running.',
      'Put the TrueCost calculator online.',
      'Hold listening sessions around King County and run the first workshops.',
      'Bring on the first 12 to 20 student fellows.',
      'Publish the first annual brief.',
    ],
  },
  {
    stage: 'Year 2',
    badge: 'Next',
    title: 'Go deeper and see if it repeats',
    items: [
      'Add more scaling setups and more corridors to the testbed.',
      'Get the guides into eight or more languages.',
      'Set up a proper adult advisory council.',
      'Try the workshop kit at two other high schools and see if it works without us.',
    ],
  },
  {
    stage: 'Year 3',
    badge: 'Later',
    title: 'Grow, if the evidence holds up',
    items: [
      'Start a chapter network at other schools, with real deliverables attached.',
      'Publish an evaluation covering all the sites, not just ours.',
      'Present at CS and international finance conferences.',
      'Build a student network working on payment access nationally.',
    ],
  },
]

export default function Fellowships() {
  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Student fellows"
        intro="Fellows join one of four teams and own something real. The point is to finish work that other people can check, rather than to collect a title."
      />

      <Section>
        <SectionImage src={libraryImage} alt="Library shelves and reading desks" />
        <p className="max-w-3xl leading-relaxed">
          Every fellow ends up on one team, though people help each other out across teams
          more often than the chart suggests. Each team turns in something concrete every
          quarter &mdash; a test, a dataset, a workshop, a translated guide &mdash; and we
          keep a log of what got delivered.
        </p>
      </Section>

      <Section tone="card" title="The four teams">
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map((t) => (
            <Card key={t.title}>
              <CardContent>
                <h3 className="text-xl">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Where this is going"
        description="A three-year plan, written knowing that most of year 3 will probably change."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {phases.map((p, i) => (
            <Card key={p.stage}>
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">{p.stage}</span>
                  {/* Keeps the colour, which carries the stage, and drops the
                      chip around it. */}
                  <span
                    className={cn(
                      'text-xs font-bold uppercase tracking-widest',
                      seriesTheme[phaseHues[i]].ink,
                    )}
                  >
                    {p.badge}
                  </span>
                </div>
                <h3 className="mt-3 text-xl">{p.title}</h3>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {p.items.map((item) => (
                    <li key={item} className="border-t border-border pt-2 first:border-0 first:pt-0">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  )
}
