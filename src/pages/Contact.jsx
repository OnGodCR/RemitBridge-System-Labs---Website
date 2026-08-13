import { useState } from 'react'
import { Link } from 'react-router-dom'
import Section, { PageHeader } from '@/components/Section'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { supabase, backendEnabled } from '@/lib/supabase'
import { cn } from '@/lib/utils'

/** Replace with the lab's real address. */
export const contactEmail = 'hello@remitbridge.org'

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
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        intro="Questions, corrections, workshop requests, or wanting to join — all of it goes to the same inbox and a student reads it."
      />

      <Section>
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

          <aside className="space-y-4">
            {reasons.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border border-border bg-muted p-5"
              >
                <h3 className="text-lg">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {r.body}
                </p>
              </div>
            ))}

            <p className="px-1 text-sm leading-relaxed text-muted-foreground">
              Writing for the lab already?{' '}
              <Link to="/write" className="font-bold text-primary hover:underline">
                Go to the writers area
              </Link>
              .
            </p>
          </aside>
        </div>
      </Section>
    </>
  )
}
