/**
 * Anadolu Seyahatnamesi — 81 İl İnteraktif Vektör Keşif Haritası
 * Pure SVG + Vanilla JS, zero external dependencies.
 * Registers on window.SEYYAH_MODULES.atlas = { render(container, ctx) }
 */
(function () {
  'use strict';

  const STYLE_ID = 'seyyah-atlas-styles';
  const VIEW_W = 1000;
  const VIEW_H = 440;
  const PAD_X = 34;
  const PAD_Y = 26;
  const BOUNDS = {
    minLng: 25.5,
    maxLng: 45.0,
    minLat: 35.6,
    maxLat: 42.4
  };
  const ROAD_FACTOR = 1.25;

  const DEFAULT_ROUTE = [
    'Ankara', 'Çankırı', 'Kastamonu', 'Karabük', 'Bartın',
    'Zonguldak', 'Düzce', 'Sakarya', 'İstanbul', 'Edirne'
  ];

  // Stylized geographic coastlines in [lat, lng] projected with the exact same projection as the 81 provinces
  const THRACE_COAST = [
    [41.98, 26.35], [41.97, 27.15], [41.88, 28.00], [41.55, 28.22],
    [41.24, 29.10], [41.00, 28.98], [41.04, 28.45], [41.06, 28.05],
    [40.98, 27.52], [40.62, 27.12], [40.06, 26.20], [40.58, 26.75],
    [40.64, 26.35], [40.72, 26.06], [41.12, 26.36], [41.68, 26.55]
  ];

  const ANATOLIA_COAST = [
    [41.22, 29.16], [41.18, 29.62], [41.12, 30.72], [41.28, 31.42],
    [41.74, 32.38], [42.02, 33.76], [42.04, 35.15], [41.72, 35.95],
    [41.30, 36.34], [41.13, 37.28], [40.99, 37.88], [40.92, 38.39],
    [41.01, 39.72], [41.04, 40.52], [41.52, 41.55], [41.56, 42.75],
    [41.14, 43.35], [40.50, 43.65], [39.66, 44.78], [39.35, 44.45],
    [38.46, 44.36], [37.56, 44.55], [37.14, 44.78], [37.25, 43.60],
    [37.16, 42.55], [37.33, 42.19], [37.06, 41.22], [36.85, 40.05],
    [36.72, 38.95], [36.83, 38.00], [36.68, 37.10], [36.26, 36.58],
    [35.84, 36.12], [36.08, 35.95], [36.59, 36.17], [36.77, 35.78],
    [36.56, 35.38], [36.80, 34.63], [36.28, 33.98], [36.02, 32.84],
    [36.54, 32.00], [36.88, 30.70], [36.30, 30.15], [36.20, 29.63],
    [36.62, 29.11], [36.85, 28.27], [36.72, 27.68], [37.04, 27.43],
    [37.37, 27.27], [37.86, 27.26], [38.32, 26.32], [38.42, 27.12],
    [38.67, 26.75], [39.32, 26.69], [39.48, 26.08], [40.15, 26.40],
    [40.42, 27.20], [40.35, 27.97], [40.38, 28.88], [40.66, 29.27],
    [40.76, 29.92], [40.78, 29.40], [41.01, 29.02]
  ];

  const LAKE_VAN = [
    [38.92, 42.55], [38.88, 43.28], [38.48, 43.25], [38.38, 42.72], [38.58, 42.32]
  ];

  const LAKE_TUZ = [
    [39.02, 33.22], [38.95, 33.55], [38.55, 33.62], [38.62, 33.25]
  ];

  // Persisted UI state across module re-renders
  const uiState = {
    mode: 'status', // 'status' | 'regions' | 'route'
    showLabels: false,
    activeRegionFilter: 'all',
    zoom: 1,
    tx: 0,
    ty: 0,
    hoveredKey: null
  };

  function defaultEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeTurkish(str) {
    if (!str) return '';
    return String(str)
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .trim();
  }

  function formatPlate(plate) {
    const n = Number(plate) || 0;
    return n < 10 ? '0' + n : String(n);
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function project(lat, lng) {
    const x = PAD_X + ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * (VIEW_W - PAD_X * 2);
    const y = PAD_Y + ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * (VIEW_H - PAD_Y * 2);
    return {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10
    };
  }

  function buildPolygonPath(coords) {
    if (!coords || !coords.length) return '';
    return coords
      .map((pt, idx) => {
        const p = project(pt[0], pt[1]);
        return (idx === 0 ? 'M' : 'L') + p.x + ',' + p.y;
      })
      .join(' ') + ' Z';
  }

  function isFavorite(favorites, key) {
    if (!favorites) return false;
    if (typeof favorites.has === 'function') return favorites.has(key);
    if (Array.isArray(favorites)) return favorites.includes(key);
    return false;
  }

  function injectFallbackStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .atlas-module {
        display: flex;
        flex-direction: column;
        gap: 16px;
        animation: modFadeSlideUp 0.32s ease both;
      }
      .atlas-header-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 20px;
      }
      .atlas-title-wrap h2 {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .atlas-title-wrap p {
        font-size: 0.86rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 2px;
      }
      .atlas-kpi-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .atlas-kpi-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 600;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
        color: var(--text-primary, #f8fafc);
      }
      .atlas-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 16px;
      }
      .atlas-mode-pills {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }
      .atlas-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }
      .atlas-ctrl-btn {
        min-width: 34px;
        height: 34px;
        padding: 0 10px;
        font-size: 0.84rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }
      .atlas-ctrl-btn.is-active {
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.14);
        box-shadow: 0 0 12px rgba(0, 242, 254, 0.2);
      }
      .atlas-zoom-badge {
        font-size: 0.74rem;
        font-weight: 600;
        color: var(--text-secondary, #94a3b8);
        padding: 0 6px;
        min-width: 44px;
        text-align: center;
        font-variant-numeric: tabular-nums;
      }
      .atlas-subbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 16px;
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
      }
      .atlas-legend {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
      }
      .atlas-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
        color: var(--text-secondary, #94a3b8);
        font-size: 0.76rem;
        cursor: default;
        transition: all 0.2s ease;
      }
      .atlas-legend-item.is-clickable {
        cursor: pointer;
      }
      .atlas-legend-item.is-clickable:hover,
      .atlas-legend-item.is-active {
        color: var(--text-primary, #f8fafc);
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
      }
      .atlas-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        flex-shrink: 0;
      }
      .atlas-stage {
        position: relative;
        width: 100%;
        overflow: hidden;
        padding: 10px;
        background:
          radial-gradient(ellipse at 50% 45%, rgba(0, 242, 254, 0.08) 0%, rgba(15, 23, 42, 0.65) 72%),
          var(--bg-card, rgba(30, 41, 59, 0.7));
        user-select: none;
        touch-action: none;
      }
      .atlas-stage.is-pannable {
        cursor: grab;
      }
      .atlas-stage.is-panning {
        cursor: grabbing;
      }
      .atlas-svg {
        display: block;
        width: 100%;
        height: auto;
        min-height: 290px;
        max-height: 540px;
      }
      .atlas-grid-line {
        stroke: rgba(0, 242, 254, 0.13);
        stroke-width: 0.85;
        stroke-dasharray: 3 5;
      }
      .atlas-grid-label {
        fill: rgba(148, 163, 184, 0.65);
        font-size: 9px;
        font-family: var(--font-heading, sans-serif);
        letter-spacing: 0.04em;
      }
      .atlas-sea-label {
        fill: rgba(56, 189, 248, 0.24);
        font-size: 11px;
        font-weight: 700;
        font-family: var(--font-heading, sans-serif);
        letter-spacing: 0.28em;
        pointer-events: none;
      }
      .atlas-landmass {
        fill: url(#atlasLandGrad);
        stroke: rgba(0, 242, 254, 0.34);
        stroke-width: 1.25;
        stroke-linejoin: round;
        filter: url(#atlasLandGlow);
      }
      .atlas-lake {
        fill: rgba(14, 165, 233, 0.26);
        stroke: rgba(56, 189, 248, 0.35);
        stroke-width: 0.7;
      }
      .atlas-route-glow {
        fill: none;
        stroke: rgba(0, 242, 254, 0.28);
        stroke-width: 7;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .atlas-route-line {
        fill: none;
        stroke: #00f2fe;
        stroke-width: 2.6;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: 9 6;
        animation: atlasDashFlow 1.6s linear infinite;
      }
      @keyframes atlasDashFlow {
        from { stroke-dashoffset: 30; }
        to { stroke-dashoffset: 0; }
      }
      @keyframes atlasBeaconPulse {
        0%, 100% { opacity: 0.75; transform: scale(1); }
        50% { opacity: 0.18; transform: scale(1.65); }
      }
      .atlas-beacon {
        transform-box: fill-box;
        transform-origin: center;
        animation: atlasBeaconPulse 2.2s ease-in-out infinite;
        pointer-events: none;
      }
      .atlas-node {
        cursor: pointer;
        outline: none;
        transition: opacity 0.2s ease;
      }
      .atlas-node .atlas-node-core {
        transition: r 0.18s ease, stroke-width 0.18s ease, filter 0.18s ease;
      }
      .atlas-node:hover .atlas-node-core,
      .atlas-node:focus .atlas-node-core,
      .atlas-node.is-focused .atlas-node-core {
        stroke: #ffffff;
        stroke-width: 2.2;
      }
      .atlas-node-label {
        font-size: 8.5px;
        font-weight: 600;
        font-family: var(--font-heading, sans-serif);
        fill: var(--text-primary, #f8fafc);
        paint-order: stroke;
        stroke: rgba(10, 15, 29, 0.88);
        stroke-width: 2.6px;
        stroke-linejoin: round;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.18s ease;
      }
      .atlas-svg.atlas-labels-visible .atlas-node-label,
      .atlas-node:hover .atlas-node-label,
      .atlas-node:focus .atlas-node-label,
      .atlas-node.is-focused .atlas-node-label,
      .atlas-node.is-route-stop .atlas-node-label {
        opacity: 1;
      }
      .atlas-route-badge-bg {
        fill: #00f2fe;
        stroke: #0a0f1d;
        stroke-width: 1.5;
      }
      .atlas-route-badge-text {
        fill: #0a0f1d;
        font-size: 8.5px;
        font-weight: 800;
        font-family: var(--font-heading, sans-serif);
        text-anchor: middle;
        dominant-baseline: central;
        pointer-events: none;
      }
      .atlas-preview-card {
        display: grid;
        grid-template-columns: 220px 1fr auto;
        align-items: center;
        gap: 18px;
        padding: 14px 18px;
      }
      .atlas-preview-thumb-wrap {
        position: relative;
        width: 220px;
        height: 126px;
        border-radius: var(--radius-sm, 8px);
        overflow: hidden;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.18), rgba(16, 185, 129, 0.16));
        border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
        flex-shrink: 0;
      }
      .atlas-preview-thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .atlas-preview-plate {
        position: absolute;
        top: 8px;
        left: 8px;
        padding: 3px 8px;
        border-radius: 6px;
        background: rgba(10, 15, 29, 0.82);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        font-family: var(--font-heading, sans-serif);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.04em;
      }
      .atlas-preview-body {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .atlas-preview-top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }
      .atlas-preview-name {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }
      .atlas-preview-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 0.74rem;
        font-weight: 600;
        border: 1px solid var(--border-glass, rgba(255,255,255,0.12));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-primary, #f8fafc);
      }
      .atlas-preview-badge.is-visited {
        background: rgba(16, 185, 129, 0.18);
        border-color: rgba(16, 185, 129, 0.45);
        color: #34d399;
      }
      .atlas-preview-badge.is-unvisited {
        background: rgba(100, 116, 139, 0.2);
        border-color: rgba(148, 163, 184, 0.35);
        color: #cbd5e1;
      }
      .atlas-preview-badge.is-fav {
        background: rgba(245, 158, 11, 0.18);
        border-color: rgba(245, 158, 11, 0.5);
        color: #fbbf24;
      }
      .atlas-preview-badge.is-route {
        background: rgba(0, 242, 254, 0.16);
        border-color: rgba(0, 242, 254, 0.45);
        color: #00f2fe;
      }
      .atlas-preview-meta {
        font-size: 0.84rem;
        color: var(--text-secondary, #94a3b8);
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .atlas-preview-quote {
        font-size: 0.85rem;
        font-style: italic;
        color: var(--text-primary, #e2e8f0);
        opacity: 0.9;
        line-height: 1.45;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .atlas-preview-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
      }
      .atlas-preview-hint {
        font-size: 0.72rem;
        color: var(--text-muted, #64748b);
      }
      [data-theme="light"] .atlas-stage {
        background:
          radial-gradient(ellipse at 50% 45%, rgba(14, 165, 233, 0.10) 0%, rgba(241, 245, 249, 0.92) 72%),
          var(--bg-card, #ffffff);
      }
      [data-theme="light"] .atlas-node-label {
        fill: #0f172a;
        stroke: rgba(255, 255, 255, 0.92);
      }
      [data-theme="light"] .atlas-grid-label {
        fill: rgba(71, 85, 105, 0.75);
      }
      [data-theme="light"] .atlas-sea-label {
        fill: rgba(2, 132, 199, 0.25);
      }
      [data-theme="light"] .atlas-kpi-chip,
      [data-theme="light"] .atlas-legend-item,
      [data-theme="light"] .atlas-preview-badge {
        background: rgba(241, 245, 249, 0.85);
        color: #1e293b;
      }
      @media (max-width: 820px) {
        .atlas-preview-card {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .atlas-preview-thumb-wrap {
          width: 100%;
          height: 150px;
        }
        .atlas-preview-actions {
          align-items: stretch;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function render(container, ctx) {
    if (!container) return;
    injectFallbackStyles();

    const safeCtx = ctx || {};
    const data = safeCtx.data || (typeof window.TRAVEL_DATA !== 'undefined' ? window.TRAVEL_DATA : null);
    const state = safeCtx.state || {};
    const escapeHtml = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : defaultEscapeHtml;
    const selectCity = typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};
    const showToast = typeof safeCtx.showToast === 'function' ? safeCtx.showToast : function () {};

    if (!data || !data.provinces) {
      container.innerHTML = `
        <div class="glass-card" style="padding: 28px; text-align: center;">
          <h3>🗺️ 81 İl Vektör Haritası</h3>
          <p style="margin-top: 8px; color: var(--text-secondary);">Harita verisi yüklenemedi.</p>
        </div>
      `;
      return;
    }

    const regions = data.regions || {};
    const favorites = state.favorites || new Set();

    // Build normalized province entries with projected SVG coordinates
    const entries = Object.keys(data.provinces)
      .map((key) => {
        const p = data.provinces[key];
        const pt = project(Number(p.lat) || 39.0, Number(p.lng) || 35.0);
        const reg = regions[p.region_code] || {};
        return {
          key,
          province: p,
          x: pt.x,
          y: pt.y,
          regionColor: reg.color || '#38bdf8',
          regionName: reg.name || p.region || '',
          regionIcon: reg.icon || '📍',
          fav: isFavorite(favorites, key)
        };
      })
      .sort((a, b) => (a.province.plate || 0) - (b.province.plate || 0));

    const byKey = new Map(entries.map((e) => [e.key, e]));
    const byNormName = new Map(entries.map((e) => [normalizeTurkish(e.province.name), e]));

    // Resolve Active Expedition Route
    const rawRouteNames = (Array.isArray(state.customRouteCities) && state.customRouteCities.length > 0)
      ? state.customRouteCities
      : (Array.isArray(data.custom_route) && data.custom_route.length > 0 ? data.custom_route : DEFAULT_ROUTE);

    const routeStops = rawRouteNames
      .map((name) => byNormName.get(normalizeTurkish(name)))
      .filter(Boolean);

    const routeOrderByKey = new Map();
    routeStops.forEach((entry, idx) => {
      if (!routeOrderByKey.has(entry.key)) {
        routeOrderByKey.set(entry.key, idx + 1);
      }
    });

    let routeTotalKm = 0;
    for (let i = 1; i < routeStops.length; i++) {
      const a = routeStops[i - 1].province;
      const b = routeStops[i].province;
      routeTotalKm += haversineKm(a.lat, a.lng, b.lat, b.lng) * ROAD_FACTOR;
    }

    const visitedCount = entries.filter((e) => e.province.visited).length;
    const favCount = entries.filter((e) => e.fav).length;

    // Pick initial preview city if none selected yet
    if (!uiState.hoveredKey || !byKey.has(uiState.hoveredKey)) {
      const ankara = byNormName.get('ankara');
      uiState.hoveredKey = (routeStops[0] && routeStops[0].key) || (ankara && ankara.key) || (entries[0] && entries[0].key);
    }

    // Precompute SVG static geometry
    const thracePath = buildPolygonPath(THRACE_COAST);
    const anatoliaPath = buildPolygonPath(ANATOLIA_COAST);
    const lakeVanPath = buildPolygonPath(LAKE_VAN);
    const lakeTuzPath = buildPolygonPath(LAKE_TUZ);

    const latTicks = [36, 38, 40, 42];
    const lngTicks = [28, 32, 36, 40, 44];

    const gridLinesSvg = [
      ...latTicks.map((lat) => {
        const p1 = project(lat, BOUNDS.minLng);
        const p2 = project(lat, BOUNDS.maxLng);
        return `
          <line class="atlas-grid-line" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" />
          <text class="atlas-grid-label" x="${PAD_X - 28}" y="${p1.y + 3}">${lat}°N</text>
        `;
      }),
      ...lngTicks.map((lng) => {
        const p1 = project(BOUNDS.maxLat, lng);
        const p2 = project(BOUNDS.minLat, lng);
        return `
          <line class="atlas-grid-line" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" />
          <text class="atlas-grid-label" x="${p2.x - 10}" y="${VIEW_H - 8}">${lng}°E</text>
        `;
      })
    ].join('');

    const seaLabels = [
      { text: 'KARADENİZ', lat: 42.08, lng: 35.8 },
      { text: 'EGE DENİZİ', lat: 38.4, lng: 25.95 },
      { text: 'AKDENİZ', lat: 35.85, lng: 31.6 }
    ].map((s) => {
      const p = project(s.lat, s.lng);
      return `<text class="atlas-sea-label" x="${p.x}" y="${p.y}" text-anchor="middle">${s.text}</text>`;
    }).join('');

    function buildRouteLayerSvg() {
      if (uiState.mode !== 'route' || routeStops.length < 2) return '';
      const pts = routeStops.map((s) => `${s.x},${s.y}`).join(' ');
      const start = routeStops[0];
      const end = routeStops[routeStops.length - 1];
      return `
        <g class="atlas-route-layer">
          <polyline class="atlas-route-glow" points="${pts}" />
          <polyline class="atlas-route-line" points="${pts}" />
          <circle class="atlas-beacon" cx="${start.x}" cy="${start.y}" r="12" fill="none" stroke="#10b981" stroke-width="2" />
          <circle class="atlas-beacon" cx="${end.x}" cy="${end.y}" r="12" fill="none" stroke="#00f2fe" stroke-width="2" />
        </g>
      `;
    }

    function buildNodesSvg() {
      const mode = uiState.mode;
      const regFilter = uiState.activeRegionFilter;

      return entries.map((entry) => {
        const p = entry.province;
        const routeIdx = routeOrderByKey.get(entry.key) || 0;
        const isRouteStop = routeIdx > 0;
        const isFocused = uiState.hoveredKey === entry.key;

        let fill = '#64748b';
        let stroke = 'rgba(226, 232, 240, 0.55)';
        let radius = 5.4;
        let opacity = 1;
        let filterAttr = '';
        let extraRings = '';

        if (mode === 'status') {
          if (p.visited) {
            fill = '#10b981';
            stroke = '#a7f3d0';
            radius = 6.2;
            filterAttr = ' filter="url(#atlasEmeraldGlow)"';
          } else {
            fill = '#475569';
            stroke = '#94a3b8';
            radius = 4.9;
          }
          if (entry.fav) {
            extraRings += `<circle cx="${entry.x}" cy="${entry.y}" r="${radius + 3.6}" fill="none" stroke="#f59e0b" stroke-width="2.1" filter="url(#atlasGoldGlow)" />`;
          }
        } else if (mode === 'regions') {
          fill = entry.regionColor;
          stroke = p.visited ? '#ffffff' : 'rgba(15, 23, 42, 0.75)';
          radius = p.visited ? 6.2 : 5.0;
          if (regFilter !== 'all' && p.region_code !== regFilter) {
            opacity = 0.22;
          } else if (p.visited) {
            filterAttr = ' filter="url(#atlasSoftGlow)"';
          }
          if (entry.fav) {
            extraRings += `<circle cx="${entry.x}" cy="${entry.y}" r="${radius + 3.4}" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="3 2" />`;
          }
        } else if (mode === 'route') {
          if (isRouteStop) {
            fill = routeIdx === 1 ? '#10b981' : (routeIdx === routeStops.length ? '#f59e0b' : '#00f2fe');
            stroke = '#ffffff';
            radius = 7.4;
            filterAttr = ' filter="url(#atlasCyanGlow)"';
          } else {
            fill = p.visited ? '#10b981' : '#475569';
            stroke = 'rgba(148, 163, 184, 0.45)';
            radius = 4.4;
            opacity = 0.36;
          }
        }

        const routeBadgeSvg = (mode === 'route' && isRouteStop)
          ? `
            <g class="atlas-route-badge" transform="translate(${entry.x}, ${entry.y - 14})">
              <circle class="atlas-route-badge-bg" cx="0" cy="0" r="7.5" />
              <text class="atlas-route-badge-text" x="0" y="0.5">${routeIdx}</text>
            </g>
          `
          : '';

        const labelY = (mode === 'route' && isRouteStop) ? (entry.y + 17) : (entry.y - 10);
        const statusLabel = p.visited ? 'Keşfedildi' : 'Sırada';
        const ariaLabel = `${p.name} (${formatPlate(p.plate)}) - ${entry.regionName} - ${statusLabel}`;

        return `
          <g class="atlas-node${isFocused ? ' is-focused' : ''}${isRouteStop && mode === 'route' ? ' is-route-stop' : ''}"
             data-city-key="${escapeHtml(entry.key)}"
             tabindex="0"
             role="button"
             aria-label="${escapeHtml(ariaLabel)}"
             style="opacity:${opacity}">
            <circle cx="${entry.x}" cy="${entry.y}" r="11" fill="transparent" />
            ${extraRings}
            <circle class="atlas-node-core" cx="${entry.x}" cy="${entry.y}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"${filterAttr} />
            ${routeBadgeSvg}
            <text class="atlas-node-label" x="${entry.x}" y="${labelY}" text-anchor="middle">${escapeHtml(p.name)}</text>
          </g>
        `;
      }).join('');
    }

    function buildSubbarHtml() {
      if (uiState.mode === 'status') {
        return `
          <div class="atlas-legend">
            <span class="atlas-legend-item"><span class="atlas-dot" style="background:#10b981; box-shadow:0 0 8px #10b981;"></span> Keşfedilen (${visitedCount})</span>
            <span class="atlas-legend-item"><span class="atlas-dot" style="background:#475569; border:1px solid #94a3b8;"></span> Sırada (${entries.length - visitedCount})</span>
            <span class="atlas-legend-item"><span class="atlas-dot" style="background:transparent; border:2px solid #f59e0b; box-shadow:0 0 6px #f59e0b;"></span> Favori Halkası (${favCount})</span>
          </div>
          <span>🖱️ İllere tıklayarak detay sayfasına gidin</span>
        `;
      }

      if (uiState.mode === 'regions') {
        const regPills = Object.keys(regions).map((code) => {
          const r = regions[code];
          const active = uiState.activeRegionFilter === code;
          return `
            <button type="button" class="atlas-legend-item is-clickable${active ? ' is-active' : ''}" data-atlas-region="${escapeHtml(code)}">
              <span class="atlas-dot" style="background:${escapeHtml(r.color || '#38bdf8')};"></span>
              ${escapeHtml(r.icon || '')} ${escapeHtml((r.name || code).replace(' Bölgesi', ''))}
            </button>
          `;
        }).join('');

        return `
          <div class="atlas-legend">
            <button type="button" class="atlas-legend-item is-clickable${uiState.activeRegionFilter === 'all' ? ' is-active' : ''}" data-atlas-region="all">
              🌍 Tümü (81)
            </button>
            ${regPills}
          </div>
        `;
      }

      const routeChain = routeStops.map((s) => escapeHtml(s.province.name)).join(' → ');
      return `
        <div class="atlas-legend">
          <span class="atlas-legend-item"><span class="atlas-dot" style="background:#10b981;"></span> Başlangıç</span>
          <span class="atlas-legend-item"><span class="atlas-dot" style="background:#00f2fe; box-shadow:0 0 8px #00f2fe;"></span> Sefer Durağı (${routeStops.length} İl)</span>
          <span class="atlas-legend-item"><span class="atlas-dot" style="background:#f59e0b;"></span> Varış</span>
          <span class="atlas-legend-item">🛣️ ~${Math.round(routeTotalKm).toLocaleString('tr-TR')} km</span>
        </div>
        <span style="font-size:0.76rem; color: var(--accent-cyan, #00f2fe);">${routeChain}</span>
      `;
    }

    function buildPreviewCardHtml(key) {
      const entry = byKey.get(key) || entries[0];
      if (!entry) return '';
      const p = entry.province;
      const imgSrc = p.banner_rel || (Array.isArray(p.images) && p.images[0]) || '';
      const topLandmark = (Array.isArray(p.landmarks) && p.landmarks[0]) ? p.landmarks[0] : 'Anadolu Kültür Mirası';
      const topSpecialty = (Array.isArray(p.specialties) && p.specialties[0]) ? p.specialties[0] : '';
      const quoteText = p.custom_quote || p.quote || 'Anadolu’nun kadim topraklarında yeni bir keşif durağı.';
      const routeIdx = routeOrderByKey.get(entry.key) || 0;

      return `
        <div class="atlas-preview-thumb-wrap">
          ${imgSrc
            ? `<img class="atlas-preview-thumb" src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.style.display='none'" />`
            : ''}
          <span class="atlas-preview-plate">${formatPlate(p.plate)}</span>
        </div>
        <div class="atlas-preview-body">
          <div class="atlas-preview-top">
            <h3 class="atlas-preview-name">${escapeHtml(p.name)}</h3>
            <span class="atlas-preview-badge" style="border-color:${escapeHtml(entry.regionColor)}66;">
              ${escapeHtml(entry.regionIcon)} ${escapeHtml(entry.regionName)}
            </span>
            <span class="atlas-preview-badge ${p.visited ? 'is-visited' : 'is-unvisited'}">
              ${p.visited ? '✅ Keşfedildi' : '🧭 Sırada'}
            </span>
            ${entry.fav ? '<span class="atlas-preview-badge is-fav">⭐ Favori</span>' : ''}
            ${routeIdx > 0 ? `<span class="atlas-preview-badge is-route">🎯 Sefer Durağı #${routeIdx}</span>` : ''}
          </div>
          <div class="atlas-preview-meta">
            <span>🏛️ <strong>Öne Çıkan:</strong> ${escapeHtml(topLandmark)}</span>
            ${topSpecialty ? `<span>🍽️ ${escapeHtml(topSpecialty)}</span>` : ''}
            <span>📍 ${Number(p.lat).toFixed(2)}°N, ${Number(p.lng).toFixed(2)}°E</span>
          </div>
          <p class="atlas-preview-quote">“${escapeHtml(quoteText)}”</p>
        </div>
        <div class="atlas-preview-actions">
          <button type="button" class="btn btn-primary" data-atlas-open="${escapeHtml(entry.key)}">
            Şehri İncele →
          </button>
          <span class="atlas-preview-hint">Haritadaki bir ile tıklayın</span>
        </div>
      `;
    }

    // Build full module shell
    container.innerHTML = `
      <section class="atlas-module" aria-label="81 İl Vektör Keşif Haritası">
        <header class="glass-card atlas-header-bar">
          <div class="atlas-title-wrap">
            <h2>🗺️ 81 İl Vektör Keşif Haritası</h2>
            <p>Anadolu coğrafyasında keşif durumu, 7 bölge dağılımı ve aktif sefer rotası</p>
          </div>
          <div class="atlas-kpi-row">
            <span class="atlas-kpi-chip">✅ ${visitedCount} / ${entries.length} İl</span>
            <span class="atlas-kpi-chip">⭐ ${favCount} Favori</span>
            <span class="atlas-kpi-chip">🎯 ${routeStops.length} Sefer Durağı</span>
          </div>
        </header>

        <div class="glass-card atlas-toolbar">
          <div class="atlas-mode-pills" role="tablist" aria-label="Harita Katman Modu">
            <button type="button" class="filter-pill${uiState.mode === 'status' ? ' active' : ''}" data-atlas-mode="status" role="tab" aria-selected="${uiState.mode === 'status'}">
              ✅ Keşif Durumu
            </button>
            <button type="button" class="filter-pill${uiState.mode === 'regions' ? ' active' : ''}" data-atlas-mode="regions" role="tab" aria-selected="${uiState.mode === 'regions'}">
              🎨 7 Coğrafi Bölge
            </button>
            <button type="button" class="filter-pill${uiState.mode === 'route' ? ' active' : ''}" data-atlas-mode="route" role="tab" aria-selected="${uiState.mode === 'route'}">
              🎯 Aktif Sefer Rotası
            </button>
          </div>

          <div class="atlas-controls" aria-label="Harita Kontrolleri">
            <button type="button" class="btn btn-outline atlas-ctrl-btn" id="atlas-zoom-in" title="Yakınlaştır">+</button>
            <button type="button" class="btn btn-outline atlas-ctrl-btn" id="atlas-zoom-out" title="Uzaklaştır">−</button>
            <button type="button" class="btn btn-outline atlas-ctrl-btn" id="atlas-zoom-reset" title="Görünümü Sıfırla">↺</button>
            <span class="atlas-zoom-badge" id="atlas-zoom-readout">${Math.round(uiState.zoom * 100)}%</span>
            <button type="button" class="btn btn-outline atlas-ctrl-btn${uiState.showLabels ? ' is-active' : ''}" id="atlas-toggle-labels" aria-pressed="${uiState.showLabels}">
              🏷️ İsimler
            </button>
          </div>
        </div>

        <div class="glass-card atlas-subbar" id="atlas-subbar">
          ${buildSubbarHtml()}
        </div>

        <div class="glass-card atlas-stage${uiState.zoom > 1 ? ' is-pannable' : ''}" id="atlas-stage">
          <svg class="atlas-svg${uiState.showLabels ? ' atlas-labels-visible' : ''}"
               id="atlas-svg"
               viewBox="0 0 ${VIEW_W} ${VIEW_H}"
               xmlns="http://www.w3.org/2000/svg"
               role="img"
               aria-label="Türkiye 81 İl İnteraktif Vektör Haritası">
            <defs>
              <linearGradient id="atlasLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e293b" stop-opacity="0.92" />
                <stop offset="50%" stop-color="#0f172a" stop-opacity="0.96" />
                <stop offset="100%" stop-color="#172554" stop-opacity="0.88" />
              </linearGradient>
              <filter id="atlasLandGlow" x="-8%" y="-8%" width="116%" height="116%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#00f2fe" flood-opacity="0.16" />
              </filter>
              <filter id="atlasEmeraldGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="atlasCyanGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="atlasGoldGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="1.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="atlasSoftGlow" x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g id="atlas-viewport" transform="translate(${uiState.tx}, ${uiState.ty}) scale(${uiState.zoom})">
              <g class="atlas-grid-layer" aria-hidden="true">
                ${gridLinesSvg}
                ${seaLabels}
              </g>
              <g class="atlas-land-layer" aria-hidden="true">
                <path class="atlas-landmass" d="${thracePath}" />
                <path class="atlas-landmass" d="${anatoliaPath}" />
                <path class="atlas-lake" d="${lakeVanPath}" />
                <path class="atlas-lake" d="${lakeTuzPath}" />
              </g>
              <g id="atlas-dynamic-layer">
                ${buildRouteLayerSvg()}
                ${buildNodesSvg()}
              </g>
            </g>

            <!-- Stylized Compass Rose -->
            <g transform="translate(954, 48)" opacity="0.55" aria-hidden="true">
              <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(0,242,254,0.45)" stroke-width="1" />
              <polygon points="0,-13 3.5,0 0,-3 -3.5,0" fill="#00f2fe" />
              <polygon points="0,13 3.5,0 0,3 -3.5,0" fill="#64748b" />
              <text x="0" y="-19" text-anchor="middle" fill="#00f2fe" font-size="8" font-weight="700">K</text>
            </g>
          </svg>
        </div>

        <article class="glass-card atlas-preview-card" id="atlas-preview-card" aria-live="polite">
          ${buildPreviewCardHtml(uiState.hoveredKey)}
        </article>
      </section>
    `;

    // Bind interactive DOM elements
    const svgEl = container.querySelector('#atlas-svg');
    const stageEl = container.querySelector('#atlas-stage');
    const viewportEl = container.querySelector('#atlas-viewport');
    const dynamicLayerEl = container.querySelector('#atlas-dynamic-layer');
    const subbarEl = container.querySelector('#atlas-subbar');
    const previewCardEl = container.querySelector('#atlas-preview-card');
    const zoomReadoutEl = container.querySelector('#atlas-zoom-readout');
    const btnZoomIn = container.querySelector('#atlas-zoom-in');
    const btnZoomOut = container.querySelector('#atlas-zoom-out');
    const btnZoomReset = container.querySelector('#atlas-zoom-reset');
    const btnToggleLabels = container.querySelector('#atlas-toggle-labels');
    const modeBtns = container.querySelectorAll('[data-atlas-mode]');

    function clampPan(tx, ty, zoom) {
      if (zoom <= 1) return { tx: 0, ty: 0 };
      const maxX = VIEW_W * (zoom - 1) * 0.65;
      const maxY = VIEW_H * (zoom - 1) * 0.65;
      return {
        tx: Math.max(-maxX, Math.min(maxX, tx)),
        ty: Math.max(-maxY, Math.min(maxY, ty))
      };
    }

    function applyTransform() {
      const clamped = clampPan(uiState.tx, uiState.ty, uiState.zoom);
      uiState.tx = clamped.tx;
      uiState.ty = clamped.ty;
      if (viewportEl) {
        viewportEl.setAttribute('transform', `translate(${uiState.tx.toFixed(1)}, ${uiState.ty.toFixed(1)}) scale(${uiState.zoom.toFixed(3)})`);
      }
      if (zoomReadoutEl) {
        zoomReadoutEl.textContent = `${Math.round(uiState.zoom * 100)}%`;
      }
      if (stageEl) {
        stageEl.classList.toggle('is-pannable', uiState.zoom > 1);
      }
    }

    function zoomAroundCenter(nextZoom) {
      const targetZoom = Math.max(1, Math.min(3.5, Math.round(nextZoom * 100) / 100));
      const cx = VIEW_W / 2;
      const cy = VIEW_H / 2;
      const ratio = targetZoom / uiState.zoom;
      uiState.tx = cx - (cx - uiState.tx) * ratio;
      uiState.ty = cy - (cy - uiState.ty) * ratio;
      uiState.zoom = targetZoom;
      if (uiState.zoom === 1) {
        uiState.tx = 0;
        uiState.ty = 0;
      }
      applyTransform();
    }

    function updatePreview(key) {
      if (!key || !byKey.has(key) || !previewCardEl) return;
      uiState.hoveredKey = key;
      previewCardEl.innerHTML = buildPreviewCardHtml(key);
      const prevFocused = dynamicLayerEl && dynamicLayerEl.querySelector('.atlas-node.is-focused');
      if (prevFocused) prevFocused.classList.remove('is-focused');
      const nextNode = dynamicLayerEl && dynamicLayerEl.querySelector(`.atlas-node[data-city-key="${CSS.escape ? CSS.escape(key) : key}"]`);
      if (nextNode) nextNode.classList.add('is-focused');
    }

    function refreshDynamicLayer() {
      if (dynamicLayerEl) {
        dynamicLayerEl.innerHTML = buildRouteLayerSvg() + buildNodesSvg();
      }
      if (subbarEl) {
        subbarEl.innerHTML = buildSubbarHtml();
      }
    }

    // Mode pill switching
    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextMode = btn.getAttribute('data-atlas-mode');
        if (!nextMode || nextMode === uiState.mode) return;
        uiState.mode = nextMode;
        if (nextMode !== 'regions') {
          uiState.activeRegionFilter = 'all';
        }
        modeBtns.forEach((b) => {
          const isActive = b === btn;
          b.classList.toggle('active', isActive);
          b.setAttribute('aria-selected', String(isActive));
        });
        refreshDynamicLayer();
      });
    });

    // Region legend filter delegation
    if (subbarEl) {
      subbarEl.addEventListener('click', (e) => {
        const regBtn = e.target.closest('[data-atlas-region]');
        if (!regBtn) return;
        const code = regBtn.getAttribute('data-atlas-region');
        uiState.activeRegionFilter = (uiState.activeRegionFilter === code && code !== 'all') ? 'all' : code;
        refreshDynamicLayer();
      });
    }

    // Zoom & Label Controls
    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => zoomAroundCenter(uiState.zoom + 0.35));
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => zoomAroundCenter(uiState.zoom - 0.35));
    }
    if (btnZoomReset) {
      btnZoomReset.addEventListener('click', () => {
        uiState.zoom = 1;
        uiState.tx = 0;
        uiState.ty = 0;
        uiState.activeRegionFilter = 'all';
        applyTransform();
        if (uiState.mode === 'regions') refreshDynamicLayer();
        showToast('↺ Harita görünümü sıfırlandı');
      });
    }
    if (btnToggleLabels) {
      btnToggleLabels.addEventListener('click', () => {
        uiState.showLabels = !uiState.showLabels;
        btnToggleLabels.classList.toggle('is-active', uiState.showLabels);
        btnToggleLabels.setAttribute('aria-pressed', String(uiState.showLabels));
        if (svgEl) {
          svgEl.classList.toggle('atlas-labels-visible', uiState.showLabels);
        }
      });
    }

    // Preview card "Şehri İncele" button
    if (previewCardEl) {
      previewCardEl.addEventListener('click', (e) => {
        const openBtn = e.target.closest('[data-atlas-open]');
        if (!openBtn) return;
        const key = openBtn.getAttribute('data-atlas-open');
        if (key) selectCity(key);
      });
    }

    // Province node hover, focus, click, keyboard navigation
    let didDrag = false;

    if (dynamicLayerEl) {
      dynamicLayerEl.addEventListener('mouseover', (e) => {
        const node = e.target.closest('.atlas-node');
        if (!node) return;
        const key = node.getAttribute('data-city-key');
        if (key && key !== uiState.hoveredKey) {
          updatePreview(key);
        }
      });

      dynamicLayerEl.addEventListener('focusin', (e) => {
        const node = e.target.closest('.atlas-node');
        if (!node) return;
        const key = node.getAttribute('data-city-key');
        if (key) updatePreview(key);
      });

      dynamicLayerEl.addEventListener('click', (e) => {
        if (didDrag) return;
        const node = e.target.closest('.atlas-node');
        if (!node) return;
        const key = node.getAttribute('data-city-key');
        if (key) selectCity(key);
      });

      dynamicLayerEl.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const node = e.target.closest('.atlas-node');
        if (!node) return;
        e.preventDefault();
        const key = node.getAttribute('data-city-key');
        if (key) selectCity(key);
      });
    }

    // Drag-to-pan when zoomed in
    if (stageEl && svgEl) {
      let dragging = false;
      let startClientX = 0;
      let startClientY = 0;
      let startTx = 0;
      let startTy = 0;

      stageEl.addEventListener('pointerdown', (e) => {
        if (uiState.zoom <= 1 || e.button !== 0) return;
        dragging = true;
        didDrag = false;
        startClientX = e.clientX;
        startClientY = e.clientY;
        startTx = uiState.tx;
        startTy = uiState.ty;
        stageEl.classList.add('is-panning');
      });

      stageEl.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dxScreen = e.clientX - startClientX;
        const dyScreen = e.clientY - startClientY;
        if (Math.abs(dxScreen) > 4 || Math.abs(dyScreen) > 4) {
          didDrag = true;
        }
        const rect = svgEl.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const scaleX = VIEW_W / rect.width;
        const scaleY = VIEW_H / rect.height;
        uiState.tx = startTx + dxScreen * scaleX;
        uiState.ty = startTy + dyScreen * scaleY;
        applyTransform();
      });

      const endDrag = () => {
        if (!dragging) return;
        dragging = false;
        stageEl.classList.remove('is-panning');
        setTimeout(() => { didDrag = false; }, 30);
      };

      stageEl.addEventListener('pointerup', endDrag);
      stageEl.addEventListener('pointercancel', endDrag);
      stageEl.addEventListener('pointerleave', endDrag);

      // Ctrl + Wheel zoom support
      stageEl.addEventListener('wheel', (e) => {
        if (!e.ctrlKey && uiState.zoom <= 1) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        zoomAroundCenter(uiState.zoom + delta);
      }, { passive: false });
    }
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.atlas = { render };
})();
