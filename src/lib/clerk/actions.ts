'use server'

import { unstable_cache, revalidateTag } from 'next/cache'
import { cacheTags } from '@/lib/cache-tags'
import { checkAdmin, checkAuth } from './check-auth'
import { getAgents, createAgent, deleteAgent } from './metadata-utils'
import type { AgentInput } from './metadata-utils'
import {
  getContentTypes,
  getContentType,
  createContentType,
  updateContentType,
  deleteContentType,
  getContentTypeBySlug,
} from './content-types-utils'
import {
  getCustomFields,
  getCustomField,
  createCustomField,
  updateCustomField,
  deleteCustomField,
} from './custom-fields-utils'
import {
  getContentEntries,
  getContentEntry,
  createContentEntry,
  updateContentEntry,
  deleteContentEntry,
} from './content-entries-utils'
import type {
  ContentEntryInput,
  ContentTypeInput,
  CustomFieldInput,
} from './content-schemas'

function withCache<T>(
  keyParts: string[],
  tags: string[],
  fn: () => Promise<T>
) {
  const cached = unstable_cache(fn, keyParts, { tags })
  return cached()
}

export async function getAgentsAction() {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return withCache(['agents', data.orgId], [cacheTags.agents(data.orgId)], () =>
    getAgents(data.orgId)
  )
}

export async function createAgentAction(payload: AgentInput) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  const agent = await createAgent(data.orgId, payload)
  revalidateTag(cacheTags.agents(data.orgId))
  return agent
}

export async function deleteAgentAction(agentId: string) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  const result = await deleteAgent(data.orgId, agentId)
  revalidateTag(cacheTags.agents(data.orgId))
  return result
}

export async function getContentTypesAction() {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  return withCache(
    ['content-types', data.orgId],
    [cacheTags.contentTypes(data.orgId)],
    () => getContentTypes(data.orgId)
  )
}

export async function getContentTypeAction(id: string) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  return withCache(
    ['content-type', data.orgId, id],
    [cacheTags.contentTypes(data.orgId)],
    () => getContentType(data.orgId, id)
  )
}

export async function getContentTypeBySlugAction(slug: string) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  return withCache(
    ['content-type-slug', data.orgId, slug],
    [cacheTags.contentTypes(data.orgId)],
    () => getContentTypeBySlug(data.orgId, slug)
  )
}

export async function createContentTypeAction(payload: ContentTypeInput) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const contentType = await createContentType(data.orgId, payload)
  revalidateTag(cacheTags.contentTypes(data.orgId))
  revalidateTag(cacheTags.customFields(data.orgId))
  return contentType
}

export async function updateContentTypeAction(
  id: string,
  payload: ContentTypeInput
) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const existing = await getContentType(data.orgId, id)
  const contentType = await updateContentType(data.orgId, id, payload)
  revalidateTag(cacheTags.contentTypes(data.orgId))
  revalidateTag(cacheTags.customFields(data.orgId))
  if (existing?.slug) {
    revalidateTag(cacheTags.contentEntries(data.orgId, existing.slug))
  }
  if (contentType?.slug && contentType.slug !== existing?.slug) {
    revalidateTag(cacheTags.contentEntries(data.orgId, contentType.slug))
  }
  return contentType
}

export async function deleteContentTypeAction(id: string) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const existing = await getContentType(data.orgId, id)
  const result = await deleteContentType(data.orgId, id)
  revalidateTag(cacheTags.contentTypes(data.orgId))
  revalidateTag(cacheTags.customFields(data.orgId))
  if (existing?.slug) {
    revalidateTag(cacheTags.contentEntries(data.orgId, existing.slug))
  }
  return result
}

export async function getCustomFieldsAction() {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  return withCache(
    ['custom-fields', data.orgId],
    [cacheTags.customFields(data.orgId)],
    () => getCustomFields(data.orgId)
  )
}

export async function getCustomFieldAction(id: string) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  return withCache(
    ['custom-field', data.orgId, id],
    [cacheTags.customFields(data.orgId)],
    () => getCustomField(data.orgId, id)
  )
}

export async function getContentEntriesAction(contentTypeSlug: string) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return withCache(
    ['content-entries', data.orgId, contentTypeSlug],
    [
      cacheTags.contentTypes(data.orgId),
      cacheTags.customFields(data.orgId),
      cacheTags.contentEntries(data.orgId, contentTypeSlug),
    ],
    () => getContentEntries(data.orgId, contentTypeSlug)
  )
}

export async function getContentEntryAction(
  contentTypeSlug: string,
  entryId: string
) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return withCache(
    ['content-entry', data.orgId, contentTypeSlug, entryId],
    [
      cacheTags.contentTypes(data.orgId),
      cacheTags.customFields(data.orgId),
      cacheTags.contentEntries(data.orgId, contentTypeSlug),
    ],
    () => getContentEntry(data.orgId, contentTypeSlug, entryId)
  )
}

export async function createContentEntryAction(
  contentTypeSlug: string,
  payload: ContentEntryInput
) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  const entry = await createContentEntry(data.orgId, contentTypeSlug, payload)
  revalidateTag(cacheTags.contentEntries(data.orgId, contentTypeSlug))
  return entry
}

export async function updateContentEntryAction(
  contentTypeSlug: string,
  entryId: string,
  payload: ContentEntryInput
) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  const entry = await updateContentEntry(
    data.orgId,
    contentTypeSlug,
    entryId,
    payload
  )
  revalidateTag(cacheTags.contentEntries(data.orgId, contentTypeSlug))
  return entry
}

export async function deleteContentEntryAction(
  contentTypeSlug: string,
  entryId: string
) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  const result = await deleteContentEntry(data.orgId, contentTypeSlug, entryId)
  revalidateTag(cacheTags.contentEntries(data.orgId, contentTypeSlug))
  return result
}

export async function createCustomFieldAction(payload: CustomFieldInput) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const field = await createCustomField(data.orgId, payload)
  revalidateTag(cacheTags.customFields(data.orgId))
  revalidateTag(cacheTags.contentTypes(data.orgId))
  return field
}

export async function updateCustomFieldAction(
  id: string,
  payload: CustomFieldInput
) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const field = await updateCustomField(data.orgId, id, payload)
  revalidateTag(cacheTags.customFields(data.orgId))
  revalidateTag(cacheTags.contentTypes(data.orgId))
  return field
}

export async function deleteCustomFieldAction(id: string) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const result = await deleteCustomField(data.orgId, id)
  revalidateTag(cacheTags.customFields(data.orgId))
  revalidateTag(cacheTags.contentTypes(data.orgId))
  return result
}
