-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- Adds comment reporting for moderation.

create table if not exists public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  reported_by uuid not null references public.profiles(id) on delete cascade,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'dismissed', 'actioned')),
  created_at timestamptz not null default now(),
  unique (comment_id, reported_by)
);

alter table public.comment_reports enable row level security;

drop policy if exists "reports insert own"   on public.comment_reports;
drop policy if exists "reports admin read"   on public.comment_reports;
drop policy if exists "reports admin update" on public.comment_reports;

-- Any signed-in user can file a report for themselves.
create policy "reports insert own" on public.comment_reports
  for insert with check (reported_by = auth.uid());

-- Only admins can view or update reports (moderation queue).
create policy "reports admin read" on public.comment_reports
  for select using (public.is_admin());

create policy "reports admin update" on public.comment_reports
  for update using (public.is_admin());
