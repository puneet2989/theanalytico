# Spec 07 — Contact page (`contact.html`)

Rewritten 15 Aug 2026 against the shipped `index.html`, `components.css`, `assets/js/modules/contact-form.js`, and `functions/api/contact.js`. Supersedes the Phase 0 version entirely.

Agent: `html-builder` (Haiku 4.5). Read `docs/specs/08-motion-modules.md` sections 2, 4 and 6 before starting.

## 1. Files

Create exactly one file:

- `/contact.html`

Edit nothing else. In particular:

- **`functions/api/contact.js` already exists and is complete.** Do not create, edit, or replace it. Its validation rules are reproduced below only so the markup matches them.
- **`assets/js/modules/contact-form.js` already exists and is complete.** Do not edit it. The markup below is what it expects; every `id` and `name` is load-bearing.
- `_headers` already allows `https://challenges.cloudflare.com` in `script-src`, `connect-src` and `frame-src`. Do not edit it.

## 2. Contract with the code that already exists

`contact-form.js` queries, in order:

- `[data-contact-form]` — the `<form>`. Absent, and the module silently no-ops.
- `[data-form-submit]` — the submit `<button>`.
- `[data-form-status]` — the live-region `<p>`.
- `form.elements.namedItem(id)` for each of `name`, `email`, `phone`, `business`, `service`, `message`, `consent` — so each control's `name` attribute must be exactly that string.
- `document.getElementById(id + '-error')` for each of `name`, `email`, `service`, `message`, `consent` — so those five error paragraphs must have ids `name-error`, `email-error`, `service-error`, `message-error`, `consent-error`. `phone` and `business` have **no** error element; do not add one.

`functions/api/contact.js` validates server-side: `name` 1–100 chars; `email` 5–254 and format-checked; `phone` optional, ≤30; `business` optional, ≤120; `service` must be one of `web-design`, `seo`, `paid-advertising`, `ai-services`, `not-sure`; `message` 10–2000 chars and at most five URLs; `consent` must equal the string `yes`; `cf-turnstile-response` must be present.

Consequences the markup must honour:

1. The `service` `<option>` values are exactly those five strings, in that order, plus a first empty-value option.
2. The consent checkbox must carry `value="yes"`.
3. `maxlength` values must match the server: 100, 254, 30, 120, 2000.
4. The message field needs at least 10 characters server-side; the client module only checks non-empty. Do not add a `minlength` attribute — it would fire the browser's own bubble instead of the module's message.

## 3. Shared chrome — copy, do not rewrite

Identical to spec 03 section 2. Copy from `/index.html`:

| What | `index.html` lines |
|---|---|
| Anti-flash script | 28 |
| Font preloads | 30–31 |
| Stylesheet links | 33–35 |
| Skip link | 60 |
| Flowmap mount div | 62 |
| `<header>` | 64–88 — see below |
| Drawer | 90–101 |
| `<footer>` | 397–425 — see below |
| Script tags | 427–430 |

Header: `Contact Us` is not in `.header__list`, so **no nav link carries `aria-current` on this page**. Instead add `aria-current="page"` to `<a class="btn btn--pill header__cta" href="/contact" data-header-cta>`. Also add `aria-current="page"` to the footer's `Contact Us` link. Change nothing else in either block.

## 4. Extra script — Turnstile only

After the four standard script tags, add exactly one more line:

```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" defer></script>
```

This is the only third-party script permitted anywhere on the site. Do not add `async`. Do not add an `onload` callback parameter (an `on*`-style callback in the URL is fine to omit entirely; the implicit render is used).

## 5. Head requirements

```html
<title>Contact TheAnalytico — Dublin Web Design and SEO</title>
<meta name="description" content="Tell us what your site has to do. Send a message or ring 087-2520034. Based in Dublin, working with clients anywhere.">
<link rel="canonical" href="https://theanalytico.com/contact">
```

OG and Twitter tags follow `index.html` lines 10–19 with title, description and URL swapped.

