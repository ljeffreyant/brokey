-- Brokey cloud sync. Run this once in the Supabase SQL editor.
-- One row per person holding their whole data snapshot. Last write wins.

create table if not exists public.snapshots (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.snapshots enable row level security;

-- Each person can only see and change their own row.
create policy "own snapshot: select" on public.snapshots
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "own snapshot: insert" on public.snapshots
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "own snapshot: update" on public.snapshots
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own snapshot: delete" on public.snapshots
  for delete to authenticated using ((select auth.uid()) = user_id);
