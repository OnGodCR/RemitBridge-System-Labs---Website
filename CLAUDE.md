# RemitBridge Systems Lab

Student-led research site about what cross-border payments actually cost.
React 18 + Vite 5 + Tailwind v4 + shadcn/ui (`radix-nova`, JSX), Supabase for
auth and data, deployed on Vercel.

`HANDOFF.md` is the companion to this file: what exists, how to run it, and
where every moving part lives. This file is how to work on it.

## Talking to Angad

Start every reply with `hi, angad`.

End every reply with the open items below, as a short checklist showing what is
done and what is not. Every message, not just the ones where it comes up. The
list is short on purpose; if it stops being short, that is worth saying.

## Open items

Deferred by choice, not forgotten. Update this list as things land.

- [ ] **Blog posts carry no publication date**, so the BlogPosting markup
      omits `datePublished`. Real dates in `posts.js` would complete it. Not
      invented, for the same reason no other number here is.
- [ ] **The prerender covers the head, not the body.** A crawler that does not
      run JavaScript gets correct tags and an empty `#root`. Google renders JS
      and indexes the text, so this is a real but second-order gap. Fixing it
      properly means server rendering.
- [ ] **RemitBench needs four decisions** before it can be rebuilt as the
      provider comparison tool. Asked several times, not yet answered, and
      nothing should be built until they are. See `HANDOFF.md`.
- [ ] **One figure per section is the standing rule for blog posts**, set
      2026-08-21. Posts 2 and 7 both meet it. Post 2's corridor map and post
      7's hero row were dropped rather than built: the sections they were
      planned for already carry a figure each.
- [ ] **`data/measures.seed.md`.** Five of the six measures on What we measure
      ship `null` until the lab supplies real collected values with dates.
- [ ] **Phase 2 corridor data.** `src/data/corridors.js` is the interface and
      is deliberately empty. Populating it is the same World Bank access
      request the RemitBench decision turns on.
- [x] Per-page search and social metadata. Every page ships its own title,
      description, canonical, og:/twitter: and JSON-LD, from one table in
      `src/lib/seo.js`, applied at runtime by `lib/head.js` and baked into 47
      real HTML files at build time. `sitemap.xml` and `robots.txt` are
      generated. This closes the old "social previews show the site-wide
      title" item: a link to any page now previews as that page.
- [x] Email notifications on contact messages. Resend key and database webhook
      are live and verified: function returns 200 and the email arrives.
- [x] Blank page on navigation. Root cause found by resolving the minified
      stack against a byte-identical rebuild: a `useEffect` returning a
      non-function. Fixed in `Layout.jsx`; Angad confirmed the white pages are
      gone.
- [x] Supabase schema and `set-owner.sql` run and verified against the live
      project.
- [x] `post-images` bucket, public, MIME allowlist, three policies. Anon upload
      refused by RLS.
- [x] Contact address set to remitbridgesystemlabs@gmail.com.
- [x] og: URLs built from the Vercel production domain at build time.
- [x] Vercel Web Analytics enabled. Speed Insights deliberately not used.
- [x] Personal email removed from tracked files. It remains in the root commit
      `b4c8316` on GitHub; Angad chose to leave it rather than force-push.

## Git and deploys

Commit and push without asking. Standing permission, given 2026-08-12, applies
to this repository going forward rather than to a single change. The same
applies to `supabase db push` and `supabase functions deploy`.

Force-pushes and history rewrites still need an explicit yes.

Still holds:

- Never commit `.env.local`. `.gitignore` covers it via `.env.local` and
  `*.local`; check before adding anything new that holds a key.
- The Supabase **service_role / secret key** never enters this repo, this
  conversation, or the browser bundle. Only the publishable key, which is public
  by design. Edge functions read it from the platform's own env, which is fine.
- Never ask Angad to paste an API key into the chat. `supabase secrets set`
  sends it straight to Supabase without it passing through here.
- Branch before pushing anything experimental. Routine work goes to `main`.

Commit messages explain **why**, in prose, including what was tried and failed.
They are the project's memory. Do not claim a change the diff does not contain:
that happened once and had to be corrected publicly.

## Facts and figures

Every statistic on the site is checked against a real source and recorded in
`src/data/figures.js`, with the exact place it is used listed in `citations`
and rendered by `src/pages/Sources.jsx`. Do not invent statistics, findings, or
published papers. If a number cannot be sourced, say so on the page instead.

**Using a figure somewhere new means adding that place to its `usedOn` list.**
That is the whole point of the sources page.

