import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/Section'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ArrowLeftRight, BarChart3, Bell, BookOpen, Bookmark, CalendarRange, CircleUser, Gauge,
  GraduationCap, Languages, Library, LineChart, ListChecks, MapPin, MessageCircle, Newspaper,
  Receipt, Scale, ScanLine, ShieldAlert, ShieldCheck, Unlock, Wrench,
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
  All five panels are in the markup and the inactive ones carry `hidden`, so
  a crawler and the prerender read every feature, not just the first tab.
*/
function Features() {
  const [open, setOpen] = useState('scan')
  return (
    <section className="bg-accent py-20 sm:py-28">
      <Container>
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Everything in the app</p>
        <h2 className="mt-3 max-w-2xl text-3xl sm:text-4xl">Five tabs. Every feature, one tap away.</h2>

        <div
          role="tablist"
          aria-label="App tabs"
          className="mt-10 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-sm sm:inline-flex"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={open === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setOpen(t.id)}
              className={cn(
                'flex min-w-16 flex-1 flex-col items-center gap-1 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors sm:flex-none sm:flex-row sm:gap-2 sm:text-sm',
                open === t.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <t.icon className="size-5 sm:size-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tabs.map((t) => (
          <div
            key={t.id}
            role="tabpanel"
            id={`panel-${t.id}`}
            aria-labelledby={`tab-${t.id}`}
            hidden={open !== t.id}
            className="mt-8"
          >
            <p className="max-w-2xl text-lg leading-relaxed">{t.line}</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {t.items.map((f) => (
                <li
                  key={f.name}
                  className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <p className="mt-5 text-lg font-bold">{f.name}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  {f.path && (
                    <Link to={f.path} className="mt-4 text-sm font-bold text-primary hover:underline">
                      Try it on the web
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
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
