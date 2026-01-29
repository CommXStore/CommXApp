import { ContentEntriesTable } from '@/components/content-entries-table'
import { getContentEntriesAction } from '@/lib/clerk/actions'

type PageProps = {
  params: Promise<{ contentTypeSlug: string }>
}

export const dynamic = 'force-dynamic'

export default async function Page({ params }: PageProps) {
  const { contentTypeSlug } = await params
  const { contentType, entries } = await getContentEntriesAction(contentTypeSlug)
  return <ContentEntriesTable contentType={contentType} entries={entries} />
}
