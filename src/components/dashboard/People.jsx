import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ROLE_LABEL, ROLE_RANK, assignableRoles, rankOf } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Card } from './Panels'

/* Highest first, so the list reads as a ladder from the top down. */
const LADDER = Object.keys(ROLE_RANK).sort((a, b) => ROLE_RANK[b] - ROLE_RANK[a])

const WHAT_EACH_ROLE_CAN_DO = {
  owner: 'Everything, including managing admins. One person, set in the database.',
  admin: 'Manages everyone below them and reviews applications.',
  editor: 'Publishes posts and reads the contact inbox.',
  writer: 'Writes and edits their own drafts.',
  member: 'Can apply for a fellowship. Nothing else.',
}

/**
 * Admin and owner only. Everyone starts as a member; this is where that changes.
 *
 * The select only offers roles below the signed-in person's own, and rows at or
 * above them are locked, which mirrors the "manage people below you" policy. The
 * database is what actually enforces it: an admin cannot promote themselves, nor
 * touch another admin or the owner, whatever this component renders.
 */
export function People({ myId, profile }) {
  const [state, setState] = useState({ status: 'loading', rows: [], error: '' })

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: true })
      .then(({ data, error }) =>
        setState({
          status: error ? 'error' : 'ready',
          rows: data ?? [],
          error: error?.message ?? '',
        }),
      )
  }, [])

  const setRole = async (row, role) => {
    const previous = row.role
    setState((s) => ({
      ...s,
      error: '',
      rows: s.rows.map((r) => (r.id === row.id ? { ...r, role } : r)),
    }))
    const { error } = await supabase.from('profiles').update({ role }).eq('id', row.id)
    if (error) {
      // Put the old value back rather than leaving the screen claiming a change
      // the database refused.
      setState((s) => ({
        ...s,
        error: error.message,
        rows: s.rows.map((r) => (r.id === row.id ? { ...r, role: previous } : r)),
      }))
    }
  }

  if (state.status === 'loading') return <Card>Loading people…</Card>

  const myRank = rankOf(profile)

  return (
    <Card
      title={`People (${state.rows.length})`}
      note="You can only change someone whose role sits below your own, and never your own."
    >
      {state.error && (
        <p role="alert" className="mb-4 font-mono text-xs text-destructive">
          {state.error}
        </p>
      )}

      <ul className="space-y-2">
        {state.rows.map((row) => {
          const options = assignableRoles({ ...profile, id: myId }, row)
          const locked = options.length === 0
          const isMe = row.id === myId

          return (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {row.full_name || row.email || row.id.slice(0, 8)}
                  {isMe && <span className="ml-2 text-xs text-muted-foreground">you</span>}
                </p>
                {row.email && (
                  <p className="truncate text-xs text-muted-foreground">{row.email}</p>
                )}
              </div>

              {locked ? (
                <span
                  title={
                    isMe
                      ? 'You cannot change your own role'
                      : `Only someone above ${ROLE_LABEL[row.role]} can change this`
                  }
                  className={cn(
                    'text-xs font-bold uppercase tracking-widest',
                    rankOf(row) >= ROLE_RANK.owner ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {ROLE_LABEL[row.role] ?? row.role}
                </span>
              ) : (
                <select
                  value={row.role}
                  onChange={(e) => setRole(row, e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
                >
                  {options.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              )}
            </li>
          )
        })}
      </ul>

      {/* The ladder itself, so nobody has to infer it from the dropdown. */}
      <dl className="mt-8 border-t border-border pt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          What each role can do
        </p>
        {LADDER.map((r) => (
          <div
            key={r}
            className={cn(
              'flex flex-wrap gap-x-4 gap-y-1 border-b border-border py-3 last:border-b-0',
              ROLE_RANK[r] > myRank && 'opacity-50',
            )}
          >
            <dt className="w-24 shrink-0 font-bold">{ROLE_LABEL[r]}</dt>
            <dd className="flex-1 text-sm leading-relaxed text-muted-foreground">
              {WHAT_EACH_ROLE_CAN_DO[r]}
              {ROLE_RANK[r] > myRank && (
                <span className="ml-1 italic">Above you, so not yours to assign.</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
