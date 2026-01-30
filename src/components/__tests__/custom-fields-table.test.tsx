import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithI18n } from '@/test/render'
import { CustomFieldsTable } from '@/components/custom-fields-table'
import type { ContentType, CustomField } from '@/lib/clerk/content-schemas'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/lib/clerk/actions', () => ({
  deleteCustomFieldAction: vi.fn(async () => ({})),
}))

const contentTypes: ContentType[] = [
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

const fields: CustomField[] = [
  {
    id: 'cf_1',
    label: 'Title',
    key: 'title',
    type: 'text',
    options: undefined,
    required: true,
    helpText: undefined,
    attachedTo: ['ct_1'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
]

describe('CustomFieldsTable', () => {
  it('renders rows and add button', () => {
    renderWithI18n(<CustomFieldsTable contentTypes={contentTypes} data={fields} />)
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /adicionar campo/i })).toBeInTheDocument()
  })
})
