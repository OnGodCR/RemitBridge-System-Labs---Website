import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { terms } from '@/data/glossary'
import { cn } from '@/lib/utils'

const byId = new Map(terms.map((t) => [t.id, t]))

/**
 * A word in the prose that carries its definition with it.
 *
 * The definitions are the glossary's, not the post's. A post that defines
 * "Nostro account" in its own words is a second definition to keep in sync,
 * and the glossary exists precisely so there is only ever one.
 *
 * An id with no matching term renders as ordinary text rather than as an
 * underlined word with nothing behind it: the underline is a promise.
 */
export default function GlossaryTerm({ id, children, theme }) {
  const term = byId.get(id)
  if (!term) return <>{children}</>
  return (
    <TermTip term={term} theme={theme}>
      {children}
    </TermTip>
  )
}

function TermTip({ term, theme, children }) {
  const [pos, setPos] = useState(null)
  const anchor = useRef(null)
  const tipId = useId()

  /*
   * Fixed position, measured and clamped, rather than an absolutely
   * positioned child. An absolute child near the right edge widens the
   * document and puts a horizontal scrollbar on the whole page, which is the
   * one thing the 320px pass is checking for.
   */
  const place = useCallback(() => {
    const r = anchor.current?.getBoundingClientRect()
    if (!r) return
    const width = Math.min(288, window.innerWidth - 24)
    const left = Math.max(12, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 12))
    // Flip above once the word sits low enough that the card would run off.
    const above = r.bottom > window.innerHeight * 0.6
    setPos({ left, width, above, top: above ? r.top - 8 : r.bottom + 8 })
  }, [])

  const close = useCallback(() => setPos(null), [])

  useEffect(() => {
    if (!pos) return
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    // Scrolling repositions, because hovering a word and nudging the page is
    // ordinary. Resizing closes: a rotate can move the anchor far enough that
    // a recomputed card is more startling than one that simply went away.
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', close)
    }
  }, [pos, place, close])

  return (
    <>
      {/* A button, not a span with a title: a title attribute never appears
          for keyboard or touch, which is most of the people this is for. */}
      <button
        ref={anchor}
        type="button"
        aria-expanded={!!pos}
        aria-describedby={pos ? tipId : undefined}
        onMouseEnter={place}
        onMouseLeave={close}
        onFocus={place}
        onBlur={close}
        onClick={() => (pos ? close() : place())}
        className={cn(
          'cursor-help rounded-sm underline decoration-dotted decoration-from-font underline-offset-4 outline-none transition-colors',
          'hover:decoration-solid focus-visible:ring-3 focus-visible:ring-ring/50',
          theme?.ink ?? 'text-primary',
          'font-medium',
        )}
      >
        {children}
      </button>

      {pos && (
        <span
          id={tipId}
          role="tooltip"
          style={{
            left: pos.left,
            top: pos.top,
            width: pos.width,
            transform: pos.above ? 'translateY(-100%)' : undefined,
          }}
          className="fixed z-50 block rounded-2xl border border-border bg-card p-4 text-left shadow-lg"
        >
          <span className="block text-sm font-bold">{term.term}</span>
          <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
            {term.plain}
          </span>
          <Link
            to={`/glossary#${term.id}`}
            className="mt-2.5 inline-block text-xs font-bold text-primary hover:underline"
          >
            All {terms.length} terms
          </Link>
        </span>
      )}
    </>
  )
}
