truncate table
  content_snapshots,
  content_entries,
  content_type_fields,
  custom_fields,
  content_types,
  organization_agents,
  user_entitlements
restart identity;

drop policy if exists org_agents_select on organization_agents;
drop policy if exists org_agents_insert on organization_agents;
drop policy if exists org_agents_update on organization_agents;
drop policy if exists org_agents_delete on organization_agents;

drop policy if exists content_types_select on content_types;
drop policy if exists content_types_insert on content_types;
drop policy if exists content_types_update on content_types;
drop policy if exists content_types_delete on content_types;

drop policy if exists custom_fields_select on custom_fields;
drop policy if exists custom_fields_insert on custom_fields;
drop policy if exists custom_fields_update on custom_fields;
drop policy if exists custom_fields_delete on custom_fields;

drop policy if exists content_type_fields_select on content_type_fields;
drop policy if exists content_type_fields_insert on content_type_fields;
drop policy if exists content_type_fields_update on content_type_fields;
drop policy if exists content_type_fields_delete on content_type_fields;

drop policy if exists content_entries_select on content_entries;
drop policy if exists content_entries_insert on content_entries;
drop policy if exists content_entries_update on content_entries;
drop policy if exists content_entries_delete on content_entries;

drop policy if exists content_snapshots_select on content_snapshots;
drop policy if exists content_snapshots_insert on content_snapshots;
drop policy if exists content_snapshots_update on content_snapshots;
drop policy if exists content_snapshots_delete on content_snapshots;

drop policy if exists user_entitlements_select on user_entitlements;
