-- frontend/supabase/proposal_versions.sql
-- Run in Supabase SQL Editor AFTER project_proposals.sql.

create table if not exists public.proposal_versions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.project_proposals(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  version_no int not null,
  title text not null default 'Proposal',
  blocks jsonb not null,
  markdown text not null default '',
  summary text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.proposal_versions enable row level security;
drop policy if exists "proposal_versions_org" on public.proposal_versions;
create policy "proposal_versions_org" on public.proposal_versions
  for all using (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  ) with check (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  );
create index if not exists proposal_versions_proposal_id_idx
  on public.proposal_versions (proposal_id, version_no desc);
