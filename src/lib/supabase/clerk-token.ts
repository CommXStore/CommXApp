import { auth } from '@clerk/nextjs/server'

export async function getSupabaseToken() {
  const { getToken } = await auth()
  const token = await getToken()
  if (!token) {
    throw new Error('Missing Clerk session token for Supabase')
  }
  return token
}
