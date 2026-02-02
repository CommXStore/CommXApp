import { PaymentProvidersTable } from '@/components/payment-providers/table'
import { requireOrgAdmin } from '@/lib/clerk/require-org-admin'
import { getPaymentProvidersAction } from '@/lib/payment-providers/actions'
import { getTranslations } from '@/i18n/server'

export const dynamic = 'force-dynamic'

export default async function PaymentProvidersPage() {
  await requireOrgAdmin()
  const providers = await getPaymentProvidersAction()
  const t = await getTranslations()

  return (
    <div className="flex flex-col gap-4 p-8 pt-6">
      <h1 className="font-semibold text-lg">
        {t('routes.settings.paymentProviders.title')}
      </h1>
      <p className="text-muted-foreground text-sm">
        {t('routes.settings.paymentProviders.description')}
      </p>
      <PaymentProvidersTable data={providers} />
    </div>
  )
}
