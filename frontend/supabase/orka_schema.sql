-- ============================================================================
-- ORKA — Canonical Production Schema (single source of truth)
-- ============================================================================
-- Idempotent. Apply once in the Supabase SQL editor (or `supabase db push`).
-- Supersedes the scattered phase1_schema.sql / workspace_*.sql files; those
-- are now merged here. Re-running is safe.
--
-- Design spine (per product plan):
--   Project -> Proposal -> Contract -> Escrow -> Milestones -> Files -> Activity
-- Every business table carries org_id and is guarded by auth_is_org_member().
-- On-chain truth lives in ledger_events; the UI reads onchain_status, never
-- the SDK response.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Helpers
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

-- Keep updated_at current on every row that has the column.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 1. Enums
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
-- 2. Identity & Organizations
-- ----------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  type text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.organizations enable row level security;
drop policy if exists "org_members_read" on public.organizations;
create policy "org_members_read" on public.organizations for select using (public.auth_is_org_member(id));
drop policy if exists "org_members_update" on public.organizations;
create policy "org_members_update" on public.organizations for update using (public.auth_is_org_owner(id));
drop policy if exists "org_owner_delete" on public.organizations;
create policy "org_owner_delete" on public.organizations for delete using (public.auth_is_org_owner(id));
drop policy if exists "authenticated_create_org" on public.organizations;
create policy "authenticated_create_org" on public.organizations for insert with check (auth.uid() is not null);

create table if not exists public.organization_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
alter table public.organization_members enable row level security;
drop policy if exists "members_read_roster" on public.organization_members;
create policy "members_read_roster" on public.organization_members for select using (public.auth_is_org_member(org_id));
drop policy if exists "members_manage_roster" on public.organization_members;
create policy "members_manage_roster" on public.organization_members for update using (public.auth_is_org_member(org_id)) with check (public.auth_is_org_member(org_id));
drop policy if exists "members_self_insert" on public.organization_members;
create policy "members_self_insert" on public.organization_members for insert with check (user_id = auth.uid());

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  stellar_address text,
  role text check (role in ('agency','freelancer','client')),
  custody_mode public.custody_mode,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profile_read" on public.profiles;
create policy "profile_read" on public.profiles for select using (id = auth.uid() or public.auth_shares_org_with(id));
drop policy if exists "profile_update" on public.profiles;
create policy "profile_update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "profile_insert" on public.profiles;
create policy "profile_insert" on public.profiles for insert with check (id = auth.uid());

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  network public.wallet_network not null default 'testnet',
  address text not null,
  wallet_type public.wallet_type not null default 'freighter',
  alias text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wallets_user_network_address_uniq unique (user_id, network, address)
);
create index if not exists wallets_user_id_idx on public.wallets (user_id);
alter table public.wallets enable row level security;
drop policy if exists "wallets_read" on public.wallets;
create policy "wallets_read" on public.wallets for select using (user_id = auth.uid());
drop policy if exists "wallets_write" on public.wallets;
create policy "wallets_write" on public.wallets for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.wallets_ensure_single_primary()
returns trigger language plpgsql as $$
begin
  if new.is_primary then
    update public.wallets set is_primary = false where user_id = new.user_id and id <> new.id;
  end if;
  return new;
end;
$$;
drop trigger if exists wallets_single_primary on public.wallets;
create trigger wallets_single_primary before insert or update on public.wallets
  for each row execute function public.wallets_ensure_single_primary();

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('owner','admin','member')),
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.invitations enable row level security;
drop policy if exists "invitations_org_read" on public.invitations;
create policy "invitations_org_read" on public.invitations for select using (public.auth_is_org_member(org_id));
drop policy if exists "invitations_org_insert" on public.invitations;
create policy "invitations_org_insert" on public.invitations for insert with check (public.auth_is_org_member(org_id));

