import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createContentType,
  deleteContentType,
  updateContentType,
} from '@/lib/clerk/content-types-utils'
import type {
  ContentType,
  CustomField,
} from '@/lib/clerk/content-schemas'

let store: Awaited<
  ReturnType<typeof import('@/lib/clerk/content-store').getContentStore>
>
let saveSpy: ReturnType<typeof vi.fn>

vi.mock('@/lib/clerk/content-store', () => {
  return {
    getContentStore: vi.fn(async () => store),
    saveContentStore: vi.fn(async (...args) => {
      saveSpy(...args)
    }),
  }
})

describe('content types utils', () => {
  beforeEach(() => {
    saveSpy = vi.fn()
    store = {
      clerk: {} as never,
      publicMetadata: {},
      contentTypes: [
        {
          id: 'ct_blog',
          name: 'Blog',
          slug: 'blog',
          description: undefined,
          status: 'published',
          icon: undefined,
          fields: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ] satisfies ContentType[],
      customFields: [
        {
          id: 'cf_title',
          label: 'Title',
          key: 'title',
          type: 'text',
          options: undefined,
          required: true,
          helpText: undefined,
          attachedTo: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ] satisfies CustomField[],
      contentEntries: {},
    }
  })

  it('creates content type with unique slug and attaches fields', async () => {
    const contentType = await createContentType('org_1', {
      name: 'News',
      slug: 'news',
      status: 'draft',
      fields: ['cf_title'],
    })

    expect(contentType.slug).toBe('news')
    expect(saveSpy).toHaveBeenCalled()
  })

  it('rejects duplicate slug', async () => {
    await expect(
      createContentType('org_1', {
        name: 'Blog Duplicate',
        slug: 'blog',
        status: 'draft',
        fields: [],
      })
    ).rejects.toThrow('Slug já existe')
  })

  it('updates type and detaches fields not selected', async () => {
    await updateContentType('org_1', 'ct_blog', {
      name: 'Blog',
      slug: 'blog',
      status: 'published',
      fields: [],
    })

    expect(saveSpy).toHaveBeenCalled()
  })

  it('deletes type and removes entry bucket', async () => {
    await deleteContentType('org_1', 'ct_blog')
    expect(saveSpy).toHaveBeenCalled()
  })
})
