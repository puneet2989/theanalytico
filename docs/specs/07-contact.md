# Spec 07 — Contact page (`contact.html`)

Owner agents: `html-builder` (Haiku 4.5) for markup, `css-stylist` (Sonnet 5) for `pages.css`, `cf-deploy` (Haiku 4.5) for `functions/api/contact.js`.
Phase: 6 for markup. Phase 2 for the function, so the endpoint exists before the form is wired.

## 1. Files

`html-builder` may create or edit only:

- `contact.html`

`css-stylist` may edit only:

- `assets/css/pages.css`

`cf-deploy` may create or edit only:

- `functions/api/contact.js`

`motion-engineer` may create or edit only:

- `assets/js/modules/contact-form.js`

Do not create any other file.
Do not edit `tokens.css`, `base.css`, or `components.css`.

## 2. Mode reminder

Current mode is LOCAL PREVIEW ONLY. Not for publication.

1. `<meta name="robots" content="noindex, nofollow">` is required.
2. No business email address appears on this page. None has been supplied. `[EVIDENCE NEEDED: business email]`
3. No street address appears on this page. `[EVIDENCE NEEDED: street address]`
4. No opening hours appear on this page. `[EVIDENCE NEEDED: opening hours]`
5. No response-time promise appears on this page. No service-level evidence exists.
6. Every fabricated fact carries `data-placeholder="true"`, a preceding PLACEHOLDER comment, and a row in `PLACEHOLDER-CONTENT.md`.

The confirmed contact facts are the phone number and the location:
- Phone: 087-2520034, `tel:+353872520034`
- Location: Dublin, Ireland
- Service area: Worldwide

## 3. Document structure

| # | Section | `id` | Background | Radius + overlap |
|---|---|---|---|---|
| 1 | Header | — | transparent | no |
| 2 | Page intro | `intro` | `--bg-blue` | no |
| 3 | Form and details | `enquiry` | `--bg-cream` | yes |
| 4 | What happens next | `next` | `--bg-grey` | yes |
| 5 | FAQ | `faq` | `--bg-blue` | yes |
| 6 | Footer | — | `--ink` | no |

Heading order:
- One `<h1>`, in the page intro.
- Each of sections 3 to 5 has one `<h2>`.
- Sub-blocks use `<h3>`.

Semantics:
- `<main id="main">` wraps sections 2 to 5.
- The form is a `<form>` with a `<fieldset>` and a `<legend>`.
- Contact details sit in an `<address>`.
- The FAQ is a `<dl>`.

There is no rhythm section 4 background repeat problem: blue, cream, grey, blue is correct.

## 4. Section 2 — Page intro

Structure:

```
section#intro
  div.container.container--narrow
    p.eyebrow        "Contact"
    h1.page__title   page heading
    p.page__lead     lead paragraph
```

`h1` copy, exact: `Tell us what the site has to do.`

Lead copy, exact: `Fill in the form or ring the number below. A short call, no charge, no pitch deck. Based in Dublin, working with clients anywhere.`

Section padding-top is `calc(72px + var(--s-9))`.

Tokens: `h1` uses `--fs-h1`, `--fw-heading`, `--lh-heading`, `--ls-heading`, colour `--ink-black`. Lead uses `--fs-lead`, colour `--ink-soft`.

Motion: `heading-mask.js` on the `h1`.

## 5. Section 3 — Form and details

Two columns at 1024px. Form left, 7 of 12 columns. Details right, 5 of 12. One column below 1024px, form first.

`h2` copy, exact: `Send a message.`

### 5.1 Form markup

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
      <textarea class="field__input field__input--area" id="message" name="message" rows="6" required maxlength="2000"></textarea>
      <p class="field__hint" id="message-hint">A sentence or two is enough.</p>
      <p class="field__error" id="message-error" role="alert" hidden></p>
    </div>

    <div class="field field--check">
      <input class="field__check" id="consent" name="consent" type="checkbox" required value="yes">
      <label class="field__label" for="consent">I am happy for TheAnalytico to reply to this enquiry.</label>
      <p class="field__error" id="consent-error" role="alert" hidden></p>
    </div>

    <div class="field" data-turnstile-slot>
      <!-- Turnstile widget mounts here, see section 5.3 -->
    </div>

    <button class="btn btn--primary form__submit" type="submit" data-form-submit>Send enquiry</button>

    <p class="form__status" role="status" aria-live="polite" data-form-status></p>
  </fieldset>
