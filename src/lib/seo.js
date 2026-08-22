/**
 * Per-page titles and descriptions, in one table.
 *
 * Two very different things read this file, which is why it imports nothing
 * but plain data and uses relative paths rather than the `@/` alias:
 *
 *   1. The running app, which sets the head on every navigation.
 *   2. The build, which bakes the same tags into a real HTML file per route
 *      so that crawlers get them without running JavaScript.
 *
 * Anything imported here has to survive being loaded by plain Node from
 * vite.config.js. That rules out JSX, images, and the alias, and is why the
 * slug helper was pulled out of data/blog.js into its own module.
 */
import { routes } from '../routes.js'
import { posts } from '../data/posts.js'
import { slugify } from './slug.js'

export const SITE = 'RemitBridge Systems Lab'

/** Used on the home page and as the fallback anywhere a page has no line. */
export const DEFAULT_DESCRIPTION =
  'A student research lab measuring what cross-border transfers actually cost, and testing whether newer payment rails can do it cheaper.'

export const OG_IMAGE = '/og-image.png'
export const OG_IMAGE_ALT =
  'RemitBridge Systems Lab, measuring what it really costs to send money home.'

/**
 * Titles are short on purpose. Google truncates a result at roughly sixty
 * characters and the site name eats twenty-three of them, so a page gets about
 * thirty-five before the useful half disappears behind an ellipsis.
 *
 * Descriptions are written from what the page actually says. A description
 * that promises something the page does not deliver is the same unchecked
 * claim this site exists to argue against, and it also gets rewritten by
 * Google, which wastes the slot entirely.
 */
export const pages = {
  '/': {
    // The one page whose title is not suffixed: it is the site name already.
    title: `${SITE}: what sending money home costs`,
    bare: true,
    description: DEFAULT_DESCRIPTION,
  },
  '/truecost': {
    title: 'TrueCost transfer calculator',
    description:
      'Enter what you were charged and find out what the transfer really cost, including the exchange rate markup that was never itemised on the receipt.',
  },
  '/fair-rate': {
    title: 'Fair rate and markup checker',
    description:
      'The mid-market rate is the midpoint of what banks pay each other. See it live for your currency pair, and what every point of markup below it takes.',
  },
  '/reckoner': {
    title: 'Yearly cost of sending money',
    description:
      'Transfer costs hide by being small and frequent. Multiply one transfer out across a year and compare the total against the published cost benchmarks.',
  },
  '/rate-history': {
    title: 'Exchange rate history',
    description:
      'The mid-market rate for a corridor, one point per day, from this site’s own records. A day is recorded the first time anyone asks about it.',
  },
  '/scam-check': {
    title: 'Transfer scam check',
    description:
      'Eight questions about your situation, drawn from published FTC and CFPB guidance on money transfer fraud. Nothing you answer leaves the page.',
  },
  '/coming-soon': {
    title: 'Coming soon',
    description:
      'What the lab is building next, including RemitBench, how far along each thing is, and how to suggest something we should work on.',
  },
  '/blog': {
    title: 'Blog: cross-border payments',
    description:
      'Thirty posts on how cross-border payments work, from why families send money home to how correspondent banking and blockchain rails actually settle.',
  },
  '/papers': {
    title: 'Research papers',
    description:
      'Long-form work by lab members, with methods and references. A paper goes up once it is reviewed and the data and code behind it can be published too.',
  },
  '/workshops': {
    title: 'Money Across Borders workshops',
    description:
      'Free sessions and printed guides for families around King County, in six languages. None of it is running yet, and this page says so until it is.',
  },
  '/glossary': {
    title: 'Remittance glossary',
    description:
      'Every term the research and the workshop material rely on, defined once in plain language. English now, with six translations planned.',
  },
  '/fellowships': {
    title: 'Student fellowships',
    description:
      'Fellows join one of four teams and own something real. What each team works on, what it has to deliver each quarter, and how students apply.',
  },
  '/leadership': {
    title: 'The team',
    description:
      'Who is accountable for what at the lab, which seats are open, and who reviews the work before it goes out.',
  },
  '/impact': {
    title: 'What we measure',
    description:
      'Six things the lab tracks, the record that would prove each one, what has actually been measured so far, and every correction we have published.',
  },
  '/contact': {
    title: 'Contact',
    description:
      'Questions, corrections, workshop requests, or joining the lab. Messages go straight to the lab, where a student reads them.',
  },
  '/sources': {
    title: 'Where our numbers come from',
    description:
      'Every statistic on this site, what it means, which publication it came from, and the exact pages it is used on.',
  },
  '/remitbench': {
    title: 'RemitBench testbed',
    description:
      'An open testbed for comparing blockchain scaling setups against an ordinary bank transfer, using synthetic traffic. Still being built, so this is the design.',
  },
}

