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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">
          {t('routes.settings.paymentProviders.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('routes.settings.paymentProviders.description')}
        </p>
      </div>
      <PaymentProvidersTable data={providers} />
    </div>
  )
}
