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

export async function getAgents(organizationId: string): Promise<Agent[]> {
  const store = await getOrganizationStore(organizationId)
  return store.agents
}

export async function createAgent(organizationId: string, agent: AgentInput) {
  const store = await getOrganizationStore(organizationId)
  const newAgent = agentSchema.parse({
    ...agentInputSchema.parse(agent),
    id: `agent_${nanoid()}`,
  })
  await updateOrganizationStore(organizationId, {
    agents: [...store.agents, newAgent],
  })
  return newAgent
}

export const deleteAgent = async (organizationId: string, agentId: string) => {
  const store = await getOrganizationStore(organizationId)
  const agents = store.agents.filter(agent => agent.id !== agentId)
  await updateOrganizationStore(organizationId, { agents })
  return { success: true, agents }
}
