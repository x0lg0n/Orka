-- ============================================================================
-- wallets.sql — multi-wallet support (L0 / wallet-first auth)
--
-- Applied AFTER phase1_schema.sql. The `profiles.stellar_address` column remains
-- as a historical single-address seed, but `wallets` is the canonical,
-- multi-wallet-per-user table. The Edge Function `wallet-login` inserts here.
-- ============================================================================

do $$ begin
  create type public.wallet_network as enum ('mainnet', 'testnet', 'futurenet');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.wallet_type as enum ('freighter', 'walletconnect', 'xbull', 'albedo', 'ledger');
exception when duplicate_object then null; end $$;

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
  -- one (user, network, address) pair only
  constraint wallets_user_network_address_uniq unique (user_id, network, address)
);

create index if not exists wallets_user_id_idx on public.wallets (user_id);

alter table public.wallets enable row level security;

drop policy if exists "wallets_read" on public.wallets;
create policy "wallets_read" on public.wallets
  for select using (user_id = auth.uid());

drop policy if exists "wallets_write" on public.wallets;
create policy "wallets_write" on public.wallets
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ensure exactly one primary wallet per user (best-effort; app enforces too).
create or replace function public.wallets_ensure_single_primary()
returns trigger
language plpgsql
as $$
begin
  if new.is_primary then
    update public.wallets
      set is_primary = false
      where user_id = new.user_id and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists wallets_single_primary on public.wallets;
create trigger wallets_single_primary
  before insert or update on public.wallets
  for each row execute function public.wallets_ensure_single_primary();
