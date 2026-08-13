-- RemitBridge — database schema.
--
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Written to be re-runnable, so running it twice is harmless.
--
-- Three tables:
--   profiles                — one row per signed-in person, carrying their role
--   fellowship_applications — students applying to join the lab
--   messages                — contact form submissions
--
-- Row-level security is on for all three. The rules live in the database, so a
-- bug in the frontend cannot expose anything the policies do not already allow.

-- ---------------------------------------------------------------- profiles --

-- 'member' is the default: signing up gets you an account and the ability to
-- apply for a fellowship. It does NOT grant writing access. Roles are raised
-- by hand in the dashboard once someone is actually accepted.
do $$ begin
  create type public.user_role as enum ('member', 'writer', 'editor', 'admin', 'owner');
exception
  when duplicate_object then null;
end $$;

-- For databases created before 'owner' existed. Postgres will not let a label
-- added in a transaction be used in that same transaction, so anything that
-- writes the literal 'owner' lives in set-owner.sql, which runs separately.
alter type public.user_role add value if not exists 'owner';

create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text,
  full_name  text,
  role       public.user_role not null default 'member',
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;

-- Directory fields. `directory_opt_in` defaults false: being on a team is not
-- the same as agreeing to be listed publicly, and for a lab run by high school
-- students the default has to be the private one.
alter table public.profiles add column if not exists team text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists directory_opt_in boolean not null default false;

-- Idempotent for anyone who ran the earlier version of this file.
alter table public.profiles alter column role set default 'member';

alter table public.profiles enable row level security;

-- Reads its own row without triggering the policy it is used by.
create or replace function public.my_role()
returns public.user_role language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Settings that should not be in a public repository. One row per key.
--
-- RLS is on and there are deliberately no policies, so nothing reaches this
-- through the API at all. Security definer functions still read it, because
-- they run as the table's owner rather than as the caller.
create table if not exists public.app_config (
  key   text primary key,
  value text not null
);

alter table public.app_config enable row level security;

-- The lab owner. The address itself lives in app_config, not in this file, so
-- checking this schema into a public repo does not publish a personal email.
-- Set it once with supabase/set-owner.sql, which is gitignored.
create or replace function public.owner_email()
returns text language sql stable security definer set search_path = '' as $$
  select lower(value) from public.app_config where key = 'owner_email'
$$;

-- Not callable over the API. It is only ever used inside the signup trigger and
-- the backfill below, both of which run as the owner. Left exposed, anyone with
-- the publishable key could read the address straight back out of it.
revoke all on function public.owner_email() from public, anon, authenticated;

/*
 * Roles are a ladder, not a set of flags.
 *
 *   owner  5   one person, the address in app_config. Cannot be demoted.
 *   admin  4   everything except touching another admin or the owner
 *   editor 3   publishes posts, reads the inbox, reviews applications
 *   writer 2   writes and edits their own drafts
 *   member 1   signing up. Can apply for a fellowship and nothing else.
 *
 * Comparisons are on text rather than enum literals: a `language sql` body is
 * parsed when the function is created, so a literal would fail on a database
 * where the label had just been added.
 */
create or replace function public.role_rank(r public.user_role)
returns int language sql immutable set search_path = '' as $$
  select case
    when r is null then 0
    when r::text = 'owner'  then 5
    when r::text = 'admin'  then 4
    when r::text = 'editor' then 3
    when r::text = 'writer' then 2
    else 1
  end
$$;

-- 0 when not signed in, so every comparison against it fails closed.
create or replace function public.my_rank()
returns int language sql stable security definer set search_path = '' as $$
  select public.role_rank((select role from public.profiles where id = auth.uid()))
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.my_rank() >= 5
$$;

-- Defined against the ladder so owner inherits everything below it without
-- being named in a dozen separate policies.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.my_rank() >= 4
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.my_rank() >= 3
$$;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id or public.is_staff());

-- Reads its own team for the same reason `my_role` exists.
create or replace function public.my_team()
returns text language sql stable security definer set search_path = '' as $$
  select team from public.profiles where id = auth.uid()
$$;

-- A person may rename themselves, write their own bio and choose whether to be
-- listed. They may not change their own role, and they may not put themselves
-- on a team: both of those are claims about them that someone else has to make.
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = public.my_role()
    and team is not distinct from public.my_team()
  );

/*
 * Two UPDATE policies sit side by side. Postgres allows the write if either
 * passes: a normal user matches "update own profile", which pins their role,
 * and a senior person matches this one.
 *
 * This replaced `using (is_admin()) with check (is_admin())`, which constrained
 * neither whose row was changed nor what the new role was, so an admin could
 * edit their own row and grant themselves anything.
 *
 * USING tests the row as it stands, WITH CHECK the row as it would become, so
 * both halves are needed: one stops you touching someone at or above your
 * level, the other stops you handing out a role at or above your level.
 * `id <> auth.uid()` is what makes self-promotion impossible.
 */
