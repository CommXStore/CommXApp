import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/admin/entitlements/route'

vi.mock('@/lib/clerk/check-auth', () => ({
  checkAdmin: vi.fn(async () => ({
    success: true,
    data: {
      orgId: 'org_1',
      userId: 'user_admin',
      tokenType: 'session_token',
      orgRole: 'org:admin',
    },
  })),
}))

vi.mock('@/lib/supabase/entitlements-store', () => ({
  getUserEntitlements: vi.fn(async () => ({
    userId: 'user_1',
    status: 'active',
    planId: 'plan_1',
    planSlug: 'starter',
    planName: 'Starter',
    features: ['app-1'],
    updatedAt: '2026-01-31T00:00:00.000Z',
  })),
}))

describe('admin entitlements api route', () => {
  it('returns 400 when userId is missing', async () => {
    const req = new NextRequest('http://localhost/api/admin/entitlements')
    const res = await GET(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('userId is required.')
  })

  it('returns 200 with entitlements data', async () => {
    const req = new NextRequest(
      'http://localhost/api/admin/entitlements?userId=user_1'
    )
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.userId).toBe('user_1')
  })

  it('returns 401 when auth fails', async () => {
    const { checkAdmin } = await import('@/lib/clerk/check-auth')
    vi.mocked(checkAdmin).mockResolvedValueOnce({
      success: false,
      error: { message: 'Unauthorized', status: 401 },
    })
    const req = new NextRequest(
      'http://localhost/api/admin/entitlements?userId=user_1'
    )
    const res = await GET(req)
    expect(res.status).toBe(401)
  })
})
