/* ==========================================================================
   Dijital Seyyah — 60fps 3D Perspective Tilt & Cursor Spotlight Glare Engine
   File: js/interactive-3d-cards.js
   Registers on: window.SEYYAH_MODULES.interactive3d = { init(ctx) }
   Features:
     1. Respects prefers-reduced-motion: reduce & touch-only (pointer: coarse)
     2. Passive, rAF-coalesced event delegation on document (mousemove / mouseleave)
        targeting .glass-card, .bento-card, .studio-hub-card, .city-card, .adm-kpi-card
     3. Smart exclusions for large forms, modals, maps, and active text inputs
        so editing and map interactions never jitter
     4. Subtle GPU-accelerated 3D tilt (max ±3.5deg) + --mx / --my radial cyan glare
     5. Smooth spring-out reset on mouseleave with WeakMap timer tracking (zero leaks)
   ========================================================================== */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-interactive-3d-styles';
  const MAX_TILT_DEG = 3.5;
  const PERSPECTIVE_PX = 950;
  const RESET_DURATION_MS = 420;

  const CARD_SELECTOR = [
    '.glass-card',
    '.bento-card',
    '.studio-hub-card',
    '.city-card',
    '.adm-kpi-card'
  ].join(', ');

  const MODAL_OR_MAP_ANCESTOR_SELECTOR = [
    '.modal-overlay',
    '.modal-content',
    '[role="dialog"]',
    '[aria-modal="true"]',
    '.lightbox-modal',
    '.quote-modal-content',
    '.cmd-modal',
    '.cp-overlay',
    '.leaflet-container',
    '.atlas-stage',
    '.dv3-marquee-track'
  ].join(', ');

  const EXCLUDED_CARD_SELECTOR = [
    'form',
    '[data-no-tilt]',
    '.no-tilt',
    '.no-3d-tilt',
    '.modal-content',
    '[role="dialog"]',
    '[aria-modal="true"]',
    '.atlas-stage',
    '.route-svg-card',
    '.mega-gallery-card',
    '.adm-panel-card',
    '#journal-editor-card'
  ].join(', ');

  const EDITABLE_SELECTOR = 'input, textarea, select, option, [contenteditable="true"], [contenteditable=""]';

  let initialized = false;
  let motionDisabled = false;
  let reducedMotionQuery = null;
  let coarsePointerQuery = null;

  let activeCard = null;
  let rafId = null;
  let pendingPointer = null;
  const resetTimers = new WeakMap();

  /**
   * Returns true if reduced motion or a touch-only primary pointer is active.
   */
  function shouldSkipMotion() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return true;
    }
    if (!reducedMotionQuery) {
      reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    }
    if (!coarsePointerQuery) {
      coarsePointerQuery = window.matchMedia('(pointer: coarse)');
    }
    return Boolean(reducedMotionQuery.matches || coarsePointerQuery.matches);
  }

  /**
   * Inject scoped CSS once for 3D transitions and --mx/--my cyan spotlight glare.
   */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      :where(.bento-card, .studio-hub-card, .city-card, .adm-kpi-card) {
        position: relative;
        overflow: hidden;
      }

      .seyyah-3d-tilting {
        will-change: transform;
        transition:
          border-color 0.28s ease,
          box-shadow 0.28s ease,
          background-color 0.28s ease,
          transform 0.08s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
      }

      .seyyah-3d-reset {
        will-change: transform;
        transition:
          border-color 0.28s ease,
          box-shadow 0.28s ease,
          background-color 0.28s ease,
          transform 0.42s cubic-bezier(0.22, 1, 0.36, 1) !important;
      }

      :where(.bento-card, .studio-hub-card, .city-card, .adm-kpi-card)::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        z-index: 2;
        opacity: 0;
        background: radial-gradient(
          320px circle at var(--mx, 50%) var(--my, 50%),
          rgba(0, 242, 254, 0.15),
          rgba(56, 189, 248, 0.06) 40%,
          transparent 72%
        );
        transition: opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      }

      :is(.glass-card, .bento-card, .studio-hub-card, .city-card, .adm-kpi-card)[data-tilt-active="true"]::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        z-index: 2;
        opacity: 1;
        background: radial-gradient(
          320px circle at var(--mx, 50%) var(--my, 50%),
          rgba(0, 242, 254, 0.15),
          rgba(56, 189, 248, 0.06) 40%,
          transparent 72%
        );
        transition: opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      }

      body.light-theme :where(.bento-card, .studio-hub-card, .city-card, .adm-kpi-card)::before,
      [data-theme="light"] :where(.bento-card, .studio-hub-card, .city-card, .adm-kpi-card)::before,
      body.light-theme :is(.glass-card, .bento-card, .studio-hub-card, .city-card, .adm-kpi-card)[data-tilt-active="true"]::before,
      [data-theme="light"] :is(.glass-card, .bento-card, .studio-hub-card, .city-card, .adm-kpi-card)[data-tilt-active="true"]::before {
        background: radial-gradient(
          320px circle at var(--mx, 50%) var(--my, 50%),
          rgba(2, 132, 199, 0.12),
          rgba(14, 165, 233, 0.05) 40%,
          transparent 72%
        );
      }

      @media (prefers-reduced-motion: reduce), (pointer: coarse) {
        .seyyah-3d-tilting,
        .seyyah-3d-reset {
          will-change: auto !important;
          transform: none !important;
        }
        :is(.glass-card, .bento-card, .studio-hub-card, .city-card, .adm-kpi-card)[data-tilt-active="true"]::before {
          opacity: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function clearResetTimer(card) {
    const timerId = resetTimers.get(card);
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      resetTimers.delete(card);
    }
  }

  /**
   * Smoothly reset card transform and clear inline properties after settling.
   */
  function resetCard(card) {
    if (!card || !card.isConnected) {
      return;
    }

    clearResetTimer(card);
    card.removeAttribute('data-tilt-active');
    card.classList.remove('seyyah-3d-tilting');
    card.classList.add('seyyah-3d-reset');
    card.style.transform = `perspective(${PERSPECTIVE_PX}px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)`;

    const timerId = window.setTimeout(() => {
      resetTimers.delete(card);
      if (!card.isConnected) return;
      card.classList.remove('seyyah-3d-reset');
      card.style.removeProperty('transform');
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    }, RESET_DURATION_MS);

    resetTimers.set(card, timerId);
  }

  /**
   * Exclude modals, maps, large reading panels, and forms/editors so typing never jitters.
   */
  function isExcludedCard(card, evtTarget, rect) {
    if (card.matches(EXCLUDED_CARD_SELECTOR)) {
      return true;
    }
    if (card.closest(MODAL_OR_MAP_ANCESTOR_SELECTOR)) {
      return true;
    }
    if (evtTarget && typeof evtTarget.closest === 'function' && evtTarget.closest(EDITABLE_SELECTOR)) {
      return true;
    }
    const activeEl = document.activeElement;
    if (activeEl && card.contains(activeEl) && typeof activeEl.matches === 'function' && activeEl.matches(EDITABLE_SELECTOR)) {
      return true;
    }
    if (card.querySelector('form, textarea, [contenteditable="true"], [contenteditable=""], .leaflet-container, .atlas-svg, [data-map]')) {
      return true;
    }
    if (card.querySelectorAll('input, select').length >= 2) {
      return true;
    }
    if (!rect || rect.width < 40 || rect.height < 40) {
      return true;
    }
    if (rect.height > 540 || (rect.width > 780 && rect.height > 380)) {
      return true;
    }
    return false;
  }

  function findCandidateCard(target) {
    if (!target || typeof target.closest !== 'function') {
      return null;
    }
    return target.closest(CARD_SELECTOR);
  }

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  function flushTiltFrame() {
    rafId = null;

    if (motionDisabled || !pendingPointer) {
      pendingPointer = null;
      return;
    }

    const { target, clientX, clientY } = pendingPointer;
    pendingPointer = null;

    const candidate = findCandidateCard(target);
    if (!candidate || !candidate.isConnected) {
      if (activeCard) {
        resetCard(activeCard);
        activeCard = null;
      }
      return;
    }

    const rect = candidate.getBoundingClientRect();
    if (isExcludedCard(candidate, target, rect)) {
      if (activeCard) {
        resetCard(activeCard);
        activeCard = null;
      }
      return;
    }

    if (activeCard && activeCard !== candidate) {
      resetCard(activeCard);
    }

    activeCard = candidate;
    clearResetTimer(candidate);

    const localX = clamp(clientX - rect.left, 0, rect.width);
    const localY = clamp(clientY - rect.top, 0, rect.height);
    const normX = (localX / rect.width - 0.5) * 2;
    const normY = (localY / rect.height - 0.5) * 2;

    const rotateX = clamp(-normY * MAX_TILT_DEG, -MAX_TILT_DEG, MAX_TILT_DEG);
    const rotateY = clamp(normX * MAX_TILT_DEG, -MAX_TILT_DEG, MAX_TILT_DEG);
    const liftY = candidate.classList.contains('glass-card') ? -2 : 0;

    candidate.classList.remove('seyyah-3d-reset');
    candidate.classList.add('seyyah-3d-tilting');
    candidate.setAttribute('data-tilt-active', 'true');
    candidate.style.setProperty('--mx', `${localX.toFixed(1)}px`);
    candidate.style.setProperty('--my', `${localY.toFixed(1)}px`);
    candidate.style.transform =
      `perspective(${PERSPECTIVE_PX}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(0, ${liftY}px, 0)`;
  }

  function onMouseMove(evt) {
    if (motionDisabled) return;
    if (evt.sourceCapabilities && evt.sourceCapabilities.firesTouchEvents) return;

    pendingPointer = {
      target: evt.target,
      clientX: evt.clientX,
      clientY: evt.clientY
    };

    if (rafId === null) {
      rafId = window.requestAnimationFrame(flushTiltFrame);
    }
  }

  function onMouseLeave(evt) {
    if (!activeCard) return;

    const target = evt.target;
    const leftDocument = target === document || target === document.documentElement || target === document.body;
    const leftActiveCard = target === activeCard;

    if (leftDocument || leftActiveCard || !activeCard.isConnected) {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      pendingPointer = null;
      const cardToReset = activeCard;
      activeCard = null;
      resetCard(cardToReset);
    }
  }

  function handleMediaChange() {
    motionDisabled = shouldSkipMotion();
    if (motionDisabled) {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      pendingPointer = null;
      if (activeCard) {
        resetCard(activeCard);
        activeCard = null;
      }
    }
  }

  function bindMediaListeners() {
    const queries = [reducedMotionQuery, coarsePointerQuery];
    for (const mq of queries) {
      if (!mq) continue;
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', handleMediaChange);
      } else if (typeof mq.addListener === 'function') {
        mq.addListener(handleMediaChange);
      }
    }
  }

  function init(/* ctx */) {
    if (initialized) {
      return;
    }

    motionDisabled = shouldSkipMotion();
    if (motionDisabled) {
      initialized = true;
      return;
    }

    initialized = true;
    injectStyles();
    bindMediaListeners();

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { capture: true, passive: true });
  }

  window.SEYYAH_MODULES.interactive3d = {
    init: init
  };
})();