**JSON-LD: one block only — `BreadcrumbList`.** Home → Contact, same shape as spec 03 section 3, `position: 2` name `Contact`, item `https://theanalytico.com/contact`.

Do not emit `ContactPage`, `ContactPoint`, `Organization`, or a second `ProfessionalService` node. Adding a business node with a matching `@id` across all six pages is `seo-auditor`'s Phase 7 job.

## 6. Section order and backgrounds

Four sections. The first carries no `data-curtain`; the other three do. There is no closing CTA section — the form is the call to action.

| # | `id` | classes | curtain |
|---|---|---|---|
| 1 | `intro` | `section section--blue` | no |
| 2 | `enquiry` | `section section--cream` | yes |
| 3 | `next` | `section section--grey` | yes |
| 4 | `faq` | `section section--blue` | yes |

## 7. Section 1 — `#intro`

```
section#intro.section.section--blue
  div.container
    p.eyebrow        "Contact"
    h1.page__title   heading
    p.page__lead     lead
    div.section__actions
      a.btn.btn--primary href="tel:+353872520034"  "Call 087-2520034"
      a.btn.btn--ghost   href="#enquiry" data-anchor-link  "Send a message"
```

`h1`, exact: `Tell us what the site has to do`
Lead, exact: `A short call, no charge, no pitch deck. Ring the number below, or send the form and we will come back with two or three questions.`

The phone button is above the form deliberately: with JavaScript disabled, Turnstile never renders and the form submission is rejected server-side, so the phone number is the working fallback and must be visible first.

No motion hook on the `h1`.

## 8. Section 2 — `#enquiry`

`h2 id="enquiry-title" data-mask-heading`, exact: `Send a message`

Two columns at 1024px inside `div.container`: `div.enquiry__form` (7 of 12) then `div.enquiry__details` (5 of 12). One column below 1024px, form first. `.enquiry__form` and `.enquiry__details` are new classes.

### 8.1 Form markup — reproduce exactly

```html
<form class="form" action="/api/contact" method="POST" novalidate data-contact-form>
  <fieldset class="form__set">
    <legend class="visually-hidden">Enquiry details</legend>

    <div class="field">
      <label class="field__label" for="name">Your name</label>
      <input class="field__input" id="name" name="name" type="text" autocomplete="name" required maxlength="100">
      <p class="field__error" id="name-error" role="alert" hidden></p>
    </div>

    <div class="field">
      <label class="field__label" for="email">Email address</label>
      <input class="field__input" id="email" name="email" type="email" autocomplete="email" required maxlength="254" inputmode="email">
      <p class="field__error" id="email-error" role="alert" hidden></p>
    </div>

    <div class="field">
      <label class="field__label" for="phone">Phone <span class="field__optional">(optional)</span></label>
      <input class="field__input" id="phone" name="phone" type="tel" autocomplete="tel" maxlength="30" inputmode="tel">
    </div>

    <div class="field">
      <label class="field__label" for="business">Business name <span class="field__optional">(optional)</span></label>
      <input class="field__input" id="business" name="business" type="text" autocomplete="organization" maxlength="120">
    </div>

    <div class="field">
      <label class="field__label" for="service">What do you need?</label>
      <select class="field__input" id="service" name="service" required>
        <option value="">Choose one</option>
        <option value="web-design">Web design</option>
        <option value="seo">SEO</option>
        <option value="paid-advertising">Paid advertising</option>
        <option value="ai-services">AI services</option>
        <option value="not-sure">Not sure yet</option>
      </select>
      <p class="field__error" id="service-error" role="alert" hidden></p>
    </div>

    <div class="field">
      <label class="field__label" for="message">What does the site have to do?</label>
      <textarea class="field__input field__input--area" id="message" name="message" rows="6" required maxlength="2000" aria-describedby="message-hint"></textarea>
      <p class="field__hint" id="message-hint">A sentence or two is enough.</p>
      <p class="field__error" id="message-error" role="alert" hidden></p>
    </div>

    <div class="field field--check">
      <input class="field__check" id="consent" name="consent" type="checkbox" required value="yes">
      <label class="field__label" for="consent">I am happy for TheAnalytico to reply to this enquiry.</label>
      <p class="field__error" id="consent-error" role="alert" hidden></p>
    </div>

    <!-- PLACEHOLDER: replace before launch — real Turnstile site key from the Cloudflare dashboard -->
    <div class="field" data-turnstile-slot>
      <div class="cf-turnstile" data-sitekey="1x00000000000000000000AA" data-placeholder="true"></div>
    </div>

    <button class="btn btn--primary form__submit" type="submit" data-form-submit>Send enquiry</button>

    <p class="form__status" role="status" aria-live="polite" data-form-status></p>
  </fieldset>
</form>
```

