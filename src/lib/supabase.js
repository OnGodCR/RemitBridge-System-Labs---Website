import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''

/**
 * Whether the backend is configured.
 *
 * `createClient` throws on empty credentials, which would take down the whole
 * site. Everything that touches Supabase checks this first, so the public pages
 * keep working if the env file is missing.
 */
export const backendEnabled = Boolean(url && key)

/**
 * Browser client. Uses the publishable key, which is public by design — every
 * rule that actually protects data is a row-level security policy in the
 * database, not a check in this file.
 */
export const supabase = backendEnabled
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
