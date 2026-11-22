/**
 * Anadolu Seyahatnamesi — 📈 İleri Analitik & 81/81 Tahmin Stüdyosu
 * Zero-dependency Executive Analytics & Projection Studio with Pure Inline SVG Charts
 * Registers on window.SEYYAH_MODULES.deepStats = { render(container, ctx) }
 */
(function () {
  'use strict';

  const STYLE_ID = 'seyyah-deep-stats-styles';
  const TOOLTIP_ID = 'dsa-floating-tooltip';

  const DAYS_PER_PROVINCE = 5; // 5 Gün Kuralı
  const LIBRARY_HOURS_PER_DAY = 4; // Günde 4 saat kütüphane ofis mesaisi
  const STANDARD_HOTEL_NIGHTLY_TL = 2200; // GSB KYK (0 ₺) vs Standart Butik Otel (2.200 ₺/gece)
  const ROAD_FACTOR = 1.25;

  const TR_MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const REGION_ORDER = [
    '01_Marmara',
    '02_Ege',
    '03_Akdeniz',
    '04_IcAnadolu',
    '05_Karadeniz',
    '06_DoguAnadolu',
    '07_GuneydoguAnadolu'
  ];

  const REGION_SHORT_NAMES = {
    '01_Marmara': 'Marmara',
    '02_Ege': 'Ege',
    '03_Akdeniz': 'Akdeniz',
    '04_IcAnadolu': 'İç Anadolu',
    '05_Karadeniz': 'Karadeniz',
    '06_DoguAnadolu': 'Doğu Anadolu',
    '07_GuneydoguAnadolu': 'G.Doğu Anadolu'
  };

  const DEFAULT_EXPEDITION_CORRIDOR = [
    'Ankara', 'Çankırı', 'Kastamonu', 'Karabük', 'Bartın',
    'Zonguldak', 'Düzce', 'Sakarya', 'İstanbul', 'Edirne'
  ];

  // Geographic map projection bounds matching Turkey's 81 provinces
  const MAP_W = 1000;
  const MAP_H = 440;
  const MAP_PAD_X = 36;
  const MAP_PAD_Y = 28;
  const MAP_BOUNDS = {
    minLng: 25.5,
    maxLng: 45.0,
    minLat: 35.6,
    maxLat: 42.4
  };

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
    pace: 2, // 1..10 provinces/month, default 2
    mapFilter: 'all', // 'all' | 'visited' | 'unvisited' | 'corridor'
    activeRegionCode: null,
    showBenchmarkRing: true
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

  function defaultNormalizeTurkish(str) {
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

  function formatNumber(n) {
    if (typeof n !== 'number' || Number.isNaN(n)) return '0';
    return Math.round(n).toLocaleString('tr-TR');
  }

  function formatTL(n) {
    return formatNumber(n) + ' ₺';
  }

  function formatPlate(plate) {
    const num = Number(plate) || 0;
    return num < 10 ? '0' + num : String(num);
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

  function projectCoord(lat, lng) {
    const x = MAP_PAD_X + ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * (MAP_W - MAP_PAD_X * 2);
    const y = MAP_PAD_Y + ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * (MAP_H - MAP_PAD_Y * 2);
    return {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10
    };
  }

  function buildCoastPath(coords) {
    if (!coords || !coords.length) return '';
    return (
      coords
        .map((pt, idx) => {
          const p = projectCoord(pt[0], pt[1]);
          return (idx === 0 ? 'M' : 'L') + p.x + ',' + p.y;
        })
        .join(' ') + ' Z'
    );
  }

  function addMonthsTurkish(monthsToAdd) {
    const now = new Date();
    if (!monthsToAdd || monthsToAdd <= 0) {
      return {
        label: 'Tamamlandı! (81/81)',
        monthName: TR_MONTHS[now.getMonth()],
        year: now.getFullYear(),
        months: 0
      };
    }
    const target = new Date(now.getFullYear(), now.getMonth() + monthsToAdd, 1);
    const monthName = TR_MONTHS[target.getMonth()];
    const year = target.getFullYear();
    return {
      label: `${monthName} ${year}`,
      monthName,
      year,
      months: monthsToAdd
    };
  }

  function computeVelocityProjection(unvisitedCount, pacePerMonth, avgKmPerProvince) {
    const pace = Math.max(1, Math.min(4, Math.round(Number(pacePerMonth) || 2)));
    const remaining = Math.max(0, Number(unvisitedCount) || 0);
    const kmPerProv = Number.isFinite(avgKmPerProvince) && avgKmPerProvince > 50 ? avgKmPerProvince : 285;
    const remainingDays = remaining * DAYS_PER_PROVINCE;
    const estLibraryHours = remainingDays * LIBRARY_HOURS_PER_DAY;
    const kykSavingsTL = remainingDays * STANDARD_HOTEL_NIGHTLY_TL;
    const estRemainingKm = Math.round(remaining * kmPerProv);
    const monthlyKm = Math.round(pace * kmPerProv);
    const monthsNeeded = remaining > 0 ? Math.ceil(remaining / pace) : 0;
    const eta = addMonthsTurkish(monthsNeeded);
    const yearlyRate = pace * 12;

    return {
      pace,
      remaining,
      remainingDays,
      estLibraryHours,
      kykSavingsTL,
      estRemainingKm,
      monthlyKm,
      kmPerProv: Math.round(kmPerProv),
      monthsNeeded,
      etaLabel: eta.label,
      yearlyRate
    };
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .dsa-wrap {
        max-width: 1280px;
        margin: 0 auto;
        padding: 18px 18px 44px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        animation: dsaFadeIn 0.28s ease-out;
      }

      @keyframes dsaFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes dsaDashFlow {
        to { stroke-dashoffset: -28; }
      }

      .dsa-hero {
        position: relative;
        overflow: hidden;
        padding: 22px 24px;
        border-radius: var(--radius-lg, 20px);
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.78));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        box-shadow: var(--shadow-subtle, 0 12px 30px -8px rgba(0, 0, 0, 0.5));
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .dsa-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 88% 12%, rgba(0, 242, 254, 0.14), transparent 42%),
          radial-gradient(circle at 12% 88%, rgba(16, 185, 129, 0.12), transparent 44%);
        pointer-events: none;
      }

      .dsa-hero-top {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
      }

      .dsa-hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: 999px;
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.3);
        margin-bottom: 6px;
      }

      .dsa-hero-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.55rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.2;
      }

      .dsa-hero-sub {
        font-size: 0.88rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 4px;
      }

      .dsa-hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .dsa-nav-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-heading, sans-serif);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dsa-nav-pill:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.14);
        transform: translateY(-1px);
      }

      .dsa-kpi-strip {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .dsa-kpi-box {
        padding: 13px 15px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.58);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .dsa-kpi-label {
        font-size: 0.74rem;
        font-weight: 600;
        color: var(--text-muted, #64748b);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .dsa-kpi-val {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.38rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.15;
      }

      .dsa-kpi-sub {
        font-size: 0.75rem;
        color: var(--text-secondary, #94a3b8);
      }

      .dsa-kpi-bar {
        height: 5px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
        margin-top: 4px;
      }

      .dsa-kpi-bar-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent-emerald, #10b981), var(--accent-cyan, #00f2fe));
      }

      /* Main 2-column executive grids */
      .dsa-grid-2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
        align-items: stretch;
      }

      .dsa-card {
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-lg, 20px);
        padding: 20px 22px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.4));
      }

      .dsa-card-head {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
      }

      .dsa-card-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.06rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .dsa-card-sub {
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 2px;
      }

      .dsa-pill-toggle {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.74rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dsa-pill-toggle:hover,
      .dsa-pill-toggle.active {
        color: var(--accent-cyan, #00f2fe);
        border-color: rgba(0, 242, 254, 0.45);
        background: rgba(0, 242, 254, 0.12);
      }

      /* Radar Chart */
      .dsa-radar-stage {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .dsa-radar-svg {
        width: 100%;
        max-width: 470px;
        height: auto;
        overflow: visible;
      }

      .dsa-radar-ring {
        fill: none;
        stroke: rgba(148, 163, 184, 0.2);
        stroke-width: 1;
      }

      .dsa-radar-ring-outer {
        stroke: rgba(0, 242, 254, 0.28);
        stroke-width: 1.25;
      }

      .dsa-radar-spoke {
        stroke: rgba(148, 163, 184, 0.18);
        stroke-width: 1;
        stroke-dasharray: 3 3;
      }

      .dsa-radar-ring-label {
        font-size: 10px;
        font-weight: 600;
        fill: var(--text-muted, #64748b);
      }

      .dsa-radar-area {
        fill: url(#dsa-radar-grad);
        fill-opacity: 0.42;
        stroke: #00f2fe;
        stroke-width: 2.4;
        stroke-linejoin: round;
        transition: all 0.25s ease;
      }

      .dsa-radar-benchmark {
        fill: rgba(245, 158, 11, 0.06);
        stroke: #f59e0b;
        stroke-width: 1.5;
        stroke-dasharray: 5 4;
        pointer-events: none;
      }

      .dsa-radar-axis-group {
        cursor: pointer;
      }

      .dsa-radar-node {
        transition: r 0.18s ease, stroke-width 0.18s ease;
      }

      .dsa-radar-axis-group:hover .dsa-radar-node,
      .dsa-radar-axis-group:focus-visible .dsa-radar-node {
        r: 7.5;
        stroke-width: 3;
      }

      .dsa-radar-label-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 11.5px;
        font-weight: 700;
        fill: var(--text-primary, #f8fafc);
      }

      .dsa-radar-label-pct {
        font-family: var(--font-heading, sans-serif);
        font-size: 11px;
        font-weight: 800;
      }

      .dsa-radar-legend {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-top: 8px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      .dsa-legend-items {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
      }

      .dsa-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .dsa-swatch {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        display: inline-block;
      }

      /* Velocity Calculator */
      .dsa-slider-panel {
        padding: 16px 18px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.58);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 11px;
      }

      .dsa-slider-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .dsa-slider-question {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.94rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      .dsa-pace-badge {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.92rem;
        font-weight: 800;
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.14);
        border: 1px solid rgba(0, 242, 254, 0.35);
        padding: 4px 12px;
        border-radius: 999px;
        white-space: nowrap;
      }

      .dsa-range-input {
        width: 100%;
        height: 7px;
        border-radius: 999px;
        accent-color: var(--accent-cyan, #00f2fe);
        cursor: pointer;
      }

      .dsa-range-scale {
        display: flex;
        justify-content: space-between;
        font-size: 0.7rem;
        color: var(--text-muted, #64748b);
        font-weight: 600;
      }

      .dsa-pace-presets {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .dsa-preset-chip {
        padding: 5px 10px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(30, 41, 59, 0.6);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.74rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .dsa-preset-chip:hover,
      .dsa-preset-chip.active {
        color: var(--accent-emerald, #10b981);
        border-color: rgba(16, 185, 129, 0.45);
        background: rgba(16, 185, 129, 0.15);
      }

      .dsa-eta-banner {
        padding: 15px 18px;
        border-radius: var(--radius-md, 12px);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(0, 242, 254, 0.12));
        border: 1px solid rgba(16, 185, 129, 0.38);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .dsa-eta-kicker {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6ee7b7;
      }

      .dsa-eta-date {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.65rem;
        font-weight: 900;
        color: #ffffff;
        line-height: 1.15;
      }

      .dsa-eta-meta {
        font-size: 0.78rem;
        color: #d1fae5;
        text-align: right;
      }

      .dsa-calc-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .dsa-calc-stat {
        padding: 12px 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.52);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .dsa-calc-stat-label {
        font-size: 0.74rem;
        color: var(--text-muted, #64748b);
        font-weight: 600;
      }

      .dsa-calc-stat-val {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.24rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .dsa-calc-stat-hint {
        font-size: 0.71rem;
        color: var(--text-secondary, #94a3b8);
      }

      .dsa-milestones-mini {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }

      .dsa-mini-step {
        padding: 9px 10px;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.07));
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .dsa-mini-step.done {
        border-color: rgba(16, 185, 129, 0.35);
        background: rgba(16, 185, 129, 0.1);
      }

      .dsa-mini-step-title {
        font-size: 0.71rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
      }

      .dsa-mini-step-eta {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.84rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      /* Geo-Scatter Mini-Map */
      .dsa-map-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .dsa-map-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .dsa-map-stage {
        position: relative;
        width: 100%;
        border-radius: var(--radius-md, 12px);
        background: radial-gradient(circle at 50% 45%, rgba(15, 23, 42, 0.85), rgba(10, 15, 29, 0.96));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        padding: 10px;
        overflow: hidden;
      }

      .dsa-map-svg {
        width: 100%;
        height: auto;
        display: block;
      }

      .dsa-coast-path {
        fill: rgba(30, 41, 59, 0.55);
        stroke: rgba(148, 163, 184, 0.25);
        stroke-width: 1.4;
        stroke-linejoin: round;
      }

      .dsa-lake-path {
        fill: rgba(0, 242, 254, 0.1);
        stroke: rgba(0, 242, 254, 0.28);
        stroke-width: 1;
      }

      .dsa-graticule {
        stroke: rgba(148, 163, 184, 0.1);
        stroke-width: 0.8;
        stroke-dasharray: 3 4;
      }

      .dsa-graticule-label {
        font-size: 9px;
        fill: rgba(148, 163, 184, 0.45);
        font-weight: 600;
      }

      .dsa-corridor-glow {
        fill: none;
        stroke: rgba(245, 158, 11, 0.28);
        stroke-width: 7;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .dsa-corridor-line {
        fill: none;
        stroke: url(#dsa-corridor-grad);
        stroke-width: 2.8;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: 9 5;
        animation: dsaDashFlow 1.4s linear infinite;
      }

      .dsa-city-dot-group {
        cursor: pointer;
        transition: opacity 0.2s ease;
      }

      .dsa-city-dot-group.is-dimmed {
        opacity: 0.16;
      }

      .dsa-city-dot {
        transition: r 0.18s ease, stroke-width 0.18s ease;
      }

      .dsa-city-dot-group:hover .dsa-city-dot,
      .dsa-city-dot-group:focus-visible .dsa-city-dot {
        r: 8;
        stroke-width: 2.6;
      }

      .dsa-corridor-strip {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        padding: 10px 12px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .dsa-corridor-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(30, 41, 59, 0.7);
        color: var(--text-primary, #f8fafc);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .dsa-corridor-chip.visited {
        border-color: rgba(16, 185, 129, 0.45);
        background: rgba(16, 185, 129, 0.14);
      }

      .dsa-corridor-chip.unvisited {
        border-color: rgba(245, 158, 11, 0.42);
        background: rgba(245, 158, 11, 0.1);
      }

      .dsa-corridor-chip:hover {
        transform: translateY(-1px);
        border-color: var(--accent-cyan, #00f2fe);
      }

      .dsa-corridor-arrow {
        color: var(--text-muted, #64748b);
        font-size: 0.72rem;
      }

      /* Milestones & Region Leaderboard */
      .dsa-milestone-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .dsa-milestone-item {
        padding: 11px 13px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .dsa-milestone-item.unlocked {
        border-color: rgba(16, 185, 129, 0.35);
        background: rgba(16, 185, 129, 0.08);
      }

      .dsa-milestone-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .dsa-milestone-name {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .dsa-milestone-status {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 2px 9px;
        border-radius: 999px;
        white-space: nowrap;
      }

      .dsa-milestone-status.done {
        background: rgba(16, 185, 129, 0.2);
        color: #6ee7b7;
        border: 1px solid rgba(16, 185, 129, 0.4);
      }

      .dsa-milestone-status.pending {
        background: rgba(0, 242, 254, 0.12);
        color: var(--accent-cyan, #00f2fe);
        border: 1px solid rgba(0, 242, 254, 0.3);
      }

      .dsa-milestone-desc {
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      .dsa-progress-track {
        height: 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
      }

      .dsa-progress-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.3s ease;
      }

      .dsa-jump-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 2px;
      }

      .dsa-jump-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid rgba(0, 242, 254, 0.3);
        background: rgba(0, 242, 254, 0.08);
        color: var(--accent-cyan, #00f2fe);
        font-size: 0.73rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .dsa-jump-btn:hover {
        background: rgba(0, 242, 254, 0.2);
        transform: translateY(-1px);
      }

      /* Region Leaderboard Table */
      .dsa-table-wrap {
        width: 100%;
        overflow-x: auto;
      }

      .dsa-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.82rem;
      }

      .dsa-table th {
        text-align: left;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted, #64748b);
        padding: 8px 10px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .dsa-table td {
        padding: 10px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.06));
        color: var(--text-primary, #f8fafc);
        vertical-align: middle;
      }

      .dsa-region-row {
        cursor: pointer;
        transition: background 0.18s ease;
      }

      .dsa-region-row:hover,
      .dsa-region-row.active {
        background: rgba(0, 242, 254, 0.08);
      }

      .dsa-rank-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 999px;
        font-family: var(--font-heading, sans-serif);
        font-size: 0.75rem;
        font-weight: 800;
        background: rgba(148, 163, 184, 0.14);
        color: var(--text-secondary, #94a3b8);
      }

      .dsa-rank-badge.top-1 {
        background: rgba(245, 158, 11, 0.22);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.45);
      }

      .dsa-rank-badge.top-2 {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.4);
      }

      .dsa-rank-badge.top-3 {
        background: rgba(56, 189, 248, 0.2);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.4);
      }

      .dsa-table-bar-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 110px;
      }

      .dsa-table-bar {
        flex: 1;
        height: 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
      }

      .dsa-region-drawer {
        padding: 12px 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.56);
        border: 1px solid rgba(0, 242, 254, 0.26);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .dsa-region-drawer-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .dsa-province-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .dsa-province-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.74rem;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(30, 41, 59, 0.72);
        color: var(--text-primary, #f8fafc);
        transition: all 0.18s ease;
      }

      .dsa-province-chip.visited {
        border-color: rgba(16, 185, 129, 0.45);
        background: rgba(16, 185, 129, 0.14);
      }

      .dsa-province-chip.unvisited {
        border-color: rgba(56, 189, 248, 0.35);
        background: rgba(56, 189, 248, 0.08);
      }

      .dsa-province-chip:hover {
        border-color: var(--accent-cyan, #00f2fe);
        transform: translateY(-1px);
      }

      /* Floating Tooltip */
      .dsa-tooltip {
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 0.14s ease, transform 0.14s ease;
        min-width: 190px;
        max-width: 280px;
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.96);
        border: 1px solid rgba(0, 242, 254, 0.38);
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.55);
        color: #f8fafc;
        font-size: 0.78rem;
        line-height: 1.45;
        backdrop-filter: blur(12px);
      }

      .dsa-tooltip.is-visible {
        opacity: 1;
        transform: translateY(0);
      }

      .dsa-tooltip-head {
        font-family: var(--font-heading, sans-serif);
        font-weight: 800;
        font-size: 0.86rem;
        margin-bottom: 3px;
        color: #ffffff;
      }

      .dsa-tooltip-sub {
        font-size: 0.76rem;
        color: #cbd5e1;
      }

      .dsa-tooltip-meta {
        margin-top: 4px;
        font-size: 0.72rem;
        color: #94a3b8;
      }

      /* Light Theme Compatibility */
      body.light-theme .dsa-hero {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(241, 245, 249, 0.92));
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 10px 26px -6px rgba(15, 23, 42, 0.1);
      }

      body.light-theme .dsa-kpi-box,
      body.light-theme .dsa-slider-panel,
      body.light-theme .dsa-calc-stat,
      body.light-theme .dsa-mini-step,
      body.light-theme .dsa-milestone-item,
      body.light-theme .dsa-corridor-strip,
      body.light-theme .dsa-region-drawer {
        background: rgba(241, 245, 249, 0.88);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .dsa-mini-step.done,
      body.light-theme .dsa-milestone-item.unlocked {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(5, 150, 105, 0.35);
      }

      body.light-theme .dsa-nav-pill,
      body.light-theme .dsa-pill-toggle,
      body.light-theme .dsa-preset-chip,
      body.light-theme .dsa-corridor-chip,
      body.light-theme .dsa-province-chip {
        background: rgba(255, 255, 255, 0.9);
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .dsa-pill-toggle.active {
        background: rgba(2, 132, 199, 0.12);
        color: #0284c7;
        border-color: rgba(2, 132, 199, 0.45);
      }

      body.light-theme .dsa-eta-banner {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(2, 132, 199, 0.1));
        border-color: rgba(5, 150, 105, 0.38);
      }

      body.light-theme .dsa-eta-kicker {
        color: #047857;
      }

      body.light-theme .dsa-eta-date {
        color: #064e3b;
      }

      body.light-theme .dsa-eta-meta {
        color: #065f46;
      }

      body.light-theme .dsa-map-stage {
        background: radial-gradient(circle at 50% 45%, #f8fafc, #e2e8f0);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .dsa-coast-path {
        fill: rgba(255, 255, 255, 0.92);
        stroke: rgba(100, 116, 139, 0.45);
      }

      body.light-theme .dsa-lake-path {
        fill: rgba(2, 132, 199, 0.14);
        stroke: rgba(2, 132, 199, 0.35);
      }

      body.light-theme .dsa-graticule {
        stroke: rgba(100, 116, 139, 0.18);
      }

      body.light-theme .dsa-graticule-label {
        fill: rgba(71, 85, 105, 0.65);
      }

      body.light-theme .dsa-radar-ring {
        stroke: rgba(100, 116, 139, 0.25);
      }

      body.light-theme .dsa-radar-ring-outer {
        stroke: rgba(2, 132, 199, 0.35);
      }

      body.light-theme .dsa-radar-area {
        stroke: #0284c7;
      }

      body.light-theme .dsa-kpi-bar,
      body.light-theme .dsa-progress-track,
      body.light-theme .dsa-table-bar {
        background: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .dsa-milestone-status.done {
        color: #047857;
        background: rgba(16, 185, 129, 0.16);
      }

      body.light-theme .dsa-milestone-status.pending,
      body.light-theme .dsa-jump-btn {
        color: #0284c7;
      }

      body.light-theme .dsa-tooltip {
        background: rgba(255, 255, 255, 0.97);
        color: #0f172a;
        border-color: rgba(2, 132, 199, 0.4);
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
      }

      body.light-theme .dsa-tooltip-head {
        color: #0f172a;
      }

      body.light-theme .dsa-tooltip-sub {
        color: #334155;
      }

      body.light-theme .dsa-tooltip-meta {
        color: #64748b;
      }

      @media (max-width: 1024px) {
        .dsa-grid-2 {
          grid-template-columns: 1fr;
        }
        .dsa-kpi-strip {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 600px) {
        .dsa-wrap {
          padding: 12px 10px 32px;
        }
        .dsa-kpi-strip,
        .dsa-calc-grid,
        .dsa-milestones-mini {
          grid-template-columns: 1fr;
        }
        .dsa-eta-meta {
          text-align: left;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureTooltip() {
    let el = document.getElementById(TOOLTIP_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = TOOLTIP_ID;
      el.className = 'dsa-tooltip';
      el.setAttribute('role', 'tooltip');
      document.body.appendChild(el);
    }
    return el;
  }

  function positionTooltip(tooltipEl, clientX, clientY) {
    const pad = 14;
    const rect = tooltipEl.getBoundingClientRect();
    let x = clientX + pad;
    let y = clientY - rect.height - pad;
    if (x + rect.width > window.innerWidth - 10) {
      x = Math.max(10, clientX - rect.width - pad);
    }
    if (y < 10) {
      y = clientY + pad;
    }
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = y + 'px';
  }

  function buildRegionsData(data, provincesList) {
    const breakdown = (data && data.stats && data.stats.regional_breakdown) || {};
    const regionMeta = (data && data.regions) || {};

    const grouped = {};
    provincesList.forEach((p) => {
      const code = p.region_code || 'Diger';
      if (!grouped[code]) grouped[code] = [];
      grouped[code].push(p);
    });

    const codes = REGION_ORDER.filter((c) => breakdown[c] || regionMeta[c] || grouped[c]);
    Object.keys(breakdown).forEach((c) => {
      if (!codes.includes(c)) codes.push(c);
    });

    return codes.map((code) => {
      const rb = breakdown[code] || {};
      const meta = regionMeta[code] || {};
      const list = (grouped[code] || []).slice().sort((a, b) => a.plate - b.plate);
      const total = typeof rb.total === 'number' ? rb.total : list.length;
      const visited = typeof rb.visited === 'number' ? rb.visited : list.filter((p) => p.visited).length;
      const remaining = Math.max(0, total - visited);
      const percentage =
        typeof rb.percentage === 'number'
          ? rb.percentage
          : total > 0
            ? Number(((visited / total) * 100).toFixed(1))
            : 0;

      const nextTarget = list.find((p) => !p.visited) || list[0] || null;

      return {
        code,
        name: rb.name || meta.name || code,
        shortName: REGION_SHORT_NAMES[code] || (rb.name || meta.name || code).replace(' Bölgesi', ''),
        icon: rb.icon || meta.icon || '📍',
        color: rb.color || meta.color || '#00f2fe',
        desc: rb.desc || meta.desc || '',
        total,
        visited,
        remaining,
        percentage,
        provinces: list,
        nextTarget
      };
    });
  }

  function resolveExpeditionCorridor(data, state, provincesList, normalizeTurkish) {
    const rawNames =
      (data && Array.isArray(data.custom_route) && data.custom_route.length && data.custom_route) ||
      (state && Array.isArray(state.customRouteCities) && state.customRouteCities.length && state.customRouteCities) ||
      DEFAULT_EXPEDITION_CORRIDOR;

    const byNormName = {};
    provincesList.forEach((p) => {
      byNormName[normalizeTurkish(p.name)] = p;
    });

    const stops = [];
    rawNames.forEach((name, idx) => {
      const match = byNormName[normalizeTurkish(name)];
      if (match) {
        stops.push({
          ...match,
          corridorOrder: idx + 1
        });
      }
    });

    let totalRoadKm = 0;
    for (let i = 1; i < stops.length; i++) {
      totalRoadKm += haversineKm(stops[i - 1].lat, stops[i - 1].lng, stops[i].lat, stops[i].lng) * ROAD_FACTOR;
    }

    return {
      stops,
      totalRoadKm: Math.round(totalRoadKm),
      visitedStops: stops.filter((s) => s.visited).length,
      remainingStops: stops.filter((s) => !s.visited).length
    };
  }

  function buildRadarSvg(regions, avgPct, showBenchmark, escapeHtml) {
    const cx = 230;
    const cy = 200;
    const maxR = 128;
    const levels = [20, 40, 60, 80, 100];
    const count = regions.length || 7;

    function getPoint(index, pct, radiusScale) {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
      const r = (Math.max(0, Math.min(100, pct)) / 100) * maxR * (radiusScale || 1);
      return {
        x: Math.round((cx + Math.cos(angle) * r) * 10) / 10,
        y: Math.round((cy + Math.sin(angle) * r) * 10) / 10,
        angle
      };
    }

    const ringsHtml = levels
      .map((lvl) => {
        const pts = regions
          .map((_, i) => {
            const p = getPoint(i, lvl);
            return `${p.x},${p.y}`;
          })
          .join(' ');
        const isOuter = lvl === 100;
        const labelPt = getPoint(0, lvl);
        return `
          <polygon class="dsa-radar-ring ${isOuter ? 'dsa-radar-ring-outer' : ''}" points="${pts}" />
          <text class="dsa-radar-ring-label" x="${labelPt.x + 5}" y="${labelPt.y + 3}">%${lvl}</text>
        `;
      })
      .join('');

    const spokesHtml = regions
      .map((_, i) => {
        const outer = getPoint(i, 100);
        return `<line class="dsa-radar-spoke" x1="${cx}" y1="${cy}" x2="${outer.x}" y2="${outer.y}" />`;
      })
      .join('');

    const dataPts = regions.map((r, i) => getPoint(i, r.percentage));
    const dataPolygonPoints = dataPts.map((p) => `${p.x},${p.y}`).join(' ');

    const benchmarkPts = regions.map((_, i) => getPoint(i, avgPct));
    const benchmarkPolygonPoints = benchmarkPts.map((p) => `${p.x},${p.y}`).join(' ');

    const nodesAndLabelsHtml = regions
      .map((r, i) => {
        const pt = dataPts[i];
        const labelPt = getPoint(i, 100, 1.24);
        const cos = Math.cos(pt.angle);
        let anchor = 'middle';
        if (cos > 0.28) anchor = 'start';
        else if (cos < -0.28) anchor = 'end';

        const sin = Math.sin(pt.angle);
        const yOffset = sin < -0.6 ? -6 : sin > 0.6 ? 12 : 4;

        return `
          <g class="dsa-radar-axis-group"
             tabindex="0"
             role="button"
             aria-label="${escapeHtml(r.name)}: %${r.percentage} (${r.visited}/${r.total})"
             data-region-code="${escapeHtml(r.code)}"
             data-region-name="${escapeHtml(r.name)}"
             data-region-icon="${escapeHtml(r.icon)}"
             data-region-pct="${r.percentage}"
             data-region-visited="${r.visited}"
             data-region-total="${r.total}"
             data-region-remaining="${r.remaining}"
             data-region-color="${escapeHtml(r.color)}">
            <circle cx="${pt.x}" cy="${pt.y}" r="16" fill="transparent" />
            <circle class="dsa-radar-node"
              cx="${pt.x}" cy="${pt.y}" r="5.5"
              fill="${escapeHtml(r.color)}"
              stroke="#0f172a"
              stroke-width="2" />
            <text class="dsa-radar-label-title"
              x="${labelPt.x}" y="${labelPt.y + yOffset - 4}"
              text-anchor="${anchor}">
              ${escapeHtml(r.icon)} ${escapeHtml(r.shortName)}
            </text>
            <text class="dsa-radar-label-pct"
              x="${labelPt.x}" y="${labelPt.y + yOffset + 11}"
              text-anchor="${anchor}"
              fill="${escapeHtml(r.color)}">
              %${r.percentage} (${r.visited}/${r.total})
            </text>
          </g>
        `;
      })
      .join('');

    return `
      <svg class="dsa-radar-svg" viewBox="0 0 460 400" role="img" aria-label="7 Bölge Tamamlama Radar Grafiği">
        <defs>
          <linearGradient id="dsa-radar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00f2fe" />
            <stop offset="55%" stop-color="#10b981" />
            <stop offset="100%" stop-color="#a855f7" />
          </linearGradient>
        </defs>
        ${ringsHtml}
        ${spokesHtml}
        ${showBenchmark ? `<polygon class="dsa-radar-benchmark" points="${benchmarkPolygonPoints}" />` : ''}
        <polygon class="dsa-radar-area" points="${dataPolygonPoints}" />
        <circle cx="${cx}" cy="${cy}" r="3" fill="#94a3b8" />
        ${nodesAndLabelsHtml}
      </svg>
    `;
  }

  function buildGeoScatterSvg(provincesList, corridor, mapFilter, escapeHtml) {
    const thracePath = buildCoastPath(THRACE_COAST);
    const anatoliaPath = buildCoastPath(ANATOLIA_COAST);
    const vanPath = buildCoastPath(LAKE_VAN);
    const tuzPath = buildCoastPath(LAKE_TUZ);

    const corridorMap = {};
    corridor.stops.forEach((s) => {
      corridorMap[s.key] = s.corridorOrder;
    });

    // Lat/Lng graticule
    const lngLines = [26, 30, 34, 38, 42, 44].map((lng) => {
      const pTop = projectCoord(MAP_BOUNDS.maxLat, lng);
      const pBot = projectCoord(MAP_BOUNDS.minLat, lng);
      return `
        <line class="dsa-graticule" x1="${pTop.x}" y1="${pTop.y}" x2="${pBot.x}" y2="${pBot.y}" />
        <text class="dsa-graticule-label" x="${pTop.x + 3}" y="${pBot.y - 4}">${lng}°E</text>
      `;
    }).join('');

    const latLines = [36, 38, 40, 42].map((lat) => {
      const pLeft = projectCoord(lat, MAP_BOUNDS.minLng);
      const pRight = projectCoord(lat, MAP_BOUNDS.maxLng);
      return `
        <line class="dsa-graticule" x1="${pLeft.x}" y1="${pLeft.y}" x2="${pRight.x}" y2="${pRight.y}" />
        <text class="dsa-graticule-label" x="${pLeft.x + 2}" y="${pLeft.y - 4}">${lat}°N</text>
      `;
    }).join('');

    // Corridor polyline
    const corridorPts = corridor.stops.map((s) => projectCoord(s.lat, s.lng));
    const corridorPolyline = corridorPts.map((p) => `${p.x},${p.y}`).join(' ');
    const showCorridor = mapFilter === 'all' || mapFilter === 'corridor';

    const startStop = corridor.stops[0];
    const endStop = corridor.stops[corridor.stops.length - 1];
    const startPt = startStop ? projectCoord(startStop.lat, startStop.lng) : null;
    const endPt = endStop ? projectCoord(endStop.lat, endStop.lng) : null;

    const dotsHtml = provincesList
      .filter((p) => typeof p.lat === 'number' && !Number.isNaN(p.lat) && typeof p.lng === 'number' && !Number.isNaN(p.lng))
      .map((p) => {
        const pt = projectCoord(p.lat, p.lng);
        const corridorOrder = corridorMap[p.key] || 0;
        const isCorridor = corridorOrder > 0;

        let dimmed = false;
        if (mapFilter === 'visited' && !p.visited) dimmed = true;
        else if (mapFilter === 'unvisited' && p.visited) dimmed = true;
        else if (mapFilter === 'corridor' && !isCorridor) dimmed = true;

        const fillColor = p.visited ? '#10b981' : 'rgba(56, 189, 248, 0.36)';
        const strokeColor = isCorridor
          ? '#f59e0b'
          : p.visited
            ? '#a7f3d0'
            : 'rgba(56, 189, 248, 0.72)';
        const radius = isCorridor ? 6.2 : p.visited ? 5.2 : 4.4;

        return `
          <g class="dsa-city-dot-group ${dimmed ? 'is-dimmed' : ''}"
             tabindex="0"
             role="button"
             aria-label="${escapeHtml(formatPlate(p.plate) + ' ' + p.name)}"
             data-city-key="${escapeHtml(p.key)}"
             data-plate="${escapeHtml(formatPlate(p.plate))}"
             data-name="${escapeHtml(p.name)}"
             data-region="${escapeHtml(p.region)}"
             data-visited="${p.visited ? '1' : '0'}"
             data-lat="${p.lat.toFixed(2)}"
             data-lng="${p.lng.toFixed(2)}"
             data-corridor-order="${corridorOrder}">
            <circle cx="${pt.x}" cy="${pt.y}" r="11" fill="transparent" />
            ${isCorridor && showCorridor ? `<circle cx="${pt.x}" cy="${pt.y}" r="9.5" fill="rgba(245, 158, 11, 0.16)" stroke="rgba(245, 158, 11, 0.5)" stroke-width="1" />` : ''}
            <circle class="dsa-city-dot"
              cx="${pt.x}" cy="${pt.y}" r="${radius}"
              fill="${fillColor}"
              stroke="${strokeColor}"
              stroke-width="${isCorridor ? 2.1 : 1.4}"
              ${p.visited ? 'filter="url(#dsa-map-glow)"' : ''} />
            ${isCorridor && showCorridor ? `<text x="${pt.x}" y="${pt.y - 11}" text-anchor="middle" font-size="9.5" font-weight="800" fill="#fbbf24">${corridorOrder}</text>` : ''}
          </g>
        `;
      })
      .join('');

    const corridorBadgesHtml =
      showCorridor && startPt && endPt
        ? `
          <g pointer-events="none">
            <rect x="${startPt.x - 38}" y="${startPt.y + 12}" width="76" height="17" rx="8.5" fill="rgba(15,23,42,0.88)" stroke="#f59e0b" stroke-width="1" />
            <text x="${startPt.x}" y="${startPt.y + 23.5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fde68a">🚩 ${escapeHtml(startStop.name)}</text>
            <rect x="${endPt.x - 34}" y="${endPt.y - 31}" width="68" height="17" rx="8.5" fill="rgba(15,23,42,0.88)" stroke="#00f2fe" stroke-width="1" />
            <text x="${endPt.x}" y="${endPt.y - 19.5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#a5f3fc">🏁 ${escapeHtml(endStop.name)}</text>
          </g>
        `
        : '';

    return `
      <svg class="dsa-map-svg" viewBox="0 0 ${MAP_W} ${MAP_H}" role="img" aria-label="81 İl Geo-Scatter Mini Haritası ve Ankara-Edirne Sefer Koridoru">
        <defs>
          <linearGradient id="dsa-corridor-grad" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#f59e0b" />
            <stop offset="50%" stop-color="#fbbf24" />
            <stop offset="100%" stop-color="#00f2fe" />
          </linearGradient>
          <filter id="dsa-map-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        ${lngLines}
        ${latLines}

        <path class="dsa-coast-path" d="${thracePath}" />
        <path class="dsa-coast-path" d="${anatoliaPath}" />
        <path class="dsa-lake-path" d="${vanPath}" />
        <path class="dsa-lake-path" d="${tuzPath}" />

        ${showCorridor && corridorPts.length > 1 ? `
          <polyline class="dsa-corridor-glow" points="${corridorPolyline}" />
          <polyline class="dsa-corridor-line" points="${corridorPolyline}" />
        ` : ''}

        ${dotsHtml}
        ${corridorBadgesHtml}
      </svg>
    `;
  }

  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const safeCtx = ctx || {};
    const escapeHtml = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : defaultEscapeHtml;
    const normalizeTurkish = typeof safeCtx.normalizeTurkish === 'function' ? safeCtx.normalizeTurkish : defaultNormalizeTurkish;
    const state = safeCtx.state || {};
    const data = safeCtx.data || state.data || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const selectCity = typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};
    const openView = typeof safeCtx.openView === 'function' ? safeCtx.openView : function () {};
    const showToast = typeof safeCtx.showToast === 'function' ? safeCtx.showToast : function () {};

    if (!data || !data.provinces) {
      container.innerHTML = `
        <div class="dsa-wrap">
          <div class="dsa-card" style="text-align:center; max-width:560px; margin:32px auto;">
            <h3 style="color: var(--accent-gold, #f59e0b);">İleri Analitik Verisi Bulunamadı</h3>
            <p style="color: var(--text-secondary, #94a3b8); font-size:0.9rem;">
              Şehir ve bölge verileri henüz yüklenmedi. Lütfen <code>web_data.js</code> dosyasının yüklendiğinden emin olun.
            </p>
          </div>
        </div>
      `;
      return;
    }

    const provincesList = Object.entries(data.provinces)
      .map(([key, p]) => ({
        key,
        plate: Number(p.plate) || 0,
        name: p.name || key,
        region: p.region || '',
        region_code: p.region_code || '',
        lat: typeof p.lat === 'number' ? p.lat : Number(p.lat),
        lng: typeof p.lng === 'number' ? p.lng : Number(p.lng),
        visited: Boolean(p.visited),
        landmarks: Array.isArray(p.landmarks) ? p.landmarks : [],
        specialties: Array.isArray(p.specialties) ? p.specialties : []
      }))
      .sort((a, b) => a.plate - b.plate);

    const stats = data.stats || {};
    const totalCities = Number(stats.total_cities) || provincesList.length || 81;
    const visitedList = provincesList.filter((p) => p.visited);
    const unvisitedList = provincesList.filter((p) => !p.visited);
    const visitedCount = typeof stats.visited_cities === 'number' ? stats.visited_cities : visitedList.length;
    const unvisitedCount = typeof stats.unvisited_cities === 'number' ? stats.unvisited_cities : Math.max(0, totalCities - visitedCount);
    const progressPct =
      typeof stats.progress_pct === 'number'
        ? stats.progress_pct
        : totalCities > 0
          ? Number(((visitedCount / totalCities) * 100).toFixed(1))
          : 0;

    const daysOnRoad = typeof stats.days_on_road === 'number' ? stats.days_on_road : visitedCount * DAYS_PER_PROVINCE;
    const libraryHours = typeof stats.library_hours === 'number' ? stats.library_hours : daysOnRoad * LIBRARY_HOURS_PER_DAY;
    const estimatedKm = typeof stats.estimated_km === 'number' ? stats.estimated_km : 0;

    const regions = buildRegionsData(data, provincesList);
    const visitedRegionsCount =
      typeof stats.visited_regions === 'number'
        ? stats.visited_regions
        : regions.filter((r) => r.visited > 0).length;
    const totalRegionsCount = Number(stats.total_regions) || regions.length || 7;

    const sortedRegions = regions
      .slice()
      .sort((a, b) => b.percentage - a.percentage || b.visited - a.visited || a.name.localeCompare(b.name, 'tr'));

    if (!uiState.activeRegionCode || !regions.some((r) => r.code === uiState.activeRegionCode)) {
      uiState.activeRegionCode = sortedRegions[0] ? sortedRegions[0].code : null;
    }

    const corridor = resolveExpeditionCorridor(data, state, provincesList, normalizeTurkish);
    const avgKmPerProvince = visitedCount > 0 && estimatedKm > 0 ? Math.round(estimatedKm / visitedCount) : 285;
    const proj = computeVelocityProjection(unvisitedCount, uiState.pace, avgKmPerProvince);

    const achievements = data.achievements || {};
    const nextRank = achievements.next_rank || null;
    const currentRank = achievements.rank || null;
    const badges = Array.isArray(achievements.badges) ? achievements.badges : [];

    // Suggested jump provinces for milestones
    const nextCorridorStop = corridor.stops.find((s) => !s.visited) || corridor.stops[corridor.stops.length - 1] || null;
    const guneydoguRegion = regions.find((r) => r.code === '07_GuneydoguAnadolu');
    const guneydoguNext = guneydoguRegion && guneydoguRegion.nextTarget ? guneydoguRegion.nextTarget : null;
    const nearestUnvisited = unvisitedList.slice(0, 3);

    // Helper for milestone ETA dates at current pace
    function calcMilestoneEtaText(targetCount) {
      if (visitedCount >= targetCount) return '✅ Ulaşıldı';
      const needed = targetCount - visitedCount;
      const m = Math.ceil(needed / uiState.pace);
      return addMonthsTurkish(m).label;
    }

    const radarSvgHtml = buildRadarSvg(regions, progressPct, uiState.showBenchmarkRing, escapeHtml);
    const geoSvgHtml = buildGeoScatterSvg(provincesList, corridor, uiState.mapFilter, escapeHtml);

    const activeRegionObj = regions.find((r) => r.code === uiState.activeRegionCode) || sortedRegions[0];

    function buildMilestonesHtml() {
      const items = badges.map((b) => {
        const current = typeof b.current === 'number' ? b.current : 0;
        const target = typeof b.target === 'number' && b.target > 0 ? b.target : 1;
        const pct = Math.min(100, Math.round((current / target) * 100));
        const unlocked = Boolean(b.unlocked) || current >= target;

        let jumpHtml = '';
        if (!unlocked) {
          if (b.id === 'seven_regions' && guneydoguNext) {
            jumpHtml = `
              <div class="dsa-jump-row">
                <button type="button" class="dsa-jump-btn" data-jump-city="${escapeHtml(guneydoguNext.key)}">
                  🏜️ İlk Adım: ${escapeHtml(guneydoguNext.name)} (${formatPlate(guneydoguNext.plate)}) ➔
                </button>
              </div>
            `;
          } else if (b.id === 'halfway_anatolia' && nearestUnvisited.length) {
            jumpHtml = `
              <div class="dsa-jump-row">
                ${nearestUnvisited.slice(0, 2).map((c) => `
                  <button type="button" class="dsa-jump-btn" data-jump-city="${escapeHtml(c.key)}">
                    📍 ${escapeHtml(c.name)} (${formatPlate(c.plate)}) ➔
                  </button>
                `).join('')}
              </div>
            `;
          }
        }

        return `
          <div class="dsa-milestone-item ${unlocked ? 'unlocked' : ''}">
            <div class="dsa-milestone-top">
              <div class="dsa-milestone-name">
                <span>${escapeHtml(b.icon || '🏅')}</span>
                <span>${escapeHtml(b.title || '')}</span>
              </div>
              <span class="dsa-milestone-status ${unlocked ? 'done' : 'pending'}">
                ${unlocked ? '✅ Açıldı' : `${current} / ${target}`}
              </span>
            </div>
            <div class="dsa-milestone-desc">${escapeHtml(b.desc || '')}</div>
            <div class="dsa-progress-track">
              <div class="dsa-progress-fill" style="width:${pct}%; background:${unlocked ? '#10b981' : 'linear-gradient(90deg, #00f2fe, #4facfe)'};"></div>
            </div>
            ${jumpHtml}
          </div>
        `;
      });

      // Add Expedition Corridor milestone card
      if (corridor.stops.length > 0) {
        const corrPct = Math.round((corridor.visitedStops / corridor.stops.length) * 100);
        const corrDone = corridor.remainingStops === 0;
        items.unshift(`
          <div class="dsa-milestone-item ${corrDone ? 'unlocked' : ''}">
            <div class="dsa-milestone-top">
              <div class="dsa-milestone-name">
                <span>🧭</span>
                <span>Aktif Sefer Koridoru: Ankara ➔ Edirne</span>
              </div>
              <span class="dsa-milestone-status ${corrDone ? 'done' : 'pending'}">
                ${corrDone ? '✅ Tamamlandı' : `${corridor.visitedStops} / ${corridor.stops.length} Durak`}
              </span>
            </div>
            <div class="dsa-milestone-desc">
              Toplam ~${formatNumber(corridor.totalRoadKm)} km hat · Kalan ${corridor.remainingStops} il (${corridor.remainingStops * DAYS_PER_PROVINCE} gün).
            </div>
            <div class="dsa-progress-track">
              <div class="dsa-progress-fill" style="width:${corrPct}%; background:linear-gradient(90deg, #f59e0b, #00f2fe);"></div>
            </div>
            ${nextCorridorStop ? `
              <div class="dsa-jump-row">
                <button type="button" class="dsa-jump-btn" data-jump-city="${escapeHtml(nextCorridorStop.key)}">
                  🎯 Sıradaki Durak: ${escapeHtml(nextCorridorStop.name)} (${formatPlate(nextCorridorStop.plate)}) ➔
                </button>
              </div>
            ` : ''}
          </div>
        `);
      }

      return items.join('');
    }

    function buildLeaderboardRowsHtml() {
      return sortedRegions
        .map((r, idx) => {
          const rank = idx + 1;
          const rankClass = rank <= 3 ? `top-${rank}` : '';
          const isActive = activeRegionObj && activeRegionObj.code === r.code;
          const targetCity = r.nextTarget;
          return `
            <tr class="dsa-region-row ${isActive ? 'active' : ''}" data-region-select="${escapeHtml(r.code)}" tabindex="0">
              <td><span class="dsa-rank-badge ${rankClass}">${rank}</span></td>
              <td>
                <div style="font-weight:700; display:flex; align-items:center; gap:6px;">
                  <span>${escapeHtml(r.icon)}</span>
                  <span>${escapeHtml(r.shortName)}</span>
                </div>
              </td>
              <td>
                <div class="dsa-table-bar-wrap">
                  <div class="dsa-table-bar">
                    <div class="dsa-progress-fill" style="width:${r.percentage}%; background:${escapeHtml(r.color)};"></div>
                  </div>
                  <strong style="color:${escapeHtml(r.color)}; min-width:44px; text-align:right;">%${r.percentage}</strong>
                </div>
              </td>
              <td style="white-space:nowrap;"><strong>${r.visited}</strong> / ${r.total}</td>
              <td style="color:var(--text-secondary, #94a3b8);">${r.remaining} il</td>
              <td>
                ${targetCity ? `
                  <button type="button" class="dsa-jump-btn" data-jump-city="${escapeHtml(targetCity.key)}" title="${escapeHtml(targetCity.name)} detayına git">
                    ${targetCity.visited ? '✅' : '🧭'} ${escapeHtml(targetCity.name)}
                  </button>
                ` : '—'}
              </td>
            </tr>
          `;
        })
        .join('');
    }

    function buildRegionDrawerHtml(reg) {
      if (!reg) return '';
      const chips = reg.provinces
        .map((p) => `
          <button type="button" class="dsa-province-chip ${p.visited ? 'visited' : 'unvisited'}" data-jump-city="${escapeHtml(p.key)}">
            <span>${p.visited ? '✅' : '⏳'}</span>
            <span>${formatPlate(p.plate)}</span>
            <span>${escapeHtml(p.name)}</span>
          </button>
        `)
        .join('');

      return `
        <div class="dsa-region-drawer" id="dsa-region-drawer">
          <div class="dsa-region-drawer-head">
            <div>
              <strong style="font-family:var(--font-heading, sans-serif); font-size:0.92rem; color:${escapeHtml(reg.color)};">
                ${escapeHtml(reg.icon)} ${escapeHtml(reg.name)} • %${reg.percentage} (${reg.visited}/${reg.total} İl)
              </strong>
              <div style="font-size:0.75rem; color:var(--text-secondary, #94a3b8); margin-top:2px;">
                ${escapeHtml(reg.desc)}
              </div>
            </div>
            <button type="button" class="dsa-pill-toggle" id="dsa-open-region-dossier" data-region-code="${escapeHtml(reg.code)}">
              🌍 Bölge Dosyasında Aç ➔
            </button>
          </div>
          <div class="dsa-province-chips">${chips}</div>
        </div>
      `;
    }

    const corridorChipsHtml = corridor.stops
      .map((s, idx) => `
        ${idx > 0 ? '<span class="dsa-corridor-arrow">➔</span>' : ''}
        <button type="button" class="dsa-corridor-chip ${s.visited ? 'visited' : 'unvisited'}" data-jump-city="${escapeHtml(s.key)}">
          <span>${s.visited ? '✅' : '🎯'}</span>
          <span>${idx + 1}. ${escapeHtml(s.name)}</span>
          <span style="opacity:0.7;">(${formatPlate(s.plate)})</span>
        </button>
      `)
      .join('');

    container.innerHTML = `
      <div class="dsa-wrap">
        <!-- Executive Header & KPI Strip -->
        <section class="dsa-hero">
          <div class="dsa-hero-top">
            <div>
              <span class="dsa-hero-badge">⚡ Executive Telemetry • 81/81 Projeksiyon</span>
              <h2 class="dsa-hero-title">📈 İleri Analitik &amp; 81/81 Tahmin Stüdyosu</h2>
              <p class="dsa-hero-sub">
                7 coğrafi bölge radar analizi, 5 Gün Kuralı hız simülatörü ve Ankara ➔ Edirne sefer koridoru telemetrisi.
              </p>
            </div>
            <div class="dsa-hero-actions">
              <button type="button" class="dsa-nav-pill" data-open-view="analytics">📊 81 Plaka Matrisi</button>
              <button type="button" class="dsa-nav-pill" data-open-view="atlas">🗺️ Vektör Atlas</button>
              <button type="button" class="dsa-nav-pill" data-open-view="budget">💰 Bütçe Simülatörü</button>
            </div>
          </div>

          <div class="dsa-kpi-strip">
            <div class="dsa-kpi-box">
              <div class="dsa-kpi-label"><span>🇹🇷 Türkiye Tamamlama</span><span>${visitedCount}/${totalCities}</span></div>
              <div class="dsa-kpi-val" style="color:var(--accent-emerald, #10b981);">%${progressPct}</div>
              <div class="dsa-kpi-sub">Kalan hedef: ${unvisitedCount} il</div>
              <div class="dsa-kpi-bar"><div class="dsa-kpi-bar-fill" style="width:${progressPct}%;"></div></div>
            </div>

            <div class="dsa-kpi-box">
              <div class="dsa-kpi-label"><span>📚 Saha &amp; Kütüphane</span><span>5 Gün Kuralı</span></div>
              <div class="dsa-kpi-val" style="color:var(--accent-cyan, #00f2fe);">${formatNumber(daysOnRoad)} Gün</div>
              <div class="dsa-kpi-sub">${formatNumber(libraryHours)} saat kütüphane ofis mesaisi</div>
            </div>

            <div class="dsa-kpi-box">
              <div class="dsa-kpi-label"><span>🧭 Yol &amp; Bölge Kapsamı</span><span>${visitedRegionsCount}/${totalRegionsCount} Bölge</span></div>
              <div class="dsa-kpi-val" style="color:var(--accent-gold, #f59e0b);">${formatNumber(estimatedKm)} km</div>
              <div class="dsa-kpi-sub">${visitedRegionsCount === totalRegionsCount ? '7/7 bölgeye ayak basıldı' : 'Sonraki bölge: Güneydoğu Anadolu'}</div>
            </div>

            <div class="dsa-kpi-box">
              <div class="dsa-kpi-label"><span>${nextRank ? escapeHtml(nextRank.icon || '📜') : '👑'} Rütbe İlerlemesi</span><span>${currentRank ? escapeHtml(currentRank.title) : 'Seyyah'}</span></div>
              <div class="dsa-kpi-val" style="color:var(--accent-purple, #a855f7); font-size:1.15rem;">
                ${nextRank ? escapeHtml(nextRank.title) : 'Hâfız-ı Anadolu'}
              </div>
              <div class="dsa-kpi-sub">
                ${nextRank ? `${Math.max(0, nextRank.min_cities - visitedCount)} il sonra yeni rütbe` : 'Tüm rütbeler tamamlandı'}
              </div>
            </div>
          </div>
        </section>

        <!-- Row 1: 7-Region Radar + 81/81 Velocity Calculator -->
        <section class="dsa-grid-2">
          <!-- 7-Region Radar Chart -->
          <div class="dsa-card">
            <div class="dsa-card-head">
              <div>
                <h3 class="dsa-card-title">🕸️ 7 Bölge Tamamlama Radar Analizi</h3>
                <p class="dsa-card-sub">Bölgelerdeki tamamlama dengesi (%) · Noktaların üzerine gel veya tıkla</p>
              </div>
              <button type="button" class="dsa-pill-toggle ${uiState.showBenchmarkRing ? 'active' : ''}" id="dsa-toggle-benchmark">
                📏 Ortalama (%${progressPct})
              </button>
            </div>

            <div class="dsa-radar-stage" id="dsa-radar-stage">
              ${radarSvgHtml}
            </div>

            <div class="dsa-radar-legend">
              <div class="dsa-legend-items">
                <span class="dsa-legend-item"><span class="dsa-swatch" style="background:#00f2fe;"></span>Bölgesel Tamamlama (%)</span>
                <span class="dsa-legend-item"><span class="dsa-swatch" style="background:#f59e0b;"></span>Türkiye Ortalaması (%${progressPct})</span>
              </div>
              <span>Tıklanan bölge aşağıdaki tabloda açılır</span>
            </div>
          </div>

          <!-- Interactive 81/81 Completion Velocity Calculator -->
          <div class="dsa-card">
            <div class="dsa-card-head">
              <div>
                <h3 class="dsa-card-title">⚡ Sefer Hızı Simülatörü</h3>
                <p class="dsa-card-sub">Ayda 1–4 il temposu · 5 Gün Kuralı (GSB) · Tahmini kalan menzil (km) projeksiyonu</p>
              </div>
            </div>

            <div class="dsa-slider-panel">
              <div class="dsa-slider-header">
                <label for="dsa-pace-slider" class="dsa-slider-question">Ayda ortalama kaç yeni il geziyorsun?</label>
                <span class="dsa-pace-badge" id="dsa-pace-badge">${proj.pace} il / ay</span>
              </div>
              <input
                type="range"
                id="dsa-pace-slider"
                class="dsa-range-input"
                min="1"
                max="4"
                step="1"
                value="${proj.pace}"
                aria-label="Ayda ortalama kaç yeni il geziyorsun (1-4 il/ay)"
              />
              <div class="dsa-range-scale">
                <span>1 il/ay</span><span>2 il/ay</span><span>3 il/ay</span><span>4 il/ay</span>
              </div>
              <div class="dsa-pace-presets" id="dsa-pace-presets">
                <button type="button" class="dsa-preset-chip ${proj.pace === 1 ? 'active' : ''}" data-pace="1">🐢 1 il/ay</button>
                <button type="button" class="dsa-preset-chip ${proj.pace === 2 ? 'active' : ''}" data-pace="2">🚶 2 il/ay (Dengeli)</button>
                <button type="button" class="dsa-preset-chip ${proj.pace === 3 ? 'active' : ''}" data-pace="3">🚆 3 il/ay (Hızlı)</button>
                <button type="button" class="dsa-preset-chip ${proj.pace === 4 ? 'active' : ''}" data-pace="4">⚡ 4 il/ay (Ekspres)</button>
              </div>
            </div>

            <div class="dsa-eta-banner">
              <div>
                <div class="dsa-eta-kicker">🎯 Tahmini 81/81 Tamamlama Tarihi</div>
                <div class="dsa-eta-date" id="dsa-eta-date">${escapeHtml(proj.etaLabel)}</div>
              </div>
              <div class="dsa-eta-meta" id="dsa-eta-meta">
                ${proj.remaining > 0
                  ? `<strong>${proj.monthsNeeded} ay</strong> içinde tamamlanır<br/>Yıllık tempo: ~${proj.yearlyRate} il/yıl · ~${formatNumber(proj.monthlyKm)} km/ay`
                  : 'Anadolu’nun 81 ili tamamlandı!'}
              </div>
            </div>

            <div class="dsa-calc-grid">
              <div class="dsa-calc-stat">
                <span class="dsa-calc-stat-label">📅 Kalan GSB Seyahatsever Günü</span>
                <span class="dsa-calc-stat-val" id="dsa-calc-days" style="color:var(--accent-gold, #f59e0b);">${formatNumber(proj.remainingDays)} Gün</span>
                <span class="dsa-calc-stat-hint">${proj.remaining} il × ${DAYS_PER_PROVINCE} gün kuralı (Aylık ${proj.pace * DAYS_PER_PROVINCE} gün)</span>
              </div>
              <div class="dsa-calc-stat">
                <span class="dsa-calc-stat-label">🛣️ Tahmini Kalan Menzil</span>
                <span class="dsa-calc-stat-val" id="dsa-calc-km" style="color:var(--accent-cyan, #00f2fe);">~${formatNumber(proj.estRemainingKm)} km</span>
                <span class="dsa-calc-stat-hint" id="dsa-calc-km-hint">Aylık ~${formatNumber(proj.monthlyKm)} km · İl başı ~${formatNumber(proj.kmPerProv)} km</span>
              </div>
              <div class="dsa-calc-stat">
                <span class="dsa-calc-stat-label">📚 Tahmini Kütüphane Mesaisi</span>
                <span class="dsa-calc-stat-val" id="dsa-calc-hours" style="color:var(--accent-purple, #a855f7);">${formatNumber(proj.estLibraryHours)} Saat</span>
                <span class="dsa-calc-stat-hint">Günde ${LIBRARY_HOURS_PER_DAY} saat odaklanmış çalışma</span>
              </div>
              <div class="dsa-calc-stat">
                <span class="dsa-calc-stat-label">⛺ GSB KYK Otel Tasarrufu</span>
                <span class="dsa-calc-stat-val" id="dsa-calc-savings" style="color:var(--accent-emerald, #10b981);">${formatTL(proj.kykSavingsTL)}</span>
                <span class="dsa-calc-stat-hint">${formatTL(STANDARD_HOTEL_NIGHTLY_TL)}/gece butik otel kıyaslı</span>
              </div>
            </div>

            <div class="dsa-milestones-mini" id="dsa-pace-milestones">
              <div class="dsa-mini-step ${visitedCount >= 41 ? 'done' : ''}">
                <span class="dsa-mini-step-title">⭐ 41 İl (Yarı Yol)</span>
                <span class="dsa-mini-step-eta" data-milestone-target="41">${escapeHtml(calcMilestoneEtaText(41))}</span>
              </div>
              <div class="dsa-mini-step ${visitedCount >= 60 ? 'done' : ''}">
                <span class="dsa-mini-step-title">🚀 60 İl (Son Çeyrek)</span>
                <span class="dsa-mini-step-eta" data-milestone-target="60">${escapeHtml(calcMilestoneEtaText(60))}</span>
              </div>
              <div class="dsa-mini-step ${visitedCount >= 81 ? 'done' : ''}">
                <span class="dsa-mini-step-title">👑 81/81 Final</span>
                <span class="dsa-mini-step-eta" data-milestone-target="81">${escapeHtml(calcMilestoneEtaText(81))}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Row 2: Geo-Scatter Mini-Map & Ankara -> Edirne Corridor -->
        <section class="dsa-card">
          <div class="dsa-map-toolbar">
            <div>
              <h3 class="dsa-card-title">🗺️ 81 İl Geo-Scatter Haritası &amp; Ankara ➔ Edirne Sefer Koridoru</h3>
              <p class="dsa-card-sub">
                Koordinat düzleminde (lng/lat) 81 il dağılımı · Zümrüt (Gezildi: ${visitedCount}) vs Sakin Camgöbeği (Bekliyor: ${unvisitedCount}) · Koridor: ${corridor.stops.length} Durak (~${formatNumber(corridor.totalRoadKm)} km)
              </p>
            </div>
            <div class="dsa-map-filters" id="dsa-map-filters">
              <button type="button" class="dsa-pill-toggle ${uiState.mapFilter === 'all' ? 'active' : ''}" data-map-filter="all">🇹🇷 Tümü (81)</button>
              <button type="button" class="dsa-pill-toggle ${uiState.mapFilter === 'visited' ? 'active' : ''}" data-map-filter="visited">✅ Gezildi (${visitedCount})</button>
              <button type="button" class="dsa-pill-toggle ${uiState.mapFilter === 'unvisited' ? 'active' : ''}" data-map-filter="unvisited">⏳ Bekliyor (${unvisitedCount})</button>
              <button type="button" class="dsa-pill-toggle ${uiState.mapFilter === 'corridor' ? 'active' : ''}" data-map-filter="corridor">🎯 Ankara ➔ Edirne (${corridor.stops.length})</button>
            </div>
          </div>

          <div class="dsa-map-stage" id="dsa-map-stage">
            ${geoSvgHtml}
          </div>

          <div class="dsa-radar-legend" style="border-top:none; padding-top:0;">
            <div class="dsa-legend-items">
              <span class="dsa-legend-item"><span class="dsa-swatch" style="background:#10b981;"></span>Gezilen İl (${visitedCount})</span>
              <span class="dsa-legend-item"><span class="dsa-swatch" style="background:rgba(56, 189, 248, 0.55); border:1px solid #38bdf8;"></span>Planlanan İl (${unvisitedCount})</span>
              <span class="dsa-legend-item"><span class="dsa-swatch" style="background:#f59e0b;"></span>Aktif Ankara ➔ Edirne Koridoru (${corridor.visitedStops}/${corridor.stops.length} gezildi)</span>
            </div>
            <span>Noktaya tıklayarak il detayına git</span>
          </div>

          <div class="dsa-corridor-strip">
            <span style="font-size:0.74rem; font-weight:700; color:var(--accent-gold, #f59e0b); margin-right:4px;">🧭 Aktif Koridor:</span>
            ${corridorChipsHtml}
          </div>
        </section>

        <!-- Row 3: Top Milestones & Region Leaderboard Table -->
        <section class="dsa-grid-2">
          <!-- Top Milestones -->
          <div class="dsa-card">
            <div class="dsa-card-head">
              <div>
                <h3 class="dsa-card-title">🏆 Öncelikli Kilometre Taşları</h3>
                <p class="dsa-card-sub">Aktif sefer hedefleri, rozet ilerlemeleri ve tek tıkla hedef illere geçiş</p>
              </div>
              <span class="dsa-pill-toggle" style="cursor:default;">
                ${achievements.unlocked_count || badges.filter((b) => b.unlocked).length} / ${achievements.total_badges || badges.length} Rozet
              </span>
            </div>

            <div class="dsa-milestone-list">
              ${buildMilestonesHtml()}
            </div>
          </div>

          <!-- Region Leaderboard Table -->
          <div class="dsa-card">
            <div class="dsa-card-head">
              <div>
                <h3 class="dsa-card-title">🥇 7 Bölge Liderlik Tablosu</h3>
                <p class="dsa-card-sub">Tamamlama yüzdesine göre sıralı · Satıra tıkla illeri gör, il butonuna tıkla detaya git</p>
              </div>
            </div>

            <div class="dsa-table-wrap">
              <table class="dsa-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Bölge</th>
                    <th>Tamamlama</th>
                    <th>Gezilen</th>
                    <th>Kalan</th>
                    <th>Öncelikli İl</th>
                  </tr>
                </thead>
                <tbody id="dsa-leaderboard-body">
                  ${buildLeaderboardRowsHtml()}
                </tbody>
              </table>
            </div>

            <div id="dsa-region-drawer-host">
              ${buildRegionDrawerHtml(activeRegionObj)}
            </div>
          </div>
        </section>
      </div>
    `;

    const tooltipEl = ensureTooltip();

    function hideTooltip() {
      tooltipEl.classList.remove('is-visible');
    }

    function jumpToRegionFilter(regionCode, openDossierView) {
      if (!regionCode) return;
      uiState.activeRegionCode = regionCode;

      if (state) {
        state.selectedRegion = regionCode;
      }
      const regionSelectEl = document.getElementById('region-select');
      if (regionSelectEl) {
        regionSelectEl.value = regionCode;
        regionSelectEl.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const drawerHost = container.querySelector('#dsa-region-drawer-host');
      const found = regions.find((r) => r.code === regionCode);
      if (drawerHost && found) {
        drawerHost.innerHTML = buildRegionDrawerHtml(found);
      }

      container.querySelectorAll('.dsa-region-row').forEach((row) => {
        row.classList.toggle('active', row.getAttribute('data-region-select') === regionCode);
      });

      if (openDossierView) {
        openView('regions');
        return;
      }

      if (found) {
        showToast(`${found.icon} ${found.name} seçildi (%${found.percentage})`);
      }
    }

    // 1. Velocity Calculator Live Updates (without full re-render)
    const paceSlider = container.querySelector('#dsa-pace-slider');
    const paceBadge = container.querySelector('#dsa-pace-badge');
    const etaDateEl = container.querySelector('#dsa-eta-date');
    const etaMetaEl = container.querySelector('#dsa-eta-meta');
    const calcDaysEl = container.querySelector('#dsa-calc-days');
    const calcKmEl = container.querySelector('#dsa-calc-km');
    const calcKmHintEl = container.querySelector('#dsa-calc-km-hint');
    const calcHoursEl = container.querySelector('#dsa-calc-hours');
    const calcSavingsEl = container.querySelector('#dsa-calc-savings');

    function updateVelocityUI(newPace) {
      const p = computeVelocityProjection(unvisitedCount, newPace, avgKmPerProvince);
      uiState.pace = p.pace;

      if (paceSlider && Number(paceSlider.value) !== p.pace) {
        paceSlider.value = String(p.pace);
      }
      if (paceBadge) paceBadge.textContent = `${p.pace} il / ay`;
      if (etaDateEl) etaDateEl.textContent = p.etaLabel;
      if (etaMetaEl) {
        etaMetaEl.innerHTML =
          p.remaining > 0
            ? `<strong>${p.monthsNeeded} ay</strong> içinde tamamlanır<br/>Yıllık tempo: ~${p.yearlyRate} il/yıl · ~${formatNumber(p.monthlyKm)} km/ay`
            : 'Anadolu’nun 81 ili tamamlandı!';
      }
      if (calcDaysEl) {
        calcDaysEl.textContent = `${formatNumber(p.remainingDays)} Gün`;
        const daysHint = calcDaysEl.nextElementSibling;
        if (daysHint) {
          daysHint.textContent = `${p.remaining} il × ${DAYS_PER_PROVINCE} gün kuralı (Aylık ${p.pace * DAYS_PER_PROVINCE} gün)`;
        }
      }
      if (calcKmEl) calcKmEl.textContent = `~${formatNumber(p.estRemainingKm)} km`;
      if (calcKmHintEl) calcKmHintEl.textContent = `Aylık ~${formatNumber(p.monthlyKm)} km · İl başı ~${formatNumber(p.kmPerProv)} km`;
      if (calcHoursEl) calcHoursEl.textContent = `${formatNumber(p.estLibraryHours)} Saat`;
      if (calcSavingsEl) calcSavingsEl.textContent = formatTL(p.kykSavingsTL);

      container.querySelectorAll('.dsa-preset-chip').forEach((btn) => {
        btn.classList.toggle('active', Number(btn.getAttribute('data-pace')) === p.pace);
      });

      container.querySelectorAll('[data-milestone-target]').forEach((el) => {
        const target = Number(el.getAttribute('data-milestone-target')) || 81;
        el.textContent = calcMilestoneEtaText(target);
      });
    }

    if (paceSlider) {
      paceSlider.addEventListener('input', (e) => {
        updateVelocityUI(e.target.value);
      });
    }

    const presetsWrap = container.querySelector('#dsa-pace-presets');
    if (presetsWrap) {
      presetsWrap.addEventListener('click', (e) => {
        const btn = e.target.closest('.dsa-preset-chip');
        if (!btn) return;
        updateVelocityUI(btn.getAttribute('data-pace'));
      });
    }

    // 2. Radar Benchmark Toggle & Hover Tooltips
    const radarStage = container.querySelector('#dsa-radar-stage');
    const benchmarkBtn = container.querySelector('#dsa-toggle-benchmark');
    if (benchmarkBtn && radarStage) {
      benchmarkBtn.addEventListener('click', () => {
        uiState.showBenchmarkRing = !uiState.showBenchmarkRing;
        benchmarkBtn.classList.toggle('active', uiState.showBenchmarkRing);
        radarStage.innerHTML = buildRadarSvg(regions, progressPct, uiState.showBenchmarkRing, escapeHtml);
      });
    }

    function showRadarTooltip(groupEl, event) {
      const icon = groupEl.getAttribute('data-region-icon') || '📍';
      const name = groupEl.getAttribute('data-region-name') || '';
      const pct = groupEl.getAttribute('data-region-pct') || '0';
      const visited = groupEl.getAttribute('data-region-visited') || '0';
      const total = groupEl.getAttribute('data-region-total') || '0';
      const remaining = groupEl.getAttribute('data-region-remaining') || '0';
      const color = groupEl.getAttribute('data-region-color') || '#00f2fe';

      tooltipEl.innerHTML = `
        <div class="dsa-tooltip-head">${escapeHtml(icon)} ${escapeHtml(name)}</div>
        <div class="dsa-tooltip-sub">
          Tamamlama: <strong style="color:${escapeHtml(color)};">%${escapeHtml(pct)}</strong> (${escapeHtml(visited)}/${escapeHtml(total)} il)
        </div>
        <div class="dsa-tooltip-meta">Kalan: ${escapeHtml(remaining)} il · Tıkla: Liderlik tablosunda incele</div>
      `;
      tooltipEl.classList.add('is-visible');

      if (event && typeof event.clientX === 'number') {
        positionTooltip(tooltipEl, event.clientX, event.clientY);
      } else {
        const rect = groupEl.getBoundingClientRect();
        positionTooltip(tooltipEl, rect.left + rect.width / 2, rect.top);
      }
    }

    if (radarStage) {
      radarStage.addEventListener('mouseover', (e) => {
        const grp = e.target.closest('.dsa-radar-axis-group');
        if (grp) showRadarTooltip(grp, e);
      });
      radarStage.addEventListener('mousemove', (e) => {
        const grp = e.target.closest('.dsa-radar-axis-group');
        if (grp && tooltipEl.classList.contains('is-visible')) {
          positionTooltip(tooltipEl, e.clientX, e.clientY);
        }
      });
      radarStage.addEventListener('mouseout', (e) => {
        const grp = e.target.closest('.dsa-radar-axis-group');
        if (grp && !grp.contains(e.relatedTarget)) hideTooltip();
      });
      radarStage.addEventListener('focusin', (e) => {
        const grp = e.target.closest('.dsa-radar-axis-group');
        if (grp) showRadarTooltip(grp, null);
      });
      radarStage.addEventListener('focusout', hideTooltip);
      radarStage.addEventListener('click', (e) => {
        const grp = e.target.closest('.dsa-radar-axis-group');
        if (!grp) return;
        hideTooltip();
        const code = grp.getAttribute('data-region-code');
        jumpToRegionFilter(code, false);
      });
      radarStage.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const grp = e.target.closest('.dsa-radar-axis-group');
          if (!grp) return;
          e.preventDefault();
          hideTooltip();
          jumpToRegionFilter(grp.getAttribute('data-region-code'), false);
        }
      });
    }

    // 3. Geo-Scatter Mini-Map Filters, Tooltips & Clicks
    const mapStage = container.querySelector('#dsa-map-stage');
    const mapFiltersEl = container.querySelector('#dsa-map-filters');
    if (mapFiltersEl && mapStage) {
      mapFiltersEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-map-filter]');
        if (!btn) return;
        uiState.mapFilter = btn.getAttribute('data-map-filter') || 'all';
        mapFiltersEl.querySelectorAll('[data-map-filter]').forEach((b) => {
          b.classList.toggle('active', b === btn);
        });
        mapStage.innerHTML = buildGeoScatterSvg(provincesList, corridor, uiState.mapFilter, escapeHtml);
      });
    }

    function showCityTooltip(dotGroup, event) {
      const plate = dotGroup.getAttribute('data-plate') || '';
      const name = dotGroup.getAttribute('data-name') || '';
      const region = dotGroup.getAttribute('data-region') || '';
      const isVisited = dotGroup.getAttribute('data-visited') === '1';
      const lat = dotGroup.getAttribute('data-lat') || '';
      const lng = dotGroup.getAttribute('data-lng') || '';
      const corrOrder = Number(dotGroup.getAttribute('data-corridor-order')) || 0;

      tooltipEl.innerHTML = `
        <div class="dsa-tooltip-head">${escapeHtml(plate)} · ${escapeHtml(name)}</div>
        <div class="dsa-tooltip-sub" style="color:${isVisited ? '#10b981' : '#38bdf8'}; font-weight:700;">
          ${isVisited ? '✅ Gezildi' : '⏳ Planlanan'} · ${escapeHtml(region)}
        </div>
        ${corrOrder > 0 ? `<div class="dsa-tooltip-meta" style="color:#f59e0b; font-weight:700;">🧭 Ankara ➔ Edirne Koridoru (${corrOrder}. Durak)</div>` : ''}
        <div class="dsa-tooltip-meta">📍 ${escapeHtml(lat)}°N, ${escapeHtml(lng)}°E · Tıkla: Detaya Git</div>
      `;
      tooltipEl.classList.add('is-visible');

      if (event && typeof event.clientX === 'number') {
        positionTooltip(tooltipEl, event.clientX, event.clientY);
      } else {
        const rect = dotGroup.getBoundingClientRect();
        positionTooltip(tooltipEl, rect.left + rect.width / 2, rect.top);
      }
    }

    if (mapStage) {
      mapStage.addEventListener('mouseover', (e) => {
        const grp = e.target.closest('.dsa-city-dot-group');
        if (grp) showCityTooltip(grp, e);
      });
      mapStage.addEventListener('mousemove', (e) => {
        const grp = e.target.closest('.dsa-city-dot-group');
        if (grp && tooltipEl.classList.contains('is-visible')) {
          positionTooltip(tooltipEl, e.clientX, e.clientY);
        }
      });
      mapStage.addEventListener('mouseout', (e) => {
        const grp = e.target.closest('.dsa-city-dot-group');
        if (grp && !grp.contains(e.relatedTarget)) hideTooltip();
      });
      mapStage.addEventListener('focusin', (e) => {
        const grp = e.target.closest('.dsa-city-dot-group');
        if (grp) showCityTooltip(grp, null);
      });
      mapStage.addEventListener('focusout', hideTooltip);
      mapStage.addEventListener('click', (e) => {
        const grp = e.target.closest('.dsa-city-dot-group');
        if (!grp) return;
        hideTooltip();
        const key = grp.getAttribute('data-city-key');
        if (key) selectCity(key);
      });
      mapStage.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const grp = e.target.closest('.dsa-city-dot-group');
          if (!grp) return;
          e.preventDefault();
          hideTooltip();
          const key = grp.getAttribute('data-city-key');
          if (key) selectCity(key);
        }
      });
    }

    const rootEl = container.querySelector('.dsa-wrap');

    // 4. Delegated clicks: City Jumps, View Jumps, Leaderboard Region Rows & Dossier Open
    if (rootEl) {
      rootEl.addEventListener('click', (e) => {
        const cityBtn = e.target.closest('[data-jump-city]');
        if (cityBtn) {
          e.stopPropagation();
          hideTooltip();
          const key = cityBtn.getAttribute('data-jump-city');
          if (key) selectCity(key);
          return;
        }

        const viewBtn = e.target.closest('[data-open-view]');
        if (viewBtn) {
          hideTooltip();
          const view = viewBtn.getAttribute('data-open-view');
          if (view) openView(view);
          return;
        }

        const dossierBtn = e.target.closest('#dsa-open-region-dossier');
        if (dossierBtn) {
          hideTooltip();
          const code = dossierBtn.getAttribute('data-region-code');
          jumpToRegionFilter(code, true);
          return;
        }

        const regionRow = e.target.closest('.dsa-region-row');
        if (regionRow) {
          const code = regionRow.getAttribute('data-region-select');
          jumpToRegionFilter(code, false);
        }
      });

      rootEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const regionRow = e.target.closest('.dsa-region-row');
          if (regionRow && !e.target.closest('[data-jump-city]')) {
            e.preventDefault();
            jumpToRegionFilter(regionRow.getAttribute('data-region-select'), false);
          }
        }
      });
    }
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.deepStats = { render };
})();
