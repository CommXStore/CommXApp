import { NextResponse, type NextRequest } from 'next/server'
import { checkAuth } from '@/lib/clerk/check-auth'
import {
  getContentEntries,
  createContentEntry,
} from '@/lib/clerk/content-entries-utils'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'

type RouteParams = {
  params: Promise<{ contentTypeSlug: string }>
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    logger.warn(
      { error, route: 'GET /api/content/[contentTypeSlug]' },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const { contentTypeSlug } = await params
    const token = await getSupabaseToken()
    const result = await getContentEntries(data.orgId, contentTypeSlug, token)
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error({ err, route: 'GET /api/content/[contentTypeSlug]' }, message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    logger.warn(
      { error, route: 'POST /api/content/[contentTypeSlug]' },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const rate = checkRateLimit(
    `${data.orgId}:${getClientIp(req)}:content-entries:write`,
    60,
    60_000
  )
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  try {
    const payload = await req.json()
    const { contentTypeSlug } = await params
    const token = await getSupabaseToken()
    const entry = await createContentEntry(
      data.orgId,
      contentTypeSlug,
      payload,
      token
    )
    return NextResponse.json({ success: true, data: entry }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error({ err, route: 'POST /api/content/[contentTypeSlug]' }, message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
