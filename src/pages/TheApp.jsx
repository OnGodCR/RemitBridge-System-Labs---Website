import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/Section'
import Backdrop from '@/components/Backdrop'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ArrowLeftRight, BarChart3, Bell, BookOpen, Bookmark, CalendarRange, CircleUser, Gauge,
  GraduationCap, Languages, Library, LineChart, ListChecks, MapPin, MessageCircle, Newspaper,
  ChevronRight, Receipt, Scale, ScanLine, ShieldAlert, ShieldCheck, Unlock, Wrench,
} from 'lucide-react'

const APP_SITE = 'https://app.remitbridgelabs.org'

/*
  A scroll story after hidewire.org, at Angad's request, and the same shape as
  the app's own landing page (app repo, DECISIONS.md D59): a dark hero, then
  one phone pinned in place while each step scrolls past and swaps its screen.

  Only screens with a real capture get a step. The captures are copied from
  the app repo's site/screens, taken in the simulator; nothing here is a
  mock-up. Every other feature is in the list below the story, in words,
  until it has a real screenshot of its own.
*/
const steps = [
  {
    screen: 'tools',
    name: 'Tools',
    title: 'Every check, before and after you send',
    body: 'Fair rate, TrueCost, Yearly cost, Rate history and Scam check, grouped by when you need them.',
  },
  {
    screen: 'fair-rate',
    name: 'Fair rate',
    title: 'Know a fair rate before you send',
    body: 'The mid-market rate is the honest yardstick. Drag the markup and watch what arrives shrink.',
    path: '/fair-rate',
  },
  {
    screen: 'true-cost',
    name: 'TrueCost',
    title: 'Find the cost hidden in the rate',
    body: 'Type in a receipt and see the fee and the exchange-rate markup counted as one cost.',
    path: '/truecost',
  },
  {
    screen: 'rate-history',
    name: 'Rate history',
    title: 'Watch the rate move',
    body: 'The mid-market rate day by day. Drag across the chart to read any day.',
    path: '/rate-history',
  },
  {
    screen: 'scam-check',
    name: 'Scam check',
    title: 'Stop before you pay a stranger',
    body: 'Eight quick questions from FTC and CFPB guidance. Your answers stay on your phone.',
    path: '/scam-check',
  },
]

