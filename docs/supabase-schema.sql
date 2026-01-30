create table if not exists organization_agents (
  id text not null,
  organization_id text not null,
  name text not null,
  description text not null,
  model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, id)
);

create table if not exists content_types (
  id text primary key,
  organization_id text not null,
  name text not null,
  slug text not null,
  description text,
  status text not null,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists custom_fields (
  id text primary key,
  organization_id text not null,
  key text not null,
  type text not null,
  label text not null,
  help_text text,
  required boolean not null default false,
  options jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, key)
);

create table if not exists content_type_fields (
  organization_id text not null,
  content_type_id text not null,
  custom_field_id text not null,
  primary key (organization_id, content_type_id, custom_field_id)
);

create table if not exists content_entries (
  id text primary key,
  organization_id text not null,
  content_type_id text not null,
  slug text not null,
  status text not null,
  fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, content_type_id, slug)
);

create table if not exists content_snapshots (
  id bigserial primary key,
  organization_id text not null,
  at timestamptz not null default now(),
  content_types jsonb not null default '[]'::jsonb,
  custom_fields jsonb not null default '[]'::jsonb,
  content_entries jsonb not null default '{}'::jsonb
);

create index if not exists idx_content_types_org on content_types (organization_id);
create index if not exists idx_custom_fields_org on custom_fields (organization_id);
create index if not exists idx_content_entries_org on content_entries (organization_id);
create index if not exists idx_content_entries_type on content_entries (content_type_id);
create index if not exists idx_agents_org on organization_agents (organization_id);

alter table organization_agents enable row level security;
alter table content_types enable row level security;
alter table custom_fields enable row level security;
alter table content_type_fields enable row level security;
alter table content_entries enable row level security;
alter table content_snapshots enable row level security;

create policy org_agents_select on organization_agents to authenticated
  for select
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy org_agents_insert on organization_agents to authenticated
  for insert
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy org_agents_update on organization_agents to authenticated
  for update
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'))
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy org_agents_delete on organization_agents to authenticated
  for delete
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_types_select on content_types to authenticated
  for select
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_types_insert on content_types to authenticated
  for insert
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_types_update on content_types to authenticated
  for update
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'))
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_types_delete on content_types to authenticated
  for delete
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy custom_fields_select on custom_fields to authenticated
  for select
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy custom_fields_insert on custom_fields to authenticated
  for insert
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy custom_fields_update on custom_fields to authenticated
  for update
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'))
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy custom_fields_delete on custom_fields to authenticated
  for delete
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_type_fields_select on content_type_fields to authenticated
  for select
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_type_fields_insert on content_type_fields to authenticated
  for insert
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_type_fields_update on content_type_fields to authenticated
  for update
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'))
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_type_fields_delete on content_type_fields to authenticated
  for delete
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_entries_select on content_entries to authenticated
  for select
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_entries_insert on content_entries to authenticated
  for insert
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_entries_update on content_entries to authenticated
  for update
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'))
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_entries_delete on content_entries to authenticated
  for delete
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_snapshots_select on content_snapshots to authenticated
  for select
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_snapshots_insert on content_snapshots to authenticated
  for insert
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_snapshots_update on content_snapshots to authenticated
  for update
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'))
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy content_snapshots_delete on content_snapshots to authenticated
  for delete
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));
