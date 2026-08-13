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
 * The role ladder, mirroring public.role_rank in the schema.
 *
 * Every check below is a rank comparison rather than a list of role names, so
 * adding a role in the middle does not mean hunting down each place that
 * happened to enumerate the ones above it. This is the same shape as the SQL
 * so the two cannot quietly disagree.
 *
 * None of this is a security boundary. Row-level security is. Hiding a control
 * here only avoids showing someone a button the database would refuse.
 */
export const ROLE_RANK = {
  member: 1,
  writer: 2,
  editor: 3,
  admin: 4,
  owner: 5,
}

export const ROLE_LABEL = {
  member: 'Member',
  writer: 'Writer',
  editor: 'Editor',
  admin: 'Admin',
  owner: 'Owner',
}

/** 0 for signed out or an unknown role, so every comparison fails closed. */
export const rankOf = (profile) => ROLE_RANK[profile?.role] ?? 0

/**
 * Writing access. Signing up alone does not grant it: a new account is a
 * 'member', which can apply for a fellowship and nothing more.
 */
export const canWrite = (profile) => rankOf(profile) >= ROLE_RANK.writer

/** Reading the contact inbox and reviewing applications. */
export const isStaff = (profile) => rankOf(profile) >= ROLE_RANK.editor

/** Managing other people's roles. */
export const isAdmin = (profile) => rankOf(profile) >= ROLE_RANK.admin

/** Exactly one person, set by supabase/set-owner.sql. Cannot be demoted. */
export const isOwner = (profile) => rankOf(profile) >= ROLE_RANK.owner

/**
 * Whether `actor` may change `target`'s role, and to what.
 *
 * Mirrors the "manage people below you" policy: strictly below your own rank,
 * never yourself. Returned as the list of roles that are actually assignable,
 * which is what the People panel needs to render.
 */
export const assignableRoles = (actor, target) => {
  if (!actor || !target) return []
  // Admin floor: outranking someone is not on its own a licence to hand out
  // access. Matches the policy, which an editor's update would fail anyway.
  if (!isAdmin(actor)) return []
  if (actor.id === target.id) return []
  if (rankOf(target) >= rankOf(actor)) return []
  return Object.keys(ROLE_RANK).filter((r) => ROLE_RANK[r] < rankOf(actor))
}

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
