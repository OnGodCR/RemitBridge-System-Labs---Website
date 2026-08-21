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

const MINT = '#A7F3E4'
const INK = '#37454A'

/** Post 7. A globe for a network, and the name of the network. */
export function SwiftCover() {
  return (
    <div
      className="flex size-full items-center justify-center gap-[6%] px-[8%]"
      style={{ backgroundColor: MINT, color: INK }}
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

export const coverArt = { 7: SwiftCover }
