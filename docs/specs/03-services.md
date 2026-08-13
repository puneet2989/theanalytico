# Spec 03 — Services page (`services.html`)

Owner agents: `html-builder` (Haiku 4.5) for markup, `css-stylist` (Sonnet 5) for `pages.css`.
Phase: 6. Starts only after `index.html` passes Phase 4.

## 1. Files

`html-builder` may create or edit only:

- `services.html`

`css-stylist` may edit only:

- `assets/css/pages.css`

Do not create any other file.
Do not edit `assets/css/tokens.css`.
Do not edit `assets/css/base.css`.
Do not edit `assets/css/components.css`.
Do not edit `index.html`.
Do not write any `.js` file.

Reuse every component class established in `index.html`. Do not invent a second card class for the same visual pattern.

## 2. Mode reminder

Current mode is LOCAL PREVIEW ONLY. Not for publication.

1. `<meta name="robots" content="noindex, nofollow">` is required.
2. Every fabricated fact is wrapped in `data-placeholder="true"`.
3. Every fabricated fact is preceded by `<!-- PLACEHOLDER: replace before launch — <what is needed> -->`.
4. Attributions use forename plus initial, plus role, plus sector.
5. Every placeholder is listed in `PLACEHOLDER-CONTENT.md`.

No pricing appears on this page. No pricing is confirmed.
No turnaround time appears on this page. No delivery-time evidence exists.
No result claim appears on this page. No analytics evidence exists.

## 3. Document structure

| # | Section | `id` | Background | Radius + overlap |
|---|---|---|---|---|
| 1 | Header | — | transparent | no |
| 2 | Page intro | `intro` | `--bg-blue` | no |
| 3 | Pillar 1 — Web Design | `web-design` | `--bg-cream` | yes |
| 4 | Pillar 2 — SEO | `seo` | `--bg-grey` | yes |
| 5 | Pillar 3 — Paid Advertising | `paid-advertising` | `--bg-blue` | yes |
| 6 | Pillar 4 — AI Services | `ai-services` | `--bg-cream` | yes |
| 7 | Combination band | `combinations` | `--bg-grey` | yes |
| 8 | FAQ | `faq` | `--bg-blue` | yes |
| 9 | Final CTA | `cta` | `--bg-cream` | yes |
| 10 | Footer | — | `--ink` | no |

Heading order:
- One `<h1>`, in the page intro.
- Each of sections 3 to 9 has one `<h2>`.
- Each capability or sub-item inside a pillar is an `<h3>`.
- No level is skipped.

Semantics:
- `<main id="main">` wraps sections 2 to 9.
- Each pillar is a `<section class="section section--cream" id="web-design" aria-labelledby="web-design-title">`.
- Capability lists are `<ul>`.
- The FAQ is a `<dl>` with one `<dt>` per question and one `<dd>` per answer.
- Do not use `<details>` for the FAQ. `<dl>` keeps the answers in the accessibility tree and visible with JS disabled.

## 4. Section 2 — Page intro

Structure:

```
section#intro
  div.container
    p.eyebrow           "Services"
    h1.page__title      page heading
    p.page__lead        lead paragraph
    ul.anchor-nav       four in-page links
```

`h1` copy, exact: `Four services. One goal: more of the right customers.`

Lead copy, exact: `Web design, SEO, paid advertising and AI services. Run one on its own or stack them in the order that pays back fastest for your business.`

Anchor nav, exactly four links, in this order:

1. `<a href="#web-design">Web Design</a>`
2. `<a href="#seo">SEO</a>`
3. `<a href="#paid-advertising">Paid Advertising</a>`
4. `<a href="#ai-services">AI Services</a>`

Anchor nav is a `<nav aria-label="Services on this page">` wrapping the `<ul>`.
Anchor links use `--radius-pill`, background `--surface`, border `1px solid var(--line)`, padding `var(--s-3) var(--s-5)`, font `--fs-small`.

Section padding-top is `calc(72px + var(--s-9))` to clear the fixed header, matching the home hero.

Tokens: `h1` uses `--fs-h1`, `--fw-heading`, `--lh-heading`, `--ls-heading`, colour `--ink-black`. Lead uses `--fs-lead`, colour `--ink-soft`, `max-width: var(--container-text)`.

Motion: `heading-mask.js` on the `h1`.

## 5. Pillar block template

All four pillar sections share this shape. Do not deviate.

