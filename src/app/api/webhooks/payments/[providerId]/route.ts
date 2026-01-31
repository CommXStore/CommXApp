import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'node:crypto'
import { clerkClient } from '@clerk/nextjs/server'
import { logger } from '@/lib/logger'
import { buildLogContext } from '@/lib/logger-context'
import { getPaymentProviderForWebhook } from '@/lib/supabase/payment-providers'

export const runtime = 'nodejs'

type PaymentWebhookPayload = {
  email?: string
  firstName?: string
  lastName?: string
  userId?: string
  organizationId?: string
  organizationSlug?: string
  metadata?: Record<string, unknown>
}

type RouteParams = {
  params: Promise<{ providerId: string }>
}

function computeSignature(secret: string, body: string) {
  const hash = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return `sha256=${hash}`
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

async function resolveOrganizationId(payload: PaymentWebhookPayload) {
  if (payload.organizationId) {
    return payload.organizationId
  }
  if (payload.organizationSlug) {
    const client = await clerkClient()
    const org = await client.organizations.getOrganization({
      slug: payload.organizationSlug,
    })
    return org.id
  }
  return null
}

async function resolveUserId(payload: PaymentWebhookPayload) {
  if (payload.userId) {
    return payload.userId
  }
  const email = payload.email?.trim()
  if (!email) {
    return null
  }
  const client = await clerkClient()
  const existing = await client.users.getUserList({
    emailAddress: [email],
    limit: 1,
  })
  if (existing.data.length > 0) {
    return existing.data[0].id
  }

  const user = await client.users.createUser({
    emailAddress: [email],
    firstName: payload.firstName,
    lastName: payload.lastName,
  })
  return user.id
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { providerId } = await params

  try {
    const provider = await getPaymentProviderForWebhook(providerId)
    if (!provider || provider.enabled === false) {
      return NextResponse.json(
        { error: 'Provider not found.' },
        { status: 404 }
      )
    }
    if (!provider.signing_secret) {
      return NextResponse.json(
        { error: 'Provider secret not configured.' },
        { status: 400 }
      )
    }

    const rawBody = await req.text()
    const signature = req.headers.get('x-webhook-signature') ?? ''
    const expected = computeSignature(provider.signing_secret, rawBody)
    if (!(signature && safeEqual(signature, expected))) {
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody) as PaymentWebhookPayload
    const organizationId = await resolveOrganizationId(payload)
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId or organizationSlug is required.' },
        { status: 400 }
      )
    }

    const userId = await resolveUserId(payload)
    if (!userId) {
      return NextResponse.json(
        { error: 'userId or email is required.' },
        { status: 400 }
      )
    }

    const client = await clerkClient()
    const memberships =
      await client.organizations.getOrganizationMembershipList({
        organizationId,
        userId: [userId],
        limit: 1,
      })
    if (memberships.data.length === 0) {
      await client.organizations.createOrganizationMembership({
        organizationId,
        userId,
        role: 'org:member',
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'POST /api/webhooks/payments/[providerId]',
          undefined,
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
