/**
 * hero-unfold.js
 * Inventory item 1 (headline media unfold): the small video sitting inline
 * in the hero headline (between "businesses" and "more") detaches on
 * scroll, curls in 3D as a WebGL mesh, and flattens into the full-width
 * video panel below the hero. The plane visually IS that chip, then
 * visually IS that panel — it must coincide with each box exactly at the
 * scrub's endpoints.
 *
 * Global motion rules (CLAUDE.md / spec 08 section 0), repeated per module:
 * 1. One effect per file. No module imports another module (vendor imports
 *    from assets/js/vendor/ are the documented exception for this module).
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js. Modules receive it as an argument.
 * 4. Lenis is created once elsewhere; this module never creates a Lenis instance.
 * 5. The only RAF loop in the project is gsap.ticker. Never call requestAnimationFrame here.
 * 6. This module returns a cleanup function.
 * 7. Bails out and returns a no-op cleanup when prefers-reduced-motion: reduce matches.
 * 8. Bails out and returns a no-op cleanup when matchMedia('(max-width: 768px)') matches.
 * 9. Never animate width, height, top, or left in CSS terms. The WebGL plane's
 *    position/scale live entirely inside the vertex shader / uniforms, not CSS.
 *    [data-hero-unfold-canvas]'s own fixed/full-viewport positioning is set by
 *    the stylesheet, not by this module — this file never touches canvas.style.
 * 10. Queries elements with data-* attributes only, never a class selector.
 * 11. If a hook element is absent, returns a no-op cleanup immediately. Does not throw.
 * 12. No console.* except a single guarded warning on WebGL failure.
 *
 * VENDOR LOADING OVERRIDE (project instruction, overrides spec 08 line 24 / section 0 item 15):
 * GSAP and ScrollTrigger are self-hosted UMD builds loaded as classic scripts in the
 * page, exposed as window.gsap / window.ScrollTrigger, and passed in as arguments here.
 * OGL is the one permitted ES module vendor import, vendored locally with no external
 * imports of its own.
 */

import { Renderer, Camera, Transform, Plane, Program, Mesh, Texture } from '../vendor/ogl.mjs';

const NOOP = () => {};

const VERTEX = `
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  uniform float uProgress;
  uniform vec2 uStartPos;
  uniform vec2 uEndPos;
  uniform vec2 uStartScale;
  uniform vec2 uEndScale;
  uniform float uCurl;

  varying vec2 vUv;

  void main() {
    vUv = uv;

    float e = uProgress;
    float ease = e * e * (3.0 - 2.0 * e);

    vec2 scale = mix(uStartScale, uEndScale, ease);
    vec2 pos = mix(uStartPos, uEndPos, ease);

    vec3 p = position;
    p.x *= scale.x;
    p.y *= scale.y;

    // Curl: bend the sheet around a vertical axis, strongest at progress 0,
    // gone by progress 1. A curl, not a skew: displacement is a function of
    // x position along the plane, driving z (and folding x back toward the
    // hinge), not a linear shear of x against y.
    float curl = uCurl * (1.0 - ease);
    float t = (p.x / max(scale.x, 0.0001));
    float angle = t * 3.14159265 * 0.9 * curl;
    float radius = 0.6 / max(curl, 0.0001);

    vec3 curled = p;
    if (curl > 0.001) {
      curled.x = sin(angle) * radius * curl;
      curled.z = (1.0 - cos(angle)) * radius * curl * -1.0;
    }

    vec3 finalPos = mix(curled, p, ease);
    finalPos.x += pos.x;
    finalPos.y += pos.y;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
  }
`;

const FRAGMENT = `
  precision highp float;

  uniform sampler2D tMap;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    // No manual y-flip here: the Texture is created with flipY: true, which
    // has OGL set UNPACK_FLIP_Y_WEBGL before every texImage2D/texSubImage2D
    // upload (video frames included). Flipping again in the shader on top
    // of that undid the correction and rendered the video upside down.
    vec3 color = texture2D(tMap, vUv).rgb;
    gl_FragColor = vec4(color, uOpacity);
  }
`;

// Crossfade window, keyed to the same ScrollTrigger progress that drives
// uProgress (see trigger setup below: hero top hitting viewport top, through
// to the stage's own top hitting viewport top — the full ~1300px+ chip-to-
// stage travel). The plane now spawns exactly on top of the inline chip, at
// the chip's own size and screen position (see the per-frame rect reads
// below), so there is no positional mismatch left to paper over: the two
// only need to swap which one is drawing the same footage in the same
// place. That handoff can therefore happen almost immediately once the
// user starts scrolling, rather than a third of the way through the whole
// chip-to-stage journey.
const FADE_START = 0.02;
const FADE_END = 0.06;

function crossfade(progress) {
  if (progress <= FADE_START) return { video: 1, plane: 0 };
  if (progress >= FADE_END) return { video: 0, plane: 1 };
  const t = (progress - FADE_START) / (FADE_END - FADE_START);
  return { video: 1 - t, plane: t };
}

