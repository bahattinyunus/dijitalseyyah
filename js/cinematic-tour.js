/**
 * Sinematik Anadolu Turu (Ken Burns Documentary Mode)
 * 81 İl için Tam Ekran Ken Burns Belgesel Gösterimi, Çift Kare (Banner + Galeri) Geçişi,
 * Bölge/Rota Filtreleme ve Film Şeridi Modülü
 * Registers on window.SEYYAH_MODULES.cinematicTour = { render(container, ctx), stop() }
 */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-cinematic-tour-styles';
  const TICK_MS = 50;
  const DURATION_OPTIONS = [4, 6, 10];
  const KB_VARIANTS = 6;

  const DEFAULT_ROUTE = [
    'Ankara', 'Çankırı', 'Kastamonu', 'Karabük', 'Bartın',
    'Zonguldak', 'Düzce', 'Sakarya', 'İstanbul', 'Edirne'
  ];

  const DEFAULT_REGIONS = {
    '01_Marmara': { name: 'Marmara Bölgesi', icon: '🏰', color: '#38bdf8' },
    '02_Ege': { name: 'Ege Bölgesi', icon: '🌊', color: '#34d399' },
    '03_Akdeniz': { name: 'Akdeniz Bölgesi', icon: '☀️', color: '#f59e0b' },
    '04_IcAnadolu': { name: 'İç Anadolu Bölgesi', icon: '🌾', color: '#fbbf24' },
    '05_Karadeniz': { name: 'Karadeniz Bölgesi', icon: '🌲', color: '#10b981' },
    '06_DoguAnadolu': { name: 'Doğu Anadolu Bölgesi', icon: '🏔️', color: '#a855f7' },
    '07_GuneydoguAnadolu': { name: 'Güneydoğu Anadolu Bölgesi', icon: '🏜️', color: '#f97316' }
  };

  // Module runtime state
  const tourState = {
    filter: 'visited',       // 'visited' | 'all' | 'route' | region_code
    durationSec: 6,          // 4 | 6 | 10
    isPlaying: true,
    shuffle: false,
    photoMode: 'dual',       // 'dual' (banner -> gallery) | 'banner' | 'gallery'
    slides: [],              // [{ key, province }]
    currentIndex: 0,
    currentPhoto: 'banner',  // 'banner' | 'gallery'
    midSwitched: false,
    elapsedMs: 0,
    activeLayer: 0,          // 0 -> layerA, 1 -> layerB
    kbCounter: 0
  };

  // Active DOM / timer / listener handles for clean teardown
  let timerId = null;
  let activeContainer = null;
  let activeStage = null;
  let activeCtx = null;
  let keydownHandler = null;
  let fullscreenHandler = null;
  const preloadedUrls = new Set();

  // =========================================================================
  // Helpers
  // =========================================================================

  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeTr(str) {
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
    const n = Number(plate);
    if (!Number.isFinite(n)) return '00';
    return String(n).padStart(2, '0');
  }

  function getBannerSrc(key, province) {
    if (!province) return '';
    if (province.banner_rel) return province.banner_rel;
    if (Array.isArray(province.images) && province.images[0]) return province.images[0];
    return `${key}/banner.jpg`;
  }

  function getGallerySrc(key, province) {
    if (!province) return '';
    if (province.gallery_rel) return province.gallery_rel;
    if (Array.isArray(province.images) && province.images[1]) return province.images[1];
    if (province.has_gallery) return `${key}/gallery.jpg`;
    return '';
  }

  function getRegionMeta(data, regionCode, fallbackName) {
    const regions = (data && data.regions) || {};
    const meta = regions[regionCode] || DEFAULT_REGIONS[regionCode];
    if (meta) return meta;
    return {
      name: fallbackName ? `${fallbackName} Bölgesi` : 'Anadolu',
      icon: '🗺️',
      color: '#38bdf8'
    };
  }

  function getActiveRouteNames(ctx) {
    if (ctx && ctx.state && Array.isArray(ctx.state.customRouteCities) && ctx.state.customRouteCities.length) {
      return ctx.state.customRouteCities;
    }
    if (ctx && ctx.data && Array.isArray(ctx.data.custom_route) && ctx.data.custom_route.length) {
      return ctx.data.custom_route;
    }
    return DEFAULT_ROUTE;
  }

  function preloadImage(url) {
    if (!url || preloadedUrls.has(url)) return;
    preloadedUrls.add(url);
    const img = new Image();
    img.src = url;
  }

  function buildSlides(ctx, filterKey) {
    const provinces = (ctx && ctx.data && ctx.data.provinces) || {};
    const allEntries = Object.entries(provinces).map(([key, province]) => ({ key, province }));

    const sortByPlate = (a, b) => (Number(a.province.plate) || 999) - (Number(b.province.plate) || 999);

    if (filterKey === 'visited') {
      return allEntries.filter(item => Boolean(item.province.visited)).sort(sortByPlate);
    }

    if (filterKey === 'all') {
      return allEntries.sort(sortByPlate);
    }

    if (filterKey === 'route') {
      const routeNames = getActiveRouteNames(ctx);
      const byNormName = new Map();
      allEntries.forEach(item => {
        byNormName.set(normalizeTr(item.province.name), item);
      });
      const ordered = [];
      const seen = new Set();
      routeNames.forEach(cityName => {
        const found = byNormName.get(normalizeTr(cityName));
        if (found && !seen.has(found.key)) {
          seen.add(found.key);
          ordered.push(found);
        }
      });
      return ordered.length ? ordered : allEntries.sort(sortByPlate);
    }

    // Specific region_code
    const regionItems = allEntries
      .filter(item => item.province.region_code === filterKey)
      .sort(sortByPlate);

    return regionItems.length ? regionItems : allEntries.sort(sortByPlate);
  }

  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  // =========================================================================
  // Scoped Styles Injection (Dark + Light Theme + Ken Burns Keyframes)
  // =========================================================================

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes cinemaKbZoomInTL {
        0% { transform: scale(1.0) translate3d(0%, 0%, 0); }
        100% { transform: scale(1.16) translate3d(-2.5%, -2%, 0); }
      }
      @keyframes cinemaKbZoomOutBR {
        0% { transform: scale(1.18) translate3d(2.5%, 2%, 0); }
        100% { transform: scale(1.02) translate3d(0%, 0%, 0); }
      }
      @keyframes cinemaKbPanRight {
        0% { transform: scale(1.12) translate3d(-3%, 0.5%, 0); }
        100% { transform: scale(1.16) translate3d(3%, -1%, 0); }
      }
      @keyframes cinemaKbPanLeft {
        0% { transform: scale(1.14) translate3d(3%, -0.8%, 0); }
        100% { transform: scale(1.1) translate3d(-3%, 1.2%, 0); }
      }
      @keyframes cinemaKbZoomInCenter {
        0% { transform: scale(1.02) translate3d(0%, 1.5%, 0); }
        100% { transform: scale(1.18) translate3d(0%, -1.5%, 0); }
      }
      @keyframes cinemaKbDriftUp {
        0% { transform: scale(1.15) translate3d(-1.5%, 2.5%, 0); }
        100% { transform: scale(1.05) translate3d(1.5%, -2%, 0); }
      }
      @keyframes cinemaRecPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.35; transform: scale(0.82); }
      }
      @keyframes cinemaHudFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .cinema-shell {
        display: flex;
        flex-direction: column;
        gap: 16px;
        animation: cinemaHudFadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      }

      /* Top Toolbar */
      .cinema-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 18px;
        background: var(--bg-glass, rgba(15, 23, 42, 0.85));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-lg, 20px);
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.5));
      }

      .cinema-title-block {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .cinema-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .cinema-subtitle {
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
      }

      .cinema-filter-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .cinema-preset-btn {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.8rem;
        font-weight: 600;
        padding: 7px 12px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-secondary, #cbd5e1);
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .cinema-preset-btn:hover {
        color: #ffffff;
        border-color: var(--border-glow, rgba(0, 242, 254, 0.45));
        transform: translateY(-1px);
      }

      .cinema-preset-btn.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.22), rgba(16, 185, 129, 0.22));
        border-color: var(--accent-cyan, #00f2fe);
        color: #ffffff;
        box-shadow: 0 0 16px rgba(0, 242, 254, 0.22);
      }

      .cinema-filter-select {
        font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
        font-size: 0.82rem;
        font-weight: 600;
        padding: 8px 14px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.85);
        color: var(--text-primary, #f8fafc);
        cursor: pointer;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .cinema-filter-select:focus {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.16);
      }

      /* Widescreen Cinema Stage */
      .cinema-stage {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        min-height: 480px;
        max-height: 76vh;
        background: #040711;
        border-radius: var(--radius-lg, 20px);
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.14);
        box-shadow: 0 24px 60px -15px rgba(0, 0, 0, 0.75), 0 0 35px rgba(0, 242, 254, 0.1);
        user-select: none;
      }

      .cinema-stage:fullscreen,
      .cinema-stage:-webkit-full-screen {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        min-height: 100vh;
        aspect-ratio: auto;
        border-radius: 0;
        border: none;
      }

      /* Dual-Layer Crossfade Backdrop */
      .cinema-backdrop-layer {
        position: absolute;
        inset: 0;
        opacity: 0;
        transition: opacity 1.15s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        background: radial-gradient(circle at 50% 45%, #162238 0%, #050914 100%);
      }

      .cinema-backdrop-layer.is-visible {
        opacity: 1;
        z-index: 1;
      }

      .cinema-backdrop-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        will-change: transform;
        transform-origin: center center;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
        filter: saturate(1.08) contrast(1.04);
      }

      .cinema-backdrop-img.kb-motion-0 { animation-name: cinemaKbZoomInTL; }
      .cinema-backdrop-img.kb-motion-1 { animation-name: cinemaKbZoomOutBR; }
      .cinema-backdrop-img.kb-motion-2 { animation-name: cinemaKbPanRight; }
      .cinema-backdrop-img.kb-motion-3 { animation-name: cinemaKbPanLeft; }
      .cinema-backdrop-img.kb-motion-4 { animation-name: cinemaKbZoomInCenter; }
      .cinema-backdrop-img.kb-motion-5 { animation-name: cinemaKbDriftUp; }

      .cinema-stage.is-paused .cinema-backdrop-img {
        animation-play-state: paused !important;
      }

      /* Cinematic Scrim & Vignette */
      .cinema-vignette {
        position: absolute;
        inset: 0;
        z-index: 2;
        pointer-events: none;
        background:
          linear-gradient(180deg, rgba(4, 7, 17, 0.72) 0%, rgba(4, 7, 17, 0.14) 26%, rgba(4, 7, 17, 0.12) 48%, rgba(4, 7, 17, 0.84) 82%, rgba(4, 7, 17, 0.96) 100%),
          radial-gradient(ellipse at center, transparent 52%, rgba(4, 7, 17, 0.55) 100%);
      }

      /* Letterbox subtle film lines */
      .cinema-stage::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 2;
        pointer-events: none;
        box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.55);
      }

      /* Overlay HUD */
      .cinema-hud {
        position: absolute;
        inset: 0;
        z-index: 4;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 20px 24px 16px;
        pointer-events: none;
      }

      .cinema-hud > * {
        pointer-events: auto;
      }

      /* Top HUD Row */
      .cinema-hud-top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .cinema-top-badges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .cinema-plate-badge {
        display: inline-flex;
        align-items: center;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.25);
        background: rgba(10, 15, 29, 0.78);
        backdrop-filter: blur(10px);
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-weight: 800;
        font-size: 0.88rem;
        letter-spacing: 0.04em;
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
      }

      .cinema-plate-tr {
        background: linear-gradient(180deg, #1d4ed8, #1e3a8a);
        color: #ffffff;
        font-size: 0.62rem;
        padding: 5px 6px;
        font-weight: 800;
        letter-spacing: 0.06em;
      }

      .cinema-plate-num {
        padding: 3px 10px;
      }

      .cinema-region-badge,
      .cinema-status-badge,
      .cinema-meta-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.78rem;
        font-weight: 600;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(10, 15, 29, 0.66);
        color: #f8fafc;
      }

      .cinema-status-badge.visited {
        background: rgba(16, 185, 129, 0.22);
        border-color: rgba(16, 185, 129, 0.55);
        color: #a7f3d0;
      }

      .cinema-status-badge.unvisited {
        background: rgba(245, 158, 11, 0.2);
        border-color: rgba(245, 158, 11, 0.5);
        color: #fde68a;
      }

      .cinema-top-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .cinema-rec-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ef4444;
        box-shadow: 0 0 10px #ef4444;
        animation: cinemaRecPulse 1.5s infinite;
      }

      .cinema-stage.is-paused .cinema-rec-dot {
        background: #f59e0b;
        box-shadow: 0 0 8px #f59e0b;
        animation: none;
      }

      .cinema-photo-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 11px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(10, 15, 29, 0.72);
        color: #e2e8f0;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        backdrop-filter: blur(10px);
        transition: all 0.2s ease;
      }

      .cinema-photo-toggle:hover {
        border-color: var(--accent-cyan, #00f2fe);
        color: #ffffff;
        background: rgba(15, 23, 42, 0.9);
      }

      /* Bottom Editorial + Controls Container */
      .cinema-hud-bottom {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .cinema-editorial {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 860px;
        animation: cinemaHudFadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .cinema-city-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.9rem, 4vw, 3.1rem);
        font-weight: 800;
        line-height: 1.08;
        letter-spacing: -0.02em;
        color: #ffffff;
        text-shadow: 0 4px 24px rgba(0, 0, 0, 0.75);
      }

      .cinema-quote {
        font-size: clamp(0.92rem, 1.4vw, 1.08rem);
        font-style: italic;
        color: #e2e8f0;
        line-height: 1.5;
        padding-left: 14px;
        border-left: 3px solid var(--accent-gold, #f59e0b);
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
        max-width: 740px;
      }

      .cinema-tags-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 7px;
      }

      .cinema-tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 11px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.76rem;
        font-weight: 600;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.16);
      }

      .cinema-tag-landmark {
        background: rgba(0, 242, 254, 0.14);
        border-color: rgba(0, 242, 254, 0.34);
        color: #cffafe;
      }

      .cinema-tag-specialty {
        background: rgba(245, 158, 11, 0.16);
        border-color: rgba(245, 158, 11, 0.38);
        color: #fef3c7;
      }

      /* Progress Bar */
      .cinema-progress-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .cinema-progress-track {
        position: relative;
        flex: 1;
        height: 5px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.18);
        overflow: hidden;
      }

      .cinema-progress-midmark {
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 2px;
        background: rgba(255, 255, 255, 0.45);
        z-index: 2;
      }

      .cinema-progress-fill {
        height: 100%;
        width: 0%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent-cyan, #00f2fe), var(--accent-emerald, #10b981), var(--accent-gold, #f59e0b));
        box-shadow: 0 0 12px rgba(0, 242, 254, 0.65);
        transition: width 50ms linear;
      }

      .cinema-countdown {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.74rem;
        font-weight: 700;
        color: #cbd5e1;
        min-width: 38px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      /* Controls Bar */
      .cinema-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 14px;
        background: rgba(7, 12, 26, 0.76);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.14);
      }

      .cinema-ctrl-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }

      .cinema-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 36px;
        padding: 0 12px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(30, 41, 59, 0.72);
        color: #f8fafc;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
        white-space: nowrap;
      }

      .cinema-btn:hover {
        background: rgba(51, 65, 85, 0.92);
        border-color: var(--accent-cyan, #00f2fe);
        transform: translateY(-1px);
      }

      .cinema-btn.icon-only {
        width: 38px;
        padding: 0;
        font-size: 0.96rem;
      }

      .cinema-btn.play-btn {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(16, 185, 129, 0.28));
        border-color: rgba(0, 242, 254, 0.55);
        min-width: 44px;
      }

      .cinema-btn.active {
        background: rgba(0, 242, 254, 0.22);
        border-color: var(--accent-cyan, #00f2fe);
        color: #ffffff;
      }

      .cinema-duration-pills {
        display: inline-flex;
        align-items: center;
        background: rgba(15, 23, 42, 0.82);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        padding: 2px;
        gap: 2px;
      }

      .cinema-dur-btn {
        height: 30px;
        padding: 0 9px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: #94a3b8;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.76rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .cinema-dur-btn:hover {
        color: #ffffff;
      }

      .cinema-dur-btn.active {
        background: linear-gradient(135deg, #00f2fe, #10b981);
        color: #06101f;
      }

      .cinema-inspect-btn {
        background: linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%);
        border: none;
        color: #04101e;
        font-weight: 800;
        padding: 0 16px;
        box-shadow: 0 4px 18px rgba(0, 242, 254, 0.32);
      }

      .cinema-inspect-btn:hover {
        filter: brightness(1.08);
        transform: translateY(-1px);
        box-shadow: 0 6px 22px rgba(0, 242, 254, 0.45);
      }

      /* Filmstrip */
      .cinema-filmstrip-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 14px;
        background: var(--bg-glass, rgba(15, 23, 42, 0.85));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-lg, 20px);
      }

      .cinema-filmstrip-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.78rem;
        color: var(--text-secondary, #94a3b8);
        padding: 0 2px;
      }

      .cinema-filmstrip-nav {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .cinema-strip-arrow {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.7);
        color: var(--text-primary, #f8fafc);
        cursor: pointer;
        font-size: 0.8rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.18s ease;
      }

      .cinema-strip-arrow:hover {
        border-color: var(--accent-cyan, #00f2fe);
      }

      .cinema-filmstrip {
        display: flex;
        align-items: center;
        gap: 10px;
        overflow-x: auto;
        padding: 4px 2px 6px;
        scroll-behavior: smooth;
      }

      .cinema-thumb {
        position: relative;
        flex: 0 0 132px;
        height: 78px;
        border-radius: 11px;
        overflow: hidden;
        border: 2px solid transparent;
        background: #0f172a;
        cursor: pointer;
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        opacity: 0.72;
        padding: 0;
        text-align: left;
      }

      .cinema-thumb:hover {
        opacity: 1;
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.35);
      }

      .cinema-thumb.active {
        opacity: 1;
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.25), 0 8px 18px rgba(0, 0, 0, 0.45);
        transform: translateY(-2px) scale(1.02);
      }

      .cinema-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .cinema-thumb-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(4, 7, 17, 0.15) 0%, rgba(4, 7, 17, 0.82) 100%);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 5px 7px;
      }

      .cinema-thumb-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .cinema-thumb-plate {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.66rem;
        font-weight: 800;
        padding: 1px 5px;
        border-radius: 5px;
        background: rgba(10, 15, 29, 0.78);
        color: #f8fafc;
      }

      .cinema-thumb-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #94a3b8;
      }

      .cinema-thumb-dot.visited {
        background: #10b981;
        box-shadow: 0 0 6px #10b981;
      }

      .cinema-thumb-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.74rem;
        font-weight: 700;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
      }

      /* Light Theme Adjustments */
      body.light-theme .cinema-toolbar,
      body.light-theme .cinema-filmstrip-section {
        background: rgba(255, 255, 255, 0.88);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .cinema-preset-btn {
        background: rgba(241, 245, 249, 0.92);
        color: #334155;
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .cinema-preset-btn:hover {
        color: #0f172a;
        background: #e2e8f0;
      }

      body.light-theme .cinema-preset-btn.active {
        background: linear-gradient(135deg, #0284c7, #059669);
        color: #ffffff;
        border-color: transparent;
      }

      body.light-theme .cinema-filter-select,
      body.light-theme .cinema-strip-arrow {
        background: #ffffff;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.16);
      }

      /* Responsive */
      @media (max-width: 900px) {
        .cinema-stage {
          aspect-ratio: auto;
          min-height: 520px;
          max-height: none;
        }
        .cinema-hud {
          padding: 14px 16px 12px;
        }
        .cinema-controls {
          padding: 8px 10px;
        }
      }

      @media (max-width: 560px) {
        .cinema-stage {
          min-height: 540px;
        }
        .cinema-city-name {
          font-size: 1.65rem;
        }
        .cinema-quote {
          font-size: 0.86rem;
        }
        .cinema-thumb {
          flex: 0 0 112px;
          height: 66px;
        }
        .cinema-inspect-btn {
          width: 100%;
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // Playback & Slide Engine
  // =========================================================================

  function stop() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }
    if (fullscreenHandler) {
      document.removeEventListener('fullscreenchange', fullscreenHandler);
      document.removeEventListener('webkitfullscreenchange', fullscreenHandler);
      fullscreenHandler = null;
    }
    activeContainer = null;
    activeStage = null;
    activeCtx = null;
  }

  function startTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }

    timerId = setInterval(() => {
      // Auto-cleanup if unmounted from DOM
      if (!activeStage || !activeStage.isConnected) {
        stop();
        return;
      }

      if (!tourState.isPlaying || !tourState.slides.length) {
        return;
      }

      const totalMs = tourState.durationSec * 1000;
      tourState.elapsedMs += TICK_MS;

      // Halfway crossfade from banner.jpg to gallery.jpg in dual mode
      if (
        tourState.photoMode === 'dual' &&
        !tourState.midSwitched &&
        tourState.elapsedMs >= totalMs / 2
      ) {
        tourState.midSwitched = true;
        const slide = tourState.slides[tourState.currentIndex];
        if (slide) {
          const gallerySrc = getGallerySrc(slide.key, slide.province);
          if (gallerySrc) {
            tourState.currentPhoto = 'gallery';
            applyBackdropImage(gallerySrc, Math.max(tourState.durationSec * 0.65, 4));
            updatePhotoIndicator();
          }
        }
      }

      updateProgressUI();

      if (tourState.elapsedMs >= totalMs) {
        nextSlide(false);
      }
    }, TICK_MS);
  }

  function applyBackdropImage(src, animSeconds) {
    if (!activeStage) return;
    const layerA = activeStage.querySelector('[data-cinema-layer="0"]');
    const layerB = activeStage.querySelector('[data-cinema-layer="1"]');
    if (!layerA || !layerB) return;

    const nextLayerIdx = tourState.activeLayer === 0 ? 1 : 0;
    const incoming = nextLayerIdx === 0 ? layerA : layerB;
    const outgoing = nextLayerIdx === 0 ? layerB : layerA;

    const kbIdx = tourState.kbCounter % KB_VARIANTS;
    tourState.kbCounter += 1;

    const img = incoming.querySelector('img');
    if (img) {
      // Reset CSS animation cleanly so every slide/photo starts a fresh Ken Burns glide
      img.className = 'cinema-backdrop-img';
      img.style.animationDuration = `${Math.max(animSeconds, 4)}s`;
      img.src = src;
      // Force reflow to restart animation reliably
      void img.offsetWidth;
      img.classList.add(`kb-motion-${kbIdx}`);
    }

    incoming.classList.add('is-visible');
    outgoing.classList.remove('is-visible');
    tourState.activeLayer = nextLayerIdx;
  }

  function updateProgressUI() {
    if (!activeStage) return;
    const totalMs = tourState.durationSec * 1000;
    const pct = Math.min(100, Math.max(0, (tourState.elapsedMs / totalMs) * 100));
    const remainingSec = Math.max(0, (totalMs - tourState.elapsedMs) / 1000);

    const fill = activeStage.querySelector('[data-cinema-progress]');
    const countdown = activeStage.querySelector('[data-cinema-countdown]');
    if (fill) fill.style.width = `${pct.toFixed(2)}%`;
    if (countdown) countdown.textContent = `${remainingSec.toFixed(1)}s`;
  }

  function updatePhotoIndicator() {
    if (!activeStage) return;
    const btn = activeStage.querySelector('[data-cinema-photo-toggle]');
    if (!btn) return;
    const slide = tourState.slides[tourState.currentIndex];
    const hasGallery = slide && Boolean(getGallerySrc(slide.key, slide.province));
    if (!hasGallery) {
      btn.textContent = '🖼️ Kare 1/1 · Banner';
      return;
    }
    if (tourState.currentPhoto === 'gallery') {
      btn.textContent = '🖼️ Kare 2/2 · Galeri';
    } else {
      btn.textContent = '🖼️ Kare 1/2 · Banner';
    }
  }

  function updatePlayPauseUI() {
    if (!activeStage) return;
    activeStage.classList.toggle('is-paused', !tourState.isPlaying);
    const btn = activeStage.querySelector('[data-cinema-play]');
    if (btn) {
      btn.textContent = tourState.isPlaying ? '⏸' : '▶';
      btn.title = tourState.isPlaying ? 'Duraklat (Space)' : 'Oynat (Space)';
      btn.setAttribute('aria-label', tourState.isPlaying ? 'Duraklat' : 'Oynat');
    }
    const modeLabel = activeStage.querySelector('[data-cinema-live-label]');
    if (modeLabel) {
      modeLabel.textContent = tourState.isPlaying ? 'BELGESEL' : 'DURAKLATILDI';
    }
  }

  function updateFullscreenUI() {
    if (!activeStage) return;
    const btn = activeStage.querySelector('[data-cinema-fullscreen]');
    if (!btn) return;
    const isFs = getFullscreenElement() === activeStage;
    btn.textContent = isFs ? '⛶ Çıkış' : '⛶ Tam Ekran';
  }

  function highlightActiveThumb() {
    if (!activeContainer) return;
    const strip = activeContainer.querySelector('[data-cinema-filmstrip]');
    if (!strip) return;
    const thumbs = strip.querySelectorAll('.cinema-thumb');
    let activeThumb = null;
    thumbs.forEach(el => {
      const idx = Number(el.getAttribute('data-index'));
      const isActive = idx === tourState.currentIndex;
      el.classList.toggle('active', isActive);
      el.setAttribute('aria-current', isActive ? 'true' : 'false');
      if (isActive) activeThumb = el;
    });

    if (activeThumb) {
      const targetLeft = activeThumb.offsetLeft - (strip.clientWidth / 2) + (activeThumb.clientWidth / 2);
      strip.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    }
  }

  function preloadNeighbors() {
    if (!tourState.slides.length) return;
    const nextIdx = (tourState.currentIndex + 1) % tourState.slides.length;
    const nextSlideItem = tourState.slides[nextIdx];
    if (nextSlideItem) {
      preloadImage(getBannerSrc(nextSlideItem.key, nextSlideItem.province));
      preloadImage(getGallerySrc(nextSlideItem.key, nextSlideItem.province));
    }
  }

  function showSlide(index, resetProgress = true) {
    if (!activeStage || !activeCtx || !tourState.slides.length) return;

    const total = tourState.slides.length;
    const safeIdx = ((index % total) + total) % total;
    tourState.currentIndex = safeIdx;

    if (resetProgress) {
      tourState.elapsedMs = 0;
      tourState.midSwitched = false;
    }

    const { key, province } = tourState.slides[safeIdx];
    const esc = activeCtx.escapeHtml || fallbackEscapeHtml;
    const regionMeta = getRegionMeta(activeCtx.data, province.region_code, province.region);

    const bannerSrc = getBannerSrc(key, province);
    const gallerySrc = getGallerySrc(key, province);

    let initialPhoto = 'banner';
    let initialSrc = bannerSrc;
    if (tourState.photoMode === 'gallery' && gallerySrc) {
      initialPhoto = 'gallery';
      initialSrc = gallerySrc;
    }
    tourState.currentPhoto = initialPhoto;

    // Preload current gallery & next province
    if (gallerySrc) preloadImage(gallerySrc);
    preloadNeighbors();

    // Ken Burns glide duration slightly exceeds display interval for continuous cinematic motion
    const kenBurnsDuration = tourState.photoMode === 'dual' && gallerySrc
      ? Math.max(tourState.durationSec * 0.65, 4)
      : Math.max(tourState.durationSec * 1.15, 5);

    applyBackdropImage(initialSrc, kenBurnsDuration);

    // Update Top HUD badges
    const plateNum = activeStage.querySelector('[data-cinema-plate]');
    if (plateNum) plateNum.textContent = formatPlate(province.plate);

    const regionBadge = activeStage.querySelector('[data-cinema-region]');
    if (regionBadge) {
      regionBadge.innerHTML = `${esc(regionMeta.icon)} ${esc(regionMeta.name)}`;
      regionBadge.style.borderColor = `${regionMeta.color || '#38bdf8'}66`;
    }

    const statusBadge = activeStage.querySelector('[data-cinema-status]');
    if (statusBadge) {
      statusBadge.className = `cinema-status-badge ${province.visited ? 'visited' : 'unvisited'}`;
      statusBadge.textContent = province.visited ? '✅ Gezildi' : '⏳ Keşif Bekliyor';
    }

    const counter = activeStage.querySelector('[data-cinema-counter]');
    if (counter) {
      counter.textContent = `${safeIdx + 1} / ${total}`;
    }

    // Update Editorial Overlay (Province Name, Quote, Top 3 Landmarks, Top 2 Specialties)
    const editorial = activeStage.querySelector('[data-cinema-editorial]');
    if (editorial) {
      const quoteText = province.custom_quote || province.quote || 'Anadolu’nun kadim izlerini taşıyan eşsiz bir menzil.';
      const landmarks = Array.isArray(province.landmarks) ? province.landmarks.slice(0, 3) : [];
      const specialties = Array.isArray(province.specialties) ? province.specialties.slice(0, 2) : [];

      const landmarkHtml = landmarks
        .map(lm => `<span class="cinema-tag cinema-tag-landmark">🏛️ ${esc(lm)}</span>`)
        .join('');
      const specialtyHtml = specialties
        .map(sp => `<span class="cinema-tag cinema-tag-specialty">🍽️ ${esc(sp)}</span>`)
        .join('');

      editorial.innerHTML = `
        <h2 class="cinema-city-name">${esc(province.name)}</h2>
        <p class="cinema-quote">“${esc(quoteText)}”</p>
        <div class="cinema-tags-row">
          ${landmarkHtml}
          ${specialtyHtml}
        </div>
      `;

      // Restart subtle HUD entrance animation
      editorial.style.animation = 'none';
      void editorial.offsetWidth;
      editorial.style.animation = '';
    }

    // Update inspect button target
    const inspectBtn = activeStage.querySelector('[data-cinema-inspect]');
    if (inspectBtn) {
      inspectBtn.setAttribute('data-city-key', key);
    }

    // Update progress midpoint tick visibility
    const midMark = activeStage.querySelector('[data-cinema-midmark]');
    if (midMark) {
      midMark.style.display = (tourState.photoMode === 'dual' && gallerySrc) ? 'block' : 'none';
    }

    updatePhotoIndicator();
    updateProgressUI();
    highlightActiveThumb();
  }

  function nextSlide(isManual = true) {
    if (!tourState.slides.length) return;
    if (tourState.shuffle && tourState.slides.length > 1) {
      let pick = tourState.currentIndex;
      while (pick === tourState.currentIndex) {
        pick = Math.floor(Math.random() * tourState.slides.length);
      }
      showSlide(pick, true);
      return;
    }
    showSlide(tourState.currentIndex + 1, true);
    if (isManual && !tourState.isPlaying) {
      updateProgressUI();
    }
  }

  function prevSlide() {
    if (!tourState.slides.length) return;
    showSlide(tourState.currentIndex - 1, true);
  }

  function togglePlay() {
    tourState.isPlaying = !tourState.isPlaying;
    updatePlayPauseUI();
  }

  function toggleManualPhoto() {
    const slide = tourState.slides[tourState.currentIndex];
    if (!slide) return;
    const bannerSrc = getBannerSrc(slide.key, slide.province);
    const gallerySrc = getGallerySrc(slide.key, slide.province);
    if (!gallerySrc) {
      if (activeCtx && typeof activeCtx.showToast === 'function') {
        activeCtx.showToast('ℹ️ Bu il için yalnızca banner fotoğrafı mevcut');
      }
      return;
    }

    if (tourState.currentPhoto === 'banner') {
      tourState.currentPhoto = 'gallery';
      tourState.midSwitched = true;
      applyBackdropImage(gallerySrc, Math.max(tourState.durationSec, 5));
    } else {
      tourState.currentPhoto = 'banner';
      applyBackdropImage(bannerSrc, Math.max(tourState.durationSec, 5));
    }
    updatePhotoIndicator();
  }

  function toggleFullscreen() {
    if (!activeStage) return;
    const currentFs = getFullscreenElement();
    if (currentFs === activeStage) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } else {
      if (activeStage.requestFullscreen) {
        activeStage.requestFullscreen().catch(() => {
          if (activeCtx && typeof activeCtx.showToast === 'function') {
            activeCtx.showToast('⚠️ Tarayıcı tam ekran modunu engelledi');
          }
        });
      } else if (activeStage.webkitRequestFullscreen) {
        activeStage.webkitRequestFullscreen();
      }
    }
  }

  function renderFilmstrip(container, ctx) {
    const strip = container.querySelector('[data-cinema-filmstrip]');
    const info = container.querySelector('[data-cinema-strip-info]');
    if (!strip) return;

    const esc = ctx.escapeHtml || fallbackEscapeHtml;

    if (info) {
      info.textContent = `🎞️ Film Şeridi • ${tourState.slides.length} İl (Doğrudan atlamak için tıklayın)`;
    }

    strip.innerHTML = tourState.slides.map((item, idx) => {
      const p = item.province;
      const thumbSrc = getBannerSrc(item.key, p);
      return `
        <button
          type="button"
          class="cinema-thumb ${idx === tourState.currentIndex ? 'active' : ''}"
          data-index="${idx}"
          title="${esc(formatPlate(p.plate))} ${esc(p.name)}"
        >
          <img src="${esc(thumbSrc)}" alt="${esc(p.name)}" loading="lazy" decoding="async" />
          <div class="cinema-thumb-overlay">
            <div class="cinema-thumb-top">
              <span class="cinema-thumb-plate">${esc(formatPlate(p.plate))}</span>
              <span class="cinema-thumb-dot ${p.visited ? 'visited' : ''}" title="${p.visited ? 'Gezildi' : 'Bekliyor'}"></span>
            </div>
            <span class="cinema-thumb-name">${esc(p.name)}</span>
          </div>
        </button>
      `;
    }).join('');
  }

  function applyFilter(newFilter) {
    if (!activeContainer || !activeCtx) return;
    tourState.filter = newFilter;
    tourState.slides = buildSlides(activeCtx, newFilter);
    tourState.currentIndex = 0;
    tourState.elapsedMs = 0;
    tourState.midSwitched = false;

    // Sync preset pills and select dropdown
    const select = activeContainer.querySelector('[data-cinema-filter-select]');
    if (select && select.value !== newFilter) {
      select.value = newFilter;
    }
    activeContainer.querySelectorAll('[data-cinema-preset]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cinema-preset') === newFilter);
    });

    renderFilmstrip(activeContainer, activeCtx);
    showSlide(0, true);
  }

  // =========================================================================
  // Public Render Entrypoint
  // =========================================================================

  function render(container, ctx) {
    // Tear down any previous running instance cleanly
    stop();

    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const esc = safeCtx.escapeHtml || fallbackEscapeHtml;
    const data = safeCtx.data || (typeof window !== 'undefined' && window.TRAVEL_DATA) || null;

    if (!data || !data.provinces) {
      container.innerHTML = `
        <div class="glass-card" style="padding: 32px; text-align: center; max-width: 560px; margin: 24px auto;">
          <h3 style="color: var(--accent-gold, #f59e0b); margin-bottom: 8px;">🎬 Sinematik Tur Başlatılamadı</h3>
          <p style="color: var(--text-secondary, #94a3b8);">İl verileri yüklenemedi. Lütfen sayfayı yenileyin.</p>
        </div>
      `;
      return;
    }

    activeContainer = container;
    activeCtx = Object.assign({}, safeCtx, { data, escapeHtml: esc });

    const allEntries = Object.entries(data.provinces);
    const totalCount = allEntries.length;
    const visitedCount = allEntries.filter(([, p]) => Boolean(p.visited)).length;
    const routeNames = getActiveRouteNames(activeCtx);
    const routeStart = routeNames[0] || 'Ankara';
    const routeEnd = routeNames[routeNames.length - 1] || 'Edirne';

    // Default to visited if available, otherwise all
    if (tourState.filter === 'visited' && visitedCount === 0) {
      tourState.filter = 'all';
    }

    tourState.slides = buildSlides(activeCtx, tourState.filter);
    tourState.currentIndex = 0;
    tourState.elapsedMs = 0;
    tourState.midSwitched = false;
    tourState.isPlaying = true;
    tourState.activeLayer = 0;

    // Region options
    const regionCodes = Object.keys(data.regions || DEFAULT_REGIONS);
    const regionOptionsHtml = regionCodes.map(code => {
      const meta = getRegionMeta(data, code);
      const count = allEntries.filter(([, p]) => p.region_code === code).length;
      return `<option value="${esc(code)}" ${tourState.filter === code ? 'selected' : ''}>${esc(meta.icon)} ${esc(meta.name)} (${count} İl)</option>`;
    }).join('');

    const durationPillsHtml = DURATION_OPTIONS.map(sec => `
      <button
        type="button"
        class="cinema-dur-btn ${tourState.durationSec === sec ? 'active' : ''}"
        data-cinema-dur="${sec}"
        title="Slayt süresi: ${sec} saniye"
      >${sec}s</button>
    `).join('');

    container.innerHTML = `
      <section class="cinema-shell" aria-label="Sinematik Anadolu Turu">
        <!-- Top Filter Toolbar -->
        <div class="cinema-toolbar">
          <div class="cinema-title-block">
            <h1 class="cinema-title">🎬 Sinematik Anadolu Turu</h1>
            <p class="cinema-subtitle">Ken Burns Belgesel Modu • Banner & Galeri Çift Kare Geçişi</p>
          </div>

          <div class="cinema-filter-bar">
            <button type="button" class="cinema-preset-btn ${tourState.filter === 'visited' ? 'active' : ''}" data-cinema-preset="visited">
              ✅ Gezilen ${visitedCount} İl
            </button>
            <button type="button" class="cinema-preset-btn ${tourState.filter === 'all' ? 'active' : ''}" data-cinema-preset="all">
              🇹🇷 Tüm ${totalCount} İl
            </button>
            <button type="button" class="cinema-preset-btn ${tourState.filter === 'route' ? 'active' : ''}" data-cinema-preset="route">
              🎯 Aktif ${esc(routeStart)} ➔ ${esc(routeEnd)} Rotası
            </button>

            <select class="cinema-filter-select" data-cinema-filter-select aria-label="Sinematik tur filtresi">
              <option value="visited" ${tourState.filter === 'visited' ? 'selected' : ''}>✅ Gezilen ${visitedCount} İl</option>
              <option value="all" ${tourState.filter === 'all' ? 'selected' : ''}>🇹🇷 Tüm ${totalCount} İl</option>
              <option value="route" ${tourState.filter === 'route' ? 'selected' : ''}>🎯 Aktif ${esc(routeStart)} ➔ ${esc(routeEnd)} Rotası (${routeNames.length} İl)</option>
              <optgroup label="7 Coğrafi Bölge">
                ${regionOptionsHtml}
              </optgroup>
            </select>
          </div>
        </div>

        <!-- Widescreen Cinema Stage -->
        <div class="cinema-stage" data-cinema-stage>
          <div class="cinema-backdrop-layer is-visible" data-cinema-layer="0">
            <img class="cinema-backdrop-img" alt="Anadolu manzarası" />
          </div>
          <div class="cinema-backdrop-layer" data-cinema-layer="1">
            <img class="cinema-backdrop-img" alt="Anadolu manzarası" />
          </div>
          <div class="cinema-vignette"></div>

          <div class="cinema-hud">
            <!-- Top Overlay HUD -->
            <div class="cinema-hud-top">
              <div class="cinema-top-badges">
                <span class="cinema-plate-badge" title="İl Plaka Kodu">
                  <span class="cinema-plate-tr">TR</span>
                  <span class="cinema-plate-num" data-cinema-plate>00</span>
                </span>
                <span class="cinema-region-badge" data-cinema-region>🗺️ Anadolu</span>
                <span class="cinema-status-badge visited" data-cinema-status>✅ Gezildi</span>
              </div>

              <div class="cinema-top-right">
                <span class="cinema-meta-pill">
                  <span class="cinema-rec-dot"></span>
                  <span data-cinema-live-label>BELGESEL</span>
                </span>
                <button type="button" class="cinema-photo-toggle" data-cinema-photo-toggle title="Banner / Galeri karesini değiştir">
                  🖼️ Kare 1/2 · Banner
                </button>
                <span class="cinema-meta-pill" data-cinema-counter>1 / ${tourState.slides.length}</span>
              </div>
            </div>

            <!-- Bottom Overlay HUD -->
            <div class="cinema-hud-bottom">
              <div class="cinema-editorial" data-cinema-editorial></div>

              <!-- Countdown Progress Bar -->
              <div class="cinema-progress-wrap">
                <div class="cinema-progress-track">
                  <div class="cinema-progress-midmark" data-cinema-midmark title="Banner ➔ Galeri geçiş noktası"></div>
                  <div class="cinema-progress-fill" data-cinema-progress></div>
                </div>
                <span class="cinema-countdown" data-cinema-countdown>${tourState.durationSec}.0s</span>
              </div>

              <!-- Transport & Action Controls -->
              <div class="cinema-controls">
                <div class="cinema-ctrl-group">
                  <button type="button" class="cinema-btn icon-only" data-cinema-prev title="Önceki İl (←)" aria-label="Önceki İl">⏮</button>
                  <button type="button" class="cinema-btn icon-only play-btn" data-cinema-play title="Duraklat (Space)" aria-label="Duraklat">⏸</button>
                  <button type="button" class="cinema-btn icon-only" data-cinema-next title="Sonraki İl (→)" aria-label="Sonraki İl">⏭</button>
                  <button type="button" class="cinema-btn icon-only ${tourState.shuffle ? 'active' : ''}" data-cinema-shuffle title="Karışık Sıra" aria-label="Karışık Sıra">🔀</button>
                  <div class="cinema-duration-pills" role="group" aria-label="Slayt süresi">
                    ${durationPillsHtml}
                  </div>
                </div>

                <div class="cinema-ctrl-group">
                  <button type="button" class="cinema-btn" data-cinema-fullscreen title="Tam Ekran (F)">⛶ Tam Ekran</button>
                  <button type="button" class="cinema-btn cinema-inspect-btn" data-cinema-inspect>
                    📍 Bu Şehri İncele ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Thumbnail Filmstrip -->
        <div class="cinema-filmstrip-section">
          <div class="cinema-filmstrip-header">
            <span data-cinema-strip-info>🎞️ Film Şeridi</span>
            <div class="cinema-filmstrip-nav">
              <button type="button" class="cinema-strip-arrow" data-strip-left title="Şeridi sola kaydır" aria-label="Sola kaydır">◀</button>
              <button type="button" class="cinema-strip-arrow" data-strip-right title="Şeridi sağa kaydır" aria-label="Sağa kaydır">▶</button>
            </div>
          </div>
          <div class="cinema-filmstrip" data-cinema-filmstrip></div>
        </div>
      </section>
    `;

    activeStage = container.querySelector('[data-cinema-stage]');

    // Render initial filmstrip & first slide
    renderFilmstrip(container, activeCtx);
    showSlide(0, true);
    updatePlayPauseUI();
    updateFullscreenUI();

    // Wire Event Listeners
    const filterSelect = container.querySelector('[data-cinema-filter-select]');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        applyFilter(e.target.value);
      });
    }

    container.querySelectorAll('[data-cinema-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        applyFilter(btn.getAttribute('data-cinema-preset'));
      });
    });

    const prevBtn = activeStage.querySelector('[data-cinema-prev]');
    const nextBtn = activeStage.querySelector('[data-cinema-next]');
    const playBtn = activeStage.querySelector('[data-cinema-play]');
    const shuffleBtn = activeStage.querySelector('[data-cinema-shuffle]');
    const fsBtn = activeStage.querySelector('[data-cinema-fullscreen]');
    const photoToggleBtn = activeStage.querySelector('[data-cinema-photo-toggle]');
    const inspectBtn = activeStage.querySelector('[data-cinema-inspect]');

    if (prevBtn) prevBtn.addEventListener('click', () => prevSlide());
    if (nextBtn) nextBtn.addEventListener('click', () => nextSlide(true));
    if (playBtn) playBtn.addEventListener('click', () => togglePlay());
    if (photoToggleBtn) photoToggleBtn.addEventListener('click', () => toggleManualPhoto());
    if (fsBtn) fsBtn.addEventListener('click', () => toggleFullscreen());

    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        tourState.shuffle = !tourState.shuffle;
        shuffleBtn.classList.toggle('active', tourState.shuffle);
        if (activeCtx && typeof activeCtx.showToast === 'function') {
          activeCtx.showToast(tourState.shuffle ? '🔀 Karışık oynatma açıldı' : '➡️ Sıralı oynatma açıldı');
        }
      });
    }

    activeStage.querySelectorAll('[data-cinema-dur]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sec = Number(btn.getAttribute('data-cinema-dur'));
        if (!DURATION_OPTIONS.includes(sec)) return;
        tourState.durationSec = sec;
        tourState.elapsedMs = 0;
        tourState.midSwitched = false;
        activeStage.querySelectorAll('[data-cinema-dur]').forEach(b => {
          b.classList.toggle('active', Number(b.getAttribute('data-cinema-dur')) === sec);
        });
        updateProgressUI();
        if (activeCtx && typeof activeCtx.showToast === 'function') {
          activeCtx.showToast(`⏱️ Slayt süresi ${sec} saniye olarak ayarlandı`);
        }
      });
    });

    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => {
        const key = inspectBtn.getAttribute('data-city-key');
        const selectCityFn = activeCtx && activeCtx.selectCity;
        if (getFullscreenElement() === activeStage) {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
        stop();
        if (key && typeof selectCityFn === 'function') {
          selectCityFn(key);
        }
      });
    }

    // Filmstrip click delegation & scroll buttons
    const filmstrip = container.querySelector('[data-cinema-filmstrip]');
    if (filmstrip) {
      filmstrip.addEventListener('click', (e) => {
        const thumb = e.target.closest('.cinema-thumb');
        if (!thumb) return;
        const idx = Number(thumb.getAttribute('data-index'));
        if (Number.isFinite(idx)) {
          showSlide(idx, true);
        }
      });
    }

    const stripLeft = container.querySelector('[data-strip-left]');
    const stripRight = container.querySelector('[data-strip-right]');
    if (stripLeft && filmstrip) {
      stripLeft.addEventListener('click', () => {
        filmstrip.scrollBy({ left: -360, behavior: 'smooth' });
      });
    }
    if (stripRight && filmstrip) {
      stripRight.addEventListener('click', () => {
        filmstrip.scrollBy({ left: 360, behavior: 'smooth' });
      });
    }

    // Keyboard shortcuts (Space, Arrows, F)
    keydownHandler = (e) => {
      if (!activeStage || !activeStage.isConnected) {
        stop();
        return;
      }
      const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide(true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    document.addEventListener('keydown', keydownHandler);

    fullscreenHandler = () => {
      if (!activeStage || !activeStage.isConnected) {
        stop();
        return;
      }
      updateFullscreenUI();
    };
    document.addEventListener('fullscreenchange', fullscreenHandler);
    document.addEventListener('webkitfullscreenchange', fullscreenHandler);

    // Start documentary playback loop
    startTimer();
  }

  window.SEYYAH_MODULES.cinematicTour = {
    render,
    stop
  };
})();
