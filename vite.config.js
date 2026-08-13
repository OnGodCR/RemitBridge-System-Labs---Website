import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Where the site lives, for the og: and twitter: tags in index.html.
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

/** Fills %SITE_URL% in index.html. Vite's own %VITE_*% syntax is not used
 *  here because it leaves the placeholder in place when the value is missing,
 *  which would ship a literal "%VITE_SITE_URL%" as the og:url. */
function siteUrlPlugin() {
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl()),
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrlPlugin()],
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
