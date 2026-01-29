import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentTypeForm } from '@/components/content-type-form'
import { CustomFieldForm } from '@/components/custom-field-form'
import { ContentEntryForm } from '@/components/content-entry-form'
import type { ContentType, CustomField } from '@/lib/clerk/content-schemas'

const createContentTypeAction = vi.fn(async () => ({}))
const createCustomFieldAction = vi.fn(async () => ({}))
const createContentEntryAction = vi.fn(async () => ({}))

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
    createContentTypeAction: (...args: unknown[]) =>
      createContentTypeAction(...args),
    createCustomFieldAction: (...args: unknown[]) =>
      createCustomFieldAction(...args),
    createContentEntryAction: (...args: unknown[]) =>
      createContentEntryAction(...args),
    updateContentTypeAction: vi.fn(async () => ({})),
    updateCustomFieldAction: vi.fn(async () => ({})),
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
  fields: ['cf_title'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const customField: CustomField = {
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
}

describe('Forms flow', () => {
  it('creates content type', async () => {
    const user = userEvent.setup()
    render(<ContentTypeForm customFields={[]} mode="create" />)

    await user.type(screen.getByLabelText('Nome'), 'Articles')
    const submitButton = screen.getByRole('button', { name: /criar tipo/i })
    const form = submitButton.closest('form')
    if (form) {
      form.noValidate = true
      await act(async () => {
        fireEvent.submit(form)
      })
    }

    expect(createContentTypeAction).toHaveBeenCalled()
  })

  it('creates custom field', async () => {
    const user = userEvent.setup()
    render(<CustomFieldForm contentTypes={[contentType]} mode="create" />)

    await user.type(screen.getByLabelText('Nome'), 'Title')
    const submitButton = screen.getByRole('button', { name: /criar campo/i })
    const form = submitButton.closest('form')
    if (form) {
      form.noValidate = true
      await act(async () => {
        fireEvent.submit(form)
      })
    }

    expect(createCustomFieldAction).toHaveBeenCalled()
  })

  it('creates content entry', async () => {
    const user = userEvent.setup()
    render(
      <ContentEntryForm
        contentType={contentType}
        fields={[customField]}
        mode="create"
      />
    )

    await user.type(screen.getByPlaceholderText('title'), 'Hello')
    const submitButton = screen.getByRole('button', { name: /criar entrada/i })
    const form = submitButton.closest('form')
    if (form) {
      form.noValidate = true
      await act(async () => {
        fireEvent.submit(form)
      })
    }

    expect(createContentEntryAction).toHaveBeenCalled()
  })
})
