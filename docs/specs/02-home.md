# Spec 02 — Home page (`index.html`)

Owner agents: `html-builder` (Haiku 4.5) for markup, `css-stylist` (Sonnet 5) for `components.css` and `pages.css`, `motion-engineer` (Sonnet 5) for modules.

`index.html` is the reference implementation. No other page starts until this page passes Phase 4 review.

## 1. Files

`html-builder` may create or edit only:

- `index.html`

`css-stylist` may create or edit only:

- `assets/css/components.css`
- `assets/css/pages.css`

Image assets referenced here are produced in Phase 6 by `html-builder`:

- `assets/img/hero/hero-primary.webp`
- `assets/img/hero/chip-1.webp`
- `assets/img/hero/chip-2.webp`
- `assets/img/work/ardlens-card.webp`
- `assets/img/work/kc-accountants-card.webp`
- `assets/img/work/sodolt-card.webp`

Do not create any other file.
Do not edit `assets/css/tokens.css`.
Do not edit `assets/css/base.css`.
Do not write any `.js` file.

## 2. Mode reminder

Current mode is LOCAL PREVIEW ONLY. Not for publication.

Therefore, on this page:

1. `<meta name="robots" content="noindex, nofollow">` is required in `<head>`.
2. Every fabricated fact is wrapped in an element carrying `data-placeholder="true"`.
3. Every fabricated fact is preceded by `<!-- PLACEHOLDER: replace before launch — <what is needed> -->`.
4. Every fabricated attribution is forename plus initial, plus role, plus sector. Example: `Aoife M., Practice Owner, Accountancy`.
5. Every placeholder is listed in `PLACEHOLDER-CONTENT.md`.

No invented quote may be attributed to ArdLens, KC Accountants, or SodoLT.
No `AggregateRating` and no `review` in JSON-LD, regardless of what the visible page shows.

## 3. Document structure

Section order, top to bottom. Do not reorder.

| # | Section | `id` | Background | Radius + overlap |
|---|---|---|---|---|
| 1 | Header | — | transparent | no |
| 2 | Hero | `hero` | `--bg-blue` | no |
| 3 | Trust strip | `trust` | `--bg-cream` | yes |
| 4 | Services | `services` | `--bg-grey` | yes |
| 5 | Work preview | `work` | `--bg-blue` | yes |
| 6 | Process | `process` | `--bg-cream` | yes |
| 7 | KPI band | `results` | `--bg-grey` | yes |
| 8 | Testimonials | `testimonials` | `--bg-blue` | yes |
| 9 | Insights preview | `insights` | `--bg-cream` | yes |
| 10 | Final CTA | `cta` | `--bg-grey` | yes |
| 11 | Footer | — | `--ink` | no |

Rhythm check. Backgrounds run blue, cream, grey, blue, cream, grey, blue, cream, grey. No two adjacent sections share a background.

Heading order:
- One `<h1>`, in the hero.
- Each of sections 3 to 10 has one `<h2>`.
- Cards inside sections use `<h3>`.
- Sub-items inside cards use `<h4>`.
- Never skip a level. No `<h3>` before an `<h2>`.

Semantics:
- `<main id="main">` wraps sections 2 to 10.
- Each rhythm section is a `<section class="section section--blue">` etc, with an `id`, and `aria-labelledby` pointing at its own `<h2>` id.
- The work preview list is a `<ul>`.
- The services list is a `<ul>`.
- The insights list is a `<ul>`.
- The testimonial carousel is a `<div role="region" aria-label="Client testimonials" aria-roledescription="carousel">`.
- Each testimonial is a `<blockquote>` with a `<figcaption>` sibling inside a `<figure>`.
- The footer is `<footer>`.

## 4. Section 2 — Hero

Structure:

```
section#hero
  div.container
    p.eyebrow                     "Dublin based, working worldwide"
    h1.hero__title                headline with inline chips and doodle
    p.hero__lead                  lead paragraph
    div.hero__actions             two buttons
    div.hero__visual              primary image, tilted
```

Headline copy, exact. Word spans are added by JS, not by `html-builder`. Write plain text plus the two chip images and the doodle.

`h1` text: `We build websites that bring local businesses more customers.`

