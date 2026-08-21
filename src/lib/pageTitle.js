const SITE = 'RemitBridge Systems Lab'

/**
 * Which pathname a page has claimed the tab title for.
 *
 * React runs child effects before parent ones. The layout sits above every
 * page, so its title effect fires *after* a page has already set its own and
 * used to overwrite it: every blog post showed the bare site name, which is
 * what a shared link and a history entry both read.
 *
 * Ordering cannot be argued with, so the page records what it claimed and the
 * layout defers when the claim matches the route being rendered. Navigating
 * away moves the pathname on, the claim no longer matches, and the layout
 * takes the title back.
 */
let claimedFor = null

/** Called by a page that knows better than the route table. */
export function claimTitle(pathname, title) {
  claimedFor = pathname
  document.title = `${title} · ${SITE}`
}

/** Called by the layout. Yields to a page that has claimed this pathname. */
export function defaultTitle(pathname, label) {
  if (claimedFor === pathname) return
  document.title = label ? `${label} · ${SITE}` : SITE
}
