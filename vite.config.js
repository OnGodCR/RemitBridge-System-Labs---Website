import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
  OG_IMAGE_ALT,
  SITE,
  documentTitle,
  jsonLdFor,
  metaFor,
  postPaths,
  staticPaths,
} from './src/lib/seo.js'

/**
 * Where the site lives, for the canonical, og: and twitter: tags.
 *
 * Crawlers do not run JavaScript and do not resolve relative paths, so these
 * have to be absolute and present in the HTML that ships. Working it out at
 * build time rather than hardcoding it means the tags follow the deployment,
 * including the day a custom domain replaces the vercel.app one.
 *
 * SITE_URL wins if it is set. Otherwise Vercel supplies the production domain
 * of the project, which is stable, unlike VERCEL_URL which is unique per
 * deployment and would point previews at themselves.
 */
function siteUrl() {
  const explicit = process.env.SITE_URL
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const raw = explicit || (vercel && `https://${vercel}`) || 'http://localhost:3000'
  return raw.replace(/\/+$/, '')
}

/**
 * Refuse to deploy a site that thinks it lives on localhost.
 *
 * This used to matter for the og: tags alone, and a wrong one there is a bad
 * link preview. It now decides every canonical URL, every entry in the
 * sitemap and the sitemap line in robots.txt. A build that quietly falls back
 * to localhost and gets deployed tells Google that the canonical version of
 * all forty-seven pages is a machine it cannot reach, which is worse than
 * having published none of this.
 *
 * It happened here during the work that added it: a rebuild without the
 * variable set produced a complete localhost sitemap and said nothing.
 *
 * A local build is allowed to fall back, because inspecting dist/ is a normal
 * thing to do. A build on Vercel is not.
 */
function assertDeployable(origin) {
  const local = origin.startsWith('http://localhost')
  if (!local) return origin
  if (process.env.VERCEL) {
    throw new Error(
      'seo: building on Vercel with no production domain. Set SITE_URL, or check ' +
        'that VERCEL_PROJECT_PRODUCTION_URL is exposed to the build. Refusing to ' +
        'emit canonical URLs and a sitemap that all point at localhost.',
    )
  }
  console.warn(
    `\n  seo: no SITE_URL set, so canonicals and the sitemap say ${origin}.` +
      '\n  Fine for looking at dist/ locally. Never deploy this build.\n',
  )
  return origin
}

/** Attribute-safe. A description with an ampersand in it broke nothing until
 *  it did, and a stray quote silently truncates the tag it is inside. */
const attr = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const xml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const START = '<!-- SEO:START -->'
const END = '<!-- SEO:END -->'

/**
 * The head block for one route: everything between the markers in index.html.
 *
 * Identical in shape to what lib/head.js writes at runtime, and fed by the
 * same table, because the two disagreeing is worse than either being wrong.
 * A crawler that renders JavaScript would see one set of tags replaced by
 * another and has no way to know which was meant.
 */
function seoBlock(pathname, origin) {
  const meta = metaFor(pathname)
  const url = `${origin}${pathname}`
  const title = documentTitle(meta.title, meta.bare)
  const description = meta.description || DEFAULT_DESCRIPTION
  const image = `${origin}${OG_IMAGE}`
  const isPost = pathname.startsWith('/blog/')

  const tags = [
    `<title>${attr(title)}</title>`,
    `<meta name="description" content="${attr(description)}" />`,
    `<link rel="canonical" href="${attr(url)}" />`,
    // An absent robots tag already means index,follow. Only the refusal is
    // worth stating.
    meta.noindex ? '<meta name="robots" content="noindex, follow" />' : null,
    '',
    `<meta property="og:type" content="${isPost ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="${attr(SITE)}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(description)}" />`,
    `<meta property="og:url" content="${attr(url)}" />`,
    `<meta property="og:image" content="${attr(image)}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${attr(OG_IMAGE_ALT)}" />`,
    '',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${attr(title)}" />`,
    `<meta name="twitter:description" content="${attr(description)}" />`,
    `<meta name="twitter:image" content="${attr(image)}" />`,
    '',
    // \u003c, because a description containing the characters that close a
    // script tag would end the block early and dump the rest into the page.
    `<script type="application/ld+json" data-seo>${JSON.stringify(
      jsonLdFor(pathname, origin),
    ).replace(/</g, '\\u003c')}</script>`,
  ].filter((line) => line !== null)

  return `${START}\n    ${tags.join('\n    ')}\n    ${END}`
}

