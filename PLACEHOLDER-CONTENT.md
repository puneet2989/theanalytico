# PLACEHOLDER-CONTENT.md — launch checklist

**Current mode: LOCAL PREVIEW ONLY. This site must not be published in its current state.**

Every fabricated fact, provisional URL, and preview-mode gate in the project is listed here. Work top to bottom. The site is not ready to publish until every row is signed off.

Three items in section 1 block publication on their own. Everything else degrades quality; those three cause real damage if missed.

## How to use this file

1. Find every marked item in the codebase with these two commands:
   - `grep -rn 'data-placeholder="true"' *.html`
   - `grep -rn 'PLACEHOLDER:' *.html *.txt *.xml *.toml _headers _redirects`
   - `grep -rn 'EVIDENCE NEEDED' .`
2. Every match must appear as a row below. A match with no row is a review failure.
3. When an item is resolved, delete both the marker and the row. Do not tick and leave.

---

## 1. Blocks publication

| # | Item | Files | Action at launch |
|---|---|---|---|
| 1.1 | `<meta name="robots" content="noindex, nofollow">` | `index.html`, `services.html`, `work.html`, `insights.html`, `about.html`, `contact.html` | Delete the tag from all six pages. Verify with `grep -c noindex *.html` returning 0. |
| 1.2 | `X-Robots-Tag: noindex, nofollow` under the `/*` block | `_headers` | Delete the line from the `/*` block. Keep the `X-Robots-Tag: noindex` on `/api/*`, that one is permanent. |
| 1.3 | `Disallow: /` | `robots.txt` | Replace the preview block with the launch block in spec 09 section 6: `Allow: /` plus `Disallow: /api/`. Keep the `Sitemap:` line. |
| 1.4 | **Third-party video used as the hero reel** | `assets/video/reel-teaser-sm.mp4`, `.webm`, `reel-teaser-poster.webp`, and the two `<video>` elements in `index.html` | These files are UpSunday's own showreel, downloaded from `upsunday.co`. They are not licensed to TheAnalytico. Replace with original footage before publication, and re-encode the poster from the replacement. Using them publicly is copyright infringement, not a placeholder. |
| 1.5 | `pages_build_output_dir = "."` | `wrangler.toml` | Publishing from the repository root would serve `docs/`, `.claude/`, `CLAUDE.md`, `AGENTS.md`, `mocks/` and this checklist to the public. Restrict the published output before any production deploy. |

These rows exist because one gate is easy to miss. Removing only some of them leaves the site either uncrawlable, accidentally indexed, or publishing files and footage that must not be public.

---

## 2. Domain and URLs

Every occurrence of `theanalytico.com` is a guess. `[EVIDENCE NEEDED: production domain for TheAnalytico]`

| # | Item | Files | Action at launch |
|---|---|---|---|
| 2.1 | Canonical URLs, six of them | all six `.html` files | Replace the host in every `<link rel="canonical">`. Home keeps its trailing slash. The other five stay extensionless. |
| 2.2 | `og:url`, six of them | all six `.html` files | Replace the host. Must stay byte-identical to the canonical on the same page. |
| 2.3 | `og:image` and `twitter:image` | all six `.html` files | Replace the host. Must remain an absolute `https` URL. |
| 2.4 | `sitemap.xml` `<loc>` values, six of them | `sitemap.xml` | Replace the host in all six. Update `<lastmod>` to the launch date. |
| 2.5 | `Sitemap:` directive | `robots.txt` | Replace the host. |
| 2.6 | Canonical host redirect | `_redirects` | Replace both hosts in the `www` to apex rule. Confirm the direction matches the canonical tags. |
| 2.7 | JSON-LD `@id` and `url` values on all six pages | all six `.html` files | Replace the host in every `@id`, `url`, `image`, and `logo` value. The `@id` on the business node is referenced from five other pages, so all six must match exactly. |

Verification after 2.1 to 2.7: `grep -rn "theanalytico.com" .` returns zero matches.

---

## 3. Business facts still missing

