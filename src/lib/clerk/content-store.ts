import { nowIso } from '@/lib/content-utils'
import type { ContentType, CustomField, ContentEntry } from './content-schemas'
import { MAX_SNAPSHOTS, type ContentSnapshot } from '@/lib/content-snapshots'
import {
  getOrganizationStore,
  updateOrganizationStore,
} from '@/lib/supabase/organization-store'

type SaveContentStoreInput = {
  organizationId: string
  publicMetadata: Record<string, unknown>
  contentTypes: ContentType[]
  customFields: CustomField[]
  contentEntries: Record<string, ContentEntry[]>
}

export async function getContentStore(organizationId: string) {
  const store = await getOrganizationStore(organizationId)

  return {
    publicMetadata: {},
    contentTypes: store.contentTypes,
    customFields: store.customFields,
    contentEntries: store.contentEntries,
  }
}

export async function saveContentStore({
  organizationId,
  publicMetadata: _publicMetadata,
  contentTypes,
  customFields,
  contentEntries,
}: SaveContentStoreInput) {
  const store = await getOrganizationStore(organizationId)
  const previousSnapshot: ContentSnapshot = {
    at: nowIso(),
    contentTypes: store.contentTypes,
    customFields: store.customFields,
    contentEntries: store.contentEntries,
  }

  const snapshots = [previousSnapshot, ...store.contentSnapshots].slice(
    0,
    MAX_SNAPSHOTS
  )

  await updateOrganizationStore(organizationId, {
    contentTypes,
    customFields,
    contentEntries,
    contentSnapshots: snapshots,
  })
}