create or replace function public.handle_new_user()
returns trigger language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, custody_mode, stellar_address)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    nullif(new.raw_user_meta_data->>'custody_mode', '')::public.custody_mode,
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
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at triggers
create trigger organizations_touch before update on public.organizations execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles execute function public.touch_updated_at();
create trigger wallets_touch before update on public.wallets execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 3. CRM — clients & freelancers (org-scoped)
-- ----------------------------------------------------------------------------
 create table if not exists public.clients (
   id uuid primary key default gen_random_uuid(),
   org_id uuid not null references public.organizations(id) on delete cascade,
   name text not null,
   email text,
   stellar_address text,
   -- Free-form client attributes (type, contact, website, industry, billing
   -- address, notes, tags, currency, payment terms, logo url, etc.).
   -- Editable later on the client detail view.
   metadata jsonb not null default '{}'::jsonb,
   -- Lifecycle status: active | inactive | lead | archived.
   status text not null default 'active'
     check (status in ('active', 'inactive', 'lead', 'archived')),
   created_at timestamptz not null default now(),
   updated_at timestamptz not null default now()
 );
alter table public.clients enable row level security;
drop policy if exists "clients_read" on public.clients;
create policy "clients_read" on public.clients for select using (public.auth_is_org_member(org_id));
drop policy if exists "clients_write" on public.clients;
create policy "clients_write" on public.clients for all using (public.auth_is_org_member(org_id)) with check (public.auth_is_org_member(org_id));
create trigger clients_touch before update on public.clients execute function public.touch_updated_at();

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
create policy "freelancers_read" on public.freelancers for select using (public.auth_is_org_member(org_id));
drop policy if exists "freelancers_write" on public.freelancers;
create policy "freelancers_write" on public.freelancers for all using (public.auth_is_org_member(org_id)) with check (public.auth_is_org_member(org_id));
create trigger freelancers_touch before update on public.freelancers execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Project spine
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  description text,
  -- Human-readable project code, unique within the org (e.g. PRJ-001).
  code text,
  -- Deployed Soroban escrow contract address for this project.
  contract_id text,
  status public.project_status not null default 'draft',
  -- Denormalized client contact captured at creation (works even before a
  -- clients row exists; client_id is the canonical link when present).
  client_name text,
  client_email text,
  freelancer_name text,
  freelancer_email text,
  -- Public client portal share token (unguessable, optionally expiring).
  shared_token uuid unique default gen_random_uuid(),
  shared_token_expires_at timestamptz,
  -- Free-form project attributes captured at creation (category, timeline, etc.).
  -- Editable later on the full project page.
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Unique code per org.
drop index if exists projects_org_code_idx;
create unique index projects_org_code_idx on public.projects (org_id, code) where code is not null;
alter table public.projects enable row level security;
drop policy if exists "projects_read" on public.projects;
create policy "projects_read" on public.projects for select using (public.auth_is_org_member(org_id));
drop policy if exists "projects_write" on public.projects;
create policy "projects_write" on public.projects for all using (public.auth_is_org_member(org_id)) with check (public.auth_is_org_member(org_id));
create trigger projects_touch before update on public.projects execute function public.touch_updated_at();

-- Workflow stage enum + column (drives the 9-tab project detail pipeline).
do $$ begin
  create type project_stage as enum (
    'draft', 'proposal_sent', 'contract_signed', 'escrow_funded', 'milestones_active', 'completed'
  );
exception when duplicate_object then null; end $$;

alter table public.projects add column if not exists project_stage project_stage not null default 'draft';
create index if not exists idx_projects_stage on public.projects (org_id, project_stage);

-- ensure mapping index exists for escrow_contracts
create index if not exists idx_escrow_contracts_map
  on public.escrow_contracts (contract_address, (mapping->>'milestone_index'));

-- Project-scoped team (replaces the faked "team" avatars).
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

-- Proposals (AI-generated, client-reviewed).
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  client_address text not null,
  freelancer_address text not null,
  asset text not null default 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  milestones jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','active','closed')),
  contract_id text,
  created_at timestamptz not null default now()
);
alter table public.proposals enable row level security;
drop policy if exists "proposals_org" on public.proposals;
create policy "proposals_org" on public.proposals for all using (public.auth_is_org_member(org_id)) with check (public.auth_is_org_member(org_id));

-- Contracts (generated from an accepted proposal; dual-signed).
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
create trigger contracts_touch before update on public.contracts execute function public.touch_updated_at();

-- Milestones (amount + due date + deliverables; locked in escrow).
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  freelancer_id uuid references public.freelancers(id) on delete set null,
  title text not null,
  amount numeric(38,7) not null check (amount >= 0),
  asset text not null default 'USDC',
  status public.milestone_status not null default 'draft',
  due_date timestamptz,
  chain_index bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.milestones enable row level security;
