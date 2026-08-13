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

/**
 * Everything below treats the message as hostile. It comes from a public form
 * with no account behind it, so the name and the address are attacker
 * controlled just as much as the body is. An earlier version dropped the name
 * straight into the markup.
 */
const escape = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/** Text into paragraphs, escaped, with blank lines splitting blocks. */
function toParagraphs(text: string): string {
  return escape(text)
    .split(/\n{2,}/)
    .map(
      (block) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1C2024">${block.replace(
          /\n/g,
          '<br>',
        )}</p>`,
    )
    .join('')
}

const GREEN = '#14705A'
const INK = '#1C2024'
const MUTED = '#6B7280'
const LINE = '#E5E7EB'
const PAPER = '#F9FAFB'

// A system stack rather than the site's Plus Jakarta Sans: web fonts are
// stripped by most mail clients, and a font that half-loads looks worse than
// one that was never asked for.
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

/**
 * Tables, inline styles, no flexbox. Not nostalgia: Outlook renders through
 * Word, which supports none of the modern layout, and a nested div layout
 * collapses there.
 */
function buildHtml(opts: {
  name: string
  replyTo?: string
  body: string
  sentAt: string
}): string {
  const { name, replyTo, body, sentAt } = opts

  const contactLine = replyTo
    ? `<a href="mailto:${encodeURI(replyTo)}" style="color:${GREEN};text-decoration:underline">${escape(
        replyTo,
      )}</a>`
    : `<span style="color:${MUTED}">no address given, so there is no way to reply</span>`

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>New message from the contact page</title>
</head>
<body style="margin:0;padding:0;background-color:${PAPER};">
  <!-- Shown in the inbox list under the subject, then hidden in the body. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">
    ${escape(body.slice(0, 140))}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:${PAPER};padding:24px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
               style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid ${LINE};border-radius:16px;overflow:hidden">

          <tr>
            <td style="background-color:${GREEN};padding:24px 28px">
              <p style="margin:0;font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;opacity:0.85">
                RemitBridge Systems Lab
              </p>
              <p style="margin:6px 0 0;font-family:${FONT};font-size:22px;font-weight:700;color:#ffffff">
                New message from the contact page
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 28px 8px;font-family:${FONT}">
              <p style="margin:0;font-size:18px;font-weight:700;color:${INK}">${escape(name)}</p>
              <p style="margin:4px 0 0;font-size:15px">${contactLine}</p>
              <p style="margin:4px 0 0;font-size:13px;color:${MUTED}">${escape(sentAt)}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 28px 0">
              <div style="height:1px;background-color:${LINE};line-height:1px">&nbsp;</div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 28px 8px;font-family:${FONT}">
              ${toParagraphs(body)}
            </td>
          </tr>

          ${
            replyTo
              ? `<tr>
            <td style="padding:12px 28px 28px">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:${GREEN};border-radius:9999px">
                    <a href="mailto:${encodeURI(replyTo)}"
                       style="display:inline-block;padding:12px 28px;font-family:${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none">
                      Reply to ${escape(name)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ''
          }

          <tr>
            <td style="background-color:${PAPER};border-top:1px solid ${LINE};padding:18px 28px;font-family:${FONT}">
              <p style="margin:0;font-size:13px;line-height:1.5;color:${MUTED}">
                Sent from the contact page. It is saved in the Messages tab of the
                dashboard too, so replying here does not mark it handled.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** The same thing as text. Sending only HTML reads as spam to most filters. */
function buildText(opts: {
  name: string
  replyTo?: string
  body: string
  sentAt: string
}): string {
  return [
    'NEW MESSAGE FROM THE CONTACT PAGE',
    '',
    `From:  ${opts.name}`,
    `Email: ${opts.replyTo ?? 'not given'}`,
    `Sent:  ${opts.sentAt}`,
    '',
    '----------------------------------------',
    '',
    opts.body,
    '',
    '----------------------------------------',
    '',
    'Saved in the Messages tab of the dashboard as well.',
  ].join('\n')
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

  const name = record.name?.trim() || 'Someone'
  const replyTo = record.email?.trim() || undefined

  const sentAt = new Date(record.created_at ?? Date.now()).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Los_Angeles',
  })

  // A subject that says who and what. "Contact form submission" tells you
  // nothing you did not already know from the sender.
  const preview = record.body.replace(/\s+/g, ' ').trim()
  const subject = `${name}: ${preview.length > 60 ? `${preview.slice(0, 57)}...` : preview}`

  const content = { name, replyTo, body: record.body, sentAt }

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
      subject,
      html: buildHtml(content),
      text: buildText(content),
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
