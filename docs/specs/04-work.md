# Spec 04 — Work page (`work.html`)

Rewritten 15 Aug 2026 against the shipped `index.html`, `components.css`, and `assets/js/modules/`. Supersedes the Phase 0 version entirely.

Agent: `html-builder` (Haiku 4.5). Read `docs/specs/08-motion-modules.md` sections 2, 4 and 6 before starting.

## 1. Files

Create exactly one file:

- `/work.html`

Edit nothing else. **Do not capture, generate, resize, or add any image file.** The Phase 0 version of this spec asked for `*-full.webp` screenshots; they were never captured, no headless browser is installed, and this pass does not unblock that. Use only the three files that exist:

- `/assets/img/work/ardlens-card.webp` (800×600)
- `/assets/img/work/kc-accountants-card.webp` (800×600)
- `/assets/img/work/sodolt-card.webp` (800×600)

Each may appear **once** on the page.

## 2. Truth rules — the strictest page on the site

ArdLens, KC Accountants and SodoLT are real businesses. Everything said about them must be verifiable.

Permitted claims: built, designed, developed, shipped, live, static build, WordPress, hosted on Cloudflare, contact form handled by a Cloudflare Worker, the sector, the live URL.

Forbidden anywhere on this page: traffic figures, ranking positions, conversion rates, revenue, enquiry volume, "results", percentage improvements, before/after metrics, invented quotes from any of the three, any award, any client logo not supplied by the client.

No `aggregateRating`, no `review`, and no `testimonial` on this page in either the visible content or the JSON-LD.

The only marked placeholder on this page is the KC Accountants URL, already logged as row 4.1 in `PLACEHOLDER-CONTENT.md`.

## 3. Shared chrome — copy, do not rewrite

Identical to spec 03 section 2. Copy from `/index.html`:

| What | `index.html` lines |
|---|---|
| Anti-flash script | 28 |
| Font preloads | 30–31 |
| Stylesheet links | 33–35 |
| Skip link | 60 |
| Flowmap mount div | 62 |
| `<header>` | 64–88 — move `aria-current="page"` to the Work link |
| Drawer | 90–101 |
| `<footer>` | 397–425 |
| Script tags | 427–430 |

## 4. Head requirements

```html
<title>Our Work — Sites We Have Built and Shipped | TheAnalytico</title>
<meta name="description" content="Three live client sites built by TheAnalytico: ArdLens, KC Accountants and SodoLT. Aerial film, accountancy and wellness, all shipped and live.">
<link rel="canonical" href="https://theanalytico.com/work">
```

OG and Twitter tags follow `index.html` lines 10–19, with title, description and URL swapped as above. `og:image` and `twitter:image` stay the default.

Two JSON-LD blocks:

**Block 1 — BreadcrumbList**: Home → Work, same shape as spec 03 section 3, `position: 2` name `Work`, item `https://theanalytico.com/work`.

**Block 2 — ItemList of three `CreativeWork` nodes**, in the page's source order:

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "item": { "@type": "CreativeWork", "name": "ArdLens", "url": "https://ardlens.com", "creator": { "@type": "ProfessionalService", "name": "TheAnalytico", "url": "https://theanalytico.com" } } }
  ]
}
```

Node 2 is `KC Accountants`, url `https://kc-accountant.puneetcf.workers.dev`. Node 3 is `SodoLT`, url `https://sodolt.com`. No other properties. No `aggregateRating`, no `review`, no `datePublished` (no launch dates are confirmed).

## 5. Section order and backgrounds

Eight sections. The first carries no `data-curtain`; the other seven do.

| # | `id` | classes | curtain |
|---|---|---|---|
| 1 | `intro` | `section section--blue` | no |
| 2 | `projects` | `section section--cream` | yes |
| 3 | `ardlens` | `section section--grey` | yes |
| 4 | `kc-accountants` | `section section--blue` | yes |
| 5 | `sodolt` | `section section--cream` | yes |
| 6 | `approach` | `section section--grey` | yes |
| 7 | `numbers` | `section section--blue` | yes |
| 8 | `cta` | `section section--cream` | yes |

## 6. Section 1 — `#intro`

