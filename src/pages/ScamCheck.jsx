import { useState } from 'react'
import Section from '@/components/Section'
import { cn } from '@/lib/utils'

/*
 * Warning signs of a transfer scam, as a checklist.
 *
 * Every sign below is drawn from published FTC and CFPB consumer guidance, and
 * the links go to the actual agencies rather than to our summaries of them. No
 * statistics, because we have none of our own and quoting someone else's out
 * of context is how numbers go wrong.
 *
 * The result is deliberately blunt. One sign checked gets "stop and check",
 * not a score out of ten: scam risk is not additive, and a single "pay with
 * gift cards" outweighs five unchecked boxes.
 */

const SIGNS = [
  {
    id: 'payment-method',
    text: 'They want payment by gift card, cryptocurrency, a crypto ATM, or a wire to a person you have never met',
    why: 'These payment types are hard to reverse and hard to trace, which is why scammers pick them. A legitimate business or agency does not demand them.',
  },
  {
    id: 'urgency',
    text: 'You are being rushed, or told to keep the transfer secret',
    why: 'Pressure and secrecy stop you asking someone you trust. Real institutions give you time and put things in writing.',
  },
  {
    id: 'prize',
    text: 'You have to pay a fee before receiving a prize, lottery win, or inheritance',
    why: 'A real prize does not cost money to collect. The fee is the scam.',
  },
  {
    id: 'romance',
    text: 'Someone you know only online is asking for money',
    why: 'A person you have never met in real life asking for a transfer is one of the most common patterns the FTC records, however long the relationship has run.',
  },
  {
    id: 'imposter',
    text: 'A caller says they are the government, your bank, or a company, and money must move now',
    why: 'Agencies do not demand transfers by phone. Hang up and call the organisation back on a number you looked up yourself.',
  },
  {
    id: 'overpayment',
    text: 'Someone paid you too much and wants the difference sent back',
    why: 'The original payment reverses later and the refund you sent is gone. Classic overpayment fraud.',
  },
  {
    id: 'emergency',
    text: 'A relative is suddenly in trouble abroad and needs money quietly and fast',
    why: 'The grandparent emergency is scripted. Verify with the person directly, or with family, before anything moves.',
  },
  {
    id: 'mule',
    text: 'A job, a prize, or a new friend involves receiving money and forwarding it on',
    why: 'Moving money for someone else is how money mules are recruited. It can make you part of laundering someone else’s fraud, with real legal consequences.',
  },
]

export default function ScamCheck() {
  const [checked, setChecked] = useState(() => new Set())

  const toggle = (id) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const count = checked.size

  return (
    <>
      <Section className="pt-12">
        <h1 className="text-3xl sm:text-4xl">Does this transfer look like a scam?</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed">
          Tick anything that matches your situation. The signs come from published FTC and
          CFPB guidance, and nothing you tick leaves this page.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
          <ul className="space-y-3">
            {SIGNS.map((s) => (
              <li key={s.id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-colors',
                    checked.has(s.id) ? 'border-primary bg-primary/5' : 'border-border bg-card',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked.has(s.id)}
                    onChange={() => toggle(s.id)}
                    className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
                  />
                  <span>
                    <span className="block font-medium leading-relaxed">{s.text}</span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                      {s.why}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-24">
            <div
              className={cn(
                'rounded-2xl border p-6',
                count > 0 ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card',
              )}
              role="status"
            >
              {count === 0 ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Nothing ticked
                  </p>
                  <p className="mt-3 leading-relaxed">
                    No signs from this list. That is not a guarantee, because this list is
                    not everything. If something still feels off, it costs nothing to wait
                    a day and ask someone you trust.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-current/80">
                    {count} {count === 1 ? 'sign' : 'signs'} ticked
                  </p>
                  <p className="mt-3 text-xl font-bold leading-snug">
                    Stop. Do not send anything yet.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-current/90">
                    Even one of these is how most transfer scams start, and money sent this
                    way is rarely recoverable. Talk to someone you trust before anything
                    moves, and check the situation against the guidance below.
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-border p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                If money already went
              </p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                <li>Contact your transfer provider immediately and ask them to stop or reverse it.</li>
                <li>
                  Report it to the FTC at{' '}
                  <a
                    href="https://reportfraud.ftc.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    reportfraud.ftc.gov
                  </a>
                  .
                </li>
                <li>
                  File a complaint with the{' '}
                  <a
                    href="https://www.consumerfinance.gov/complaint/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    CFPB
                  </a>
                  , who take money-transfer complaints and can act on them.
                </li>
              </ol>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                We are a student research lab. This page is education drawn from the
                agencies linked above, not legal or financial advice, and we cannot recover
                money or intervene with a company.
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  )
}
