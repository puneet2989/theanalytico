# TheAnalytico — project conventions

Marketing site for TheAnalytico, an agency selling **web design, SEO, paid advertising (Meta + Google), and AI services** to businesses worldwide. Dublin is the operating base (kept in structured data and contact details for local search), not the target market — visible copy should not read as Dublin/Ireland-only or "local business" scoped.

## Non-negotiables

- Static site. Plain HTML, CSS, vanilla JS. **No bundler, no framework, no npm build step.**
- Hosted on **Cloudflare Pages** (free tier). Server logic only via Pages Functions in `functions/`.
- Every page must pass Lighthouse **95+ on Accessibility, Best Practices, SEO** on mobile, and **92+ on Performance**.
  The Performance floor was 95 and moved to 92 on 12 Sep 2026, deliberately and with the client's agreement.
  Reason: the reference tier the client is targeting (`hobro.digital`, `unitedcarriers.com`) ships 22.3MB and 1.3MB of WebGL respectively; measured, not estimated. Matching that visual density lands at 90–95 however carefully it is built. A design agency scoring 92 and looking expensive beats one scoring 98 and looking like a template. See [docs/DESIGN-DIRECTION-v2.md](docs/DESIGN-DIRECTION-v2.md).
  92 is a floor, not a budget to spend down to. Accessibility, Best Practices and SEO stay at 95+ and are not negotiable.
- No inline `<style>` blocks and no inline `on*` handlers, except the critical-CSS block in `<head>` and the nav anti-flash script.
- British English in all user-facing copy.

## Design reference

Reference site: `https://www.upsunday.co/`. A 29-second screen recording lives in `examples/`.
Extract frames with the pip-installed static ffmpeg if visual comparison is needed; do not commit frames.

Their stack, confirmed by reading their bundle: Vite, **GSAP + ScrollTrigger**, **Lenis**, heavy `matchMedia` gating.
We copy the *motion vocabulary*, not their markup, copy, or assets.

## File layout

```
index.html  services.html  work.html  insights.html  about.html  contact.html
assets/
  css/tokens.css      design tokens only, no rules
  css/base.css        reset, typography, layout primitives
  css/components.css  nav, cards, buttons, carousel, footer
  css/pages.css       page-specific overrides
  js/main.js          entry, imports modules, gates on matchMedia
  js/modules/*.js     one effect per file, ES modules, named exports
  img/  fonts/  logo/
functions/api/contact.js
_headers  _redirects  robots.txt  sitemap.xml  wrangler.toml
examples/                          reference recording, never shipped
```

## Design tokens

**Monochrome chrome. Colour comes from the client work, never from the site's own furniture.** Decided 12 Sep 2026, replacing the earlier pastel palette. All four reference sites do this, and it resolves the five-competing-colour-systems problem the pastel rotation plus four card gradients had created. Define once in `assets/css/tokens.css`, never hardcode a hex elsewhere.

```css
--ink:        #1a1a1a;   /* body text, buttons, logo */
--ink-soft:   #6b6b6b;   /* secondary text, mono labels */
--ink-black:  #0a0a0a;   /* headings, dark sections */
--surface:    #ffffff;   /* light sections, cards */
--line:       #e3e3e3;
--accent:     #e5804b;   /* terracotta, the ONLY accent */
```

`--bg-blue`, `--bg-cream`, `--bg-grey`, `--accent-2` and the four `--gradient-*` service ramps are retired. Do not reintroduce them.

Sections alternate **white and near-black only**. The three portfolio captures supply every other hue on the page. `--accent` is reserved for a single job at a time (active nav state, primary CTA); it is not a decorative colour and must not appear more than twice per viewport.

Full-bleed is the default. Sections run edge to edge. `--container-max` applies to text columns, not to section backgrounds, and `--radius-section` is retired: the boxed-card-inside-a-boxed-section pattern is what made the old build read as a template.

Section intros are centred, not left-aligned — reversed 14 Sep 2026. Left-align was decided in-house on 12 Sep 2026 (centring every section's eyebrow/heading/lead was flagged as the most template-like habit in the stylesheet, see `docs/DESIGN-DIRECTION-v2.md`, "The blunt diagnosis"). The client has since overridden that call: every section intro across the site — index, services, work, insights, about, contact, and the three insight posts — is centred again via `.section--center` in `components.css`, which each of those sections' intro `.container` now carries. **Do not revert this to left-aligned on the assumption the 12 Sep decision still holds; it does not, for section intros specifically.** The scope is narrow and stays narrow: only the eyebrow, the heading, and the lead paragraph centre. Card grids, work items, process steps, KPI rows, the testimonial carousel, and long-form prose (`.post-body`, `.legal-body`) are left exactly as they are — `.section--center`'s own selectors use a direct-child combinator specifically so a nested `.eyebrow` inside a card (services.html's "After launch" maintenance card, for one) is never swept up by it. The home hero and work.html's showcase hero are excluded on purpose; neither uses this eyebrow/heading/lead pattern.

