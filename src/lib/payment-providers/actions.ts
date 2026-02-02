'use server'

import { getSupabaseToken } from '@/lib/supabase/clerk-token'
import type { PaymentProvider } from '@/components/payment-providers/types'

export async function getPaymentProvidersAction(): Promise<PaymentProvider[]> {
  const token = await getSupabaseToken()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return []
  }
  const supabase = await import('@supabase/supabase-js').then(m =>
    m.createClient(supabaseUrl, token)
  )

  const { data, error } = await supabase
    .from('payment_providers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map((item: Record<string, unknown>) => ({
    id: item.id as string,
    name: item.name as string,
    type: item.type as string,
    enabled: item.enabled as boolean,
    metadata: (item.metadata as Record<string, unknown>) ?? {},
  }))
}
