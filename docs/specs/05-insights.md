# Spec 05 — Insights page (`insights.html`)

Rewritten 15 Aug 2026 against the shipped `index.html`, `components.css`, and `assets/js/modules/`. Supersedes the Phase 0 version entirely.

Agent: `html-builder` (Haiku 4.5). Read `docs/specs/08-motion-modules.md` sections 2, 4 and 6 before starting.

## 1. Files

Create exactly one file:

- `/insights.html`

Edit nothing else. Add no image file.

## 2. Scope change from the Phase 0 spec — read this first

The Phase 0 spec listed **six** posts with `.post`-prefixed classes. Both parts are now wrong:

1. **Three posts, not six.** Only three insight images exist (`/assets/img/insights/insight-1.webp`, `-2.webp`, `-3.webp`), and the home page already commits to exactly those three titles. Listing six stub links, five of which have no artwork and none of which resolve to an article, multiplies fabricated content for no gain. Posts 4–6 from the Phase 0 spec are held back until they are written and illustrated.
2. **`.post` classes do not exist.** `components.css` lines 1128–1235 style insight cards as `.insights__grid .card` with `card__media`, `card__date`, `card__title` and a stretched `card__link`. Use those. `card__category`, `card__standfirst` and `card__meta` are deliberately hidden by that stylesheet — do not author them.

Both changes are flagged to the client as open questions. Build to this spec.

## 3. Content policy for this page

Insight posts are advice about a subject, not claims about past clients, so the titles and topics may ship as written. What may **not** ship unmarked:

- Publication dates — none of the three posts is written or dated. Marked placeholder.
- Post URLs — no post pages exist. Every link points at `/insights` (the current page), never at `#`, never at a 404 URL. Marked placeholder.
- Read times — not calculable before the posts exist. **Omitted entirely**, not marked. The card layout hides `card__read-time` anyway.

No author byline. No headshot. No comment count. No share count.

## 4. Shared chrome — copy, do not rewrite

Identical to spec 03 section 2. Copy from `/index.html`:

| What | `index.html` lines |
|---|---|
| Anti-flash script | 28 |
| Font preloads | 30–31 |
| Stylesheet links | 33–35 |
| Skip link | 60 |
| Flowmap mount div | 62 |
| `<header>` | 64–88 — move `aria-current="page"` to the Insights link |
| Drawer | 90–101 |
| `<footer>` | 397–425 |
| Script tags | 427–430 |

## 5. Head requirements

```html
<title>Insights — Practical Notes on Getting Found | TheAnalytico</title>
<meta name="description" content="Short, specific pieces on web design, search, paid ads and AI for small businesses. Written by the people who build the sites.">
<link rel="canonical" href="https://theanalytico.com/insights">
```

OG and Twitter tags follow `index.html` lines 10–19 with title, description and URL swapped. `og:type` stays `website`.

**JSON-LD: one block only — `BreadcrumbList`.** Home → Insights, same shape as spec 03 section 3, `position: 2` name `Insights`, item `https://theanalytico.com/insights`.

Do **not** emit `Article`, `BlogPosting`, `Blog`, or `ItemList` on this page. CLAUDE.md requires `Article` schema *on an insight post page*. No post page exists, and `Article` nodes whose `url` points back at the listing page are structured-data spam. When the posts are written, each post page gets its own `Article` node then.

## 6. Section order and backgrounds

Four sections. The first carries no `data-curtain`; the other three do. This page is deliberately short.

| # | `id` | classes | curtain |
|---|---|---|---|
| 1 | `intro` | `section section--blue` | no |
| 2 | `posts` | `section section--cream` | yes |
| 3 | `topics` | `section section--grey` | yes |
| 4 | `cta` | `section section--blue` | yes |

## 7. Section 1 — `#intro`

```
section#intro.section.section--blue
  div.container
    p.eyebrow        "Insights"
    h1.page__title   heading
    p.page__lead     lead
```