```
section#intro.section.section--blue
  div.container
    p.eyebrow            "Selected work"
    h1.page__title       heading
    p.page__lead         lead
    div.section__actions two buttons
```

`h1`, exact: `Three sites, built and live`
Lead, exact: `Film, accountancy and wellness. Different sectors, the same job: a site that loads fast, reads clearly, and turns a visitor into an enquiry.`

Buttons: `Contact Us` → `/contact` (`btn btn--primary`), `See Services` → `/services` (`btn btn--ghost`).

The `h1` carries no motion hook.

## 7. Section 2 — `#projects`

`h2 id="projects-title" data-mask-heading`, exact: `Work we are proud of`

**Copy `index.html` lines 190–219 verbatim** — the whole `<ul class="work__grid">` with its three `.card.card--work` items, including every `data-work-card`, `data-work-img`, `data-work-chip`, the KC Accountants placeholder comment, both `data-placeholder="true"` attributes, `loading="lazy"`, `decoding="async"`, `width="800"`, `height="600"`, the alt text, and `target="_blank" rel="noopener"` with the `<span class="visually-hidden"> (opens in a new tab)</span>` inside each visit link.

Then change exactly one thing per card: add `data-reveal-item` to each `<li>`, and add `data-reveal-group` to the `<ul>`. Nothing else changes.

Then add three anchor links below the grid so the grid doubles as navigation into the case studies:

```html
<div class="section__actions">
  <a class="btn btn--ghost" href="#ardlens" data-anchor-link>ArdLens detail</a>
  <a class="btn btn--ghost" href="#kc-accountants" data-anchor-link>KC Accountants detail</a>
  <a class="btn btn--ghost" href="#sodolt" data-anchor-link>SodoLT detail</a>
</div>
```

Do not add the `See all work` button from the home page. This is that page.

## 8. Sections 3–5 — case study blocks

One template, three instances, no images (the three images are already used once in `#projects` and each may appear only once).

```
section#<id>.section.section--<colour>[data-curtain] aria-labelledby="<id>-title"
  div.container
    p.eyebrow                    sector label
    h2#<id>-title[data-mask-heading]   project name
    p.section__lead              one-paragraph description
    dl.facts__list               four fact pairs
    ul.pillar__list[data-reveal-group]   what we built, three items
      li.card[data-reveal-item]
        h3.card__title
        p.card__body
    div.section__actions
      a.btn.btn--primary  visit link, new tab
      a.btn.btn--ghost href="/contact"  "Start a project"
```

`.facts__list` is a new class: a `<dl>` rendered as label/value rows, `dt` in `--fs-micro` `--ls-caps` `--ink-soft`, `dd` in `--fs-body` `--ink`, `margin-inline-start: 0`.

Every visit link uses `target="_blank" rel="noopener"` and carries `<span class="visually-hidden"> (opens in a new tab)</span>`.
Every `h2` carries `data-mask-heading` and contains plain text only.

### 8.1 `#ardlens` (section--grey)

Eyebrow: `Aerial cinematography`
`h2`: `ArdLens`
Lead: `Aerial cinematography across coastal and heritage Ireland. The site had to put the footage first and still make it obvious how to book a shoot.`

Facts (`dt` / `dd`):
- `Sector` / `Aerial cinematography, coastal and heritage Ireland`
- `Build` / `Static HTML, CSS and JavaScript`
- `Hosting` / `Cloudflare`
- `Contact form` / `Cloudflare Worker`

What we built, exactly three:
1. `Footage-first layout` — `The work leads. Everything else on the page is arranged around not getting in its way.`
2. `Static build` — `No CMS and no plugin stack, so there is nothing to update and nothing to slow it down.`
3. `Worker-backed form` — `Enquiries post to a Cloudflare Worker, validated server side, with no third-party form service in the path.`

Visit link: `<a class="btn btn--primary" href="https://ardlens.com" target="_blank" rel="noopener">Visit ArdLens<span class="visually-hidden"> (opens in a new tab)</span></a>`

### 8.2 `#kc-accountants` (section--blue)

Eyebrow: `Accountancy practice`
`h2`: `KC Accountants`
Lead: `An accountancy practice in Ireland. The brief was clarity: say what the practice does, for whom, and how to get in touch, without the jargon the sector defaults to.`

