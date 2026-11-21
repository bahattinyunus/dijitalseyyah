/**
 * Anadolu Seyahatnamesi — ⚡ 81 İl Hızlı Önizleme (Quick-Look Peek) & Anlık Bakış
 * Power-user enhancer:
 *  - Injects subtle 👁️ quick-peek buttons on .city-item rows in #cities-list
 *  - Event delegation on #cities-list + Shift+Click on any .city-item or [data-city-key] anywhere
 *  - Opens sleek centered glassmorphic Quick-Peek Modal (#seyyah-quick-peek-modal) in 0ms
 *    without leaving the current studio view
 *
 * Registers on: window.SEYYAH_MODULES.quickPeek = { init(ctx), open(cityKey) }
 */
(function () {
  'use strict';

  const STYLE_ID = 'seyyah-quick-peek-styles';
  const MODAL_ID = 'seyyah-quick-peek-modal';
  const PEEK_BTN_CLASS = 'sqp-peek-btn';
  const ROAD_FACTOR = 1.35;
  const ANKARA_FALLBACK = { lat: 39.9334, lng: 32.8597 };

  let activeCtx = null;
  let currentCityKey = null;
  let lastFocusedEl = null;
  let isOpen = false;
  let listObserver = null;
  let observedListEl = null;
  let docListenersBound = false;
  let modalListenersBound = false;

  // ---------------------------------------------------------------------------
  // Safe Fallbacks & Data Helpers
  // ---------------------------------------------------------------------------
  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  function fallbackShowToast(msg) {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('toast-container');
    if (!container) return;
    const item = document.createElement('div');
    item.className = 'toast-item';
    item.textContent = msg;
    container.appendChild(item);
    setTimeout(function () {
      item.style.opacity = '0';
      item.style.transition = 'opacity 0.25s ease';
      setTimeout(function () {
        if (item.parentNode) item.parentNode.removeChild(item);
      }, 260);
    }, 2400);
  }

  function getTravelData() {
    if (activeCtx && activeCtx.data && activeCtx.data.provinces) return activeCtx.data;
    if (activeCtx && activeCtx.state && activeCtx.state.data && activeCtx.state.data.provinces) {
      return activeCtx.state.data;
    }
    if (typeof window !== 'undefined' && window.TRAVEL_DATA && window.TRAVEL_DATA.provinces) {
      return window.TRAVEL_DATA;
    }
    if (typeof TRAVEL_DATA !== 'undefined' && TRAVEL_DATA && TRAVEL_DATA.provinces) {
      return TRAVEL_DATA;
    }
    return null;
  }

  function getProvinces() {
    const data = getTravelData();
    return (data && data.provinces) || {};
  }

  function getRegions() {
    const data = getTravelData();
    return (data && data.regions) || {};
  }

  function esc(str) {
    if (activeCtx && typeof activeCtx.escapeHtml === 'function') {
      return activeCtx.escapeHtml(str);
    }
    return fallbackEscapeHtml(str);
  }

  function calcDistanceKm(lat1, lng1, lat2, lng2) {
    if (activeCtx && typeof activeCtx.calcDistKm === 'function') {
      return activeCtx.calcDistKm(lat1, lng1, lat2, lng2);
    }
    return haversineKm(lat1, lng1, lat2, lng2);
  }

  function notify(msg) {
    if (activeCtx && typeof activeCtx.showToast === 'function') {
      activeCtx.showToast(msg);
      return;
    }
    fallbackShowToast(msg);
  }

  function padPlate(plate) {
    const num = parseInt(plate, 10);
    if (!Number.isFinite(num)) return String(plate || '--');
    return String(num).padStart(2, '0');
  }

  function resolveAnkaraCoords(provinces) {
    if (provinces['04_IcAnadolu/Ankara']) {
      const a = provinces['04_IcAnadolu/Ankara'];
      if (Number.isFinite(Number(a.lat)) && Number.isFinite(Number(a.lng))) {
        return { lat: Number(a.lat), lng: Number(a.lng) };
      }
    }
    const keys = Object.keys(provinces);
    for (let i = 0; i < keys.length; i += 1) {
      const p = provinces[keys[i]];
      if (p && (Number(p.plate) === 6 || p.name === 'Ankara')) {
        if (Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng))) {
          return { lat: Number(p.lat), lng: Number(p.lng) };
        }
      }
    }
    return ANKARA_FALLBACK;
  }

  function formatAnkaraDistance(province, provinces) {
    if (!province) return 'Bilinmiyor';
    if (Number(province.plate) === 6 || province.name === 'Ankara') {
      return '0 km (Başkent / Merkez)';
    }
    const lat = Number(province.lat);
    const lng = Number(province.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return 'Koordinat bekleniyor';
    }
    const ank = resolveAnkaraCoords(provinces);
    const airKm = Math.round(calcDistanceKm(ank.lat, ank.lng, lat, lng));
    const roadKm = Math.round(airKm * ROAD_FACTOR);
    return `~${roadKm.toLocaleString('tr-TR')} km karayolu (${airKm.toLocaleString('tr-TR')} km kuş uçuşu)`;
  }

  function resolveCityImages(province) {
    const arr = Array.isArray(province.images) ? province.images : [];
    const bannerSrc =
      province.has_banner && province.banner_rel
        ? province.banner_rel
        : arr[0] || 'assets/banner.jpg';
    const gallerySrc =
      province.has_gallery && province.gallery_rel
        ? province.gallery_rel
        : arr[1] || bannerSrc;
    return { bannerSrc, gallerySrc };
  }

  // ---------------------------------------------------------------------------
  // Scoped Styles (Dark & body.light-theme compatible)
  // ---------------------------------------------------------------------------
  function ensureStyles() {
    if (typeof document === 'undefined' || !document.head) return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Sidebar .city-item Quick-Peek Eye Button */
      .${PEEK_BTN_CLASS} {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 24px;
        padding: 0;
        border-radius: 7px;
        border: 1px solid rgba(148, 163, 184, 0.25);
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.8rem;
        line-height: 1;
        cursor: pointer;
        flex-shrink: 0;
        opacity: 0.72;
        transition: opacity 0.16s ease, transform 0.16s ease, border-color 0.16s ease, background 0.16s ease, color 0.16s ease, box-shadow 0.16s ease;
      }

      .city-item:hover .${PEEK_BTN_CLASS},
      .${PEEK_BTN_CLASS}:focus-visible {
        opacity: 1;
      }

      .${PEEK_BTN_CLASS}:hover,
      .${PEEK_BTN_CLASS}:focus-visible {
        outline: none;
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.16);
        color: var(--accent-cyan, #00f2fe);
        transform: scale(1.08);
        box-shadow: 0 0 12px rgba(0, 242, 254, 0.28);
      }

      body.light-theme .${PEEK_BTN_CLASS} {
        background: rgba(255, 255, 255, 0.88);
        border-color: rgba(15, 23, 42, 0.14);
        color: #475569;
      }

      body.light-theme .${PEEK_BTN_CLASS}:hover,
      body.light-theme .${PEEK_BTN_CLASS}:focus-visible {
        background: rgba(2, 132, 199, 0.12);
        border-color: var(--accent-cyan, #0284c7);
        color: var(--accent-cyan, #0284c7);
        box-shadow: 0 0 10px rgba(2, 132, 199, 0.18);
      }

      /* Centered Glassmorphic Quick-Peek Modal */
      #${MODAL_ID} {
        position: fixed;
        inset: 0;
        z-index: 2600;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 18px;
      }

      #${MODAL_ID}.is-open {
        display: flex;
      }

      #${MODAL_ID} .sqp-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(5, 10, 22, 0.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      body.light-theme #${MODAL_ID} .sqp-backdrop {
        background: rgba(15, 23, 42, 0.42);
      }

      #${MODAL_ID} .sqp-dialog {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 840px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 20px;
        background: linear-gradient(155deg, rgba(15, 23, 42, 0.94) 0%, rgba(17, 28, 52, 0.9) 100%);
        backdrop-filter: blur(22px);
        -webkit-backdrop-filter: blur(22px);
        border: 1px solid rgba(0, 242, 254, 0.28);
        box-shadow:
          0 28px 80px rgba(0, 0, 0, 0.72),
          0 0 36px rgba(0, 242, 254, 0.14),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
      }

      body.light-theme #${MODAL_ID} .sqp-dialog {
        background: linear-gradient(155deg, rgba(255, 255, 255, 0.96) 0%, rgba(241, 245, 249, 0.95) 100%);
        border-color: rgba(2, 132, 199, 0.28);
        box-shadow:
          0 24px 64px rgba(15, 23, 42, 0.22),
          0 0 28px rgba(2, 132, 199, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.9);
        color: #0f172a;
      }

      /* Header */
      #${MODAL_ID} .sqp-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        padding: 18px 22px 14px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: radial-gradient(circle at top left, rgba(0, 242, 254, 0.1), transparent 60%);
      }

      body.light-theme #${MODAL_ID} .sqp-header {
        border-bottom-color: rgba(15, 23, 42, 0.1);
        background: radial-gradient(circle at top left, rgba(2, 132, 199, 0.08), transparent 60%);
      }

      #${MODAL_ID} .sqp-header-left {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }

      #${MODAL_ID} .sqp-kicker-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      #${MODAL_ID} .sqp-kicker {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.7px;
        text-transform: uppercase;
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.28);
        padding: 2px 9px;
        border-radius: 9999px;
      }

      body.light-theme #${MODAL_ID} .sqp-kicker {
        color: #0284c7;
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.25);
      }

      #${MODAL_ID} .sqp-title-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
      }

      #${MODAL_ID} .sqp-plate-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 38px;
        height: 32px;
        padding: 0 9px;
        border-radius: 9px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.95rem;
        font-weight: 800;
        letter-spacing: 0.5px;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.22), rgba(79, 172, 254, 0.16));
        border: 1px solid rgba(0, 242, 254, 0.42);
        color: #e0f2fe;
      }

      body.light-theme #${MODAL_ID} .sqp-plate-badge {
        background: linear-gradient(135deg, #e0f2fe, #dbeafe);
        border-color: rgba(2, 132, 199, 0.4);
        color: #0369a1;
      }

      #${MODAL_ID} .sqp-title {
        margin: 0;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.48rem;
        font-weight: 800;
        line-height: 1.2;
        letter-spacing: -0.2px;
      }

      #${MODAL_ID} .sqp-region-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 11px;
        border-radius: 9999px;
        font-size: 0.78rem;
        font-weight: 600;
        background: rgba(148, 163, 184, 0.14);
        border: 1px solid rgba(148, 163, 184, 0.24);
        color: var(--text-secondary, #cbd5e1);
      }

      body.light-theme #${MODAL_ID} .sqp-region-pill {
        background: rgba(15, 23, 42, 0.06);
        border-color: rgba(15, 23, 42, 0.14);
        color: #334155;
      }

      #${MODAL_ID} .sqp-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 11px;
        border-radius: 9999px;
        font-size: 0.78rem;
        font-weight: 700;
      }

      #${MODAL_ID} .sqp-status-pill.is-visited {
        background: rgba(16, 185, 129, 0.18);
        border: 1px solid rgba(16, 185, 129, 0.45);
        color: #6ee7b7;
      }

      #${MODAL_ID} .sqp-status-pill.is-waiting {
        background: rgba(245, 158, 11, 0.16);
        border: 1px solid rgba(245, 158, 11, 0.42);
        color: #fcd34d;
      }

      body.light-theme #${MODAL_ID} .sqp-status-pill.is-visited {
        background: rgba(16, 185, 129, 0.14);
        border-color: rgba(5, 150, 105, 0.4);
        color: #047857;
      }

      body.light-theme #${MODAL_ID} .sqp-status-pill.is-waiting {
        background: rgba(245, 158, 11, 0.14);
        border-color: rgba(217, 119, 6, 0.4);
        color: #b45309;
      }

      #${MODAL_ID} .sqp-icon-close {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(30, 41, 59, 0.7);
        color: var(--text-secondary, #cbd5e1);
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.16s ease;
      }

      #${MODAL_ID} .sqp-icon-close:hover,
      #${MODAL_ID} .sqp-icon-close:focus-visible {
        outline: none;
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.14);
      }

      body.light-theme #${MODAL_ID} .sqp-icon-close {
        background: rgba(241, 245, 249, 0.9);
        border-color: rgba(15, 23, 42, 0.14);
        color: #334155;
      }

      /* Scrollable Body */
      #${MODAL_ID} .sqp-body {
        padding: 18px 22px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      /* Side-by-side banner.jpg & gallery.jpg */
      #${MODAL_ID} .sqp-media-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      #${MODAL_ID} .sqp-media-card {
        position: relative;
        border-radius: 14px;
        overflow: hidden;
        aspect-ratio: 16 / 9;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
      }

      body.light-theme #${MODAL_ID} .sqp-media-card {
        background: #e2e8f0;
        border-color: rgba(15, 23, 42, 0.12);
      }

      #${MODAL_ID} .sqp-media-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.35s ease;
      }

      #${MODAL_ID} .sqp-media-card:hover img {
        transform: scale(1.04);
      }

      #${MODAL_ID} .sqp-media-caption {
        position: absolute;
        left: 8px;
        bottom: 8px;
        padding: 3px 10px;
        border-radius: 9999px;
        font-size: 0.72rem;
        font-weight: 600;
        color: #f8fafc;
        background: rgba(7, 11, 22, 0.74);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.16);
      }

      /* Coordinates & Ankara Distance Strip */
      #${MODAL_ID} .sqp-meta-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      #${MODAL_ID} .sqp-meta-chip {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 7px 12px;
        border-radius: 10px;
        font-size: 0.81rem;
        background: rgba(30, 41, 59, 0.56);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        color: var(--text-secondary, #cbd5e1);
      }

      #${MODAL_ID} .sqp-meta-chip strong {
        color: var(--text-primary, #f8fafc);
        font-weight: 600;
      }

      body.light-theme #${MODAL_ID} .sqp-meta-chip {
        background: rgba(241, 245, 249, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
        color: #475569;
      }

      body.light-theme #${MODAL_ID} .sqp-meta-chip strong {
        color: #0f172a;
      }

      #${MODAL_ID} .sqp-mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        color: var(--accent-cyan, #00f2fe);
      }

      body.light-theme #${MODAL_ID} .sqp-mono {
        color: #0284c7;
      }

      /* Quote & Library Cards */
      #${MODAL_ID} .sqp-info-box {
        padding: 13px 15px;
        border-radius: 13px;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      body.light-theme #${MODAL_ID} .sqp-info-box {
        background: rgba(255, 255, 255, 0.78);
        border-color: rgba(15, 23, 42, 0.1);
      }

      #${MODAL_ID} .sqp-section-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      #${MODAL_ID} .sqp-label-gold {
        color: var(--accent-gold, #f59e0b);
      }

      #${MODAL_ID} .sqp-label-emerald {
        color: var(--accent-emerald, #10b981);
      }

      #${MODAL_ID} .sqp-label-cyan {
        color: var(--accent-cyan, #00f2fe);
      }

      #${MODAL_ID} .sqp-quote-text {
        margin: 0;
        font-size: 0.95rem;
        font-style: italic;
        line-height: 1.55;
        border-left: 3px solid var(--accent-cyan, #00f2fe);
        padding-left: 12px;
        color: var(--text-primary, #f8fafc);
      }

      body.light-theme #${MODAL_ID} .sqp-quote-text {
        color: #1e293b;
        border-left-color: #0284c7;
      }

      #${MODAL_ID} .sqp-library-text {
        margin: 0;
        font-size: 0.87rem;
        line-height: 1.55;
        color: var(--text-secondary, #cbd5e1);
      }

      body.light-theme #${MODAL_ID} .sqp-library-text {
        color: #334155;
      }

      /* Two-Column Landmarks & Specialties */
      #${MODAL_ID} .sqp-two-col {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      #${MODAL_ID} .sqp-landmarks-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      #${MODAL_ID} .sqp-landmark-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        border-radius: 9px;
        font-size: 0.84rem;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.06);
        color: var(--text-primary, #f1f5f9);
      }

      body.light-theme #${MODAL_ID} .sqp-landmark-row {
        background: rgba(241, 245, 249, 0.85);
        border-color: rgba(15, 23, 42, 0.08);
        color: #1e293b;
      }

      #${MODAL_ID} .sqp-tags-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      #${MODAL_ID} .sqp-specialty-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border-radius: 9999px;
        font-size: 0.79rem;
        font-weight: 600;
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.34);
        color: #fcd34d;
      }

      body.light-theme #${MODAL_ID} .sqp-specialty-pill {
        background: rgba(245, 158, 11, 0.14);
        border-color: rgba(217, 119, 6, 0.35);
        color: #b45309;
      }

      #${MODAL_ID} .sqp-empty-note {
        font-size: 0.82rem;
        color: var(--text-muted, #64748b);
      }

      /* Footer Quick Actions */
      #${MODAL_ID} .sqp-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
        padding: 14px 22px 16px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(10, 15, 29, 0.55);
      }

      body.light-theme #${MODAL_ID} .sqp-footer {
        border-top-color: rgba(15, 23, 42, 0.1);
        background: rgba(241, 245, 249, 0.85);
      }

      #${MODAL_ID} .sqp-actions-group {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
      }

      #${MODAL_ID} .sqp-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 9px 15px;
        border-radius: 10px;
        font-family: inherit;
        font-size: 0.84rem;
        font-weight: 700;
        cursor: pointer;
        border: 1px solid transparent;
        transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease;
      }

      #${MODAL_ID} .sqp-btn:hover,
      #${MODAL_ID} .sqp-btn:focus-visible {
        outline: none;
        transform: translateY(-1px);
      }

      #${MODAL_ID} .sqp-btn-primary {
        background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
        color: #061224;
        box-shadow: 0 6px 20px rgba(0, 242, 254, 0.25);
      }

      #${MODAL_ID} .sqp-btn-primary:hover {
        box-shadow: 0 8px 24px rgba(0, 242, 254, 0.42);
      }

      body.light-theme #${MODAL_ID} .sqp-btn-primary {
        background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
        color: #ffffff;
        box-shadow: 0 6px 18px rgba(2, 132, 199, 0.28);
      }

      #${MODAL_ID} .sqp-btn-battle {
        background: rgba(168, 85, 247, 0.16);
        border-color: rgba(168, 85, 247, 0.45);
        color: #e9d5ff;
      }

      #${MODAL_ID} .sqp-btn-battle:hover {
        background: rgba(168, 85, 247, 0.26);
        border-color: rgba(168, 85, 247, 0.72);
        box-shadow: 0 4px 16px rgba(168, 85, 247, 0.25);
      }

      body.light-theme #${MODAL_ID} .sqp-btn-battle {
        background: rgba(147, 51, 234, 0.12);
        border-color: rgba(147, 51, 234, 0.35);
        color: #6b21a8;
      }

      #${MODAL_ID} .sqp-btn-close {
        background: rgba(30, 41, 59, 0.7);
        border-color: rgba(148, 163, 184, 0.28);
        color: var(--text-secondary, #cbd5e1);
      }

      #${MODAL_ID} .sqp-btn-close:hover {
        border-color: rgba(248, 113, 113, 0.55);
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.14);
      }

      body.light-theme #${MODAL_ID} .sqp-btn-close {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.18);
        color: #334155;
      }

      body.light-theme #${MODAL_ID} .sqp-btn-close:hover {
        border-color: rgba(220, 38, 38, 0.45);
        color: #b91c1c;
        background: rgba(239, 68, 68, 0.08);
      }

      @media (max-width: 680px) {
        #${MODAL_ID} {
          padding: 10px;
        }
        #${MODAL_ID} .sqp-header {
          padding: 14px 16px 12px;
        }
        #${MODAL_ID} .sqp-body {
          padding: 14px 16px;
        }
        #${MODAL_ID} .sqp-media-grid,
        #${MODAL_ID} .sqp-two-col {
          grid-template-columns: 1fr;
        }
        #${MODAL_ID} .sqp-footer {
          padding: 12px 16px;
        }
        #${MODAL_ID} .sqp-actions-group {
          width: 100%;
        }
        #${MODAL_ID} .sqp-btn {
          flex: 1 1 auto;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Modal DOM Lifecycle & Rendering
  // ---------------------------------------------------------------------------
  function ensureModal() {
    if (typeof document === 'undefined' || !document.body) return null;
    let modal = document.getElementById(MODAL_ID);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = MODAL_ID;
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="sqp-backdrop" data-sqp-close="true"></div>
        <div class="sqp-dialog" role="dialog" aria-modal="true" aria-labelledby="sqp-modal-title"></div>
      `;
      document.body.appendChild(modal);
    }

    if (!modalListenersBound) {
      modal.addEventListener('click', function (e) {
        const closeTrigger = e.target && e.target.closest ? e.target.closest('[data-sqp-close]') : null;
        if (closeTrigger) {
          close();
          return;
        }

        const goBtn = e.target && e.target.closest ? e.target.closest('[data-sqp-action="go"]') : null;
        if (goBtn && currentCityKey) {
          const targetKey = currentCityKey;
          close();
          if (activeCtx && typeof activeCtx.selectCity === 'function') {
            activeCtx.selectCity(targetKey);
          } else if (typeof window !== 'undefined') {
            window.location.hash = '#city/' + encodeURIComponent(targetKey);
          }
          return;
        }

        const battleBtn = e.target && e.target.closest ? e.target.closest('[data-sqp-action="battle"]') : null;
        if (battleBtn && currentCityKey) {
          const targetKey = currentCityKey;
          const provinces = getProvinces();
          const cityName = (provinces[targetKey] && provinces[targetKey].name) || targetKey;
          if (activeCtx && activeCtx.state) {
            activeCtx.state.aiBattleCityA = targetKey;
          }
          close();
          if (activeCtx && typeof activeCtx.openView === 'function') {
            activeCtx.openView('aiBattle');
          } else if (typeof window !== 'undefined') {
            window.location.hash = '#aiBattle';
          }
          // Ensure aiBattle updates Corner A even if it was previously rendered with another city
          const selectAEl = document.getElementById('vsbattle-select-a');
          if (selectAEl && selectAEl.value !== targetKey) {
            selectAEl.value = targetKey;
            selectAEl.dispatchEvent(new Event('change', { bubbles: true }));
          }
          notify(`⚖️ ${cityName} düello arenasına gönderildi`);
        }
      });
      modalListenersBound = true;
    }

    return modal;
  }

  function renderModalContent(cityKey, province) {
    const modal = ensureModal();
    if (!modal) return null;
    const dialog = modal.querySelector('.sqp-dialog');
    if (!dialog) return null;

    const provinces = getProvinces();
    const regions = getRegions();
    const regionMeta = (province.region_code && regions[province.region_code]) || null;
    const regionIcon = (regionMeta && regionMeta.icon) || '🗺️';
    const plateStr = padPlate(province.plate);
    const isVisited = Boolean(province.visited);
    const statusLabel = isVisited ? '✅ Gezildi' : '⏳ Bekliyor';
    const statusClass = isVisited ? 'is-visited' : 'is-waiting';

    const { bannerSrc, gallerySrc } = resolveCityImages(province);
    const quoteText = province.custom_quote || province.quote || 'Anadolu yollarında her şehir ayrı bir tefekkür durağıdır.';
    const libraryText = province.custom_library || province.library || 'İl Halk Kütüphanesi çalışma notu henüz eklenmemiş.';

    const latNum = Number(province.lat);
    const lngNum = Number(province.lng);
    const coordsText =
      Number.isFinite(latNum) && Number.isFinite(lngNum)
        ? `${latNum.toFixed(4)}° K, ${lngNum.toFixed(4)}° D`
        : 'Koordinat bilgisi yok';
    const ankaraDistText = formatAnkaraDistance(province, provinces);

    const isFav = Boolean(
      activeCtx &&
        activeCtx.state &&
        activeCtx.state.favorites &&
        typeof activeCtx.state.favorites.has === 'function' &&
        activeCtx.state.favorites.has(cityKey)
    );

    const landmarks = Array.isArray(province.landmarks) ? province.landmarks : [];
    const specialties = Array.isArray(province.specialties) ? province.specialties : [];

    const landmarksHtml =
      landmarks.length > 0
        ? landmarks
            .map(
              (lm) => `
                <div class="sqp-landmark-row">
                  <span style="color: ${isVisited ? '#10b981' : '#94a3b8'}; font-weight: 700;">${isVisited ? '✓' : '○'}</span>
                  <span>${esc(lm)}</span>
                </div>
              `
            )
            .join('')
        : '<div class="sqp-empty-note">Miras & durak kaydı bulunmuyor.</div>';

    const specialtiesHtml =
      specialties.length > 0
        ? specialties
            .map((sp) => `<span class="sqp-specialty-pill">🍽️ ${esc(sp)}</span>`)
            .join('')
        : '<div class="sqp-empty-note">Yöresel lezzet kaydı bulunmuyor.</div>';

    dialog.innerHTML = `
      <div class="sqp-header">
        <div class="sqp-header-left">
          <div class="sqp-kicker-row">
            <span class="sqp-kicker">⚡ Hızlı Önizleme &amp; Anlık Bakış</span>
            <span class="sqp-status-pill ${statusClass}">${statusLabel}</span>
            ${isFav ? '<span class="sqp-region-pill">⭐ Favori</span>' : ''}
          </div>
          <div class="sqp-title-row">
            <span class="sqp-plate-badge" title="Plaka Kodu">${esc(plateStr)}</span>
            <h2 class="sqp-title" id="sqp-modal-title">${esc(province.name)}</h2>
            <span class="sqp-region-pill">${esc(regionIcon)} ${esc(province.region || 'Anadolu')} Bölgesi</span>
          </div>
        </div>
        <button type="button" class="sqp-icon-close" data-sqp-close="true" aria-label="Kapat" title="Kapat (Esc)">✕</button>
      </div>

      <div class="sqp-body">
        <div class="sqp-media-grid">
          <div class="sqp-media-card">
            <img src="${esc(bannerSrc)}" alt="${esc(province.name)} Panoramik Kapak" onerror="this.onerror=null;this.src='assets/banner.jpg';" />
            <span class="sqp-media-caption">🌅 Panoramik Kapak (banner.jpg)</span>
          </div>
          <div class="sqp-media-card">
            <img src="${esc(gallerySrc)}" alt="${esc(province.name)} Menzil Karesi" onerror="this.onerror=null;this.src='assets/banner.jpg';" />
            <span class="sqp-media-caption">📸 Menzil Karesi (gallery.jpg)</span>
          </div>
        </div>

        <div class="sqp-meta-strip">
          <div class="sqp-meta-chip">
            <span>🧭 Koordinat:</span>
            <strong class="sqp-mono">${esc(coordsText)}</strong>
          </div>
          <div class="sqp-meta-chip">
            <span>🛣️ Ankara'ya Uzaklık:</span>
            <strong>${esc(ankaraDistText)}</strong>
          </div>
        </div>

        <div class="sqp-info-box">
          <div class="sqp-section-label sqp-label-gold">📜 Şehrin Ruhu &amp; Tefekkür Notu</div>
          <blockquote class="sqp-quote-text">"${esc(quoteText)}"</blockquote>
        </div>

        <div class="sqp-info-box">
          <div class="sqp-section-label sqp-label-emerald">📖 Seyyahın Kütüphane Ofisi</div>
          <p class="sqp-library-text">${esc(libraryText)}</p>
        </div>

        <div class="sqp-two-col">
          <div class="sqp-info-box">
            <div class="sqp-section-label sqp-label-cyan">🏛️ Öne Çıkan Duraklar (${landmarks.length})</div>
            <div class="sqp-landmarks-list">${landmarksHtml}</div>
          </div>
          <div class="sqp-info-box">
            <div class="sqp-section-label sqp-label-gold">🍽️ Yöresel Tatlar &amp; Kültür (${specialties.length})</div>
            <div class="sqp-tags-cloud">${specialtiesHtml}</div>
          </div>
        </div>
      </div>

      <div class="sqp-footer">
        <div class="sqp-actions-group">
          <button type="button" class="sqp-btn sqp-btn-primary" data-sqp-action="go">
            📍 Tam Şehir Sayfasına Git ➔
          </button>
          <button type="button" class="sqp-btn sqp-btn-battle" data-sqp-action="battle">
            ⚖️ Bu İli Düelloya Gönder
          </button>
        </div>
        <button type="button" class="sqp-btn sqp-btn-close" data-sqp-close="true">
          ✕ Kapat
        </button>
      </div>
    `;

    return modal;
  }

  // ---------------------------------------------------------------------------
  // Open / Close Public API
  // ---------------------------------------------------------------------------
  function open(cityKey) {
    if (!cityKey || typeof document === 'undefined') return false;
    const provinces = getProvinces();
    const province = provinces[cityKey];
    if (!province) return false;

    ensureStyles();
    currentCityKey = cityKey;
    if (!isOpen) {
      lastFocusedEl = document.activeElement;
    }

    const modal = renderModalContent(cityKey, province);
    if (!modal) return false;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    isOpen = true;

    const primaryBtn = modal.querySelector('[data-sqp-action="go"]');
    if (primaryBtn && typeof primaryBtn.focus === 'function') {
      primaryBtn.focus({ preventScroll: true });
    }
    return true;
  }

  function close() {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById(MODAL_ID);
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
    isOpen = false;
    currentCityKey = null;

    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      try {
        lastFocusedEl.focus({ preventScroll: true });
      } catch (_) {}
    }
    lastFocusedEl = null;
  }

  // ---------------------------------------------------------------------------
  // Sidebar 👁️ Button Injection & Event Delegation
  // ---------------------------------------------------------------------------
  function injectPeekButtons(citiesListEl) {
    if (!citiesListEl) return;
    const rows = citiesListEl.querySelectorAll('.city-item');
    rows.forEach(function (row) {
      if (row.querySelector('.' + PEEK_BTN_CLASS)) return;
      const cityKey = row.getAttribute('data-city-key');
      if (!cityKey) return;

      const nameEl = row.querySelector('.city-name-text');
      const labelName = nameEl ? nameEl.textContent.trim() : cityKey;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = PEEK_BTN_CLASS;
      btn.setAttribute('data-sqp-peek', cityKey);
      btn.setAttribute('title', 'Hızlı Önizleme (Shift+Tık)');
      btn.setAttribute('aria-label', `${labelName} Hızlı Önizleme`);
      btn.textContent = '👁️';

      const rightMeta = row.querySelector('.city-right-meta');
      if (rightMeta) {
        const statusBadge = rightMeta.querySelector('.city-status-badge');
        if (statusBadge) {
          rightMeta.insertBefore(btn, statusBadge);
        } else {
          rightMeta.appendChild(btn);
        }
      } else {
        row.appendChild(btn);
      }
    });
  }

  function bindCitiesListDelegation() {
    if (typeof document === 'undefined') return;
    const citiesListEl = document.getElementById('cities-list');
    if (!citiesListEl) return;

    injectPeekButtons(citiesListEl);

    if (observedListEl !== citiesListEl) {
      if (listObserver) {
        listObserver.disconnect();
      }
      observedListEl = citiesListEl;

      // Capture-phase delegation on #cities-list intercepts 👁️ before .city-item selectCity listener
      citiesListEl.addEventListener(
        'click',
        function (e) {
          const peekBtn = e.target && e.target.closest ? e.target.closest('.' + PEEK_BTN_CLASS) : null;
          if (!peekBtn) return;
          e.preventDefault();
          e.stopPropagation();
          const row = peekBtn.closest('.city-item');
          const key = peekBtn.getAttribute('data-sqp-peek') || (row && row.getAttribute('data-city-key'));
          if (key) open(key);
        },
        true
      );

      citiesListEl.addEventListener(
        'keydown',
        function (e) {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          const peekBtn = e.target && e.target.closest ? e.target.closest('.' + PEEK_BTN_CLASS) : null;
          if (!peekBtn) return;
          e.preventDefault();
          e.stopPropagation();
          const row = peekBtn.closest('.city-item');
          const key = peekBtn.getAttribute('data-sqp-peek') || (row && row.getAttribute('data-city-key'));
          if (key) open(key);
        },
        true
      );

      if (typeof MutationObserver === 'function') {
        listObserver = new MutationObserver(function () {
          injectPeekButtons(citiesListEl);
        });
        listObserver.observe(citiesListEl, { childList: true });
      }
    }
  }

  function bindGlobalListeners() {
    if (typeof document === 'undefined' || docListenersBound) return;
    docListenersBound = true;

    // Capture-phase Shift+Click anywhere in the app on .city-item or [data-city-key]
    document.addEventListener(
      'click',
      function (e) {
        if (!e.shiftKey) return;
        const target = e.target && e.target.closest ? e.target.closest('.city-item, [data-city-key]') : null;
        if (!target) return;
        if (target.closest && target.closest('#' + MODAL_ID)) return;

        const key = target.getAttribute('data-city-key');
        if (!key) return;

        const provinces = getProvinces();
        if (!provinces[key]) return;

        e.preventDefault();
        e.stopPropagation();
        open(key);
      },
      true
    );

    // Escape closes the Quick-Peek Modal immediately
    document.addEventListener(
      'keydown',
      function (e) {
        if (e.key === 'Escape' && isOpen) {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
      },
      true
    );
  }

  // ---------------------------------------------------------------------------
  // Module Init & Registration
  // ---------------------------------------------------------------------------
  function init(ctx) {
    if (ctx) activeCtx = ctx;
    ensureStyles();
    ensureModal();
    bindGlobalListeners();
    bindCitiesListDelegation();
  }

  if (typeof window !== 'undefined') {
    window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
    window.SEYYAH_MODULES.quickPeek = {
      init: init,
      open: open
    };
  }

  // Graceful auto-boot when loaded in the browser without editing app.js
  if (typeof document !== 'undefined') {
    const autoBoot = function () {
      init(activeCtx);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoBoot, { once: true });
    } else {
      autoBoot();
    }
  }
})();
