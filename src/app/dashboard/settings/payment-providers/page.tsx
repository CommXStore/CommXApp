import { PaymentProvidersTable } from '@/components/payment-providers/table'
import { requireOrgAdmin } from '@/lib/clerk/require-org-admin'
import { getPaymentProvidersAction } from '@/lib/payment-providers/actions'

export const dynamic = 'force-dynamic'

export default async function PaymentProvidersPage() {
  await requireOrgAdmin()
  const providers = await getPaymentProvidersAction()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">Payment Providers</h1>
        <p className="text-muted-foreground">
          Configure payment providers for your organization.
        </p>
      </div>
      <PaymentProvidersTable data={providers} />
    </div>
  )
}
