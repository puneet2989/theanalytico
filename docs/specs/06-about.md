# Spec 06 — About page (`about.html`)

Owner agents: `html-builder` (Haiku 4.5) for markup, `css-stylist` (Sonnet 5) for `pages.css`.
Phase: 6. Starts only after `index.html` passes Phase 4.

## 1. Files

`html-builder` may create or edit only:

- `about.html`

`css-stylist` may edit only:

- `assets/css/pages.css`

Do not create any other file.
Do not edit `tokens.css`, `base.css`, or `components.css`.
Do not write any `.js` file.

## 2. Mode reminder and the hardest constraint on this page

Current mode is LOCAL PREVIEW ONLY. Not for publication.

An About page normally leans on facts this project does not have. The following are all unconfirmed and must not be stated:

- Founding year — unconfirmed
- Team member names — unconfirmed
- Team size — unconfirmed
- Headshots — none exist
- Street address — unconfirmed
- Postcode — unconfirmed
- Company registration number — unconfirmed
- Opening hours — unconfirmed
- Social profile URLs — unconfirmed
- Business email — not supplied
- Awards — the client confirmed there are none. Do not invent one. Do not write "award-winning".
- Certifications, partner badges, Google Partner status — unconfirmed

Confirmed facts available for this page:

- Name: TheAnalytico
- Location: Dublin, Ireland
- Phone: 087-2520034, `tel:+353872520034`
- Service area: Worldwide
- Three shipped client sites: ArdLens, KC Accountants, SodoLT
- Four services: Web Design, SEO, Paid Advertising, AI Services
- Awards: none

Therefore this page is built around approach and method, not history and headcount. Every place where a normal About page would state a fact this project lacks, use a placeholder with all four markings.

`<meta name="robots" content="noindex, nofollow">` is required.

## 3. Document structure

| # | Section | `id` | Background | Radius + overlap |
|---|---|---|---|---|
| 1 | Header | — | transparent | no |
| 2 | Page intro | `intro` | `--bg-blue` | no |
| 3 | How we work | `how-we-work` | `--bg-cream` | yes |
| 4 | Principles | `principles` | `--bg-grey` | yes |
| 5 | Who we work with | `who` | `--bg-blue` | yes |
| 6 | Team | `team` | `--bg-cream` | yes |
| 7 | Location and contact | `location` | `--bg-grey` | yes |
| 8 | Final CTA | `cta` | `--bg-blue` | yes |
| 9 | Footer | — | `--ink` | no |

Heading order:
- One `<h1>`, in the page intro.
- Each of sections 3 to 8 has one `<h2>`.
- Sub-blocks use `<h3>`.

Semantics:
- `<main id="main">` wraps sections 2 to 8.
- The principles list is a `<ul>`.
- The "how we work" steps are an `<ol>`, because the order is meaningful.
- Location details sit in an `<address>` element.

## 4. Section 2 — Page intro

Structure:

```
section#intro
  div.container
    p.eyebrow        "About"
    h1.page__title   page heading
    p.page__lead     lead paragraph
    p.page__lead     second paragraph
```

`h1` copy, exact: `A small studio in Dublin, building sites that earn their keep.`

Lead paragraph 1, exact: `TheAnalytico designs and builds websites, then does the work that gets them found: SEO, paid advertising on Meta and Google, and AI automation that removes repeat admin.`

Lead paragraph 2, exact: `Three client sites are live so far, across film, professional services and wellness. We are based in Dublin and work with clients anywhere.`

Both statements are verifiable from confirmed facts. No placeholder marking needed.

Do not write a founding year in this section.
Do not write a team size in this section.
Do not write "since 20XX".

Section padding-top is `calc(72px + var(--s-9))`.

Tokens: `h1` uses `--fs-h1`, `--fw-heading`, `--lh-heading`, `--ls-heading`, colour `--ink-black`. Leads use `--fs-lead`, colour `--ink-soft`, `max-width: var(--container-text)`, gap between paragraphs `var(--s-5)`.