/**
 * Pages that should never appear in a search result.
 *
 * Not a security measure, and not treated as one: everything here is behind a
 * row-level security policy as well. This keeps a signed-out crawler from
 * indexing a URL that shows it nothing but a sign-in box, which is a bad
 * result for whoever clicks it.
 */
export const NOINDEX = ['/dashboard', '/account', '/write', '/sign-in', '/sign-up']

export const isNoindex = (pathname) =>
  NOINDEX.some((p) => pathname === p || pathname.startsWith(`${p}/`))

/**
 * Cut to something a search result can show, on a word boundary.
 *
 * Post abstracts run to two or three sentences because that is the right
 * length on the index page. Google shows about a hundred and sixty characters
 * and truncates the rest mid-word, so the first sentence usually survives
 * intact and the second one turns into debris.
 */
export function clamp(text, limit = 158) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= limit) return clean
  const cut = clean.slice(0, limit)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit).replace(/[,;:.]$/, '')}…`
}

/** Every static post, as the sitemap and the prerender need them. */
export const postPaths = posts.map((post) => ({
  path: `/blog/${slugify(post.title)}`,
  title: post.title,
  description: clamp(post.abstract),
  series: post.seriesName,
  author: post.author?.consentOn ? post.author.name : null,
}))

/**
 * Which URLs the build should write a real HTML file for.
 *
 * Drawn from routes.js so a page added there is prerendered and listed in the
 * sitemap without anyone remembering to come back here, which is the same
 * reason routes.js drives the header and the footer.
 *
 * `/remitbench` is included by hand: it is linked from Coming soon but is
 * deliberately not in the navigation.
 */
export const staticPaths = ['/', ...routes.map((r) => r.path), '/remitbench', '/sources']

/** Title, description and robots directive for a path. Never returns null. */
export function metaFor(pathname) {
  const page = pages[pathname]
  const noindex = isNoindex(pathname)
  if (page) return { ...page, noindex }

  const post = postPaths.find((p) => p.path === pathname)
  if (post) return { title: post.title, description: post.description, noindex }

  // Unknown path. The layout still falls back to the route label for its
  // title; what matters here is that a 404 is never offered to a crawler as
  // an indexable page.
  return { title: null, description: DEFAULT_DESCRIPTION, noindex: true }
}

/** `Page · Site`, or the bare site name for the home page. */
export function documentTitle(title, bare = false) {
  if (!title) return SITE
  return bare ? title : `${title} · ${SITE}`
}

/**
 * The lab's public address. Lives here rather than in the contact page because
 * the Organization markup below needs it too, and the build cannot import a
 * page component. This is the shared mailbox, never the owner address, which
 * is in app_config and in no tracked file.
 */
export const CONTACT_EMAIL = 'remitbridgesystemlabs@gmail.com'

/**
 * Structured data for a page.
 *
 * The same rule as the rest of the site applies here and is easier to break:
 * JSON-LD is invisible, so a claim made in it is a claim nobody proofreads.
 * Nothing in here is asserted that the page does not already say out loud.
 *
 * Two things are deliberately absent. There is no SearchAction, because the
 * blog search is component state and has no URL a search engine could send
 * anyone to. There is no datePublished on a post, because the thirty posts in
 * the repo carry no publication date and inventing one to satisfy a validator
 * is exactly the kind of unchecked number this site exists to complain about.
 */
export function jsonLdFor(pathname, origin, extra = {}) {
  const abs = (p) => `${origin}${p === '/' ? '/' : p}`
  const meta = extra.title ? extra : metaFor(pathname)

  const organization = {
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: SITE,
    url: `${origin}/`,
    logo: `${origin}/apple-touch-icon.png`,
    email: CONTACT_EMAIL,
    description: DEFAULT_DESCRIPTION,
  }

  const website = {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    name: SITE,
    url: `${origin}/`,
    publisher: { '@id': `${origin}/#organization` },
    inLanguage: 'en',
  }

  const trail = [{ name: 'Home', item: `${origin}/` }]
  if (pathname.startsWith('/blog/')) trail.push({ name: 'Blog', item: abs('/blog') })
  if (pathname !== '/') trail.push({ name: meta.title ?? 'Page', item: abs(pathname) })

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': `${abs(pathname)}#breadcrumb`,
    itemListElement: trail.map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      item: step.item,
    })),
  }

  const nodes = [organization, website, breadcrumb]

  const post = postPaths.find((p) => p.path === pathname)
  if (post) {
    nodes.push({
      '@type': 'BlogPosting',
      '@id': `${abs(pathname)}#post`,
      headline: post.title,
      description: post.description,
      articleSection: post.series,
      isPartOf: { '@id': `${origin}/#website` },
      publisher: { '@id': `${origin}/#organization` },
      mainEntityOfPage: abs(pathname),
      inLanguage: 'en',
      // Same rule as the byline on the page itself: no consent date, no name.
      ...(post.author ? { author: { '@type': 'Person', name: post.author } } : {}),
    })
  }

  return { '@context': 'https://schema.org', '@graph': nodes }
}
