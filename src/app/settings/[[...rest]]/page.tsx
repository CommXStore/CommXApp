import { getTranslations } from '@/i18n/server'
import { PageHeader, PageLayout } from '@/components/page-layout'
import { ApiTabs } from '@/components/api-tabs'

type SettingsPageProps = {
  params?: Promise<{ rest?: string[] }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const t = await getTranslations()
  const resolvedParams = await params

  if (resolvedParams?.rest?.length) {
    return null
  }

  return (
    <PageLayout
      header={
        <PageHeader
          description={t('routes.settings.description')}
          title={t('routes.settings.title')}
        />
      }
    >
      <h2 className="font-semibold text-lg">
        {t('routes.settings.apiKeys.sectionTitle')}
      </h2>
      <ApiTabs />
    </PageLayout>
  )
}
