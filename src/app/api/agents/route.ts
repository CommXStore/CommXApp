import { NextResponse, type NextRequest } from 'next/server'
import { checkAdmin, checkAuth } from '@/lib/clerk/check-auth'
import { getAgents, createAgent, deleteAgent } from '@/lib/clerk/metadata-utils'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'
import { buildLogContext } from '@/lib/logger-context'

export async function GET(req: NextRequest) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    logger.warn(
      { error, ...buildLogContext('GET /api/agents', undefined, req) },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const token = await getSupabaseToken()
    const agents = await getAgents(data.orgId, token)
    return NextResponse.json({ success: true, data: agents }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'GET /api/agents',
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
      { error, ...buildLogContext('POST /api/agents', undefined, req) },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const rate = checkRateLimit(
    `${data.orgId}:${getClientIp(req)}:agents:write`,
    60,
    60_000
  )
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  try {
    const payload = await req.json()
    const token = await getSupabaseToken()
    const agent = await createAgent(data.orgId, payload, token)
    return NextResponse.json({ success: true, data: agent }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'POST /api/agents',
          { orgId: data.orgId, userId: data.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const { success, error, data } = await checkAdmin()

  if (!success) {
    logger.warn(
      { error, ...buildLogContext('DELETE /api/agents', undefined, req) },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const rate = checkRateLimit(
    `${data.orgId}:${getClientIp(req)}:agents:write`,
    60,
    60_000
  )
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  try {
    const { agentId } = await req.json()
    const token = await getSupabaseToken()
    const agent = await deleteAgent(data.orgId, agentId, token)
    return NextResponse.json({ success: true, data: agent }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'DELETE /api/agents',
          { orgId: data.orgId, userId: data.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
