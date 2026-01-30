import { NextResponse, type NextRequest } from 'next/server'
import { checkAdmin } from '@/lib/clerk/check-auth'
import {
  deleteCustomField,
  updateCustomField,
} from '@/lib/clerk/custom-fields-utils'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      { error, route: 'PATCH /api/custom-fields/[id]' },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const { id } = await params

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
    const customField = await updateCustomField(data.orgId, id, payload, token)
    return NextResponse.json(
      { success: true, data: customField },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error({ err, route: 'PATCH /api/custom-fields/[id]' }, message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      { error, route: 'DELETE /api/custom-fields/[id]' },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const { id } = await params

  const rate = checkRateLimit(
    `${data.orgId}:${getClientIp(req)}:custom-fields:write`,
    60,
    60_000
  )
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  try {
    const token = await getSupabaseToken()
    const result = await deleteCustomField(data.orgId, id, token)
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error({ err, route: 'DELETE /api/custom-fields/[id]' }, message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