drop policy if exists "admins manage anyone" on public.profiles;
drop policy if exists "manage people below you" on public.profiles;
create policy "manage people below you"
  on public.profiles for update to authenticated
  using (
    public.is_admin()
    and id <> auth.uid()
    and public.role_rank(role) < public.my_rank()
  )
  with check (
    public.is_admin()
    and id <> auth.uid()
    and public.role_rank(role) < public.my_rank()
  );

-- At most one owner, enforced by the database rather than by remembering.
-- Wrapped because the predicate needs the 'owner' label to already exist; on a
-- database that gained it moments ago this runs on the next pass.
do $$ begin
  create unique index if not exists profiles_single_owner
    on public.profiles ((role = 'owner')) where role = 'owner';
exception when others then
  raise notice 'Single-owner index not created yet (%). Re-run this file once more.', sqlerrm;
end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    case
      when lower(new.email) = public.owner_email() then 'owner'::public.user_role
      else 'member'::public.user_role
    end
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------- fellowship applications --

create table if not exists public.fellowship_applications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  team       text not null,
  why        text not null,
  experience text,
  status     text not null default 'submitted'
);

alter table public.fellowship_applications enable row level security;

drop policy if exists "apply for yourself" on public.fellowship_applications;
create policy "apply for yourself"
  on public.fellowship_applications for insert to authenticated
  with check (
    auth.uid() = user_id
    and char_length(why) between 1 and 4000
    and char_length(team) between 1 and 100
  );

drop policy if exists "read own application" on public.fellowship_applications;
create policy "read own application"
  on public.fellowship_applications for select to authenticated
  using (auth.uid() = user_id or public.is_staff());

-- Review trail, so a decision is attributable rather than appearing by itself.
alter table public.fellowship_applications add column if not exists reviewed_by uuid references auth.users on delete set null;
alter table public.fellowship_applications add column if not exists reviewed_at timestamptz;
alter table public.fellowship_applications add column if not exists review_note text;

-- 'submitted' is what an applicant sends. Everything after it is staff moving
-- the row along, which is why applicants get no UPDATE policy at all.
alter table public.fellowship_applications drop constraint if exists applications_status_check;
alter table public.fellowship_applications add constraint applications_status_check
  check (status in ('submitted', 'reading', 'accepted', 'declined'));

drop policy if exists "staff review applications" on public.fellowship_applications;
create policy "staff review applications"
  on public.fellowship_applications for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create index if not exists applications_user_idx
  on public.fellowship_applications (user_id, created_at desc);

create index if not exists applications_status_idx
  on public.fellowship_applications (status, created_at desc);

-- ---------------------------------------------------------------- messages --

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  email      text,
  body       text not null,
  handled    boolean not null default false
);

alter table public.messages enable row level security;

-- Anyone may send one, signed in or not — it is a public contact form.
drop policy if exists "anyone can send a message" on public.messages;
create policy "anyone can send a message"
  on public.messages for insert to anon, authenticated
  with check (
    char_length(name) between 1 and 200
    and char_length(body) between 1 and 5000
    and (email is null or char_length(email) <= 320)
  );

-- Staff only. Anyone can now create an account, so "authenticated" is far too
-- wide a door for other people's correspondence.
drop policy if exists "signed-in users read messages" on public.messages;
drop policy if exists "staff read messages" on public.messages;
create policy "staff read messages"
  on public.messages for select to authenticated
  using (public.is_staff());

drop policy if exists "signed-in users mark handled" on public.messages;
drop policy if exists "staff mark handled" on public.messages;
create policy "staff mark handled"
  on public.messages for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- A public form with no account behind it will eventually collect spam, and
-- with no delete policy the only way to remove any of it was the SQL editor.
-- Staff only: the person who sent a message must not be able to unsend it.
drop policy if exists "staff delete messages" on public.messages;
create policy "staff delete messages"
  on public.messages for delete to authenticated
  using (public.is_staff());

create index if not exists messages_created_at_idx
  on public.messages (created_at desc);

-- --------------------------------------------------- new message, by email --

