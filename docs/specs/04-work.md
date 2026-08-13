# Spec 04 — Work page (`work.html`)

Owner agents: `html-builder` (Haiku 4.5) for markup, `css-stylist` (Sonnet 5) for `pages.css`.
Phase: 6. Starts only after `index.html` passes Phase 4.

## 1. Files

`html-builder` may create or edit only:

- `work.html`

`css-stylist` may edit only:

- `assets/css/pages.css`

Image assets required, produced by `html-builder` in Phase 6:

- `assets/img/work/ardlens-card.webp` — 800×600
- `assets/img/work/ardlens-full.webp` — 1600×1000
- `assets/img/work/kc-accountants-card.webp` — 800×600
- `assets/img/work/kc-accountants-full.webp` — 1600×1000
- `assets/img/work/sodolt-card.webp` — 800×600
- `assets/img/work/sodolt-full.webp` — 1600×1000

Screenshots are captured from the live URLs. No headless browser is installed in this workspace. Install one before the capture step, or the build stops here.
Until captures exist, reference the paths and add `<!-- PLACEHOLDER: replace before launch — real screenshot captured from the live URL -->` above each `<img>`, plus `data-placeholder="true"` on the wrapping figure.

Do not create any other file.
Do not edit `tokens.css`, `base.css`, or `components.css`.
Do not write any `.js` file.

## 2. Mode reminder and truth rules

Current mode is LOCAL PREVIEW ONLY. Not for publication.

Absolute rules for this page. These are stricter than elsewhere, because the three clients are real businesses.

1. No traffic figure for any of the three projects. No analytics evidence exists.
2. No ranking claim for any of the three projects.
3. No revenue or lead-count claim for any of the three projects.
4. No quote attributed to ArdLens, KC Accountants, or SodoLT. They never said it.
5. No conversion-rate figure.
6. No before-and-after metric.
7. Only these claims may be stated as fact: built, shipped, live, sector, stack, hosting.
8. Every fabricated fact carries `data-placeholder="true"`, a preceding PLACEHOLDER comment, and a row in `PLACEHOLDER-CONTENT.md`.
9. `<meta name="robots" content="noindex, nofollow">` is required.

`../rmyf` must not appear anywhere on this page. It is an unpublished Next.js project and is excluded from the portfolio.
Do not mention a fourth project.
Do not write "and more".
Do not write "selected clients include" in a way that implies others exist.

## 3. Verified portfolio facts

All three confirmed returning HTTP 200 on 13 August 2026. The client approved naming them publicly.

| Project | URL | Sector | Stack | Hosting |
|---|---|---|---|---|
| ArdLens | `https://ardlens.com` | Aerial cinematography, coastal and heritage Ireland | Static site plus a Cloudflare Worker contact form | Cloudflare |
| KC Accountants | `https://kc-accountant.puneetcf.workers.dev` | Accountancy practice, Ireland | Static site plus a Cloudflare Worker contact form | Cloudflare |
| SodoLT | `https://sodolt.com` | In-home LinfoModellante massage therapy | WordPress | third-party WordPress host |

KC Accountants URL note. The `kc-accountant.puneetcf.workers.dev` URL is client-approved for now. Use it as the live link. It is still marked as a placeholder because a production domain is expected.
`[EVIDENCE NEEDED: KC Accountants production domain]`

SodoLT is WordPress. Do not describe it as a static build. Do not describe it as hosted on Cloudflare.

## 4. Document structure

| # | Section | `id` | Background | Radius + overlap |
|---|---|---|---|---|
| 1 | Header | — | transparent | no |
| 2 | Page intro | `intro` | `--bg-blue` | no |
| 3 | Case study — ArdLens | `ardlens` | `--bg-cream` | yes |
| 4 | Case study — KC Accountants | `kc-accountants` | `--bg-grey` | yes |
| 5 | Case study — SodoLT | `sodolt` | `--bg-blue` | yes |
| 6 | Approach band | `approach` | `--bg-cream` | yes |
| 7 | Final CTA | `cta` | `--bg-grey` | yes |
| 8 | Footer | — | `--ink` | no |

Heading order:
- One `<h1>`, in the page intro.
- Each of sections 3 to 7 has one `<h2>`.
- Case study sub-blocks use `<h3>`.

Semantics:
- `<main id="main">` wraps sections 2 to 7.
- Each case study is `<article class="case" id="ardlens" aria-labelledby="ardlens-title">`.
- Each screenshot sits in a `<figure>` with a `<figcaption>`.
- Fact rows sit in a `<dl>`.

## 5. Section 2 — Page intro

