import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Null until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env. */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase is not set up yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.')
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) throw error
}