Inline chips: two small rounded images sit inside the `h1` flow.
- Chip 1 sits immediately after the word `websites`.
- Chip 2 sits immediately after the word `customers`.
- Each chip is `<img class="hero__chip" src="/assets/img/hero/chip-1.webp" width="72" height="48" alt="" aria-hidden="true">`.
- Chips are decorative. `alt=""` and `aria-hidden="true"` are required so the headline reads cleanly to screen readers.
- Chip border-radius is `var(--radius-md)`.
- Chip vertical alignment is `middle`.

Doodle: one inline SVG, hand-drawn underline stroke, sitting under the word `more`.
- Inline `<svg class="hero__doodle" viewBox="0 0 120 12" fill="none" aria-hidden="true" data-hero-doodle>`.
- One `<path>`, `stroke="currentColor"`, `stroke-width="3"`, `stroke-linecap="round"`, `fill="none"`.
- The path is a single loose sweep, not a straight line. Slight overshoot at both ends.
- Colour comes from CSS: `.hero__doodle { color: var(--accent); }`.
- The path has `pathLength="1"` so `stroke-dashoffset` animation is trivial.

Eyebrow copy, exact: `Dublin based, working worldwide`
This is a confirmed business fact. No placeholder marking needed.

Lead copy, exact: `Web design, SEO, paid advertising and AI services for businesses that need to be found and chosen. Three sites shipped and live. Built fast, hosted on Cloudflare.`

`Three sites shipped and live` is a confirmed fact. No placeholder marking needed.

Actions:
- Primary button: `<a class="btn btn--primary" href="/contact">Start a project</a>`
- Secondary button: `<a class="btn btn--ghost" href="/work">See our work</a>`

Hero visual:
- `<img class="hero__visual-img" src="/assets/img/hero/hero-primary.webp" width="1200" height="800" alt="The ArdLens website homepage shown on a laptop screen" data-hero-tilt loading="eager" fetchpriority="high" decoding="async">`
- `width` and `height` attributes are mandatory to protect CLS.
- `loading="eager"` because it is above the fold. Never `loading="lazy"` here.
- Alt text is descriptive, not `hero image`.

Tokens:
- `h1` uses `--fs-display`, `--fw-medium`, `--lh-display`, `--ls-display`, colour `--ink-black`.
- Eyebrow uses `--fs-micro`, `--fw-medium`, `--ls-caps`, colour `--ink-soft`, `text-transform` not used, write the copy in sentence case.
- Lead uses `--fs-lead`, colour `--ink-soft`, `max-width: var(--container-text)`.
- Vertical rhythm inside the hero: eyebrow to `h1` gap `var(--s-4)`, `h1` to lead gap `var(--s-5)`, lead to actions gap `var(--s-6)`, actions to visual gap `var(--s-8)`.
- Hero section padding-top is `calc(72px + var(--s-9))` to clear the fixed header.

Motion:
- Heading rise: module `heading-mask.js`. See spec 08 section 3.
- Hero visual tilt: module `hero-tilt.js`. See spec 08 section 2.
- Doodle draw: module `heading-mask.js` handles it as part of the hero timeline. `stroke-dashoffset` 1 to 0, duration 0.6s, ease `power2.out`, delay 0.5s after the heading completes.

## 5. Section 3 — Trust strip

Structure:

```
section#trust.section.section--cream
  div.container
    h2#trust-title (visually hidden)   "Who we have built for"
    ul.trust__list                     three items, one per real client
    p.trust__note                      one line of context
```

The `h2` is visually hidden using `.visually-hidden` so the heading order stays valid without adding visual noise.

List items, exact text. These are confirmed facts. No placeholder marking.

1. `ArdLens — aerial cinematography, Ireland`
2. `KC Accountants — accountancy practice, Ireland`
3. `SodoLT — massage therapy, Ireland`

Note copy, exact: `Three live sites across film, professional services and wellness.`

Do not add client logos. No logo files exist and none are authorised.
Do not add a count-up here. The KPI band owns counters.

Tokens: list items use `--fs-small`, colour `--ink`, gap `var(--s-6)`, `--fs-micro` for the note, colour `--ink-soft`.

Motion: none. This strip is static.

## 6. Section 4 — Services

Structure:

```
section#services.section.section--grey
  div.container
    p.eyebrow                     "What we do"
    h2#services-title             section heading
    p.section__lead               one lead line
    ul.services__grid             four cards
    a.btn.btn--ghost              link to /services
```

`h2` copy, exact: `Four ways we get you found and chosen.`

Lead copy, exact: `Pick one or run them together. Most local businesses need a site that converts first, then traffic, then automation.`

