import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { posts } from '@/data/blog'
import { papers, statuses as paperStatuses } from '@/data/researchPapers'
import { themeFor } from '@/lib/palette'
import { cn } from '@/lib/utils'

export function Card({ title, note, children, className }) {
  return (
    <section className={cn('rounded-2xl border border-border bg-card p-6', className)}>
      {title && <h2 className="text-xl">{title}</h2>}
      {note && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{note}</p>}
      <div className={title || note ? 'mt-5' : undefined}>{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------- application */

const TEAMS = ['Systems', 'Economics', 'Community education', 'Language and evaluation']

const STEPS = [
  { key: 'submitted', label: 'Application received' },
  { key: 'reading', label: 'A student lead reads it' },
  { key: 'decision', label: 'Decision, either way, by email' },
]

/**
 * Where the tracker sits, from the row's own status. `accepted` and `declined`
 * both finish it: the third step is a decision, not a good outcome.
 */
function stageFor(status) {
  if (status === 'accepted' || status === 'declined') return { at: 2, done: true }
  if (status === 'reading') return { at: 1, done: false }
  return { at: 0, done: false }
}

const OUTCOME = {
  accepted: 'Accepted. Someone will be in touch about what happens next.',
  declined: 'Not this time. Applying again next round is genuinely fine.',
}

export function ApplicationPanel({ userId, role }) {
  const [state, setState] = useState({ status: 'loading', rows: [] })
  const [form, setForm] = useState({ team: TEAMS[0], why: '', experience: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = () =>
    supabase
      .from('fellowship_applications')
      .select('id, created_at, team, status')
      .order('created_at', { ascending: false })
      .then(({ data, error }) =>
        setState({ status: error ? 'error' : 'ready', rows: data ?? [], error: error?.message }),
      )

  useEffect(() => {
    load()
  }, [userId])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.why.trim()) return
    setBusy(true)
    setError('')
    const { error } = await supabase.from('fellowship_applications').insert({
      user_id: userId,
      team: form.team,
      why: form.why.trim(),
      experience: form.experience.trim() || null,
    })
    setBusy(false)
    if (error) return setError(error.message)
    setForm({ team: TEAMS[0], why: '', experience: '' })
    load()
  }

  if (role !== 'member') {
    return (
      <Card title="You're on the team" note={`Your role is ${role}. Nothing to apply for.`}>
        <Link to="/fellowships" className="text-sm font-bold text-primary hover:underline">
          What each team works on
        </Link>
      </Card>
    )
  }

  if (state.status === 'loading') {
    return <Card>Loading your application…</Card>
  }

  if (state.status === 'error') {
    return (
      <Card title="Could not load your application">
        <p className="font-mono text-xs text-muted-foreground">{state.error}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          If the table is missing, run <code className="font-mono">supabase/schema.sql</code>.
        </p>
      </Card>
    )
  }

  if (state.rows.length > 0) {
    return (
      <Card
        title="Your application"
        note="One student lead reads every application. We reply either way."
      >
        {state.rows.map((row) => (
          <div key={row.id} className="mb-6 last:mb-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-bold">{row.team}</p>
              <p className="text-sm text-muted-foreground">
                sent {new Date(row.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Where it is, and what happens next. */}
            <ol className="mt-4 space-y-3">
              {STEPS.map((step, i) => {
                const stage = stageFor(row.status)
                const done = i < stage.at || (i === stage.at && stage.done)
                const current = i === stage.at && !stage.done
                return (
                  <li key={step.key} className="flex items-start gap-3">
                    <span
                      className={cn(
                        'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold',
                        done && 'border-primary bg-primary text-primary-foreground',
                        current && 'border-primary text-primary',
                        !done && !current && 'border-border text-muted-foreground',
                      )}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span
                      className={cn(
                        'text-sm leading-relaxed',
                        done || current ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {step.label}
                      {current && (
                        <span className="ml-2 text-xs font-bold text-primary">in progress</span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ol>

            {OUTCOME[row.status] && (
              <p className="mt-4 rounded-xl bg-muted p-3 text-sm leading-relaxed">
                {OUTCOME[row.status]}
              </p>
            )}
          </div>
        ))}
      </Card>
    )
  }

  return (
    <Card
      title="Apply for a fellowship"
      note="Four teams. Pick one and say why. There is no form letter we are looking for."
    >
      <form onSubmit={submit}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Team</span>
          <select
            value={form.team}
            onChange={(e) => setForm((f) => ({ ...f, team: e.target.value }))}
            className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {TEAMS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">Why this team?</span>
          <textarea
            rows={4}
            required
            value={form.why}
            onChange={(e) => setForm((f) => ({ ...f, why: e.target.value }))}
            className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">
            Anything you have worked on{' '}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </span>
          <textarea
            rows={3}
            value={form.experience}
            onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
            className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>

        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !form.why.trim()}
          className={cn(buttonVariants({ size: 'lg' }), 'mt-5', busy && 'opacity-50')}
        >
          {busy ? 'Sending…' : 'Submit application'}
        </button>
      </form>
    </Card>
  )
}

/* ----------------------------------------------------------------- profile */

export function ProfilePanel({ user, profile, onSaved }) {
  const [form, setForm] = useState({
    name: profile?.full_name ?? '',
    bio: profile?.bio ?? '',
    listed: profile?.directory_opt_in ?? false,
  })
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setStatus('')
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.name.trim() || null,
        bio: form.bio.trim() || null,
        directory_opt_in: form.listed,
      })
      .eq('id', user.id)
    setBusy(false)
    setStatus(error ? error.message : 'Saved.')
    if (!error) onSaved?.()
  }

  const resetPassword = async () => {
    setStatus('')
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/sign-in`,
    })
    setStatus(error ? error.message : `Password reset link sent to ${user.email}.`)
  }

  return (
    <Card title="Your account">
      <form onSubmit={save}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Display name</span>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoComplete="name"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <Input value={user.email} readOnly className="bg-muted text-muted-foreground" />
          <span className="mt-1.5 block text-xs text-muted-foreground">
            Changing this needs a confirmation from both addresses, so we handle it by
            request rather than in the browser.
          </span>
        </label>

        {/* Read-only on purpose: which team someone is on is a claim the lab
            makes about them, so the database will not accept it from them. */}
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">Team</span>
          <Input
            value={profile?.team ?? 'Not on a team yet'}
            readOnly
            className="bg-muted text-muted-foreground"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">
            Short bio <span className="font-normal text-muted-foreground">(optional)</span>
          </span>
          <textarea
            rows={3}
            maxLength={300}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="A sentence or two about what you work on."
            className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <span className="mt-1.5 block text-xs text-muted-foreground">
            {300 - form.bio.length} characters left
          </span>
        </label>

        {/* Off by default. Being on a team and agreeing to be named publicly
            are separate decisions, and most of the lab is under eighteen. */}
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
          <input
            type="checkbox"
            checked={form.listed}
            onChange={(e) => setForm((f) => ({ ...f, listed: e.target.checked }))}
            className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
          />
          <span>
            <span className="block text-sm font-medium">List me on the team page</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              Shows your name, team and bio to anyone visiting the site. Your email is
              never shown. Off unless you turn it on, and you can turn it off again.
            </span>
          </span>
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className={cn(buttonVariants({ size: 'lg' }), busy && 'opacity-50')}
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={resetPassword}
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Send password reset
          </button>
        </div>

        {status && (
          <p role="status" className="mt-3 text-sm text-muted-foreground">
            {status}
          </p>
        )}
      </form>
    </Card>
  )
}

/* -------------------------------------------------------------- onboarding */

/**
 * Four things worth doing after signing up.
 *
 * Every step is derived from state that already exists rather than stored as a
 * checklist, so it cannot drift out of sync with the thing it describes. Once
 * all four are done the panel takes itself off the page.
 */
export function OnboardingPanel({ profile, hasApplication, onGoToAccount }) {
  const steps = [
    {
      done: Boolean(profile?.full_name?.trim()),
      label: 'Add your name',
      note: 'So an application is not from an email address.',
      action: { label: 'Open account settings', onClick: onGoToAccount },
    },
    {
      done: hasApplication,
      label: 'Apply for a team',
      note: 'The panel on this page. Four teams, one paragraph.',
    },
    {
      done: Boolean(profile?.bio?.trim()),
      label: 'Write a one-line bio',
      note: 'Used on the team page if you choose to be listed.',
      action: { label: 'Open account settings', onClick: onGoToAccount },
    },
    {
      done: false,
      label: 'Read something before you apply',
      note: 'The cost post is the shortest way into what the lab argues.',
      action: { label: 'Read it', to: '/blog/the-advertised-fee-is-not-the-price' },
      optional: true,
    },
  ]

  const required = steps.filter((s) => !s.optional)
  if (required.every((s) => s.done)) return null

  const doneCount = required.filter((s) => s.done).length

  return (
    <Card
      title="Getting set up"
      note={`${doneCount} of ${required.length} done. None of it takes long.`}
      className="lg:col-span-2"
    >
      <ol className="grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <li
            key={step.label}
            className={cn(
              'rounded-xl border p-4',
              step.done ? 'border-primary/40 bg-primary/5' : 'border-border',
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold',
                  step.done
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground',
                )}
                aria-hidden
              >
                {step.done ? '✓' : ''}
              </span>
              <div>
                <p className={cn('text-sm font-bold', step.done && 'text-muted-foreground')}>
                  {step.label}
                  {step.optional && (
                    <span className="ml-2 font-normal text-muted-foreground">optional</span>
                  )}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.note}</p>
                {!step.done && step.action && (
                  step.action.to ? (
                    <Link
                      to={step.action.to}
                      className="mt-2 inline-block text-sm font-bold text-primary hover:underline"
                    >
                      {step.action.label}
                    </Link>
                  ) : (
                    <button
                      onClick={step.action.onClick}
                      className="mt-2 text-sm font-bold text-primary hover:underline"
                    >
                      {step.action.label}
                    </button>
                  )
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}

/* ---------------------------------------------------------------- activity */

export function ActivityPanel() {
  const written = posts.filter((p) => p.body).slice(0, 4)
  const inProgress = papers.filter((p) => p.status !== 'published').length

  return (
    <Card title="What's moved lately" note="The most recent things published on the site.">
      <ul className="space-y-3">
        {written.map((p) => {
          const theme = themeFor(p.series)
          return (
            <li key={p.id}>
              <Link
                to={`/blog/${p.slug}`}
                className="flex items-start gap-3 rounded-xl border border-border p-3 hover:bg-muted"
              >
                <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', theme.bar)} aria-hidden />
                <span>
                  <span className="block text-sm font-medium leading-snug">{p.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {p.seriesName}, {p.readTime}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        {inProgress} research {inProgress === 1 ? 'paper' : 'papers'} in progress.{' '}
        <Link to="/papers" className="font-bold text-primary hover:underline">
          See the list
        </Link>
      </p>
    </Card>
  )
}

/* -------------------------------------------------------------- staff work */

export function WritingPanel() {
  const drafts = posts.filter((p) => !p.body)
  const written = posts.filter((p) => p.body)

  return (
    <Card
      title="Writing"
      note={`${written.length} of ${posts.length} posts have a full body. The rest are summaries waiting on someone.`}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {[
          { heading: 'Needs writing', items: drafts.slice(0, 6), muted: true },
          { heading: 'Published', items: written, muted: false },
        ].map((col) => (
          <div key={col.heading}>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {col.heading} ({col.heading === 'Needs writing' ? drafts.length : written.length})
            </p>
            <ul className="mt-3 space-y-2">
              {col.items.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/blog/${p.slug}`}
                    className={cn(
                      'block rounded-xl border border-border p-3 text-sm leading-snug hover:bg-muted',
                      col.muted && 'text-muted-foreground',
                    )}
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-muted p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Post bodies live in <code className="font-mono">src/data/postBodies.jsx</code>,
          keyed by post id. An in-browser editor needs a posts table and an upload bucket,
          which is a separate piece of work from signing in.
        </p>
      </div>
    </Card>
  )
}

export function PapersPanel() {
  return (
    <Card title="Research papers" note="Long-form work and how far along each one is.">
      <ul className="space-y-2">
        {papers.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-border p-3"
          >
            <span className="text-sm font-medium">{p.title}</span>
            <span className="text-xs text-muted-foreground">
              {paperStatuses[p.status].label}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
