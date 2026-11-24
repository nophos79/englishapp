-- EnglishApp Supabase Schema & Row-Level Security Contract
-- Feature: 001-primary-english-practice
-- Target: Supabase PostgreSQL (Free Tier compatible, < 5 MB/year typical family usage)

create extension if not exists pgcrypto;

-- 1. Family settings (1 row per authenticated Parent account)
create table if not exists public.family_settings (
  family_id uuid primary key references auth.users(id) on delete cascade,
  pin_hash text not null,
  pin_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 2. Student profiles (internal records; zero child PII / no email)
create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.family_settings(family_id) on delete cascade,
  nickname text not null check (char_length(trim(nickname)) between 1 and 30),
  avatar_id text not null default 'owl',
  course_id text not null check (course_id in ('3p', '4p', '5p', '6p')),
  created_at timestamptz not null default now()
);

create index if not exists idx_student_profiles_family
  on public.student_profiles (family_id);

-- 3. Parental unit access control (exact school-year pacing per student)
create table if not exists public.student_unit_access (
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  unit_id text not null,
  family_id uuid not null references public.family_settings(family_id) on delete cascade,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (student_id, unit_id)
);

create index if not exists idx_unit_access_family_student
  on public.student_unit_access (family_id, student_id);

-- 4. Custom exams created by Parent for a Student
create table if not exists public.custom_exams (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.family_settings(family_id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  course_id text not null check (course_id in ('3p', '4p', '5p', '6p')),
  unit_ids text[] not null check (cardinality(unit_ids) >= 1),
  skill_focus text not null check (skill_focus in ('vocabulary', 'grammar', 'mixed')),
  exercise_ids text[] not null check (cardinality(exercise_ids) >= 1),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'abandoned')),
  created_at timestamptz not null default now()
);

create index if not exists idx_custom_exams_student_status
  on public.custom_exams (student_id, status, created_at desc);

