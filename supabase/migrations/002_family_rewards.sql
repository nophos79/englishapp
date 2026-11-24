-- Optional Migration: Family Reward Goals synced across parent and student devices
-- Note: XP, Ranks, Passport Stamps, Weekly Goal, and Unlockable Avatars work automatically
-- from existing tables without requiring this migration. Run this SQL in Supabase SQL Editor
-- if you want Parent-configured "Premios Familiares" to sync across multiple devices.

create table if not exists public.family_rewards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.family_settings(family_id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  metric text not null check (metric in ('stars', 'sessions')),
  target_value integer not null check (target_value between 1 and 200),
  baseline_value integer not null default 0 check (baseline_value >= 0),
  status text not null default 'active' check (status in ('active', 'claimed', 'redeemed')),
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  redeemed_at timestamptz
);

create index if not exists idx_family_rewards_student
  on public.family_rewards (student_id, created_at desc);

alter table public.family_rewards enable row level security;

drop policy if exists "family_rewards_family_select" on public.family_rewards;
create policy "family_rewards_family_select"
  on public.family_rewards for select
  using (family_id = auth.uid());

drop policy if exists "family_rewards_family_insert" on public.family_rewards;
create policy "family_rewards_family_insert"
  on public.family_rewards for insert
  with check (family_id = auth.uid());

drop policy if exists "family_rewards_family_update" on public.family_rewards;
create policy "family_rewards_family_update"
  on public.family_rewards for update
  using (family_id = auth.uid())
  with check (family_id = auth.uid());

drop policy if exists "family_rewards_family_delete" on public.family_rewards;
create policy "family_rewards_family_delete"
  on public.family_rewards for delete
  using (family_id = auth.uid());

grant select, insert, update, delete on public.family_rewards to authenticated;
