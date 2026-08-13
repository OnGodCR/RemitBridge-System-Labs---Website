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

const reasons = [
  {
    title: 'Book a workshop',
    body: 'If you run a community group, library, or school in King County and want a session, tell us roughly how many people and which languages.',
  },
  {
    title: 'Something here is wrong',
    body: 'Corrections are the most useful mail we get. Point at the page and say what is off, and we will fix it or explain why we think it stands.',
  },
  {
    title: 'Join the lab',
    body: 'Students who want a fellowship should say which team interests them and what they have worked on before.',
  },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const ready = form.name.trim() && form.message.trim()

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
      body: form.message.trim(),
    })

    if (error) {
      setStatus({
        state: 'error',
        message: `That did not send: ${error.message}. You can email us directly instead.`,
      })
      return
    }

    setForm({ name: '', email: '', message: '' })
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
              Goes straight to the lab. A student reads every one, usually within a few
              days.
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
              <span className="mb-1.5 block text-sm font-medium">Message</span>
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

            <p className="mt-4 text-sm text-muted-foreground">
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
              What to write about
            </p>

            <dl className="mt-5 border-t border-border">
              {reasons.map((r) => (
                <div key={r.title} className="border-b border-border py-5">
                  <dt className="font-bold">{r.title}</dt>
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
