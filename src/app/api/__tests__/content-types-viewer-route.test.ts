import { describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/content-types/viewer/route'

vi.mock('@/lib/supabase/clerk-token', () => ({
  getSupabaseToken: vi.fn(async () => 'token'),
}))

vi.mock('@/lib/clerk/check-auth', () => ({
  checkAuth: vi.fn(async () => ({
    success: true,
    data: { orgId: 'org_1', userId: 'user_1', tokenType: 'session_token' },
  })),
}))

vi.mock('@/lib/clerk/content-types-utils', () => ({
  getContentTypes: vi.fn(async () => [
    { id: 'ct_1', name: 'Blog', slug: 'blog' },
  ]),
}))

describe('content types viewer api route', () => {
  it('GET returns list', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('GET returns 401 when auth fails', async () => {
    const { checkAuth } = await import('@/lib/clerk/check-auth')
    vi.mocked(checkAuth).mockResolvedValueOnce({
      success: false,
      error: { message: 'Unauthorized', status: 401 },
    })
    const res = await GET()
    expect(res.status).toBe(401)
  })
})
