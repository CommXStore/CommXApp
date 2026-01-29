import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentEntryForm } from '@/components/content-entry-form'
import type { ContentType, CustomField } from '@/lib/clerk/content-schemas'

vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      refresh: vi.fn(),
    }),
  }
})

vi.mock('@/lib/clerk/actions', () => {
  return {
    createContentEntryAction: vi.fn(async () => ({})),
    updateContentEntryAction: vi.fn(async () => ({})),
  }
})

const contentType: ContentType = {
  id: 'ct_1',
  name: 'Blog',
  slug: 'blog',
  description: undefined,
  status: 'published',
  icon: undefined,
  fields: ['cf_title', 'cf_views'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const fields: CustomField[] = [
  {
    id: 'cf_title',
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
  {
    id: 'cf_views',
    label: 'Views',
    key: 'views',
    type: 'number',
    options: undefined,
    required: false,
    helpText: undefined,
    attachedTo: ['ct_1'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
]

describe('ContentEntryForm', () => {
  it('shows required error when title is empty', async () => {
    const user = userEvent.setup()
    render(
      <ContentEntryForm contentType={contentType} fields={fields} mode="create" />
    )

    const submitButton = screen.getByRole('button', { name: /criar entrada/i })
    const form = submitButton.closest('form')
    if (form) {
      form.noValidate = true
      fireEvent.submit(form)
    } else {
      await user.click(submitButton)
    }
    expect(
      await screen.findByText((text) => text.includes('Campo obrigatório'))
    ).toBeInTheDocument()
  })

  it('shows slug error when invalid', async () => {
    const user = userEvent.setup()
    render(
      <ContentEntryForm contentType={contentType} fields={fields} mode="create" />
    )

    await user.type(screen.getByLabelText('Slug'), 'Slug Inválido')
    const submitButton = screen.getByRole('button', { name: /criar entrada/i })
    const form = submitButton.closest('form')
    if (form) {
      form.noValidate = true
      fireEvent.submit(form)
    } else {
      await user.click(submitButton)
    }
    expect(
      await screen.findByText((text) => text.includes('Slug inválido'))
    ).toBeInTheDocument()
  })
})
