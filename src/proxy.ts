import { NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/api(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID()
  const headers = new Headers(req.headers)
  headers.set('x-request-id', requestId)

  if (isPublicRoute(req)) {
    return NextResponse.next({
      request: {
        headers,
      },
    })
  }
  const { userId, redirectToSignIn } = await auth()
  if (!userId) {
    return redirectToSignIn()
  }

  return NextResponse.next({
    request: {
      headers,
    },
  })
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
