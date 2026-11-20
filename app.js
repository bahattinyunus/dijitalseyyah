/**
 * Anadolu Seyahatnamesi - Single Page Application Engine
 * Web Audio API Sufi Soundscapes, 2-Opt Route Optimizer + SVG Map,
 * Achievements & Rank System, Turkish-Aware Search & Mobile Drawer
 */

(function () {
  'use strict';

  // Turkish Normalization Helper
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

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatInlineMarkdown(str) {
    return escapeHtml(str)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  // Soundscape Presets
  const SOUNDSCAPES = [
    { id: 'ney', label: 'Ney & Bozkır', freq1: 146.83, freq2: 220.0, filterFreq: 380, noiseVol: 0.045 },
    { id: 'rain', label: 'Kütüphane Yağmuru', freq1: 110.0, freq2: 164.81, filterFreq: 950, noiseVol: 0.075 },
    { id: 'sukunet', label: 'Kervansaray Sükuneti', freq1: 130.81, freq2: 196.0, filterFreq: 260, noiseVol: 0.03 }
  ];

  // LocalStorage Helpers
  const STORAGE_KEYS = {
    theme: 'dijital_seyyah_theme',
    favorites: 'dijital_seyyah_favorites'
  };

  function loadFavorites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.favorites);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (e) {
      return new Set();
    }
  }

  function saveFavorites(favSet) {
    try {
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([...favSet]));
    } catch (e) {}
  }

  // Global State
  const state = {
    data: typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null,
    filter: 'all', // 'all', 'visited', 'unvisited', 'favorites'
    selectedRegion: 'all',
    sortBy: 'name', // 'name', 'plate', 'visited'
    searchQuery: '',
    selectedCityKey: null,
    currentView: 'dashboard', // 'dashboard', 'city', 'route', 'gallery'
    galleryRegion: 'all',
    routeMode: 'custom', // 'custom' (Aktif Sefer Rotam) | 'auto' (Otomatik 2-Opt)
    customRouteCities: (typeof TRAVEL_DATA !== 'undefined' && Array.isArray(TRAVEL_DATA.custom_route))
      ? [...TRAVEL_DATA.custom_route]
      : ['Ankara', 'Çankırı', 'Kastamonu', 'Karabük', 'Bartın', 'Zonguldak', 'Düzce', 'Sakarya', 'İstanbul', 'Edirne'],
    routeStartCity: 'Ankara',
    routeRegion: 'all',
    routeStops: 7,
    routeOptimize: true,
    soundIndex: -1, // -1 = off, 0..2 = preset
    audioCtx: null,
    audioNodes: [],
    currentQuote: null,
    lightboxImages: [],
    lightboxIndex: 0,
    favorites: loadFavorites(),
    theme: (function () {
      try { return localStorage.getItem(STORAGE_KEYS.theme) || 'dark'; } catch (e) { return 'dark'; }
    })()
  };

  // DOM Elements
  const els = {
    statsPct: document.getElementById('stats-pct'),
    statsCount: document.getElementById('stats-count'),
    statsBar: document.getElementById('stats-progress-bar'),
    citiesList: document.getElementById('cities-list'),
    searchInput: document.getElementById('search-input'),
    regionSelect: document.getElementById('region-select'),
    sortSelect: document.getElementById('sort-select'),
    filterPills: document.querySelectorAll('.filter-pill'),
    pillAll: document.getElementById('pill-all'),
    pillVisited: document.getElementById('pill-visited'),
    pillUnvisited: document.getElementById('pill-unvisited'),
    pillFavorites: document.getElementById('pill-favorites'),
    viewportContent: document.getElementById('viewport-content'),
    logoSection: document.getElementById('logo-section'),
    btnDashboard: document.getElementById('btn-dashboard'),
    btnMap: document.getElementById('btn-map'),
    btnRoute: document.getElementById('btn-route'),
    btnGallery: document.getElementById('btn-gallery'),
    btnRandom: document.getElementById('btn-random'),
    btnAmbient: document.getElementById('btn-ambient'),
    btnQuote: document.getElementById('btn-quote'),
    btnTheme: document.getElementById('btn-theme'),
    btnExport: document.getElementById('btn-export'),
    btnMobileSidebar: document.getElementById('btn-mobile-sidebar'),
    btnCloseSidebar: document.getElementById('btn-close-sidebar'),
    sidebar: document.getElementById('city-sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    mapModal: document.getElementById('map-modal'),
    quoteModal: document.getElementById('quote-modal'),
    quoteModalText: document.getElementById('quote-modal-text'),
    quoteModalAuthor: document.getElementById('quote-modal-author'),
    btnNextQuote: document.getElementById('btn-next-quote'),
    btnCopyQuote: document.getElementById('btn-copy-quote'),
    lightboxModal: document.getElementById('lightbox-modal'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxCaption: document.getElementById('lightbox-caption'),
    lightboxCloseBtn: document.getElementById('lightbox-close-btn'),
    lightboxPrevBtn: document.getElementById('lightbox-prev-btn'),
    lightboxNextBtn: document.getElementById('lightbox-next-btn'),
    toastContainer: document.getElementById('toast-container'),
    modalCloseBtns: document.querySelectorAll('.modal-close-btn')
  };

  // Toast Notification
  function showToast(message) {
    if (!els.toastContainer) return;
    const item = document.createElement('div');
    item.className = 'toast-item';
    item.textContent = message;
    els.toastContainer.appendChild(item);
    setTimeout(() => {
      item.style.opacity = '0';
      item.style.transition = 'opacity 0.25s ease';
      setTimeout(() => item.remove(), 260);
    }, 2400);
  }

  // Theme Toggle
  function applyTheme(theme) {
    state.theme = theme;
    document.body.classList.toggle('light-theme', theme === 'light');
    if (els.btnTheme) {
      els.btnTheme.textContent = theme === 'light' ? '🌙' : '☀️';
      els.btnTheme.title = theme === 'light' ? 'Gece Temasına Geç' : 'Gündüz Temasına Geç';
    }
    try { localStorage.setItem(STORAGE_KEYS.theme, theme); } catch (e) {}
  }

  function toggleTheme() {
    const next = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    showToast(next === 'light' ? '☀️ Gündüz temasına geçildi' : '🌙 Gece temasına geçildi');
  }

  // Favorites Toggle
  function toggleFavorite(key) {
    if (!state.data || !state.data.provinces[key]) return;
    const cityName = state.data.provinces[key].name;
    if (state.favorites.has(key)) {
      state.favorites.delete(key);
      showToast(`☆ ${cityName} favorilerden çıkarıldı`);
    } else {
      state.favorites.add(key);
      showToast(`⭐ ${cityName} favorilere eklendi`);
    }
    saveFavorites(state.favorites);
    renderHeaderStats();
    renderCitiesList();
    if (state.currentView === 'city' && state.selectedCityKey === key) {
      renderCityDetail(key);
    }
  }

  // URL Hash Router
  function setHash(hash) {
    if (window.location.hash !== hash) {
      try {
        history.replaceState(null, '', hash);
      } catch (e) {
        window.location.hash = hash;
      }
    }
  }

  function routeFromHash() {
    const h = window.location.hash || '';
    if (h.startsWith('#city/')) {
      const key = decodeURIComponent(h.slice('#city/'.length));
      if (state.data && state.data.provinces[key]) {
        selectCity(key, false);
        return true;
      }
    } else if (h === '#route') {
      renderRoutePlanner(null, false);
      return true;
    } else if (h === '#gallery') {
      renderGalleryView(false);
      return true;
    }
    return false;
  }

  // Initialize App
  function init() {
    applyTheme(state.theme);
    if (!state.data) {
      if (els.viewportContent) {
        els.viewportContent.innerHTML = `
          <div class="glass-card detail-card" style="max-width: 600px; margin: 40px auto; text-align: center;">
            <h2 style="color: var(--accent-gold);">Veri Modülü Yüklenemedi</h2>
            <p style="color: var(--text-secondary);">Lütfen <code>python dijital_seyyah.py build</code> komutunu çalıştırarak <code>web_data.js</code> dosyasını oluşturun.</p>
          </div>
        `;
      }
      return;
    }

    renderHeaderStats();
    populateRegionSelect();
    renderCitiesList();
    if (!routeFromHash()) {
      renderDashboard(false);
    }
    setupEventListeners();
  }

  // Update active nav highlight
  function updateNavHighlight() {
    if (els.btnDashboard) els.btnDashboard.classList.toggle('nav-active', state.currentView === 'dashboard');
    if (els.btnRoute) els.btnRoute.classList.toggle('nav-active', state.currentView === 'route');
    if (els.btnGallery) els.btnGallery.classList.toggle('nav-active', state.currentView === 'gallery');
  }

  // Header Statistics & Filter Counts
  function renderHeaderStats() {
    const s = state.data.stats;
    if (els.statsPct) els.statsPct.textContent = `%${s.progress_pct}`;
    if (els.statsCount) els.statsCount.textContent = `(${s.visited_cities}/${s.total_cities})`;
    if (els.statsBar) els.statsBar.style.width = `${s.progress_pct}%`;

    if (els.pillAll) els.pillAll.textContent = `Tümü (${s.total_cities})`;
    if (els.pillVisited) els.pillVisited.textContent = `✅ Gezildi (${s.visited_cities})`;
    if (els.pillUnvisited) els.pillUnvisited.textContent = `⏳ Bekliyor (${s.unvisited_cities})`;
    if (els.pillFavorites) els.pillFavorites.textContent = `⭐ Favori (${state.favorites.size})`;
  }

  // Populate Regions Dropdown
  function populateRegionSelect() {
    if (!els.regionSelect) return;
    els.regionSelect.innerHTML = '<option value="all">Tüm Bölgeler (7 Bölge)</option>';
    for (const [code, info] of Object.entries(state.data.regions)) {
      const regStat = state.data.stats.regional_breakdown[code];
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = `${info.icon} ${info.name} (%${regStat ? regStat.percentage : 0})`;
      els.regionSelect.appendChild(opt);
    }
  }

  // Filter & Sort Cities (Turkish locale)
  function getFilteredCities() {
    const entries = Object.entries(state.data.provinces);
    const q = normalizeTurkish(state.searchQuery);

    return entries
      .filter(([key, p]) => {
        if (state.filter === 'visited' && !p.visited) return false;
        if (state.filter === 'unvisited' && p.visited) return false;
        if (state.filter === 'favorites' && !state.favorites.has(key)) return false;
        if (state.selectedRegion !== 'all' && p.region_code !== state.selectedRegion) return false;

        if (q) {
          const haystack = normalizeTurkish([
            p.name,
            p.slug,
            String(p.plate),
            p.region,
            ...(p.landmarks || []),
            ...(p.specialties || []),
            p.custom_library || p.library || ''
          ].join(' '));
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (state.sortBy === 'plate') return a[1].plate - b[1].plate;
        if (state.sortBy === 'visited') {
          if (a[1].visited !== b[1].visited) return a[1].visited ? -1 : 1;
        }
        return a[1].name.localeCompare(b[1].name, 'tr');
      });
  }

  // Render Cities List in Sidebar
  function renderCitiesList() {
    if (!els.citiesList) return;
    const cities = getFilteredCities();

    if (cities.length === 0) {
      els.citiesList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          ${state.filter === 'favorites' ? 'Henüz favori şehir eklemediniz. Bir il sayfasından ⭐ butonuna tıklayabilirsiniz.' : 'Aradığınız kriterlere uygun şehir bulunamadı.'}
        </div>
      `;
      return;
    }

    els.citiesList.innerHTML = cities.map(([key, p]) => {
      const isSelected = state.selectedCityKey === key;
      const isFav = state.favorites.has(key);
      const statusClass = p.visited ? 'visited' : 'unvisited';
      const statusText = p.visited ? '✓ Gezildi' : '⏳';
      const thumb = p.has_banner ? p.banner_rel : 'assets/banner.jpg';

      return `
        <div class="city-item ${isSelected ? 'active' : ''}" data-city-key="${escapeHtml(key)}">
          <div class="city-info-group">
            <img class="city-thumb" src="${escapeHtml(thumb)}" alt="${escapeHtml(p.name)}" loading="lazy" />
            <div>
              <div class="city-name-text">${String(p.plate).padStart(2, '0')} • ${escapeHtml(p.name)}</div>
              <div class="city-region-sub">${escapeHtml(p.region)}</div>
            </div>
          </div>
          <div class="city-right-meta">
            ${isFav ? '<span class="fav-dot" title="Favori">★</span>' : ''}
            <span class="city-status-badge ${statusClass}">${statusText}</span>
          </div>
        </div>
      `;
    }).join('');

    els.citiesList.querySelectorAll('.city-item').forEach(el => {
      el.addEventListener('click', () => {
        const key = el.getAttribute('data-city-key');
        selectCity(key);
        closeMobileSidebar();
      });
    });
  }

  // Mobile Sidebar Helpers
  function openMobileSidebar() {
    if (els.sidebar) els.sidebar.classList.add('mobile-open');
    if (els.sidebarBackdrop) els.sidebarBackdrop.classList.add('active');
  }

  function closeMobileSidebar() {
    if (els.sidebar) els.sidebar.classList.remove('mobile-open');
    if (els.sidebarBackdrop) els.sidebarBackdrop.classList.remove('active');
  }

  // Select City & Render Detail
  function selectCity(key, updateHash = true) {
    state.selectedCityKey = key;
    state.currentView = 'city';
    if (updateHash) setHash(`#city/${encodeURIComponent(key)}`);
    updateNavHighlight();
    renderCitiesList();
    renderCityDetail(key);
    if (els.viewportContent) els.viewportContent.scrollTop = 0;
  }

  // Select Random City
  function selectRandomCity() {
    const keys = Object.keys(state.data.provinces);
    if (!keys.length) return;
    let pick = keys[Math.floor(Math.random() * keys.length)];
    if (keys.length > 1 && pick === state.selectedCityKey) {
      pick = keys[(keys.indexOf(pick) + 1) % keys.length];
    }
    selectCity(pick);
  }

  // Haversine Distance (km)
  function calcDistKm(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Get Nearest Neighbor Cities
  function getNearestCities(originKey, count = 4) {
    const origin = state.data.provinces[originKey];
    if (!origin) return [];
    return Object.entries(state.data.provinces)
      .filter(([k]) => k !== originKey)
      .map(([k, p]) => ({
        key: k,
        province: p,
        distKm: Math.round(calcDistKm(origin.lat, origin.lng, p.lat, p.lng) * 1.35)
      }))
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, count);
  }

  // Render Dashboard View
  function renderDashboard(updateHash = true) {
    state.currentView = 'dashboard';
    state.selectedCityKey = null;
    if (updateHash) setHash('#dashboard');
    updateNavHighlight();
    renderCitiesList();

    const s = state.data.stats;
    const ach = state.data.achievements || null;
    const quote = state.data.quotes[Math.floor(Math.random() * state.data.quotes.length)];
    const visitedRegions = s.visited_regions != null
      ? s.visited_regions
      : Object.values(s.regional_breakdown || {}).filter(r => r.visited > 0).length;
    const totalRegions = s.total_regions || 7;
    const daysOnRoad = s.days_on_road || (s.visited_cities * 5);
    const libraryHours = s.library_hours || (daysOnRoad * 4);

    const regionsHtml = Object.entries(state.data.regions).map(([code, rInfo]) => {
      const rStat = s.regional_breakdown[code] || { visited: 0, total: 0, percentage: 0 };
      return `
        <div class="glass-card region-card" data-region-code="${escapeHtml(code)}" style="cursor: pointer;">
          <div class="region-card-top">
            <div class="region-card-title">${rInfo.icon} ${escapeHtml(rInfo.name)}</div>
            <div class="region-card-pct">%${rStat.percentage}</div>
          </div>
          <div class="mini-progress-bar" style="width: 100%; height: 6px;">
            <div class="mini-progress-fill" style="width: ${rStat.percentage}%; background: ${rInfo.color};"></div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between;">
            <span>${rStat.visited} / ${rStat.total} İl Ziyaret Edildi</span>
            <span style="color: ${rInfo.color};">İlleri Filtrele ➔</span>
          </div>
          <div class="region-card-desc">${escapeHtml(rInfo.desc)}</div>
        </div>
      `;
    }).join('');

    let achievementsHtml = '';
    if (ach && ach.rank) {
      const nextText = ach.next_rank
        ? `Sonraki Rütbe: ${ach.next_rank.icon} ${escapeHtml(ach.next_rank.title)} (+${ach.cities_to_next_rank} il)`
        : '👑 Zirve Mertebe Tamamlandı!';

      const badgesCards = (ach.badges || []).map(b => {
        const pct = b.target ? Math.min(100, Math.round((b.current / b.target) * 100)) : 0;
        return `
          <div class="glass-card badge-card ${b.unlocked ? 'unlocked' : 'locked'}">
            <div class="badge-top">
              <div class="badge-title-row">
                <span>${b.icon}</span>
                <span>${escapeHtml(b.title)}</span>
              </div>
              <span class="badge-status-pill ${b.unlocked ? 'open' : 'closed'}">${b.unlocked ? '✓ Açık' : '🔒'}</span>
            </div>
            <div class="badge-desc">${escapeHtml(b.desc)}</div>
            <div class="mini-progress-bar" style="width: 100%; height: 5px;">
              <div class="mini-progress-fill" style="width: ${pct}%; background: ${b.unlocked ? 'var(--accent-emerald)' : 'var(--accent-gold)'};"></div>
            </div>
            <div class="badge-progress-meta">
              <span>${b.current.toLocaleString('tr-TR')} / ${b.target.toLocaleString('tr-TR')}</span>
              <span>%${pct}</span>
            </div>
          </div>
        `;
      }).join('');

      achievementsHtml = `
        <div class="glass-card rank-banner">
          <div class="rank-info">
            <div class="rank-icon-circle">${ach.rank.icon}</div>
            <div>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px;">Seyyah Rütbesi</div>
              <div class="rank-title">${escapeHtml(ach.rank.title)}</div>
              <div class="rank-desc">${escapeHtml(ach.rank.desc)}</div>
            </div>
          </div>
          <div class="rank-next">${nextText}</div>
        </div>

        <div>
          <div class="section-title">
            <span>🏆 Seyyah Başarım Rozetleri (${ach.unlocked_count}/${ach.total_badges})</span>
          </div>
          <div class="badges-grid">
            ${badgesCards}
          </div>
        </div>
      `;
    }

    els.viewportContent.innerHTML = `
      <div class="dashboard-view">
        <!-- Hero Section -->
        <div class="hero-banner hero-banner-visual">
          <div class="hero-tag">🕌 Sefer Der Vatan • ${s.total_photos || 162} Fotoğraf Arşivi</div>
          <h2>DİJİTAL SEYYAH: ANADOLU SEYAHATNAMESİ</h2>
          <p class="hero-quote">"${escapeHtml(quote.quote)}" — <strong>${escapeHtml(quote.author)}</strong></p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" id="dash-btn-map">🗺️ İnteraktif Harita</button>
            <button class="btn btn-outline" id="dash-btn-route">🧭 2-Opt Rota Planla</button>
            <button class="btn btn-outline" id="dash-btn-gallery">📸 162 Fotoğraf Galerisi</button>
            <button class="btn btn-outline" id="dash-btn-random">🎲 Rastgele Menzil</button>
            <button class="btn btn-outline" id="dash-btn-export">📚 E-Kitap İndir</button>
          </div>
        </div>

        <!-- 4 Stat Cards -->
        <div class="stats-grid">
          <div class="glass-card stat-card">
            <div class="stat-card-header">
              <span>Keşif Oranı</span>
              <span>🎯</span>
            </div>
            <div class="stat-card-value" style="color: var(--accent-emerald);">%${s.progress_pct}</div>
            <div class="stat-card-desc">81 İlin ${s.visited_cities} tanesi adımlandı</div>
          </div>

          <div class="glass-card stat-card">
            <div class="stat-card-header">
              <span>Menzil İzi</span>
              <span>🛣️</span>
            </div>
            <div class="stat-card-value" style="color: var(--accent-cyan);">${s.estimated_km.toLocaleString('tr-TR')} km</div>
            <div class="stat-card-desc">Tahmini kat edilen karayolu hattı</div>
          </div>

          <div class="glass-card stat-card">
            <div class="stat-card-header">
              <span>Kütüphane Ofisleri</span>
              <span>📖</span>
            </div>
            <div class="stat-card-value" style="color: var(--accent-gold);">${s.visited_cities}</div>
            <div class="stat-card-desc">${daysOnRoad} gün sefer • ${libraryHours} saat ilim mesaisi</div>
          </div>

          <div class="glass-card stat-card">
            <div class="stat-card-header">
              <span>Kapsanan Bölge</span>
              <span>🌍</span>
            </div>
            <div class="stat-card-value" style="color: var(--accent-purple);">${visitedRegions} / ${totalRegions}</div>
            <div class="stat-card-desc">${visitedRegions === totalRegions ? 'Tüm coğrafi bölgelere ayak basıldı' : 'Güneydoğu Anadolu sıradaki sefer!'}</div>
          </div>
        </div>

        <!-- Rank & Achievements -->
        ${achievementsHtml}

        <!-- Regional Progress -->
        <div>
          <div class="section-title">
            <span>🗺️ Bölgesel Keşif Dağılımı</span>
          </div>
          <div class="regions-grid">
            ${regionsHtml}
          </div>
        </div>

        <!-- Nomad & Library Guide -->
        <div class="glass-card detail-card">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: var(--accent-cyan); display: flex; align-items: center; gap: 8px;">
            💻 Dijital Seyyahın Çalışma Disiplini
          </h3>
          <p style="font-size: 0.86rem; color: var(--text-secondary);">
            Gündüzün ilk 4 saati şehrin İl Halk Kütüphanesinde yazılım geliştirme, okuma ve araştırma mesaisi yapılır.
            Öğleden sonra ise şehrin kadim sokakları, camileri ve tabiatı tefekkürle adımlanır. Her menzilde 5 gün kalarak GSB Seyahatsever kervansaraylarında sürdürülebilir keşif sürdürülür.
          </p>
        </div>
      </div>
    `;

    const dMap = document.getElementById('dash-btn-map');
    const dRoute = document.getElementById('dash-btn-route');
    const dGallery = document.getElementById('dash-btn-gallery');
    const dRandom = document.getElementById('dash-btn-random');
    const dExport = document.getElementById('dash-btn-export');
    if (dMap) dMap.addEventListener('click', openMapModal);
    if (dRoute) dRoute.addEventListener('click', () => renderRoutePlanner());
    if (dGallery) dGallery.addEventListener('click', () => renderGalleryView());
    if (dRandom) dRandom.addEventListener('click', selectRandomCity);
    if (dExport) dExport.addEventListener('click', exportMarkdownBook);

    document.querySelectorAll('.region-card').forEach(card => {
      card.addEventListener('click', () => {
        const code = card.getAttribute('data-region-code');
        state.selectedRegion = code;
        if (els.regionSelect) els.regionSelect.value = code;
        renderCitiesList();
        if (window.innerWidth <= 960) openMobileSidebar();
      });
    });
  }

  // Render City Detail View
  function renderCityDetail(key) {
    const p = state.data.provinces[key];
    if (!p) return;

    const bannerImg = p.has_banner ? p.banner_rel : 'assets/banner.jpg';
    const quoteText = p.custom_quote || p.quote;
    const libraryText = p.custom_library || p.library;
    const statusBadge = p.visited
      ? '<span class="tag-badge" style="background: rgba(16,185,129,0.2); color: #6ee7b7; border-color: #10b981;">✓ Ziyaret Edildi & Tefekkür Edildi</span>'
      : '<span class="tag-badge" style="background: rgba(245,158,11,0.2); color: #fcd34d; border-color: #f59e0b;">⏳ Gelecek Rotalarda Bekleniyor</span>';

    const landmarksHtml = (p.landmarks || []).map(lm => `
      <div class="landmark-item">
        <span style="color: ${p.visited ? '#10b981' : '#64748b'};">${p.visited ? '✓' : '○'}</span>
        <span>${escapeHtml(lm)}</span>
      </div>
    `).join('');

    const specialtiesHtml = (p.specialties || []).map(sp => `
      <span class="tag-badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3);">
        🍽️ ${escapeHtml(sp)}
      </span>
    `).join('');

    // Photo Gallery (banner.jpg + gallery.jpg)
    const rawImages = (Array.isArray(p.images) && p.images.length > 0)
      ? p.images
      : [bannerImg, ...(p.has_gallery && p.gallery_rel ? [p.gallery_rel] : [])];

    const galleryItems = rawImages.map((src, idx) => ({
      src,
      caption: idx === 0
        ? `${p.name} — Panoramik Kapak`
        : `${p.name} — Menzil & Kültür Karesi`
    }));

    const galleryCard = galleryItems.length > 0 ? `
      <div class="glass-card detail-card">
        <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--accent-cyan); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <span>📸 Menzil Fotoğraf Galerisi (${galleryItems.length} Görsel)</span>
          <span style="font-size: 0.74rem; font-weight: 500; color: var(--text-muted);">Büyütmek için fotoğrafa tıklayın</span>
        </h3>
        <div class="city-gallery-grid ${galleryItems.length === 1 ? 'single-photo' : ''}">
          ${galleryItems.map((img, idx) => `
            <div class="gallery-thumb-card" data-gallery-index="${idx}" role="button" tabindex="0" aria-label="${escapeHtml(img.caption)}">
              <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.caption)}" loading="lazy" />
              <div class="gallery-thumb-overlay">
                <span class="gallery-thumb-label">${escapeHtml(img.caption)}</span>
                <span class="gallery-zoom-pill">🔍 Büyüt</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    // Rich extracted markdown sections (history, spiritual figures, 5-day plan, reflection, literary quotes)
    const historyCard = p.history ? `
      <div class="glass-card detail-card">
        <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--accent-blue);">
          🌍 Şehrin Dokusu ve Tarihsel Arka Planı
        </h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.65;">
          ${formatInlineMarkdown(p.history)}
        </p>
      </div>
    ` : '';

    const spiritualList = Array.isArray(p.spiritual_figures)
      ? p.spiritual_figures
      : (p.spiritual_figures ? [p.spiritual_figures] : []);

    const spiritualCard = spiritualList.length > 0 ? `
      <div class="glass-card detail-card">
        <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--accent-emerald);">
          🕌 Manevi Mimarlar & İrfan İzleri
        </h3>
        <div class="spiritual-figures-list">
          ${spiritualList.map(item => `<div class="spiritual-figure-item">${formatInlineMarkdown(item)}</div>`).join('')}
        </div>
      </div>
    ` : '';

    const planList = Array.isArray(p.five_day_plan)
      ? p.five_day_plan
      : (p.five_day_plan ? [p.five_day_plan] : []);

    const fiveDayPlanCard = planList.length > 0 ? `
      <div class="glass-card detail-card">
        <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--accent-gold);">
          🧭 5 Günlük Seyahatsever Keşif Planı
        </h3>
        <div class="five-day-plan-list">
          ${planList.map((item, idx) => `
            <div class="five-day-plan-item">
              <span class="plan-step-badge">${idx + 1}</span>
              <div>${formatInlineMarkdown(item)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    const reflectionCard = p.reflection ? `
      <div class="glass-card detail-card">
        <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--accent-purple);">
          🕊️ Gezginin Not Defterinden (Manevi Boyut ve Tefekkür)
        </h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.65;">
          ${formatInlineMarkdown(p.reflection)}
        </p>
      </div>
    ` : '';

    const literaryCard = (p.literary_quotes && p.literary_quotes.length > 0) ? `
      <div class="glass-card detail-card">
        <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--accent-gold);">
          💬 Şehir Hakkında Edebi ve Tarihi Alıntılar
        </h3>
        <div class="literary-quotes-list">
          ${p.literary_quotes.map(lq => `<div class="literary-quote-item">${formatInlineMarkdown(lq)}</div>`).join('')}
        </div>
      </div>
    ` : '';

    // Nearest Neighbors
    const neighbors = getNearestCities(key, 4);
    const neighborsHtml = neighbors.map(n => `
      <div class="neighbor-card" data-neighbor-key="${escapeHtml(n.key)}">
        <div class="neighbor-card-top">
          <span>${escapeHtml(n.province.name)}</span>
          <span style="font-size: 0.78rem; color: var(--accent-cyan);">~${n.distKm} km</span>
        </div>
        <div class="neighbor-card-meta">
          <span>${escapeHtml(n.province.region)}</span>
          <span>${n.province.visited ? '✅ Gezildi' : '⏳ Bekliyor'}</span>
        </div>
      </div>
    `).join('');

    // Prev / Next in filtered list
    const filtered = getFilteredCities();
    const curIdx = filtered.findIndex(([k]) => k === key);
    const prevEntry = curIdx > 0 ? filtered[curIdx - 1] : null;
    const nextEntry = curIdx >= 0 && curIdx < filtered.length - 1 ? filtered[curIdx + 1] : null;

    els.viewportContent.innerHTML = `
      <div class="city-detail-view">
        <!-- Hero Header -->
        <div class="city-hero" style="background-image: url('${escapeHtml(bannerImg)}');">
          <div class="city-hero-overlay"></div>
          <div class="city-hero-content">
            <div class="city-hero-badges" style="flex-wrap: wrap;">
              <span class="tag-badge">${escapeHtml(p.region)} Bölgesi</span>
              <span class="tag-badge">Plaka: ${String(p.plate).padStart(2, '0')}</span>
              ${statusBadge}
            </div>
            <h1 class="city-hero-title">📍 ${escapeHtml(p.name)}</h1>
          </div>
        </div>

        <!-- Quote Card -->
        <div class="glass-card detail-card">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.5px;">
            📜 Şehrin Ruhu & Tefekkür Notu
          </div>
          <p style="font-size: 1.05rem; font-style: italic; color: var(--text-primary); border-left: 3px solid var(--accent-cyan); padding-left: 14px; line-height: 1.6;">
            "${escapeHtml(quoteText)}"
          </p>
        </div>

        ${galleryCard}
        ${historyCard}
        ${spiritualCard}

        <!-- Landmarks & Specialties Grid -->
        <div class="two-col-grid">
          <div class="glass-card detail-card">
            <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--accent-cyan);">
              🏛️ Öne Çıkan Miras & Duraklar
            </h3>
            <div class="landmarks-list" style="grid-template-columns: 1fr;">
              ${landmarksHtml}
            </div>
          </div>

          <div class="glass-card detail-card">
            <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--accent-gold);">
              🍽️ Yöresel Tatlar & Kültür
            </h3>
            <div class="tags-cloud">
              ${specialtiesHtml}
            </div>

            <div style="margin-top: 16px; border-top: 1px solid var(--border-glass); padding-top: 14px;">
              <h4 style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px;">
                🗺️ Koordinat Bilgisi
              </h4>
              <p style="font-family: monospace; font-size: 0.85rem; color: var(--accent-cyan);">
                ${p.lat.toFixed(4)}° K, ${p.lng.toFixed(4)}° D
              </p>
            </div>
          </div>
        </div>

        ${fiveDayPlanCard}
        ${reflectionCard}
        ${literaryCard}

        <!-- Library Nomad Card -->
        <div class="glass-card detail-card">
          <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--accent-emerald); display: flex; align-items: center; gap: 8px;">
            📖 Seyyahın Kütüphane Ofisi (Çalışma Ortamı)
          </h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
            ${escapeHtml(libraryText)}
          </p>
        </div>

        <!-- Nearest Neighbor Cities -->
        <div class="glass-card detail-card">
          <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--accent-cyan);">
            🧭 En Yakın Komşu Menziller
          </h3>
          <div class="neighbor-cards-grid">
            ${neighborsHtml}
          </div>
        </div>

        <!-- Actions & Navigation -->
        <div class="city-actions-bar">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${prevEntry ? `<button class="btn btn-outline" id="city-prev-btn">⬅️ ${escapeHtml(prevEntry[1].name)}</button>` : ''}
            ${nextEntry ? `<button class="btn btn-outline" id="city-next-btn">${escapeHtml(nextEntry[1].name)} ➡️</button>` : ''}
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-outline ${state.favorites.has(key) ? 'btn-fav-active' : ''}" id="city-fav-btn">
              ${state.favorites.has(key) ? '★ Favoride' : '☆ Favorile'}
            </button>
            <button class="btn btn-outline" id="city-share-btn">🔗 Paylaş</button>
            <button class="btn btn-outline" id="city-route-btn">🧭 Buradan Rota Planla</button>
            <a href="${escapeHtml(p.readme_rel)}" target="_blank" class="btn btn-primary">
              📄 Markdown Günlüğü ➔
            </a>
            <button class="btn btn-outline" id="city-back-btn">🏠 Genel Bakış</button>
          </div>
        </div>
      </div>
    `;

    const backBtn = document.getElementById('city-back-btn');
    if (backBtn) backBtn.addEventListener('click', () => renderDashboard());

    const favBtn = document.getElementById('city-fav-btn');
    if (favBtn) favBtn.addEventListener('click', () => toggleFavorite(key));

    const shareBtn = document.getElementById('city-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}#city/${encodeURIComponent(key)}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            showToast(`🔗 ${p.name} bağlantısı kopyalandı!`);
          }).catch(() => showToast('Bağlantı kopyalanamadı'));
        }
      });
    }

    const routeBtn = document.getElementById('city-route-btn');
    if (routeBtn) routeBtn.addEventListener('click', () => renderRoutePlanner(p.name));

    const prevBtn = document.getElementById('city-prev-btn');
    if (prevBtn && prevEntry) prevBtn.addEventListener('click', () => selectCity(prevEntry[0]));

    const nextBtn = document.getElementById('city-next-btn');
    if (nextBtn && nextEntry) nextBtn.addEventListener('click', () => selectCity(nextEntry[0]));

    els.viewportContent.querySelectorAll('.neighbor-card').forEach(card => {
      card.addEventListener('click', () => {
        const nk = card.getAttribute('data-neighbor-key');
        if (nk) selectCity(nk);
      });
    });

    els.viewportContent.querySelectorAll('.gallery-thumb-card').forEach(card => {
      const openIdx = () => {
        const idx = parseInt(card.getAttribute('data-gallery-index'), 10) || 0;
        openLightbox(galleryItems, idx);
      };
      card.addEventListener('click', openIdx);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openIdx();
        }
      });
    });
  }

  // 2-Opt TSP Optimizer (keeps start city fixed)
  function twoOptOptimize(stops) {
    if (stops.length <= 3) return stops;

    function pathDist(seq) {
      let sum = 0;
      for (let i = 0; i < seq.length - 1; i++) {
        sum += calcDistKm(seq[i].lat, seq[i].lng, seq[i + 1].lat, seq[i + 1].lng);
      }
      return sum;
    }

    let best = [...stops];
    let bestDist = pathDist(best);
    let improved = true;

    while (improved) {
      improved = false;
      for (let i = 1; i < best.length - 1; i++) {
        for (let j = i + 1; j < best.length; j++) {
          const candidate = [
            ...best.slice(0, i),
            ...best.slice(i, j + 1).reverse(),
            ...best.slice(j + 1)
          ];
          const candDist = pathDist(candidate);
          if (candDist + 0.1 < bestDist) {
            best = candidate;
            bestDist = candDist;
            improved = true;
          }
        }
      }
    }
    return best;
  }

  // Render SVG Preview Map of Turkey + Planned Route
  function buildRouteSvg(route) {
    const W = 820;
    const H = 310;
    const minLng = 25.5, maxLng = 45.0;
    const minLat = 35.7, maxLat = 42.3;

    const projX = lng => 28 + ((lng - minLng) / (maxLng - minLng)) * (W - 56);
    const projY = lat => (H - 26) - ((lat - minLat) / (maxLat - minLat)) * (H - 52);

    const routeNames = new Set(route.map(r => r.name));

    // Background dots for all 81 provinces
    const bgDots = Object.values(state.data.provinces).map(p => {
      if (routeNames.has(p.name)) return '';
      const x = projX(p.lng).toFixed(1);
      const y = projY(p.lat).toFixed(1);
      const fill = p.visited ? 'rgba(16, 185, 129, 0.55)' : 'rgba(148, 163, 184, 0.35)';
      return `<circle cx="${x}" cy="${y}" r="3.2" fill="${fill}"><title>${escapeHtml(p.name)}</title></circle>`;
    }).join('');

    // Polyline for route
    const pointsAttr = route.map(s => `${projX(s.lng).toFixed(1)},${projY(s.lat).toFixed(1)}`).join(' ');

    // Numbered route stops
    const routeNodes = route.map((s, idx) => {
      const x = projX(s.lng);
      const y = projY(s.lat);
      const isStart = idx === 0;
      const fill = isStart ? '#f59e0b' : '#00f2fe';
      const labelY = y - 12;
      return `
        <g>
          <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${isStart ? 9 : 7.5}" fill="${fill}" stroke="#04121d" stroke-width="2" />
          <text x="${x.toFixed(1)}" y="${(y + 3.5).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="800" fill="#04121d" font-family="Outfit, sans-serif">${idx + 1}</text>
          <text x="${x.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-size="10" font-weight="600" fill="#f8fafc" font-family="Plus Jakarta Sans, sans-serif">${escapeHtml(s.name)}</text>
        </g>
      `;
    }).join('');

    return `
      <svg class="route-svg-map" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Anadolu Rota Haritası Önizlemesi">
        ${bgDots}
        <polyline points="${pointsAttr}" fill="none" stroke="#00f2fe" stroke-width="2.5" stroke-dasharray="6,5" stroke-opacity="0.85" />
        ${routeNodes}
      </svg>
    `;
  }

  // Render Full 162-Photo Anatolia Gallery View
  function renderGalleryView(updateHash = true) {
    state.currentView = 'gallery';
    state.selectedCityKey = null;
    if (updateHash) setHash('#gallery');
    updateNavHighlight();
    renderCitiesList();
    if (els.viewportContent) els.viewportContent.scrollTop = 0;

    const allEntries = Object.entries(state.data.provinces)
      .filter(([, p]) => state.galleryRegion === 'all' || p.region_code === state.galleryRegion)
      .sort((a, b) => a[1].name.localeCompare(b[1].name, 'tr'));

    const galleryPhotos = [];
    allEntries.forEach(([key, p]) => {
      if (p.has_banner) {
        galleryPhotos.push({
          key,
          city: p.name,
          region: p.region,
          visited: p.visited,
          src: p.banner_rel,
          caption: `${p.name} (${p.region}) — Menzil Kapak`
        });
      }
      if (p.has_gallery) {
        galleryPhotos.push({
          key,
          city: p.name,
          region: p.region,
          visited: p.visited,
          src: p.gallery_rel,
          caption: `${p.name} (${p.region}) — Şehir Vitrini`
        });
      }
    });

    const regionButtonsHtml = `
      <button class="filter-pill ${state.galleryRegion === 'all' ? 'active' : ''}" data-g-region="all">🇹🇷 Tümü (${state.data.stats.total_photos || 162})</button>
      ${Object.entries(state.data.regions).map(([code, info]) => `
        <button class="filter-pill ${state.galleryRegion === code ? 'active' : ''}" data-g-region="${escapeHtml(code)}">${info.icon} ${escapeHtml(info.name.replace(' Bölgesi', ''))}</button>
      `).join('')}
    `;

    const cardsHtml = galleryPhotos.map((item, idx) => `
      <div class="glass-card mega-gallery-card">
        <div class="mega-gallery-img-wrap" data-mega-idx="${idx}">
          <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.caption)}" loading="lazy" />
          <span class="mega-gallery-badge ${item.visited ? 'visited' : 'unvisited'}">${item.visited ? '✓ Gezildi' : '⏳ Bekliyor'}</span>
        </div>
        <div class="mega-gallery-card-meta">
          <div>
            <div style="font-family: var(--font-heading); font-weight: 700; font-size: 0.9rem;">${escapeHtml(item.city)}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(item.region)}</div>
          </div>
          <button class="mega-gallery-city-btn" data-open-city="${escapeHtml(item.key)}">İncele ➔</button>
        </div>
      </div>
    `).join('');

    els.viewportContent.innerHTML = `
      <div class="dashboard-view">
        <div class="glass-card detail-card">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <h2 style="font-family: var(--font-heading); font-size: 1.45rem; color: var(--accent-cyan);">
                📸 Anadolu Menzil Fotoğraf Galerisi (${galleryPhotos.length} Görsel)
              </h2>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">
                81 ilin tamamına ait yüksek çözünürlüklü kapak ve şehir vitrini fotoğrafları. Tam ekran Lightbox için herhangi bir fotoğrafa tıklayın.
              </p>
            </div>
            <button class="btn btn-outline" id="gallery-back-btn">🏠 Genel Bakış</button>
          </div>
          <div class="gallery-filter-bar">
            ${regionButtonsHtml}
          </div>
        </div>

        <div class="mega-gallery-grid">
          ${cardsHtml}
        </div>
      </div>
    `;

    const backBtn = document.getElementById('gallery-back-btn');
    if (backBtn) backBtn.addEventListener('click', () => renderDashboard());

    els.viewportContent.querySelectorAll('[data-g-region]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.galleryRegion = btn.getAttribute('data-g-region');
        renderGalleryView(false);
      });
    });

    els.viewportContent.querySelectorAll('[data-mega-idx]').forEach(wrap => {
      wrap.addEventListener('click', () => {
        const idx = parseInt(wrap.getAttribute('data-mega-idx'), 10) || 0;
        openLightbox(galleryPhotos, idx);
      });
    });

    els.viewportContent.querySelectorAll('[data-open-city]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ck = btn.getAttribute('data-open-city');
        if (ck) selectCity(ck);
      });
    });
  }

  // Render Route Planner View
  function renderRoutePlanner(presetStartCity, updateHash = true) {
    state.currentView = 'route';
    state.selectedCityKey = null;
    if (presetStartCity) {
      state.routeStartCity = presetStartCity;
      state.routeMode = 'auto';
    }
    if (updateHash) setHash('#route');
    updateNavHighlight();
    renderCitiesList();

    const sortedProvinces = Object.entries(state.data.provinces)
      .sort((a, b) => a[1].name.localeCompare(b[1].name, 'tr'));

    const optionsHtml = sortedProvinces.map(([, p]) => `
      <option value="${escapeHtml(p.name)}" ${p.name === state.routeStartCity ? 'selected' : ''}>${escapeHtml(p.name)} (${escapeHtml(p.region)})</option>
    `).join('');

    const addStopOptionsHtml = sortedProvinces.map(([, p]) => `
      <option value="${escapeHtml(p.name)}">${escapeHtml(p.name)} (${escapeHtml(p.region)})</option>
    `).join('');

    const regionOptionsHtml = `
      <option value="all" ${state.routeRegion === 'all' ? 'selected' : ''}>Tüm Türkiye (7 Bölge)</option>
      ${Object.entries(state.data.regions).map(([code, r]) => `
        <option value="${escapeHtml(code)}" ${state.routeRegion === code ? 'selected' : ''}>${r.icon} Sadece ${escapeHtml(r.name)}</option>
      `).join('')}
    `;

    const isCustom = state.routeMode === 'custom';

    els.viewportContent.innerHTML = `
      <div class="dashboard-view">
        <div class="glass-card detail-card">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <h2 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--accent-cyan); display: flex; align-items: center; gap: 10px;">
              🧭 Akıllı Rota Planlayıcı
            </h2>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="filter-pill ${isCustom ? 'active' : ''}" id="btn-mode-custom">🎯 Özel Sefer Rotam (Ankara ➔ Edirne)</button>
              <button class="filter-pill ${!isCustom ? 'active' : ''}" id="btn-mode-auto">⚡ Otomatik 2-Opt Planlayıcı</button>
            </div>
          </div>

          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            ${isCustom
              ? 'Aktif Batı Karadeniz & Trakya sefer rotanız (Bolu hariç; Düzce sonrası Sakarya, İstanbul ve Edirne). Dilediğiniz durağı ekleyip çıkarabilirsiniz.'
              : 'Seçtiğiniz başlangıç noktasından itibaren henüz ziyaret edilmemiş iller arasından en kısa karayolu mesafesini hesaplar ve 2-Opt algoritmasıyla optimize eder.'}
          </p>

          ${isCustom ? `
            <div style="display: flex; gap: 12px; margin-top: 10px; flex-wrap: wrap; align-items: flex-end;">
              <div style="flex: 1; min-width: 220px;">
                <label style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Rotaya Durak Ekle</label>
                <select id="custom-add-select" class="region-select" style="margin-top: 4px;">
                  ${addStopOptionsHtml}
                </select>
              </div>
              <button class="btn btn-primary" id="btn-custom-add">➕ Durak Ekle</button>
              <button class="btn btn-outline" id="btn-custom-reset">↺ Varsayılan Rotaya Dön</button>
            </div>
          ` : `
            <div style="display: flex; gap: 14px; margin-top: 12px; flex-wrap: wrap; align-items: flex-end;">
              <div style="flex: 1; min-width: 190px;">
                <label style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Başlangıç Şehri</label>
                <select id="route-start-select" class="region-select" style="margin-top: 4px;">
                  ${optionsHtml}
                </select>
              </div>

              <div style="flex: 1; min-width: 190px;">
                <label style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Hedef Bölge</label>
                <select id="route-region-select" class="region-select" style="margin-top: 4px;">
                  ${regionOptionsHtml}
                </select>
              </div>

              <div style="width: 130px;">
                <label style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Durak Sayısı</label>
                <select id="route-stops-select" class="region-select" style="margin-top: 4px;">
                  <option value="5" ${state.routeStops === 5 ? 'selected' : ''}>5 Durak</option>
                  <option value="7" ${state.routeStops === 7 ? 'selected' : ''}>7 Durak</option>
                  <option value="9" ${state.routeStops === 9 ? 'selected' : ''}>9 Durak</option>
                  <option value="12" ${state.routeStops === 12 ? 'selected' : ''}>12 Durak</option>
                  <option value="15" ${state.routeStops === 15 ? 'selected' : ''}>15 Durak</option>
                </select>
              </div>

              <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; color: var(--text-secondary); padding: 9px 12px; background: rgba(30,41,59,0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); cursor: pointer;">
                <input type="checkbox" id="route-opt-check" ${state.routeOptimize ? 'checked' : ''} />
                2-Opt Optimizasyon
              </label>

              <button class="btn btn-primary" id="btn-calc-route">⚡ Rotayı Hesapla</button>
            </div>
          `}
        </div>

        <div id="route-results-container"></div>
      </div>
    `;

    document.getElementById('btn-mode-custom').addEventListener('click', () => {
      state.routeMode = 'custom';
      renderRoutePlanner(null, false);
    });
    document.getElementById('btn-mode-auto').addEventListener('click', () => {
      state.routeMode = 'auto';
      renderRoutePlanner(null, false);
    });

    if (isCustom) {
      document.getElementById('btn-custom-add').addEventListener('click', () => {
        const city = document.getElementById('custom-add-select').value;
        if (city && !state.customRouteCities.includes(city)) {
          state.customRouteCities.push(city);
          showToast(`➕ ${city} rotaya eklendi`);
          calculateAndRenderRoute();
        } else if (city) {
          showToast(`ℹ️ ${city} zaten rotada yer alıyor`);
        }
      });
      document.getElementById('btn-custom-reset').addEventListener('click', () => {
        state.customRouteCities = Array.isArray(state.data.custom_route)
          ? [...state.data.custom_route]
          : ['Ankara', 'Çankırı', 'Kastamonu', 'Karabük', 'Bartın', 'Zonguldak', 'Düzce', 'Sakarya', 'İstanbul', 'Edirne'];
        showToast('↺ Varsayılan Ankara ➔ Edirne rotasına dönüldü');
        calculateAndRenderRoute();
      });
    } else {
      document.getElementById('btn-calc-route').addEventListener('click', calculateAndRenderRoute);
      document.getElementById('route-start-select').addEventListener('change', calculateAndRenderRoute);
      document.getElementById('route-region-select').addEventListener('change', calculateAndRenderRoute);
      document.getElementById('route-stops-select').addEventListener('change', calculateAndRenderRoute);
      document.getElementById('route-opt-check').addEventListener('change', calculateAndRenderRoute);
    }

    calculateAndRenderRoute();
  }

  function calculateAndRenderRoute() {
    const allEntries = Object.entries(state.data.provinces).map(([key, p]) => ({ ...p, _key: key }));
    const container = document.getElementById('route-results-container');

    let finalSeq = [];
    let savedKm = 0;

    if (state.routeMode === 'custom') {
      finalSeq = state.customRouteCities
        .map(name => allEntries.find(p => normalizeTurkish(p.name) === normalizeTurkish(name)))
        .filter(Boolean);

      if (finalSeq.length === 0) {
        container.innerHTML = `
          <div class="glass-card detail-card" style="text-align: center; color: var(--text-muted);">
            Rotada hiç durak kalmadı. Yukarıdan yeni durak ekleyebilir veya varsayılan rotaya dönebilirsiniz.
          </div>
        `;
        return;
      }
    } else {
      const startName = document.getElementById('route-start-select').value;
      const regionCode = document.getElementById('route-region-select').value;
      const stopsCount = parseInt(document.getElementById('route-stops-select').value, 10);
      const useTwoOpt = document.getElementById('route-opt-check').checked;

      state.routeStartCity = startName;
      state.routeRegion = regionCode;
      state.routeStops = stopsCount;
      state.routeOptimize = useTwoOpt;

      const startCity = allEntries.find(p => p.name.toLowerCase() === startName.toLowerCase()) || allEntries[0];
      const unvisited = allEntries.filter(p =>
        !p.visited &&
        p.name !== startCity.name &&
        (regionCode === 'all' || p.region_code === regionCode)
      );

      if (unvisited.length === 0) {
        container.innerHTML = `
          <div class="glass-card detail-card" style="text-align: center; color: var(--accent-emerald);">
            🎉 Tebrikler! Seçilen bölgede ziyaret edilmemiş il kalmadı!
          </div>
        `;
        return;
      }

      // Greedy Nearest Neighbor
      let current = startCity;
      let remaining = [...unvisited];
      let greedyRoute = [current];

      while (remaining.length > 0 && greedyRoute.length <= stopsCount) {
        let nearest = remaining[0];
        let minDist = Infinity;
        for (const candidate of remaining) {
          const d = calcDistKm(current.lat, current.lng, candidate.lat, candidate.lng);
          if (d < minDist) {
            minDist = d;
            nearest = candidate;
          }
        }
        greedyRoute.push(nearest);
        remaining = remaining.filter(c => c.name !== nearest.name);
        current = nearest;
      }

      const computeRoadKm = seq => {
        let total = 0;
        for (let i = 1; i < seq.length; i++) {
          total += Math.round(calcDistKm(seq[i - 1].lat, seq[i - 1].lng, seq[i].lat, seq[i].lng) * 1.35);
        }
        return total;
      };

      const greedyKm = computeRoadKm(greedyRoute);
      finalSeq = useTwoOpt ? twoOptOptimize(greedyRoute) : greedyRoute;
      savedKm = Math.max(0, greedyKm - computeRoadKm(finalSeq));
    }

    let cumulative = 0;
    const route = finalSeq.map((stop, idx) => {
      const dist = idx === 0
        ? 0
        : Math.round(calcDistKm(finalSeq[idx - 1].lat, finalSeq[idx - 1].lng, stop.lat, stop.lng) * 1.35);
      cumulative += dist;
      return { ...stop, distFromPrev: dist, cumulativeKm: cumulative };
    });

    const totalKm = route[route.length - 1].cumulativeKm;
    const estHours = (totalKm / 80).toFixed(1);
    const seferDays = Math.max(0, route.length - 1) * 5;
    const isCustom = state.routeMode === 'custom';

    const svgMapHtml = buildRouteSvg(route);

    const stopsHtml = route.map((stop, idx) => `
      <div class="glass-card route-stop-card" data-stop-key="${escapeHtml(stop._key)}">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 34px; height: 34px; flex-shrink: 0; border-radius: 50%; background: ${idx === 0 ? 'var(--accent-gold)' : 'rgba(30,41,59,0.9)'}; color: ${idx === 0 ? '#04121d' : 'var(--accent-cyan)'}; border: 1px solid ${idx === 0 ? 'var(--accent-gold)' : 'var(--accent-cyan)'}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem;">
            ${idx + 1}
          </div>
          <div>
            <div style="font-family: var(--font-heading); font-weight: 700; font-size: 1rem; color: var(--text-primary);">
              ${escapeHtml(stop.name)} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">(${escapeHtml(stop.region)})</span>
            </div>
            <div style="font-size: 0.76rem; color: var(--text-secondary);">
              📍 ${escapeHtml(stop.landmarks ? stop.landmarks[0] : 'Tarihi Merkez')} • 🍽️ ${escapeHtml(stop.specialties ? stop.specialties[0] : 'Lezzet')}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
          <div style="text-align: right;">
            <div style="font-family: var(--font-heading); font-weight: 700; color: var(--accent-gold); font-size: 0.9rem;">
              ${idx === 0 ? 'BAŞLANGIÇ' : `+${stop.distFromPrev.toLocaleString('tr-TR')} km`}
            </div>
            ${idx > 0 ? `<div style="font-size: 0.72rem; color: var(--text-muted);">Toplam ${stop.cumulativeKm.toLocaleString('tr-TR')} km</div>` : ''}
          </div>
          ${isCustom ? `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem;" data-remove-stop="${escapeHtml(stop.name)}" title="Durağı Rotadan Çıkar">✕</button>` : ''}
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div class="glass-card route-svg-card">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
            <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--text-primary);">
              🗺️ ${isCustom ? 'Özel Sefer Rotası' : 'Anadolu Rota Önizlemesi'} (${route.length} Durak)
            </h3>
            <div class="route-summary-pills">
              <span class="route-summary-pill" style="color: var(--accent-emerald);">🛣️ ${totalKm.toLocaleString('tr-TR')} km</span>
              <span class="route-summary-pill" style="color: var(--accent-cyan);">⏱️ ~${estHours} saat sürüş</span>
              <span class="route-summary-pill" style="color: var(--accent-gold);">⛺ ${seferDays} gün (5 Gün Kuralı)</span>
              ${savedKm > 0 ? `<span class="route-summary-pill" style="color: #a7f3d0; border-color: rgba(16,185,129,0.4);">⚡ 2-Opt Tasarruf: -${savedKm} km</span>` : ''}
            </div>
          </div>
          ${svgMapHtml}
        </div>
        ${stopsHtml}
      </div>
    `;

    container.querySelectorAll('[data-remove-stop]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.getAttribute('data-remove-stop');
        state.customRouteCities = state.customRouteCities.filter(c => c !== name);
        showToast(`✕ ${name} rotadan çıkarıldı`);
        calculateAndRenderRoute();
      });
    });

    container.querySelectorAll('.route-stop-card').forEach(card => {
      card.addEventListener('click', () => {
        const sk = card.getAttribute('data-stop-key');
        if (sk) selectCity(sk);
      });
    });
  }

  // Web Audio API Sufi Soundscape Synthesizer (Cycles 3 Presets -> Off)
  function cycleAmbientSound() {
    stopAmbientSound(false);
    state.soundIndex += 1;
    if (state.soundIndex >= SOUNDSCAPES.length) {
      state.soundIndex = -1;
      updateAmbientButton();
      return;
    }
    startAmbientPreset(SOUNDSCAPES[state.soundIndex]);
  }

  function startAmbientPreset(preset) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!state.audioCtx) state.audioCtx = new AudioCtx();
      if (state.audioCtx.state === 'suspended') state.audioCtx.resume();

      const now = state.audioCtx.currentTime;
      const masterGain = state.audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.08, now + 0.6);
      masterGain.connect(state.audioCtx.destination);

      const osc1 = state.audioCtx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(preset.freq1, now);

      const osc2 = state.audioCtx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(preset.freq2, now);

      const osc2Gain = state.audioCtx.createGain();
      osc2Gain.gain.setValueAtTime(0.35, now);

      const bufferSize = state.audioCtx.sampleRate * 2;
      const noiseBuffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * preset.noiseVol;
        b6 = white * 0.115926;
      }

      const noiseSrc = state.audioCtx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;

      const filter = state.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(preset.filterFreq, now);

      noiseSrc.connect(filter);
      filter.connect(masterGain);
      osc1.connect(masterGain);
      osc2.connect(osc2Gain);
      osc2Gain.connect(masterGain);

      osc1.start();
      osc2.start();
      noiseSrc.start();

      state.audioNodes = [osc1, osc2, osc2Gain, noiseSrc, filter, masterGain];
      updateAmbientButton();
    } catch (err) {
      console.warn('Audio Context başlatılamadı:', err);
      state.soundIndex = -1;
      updateAmbientButton();
    }
  }

  function stopAmbientSound(resetIndex = true) {
    if (state.audioNodes && state.audioNodes.length) {
      state.audioNodes.forEach(n => {
        try { if (n.stop) n.stop(); if (n.disconnect) n.disconnect(); } catch (e) {}
      });
      state.audioNodes = [];
    }
    if (resetIndex) state.soundIndex = -1;
    updateAmbientButton();
  }

  function updateAmbientButton() {
    if (!els.btnAmbient) return;
    if (state.soundIndex >= 0) {
      const preset = SOUNDSCAPES[state.soundIndex];
      els.btnAmbient.classList.add('active');
      els.btnAmbient.innerHTML = `🔊 <span class="btn-label">${escapeHtml(preset.label)}</span>`;
    } else {
      els.btnAmbient.classList.remove('active');
      els.btnAmbient.innerHTML = '🎧 <span class="btn-label">Tefekkür Sesi</span>';
    }
  }

  // Export Markdown Book
  function exportMarkdownBook() {
    const visited = Object.values(state.data.provinces)
      .filter(p => p.visited)
      .sort((a, b) => a.region_code.localeCompare(b.region_code) || a.name.localeCompare(b.name, 'tr'));

    const s = state.data.stats;
    let md = `# 🕌 ANADOLU SEYAHATNAMESİ: DİJİTAL SEYYAH KÜLLİYATI\n\n`;
    md += `> *"Biz yolların bitmediği, keşfin son bulmadığı bir alemde Hakikati ve Güzelliği arayan yolcularız."*\n\n---\n\n`;
    md += `## 📊 Seyahatname Özeti\n`;
    md += `* **Toplam Ziyaret Edilen İl:** ${s.visited_cities} / ${s.total_cities}\n`;
    md += `* **Keşif Oranı:** %${s.progress_pct}\n`;
    md += `* **Kat Edilen Tahmini Mesafe:** ${s.estimated_km.toLocaleString('tr-TR')} km\n`;
    md += `* **Kapsanan Bölgeler:** ${s.visited_regions || 6} / ${s.total_regions || 7}\n\n---\n\n`;

    visited.forEach((p, idx) => {
      md += `## ${idx + 1}. 📍 ${p.name} (${String(p.plate).padStart(2, '0')}) - ${p.region}\n\n`;
      md += `> *"${p.custom_quote || p.quote}"*\n\n`;
      if (p.history) md += `### 🌍 Tarihsel Arka Plan\n${p.history}\n\n`;
      if (p.reflection) md += `### 🕊️ Tefekkür Notu\n${p.reflection}\n\n`;
      md += `### 🏛️ Öne Çıkan Miras\n`;
      (p.landmarks || []).forEach(lm => { md += `- [x] ${lm}\n`; });
      md += `\n### 🍽️ Yöresel Tatlar\n${(p.specialties || []).join(', ')}\n\n`;
      md += `### 📖 Kütüphane Ofisi\n${p.custom_library || p.library}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ANADOLU_SEYAHATNAMESI.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Modal Helpers
  function openMapModal() {
    if (els.mapModal) els.mapModal.classList.add('active');
  }

  function openQuoteModal() {
    renderRandomQuoteInModal();
    if (els.quoteModal) els.quoteModal.classList.add('active');
  }

  function renderRandomQuoteInModal() {
    const quotes = state.data.quotes || [];
    if (!quotes.length) return;
    let pick = quotes[Math.floor(Math.random() * quotes.length)];
    if (quotes.length > 1 && state.currentQuote && pick.quote === state.currentQuote.quote) {
      pick = quotes[(quotes.indexOf(pick) + 1) % quotes.length];
    }
    state.currentQuote = pick;
    if (els.quoteModalText) els.quoteModalText.textContent = `"${pick.quote}"`;
    if (els.quoteModalAuthor) els.quoteModalAuthor.textContent = `— ${pick.author}`;
    if (els.btnCopyQuote) els.btnCopyQuote.textContent = '📋 Kopyala';
  }

  function copyCurrentQuote() {
    if (!state.currentQuote) return;
    const text = `"${state.currentQuote.quote}" — ${state.currentQuote.author}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (els.btnCopyQuote) els.btnCopyQuote.textContent = '✓ Kopyalandı';
      }).catch(() => {});
    }
  }

  function openLightbox(items, index = 0) {
    if (!items || !items.length || !els.lightboxModal) return;
    state.lightboxImages = items;
    state.lightboxIndex = Math.max(0, Math.min(index, items.length - 1));
    renderLightboxImage();
    els.lightboxModal.classList.add('active');
  }

  function renderLightboxImage() {
    const items = state.lightboxImages;
    if (!items.length) return;
    const current = items[state.lightboxIndex];
    if (els.lightboxImg) {
      els.lightboxImg.src = current.src;
      els.lightboxImg.alt = current.caption || 'Menzil Fotoğrafı';
    }
    if (els.lightboxCaption) {
      const counter = items.length > 1 ? ` (${state.lightboxIndex + 1}/${items.length})` : '';
      els.lightboxCaption.textContent = `${current.caption || ''}${counter}`;
    }
    const hideNav = items.length <= 1;
    if (els.lightboxPrevBtn) els.lightboxPrevBtn.classList.toggle('hidden', hideNav);
    if (els.lightboxNextBtn) els.lightboxNextBtn.classList.toggle('hidden', hideNav);
  }

  function navigateLightbox(delta) {
    const len = state.lightboxImages.length;
    if (len <= 1) return;
    state.lightboxIndex = (state.lightboxIndex + delta + len) % len;
    renderLightboxImage();
  }

  function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  // Event Listeners
  function setupEventListeners() {
    if (els.logoSection) els.logoSection.addEventListener('click', () => renderDashboard());
    if (els.btnDashboard) els.btnDashboard.addEventListener('click', () => renderDashboard());
    if (els.btnMap) els.btnMap.addEventListener('click', openMapModal);
    if (els.btnRoute) els.btnRoute.addEventListener('click', () => renderRoutePlanner());
    if (els.btnGallery) els.btnGallery.addEventListener('click', () => renderGalleryView());
    if (els.btnRandom) els.btnRandom.addEventListener('click', selectRandomCity);
    if (els.btnAmbient) els.btnAmbient.addEventListener('click', cycleAmbientSound);
    if (els.btnQuote) els.btnQuote.addEventListener('click', openQuoteModal);
    if (els.btnTheme) els.btnTheme.addEventListener('click', toggleTheme);
    if (els.btnExport) els.btnExport.addEventListener('click', () => {
      exportMarkdownBook();
      showToast('📚 ANADOLU_SEYAHATNAMESI.md indirildi!');
    });

    if (els.sortSelect) {
      els.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderCitiesList();
      });
    }

    window.addEventListener('hashchange', () => {
      if (!routeFromHash()) {
        renderDashboard(false);
      }
    });

    if (els.btnNextQuote) els.btnNextQuote.addEventListener('click', renderRandomQuoteInModal);
    if (els.btnCopyQuote) els.btnCopyQuote.addEventListener('click', copyCurrentQuote);
    if (els.lightboxPrevBtn) els.lightboxPrevBtn.addEventListener('click', () => navigateLightbox(-1));
    if (els.lightboxNextBtn) els.lightboxNextBtn.addEventListener('click', () => navigateLightbox(1));

    if (els.btnMobileSidebar) els.btnMobileSidebar.addEventListener('click', openMobileSidebar);
    if (els.btnCloseSidebar) els.btnCloseSidebar.addEventListener('click', closeMobileSidebar);
    if (els.sidebarBackdrop) els.sidebarBackdrop.addEventListener('click', closeMobileSidebar);

    els.modalCloseBtns.forEach(btn => {
      if (btn.id !== 'btn-close-sidebar') {
        btn.addEventListener('click', closeModals);
      }
    });

    // Click outside modal content closes modal
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModals();
      });
    });

    // Search
    if (els.searchInput) {
      els.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderCitiesList();
      });
    }

    // Region Selector
    if (els.regionSelect) {
      els.regionSelect.addEventListener('change', (e) => {
        state.selectedRegion = e.target.value;
        renderCitiesList();
      });
    }

    // Filter Pills
    els.filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        els.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filter = pill.getAttribute('data-filter');
        renderCitiesList();
      });
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModals();
        closeMobileSidebar();
      } else if (els.lightboxModal && els.lightboxModal.classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navigateLightbox(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          navigateLightbox(1);
        }
      } else if (e.key === '/' && document.activeElement !== els.searchInput && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        if (window.innerWidth <= 960) openMobileSidebar();
        if (els.searchInput) els.searchInput.focus();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
