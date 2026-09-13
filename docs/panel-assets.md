# Panel assets — for the pinned services section (spec 12, movement 3)

Written 13 Sep 2026. Assets only. **Nothing in this file is wired into any page.**
`services.html`/`index.html` still show the four-card gradient grid; that
replacement is a separate task.

## What these are

Four AI-generated source clips (`raw-video/*.mp4`, gitignored, not served),
one per service pillar, encoded to H.264 and dropped in `assets/video/`.
Verified before conversion — no hard cuts, no frozen runs, no speed ramps,
all 161 source frames intact (see the verification table from the
conversion pass for the full method and numbers).

**Material varies by design.** These are not visually uniform "chrome on
black" panels — that was the original brief, but three of the four clips
turned out to be different materials (confirmed by direct frame inspection,
not just the pixel-diff checks) and the client's call was to keep the
variety rather than regenerate: paper folds, frost/branch filaments, and
converging light rays, alongside one genuinely chrome clip. All four still
share a near-black background. Whoever builds movement 3 should not assume
they need to look alike.

| Pillar | File | Subject |
|---|---|---|
| Web Design | `panel-web.mp4` | White paper, folded, near-black background |
| SEO | `panel-seo.mp4` | Frost/branch-like filament structure, near-black background |
| Paid Advertising | `panel-paid.mp4` | Converging white light rays, pure black background |
| AI Services | `panel-ai.mp4` | Chrome spheres/rods network, near-black background — the one clip matching the hero morph's original chrome material |

## Format

All four, identical encoding settings:

- **H.264**, `-crf 34 -g 6 -preset slow -pix_fmt yuv420p -movflags +faststart -an`, scaled to 640×360.
- **All 161 source frames preserved** — no frame sampling/reduction, unlike a
  sprite sheet. 30fps, 5.37s duration, matching the source exactly.
- No audio track.
- `-g 6`: a keyframe every 6 frames (0.2s), the same setting proven out on
  the hero (`hero-morph.js`) to keep `currentTime` seeks accurate under
  rapid scroll — see that module's own doc comment for the full reasoning.
  Keep this if movement 3 scrubs the same way; do not raise it to save bytes.

**Why video, not a sprite sheet:** sprite sheets were tried first and
rejected on measurement, not preference. At 640×360/24 frames, `panel-web`
and `panel-ai` fit a 250KB budget easily, but `panel-seo` and `panel-paid`
(fine filament/line detail, the same problem the hero's ink footage had)
only fit after cutting frame count to 12–16, and even then cost more than
encoding all 161 frames as H.264 does. Sprite sheets compress each frame
independently; this is continuous, temporally coherent motion, which H.264
inter-frame compression handles far better.

## Posters

One WebP per clip, extracted from **frame 160 (the last frame)**, at native
1280×720 — sharper than the 640×360 video, cheap because it's a single
image. These sequences hold their end state once a scrub completes (the
narrative-progression motion rule), so the last frame is also the correct
static/no-JS/reduced-motion fallback, exactly as `hero-ink-poster.webp`
is for the hero.

## File sizes (measured, not estimated)

| File | Bytes | KB |
|---|---|---|
| `panel-web.mp4` | 138,645 | 135.4 |
| `panel-seo.mp4` | 460,876 | 450.1 |
| `panel-paid.mp4` | 299,484 | 292.5 |
| `panel-ai.mp4` | 144,653 | 141.3 |
| `panel-web-poster.webp` | 8,968 | 8.8 |
| `panel-seo-poster.webp` | 75,244 | 73.5 |
| `panel-paid-poster.webp` | 35,922 | 35.1 |
| `panel-ai-poster.webp` | 21,656 | 21.2 |
| **Total, four panels + posters** | **1,185,448** | **1,157.7** |

`panel-seo` is by far the most expensive of the four (fine branching detail
against black compresses worst of everything tested, hero-ink included,
proportionally) — worth knowing if movement 3 needs to trim its own budget
later; it is the one file with room to drop frames if so, since none of
the source verification flagged it as otherwise unusable.

## Consuming these in movement 3

Spec 12 (`docs/specs/12-home-restructure.md`) §6.2 was written against the
sprite-sheet plan and is now stale on format specifically — it describes
`<canvas data-services-pin-canvas>` per pillar, drawing sprite frames. That
should become a `<video data-services-pin-video>` per pillar instead,
scrubbed via `currentTime` the same way `hero-morph.js` now does: fetch,
`URL.createObjectURL`, seek on `ScrollTrigger`'s `onUpdate`, muted,
playsinline, never played. The pin/list-advance logic spec 12 describes
(one active pillar at a time, crossfade between them) is unaffected by this
— only the render target changes, exactly the same substitution the hero
just went through.

Reminder: `services-pin.js` does not exist yet, and per the standing
decision on movement 3, it should not be built until the pinned-section
task explicitly picks this up. This document exists so that task can start
from proven, correctly-encoded assets rather than repeating the sprite vs.
video investigation.
