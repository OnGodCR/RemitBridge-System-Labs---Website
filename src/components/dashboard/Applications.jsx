import { useEffect, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'
import { cn } from '@/lib/utils'

const STATUSES = [
  { id: 'submitted', label: 'New' },
  { id: 'reading', label: 'Being read' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'declined', label: 'Declined' },
]

const TONE = {
  submitted: 'border-primary bg-primary/10 text-primary',
  reading: 'border-border bg-muted text-foreground',
  accepted: 'border-primary bg-primary text-primary-foreground',
  declined: 'border-border bg-card text-muted-foreground',
}

/**
 * Triage for fellowship applications.
 *
 * Applicants have no UPDATE policy on this table, so every status here was set
 * by a member of staff. Accepting also puts the person on the team, and for an
 * admin it grants writing access at the same time, because otherwise "accepted"
 * means nothing changes for them.
 */
export function Applications({ profile, myId }) {
  const [rows, setRows] = useState(null)
  const [people, setPeople] = useState({})
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('submitted')
  const [busy, setBusy] = useState('')

  const load = async () => {
    const { data, error } = await supabase
      .from('fellowship_applications')
      .select('id, created_at, team, why, experience, status, user_id, reviewed_at, review_note')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      setRows([])
      return
    }
    setRows(data)

    // Fetched separately rather than as an embedded join: the foreign key on
    // this table points at auth.users, which PostgREST cannot reach into.
    const ids = [...new Set(data.map((r) => r.user_id))]
    if (ids.length === 0) return setPeople({})
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, team')
      .in('id', ids)
    setPeople(Object.fromEntries((profiles ?? []).map((p) => [p.id, p])))
  }

  useEffect(() => {
    load()
  }, [])

  const decide = async (row, status) => {
    setBusy(row.id)
    setError('')

    const { error: appError } = await supabase
      .from('fellowship_applications')
      .update({ status, reviewed_by: myId, reviewed_at: new Date().toISOString() })
      .eq('id', row.id)

    if (appError) {
      setBusy('')
      return setError(appError.message)
    }

    if (status === 'accepted') {
      const person = people[row.user_id]
      const patch = { team: row.team }
      // Only an admin's update passes the role check in the policy, and a
      // person already above 'writer' should not be demoted by being accepted.
      if (isAdmin(profile) && person?.role === 'member') patch.role = 'writer'
      const { error: profileError } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', row.user_id)
      if (profileError) setError(`Status saved, but the profile did not update: ${profileError.message}`)
    }

    setBusy('')
    load()
  }

  if (rows === null) return <p className="text-sm text-muted-foreground">Loading applications…</p>

  const counts = Object.fromEntries(
    STATUSES.map((s) => [s.id, rows.filter((r) => r.status === s.id).length]),
  )
  const shown = rows.filter((r) => r.status === filter)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              filter === s.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {s.label} ({counts[s.id] ?? 0})
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          {filter === 'submitted'
            ? 'Nothing waiting. Anything new will show up here.'
            : 'Nothing in this pile.'}
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {shown.map((row) => {
            const person = people[row.user_id]
            return (
              <li key={row.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="font-bold">{person?.full_name ?? 'Name not given'}</p>
                    <p className="text-sm text-muted-foreground">
                      {person?.email ?? 'no email on the profile'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest',
                        TONE[row.status],
                      )}
                    >
                      {row.team}
                    </span>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      sent {new Date(row.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Why this team
                </p>
                <p className="mt-2 whitespace-pre-line leading-relaxed">{row.why}</p>

                {row.experience && (
                  <>
                    <p className="mt-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      What they have worked on
                    </p>
                    <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">
                      {row.experience}
                    </p>
                  </>
                )}

                <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
                  {row.status !== 'reading' && row.status !== 'accepted' && (
                    <button
                      onClick={() => decide(row, 'reading')}
                      disabled={busy === row.id}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      Mark as being read
                    </button>
                  )}
                  {row.status !== 'accepted' && (
                    <button
                      onClick={() => decide(row, 'accepted')}
                      disabled={busy === row.id}
                      className={cn(buttonVariants({ size: 'sm' }), busy === row.id && 'opacity-50')}
                    >
                      {busy === row.id ? 'Saving…' : 'Accept'}
                    </button>
                  )}
                  {row.status !== 'declined' && (
                    <button
                      onClick={() => decide(row, 'declined')}
                      disabled={busy === row.id}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'sm' }),
                        'text-muted-foreground',
                      )}
                    >
                      Decline
                    </button>
                  )}
                  {row.reviewed_at && (
                    <span className="ml-auto self-center text-xs text-muted-foreground">
                      last changed {new Date(row.reviewed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {row.status === 'accepted' && (
                  <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                    On the {row.team} team
                    {isAdmin(profile)
                      ? ', with writing access. Email them to say so, the site does not.'
                      : '. An admin still has to grant writing access in People.'}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
