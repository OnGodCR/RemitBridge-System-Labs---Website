# Edge functions

## notify-message

Emails you whenever someone uses the contact page. The message is already saved
to the `messages` table and shown in the dashboard's Messages tab; this only
means you find out without checking.

Three steps, all of which need credentials that only you should hold.

### 1. Get a sending key

Sign up at [resend.com](https://resend.com) **using
`remitbridgesystemlabs@gmail.com`**, then create an API key. The free tier sends
100 emails a day, far more contact-form traffic than this site will see.

Signing up with that address is not incidental. Until a domain is verified,
Resend only lets you send **to the address the account was created with**, and
only **from `onboarding@resend.dev`**. Sign up with a different address and
every notification fails with a 403 that reads like a bad key.

So on the free tier, unverified:

- `NOTIFY_TO` must be `remitbridgesystemlabs@gmail.com`
- `NOTIFY_FROM` must be left unset, so it uses `onboarding@resend.dev`

Both limits lift once a real domain is verified in Resend, which is a DNS record
on whoever hosts the domain.

### 2. Deploy the function and set its secrets

```bash
npx supabase login
npx supabase link --project-ref fjcgllboescucoghzypo
npx supabase functions deploy notify-message --no-verify-jwt
```

`--no-verify-jwt` is deliberate: the caller is a database webhook, not a
signed-in person, so there is no JWT to check. The `WEBHOOK_SECRET` below is
what actually guards the endpoint, and the function refuses to run without it.

Then set the secrets. Pick any long random string for `WEBHOOK_SECRET`
(`openssl rand -hex 32` will make one):

```bash
npx supabase secrets set RESEND_API_KEY=re_your_key_here WEBHOOK_SECRET=your_random_string NOTIFY_TO=remitbridgesystemlabs@gmail.com
```

`NOTIFY_TO` is where the alerts go. Only add `NOTIFY_FROM` once a domain is
verified in Resend; before that it must stay unset.

Nothing in this file is a secret you can read back out: `supabase secrets set`
stores them on Supabase, and the function reads them from its environment. The
key itself never appears in this repo.

Optionally add `NOTIFY_FROM="RemitBridge <hello@yourdomain.org>"` once the
domain is verified in Resend.

### 3. Point the database at it

Copy `supabase/set-notify.sql.example` to `supabase/set-notify.sql`, put your
project ref and the same `WEBHOOK_SECRET` string in it, and run it in the SQL
Editor. It is gitignored.

That is all: `schema.sql` already creates the trigger on `public.messages` that
reads those two rows and calls the function.

**Not a dashboard Database Webhook, deliberately.** Creating one fails with
`3F000 schema "supabase_functions" does not exist` on projects that never had
the webhooks integration enabled. A webhook is also invisible to this
repository: nothing you could read here would tell you an email is sent. The
trigger in `schema.sql` says so plainly and is version controlled.

Send yourself a message from the contact page to check. If nothing arrives,
**Edge Functions → notify-message → Logs** will say why: 401 means
`notify_secret` and `WEBHOOK_SECRET` do not match, and a 500 names whichever
secret is unset or repeats what Resend refused.

If the log shows nothing at all, the trigger never fired. Check `pg_net` is
enabled under **Database → Extensions**, and that both rows exist:

```sql
select key from public.app_config where key in ('notify_url', 'notify_secret');
```

### Why not send the email from the browser

Because the API key would have to be in the page to do that, and anything in the
page is public. The insert into `messages` is the only thing the browser does;
everything after it happens on Supabase's side.

## fx

Serves one mid-market rate to the TrueCost receipt checker.

**It is already deployed and already working.** With no key set it uses
[Frankfurter](https://frankfurter.dev), which is what the site used before this
function existed: free, no account, dated history back to 1999, published once a
day. Nothing below is required. It is only what to do if you want live rates.

### Why the rate goes through a function at all

Two reasons, and neither is speed. Going through the function is in fact slower
than calling Frankfurter from the browser, roughly 1.5s against 70ms on a cold
lookup, because of the function cold start.

1. **A key cannot live in the browser.** Every live rate provider authenticates.
   Anything in a Vite bundle is public, so the key has to be read server side.
2. **Providers charge by the request.** Everyone checking the same corridor on
   the same day is asking one question. The answer is cached in the `fx_rates`
   table so one upstream call serves all of them. A 1,500 request monthly
   allowance is workable with a cache and gone in a week without one.

### Turning on live rates

Google has no currency API. The Finance API was retired in 2012, Google Cloud
only publishes its own billing conversion rates monthly, and `GOOGLEFINANCE()`
works only inside Sheets. Scraping google.com/finance has no CORS headers, no
stability guarantee and is against their terms. So the closest real thing is a
provider that sells the same mid-market data.

The function is written against
[ExchangeRate-API](https://www.exchangerate-api.com). Their **free tier will not
help you**: it updates once a day and its history endpoint returns 403 to a free
key, so it is strictly worse than what you already have. Live rates plus history
is the Pro plan, $10/month for 30,000 requests and hourly updates.

If you take it:

```bash
npx supabase secrets set EXCHANGERATE_API_KEY=your-key-here
npx supabase functions deploy fx --no-verify-jwt
```

Never paste that key into a chat, a commit, or any tracked file. `secrets set`
sends it straight to Supabase.

The function picks it up on the next request. Nothing else changes: it tries the
provider first and falls through to Frankfurter whenever the provider is unset,
out of quota, or does not answer. A free-tier key is handled the same way, so
historical lookups keep working while live lookups start using the provider.

### What the page says

Attribution follows whichever source actually answered, per lookup, and the
readout says whether that source updates through the day or publishes once. A
page that credits one source while showing another's number is the exact
unchecked claim this site exists to argue against.

### Abuse

The function is public and unauthenticated, because the tool is. Requests are
validated to a three-letter currency pair and a date within the last ten years.
The date bound is the quota guard: a distinct pair and date is always a cache
miss and so always an upstream call, and without it a script walking every date
back to 1999 would empty a month's allowance in one go. The `fx_rates` table
itself is unreachable from the browser, verified: `anon` gets 401 on both select
and insert.
