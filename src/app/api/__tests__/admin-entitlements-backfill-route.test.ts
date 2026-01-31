import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/admin/entitlements/backfill/route'

const getSubscriptionList = vi.fn(async () => ({
  data: [{ status: 'active', planId: 'plan_1' }],
}))
const getPlan = vi.fn(async () => ({
  id: 'plan_1',
  slug: 'starter',
  name: 'Starter',
  features: ['app-1', 'app-2'],
}))

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(async () => ({
    billing: { getSubscriptionList, getPlan },
  })),
}))

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

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true })),
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

const upsertUserEntitlements = vi.fn(async () => ({}))

vi.mock('@/lib/supabase/entitlements-store', () => ({
  upsertUserEntitlements,
}))

describe('admin entitlements backfill api route', () => {
  it('returns 400 when userIds are missing', async () => {
    const req = new NextRequest(
      'http://localhost/api/admin/entitlements/backfill',
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    )
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('At least one userId is required.')
  })

  it('stores active subscription data', async () => {
    const req = new NextRequest(
      'http://localhost/api/admin/entitlements/backfill',
      {
        method: 'POST',
        body: JSON.stringify({ userId: 'user_1' }),
      }
    )
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(upsertUserEntitlements).toHaveBeenCalledWith({
      userId: 'user_1',
      status: 'active',
      planId: 'plan_1',
      planSlug: 'starter',
      planName: 'Starter',
      features: ['app-1', 'app-2'],
    })
    expect(json.data[0].planId).toBe('plan_1')
  })

  it('stores inactive status when no active subscription', async () => {
    getSubscriptionList.mockResolvedValueOnce({ data: [] })
    const req = new NextRequest(
      'http://localhost/api/admin/entitlements/backfill',
      {
        method: 'POST',
        body: JSON.stringify({ userId: 'user_2' }),
      }
    )
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data[0].status).toBe('inactive')
  })

  it('returns 401 when auth fails', async () => {
    const { checkAdmin } = await import('@/lib/clerk/check-auth')
    vi.mocked(checkAdmin).mockResolvedValueOnce({
      success: false,
      error: { message: 'Unauthorized', status: 401 },
    })
    const req = new NextRequest(
      'http://localhost/api/admin/entitlements/backfill',
      {
        method: 'POST',
        body: JSON.stringify({ userId: 'user_1' }),
      }
    )
    const res = await POST(req)
    expect(res.status).toBe(401)
  })
})
