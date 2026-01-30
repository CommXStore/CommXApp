import React from 'react'
import { screen } from '@testing-library/react'
import { ContentEntriesTable } from '@/components/content-entries-table'
import type { ContentEntry, ContentType } from '@/lib/clerk/content-schemas'
import { renderWithI18n } from '@/test/render'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/lib/clerk/actions', () => ({
  deleteContentEntryAction: vi.fn(async () => ({})),
}))

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    orgId: 'org_1',
    userId: 'user_1',
    getToken: vi.fn(async () => 'test-token'),
  }),
  useClerk: () => ({
    clerk: {
      apiKeys: {
        getAll: vi.fn(async () => ({ data: [] })),
      },
    },
  }),
}))

const contentType: ContentType = {
  id: 'ct_1',
  name: 'Blog',
  slug: 'blog',
  description: undefined,
  status: 'published',
  icon: undefined,
  fields: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const entries: ContentEntry[] = [
  {
    id: 'ce_1',
    contentTypeId: 'ct_1',
    slug: 'hello',
    status: 'draft',
    fields: {},
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
]

describe('ContentEntriesTable', () => {
  it('renders entries and new entry link', () => {
    renderWithI18n(
      <ContentEntriesTable contentType={contentType} entries={entries} />
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /nova entrada/i })).toBeInTheDocument()
  })
})
