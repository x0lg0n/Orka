-- Owner-only enforcement for organizations (edit + delete).
-- Run in Supabase SQL Editor. Idempotent.

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
    where m.org_id = org
      and m.user_id = auth.uid()
      and m.role = 'owner'
  );
end;
$$;

-- Tighten UPDATE to owners only (was any member via auth_is_org_member).
drop policy if exists "org_members_update" on public.organizations;
create policy "org_members_update" on public.organizations
  for update using (public.auth_is_org_owner(id));

-- Add owner-only DELETE (no delete policy exists today, so delete is denied by RLS).
drop policy if exists "org_owner_delete" on public.organizations;
create policy "org_owner_delete" on public.organizations
  for delete using (public.auth_is_org_owner(id));
