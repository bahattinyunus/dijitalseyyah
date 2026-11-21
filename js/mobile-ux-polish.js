/* ==========================================================================
   Dijital Seyyah — Mobile & Layout UX Polish Module (js/mobile-ux-polish.js)
   Registers on: window.SEYYAH_MODULES.mobileUx = { init(ctx) }
   Features:
     1. Scoped CSS (#seyyah-mobile-ux-styles) ensuring:
        - .content-viewport always has >= 96px bottom padding for Quick Dock & Copilot orb clearance
        - Any back-to-top button sits cleanly above .sc-orb-btn (bottom: 94px; right: 28px; z-index: 9400)
        - Zero horizontal overflow on body / .app-container
        - Smooth touch scrolling (-webkit-overflow-scrolling: touch) on .module-nav-strip & .cities-list
     2. Mobile (<= 960px) edge-swipe gesture:
        - Swipe right from left 32px edge opens #city-sidebar
        - Swipe left closes #city-sidebar cleanly
     3. Floating scroll-to-top button (↑) for #viewport-content (> 320px scroll)
   ========================================================================== */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-mobile-ux-styles';
  const SCROLL_TOP_BTN_ID = 'seyyah-mobile-scroll-top';
  const MOBILE_BREAKPOINT = 960;
  const EDGE_ZONE_PX = 32;
  const SWIPE_THRESHOLD_PX = 48;
  const SCROLL_THRESHOLD_PX = 320;

  let initialized = false;
  let scrollTopBtn = null;
  let rafPending = false;
  let swipeBound = false;
  let scrollBound = false;

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function getViewportEl() {
    return (
      document.getElementById('viewport-content') ||
      document.querySelector('.content-viewport')
    );
  }

  function getSidebarEls() {
    return {
      sidebar: document.getElementById('city-sidebar'),
      backdrop: document.getElementById('sidebar-backdrop')
    };
  }

  function openMobileSidebar() {
    const { sidebar, backdrop } = getSidebarEls();
    if (!sidebar) return;
    sidebar.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('active');
  }

  function closeMobileSidebar() {
    const { sidebar, backdrop } = getSidebarEls();
    if (!sidebar) return;
    sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  }

  /**
   * 1. Inject scoped CSS (#seyyah-mobile-ux-styles)
   */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Zero horizontal overflow */
      body,
      .app-container {
        overflow-x: hidden !important;
        max-width: 100%;
      }

      /* Smooth touch scrolling on horizontal nav strip & sidebar city list */
      .module-nav-strip,
      .cities-list {
        -webkit-overflow-scrolling: touch;
      }

      .module-nav-strip {
        overscroll-behavior-x: contain;
      }

      .cities-list {
        overscroll-behavior-y: contain;
      }

      /* Guarantee bottom clearance above #seyyah-quick-dock & .sc-orb-btn */
      .content-viewport,
      #viewport-content {
        padding-bottom: 96px !important;
        -webkit-overflow-scrolling: touch;
      }

      /* Position any back-to-top button cleanly above the AI Copilot orb */
      .seyyah-back-to-top,
      #seyyah-back-to-top,
      #${SCROLL_TOP_BTN_ID} {
        position: fixed;
        bottom: 94px !important;
        right: 28px !important;
        z-index: 9400 !important;
      }

      @media (max-width: 640px) {
        .seyyah-back-to-top,
        #seyyah-back-to-top,
        #${SCROLL_TOP_BTN_ID} {
          bottom: 94px !important;
          right: 28px !important;
          z-index: 9400 !important;
        }
      }

      /* Standalone floating scroll-to-top button (↑) */
      #${SCROLL_TOP_BTN_ID} {
        width: 44px;
        height: 44px;
        padding: 0;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-glass, rgba(15, 23, 42, 0.88));
        color: var(--accent-cyan, #00f2fe);
        border: 1px solid var(--border-glow, rgba(0, 242, 254, 0.38));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        box-shadow: 0 10px 26px rgba(0, 0, 0, 0.42), 0 0 18px rgba(0, 242, 254, 0.16);
        font-family: var(--font-heading, sans-serif);
        font-size: 1.15rem;
        font-weight: 800;
        line-height: 1;
        cursor: pointer;
        opacity: 0;
        transform: translateY(12px) scale(0.92);
        pointer-events: none;
        transition:
          opacity 0.22s ease,
          transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
          border-color 0.2s ease,
          box-shadow 0.2s ease;
      }

      #${SCROLL_TOP_BTN_ID}.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      #${SCROLL_TOP_BTN_ID}:hover {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5), 0 0 22px rgba(0, 242, 254, 0.32);
        transform: translateY(-2px) scale(1.04);
      }

      #${SCROLL_TOP_BTN_ID}:active {
        transform: scale(0.95);
      }

      #${SCROLL_TOP_BTN_ID}:focus-visible {
        outline: 2px solid var(--accent-cyan, #00f2fe);
        outline-offset: 3px;
      }

      body.light-theme #${SCROLL_TOP_BTN_ID} {
        background: rgba(255, 255, 255, 0.92);
        color: #0284c7;
        border-color: rgba(2, 132, 199, 0.32);
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
      }

      @media (prefers-reduced-motion: reduce) {
        #${SCROLL_TOP_BTN_ID} {
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 2. Mobile edge-swipe gesture (<= 960px)
   */
  function bindEdgeSwipeGesture() {
    if (swipeBound) return;
    swipeBound = true;

    let tracking = false;
    let mode = null; // 'open' | 'close'
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;

    function resetSwipe() {
      tracking = false;
      mode = null;
    }

    document.addEventListener(
      'touchstart',
      (e) => {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
          resetSwipe();
          return;
        }
        if (!e.touches || e.touches.length !== 1) {
          resetSwipe();
          return;
        }
        if (document.querySelector('.modal-overlay.active')) {
          resetSwipe();
          return;
        }

        const { sidebar } = getSidebarEls();
        if (!sidebar) {
          resetSwipe();
          return;
        }

        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        lastX = startX;
        lastY = startY;

        const isOpen = sidebar.classList.contains('mobile-open');
        if (!isOpen && startX <= EDGE_ZONE_PX) {
          tracking = true;
          mode = 'open';
        } else if (isOpen) {
          tracking = true;
          mode = 'close';
        } else {
          resetSwipe();
        }
      },
      { passive: true }
    );

    document.addEventListener(
      'touchmove',
      (e) => {
        if (!tracking || !e.touches || e.touches.length !== 1) return;
        const touch = e.touches[0];
        lastX = touch.clientX;
        lastY = touch.clientY;

        const dx = lastX - startX;
        const dy = lastY - startY;

        // Release gesture if user is scrolling vertically
        if (Math.abs(dy) > 18 && Math.abs(dy) > Math.abs(dx)) {
          resetSwipe();
        }
      },
      { passive: true }
    );

    document.addEventListener(
      'touchend',
      (e) => {
        if (!tracking) return;
        if (e.changedTouches && e.changedTouches.length > 0) {
          lastX = e.changedTouches[0].clientX;
          lastY = e.changedTouches[0].clientY;
        }

        const dx = lastX - startX;
        const dy = lastY - startY;
        const isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.2;

        if (isHorizontal) {
          if (mode === 'open' && dx >= SWIPE_THRESHOLD_PX) {
            openMobileSidebar();
          } else if (mode === 'close' && dx <= -SWIPE_THRESHOLD_PX) {
            closeMobileSidebar();
          }
        }
        resetSwipe();
      },
      { passive: true }
    );

    document.addEventListener('touchcancel', resetSwipe, { passive: true });
  }

  /**
   * 3. Floating Scroll-to-Top Button (↑) for #viewport-content
   */
  function updateScrollTopVisibility() {
    rafPending = false;
    const viewport = getViewportEl();
    if (!viewport) return;

    const existingPwaBtn = document.getElementById('seyyah-back-to-top');
    if (existingPwaBtn && scrollTopBtn && scrollTopBtn !== existingPwaBtn) {
      // Avoid stacking two back-to-top buttons if pwa-ux.js already mounted its own
      scrollTopBtn.classList.remove('visible');
      return;
    }

    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', viewport.scrollTop > SCROLL_THRESHOLD_PX);
    }
  }

  function scheduleScrollTopUpdate() {
    if (rafPending) return;
    rafPending = true;
    window.requestAnimationFrame(updateScrollTopVisibility);
  }

  function ensureScrollTopButton() {
    const existingPwaBtn = document.getElementById('seyyah-back-to-top');
    if (existingPwaBtn) {
      // Reuse existing button (positioned above .sc-orb-btn via injected CSS)
      return;
    }

    scrollTopBtn = document.getElementById(SCROLL_TOP_BTN_ID);
    if (!scrollTopBtn) {
      scrollTopBtn = document.createElement('button');
      scrollTopBtn.type = 'button';
      scrollTopBtn.id = SCROLL_TOP_BTN_ID;
      scrollTopBtn.className = 'seyyah-mobile-scroll-top';
      scrollTopBtn.setAttribute('aria-label', 'Yukarı çık');
      scrollTopBtn.setAttribute('title', 'Yukarı Çık');
      scrollTopBtn.textContent = '↑';

      scrollTopBtn.addEventListener('click', () => {
        const viewport = getViewportEl();
        if (!viewport) return;
        viewport.scrollTo({
          top: 0,
          behavior: prefersReducedMotion() ? 'auto' : 'smooth'
        });
      });

      document.body.appendChild(scrollTopBtn);
    }
  }

  function bindViewportScrollListener() {
    if (scrollBound) {
      scheduleScrollTopUpdate();
      return;
    }
    const viewport = getViewportEl();
    if (!viewport) return;

    scrollBound = true;
    viewport.addEventListener('scroll', scheduleScrollTopUpdate, { passive: true });
    window.addEventListener('resize', scheduleScrollTopUpdate, { passive: true });

    if (typeof MutationObserver === 'function') {
      const mo = new MutationObserver(scheduleScrollTopUpdate);
      mo.observe(viewport, { childList: true });
    }

    scheduleScrollTopUpdate();
  }

  /**
   * Module Entry Point
   */
  function init(_ctx) {
    injectStyles();

    if (initialized) {
      bindViewportScrollListener();
      return;
    }
    initialized = true;

    bindEdgeSwipeGesture();
    ensureScrollTopButton();
    bindViewportScrollListener();
  }

  window.SEYYAH_MODULES.mobileUx = {
    init
  };
})();
