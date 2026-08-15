# Spec 03 — Services page (`services.html`)

Rewritten 15 Aug 2026 against the shipped `index.html`, `components.css`, and `assets/js/modules/`. Supersedes the Phase 0 version entirely.

Agent: `html-builder` (Haiku 4.5). Read `docs/specs/08-motion-modules.md` sections 2, 4 and 6 before starting.

## 1. Files

Create exactly one file:

- `/services.html`

Edit nothing else. Not `index.html`. Not any `.css`. Not any `.js`. Not `sitemap.xml`, `_headers`, `_redirects`, `robots.txt`, `PLACEHOLDER-CONTENT.md`.

If a style is missing, ship the markup with the class names named in this spec and report the gap. `css-stylist` adds the rules in Phase 6f.

## 2. Shared chrome — copy, do not rewrite

Open `/index.html` and copy these ranges verbatim:

| What | `index.html` lines | Change allowed |
|---|---|---|
| Anti-flash script in `<head>` | 28 | none |
| Font preloads | 30–31 | none |
| Three stylesheet links | 33–35 | none |
| Skip link | 60 | none |
| Flowmap mount div | 62 | none |
| `<header>` block | 64–88 | move `aria-current="page"` from the Home link to the Services link |
| Drawer block | 90–101 | none |
| `<footer>` block | 397–425 | none |
| Script tags before `</body>` | 427–430 | none |

`<html lang="en" data-header-boot="top">` and `<body>` open exactly as in `index.html`.
`<main id="main">` wraps every section.
There is no `<meta name="robots">` on `index.html`; do not add one here. (See open question OQ-1 in the handover note.)

## 3. Head requirements

```html
<title>Web Design, SEO, Paid Ads and AI Services | TheAnalytico</title>
<meta name="description" content="Four services for local businesses: web design, SEO, Meta and Google advertising, and AI automation. Dublin based, working worldwide.">
<link rel="canonical" href="https://theanalytico.com/services">
```

Open Graph and Twitter tags follow `index.html` lines 10–19 exactly, with `og:title` and `twitter:title` set to the `<title>` string, `og:description` and `twitter:description` set to the meta description string, and `og:url` set to the canonical URL. `og:image` and `twitter:image` stay `https://theanalytico.com/assets/img/og-default.png`. `og:type` stays `website`. Keep `<meta name="theme-color" content="#e8f2fa">`, the four icon links, and the manifest link.

Two JSON-LD blocks, both `<script type="application/ld+json">`, placed at the end of `<head>`:

**Block 1 — BreadcrumbList**

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://theanalytico.com/" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://theanalytico.com/services" }
  ]
}
```

**Block 2 — four `Service` nodes in an `@graph`.** One node per pillar. Each node uses exactly this shape, with `name` and `description` from section 6:

```json
{
  "@type": "Service",
  "serviceType": "Web Design",
  "name": "Web Design",
  "description": "…",
  "provider": { "@type": "ProfessionalService", "name": "TheAnalytico", "url": "https://theanalytico.com", "telephone": "+353872520034", "address": { "@type": "PostalAddress", "addressLocality": "Dublin", "addressCountry": "IE" } },
  "areaServed": { "@type": "Place", "name": "Worldwide" }
}
```

Forbidden in JSON-LD on this page: `offers`, `price`, `priceRange`, `aggregateRating`, `review`, `award`. No pricing is confirmed and no reviews exist.

## 4. Section order and backgrounds

Exactly nine sections, in this order. The first carries no `data-curtain`; the other eight do.

| # | `id` | classes | curtain |
|---|---|---|---|
| 1 | `intro` | `section section--blue` | no |
| 2 | `pillars` | `section section--cream` | yes |
| 3 | `web-design` | `section section--grey` | yes |
| 4 | `seo` | `section section--blue` | yes |
| 5 | `paid-advertising` | `section section--cream` | yes |
| 6 | `ai-services` | `section section--grey` | yes |
| 7 | `combine` | `section section--blue` | yes |
| 8 | `faq` | `section section--cream` | yes |
| 9 | `cta` | `section section--grey` | yes |

Sections 3–6 keep those exact `id` values. `index.html` already links to `/services#web-design`, `/services#seo`, `/services#paid-advertising`, `/services#ai-services`.

Every section from 2 onwards carries `aria-labelledby` pointing at its own `<h2 id="…">`, matching `index.html` line 123.

## 5. Section 1 — `#intro`

```
section#intro.section.section--blue
  div.container
    p.eyebrow            "What we do"
    h1.page__title       heading
    p.page__lead         lead
    div.section__actions two buttons
```

`h1`, exact: `Four services, one job: get you found and chosen`
Lead, exact: `Web design, SEO, paid advertising and AI. Run one on its own or stack them in the order that pays back fastest for your business.`