Facts:
- `Sector` / `Accountancy practice, Ireland`
- `Build` / `Static HTML, CSS and JavaScript`
- `Hosting` / `Cloudflare`
- `Contact form` / `Cloudflare Worker`

What we built, exactly three:
1. `Services stated plainly` — `Each service explained in the words a client would use, not the words an accountant would.`
2. `Static build` — `Fast on a phone, which is where most people check a professional service before ringing.`
3. `Worker-backed form` — `Server-side validation on Cloudflare, so enquiries arrive clean and nothing is stored where it should not be.`

Visit link and URL are placeholder-marked:

```html
<!-- PLACEHOLDER: replace before launch — KC Accountants production domain; the workers.dev URL is a client-approved interim -->
<a class="btn btn--primary" href="https://kc-accountant.puneetcf.workers.dev" target="_blank" rel="noopener" data-placeholder="true">Visit KC Accountants<span class="visually-hidden"> (opens in a new tab)</span></a>
```

### 8.3 `#sodolt` (section--cream)

Eyebrow: `Massage therapy`
`h2`: `SodoLT`
Lead: `In-home LinfoModellante massage therapy. A WordPress build, because the owner needed to add and reprice treatments without ringing anyone.`

Facts:
- `Sector` / `In-home massage therapy`
- `Build` / `WordPress`
- `Hosting` / `Third-party WordPress hosting` — this `<dd>` carries `data-placeholder="true"` and is preceded by `<!-- PLACEHOLDER: replace before launch — confirm the SodoLT hosting provider name with the client, or keep the generic wording and delete this marking -->` (logged as row 4.2)
- `Editable by the owner` / `Yes, treatments and pricing`

What we built, exactly three:
1. `Owner-editable treatments` — `The treatment list and prices are hers to change, with no developer in the loop.`
2. `Booking-led structure` — `Every page routes toward one action: booking a treatment.`
3. `Built for phones first` — `Most visits are on a phone, so that is the layout that got designed first.`

Visit link: `<a class="btn btn--primary" href="https://sodolt.com" target="_blank" rel="noopener">Visit SodoLT<span class="visually-hidden"> (opens in a new tab)</span></a>`

## 9. Section 6 — `#approach` (section--grey)

`h2 id="approach-title" data-mask-heading`, exact: `How every one of these was built`

Container is `.container--narrow`.
Lead, exact: `Different sectors, one method. It is the same four steps whether the build is static or WordPress.`

An `<ol class="process__list">` with four `<li class="card" data-tilt-card>`, each opening with `<span class="card__step" aria-hidden="true">01</span>` … `04`. Reuse the copy from `index.html` lines 236–257 verbatim: Call, Plan, Build, Grow, with their existing `card__body` text.

Do **not** add `data-dial`, `data-dial-arc`, `data-dial-arc-path`, or `data-dial-num`. There is no dial on this page; `tilt-cards.js` alone drives these cards.

## 10. Section 7 — `#numbers` (section--blue)

`h2 id="numbers-title" data-mask-heading`, exact: `The countable part`

A `<ul class="kpi__list">` with exactly **three** `<li class="kpi">` items. Every figure here is verifiable from CLAUDE.md, so **none of them is a placeholder and none carries `data-placeholder`**.

1. `<span data-counter data-counter-to="3" data-counter-decimals="0">3</span>` / label `sites built and live`
2. `<span data-counter data-counter-to="3" data-counter-decimals="0">3</span>` / label `sectors served`
3. `<span data-counter data-counter-to="2" data-counter-decimals="0">2</span>` / label `hosted on Cloudflare`

Markup shape per item copies `index.html` lines 270–273: `<p class="kpi__value">` wrapping the counter span, then `<p class="kpi__label">`.

Do **not** copy the three fabricated KPIs from the home page (`+42%`, `1.2s`, `98`). Do not add a `kpi__disclaimer` line; there is nothing on this page to disclaim.

## 11. Section 8 — `#cta` (section--cream)

Container `.container--narrow`. Shape copies `index.html` lines 384–393.

