-- frontend/supabase/project_proposals.sql
-- Run this in Supabase SQL Editor to create the proposal tables.

-- Main proposal record
create table if not exists public.project_proposals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null default 'Proposal',
  amount numeric(38,7) not null default 0,
  currency text not null default 'XLM',
  usd_equivalent numeric(38,7),
  summary text,
  content text,
  status text not null default 'draft'
    check (status in ('draft','sent','viewed','accepted','rejected','expired','archived')),
  valid_until timestamptz,
  accepted_at timestamptz,
  payment_terms text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.project_proposals enable row level security;
drop policy if exists "project_proposals_org" on public.project_proposals;
create policy "project_proposals_org" on public.project_proposals
  for all using (public.auth_is_org_member(org_id))
  with check (public.auth_is_org_member(org_id));
create trigger project_proposals_touch before update on public.project_proposals
  execute function public.touch_updated_at();

-- Proposal sections (ordered body content)
create table if not exists public.proposal_sections (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.project_proposals(id) on delete cascade,
  title text not null,
  content text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.proposal_sections enable row level security;
drop policy if exists "proposal_sections_org" on public.proposal_sections;
create policy "proposal_sections_org" on public.proposal_sections
  for all using (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  ) with check (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  );

-- Proposal pricing line items
create table if not exists public.proposal_pricing (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.project_proposals(id) on delete cascade,
  label text not null,
  amount numeric(38,7) not null default 0,
  currency text not null default 'XLM',
  category text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.proposal_pricing enable row level security;
drop policy if exists "proposal_pricing_org" on public.proposal_pricing;
create policy "proposal_pricing_org" on public.proposal_pricing
  for all using (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  ) with check (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  );

-- Proposal internal notes
create table if not exists public.proposal_notes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.project_proposals(id) on delete cascade,
  content text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.proposal_notes enable row level security;
drop policy if exists "proposal_notes_org" on public.proposal_notes;
create policy "proposal_notes_org" on public.proposal_notes
  for all using (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  ) with check (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  );

-- Proposal activity log
create table if not exists public.proposal_activity (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.project_proposals(id) on delete cascade,
  type text not null,
  payload jsonb default '{}'::jsonb,
  actor_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.proposal_activity enable row level security;
drop policy if exists "proposal_activity_org" on public.proposal_activity;
create policy "proposal_activity_org" on public.proposal_activity
  for all using (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  ) with check (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  );

-- BlockNote JSON source of truth + generated markdown + agency tags.
alter table public.project_proposals
  add column if not exists blocks jsonb,
  add column if not exists markdown text not null default '',
  add column if not exists tags text[] not null default '{}';

-- Signature columns (mirrors project_contracts).
alter table public.project_proposals add column if not exists agency_sig text;
alter table public.project_proposals add column if not exists client_sig text;
alter table public.project_proposals add column if not exists agency_signed_at timestamptz;
alter table public.project_proposals add column if not exists client_signed_at timestamptz;
