create table if not exists payment_providers (
  id text primary key,
  organization_id text not null,
  name text not null,
  type text not null,
  enabled boolean not null default true,
  signing_secret text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payment_providers_org
  on payment_providers (organization_id);

alter table payment_providers enable row level security;

create policy payment_providers_select on payment_providers
  for select to authenticated
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy payment_providers_insert on payment_providers
  for insert to authenticated
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy payment_providers_update on payment_providers
  for update to authenticated
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'))
  with check (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));

create policy payment_providers_delete on payment_providers
  for delete to authenticated
  using (organization_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id'));
