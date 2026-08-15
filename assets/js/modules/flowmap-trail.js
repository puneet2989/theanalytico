/**
 * flowmap-trail.js — Inventory item 6 (replaces cursor-blob.js): cursor as a
 * neutral grey smoke trail, elongated along the direction of travel, fading
 * out behind the pointer, desktop only.
 *
 * Deliberately a flat grey plume, not a coloured sheen: a WebGL canvas has
 * no access to the DOM behind it, so it cannot sample or distort an actual
 * backdrop. Additive colour blending was tried and rejected — against the
 * light pastel hero background it only ever reads as grey haze once
 * composited with normal source-over alpha, so the brief settled on owning
 * that as a deliberate smoke effect instead of fighting the compositing
 * model for an iridescent look it can't produce over a flat colour section.
 *
 * Global rules repeated here (spec 08 section 0 / CLAUDE.md):
 * 1. One effect per file. No module imports another module (vendor imports
 *    from assets/js/vendor/ are the documented exception, not a cross-module
 *    import).
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered exactly once, in main.js. Unused here.
 * 4. Lenis is created exactly once, in lenis-scroll.js. Unused here.
 * 5. There is exactly one RAF loop in the project: gsap.ticker. This module
 *    drives its render loop from gsap.ticker.add, never requestAnimationFrame.
 * 6. Returns a cleanup function.
 * 7. Bails out and returns a no-op cleanup when prefers-reduced-motion: reduce.
 * 8. Bails out and returns a no-op cleanup when isMobile, and additionally
 *    when matchMedia('(pointer: coarse)') matches (a desktop with a coarse
 *    pointer, e.g. a touch laptop, should not get this effect either).
 * 9. Never animates width, height, top, or left. Only the canvas element's
 *    intrinsic size (its drawing buffer + CSS box) is set to match its
 *    container on mount and on resize — that is WebGL surface sizing, not
 *    a GSAP/CSS animation of a layout property.
 * 10. No will-change usage — there is no CSS-animated element here, only a
 *     canvas whose pixels are repainted by WebGL every tick.
 * 11. Not applicable — purely decorative, no content to reveal.
 * 12. Queries the mount point via [data-flowmap] only, never a class.
 * 13. If [data-flowmap] is absent, returns a no-op cleanup. Does not throw.
 * 14. No console.* except one guarded console.warn if WebGL setup fails.
 * 15. GSAP/ScrollTrigger/Lenis are self-hosted UMD builds supplied as
 *     arguments — never imported here. OGL is the one permitted vendor
 *     import, per task instruction: it is vendored, dependency-free, and is
 *     the documented exception to "modules never import each other" (that
 *     rule concerns sibling effect modules, not the vendor directory).
 *
 * The page must be identical, and just as legible, with JS disabled: this
 * module only ever adds a decorative <canvas> inside an already-empty,
 * aria-hidden container. Nothing here is required content.
 */

import { Renderer, Program, Mesh, Triangle, Flowmap, Vec2 } from '../vendor/ogl.mjs';

const NOOP = () => {};

const VERTEX = `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT = `
  precision highp float;
  uniform sampler2D tMap;
  varying vec2 vUv;

  // Peak alpha over standard source-over compositing. Eased back down to
  // 0.55 now that the stamp itself (falloff, below) and its tail (REACH,
  // below) are both smaller — a thinner shape doesn't need as much alpha
  // per pixel to stay clearly visible, and 0.68 was reading as a thick,
  // heavy smudge on the smaller shape.
  // Checked against the hero background (--bg-blue #e8f2fa, luminance
  // ~0.86) and the darkest hero text (--ink-black #0a0a0a, luminance
  // ~0.02): blending 0.55 of a mid grey (~0.4 luminance) into the
  // background still leaves the result far lighter than the text, so
  // contrast against ink-black stays effectively unchanged.
  const float PEAK_ALPHA = 0.55;

  void main() {
    vec2 uv = vUv;

    // Direction measured at the pointer's current texel drives the shape
    // of the plume; magnitude alone (not direction) drives colour, since
    // this is neutral smoke, not an iridescent sheen.
    vec2 vel = texture2D(tMap, uv).xy;
    float mag = length(vel);
    vec2 dir = mag > 0.0001 ? normalize(vel) : vec2(1.0, 0.0);

    // Multi-tap directional blur behind the direction of travel: this is
    // what turns the flowmap's naturally circular stamp into a trailing
    // plume — dense near the pointer (t = 0, full weight), progressively
    // fainter and more spread out along the tail (t -> 1, weight -> 0).
    // REACH trimmed again (0.052 -> 0.038) so the plume's tail is shorter
    // and slimmer, reducing how far a lingering trail follows the pointer.
    const int TAPS = 10;
    const float REACH = 0.038;
    float accum = 0.0;
    float weightSum = 0.0;
    for (int i = 0; i < TAPS; i++) {
      float t = float(i) / float(TAPS - 1);
      float w = (1.0 - t) * (1.0 - t);
      vec2 sampleUv = uv - dir * REACH * t;
      accum += length(texture2D(tMap, sampleUv).xy) * w;
      weightSum += w;
    }
    float smoke = accum / weightSum;

    // Zero velocity, anywhere along the tap chain, collapses to zero alpha
    // here, so a still pointer leaves the hero exactly as it is today.
    float alpha = clamp(smoke * 2.4, 0.0, 1.0) * PEAK_ALPHA;
    vec3 color = vec3(0.42, 0.43, 0.45);

    gl_FragColor = vec4(color, alpha);
  }
