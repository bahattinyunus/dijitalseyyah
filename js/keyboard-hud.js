/**
 * Dijital Seyyah — macOS-Style Floating Quick Navigation Dock
 * Registers on: window.SEYYAH_MODULES.quickDock = { init(ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-quick-dock-styles';
  const DOCK_ID = 'seyyah-quick-dock';
  const STORAGE_KEY = 'seyyah_quick_dock_collapsed';

  const DOCK_ITEMS = [
    { id: 'dashboard', view: 'dashboard', icon: '🏠', label: 'Genel Bakış' },
    { id: 'atlas', view: 'atlas', icon: '🗺️', label: 'Atlas' },
    { id: 'route', view: 'route', icon: '🧭', label: 'Rota' },
    { id: 'aiPlanner', view: 'aiPlanner', icon: '🧠', label: 'AI Plan' },
    { id: 'gallery', view: 'gallery', icon: '📸', label: 'Galeri' },
    { id: 'search', action: 'search', icon: '🔍', label: 'Ara' }
  ];

  let _ctx = null;
  let _dockEl = null;
  let _itemsWrapEl = null;
  let _dividerEl = null;
  let _toggleBtnEl = null;
  let _buttonsByView = new Map();
  let _activeView = 'dashboard';
  let _isCollapsed = false;
  let _listenersBound = false;
  let _viewportObserver = null;

  function readCollapsedPref() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (_) {
      return false;
    }
  }

  function writeCollapsedPref(collapsed) {
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? 'true' : 'false');
    } catch (_) {
      // Ignore storage errors in restricted environments
    }
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${DOCK_ID} {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9500;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 9999px;
        max-width: calc(100vw - 184px);
        background: rgba(15, 23, 42, 0.78);
        backdrop-filter: blur(20px) saturate(160%);
        -webkit-backdrop-filter: blur(20px) saturate(160%);
        border: 1px solid rgba(255, 255, 255, 0.14);
        box-shadow:
          0 14px 36px rgba(0, 0, 0, 0.45),
          0 0 24px rgba(0, 242, 254, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);
        font-family: var(--font-body, 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif);
        transition:
          padding 0.24s cubic-bezier(0.22, 1, 0.36, 1),
          background 0.25s ease,
          border-color 0.25s ease,
          box-shadow 0.25s ease;
        user-select: none;
      }

      #${DOCK_ID}.is-collapsed {
        padding: 4px 8px;
        gap: 0;
      }

      #${DOCK_ID} .seyyah-dock-items {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      #${DOCK_ID}.is-collapsed .seyyah-dock-items,
      #${DOCK_ID}.is-collapsed .seyyah-dock-divider {
        display: none;
      }

      #${DOCK_ID} .seyyah-dock-divider {
        width: 1px;
        height: 22px;
        margin: 0 2px;
        background: rgba(255, 255, 255, 0.14);
        flex-shrink: 0;
      }

      #${DOCK_ID} .seyyah-dock-btn,
      #${DOCK_ID} .seyyah-dock-toggle {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid transparent;
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary, #f8fafc);
        border-radius: 9999px;
        cursor: pointer;
        padding: 0;
        flex-shrink: 0;
        transition:
          transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
          background 0.2s ease,
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          color 0.2s ease;
      }

      #${DOCK_ID} .seyyah-dock-btn {
        width: 40px;
        height: 40px;
        font-size: 1.15rem;
        line-height: 1;
      }

      #${DOCK_ID} .seyyah-dock-toggle {
        width: 28px;
        height: 32px;
        font-size: 0.88rem;
        color: var(--text-secondary, #94a3b8);
        background: transparent;
      }

      #${DOCK_ID}.is-collapsed .seyyah-dock-toggle {
        width: 34px;
        height: 28px;
      }

      #${DOCK_ID} .seyyah-dock-btn:hover,
      #${DOCK_ID} .seyyah-dock-btn:focus-visible {
        transform: translateY(-4px) scale(1.12);
        background: rgba(0, 242, 254, 0.14);
        border-color: rgba(0, 242, 254, 0.4);
        box-shadow: 0 8px 18px rgba(0, 242, 254, 0.22);
        outline: none;
      }

      #${DOCK_ID} .seyyah-dock-toggle:hover,
      #${DOCK_ID} .seyyah-dock-toggle:focus-visible {
        background: rgba(255, 255, 255, 0.12);
        color: var(--text-primary, #f8fafc);
        outline: none;
      }

      #${DOCK_ID} .seyyah-dock-btn:active {
        transform: translateY(-1px) scale(0.98);
      }

      #${DOCK_ID} .seyyah-dock-btn.is-active {
        background: rgba(0, 242, 254, 0.2);
        border-color: rgba(0, 242, 254, 0.55);
        box-shadow:
          0 0 16px rgba(0, 242, 254, 0.28),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      #${DOCK_ID} .seyyah-dock-btn.is-active::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 5px;
        height: 5px;
        border-radius: 9999px;
        background: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 8px var(--accent-cyan, #00f2fe);
      }

      #${DOCK_ID} .seyyah-dock-btn[data-tooltip]::before {
        content: attr(data-tooltip);
        position: absolute;
        bottom: calc(100% + 10px);
        left: 50%;
        transform: translateX(-50%) translateY(4px) scale(0.95);
        padding: 4px 10px;
        border-radius: 8px;
        background: rgba(15, 23, 42, 0.94);
        color: #f8fafc;
        border: 1px solid rgba(255, 255, 255, 0.14);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.16s ease, transform 0.16s ease;
        z-index: 2;
      }

      #${DOCK_ID} .seyyah-dock-btn:hover::before,
      #${DOCK_ID} .seyyah-dock-btn:focus-visible::before {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
      }

      /* Light Theme Compatibility */
      body.light-theme #${DOCK_ID},
      [data-theme="light"] #${DOCK_ID} {
        background: rgba(255, 255, 255, 0.86);
        border-color: rgba(15, 23, 42, 0.14);
        box-shadow:
          0 14px 36px rgba(15, 23, 42, 0.14),
          0 0 20px rgba(2, 132, 199, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.95);
      }

      body.light-theme #${DOCK_ID} .seyyah-dock-divider,
      [data-theme="light"] #${DOCK_ID} .seyyah-dock-divider {
        background: rgba(15, 23, 42, 0.14);
      }

      body.light-theme #${DOCK_ID} .seyyah-dock-btn,
      [data-theme="light"] #${DOCK_ID} .seyyah-dock-btn {
        background: rgba(15, 23, 42, 0.045);
        color: #0f172a;
      }

      body.light-theme #${DOCK_ID} .seyyah-dock-toggle,
      [data-theme="light"] #${DOCK_ID} .seyyah-dock-toggle {
        color: #475569;
      }

      body.light-theme #${DOCK_ID} .seyyah-dock-toggle:hover,
      body.light-theme #${DOCK_ID} .seyyah-dock-toggle:focus-visible,
      [data-theme="light"] #${DOCK_ID} .seyyah-dock-toggle:hover,
      [data-theme="light"] #${DOCK_ID} .seyyah-dock-toggle:focus-visible {
        background: rgba(15, 23, 42, 0.08);
        color: #0f172a;
      }

      body.light-theme #${DOCK_ID} .seyyah-dock-btn:hover,
      body.light-theme #${DOCK_ID} .seyyah-dock-btn:focus-visible,
      [data-theme="light"] #${DOCK_ID} .seyyah-dock-btn:hover,
      [data-theme="light"] #${DOCK_ID} .seyyah-dock-btn:focus-visible {
        background: rgba(2, 132, 199, 0.14);
        border-color: rgba(2, 132, 199, 0.42);
        box-shadow: 0 8px 18px rgba(2, 132, 199, 0.18);
      }

      body.light-theme #${DOCK_ID} .seyyah-dock-btn.is-active,
      [data-theme="light"] #${DOCK_ID} .seyyah-dock-btn.is-active {
        background: rgba(2, 132, 199, 0.18);
        border-color: rgba(2, 132, 199, 0.55);
        box-shadow: 0 0 14px rgba(2, 132, 199, 0.22);
      }

      body.light-theme #${DOCK_ID} .seyyah-dock-btn.is-active::after,
      [data-theme="light"] #${DOCK_ID} .seyyah-dock-btn.is-active::after {
        background: #0284c7;
        box-shadow: 0 0 8px rgba(2, 132, 199, 0.65);
      }

      body.light-theme #${DOCK_ID} .seyyah-dock-btn[data-tooltip]::before,
      [data-theme="light"] #${DOCK_ID} .seyyah-dock-btn[data-tooltip]::before {
        background: rgba(255, 255, 255, 0.96);
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 8px 22px rgba(15, 23, 42, 0.16);
      }

      /* Responsive: keep clear of bottom-right AI Copilot orb (right: 24px) */
      @media (max-width: 640px) {
        #${DOCK_ID} {
          bottom: 14px;
          left: calc(50% - 34px);
          max-width: calc(100vw - 104px);
          padding: 5px 8px;
          gap: 4px;
        }

        #${DOCK_ID}.is-collapsed {
          left: 50%;
          padding: 4px 8px;
        }

        #${DOCK_ID} .seyyah-dock-items {
          gap: 4px;
        }

        #${DOCK_ID} .seyyah-dock-btn {
          width: 34px;
          height: 34px;
          font-size: 1rem;
        }

        #${DOCK_ID} .seyyah-dock-toggle {
          width: 24px;
          height: 30px;
          font-size: 0.82rem;
        }
      }

      @media (max-width: 400px) {
        #${DOCK_ID} {
          left: 12px;
          transform: none;
          max-width: calc(100vw - 96px);
          padding: 4px 6px;
          gap: 3px;
        }

        #${DOCK_ID}.is-collapsed {
          left: 50%;
          transform: translateX(-50%);
        }

        #${DOCK_ID} .seyyah-dock-items {
          gap: 3px;
        }

        #${DOCK_ID} .seyyah-dock-btn {
          width: 31px;
          height: 31px;
          font-size: 0.92rem;
        }
      }

      @media (hover: none) {
        #${DOCK_ID} .seyyah-dock-btn[data-tooltip]::before {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #${DOCK_ID},
        #${DOCK_ID} .seyyah-dock-btn,
        #${DOCK_ID} .seyyah-dock-toggle,
        #${DOCK_ID} .seyyah-dock-btn[data-tooltip]::before {
          transition: none !important;
        }

        #${DOCK_ID} .seyyah-dock-btn:hover,
        #${DOCK_ID} .seyyah-dock-btn:focus-visible {
          transform: none;
        }
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function resolveViewFromHash() {
    const rawHash = (window.location && window.location.hash) || '';
    const cleaned = rawHash.replace(/^#/, '').split('?')[0].split('/')[0].trim();
    if (!cleaned) return '';
    return cleaned === 'library' ? 'libraries' : cleaned;
  }

  function resolveCurrentView(preferHash) {
    const hashView = resolveViewFromHash();
    if (preferHash && hashView) {
      return hashView;
    }
    if (_ctx && _ctx.state && _ctx.state.currentView) {
      return _ctx.state.currentView;
    }
    return hashView || 'dashboard';
  }

  function setActive(viewName) {
    _activeView = viewName || 'dashboard';
    _buttonsByView.forEach((btn, view) => {
      const isMatch = view === _activeView;
      btn.classList.toggle('is-active', isMatch);
      if (isMatch) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    });
  }

  function setCollapsed(collapsed, persist) {
    _isCollapsed = Boolean(collapsed);
    if (_dockEl) {
      _dockEl.classList.toggle('is-collapsed', _isCollapsed);
    }
    if (_toggleBtnEl) {
      _toggleBtnEl.textContent = _isCollapsed ? '▴' : '▾';
      _toggleBtnEl.setAttribute('aria-expanded', _isCollapsed ? 'false' : 'true');
      const label = _isCollapsed
        ? 'Hızlı Gezinme Çubuğunu Aç'
        : 'Hızlı Gezinme Çubuğunu Küçült';
      _toggleBtnEl.setAttribute('aria-label', label);
      _toggleBtnEl.setAttribute('title', label);
    }
    if (persist) {
      writeCollapsedPref(_isCollapsed);
    }
  }

  function openCommandPalette() {
    const mods = window.SEYYAH_MODULES || {};
    if (mods.commandPalette && typeof mods.commandPalette.open === 'function') {
      mods.commandPalette.open();
      return true;
    }
    if (_ctx && typeof _ctx.openCommandPalette === 'function') {
      _ctx.openCommandPalette();
      return true;
    }
    const triggerBtn = document.getElementById('btn-cmd-palette');
    if (triggerBtn && typeof triggerBtn.click === 'function') {
      triggerBtn.click();
      return true;
    }
    const sidebarSearch = document.getElementById('search-input');
    if (sidebarSearch && typeof sidebarSearch.focus === 'function') {
      sidebarSearch.focus();
      return true;
    }
    return false;
  }

  function handleItemClick(item) {
    if (item.action === 'search') {
      openCommandPalette();
      return;
    }

    const prevStateView = _ctx && _ctx.state ? _ctx.state.currentView : null;
    setActive(item.view);

    if (_ctx && typeof _ctx.openView === 'function') {
      _ctx.openView(item.view);
    } else if (window.location) {
      window.location.hash = `#${item.view}`;
    }

    // If app.js state transitioned to a specific view (e.g. fallback), keep highlight accurate
    Promise.resolve().then(() => {
      const nextStateView = _ctx && _ctx.state ? _ctx.state.currentView : null;
      if (nextStateView && nextStateView !== prevStateView) {
        setActive(nextStateView);
      }
    });
  }

  function buildDockDOM() {
    const existing = document.getElementById(DOCK_ID);
    if (existing) {
      existing.remove();
    }

    _buttonsByView.clear();

    const dock = document.createElement('nav');
    dock.id = DOCK_ID;
    dock.setAttribute('role', 'navigation');
    dock.setAttribute('aria-label', 'Hızlı Gezinme Çubuğu');

    const itemsWrap = document.createElement('div');
    itemsWrap.className = 'seyyah-dock-items';

    DOCK_ITEMS.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'seyyah-dock-btn';
      btn.dataset.dockId = item.id;
      if (item.view) {
        btn.dataset.view = item.view;
        _buttonsByView.set(item.view, btn);
      } else if (item.action) {
        btn.dataset.action = item.action;
      }
      btn.setAttribute('data-tooltip', item.label);
      btn.setAttribute('aria-label', item.label);
      btn.setAttribute('title', item.label);
      btn.textContent = item.icon;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleItemClick(item);
      });
      itemsWrap.appendChild(btn);
    });

    const divider = document.createElement('span');
    divider.className = 'seyyah-dock-divider';
    divider.setAttribute('aria-hidden', 'true');

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'seyyah-dock-toggle';
    toggleBtn.textContent = '▾';
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setCollapsed(!_isCollapsed, true);
    });

    dock.appendChild(itemsWrap);
    dock.appendChild(divider);
    dock.appendChild(toggleBtn);

    _dockEl = dock;
    _itemsWrapEl = itemsWrap;
    _dividerEl = divider;
    _toggleBtnEl = toggleBtn;

    document.body.appendChild(dock);
  }

  function onHashChange() {
    setActive(resolveCurrentView(true));
  }

  function onDocumentClick(e) {
    if (!_dockEl || _dockEl.contains(e.target)) return;
    const navTrigger = e.target && typeof e.target.closest === 'function'
      ? e.target.closest('[data-view], #btn-dashboard, #btn-route, #btn-gallery, #logo-section, .city-item')
      : null;
    if (!navTrigger) return;
    requestAnimationFrame(() => {
      setActive(resolveCurrentView(false));
    });
  }

  function bindGlobalListeners() {
    if (!_listenersBound) {
      window.addEventListener('hashchange', onHashChange);
      window.addEventListener('popstate', onHashChange);
      document.addEventListener('click', onDocumentClick);
      _listenersBound = true;
    }

    const viewport = document.getElementById('viewport-content');
    if (viewport && typeof MutationObserver === 'function' && !_viewportObserver) {
      _viewportObserver = new MutationObserver(() => {
        setActive(resolveCurrentView(false));
      });
      _viewportObserver.observe(viewport, { childList: true });
    }
  }

  function destroy() {
    if (_listenersBound) {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onHashChange);
      document.removeEventListener('click', onDocumentClick);
      _listenersBound = false;
    }
    if (_viewportObserver) {
      _viewportObserver.disconnect();
      _viewportObserver = null;
    }
    if (_dockEl && _dockEl.parentNode) {
      _dockEl.parentNode.removeChild(_dockEl);
    }
    _dockEl = null;
    _itemsWrapEl = null;
    _dividerEl = null;
    _toggleBtnEl = null;
    _buttonsByView.clear();
  }

  function init(ctx) {
    _ctx = ctx || {};
    injectStyles();
    if (!_dockEl || !document.body.contains(_dockEl)) {
      buildDockDOM();
    }
    setCollapsed(readCollapsedPref(), false);
    setActive(resolveCurrentView(Boolean(resolveViewFromHash())));
    bindGlobalListeners();
  }

  window.SEYYAH_MODULES.quickDock = {
    init,
    setActive,
    setCollapsed,
    openCommandPalette,
    destroy
  };
})();