Structure:

```
section#intro
  div.container
    p.eyebrow        "Work"
    h1.page__title   page heading
    p.page__lead     lead paragraph
    ul.work__index   three jump links
```

`h1` copy, exact: `Three sites, built and shipped.`

Lead copy, exact: `Film, professional services and wellness. Each one live, each one built to be found and to make getting in touch easy. What follows is what we built and how, not invented numbers.`

The last clause is deliberate. It sets expectations honestly and removes the pressure to fabricate metrics.

Jump links, exactly three:
1. `<a href="#ardlens">ArdLens</a>`
2. `<a href="#kc-accountants">KC Accountants</a>`
3. `<a href="#sodolt">SodoLT</a>`

Wrap in `<nav aria-label="Case studies on this page">`.
Anchor scroll offset is `-88` pixels, handled by `lenis-scroll.js`.

Section padding-top is `calc(72px + var(--s-9))`.

Tokens: `h1` uses `--fs-h1`, `--fw-heading`, `--lh-heading`, `--ls-heading`, colour `--ink-black`. Lead uses `--fs-lead`, colour `--ink-soft`, `max-width: var(--container-text)`.

Motion: `heading-mask.js` on the `h1`.

## 6. Case study block template

All three case studies share this shape. Do not deviate.

```
article.case#{id}
  div.container
    div.case__head
      p.eyebrow                sector chip text
      h2#{id}-title            project name
      p.case__lead             one or two sentences
    figure.case__figure
      img.case__img            full-width screenshot
      figcaption.case__caption caption text
    div.case__grid
      dl.case__facts           four fact rows
      div.case__notes
        h3                     "What we built"
        ul                     three to four items
    a.btn.btn--primary         visit link
```

Fact rows. Exactly four `<dt>` and four `<dd>` per case study, in this order:

1. `dt` `Sector` — `dd` sector text
2. `dt` `Stack` — `dd` stack text
3. `dt` `Status` — `dd` `Live`
4. `dt` `Hosting` — `dd` hosting text

Do not add a fifth fact row. Do not add `Results`. Do not add `Timeline`.

Visit link text is `Visit <name>`, with `target="_blank"`, `rel="noopener"`, and a visually hidden ` (opens in a new tab)`.

Screenshot `<img>` rules:
- `width="1600"` and `height="1000"` attributes are mandatory.
- `loading="lazy"` and `decoding="async"`.
- `aspect-ratio: 8 / 5` in CSS so lazy loading causes no CLS.
- `alt` describes what the screenshot shows. Never `screenshot` alone.

Tokens for every case study:
- Figure radius `--radius-lg`, border `1px solid var(--line)`, background `--surface`.
- Caption `--fs-micro`, colour `--ink-soft`, margin-top `var(--s-3)`.
- `dt` `--fs-micro`, `--ls-caps`, colour `--ink-soft`.
- `dd` `--fs-body`, colour `--ink`, margin-inline-start `0`.
- `.case__grid` is one column below 1024px and two columns at 1024px, gap `var(--gap-grid)`.
- Vertical gaps: head to figure `var(--s-7)`, figure to grid `var(--s-7)`, grid to button `var(--s-7)`.

## 7. Section 3 — ArdLens

Eyebrow: `Aerial cinematography`
`h2` copy, exact: `ArdLens`

Lead copy, exact: `An aerial cinematography studio filming the Irish coast and heritage sites. The site had to put the footage first and make an enquiry take one action.`

Screenshot: `assets/img/work/ardlens-full.webp`
Alt: `The ArdLens homepage, with a full-width aerial shot of the Irish coastline above the enquiry link`
Caption: `ardlens.com — homepage`

Facts:
- Sector: `Aerial cinematography, coastal and heritage Ireland`
- Stack: `Static site plus a Cloudflare Worker contact form`
- Status: `Live`
- Hosting: `Cloudflare`

`What we built` items, exact:
1. `Full-bleed video and stills layout that puts footage first`
2. `Single-action enquiry form handled by a Cloudflare Worker`
3. `Static build for fast loading on mobile connections`
4. `Structured page titles and descriptions for search`

Visit link: `https://ardlens.com`, text `Visit ArdLens`.

No placeholder marking needed on this block, other than the screenshot until it is captured.

## 8. Section 4 — KC Accountants

Eyebrow: `Accountancy practice`
`h2` copy, exact: `KC Accountants`

Lead copy, exact: `An accountancy practice in Ireland. The brief was clarity: what the practice does, who it is for and how to get in touch, without accountancy jargon.`

