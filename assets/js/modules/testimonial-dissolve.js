/**
 * testimonial-dissolve.js
 * Testimonial media: a portrait dissolves into a scatter of coarse dust cells
 * and reassembles as a different image (client reference: pixelate-fade,
 * not a crossfade, not a blur).
 *
 * Global motion rules (CLAUDE.md / spec 08 section 0), repeated per module:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js. Modules receive it as an argument.
 * 4. Lenis is created once elsewhere; this module never creates a Lenis instance.
 * 5. The only RAF loop in the project is gsap.ticker. Frames are driven by a
 *    GSAP tween's onUpdate, never a second requestAnimationFrame loop.
 * 6. Returns a cleanup function.
 * 9. Never animates width, height, top, or left. The canvas is drawn into with
 *    the 2D context; no layout property is tweened.
 * 10. There is no CSS transform/opacity tween here to carry will-change; the
 *     canvas pixel buffer is redrawn instead, so will-change is not applicable.
 * 11. Start state (which image is visible) is established before any tween
 *     runs; with JS disabled the two <img> elements are the content and stay
 *     visible with their alt text — this module only hides them once a
 *     decoded, cached, correctly-drawn canvas is ready to replace them.
 * 12. Queries elements with data-* attributes only, never a class selector.
 * 13. If [data-dissolve] is absent, returns a no-op cleanup immediately.
 * 14. Never logs to the console.
 *
 * NOTE ON [data-marquee]: the carousel element (`.carousel[data-carousel]`)
 * also carries `[data-marquee]`. That hook is deliberately left inert by this
 * module. See the task summary for the full reasoning — in short, a true
 * seamless-looping drift needs duplicated slide markup, and duplicating
 * [data-carousel-slide] nodes would corrupt peek-carousel.js's slide count/
 * index/aria logic (which this module may not edit), while duplicating
 * canvases specifically would clone empty bitmaps (cloneNode does not copy
 * canvas pixel content). Shipping that would be a visible defect, not a
 * clean effect, so the marquee was skipped rather than forced.
 */

const NOOP = () => {};

const CELL_CSS = 8; // coarse grid cell size in CSS px (spec: 6-10)
const MAX_DPR = 2;
const HOLD_S = 2.4;
const DISSOLVE_S = 1.1;
const SCATTER_WINDOW = 0.18; // half-width, in progress units, of each cell's transition

