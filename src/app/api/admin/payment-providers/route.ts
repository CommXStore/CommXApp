import { NextResponse, type NextRequest } from 'next/server'
import { checkAdmin } from '@/lib/clerk/check-auth'
import { logger } from '@/lib/logger'
import { buildLogContext } from '@/lib/logger-context'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'
import {
  createPaymentProvider,
  listPaymentProviders,
} from '@/lib/supabase/payment-providers'

export async function GET(req: NextRequest) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      {
        error,
        ...buildLogContext('GET /api/admin/payment-providers', undefined, req),
      },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const token = await getSupabaseToken()
    const providers = await listPaymentProviders(data.orgId, token)
    return NextResponse.json({ success: true, data: providers }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'GET /api/admin/payment-providers',
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
      {
        error,
        ...buildLogContext('POST /api/admin/payment-providers', undefined, req),
      },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const payload = (await req.json()) as {
      name?: string
      type?: string
      enabled?: boolean
      signingSecret?: string
      metadata?: Record<string, unknown>
    }
    const name = payload.name?.trim()
    const type = payload.type?.trim()
    const signingSecret = payload.signingSecret?.trim()

    if (!name || !type || !signingSecret) {
      return NextResponse.json(
        { error: 'name, type, and signingSecret are required.' },
        { status: 400 }
      )
    }

    const token = await getSupabaseToken()
    const provider = await createPaymentProvider(
      data.orgId,
      {
        name,
        type,
        enabled: payload.enabled ?? true,
        signingSecret,
        metadata: payload.metadata ?? {},
      },
      token
    )
    return NextResponse.json({ success: true, data: provider }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'POST /api/admin/payment-providers',
          { orgId: data.orgId, userId: data.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
