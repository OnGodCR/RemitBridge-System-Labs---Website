import { useEffect, useId, useRef } from 'react'
import { usePrefersReducedMotion } from '@/lib/useInView'
import { cn } from '@/lib/utils'

/*
 * Where the pointer is, for the whole document.
 *
 * Module scope rather than per-instance, for two reasons. Several backdrops
 * render at once now and they were each tracking the same one cursor, with
 * their own listener and their own animation frame. And the position has to
 * outlive an effect re-run: held inside the effect it was lost on every one,
 * and scrolling, which needs a remembered position because it fires no pointer
 * event, would then do nothing until the pointer next moved.
 */
let pointer = null
let frame = 0
const painters = new Set()

const flush = () => {
  frame = 0
  painters.forEach((paint) => paint())
}

// Coalesced into one frame: pointermove fires far more often than the screen
// refreshes, and each extra write is a wasted style recalculation.
const schedule = () => {
  if (frame) return
  frame = requestAnimationFrame(flush)
}

const onMove = (e) => {
  pointer = { x: e.clientX, y: e.clientY }
  schedule()
}

// Scrolling moves the boundary under a stationary pointer, so which backdrop
// the pointer is inside changes with no pointer event to announce it.
const onScroll = () => {
  if (pointer) schedule()
}

/** Adds a painter, and the listeners with the first one. */
function watch(paint) {
  if (painters.size === 0) {
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
  }
  painters.add(paint)
  paint()

  return () => {
    painters.delete(paint)
    if (painters.size > 0) return
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(frame)
    frame = 0
  }
}

const covers = (rect) =>
  pointer &&
  pointer.x >= rect.left &&
  pointer.x <= rect.right &&
  pointer.y >= rect.top &&
  pointer.y <= rect.bottom

/**
 * The bridge mark, tiled, with a light that follows the pointer.
 *
 * The bridge mark from the logo, tiled faintly, with a soft green light that
 * follows the pointer. The tiling is a static SVG pattern and the light is one
 * radial gradient positioned from two CSS variables, so moving the pointer
 * writes two custom properties and nothing re-renders. No canvas, no loop, no
 * per-frame React work.
 *
 * It sits behind the card and is hidden from screen readers: it carries no
 * information, and the page has to work identically without it.
 */
export default function Backdrop({ fadeClass = 'from-background', fixed = false, onDark = false }) {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()

  /*
   * A pattern id has to be unique across the whole document, not the component.
   *
   * More than one backdrop now renders at once, and url(#id) resolves against
   * the first match in the document rather than the nearest one. Every band was
   * drawing the page backdrop's pattern, where currentColor is green, so the
   * marks on the green bands were green on green and showed nothing.
   */
  // Colons stripped: useId returns them, and they are legal in an id but not in
  // every parser that has to read one back out of url(#…).
  const patternId = `bridges-${useId().replace(/:/g, '')}`

  useEffect(() => {
    // No pointer light when reduced motion is asked for, and none on touch,
    // where there is no hover and the light would just sit where you tapped.
    if (reduced) return
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover)').matches) return

    return watch(() => {
      // Before the pointer has moved, leave the resting light alone. Opening
      // flat and lighting up only on the first move reads as a page that was
      // broken until you touched it.
      if (!pointer) return
      const rect = el.getBoundingClientRect()

      /*
       * One light at a time.
       *
       * A green band paints over the fixed backdrop and carries its own copy,
       * so without this the two glow at once: the pointer sits on white, the
       * band's light sits just off its top edge, and 38rem of falloff bleeds
       * down across the boundary. Each backdrop lights only while the pointer
       * is inside its own box, and the fixed one stands down under any band
       * that has its own.
       */
      let lit = covers(rect)
      if (lit && fixed) {
        const bands = document.querySelectorAll('[data-backdrop="band"]')
        lit = ![...bands].some((band) => covers(band.getBoundingClientRect()))
      }

      el.style.setProperty('--lit', lit ? '1' : '0')

      // Position is frozen while dark, so the light fades out where it was and
      // fades back in where the pointer is rather than sliding across unseen.
      if (!lit) return
      el.style.setProperty('--x', `${((pointer.x - rect.left) / rect.width) * 100}%`)
      el.style.setProperty('--y', `${((pointer.y - rect.top) / rect.height) * 100}%`)
    })
  }, [reduced, fixed])

  return (
    <div
      ref={ref}
      aria-hidden
      // How the fixed backdrop finds the bands it has to stand down under.
      data-backdrop={fixed ? 'page' : 'band'}
      className={cn(
        'pointer-events-none overflow-hidden [--lit:1] [--x:50%] [--y:35%]',
        // Fixed sits behind the whole document, so the pattern stays put while
        // the page scrolls over it and the light tracks the pointer anywhere.
        // -z-10 works only because the layout wrapper paints no background of
        // its own: a child cannot render behind its own parent's fill.
        fixed ? 'fixed inset-0 -z-10' : 'absolute inset-0',
      )}
    >
      {/* Tiled bridge marks. Two arcs at 3% opacity: present when you look for
          it, invisible when you are reading the form.

          Left off the green bands, which take the light alone. The marks read
          much louder against green than against white, and a band that already
          carries four figures does not need the extra pattern behind them. */}
      {!onDark && (
        <svg className="absolute inset-0 size-full text-primary opacity-[0.06]" aria-hidden>
          <defs>
            <pattern
              id={patternId}
              width="120"
              height="90"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-8)"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                transform="translate(36 30) scale(1.05)"
              >
                <path d="M2 17Q24 3 46 17" />
                <path d="M14 30v-6q10-9 20 0v6" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      )}

      {/*
        The light. Follows the pointer through --x and --y, and rests at a
        fixed point until the pointer arrives, so the page never opens flat.
        transparent 60% keeps the edge soft enough not to read as a circle.
      */}
      <div
        className="absolute inset-0 opacity-[var(--lit)] transition-opacity duration-500"
        style={{
          background: `radial-gradient(38rem 38rem at var(--x) var(--y), color-mix(in oklch, var(--${
            onDark ? 'primary-foreground' : 'primary'
          }) ${onDark ? 13 : 22}%, transparent), transparent 60%)`,
        }}
      />

      {/* Fades out at the bottom so the pattern does not collide with whatever
          follows. The colour has to match the section it sits in, which is why
          it is a prop rather than a fixed token. A band that ends on a hard
          colour change needs no fade and passes fadeClass={null}. */}
      {!fixed && fadeClass && (
        <div
          className={cn('absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent', fadeClass)}
        />
      )}
    </div>
  )
}
