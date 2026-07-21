-- yt-audit — Supabase schema
--
-- Run once: Supabase dashboard → SQL Editor → paste → Run. It is written to be
-- re-runnable, so applying it twice is harmless.
--
-- Two tables:
--   profiles      one row per user, mirroring auth.users
--   saved_audits  audits a signed-in user chose to keep
--
-- Everything here leans on row-level security rather than on application code.
-- The anon key ships in the browser bundle, so anyone can call this API with
-- any query they like — these policies, not the frontend, are what actually
-- keep one user's rows away from another's.


-- ---------------------------------------------------------------- profiles --

-- auth.users is managed by Supabase and shouldn't be queried directly from the
-- client. A mirrored profiles table is the supported way to hang your own
-- columns off a user, and the only part of a user other tables should reference.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Postgres has no "create policy if not exists", so drop-then-create keeps the
-- script re-runnable.
drop policy if exists "Profiles are readable by their owner" on public.profiles;
create policy "Profiles are readable by their owner"
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy if exists "Profiles are updatable by their owner" on public.profiles;
create policy "Profiles are updatable by their owner"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Deliberately no insert policy: rows arrive only via the trigger below, which
-- runs as the definer and bypasses RLS. Nothing client-side should be minting
-- profile rows.


-- Populates a profile the moment a user signs up, so the app never has to
-- handle "signed in but no profile row yet".
--
-- security definer is required — the trigger runs as the anonymous signup
-- request, which has no rights on public.profiles. The empty search_path is the
-- matching precaution: without it, a definer function can be tricked into
-- calling a shadowed function from an attacker-controlled schema, so every name
-- below is fully qualified.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    -- Google returns these in raw_user_meta_data; an email signup returns
    -- neither, leaving both null, which the UI already falls back from.
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ------------------------------------------------------------ saved_audits --

create table if not exists public.saved_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,

  -- What was audited. The handle is stored as typed so the row can be turned
  -- back into a ?channel=... link without another lookup.
  channel_handle text not null,
  channel_title text,

  -- Lifted out of `result` so a "your audits" list can sort and filter on them
  -- without parsing JSON on every row.
  score integer,
  grade text,
  videos_analyzed integer,

  -- The whole audit response, verbatim. Storing it whole means a saved audit
  -- renders without burning YouTube API quota re-fetching it, and it stays
  -- readable even after the checks in api/score.py change shape.
  result jsonb not null,

  created_at timestamptz not null default now()
);

-- One saved row per channel per user: re-auditing the same channel should
-- refresh what's stored, not pile up near-duplicates. This is also what lets
-- the client use upsert(..., { onConflict: 'user_id,channel_handle' }).
create unique index if not exists saved_audits_user_channel_idx
  on public.saved_audits (user_id, channel_handle);

-- Matches the only listing query: this user's audits, newest first.
create index if not exists saved_audits_user_created_idx
  on public.saved_audits (user_id, created_at desc);

alter table public.saved_audits enable row level security;

-- Four policies rather than one `for all`, because the read path and the write
-- path aren't the same check: select/delete need `using`, insert needs
-- `with check`, and update needs both. A single combined policy makes it easy
-- to get the insert case silently wrong.
drop policy if exists "Users read their own audits" on public.saved_audits;
create policy "Users read their own audits"
  on public.saved_audits for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users save their own audits" on public.saved_audits;
create policy "Users save their own audits"
  on public.saved_audits for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their own audits" on public.saved_audits;
create policy "Users update their own audits"
  on public.saved_audits for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their own audits" on public.saved_audits;
create policy "Users delete their own audits"
  on public.saved_audits for delete
  using ((select auth.uid()) = user_id);
