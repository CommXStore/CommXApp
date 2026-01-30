import { notFound } from 'next/navigation'
import { CustomFieldForm } from '@/components/custom-field-form'
import { getContentTypesAction } from '@/lib/clerk/actions/content-types'
import { getCustomFieldAction } from '@/lib/clerk/actions/custom-fields'
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
  const [customField, contentTypes] = await Promise.all([
    getCustomFieldAction(id),
    getContentTypesAction(),
  ])

  if (!customField) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">
          {t('routes.custom-fields.edit.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('routes.custom-fields.edit.description')}
        </p>
      </div>
      <CustomFieldForm
        contentTypes={contentTypes}
        initialData={customField}
        mode="edit"
      />
    </div>
  )
}
