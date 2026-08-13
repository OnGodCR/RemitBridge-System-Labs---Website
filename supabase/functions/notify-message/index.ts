/**
 * Emails the lab when someone uses the contact form.
 *
 * Fired by a Supabase Database Webhook on INSERT into public.messages, so the
 * email is the database's job rather than the browser's. If the tab closes the
 * instant the form is submitted, the row is still there and this still runs.
 *
 * Set up: see supabase/functions/README.md.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

type WebhookPayload = {
  type?: string
  table?: string
  record?: {
    id?: string
    name?: string
    email?: string | null
    body?: string
    created_at?: string
  }
}

/** Text into HTML, escaped, with blank lines becoming paragraphs. */
function toParagraphs(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  return escaped
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Name the variable that is missing. Three different causes returning one
  // "Not configured" made setup guesswork. Naming an unset env var tells an
  // outsider nothing useful: with WEBHOOK_SECRET unset the function refuses
  // every request anyway, so there is nothing behind it to attack.
  const missing = ['WEBHOOK_SECRET', 'RESEND_API_KEY', 'NOTIFY_TO'].filter(
    (name) => !Deno.env.get(name),
  )
  if (missing.length > 0) {
    const detail = `Not configured: ${missing.join(', ')} not set. Run: npx supabase secrets set ${missing
      .map((n) => `${n}=...`)
      .join(' ')}`
    console.error(detail)
    return new Response(detail, { status: 500 })
  }

  const secret = Deno.env.get('WEBHOOK_SECRET')
  if (req.headers.get('x-webhook-secret') !== secret) {
    return new Response(
      'Unauthorized: the x-webhook-secret header does not match WEBHOOK_SECRET.',
      { status: 401 },
    )
  }

  const apiKey = Deno.env.get('RESEND_API_KEY')
  const to = Deno.env.get('NOTIFY_TO')
  // Unset until a domain is verified in Resend. onboarding@resend.dev is the
  // only sender the free tier allows before that.
  const from = Deno.env.get('NOTIFY_FROM') ?? 'RemitBridge <onboarding@resend.dev>'

  let payload: WebhookPayload
  try {
    payload = await req.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const record = payload.record
  if (payload.table !== 'messages' || !record?.body) {
    // Nothing to do, but not an error worth retrying.
    return new Response('Ignored', { status: 200 })
  }

  const name = record.name ?? 'Someone'
  const replyTo = record.email ?? undefined

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      // Reply goes to the person who wrote in, not to the form.
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject: `RemitBridge contact form: ${name}`,
      html: [
        `<p><strong>${name}</strong>${replyTo ? ` &lt;${replyTo}&gt;` : ' (no email given)'}</p>`,
        toParagraphs(record.body),
        `<hr><p style="color:#6b7280;font-size:12px">Sent from the contact page. It is also in the Messages tab of the dashboard.</p>`,
      ].join(''),
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    console.error('Resend rejected the message', res.status, detail)

    // 403 here is nearly always the free-tier rule rather than a bad key: an
    // unverified Resend account may only send to the address it was created
    // with, from onboarding@resend.dev. Say so, because the raw error does not.
    const hint =
      res.status === 403
        ? ` This is usually the Resend free-tier limit: until a domain is verified, NOTIFY_TO must be the address the Resend account was created with, and NOTIFY_FROM must be unset. Currently sending to ${to} from ${from}.`
        : ''

    // 500 so the webhook retries rather than dropping it silently.
    return new Response(`Send failed: ${detail}${hint}`, { status: 500 })
  }

  return new Response('Sent', { status: 200 })
})
