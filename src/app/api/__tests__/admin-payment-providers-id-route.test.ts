import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { PATCH, DELETE } from '@/app/api/admin/payment-providers/[id]/route'

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
  updatePaymentProvider: vi.fn(async () => ({
    id: 'pp_1',
    name: 'Stripe',
    type: 'stripe',
    enabled: true,
  })),
  deletePaymentProvider: vi.fn(async () => ({ success: true })),
}))

describe('admin payment providers id api route', () => {
  it('PATCH returns 400 on empty name', async () => {
    const req = new NextRequest('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ name: '' }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'pp_1' }) })
    expect(res.status).toBe(400)
  })

  it('PATCH updates provider', async () => {
    const req = new NextRequest('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Stripe' }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'pp_1' }) })
    expect(res.status).toBe(200)
  })

  it('DELETE removes provider', async () => {
    const req = new NextRequest('http://localhost', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'pp_1' }) })
    expect(res.status).toBe(200)
  })
})
