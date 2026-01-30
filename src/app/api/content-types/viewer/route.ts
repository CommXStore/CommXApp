import { NextResponse, type NextRequest } from 'next/server'
import { checkAuth } from '@/lib/clerk/check-auth'
import { getContentTypes } from '@/lib/clerk/content-types-utils'
import { logger } from '@/lib/logger'
import { getSupabaseToken } from '@/lib/supabase/clerk-token'
import { buildLogContext } from '@/lib/logger-context'

export async function GET(req: NextRequest) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    logger.warn(
      {
        error,
        ...buildLogContext('GET /api/content-types/viewer', undefined, req),
      },
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
          'GET /api/content-types/viewer',
          { orgId: data.orgId, userId: data.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
