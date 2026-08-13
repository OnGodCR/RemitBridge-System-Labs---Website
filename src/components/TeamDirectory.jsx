import { useEffect, useState } from 'react'
import Section from '@/components/Section'
import { supabase, backendEnabled } from '@/lib/supabase'

const ROLE_LABEL = {
  owner: 'Lab lead',
  admin: 'Admin',
  editor: 'Editor',
  writer: 'Researcher',
  member: 'Member',
}

/**
 * Everyone who has opted into being listed, read from the `directory` view.
 *
 * The view is the reason this is safe to load without signing in: it exposes
 * four columns and only rows that ticked the box, so no email address and no
 * unlisted account can come back through it.
 *
 * Renders nothing at all when the list is empty, so a new install shows the
 * hand-written roles above and no gap where a list should be.
 */
export default function TeamDirectory() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!backendEnabled) return
    let cancelled = false
    supabase
      .from('directory')
      .select('id, full_name, team, bio, role')
      .order('full_name')
      .then(({ data }) => {
        if (!cancelled) setRows(data ?? [])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (rows.length === 0) return null

  // Grouped by team, with anyone not on one yet last.
  const teams = [...new Set(rows.map((r) => r.team).filter(Boolean))].sort()
  const groups = [
    ...teams.map((team) => ({ team, people: rows.filter((r) => r.team === team) })),
    { team: 'Elsewhere in the lab', people: rows.filter((r) => !r.team) },
  ].filter((g) => g.people.length > 0)

  return (
    <Section tone="card" title="Members">
      <p className="mb-10 max-w-3xl leading-relaxed text-muted-foreground">
        Everyone here chose to be listed. Being on a team and being named on the site are
        separate decisions, so this is not the whole lab.
      </p>

      <div className="space-y-10">
        {groups.map((group) => (
          <div key={group.team}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
              {group.team}
            </h3>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.people.map((person) => (
                <li key={person.id} className="rounded-2xl border border-border bg-muted p-5">
                  <p className="font-bold">{person.full_name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {ROLE_LABEL[person.role] ?? 'Member'}
                  </p>
                  {person.bio && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {person.bio}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}