Four cards. One per pillar. Order is fixed.

Card 1
- `h3`: `Web Design`
- Body: `Design and build from scratch. Responsive, fast, and shaped around the action you want a visitor to take.`
- Inner loop: `mockup-slide`

Card 2
- `h3`: `SEO`
- Body: `Technical fixes, on-page structure, and local search so the people nearby find you first.`
- Inner loop: `cycle`

Card 3
- `h3`: `Paid Advertising`
- Body: `Meta and Google campaigns, set up properly and managed month to month.`
- Inner loop: `cycle`

Card 4
- `h3`: `AI Services`
- Body: `Five capabilities, from chatbots to reporting. Full list on the services page.`
- Inner loop: `icon-fan`

Card markup shape:

```html
<li class="card card--service">
  <div class="card__loop" data-service-loop="mockup-slide" aria-hidden="true">
    <!-- decorative shapes, no text -->
  </div>
  <h3 class="card__title">Web Design</h3>
  <p class="card__body">Design and build from scratch...</p>
  <a class="card__link" href="/services#web-design">Web Design details</a>
</li>
```

The `.card__link` text is descriptive, not `Learn more`. Screen readers list links out of context.
The `.card__loop` block is decorative only. It contains no text. `aria-hidden="true"` is mandatory.

Tokens: card background `--surface`, radius `--radius-lg`, padding `var(--s-6)`, border `1px solid var(--line)`, shadow `--shadow-sm`, hover shadow `--shadow-md`.
Grid: one column below 640px, two columns at 640px, four columns at 1024px. Gap `var(--gap-grid)`.

Motion: module `service-loops.js`. See spec 08 section 7.
Card entrance: module `reveal-stagger.js`. See spec 08 section 12.

## 7. Section 5 — Work preview

Structure:

```
section#work.section.section--blue
  div.container
    p.eyebrow            "Selected work"
    h2#work-title        section heading
    ul.work__grid        three cards
    a.btn.btn--ghost     link to /work
```

`h2` copy, exact: `Three sites, shipped and live.`

Three cards. Real facts only. Copy is identical in wording to spec 04 so the two pages agree.

Card 1 — ArdLens
- Image: `assets/img/work/ardlens-card.webp`, alt `The ArdLens homepage, showing aerial footage of the Irish coast`
- `h3`: `ArdLens`
- Sector chip: `Aerial cinematography`
- Stack chip: `Static + Cloudflare Worker`
- Link: `https://ardlens.com`

Card 2 — KC Accountants
- Image: `assets/img/work/kc-accountants-card.webp`, alt `The KC Accountants homepage, showing the services overview`
- `h3`: `KC Accountants`
- Sector chip: `Accountancy practice`
- Stack chip: `Static + Cloudflare Worker`
- Link: `https://kc-accountant.puneetcf.workers.dev`
- The client has approved this URL for now. Use it as the live link.
- Add before the link: `<!-- PLACEHOLDER: replace before launch — KC Accountants production domain; workers.dev URL is client-approved interim -->`
- Wrap the link in `data-placeholder="true"`.

Card 3 — SodoLT
- Image: `assets/img/work/sodolt-card.webp`, alt `The SodoLT homepage, showing the treatment booking section`
- `h3`: `SodoLT`
- Sector chip: `Massage therapy`
- Stack chip: `WordPress`
- Link: `https://sodolt.com`

Link text rule: every card link text is `Visit <name>`, for example `Visit ArdLens`. Add `rel="noopener"` and `target="_blank"`. Add a visually hidden `(opens in a new tab)`.

Do not state a traffic figure on any work card.
Do not state a ranking on any work card.
Do not state a revenue figure on any work card.
No analytics evidence exists for any of the three.

Card markup shape:

```html
<li class="card card--work" data-work-card>
  <a class="card--work__media" href="https://ardlens.com" target="_blank" rel="noopener">
    <img src="/assets/img/work/ardlens-card.webp" width="800" height="600" alt="The ArdLens homepage, showing aerial footage of the Irish coast" loading="lazy" decoding="async" data-work-img>
    <span class="card--work__chip" data-work-chip>Aerial cinematography</span>
  </a>
  <h3 class="card__title">ArdLens</h3>
  <p class="card__meta">Static + Cloudflare Worker</p>
  <a class="card__link" href="https://ardlens.com" target="_blank" rel="noopener">Visit ArdLens<span class="visually-hidden"> (opens in a new tab)</span></a>
</li>
```

