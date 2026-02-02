import { nanoid } from 'nanoid'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export type PaymentProvider = {
  id: string
  name: string
  type: string
  enabled: boolean
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type PaymentProviderCreateInput = {
  name: string
  type: string
  enabled?: boolean
  metadata?: Record<string, unknown>
  signingSecret: string
}

export type PaymentProviderUpdateInput = Partial<
  Omit<PaymentProviderCreateInput, 'signingSecret'>
> & {
  signingSecret?: string
}

type PaymentProviderRow = {
  id: string
  organization_id: string
  name: string
  type: string
  enabled: boolean
  metadata: Record<string, unknown> | null
  signing_secret?: string | null
  created_at: string
  updated_at: string
}

function toProvider(row: PaymentProviderRow): PaymentProvider {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    enabled: row.enabled,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listPaymentProviders(
  organizationId: string,
  token: string
): Promise<PaymentProvider[]> {
  const supabase = await getSupabaseServerClient(token)
  const { data, error } = await supabase
    .from('payment_providers')
    .select(
      'id, organization_id, name, type, enabled, metadata, created_at, updated_at'
    )
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Supabase fetch failed: ${error.message}`)
  }

  return (data ?? []).map(row => toProvider(row as PaymentProviderRow))
}

export async function createPaymentProvider(
  organizationId: string,
  input: PaymentProviderCreateInput,
  token: string
): Promise<PaymentProvider> {
  const supabase = await getSupabaseServerClient(token)
  const now = new Date().toISOString()
  const payload = {
    id: `pp_${nanoid()}`,
    organization_id: organizationId,
    name: input.name,
    type: input.type,
    enabled: input.enabled ?? true,
    metadata: input.metadata ?? {},
    signing_secret: input.signingSecret,
    created_at: now,
    updated_at: now,
  }

  const { data, error } = await supabase
    .from('payment_providers')
    .insert(payload)
    .select(
      'id, organization_id, name, type, enabled, metadata, created_at, updated_at'
    )
    .single()

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`)
  }

  return toProvider(data as PaymentProviderRow)
}

export async function updatePaymentProvider(
  organizationId: string,
  providerId: string,
  input: PaymentProviderUpdateInput,
  token: string
): Promise<PaymentProvider> {
  const supabase = await getSupabaseServerClient(token)
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.name !== undefined) {
    payload.name = input.name
  }
  if (input.type !== undefined) {
    payload.type = input.type
  }
  if (input.enabled !== undefined) {
    payload.enabled = input.enabled
  }
  if (input.metadata !== undefined) {
    payload.metadata = input.metadata
  }
  if (input.signingSecret !== undefined) {
    payload.signing_secret = input.signingSecret
  }

  const { data, error } = await supabase
    .from('payment_providers')
    .update(payload)
    .eq('organization_id', organizationId)
    .eq('id', providerId)
    .select(
      'id, organization_id, name, type, enabled, metadata, created_at, updated_at'
    )
    .single()

  if (error) {
    throw new Error(`Supabase update failed: ${error.message}`)
  }

  return toProvider(data as PaymentProviderRow)
}

export async function deletePaymentProvider(
  organizationId: string,
  providerId: string,
  token: string
): Promise<{ success: true }> {
  const supabase = await getSupabaseServerClient(token)
  const { error } = await supabase
    .from('payment_providers')
    .delete()
    .eq('organization_id', organizationId)
    .eq('id', providerId)

  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`)
  }

  return { success: true }
}

export async function getPaymentProviderForWebhook(providerId: string) {
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('payment_providers')
    .select(
      'id, organization_id, name, type, enabled, metadata, signing_secret'
    )
    .eq('id', providerId)
    .maybeSingle()

  if (error) {
    throw new Error(`Supabase fetch failed: ${error.message}`)
  }

  if (!data) {
    return null
  }

  return data as PaymentProviderRow
}
