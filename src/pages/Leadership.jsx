import Section, { SectionImage } from '@/components/Section'
import { Card, CardContent } from '@/components/ui/card'
import TeamDirectory from '@/components/TeamDirectory'
import teamImage from '@/assets/team-people.jpg'

const roles = [
  {
    title: 'Founder and director',
    name: 'Angad',
    affiliation: 'Founder',
    desc: 'Decides what the lab works on, runs the leadership team, handles community partnerships, and checks that what the site claims matches what we actually found.',
  },
  {
    title: 'Research lead',
    name: 'Student fellow',
    affiliation: 'Systems team',
    desc: 'Owns the methodology and the literature review, designs the benchmarks, and keeps the runs reproducible.',
  },
  {
    title: 'Technical lead',
    name: 'Student fellow',
    affiliation: 'Systems team',
    desc: 'Handles the code for RemitBench and TrueCost, plus testing, documentation, and keeping the data we store to a minimum.',
  },
  {
    title: 'Community programs lead',
    name: 'Student fellow',
    affiliation: 'Community education team',
    desc: 'Sets up the listening sessions and workshops, coordinates volunteers, and looks after people who come to a session needing help.',
  },
  {
    title: 'Language access lead',
    name: 'Student fellow',
    affiliation: 'Language team',
    desc: 'Finds translators and community reviewers, keeps terms consistent across languages, and makes sure nothing goes out unreviewed.',
  },
  {
    title: 'Evaluation lead',
    name: 'Student fellow',
    affiliation: 'Evaluation team',
    desc: 'Writes the before-and-after surveys, tracks the numbers, writes down the limitations, and puts together the annual report.',
  },
]

export default function Leadership() {
  return (
    <>
      {/* No standing header. Half a screen of centred type before any content
          is the same problem the blog and contact pages had. */}
      <Section className="pt-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl">Who runs the lab</h1>
            <p className="mt-5 text-lg leading-relaxed">
              Students run the work and make the calls. A group of adults reviews it
              before anything goes public, which is mostly there to catch us being wrong.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The roles below are what each person is responsible for, not job titles.
              If something on this site is wrong, one of them is accountable for it.
            </p>
          </div>

          {/* Beside the type rather than under it, so the page opens on
              something to look at instead of a band of empty white. */}
          <SectionImage
            src={teamImage}
            alt="A group working together at a shared table"
            className="mb-0"
          />
        </div>
      </Section>

      <Section tone="card" title="The team">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <Card key={r.title}>
              <CardContent>
                <p className="text-sm text-muted-foreground">{r.title}</p>
                <h2 className="mt-2 text-xl">{r.name}</h2>
                <p className="text-xs text-muted-foreground">{r.affiliation}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Renders nothing, section and all, until somebody opts in. */}
      <TeamDirectory />

      <Section title="The adult advisory group">
        <p className="max-w-3xl leading-relaxed text-muted-foreground">
          Three areas get reviewed by adults before anything is published: the financial
          economics, the systems architecture, and the community education material. They
          are not in charge of the lab and they do not assign the work. They are there to
          check the facts, flag anything that could put a participant at risk, and tell us
          when a claim is bigger than the evidence behind it.
        </p>
      </Section>
    </>
  )
}
