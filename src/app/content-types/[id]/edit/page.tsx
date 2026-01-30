import { notFound } from 'next/navigation'
import { ContentTypeForm } from '@/components/content-type-form'
import { getContentTypeAction } from '@/lib/clerk/actions/content-types'
import { getCustomFieldsAction } from '@/lib/clerk/actions/custom-fields'
import { requireOrgAdmin } from '@/lib/clerk/require-org-admin'
import { getTranslations } from '@/i18n/server'

type PageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function Page({ params }: PageProps) {
  await requireOrgAdmin()
  const t = await getTranslations()
  const { id } = await params
  const [contentType, customFields] = await Promise.all([
    getContentTypeAction(id),
    getCustomFieldsAction(),
  ])

  if (!contentType) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">
          {t('routes.content-types.edit.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('routes.content-types.edit.description')}
        </p>
      </div>
      <ContentTypeForm
        customFields={customFields}
        initialData={contentType}
        mode="edit"
      />
    </div>
  )
}