Buttons: `<a class="btn btn--primary" href="/contact">Contact Us</a>` and `<a class="btn btn--ghost" href="/work">See Our Work</a>`.

The `h1` carries **no** `data-mask-heading` and **no** hero hook. Inner pages have a static `h1`.
`.page__title` and `.page__lead` are new classes. Tokens: title `--fs-h1`, `--fw-medium`, `--lh-heading`, `--ls-heading`, `--ink-black`; lead `--fs-lead`, `--ink-soft`, `max-width: var(--container-text)`, `margin-block-start: var(--s-4)`.

## 6. Section 2 — `#pillars`

`h2 id="pillars-title" data-mask-heading`, exact: `The four pillars`

Then `<p class="section__lead">`, exact: `Every one of these is delivered by the same person you talk to on the call.`

Then the services grid. **Copy `index.html` lines 132–177 verbatim**, changing only the four `card__link` hrefs to on-page anchors and adding `data-anchor-link`:

- Card 1 link → `href="#web-design" data-anchor-link`
- Card 2 link → `href="#seo" data-anchor-link`
- Card 3 link → `href="#paid-advertising" data-anchor-link`
- Card 4 link → `href="#ai-services" data-anchor-link`

Rules, one per line:

1. The `<ul>` keeps `class="services__grid" data-reveal-group`.
2. Each `<li>` keeps `class="card card--service" data-reveal-item`.
3. Card source order is fixed: Web Design, SEO, Paid Advertising, AI Services. The gradients are assigned by `:nth-child` in `components.css` line 755. Reordering breaks the colours.
4. Every card keeps its `figure.card__media.card__media--video[data-service-media]` and `video[data-service-video]` exactly as authored on the home page, including `muted loop playsinline preload="none"`, the poster, `width="480" height="300"`, `aria-hidden="true"`, and both `<source>` elements.
5. Card titles and body copy are unchanged from `index.html`.
6. Do not add a fifth card. Do not add a video that is not one of the four existing clips.

`description` values for the JSON-LD `Service` nodes in section 3 are the four `card__body` strings from these cards, verbatim.

## 7. Sections 3–6 — pillar detail blocks

All four use one template. No images, no video, no new assets.

```
section#<id>.section.section--<colour>[data-curtain] aria-labelledby="<id>-title"
  div.container
    p.eyebrow            pillar label
    h2#<id>-title[data-mask-heading]   pillar heading
    p.section__lead      one-paragraph summary
    ul.pillar__list[data-reveal-group]
      li.card[data-reveal-item]
        h3.card__title   deliverable name
        p.card__body     deliverable detail
    div.section__actions
      a.btn.btn--primary href="/contact"  "Talk to us about <pillar>"
```

`.pillar__list` is a new class: one column below 640px, two columns at 640px, three at 1024px, `gap: var(--gap-grid)`, `margin-block-start: var(--s-6)`.

Rules:

1. Every `h2` carries `data-mask-heading` and contains plain text only.
2. Every list carries `data-reveal-group`; every `<li>` carries `data-reveal-item`.
3. No `<li>` carries `data-tilt-card` in sections 3–5.
4. No claim about results, rankings, traffic, or revenue appears anywhere in these blocks.
5. No timeframe ("in two weeks", "within a month") appears. None is confirmed.
6. No price, no package name, no tier appears.

### 7.1 `#web-design` (section--grey)

Eyebrow: `Pillar one`
`h2`: `Web design`
Lead: `A site built from scratch around the one action you want a visitor to take, then made fast enough that nobody leaves before it loads.`

Deliverables, exactly four:

1. `Structure first` — `We agree what each page has to do and in what order, before a single pixel is designed.`
2. `Built responsive` — `One build that holds up from a 360px phone to a wide desktop, tested on real screen sizes.`
3. `Fast by construction` — `Static HTML, CSS and vanilla JavaScript on Cloudflare. No page builder, no plugin stack, nothing to slow down later.`
4. `Handover you can use` — `You get the live site, the code, and a walkthrough of how to change the parts you will want to change.`

### 7.2 `#seo` (section--blue)

Eyebrow: `Pillar two`
`h2`: `SEO`
Lead: `Technical foundations, page-level structure, and the local signals that decide whether the people nearby ever see you.`

Deliverables, exactly four:

1. `Technical audit` — `Crawlability, indexing, redirects, structured data and Core Web Vitals, checked and fixed rather than reported.`
2. `On-page structure` — `Titles, descriptions, headings and internal links written so both a reader and a crawler can tell what a page is for.`
3. `Local search` — `Google Business Profile, service areas, and the location signals that matter when someone searches with intent nearby.`
4. `Reporting you can read` — `What changed, what moved, and what is next. No 40-page PDF nobody opens.`

