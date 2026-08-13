import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Container } from '@/components/Section'
import {
  ActivityPanel,
  ApplicationPanel,
  Card,
  OnboardingPanel,
  PapersPanel,
  ProfilePanel,
  WritingPanel,
} from '@/components/dashboard/Panels'
import { Applications } from '@/components/dashboard/Applications'
import { Editor } from '@/components/dashboard/Editor'
import { Inbox } from '@/components/dashboard/Inbox'
import { People } from '@/components/dashboard/People'
import { supabase } from '@/lib/supabase'
import { useAuth, authEnabled, canWrite, isStaff, isAdmin } from '@/lib/auth'
import { cn } from '@/lib/utils'

const ROLE_BLURB = {
  member:
    'Your account is set up. Applying for a fellowship is the way onto a team; writing access comes with that.',
  writer: 'You can write. The post list below shows what still needs a body.',
  editor: 'You can write and you can read the contact inbox.',
  admin: 'You can do everything, including changing what everyone else can do.',
}

export default function Dashboard() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const [tab, setTab] = useState('overview')
  const [waiting, setWaiting] = useState(0)
  const [hasApplication, setHasApplication] = useState(null)

  // Land on the tab that matters most for this role.
  useEffect(() => {
    if (profile?.role === 'member') setTab('overview')
  }, [profile?.role])

  // Own application, for the onboarding checklist. RLS scopes this to the
  // signed-in person unless they are staff, hence the explicit filter.
  useEffect(() => {
    if (!authEnabled || !user) return
    supabase
      .from('fellowship_applications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setHasApplication((count ?? 0) > 0))
  }, [user?.id])

  // A count on the tab, so nothing sits unread because nobody looked.
  useEffect(() => {
    if (!isStaff(profile)) return
    supabase
      .from('fellowship_applications')
      .select('id', { count: 'exact', head: true })
      .in('status', ['submitted', 'reading'])
      .then(({ count }) => setWaiting(count ?? 0))
  }, [profile?.role])

  if (!authEnabled) {
    return (
      <Container className="py-20">
        <h1 className="text-3xl">Dashboard</h1>
        <p className="mt-3 text-muted-foreground">
          This unlocks once Supabase credentials are configured.
        </p>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container className="py-20">
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      </Container>
    )
  }

  if (!user) return <Navigate to="/sign-in" replace />

  const role = profile?.role ?? 'member'
  const name = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...(canWrite(profile) ? [{ id: 'writing', label: 'Writing' }] : []),
    ...(isStaff(profile)
      ? [
          { id: 'applications', label: 'Applications', badge: waiting },
          { id: 'inbox', label: 'Messages' },
        ]
      : []),
    ...(isAdmin(profile) ? [{ id: 'people', label: 'People' }] : []),
    { id: 'account', label: 'Account' },
  ]

  return (
    <>
      {/* Green header, matching the alternation the rest of the site uses. */}
      <div className="bg-primary py-14 text-primary-foreground">
        <Container>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl">Hi {name}</h1>
            <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-bold uppercase tracking-widest">
              {role}
            </span>
          </div>
          <p className="mt-3 max-w-2xl leading-relaxed text-current/90">
            {ROLE_BLURB[role]}
          </p>
        </Container>
      </div>

      <div className="border-b border-border bg-card">
        <Container>
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
                className={cn(
                  '-mb-px whitespace-nowrap border-b-2 px-4 py-4 text-sm font-bold transition-colors',
                  tab === t.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
                {t.badge > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </Container>
      </div>

      <Container className="py-12">
        {tab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            {role === 'member' && hasApplication !== null && (
              <OnboardingPanel
                profile={profile}
                hasApplication={hasApplication}
                onGoToAccount={() => setTab('account')}
              />
            )}
            <ApplicationPanel userId={user.id} role={role} />
            <ActivityPanel />
            {canWrite(profile) && <PapersPanel />}
          </div>
        )}

        {tab === 'writing' && canWrite(profile) && (
          <div className="space-y-6">
            <Card
              title="Posts"
              note="Written here, saved to the database, and on the blog once an editor publishes them."
            >
              <Editor user={user} profile={profile} />
            </Card>
            <WritingPanel />
          </div>
        )}

        {tab === 'applications' && isStaff(profile) && (
          <Card
            title="Fellowship applications"
            note="Accepting someone puts them on the team. As an admin it also gives them writing access."
          >
            <Applications profile={profile} myId={user.id} />
          </Card>
        )}

        {tab === 'inbox' && isStaff(profile) && (
          <Card title="Messages" note="Everything sent from the contact page lands here.">
            <Inbox />
          </Card>
        )}

        {tab === 'people' && isAdmin(profile) && <People myId={user.id} />}

        {tab === 'account' && (
          <div className="max-w-xl">
            <ProfilePanel user={user} profile={profile} onSaved={refreshProfile} />
          </div>
        )}
      </Container>
    </>
  )
}
