import { PricingTableSection } from './pricing-table'
import { getTranslations } from '@/i18n/server'

type BillingUpgradePageProps = {
  searchParams: Promise<{ redirect?: string }>
}

export default async function BillingUpgradePage({
  searchParams,
}: BillingUpgradePageProps) {
  const t = await getTranslations()
  const { redirect } = await searchParams

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full items-start justify-center px-4 py-10">
      <PricingTableSection
        description={t('routes.billing.upgrade.description')}
        heading={t('routes.billing.upgrade.title')}
        newSubscriptionRedirectUrl={redirect}
      />
    </main>
  )
}
