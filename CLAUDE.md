# RemitBridge Systems Lab

Student-led research site about what cross-border payments actually cost.
React 18 + Vite 5 + Tailwind v4 + shadcn/ui (`radix-nova`, JSX), Supabase for
auth and data, deployed on Vercel.

## Talking to Angad

Start every reply with `hi, angad`.

End every reply with the open items below, as a short checklist showing what is
done and what is not. Every message, not just the ones where it comes up. The
list is short on purpose; if it stops being short, that is worth saying.

## Open items

Deferred by choice, not forgotten. Update this list as things land.

- [ ] **Re-run `supabase/schema.sql`, then `supabase/set-owner.sql`.** The
      database still has the old `owner_email()` with the address as a literal
      and no `app_config` table.
- [ ] **Create the `post-images` storage bucket** (public) in the Supabase
      Storage tab. The SQL skips it when the editor lacks rights on
      `storage.objects`, so image upload in the post editor fails until it
      exists. Policies are in `schema.sql` to paste in.
- [ ] **Email notifications on contact messages.** Function and setup are
      written; needs a Resend key and a database webhook. See
      `supabase/functions/README.md`.
- [ ] **Real site URL** in the three `og:`/`twitter:` tags in `index.html`,
      once Vercel has a domain. They must be absolute or link previews break.
- [ ] **Real contact address** in `src/pages/Contact.jsx`, currently
      `hello@remitbridge.org`.
- [x] Vercel Web Analytics enabled. Speed Insights deliberately not used.
- [x] Personal email removed from tracked files. It remains in the root commit
      `b4c8316` on GitHub; Angad chose to leave it rather than force-push.

## Git

Commit and push without asking. Standing permission, given 2026-08-12, applies
to this repository going forward rather than to a single change.

Still holds:

- Never commit `.env.local`. `.gitignore` covers it via `.env.local` and
  `*.local`; check before adding anything new that holds a key.
- The Supabase **service_role / secret key** never enters this repo, this
  conversation, or the browser bundle. Only the publishable key, which is public
  by design.
- Branch before pushing anything experimental. Routine work goes to `main`.

## Facts and figures

Every statistic on the site is checked against a real source and recorded in
`src/data/figures.js`, with the exact place it is used listed in
`src/pages/Sources.jsx`. Do not invent statistics, findings, or published
papers. If a number cannot be sourced, say so on the page instead.

Current figures come from the World Bank Remittance Prices Worldwide, KNOMAD,
and UN SDG 10.c. `derived.annualOverpayUsdBn` is the lab's own arithmetic and is
labelled as such.

## Access

There is exactly one admin: the address in the `owner_email` row of
`public.app_config`, set by the gitignored `supabase/set-owner.sql`. Do not put
that address in any tracked file, and do not reintroduce it as a literal in
`schema.sql`. Signing up grants `member`, which can apply for a fellowship and
nothing else. Writing access comes from being accepted.

Roles are enforced by row-level security policies, not by the frontend. Hiding a
control in the UI is a convenience; the policy is the thing that holds. When
adding a feature that reads or writes data, write the policy first.

## Conventions

- `src/routes.js` is the single source of truth for navigation. A page added
  there appears in the header, the footer and the home index at once.
- Colour alternates strictly between white and mint green, section by section.
  No third accent colour.
- No em-dashes in site copy.
- Comments explain why a thing is the way it is, especially where the obvious
  approach was tried and failed. They are not narration.
