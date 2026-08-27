import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Section, { Container, PageHeader, SectionImage } from '@/components/Section'
import Backdrop from '@/components/Backdrop'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { seriesTheme } from '@/lib/palette'
import { cn } from '@/lib/utils'
import libraryImage from '@/assets/fellowships-library.jpg'

/**
 * Each team carries a hue and the thing it actually hands in.
 *
 * The page already said every team ships "a test, a dataset, a workshop, a
 * translated guide" every quarter, in exactly this order. Attaching each one
 * to its team turns a sentence a reader has to hold in their head into a
 * label they can see, and invents nothing.
 */
const teams = [
  {
    hue: 'series1',
    title: 'Systems',
    ships: 'A test',
    desc: 'Builds and maintains RemitBench. Designing the tests, running the simulations, keeping the code clean enough that someone else can rerun it.',
  },
  {
    hue: 'series2',
    title: 'Economics',
    ships: 'A dataset',
    desc: 'Collects corridor fees and exchange-rate markups by hand, tracks pickup charges, and reads up on how the remittance market is actually structured.',
  },
  {
    hue: 'series3',
    title: 'Community education',
    ships: 'A workshop',
    desc: 'Runs the workshops, writes the family guides, and handles talking with partner organisations.',
  },
  {
    hue: 'series4',
    title: 'Language and evaluation',
    ships: 'A translated guide',
    desc: 'Coordinates translators and reviewers, and builds the before-and-after surveys we use to check whether a workshop taught anyone anything.',
  },
]

const phases = [
  {
    hue: 'series1',
    stage: 'Year 1',
    badge: 'Now',
    current: true,
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
    hue: 'series2',
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
    hue: 'series3',
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

      <Section
        tone="card"
        title="The four teams"
        description="One hue each, and the thing that team hands in at the end of a quarter."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map((t, i) => {
            const theme = seriesTheme[t.hue]
            return (
              <Card key={t.title} className="overflow-hidden">
                {/* The hue reads as a rule, not a chip. Same reason the rest of
                    the site has no pills: a filled shape looks pressable. */}
                <span aria-hidden className={cn('block h-1 w-full', theme.bar)} />
                <CardContent>
                  <div className="flex items-baseline gap-3">
                    <span className={cn('text-sm font-extrabold tabular-nums', theme.ink)}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-xl">{t.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
                  <p className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs">
                    <span className={cn('size-1.5 shrink-0 rounded-full', theme.bar)} aria-hidden />
                    <span className="font-bold uppercase tracking-widest text-muted-foreground">
                      Ships
                    </span>
                    <span className={cn('font-bold', theme.ink)}>{t.ships}</span>
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Section>

      <Section
        title="Where this is going"
        description="A three-year plan, written knowing that most of year 3 will probably change."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {phases.map((p) => {
            const theme = seriesTheme[p.hue]
            return (
              <Card key={p.stage} className="overflow-hidden">
                <span aria-hidden className={cn('block h-1 w-full', theme.bar)} />
                <CardContent>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">{p.stage}</span>
                    {/* Filled for the year we are in, hollow for the ones we
                        are not. The site's status convention, doing real work:
                        three equal cards otherwise read as three equal plans. */}
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest',
                        theme.ink,
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'size-2 rounded-full',
                          p.current ? theme.bar : 'border-2 border-current bg-card',
                        )}
                      />
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl">{p.title}</h3>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {p.items.map((item) => (
                      <li
                        key={item}
                        className="border-t border-border pt-2 first:border-0 first:pt-0"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Section>

      {/* The page described a fellowship and gave nobody a way to ask for one.
          The steps here are the ones the sign-up page already lists, so the
          two do not drift. */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-24">
        <Backdrop onDark fadeClass={null} />
        <Container className="relative">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl">Joining one of them</h2>
            <p className="mt-5 text-lg leading-relaxed text-current/90">
              Fellows are chosen from applications, not from sign-ups. Make an account, pick
              one of the four teams, and say why in a paragraph. A student lead reads every
              one, and you hear back either way.
            </p>
            <Button asChild size="hero" variant="secondary" className="mt-8">
              <Link to="/sign-up">
                Join the lab
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}
