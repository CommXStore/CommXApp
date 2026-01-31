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

type AuthResult = Awaited<ReturnType<typeof auth>>

function unauthorizedResponse(req: NextRequest) {
  logger.warn(
    {
      ...buildLogContext('POST /api/organizations/memberships', undefined, req),
    },
    'Unauthorized request'
  )
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function tooManyRequestsResponse() {
  return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
}

function invalidOrganizationResponse() {
  return NextResponse.json(
    { error: 'Organization is required.' },
    { status: 400 }
  )
}

function mismatchOrganizationResponse() {
  return NextResponse.json({ error: 'Organization mismatch.' }, { status: 403 })
}

function missingEmailResponse() {
  return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
}

function missingUserResponse() {
  return NextResponse.json({ error: 'User is required.' }, { status: 400 })
}

async function createMembershipForUser(
  client: Awaited<ReturnType<typeof clerkClient>>,
  organizationId: string,
  userId: string,
  payload: CreateOrganizationMemberPayload
) {
  if (payload.firstName || payload.lastName) {
    await client.users.updateUser(userId, {
      firstName: payload.firstName,
      lastName: payload.lastName,
    })
  }
  const membership = await client.organizations.createOrganizationMembership({
    organizationId,
    userId,
    role: 'org:member',
  })

  return { userId, membershipId: membership.id }
}

async function createMembershipForNewUser(
  client: Awaited<ReturnType<typeof clerkClient>>,
  organizationId: string,
  email: string,
  payload: CreateOrganizationMemberPayload
) {
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

  return { userId: user.id, membershipId: membership.id }
}

function getOrganizationId(
  authResult: AuthResult,
  payload: CreateOrganizationMemberPayload
) {
  if (
    payload.organizationId &&
    authResult.orgId &&
    payload.organizationId !== authResult.orgId
  ) {
    if (payload.joinAsCurrentUser) {
      return { orgId: payload.organizationId, mismatch: false }
    }
    return { orgId: null, mismatch: true }
  }
  const orgId = authResult.orgId ?? payload.organizationId
  return { orgId, mismatch: false }
}

async function parsePayload(req: NextRequest) {
  return (await req.json()) as CreateOrganizationMemberPayload
}

function validateOrganization(
  authResult: AuthResult,
  payload: CreateOrganizationMemberPayload
) {
  const { orgId: organizationId, mismatch } = getOrganizationId(
    authResult,
    payload
  )
  if (mismatch) {
    return { organizationId: null, response: mismatchOrganizationResponse() }
  }
  if (!organizationId) {
    return { organizationId: null, response: invalidOrganizationResponse() }
  }
  return { organizationId, response: null }
}

function validateRate(organizationId: string, req: NextRequest) {
  const rate = checkRateLimit(
    `${organizationId}:${getClientIp(req)}:organizations:memberships:write`,
    30,
    60_000
  )
  if (!rate.allowed) {
    return tooManyRequestsResponse()
  }
  return null
}

function validateEmailRequirement(
  payload: CreateOrganizationMemberPayload,
  email: string | undefined
) {
  if (!(payload.joinAsCurrentUser || email)) {
    return missingEmailResponse()
  }
  return null
}

async function resolveOrgSlug(
  client: Awaited<ReturnType<typeof clerkClient>>,
  organizationId: string
) {
  const org = await client.organizations.getOrganization({
    organizationId,
  })
  const orgSlug = org.slug ?? ''
  if (!orgSlug) {
    return {
      orgSlug: null,
      response: NextResponse.json(
        { error: 'Organization slug is missing.' },
        { status: 400 }
      ),
    }
  }
  return { orgSlug, response: null }
}

async function validateEntitlements(
  authResult: AuthResult,
  orgSlug: string,
  req: NextRequest
) {
  try {
    const decision = await entitlements.canJoinOrg(
      authResult.userId ?? '',
      orgSlug
    )
    if (!decision.allowed) {
      return NextResponse.json({ error: decision.reason }, { status: 403 })
    }
    return null
  } catch (error) {
    logger.error(
      {
        err: error,
        ...buildLogContext(
          'POST /api/organizations/memberships',
          { orgSlug, userId: authResult.userId },
          req
        ),
      },
      'Entitlements check failed.'
    )
    return NextResponse.json(
      { error: 'Subscription check unavailable. Please try again later.' },
      { status: 503 }
    )
  }
}

type MembershipDataOptions = {
  client: Awaited<ReturnType<typeof clerkClient>>
  organizationId: string
  payload: CreateOrganizationMemberPayload
  authResult: AuthResult
  email: string | undefined
}

async function createMembershipData({
  client,
  organizationId,
  payload,
  authResult,
  email,
}: MembershipDataOptions) {
  if (payload.joinAsCurrentUser) {
    if (!authResult.userId) {
      return { data: null, response: missingUserResponse() }
    }
    const data = await createMembershipForUser(
      client,
      organizationId,
      authResult.userId,
      payload
    )
    return { data, response: null }
  }

  const data = await createMembershipForNewUser(
    client,
    organizationId,
    email ?? '',
    payload
  )
  return { data, response: null }
}

async function handleCreateMembership(
  req: NextRequest,
  authResult: AuthResult
) {
  let logOrgId: string | undefined
  try {
    const payload = await parsePayload(req)
    const { organizationId, response: orgResponse } = validateOrganization(
      authResult,
      payload
    )
    if (orgResponse) {
      return orgResponse
    }
    logOrgId = organizationId
    if (!organizationId) {
      return invalidOrganizationResponse()
    }

    const rateResponse = validateRate(organizationId, req)
    if (rateResponse) {
      return rateResponse
    }

    const email = payload.email?.trim()
    const emailResponse = validateEmailRequirement(payload, email)
    if (emailResponse) {
      return emailResponse
    }

    const client = await clerkClient()
    const { orgSlug, response: slugResponse } = await resolveOrgSlug(
      client,
      organizationId
    )
    if (slugResponse) {
      return slugResponse
    }
    if (!orgSlug) {
      return NextResponse.json(
        { error: 'Organization slug is missing.' },
        { status: 400 }
      )
    }

    const entitlementResponse = await validateEntitlements(
      authResult,
      orgSlug,
      req
    )
    if (entitlementResponse) {
      return entitlementResponse
    }

    const { data, response: membershipResponse } = await createMembershipData({
      client,
      organizationId,
      payload,
      authResult,
      email,
    })
    if (membershipResponse) {
      return membershipResponse
    }
    if (!data) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: data.userId,
          membershipId: data.membershipId,
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

export async function POST(req: NextRequest) {
  const authResult = await auth({ acceptsToken: ['api_key', 'session_token'] })
  if (!authResult.isAuthenticated) {
    return unauthorizedResponse(req)
  }

  return handleCreateMembership(req, authResult)
}
