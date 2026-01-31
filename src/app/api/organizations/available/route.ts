import { NextResponse, type NextRequest } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { logger } from '@/lib/logger'
import { buildLogContext } from '@/lib/logger-context'

export async function GET(req: NextRequest) {
  const authResult = await auth({ acceptsToken: ['session_token'] })
  if (!(authResult.isAuthenticated && authResult.userId)) {
    logger.warn(
      {
        ...buildLogContext('GET /api/organizations/available', undefined, req),
      },
      'Unauthorized request'
    )
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = await clerkClient()
    const organizations = await client.organizations.getOrganizationList({
      limit: 100,
    })

    const data = (organizations.data ?? [])
      .map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        imageUrl: org.imageUrl,
      }))
      .filter(org => org.slug)

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'GET /api/organizations/available',
          { userId: authResult.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
