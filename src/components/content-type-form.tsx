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
  createContentTypeAction,
  updateContentTypeAction,
} from '@/lib/clerk/actions'
import { isKebabCase } from '@/lib/content-utils'
import type { ContentType, CustomField } from '@/lib/clerk/content-schemas'

type ContentTypeFormProps = {
  mode: 'create' | 'edit'
  customFields: CustomField[]
  initialData?: ContentType | null
}

export function ContentTypeForm({
  mode,
  customFields,
  initialData,
}: ContentTypeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<ContentType['status']>(
    initialData?.status ?? 'draft'
  )
  const [selectedFields, setSelectedFields] = useState<string[]>(
    initialData?.fields ?? []
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const availableFields = useMemo(
    () =>
      customFields.filter(
        field => !field.attachedTo || field.attachedTo === initialData?.id
      ),
    [customFields, initialData?.id]
  )

  function toggleField(fieldId: string, nextValue: boolean) {
    setSelectedFields(prev =>
      nextValue ? [...prev, fieldId] : prev.filter(id => id !== fieldId)
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const slug = String(formData.get('slug') ?? '').trim()
    const descriptionRaw = String(formData.get('description') ?? '').trim()
    const iconRaw = String(formData.get('icon') ?? '').trim()

    const nextErrors: Record<string, string> = {}
    if (!name) {
      nextErrors.name = 'Nome é obrigatório.'
    }
    if (slug && !isKebabCase(slug)) {
      nextErrors.slug = 'Slug inválido. Use apenas letras minúsculas, números e hífens.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setIsSubmitting(false)
      return
    }

    setErrors({})

    const payload = {
      name,
      slug: slug || undefined,
      description: descriptionRaw || undefined,
      status,
      icon: iconRaw || undefined,
      fields: selectedFields,
    }

    try {
      if (mode === 'create') {
        await createContentTypeAction(payload)
        toast.success('Tipo de conteúdo criado.')
      } else if (initialData) {
        await updateContentTypeAction(initialData.id, payload)
        toast.success('Tipo de conteúdo atualizado.')
      }
      router.push('/content-types')
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
            <FieldLabel htmlFor="name">Nome</FieldLabel>
            <FieldDescription>Ex: Artigo, Evento, Produto</FieldDescription>
            <Input
              defaultValue={initialData?.name ?? ''}
              id="name"
              name="name"
              placeholder="Nome do tipo"
              required
              type="text"
            />
            {errors.name && <FieldError>{errors.name}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <FieldDescription>Se vazio, usamos o nome para gerar.</FieldDescription>
            <Input
              defaultValue={initialData?.slug ?? ''}
              id="slug"
              name="slug"
              placeholder="artigos"
              type="text"
            />
            {errors.slug && <FieldError>{errors.slug}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Descrição</FieldLabel>
            <Input
              defaultValue={initialData?.description ?? ''}
              id="description"
              name="description"
              placeholder="Descrição curta"
              type="text"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="icon">Ícone</FieldLabel>
            <FieldDescription>Opcional, use o nome do ícone.</FieldDescription>
            <Input
              defaultValue={initialData?.icon ?? ''}
              id="icon"
              name="icon"
              placeholder="layers"
              type="text"
            />
          </Field>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select
              onValueChange={value => setStatus(value as ContentType['status'])}
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
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Campos personalizados</FieldLabel>
            <FieldDescription>
              Selecione os campos para este tipo ou crie novos campos.
            </FieldDescription>
            <div className="flex flex-col gap-3 rounded-md border p-4">
              {availableFields.length ? (
                availableFields.map(field => (
                  <label className="flex items-center gap-2" key={field.id}>
                    <Checkbox
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={value =>
                        toggleField(field.id, Boolean(value))
                      }
                    />
                    <span>
                      {field.label} <span className="text-muted-foreground">({field.key})</span>
                    </span>
                  </label>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">
                  Nenhum campo disponível.
                </span>
              )}
              <Button asChild size="sm" variant="outline">
                <Link href="/custom-fields/new">Adicionar campo</Link>
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex items-center gap-2">
        <Button disabled={isSubmitting} type="submit">
          {mode === 'create' ? 'Criar tipo' : 'Salvar alterações'}
        </Button>
        <Button asChild variant="outline">
          <Link href="/content-types">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
