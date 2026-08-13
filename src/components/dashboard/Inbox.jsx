import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

/** Contact form submissions. Staff only, enforced by the RLS policy. */
export function Inbox() {
  const [state, setState] = useState({ status: 'loading', rows: [], error: '' })

  const load = () =>
    supabase
      .from('messages')
      .select('id, created_at, name, email, body, handled')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data, error }) =>
        setState({ status: error ? 'error' : 'ready', rows: data ?? [], error: error?.message ?? '' }),
      )

  useEffect(() => {
    load()
  }, [])

  const toggle = async (row) => {
    setState((s) => ({
      ...s,
      rows: s.rows.map((r) => (r.id === row.id ? { ...r, handled: !r.handled } : r)),
    }))
    await supabase.from('messages').update({ handled: !row.handled }).eq('id', row.id)
  }

  if (state.status === 'loading') {
    return <p className="text-sm text-muted-foreground">Loading messages…</p>
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-xl border border-border bg-muted p-4">
        <p className="text-sm font-bold">Could not load messages</p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{state.error}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          If the table is missing, run <code className="font-mono">supabase/schema.sql</code>.
        </p>
      </div>
    )
  }

  if (state.rows.length === 0) {
    return (
      <p className="rounded-xl border border-border py-10 text-center text-sm text-muted-foreground">
        No messages yet.
      </p>
    )
  }

  const unread = state.rows.filter((r) => !r.handled).length

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {state.rows.length} total, {unread} not yet handled
      </p>
      <ul className="space-y-3">
        {state.rows.map((row) => (
          <li
            key={row.id}
            className={cn(
              'rounded-xl border p-4',
              row.handled ? 'border-border bg-muted/50' : 'border-primary/30',
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-bold">
                {row.name}
                {row.email && (
                  <a
                    href={`mailto:${row.email}`}
                    className="ml-2 font-medium text-primary hover:underline"
                  >
                    {row.email}
                  </a>
                )}
              </p>
              <time className="text-xs text-muted-foreground">
                {new Date(row.created_at).toLocaleString()}
              </time>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
              {row.body}
            </p>
            <button
              onClick={() => toggle(row)}
              className="mt-3 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              {row.handled ? 'Mark as not handled' : 'Mark handled'}
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