```
section.section.section--{bg}#{id}
  div.container
    div.pillar__head
      p.eyebrow                 pillar number, e.g. "01"
      h2#{id}-title             pillar name
      p.pillar__lead            one lead line
    div.pillar__body
      ul.pillar__list           what is included, 4 to 5 items
      div.pillar__visual        decorative loop block, aria-hidden
    a.btn.btn--primary          CTA to /contact
```

Rules:
- The eyebrow is the two-digit pillar number: `01`, `02`, `03`, `04`.
- The `<h2>` text is the pillar name exactly as written in section 6 to 9 below.
- Each `<ul>` item is a short noun phrase, no full stop.
- `.pillar__visual` is decorative, contains no text, and has `aria-hidden="true"`.
- CTA text differs per pillar. Never use `Learn more`.
- Layout: `.pillar__body` is one column below 1024px and two columns at 1024px, list left, visual right. Gap `var(--gap-grid)`.

Tokens for every pillar:
- Eyebrow: `--fs-micro`, `--fw-medium`, `--ls-caps`, colour `--accent`.
- `h2`: `--fs-h2`, `--fw-heading`, `--lh-heading`, `--ls-heading`, colour `--ink-black`.
- Lead: `--fs-lead`, colour `--ink-soft`, `max-width: var(--container-text)`.
- List items: `--fs-body`, colour `--ink`, row gap `var(--s-3)`.
- Visual block: background `--surface`, radius `--radius-lg`, border `1px solid var(--line)`, `aspect-ratio: 4 / 3`.

## 6. Section 3 — Pillar 1, Web Design

Eyebrow: `01`
`h2` copy, exact: `Web Design`
Lead copy, exact: `Design and build from scratch, shaped around the one action you want a visitor to take. Responsive, fast, and easy to update.`

List items, exact:
1. `Design and build from scratch`
2. `Responsive across phone, tablet and desktop`
3. `Built for speed, hosted on Cloudflare`
4. `Conversion-focused layout and calls to action`
5. `Contact forms that reach you reliably`

CTA text: `Talk about a new site`
`.pillar__visual` loop type: `data-service-loop="mockup-slide"`

## 7. Section 4 — Pillar 2, SEO

Eyebrow: `02`
`h2` copy, exact: `SEO`
Lead copy, exact: `Technical fixes first, then on-page structure, then local search. The order matters, because ranking a broken page is wasted effort.`

List items, exact:
1. `Technical audit and fixes`
2. `On-page structure, titles and internal links`
3. `Local search and Google Business Profile`
4. `Content structure and keyword mapping`
5. `Core Web Vitals and page speed`

CTA text: `Ask about an SEO audit`
`.pillar__visual` loop type: `data-service-loop="cycle"`

Do not promise a ranking position.
Do not promise a timeframe to rank.

## 8. Section 5 — Pillar 3, Paid Advertising

Eyebrow: `03`
`h2` copy, exact: `Paid Advertising`
Lead copy, exact: `Meta and Google campaigns, set up properly the first time and managed month to month. You see the account, the spend and the results.`

List items, exact:
1. `Meta campaign setup and management`
2. `Google Search and Performance Max campaigns`
3. `Conversion tracking and event setup`
4. `Ad creative and landing page pairing`
5. `Monthly reporting in plain language`

CTA text: `Discuss an ad budget`
`.pillar__visual` loop type: `data-service-loop="cycle"`

Do not state a return on ad spend figure.
Do not state a cost per lead figure.

## 9. Section 6 — Pillar 4, AI Services

Eyebrow: `04`
`h2` copy, exact: `AI Services`
Lead copy, exact: `Five capabilities that remove repeat work and answer customers when you are not at your desk. Start with one, add the rest when it earns its place.`

This pillar uses five `<h3>` sub-blocks instead of a plain `<ul>`, because each capability needs a sentence of its own.
All five are mandatory. Do not merge them. Do not drop one. Do not add a sixth.

Capability 1
- `h3`: `AI chatbots and 24/7 customer engagement`
- Body: `A chatbot on your site that answers common questions, captures details and hands over to you when it matters.`

Capability 2
- `h3`: `AI-driven local SEO and Google Business Profile optimisation`
- Body: `Profile fields, service lists and posts kept current, with local queries mapped to the pages that answer them.`

Capability 3
- `h3`: `AI marketing automation across ads, email and social`
- Body: `Campaign variants, email sequences and social posts drafted and scheduled from one brief.`