-- Calls the notify-message edge function when a message arrives.
--
-- This is a plain trigger rather than a dashboard Database Webhook. Two
-- reasons. A webhook needs the `supabase_functions` schema, which is not on
-- every project and fails with `3F000 schema does not exist` when it is
-- missing. And a webhook's configuration exists only in the dashboard, so
-- reading this repository would not tell you the email is ever sent.
--
-- The url and the shared secret live in app_config, which has RLS on and no
-- policies, so neither is readable through the API.
-- pg_net owns its own schema (`net`), so no `with schema` clause here. An
-- earlier version of this file called `extensions.net_http_post`, which does
-- not exist under any name: the real function is `net.http_post`. It threw,
-- the handler below caught it, and the result was a contact form that worked
-- perfectly while silently never sending anything.
do $$
begin
  create extension if not exists pg_net;
exception
  when insufficient_privilege then
    raise notice 'Could not create the pg_net extension. Enable it under Database, Extensions, then run this file again.';
end $$;

create or replace function public.notify_new_message()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  fn_url     text;
  secret     text;
  net_schema text;
begin
  select value into fn_url from public.app_config where key = 'notify_url';
  select value into secret from public.app_config where key = 'notify_secret';

  -- Not configured yet is a normal state, not an error. The message is already
  -- saved by this point, so missing config must never fail the insert: the
  -- contact form working matters more than the email going out.
  if fn_url is null or secret is null then
    return new;
  end if;

  -- Looked up rather than hardcoded, because pg_net has lived in `net` and in
  -- `extensions` depending on how a project was provisioned. Guessing wrong is
  -- what caused the silent failure above.
  select n.nspname into net_schema
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where p.proname = 'http_post'
  limit 1;

  if net_schema is null then
    raise exception 'pg_net is not installed: no http_post function found';
  end if;

  execute format('select %I.http_post($1, $2, $3, $4, $5)', net_schema)
  using
    fn_url,
    jsonb_build_object('type', 'INSERT', 'table', 'messages', 'record', to_jsonb(new)),
    '{}'::jsonb,
    jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', secret),
    5000;

  -- Clear a previous failure so the row means "last attempt", not "ever failed".
  delete from public.app_config where key = 'notify_last_error';

  return new;
exception
  -- Still never fail the insert. But record why, because a warning goes to the
  -- Postgres log where nobody looks, and that is how this stayed invisible.
  when others then
    raise warning 'notify_new_message failed: %', sqlerrm;
    delete from public.app_config where key = 'notify_last_error';
    insert into public.app_config (key, value) values ('notify_last_error', sqlerrm);
    return new;
end $$;

drop trigger if exists messages_notify on public.messages;
create trigger messages_notify
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- ------------------------------------------------------------------- posts --

-- Posts written in the browser. The thirty posts in src/data/posts.js stay in
-- the repo; these are added on top of them at read time, so nothing that is
-- already published depends on the database being up.
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references auth.users on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  slug         text not null unique,
  title        text not null,
  summary      text,
  body         text not null default '',
  read_time    text,
  series       text,
  status       text not null default 'draft'
);

-- One per post: the thumbnail on the index and the banner on the article.
-- Images inside the post are markdown in `body`, not columns here.
alter table public.posts add column if not exists cover_image text;

alter table public.posts drop constraint if exists posts_status_check;
alter table public.posts add constraint posts_status_check
  check (status in ('draft', 'review', 'published'));

alter table public.posts enable row level security;

-- Published posts are the public site, so anon reads them. Drafts are visible
-- to the person writing them and to editors, and to nobody else.
drop policy if exists "read published posts" on public.posts;
create policy "read published posts"
  on public.posts for select to anon, authenticated
  using (status = 'published');

drop policy if exists "read own drafts" on public.posts;
create policy "read own drafts"
  on public.posts for select to authenticated
  using (auth.uid() = author_id or public.is_staff());

-- `public.can_write()` mirrors canWrite() in src/lib/auth.jsx. Hiding the
-- editor in the UI is a convenience; this is the part that actually holds.
create or replace function public.can_write()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()) in ('writer', 'editor', 'admin'),
    false
  )
$$;

drop policy if exists "writers create posts" on public.posts;
create policy "writers create posts"
  on public.posts for insert to authenticated
  with check (auth.uid() = author_id and public.can_write());

-- A writer edits their own drafts. Only an editor can publish, including
-- publishing their own work, so nothing reaches the site unreviewed.
drop policy if exists "authors edit own posts" on public.posts;
create policy "authors edit own posts"
  on public.posts for update to authenticated
  using (auth.uid() = author_id and public.can_write())
  with check (auth.uid() = author_id and status in ('draft', 'review'));

drop policy if exists "editors edit any post" on public.posts;
create policy "editors edit any post"
  on public.posts for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "authors delete own drafts" on public.posts;
create policy "authors delete own drafts"
  on public.posts for delete to authenticated
  using ((auth.uid() = author_id and status <> 'published') or public.is_staff());

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  -- One timestamp for "when did this go live", set the first time it does.
  if new.status = 'published' and old.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

