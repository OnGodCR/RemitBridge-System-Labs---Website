import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './Navbar'
import Footer from './Footer'
import ErrorBoundary from './ErrorBoundary'

export default function Layout() {
  const { pathname } = useLocation()

  // Client-side navigation keeps the old scroll position, which drops the
  // reader into the middle of the page they just opened.
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      {/* Inside the layout, not around it, so a page that throws still leaves
          the reader a header and a footer to navigate away with. */}
      <main className="flex-1">
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />

      {/*
        Vercel Web Analytics. Cookieless, and it does not fingerprint or build
        cross-site profiles, which is what lets the Impact page keep saying
        "aggregate counts only, we do not track individual users". It no-ops
        anywhere that is not a Vercel deployment.

        Speed Insights was here too and was removed: it is a separate paid
        feature that was never switched on, so it was a script loading for
        nothing.
      */}
      <Analytics />
    </div>
  )
}
