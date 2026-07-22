-- ORKA auth signup repair
-- Run this once in the Supabase SQL Editor for the deployed project.
--
-- `raw_user_meta_data ->>` returns text. The explicit enum cast below prevents
-- the auth.users trigger from rejecting valid email/password signups.

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
    nullif(new.raw_user_meta_data->>'custody_mode', '')::public.custody_mode,
    new.raw_user_meta_data->>'stellar_address'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    role = coalesce(excluded.role, profiles.role),
    custody_mode = coalesce(excluded.custody_mode, profiles.custody_mode),
    stellar_address = coalesce(excluded.stellar_address, profiles.stellar_address);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
