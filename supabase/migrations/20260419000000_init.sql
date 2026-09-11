-- Profiles table (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free','pro')),
  resume_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: users can view own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles: users can update own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Profiles: users can insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Resumes
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  original_text text,
  rewritten_resume text,
  ats_score integer,
  score_breakdown jsonb,
  weaknesses jsonb,
  missing_keywords jsonb,
  strengths jsonb,
  job_matches jsonb,
  status text not null default 'processing' check (status in ('processing','complete','error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resumes enable row level security;

create policy "Resumes: owner select" on public.resumes for select using (auth.uid() = user_id);
create policy "Resumes: owner insert" on public.resumes for insert with check (auth.uid() = user_id);
create policy "Resumes: owner update" on public.resumes for update using (auth.uid() = user_id);
create policy "Resumes: owner delete" on public.resumes for delete using (auth.uid() = user_id);

create trigger resumes_updated_at before update on public.resumes
  for each row execute function public.set_updated_at();

create index resumes_user_created_idx on public.resumes(user_id, created_at desc);

-- Saved jobs
create table public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  external_job_id text not null,
  title text not null,
  company text,
  location text,
  apply_url text,
  salary_min integer,
  salary_max integer,
  saved_at timestamptz not null default now(),
  unique(user_id, external_job_id)
);

alter table public.saved_jobs enable row level security;
create policy "SavedJobs: owner all" on public.saved_jobs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Interview sessions
create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  questions jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.interview_sessions enable row level security;
create policy "Interview: owner all" on public.interview_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
