import { NextResponse, type NextRequest } from 'next/server'
import { checkAuth } from '@/lib/clerk/check-auth'
import {
  getContentEntries,
  createContentEntry,
} from '@/lib/clerk/content-entries-utils'

type RouteParams = {
  params: Promise<{ contentTypeSlug: string }>
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const { contentTypeSlug } = await params
    const result = await getContentEntries(data.orgId, contentTypeSlug)
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const payload = await req.json()
    const { contentTypeSlug } = await params
    const entry = await createContentEntry(
      data.orgId,
      contentTypeSlug,
      payload
    )
    return NextResponse.json({ success: true, data: entry }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
