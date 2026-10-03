create extension if not exists "pgcrypto";

create table if not exists public.tasks (
  id bigint primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  title text not null,
  detail text not null default '',
  time text not null default 'Anytime',
  priority text not null default 'Medium' check (priority in ('High', 'Medium', 'Low')),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  content text not null default '',
  primary key (user_id, day)
);

create table if not exists public.daily_reminders (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  content text not null default '',
  primary key (user_id, day)
);

alter table public.tasks enable row level security;
alter table public.daily_notes enable row level security;
alter table public.daily_reminders enable row level security;

create policy "Users manage their own tasks" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own notes" on public.daily_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own reminders" on public.daily_reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);