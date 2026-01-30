create table if not exists organization_store (
  organization_id text primary key,
  agents jsonb not null default '[]'::jsonb,
  content_types jsonb not null default '[]'::jsonb,
  custom_fields jsonb not null default '[]'::jsonb,
  content_entries jsonb not null default '{}'::jsonb,
  content_snapshots jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
