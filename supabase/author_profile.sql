-- Run this in Supabase SQL Editor to enable the author profile

create table if not exists public.author_profile (
  id integer primary key default 1 check (id = 1),
  name text not null default 'Velvet Mochi',
  tagline text not null default 'Author of moonlit dark romance',
  bio text not null default '',
  avatar_url text,
  cover_url text,
  twitter text,
  instagram text,
  tiktok text,
  goodreads text,
  website text,
  email text,
  fun_facts text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Insert default row if missing
insert into public.author_profile (id) values (1) on conflict (id) do nothing;

-- RLS: everyone can read, only admins can write
alter table public.author_profile enable row level security;

drop policy if exists "author profile read"  on public.author_profile;
drop policy if exists "author profile write" on public.author_profile;

create policy "author profile read"  on public.author_profile for select using (true);
create policy "author profile write" on public.author_profile for all   using (public.is_admin()) with check (public.is_admin());
