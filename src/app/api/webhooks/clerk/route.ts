import { NextResponse, type NextRequest } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { verifyWebhook } from '@clerk/backend/webhooks'
import { logger } from '@/lib/logger'
import { buildLogContext } from '@/lib/logger-context'
import { normalizeFeatureList } from '@/lib/entitlements/features'
import { upsertUserEntitlements } from '@/lib/supabase/entitlements-store'

export const runtime = 'nodejs'

type BillingSubscriptionItemPayload = {
  status: string
  plan_id?: string | null
  plan?: {
    id?: string | null
    slug?: string | null
    name?: string | null
  } | null
  payer?: { user_id?: string | null } | null
}

type SubscriptionItemPayload = {
  userId: string
  planId: string | null
  planSlug: string | null
  planName: string | null
  status: string
}

type BillingPlan = {
  id?: string | null
  slug?: string | null
  name?: string | null
  features?: unknown
}

type SubscriptionRecord = {
  status?: string | null
  planId?: string | null
  planSlug?: string | null
  planName?: string | null
}

function getSubscriptionItemPayload(
  data: BillingSubscriptionItemPayload
): SubscriptionItemPayload | null {
  const userId = data.payer?.user_id
  if (!userId) {
    return null
  }
  return {
    userId,
    planId: data.plan_id ?? data.plan?.id ?? null,
    planSlug: data.plan?.slug ?? null,
    planName: data.plan?.name ?? null,
    status: data.status,
  }
}

function logSubscriptionSnapshot(
  data: SubscriptionRecord[] | undefined,
  phase: string,
  userId: string
) {
  logger.info(
    {
      phase,
      statuses: data?.map(item => item.status ?? 'unknown') ?? [],
      planIds: data?.map(item => item.planId ?? 'unknown') ?? [],
      planSlugs: data?.map(item => item.planSlug ?? 'unknown') ?? [],
      userId,
    },
    'Subscription list snapshot.'
  )
}

function buildActivePayload(
  payload: SubscriptionItemPayload,
  subscription: SubscriptionRecord,
  plan: BillingPlan | null
): SubscriptionItemPayload {
  return {
    userId: payload.userId,
    status: 'active',
    planId: subscription.planId ?? payload.planId,
    planSlug: subscription.planSlug ?? plan?.slug ?? payload.planSlug,
    planName: subscription.planName ?? plan?.name ?? payload.planName,
  }
}

async function resolvePlanById(
  billing: {
    getPlan?: (planId: string) => Promise<BillingPlan>
    getPlanList?: () => Promise<{ data?: BillingPlan[] }>
  },
  planId: string | null
) {
  if (!planId) {
    return null
  }
  if (typeof billing.getPlan === 'function') {
    return billing.getPlan(planId)
  }
  if (typeof billing.getPlanList === 'function') {
    const plans = await billing.getPlanList()
    return plans.data?.find(item => item.id === planId) ?? null
  }
  return null
}

async function pickActiveSubscription(
  billing: {
    getPlan?: (planId: string) => Promise<BillingPlan>
    getPlanList?: () => Promise<{ data?: BillingPlan[] }>
  },
  payload: SubscriptionItemPayload,
  activeSubs: SubscriptionRecord[]
): Promise<{ payload: SubscriptionItemPayload; plan: BillingPlan | null }> {
  for (const sub of activeSubs) {
    const plan = await resolvePlanById(billing, sub.planId ?? null)
    const features = normalizeFeatureList(plan?.features)
    if (features.length > 0) {
      return {
        payload: buildActivePayload(payload, sub, plan),
        plan,
      }
    }
  }

  const primary = activeSubs[0]
  const plan = await resolvePlanById(billing, primary.planId ?? null)
  return {
    payload: buildActivePayload(payload, primary, plan),
    plan,
  }
}

async function resolveEffectiveSubscription(
  client: Awaited<ReturnType<typeof clerkClient>>,
  payload: SubscriptionItemPayload
): Promise<{
  payload: SubscriptionItemPayload
  plan: BillingPlan | null
  features: string[]
}> {
  const billing = client.billing as {
    getSubscriptionList?: (input: {
      userId: string
    }) => Promise<{ data?: SubscriptionRecord[] }>
    getPlan?: (planId: string) => Promise<BillingPlan>
    getPlanList?: () => Promise<{ data?: BillingPlan[] }>
  }

  if (typeof billing.getSubscriptionList !== 'function') {
    const plan = await resolvePlanById(billing, payload.planId)
    return { payload, plan, features: normalizeFeatureList(plan?.features) }
  }

  let subscriptions = await billing.getSubscriptionList({
    userId: payload.userId,
  })

  logSubscriptionSnapshot(subscriptions.data, 'initial', payload.userId)
  let activeSubs =
    subscriptions.data?.filter(item => item.status === 'active') ?? []
  if (activeSubs.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    subscriptions = await billing.getSubscriptionList({
      userId: payload.userId,
    })
    logSubscriptionSnapshot(subscriptions.data, 'retry', payload.userId)
    activeSubs =
      subscriptions.data?.filter(item => item.status === 'active') ?? []
  }

  if (activeSubs.length > 0) {
    const { payload: nextPayload, plan: activePlan } =
      await pickActiveSubscription(billing, payload, activeSubs)
    return {
      payload: nextPayload,
      plan: activePlan,
      features: normalizeFeatureList(activePlan?.features),
    }
  }

  const fallbackPlan = await resolvePlanById(billing, payload.planId)
  return {
    payload,
    plan: fallbackPlan,
    features: normalizeFeatureList(fallbackPlan?.features),
  }
}

