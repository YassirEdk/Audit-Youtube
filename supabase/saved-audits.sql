-- yt-audit — saved audits, second pass
--
-- Apply after schema.sql. Re-runnable, like the others.
--
-- schema.sql keyed a saved audit on (user_id, channel_handle), where the
-- handle is whatever the user typed. That repeats a bug the sidebar already
-- hit: '@name', 'youtube.com/@name' and 'UC...' are three strings for one
-- channel, so the same channel could be saved three times.
--
-- The channel's own id is the only stable identity, so that becomes the key.
-- The handle stays — the daily job re-audits by handle, and it's what a link
-- back to the audit needs.

alter table public.saved_audits
  add column if not exists channel_id text;

-- The old key allowed one row per spelling. Dropped rather than kept: leaving
-- both means a channel saved under two spellings still passes the constraint.
drop index if exists public.saved_audits_user_channel_idx;

-- NOT partial, deliberately.
--
-- The obvious version of this index carries `where channel_id is not null`, to
-- exclude rows saved before the column existed. That version is unusable: an
-- upsert's ON CONFLICT can only infer a partial index if the statement repeats
-- the same predicate, and PostgREST's on_conflict parameter emits no WHERE
-- clause. The result is "no unique or exclusion constraint matching the
-- ON CONFLICT specification" on every save.
--
-- The predicate was never needed anyway: Postgres treats nulls as distinct in
-- a unique index, so legacy rows with a null channel_id don't collide with
-- each other under a plain index either.
drop index if exists public.saved_audits_user_channel_id_idx;

create unique index if not exists saved_audits_user_channel_id_idx
  on public.saved_audits (user_id, channel_id);

-- Listing a user's saved audits, newest first, is the only read path.
create index if not exists saved_audits_user_saved_idx
  on public.saved_audits (user_id, created_at desc);