Screenshot: `assets/img/work/kc-accountants-full.webp`
Alt: `The KC Accountants homepage, showing the services overview and the contact panel`
Caption: `KC Accountants — homepage`

Facts:
- Sector: `Accountancy practice, Ireland`
- Stack: `Static site plus a Cloudflare Worker contact form`
- Status: `Live`
- Hosting: `Cloudflare`

`What we built` items, exact:
1. `Plain-language service pages for each area of practice`
2. `Contact form with server-side validation on a Cloudflare Worker`
3. `Static build with no CMS overhead to maintain`
4. `Clear contact details on every page`

Visit link: `https://kc-accountant.puneetcf.workers.dev`, text `Visit KC Accountants`.

Placeholder marking, mandatory:
- Before the visit link: `<!-- PLACEHOLDER: replace before launch — KC Accountants production domain; kc-accountant.puneetcf.workers.dev is client-approved interim -->`
- `data-placeholder="true"` on the visit link element.
- Also add the same comment above the `Hosting` `<dd>` is not required. Only the URL is provisional.

Do not describe the workers.dev URL as a permanent address in the visible copy. Just link it.

## 9. Section 5 — SodoLT

Eyebrow: `Massage therapy`
`h2` copy, exact: `SodoLT`

Lead copy, exact: `In-home LinfoModellante massage therapy. The site explains a treatment most people have not heard of, then makes booking a session straightforward.`

Screenshot: `assets/img/work/sodolt-full.webp`
Alt: `The SodoLT homepage, explaining the LinfoModellante treatment above the booking section`
Caption: `sodolt.com — homepage`

Facts:
- Sector: `In-home LinfoModellante massage therapy`
- Stack: `WordPress`
- Status: `Live`
- Hosting: `Third-party WordPress hosting`

`What we built` items, exact:
1. `WordPress build so the owner can edit treatments and availability`
2. `Treatment explainer pages for an unfamiliar therapy`
3. `Booking enquiry route from every page`
4. `Mobile-first layout for phone bookings`

Visit link: `https://sodolt.com`, text `Visit SodoLT`.

Do not claim Cloudflare hosting for SodoLT.
Do not claim a static build for SodoLT.
`[EVIDENCE NEEDED: SodoLT hosting provider name — recorded only as third-party WordPress hosting]`
Add `data-placeholder="true"` to the Hosting `<dd>` on this case study, with the comment `<!-- PLACEHOLDER: replace before launch — confirm SodoLT hosting provider name -->`.

## 10. Section 6 — Approach band

Structure:

```
section#approach.section.section--cream
  div.container
    h2#approach-title   heading
    p.section__lead     one lead line
    ul.approach__grid   four cards
```

`h2` copy, exact: `What every build gets.`
Lead copy, exact: `The same foundations, whether the site is five pages or fifty.`

Card 1
- `h3`: `Speed by default`
- Body: `Static where possible, images sized correctly, nothing loaded that is not used.`

Card 2
- `h3`: `Findable structure`
- Body: `One clear heading per page, descriptive titles, internal links that make sense.`

Card 3
- `h3`: `Contact that works`
- Body: `Forms validated on the server, tested end to end before launch.`

Card 4
- `h3`: `Yours to keep`
- Body: `Your domain, your hosting account, your files.`

Tokens: reuse `.card`. Background `--surface`, radius `--radius-lg`, padding `var(--s-6)`.
Grid: one column below 640px, two at 640px, four at 1024px.

Motion: `tilt-cards.js`.

## 11. Section 7 — Final CTA

Identical structure and copy to `index.html` section 10.

`h2` copy, exact: `Tell us what the site has to do.`
Lead copy, exact: `A short call, no charge, no pitch deck. Based in Dublin, working with clients anywhere.`
Phone button: `<a class="btn btn--primary" href="tel:+353872520034">Call 087-2520034</a>`
Form button: `<a class="btn btn--ghost" href="/contact">Send a message</a>`

No email address. `[EVIDENCE NEEDED: business email]`

## 12. Footer

Identical to `index.html` section 13.
The `Work` footer and header nav links carry `aria-current="page"` on this page.

## 13. Head requirements

```html
<title>Our Work: Three Live Client Sites | TheAnalytico</title>
<meta name="description" content="Case studies from TheAnalytico: ArdLens aerial cinematography, KC Accountants, and SodoLT massage therapy. What we built, the stack, and links to each live site.">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://theanalytico.com/work">
```

JSON-LD on this page: `BreadcrumbList` plus one `CreativeWork` node per project. Shapes are in spec 09 section 8.
No `AggregateRating`. No `review`. No result metric in structured data.