`h2 id="cta-title" data-mask-heading`, exact: `Want yours in this list?`
`p.cta__lead`, exact: `A short call, no charge, no pitch deck. Based in Dublin, working with clients anywhere.`
Actions: `Call 087-2520034` → `tel:+353872520034` (`btn btn--primary`), `Send a message` → `/contact` (`btn btn--ghost`).

## 12. Motion summary

| Module | Hooks on this page | Where |
|---|---|---|
| `header-pill.js` | header chrome | shared |
| `flowmap-trail.js` | `[data-flowmap]` | one div after the skip link |
| `heading-mask.js` | `data-mask-heading` | all seven `<h2>` elements |
| `section-curtain.js` | `data-curtain` | sections 2–8 |
| `work-hover.js` | `data-work-card` / `data-work-img` / `data-work-chip` | `#projects`, three cards |
| `reveal-stagger.js` | `data-reveal-group` / `data-reveal-item` | `#projects`, and the three "what we built" lists |
| `tilt-cards.js` | `data-tilt-card` | `#approach` only |
| `kpi-counter.js` | `data-counter` | `#numbers`, three counters |
| `lenis-scroll.js` | `data-anchor-link` | the three jump links in `#projects` |

New hooks required: **none**.

## 13. Acceptance criteria

1. `/work.html` exists and is the only file created. No image file is added, replaced, or resized.
2. `<title>` is `Our Work — Sites We Have Built and Shipped | TheAnalytico` and the canonical is `https://theanalytico.com/work`.
3. Exactly one `<h1>` exists, in `#intro`, with no motion hook.
4. Eight `<section>` elements exist with the exact ids, classes and order in section 5's table.
5. Section 1 has no `data-curtain`; sections 2–8 each have one.
6. Every `<h2>` carries `data-mask-heading`, has an `id` referenced by its section's `aria-labelledby`, and contains no child elements.
7. `#projects` contains exactly three `.card--work` items, each with `data-work-card` on the `<li>`, `data-work-img` on the `<img>`, and `data-work-chip` on the chip `<span>`.
8. Each of the three work images appears exactly once in the whole file.
9. Every external link uses `target="_blank" rel="noopener"` and contains the visually-hidden "(opens in a new tab)" span.
10. `#numbers` contains exactly three `[data-counter]` spans, with `data-counter-to` values 3, 3 and 2, and their authored text already equal to the final value.
11. No element on the page carries `data-placeholder="true"` except the two KC Accountants links, the KC Accountants image, and the SodoLT hosting `<dd>`.
12. The strings `%`, `increase`, `growth`, `ranking`, `revenue`, `conversion rate`, and `ROI` do not appear anywhere in the file.
13. No testimonial, quote, star rating, or client logo appears anywhere in the file.
14. Two JSON-LD blocks are present: one `BreadcrumbList`, one `ItemList` of exactly three `CreativeWork` nodes.
15. No JSON-LD contains `aggregateRating`, `review`, or `award`.
16. `#approach` contains exactly four `[data-tilt-card]` items and no `[data-dial]` anywhere.
17. No element carries both `data-reveal-item` and `data-tilt-card`.
18. The `<header>` matches `index.html` lines 64–88 except that `aria-current="page"` sits on the Work link; the `<footer>` matches lines 397–425 byte for byte.
19. Exactly one `<div data-flowmap aria-hidden="true"></div>` exists.
20. The four script tags match `index.html` lines 427–430 and no other script is loaded.
21. No `on*` attribute, no inline `<style>`, no inline `style` attribute, no raw hex, no `px` font size.
22. With JavaScript disabled, all eight sections render fully readable and the three KPI numbers show their final values.

## 14. Non-goals

- Do not build per-project sub-pages.
- Do not capture screenshots or install a headless browser in this pass.
- Do not add `*-full.webp` images or any `<picture>` element.
- Do not add a filter, tag, or sector-toggle control. Three projects do not need filtering.
- Do not add testimonials, ratings, or logos.
- Do not add a fourth project. `../rmyf` is excluded permanently.
- Do not write any CSS. `.page__title`, `.page__lead`, `.facts__list` and `.pillar__list` are handed to `css-stylist` in Phase 6f.
- Do not edit `PLACEHOLDER-CONTENT.md`.
