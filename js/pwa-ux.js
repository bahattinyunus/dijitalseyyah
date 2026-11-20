/* ==========================================================================
   Dijital Seyyah — PWA & UX Accessibility Module (js/pwa-ux.js)
   Registers on: window.SEYYAH_MODULES.pwaUx = { init(ctx) }
   Features:
     1. Safe Service Worker registration (http/https only, never errors on file://)
     2. Top Reading / Scroll Progress Bar synced to .content-viewport
     3. Floating "↑ Yukarı Çık" Back-to-Top button (> 320px scroll)
     4. Keyboard Shortcuts Guide Modal (? key)
   ========================================================================== */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const SCROLL_THRESHOLD = 320;
  const STYLE_ID = 'seyyah-pwa-ux-styles';
  const PROGRESS_TRACK_ID = 'seyyah-scroll-progress-track';
  const PROGRESS_BAR_ID = 'seyyah-scroll-progress-bar';
  const BACK_TO_TOP_ID = 'seyyah-back-to-top';
  const SHORTCUTS_MODAL_ID = 'seyyah-shortcuts-modal';

  let initialized = false;
  let viewportEl = null;
  let progressTrackEl = null;
  let progressBarEl = null;
  let backToTopBtn = null;
  let shortcutsModalEl = null;
  let lastFocusedEl = null;
  let rafPending = false;

  const SHORTCUT_ITEMS = [
    {
      keys: ['Ctrl', 'K'],
      altKeys: ['⌘', 'K'],
      label: 'Komut Paleti',
      desc: 'Hızlı komutlar, şehir geçişi ve araçlara anında ulaş'
    },
    {
      keys: ['/'],
      label: 'Şehir Ara',
      desc: 'Sol kenar çubuğundaki arama kutusuna odaklan'
    },
    {
      keys: ['Esc'],
      label: 'Kapat',
      desc: 'Açık modal, lightbox, komut paleti veya menüyü kapat'
    },
    {
      keys: ['←', '→'],
      label: 'Galeri Lightbox',
      desc: 'Fotoğraf galerisinde önceki ve sonraki görsele geç'
    },
    {
      keys: ['?'],
      label: 'Kısayollar',
      desc: 'Bu klavye kısayolları rehberini aç veya kapat'
    }
  ];

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  /**
   * 1. Safe Service Worker Registration
   * Only runs on http: or https: protocols; never throws on file://.
   */
  function registerServiceWorkerSafely() {
    try {
      const protocol = window.location && window.location.protocol;
      if (protocol !== 'http:' && protocol !== 'https:') {
        return;
      }
      if (!('serviceWorker' in navigator)) {
        return;
      }

      const doRegister = () => {
        navigator.serviceWorker
          .register('./sw.js', { scope: './' })
          .catch(() => {
            // Silently ignore registration issues on unsupported hosts
          });
      };

      if (document.readyState === 'complete') {
        doRegister();
      } else {
        window.addEventListener('load', doRegister, { once: true });
      }
    } catch (_) {
      // Never block app execution
    }
  }

  /**
   * Inject self-contained styles matching the Cyber-Sufi glassmorphism theme.
   */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Top Reading / Scroll Progress Bar */
      .seyyah-scroll-progress-track {
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 3px;
        background: rgba(148, 163, 184, 0.14);
        z-index: 45;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .seyyah-scroll-progress-track.active {
        opacity: 1;
      }

      .seyyah-scroll-progress-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(
          90deg,
          var(--accent-cyan, #00f2fe) 0%,
          var(--accent-blue, #4facfe) 55%,
          var(--accent-emerald, #10b981) 100%
        );
        box-shadow: 0 0 10px rgba(0, 242, 254, 0.55);
        border-radius: 0 2px 2px 0;
        transition: width 0.08s linear;
        will-change: width;
      }

      /* Floating Back-to-Top Button */
      .seyyah-back-to-top {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 60;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-glass, rgba(15, 23, 42, 0.88));
        color: var(--text-primary, #f8fafc);
        border: 1px solid var(--border-glow, rgba(0, 242, 254, 0.35));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.5));
        font-family: var(--font-heading, sans-serif);
        font-size: 0.84rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        cursor: pointer;
        opacity: 0;
        transform: translateY(14px) scale(0.95);
        pointer-events: none;
        transition:
          opacity 0.22s ease,
          transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
          border-color 0.2s ease,
          box-shadow 0.2s ease;
      }

      .seyyah-back-to-top.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .seyyah-back-to-top:hover {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: var(--shadow-glow, 0 0 22px rgba(0, 242, 254, 0.3));
        transform: translateY(-2px) scale(1.02);
      }

      .seyyah-back-to-top:focus-visible {
        outline: 2px solid var(--accent-cyan, #00f2fe);
        outline-offset: 3px;
      }

      .seyyah-back-to-top-arrow {
        color: var(--accent-cyan, #00f2fe);
        font-size: 1rem;
        line-height: 1;
      }

      /* Keyboard Shortcuts Modal */
      .seyyah-shortcuts-overlay {
        position: fixed;
        inset: 0;
        z-index: 1200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(2, 6, 23, 0.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.2s ease, visibility 0.2s ease;
      }

      .seyyah-shortcuts-overlay.active {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }

      .seyyah-shortcuts-dialog {
        width: 100%;
        max-width: 520px;
        background: var(--bg-secondary, #0f172a);
        color: var(--text-primary, #f8fafc);
        border: 1px solid var(--border-glow, rgba(0, 242, 254, 0.35));
        border-radius: var(--radius-lg, 20px);
        box-shadow:
          0 24px 60px rgba(0, 0, 0, 0.55),
          0 0 30px rgba(0, 242, 254, 0.12);
        overflow: hidden;
        transform: translateY(10px) scale(0.97);
        transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .seyyah-shortcuts-overlay.active .seyyah-shortcuts-dialog {
        transform: translateY(0) scale(1);
      }

      .seyyah-shortcuts-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: var(--bg-glass, rgba(15, 23, 42, 0.85));
      }

      .seyyah-shortcuts-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: var(--font-heading, sans-serif);
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
        margin: 0;
      }

      .seyyah-shortcuts-close {
        width: 34px;
        height: 34px;
        border-radius: var(--radius-sm, 8px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: transparent;
        color: var(--text-secondary, #94a3b8);
        font-size: 1.35rem;
        line-height: 1;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease;
      }

      .seyyah-shortcuts-close:hover,
      .seyyah-shortcuts-close:focus-visible {
        color: var(--text-primary, #f8fafc);
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.1);
        outline: none;
      }

      .seyyah-shortcuts-body {
        padding: 16px 20px 18px;
      }

      .seyyah-shortcuts-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 0;
        padding: 0;
      }

      .seyyah-shortcut-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 10px 14px;
        border-radius: var(--radius-md, 12px);
        background: var(--bg-card, rgba(30, 41, 59, 0.65));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .seyyah-shortcut-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .seyyah-shortcut-name {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      .seyyah-shortcut-desc {
        font-size: 0.78rem;
        color: var(--text-secondary, #94a3b8);
      }

      .seyyah-shortcut-keys {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }

      .seyyah-kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 26px;
        padding: 0 8px;
        border-radius: 6px;
        background: var(--bg-primary, #0a0f1d);
        border: 1px solid var(--border-glow, rgba(0, 242, 254, 0.35));
        box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.35);
        color: var(--accent-cyan, #00f2fe);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.78rem;
        font-weight: 700;
        line-height: 1;
      }

      .seyyah-kbd-sep {
        font-size: 0.74rem;
        color: var(--text-muted, #64748b);
        margin: 0 1px;
      }

      .seyyah-shortcuts-footer {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      @media (max-width: 640px) {
        .seyyah-back-to-top {
          right: 16px;
          bottom: 16px;
          padding: 9px 13px;
          font-size: 0.8rem;
        }
        .seyyah-shortcut-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .seyyah-scroll-progress-bar,
        .seyyah-back-to-top,
        .seyyah-shortcuts-overlay,
        .seyyah-shortcuts-dialog {
          transition: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 2. Top Reading / Scroll Progress Bar synced to .content-viewport
   */
  function createProgressBar() {
    progressTrackEl = document.getElementById(PROGRESS_TRACK_ID);
    if (!progressTrackEl) {
      progressTrackEl = document.createElement('div');
      progressTrackEl.id = PROGRESS_TRACK_ID;
      progressTrackEl.className = 'seyyah-scroll-progress-track';
      progressTrackEl.setAttribute('role', 'progressbar');
      progressTrackEl.setAttribute('aria-label', 'Okuma ilerlemesi');
      progressTrackEl.setAttribute('aria-valuemin', '0');
      progressTrackEl.setAttribute('aria-valuemax', '100');
      progressTrackEl.setAttribute('aria-valuenow', '0');

      progressBarEl = document.createElement('div');
      progressBarEl.id = PROGRESS_BAR_ID;
      progressBarEl.className = 'seyyah-scroll-progress-bar';

      progressTrackEl.appendChild(progressBarEl);
      document.body.appendChild(progressTrackEl);
    } else {
      progressBarEl = document.getElementById(PROGRESS_BAR_ID);
    }
  }

  /**
   * 3. Floating "↑ Yukarı Çık" Back-to-Top Button
   */
  function createBackToTopButton() {
    backToTopBtn = document.getElementById(BACK_TO_TOP_ID);
    if (!backToTopBtn) {
      backToTopBtn = document.createElement('button');
      backToTopBtn.type = 'button';
      backToTopBtn.id = BACK_TO_TOP_ID;
      backToTopBtn.className = 'seyyah-back-to-top';
      backToTopBtn.setAttribute('aria-label', 'Yukarı çık');
      backToTopBtn.setAttribute('title', 'Yukarı Çık');
      backToTopBtn.innerHTML =
        '<span class="seyyah-back-to-top-arrow" aria-hidden="true">↑</span><span>Yukarı Çık</span>';

      backToTopBtn.addEventListener('click', () => {
        if (!viewportEl) return;
        viewportEl.scrollTo({
          top: 0,
          behavior: prefersReducedMotion() ? 'auto' : 'smooth'
        });
      });

      document.body.appendChild(backToTopBtn);
    }
  }

  /**
   * Align progress bar geometry to .content-viewport and update scroll progress + back-to-top visibility.
   */
  function updateScrollState() {
    rafPending = false;
    if (!viewportEl) return;

    const rect = viewportEl.getBoundingClientRect();
    const scrollTop = viewportEl.scrollTop;
    const maxScroll = Math.max(0, viewportEl.scrollHeight - viewportEl.clientHeight);
    const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0;

    if (progressTrackEl && progressBarEl) {
      progressTrackEl.style.top = `${Math.max(0, Math.round(rect.top))}px`;
      progressTrackEl.style.left = `${Math.max(0, Math.round(rect.left))}px`;
      progressTrackEl.style.width = `${Math.max(0, Math.round(rect.width))}px`;
      progressBarEl.style.width = `${pct.toFixed(2)}%`;
      progressTrackEl.setAttribute('aria-valuenow', String(Math.round(pct)));
      progressTrackEl.classList.toggle('active', maxScroll > 20 && scrollTop > 4);
    }

    if (backToTopBtn) {
      backToTopBtn.classList.toggle('visible', scrollTop > SCROLL_THRESHOLD);
    }
  }

  function scheduleScrollUpdate() {
    if (rafPending) return;
    rafPending = true;
    window.requestAnimationFrame(updateScrollState);
  }

  function bindViewportListeners() {
    viewportEl =
      document.querySelector('.content-viewport') ||
      document.getElementById('viewport-content');

    if (!viewportEl) return;

    viewportEl.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
    window.addEventListener('resize', scheduleScrollUpdate, { passive: true });

    if (typeof ResizeObserver === 'function') {
      const resizeObserver = new ResizeObserver(scheduleScrollUpdate);
      resizeObserver.observe(viewportEl);
    }

    if (typeof MutationObserver === 'function') {
      const mutationObserver = new MutationObserver(scheduleScrollUpdate);
      mutationObserver.observe(viewportEl, { childList: true });
    }

    scheduleScrollUpdate();
  }

  /**
   * 4. Keyboard Shortcuts Guide Modal (? key)
   */
  function renderKeyGroup(keys) {
    return keys
      .map((key, idx) => {
        const sep =
          idx > 0
            ? keys.includes('←')
              ? '<span class="seyyah-kbd-sep">/</span>'
              : '<span class="seyyah-kbd-sep">+</span>'
            : '';
        return `${sep}<kbd class="seyyah-kbd">${key}</kbd>`;
      })
      .join('');
  }

  function createShortcutsModal() {
    shortcutsModalEl = document.getElementById(SHORTCUTS_MODAL_ID);
    if (shortcutsModalEl) return;

    shortcutsModalEl = document.createElement('div');
    shortcutsModalEl.id = SHORTCUTS_MODAL_ID;
    shortcutsModalEl.className = 'seyyah-shortcuts-overlay';
    shortcutsModalEl.setAttribute('role', 'dialog');
    shortcutsModalEl.setAttribute('aria-modal', 'true');
    shortcutsModalEl.setAttribute('aria-labelledby', 'seyyah-shortcuts-title');
    shortcutsModalEl.setAttribute('aria-hidden', 'true');

    const rowsHtml = SHORTCUT_ITEMS.map((item) => {
      const altHtml = item.altKeys
        ? `<span class="seyyah-kbd-sep" style="margin: 0 4px;">veya</span>${renderKeyGroup(item.altKeys)}`
        : '';
      return `
        <li class="seyyah-shortcut-row">
          <div class="seyyah-shortcut-info">
            <span class="seyyah-shortcut-name">${item.label}</span>
            <span class="seyyah-shortcut-desc">${item.desc}</span>
          </div>
          <div class="seyyah-shortcut-keys" aria-label="${item.keys.join(' ')}">
            ${renderKeyGroup(item.keys)}${altHtml}
          </div>
        </li>
      `;
    }).join('');

    shortcutsModalEl.innerHTML = `
      <div class="seyyah-shortcuts-dialog">
        <div class="seyyah-shortcuts-header">
          <h2 class="seyyah-shortcuts-title" id="seyyah-shortcuts-title">
            <span aria-hidden="true">⌨️</span>
            <span>Klavye Kısayolları Rehberi</span>
          </h2>
          <button type="button" class="seyyah-shortcuts-close" id="seyyah-shortcuts-close" aria-label="Kısayollar penceresini kapat">&times;</button>
        </div>
        <div class="seyyah-shortcuts-body">
          <ul class="seyyah-shortcuts-list">
            ${rowsHtml}
          </ul>
          <div class="seyyah-shortcuts-footer">
            <span>İstediğiniz zaman <kbd class="seyyah-kbd">?</kbd> ile açıp kapatabilirsiniz.</span>
            <span><kbd class="seyyah-kbd">Esc</kbd> Kapat</span>
          </div>
        </div>
      </div>
    `;

    const closeBtn = shortcutsModalEl.querySelector('#seyyah-shortcuts-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeShortcutsModal);
    }

    shortcutsModalEl.addEventListener('click', (e) => {
      if (e.target === shortcutsModalEl) {
        closeShortcutsModal();
      }
    });

    document.body.appendChild(shortcutsModalEl);
  }

  function isShortcutsModalOpen() {
    return Boolean(shortcutsModalEl && shortcutsModalEl.classList.contains('active'));
  }

  function openShortcutsModal() {
    if (!shortcutsModalEl) {
      createShortcutsModal();
    }
    if (!shortcutsModalEl || isShortcutsModalOpen()) return;

    lastFocusedEl = document.activeElement;
    shortcutsModalEl.classList.add('active');
    shortcutsModalEl.setAttribute('aria-hidden', 'false');

    const closeBtn = shortcutsModalEl.querySelector('#seyyah-shortcuts-close');
    if (closeBtn && typeof closeBtn.focus === 'function') {
      closeBtn.focus();
    }
  }

  function closeShortcutsModal() {
    if (!shortcutsModalEl || !isShortcutsModalOpen()) return;

    shortcutsModalEl.classList.remove('active');
    shortcutsModalEl.setAttribute('aria-hidden', 'true');

    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      try {
        lastFocusedEl.focus();
      } catch (_) {
        // Ignore if element is no longer focusable
      }
    }
    lastFocusedEl = null;
  }

  function isTypingTarget(target) {
    if (!target || !(target instanceof Element)) return false;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      return true;
    }
    if (target.isContentEditable) {
      return true;
    }
    return Boolean(target.closest('[contenteditable="true"]'));
  }

  function bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isShortcutsModalOpen()) {
        e.preventDefault();
        closeShortcutsModal();
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      if (isTypingTarget(e.target)) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        if (isShortcutsModalOpen()) {
          closeShortcutsModal();
        } else {
          openShortcutsModal();
        }
      }
    });
  }

  /**
   * Module Entry Point
   */
  function init(_ctx) {
    if (initialized) {
      scheduleScrollUpdate();
      return;
    }
    initialized = true;

    registerServiceWorkerSafely();
    injectStyles();
    createProgressBar();
    createBackToTopButton();
    createShortcutsModal();
    bindViewportListeners();
    bindKeyboardShortcuts();
  }

  window.SEYYAH_MODULES.pwaUx = {
    init,
    openShortcutsModal,
    closeShortcutsModal,
    updateScrollProgress: scheduleScrollUpdate
  };
})();
