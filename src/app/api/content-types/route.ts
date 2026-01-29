import { NextResponse, type NextRequest } from 'next/server'
import { checkAuth } from '@/lib/clerk/check-auth'
import { getContentTypes, createContentType } from '@/lib/clerk/content-types-utils'

export async function GET() {
  const { success, error, data } = await checkAuth()
  if (!success) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const contentTypes = await getContentTypes(data.orgId)
  return NextResponse.json({ success: true, data: contentTypes }, { status: 200 })
}

export async function POST(req: NextRequest) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const payload = await req.json()
    const contentType = await createContentType(data.orgId, payload)
    return NextResponse.json(
      { success: true, data: contentType },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