## 14. Motion summary

| Section | Module | Gating |
|---|---|---|
| `h1` and every `h2` | `heading-mask.js` | desktop only |
| Section overlaps | `section-curtain.js` | desktop only |
| Case study screenshots | `hero-tilt.js` | desktop only |
| Approach cards | `tilt-cards.js` | desktop only |
| Cursor blob | `cursor-blob.js` | desktop only, pointer fine only |
| Smooth scroll | `lenis-scroll.js` | desktop only |

`hero-tilt.js` is reused for the three case screenshots. Each `<img>` carries `data-hero-tilt`.
Do not write a second tilt module for this page.

No carousel on this page.
No counters on this page.
No service loops on this page.
`work-hover.js` is not used here, because these are full-width figures, not hover cards.

## 15. Acceptance criteria

1. `work.html` contains exactly one `<h1>`.
2. Exactly three `<article class="case">` elements exist, with ids `ardlens`, `kc-accountants`, `sodolt`.
3. The three case studies appear in the order ArdLens, KC Accountants, SodoLT.
4. Backgrounds run blue, cream, grey, blue, cream, grey.
5. No two adjacent rhythm sections share a background class.
6. Each case study has exactly four `<dt>` and four `<dd>` elements.
7. The fact row labels are exactly `Sector`, `Stack`, `Status`, `Hosting`, in that order, in all three case studies.
8. No case study contains a fact row labelled `Results`, `Traffic`, `Timeline`, or `Revenue`.
9. The ArdLens visit link href is exactly `https://ardlens.com`.
10. The KC Accountants visit link href is exactly `https://kc-accountant.puneetcf.workers.dev`.
11. The SodoLT visit link href is exactly `https://sodolt.com`.
12. The KC Accountants visit link has `data-placeholder="true"` and a preceding PLACEHOLDER comment naming the production domain.
13. The SodoLT `Stack` value is exactly `WordPress`.
14. The SodoLT `Hosting` value does not contain the string `Cloudflare`.
15. The SodoLT `Hosting` `<dd>` has `data-placeholder="true"` and a preceding PLACEHOLDER comment.
16. The string `rmyf` appears zero times in `work.html`.
17. The string `Next.js` appears zero times in `work.html`.
18. No percentage sign appears in any case study block.
19. No numeral followed by `%` appears anywhere on the page.
20. The words `traffic`, `ranking`, `revenue`, `leads increased`, and `conversion rate` appear zero times as claims about the three projects.
21. No `<blockquote>` element exists on the page.
22. No quote is attributed to ArdLens, KC Accountants, or SodoLT.
23. No fourth project is named or implied. The strings `and more`, `among others`, and `selected clients` appear zero times.
24. Every screenshot `<img>` has both `width` and `height` attributes.
25. Every screenshot `<img>` has `loading="lazy"`.
26. Every screenshot `<img>` has a descriptive `alt` longer than 20 characters.
27. Every `<figure>` has a `<figcaption>`.
28. Every external link has `target="_blank"`, `rel="noopener"`, and a visually hidden new-tab warning.
29. The three jump links resolve to existing ids.
30. `<meta name="robots" content="noindex, nofollow">` is present.
31. The canonical points at `https://theanalytico.com/work`.
32. JSON-LD contains no `aggregateRating` and no `review`.
33. JSON-LD contains no numeric result metric.
34. Every `data-placeholder="true"` element has a matching row in `PLACEHOLDER-CONTENT.md`.
35. The header, footer, and button markup match `index.html` apart from `aria-current`.
36. No inline `<style>` block, except the critical-CSS block in `<head>`.
37. Exactly one inline `<script>`, the header anti-flash script.
38. No `on*` attribute anywhere in the file.
39. No hex colour anywhere in the file.
40. With JS disabled, all three case studies and all facts are visible and readable.
41. Lighthouse mobile scores 95 or above on all four categories.
42. CLS below 0.05.
43. British English throughout.
44. No email address appears anywhere on the page.

## 16. Non-goals

Do not add a results or metrics block to any case study.
Do not add a testimonial to any case study.
Do not add a fourth case study.
Do not reference `../rmyf` in any form.
Do not add a client logo image.
Do not add a filter or category control. Three items do not need filtering.
Do not add a lightbox or image zoom.
Do not add a video embed.
Do not add a "next project" navigation link.
Do not add a peek carousel.
Do not add KPI counters.
Do not create individual case study pages.
Do not edit `tokens.css`, `base.css`, or `components.css`.
Do not write any `.js` file.
