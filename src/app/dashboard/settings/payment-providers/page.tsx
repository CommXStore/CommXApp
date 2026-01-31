import { PaymentProvidersManager } from '@/components/payment-providers/manager'
import { requireOrgAdmin } from '@/lib/clerk/require-org-admin'
import { getTranslations } from '@/i18n/server'

export default async function PaymentProvidersPage() {
  await requireOrgAdmin()
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
      <PaymentProvidersManager />
    </div>
  )
}
