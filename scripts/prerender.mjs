import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/**
 * Put each page's body into its HTML file.
 *
 * `vite build` writes one file per route with the right head and an empty
 * root; the SEO plugin does that. This runs after the second build, the
 * server bundle of entry-server.jsx, and renders every one of those routes
 * into the root it was missing. A crawler that runs no JavaScript now gets
 * the same text a reader does, and a reader gets it before the bundle has
 * arrived.
 *
 * The routes come from the files on disk, not from a second list: whatever
 * the SEO plugin decided deserved a file is what gets a body. The dashboard
 * and sign-in pages are in that set and render their signed-out state, which
 * is what an anonymous crawler would have seen anyway.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const serverDir = path.join(dist, 'server')
const entry = path.join(serverDir, 'entry-server.js')

if (!fs.existsSync(entry)) {
  throw new Error(`prerender: ${path.relative(root, entry)} is missing. Run the ssr build first.`)
}

const { render } = await import(pathToFileURL(entry).href)

const EMPTY = '<div id="root"></div>'

function* htmlFiles(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (full === serverDir) continue
    if (fs.statSync(full).isDirectory()) yield* htmlFiles(full)
    else if (name === 'index.html') yield full
  }
}

let written = 0
for (const file of htmlFiles(dist)) {
  const route = '/' + path.relative(dist, path.dirname(file)).split(path.sep).filter(Boolean).join('/')
  const html = fs.readFileSync(file, 'utf8')
  if (!html.includes(EMPTY)) {
    throw new Error(`prerender: ${path.relative(root, file)} has no empty root to fill`)
  }
  const body = render(route === '/' ? '/' : route)
  if (!body || body.length < 200) {
    // A page that rendered to nothing is a page that threw somewhere quiet.
    throw new Error(`prerender: ${route} rendered ${body?.length ?? 0} characters`)
  }
  fs.writeFileSync(file, html.replace(EMPTY, `<div id="root">${body}</div>`))
  written += 1
}

// The server bundle is a build tool, not part of the site.
fs.rmSync(serverDir, { recursive: true, force: true })

console.log(`prerender: ${written} pages carry their body`)
