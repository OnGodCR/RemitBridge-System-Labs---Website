import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Section, { Container, SectionImage } from '@/components/Section'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import meetingImage from '@/assets/community-meeting.jpg'

/*
 * Nothing here is running yet.
 *
 * The page previously listed four sessions and marked three languages as ready.
 * None of that was true. A family who turns up for a session that does not
 * exist, or asks for a guide nobody has written, is worse off than one that was
 * never told about it, so the page now says plainly that this is planned work.
 */
const languages = [
  { code: 'ES', name: 'Español', english: 'Spanish' },
  { code: 'ZH', name: '中文', english: 'Mandarin' },
  { code: 'HI', name: 'हिन्दी', english: 'Hindi' },
  { code: 'VI', name: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'AR', name: 'العربية', english: 'Arabic' },
  { code: 'TL', name: 'Tagalog', english: 'Filipino' },
]

/* What the workshops are for, as commitments rather than a schedule. These are
   things the lab can be held to now, unlike a session list with no dates. */
const principles = [
  {
    title: 'Free, and no sign-up',
    body: 'No cost, no registration, and no names taken at the door. Nobody should have to identify themselves to find out what a transfer costs.',
  },
  {
    title: 'Nothing collected',
    body: 'We will not ask for transfer details, amounts, or where anyone sends money. There is no list, so there is nothing to leak.',
  },
  {
    title: 'No company recommended',
    body: 'We compare options on cost and speed and leave the choosing to you. No provider pays us, and none ever will.',
  },
  {
    title: 'Checked by a speaker',
    body: 'Every guide is read by someone who actually speaks the language before it goes out, not run through a translation tool and posted.',
  },
]

export default function Workshops() {
  return (
    <>
      {/* No standing header: the page opens on what it is, the way the blog
          and contact pages do. */}
      <Section className="pt-12">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <h1 className="text-3xl sm:text-4xl">Money Across Borders workshops</h1>
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span className="size-1.5 rounded-full bg-muted-foreground" aria-hidden />
            Not running yet
          </span>
        </div>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed">
          Free sessions for families around King County, with printed guides to take
          home. The same material as the research, minus the jargon. None of it is
          running yet, and this page will say so until it is.
        </p>

        <div className="mt-10">
          <SectionImage
            src={meetingImage}
            alt="People seated around a table in discussion"
          />
        </div>

        <p className="mt-10 max-w-3xl leading-relaxed text-muted-foreground">
          Most of what the research turns up is useful to somebody sending money next
          week, but only if it is written so they can read it. Turning it into sessions
          worth someone&rsquo;s evening is the work, and it has not been done yet.
        </p>
      </Section>

      {/* Green (the section above is white). */}
      <section className="bg-primary py-20 text-primary-foreground sm:py-24">
        <Container>
          <h2 className="text-2xl sm:text-3xl">What we are committing to</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-current/90">
            Not a schedule, because there is not one. These are the rules the sessions
            will run under, and they hold from the first one.
          </p>

          <dl className="mt-12 grid gap-10 sm:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title}>
                <dt className="text-lg font-bold">{p.title}</dt>
                <dd className="mt-2 leading-relaxed text-current/90">{p.body}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Section
        title="Languages"
        description="Six to start with, chosen from what is actually spoken across King County. None are written yet."
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {languages.map((lang) => (
            <li
              key={lang.code}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3"
            >
              <div>
                <p className="text-base">{lang.name}</p>
                <p className="text-xs text-muted-foreground">{lang.english}</p>
              </div>
              <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">
                Coming soon
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap items-center gap-6 rounded-2xl border border-border bg-muted p-8">
          <div className="min-w-64 flex-1">
            <h3 className="text-xl">Want one of these where you are?</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Community groups, libraries and schools in King County can ask now. Which
              languages people request is what decides the order these get written in.
            </p>
          </div>
          <Link to="/contact" className={cn(buttonVariants({ size: 'lg' }), 'shrink-0')}>
            Ask for a session
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Section>
    </>
  )
}
