import 'server-only'
import { createClient } from '@supabase/supabase-js'

export type Database = {
  public: {
    Tables: {
      user_entitlements: {
        Row: {
          user_id: string
          status: string
          plan_id: string | null
          plan_slug: string | null
          plan_name: string | null
          features: string[]
          updated_at: string | null
        }
        Insert: {
          user_id: string
          status: string
          plan_id?: string | null
          plan_slug?: string | null
          plan_name?: string | null
          features?: string[]
          updated_at?: string | null
        }
        Update: Partial<
          Database['public']['Tables']['user_entitlements']['Insert']
        >
      }
      organization_store: {
        Row: {
          organization_id: string
          agents: unknown
          content_types: unknown
          custom_fields: unknown
          updated_at: string | null
        }
        Insert: {
          organization_id: string
          agents?: unknown
          content_types?: unknown
          custom_fields?: unknown
          updated_at?: string | null
        }
        Update: Partial<
          Database['public']['Tables']['organization_store']['Insert']
        >
      }
    }
  }
}

let cachedAdmin: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (cachedAdmin) {
    return cachedAdmin
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }

  if (!supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY is not set'
    )
  }

  cachedAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return cachedAdmin
}
