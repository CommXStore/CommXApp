import { PricingTableSection } from './pricing-table'
import { getTranslations } from '@/i18n/server'

export default async function BillingUpgradePage() {
  const t = await getTranslations()

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full items-start justify-center px-4 py-10">
      <PricingTableSection
        description={t('routes.billing.upgrade.description')}
        heading={t('routes.billing.upgrade.title')}
      />
    </main>
  )
}
