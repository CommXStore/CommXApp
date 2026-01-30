'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ICON_SELECTION_NAMES,
  getIconByName,
  isIconName,
  normalizeIconName,
} from '@/lib/icon-map'
import {
  createContentTypeAction,
  updateContentTypeAction,
} from '@/lib/clerk/actions/content-types'
import { isKebabCase } from '@/lib/content-utils'
import type { ContentType, CustomField } from '@/lib/clerk/content-schemas'
import { useTranslations } from '@/i18n/provider'

type ContentTypeFormProps = {
  mode: 'create' | 'edit'
  customFields: CustomField[]
  initialData?: ContentType | null
}

const ICON_LABEL_KEY_MAP: Record<string, string> = {
  'book-open': 'bookOpen',
  'clipboard-list': 'clipboardList',
  'file-text': 'fileText',
  'grid-3x3': 'grid',
  'layout-grid': 'layoutGrid',
  'message-square': 'message',
  'ticket-check': 'ticket',
}

const ICON_OPTIONS = [
  { value: 'none', labelKey: 'none' },
  ...ICON_SELECTION_NAMES.map(value => ({
    value,
    labelKey: ICON_LABEL_KEY_MAP[value] ?? value,
  })),
]

function validateContentType(
  name: string,
  slug: string,
  t: (key: string, params?: Record<string, string | number>) => string
) {
  const nextErrors: Record<string, string> = {}
  if (!name) {
    nextErrors.name = t('routes.content-types.form.errors.nameRequired')
  }
  if (slug && !isKebabCase(slug)) {
    nextErrors.slug = t('routes.content-types.form.errors.invalidSlug')
  }
  return nextErrors
}

function buildContentTypePayload({
  name,
  slug,
  descriptionRaw,
  iconRaw,
  status,
  selectedFields,
}: {
  name: string
  slug: string
  descriptionRaw: string
  iconRaw: string
  status: ContentType['status']
  selectedFields: string[]
}) {
  return {
    name,
    slug: slug || undefined,
    description: descriptionRaw || undefined,
    status,
    icon: iconRaw || undefined,
    fields: selectedFields,
  }
}

