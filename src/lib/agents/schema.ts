import { z } from 'zod'

export const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  model: z.string(),
})

export const agentInputSchema = agentSchema.omit({ id: true }).extend({
  id: z.string().optional(),
})

export type Agent = z.infer<typeof agentSchema>
export type AgentInput = z.input<typeof agentInputSchema>