/** Every URL the build knows about. Database posts cannot be here: they are
 *  written after the build and the sitemap is a static file. */
const allPaths = () => [...staticPaths, ...postPaths.map((p) => p.path)]

function seoPlugin() {
  const origin = siteUrl()

  return {
    name: 'seo',

    // Not in siteUrl() itself: that runs for `define` on a dev server too,
    // where the warning is noise and there is nothing to deploy.
    buildStart() {
      assertDeployable(origin)
    },

    // Runs in dev as well as in build, so `npm run dev` shows the real tags
    // for the home page rather than an empty block.
    transformIndexHtml: (html) => html.replace(`${START}\n    ${END}`, seoBlock('/', origin)),

    /**
     * One real HTML file per route.
     *
     * The rewrite in vercel.json sends everything to index.html, but Vercel
     * checks the filesystem first, so dist/truecost/index.html is what gets
     * served at /truecost and the rewrite only catches what is left. The body
     * is still the empty root div and the same bundle: this fixes the head,
     * which is the half that no crawler will run JavaScript to discover.
     */
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist')
      const index = path.join(dist, 'index.html')
      if (!fs.existsSync(index)) return

      const template = fs.readFileSync(index, 'utf8')
      const home = seoBlock('/', origin)
      if (!template.includes(home)) {
        // Failing loudly. A silent miss here ships a whole site of pages that
        // all claim to be the home page, which is the bug this replaced.
        throw new Error('seo: the marker block is not in dist/index.html')
      }

      let written = 0
      for (const pathname of allPaths()) {
        if (pathname === '/') continue
        const html = template.replace(home, seoBlock(pathname, origin))
        const dir = path.join(dist, pathname.replace(/^\//, ''))
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), html)
        written += 1
      }

      const urls = allPaths()
        .filter((p) => !metaFor(p).noindex)
        .map((p) => `  <url><loc>${xml(`${origin}${p}`)}</loc></url>`)
        .join('\n')

      fs.writeFileSync(
        path.join(dist, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      )

      /*
       * robots.txt is generated rather than kept in public/ because the
       * sitemap line has to be an absolute URL and the domain is only known
       * at build time. The disallowed paths are the signed-in ones: a crawler
       * indexing them would put a sign-in box in a search result. They are not
       * protected by this. They are protected by row-level security.
       */
      fs.writeFileSync(
        path.join(dist, 'robots.txt'),
        [
          'User-agent: *',
          'Allow: /',
          'Disallow: /dashboard',
          'Disallow: /account',
          'Disallow: /sign-in',
          'Disallow: /sign-up',
          'Disallow: /write',
          '',
          `Sitemap: ${origin}/sitemap.xml`,
          '',
        ].join('\n'),
      )

      this.info?.(`seo: ${written} prerendered pages, ${allPaths().length} sitemap URLs`)
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // Production stacks are minified to single letters, so "r is not a
    // function" names nothing. The source is public on GitHub anyway, so a
    // sourcemap gives away nothing and turns that into a file and a line.
    sourcemap: true,
  },
  define: {
    // The same origin the prerendered tags use, so the canonical the app
    // writes on navigation matches the one that shipped in the file.
    __SITE_URL__: JSON.stringify(siteUrl()),
  },
  plugins: [react(), tailwindcss(), seoPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    host: true,
  },
})