</form>
```

Form rules, one per line:

1. Exactly seven form controls: name, email, phone, business, service, message, consent.
2. Required fields: name, email, service, message, consent.
3. Optional fields: phone, business.
4. Every control has a `<label>` with a matching `for` and `id`. No placeholder-as-label.
5. Every input has an `autocomplete` attribute where a standard token exists.
6. Every input has a `maxlength`.
7. `novalidate` is on the `<form>` so JS controls the error messaging consistently.
8. The form still submits natively as a POST to `/api/contact` with JS disabled.
9. Every error paragraph has `role="alert"` and starts `hidden`.
10. The status paragraph has `role="status"` and `aria-live="polite"`.
11. The submit button is a `<button type="submit">`, never a styled `<div>`.
12. No `on*` attribute on any element.
13. The service `<select>` options are exactly the five values listed, in that order.
14. The first option has an empty value so `required` catches an unmade choice.
15. Do not add a file upload field. No storage is configured.
16. Do not add a budget field. No pricing bands are confirmed.
17. Do not add a marketing consent checkbox. No email list exists.

### 5.2 Client-side validation

Module: `assets/js/modules/contact-form.js`. See spec 08 section 14.

Rules:
1. Validate on submit, not on every keystroke.
2. Validate a field on `blur` only after the first submit attempt.
3. On error, set `aria-invalid="true"` on the control.
4. On error, remove `hidden` from the matching error paragraph and write the message.
5. On error, move focus to the first invalid control.
6. On success, clear all errors and write the success message into `[data-form-status]`.
7. Never rely on client validation alone. The server validates again.

Error messages, exact strings:
- Name empty: `Please enter your name.`
- Email empty: `Please enter your email address.`
- Email malformed: `That email address does not look right.`
- Service unselected: `Please choose what you need.`
- Message empty: `Please tell us what you need.`
- Message too long: `Please keep this under 2000 characters.`
- Consent unchecked: `Please tick the box so we can reply.`

Status messages, exact strings:
- Submitting: `Sending your enquiry…`
- Success: `Thanks. Your enquiry is on its way. We will be in touch.`
- Server error: `Something went wrong sending that. Please ring 087-2520034 instead.`
- Turnstile failure: `The security check did not pass. Please try again.`
- Rate limited: `Too many attempts. Please try again in a few minutes.`

The success message contains no response-time promise. Do not add "within 24 hours".

### 5.3 Turnstile

1. Turnstile is a Cloudflare-hosted widget. It is the only permitted third-party script on the site.
2. Load it with `defer`, from `https://challenges.cloudflare.com/turnstile/v0/api.js`.
3. Mount it into `[data-turnstile-slot]`.
4. The site key is injected as a `data-sitekey` attribute on a `<div class="cf-turnstile">`.
5. The site key is public and may sit in the HTML. The secret key never appears in the repo.
6. `[EVIDENCE NEEDED: Turnstile site key — use the Cloudflare test key 1x00000000000000000000AA in preview mode]`
7. Add `<!-- PLACEHOLDER: replace before launch — real Turnstile site key from the Cloudflare dashboard -->` above the widget div.
8. Add `data-placeholder="true"` to the widget div.
9. The CSP in `_headers` must allow `https://challenges.cloudflare.com` in `script-src` and `frame-src`. See spec 09 section 2.
10. With JS disabled, Turnstile does not render, so the server rejects the submission. That is acceptable: the phone number is the JS-free fallback and is prominent on the page.

### 5.4 Contact details column

