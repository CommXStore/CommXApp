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

type CustomFieldFormProps = {
  mode: 'create' | 'edit'
  contentTypes: ContentType[]
  initialData?: CustomField | null
}

const fieldTypeLabels: Record<CustomField['type'], string> = {
  text: 'Texto',
  number: 'Número',
  boolean: 'Booleano',
  date: 'Data',
  select: 'Seleção',
}

export function CustomFieldForm({
  mode,
  contentTypes,
  initialData,
}: CustomFieldFormProps) {
  const router = useRouter()
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
      nextErrors.label = 'Nome é obrigatório.'
    }
    if (key && !isKebabCase(key)) {
      nextErrors.key = 'Chave inválida. Use apenas letras minúsculas, números e hífens.'
    }
    if (type === 'select' && (!options || options.length === 0)) {
      nextErrors.options = 'Informe ao menos uma opção.'
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
        toast.success('Campo personalizado criado.')
      } else if (initialData) {
        await updateCustomFieldAction(initialData.id, payload)
        toast.success('Campo personalizado atualizado.')
      }
      router.push('/custom-fields')
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
            <FieldLabel htmlFor="label">Nome</FieldLabel>
            <FieldDescription>Ex: Autor, Data de publicação</FieldDescription>
            <Input
              defaultValue={initialData?.label ?? ''}
              id="label"
              name="label"
              placeholder="Nome do campo"
              required
              type="text"
            />
            {errors.label && <FieldError>{errors.label}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="key">Chave</FieldLabel>
            <FieldDescription>Se vazio, usamos o nome.</FieldDescription>
            <Input
              defaultValue={initialData?.key ?? ''}
              id="key"
              name="key"
              placeholder="autor"
              type="text"
            />
            {errors.key && <FieldError>{errors.key}</FieldError>}
          </Field>
          <Field>
            <FieldLabel>Tipo</FieldLabel>
            <Select onValueChange={value => setType(value as CustomField['type'])} value={type}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo" />
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
            <FieldLabel>Obrigatório</FieldLabel>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={required}
                onCheckedChange={value => setRequired(Boolean(value))}
              />
              <span className="text-sm">Campo obrigatório</span>
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="helpText">Texto de ajuda</FieldLabel>
            <Input
              defaultValue={initialData?.helpText ?? ''}
              id="helpText"
              name="helpText"
              placeholder="Ex: Informe o autor principal."
              type="text"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="options">Opções</FieldLabel>
            <FieldDescription>Separadas por vírgula (apenas para seleção).</FieldDescription>
            <Input
              disabled={type !== 'select'}
              id="options"
              name="options"
              onChange={event => setOptionsInput(event.target.value)}
              placeholder="Opção A, Opção B"
              type="text"
              value={optionsInput}
            />
            {errors.options && <FieldError>{errors.options}</FieldError>}
          </Field>
          <Field>
            <FieldLabel>Vincular ao tipo de conteúdo</FieldLabel>
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
                  Nenhum tipo disponível.
                </span>
              )}
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex items-center gap-2">
        <Button disabled={isSubmitting} type="submit">
          {mode === 'create' ? 'Criar campo' : 'Salvar alterações'}
        </Button>
        <Button asChild variant="outline">
          <Link href="/custom-fields">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
