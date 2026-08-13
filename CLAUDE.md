# TheAnalytico — project conventions

Marketing site for TheAnalytico, an agency selling **web design, SEO, paid advertising (Meta + Google), and AI services** to local businesses.

## Non-negotiables

- Static site. Plain HTML, CSS, vanilla JS. **No bundler, no framework, no npm build step.**
- Hosted on **Cloudflare Pages** (free tier). Server logic only via Pages Functions in `functions/`.
- Every page must pass Lighthouse **95+ on Performance, Accessibility, Best Practices, SEO** on mobile. The client sells SEO; a slow site kills the pitch.
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

Light pastel palette, sampled from the reference. Define once in `assets/css/tokens.css`, never hardcode a hex elsewhere.

```css
--ink:        #1a1a1a;   /* body text, buttons, logo */
--ink-soft:   #6b6b6b;   /* secondary text */
--ink-black:  #0a0a0a;   /* headings */
--surface:    #ffffff;   /* cards */
--bg-blue:    #e8f2fa;   /* pale blue section */
--bg-cream:   #f9f0ea;   /* warm cream section */
--bg-grey:    #f3f3f3;   /* neutral section */
--line:       #e3e3e3;
--accent:     #e5804b;   /* terracotta, doodles and highlights */
--accent-2:   #9999ff;   /* periwinkle, secondary highlight */
```

Alternating section backgrounds: blue → cream → grey → blue. Sections carry a large top radius (`--radius-section: 48px`) and overlap the section above them.

Type scale is fluid, `clamp()` only, no media-query font sizes. Headings use negative tracking (`-0.03em`) and weight 500–600, never 700+. Reference feel is large, tight, confident.

Spacing scale: 4 8 12 16 24 32 48 64 96 128 (px), exposed as `--s-1` … `--s-10`.

## Logo and header

Wordmark only, no illustration. Inline SVG in `assets/logo/`, never an `<img>`, so it can animate and inherit `currentColor`.

- **Monogram**: `tA` as a single connected ligature form, geometric, stroke-based.
- **Wordmark**: `the` / `analytico` stacked on two lines beside the monogram, lowercase, tight leading.

Header has two states, driven by scroll position:

| State | Trigger | Appearance |
|---|---|---|
| `top` | `scrollY < 40` | Full-width bar, transparent, monogram **+** stacked wordmark, nav links, `Contact Us` pill on the right |
| `pinned` | `scrollY >= 40` | Centred floating pill, max-width ~1120px, `backdrop-filter: blur(16px)`, monogram **only**, same nav |

Transition is a single GSAP timeline on width, radius, padding, background, and wordmark opacity/width. Duration 0.45s, `power3.out`. It must not thrash layout: animate `transform` and `opacity`, plus `max-width` on the shell only.

## Motion rules

- One effect per module in `assets/js/modules/`. No cross-imports between modules.
- All motion is gated: skip entirely if `prefers-reduced-motion: reduce`, or if `matchMedia('(max-width: 768px)')` matches, unless the module explicitly declares mobile support.
- Lenis drives scroll; sync it to `gsap.ticker`, never a second RAF loop.
- Register `ScrollTrigger` once in `main.js`. Modules receive it as an argument.
- `will-change` only while an animation is live; remove it on complete.
- Never animate `width`, `height`, `top`, or `left`. Transform and opacity only, with the header shell as the single documented exception.
- Content must be readable with JS disabled. Reveal animations set their start state from JS, not CSS, so no-JS users see finished content.

## Effect inventory to implement

1. Hero: oversized headline with inline image chips and a hand-drawn accent doodle
2. Hero visual: scroll-scrubbed tilt that straightens as it enters
3. Headings: clip-path mask rise, word-by-word stagger
4. Header: full bar → floating pill (see above)
5. Section curtain: rounded next-section slide over previous
6. Cursor: soft gradient blob, lerped follow, desktop only
7. Service cards: self-running inner loops (mockup slide, cycle, icon fan)
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

1. **Web Design** — design and build, responsive, fast, conversion-focused
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

Sector spread across film, professional services, and wellness supports the local-business pitch. Say what is verifiable: built, shipped, live, hosted on Cloudflare. Do not claim traffic lifts, rankings, or revenue results — no analytics evidence exists.

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
