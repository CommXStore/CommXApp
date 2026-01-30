import { NextResponse, type NextRequest } from 'next/server'
import { checkAdmin } from '@/lib/clerk/check-auth'
import {
  getCustomFields,
  createCustomField,
} from '@/lib/clerk/custom-fields-utils'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'

export async function GET() {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      { error, route: 'GET /api/custom-fields' },
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
    logger.error({ err, route: 'GET /api/custom-fields' }, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      { error, route: 'POST /api/custom-fields' },
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
    logger.error({ err, route: 'POST /api/custom-fields' }, message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
