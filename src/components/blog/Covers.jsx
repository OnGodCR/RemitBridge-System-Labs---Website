import nearLogo from '@/assets/near-logo.png'
import polygonLogo from '@/assets/polygon-logo.png'

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

/*
 * A logo always sits on white. Standing rule, set 2026-08-26.
 *
 * Polygon's plate was lilac for a while, taken from their own brand. Against
 * post 15's purple series tint it read as a slightly wrong purple rather than
 * as a deliberate one, and NEAR's had the same problem on post 14. White is
 * the only field that stays neutral under all five series colours, so the
 * plate reads as a plate rather than as a fourth shade competing with the
 * two the page already has.
 *
 * One constant, not one per logo: the next mark someone adds inherits the
 * rule instead of picking a brand colour again.
 */
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
 * Post 14. NEAR's mark, which Angad chose.
 *
 * The glyph is NEAR Protocol's own, CC0 from Wikimedia Commons rather than
 * lifted from their site. The wordmark beside it is set in this site's
 * typeface, not theirs: pairing their real glyph with an approximation of
 * their lettering would look like a forged wordmark, and this reads plainly
 * as our rendering of their name.
 *
 * The post names them in a callout above the first paragraph. A logo on a
 * cover with nothing explaining it invites the reader to assume a
 * relationship that does not exist, and NEAR appears here because the post
 * examines Nightshade, not because they have anything to do with the lab.
 */
const NEAR_INK = '#141414'

export function NearCover() {
  return (
    <div
      aria-hidden
      className="flex size-full items-center justify-center gap-[4%] px-[8%]"
      style={{ backgroundColor: FIELD, color: NEAR_INK }}
    >
      <img src={nearLogo} alt="" className="h-[52%] w-auto shrink-0" />
      <span
        className="font-semibold uppercase leading-none tracking-[0.08em]"
        style={{ fontSize: 'min(11cqw, 26cqh)' }}
      >
        Near
      </span>
    </div>
  )
}


/**
 * Post 15. Polygon's mark, the same arrangement as post 14's NEAR plate.
 *
 * Commons carries the full official lockup, glyph and wordmark together, so
 * unlike NEAR there is no wordmark to set in our own typeface. The whole
 * thing is theirs, CC0, and used unaltered.
 *
 * Named in a callout above the first paragraph for the same reason: Polygon
 * is the sidechain this post examines, from Bor and Heimdall through to the
 * checkpoint interval, and a logo on a cover with nothing explaining it
 * invites a reader to assume a relationship that does not exist.
 */
export function PolygonCover() {
  return (
    <div
      aria-hidden
      className="flex size-full items-center justify-center px-[10%]"
      style={{ backgroundColor: FIELD }}
    >
      <img src={polygonLogo} alt="" className="max-h-[46%] w-auto max-w-full object-contain" />
    </div>
  )
}

export const coverArt = { 7: SwiftCover, 14: NearCover, 15: PolygonCover }