| # | Item | Marker | Files | Action at launch |
|---|---|---|---|---|
| 3.1 | Business email address | `[EVIDENCE NEEDED: business email]` | `index.html` footer and CTA, `services.html` CTA, `work.html` CTA, `insights.html` CTA, `about.html` location section and CTA, `contact.html` details column and CTA | Get the address from the client. Add it to the footer and the contact details column. Add `email` to the `ProfessionalService` JSON-LD on `index.html` and to `contactPoint` on `contact.html`. Set `CONTACT_TO_EMAIL` in the Cloudflare Pages dashboard. |
| 3.2 | Street address | `[EVIDENCE NEEDED: street address]` | `about.html`, `contact.html` | Only add if a public premises exists. If it does, add `streetAddress` to the JSON-LD `PostalAddress`. If the business is home-based, leave it out permanently and delete this row. |
| 3.3 | Postcode or Eircode | `[EVIDENCE NEEDED: postcode]` | `about.html`, `contact.html` | Same rule as 3.2. Only add alongside a real street address. |
| 3.4 | Opening hours | `[EVIDENCE NEEDED: opening hours]` | `about.html`, `contact.html` | Add to the contact details column and add `openingHoursSpecification` to the JSON-LD. If there are no fixed hours, leave it out and delete this row. |
| 3.5 | Company registration number | `[EVIDENCE NEEDED: company registration number]` | `index.html` footer, `about.html` | Check whether Irish law requires it on the site for this entity type. If yes, add to the footer. If no, delete this row. |
| 3.6 | Founding year | unconfirmed, no marker because nothing was written | `about.html` | If confirmed, add a line to the About intro and `foundingDate` to the JSON-LD. If the client prefers not to state it, delete this row. |
| 3.7 | Team names, roles, headshots | `[EVIDENCE NEEDED: team member names, roles, and headshots]` | `about.html` section 6 | Either populate the team section with real names, real roles, and real photographs, or delete the entire `#team` section. Do not publish the placeholder sentence. See row 5.6. |
| 3.8 | Social profile URLs | `[EVIDENCE NEEDED: social profile handles]` | `index.html` footer, all six heads | If profiles exist, add footer links and add `sameAs` to the `ProfessionalService` JSON-LD. Add `twitter:site` only if a real handle exists. If none exist, delete this row and leave the footer as is. |

---

## 4. Portfolio

| # | Item | Files | Action at launch |
|---|---|---|---|
| 4.1 | KC Accountants URL is `https://kc-accountant.puneetcf.workers.dev` | `index.html` work card, `work.html` case study visit link and JSON-LD `CreativeWork` url | The client approved this URL for now, so it may ship. Replace with the production domain when it exists. Update all three occurrences together. `[EVIDENCE NEEDED: KC Accountants production domain]` |
| 4.2 | SodoLT hosting provider recorded only as `Third-party WordPress hosting` | `work.html` SodoLT facts `<dd>` | Confirm the provider name with the client, then either name it or keep the generic wording and delete the placeholder attribute. `[EVIDENCE NEEDED: SodoLT hosting provider name]` |
| 4.3 | Case study screenshots not yet captured | `assets/img/work/ardlens-card.webp`, `ardlens-full.webp`, `kc-accountants-card.webp`, `kc-accountants-full.webp`, `sodolt-card.webp`, `sodolt-full.webp` | Install a headless browser. Capture each homepage from its live URL. Export as `webp` at 800×600 and 1600×1000. Replace every placeholder image and remove the marking from the wrapping figures. |

Permanent rules that survive launch, restated so they are not lost:

- Never add a traffic, ranking, revenue, lead-count, or conversion-rate figure to any of the three projects. No analytics evidence exists.
- Never attribute a quote to ArdLens, KC Accountants, or SodoLT.
- Never reference the `rmyf` project. It is unpublished and excluded from the portfolio.
- Never name a fourth client or imply one exists.

---

## 5. Fabricated visible content

Every row here is invented and must be replaced or deleted before publication.

