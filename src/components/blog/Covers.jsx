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
 * Post 17. The blockchain trilemma.
 *
 * Angad picked a Serokell rendering of this for the cover. Drawn here rather
 * than reproduced: the trilemma itself is a public framing, so the concept is
 * free even though their artwork is not, and CREDITS.md keeps its promise
 * that every image on the site is CC0.
 *
 * It earns its place on this post rather than on 18, which is the one
 * actually about the trilemma, because the three properties are what the
 * three architectures trade against each other. The cover states the three
 * axes and stops there. Where sharding, sidechains and channels each sit on
 * it is a positional claim the post does not make, so the picture does not
 * make it either.
 */
const TRILEMMA_FIELD = '#241B3A'
const TRILEMMA_INK = '#EFEAF8'
const TRILEMMA_CORNERS = ['Security', 'Decentralization', 'Scalability']

export function TrilemmaCover() {
  return (
    <div
      aria-hidden
      className="flex size-full items-center justify-center gap-[5%] px-[7%]"
      style={{ backgroundColor: TRILEMMA_FIELD, color: TRILEMMA_INK }}
    >
      <svg
        viewBox="0 0 120 104"
        fill="none"
        stroke="currentColor"
        className="h-[46%] w-auto shrink-0"
      >
        <path d="M60 8 L112 96 L8 96 Z" strokeWidth="5" strokeLinejoin="round" />
        <circle cx="60" cy="8" r="7" fill="currentColor" stroke="none" />
        <circle cx="112" cy="96" r="7" fill="currentColor" stroke="none" />
        <circle cx="8" cy="96" r="7" fill="currentColor" stroke="none" />
        {/* The thing being traded, sitting in the middle of the three. */}
        <circle cx="60" cy="67" r="13" strokeWidth="4" opacity="0.55" />
      </svg>

      <ul className="min-w-0">
        {TRILEMMA_CORNERS.map((c) => (
          <li
            key={c}
            className="truncate font-bold leading-tight tracking-tight"
            style={{ fontSize: 'min(5cqw, 13cqh)' }}
          >
            {c}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const coverArt = { 7: SwiftCover, 17: TrilemmaCover }
