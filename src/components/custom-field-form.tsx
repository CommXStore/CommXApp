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
  createCustomFieldAction,
  updateCustomFieldAction,
} from '@/lib/clerk/actions'
import { isKebabCase } from '@/lib/content-utils'
import type { ContentType, CustomField } from '@/lib/clerk/content-schemas'
import { useTranslations } from '@/i18n/provider'

type CustomFieldFormProps = {
  mode: 'create' | 'edit'
  contentTypes: ContentType[]
  initialData?: CustomField | null
}

export function CustomFieldForm({
  mode,
  contentTypes,
  initialData,
}: CustomFieldFormProps) {
  const router = useRouter()
  const t = useTranslations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [type, setType] = useState<CustomField['type']>(
    initialData?.type ?? 'text'
  )
  const [required, setRequired] = useState(initialData?.required ?? false)
  const [attachedTo, setAttachedTo] = useState<string[]>(
    initialData?.attachedTo ?? []
  )
  const [optionsInput, setOptionsInput] = useState(
    initialData?.options?.join(', ') ?? ''
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const attachedOptions = useMemo(
    () => contentTypes.map(item => ({ id: item.id, name: item.name })),
    [contentTypes]
  )

  function toggleAttached(typeId: string, nextValue: boolean) {
    setAttachedTo(prev =>
      nextValue ? [...prev, typeId] : prev.filter(id => id !== typeId)
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const label = String(formData.get('label') ?? '').trim()
    const key = String(formData.get('key') ?? '').trim()
    const helpTextRaw = String(formData.get('helpText') ?? '').trim()

    const options =
      type === 'select'
        ? optionsInput
            .split(',')
            .map(option => option.trim())
            .filter(Boolean)
        : undefined

    const nextErrors: Record<string, string> = {}
    if (!label) {
      nextErrors.label = t('routes.custom-fields.form.errors.labelRequired')
    }
    if (key && !isKebabCase(key)) {
      nextErrors.key = t('routes.custom-fields.form.errors.invalidKey')
    }
    if (type === 'select' && (!options || options.length === 0)) {
      nextErrors.options = t('routes.custom-fields.form.errors.optionsRequired')
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setIsSubmitting(false)
      return
    }

    setErrors({})

    const payload = {
      label,
      key: key || undefined,
      type,
      required,
      helpText: helpTextRaw || undefined,
      options,
      attachedTo,
    }

    try {
      if (mode === 'create') {
        await createCustomFieldAction(payload)
        toast.success(t('routes.custom-fields.form.toasts.created'))
      } else if (initialData) {
        await updateCustomFieldAction(initialData.id, payload)
        toast.success(t('routes.custom-fields.form.toasts.updated'))
      }
      router.push('/custom-fields')
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('common.errors.saveFailed')
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldTypeLabels: Record<CustomField['type'], string> = {
    text: t('routes.custom-fields.form.fields.type.options.text'),
    number: t('routes.custom-fields.form.fields.type.options.number'),
    boolean: t('routes.custom-fields.form.fields.type.options.boolean'),
    date: t('routes.custom-fields.form.fields.type.options.date'),
    select: t('routes.custom-fields.form.fields.type.options.select'),
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="label">
              {t('routes.custom-fields.form.fields.label.label')}
            </FieldLabel>
            <FieldDescription>
              {t('routes.custom-fields.form.fields.label.description')}
            </FieldDescription>
            <Input
              defaultValue={initialData?.label ?? ''}
              id="label"
              name="label"
              placeholder={t('routes.custom-fields.form.fields.label.placeholder')}
              required
              type="text"
            />
            {errors.label && <FieldError>{errors.label}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="key">
              {t('routes.custom-fields.form.fields.key.label')}
            </FieldLabel>
            <FieldDescription>
              {t('routes.custom-fields.form.fields.key.description')}
            </FieldDescription>
            <Input
              defaultValue={initialData?.key ?? ''}
              id="key"
              name="key"
              placeholder={t('routes.custom-fields.form.fields.key.placeholder')}
              type="text"
            />
            {errors.key && <FieldError>{errors.key}</FieldError>}
          </Field>
          <Field>
            <FieldLabel>{t('routes.custom-fields.form.fields.type.label')}</FieldLabel>
            <Select onValueChange={value => setType(value as CustomField['type'])} value={type}>
              <SelectTrigger>
                <SelectValue placeholder={t('routes.custom-fields.form.fields.type.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fieldTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>{t('routes.custom-fields.form.fields.required.label')}</FieldLabel>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={required}
                onCheckedChange={value => setRequired(Boolean(value))}
              />
              <span className="text-sm">
                {t('routes.custom-fields.form.fields.required.text')}
              </span>
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="helpText">
              {t('routes.custom-fields.form.fields.helpText.label')}
            </FieldLabel>
            <Input
              defaultValue={initialData?.helpText ?? ''}
              id="helpText"
              name="helpText"
              placeholder={t('routes.custom-fields.form.fields.helpText.placeholder')}
              type="text"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="options">
              {t('routes.custom-fields.form.fields.options.label')}
            </FieldLabel>
            <FieldDescription>
              {t('routes.custom-fields.form.fields.options.description')}
            </FieldDescription>
            <Input
              disabled={type !== 'select'}
              id="options"
              name="options"
              onChange={event => setOptionsInput(event.target.value)}
              placeholder={t('routes.custom-fields.form.fields.options.placeholder')}
              type="text"
              value={optionsInput}
            />
            {errors.options && <FieldError>{errors.options}</FieldError>}
          </Field>
          <Field>
            <FieldLabel>{t('routes.custom-fields.form.fields.attach.label')}</FieldLabel>
            <div className="flex flex-col gap-2 rounded-md border p-4">
              {attachedOptions.length ? (
                attachedOptions.map(option => (
                  <label className="flex items-center gap-2" key={option.id}>
                    <Checkbox
                      checked={attachedTo.includes(option.id)}
                      onCheckedChange={value =>
                        toggleAttached(option.id, Boolean(value))
                      }
                    />
                    <span>{option.name}</span>
                  </label>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">
                  {t('routes.custom-fields.form.fields.attach.empty')}
                </span>
              )}
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex items-center gap-2">
        <Button disabled={isSubmitting} type="submit">
          {mode === 'create'
            ? t('routes.custom-fields.form.actions.create')
            : t('common.actions.saveChanges')}
        </Button>
        <Button asChild variant="outline">
          <Link href="/custom-fields">{t('common.actions.cancel')}</Link>
        </Button>
      </div>
    </form>
  )
}