`h1`, exact: `Practical notes on getting found`
Lead, exact: `Short, specific pieces on web design, search and AI for small businesses. No growth hacking, no jargon, just the things that move the needle when one person is doing everything.`

No buttons in this section. The `h1` carries no motion hook.

## 8. Section 2 — `#posts`

`h2 id="posts-title" data-mask-heading`, exact: `Everything we have written`

Then the grid. Start from `index.html` lines 351–379 and change three things:

1. The `<ul>` keeps `class="insights__grid" data-reveal-group data-placeholder="true"` and keeps the placeholder comment above it, reworded to: `<!-- PLACEHOLDER: replace before launch — individual post URLs once the posts are published; all three currently link to /insights -->`
2. Each `card__link` href stays `/insights`.
3. Nothing else changes: same three images, same alt text, same titles, same dates, same `loading="lazy" decoding="async" width="400" height="250"`, same `data-placeholder="true"` on each `card__date`, same per-card date placeholder comment.

Card shape, one per post, exactly:

```html
<li class="card" data-reveal-item>
  <figure class="card__media">
    <img src="/assets/img/insights/insight-1.webp" width="400" height="250" alt="Market traders serving customers at an outdoor stall" loading="lazy" decoding="async">
  </figure>
  <!-- PLACEHOLDER: replace before launch — real publication date needed -->
  <p class="card__date" data-placeholder="true">12 June 2026</p>
  <h3 class="card__title">What a local business actually needs on a homepage</h3>
  <a class="card__link" href="/insights">Read article</a>
</li>
```

The three posts, in this order, matching the home page exactly:

| # | Image | Alt text | Date | Title |
|---|---|---|---|---|
| 1 | `insight-1.webp` | `Market traders serving customers at an outdoor stall` | `12 June 2026` | `What a local business actually needs on a homepage` |
| 2 | `insight-2.webp` | `Google Analytics open on a mobile phone` | `28 April 2026` | `Google Business Profile: the fields most people skip` |
| 3 | `insight-3.webp` | `A team planning with sticky notes on a whiteboard` | `3 March 2026` | `Where AI helps a small team, and where it wastes money` |

Rules:

1. Exactly three `<li>` items. No fourth.
2. No `card__category`, no `card__standfirst`, no `card__meta`, no `card__read-time` element. The stylesheet hides all four; authoring them adds hidden text to the accessibility tree for nothing.
3. Every card's `<h3>` is plain text with no link inside it. The stretched `card__link` is the click target, per `components.css` line 1230.
4. No `<time>` element. The dates are not real, so a machine-readable `datetime` attribute would be a fabricated fact in a machine-readable field.
5. Do not add a "Load more" or pagination control.

After the grid, one line, exact: `<p class="section__lead">The full pieces are being written. The three above go live first.</p>`

That sentence is a statement of intent, not a fact about the past, and needs no placeholder marking. If the client disagrees, delete the line.

## 9. Section 3 — `#topics`

```
section#topics.section.section--grey[data-curtain] aria-labelledby="topics-title"
  div.container.container--narrow
    h2#topics-title[data-mask-heading]   "What we write about"
    p.section__lead                       lead
    ul.topics__list[data-placeholder="true"]   four chips
```

Lead, exact: `Four topics, matching the four things we do.`

Chips, exactly four `<li>` elements, plain text, **not** links, in this order: `Web design`, `SEO`, `Paid ads`, `AI`.

Above the `<ul>`: `<!-- PLACEHOLDER: replace before launch — link each topic to a category archive page once archives exist -->`

`.topics__list` is a new class. Tokens: chip background `--surface`, radius `--radius-pill`, padding `var(--s-2) var(--s-5)`, font `--fs-small`, colour `--ink`, border `1px solid var(--line)`, list is a wrapping flex row with `gap: var(--s-3)`.

No motion hooks on this section beyond the heading and the curtain.

## 10. Section 4 — `#cta`

Container `.container--narrow`. Shape copies `index.html` lines 384–393.

