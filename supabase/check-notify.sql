-- Why is the new-message email not arriving?
--
-- Run this in the SQL Editor. Every row is one link in the chain, in order.
-- The first row that says anything other than 'ok' is the problem.
--
-- Safe to run any time: it reads, and sends nothing.

select 'pg_net installed' as check,
       coalesce(
         (select 'ok, in schema ' || n.nspname
          from pg_catalog.pg_proc p
          join pg_catalog.pg_namespace n on n.oid = p.pronamespace
          where p.proname = 'http_post' limit 1),
         'MISSING: enable pg_net under Database, Extensions'
       ) as result

union all
select 'trigger on messages',
       coalesce(
         (select 'ok, ' || tgname from pg_trigger
          where tgrelid = 'public.messages'::regclass
            and tgname = 'messages_notify' and not tgisinternal),
         'MISSING: re-run supabase/schema.sql'
       )

union all
select 'notify_url set',
       coalesce(
         (select 'ok, ' || value from public.app_config where key = 'notify_url'),
         'MISSING: run supabase/set-notify.sql'
       )

union all
select 'notify_secret set',
       coalesce(
         (select case
                   when value = 'PASTE_YOUR_WEBHOOK_SECRET_HERE'
                     then 'STILL THE PLACEHOLDER: put the real secret in set-notify.sql'
                   when length(value) < 16
                     then 'SUSPICIOUSLY SHORT: ' || length(value)::text || ' characters'
                   else 'ok, ' || length(value)::text || ' characters'
                 end
          from public.app_config where key = 'notify_secret'),
         'MISSING: run supabase/set-notify.sql'
       )

union all
select 'last send attempt',
       coalesce(
         (select 'FAILED: ' || value from public.app_config where key = 'notify_last_error'),
         'ok, no recorded failure'
       )

union all
select 'recent pg_net calls',
       coalesce(
         (select 'ok, ' || count(*)::text || ' in the last hour'
          from net._http_response where created > now() - interval '1 hour'),
         'none'
       );

-- If every row says ok and mail still does not arrive, the request left the
-- database and the answer is in Edge Functions, notify-message, Logs.
-- The response bodies pg_net received are here:
--
--   select id, status_code, content, created
--   from net._http_response
--   order by created desc limit 10;
