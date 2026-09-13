# Design direction v2: reference analysis and restructure

Written 12 September 2026, after Phases 0 to 3 of [REVIEW-2026-09-12.md](REVIEW-2026-09-12.md) landed.

Four reference sites were loaded in headless Chromium at 1440×900, scrolled end to end, and inspected for script payload, font stack, canvas and video counts, and computed type sizes. Findings below are from those runs, not from memory.

## The blunt diagnosis

The current site is not badly built. It is under-supplied. The motion code is competent and the architecture is clean. What is missing is **visual material to animate**.

`assets/img/` totals 592KB: three work screenshots, three stock-ish insight photos, two hero images and two chips. The four service mockup videos are 18KB to 102KB each. hobro.digital ships 4.2MB of imagery and 16.3MB of video across 60 `<video>` elements.

No amount of GSAP work closes that gap. The reference sites feel expensive because every scroll position has something crafted to look at. Ours has a rounded rectangle with text in it. **Asset production is the bottleneck, not code.**

## What the four references actually share

Measured, not asserted.

### 1. Monochrome chrome, colour from content

hobro is pure black and white; every hue on screen comes from the client work inside the thumbnails. unitedcarriers is white and black; colour arrives via a cut-out crane and a full-bleed drone shot of a container ship. haoqi is near-white with a single green accent.

Ours rotates three pastel section backgrounds (blue → cream → grey) and then adds four unrelated card gradients in navy, green, maroon and purple. That is five colour systems competing. None of the references do this.

### 2. Two-tier type with nothing in between

| Site | Display type | Secondary type |
|---|---|---|
| hobro | ~160px, weight 700+, edge to edge | AkkuratMono, ~12px, uppercase |
| unitedcarriers | 80px h1 | BT Steinhart Mono, ~11px |
| haoqi | ~90px, black weight | monospace, ~14px |

The mono micro-label carries all metadata: project name, sector, coordinates, timestamp. There is no 16px-to-22px body-copy tier doing explanatory work.

Ours runs a continuous ramp with the bulk of the page sitting at 18 to 22px prose. That is what reads as "template".

Note this contradicts one thing in CLAUDE.md: headings are specified at weight 500 to 600, "never 700+". Every reference uses a heavier display weight. Worth revisiting, since the "large, tight, confident" feel the spec asks for is partly a weight decision.

### 3. Full-bleed, not boxed

None of the four float padded cards inside a max-width container with large corner radii. hobro's work grid runs to the viewport edge. unitedcarriers goes full-bleed video. Our `--container-max: 1320px` plus `--radius-section: 48px` plus card radii puts a rounded box inside a rounded box inside a padded column on every section.

### 4. Asymmetry

