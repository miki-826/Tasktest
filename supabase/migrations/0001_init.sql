-- Minimal Focus Task: 初期スキーマ + RLS
-- Supabase ダッシュボードの SQL Editor に貼り付けて実行してください。

-- tasks ---------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  due_date date,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'hold')),
  priority text not null default 'mid' check (priority in ('high', 'mid', 'low')),
  tags text[] not null default '{}',
  notify_enabled boolean not null default false,
  notify_before_minutes integer not null default 1440,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

-- study_logs ----------------------------------------------------------
create table if not exists public.study_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  title text not null,
  duration_minutes integer not null,
  studied_at date not null,
  memo text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists study_logs_user_id_idx on public.study_logs (user_id);

-- user_settings -------------------------------------------------------
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  notify_enabled boolean not null default true,
  notify_timing integer not null default 1440
);

-- updated_at 自動更新 -------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- Row Level Security --------------------------------------------------
alter table public.tasks enable row level security;
alter table public.study_logs enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "tasks_owner" on public.tasks;
create policy "tasks_owner" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "study_logs_owner" on public.study_logs;
create policy "study_logs_owner" on public.study_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_settings_owner" on public.user_settings;
create policy "user_settings_owner" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
