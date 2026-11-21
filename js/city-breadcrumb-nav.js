/**
 * Anadolu Seyahatnamesi — Plaka Sıralı Önceki/Sonraki İl & En Yakın 4 Komşu Menzil
 * Automatic in-page navigation enhancer for all 81 province detail pages.
 * Registers on: window.SEYYAH_MODULES.cityNavBar = { init(ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-city-breadcrumb-nav-styles';
  const VIEWPORT_ID = 'viewport-content';
  const TOP_BAR_CLASS = 'seyyah-city-breadcrumb-bar';
  const BOTTOM_NAV_CLASS = 'seyyah-city-bottom-nav';
  const ROAD_FACTOR = 1.35;

  let activeCtx = null;
  let observer = null;
  let observerBound = false;
  let keyboardBound = false;
  let isInjecting = false;

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------
  function defaultEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function esc(str) {
    if (activeCtx && typeof activeCtx.escapeHtml === 'function') {
      return activeCtx.escapeHtml(str);
    }
    return defaultEscapeHtml(str);
  }

  function padPlate(plate) {
    const num = parseInt(plate, 10);
    if (!Number.isFinite(num)) return String(plate || '--');
    return String(num).padStart(2, '0');
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function calcRoadDistKm(ctx, p1, p2) {
    if (
      !p1 ||
      !p2 ||
      !Number.isFinite(Number(p1.lat)) ||
      !Number.isFinite(Number(p1.lng)) ||
      !Number.isFinite(Number(p2.lat)) ||
      !Number.isFinite(Number(p2.lng))
    ) {
      return null;
    }
    const lat1 = Number(p1.lat);
    const lng1 = Number(p1.lng);
    const lat2 = Number(p2.lat);
    const lng2 = Number(p2.lng);
    const rawKm =
      ctx && typeof ctx.calcDistKm === 'function'
        ? ctx.calcDistKm(lat1, lng1, lat2, lng2)
        : haversineKm(lat1, lng1, lat2, lng2);
    return Math.round(rawKm * ROAD_FACTOR);
  }

  function getProvincesMap(ctx) {
    if (ctx && ctx.data && ctx.data.provinces) {
      return ctx.data.provinces;
    }
    if (ctx && ctx.state && ctx.state.data && ctx.state.data.provinces) {
      return ctx.state.data.provinces;
    }
    if (typeof TRAVEL_DATA !== 'undefined' && TRAVEL_DATA && TRAVEL_DATA.provinces) {
      return TRAVEL_DATA.provinces;
    }
    return null;
  }

  function getSortedByPlate(provincesMap) {
    return Object.entries(provincesMap || {})
      .map(([key, province]) => ({ key, province }))
      .sort((a, b) => {
        const pa = parseInt(a.province && a.province.plate, 10) || 0;
        const pb = parseInt(b.province && b.province.plate, 10) || 0;
        if (pa !== pb) return pa - pb;
        return a.key.localeCompare(b.key);
      });
  }

  function getNearestNeighbors(ctx, provincesMap, originKey, count) {
    const origin = provincesMap[originKey];
    if (!origin) return [];

    return Object.entries(provincesMap)
      .filter(([key]) => key !== originKey)
      .map(([key, province]) => ({
        key,
        province,
        distKm: calcRoadDistKm(ctx, origin, province)
      }))
      .filter((item) => item.distKm !== null)
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, count);
  }

  function getNavigationContext(ctx, cityKey) {
    const provincesMap = getProvincesMap(ctx);
    if (!provincesMap || !provincesMap[cityKey]) return null;

    const sorted = getSortedByPlate(provincesMap);
    const curIndex = sorted.findIndex((item) => item.key === cityKey);
    if (curIndex === -1 || sorted.length === 0) return null;

    const prevIndex = (curIndex - 1 + sorted.length) % sorted.length;
    const nextIndex = (curIndex + 1) % sorted.length;

    const current = sorted[curIndex];
    const prev = sorted[prevIndex];
    const next = sorted[nextIndex];
    const neighbors = getNearestNeighbors(ctx, provincesMap, cityKey, 4);

    return {
      total: sorted.length,
      curIndex,
      current,
      prev: {
        ...prev,
        distKm: calcRoadDistKm(ctx, current.province, prev.province)
      },
      next: {
        ...next,
        distKm: calcRoadDistKm(ctx, current.province, next.province)
      },
      neighbors
    };
  }

  function navigateToCity(key) {
    if (!key) return;
    if (activeCtx && typeof activeCtx.selectCity === 'function') {
      activeCtx.selectCity(key);
      return;
    }
    window.location.hash = `#city/${encodeURIComponent(key)}`;
  }

  function navigateToDashboard() {
    if (activeCtx && typeof activeCtx.openView === 'function') {
      activeCtx.openView('dashboard');
      return;
    }
    window.location.hash = '#dashboard';
  }

  function statusMeta(visited) {
    return visited
      ? { label: '✅ Gezildi', cls: 'is-visited' }
      : { label: '⏳ Keşif', cls: 'is-explore' };
  }

  // ---------------------------------------------------------------------------
  // Scoped Styles (Dark & body.light-theme compatible)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .${TOP_BAR_CLASS} {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px 16px;
        border-radius: var(--radius-md, 12px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.45));
        font-family: var(--font-body, 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif);
        color: var(--text-primary, #f8fafc);
        margin-bottom: 4px;
      }

      .${TOP_BAR_CLASS}-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .${TOP_BAR_CLASS}-crumbs {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
      }

      .${TOP_BAR_CLASS}-home-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary, #f8fafc);
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.2s ease, background 0.2s ease, transform 0.15s ease;
      }

      .${TOP_BAR_CLASS}-home-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        transform: translateY(-1px);
      }

      .${TOP_BAR_CLASS}-sep {
        opacity: 0.45;
        user-select: none;
      }

      .${TOP_BAR_CLASS}-region {
        padding: 3px 9px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(79, 172, 254, 0.12);
        border: 1px solid rgba(79, 172, 254, 0.25);
        color: var(--accent-blue, #4facfe);
        font-size: 0.76rem;
        font-weight: 600;
      }

      .${TOP_BAR_CLASS}-current {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        font-size: 0.84rem;
      }

      .${TOP_BAR_CLASS}-plate-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        padding: 2px 7px;
        border-radius: 6px;
        background: rgba(0, 242, 254, 0.14);
        border: 1px solid rgba(0, 242, 254, 0.3);
        color: var(--accent-cyan, #00f2fe);
        font-family: monospace;
        font-size: 0.76rem;
        font-weight: 700;
      }

      .${TOP_BAR_CLASS}-status {
        font-size: 0.73rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: var(--radius-full, 9999px);
      }

      .${TOP_BAR_CLASS}-status.is-visited,
      .${BOTTOM_NAV_CLASS}-status.is-visited {
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.32);
        color: var(--accent-emerald, #10b981);
      }

      .${TOP_BAR_CLASS}-status.is-explore,
      .${BOTTOM_NAV_CLASS}-status.is-explore {
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.32);
        color: var(--accent-gold, #f59e0b);
      }

      .${TOP_BAR_CLASS}-plate-nav {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .${TOP_BAR_CLASS}-plate-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 11px;
        border-radius: var(--radius-sm, 8px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary, #f8fafc);
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.2s ease, background 0.2s ease, transform 0.15s ease;
      }

      .${TOP_BAR_CLASS}-plate-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        transform: translateY(-1px);
      }

      .${TOP_BAR_CLASS}-plate-code {
        font-family: monospace;
        font-size: 0.74rem;
        color: var(--accent-cyan, #00f2fe);
        opacity: 0.95;
      }

      .${TOP_BAR_CLASS}-neighbors {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        padding-top: 9px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .${TOP_BAR_CLASS}-neighbors-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        letter-spacing: 0.2px;
        margin-right: 2px;
        white-space: nowrap;
      }

      .${TOP_BAR_CLASS}-neighbor-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-primary, #f8fafc);
        font-size: 0.76rem;
        cursor: pointer;
        transition: border-color 0.2s ease, background 0.2s ease, transform 0.15s ease;
      }

      .${TOP_BAR_CLASS}-neighbor-chip:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        transform: translateY(-1px);
      }

      .${TOP_BAR_CLASS}-neighbor-name {
        font-weight: 600;
      }

      .${TOP_BAR_CLASS}-neighbor-dist {
        font-family: monospace;
        font-size: 0.72rem;
        color: var(--accent-cyan, #00f2fe);
      }

      .${TOP_BAR_CLASS}-neighbor-state {
        font-size: 0.71rem;
        font-weight: 600;
      }

      .${TOP_BAR_CLASS}-neighbor-state.is-visited {
        color: var(--accent-emerald, #10b981);
      }

      .${TOP_BAR_CLASS}-neighbor-state.is-explore {
        color: var(--accent-gold, #f59e0b);
      }

      /* Bottom Next / Prev Plate Card */
      .${BOTTOM_NAV_CLASS} {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px 18px;
        border-radius: var(--radius-md, 12px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.45));
        font-family: var(--font-body, 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif);
        color: var(--text-primary, #f8fafc);
      }

      .${BOTTOM_NAV_CLASS}-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }

      .${BOTTOM_NAV_CLASS}-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .${BOTTOM_NAV_CLASS}-shortcut {
        font-size: 0.74rem;
        color: var(--text-secondary, #94a3b8);
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .${BOTTOM_NAV_CLASS}-kbd {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 5px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.18));
        background: rgba(255, 255, 255, 0.06);
        font-family: monospace;
        font-size: 0.71rem;
        color: var(--text-primary, #f8fafc);
      }

      .${BOTTOM_NAV_CLASS}-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .${BOTTOM_NAV_CLASS}-card {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 12px 14px;
        border-radius: var(--radius-sm, 8px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-primary, #f8fafc);
        text-align: left;
        cursor: pointer;
        transition: border-color 0.2s ease, background 0.2s ease, transform 0.18s ease, box-shadow 0.2s ease;
      }

      .${BOTTOM_NAV_CLASS}-card.is-next {
        text-align: right;
        align-items: flex-end;
      }

      .${BOTTOM_NAV_CLASS}-card:hover {
        border-color: var(--border-glow, rgba(0, 242, 254, 0.35));
        background: rgba(0, 242, 254, 0.09);
        transform: translateY(-2px);
        box-shadow: var(--shadow-glow, 0 0 20px rgba(0, 242, 254, 0.18));
      }

      .${BOTTOM_NAV_CLASS}-dir {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-secondary, #94a3b8);
      }

      .${BOTTOM_NAV_CLASS}-name-row {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .${BOTTOM_NAV_CLASS}-city {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.02rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      .${BOTTOM_NAV_CLASS}-meta {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      .${BOTTOM_NAV_CLASS}-status {
        font-size: 0.72rem;
        font-weight: 600;
        padding: 1px 7px;
        border-radius: var(--radius-full, 9999px);
      }

      .${TOP_BAR_CLASS} button:focus-visible,
      .${BOTTOM_NAV_CLASS} button:focus-visible {
        outline: 2px solid var(--accent-cyan, #00f2fe);
        outline-offset: 2px;
      }

      /* Light Theme Overrides */
      body.light-theme .${TOP_BAR_CLASS},
      body.light-theme .${BOTTOM_NAV_CLASS} {
        background: var(--bg-card, rgba(255, 255, 255, 0.92));
        border-color: var(--border-glass, rgba(15, 23, 42, 0.12));
        color: var(--text-primary, #0f172a);
      }

      body.light-theme .${TOP_BAR_CLASS}-home-btn,
      body.light-theme .${TOP_BAR_CLASS}-plate-btn,
      body.light-theme .${TOP_BAR_CLASS}-neighbor-chip,
      body.light-theme .${BOTTOM_NAV_CLASS}-card {
        background: rgba(241, 245, 249, 0.9);
        border-color: rgba(15, 23, 42, 0.12);
        color: var(--text-primary, #0f172a);
      }

      body.light-theme .${TOP_BAR_CLASS}-home-btn:hover,
      body.light-theme .${TOP_BAR_CLASS}-plate-btn:hover,
      body.light-theme .${TOP_BAR_CLASS}-neighbor-chip:hover,
      body.light-theme .${BOTTOM_NAV_CLASS}-card:hover {
        background: rgba(2, 132, 199, 0.1);
        border-color: var(--accent-cyan, #0284c7);
      }

      body.light-theme .${TOP_BAR_CLASS}-plate-pill {
        background: rgba(2, 132, 199, 0.12);
        border-color: rgba(2, 132, 199, 0.28);
        color: var(--accent-cyan, #0284c7);
      }

      body.light-theme .${TOP_BAR_CLASS}-region {
        background: rgba(37, 99, 235, 0.1);
        border-color: rgba(37, 99, 235, 0.24);
        color: var(--accent-blue, #2563eb);
      }

      body.light-theme .${BOTTOM_NAV_CLASS}-kbd {
        background: rgba(15, 23, 42, 0.06);
        border-color: rgba(15, 23, 42, 0.16);
        color: var(--text-primary, #0f172a);
      }

      @media (max-width: 768px) {
        .${TOP_BAR_CLASS} {
          padding: 10px 12px;
        }
        .${BOTTOM_NAV_CLASS}-grid {
          grid-template-columns: 1fr;
        }
        .${BOTTOM_NAV_CLASS}-card.is-next {
          text-align: left;
          align-items: flex-start;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // DOM Builders
  // ---------------------------------------------------------------------------
  function buildTopBar(nav) {
    const { current, prev, next, neighbors, curIndex, total } = nav;
    const curProv = current.province;
    const curStatus = statusMeta(curProv.visited);
    const prevPlate = padPlate(prev.province.plate);
    const nextPlate = padPlate(next.province.plate);
    const curPlate = padPlate(curProv.plate);

    const neighborsHtml = neighbors
      .map((n) => {
        const st = statusMeta(n.province.visited);
        const plateStr = padPlate(n.province.plate);
        return `
          <button
            type="button"
            class="${TOP_BAR_CLASS}-neighbor-chip"
            data-nav-city-key="${esc(n.key)}"
            title="${esc(n.province.name)} (${esc(n.province.region)}) — ~${n.distKm} km"
          >
            <span class="${TOP_BAR_CLASS}-plate-code">${esc(plateStr)}</span>
            <span class="${TOP_BAR_CLASS}-neighbor-name">${esc(n.province.name)}</span>
            <span class="${TOP_BAR_CLASS}-neighbor-dist">~${n.distKm} km</span>
            <span class="${TOP_BAR_CLASS}-neighbor-state ${st.cls}">${st.label}</span>
          </button>
        `;
      })
      .join('');

    const bar = document.createElement('nav');
    bar.className = TOP_BAR_CLASS;
    bar.setAttribute('aria-label', 'Plaka sıralı il ve komşu menzil gezintisi');

    bar.innerHTML = `
      <div class="${TOP_BAR_CLASS}-row">
        <div class="${TOP_BAR_CLASS}-crumbs">
          <button type="button" class="${TOP_BAR_CLASS}-home-btn" data-nav-home="1" title="Genel Bakışa Dön">
            🏠 Genel Bakış
          </button>
          <span class="${TOP_BAR_CLASS}-sep" aria-hidden="true">›</span>
          <span class="${TOP_BAR_CLASS}-region">${esc(curProv.region)} Bölgesi</span>
          <span class="${TOP_BAR_CLASS}-sep" aria-hidden="true">›</span>
          <span class="${TOP_BAR_CLASS}-current">
            <span class="${TOP_BAR_CLASS}-plate-pill">${esc(curPlate)}</span>
            <span>${esc(curProv.name)}</span>
            <span style="opacity:0.65;font-weight:500;font-size:0.76rem;">(${curIndex + 1}/${total})</span>
            <span class="${TOP_BAR_CLASS}-status ${curStatus.cls}">${curStatus.label}</span>
          </span>
        </div>

        <div class="${TOP_BAR_CLASS}-plate-nav">
          <button
            type="button"
            class="${TOP_BAR_CLASS}-plate-btn"
            data-nav-city-key="${esc(prev.key)}"
            title="Önceki Plaka: ${esc(prevPlate)} ${esc(prev.province.name)} (Alt + ←)"
          >
            <span>←</span>
            <span class="${TOP_BAR_CLASS}-plate-code">${esc(prevPlate)}</span>
            <span>${esc(prev.province.name)}</span>
          </button>
          <button
            type="button"
            class="${TOP_BAR_CLASS}-plate-btn"
            data-nav-city-key="${esc(next.key)}"
            title="Sonraki Plaka: ${esc(nextPlate)} ${esc(next.province.name)} (Alt + →)"
          >
            <span>${esc(next.province.name)}</span>
            <span class="${TOP_BAR_CLASS}-plate-code">${esc(nextPlate)}</span>
            <span>→</span>
          </button>
        </div>
      </div>

      <div class="${TOP_BAR_CLASS}-neighbors">
        <span class="${TOP_BAR_CLASS}-neighbors-label">🧭 En Yakın 4 Komşu Menzil:</span>
        ${neighborsHtml}
      </div>
    `;

    bindNavClicks(bar);
    return bar;
  }

  function buildBottomNav(nav) {
    const { current, prev, next } = nav;
    const curPlate = padPlate(current.province.plate);
    const prevPlate = padPlate(prev.province.plate);
    const nextPlate = padPlate(next.province.plate);
    const prevStatus = statusMeta(prev.province.visited);
    const nextStatus = statusMeta(next.province.visited);

    const card = document.createElement('section');
    card.className = BOTTOM_NAV_CLASS;
    card.setAttribute('aria-label', 'Plaka sıralı önceki ve sonraki il kartı');

    card.innerHTML = `
      <div class="${BOTTOM_NAV_CLASS}-header">
        <span class="${BOTTOM_NAV_CLASS}-title">
          🧭 Plaka Sıralı Menzil Geçişi · ${esc(curPlate)} ${esc(current.province.name)}
        </span>
        <span class="${BOTTOM_NAV_CLASS}-shortcut">
          Klavye: <kbd class="${BOTTOM_NAV_CLASS}-kbd">Alt</kbd> + <kbd class="${BOTTOM_NAV_CLASS}-kbd">←</kbd> / <kbd class="${BOTTOM_NAV_CLASS}-kbd">→</kbd>
        </span>
      </div>

      <div class="${BOTTOM_NAV_CLASS}-grid">
        <button
          type="button"
          class="${BOTTOM_NAV_CLASS}-card is-prev"
          data-nav-city-key="${esc(prev.key)}"
        >
          <span class="${BOTTOM_NAV_CLASS}-dir">← Önceki Plaka</span>
          <div class="${BOTTOM_NAV_CLASS}-name-row">
            <span class="${TOP_BAR_CLASS}-plate-pill">${esc(prevPlate)}</span>
            <span class="${BOTTOM_NAV_CLASS}-city">${esc(prev.province.name)}</span>
          </div>
          <div class="${BOTTOM_NAV_CLASS}-meta">
            <span>${esc(prev.province.region)}</span>
            ${prev.distKm !== null ? `<span>• ~${prev.distKm} km</span>` : ''}
            <span class="${BOTTOM_NAV_CLASS}-status ${prevStatus.cls}">${prevStatus.label}</span>
          </div>
        </button>

        <button
          type="button"
          class="${BOTTOM_NAV_CLASS}-card is-next"
          data-nav-city-key="${esc(next.key)}"
        >
          <span class="${BOTTOM_NAV_CLASS}-dir">Sonraki Plaka →</span>
          <div class="${BOTTOM_NAV_CLASS}-name-row">
            <span class="${BOTTOM_NAV_CLASS}-city">${esc(next.province.name)}</span>
            <span class="${TOP_BAR_CLASS}-plate-pill">${esc(nextPlate)}</span>
          </div>
          <div class="${BOTTOM_NAV_CLASS}-meta">
            <span class="${BOTTOM_NAV_CLASS}-status ${nextStatus.cls}">${nextStatus.label}</span>
            ${next.distKm !== null ? `<span>• ~${next.distKm} km</span>` : ''}
            <span>${esc(next.province.region)}</span>
          </div>
        </button>
      </div>
    `;

    bindNavClicks(card);
    return card;
  }

  function bindNavClicks(rootEl) {
    const homeBtn = rootEl.querySelector('[data-nav-home]');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => navigateToDashboard());
    }

    rootEl.querySelectorAll('[data-nav-city-key]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetKey = btn.getAttribute('data-nav-city-key');
        if (targetKey) navigateToCity(targetKey);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Injection & Observer
  // ---------------------------------------------------------------------------
  function tryInjectIntoViewport() {
    if (isInjecting) return;
    const ctx = activeCtx;
    if (!ctx || !ctx.state) return;
    if (ctx.state.currentView !== 'city' || !ctx.state.selectedCityKey) return;

    const viewport = document.getElementById(VIEWPORT_ID);
    if (!viewport) return;

    const detailView = viewport.querySelector('.city-detail-view');
    if (!detailView) return;
    if (detailView.querySelector(`.${TOP_BAR_CLASS}`)) return;

    const nav = getNavigationContext(ctx, ctx.state.selectedCityKey);
    if (!nav) return;

    isInjecting = true;
    try {
      const existingBottom = detailView.querySelector(`.${BOTTOM_NAV_CLASS}`);
      if (existingBottom) existingBottom.remove();

      const topBar = buildTopBar(nav);
      const bottomNav = buildBottomNav(nav);

      detailView.insertAdjacentElement('afterbegin', topBar);
      detailView.appendChild(bottomNav);
    } finally {
      isInjecting = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Keyboard Shortcuts: Alt + ArrowLeft / Alt + ArrowRight
  // ---------------------------------------------------------------------------
  function isEditableTarget(target) {
    if (!target) return false;
    const tag = target.tagName ? target.tagName.toUpperCase() : '';
    return (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      Boolean(target.isContentEditable)
    );
  }

  function handleKeyDown(e) {
    if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (isEditableTarget(e.target)) return;

    const ctx = activeCtx;
    if (!ctx || !ctx.state) return;
    if (ctx.state.currentView !== 'city' || !ctx.state.selectedCityKey) return;

    const nav = getNavigationContext(ctx, ctx.state.selectedCityKey);
    if (!nav) return;

    e.preventDefault();
    if (e.key === 'ArrowLeft') {
      navigateToCity(nav.prev.key);
    } else {
      navigateToCity(nav.next.key);
    }
  }

  // ---------------------------------------------------------------------------
  // Public Init
  // ---------------------------------------------------------------------------
  function init(ctx) {
    activeCtx = ctx || activeCtx;
    injectStyles();

    const viewport = document.getElementById(VIEWPORT_ID);
    if (viewport && !observerBound && typeof MutationObserver === 'function') {
      observerBound = true;
      observer = new MutationObserver(() => {
        tryInjectIntoViewport();
      });
      observer.observe(viewport, { childList: true, subtree: true });
    }

    if (!keyboardBound) {
      keyboardBound = true;
      document.addEventListener('keydown', handleKeyDown);
    }

    tryInjectIntoViewport();
  }

  window.SEYYAH_MODULES.cityNavBar = {
    init
  };
})();