### 7.3 `#paid-advertising` (section--cream)

Eyebrow: `Pillar three`
`h2`: `Paid advertising`
Lead: `Meta and Google campaigns set up properly the first time, then managed month to month by the person who built them.`

Deliverables, exactly four:

1. `Tracking before spend` — `Conversion tracking is configured and verified before any budget goes live. Otherwise you are buying clicks blind.`
2. `Meta campaigns` — `Facebook and Instagram, audience and creative built around one clear offer per campaign.`
3. `Google campaigns` — `Search and Performance Max, with negative keywords maintained so you stop paying for the wrong intent.`
4. `Landing pages that match` — `The page the ad lands on says the same thing the ad said. Most wasted spend dies here.`

### 7.4 `#ai-services` (section--grey)

Eyebrow: `Pillar four`
`h2`: `AI services`
Lead: `Five capabilities. Start with whichever one removes the most repetitive work from your week.`

This section uses **five** items, not four, and uses `tilt-cards.js` instead of `reveal-stagger.js`:

- The `<ul>` carries `class="pillar__list"` and **no** `data-reveal-group`.
- Each `<li>` carries `class="card" data-tilt-card` and **no** `data-reveal-item`.
- Each `<li>` starts with `<span class="card__step" aria-hidden="true">01</span>` … `05`. Do **not** add `data-dial-num`; there is no dial on this page.

The five capabilities are fixed by CLAUDE.md and must be listed in this order:

1. `AI chatbots` — `Round-the-clock answers to the questions you already answer twenty times a week, handing over to you when it matters.`
2. `AI-driven local SEO` — `Google Business Profile and local listings kept current, with content generated from your own service data, not invented.`
3. `Marketing automation` — `Ads, email and social sequences that run themselves once the rules are agreed.`
4. `Workflow automation` — `Quotes, bookings, follow-ups and admin handoffs wired together so nothing sits in an inbox.`
5. `AI analytics and reporting` — `Your numbers summarised in plain English, on a schedule, without you opening a dashboard.`

## 8. Section 7 — `#combine` (section--blue)

`h2 id="combine-title" data-mask-heading`, exact: `Running more than one`

Container is `.container--narrow`.

Lead, exact: `The order matters more than the number. A site that converts first, then the traffic to feed it, then the automation to stop the admin eating your week.`

Then an `<ol class="pillar__list" data-reveal-group>` with three `<li class="card" data-reveal-item>`:

1. `Site first` — `There is no point sending traffic to a page that does not convert. Fix the destination, then buy the visits.`
2. `Then traffic` — `SEO for the long compounding curve, paid for the immediate one. Most businesses need both, weighted differently.`
3. `Then automation` — `Once enquiries arrive reliably, automation is what stops them being the thing you do every evening.`

No `data-tilt-card` here.

## 9. Section 8 — `#faq` (section--cream)

`h2 id="faq-title" data-mask-heading`, exact: `Questions we get asked`

Container is `.container--narrow`. Markup is a single `<dl class="faq__list">`. `.faq__list` is a new class.

Six pairs, in this order:

1. `dt`: `Can I start with just one service?` — `dd`: `Yes. Most people start with the site, because everything else points at it.`
2. `dt`: `Do you work with businesses outside Ireland?` — `dd`: `Yes. We are based in Dublin and work with clients anywhere, remotely.`
3. `dt`: `Who actually does the work?` — `dd`: `The person you speak to on the call. Nothing is passed to a subcontractor without telling you.`
4. `dt`: `Do I need to write the copy?` — `dd`: `No. We draft it from the call and you edit it. You know your business better than any brief captures.`
5. `dt`: `What happens to my site if we stop working together?` — `dd`: `You keep it. The code and the hosting account are yours, and nothing is locked to us.`
6. `dt`: `How much does it cost?` — `dd`: `It depends on scope. Book a short call and you will get a figure in writing.`

Question 6 is a **marked placeholder**, already logged as row 5.7 in `PLACEHOLDER-CONTENT.md`. Reproduce it exactly like this:

```html
<!-- PLACEHOLDER: replace before launch — confirm the client's actual pricing process, add real pricing bands, or delete this question -->
<dt data-placeholder="true">How much does it cost?</dt>
<dd data-placeholder="true">It depends on scope. Book a short call and you will get a figure in writing.</dd>
```

Answers 1–5 are statements about how the business operates and are written to be defensible. If any of them is not true, delete the pair rather than softening it, and report the deletion.

Tokens: `dt` uses `--fs-h4`, `--fw-medium`, `--ink-black`; `dd` uses `--fs-body`, `--ink-soft`, `margin-inline-start: 0`, `margin-block-end: var(--s-6)`.

