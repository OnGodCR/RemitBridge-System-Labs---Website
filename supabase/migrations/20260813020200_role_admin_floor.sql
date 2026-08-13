-- Managing roles is admin and above, not merely "anyone senior to the target".
--
-- Without the floor, an editor outranks a member and could therefore promote
-- one, while the People panel is only shown to admins. A rule the interface
-- never exposes is a rule nobody has thought about, and this one is about who
-- gets to hand out access.
--
-- The two rank checks stay: an admin still cannot touch another admin, the
-- owner, or themselves.
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
