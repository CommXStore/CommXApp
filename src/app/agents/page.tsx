import { DataTable } from '@/components/data-table'
import { getAgentsAction } from '@/lib/clerk/actions/agents'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const agents = await getAgentsAction()
  return <DataTable data={agents} />
}
