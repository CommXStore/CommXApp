import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createCustomField,
  deleteCustomField,
  updateCustomField,
} from '@/lib/clerk/custom-fields-utils'
import type { ContentType, CustomField } from '@/lib/clerk/content-schemas'

let store: Awaited<
  ReturnType<
    typeof import('@/lib/clerk/content-repository').contentRepository.getStore
  >
>
let saveSpy: ReturnType<typeof vi.fn>

vi.mock('@/lib/clerk/content-repository', () => ({
  contentRepository: {
    getStore: vi.fn(async () => store),
    saveStore: vi.fn((...args) => {
      saveSpy(...args)
    }),
  },
}))

describe('custom fields utils', () => {
  beforeEach(() => {
    saveSpy = vi.fn()
    store = {
      publicMetadata: {},
      contentTypes: [
        {
          id: 'ct_blog',
          name: 'Blog',
          slug: 'blog',
          description: undefined,
          status: 'published',
          icon: undefined,
          fields: ['cf_title'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'ct_news',
          name: 'News',
          slug: 'news',
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
          attachedTo: ['ct_blog'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ] satisfies CustomField[],
      contentEntries: {
        ct_blog: [
          {
            id: 'ce_1',
            contentTypeId: 'ct_blog',
            slug: 'hello',
            status: 'published',
            fields: { title: 'Hello', body: 'Body' },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    }
  })

  it('creates field with multiple attachments', async () => {
    const field = await createCustomField('org_1', {
      label: 'Category',
      key: 'category',
      type: 'select',
      options: ['News', 'Guides'],
      required: false,
      attachedTo: ['ct_blog', 'ct_news'],
    })

    expect(field.attachedTo).toEqual(['ct_blog', 'ct_news'])
    expect(saveSpy).toHaveBeenCalled()
  })

  it('rejects select without options', async () => {
    await expect(
      createCustomField('org_1', {
        label: 'Category',
        key: 'category',
        type: 'select',
        required: false,
        attachedTo: [],
      })
    ).rejects.toThrow('select')
  })

  it('updates attachments and removes from content types', async () => {
    await updateCustomField('org_1', 'cf_title', {
      label: 'Title',
      key: 'title',
      type: 'text',
      required: true,
      attachedTo: ['ct_news'],
    })

    expect(saveSpy).toHaveBeenCalled()
  })

  it('deletes field and removes from types', async () => {
    await deleteCustomField('org_1', 'cf_title')
    const lastCall = saveSpy.mock.calls.at(-1)
    expect(lastCall).toBeTruthy()
    const payload = lastCall?.[0] as {
      contentTypes: ContentType[]
      contentEntries: typeof store.contentEntries
    }
    const savedContentTypes = payload.contentTypes
    const savedEntries = payload.contentEntries
    expect(savedContentTypes[0].fields).not.toContain('cf_title')
    expect(savedEntries.ct_blog?.[0]?.fields.title).toBeUndefined()
  })
})