Motion: `heading-mask.js` on the `h1`.

## 5. Section 3 — How we work

Four steps. Same four as the home page process section, same wording, so the pages agree, with one extra sentence each because there is room here.

`h2` copy, exact: `How a project runs.`
Lead copy, exact: `Four steps. You know what happens next at every point.`

Step 1
- `h3`: `Call`
- Body: `A short call to work out what the site has to do and who it has to reach. No slide deck, no discovery invoice.`

Step 2
- `h3`: `Plan`
- Body: `Structure, copy direction and a build order, written down. You approve it before anything is designed.`

Step 3
- `h3`: `Build`
- Body: `Design and build together, in the open, with a live preview link from day one. You see it as it happens rather than at a reveal.`

Step 4
- `h3`: `Grow`
- Body: `Ship it, then layer on SEO, ads or automation depending on what moves first. One thing at a time, measured.`

Do not state a project duration.
Do not state a number of revision rounds.
Do not state a payment schedule.

Use an `<ol>`. Step numbers come from CSS counters, not typed digits, so screen readers hear the list semantics once.

Tokens: each step card background `--surface`, radius `--radius-lg`, padding `var(--s-6)`, border `1px solid var(--line)`. Counter uses `--fs-h3`, colour `--accent`.
Grid: one column below 768px, two at 768px, four at 1024px.

Motion: `tilt-cards.js`.

## 6. Section 4 — Principles

Five principles. These are statements of intent, not factual claims, so they need no evidence marking.

`h2` copy, exact: `Five things we hold to.`

Principle 1
- `h3`: `Speed is a feature`
- Body: `A slow site loses people before it says anything. Every build is measured on a mid-range phone, not a desktop on office broadband.`

Principle 2
- `h3`: `You own everything`
- Body: `Your domain, your hosting account, your files. No licence that expires when you stop paying us.`

Principle 3
- `h3`: `Plain language`
- Body: `No impressions, no reach, no growth-hacking. Reports say what changed and what to do next.`

Principle 4
- `h3`: `Only claim what is measured`
- Body: `If we cannot show you the number, we will not put it on a slide.`

Principle 5
- `h3`: `Start small, then add`
- Body: `One service, done properly, beats four half-run. Add the next when the first is paying back.`

Tokens: reuse `.card`. Background `--surface`, radius `--radius-lg`, padding `var(--s-6)`.
Grid: one column below 640px, two at 768px, three at 1024px. The fifth card spans one column and the row is left-aligned. Do not stretch the last card to fill.

Motion: `reveal-stagger.js`.

## 7. Section 5 — Who we work with

`h2` copy, exact: `Who we work with.`
Lead copy, exact: `Local businesses where one or two people make every decision. So far that has meant film, professional services and wellness.`

Three sector blocks, drawn from the three real clients. Do not invent a fourth sector.

Block 1
- `h3`: `Creative and film`
- Body: `Studios and freelancers whose work sells itself once someone sees it. The site's job is to get out of the way.`
- Reference line: `Built for ArdLens`

Block 2
- `h3`: `Professional services`
- Body: `Accountants, consultants and advisers where trust is decided in the first ten seconds on a phone screen.`
- Reference line: `Built for KC Accountants`

Block 3
- `h3`: `Health and wellness`
- Body: `Practitioners offering treatments people have to understand before they will book.`
- Reference line: `Built for SodoLT`

Reference lines are factual. The three sites are live and the client approved naming them.
Reference lines are plain text, not links. The Work page carries the links.

Do not write "and many others".
Do not write "clients include" in a way that implies more than three.
Do not add a fourth sector block.

Tokens: block background `--surface`, radius `--radius-lg`, padding `var(--s-6)`. Reference line uses `--fs-micro`, `--ls-caps`, colour `--accent`.
Grid: one column below 768px, three at 1024px.

Motion: `reveal-stagger.js`.

## 8. Section 6 — Team

This section is entirely placeholder. No team names, roles, or headshots are confirmed.

