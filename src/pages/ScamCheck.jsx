import { useEffect, useRef, useState } from 'react'
import Section from '@/components/Section'
import { cn } from '@/lib/utils'

/*
 * Warning signs of a transfer scam, asked one at a time.
 *
 * This was a list of eight tickboxes. A list is something you scan: the eye
 * goes down it, nothing catches, and you arrive at the bottom having read
 * none of it. Somebody halfway through being defrauded is exactly the person
 * who skims, because they have already decided and are looking for permission.
 *
 * So it is one question per screen, phrased about the reader's own situation,
 * and there is no way past a question except by answering it. That is the
 * whole design: the friction is the feature.
 *
 * Every question is drawn from published FTC and CFPB consumer guidance, and
 * the links go to the agencies rather than to our summary of them. No
 * statistics, because we have none of our own.
 *
 * The risk numbers are the lab's own reading of how diagnostic each sign is on
 * its own, not a figure anybody published, and the page says so where they are
 * shown. They rank the signs against each other; they do not measure anybody's
 * odds of being defrauded.
 *
 * The verdict follows the HIGHEST risk answered yes, never a total. Summing
 * would let somebody who was asked to pay in gift cards, which is close to
 * proof of fraud by itself, come out "low risk" for having answered no to the
 * other seven. That is precisely backwards, and it is the kind of arithmetic a
 * scoring quiz invites, so it is written down here and enforced below.
 */

const QUESTIONS = [
  {
    id: 'payment-method',
    risk: 10,
    ask: 'Have you been asked to pay with a gift card, cryptocurrency, a crypto ATM, or a wire to someone you have never met in person?',
    why: 'These are hard to reverse and hard to trace, which is exactly why scammers ask for them. No legitimate business or government agency demands payment this way.',
  },
  {
    id: 'urgency',
    risk: 5,
    ask: 'Are you being rushed, or told to keep this transfer to yourself?',
    why: 'Pressure and secrecy exist to stop you asking someone you trust. Real institutions give you time and put things in writing.',
  },
  {
    id: 'prize',
    risk: 10,
    ask: 'Do you have to send money first in order to receive a prize, a lottery win, or an inheritance?',
    why: 'A real prize never costs money to collect. The fee is the scam.',
  },
  {
    id: 'romance',
    risk: 6,
    ask: 'Is the person asking for money someone you have only ever met online?',
    why: 'Someone you have never met in person asking for a transfer is among the most common patterns the FTC records, however long you have been talking and however well you feel you know them.',
  },
  {
    id: 'imposter',
    risk: 8,
    ask: 'Did someone contact you saying they are from the government, your bank, or a company, and that money has to move right now?',
    why: 'Agencies do not demand transfers by phone. Hang up and call the organisation back on a number you looked up yourself, not one they gave you.',
  },
  {
    id: 'overpayment',
    risk: 9,
    ask: 'Did someone pay you too much and ask you to send the difference back?',
    why: 'The original payment reverses later and the money you sent back is gone. This is classic overpayment fraud.',
  },
  {
    id: 'emergency',
    risk: 7,
    ask: 'Did you get a sudden message that a relative is in trouble somewhere and needs money quickly and quietly?',
    why: 'The family emergency is scripted, and the "tell nobody" is part of the script. Verify with the person directly, or with other family, before anything moves.',
  },
  {
    id: 'mule',
    risk: 9,
    ask: 'Does a job, a prize, or a new friend involve you receiving money and passing it on to someone else?',
    why: 'Moving money for someone else is how money mules are recruited. It can make you part of laundering somebody else’s fraud, with real legal consequences, even if you did not know.',
  },
]

/**
 * What a number means in words, because "8" alone tells a reader nothing.
 * Colour is never the only signal: the label carries it.
 */
function riskLabel(risk) {
  if (risk >= 9) return 'Very high risk'
  if (risk >= 8) return 'High risk'
  if (risk >= 6) return 'Moderate risk'
  return 'Lower risk on its own'
}

/** Anything at or above this, answered yes, stops the transfer on its own. */
const STOP_AT = 8

const ANSWERS = [
  { id: 'yes', label: 'Yes' },
  { id: 'unsure', label: 'I am not sure' },
  { id: 'no', label: 'No' },
]

