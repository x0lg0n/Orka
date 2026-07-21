-- frontend/supabase/contract_versions.sql
-- Run this in Supabase SQL Editor after project_contracts.sql.
-- Full-snapshot versioning for contracts (mirrors proposal_versions).

create table if not exists public.contract_versions (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.project_contracts(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  version_no int not null,
  blocks jsonb not null,
  markdown text not null default '',
  created_at timestamptz not null default now()
);
alter table public.contract_versions enable row level security;
drop policy if exists "contract_versions_org" on public.contract_versions;
create policy "contract_versions_org" on public.contract_versions
  for all using (public.auth_is_org_member(org_id))
  with check (public.auth_is_org_member(org_id));