export function initTestimonialDissolve({ gsap, ScrollTrigger, lenis, reduced, isMobile }) {
  const figures = Array.from(document.querySelectorAll('[data-dissolve]'));
  if (!figures.length) return NOOP;

  const controllers = [];
  figures.forEach((figure) => {
    const controller = setupFigure(figure, { gsap, ScrollTrigger, reduced, isMobile });
    if (controller) controllers.push(controller);
  });

  if (!controllers.length) return NOOP;

  function onVisibilityChange() {
    if (document.hidden) {
      controllers.forEach((c) => c.pause());
    } else {
      controllers.forEach((c) => c.resumeIfInView());
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  return function cleanup() {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    controllers.forEach((c) => c.destroy());
    controllers.length = 0;
  };
}

function setupFigure(figure, { gsap, ScrollTrigger, reduced, isMobile }) {
  const frames = Array.from(figure.querySelectorAll('[data-dissolve-frame]'));
  if (frames.length !== 2) return null;
  const [imgA, imgB] = frames;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.pointerEvents = 'none';

  let restorePosition = false;
  if (getComputedStyle(figure).position === 'static') {
    figure.style.position = 'relative';
    restorePosition = true;
  }

  let destroyed = false;
  let st = null;
  let tl = null;
  let cache = null;
  let inView = false;
  let lastProgress = 0;
  let mode = null; // 'cycle' | 'static'
  let resizeTimer = null;

  function decodeImg(img) {
    if (img.complete && img.naturalWidth) {
      return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    }
    return new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }

  // Deterministic pseudo-random per cell index (mulberry32-style hash),
  // so the scatter pattern is stable across rebuilds/resizes.
  function seeded(seed) {
    let t = seed + 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function drawCover(img, w, h) {
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const ctx = off.getContext('2d');
    const nw = img.naturalWidth || w;
    const nh = img.naturalHeight || h;
    const scale = Math.max(w / nw, h / nh);
    const dw = nw * scale;
    const dh = nh * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    try {
      ctx.drawImage(img, dx, dy, dw, dh);
    } catch (err) {
      /* broken image source: leave the offscreen canvas blank rather than throw */
    }
    return ctx;
  }

  // Read pixel data once per build (on setup and on resize only, never
  // per animation frame), cache average colour per coarse cell, plus a
  // stable per-cell threshold and jitter vector.
  function buildCache() {
    const rect = figure.getBoundingClientRect();
    const cssW = Math.max(1, Math.round(rect.width));
    const cssH = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));

    canvas.width = w;
    canvas.height = h;

    const ctxA = drawCover(imgA, w, h);
    const ctxB = drawCover(imgB, w, h);
    const dataA = ctxA.getImageData(0, 0, w, h).data;
    const dataB = ctxB.getImageData(0, 0, w, h).data;

    const cell = Math.max(6, Math.round(CELL_CSS * dpr));
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const cellCount = cols * rows;

    const colorsA = new Uint8ClampedArray(cellCount * 4);
    const colorsB = new Uint8ClampedArray(cellCount * 4);
    const thresholds = new Float32Array(cellCount);
    const jitterX = new Float32Array(cellCount);
    const jitterY = new Float32Array(cellCount);

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const idx = j * cols + i;
        const px = Math.min(w - 1, i * cell + (cell >> 1));
        const py = Math.min(h - 1, j * cell + (cell >> 1));
        const pi = (py * w + px) * 4;

        colorsA[idx * 4] = dataA[pi];
        colorsA[idx * 4 + 1] = dataA[pi + 1];
        colorsA[idx * 4 + 2] = dataA[pi + 2];
        colorsA[idx * 4 + 3] = dataA[pi + 3];
        colorsB[idx * 4] = dataB[pi];
        colorsB[idx * 4 + 1] = dataB[pi + 1];
        colorsB[idx * 4 + 2] = dataB[pi + 2];
        colorsB[idx * 4 + 3] = dataB[pi + 3];

        thresholds[idx] = 0.12 + seeded(idx * 2 + 1) * 0.76; // keep clear of 0/1 edges
        jitterX[idx] = (seeded(idx * 2 + 2) - 0.5) * cell * 2.4;
        jitterY[idx] = (seeded(idx * 3 + 7) - 0.5) * cell * 2.4;
      }
    }

    return {
      ctx: canvas.getContext('2d'),
      w,
      h,
      cell,
      cols,
      rows,
      colorsA,
      colorsB,
      thresholds,
      jitterX,
      jitterY,
    };
  }

  function rgba(arr, idx) {
    return `rgba(${arr[idx * 4]},${arr[idx * 4 + 1]},${arr[idx * 4 + 2]},${(arr[idx * 4 + 3] / 255).toFixed(3)})`;
  }

  function drawStatic(which) {
    if (!cache) return;
    const { ctx, w, h, cell, cols, rows, colorsA, colorsB } = cache;
    const colors = which === 0 ? colorsA : colorsB;
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const idx = j * cols + i;
        ctx.fillStyle = rgba(colors, idx);
        ctx.fillRect(i * cell, j * cell, cell, cell);
      }
    }
  }

  function draw(progress) {
    if (!cache) return;
    lastProgress = progress;
    const { ctx, w, h, cell, cols, rows, colorsA, colorsB, thresholds, jitterX, jitterY } = cache;
    ctx.clearRect(0, 0, w, h);
    const win = SCATTER_WINDOW;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const idx = j * cols + i;
        const t = thresholds[idx];
        const local = (progress - (t - win)) / (win * 2);
        const x = i * cell;
        const y = j * cell;

        if (local <= 0) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = rgba(colorsA, idx);
          ctx.fillRect(x, y, cell, cell);
        } else if (local >= 1) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = rgba(colorsB, idx);
          ctx.fillRect(x, y, cell, cell);
        } else {
          // Scatter: bell-curve peak at the midpoint of the cell's transition
          // window — cell shrinks, jitters off its grid position, and fades
          // slightly, then reassembles into the destination image.
          const scatter = 1 - Math.abs(local - 0.5) * 2;
          const size = cell * (1 - scatter * 0.6);
          const ox = x + jitterX[idx] * scatter + (cell - size) / 2;
          const oy = y + jitterY[idx] * scatter + (cell - size) / 2;
          ctx.globalAlpha = 1 - scatter * 0.35;
          ctx.fillStyle = local < 0.5 ? rgba(colorsA, idx) : rgba(colorsB, idx);
          ctx.fillRect(ox, oy, size, size);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function attachCanvas() {
    figure.appendChild(canvas);
    frames.forEach((img) => {
      img.style.visibility = 'hidden';
    });
  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (destroyed || !cache) return;
      cache = buildCache();
      if (mode === 'static') {
        drawStatic(0);
      } else {
        draw(lastProgress);
      }
    }, 200);
  }

  const ready = Promise.all([decodeImg(imgA), decodeImg(imgB)]);

  ready.then(() => {
    if (destroyed) return;

    attachCanvas();
    cache = buildCache();

    if (reduced || isMobile) {
      // Static-only path: draw frame A once and stop. No cycling, no
      // ScrollTrigger, no marquee. Never leaves an empty canvas.
      mode = 'static';
      drawStatic(0);
      window.addEventListener('resize', onResize);
      return;
    }

    mode = 'cycle';
    drawStatic(0);

    const proxy = { p: 0 };
    tl = gsap.timeline({ repeat: -1, paused: true });
    tl.to(proxy, { p: 1, duration: DISSOLVE_S, ease: 'power1.inOut', onUpdate: () => draw(proxy.p) });
    tl.to(proxy, { p: 1, duration: HOLD_S });
    tl.to(proxy, { p: 0, duration: DISSOLVE_S, ease: 'power1.inOut', onUpdate: () => draw(proxy.p) });
    tl.to(proxy, { p: 0, duration: HOLD_S });

    st = ScrollTrigger.create({
      trigger: figure,
      start: 'top 95%',
      end: 'bottom 5%',
      onEnter: () => {
        inView = true;
        tl.play();
      },
      onEnterBack: () => {
        inView = true;
        tl.play();
      },
      onLeave: () => {
        inView = false;
        tl.pause();
      },
      onLeaveBack: () => {
        inView = false;
        tl.pause();
      },
    });

    window.addEventListener('resize', onResize);
  });

  return {
    pause() {
      if (tl) tl.pause();
    },
    resumeIfInView() {
      if (tl && inView && !document.hidden) tl.play();
    },
    destroy() {
      destroyed = true;
      if (st) st.kill();
      if (tl) tl.kill();
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      frames.forEach((img) => {
        img.style.visibility = '';
      });
      if (restorePosition) figure.style.position = '';
      cache = null;
    },
  };
}
