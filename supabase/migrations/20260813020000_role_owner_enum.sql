-- Its own migration on purpose.
--
-- Postgres will not let a newly added enum label be *used* in the same
-- transaction that added it. Anything referring to 'owner' therefore has to
-- run afterwards, which is the next migration.
alter type public.user_role add value if not exists 'owner';
