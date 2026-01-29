import { nanoid } from 'nanoid'
import { isKebabCase, normalizeKebabCase, nowIso } from '@/lib/content-utils'
import {
  customFieldInputSchema,
  type CustomField,
  type CustomFieldInput,
} from './content-schemas'
import { getContentStore, saveContentStore } from './content-store'

function assertKey(key: string) {
  if (!key || !isKebabCase(key)) {
    throw new Error('Chave inválida. Use apenas letras minúsculas, números e hífens.')
  }
}

function assertUniqueKey(customFields: CustomField[], key: string, id?: string) {
  const exists = customFields.some(
    item => item.key === key && (id ? item.id !== id : true)
  )
  if (exists) {
    throw new Error('Chave já existe para outro campo personalizado.')
  }
}

function assertSelectOptions(type: CustomField['type'], options?: string[]) {
  if (type === 'select' && (!options || options.length === 0)) {
    throw new Error('Campos do tipo select precisam de opções.')
  }
}

export async function getCustomFields(organizationId: string) {
  const { customFields } = await getContentStore(organizationId)
  return customFields
}

export async function getCustomField(organizationId: string, id: string) {
  const { customFields } = await getContentStore(organizationId)
  return customFields.find(item => item.id === id) || null
}

export async function createCustomField(
  organizationId: string,
  input: CustomFieldInput
) {
  const { publicMetadata, contentTypes, customFields, contentEntries } =
    await getContentStore(organizationId)

  const payload = customFieldInputSchema.parse(input)
  const keySource = payload.key ?? payload.label
  const key = normalizeKebabCase(keySource)
  assertKey(key)
  assertUniqueKey(customFields, key)
  assertSelectOptions(payload.type, payload.options)

  const attachedTo = payload.attachedTo ?? []
  for (const typeId of attachedTo) {
    const target = contentTypes.find(item => item.id === typeId)
    if (!target) {
      throw new Error('Tipo de conteúdo não encontrado.')
    }
  }

  const timestamp = nowIso()
  const newItem: CustomField = {
    id: `cf_${nanoid()}`,
    label: payload.label,
    key,
    type: payload.type,
    options: payload.options,
    required: payload.required,
    helpText: payload.helpText,
    attachedTo,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const attachedSet = new Set(attachedTo)
  const updatedContentTypes = contentTypes.map(item => {
    const shouldAttach = attachedSet.has(item.id)
    if (!shouldAttach) {
      return item
    }
    return {
      ...item,
      fields: Array.from(new Set([...item.fields, newItem.id])),
      updatedAt: timestamp,
    }
  })

  await saveContentStore(
    organizationId,
    publicMetadata,
    updatedContentTypes,
    [...customFields, newItem],
    contentEntries
  )

  return newItem
}

export async function updateCustomField(
  organizationId: string,
  id: string,
  input: CustomFieldInput
) {
  const { publicMetadata, contentTypes, customFields, contentEntries } =
    await getContentStore(organizationId)

  const existing = customFields.find(item => item.id === id)
  if (!existing) {
    throw new Error('Campo personalizado não encontrado.')
  }

  const payload = customFieldInputSchema.parse(input)
  const keySource = payload.key ?? payload.label
  const key = normalizeKebabCase(keySource)
  assertKey(key)
  assertUniqueKey(customFields, key, id)
  assertSelectOptions(payload.type, payload.options)

  const nextAttachedTo = payload.attachedTo ?? existing.attachedTo ?? []
  for (const typeId of nextAttachedTo) {
    const target = contentTypes.find(item => item.id === typeId)
    if (!target) {
      throw new Error('Tipo de conteúdo não encontrado.')
    }
  }

  const timestamp = nowIso()
  const updatedCustomFields = customFields.map(item =>
    item.id === id
      ? {
          ...item,
          label: payload.label,
          key,
          type: payload.type,
          options: payload.options,
          required: payload.required,
          helpText: payload.helpText,
          attachedTo: nextAttachedTo,
          updatedAt: timestamp,
        }
      : item
  )

  const attachedSet = new Set(nextAttachedTo)
  const updatedContentTypes = contentTypes.map(item => {
    const shouldAttach = attachedSet.has(item.id)
    const wasAttached = item.fields.includes(id)

    if (shouldAttach && !wasAttached) {
      return {
        ...item,
        fields: Array.from(new Set([...item.fields, id])),
        updatedAt: timestamp,
      }
    }

    if (!shouldAttach && wasAttached) {
      return {
        ...item,
        fields: item.fields.filter(fieldId => fieldId !== id),
        updatedAt: timestamp,
      }
    }

    return item
  })

  await saveContentStore(
    organizationId,
    publicMetadata,
    updatedContentTypes,
    updatedCustomFields,
    contentEntries
  )

  return updatedCustomFields.find(item => item.id === id) || null
}

export async function deleteCustomField(organizationId: string, id: string) {
  const { publicMetadata, contentTypes, customFields, contentEntries } =
    await getContentStore(organizationId)

  const existing = customFields.find(item => item.id === id)
  if (!existing) {
    throw new Error('Campo personalizado não encontrado.')
  }

  const updatedCustomFields = customFields.filter(item => item.id !== id)
  const updatedContentTypes = contentTypes.map(item => ({
    ...item,
    fields: item.fields.filter(fieldId => fieldId !== id),
  }))
  const updatedContentEntries = { ...contentEntries }
  const affectedTypeIds = contentTypes
    .filter(item => item.fields.includes(id))
    .map(item => item.id)

  if (existing.key) {
    for (const typeId of affectedTypeIds) {
      const entries = updatedContentEntries[typeId]
      if (!entries) {
        continue
      }
      updatedContentEntries[typeId] = entries.map(entry => {
        if (!(existing.key in entry.fields)) {
          return entry
        }
        const { [existing.key]: _, ...rest } = entry.fields
        return { ...entry, fields: rest }
      })
    }
  }

  await saveContentStore(
    organizationId,
    publicMetadata,
    updatedContentTypes,
    updatedCustomFields,
    updatedContentEntries
  )

  return { success: true }
}