`h2` copy, exact: `The people.`

Structure:

```
section#team.section.section--cream
  div.container.container--narrow
    h2#team-title              "The people."
    p.team__note               placeholder paragraph
```

Add before the paragraph: `<!-- PLACEHOLDER: replace before launch — team member names, roles, and headshots, or delete this entire section -->`
Add `data-placeholder="true"` to the paragraph.

Placeholder copy, exact: `A small team working directly with each client, with no account manager in between.`

Rules for this section, all mandatory:
1. No person's name appears.
2. No headshot image appears.
3. No job title attributed to a named individual appears.
4. No team size number appears. The word `small` is a qualitative statement, not a count, and is acceptable.
5. No LinkedIn or social link appears.
6. Do not add a stock photograph of people. A stock photo presented as the team is a fabrication.
7. Do not add a placeholder grey avatar circle. It advertises the gap.

`[EVIDENCE NEEDED: team member names, roles, and headshots]`

If the client supplies no team detail before launch, the launch step is to delete this section entirely rather than publish the placeholder. Record that decision in `PLACEHOLDER-CONTENT.md`.

## 9. Section 7 — Location and contact

`h2` copy, exact: `Where we are.`

Structure:

```
section#location.section.section--grey
  div.container
    h2#location-title    "Where we are."
    div.location__grid
      div                 address block
      div                 service area block
```

Address block:

```html
<address class="location__address">
  <p>TheAnalytico</p>
  <p>Dublin, Ireland</p>
  <p><a href="tel:+353872520034">087-2520034</a></p>
  <!-- PLACEHOLDER: replace before launch — street address, postcode, business email, opening hours, company registration number -->
</address>
```

Rules:
1. `Dublin, Ireland` is the full extent of the confirmed location. Write nothing more granular.
2. No street address. `[EVIDENCE NEEDED: street address]`
3. No postcode or Eircode. `[EVIDENCE NEEDED: postcode]`
4. No email address. `[EVIDENCE NEEDED: business email]`
5. No opening hours. `[EVIDENCE NEEDED: opening hours]`
6. No company registration number. `[EVIDENCE NEEDED: company registration number]`
7. No embedded map. An embedded map is a third-party script and there is no address to pin.
8. The phone number is confirmed. It needs no placeholder marking.

Service area block:
- `h3`: `Service area`
- Body, exact: `Based in Dublin. We work with clients anywhere, remotely.`
- This is a confirmed fact. No placeholder marking.

Tokens: `<address>` uses `font-style: normal`, `--fs-body`, colour `--ink`. Phone link colour `--ink`, hover `--accent`.
Grid: one column below 768px, two at 768px.

Motion: none.

## 10. Section 8 — Final CTA

`h2` copy, exact: `Tell us what the site has to do.`
Lead copy, exact: `A short call, no charge, no pitch deck. Based in Dublin, working with clients anywhere.`
Phone button: `<a class="btn btn--primary" href="tel:+353872520034">Call 087-2520034</a>`
Form button: `<a class="btn btn--ghost" href="/contact">Send a message</a>`

No email address. `[EVIDENCE NEEDED: business email]`

## 11. Footer

Identical to `index.html` section 13.
The `About` footer and header nav links carry `aria-current="page"` on this page.

## 12. Head requirements

```html
<title>About TheAnalytico: Web, SEO and AI Studio in Dublin | TheAnalytico</title>
<meta name="description" content="TheAnalytico is a Dublin studio building fast websites and running SEO, paid advertising and AI automation for local businesses. Three client sites live, working worldwide.">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://theanalytico.com/about">
```

JSON-LD on this page: `BreadcrumbList` plus `AboutPage`. Shapes are in spec 09 section 8.
Do not emit an `Organization` node with `foundingDate`. No founding year is confirmed.
Do not emit an `employee` or `founder` node. No team names are confirmed.
Do not emit `award`. The client confirmed there are none.
Do not emit `streetAddress`, `postalCode`, `openingHours`, or `email`.
No `AggregateRating`. No `review`.

