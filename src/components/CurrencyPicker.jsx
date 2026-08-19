import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { currencyFlag } from '@/lib/currencyFlag'
import { cn } from '@/lib/utils'

/*
 * Pick a currency out of a hundred and sixty-five.
 *
 * This replaced a native select, which is not a decision to take lightly: a
 * select is keyboard accessible for free, and on a phone it opens the system
 * picker. What it cannot do is search. Finding Guatemalan quetzal in an
 * alphabetical list of 165 codes meant knowing it is filed under GTQ, and
 * somebody checking a receipt knows the country, not the code.
 *
 * So the search matches the country name as well as the code, and everything
 * the select gave away is rebuilt here rather than assumed: full keyboard
 * control, a labelled listbox, and an active option the screen reader is told
 * about through aria-activedescendant.
 */

/** Matches on code or name, so "philippine" and "PHP" both work. */
function filterCurrencies(list, query) {
  const q = query.trim().toLowerCase()
  if (!q) return list
  const starts = []
  const contains = []
  for (const c of list) {
    const code = c.code.toLowerCase()
    const name = (c.name ?? '').toLowerCase()
    if (code.startsWith(q) || name.startsWith(q)) starts.push(c)
    else if (code.includes(q) || name.includes(q)) contains.push(c)
  }
  // Prefix matches first: typing "in" should reach INR before it reaches the
  // dozen currencies with "in" buried in the middle of a country name.
  return [...starts, ...contains]
}

export default function CurrencyPicker({ label, value, onChange, options, id }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  // Colons stripped: useId returns them, and they are legal in an id but not
  // in every parser that has to read one back out of a selector.
  const reactId = useId().replace(/:/g, '')
  const listId = `${id ?? reactId}-list`

  const shown = useMemo(() => filterCurrencies(options, query), [options, query])
  const selected = options.find((c) => c.code === value)

  // Opening lands the caret in the search box, which is the only reason to
  // have opened it. Closing throws the query away so it never reopens filtered.
  useEffect(() => {
    if (open) inputRef.current?.focus()
    else setQuery('')
    setActive(0)
  }, [open])

  // Keep the active row in view when the arrows walk past the fold.
  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, open, shown.length])

  // A click anywhere else is a dismissal, the same as Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const choose = (code) => {
    onChange(code)
    setOpen(false)
  }

  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, shown.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActive(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActive(shown.length - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (shown[active]) choose(shown[active].code)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  const flag = currencyFlag(value)

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      <span id={`${listId}-label`} className="mb-1.5 block text-sm font-medium">
        {label}
      </span>

      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-labelledby={`${listId}-label`}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {flag && (
          <span aria-hidden className="text-lg leading-none">
            {flag}
          </span>
        )}
        <span className="font-medium tabular-nums">{value}</span>
        {selected?.name && (
          <span className="truncate text-sm text-muted-foreground">{selected.name}</span>
        )}
        <span aria-hidden className="ml-auto text-xs text-muted-foreground">
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full min-w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            placeholder="Search code or country"
            aria-label={`Search currencies for ${label}`}
            aria-controls={listId}
            className="w-full border-b border-border bg-card px-4 py-3 text-base outline-none"
          />

          {/* Counted out loud, because a filter that silently finds nothing
              looks identical to one that is still loading. */}
          <p className="sr-only" role="status" aria-live="polite">
            {shown.length} currencies match
          </p>

          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={`${listId}-label`}
            aria-activedescendant={shown[active] ? `${listId}-${shown[active].code}` : undefined}
            className="max-h-64 overflow-y-auto py-1"
          >
            {shown.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground">
                Nothing matched that search.
              </li>
            )}
            {shown.map((c, i) => {
              const f = currencyFlag(c.code)
              return (
                <li
                  key={c.code}
                  id={`${listId}-${c.code}`}
                  role="option"
                  aria-selected={c.code === value}
                  data-active={i === active}
                  onPointerDown={(e) => {
                    // Down, not click: the pointerdown dismiss handler above
                    // would otherwise close the panel before a click landed.
                    e.preventDefault()
                    choose(c.code)
                  }}
                  onMouseMove={() => setActive(i)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm',
                    i === active && 'bg-muted',
                    c.code === value && 'font-bold',
                  )}
                >
                  {f ? (
                    <span aria-hidden className="w-6 shrink-0 text-base leading-none">
                      {f}
                    </span>
                  ) : (
                    <span aria-hidden className="w-6 shrink-0" />
                  )}
                  <span className="w-10 shrink-0 font-medium tabular-nums">{c.code}</span>
                  <span className="truncate text-muted-foreground">{c.name}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
