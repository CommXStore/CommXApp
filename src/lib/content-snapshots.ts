import { nowIso } from '@/lib/content-utils'
import {
  parseContentEntries,
  parseContentTypes,
  parseCustomFields,
  type ContentEntry,
  type ContentType,
  type CustomField,
} from '@/lib/clerk/content-schemas'

export type ContentSnapshot = {
  at: string
  contentTypes: ContentType[]
  customFields: CustomField[]
  contentEntries: Record<string, ContentEntry[]>
}

export const MAX_SNAPSHOTS = 5

export function parseSnapshots(value: unknown): ContentSnapshot[] {
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
