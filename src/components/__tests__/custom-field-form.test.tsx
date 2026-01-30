import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomFieldForm } from '@/components/custom-field-form'
import type { ContentType } from '@/lib/clerk/content-schemas'
import { renderWithI18n } from '@/test/render'

const CREATE_FIELD_LABEL = /criar campo/i

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/lib/clerk/actions/custom-fields', () => ({
  createCustomFieldAction: vi.fn(async () => ({})),
  updateCustomFieldAction: vi.fn(async () => ({})),
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

describe('CustomFieldForm', () => {
  it('shows error when label is empty', async () => {
    const user = userEvent.setup()
    renderWithI18n(
      <CustomFieldForm contentTypes={contentTypes} mode="create" />
    )

    const submitButton = screen.getByRole('button', {
      name: CREATE_FIELD_LABEL,
    })
    const form = submitButton.closest('form')
    if (form) {
      form.noValidate = true
      fireEvent.submit(form)
    } else {
      await user.click(submitButton)
    }
    expect(
      await screen.findByText(text => text.includes('Nome é obrigatório'))
    ).toBeInTheDocument()
  })
})
