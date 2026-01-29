'use server'

import { checkAuth } from './check-auth'
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

export async function getAgentsAction() {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return getAgents(data.orgId)
}

export async function createAgentAction(payload: AgentInput) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return await createAgent(data.orgId, payload)
}

export async function deleteAgentAction(agentId: string) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return deleteAgent(data.orgId, agentId)
}

export async function getContentTypesAction() {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return getContentTypes(data.orgId)
}

export async function getContentTypeAction(id: string) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return getContentType(data.orgId, id)
}

export async function getContentTypeBySlugAction(slug: string) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return getContentTypeBySlug(data.orgId, slug)
}

export async function createContentTypeAction(payload: ContentTypeInput) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return createContentType(data.orgId, payload)
}

export async function updateContentTypeAction(
  id: string,
  payload: ContentTypeInput
) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return updateContentType(data.orgId, id, payload)
}

export async function deleteContentTypeAction(id: string) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return deleteContentType(data.orgId, id)
}

export async function getCustomFieldsAction() {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return getCustomFields(data.orgId)
}

export async function getCustomFieldAction(id: string) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return getCustomField(data.orgId, id)
}

export async function getContentEntriesAction(contentTypeSlug: string) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return getContentEntries(data.orgId, contentTypeSlug)
}

export async function getContentEntryAction(
  contentTypeSlug: string,
  entryId: string
) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return getContentEntry(data.orgId, contentTypeSlug, entryId)
}

export async function createContentEntryAction(
  contentTypeSlug: string,
  payload: ContentEntryInput
) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return createContentEntry(data.orgId, contentTypeSlug, payload)
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
  return updateContentEntry(data.orgId, contentTypeSlug, entryId, payload)
}

export async function deleteContentEntryAction(
  contentTypeSlug: string,
  entryId: string
) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return deleteContentEntry(data.orgId, contentTypeSlug, entryId)
}

export async function createCustomFieldAction(payload: CustomFieldInput) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return createCustomField(data.orgId, payload)
}

export async function updateCustomFieldAction(
  id: string,
  payload: CustomFieldInput
) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return updateCustomField(data.orgId, id, payload)
}

export async function deleteCustomFieldAction(id: string) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  return deleteCustomField(data.orgId, id)
}
