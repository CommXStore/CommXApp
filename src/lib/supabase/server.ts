import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

export async function getSupabaseServerClient(token?: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY is not set')
  }

  let accessToken = token ?? null
  if (!accessToken) {
    const { getToken } = await auth()
    accessToken = await getToken()
  }
  if (!accessToken) {
    throw new Error('Missing Clerk session token for Supabase')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    accessToken: async () => accessToken,
  })
}
