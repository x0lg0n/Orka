-- frontend/supabase/project_contracts.sql
-- Run in Supabase SQL Editor.

create table if not exists public.project_contracts (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  org_id      uuid not null references public.organizations(id) on delete cascade,
  blocks      jsonb,
  markdown    text not null default '',
  status      text not null default 'draft',
  -- status: draft | agency_signed | client_signed | complete
  agency_sig          text,
  client_sig          text,
  agency_signed_at    timestamptz,
  client_signed_at    timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.project_contracts enable row level security;

drop policy if exists "project_contracts_org" on public.project_contracts;
create policy "project_contracts_org" on public.project_contracts
  for all using (
    public.auth_is_org_member(org_id)
  ) with check (
    public.auth_is_org_member(org_id)
  );

create index if not exists project_contracts_project_id_idx
  on public.project_contracts (project_id);
