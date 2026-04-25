/**
 * landing.js — Landing Page Interactions
 *
 * Handles:
 *   1. Scroll-triggered reveal animations (IntersectionObserver)
 *   2. Sticky navigation background on scroll
 *   3. Smooth anchor scrolling for nav links
 *   4. Animated number counters for the stats bar
 *
 * @module landing
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initStickyNav();
  initSmoothScroll();
  initCounters();

  console.log('[Fikr Landing] ✨ Page initialised');
});

// ─── 1. Scroll Reveal ─────────────────────────────────────────────

/**
 * Observes all [data-reveal] elements and adds the `.revealed`
 * class when they scroll into view (15% visible threshold).
 * Unobserves after reveal so the animation only runs once.
 */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    observer.observe(el);
  });
}

// ─── 2. Sticky Nav ────────────────────────────────────────────────

/**
 * Toggles a `--scrolled` modifier on the nav bar once the user
 * scrolls past 50px, adding a blurred glass background.
 */
function initStickyNav() {
  const nav = document.getElementById('landing-nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('landing-nav--scrolled', window.scrollY > 50);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial check
}

// ─── 3. Smooth Anchor Scroll ──────────────────────────────────────

/**
 * Intercepts clicks on `a[href^="#"]` links and smooth-scrolls
 * to the target section with an offset for the fixed nav.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 80; // nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ─── 4. Animated Counters ─────────────────────────────────────────

/**
 * Observes elements with [data-count] and triggers a number
 * animation from 0 to the target value when they scroll into view.
 */
function initCounters() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-count]').forEach((el) => {
    observer.observe(el);
  });
}

/**
 * Smoothly counts a DOM element's textContent from 0 to a target
 * number using requestAnimationFrame with ease-out cubic easing.
 *
 * @param {HTMLElement} element  - The element whose text to animate
 * @param {number}      target  - The final number to count to
 * @param {number}      duration - Animation length in ms
 */
function animateCounter(element, target, duration = 2000) {
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic for a satisfying deceleration
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);

    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toLocaleString() + '+';
    }
  }

  requestAnimationFrame(update);
}
