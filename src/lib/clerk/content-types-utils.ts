import { nanoid } from 'nanoid'
import { isKebabCase, normalizeKebabCase, nowIso } from '@/lib/content-utils'
import { isIconName, normalizeIconName } from '@/lib/icon-map'
import {
  contentTypeInputSchema,
  type ContentType,
  type ContentTypeInput,
} from './content-schemas'
import { contentRepository } from './content-repository'

function assertSlug(slug: string) {
  if (!(slug && isKebabCase(slug))) {
    throw new Error(
      'Slug inválido. Use apenas letras minúsculas, números e hífens.'
    )
  }
}

function assertUniqueSlug(
  contentTypes: ContentType[],
  slug: string,
  id?: string
) {
  const exists = contentTypes.some(
    item => item.slug === slug && (id ? item.id !== id : true)
  )
  if (exists) {
    throw new Error('Slug já existe para outro tipo de conteúdo.')
  }
}

function resolveIcon(value?: string) {
  if (!value) {
    return
  }
  const normalized = normalizeIconName(value)
  return isIconName(normalized) ? normalized : undefined
}

export async function getContentTypes(organizationId: string) {
  const { contentTypes } = await contentRepository.getStore(organizationId)
  return contentTypes
}

export async function getContentType(organizationId: string, id: string) {
  const { contentTypes } = await contentRepository.getStore(organizationId)
  return contentTypes.find(item => item.id === id) || null
}

export async function getContentTypeBySlug(
  organizationId: string,
  slug: string
) {
  const { contentTypes } = await contentRepository.getStore(organizationId)
  return contentTypes.find(item => item.slug === slug) || null
}

export async function createContentType(
  organizationId: string,
  input: ContentTypeInput
) {
  const { publicMetadata, contentTypes, customFields, contentEntries } =
    await contentRepository.getStore(organizationId)

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

  const timestamp = nowIso()

  const newItem: ContentType = {
    id: `ct_${nanoid()}`,
    name: payload.name,
    slug,
    description: payload.description,
    status: payload.status,
    icon: resolveIcon(payload.icon),
    fields,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const updatedCustomFields = customFields.map(field => {
    if (!fields.includes(field.id)) {
      return field
    }
    const attachedTo = Array.from(
      new Set([...(field.attachedTo ?? []), newItem.id])
    )
    return { ...field, attachedTo, updatedAt: timestamp }
  })

  await contentRepository.saveStore({
    organizationId,
    publicMetadata,
    contentTypes: [...contentTypes, newItem],
    customFields: updatedCustomFields,
    contentEntries,
  })

  return newItem
}

export async function updateContentType(
  organizationId: string,
  id: string,
  input: ContentTypeInput
) {
  const { publicMetadata, contentTypes, customFields, contentEntries } =
    await contentRepository.getStore(organizationId)

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

  const timestamp = nowIso()
  const updatedContentTypes = contentTypes.map(item =>
    item.id === id
      ? {
          ...item,
          name: payload.name,
          slug,
          description: payload.description,
          status: payload.status,
          icon: resolveIcon(payload.icon),
          fields,
          updatedAt: timestamp,
        }
      : item
  )

  const updatedCustomFields = customFields.map(field => {
    const attachedTo = new Set(field.attachedTo ?? [])
    const shouldAttach = fields.includes(field.id)
    if (shouldAttach) {
      attachedTo.add(id)
    } else {
      attachedTo.delete(id)
    }
    if (attachedTo.size === (field.attachedTo ?? []).length) {
      return field
    }
    return {
      ...field,
      attachedTo: Array.from(attachedTo),
      updatedAt: timestamp,
    }
  })

  await contentRepository.saveStore({
    organizationId,
    publicMetadata,
    contentTypes: updatedContentTypes,
    customFields: updatedCustomFields,
    contentEntries,
  })

  return updatedContentTypes.find(item => item.id === id) || null
}

export async function deleteContentType(organizationId: string, id: string) {
  const { publicMetadata, contentTypes, customFields, contentEntries } =
    await contentRepository.getStore(organizationId)

  const existing = contentTypes.find(item => item.id === id)
  if (!existing) {
    throw new Error('Tipo de conteúdo não encontrado.')
  }

  const updatedContentTypes = contentTypes.filter(item => item.id !== id)
  const updatedCustomFields = customFields.map(field => {
    if (!field.attachedTo?.includes(id)) {
      return field
    }
    const nextAttachedTo = field.attachedTo.filter(typeId => typeId !== id)
    return { ...field, attachedTo: nextAttachedTo }
  })

  const updatedContentEntries = { ...contentEntries }
  delete updatedContentEntries[id]

  await contentRepository.saveStore({
    organizationId,
    publicMetadata,
    contentTypes: updatedContentTypes,
    customFields: updatedCustomFields,
    contentEntries: updatedContentEntries,
  })

  return { success: true }
}