## 13. Motion summary

| Section | Module | Gating |
|---|---|---|
| `h1` and every `h2` | `heading-mask.js` | desktop only |
| Section overlaps | `section-curtain.js` | desktop only |
| How we work steps | `tilt-cards.js` | desktop only |
| Principles cards | `reveal-stagger.js` | desktop only |
| Who we work with blocks | `reveal-stagger.js` | desktop only |
| Cursor blob | `cursor-blob.js` | desktop only, pointer fine only |
| Smooth scroll | `lenis-scroll.js` | desktop only |

No carousel on this page.
No counters on this page.
No service loops on this page.

## 14. Acceptance criteria

1. `about.html` contains exactly one `<h1>`.
2. Heading levels descend without skipping.
3. Sections appear in the order given in section 3.
4. Backgrounds run blue, cream, grey, blue, cream, grey, blue.
5. No two adjacent rhythm sections share a background class.
6. The "how we work" list is an `<ol>` with exactly four `<li>`.
7. Step numbers are generated by a CSS counter, not typed as text in the HTML.
8. The four step headings are exactly `Call`, `Plan`, `Build`, `Grow`, matching `index.html`.
9. The principles section contains exactly five `<h3>` headings.
10. The "who we work with" section contains exactly three `<h3>` blocks.
11. The three reference lines name exactly ArdLens, KC Accountants, and SodoLT.
12. No fourth sector or fourth client is named or implied.
13. The strings `and many others`, `among others`, and `award-winning` appear zero times.
14. The team section contains zero person names.
15. The team section contains zero `<img>` elements.
16. The team paragraph has `data-placeholder="true"` and a preceding PLACEHOLDER comment.
17. No founding year appears anywhere on the page. No four-digit year other than the footer copyright year appears.
18. No team size number appears anywhere on the page.
19. No street address appears anywhere on the page.
20. No postcode or Eircode appears anywhere on the page.
21. No email address appears anywhere on the page.
22. No opening hours appear anywhere on the page.
23. No company registration number appears anywhere on the page.
24. No social profile link appears anywhere on the page.
25. No award or certification claim appears anywhere on the page.
26. No embedded map or iframe appears anywhere on the page.
27. The `<address>` element exists, has `font-style: normal` applied, and contains the text `Dublin, Ireland`.
28. The phone link is `tel:+353872520034`.
29. The `<address>` block is followed by a PLACEHOLDER comment listing the missing contact fields.
30. `<meta name="robots" content="noindex, nofollow">` is present.
31. The canonical points at `https://theanalytico.com/about`.
32. JSON-LD contains no `foundingDate`, `employee`, `founder`, `award`, `streetAddress`, `postalCode`, `openingHours`, or `email` key.
33. JSON-LD contains no `aggregateRating` and no `review`.
34. Every `data-placeholder="true"` element has a matching row in `PLACEHOLDER-CONTENT.md`.
35. The header, footer, and button markup match `index.html` apart from `aria-current`.
36. No inline `<style>` block, except the critical-CSS block in `<head>`.
37. Exactly one inline `<script>`, the header anti-flash script.
38. No `on*` attribute anywhere in the file.
39. No hex colour anywhere in the file.
40. With JS disabled, all seven sections are fully visible and readable.
41. Lighthouse mobile scores 95 or above on all four categories.
42. CLS below 0.05.
43. British English throughout.

## 15. Non-goals

Do not add a timeline or history section.
Do not add a "founded in" line.
Do not add team member cards, names, roles, or headshots.
Do not add a stock photo of an office or of people.
Do not add a mission statement block beyond the five principles.
Do not add client logos.
Do not add partner or certification badges.
Do not add an embedded map.
Do not add a careers or hiring section.
Do not add testimonials to this page.
Do not add KPI counters to this page.
Do not add a peek carousel.
Do not edit `tokens.css`, `base.css`, or `components.css`.
Do not write any `.js` file.
