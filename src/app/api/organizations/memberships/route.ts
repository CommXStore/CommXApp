import { NextResponse, type NextRequest } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { buildLogContext } from '@/lib/logger-context'
import { entitlements } from '@/lib/entitlements'

type CreateOrganizationMemberPayload = {
  email?: string
  organizationId?: string
  joinAsCurrentUser?: boolean
  firstName?: string
  lastName?: string
  username?: string
  password?: string
  publicMetadata?: Record<string, unknown>
  privateMetadata?: Record<string, unknown>
  unsafeMetadata?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  const authResult = await auth({ acceptsToken: ['api_key', 'session_token'] })
  if (!authResult.isAuthenticated) {
    logger.warn(
      {
        ...buildLogContext(
          'POST /api/organizations/memberships',
          undefined,
          req
        ),
      },
      'Unauthorized request'
    )
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let logOrgId: string | undefined
  try {
    const payload = (await req.json()) as CreateOrganizationMemberPayload
    const organizationId = authResult.orgId ?? payload.organizationId
    logOrgId = organizationId
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization is required.' },
        { status: 400 }
      )
    }

    if (
      payload.organizationId &&
      authResult.orgId &&
      payload.organizationId !== authResult.orgId
    ) {
      return NextResponse.json(
        { error: 'Organization mismatch.' },
        { status: 403 }
      )
    }

    const rate = checkRateLimit(
      `${organizationId}:${getClientIp(req)}:organizations:memberships:write`,
      30,
      60_000
    )
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }

    const email = payload.email?.trim()
    if (!payload.joinAsCurrentUser && !email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const client = await clerkClient()
    const org = await client.organizations.getOrganization({
      organizationId,
    })
    const orgSlug = org.slug ?? ''
    if (!orgSlug) {
      return NextResponse.json(
        { error: 'Organization slug is missing.' },
        { status: 400 }
      )
    }

    const decision = await entitlements.canJoinOrg(
      authResult.userId ?? '',
      orgSlug
    )
    if (!decision.allowed) {
      return NextResponse.json({ error: decision.reason }, { status: 403 })
    }

    if (payload.joinAsCurrentUser) {
      const userId = authResult.userId
      if (!userId) {
        return NextResponse.json({ error: 'User is required.' }, { status: 400 })
      }
      if (payload.firstName || payload.lastName) {
        await client.users.updateUser(userId, {
          firstName: payload.firstName,
          lastName: payload.lastName,
        })
      }
      const membership = await client.organizations.createOrganizationMembership(
        {
          organizationId,
          userId,
          role: 'org:member',
        }
      )

      return NextResponse.json(
        {
          success: true,
          data: {
            userId,
            membershipId: membership.id,
          },
        },
        { status: 201 }
      )
    }

    const user = await client.users.createUser({
      emailAddress: [email],
      firstName: payload.firstName,
      lastName: payload.lastName,
      username: payload.username,
      password: payload.password,
      publicMetadata: payload.publicMetadata,
      privateMetadata: payload.privateMetadata,
      unsafeMetadata: payload.unsafeMetadata,
    })

    const membership = await client.organizations.createOrganizationMembership({
      organizationId,
      userId: user.id,
      role: 'org:member',
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: user.id,
          membershipId: membership.id,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    logger.error(
      {
        err,
        ...buildLogContext(
          'POST /api/organizations/memberships',
          { orgId: logOrgId, userId: authResult.userId },
          req
        ),
      },
      message
    )
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
