/**
 * promo-hero.js — standalone entry for promo.html only. Not part of the
 * shared main.js pipeline (this page has no header/footer chrome to
 * coordinate with). Same GSAP vendor bundle, same reduced-motion/mobile
 * gating conventions as the rest of the site.
 */

document.documentElement.dataset.js = 'true';

const gsap = window.gsap;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Menu open/close --------------------------------------------------

const menu = document.querySelector('[data-promo-menu]');
const openBtn = document.querySelector('[data-promo-menu-open]');
const closeBtn = document.querySelector('[data-promo-menu-close]');

function openMenu() {
  menu.hidden = false;
  openBtn.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  menu.hidden = true;
  openBtn.setAttribute('aria-expanded', 'false');
}
openBtn.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);

// ---- Background video: load as blob so scrubbing/seeking works on
// hosts (Cloudflare Workers assets) that don't honour Range requests.
// Not scrubbed on this page, but the blob approach also sidesteps a
// flash-of-broken-video if the source 404s during review. -------------

const video = document.querySelector('[data-promo-video]');
const source = video ? video.querySelector('source') : null;

if (video && source && source.src) {
  fetch(source.src)
    .then((res) => (res.ok ? res.blob() : Promise.reject()))
    .then((blob) => {
      video.src = URL.createObjectURL(blob);
      video.play().catch(() => {});
    })
    .catch(() => {
      // Leaves the CSS gradient placeholder visible underneath.
    });
}

// ---- Reveal animations -------------------------------------------------

if (reduced) {
  gsap.set('[data-promo-fade], [data-promo-fade-up]', { opacity: 1, y: 0 });
  gsap.set('[data-promo-word]', { yPercent: 0 });
} else {
  const EASE = 'power3.out';

  gsap.timeline()
    .from('[data-promo-fade]', {
      opacity: 0,
      y: -20,
      duration: 0.5,
      ease: EASE,
      stagger: 0.1,
    })
    .from('[data-promo-fade-up]', {
      opacity: 0,
      y: 32,
      duration: 0.6,
      ease: EASE,
      stagger: 0.12,
    }, 0.15)
    .from('[data-promo-word]', {
      yPercent: 110,
      duration: 0.7,
      ease: EASE,
      stagger: 0.14,
    }, 0.4);
}
