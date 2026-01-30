import { clerkClient } from '@clerk/nextjs/server'
import { nowIso } from '@/lib/content-utils'
import { agentSchema, type Agent } from '@/lib/agents/schema'
import {
  parseContentEntries,
  parseContentTypes,
  parseCustomFields,
  type ContentEntry,
  type ContentType,
  type CustomField,
} from '@/lib/clerk/content-schemas'
import { MAX_SNAPSHOTS, parseSnapshots } from '@/lib/content-snapshots'
import { getSupabaseServerClient } from './server'

const STORE_TABLE = 'organization_store'

type OrganizationStoreRow = {
  organization_id: string
  agents: unknown
  content_types: unknown
  custom_fields: unknown
  content_entries: unknown
  content_snapshots: unknown
  created_at: string
  updated_at: string
}

export type OrganizationStore = {
  organizationId: string
  agents: Agent[]
  contentTypes: ContentType[]
  customFields: CustomField[]
  contentEntries: Record<string, ContentEntry[]>
  contentSnapshots: ReturnType<typeof parseSnapshots>
  createdAt: string
  updatedAt: string
}

export type OrganizationStoreUpdate = Partial<{
  agents: Agent[]
  contentTypes: ContentType[]
  customFields: CustomField[]
  contentEntries: Record<string, ContentEntry[]>
  contentSnapshots: ReturnType<typeof parseSnapshots>
}>

function sanitizeForSupabase<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function mapRowToStore(row: OrganizationStoreRow): OrganizationStore {
  return {
    organizationId: row.organization_id,
    agents: parseAgents(row.agents),
    contentTypes: parseContentTypes(row.content_types),
    customFields: parseCustomFields(row.custom_fields),
    contentEntries: parseContentEntries(row.content_entries),
    contentSnapshots: parseSnapshots(row.content_snapshots),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function parseAgents(value: unknown): Agent[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map(item => {
      const parsed = agentSchema.safeParse(item)
      return parsed.success ? parsed.data : null
    })
    .filter((item): item is Agent => Boolean(item))
}

async function insertStore(
  row: Omit<OrganizationStoreRow, 'created_at' | 'updated_at'>
) {
  const supabase = getSupabaseServerClient()
  const timestamp = nowIso()
  const payload = {
    ...row,
    created_at: timestamp,
    updated_at: timestamp,
  }
  const { error } = await supabase.from(STORE_TABLE).insert(payload)
  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`)
  }
}

async function fetchStoreRow(organizationId: string) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from(STORE_TABLE)
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle()
  if (error) {
    throw new Error(`Supabase read failed: ${error.message}`)
  }
  return data as OrganizationStoreRow | null
}

async function migrateFromClerk(organizationId: string) {
  const clerk = await clerkClient()
  const org = await clerk.organizations.getOrganization({ organizationId })
  const publicMetadata = org.publicMetadata ?? {}

  const agents = parseAgents(publicMetadata.agents)
  const contentTypes = parseContentTypes(publicMetadata.contentTypes)
  const customFields = parseCustomFields(publicMetadata.customFields)
  const contentEntries = parseContentEntries(publicMetadata.contentEntries)
  const contentSnapshots = parseSnapshots(publicMetadata.contentSnapshots)

  await insertStore({
    organization_id: organizationId,
    agents: sanitizeForSupabase(agents),
    content_types: sanitizeForSupabase(contentTypes),
    custom_fields: sanitizeForSupabase(customFields),
    content_entries: sanitizeForSupabase(contentEntries),
    content_snapshots: sanitizeForSupabase(contentSnapshots),
  })

  return {
    organizationId,
    agents,
    contentTypes,
    customFields,
    contentEntries,
    contentSnapshots,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

export async function getOrganizationStore(
  organizationId: string
): Promise<OrganizationStore> {
  const row = await fetchStoreRow(organizationId)
  if (row) {
    return mapRowToStore(row)
  }

  return migrateFromClerk(organizationId)
}

export async function updateOrganizationStore(
  organizationId: string,
  update: OrganizationStoreUpdate
) {
  await getOrganizationStore(organizationId)

  const supabase = getSupabaseServerClient()
  const payload: Record<string, unknown> = {
    updated_at: nowIso(),
  }

  if (update.agents) {
    payload.agents = sanitizeForSupabase(update.agents)
  }
  if (update.contentTypes) {
    payload.content_types = sanitizeForSupabase(update.contentTypes)
  }
  if (update.customFields) {
    payload.custom_fields = sanitizeForSupabase(update.customFields)
  }
  if (update.contentEntries) {
    payload.content_entries = sanitizeForSupabase(update.contentEntries)
  }
  if (update.contentSnapshots) {
    payload.content_snapshots = sanitizeForSupabase(
      update.contentSnapshots
    ).slice(0, MAX_SNAPSHOTS)
  }

  const { error } = await supabase
    .from(STORE_TABLE)
    .update(payload)
    .eq('organization_id', organizationId)

  if (error) {
    throw new Error(`Supabase update failed: ${error.message}`)
  }
}