`h2 id="cta-title" data-mask-heading`, exact: `Want this applied to your site?`
`p.cta__lead`, exact: `A short call, no charge, no pitch deck. Based in Dublin, working with clients anywhere.`
Actions: `Call 087-2520034` → `tel:+353872520034` (`btn btn--primary`), `Send a message` → `/contact` (`btn btn--ghost`).

## 11. Motion summary

| Module | Hooks on this page | Where |
|---|---|---|
| `header-pill.js` | header chrome | shared |
| `flowmap-trail.js` | `[data-flowmap]` | one div after the skip link |
| `heading-mask.js` | `data-mask-heading` | the three `<h2>` elements |
| `section-curtain.js` | `data-curtain` | sections 2, 3, 4 |
| `reveal-stagger.js` | `data-reveal-group` on the grid, `data-reveal-item` on each card | `#posts` |

`reveal-stagger.js` fires at the grid's `top 85%`, `y 20 → 0`, `opacity 0 → 1`, `0.6s`, `power2.out`, `0.08s` stagger. This is its canonical use.

New hooks required: **none**. No `data-anchor-link` on this page — there is nothing to jump to.

## 12. Acceptance criteria

1. `/insights.html` exists and is the only file created. No image file is added.
2. `<title>` is `Insights — Practical Notes on Getting Found | TheAnalytico` and the canonical is `https://theanalytico.com/insights`.
3. Exactly one `<h1>` exists, in `#intro`, with no motion hook.
4. Four `<section>` elements exist with the exact ids, classes and order in section 6's table.
5. Section 1 has no `data-curtain`; sections 2–4 each have one.
6. Every `<h2>` carries `data-mask-heading`, has an `id` referenced by its section's `aria-labelledby`, and contains no child elements.
7. `#posts` contains exactly three `<li class="card" data-reveal-item>` items inside one `<ul class="insights__grid" data-reveal-group data-placeholder="true">`.
8. Each card contains, in this order: `figure.card__media` with one `<img>`, a placeholder comment, `p.card__date[data-placeholder="true"]`, `h3.card__title`, `a.card__link[href="/insights"]`.
9. No `card__category`, `card__standfirst`, `card__meta`, `card__read-time` or `<time>` element appears anywhere in the file.
10. Every `<img>` has `width`, `height`, `alt`, `loading="lazy"` and `decoding="async"`.
11. No link on the page has `href="#"`.
12. Exactly one JSON-LD block exists, and it is a `BreadcrumbList`.
13. The strings `Article`, `BlogPosting`, `aggregateRating` and `review` do not appear in any JSON-LD on this page.
14. `#topics` contains exactly four `<li>` chips, none of which is an `<a>`.
15. The `<header>` matches `index.html` lines 64–88 except that `aria-current="page"` sits on the Insights link; the `<footer>` matches lines 397–425 byte for byte.
16. Exactly one `<div data-flowmap aria-hidden="true"></div>` exists.
17. The four script tags match `index.html` lines 427–430 and no other script is loaded.
18. No `on*` attribute, no inline `<style>`, no inline `style` attribute, no raw hex, no `px` font size.
19. Every fabricated date carries the three-part placeholder marking from CLAUDE.md.
20. With JavaScript disabled, all four sections render fully readable and all three cards are visible.

## 13. Non-goals

- Do not create individual post pages in this pass.
- Do not write the article bodies.
- Do not add posts 4–6 from the Phase 0 spec.
- Do not add pagination, search, filtering, RSS, or a newsletter signup. No mailing list exists.
- Do not add author bylines, headshots, or social share buttons.
- Do not add `Article` or `Blog` JSON-LD.
- Do not reuse an insight image on more than one card.
- Do not write any CSS. `.page__title`, `.page__lead` and `.topics__list` are handed to `css-stylist` in Phase 6f.
- Do not edit `PLACEHOLDER-CONTENT.md`; rows 5.9–5.11 need trimming from six posts to three, and the architect will do it.
