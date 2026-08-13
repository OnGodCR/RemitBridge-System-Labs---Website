import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, backendEnabled } from './supabase'

const AuthContext = createContext({
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export const authEnabled = backendEnabled

/**
 * Writing access. Signing up alone does not grant it — a new account is a
 * 'member', which can apply for a fellowship and nothing more. The database
 * enforces this too; this is only for hiding UI that would fail anyway.
 */
export const canWrite = (profile) =>
  ['writer', 'editor', 'admin'].includes(profile?.role)

/** Only admins can change other people's roles. Mirrors the RLS policy. */
export const isAdmin = (profile) => profile?.role === 'admin'

/** Reading the contact inbox is staff-only, matching the RLS policy. */
export const isStaff = (profile) => ['editor', 'admin'].includes(profile?.role)

/**
 * Holds the current session and the signed-in person's profile row.
 *
 * Supabase restores the session from storage asynchronously, so `loading`
 * stays true until the first check resolves. Without it, gated pages flash
 * their signed-out state on every refresh.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(backendEnabled)

  useEffect(() => {
    if (!backendEnabled) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const [profileNonce, setProfileNonce] = useState(0)

  // The profile carries the role, which the schema keeps out of user control.
  useEffect(() => {
    if (!backendEnabled || !session?.user) {
      setProfile(null)
      return
    }
    let cancelled = false
    supabase
      .from('profiles')
      .select('id, full_name, role, team, bio, directory_opt_in')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile(data ?? null)
      })
    return () => {
      cancelled = true
    }
  }, [session?.user?.id, profileNonce])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile: () => setProfileNonce((n) => n + 1),
      signOut: async () => {
        if (backendEnabled) await supabase.auth.signOut()
      },
    }),
    [session, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