Tokens: media radius `--radius-lg`, chip background `--surface`, chip text `--ink`, chip radius `--radius-pill`, chip padding `var(--s-2) var(--s-4)`, chip font `--fs-micro`.
Grid: one column below 640px, two at 640px, three at 1024px.
Media aspect ratio is `4 / 3`, set with `aspect-ratio`, so no CLS on lazy load.

Motion: module `work-hover.js`. See spec 08 section 8.

## 8. Section 6 — Process

Structure:

```
section#process.section.section--cream
  div.container
    p.eyebrow          "How it runs"
    h2#process-title   section heading
    ol.process__list   four steps
```

`h2` copy, exact: `Four steps, no mystery.`

Use an `<ol>`. The steps are ordered.

Step 1
- `h3`: `Call`
- Body: `A short call to work out what the site has to do and who it has to reach.`

Step 2
- `h3`: `Plan`
- Body: `Structure, copy direction, and a build order. You approve it before anything is designed.`

Step 3
- `h3`: `Build`
- Body: `Design and build together, in the open, with a live preview link from day one.`

Step 4
- `h3`: `Grow`
- Body: `Ship it, then layer on SEO, ads, or automation depending on what moves first.`

Do not state a turnaround time. No delivery-time evidence exists.

Tokens: each step is a card, background `--surface`, radius `--radius-lg`, padding `var(--s-6)`. Step number uses `--fs-h3`, colour `--accent`.
Grid: one column below 768px, two at 768px, four at 1024px.

Motion: module `tilt-cards.js`. See spec 08 section 10.

## 9. Section 7 — KPI band

Every number in this section is fabricated. All four placeholder rules apply to every number.

Structure:

```
section#results.section.section--grey
  div.container
    h2#results-title   section heading
    ul.kpi__list       four counters
    p.kpi__disclaimer  preview-mode note
```

`h2` copy, exact: `Numbers so far.`

KPI 1 — real, not a placeholder.
- Value: `3`
- Suffix: none
- Label: `sites shipped and live`
- This is a confirmed fact. Do not mark it as a placeholder. Do not add `data-placeholder`.

KPI 2 — placeholder.
- Value: `42`
- Prefix: `+`
- Suffix: `%`
- Label: `organic sessions in six months`
- Comment: `<!-- PLACEHOLDER: replace before launch — real organic sessions delta from Search Console or GA4, or delete this KPI -->`
- Attribute: `data-placeholder="true"`

KPI 3 — placeholder.
- Value: `1.2`
- Suffix: `s`
- Label: `average largest contentful paint`
- Comment: `<!-- PLACEHOLDER: replace before launch — real LCP measured across the three live sites -->`
- Attribute: `data-placeholder="true"`

KPI 4 — placeholder.
- Value: `98`
- Suffix: none
- Label: `average Lighthouse performance score`
- Comment: `<!-- PLACEHOLDER: replace before launch — real Lighthouse scores for the three live sites -->`
- Attribute: `data-placeholder="true"`

Disclaimer copy, exact, and itself a placeholder:
`Preview figures. Real measurements replace these before launch.`
- Comment: `<!-- PLACEHOLDER: replace before launch — delete this disclaimer line once KPIs are real -->`
- Attribute: `data-placeholder="true"`

KPI markup shape:

```html
<!-- PLACEHOLDER: replace before launch — real organic sessions delta from Search Console or GA4, or delete this KPI -->
<li class="kpi" data-placeholder="true">
  <p class="kpi__value"><span data-counter data-counter-to="42" data-counter-prefix="+" data-counter-suffix="%" data-counter-decimals="0">+42%</span></p>
  <p class="kpi__label">organic sessions in six months</p>
</li>
```

The `<span>` inner text is the final value written into the HTML. With JS disabled the number reads correctly. JS overwrites it to the start value then counts up.

Tokens: value uses `--fs-h1`, `--fw-medium`, `--ls-display`, colour `--ink-black`. Label uses `--fs-small`, colour `--ink-soft`. Disclaimer uses `--fs-micro`, colour `--ink-soft`.
Grid: two columns below 768px, four at 768px.

Motion: module `kpi-counter.js`. See spec 08 section 11.

Reserve the value width so the count-up does not reflow. Set `font-variant-numeric: tabular-nums` on `.kpi__value` and a `min-width` in `ch` units on the counter span.

