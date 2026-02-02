'use server'

import { revalidateTag } from 'next/cache'
import { cacheTags } from '@/lib/cache-tags'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'
import { checkAdmin, checkAuth } from '../check-auth'
import {
  getContentTypes,
  getContentType,
  getContentTypeBySlug,
  createContentType,
  updateContentType,
  deleteContentType,
} from '../content-types-utils'
import type { ContentTypeInput } from '../content-schemas'
import { withCache } from './cache'

export async function getContentTypesAction() {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  return withCache(
    ['content-types', data.orgId],
    [cacheTags.contentTypes(data.orgId)],
    () => getContentTypes(data.orgId, token)
  )
}

export async function getContentTypesViewerAction() {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  return withCache(
    ['content-types-viewer', data.orgId],
    [cacheTags.contentTypes(data.orgId)],
    () => getContentTypes(data.orgId, token)
  )
}

export async function getContentTypeAction(id: string) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  return withCache(
    ['content-type', data.orgId, id],
    [cacheTags.contentTypes(data.orgId)],
    () => getContentType(data.orgId, id, token)
  )
}

export async function getContentTypeBySlugAction(slug: string) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  return withCache(
    ['content-type-slug', data.orgId, slug],
    [cacheTags.contentTypes(data.orgId)],
    () => getContentTypeBySlug(data.orgId, slug, token)
  )
}

export async function createContentTypeAction(payload: ContentTypeInput) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  const contentType = await createContentType(data.orgId, payload, token)
  revalidateTag(cacheTags.contentTypes(data.orgId), 'default')
  revalidateTag(cacheTags.customFields(data.orgId), 'default')
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
  const token = await getSupabaseToken()
  const existing = await getContentType(data.orgId, id, token)
  const contentType = await updateContentType(data.orgId, id, payload, token)
  revalidateTag(cacheTags.contentTypes(data.orgId), 'default')
  revalidateTag(cacheTags.customFields(data.orgId), 'default')
  if (existing?.slug) {
    revalidateTag(
      cacheTags.contentEntries(data.orgId, existing.slug),
      'default'
    )
  }
  if (contentType?.slug && contentType.slug !== existing?.slug) {
    revalidateTag(
      cacheTags.contentEntries(data.orgId, contentType.slug),
      'default'
    )
  }
  return contentType
}

export async function deleteContentTypeAction(id: string) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  const existing = await getContentType(data.orgId, id, token)
  const result = await deleteContentType(data.orgId, id, token)
  revalidateTag(cacheTags.contentTypes(data.orgId), 'default')
  revalidateTag(cacheTags.customFields(data.orgId), 'default')
  if (existing?.slug) {
    revalidateTag(
      cacheTags.contentEntries(data.orgId, existing.slug),
      'default'
    )
  }
  return result
}