Rules, one per line:

1. Reproduce the block above exactly. Every `id`, `name`, `class` and `data-*` attribute is depended on by shipped code.
2. `1x00000000000000000000AA` is Cloudflare's public test key. `[EVIDENCE NEEDED: Turnstile site key]` Logged as row 6.1 in `PLACEHOLDER-CONTENT.md`.
3. `novalidate` stays on the `<form>` so the module owns all error messaging.
4. `action="/api/contact"` and `method="POST"` stay, so the form works with JavaScript disabled.
5. Do **not** add `data-reveal-item`, `data-reveal-group`, or `data-tilt-card` anywhere inside the `<form>`. `reveal-stagger.js` already skips items inside a form; adding the hooks is dead markup at best.
6. Do not add a file upload field. No storage is configured and the Function would reject it.
7. Do not add a budget field. No pricing bands are confirmed.
8. Do not add a marketing-consent checkbox. No mailing list exists.
9. Do not add a honeypot field. Turnstile is the anti-spam layer and the Function does not read a honeypot.
10. No `placeholder` attribute is used as a substitute for a label.
11. No `on*` attribute anywhere.

### 8.2 Error and status strings — already implemented, do not restate in markup

`contact-form.js` writes these itself. The error paragraphs ship empty and `hidden`. Do not pre-fill them.

Field errors: `Please enter your name.` / `Please enter your email address.` / `That email address does not look right.` / `Please choose what you need.` / `Please tell us what you need.` / `Please keep this under 2000 characters.` / `Please tick the box so we can reply.`

Status messages: `Sending your enquiry…` / `Thanks. Your enquiry is on its way. We will be in touch.` / `Something went wrong sending that. Please ring 087-2520034 instead.` / `The security check did not pass. Please try again.` / `Too many attempts. Please try again in a few minutes.`

The module also reads `?sent=1` and `?error=1` from the URL for the no-JS redirect path. No markup is needed for that.

### 8.3 Details column

```html
<div class="enquiry__details">
  <h3>Or just ring</h3>
  <address class="contact__address">
    <p class="contact__phone"><a href="tel:+353872520034">087-2520034</a></p>
    <p>Dublin, Ireland</p>
  </address>
  <!-- PLACEHOLDER: replace before launch — business email address, opening hours, and street address if a public office exists -->
  <h3>Service area</h3>
  <p>Based in Dublin. We work with clients anywhere, remotely.</p>
  <h3>What we do</h3>
  <p>Web design, SEO, paid advertising on Meta and Google, and AI services.</p>
</div>
```

Rules:

1. The phone number is the most prominent element in the column. `.contact__phone` uses `--fs-h3`.
2. `Dublin, Ireland` is the entire location detail. No street, no postcode, no Eircode.
3. No email address. `[EVIDENCE NEEDED: business email]`
4. No opening hours. `[EVIDENCE NEEDED: opening hours]`
5. No response-time promise anywhere on the page.
6. No embedded map, no `<iframe>`.
7. No WhatsApp link. No WhatsApp number is confirmed.
8. `<address>` renders `font-style: normal`.
9. The three `<h3>` elements carry no motion hook.

### 8.4 New CSS required — none of it exists yet

