import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/lib/useInView'
import { cn } from '@/lib/utils'

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
export default function Backdrop({ fadeClass = 'from-background', fixed = false }) {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    // No pointer light when reduced motion is asked for, and none on touch,
    // where there is no hover and the light would just sit where you tapped.
    if (reduced) return
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover)').matches) return

    let frame = 0
    const onMove = (e) => {
      // Coalesced into one frame: pointermove fires far more often than the
      // screen refreshes, and each extra write is a wasted style recalculation.
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const { left, top, width, height } = el.getBoundingClientRect()
        el.style.setProperty('--x', `${((e.clientX - left) / width) * 100}%`)
        el.style.setProperty('--y', `${((e.clientY - top) / height) * 100}%`)
      })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [reduced])

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'pointer-events-none overflow-hidden [--x:50%] [--y:35%]',
        // Fixed sits behind the whole document, so the pattern stays put while
        // the page scrolls over it and the light tracks the pointer anywhere.
        // -z-10 works only because the layout wrapper paints no background of
        // its own: a child cannot render behind its own parent's fill.
        fixed ? 'fixed inset-0 -z-10' : 'absolute inset-0',
      )}
    >
      {/* Tiled bridge marks. Two arcs at 3% opacity: present when you look for
          it, invisible when you are reading the form. */}
      <svg className="absolute inset-0 size-full text-primary opacity-[0.06]" aria-hidden>
        <defs>
          <pattern
            id="bridges"
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
        <rect width="100%" height="100%" fill="url(#bridges)" />
      </svg>

      {/*
        The light. Follows the pointer through --x and --y, and rests at a
        fixed point until the pointer arrives, so the page never opens flat.
        transparent 60% keeps the edge soft enough not to read as a circle.
      */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(38rem 38rem at var(--x) var(--y), color-mix(in oklch, var(--primary) 22%, transparent), transparent 60%)',
        }}
      />

      {/* Fades out at the bottom so the pattern does not collide with whatever
          follows. The colour has to match the section it sits in, which is why
          it is a prop rather than a fixed token. */}
      {!fixed && (
        <div
          className={cn('absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent', fadeClass)}
        />
      )}
    </div>
  )
}
