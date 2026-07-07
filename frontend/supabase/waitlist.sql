-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  name text,
  role text,
  created_at timestamptz default now()
);

-- Optional: enable RLS so only server-side (service role) can write
alter table waitlist enable row level security;

create policy "Allow anonymous waitlist signups"
  on waitlist for insert
  to anon
  with check (true);

create policy "Allow read for service role"
  on waitlist for select
  to service_role
  using (true);
