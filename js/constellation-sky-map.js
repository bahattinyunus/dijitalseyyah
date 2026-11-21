/**
 * Anadolu Seyahatnamesi — Anadolu Semâsı: 81 Yıldız & Takımyıldızı Haritası
 * Pure SVG + Vanilla JS, zero external dependencies.
 * Registers on window.SEYYAH_MODULES.skyMap = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-sky-map-styles';
  const VIEW_W = 1000;
  const VIEW_H = 520;
  const PAD_X = 48;
  const PAD_Y = 46;

  // Exact geographic projection bounds for Anatolia's celestial dome
  const BOUNDS = {
    minLng: 25.8,
    maxLng: 44.8,
    minLat: 35.8,
    maxLat: 42.1
  };

  const DEFAULT_ROUTE = [
    'Ankara', 'Çankırı', 'Kastamonu', 'Karabük', 'Bartın',
    'Zonguldak', 'Düzce', 'Sakarya', 'İstanbul', 'Edirne'
  ];

  // Stylized Anatolian & Thrace coastlines + major lakes for subtle celestial horizon outline
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

  const REGION_META = [
    { code: 'all', label: 'Tüm Semâ', shortLabel: 'Tüm Semâ', icon: '🌌', color: '#00f2fe', constellation: 'Anadolu Semâ Kubbesi' },
    { code: '01_Marmara', label: 'Marmara', shortLabel: 'Marmara', icon: '🏰', color: '#38bdf8', constellation: 'Pâyitaht Burcu' },
    { code: '02_Ege', label: 'Ege', shortLabel: 'Ege', icon: '🌊', color: '#34d399', constellation: 'Zeytin & Işık Takımı' },
    { code: '03_Akdeniz', label: 'Akdeniz', shortLabel: 'Akdeniz', icon: '☀️', color: '#f59e0b', constellation: 'Toros Kuşağı' },
    { code: '04_IcAnadolu', label: 'İç Anadolu', shortLabel: 'İç Anadolu', icon: '🌾', color: '#fbbf24', constellation: 'İrfan & Bozkır Burcu' },
    { code: '05_Karadeniz', label: 'Karadeniz', shortLabel: 'Karadeniz', icon: '🌲', color: '#10b981', constellation: 'Şimâl Yıldızı Takımı' },
    { code: '06_DoguAnadolu', label: 'Doğu Anadolu', shortLabel: 'Doğu Anadolu', icon: '🏔️', color: '#a855f7', constellation: 'Şark Zirveleri' },
    { code: '07_GuneydoguAnadolu', label: 'Güneydoğu Anadolu', shortLabel: 'Güneydoğu', icon: '🏜️', color: '#f97316', constellation: 'Mezopotamya Nebulası' }
  ];

  const REGION_MAP = {};
  REGION_META.forEach(function (r) {
    REGION_MAP[r.code] = r;
  });

  // Erzurumlu İbrahîm Hakkı (1703–1780) — Marifetnâme (1757) Astronomy & Cosmic Wisdom Quotes
  const MARIFETNAME_QUOTES = [
    {
      chapter: 'Marifetnâme · Hey’et-i İslâm & Eflâk Babı',
      quote: 'Gökyüzünün katları ve yıldızların seyri birer nakış değil, yolunu arayan seyyaha menzil gösteren ilâhî birer kandildir; semâyı okuyan, kendi kalbindeki âlemi de okur.',
      note: 'Erzurumlu İbrahîm Hakkı Hazretleri, Hasankale rasathanesinden gökyüzüne bakarken astronomiyi gönül terbiyesiyle birleştirirdi.'
    },
    {
      chapter: 'Marifetnâme · Âlem-i Sağîr ve Âlem-i Kebîr',
      quote: 'Kâinat büyük bir kitaptır, insan ise onun küçük bir fihristidir; dış âlemde gezilen her şehir ve seyredilen her yıldız, insanın iç semâsında bir makama karşılık gelir.',
      note: 'Anadolu’nun 81 ili, her biri ayrı bir yıldız parlaklığında bu büyük kitabın sayfalarını oluşturur.'
    },
    {
      chapter: 'Marifetnâme · Burçlar ve Kevâkib Bahsi',
      quote: 'Yıldızların birbirine olan mesafesi ve hareketindeki şaşmaz ölçü, hikmet ehli için sükûnet vesilesidir; zira göğü ölçen usturlap, aklı hayrete ve tefekküre davet eder.',
      note: 'Tillo’daki Işık Hadisesi’ni kuran İbrahîm Hakkı, güneş ve yıldızların vakit tayinindeki hassas hendesesine hayrandı.'
    },
    {
      chapter: 'Marifetnâme · Tefvîzname & Sefer Hikmeti',
      quote: 'Deme şu niçin şöyle, yerindedir ol öyle; bak sonuna sabreyle, Mevlâ görelim neyler, neylerse güzel eyler.',
      note: 'Uzun seferlerde ve bilinmeyen ufuklara doğru yol alırken seyyahın pusulası tevekkül ve sabırdır.'
    },
    {
      chapter: 'Marifetnâme · Küre-i Arz ve Mesâlik',
      quote: 'Yeryüzü bir konaklama meydanıdır; her beldenin havası, suyu ve yıldızı farklı bir mîzâç taşır. Akıllı yolcu, uğradığı her menzilden bir ibret ve dostluk devşirir.',
      note: 'Coğrafya ile irfanı buluşturan Marifetnâme, seyahati kalbin gözünü açan bir mektep olarak görür.'
    },
    {
      chapter: 'Marifetnâme · Nûr ve Kehkeşân (Samanyolu)',
      quote: 'Gece karanlığı arttıkça yıldızların nûru daha berrak parlar; zahmetli yollar aşılınca varılan menzilin kadri de o nispette yücelir.',
      note: 'Keşfedilmeyi bekleyen 42 nebula yıldızı, gecenin koynunda seyyahını çağıran yeni ufuklardır.'
    }
  ];

  // Persistent UI state across re-renders
  const uiState = {
    regionFilter: 'all',
    showConstellations: true,
    showComet: true,
    searchQuery: '',
    activeKey: null,
    pinnedKey: null,
    quoteIdx: 0
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

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const toRad = function (deg) { return (deg * Math.PI) / 180; };
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatPlate(plate) {
    const n = Number(plate) || 0;
    return n < 10 ? '0' + n : String(n);
  }

  function project(lat, lng) {
    const x = PAD_X + ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * (VIEW_W - PAD_X * 2);
    const y = PAD_Y + ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * (VIEW_H - PAD_Y * 2);
    return {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10
    };
  }

  function polyToPath(coords) {
    if (!coords || !coords.length) return '';
    return coords.map(function (pt, idx) {
      const p = project(pt[0], pt[1]);
      return (idx === 0 ? 'M' : 'L') + p.x + ' ' + p.y;
    }).join(' ') + ' Z';
  }

  // Authentic 8-pointed Seljuk star (Rub el Hizb silhouette) polygon path
  function buildSeljukStarPoints(cx, cy, rOuter, rInner) {
    const pts = [];
    const total = 16;
    for (let i = 0; i < total; i++) {
      const angle = (i * Math.PI) / 8 - Math.PI / 2;
      const r = i % 2 === 0 ? rOuter : rInner;
      const px = Math.round((cx + Math.cos(angle) * r) * 10) / 10;
      const py = Math.round((cy + Math.sin(angle) * r) * 10) / 10;
      pts.push(px + ',' + py);
    }
    return pts.join(' ');
  }

  // Deterministic PRNG for twinkling background stars (zero flicker on re-render)
  function createRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // Prim's Minimum Spanning Tree for clean regional constellation lines
  function buildRegionConstellationEdges(nodes) {
    if (!nodes || nodes.length < 2) return [];
    const n = nodes.length;
    const inTree = new Array(n).fill(false);
    const edges = [];
    inTree[0] = true;

    for (let step = 0; step < n - 1; step++) {
      let bestU = -1;
      let bestV = -1;
      let bestDist = Infinity;
      for (let i = 0; i < n; i++) {
        if (!inTree[i]) continue;
        for (let j = 0; j < n; j++) {
          if (inTree[j]) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < bestDist) {
            bestDist = d2;
            bestU = i;
            bestV = j;
          }
        }
      }
      if (bestU !== -1 && bestV !== -1) {
        inTree[bestV] = true;
        edges.push([nodes[bestU], nodes[bestV]]);
      }
    }
    return edges;
  }

  // Smooth Catmull-Rom to cubic Bezier path for the luminous expedition comet trail
  function buildSmoothPath(points) {
    if (!points || points.length === 0) return '';
    if (points.length === 1) return 'M' + points[0].x + ' ' + points[0].y;
    if (points.length === 2) {
      return 'M' + points[0].x + ' ' + points[0].y + ' L' + points[1].x + ' ' + points[1].y;
    }
    let d = 'M' + points[0].x + ' ' + points[0].y;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = Math.round((p1.x + (p2.x - p0.x) / 6) * 10) / 10;
      const cp1y = Math.round((p1.y + (p2.y - p0.y) / 6) * 10) / 10;
      const cp2x = Math.round((p2.x - (p3.x - p1.x) / 6) * 10) / 10;
      const cp2y = Math.round((p2.y - (p3.y - p1.y) / 6) * 10) / 10;

      d += ' C ' + cp1x + ' ' + cp1y + ', ' + cp2x + ' ' + cp2y + ', ' + p2.x + ' ' + p2.y;
    }
    return d;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sky-studio {
        display: flex;
        flex-direction: column;
        gap: 16px;
        animation: skyFadeIn 0.38s ease-out;
        color: var(--text-primary, #f8fafc);
      }

      @keyframes skyFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes skyNebulaPulse {
        0%, 100% { opacity: 0.48; transform: scale(0.92); }
        50% { opacity: 0.98; transform: scale(1.16); }
      }

      @keyframes skyStarTwinkle {
        0%, 100% { opacity: 0.25; }
        50% { opacity: 0.85; }
      }

      @keyframes skySeljukGlow {
        0%, 100% { filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.65)); }
        50% { filter: drop-shadow(0 0 9px rgba(16, 185, 129, 0.85)); }
      }

      @keyframes skyCometFlow {
        to { stroke-dashoffset: -120; }
      }

      @keyframes skyReticleSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* Header Banner */
      .sky-header {
        position: relative;
        overflow: hidden;
        padding: 20px 24px;
        border-radius: 18px;
        background:
          radial-gradient(circle at 85% 20%, rgba(0, 242, 254, 0.14) 0%, transparent 50%),
          radial-gradient(circle at 12% 85%, rgba(251, 191, 36, 0.14) 0%, transparent 45%),
          var(--bg-card, rgba(15, 23, 42, 0.82));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        backdrop-filter: blur(14px);
        box-shadow: var(--shadow-subtle, 0 12px 28px rgba(0, 0, 0, 0.38));
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .sky-title-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-width: 720px;
      }

      .sky-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--accent-cyan, #00f2fe);
      }

      .sky-title {
        margin: 0;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.25rem, 2.2vw, 1.7rem);
        font-weight: 800;
        line-height: 1.2;
        background: linear-gradient(125deg, #f8fafc 0%, #fbbf24 52%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .sky-subtitle {
        margin: 0;
        font-size: 0.86rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.5;
      }

      .sky-stats-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
      }

      .sky-stat-pill {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        padding: 9px 14px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.56);
        border: 1px solid rgba(255, 255, 255, 0.1);
        min-width: 96px;
      }

      .sky-stat-val {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.05rem;
        font-weight: 800;
        line-height: 1.1;
      }

      .sky-stat-val.is-gold { color: #fbbf24; }
      .sky-stat-val.is-cyan { color: #00f2fe; }
      .sky-stat-val.is-emerald { color: #34d399; }

      .sky-stat-lbl {
        font-size: 0.7rem;
        color: var(--text-secondary, #94a3b8);
        letter-spacing: 0.02em;
      }

      /* Controls Toolbar */
      .sky-controls {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px 16px;
        border-radius: 16px;
        background: var(--bg-card, rgba(15, 23, 42, 0.75));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
      }

      .sky-controls-top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .sky-search-box {
        position: relative;
        flex: 1 1 240px;
        max-width: 340px;
        display: flex;
        align-items: center;
      }

      .sky-search-icon {
        position: absolute;
        left: 12px;
        font-size: 0.9rem;
        pointer-events: none;
        opacity: 0.75;
      }

      .sky-search-input {
        width: 100%;
        padding: 9px 34px 9px 34px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(10, 15, 29, 0.75);
        color: var(--text-primary, #f8fafc);
        font-size: 0.84rem;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .sky-search-input::placeholder {
        color: var(--text-muted, #64748b);
      }

      .sky-search-input:focus {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.16);
      }

      .sky-search-clear {
        position: absolute;
        right: 8px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: none;
        background: rgba(148, 163, 184, 0.2);
        color: var(--text-primary, #f8fafc);
        font-size: 0.72rem;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
      }

      .sky-search-clear.is-visible {
        display: inline-flex;
      }

      .sky-toggles {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .sky-toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.8rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .sky-toggle-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(251, 191, 36, 0.5);
      }

      .sky-toggle-btn.is-active {
        color: #fbbf24;
        background: rgba(251, 191, 36, 0.14);
        border-color: rgba(251, 191, 36, 0.55);
        box-shadow: 0 0 14px rgba(251, 191, 36, 0.16);
      }

      .sky-toggle-btn.is-comet.is-active {
        color: #00f2fe;
        background: rgba(0, 242, 254, 0.13);
        border-color: rgba(0, 242, 254, 0.55);
        box-shadow: 0 0 14px rgba(0, 242, 254, 0.18);
      }

      .sky-region-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        align-items: center;
      }

      .sky-region-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.52);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.77rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .sky-region-pill:hover {
        color: var(--text-primary, #f8fafc);
        transform: translateY(-1px);
      }

      .sky-region-pill.is-active {
        color: #f8fafc;
        background: rgba(0, 242, 254, 0.16);
        border-color: var(--pill-color, #00f2fe);
        box-shadow: 0 0 14px rgba(0, 242, 254, 0.18);
      }

      .sky-region-count {
        font-size: 0.69rem;
        opacity: 0.8;
        font-variant-numeric: tabular-nums;
      }

      /* Main 2-column Observatory Stage */
      .sky-workspace {
        display: grid;
        grid-template-columns: minmax(0, 1.72fr) minmax(305px, 0.95fr);
        gap: 16px;
        align-items: start;
      }

      @media (max-width: 1080px) {
        .sky-workspace {
          grid-template-columns: 1fr;
        }
      }

      /* Celestial Sky Dome Frame */
      .sky-dome-card {
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.24);
        background: radial-gradient(ellipse at 50% 42%, #0c1b3a 0%, #060d20 55%, #030712 100%);
        box-shadow: 0 18px 40px rgba(2, 6, 23, 0.65), inset 0 0 60px rgba(0, 242, 254, 0.06);
        display: flex;
        flex-direction: column;
      }

      .sky-dome-topbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 10px 16px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.14);
        background: rgba(3, 7, 18, 0.65);
        font-size: 0.76rem;
        color: #cbd5e1;
      }

      .sky-dome-caption {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #e2e8f0;
      }

      .sky-legend {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }

      .sky-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.72rem;
        color: #94a3b8;
      }

      .sky-legend-swatch {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        display: inline-block;
      }

      .sky-svg-wrap {
        position: relative;
        width: 100%;
        overflow: hidden;
      }

      .sky-svg {
        display: block;
        width: 100%;
        height: auto;
        user-select: none;
      }

      .sky-bg-star {
        animation: skyStarTwinkle 4.5s ease-in-out infinite;
      }

      .sky-nebula-core {
        transform-box: fill-box;
        transform-origin: center;
        animation: skyNebulaPulse 3.6s ease-in-out infinite;
      }

      .sky-seljuk-star {
        animation: skySeljukGlow 3.8s ease-in-out infinite;
      }

      .sky-star-node {
        cursor: pointer;
        transition: opacity 0.25s ease;
        outline: none;
      }

      .sky-star-node:hover .sky-star-hit-ring,
      .sky-star-node:focus-visible .sky-star-hit-ring {
        opacity: 0.9;
      }

      .sky-star-node.is-dimmed {
        opacity: 0.16;
      }

      .sky-star-node.is-search-match .sky-search-halo {
        opacity: 1;
      }

      .sky-constellation-line {
        transition: opacity 0.25s ease, stroke-width 0.25s ease;
      }

      .sky-constellation-line.is-dimmed {
        opacity: 0.08;
      }

      .sky-comet-flow {
        stroke-dasharray: 12 10;
        animation: skyCometFlow 2.8s linear infinite;
      }

      .sky-reticle-spin {
        transform-box: fill-box;
        transform-origin: center;
        animation: skyReticleSpin 14s linear infinite;
      }

      .sky-star-label {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 9px;
        font-weight: 700;
        fill: #f8fafc;
        paint-order: stroke;
        stroke: rgba(3, 7, 18, 0.9);
        stroke-width: 2.6px;
        pointer-events: none;
      }

      .sky-route-num {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 7.5px;
        font-weight: 800;
        fill: #020617;
        pointer-events: none;
      }

      .sky-dome-footer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 9px 16px;
        border-top: 1px solid rgba(148, 163, 184, 0.14);
        background: rgba(3, 7, 18, 0.65);
        font-size: 0.74rem;
        color: #94a3b8;
      }

      .sky-search-matches-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }

      .sky-match-chip {
        padding: 3px 9px;
        border-radius: 999px;
        border: 1px solid rgba(0, 242, 254, 0.35);
        background: rgba(0, 242, 254, 0.12);
        color: #e0f2fe;
        font-size: 0.72rem;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.18s;
      }

      .sky-match-chip:hover {
        background: rgba(0, 242, 254, 0.25);
      }

      /* Right Observatory Sidebar: Menzil Card + Marifetname Quote */
      .sky-sidebar {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .sky-menzil-card {
        border-radius: 18px;
        overflow: hidden;
        background: var(--bg-card, rgba(15, 23, 42, 0.85));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        backdrop-filter: blur(14px);
        box-shadow: var(--shadow-subtle, 0 12px 30px rgba(0, 0, 0, 0.36));
        display: flex;
        flex-direction: column;
      }

      .sky-menzil-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .sky-menzil-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.92rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .sky-status-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        white-space: nowrap;
      }

      .sky-status-badge.is-visited {
        color: #fbbf24;
        background: rgba(251, 191, 36, 0.14);
        border: 1px solid rgba(251, 191, 36, 0.45);
      }

      .sky-status-badge.is-unvisited {
        color: #00f2fe;
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.4);
      }

      .sky-banner-wrap {
        position: relative;
        height: 152px;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        overflow: hidden;
      }

      .sky-banner-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.35s ease;
      }

      .sky-menzil-card:hover .sky-banner-img {
        transform: scale(1.03);
      }

      .sky-banner-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(3, 7, 18, 0.92) 6%, rgba(3, 7, 18, 0.35) 55%, rgba(3, 7, 18, 0.12) 100%);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 12px 16px;
        gap: 4px;
      }

      .sky-banner-top-badges {
        position: absolute;
        top: 10px;
        left: 12px;
        right: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .sky-plate-pill {
        padding: 3px 9px;
        border-radius: 8px;
        background: rgba(3, 7, 18, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.22);
        color: #f8fafc;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.04em;
      }

      .sky-route-pill {
        padding: 3px 9px;
        border-radius: 999px;
        background: linear-gradient(90deg, rgba(251, 191, 36, 0.92), rgba(0, 242, 254, 0.92));
        color: #020617;
        font-size: 0.7rem;
        font-weight: 800;
      }

      .sky-city-name {
        margin: 0;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.32rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.15;
      }

      .sky-city-region {
        font-size: 0.78rem;
        font-weight: 600;
        color: #cbd5e1;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .sky-menzil-body {
        padding: 14px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .sky-telemetry-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .sky-telemetry-cell {
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .sky-telemetry-lbl {
        font-size: 0.67rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted, #64748b);
        margin-bottom: 2px;
      }

      .sky-telemetry-val {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        font-variant-numeric: tabular-nums;
      }

      .sky-city-quote {
        margin: 0;
        padding: 9px 12px;
        border-radius: 10px;
        border-left: 3px solid #fbbf24;
        background: rgba(251, 191, 36, 0.07);
        font-size: 0.8rem;
        line-height: 1.48;
        color: var(--text-secondary, #cbd5e1);
        font-style: italic;
      }

      .sky-landmarks-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .sky-landmarks-lbl {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary, #94a3b8);
      }

      .sky-landmarks-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .sky-landmark-chip {
        font-size: 0.74rem;
        padding: 4px 9px;
        border-radius: 999px;
        background: rgba(0, 242, 254, 0.09);
        border: 1px solid rgba(0, 242, 254, 0.24);
        color: var(--text-primary, #e2e8f0);
      }

      .sky-descend-btn {
        width: 100%;
        padding: 11px 16px;
        border-radius: 12px;
        border: 1px solid rgba(0, 242, 254, 0.45);
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.22) 0%, rgba(0, 242, 254, 0.24) 100%);
        color: #f8fafc;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.9rem;
        font-weight: 800;
        cursor: pointer;
        transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .sky-descend-btn:hover {
        transform: translateY(-1px);
        border-color: #00f2fe;
        box-shadow: 0 8px 22px rgba(0, 242, 254, 0.25);
      }

      /* Marifetname Astronomical Quote Panel */
      .sky-marifet-card {
        border-radius: 18px;
        padding: 15px 16px;
        background:
          radial-gradient(circle at 92% 12%, rgba(251, 191, 36, 0.14) 0%, transparent 55%),
          var(--bg-card, rgba(15, 23, 42, 0.85));
        border: 1px solid rgba(251, 191, 36, 0.26);
        backdrop-filter: blur(12px);
        display: flex;
        flex-direction: column;
        gap: 9px;
      }

      .sky-marifet-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .sky-marifet-author {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.84rem;
        font-weight: 800;
        color: #fbbf24;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .sky-marifet-cycle {
        border: 1px solid rgba(251, 191, 36, 0.35);
        background: rgba(251, 191, 36, 0.1);
        color: #fbbf24;
        border-radius: 999px;
        padding: 3px 9px;
        font-size: 0.7rem;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        transition: background 0.18s;
      }

      .sky-marifet-cycle:hover {
        background: rgba(251, 191, 36, 0.22);
      }

      .sky-marifet-chapter {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--accent-cyan, #00f2fe);
      }

      .sky-marifet-quote {
        margin: 0;
        font-size: 0.83rem;
        line-height: 1.55;
        color: var(--text-primary, #f1f5f9);
        font-style: italic;
      }

      .sky-marifet-note {
        margin: 0;
        font-size: 0.74rem;
        line-height: 1.45;
        color: var(--text-secondary, #94a3b8);
      }

      /* Light Theme Compatibility */
      body.light-theme .sky-header,
      body.light-theme .sky-controls,
      body.light-theme .sky-menzil-card,
      body.light-theme .sky-marifet-card {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
      }

      body.light-theme .sky-title {
        background: linear-gradient(125deg, #0f172a 0%, #b45309 52%, #0284c7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .sky-stat-pill {
        background: rgba(241, 245, 249, 0.9);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .sky-stat-val.is-gold { color: #b45309; }
      body.light-theme .sky-stat-val.is-cyan { color: #0284c7; }
      body.light-theme .sky-stat-val.is-emerald { color: #059669; }

      body.light-theme .sky-search-input {
        background: #f8fafc;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.16);
      }

      body.light-theme .sky-search-clear {
        background: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      body.light-theme .sky-toggle-btn,
      body.light-theme .sky-region-pill {
        background: #f1f5f9;
        color: #334155;
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .sky-toggle-btn:hover,
      body.light-theme .sky-region-pill:hover {
        color: #0f172a;
      }

      body.light-theme .sky-toggle-btn.is-active {
        color: #b45309;
        background: rgba(217, 119, 6, 0.12);
        border-color: rgba(217, 119, 6, 0.5);
      }

      body.light-theme .sky-toggle-btn.is-comet.is-active {
        color: #0284c7;
        background: rgba(2, 132, 199, 0.12);
        border-color: rgba(2, 132, 199, 0.5);
      }

      body.light-theme .sky-region-pill.is-active {
        color: #0f172a;
        background: rgba(2, 132, 199, 0.14);
        border-color: #0284c7;
      }

      body.light-theme .sky-dome-card {
        border-color: rgba(2, 132, 199, 0.3);
        box-shadow: 0 14px 32px rgba(15, 23, 42, 0.18);
      }

      body.light-theme .sky-telemetry-cell {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .sky-telemetry-val,
      body.light-theme .sky-menzil-title,
      body.light-theme .sky-marifet-quote {
        color: #0f172a;
      }

      body.light-theme .sky-city-quote {
        background: rgba(217, 119, 6, 0.08);
        color: #334155;
        border-left-color: #d97706;
      }

      body.light-theme .sky-landmark-chip {
        background: rgba(2, 132, 199, 0.08);
        border-color: rgba(2, 132, 199, 0.25);
        color: #0f172a;
      }

      body.light-theme .sky-status-badge.is-visited {
        color: #b45309;
        background: rgba(217, 119, 6, 0.12);
        border-color: rgba(217, 119, 6, 0.4);
      }

      body.light-theme .sky-status-badge.is-unvisited {
        color: #0284c7;
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.35);
      }

      body.light-theme .sky-descend-btn {
        background: linear-gradient(135deg, #d97706 0%, #0284c7 100%);
        color: #ffffff;
        border-color: transparent;
      }

      body.light-theme .sky-marifet-card {
        border-color: rgba(217, 119, 6, 0.3);
      }

      body.light-theme .sky-marifet-author,
      body.light-theme .sky-marifet-cycle {
        color: #b45309;
      }
    `;
    document.head.appendChild(style);
  }

  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const data = (ctx && ctx.data) || {};
    const provinces = data.provinces || {};
    const esc = (ctx && ctx.escapeHtml) || defaultEscapeHtml;
    const norm = (ctx && ctx.normalizeTurkish) || defaultNormalizeTurkish;
    const distFn = (ctx && ctx.calcDistKm) || haversineKm;

    // Build normalized province array
    const allStars = Object.keys(provinces).map(function (key) {
      const p = provinces[key];
      const pos = project(Number(p.lat) || 39, Number(p.lng) || 35);
      const regionInfo = REGION_MAP[p.region_code] || REGION_MAP.all;
      return {
        key: key,
        p: p,
        x: pos.x,
        y: pos.y,
        visited: Boolean(p.visited),
        regionCode: p.region_code || '',
        regionColor: regionInfo.color,
        regionIcon: regionInfo.icon,
        searchBlob: norm(
          [
            p.name,
            formatPlate(p.plate),
            String(p.plate),
            p.region,
            (p.landmarks || []).join(' ')
          ].join(' ')
        ),
        routeStopIndex: -1
      };
    });

    allStars.sort(function (a, b) {
      return (a.p.plate || 0) - (b.p.plate || 0);
    });

    const starByKey = {};
    const starByNormName = {};
    allStars.forEach(function (s) {
      starByKey[s.key] = s;
      starByNormName[norm(s.p.name)] = s;
    });

    // Resolve 10-stop active expedition route (Ankara -> Edirne)
    const rawRouteNames = Array.isArray(data.custom_route) && data.custom_route.length
      ? data.custom_route
      : DEFAULT_ROUTE;

    const routeStops = [];
    rawRouteNames.forEach(function (cityName) {
      const s = starByNormName[norm(cityName)];
      if (s) {
        s.routeStopIndex = routeStops.length;
        routeStops.push(s);
      }
    });

    // Default selected star: Ankara or first route stop or first visited star
    if (!uiState.activeKey || !starByKey[uiState.activeKey]) {
      uiState.activeKey =
        (routeStops[0] && routeStops[0].key) ||
        (allStars.find(function (s) { return s.visited; }) || allStars[0] || {}).key ||
        null;
    }
    if (!uiState.pinnedKey || !starByKey[uiState.pinnedKey]) {
      uiState.pinnedKey = uiState.activeKey;
    }

    const visitedStars = allStars.filter(function (s) { return s.visited; });
    const unvisitedStars = allStars.filter(function (s) { return !s.visited; });
    const ankaraStar = starByNormName[norm('Ankara')] || routeStops[0] || allStars[0];

    // Group visited stars by region for constellation lines (MST)
    const regionCounts = {};
    REGION_META.forEach(function (r) {
      regionCounts[r.code] = { total: 0, visited: 0 };
    });
    allStars.forEach(function (s) {
      regionCounts.all.total++;
      if (s.visited) regionCounts.all.visited++;
      if (regionCounts[s.regionCode]) {
        regionCounts[s.regionCode].total++;
        if (s.visited) regionCounts[s.regionCode].visited++;
      }
    });

    const constellationGroups = [];
    REGION_META.forEach(function (r) {
      if (r.code === 'all') return;
      const nodes = visitedStars.filter(function (s) { return s.regionCode === r.code; });
      if (nodes.length >= 2) {
        const edges = buildRegionConstellationEdges(nodes);
        const cx = nodes.reduce(function (acc, n) { return acc + n.x; }, 0) / nodes.length;
        const cy = nodes.reduce(function (acc, n) { return acc + n.y; }, 0) / nodes.length;
        constellationGroups.push({
          region: r,
          edges: edges,
          cx: Math.round(cx),
          cy: Math.round(cy)
        });
      }
    });

    // Deterministic background stars & astrolabe grid
    const rng = createRng(14531757);
    const bgStars = [];
    for (let i = 0; i < 210; i++) {
      bgStars.push({
        x: Math.round(rng() * VIEW_W * 10) / 10,
        y: Math.round(rng() * VIEW_H * 10) / 10,
        r: Math.round((0.55 + rng() * 1.35) * 10) / 10,
        delay: Math.round(rng() * 45) / 10,
        opacity: Math.round((0.25 + rng() * 0.65) * 100) / 100
      });
    }

    // Celestial meridian/parallel coordinate lines
    const lngTicks = [26, 28, 30, 32, 34, 36, 38, 40, 42, 44];
    const latTicks = [36, 37, 38, 39, 40, 41, 42];

    const gridSvg = [
      lngTicks.map(function (lng) {
        const p1 = project(BOUNDS.minLat, lng);
        const p2 = project(BOUNDS.maxLat, lng);
        return (
          '<line x1="' + p1.x + '" y1="18" x2="' + p2.x + '" y2="' + (VIEW_H - 18) + '" stroke="rgba(148, 163, 184, 0.1)" stroke-width="0.7" stroke-dasharray="3 6" />' +
          '<text x="' + p1.x + '" y="' + (VIEW_H - 6) + '" text-anchor="middle" fill="rgba(148, 163, 184, 0.55)" font-size="8.5" font-family="sans-serif">' + lng + '°D</text>'
        );
      }).join(''),
      latTicks.map(function (lat) {
        const p1 = project(lat, BOUNDS.minLng);
        const p2 = project(lat, BOUNDS.maxLng);
        return (
          '<line x1="26" y1="' + p1.y + '" x2="' + (VIEW_W - 26) + '" y2="' + p2.y + '" stroke="rgba(148, 163, 184, 0.1)" stroke-width="0.7" stroke-dasharray="3 6" />' +
          '<text x="16" y="' + (p1.y + 3) + '" text-anchor="middle" fill="rgba(148, 163, 184, 0.55)" font-size="8.5" font-family="sans-serif">' + lat + '°K</text>'
        );
      }).join('')
    ].join('');

    // Astrolabe concentric celestial rings centered near Ankara
    const astroCenter = ankaraStar ? { x: ankaraStar.x, y: ankaraStar.y } : { x: 420, y: 230 };
    const astrolabeRings = [95, 190, 295, 415].map(function (r) {
      return '<circle cx="' + astroCenter.x + '" cy="' + astroCenter.y + '" r="' + r + '" fill="none" stroke="rgba(0, 242, 254, 0.08)" stroke-width="0.8" stroke-dasharray="2 7" />';
    }).join('');

    // Anatolia + Thrace subtle celestial horizon silhouette
    const coastSvg = [
      '<path d="' + polyToPath(THRACE_COAST) + '" fill="rgba(15, 35, 72, 0.32)" stroke="rgba(56, 189, 248, 0.22)" stroke-width="1" stroke-linejoin="round" />',
      '<path d="' + polyToPath(ANATOLIA_COAST) + '" fill="rgba(15, 35, 72, 0.34)" stroke="rgba(56, 189, 248, 0.24)" stroke-width="1.15" stroke-linejoin="round" />',
      '<path d="' + polyToPath(LAKE_TUZ) + '" fill="rgba(0, 242, 254, 0.08)" stroke="rgba(0, 242, 254, 0.22)" stroke-width="0.8" />',
      '<path d="' + polyToPath(LAKE_VAN) + '" fill="rgba(0, 242, 254, 0.1)" stroke="rgba(0, 242, 254, 0.26)" stroke-width="0.8" />'
    ].join('');

    // Regional Constellation Lines SVG
    const constellationLinesSvg = constellationGroups.map(function (g) {
      const lines = g.edges.map(function (edge) {
        return (
          '<line class="sky-constellation-line" data-region="' + esc(g.region.code) + '"' +
          ' x1="' + edge[0].x + '" y1="' + edge[0].y + '"' +
          ' x2="' + edge[1].x + '" y2="' + edge[1].y + '"' +
          ' stroke="' + esc(g.region.color) + '" stroke-opacity="0.58" stroke-width="1.45" stroke-linecap="round" />'
        );
      }).join('');
      const label =
        '<text class="sky-constellation-label" data-region="' + esc(g.region.code) + '"' +
        ' x="' + g.cx + '" y="' + (g.cy - 14) + '" text-anchor="middle"' +
        ' fill="' + esc(g.region.color) + '" fill-opacity="0.72" font-size="9.5" font-weight="700" letter-spacing="0.08em" pointer-events="none">' +
        esc(g.region.constellation.toUpperCase()) +
        '</text>';
      return '<g class="sky-constellation-group" data-region="' + esc(g.region.code) + '">' + lines + label + '</g>';
    }).join('');

    // 10-Stop Comet Trail SVG
    const cometPathD = buildSmoothPath(routeStops);
    const cometStart = routeStops[0];
    const cometEnd = routeStops[routeStops.length - 1];
    const cometSvg = routeStops.length >= 2
      ? (
        '<g class="sky-comet-layer">' +
          '<path id="sky-comet-path" d="' + cometPathD + '" fill="none" stroke="url(#sky-comet-grad)" stroke-width="6.5" stroke-opacity="0.28" stroke-linecap="round" filter="url(#sky-soft-glow)" />' +
          '<path d="' + cometPathD + '" fill="none" stroke="url(#sky-comet-grad)" stroke-width="2.3" stroke-opacity="0.92" stroke-linecap="round" />' +
          '<path class="sky-comet-flow" d="' + cometPathD + '" fill="none" stroke="#ffffff" stroke-width="1.35" stroke-opacity="0.82" stroke-linecap="round" />' +
          '<circle r="4.2" fill="#ffffff" filter="url(#sky-soft-glow)">' +
            '<animateMotion dur="6.5s" repeatCount="indefinite" path="' + cometPathD + '" />' +
          '</circle>' +
          (cometEnd ? (
            '<g transform="translate(' + cometEnd.x + ',' + cometEnd.y + ')" pointer-events="none">' +
              '<circle r="15" fill="url(#sky-comet-head-grad)" />' +
              '<circle r="4.2" fill="#ffffff" />' +
            '</g>'
          ) : '') +
          routeStops.map(function (st, idx) {
            const ox = idx % 2 === 0 ? 11 : -11;
            const oy = idx === 0 ? 12 : -11;
            return (
              '<g transform="translate(' + (st.x + ox) + ',' + (st.y + oy) + ')" pointer-events="none">' +
                '<circle r="6.5" fill="url(#sky-comet-badge-grad)" stroke="#030712" stroke-width="1" />' +
                '<text class="sky-route-num" x="0" y="2.6" text-anchor="middle">' + (idx + 1) + '</text>' +
              '</g>'
            );
          }).join('') +
        '</g>'
      )
      : '';

    // All 81 Province Stars SVG
    const starsSvg = allStars.map(function (s, idx) {
      const isRoute = s.routeStopIndex !== -1;
      const delay = ((s.p.plate || idx) % 12) * 0.28;
      if (s.visited) {
        const starPts = buildSeljukStarPoints(s.x, s.y, isRoute ? 9.5 : 7.8, isRoute ? 4.4 : 3.6);
        const innerPts = buildSeljukStarPoints(s.x, s.y, isRoute ? 4.8 : 3.9, isRoute ? 2.6 : 2.1);
        return (
          '<g class="sky-star-node is-visited" tabindex="0" role="button"' +
          ' aria-label="' + esc(formatPlate(s.p.plate) + ' ' + s.p.name + ' (Ziyaret Edildi)') + '"' +
          ' data-key="' + esc(s.key) + '" data-region="' + esc(s.regionCode) + '" data-plate="' + esc(s.p.plate) + '">' +
            '<circle class="sky-search-halo" cx="' + s.x + '" cy="' + s.y + '" r="16" fill="none" stroke="#00f2fe" stroke-width="1.6" stroke-dasharray="3 3" opacity="0" />' +
            '<circle class="sky-star-hit-ring" cx="' + s.x + '" cy="' + s.y + '" r="13" fill="rgba(251, 191, 36, 0.14)" stroke="#fbbf24" stroke-width="1" opacity="0" />' +
            '<circle cx="' + s.x + '" cy="' + s.y + '" r="' + (isRoute ? 12 : 9.5) + '" fill="url(#sky-visited-halo)" pointer-events="none" />' +
            '<polygon class="sky-seljuk-star" points="' + starPts + '" fill="url(#sky-seljuk-grad)" stroke="#fef08a" stroke-width="0.65" />' +
            '<polygon points="' + innerPts + '" fill="#10b981" stroke="#a7f3d0" stroke-width="0.45" />' +
            '<circle cx="' + s.x + '" cy="' + s.y + '" r="1.4" fill="#ffffff" />' +
            (isRoute || s.p.name === 'İstanbul' || s.p.name === 'Ankara' || s.p.name === 'İzmir' || s.p.name === 'Erzurum' || s.p.name === 'Antalya'
              ? '<text class="sky-star-label" x="' + s.x + '" y="' + (s.y + 16) + '" text-anchor="middle">' + esc(s.p.name) + '</text>'
              : '') +
          '</g>'
        );
      }

      // Unvisited: soft pulsing cyan nebula star
      return (
        '<g class="sky-star-node is-unvisited" tabindex="0" role="button"' +
        ' aria-label="' + esc(formatPlate(s.p.plate) + ' ' + s.p.name + ' (Keşif Bekliyor)') + '"' +
        ' data-key="' + esc(s.key) + '" data-region="' + esc(s.regionCode) + '" data-plate="' + esc(s.p.plate) + '">' +
          '<circle class="sky-search-halo" cx="' + s.x + '" cy="' + s.y + '" r="15" fill="none" stroke="#fbbf24" stroke-width="1.6" stroke-dasharray="3 3" opacity="0" />' +
          '<circle class="sky-star-hit-ring" cx="' + s.x + '" cy="' + s.y + '" r="12" fill="rgba(0, 242, 254, 0.14)" stroke="#00f2fe" stroke-width="1" opacity="0" />' +
          '<circle class="sky-nebula-core" style="animation-delay:' + delay.toFixed(2) + 's" cx="' + s.x + '" cy="' + s.y + '" r="9.2" fill="url(#sky-nebula-grad)" />' +
          '<circle cx="' + s.x + '" cy="' + s.y + '" r="2.7" fill="#38bdf8" stroke="#bae6fd" stroke-width="0.7" />' +
          '<circle cx="' + s.x + '" cy="' + s.y + '" r="1.15" fill="#ffffff" />' +
        '</g>'
      );
    }).join('');

    const bgStarsSvg = bgStars.map(function (st) {
      return (
        '<circle class="sky-bg-star" cx="' + st.x + '" cy="' + st.y + '" r="' + st.r + '"' +
        ' fill="#e2e8f0" opacity="' + st.opacity + '" style="animation-delay:' + st.delay + 's" />'
      );
    }).join('');

    const regionButtonsHtml = REGION_META.map(function (r) {
      const counts = regionCounts[r.code] || { total: 0, visited: 0 };
      const countText = r.code === 'all' ? counts.total : (counts.visited + '/' + counts.total);
      return (
        '<button type="button" class="sky-region-pill' + (uiState.regionFilter === r.code ? ' is-active' : '') + '"' +
        ' data-region-btn="' + esc(r.code) + '" style="--pill-color:' + esc(r.color) + '">' +
          '<span>' + r.icon + '</span>' +
          '<span>' + esc(r.shortLabel) + '</span>' +
          '<span class="sky-region-count">' + esc(countText) + '</span>' +
        '</button>'
      );
    }).join('');

    container.innerHTML = (
      '<section class="sky-studio">' +
        '<header class="sky-header">' +
          '<div class="sky-title-wrap">' +
            '<div class="sky-eyebrow">🔭 Anadolu Rasathanesi · Gök Kubbe Atlası</div>' +
            '<h2 class="sky-title">🌌 Anadolu Semâsı: 81 Yıldız &amp; Takımyıldızı Haritası</h2>' +
            '<p class="sky-subtitle">' +
              '81 ilin gerçek enlem ve boylamlarıyla gök kubbeye işlenmiş haritası: ' +
              '<strong>' + visitedStars.length + ' ziyaret edilen il</strong> zümrüt-altın 8 köşeli Selçuklu yıldızıyla bölgesel takımyıldızlarına, ' +
              '<strong>' + unvisitedStars.length + ' keşif bekleyen il</strong> ise nabız gibi atan camgöbeği nebula yıldızlarına dönüşür.' +
            '</p>' +
          '</div>' +
          '<div class="sky-stats-strip">' +
            '<div class="sky-stat-pill">' +
              '<span class="sky-stat-val is-gold">★ ' + visitedStars.length + ' / ' + allStars.length + '</span>' +
              '<span class="sky-stat-lbl">Selçuklu Yıldızı</span>' +
            '</div>' +
            '<div class="sky-stat-pill">' +
              '<span class="sky-stat-val is-cyan">☄️ ' + routeStops.length + ' Durak</span>' +
              '<span class="sky-stat-lbl">' + esc((cometStart && cometStart.p.name) || 'Ankara') + ' ➔ ' + esc((cometEnd && cometEnd.p.name) || 'Edirne') + '</span>' +
            '</div>' +
            '<div class="sky-stat-pill">' +
              '<span class="sky-stat-val is-emerald">✦ ' + unvisitedStars.length + ' Nebula</span>' +
              '<span class="sky-stat-lbl">Keşif Bekleyen</span>' +
            '</div>' +
          '</div>' +
        '</header>' +

        '<div class="sky-controls">' +
          '<div class="sky-controls-top">' +
            '<div class="sky-search-box">' +
              '<span class="sky-search-icon">🔍</span>' +
              '<input type="text" class="sky-search-input" id="skySearchInput" value="' + esc(uiState.searchQuery) + '"' +
              ' placeholder="Yıldız ara: il adı, plaka (06) veya eser..." aria-label="İl yıldızı ara" />' +
              '<button type="button" class="sky-search-clear' + (uiState.searchQuery ? ' is-visible' : '') + '" id="skySearchClear" title="Aramayı temizle">✕</button>' +
            '</div>' +
            '<div class="sky-toggles">' +
              '<button type="button" class="sky-toggle-btn' + (uiState.showConstellations ? ' is-active' : '') + '" id="skyToggleConstellations">' +
                '✨ Takımyıldızı Çizgileri' +
              '</button>' +
              '<button type="button" class="sky-toggle-btn is-comet' + (uiState.showComet ? ' is-active' : '') + '" id="skyToggleComet">' +
                '☄️ Aktif Sefer Kuyrukluyıldızı' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div class="sky-region-bar" id="skyRegionBar">' +
            regionButtonsHtml +
          '</div>' +
        '</div>' +

        '<div class="sky-workspace">' +
          '<div class="sky-dome-card">' +
            '<div class="sky-dome-topbar">' +
              '<span class="sky-dome-caption" id="skyDomeCaption">🌌 Tüm Semâ · 81 Yıldız &amp; 6 Bölge Takımyıldızı</span>' +
              '<div class="sky-legend">' +
                '<span class="sky-legend-item"><span class="sky-legend-swatch" style="background:linear-gradient(135deg,#fbbf24,#10b981);box-shadow:0 0 6px #fbbf24"></span>Selçuklu Yıldızı (★ ' + visitedStars.length + ')</span>' +
                '<span class="sky-legend-item"><span class="sky-legend-swatch" style="background:#00f2fe;box-shadow:0 0 6px #00f2fe"></span>Nebula Yıldızı (' + unvisitedStars.length + ')</span>' +
                '<span class="sky-legend-item"><span class="sky-legend-swatch" style="background:linear-gradient(90deg,#fbbf24,#00f2fe);width:16px;border-radius:4px"></span>Aktif Sefer (' + routeStops.length + ')</span>' +
              '</div>' +
            '</div>' +

            '<div class="sky-svg-wrap">' +
              '<svg class="sky-svg" id="skySvg" viewBox="0 0 ' + VIEW_W + ' ' + VIEW_H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Anadolu Semâsı 81 İl Yıldız ve Takımyıldızı Haritası">' +
                '<defs>' +
                  '<radialGradient id="sky-nebula-band" cx="52%" cy="46%" r="62%">' +
                    '<stop offset="0%" stop-color="#1e3a8a" stop-opacity="0.34" />' +
                    '<stop offset="48%" stop-color="#0f172a" stop-opacity="0.14" />' +
                    '<stop offset="100%" stop-color="#020617" stop-opacity="0" />' +
                  '</radialGradient>' +
                  '<radialGradient id="sky-visited-halo" cx="50%" cy="50%" r="50%">' +
                    '<stop offset="0%" stop-color="#fbbf24" stop-opacity="0.55" />' +
                    '<stop offset="55%" stop-color="#10b981" stop-opacity="0.24" />' +
                    '<stop offset="100%" stop-color="#10b981" stop-opacity="0" />' +
                  '</radialGradient>' +
                  '<linearGradient id="sky-seljuk-grad" x1="0%" y1="0%" x2="100%" y2="100%">' +
                    '<stop offset="0%" stop-color="#fde047" />' +
                    '<stop offset="55%" stop-color="#f59e0b" />' +
                    '<stop offset="100%" stop-color="#10b981" />' +
                  '</linearGradient>' +
                  '<radialGradient id="sky-nebula-grad" cx="50%" cy="50%" r="50%">' +
                    '<stop offset="0%" stop-color="#00f2fe" stop-opacity="0.56" />' +
                    '<stop offset="55%" stop-color="#38bdf8" stop-opacity="0.2" />' +
                    '<stop offset="100%" stop-color="#00f2fe" stop-opacity="0" />' +
                  '</radialGradient>' +
                  '<linearGradient id="sky-comet-grad" x1="100%" y1="50%" x2="0%" y2="0%">' +
                    '<stop offset="0%" stop-color="#fbbf24" />' +
                    '<stop offset="45%" stop-color="#34d399" />' +
                    '<stop offset="100%" stop-color="#00f2fe" />' +
                  '</linearGradient>' +
                  '<linearGradient id="sky-comet-badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">' +
                    '<stop offset="0%" stop-color="#fde047" />' +
                    '<stop offset="100%" stop-color="#00f2fe" />' +
                  '</linearGradient>' +
                  '<radialGradient id="sky-comet-head-grad" cx="50%" cy="50%" r="50%">' +
                    '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />' +
                    '<stop offset="40%" stop-color="#00f2fe" stop-opacity="0.6" />' +
                    '<stop offset="100%" stop-color="#00f2fe" stop-opacity="0" />' +
                  '</radialGradient>' +
                  '<filter id="sky-soft-glow" x="-30%" y="-30%" width="160%" height="160%">' +
                    '<feGaussianBlur stdDeviation="2.8" result="blur" />' +
                    '<feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>' +
                  '</filter>' +
                '</defs>' +

                '<rect width="' + VIEW_W + '" height="' + VIEW_H + '" fill="url(#sky-nebula-band)" />' +
                '<ellipse cx="520" cy="255" rx="430" ry="155" transform="rotate(-11 520 255)" fill="rgba(56, 189, 248, 0.045)" />' +
                '<g pointer-events="none">' + bgStarsSvg + '</g>' +
                '<g pointer-events="none">' + gridSvg + astrolabeRings + '</g>' +
                '<g pointer-events="none">' + coastSvg + '</g>' +

                '<g id="skyConstellationsLayer">' + constellationLinesSvg + '</g>' +
                '<g id="skyCometLayer">' + cometSvg + '</g>' +
                '<g id="skyStarsLayer">' + starsSvg + '</g>' +

                '<g id="skyReticle" pointer-events="none" transform="translate(' + astroCenter.x + ',' + astroCenter.y + ')">' +
                  '<circle class="sky-reticle-spin" r="19" fill="none" stroke="#fbbf24" stroke-width="1.25" stroke-dasharray="6 4" opacity="0.88" />' +
                  '<circle r="13.5" fill="none" stroke="#00f2fe" stroke-width="0.95" opacity="0.72" />' +
                '</g>' +

                '<text x="' + (VIEW_W - 18) + '" y="22" text-anchor="end" fill="rgba(226, 232, 240, 0.48)" font-size="9" font-weight="700" letter-spacing="0.16em" pointer-events="none">ŞİMÂL ▲ 42.1°K · ANADOLU KUBBESİ</text>' +
              '</svg>' +
            '</div>' +

            '<div class="sky-dome-footer">' +
              '<span>💡 Herhangi bir yıldızın üzerine gelin veya tıklayın — Rasathane Menzil Kartı anında güncellenir.</span>' +
              '<div class="sky-search-matches-bar" id="skySearchMatches"></div>' +
            '</div>' +
          '</div>' +

          '<aside class="sky-sidebar">' +
            '<div class="sky-menzil-card" id="skyMenzilCard"></div>' +
            '<div class="sky-marifet-card" id="skyMarifetCard"></div>' +
          '</aside>' +
        '</div>' +
      '</section>'
    );

    // Cache interactive DOM refs
    const svgEl = container.querySelector('#skySvg');
    const constellationsLayer = container.querySelector('#skyConstellationsLayer');
    const cometLayer = container.querySelector('#skyCometLayer');
    const reticleEl = container.querySelector('#skyReticle');
    const domeCaptionEl = container.querySelector('#skyDomeCaption');
    const menzilCardEl = container.querySelector('#skyMenzilCard');
    const marifetCardEl = container.querySelector('#skyMarifetCard');
    const searchInputEl = container.querySelector('#skySearchInput');
    const searchClearEl = container.querySelector('#skySearchClear');
    const searchMatchesEl = container.querySelector('#skySearchMatches');
    const toggleConstEl = container.querySelector('#skyToggleConstellations');
    const toggleCometEl = container.querySelector('#skyToggleComet');
    const regionBarEl = container.querySelector('#skyRegionBar');

    const starNodes = Array.prototype.slice.call(container.querySelectorAll('.sky-star-node'));
    const constGroups = Array.prototype.slice.call(container.querySelectorAll('.sky-constellation-group'));

    function renderMarifetCard() {
      const q = MARIFETNAME_QUOTES[uiState.quoteIdx % MARIFETNAME_QUOTES.length];
      marifetCardEl.innerHTML =
        '<div class="sky-marifet-head">' +
          '<span class="sky-marifet-author">📜 Erzurumlu İbrahîm Hakkı · Marifetnâme</span>' +
          '<button type="button" class="sky-marifet-cycle" id="skyMarifetNext" title="Sonraki Marifetnâme hikmeti">↻ Hikmet</button>' +
        '</div>' +
        '<div class="sky-marifet-chapter">' + esc(q.chapter) + '</div>' +
        '<blockquote class="sky-marifet-quote">“' + esc(q.quote) + '”</blockquote>' +
        '<p class="sky-marifet-note">' + esc(q.note) + '</p>';

      const nextBtn = marifetCardEl.querySelector('#skyMarifetNext');
      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          uiState.quoteIdx = (uiState.quoteIdx + 1) % MARIFETNAME_QUOTES.length;
          renderMarifetCard();
        });
      }
    }

    function renderMenzilCard(key) {
      const s = starByKey[key] || allStars[0];
      if (!s) return;

      const p = s.p;
      const plateStr = formatPlate(p.plate);
      const bannerSrc = p.has_banner && p.banner_rel ? p.banner_rel : 'assets/banner.jpg';
      const landmarks = Array.isArray(p.landmarks) ? p.landmarks : [];
      const stopNo = s.routeStopIndex !== -1 ? s.routeStopIndex + 1 : null;
      const distFromAnkara = ankaraStar && ankaraStar.key !== s.key
        ? Math.round(distFn(ankaraStar.p.lat, ankaraStar.p.lng, p.lat, p.lng)) + ' km'
        : 'Merkez (0 km)';

      if (reticleEl) {
        reticleEl.setAttribute('transform', 'translate(' + s.x + ',' + s.y + ')');
      }

      menzilCardEl.innerHTML =
        '<div class="sky-menzil-head">' +
          '<span class="sky-menzil-title">🔭 Rasathane Menzil Kartı</span>' +
          '<span class="sky-status-badge ' + (s.visited ? 'is-visited' : 'is-unvisited') + '">' +
            (s.visited ? '★ Selçuklu Yıldızı' : '✦ Keşif Bekleyen Nebula') +
          '</span>' +
        '</div>' +

        '<div class="sky-banner-wrap">' +
          '<img class="sky-banner-img" src="' + esc(bannerSrc) + '" alt="' + esc(p.name) + ' manzara"' +
          ' onerror="this.style.display=\'none\'" />' +
          '<div class="sky-banner-overlay">' +
            '<div class="sky-banner-top-badges">' +
              '<span class="sky-plate-pill">' + esc(plateStr) + '</span>' +
              (stopNo ? '<span class="sky-route-pill">☄️ Aktif Sefer · ' + stopNo + '/10</span>' : '') +
            '</div>' +
            '<h3 class="sky-city-name">' + esc(p.name) + '</h3>' +
            '<div class="sky-city-region">' +
              '<span>' + s.regionIcon + '</span>' +
              '<span>' + esc(p.region) + ' Bölgesi</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="sky-menzil-body">' +
          '<div class="sky-telemetry-grid">' +
            '<div class="sky-telemetry-cell">' +
              '<div class="sky-telemetry-lbl">Koordinatlar</div>' +
              '<div class="sky-telemetry-val">' + Number(p.lat).toFixed(2) + '°K · ' + Number(p.lng).toFixed(2) + '°D</div>' +
            '</div>' +
            '<div class="sky-telemetry-cell">' +
              '<div class="sky-telemetry-lbl">Ankara’ya Kuş Uçuşu</div>' +
              '<div class="sky-telemetry-val">' + esc(distFromAnkara) + '</div>' +
            '</div>' +
          '</div>' +

          (p.quote ? '<p class="sky-city-quote">“' + esc(p.quote) + '”</p>' : '') +

          '<div class="sky-landmarks-wrap">' +
            '<div class="sky-landmarks-lbl">🏛️ Gök Kubbe Altındaki Menziller &amp; Eserler</div>' +
            '<div class="sky-landmarks-list">' +
              (landmarks.length
                ? landmarks.slice(0, 6).map(function (lm) {
                    return '<span class="sky-landmark-chip">' + esc(lm) + '</span>';
                  }).join('')
                : '<span class="sky-landmark-chip">Keşif notu bekleniyor</span>') +
            '</div>' +
          '</div>' +

          '<button type="button" class="sky-descend-btn" id="skyDescendBtn" data-city-key="' + esc(s.key) + '">' +
            '📍 Bu Yıldızın Şehrine İn ➔' +
          '</button>' +
        '</div>';

      const descendBtn = menzilCardEl.querySelector('#skyDescendBtn');
      if (descendBtn) {
        descendBtn.addEventListener('click', function () {
          if (ctx && typeof ctx.selectCity === 'function') {
            ctx.selectCity(s.key);
          } else if (ctx && typeof ctx.showToast === 'function') {
            ctx.showToast('📍 ' + p.name + ' seçildi');
          }
        });
      }
    }

    function applyVisualFilters() {
      const region = uiState.regionFilter;
      const q = norm(uiState.searchQuery);

      if (constellationsLayer) {
        constellationsLayer.style.display = uiState.showConstellations ? '' : 'none';
      }
      if (cometLayer) {
        cometLayer.style.display = uiState.showComet ? '' : 'none';
      }

      if (toggleConstEl) {
        toggleConstEl.classList.toggle('is-active', uiState.showConstellations);
      }
      if (toggleCometEl) {
        toggleCometEl.classList.toggle('is-active', uiState.showComet);
      }

      constGroups.forEach(function (g) {
        const gRegion = g.getAttribute('data-region');
        const dimmed = region !== 'all' && gRegion !== region;
        const lines = g.querySelectorAll('.sky-constellation-line');
        lines.forEach(function (ln) {
          ln.classList.toggle('is-dimmed', dimmed);
        });
        const lbl = g.querySelector('.sky-constellation-label');
        if (lbl) {
          lbl.setAttribute('fill-opacity', dimmed ? '0.12' : (region === gRegion ? '0.96' : '0.68'));
        }
      });

      const matchedStars = [];
      starNodes.forEach(function (node) {
        const key = node.getAttribute('data-key');
        const s = starByKey[key];
        if (!s) return;

        const matchesRegion = region === 'all' || s.regionCode === region;
        const matchesQuery = !q || s.searchBlob.indexOf(q) !== -1;

        node.classList.toggle('is-dimmed', !(matchesRegion && matchesQuery));
        node.classList.toggle('is-search-match', Boolean(q && matchesQuery));

        if (q && matchesQuery) {
          matchedStars.push(s);
        }
      });

      if (searchClearEl) {
        searchClearEl.classList.toggle('is-visible', Boolean(uiState.searchQuery));
      }

      if (searchMatchesEl) {
        if (q) {
          if (matchedStars.length) {
            searchMatchesEl.innerHTML =
              '<span>Eşleşen (' + matchedStars.length + '):</span>' +
              matchedStars.slice(0, 5).map(function (ms) {
                return (
                  '<button type="button" class="sky-match-chip" data-jump-key="' + esc(ms.key) + '">' +
                    esc(formatPlate(ms.p.plate) + ' ' + ms.p.name) +
                  '</button>'
                );
              }).join('');
            searchMatchesEl.querySelectorAll('[data-jump-key]').forEach(function (btn) {
              btn.addEventListener('click', function () {
                const k = btn.getAttribute('data-jump-key');
                focusStar(k, true);
              });
            });
          } else {
            searchMatchesEl.innerHTML = '<span>“' + esc(uiState.searchQuery) + '” için yıldız bulunamadı.</span>';
          }
        } else {
          searchMatchesEl.innerHTML = '<span>Ankara ➔ Edirne seferi 10 menzil ile izleniyor.</span>';
        }
      }

      if (domeCaptionEl) {
        const rMeta = REGION_MAP[region] || REGION_MAP.all;
        const rCounts = regionCounts[region] || regionCounts.all;
        domeCaptionEl.textContent =
          rMeta.icon + ' ' + rMeta.label + ' · ' + rMeta.constellation +
          ' (' + rCounts.visited + '/' + rCounts.total + ' Yıldız)';
      }

      if (regionBarEl) {
        regionBarEl.querySelectorAll('[data-region-btn]').forEach(function (btn) {
          btn.classList.toggle('is-active', btn.getAttribute('data-region-btn') === region);
        });
      }
    }

    function focusStar(key, pin) {
      if (!key || !starByKey[key]) return;
      uiState.activeKey = key;
      if (pin) {
        uiState.pinnedKey = key;
        const star = starByKey[key];
        uiState.quoteIdx = (star.p.plate || 0) % MARIFETNAME_QUOTES.length;
        renderMarifetCard();
      }
      renderMenzilCard(key);
    }

    // Bind star hover, click & keyboard focus
    starNodes.forEach(function (node) {
      const key = node.getAttribute('data-key');
      node.addEventListener('mouseenter', function () {
        focusStar(key, false);
      });
      node.addEventListener('focus', function () {
        focusStar(key, false);
      });
      node.addEventListener('click', function () {
        focusStar(key, true);
      });
      node.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          focusStar(key, true);
        }
      });
    });

    // Region filter pills
    if (regionBarEl) {
      regionBarEl.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-region-btn]');
        if (!btn) return;
        uiState.regionFilter = btn.getAttribute('data-region-btn') || 'all';
        applyVisualFilters();

        if (uiState.regionFilter !== 'all') {
          const firstInRegion =
            visitedStars.find(function (s) { return s.regionCode === uiState.regionFilter; }) ||
            allStars.find(function (s) { return s.regionCode === uiState.regionFilter; });
          if (firstInRegion) {
            focusStar(firstInRegion.key, true);
          }
        }
      });
    }

    // Toggles
    if (toggleConstEl) {
      toggleConstEl.addEventListener('click', function () {
        uiState.showConstellations = !uiState.showConstellations;
        applyVisualFilters();
      });
    }

    if (toggleCometEl) {
      toggleCometEl.addEventListener('click', function () {
        uiState.showComet = !uiState.showComet;
        applyVisualFilters();
      });
    }

    // Search input
    if (searchInputEl) {
      searchInputEl.addEventListener('input', function () {
        uiState.searchQuery = searchInputEl.value;
        applyVisualFilters();
      });
      searchInputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          const q = norm(uiState.searchQuery);
          if (!q) return;
          const firstMatch = allStars.find(function (s) {
            return s.searchBlob.indexOf(q) !== -1;
          });
          if (firstMatch) {
            focusStar(firstMatch.key, true);
          }
        }
      });
    }

    if (searchClearEl) {
      searchClearEl.addEventListener('click', function () {
        uiState.searchQuery = '';
        if (searchInputEl) searchInputEl.value = '';
        applyVisualFilters();
      });
    }

    // Initial render of Observatory cards & visual filters
    renderMenzilCard(uiState.activeKey);
    renderMarifetCard();
    applyVisualFilters();

    // Ensure SVG maintains crisp accessibility in case container resizes
    if (svgEl && !svgEl.getAttribute('viewBox')) {
      svgEl.setAttribute('viewBox', '0 0 ' + VIEW_W + ' ' + VIEW_H);
    }
  }

  window.SEYYAH_MODULES.skyMap = {
    render: render
  };
})();
