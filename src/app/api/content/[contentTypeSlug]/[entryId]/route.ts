import { NextResponse, type NextRequest } from 'next/server'
import { checkAuth } from '@/lib/clerk/check-auth'
import {
  getContentEntry,
  updateContentEntry,
  deleteContentEntry,
} from '@/lib/clerk/content-entries-utils'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'
import { buildLogContext } from '@/lib/logger-context'

type RouteParams = {
  params: Promise<{ contentTypeSlug: string; entryId: string }>
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    logger.warn(
      {
        error,
        ...buildLogContext(
          'GET /api/content/[contentTypeSlug]/[entryId]',
          undefined,
          _
        ),
      },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const { contentTypeSlug, entryId } = await params
    const token = await getSupabaseToken()
    const result = await getContentEntry(
      data.orgId,
      contentTypeSlug,
      entryId,
      token
    )
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'GET /api/content/[contentTypeSlug]/[entryId]',
          { orgId: data.orgId, userId: data.userId },
          _
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    logger.warn(
      {
        error,
        ...buildLogContext(
          'PATCH /api/content/[contentTypeSlug]/[entryId]',
          undefined,
          req
        ),
      },
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
    const token = await getSupabaseToken()
    const entry = await updateContentEntry(
      data.orgId,
      contentTypeSlug,
      entryId,
      { input: payload, token }
    )
    return NextResponse.json({ success: true, data: entry }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'PATCH /api/content/[contentTypeSlug]/[entryId]',
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
  const { success, error, data } = await checkAuth()
  if (!success) {
    logger.warn(
      {
        error,
        ...buildLogContext(
          'DELETE /api/content/[contentTypeSlug]/[entryId]',
          undefined,
          req
        ),
      },
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
    const token = await getSupabaseToken()
    const result = await deleteContentEntry(
      data.orgId,
      contentTypeSlug,
      entryId,
      token
    )
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'DELETE /api/content/[contentTypeSlug]/[entryId]',
          { orgId: data.orgId, userId: data.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
