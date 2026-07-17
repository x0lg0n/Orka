-- ============================================================================
-- ORKA — Migration bridge: old scattered schemas -> canonical orka_schema.sql
-- ============================================================================
-- Apply AFTER the old schemas (phase1_schema.sql, workspace_mvp.sql,
-- wallets.sql, workspace_owner_rls.sql, workspace_type_logo.sql, portal.sql)
-- have already been applied. This adds only what orka_schema.sql introduced
-- that the old files did not create, so existing data is preserved.
--
-- Idempotent: safe to re-run. Old tables/columns are left untouched.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Helpers (re-create; harmless if present)
-- ----------------------------------------------------------------------------
create or replace function public.auth_is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members m
    where m.org_id = org and m.user_id = auth.uid()
  );
$$;

create or replace function public.auth_is_org_owner(org uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return exists (
    select 1 from public.organization_members m
    where m.org_id = org and m.user_id = auth.uid() and m.role = 'owner'
  );
end;
$$;

-- Old phase1_schema.sql defined this with a parameter named "pid"; Postgres
-- refuses to rename parameters via create or replace, so drop the dependent
-- policy + function first, then recreate both.
drop policy if exists "profile_read" on public.profiles;
drop function if exists public.auth_shares_org_with(uuid);
create or replace function public.auth_shares_org_with(profile uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members a
    join public.organization_members b on a.org_id = b.org_id
    where a.user_id = auth.uid() and b.user_id = profile
  );
$$;
drop policy if exists "profile_read" on public.profiles;
create policy "profile_read" on public.profiles for select using (id = auth.uid() or public.auth_shares_org_with(id));
drop policy if exists "profile_update" on public.profiles;
create policy "profile_update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "profile_insert" on public.profiles;
create policy "profile_insert" on public.profiles for insert with check (id = auth.uid());

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 1. Enums (create type if not exists guard)
-- ----------------------------------------------------------------------------
do $$ begin create type public.org_role as enum ('owner','admin','member'); exception when duplicate_object then null; end $$;
do $$ begin create type public.project_status as enum ('draft','active','completed','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.milestone_status as enum ('draft','funded','in_review','released','disputed','refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type public.contract_status as enum ('draft','sent','signed','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.file_review_status as enum ('pending','approved','rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type public.project_member_role as enum ('lead','member'); exception when duplicate_object then null; end $$;
do $$ begin create type public.wallet_network as enum ('mainnet','testnet','futurenet'); exception when duplicate_object then null; end $$;
do $$ begin create type public.wallet_type as enum ('freighter','walletconnect','xbull','albedo','ledger'); exception when duplicate_object then null; end $$;
do $$ begin create type public.custody_mode as enum ('orka','freighter'); exception when duplicate_object then null; end $$;
do $$ begin create type public.dispute_status as enum ('open','resolved','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.invoice_status as enum ('draft','issued','sent','paid','overdue','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.invoice_party_role as enum ('bill_from','bill_to'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_type as enum ('escrow','milestone','invoice','refund'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_status as enum ('completed','pending','failed','released','processing'); exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 2. projects — add columns the old schema did not create
-- ----------------------------------------------------------------------------
alter table public.projects add column if not exists code text;
alter table public.projects add column if not exists client_name text;
alter table public.projects add column if not exists client_email text;
alter table public.projects add column if not exists freelancer_name text;
alter table public.projects add column if not exists freelancer_email text;
alter table public.projects add column if not exists shared_token uuid unique default gen_random_uuid();
alter table public.projects add column if not exists shared_token_expires_at timestamptz;
alter table public.projects add column if not exists metadata jsonb not null default '{}'::jsonb;
 alter table public.projects add column if not exists created_by uuid references auth.users(id) on delete set null;

 -- Clients: extend with metadata + status (additive; safe to re-run).
 alter table public.clients add column if not exists metadata jsonb not null default '{}'::jsonb;
 alter table public.clients add column if not exists status text not null default 'active';


-- Unique code per org (partial index, matches orka_schema.sql).
drop index if exists projects_org_code_idx;
create unique index projects_org_code_idx on public.projects (org_id, code) where code is not null;

-- Ensure updated_at exists + trigger (old projects table may lack it).
alter table public.projects add column if not exists updated_at timestamptz not null default now();
drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects execute function public.touch_updated_at();

-- Re-assert canonical projects RLS policies (idempotent).
alter table public.projects enable row level security;
drop policy if exists "projects_read" on public.projects;
create policy "projects_read" on public.projects for select using (public.auth_is_org_member(org_id));
drop policy if exists "projects_write" on public.projects;
create policy "projects_write" on public.projects for all using (public.auth_is_org_member(org_id)) with check (public.auth_is_org_member(org_id));

-- ----------------------------------------------------------------------------
-- 3. New tables (all missing from old schemas)
-- ----------------------------------------------------------------------------
create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.project_member_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);
alter table public.project_members enable row level security;
drop policy if exists "project_members_read" on public.project_members;
create policy "project_members_read" on public.project_members
  for select using (public.auth_is_org_member((select org_id from public.projects p where p.id = project_id)));
drop policy if exists "project_members_write" on public.project_members;
create policy "project_members_write" on public.project_members
  for all
  using (
    public.auth_is_org_member((select org_id from public.projects p where p.id = project_id))
    and (
      (select role from public.project_members pm where pm.project_id = project_id and pm.user_id = auth.uid()) = 'lead'
      or public.auth_is_org_owner((select org_id from public.projects p where p.id = project_id))
    )
  )
  with check (public.auth_is_org_member((select org_id from public.projects p where p.id = project_id)));

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  proposal_id uuid references public.proposals(id) on delete set null,
  contract_address text,
  client_sig text,
  freelancer_sig text,
  status public.contract_status not null default 'draft',
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.contracts enable row level security;
drop policy if exists "contracts_org" on public.contracts;
create policy "contracts_org" on public.contracts for all using (public.auth_is_org_member(org_id)) with check (public.auth_is_org_member(org_id));
drop trigger if exists contracts_touch on public.contracts;
create trigger contracts_touch before update on public.contracts execute function public.touch_updated_at();

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  name text not null,
  size bigint,
  storage_path text not null,
  review_status public.file_review_status not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.files enable row level security;
drop policy if exists "files_org" on public.files;
create policy "files_org" on public.files for all using (public.auth_is_org_member(org_id)) with check (public.auth_is_org_member(org_id));

create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.activity enable row level security;
drop policy if exists "activity_org" on public.activity;
create policy "activity_org" on public.activity for select using (public.auth_is_org_member(org_id));
drop policy if exists "activity_insert" on public.activity;
create policy "activity_insert" on public.activity for insert with check (public.auth_is_org_member(org_id));

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  qty numeric(18,4) not null default 1,
  rate numeric(38,7) not null default 0,
  amount numeric(38,7) not null default 0
);
alter table public.invoice_items enable row level security;
drop policy if exists "invoice_items_org" on public.invoice_items;
create policy "invoice_items_org" on public.invoice_items
  for all using (public.auth_is_org_member((select org_id from public.invoices i where i.id = invoice_id)))
  with check (public.auth_is_org_member((select org_id from public.invoices i where i.id = invoice_id)));

create table if not exists public.invoice_parties (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  party_role public.invoice_party_role not null,
  name text not null,
  contact_person text,
  email text,
  phone text,
  address text,
  tax_number text
);
alter table public.invoice_parties enable row level security;
drop policy if exists "invoice_parties_org" on public.invoice_parties;
create policy "invoice_parties_org" on public.invoice_parties
  for all using (public.auth_is_org_member((select org_id from public.invoices i where i.id = invoice_id)))
  with check (public.auth_is_org_member((select org_id from public.invoices i where i.id = invoice_id)));

create table if not exists public.invoice_status_history (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  description text,
  created_at timestamptz not null default now()
);
alter table public.invoice_status_history enable row level security;
drop policy if exists "invoice_history_org" on public.invoice_status_history;
create policy "invoice_history_org" on public.invoice_status_history
  for select using (public.auth_is_org_member((select org_id from public.invoices i where i.id = invoice_id)));
drop policy if exists "invoice_history_insert" on public.invoice_status_history;
create policy "invoice_history_insert" on public.invoice_status_history
  for insert with check (public.auth_is_org_member((select org_id from public.invoices i where i.id = invoice_id)));

-- ----------------------------------------------------------------------------
-- 4. milestones — ensure new columns exist (old schema may lack due_date/chain_index)
-- ----------------------------------------------------------------------------
alter table public.ledger_events add column if not exists invoice_id uuid references public.invoices(id) on delete set null;
alter table public.milestones add column if not exists due_date timestamptz;

-- invoices — add columns the old schema lacked (transaction_hash is used by
-- the workspace_payments view; due_date/tax_rate/po_reference match canonical).
alter table public.invoices add column if not exists due_date timestamptz;
alter table public.invoices add column if not exists tax_rate numeric(7,4) not null default 0;
alter table public.invoices add column if not exists po_reference text;
alter table public.invoices add column if not exists transaction_hash text;
alter table public.invoices add column if not exists updated_at timestamptz not null default now();
drop trigger if exists invoices_touch on public.invoices;
create trigger invoices_touch before update on public.invoices execute function public.touch_updated_at();
drop index if exists invoices_org_number_idx;
create unique index invoices_org_number_idx on public.invoices (org_id, invoice_number) where invoice_number is not null;
alter table public.milestones add column if not exists chain_index bigint;
alter table public.milestones add column if not exists updated_at timestamptz not null default now();
drop trigger if exists milestones_touch on public.milestones;
create trigger milestones_touch before update on public.milestones execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 5. escrow_contracts — replace any open policy with org-scoped (idempotent)
-- ----------------------------------------------------------------------------
alter table public.escrow_contracts enable row level security;
drop policy if exists "escrow_contracts_service" on public.escrow_contracts;
drop policy if exists "escrow_contracts_org" on public.escrow_contracts;
create policy "escrow_contracts_org" on public.escrow_contracts
  for all using (public.auth_is_org_member(org_id)) with check (public.auth_is_org_member(org_id));

-- ----------------------------------------------------------------------------
-- 6. Read-only Payments view (recreate; security_invoker enforces RLS)
-- ----------------------------------------------------------------------------
create or replace view public.workspace_payments as
  select
    le.id,
    le.org_id,
    le.project_id,
    le.milestone_id,
    le.invoice_id,
    case le.event_type
      when 'fund' then 'escrow'::public.payment_type
      when 'release' then 'milestone'::public.payment_type
      when 'refund' then 'refund'::public.payment_type
      else 'milestone'::public.payment_type
    end as payment_type,
    coalesce(le.amount, 0) as amount,
    le.asset as currency,
    case le.status
      when 'confirmed' then 'completed'::public.payment_status
      when 'failed' then 'failed'::public.payment_status
      else 'pending'::public.payment_status
    end as status,
    le.chain_tx as tx_hash,
    le.created_at
  from public.ledger_events le
  where le.event_type in ('fund','release','refund')
  union all
  select
    i.id,
    i.org_id,
    i.project_id,
    i.milestone_id,
    i.id as invoice_id,
    'invoice'::public.payment_type as payment_type,
    i.amount,
    i.currency,
    case i.status
      when 'paid' then 'completed'::public.payment_status
      when 'overdue' then 'failed'::public.payment_status
      when 'cancelled' then 'failed'::public.payment_status
      else 'pending'::public.payment_status
    end as status,
    i.transaction_hash as tx_hash,
    coalesce(i.issued_at, i.created_at) as created_at
  from public.invoices i
  where i.status in ('paid','overdue','cancelled');

grant select on public.workspace_payments to authenticated;
alter view public.workspace_payments set (security_invoker = true);

-- ----------------------------------------------------------------------------
-- 7. Portal resolver — recreate richer version (idempotent)
-- ----------------------------------------------------------------------------
create or replace function public.get_portal_project(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'id', p.id,
    'title', p.title,
    'description', p.description,
    'status', p.status,
    'contract_id', p.contract_id,
    'created_at', p.created_at,
    'organization', (select jsonb_build_object('name', o.name) from public.organizations o where o.id = p.org_id),
    'client', (select jsonb_build_object('name', c.name) from public.clients c where c.id = p.client_id),
    'milestones', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id, 'title', m.title, 'amount', m.amount, 'asset', m.asset,
        'status', m.status, 'chain_index', m.chain_index, 'due_date', m.due_date)
      order by coalesce(m.chain_index, 999999), m.created_at)
      from public.milestones m where m.project_id = p.id), '[]'::jsonb),
    'invoices', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id, 'invoice_number', i.invoice_number, 'amount', i.amount,
        'currency', i.currency, 'status', i.status, 'issued_at', i.issued_at)
      order by i.created_at) from public.invoices i where i.project_id = p.id), '[]'::jsonb),
    'proposals', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', pr.id, 'status', pr.status, 'asset', pr.asset,
        'contract_id', pr.contract_id, 'milestones', pr.milestones)
      order by pr.created_at) from public.proposals pr where pr.project_id = p.id), '[]'::jsonb)
  )
  into v_result
  from public.projects p
  where p.shared_token = p_token
    and (p.shared_token_expires_at is null or p.shared_token_expires_at > now());
  return v_result;
end;
$$;
grant execute on function public.get_portal_project(uuid) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 8. Convenience: orgs the current user belongs to
-- ----------------------------------------------------------------------------
create or replace function public.get_my_orgs()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.organization_members where user_id = auth.uid();
$$;
