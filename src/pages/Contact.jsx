import { useState } from 'react'
import { Link } from 'react-router-dom'
import Section from '@/components/Section'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { supabase, backendEnabled } from '@/lib/supabase'
import { cn } from '@/lib/utils'

/**
 * The lab's address, shown on the page as a fallback for anyone who would
 * rather use their own mail client than the form. A shared lab address, not a
 * personal one, which is why it is fine in a public repo.
 */
export const contactEmail = 'remitbridgesystemlabs@gmail.com'

/*
 * One list, used twice: as the options in the select and as the guidance
 * beside the form. They were previously two different lists sitting next to
 * each other, which read as five reasons rather than the same three.
 *
 * `value` is stored on the row and constrained by the database, so the
 * dashboard can sort the inbox without matching on prose.
 */
const topics = [
  {
    value: 'workshop',
    label: 'Book a workshop',
    body: 'If you run a community group, library, or school in King County and want a session, tell us roughly how many people and which languages.',
  },
  {
    value: 'correction',
    label: 'Report something wrong on this site',
    body: 'Corrections are the most useful mail we get. Point at the page and say what is off, and we will fix it or explain why we think it stands. Every change gets logged publicly.',
  },
  {
    value: 'join',
    label: 'Join the lab',
    body: 'Students who want a fellowship should say which team interests them and what they have worked on before.',
  },
  {
    value: 'research',
    label: 'Research or partnership',
    body: 'Researchers, nonprofits and anyone wanting to use or check the work. Say what you are working on.',
  },
  {
    value: 'other',
    label: 'Something else',
    body: 'Anything that does not fit the list above.',
  },
]

/*
 * Languages a message can be written in.
 *
 * Deliberately not the six the workshop material is planned in: those handouts
 * are not written yet, and a language nobody can currently read a reply in
 * would be a promise the lab cannot keep this week.
 */
const LANGUAGES = 'English, Hindi, Punjabi or Spanish'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const ready = form.name.trim() && form.topic && form.message.trim()

  /*
   * Writes straight to the messages table. The row-level security policy lets
   * anonymous visitors insert but never read, so a sender cannot see anyone
   * else's message. Length limits are enforced by the database, not just here.
   */
  const submit = async (e) => {
    e.preventDefault()
    if (!ready || !backendEnabled) return
    setStatus({ state: 'working', message: '' })

    const { error } = await supabase.from('messages').insert({
      name: form.name.trim(),
      email: form.email.trim() || null,
      topic: form.topic,
      body: form.message.trim(),
    })

    if (error) {
      setStatus({
        state: 'error',
        message: `That did not send: ${error.message}. You can email us directly instead.`,
      })
      return
    }

    setForm({ name: '', email: '', topic: '', message: '' })
    setStatus({ state: 'sent', message: 'Thanks — that reached us. We read everything.' })
  }

  return (
    <>
      {/* No standing header. The form is the page, so it opens on the form. */}
      <Section className="pt-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:items-start">
          <form onSubmit={submit}>
            <h2 className="text-2xl">Send a message</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Goes straight to the lab, where a student reads it. We have not measured how
              long replies take yet, so there is no response time promised here. Once it is
              being tracked it will appear on{' '}
              <Link to="/impact" className="font-medium text-primary hover:underline">
                what we measure
              </Link>
              .
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Your name</span>
                <Input value={form.name} onChange={set('name')} autoComplete="name" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Email <span className="font-normal text-muted-foreground">(optional)</span>
                </span>
                <Input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium">What is this about?</span>
              <select
                value={form.topic}
                onChange={set('topic')}
                required
                className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="" disabled>
                  Pick the closest one
                </option>
                {topics.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium">Message</span>
              <span className="mb-2 block text-sm text-muted-foreground">
                Write in {LANGUAGES}. Anything else still reaches us and we will find someone
                to read it, which takes longer.
              </span>
              <textarea
                value={form.message}
                onChange={set('message')}
                rows={7}
                className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>

            {status.state === 'sent' ? (
              <p
                role="status"
                className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm font-medium text-primary"
              >
                {status.message}
              </p>
            ) : (
              <>
                {status.state === 'error' && (
                  <p role="alert" className="mt-6 text-sm text-destructive">
                    {status.message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!ready || status.state === 'working'}
                  className={cn(
                    buttonVariants({ size: 'hero' }),
                    'mt-6',
                    (!ready || status.state === 'working') && 'opacity-50',
                  )}
                >
                  {status.state === 'working' ? 'Sending…' : 'Send message'}
                </button>
              </>
            )}

            <div className="mt-8 border-t border-border pt-6">
              <p className="max-w-xl text-sm leading-relaxed">
                <span className="font-bold">Messages here are read by students.</span> Keep
                out account numbers, identity documents, and anything you would not want a
                student volunteer to read. We do not need any of it to answer a question.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                If money has gone missing or you are in urgent trouble over a transfer, do
                not wait on a reply from us. Contact your provider first, and then the{' '}
                <a
                  href="https://www.consumerfinance.gov/complaint/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  Consumer Financial Protection Bureau
                </a>
                , who take complaints about money transfers and can act on them. We are a
                student research lab and cannot recover money or intervene with a company.
              </p>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Or write to{' '}
              <a href={`mailto:${contactEmail}`} className="font-bold text-primary hover:underline">
                {contactEmail}
              </a>{' '}
              directly.
            </p>
          </form>

          {/*
            A divided list, not a stack of cards.

            Three rounded boxes floating one above another gave each note a
            frame it did not need and made the column louder than the form it
            sits next to. Rules do the same separating with nothing drawn.
            Same pattern as the index on the home page.
          */}
          <aside>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              What each option is for
            </p>

            <dl className="mt-5 border-t border-border">
              {topics.map((r) => (
                <div key={r.value} className="border-b border-border py-5">
                  <dt className="font-bold">{r.label}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {r.body}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Writing for the lab already?{' '}
              <Link to="/dashboard" className="font-bold text-primary hover:underline">
                Go to your dashboard
              </Link>
              .
            </p>
          </aside>
        </div>
      </Section>
    </>
  )
}
