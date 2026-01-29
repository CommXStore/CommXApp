import { nanoid } from 'nanoid'
import { isKebabCase, normalizeKebabCase, nowIso } from '@/lib/content-utils'
import {
  contentTypeInputSchema,
  type ContentType,
  type ContentTypeInput,
} from './content-schemas'
import { getContentStore, saveContentStore } from './content-store'

function assertSlug(slug: string) {
  if (!slug || !isKebabCase(slug)) {
    throw new Error('Slug inválido. Use apenas letras minúsculas, números e hífens.')
  }
}

function assertUniqueSlug(contentTypes: ContentType[], slug: string, id?: string) {
  const exists = contentTypes.some(
    item => item.slug === slug && (id ? item.id !== id : true)
  )
  if (exists) {
    throw new Error('Slug já existe para outro tipo de conteúdo.')
  }
}

export async function getContentTypes(organizationId: string) {
  const { contentTypes } = await getContentStore(organizationId)
  return contentTypes
}

export async function getContentType(organizationId: string, id: string) {
  const { contentTypes } = await getContentStore(organizationId)
  return contentTypes.find(item => item.id === id) || null
}

export async function createContentType(
  organizationId: string,
  input: ContentTypeInput
) {
  const { publicMetadata, contentTypes, customFields } =
    await getContentStore(organizationId)

  const payload = contentTypeInputSchema.parse(input)
  const slugSource = payload.slug ?? payload.name
  const slug = normalizeKebabCase(slugSource)
  assertSlug(slug)
  assertUniqueSlug(contentTypes, slug)

  const fields = Array.from(new Set(payload.fields ?? []))
  const invalidField = fields.find(
    fieldId => !customFields.some(field => field.id === fieldId)
  )
  if (invalidField) {
    throw new Error('Campo personalizado inválido.')
  }

  const conflict = customFields.find(
    field =>
      fields.includes(field.id) && field.attachedTo && field.attachedTo !== null
  )
  if (conflict) {
    throw new Error('Um ou mais campos já estão vinculados a outro tipo.')
  }

  const timestamp = nowIso()
  const newItem: ContentType = {
    id: `ct_${nanoid()}`,
    name: payload.name,
    slug,
    description: payload.description,
    status: payload.status,
    icon: payload.icon,
    fields,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const updatedCustomFields = customFields.map(field =>
    fields.includes(field.id)
      ? { ...field, attachedTo: newItem.id, updatedAt: timestamp }
      : field
  )

  await saveContentStore(
    organizationId,
    publicMetadata,
    [...contentTypes, newItem],
    updatedCustomFields
  )

  return newItem
}

export async function updateContentType(
  organizationId: string,
  id: string,
  input: ContentTypeInput
) {
  const { publicMetadata, contentTypes, customFields } =
    await getContentStore(organizationId)

  const existing = contentTypes.find(item => item.id === id)
  if (!existing) {
    throw new Error('Tipo de conteúdo não encontrado.')
  }

  const payload = contentTypeInputSchema.parse(input)
  const slugSource = payload.slug ?? payload.name
  const slug = normalizeKebabCase(slugSource)
  assertSlug(slug)
  assertUniqueSlug(contentTypes, slug, id)

  const fields = Array.from(new Set(payload.fields ?? existing.fields))
  const invalidField = fields.find(
    fieldId => !customFields.some(field => field.id === fieldId)
  )
  if (invalidField) {
    throw new Error('Campo personalizado inválido.')
  }

  const conflict = customFields.find(
    field =>
      fields.includes(field.id) &&
      field.attachedTo !== null &&
      field.attachedTo !== id
  )
  if (conflict) {
    throw new Error('Um ou mais campos já estão vinculados a outro tipo.')
  }

  const timestamp = nowIso()
  const updatedContentTypes = contentTypes.map(item =>
    item.id === id
      ? {
          ...item,
          name: payload.name,
          slug,
          description: payload.description,
          status: payload.status,
          icon: payload.icon,
          fields,
          updatedAt: timestamp,
        }
      : item
  )

  const updatedCustomFields = customFields.map(field => {
    if (fields.includes(field.id)) {
      return { ...field, attachedTo: id, updatedAt: timestamp }
    }
    if (field.attachedTo === id) {
      return { ...field, attachedTo: null, updatedAt: timestamp }
    }
    return field
  })

  await saveContentStore(
    organizationId,
    publicMetadata,
    updatedContentTypes,
    updatedCustomFields
  )

  return updatedContentTypes.find(item => item.id === id) || null
}

export async function deleteContentType(organizationId: string, id: string) {
  const { publicMetadata, contentTypes, customFields } =
    await getContentStore(organizationId)

  const existing = contentTypes.find(item => item.id === id)
  if (!existing) {
    throw new Error('Tipo de conteúdo não encontrado.')
  }

  const updatedContentTypes = contentTypes.filter(item => item.id !== id)
  const updatedCustomFields = customFields.map(field =>
    field.attachedTo === id ? { ...field, attachedTo: null } : field
  )

  await saveContentStore(
    organizationId,
    publicMetadata,
    updatedContentTypes,
    updatedCustomFields
  )

  return { success: true }
}
