/**
 * hero-morph.js
 * Inventory item 1 (CLAUDE.md): the hero morph — one continuous scroll-scrubbed
 * sequence, pinned, holding its last frame once the scrub reaches the end
 * (narrative progression, no idle loop, per the motion rule in CLAUDE.md).
 *
 * Also drives the single service-name line under the headline (real DOM
 * text, never aria-hidden — see the markup and writeService below), stepped
 * by the same scroll progress as the video. This is not a rebuild of the
 * four-caption slideshow the ink footage replaced: one line, one word at a
 * time, no per-word layout/positioning, and it is not a substitute for the
 * pinned services section, which covers all four pillars properly.
 *
 * Revised 13 Sep 2026: source material changed from a chrome sprite sheet to
 * an AI-generated ink-in-water clip (raw-video/hero-ink.mp4), and the render
 * target changed from a sprite-sheet <canvas> to a blob-URL <video> scrubbed
 * by video.currentTime. This reverses the sprite-sheet decision documented in
 * the previous revision of this file — that decision is not wrong in general,
 * it just does not apply here:
 *
 * The sprite sheet exists because a *network* <video> cannot be scrubbed
 * accurately (Cloudflare static assets do not honour Range requests, and even
 * a blob-URL video previously showed dropped frames under rapid currentTime
 * seeks). Ink-in-water is slow, continuous, temporally coherent motion —
 * exactly what H.264 inter-frame compression is designed for — where a chrome
 * sprite sheet's fine, high-frequency tendril detail compresses far worse
 * per-frame than the same footage compresses temporally: sprite sheets at a
 * quality wide enough to avoid visible banding ran 2-8x over budget in
 * testing, even at 8 frames. Encoding as H.264 (crf 34, -g 6 for a keyframe
 * every 6 frames so a seek is never far from one, -preset slow) gives all 161
 * source frames for less than a 20-frame sprite sheet cost. The clip is fully
 * local before scrubbing starts (fetch → blob → createObjectURL), so seeking
 * is exact, not the throttled network-video case the old sprite-sheet
 * decision was actually about. Verified empirically, not assumed — see the
 * fast-scroll pixel-diff check run against this module before shipping it.
 *
 * Global motion rules (CLAUDE.md), repeated per module:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js. Modules receive it as an argument.
 * 4. Lenis is created once elsewhere; this module never creates a Lenis instance.
 * 5. The only RAF loop in the project is gsap.ticker; nothing here starts a second one.
 * 6. This module returns a cleanup function.
 * 7. Shows the final frame, static, no animation, when prefers-reduced-motion:
 *    reduce matches — and does not fetch the video at all in that case; the
 *    poster (extracted from the source's own last frame) already *is* the
 *    held end state, so there is nothing further to show.
 * 8. Mobile pins too, same as desktop, but with pinType: 'transform' rather
 *    than the default position: fixed — the latter is what causes the
 *    classic mobile Safari scroll-jank/jump (fighting the dynamic address
 *    bar's own show/hide), not pinning itself. Re-checked 13 Sep 2026
 *    against the reported mobile scrub bounce (see the trigger config
 *    below): could not exercise the real position:fixed-vs-address-bar
 *    conflict this comment describes in headless emulation at all —
 *    headless Chromium has no address bar UI to fight in the first place,
 *    with or without touch emulation. Left as 'transform', the documented
 *    reasoning for it is unchanged and untested either way this pass;
 *    needs a real device to actually compare.
 * 9. Never animates width, height, top, or left. Setting video.currentTime is
 *    a media playback position, not a layout or transform property.
 * 10. Queries elements with data-* attributes only, never a class selector.
 * 11. If a hook element is absent, returns a no-op cleanup immediately.
 * 12. No console.* in shipped code.
 *
 * video is never played (no autoplay, .play() is never called) — only
 * scrubbed via currentTime — and is always muted and playsinline, per the
 * task's own constraint and because an audible/playing background video has
 * no place in a scroll-driven visual.
 */

