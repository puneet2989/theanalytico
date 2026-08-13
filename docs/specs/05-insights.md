# Spec 05 — Insights page (`insights.html`)

Owner agents: `html-builder` (Haiku 4.5) for markup, `css-stylist` (Sonnet 5) for `pages.css`.
Phase: 6. Starts only after `index.html` passes Phase 4.

## 1. Files

`html-builder` may create or edit only:

- `insights.html`

`css-stylist` may edit only:

- `assets/css/pages.css`

Do not create individual post pages in this phase.
Do not create any other file.
Do not edit `tokens.css`, `base.css`, or `components.css`.
Do not write any `.js` file.

## 2. Mode reminder and content policy

Current mode is LOCAL PREVIEW ONLY. Not for publication.

Insight content is genuine advice. Expertise claims about a subject are not claims about past clients, so the article text below is not a fabrication and does not need placeholder marking.

What does need placeholder marking on this page:

1. Publication dates. No post is published. `data-placeholder="true"` plus a PLACEHOLDER comment on every date.
2. Author names. No team names are confirmed. Omit authors entirely rather than invent one.
3. Read times. Acceptable only if the drafted article supports the figure. Since no article is drafted, mark every read time as a placeholder.
4. Individual post URLs. No post pages exist. Every card links to `#` and is marked as a placeholder.

`<meta name="robots" content="noindex, nofollow">` is required.

No claim about a client's results appears on this page.
No invented statistic appears in any article summary. If a figure would help, write `[EVIDENCE NEEDED: source for this figure]` instead of a number.

## 3. Document structure

| # | Section | `id` | Background | Radius + overlap |
|---|---|---|---|---|
| 1 | Header | — | transparent | no |
| 2 | Page intro | `intro` | `--bg-blue` | no |
| 3 | Featured post | `featured` | `--bg-cream` | yes |
| 4 | Post grid | `all-posts` | `--bg-grey` | yes |
| 5 | Topics band | `topics` | `--bg-blue` | yes |
| 6 | Final CTA | `cta` | `--bg-cream` | yes |
| 7 | Footer | — | `--ink` | no |

Heading order:
- One `<h1>`, in the page intro.
- Each of sections 3 to 6 has one `<h2>`.
- Each post card title is an `<h3>`.

Semantics:
- `<main id="main">` wraps sections 2 to 6.
- The post grid is a `<ul>`, one `<li>` per post, each containing an `<article>`.
- The featured post is a single `<article>`.
- Category labels are plain text, not links, because no category pages exist.

## 4. Section 2 — Page intro

Structure:

```
section#intro
  div.container
    p.eyebrow        "Insights"
    h1.page__title   page heading
    p.page__lead     lead paragraph
```

`h1` copy, exact: `Practical notes on getting found.`

Lead copy, exact: `Short, specific pieces on web design, search and AI for small businesses. No growth-hacking, no jargon, just the things that move the needle when you have one person doing everything.`

Section padding-top is `calc(72px + var(--s-9))`.

Tokens: `h1` uses `--fs-h1`, `--fw-heading`, `--lh-heading`, `--ls-heading`, colour `--ink-black`. Lead uses `--fs-lead`, colour `--ink-soft`, `max-width: var(--container-text)`.

Motion: `heading-mask.js` on the `h1`.

## 5. Section 3 — Featured post

One post, laid out wider than the grid cards.

`h2` copy, exact: `Start here.`

Featured post is post 1 from the list in section 6.

Structure:

```
section#featured.section.section--cream
  div.container
    h2#featured-title            "Start here."
    article.post.post--featured
      p.post__cat                category label
      h3.post__title             post title as a link
      p.post__standfirst         standfirst
      p.post__meta               read time and date
      a.post__link               "Read the full piece"
```

Post title is wrapped in an `<a>`. The `<a>` href is `#`.
Add before the `<article>`: `<!-- PLACEHOLDER: replace before launch — individual post URL once the post is published -->`
Add `data-placeholder="true"` to the `<article>`.

Layout: two columns at 1024px, text left occupying 7 of 12 columns, an empty decorative block right occupying 5 of 12. The decorative block has `aria-hidden="true"` and no text. Below 1024px it is a single column and the decorative block is hidden with `display: none`.

Tokens: article background `--surface`, radius `--radius-lg`, padding `var(--s-7)`, border `1px solid var(--line)`.
Category uses `--fs-micro`, `--ls-caps`, colour `--accent`.
Title uses `--fs-h3`, `--fw-medium`, `--ls-heading`, colour `--ink-black`.
Standfirst uses `--fs-lead`, colour `--ink-soft`.
Meta uses `--fs-micro`, colour `--ink-soft`.

## 6. Section 4 — Post grid

`h2` copy, exact: `All pieces.`

