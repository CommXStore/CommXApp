import { NextResponse, type NextRequest } from 'next/server'
import { checkAdmin } from '@/lib/clerk/check-auth'
import { logger } from '@/lib/logger'
import { buildLogContext } from '@/lib/logger-context'
import { getUserEntitlements } from '@/lib/supabase/entitlements-store'

export async function GET(req: NextRequest) {
  const { success, error, data } = await checkAdmin()
  if (!success) {
    logger.warn(
      {
        error,
        ...buildLogContext('GET /api/admin/entitlements', undefined, req),
      },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')?.trim()
  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required.' },
      { status: 400 }
    )
  }

  try {
    const record = await getUserEntitlements(userId)
    return NextResponse.json(
      { success: true, data: record },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'GET /api/admin/entitlements',
          { orgId: data.orgId, userId: data.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
