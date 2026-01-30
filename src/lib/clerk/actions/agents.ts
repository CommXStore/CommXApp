'use server'

import { revalidateTag } from 'next/cache'
import { cacheTags } from '@/lib/cache-tags'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'
import { checkAdmin, checkAuth } from '../check-auth'
import { getAgents, createAgent, deleteAgent } from '../metadata-utils'
import type { AgentInput } from '../metadata-utils'
import { withCache } from './cache'

export async function getAgentsAction() {
  const { success, error, data } = await checkAuth()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  return withCache(['agents', data.orgId], [cacheTags.agents(data.orgId)], () =>
    getAgents(data.orgId, token)
  )
}

export async function createAgentAction(payload: AgentInput) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  const agent = await createAgent(data.orgId, payload, token)
  revalidateTag(cacheTags.agents(data.orgId))
  return agent
}

export async function deleteAgentAction(agentId: string) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    throw new Error(error.message)
  }
  const token = await getSupabaseToken()
  const result = await deleteAgent(data.orgId, agentId, token)
  revalidateTag(cacheTags.agents(data.orgId))
  return result
}