Current figures come from the World Bank Remittance Prices Worldwide, KNOMAD,
and UN SDG 10.c. `derived.annualOverpayUsdBn` is the lab's own arithmetic and is
labelled as such.

Three rules the data files enforce in code, not by convention:

- A value and its collection date travel together or neither renders
  (`measures.js` strips a dated-less value rather than trusting an editor).
- Zero is a measurement. It renders as `0`, never as a dash or a blank.
- A person's name appears only with a recorded consent date (`Leadership.jsx`
  advisors, `glossary.js` language reviewers). No date, no name.

Definitions in `glossary.js` carry no statistics on purpose: a number belongs in
`figures.js` with a source, not inside prose that will be translated six times
and drift.

## Access and security

There is exactly one owner: the address in the `owner_email` row of
`public.app_config`, set by the gitignored `supabase/set-owner.sql`. Do not put
that address in any tracked file, and do not reintroduce it as a literal in
`schema.sql`. Signing up grants `member`, which can apply for a fellowship and
nothing else. Writing access comes from being accepted.

Role ladder, by rank: `owner` 5, `admin` 4, `editor` 3, `writer` 2, `member` 1.
Someone can only change a role strictly below their own, and never their own.

Roles are enforced by row-level security policies, not by the frontend. Hiding a
control in the UI is a convenience; the policy is the thing that holds. When
adding a feature that reads or writes data, **write the policy first**.

Two lessons paid for the hard way, both the same shape. An insert policy must
pin every column the submitter should not choose:

- `messages` let a sender set `handled: true` or backdate `created_at`.
- `fellowship_applications` let an applicant set `status: 'accepted'` and land
  in the accepted pile of the review dashboard, or forge `reviewed_by`.

Neither was reachable from the site's own forms. Both were one `curl` away with
the publishable key. **Test policies with curl, not with the UI.**

Public write paths need a rate limit. `messages` allows five a minute
site-wide, counted by a `security definer` function because `anon` cannot select
from the table and would otherwise count zero.

## Rates and data

`src/lib/fx.js` resolves a rate through three paths, in order: the public
`fx_rates` table read straight from Postgres (~400ms), the `fx` edge function on
a miss (~1.4s, fills the whole base currency for that day), then Frankfurter
direct if the backend is unreachable.

The unit of work is a **base currency and a day, not a pair**: both providers
return every quote for a base in one request, for past days too, so one call
stores ~165 pairs. That is why there is no cron. A past day is never refetched.

Which source answered travels with every rate, and the page names it. A page
that credits one source while showing another's number is exactly the unchecked
claim this site argues against.

## Conventions

- `src/routes.js` is the single source of truth for navigation. A page added
  there appears in the header, the footer and the home index at once.
- Colour alternates strictly between white and mint green, section by section.
  No third accent colour.
- **No pill labels.** Status is small caps plus a filled or hollow dot; tags are
  a plain line of text. Buttons keep their shape, because a button should look
  pressable. The `Pill` helper was deleted on purpose.
- Green bands render `<Backdrop onDark fadeClass={null} />` inside a
  `relative overflow-hidden` section, with the content in a `relative`
  container. The site backdrop is fixed at `-z-10` and any painted surface
  covers it.
- Several pages deliberately have no standing `PageHeader`: the honest thing
  the page has to say opens it instead. Contact, Workshops, Coming soon,
  Research papers, Leadership.
- No em-dashes in site copy.
- Comments explain why a thing is the way it is, especially where the obvious
  approach was tried and failed. They are not narration.
- Prettier will reformat to semicolons and double quotes if run. House style is
  no semicolons, single quotes. Do not run it across the repo.

## Verifying

Nothing ships on "the build passed". `npm run build` does not catch an
undefined component, which took a page down once.

- Drive the real page in the browser and read state back out of the DOM.
- Check 320px for overflow on anything new.
- Test database policies with curl against the live project, both the refusal
  and the success.
- `npm test` runs 27 receipt-maths tests, including invariants.

Three environment quirks have produced false negatives here, all worth
remembering before diagnosing a bug that is not there. The embedded browser
throttles `requestAnimationFrame` when nothing paints. In some contexts the
document scrolls while **zero** scroll events fire and IntersectionObserver
stays silent; that one is real and shipped a fix. And `vite preview` serves the
SPA fallback for `/truecost` rather than `dist/truecost/index.html`, so the
prerendered pages look broken there and are not: ask for `/truecost/` with the
trailing slash, or read the file.
