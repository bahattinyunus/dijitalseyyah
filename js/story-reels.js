/**
 * Dijital Seyyah — Anadolu Hikayeleri (Visual Stories Bar & Fullscreen Story Viewer)
 * File: js/story-reels.js
 * Registers on: window.SEYYAH_MODULES.storyReels = { init(ctx) }
 *
 * Features:
 *   1. MutationObserver on #viewport-content: prepends .anadolu-stories-bar whenever
 *      ctx.state.currentView === 'dashboard' && !viewport.querySelector('.anadolu-stories-bar')
 *   2. 6 dynamic curated stories built from ctx.data.provinces:
 *      - Active custom route stops ("🧭 Ankara ➔ Edirne")
 *      - Güneydoğu Anadolu ("🏜️ Mezopotamya (0/9)")
 *      - Karadeniz provinces ("🌲 Karadeniz Yaylaları")
 *      - Spiritual capitals ("🕌 Maneviyat Başkentleri")
 *      - Coastal gems ("🌊 Ege & Akdeniz")
 *      - Visited sample ("✅ 39 Fethedilen İl")
 *   3. Apple/Instagram-style Fullscreen Story Modal with 5s animated progress bars,
 *      full-bleed banner.jpg backdrop, tap left/right, ArrowLeft/ArrowRight, Pause, ESC,
 *      and "📍 Menzile Git ➔" calling ctx.selectCity(key).
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-story-reels-styles';
  const MODAL_ID = 'seyyah-story-modal';
  const SLIDE_DURATION_MS = 5000;

  const DEFAULT_ROUTE = [
    'Ankara', 'Çankırı', 'Kastamonu', 'Karabük', 'Bartın',
    'Zonguldak', 'Düzce', 'Sakarya', 'İstanbul', 'Edirne'
  ];

  const SPIRITUAL_CAPITALS = [
    'Konya', 'Şanlıurfa', 'Bursa', 'Edirne', 'İstanbul', 'Nevşehir'
  ];

  const COASTAL_GEMS = [
    'İzmir', 'Muğla', 'Aydın', 'Antalya', 'Mersin', 'Hatay', 'Adana', 'Denizli'
  ];

  const MESOPOTAMIA_ORDER = [
    'Mardin', 'Şanlıurfa', 'Gaziantep', 'Diyarbakır',
    'Adıyaman', 'Batman', 'Siirt', 'Kilis', 'Şırnak'
  ];

  const KARADENIZ_PRIORITY = [
    'Trabzon', 'Rize', 'Artvin', 'Gümüşhane', 'Bayburt', 'Ordu',
    'Giresun', 'Bolu', 'Kastamonu', 'Sinop', 'Amasya', 'Bartın'
  ];

  const VISITED_SAMPLE_PRIORITY = [
    'İstanbul', 'Bursa', 'İzmir', 'Muğla', 'Antalya', 'Adana',
    'Konya', 'Ankara', 'Nevşehir', 'Trabzon', 'Artvin', 'Erzurum'
  ];

  let activeCtx = null;
  let viewportObserver = null;
  let keydownBound = false;
  let currentStories = [];
  const seenStoryIds = new Set();

  // Modal & playback state
  let modalEl = null;
  let isModalOpen = false;
  let activeStoryIndex = 0;
  let activeSlideIndex = 0;
  let isPaused = false;
  let rafId = null;
  let slideStartTs = 0;
  let accumulatedMs = 0;
  let lastFocusedEl = null;
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

  function fallbackNormalizeTr(str) {
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

  function esc(str) {
    if (activeCtx && typeof activeCtx.escapeHtml === 'function') {
      return activeCtx.escapeHtml(str);
    }
    return fallbackEscapeHtml(str);
  }

  function norm(str) {
    if (activeCtx && typeof activeCtx.normalizeTurkish === 'function') {
      return activeCtx.normalizeTurkish(str);
    }
    return fallbackNormalizeTr(str);
  }

  function formatPlate(plate) {
    const num = Number(plate);
    if (!Number.isFinite(num) || num <= 0) return '00';
    return String(num).padStart(2, '0');
  }

  function getBannerUrl(key, province) {
    if (!province) return '';
    if (province.banner_rel) return province.banner_rel;
    if (Array.isArray(province.images) && province.images[0]) return province.images[0];
    return `${key}/banner.jpg`;
  }

  function preloadImage(url) {
    if (!url || preloadedUrls.has(url) || typeof Image !== 'function') return;
    preloadedUrls.add(url);
    const img = new Image();
    img.src = url;
  }

  function findProvinceByName(provinces, targetName) {
    if (!provinces || !targetName) return null;
    const targetNorm = norm(targetName);
    for (const [key, province] of Object.entries(provinces)) {
      if (province && norm(province.name) === targetNorm) {
        return { key, province };
      }
    }
    return null;
  }

  function sortByPlate(a, b) {
    return (Number(a.province.plate) || 999) - (Number(b.province.plate) || 999);
  }

  function orderWithPriority(entries, priorityNames) {
    const used = new Set();
    const ordered = [];
    const byNorm = new Map();

    entries.forEach((entry) => {
      if (entry && entry.province && entry.province.name) {
        byNorm.set(norm(entry.province.name), entry);
      }
    });

    priorityNames.forEach((name) => {
      const hit = byNorm.get(norm(name));
      if (hit && !used.has(hit.key)) {
        used.add(hit.key);
        ordered.push(hit);
      }
    });

    entries
      .filter((entry) => !used.has(entry.key))
      .sort(sortByPlate)
      .forEach((entry) => {
        used.add(entry.key);
        ordered.push(entry);
      });

    return ordered;
  }

  // =========================================================================
  // Curated Stories Builder
  // =========================================================================

  function buildStories(ctx) {
    const safeCtx = ctx || {};
    const data = safeCtx.data || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null) || {};
    const state = safeCtx.state || {};
    const provinces = data.provinces || {};
    const allEntries = Object.entries(provinces).map(([key, province]) => ({ key, province }));

    if (!allEntries.length) return [];

    const stories = [];

    // 1. Active Custom Route ("🧭 Ankara ➔ Edirne")
    const routeNames =
      Array.isArray(state.customRouteCities) && state.customRouteCities.length
        ? state.customRouteCities
        : Array.isArray(data.custom_route) && data.custom_route.length
          ? data.custom_route
          : DEFAULT_ROUTE;

    const routeSlides = routeNames
      .map((name) => findProvinceByName(provinces, name))
      .filter(Boolean);

    const routeTitle =
      routeNames.length >= 2
        ? `🧭 ${routeNames[0]} ➔ ${routeNames[routeNames.length - 1]}`
        : '🧭 Aktif Sefer Rotası';

    if (routeSlides.length) {
      stories.push({
        id: 'active-route',
        emoji: '🧭',
        title: routeTitle,
        subtitle: `${routeSlides.length} Durak • Aktif Sefer`,
        ringGradient: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #38bdf8 100%)',
        slides: routeSlides
      });
    }

    // 2. Güneydoğu Anadolu ("🏜️ Mezopotamya (0/9)")
    const mesopotamiaRaw = allEntries.filter(
      (e) => e.province.region_code === '07_GuneydoguAnadolu' || norm(e.province.region).includes('guneydogu')
    );
    const mesopotamiaSlides = orderWithPriority(mesopotamiaRaw, MESOPOTAMIA_ORDER);
    if (mesopotamiaSlides.length) {
      const mesoVisited = mesopotamiaSlides.filter((s) => Boolean(s.province.visited)).length;
      stories.push({
        id: 'mesopotamia',
        emoji: '🏜️',
        title: `🏜️ Mezopotamya (${mesoVisited}/${mesopotamiaSlides.length})`,
        subtitle: 'Güneydoğu Anadolu',
        ringGradient: 'linear-gradient(135deg, #f97316 0%, #f59e0b 55%, #fbbf24 100%)',
        slides: mesopotamiaSlides
      });
    }

    // 3. Karadeniz Yaylaları (Karadeniz provinces)
    const karadenizRaw = allEntries.filter(
      (e) => e.province.region_code === '05_Karadeniz' || norm(e.province.region).includes('karadeniz')
    );
    const karadenizSlides = orderWithPriority(karadenizRaw, KARADENIZ_PRIORITY);
    if (karadenizSlides.length) {
      stories.push({
        id: 'karadeniz',
        emoji: '🌲',
        title: '🌲 Karadeniz Yaylaları',
        subtitle: `${karadenizSlides.length} Yeşil İl`,
        ringGradient: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #059669 100%)',
        slides: karadenizSlides
      });
    }

    // 4. Maneviyat Başkentleri (Konya, Şanlıurfa, Bursa, Edirne, İstanbul, Nevşehir)
    const spiritualSlides = SPIRITUAL_CAPITALS
      .map((name) => findProvinceByName(provinces, name))
      .filter(Boolean);
    if (spiritualSlides.length) {
      stories.push({
        id: 'spiritual',
        emoji: '🕌',
        title: '🕌 Maneviyat Başkentleri',
        subtitle: `${spiritualSlides.length} Kadim Şehir`,
        ringGradient: 'linear-gradient(135deg, #f59e0b 0%, #a855f7 55%, #ec4899 100%)',
        slides: spiritualSlides
      });
    }

    // 5. Ege & Akdeniz (coastal gems)
    const coastalSlides = [];
    const coastalUsed = new Set();
    COASTAL_GEMS.forEach((name) => {
      const hit = findProvinceByName(provinces, name);
      if (hit && !coastalUsed.has(hit.key)) {
        coastalUsed.add(hit.key);
        coastalSlides.push(hit);
      }
    });
    if (coastalSlides.length < 6) {
      allEntries
        .filter((e) => e.province.region_code === '02_Ege' || e.province.region_code === '03_Akdeniz')
        .sort(sortByPlate)
        .forEach((e) => {
          if (!coastalUsed.has(e.key) && coastalSlides.length < 8) {
            coastalUsed.add(e.key);
            coastalSlides.push(e);
          }
        });
    }
    if (coastalSlides.length) {
      stories.push({
        id: 'coastal',
        emoji: '🌊',
        title: '🌊 Ege & Akdeniz',
        subtitle: `${coastalSlides.length} Sahil İncisi`,
        ringGradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #10b981 100%)',
        slides: coastalSlides
      });
    }

    // 6. Visited Sample ("✅ 39 Fethedilen İl")
    const visitedEntries = allEntries.filter((e) => Boolean(e.province && e.province.visited));
    const visitedOrdered = orderWithPriority(visitedEntries, VISITED_SAMPLE_PRIORITY);
    const visitedSample = visitedOrdered.slice(0, 12);
    if (visitedSample.length) {
      stories.push({
        id: 'visited-sample',
        emoji: '✅',
        title: `✅ ${visitedEntries.length} Fethedilen İl`,
        subtitle: `${visitedSample.length} Kare Seçki`,
        ringGradient: 'linear-gradient(135deg, #10b981 0%, #00f2fe 55%, #4facfe 100%)',
        slides: visitedSample
      });
    }

    return stories;
  }

  // =========================================================================
  // Scoped CSS Injection (Light + Dark Support)
  // =========================================================================

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* -------------------------------------------------------------------
         Anadolu Hikayeleri — Story Rings Bar (.anadolu-stories-bar)
         ------------------------------------------------------------------- */
      .anadolu-stories-bar {
        max-width: 1100px;
        margin: 0 auto 24px auto;
        padding: 16px 20px 18px;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.45);
        position: relative;
        overflow: hidden;
      }

      body.light-theme .anadolu-stories-bar,
      [data-theme="light"] .anadolu-stories-bar {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 10px 28px -12px rgba(15, 23, 42, 0.14);
      }

      .asr-bar-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      .asr-bar-title-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .asr-bar-title {
        font-family: var(--font-heading, inherit);
        font-size: 0.98rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        letter-spacing: -0.01em;
        margin: 0;
      }

      .asr-bar-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: 9999px;
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.28);
        white-space: nowrap;
      }

      body.light-theme .asr-bar-badge,
      [data-theme="light"] .asr-bar-badge {
        color: #0284c7;
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.24);
      }

      .asr-bar-hint {
        font-size: 0.74rem;
        color: var(--text-muted, #94a3b8);
        white-space: nowrap;
      }

      .asr-rings-track {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        overflow-x: auto;
        padding: 4px 2px 2px;
        scrollbar-width: none;
        -ms-overflow-style: none;
        scroll-snap-type: x proximity;
      }

      .asr-rings-track::-webkit-scrollbar {
        display: none;
      }

      .asr-ring-btn {
        appearance: none;
        background: transparent;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        flex: 1 0 112px;
        max-width: 162px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 8px;
        color: inherit;
        font-family: inherit;
        scroll-snap-align: start;
        transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .asr-ring-btn:hover {
        transform: translateY(-3px);
      }

      .asr-ring-btn:focus-visible {
        outline: 2px solid var(--accent-cyan, #00f2fe);
        outline-offset: 4px;
        border-radius: 14px;
      }

      .asr-ring-outer {
        position: relative;
        width: 78px;
        height: 78px;
        border-radius: 50%;
        padding: 3px;
        background: var(--asr-ring-gradient, linear-gradient(135deg, #00f2fe, #a855f7));
        box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.5);
        transition: transform 0.24s ease, filter 0.24s ease, opacity 0.24s ease;
      }

      .asr-ring-btn:hover .asr-ring-outer {
        transform: scale(1.05);
        filter: saturate(1.15);
      }

      .asr-ring-btn.is-seen .asr-ring-outer {
        background: rgba(148, 163, 184, 0.38);
        box-shadow: none;
      }

      body.light-theme .asr-ring-btn.is-seen .asr-ring-outer,
      [data-theme="light"] .asr-ring-btn.is-seen .asr-ring-outer {
        background: rgba(100, 116, 139, 0.28);
      }

      .asr-ring-gap {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        padding: 3px;
        background: var(--bg-secondary, #0f172a);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      body.light-theme .asr-ring-gap,
      [data-theme="light"] .asr-ring-gap {
        background: #ffffff;
      }

      .asr-ring-inner {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        overflow: hidden;
        background: #0f172a;
      }

      .asr-ring-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s ease;
      }

      .asr-ring-btn:hover .asr-ring-img {
        transform: scale(1.08);
      }

      .asr-ring-emoji {
        position: absolute;
        right: -2px;
        bottom: -2px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.78rem;
        background: var(--bg-secondary, #0f172a);
        border: 2px solid var(--bg-secondary, #0f172a);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.45);
        z-index: 2;
      }

      body.light-theme .asr-ring-emoji,
      [data-theme="light"] .asr-ring-emoji {
        background: #ffffff;
        border-color: #ffffff;
        box-shadow: 0 3px 10px rgba(15, 23, 42, 0.16);
      }

      .asr-ring-title {
        font-size: 0.78rem;
        font-weight: 700;
        line-height: 1.25;
        color: var(--text-primary, #f8fafc);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        word-break: break-word;
      }

      .asr-ring-meta {
        font-size: 0.68rem;
        color: var(--text-muted, #94a3b8);
        font-weight: 500;
      }

      /* -------------------------------------------------------------------
         Fullscreen Story Modal (#seyyah-story-modal)
         ------------------------------------------------------------------- */
      #${MODAL_ID} {
        position: fixed;
        inset: 0;
        z-index: 10050;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(4, 8, 18, 0.92);
        backdrop-filter: blur(22px);
        -webkit-backdrop-filter: blur(22px);
        opacity: 0;
        transition: opacity 0.22s ease;
      }

      #${MODAL_ID}.active {
        display: flex;
        opacity: 1;
      }

      .asr-ambient-bg {
        position: absolute;
        inset: -24px;
        background-size: cover;
        background-position: center;
        filter: blur(48px) brightness(0.32) saturate(1.25);
        transform: scale(1.12);
        pointer-events: none;
        transition: background-image 0.35s ease;
      }

      .asr-stage-wrap {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
        width: 100%;
        height: 100%;
        max-width: 640px;
      }

      .asr-desktop-nav {
        appearance: none;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(15, 23, 42, 0.68);
        backdrop-filter: blur(12px);
        color: #f8fafc;
        font-size: 1.15rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
      }

      .asr-desktop-nav:hover {
        transform: scale(1.08);
        background: rgba(30, 41, 59, 0.9);
        border-color: rgba(0, 242, 254, 0.55);
      }

      .asr-story-card {
        position: relative;
        width: min(440px, 100%);
        height: min(88vh, 800px);
        border-radius: 24px;
        overflow: hidden;
        background: #070b14;
        border: 1px solid rgba(255, 255, 255, 0.16);
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.78);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        user-select: none;
        -webkit-user-select: none;
      }

      .asr-slide-media {
        position: absolute;
        inset: 0;
        overflow: hidden;
        background: #0b1220;
      }

      .asr-slide-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transform-origin: center center;
        animation: asrKenBurns 5.6s ease-out forwards;
      }

      .asr-story-card.is-paused .asr-slide-img {
        animation-play-state: paused;
      }

      @keyframes asrKenBurns {
        0% {
          transform: scale(1.01);
        }
        100% {
          transform: scale(1.08);
        }
      }

      .asr-vignette-top {
        position: absolute;
        inset: 0 0 auto 0;
        height: 170px;
        background: linear-gradient(180deg, rgba(4, 8, 18, 0.85) 0%, rgba(4, 8, 18, 0.42) 55%, rgba(4, 8, 18, 0) 100%);
        pointer-events: none;
      }

      .asr-vignette-bottom {
        position: absolute;
        inset: auto 0 0 0;
        height: 62%;
        background: linear-gradient(0deg, rgba(4, 8, 18, 0.96) 0%, rgba(4, 8, 18, 0.82) 38%, rgba(4, 8, 18, 0.32) 74%, rgba(4, 8, 18, 0) 100%);
        pointer-events: none;
      }

      /* Tap Zones */
      .asr-tap-zone {
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 4;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      .asr-tap-zone--prev {
        left: 0;
        width: 34%;
      }

      .asr-tap-zone--next {
        right: 0;
        width: 66%;
      }

      /* Top Overlay */
      .asr-top-overlay {
        position: relative;
        z-index: 6;
        padding: 14px 14px 8px;
        display: flex;
        flex-direction: column;
        gap: 11px;
        pointer-events: none;
      }

      .asr-progress-row {
        display: flex;
        align-items: center;
        gap: 4px;
        width: 100%;
      }

      .asr-progress-track {
        flex: 1;
        height: 3px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.28);
        overflow: hidden;
      }

      .asr-progress-fill {
        height: 100%;
        width: 0%;
        border-radius: inherit;
        background: #ffffff;
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.55);
      }

      .asr-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .asr-story-ident {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .asr-story-thumb {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(255, 255, 255, 0.85);
        flex-shrink: 0;
      }

      .asr-story-meta {
        min-width: 0;
      }

      .asr-story-name {
        font-family: var(--font-heading, inherit);
        font-size: 0.88rem;
        font-weight: 700;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
      }

      .asr-story-sub {
        font-size: 0.72rem;
        color: rgba(226, 232, 240, 0.85);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .asr-paused-pill {
        display: none;
        padding: 1px 6px;
        border-radius: 9999px;
        font-size: 0.64rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: rgba(245, 158, 11, 0.28);
        color: #fde68a;
        border: 1px solid rgba(245, 158, 11, 0.5);
      }

      .asr-story-card.is-paused .asr-paused-pill {
        display: inline-block;
      }

      .asr-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: auto;
        flex-shrink: 0;
      }

      .asr-ctrl-btn {
        appearance: none;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.22);
        background: rgba(15, 23, 42, 0.55);
        backdrop-filter: blur(10px);
        color: #ffffff;
        font-size: 0.92rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.18s ease, transform 0.18s ease;
      }

      .asr-ctrl-btn:hover {
        background: rgba(30, 41, 59, 0.85);
        transform: scale(1.06);
      }

      /* Bottom Overlay */
      .asr-bottom-overlay {
        position: relative;
        z-index: 6;
        padding: 18px 20px 20px;
        display: flex;
        flex-direction: column;
        gap: 11px;
        pointer-events: none;
      }

      .asr-badges-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 7px;
      }

      .asr-plate-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        padding: 3px 9px;
        border-radius: 8px;
        font-family: var(--font-heading, inherit);
        font-size: 0.78rem;
        font-weight: 800;
        color: #040812;
        background: #ffffff;
        letter-spacing: 0.04em;
      }

      .asr-region-pill,
      .asr-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px;
        border-radius: 9999px;
        font-size: 0.73rem;
        font-weight: 600;
        backdrop-filter: blur(8px);
      }

      .asr-region-pill {
        color: #e2e8f0;
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }

      .asr-status-pill.is-visited {
        color: #a7f3d0;
        background: rgba(16, 185, 129, 0.22);
        border: 1px solid rgba(16, 185, 129, 0.48);
      }

      .asr-status-pill.is-pending {
        color: #fde68a;
        background: rgba(245, 158, 11, 0.2);
        border: 1px solid rgba(245, 158, 11, 0.45);
      }

      .asr-city-name {
        margin: 0;
        font-family: var(--font-heading, inherit);
        font-size: 1.95rem;
        font-weight: 800;
        line-height: 1.1;
        color: #ffffff;
        letter-spacing: -0.02em;
        text-shadow: 0 2px 14px rgba(0, 0, 0, 0.7);
      }

      .asr-city-quote {
        margin: 0;
        font-size: 0.87rem;
        line-height: 1.48;
        color: rgba(241, 245, 249, 0.92);
        border-left: 3px solid rgba(0, 242, 254, 0.75);
        padding-left: 10px;
        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.65);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .asr-landmarks {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .asr-landmark-chip {
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.72rem;
        font-weight: 600;
        color: #f8fafc;
        background: rgba(255, 255, 255, 0.14);
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(8px);
      }

      .asr-footer-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: 4px;
        pointer-events: auto;
      }

      .asr-cta-btn {
        appearance: none;
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 18px;
        border-radius: 14px;
        border: none;
        cursor: pointer;
        font-family: var(--font-heading, inherit);
        font-size: 0.92rem;
        font-weight: 700;
        color: #06101f;
        background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
        box-shadow: 0 10px 26px -6px rgba(0, 242, 254, 0.55);
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }

      .asr-cta-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 30px -6px rgba(0, 242, 254, 0.7);
      }

      .asr-cta-btn:active {
        transform: translateY(0);
      }

      @media (max-width: 640px) {
        .anadolu-stories-bar {
          padding: 14px 14px 16px;
          margin-bottom: 18px;
          border-radius: 16px;
        }

        .asr-bar-hint {
          display: none;
        }

        .asr-rings-track {
          gap: 12px;
        }

        .asr-ring-btn {
          flex: 0 0 92px;
        }

        .asr-ring-outer {
          width: 68px;
          height: 68px;
        }

        #${MODAL_ID} {
          padding: 0;
        }

        .asr-desktop-nav {
          display: none;
        }

        .asr-story-card {
          width: 100%;
          height: 100dvh;
          max-height: 100dvh;
          border-radius: 0;
          border: none;
        }

        .asr-city-name {
          font-size: 1.65rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .asr-slide-img {
          animation: none !important;
        }
        .asr-ring-btn,
        .asr-ring-outer,
        .asr-ring-img,
        #${MODAL_ID} {
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // Stories Bar Rendering & MutationObserver
  // =========================================================================

  function renderStoriesBar(viewport, ctx) {
    if (!viewport || !ctx) return;
    if (viewport.querySelector('.anadolu-stories-bar')) return;

    currentStories = buildStories(ctx);
    if (!currentStories.length) return;

    const bar = document.createElement('section');
    bar.className = 'anadolu-stories-bar';
    bar.setAttribute('aria-label', 'Anadolu Hikayeleri');

    const ringsHtml = currentStories.map((story, idx) => {
      const firstSlide = story.slides[0];
      const thumbUrl = getBannerUrl(firstSlide.key, firstSlide.province);
      const isSeen = seenStoryIds.has(story.id);
      const countLabel = story.id === 'active-route'
        ? `${story.slides.length} durak`
        : `${story.slides.length} il`;

      return `
        <button type="button"
                class="asr-ring-btn${isSeen ? ' is-seen' : ''}"
                data-asr-story-idx="${idx}"
                aria-label="${esc(story.title)} hikayesini aç (${esc(countLabel)})">
          <div class="asr-ring-outer" style="--asr-ring-gradient: ${esc(story.ringGradient)};">
            <div class="asr-ring-gap">
              <div class="asr-ring-inner">
                <img class="asr-ring-img" src="${esc(thumbUrl)}" alt="${esc(firstSlide.province.name)}" loading="lazy" />
              </div>
            </div>
            <span class="asr-ring-emoji" aria-hidden="true">${esc(story.emoji)}</span>
          </div>
          <span class="asr-ring-title">${esc(story.title)}</span>
          <span class="asr-ring-meta">${esc(countLabel)}</span>
        </button>
      `;
    }).join('');

    bar.innerHTML = `
      <div class="asr-bar-head">
        <div class="asr-bar-title-wrap">
          <h3 class="asr-bar-title">✨ Anadolu Hikayeleri</h3>
          <span class="asr-bar-badge">${currentStories.length} Seçki</span>
        </div>
        <span class="asr-bar-hint">Dokun & Keşfet • 5sn Akış</span>
      </div>
      <div class="asr-rings-track" role="list">
        ${ringsHtml}
      </div>
    `;

    bar.querySelectorAll('.asr-ring-btn[data-asr-story-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-asr-story-idx'));
        lastFocusedEl = btn;
        openStoryModal(Number.isFinite(idx) ? idx : 0);
      });
    });

    viewport.prepend(bar);
  }

  function maybeMountOnDashboard(viewport, ctx) {
    if (!viewport || !ctx || !ctx.state) return;
    if (ctx.state.currentView === 'dashboard' && !viewport.querySelector('.anadolu-stories-bar')) {
      renderStoriesBar(viewport, ctx);
    }
  }

  function initViewportObserver(ctx) {
    const viewport = document.getElementById('viewport-content');
    if (!viewport) return;

    if (viewportObserver) {
      viewportObserver.disconnect();
    }

    if (typeof MutationObserver === 'function') {
      viewportObserver = new MutationObserver(() => {
        maybeMountOnDashboard(viewport, activeCtx || ctx);
      });
      viewportObserver.observe(viewport, { childList: true });
    }

    // Also mount immediately if dashboard is already present
    maybeMountOnDashboard(viewport, ctx);
  }

  // =========================================================================
  // Fullscreen Story Modal & 5s Playback Engine
  // =========================================================================

  function ensureModalDOM() {
    if (modalEl && document.body.contains(modalEl)) return modalEl;

    const existing = document.getElementById(MODAL_ID);
    if (existing) {
      modalEl = existing;
      return modalEl;
    }

    const el = document.createElement('div');
    el.id = MODAL_ID;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Anadolu Hikayeleri Tam Ekran Görünümü');
    el.setAttribute('aria-hidden', 'true');

    el.innerHTML = `
      <div class="asr-ambient-bg" data-asr-ambient></div>
      <div class="asr-stage-wrap">
        <button type="button" class="asr-desktop-nav asr-desktop-nav--prev" data-asr-action="prev" aria-label="Önceki Hikaye Karesi">&#10094;</button>
        <div class="asr-story-card" data-asr-card>
          <div class="asr-slide-media">
            <img class="asr-slide-img" data-asr-img src="" alt="" />
            <div class="asr-vignette-top"></div>
            <div class="asr-vignette-bottom"></div>
          </div>

          <div class="asr-tap-zone asr-tap-zone--prev" data-asr-action="prev" aria-label="Önceki Kare"></div>
          <div class="asr-tap-zone asr-tap-zone--next" data-asr-action="next" aria-label="Sonraki Kare"></div>

          <div class="asr-top-overlay">
            <div class="asr-progress-row" data-asr-progress-row></div>
            <div class="asr-header-row">
              <div class="asr-story-ident">
                <img class="asr-story-thumb" data-asr-thumb src="" alt="" />
                <div class="asr-story-meta">
                  <div class="asr-story-name" data-asr-story-title></div>
                  <div class="asr-story-sub">
                    <span data-asr-counter></span>
                    <span class="asr-paused-pill">Duraklatıldı</span>
                  </div>
                </div>
              </div>
              <div class="asr-controls">
                <button type="button" class="asr-ctrl-btn asr-pause-btn" data-asr-action="pause" aria-label="Duraklat" aria-pressed="false" title="Duraklat / Devam Et">⏸</button>
                <button type="button" class="asr-ctrl-btn asr-close-btn" data-asr-action="close" aria-label="Kapat" title="Kapat (ESC)">✕</button>
              </div>
            </div>
          </div>

          <div class="asr-bottom-overlay">
            <div class="asr-badges-row">
              <span class="asr-plate-badge" data-asr-plate></span>
              <span class="asr-region-pill" data-asr-region></span>
              <span class="asr-status-pill" data-asr-status></span>
            </div>
            <h2 class="asr-city-name" data-asr-city></h2>
            <p class="asr-city-quote" data-asr-quote></p>
            <div class="asr-landmarks" data-asr-landmarks></div>
            <div class="asr-footer-actions">
              <button type="button" class="asr-cta-btn" data-asr-action="goto">📍 Menzile Git ➔</button>
            </div>
          </div>
        </div>
        <button type="button" class="asr-desktop-nav asr-desktop-nav--next" data-asr-action="next" aria-label="Sonraki Hikaye Karesi">&#10095;</button>
      </div>
    `;

    // Backdrop click closes modal
    el.addEventListener('click', (e) => {
      if (e.target === el || e.target.classList.contains('asr-stage-wrap')) {
        closeStoryModal();
      }
    });

    el.querySelectorAll('[data-asr-action="prev"]').forEach((node) => {
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
      });
    });

    el.querySelectorAll('[data-asr-action="next"]').forEach((node) => {
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
      });
    });

    const pauseBtn = el.querySelector('[data-asr-action="pause"]');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePause();
      });
    }

    const closeBtn = el.querySelector('[data-asr-action="close"]');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeStoryModal();
      });
    }

    const gotoBtn = el.querySelector('[data-asr-action="goto"]');
    if (gotoBtn) {
      gotoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const story = currentStories[activeStoryIndex];
        const slide = story && story.slides[activeSlideIndex];
        closeStoryModal();
        if (slide && activeCtx && typeof activeCtx.selectCity === 'function') {
          activeCtx.selectCity(slide.key);
        }
      });
    }

    document.body.appendChild(el);
    modalEl = el;
    return modalEl;
  }

  function stopProgressLoop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function syncPauseUI() {
    if (!modalEl) return;
    const card = modalEl.querySelector('[data-asr-card]');
    const pauseBtn = modalEl.querySelector('[data-asr-action="pause"]');
    if (card) card.classList.toggle('is-paused', isPaused);
    if (pauseBtn) {
      pauseBtn.textContent = isPaused ? '▶' : '⏸';
      pauseBtn.setAttribute('aria-pressed', isPaused ? 'true' : 'false');
      pauseBtn.setAttribute('aria-label', isPaused ? 'Devam Et' : 'Duraklat');
    }
  }

  function startProgressLoop() {
    stopProgressLoop();
    if (!isModalOpen || isPaused) return;

    slideStartTs = performance.now();

    function tick(now) {
      if (!isModalOpen || isPaused) return;
      const elapsed = accumulatedMs + (now - slideStartTs);
      const pct = Math.min(100, (elapsed / SLIDE_DURATION_MS) * 100);

      if (modalEl) {
        const fills = modalEl.querySelectorAll('.asr-progress-fill');
        const activeFill = fills[activeSlideIndex];
        if (activeFill) {
          activeFill.style.width = `${pct}%`;
        }
      }

      if (elapsed >= SLIDE_DURATION_MS) {
        nextSlide();
        return;
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
  }

  function togglePause() {
    if (!isModalOpen) return;
    if (isPaused) {
      isPaused = false;
      syncPauseUI();
      startProgressLoop();
    } else {
      accumulatedMs += performance.now() - slideStartTs;
      isPaused = true;
      stopProgressLoop();
      syncPauseUI();
    }
  }

  function markStorySeen(storyId) {
    if (!storyId) return;
    seenStoryIds.add(storyId);
    const viewport = document.getElementById('viewport-content');
    if (!viewport) return;
    const idx = currentStories.findIndex((s) => s.id === storyId);
    if (idx >= 0) {
      const btn = viewport.querySelector(`.asr-ring-btn[data-asr-story-idx="${idx}"]`);
      if (btn) btn.classList.add('is-seen');
    }
  }

  function renderCurrentSlide() {
    const story = currentStories[activeStoryIndex];
    if (!story || !story.slides || !story.slides.length) {
      closeStoryModal();
      return;
    }

    if (activeSlideIndex < 0) activeSlideIndex = 0;
    if (activeSlideIndex >= story.slides.length) activeSlideIndex = story.slides.length - 1;

    markStorySeen(story.id);

    const modal = ensureModalDOM();
    const slide = story.slides[activeSlideIndex];
    const prov = slide.province || {};
    const bannerUrl = getBannerUrl(slide.key, prov);

    // Ambient backdrop
    const ambientEl = modal.querySelector('[data-asr-ambient]');
    if (ambientEl) {
      ambientEl.style.backgroundImage = bannerUrl ? `url("${bannerUrl}")` : 'none';
    }

    // Main slide image (re-trigger subtle Ken Burns animation cleanly)
    const imgEl = modal.querySelector('[data-asr-img]');
    if (imgEl) {
      imgEl.style.animation = 'none';
      imgEl.src = bannerUrl;
      imgEl.alt = prov.name || '';
      void imgEl.offsetWidth;
      imgEl.style.animation = '';
    }

    // Progress segments
    const progressRow = modal.querySelector('[data-asr-progress-row]');
    if (progressRow) {
      progressRow.innerHTML = story.slides.map((_, idx) => {
        const initialWidth = idx < activeSlideIndex ? '100%' : '0%';
        return `<div class="asr-progress-track"><div class="asr-progress-fill" style="width: ${initialWidth};"></div></div>`;
      }).join('');
    }

    // Header info
    const thumbEl = modal.querySelector('[data-asr-thumb]');
    if (thumbEl) {
      const firstSlide = story.slides[0];
      thumbEl.src = getBannerUrl(firstSlide.key, firstSlide.province);
      thumbEl.alt = story.title;
    }

    const titleEl = modal.querySelector('[data-asr-story-title]');
    if (titleEl) titleEl.textContent = story.title;

    const counterEl = modal.querySelector('[data-asr-counter]');
    if (counterEl) {
      counterEl.textContent = `${activeSlideIndex + 1} / ${story.slides.length} • ${story.subtitle}`;
    }

    // Province details
    const plateEl = modal.querySelector('[data-asr-plate]');
    if (plateEl) plateEl.textContent = formatPlate(prov.plate);

    const regionEl = modal.querySelector('[data-asr-region]');
    if (regionEl) regionEl.textContent = prov.region ? `${prov.region} Bölgesi` : 'Anadolu';

    const statusEl = modal.querySelector('[data-asr-status]');
    if (statusEl) {
      const visited = Boolean(prov.visited);
      statusEl.className = `asr-status-pill ${visited ? 'is-visited' : 'is-pending'}`;
      statusEl.textContent = visited ? '✅ Adımlandı' : '📍 Keşif Bekliyor';
    }

    const cityEl = modal.querySelector('[data-asr-city]');
    if (cityEl) cityEl.textContent = prov.name || slide.key;

    const quoteEl = modal.querySelector('[data-asr-quote]');
    if (quoteEl) {
      const quoteText = prov.quote || prov.custom_quote || 'Anadolu’nun kadim duraklarından biri.';
      quoteEl.textContent = `“${quoteText}”`;
    }

    const landmarksEl = modal.querySelector('[data-asr-landmarks]');
    if (landmarksEl) {
      const items = Array.isArray(prov.landmarks) ? prov.landmarks.slice(0, 4) : [];
      landmarksEl.innerHTML = items.map((lm) => `<span class="asr-landmark-chip">🏛️ ${esc(lm)}</span>`).join('');
    }

    // Preload upcoming slide image
    const nextInStory = story.slides[activeSlideIndex + 1];
    if (nextInStory) {
      preloadImage(getBannerUrl(nextInStory.key, nextInStory.province));
    } else if (currentStories[activeStoryIndex + 1] && currentStories[activeStoryIndex + 1].slides[0]) {
      const nextStoryFirst = currentStories[activeStoryIndex + 1].slides[0];
      preloadImage(getBannerUrl(nextStoryFirst.key, nextStoryFirst.province));
    }

    accumulatedMs = 0;
    syncPauseUI();
    startProgressLoop();
  }

  function nextSlide() {
    if (!isModalOpen) return;
    const story = currentStories[activeStoryIndex];
    if (!story) {
      closeStoryModal();
      return;
    }

    if (activeSlideIndex < story.slides.length - 1) {
      activeSlideIndex += 1;
      renderCurrentSlide();
    } else if (activeStoryIndex < currentStories.length - 1) {
      activeStoryIndex += 1;
      activeSlideIndex = 0;
      renderCurrentSlide();
    } else {
      closeStoryModal();
    }
  }

  function prevSlide() {
    if (!isModalOpen) return;
    if (activeSlideIndex > 0) {
      activeSlideIndex -= 1;
      renderCurrentSlide();
    } else if (activeStoryIndex > 0) {
      activeStoryIndex -= 1;
      const prevStory = currentStories[activeStoryIndex];
      activeSlideIndex = prevStory && prevStory.slides.length ? prevStory.slides.length - 1 : 0;
      renderCurrentSlide();
    } else {
      // Restart first slide from 0%
      accumulatedMs = 0;
      renderCurrentSlide();
    }
  }

  function openStoryModal(storyIdx) {
    if (!currentStories.length) {
      currentStories = buildStories(activeCtx);
    }
    if (!currentStories.length) return;

    activeStoryIndex = Math.max(0, Math.min(storyIdx || 0, currentStories.length - 1));
    activeSlideIndex = 0;
    isPaused = false;
    accumulatedMs = 0;

    const modal = ensureModalDOM();
    isModalOpen = true;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    renderCurrentSlide();

    const closeBtn = modal.querySelector('[data-asr-action="close"]');
    if (closeBtn) {
      requestAnimationFrame(() => {
        try {
          closeBtn.focus();
        } catch (err) {}
      });
    }
  }

  function closeStoryModal() {
    if (!isModalOpen && (!modalEl || !modalEl.classList.contains('active'))) return;
    isModalOpen = false;
    isPaused = false;
    accumulatedMs = 0;
    stopProgressLoop();

    if (modalEl) {
      modalEl.classList.remove('active');
      modalEl.setAttribute('aria-hidden', 'true');
    }

    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function' && document.contains(lastFocusedEl)) {
      try {
        lastFocusedEl.focus();
      } catch (err) {}
    }
    lastFocusedEl = null;
  }

  function handleKeydown(e) {
    if (!isModalOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closeStoryModal();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      nextSlide();
    } else if (e.key === ' ' || e.code === 'Space') {
      if (e.target && e.target.closest && e.target.closest('button')) return;
      e.preventDefault();
      e.stopPropagation();
      togglePause();
    }
  }

  // =========================================================================
  // Public Module Entry Point
  // =========================================================================

  function init(ctx) {
    activeCtx = ctx || {};
    injectStyles();
    initViewportObserver(activeCtx);

    if (!keydownBound) {
      document.addEventListener('keydown', handleKeydown, true);
      keydownBound = true;
    }
  }

  window.SEYYAH_MODULES.storyReels = {
    init
  };
})();