## 10. Section 8 — Testimonials

Every testimonial on this page is fabricated. All four placeholder rules apply to every one.

Structure:

```
section#testimonials.section.section--blue
  div.container
    h2#testimonials-title   section heading
    div.carousel            peek carousel, three slides
    div.carousel__controls  previous and next buttons
```

`h2` copy, exact: `What clients say.`

Add before the carousel: `<!-- PLACEHOLDER: replace before launch — real client testimonials with written permission, or delete this whole section -->`
Add `data-placeholder="true"` to the carousel container as well as to each slide.

Three slides. Attribution is forename plus initial, plus role, plus sector. No surnames. No company names.
No quote is attributed to ArdLens, KC Accountants, or SodoLT. Those are real businesses and never said these words.

Slide 1
- Quote: `The site went live in weeks and it finally looks like the business we actually are. Enquiries come through the form now instead of by chance.`
- Attribution: `Aoife M., Practice Owner, Accountancy`

Slide 2
- Quote: `They rebuilt the booking flow and explained every change. I can update my own treatment list without ringing anyone.`
- Attribution: `Declan R., Owner, Wellness`

Slide 3
- Quote: `The pages load instantly on a phone, which matters when clients are looking us up on site.`
- Attribution: `Niamh K., Director, Creative Services`

Slide markup shape:

```html
<!-- PLACEHOLDER: replace before launch — real testimonial with written permission -->
<figure class="slide" data-placeholder="true" data-carousel-slide>
  <blockquote class="slide__quote"><p>The site went live in weeks...</p></blockquote>
  <figcaption class="slide__cite">Aoife M., Practice Owner, Accountancy</figcaption>
</figure>
```

Do not add a headshot. No stock photo may be presented as a client.
Do not add a star rating graphic.
Do not add `AggregateRating` or `review` to the JSON-LD on this page.

Controls:
- `<button type="button" data-carousel-prev aria-label="Previous testimonial">`
- `<button type="button" data-carousel-next aria-label="Next testimonial">`
- Buttons are real `<button>` elements, keyboard reachable.
- `aria-disabled="true"` when at the first or last slide.

Tokens: slide background `--surface`, radius `--radius-lg`, padding `var(--s-7)`, quote uses `--fs-h4` and colour `--ink`, cite uses `--fs-small` and colour `--ink-soft`.
Peek: slide width is `min(78vw, 520px)`, so the next slide is partly visible at the right edge. Gap `var(--s-5)`.

Motion: module `peek-carousel.js`. See spec 08 section 9.

## 11. Section 9 — Insights preview

Insight posts are genuine advice content, not client claims. They are not placeholders.

Structure:

```
section#insights.section.section--cream
  div.container
    p.eyebrow            "Insights"
    h2#insights-title    section heading
    ul.insights__grid    three cards
    a.btn.btn--ghost     link to /insights
```

`h2` copy, exact: `Practical notes on getting found.`

Three cards. Titles and standfirsts match spec 05 exactly.

Card 1
- `h3`: `What a local business actually needs on a homepage`
- Standfirst: `Six blocks, in order, and why the phone number belongs above the fold.`
- Category: `Web design`
- Read time: `5 min read`

Card 2
- `h3`: `Google Business Profile: the fields most people skip`
- Standfirst: `Services, attributes, and the description field that quietly does the work.`
- Category: `SEO`
- Read time: `6 min read`

Card 3
- `h3`: `Where AI helps a small team, and where it wastes money`
- Standfirst: `Chatbots, reporting, and the automations worth building first.`
- Category: `AI`
- Read time: `7 min read`

Read times are estimates of the drafted articles, not claims about the business. They are acceptable without placeholder marking, provided the article word counts support them. If an article is not yet drafted, omit the read time rather than invent one.

Card links point at `/insights` for now, because individual post pages are not in Phase 6 scope.
Add before the grid: `<!-- PLACEHOLDER: replace before launch — individual post URLs once posts are published; all three currently link to /insights -->`
Add `data-placeholder="true"` to the grid `<ul>`.

Do not add a publication date. No post is published.
Do not add an author name. No team names are confirmed.

Tokens: card background `--surface`, radius `--radius-lg`, padding `var(--s-6)`. Category uses `--fs-micro` and colour `--accent`. Read time uses `--fs-micro` and colour `--ink-soft`.
Grid: one column below 768px, three at 1024px.

