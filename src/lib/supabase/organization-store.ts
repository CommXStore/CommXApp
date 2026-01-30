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

const AGENTS_TABLE = 'organization_agents'
const CONTENT_TYPES_TABLE = 'content_types'
const CUSTOM_FIELDS_TABLE = 'custom_fields'
const CONTENT_TYPE_FIELDS_TABLE = 'content_type_fields'
const CONTENT_ENTRIES_TABLE = 'content_entries'
const CONTENT_SNAPSHOTS_TABLE = 'content_snapshots'

type ContentTypeRow = {
  id: string
  organization_id: string
  name: string
  slug: string
  description: string | null
  status: ContentType['status']
  icon: string | null
  created_at: string
  updated_at: string
}

type CustomFieldRow = {
  id: string
  organization_id: string
  key: string
  type: CustomField['type']
  label: string
  help_text: string | null
  required: boolean
  options: CustomField['options'] | null
  created_at: string
  updated_at: string
}

type ContentTypeFieldRow = {
  organization_id: string
  content_type_id: string
  custom_field_id: string
}

type ContentEntryRow = {
  id: string
  organization_id: string
  content_type_id: string
  slug: string
  status: ContentEntry['status']
  fields: ContentEntry['fields']
  created_at: string
  updated_at: string
}

type AgentRow = {
  id: string
  organization_id: string
  name: string
  description: string
  model: string
  created_at: string
  updated_at: string
}

type ContentSnapshotRow = {
  id: number
  organization_id: string
  at: string
  content_types: unknown
  custom_fields: unknown
  content_entries: unknown
}

export type OrganizationStore = {
  organizationId: string
  agents: Agent[]
  contentTypes: ContentType[]
  customFields: CustomField[]
  contentEntries: Record<string, ContentEntry[]>
  contentSnapshots: ReturnType<typeof parseSnapshots>
}

export type OrganizationStoreUpdate = Partial<{
  agents: Agent[]
  contentTypes: ContentType[]
  customFields: CustomField[]
  contentEntries: Record<string, ContentEntry[]>
  contentSnapshots: ReturnType<typeof parseSnapshots>
}>

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

function sanitizeForSupabase<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function mapContentTypes(
  rows: ContentTypeRow[],
  relationRows: ContentTypeFieldRow[]
): ContentType[] {
  const fieldsByType = new Map<string, string[]>()
  for (const relation of relationRows) {
    const list = fieldsByType.get(relation.content_type_id) ?? []
    list.push(relation.custom_field_id)
    fieldsByType.set(relation.content_type_id, list)
  }
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    status: row.status,
    icon: row.icon ?? undefined,
    fields: fieldsByType.get(row.id) ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

function mapCustomFields(
  rows: CustomFieldRow[],
  relationRows: ContentTypeFieldRow[]
): CustomField[] {
  const attachedByField = new Map<string, string[]>()
  for (const relation of relationRows) {
    const list = attachedByField.get(relation.custom_field_id) ?? []
    list.push(relation.content_type_id)
    attachedByField.set(relation.custom_field_id, list)
  }
  return rows.map(row => ({
    id: row.id,
    key: row.key,
    type: row.type,
    label: row.label,
    helpText: row.help_text ?? undefined,
    required: row.required,
    options: row.options ?? undefined,
    attachedTo: attachedByField.get(row.id) ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

function mapContentEntries(rows: ContentEntryRow[]) {
  return rows.reduce<Record<string, ContentEntry[]>>((acc, row) => {
    const list = acc[row.content_type_id] ?? []
    list.push({
      id: row.id,
      contentTypeId: row.content_type_id,
      slug: row.slug,
      status: row.status,
      fields: row.fields,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })
    acc[row.content_type_id] = list
    return acc
  }, {})
}

function mapAgents(rows: AgentRow[]): Agent[] {
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    model: row.model,
  }))
}

function mapSnapshots(rows: ContentSnapshotRow[]) {
  return parseSnapshots(
    rows.map(row => ({
      at: row.at,
      contentTypes: row.content_types,
      customFields: row.custom_fields,
      contentEntries: row.content_entries,
    }))
  )
}

async function deleteByOrg(table: string, organizationId: string) {
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('organization_id', organizationId)
  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`)
  }
}

async function upsertRows(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return
  }
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from(table).upsert(rows)
  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`)
  }
}