`components.css` contains **no form styles at all**. Ship the class names exactly as written above and report the gap. `css-stylist` builds, in Phase 6f: `.form`, `.form__set`, `.form__submit`, `.form__status`, `.field`, `.field--check`, `.field__label`, `.field__optional`, `.field__input`, `.field__input--area`, `.field__check`, `.field__hint`, `.field__error`, `.enquiry__form`, `.enquiry__details`, `.contact__address`, `.contact__phone`.

Tokens for that work, so the two agents agree: form panel `--surface`, radius `--radius-lg`, padding `var(--s-7)`, border `1px solid var(--line)`. Input background `--surface`, border `1px solid var(--line)`, radius `--radius-sm`, padding `var(--s-3) var(--s-4)`, font `--fs-body`, colour `--ink`. Label `--fs-small` `--fw-medium` `--ink`. Hint `--fs-micro` `--ink-soft`. Error text `--accent-strong` (not `--accent`; `--accent` on white is below 4.5:1). Field vertical gap `var(--s-5)`. Focus uses the global `:focus-visible` ring from `base.css`.

The module prefixes every error with `⚠` inside a `<span aria-hidden="true">`, so error state is never signalled by colour alone.

## 9. Section 3 — `#next`

`h2 id="next-title" data-mask-heading`, exact: `What happens next`

This whole list is a marked placeholder, logged as row 5.8 in `PLACEHOLDER-CONTENT.md`: the three steps describe a process the client has not confirmed.

```html
<!-- PLACEHOLDER: replace before launch — confirm this is the client's actual enquiry process, then remove this marking -->
<ol class="process__list" data-placeholder="true">
```

Three `<li class="card" data-tilt-card>`, each with `<span class="card__step" aria-hidden="true">01</span>` … `03`, an `h3.card__title` and a `p.card__body`:

1. `We read it` — `Your message comes straight to us, not to a shared inbox someone checks weekly.`
2. `We reply with questions` — `Usually two or three, to work out scope before anyone talks about money.`
3. `We book a short call` — `Fifteen or twenty minutes. You come away knowing whether this is worth doing.`

Do not state a response time in hours or days anywhere in this section.

## 10. Section 4 — `#faq`

`h2 id="faq-title" data-mask-heading`, exact: `Before you write`

Container is `.container--narrow`. Markup is one `<dl class="faq__list">` with four pairs:

1. `Do I need to know what I want first?` — `No. "Not sure yet" is a valid answer in the form, and the call sorts it out.`
2. `Do you work with businesses outside Ireland?` — `Yes. We are based in Dublin and work with clients anywhere.`
3. `What happens to my details?` — `They are used to reply to your enquiry and nothing else. You are not added to a mailing list.`
4. `Can I just ring instead?` — `Yes. 087-2520034.`

Answer 3 is true today: no mailing list exists and no analytics or tracking script is loaded. If that changes, the answer changes.

Above the `<dl>`: `<!-- PLACEHOLDER: replace before launch — link to a privacy policy page once one is written -->`
`[EVIDENCE NEEDED: privacy policy page]` — do not link to `/privacy`; it does not exist and would 404.

`.faq__list` is the same new class specified in spec 03 section 9. Only one agent needs to describe it; `css-stylist` writes it once.

## 11. Motion summary

| Module | Hooks on this page | Where |
|---|---|---|
| `header-pill.js` | header chrome | shared |
| `flowmap-trail.js` | `[data-flowmap]` | one div after the skip link |
| `contact-form.js` | `[data-contact-form]`, `[data-form-submit]`, `[data-form-status]`, the seven named controls, the five `*-error` ids | `#enquiry` |
| `heading-mask.js` | `data-mask-heading` | the three `<h2>` elements |
| `section-curtain.js` | `data-curtain` | sections 2, 3, 4 |
| `tilt-cards.js` | `data-tilt-card` | `#next` only |
| `lenis-scroll.js` | `data-anchor-link` | the `Send a message` button in `#intro` |

