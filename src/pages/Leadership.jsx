import { Link } from 'react-router-dom'
import Section, { SectionImage } from '@/components/Section'
import { Card, CardContent } from '@/components/ui/card'
import TeamDirectory from '@/components/TeamDirectory'
import teamImage from '@/assets/team-people.jpg'
import { cn } from '@/lib/utils'

/*
 * Who runs the lab.
 *
 * This page used to render six team cards, five of which were named "Student
 * fellow". Five vacancies were presented in the same shape as a person, on a
 * page whose opening line says someone here is accountable for every claim on
 * the site. That made the fabrication load-bearing.
 *
 * Filled seats and open seats are now separate arrays with deliberately
 * different treatments, and they are never rendered in one grid.
 */

/** People who exist, have agreed to be named, and are doing the work. */
const filled = [
  {
    title: 'Founder and director',
    name: 'Angad',
    since: '2026',
    desc: 'Decides what the lab works on, runs the leadership team, handles community partnerships, and checks that what the site claims matches what we actually found.',
  },
]

/** Defined and unfilled. Same descriptions, no names, and no person implied. */
const open = [
  {
    title: 'Research lead',
    team: 'Systems team',
    desc: 'Owns the methodology and the literature review, designs the benchmarks, and keeps the runs reproducible.',
  },
  {
    title: 'Technical lead',
    team: 'Systems team',
    desc: 'Handles the code for RemitBench and TrueCost, plus testing, documentation, and keeping the data we store to a minimum.',
  },
  {
    title: 'Community programs lead',
    team: 'Community education team',
    desc: 'Sets up the listening sessions and workshops, coordinates volunteers, and looks after people who come to a session needing help.',
  },
  {
    title: 'Language access lead',
    team: 'Language team',
    desc: 'Finds translators and community reviewers, keeps terms consistent across languages, and makes sure nothing goes out unreviewed.',
  },
  {
    title: 'Evaluation lead',
    team: 'Evaluation team',
    desc: 'Writes the before-and-after surveys, tracks the numbers, writes down the limitations, and puts together the annual report.',
  },
]

/*
 * The adult advisory group, per area.
 *
 * An advisor renders only with a `consentOn` date recorded alongside the name.
 * That is filtered below rather than left to whoever edits this file next:
 * naming an adult who agreed to review work in private, on a public page, is
 * not a mistake that should be one forgotten line away.
 *
 * `relationship` renders next to the name wherever one exists. Disclosing a
 * connection costs a line. Having it discovered costs the page.
 */
const AREAS = [
  {
    area: 'Financial economics',
    scope: 'Checks the cost models, the figures, and any claim about what a transfer costs.',
    advisor: null,
  },
  {
    area: 'Systems architecture',
    scope: 'Checks the benchmark design, the code, and whether a result could be reproduced.',
    advisor: null,
  },
  {
    area: 'Community education',
    scope: 'Checks the workshop material and anything written for people outside the field.',
    advisor: null,
  },
]

/** Consent is structural. No date, no name on the page. */
const withConsent = (advisor) =>
  advisor && advisor.name && advisor.consentOn ? advisor : null

const areas = AREAS.map((a) => ({ ...a, advisor: withConsent(a.advisor) }))

export default function Leadership() {
  const seats = filled.length + open.length

  return (
    <>
      <Section className="pt-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl">Who runs the lab</h1>
            <p className="mt-5 text-lg leading-relaxed">
              Students run the work and make the calls. A group of adults reviews it before
              anything goes public, which is mostly there to catch us being wrong.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The roles below are what each person is responsible for, not job titles. Where
              a seat is filled, that person is accountable for the work under it. Where it is
              open, nobody is, and the page says so rather than showing a placeholder.
            </p>
          </div>

          <SectionImage
            src={teamImage}
            alt="A group working together at a shared table"
            className="mb-0"
          />
        </div>
      </Section>

      <Section tone="card" title="The team">
        {/* Computed, so it cannot go stale when a seat is filled. */}
        <p className="max-w-3xl leading-relaxed text-muted-foreground">
          {filled.length} of {seats} seats filled. The rest are open and are listed as open.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filled.map((r) => (
            <Card key={r.title}>
              <CardContent>
                <p className="text-sm text-muted-foreground">{r.title}</p>
                <h3 className="mt-2 text-xl">{r.name}</h3>
                <p className="text-xs text-muted-foreground">Since {r.since}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {open.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl">{open.length} seats are open</h3>
            <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">
              These roles are defined and nobody is in them. They are listed so the shape of
              the lab is honest about where the gaps are, not to suggest a team that exists.
            </p>

            {/* Rows, not cards. The difference from a filled seat has to be
                visible before the words are read. */}
            <ul className="mt-6 border-t border-border">
              {open.map((r) => (
                <li key={r.title} className="border-b border-border">
                  <Link
                    to="/fellowships"
                    className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:gap-8"
                  >
                    <span className="sm:w-56 sm:shrink-0">
                      <span className="block font-bold group-hover:text-primary">
                        {r.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span aria-hidden>○</span> Open · {r.team}
                      </span>
                    </span>
                    <span className="flex-1 text-sm leading-relaxed text-muted-foreground">
                      {r.desc}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              to="/fellowships"
              className="mt-6 inline-block font-bold text-primary hover:underline"
            >
              How students join the lab
            </Link>
          </div>
        )}
      </Section>

      {/* Renders nothing, section and all, until somebody opts in. */}
      <TeamDirectory />

      <Section title="The adult advisory group">
        <p className="max-w-3xl leading-relaxed">
          Three areas get reviewed by adults before anything is published. They are not in
          charge of the lab and they do not assign the work. They are there to check the
          facts, flag anything that could put a participant at risk, and tell us when a
          claim is bigger than the evidence behind it.
        </p>

        <ul className="mt-8 border-t border-border">
          {areas.map((a) => (
            <li
              key={a.area}
              className="flex flex-col gap-2 border-b border-border py-5 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <span className="sm:w-56 sm:shrink-0">
                <span className="block font-bold">{a.area}</span>
                <span
                  className={cn(
                    'mt-0.5 flex items-center gap-1.5 text-xs',
                    a.advisor ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <span aria-hidden>{a.advisor ? '●' : '○'}</span>
                  {a.advisor ? 'Reviewer in place' : 'No reviewer yet'}
                </span>
              </span>

              <span className="flex-1">
                <span className="block text-sm leading-relaxed text-muted-foreground">
                  {a.scope}
                </span>
                {a.advisor && (
                  <span className="mt-2 block text-sm">
                    <span className="font-bold">{a.advisor.name}</span>
                    {a.advisor.affiliation && (
                      <span className="text-muted-foreground">, {a.advisor.affiliation}</span>
                    )}
                    {a.advisor.relationship && (
                      <span className="mt-1 block text-muted-foreground">
                        Declared connection: {a.advisor.relationship}
                      </span>
                    )}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
