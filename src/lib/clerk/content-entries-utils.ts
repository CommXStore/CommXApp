import { nanoid } from 'nanoid'
import { normalizeKebabCase, nowIso } from '@/lib/content-utils'
import {
  contentEntryInputSchema,
  type ContentEntry,
  type ContentEntryInput,
  type ContentType,
  type CustomField,
} from './content-schemas'
import { contentRepository } from './content-repository'

function resolveTypeFields(
  contentType: ContentType,
  customFields: CustomField[]
) {
  return contentType.fields
    .map(fieldId => customFields.find(field => field.id === fieldId))
    .filter((field): field is CustomField => Boolean(field))
}

function coerceTextValue(field: CustomField, value: unknown) {
  if (typeof value !== 'string') {
    throw new Error(`Campo ${field.key} deve ser texto.`)
  }
  return value
}

function coerceNumberValue(field: CustomField, value: unknown) {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }
  if (typeof value === 'string') {
    if (value.trim() === '') {
      return
    }
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }
  throw new Error(`Campo ${field.key} deve ser número.`)
}

function coerceBooleanValue(field: CustomField, value: unknown) {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true
    }
    if (value.toLowerCase() === 'false') {
      return false
    }
  }
  throw new Error(`Campo ${field.key} deve ser booleano.`)
}

