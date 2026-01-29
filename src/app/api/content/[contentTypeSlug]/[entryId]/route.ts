import { NextResponse, type NextRequest } from 'next/server'
import { checkAuth } from '@/lib/clerk/check-auth'
import {
  updateContentEntry,
  deleteContentEntry,
} from '@/lib/clerk/content-entries-utils'

type RouteParams = {
  params: { contentTypeSlug: string; entryId: string }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const payload = await req.json()
    const entry = await updateContentEntry(
      data.orgId,
      params.contentTypeSlug,
      params.entryId,
      payload
    )
    return NextResponse.json({ success: true, data: entry }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const result = await deleteContentEntry(
      data.orgId,
      params.contentTypeSlug,
      params.entryId
    )
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
