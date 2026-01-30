import { ContentEntriesTable } from '@/components/content-entries-table'
import { getContentEntriesAction } from '@/lib/clerk/actions'
import { redirect } from 'next/navigation'
import { getTranslations } from '@/i18n/server'
import { defaultLocale } from '@/i18n/config'

type PageProps = {
  params: Promise<{ contentTypeSlug: string }>
}

export const dynamic = 'force-dynamic'

export default async function Page({ params }: PageProps) {
  const t = await getTranslations(defaultLocale)
  const { contentTypeSlug } = await params
  try {
    const { contentType, entries } =
      await getContentEntriesAction(contentTypeSlug)
    return <ContentEntriesTable contentType={contentType} entries={entries} />
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes(t('routes.content.errors.contentTypeNotFound'))) {
      redirect('/content-types')
    }
    throw error
  }
}
