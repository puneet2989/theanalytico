/**
 * hero-morph.js
 * Inventory item 1 (CLAUDE.md): the hero morph — a single liquid form
 * reshaping through states that represent each service — pinned and
 * scroll-scrubbed, holding its last frame once the scrub reaches the end
 * (narrative progression, no idle loop, per the motion rule in CLAUDE.md).
 *
 * Global motion rules (CLAUDE.md), repeated per module:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js. Modules receive it as an argument.
 * 4. Lenis is created once elsewhere; this module never creates a Lenis instance.
 * 5. The only RAF loop in the project is gsap.ticker; the desktop and
 *    mobile scrub callbacks are both driven by that, not a second loop.
 * 6. This module returns a cleanup function.
 * 7. Shows the final frame, static, no stage-change animation, when
 *    prefers-reduced-motion: reduce matches.
 * 8. Mobile: no pin (pinned scroll is jank-prone on mobile browsers — see
 *    showcase-hero.js for the same trade-off elsewhere in this project).
 *    Still scroll-linked, not autoplaying: a non-pinned, scrubbed
 *    ScrollTrigger ties the frame to how far the section has scrolled
 *    through the viewport, so it advances and reverses with scroll like
 *    the desktop version, it just never holds the section in place.
 * 9. Never animates width, height, top, or left. Canvas drawing and the
 *    stage-change pop (transform/opacity only) are not layout properties.
 * 10. Queries elements with data-* attributes only, never a class selector.
 * 11. If a hook element is absent, returns a no-op cleanup immediately.
 * 12. No console.* in shipped code.
 *
 * Rendering approach: a single sprite-sheet image (one network request,
 * decoded once) rather than a scrubbed <video>. An earlier version drove
 * this effect by writing to video.currentTime on every scroll tick; even
 * with a keyframe on every frame, browsers throttle/coalesce rapid
 * currentTime seeks, which reads as dropped frames during a fast scroll.
 * Drawing a pre-decoded canvas region has no per-seek decode cost, so it
 * tracks scroll position exactly on every tick. It also sidesteps
 * Cloudflare's lack of Range-request support entirely (see
 * websites/global-template/00-CLOUDFLARE-PLATFORM-LIMITS.md) — that
 * limitation only affects byte-range seeking within a resource, and a
 * sprite sheet is always loaded as one full image, never partially.
 *
 * The shape morph itself is driven continuously by scroll progress (every
 * tick, smooth) and stays full-bleed and static in position throughout.
 * The caption sits at one fixed anchor (bottom-left) for the whole
 * sequence — an earlier version slid the whole box between bottom-left
 * and bottom-right on every stage change, which read as restless rather
 * than narrative. Each stage change now just crossfades the outgoing
 * caption down and out while the incoming one rises up and in, matching
 * the resolve-in-place feel of hero-headline.js's own word reveal.
 */

const NOOP = () => {};

