import { SITE, documentTitle, jsonLdFor, metaFor, OG_IMAGE } from './seo'

/**
 * The document head, kept in step with the route.
 *
 * This used to set the tab title and nothing else. Everything a crawler reads,
 * the description, the canonical URL, the og: and twitter: tags, was static in
 * index.html, so every page in the site described itself as the home page and
 * a link pasted into Slack said "RemitBridge Systems Lab" whatever it pointed
 * at.
 *
 * Setting them here fixes the tags for anything that runs JavaScript, which
 * includes Google. It does not fix them for the social crawlers, which do not.
 * That half is done at build time, in the seo plugin in vite.config.js, which
 * bakes the identical tags into a real HTML file per route. Both read the same
 * table in lib/seo.js so they cannot drift apart.
 */

/** Filled in by Vite at build time, from the Vercel production domain. */
const SITE_URL =
  typeof __SITE_URL__ === 'string' && __SITE_URL__
    ? __SITE_URL__
    : typeof window !== 'undefined'
      ? window.location.origin
      : ''

/**
 * Which pathname a page has claimed the head for.
 *
 * React runs child effects before parent ones. The layout sits above every
 * page, so its head effect fires *after* a page has already set its own and
 * used to overwrite it: every blog post showed the bare site name, which is
 * what a shared link and a history entry both read.
 *
 * Ordering cannot be argued with, so the page records what it claimed and the
 * layout defers when the claim matches the route being rendered. Navigating
 * away moves the pathname on, the claim no longer matches, and the layout
 * takes the head back.
 */
let claimedFor = null

/**
 * Find or create a head tag, and set it.
 *
 * The tags that ship in index.html are found and updated rather than
 * duplicated, which matters: two og:title tags is undefined behaviour and
 * different crawlers pick different ones.
 */
function upsert(selector, create, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  return el
}

const meta = (attr, name, content) =>
  upsert(`meta[${attr}="${name}"]`, () => {
    const el = document.createElement('meta')
    el.setAttribute(attr, name)
    return el
  }, { content })

function setJsonLd(data) {
  // data-seo marks the block this file owns. Anything else in the head, now or
  // later, is left alone rather than being replaced by whatever ran last.
  const el = upsert('script[data-seo]', () => {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.setAttribute('data-seo', '')
    return s
  }, {})
  el.textContent = JSON.stringify(data)
}

/** Everything the head needs for one route. */
function write(pathname, override) {
  const page = override ?? metaFor(pathname)
  const url = `${SITE_URL}${pathname}`
  const title = documentTitle(page.title, page.bare)
  const description = page.description

  document.title = title
  meta('name', 'description', description)

  upsert('link[rel="canonical"]', () => {
    const el = document.createElement('link')
    el.rel = 'canonical'
    return el
  }, { href: url })

  /*
   * Robots. Removed rather than set to "index" when a page is public: an
   * absent robots tag and index,follow mean the same thing, and leaving a
   * stale noindex behind on the next navigation would quietly delist a page.
   */
  const robots = document.head.querySelector('meta[name="robots"]')
  if (page.noindex) meta('name', 'robots', 'noindex, follow')
  else if (robots) robots.remove()

  meta('property', 'og:title', title)
  meta('property', 'og:description', description)
  meta('property', 'og:url', url)
  meta('property', 'og:site_name', SITE)
  meta('property', 'og:type', pathname.startsWith('/blog/') ? 'article' : 'website')
  meta('property', 'og:image', `${SITE_URL}${OG_IMAGE}`)

  meta('name', 'twitter:card', 'summary_large_image')
  meta('name', 'twitter:title', title)
  meta('name', 'twitter:description', description)
  meta('name', 'twitter:image', `${SITE_URL}${OG_IMAGE}`)

  setJsonLd(jsonLdFor(pathname, SITE_URL, override))
}

/** Called by a page that knows better than the route table. */
export function claimHead(pathname, page) {
  claimedFor = pathname
  write(pathname, page)
}

/** Called by the layout. Yields to a page that has claimed this pathname. */
export function defaultHead(pathname, label) {
  if (claimedFor === pathname) return
  const known = metaFor(pathname)
  // A route the table does not list still has a label in routes.js, and that
  // is a better tab title than the bare site name.
  write(pathname, known.title ? known : { ...known, title: label ?? null })
}