Type is a display tier (120px+ at 1440px for the page's largest element) and a monospace label tier (~12px, uppercase, `0.08em` tracking) carrying all metadata, with nothing filling the 18–22px prose gap between them. Clarified 14 Sep 2026: that gap is what this rule bans — an 18–22px tier doing explanatory work, which is what the reference sites conspicuously lack — not a second display-scale register used for genuine hierarchy. A composition can carry two large sizes (for example the home hero's pillar name at display scale and its h1 at a smaller middle register beneath it) provided both are still clearly display-scale type, not a paragraph tier wearing a bigger font.

Type scale is fluid, `clamp()` only, no media-query font sizes. Headings use negative tracking (`-0.03em`). Display weight may exceed 600 — the earlier "never 700+" rule is lifted, since every reference achieves the "large, tight, confident" feel partly through weight.

Section headings must bind to the type-scale tokens in `base.css`. `--fs-h2` was orphaned for the whole of the first build, which left every section heading smaller than the H3s nested inside it.

Spacing scale: 4 8 12 16 24 32 48 64 96 128 (px), exposed as `--s-1` … `--s-10`.

## Logo and header

Wordmark only — no monogram, no separate mark, no illustration. Inline SVG in `assets/logo/`, never an `<img>`, so it can animate and inherit `currentColor`.

- **Wordmark**: `the` / `analytico` stacked on two lines, lowercase, tight leading. This is the only logo asset, used in every header state including the compact pinned one — there is no fallback mark to shrink to.

Header has two states, driven by scroll position:

| State | Trigger | Appearance |
|---|---|---|
| `top` | `scrollY < 40` | Full-width bar, transparent, full-size stacked wordmark, nav links, `Contact Us` pill on the right |
| `pinned` | `scrollY >= 40` | Centred floating pill, max-width ~1120px, `backdrop-filter: blur(16px)`, wordmark scaled/condensed down, same nav |

Transition is a single GSAP timeline on width, radius, padding, background, and wordmark scale/opacity. Duration 0.45s, `power3.out`. It must not thrash layout: animate `transform` and `opacity`, plus `max-width` on the shell only.

## Motion rules

- One effect per module in `assets/js/modules/`. No cross-imports between modules.
- All motion is gated: skip entirely if `prefers-reduced-motion: reduce`, or if `matchMedia('(max-width: 768px)')` matches, unless the module explicitly declares mobile support.
- Lenis drives scroll; sync it to `gsap.ticker`, never a second RAF loop.
- Register `ScrollTrigger` once in `main.js`. Modules receive it as an argument.
- `will-change` only while an animation is live; remove it on complete.
- Never animate `width`, `height`, `top`, or `left`. Transform and opacity only, with the header shell as the single documented exception.
- Content must be readable with JS disabled. Reveal animations set their start state from JS, not CSS, so no-JS users see finished content.
- Scroll-tied story sequences (hero, major section transitions) are narrative progression, not ambient/constant motion: they advance as scroll advances and hold their end state once a sequence completes — no idle looping while the viewport sits still. This does not apply to discrete micro-interactions (hover states, cursor-follow) which remain interaction-driven as normal.

## Effect inventory to implement

1. Hero: type-only. Flat `--ink-black` background, white display type, no video, no canvas, no imagery of any kind. Retired 14 Sep 2026 after the full-bleed video hero (a scroll-scrubbed ink-in-water clip, before that a sprite-sheet chrome morph) failed on its third attempt at colour-correcting the footage: dense ink made the headline illegible, lifting the blacks to fix that made the footage look washed out and low quality, and the multiply blend needed to composite it under the header hid the wordmark at scroll 0. The actual defect was full-bleed imagery sitting behind text, not any one clip or encode — no amount of correcting the footage fixes that, so there is no footage.
   Hierarchy flipped 14 Sep 2026: the four-word pillar name (Web Design / SEO / Paid Advertising / AI Services) carries the most interesting content on the screen and is now the hero's largest element, display tier; the h1 dropped to a new middle register, `--fs-display-sub` (visual size is not heading level — it is still the document's one h1, one complete sentence). The pillar name transitions on scroll via a scrub-driven mask (mask out, mask in — not a fade, not a text swap), with an "01 / 04"–"04 / 04" index alongside it; the h1's own word-by-word reveal plays once on load instead (see item 2). A CSS/inline-SVG line-work layer (faint column rules with crosshairs, a single offset stroked circle, a hairline under the pillar name) sits behind the type, fully static, monochrome, aria-hidden. See `assets/js/modules/hero-headline.js`.
