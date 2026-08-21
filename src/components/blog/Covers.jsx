/**
 * Cover art that is drawn rather than photographed.
 *
 * A component, not an SVG file. An SVG loaded through <img> cannot reach the
 * page's webfont, so a wordmark in one would fall back to a system sans and
 * sit slightly wrong next to every other heading on the site. Rendered inline
 * it inherits Plus Jakarta Sans like everything else.
 *
 * It also sidesteps the crop. Covers render at 21:9 in the article and 16:9
 * on the index tile; a square image in either slot loses its top and bottom.
 * This fills whatever box it is given and stays centred.
 */

/* The mark on white, as supplied. The article frames it with a border, so
   the plate reads as a plate rather than a hole in the page. */
const FIELD = '#FFFFFF'
const INK = '#2F3A3B'

/** Post 7. A globe for a network, and the name of the network. */
export function SwiftCover() {
  return (
    /* Decorative, like the alt="" on a photographic cover. Without this the
       tile's link announces "Swift" before the series and the title. */
    <div
      aria-hidden
      className="flex size-full items-center justify-center gap-[6%] px-[8%]"
      style={{ backgroundColor: FIELD, color: INK }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        className="h-[46%] w-auto shrink-0"
        aria-hidden
      >
        <circle cx="100" cy="100" r="90" />
        <line x1="100" y1="10" x2="100" y2="190" />
        <ellipse cx="100" cy="100" rx="45" ry="90" />
        <line x1="10" y1="100" x2="190" y2="100" />
        <line x1="28" y1="55" x2="172" y2="55" />
        <line x1="28" y1="145" x2="172" y2="145" />
      </svg>
      <span
        className="font-semibold leading-none tracking-tight"
        style={{ fontSize: 'min(15cqw, 34cqh)' }}
      >
        Swift
      </span>
    </div>
  )
}

/**
 * Post 19. A dial with no trustworthy reading on it.
 *
 * The first version drew the four bars of the post's own table, which was
 * accurate and said nothing: four bars of different heights could be any
 * post on this site. The post's actual finding is that the number everyone
 * quotes is the wrong number, and that the honest answer is a range an order
 * of magnitude below it. A gauge whose needle sits in an unmarked band, next
 * to a question mark, is that.
 *
 * Ticks and needle are geometry rather than data. Nothing here is a reading,
 * which is the point, so there is no figure to keep in sync.
 */
const SERIES4_FIELD = '#FAF0E2'
const SERIES4_INK = '#8A4E0C'

/* Nine ticks around a semicircle, outer radius 80, inner 66. */
const TICKS = [180, 157.5, 135, 112.5, 90, 67.5, 45, 22.5, 0].map((deg) => {
  const t = (deg * Math.PI) / 180
  return {
    x1: 100 + 80 * Math.cos(t),
    y1: 100 - 80 * Math.sin(t),
    x2: 100 + 66 * Math.cos(t),
    y2: 100 - 66 * Math.sin(t),
  }
})

export function TpsCover() {
  return (
    <div
      aria-hidden
      className="flex size-full items-center justify-center gap-[6%] px-[8%]"
      style={{ backgroundColor: SERIES4_FIELD, color: SERIES4_INK }}
    >
      <svg
        viewBox="0 0 200 118"
        fill="none"
        stroke="currentColor"
        className="h-[52%] w-auto shrink-0"
      >
        <path d="M20 100 A80 80 0 0 1 180 100" strokeWidth="7" strokeLinecap="round" />
        {TICKS.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth="5" strokeLinecap="round" />
        ))}
        {/* Parked low, where the post's honest range actually sits. */}
        <line x1="100" y1="100" x2="60" y2="52" strokeWidth="7" strokeLinecap="round" />
        <circle cx="100" cy="100" r="9" fill="currentColor" stroke="none" />
      </svg>
      <span
        className="font-extrabold leading-none tracking-tight"
        style={{ fontSize: 'min(14cqw, 32cqh)' }}
      >
        TPS?
      </span>
    </div>
  )
}

export const coverArt = { 7: SwiftCover, 19: TpsCover }
