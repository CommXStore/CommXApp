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

async function resolveEffectiveSubscription(
  client: Awaited<ReturnType<typeof clerkClient>>,
  payload: SubscriptionItemPayload
): Promise<SubscriptionItemPayload> {
  if (payload.status === 'active') {
    return payload
  }
  const billing = client.billing as {
    getSubscriptionList?: (input: {
      userId: string
    }) => Promise<{ data?: SubscriptionRecord[] }>
  }
  if (typeof billing.getSubscriptionList !== 'function') {
    return payload
  }
  const subscriptions = await billing.getSubscriptionList({
    userId: payload.userId,
  })
  const active = subscriptions.data?.find(item => item.status === 'active')
  if (!active) {
    return payload
  }
  return {
    userId: payload.userId,
    status: 'active',
    planId: active.planId ?? payload.planId,
    planSlug: active.planSlug ?? payload.planSlug,
    planName: active.planName ?? payload.planName,
  }
}

async function resolveBillingPlan(
  client: Awaited<ReturnType<typeof clerkClient>>,
  payload: SubscriptionItemPayload
): Promise<BillingPlan | null> {
  if (!payload.planId) {
    return null
  }
  const billing = client.billing as {
    getPlan?: (planId: string) => Promise<BillingPlan>
    getPlanList?: () => Promise<{ data?: BillingPlan[] }>
  }

  if (typeof billing.getPlan === 'function') {
    return billing.getPlan(payload.planId)
  }
  if (typeof billing.getPlanList === 'function') {
    const plans = await billing.getPlanList()
    return plans.data?.find(plan => plan.id === payload.planId) ?? null
  }
  return null
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
    const effectivePayload = await resolveEffectiveSubscription(
      client,
      payload
    )
    const plan = await resolveBillingPlan(client, effectivePayload)
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
    const features = normalizeFeatureList(plan?.features)

    try {
      await upsertUserEntitlements({
        userId: effectivePayload.userId,
        status: effectivePayload.status,
        planId: effectivePayload.planId,
        planSlug: plan?.slug ?? effectivePayload.planSlug,
        planName: plan?.name ?? effectivePayload.planName,
        features,
      })
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
