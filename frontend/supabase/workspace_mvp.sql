-- ---------- Workspace MVP additions (idempotent) ----------

-- The base schema's projects table references clients/freelancers by id but
-- has no human-readable contact fields. Add lightweight text columns so the
-- demo can capture client/freelancer name + email without requiring those
-- rows to exist first.
alter table public.projects
  add column if not exists client_name text,
  add column if not exists client_email text,
  add column if not exists freelancer_name text,
  add column if not exists freelancer_email text;

-- Pending invitations (recorded; acceptance handled in-app by inserting
-- an organization_members row). For the demo we do NOT send real email.
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'member'
    check (role in ('owner','admin','member')),
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.invitations enable row level security;

drop policy if exists "invitations_org_read" on public.invitations;
create policy "invitations_org_read" on public.invitations
  for select using (public.auth_is_org_member(org_id));

drop policy if exists "invitations_org_insert" on public.invitations;
create policy "invitations_org_insert" on public.invitations
  for insert with check (public.auth_is_org_member(org_id));

-- Convenience: orgs the current user belongs to (used by server actions).
create or replace function public.get_my_orgs()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.organization_members where user_id = auth.uid();
$$;