Motion: module `reveal-stagger.js`. See spec 08 section 12.

## 12. Section 10 — Final CTA

Structure:

```
section#cta.section.section--grey
  div.container.container--narrow
    h2#cta-title      heading
    p.cta__lead       lead line
    div.cta__actions  phone link and contact button
```

`h2` copy, exact: `Tell us what the site has to do.`

Lead copy, exact: `A short call, no charge, no pitch deck. Based in Dublin, working with clients anywhere.`

Actions:
- Phone: `<a class="btn btn--primary" href="tel:+353872520034">Call 087-2520034</a>`
- The phone number and the `tel:` value are confirmed facts. Do not mark as placeholder.
- Form: `<a class="btn btn--ghost" href="/contact">Send a message</a>`

Do not put an email address here. The business email is not supplied.
`[EVIDENCE NEEDED: business email]`

Tokens: centred text, `h2` uses `--fs-h2`, lead uses `--fs-lead` and colour `--ink-soft`, actions gap `var(--s-4)`.

Motion: module `heading-mask.js` on the `h2`.

## 13. Footer

Structure:

```
footer.footer
  div.container
    div.footer__brand    lockup plus one line
    nav.footer__nav      five links, aria-label "Footer"
    div.footer__contact   phone and location
    p.footer__legal      copyright line
```

Brand line copy, exact: `Web design, SEO, paid advertising and AI services. Dublin, Ireland.`

Footer nav links: Home, Services, Work, Insights, About, Contact Us. Six links.

Contact block:
- `Dublin, Ireland`
- `<a href="tel:+353872520034">087-2520034</a>`
- No street address. None is confirmed.
- No email. None is supplied. `[EVIDENCE NEEDED: business email]`

Legal line copy, exact: `© 2026 TheAnalytico. All rights reserved.`

Do not add a company registration number. None is confirmed.
Do not add social profile links. No URLs are confirmed.
Add: `<!-- PLACEHOLDER: replace before launch — social profile URLs, business email, company registration number if required -->`

Tokens: footer background `--ink`, footer text `--surface`, footer links `--surface` with `--accent` on hover, footer legal `--fs-micro` with `--ink-soft` swapped for a light tone; use `--surface` at 60% via a new token if contrast fails. If a token is needed, add `--surface-60: rgba(255,255,255,0.60)` to `tokens.css` and note it.

Contrast requirement: footer text on `--ink` must reach 4.5:1. `--surface` on `--ink` passes. `--ink-soft` on `--ink` fails. Do not use `--ink-soft` in the footer.

## 14. Head requirements

```html
<title>Web Design, SEO and AI Services in Dublin | TheAnalytico</title>
<meta name="description" content="TheAnalytico builds fast websites and runs SEO, Meta and Google ads, and AI automation for local businesses. Based in Dublin, working worldwide.">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://theanalytico.com/">
```

`[EVIDENCE NEEDED: production domain for TheAnalytico — canonical uses theanalytico.com as a placeholder]`

Full head contract, including Open Graph, Twitter, and JSON-LD, is in spec 09. Follow spec 09 for those tags.
JSON-LD on this page is `ProfessionalService`. Shape is defined in spec 09 section 8.

## 15. Motion summary for this page

| Section | Module | Gating |
|---|---|---|
| Hero heading and doodle | `heading-mask.js` | desktop only |
| Hero visual | `hero-tilt.js` | desktop only |
| All section headings | `heading-mask.js` | desktop only |
| Section overlaps | `section-curtain.js` | desktop only |
| Cursor blob | `cursor-blob.js` | desktop only, pointer fine only |
| Service card loops | `service-loops.js` | desktop only |
| Work card hover | `work-hover.js` | desktop only, hover capable only |
| Testimonial carousel | `peek-carousel.js` | mobile enabled |
| Process cards | `tilt-cards.js` | desktop only |
| KPI counters | `kpi-counter.js` | mobile enabled |
| Insights grid | `reveal-stagger.js` | desktop only |
| Smooth scroll | `lenis-scroll.js` | desktop only |

Every module skips entirely when `prefers-reduced-motion: reduce` matches. No exceptions.
Every module skips when `matchMedia('(max-width: 768px)')` matches, unless the table above says mobile enabled.

## 16. Acceptance criteria

