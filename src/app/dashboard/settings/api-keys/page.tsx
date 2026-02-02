import { APIKeys } from '@clerk/nextjs'
import { RequestTester } from '@/components/request-tester'
import { getTranslations } from '@/i18n/server'
import { PageHeader, PageLayout } from '@/components/page-layout'

export default async function SettingsPage() {
  const t = await getTranslations()
  return (
    <PageLayout
      header={
        <PageHeader
          description={t('routes.settings.apiKeys.description')}
          title={t('routes.settings.apiKeys.title')}
        />
      }
    >
      <APIKeys showDescription />
      <RequestTester />
    </PageLayout>
  )
}
