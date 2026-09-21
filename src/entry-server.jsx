import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { AppRoutes } from './App.jsx'
import { AuthProvider } from './lib/auth.jsx'

/**
 * Build-time render of one route, for scripts/prerender.mjs.
 *
 * Same tree as main.jsx under a StaticRouter, so what the file carries is
 * what the browser would have drawn. Nothing here fetches: effects do not
 * run in renderToString, so the rate lookups, the session check and the
 * database posts all happen in the browser after hydration, exactly as they
 * did before the body was prerendered. The static pages need none of them.
 */
export function render(url) {
  return renderToString(
    <React.StrictMode>
      <AuthProvider>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </AuthProvider>
    </React.StrictMode>,
  )
}
