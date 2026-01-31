import { NextResponse, type NextRequest } from 'next/server'
import { checkAdmin } from '@/lib/clerk/check-auth'
import { logger } from '@/lib/logger'
import { buildLogContext } from '@/lib/logger-context'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'
import {
  deletePaymentProvider,
  updatePaymentProvider,
} from '@/lib/supabase/payment-providers'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      {
        error,
        ...buildLogContext(
          'PATCH /api/admin/payment-providers/[id]',
          undefined,
          req
        ),
      },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const { id } = await params
  try {
    const payload = (await req.json()) as {
      name?: string
      type?: string
      enabled?: boolean
      signingSecret?: string
      metadata?: Record<string, unknown>
    }

    if (
      payload.name !== undefined &&
      typeof payload.name === 'string' &&
      !payload.name.trim()
    ) {
      return NextResponse.json(
        { error: 'name cannot be empty.' },
        { status: 400 }
      )
    }
    if (
      payload.type !== undefined &&
      typeof payload.type === 'string' &&
      !payload.type.trim()
    ) {
      return NextResponse.json(
        { error: 'type cannot be empty.' },
        { status: 400 }
      )
    }
    if (
      payload.signingSecret !== undefined &&
      typeof payload.signingSecret === 'string' &&
      !payload.signingSecret.trim()
    ) {
      return NextResponse.json(
        { error: 'signingSecret cannot be empty.' },
        { status: 400 }
      )
    }

    const token = await getSupabaseToken()
    const provider = await updatePaymentProvider(data.orgId, id, payload, token)
    return NextResponse.json({ success: true, data: provider }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'PATCH /api/admin/payment-providers/[id]',
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
        ...buildLogContext(
          'DELETE /api/admin/payment-providers/[id]',
          undefined,
          req
        ),
      },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const { id } = await params
  try {
    const token = await getSupabaseToken()
    const result = await deletePaymentProvider(data.orgId, id, token)
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'DELETE /api/admin/payment-providers/[id]',
          { orgId: data.orgId, userId: data.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
