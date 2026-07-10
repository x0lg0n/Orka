-- ============================================================
-- ORKA Phase1.1 — Core workspace data model (Supabase Postgres)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- Re-runnable and idempotent: tables/policies/types are dropped-or-skipped
-- so you can run it as many times as needed.
--
-- Design rules (from ROADMAP.md §Guiding Principles):
--   * Every business table carries org_id and is RLS-scoped to workspace
--     membership (not just the waitlist table).
--   * profiles is keyed to auth.users; adds stellar_address + custody_mode.
--   * projects.contract_id stores the deployed Soroban contract address.
--   * ledger_events is the immutable audit trail of chain actions.
-- ============================================================

-- ---------- 1.1.0 RLS helpers ----------
-- Returns true if the current auth user belongs to the given org.
-- SECURITY DEFINER so RLS on the members table does not recurse.
create or replace function public.auth_is_org_member(org uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return exists (
    select 1 from public.organization_members m
    where m.org_id = org
      and m.user_id = auth.uid()
  );
end;
$$;

-- Returns true if the current user shares any org with profile `pid`.
-- Lets workspace teammates read each other's profiles without exposing all.
create or replace function public.auth_shares_org_with(pid uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return exists (
    select 1 from public.organization_members a
    join public.organization_members b on a.org_id = b.org_id
    where a.user_id = auth.uid()
      and b.user_id = pid
  );
end;
$$;

-- ---------- 1.1.1 organizations ----------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

drop policy if exists "org_members_read" on public.organizations;
create policy "org_members_read" on public.organizations
  for select using (public.auth_is_org_member(id));

drop policy if exists "org_members_update" on public.organizations;
create policy "org_members_update" on public.organizations
  for update using (public.auth_is_org_member(id));

drop policy if exists "authenticated_create_org" on public.organizations;
create policy "authenticated_create_org" on public.organizations
  for insert with check (auth.role() = 'authenticated');

-- ---------- 1.1.2 organization_members ----------
do $$ begin
  create type public.org_role as enum ('owner', 'admin', 'member');
exception when duplicate_object then null; end $$;

create table if not exists public.organization_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

alter table public.organization_members enable row level security;

drop policy if exists "members_read_roster" on public.organization_members;
create policy "members_read_roster" on public.organization_members
  for select using (public.auth_is_org_member(org_id));

drop policy if exists "members_manage_roster" on public.organization_members;
create policy "members_manage_roster" on public.organization_members
  for update using (public.auth_is_org_member(org_id))
  with check (public.auth_is_org_member(org_id));

-- Bootstrap: any authenticated user may add themselves as a member
-- (so the first owner can be created). Subsequent edits are org-scoped above.
drop policy if exists "members_self_insert" on public.organization_members;
create policy "members_self_insert" on public.organization_members
  for insert with check (user_id = auth.uid());

-- ---------- 1.1.3 profiles ----------
do $$ begin
  create type public.custody_mode as enum ('orka', 'freighter');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  stellar_address text,
  -- Set ONCE at signup: 'orka' (Mode A, ORKA-managed KMS key) or
  -- 'freighter' (Mode B, self-custody). A user is never both.
  custody_mode public.custody_mode,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profile_read" on public.profiles;
create policy "profile_read" on public.profiles
  for select using (id = auth.uid() or public.auth_shares_org_with(id));

drop policy if exists "profile_update" on public.profiles;
create policy "profile_update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profile_insert" on public.profiles;
create policy "profile_insert" on public.profiles
  for insert with check (id = auth.uid());

-- ---------- 1.1.4 clients ----------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  email text,
  stellar_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;

drop policy if exists "clients_read" on public.clients;
create policy "clients_read" on public.clients
  for select using (public.auth_is_org_member(org_id));

drop policy if exists "clients_write" on public.clients;
create policy "clients_write" on public.clients
  for all
  using (public.auth_is_org_member(org_id))
  with check (public.auth_is_org_member(org_id));

-- ---------- 1.1.5 freelancers ----------
create table if not exists public.freelancers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  email text,
  stellar_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.freelancers enable row level security;

drop policy if exists "freelancers_read" on public.freelancers;
create policy "freelancers_read" on public.freelancers
  for select using (public.auth_is_org_member(org_id));

drop policy if exists "freelancers_write" on public.freelancers;
create policy "freelancers_write" on public.freelancers
  for all
  using (public.auth_is_org_member(org_id))
  with check (public.auth_is_org_member(org_id));

-- ---------- 1.1.6 projects ----------
do $$ begin
  create type public.project_status as enum ('draft', 'active', 'completed', 'archived');
exception when duplicate_object then null; end $$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  description text,
  -- Deployed Soroban escrow contract address for this project.
  contract_id text,
  status public.project_status not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

drop policy if exists "projects_read" on public.projects;
create policy "projects_read" on public.projects
  for select using (public.auth_is_org_member(org_id));

drop policy if exists "projects_write" on public.projects;
create policy "projects_write" on public.projects
  for all
  using (public.auth_is_org_member(org_id))
  with check (public.auth_is_org_member(org_id));

-- ---------- 1.1.7 milestones ----------
do $$ begin
  create type public.milestone_status as enum
    ('draft', 'funded', 'in_review', 'released', 'disputed', 'refunded');
exception when duplicate_object then null; end $$;

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  freelancer_id uuid references public.freelancers(id) on delete set null,
  title text not null,
  amount numeric(38,7) not null check (amount >= 0),
  asset text not null default 'USDC',
  status public.milestone_status not null default 'draft',
  -- Index of this milestone inside the Soroban contract's milestones map.
  chain_index bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.milestones enable row level security;

drop policy if exists "milestones_read" on public.milestones;
create policy "milestones_read" on public.milestones
  for select using (public.auth_is_org_member(org_id));

drop policy if exists "milestones_write" on public.milestones;
create policy "milestones_write" on public.milestones
  for all
  using (public.auth_is_org_member(org_id))
  with check (public.auth_is_org_member(org_id));

-- ---------- 1.1.8 invoices ----------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  milestone_id uuid references public.milestones(id) on delete set null,
  invoice_number text,
  amount numeric(38,7) not null check (amount >= 0),
  currency text not null default 'USD',
  status text not null default 'draft', -- draft | issued | paid
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invoices enable row level security;

drop policy if exists "invoices_read" on public.invoices;
create policy "invoices_read" on public.invoices
  for select using (public.auth_is_org_member(org_id));

drop policy if exists "invoices_write" on public.invoices;
create policy "invoices_write" on public.invoices
  for all
  using (public.auth_is_org_member(org_id))
  with check (public.auth_is_org_member(org_id));

-- ---------- 1.1.9 ledger_events (audit trail) ----------
create table if not exists public.ledger_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  milestone_id uuid references public.milestones(id) on delete set null,
  chain_tx text,                 -- on-chain tx hash
  event_type text not null,      -- fund | submit | approve | release | refund | dispute | resolve
  amount numeric(38,7),
  asset text,
  status text,
  created_at timestamptz not null default now()
);

alter table public.ledger_events enable row level security;

drop policy if exists "ledger_read" on public.ledger_events;
create policy "ledger_read" on public.ledger_events
  for select using (public.auth_is_org_member(org_id));

-- Audit trail is append-mostly; allow workspace members to insert,
-- but never update/delete a recorded event.
drop policy if exists "ledger_insert" on public.ledger_events;
create policy "ledger_insert" on public.ledger_events
  for insert with check (public.auth_is_org_member(org_id));

-- ---------- 1.1.10 disputes ----------
do $$ begin
  create type public.dispute_status as enum ('open', 'resolved', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  opened_by uuid references auth.users(id) on delete set null,
  reason text,
  split_bp int check (split_bp between 0 and 10000),
  status public.dispute_status not null default 'open',
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.disputes enable row level security;

drop policy if exists "disputes_read" on public.disputes;
create policy "disputes_read" on public.disputes
  for select using (public.auth_is_org_member(org_id));

drop policy if exists "disputes_write" on public.disputes;
create policy "disputes_write" on public.disputes
  for all
  using (public.auth_is_org_member(org_id))
  with check (public.auth_is_org_member(org_id));

-- ---------- 1.1.11 auto-create profile on new auth user ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 1.1.3b capture the signup role on profiles ----------
alter table public.profiles
  add column if not exists role text
    check (role in ('agency','freelancer','client'));

-- ---------- 1.1.11b copy the full signup metadata into profiles ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, custody_mode, stellar_address)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'custody_mode',
    new.raw_user_meta_data->>'stellar_address'
  )
  on conflict (id) do update set
    full_name      = coalesce(excluded.full_name, profiles.full_name),
    role           = coalesce(excluded.role, profiles.role),
    custody_mode   = coalesce(excluded.custody_mode, profiles.custody_mode),
    stellar_address = coalesce(excluded.stellar_address, profiles.stellar_address);
  return new;
end;
$$;