| # | Item | Spec | Target page and location | Action at launch |
|---|---|---|---|---|
| 5.1 | KPI: `+42%` organic sessions in six months | `docs/specs/02-home.md` §9 | `index.html`, `#results`, KPI 2 | Replace with a real figure from Search Console or GA4 for a named client, with their permission, or delete the KPI. |
| 5.2 | KPI: `1.2s` average largest contentful paint | `docs/specs/02-home.md` §9 | `index.html`, `#results`, KPI 3 | Measure LCP across the three live sites. Replace with the real average or delete the KPI. |
| 5.3 | KPI: `98` average Lighthouse performance score | `docs/specs/02-home.md` §9 | `index.html`, `#results`, KPI 4 | Run Lighthouse on the three live sites. Replace with the real average or delete the KPI. |
| 5.4 | KPI disclaimer line: `Preview figures. Real measurements replace these before launch.` | `docs/specs/02-home.md` §9 | `index.html`, `#results` | Delete this line once 5.1 to 5.3 are resolved. |
| 5.5 | Three testimonials: `Aoife M., Practice Owner, Accountancy`, `Declan R., Owner, Wellness`, `Niamh K., Director, Creative Services` | `docs/specs/02-home.md` §10 | `index.html`, `#testimonials`, three carousel slides | Replace with real testimonials, with written permission from each client, or delete the entire `#testimonials` section and remove `peek-carousel.js` from `main.js`. No headshots unless the client supplies their own photograph. |
| 5.6 | Team placeholder sentence: `A small team working directly with each client, with no account manager in between.` | `docs/specs/06-about.md` §8 | `about.html`, `#team` | Populate with real people, or delete the entire `#team` section. Default action if the client supplies nothing: delete the section. |
| 5.7 | Services FAQ answer about pricing: `It depends on scope. Book a short call and you will get a figure in writing.` | `docs/specs/03-services.md` §11 | `services.html`, `#faq`, question 6 | Confirm the client's actual pricing process. Either rewrite to match it, add real pricing bands, or delete the question. |
| 5.8 | Contact "what happens next" three steps | `docs/specs/07-contact.md` §6 | `contact.html`, `#next` | Confirm with the client that this is their actual enquiry process. Rewrite to match reality, then remove the marking. |
| 5.9 | Insight post publication dates: `August 2026`, `August 2026`, `July 2026`, `July 2026`, `June 2026`, `June 2026` | `docs/specs/05-insights.md` §6 | `insights.html`, featured post and post grid | Replace with the real publication date of each post. Update every `<time datetime>` attribute to match. |
| 5.10 | Insight post read times: `5 min read`, `6 min read`, `7 min read`, `5 min read`, `6 min read`, `6 min read` | `docs/specs/05-insights.md` §6 | `insights.html`, all six posts; `index.html`, `#insights`, three cards | Calculate from the drafted word count at roughly 220 words per minute. Replace or delete. |
| 5.11 | Insight post links all point at `#` | `docs/specs/05-insights.md` §6 | `insights.html`, all six posts; `index.html`, `#insights`, three cards | Write the six posts, create the post pages, then point each link at its real URL. Add `Article` JSON-LD to each post page at that point, per `CLAUDE.md`. Add the six post URLs to `sitemap.xml`. |
| 5.12 | Topic chips are plain text, not links | `docs/specs/05-insights.md` §7 | `insights.html`, `#topics` | Build category archive pages, then convert the four `<li>` items to links. Or delete this row and leave them as text permanently. |
| 5.13 | Home insights cards all link to `/insights` | `docs/specs/02-home.md` §11 | `index.html`, `#insights` | Point each of the three cards at its real post URL once 5.11 is resolved. |

---

## 6. Configuration placeholders

| # | Item | Files | Action at launch |
|---|---|---|---|
| 6.1 | Turnstile site key, using the Cloudflare test key `1x00000000000000000000AA` | `contact.html`, `[data-turnstile-slot]` widget div | Create a Turnstile widget in the Cloudflare dashboard. Replace `data-sitekey`. The site key is public and may stay in the HTML. `[EVIDENCE NEEDED: Turnstile site key]` |
| 6.2 | `TURNSTILE_SECRET_KEY` not set | Cloudflare Pages dashboard | Set as an encrypted environment variable. Never commit it. |
| 6.3 | `RESEND_API_KEY` not set | Cloudflare Pages dashboard | Set as an encrypted environment variable. Never commit it. |
| 6.4 | `CONTACT_FROM_EMAIL` not set | Cloudflare Pages dashboard | Verify a sending domain in Resend first, then set this. `[EVIDENCE NEEDED: verified sending domain for Resend]` |
| 6.5 | `CONTACT_TO_EMAIL` not set | Cloudflare Pages dashboard | Depends on row 3.1. Set once the business email exists. |
| 6.6 | KV namespace id is the literal `REPLACE_WITH_KV_NAMESPACE_ID` | `wrangler.toml` | Create a KV namespace named for rate limiting. Paste its id. Without it the Function skips rate limiting silently, which is not a hard failure but leaves the form open to abuse. `[EVIDENCE NEEDED: KV namespace id for RATE_LIMIT]` |
| 6.7 | No privacy policy page exists | `contact.html`, `#faq` answer 3 | Write a privacy policy. Create `/privacy`. Link it from the contact FAQ and the footer. Add it to `sitemap.xml`. `[EVIDENCE NEEDED: privacy policy page]` |

