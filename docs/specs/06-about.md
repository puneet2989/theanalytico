# Spec 06 — About page (`about.html`)

Rewritten 15 Aug 2026 against the shipped `index.html`, `components.css`, and `assets/js/modules/`. Supersedes the Phase 0 version entirely.

Agent: `html-builder` (Haiku 4.5). Read `docs/specs/08-motion-modules.md` sections 2, 4 and 6 before starting.

## 1. Files

Create exactly one file:

- `/about.html`

Edit nothing else. Add no image file. There are no headshots, no office photos, and no team photos in the repository, and none may be sourced from a stock library and presented as the team.

## 2. The hardest constraint on this page

An About page is where invented facts normally arrive. The confirmed facts about this business are, in full:

- Name: TheAnalytico
- Location: Dublin, Ireland
- Service area: Worldwide
- Phone: 087-2520034 (`tel:+353872520034`)
- Services: web design, SEO, paid advertising (Meta and Google), AI services (five named capabilities)
- Clients: three shipped sites — ArdLens, KC Accountants, SodoLT
- Awards: none

Everything else is unknown: founding year, team size, team names, headcount, qualifications, certifications, partner badges, office address, opening hours, company registration number, social profiles, email address.

Therefore, forbidden on this page unless marked with the full three-part placeholder marking from CLAUDE.md:

- Any year ("since 2019", "founded in", "over five years")
- Any headcount ("a team of four", "we are three people")
- Any named person
- Any qualification, certification, or partner status (no "Google Partner", no "Meta Business Partner")
- Any award
- Any client count other than three
- Any result, metric, percentage, or growth claim
- Any origin story ("we started because…") — none is on record

Write about **method**, not **history**. Method is observable in the three shipped sites and is defensible.

## 3. Shared chrome — copy, do not rewrite

Identical to spec 03 section 2. Copy from `/index.html`:

| What | `index.html` lines |
|---|---|
| Anti-flash script | 28 |
| Font preloads | 30–31 |
| Stylesheet links | 33–35 |
| Skip link | 60 |
| Flowmap mount div | 62 |
| `<header>` | 64–88 — move `aria-current="page"` to the About link |
| Drawer | 90–101 |
| `<footer>` | 397–425 |
| Script tags | 427–430 |

## 4. Head requirements

```html
<title>About TheAnalytico — Dublin Web Design and SEO</title>
<meta name="description" content="TheAnalytico is a Dublin web design, SEO, advertising and AI studio working with local businesses anywhere. How we work and who we work with.">
<link rel="canonical" href="https://theanalytico.com/about">
```

OG and Twitter tags follow `index.html` lines 10–19 with title, description and URL swapped.

**JSON-LD: one block only — `BreadcrumbList`.** Home → About, same shape as spec 03 section 3, `position: 2` name `About`, item `https://theanalytico.com/about`.

Do **not** duplicate the `ProfessionalService` node from `index.html` here. Two business nodes with no shared `@id` are a conflict, and adding `@id` consistently across all six pages is `seo-auditor`'s job in Phase 7, not this agent's.

Do not add `foundingDate`, `numberOfEmployees`, `employee`, `founder`, `award`, `aggregateRating`, or `review` to any JSON-LD on this page.

## 5. Section order and backgrounds

Seven sections. The first carries no `data-curtain`; the other six do.

| # | `id` | classes | curtain |
|---|---|---|---|
| 1 | `intro` | `section section--blue` | no |
| 2 | `how-we-work` | `section section--cream` | yes |
| 3 | `principles` | `section section--grey` | yes |
| 4 | `who` | `section section--blue` | yes |
| 5 | `team` | `section section--cream` | yes |
| 6 | `location` | `section section--grey` | yes |
| 7 | `cta` | `section section--blue` | yes |

## 6. Section 1 — `#intro`

```
section#intro.section.section--blue
  div.container
    p.eyebrow            "About"
    h1.page__title       heading
    p.page__lead         lead
    div.section__actions two buttons
```

`h1`, exact: `A Dublin studio for businesses that need to be found`
Lead, exact: `We design and build websites, then run the search, advertising and automation that keep them busy. Based in Dublin, working with clients anywhere.`

Buttons: `Contact Us` → `/contact` (`btn btn--primary`), `See Our Work` → `/work` (`btn btn--ghost`).

