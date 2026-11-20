/**
 * Anadolu Lezzet & Gastronomi Atlası Modülü
 * 81 İlin 300+ Yöresel Lezzetini Keşfet, Filtrele ve Şehirlere Bağlan
 * Registers on window.SEYYAH_MODULES.gastronomy
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

  // Quick Category Definitions (Turkish-normalized word-boundary matchers)
  const CATEGORIES = [
    {
      id: 'kebap',
      label: '🔥 Kebap & Et',
      icon: '🔥',
      regex: /\b(kebap|kebabi|kofte|koftesi|sis|sisi|tava|ciger|cigeri|etli|kavurma|kavurmasi|guvec|guveci|tandir|tandiri|doner|doneri|sucuk|sucugu|pastirma|pastirmasi|kuzu|pirzola|iskender|tantuni|beyti|bumbar|sirdan|kokorec|kaz|hamsi|sardalya|alabalik|balik|yahni|yahnisi|sac)\b/
    },
    {
      id: 'tatli',
      label: '🍯 Tatlı & Helva',
      icon: '🍯',
      regex: /\b(tatli|tatlisi|helva|helvasi|baklava|baklavasi|kunefe|kadayif|kadayifi|hosmerim|pismaniye|lokum|lokumu|seker|sekeri|ezme|ezmesi|macun|macunu|kurabiye|kurabiyesi|pestil|pestili|kome|dondurma|dondurmasi|sambali|bombasi|recel|receli|sutlac|sutlaci|muhallebi|asure|tulumba|bici|katmer|katmeri)\b/
    },
    {
      id: 'corba',
      label: '🥣 Çorba',
      icon: '🥣',
      regex: /\b(corba|corbasi|asi|tarhana|tarhanasi|yuvalama|beyran|keskek|keskegi|paca|iskembe|ezogelin|tutmac)\b/
    },
    {
      id: 'pide',
      label: '🫓 Pide & Börek',
      icon: '🫓',
      regex: /\b(pide|pidesi|borek|boregi|manti|mantisi|gozleme|gozlemesi|corek|coregi|boyoz|boyozu|simit|simidi|lavas|cantik|bukme|lahmacun|kumru|tost|tostu|bazlama|eriste|hingel|siron|ciborek|katmer|katmeri|ekmegi)\b/
    },
    {
      id: 'peynir',
      label: '🧀 Peynir & Bal',
      icon: '🧀',
      regex: /\b(peynir|peyniri|bal|bali|kaymak|kaymagi|kaymakli|kaymaklisi|yogurt|yogurdu|tereyag|tereyagi|tulum|kasar|kasari|otlu|mihlama|kuymak|ayran|ayrani|pekmez|pekmezi|tahin|tahini)\b/
    }
  ];

  // Fallback region metadata order if data.regions is absent
  const DEFAULT_REGIONS = {
    '01_Marmara': { name: 'Marmara Bölgesi', short: 'Marmara', icon: '🏰', color: '#38bdf8' },
    '02_Ege': { name: 'Ege Bölgesi', short: 'Ege', icon: '🌊', color: '#34d399' },
    '03_Akdeniz': { name: 'Akdeniz Bölgesi', short: 'Akdeniz', icon: '☀️', color: '#f59e0b' },
    '04_IcAnadolu': { name: 'İç Anadolu Bölgesi', short: 'İç Anadolu', icon: '🌾', color: '#fbbf24' },
    '05_Karadeniz': { name: 'Karadeniz Bölgesi', short: 'Karadeniz', icon: '🌲', color: '#10b981' },
    '06_DoguAnadolu': { name: 'Doğu Anadolu Bölgesi', short: 'Doğu Anadolu', icon: '🏔️', color: '#a855f7' },
    '07_GuneydoguAnadolu': { name: 'Güneydoğu Anadolu Bölgesi', short: 'Güneydoğu', icon: '🏜️', color: '#f97316' }
  };

  // Module-scoped UI state
  const uiState = {
    searchQuery: '',
    regionCode: 'all',
    categoryId: 'all',
    visitedOnly: false,
    spotlightDish: null
  };

  // Inject minimal, theme-aware styles once (inserted before style.css so theme stylesheets can override)
  function ensureStyles() {
    if (document.getElementById('gastro-atlas-styles')) return;
    const style = document.createElement('style');
    style.id = 'gastro-atlas-styles';
    style.textContent = `
      .gastro-atlas-view {
        display: flex;
        flex-direction: column;
        gap: 22px;
        max-width: 1180px;
        margin: 0 auto;
        padding-bottom: 32px;
      }

      .gastro-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 14px;
      }

      .gastro-header-title {
        font-family: var(--font-heading);
        font-size: 1.65rem;
        font-weight: 800;
        letter-spacing: 0.3px;
        background: linear-gradient(135deg, #ffffff 0%, var(--accent-gold) 65%, var(--accent-cyan) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .gastro-header-title {
        background: linear-gradient(135deg, #0f172a 0%, #b45309 65%, #0284c7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .gastro-header-sub {
        font-size: 0.88rem;
        color: var(--text-secondary);
        margin-top: 4px;
      }

      .gastro-kpi-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .gastro-kpi-pill {
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

      body.light-theme .gastro-kpi-pill {
        background: rgba(255, 255, 255, 0.75);
      }

      /* Spotlight Card */
      .gastro-spotlight {
        position: relative;
        overflow: hidden;
        padding: 20px 22px;
        display: grid;
        grid-template-columns: 180px 1fr auto;
        gap: 20px;
        align-items: center;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(30, 41, 59, 0.78) 55%, rgba(0, 242, 254, 0.1) 100%);
        border: 1px solid rgba(245, 158, 11, 0.35);
      }

      body.light-theme .gastro-spotlight {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(255, 255, 255, 0.9) 60%, rgba(14, 165, 233, 0.12) 100%);
      }

      .gastro-spotlight-thumb {
        width: 180px;
        height: 118px;
        border-radius: var(--radius-md, 12px);
        overflow: hidden;
        border: 1px solid var(--border-glass);
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
        position: relative;
        flex-shrink: 0;
        cursor: pointer;
      }

      .gastro-spotlight-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.35s ease;
      }

      .gastro-spotlight-thumb:hover img {
        transform: scale(1.06);
      }

      .gastro-spotlight-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        color: var(--accent-gold);
        margin-bottom: 6px;
      }

      .gastro-spotlight-dish {
        font-family: var(--font-heading);
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.25;
        margin-bottom: 8px;
      }

      .gastro-spotlight-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        font-size: 0.82rem;
        color: var(--text-secondary);
      }

      .gastro-spotlight-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
        min-width: 170px;
      }

      /* Controls Panel */
      .gastro-controls {
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .gastro-search-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .gastro-search-box {
        position: relative;
        flex: 1;
        min-width: 240px;
        display: flex;
        align-items: center;
      }

      .gastro-search-icon {
        position: absolute;
        left: 12px;
        color: var(--text-muted);
        pointer-events: none;
        display: flex;
        align-items: center;
      }

      .gastro-search-box .search-input {
        padding-left: 38px;
        padding-right: 34px;
      }

      .gastro-search-clear {
        position: absolute;
        right: 10px;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 0.9rem;
        padding: 2px 6px;
        border-radius: 6px;
      }

      .gastro-search-clear:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.08);
      }

      .gastro-filter-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .gastro-filter-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted);
      }

      .gastro-pills-row {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        align-items: center;
      }

      .gastro-chip.active {
        background: rgba(245, 158, 11, 0.18);
        color: var(--accent-gold);
        border-color: var(--accent-gold);
      }

      .gastro-results-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        font-size: 0.82rem;
        color: var(--text-secondary);
        padding: 0 4px;
      }

      /* Responsive Card Grid */
      .gastro-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));
        gap: 16px;
      }

      .gastro-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        cursor: pointer;
        padding: 0;
        position: relative;
      }

      .gastro-card:focus-visible {
        outline: 2px solid var(--accent-cyan);
        outline-offset: 2px;
      }

      .gastro-card-thumb {
        position: relative;
        height: 132px;
        width: 100%;
        overflow: hidden;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.85));
      }

      .gastro-card-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.35s ease;
      }

      .gastro-card:hover .gastro-card-thumb img {
        transform: scale(1.06);
      }

      .gastro-card-thumb-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(10, 15, 29, 0.88) 0%, rgba(10, 15, 29, 0.15) 55%, rgba(10, 15, 29, 0.25) 100%);
        pointer-events: none;
      }

      .gastro-card-top-badges {
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

      .gastro-plate-badge {
        padding: 2px 8px;
        border-radius: 6px;
        background: rgba(10, 15, 29, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #f8fafc;
        font-family: var(--font-heading);
        font-size: 0.72rem;
        font-weight: 700;
        backdrop-filter: blur(6px);
      }

      .gastro-card-body {
        padding: 14px 15px 15px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
      }

      .gastro-dish-title {
        font-family: var(--font-heading);
        font-size: 1.02rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.3;
        display: flex;
        align-items: flex-start;
        gap: 6px;
      }

      .gastro-card-footer {
        margin-top: auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border-glass);
      }

      .gastro-city-label {
        font-family: var(--font-heading);
        font-size: 0.84rem;
        font-weight: 600;
        color: var(--accent-cyan);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .gastro-region-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.7rem;
        font-weight: 600;
        white-space: nowrap;
        border: 1px solid var(--border-glass);
        background: rgba(15, 23, 42, 0.55);
      }

      body.light-theme .gastro-region-badge {
        background: rgba(241, 245, 249, 0.85);
      }

      .gastro-empty {
        text-align: center;
        padding: 40px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: var(--text-secondary);
      }

      @media (max-width: 820px) {
        .gastro-spotlight {
          grid-template-columns: 1fr;
        }
        .gastro-spotlight-thumb {
          width: 100%;
          height: 155px;
        }
        .gastro-spotlight-actions {
          flex-direction: row;
          flex-wrap: wrap;
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

  function detectDishIcon(normalizedDish) {
    for (let i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].regex.test(normalizedDish)) {
        return CATEGORIES[i].icon;
      }
    }
    return '🍽️';
  }

  function detectDishCategories(normalizedDish) {
    const matched = [];
    for (let i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].regex.test(normalizedDish)) {
        matched.push(CATEGORIES[i].id);
      }
    }
    return matched;
  }

  function buildDishesCatalog(data, normalizeTurkish) {
    const provinces = (data && data.provinces) ? data.provinces : {};
    const regionsMeta = (data && data.regions) ? data.regions : DEFAULT_REGIONS;
    const dishes = [];

    Object.entries(provinces).forEach(([key, prov]) => {
      if (!prov || !Array.isArray(prov.specialties)) return;
      const rMeta = regionsMeta[prov.region_code] || DEFAULT_REGIONS[prov.region_code] || {
        name: prov.region || 'Anadolu',
        icon: '📍',
        color: '#38bdf8'
      };
      const plateStr = String(prov.plate != null ? prov.plate : '').padStart(2, '0');

      prov.specialties.forEach((rawDish, idx) => {
        const dishName = String(rawDish || '').trim();
        if (!dishName) return;
        const normDish = normalizeTurkish(dishName);
        const normCity = normalizeTurkish(prov.name || '');
        const normRegion = normalizeTurkish(prov.region || rMeta.name || '');
        const categories = detectDishCategories(normDish);

        dishes.push({
          id: `${key}__${idx}`,
          dish: dishName,
          icon: detectDishIcon(normDish),
          categories,
          key,
          cityName: prov.name || key,
          plate: prov.plate,
          plateStr,
          region: prov.region || rMeta.name || '',
          regionCode: prov.region_code || '',
          regionIcon: rMeta.icon || '📍',
          regionColor: rMeta.color || '#38bdf8',
          visited: Boolean(prov.visited),
          bannerRel: prov.banner_rel || '',
          searchIndex: `${normDish} ${normCity} ${normRegion} ${plateStr}`
        });
      });
    });

    // Sort alphabetically by dish name (Turkish locale)
    dishes.sort((a, b) => a.dish.localeCompare(b.dish, 'tr') || a.cityName.localeCompare(b.cityName, 'tr'));
    return dishes;
  }

  function pickRandomDish(dishes, currentDish) {
    if (!dishes.length) return null;
    if (dishes.length === 1) return dishes[0];
    let candidate = dishes[Math.floor(Math.random() * dishes.length)];
    if (currentDish && candidate.id === currentDish.id) {
      const idx = dishes.findIndex(d => d.id === currentDish.id);
      candidate = dishes[(idx + 1) % dishes.length];
    }
    return candidate;
  }

  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const data = safeCtx.data || (safeCtx.state && safeCtx.state.data) || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const escapeHtml = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const normalizeTurkish = typeof safeCtx.normalizeTurkish === 'function' ? safeCtx.normalizeTurkish : fallbackNormalizeTurkish;
    const selectCity = typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};
    const showToast = typeof safeCtx.showToast === 'function' ? safeCtx.showToast : function () {};

    if (!data || !data.provinces) {
      container.innerHTML = `
        <div class="glass-card" style="max-width: 600px; margin: 40px auto; padding: 28px; text-align: center;">
          <h2 style="color: var(--accent-gold); font-family: var(--font-heading);">Gastronomi Verisi Bulunamadı</h2>
          <p style="color: var(--text-secondary); margin-top: 8px;">Lütfen il verilerinin yüklendiğinden emin olun.</p>
        </div>
      `;
      return;
    }

    const allDishes = buildDishesCatalog(data, normalizeTurkish);
    const totalProvinces = Object.keys(data.provinces).length;
    const visitedDishCount = allDishes.filter(d => d.visited).length;

    // Region list with counts
    const regionSource = data.regions && Object.keys(data.regions).length ? data.regions : DEFAULT_REGIONS;
    const regionCounts = {};
    allDishes.forEach(d => {
      regionCounts[d.regionCode] = (regionCounts[d.regionCode] || 0) + 1;
    });
    const regionEntries = Object.entries(regionSource)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([code, meta]) => ({
        code,
        shortName: (meta.name || '').replace(/\s*Bölgesi$/i, '') || code,
        icon: meta.icon || '📍',
        color: meta.color || '#38bdf8',
        count: regionCounts[code] || 0
      }));

    // Category counts
    const categoryCounts = {};
    CATEGORIES.forEach(cat => {
      categoryCounts[cat.id] = allDishes.filter(d => d.categories.includes(cat.id)).length;
    });

    // Initialize or validate spotlight dish
    if (!uiState.spotlightDish || !allDishes.some(d => d.id === uiState.spotlightDish.id)) {
      uiState.spotlightDish = pickRandomDish(allDishes, null);
    }

    // Render outer shell once
    container.innerHTML = `
      <div class="gastro-atlas-view">
        <!-- Header -->
        <div class="gastro-header">
          <div>
            <h2 class="gastro-header-title">🍽️ Anadolu Lezzet &amp; Gastronomi Atlası</h2>
            <p class="gastro-header-sub">
              ${totalProvinces} ilden ${allDishes.length} yöresel tat — kebaplardan şerbetli tatlılara, Anadolu'nun kadim mutfak hafızası.
            </p>
          </div>
          <div class="gastro-kpi-row">
            <span class="gastro-kpi-pill">🍲 <strong>${allDishes.length}</strong> Lezzet</span>
            <span class="gastro-kpi-pill">🏛️ <strong>${totalProvinces}</strong> İl</span>
            <span class="gastro-kpi-pill" style="color: var(--accent-emerald);">✓ <strong>${visitedDishCount}</strong> Gezilen İlden</span>
          </div>
        </div>

        <!-- Random Spotlight Card -->
        <section class="glass-card gastro-spotlight" id="gastro-spotlight" aria-live="polite"></section>

        <!-- Search & Filter Controls -->
        <section class="glass-card gastro-controls">
          <div class="gastro-search-row">
            <div class="gastro-search-box">
              <span class="gastro-search-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                id="gastro-search-input"
                class="search-input"
                placeholder="Kebap, Tatlı, Çorba, Pide, Peynir veya şehir ara..."
                value="${escapeHtml(uiState.searchQuery)}"
                autocomplete="off"
              />
              <button
                type="button"
                id="gastro-search-clear"
                class="gastro-search-clear"
                title="Aramayı Temizle"
                aria-label="Aramayı Temizle"
                style="display: ${uiState.searchQuery ? 'inline-flex' : 'none'};"
              >✕</button>
            </div>

            <button
              type="button"
              id="gastro-visited-toggle"
              class="filter-pill ${uiState.visitedOnly ? 'active' : ''}"
              title="Sadece ziyaret edilen illerin lezzetlerini göster"
            >
              ✓ Sadece Gezilen İller
            </button>
          </div>

          <!-- Region Filter Pills -->
          <div class="gastro-filter-group">
            <span class="gastro-filter-label">Bölge Filtresi</span>
            <div class="gastro-pills-row" id="gastro-region-pills">
              <button type="button" class="filter-pill ${uiState.regionCode === 'all' ? 'active' : ''}" data-region="all">
                🗺️ Tümü (${allDishes.length})
              </button>
              ${regionEntries.map(r => `
                <button
                  type="button"
                  class="filter-pill ${uiState.regionCode === r.code ? 'active' : ''}"
                  data-region="${escapeHtml(r.code)}"
                >
                  ${escapeHtml(r.icon)} ${escapeHtml(r.shortName)} (${r.count})
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Quick Category Chips -->
          <div class="gastro-filter-group">
            <span class="gastro-filter-label">Hızlı Lezzet Kategorileri</span>
            <div class="gastro-pills-row" id="gastro-category-chips">
              ${CATEGORIES.map(cat => `
                <button
                  type="button"
                  class="filter-pill gastro-chip ${uiState.categoryId === cat.id ? 'active' : ''}"
                  data-category="${escapeHtml(cat.id)}"
                >
                  ${escapeHtml(cat.label)} (${categoryCounts[cat.id] || 0})
                </button>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- Results Counter Bar -->
        <div class="gastro-results-bar" id="gastro-results-bar"></div>

        <!-- Responsive Dish Cards Grid -->
        <div class="gastro-grid" id="gastro-grid"></div>
      </div>
    `;

    const spotlightEl = container.querySelector('#gastro-spotlight');
    const searchInputEl = container.querySelector('#gastro-search-input');
    const searchClearEl = container.querySelector('#gastro-search-clear');
    const visitedToggleEl = container.querySelector('#gastro-visited-toggle');
    const regionPillsEl = container.querySelector('#gastro-region-pills');
    const categoryChipsEl = container.querySelector('#gastro-category-chips');
    const resultsBarEl = container.querySelector('#gastro-results-bar');
    const gridEl = container.querySelector('#gastro-grid');

    function renderSpotlight() {
      const dish = uiState.spotlightDish;
      if (!spotlightEl || !dish) return;

      const statusBadge = dish.visited
        ? '<span class="city-status-badge visited">✓ Keşfedilen İl</span>'
        : '<span class="city-status-badge unvisited">⏳ Keşif Bekliyor</span>';

      spotlightEl.innerHTML = `
        <div class="gastro-spotlight-thumb" id="gastro-spotlight-thumb" title="${escapeHtml(dish.cityName)} detayına git">
          ${dish.bannerRel
            ? `<img src="${escapeHtml(dish.bannerRel)}" alt="${escapeHtml(dish.cityName)} - ${escapeHtml(dish.dish)}" onerror="this.style.display='none'">`
            : ''
          }
        </div>

        <div>
          <div class="gastro-spotlight-eyebrow">🎲 Günün Lezzet Önerisi</div>
          <div class="gastro-spotlight-dish">${escapeHtml(dish.icon)} ${escapeHtml(dish.dish)}</div>
          <div class="gastro-spotlight-meta">
            <span class="gastro-plate-badge">${escapeHtml(dish.plateStr)}</span>
            <strong style="color: var(--text-primary);">${escapeHtml(dish.cityName)}</strong>
            <span class="gastro-region-badge" style="color: ${escapeHtml(dish.regionColor)}; border-color: ${escapeHtml(dish.regionColor)}44;">
              ${escapeHtml(dish.regionIcon)} ${escapeHtml(dish.region)}
            </span>
            ${statusBadge}
          </div>
        </div>

        <div class="gastro-spotlight-actions">
          <button type="button" class="btn btn-primary" id="gastro-spotlight-open-city">
            📍 ${escapeHtml(dish.cityName)} Şehrini Gör
          </button>
          <button type="button" class="btn btn-outline" id="gastro-spotlight-reroll">
            🎲 Yeni Lezzet Öner
          </button>
        </div>
      `;

      const openCity = () => selectCity(dish.key);
      const openBtn = spotlightEl.querySelector('#gastro-spotlight-open-city');
      const thumbEl = spotlightEl.querySelector('#gastro-spotlight-thumb');
      const rerollBtn = spotlightEl.querySelector('#gastro-spotlight-reroll');

      if (openBtn) openBtn.addEventListener('click', openCity);
      if (thumbEl) thumbEl.addEventListener('click', openCity);
      if (rerollBtn) {
        rerollBtn.addEventListener('click', () => {
          uiState.spotlightDish = pickRandomDish(allDishes, uiState.spotlightDish);
          renderSpotlight();
          if (uiState.spotlightDish) {
            showToast(`🍽️ Yeni öneri: ${uiState.spotlightDish.dish} (${uiState.spotlightDish.cityName})`);
          }
        });
      }
    }

    function getFilteredDishes() {
      const q = normalizeTurkish(uiState.searchQuery);
      return allDishes.filter(item => {
        if (uiState.regionCode !== 'all' && item.regionCode !== uiState.regionCode) return false;
        if (uiState.categoryId !== 'all' && !item.categories.includes(uiState.categoryId)) return false;
        if (uiState.visitedOnly && !item.visited) return false;
        if (q && !item.searchIndex.includes(q)) return false;
        return true;
      });
    }

    function hasActiveFilters() {
      return Boolean(
        uiState.searchQuery.trim() ||
        uiState.regionCode !== 'all' ||
        uiState.categoryId !== 'all' ||
        uiState.visitedOnly
      );
    }

    function resetFilters() {
      uiState.searchQuery = '';
      uiState.regionCode = 'all';
      uiState.categoryId = 'all';
      uiState.visitedOnly = false;
      if (searchInputEl) searchInputEl.value = '';
      if (searchClearEl) searchClearEl.style.display = 'none';
      if (visitedToggleEl) visitedToggleEl.classList.remove('active');
      if (regionPillsEl) {
        regionPillsEl.querySelectorAll('[data-region]').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-region') === 'all');
        });
      }
      if (categoryChipsEl) {
        categoryChipsEl.querySelectorAll('[data-category]').forEach(btn => {
          btn.classList.remove('active');
        });
      }
      renderGrid();
    }

    function renderGrid() {
      const filtered = getFilteredDishes();
      const uniqueCities = new Set(filtered.map(d => d.key)).size;

      if (resultsBarEl) {
        resultsBarEl.innerHTML = `
          <span>
            <strong style="color: var(--text-primary);">${filtered.length}</strong> / ${allDishes.length} lezzet gösteriliyor
            <span style="color: var(--text-muted);">(${uniqueCities} il)</span>
          </span>
          ${hasActiveFilters()
            ? '<button type="button" class="btn btn-outline" id="gastro-reset-filters" style="padding: 4px 10px; font-size: 0.75rem;">↺ Filtreleri Sıfırla</button>'
            : '<span style="color: var(--text-muted); font-size: 0.76rem;">Şehir detayına gitmek için herhangi bir lezzet kartına tıklayın</span>'
          }
        `;
        const resetBtn = resultsBarEl.querySelector('#gastro-reset-filters');
        if (resetBtn) resetBtn.addEventListener('click', resetFilters);
      }

      if (!filtered.length) {
        gridEl.innerHTML = `
          <div class="glass-card gastro-empty" style="grid-column: 1 / -1;">
            <div style="font-size: 2.2rem;">🍽️</div>
            <div style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">
              Aramanızla eşleşen yöresel lezzet bulunamadı
            </div>
            <p style="font-size: 0.85rem; max-width: 420px;">
              Farklı bir arama kelimesi deneyebilir veya aktif bölge/kategori filtrelerini sıfırlayabilirsiniz.
            </p>
            <button type="button" class="btn btn-primary" id="gastro-empty-reset">↺ Tüm Lezzetleri Göster</button>
          </div>
        `;
        const emptyReset = gridEl.querySelector('#gastro-empty-reset');
        if (emptyReset) emptyReset.addEventListener('click', resetFilters);
        return;
      }

      gridEl.innerHTML = filtered.map(item => `
        <article
          class="glass-card gastro-card"
          data-city-key="${escapeHtml(item.key)}"
          role="button"
          tabindex="0"
          aria-label="${escapeHtml(item.dish)} - ${escapeHtml(item.cityName)} detayını aç"
        >
          <div class="gastro-card-thumb">
            ${item.bannerRel
              ? `<img src="${escapeHtml(item.bannerRel)}" alt="${escapeHtml(item.cityName)}" loading="lazy" onerror="this.style.display='none'">`
              : ''
            }
            <div class="gastro-card-thumb-overlay"></div>
            <div class="gastro-card-top-badges">
              <span class="gastro-plate-badge">${escapeHtml(item.plateStr)}</span>
              <span class="city-status-badge ${item.visited ? 'visited' : 'unvisited'}">
                ${item.visited ? '✓ Gezildi' : '⏳ Planlı'}
              </span>
            </div>
          </div>

          <div class="gastro-card-body">
            <h3 class="gastro-dish-title">
              <span aria-hidden="true">${escapeHtml(item.icon)}</span>
              <span>${escapeHtml(item.dish)}</span>
            </h3>

            <div class="gastro-card-footer">
              <span class="gastro-city-label">📍 ${escapeHtml(item.cityName)}</span>
              <span class="gastro-region-badge" style="color: ${escapeHtml(item.regionColor)}; border-color: ${escapeHtml(item.regionColor)}44;">
                ${escapeHtml(item.regionIcon)} ${escapeHtml(item.region)}
              </span>
            </div>
          </div>
        </article>
      `).join('');
    }

    // Event Listeners
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

    if (visitedToggleEl) {
      visitedToggleEl.addEventListener('click', () => {
        uiState.visitedOnly = !uiState.visitedOnly;
        visitedToggleEl.classList.toggle('active', uiState.visitedOnly);
        renderGrid();
      });
    }

    if (regionPillsEl) {
      regionPillsEl.addEventListener('click', (e) => {
        const pill = e.target.closest('[data-region]');
        if (!pill) return;
        uiState.regionCode = pill.getAttribute('data-region') || 'all';
        regionPillsEl.querySelectorAll('[data-region]').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-region') === uiState.regionCode);
        });
        renderGrid();
      });
    }

    if (categoryChipsEl) {
      categoryChipsEl.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-category]');
        if (!chip) return;
        const clickedId = chip.getAttribute('data-category');
        uiState.categoryId = uiState.categoryId === clickedId ? 'all' : clickedId;
        categoryChipsEl.querySelectorAll('[data-category]').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-category') === uiState.categoryId);
        });
        renderGrid();
      });
    }

    if (gridEl) {
      gridEl.addEventListener('click', (e) => {
        const card = e.target.closest('.gastro-card');
        if (!card) return;
        const cityKey = card.getAttribute('data-city-key');
        if (cityKey) selectCity(cityKey);
      });

      gridEl.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.gastro-card');
        if (!card) return;
        e.preventDefault();
        const cityKey = card.getAttribute('data-city-key');
        if (cityKey) selectCity(cityKey);
      });
    }

    // Initial render of spotlight & grid
    renderSpotlight();
    renderGrid();
  }

  window.SEYYAH_MODULES.gastronomy = {
    render
  };
})();
