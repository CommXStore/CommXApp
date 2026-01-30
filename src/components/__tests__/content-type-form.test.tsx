import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentTypeForm } from '@/components/content-type-form'
import type { CustomField } from '@/lib/clerk/content-schemas'
import { renderWithI18n } from '@/test/render'

const CREATE_TYPE_LABEL = /criar tipo/i

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/lib/clerk/actions', () => ({
  createContentTypeAction: vi.fn(async () => ({})),
  updateContentTypeAction: vi.fn(async () => ({})),
}))

const fields: CustomField[] = [
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
]

describe('ContentTypeForm', () => {
  it('shows error when name is empty', async () => {
    const user = userEvent.setup()
    renderWithI18n(<ContentTypeForm customFields={fields} mode="create" />)

    const submitButton = screen.getByRole('button', { name: CREATE_TYPE_LABEL })
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

  it('shows error when slug is invalid', async () => {
    const user = userEvent.setup()
    renderWithI18n(<ContentTypeForm customFields={fields} mode="create" />)

    await user.type(screen.getByLabelText('Slug'), 'Slug Inválido')
    const submitButton = screen.getByRole('button', { name: CREATE_TYPE_LABEL })
    const form = submitButton.closest('form')
    if (form) {
      form.noValidate = true
      fireEvent.submit(form)
    } else {
      await user.click(submitButton)
    }
    expect(
      await screen.findByText(text => text.includes('Slug inválido'))
    ).toBeInTheDocument()
  })
})
