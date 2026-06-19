-- =========================================================================
-- VELVET MOCHI - Production Schema
-- Run this in the Supabase SQL editor in one go. It is idempotent and safe
-- to re-run after edits.
-- =========================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------
-- TABLES
-- -----------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Moonlit Reader',
  role text not null default 'reader' check (role in ('reader', 'author', 'admin')),
  avatar_url text,
  favorite_genres text[] not null default '{}',
  age_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  synopsis text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  universe text not null default 'Velvet Archive',
  genre text not null default 'Dark romance',
  heat text not null default 'Slow burn',
  cover_url text,
  cover text not null default 'from-burgundy via-plum to-black',
  rating numeric not null default 0,
  readers text not null default '0',
  trigger_warnings text[] not null default '{}',
  next_release text not null default 'Unscheduled',
  chapter_count integer not null default 0,
  progress integer not null default 0,
  characters text[] not null default '{}',
  mature boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  number integer not null,
  title text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  reading_minutes integer not null default 10,
  views integer not null default 0,
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (story_id, number)
);

create or replace view public.chapter_library as
select
  c.id, c.story_id, s.slug as story_slug, s.title as story_title,
  c.number, c.title, c.body, c.status, c.reading_minutes, c.views,
  c.scheduled_for, c.published_at, c.created_at, c.updated_at
from public.chapters c
join public.stories s on s.id = c.story_id;

create table if not exists public.reading_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  progress integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  label text not null,
  created_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  body text not null check (char_length(body) > 0 and char_length(body) <= 4000),
  created_at timestamptz not null default now()
);

-- user_id IS NULL = broadcast to all authenticated readers
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null check (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'),
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  recipient_count integer not null default 0,
  sent_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------

create index if not exists idx_chapters_story_id          on public.chapters(story_id);
create index if not exists idx_chapters_status            on public.chapters(status);
create index if not exists idx_chapters_scheduled         on public.chapters(scheduled_for) where status = 'scheduled';
create index if not exists idx_reading_progress_user_id   on public.reading_progress(user_id);
create index if not exists idx_reading_progress_story_id  on public.reading_progress(story_id);
create index if not exists idx_bookmarks_user_id          on public.bookmarks(user_id);
create index if not exists idx_bookmarks_story_id         on public.bookmarks(story_id);
create index if not exists idx_comments_story_id          on public.comments(story_id);
create index if not exists idx_comments_chapter_id        on public.comments(chapter_id);
create index if not exists idx_notifications_user_id      on public.notifications(user_id);
create index if not exists idx_notifications_created_at   on public.notifications(created_at desc);
create index if not exists idx_stories_status             on public.stories(status);
create index if not exists idx_newsletter_status          on public.newsletter_subscribers(status);

-- -----------------------------------------------------------------------
-- TRIGGERS & FUNCTIONS
-- -----------------------------------------------------------------------

-- Auto-create a profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on stories / chapters
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists stories_touch on public.stories;
create trigger stories_touch before update on public.stories
  for each row execute procedure public.touch_updated_at();

drop trigger if exists chapters_touch on public.chapters;
create trigger chapters_touch before update on public.chapters
  for each row execute procedure public.touch_updated_at();

-- Keep stories.chapter_count in sync
create or replace function public.sync_chapter_count()
returns trigger language plpgsql as $$
declare target_id uuid;
begin
  target_id := coalesce(new.story_id, old.story_id);
  update public.stories
     set chapter_count = (select count(*) from public.chapters where story_id = target_id)
   where id = target_id;
  return null;
end;
$$;

drop trigger if exists chapters_count_sync on public.chapters;
create trigger chapters_count_sync
  after insert or delete or update of story_id on public.chapters
  for each row execute procedure public.sync_chapter_count();

-- Atomic view increment (called from the chapter reader page)
create or replace function public.increment_chapter_views(chapter_id_input uuid)
returns void language sql as $$
  update public.chapters set views = views + 1 where id = chapter_id_input;
$$;

-- Admin check (used by RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('author', 'admin')
  );
$$;

-- -----------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------

alter table public.profiles               enable row level security;
alter table public.stories                enable row level security;
alter table public.chapters               enable row level security;
alter table public.reading_progress       enable row level security;
alter table public.bookmarks              enable row level security;
alter table public.comments               enable row level security;
alter table public.notifications          enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_campaigns   enable row level security;

-- Drop-and-recreate policies so re-running this script is idempotent
drop policy if exists "profiles self read"          on public.profiles;
drop policy if exists "profiles self update"        on public.profiles;
drop policy if exists "public published stories"    on public.stories;
drop policy if exists "admin story writes"          on public.stories;
drop policy if exists "public published chapters"   on public.chapters;
drop policy if exists "admin chapter writes"        on public.chapters;
drop policy if exists "reader own progress"         on public.reading_progress;
drop policy if exists "reader own bookmarks"        on public.bookmarks;
drop policy if exists "comments read"               on public.comments;
drop policy if exists "comments write own"          on public.comments;
drop policy if exists "comments delete own or admin" on public.comments;
drop policy if exists "notifications read"          on public.notifications;
drop policy if exists "notifications write own"     on public.notifications;
drop policy if exists "notifications admin write"   on public.notifications;
drop policy if exists "newsletter insert"           on public.newsletter_subscribers;
drop policy if exists "newsletter admin read"       on public.newsletter_subscribers;
drop policy if exists "newsletter admin write"      on public.newsletter_subscribers;
drop policy if exists "campaign admin"              on public.newsletter_campaigns;

create policy "profiles self read"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update using (id = auth.uid());

create policy "public published stories" on public.stories for select using (status = 'published' or public.is_admin());
create policy "admin story writes"       on public.stories for all using (public.is_admin()) with check (public.is_admin());

create policy "public published chapters" on public.chapters for select using (status = 'published' or public.is_admin());
create policy "admin chapter writes"      on public.chapters for all using (public.is_admin()) with check (public.is_admin());

create policy "reader own progress"  on public.reading_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reader own bookmarks" on public.bookmarks        for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "comments read"                on public.comments for select using (true);
create policy "comments write own"           on public.comments for insert with check (user_id = auth.uid());
create policy "comments delete own or admin" on public.comments for delete using (user_id = auth.uid() or public.is_admin());

create policy "notifications read"        on public.notifications for select using (user_id = auth.uid() or user_id is null or public.is_admin());
create policy "notifications write own"   on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications admin write" on public.notifications for insert with check (public.is_admin());

create policy "newsletter insert"      on public.newsletter_subscribers for insert with check (true);
create policy "newsletter admin read"  on public.newsletter_subscribers for select using (public.is_admin());
create policy "newsletter admin write" on public.newsletter_subscribers for update using (public.is_admin()) with check (public.is_admin());

create policy "campaign admin" on public.newsletter_campaigns for all using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------
-- STORAGE BUCKETS
-- Run once in Supabase Studio (Storage > New bucket) if not yet created:
--   story-covers (public)
--   character-art (public)
--   moodboards    (public)
--   author-assets (public)
-- Then add a policy: "allow authenticated uploads" for service role bypass,
-- since we proxy all uploads through /api/admin/storage (server-side).
-- -----------------------------------------------------------------------
