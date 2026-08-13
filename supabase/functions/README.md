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

### 3. Point the webhook at it

In the Supabase dashboard: **Database → Webhooks → Create a new hook**.

| Field | Value |
| --- | --- |
| Name | `notify-message` |
| Table | `public.messages` |
| Events | Insert only |
| Type | Supabase Edge Functions |
| Edge Function | `notify-message` |
| HTTP Headers | add `x-webhook-secret` with the same random string |

Send yourself a message from the contact page to check. If nothing arrives,
**Edge Functions → notify-message → Logs** will say why: a 401 means the header
and the secret do not match, a 500 means Resend refused the send.

### Why not send the email from the browser

Because the API key would have to be in the page to do that, and anything in the
page is public. The insert into `messages` is the only thing the browser does;
everything after it happens on Supabase's side.
