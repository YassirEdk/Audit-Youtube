-- yt-audit — observed subscriber readings, for a measured growth rate
--
-- Apply after schema.sql. Re-runnable, like the other files here.
--
-- Why this exists: YouTube's Data API rounds subscriberCount to three
-- significant figures, so a single reading can never tell you how fast a
-- channel is growing. What it *can* tell you is the moment the rounded figure
-- crosses into a new band. Record those crossings with timestamps and the
-- growth rate falls out of the gaps between them — a real measurement of this
-- channel over the last few weeks, rather than the lifetime average
-- (total subscribers / channel age) that the live tile used to extrapolate
-- from. The lifetime average is wrong in both directions that matter: it makes
-- a dormant channel appear to still be growing, and it badly understates a
-- channel that took off recently.


-- One row per observed CHANGE, not per poll.
--
-- The live tile polls once a minute per viewer, but the rounded figure it
-- reads only moves every few hours at best and every few weeks on a large
-- channel. Storing a row per poll would be almost entirely duplicate rows;
-- storing only the crossings keeps this to a handful of rows per channel per
-- month, which is what makes a long window cheap to query.
--
-- last_seen_at is what makes a *flat* stretch measurable. Without it, one
-- reading tells you nothing about rate; with it, "this figure has not moved in
-- 9 days" puts a hard ceiling on how fast the channel can be growing.
create table if not exists public.subscriber_readings (
  id uuid primary key default gen_random_uuid(),

  -- The resolved UC... id rather than a handle: this is written from the live
  -- endpoint, which is given an id precisely so polling never pays for a
  -- search call. Handles can also change; ids cannot.
  channel_id text not null,

  subscribers bigint not null,

  -- When this value was first observed, and when it was last confirmed still
  -- current. observed_at anchors the rate maths; last_seen_at bounds it.
  observed_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- Matches the rate query: one channel's crossings, newest first.
create index if not exists subscriber_readings_history_idx
  on public.subscriber_readings (channel_id, observed_at desc);

alter table public.subscriber_readings enable row level security;

-- Deliberately no policies for anon/authenticated.
--
-- RLS on with zero policies means the browser can read nothing here directly,
-- which is intended: this table is written and read exclusively by the server
-- using the service-role key, and the only thing derived from it that a client
-- ever sees is a single scalar growth rate on /api/subs. The underlying
-- readings are public data, but there is no reason to hand out the table.
