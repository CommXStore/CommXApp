import { notFound, redirect } from 'next/navigation'
import { ContentEntryForm } from '@/components/content-entry-form'
import { getContentEntryAction } from '@/lib/clerk/actions/content-entries'
import { getTranslations } from '@/i18n/server'

type PageProps = {
  params: Promise<{ contentTypeSlug: string; entryId: string }>
}

export const dynamic = 'force-dynamic'

export default async function Page({ params }: PageProps) {
  const t = await getTranslations()
  const { contentTypeSlug, entryId } = await params
  try {
    const { contentType, entry, fields } = await getContentEntryAction(
      contentTypeSlug,
      entryId
    )

    if (!entry) {
      notFound()
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-semibold text-2xl">
            {t('routes.content.edit.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('routes.content.edit.description', {
              contentType: contentType.name,
            })}
          </p>
        </div>
        <ContentEntryForm
          contentType={contentType}
          fields={fields}
          initialData={entry}
          mode="edit"
        />
      </div>
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes(t('routes.content.errors.contentTypeNotFound'))) {
      redirect('/')
    }
    throw error
  }
}
