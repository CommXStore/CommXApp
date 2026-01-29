import { NextResponse, type NextRequest } from 'next/server'
import { checkAuth } from '@/lib/clerk/check-auth'
import { getCustomFields, createCustomField } from '@/lib/clerk/custom-fields-utils'

export async function GET() {
  const { success, error, data } = await checkAuth()
  if (!success) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const customFields = await getCustomFields(data.orgId)
  return NextResponse.json({ success: true, data: customFields }, { status: 200 })
}

export async function POST(req: NextRequest) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  try {
    const payload = await req.json()
    const customField = await createCustomField(data.orgId, payload)
    return NextResponse.json(
      { success: true, data: customField },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
