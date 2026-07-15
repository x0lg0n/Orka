-- Workspace Experience (UI-001): add type + logo to organizations and a
-- public storage bucket for workspace logos.

alter table public.organizations
  add column if not exists type text,
  add column if not exists logo_url text;

-- Optional enum-ish guard kept loose (text) so new types can be added without
-- a migration. Values used by the UI: freelancer | agency | studio |
-- consultancy | startup.

-- Public bucket for workspace logos.
insert into storage.buckets (id, name, public)
values ('workspace-logos', 'workspace-logos', true)
on conflict (id) do nothing;

drop policy if exists "workspace_logos_read" on storage.objects;
create policy "workspace_logos_read" on storage.objects
  for select using (bucket_id = 'workspace-logos');

drop policy if exists "workspace_logos_insert" on storage.objects;
create policy "workspace_logos_insert" on storage.objects
  for insert with check (bucket_id = 'workspace-logos' and auth.uid() is not null);
