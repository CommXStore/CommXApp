import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  createContentEntry,
  updateContentEntry,
} from '@/lib/clerk/content-entries-utils'
import type { ContentEntry } from '@/lib/clerk/content-schemas'

let store: Awaited<ReturnType<typeof import('@/lib/clerk/content-store').getContentStore>>
let saveSpy: ReturnType<typeof vi.fn>

vi.mock('@/lib/clerk/content-store', () => {
  return {
    getContentStore: vi.fn(async () => store),
    saveContentStore: vi.fn(async (...args) => {
      saveSpy(...args)
    }),
  }
})

describe('content entries utils', () => {
  beforeEach(() => {
    saveSpy = vi.fn()
    store = {
      clerk: {} as never,
      publicMetadata: {},
      contentTypes: [
        {
          id: 'ct_posts',
          name: 'Posts',
          slug: 'posts',
          description: 'Blog posts',
          status: 'published',
          icon: undefined,
          fields: ['cf_title', 'cf_category'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      customFields: [
        {
          id: 'cf_title',
          label: 'Title',
          key: 'title',
          type: 'text',
          options: undefined,
          required: true,
          helpText: undefined,
          attachedTo: ['ct_posts'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'cf_category',
          label: 'Category',
          key: 'category',
          type: 'select',
          options: ['News', 'Guides'],
          required: false,
          helpText: undefined,
          attachedTo: ['ct_posts'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      contentEntries: {
        ct_posts: [
          {
            id: 'ce_1',
            contentTypeId: 'ct_posts',
            slug: 'hello-world',
            status: 'draft',
            fields: { title: 'Hello World', category: 'News' },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    }
  })

  it('creates entry with slug from title', async () => {
    const entry = await createContentEntry('org_1', 'posts', {
      fields: { title: 'My New Post', category: 'Guides' },
    })

    expect(entry.slug).toBe('my-new-post')
    expect(saveSpy).toHaveBeenCalled()
  })

  it('rejects missing required fields', async () => {
    await expect(
      createContentEntry('org_1', 'posts', {
        fields: { title: '' },
      })
    ).rejects.toThrow('Campo obrigatório ausente')
  })

  it('rejects invalid select option', async () => {
    await expect(
      createContentEntry('org_1', 'posts', {
        fields: { title: 'Some', category: 'Invalid' },
      })
    ).rejects.toThrow('opção inválida')
  })

  it('rejects duplicate slug on update', async () => {
    const entries = store.contentEntries.ct_posts as ContentEntry[]
    entries.push({
      id: 'ce_2',
      contentTypeId: 'ct_posts',
      slug: 'duplicate',
      status: 'draft',
      fields: { title: 'Other' },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    })

    await expect(
      updateContentEntry('org_1', 'posts', 'ce_1', {
        slug: 'duplicate',
        fields: { title: 'Hello World', category: 'News' },
      })
    ).rejects.toThrow('Slug já existe')
  })
})