2. Kinetic headline: word-by-word clip-path reveal on the h1, playing once as it enters the first viewport rather than a fixed delay. Scrubbed motion in the hero belongs to the pillar-name transition instead (item 1) — tying the h1's own reveal to that same scrub left the hero blank until the user scrolled, tried and rejected 14 Sep 2026. Both live in one module, `hero-headline.js`, since the same day.
3. Headings (non-hero): clip-path mask rise, word-by-word stagger
4. Header: full bar → floating pill (see above)
5. Section curtain: rounded next-section slide over previous
6. Cursor: soft gradient blob, lerped follow, desktop only
7. Service cards: hover/enter-triggered inner motion (mockup slide, cycle, icon fan) — triggered, not self-running/ambient, per the narrative-progression motion rule
8. Work cards: image scale on hover, label chip slide-in
9. Peek carousel, drag plus arrow controls — testimonials (placeholder content in preview mode)
10. Process/capability cards: tilted at rest, rotate straight on enter
11. KPI counters: count up on enter (placeholder numbers in preview mode)
12. Insights grid: staggered fade-up
13. Lenis smooth scroll, desktop only

## Business facts

Confirmed by the client. These are the only business facts that may be stated as true.

| Field | Value |
|---|---|
| Name | TheAnalytico |
| Location | Rush, Co. Dublin, Ireland (no street address, no postcode — confirmed 15 Sep 2026, keep out of visible body copy per the worldwide positioning rule; schema and contact-details columns only) |
| Phone | 087-2520034 (`tel:+353872520034`) |
| Email | info@theanalytico.com |
| Opening hours | 09:00–17:00. **Assumption, flagged 15 Sep 2026**: the client gave times, not days. Stated on the site as Monday to Friday — confirm with the client and correct if wrong. |
| Reply time | Within 24 hours |
| Service area | Worldwide |
| Clients | Three shipped sites, named below |
| Awards | None |
| Social profiles | None exist |
| Founder | 10+ years in digital, SEO and paid media, including work delivered alongside another practitioner prior to this site. One-person operation — no team section on the site. |
| Company | Founded before this website existed; operated without a web presence until now |

### Still missing

Street address (none — see Location above), postcode, company registration number, founding year, team names/headshots (not applicable — one-person operation), a confirmed maintenance/care-plan price and SLA.

## Services

Four pillars. Each gets a full block on `services.html` and a card on `index.html`.

1. **Web Design** — design and build, responsive, fast, conversion-focused, **plus ongoing maintenance and care plans**. Maintenance is a real part of the business model and was missing from the site entirely; decided 12 Sep 2026 to fold it in here as an ongoing phase rather than give it a fifth pillar, so the four-pillar structure survives. It must be visible on `services.html`, not implied.
2. **SEO** — technical, on-page, local search
3. **Paid Advertising** — Meta and Google campaigns, setup and management
4. **AI Services** — five named capabilities:
   1. AI chatbots and 24/7 customer engagement
   2. AI-driven local SEO and Google Business Profile optimisation
   3. AI marketing automation across ads, email, and social
   4. Workflow and operations automation
   5. AI analytics and reporting

## Portfolio — real, verified live

Three shipped sites. All confirmed returning HTTP 200 on 13 Aug 2026. Client approved naming them publicly.

| Project | URL | Sector | Stack | Local source |
|---|---|---|---|---|
| ArdLens | `https://ardlens.com` | Aerial cinematography, coastal and heritage Ireland | Static + Cloudflare Worker contact form | `../ardlens` |
| KC Accountants | `[EVIDENCE NEEDED: production domain — only kc-accountant.puneetcf.workers.dev known]` | Accountancy practice, Ireland | Static + Cloudflare Worker contact form | `../accountant-website` |
| SodoLT | `https://sodolt.com` | In-home LinfoModellante massage therapy | WordPress | none — not built in this workspace |

`../rmyf` is an unpublished Next.js project. Excluded from the portfolio. Do not reference it.

Sector spread across film, professional services, and wellness supports a broad, sector-agnostic pitch rather than a single niche. Say what is verifiable: built, shipped, live, hosted on Cloudflare. Do not claim traffic lifts, rankings, or revenue results — no analytics evidence exists.

Case study screenshots go in `assets/img/work/`, captured from the live URLs. No headless browser is installed; install one before the capture step.

## Content rules

