import { nanoid } from 'nanoid'
import {
  agentInputSchema,
  agentSchema,
  type Agent,
  type AgentInput,
} from '@/lib/agents/schema'
import {
  getOrganizationStore,
  updateOrganizationStore,
} from '@/lib/supabase/organization-store'

export async function getAgents(
  organizationId: string,
  token?: string | null
): Promise<Agent[]> {
  const store = await getOrganizationStore(organizationId, token)
  return store.agents
}

export async function createAgent(
  organizationId: string,
  agent: AgentInput,
  token?: string | null
) {
  const store = await getOrganizationStore(organizationId, token)
  const newAgent = agentSchema.parse({
    ...agentInputSchema.parse(agent),
    id: `agent_${nanoid()}`,
  })
  await updateOrganizationStore(
    organizationId,
    {
      agents: [...store.agents, newAgent],
    },
    token
  )
  return newAgent
}

export const deleteAgent = async (
  organizationId: string,
  agentId: string,
  token?: string | null
) => {
  const store = await getOrganizationStore(organizationId, token)
  const agents = store.agents.filter(agent => agent.id !== agentId)
  await updateOrganizationStore(organizationId, { agents }, token)
  return { success: true, agents }
}
