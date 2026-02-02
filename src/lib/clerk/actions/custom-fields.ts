'use server'

import { revalidateTag } from 'next/cache'
import { cacheTags } from '@/lib/cache-tags'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'
import { checkAdmin } from '../check-auth'
import {
  getCustomFields,
  getCustomField,
  createCustomField,
  updateCustomField,
  deleteCustomField,
} from '../custom-fields-utils'
import type { CustomFieldInput } from '../content-schemas'
import { withCache } from './cache'

export async function getCustomFieldsAction() {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  return withCache(
    ['custom-fields', data.orgId],
    [cacheTags.customFields(data.orgId)],
    () => getCustomFields(data.orgId, token)
  )
}

export async function getCustomFieldAction(id: string) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  return withCache(
    ['custom-field', data.orgId, id],
    [cacheTags.customFields(data.orgId)],
    () => getCustomField(data.orgId, id, token)
  )
}

export async function createCustomFieldAction(payload: CustomFieldInput) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  const field = await createCustomField(data.orgId, payload, token)
  revalidateTag(cacheTags.customFields(data.orgId), 'default')
  revalidateTag(cacheTags.contentTypes(data.orgId), 'default')
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
  const token = await getSupabaseToken()
  const field = await updateCustomField(data.orgId, id, payload, token)
  revalidateTag(cacheTags.customFields(data.orgId), 'default')
  revalidateTag(cacheTags.contentTypes(data.orgId), 'default')
  return field
}

export async function deleteCustomFieldAction(id: string) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  const result = await deleteCustomField(data.orgId, id, token)
  revalidateTag(cacheTags.customFields(data.orgId), 'default')
  revalidateTag(cacheTags.contentTypes(data.orgId), 'default')
  return result
}