async function revokeMembershipsForFeatures(
  client: Awaited<ReturnType<typeof clerkClient>>,
  userId: string,
  features: string[]
) {
  if (!userId || features.length === 0) {
    return
  }

  const slugs = features.map(feature => feature.replaceAll('_', '-'))
  await Promise.all(
    slugs.map(async slug => {
      try {
        const organization = await client.organizations.getOrganization({
          slug,
        })
        await client.organizations.deleteOrganizationMembership({
          organizationId: organization.id,
          userId,
        })
      } catch (error) {
        logger.warn(
          { err: error, userId, slug },
          'Failed to revoke organization membership.'
        )
      }
    })
  )
}

export async function POST(req: NextRequest) {
  try {
    const signingSecret = (
      process.env.CLERK_WEBHOOK_SECRET ??
      process.env.CLERK_WEBHOOK_SIGNING_SECRET
    )?.trim()
    if (!signingSecret) {
      logger.error(
        {
          ...buildLogContext('POST /api/webhooks/clerk', undefined, req),
        },
        'Missing Clerk webhook signing secret.'
      )
      return NextResponse.json(
        { error: 'Missing webhook signing secret.' },
        { status: 500 }
      )
    }
    const rawBody = await req.clone().text()
    logger.info(
      {
        bodyLength: rawBody.length,
        hasSvixId: Boolean(req.headers.get('svix-id')),
        hasSvixSignature: Boolean(req.headers.get('svix-signature')),
        hasSvixTimestamp: Boolean(req.headers.get('svix-timestamp')),
        ...buildLogContext('POST /api/webhooks/clerk', undefined, req),
      },
      'Webhook received.'
    )
    if (!rawBody) {
      logger.error(
        {
          ...buildLogContext('POST /api/webhooks/clerk', undefined, req),
        },
        'Webhook payload is empty.'
      )
      return NextResponse.json(
        { error: 'Webhook payload is empty.' },
        { status: 400 }
      )
    }

    const event = await verifyWebhook(req, {
      signingSecret,
    })

    if (!event.type.startsWith('subscriptionItem.')) {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const data = event.data as BillingSubscriptionItemPayload
    const payload = getSubscriptionItemPayload(data)
    if (!payload) {
      logger.warn(
        {
          ...buildLogContext('POST /api/webhooks/clerk', undefined, req),
        },
        'Webhook subscription item missing payer user id.'
      )
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const client = await clerkClient()
    const {
      payload: effectivePayload,
      plan,
      features,
    } = await resolveEffectiveSubscription(client, payload)
    if (effectivePayload.planId && !plan) {
      logger.error(
        {
          ...buildLogContext('POST /api/webhooks/clerk', undefined, req),
          planId: effectivePayload.planId,
        },
        'Unable to resolve billing plan.'
      )
      return NextResponse.json(
        { error: 'Plan lookup failed.' },
        { status: 503 }
      )
    }

    try {
      await upsertUserEntitlements({
        userId: effectivePayload.userId,
        status: effectivePayload.status,
        planId: effectivePayload.planId,
        planSlug: plan?.slug ?? effectivePayload.planSlug,
        planName: plan?.name ?? effectivePayload.planName,
        features,
      })
      logger.info(
        {
          userId: effectivePayload.userId,
          status: effectivePayload.status,
          planId: effectivePayload.planId,
          planSlug: plan?.slug ?? effectivePayload.planSlug ?? 'unknown',
          features,
        },
        'Entitlements persisted.'
      )
    } catch (error) {
      logger.error(
        {
          err: error,
          ...buildLogContext('POST /api/webhooks/clerk', undefined, req),
        },
        'Failed to persist subscription entitlements.'
      )
      return NextResponse.json(
        { error: 'Entitlements persistence failed.' },
        { status: 503 }
      )
    }

    if (effectivePayload.status === 'ended') {
      await revokeMembershipsForFeatures(
        client,
        effectivePayload.userId,
        features
      )
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    logger.error(
      {
        err,
        ...buildLogContext('POST /api/webhooks/clerk', undefined, req),
      },
      'Webhook verification failed.'
    )
    return NextResponse.json(
      { error: 'Webhook verification failed.' },
      { status: 400 }
    )
  }
}
