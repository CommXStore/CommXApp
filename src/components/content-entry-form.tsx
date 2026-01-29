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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CustomFieldInput } from '@/components/custom-field-input'
import {
  createContentEntryAction,
  updateContentEntryAction,
} from '@/lib/clerk/actions'
import { isKebabCase } from '@/lib/content-utils'
import type {
  ContentEntry,
  ContentType,
  CustomField,
} from '@/lib/clerk/content-schemas'

type ContentEntryFormProps = {
  mode: 'create' | 'edit'
  contentType: ContentType
  fields: CustomField[]
  initialData?: ContentEntry | null
}

type FieldValues = Record<string, unknown>

export function ContentEntryForm({
  mode,
  contentType,
  fields,
  initialData,
}: ContentEntryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<ContentEntry['status']>(
    initialData?.status ?? 'draft'
  )
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const initialValues = useMemo(() => {
    const values: FieldValues = {}
    for (const field of fields) {
      const value = initialData?.fields?.[field.key]
      if (field.type === 'boolean') {
        values[field.key] = Boolean(value)
        continue
      }
      if (field.type === 'date' && typeof value === 'string') {
        const date = new Date(value)
        values[field.key] = Number.isNaN(date.getTime())
          ? ''
          : date.toISOString().slice(0, 10)
        continue
      }
      values[field.key] = value ?? ''
    }
    return values
  }, [fields, initialData?.fields])

  const [values, setValues] = useState<FieldValues>(initialValues)

  function updateValue(key: string, value: unknown) {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const nextErrors: Record<string, string> = {}
    const trimmedSlug = slug.trim()
    if (trimmedSlug && !isKebabCase(trimmedSlug)) {
      nextErrors.slug = 'Slug inválido. Use apenas letras minúsculas, números e hífens.'
    }

    for (const field of fields) {
      const value = values[field.key]
      const isEmpty =
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')

      if (field.required && field.type !== 'boolean' && isEmpty) {
        nextErrors[field.key] = 'Campo obrigatório.'
      }

      if (field.type === 'number' && !isEmpty) {
        const numericValue = Number(value)
        if (Number.isNaN(numericValue)) {
          nextErrors[field.key] = 'Informe um número válido.'
        }
      }

      if (field.type === 'select' && !isEmpty) {
        if (!field.options?.includes(String(value))) {
          nextErrors[field.key] = 'Selecione uma opção válida.'
        }
      }
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
        toast.success('Entrada criada.')
      } else if (initialData) {
        await updateContentEntryAction(contentType.slug, initialData.id, payload)
        toast.success('Entrada atualizada.')
      }
      router.push(`/content/${contentType.slug}`)
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao salvar.'
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
            <FieldLabel>Status</FieldLabel>
            <Select
              onValueChange={value => setStatus(value as ContentEntry['status'])}
              value={status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <FieldDescription>
              Opcional. Se vazio, tentamos gerar a partir do título/nome.
            </FieldDescription>
            <Input
              id="slug"
              name="slug"
              onChange={event => setSlug(event.target.value)}
              placeholder="minha-entrada"
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
          {mode === 'create' ? 'Criar entrada' : 'Salvar alterações'}
        </Button>
        <Button asChild variant="outline">
          <Link href={`/content/${contentType.slug}`}>Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