---

## 7. Pre-publication verification

Run every check. All must pass.

| # | Check | Command or method |
|---|---|---|
| 7.1 | No placeholder markup remains | `grep -rn 'data-placeholder' *.html` returns nothing |
| 7.2 | No placeholder comments remain | `grep -rn 'PLACEHOLDER:' .` returns nothing |
| 7.3 | No evidence markers remain | `grep -rn 'EVIDENCE NEEDED' .` returns nothing |
| 7.4 | No noindex meta tags remain | `grep -rn 'noindex' *.html` returns nothing |
| 7.5 | No noindex header on `/*` | `grep -n 'X-Robots-Tag' _headers` shows the `/api/*` block only |
| 7.6 | `robots.txt` allows crawling | contains `Allow: /` and does not contain `Disallow: /` on its own line |
| 7.7 | No placeholder domain remains | `grep -rn 'theanalytico.com' .` returns nothing, assuming the real domain differs |
| 7.8 | No fake review schema | `grep -rn 'aggregateRating' *.html` returns nothing |
| 7.9 | No fake review schema | `grep -rn '"review"' *.html` returns nothing |
| 7.10 | No secrets committed | `grep -rnE 're_[A-Za-z0-9]|0x4[A-Za-z0-9]{20,}' . --exclude-dir=.git` returns nothing |
| 7.11 | No `rmyf` reference | `grep -rni 'rmyf' *.html` returns nothing |
| 7.12 | Every canonical matches its `og:url` | manual diff, six pairs |
| 7.13 | Every `sitemap.xml` `<loc>` returns HTTP 200 | `curl -sI` each of the six URLs |
| 7.14 | Contact form delivers a real email | submit the live form, confirm arrival, confirm `reply_to` is correct |
| 7.15 | Turnstile rejects a submission with no token | POST to `/api/contact` with no `cf-turnstile-response`, expect 403 `turnstile_failed` |
| 7.16 | Rate limiting fires | submit six times from one IP within an hour, expect 429 on the sixth |
| 7.17 | Lighthouse 95 or above, four categories, six pages | 24 scores, all passing, on a mobile profile |
| 7.18 | CLS below 0.05 on all six pages | Chrome DevTools performance panel, mobile throttled |
| 7.19 | Every page renders fully with JS disabled | disable JS, load all six pages, confirm no hidden content |
| 7.20 | Every page renders correctly with `prefers-reduced-motion: reduce` | emulate in DevTools, confirm KPI counters show final values and the carousel still works |
| 7.21 | Rich Results Test passes on all six pages | Google Rich Results Test, zero errors, zero warnings about missing recommended fields that we deliberately omit |
| 7.22 | Submit `sitemap.xml` to Search Console | after 1.1 to 1.3 and section 2 are complete, not before |

---

## 8. Permanent rules

These are not checklist items. They never expire.

1. No `AggregateRating` in JSON-LD until real, verifiable ratings exist.
2. No `review` in JSON-LD until real, permitted reviews exist.
3. No invented quote attributed to a real named client.
4. No traffic, ranking, revenue, or conversion claim without analytics evidence attached.
5. No stock photograph presented as a client, a team member, or an office.
6. No award claim. The client confirmed there are none.
7. No reference to the `rmyf` project.
8. Every new fabricated fact added during preview must be marked with all four requirements from `CLAUDE.md` and added to this file in the same commit.
9. British English in all user-facing copy.
10. No analytics or tracking script, so no cookie banner is required. Adding one implies tracking that does not happen.
