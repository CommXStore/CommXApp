import { clerkClient } from '@clerk/nextjs/server'
import { nowIso } from '@/lib/content-utils'
import {
  parseContentTypes,
  parseCustomFields,
  parseContentEntries,
  type ContentType,
  type CustomField,
  type ContentEntry,
} from './content-schemas'

type ContentSnapshot = {
  at: string
  contentTypes: ContentType[]
  customFields: CustomField[]
  contentEntries: Record<string, ContentEntry[]>
}

type SaveContentStoreInput = {
  organizationId: string
  publicMetadata: Record<string, unknown>
  contentTypes: ContentType[]
  customFields: CustomField[]
  contentEntries: Record<string, ContentEntry[]>
}

const MAX_SNAPSHOTS = 5

function parseSnapshots(value: unknown): ContentSnapshot[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map(item => {
    const snapshot = item as Partial<ContentSnapshot>
    return {
      at: typeof snapshot.at === 'string' ? snapshot.at : nowIso(),
      contentTypes: parseContentTypes(snapshot.contentTypes),
      customFields: parseCustomFields(snapshot.customFields),
      contentEntries: parseContentEntries(snapshot.contentEntries),
    }
  })
}

export async function getContentStore(organizationId: string) {
  const clerk = await clerkClient()
  const org = await clerk.organizations.getOrganization({ organizationId })
  const publicMetadata = org.publicMetadata ?? {}

  return {
    clerk,
    publicMetadata,
    contentTypes: parseContentTypes(publicMetadata.contentTypes),
    customFields: parseCustomFields(publicMetadata.customFields),
    contentEntries: parseContentEntries(publicMetadata.contentEntries),
  }
}

export async function saveContentStore({
  organizationId,
  publicMetadata,
  contentTypes,
  customFields,
  contentEntries,
}: SaveContentStoreInput) {
  const clerk = await clerkClient()
  const previousSnapshot: ContentSnapshot = {
    at: nowIso(),
    contentTypes: parseContentTypes(publicMetadata.contentTypes),
    customFields: parseCustomFields(publicMetadata.customFields),
    contentEntries: parseContentEntries(publicMetadata.contentEntries),
  }
  const snapshots = [
    previousSnapshot,
    ...parseSnapshots(publicMetadata.contentSnapshots),
  ].slice(0, MAX_SNAPSHOTS)

  await clerk.organizations.updateOrganizationMetadata(organizationId, {
    publicMetadata: {
      ...publicMetadata,
      contentTypes,
      customFields,
      contentEntries,
      contentSnapshots: snapshots,
    },
  })
}
