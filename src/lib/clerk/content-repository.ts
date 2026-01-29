import type { ContentEntry, ContentType, CustomField } from './content-schemas'
import { getContentStore, saveContentStore } from './content-store'

type ContentStore = {
  publicMetadata: Record<string, unknown>
  contentTypes: ContentType[]
  customFields: CustomField[]
  contentEntries: Record<string, ContentEntry[]>
}

type ContentRepository = {
  getStore: (organizationId: string) => Promise<ContentStore>
  saveStore: (
    organizationId: string,
    publicMetadata: Record<string, unknown>,
    contentTypes: ContentType[],
    customFields: CustomField[],
    contentEntries: Record<string, ContentEntry[]>
  ) => Promise<void>
}

export const contentRepository: ContentRepository = {
  async getStore(organizationId) {
    const { publicMetadata, contentTypes, customFields, contentEntries } =
      await getContentStore(organizationId)

    return { publicMetadata, contentTypes, customFields, contentEntries }
  },
  saveStore: saveContentStore,
}

export { getContentStore, saveContentStore }
