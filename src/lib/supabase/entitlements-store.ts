import { getSupabaseAdmin } from '@/lib/supabase/admin'

export type UserEntitlementsRecord = {
  userId: string
  status: string
  planId: string | null
  planSlug: string | null
  planName: string | null
  features: string[]
  updatedAt: string | null
}

type UpsertUserEntitlementsInput = {
  userId: string
  status: string
  planId?: string | null
  planSlug?: string | null
  planName?: string | null
  features?: string[]
}

export async function upsertUserEntitlements(
  input: UpsertUserEntitlementsInput
): Promise<UserEntitlementsRecord> {
  const payload = {
    user_id: input.userId,
    status: input.status,
    plan_id: input.planId ?? null,
    plan_slug: input.planSlug ?? null,
    plan_name: input.planName ?? null,
    features: input.features ?? [],
    updated_at: new Date().toISOString(),
  }

  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('user_entitlements')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`)
  }

  return {
    userId: data.user_id,
    status: data.status,
    planId: data.plan_id,
    planSlug: data.plan_slug,
    planName: data.plan_name,
    features: Array.isArray(data.features) ? data.features : [],
    updatedAt: data.updated_at ?? null,
  }
}

export async function getUserEntitlements(
  userId: string
): Promise<UserEntitlementsRecord | null> {
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('user_entitlements')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`Supabase fetch failed: ${error.message}`)
  }

  if (!data) {
    return null
  }

  return {
    userId: data.user_id,
    status: data.status,
    planId: data.plan_id,
    planSlug: data.plan_slug,
    planName: data.plan_name,
    features: Array.isArray(data.features) ? data.features : [],
    updatedAt: data.updated_at ?? null,
  }
}