hobro's work grid is staggered masonry with deliberate empty cells. haoqi's header is four uneven columns. [components.css:445-461](../assets/css/components.css#L445-L461) centres the eyebrow, heading and lead on every non-hero section of ours. Centre-aligned everything is the most template-like decision in the stylesheet.

### 5. Very few words per viewport

hobro shows roughly ten words per screen. Their `h1` computes to 16px because the big type is not the `h1` at all; the display lettering is separate from the document outline. Ours runs a lead paragraph plus four card descriptions per section.

## What each reference contributes

**mercury.com** — the pinned-section pattern. A product visual holds position on the right while an accordion on the left advances through four items, and the visual changes with each. This is the single most directly applicable pattern for our four service pillars, and it is what P3-4 of the review already proposed. Mercury's `h1` is only 49px; the imagery carries the message, not the type.

**unitedcarriers.com** — subject-on-stage scrubbing. The crane lifting a container is a cut-out subject on plain white, scrubbed by scroll, no background. This is *exactly what our hero morph already does*, chrome forms on black. The technique is in place. The problem is that the rest of our page does not live up to it. Their page runs 28,230px; they commit to the long scroll.

**haoqi.design** — the technical overlay. Visible grid rules with `+` crosshairs at intersections, a live telemetry strip along the bottom ("GMT+8 CN 16:25 24°C", "0000 X 0000 Y"), monospace everywhere secondary. Critically, their hero uses glossy chrome 3D lettering, the **same material language as our existing hero morph**. That is the closest aesthetic bridge of the four.

**hobro.digital** — the build proof. Their stack is ours: GSAP, ScrollTrigger, ScrollSmoother, SplitText, MorphSVG, CustomEase, Draggable, InertiaPlugin, Lenis, dotLottie. Zero canvas, 60 videos. Everything they do is reachable without WebGL and without a framework.

**oryzo.ai** — added 12 September 2026 as a fifth reference. Measured: 56,691px page height, 6 canvases, a `SplatsWorker` bundle (Gaussian splatting, photoreal captured 3D), 20.7MB on mobile, 3,602 DOM nodes, FCP 420ms, one variable font (`halyard-display-variable`) doing everything from 123px display down to 10px labels.

It is credited on the page to Lusion, and it is a 56,000px advertisement for a single cork coaster with essentially no information architecture. Ours is a six-page lead-generation site with four services, three case studies and a contact form. **The techniques transfer; the structure does not.** It is also, by a distance, the furthest of the five from a Lighthouse 92: Gaussian splatting is not compatible with the performance floor under any amount of optimisation.

Four things from it are free, and are the highest value-per-effort items on this entire document:

1. **Type occluded by the subject.** "ORYZO" and "stainability" sit *behind* the 3D object and are partly hidden by it. We can do this today by moving the hero headline behind the chrome morph. Costs nothing, and it is most of why the site reads as expensive.
2. **Display type cropped by the viewport edge.** "sustainability" renders as "…stainability", deliberately running off-screen. Free. Reinforces the full-bleed decision.
3. **Editorial overlay chrome.** Mono labels, dotted rules, thin boxes, issue numbers ("ISSUE NO. 00124", "№6") floating over the imagery. Pure CSS, zero assets. haoqi does the same thing with grid crosshairs and a telemetry strip. Two of five references converging on this makes it the cheapest credible "expensive" signal available.
4. **One variable font for the whole range.** A performance *gain*, not a cost, and it enforces the two-tier type discipline automatically.

The heavy 3D is the part to ignore. The composition discipline is the part to take.

## The performance trade, and the call

Measured on a 390px viewport:

| Site | Total | Script | Video | Images | DOM | FCP |
|---|---|---|---|---|---|---|
| hobro.digital | 22.3MB | 1.07MB | 16.3MB | 4.2MB | 2,578 | 248ms |
| unitedcarriers.com | 2.2MB | 1.3MB | 0.4MB | 0.4MB | 2,944 | 584ms |
| TheAnalytico | 0.97MB | 0.3MB | 0 | 0.6MB | 433 | 172ms |

hobro ships 23× our payload. unitedcarriers spends 1.3MB on WebGL and pays for it with a 584ms FCP and heavy main-thread time.

CLAUDE.md requires Lighthouse 95+ on mobile for Performance. **That is incompatible with copying either one directly.** The honest position:

- Match hobro's *visual density* at roughly 3 to 4MB, by lazy-loading every video below the fold, capping the hero to one scrubbed asset, and serving AV1 or HEVC with WebM fallback. Realistic Lighthouse mobile: 90 to 95.
- Copying unitedcarriers' WebGL ocean simulation puts Performance in the 60s to 70s on mobile. Do not do it.

**Recommendation: target 92+ rather than 95+, and write the change into CLAUDE.md as a deliberate decision with the reasoning.** A site that sells design and scores 92 beats a site that scores 98 and looks like a template. Silently missing 95 is the bad outcome; consciously revising it is fine. This needs the client's agreement because it edits a stated non-negotiable.

## Business model gap

The stated business model is build, **maintain**, marketing, and AI agents. CLAUDE.md's four pillars are Web Design, SEO, Paid Advertising, AI Services. Maintenance and care plans appear nowhere on the site.

Recurring maintenance revenue is usually the most defensible part of an agency's income and the easiest thing to sell to an existing client. If it is genuinely part of the offer it needs a pillar, which makes it five, or it needs folding explicitly into Web Design as an ongoing phase. Decide this before the restructure, because it changes the section count on the home page and the services page.

## Proposed home page restructure

Current: hero → services grid → work grid → process cards → KPI row → testimonials → insights → CTA. Eight sections, all centre-aligned, all boxed, all roughly equal weight.

Proposed, seven movements. Each is one idea with one visual.

**1. Hero, rebuilt.** Revised 12 September 2026 after the client opened the hero to change. The earlier position here was "keep it, it is the strongest thing on the site". That was right about the *material* and wrong about the *structure*.

Reading the current markup makes four problems plain:

- It is a second services section. Four scrubbed stages each name a pillar and give it a tagline. Movement 3 below builds a pinned services section that does the same job properly. Ship both and the same content runs twice, back to back.
- The `h1` is gated behind four scroll stages. All five references show their headline on the first frame.
- Every caption carries `aria-hidden="true"`. Roughly 30 words of the page's most prominent copy reach neither screen readers nor search engines, on a site that sells SEO.
- The split caption at stage 2 renders badly: "Technical SEO" overlaps the chrome form while "that keeps working long after launch." sits in a narrow right-hand column at a different size. Stage order is Web → Paid → SEO → AI, matching no other pillar ordering on the site.

Rebuild: `h1` present and legible from the first frame, positioned *behind* the chrome form so the form partly occludes it, per the oryzo technique. One continuous morph rather than four labelled service states. No per-stage captions, which removes the `aria-hidden` copy and the broken split layout together. The scrub carries the visitor into the site instead of gating it.

**This needs no new assets.** The existing 40-frame sprite (`hero-morph-sprite.webp`, 8×5, plus the 24-frame mobile variant) keeps working unchanged; it simply stops being four labelled states and becomes one abstract continuous form. Markup, CSS and module changes only, which makes it the cheapest high-impact item on this document.

Add a haoqi-style mono telemetry strip along the bottom edge carrying truthful data only: scroll progress and "DUBLIN / WORLDWIDE". No invented metrics.

**2. Full-bleed statement — dropped.** This movement originally proposed a separate edge-to-edge display line using the same type-behind-subject treatment. With the hero rebuilt to do exactly that, the statement section repeats the move a screen later and weakens both. Six movements, not seven.

**3. Services, pinned.** The Mercury pattern. Pin a stage on one side; run the four pillars as a list on the other. Each pillar advances the stage to its own visual. Reuses the hero's chrome material so the two read as one system. Replaces the four-card gradient grid entirely, which also resolves P3-3.

**4. Work, asymmetric grid.** Three projects in a staggered layout with deliberate empty cells, full-bleed to the viewport edge, each labelled with a mono caption: project name, sector, stack. Hover scrubs a short capture of the live site. This is where the real colour on the page comes from.

**5. Process, horizontal scroll.** Four steps as a horizontally scrubbed track pinned vertically. Replaces the current four tilted cards. Low asset cost: type and rules only.

**6. Proof.** KPIs and testimonials merged into one section rather than two. Fewer, larger numbers. Keep the placeholder marking discipline from `PLACEHOLDER-CONTENT.md` unchanged.

**7. Contact.** Full-bleed, one display line, phone and form. Drop the duplicate link list that already exists in the footer.

Insights moves off the home page to its own index. It is the weakest section and it dilutes the close.

## Asset production plan

This is the critical path. Nothing above works without it. Rough order of value per unit of effort:

1. **Work captures.** Scroll-capture video of each of the three live sites, 4 to 6 seconds, silent, 720p, AV1. Three assets. Highest value on the page because it is real proof, not decoration.
2. **Service stage visuals.** Four chrome renders in the same material as the hero morph, one per pillar, as scrubbable sprite sheets matching the existing `hero-morph-sprite.webp` approach. Consistency with the hero matters more than novelty here.
3. **Full-bleed statement backdrops.** Two or three. Can be flat colour with type only at zero asset cost, which is what hobro does for their "OUR CORE IDENTITY" screen.
4. **Mono label system.** Free. A CSS and copy decision, not an asset.

Items 1 and 4 alone would lift the page substantially and neither needs new design work.

## Decisions taken, 12 September 2026

All three gating questions were answered by the client. CLAUDE.md has been updated to match; these are now project conventions, not proposals.

1. **Lighthouse Performance floor moves from 95 to 92 on mobile.** Accessibility, Best Practices and SEO stay at 95+. 92 is a floor, not a budget to spend down to.
2. **Maintenance folds into Web Design as an ongoing phase.** The four-pillar structure survives. It must appear on `services.html` explicitly rather than being implied.
3. **Palette goes monochrome.** White and near-black sections only, colour supplied by the portfolio captures, `--accent` terracotta reserved for one job at a time. `--bg-blue`, `--bg-cream`, `--bg-grey`, `--accent-2` and the four `--gradient-*` ramps are retired.

## Sequencing

Asset production (Prompt 6) is the critical path and blocks movements 3 and 4. The statement section (Prompt 7) has zero asset cost and can run immediately.

The palette migration is the largest single piece of CSS work and touches every file. It should land before the restructure rather than during it, so that section work is not done twice.

Per the model policy in CLAUDE.md, a spec in `docs/specs/` precedes code for the new home page.
