import { PaymentProvidersTable } from '@/components/payment-providers/table'
import { requireOrgAdmin } from '@/lib/clerk/require-org-admin'
import { getPaymentProvidersAction } from '@/lib/payment-providers/actions'

export const dynamic = 'force-dynamic'

export default async function Page() {
  await requireOrgAdmin()
  const providers = await getPaymentProvidersAction()
  return <PaymentProvidersTable data={providers} />
}