const NOOP = () => {};
const FRAME_DURATION = 1 / 30; // both encodes are 30fps

export function initHeroMorph({ ScrollTrigger, reduced, isMobile }) {
  const stage = document.querySelector('[data-hero-morph-stage]');
  const visual = document.querySelector('[data-hero-morph-visual]');
  const video = document.querySelector('[data-hero-morph-video]');
  const fallback = document.querySelector('[data-hero-morph-fallback]');
  // Optional: the telemetry strip is decoration (aria-hidden in the
  // markup), not a required hook, so its absence doesn't bail the module.
  const telemetryProgress = document.querySelector('[data-hero-telemetry-progress]');
  // Optional too, same reasoning, but this one is real content, never
  // aria-hidden (see the markup and this module's own doc comment).
  const serviceTickerWord = document.querySelector('[data-hero-service-ticker-word]');
  if (!stage || !visual || !video) return NOOP;

  // Pillar order matches CLAUDE.md "Services" and every other pillar list
  // on the site — the four-caption hero this replaced ran Web -> Paid ->
  // SEO -> AI, which DESIGN-DIRECTION-v2.md flagged as matching nothing
  // else. Not repeated here.
  const SERVICES = ['Web Design', 'SEO', 'Paid Advertising', 'AI Services'];

  function writeService(progress) {
    if (!serviceTickerWord) return;
    const index = Math.min(SERVICES.length - 1, Math.floor(progress * SERVICES.length));
    const word = SERVICES[index];
    if (serviceTickerWord.textContent !== word) {
      serviceTickerWord.textContent = word;
    }
  }

  // Mobile gets its own genuine 9:16 clip (raw-video/hero-ink-mobile.mp4,
  // landed 13 Sep 2026 — an interim 4:3 centre-crop of the desktop 16:9
  // source held this place before that), not a resized/cropped desktop
  // clip — same dataset-suffix convention the sprite version used, kept
  // for continuity. Whichever suffix isMobile resolves to, only that one
  // data-video-src* is ever read, so only one file is ever fetched below.
  const suffix = isMobile ? 'Mobile' : '';
  const src = video.dataset['videoSrc' + suffix];
  if (!src) return NOOP;

  function writeProgress(progress) {
    if (!telemetryProgress) return;
    const pct = String(Math.round(progress * 100)).padStart(2, '0');
    telemetryProgress.textContent = pct + '%';
  }

  if (reduced) {
    // Static final state: the poster already shows it. No pin, no fetch.
    writeProgress(1);
    writeService(1);
    return function cleanup() {
      if (telemetryProgress) telemetryProgress.textContent = '00%';
      if (serviceTickerWord) serviceTickerWord.textContent = SERVICES[0];
    };
  }

  let cancelled = false;
  let objectUrl = null;

  // The pin/scrub setup runs synchronously, in the same tick as every other
  // module in main.js's init loop — it does not wait on the video fetch. Its
  // geometry only depends on the stage element's own (CSS-fixed) height,
  // never on the video, and creating it late used to be a real bug for a
  // module initialised after this one (see main.js's own ordering comment):
  // measuring scroll position before this pin's spacer exists leaves that
  // module's trigger permanently short by the hero's pin distance.
  // Mobile scrub bounce (reported 13 Sep 2026), three suspected causes,
  // addressed in order:
  //
  // 1. Resize mid-scrub (the address bar hiding/showing changes
  //    window.innerHeight, and end's callback form re-evaluates it on
  //    ScrollTrigger.refresh(), which invalidateOnRefresh: true then
  //    applies). Fixed globally in main.js: ScrollTrigger.config({
  //    ignoreMobileResize: true }). Checked against the actual vendored
  //    build (gsap-ScrollTrigger.min.js, GSAP 3.13.0), not assumed: that
  //    flag only takes effect when ScrollTrigger.isTouch === 1 (its own
  //    "(hover: none), (pointer: coarse)" check) — which is already GSAP's
  //    own default for any such device, config call or not. So on a real
  //    phone (isTouch is 1 there) this was already the library's default
  //    behaviour before this file changed; the explicit config call is
  //    correct and now documents that intent rather than leaving it
  //    implicit, but it is not what would have changed the bounce on a
  //    real phone. Confirmed via a real-touch (CDP dispatchTouchEvent),
  //    real-fling reproduction plus a mid-gesture viewport resize: zero
  //    measurable bounce with or without the config call, in either
  //    direction — meaning this synthetic test cannot actually confirm
  //    which of the three causes (if any, beyond this one) matters on a
  //    real device, only that this one specific mechanism is not it here.
  //
  // 2. Momentum-scroll delivers scrollY in an uneven cadence that scrub:
  //    true maps directly, instantly, into a seek. Smoothing is scoped to
  //    isMobile only, per the brief — desktop scrub is untouched.
  //
  // 3. Every currentTime write costs a decode (a seek-to-keyframe-then-
  //    decode-forward, with -g 6 keeping that keyframe close but not free).
  //    A write is skipped if the new value is within one source frame
  //    (1/30s) of what's already showing. No separate rAF loop added to
  //    "coalesce to one write per frame" — onUpdate here already only
  //    fires once per GSAP tick (gsap.ticker), which is the project's one
  //    permitted RAF loop; the frame-duration gate below is the only
  //    addition needed on top of that.
  let lastWrittenTime = -1;
  const trigger = ScrollTrigger.create({
    trigger: stage,
    start: 'top top',
    end: () => '+=' + Math.round(window.innerHeight * 1.75),
    pin: true,
    pinSpacing: true,
    pinType: isMobile ? 'transform' : 'fixed',
    scrub: isMobile ? 0.5 : true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      writeProgress(self.progress);
      writeService(self.progress);
      // readyState 1 (HAVE_METADATA) is the earliest point video.duration
      // and seeking are both reliable. Before that, the scroll tick simply
      // has nothing to seek yet — the poster is still showing.
      if (video.readyState >= 1 && video.duration) {
        // duration itself is an invalid seek target in some browsers (holds
        // the prior frame instead of landing on the last one), so the top
        // end of the range is nudged in by one frame at 30fps.
        const clamped = Math.min(self.progress * video.duration, video.duration - FRAME_DURATION);
        const next = Math.max(0, clamped);
        if (Math.abs(next - lastWrittenTime) >= FRAME_DURATION) {
          video.currentTime = next;
          lastWrittenTime = next;
        }
      }
    },
  });

  fetch(src)
    .then((res) => (res.ok ? res.blob() : Promise.reject(new Error('hero-morph: fetch failed'))))
    .then((blob) => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      video.src = objectUrl;
      video.addEventListener(
        'loadedmetadata',
        () => {
          if (cancelled) return;
          if (fallback) fallback.style.display = 'none';
          video.style.opacity = '1';
          // Land on whatever frame matches the current scroll position
          // immediately, rather than waiting for the next scroll event —
          // covers a page load that starts mid-pin (refresh, restored scroll
          // position, or a same-page anchor jump).
          const clamped = Math.min(trigger.progress * video.duration, video.duration - FRAME_DURATION);
          lastWrittenTime = Math.max(0, clamped);
          video.currentTime = lastWrittenTime;
        },
        { once: true }
      );
    })
    .catch(NOOP); // Fetch failure: poster fallback stays, page still works.

  return function cleanup() {
    cancelled = true;
    trigger.kill();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    video.removeAttribute('src');
    video.load();
    if (fallback) fallback.style.display = '';
    video.style.opacity = '';
    if (telemetryProgress) telemetryProgress.textContent = '00%';
    if (serviceTickerWord) serviceTickerWord.textContent = SERVICES[0];
  };
}
