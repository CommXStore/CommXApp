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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CustomFieldInput } from '@/components/custom-field-input'
import {
  createContentEntryAction,
  updateContentEntryAction,
} from '@/lib/clerk/actions/content-entries'
import { isKebabCase } from '@/lib/content-utils'
import type {
  ContentEntry,
  ContentType,
  CustomField,
} from '@/lib/clerk/content-schemas'
import { useTranslations } from '@/i18n/provider'

type ContentEntryFormProps = {
  mode: 'create' | 'edit'
  contentType: ContentType
  fields: CustomField[]
  initialData?: ContentEntry | null
}

type FieldValues = Record<string, unknown>

function validateSlug(
  trimmedSlug: string,
  t: (key: string, params?: Record<string, string | number>) => string
) {
  if (!trimmedSlug) {
    return null
  }
  return isKebabCase(trimmedSlug) ? null : t('common.errors.invalidSlug')
}

function validateEntryFields(
  fields: CustomField[],
  values: FieldValues,
  t: (key: string, params?: Record<string, string | number>) => string
) {
  const nextErrors: Record<string, string> = {}

  for (const field of fields) {
    const value = values[field.key]
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')

    if (field.required && field.type !== 'boolean' && isEmpty) {
      nextErrors[field.key] = t('common.errors.requiredField')
      continue
    }

    if (field.type === 'number' && !isEmpty) {
      const numericValue = Number(value)
      if (Number.isNaN(numericValue)) {
        nextErrors[field.key] = t('common.errors.invalidNumber')
      }
    }

    if (
      field.type === 'select' &&
      !isEmpty &&
      !field.options?.includes(String(value))
    ) {
      nextErrors[field.key] = t('common.errors.invalidOption')
    }
  }

  return nextErrors
}

export function ContentEntryForm({
  mode,
  contentType,
  fields,
  initialData,
}: ContentEntryFormProps) {
  const router = useRouter()
  const t = useTranslations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<ContentEntry['status']>(
    initialData?.status ?? 'draft'
  )
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const initialValues = useMemo(() => {
    const initialValuesMap: FieldValues = {}
    for (const field of fields) {
      const value = initialData?.fields?.[field.key]
      if (field.type === 'boolean') {
        initialValuesMap[field.key] = Boolean(value)
        continue
      }
      if (field.type === 'date' && typeof value === 'string') {
        const date = new Date(value)
        initialValuesMap[field.key] = Number.isNaN(date.getTime())
          ? ''
          : date.toISOString().slice(0, 10)
        continue
      }
      initialValuesMap[field.key] = value ?? ''
    }
    return initialValuesMap
  }, [fields, initialData?.fields])

  const [values, setValues] = useState<FieldValues>(initialValues)

  function updateValue(key: string, value: unknown) {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const trimmedSlug = slug.trim()
    const nextErrors = validateEntryFields(fields, values, t)
    const slugError = validateSlug(trimmedSlug, t)
    if (slugError) {
      nextErrors.slug = slugError
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setIsSubmitting(false)
      return
    }

    setErrors({})

    const payload = {
      slug: trimmedSlug || undefined,
      status,
      fields: values,
    }

    try {
      if (mode === 'create') {
        await createContentEntryAction(contentType.slug, payload)
        toast.success(t('routes.content.form.toasts.created'))
      } else if (initialData) {
        await updateContentEntryAction(
          contentType.slug,
          initialData.id,
          payload
        )
        toast.success(t('routes.content.form.toasts.updated'))
      }
      router.push(`/content/${contentType.slug}`)
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
            <FieldLabel>{t('common.labels.status')}</FieldLabel>
            <Select
              onValueChange={value =>
                setStatus(value as ContentEntry['status'])
              }
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
          <Field>
            <FieldLabel htmlFor="slug">{t('common.labels.slug')}</FieldLabel>
            <FieldDescription>
              {t('routes.content.form.slug.description')}
            </FieldDescription>
            <Input
              id="slug"
              name="slug"
              onChange={event => setSlug(event.target.value)}
              placeholder={t('routes.content.form.slug.placeholder')}
              type="text"
              value={slug}
            />
            {errors.slug && <FieldError>{errors.slug}</FieldError>}
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldGroup>
          {fields.map(field => (
            <CustomFieldInput
              error={errors[field.key]}
              field={field}
              key={field.id}
              onChange={value => updateValue(field.key, value)}
              value={values[field.key]}
            />
          ))}
        </FieldGroup>
      </FieldSet>

      <div className="flex items-center gap-2">
        <Button disabled={isSubmitting} type="submit">
          {mode === 'create'
            ? t('routes.content.form.actions.create')
            : t('common.actions.saveChanges')}
        </Button>
        <Button asChild variant="outline">
          <Link href={`/content/${contentType.slug}`}>
            {t('common.actions.cancel')}
          </Link>
        </Button>
      </div>
    </form>
  )
}
