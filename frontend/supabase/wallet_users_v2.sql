-- ============================================================================
-- wallet_users_v2.sql — Standalone wallet + email auth for auth-v2
--
-- Completely separate from auth.users and public.wallets.
-- Run this in Supabase SQL Editor before using auth-v2 routes.
-- ============================================================================

create table if not exists public.wallet_users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Prevent duplicate wallet registrations
create unique index if not exists wallet_users_wallet_address_idx
  on public.wallet_users (wallet_address);

-- Prevent duplicate emails
create unique index if not exists wallet_users_email_idx
  on public.wallet_users (email);

-- Auto-update updated_at
create or replace function public.wallet_users_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists wallet_users_updated_at on public.wallet_users;
create trigger wallet_users_updated_at
  before update on public.wallet_users
  for each row execute function public.wallet_users_set_updated_at();
