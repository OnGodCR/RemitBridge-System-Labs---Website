import Section, { PageHeader, SectionImage } from '@/components/Section'
import { Card, CardContent } from '@/components/ui/card'
import { seriesTheme } from '@/lib/palette'
import { cn } from '@/lib/utils'
import meetingImage from '@/assets/community-meeting.jpg'

const languages = [
  { code: 'ES', name: 'Español', english: 'Spanish', ready: true },
  { code: 'ZH', name: '中文', english: 'Mandarin', ready: true },
  { code: 'HI', name: 'हिन्दी', english: 'Hindi', ready: true },
  { code: 'VI', name: 'Tiếng Việt', english: 'Vietnamese', ready: false },
  { code: 'AR', name: 'العربية', english: 'Arabic', ready: false },
  { code: 'TL', name: 'Tagalog', english: 'Filipino', ready: false },
]

const moduleHues = ['series1', 'series2', 'series3', 'series4']

const modules = [
  {
    num: '01',
    title: 'Working out what a transfer really costs',
    desc: 'How to read the receipt, tell the fee apart from the exchange rate markup, and figure out what will actually show up on the other end.',
  },
  {
    num: '02',
    title: 'Why the money says "sent" but is not there yet',
    desc: 'Sent, cleared, and settled are three different things. We go through why a transfer can sit in the middle for days, and which delays are banking hours versus something going wrong.',
  },
  {
    num: '03',
    title: 'Banks, apps, and blockchain, side by side',
    desc: 'A plain comparison of the options on speed, cost, and what happens if something breaks. We do not recommend any company and we are not paid by any of them.',
  },
  {
    num: '04',
    title: 'Spotting transfer and crypto scams',
    desc: 'The warning signs that come up over and over: rates that are too good, pressure to move fast, and anyone asking for a wallet phrase or a login.',
  },
]

export default function Workshops() {
  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Money Across Borders workshops"
        intro="Free sessions for families around King County, plus printed guides people can take home. Same material as the research, minus the jargon."
      />

      <Section>
        <SectionImage src={meetingImage} alt="People seated around a table in discussion" />
        <p className="max-w-3xl leading-relaxed">
          Most of what we found in the research is useful to somebody sending money next
          week, but only if it is written in a way they can actually read. So we turned the
          main findings into four short sessions. No sign-up, no cost, and we do not collect
          names or any transfer details from anyone who shows up.
        </p>
      </Section>

      <Section
        tone="card"
        title="Languages"
        description="Every guide is checked by a person who speaks the language, not run through a translation tool and posted."
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {languages.map((lang) => (
            <li
              key={lang.code}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-3"
            >
              <div>
                <p className="text-base">{lang.name}</p>
                <p className="text-xs text-muted-foreground">{lang.english}</p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-xs font-bold',
                  lang.ready
                    ? cn(seriesTheme.series1.tint, seriesTheme.series1.ink, seriesTheme.series1.border)
                    : cn(seriesTheme.series4.tint, seriesTheme.series4.ink, seriesTheme.series4.border),
                )}
              >
                {lang.ready ? 'Ready' : 'Being checked'}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="The four sessions">
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map((m, i) => (
            <Card key={m.num}>
              <CardContent>
                <p
                  className={cn(
                    'inline-block rounded-full px-3 py-1 text-xs font-bold',
                    seriesTheme[moduleHues[i]].tint,
                    seriesTheme[moduleHues[i]].ink,
                  )}
                >
                  Session {m.num}
                </p>
                <h3 className="mt-2 text-xl leading-snug">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="card" title="About our community partners">
        <p className="max-w-3xl leading-relaxed text-muted-foreground">
          We run listening sessions and get our materials reviewed with local nonprofits and
          civic groups around King County. We do not list any of them as a partner until
          there is an actual agreement in writing, since putting a group&rsquo;s name on
          your website before they agreed to it is a good way to lose their trust.
        </p>
      </Section>
    </>
  )
}
