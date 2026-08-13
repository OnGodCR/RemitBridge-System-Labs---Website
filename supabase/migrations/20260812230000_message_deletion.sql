-- Catch-up migration.
--
-- schema.sql stays the full picture of the database and is safe to re-run.
-- This exists so the live project could be brought forward without a manual
-- paste into the SQL editor, and so the removal of the setup test rows is
-- recorded rather than being an untracked hand edit.

-- A public form will eventually collect spam, and with no delete policy the
-- only way to remove any of it was the SQL editor. Staff only: the person who
-- sent a message must not be able to unsend it.
drop policy if exists "staff delete messages" on public.messages;
create policy "staff delete messages"
  on public.messages for delete to authenticated
  using (public.is_staff());

-- The rows created while wiring up the notification chain.
delete from public.messages
where name in (
  'Automated setup test',
  'test',
  'Notification chain test',
  'Final chain test'
);
