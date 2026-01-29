import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/content/[contentTypeSlug]/route'
import { PATCH, DELETE } from '@/app/api/content/[contentTypeSlug]/[entryId]/route'

vi.mock('@/lib/clerk/check-auth', () => {
  return {
    checkAuth: vi.fn(async () => ({
      success: true,
      data: { orgId: 'org_1', userId: 'user_1', tokenType: 'session_token' },
    })),
  }
})

vi.mock('@/lib/clerk/content-entries-utils', () => {
  return {
    getContentEntries: vi.fn(async () => ({
      contentType: { id: 'ct_1', name: 'Blog', slug: 'blog', fields: [] },
      entries: [],
      fields: [],
    })),
    createContentEntry: vi.fn(async () => ({ id: 'ce_1', slug: 'hello' })),
    updateContentEntry: vi.fn(async () => ({ id: 'ce_1', slug: 'hello' })),
    deleteContentEntry: vi.fn(async () => ({ success: true })),
  }
})

describe('content entries api route', () => {
  it('GET returns entries', async () => {
    const res = await GET(new NextRequest('http://localhost'), {
      params: Promise.resolve({ contentTypeSlug: 'blog' }),
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('POST returns 400 on error', async () => {
    const { createContentEntry } = await import('@/lib/clerk/content-entries-utils')
    vi.mocked(createContentEntry).mockRejectedValueOnce(new Error('invalid'))
    const res = await POST(
      new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ fields: {} }),
      }),
      { params: Promise.resolve({ contentTypeSlug: 'blog' }) }
    )
    expect(res.status).toBe(400)
  })

  it('PATCH returns ok', async () => {
    const res = await PATCH(
      new NextRequest('http://localhost', {
        method: 'PATCH',
        body: JSON.stringify({ fields: {} }),
      }),
      { params: Promise.resolve({ contentTypeSlug: 'blog', entryId: 'ce_1' }) }
    )
    expect(res.status).toBe(200)
  })

  it('DELETE returns 400 on error', async () => {
    const { deleteContentEntry } = await import('@/lib/clerk/content-entries-utils')
    vi.mocked(deleteContentEntry).mockRejectedValueOnce(new Error('fail'))
    const res = await DELETE(new NextRequest('http://localhost'), {
      params: Promise.resolve({ contentTypeSlug: 'blog', entryId: 'ce_1' }),
    })
    expect(res.status).toBe(400)
  })
})