```html
<div class="enquiry__details">
  <h3>Or just ring</h3>
  <address class="enquiry__address">
    <p class="enquiry__phone"><a href="tel:+353872520034">087-2520034</a></p>
    <p>Dublin, Ireland</p>
  </address>
  <!-- PLACEHOLDER: replace before launch — business email address, opening hours, street address if a public office exists -->
  <h3>Service area</h3>
  <p>Based in Dublin. We work with clients anywhere, remotely.</p>
</div>
```

Rules:
1. The phone number is the most prominent element in this column. Font size `--fs-h3`.
2. `Dublin, Ireland` is the full extent of the location detail.
3. No email address. `[EVIDENCE NEEDED: business email]`
4. No opening hours. `[EVIDENCE NEEDED: opening hours]`
5. No street address. `[EVIDENCE NEEDED: street address]`
6. No embedded map.
7. No WhatsApp link. No WhatsApp number is confirmed.
8. `<address>` gets `font-style: normal`.

Tokens: form panel background `--surface`, radius `--radius-lg`, padding `var(--s-7)`, border `1px solid var(--line)`.
Field input background `--surface`, border `1px solid var(--line)`, radius `--radius-sm`, padding `var(--s-3) var(--s-4)`, font `--fs-body`, colour `--ink`.
Field input focus border `--ink`, plus the global `:focus-visible` outline.
Label font `--fs-small`, `--fw-medium`, colour `--ink`.
Hint font `--fs-micro`, colour `--ink-soft`.
Error font `--fs-micro`, colour `--accent`.
Field vertical gap `var(--s-5)`.

Error colour contrast note. `--accent` is `#e5804b` on `--surface` white. That does not reach 4.5:1. Therefore error text must not rely on colour alone: prefix every error message with a `⚠` character inside a `<span aria-hidden="true">`, set the error text colour to `--ink`, and use `--accent` only for the left border of the field. Add `--accent-strong: #a84f1f` to `tokens.css` and use it for error text so contrast passes. Note this token addition in the commit summary.

## 6. Section 4 — What happens next

`h2` copy, exact: `What happens next.`

Three steps. Use an `<ol>`.

Step 1
- `h3`: `We read it`
- Body: `Your message comes straight to us, not to a shared inbox someone checks weekly.`

Step 2
- `h3`: `We reply with questions`
- Body: `Usually two or three, to work out scope before anyone talks about money.`

Step 3
- `h3`: `We book a short call`
- Body: `Fifteen or twenty minutes. You come away knowing whether this is worth doing.`

Do not state a response time in hours or days.
Add before the `<ol>`: `<!-- PLACEHOLDER: replace before launch — add a real response-time commitment once the client confirms one -->`
Add `data-placeholder="true"` to the `<ol>`.

Reason for marking: the three steps describe a process that has not been confirmed as the client's actual practice.

Tokens: reuse `.card`. Background `--surface`, radius `--radius-lg`, padding `var(--s-6)`. Counter uses `--fs-h3`, colour `--accent`.
Grid: one column below 768px, three at 1024px.

Motion: `reveal-stagger.js`.

## 7. Section 5 — FAQ

Four questions. Use a `<dl>`. Container is `.container--narrow`.

`h2` copy, exact: `Before you write.`

Q1 `dt`: `Do I need to know what I want first?`
A1 `dd`: `No. "Not sure yet" is a valid answer in the form, and the call sorts it out.`

Q2 `dt`: `Do you work with businesses outside Ireland?`
A2 `dd`: `Yes. We are based in Dublin and work with clients anywhere.`

Q3 `dt`: `What happens to my details?`
A3 `dd`: `They are used to reply to your enquiry and nothing else. You are not added to a mailing list.`

Q4 `dt`: `Can I just ring instead?`
A4 `dd`: `Yes. 087-2520034.`

A3 is a policy statement. It must be true, and it is true, because no mailing list exists and no analytics or tracking script is loaded.
Add: `<!-- PLACEHOLDER: replace before launch — link to a privacy policy page once written -->`
No privacy policy page exists. `[EVIDENCE NEEDED: privacy policy page]`
Do not link to a non-existent `/privacy` URL.

