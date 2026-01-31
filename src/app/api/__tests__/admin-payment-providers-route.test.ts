import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/admin/payment-providers/route'

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

vi.mock('@/lib/supabase/clerk-token', () => ({
  getSupabaseToken: vi.fn(async () => 'token'),
}))

vi.mock('@/lib/supabase/payment-providers', () => ({
  listPaymentProviders: vi.fn(async () => [
    { id: 'pp_1', name: 'Stripe', type: 'stripe', enabled: true },
  ]),
  createPaymentProvider: vi.fn(async () => ({
    id: 'pp_2',
    name: 'Manual',
    type: 'manual',
    enabled: true,
  })),
}))

describe('admin payment providers api route', () => {
  it('GET returns list', async () => {
    const res = await GET(new NextRequest('http://localhost'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('POST returns 400 on missing fields', async () => {
    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ name: 'Stripe' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('POST creates provider', async () => {
    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Manual',
        type: 'manual',
        signingSecret: 'secret',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})