export function initHeroUnfold({ gsap, ScrollTrigger, reduced, isMobile }) {
  // 1 + 2. Gate first, animate second. Fallback video stays visible, no autoplay.
  if (reduced) return NOOP;
  if (isMobile) return NOOP;

  const mediaSlot = document.querySelector('[data-hero-media]');
  const video = document.querySelector('[data-hero-video]');
  const stage = document.querySelector('[data-hero-unfold-stage]');
  const canvas = document.querySelector('[data-hero-unfold-canvas]');
  const fallback = document.querySelector('[data-hero-unfold-fallback]');

  // 3. Any required hook missing: return silently.
  if (!mediaSlot || !video || !stage || !canvas || !fallback) return NOOP;

  const heroSection = mediaSlot.closest('section') || document.getElementById('hero');

  let renderer;
  let gl;
  let scene;
  let camera;
  let mesh;
  let texture;
  let trigger;
  let tickerFn;
  let onWindowResize;

  try {
    renderer = new Renderer({
      canvas,
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    gl = renderer.gl;
    if (!gl) throw new Error('no gl context');
    gl.clearColor(0, 0, 0, 0);

    camera = new Camera(gl, { fov: 35, near: 0.1, far: 100 });
    camera.position.z = 5;

    scene = new Transform();

    texture = new Texture(gl, {
      generateMipmaps: false,
      // Explicit, not relying on the constructor default: video/image sources
      // are top-left origin, GL is bottom-left. OGL corrects this itself via
      // UNPACK_FLIP_Y_WEBGL at upload time, so the fragment shader samples
      // vUv straight with no manual flip.
      flipY: true,
    });

    const geometry = new Plane(gl, {
      width: 1,
      height: 1,
      widthSegments: 32,
      heightSegments: 32,
    });

    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      uniforms: {
        tMap: { value: texture },
        uProgress: { value: 0 },
        uOpacity: { value: 0 },
        uStartPos: { value: [0, 0] },
        uEndPos: { value: [0, 0] },
        uStartScale: { value: [1, 1] },
        uEndScale: { value: [1, 1] },
        uCurl: { value: 3.2 },
      },
      transparent: true,
      cullFace: null,
    });

    mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);
  } catch (err) {
    if (renderer && renderer.gl) {
      const lose = renderer.gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
    // eslint-disable-next-line no-console
    console.warn('[hero-unfold] WebGL init failed, showing fallback video', err);
    return NOOP;
  }

  // WebGL is up. The plain fallback video never participates in the scrub,
  // so it can be hidden outright once WebGL is confirmed working. The inline
  // chip video fades out almost immediately instead (see FADE_START/END
  // above) because the plane spawns exactly over it — see below.
  fallback.style.display = 'none';
  video.style.willChange = 'opacity';
  let planeOpacity = 0;

  // The canvas is a fixed, full-viewport layer (positioned by CSS, not by
  // this module — see rule 9 above). Because it is fixed, both hook
  // elements' getBoundingClientRect() rects are already viewport-relative:
  // no scroll-offset arithmetic is needed to place the plane over either
  // one. Rects are read fresh every rendered frame (in the ticker), never
  // cached, so the plane tracks precisely through scroll and resize.
  let pxToWorld = 1;

  function computePxToWorld() {
    const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z;
    pxToWorld = visibleHeight / window.innerHeight;
  }

  // Converts a viewport-relative DOMRect into the plane's world-space
  // position/scale, centred on the viewport's own centre (matching the
  // camera, which looks straight down -z at the viewport's centre).
  function rectToWorld(rect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = rect.left + rect.width / 2 - vw / 2;
    const cy = rect.top + rect.height / 2 - vh / 2;
    return {
      x: cx * pxToWorld,
      y: -cy * pxToWorld,
      w: Math.max(rect.width * pxToWorld, 0.0001),
      h: Math.max(rect.height * pxToWorld, 0.0001),
    };
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.perspective({ aspect: w / h });
    computePxToWorld();
  }

  resize();

  onWindowResize = () => resize();
  window.addEventListener('resize', onWindowResize);

  // Autoplay, guarded — refusal must not throw or block anything else.
  video.muted = true;
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {});
  }

  function updateTexture() {
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      texture.image = video;
      texture.needsUpdate = true;
    }
  }

  tickerFn = () => {
    // Plane is fully transparent below the crossfade window: skip the rect
    // reads, the texture upload and the draw call rather than doing that
    // work every tick for something invisible.
    if (planeOpacity <= 0) return;

    const chipRect = mediaSlot.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const start = rectToWorld(chipRect);
    const end = rectToWorld(stageRect);

    const u = mesh.program.uniforms;
    u.uStartPos.value = [start.x, start.y];
    u.uEndPos.value = [end.x, end.y];
    u.uStartScale.value = [start.w, start.h];
    u.uEndScale.value = [end.w, end.h];

    updateTexture();
    renderer.render({ scene, camera });
  };
  gsap.ticker.add(tickerFn);

  // Trigger spans the actual chip-to-stage travel: start when the hero
  // reaches the top of the viewport (the natural start of the scroll,
  // since the hero sits at the top of the page), end when the stage's own
  // top settles at the top of the viewport (its resting, full-bleed
  // position) — endTrigger lets the two live independently while still
  // producing one continuous progress value across the whole ~1300px+ gap
  // between the chip and the stage.
  trigger = ScrollTrigger.create({
    trigger: heroSection || stage,
    start: 'top top',
    endTrigger: stage,
    end: 'top top',
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      mesh.program.uniforms.uProgress.value = self.progress;

      const { video: videoOpacity, plane: planeOpacityValue } = crossfade(self.progress);
      planeOpacity = planeOpacityValue;
      mesh.program.uniforms.uOpacity.value = planeOpacity;
      video.style.opacity = String(videoOpacity);
    },
  });

  return function cleanup() {
    if (trigger) trigger.kill();
    if (tickerFn) gsap.ticker.remove(tickerFn);
    if (onWindowResize) window.removeEventListener('resize', onWindowResize);

    video.style.opacity = '';
    video.style.willChange = '';
    fallback.style.display = '';
    video.pause();
    fallback.pause();

    if (gl) {
      // Losing the context clears the drawing buffer, so a fixed,
      // full-viewport canvas cannot linger with a stale rendered frame
      // sitting over the page after cleanup.
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
  };
}
