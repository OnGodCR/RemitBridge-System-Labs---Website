import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Section, { Container } from '@/components/Section'
import Backdrop from '@/components/Backdrop'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

/* Every feature in the app, read from its screens and strings, not its pitch. */
const features = [
  {
    group: 'Compare',
    items: [
      ['Compare providers', 'Banks, credit unions and transfer companies ranked by how much your family receives, and nothing else.'],
      ['Every cost split out', 'Each price shows the upfront fee and the markup in the exchange rate, and when it was checked.'],
      ['What a price does not tell you', 'Agent fees charged in person, taxes where the money arrives, and rate moves since the last check, said plainly.'],
      ['Rate alerts', 'Pick a target and get one notification when a price reaches it, at most once a day.'],
      ['Ask for a route', 'Request a country that is not covered yet, and see which routes are live, being built or requested.'],
    ],
  },
  {
    group: 'Scan',
    items: [
      ['Scan a receipt', 'Photograph a transfer receipt and see what it really cost: the fee plus the hidden markup.'],
      ['Covered before it leaves', 'Names, addresses and account numbers are covered on your phone, and you see exactly what would be sent.'],
      ['Check each value', 'Every figure read from the receipt is shown for you to confirm or correct.'],
      ['Shared receipts', 'If you choose to share one, it adds to totals of what people really paid, shown only for groups of five or more.'],
    ],
  },
  {
    group: 'Tools',
    items: [
      ['Fair rate', 'How far your rate is from the mid-market rate, and what each point costs.'],
      ['TrueCost', 'Check a receipt by hand when you would rather not scan it.'],
      ['Yearly cost', 'The same transfer, every month for a year. What it adds up to.'],
      ['Rate history', 'The mid-market rate, day by day.'],
      ['Scam check', 'Warning signs of a transfer scam, one question at a time.'],
    ],
  },
  {
    group: 'Learn',
    items: [
      ['Lessons', 'Eight short modules, from what a transfer really costs to staying safe and how money moves between banks.'],
      ['The lab’s blog', 'Every post from this site, inside the app.'],
      ['Glossary', 'Every term in plain language.'],
    ],
  },
  {
    group: 'You',
    items: [
      ['No account needed', 'Comparing prices needs no sign-up. An account is optional, and you can delete it in the app.'],
      ['Saved comparisons', 'Save a comparison or a receipt check and reopen it on any phone.'],
      ['WhatsApp', 'Ask for prices in a WhatsApp chat, and link it to your account to save from there.'],
      ['Your language', 'English now. Hindi, Spanish, Tagalog and Vietnamese are written and waiting on reviewers.'],
    ],
  },
]

function Phone({ screen, active = true, className, eager }) {
  return (
    <div
      className={cn(
        'relative aspect-[603/1311] w-[min(17rem,62vw)] rounded-[2.6rem] bg-black p-2.5 shadow-[0_0_0_1px_#2a3a34,0_30px_80px_rgba(0,0,0,0.55)]',
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
    <div className="bg-ink text-ink-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-1/2 size-[56rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(63,174,142,0.22),transparent_62%)]" />
        <Container className="relative grid min-h-[calc(100svh-4rem)] items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#3fae8e]">
              Free · no ads · never touches your money
            </p>
            <h1 className="mt-4 text-5xl leading-[1.02] tracking-tight text-ink-foreground sm:text-6xl lg:text-7xl">
              See what your family <span className="text-[#3fae8e]">really receives.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted">
              Most of what a transfer costs hides in the exchange rate, not the fee.
              RemitBridge, the lab&rsquo;s app for iPhone and Android, shows you both.
            </p>
            <p className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink-muted">
              <span className="inline-block size-2 rounded-full border-2 border-[#3fae8e]" />
              Coming soon to the App Store and Google Play
            </p>
          </div>
          <div className="relative mx-auto flex h-[30rem] w-full max-w-md items-center justify-center sm:h-[36rem]">
            <Phone screen="rate-history" eager className="absolute left-0 top-4 hidden -rotate-6 opacity-80 sm:block" />
            <Phone screen="true-cost" eager className="relative rotate-3 sm:left-16" />
          </div>
        </Container>
        <p className="pb-6 text-center text-[11px] tracking-[0.3em] text-ink-muted">SCROLL</p>
      </section>

      {/* The story: the stage is sticky inside a box one screen tall per step. */}
      <section ref={story} className="relative" style={{ height: `${steps.length * 100}svh` }}>
        <div className="sticky top-16 flex h-[calc(100svh-4rem)] items-center overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-1/2 size-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(63,174,142,0.26),transparent_64%)]" />
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
                className={cn('h-[3px] w-6 rounded-sm transition-colors', i <= step ? 'bg-[#3fae8e]' : 'bg-white/15')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Every feature */}
      <div className="bg-background text-foreground">
        <Section>
          <h2 className="text-3xl sm:text-4xl">Everything in the app</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            Five tabs: Scan, Compare, Tools, Learn and Account. This is all of it.
          </p>
          <div className="mt-12 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {features.map((g) => (
              <div key={g.group}>
                <p className="text-sm font-bold uppercase tracking-widest text-primary">{g.group}</p>
                <ul className="mt-4 divide-y divide-border border-t border-border">
                  {g.items.map(([name, line]) => (
                    <li key={name} className="py-4">
                      <p className="font-bold">{name}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{line}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-24">
          <Backdrop onDark fadeClass={null} />
          <Container className="relative">
            <h2 className="text-2xl sm:text-3xl">Ranked by what arrives. Nothing else.</h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-current/90">
              No affiliate links, no paid placement and no ads. Providers cannot pay to rank
              higher. The app never sends, holds or exchanges money: it shows prices, and you
              send with the provider you choose. It launches for sending from the US to India,
              Mexico, the Philippines and Vietnam.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={APP_SITE} className={buttonVariants({ size: 'lg', variant: 'secondary' })}>
                Visit the app&rsquo;s site
              </a>
              <Link to="/truecost" className="self-center font-bold underline underline-offset-4">
                Try the tools on the web
              </Link>
            </div>
          </Container>
        </section>
      </div>
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
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#3fae8e]">
        {String(i + 1).padStart(2, '0')} · {s.name}
      </p>
      <h2 className="mt-3 text-2xl leading-tight md:text-3xl tracking-tight text-ink-foreground lg:text-4xl">
        {s.title}
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted md:text-base">{s.body}</p>
      {s.path && (
        <Link to={s.path} className="mt-4 inline-block text-sm font-bold text-[#3fae8e] hover:underline">
          Try it on the web
        </Link>
      )}
    </div>
  )
}
