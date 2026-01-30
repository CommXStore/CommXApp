import type { NextRequest } from 'next/server'

type LogContext = {
  route: string
  orgId?: string
  userId?: string | null
  requestId?: string | null
}

export function buildLogContext(
  route: string,
  params?: { orgId?: string; userId?: string | null },
  req?: NextRequest
): LogContext {
  const requestId =
    req?.headers.get('x-request-id') ??
    req?.headers.get('x-correlation-id') ??
    null
  return {
    route,
    orgId: params?.orgId,
    userId: params?.userId ?? null,
    requestId,
  }
}
