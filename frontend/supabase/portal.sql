-- Phase D: public client portal (/p/[token])
--
-- The portal is addressed by a random, unguessable token rather than the
-- internal project UUID, and is readable by unauthenticated visitors. The
-- read path is a SECURITY DEFINER function granted to the anon role, so it
-- bypasses the org-membership RLS policies without exposing a service key.

-- 1. Share token columns on projects.
alter table public.projects
  add column if not exists shared_token uuid unique default gen_random_uuid(),
  add column if not exists shared_token_expires_at timestamptz;

-- 2. Read-only resolver callable by anonymous visitors.
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
    'organization', (
      select jsonb_build_object('name', o.name)
      from public.organizations o where o.id = p.org_id
    ),
    'client', (
      select jsonb_build_object('name', c.name)
      from public.clients c where c.id = p.client_id
    ),
    'milestones', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id,
        'title', m.title,
        'amount', m.amount,
        'asset', m.asset,
        'status', m.status,
        'chain_index', m.chain_index
      ) order by coalesce(m.chain_index, 999999), m.created_at)
      from public.milestones m where m.project_id = p.id
    ), '[]'::jsonb),
    'invoices', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id,
        'invoice_number', i.invoice_number,
        'amount', i.amount,
        'currency', i.currency,
        'status', i.status,
        'issued_at', i.issued_at
      ) order by i.created_at)
      from public.invoices i where i.project_id = p.id
    ), '[]'::jsonb),
    'proposals', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', pr.id,
        'status', pr.status,
        'asset', pr.asset,
        'contract_id', pr.contract_id,
        'milestones', pr.milestones
      ) order by pr.created_at)
      from public.proposals pr where pr.project_id = p.id
    ), '[]'::jsonb),
    'contract_address', (
      select ec.contract_address
      from public.escrow_contracts ec where ec.project_id = p.id
      limit 1
    ),
    'custody_mode', coalesce((
      select prof.custody_mode::text
      from public.profiles prof where prof.org_id = p.org_id and prof.custody_mode is not null
      limit 1
    ), 'orka')
  )
  into v_result
  from public.projects p
  where p.shared_token = p_token
    and (p.shared_token_expires_at is null or p.shared_token_expires_at > now());

  return v_result; -- null when token is missing, invalid, or expired
end;
$$;

grant execute on function public.get_portal_project(uuid) to anon, authenticated;