Tokens: `dt` uses `--fs-h4`, `--fw-medium`, colour `--ink-black`. `dd` uses `--fs-body`, colour `--ink-soft`, margin-inline-start `0`, margin-block-end `var(--s-6)`.

Motion: `reveal-stagger.js`.

## 8. Footer

Identical to `index.html` section 13.
The `Contact Us` footer link carries `aria-current="page"` on this page.
The header CTA pill also carries `aria-current="page"` on this page.

## 9. `functions/api/contact.js` contract

Owner: `cf-deploy` (Haiku 4.5). Full contract, one requirement per line.

### 9.1 Handler shape

1. Export a named function `onRequestPost`.
2. Signature is `export async function onRequestPost(context)`.
3. Do not export `onRequest`. Only POST is handled.
4. A GET request therefore returns 405 from the Pages runtime automatically. Do not add a GET handler.
5. Read `context.request`, `context.env`.
6. Use no npm dependency. Fetch and the Web Crypto API only.

### 9.2 Request parsing

1. Accept `Content-Type: application/x-www-form-urlencoded`.
2. Accept `Content-Type: application/json`.
3. Reject any other content type with 415.
4. Reject a body larger than 16384 bytes with 413.
5. Parse with `await request.formData()` for the urlencoded case.
6. Parse with `await request.json()` for the JSON case.
7. Wrap parsing in try and catch. On a parse failure return 400.

### 9.3 Server-side validation

Validate every field again. Never trust the client.

| Field | Rule | Failure status |
|---|---|---|
| `name` | present, trimmed length 1 to 100 | 400 |
| `email` | present, trimmed length 5 to 254, matches `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` | 400 |
| `phone` | optional, trimmed length 0 to 30 | 400 |
| `business` | optional, trimmed length 0 to 120 | 400 |
| `service` | present, one of `web-design`, `seo`, `paid-advertising`, `ai-services`, `not-sure` | 400 |
| `message` | present, trimmed length 10 to 2000 | 400 |
| `consent` | present, equals the string `yes` | 400 |
| `cf-turnstile-response` | present, non-empty | 400 |

1. Trim every string before length checks.
2. Reject a `message` containing more than 5 URLs. Count matches of `/https?:\/\//g`. Return 400.
3. Strip control characters from every value before use.
4. Do not attempt HTML sanitisation. Send plain text only, so escaping is unnecessary.

### 9.4 Turnstile verification

1. POST to `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
2. Body is urlencoded with `secret` and `response`.
3. `secret` comes from `context.env.TURNSTILE_SECRET_KEY`.
4. `response` is the submitted `cf-turnstile-response` value.
5. Include `remoteip` from `request.headers.get('CF-Connecting-IP')`.
6. If the JSON response `success` is not `true`, return 403 with the error code `turnstile_failed`.
7. Verify before sending the email. Never send first.

### 9.5 Rate limiting

1. Derive a key from `request.headers.get('CF-Connecting-IP')`.
2. Store a counter in a Cloudflare KV namespace bound as `RATE_LIMIT`.
3. Limit is 5 submissions per IP per 3600 seconds.
4. On exceeding the limit, return 429 with the error code `rate_limited`.
5. If the `RATE_LIMIT` binding is missing, skip rate limiting and continue. Do not throw. Log a warning.
6. `[EVIDENCE NEEDED: KV namespace id for RATE_LIMIT — create it in the Cloudflare dashboard]`

### 9.6 Email delivery via Resend

1. POST to `https://api.resend.com/emails`.
2. Header `Authorization: Bearer ${context.env.RESEND_API_KEY}`.
3. Header `Content-Type: application/json`.
4. `from` is `context.env.CONTACT_FROM_EMAIL`.
5. `to` is `context.env.CONTACT_TO_EMAIL`.
6. `reply_to` is the submitted `email` value.
7. `subject` is `New enquiry from ${name} — ${service}`.
8. `text` is a plain-text body listing every submitted field on its own line.
9. Do not send an `html` body. Plain text removes an injection surface.
10. If the Resend call returns a non-2xx status, return 502 with the error code `send_failed`.
11. Do not log the message body. Log the status code and a request id only.
12. `[EVIDENCE NEEDED: CONTACT_TO_EMAIL — the business email is not yet supplied]`
13. `[EVIDENCE NEEDED: verified sending domain for Resend]`

