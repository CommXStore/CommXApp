import { NextResponse, type NextRequest } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { checkAdmin } from '@/lib/clerk/check-auth'
import { logger } from '@/lib/logger'
import { buildLogContext } from '@/lib/logger-context'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { normalizeFeatureList } from '@/lib/entitlements/features'
import { upsertUserEntitlements } from '@/lib/supabase/entitlements-store'

type BackfillPayload = {
  userId?: string
  userIds?: string[]
}

export async function POST(req: NextRequest) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      {
        error,
        ...buildLogContext(
          'POST /api/admin/entitlements/backfill',
          undefined,
          req
        ),
      },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const rate = checkRateLimit(
    `${data.orgId}:${getClientIp(req)}:entitlements:backfill`,
    10,
    60_000
  )
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  try {
    const payload = (await req.json()) as BackfillPayload
    const rawIds = payload.userIds ?? (payload.userId ? [payload.userId] : [])
    const userIds = Array.from(
      new Set(rawIds.map(value => value?.trim()).filter(Boolean))
    )

    if (userIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one userId is required.' },
        { status: 400 }
      )
    }

    const client = await clerkClient()
    const results: Array<{
      userId: string
      status: string
      planId?: string
      features: number
    }> = []

    for (const userId of userIds) {
      const subscription =
        await client.billing.getUserBillingSubscription(userId)
      const active =
        subscription && subscription.status === 'active' ? subscription : null

      if (!active) {
        await upsertUserEntitlements({
          userId,
          status: 'inactive',
          features: [],
        })
        results.push({ userId, status: 'inactive', features: 0 })
        continue
      }

      const plans = await client.billing.getPlanList()
      const plan = plans.data?.[0]
      const features = normalizeFeatureList(plan?.features ?? [])

      await upsertUserEntitlements({
        userId,
        status: active.status,
        planId: plan?.id ?? null,
        planSlug: plan?.slug ?? null,
        planName: plan?.name ?? null,
        features,
      })

      results.push({
        userId,
        status: active.status,
        planId: plan?.id ?? null,
        features: features.length,
      })
    }

    return NextResponse.json({ success: true, data: results }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'POST /api/admin/entitlements/backfill',
          { orgId: data.orgId, userId: data.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
