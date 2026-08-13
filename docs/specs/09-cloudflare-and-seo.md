# Spec 09 — Cloudflare configuration and SEO

Owner agents: `cf-deploy` (Haiku 4.5) for config and Functions, `seo-auditor` (Sonnet 5) for meta, JSON-LD, and Lighthouse fixes.
Phase: 2 for config, parallel with markup. Phase 7 for the SEO audit pass.

## 1. Files

`cf-deploy` may create or edit only:

- `_headers`
- `_redirects`
- `wrangler.toml`
- `robots.txt`
- `functions/api/contact.js`

`seo-auditor` may create or edit only:

- `sitemap.xml`
- the `<head>` block of the six page HTML files
- the JSON-LD `<script type="application/ld+json">` blocks in the six page HTML files

Do not create any other file.
Do not create a `package.json`. There is no build step.
Do not create a `.github/workflows` file. Deployment is via the Cloudflare Pages Git integration.
Do not commit a `.env` file.
Do not commit a `.dev.vars` file. Add it to `.gitignore`.

## 2. `_headers`

Exact file contents. Order matters: Cloudflare applies the first matching rule set, and more specific paths go first.

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

/api/*
  Cache-Control: no-store
  X-Robots-Tag: noindex

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()
  X-Frame-Options: SAMEORIGIN
  Cross-Origin-Opener-Policy: same-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; form-action 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; upgrade-insecure-requests
  X-Robots-Tag: noindex, nofollow
```

Notes, one per line:

1. `Cache-Control: public, max-age=31536000, immutable` on `/assets/*` is required by `CLAUDE.md`.
2. Fonts get `Access-Control-Allow-Origin: *` because a `crossorigin` preload requires a CORS response even same-origin.
3. `script-src` includes `'unsafe-inline'` because two inline scripts exist: the header anti-flash script and nothing else. A nonce is not available on a static Pages deploy without a Function on every route.
4. `style-src` includes `'unsafe-inline'` because the critical-CSS block in `<head>` is inline.
5. `frame-src https://challenges.cloudflare.com` is required for the Turnstile iframe.
6. `connect-src https://challenges.cloudflare.com` is required for the Turnstile challenge fetch.
7. `img-src 'self' data:` allows inline SVG data URIs. It does not allow third-party images, which is correct: there are none.
8. `object-src 'none'` and `base-uri 'self'` are mandatory hardening.
9. `X-Robots-Tag: noindex, nofollow` on `/*` is the preview-mode header. It is a launch checklist item to remove. It belongs in `PLACEHOLDER-CONTENT.md`.
10. Do not add HSTS here. Cloudflare sets HSTS at the zone level, and a wrong `max-age` in a header file is hard to undo.
11. Do not add `Cache-Control` to `/*`. Pages sets a sensible default for HTML and an aggressive value would serve stale pages.
12. No third-party analytics domain appears in the CSP, because no analytics is loaded.

## 3. `_redirects`

Exact file contents.

```
# Force the canonical host. Replace the domain before launch.
https://www.theanalytico.com/*  https://theanalytico.com/:splat  301

# Strip .html extensions
/index.html      /            301
/services.html   /services    301
/work.html       /work        301
/insights.html   /insights    301
/about.html      /about       301
/contact.html    /contact     301

# Legacy or mistyped paths
/portfolio       /work        301
/blog            /insights    301
/contact-us      /contact     301
/services/*      /services    301
```

Notes:

1. `[EVIDENCE NEEDED: production domain — theanalytico.com is a placeholder]`. Both `_redirects` host lines must be updated at launch. Record in `PLACEHOLDER-CONTENT.md`.
2. Cloudflare Pages serves `/services` from `services.html` automatically. The explicit redirects make the canonical form the only reachable one.
3. Every redirect is `301`, permanent. Do not use `302`.
4. Do not add a redirect from `/` to anything. It is the canonical home.
5. Do not add a catch-all `/* /index.html 200` SPA rule. This is a multi-page site and that rule would break 404s.
6. There are exactly eleven rules. Do not add wildcards not listed here.

## 4. `wrangler.toml`

Exact file contents.

```toml
name = "theanalytico"
compatibility_date = "2026-08-13"
pages_build_output_dir = "."

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "REPLACE_WITH_KV_NAMESPACE_ID"
```

Notes:

1. `pages_build_output_dir = "."` because there is no build step and the repo root is the deploy root.
2. `compatibility_date` is fixed at `2026-08-13`. Do not set it to a future date.
3. No `[build]` section. There is no build command.
4. No `[vars]` section. Every variable is a secret and lives in the Pages dashboard.
5. `[EVIDENCE NEEDED: KV namespace id for RATE_LIMIT]`. The literal `REPLACE_WITH_KV_NAMESPACE_ID` is a placeholder and belongs in `PLACEHOLDER-CONTENT.md`.
6. No secret value appears in this file. Verify with `grep -nE "re_|0x4|sk_" wrangler.toml` returning nothing.
7. Environment variables set in the Cloudflare Pages dashboard, not here: `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`.

## 5. `functions/api/contact.js` contract

The full contract is in spec 07 section 9. `cf-deploy` implements exactly that. Repeat the load-bearing constraints here:

1. Export `onRequestPost` only. Do not export `onRequest`.
2. Accept three content types: `application/x-www-form-urlencoded`, `application/json`, `multipart/form-data`.
3. Reject any other content type with 415 and the error code `bad_content_type`.
4. Reject a body over 16384 bytes with 413 and the error code `too_large`.
5. Validate all eight fields server-side. The table is in spec 07 section 9.3.
6. Verify Turnstile against `https://challenges.cloudflare.com/turnstile/v0/siteverify` before sending anything.
7. Rate limit to 5 submissions per IP per 3600 seconds via the `RATE_LIMIT` KV binding.
8. If the `RATE_LIMIT` binding is missing, skip rate limiting and continue. Do not throw.
9. Send via `https://api.resend.com/emails` with a plain-text body only. No `html` body.
10. Read every secret from `context.env`. Zero literals.
11. Return JSON with `Cache-Control: no-store` on every response.
12. Never return a stack trace. Never echo the submitted message.
13. Return a 303 redirect when the `Accept` header does not include `application/json`, to `/contact?sent=1` or `/contact?error=1`.
14. Error codes, the complete set: `validation_failed`, `turnstile_failed`, `rate_limited`, `send_failed`, `misconfigured`, `bad_content_type`, `too_large`, `bad_request`.
15. No npm dependency. Fetch and Web Crypto only.

## 6. `robots.txt`

Preview mode contents. This is what ships now.

```
# PREVIEW MODE — all crawling disallowed.
# Remove the Disallow line and restore the sitemap directive at launch.
# See PLACEHOLDER-CONTENT.md.

User-agent: *
Disallow: /

Sitemap: https://theanalytico.com/sitemap.xml
```

Notes:

1. `Disallow: /` is the preview-mode gate required by `CLAUDE.md`. It is removed at launch.
2. The `Sitemap:` line stays even in preview mode. It is harmless and easy to forget to add back.
3. `[EVIDENCE NEEDED: production domain]` for the sitemap URL.
4. Do not add a `Crawl-delay`. Google ignores it and Bing does not need it here.
5. Do not add per-bot blocks. One wildcard block is correct.
6. Do not disallow `/assets/`. Blocking CSS and JS breaks Google's rendering and is an SEO error at launch.

Launch-mode contents, for reference. `cf-deploy` does not write this yet.

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://theanalytico.com/sitemap.xml
```

## 7. `sitemap.xml`

Exact file contents. Six URLs. No more.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://theanalytico.com/</loc>
    <lastmod>2026-08-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://theanalytico.com/services</loc>
    <lastmod>2026-08-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://theanalytico.com/work</loc>
    <lastmod>2026-08-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://theanalytico.com/insights</loc>
    <lastmod>2026-08-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://theanalytico.com/about</loc>
    <lastmod>2026-08-13</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://theanalytico.com/contact</loc>
    <lastmod>2026-08-13</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

Notes:

1. Extensionless URLs only. They must match the canonical tags exactly.
2. Do not list `.html` URLs. They 301 away and a sitemap must contain only 200-status canonical URLs.
3. Do not list individual insight posts. None exist.
4. `[EVIDENCE NEEDED: production domain]` for every `<loc>`. All six change at launch.
5. Do not add `<image:image>` entries. No image sitemap is needed for six pages.
6. Do not add `<xhtml:link rel="alternate">`. There is one language.

## 8. Per-page title, description, and canonical

Exact strings. Do not rewrite them. Character counts are within Google's display limits.

| Page | `<title>` | Meta description | Canonical |
|---|---|---|---|
| `index.html` | `Web Design, SEO and AI Services in Dublin \| TheAnalytico` | `TheAnalytico builds fast websites and runs SEO, Meta and Google ads, and AI automation for local businesses. Based in Dublin, working worldwide.` | `https://theanalytico.com/` |
| `services.html` | `Web Design, SEO, Paid Ads and AI Services \| TheAnalytico` | `Four services from TheAnalytico: web design, SEO, Meta and Google advertising, and five AI capabilities including chatbots, automation and reporting.` | `https://theanalytico.com/services` |
| `work.html` | `Our Work: Three Live Client Sites \| TheAnalytico` | `Case studies from TheAnalytico: ArdLens aerial cinematography, KC Accountants, and SodoLT massage therapy. What we built, the stack, and links to each live site.` | `https://theanalytico.com/work` |
| `insights.html` | `Insights on Web Design, SEO and AI \| TheAnalytico` | `Practical notes from TheAnalytico on homepages that convert, Google Business Profile, local search, Meta ads and where AI actually helps a small team.` | `https://theanalytico.com/insights` |
| `about.html` | `About TheAnalytico: Web, SEO and AI Studio in Dublin \| TheAnalytico` | `TheAnalytico is a Dublin studio building fast websites and running SEO, paid advertising and AI automation for local businesses. Three client sites live, working worldwide.` | `https://theanalytico.com/about` |
| `contact.html` | `Contact TheAnalytico: Web, SEO and AI in Dublin \| TheAnalytico` | `Get in touch with TheAnalytico about web design, SEO, paid advertising or AI services. Ring 087-2520034 or send an enquiry. Based in Dublin, working worldwide.` | `https://theanalytico.com/contact` |

Rules:
1. Every title is unique.
2. Every description is unique.
3. No title exceeds 65 characters before the brand suffix.
4. No description exceeds 160 characters.
5. Every canonical is absolute, `https`, extensionless, and self-referencing.
6. The home canonical ends with a trailing slash. The other five do not.
7. `[EVIDENCE NEEDED: production domain — theanalytico.com is a placeholder across all six canonicals]`.

### Canonical strategy

1. Every page carries exactly one `<link rel="canonical">`.
2. Every canonical is self-referencing. No page canonicalises to another page.
3. Canonicals use the apex host, not `www`. `_redirects` forces the apex.
4. Canonicals are extensionless. `_redirects` strips `.html`.
5. Canonicals never carry a query string. `/contact?sent=1` canonicalises to `/contact`.
6. Canonicals never carry a fragment.
7. The canonical host must match the `_redirects` target host and every `sitemap.xml` `<loc>`. All three change together at launch.

## 9. Preview-mode noindex requirement

Mandatory on all six pages while in preview mode.

```html
<meta name="robots" content="noindex, nofollow">
```

Rules:
1. It sits in `<head>`, before the `<title>`.
2. It appears on all six pages. Not five. Six.
3. It is paired with the `X-Robots-Tag: noindex, nofollow` header in `_headers` and the `Disallow: /` in `robots.txt`. Three layers, because one is easy to miss.
4. All three are removed at launch. Each is a separate line in `PLACEHOLDER-CONTENT.md`.
5. Do not add `noarchive` or `nosnippet`. `noindex, nofollow` is sufficient.
6. Do not use `<meta name="googlebot">`. The generic `robots` name covers every crawler.

## 10. Open Graph and Twitter tags

Per page. Substitute the page-specific values from the section 8 table.

```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="TheAnalytico">
<meta property="og:locale" content="en_IE">
<meta property="og:title" content="[page title, brand suffix removed]">
<meta property="og:description" content="[page meta description, identical string]">
<meta property="og:url" content="[page canonical, identical string]">
<meta property="og:image" content="https://theanalytico.com/assets/img/og-default.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="The TheAnalytico wordmark above the line: web design, SEO, paid ads and AI for local businesses">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[same as og:title]">
<meta name="twitter:description" content="[same as og:description]">
<meta name="twitter:image" content="https://theanalytico.com/assets/img/og-default.png">
<meta name="twitter:image:alt" content="[same as og:image:alt]">
```

Rules:
1. `og:type` is `website` on all six pages. Not `article`. No page is an article.
2. `og:locale` is `en_IE`. British English, Irish locale.
3. `og:url` is byte-identical to the canonical on the same page.
4. `og:image` is absolute. A relative OG image fails on every platform.
5. `og:image:width` and `og:image:height` are declared, so the first share renders without a fetch.
6. `og:image:alt` is declared.
7. One shared OG image for all six pages. Do not generate six.
8. Do not add `twitter:site` or `twitter:creator`. No Twitter handle is confirmed. `[EVIDENCE NEEDED: social profile handles]`
9. Do not add `og:image:secure_url`. It is redundant when `og:image` is already `https`.
10. Do not add `article:published_time` anywhere. No page is an article.
11. `[EVIDENCE NEEDED: production domain]` for `og:image` and every `og:url`.

## 11. JSON-LD shapes

All JSON-LD is truthful. `AggregateRating` and `review` are omitted on every page regardless of what the visible page shows. Fake review schema is what triggers Google penalties.

Every block is `<script type="application/ld+json">`, placed as the last element in `<head>`.
Every block is valid JSON. No trailing commas. No JavaScript comments inside.
`[EVIDENCE NEEDED: production domain]` applies to every `@id` and `url` value below.

### 11.1 `index.html` — `ProfessionalService`

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://theanalytico.com/#business",
  "name": "TheAnalytico",
  "url": "https://theanalytico.com/",
  "image": "https://theanalytico.com/assets/img/og-default.png",
  "logo": "https://theanalytico.com/assets/img/favicon-180.png",
  "description": "TheAnalytico builds fast websites and runs SEO, Meta and Google advertising, and AI automation for local businesses.",
  "telephone": "+353872520034",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Dublin",
    "addressCountry": "IE"
  },
  "areaServed": {
    "@type": "Place",
    "name": "Worldwide"
  },
  "knowsAbout": [
    "Web design",
    "Search engine optimisation",
    "Google Ads",
    "Meta advertising",
    "AI automation"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Web Design" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "SEO" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Paid Advertising" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AI Services" } }
    ]
  }
}
```

Forbidden keys on this node, all of them:
- `aggregateRating` — no real ratings exist
- `review` — no real reviews exist
- `streetAddress` — unconfirmed
- `postalCode` — unconfirmed
- `openingHours` and `openingHoursSpecification` — unconfirmed
- `email` — not supplied
- `foundingDate` — unconfirmed
- `founder` and `employee` — unconfirmed
- `award` — the client confirmed there are none
- `sameAs` — no social profile URLs are confirmed
- `priceRange` — no pricing is confirmed
- `numberOfEmployees` — unconfirmed
- `geo` with `latitude` and `longitude` — unconfirmed, and misleading without a street address
- `vatID` and `taxID` — unconfirmed

`CLAUDE.md` names `LocalBusiness` for the home page. `ProfessionalService` is a subtype of `LocalBusiness`, so it satisfies that requirement and is more specific. Use `ProfessionalService`.

`addressLocality` is exactly `Dublin`. `addressCountry` is exactly `IE`. `areaServed.name` is exactly `Worldwide`.

`hasOfferCatalog` contains no `price` and no `priceCurrency`, because no pricing is confirmed. An `Offer` without a price is valid.

### 11.2 `services.html` — four `Service` nodes plus `BreadcrumbList`

Use a `@graph` array containing five nodes: four `Service` and one `BreadcrumbList`.

Each `Service` node shape:

```json
{
  "@type": "Service",
  "@id": "https://theanalytico.com/services#web-design",
  "name": "Web Design",
  "serviceType": "Web design",
  "description": "Design and build from scratch, shaped around the one action you want a visitor to take. Responsive, fast, and easy to update.",
  "provider": { "@id": "https://theanalytico.com/#business" },
  "areaServed": { "@type": "Place", "name": "Worldwide" }
}
```

The four `@id` fragments are `#web-design`, `#seo`, `#paid-advertising`, `#ai-services`, matching the section ids on the page.
Each `description` is the pillar lead copy from spec 03, character for character.
`provider` references the home page `@id` node. Do not duplicate the business details.

Forbidden on every `Service` node: `offers` with a `price`, `aggregateRating`, `review`.

`BreadcrumbList` shape:

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://theanalytico.com/" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://theanalytico.com/services" }
  ]
}
```

### 11.3 `work.html` — `BreadcrumbList` plus three `CreativeWork` nodes

Each `CreativeWork` node shape:

```json
{
  "@type": "CreativeWork",
  "name": "ArdLens website",
  "url": "https://ardlens.com",
  "about": "Aerial cinematography, coastal and heritage Ireland",
  "creator": { "@id": "https://theanalytico.com/#business" }
}
```

Three nodes: `ArdLens website`, `KC Accountants website`, `SodoLT website`.
The KC Accountants `url` is `https://kc-accountant.puneetcf.workers.dev`, client-approved for now.
The SodoLT `url` is `https://sodolt.com`.

Forbidden on every `CreativeWork` node: `aggregateRating`, `review`, `interactionStatistic`, any numeric result metric, `datePublished` unless a real launch date is confirmed. No launch dates are confirmed, so omit `datePublished`.

`BreadcrumbList` positions: Home 1, Work 2.

### 11.4 `insights.html` — `BreadcrumbList` plus `CollectionPage`

```json
{
  "@type": "CollectionPage",
  "@id": "https://theanalytico.com/insights#page",
  "name": "Insights",
  "url": "https://theanalytico.com/insights",
  "description": "Practical notes on web design, search and AI for small businesses.",
  "isPartOf": { "@id": "https://theanalytico.com/#business" }
}
```

Do not emit `Article` or `BlogPosting` on this page. No post is published, every post URL is `#`, and `Article` schema pointing at a fragment is invalid.
Do not emit `author`. No author is confirmed.
Do not emit `hasPart` listing the six posts. They have no URLs.

`CLAUDE.md` names `Article` for insight posts. That obligation activates when individual post pages exist. It does not apply to the index page.

`BreadcrumbList` positions: Home 1, Insights 2.

### 11.5 `about.html` — `BreadcrumbList` plus `AboutPage`

```json
{
  "@type": "AboutPage",
  "@id": "https://theanalytico.com/about#page",
  "name": "About TheAnalytico",
  "url": "https://theanalytico.com/about",
  "description": "A Dublin studio building fast websites and running SEO, paid advertising and AI automation for local businesses.",
  "mainEntity": { "@id": "https://theanalytico.com/#business" }
}
```

Forbidden: `foundingDate`, `founder`, `employee`, `numberOfEmployees`, `award`, `aggregateRating`, `review`.

`BreadcrumbList` positions: Home 1, About 2.

### 11.6 `contact.html` — `BreadcrumbList` plus `ContactPage`

```json
{
  "@type": "ContactPage",
  "@id": "https://theanalytico.com/contact#page",
  "name": "Contact TheAnalytico",
  "url": "https://theanalytico.com/contact",
  "mainEntity": {
    "@id": "https://theanalytico.com/#business",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+353872520034",
      "contactType": "customer service",
      "areaServed": "Worldwide",
      "availableLanguage": "English"
    }
  }
}
```

Forbidden: `email`, `hoursAvailable`, `aggregateRating`, `review`.

`BreadcrumbList` positions: Home 1, Contact 2.

## 12. Head element order

Same order on all six pages. `seo-auditor` enforces it.

1. `<meta charset="utf-8">`
2. `<meta name="viewport" content="width=device-width, initial-scale=1">`
3. `<meta name="robots" content="noindex, nofollow">`
4. `<title>`
5. `<meta name="description">`
6. `<link rel="canonical">`
7. Icon links, four of them, per spec 01 section 4
8. `<link rel="manifest" href="/site.webmanifest">`
9. Two font preload links, per spec 00 section 13
10. The inline critical-CSS `<style>` block
11. `<link rel="stylesheet">` for `tokens.css`, `base.css`, `components.css`, `pages.css`, in that order
12. The inline header anti-flash `<script>`, per spec 01 section 7
13. `<script type="module" src="/assets/js/main.js" defer>`
14. Open Graph and Twitter tags
15. The JSON-LD block, last

Rules:
1. `charset` is the first element in `<head>`, always.
2. `viewport` is second.
3. Font preloads come before the stylesheet links, so the font fetch starts earlier.
4. `main.js` is `type="module"` and `defer`. A module script is deferred by default; the explicit `defer` is harmless and documents the intent.
5. No `<script>` is `async`. Order matters for the anti-flash script.
6. Four stylesheet links, in the given order, because the cascade depends on it.
7. Do not combine the four stylesheets. Cloudflare serves them over HTTP/2 and the separation keeps agent file ownership clean.

## 13. Critical CSS block

1. Inline `<style>` in `<head>`, the only permitted style block.
2. Contents: the `:root` colour tokens, the two `@font-face` declarations for the preloaded faces, `body` background and colour, the header shell resting styles for both boot states, and the hero section's above-the-fold layout.
3. Hard size limit: 4KB uncompressed.
4. Do not inline the whole of `tokens.css`.
5. Do not inline `components.css`.
6. `seo-auditor` owns this block and may edit only the `<style>` element in each `<head>`.

## 14. Performance requirements

Every page, mobile, throttled.

| Metric | Target |
|---|---|
| Lighthouse Performance | 95 or above |
| Lighthouse Accessibility | 95 or above |
| Lighthouse Best Practices | 95 or above |
| Lighthouse SEO | 95 or above |
| Largest Contentful Paint | under 2.0s |
| Cumulative Layout Shift | under 0.05 |
| Total Blocking Time | under 200ms |
| Total JS, gzipped | under 90KB |
| Total CSS, gzipped | under 20KB |
| Font requests on first paint | 2 |

Rules:
1. Every `<img>` has explicit `width` and `height`.
2. Every below-the-fold `<img>` has `loading="lazy"`.
3. The hero image has `loading="eager"` and `fetchpriority="high"`.
4. Every image is `webp`. No `png` or `jpg` in content images. The favicons and the OG image are `png` because platforms require it.
5. No third-party script other than Turnstile on `contact.html`.
6. No web font other than the four self-hosted `woff2` faces.
7. No CSS or JS is loaded from a CDN.
8. The Turnstile widget slot has a reserved `min-height: 65px` so it causes no CLS.

## 15. Acceptance criteria

1. `_headers` exists and contains the four rule blocks in the order given in section 2.
2. `_headers` sets `Cache-Control: public, max-age=31536000, immutable` on `/assets/*`.
3. `_headers` sets `X-Content-Type-Options: nosniff` on `/*`.
4. `_headers` sets `Referrer-Policy: strict-origin-when-cross-origin` on `/*`.
5. `_headers` sets a `Permissions-Policy` on `/*`.
6. `_headers` sets a `Content-Security-Policy` on `/*`.
7. The CSP `frame-src` includes `https://challenges.cloudflare.com`.
8. The CSP `object-src` is `'none'`.
9. The CSP contains no third-party domain other than `https://challenges.cloudflare.com`.
10. `_headers` sets `X-Robots-Tag: noindex, nofollow` on `/*` while in preview mode.
11. `_headers` sets `Cache-Control: no-store` on `/api/*`.
12. `_redirects` exists and contains exactly eleven rules.
13. Every `_redirects` rule uses status `301`.
14. `_redirects` contains no `/* /index.html 200` SPA rule.
15. `_redirects` redirects each of the six `.html` paths to its extensionless form.
16. `wrangler.toml` exists, sets `pages_build_output_dir = "."`, and has no `[build]` section.
17. `wrangler.toml` has no `[vars]` section.
18. `grep -nE "re_|sk_|0x4" wrangler.toml` returns nothing.
19. `wrangler.toml` declares the `RATE_LIMIT` KV binding.
20. `robots.txt` contains `Disallow: /` while in preview mode.
21. `robots.txt` contains a `Sitemap:` directive.
22. `robots.txt` does not disallow `/assets/`.
23. `sitemap.xml` contains exactly six `<url>` entries.
24. Every `sitemap.xml` `<loc>` is extensionless and matches a page canonical byte for byte.
25. `sitemap.xml` lists no `.html` URL.
26. `sitemap.xml` parses as valid XML.
27. All six pages have a unique `<title>`.
28. All six pages have a unique meta description.
29. No meta description exceeds 160 characters.
30. All six pages have exactly one `<link rel="canonical">`.
31. Every canonical is absolute, `https`, and self-referencing.
32. Every canonical host matches the `_redirects` target host and the `sitemap.xml` host.
33. All six pages have `<meta name="robots" content="noindex, nofollow">`.
34. All six pages have `og:type`, `og:title`, `og:description`, `og:url`, `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`.
35. Every `og:url` is byte-identical to the canonical on the same page.
36. Every `og:image` is an absolute `https` URL.
37. All six pages have `twitter:card` set to `summary_large_image`.
38. No page has `twitter:site` or `twitter:creator`.
39. No page has `article:published_time`.
40. All six pages have exactly one JSON-LD block, and it is the last element in `<head>`.
41. Every JSON-LD block parses as valid JSON.
42. `grep -rn "aggregateRating" *.html` returns zero matches.
43. `grep -rn '"review"' *.html` returns zero matches.
44. `grep -rn "streetAddress" *.html` returns zero matches.
45. `grep -rn "postalCode" *.html` returns zero matches.
46. `grep -rn "foundingDate" *.html` returns zero matches.
47. `grep -rn "priceRange" *.html` returns zero matches.
48. `grep -rn '"award"' *.html` returns zero matches.
49. `grep -rn "sameAs" *.html` returns zero matches.
50. `index.html` JSON-LD `@type` is `ProfessionalService`.
51. `index.html` JSON-LD `address.addressLocality` is exactly `Dublin`.
52. `index.html` JSON-LD `address.addressCountry` is exactly `IE`.
53. `index.html` JSON-LD `areaServed.name` is exactly `Worldwide`.
54. `index.html` JSON-LD `telephone` is exactly `+353872520034`.
55. `services.html` JSON-LD contains exactly four `Service` nodes.
56. No `Service` node contains an `offers` key with a `price`.
57. `work.html` JSON-LD contains exactly three `CreativeWork` nodes.
58. No `CreativeWork` node contains a numeric result metric.
59. `insights.html` JSON-LD contains zero `Article` and zero `BlogPosting` nodes.
60. `about.html` JSON-LD contains no `founder` or `employee` node.
61. `contact.html` JSON-LD `contactPoint.telephone` is exactly `+353872520034` and contains no `email` key.
62. Five pages carry a `BreadcrumbList`. `index.html` does not, because it is the root.
63. Head elements appear in the order given in section 12 on all six pages.
64. `charset` is the first element in every `<head>`.
65. Exactly one inline `<style>` per page, under 4KB.
66. Exactly one inline `<script>` per page, the header anti-flash script.
67. Exactly four `<link rel="stylesheet">` per page, in the order tokens, base, components, pages.
68. Exactly two font preload links per page.
69. `main.js` is loaded with `type="module"`.
70. No `<script>` on any page uses `async`.
71. No page loads a resource from a domain other than the site's own and `https://challenges.cloudflare.com`.
72. `functions/api/contact.js` exports `onRequestPost` and no other handler.
73. `functions/api/contact.js` contains zero secret literals.
74. `functions/api/contact.js` sets `Cache-Control: no-store` on every response.
75. `.dev.vars` is listed in `.gitignore`.
76. Lighthouse mobile scores 95 or above on all four categories, on all six pages.
77. CLS is below 0.05 on all six pages.
78. Every content image is `webp`.
79. Every `<img>` has explicit `width` and `height`.
80. British English throughout every title and description.

## 16. Non-goals

Do not add analytics of any kind. No Google Analytics, no Plausible, no Cloudflare Web Analytics.
Do not add a cookie consent banner. Nothing is tracked, so nothing needs consent.
Do not add a tag manager.
Do not add HSTS to `_headers`.
Do not add a CSP nonce. A static Pages deploy cannot generate one per request without a Function on every route.
Do not add a service worker.
Do not add a `manifest` beyond the minimal `site.webmanifest` in spec 01.
Do not add AMP pages.
Do not add hreflang tags. There is one language.
Do not add an image sitemap.
Do not add an RSS feed.
Do not add `Article` JSON-LD anywhere in this phase.
Do not add `FAQPage` JSON-LD. Google removed FAQ rich results for most sites and it adds risk without benefit.
Do not add `AggregateRating` or `review` anywhere, under any circumstances, regardless of what the visible page shows.
Do not add `Organization` alongside `ProfessionalService`. One business node, referenced by `@id`.
Do not create a 404 page in this phase. Cloudflare Pages serves a default.
Do not add a `package.json` or any npm dependency.
Do not add a build step.
Do not edit any CSS file.
Do not edit any JS module.