### 9.7 Secrets

Environment variables, all set in the Cloudflare Pages dashboard, never in the repo:

- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

1. No secret value appears in `wrangler.toml`.
2. No secret value appears in any committed file.
3. No `.env` file is committed.
4. On a missing required env var, return 500 with the error code `misconfigured`, and log which var is missing by name only, never its value.

### 9.8 Responses

All responses are JSON with `Content-Type: application/json`.

Success, status 200:
```json
{ "ok": true }
```

Failure, status as per the table above:
```json
{ "ok": false, "error": "validation_failed", "fields": ["email"] }
```

Error codes, the complete set: `validation_failed`, `turnstile_failed`, `rate_limited`, `send_failed`, `misconfigured`, `bad_content_type`, `too_large`, `bad_request`.

1. Never return a stack trace.
2. Never echo the submitted message back in the response.
3. Set `Cache-Control: no-store` on every response.

### 9.9 No-JS submission

1. With JS disabled the browser posts the form natively and lands on the JSON response, which is a poor experience.
2. Therefore detect a native submission: if the `Accept` header does not include `application/json`, respond with a 303 redirect.
3. On success redirect to `/contact?sent=1`.
4. On failure redirect to `/contact?error=1`.
5. `contact.html` reads the query string with CSS only is not possible, so `contact-form.js` reads it and writes the matching status message into `[data-form-status]`.
6. With JS fully disabled the user sees the contact page again with no message. Accept that. The phone number is the reliable fallback.
7. Do not add a separate thank-you HTML page.

## 10. Head requirements

```html
<title>Contact TheAnalytico: Web, SEO and AI in Dublin | TheAnalytico</title>
<meta name="description" content="Get in touch with TheAnalytico about web design, SEO, paid advertising or AI services. Ring 087-2520034 or send an enquiry. Based in Dublin, working worldwide.">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://theanalytico.com/contact">
```

JSON-LD on this page: `BreadcrumbList` plus `ContactPage`. Shapes are in spec 09 section 8.
`contactPoint` may include `telephone: "+353872520034"`, `contactType: "customer service"`, and `areaServed: "Worldwide"`.
Do not include an `email` key. No email is supplied.
Do not include `hoursAvailable`. No hours are confirmed.
No `AggregateRating`. No `review`.

## 11. Motion summary

| Section | Module | Gating |
|---|---|---|
| `h1` and every `h2` | `heading-mask.js` | desktop only |
| Section overlaps | `section-curtain.js` | desktop only |
| Next-steps cards | `reveal-stagger.js` | desktop only |
| FAQ items | `reveal-stagger.js` | desktop only |
| Form validation and submit | `contact-form.js` | all viewports, always runs |
| Cursor blob | `cursor-blob.js` | desktop only, pointer fine only |
| Smooth scroll | `lenis-scroll.js` | desktop only |

`contact-form.js` is not decorative motion. It is never gated on `prefers-reduced-motion`. It is never gated on viewport width. It always runs. See spec 08 section 14.

Do not animate the form fields on reveal. A field sliding in under a user's cursor is hostile.
The form panel itself does not animate.

## 12. Acceptance criteria

