# RemitBridge Systems Lab — handoff

Everything needed to pick this up cold. `CLAUDE.md` is the companion: this file
is what exists, that one is how to work on it.

Last updated 2026-08-16.

---

## 1. What this is

A student research lab's public site, arguing one thing: cross-border transfers
cost more than the receipt says, mostly through the exchange rate, and families
lose real money to the gap. Everything on the site either evidences that claim
or helps somebody act on it.

The site's governing rule is that **claims travel with their evidence**. Several
pages exist mainly to keep that promise: `/sources` lists every statistic and
every place it is used, `/impact` says what has actually been measured and what
has not. Pages say "not measured yet" rather than showing a plausible number.

**Live:** https://remit-bridge-system-labs-website-theta.vercel.app
**Repo:** GitHub, `main` is production. Vercel deploys on push.

---

## 2. Running it

```bash
npm install
npm run dev        # vite, port 3000 via .claude/launch.json
npm run build      # production build
npm test           # 27 receipt-maths tests
```

`.env.local`, gitignored, needs exactly two values:

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The publishable key is public by design; RLS policies are the security boundary.
The **service_role key must never** be in the repo, the bundle, or a chat.
Edge functions read it from Supabase's own injected env.

The site degrades rather than dying without a backend: public pages work, auth
and the dashboard do not, and `fx.js` falls through to Frankfurter directly.

---

## 3. Stack and layout

React 18, Vite 5, Tailwind v4 (`@theme inline`), shadcn/ui `radix-nova` in JSX,
react-router-dom 7, Supabase (Postgres + auth + storage + edge functions),
Vercel. Vitest is the only dev dependency added.

```
src/
  routes.js            single source of truth for nav — header, footer, home index
  App.jsx              routes; add here AND to routes.js
  components/
    Layout.jsx         backdrop, navbar, skip link, per-page <title>, scroll reset
    Backdrop.jsx       tiled bridge SVG + pointer light; onDark for green bands
    Section.jsx        Section / Container / PageHeader / DisplayTitle / FeatureBand
    TwoHundred.jsx     the $200 breakdown, plain list (scroll version removed)
    truecost/          ReceiptChecker.jsx, SavedChecks.jsx
    dashboard/         Inbox, People, Applications, Panels, PostEditor, ...
  lib/
    fx.js              rate resolution: table -> edge function -> Frankfurter
    receipt.js         pure cost maths (+ receipt.test.js, 27 tests)
    savedChecks.js     localStorage archive for TrueCost
    auth.jsx           session, role ranks, assignableRoles
    markdown.jsx       safe renderer, builds React elements, no innerHTML
    resizeImage.js     canvas downscale to 2000px WebP before upload
    useInView.js       scroll reveal + count-up
  data/
    figures.js         every statistic + sources + citations. The spine.
    measures.js        the six things the lab measures; mostly null by design
    corrections.js     public corrections log; empty
    corridors.js       Phase 2 provider prices; deliberately empty, shape settled
    glossary.js        18 terms + six planned languages, consent-gated
    posts.js/blog.js   blog content
supabase/
  schema.sql           canonical and re-runnable. The source of truth.
  migrations/          incremental, applied with `supabase db push`
  functions/fx/        rate proxy + cache
  functions/notify-message/   contact form email via Resend
  functions/README.md  full setup for both functions
  set-owner.sql        GITIGNORED. Contains the owner's email.
```

---

## 4. Pages

**Tools** — `/truecost` check a receipt, with a saved-checks archive ·
`/fair-rate` mid-market rate now, with a markup slider · `/reckoner` a year of
sending versus the benchmarks · `/rate-history` day-by-day corridor chart from
our own records · `/scam-check` FTC/CFPB warning signs · `/coming-soon`

**Reading** — `/blog` (30 planned, 0 written) · `/papers` (one, drafting)

**Community** — `/workshops` (none running yet, says so) · `/glossary` ·
`/fellowships`

**About** — `/leadership` · `/impact` (What we measure) · `/contact` ·
`/sources`

**Auth** — `/sign-in`, `/sign-up`, `/dashboard`, `/account`

`/remitbench` currently holds the **blockchain throughput testbed** and is the
subject of the one research paper. See section 8.

---

## 5. Database

`supabase/schema.sql` is canonical and re-runnable; migrations are incremental.
Both are applied with `npx supabase db push`.

