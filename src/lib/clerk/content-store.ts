import { clerkClient } from '@clerk/nextjs/server'
import {
  parseContentTypes,
  parseCustomFields,
  type ContentType,
  type CustomField,
} from './content-schemas'

export async function getContentStore(organizationId: string) {
  const clerk = await clerkClient()
  const org = await clerk.organizations.getOrganization({ organizationId })
  const publicMetadata = org.publicMetadata ?? {}

  return {
    clerk,
    publicMetadata,
    contentTypes: parseContentTypes(publicMetadata.contentTypes),
    customFields: parseCustomFields(publicMetadata.customFields),
  }
}

export async function saveContentStore(
  organizationId: string,
  publicMetadata: Record<string, unknown>,
  contentTypes: ContentType[],
  customFields: CustomField[]
) {
  const clerk = await clerkClient()
  await clerk.organizations.updateOrganizationMetadata(organizationId, {
    publicMetadata: {
      ...publicMetadata,
      contentTypes,
      customFields,
    },
  })
}
