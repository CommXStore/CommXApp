import { PricingTableSection } from './pricing-table'
import { getTranslations } from '@/i18n/server'
import { headers } from 'next/headers'

type BillingUpgradePageProps = {
  searchParams: Promise<{ redirect?: string }>
}

async function buildAbsoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  const headerStore = await headers()
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host')
  const proto = headerStore.get('x-forwarded-proto') ?? 'http'
  if (!host) {
    return path
  }
  return `${proto}://${host}${path.startsWith('/') ? path : `/${path}`}`
}

export default async function BillingUpgradePage({
  searchParams,
}: BillingUpgradePageProps) {
  const t = await getTranslations()
  const { redirect } = await searchParams
  const redirectUrl = redirect ? await buildAbsoluteUrl(redirect) : undefined

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full items-start justify-center px-4 py-10">
      <PricingTableSection
        description={t('routes.billing.upgrade.description')}
        heading={t('routes.billing.upgrade.title')}
        newSubscriptionRedirectUrl={redirectUrl}
      />
    </main>
  )
}