`;

function supportsWebGL() {
  try {
    const test = document.createElement('canvas');
    return !!(test.getContext('webgl2') || test.getContext('webgl'));
  } catch (err) {
    return false;
  }
}

export function initFlowmapTrail({ gsap, ScrollTrigger, lenis, reduced, isMobile }) {
  // Gate first, animate second — in the exact required order.
  if (reduced) return NOOP;
  if (isMobile) return NOOP;
  if (window.matchMedia('(pointer: coarse)').matches) return NOOP;

  const container = document.querySelector('[data-flowmap]');
  if (!container) return NOOP;

  if (!supportsWebGL()) return NOOP;

  let renderer;
  let gl;
  let canvas;
  let program;
  let mesh;
  let flowmap;

  try {
    renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    gl = renderer.gl;
    if (!gl) throw new Error('no WebGL context');

    canvas = gl.canvas;
    canvas.setAttribute('data-flowmap-canvas', '');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.display = 'block';

    container.appendChild(canvas);

    // dissipation 0.92 (down from 0.95) and falloff 0.15 (down from 0.22):
    // a smaller stamp that fades faster per frame, so the trail clears
    // behind the pointer sooner instead of lingering.
    flowmap = new Flowmap(gl, { size: 128, falloff: 0.15, alpha: 1, dissipation: 0.92 });

    // Standard source-over alpha blending (Program's default for
    // transparent:true) is what produces the smoke look against the light
    // hero background — no custom blend func here.
    program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tMap: flowmap.uniform,
      },
    });

    mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[flowmap-trail] WebGL init failed, effect disabled:', err);
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    return NOOP;
  }

  let width = 0;
  let height = 0;
  let lastX = null;
  let lastY = null;
  let inside = false;

  function resize() {
    const rect = container.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height);
    flowmap.aspect = width / height;
  }

  function toLocalUv(clientX, clientY) {
    const rect = container.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = 1 - (clientY - rect.top) / rect.height;
    return [x, y, rect];
  }

  function onPointerMove(event) {
    const [x, y, rect] = toLocalUv(event.clientX, event.clientY);
    const within = event.clientX >= rect.left && event.clientX <= rect.right
      && event.clientY >= rect.top && event.clientY <= rect.bottom;

    if (!within) {
      inside = false;
      lastX = null;
      lastY = null;
      return;
    }

    inside = true;
    flowmap.mouse.set(x, y);

    if (lastX === null) {
      lastX = x;
      lastY = y;
      return;
    }

    const dx = x - lastX;
    const dy = y - lastY;
    flowmap.velocity.set(dx, dy).multiply(15);
    lastX = x;
    lastY = y;
  }

  function onPointerLeave() {
    inside = false;
    lastX = null;
    lastY = null;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });

  resize();
  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }

  // Decays the velocity vector every frame, regardless of pointer state.
  // A stationary-but-still-inside pointer stops firing pointermove events
  // entirely, so without an unconditional per-frame decay the last velocity
  // would keep re-stamping the flowmap at full strength forever — a
  // permanent smudge under a motionless cursor. Tightened to 0.78 (from
  // 0.9) so stamping drops off within a handful of frames of the pointer
  // stopping, cutting how far the trail follows the cursor around.
  const VELOCITY_DECAY = 0.78;

  function tick() {
    flowmap.velocity.multiply(VELOCITY_DECAY);
    flowmap.update();
    renderer.render({ scene: mesh });
  }

  gsap.ticker.add(tick);

  return function cleanup() {
    gsap.ticker.remove(tick);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerleave', onPointerLeave);
    if (resizeObserver) {
      resizeObserver.disconnect();
    } else {
      window.removeEventListener('resize', resize);
    }

    const loseContextExt = gl.getExtension && gl.getExtension('WEBGL_lose_context');
    if (loseContextExt) loseContextExt.loseContext();

    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
  };
}
