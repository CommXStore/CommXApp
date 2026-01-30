import { CustomFieldsTable } from '@/components/custom-fields-table'
import {
  getContentTypesAction,
  getCustomFieldsAction,
} from '@/lib/clerk/actions'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [contentTypes, customFields] = await Promise.all([
    getContentTypesAction(),
    getCustomFieldsAction(),
  ])

  return <CustomFieldsTable contentTypes={contentTypes} data={customFields} />
}
