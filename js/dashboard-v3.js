/**
 * Dijital Seyyah — Cinematic Dashboard V3 Enhancer (js/dashboard-v3.js)
 * Registers on: window.SEYYAH_MODULES.dashboardV3 = { enhance(viewport, ctx) }
 *
 * Elevates the home screen (.dashboard-view) right after renderDashboard() with:
 *   1. Canlı Anadolu Vitrin Şeridi — Auto-gliding horizontal photo marquee (12 iconic visited + Mesopotamia provinces)
 *   2. Sıradaki Aktif Sefer Kartı — Live 10-stop expedition spotlight with interactive stepper, km & 5-day rule stats
 *   3. Tüm 24+ Özellik Keşif Merkezi — 4-group bento launcher for every Wave 1–3 interactive studio & module
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-dashboard-v3-styles';
  const ROAD_FACTOR = 1.25;
  const DAYS_PER_CITY = 5;
  const LIBRARY_HOURS_PER_DAY = 4;

  const DEFAULT_EXPEDITION_ROUTE = [
    'Ankara', 'Çankırı', 'Kastamonu', 'Karabük', 'Bartın',
    'Zonguldak', 'Düzce', 'Sakarya', 'İstanbul', 'Edirne'
  ];

  // Curated iconic provinces: blend of visited Anatolia gems + Mesopotamia (Güneydoğu Anadolu)
  const CURATED_SHOWCASE_NAMES = [
    'İstanbul', 'Mardin', 'Nevşehir', 'Şanlıurfa',
    'Konya', 'Gaziantep', 'Trabzon', 'Diyarbakır',
    'Antalya', 'Erzurum', 'İzmir', 'Ankara'
  ];

  // 6 Categorized Groups covering all Wave 1-7 interactive studios & modules
  const FEATURE_GROUPS = [
    {
      id: 'ai',
      title: 'Yapay Zekâ (Gemini AI)',
      shortLabel: 'AI',
      icon: '✨',
      accent: 'var(--accent-cyan, #00f2fe)',
      accentBg: 'rgba(0, 242, 254, 0.14)',
      items: [
        { view: 'advisor', icon: '✨', label: 'Akıllı Seyyah Rehberi', tag: 'Gemini AI' },
        { view: 'aiPlanner', icon: '🧠', label: 'AI Sefer Mühendisi', tag: '5 Gün Plan' },
        { view: 'aiMood', icon: '🎭', label: 'AI Ruh Hali Kaşifi', tag: '%99 Uyum' },
        { view: 'aiWriter', icon: '✍️', label: 'AI Seyahatname Yazarı', tag: 'Canlı Akış' },
        { view: 'aiBattle', icon: '⚔️', label: 'AI Şehir Düellosu', tag: 'Hakem' },
        { view: 'aiQuiz', icon: '🧩', label: 'Sonsuz AI Yarışma', tag: 'Dinamik' },
        { view: 'aiChef', icon: '🍽️', label: 'AI Gurme Şef', tag: 'Sofra' },
        { view: 'aiSearch', icon: '🔎', label: 'AI Doğal Dil Arama', tag: 'Semantik' }
      ]
    },
    {
      id: 'irfan',
      title: 'İrfan, Tefekkür & Felsefe',
      shortLabel: 'İrfan',
      icon: '🕌',
      accent: 'var(--accent-gold, #f59e0b)',
      accentBg: 'rgba(245, 158, 11, 0.14)',
      items: [
        { view: 'irfanAtlas', icon: '🕌', label: 'İrfan & Gönül Atlası', tag: '303 Şahsiyet' },
        { view: 'hikmetMeclisi', icon: '📜', label: 'Hikmet Meclisi', tag: '5 Bilge AI' },
        { view: 'sevenValleys', icon: '🕊️', label: 'Yedi Vadi (Attâr)', tag: 'Kaf Dağı' },
        { view: 'halvet', icon: '🕯️', label: 'Halvet & Tefekkür Odası', tag: 'Ney & Nefes' },
        { view: 'ethos', icon: '⚖️', label: 'Seyyah Ahlâkı & Lügat', tag: '24 Kavram' },
        { view: 'civLayers', icon: '🏛️', label: 'Medeniyet & Zaman', tag: '7 Katman' }
      ]
    },
    {
      id: 'explore',
      title: 'Keşif & Harita',
      shortLabel: 'Keşif',
      icon: '🗺️',
      accent: 'var(--accent-cyan, #00f2fe)',
      accentBg: 'rgba(0, 242, 254, 0.12)',
      items: [
        { view: 'atlas', icon: '🗺️', label: 'Vektör Atlas', tag: '81 İl SVG' },
        { view: 'route', icon: '🧭', label: 'Rota & GPX', tag: '2-Opt' },
        { view: 'radar', icon: '📡', label: 'Yakınlık Radarı', tag: 'Canlı' },
        { view: 'regions', icon: '🌍', label: '7 Bölge Rehberi', tag: '7 Coğrafya' },
        { view: 'photoWall', icon: '🖼️', label: '162 Kare Mozaik', tag: 'Masonry' },
        { view: 'deepStats', icon: '📈', label: 'İleri Analitik & Radar', tag: '81/81 Tahmin' }
      ]
    },
    {
      id: 'culture',
      title: 'Kültür & Miras',
      shortLabel: 'Kültür',
      icon: '🏛️',
      accent: 'var(--accent-gold, #f59e0b)',
      accentBg: 'rgba(245, 158, 11, 0.12)',
      items: [
        { view: 'unesco', icon: '🏛️', label: 'UNESCO Mirası', tag: '21 Alan' },
        { view: 'landmarks', icon: '🕌', label: 'Tarihi Miras', tag: '373 Eser' },
        { view: 'gastronomy', icon: '🍽️', label: 'Lezzet Atlası', tag: 'Mutfak' },
        { view: 'libraries', icon: '📚', label: 'Kütüphane Ofisleri', tag: '81 Ofis' },
        { view: 'timeline', icon: '⏳', label: 'Medeniyet Kronolojisi', tag: 'Tarih' },
        { view: 'gallery', icon: '📸', label: 'Fotoğraf Galerisi', tag: '162 Kare' }
      ]
    },
    {
      id: 'studio',
      title: 'Stüdyo, Odak & Oyun',
      shortLabel: 'Stüdyo',
      icon: '🎬',
      accent: 'var(--accent-purple, #a855f7)',
      accentBg: 'rgba(168, 85, 247, 0.12)',
      items: [
        { view: 'pomodoro', icon: '🍅', label: 'Kütüphane Pomodoro', tag: '25/50 dk' },
        { view: 'cinematicTour', icon: '🎬', label: 'Sinematik Tur', tag: 'Sinema' },
        { view: 'postcard', icon: '📮', label: 'Kartpostal Stüdyosu', tag: 'HD PNG' },
        { view: 'sound', icon: '🎧', label: 'Sufi Ses Stüdyosu', tag: '5 Kanal' },
        { view: 'quiz', icon: '🎯', label: 'Bilgi Yarışması', tag: '4 Mod' },
        { view: 'distanceGame', icon: '📏', label: 'Mesafe Düellosu', tag: 'Oyun' }
      ]
    },
    {
      id: 'planning',
      title: 'Planlama, Başarım & Defter',
      shortLabel: 'Planlama',
      icon: '🧳',
      accent: 'var(--accent-emerald, #10b981)',
      accentBg: 'rgba(16, 185, 129, 0.12)',
      items: [
        { view: 'achievements', icon: '🏆', label: 'Rütbe & Başarımlar', tag: '23 Rozet' },
        { view: 'bucketList', icon: '🎯', label: 'Anadolu Bucket List', tag: '24 Hedef' },
        { view: 'passport', icon: '🛂', label: 'Dijital Pasaport', tag: 'Mühürler' },
        { view: 'budget', icon: '💰', label: 'Bütçe Hesaplayıcı', tag: 'GSB Plan' },
        { view: 'packing', icon: '🎒', label: 'Sırt Çantası', tag: 'Liste' },
        { view: 'journal', icon: '📝', label: 'Seyir Defterim', tag: 'Günlük' }
      ]
    }
  ];

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

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371.0;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function findProvinceByName(provinces, targetName) {
    if (!provinces || !targetName) return null;
    const normTarget = normalizeTr(targetName);
    for (const [key, prov] of Object.entries(provinces)) {
      if (normalizeTr(prov.name) === normTarget) {
        return { key, prov };
      }
    }
    return null;
  }

  function getFavoriteKeys(state) {
    const favs = new Set();
    if (state && state.favorites) {
      if (state.favorites instanceof Set) {
        state.favorites.forEach((k) => favs.add(k));
      } else if (Array.isArray(state.favorites)) {
        state.favorites.forEach((k) => favs.add(k));
      }
    }
    if (!favs.size) {
      try {
        const raw = localStorage.getItem('dijital_seyyah_favorites');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) parsed.forEach((k) => favs.add(k));
        }
      } catch (e) {}
    }
    return favs;
  }

  function selectMarqueeProvinces(provinces, mode, state) {
    if (!provinces) return [];
    const entries = Object.entries(provinces).map(([key, prov]) => ({ key, prov }));

    if (mode === 'visited') {
      return entries
        .filter(({ prov }) => prov && prov.visited)
        .sort((a, b) => (a.prov.plate || 99) - (b.prov.plate || 99));
    }

    if (mode === 'mesopotamia') {
      return entries
        .filter(({ prov }) => prov && prov.region_code === '07_GuneydoguAnadolu')
        .sort((a, b) => (a.prov.plate || 99) - (b.prov.plate || 99));
    }

    if (mode === 'favorites') {
      const favKeys = getFavoriteKeys(state);
      return entries
        .filter(({ key }) => favKeys.has(key))
        .sort((a, b) => (a.prov.plate || 99) - (b.prov.plate || 99));
    }

    return selectShowcaseProvinces(provinces);
  }

  function selectShowcaseProvinces(provinces) {
    if (!provinces) return [];
    const picked = [];
    const usedKeys = new Set();

    // 1. Pick curated iconic visited & Mesopotamia provinces first
    for (const name of CURATED_SHOWCASE_NAMES) {
      const match = findProvinceByName(provinces, name);
      if (match && !usedKeys.has(match.key)) {
        picked.push(match);
        usedKeys.add(match.key);
      }
    }

    // 2. Fill up to 12 if any curated name was missing
    if (picked.length < 12) {
      const entries = Object.entries(provinces);
      for (const [key, prov] of entries) {
        if (picked.length >= 12) break;
        if (!usedKeys.has(key) && prov.has_banner && (prov.visited || prov.region_code === '07_GuneydoguAnadolu')) {
          picked.push({ key, prov });
          usedKeys.add(key);
        }
      }
    }

    return picked.slice(0, 12);
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* =====================================================================
         Dashboard V3 Showcase Enhancements (Awwwards Cyber-Sufi Editorial)
         ===================================================================== */
      @keyframes dv3FadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes dv3MarqueeGlide {
        0% { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-50%, 0, 0); }
      }

      @keyframes dv3PulseDot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.45; transform: scale(0.82); }
      }

      .dv3-block {
        position: relative;
        animation: dv3FadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .dv3-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }

      .dv3-title-group {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .dv3-live-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 10px var(--accent-cyan, #00f2fe);
        animation: dv3PulseDot 2.1s ease-in-out infinite;
        flex-shrink: 0;
      }

      .dv3-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.08rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        letter-spacing: 0.2px;
      }

      .dv3-subtitle-pill {
        font-size: 0.72rem;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 999px;
        background: rgba(0, 242, 254, 0.1);
        color: var(--accent-cyan, #00f2fe);
        border: 1px solid rgba(0, 242, 254, 0.24);
      }

      .dv3-ghost-link {
        background: transparent;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        color: var(--text-secondary, #94a3b8);
        font-size: 0.78rem;
        font-weight: 600;
        padding: 5px 12px;
        border-radius: 999px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dv3-ghost-link:hover {
        color: var(--accent-cyan, #00f2fe);
        border-color: rgba(0, 242, 254, 0.45);
        background: rgba(0, 242, 254, 0.08);
      }

      /* ---------------------------------------------------------------------
         1. Canlı Anadolu Vitrin Şeridi (Horizontal Photo Marquee)
         --------------------------------------------------------------------- */
      .dv3-marquee-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }

      .dv3-marquee-filters {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-wrap: wrap;
      }

      .dv3-marquee-pill {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 12px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: var(--bg-card, rgba(30, 41, 59, 0.6));
        color: var(--text-secondary, #94a3b8);
        font-family: inherit;
        font-size: 0.74rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dv3-marquee-pill:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(0, 242, 254, 0.4);
      }

      .dv3-marquee-pill.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.22), rgba(79, 172, 254, 0.18));
        border-color: rgba(0, 242, 254, 0.58);
        color: var(--text-primary, #f8fafc);
        box-shadow: 0 0 14px rgba(0, 242, 254, 0.16);
      }

      .dv3-marquee-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .dv3-marquee-toggle {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 12px;
        border-radius: 999px;
        border: 1px solid rgba(245, 158, 11, 0.34);
        background: rgba(245, 158, 11, 0.1);
        color: var(--accent-gold, #fbbf24);
        font-family: inherit;
        font-size: 0.74rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dv3-marquee-toggle:hover {
        background: rgba(245, 158, 11, 0.2);
        border-color: rgba(245, 158, 11, 0.58);
      }

      .dv3-marquee-toggle.is-paused {
        border-color: rgba(16, 185, 129, 0.45);
        background: rgba(16, 185, 129, 0.15);
        color: var(--accent-emerald, #34d399);
      }

      .dv3-marquee-shell {
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-lg, 20px);
        padding: 6px 0;
        -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 4%, #000 96%, transparent 100%);
        mask-image: linear-gradient(90deg, transparent 0%, #000 4%, #000 96%, transparent 100%);
      }

      .dv3-marquee-shell.is-static {
        overflow-x: auto;
        -webkit-mask-image: none;
        mask-image: none;
      }

      .dv3-marquee-track {
        display: flex;
        width: max-content;
        gap: 14px;
        will-change: transform;
        animation: dv3MarqueeGlide var(--dv3-marquee-duration, 48s) linear infinite;
      }

      .dv3-marquee-shell.is-static .dv3-marquee-track {
        animation: none;
      }

      .dv3-marquee-shell:hover .dv3-marquee-track,
      .dv3-marquee-shell:focus-within .dv3-marquee-track,
      .dv3-marquee-shell.is-paused .dv3-marquee-track {
        animation-play-state: paused;
      }

      .dv3-marquee-empty {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding: 18px 20px;
        border-radius: 16px;
        background: var(--bg-card, rgba(30, 41, 59, 0.65));
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.16));
        color: var(--text-secondary, #94a3b8);
        font-size: 0.84rem;
      }

      .dv3-city-card {
        position: relative;
        width: 228px;
        height: 146px;
        border-radius: 16px;
        overflow: hidden;
        flex-shrink: 0;
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: #0f172a;
        transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.28s ease, box-shadow 0.28s ease;
        text-align: left;
        padding: 0;
      }

      .dv3-city-card:hover {
        transform: translateY(-4px) scale(1.02);
        border-color: rgba(0, 242, 254, 0.55);
        box-shadow: 0 14px 28px -8px rgba(0, 0, 0, 0.55), 0 0 22px rgba(0, 242, 254, 0.22);
      }

      .dv3-city-card img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .dv3-city-card:hover img {
        transform: scale(1.09);
      }

      .dv3-city-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(10, 15, 29, 0.12) 0%, rgba(10, 15, 29, 0.32) 45%, rgba(10, 15, 29, 0.9) 100%);
        pointer-events: none;
      }

      .dv3-city-top {
        position: absolute;
        top: 9px;
        left: 10px;
        right: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        z-index: 2;
      }

      .dv3-plate-chip {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.5px;
        padding: 2px 7px;
        border-radius: 6px;
        background: rgba(15, 23, 42, 0.78);
        color: #f8fafc;
        border: 1px solid rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(6px);
      }

      .dv3-status-chip {
        font-size: 0.67rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        backdrop-filter: blur(6px);
      }

      .dv3-status-chip.visited {
        background: rgba(16, 185, 129, 0.88);
        color: #04121d;
      }

      .dv3-status-chip.mesopotamia {
        background: rgba(249, 115, 22, 0.9);
        color: #fff7ed;
      }

      .dv3-status-chip.planned {
        background: rgba(245, 158, 11, 0.85);
        color: #1c1917;
      }

      .dv3-city-bottom {
        position: absolute;
        left: 12px;
        right: 12px;
        bottom: 10px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 8px;
        z-index: 2;
      }

      .dv3-city-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.15;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.65);
      }

      .dv3-city-region {
        font-size: 0.72rem;
        color: #cbd5e1;
        margin-top: 2px;
      }

      .dv3-zoom-btn {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.24);
        background: rgba(15, 23, 42, 0.68);
        color: #f8fafc;
        font-size: 0.78rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0.82;
        transition: all 0.2s ease;
        flex-shrink: 0;
        backdrop-filter: blur(6px);
      }

      .dv3-zoom-btn:hover {
        opacity: 1;
        background: var(--accent-cyan, #00f2fe);
        color: #04121d;
        border-color: var(--accent-cyan, #00f2fe);
      }

      /* ---------------------------------------------------------------------
         2. Sıradaki Aktif Sefer Kartı (Live Expedition Spotlight)
         --------------------------------------------------------------------- */
      .dv3-expedition-card {
        position: relative;
        padding: 20px 22px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 0% 0%, rgba(0, 242, 254, 0.14), transparent 46%),
          radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.12), transparent 48%),
          var(--bg-card, rgba(30, 41, 59, 0.74));
        border: 1px solid rgba(0, 242, 254, 0.28);
        box-shadow: 0 14px 34px -14px rgba(0, 0, 0, 0.55);
        overflow: hidden;
      }

      .dv3-expedition-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }

      .dv3-exp-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.9px;
        color: var(--accent-gold, #f59e0b);
        margin-bottom: 5px;
      }

      .dv3-exp-heading {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.24rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.25;
      }

      .dv3-exp-sub {
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 3px;
      }

      .dv3-exp-metrics {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .dv3-exp-metric {
        background: rgba(15, 23, 42, 0.56);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: 12px;
        padding: 8px 13px;
        min-width: 96px;
        text-align: center;
      }

      .dv3-exp-metric-val {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1rem;
        font-weight: 800;
        color: var(--accent-cyan, #00f2fe);
        line-height: 1.15;
      }

      .dv3-exp-metric-val.gold { color: var(--accent-gold, #f59e0b); }
      .dv3-exp-metric-val.emerald { color: var(--accent-emerald, #10b981); }

      .dv3-exp-metric-lbl {
        font-size: 0.69rem;
        color: var(--text-muted, #64748b);
        margin-top: 2px;
      }

      /* Visual Stepper Pill Trail */
      .dv3-stepper-trail {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(10, 15, 29, 0.45);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        margin-bottom: 16px;
      }

      .dv3-stop-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 11px;
        border-radius: 999px;
        background: rgba(30, 41, 59, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: var(--text-primary, #f8fafc);
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dv3-stop-pill:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.14);
        transform: translateY(-1px);
      }

      .dv3-stop-pill.is-visited {
        border-color: rgba(16, 185, 129, 0.42);
      }

      .dv3-stop-pill.is-start {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.22), rgba(79, 172, 254, 0.22));
        border-color: rgba(0, 242, 254, 0.55);
      }

      .dv3-stop-pill.is-end {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(249, 115, 22, 0.22));
        border-color: rgba(245, 158, 11, 0.55);
      }

      .dv3-stop-num {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.68rem;
        font-weight: 800;
        width: 19px;
        height: 19px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        color: var(--accent-cyan, #00f2fe);
      }

      .dv3-stop-pill.is-visited .dv3-stop-num {
        background: rgba(16, 185, 129, 0.22);
        color: var(--accent-emerald, #10b981);
      }

      .dv3-stop-arrow {
        color: var(--text-muted, #64748b);
        font-size: 0.78rem;
        user-select: none;
      }

      .dv3-exp-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .dv3-exp-btn-group {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .dv3-exp-progress-note {
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* ---------------------------------------------------------------------
         3. Tüm 24+ Özellik Keşif Merkezi (Categorized Quick Launchers)
         --------------------------------------------------------------------- */
      .dv3-launcher-hub {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .dv3-hub-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px 14px;
        flex-wrap: wrap;
      }

      .dv3-hub-search-wrap {
        position: relative;
        display: flex;
        align-items: center;
        flex: 1 1 240px;
        max-width: 340px;
      }

      .dv3-hub-search-icon {
        position: absolute;
        left: 12px;
        font-size: 0.84rem;
        opacity: 0.72;
        pointer-events: none;
      }

      #dv3-hub-search {
        width: 100%;
        padding: 8px 34px 8px 34px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.72);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.8rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      }

      #dv3-hub-search::placeholder {
        color: var(--text-muted, #64748b);
      }

      #dv3-hub-search:focus {
        border-color: rgba(0, 242, 254, 0.62);
        background: rgba(15, 23, 42, 0.92);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .dv3-hub-search-clear {
        position: absolute;
        right: 8px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.12);
        color: var(--text-secondary, #cbd5e1);
        font-size: 0.78rem;
        line-height: 1;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        transition: background 0.18s ease, color 0.18s ease;
      }

      .dv3-hub-search-clear.is-visible {
        display: inline-flex;
      }

      .dv3-hub-search-clear:hover {
        background: rgba(239, 68, 68, 0.28);
        color: #ffffff;
      }

      .dv3-launch-pill.is-hidden {
        display: none;
      }

      .dv3-hub-empty {
        display: none;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding: 18px 20px;
        border-radius: 16px;
        background: var(--bg-card, rgba(30, 41, 59, 0.68));
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.16));
        color: var(--text-secondary, #94a3b8);
        font-size: 0.84rem;
      }

      .dv3-hub-empty.is-visible {
        display: flex;
      }

      .dv3-cat-tabs {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .dv3-cat-tab {
        padding: 6px 13px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: var(--bg-card, rgba(30, 41, 59, 0.6));
        color: var(--text-secondary, #94a3b8);
        font-size: 0.76rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dv3-cat-tab:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(0, 242, 254, 0.4);
      }

      .dv3-cat-tab.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.18));
        border-color: rgba(0, 242, 254, 0.55);
        color: var(--text-primary, #f8fafc);
        box-shadow: 0 0 14px rgba(0, 242, 254, 0.15);
      }

      .dv3-groups-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .dv3-group-card {
        padding: 16px;
        border-radius: 16px;
        background: var(--bg-card, rgba(30, 41, 59, 0.7));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
        transition: border-color 0.25s ease, transform 0.25s ease;
      }

      .dv3-group-card:hover {
        border-color: rgba(255, 255, 255, 0.22);
      }

      .dv3-group-card.is-hidden {
        display: none;
      }

      .dv3-group-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 12px;
      }

      .dv3-group-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.96rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      .dv3-group-icon {
        width: 30px;
        height: 30px;
        border-radius: 9px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.95rem;
      }

      .dv3-group-count {
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--text-muted, #64748b);
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .dv3-pill-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .dv3-launch-pill {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 9px 11px;
        border-radius: 11px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-primary, #f8fafc);
        cursor: pointer;
        text-align: left;
        transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .dv3-launch-pill:hover {
        transform: translateY(-2px);
        border-color: var(--dv3-accent, var(--accent-cyan, #00f2fe));
        background: rgba(0, 242, 254, 0.1);
        box-shadow: 0 8px 18px -8px rgba(0, 0, 0, 0.55);
      }

      .dv3-launch-left {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .dv3-launch-icon {
        font-size: 1rem;
        flex-shrink: 0;
      }

      .dv3-launch-label {
        font-size: 0.8rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dv3-launch-tag {
        font-size: 0.65rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        background: rgba(255, 255, 255, 0.06);
        padding: 2px 6px;
        border-radius: 6px;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .dv3-launch-pill:hover .dv3-launch-tag {
        color: var(--text-primary, #f8fafc);
        background: rgba(255, 255, 255, 0.14);
      }

      /* Light Theme Adjustments */
      body.light-theme .dv3-expedition-card {
        background:
          radial-gradient(circle at 0% 0%, rgba(14, 165, 233, 0.12), transparent 46%),
          radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.1), transparent 48%),
          rgba(255, 255, 255, 0.92);
        border-color: rgba(14, 165, 233, 0.28);
        box-shadow: 0 12px 28px -12px rgba(15, 23, 42, 0.16);
      }

      body.light-theme .dv3-exp-metric {
        background: rgba(241, 245, 249, 0.9);
        border-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .dv3-stepper-trail {
        background: rgba(241, 245, 249, 0.85);
        border-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .dv3-stop-pill {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      body.light-theme .dv3-stop-pill:hover {
        background: rgba(14, 165, 233, 0.12);
        border-color: #0284c7;
      }

      body.light-theme .dv3-group-card {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .dv3-launch-pill {
        background: rgba(248, 250, 252, 0.95);
        border-color: rgba(15, 23, 42, 0.09);
        color: #0f172a;
      }

      body.light-theme .dv3-launch-pill:hover {
        background: rgba(14, 165, 233, 0.1);
      }

      body.light-theme .dv3-launch-tag {
        background: rgba(15, 23, 42, 0.06);
        color: #475569;
      }

      body.light-theme .dv3-subtitle-pill {
        background: rgba(2, 132, 199, 0.1);
        color: #0369a1;
        border-color: rgba(2, 132, 199, 0.25);
      }

      body.light-theme .dv3-marquee-pill,
      body.light-theme .dv3-cat-tab {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(15, 23, 42, 0.11);
        color: #475569;
      }

      body.light-theme .dv3-marquee-pill:hover,
      body.light-theme .dv3-cat-tab:hover {
        color: #0f172a;
        border-color: rgba(2, 132, 199, 0.42);
      }

      body.light-theme .dv3-marquee-pill.active,
      body.light-theme .dv3-cat-tab.active {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.14), rgba(37, 99, 235, 0.12));
        border-color: #0284c7;
        color: #0369a1;
        box-shadow: 0 2px 10px rgba(2, 132, 199, 0.14);
      }

      body.light-theme .dv3-marquee-toggle {
        background: rgba(217, 119, 6, 0.1);
        border-color: rgba(180, 83, 9, 0.32);
        color: #b45309;
      }

      body.light-theme .dv3-marquee-toggle.is-paused {
        background: rgba(5, 150, 105, 0.12);
        border-color: rgba(5, 150, 105, 0.36);
        color: #047857;
      }

      body.light-theme #dv3-hub-search {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      body.light-theme #dv3-hub-search:focus {
        border-color: #0284c7;
        box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.14);
      }

      body.light-theme .dv3-hub-search-clear {
        background: rgba(15, 23, 42, 0.08);
        color: #475569;
      }

      body.light-theme .dv3-marquee-empty,
      body.light-theme .dv3-hub-empty {
        background: rgba(248, 250, 252, 0.94);
        border-color: rgba(15, 23, 42, 0.16);
        color: #475569;
      }

      /* Responsive */
      @media (max-width: 960px) {
        .dv3-groups-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .dv3-city-card {
          width: 196px;
          height: 132px;
        }
        .dv3-pill-grid {
          grid-template-columns: 1fr;
        }
        .dv3-expedition-card {
          padding: 16px;
        }
      }

      /* Reduced motion accessibility */
      @media (prefers-reduced-motion: reduce) {
        .dv3-marquee-shell {
          overflow-x: auto;
          -webkit-mask-image: none;
          mask-image: none;
        }
        .dv3-marquee-track {
          animation: none;
        }
        .dv3-live-dot {
          animation: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderMarqueeCard({ key, prov }, isDuplicate, esc) {
    const imgSrc = prov.has_banner && prov.banner_rel ? prov.banner_rel : 'assets/banner.jpg';
    const plateStr = String(prov.plate || 0).padStart(2, '0');
    const isMesopotamia = prov.region_code === '07_GuneydoguAnadolu';
    const statusClass = prov.visited ? 'visited' : (isMesopotamia ? 'mesopotamia' : 'planned');
    const statusLabel = prov.visited ? '✓ Gezildi' : (isMesopotamia ? '🏜️ Mezopotamya' : '⏳ Hedef');

    return `
      <div class="dv3-city-card"
           role="button"
           tabindex="${isDuplicate ? '-1' : '0'}"
           aria-label="${esc(prov.name)} — ${esc(prov.region)}"
           data-dv3-city="${esc(key)}"
           data-dv3-img="${esc(imgSrc)}"
           data-dv3-caption="${esc(prov.name)} • ${esc(prov.region)}">
        <img src="${esc(imgSrc)}" alt="${esc(prov.name)}" loading="lazy" />
        <div class="dv3-city-scrim"></div>
        <div class="dv3-city-top">
          <span class="dv3-plate-chip">${plateStr}</span>
          <span class="dv3-status-chip ${statusClass}">${statusLabel}</span>
        </div>
        <div class="dv3-city-bottom">
          <div>
            <div class="dv3-city-name">${esc(prov.name)}</div>
            <div class="dv3-city-region">${esc(prov.region)}</div>
          </div>
          <button type="button"
                  class="dv3-zoom-btn"
                  title="Fotoğrafı Büyüt"
                  aria-label="${esc(prov.name)} fotoğrafını büyüt"
                  data-dv3-zoom="1">🔍</button>
        </div>
      </div>
    `;
  }

  function renderMarqueeShellContent(shellEl, items, mode, esc) {
    if (!shellEl) return;
    if (!items.length) {
      shellEl.classList.add('is-static');
      const emptyMsg = mode === 'favorites'
        ? '⭐ Henüz favori il eklemediniz. Herhangi bir şehrin detayından ⭐ Favori butonuna tıklayarak buraya ekleyebilirsiniz.'
        : 'Bu vitrin filtresinde gösterilecek il bulunamadı.';
      shellEl.innerHTML = `
        <div class="dv3-marquee-empty">
          <span>${esc(emptyMsg)}</span>
          <button type="button" class="dv3-ghost-link" data-dv3-marquee-reset="curated">🌟 Seçkin Vitrine Dön</button>
        </div>
      `;
      return;
    }

    const shouldAnimate = items.length >= 4;
    shellEl.classList.toggle('is-static', !shouldAnimate);
    const durationSec = Math.max(28, items.length * 4);

    const trackHtml = shouldAnimate
      ? items.map((item) => renderMarqueeCard(item, false, esc)).join('') +
        items.map((item) => renderMarqueeCard(item, true, esc)).join('')
      : items.map((item) => renderMarqueeCard(item, false, esc)).join('');

    shellEl.innerHTML = `
      <div class="dv3-marquee-track" style="--dv3-marquee-duration: ${durationSec}s;">
        ${trackHtml}
      </div>
    `;
  }

  /**
   * Block 1: Canlı Anadolu Vitrin Şeridi (Horizontal Auto-Gliding Photo Marquee)
   */
  function buildMarqueeBlock(provinces, state, esc) {
    const curatedItems = selectMarqueeProvinces(provinces, 'curated', state);
    if (!curatedItems.length) return null;

    const visitedCount = selectMarqueeProvinces(provinces, 'visited', state).length;
    const mesoCount = selectMarqueeProvinces(provinces, 'mesopotamia', state).length;
    const favCount = selectMarqueeProvinces(provinces, 'favorites', state).length;

    const section = document.createElement('section');
    section.className = 'dv3-block dv3-marquee-section';
    section.setAttribute('data-dv3-block', 'marquee');
    section.setAttribute('aria-label', 'Canlı Anadolu Vitrin Şeridi');
    section.innerHTML = `
      <div class="dv3-header-row">
        <div class="dv3-title-group">
          <span class="dv3-live-dot" aria-hidden="true"></span>
          <h3 class="dv3-title">🎞️ Canlı Anadolu Vitrin Şeridi</h3>
          <span class="dv3-subtitle-pill" data-dv3-marquee-subtitle>${curatedItems.length} İkonik Menzil • Üzerine Gelince Durur</span>
        </div>
        <div class="dv3-marquee-actions">
          <button type="button"
                  class="dv3-marquee-toggle"
                  data-dv3-marquee-toggle
                  aria-pressed="false"
                  title="Şerit akışını duraklat veya sürdür">
            ⏸️ Duraklat
          </button>
          <button type="button" class="dv3-ghost-link" data-dv3-view="gallery">
            📸 Tüm 162 Fotoğraf ➔
          </button>
        </div>
      </div>
      <div class="dv3-marquee-toolbar">
        <div class="dv3-marquee-filters" role="tablist" aria-label="Vitrin Şeridi Filtreleri">
          <button type="button" class="dv3-marquee-pill active" role="tab" aria-selected="true" data-dv3-marquee-filter="curated">🌟 Seçkin Vitrin (${curatedItems.length})</button>
          <button type="button" class="dv3-marquee-pill" role="tab" aria-selected="false" data-dv3-marquee-filter="visited">✅ Gezilen ${visitedCount} İl</button>
          <button type="button" class="dv3-marquee-pill" role="tab" aria-selected="false" data-dv3-marquee-filter="mesopotamia">🏜️ Mezopotamya (${mesoCount})</button>
          <button type="button" class="dv3-marquee-pill" role="tab" aria-selected="false" data-dv3-marquee-filter="favorites">⭐ Favorilerim${favCount ? ` (${favCount})` : ''}</button>
        </div>
      </div>
      <div class="dv3-marquee-shell" data-dv3-marquee-shell></div>
    `;

    const shellEl = section.querySelector('[data-dv3-marquee-shell]');
    renderMarqueeShellContent(shellEl, curatedItems, 'curated', esc);

    return section;
  }

  /**
   * Block 2: Sıradaki Aktif Sefer Kartı (Live Expedition Spotlight)
   */
  function buildExpeditionBlock(data, state, esc, distFn) {
    const provinces = (data && data.provinces) || {};
    const rawRoute =
      (state && Array.isArray(state.customRouteCities) && state.customRouteCities.length >= 2 && state.customRouteCities) ||
      (data && Array.isArray(data.custom_route) && data.custom_route.length >= 2 && data.custom_route) ||
      DEFAULT_EXPEDITION_ROUTE;

    const stops = rawRoute.map((name, idx) => {
      const match = findProvinceByName(provinces, name);
      return {
        index: idx + 1,
        name: match ? match.prov.name : name,
        key: match ? match.key : null,
        prov: match ? match.prov : null
      };
    });

    // Calculate total road km along consecutive stops
    let totalKm = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i].prov;
      const b = stops[i + 1].prov;
      if (a && b && typeof a.lat === 'number' && typeof b.lat === 'number') {
        totalKm += distFn(a.lat, a.lng, b.lat, b.lng) * ROAD_FACTOR;
      }
    }
    totalKm = Math.round(totalKm);

    const totalDays = stops.length * DAYS_PER_CITY;
    const totalLibHours = totalDays * LIBRARY_HOURS_PER_DAY;
    const visitedInRoute = stops.filter((s) => s.prov && s.prov.visited).length;

    const stepperHtml = stops
      .map((s, idx) => {
        const classes = ['dv3-stop-pill'];
        if (idx === 0) classes.push('is-start');
        else if (idx === stops.length - 1) classes.push('is-end');
        if (s.prov && s.prov.visited) classes.push('is-visited');

        const pill = `
          <button type="button"
                  class="${classes.join(' ')}"
                  ${s.key ? `data-dv3-city="${esc(s.key)}"` : 'disabled'}
                  title="${esc(s.name)}${s.prov ? (s.prov.visited ? ' (Gezildi)' : ' (Planlanan Durak)') : ''}">
            <span class="dv3-stop-num">${String(s.index).padStart(2, '0')}</span>
            <span>${esc(s.name)}</span>
          </button>
        `;
        const arrow = idx < stops.length - 1 ? '<span class="dv3-stop-arrow" aria-hidden="true">➔</span>' : '';
        return pill + arrow;
      })
      .join('');

    const firstCity = stops[0] ? stops[0].name : 'Ankara';
    const lastCity = stops[stops.length - 1] ? stops[stops.length - 1].name : 'Edirne';

    const section = document.createElement('section');
    section.className = 'dv3-block dv3-expedition-section';
    section.setAttribute('data-dv3-block', 'expedition');
    section.setAttribute('aria-label', 'Sıradaki Aktif Sefer Kartı');
    section.innerHTML = `
      <div class="dv3-expedition-card">
        <div class="dv3-expedition-top">
          <div>
            <div class="dv3-exp-eyebrow">🎯 Sıradaki Aktif Sefer Hattı • ${stops.length} Durak</div>
            <h3 class="dv3-exp-heading">${esc(firstCity)} ➔ ${esc(lastCity)} Batı Karadeniz &amp; Trakya Seferi</h3>
            <p class="dv3-exp-sub">Her menzilde 5 gün kuralı, İl Halk Kütüphanesi mesaisi ve GSB Seyahatsever kervansaray planı.</p>
          </div>
          <div class="dv3-exp-metrics">
            <div class="dv3-exp-metric">
              <div class="dv3-exp-metric-val">~${totalKm.toLocaleString('tr-TR')} km</div>
              <div class="dv3-exp-metric-lbl">Tahmini Karayolu</div>
            </div>
            <div class="dv3-exp-metric">
              <div class="dv3-exp-metric-val gold">${totalDays} Gün</div>
              <div class="dv3-exp-metric-lbl">5 Gün Kuralı</div>
            </div>
            <div class="dv3-exp-metric">
              <div class="dv3-exp-metric-val emerald">${totalLibHours} Saat</div>
              <div class="dv3-exp-metric-lbl">Kütüphane Mesaisi</div>
            </div>
          </div>
        </div>

        <div class="dv3-stepper-trail" role="list" aria-label="Aktif Sefer Durakları">
          ${stepperHtml}
        </div>

        <div class="dv3-exp-actions">
          <div class="dv3-exp-btn-group">
            <button type="button" class="btn btn-primary" data-dv3-view="route">🧭 Rotayı Aç</button>
            <button type="button" class="btn btn-outline" data-dv3-view="atlas">🗺️ Vektör Atlasta Gör</button>
            <button type="button" class="btn btn-outline" data-dv3-view="budget">💰 Bütçeyi Hesapla</button>
          </div>
          <div class="dv3-exp-progress-note">
            Hatta ${visitedInRoute}/${stops.length} il adımlandı • Duraklara tıklayarak il rehberini açabilirsiniz
          </div>
        </div>
      </div>
    `;

    return section;
  }

  /**
   * Block 3: Tüm 24+ Özellik Keşif Merkezi (Categorized Quick Launchers)
   */
  function buildLauncherHubBlock(esc) {
    const totalFeatures = FEATURE_GROUPS.reduce((sum, g) => sum + g.items.length, 0);

    const tabsHtml = [
      `<button type="button" class="dv3-cat-tab active" role="tab" aria-selected="true" data-dv3-cat="all">Tümü (${totalFeatures})</button>`,
      ...FEATURE_GROUPS.map(
        (g) => `<button type="button" class="dv3-cat-tab" role="tab" aria-selected="false" data-dv3-cat="${esc(g.id)}">${g.icon} ${esc(g.shortLabel || g.title)} (${g.items.length})</button>`
      )
    ].join('');

    const groupsHtml = FEATURE_GROUPS.map((g) => {
      const pillsHtml = g.items
        .map((item) => {
          const searchHaystack = normalizeTr(`${item.label} ${item.tag} ${item.view} ${g.title} ${g.shortLabel || ''}`);
          return `
          <button type="button"
                  class="dv3-launch-pill"
                  style="--dv3-accent: ${g.accent};"
                  data-dv3-view="${esc(item.view)}"
                  data-dv3-search="${esc(searchHaystack)}"
                  title="${esc(item.label)} modülünü aç">
            <span class="dv3-launch-left">
              <span class="dv3-launch-icon" aria-hidden="true">${item.icon}</span>
              <span class="dv3-launch-label">${esc(item.label)}</span>
            </span>
            <span class="dv3-launch-tag">${esc(item.tag)}</span>
          </button>
        `;
        })
        .join('');

      return `
        <div class="dv3-group-card" data-dv3-group="${esc(g.id)}" data-dv3-total="${g.items.length}">
          <div class="dv3-group-head">
            <div class="dv3-group-title">
              <span class="dv3-group-icon" style="background: ${g.accentBg}; color: ${g.accent};">${g.icon}</span>
              <span>${esc(g.title)}</span>
            </div>
            <span class="dv3-group-count" data-dv3-group-count>${g.items.length} Modül</span>
          </div>
          <div class="dv3-pill-grid">
            ${pillsHtml}
          </div>
        </div>
      `;
    }).join('');

    const section = document.createElement('section');
    section.className = 'dv3-block dv3-launcher-hub';
    section.setAttribute('data-dv3-block', 'launchers');
    section.setAttribute('aria-label', 'Tüm Özellikler Keşif Merkezi');
    section.innerHTML = `
      <div class="dv3-header-row">
        <div class="dv3-title-group">
          <h3 class="dv3-title">✨ Tüm 24+ Özellik Keşif Merkezi</h3>
          <span class="dv3-subtitle-pill" data-dv3-hub-summary>${totalFeatures} İnteraktif Modül • Tek Tıkla Erişim</span>
        </div>
      </div>
      <div class="dv3-hub-controls">
        <div class="dv3-hub-search-wrap">
          <span class="dv3-hub-search-icon" aria-hidden="true">🔎</span>
          <input type="search"
                 id="dv3-hub-search"
                 placeholder="Stüdyo veya modül ara (ör. pomodoro, irfan, bütçe, AI)..."
                 autocomplete="off"
                 aria-label="Özellik ve stüdyo ara" />
          <button type="button" class="dv3-hub-search-clear" data-dv3-hub-clear title="Aramayı temizle" aria-label="Aramayı temizle">×</button>
        </div>
        <div class="dv3-cat-tabs" role="tablist" aria-label="Özellik Kategorileri">
          ${tabsHtml}
        </div>
      </div>
      <div class="dv3-groups-grid">
        ${groupsHtml}
      </div>
      <div class="dv3-hub-empty" data-dv3-hub-empty>
        <span>Aradığınız kritere uygun modül bulunamadı.</span>
        <button type="button" class="dv3-ghost-link" data-dv3-hub-reset>✨ Tümünü Göster</button>
      </div>
    `;

    return section;
  }

  /**
   * Wire interactive events cleanly on all injected V3 blocks
   */
  function wireEvents(dashboardEl, ctx, provinces, state, esc) {
    const selectCity = ctx && typeof ctx.selectCity === 'function' ? ctx.selectCity : null;
    const openView = ctx && typeof ctx.openView === 'function' ? ctx.openView : null;
    const openLightbox = ctx && typeof ctx.openLightbox === 'function' ? ctx.openLightbox : null;

    // 1. Marquee block: delegated card click / zoom / filter pills / pause-resume toggle
    const marqueeSection = dashboardEl.querySelector('[data-dv3-block="marquee"]');
    if (marqueeSection) {
      const marqueeShell = marqueeSection.querySelector('[data-dv3-marquee-shell]');
      const marqueeSubtitle = marqueeSection.querySelector('[data-dv3-marquee-subtitle]');
      const marqueeToggle = marqueeSection.querySelector('[data-dv3-marquee-toggle]');
      const marqueeFilterBtns = marqueeSection.querySelectorAll('[data-dv3-marquee-filter]');
      let isPaused = false;

      const applyMarqueeFilter = (mode) => {
        const items = selectMarqueeProvinces(provinces, mode, state);
        marqueeFilterBtns.forEach((btn) => {
          const isMatch = btn.getAttribute('data-dv3-marquee-filter') === mode;
          btn.classList.toggle('active', isMatch);
          btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        });

        renderMarqueeShellContent(marqueeShell, items, mode, esc);
        if (marqueeShell) {
          marqueeShell.classList.toggle('is-paused', isPaused);
        }

        if (marqueeSubtitle) {
          const labels = {
            curated: `${items.length} İkonik Menzil • Üzerine Gelince Durur`,
            visited: `${items.length} Gezilen İl • Üzerine Gelince Durur`,
            mesopotamia: `${items.length} Mezopotamya İli • Üzerine Gelince Durur`,
            favorites: items.length ? `${items.length} Favori Menzil` : 'Favori Listesi Boş'
          };
          marqueeSubtitle.textContent = labels[mode] || labels.curated;
        }
      };

      marqueeFilterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-dv3-marquee-filter') || 'curated';
          applyMarqueeFilter(mode);
        });
      });

      if (marqueeToggle && marqueeShell) {
        marqueeToggle.addEventListener('click', () => {
          isPaused = !isPaused;
          marqueeShell.classList.toggle('is-paused', isPaused);
          marqueeToggle.classList.toggle('is-paused', isPaused);
          marqueeToggle.setAttribute('aria-pressed', isPaused ? 'true' : 'false');
          marqueeToggle.textContent = isPaused ? '▶️ Sürdür' : '⏸️ Duraklat';
        });
      }

      if (marqueeShell) {
        marqueeShell.addEventListener('click', (e) => {
          const resetBtn = e.target && e.target.closest('[data-dv3-marquee-reset]');
          if (resetBtn) {
            applyMarqueeFilter('curated');
            return;
          }
          const card = e.target && e.target.closest('.dv3-city-card[data-dv3-city]');
          if (!card) return;
          const cityKey = card.getAttribute('data-dv3-city');
          const imgSrc = card.getAttribute('data-dv3-img');
          const caption = card.getAttribute('data-dv3-caption') || '';

          if (e.target && e.target.closest('[data-dv3-zoom]')) {
            e.stopPropagation();
            if (openLightbox && imgSrc) {
              openLightbox([{ src: imgSrc, caption }], 0);
            }
            return;
          }
          if (selectCity && cityKey) {
            selectCity(cityKey);
          }
        });

        marqueeShell.addEventListener('keydown', (e) => {
          const card = e.target && e.target.closest('.dv3-city-card[data-dv3-city]');
          if (!card) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const cityKey = card.getAttribute('data-dv3-city');
            if (selectCity && cityKey) selectCity(cityKey);
          }
        });
      }
    }

    // 2. Expedition stepper pills -> selectCity
    dashboardEl.querySelectorAll('.dv3-stop-pill[data-dv3-city]').forEach((pill) => {
      pill.addEventListener('click', () => {
        const cityKey = pill.getAttribute('data-dv3-city');
        if (selectCity && cityKey) selectCity(cityKey);
      });
    });

    // 3. View launchers (Quick buttons, gallery link, 24+ feature pills)
    dashboardEl.querySelectorAll('[data-dv3-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const viewKey = btn.getAttribute('data-dv3-view');
        if (openView && viewKey) {
          openView(viewKey);
        }
      });
    });

    // 4. Live instant search + category filter tabs in the 24+ Feature Hub
    const hubSection = dashboardEl.querySelector('[data-dv3-block="launchers"]');
    if (hubSection) {
      const searchInput = hubSection.querySelector('#dv3-hub-search');
      const clearBtn = hubSection.querySelector('[data-dv3-hub-clear]');
      const resetBtn = hubSection.querySelector('[data-dv3-hub-reset]');
      const summaryEl = hubSection.querySelector('[data-dv3-hub-summary]');
      const emptyEl = hubSection.querySelector('[data-dv3-hub-empty]');
      const tabs = hubSection.querySelectorAll('.dv3-cat-tab[data-dv3-cat]');
      const groupCards = hubSection.querySelectorAll('.dv3-group-card[data-dv3-group]');
      const totalFeatures = FEATURE_GROUPS.reduce((sum, g) => sum + g.items.length, 0);
      let activeCat = 'all';

      const applyHubFilter = () => {
        const rawQuery = searchInput ? searchInput.value : '';
        const normQuery = normalizeTr(rawQuery);
        if (clearBtn) {
          clearBtn.classList.toggle('is-visible', rawQuery.trim().length > 0);
        }

        let visibleTotal = 0;

        groupCards.forEach((card) => {
          const cardCat = card.getAttribute('data-dv3-group');
          const catMatch = activeCat === 'all' || cardCat === activeCat;
          const pills = card.querySelectorAll('.dv3-launch-pill');
          let visibleInGroup = 0;

          pills.forEach((pill) => {
            const haystack = pill.getAttribute('data-dv3-search') || '';
            const match = catMatch && (!normQuery || haystack.indexOf(normQuery) !== -1);
            pill.classList.toggle('is-hidden', !match);
            if (match) visibleInGroup += 1;
          });

          card.classList.toggle('is-hidden', visibleInGroup === 0);
          visibleTotal += visibleInGroup;

          const countEl = card.querySelector('[data-dv3-group-count]');
          const groupTotal = Number(card.getAttribute('data-dv3-total')) || pills.length;
          if (countEl) {
            countEl.textContent = normQuery
              ? `${visibleInGroup}/${groupTotal} Modül`
              : `${groupTotal} Modül`;
          }
        });

        if (summaryEl) {
          summaryEl.textContent = normQuery || activeCat !== 'all'
            ? `${visibleTotal} / ${totalFeatures} Modül Gösteriliyor`
            : `${totalFeatures} İnteraktif Modül • Tek Tıkla Erişim`;
        }

        if (emptyEl) {
          emptyEl.classList.toggle('is-visible', visibleTotal === 0);
        }
      };

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          activeCat = tab.getAttribute('data-dv3-cat') || 'all';
          tabs.forEach((t) => {
            const isActive = t === tab;
            t.classList.toggle('active', isActive);
            t.setAttribute('aria-selected', isActive ? 'true' : 'false');
          });
          applyHubFilter();
        });
      });

      if (searchInput) {
        searchInput.addEventListener('input', applyHubFilter);
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && searchInput.value) {
            searchInput.value = '';
            applyHubFilter();
          }
        });
      }

      if (clearBtn && searchInput) {
        clearBtn.addEventListener('click', () => {
          searchInput.value = '';
          applyHubFilter();
          searchInput.focus();
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeCat = 'all';
          if (searchInput) searchInput.value = '';
          tabs.forEach((t) => {
            const isAll = t.getAttribute('data-dv3-cat') === 'all';
            t.classList.toggle('active', isAll);
            t.setAttribute('aria-selected', isAll ? 'true' : 'false');
          });
          applyHubFilter();
        });
      }
    }
  }

  /**
   * Main public entry point: enhance(viewport, ctx)
   */
  function enhance(viewport, ctx) {
    if (!viewport) return;
    const dashboardEl = viewport.querySelector('.dashboard-view');
    if (!dashboardEl) return;

    injectStyles();

    // Idempotent cleanup if enhance() is triggered more than once on the same DOM
    dashboardEl.querySelectorAll('[data-dv3-block]').forEach((el) => el.remove());

    const safeCtx = ctx || {};
    const esc = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const distFn = typeof safeCtx.calcDistKm === 'function' ? safeCtx.calcDistKm : haversineKm;
    const data = safeCtx.data || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const state = safeCtx.state || {};
    const provinces = (data && data.provinces) || {};

    // Build the 3 visual showcase blocks
    const marqueeBlock = buildMarqueeBlock(provinces, state, esc);
    const expeditionBlock = buildExpeditionBlock(data, state, esc, distFn);
    const launcherHubBlock = buildLauncherHubBlock(esc);

    // Insert cleanly into .dashboard-view:
    //   Hero Banner -> [1] Marquee Strip -> [2] Active Expedition Spotlight -> Stats Grid -> [3] 24+ Feature Launchers
    const heroBanner = dashboardEl.querySelector('.hero-banner');
    const statsGrid = dashboardEl.querySelector('.stats-grid');

    if (heroBanner && heroBanner.parentNode === dashboardEl) {
      let anchor = heroBanner;
      if (marqueeBlock) {
        anchor.insertAdjacentElement('afterend', marqueeBlock);
        anchor = marqueeBlock;
      }
      if (expeditionBlock) {
        anchor.insertAdjacentElement('afterend', expeditionBlock);
      }
    } else {
      if (expeditionBlock) dashboardEl.prepend(expeditionBlock);
      if (marqueeBlock) dashboardEl.prepend(marqueeBlock);
    }

    if (launcherHubBlock) {
      if (statsGrid && statsGrid.parentNode === dashboardEl) {
        statsGrid.insertAdjacentElement('afterend', launcherHubBlock);
      } else {
        dashboardEl.appendChild(launcherHubBlock);
      }
    }

    wireEvents(dashboardEl, safeCtx, provinces, state, esc);
  }

  window.SEYYAH_MODULES.dashboardV3 = {
    enhance
  };
})();
