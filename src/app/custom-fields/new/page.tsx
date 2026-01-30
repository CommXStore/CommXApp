import { CustomFieldForm } from '@/components/custom-field-form'
import { getContentTypesAction } from '@/lib/clerk/actions/content-types'
import { requireOrgAdmin } from '@/lib/clerk/require-org-admin'
import { getTranslations } from '@/i18n/server'

export const dynamic = 'force-dynamic'

export default async function Page() {
  await requireOrgAdmin()
  const t = await getTranslations()
  const contentTypes = await getContentTypesAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">
          {t('routes.custom-fields.new.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('routes.custom-fields.new.description')}
        </p>
      </div>
      <CustomFieldForm contentTypes={contentTypes} mode="create" />
    </div>
  )
}
