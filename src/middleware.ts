import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const headers = new Headers(request.headers)
  headers.set('x-request-id', requestId)

  return NextResponse.next({
    request: {
      headers,
    },
  })
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
}
