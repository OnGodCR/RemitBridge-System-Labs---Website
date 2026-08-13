import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './lib/auth.jsx'
import './index.css'

/**
 * Last-resort handler for anything React cannot catch.
 *
 * The error boundary inside the layout only covers page components. An error
 * in the header, in AuthProvider, or at import time happens outside it, and
 * the result is a genuinely blank document with the reason visible only in a
 * console nobody has open. This paints the error onto the page instead.
 *
 * Deliberately plain: no imports, no components, nothing that could itself be
 * the thing that is broken.
 */
function showFatal(what, detail) {
  const root = document.getElementById('root')
  if (!root || root.dataset.fatal === 'true') return
  root.dataset.fatal = 'true'
  root.innerHTML = `
    <div style="max-width:44rem;margin:0 auto;padding:6rem 1.5rem;font-family:system-ui,sans-serif;color:#1C2024">
      <h1 style="font-size:1.75rem;font-weight:800;margin:0 0 1rem">This page did not load</h1>
      <p style="line-height:1.6;color:#6B7280;margin:0 0 1.5rem">
        Something failed before the page could be drawn. Reloading usually gets you
        through. If you are reporting this, the grey box is the part that matters.
      </p>
      <button onclick="window.location.reload()"
              style="border:0;border-radius:0.75rem;background:#14705A;color:#fff;font-weight:700;padding:0.75rem 1.5rem;cursor:pointer">
        Reload the page
      </button>
      <pre style="margin-top:2rem;padding:1rem;border:1px solid #E5E7EB;border-radius:0.75rem;background:#F9FAFB;font-size:0.75rem;overflow-x:auto;white-space:pre-wrap"></pre>
    </div>`
  // textContent, not innerHTML: the error text is untrusted here.
  root.querySelector('pre').textContent = `${what}\n\n${detail}`
}

window.addEventListener('error', (e) => {
  showFatal(e.message || 'Error', e.error?.stack || `${e.filename}:${e.lineno}`)
})

// An unhandled rejection in a data fetch can leave the tree half-mounted, which
// looks identical to a blank page from the outside.
window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason
  showFatal(
    reason?.message || 'Unhandled promise rejection',
    reason?.stack || String(reason),
  )
})

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>,
  )
} catch (error) {
  showFatal(error?.message || 'Failed to start', error?.stack || String(error))
}
