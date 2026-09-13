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

Type is two-tier with nothing in between: a display tier (120px+ at 1440px, the page's only large type) and a monospace label tier (~12px, uppercase, `0.08em` tracking) carrying all metadata. Avoid an 18–22px prose tier doing explanatory work; that is what the reference sites conspicuously lack.

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

1. Hero: single scroll-scrubbed morphing form (Higgsfield-generated, one continuous camera, no discrete objects/logo target) advancing through states that represent each service, then resolving directly into the kinetic hero headline — narrative progression, holds its end state, no idle looping. Rendered from a pre-decoded sprite-sheet image drawn to a `<canvas>` (one frame region per scroll tick via `drawImage`), not a `<video>`: Cloudflare static assets don't honour Range requests, so a plain network `<video>` never becomes scrubbable, and even a blob-URL `<video>` throttles/coalesces rapid `currentTime` seeks on a fast scroll — a sprite sheet has no per-seek decode cost. Desktop and mobile load separate sprite sheets (mobile's is smaller, fewer frames). See `assets/js/modules/hero-morph.js`.
2. Kinetic headline: word-by-word clip-path reveal, timed to the hero morph's resolution rather than a fixed delay
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
| Location | Dublin, Ireland |
| Phone | 087-2520034 (`tel:+353872520034`) |
| Service area | Worldwide |
| Clients | Three shipped sites, named below |
| Awards | None |
| Email | not yet supplied — `[EVIDENCE NEEDED: business email]` |

### Still missing

Street address, postcode, company registration number, opening hours, founding year, team names, social profile URLs, headshots.

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

**Current mode: LOCAL PREVIEW ONLY. Not for publication.**

The client asked for a visually complete mock-up to review layout. Placeholder testimonials, metrics, and result claims are therefore permitted, under strict marking so none of it can reach production by accident.

Every fabricated fact must satisfy all four:

1. Wrapped in an element carrying `data-placeholder="true"`
2. Preceded by `<!-- PLACEHOLDER: replace before launch — <what is needed> -->`
3. Using obviously non-real attribution: forename plus role plus sector, e.g. "Aoife M., Practice Owner". No full invented surnames, no invented company names beyond the three real portfolio clients, no stock headshots presented as clients.
4. Listed in `PLACEHOLDER-CONTENT.md` at the repo root — a single launch checklist of every placeholder, its file, and what real data replaces it

Hard limits that survive preview mode:

- No fake review or rating **structured data**. JSON-LD stays truthful — `AggregateRating` and `review` are omitted regardless of what the visible page shows. Fake schema is what triggers Google penalties.
- No invented quotes attributed to the three real clients by name. ArdLens, KC Accountants, and SodoLT are real businesses; a quote from "ArdLens" that they never said is different from a generic placeholder.
- `robots.txt` disallows all crawling while in preview mode, and every page carries `<meta name="robots" content="noindex, nofollow">`. Both are removed at launch via the checklist.

Keep placeholder numbers plausible, not absurd: "3 sites shipped", "+42% organic sessions in 6 months", not "10× revenue overnight".

Insight posts may be written as genuine advice content, since expertise claims about a subject are not claims about past clients.

### Schema consequence

Dublin base plus worldwide service area means: `ProfessionalService` with `address` limited to `addressLocality: "Dublin"` and `addressCountry: "IE"`, and `areaServed` as `{"@type": "Place", "name": "Worldwide"}`. No `streetAddress`, no `postalCode`, no `AggregateRating`, no `review` until real ones exist.

## Typography

Confirmed: **Space Grotesk** for headings and the wordmark, **Inter** for body. Both OFL, self-hosted `woff2`, subset to Latin.

## SEO requirements

Every page: unique `<title>` and meta description, canonical link, Open Graph and Twitter tags, one `<h1>`, logical heading order, descriptive alt text.
Site-wide JSON-LD: `LocalBusiness` on home, `Service` on services, `Article` on insight posts, `BreadcrumbList` on inner pages.

## Cloudflare

- `_headers`: `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`; CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` site-wide.
- `_redirects`: strip `.html`, force a single canonical host.
- Contact form posts to `/api/contact`, handled by `functions/api/contact.js`. Validate server-side, protect with Cloudflare Turnstile, send via Resend. Secrets come from Pages environment variables, never from the repo.

## Model policy

Opus orchestrates, specifies, and reviews. Sonnet and Haiku write the code. See [AGENTS.md](AGENTS.md) for the agent roster and pipeline.
