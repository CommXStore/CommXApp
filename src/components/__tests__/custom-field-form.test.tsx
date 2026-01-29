import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomFieldForm } from '@/components/custom-field-form'
import type { ContentType } from '@/lib/clerk/content-schemas'

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
    createCustomFieldAction: vi.fn(async () => ({})),
    updateCustomFieldAction: vi.fn(async () => ({})),
  }
})

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

describe('CustomFieldForm', () => {
  it('shows error when label is empty', async () => {
    const user = userEvent.setup()
    render(<CustomFieldForm contentTypes={contentTypes} mode="create" />)

    const submitButton = screen.getByRole('button', { name: /criar campo/i })
    const form = submitButton.closest('form')
    if (form) {
      form.noValidate = true
      fireEvent.submit(form)
    } else {
      await user.click(submitButton)
    }
    expect(
      await screen.findByText((text) => text.includes('Nome é obrigatório'))
    ).toBeInTheDocument()
  })
})
