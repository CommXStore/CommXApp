import { NextResponse, type NextRequest } from 'next/server'
import { checkAdmin } from '@/lib/clerk/check-auth'
import {
  deleteContentType,
  updateContentType,
} from '@/lib/clerk/content-types-utils'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'
import { buildLogContext } from '@/lib/logger-context'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      {
        error,
        ...buildLogContext('PATCH /api/content-types/[id]', undefined, req),
      },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const { id } = await params

  const rate = checkRateLimit(
    `${data.orgId}:${getClientIp(req)}:content-types:write`,
    60,
    60_000
  )
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  try {
    const payload = await req.json()
    const token = await getSupabaseToken()
    const contentType = await updateContentType(data.orgId, id, payload, token)
    return NextResponse.json(
      { success: true, data: contentType },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'PATCH /api/content-types/[id]',
          { orgId: data.orgId, userId: data.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      {
        error,
        ...buildLogContext('DELETE /api/content-types/[id]', undefined, req),
      },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const { id } = await params

  const rate = checkRateLimit(
    `${data.orgId}:${getClientIp(req)}:content-types:write`,
    60,
    60_000
  )
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  try {
    const token = await getSupabaseToken()
    const result = await deleteContentType(data.orgId, id, token)
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'DELETE /api/content-types/[id]',
          { orgId: data.orgId, userId: data.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
