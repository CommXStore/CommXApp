import { CustomFieldsTable } from '@/components/custom-fields-table'
import { getContentTypesAction } from '@/lib/clerk/actions/content-types'
import { getCustomFieldsAction } from '@/lib/clerk/actions/custom-fields'
import { requireOrgAdmin } from '@/lib/clerk/require-org-admin'

export const dynamic = 'force-dynamic'

export default async function Page() {
  await requireOrgAdmin()
  const [contentTypes, customFields] = await Promise.all([
    getContentTypesAction(),
    getCustomFieldsAction(),
  ])

  return <CustomFieldsTable contentTypes={contentTypes} data={customFields} />
}
