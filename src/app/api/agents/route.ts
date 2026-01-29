import { NextResponse, type NextRequest } from 'next/server'
import { checkAuth } from '@/lib/clerk/check-auth'
import { getAgents, createAgent, deleteAgent } from '@/lib/clerk/metadata-utils'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET() {
  const { success, error, data } = await checkAuth()
  if (!success) {
    logger.warn({ error, route: 'GET /api/agents' }, 'Unauthorized request')
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const agents = await getAgents(data.orgId)
    return NextResponse.json({ success: true, data: agents }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error.'
    logger.error({ err, route: 'GET /api/agents' }, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { success, error, data } = await checkAuth()

  if (!success) {
    logger.warn({ error, route: 'POST /api/agents' }, 'Unauthorized request')
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
    const agent = await createAgent(data.orgId, payload)
    return NextResponse.json({ success: true, data: agent }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error({ err, route: 'POST /api/agents' }, message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const { success, error, data } = await checkAuth()

  if (!success) {
    logger.warn({ error, route: 'DELETE /api/agents' }, 'Unauthorized request')
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
    const agent = await deleteAgent(data.orgId, agentId)
    return NextResponse.json({ success: true, data: agent }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error({ err, route: 'DELETE /api/agents' }, message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
