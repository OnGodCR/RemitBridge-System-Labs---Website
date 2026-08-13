-- Roles as a ladder rather than a set of flags.
--
--   owner  5   one person, the address in app_config. Cannot be demoted.
--   admin  4   everything except touching another admin or the owner
--   editor 3   publishes posts, reads the contact inbox, reviews applications
--   writer 2   writes and edits their own drafts
--   member 1   signing up. Can apply for a fellowship and nothing else.
--
-- Comparisons are on text, not on enum literals: a `language sql` body is
-- parsed when the function is created, so an enum literal in one would fail on
-- any database where the label was added moments earlier.

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

-- 0 for anyone not signed in, which makes every comparison below fail closed.
create or replace function public.my_rank()
returns int language sql stable security definer set search_path = '' as $$
  select public.role_rank((select role from public.profiles where id = auth.uid()))
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.my_rank() >= 5
$$;

-- Redefined in terms of the ladder, so owner inherits everything admin has
-- without being listed separately in a dozen places.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.my_rank() >= 4
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.my_rank() >= 3
$$;

create or replace function public.can_write()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.my_rank() >= 2
$$;

-- ------------------------------------------------------------- escalation --

-- The policy this replaces read `using (is_admin()) with check (is_admin())`,
-- which put no constraint on whose row was being changed or what the new role
-- was. An admin could therefore edit their own row and set any role they liked.
-- Nobody had done it, but the door was open.
--
-- USING tests the row as it stands, WITH CHECK the row as it would become, so
-- both halves are needed: one stops you touching someone at or above your
-- level, the other stops you handing out a role at or above your level.
--
-- `id <> auth.uid()` is what makes self-promotion impossible. Changing your own
-- name still works, through the separate "update own profile" policy, which
-- pins your role to what it already is.
drop policy if exists "admins manage anyone" on public.profiles;
drop policy if exists "manage people below you" on public.profiles;
create policy "manage people below you"
  on public.profiles for update to authenticated
  using (
    id <> auth.uid()
    and public.role_rank(role) < public.my_rank()
  )
  with check (
    id <> auth.uid()
    and public.role_rank(role) < public.my_rank()
  );

-- At most one owner, enforced by the database rather than by remembering.
-- The predicate compares enum to enum: casting to text is only STABLE, because
-- a label could be renamed, and an index predicate has to be IMMUTABLE. Safe
-- here only because the label was added by the previous migration, which has
-- committed by now.
create unique index if not exists profiles_single_owner
  on public.profiles ((role = 'owner')) where role = 'owner';

-- Staff can already read every profile; the ladder does not change that.
revoke all on function public.role_rank(public.user_role), public.my_rank(), public.is_owner()
  from public, anon, authenticated;
grant execute on function public.role_rank(public.user_role), public.my_rank(), public.is_owner()
  to authenticated;

-- Promote the configured owner. Was 'admin' before this existed.
update public.profiles p
set role = 'owner'
from auth.users u
where u.id = p.id
  and lower(u.email) = public.owner_email()
  and p.role::text <> 'owner';

do $$
begin
  if not exists (select 1 from public.profiles where role::text = 'owner') then
    raise notice 'No owner set. Run supabase/set-owner.sql, then this file again.';
  end if;
end $$;
