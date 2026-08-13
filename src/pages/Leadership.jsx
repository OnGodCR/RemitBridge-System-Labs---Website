import Section, { PageHeader, SectionImage } from '@/components/Section'
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
      <PageHeader
        eyebrow="About"
        title="Who runs the lab"
        intro="Students run the work and make the calls. A group of adults reviews it before anything goes public, which is mostly there to catch us being wrong."
      />

      <Section>
        <SectionImage src={teamImage} alt="A group working together at a shared table" />
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

      <Section tone="card" title="The adult advisory group">
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
