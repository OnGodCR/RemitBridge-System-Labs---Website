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

Serves mid-market rates to the TrueCost receipt checker.

**It is already deployed and already working.** With no key set it uses
[Frankfurter](https://frankfurter.dev): free, no account, dated history back to
1999, published once a day. Nothing below is required. It is only what to do if
you want live rates.

### One call per base per day, not per lookup

Both providers return **every** quote for a base currency in a single request,
for past days as well as today. So asking about USD to MXN costs exactly the
same upstream call as asking about all 165 USD pairs. The function fetches the
whole base and stores it.

Measured, not assumed: one lookup of GBP to NGN stored **163 GBP pairs**. One
lookup of EUR to PHP on a past date stored **164 EUR pairs for that day**. Every
other pair on that base and day is then free, forever, because a past day's rate
cannot change and today's is refetched at most every six hours.

That is the "check once a day and store it" idea, and it is why there is no
scheduled job. A cron would be a second thing to deploy, a second thing that can
fail silently, and it would fetch base currencies nobody asked about. The first
lookup of the day does the same work, only for the bases people actually use.

### Why the browser is fast anyway

The `fx_rates` table is readable by anyone. It holds a currency pair, a date and
a number: no user data, nothing secret, every figure already published for
anyone to read. So the browser reads it directly and only calls the function on
a miss.

Measured on the live site:

| | |
|---|---|
| Pair already stored | ~400ms, one PostgREST read, no function, no upstream call |
| First pair on a new base | ~1.4s, function runs, whole base stored |
| Any other pair on that base | back to ~400ms |

Writes stay with the service role. Verified: `anon` gets 401 on insert, update
and delete, and can only select.

### Turning on live rates

Google has no currency API. The Finance API was retired in 2012, Google Cloud
only publishes its own billing conversion rates monthly, and `GOOGLEFINANCE()`
works solely inside Sheets. Scraping google.com/finance has no CORS headers, no
stability guarantee and is against their terms. So the closest real thing is a
provider selling the same mid-market data.

### Do you actually need intraday?

Probably not. The mid-market rate for a major corridor moves a fraction of a
percent through a day. The thing this site measures is provider markups of two
to eight percent. Intraday precision is an order of magnitude below the signal.

It is also the wrong input for the main tool: TrueCost checks a receipt from a
past date, and for that the reference rate published **for that date** is more
correct than a live tick. Rate history is a daily chart by construction. Only
the Fair rate page shows "the rate right now", and it names its source and date
either way.

### The free options, measured

Checked against the live APIs rather than their marketing:

| Source | Key | Cadence | Historical | Notes |
|---|---|---|---|---|
| **Frankfurter** (current) | none | daily | to 1999 | no account, no quota, 165 currencies |
| Fawaz Ahmed currency-api | none | daily | dated URLs | CDN-hosted, 200+ incl. crypto |
| open.er-api.com | none | daily | no | same cadence, nothing gained |
| **Twelve Data** | free key | **real-time** | yes | 800 calls/day, 8/min |
| Alpha Vantage | free key | **real-time** | yes | 25 calls/day, one pair per call |
| exchangerate.host / Fixer | free key | daily | paid | tiny free quotas |

**Twelve Data's free tier is the one that would actually change anything**, and
it is free. This cache needs roughly twenty calls a day: four refreshes of the
six-hour TTL across the five currencies people send from. That is under three
percent of their free allowance.

Alpha Vantage is genuinely real-time too but prices one pair per call, so 25 a
day only covers a handful of corridors.

The catch that applies to all of them and not to Frankfurter: they need an
account and a key, and a free tier is a promise a company can withdraw. A lab
run by students has a real interest in a dependency with no account attached.

### If you take a paid one anyway

The function is currently written against
[ExchangeRate-API](https://www.exchangerate-api.com). Their **free tier will not
help you**: it updates once a day and its history endpoint returns 403 to a free
key, so it is strictly worse than what you already have. Live rates plus history
is the Pro plan, $10/month for 30,000 requests. Given the table above there is
no reason to pay it.

With one call per base per day, thirty thousand is far more than this site can
use. Even three hundred would do.

```bash
npx supabase secrets set EXCHANGERATE_API_KEY=your-key-here
npx supabase functions deploy fx --no-verify-jwt
```

Never paste that key into a chat, a commit, or any tracked file. `secrets set`
sends it straight to Supabase.

The function picks it up on the next request. It tries the provider first and
falls through to Frankfurter whenever the provider is unset, out of quota, or
does not answer. A free-tier key is handled the same way, so historical lookups
keep working while live lookups start using the provider.

### What the page says

Attribution follows whichever source actually answered, per lookup, and the
readout says whether that source updates through the day or publishes once. A
page that credits one source while showing another's number is the exact
unchecked claim this site exists to argue against.

Dates are stored per currency rather than per request, because Frankfurter
returns different dates for different currencies in one response: a thinly
traded currency can be a day behind the rest. Stamping them all with the day
that was asked for would quietly backdate real numbers.

### Abuse

The function is public and unauthenticated, because the tool is. Requests are
validated to a three-letter pair and a date within the last ten years. The date
bound is the quota guard: a base and day never asked for is always an upstream
call, and without it a script walking every date back to 1999 would empty a
month's allowance in one go.
