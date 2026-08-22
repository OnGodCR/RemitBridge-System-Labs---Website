import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { routes } from '@/routes'
import { defaultHead } from '@/lib/head'
import Navbar from './Navbar'
import Footer from './Footer'
import ErrorBoundary from './ErrorBoundary'
import Backdrop from './Backdrop'

export default function Layout() {
  const { pathname } = useLocation()

  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')

  // Client-side navigation keeps the old scroll position, which drops the
  // reader into the middle of the page they just opened.
  //
  // Braces are not style here. A concise arrow returns whatever the expression
  // evaluates to, and React treats a non-undefined return as the cleanup
  // function, calling it on the next navigation without checking it is
  // callable. window.scrollTo is specified to return undefined, but the whole
  // class of bug disappears if nothing is returned at all.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  /*
   * The whole head: tab title, description, canonical, og: and twitter:, the
   * robots directive and the JSON-LD. Every page used to ship the same static
   * set from index.html, so two open tabs were indistinguishable, history was
   * a column of identical entries, and a search result for any page described
   * the home page.
   *
   * Pages outside the route table, the dashboard and a blog post, set their
   * own. This defers to them rather than overwriting: see lib/head.js for why
   * that needs a claim instead of just running second.
   */
  useEffect(() => {
    const route = routes.find((r) => r.path === pathname)
    defaultHead(pathname, route?.label)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Invisible until focused. The first tab stop on every page: without it
          a keyboard user walks the full menu before reaching any content. */}
      <a
        href="#content"
        className="sr-only z-50 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:font-bold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      {/* Site-wide. The ground is painted on body in index.css, so this can sit
          behind every page at -z-10. Sections that paint their own surface, the
          white cards and the green and ink bands, cover it, which is what keeps
          the alternation reading as bands rather than as texture everywhere. */}
      <Backdrop fixed />
      <Navbar />
      {/* Inside the layout, not around it, so a page that throws still leaves
          the reader a header and a footer to navigate away with. */}
      <main id="content" className="flex-1">
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* No footer on the auth pages. A column of site navigation under a
          sign-in box invites people away from the one thing the page is for,
          and the form is short enough that the footer was most of the screen. */}
      {!isAuthPage && <Footer />}

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
