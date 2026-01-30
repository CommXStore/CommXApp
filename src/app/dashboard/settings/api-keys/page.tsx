import { APIKeys } from '@clerk/nextjs'
import { RequestTester } from '@/components/request-tester'
import { getTranslations } from '@/i18n/server'

export default async function SettingsPage() {
  const t = await getTranslations()
  return (
    <div className="flex flex-col gap-4 p-8 pt-6">
      <h1 className="font-semibold text-lg">
        {t('routes.settings.apiKeys.title')}
      </h1>
      <APIKeys showDescription />
      <RequestTester />
    </div>
  )
}