`contact-form.js` is ungated: it runs under `prefers-reduced-motion` and on mobile. Everything else on this page is gated normally.

New hooks required: **none**.

## 12. Acceptance criteria

1. `/contact.html` exists and is the only file created. `functions/api/contact.js` and `assets/js/modules/contact-form.js` are untouched.
2. `<title>` is `Contact TheAnalytico — Dublin Web Design and SEO` and the canonical is `https://theanalytico.com/contact`.
3. Exactly one `<h1>` exists, in `#intro`, with no motion hook.
4. Four `<section>` elements exist with the exact ids, classes and order in section 6's table.
5. Section 1 has no `data-curtain`; sections 2–4 each have one.
6. Every `<h2>` carries `data-mask-heading`, has an `id` referenced by its section's `aria-labelledby`, and contains no child elements.
7. Exactly one `<form>` exists, carrying `class="form"`, `action="/api/contact"`, `method="POST"`, `novalidate` and `data-contact-form`.
8. The form contains exactly seven controls, with `name` attributes `name`, `email`, `phone`, `business`, `service`, `message`, `consent`.
9. Each of those controls has a `<label>` whose `for` matches the control's `id`, and no control relies on a `placeholder` attribute as its label.
10. Exactly five error paragraphs exist, with ids `name-error`, `email-error`, `service-error`, `message-error`, `consent-error`; each has `role="alert"`, is `hidden`, and is empty.
11. No error paragraph exists for `phone` or `business`.
12. The `service` select contains six options: an empty first option, then `web-design`, `seo`, `paid-advertising`, `ai-services`, `not-sure`, in that order.
13. The consent checkbox carries `value="yes"` and `required`.
14. `maxlength` values are 100, 254, 30, 120 and 2000 on name, email, phone, business and message respectively.
15. Exactly one `[data-form-submit]` button of `type="submit"` and one `[data-form-status]` paragraph with `role="status" aria-live="polite"` exist.
16. One `[data-turnstile-slot]` div contains one `.cf-turnstile` div with `data-sitekey="1x00000000000000000000AA"` and `data-placeholder="true"`, preceded by the placeholder comment.
17. Exactly five `<script>` tags exist: the four from `index.html` lines 427–430 plus the Turnstile script, in that order.
18. No `data-reveal-item`, `data-reveal-group`, or `data-tilt-card` appears inside the `<form>`.
19. `#next` contains exactly three `[data-tilt-card]` items, and the `<ol>` carries `data-placeholder="true"` and the placeholder comment.
20. `#faq` contains one `<dl>` with exactly four `dt`/`dd` pairs.
21. No response-time claim in hours or days appears anywhere in the file.
22. No email address, opening hours, street address, postcode, map, or WhatsApp link appears anywhere in the file.
23. `aria-current="page"` appears on the header CTA pill and on the footer `Contact Us` link, and on no nav list item.
24. Exactly one JSON-LD block exists, and it is a `BreadcrumbList`.
25. Exactly one `<div data-flowmap aria-hidden="true"></div>` exists.
26. No `on*` attribute, no inline `<style>`, no inline `style` attribute, no raw hex, no `px` font size.
27. With JavaScript disabled, the form is fully visible, every label is readable, the phone number is visible above the form, and the form still posts natively to `/api/contact`.

## 13. Non-goals

- Do not write, edit, or replace `functions/api/contact.js`. It is complete.
- Do not edit `assets/js/modules/contact-form.js`.
- Do not edit `_headers`. The CSP already allows Turnstile.
- Do not add a booking or calendar embed.
- Do not add a live chat widget.
- Do not add a map, an office photo, or an address block beyond `Dublin, Ireland`.
- Do not add a newsletter signup or marketing-consent checkbox.
- Do not add a honeypot or any second anti-spam mechanism.
- Do not create `/privacy`.
- Do not write any CSS. The seventeen new class names in section 8.4 are handed to `css-stylist` in Phase 6f.
- Do not edit `PLACEHOLDER-CONTENT.md`.