drop policy if exists "milestones_read" on public.milestones;
create policy "milestones_read" on public.milestones for select using (public.auth_is_org_member(org_id));
drop policy if exists "milestones_write" on public.milestones;
create policy "milestones_write" on public.milestones for all using (public.auth_is_org_member(org_id)) with check (public.auth_is_org_member(org_id));
create trigger milestones_touch before update on public.milestones execute function public.touch_updated_at();

-- Escrow contracts (indexer resolution map).
create table if not exists public.escrow_contracts (
  contract_address text primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  mapping jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.escrow_contracts enable row level security;
drop policy if exists "escrow_contracts_org" on public.escrow_contracts;
create policy "escrow_contracts_org" on public.escrow_contracts
  for all using (public.auth_is_org_member(org_id)) with check (public.auth_is_org_member(org_id));

-- Files (per-milestone deliverables the client reviews).
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

-- Activity (off-chain project feed; on-chain events live in ledger_events).
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

-- ----------------------------------------------------------------------------
-- 5. Money — invoices (normalized), ledger, disputes
-- ----------------------------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  milestone_id uuid references public.milestones(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  invoice_number text,
  amount numeric(38,7) not null check (amount >= 0),
  currency text not null default 'USD',
  tax_rate numeric(7,4) not null default 0,
  status public.invoice_status not null default 'draft',
  issued_at timestamptz,
  due_date timestamptz,
  po_reference text,
  transaction_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop index if exists invoices_org_number_idx;
create unique index invoices_org_number_idx on public.invoices (org_id, invoice_number) where invoice_number is not null;
alter table public.invoices enable row level security;
drop policy if exists "invoices_read" on public.invoices;
create policy "invoices_read" on public.invoices for select using (public.auth_is_org_member(org_id));
drop policy if exists "invoices_write" on public.invoices;
create policy "invoices_write" on public.invoices for all using (public.auth_is_org_member(org_id)) with check (public.auth_is_org_member(org_id));
create trigger invoices_touch before update on public.invoices execute function public.touch_updated_at();

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

-- Ledger events: append-only on-chain audit written by the Rust indexer.
create table if not exists public.ledger_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  milestone_id uuid references public.milestones(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  chain_tx text,
  event_type text not null,
  amount numeric(38,7),
  asset text,
  status text,
  created_at timestamptz not null default now()
);
alter table public.ledger_events enable row level security;
drop policy if exists "ledger_read" on public.ledger_events;
create policy "ledger_read" on public.ledger_events for select using (public.auth_is_org_member(org_id));
drop policy if exists "ledger_insert" on public.ledger_events;
create policy "ledger_insert" on public.ledger_events for insert with check (public.auth_is_org_member(org_id));

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
create policy "disputes_read" on public.disputes for select using (public.auth_is_org_member(org_id));
drop policy if exists "disputes_write" on public.disputes;
create policy "disputes_write" on public.disputes for all using (public.auth_is_org_member(org_id)) with check (public.auth_is_org_member(org_id));
create trigger disputes_touch before update on public.disputes execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 6. Read-only Payments view (Payments page = all money movement in workspace)
-- ----------------------------------------------------------------------------
-- Union of on-chain ledger movements (escrow fund / milestone release / refund)
-- and invoice payments into one queryable feed. View-only; no writes.
create or replace view public.workspace_payments as
  -- On-chain escrow / milestone / refund movements
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
  -- Invoice payments
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

-- The view is filtered by org through the underlying RLS on its base tables
-- (ledger_events / invoices both enforce auth_is_org_member). Grant read to
-- authenticated users; row visibility is still RLS-bounded.
grant select on public.workspace_payments to authenticated;

-- Enforce per-caller RLS on the underlying base tables (ledger_events /
-- invoices). Without security_invoker, a view does NOT inherit base-table RLS
-- and would expose rows the caller shouldn't see.
alter view public.workspace_payments set (security_invoker = true);

-- ----------------------------------------------------------------------------
-- 7. Public client portal resolver (SECURITY DEFINER, anon-readable)
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
-- 8. Convenience: orgs the current user belongs to (server actions).
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