## 10. Section 9 — `#cta` (section--grey)

Copy the shape of `index.html` lines 384–393. Container is `.container--narrow`.

`h2 id="cta-title" data-mask-heading`, exact: `Tell us which one you need first`
`p.cta__lead`, exact: `A short call, no charge, no pitch deck. Based in Dublin, working with clients anywhere.`
`div.cta__actions` with `<a class="btn btn--primary" href="tel:+353872520034">Call 087-2520034</a>` and `<a class="btn btn--ghost" href="/contact">Send a message</a>`.

## 11. Motion summary

| Module | Hooks on this page | Where |
|---|---|---|
| `header-pill.js` | `[data-header]` chrome | shared header |
| `flowmap-trail.js` | `[data-flowmap]` | one div after the skip link |
| `heading-mask.js` | `data-mask-heading` | all eight `<h2>` elements |
| `section-curtain.js` | `data-curtain` | sections 2–9 |
| `reveal-stagger.js` | `data-reveal-group` / `data-reveal-item` | `#pillars`, `#web-design`, `#seo`, `#paid-advertising`, `#combine` |
| `tilt-cards.js` | `data-tilt-card` | `#ai-services` only |
| `service-videos.js` | `data-service-media` / `data-service-video` | `#pillars` only |
| `lenis-scroll.js` | `data-anchor-link` | the four card links in `#pillars` |

New hooks required: **none**. No JS file is edited.

## 12. Acceptance criteria

1. `/services.html` exists and is the only file created.
2. `<html lang="en" data-header-boot="top">` and the `<head>` anti-flash script are present.
3. `<title>` is `Web Design, SEO, Paid Ads and AI Services | TheAnalytico`.
4. `<link rel="canonical" href="https://theanalytico.com/services">` is present, and `og:url` matches it byte for byte.
5. Exactly one `<h1>` exists, in `#intro`, with no `data-mask-heading`.
6. Nine `<section>` elements exist, with the exact `id` and class values in section 4's table, in that order.
7. Section 1 has no `data-curtain`. Sections 2–9 each have one.
8. Every `<h2>` carries `data-mask-heading`, has an `id`, is referenced by its section's `aria-labelledby`, and contains no child elements.
9. `#pillars` contains exactly four `.card--service` items, in the order Web Design, SEO, Paid Advertising, AI Services.
10. Each of those four contains one `[data-service-media]` figure wrapping one `[data-service-video]` with `muted`, `loop`, `playsinline`, `preload="none"`, a `poster`, `width="480"`, `height="300"`, `aria-hidden="true"`, and both `<source>` elements.
11. The four `card__link` hrefs are `#web-design`, `#seo`, `#paid-advertising`, `#ai-services`, each with `data-anchor-link`.
12. `#ai-services` contains exactly five `<li class="card" data-tilt-card>` items, in the CLAUDE.md order, and none of them carries `data-reveal-item`.
13. No element in the file carries both `data-reveal-item` and `data-tilt-card`.
14. `#faq` contains one `<dl>` with exactly six `dt`/`dd` pairs; pair 6 carries the placeholder comment and `data-placeholder="true"` on both `dt` and `dd`.
15. Two JSON-LD blocks are present: one `BreadcrumbList`, one `@graph` of four `Service` nodes.
16. No JSON-LD on this page contains `aggregateRating`, `review`, `offers`, `price`, or `award`.
17. The `<header>` block matches `index.html` lines 64–88 except that `aria-current="page"` sits on the Services link.
18. The `<footer>` block matches `index.html` lines 397–425 byte for byte.
19. Exactly one `<div data-flowmap aria-hidden="true"></div>` exists.
20. The four script tags before `</body>` match `index.html` lines 427–430 byte for byte, and no other script is loaded.
21. No `on*` attribute and no inline `<style>` block appears anywhere.
22. No raw hex colour, no `px` font size, and no inline `style` attribute appears anywhere.
23. Every fabricated statement carries the three-part placeholder marking from CLAUDE.md.
24. With JavaScript disabled, all nine sections render fully readable.

## 13. Non-goals

- Do not build individual service sub-pages.
- Do not add pricing, packages, tiers, or a quote calculator.
- Do not add testimonials, logos, KPI counters, or a process dial to this page.
- Do not add a second video beyond the four existing service clips.
- Do not add case study content; that belongs on `work.html`.
- Do not create or capture any new image or video asset.
- Do not edit `PLACEHOLDER-CONTENT.md`; the architect updates it after review.
- Do not write any CSS. `.page__title`, `.page__lead`, `.pillar__list` and `.faq__list` are handed to `css-stylist` in Phase 6f.
