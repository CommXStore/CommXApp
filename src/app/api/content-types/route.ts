import { NextResponse, type NextRequest } from 'next/server'
import { checkAdmin } from '@/lib/clerk/check-auth'
import {
  getContentTypes,
  createContentType,
} from '@/lib/clerk/content-types-utils'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET() {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      { error, route: 'GET /api/content-types' },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const contentTypes = await getContentTypes(data.orgId)
    return NextResponse.json(
      { success: true, data: contentTypes },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error.'
    logger.error({ err, route: 'GET /api/content-types' }, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      { error, route: 'POST /api/content-types' },
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
    const contentType = await createContentType(data.orgId, payload)
    return NextResponse.json(
      { success: true, data: contentType },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error({ err, route: 'POST /api/content-types' }, message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
