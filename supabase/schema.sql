-- Run this once in the Supabase SQL editor after creating a project.
-- Each authenticated operative can only read/write their own campaign save.
create table if not exists public.duskline_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  save_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.duskline_profiles enable row level security;

revoke all on table public.duskline_profiles from anon;
grant select, insert, update on table public.duskline_profiles to authenticated;

create policy "Operatives read their own progress"
on public.duskline_profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Operatives create their own progress"
on public.duskline_profiles for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Operatives update their own progress"
on public.duskline_profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);