async function insertRows(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return
  }
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from(table).insert(rows)
  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`)
  }
}

async function fetchNormalizedStore(organizationId: string) {
  const supabase = await getSupabaseServerClient()
  const [
    agentsRes,
    contentTypesRes,
    customFieldsRes,
    relationsRes,
    entriesRes,
    snapshotsRes,
  ] = await Promise.all([
    supabase
      .from(AGENTS_TABLE)
      .select('*')
      .eq('organization_id', organizationId),
    supabase
      .from(CONTENT_TYPES_TABLE)
      .select('*')
      .eq('organization_id', organizationId),
    supabase
      .from(CUSTOM_FIELDS_TABLE)
      .select('*')
      .eq('organization_id', organizationId),
    supabase
      .from(CONTENT_TYPE_FIELDS_TABLE)
      .select('*')
      .eq('organization_id', organizationId),
    supabase
      .from(CONTENT_ENTRIES_TABLE)
      .select('*')
      .eq('organization_id', organizationId),
    supabase
      .from(CONTENT_SNAPSHOTS_TABLE)
      .select('*')
      .eq('organization_id', organizationId)
      .order('at', { ascending: false })
      .limit(MAX_SNAPSHOTS),
  ])

  const responses = [
    agentsRes,
    contentTypesRes,
    customFieldsRes,
    relationsRes,
    entriesRes,
    snapshotsRes,
  ]
  for (const response of responses) {
    if (response.error) {
      throw new Error(`Supabase read failed: ${response.error.message}`)
    }
  }

  return {
    agents: (agentsRes.data ?? []) as AgentRow[],
    contentTypes: (contentTypesRes.data ?? []) as ContentTypeRow[],
    customFields: (customFieldsRes.data ?? []) as CustomFieldRow[],
    relations: (relationsRes.data ?? []) as ContentTypeFieldRow[],
    entries: (entriesRes.data ?? []) as ContentEntryRow[],
    snapshots: (snapshotsRes.data ?? []) as ContentSnapshotRow[],
  }
}

async function upsertStoreData(
  organizationId: string,
  store: OrganizationStore
) {
  const now = nowIso()
  const contentTypeRows: ContentTypeRow[] = store.contentTypes.map(item => ({
    id: item.id,
    organization_id: organizationId,
    name: item.name,
    slug: item.slug,
    description: item.description ?? null,
    status: item.status,
    icon: item.icon ?? null,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  }))

  const customFieldRows: CustomFieldRow[] = store.customFields.map(item => ({
    id: item.id,
    organization_id: organizationId,
    key: item.key,
    type: item.type,
    label: item.label,
    help_text: item.helpText ?? null,
    required: item.required,
    options: item.options ?? null,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  }))

  const relationRows: ContentTypeFieldRow[] = store.contentTypes.flatMap(type =>
    type.fields.map(fieldId => ({
      organization_id: organizationId,
      content_type_id: type.id,
      custom_field_id: fieldId,
    }))
  )

  const entryRows: ContentEntryRow[] = Object.values(
    store.contentEntries
  ).flatMap(list =>
    list.map(entry => ({
      id: entry.id,
      organization_id: organizationId,
      content_type_id: entry.contentTypeId,
      slug: entry.slug,
      status: entry.status,
      fields: sanitizeForSupabase(entry.fields),
      created_at: entry.createdAt,
      updated_at: entry.updatedAt,
    }))
  )

  const snapshotRows = store.contentSnapshots.map(snapshot => ({
    organization_id: organizationId,
    at: snapshot.at,
    content_types: sanitizeForSupabase(snapshot.contentTypes),
    custom_fields: sanitizeForSupabase(snapshot.customFields),
    content_entries: sanitizeForSupabase(snapshot.contentEntries),
  }))

  const agentRows: AgentRow[] = store.agents.map(agent => ({
    id: agent.id,
    organization_id: organizationId,
    name: agent.name,
    description: agent.description,
    model: agent.model,
    created_at: now,
    updated_at: now,
  }))

  await upsertRows(CONTENT_TYPES_TABLE, contentTypeRows)
  await upsertRows(CUSTOM_FIELDS_TABLE, customFieldRows)
  await deleteByOrg(CONTENT_TYPE_FIELDS_TABLE, organizationId)
  await insertRows(CONTENT_TYPE_FIELDS_TABLE, relationRows)
  await deleteByOrg(CONTENT_ENTRIES_TABLE, organizationId)
  await insertRows(CONTENT_ENTRIES_TABLE, entryRows)
  await deleteByOrg(CONTENT_SNAPSHOTS_TABLE, organizationId)
  await insertRows(CONTENT_SNAPSHOTS_TABLE, snapshotRows)
  await deleteByOrg(AGENTS_TABLE, organizationId)
  await insertRows(AGENTS_TABLE, agentRows)
}

async function migrateFromClerk(organizationId: string) {
  const clerk = await clerkClient()
  const org = await clerk.organizations.getOrganization({ organizationId })
  const publicMetadata = org.publicMetadata ?? {}

  const store: OrganizationStore = {
    organizationId,
    agents: parseAgents(publicMetadata.agents),
    contentTypes: parseContentTypes(publicMetadata.contentTypes),
    customFields: parseCustomFields(publicMetadata.customFields),
    contentEntries: parseContentEntries(publicMetadata.contentEntries),
    contentSnapshots: parseSnapshots(publicMetadata.contentSnapshots),
  }

  await upsertStoreData(organizationId, store)

  return store
}

export async function getOrganizationStore(
  organizationId: string
): Promise<OrganizationStore> {
  const normalized = await fetchNormalizedStore(organizationId)
  const hasData =
    normalized.agents.length > 0 ||
    normalized.contentTypes.length > 0 ||
    normalized.customFields.length > 0 ||
    normalized.entries.length > 0 ||
    normalized.snapshots.length > 0

  if (!hasData) {
    return migrateFromClerk(organizationId)
  }

  return {
    organizationId,
    agents: mapAgents(normalized.agents),
    contentTypes: mapContentTypes(
      normalized.contentTypes,
      normalized.relations
    ),
    customFields: mapCustomFields(
      normalized.customFields,
      normalized.relations
    ),
    contentEntries: mapContentEntries(normalized.entries),
    contentSnapshots: mapSnapshots(normalized.snapshots),
  }
}

export async function updateOrganizationStore(
  organizationId: string,
  update: OrganizationStoreUpdate
) {
  await getOrganizationStore(organizationId)

  if (update.contentTypes || update.customFields || update.contentEntries) {
    const merged = await getOrganizationStore(organizationId)
    const store: OrganizationStore = {
      organizationId,
      agents: update.agents ?? merged.agents,
      contentTypes: update.contentTypes ?? merged.contentTypes,
      customFields: update.customFields ?? merged.customFields,
      contentEntries: update.contentEntries ?? merged.contentEntries,
      contentSnapshots: update.contentSnapshots ?? merged.contentSnapshots,
    }
    await upsertStoreData(organizationId, store)
    return
  }

  if (update.agents) {
    await deleteByOrg(AGENTS_TABLE, organizationId)
    await insertRows(
      AGENTS_TABLE,
      update.agents.map(agent => ({
        id: agent.id,
        organization_id: organizationId,
        name: agent.name,
        description: agent.description,
        model: agent.model,
        created_at: nowIso(),
        updated_at: nowIso(),
      }))
    )
  }

  if (update.contentSnapshots) {
    await deleteByOrg(CONTENT_SNAPSHOTS_TABLE, organizationId)
    await insertRows(
      CONTENT_SNAPSHOTS_TABLE,
      update.contentSnapshots.map(snapshot => ({
        organization_id: organizationId,
        at: snapshot.at,
        content_types: sanitizeForSupabase(snapshot.contentTypes),
        custom_fields: sanitizeForSupabase(snapshot.customFields),
        content_entries: sanitizeForSupabase(snapshot.contentEntries),
      }))
    )
  }
}
