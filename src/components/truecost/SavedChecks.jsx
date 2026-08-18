import { useEffect, useState } from 'react'
import { loadChecks, removeCheck } from '@/lib/savedChecks'

const num = (n, dp = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
    : '—'

/**
 * The checks kept on this device, oldest to newest in the chart so time runs
 * the way a reader expects, newest first in the list so the latest is at hand.
 *
 * Renders nothing at all until something is saved: an empty archive under the
 * calculator would be one more box explaining itself for no one.
 */
export default function SavedChecks() {
  const [rows, setRows] = useState(loadChecks)

  // The save button lives inside the checker's result panel. An event keeps
  // the two in sync without threading state through five components.
  useEffect(() => {
    const refresh = () => setRows(loadChecks())
    window.addEventListener('truecost:saved', refresh)
    return () => window.removeEventListener('truecost:saved', refresh)
  }, [])

  if (rows.length === 0) return null

  const chron = [...rows].reverse()
  const costs = chron.map((r) => r.totalCostPct)
  const min = Math.min(...costs)
  const max = Math.max(...costs)

  // Flat guard: a single check, or identical costs, has no shape to draw.
  const W = 600
  const H = 120
  const PAD = 8
  const span = max - min || 1
  const points = chron
    .map((r, i) => {
      const x = chron.length === 1 ? W / 2 : PAD + (i / (chron.length - 1)) * (W - 2 * PAD)
      const y = PAD + (1 - (r.totalCostPct - min) / span) * (H - 2 * PAD)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <div className="mt-10 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl">Your saved checks</h3>
        <p className="text-xs text-muted-foreground">
          Kept on this device only. Never sent anywhere, and they do not follow you to
          another device.
        </p>
      </div>

      {rows.length > 1 && (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Total cost across {rows.length} checks, oldest to newest. Lowest{' '}
            <span className="font-bold tabular-nums text-foreground">{num(min)}%</span>,
            highest{' '}
            <span className="font-bold tabular-nums text-foreground">{num(max)}%</span>.
          </p>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mt-3 h-24 w-full"
            aria-hidden
            preserveAspectRatio="none"
          >
            <polyline
              points={points}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </>
      )}

      <ul className="mt-4 border-t border-border">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border py-3 text-sm"
          >
            <time className="tabular-nums text-muted-foreground">
              {new Date(r.savedAt).toLocaleDateString()}
            </time>
            <span className="font-bold">
              {r.from} → {r.to}
            </span>
            <span className="tabular-nums">{num(r.sent)} sent</span>
            <span className="tabular-nums font-bold text-primary">
              {num(r.totalCostPct)}% total cost
            </span>
            <button
              onClick={() => {
                removeCheck(r.id)
                window.dispatchEvent(new Event('truecost:saved'))
              }}
              className="ml-auto text-xs font-bold text-muted-foreground hover:text-destructive"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
