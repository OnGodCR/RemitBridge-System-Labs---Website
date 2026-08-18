-- Two holes of the same shape: workflow columns a submitter could preset.
--
-- Neither is reachable from the site's own forms, which never send these
-- columns. Both are reachable from curl with the publishable key, which is
-- public by design, so the policy is the only thing that holds.

-- ---------------------------------------------------------------- messages --
--
-- The insert policy checked lengths and nothing else, so a sender could insert
-- handled = true and never appear in the unread count, or backdate created_at
-- and bury the row pages deep in the inbox.
--
-- created_at = now() allows the default through untouched: both sides are the
-- transaction timestamp, so they are equal exactly when the sender did not
-- supply a value of their own.

-- Crude global rate limit. Counts with definer rights because the counting has
-- to see rows the sender cannot: anon has no select on messages, so a count
-- run as anon would see zero and the check would always pass.
create or replace function public.recent_message_count()
returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int
  from public.messages
  where created_at > now() - interval '1 minute'
$$;

-- Five a minute, site-wide. Real traffic on a site this size will never hit
-- it; a script hits it on the sixth request. The trade is accepted openly: a
-- sustained attacker can keep the form full and block everyone for the
-- duration, which is recoverable, where a database that swallows every insert
-- and emails the lab for each one is not.
drop policy if exists "anyone can send a message" on public.messages;
create policy "anyone can send a message"
  on public.messages for insert to anon, authenticated
  with check (
    char_length(name) between 1 and 200
    and char_length(body) between 1 and 5000
    and (email is null or char_length(email) <= 320)
    and not handled
    and created_at = now()
    and public.recent_message_count() < 5
  );

-- ---------------------------------------- fellowship applications ----------
--
-- Same class, higher stakes: the insert policy did not pin status, so an
-- applicant could insert status = 'accepted' and appear in the accepted pile
-- of the review dashboard, one credulous glance away from being given a role.
-- The review-trail columns could be preset the same way, forging a reviewer.
drop policy if exists "apply for yourself" on public.fellowship_applications;
create policy "apply for yourself"
  on public.fellowship_applications for insert to authenticated
  with check (
    auth.uid() = user_id
    and char_length(why) between 1 and 4000
    and char_length(team) between 1 and 100
    and (experience is null or char_length(experience) <= 4000)
    and status = 'submitted'
    and reviewed_by is null
    and reviewed_at is null
    and review_note is null
    and created_at = now()
  );

-- One live application per person. Apply again after a decision, not
-- alongside: without this, one account could stack thousands of 4KB rows in
-- the review queue.
create unique index if not exists applications_one_live_per_user
  on public.fellowship_applications (user_id)
  where status in ('submitted', 'reading');
