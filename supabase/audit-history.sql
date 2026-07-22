-- yt-audit — audit history on the account
--
-- Apply after schema.sql and saved-audits.sql. Re-runnable, like the others.
--
-- Recent history started in localStorage, which is right for someone who
-- hasn't signed up: it's what makes the second audit cheap to reach. But the
-- sidebar has been promising signed-in users "on any device", and localStorage
-- can't keep that promise — a cleared cache or a second laptop starts empty.
--
-- So history gets a home on the account. Deliberately NOT saved_audits:
--   - saved_audits carries `result jsonb not null`, the whole audit blob.
--     Writing that automatically on every audit would store megabytes for a
--     list that only ever renders a name, an avatar and a score.
--   - "saved" is a thing the user chose. History is a thing that happened.
--     Collapsing them would make the save button mean nothing.
--
-- This table is the automatic, cheap half; saved_audits stays the deliberate,
-- complete half.

create table if not exists public.audit_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,

  -- The channel's own id is the identity — '@name', a full URL and a UC... id
  -- are three spellings of one channel, the same lesson saved-audits.sql
  -- learned. The handle rides along because it's what a link back navigates
  -- with.
  channel_id text not null,
  channel_handle text not null,
  channel_title text,
  thumbnail text,

  score integer,
  grade text,

  -- Not created_at: the row is upserted, so what matters is when the channel
  -- was last audited, and an upsert has to be able to move it.
  audited_at timestamptz not null default now()
);

-- One row per channel per user: re-auditing moves a channel to the top of the
-- list rather than adding a second row. Also what lets the client upsert with
-- onConflict: 'user_id,channel_id'.
create unique index if not exists audit_history_user_channel_idx
  on public.audit_history (user_id, channel_id);

-- Matches the only listing query: this user's history, most recent first.
create index if not exists audit_history_user_recent_idx
  on public.audit_history (user_id, audited_at desc);

alter table public.audit_history enable row level security;

-- Four policies rather than one `for all`, for the same reason as
-- saved_audits: select/delete need `using`, insert needs `with check`, and
-- update needs both. The upsert path exercises insert and update, so getting
-- either wrong shows up as a save that silently does nothing.
drop policy if exists "Users read their own history" on public.audit_history;
create policy "Users read their own history"
  on public.audit_history for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users record their own history" on public.audit_history;
create policy "Users record their own history"
  on public.audit_history for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their own history" on public.audit_history;
create policy "Users update their own history"
  on public.audit_history for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their own history" on public.audit_history;
create policy "Users delete their own history"
  on public.audit_history for delete
  using ((select auth.uid()) = user_id);
