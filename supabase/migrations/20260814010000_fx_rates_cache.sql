-- Cached mid-market rates.
--
-- The point is not speed, it is quota. A live rate provider charges by the
-- request, and every visitor checking a receipt for the same corridor on the
-- same day is asking the same question. One upstream call serves all of them.
--
-- Nothing here is user data. A row is a currency pair, a date and a number.

create table if not exists public.fx_rates (
  base       text        not null check (base ~ '^[A-Z]{3}$'),
  quote      text        not null check (quote ~ '^[A-Z]{3}$'),
  -- The day the rate is FOR, which is not always the day it was asked for.
  day        date        not null,
  rate       numeric     not null check (rate > 0),
  source     text        not null,
  -- True when the provider updates intraday. Drives what the page is allowed
  -- to claim about freshness, so it is stored rather than inferred later.
  live       boolean     not null default false,
  fetched_at timestamptz not null default now(),
  primary key (base, quote, day)
);

comment on table public.fx_rates is
  'Mid-market rate cache for the TrueCost receipt checker. Written only by the fx edge function.';

-- Reads are by exact pair and day, or by newest day for a pair.
create index if not exists fx_rates_pair_day_idx
  on public.fx_rates (base, quote, day desc);

/*
 * No policies, deliberately.
 *
 * RLS is on and nothing grants anon or authenticated anything, so the table is
 * unreachable from the browser. The edge function reaches it with the service
 * role, which bypasses RLS. The browser talks to the function, never the table.
 */
alter table public.fx_rates enable row level security;

revoke all on public.fx_rates from anon, authenticated;
