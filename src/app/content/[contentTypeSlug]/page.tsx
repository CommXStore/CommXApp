import { ContentEntriesTable } from '@/components/content-entries-table'
import { getContentEntriesAction } from '@/lib/clerk/actions'
import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ contentTypeSlug: string }>
}

export const dynamic = 'force-dynamic'

export default async function Page({ params }: PageProps) {
  const { contentTypeSlug } = await params
  try {
    const { contentType, entries } =
      await getContentEntriesAction(contentTypeSlug)
    return <ContentEntriesTable contentType={contentType} entries={entries} />
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('Tipo de conteúdo não encontrado')) {
      redirect('/content-types')
    }
    throw error
  }
}
