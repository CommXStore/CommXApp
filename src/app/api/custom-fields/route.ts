import { NextResponse, type NextRequest } from 'next/server'
import { checkAdmin } from '@/lib/clerk/check-auth'
import {
  getCustomFields,
  createCustomField,
} from '@/lib/clerk/custom-fields-utils'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'
import { buildLogContext } from '@/lib/logger-context'

export async function GET(req: NextRequest) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      { error, ...buildLogContext('GET /api/custom-fields', undefined, req) },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const token = await getSupabaseToken()
    const customFields = await getCustomFields(data.orgId, token)
    return NextResponse.json(
      { success: true, data: customFields },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'GET /api/custom-fields',
          { orgId: data.orgId, userId: data.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      { error, ...buildLogContext('POST /api/custom-fields', undefined, req) },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const rate = checkRateLimit(
    `${data.orgId}:${getClientIp(req)}:custom-fields:write`,
    60,
    60_000
  )
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  try {
    const payload = await req.json()
    const token = await getSupabaseToken()
    const customField = await createCustomField(data.orgId, payload, token)
    return NextResponse.json(
      { success: true, data: customField },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'POST /api/custom-fields',
          { orgId: data.orgId, userId: data.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
