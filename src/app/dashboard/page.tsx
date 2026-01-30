import { getTranslations } from '@/i18n/server'

export default async function Page() {
  const t = await getTranslations()

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <h1 className="font-semibold text-2xl">{t('routes.dashboard.title')}</h1>
      <p className="text-muted-foreground">
        {t('routes.dashboard.subtitle')}
      </p>
    </div>
  )
}