1. `index.html` contains exactly one `<h1>`.
2. Heading levels descend without skipping on a full document outline pass.
3. Sections appear in the order given in section 3 of this spec.
4. Section background classes follow blue, cream, grey, blue, cream, grey, blue, cream, grey.
5. No two adjacent rhythm sections share a background class.
6. Every rhythm section has `aria-labelledby` pointing at an existing heading `id`.
7. `<main id="main">` exists and the skip link targets it.
8. The hero `img` has both `width` and `height` attributes.
9. The hero `img` has `loading="eager"` and `fetchpriority="high"`.
10. Every other `img` on the page has `loading="lazy"`.
11. Every `img` has a non-empty `alt`, except the two hero chips which have `alt=""` and `aria-hidden="true"`.
12. The two hero chips appear inside the `<h1>` element.
13. The hero doodle is inline SVG with `pathLength="1"` and `stroke="currentColor"`.
14. The services grid contains exactly four `<li>` cards, titled Web Design, SEO, Paid Advertising, AI Services, in that order.
15. The work grid contains exactly three `<li>` cards, titled ArdLens, KC Accountants, SodoLT, in that order.
16. The ArdLens card links to `https://ardlens.com`.
17. The KC Accountants card links to `https://kc-accountant.puneetcf.workers.dev`.
18. The SodoLT card links to `https://sodolt.com`.
19. No work card states a traffic, ranking, or revenue figure.
20. Every external link has `rel="noopener"` and a visually hidden new-tab warning.
21. The process list is an `<ol>` with exactly four `<li>`.
22. The KPI list has exactly four `<li>`.
23. The KPI with value `3` has no `data-placeholder` attribute.
24. The three other KPIs each have `data-placeholder="true"`.
25. Each of the three placeholder KPIs is preceded by a `<!-- PLACEHOLDER: ... -->` comment.
26. Each counter span contains its final value as text, so the number is correct with JS disabled.
27. The testimonial carousel container has `data-placeholder="true"`.
28. All three testimonial slides have `data-placeholder="true"`.
29. All three testimonial slides are preceded by a `<!-- PLACEHOLDER: ... -->` comment.
30. No testimonial names a company.
31. No testimonial uses a surname longer than a single initial.
32. No testimonial is attributed to ArdLens, KC Accountants, or SodoLT.
33. No headshot image appears in the testimonial section.
34. The page JSON-LD contains no `aggregateRating` key.
35. The page JSON-LD contains no `review` key.
36. The page JSON-LD contains no `streetAddress` key.
37. `grep -c 'data-placeholder="true"' index.html` returns at least 6.
38. Every `data-placeholder="true"` element in `index.html` has a matching row in `PLACEHOLDER-CONTENT.md`.
39. `<meta name="robots" content="noindex, nofollow">` is present.
40. The phone link is `tel:+353872520034` in both the CTA and the footer.
41. No email address appears anywhere on the page.
42. No street address appears anywhere on the page.
43. No social profile link appears anywhere on the page.
44. No founding year appears anywhere on the page.
45. No team member name appears anywhere on the page.
46. No award claim appears anywhere on the page.
47. Footer text uses `--surface`, never `--ink-soft`.
48. No inline `<style>` block exists, except the critical-CSS block in `<head>`.
49. Exactly one inline `<script>` exists, and it is the header anti-flash script.
50. No `on*` attribute exists anywhere in the file.
51. No hex colour appears in `index.html`, except inside `assets/logo` SVG paths which are stroke `currentColor` and therefore have none either.
52. With JS disabled, every section is fully visible, all text is readable, and no element has `opacity: 0`.
53. With JS disabled, the carousel shows at least the first slide and the prev and next buttons do nothing rather than erroring.
54. Lighthouse mobile scores are 95 or above on Performance, Accessibility, Best Practices, and SEO.
55. CLS is below 0.05, measured on a throttled mobile profile.
56. British English throughout. `optimise` not `optimize`. `personalise` not `personalize`.

## 17. Non-goals

Do not add a newsletter signup.
Do not add a cookie banner. No analytics or tracking script is loaded.
Do not add a live chat widget.
Do not add a pricing section. No pricing is confirmed.
Do not add a team section. No team names are confirmed.
Do not add client logo images.
Do not add a blog post detail page.
Do not add a video embed.
Do not load any third-party script, font, or stylesheet.
Do not edit `tokens.css` or `base.css`.
Do not create any `.js` file.
Do not create any other `.html` page.