**Current mode: LAUNCHED. Live and indexable as of 15 Sep 2026.** `robots.txt` allows crawling (`Allow: /`, `Disallow: /api/`), and `noindex` is removed from every page except `logo-options.html` — a dev scratch page, never a real site page, excluded from being served at all via `.assetsignore` rather than relying on its own noindex tag.

The paragraphs below describe the preview-mode rules that governed the site before this pass. They are kept as a record of what was enforced and why — not because the site is still gated. If placeholder content is ever reintroduced (a new page in progress, a section awaiting client sign-off), apply the same four-part marking rule and the same hard limits again, and re-run this file's own verification before removing `noindex` a second time.

Every fabricated fact had to satisfy all four:

1. Wrapped in an element carrying `data-placeholder="true"`
2. Preceded by `<!-- PLACEHOLDER: replace before launch — <what is needed> -->`
3. Using obviously non-real attribution: forename plus role plus sector, e.g. "Aoife M., Practice Owner". No full invented surnames, no invented company names beyond the three real portfolio clients, no stock headshots presented as clients.
4. Listed in `PLACEHOLDER-CONTENT.md` at the repo root — a single launch checklist of every placeholder, its file, and what real data replaces it

Hard limits that survive launch, permanently, not just during preview:

- No fake review or rating **structured data**. JSON-LD stays truthful — `AggregateRating` and `review` are omitted regardless of what the visible page shows. Fake schema is what triggers Google penalties. See "Testimonials and review schema" for the specific, current reasoning on why the real testimonials still carry no review markup.
- No invented quotes attributed to the three real clients by name. ArdLens, KC Accountants, and SodoLT are real businesses; a quote from "ArdLens" that they never said is different from a generic placeholder.
- Keep any future placeholder numbers plausible, not absurd: "3 sites shipped", not "10× revenue overnight".

Insight posts may be written as genuine advice content, since expertise claims about a subject are not claims about past clients.

### Schema consequence

Rush base plus worldwide service area means: `ProfessionalService` with `address` as `addressLocality: "Rush"`, `addressRegion: "Co. Dublin"`, `addressCountry: "IE"`, and `areaServed` as `{"@type": "Place", "name": "Worldwide"}`. Add `email` and `openingHoursSpecification` (Monday–Friday, 09:00–17:00 — see the opening-hours assumption in "Business facts"). No `streetAddress`, no `postalCode`.

`AggregateRating` stays banned permanently — no rating of any kind exists.

### Testimonials and review schema

The three testimonials on `index.html` (`#testimonials`) are real, client-approved quotes, published verbatim, cited by first name and client only (Raj, ArdLens; Kat, KC Accountants; Piotr, SodoLT) — confirmed 15 Sep 2026, the final launch pass. No surname, job title, or photograph is shown for any of them because none was supplied.

**Do not add `Review` or `AggregateRating` JSON-LD for these, or any future testimonial on this site.** This was tried as an instruction earlier the same day and reversed: reviews a business publishes about itself, on its own site, are not eligible for Google's review rich results under `LocalBusiness`/`Organization` — Google treats self-published, non-independently-collected reviews as self-serving, and marking them up risks a manual action for a benefit that was never actually available. The quotes stay as plain semantic `blockquote`/`figcaption` markup, visible to users, invisible to structured data. This is a standing rule, not a one-off decision — do not re-add review schema later on the assumption it was simply forgotten.

## Typography

Confirmed: **Space Grotesk** for headings and the wordmark, **Inter** for body. Both OFL, self-hosted `woff2`, subset to Latin.

## SEO requirements

Every page: unique `<title>` and meta description, canonical link, Open Graph and Twitter tags, one `<h1>`, logical heading order, descriptive alt text.
Site-wide JSON-LD: `LocalBusiness` on home, `Service` on services, `Article` on insight posts, `BreadcrumbList` on inner pages.

## Cloudflare

- `_headers`: `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`; CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` site-wide.
- `_redirects`: strip `.html`, force a single canonical host.
- Contact form posts to `/api/contact`, handled by `functions/api/contact.js`. Validate server-side, protect with Cloudflare Turnstile, send over raw SMTP to Purelymail (`cloudflare:sockets`) — corrected 15 Sep 2026, this line said Resend, an earlier approach the code no longer uses; see `functions/api/contact.js`'s own header comment and `wrangler.toml`'s notes section. Secrets come from Pages environment variables, never from the repo: `TURNSTILE_SECRET_KEY` and `SMTP_PASS` are the two that actually gate the form.

## Model policy

Opus orchestrates, specifies, and reviews. Sonnet and Haiku write the code. See [AGENTS.md](AGENTS.md) for the agent roster and pipeline.
