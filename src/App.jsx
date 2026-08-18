import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Home from './pages/Home'
import RemitBench from './pages/RemitBench'
import ComingSoon from './pages/ComingSoon'
import TrueCost from './pages/TrueCost'
import FairRate from './pages/FairRate'
import Reckoner from './pages/Reckoner'
import RateHistory from './pages/RateHistory'
import ScamCheck from './pages/ScamCheck'
import Workshops from './pages/Workshops'
import Blog from './pages/Blog'
import Papers from './pages/Papers'
import BlogPost from './pages/BlogPost'
import Fellowships from './pages/Fellowships'
import Impact from './pages/Impact'
import Leadership from './pages/Leadership'
import Contact from './pages/Contact'
import Sources from './pages/Sources'
import Dashboard from './pages/Dashboard'
import { SignInPage, SignUpPage } from './pages/Account'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      {/*
        Outer boundary. The one inside Layout only wraps the page, so an error
        in the header, the footer or AuthProvider escaped it and unmounted
        everything, which is a white screen with nothing to read. No resetKey
        here on purpose: if the chrome itself is broken, navigating is not
        going to fix it, and retrying would just blank the page again.
      */}
      <ErrorBoundary>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="coming-soon" element={<ComingSoon />} />
            {/* Kept: the design write-up is linked from Coming soon. */}
            <Route path="remitbench" element={<RemitBench />} />
            <Route path="truecost" element={<TrueCost />} />
            <Route path="fair-rate" element={<FairRate />} />
            <Route path="reckoner" element={<Reckoner />} />
            <Route path="rate-history" element={<RateHistory />} />
            <Route path="scam-check" element={<ScamCheck />} />
            <Route path="workshops" element={<Workshops />} />
            <Route path="blog" element={<Blog />} />
            <Route path="papers" element={<Papers />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="fellowships" element={<Fellowships />} />
            <Route path="impact" element={<Impact />} />
            <Route path="leadership" element={<Leadership />} />
            <Route path="contact" element={<Contact />} />
            <Route path="sources" element={<Sources />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="account" element={<Dashboard />} />
            {/* Superseded by the dashboard's Writing tab. */}
            <Route path="write" element={<Navigate to="/dashboard" replace />} />
            <Route path="sign-in/*" element={<SignInPage />} />
            <Route path="sign-up/*" element={<SignUpPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