export default function ScamCheck() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const headingRef = useRef(null)

  const done = step >= QUESTIONS.length
  const current = QUESTIONS[step]

  /*
   * Move focus to the new question rather than leaving it on a button that no
   * longer exists. Without this a keyboard or screen reader user answers one
   * question and lands back at the top of the document each time.
   */
  useEffect(() => {
    headingRef.current?.focus()
  }, [step])

  const answer = (id) => {
    setAnswers((prev) => ({ ...prev, [current.id]: id }))
    setStep((s) => s + 1)
  }

  const bySeverity = (a, b) => b.risk - a.risk
  const flagged = QUESTIONS.filter((q) => answers[q.id] === 'yes').sort(bySeverity)
  const unsure = QUESTIONS.filter((q) => answers[q.id] === 'unsure').sort(bySeverity)

  /*
   * The highest single yes, never the sum. See the note at the top of the file:
   * adding these up would dilute one near-certain sign with seven clean
   * answers and report the reverse of the truth.
   */
  const topRisk = flagged.length ? flagged[0].risk : 0

  const restart = () => {
    setAnswers({})
    setStep(0)
  }

  return (
    <>
      <Section className="pt-12">
        <h1 className="text-3xl sm:text-4xl">Does this transfer look like a scam?</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed">
          Eight questions about your situation, one at a time. Nothing you answer leaves
          this page, and the questions come from published FTC and CFPB guidance.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div>
            {/* Progress. Counted, not a bar alone: "3 of 8" tells you how much
                is left in a way a filled rectangle does not. */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {done ? 'All eight answered' : `Question ${step + 1} of ${QUESTIONS.length}`}
              </p>
              <div className="mt-2 flex gap-1.5" aria-hidden>
                {QUESTIONS.map((q, i) => (
                  <span
                    key={q.id}
                    className={cn(
                      'h-1.5 flex-1 rounded-full',
                      i < step ? 'bg-primary' : 'bg-border',
                    )}
                  />
                ))}
              </div>
            </div>

            {!done ? (
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  {riskLabel(current.risk)} · {current.risk}/10
                </p>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  aria-live="polite"
                  className="mt-3 text-xl leading-snug outline-none sm:text-2xl"
                >
                  {current.ask}
                </h2>

                <div
                  role="group"
                  aria-label="Your answer"
                  className="mt-8 flex flex-col gap-3 sm:flex-row"
                >
                  {ANSWERS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => answer(a.id)}
                      className={cn(
                        'flex-1 rounded-xl border px-5 py-3.5 text-base font-bold transition-colors',
                        answers[current.id] === a.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card hover:border-muted-foreground/50',
                      )}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>

                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="mt-6 text-sm font-bold text-muted-foreground hover:text-foreground"
                  >
                    Back to the previous question
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div
                  role="status"
                  className={cn(
                    'rounded-2xl border p-6 sm:p-8',
                    flagged.length > 0
                      ? 'border-primary bg-primary text-primary-foreground'
                      : unsure.length > 0
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card',
                  )}
                >
                  {flagged.length > 0 ? (
                    <>
                      <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none sm:text-3xl">
                        {topRisk >= STOP_AT
                          ? 'Stop. Do not send anything yet.'
                          : 'Slow down and check this properly.'}
                      </h2>
                      <p className="mt-4 leading-relaxed text-current/90">
                        The most serious thing you answered yes to scores{' '}
                        <span className="font-bold tabular-nums">{topRisk}/10</span>
                        {flagged.length > 1 && `, and there ${flagged.length === 2 ? 'is' : 'are'} ${flagged.length - 1} more below`}
                        .{' '}
                        {topRisk >= STOP_AT
                          ? 'A sign that serious is close to proof on its own, and money sent this way is rarely recoverable.'
                          : 'On its own this is a warning rather than proof, but it is a good reason to verify before anything moves.'}{' '}
                        Talk to somebody you trust first.
                      </p>
                    </>
                  ) : unsure.length > 0 ? (
                    <>
                      <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none sm:text-3xl">
                        Worth checking before you send
                      </h2>
                      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                        Nothing here is a definite warning sign, but you were unsure about{' '}
                        {unsure.length} of them. Being unsure is a good reason to slow down,
                        not to press on. Find out for certain first.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none sm:text-3xl">
                        None of the common warning signs
                      </h2>
                      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                        You answered no to all eight. That is not a guarantee, because this
                        list is not everything and new scams appear constantly. If something
                        still feels wrong, it costs nothing to wait a day and ask somebody
                        you trust.
                      </p>
                    </>
                  )}
                </div>

                {/* Only what they actually flagged, with the reason. Reprinting
                    all eight here would bury the ones that matter. */}
                {(flagged.length > 0 || unsure.length > 0) && (
                  <ul className="mt-6 border-t border-border">
                    {[...flagged, ...unsure].map((q) => (
                      <li key={q.id} className="border-b border-border py-5">
                        <p className="flex flex-wrap items-baseline gap-x-2 text-xs font-bold uppercase tracking-widest">
                          <span
                            aria-hidden
                            className={
                              answers[q.id] === 'yes' ? 'text-primary' : 'text-muted-foreground'
                            }
                          >
                            {answers[q.id] === 'yes' ? '●' : '○'}
                          </span>
                          <span
                            className={
                              answers[q.id] === 'yes' ? 'text-primary' : 'text-muted-foreground'
                            }
                          >
                            {answers[q.id] === 'yes' ? 'You said yes' : 'You were not sure'}
                          </span>
                          <span className="text-muted-foreground">
                            · {riskLabel(q.risk)} · {q.risk}/10
                          </span>
                        </p>
                        <p className="mt-2 font-bold">{q.ask}</p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {q.why}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-6 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                  The risk numbers are our own reading of how strongly each sign points to
                  fraud on its own, drawn from the FTC and CFPB guidance linked here. They
                  are not a published statistic and they are not a measure of your odds of
                  being defrauded. The verdict above follows the most serious thing you
                  answered yes to, not a total, because one sign at ten out of ten is not
                  cancelled out by seven clean answers.
                </p>

                <button
                  onClick={restart}
                  className="mt-6 text-sm font-bold text-primary underline-offset-4 hover:underline"
                >
                  Start again
                </button>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                If money already went
              </p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                <li>
                  Contact your transfer provider immediately and ask them to stop or reverse
                  it.
                </li>
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