export function initHeroMorph({ gsap, ScrollTrigger, reduced, isMobile }) {
  const stage = document.querySelector('[data-hero-morph-stage]');
  const visual = document.querySelector('[data-hero-morph-visual]');
  const canvas = document.querySelector('[data-hero-morph-canvas]');
  const fallback = document.querySelector('[data-hero-morph-fallback]');
  const captions = Array.from(document.querySelectorAll('[data-hero-morph-caption]'));
  if (!stage || !visual || !canvas) return NOOP;

  const ctx = canvas.getContext('2d');
  if (!ctx) return NOOP;

  // Mobile gets a separate, smaller sprite (fewer frames, lower per-frame
  // resolution) — a 40-frame sheet at native 1284x716 is fine for desktop
  // memory/bandwidth, but decoding a ~37-megapixel image on a phone is not.
  const suffix = isMobile ? 'Mobile' : '';
  const src = canvas.dataset['spriteSrc' + suffix];
  const cols = parseInt(canvas.dataset['spriteCols' + suffix], 10);
  const rows = parseInt(canvas.dataset['spriteRows' + suffix], 10);
  const frameW = parseInt(canvas.dataset['spriteFrameW' + suffix], 10);
  const frameH = parseInt(canvas.dataset['spriteFrameH' + suffix], 10);
  const frameCount = parseInt(canvas.dataset['spriteFrames' + suffix], 10);
  if (!src || !cols || !rows || !frameW || !frameH || !frameCount) return NOOP;

  let cancelled = false;
  let trigger = null;
  let stageTween = null;
  let onResize = null;
  let dpr = 1;
  let currentIndex = 0;
  let activeStage = 0;
  let spriteReady = false;

  function sizeCanvas() {
    const rect = visual.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // currentIndex always tracks the latest requested frame, even before the
  // sprite has loaded (sizeCanvas/onload replays it once the image is
  // ready) — only the actual canvas draw below waits on spriteReady.
  function drawFrame(index) {
    currentIndex = index;
    if (!spriteReady) return;
    const col = index % cols;
    const row = Math.floor(index / cols);
    const dw = canvas.width / dpr;
    const dh = canvas.height / dpr;
    // object-fit: cover, computed by hand — canvas has no equivalent CSS.
    const scale = Math.max(dw / frameW, dh / frameH);
    const drawW = frameW * scale;
    const drawH = frameH * scale;
    ctx.clearRect(0, 0, dw, dh);
    ctx.drawImage(
      sprite,
      col * frameW, row * frameH, frameW, frameH,
      (dw - drawW) / 2, (dh - drawH) / 2, drawW, drawH
    );
  }

  // One stage per quarter of the sequence, matching the shape on screen at
  // that point (web design -> paid advertising -> SEO -> AI services).
  // The caption box stays put; only the individual caption swaps, via a
  // small y-move crossfade rather than a position change.
  function goToStage(next) {
    if (next === activeStage) return;
    const prevEl = captions[activeStage];
    const nextEl = captions[next];
    activeStage = next;

    if (stageTween) stageTween.kill();
    stageTween = gsap.timeline();

    if (prevEl) stageTween.to(prevEl, { opacity: 0, y: -14, duration: 0.35, ease: 'power1.in' }, 0);
    if (nextEl) stageTween.fromTo(nextEl, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.2);
  }

  function updateStage(progress) {
    if (!captions.length) return;
    const next = Math.min(captions.length - 1, Math.floor(progress * captions.length));
    goToStage(next);
  }

  sizeCanvas();

  // The pin/scrub setup below runs synchronously, in the same tick as
  // every other module in main.js's init loop — it does not wait on the
  // sprite image. Its geometry only depends on the stage element's own
  // (CSS-fixed) height, never on the image, and creating it late, inside
  // sprite.onload, used to be a real bug: modules initialised after this
  // one (process-dial among them) would measure their own scroll
  // positions before the hero's pin-spacer existed, then never
  // re-measure, leaving their trigger's start/end permanently short by
  // the hero's pin distance — the dial would finish rotating before its
  // section ever reached the viewport. Only the actual pixel drawing
  // (drawFrame, guarded by spriteReady) waits on the image.
  if (reduced) {
    // Static final state, no pop: jump straight there, no animation.
    activeStage = captions.length - 1;
    captions.forEach((el, i) => {
      el.style.opacity = i === activeStage ? '1' : '0';
    });
  } else if (isMobile) {
    trigger = ScrollTrigger.create({
      trigger: stage,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        drawFrame(Math.round(self.progress * (frameCount - 1)));
        updateStage(self.progress);
      },
    });
  } else {
    trigger = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: () => '+=' + Math.round(window.innerHeight * 1.75),
      pin: true,
      pinSpacing: true,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        drawFrame(Math.round(self.progress * (frameCount - 1)));
        updateStage(self.progress);
      },
    });
  }

  onResize = () => {
    sizeCanvas();
    drawFrame(currentIndex);
  };
  window.addEventListener('resize', onResize);

  const sprite = new Image();
  sprite.decoding = 'async';
  sprite.onload = () => {
    if (cancelled) return;
    spriteReady = true;
    sizeCanvas();
    drawFrame(reduced ? frameCount - 1 : currentIndex);
    if (fallback) fallback.style.display = 'none';
    canvas.style.opacity = '1';
  };
  sprite.onerror = NOOP; // Load failure: poster fallback stays, page still works.
  sprite.src = src;

  return function cleanup() {
    cancelled = true;
    if (trigger) trigger.kill();
    if (stageTween) stageTween.kill();
    if (onResize) window.removeEventListener('resize', onResize);
    if (fallback) fallback.style.display = '';
    canvas.style.opacity = '';
    captions.forEach((el) => {
      gsap.set(el, { clearProps: 'all' });
    });
  };
}
