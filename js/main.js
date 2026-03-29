/**
 * main.js — Lacense
 *
 * Features:
 *  1. Footer year auto-update
 *  2. Sticky header shadow on scroll
 *  3. Mobile hamburger menu toggle
 *  4. Active nav link via IntersectionObserver
 *  5. Close mobile menu on anchor click / outside click
 */

'use strict';

/* ================================================================
   UTILITIES
================================================================ */

/**
 * Returns the first element matching the selector, or null.
 * @param {string} selector
 * @param {Element|Document} [root=document]
 * @returns {Element|null}
 */
const qs = (selector, root = document) => root.querySelector(selector);

/**
 * Returns all elements matching the selector as an Array.
 * @param {string} selector
 * @param {Element|Document} [root=document]
 * @returns {Element[]}
 */
const qsa = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));


/* ================================================================
   1. FOOTER YEAR
================================================================ */
const yearEl = qs('#footer-year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


/* ================================================================
   2. STICKY HEADER — add class when user scrolls down
================================================================ */
const header = qs('.site-header');

if (header) {
  const handleHeaderScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  // Run once on load in case the page is already scrolled (e.g. refresh)
  handleHeaderScroll();
}


/* ================================================================
   3. MOBILE HAMBURGER MENU TOGGLE
================================================================ */
const hamburger = qs('.nav__hamburger');
const navMenu   = qs('.nav__menu');

/**
 * Opens or closes the mobile nav menu.
 * @param {boolean} open
 */
const setMenuOpen = (open) => {
  if (!hamburger || !navMenu) return;

  navMenu.classList.toggle('is-open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute(
    'aria-label',
    open ? 'Chiudi menu di navigazione' : 'Apri menu di navigazione'
  );

  // Trap focus within nav when open — basic implementation
  if (open) {
    // Give the menu a moment to render before moving focus
    requestAnimationFrame(() => {
      const firstLink = qs('.nav__link', navMenu);
      firstLink?.focus();
    });
  }
};

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.contains('is-open');
    setMenuOpen(!isOpen);
  });

  // Close when pressing Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      setMenuOpen(false);
      hamburger.focus();
    }
  });

  // Close on click outside the nav
  document.addEventListener('click', (e) => {
    const nav = qs('.nav');
    if (
      nav &&
      !nav.contains(e.target) &&
      navMenu.classList.contains('is-open')
    ) {
      setMenuOpen(false);
    }
  });
}


/* ================================================================
   4. ACTIVE NAV LINK — IntersectionObserver
   Each section that is more than 40% visible becomes "active".
================================================================ */
const navLinks  = qsa('.nav__link');
const sections  = qsa('main section[id]');

/**
 * Updates the active state of nav links.
 * @param {string} activeId — the id of the currently visible section
 */
const setActiveLink = (activeId) => {
  navLinks.forEach((link) => {
    const href = link.getAttribute('href'); // e.g. "#services"
    const isActive = href === `#${activeId}`;
    link.classList.toggle('is-active', isActive);
    link.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
};

if ('IntersectionObserver' in window && sections.length > 0) {
  const observerOptions = {
    root: null,
    // Fire when 40% of the section is inside the viewport, offset by nav height
    rootMargin: `-${getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height')
      .trim() ?? '64px'} 0px -40% 0px`,
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
} else {
  // Fallback: mark first link active
  if (navLinks.length > 0) {
    navLinks[0].classList.add('is-active');
    navLinks[0].setAttribute('aria-current', 'true');
  }
}


/* ================================================================
   5. CLOSE MOBILE MENU ON NAV LINK CLICK
   (For anchor navigation within the same page)
================================================================ */
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (navMenu?.classList.contains('is-open')) {
      setMenuOpen(false);
    }
  });
});


/* ================================================================
   6. SMOOTH SCROLL POLYFILL
   CSS scroll-behavior handles modern browsers. This ensures
   older browsers (Safari < 15.4) still get smooth scrolling.
================================================================ */
const supportsNativeSmoothScroll =
  'scrollBehavior' in document.documentElement.style;

if (!supportsNativeSmoothScroll) {
  qsa('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href')?.slice(1);
      if (!id) return;

      const target = qs(`#${CSS.escape(id)}`);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height') ?? '64',
        10
      );
      const top =
        target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
