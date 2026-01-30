import { NextResponse, type NextRequest } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { checkAuth } from '@/lib/clerk/check-auth'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

type CreateOrganizationMemberPayload = {
  email: string
  organizationId?: string
  firstName?: string
  lastName?: string
  username?: string
  password?: string
  publicMetadata?: Record<string, unknown>
  privateMetadata?: Record<string, unknown>
  unsafeMetadata?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    logger.warn(
      { error, route: 'POST /api/organizations/memberships' },
      'Unauthorized request'
    )
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const rate = checkRateLimit(
    `${data.orgId}:${getClientIp(req)}:organizations:memberships:write`,
    30,
    60_000
  )
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  try {
    const payload = (await req.json()) as CreateOrganizationMemberPayload
    const email = payload.email?.trim()
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    if (payload.organizationId && payload.organizationId !== data.orgId) {
      return NextResponse.json(
        { error: 'Organization mismatch.' },
        { status: 403 }
      )
    }

    const client = await clerkClient()
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
      organizationId: data.orgId,
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
    logger.error({ err, route: 'POST /api/organizations/memberships' }, message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