-- 5. Immutable attempt records (Practice, Exam, Mistake Review, Bank Practice)
create table if not exists public.attempt_records (
  id uuid primary key, -- Client-generated UUID for offline sync idempotency
  family_id uuid not null references public.family_settings(family_id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  mode text not null check (mode in ('practice', 'exam', 'mistake_review', 'bank_practice')),
  unit_id text,
  exam_id uuid references public.custom_exams(id) on delete set null,
  status text not null check (status in ('completed', 'abandoned')),
  total_questions integer not null check (total_questions > 0),
  correct_count integer not null check (correct_count >= 0 and correct_count <= total_questions),
  score_percent integer not null check (score_percent between 0 and 100),
  stars integer not null check (stars between 0 and 3),
  started_at timestamptz not null,
  finished_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  answers_detail jsonb not null default '[]'::jsonb
);

create index if not exists idx_attempt_records_student_date
  on public.attempt_records (student_id, finished_at desc);

-- 6. Student mistake queue (targeted spaced review)
create table if not exists public.student_mistakes (
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  exercise_id text not null,
  family_id uuid not null references public.family_settings(family_id) on delete cascade,
  unit_id text not null,
  miss_count integer not null default 1 check (miss_count >= 1),
  resolved boolean not null default false,
  last_missed_at timestamptz not null default now(),
  resolved_at timestamptz,
  primary key (student_id, exercise_id)
);

create index if not exists idx_student_mistakes_pending
  on public.student_mistakes (student_id, resolved);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================

alter table public.family_settings enable row level security;
alter table public.student_profiles enable row level security;
alter table public.student_unit_access enable row level security;
alter table public.custom_exams enable row level security;
alter table public.attempt_records enable row level security;
alter table public.student_mistakes enable row level security;

-- family_settings: never expose pin_hash directly to client SELECT; manage via RPC
create policy "family_settings_no_direct_read"
  on public.family_settings for select
  using (false);

-- student_profiles: family-scoped read/write (PIN-gated in UI + sensitive resets via RPC)
create policy "student_profiles_family_select"
  on public.student_profiles for select
  using (family_id = auth.uid());

create policy "student_profiles_family_insert"
  on public.student_profiles for insert
  with check (family_id = auth.uid());

create policy "student_profiles_family_update"
  on public.student_profiles for update
  using (family_id = auth.uid())
  with check (family_id = auth.uid());

-- student_unit_access: family-scoped read/upsert
create policy "unit_access_family_select"
  on public.student_unit_access for select
  using (family_id = auth.uid());

create policy "unit_access_family_insert"
  on public.student_unit_access for insert
  with check (family_id = auth.uid());

create policy "unit_access_family_update"
  on public.student_unit_access for update
  using (family_id = auth.uid())
  with check (family_id = auth.uid());

-- custom_exams: family can read, create, and transition status forward only
create policy "custom_exams_family_select"
  on public.custom_exams for select
  using (family_id = auth.uid());

create policy "custom_exams_family_insert"
  on public.custom_exams for insert
  with check (family_id = auth.uid());

create policy "custom_exams_family_update_status"
  on public.custom_exams for update
  using (family_id = auth.uid() and status in ('pending', 'in_progress'))
  with check (family_id = auth.uid() and status in ('in_progress', 'completed', 'abandoned'));

-- attempt_records: APPEND-ONLY IMMUTABLE (no client UPDATE or DELETE policies!)
create policy "attempt_records_family_select"
  on public.attempt_records for select
  using (family_id = auth.uid());

create policy "attempt_records_family_insert_only"
  on public.attempt_records for insert
  with check (family_id = auth.uid());

-- student_mistakes: family can read/insert/resolve mistakes, never bulk-delete directly
create policy "student_mistakes_family_select"
  on public.student_mistakes for select
  using (family_id = auth.uid());

create policy "student_mistakes_family_insert"
  on public.student_mistakes for insert
  with check (family_id = auth.uid());

create policy "student_mistakes_family_update"
  on public.student_mistakes for update
  using (family_id = auth.uid())
  with check (family_id = auth.uid());

-- ============================================================================
-- SECURE RPC FUNCTIONS (Parent PIN Setup, Verification & Protected Resets)
-- ============================================================================

create or replace function public.has_parent_pin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.family_settings where family_id = auth.uid()
  );
$$;

create or replace function public.set_parent_pin(p_pin text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if p_pin is null or p_pin !~ '^[0-9]{4,6}$' then
    raise exception 'PIN must be 4 to 6 digits';
  end if;

  insert into public.family_settings (family_id, pin_hash, pin_updated_at)
  values (auth.uid(), crypt(p_pin, gen_salt('bf')), now())
  on conflict (family_id) do update
    set pin_hash = crypt(p_pin, gen_salt('bf')),
        pin_updated_at = now();
end;
$$;

create or replace function public.verify_parent_pin(p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  if auth.uid() is null then
    return false;
  end if;

  select pin_hash into v_hash
  from public.family_settings
  where family_id = auth.uid();

  if v_hash is null then
    return false;
  end if;

  return v_hash = crypt(p_pin, v_hash);
end;
$$;

create or replace function public.parent_reset_student_progress(
  p_student_id uuid,
  p_pin text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.verify_parent_pin(p_pin) then
    raise exception 'Invalid parental PIN';
  end if;

  delete from public.attempt_records
  where student_id = p_student_id and family_id = auth.uid();

  delete from public.student_mistakes
  where student_id = p_student_id and family_id = auth.uid();

  delete from public.custom_exams
  where student_id = p_student_id and family_id = auth.uid();
end;
$$;

create or replace function public.parent_delete_student(
  p_student_id uuid,
  p_pin text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.verify_parent_pin(p_pin) then
    raise exception 'Invalid parental PIN';
  end if;

  delete from public.student_profiles
  where id = p_student_id and family_id = auth.uid();
end;
$$;
