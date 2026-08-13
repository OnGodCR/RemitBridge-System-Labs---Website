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
  create type public.user_role as enum ('member', 'writer', 'editor', 'admin');
exception
  when duplicate_object then null;
end $$;

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

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()) = 'admin',
    false
  )
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()) in ('editor', 'admin'),
    false
  )
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

-- Two UPDATE policies sit side by side. Postgres allows the write if either
-- passes: a normal user matches "update own profile" (which pins their role),
-- an admin matches this one (which does not).
drop policy if exists "admins manage anyone" on public.profiles;
create policy "admins manage anyone"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    case
      when lower(new.email) = public.owner_email() then 'admin'::public.user_role
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

create index if not exists messages_created_at_idx
  on public.messages (created_at desc);

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
revoke all on function
  public.my_role(), public.my_team(), public.is_admin(),
  public.is_staff(), public.can_write()
from anon;

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