function coerceDateValue(field: CustomField, value: unknown) {
  if (typeof value !== 'string') {
    throw new Error(`Campo ${field.key} deve ser data.`)
  }
  if (value.trim() === '') {
    return
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Campo ${field.key} deve ser data válida.`)
  }
  return date.toISOString()
}

function coerceSelectValue(field: CustomField, value: unknown) {
  if (typeof value !== 'string') {
    throw new Error(`Campo ${field.key} deve ser seleção.`)
  }
  if (value.trim() === '') {
    return
  }
  if (!field.options?.includes(value)) {
    throw new Error(`Campo ${field.key} possui opção inválida.`)
  }
  return value
}

const COERCE_HANDLERS = {
  text: coerceTextValue,
  number: coerceNumberValue,
  boolean: coerceBooleanValue,
  date: coerceDateValue,
  select: coerceSelectValue,
} satisfies Record<
  CustomField['type'],
  (field: CustomField, value: unknown) => unknown
>

function coerceFieldValue(field: CustomField, value: unknown) {
  if (value === undefined || value === null) {
    return
  }

  const handler = COERCE_HANDLERS[field.type]
  if (!handler) {
    throw new Error(`Campo ${field.key} possui tipo inválido.`)
  }
  return handler(field, value)
}

function validateEntryFields(
  fieldsInput: Record<string, unknown>,
  customFields: CustomField[]
) {
  const allowedKeys = new Set(customFields.map(field => field.key))

  for (const key of Object.keys(fieldsInput)) {
    if (!allowedKeys.has(key)) {
      throw new Error(`Campo ${key} não está vinculado a este tipo.`)
    }
  }

  const output: Record<string, unknown> = {}

  for (const field of customFields) {
    const value = fieldsInput[field.key]
    const coerced = coerceFieldValue(field, value)

    if (field.required) {
      const isEmpty =
        coerced === undefined ||
        coerced === null ||
        (typeof coerced === 'string' && coerced.trim() === '')
      if (isEmpty) {
        throw new Error(`Campo obrigatório ausente: ${field.label}.`)
      }
    }

    if (coerced !== undefined) {
      output[field.key] = coerced
    }
  }

  return output
}

function ensureUniqueEntrySlug(
  entries: ContentEntry[],
  slug: string,
  id?: string
) {
  const exists = entries.some(
    entry => entry.slug === slug && (id ? entry.id !== id : true)
  )
  if (exists) {
    throw new Error('Slug já existe neste tipo de conteúdo.')
  }
}

function resolveEntrySlug(
  payload: ContentEntryInput,
  fields: Record<string, unknown>
) {
  const explicit = payload.slug?.trim()
  if (explicit) {
    return normalizeKebabCase(explicit)
  }

  let fromTitle = ''
  if (typeof fields.title === 'string') {
    fromTitle = fields.title
  } else if (typeof fields.name === 'string') {
    fromTitle = fields.name
  }

  const candidate = normalizeKebabCase(fromTitle)
  if (!candidate) {
    throw new Error('Slug é obrigatório quando não há título/nome.')
  }
  return candidate
}

export async function getContentEntries(
  organizationId: string,
  contentTypeSlug: string
) {
  const { contentTypes, customFields, contentEntries } =
    await contentRepository.getStore(organizationId)
  const contentType = contentTypes.find(item => item.slug === contentTypeSlug)
  if (!contentType) {
    throw new Error('Tipo de conteúdo não encontrado.')
  }
  const entries = contentEntries[contentType.id] ?? []
  const fields = resolveTypeFields(contentType, customFields)
  return { contentType, entries, fields }
}

export async function getContentEntry(
  organizationId: string,
  contentTypeSlug: string,
  entryId: string
) {
  const { contentType, entries, fields } = await getContentEntries(
    organizationId,
    contentTypeSlug
  )
  const entry = entries.find(item => item.id === entryId) ?? null
  return { contentType, entry, fields }
}

export async function createContentEntry(
  organizationId: string,
  contentTypeSlug: string,
  input: ContentEntryInput
) {
  const { publicMetadata, contentTypes, customFields, contentEntries } =
    await contentRepository.getStore(organizationId)

  const contentType = contentTypes.find(item => item.slug === contentTypeSlug)
  if (!contentType) {
    throw new Error('Tipo de conteúdo não encontrado.')
  }

  const payload = contentEntryInputSchema.parse(input)
  const typeFields = resolveTypeFields(contentType, customFields)
  const fieldsInput = payload.fields ?? {}
  const fields = validateEntryFields(fieldsInput, typeFields)

  const slug = resolveEntrySlug(payload, fields)
  const entries = contentEntries[contentType.id] ?? []
  ensureUniqueEntrySlug(entries, slug)

  const timestamp = nowIso()
  const newEntry: ContentEntry = {
    id: `ce_${nanoid()}`,
    contentTypeId: contentType.id,
    slug,
    status: payload.status ?? 'draft',
    fields,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const updatedEntries = {
    ...contentEntries,
    [contentType.id]: [...entries, newEntry],
  }

  await contentRepository.saveStore({
    organizationId,
    publicMetadata,
    contentTypes,
    customFields,
    contentEntries: updatedEntries,
  })

  return newEntry
}

export async function updateContentEntry(
  organizationId: string,
  contentTypeSlug: string,
  entryId: string,
  input: ContentEntryInput
) {
  const { publicMetadata, contentTypes, customFields, contentEntries } =
    await contentRepository.getStore(organizationId)

  const contentType = contentTypes.find(item => item.slug === contentTypeSlug)
  if (!contentType) {
    throw new Error('Tipo de conteúdo não encontrado.')
  }

  const entries = contentEntries[contentType.id] ?? []
  const existing = entries.find(item => item.id === entryId)
  if (!existing) {
    throw new Error('Entrada não encontrada.')
  }

  const payload = contentEntryInputSchema.parse(input)
  const typeFields = resolveTypeFields(contentType, customFields)
  const fieldsInput = payload.fields ?? existing.fields
  const fields = validateEntryFields(fieldsInput, typeFields)

  const slug = resolveEntrySlug(payload, fields)
  ensureUniqueEntrySlug(entries, slug, entryId)

  const timestamp = nowIso()
  const updatedEntry: ContentEntry = {
    ...existing,
    slug,
    status: payload.status ?? existing.status,
    fields,
    updatedAt: timestamp,
  }

  const updatedEntries = {
    ...contentEntries,
    [contentType.id]: entries.map(entry =>
      entry.id === entryId ? updatedEntry : entry
    ),
  }

  await contentRepository.saveStore({
    organizationId,
    publicMetadata,
    contentTypes,
    customFields,
    contentEntries: updatedEntries,
  })

  return updatedEntry
}

export async function deleteContentEntry(
  organizationId: string,
  contentTypeSlug: string,
  entryId: string
) {
  const { publicMetadata, contentTypes, customFields, contentEntries } =
    await contentRepository.getStore(organizationId)

  const contentType = contentTypes.find(item => item.slug === contentTypeSlug)
  if (!contentType) {
    throw new Error('Tipo de conteúdo não encontrado.')
  }

  const entries = contentEntries[contentType.id] ?? []
  const existing = entries.find(item => item.id === entryId)
  if (!existing) {
    throw new Error('Entrada não encontrada.')
  }

  const updatedEntries = {
    ...contentEntries,
    [contentType.id]: entries.filter(entry => entry.id !== entryId),
  }

  await contentRepository.saveStore({
    organizationId,
    publicMetadata,
    contentTypes,
    customFields,
    contentEntries: updatedEntries,
  })

  return { success: true }
}