1. `contact.html` contains exactly one `<h1>`.
2. Heading levels descend without skipping.
3. Sections appear in the order given in section 3.
4. Backgrounds run blue, cream, grey, blue.
5. The form `action` is exactly `/api/contact` and `method` is `POST`.
6. The form has the `novalidate` attribute.
7. The form contains exactly seven named controls: name, email, phone, business, service, message, consent.
8. Every control has a `<label>` whose `for` matches the control `id`.
9. No control uses a `placeholder` attribute in place of a label.
10. The service `<select>` has exactly six `<option>` elements, the first with an empty value.
11. The five service option values are exactly `web-design`, `seo`, `paid-advertising`, `ai-services`, `not-sure`.
12. Required attributes are present on name, email, service, message, and consent.
13. Every input has a `maxlength` attribute.
14. Every error paragraph has `role="alert"` and starts `hidden`.
15. The status paragraph has `role="status"` and `aria-live="polite"`.
16. The submit control is a `<button type="submit">`.
17. The Turnstile div has `data-placeholder="true"` and a preceding PLACEHOLDER comment.
18. The Turnstile script is loaded with `defer` from `https://challenges.cloudflare.com`.
19. No other third-party script is loaded on the page.
20. No file upload field exists.
21. No budget field exists.
22. No marketing consent checkbox exists.
23. The phone link `tel:+353872520034` appears at least twice on the page.
24. The phone number is rendered at `--fs-h3` in the details column.
25. No email address appears anywhere on the page.
26. No street address appears anywhere on the page.
27. No opening hours appear anywhere on the page.
28. No response time in hours or days appears anywhere on the page.
29. No embedded map or iframe appears, other than the Turnstile iframe.
30. The what-happens-next `<ol>` has `data-placeholder="true"` and a preceding PLACEHOLDER comment.
31. The FAQ is a `<dl>` with four `<dt>` and four `<dd>`.
32. No link to `/privacy` exists, because no privacy page exists.
33. `<meta name="robots" content="noindex, nofollow">` is present.
34. The canonical points at `https://theanalytico.com/contact`.
35. JSON-LD contains no `email` key, no `hoursAvailable`, no `aggregateRating`, no `review`.
36. `functions/api/contact.js` exports `onRequestPost` and does not export `onRequest`.
37. `functions/api/contact.js` validates all eight fields listed in section 9.3.
38. `functions/api/contact.js` verifies Turnstile before calling Resend.
39. `functions/api/contact.js` reads all four secrets from `context.env` and none from a literal.
40. `grep -rn "re_" functions/` returns zero Resend key literals.
41. `grep -rn "0x4" functions/ wrangler.toml` returns zero Turnstile secret literals.
42. Every response from the function has `Cache-Control: no-store`.
43. No response body contains a stack trace.
44. No response body echoes the submitted message.
45. The function returns 415 for an unsupported content type.
46. The function returns 413 for a body over 16384 bytes.
47. The function returns 403 with `turnstile_failed` when verification fails.
48. The function returns 429 with `rate_limited` after 5 submissions from one IP within an hour.
49. A native form post with an `Accept` header lacking `application/json` receives a 303 redirect, not JSON.
50. `contact-form.js` runs regardless of `prefers-reduced-motion` and regardless of viewport width.
51. No form field animates on scroll reveal.
52. With JS disabled, every field, label, and the submit button are visible and the form posts natively.
53. Every `data-placeholder="true"` element has a matching row in `PLACEHOLDER-CONTENT.md`.
54. The header, footer, and button markup match `index.html` apart from `aria-current`.
55. No inline `<style>` block, except the critical-CSS block in `<head>`.
56. Exactly one inline `<script>`, the header anti-flash script. The Turnstile script is external, not inline.
57. No `on*` attribute anywhere in the file.
58. No hex colour anywhere in the file.
59. Error text colour passes 4.5:1 against `--surface`.
60. Every error message is conveyed by text, not by colour alone.
61. Lighthouse mobile scores 95 or above on all four categories.
62. CLS below 0.05. The Turnstile widget slot has a reserved `min-height` of 65px.
63. British English throughout.

## 13. Non-goals

Do not add a calendar booking embed.
Do not add a live chat widget.
Do not add a WhatsApp link.
Do not add a separate thank-you page.
Do not add a newsletter signup.
Do not add a file upload.
Do not add a budget or pricing field.
Do not add a CAPTCHA other than Cloudflare Turnstile.
Do not add reCAPTCHA. It is a Google third-party script and breaks the performance and privacy posture.
Do not add an embedded map.
Do not write a privacy policy page in this phase.
Do not add analytics or tracking of any kind.
Do not store submissions in KV or D1. Email delivery only, plus the rate-limit counter.
Do not edit `tokens.css`, `base.css`, or `components.css`.
