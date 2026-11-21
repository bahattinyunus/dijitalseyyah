/**
 * 7 Bölge Derin Keşif Vitrini (Regional Dossier Module)
 * Anadolu Seyahatnamesi — 7 Coğrafi Bölge İçin Dergi Tadında Derin Keşif Dosyası
 * Registers on window.SEYYAH_MODULES.regions = { render(container, ctx) }
 */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const REGION_ORDER = [
    '01_Marmara',
    '02_Ege',
    '03_Akdeniz',
    '04_IcAnadolu',
    '05_Karadeniz',
    '06_DoguAnadolu',
    '07_GuneydoguAnadolu'
  ];

  const DEFAULT_REGIONS = {
    '01_Marmara': {
      name: 'Marmara Bölgesi',
      short: 'Marmara',
      icon: '🏰',
      color: '#38bdf8',
      desc: 'Payitaht ve Tohum: Bir cihan imparatorluğunun mayalandığı iki kıtayı bağlayan kadim topraklar.'
    },
    '02_Ege': {
      name: 'Ege Bölgesi',
      short: 'Ege',
      icon: '🌊',
      color: '#34d399',
      desc: 'Zamanın Çizgileri & Zeytin Dalı: Antik mermerlerden turkuaz koylara uzanan bilgelik coğrafyası.'
    },
    '03_Akdeniz': {
      name: 'Akdeniz Bölgesi',
      short: 'Akdeniz',
      icon: '☀️',
      color: '#f59e0b',
      desc: 'Sıcaklık & Antik Limanlar: Torosların heybetiyle kucaklaşan bin yıllık limanlar ve bereket ovaları.'
    },
    '04_IcAnadolu': {
      name: 'İç Anadolu Bölgesi',
      short: 'İç Anadolu',
      icon: '🌾',
      color: '#fbbf24',
      desc: 'Bozkırın Kalbi & İrfan Havzası: Mevlana\'dan Yunus Emre\'ye, Hacı Bektaş\'tan Ahi Evran\'a uzanan tevazu yurdu.'
    },
    '05_Karadeniz': {
      name: 'Karadeniz Bölgesi',
      short: 'Karadeniz',
      icon: '🌲',
      color: '#10b981',
      desc: 'Zikir, Orman & Dalga: Hırçın dalgaların yemyeşil yaylalarla buluştuğu doğanın muazzam senfonisi.'
    },
    '06_DoguAnadolu': {
      name: 'Doğu Anadolu Bölgesi',
      short: 'Doğu Anadolu',
      icon: '🏔️',
      color: '#a855f7',
      desc: 'Zirvelerin İhtişamı & Kaleler: Zorlu iklimlerde pişen hayatların ve sarsılmaz kalelerin vakur duruşu.'
    },
    '07_GuneydoguAnadolu': {
      name: 'Güneydoğu Anadolu Bölgesi',
      short: 'Güneydoğu Anadolu',
      icon: '🏜️',
      color: '#f97316',
      desc: 'Mezopotamya\'nın Ninnisi & Medeniyet Beşiği: Göbeklitepe\'den Harran\'a, toprağın taşa, taşın efsaneye dönüştüğü masal.'
    }
  };

  // Module-scoped UI state
  const uiState = {
    activeRegion: null,
    provinceFilter: 'all', // 'all' | 'visited' | 'remaining'
    provinceSort: 'plate', // 'plate' | 'name' | 'visited'
    showAllSpecialties: false
  };

  function ensureStyles() {
    if (document.getElementById('region-dossier-styles')) return;
    const style = document.createElement('style');
    style.id = 'region-dossier-styles';
    style.textContent = `
      .rd-shell {
        --rd-accent: #38bdf8;
        display: flex;
        flex-direction: column;
        gap: 22px;
        max-width: 1240px;
        margin: 0 auto;
        padding-bottom: 42px;
        animation: rdFadeUp 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      }

      @keyframes rdFadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Top Header */
      .rd-page-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 12px;
      }

      .rd-page-title {
        font-family: var(--font-heading);
        font-size: 1.65rem;
        font-weight: 800;
        letter-spacing: 0.2px;
        background: linear-gradient(135deg, #ffffff 0%, var(--accent-cyan) 55%, var(--accent-gold) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .rd-page-title {
        background: linear-gradient(135deg, #0f172a 0%, #0284c7 55%, #b45309 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .rd-page-sub {
        font-size: 0.88rem;
        color: var(--text-secondary);
        margin-top: 3px;
      }

      .rd-overview-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 14px;
        border-radius: var(--radius-full);
        background: var(--bg-card);
        border: 1px solid var(--border-glass);
        font-size: 0.8rem;
        color: var(--text-secondary);
        font-weight: 600;
      }

      .rd-overview-pill strong {
        color: var(--accent-cyan);
      }

      /* 7-Region Selector Tabs */
      .rd-tabs-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 10px;
      }

      .rd-tab {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 12px 12px 11px;
        border-radius: var(--radius-md);
        background: var(--bg-card);
        border: 1px solid var(--border-glass);
        color: var(--text-primary);
        cursor: pointer;
        text-align: left;
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
        overflow: hidden;
        font-family: var(--font-body);
      }

      .rd-tab::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--tab-color, var(--accent-cyan));
        opacity: 0.55;
        transition: opacity 0.2s ease, height 0.2s ease;
      }

      .rd-tab:hover {
        transform: translateY(-2px);
        border-color: var(--tab-color, var(--accent-cyan));
        box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.45);
      }

      .rd-tab:hover::before {
        opacity: 0.95;
      }

      .rd-tab.active {
        background: linear-gradient(155deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.92) 100%);
        border-color: var(--tab-color, var(--accent-cyan));
        box-shadow: 0 0 0 1px var(--tab-color, var(--accent-cyan)), 0 10px 26px -10px var(--tab-color, var(--accent-cyan));
        transform: translateY(-2px);
      }

      .rd-tab.active::before {
        height: 4px;
        opacity: 1;
      }

      body.light-theme .rd-tab {
        background: rgba(255, 255, 255, 0.85);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .rd-tab.active {
        background: #ffffff;
        box-shadow: 0 0 0 1px var(--tab-color, #0284c7), 0 10px 22px -10px rgba(15, 23, 42, 0.22);
      }

      .rd-tab-top {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .rd-tab-icon {
        font-size: 1.25rem;
        line-height: 1;
      }

      .rd-tab-pct {
        font-size: 0.72rem;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: var(--radius-full);
        background: rgba(15, 23, 42, 0.65);
        color: var(--tab-color, var(--accent-cyan));
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-family: var(--font-heading);
      }

      body.light-theme .rd-tab-pct {
        background: rgba(15, 23, 42, 0.06);
        border-color: rgba(15, 23, 42, 0.08);
      }

      .rd-tab-name {
        font-family: var(--font-heading);
        font-size: 0.84rem;
        font-weight: 700;
        line-height: 1.2;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
      }

      .rd-tab-mini-bar {
        width: 100%;
        height: 4px;
        border-radius: 99px;
        background: rgba(148, 163, 184, 0.2);
        overflow: hidden;
      }

      .rd-tab-mini-fill {
        height: 100%;
        border-radius: 99px;
        background: var(--tab-color, var(--accent-cyan));
        transition: width 0.35s ease;
      }

      /* 4-Photo Mosaic Magazine Header */
      .rd-hero {
        position: relative;
        border-radius: var(--radius-lg);
        overflow: hidden;
        border: 1px solid var(--border-glass);
        box-shadow: var(--shadow-subtle);
        min-height: 320px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        background: #0b1220;
      }

      .rd-mosaic {
        position: absolute;
        inset: 0;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 3px;
        background: #060a14;
      }

      .rd-mosaic-tile {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        border: 0;
        padding: 0;
        background: #0f172a;
      }

      .rd-mosaic-tile img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.35s ease;
        filter: brightness(0.76) saturate(1.1);
      }

      .rd-mosaic-tile:hover img {
        transform: scale(1.07);
        filter: brightness(0.95) saturate(1.2);
      }

      .rd-mosaic-chip {
        position: absolute;
        top: 12px;
        left: 12px;
        z-index: 3;
        padding: 4px 10px;
        border-radius: var(--radius-full);
        background: rgba(10, 15, 29, 0.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.16);
        color: #f8fafc;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.2px;
        transition: background 0.2s ease, border-color 0.2s ease;
      }

      .rd-mosaic-tile:hover .rd-mosaic-chip {
        background: rgba(10, 15, 29, 0.9);
        border-color: var(--rd-accent);
      }

      .rd-hero-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(10, 15, 29, 0.18) 0%,
          rgba(10, 15, 29, 0.56) 44%,
          rgba(10, 15, 29, 0.94) 100%
        );
        pointer-events: none;
        z-index: 2;
      }

      .rd-hero-content {
        position: relative;
        z-index: 4;
        padding: 26px 28px 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        pointer-events: none;
      }

      .rd-hero-content button,
      .rd-hero-content a {
        pointer-events: auto;
      }

      .rd-hero-top-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 16px;
      }

      .rd-hero-identity {
        max-width: 720px;
      }

      .rd-hero-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        border-radius: var(--radius-full);
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid var(--rd-accent);
        color: var(--rd-accent);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        margin-bottom: 10px;
      }

      .rd-hero-title {
        font-family: var(--font-heading);
        font-size: 2.1rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.15;
        text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .rd-hero-desc {
        margin-top: 8px;
        font-size: 0.98rem;
        color: rgba(241, 245, 249, 0.9);
        font-style: italic;
        line-height: 1.55;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
      }

      /* 1-Click 2-Opt Route CTA */
      .rd-cta-btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 13px 22px;
        border-radius: var(--radius-md);
        border: 1px solid rgba(255, 255, 255, 0.25);
        background: linear-gradient(135deg, var(--rd-accent) 0%, #0ea5e9 100%);
        color: #06101d;
        font-family: var(--font-heading);
        font-size: 0.92rem;
        font-weight: 800;
        letter-spacing: 0.2px;
        cursor: pointer;
        box-shadow: 0 10px 26px -8px var(--rd-accent);
        transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        white-space: nowrap;
      }

      .rd-cta-btn:hover {
        transform: translateY(-2px);
        filter: brightness(1.08);
        box-shadow: 0 14px 32px -8px var(--rd-accent);
      }

      .rd-cta-btn:active {
        transform: translateY(0);
      }

      /* Live Progress Bar in Hero */
      .rd-progress-wrap {
        display: flex;
        flex-direction: column;
        gap: 7px;
        background: rgba(10, 15, 29, 0.62);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: var(--radius-md);
        padding: 12px 16px;
      }

      .rd-progress-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 0.84rem;
        color: #e2e8f0;
      }

      .rd-progress-status {
        font-weight: 700;
        color: var(--rd-accent);
      }

      .rd-progress-track {
        width: 100%;
        height: 10px;
        border-radius: var(--radius-full);
        background: rgba(255, 255, 255, 0.14);
        overflow: hidden;
      }

      .rd-progress-fill {
        height: 100%;
        border-radius: var(--radius-full);
        background: linear-gradient(90deg, var(--rd-accent), #ffffff);
        box-shadow: 0 0 14px var(--rd-accent);
        transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
      }

      /* KPI Strip */
      .rd-kpi-strip {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 12px;
      }

      .rd-kpi-card {
        background: var(--bg-card);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-md);
        padding: 15px 14px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        position: relative;
        overflow: hidden;
        transition: transform 0.2s ease, border-color 0.2s ease;
      }

      .rd-kpi-card:hover {
        transform: translateY(-2px);
        border-color: var(--rd-accent);
      }

      .rd-kpi-card::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--rd-accent);
        opacity: 0.35;
      }

      .rd-kpi-icon {
        font-size: 1.15rem;
        line-height: 1;
        margin-bottom: 2px;
      }

      .rd-kpi-value {
        font-family: var(--font-heading);
        font-size: 1.55rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.1;
      }

      .rd-kpi-label {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-weight: 600;
      }

      /* Section Panels */
      .rd-section {
        background: var(--bg-card);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-lg);
        padding: 20px 22px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      body.light-theme .rd-section,
      body.light-theme .rd-kpi-card {
        background: rgba(255, 255, 255, 0.88);
        border-color: rgba(15, 23, 42, 0.1);
      }

      .rd-section-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
      }

      .rd-section-title {
        font-family: var(--font-heading);
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .rd-section-badge {
        font-size: 0.74rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: var(--radius-full);
        background: rgba(148, 163, 184, 0.15);
        color: var(--rd-accent);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      body.light-theme .rd-section-badge {
        background: rgba(15, 23, 42, 0.06);
        border-color: rgba(15, 23, 42, 0.08);
      }

      /* Specialties Cloud */
      .rd-spec-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
      }

      .rd-spec-pill {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 7px 13px;
        border-radius: var(--radius-full);
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass);
        color: var(--text-primary);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        font-family: var(--font-body);
      }

      .rd-spec-pill:hover {
        transform: translateY(-2px);
        border-color: var(--rd-accent);
        background: rgba(30, 41, 59, 0.9);
      }

      body.light-theme .rd-spec-pill {
        background: rgba(241, 245, 249, 0.9);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .rd-spec-pill:hover {
        background: #ffffff;
        border-color: var(--rd-accent);
      }

      .rd-spec-city {
        font-size: 0.71rem;
        color: var(--text-secondary);
        padding-left: 6px;
        border-left: 1px solid rgba(148, 163, 184, 0.3);
        font-weight: 500;
      }

      .rd-toggle-more-btn {
        align-self: flex-start;
        background: transparent;
        border: 1px dashed var(--border-glass);
        color: var(--text-secondary);
        padding: 6px 14px;
        border-radius: var(--radius-full);
        font-size: 0.79rem;
        font-weight: 600;
        cursor: pointer;
        transition: color 0.2s ease, border-color 0.2s ease;
      }

      .rd-toggle-more-btn:hover {
        color: var(--text-primary);
        border-color: var(--rd-accent);
      }

      /* Province Grid Controls */
      .rd-controls {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .rd-filter-btn {
        padding: 6px 12px;
        border-radius: var(--radius-full);
        border: 1px solid var(--border-glass);
        background: rgba(15, 23, 42, 0.45);
        color: var(--text-secondary);
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .rd-filter-btn:hover {
        color: var(--text-primary);
        border-color: var(--rd-accent);
      }

      .rd-filter-btn.active {
        background: var(--rd-accent);
        color: #06101d;
        border-color: var(--rd-accent);
        font-weight: 800;
      }

      body.light-theme .rd-filter-btn {
        background: rgba(241, 245, 249, 0.9);
      }

      body.light-theme .rd-filter-btn.active {
        color: #ffffff;
      }

      .rd-sort-select {
        padding: 6px 11px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-glass);
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary);
        font-size: 0.78rem;
        font-family: var(--font-body);
        cursor: pointer;
      }

      body.light-theme .rd-sort-select {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.15);
      }

      /* Province Grid */
      .rd-province-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));
        gap: 16px;
      }

      .rd-city-card {
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-md);
        overflow: hidden;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid var(--border-glass);
        cursor: pointer;
        transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.24s ease, box-shadow 0.24s ease;
      }

      .rd-city-card:hover {
        transform: translateY(-4px);
        border-color: var(--rd-accent);
        box-shadow: 0 14px 28px -12px rgba(0, 0, 0, 0.55);
      }

      .rd-city-card:focus-visible {
        outline: 2px solid var(--rd-accent);
        outline-offset: 2px;
      }

      body.light-theme .rd-city-card {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
      }

      .rd-city-media {
        position: relative;
        height: 146px;
        overflow: hidden;
        background: #0f172a;
      }

      .rd-city-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.5s ease;
      }

      .rd-city-card:hover .rd-city-media img {
        transform: scale(1.06);
      }

      .rd-city-media::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(10, 15, 29, 0.15) 0%, rgba(10, 15, 29, 0.72) 100%);
        pointer-events: none;
      }

      .rd-plate-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 2;
        padding: 3px 9px;
        border-radius: var(--radius-sm);
        background: rgba(10, 15, 29, 0.8);
        backdrop-filter: blur(6px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #ffffff;
        font-family: var(--font-heading);
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.6px;
      }

      .rd-status-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 2;
        padding: 3px 10px;
        border-radius: var(--radius-full);
        font-size: 0.71rem;
        font-weight: 700;
        backdrop-filter: blur(6px);
      }

      .rd-status-badge.visited {
        background: rgba(16, 185, 129, 0.88);
        color: #032219;
        border: 1px solid rgba(255, 255, 255, 0.25);
      }

      .rd-status-badge.pending {
        background: rgba(15, 23, 42, 0.76);
        color: #e2e8f0;
        border: 1px solid rgba(255, 255, 255, 0.18);
      }

      .rd-city-name-overlay {
        position: absolute;
        bottom: 10px;
        left: 12px;
        right: 12px;
        z-index: 2;
        font-family: var(--font-heading);
        font-size: 1.15rem;
        font-weight: 800;
        color: #ffffff;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.65);
      }

      .rd-city-body {
        padding: 13px 14px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }

      .rd-city-landmark {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .rd-city-landmark-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .rd-city-meta-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-top: auto;
        padding-top: 6px;
        border-top: 1px solid rgba(148, 163, 184, 0.14);
      }

      .rd-city-open-hint {
        color: var(--rd-accent);
        font-weight: 700;
      }

      .rd-empty-state {
        text-align: center;
        padding: 32px 16px;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }

      /* Responsive Breakpoints */
      @media (max-width: 1100px) {
        .rd-tabs-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .rd-kpi-strip {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      @media (max-width: 760px) {
        .rd-tabs-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .rd-mosaic {
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
        }
        .rd-hero {
          min-height: 360px;
        }
        .rd-hero-title {
          font-size: 1.55rem;
        }
        .rd-hero-content {
          padding: 18px 16px;
        }
        .rd-kpi-strip {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .rd-section {
          padding: 16px;
        }
      }

      @media (max-width: 480px) {
        .rd-cta-btn {
          width: 100%;
          justify-content: center;
        }
        .rd-province-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function padPlate(plate) {
    const n = Number(plate);
    if (!Number.isFinite(n)) return '00';
    return n < 10 ? `0${n}` : String(n);
  }

  function getProgressLabel(pct, visited, total) {
    if (total === 0) return 'Veri Bekleniyor';
    if (visited === 0) return 'Keşif Başlamayı Bekliyor';
    if (visited === total) return 'Bölge Fatihi — %100 Tamamlandı!';
    if (pct >= 75) return 'Zirveye Çok Yakın';
    if (pct >= 50) return 'Bölgenin Yarısı Aşıldı';
    if (pct >= 25) return 'Aktif Keşif Sürüyor';
    return 'İlk Adımlar Atıldı';
  }

  function buildRegionsModel(data) {
    const breakdown = (data && data.stats && data.stats.regional_breakdown) || {};
    const provincesObj = (data && data.provinces) || {};
    const byRegion = {};

    REGION_ORDER.forEach((code) => {
      byRegion[code] = [];
    });

    Object.entries(provincesObj).forEach(([key, p]) => {
      const code = p.region_code;
      if (!byRegion[code]) byRegion[code] = [];
      byRegion[code].push({ key, ...p });
    });

    return REGION_ORDER.map((code) => {
      const fallback = DEFAULT_REGIONS[code];
      const meta = breakdown[code] || {};
      const list = (byRegion[code] || []).slice().sort((a, b) => (a.plate || 0) - (b.plate || 0));
      const total = list.length || meta.total || 0;
      const visited = list.length
        ? list.filter((p) => Boolean(p.visited)).length
        : (meta.visited || 0);
      const remaining = Math.max(0, total - visited);
      const pct = total > 0 ? Math.round((visited / total) * 1000) / 10 : 0;

      let totalLandmarks = 0;
      const specialties = [];
      list.forEach((p) => {
        if (Array.isArray(p.landmarks)) totalLandmarks += p.landmarks.length;
        if (Array.isArray(p.specialties)) {
          p.specialties.forEach((sp) => {
            if (sp && String(sp).trim()) {
              specialties.push({
                name: String(sp).trim(),
                cityName: p.name,
                cityKey: p.key,
                visited: Boolean(p.visited)
              });
            }
          });
        }
      });

      return {
        code,
        name: meta.name || fallback.name,
        short: fallback.short,
        icon: meta.icon || fallback.icon,
        color: meta.color || fallback.color,
        desc: meta.desc || fallback.desc,
        provinces: list,
        total,
        visited,
        remaining,
        pct,
        totalLandmarks,
        totalSpecialties: specialties.length,
        totalPhotos: total * 2,
        specialties
      };
    });
  }

  function pickMosaicProvinces(provinces) {
    if (!provinces.length) return [];
    const withBanner = provinces.filter((p) => p.has_banner && p.banner_rel);
    const pool = withBanner.length ? withBanner : provinces;

    // Prefer a balanced showcase: up to 2 visited + remaining iconic/spread provinces
    const visitedPool = pool.filter((p) => p.visited);
    const pendingPool = pool.filter((p) => !p.visited);
    const chosen = [];
    const seen = new Set();

    const pushUnique = (item) => {
      if (!item || seen.has(item.key)) return;
      seen.add(item.key);
      chosen.push(item);
    };

    // Spread picks across the sorted list for visual variety
    const pickSpread = (arr, maxCount) => {
      if (!arr.length || maxCount <= 0) return;
      if (arr.length <= maxCount) {
        arr.forEach(pushUnique);
        return;
      }
      const step = (arr.length - 1) / Math.max(1, maxCount - 1);
      for (let i = 0; i < maxCount; i++) {
        pushUnique(arr[Math.round(i * step)]);
      }
    };

    pickSpread(visitedPool, Math.min(2, visitedPool.length));
    pickSpread(pendingPool, 4 - chosen.length);
    if (chosen.length < 4) {
      pool.forEach((p) => {
        if (chosen.length < 4) pushUnique(p);
      });
    }

    // Ensure exactly 4 tiles if pool has at least 1 province
    while (chosen.length < 4 && pool.length > 0) {
      chosen.push(pool[chosen.length % pool.length]);
    }
    return chosen.slice(0, 4);
  }

  function filterAndSortProvinces(provinces) {
    let list = provinces.slice();
    if (uiState.provinceFilter === 'visited') {
      list = list.filter((p) => p.visited);
    } else if (uiState.provinceFilter === 'remaining') {
      list = list.filter((p) => !p.visited);
    }

    if (uiState.provinceSort === 'name') {
      list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'tr'));
    } else if (uiState.provinceSort === 'visited') {
      list.sort((a, b) => {
        if (Boolean(a.visited) !== Boolean(b.visited)) return a.visited ? -1 : 1;
        return (a.plate || 0) - (b.plate || 0);
      });
    } else {
      list.sort((a, b) => (a.plate || 0) - (b.plate || 0));
    }

    return list;
  }

  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const data = safeCtx.data || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const state = safeCtx.state || {};
    const escapeHtml = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const selectCity = typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};
    const openView = typeof safeCtx.openView === 'function' ? safeCtx.openView : function () {};

    if (!data || !data.provinces) {
      container.innerHTML = `
        <div class="glass-card" style="padding: 28px; text-align: center; max-width: 560px; margin: 32px auto;">
          <h3 style="margin-bottom: 8px;">Veri Yüklenemedi</h3>
          <p style="color: var(--text-secondary);">7 Bölge Derin Keşif Vitrini için il verileri bulunamadı.</p>
        </div>
      `;
      return;
    }

    const regions = buildRegionsModel(data);
    const regionMap = {};
    regions.forEach((r) => {
      regionMap[r.code] = r;
    });

    if (!uiState.activeRegion || !regionMap[uiState.activeRegion]) {
      if (state.selectedRegion && regionMap[state.selectedRegion]) {
        uiState.activeRegion = state.selectedRegion;
      } else {
        uiState.activeRegion = REGION_ORDER[0];
      }
    }

    const active = regionMap[uiState.activeRegion];
    const totalVisitedAll = regions.reduce((acc, r) => acc + r.visited, 0);
    const totalCitiesAll = regions.reduce((acc, r) => acc + r.total, 0);
    const completedRegions = regions.filter((r) => r.total > 0 && r.visited === r.total).length;

    const mosaicCities = pickMosaicProvinces(active.provinces);
    const visibleProvinces = filterAndSortProvinces(active.provinces);

    const maxInitialSpecialties = 24;
    const specialtiesToShow = uiState.showAllSpecialties
      ? active.specialties
      : active.specialties.slice(0, maxInitialSpecialties);
    const hiddenSpecCount = Math.max(0, active.specialties.length - specialtiesToShow.length);

    const tabsHtml = regions
      .map((r) => {
        const isActive = r.code === active.code;
        return `
          <button
            type="button"
            class="rd-tab ${isActive ? 'active' : ''}"
            data-rd-region="${escapeHtml(r.code)}"
            style="--tab-color: ${escapeHtml(r.color)};"
            aria-pressed="${isActive ? 'true' : 'false'}"
            title="${escapeHtml(r.name)} (${r.visited}/${r.total} il)"
          >
            <div class="rd-tab-top">
              <span class="rd-tab-icon" aria-hidden="true">${escapeHtml(r.icon)}</span>
              <span class="rd-tab-pct">%${r.pct.toFixed(0)}</span>
            </div>
            <div class="rd-tab-name">${escapeHtml(r.short)}</div>
            <div class="rd-tab-mini-bar" aria-hidden="true">
              <div class="rd-tab-mini-fill" style="width: ${Math.min(100, Math.max(0, r.pct))}%;"></div>
            </div>
          </button>
        `;
      })
      .join('');

    const mosaicHtml = mosaicCities
      .map((city) => {
        const imgSrc = city.has_banner && city.banner_rel ? city.banner_rel : 'assets/banner.jpg';
        return `
          <button
            type="button"
            class="rd-mosaic-tile"
            data-rd-city="${escapeHtml(city.key)}"
            title="${escapeHtml(city.name)} detayını aç"
          >
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(city.name)}" loading="lazy" />
            <span class="rd-mosaic-chip">${escapeHtml(padPlate(city.plate))} · ${escapeHtml(city.name)}</span>
          </button>
        `;
      })
      .join('');

    const specialtiesHtml = specialtiesToShow.length
      ? specialtiesToShow
          .map(
            (sp) => `
              <button
                type="button"
                class="rd-spec-pill"
                data-rd-city="${escapeHtml(sp.cityKey)}"
                title="${escapeHtml(sp.cityName)} — ${escapeHtml(sp.name)}"
              >
                <span>🍲 ${escapeHtml(sp.name)}</span>
                <span class="rd-spec-city">${escapeHtml(sp.cityName)}</span>
              </button>
            `
          )
          .join('')
      : `<div class="rd-empty-state">Bu bölge için kayıtlı yöresel lezzet bulunamadı.</div>`;

    const provincesHtml = visibleProvinces.length
      ? visibleProvinces
          .map((p) => {
            const imgSrc = p.has_banner && p.banner_rel ? p.banner_rel : 'assets/banner.jpg';
            const landmarks = Array.isArray(p.landmarks) ? p.landmarks : [];
            const specialties = Array.isArray(p.specialties) ? p.specialties : [];
            const topLandmark = landmarks[0] || 'Keşfedilecek Duraklar';
            const extraLandmarks = landmarks.length > 1 ? ` +${landmarks.length - 1}` : '';
            const statusClass = p.visited ? 'visited' : 'pending';
            const statusText = p.visited ? '✓ Gezildi' : '○ Sırada';

            return `
              <article
                class="rd-city-card"
                role="button"
                tabindex="0"
                data-rd-city="${escapeHtml(p.key)}"
                aria-label="${escapeHtml(p.name)} (${padPlate(p.plate)}) - ${statusText}"
              >
                <div class="rd-city-media">
                  <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.name)}" loading="lazy" />
                  <span class="rd-plate-badge">${escapeHtml(padPlate(p.plate))}</span>
                  <span class="rd-status-badge ${statusClass}">${statusText}</span>
                  <div class="rd-city-name-overlay">${escapeHtml(p.name)}</div>
                </div>
                <div class="rd-city-body">
                  <div class="rd-city-landmark" title="${escapeHtml(topLandmark)}">
                    <span aria-hidden="true">🏛️</span>
                    <span class="rd-city-landmark-text">${escapeHtml(topLandmark)}${escapeHtml(extraLandmarks)}</span>
                  </div>
                  <div class="rd-city-meta-row">
                    <span>🍲 ${specialties.length} lezzet · 📷 2 foto</span>
                    <span class="rd-city-open-hint">Keşfet →</span>
                  </div>
                </div>
              </article>
            `;
          })
          .join('')
      : `<div class="rd-empty-state">Seçilen filtreye uygun il bulunamadı.</div>`;

    container.innerHTML = `
      <div class="rd-shell" style="--rd-accent: ${escapeHtml(active.color)};">
        <!-- Page Header -->
        <div class="rd-page-head">
          <div>
            <h2 class="rd-page-title">🌍 7 Bölge Derin Keşif Vitrini</h2>
            <p class="rd-page-sub">Anadolu'nun yedi coğrafi bölgesini fotoğraf mozaiği, miras envanteri ve yöresel lezzetleriyle derinlemesine keşfet.</p>
          </div>
          <div class="rd-overview-pill">
            <span>🇹🇷 Genel İlerleme:</span>
            <strong>${totalVisitedAll}/${totalCitiesAll} İl</strong>
            <span>·</span>
            <span>${completedRegions}/7 Tam Bölge</span>
          </div>
        </div>

        <!-- Top 7-Region Selector Tabs -->
        <nav class="rd-tabs-grid" aria-label="7 Coğrafi Bölge Seçici">
          ${tabsHtml}
        </nav>

        <!-- Magazine-Grade 4-Photo Mosaic Hero -->
        <section class="rd-hero" aria-label="${escapeHtml(active.name)} Özet Dosyası">
          <div class="rd-mosaic">
            ${mosaicHtml}
          </div>
          <div class="rd-hero-scrim"></div>
          <div class="rd-hero-content">
            <div class="rd-hero-top-row">
              <div class="rd-hero-identity">
                <div class="rd-hero-kicker">
                  <span>${escapeHtml(active.icon)}</span>
                  <span>Bölge Dosyası · ${escapeHtml(active.code.slice(0, 2))}/07</span>
                </div>
                <h3 class="rd-hero-title">
                  <span>${escapeHtml(active.name)}</span>
                </h3>
                <p class="rd-hero-desc">“${escapeHtml(active.desc)}”</p>
              </div>
              <button type="button" class="rd-cta-btn" data-rd-plan-route="${escapeHtml(active.code)}">
                <span>🧭 Bu Bölge İçin 2-Opt Rota Planla</span>
              </button>
            </div>

            <div class="rd-progress-wrap">
              <div class="rd-progress-meta">
                <span>
                  <strong>${active.visited} / ${active.total}</strong> il keşfedildi
                  <span style="opacity: 0.7;">(Kalan: ${active.remaining} il)</span>
                </span>
                <span class="rd-progress-status">
                  %${active.pct.toFixed(1)} · ${escapeHtml(getProgressLabel(active.pct, active.visited, active.total))}
                </span>
              </div>
              <div class="rd-progress-track" role="progressbar" aria-valuenow="${active.pct}" aria-valuemin="0" aria-valuemax="100">
                <div class="rd-progress-fill" style="width: ${Math.min(100, Math.max(0, active.pct))}%;"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Regional KPI Strip -->
        <section class="rd-kpi-strip" aria-label="Bölge İstatistikleri">
          <div class="rd-kpi-card">
            <span class="rd-kpi-icon" aria-hidden="true">🗺️</span>
            <span class="rd-kpi-value">${active.total}</span>
            <span class="rd-kpi-label">Toplam İl</span>
          </div>
          <div class="rd-kpi-card">
            <span class="rd-kpi-icon" aria-hidden="true">✅</span>
            <span class="rd-kpi-value">${active.visited}</span>
            <span class="rd-kpi-label">Gezilen İl</span>
          </div>
          <div class="rd-kpi-card">
            <span class="rd-kpi-icon" aria-hidden="true">🧭</span>
            <span class="rd-kpi-value">${active.remaining}</span>
            <span class="rd-kpi-label">Kalan İl</span>
          </div>
          <div class="rd-kpi-card">
            <span class="rd-kpi-icon" aria-hidden="true">🏛️</span>
            <span class="rd-kpi-value">${active.totalLandmarks}</span>
            <span class="rd-kpi-label">Miras & Durak</span>
          </div>
          <div class="rd-kpi-card">
            <span class="rd-kpi-icon" aria-hidden="true">🍲</span>
            <span class="rd-kpi-value">${active.totalSpecialties}</span>
            <span class="rd-kpi-label">Yöresel Lezzet</span>
          </div>
          <div class="rd-kpi-card">
            <span class="rd-kpi-icon" aria-hidden="true">📷</span>
            <span class="rd-kpi-value">${active.totalPhotos}</span>
            <span class="rd-kpi-label">Fotoğraf Arşivi</span>
          </div>
        </section>

        <!-- Regional Specialties Cloud -->
        <section class="rd-section" aria-label="Bölge Yöresel Lezzetleri">
          <div class="rd-section-head">
            <h4 class="rd-section-title">
              <span>🍽️</span>
              <span>${escapeHtml(active.short)} Yöresel Lezzet Bulutu</span>
            </h4>
            <span class="rd-section-badge">${active.totalSpecialties} Lezzet · Şehre gitmek için tıkla</span>
          </div>
          <div class="rd-spec-cloud">
            ${specialtiesHtml}
          </div>
          ${
            hiddenSpecCount > 0 || uiState.showAllSpecialties
              ? `<button type="button" class="rd-toggle-more-btn" data-rd-toggle-specs="1">
                  ${uiState.showAllSpecialties ? 'Daha Az Göster ▲' : `+${hiddenSpecCount} Lezzeti Daha Göster ▼`}
                 </button>`
              : ''
          }
        </section>

        <!-- Complete Province Grid -->
        <section class="rd-section" aria-label="${escapeHtml(active.name)} İlleri">
          <div class="rd-section-head">
            <h4 class="rd-section-title">
              <span>🏙️</span>
              <span>${escapeHtml(active.name)} İl Envanteri</span>
              <span class="rd-section-badge">${visibleProvinces.length} / ${active.total} İl</span>
            </h4>
            <div class="rd-controls">
              <button type="button" class="rd-filter-btn ${uiState.provinceFilter === 'all' ? 'active' : ''}" data-rd-filter="all">Tümü (${active.total})</button>
              <button type="button" class="rd-filter-btn ${uiState.provinceFilter === 'visited' ? 'active' : ''}" data-rd-filter="visited">Gezilen (${active.visited})</button>
              <button type="button" class="rd-filter-btn ${uiState.provinceFilter === 'remaining' ? 'active' : ''}" data-rd-filter="remaining">Kalan (${active.remaining})</button>
              <select class="rd-sort-select" data-rd-sort="1" aria-label="Sıralama">
                <option value="plate" ${uiState.provinceSort === 'plate' ? 'selected' : ''}>Plakaya Göre</option>
                <option value="name" ${uiState.provinceSort === 'name' ? 'selected' : ''}>İsme Göre (A-Z)</option>
                <option value="visited" ${uiState.provinceSort === 'visited' ? 'selected' : ''}>Önce Gezilenler</option>
              </select>
            </div>
          </div>

          <div class="rd-province-grid">
            ${provincesHtml}
          </div>
        </section>
      </div>
    `;

    const root = container.querySelector('.rd-shell');
    if (!root) return;

    // Event delegation on root (clean on each re-render)
    root.addEventListener('click', (e) => {
      const regionBtn = e.target.closest('[data-rd-region]');
      if (regionBtn) {
        const nextCode = regionBtn.getAttribute('data-rd-region');
        if (nextCode && nextCode !== uiState.activeRegion) {
          uiState.activeRegion = nextCode;
          uiState.provinceFilter = 'all';
          uiState.showAllSpecialties = false;
          render(container, safeCtx);
        }
        return;
      }

      const routeBtn = e.target.closest('[data-rd-plan-route]');
      if (routeBtn) {
        const code = routeBtn.getAttribute('data-rd-plan-route');
        state.routeRegion = code;
        state.routeMode = 'auto';
        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast(`🧭 ${active.name} için 2-Opt rota planlayıcı açılıyor...`);
        }
        openView('route');
        return;
      }

      const filterBtn = e.target.closest('[data-rd-filter]');
      if (filterBtn) {
        uiState.provinceFilter = filterBtn.getAttribute('data-rd-filter') || 'all';
        render(container, safeCtx);
        return;
      }

      const toggleSpecsBtn = e.target.closest('[data-rd-toggle-specs]');
      if (toggleSpecsBtn) {
        uiState.showAllSpecialties = !uiState.showAllSpecialties;
        render(container, safeCtx);
        return;
      }

      const cityTrigger = e.target.closest('[data-rd-city]');
      if (cityTrigger) {
        const cityKey = cityTrigger.getAttribute('data-rd-city');
        if (cityKey) selectCity(cityKey);
      }
    });

    root.addEventListener('change', (e) => {
      const sortEl = e.target.closest('[data-rd-sort]');
      if (sortEl) {
        uiState.provinceSort = sortEl.value || 'plate';
        render(container, safeCtx);
      }
    });

    root.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const cityCard = e.target.closest('.rd-city-card[data-rd-city]');
      if (cityCard) {
        e.preventDefault();
        const cityKey = cityCard.getAttribute('data-rd-city');
        if (cityKey) selectCity(cityKey);
      }
    });
  }

  window.SEYYAH_MODULES.regions = {
    render
  };
})();