Six posts total. Post 1 also appears as the featured post above; in the grid, render posts 2 to 6 only, so no post appears twice.
Therefore the grid contains exactly five `<li>` items.

Post metadata rules for every card:
- Category: plain text, from the fixed set `Web design`, `SEO`, `Paid ads`, `AI`.
- Read time: marked as a placeholder.
- Date: marked as a placeholder.
- Author: omitted.
- Link: `#`, marked as a placeholder.

Post 1 — featured, also the source for the home page insights card
- Category: `Web design`
- Title: `What a local business actually needs on a homepage`
- Standfirst: `Six blocks, in order, and why the phone number belongs above the fold.`
- Read time: `5 min read`
- Date: `August 2026`
- Body direction for a future draft: the six blocks are what you do, who for, proof, price signal, contact, and location. Order matters because most visitors leave from the first screen.

Post 2 — also on the home page
- Category: `SEO`
- Title: `Google Business Profile: the fields most people skip`
- Standfirst: `Services, attributes, and the description field that quietly does the work.`
- Read time: `6 min read`
- Date: `August 2026`
- Body direction: fill every service, set attributes honestly, keep the description factual, post occasionally, answer questions yourself.

Post 3 — also on the home page
- Category: `AI`
- Title: `Where AI helps a small team, and where it wastes money`
- Standfirst: `Chatbots, reporting, and the automations worth building first.`
- Read time: `7 min read`
- Date: `July 2026`
- Body direction: automate the repeat, the boring and the after-hours. Do not automate judgement, pricing, or apologies.

Post 4
- Category: `Web design`
- Title: `Why your site feels slow even though it looks finished`
- Standfirst: `Unsized images, four font files, and a chat widget nobody uses.`
- Read time: `5 min read`
- Date: `July 2026`
- Body direction: sized images, two font faces, no third-party widgets, lazy load below the fold.

Post 5
- Category: `Paid ads`
- Title: `Before you spend a euro on Meta ads`
- Standfirst: `Conversion tracking, one clear offer, and a landing page that matches the ad.`
- Read time: `6 min read`
- Date: `June 2026`
- Body direction: tracking first, one offer per campaign, message match, then budget.

Post 6
- Category: `SEO`
- Title: `Local search when you serve a whole county`
- Standfirst: `Service-area businesses, one location page, and the pages not to build.`
- Read time: `6 min read`
- Date: `June 2026`
- Body direction: do not build a page per town. Build one strong page and prove the service area properly.

Card markup shape:

```html
<!-- PLACEHOLDER: replace before launch — individual post URL, publication date, and verified read time -->
<li>
  <article class="post" data-placeholder="true">
    <p class="post__cat">SEO</p>
    <h3 class="post__title"><a href="#">Google Business Profile: the fields most people skip</a></h3>
    <p class="post__standfirst">Services, attributes, and the description field that quietly does the work.</p>
    <p class="post__meta"><span data-placeholder="true">6 min read</span> · <time datetime="2026-08" data-placeholder="true">August 2026</time></p>
  </article>
</li>
```

Tokens: card background `--surface`, radius `--radius-lg`, padding `var(--s-6)`, border `1px solid var(--line)`, shadow `--shadow-sm`.
Grid: one column below 640px, two at 768px, three at 1024px. Gap `var(--gap-grid)`.

Do not add a thumbnail image to any post card. No post images exist and none are authorised.
Do not add a `<img>` placeholder grey box.

Motion: module `reveal-stagger.js`. See spec 08 section 12.
This is the primary use of `reveal-stagger.js`. Trigger start `top 85%`, duration `0.6`, stagger `0.08`, ease `power2.out`.

## 7. Section 5 — Topics band

Structure:

```
section#topics.section.section--blue
  div.container.container--narrow
    h2#topics-title    heading
    p.section__lead    one lead line
    ul.topics__list    four topic chips
```

`h2` copy, exact: `What we write about.`
Lead copy, exact: `Four topics, matching the four things we do.`

Chips, exactly four, plain text, not links:
1. `Web design`
2. `SEO`
3. `Paid ads`
4. `AI`

Chips are `<li>` elements, not `<a>`. No category archive pages exist, so a link would be a dead end.
Add: `<!-- PLACEHOLDER: replace before launch — link each topic to a category archive page once archives exist -->`
The `<ul>` carries `data-placeholder="true"`.

Tokens: chip background `--surface`, radius `--radius-pill`, padding `var(--s-2) var(--s-5)`, font `--fs-small`, colour `--ink`, border `1px solid var(--line)`.

Motion: none.

## 8. Section 6 — Final CTA

Identical structure to `index.html` section 10, with copy adjusted for this page's context.

`h2` copy, exact: `Want this applied to your site?`
Lead copy, exact: `A short call, no charge, no pitch deck. Based in Dublin, working with clients anywhere.`
Phone button: `<a class="btn btn--primary" href="tel:+353872520034">Call 087-2520034</a>`
Form button: `<a class="btn btn--ghost" href="/contact">Send a message</a>`

