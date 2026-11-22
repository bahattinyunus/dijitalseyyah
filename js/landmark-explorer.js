/**
 * Anadolu Miras & Durak Ansiklopedisi Modülü
 * 81 İlin 350+ Tarihi, Kültürel ve Doğal Mirasını Keşfet, Sınıflandır ve Filtrele
 * Registers on window.SEYYAH_MODULES.landmarks
 */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  // Fallback helpers in case ctx omits any utility
  function fallbackNormalizeTurkish(str) {
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

  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Fallback region metadata if data.stats.regional_breakdown is absent
  const DEFAULT_REGIONS = {
    '01_Marmara': { name: 'Marmara Bölgesi', short: 'Marmara', icon: '🏰', color: '#38bdf8' },
    '02_Ege': { name: 'Ege Bölgesi', short: 'Ege', icon: '🌊', color: '#34d399' },
    '03_Akdeniz': { name: 'Akdeniz Bölgesi', short: 'Akdeniz', icon: '☀️', color: '#f59e0b' },
    '04_IcAnadolu': { name: 'İç Anadolu Bölgesi', short: 'İç Anadolu', icon: '🌾', color: '#fbbf24' },
    '05_Karadeniz': { name: 'Karadeniz Bölgesi', short: 'Karadeniz', icon: '🌲', color: '#10b981' },
    '06_DoguAnadolu': { name: 'Doğu Anadolu Bölgesi', short: 'Doğu Anadolu', icon: '🏔️', color: '#a855f7' },
    '07_GuneydoguAnadolu': { name: 'Güneydoğu Anadolu Bölgesi', short: 'Güneydoğu', icon: '🏜️', color: '#f97316' }
  };

  // 4 Core Auto-Classification Categories (Turkish-normalized matchers)
  const CATEGORIES = [
    {
      id: 'mosque',
      icon: '🕌',
      label: 'Camiler, Türbeler & Külliyeler',
      shortLabel: 'Camiler & Türbeler',
      color: '#10b981',
      regex: /(cami|turbe|medrese|kulliye|dergah|mescit|tekke|minare|kumbet|imaret|zaviye|ayasofya|eyup sultan|mevlana|haci bektas)/
    },
    {
      id: 'ancient',
      icon: '🏺',
      label: 'Antik Kentler & Müzeler',
      shortLabel: 'Antik & Müzeler',
      color: '#f59e0b',
      regex: /(antik|muze|hoyuk|tiyatro|tapinak|tapinagi|manastir|kilise|gobeklitepe|truva|efes|hattusas|yeralti|harabe|oren|nekropol|mezar|tumulus|zeugma|sagalassos|aspendos|perge|bergama|hasankeyf|laodikeia|termessos|olympos|kanlidivane|st\.\s*paul|midas|katedral|bazilika|\bani\b|nemrut)/
    },
    {
      id: 'nature',
      icon: '🏞️',
      label: 'Doğa, Şelale, Göl & Kanyonlar',
      shortLabel: 'Doğa & Kanyonlar',
      color: '#06b6d4',
      regex: /(gol|selale|kanyon|vadi|magara|dag|yayla|orman|milli park|ada|koy|obruk|traverten|longoz|plaj|kayalik|arboretum|oludeniz|pasabaglari|teras|meteor|palandoken|merga butan|gozeleri|bahceleri|rasil hacar|silueti|nehir|nehri|irmak|dere|kaplica|termal|kus cenneti|park|sahil|falez|peribaca|peri baca|pinar|krater|bogaz|delta|lagun)/
    },
    {
      id: 'castle',
      icon: '🏰',
      label: 'Kaleler, Köprüler & Hanlar',
      shortLabel: 'Kaleler & Hanlar',
      color: '#a855f7',
      regex: /(kale|sur|kopru|kervansaray|\bhan(i|lar|lari)?\b|kule|konak|konagi|evleri|\bevi\b|evler|saray|carsi|bedesten|hamam|hisar|burc|tabya|kosk|saat|fener|cezaevi|kahvesi|konukevi|abide|anit|cumalikizik|sirince|mahallesi|kanali)/
    }
  ];

  const CATEGORY_MAP = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {});

  const SAVED_LANDMARKS_STORAGE_KEY = 'dijital_seyyah_saved_landmarks_v1';

  // Module-scoped UI state so filters persist across re-renders
  const uiState = {
    categoryId: 'all',
    regionCode: 'all',
    status: 'all', // 'all' | 'visited' | 'pending' | 'saved'
    searchQuery: '',
    spotlightId: null
  };

  function loadSavedLandmarkIds() {
    try {
      if (typeof localStorage === 'undefined') return new Set();
      const raw = localStorage.getItem(SAVED_LANDMARKS_STORAGE_KEY);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? new Set(parsed) : new Set();
    } catch (_) {
      return new Set();
    }
  }

  function saveSavedLandmarkIds(setObj) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(SAVED_LANDMARKS_STORAGE_KEY, JSON.stringify(Array.from(setObj)));
    } catch (_) {}
  }

  function classifyLandmark(name, normalizeFn) {
    const norm = normalizeFn(name);
    for (let i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].regex.test(norm)) {
        return CATEGORIES[i];
      }
    }
    // Graceful fallback to Kaleler, Köprüler & Hanlar (architectural/cultural stop)
    return CATEGORY_MAP.castle;
  }

  function ensureStyles() {
    if (document.getElementById('landmark-explorer-styles')) return;
    const style = document.createElement('style');
    style.id = 'landmark-explorer-styles';
    style.textContent = `
      .landmark-view {
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 1200px;
        margin: 0 auto;
        padding-bottom: 36px;
        animation: modFadeSlideUp 0.28s ease-out;
      }

      .landmark-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 14px;
      }

      .landmark-title {
        font-family: var(--font-heading);
        font-size: 1.65rem;
        font-weight: 800;
        letter-spacing: 0.25px;
        background: linear-gradient(135deg, #ffffff 0%, var(--accent-cyan) 55%, var(--accent-gold) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .landmark-title {
        background: linear-gradient(135deg, #0f172a 0%, #0284c7 58%, #b45309 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .landmark-sub {
        font-size: 0.88rem;
        color: var(--text-secondary);
        margin-top: 4px;
      }

      .landmark-kpi-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .landmark-kpi-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(30, 41, 59, 0.55);
        border: 1px solid var(--border-glass);
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      body.light-theme .landmark-kpi-pill {
        background: rgba(255, 255, 255, 0.82);
      }

      /* Category Stat Pills */
      .landmark-cat-pills {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(195px, 1fr));
        gap: 10px;
      }

      .landmark-cat-pill {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 12px 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(30, 41, 59, 0.55);
        border: 1px solid var(--border-glass);
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      body.light-theme .landmark-cat-pill {
        background: rgba(255, 255, 255, 0.78);
      }

      .landmark-cat-pill:hover {
        border-color: var(--accent-cyan);
        color: var(--text-primary);
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
      }

      .landmark-cat-pill.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.18) 0%, rgba(79, 172, 254, 0.16) 100%);
        border-color: var(--accent-cyan);
        color: var(--text-primary);
        box-shadow: 0 0 18px rgba(0, 242, 254, 0.22);
      }

      .landmark-cat-pill-left {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .landmark-cat-icon {
        font-size: 1.15rem;
        flex-shrink: 0;
      }

      .landmark-cat-name {
        line-height: 1.25;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .landmark-cat-count {
        padding: 3px 9px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
        font-family: var(--font-heading);
        font-size: 0.75rem;
        font-weight: 700;
        flex-shrink: 0;
      }

      body.light-theme .landmark-cat-count {
        background: rgba(15, 23, 42, 0.08);
        border-color: rgba(15, 23, 42, 0.12);
      }

      .landmark-cat-pill.active .landmark-cat-count {
        background: var(--accent-cyan);
        color: #061325;
        border-color: transparent;
      }

      /* Controls Bar */
      .landmark-controls {
        padding: 16px 18px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }

      .landmark-search-wrap {
        position: relative;
        flex: 1 1 260px;
        min-width: 220px;
      }

      .landmark-search-icon {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        pointer-events: none;
        font-size: 0.9rem;
      }

      .landmark-search-input {
        width: 100%;
        padding: 10px 36px 10px 38px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid var(--border-glass);
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 0.88rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      body.light-theme .landmark-search-input {
        background: rgba(255, 255, 255, 0.9);
      }

      .landmark-search-input:focus {
        border-color: var(--accent-cyan);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .landmark-search-clear {
        position: absolute;
        right: 9px;
        top: 50%;
        transform: translateY(-50%);
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: none;
        background: rgba(148, 163, 184, 0.22);
        color: var(--text-primary);
        font-size: 0.72rem;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
      }

      .landmark-search-clear:hover {
        background: rgba(239, 68, 68, 0.35);
      }

      .landmark-region-select {
        padding: 10px 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid var(--border-glass);
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        outline: none;
        min-width: 195px;
        transition: border-color 0.2s ease;
      }

      body.light-theme .landmark-region-select {
        background: rgba(255, 255, 255, 0.92);
      }

      .landmark-region-select:focus {
        border-color: var(--accent-cyan);
      }

      .landmark-status-group {
        display: inline-flex;
        padding: 3px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass);
        gap: 3px;
      }

      body.light-theme .landmark-status-group {
        background: rgba(226, 232, 240, 0.65);
      }

      .landmark-status-btn {
        padding: 7px 12px;
        border-radius: 9px;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
        white-space: nowrap;
      }

      .landmark-status-btn:hover {
        color: var(--text-primary);
      }

      .landmark-status-btn.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.24), rgba(79, 172, 254, 0.24));
        color: var(--text-primary);
        box-shadow: 0 2px 10px rgba(0, 242, 254, 0.18);
      }

      body.light-theme .landmark-status-btn.active {
        background: #ffffff;
        color: #0284c7;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.1);
      }

      /* Results Summary Bar */
      .landmark-results-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        font-size: 0.82rem;
        color: var(--text-secondary);
        padding: 0 4px;
      }

      /* Card Grid */
      .landmark-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(265px, 1fr));
        gap: 16px;
      }

      .landmark-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        cursor: pointer;
        padding: 0;
        position: relative;
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .landmark-card:hover {
        transform: translateY(-4px);
        border-color: rgba(0, 242, 254, 0.45);
        box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28);
      }

      .landmark-card:focus-visible {
        outline: 2px solid var(--accent-cyan);
        outline-offset: 2px;
      }

      .landmark-card-thumb {
        position: relative;
        height: 136px;
        width: 100%;
        overflow: hidden;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(30, 41, 59, 0.88));
      }

      .landmark-card-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.38s ease;
      }

      .landmark-card:hover .landmark-card-thumb img {
        transform: scale(1.07);
      }

      .landmark-card-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(8, 13, 26, 0.9) 0%, rgba(8, 13, 26, 0.16) 55%, rgba(8, 13, 26, 0.3) 100%);
        pointer-events: none;
      }

      .landmark-card-top {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
        pointer-events: none;
      }

      .landmark-plate-badge {
        padding: 2px 8px;
        border-radius: 6px;
        background: rgba(10, 15, 29, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #f8fafc;
        font-family: var(--font-heading);
        font-size: 0.72rem;
        font-weight: 700;
        backdrop-filter: blur(6px);
      }

      .landmark-card-cat-tag {
        position: absolute;
        bottom: 9px;
        left: 10px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(10, 15, 29, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.16);
        color: #f8fafc;
        font-size: 0.7rem;
        font-weight: 600;
        backdrop-filter: blur(6px);
        pointer-events: none;
      }

      .landmark-card-body {
        padding: 14px 15px 15px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        flex: 1;
      }

      .landmark-card-title {
        font-family: var(--font-heading);
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.32;
        display: flex;
        align-items: flex-start;
        gap: 7px;
        margin: 0;
      }

      .landmark-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border-glass);
        font-size: 0.78rem;
      }

      .landmark-city-name {
        font-weight: 600;
        color: var(--text-primary);
        display: inline-flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .landmark-region-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass);
        font-size: 0.71rem;
        font-weight: 600;
        white-space: nowrap;
        flex-shrink: 0;
        background: rgba(15, 23, 42, 0.35);
      }

      body.light-theme .landmark-region-badge {
        background: rgba(255, 255, 255, 0.85);
      }

      .landmark-empty {
        padding: 42px 24px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        color: var(--text-secondary);
      }

      /* Bookmark Button & Random Spotlight */
      .landmark-bookmark-btn {
        pointer-events: auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(10, 15, 29, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.22);
        color: #cbd5e1;
        font-family: var(--font-heading);
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
        backdrop-filter: blur(6px);
        transition: all 0.2s ease;
      }

      .landmark-bookmark-btn:hover {
        border-color: var(--accent-gold, #f59e0b);
        color: #fde68a;
        transform: scale(1.04);
      }

      .landmark-bookmark-btn.is-saved {
        background: rgba(245, 158, 11, 0.9);
        border-color: #fde68a;
        color: #0f172a;
        box-shadow: 0 0 12px rgba(245, 158, 11, 0.45);
      }

      .landmark-random-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 9px 14px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid rgba(245, 158, 11, 0.45);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(168, 85, 247, 0.2));
        color: var(--text-primary);
        font-family: var(--font-heading);
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;
      }

      .landmark-random-btn:hover {
        transform: translateY(-2px);
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 6px 18px rgba(245, 158, 11, 0.25);
      }

      .landmark-spotlight-card {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 16px 20px;
        border-radius: var(--radius-lg, 18px);
        background:
          radial-gradient(circle at 90% 20%, rgba(245, 158, 11, 0.2), transparent 50%),
          linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85));
        border: 1px solid rgba(245, 158, 11, 0.48);
        box-shadow: 0 12px 28px -10px rgba(245, 158, 11, 0.3);
        animation: modFadeSlideUp 0.26s ease-out;
      }

      body.light-theme .landmark-spotlight-card {
        background: linear-gradient(135deg, rgba(255, 251, 235, 0.96), rgba(254, 243, 199, 0.92));
        border-color: rgba(217, 119, 6, 0.45);
      }

      .landmark-card.is-saved-card {
        border-color: rgba(245, 158, 11, 0.45);
      }

      @media (max-width: 640px) {
        .landmark-cat-pills {
          grid-template-columns: 1fr 1fr;
        }
        .landmark-controls {
          flex-direction: column;
          align-items: stretch;
        }
        .landmark-region-select {
          width: 100%;
        }
        .landmark-status-group {
          width: 100%;
          justify-content: space-between;
        }
        .landmark-status-btn {
          flex: 1;
          text-align: center;
        }
      }
    `;

    const firstLink = document.head.querySelector('link[rel="stylesheet"]');
    if (firstLink) {
      document.head.insertBefore(style, firstLink);
    } else {
      document.head.appendChild(style);
    }
  }

  function buildLandmarkItems(data, normalizeTurkish) {
    const provinces = (data && data.provinces) || {};
    const regionalBreakdown = (data && data.stats && data.stats.regional_breakdown) || {};
    const items = [];

    Object.entries(provinces).forEach(([key, prov]) => {
      if (!prov || !Array.isArray(prov.landmarks)) return;

      const regionCode = prov.region_code || key.split('/')[0] || '';
      const rb = regionalBreakdown[regionCode] || DEFAULT_REGIONS[regionCode] || {};
      const regionName = prov.region || rb.short || rb.name || 'Anadolu';
      const regionIcon = rb.icon || '📍';
      const regionColor = rb.color || '#38bdf8';
      const plateNum = Number(prov.plate) || 0;
      const plateStr = String(plateNum).padStart(2, '0');
      const cityName = prov.name || key;
      const visited = Boolean(prov.visited);
      const bannerRel = prov.banner_rel || '';

      prov.landmarks.forEach((rawLandmark, idx) => {
        const title = String(rawLandmark || '').trim();
        if (!title) return;
        const cat = classifyLandmark(title, normalizeTurkish);

        const searchHaystack = normalizeTurkish([
          title,
          cityName,
          plateStr,
          String(plateNum),
          regionName,
          cat.label
        ].join(' '));

        items.push({
          id: `${key}::${idx}`,
          key,
          title,
          categoryId: cat.id,
          categoryIcon: cat.icon,
          categoryLabel: cat.label,
          categoryShort: cat.shortLabel,
          categoryColor: cat.color,
          cityName,
          plate: plateNum,
          plateStr,
          regionCode,
          regionName,
          regionIcon,
          regionColor,
          visited,
          bannerRel,
          searchHaystack
        });
      });
    });

    // Sort by plate number, then alphabetically by Turkish landmark name
    items.sort((a, b) => {
      if (a.plate !== b.plate) return a.plate - b.plate;
      return a.title.localeCompare(b.title, 'tr');
    });

    return items;
  }

  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const data = safeCtx.data || window.TRAVEL_DATA || {};
    const escapeHtml = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const normalizeTurkish = typeof safeCtx.normalizeTurkish === 'function' ? safeCtx.normalizeTurkish : fallbackNormalizeTurkish;
    const selectCity = typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};

    const allLandmarks = buildLandmarkItems(data, normalizeTurkish);
    let savedSet = loadSavedLandmarkIds();
    const totalCount = allLandmarks.length;
    const visitedCount = allLandmarks.filter(l => l.visited).length;
    const pendingCount = totalCount - visitedCount;
    const totalCities = new Set(allLandmarks.map(l => l.key)).size;

    // Build region options with total landmark counts
    const regionalBreakdown = (data && data.stats && data.stats.regional_breakdown) || {};
    const regionCounts = {};
    allLandmarks.forEach(item => {
      regionCounts[item.regionCode] = (regionCounts[item.regionCode] || 0) + 1;
    });

    const regionKeys = Object.keys(DEFAULT_REGIONS).filter(rc => regionCounts[rc] > 0);
    Object.keys(regionCounts).forEach(rc => {
      if (!regionKeys.includes(rc)) regionKeys.push(rc);
    });

    const regionOptionsHtml = regionKeys.map(rc => {
      const meta = regionalBreakdown[rc] || DEFAULT_REGIONS[rc] || { name: rc, icon: '📍' };
      const label = `${meta.icon || '📍'} ${meta.name || rc} (${regionCounts[rc]})`;
      return `<option value="${escapeHtml(rc)}" ${uiState.regionCode === rc ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    }).join('');

    container.innerHTML = `
      <section class="landmark-view" aria-label="Anadolu Miras ve Durak Ansiklopedisi">
        <header class="landmark-header">
          <div>
            <h1 class="landmark-title">🕌 Anadolu Miras &amp; Durak Ansiklopedisi</h1>
            <p class="landmark-sub">
              81 ilin ${totalCount} kadim cami, kale, antik kent ve doğa harikasını kategori, bölge ve ziyaret durumuna göre keşfet; favori duraklarını ⭐ Miras Koleksiyonum'a kaydet.
            </p>
          </div>
          <div class="landmark-kpi-row">
            <span class="landmark-kpi-pill">🏛️ <strong>${totalCount}</strong> Miras Noktası</span>
            <span class="landmark-kpi-pill">📍 <strong>${totalCities}</strong> İl</span>
            <span class="landmark-kpi-pill" style="color: #10b981;">✓ <strong>${visitedCount}</strong> Gezildi</span>
            <span class="landmark-kpi-pill" style="color: #f59e0b;">⏳ <strong>${pendingCount}</strong> Bekliyor</span>
            <span class="landmark-kpi-pill" id="landmark-saved-kpi" style="color: #fbbf24;">⭐ <strong id="landmark-saved-count">${savedSet.size}</strong> Kaydedilen</span>
          </div>
        </header>

        <!-- Category Stat Pills -->
        <div class="landmark-cat-pills" id="landmark-cat-pills" role="group" aria-label="Kategori Filtreleri">
          <button type="button" class="landmark-cat-pill ${uiState.categoryId === 'all' ? 'active' : ''}" data-category="all">
            <span class="landmark-cat-pill-left">
              <span class="landmark-cat-icon" aria-hidden="true">✨</span>
              <span class="landmark-cat-name">Tüm Kategoriler</span>
            </span>
            <span class="landmark-cat-count" data-cat-count="all">${totalCount}</span>
          </button>
          <button type="button" class="landmark-cat-pill ${uiState.categoryId === 'saved' ? 'active' : ''}" data-category="saved">
            <span class="landmark-cat-pill-left">
              <span class="landmark-cat-icon" aria-hidden="true">⭐</span>
              <span class="landmark-cat-name">⭐ Kaydedilenler (Miras Koleksiyonum)</span>
            </span>
            <span class="landmark-cat-count" data-cat-count="saved">${savedSet.size}</span>
          </button>
          ${CATEGORIES.map(cat => `
            <button type="button" class="landmark-cat-pill ${uiState.categoryId === cat.id ? 'active' : ''}" data-category="${escapeHtml(cat.id)}">
              <span class="landmark-cat-pill-left">
                <span class="landmark-cat-icon" aria-hidden="true">${escapeHtml(cat.icon)}</span>
                <span class="landmark-cat-name">${escapeHtml(cat.label)}</span>
              </span>
              <span class="landmark-cat-count" data-cat-count="${escapeHtml(cat.id)}">0</span>
            </button>
          `).join('')}
        </div>

        <!-- Search, Region, Status & Random Discovery Controls -->
        <div class="glass-card landmark-controls">
          <div class="landmark-search-wrap">
            <span class="landmark-search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              id="landmark-search-input"
              class="landmark-search-input"
              placeholder="Miras, şehir, plaka veya bölge ara (örn. Selimiye, Göbeklitepe, Kanyon, 34)..."
              value="${escapeHtml(uiState.searchQuery)}"
              autocomplete="off"
              aria-label="Miras veya şehir ara"
            />
            <button
              type="button"
              id="landmark-search-clear"
              class="landmark-search-clear"
              aria-label="Aramayı temizle"
              style="display: ${uiState.searchQuery ? 'inline-flex' : 'none'};"
            >✕</button>
          </div>

          <select id="landmark-region-select" class="landmark-region-select" aria-label="Bölgeye göre filtrele">
            <option value="all" ${uiState.regionCode === 'all' ? 'selected' : ''}>🗺️ Tüm Bölgeler (${totalCount})</option>
            ${regionOptionsHtml}
          </select>

          <div class="landmark-status-group" id="landmark-status-group" role="group" aria-label="Ziyaret Durumu">
            <button type="button" class="landmark-status-btn ${uiState.status === 'all' ? 'active' : ''}" data-status="all">
              Tümü
            </button>
            <button type="button" class="landmark-status-btn ${uiState.status === 'visited' ? 'active' : ''}" data-status="visited">
              ✓ Gezildi
            </button>
            <button type="button" class="landmark-status-btn ${uiState.status === 'pending' ? 'active' : ''}" data-status="pending">
              ⏳ Bekliyor
            </button>
            <button type="button" class="landmark-status-btn ${uiState.status === 'saved' ? 'active' : ''}" data-status="saved">
              ⭐ Kaydedilenler
            </button>
          </div>

          <button type="button" id="landmark-random-btn" class="landmark-random-btn" title="Rastgele bir Anadolu mirasını keşfet">
            🎲 Rastgele Miras Keşfet
          </button>
        </div>

        <div id="landmark-spotlight-host"></div>
        <div class="landmark-results-bar" id="landmark-results-bar"></div>
        <div class="landmark-grid" id="landmark-grid"></div>
      </section>
    `;

    const catPillsEl = container.querySelector('#landmark-cat-pills');
    const searchInputEl = container.querySelector('#landmark-search-input');
    const searchClearEl = container.querySelector('#landmark-search-clear');
    const regionSelectEl = container.querySelector('#landmark-region-select');
    const statusGroupEl = container.querySelector('#landmark-status-group');
    const randomBtnEl = container.querySelector('#landmark-random-btn');
    const spotlightHostEl = container.querySelector('#landmark-spotlight-host');
    const savedCountEl = container.querySelector('#landmark-saved-count');
    const resultsBarEl = container.querySelector('#landmark-results-bar');
    const gridEl = container.querySelector('#landmark-grid');

    function toggleLandmarkBookmark(landmarkId) {
      if (!landmarkId) return;
      if (savedSet.has(landmarkId)) {
        savedSet.delete(landmarkId);
        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast('Miras durağı koleksiyonunuzdan çıkarıldı.');
        }
      } else {
        savedSet.add(landmarkId);
        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast('⭐ Miras durağı "Miras Koleksiyonum" listesine kaydedildi!');
        }
      }
      saveSavedLandmarkIds(savedSet);
      if (savedCountEl) savedCountEl.textContent = String(savedSet.size);
      renderSpotlight();
      renderGrid();
    }

    function renderSpotlight() {
      if (!spotlightHostEl) return;
      if (!uiState.spotlightId) {
        spotlightHostEl.innerHTML = '';
        return;
      }
      const item = allLandmarks.find(l => l.id === uiState.spotlightId);
      if (!item) {
        spotlightHostEl.innerHTML = '';
        return;
      }
      const isSaved = savedSet.has(item.id);
      spotlightHostEl.innerHTML = `
        <div class="landmark-spotlight-card">
          <div style="display:flex; flex-direction:column; gap:5px;">
            <span style="font-size:0.74rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--accent-gold, #f59e0b);">
              🎲 Günün Rastgele Miras Keşfi · Plaka ${escapeHtml(item.plateStr)}
            </span>
            <h3 style="margin:0; font-family:var(--font-heading); font-size:1.22rem; font-weight:800; color:var(--text-primary);">
              ${escapeHtml(item.categoryIcon)} ${escapeHtml(item.title)}
            </h3>
            <div style="font-size:0.84rem; color:var(--text-secondary);">
              📍 <strong>${escapeHtml(item.cityName)}</strong> · ${escapeHtml(item.regionIcon)} ${escapeHtml(item.regionName)} · ${escapeHtml(item.categoryLabel)}
              (${item.visited ? '✓ Gezilen İl' : '⏳ Keşif Bekleyen İl'})
            </div>
          </div>
          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px;">
            <button type="button" class="landmark-bookmark-btn ${isSaved ? 'is-saved' : ''}" data-spot-bookmark="${escapeHtml(item.id)}">
              ${isSaved ? '⭐ Koleksiyonda' : '☆ Koleksiyona Kaydet'}
            </button>
            <button type="button" class="landmark-random-btn" data-spot-another="1">
              🎲 Başka Öner
            </button>
            <button type="button" class="landmark-random-btn" data-spot-city="${escapeHtml(item.key)}" style="border-color:var(--accent-cyan);">
              📍 Şehre Git →
            </button>
            <button type="button" class="landmark-status-btn" data-spot-close="1" title="Kapat">✕</button>
          </div>
        </div>
      `;

      const bmBtn = spotlightHostEl.querySelector('[data-spot-bookmark]');
      if (bmBtn) {
        bmBtn.addEventListener('click', () => toggleLandmarkBookmark(item.id));
      }
      const anotherBtn = spotlightHostEl.querySelector('[data-spot-another]');
      if (anotherBtn) {
        anotherBtn.addEventListener('click', pickRandomSpotlight);
      }
      const cityBtn = spotlightHostEl.querySelector('[data-spot-city]');
      if (cityBtn) {
        cityBtn.addEventListener('click', () => selectCity(item.key));
      }
      const closeBtn = spotlightHostEl.querySelector('[data-spot-close]');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          uiState.spotlightId = null;
          renderSpotlight();
        });
      }
    }

    function pickRandomSpotlight() {
      const pool = allLandmarks.filter(matchesBaseFilters);
      const source = pool.length ? pool : allLandmarks;
      if (!source.length) return;
      const picked = source[Math.floor(Math.random() * source.length)];
      uiState.spotlightId = picked.id;
      renderSpotlight();
    }

    function matchesBaseFilters(item) {
      if (uiState.regionCode !== 'all' && item.regionCode !== uiState.regionCode) {
        return false;
      }
      if (uiState.status === 'visited' && !item.visited) {
        return false;
      }
      if (uiState.status === 'pending' && item.visited) {
        return false;
      }
      if (uiState.status === 'saved' && !savedSet.has(item.id)) {
        return false;
      }
      const q = normalizeTurkish(uiState.searchQuery);
      if (q && !item.searchHaystack.includes(q)) {
        return false;
      }
      return true;
    }

    function hasActiveFilters() {
      return Boolean(
        uiState.categoryId !== 'all' ||
        uiState.regionCode !== 'all' ||
        uiState.status !== 'all' ||
        uiState.searchQuery.trim()
      );
    }

    function resetFilters() {
      uiState.categoryId = 'all';
      uiState.regionCode = 'all';
      uiState.status = 'all';
      uiState.searchQuery = '';

      if (searchInputEl) searchInputEl.value = '';
      if (searchClearEl) searchClearEl.style.display = 'none';
      if (regionSelectEl) regionSelectEl.value = 'all';

      if (catPillsEl) {
        catPillsEl.querySelectorAll('[data-category]').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-category') === 'all');
        });
      }
      if (statusGroupEl) {
        statusGroupEl.querySelectorAll('[data-status]').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-status') === 'all');
        });
      }

      renderGrid();
    }

    function updateLiveCategoryCounts(baseItems) {
      if (!catPillsEl) return;
      const counts = { all: baseItems.length, saved: 0 };
      CATEGORIES.forEach(c => { counts[c.id] = 0; });
      baseItems.forEach(item => {
        counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
        if (savedSet.has(item.id)) counts.saved += 1;
      });

      catPillsEl.querySelectorAll('[data-cat-count]').forEach(badge => {
        const cid = badge.getAttribute('data-cat-count');
        badge.textContent = String(counts[cid] || 0);
      });
    }

    function renderGrid() {
      const baseItems = allLandmarks.filter(matchesBaseFilters);
      updateLiveCategoryCounts(baseItems);

      let filtered = baseItems;
      if (uiState.categoryId === 'saved') {
        filtered = baseItems.filter(item => savedSet.has(item.id));
      } else if (uiState.categoryId !== 'all') {
        filtered = baseItems.filter(item => item.categoryId === uiState.categoryId);
      }

      const uniqueCities = new Set(filtered.map(item => item.key)).size;

      if (resultsBarEl) {
        resultsBarEl.innerHTML = `
          <span>
            <strong style="color: var(--text-primary);">${filtered.length}</strong> / ${totalCount} miras noktası gösteriliyor
            <span style="color: var(--text-muted);">(${uniqueCities} il · ⭐ ${savedSet.size} koleksiyonda)</span>
          </span>
          ${hasActiveFilters()
            ? '<button type="button" class="btn btn-outline" id="landmark-reset-btn" style="padding: 4px 10px; font-size: 0.75rem;">↺ Filtreleri Sıfırla</button>'
            : '<span style="color: var(--text-muted); font-size: 0.76rem;">Şehir detayını açmak için karta, kaydetmek için ⭐ butonuna tıklayın</span>'
          }
        `;
        const resetBtn = resultsBarEl.querySelector('#landmark-reset-btn');
        if (resetBtn) resetBtn.addEventListener('click', resetFilters);
      }

      if (!filtered.length) {
        gridEl.innerHTML = `
          <div class="glass-card landmark-empty" style="grid-column: 1 / -1;">
            <div style="font-size: 2.2rem;">🕌</div>
            <div style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">
              Filtrelerinizle eşleşen miras noktası bulunamadı
            </div>
            <p style="font-size: 0.85rem; max-width: 420px; margin: 0;">
              Farklı bir arama kelimesi deneyebilir, ⭐ Kaydedilenler filtresini değiştirebilir veya aktif filtreleri sıfırlayabilirsiniz.
            </p>
            <button type="button" class="btn btn-primary" id="landmark-empty-reset">↺ Tüm Mirasları Göster</button>
          </div>
        `;
        const emptyReset = gridEl.querySelector('#landmark-empty-reset');
        if (emptyReset) emptyReset.addEventListener('click', resetFilters);
        return;
      }

      gridEl.innerHTML = filtered.map(item => {
        const isSaved = savedSet.has(item.id);
        return `
        <article
          class="glass-card landmark-card ${isSaved ? 'is-saved-card' : ''}"
          data-city-key="${escapeHtml(item.key)}"
          role="button"
          tabindex="0"
          aria-label="${escapeHtml(item.title)} - ${escapeHtml(item.cityName)} detayını aç"
        >
          <div class="landmark-card-thumb">
            ${item.bannerRel
              ? `<img src="${escapeHtml(item.bannerRel)}" alt="${escapeHtml(item.cityName)}" loading="lazy" onerror="this.style.display='none'">`
              : ''
            }
            <div class="landmark-card-overlay"></div>
            <div class="landmark-card-top">
              <span class="landmark-plate-badge">${escapeHtml(item.plateStr)}</span>
              <div style="display:flex; align-items:center; gap:5px; pointer-events:auto;">
                <button
                  type="button"
                  class="landmark-bookmark-btn ${isSaved ? 'is-saved' : ''}"
                  data-bookmark-id="${escapeHtml(item.id)}"
                  aria-pressed="${isSaved ? 'true' : 'false'}"
                  title="⭐ Miras Koleksiyonum (Kaydedilen Duraklar) listesine ekle/çıkar"
                >
                  ${isSaved ? '⭐ Kayıtlı' : '☆ Kaydet'}
                </button>
                <span class="city-status-badge ${item.visited ? 'visited' : 'unvisited'}">
                  ${item.visited ? '✓ Gezildi' : '⏳ Bekliyor'}
                </span>
              </div>
            </div>
            <span class="landmark-card-cat-tag" style="border-color: ${escapeHtml(item.categoryColor)}66;">
              <span aria-hidden="true">${escapeHtml(item.categoryIcon)}</span>
              <span>${escapeHtml(item.categoryShort)}</span>
            </span>
          </div>

          <div class="landmark-card-body">
            <h3 class="landmark-card-title">
              <span aria-hidden="true">${escapeHtml(item.categoryIcon)}</span>
              <span>${escapeHtml(item.title)}</span>
            </h3>

            <div class="landmark-card-footer">
              <span class="landmark-city-name">📍 ${escapeHtml(item.cityName)}</span>
              <span class="landmark-region-badge" style="color: ${escapeHtml(item.regionColor)}; border-color: ${escapeHtml(item.regionColor)}44;">
                ${escapeHtml(item.regionIcon)} ${escapeHtml(item.regionName)}
              </span>
            </div>
          </div>
        </article>
      `;
      }).join('');
    }

    // Event Listeners
    if (randomBtnEl) {
      randomBtnEl.addEventListener('click', pickRandomSpotlight);
    }

    if (catPillsEl) {
      catPillsEl.addEventListener('click', (e) => {
        const pill = e.target.closest('[data-category]');
        if (!pill) return;
        const clicked = pill.getAttribute('data-category') || 'all';
        uiState.categoryId = (uiState.categoryId === clicked && clicked !== 'all') ? 'all' : clicked;
        catPillsEl.querySelectorAll('[data-category]').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-category') === uiState.categoryId);
        });
        renderGrid();
      });
    }

    if (searchInputEl) {
      searchInputEl.addEventListener('input', (e) => {
        uiState.searchQuery = e.target.value || '';
        if (searchClearEl) {
          searchClearEl.style.display = uiState.searchQuery ? 'inline-flex' : 'none';
        }
        renderGrid();
      });
    }

    if (searchClearEl) {
      searchClearEl.addEventListener('click', () => {
        uiState.searchQuery = '';
        if (searchInputEl) {
          searchInputEl.value = '';
          searchInputEl.focus();
        }
        searchClearEl.style.display = 'none';
        renderGrid();
      });
    }

    if (regionSelectEl) {
      regionSelectEl.addEventListener('change', (e) => {
        uiState.regionCode = e.target.value || 'all';
        renderGrid();
      });
    }

    if (statusGroupEl) {
      statusGroupEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-status]');
        if (!btn) return;
        uiState.status = btn.getAttribute('data-status') || 'all';
        statusGroupEl.querySelectorAll('[data-status]').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-status') === uiState.status);
        });
        renderGrid();
      });
    }

    if (gridEl) {
      gridEl.addEventListener('click', (e) => {
        const bmBtn = e.target.closest('[data-bookmark-id]');
        if (bmBtn) {
          e.stopPropagation();
          toggleLandmarkBookmark(bmBtn.getAttribute('data-bookmark-id'));
          return;
        }
        const card = e.target.closest('.landmark-card');
        if (!card) return;
        const cityKey = card.getAttribute('data-city-key');
        if (cityKey) selectCity(cityKey);
      });

      gridEl.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        if (e.target.closest('[data-bookmark-id]')) return;
        const card = e.target.closest('.landmark-card');
        if (!card) return;
        e.preventDefault();
        const cityKey = card.getAttribute('data-city-key');
        if (cityKey) selectCity(cityKey);
      });
    }

    renderSpotlight();
    renderGrid();
  }

  window.SEYYAH_MODULES.landmarks = {
    render
  };
})();
