import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from './Panels'

const ROLES = ['member', 'writer', 'editor', 'admin']

/**
 * Admin only. Everyone starts as a member; this is where that changes.
 *
 * The database refuses these writes for anyone who is not an admin, and refuses
 * self-promotion for everyone, so hiding this panel is convenience rather than
 * the actual protection.
 */
export function People({ myId }) {
  const [state, setState] = useState({ status: 'loading', rows: [], error: '' })

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: true })
      .then(({ data, error }) =>
        setState({ status: error ? 'error' : 'ready', rows: data ?? [], error: error?.message ?? '' }),
      )
  }, [])

  const setRole = async (row, role) => {
    setState((s) => ({ ...s, rows: s.rows.map((r) => (r.id === row.id ? { ...r, role } : r)) }))
    const { error } = await supabase.from('profiles').update({ role }).eq('id', row.id)
    if (error) setState((s) => ({ ...s, error: error.message }))
  }

  if (state.status === 'loading') {
    return <Card>Loading people…</Card>
  }

  return (
    <Card
      title={`People (${state.rows.length})`}
      note="Members can only apply. Writers get the post list, editors also get the inbox, admins can change roles here."
    >
      {state.error && (
        <p role="alert" className="mb-4 font-mono text-xs text-destructive">
          {state.error}
        </p>
      )}
      <ul className="space-y-2">
        {state.rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {row.full_name || row.email || row.id.slice(0, 8)}
                {row.id === myId && (
                  <span className="ml-2 text-xs text-muted-foreground">you</span>
                )}
              </p>
              {row.email && (
                <p className="truncate text-xs text-muted-foreground">{row.email}</p>
              )}
            </div>
            <select
              value={row.role}
              onChange={(e) => setRole(row, e.target.value)}
              disabled={row.id === myId}
              title={row.id === myId ? 'You cannot change your own role' : undefined}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </Card>
  )
}
