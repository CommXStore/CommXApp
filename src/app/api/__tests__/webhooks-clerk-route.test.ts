import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/webhooks/clerk/route'

const getPlan = vi.hoisted(() =>
  vi.fn(async () => ({
    slug: 'starter',
    name: 'Starter',
    features: [],
  }))
)
const getPlanList = vi.hoisted(() =>
  vi.fn(async () => ({
    data: [
      {
        id: 'plan_1',
        slug: 'starter',
        name: 'Starter',
        features: [],
      },
    ],
  }))
)
const getSubscriptionList = vi.hoisted(() =>
  vi.fn(async () => ({
    data: [],
  }))
)
const getOrganization = vi.hoisted(() => vi.fn(async () => ({ id: 'org_1' })))
const deleteOrganizationMembership = vi.hoisted(() => vi.fn(async () => ({})))
const upsertUserEntitlements = vi.hoisted(() =>
  vi.fn(async () => ({
    userId: 'user_1',
    status: 'active',
    planId: 'plan_1',
    planSlug: 'starter',
    planName: 'Starter',
    features: [],
    updatedAt: new Date().toISOString(),
  }))
)
const verifyWebhook = vi.hoisted(() => vi.fn())

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(async () => ({
    billing: { getPlan, getPlanList, getSubscriptionList },
    organizations: { getOrganization, deleteOrganizationMembership },
  })),
}))

vi.mock('@clerk/backend/webhooks', () => ({ verifyWebhook }))

vi.mock('@/lib/supabase/entitlements-store', () => ({
  upsertUserEntitlements,
}))

function buildRequest(body: string, headers?: HeadersInit) {
  return new NextRequest('http://localhost/api/webhooks/clerk', {
    method: 'POST',
    body,
    headers,
  })
}

describe('clerk webhook route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns 500 when webhook secret is missing', async () => {
    process.env.CLERK_WEBHOOK_SECRET = undefined
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = undefined
    const req = buildRequest('{"type":"subscriptionItem.created"}', {
      'svix-id': 'msg_1',
      'svix-timestamp': '123',
      'svix-signature': 'v1,signature',
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('Missing webhook signing secret.')
    expect(verifyWebhook).not.toHaveBeenCalled()
  })

  it('returns 400 when payload is empty', async () => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test'
    const req = buildRequest('', {
      'svix-id': 'msg_1',
      'svix-timestamp': '123',
      'svix-signature': 'v1,signature',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Webhook payload is empty.')
    expect(verifyWebhook).not.toHaveBeenCalled()
  })

  it('returns 400 when verification fails', async () => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test'
    verifyWebhook.mockRejectedValueOnce(new Error('bad signature'))
    const req = buildRequest('{"type":"subscriptionItem.created"}', {
      'svix-id': 'msg_1',
      'svix-timestamp': '123',
      'svix-signature': 'v1,signature',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Webhook verification failed.')
  })

  it('persists entitlements for subscription events', async () => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test'
    verifyWebhook.mockResolvedValueOnce({
      type: 'subscriptionItem.created',
      data: {
        status: 'active',
        plan_id: 'plan_1',
        payer: { user_id: 'user_1' },
      },
    })
    const req = buildRequest('{"type":"subscriptionItem.created"}', {
      'svix-id': 'msg_1',
      'svix-timestamp': '123',
      'svix-signature': 'v1,signature',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(upsertUserEntitlements).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_1',
        status: 'active',
        planId: 'plan_1',
      })
    )
  })

  it('prefers active subscription when event is ended', async () => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test'
    getSubscriptionList.mockResolvedValueOnce({
      data: [
        {
          status: 'active',
          planId: 'plan_active',
          planSlug: 'pro',
          planName: 'Pro',
        },
      ],
    })
    getPlan.mockResolvedValueOnce({
      id: 'plan_active',
      slug: 'pro',
      name: 'Pro',
      features: ['commx_shop'],
    })
    verifyWebhook.mockResolvedValueOnce({
      type: 'subscriptionItem.ended',
      data: {
        status: 'ended',
        plan_id: 'plan_old',
        payer: { user_id: 'user_1' },
      },
    })
    const req = buildRequest('{"type":"subscriptionItem.ended"}', {
      'svix-id': 'msg_1',
      'svix-timestamp': '123',
      'svix-signature': 'v1,signature',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(upsertUserEntitlements).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_1',
        status: 'active',
        planId: 'plan_active',
      })
    )
  })

  it('prefers active subscription with features over active without features', async () => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test'
    getSubscriptionList.mockResolvedValueOnce({
      data: [
        {
          status: 'active',
          planId: 'plan_free',
          planSlug: 'free_user',
          planName: 'Free',
        },
        {
          status: 'active',
          planId: 'plan_paid',
          planSlug: 'lite',
          planName: 'Lite',
        },
      ],
    })
    getPlan.mockImplementation(async (planId: string) => ({
      id: planId,
      slug: planId === 'plan_paid' ? 'lite' : 'free_user',
      name: planId === 'plan_paid' ? 'Lite' : 'Free',
      features: planId === 'plan_paid' ? ['commx_shop'] : [],
    }))
    verifyWebhook.mockResolvedValueOnce({
      type: 'subscriptionItem.active',
      data: {
        status: 'active',
        plan_id: 'plan_free',
        payer: { user_id: 'user_1' },
      },
    })
    const req = buildRequest('{"type":"subscriptionItem.active"}', {
      'svix-id': 'msg_1',
      'svix-timestamp': '123',
      'svix-signature': 'v1,signature',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(upsertUserEntitlements).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_1',
        status: 'active',
        planId: 'plan_paid',
      })
    )
  })

  it('revokes memberships for ended subscriptions', async () => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test'
    getPlan.mockResolvedValueOnce({
      slug: 'starter',
      name: 'Starter',
      features: ['commx_shop', 'another_app'],
    })
    verifyWebhook.mockResolvedValueOnce({
      type: 'subscriptionItem.ended',
      data: {
        status: 'ended',
        plan_id: 'plan_1',
        payer: { user_id: 'user_1' },
      },
    })
    const req = buildRequest('{"type":"subscriptionItem.ended"}', {
      'svix-id': 'msg_1',
      'svix-timestamp': '123',
      'svix-signature': 'v1,signature',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(deleteOrganizationMembership).toHaveBeenCalledWith({
      organizationId: 'org_1',
      userId: 'user_1',
    })
    expect(getOrganization).toHaveBeenCalledWith({ slug: 'commx-shop' })
  })
})
