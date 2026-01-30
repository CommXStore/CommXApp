import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/custom-fields/route'
import { PATCH, DELETE } from '@/app/api/custom-fields/[id]/route'

vi.mock('@/lib/clerk/check-auth', () => ({
  checkAdmin: vi.fn(async () => ({
    success: true,
    data: {
      orgId: 'org_1',
      userId: 'user_1',
      tokenType: 'session_token',
      orgRole: 'org:admin',
    },
  })),
}))

vi.mock('@/lib/clerk/custom-fields-utils', () => ({
  getCustomFields: vi.fn(async () => [
    { id: 'cf_1', label: 'Title', key: 'title' },
  ]),
  createCustomField: vi.fn(async () => ({
    id: 'cf_new',
    label: 'Category',
    key: 'category',
  })),
  updateCustomField: vi.fn(async () => ({
    id: 'cf_1',
    label: 'Title',
    key: 'title',
  })),
  deleteCustomField: vi.fn(async () => ({ success: true })),
}))

describe('custom fields api route', () => {
  it('GET returns list', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('GET returns 401 when auth fails', async () => {
    const { checkAdmin } = await import('@/lib/clerk/check-auth')
    vi.mocked(checkAdmin).mockResolvedValueOnce({
      success: false,
      error: { message: 'Unauthorized', status: 401 },
    })
    const res = await GET()
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('POST returns 400 on error', async () => {
    const { createCustomField } = await import(
      '@/lib/clerk/custom-fields-utils'
    )
    vi.mocked(createCustomField).mockRejectedValueOnce(new Error('invalid'))

    const req = new NextRequest('http://localhost/api/custom-fields', {
      method: 'POST',
      body: JSON.stringify({ label: '' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('PATCH returns ok', async () => {
    const req = new NextRequest('http://localhost/api/custom-fields/cf_1', {
      method: 'PATCH',
      body: JSON.stringify({ label: 'Title' }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'cf_1' }) })
    expect(res.status).toBe(200)
  })

  it('PATCH returns 401 when auth fails', async () => {
    const { checkAdmin } = await import('@/lib/clerk/check-auth')
    vi.mocked(checkAdmin).mockResolvedValueOnce({
      success: false,
      error: { message: 'Unauthorized', status: 401 },
    })
    const req = new NextRequest('http://localhost/api/custom-fields/cf_1', {
      method: 'PATCH',
      body: JSON.stringify({ label: 'Title' }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'cf_1' }) })
    expect(res.status).toBe(401)
  })

  it('DELETE returns 400 on error', async () => {
    const { deleteCustomField } = await import(
      '@/lib/clerk/custom-fields-utils'
    )
    vi.mocked(deleteCustomField).mockRejectedValueOnce(new Error('fail'))
    const res = await DELETE(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'cf_1' }),
    })
    expect(res.status).toBe(400)
  })
})
