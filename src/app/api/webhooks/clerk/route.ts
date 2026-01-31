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
    const plan =
      payload.planId != null
        ? await client.billing.getPlan(payload.planId)
        : null
    const features = normalizeFeatureList(plan?.features)

    try {
      await upsertUserEntitlements({
        userId: payload.userId,
        status: payload.status,
        planId: payload.planId,
        planSlug: plan?.slug ?? payload.planSlug,
        planName: plan?.name ?? payload.planName,
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
