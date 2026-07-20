-- Run this in Supabase SQL Editor to create the notes table

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- RLS policies
alter table public.notes enable row level security;

create policy "Org members can view notes"
  on public.notes for select
  using (public.auth_is_org_member(org_id));

create policy "Org members can insert notes"
  on public.notes for insert
  with check (public.auth_is_org_member(org_id));

create policy "Org members can update notes"
  on public.notes for update
  using (public.auth_is_org_member(org_id));

create policy "Org owners can delete notes"
  on public.notes for delete
  using (public.auth_is_org_owner(org_id));

-- Index for project-scoped queries
create index if not exists idx_notes_project_id on public.notes(project_id);
create index if not exists idx_notes_org_id on public.notes(org_id);