Capability 4
- `h3`: `Workflow and operations automation`
- Body: `Quotes, bookings, invoices and follow-ups connected so the same detail is never typed twice.`

Capability 5
- `h3`: `AI analytics and reporting`
- Body: `One monthly summary that says what changed, what caused it and what to do next.`

Spelling note. Use `optimisation`, not `optimization`. British English is mandatory.

Layout: capability blocks are one column below 768px, two columns at 768px, and the fifth block spans both columns at 768px. At 1024px use three columns with the fourth and fifth on the second row.

`.pillar__visual` loop type: `data-service-loop="icon-fan"`
CTA text: `Scope an AI project`

## 10. Section 7 — Combination band

Structure:

```
section#combinations.section.section--grey
  div.container
    h2#combinations-title    heading
    p.section__lead          one lead line
    ul.combo__grid           three combination cards
```

`h2` copy, exact: `Common combinations.`
Lead copy, exact: `Most projects start in one of three ways.`

Card 1
- `h3`: `New business, no website`
- Body: `Web Design first, then Google Business Profile and local SEO once the site is live.`

Card 2
- `h3`: `Site exists, nobody finds it`
- Body: `SEO audit and fixes, then paid advertising to cover the gap while organic builds.`

Card 3
- `h3`: `Busy but drowning in admin`
- Body: `Workflow automation and a chatbot first, then reporting so you can see what is working.`

Tokens: reuse `.card` from `components.css`. Background `--surface`, radius `--radius-lg`, padding `var(--s-6)`.
Grid: one column below 768px, three at 1024px.

Motion: `reveal-stagger.js`.

## 11. Section 8 — FAQ

Six questions. Use a `<dl>`.

`h2` copy, exact: `Questions we get asked.`

Q1 `dt`: `Do you work with businesses outside Ireland?`
A1 `dd`: `Yes. We are based in Dublin and work with clients anywhere.`

Q2 `dt`: `Can you take on just one service?`
A2 `dd`: `Yes. Each of the four services runs on its own.`

Q3 `dt`: `Who owns the website when it is finished?`
A3 `dd`: `You do. The domain, the hosting account and the files are yours.`

Q4 `dt`: `What platform do you build on?`
A4 `dd`: `Usually a fast static build hosted on Cloudflare. WordPress when the site needs a full editor, as with SodoLT.`

Q5 `dt`: `Will I be able to update the site myself?`
A5 `dd`: `Yes. We agree which parts you need to edit before the build starts and set those up for you.`

Q6 `dt`: `How much does it cost?`
A6 `dd`: `It depends on scope. Book a short call and you will get a figure in writing.`
- Add before Q6: `<!-- PLACEHOLDER: replace before launch — pricing bands or starting price once confirmed by the client -->`
- Add `data-placeholder="true"` to the Q6 `<dd>`.
- Reason: the answer implies a pricing process that has not been confirmed.

Every other answer above is verifiable from confirmed facts and needs no marking.

Tokens: `dt` uses `--fs-h4`, `--fw-medium`, colour `--ink-black`. `dd` uses `--fs-body`, colour `--ink-soft`, margin-inline-start `0`, margin-block-end `var(--s-6)`.
FAQ container uses `.container--narrow`.

Motion: `reveal-stagger.js` on the `dl` children.

## 12. Section 9 — Final CTA

Identical structure and copy to `index.html` section 10, so the two pages agree.

`h2` copy, exact: `Tell us what the site has to do.`
Lead copy, exact: `A short call, no charge, no pitch deck. Based in Dublin, working with clients anywhere.`
Phone button: `<a class="btn btn--primary" href="tel:+353872520034">Call 087-2520034</a>`
Form button: `<a class="btn btn--ghost" href="/contact">Send a message</a>`

No email address. `[EVIDENCE NEEDED: business email]`

## 13. Footer

Identical to `index.html` section 13. Copy the markup exactly. Do not vary the wording.
The `Services` footer link carries `aria-current="page"` on this page.

## 14. Head requirements

```html
<title>Web Design, SEO, Paid Ads and AI Services | TheAnalytico</title>
<meta name="description" content="Four services from TheAnalytico: web design, SEO, Meta and Google advertising, and five AI capabilities including chatbots, automation and reporting.">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://theanalytico.com/services">
```

