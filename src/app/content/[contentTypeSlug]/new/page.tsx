import { ContentEntryForm } from '@/components/content-entry-form'
import { getContentEntriesAction } from '@/lib/clerk/actions'
import { getTranslations } from '@/i18n/server'

type PageProps = {
  params: Promise<{ contentTypeSlug: string }>
}

export const dynamic = 'force-dynamic'

export default async function Page({ params }: PageProps) {
  const t = await getTranslations()
  const { contentTypeSlug } = await params
  const { contentType, fields } = await getContentEntriesAction(contentTypeSlug)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">
          {t('routes.content.new.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('routes.content.new.description', {
            contentType: contentType.name,
          })}
        </p>
      </div>
      <ContentEntryForm
        contentType={contentType}
        fields={fields}
        mode="create"
      />
    </div>
  )
}
