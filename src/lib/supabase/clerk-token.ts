import { auth } from '@clerk/nextjs/server'

function parseJwtPayload(token: string) {
  const [, payload] = token.split('.')
  if (!payload) {
    return null
  }
  try {
    const json = Buffer.from(payload, 'base64url').toString('utf-8')
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

function hasOrgClaim(payload: Record<string, unknown> | null) {
  if (!payload || typeof payload !== 'object') {
    return false
  }
  if (typeof payload.org_id === 'string' && payload.org_id.length > 0) {
    return true
  }
  const orgObject = payload.o
  if (
    orgObject &&
    typeof orgObject === 'object' &&
    typeof (orgObject as Record<string, unknown>).id === 'string'
  ) {
    return (orgObject as Record<string, unknown>).id !== ''
  }
  return false
}

export async function getSupabaseToken() {
  const { getToken } = await auth()
  const token = await getToken()
  if (!token) {
    throw new Error('Missing Clerk session token for Supabase')
  }
  const payload = parseJwtPayload(token)
  if (!hasOrgClaim(payload)) {
    throw new Error('Missing org claim in Clerk token for Supabase RLS')
  }
  return token
}