No email address. `[EVIDENCE NEEDED: business email]`
No newsletter signup. No email delivery service is configured for a list.

## 9. Footer

Identical to `index.html` section 13.
The `Insights` footer and header nav links carry `aria-current="page"` on this page.

## 10. Head requirements

```html
<title>Insights on Web Design, SEO and AI | TheAnalytico</title>
<meta name="description" content="Practical notes from TheAnalytico on homepages that convert, Google Business Profile, local search, Meta ads and where AI actually helps a small team.">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://theanalytico.com/insights">
```

JSON-LD on this page: `BreadcrumbList` plus a `CollectionPage`. Shapes are in spec 09 section 8.
Do not emit `Article` or `BlogPosting` JSON-LD on this page. `Article` schema belongs on an individual post page, and none exist yet. Emitting `Article` for an unpublished post with a `#` URL is invalid.
No `AggregateRating`. No `review`. No `author` node, because no author is confirmed.

## 11. Motion summary

| Section | Module | Gating |
|---|---|---|
| `h1` and every `h2` | `heading-mask.js` | desktop only |
| Section overlaps | `section-curtain.js` | desktop only |
| Post grid | `reveal-stagger.js` | desktop only |
| Featured post | `reveal-stagger.js` | desktop only |
| Cursor blob | `cursor-blob.js` | desktop only, pointer fine only |
| Smooth scroll | `lenis-scroll.js` | desktop only |

No carousel on this page.
No counters on this page.
No tilt cards on this page.
No service loops on this page.

## 12. Acceptance criteria

1. `insights.html` contains exactly one `<h1>`.
2. Heading levels descend without skipping.
3. Sections appear in the order given in section 3.
4. Backgrounds run blue, cream, grey, blue, cream.
5. No two adjacent rhythm sections share a background class.
6. The featured section contains exactly one `<article>`.
7. The post grid contains exactly five `<li>` elements.
8. Post 1 appears in the featured section and does not appear again in the grid.
9. Six distinct post titles exist across the page, matching the six titles in section 6 character for character.
10. Post titles 1, 2, and 3 match the three insights card titles on `index.html` character for character.
11. Post standfirsts 1, 2, and 3 match the three insights card standfirsts on `index.html` character for character.
12. Every post `<article>` has `data-placeholder="true"`.
13. Every post `<article>` is preceded by a PLACEHOLDER comment.
14. Every read time `<span>` has `data-placeholder="true"`.
15. Every `<time>` element has `data-placeholder="true"` and a valid `datetime` attribute.
16. No author name appears anywhere on the page.
17. Every post link href is exactly `#`.
18. No post card contains an `<img>`.
19. Category labels come only from the set `Web design`, `SEO`, `Paid ads`, `AI`.
20. The topics list contains exactly four `<li>` and zero `<a>` elements.
21. The topics `<ul>` has `data-placeholder="true"` and a preceding PLACEHOLDER comment.
22. No invented statistic appears in any standfirst.
23. No numeric percentage appears anywhere on the page.
24. No newsletter form appears on the page.
25. `<meta name="robots" content="noindex, nofollow">` is present.
26. The canonical points at `https://theanalytico.com/insights`.
27. JSON-LD contains zero `Article` nodes and zero `BlogPosting` nodes.
28. JSON-LD contains no `author`, `aggregateRating`, or `review` key.
29. Every `data-placeholder="true"` element has a matching row in `PLACEHOLDER-CONTENT.md`.
30. The header, footer, and button markup match `index.html` apart from `aria-current`.
31. No inline `<style>` block, except the critical-CSS block in `<head>`.
32. Exactly one inline `<script>`, the header anti-flash script.
33. No `on*` attribute anywhere in the file.
34. No hex colour anywhere in the file.
35. With JS disabled, all six posts are visible with full titles, standfirsts, and metadata, and no element has `opacity: 0`.
36. Lighthouse mobile scores 95 or above on all four categories.
37. CLS below 0.05.
38. British English throughout.
39. No email address appears anywhere on the page.

## 13. Non-goals

Do not write the full body text of any article. Only titles, standfirsts, and body direction notes are in scope.
Do not create individual post HTML pages.
Do not create category archive pages.
Do not add pagination. Six posts do not need it.
Do not add a search field.
Do not add a tag cloud.
Do not add a newsletter signup form.
Do not add social share buttons. No social profiles are confirmed.
Do not add an RSS feed link. No feed is generated.
Do not add post thumbnail images.
Do not add author bios or headshots.
Do not add `Article` JSON-LD.
Do not add reading-progress motion.
Do not edit `tokens.css`, `base.css`, or `components.css`.
Do not write any `.js` file.
