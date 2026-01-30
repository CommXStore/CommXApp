import React from 'react'
import { screen } from '@testing-library/react'
import { ContentTypesTable } from '@/components/content-types-table'
import type { ContentType } from '@/lib/clerk/content-schemas'
import { renderWithI18n } from '@/test/render'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/lib/clerk/actions', () => ({
  deleteContentTypeAction: vi.fn(async () => ({})),
}))

const items: ContentType[] = [
  {
    id: 'ct_1',
    name: 'Blog',
    slug: 'blog',
    description: undefined,
    status: 'published',
    icon: undefined,
    fields: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
]

describe('ContentTypesTable', () => {
  it('renders rows and add button', () => {
    renderWithI18n(<ContentTypesTable data={items} />)
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /adicionar tipo/i })).toBeInTheDocument()
  })
})
