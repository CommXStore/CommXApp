import { NextResponse, type NextRequest } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { entitlements } from '@/lib/entitlements'
import { logger } from '@/lib/logger'
import { buildLogContext } from '@/lib/logger-context'

type EnsureActiveResponse =
  | { action: 'ok' }
  | { action: 'none' }
  | { action: 'switch'; orgId: string; orgName: string }

export async function POST(req: NextRequest) {
  const authResult = await auth({ acceptsToken: ['api_key', 'session_token'] })
  if (!authResult.isAuthenticated || !authResult.userId) {
    return NextResponse.json({ action: 'none' }, { status: 200 })
  }

  const userId = authResult.userId
  const activeOrgId = authResult.orgId
  if (!activeOrgId) {
    return NextResponse.json({ action: 'none' }, { status: 200 })
  }

  try {
    const client = await clerkClient()
    const activeOrg = await client.organizations.getOrganization({
      organizationId: activeOrgId,
    })
    const activeSlug = activeOrg.slug ?? ''
    if (activeSlug) {
      const decision = await entitlements.canJoinOrg(userId, activeSlug)
      if (decision.allowed) {
        return NextResponse.json({ action: 'ok' }, { status: 200 })
      }
    }

    const memberships = await client.users.getOrganizationMembershipList({
      userId,
      limit: 100,
    })

    for (const membership of memberships.data ?? []) {
      const slug = membership.organization.slug ?? ''
      if (!slug) {
        continue
      }
      const decision = await entitlements.canJoinOrg(userId, slug)
      if (decision.allowed) {
        return NextResponse.json(
          {
            action: 'switch',
            orgId: membership.organization.id,
            orgName: membership.organization.name,
          },
          { status: 200 }
        )
      }
    }

    const response: EnsureActiveResponse = { action: 'none' }
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    logger.error(
      {
        err: error,
        ...buildLogContext(
          'POST /api/organizations/ensure-active',
          undefined,
          req
        ),
      },
      'Failed to ensure active org.'
    )
    return NextResponse.json({ action: 'none' }, { status: 200 })
  }
}
