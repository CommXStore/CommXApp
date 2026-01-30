'use server'

import { revalidateTag } from 'next/cache'
import { cacheTags } from '@/lib/cache-tags'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'
import { checkAuth } from '../check-auth'
import {
  getContentEntries,
  getContentEntry,
  createContentEntry,
  updateContentEntry,
  deleteContentEntry,
} from '../content-entries-utils'
import type { ContentEntryInput } from '../content-schemas'
import { withCache } from './cache'

export async function getContentEntriesAction(contentTypeSlug: string) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  return withCache(
    ['content-entries', data.orgId, contentTypeSlug],
    [
      cacheTags.contentTypes(data.orgId),
      cacheTags.customFields(data.orgId),
      cacheTags.contentEntries(data.orgId, contentTypeSlug),
    ],
    () => getContentEntries(data.orgId, contentTypeSlug, token)
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
  const token = await getSupabaseToken()
  return withCache(
    ['content-entry', data.orgId, contentTypeSlug, entryId],
    [
      cacheTags.contentTypes(data.orgId),
      cacheTags.customFields(data.orgId),
      cacheTags.contentEntries(data.orgId, contentTypeSlug),
    ],
    () => getContentEntry(data.orgId, contentTypeSlug, entryId, token)
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
  const token = await getSupabaseToken()
  const entry = await createContentEntry(
    data.orgId,
    contentTypeSlug,
    payload,
    token
  )
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
  const token = await getSupabaseToken()
  const entry = await updateContentEntry(data.orgId, contentTypeSlug, entryId, {
    input: payload,
    token,
  })
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
  const token = await getSupabaseToken()
  const result = await deleteContentEntry(
    data.orgId,
    contentTypeSlug,
    entryId,
    token
  )
  revalidateTag(cacheTags.contentEntries(data.orgId, contentTypeSlug))
  return result
}
