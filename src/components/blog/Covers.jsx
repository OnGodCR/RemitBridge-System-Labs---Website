import { tps } from '@/data/figures'

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
 * Post 19. Throughput, drawn as the thing the post measures.
 *
 * The bars are the four rows of its own table, scaled to each other: the
 * answer swings fivefold on which average transaction size you assume, and
 * that swing is the post's argument, so it is the cover.
 */
const SERIES4_FIELD = '#FAF0E2'
const SERIES4_INK = '#8A4E0C'

export function TpsCover() {
  const bars = tps.bySize.map((r) => r.tps)
  const max = Math.max(...bars)
  return (
    <div
      aria-hidden
      className="flex size-full items-center justify-center gap-[7%] px-[9%]"
      style={{ backgroundColor: SERIES4_FIELD, color: SERIES4_INK }}
    >
      <div className="flex h-[42%] items-end gap-[1.6cqw]">
        {bars.map((v, i) => (
          <span
            key={i}
            className="w-[3.2cqw] rounded-t-[2px]"
            style={{ height: `${(v / max) * 100}%`, backgroundColor: 'currentColor' }}
          />
        ))}
      </div>
      <span
        className="font-extrabold leading-none tracking-tight"
        style={{ fontSize: 'min(14cqw, 32cqh)' }}
      >
        TPS
      </span>
    </div>
  )
}

export const coverArt = { 7: SwiftCover, 19: TpsCover }
