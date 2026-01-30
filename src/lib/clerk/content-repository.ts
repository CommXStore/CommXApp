import type { ContentEntry, ContentType, CustomField } from './content-schemas'
import { getContentStore, saveContentStore } from './content-store'

type ContentStore = {
  publicMetadata: Record<string, unknown>
  contentTypes: ContentType[]
  customFields: CustomField[]
  contentEntries: Record<string, ContentEntry[]>
}

type ContentRepository = {
  getStore: (
    organizationId: string,
    token?: string | null
  ) => Promise<ContentStore>
  saveStore: (input: {
    organizationId: string
    publicMetadata: Record<string, unknown>
    contentTypes: ContentType[]
    customFields: CustomField[]
    contentEntries: Record<string, ContentEntry[]>
    token?: string | null
  }) => Promise<void>
}

export const contentRepository: ContentRepository = {
  async getStore(organizationId, token) {
    const { publicMetadata, contentTypes, customFields, contentEntries } =
      await getContentStore(organizationId, token)

    return { publicMetadata, contentTypes, customFields, contentEntries }
  },
  saveStore: saveContentStore,
}