create index if not exists posts_published_idx
  on public.posts (published_at desc) where status = 'published';

-- Images for posts. Public bucket, because the images appear on a public page.
--
-- Everything touching `storage` is wrapped, because `storage.objects` is owned
-- by supabase_storage_admin and the SQL editor does not always have rights on
-- it. Unwrapped, one permission error rolls back the whole file, which is what
-- happened the first time this ran: the tables above vanished with it. A notice
-- and a working database beats a clean failure and no database.
do $$
begin
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'post-images', 'post-images', true, 5242880,
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']
  )
  on conflict (id) do update set
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = excluded.allowed_mime_types;

  drop policy if exists "anyone reads post images" on storage.objects;
  create policy "anyone reads post images"
    on storage.objects for select to anon, authenticated
    using (bucket_id = 'post-images');

  -- Uploads land in a folder named after the uploader, which is what makes the
  -- delete policy below able to tell whose file it is.
  drop policy if exists "writers upload post images" on storage.objects;
  create policy "writers upload post images"
    on storage.objects for insert to authenticated
    with check (
      bucket_id = 'post-images'
      and public.can_write()
      and (storage.foldername(name))[1] = auth.uid()::text
    );

  drop policy if exists "writers delete own post images" on storage.objects;
  create policy "writers delete own post images"
    on storage.objects for delete to authenticated
    using (
      bucket_id = 'post-images'
      and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
    );
exception
  when insufficient_privilege or duplicate_object then
    raise notice 'Storage setup skipped: %. Create the post-images bucket and its policies in Storage in the dashboard. Everything else ran.', sqlerrm;
end $$;

-- --------------------------------------------------------------- directory --

-- A view rather than a policy on `profiles`, because row-level security cannot
-- hide a column. Anyone reading this gets four fields; email is not one of
-- them, and rows that did not opt in are not here at all.
-- No `security_invoker` option set: false is already the default on every
-- Postgres version that has the option at all, and spelling it out breaks the
-- file on anything older than 15.
create or replace view public.directory as
  select id, full_name, team, bio, role
  from public.profiles
  where directory_opt_in = true and full_name is not null;

grant select on public.directory to anon, authenticated;

-- ------------------------------------------------------------ api exposure --

-- PostgREST publishes every function in `public` that the API roles can execute.
-- These are needed by `authenticated`, because row-level security policies are
-- evaluated as the caller. No policy for `anon` uses any of them, so `anon` has
-- no reason to be able to call them.
--
-- Revoking from `anon` alone does nothing: Postgres grants EXECUTE on every new
-- function to PUBLIC, and `anon` is a member of PUBLIC, so the broader grant
-- kept letting it through. Take it away from PUBLIC, then hand it back to the
-- one role that needs it.
revoke all on function
  public.my_role(), public.my_team(), public.is_admin(),
  public.is_staff(), public.can_write()
from public, anon, authenticated;

grant execute on function
  public.my_role(), public.my_team(), public.is_admin(),
  public.is_staff(), public.can_write()
to authenticated;

-- ------------------------------------------------------------- owner grant --

-- Accounts created before this file was first run have no profile row: the
-- trigger that makes one did not exist yet. Without this insert the owner
-- signs in to no profile at all, and the update below has nothing to promote.
insert into public.profiles (id, email, full_name, role)
select
  u.id,
  u.email,
  u.raw_user_meta_data ->> 'full_name',
  case
    -- Deliberately not 'owner': this file may have added that label moments
    -- ago, and Postgres refuses to use a label in the transaction that created
    -- it. set-owner.sql does the promotion, separately.
    when lower(u.email) = public.owner_email() then 'admin'::public.user_role
    else 'member'::public.user_role
  end
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- Fills in email for rows created before that column existed, and makes sure
-- the owner is an admin whether they signed up before or after this ran.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is distinct from u.email;

update public.profiles p
set role = 'admin'
from auth.users u
where u.id = p.id
  and lower(u.email) = public.owner_email()
  and p.role is distinct from 'admin';

-- With no owner set, `owner_email()` is null, every comparison above is null,
-- and nobody is promoted. That is the safe direction to fail, but it is silent,
-- so say it out loud instead of leaving someone to wonder why they are a member.
do $$
begin
  if public.owner_email() is null then
    raise notice 'No owner set: run supabase/set-owner.sql, then re-run this file. Nobody has admin until you do.';
  elsif not exists (select 1 from public.profiles where role = 'admin') then
    raise notice 'Owner is set to %, but no account with that address has signed up yet. Sign up, then re-run this file.', public.owner_email();
  end if;
end $$;