JSON-LD on this page: one `Service` node per pillar, four in total, plus a `BreadcrumbList`. Shapes are defined in spec 09 section 8.
No `AggregateRating`. No `review`. No `offers` with a price, because no price is confirmed.

## 15. Motion summary

| Section | Module | Gating |
|---|---|---|
| `h1` and every `h2` | `heading-mask.js` | desktop only |
| Section overlaps | `section-curtain.js` | desktop only |
| Pillar visual blocks | `service-loops.js` | desktop only |
| Combination cards | `reveal-stagger.js` | desktop only |
| FAQ items | `reveal-stagger.js` | desktop only |
| Cursor blob | `cursor-blob.js` | desktop only, pointer fine only |
| Smooth scroll | `lenis-scroll.js` | desktop only |

No carousel on this page.
No counters on this page.
No tilt cards on this page.

Anchor-link conflict warning. Lenis intercepts in-page anchor jumps. The anchor nav must use `lenis.scrollTo(target)` when Lenis is active, and native anchor behaviour when it is not. `lenis-scroll.js` owns this. See spec 08 section 13.

Anchor scroll offset must clear the fixed header. Offset is `-88` pixels.

## 16. Acceptance criteria

1. `services.html` contains exactly one `<h1>`.
2. Heading levels descend without skipping.
3. Sections appear in the order given in section 3.
4. Backgrounds run blue, cream, grey, blue, cream, grey, blue, cream.
5. No two adjacent rhythm sections share a background class.
6. All four pillar sections exist with ids `web-design`, `seo`, `paid-advertising`, `ai-services`.
7. Pillar `h2` texts are exactly `Web Design`, `SEO`, `Paid Advertising`, `AI Services`.
8. Pillar eyebrows are exactly `01`, `02`, `03`, `04`.
9. The AI Services section contains exactly five `<h3>` capability headings.
10. The five capability headings match the five strings in section 9, character for character.
11. The word `optimisation` appears with an `s`, not a `z`.
12. The anchor nav contains exactly four links, matching the four pillar ids.
13. Every anchor `href` resolves to an `id` that exists on the page.
14. The FAQ is a `<dl>` with six `<dt>` and six `<dd>`.
15. The FAQ does not use `<details>` or `<summary>`.
16. The Q6 `<dd>` has `data-placeholder="true"` and a preceding PLACEHOLDER comment.
17. No price, currency symbol, or numeric cost appears anywhere on the page.
18. No turnaround time in days or weeks appears anywhere on the page.
19. No ranking position claim appears anywhere on the page.
20. No return on ad spend or cost per lead figure appears anywhere on the page.
21. `<meta name="robots" content="noindex, nofollow">` is present.
22. The canonical link points at `https://theanalytico.com/services`.
23. JSON-LD contains four `Service` nodes.
24. JSON-LD contains no `aggregateRating`, `review`, or `offers` key.
25. Every `data-placeholder="true"` element has a matching row in `PLACEHOLDER-CONTENT.md`.
26. Every `.pillar__visual` block has `aria-hidden="true"` and contains no text nodes.
27. Every CTA button text is unique across the four pillars, and none reads `Learn more`.
28. The header, footer, and button markup are byte-identical to `index.html` apart from `aria-current`.
29. The `Services` footer and header nav links carry `aria-current="page"`.
30. No new component class is introduced for a pattern already styled in `components.css`.
31. No inline `<style>` block, except the critical-CSS block in `<head>`.
32. Exactly one inline `<script>`, the header anti-flash script.
33. No `on*` attribute anywhere in the file.
34. No hex colour anywhere in the file.
35. With JS disabled, all nine sections are fully visible and all FAQ answers are readable.
36. With JS disabled, the four anchor links still jump to their sections.
37. Lighthouse mobile scores 95 or above on all four categories.
38. CLS below 0.05.
39. British English throughout.
40. No email address appears anywhere on the page.

## 17. Non-goals

Do not add a pricing table.
Do not add a comparison table against competitors.
Do not add a service-level agreement.
Do not add testimonials to this page. Testimonials live on `index.html` only.
Do not add KPI counters to this page.
Do not add a peek carousel to this page.
Do not add a team section.
Do not add a case study block. Case studies live on `work.html`.
Do not add a sixth AI capability.
Do not add a fifth pillar.
Do not create individual pages per service.
Do not edit `tokens.css`, `base.css`, or `components.css`.
Do not write any `.js` file.
