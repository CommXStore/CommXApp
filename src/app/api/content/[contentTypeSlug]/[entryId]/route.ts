import { NextResponse, type NextRequest } from 'next/server'
import { checkAuth } from '@/lib/clerk/check-auth'
import {
  updateContentEntry,
  deleteContentEntry,
} from '@/lib/clerk/content-entries-utils'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

type RouteParams = {
  params: Promise<{ contentTypeSlug: string; entryId: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    logger.warn(
      { error, route: 'PATCH /api/content/[contentTypeSlug]/[entryId]' },
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
    const { contentTypeSlug, entryId } = await params
    const entry = await updateContentEntry(
      data.orgId,
      contentTypeSlug,
      entryId,
      payload
    )
    return NextResponse.json({ success: true, data: entry }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      { err, route: 'PATCH /api/content/[contentTypeSlug]/[entryId]' },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    logger.warn(
      { error, route: 'DELETE /api/content/[contentTypeSlug]/[entryId]' },
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
    const { contentTypeSlug, entryId } = await params
    const result = await deleteContentEntry(
      data.orgId,
      contentTypeSlug,
      entryId
    )
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      { err, route: 'DELETE /api/content/[contentTypeSlug]/[entryId]' },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