export function ContentTypeForm({
  mode,
  customFields,
  initialData,
}: ContentTypeFormProps) {
  const router = useRouter()
  const t = useTranslations()
  const initialIcon = initialData?.icon
    ? normalizeIconName(initialData.icon)
    : 'none'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<ContentType['status']>(
    initialData?.status ?? 'draft'
  )
  const [selectedFields, setSelectedFields] = useState<string[]>(
    initialData?.fields ?? []
  )
  const [icon, setIcon] = useState<string>(
    initialIcon && isIconName(initialIcon) ? initialIcon : 'none'
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const availableFields = useMemo(() => customFields, [customFields])

  function toggleField(fieldId: string, nextValue: boolean) {
    setSelectedFields(prev =>
      nextValue ? [...prev, fieldId] : prev.filter(id => id !== fieldId)
    )
  }

  async function persistContentType(payload: {
    name: string
    slug?: string
    description?: string
    status: ContentType['status']
    icon?: string
    fields: string[]
  }) {
    if (mode === 'create') {
      await createContentTypeAction(payload)
      toast.success(t('routes.content-types.form.toasts.created'))
      return
    }
    if (initialData) {
      await updateContentTypeAction(initialData.id, payload)
      toast.success(t('routes.content-types.form.toasts.updated'))
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const slug = String(formData.get('slug') ?? '').trim()
    const descriptionRaw = String(formData.get('description') ?? '').trim()
    const iconRaw = icon === 'none' ? '' : icon

    const nextErrors = validateContentType(name, slug, t)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setIsSubmitting(false)
      return
    }

    setErrors({})

    const payload = buildContentTypePayload({
      name,
      slug,
      descriptionRaw,
      iconRaw,
      status,
      selectedFields,
    })

    try {
      await persistContentType(payload)
      router.push('/content-types')
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('common.errors.saveFailed')
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">
              {t('routes.content-types.form.fields.name.label')}
            </FieldLabel>
            <FieldDescription>
              {t('routes.content-types.form.fields.name.description')}
            </FieldDescription>
            <Input
              defaultValue={initialData?.name ?? ''}
              id="name"
              name="name"
              placeholder={t(
                'routes.content-types.form.fields.name.placeholder'
              )}
              required
              type="text"
            />
            {errors.name && <FieldError>{errors.name}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="slug">
              {t('routes.content-types.form.fields.slug.label')}
            </FieldLabel>
            <FieldDescription>
              {t('routes.content-types.form.fields.slug.description')}
            </FieldDescription>
            <Input
              defaultValue={initialData?.slug ?? ''}
              id="slug"
              name="slug"
              placeholder={t(
                'routes.content-types.form.fields.slug.placeholder'
              )}
              type="text"
            />
            {errors.slug && <FieldError>{errors.slug}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="description">
              {t('routes.content-types.form.fields.description.label')}
            </FieldLabel>
            <Input
              defaultValue={initialData?.description ?? ''}
              id="description"
              name="description"
              placeholder={t(
                'routes.content-types.form.fields.description.placeholder'
              )}
              type="text"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="icon">
              {t('routes.content-types.form.fields.icon.label')}
            </FieldLabel>
            <FieldDescription>
              {t('routes.content-types.form.fields.icon.description')}
            </FieldDescription>
            <Select onValueChange={setIcon} value={icon || 'none'}>
              <SelectTrigger id="icon">
                <SelectValue
                  placeholder={t(
                    'routes.content-types.form.fields.icon.placeholder'
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map(option => {
                  const Icon = getIconByName(
                    option.value === 'none' ? undefined : option.value
                  )
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <Icon className="size-4" />
                        {t(
                          `routes.content-types.form.fields.icon.options.${option.labelKey}`
                        )}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>
              {t('routes.content-types.form.fields.status.label')}
            </FieldLabel>
            <Select
              onValueChange={value => setStatus(value as ContentType['status'])}
              value={status}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t('common.placeholders.selectStatus')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">
                  {t('common.status.draft')}
                </SelectItem>
                <SelectItem value="published">
                  {t('common.status.published')}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>
              {t('routes.content-types.form.fields.customFields.label')}
            </FieldLabel>
            <FieldDescription>
              {t('routes.content-types.form.fields.customFields.description')}
            </FieldDescription>
            <div className="flex flex-col gap-3 rounded-md border p-4">
              {availableFields.length ? (
                availableFields.map(field => {
                  const checkboxId = `content-type-field-${field.id}`
                  return (
                    <div className="flex items-center gap-2" key={field.id}>
                      <Checkbox
                        checked={selectedFields.includes(field.id)}
                        id={checkboxId}
                        onCheckedChange={value =>
                          toggleField(field.id, Boolean(value))
                        }
                      />
                      <label htmlFor={checkboxId}>
                        {field.label}{' '}
                        <span className="text-muted-foreground">
                          ({field.key})
                        </span>
                      </label>
                    </div>
                  )
                })
              ) : (
                <span className="text-muted-foreground text-sm">
                  {t('routes.content-types.form.fields.customFields.empty')}
                </span>
              )}
              <Button asChild size="sm" variant="outline">
                <Link href="/custom-fields/new">
                  {t('routes.content-types.form.fields.customFields.add')}
                </Link>
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex items-center gap-2">
        <Button disabled={isSubmitting} type="submit">
          {mode === 'create'
            ? t('routes.content-types.form.actions.create')
            : t('common.actions.saveChanges')}
        </Button>
        <Button asChild variant="outline">
          <Link href="/content-types">{t('common.actions.cancel')}</Link>
        </Button>
      </div>
    </form>
  )
}
