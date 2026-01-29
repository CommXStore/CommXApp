import { ContentTypesTable } from '@/components/content-types-table'
import { getContentTypesAction } from '@/lib/clerk/actions'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const contentTypes = await getContentTypesAction()
  return <ContentTypesTable data={contentTypes} />
}
