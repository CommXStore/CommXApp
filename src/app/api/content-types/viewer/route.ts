import { NextResponse } from 'next/server'
import { checkAuth } from '@/lib/clerk/check-auth'
import { getContentTypes } from '@/lib/clerk/content-types-utils'
import { logger } from '@/lib/logger'

export async function GET() {
  const { success, error, data } = await checkAuth()
  if (!success) {
    logger.warn(
      { error, route: 'GET /api/content-types/viewer' },
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
    logger.error({ err, route: 'GET /api/content-types/viewer' }, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
