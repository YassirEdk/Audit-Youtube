-- yt-audit — score tracking over time
--
-- Apply after schema.sql. Re-runnable, like that file.
--
-- Turns a saved audit from a snapshot into a series: a daily job re-scores
-- every tracked channel and appends a row here, so the UI can show a trend
-- line and say which check moved rather than just what today's number is.


-- Whether the daily job should keep re-scoring this channel. Saving an audit
-- opts you in; this column is what lets someone keep a saved audit around
-- without paying for it in YouTube quota forever.
alter table public.saved_audits
  add column if not exists tracked boolean not null default true;


-- Snapshots are keyed by CHANNEL, not by user.
--
-- Two people tracking the same channel is one row and one YouTube API call,
-- not two. That matters more than it looks: quota is the binding constraint on
-- how many channels this can ever follow, and per-user rows would make popular
-- channels cost the most to track. The trade-off is that a snapshot isn't
-- owned by anyone, so read access is derived (see the policy below).
create table if not exists public.channel_snapshots (
  id uuid primary key default gen_random_uuid(),
  channel_handle text not null,

  -- Both, deliberately. captured_at is the real instant; captured_on is what
  -- the uniqueness rule uses, so a retry after a partial failure updates the
  -- day's row instead of appending a second one.
  captured_at timestamptz not null default now(),
  captured_on date not null default (now() at time zone 'utc')::date,

  score integer,
  grade text,

  -- Denormalised from the audit so a chart query never has to open the jsonb.
  subscribers bigint,
  total_views bigint,
  total_videos integer,
  baseline_views bigint,
  share_above integer,

  -- The full checklist. Keeping it is what makes "your description check went
  -- from fail to pass in April" answerable; without it you only ever know the
  -- score changed, not why.
  checks jsonb
);

-- One row per channel per day. Also what lets the writer use PostgREST's
-- merge-duplicates upsert instead of a read-then-write.
create unique index if not exists channel_snapshots_daily_idx
  on public.channel_snapshots (channel_handle, captured_on);

-- Matches the chart query: one channel's history, newest first.
create index if not exists channel_snapshots_history_idx
  on public.channel_snapshots (channel_handle, captured_on desc);

alter table public.channel_snapshots enable row level security;

-- Because a snapshot has no owner column, access is derived from whether the
-- reader has that channel saved. The subquery is the whole access rule.
drop policy if exists "Users read snapshots for channels they track" on public.channel_snapshots;
create policy "Users read snapshots for channels they track"
  on public.channel_snapshots for select
  using (
    exists (
      select 1
      from public.saved_audits sa
      where sa.channel_handle = public.channel_snapshots.channel_handle
        and sa.user_id = (select auth.uid())
    )
  );

-- No insert/update/delete policies, on purpose. The only writer is the daily
-- job, which authenticates with the service_role key and bypasses RLS
-- entirely. Nothing holding the publishable key can forge history.
