import { NextResponse, type NextRequest } from 'next/server'
import { checkAdmin } from '@/lib/clerk/check-auth'
import {
  getContentTypes,
  createContentType,
} from '@/lib/clerk/content-types-utils'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'
import { buildLogContext } from '@/lib/logger-context'

export async function GET(req: NextRequest) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      { error, ...buildLogContext('GET /api/content-types', undefined, req) },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const token = await getSupabaseToken()
    const contentTypes = await getContentTypes(data.orgId, token)
    return NextResponse.json(
      { success: true, data: contentTypes },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'GET /api/content-types',
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
      { error, ...buildLogContext('POST /api/content-types', undefined, req) },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

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
    const contentType = await createContentType(data.orgId, payload, token)
    return NextResponse.json(
      { success: true, data: contentType },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'POST /api/content-types',
          { orgId: data.orgId, userId: data.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
