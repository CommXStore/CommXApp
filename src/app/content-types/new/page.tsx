import { ContentTypeForm } from '@/components/content-type-form'
import { getCustomFieldsAction } from '@/lib/clerk/actions'
import { getTranslations } from '@/i18n/server'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const t = await getTranslations()
  const customFields = await getCustomFieldsAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">
          {t('routes.content-types.new.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('routes.content-types.new.description')}
        </p>
      </div>
      <ContentTypeForm customFields={customFields} mode="create" />
    </div>
  )
}
