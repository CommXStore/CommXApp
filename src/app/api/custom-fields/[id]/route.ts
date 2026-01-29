import { NextResponse, type NextRequest } from 'next/server'
import { checkAuth } from '@/lib/clerk/check-auth'
import {
  deleteCustomField,
  updateCustomField,
} from '@/lib/clerk/custom-fields-utils'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { success, error, data } = await checkAuth()
  if (!success) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  const { id } = await params

  try {
    const payload = await req.json()
    const customField = await updateCustomField(data.orgId, id, payload)
    return NextResponse.json(
      { success: true, data: customField },
      { status: 200 }
    )
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

  const { id } = await params

  try {
    const result = await deleteCustomField(data.orgId, id)
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