No hero image, no video, no motion hook on the `h1`.

## 7. Section 2 — `#how-we-work`

`h2 id="how-we-work-title" data-mask-heading`, exact: `How we work`

Lead (`p.section__lead`), exact: `Four steps, the same on every project, whether the build is static or WordPress.`

An `<ol class="process__list">` with four `<li class="card" data-tilt-card>`, each opening `<span class="card__step" aria-hidden="true">01</span>` … `04`. Reuse the four steps from `index.html` lines 236–257 verbatim — Call, Plan, Build, Grow, with their existing `card__body` copy.

Do **not** add `data-dial`, `data-dial-arc`, `data-dial-arc-path`, or `data-dial-num`. There is no dial on this page.

## 8. Section 3 — `#principles`

`h2 id="principles-title" data-mask-heading`, exact: `What we hold to`

An `<ul class="pillar__list" data-reveal-group>` with four `<li class="card" data-reveal-item>`, each `h3.card__title` plus `p.card__body`:

1. `You talk to the person building it` — `No account manager relaying messages between you and whoever is actually doing the work.`
2. `Fast is a feature, not a finish` — `Speed is designed in from the first decision, not bolted on when the Lighthouse score comes back red.`
3. `You own everything` — `The code, the domain, the hosting account and the ad accounts stay yours. Nothing is held hostage.`
4. `We say when something will not work` — `If a request will cost you money without returning any, you get told before the invoice, not after.`

## 9. Section 4 — `#who`

`h2 id="who-title" data-mask-heading`, exact: `Who we work with`

Lead, exact: `Local businesses where one person carries most of the decisions. That is who the three sites we have shipped were built for.`

An `<ul class="pillar__list" data-reveal-group>` with three `<li class="card" data-reveal-item>`. These describe the three real, verifiable sectors — no invented client types beyond them:

1. `Film and creative` — `Portfolio-led sites where the work has to lead and the booking route still has to be obvious. See ArdLens.`
2. `Professional services` — `Accountancy and similar, where clarity beats cleverness and most visitors are checking you on a phone. See KC Accountants.`
3. `Wellness and treatment` — `Booking-led sites the owner can update without ringing a developer. See SodoLT.`

Each of the three "See …" phrases is plain text, not a link, to keep the reading rhythm. Below the list add one `div.section__actions` with `<a class="btn btn--ghost" href="/work">See the three builds</a>`.

Do not describe a sector the studio has not actually shipped work in.

## 10. Section 5 — `#team`

This whole section is a marked placeholder, logged as rows 3.7 and 5.6 in `PLACEHOLDER-CONTENT.md`.

`h2 id="team-title" data-mask-heading`, exact: `The team`

Container is `.container--narrow`.

```html
<!-- PLACEHOLDER: replace before launch — real team member names, roles and headshots, or delete this entire #team section -->
<p class="section__lead" data-placeholder="true">A small team working directly with each client, with no account manager in between.</p>
```

Rules, one per line:

1. The `<section>` itself carries `data-placeholder="true"` as well as the `<p>`.
2. Exactly one sentence. No names.
3. No headcount number, not even "a handful" or "a few".
4. No photograph, no avatar, no silhouette illustration, no grey placeholder box.
5. No job titles.
6. No LinkedIn or other social link. No profile URLs are confirmed.
7. If the client supplies nothing before launch, the default action is to delete this section entirely, not to soften the sentence.

## 11. Section 6 — `#location`

`h2 id="location-title" data-mask-heading`, exact: `Where we are`

Container is `.container--narrow`.

```html
<p class="section__lead">Dublin, Ireland. We work with clients anywhere, remotely, and have done since the first build.</p>
<address class="contact__address">
  <p class="contact__phone"><a href="tel:+353872520034">087-2520034</a></p>
  <p>Dublin, Ireland</p>
</address>
<!-- PLACEHOLDER: replace before launch — business email address, street address, and opening hours, if the client confirms any of them exist publicly -->
```

Rules:

1. `Dublin, Ireland` is the entire extent of the location detail. No street, no postcode, no Eircode, no district.
2. No embedded map, no map image, no `<iframe>`.
3. No opening hours.
4. No email address. `[EVIDENCE NEEDED: business email]`
5. No company registration number. `[EVIDENCE NEEDED: company registration number]`
6. `<address>` renders with `font-style: normal`; `.contact__address` and `.contact__phone` are new classes. Phone uses `--fs-h3`.
7. The clause "and have done since the first build" states no date and is safe. Do not replace it with a year.

