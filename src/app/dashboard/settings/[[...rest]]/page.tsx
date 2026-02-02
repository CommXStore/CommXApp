import { APIKeys } from '@clerk/nextjs'
import { RequestTester } from '@/components/request-tester'
import { getTranslations } from '@/i18n/server'
import { PageHeader, PageLayout } from '@/components/page-layout'

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
