import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/organizations/memberships/route'

const createUser = vi.fn(async () => ({ id: 'user_1' }))
const createOrganizationMembership = vi.fn(async () => ({ id: 'mem_1' }))
const getOrganization = vi.fn(async () => ({ slug: 'app-1' }))
const auth = vi.fn(async () => ({
  isAuthenticated: true,
  userId: 'user_admin',
  orgId: 'org_1',
  tokenType: 'api_key',
}))

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(async () => ({
    users: { createUser, updateUser: vi.fn() },
    organizations: { createOrganizationMembership, getOrganization },
  })),
  auth,
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true })),
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

vi.mock('@/lib/entitlements', () => ({
  entitlements: {
    canJoinOrg: vi.fn(async () => ({ allowed: true })),
  },
}))

describe('organization memberships api route', () => {
  it('returns 400 when email is missing', async () => {
    const req = new NextRequest(
      'http://localhost/api/organizations/memberships',
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    )
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Email is required.')
  })

  it('returns 403 when organization mismatch', async () => {
    const req = new NextRequest(
      'http://localhost/api/organizations/memberships',
      {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          organizationId: 'org_2',
        }),
      }
    )
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('creates user and membership', async () => {
    const req = new NextRequest(
      'http://localhost/api/organizations/memberships',
      {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          firstName: 'User',
          lastName: 'Example',
        }),
      }
    )
    const res = await POST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.userId).toBe('user_1')
    expect(json.data.membershipId).toBe('mem_1')
    expect(createUser).toHaveBeenCalled()
    expect(createOrganizationMembership).toHaveBeenCalledWith({
      organizationId: 'org_1',
      userId: 'user_1',
      role: 'org:member',
    })
  })

  it('returns 401 when auth fails', async () => {
    const { auth: clerkAuth } = await import('@clerk/nextjs/server')
    vi.mocked(clerkAuth).mockResolvedValueOnce({
      isAuthenticated: false,
      userId: null,
      orgId: null,
      tokenType: 'session_token',
    })
    const req = new NextRequest(
      'http://localhost/api/organizations/memberships',
      {
        method: 'POST',
        body: JSON.stringify({ email: 'user@example.com' }),
      }
    )
    const res = await POST(req)
    expect(res.status).toBe(401)
  })
})
