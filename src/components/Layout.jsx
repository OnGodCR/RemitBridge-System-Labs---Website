import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  const { pathname } = useLocation()

  // Client-side navigation keeps the old scroll position, which drops the
  // reader into the middle of the page they just opened.
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/*
        Vercel Web Analytics and Speed Insights. Both are cookieless and do not
        fingerprint or build cross-site profiles, which is what lets the Impact
        page keep saying "aggregate counts only, we do not track individual
        users". They no-op anywhere that is not a Vercel deployment.
      */}
      <Analytics />
      <SpeedInsights />
    </div>
  )
}
