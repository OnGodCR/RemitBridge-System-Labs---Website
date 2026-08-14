-- Why someone wrote in, chosen from a fixed list on the contact form.
--
-- Nullable: every message sent before this existed has no topic, and a default
-- would invent one for them. The insert policy is left alone deliberately, so
-- an older client that does not send a topic still succeeds.
alter table public.messages add column if not exists topic text;

alter table public.messages drop constraint if exists messages_topic_check;
alter table public.messages add constraint messages_topic_check
  check (topic is null or topic in ('workshop', 'correction', 'join', 'research', 'other'));
