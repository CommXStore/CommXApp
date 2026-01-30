import { ContentTypesTable } from '@/components/content-types-table'
import { getContentTypesAction } from '@/lib/clerk/actions'
import { requireOrgAdmin } from '@/lib/clerk/require-org-admin'

export const dynamic = 'force-dynamic'

export default async function Page() {
  await requireOrgAdmin()
  const contentTypes = await getContentTypesAction()
  return <ContentTypesTable data={contentTypes} />
}
