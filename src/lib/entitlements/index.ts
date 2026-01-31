import { cache } from 'react'
import { clerkClient } from '@clerk/nextjs/server'
import { normalizeFeatureList } from '@/lib/entitlements/features'

type EntitlementDecision =
  | { allowed: true }
  | { allowed: false; reason: string }

type EntitlementsProvider = {
  canJoinOrg: (userId: string, orgSlug: string) => Promise<EntitlementDecision>
}

const getPlanFeatureSlugs = cache(async () => {
  const client = await clerkClient()
  const plans = await client.billing.getPlanList()
  const slugs = new Set<string>()

  for (const plan of plans.data ?? []) {
    for (const feature of normalizeFeatureList(plan.features)) {
      slugs.add(feature)
    }
  }

  return Array.from(slugs)
})

export async function requiresSubscriptionForOrg(
  orgSlug: string
): Promise<boolean> {
  if (!orgSlug) {
    return false
  }
  const slugs = await getPlanFeatureSlugs()
  return slugs.includes(orgSlug)
}

const clerkEntitlements: EntitlementsProvider = {
  async canJoinOrg(userId: string, orgSlug: string) {
    const requiresSubscription = await requiresSubscriptionForOrg(orgSlug)
    if (!requiresSubscription) {
      return { allowed: true }
    }
    if (!userId) {
      return { allowed: false, reason: 'User is required.' }
    }

    const client = await clerkClient()
    const subscriptions = await client.billing.getSubscriptionList({
      userId,
    })
    const active = subscriptions.data.find(item => item.status === 'active')
    if (!active) {
      return { allowed: false, reason: 'No active subscription.' }
    }

    const plan = await client.billing.getPlan(active.planId)
    const features = normalizeFeatureList(plan.features)
    if (features.includes(orgSlug)) {
      return { allowed: true }
    }
    return { allowed: false, reason: 'Plan does not include this app.' }
  },
}

const webhookEntitlements: EntitlementsProvider = {
  async canJoinOrg(userId: string, orgSlug: string) {
    const requiresSubscription = await requiresSubscriptionForOrg(orgSlug)
    if (!requiresSubscription) {
      return { allowed: true }
    }
    if (!userId) {
      return { allowed: false, reason: 'User is required.' }
    }

    const { getUserEntitlements } = await import(
      '@/lib/supabase/entitlements-store'
    )
    const record = await getUserEntitlements(userId)
    if (!record) {
      return { allowed: false, reason: 'No subscription record found.' }
    }
    if (record.status !== 'active') {
      return { allowed: false, reason: 'Subscription is not active.' }
    }
    if (record.features.includes(orgSlug)) {
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

const provider = (() => {
  const mode = process.env.ENTITLEMENTS_PROVIDER
  if (mode === 'allow-all') {
    return allowAll
  }
  if (mode === 'webhook-cache') {
    return webhookEntitlements
  }
  return clerkEntitlements
})()

export const entitlements = provider
