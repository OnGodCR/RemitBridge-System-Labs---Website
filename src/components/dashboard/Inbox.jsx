import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

/* Mirrors the select on the contact page. Older messages have no topic, which
   is why every use is guarded rather than defaulted to something invented. */
const TOPIC_LABEL = {
  workshop: 'Book a workshop',
  correction: 'Something is wrong',
  join: 'Join the lab',
  research: 'Research or partnership',
  other: 'Something else',
}

/** Contact form submissions. Staff only, enforced by the RLS policy. */
export function Inbox() {
  const [state, setState] = useState({ status: 'loading', rows: [], error: '' })
  const [confirming, setConfirming] = useState(null)

  const load = () =>
    supabase
      .from('messages')
      .select('id, created_at, name, email, body, handled, topic')
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

  const remove = async (row) => {
    setConfirming(null)
    const { error } = await supabase.from('messages').delete().eq('id', row.id)
    if (error) {
      // Most likely the delete policy is missing, which is a schema.sql re-run.
      setState((s) => ({ ...s, error: error.message, status: 'error' }))
      return
    }
    setState((s) => ({ ...s, rows: s.rows.filter((r) => r.id !== row.id) }))
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
              {row.topic && (
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {TOPIC_LABEL[row.topic] ?? row.topic}
                </span>
              )}
              <time className="text-xs text-muted-foreground">
                {new Date(row.created_at).toLocaleString()}
              </time>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
              {row.body}
            </p>
            <div className="mt-3 flex items-center gap-4">
              <button
                onClick={() => toggle(row)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                {row.handled ? 'Mark as not handled' : 'Mark handled'}
              </button>

              {/* Two taps rather than a confirm dialog. A message is somebody
                  writing in, and there is no undo once it is gone. */}
              {confirming === row.id ? (
                <>
                  <button
                    onClick={() => remove(row)}
                    className="text-xs font-bold text-destructive hover:underline"
                  >
                    Delete for good
                  </button>
                  <button
                    onClick={() => setConfirming(null)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    Keep it
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirming(row.id)}
                  className="text-xs font-bold text-muted-foreground hover:text-destructive"
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
