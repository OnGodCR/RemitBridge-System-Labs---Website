# Edge functions

## notify-message

Emails you whenever someone uses the contact page. The message is already saved
to the `messages` table and shown in the dashboard's Messages tab; this only
means you find out without checking.

Three steps, all of which need credentials that only you should hold.

### 1. Get a sending key

Sign up at [resend.com](https://resend.com) and create an API key. The free tier
sends 100 emails a day, which is far more contact-form traffic than this site
will see.

You can send from `onboarding@resend.dev` straight away. Sending from
`@remitbridge.org` needs the domain verified in Resend first, which is a DNS
record on whoever hosts the domain.

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
npx supabase secrets set RESEND_API_KEY=re_your_key_here WEBHOOK_SECRET=your_random_string NOTIFY_TO=you@example.com
```

`NOTIFY_TO` is where the alerts go. It is a secret rather than a value in this
repo for the same reason the owner address is: this repository is public.

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