/*
  Every feature in the app, read from its screens and i18n strings, not its
  pitch. Grouped by the app's own five tabs, in the app's order, so the page
  teaches the layout a reader will meet when they open it.
*/
const tabs = [
  {
    id: 'scan',
    label: 'Scan',
    icon: ScanLine,
    line: 'What did your transfer really cost? Photograph the receipt and find out.',
    items: [
      { icon: Receipt, name: 'Scan a receipt', body: 'Snap a transfer receipt and see the fee and the markup hidden in the rate, as one real cost.' },
      { icon: ShieldCheck, name: 'Covered before it leaves', body: 'Names, addresses and account numbers are covered on your phone first, and you see exactly what would be sent.' },
      { icon: ListChecks, name: 'Check each value', body: 'Every figure read from the receipt is shown for you to confirm or correct before the result.' },
      { icon: BarChart3, name: 'What people really paid', body: 'Share a receipt if you choose, and it joins totals shown only for groups of five or more.' },
    ],
  },
  {
    id: 'compare',
    label: 'Compare',
    icon: ArrowLeftRight,
    line: 'Banks, credit unions and transfer companies, ranked by what your family receives.',
    items: [
      { icon: Scale, name: 'Ranked by what arrives', body: 'Nothing else decides the order. No provider can pay to rank higher.' },
      { icon: Gauge, name: 'Every cost split out', body: 'Each price shows the upfront fee and the exchange-rate markup, and when it was checked.' },
      { icon: ShieldAlert, name: 'What a price leaves out', body: 'Agent fees charged in person, taxes where the money arrives, and rate moves since the last check.' },
      { icon: Bell, name: 'Rate alerts', body: 'Set a target and get one notification when a price reaches it, at most once a day.' },
      { icon: MapPin, name: 'Ask for a route', body: 'Request a country that is not covered yet, and see which routes are live, being built or requested.' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: Wrench,
    line: 'Five checks, grouped by whether you need them before or after you send.',
    items: [
      { icon: Gauge, name: 'Fair rate', body: 'How far your rate is from the mid-market rate, and what each point costs.', path: '/fair-rate' },
      { icon: Receipt, name: 'TrueCost', body: 'Check a receipt by hand when you would rather not scan it.', path: '/truecost' },
      { icon: CalendarRange, name: 'Yearly cost', body: 'The same transfer, every month for a year. What it adds up to.', path: '/reckoner' },
      { icon: LineChart, name: 'Rate history', body: 'The mid-market rate, day by day. Drag across the chart to read any day.', path: '/rate-history' },
      { icon: ShieldAlert, name: 'Scam check', body: 'Eight questions from FTC and CFPB guidance. Your answers stay on your phone.', path: '/scam-check' },
    ],
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: BookOpen,
    line: 'Short lessons and the lab\u2019s research, in plain language.',
    items: [
      { icon: GraduationCap, name: 'Eight lessons', body: 'From what a transfer really costs and how money arrives, to staying safe and how banks move money.' },
      { icon: Newspaper, name: 'The lab\u2019s blog', body: 'Every post from this site, inside the app.', path: '/blog' },
      { icon: Library, name: 'Glossary', body: 'Every term the research relies on, in plain words.', path: '/glossary' },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    icon: CircleUser,
    line: 'Optional. It keeps what you save, on any phone you use.',
    items: [
      { icon: Unlock, name: 'No account needed', body: 'Comparing prices needs no sign-up. If you make one, you can delete it in the app at any time.' },
      { icon: Bookmark, name: 'Saved comparisons', body: 'Save a comparison or a receipt check and reopen it in one tap.' },
      { icon: MessageCircle, name: 'WhatsApp', body: 'Ask for prices in a WhatsApp chat, and link it to save from there and get alerts.' },
      { icon: Languages, name: 'Your language', body: 'English now. Hindi, Spanish, Tagalog and Vietnamese are written and waiting on reviewers.' },
    ],
  },
]

/*
  A working model of the app's own navigation rather than a grid of cards:
  the phone's tab bar switches tabs, each row on its screen is a feature, and
  the panel beside it explains the one picked. It is drawn in HTML in the
  app's visual language (green header, list rows, bottom tab bar), so it is a
  guide to the app, not a screenshot standing in for one.

  Every tab's rows are in the markup with `hidden` on the inactive ones, so
  the prerender and crawlers still read every feature.
*/
function Features() {
  const [tab, setTab] = useState(0)
  const [row, setRow] = useState(0)
  const t = tabs[tab]
  const f = t.items[Math.min(row, t.items.length - 1)]
  const pick = (i) => {
    setTab(i)
    setRow(0)
  }

  return (
    <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-28">
      <Backdrop onDark fadeClass={null} />
      <Container className="relative">
        <p className="text-sm font-bold uppercase tracking-widest text-current/70">Everything in the app</p>
        <h2 className="mt-3 max-w-2xl text-3xl sm:text-4xl">Five tabs. Tap around.</h2>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[auto_1fr] lg:gap-20">
          {/* The phone */}
          <div className="mx-auto w-full max-w-[19rem] rounded-[2.75rem] bg-ink p-2.5 shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
            <div className="flex h-[36rem] flex-col overflow-hidden rounded-[2.25rem] bg-background text-foreground">
              <div className="bg-primary px-5 pb-5 pt-9 text-primary-foreground">
                <p className="text-[11px] font-bold uppercase tracking-widest text-current/70">RemitBridge</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{t.label}</p>
                <p className="mt-1 text-xs leading-snug text-current/80">{t.line}</p>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3">
                {tabs.map((tt, ti) => (
                  <ul key={tt.id} hidden={ti !== tab} className="space-y-1.5" aria-label={`${tt.label} features`}>
                    {tt.items.map((it, ri) => {
                      const on = ti === tab && it === f
                      return (
                        <li key={it.name}>
                          <button
                            onClick={() => setRow(ri)}
                            aria-pressed={on}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors',
                              on ? 'border-primary bg-accent' : 'border-border bg-card hover:border-primary/40',
                            )}
                          >
                            <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', on ? 'bg-primary text-primary-foreground' : 'bg-accent text-primary')}>
                              <it.icon className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1 text-sm font-bold leading-snug">{it.name}</span>
                            <ChevronRight className={cn('size-4 shrink-0', on ? 'text-primary' : 'text-muted-foreground')} />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                ))}
              </div>

              <div role="tablist" aria-label="App tabs" className="grid grid-cols-5 border-t border-border bg-card px-1 pb-4 pt-2">
                {tabs.map((tt, i) => (
                  <button
                    key={tt.id}
                    role="tab"
                    aria-selected={i === tab}
                    onClick={() => pick(i)}
                    className={cn('flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold transition-colors', i === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
                  >
                    <span className={cn('flex h-7 w-11 items-center justify-center rounded-full transition-colors', i === tab && 'bg-accent')}>
                      <tt.icon className="size-[18px]" />
                    </span>
                    {tt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* What the picked row does */}
          <div aria-live="polite">
            <p className="font-mono text-sm text-current/60">
              {String(tab + 1).padStart(2, '0')} / {t.label} / {String(t.items.indexOf(f) + 1).padStart(2, '0')}
            </p>
            <span className="mt-6 flex size-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <f.icon className="size-8" />
            </span>
            <h3 className="mt-6 text-3xl sm:text-5xl">{f.name}</h3>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-current/85">{f.body}</p>
            {f.path && (
              <Link to={f.path} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary transition-transform hover:-translate-y-0.5">
                Try it on the web <ChevronRight className="size-4" />
              </Link>
            )}

            <div className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-6 text-sm">
              {t.items.map((it, ri) => (
                <button
                  key={it.name}
                  onClick={() => setRow(ri)}
                  className={cn('transition-colors', it === f ? 'font-bold text-current' : 'text-current/60 hover:text-current')}
                >
                  {it.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

function Phone({ screen, active = true, className, eager }) {
  return (
    <div
      className={cn(
        'relative aspect-[603/1311] w-[min(17rem,62vw)] rounded-[2.6rem] bg-black p-2.5 shadow-[0_30px_60px_rgba(28,32,36,0.22)]',
        className,
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-white">
        {(Array.isArray(screen) ? screen : [screen]).map((s, i) => (
          <img
            key={s}
            src={`/app/${s}.webp`}
            alt={`The ${s.replace('-', ' ')} screen in the RemitBridge app`}
            width="603"
            height="1311"
            loading={eager ? 'eager' : 'lazy'}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-all duration-700',
              (Array.isArray(screen) ? active === i : active)
                ? 'scale-100 opacity-100'
                : 'translate-y-2 scale-[1.03] opacity-0',
            )}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Which step the pinned phone shows, from how far the story has scrolled.
 *
 * Read from layout, not from events alone: in some contexts the document
 * scrolls while no scroll event fires (see CLAUDE.md), so a slow poll backs
 * the listener up. Starts at 0 so the server and the first client render
 * agree.
 */
function useStep(ref, count) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const update = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const span = Math.max(1, el.offsetHeight - window.innerHeight)
      const p = Math.min(0.999, Math.max(0, -r.top / span))
      setStep(Math.floor(p * count))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    const timer = setInterval(update, 300)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      clearInterval(timer)
    }
  }, [ref, count])
  return step
}

export default function TheApp() {
  const story = useRef(null)
  const step = useStep(story, steps.length)

  return (
    <div className="bg-card text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-1/2 size-[56rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(20,112,90,0.10),transparent_62%)]" />
        <Container className="relative grid min-h-[calc(100svh-4rem)] items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Free · no ads · never touches your money
            </p>
            <h1 className="mt-4 text-5xl leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              See what your family <span className="text-primary">really receives.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Most of what a transfer costs hides in the exchange rate, not the fee.
              RemitBridge, the lab&rsquo;s app for iPhone and Android, shows you both.
            </p>
            <p className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <span className="inline-block size-2 rounded-full border-2 border-primary" />
              Coming soon to the App Store and Google Play
            </p>
          </div>
          <div className="relative mx-auto flex h-[30rem] w-full max-w-md items-center justify-center sm:h-[36rem]">
            <Phone screen="rate-history" eager className="absolute left-0 top-4 hidden -rotate-6 opacity-80 sm:block" />
            <Phone screen="true-cost" eager className="relative rotate-3 sm:left-16" />
          </div>
        </Container>
        <p className="pb-6 text-center text-[11px] tracking-[0.3em] text-muted-foreground">SCROLL</p>
      </section>

      {/* The story: the stage is sticky inside a box one screen tall per step. */}
      <section ref={story} className="relative" style={{ height: `${steps.length * 100}svh` }}>
        <div className="sticky top-16 flex h-[calc(100svh-4rem)] items-center overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-1/2 size-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(20,112,90,0.12),transparent_64%)]" />
          <Container className="relative grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
            <div className="relative order-2 min-h-44 md:order-none md:col-start-1 md:row-start-1">
              {steps.map((s, i) => (
                <StepText key={s.screen} s={s} i={i} on={step === i} side="left" />
              ))}
            </div>
            <div className="order-1 flex justify-center md:order-none md:col-start-2 md:row-start-1">
              <Phone
                screen={steps.map((s) => s.screen)}
                active={step}
                className="max-md:w-[min(11rem,24svh)] max-md:rounded-[1.6rem] max-md:p-1.5"
              />
            </div>
            <div className="relative hidden min-h-44 md:col-start-3 md:row-start-1 md:block">
              {steps.map((s, i) => (
                <StepText key={s.screen} s={s} i={i} on={step === i} side="right" />
              ))}
            </div>
          </Container>
          <div className="absolute bottom-[4svh] left-1/2 flex -translate-x-1/2 gap-1.5">
            {steps.map((s, i) => (
              <span
                key={s.screen}
                className={cn('h-[3px] w-6 rounded-sm transition-colors', i <= step ? 'bg-primary' : 'bg-border')}
              />
            ))}
          </div>
        </div>
      </section>

      <Features />

      <section className="bg-card py-20 sm:py-24">
        <Container>
          <h2 className="text-2xl sm:text-3xl">Ranked by what arrives. Nothing else.</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
            No affiliate links, no paid placement and no ads. The app never sends, holds or
            exchanges money: it shows prices, and you send with the provider you choose. It
            launches for sending from the US to India, Mexico, the Philippines and Vietnam.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <a href={APP_SITE} className={buttonVariants({ size: 'lg' })}>
              Visit the app&rsquo;s site
            </a>
            <Link to="/truecost" className="font-bold text-primary hover:underline">
              Try the tools on the web
            </Link>
          </div>
        </Container>
      </section>
    </div>
  )
}

/* Text alternates sides on wide screens, like the reference; on a phone it
   sits under the phone, so only the left column renders there. */
function StepText({ s, i, on, side }) {
  const mine = side === 'left' ? i % 2 === 1 : i % 2 === 0
  return (
    <div
      className={cn(
        'absolute inset-x-0 top-1/2 transition-all duration-500',
        on ? '-translate-y-1/2' : 'pointer-events-none -translate-y-[40%]',
        side === 'left' && (on ? 'opacity-100' : 'opacity-0'),
        on && mine ? 'md:opacity-100' : 'md:pointer-events-none md:opacity-0',
        side === 'right' && !(on && mine) && 'opacity-0',
      )}
      aria-hidden={!on}
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
        {String(i + 1).padStart(2, '0')} · {s.name}
      </p>
      <h2 className="mt-3 text-2xl leading-tight md:text-3xl tracking-tight text-foreground lg:text-4xl">
        {s.title}
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">{s.body}</p>
      {s.path && (
        <Link to={s.path} className="mt-4 inline-block text-sm font-bold text-primary hover:underline">
          Try it on the web
        </Link>
      )}
    </div>
  )
}