| Table | Purpose | Public access |
|---|---|---|
| `profiles` | users, role, directory opt-in | own row or staff |
| `messages` | contact form | insert only, rate limited |
| `fellowship_applications` | applications + review trail | own row or staff |
| `posts` | blog, draft/review/published | published only |
| `fx_rates` | mid-market rate cache | **select only**, writes are service role |
| `app_config` | owner email, notify url/secret | none |

Role ladder: `owner` 5 · `admin` 4 · `editor` 3 · `writer` 2 · `member` 1.
Only ranks strictly below your own can be changed, never your own row.

Storage: `post-images`, public bucket, 5MB cap, MIME allowlist. Uploads land in
a folder named for the uploader, which is what makes the delete policy work.

**Verified refusals** (re-run these after touching policies):

```bash
# forged handled, backdated created_at, sixth message in a minute  -> 401
# anon insert/update/delete on fx_rates                            -> 401
# applicant self-accepting an application                          -> 401
```

---

## 6. Edge functions

**`fx`** — one mid-market rate. Reads the cache, else fetches the **whole base
currency for that day** in a single upstream call (~165 pairs) and stores it.
Works today with no key using Frankfurter. Setting `EXCHANGERATE_API_KEY`
switches it to a live provider with no code change and no site redeploy.
Public and unauthenticated; input is bounded to a three-letter pair and a date
within ten years, which is the quota guard.

**`notify-message`** — emails the lab on a new contact message, fired by a
database webhook. Verifies `x-webhook-secret` against `WEBHOOK_SECRET`, escapes
all user input, sends table-layout HTML plus a plain-text alternative.

Secrets, all set with `npx supabase secrets set` and never pasted into a chat:
`RESEND_API_KEY`, `NOTIFY_TO`, `WEBHOOK_SECRET`, optionally `NOTIFY_FROM` and
`EXCHANGERATE_API_KEY`.

Deploy: `npx supabase functions deploy <name> --no-verify-jwt`

---

## 7. Things that will bite

- **`npm run build` does not catch an undefined component.** A missing import
  passed the build and took a page down at runtime. Drive the page.
- **Prettier will reformat the repo** to semicolons and double quotes. House
  style is neither. Do not run it broadly.
- **`pg_net` is `net.http_post`, not `extensions.net_http_post`.** Getting this
  wrong once made the contact form silently never send while appearing fine,
  because a catch-all swallowed the error. Failures are now recorded in
  `app_config`.
- **Probing with the wrong endpoint reads as a missing resource.** A bucket was
  reported missing twice when it existed, because the probe used a path `anon`
  cannot reach. Discriminate by error type.
- **The embedded browser throttles rAF** when nothing paints, and in some
  contexts the document scrolls while zero scroll events fire and
  IntersectionObserver stays silent. Both have produced false diagnoses here.
  The second one was real and shipped a fix.
- **World Bank RPW terms** require the attribution string in `corridors.js`
  wherever the data appears, and forbid implying endorsement.

---

## 8. RemitBench: blocked on four decisions

Angad's research question is a **consumer price-comparison and behaviour**
study: can a verified comparison tool showing full cost, delivery time and
amount received reduce what families pay? The page currently at `/remitbench` is
a **blockchain throughput testbed** measured in TPS and latency. Different
discipline, different data, same name. That mismatch is the thing to fix.

Nothing should be built until these are answered:

1. **Data source.** World Bank RPW is the real option: firm-level fees, FX
   margins and speed across 48 sending and 105 receiving countries, free, but it
   needs an access-request form and arrives as quarterly Excel, so prices are
   months old. Alternatives: a live API overlay where one exists, students
   pricing a few corridors by hand, or building the shell and shipping it empty.
2. **Ranking.** `/workshops` promises "no company recommended". A chart headed
   "best value" is a recommendation. Sort cheapest-first as a fact about price,
   rank plainly and reword the promise, or a neutral sortable table.
3. **The testbed.** Move it to its own page, keep the RemitBench name on it and
   name the new tool something else, or fold it into Coming soon.
4. **Scope.** Public tool only, public tool instrumented for a later study, or
   the randomised instrument itself — which needs human-subjects review before
   any real participant, especially with minors running the lab.

Recommended if a tie-break is ever needed: RPW, cheapest-first without the word
"best", testbed moves to its own page, public tool only for now.

---

## 9. Also outstanding

- `data/measures.seed.md` — five of six measures on `/impact` ship `null` until
  the lab supplies real values with collection dates.
- `corridors.js` — empty by design; the benchmark markers on TrueCost render
  only when it is populated.
- Glossary translations — six languages listed, all "no reviewer yet". A column
  publishes only when a named speaker consents in writing.
- Blog — 30 planned, 0 written. The page says so.
