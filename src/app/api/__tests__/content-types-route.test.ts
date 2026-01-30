import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/content-types/route'
import { PATCH, DELETE } from '@/app/api/content-types/[id]/route'

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
  createContentType: vi.fn(async () => ({
    id: 'ct_new',
    name: 'News',
    slug: 'news',
  })),
  updateContentType: vi.fn(async () => ({
    id: 'ct_1',
    name: 'Blog',
    slug: 'blog',
  })),
  deleteContentType: vi.fn(async () => ({ success: true })),
}))

describe('content types api route', () => {
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
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('POST returns 400 on error', async () => {
    const { createContentType } = await import(
      '@/lib/clerk/content-types-utils'
    )
    vi.mocked(createContentType).mockRejectedValueOnce(new Error('invalid'))

    const req = new NextRequest('http://localhost/api/content-types', {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('invalid')
  })

  it('PATCH updates content type', async () => {
    const req = new NextRequest('http://localhost/api/content-types/ct_1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Blog' }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'ct_1' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('PATCH returns 401 when auth fails', async () => {
    const { checkAuth } = await import('@/lib/clerk/check-auth')
    vi.mocked(checkAuth).mockResolvedValueOnce({
      success: false,
      error: { message: 'Unauthorized', status: 401 },
    })
    const req = new NextRequest('http://localhost/api/content-types/ct_1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Blog' }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'ct_1' }) })
    expect(res.status).toBe(401)
  })

  it('DELETE returns 400 on error', async () => {
    const { deleteContentType } = await import(
      '@/lib/clerk/content-types-utils'
    )
    vi.mocked(deleteContentType).mockRejectedValueOnce(new Error('fail'))
    const res = await DELETE(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'ct_1' }),
    })
    expect(res.status).toBe(400)
  })
})