## 12. Section 7 — `#cta`

Container `.container--narrow`. Shape copies `index.html` lines 384–393.

`h2 id="cta-title" data-mask-heading`, exact: `Tell us what the site has to do`
`p.cta__lead`, exact: `A short call, no charge, no pitch deck. Based in Dublin, working with clients anywhere.`
Actions: `Call 087-2520034` → `tel:+353872520034` (`btn btn--primary`), `Send a message` → `/contact` (`btn btn--ghost`).

## 13. Motion summary

| Module | Hooks on this page | Where |
|---|---|---|
| `header-pill.js` | header chrome | shared |
| `flowmap-trail.js` | `[data-flowmap]` | one div after the skip link |
| `heading-mask.js` | `data-mask-heading` | the six `<h2>` elements |
| `section-curtain.js` | `data-curtain` | sections 2–7 |
| `tilt-cards.js` | `data-tilt-card` | `#how-we-work` only |
| `reveal-stagger.js` | `data-reveal-group` / `data-reveal-item` | `#principles`, `#who` |

New hooks required: **none**. No `data-anchor-link` on this page.

## 14. Acceptance criteria

1. `/about.html` exists and is the only file created. No image file is added.
2. `<title>` is `About TheAnalytico — Dublin Web Design and SEO` and the canonical is `https://theanalytico.com/about`.
3. Exactly one `<h1>` exists, in `#intro`, with no motion hook.
4. Seven `<section>` elements exist with the exact ids, classes and order in section 5's table.
5. Section 1 has no `data-curtain`; sections 2–7 each have one.
6. Every `<h2>` carries `data-mask-heading`, has an `id` referenced by its section's `aria-labelledby`, and contains no child elements.
7. `#how-we-work` contains exactly four `[data-tilt-card]` items and no `[data-dial]` hook of any kind.
8. `#principles` contains exactly four `[data-reveal-item]` cards; `#who` contains exactly three.
9. No element carries both `data-reveal-item` and `data-tilt-card`.
10. `#team` carries `data-placeholder="true"` on both the `<section>` and its single `<p>`, and is preceded by the placeholder comment.
11. `#team` contains no name, no number, no image, and no job title.
12. No four-digit year appears anywhere in the file except the footer copyright line copied from `index.html`.
13. The strings `founded`, `since 20`, `years of experience`, `certified`, `Partner`, and `award` do not appear anywhere in the file.
14. No headcount word or numeral describing team size appears anywhere.
15. The only phone number on the page is `087-2520034`, linked as `tel:+353872520034`.
16. Exactly one JSON-LD block exists, and it is a `BreadcrumbList`.
17. No `ProfessionalService`, `Organization`, `Person`, `aggregateRating`, or `review` node appears in any JSON-LD on this page.
18. The `<header>` matches `index.html` lines 64–88 except that `aria-current="page"` sits on the About link; the `<footer>` matches lines 397–425 byte for byte.
19. Exactly one `<div data-flowmap aria-hidden="true"></div>` exists.
20. The four script tags match `index.html` lines 427–430 and no other script is loaded.
21. No `on*` attribute, no inline `<style>`, no inline `style` attribute, no raw hex, no `px` font size.
22. Every unconfirmed statement carries either the three-part placeholder marking or an `[EVIDENCE NEEDED: …]` marker.
23. With JavaScript disabled, all seven sections render fully readable.

## 15. Non-goals

- Do not write an origin story, a founding year, or a timeline.
- Do not add team members, headshots, avatars, or silhouettes.
- Do not add certifications, partner badges, or awards.
- Do not add a values-carousel, a stats band, or KPI counters. `work.html` owns the countable facts.
- Do not add a map, an office photo, or a street address.
- Do not add social profile links anywhere, including the footer.
- Do not duplicate the business JSON-LD node from `index.html`.
- Do not write any CSS. `.page__title`, `.page__lead`, `.pillar__list`, `.contact__address` and `.contact__phone` are handed to `css-stylist` in Phase 6f.
- Do not edit `PLACEHOLDER-CONTENT.md`.
