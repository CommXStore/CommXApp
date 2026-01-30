import { clerkClient } from '@clerk/nextjs/server'

type EntitlementDecision =
  | { allowed: true }
  | { allowed: false; reason: string }

type EntitlementsProvider = {
  canJoinOrg: (userId: string, orgSlug: string) => Promise<EntitlementDecision>
}

function parseFeatureList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

const clerkEntitlements: EntitlementsProvider = {
  async canJoinOrg(userId: string, orgSlug: string) {
    const client = await clerkClient()
    const subscriptions = await client.billing.getSubscriptionList({
      userId,
    })
    const active = subscriptions.data.find(item => item.status === 'active')
    if (!active) {
      return { allowed: false, reason: 'No active subscription.' }
    }

    const plan = await client.billing.getPlan(active.planId)
    const features = parseFeatureList(plan.features)
    if (features.includes(orgSlug)) {
      return { allowed: true }
    }
    return { allowed: false, reason: 'Plan does not include this app.' }
  },
}

const allowAll: EntitlementsProvider = {
  canJoinOrg() {
    return { allowed: true }
  },
}

const provider =
  process.env.ENTITLEMENTS_PROVIDER === 'allow-all'
    ? allowAll
    : clerkEntitlements

export const entitlements = provider
