/**
 * 📜 Sefer Der Vatan Beratı & Hâfız-ı Anadolu Sertifika Stüdyosu
 * Renders a live interactive preview AND generates a museum-grade 1920×1080
 * High-DPI pure-vector HTML5 Canvas PNG Certificate / Berat.
 * Registers on window.SEYYAH_MODULES.certificate = { render(container, ctx) }
 */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const CANVAS_W = 1920;
  const CANVAS_H = 1080;
  const STYLE_ID = 'seyyah-certificate-styles';
  const STORAGE_KEY = 'seyyah_certificate_studio_v1';
  const DOWNLOAD_FILENAME = 'dijital_seyyah_sefer_berati.png';

  const DEFAULT_CONFIG = {
    travelerName: 'Bahattin Yunus Çetin',
    travelerTitle: 'Dijital Seyyah • Anadolu Kâşifi',
    theme: 'seljuk',
    dedication:
      'Yol, yalnızca şehirler arasında kat edilen mesafe değil; her ilin kütüphanesinde okunan bir satır, taşında okunan bir tarih ve gönülde kurulan bir Anadolu haritasıdır.',
    serialNo: 'SDV-2026-081',
    issueDate: formatTodayTR(),
    showRingPlates: true
  };

  const TITLE_PRESETS = [
    'Dijital Seyyah • Anadolu Kâşifi',
    'Hâfız-ı Anadolu • Sefer Der Vatan',
    'İl Halk Kütüphanesi Yolcusu',
    'Anadolu İrfan & Şehir Kâşifi'
  ];

  const CURATED_HIKMETS = [
    'Yol, yalnızca şehirler arasında kat edilen mesafe değil; her ilin kütüphanesinde okunan bir satır, taşında okunan bir tarih ve gönülde kurulan bir Anadolu haritasıdır.',
    'Vatanı sevmek, onun 81 vilayetini haritada değil; toprağında, kitabında, ezanında ve insanının tebessümünde tek tek okumaktır.',
    'Her kütüphane bir menzil, her şehir bir ders, her sefer ise insanın kendi hakikatine doğru attığı mübarek bir adımdır.',
    'Anadolu bir açık hava medresesidir; Selçuklu taşında sabrı, Bozkır rüzgârında tevazuyu, Karadeniz dalgasında azmi öğretir.'
  ];

  const THEMES = {
    seljuk: {
      id: 'seljuk',
      label: '🌙 Selçuklu Gece & Altın Varak',
      shortLabel: 'Selçuklu Gece',
      swatches: ['#0a1124', '#f5c55e', '#38bdf8'],
      bgStops: ['#050914', '#0b1429', '#131f3b'],
      glowPrimary: 'rgba(245, 197, 94, 0.14)',
      glowSecondary: 'rgba(56, 189, 248, 0.10)',
      patternColor: 'rgba(245, 197, 94, 0.045)',
      watermarkColor: 'rgba(245, 197, 94, 0.04)',
      borderOuter: '#d4af37',
      borderInner: 'rgba(245, 197, 94, 0.52)',
      borderHairline: 'rgba(56, 189, 248, 0.28)',
      titleGrad: ['#fffbeb', '#fde68a', '#d97706'],
      eyebrowColor: '#7dd3fc',
      subtitleBg: 'rgba(245, 197, 94, 0.12)',
      subtitleBorder: 'rgba(245, 197, 94, 0.42)',
      subtitleText: '#fde68a',
      preambleColor: '#cbd5e1',
      nameGrad: ['#ffffff', '#fef3c7', '#f5c55e'],
      rankColor: '#38bdf8',
      cardBg: 'rgba(10, 17, 36, 0.72)',
      cardBorder: 'rgba(245, 197, 94, 0.34)',
      cardLabel: '#94a3b8',
      cardValue: '#fef3c7',
      cardSub: '#7dd3fc',
      cardAccent: '#f5c55e',
      quoteBg: 'rgba(15, 23, 42, 0.62)',
      quoteBorder: 'rgba(56, 189, 248, 0.28)',
      quoteText: '#e2e8f0',
      metaLabel: '#94a3b8',
      metaValue: '#f8fafc',
      ringLine: 'rgba(245, 197, 94, 0.22)',
      starVisitedFill: ['#fff7cc', '#f5c55e', '#b45309'],
      starVisitedStroke: '#fef08a',
      starVisitedGlow: 'rgba(245, 197, 94, 0.55)',
      starVisitedText: '#fde68a',
      starUnvisitedStroke: 'rgba(148, 163, 184, 0.26)',
      starUnvisitedFill: 'rgba(15, 23, 42, 0.45)',
      starUnvisitedText: 'rgba(148, 163, 184, 0.48)',
      sealOuter: ['#fff3b0', '#f5c55e', '#b7791f', '#784f07'],
      sealInnerBg: '#10182f',
      sealText: '#fef3c7'
    },
    parchment: {
      id: 'parchment',
      label: '📜 Klasik Ferman Parşömeni',
      shortLabel: 'Ferman Parşömeni',
      swatches: ['#f5e8c7', '#7c1d26', '#a16207'],
      bgStops: ['#fbf3df', '#efe0bc', '#e2c994'],
      glowPrimary: 'rgba(180, 118, 28, 0.12)',
      glowSecondary: 'rgba(124, 29, 38, 0.08)',
      patternColor: 'rgba(120, 75, 25, 0.05)',
      watermarkColor: 'rgba(124, 29, 38, 0.045)',
      borderOuter: '#8a5a12',
      borderInner: 'rgba(124, 29, 38, 0.55)',
      borderHairline: 'rgba(138, 90, 18, 0.35)',
      titleGrad: ['#5b1219', '#7c1d26', '#9a3412'],
      eyebrowColor: '#7c1d26',
      subtitleBg: 'rgba(124, 29, 38, 0.09)',
      subtitleBorder: 'rgba(124, 29, 38, 0.38)',
      subtitleText: '#6b1820',
      preambleColor: '#4a3520',
      nameGrad: ['#1c1208', '#3b2410', '#6d4117'],
      rankColor: '#7c1d26',
      cardBg: 'rgba(255, 250, 236, 0.68)',
      cardBorder: 'rgba(138, 90, 18, 0.38)',
      cardLabel: '#6e502f',
      cardValue: '#23160a',
      cardSub: '#7c1d26',
      cardAccent: '#b47b1d',
      quoteBg: 'rgba(255, 249, 234, 0.64)',
      quoteBorder: 'rgba(124, 29, 38, 0.28)',
      quoteText: '#2c1c0e',
      metaLabel: '#6e502f',
      metaValue: '#23160a',
      ringLine: 'rgba(138, 90, 18, 0.25)',
      starVisitedFill: ['#fde68a', '#c27d1a', '#7c1d26'],
      starVisitedStroke: '#7c1d26',
      starVisitedGlow: 'rgba(180, 83, 9, 0.32)',
      starVisitedText: '#5b1219',
      starUnvisitedStroke: 'rgba(110, 80, 47, 0.28)',
      starUnvisitedFill: 'rgba(245, 232, 199, 0.5)',
      starUnvisitedText: 'rgba(110, 80, 47, 0.5)',
      sealOuter: ['#fde68a', '#d49b2a', '#8c5a10', '#5c3805'],
      sealInnerBg: '#5b1219',
      sealText: '#fef3c7'
    },
    emerald: {
      id: 'emerald',
      label: '💎 Modern Zümrüt & Turkuaz',
      shortLabel: 'Zümrüt & Turkuaz',
      swatches: ['#041c1a', '#2dd4bf', '#fbbf24'],
      bgStops: ['#021312', '#062926', '#0a393c'],
      glowPrimary: 'rgba(45, 212, 191, 0.16)',
      glowSecondary: 'rgba(251, 191, 36, 0.10)',
      patternColor: 'rgba(45, 212, 191, 0.048)',
      watermarkColor: 'rgba(45, 212, 191, 0.045)',
      borderOuter: '#2dd4bf',
      borderInner: 'rgba(251, 191, 36, 0.52)',
      borderHairline: 'rgba(45, 212, 191, 0.34)',
      titleGrad: ['#ecfdf5', '#5eead4', '#fbbf24'],
      eyebrowColor: '#fbbf24',
      subtitleBg: 'rgba(45, 212, 191, 0.12)',
      subtitleBorder: 'rgba(45, 212, 191, 0.42)',
      subtitleText: '#99f6e4',
      preambleColor: '#cbd5e1',
      nameGrad: ['#ffffff', '#ccfbf1', '#5eead4'],
      rankColor: '#fbbf24',
      cardBg: 'rgba(3, 24, 23, 0.72)',
      cardBorder: 'rgba(45, 212, 191, 0.35)',
      cardLabel: '#94a3b8',
      cardValue: '#ecfdf5',
      cardSub: '#fbbf24',
      cardAccent: '#2dd4bf',
      quoteBg: 'rgba(4, 30, 28, 0.64)',
      quoteBorder: 'rgba(251, 191, 36, 0.30)',
      quoteText: '#e2e8f0',
      metaLabel: '#94a3b8',
      metaValue: '#ecfdf5',
      ringLine: 'rgba(45, 212, 191, 0.24)',
      starVisitedFill: ['#ccfbf1', '#2dd4bf', '#0f766e'],
      starVisitedStroke: '#fbbf24',
      starVisitedGlow: 'rgba(45, 212, 191, 0.52)',
      starVisitedText: '#99f6e4',
      starUnvisitedStroke: 'rgba(148, 163, 184, 0.26)',
      starUnvisitedFill: 'rgba(3, 24, 23, 0.48)',
      starUnvisitedText: 'rgba(148, 163, 184, 0.46)',
      sealOuter: ['#fef3c7', '#fbbf24', '#0d9488', '#115e59'],
      sealInnerBg: '#042321',
      sealText: '#ecfdf5'
    }
  };

  let studioState = loadSavedState();
  let fullscreenModalEl = null;
  let rafId = null;

  // =========================================================================
  // Utilities & Data Helpers
  // =========================================================================

  function formatTodayTR() {
    try {
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    } catch (e) {
      return '21.11.2026';
    }
  }

  function loadSavedState() {
    const base = Object.assign({}, DEFAULT_CONFIG);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (typeof parsed.travelerName === 'string' && parsed.travelerName.trim()) {
            base.travelerName = parsed.travelerName;
          }
          if (typeof parsed.travelerTitle === 'string' && parsed.travelerTitle.trim()) {
            base.travelerTitle = parsed.travelerTitle;
          }
          if (parsed.theme && THEMES[parsed.theme]) {
            base.theme = parsed.theme;
          }
          if (typeof parsed.dedication === 'string' && parsed.dedication.trim()) {
            base.dedication = parsed.dedication;
          }
          if (typeof parsed.serialNo === 'string' && parsed.serialNo.trim()) {
            base.serialNo = parsed.serialNo;
          }
          if (typeof parsed.issueDate === 'string' && parsed.issueDate.trim()) {
            base.issueDate = parsed.issueDate;
          }
          if (typeof parsed.showRingPlates === 'boolean') {
            base.showRingPlates = parsed.showRingPlates;
          }
        }
      }
    } catch (e) {
      // Ignore storage errors on restricted environments
    }
    return base;
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(studioState));
    } catch (e) {
      // Ignore storage errors
    }
  }

  function safeEscape(str, ctx) {
    if (ctx && typeof ctx.escapeHtml === 'function') {
      return ctx.escapeHtml(str);
    }
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function notifyToast(ctx, message) {
    if (ctx && typeof ctx.showToast === 'function') {
      ctx.showToast(message);
      return;
    }
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    const item = document.createElement('div');
    item.className = 'toast-item';
    item.textContent = message;
    toastContainer.appendChild(item);
    window.setTimeout(() => {
      if (item.parentNode) item.parentNode.removeChild(item);
    }, 3400);
  }

  function getAppData(ctx) {
    return (
      (ctx && ctx.data) ||
      (ctx && ctx.state && ctx.state.data) ||
      (typeof window !== 'undefined' && window.TRAVEL_DATA) ||
      null
    );
  }

  function padPlate(n) {
    const num = Number(n) || 0;
    return num < 10 ? '0' + num : String(num);
  }

  function extractLiveStatsAndProvinces(data) {
    const rawProvinces = (data && data.provinces) || {};
    const provincesList = Object.keys(rawProvinces)
      .map((key) => Object.assign({ key }, rawProvinces[key]))
      .sort((a, b) => (Number(a.plate) || 0) - (Number(b.plate) || 0));

    // Guarantee an 81-item ring even if data is partial
    const ringProvinces = [];
    if (provincesList.length >= 81) {
      for (let i = 0; i < 81; i++) ringProvinces.push(provincesList[i]);
    } else {
      const byPlate = new Map();
      provincesList.forEach((p) => byPlate.set(Number(p.plate), p));
      for (let plate = 1; plate <= 81; plate++) {
        ringProvinces.push(
          byPlate.get(plate) || {
            plate,
            name: `İl ${padPlate(plate)}`,
            visited: plate <= 39
          }
        );
      }
    }

    const stats = (data && data.stats) || {};
    const visitedFromProvinces = ringProvinces.filter((p) => Boolean(p.visited)).length;
    const totalCities = Number(stats.total_cities) || 81;
    const visitedCities =
      stats.visited_cities != null ? Number(stats.visited_cities) : visitedFromProvinces;
    const progressPct =
      stats.progress_pct != null
        ? Number(stats.progress_pct).toFixed(1)
        : ((visitedCities / Math.max(1, totalCities)) * 100).toFixed(1);
    const estimatedKm = stats.estimated_km != null ? Number(stats.estimated_km) : 10898;
    const libraryHours =
      stats.library_hours != null ? Number(stats.library_hours) : visitedCities * 20;
    const visitedRegions = stats.visited_regions != null ? Number(stats.visited_regions) : 6;
    const totalRegions = stats.total_regions != null ? Number(stats.total_regions) : 7;

    let kmFormatted = String(estimatedKm);
    try {
      kmFormatted = estimatedKm.toLocaleString('tr-TR');
    } catch (e) {
      kmFormatted = String(estimatedKm).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    const regionalBreakdown = stats.regional_breakdown || {};
    const quotes = Array.isArray(data && data.quotes) ? data.quotes : [];

    return {
      totalCities,
      visitedCities,
      unvisitedCities: Math.max(0, totalCities - visitedCities),
      progressPct,
      estimatedKm,
      kmFormatted,
      libraryHours,
      visitedRegions,
      totalRegions,
      ringProvinces,
      regionalBreakdown,
      quotes
    };
  }

  // =========================================================================
  // Scoped CSS (Dark Mode & body.light-theme Compatible)
  // =========================================================================

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .ec-root {
        max-width: 1360px;
        margin: 0 auto;
        padding: 4px 0 44px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        animation: ecFadeIn 0.35s ease;
      }

      @keyframes ecFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .ec-hero {
        position: relative;
        border-radius: 20px;
        padding: 24px 28px;
        background:
          radial-gradient(circle at 12% 15%, rgba(245, 197, 94, 0.16) 0%, transparent 45%),
          radial-gradient(circle at 88% 85%, rgba(56, 189, 248, 0.12) 0%, transparent 48%),
          linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(17, 24, 39, 0.88) 100%);
        border: 1.5px solid rgba(245, 197, 94, 0.38);
        box-shadow: 0 18px 40px -12px rgba(0, 0, 0, 0.55);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        overflow: hidden;
      }

      .ec-hero::before {
        content: '';
        position: absolute;
        inset: 8px;
        border: 1px dashed rgba(245, 197, 94, 0.20);
        border-radius: 14px;
        pointer-events: none;
      }

      .ec-hero-left {
        position: relative;
        z-index: 1;
        flex: 1 1 420px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .ec-eyebrow {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #f5c55e;
      }

      .ec-hero-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.3rem, 2.2vw, 1.85rem);
        font-weight: 800;
        line-height: 1.2;
        background: linear-gradient(135deg, #fffbeb 0%, #fde68a 45%, #38bdf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .ec-hero-sub {
        font-size: 0.88rem;
        color: #cbd5e1;
        max-width: 700px;
      }

      .ec-hero-actions {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
      }

      .ec-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: 12px;
        border: 1px solid rgba(253, 230, 138, 0.55);
        background: linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%);
        color: #0f172a;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-weight: 800;
        font-size: 0.9rem;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(245, 158, 11, 0.32);
        transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
      }

      .ec-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(245, 158, 11, 0.45);
        filter: brightness(1.05);
      }

      .ec-btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 11px 16px;
        border-radius: 12px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.16));
        background: rgba(15, 23, 42, 0.72);
        color: #f8fafc;
        font-weight: 600;
        font-size: 0.86rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ec-btn-secondary:hover {
        border-color: rgba(56, 189, 248, 0.55);
        background: rgba(30, 41, 59, 0.9);
      }

      /* Studio Workspace Grid */
      .ec-workspace {
        display: grid;
        grid-template-columns: minmax(320px, 410px) minmax(0, 1fr);
        gap: 20px;
        align-items: start;
      }

      @media (max-width: 1080px) {
        .ec-workspace {
          grid-template-columns: 1fr;
        }
      }

      .ec-panel {
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: 18px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .ec-panel-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .ec-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .ec-field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      @media (max-width: 520px) {
        .ec-field-row {
          grid-template-columns: 1fr;
        }
      }

      .ec-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .ec-input,
      .ec-textarea {
        width: 100%;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(10, 15, 29, 0.65);
        color: var(--text-primary, #f8fafc);
        padding: 10px 12px;
        font-family: var(--font-body, sans-serif);
        font-size: 0.88rem;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .ec-textarea {
        min-height: 82px;
        resize: vertical;
        line-height: 1.45;
      }

      .ec-input:focus,
      .ec-textarea:focus {
        outline: none;
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.16);
      }

      .ec-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 2px;
      }

      .ec-chip {
        font-size: 0.72rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-secondary, #94a3b8);
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .ec-chip:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(245, 197, 94, 0.45);
      }

      .ec-theme-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .ec-theme-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        width: 100%;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1.5px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(10, 15, 29, 0.55);
        color: var(--text-primary, #f8fafc);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
      }

      .ec-theme-btn:hover {
        border-color: rgba(245, 197, 94, 0.45);
      }

      .ec-theme-btn.active {
        border-color: #f5c55e;
        background: rgba(245, 197, 94, 0.12);
        box-shadow: 0 0 0 1px rgba(245, 197, 94, 0.25);
      }

      .ec-swatches {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }

      .ec-swatch {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.35);
      }

      .ec-mini-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .ec-mini-btn {
        flex: 1 1 auto;
        padding: 7px 11px;
        border-radius: 9px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-secondary, #cbd5e1);
        font-size: 0.76rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .ec-mini-btn:hover {
        color: var(--text-primary, #ffffff);
        border-color: var(--accent-cyan, #00f2fe);
      }

      .ec-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 9px 12px;
        border-radius: 10px;
        background: rgba(10, 15, 29, 0.45);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        font-size: 0.82rem;
        color: var(--text-secondary, #cbd5e1);
        cursor: pointer;
      }

      .ec-toggle-row input {
        accent-color: #f59e0b;
        width: 16px;
        height: 16px;
        cursor: pointer;
      }

      /* Live Preview Frame */
      .ec-preview-stage {
        position: relative;
        border-radius: 16px;
        padding: 12px;
        background: radial-gradient(circle at 50% 0%, rgba(245, 197, 94, 0.12), rgba(2, 6, 23, 0.92));
        border: 1px solid rgba(245, 197, 94, 0.28);
        box-shadow: 0 22px 48px -14px rgba(0, 0, 0, 0.7);
      }

      .ec-canvas-wrap {
        position: relative;
        width: 100%;
        border-radius: 10px;
        overflow: hidden;
        background: #050914;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }

      .ec-canvas-el {
        display: block;
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 9;
      }

      .ec-preview-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-top: 10px;
        font-size: 0.78rem;
        color: #94a3b8;
      }

      .ec-badge-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(245, 197, 94, 0.28);
        color: #fde68a;
        font-weight: 600;
        font-size: 0.74rem;
      }

      /* Verified Stats Telemetry Strip */
      .ec-stats-strip {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      @media (max-width: 780px) {
        .ec-stats-strip {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .ec-stat-card {
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(10, 15, 29, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .ec-stat-kicker {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted, #94a3b8);
        font-weight: 700;
      }

      .ec-stat-val {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.96rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .ec-stat-sub {
        font-size: 0.75rem;
        color: var(--accent-cyan, #38bdf8);
      }

      /* Regional Breakdown Pills */
      .ec-regions-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .ec-reg-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.52);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        font-size: 0.75rem;
        color: var(--text-secondary, #cbd5e1);
      }

      /* Fullscreen Preview Modal */
      .ec-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(2, 6, 23, 0.9);
        backdrop-filter: blur(8px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        gap: 14px;
      }

      .ec-modal-inner {
        width: min(1240px, 100%);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .ec-modal-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        color: #f8fafc;
      }

      .ec-modal-canvas {
        width: 100%;
        height: auto;
        border-radius: 12px;
        border: 1px solid rgba(245, 197, 94, 0.45);
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
      }

      /* =====================================================================
         body.light-theme Overrides
         ===================================================================== */
      body.light-theme .ec-hero {
        background:
          radial-gradient(circle at 12% 15%, rgba(217, 119, 6, 0.12) 0%, transparent 45%),
          radial-gradient(circle at 88% 85%, rgba(2, 132, 199, 0.10) 0%, transparent 48%),
          linear-gradient(135deg, #fffdf7 0%, #f8fafc 100%);
        border-color: rgba(217, 119, 6, 0.42);
        box-shadow: 0 14px 32px -10px rgba(15, 23, 42, 0.12);
      }

      body.light-theme .ec-eyebrow {
        color: #b45309;
      }

      body.light-theme .ec-hero-title {
        background: linear-gradient(135deg, #0f172a 0%, #b45309 55%, #0284c7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      body.light-theme .ec-hero-sub {
        color: #334155;
      }

      body.light-theme .ec-btn-secondary {
        background: #ffffff;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.16);
      }

      body.light-theme .ec-btn-secondary:hover {
        background: #f1f5f9;
        border-color: #0284c7;
      }

      body.light-theme .ec-panel {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 10px 25px -8px rgba(15, 23, 42, 0.08);
      }

      body.light-theme .ec-input,
      body.light-theme .ec-textarea,
      body.light-theme .ec-theme-btn,
      body.light-theme .ec-chip,
      body.light-theme .ec-mini-btn,
      body.light-theme .ec-toggle-row,
      body.light-theme .ec-stat-card,
      body.light-theme .ec-reg-pill {
        background: #f8fafc;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .ec-theme-btn.active {
        background: rgba(245, 158, 11, 0.14);
        border-color: #d97706;
      }

      body.light-theme .ec-preview-stage {
        background: linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%);
        border-color: rgba(180, 83, 9, 0.35);
        box-shadow: 0 18px 36px -12px rgba(15, 23, 42, 0.18);
      }

      body.light-theme .ec-preview-meta {
        color: #334155;
      }

      body.light-theme .ec-badge-pill {
        background: #ffffff;
        color: #92400e;
        border-color: rgba(217, 119, 6, 0.35);
      }

      body.light-theme .ec-stat-kicker {
        color: #64748b;
      }

      body.light-theme .ec-stat-sub {
        color: #0284c7;
      }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // Pure-Vector Canvas 2D Helpers
  // =========================================================================

  function canvasRoundRect(c, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + rad, y);
    c.arcTo(x + w, y, x + w, y + h, rad);
    c.arcTo(x + w, y + h, x, y + h, rad);
    c.arcTo(x, y + h, x, y, rad);
    c.arcTo(x, y, x + w, y, rad);
    c.closePath();
  }

  function makeLinearGrad(c, x0, y0, x1, y1, stops) {
    const g = c.createLinearGradient(x0, y0, x1, y1);
    const n = stops.length;
    stops.forEach((col, i) => {
      g.addColorStop(n === 1 ? 0 : i / (n - 1), col);
    });
    return g;
  }

  // Compute point (x, y) & inward normal (nx, ny) along a rounded rectangle
  // starting at top-center (x + w/2, y) moving clockwise.
  function pointOnRoundedRect(x, y, w, h, r, tNorm) {
    const rad = Math.min(r, w / 2, h / 2);
    const topStraight = w - 2 * rad;
    const rightStraight = h - 2 * rad;
    const arcLen = (Math.PI / 2) * rad;
    const halfTop = topStraight / 2;
    const totalPerim = 2 * topStraight + 2 * rightStraight + 4 * arcLen;

    let d = (((tNorm % 1) + 1) % 1) * totalPerim;

    // 1. Top-right half straight
    if (d <= halfTop) {
      return { x: x + w / 2 + d, y, nx: 0, ny: 1 };
    }
    d -= halfTop;

    // 2. Top-right corner arc
    if (d <= arcLen) {
      const a = -Math.PI / 2 + (d / arcLen) * (Math.PI / 2);
      const cx = x + w - rad;
      const cy = y + rad;
      return {
        x: cx + Math.cos(a) * rad,
        y: cy + Math.sin(a) * rad,
        nx: -Math.cos(a),
        ny: -Math.sin(a)
      };
    }
    d -= arcLen;

    // 3. Right straight
    if (d <= rightStraight) {
      return { x: x + w, y: y + rad + d, nx: -1, ny: 0 };
    }
    d -= rightStraight;

    // 4. Bottom-right corner arc
    if (d <= arcLen) {
      const a = (d / arcLen) * (Math.PI / 2);
      const cx = x + w - rad;
      const cy = y + h - rad;
      return {
        x: cx + Math.cos(a) * rad,
        y: cy + Math.sin(a) * rad,
        nx: -Math.cos(a),
        ny: -Math.sin(a)
      };
    }
    d -= arcLen;

    // 5. Bottom straight
    if (d <= topStraight) {
      return { x: x + w - rad - d, y: y + h, nx: 0, ny: -1 };
    }
    d -= topStraight;

    // 6. Bottom-left corner arc
    if (d <= arcLen) {
      const a = Math.PI / 2 + (d / arcLen) * (Math.PI / 2);
      const cx = x + rad;
      const cy = y + h - rad;
      return {
        x: cx + Math.cos(a) * rad,
        y: cy + Math.sin(a) * rad,
        nx: -Math.cos(a),
        ny: -Math.sin(a)
      };
    }
    d -= arcLen;

    // 7. Left straight
    if (d <= rightStraight) {
      return { x, y: y + h - rad - d, nx: 1, ny: 0 };
    }
    d -= rightStraight;

    // 8. Top-left corner arc
    if (d <= arcLen) {
      const a = Math.PI + (d / arcLen) * (Math.PI / 2);
      const cx = x + rad;
      const cy = y + rad;
      return {
        x: cx + Math.cos(a) * rad,
        y: cy + Math.sin(a) * rad,
        nx: -Math.cos(a),
        ny: -Math.sin(a)
      };
    }
    d -= arcLen;

    // 9. Top-left half straight
    return { x: x + rad + d, y, nx: 0, ny: 1 };
  }

  // Draw an 8-pointed miniature Seljuk star (two overlapping squares)
  function drawMiniatureSeljukStar(c, cx, cy, r, visited, theme, plateStr, nx, ny, showPlate) {
    c.save();
    c.translate(cx, cy);

    if (visited) {
      c.shadowColor = theme.starVisitedGlow;
      c.shadowBlur = 10;
    }

    // Build unified 8-pointed star polygon (16 vertices alternating outer/inner)
    c.beginPath();
    for (let i = 0; i < 16; i++) {
      const ang = (i * Math.PI) / 8;
      const rad = i % 2 === 0 ? r : r * 0.56;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();

    if (visited) {
      const grad = c.createRadialGradient(-r * 0.25, -r * 0.25, 1, 0, 0, r);
      grad.addColorStop(0, theme.starVisitedFill[0]);
      grad.addColorStop(0.55, theme.starVisitedFill[1]);
      grad.addColorStop(1, theme.starVisitedFill[2]);
      c.fillStyle = grad;
      c.fill();
      c.lineWidth = 1.25;
      c.strokeStyle = theme.starVisitedStroke;
      c.stroke();

      // Tiny inner core highlight
      c.shadowBlur = 0;
      c.fillStyle = '#ffffff';
      c.globalAlpha = 0.72;
      c.beginPath();
      c.arc(0, 0, r * 0.2, 0, Math.PI * 2);
      c.fill();
      c.globalAlpha = 1;
    } else {
      c.fillStyle = theme.starUnvisitedFill;
      c.fill();
      c.lineWidth = 1;
      c.strokeStyle = theme.starUnvisitedStroke;
      c.stroke();
    }

    c.restore();

    if (showPlate && plateStr) {
      c.save();
      c.font = visited
        ? 'bold 9.5px "Courier New", monospace'
        : '600 8.5px "Courier New", monospace';
      c.fillStyle = visited ? theme.starVisitedText : theme.starUnvisitedText;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      const offset = 18.5;
      c.fillText(plateStr, cx + nx * offset, cy + ny * offset);
      c.restore();
    }
  }

  // Draw the intricate museum-grade Seljuk 8-Pointed Star Golden Seal (Mühür)
  function drawSeljukGoldenSeal(c, cx, cy, r, theme, statsInfo) {
    c.save();
    c.translate(cx, cy);

    // Ambient seal drop shadow
    c.save();
    c.shadowColor = 'rgba(0, 0, 0, 0.52)';
    c.shadowBlur = 24;
    c.shadowOffsetY = 8;
    c.beginPath();
    c.arc(0, 0, r, 0, Math.PI * 2);
    c.fillStyle = theme.sealOuter[2];
    c.fill();
    c.restore();

    // 1. Outer 32-petal scalloped rosette rim
    const teeth = 32;
    c.beginPath();
    for (let i = 0; i <= teeth * 2; i++) {
      const ang = (i * Math.PI) / teeth;
      const rad = i % 2 === 0 ? r + 4 : r - 3;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();

    const rimGrad = c.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r + 5);
    rimGrad.addColorStop(0, theme.sealOuter[0]);
    rimGrad.addColorStop(0.45, theme.sealOuter[1]);
    rimGrad.addColorStop(0.8, theme.sealOuter[2]);
    rimGrad.addColorStop(1, theme.sealOuter[3]);
    c.fillStyle = rimGrad;
    c.fill();
    c.lineWidth = 1.6;
    c.strokeStyle = theme.sealOuter[0];
    c.stroke();

    // 2. Dark inlaid circular ring for curved inscription
    c.beginPath();
    c.arc(0, 0, r * 0.87, 0, Math.PI * 2);
    c.fillStyle = theme.sealInnerBg;
    c.fill();
    c.lineWidth = 1.5;
    c.strokeStyle = theme.sealOuter[1];
    c.stroke();

    // Dashed inner filigree ring
    c.save();
    c.setLineDash([3, 3]);
    c.beginPath();
    c.arc(0, 0, r * 0.69, 0, Math.PI * 2);
    c.strokeStyle = theme.sealOuter[0];
    c.lineWidth = 1.1;
    c.stroke();
    c.restore();

    // 3. Curved perimeter inscription (top & bottom arcs)
    const topLabel = '★ SEFER DER VATAN ★';
    const topSpan = 2.05;
    c.save();
    c.font = 'bold 9.5px "Outfit", "Segoe UI", sans-serif';
    c.fillStyle = theme.sealText;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    for (let i = 0; i < topLabel.length; i++) {
      const a = -topSpan / 2 + i * (topSpan / Math.max(1, topLabel.length - 1));
      c.save();
      c.rotate(a);
      c.translate(0, -r * 0.78);
      c.fillText(topLabel[i], 0, 0);
      c.restore();
    }
    c.restore();

    const botLabel = `HÂFIZ-I ANADOLU • ${statsInfo.visitedCities}/${statsInfo.totalCities}`;
    const botSpan = 2.15;
    // Draw bottom arc left-to-right upright
    c.save();
    c.font = 'bold 8.5px "Outfit", "Segoe UI", sans-serif';
    c.fillStyle = theme.sealOuter[0];
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    for (let i = 0; i < botLabel.length; i++) {
      const a = botSpan / 2 - i * (botSpan / Math.max(1, botLabel.length - 1));
      c.save();
      c.rotate(a);
      c.translate(0, r * 0.78);
      c.fillText(botLabel[i], 0, 0);
      c.restore();
    }
    c.restore();

    // 4. Inner 8-Pointed Seljuk Star (Rub el Hizb) with interlocking metallic bevel
    const starR = r * 0.62;
    const sqSize = starR * 1.42;

    const drawGoldSquare = (angle) => {
      c.save();
      c.rotate(angle);
      c.beginPath();
      c.rect(-sqSize / 2, -sqSize / 2, sqSize, sqSize);
      const sg = c.createLinearGradient(-sqSize / 2, -sqSize / 2, sqSize / 2, sqSize / 2);
      sg.addColorStop(0, theme.sealOuter[0]);
      sg.addColorStop(0.5, theme.sealOuter[1]);
      sg.addColorStop(1, theme.sealOuter[2]);
      c.fillStyle = sg;
      c.globalAlpha = 0.24;
      c.fill();
      c.globalAlpha = 1;
      c.lineWidth = 2.4;
      c.strokeStyle = theme.sealOuter[1];
      c.stroke();

      // Inner bevel square
      const innerSq = sqSize * 0.86;
      c.lineWidth = 1.0;
      c.strokeStyle = theme.sealOuter[0];
      c.strokeRect(-innerSq / 2, -innerSq / 2, innerSq, innerSq);
      c.restore();
    };

    drawGoldSquare(0);
    drawGoldSquare(Math.PI / 4);

    // 5. Central 8-point compass rose star
    c.beginPath();
    for (let i = 0; i < 16; i++) {
      const ang = (i * Math.PI) / 8;
      const rad = i % 2 === 0 ? r * 0.36 : r * 0.16;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    const coreGrad = c.createRadialGradient(0, -4, 2, 0, 0, r * 0.36);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.35, theme.sealOuter[0]);
    coreGrad.addColorStop(0.85, theme.sealOuter[1]);
    coreGrad.addColorStop(1, theme.sealOuter[3]);
    c.fillStyle = coreGrad;
    c.fill();
    c.lineWidth = 1.2;
    c.strokeStyle = theme.sealOuter[0];
    c.stroke();

    // Central medallion disc with "81" seal stamp
    c.beginPath();
    c.arc(0, 0, r * 0.17, 0, Math.PI * 2);
    c.fillStyle = theme.sealInnerBg;
    c.fill();
    c.lineWidth = 1.5;
    c.strokeStyle = theme.sealOuter[0];
    c.stroke();

    c.fillStyle = theme.sealOuter[0];
    c.font = 'bold 13px "Georgia", serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('81', 0, 1);

    c.restore();
  }

  // Draw crisp vector icon inside each stat card (no OS emoji font quirks)
  function drawVectorStatIcon(c, kind, cx, cy, color) {
    c.save();
    c.translate(cx, cy);
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = 2.2;
    c.lineCap = 'round';
    c.lineJoin = 'round';

    if (kind === 'compass') {
      c.beginPath();
      c.arc(0, 0, 14, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.moveTo(0, -10);
      c.lineTo(4, 0);
      c.lineTo(0, 10);
      c.lineTo(-4, 0);
      c.closePath();
      c.fill();
    } else if (kind === 'route') {
      c.beginPath();
      c.arc(-8, 7, 3.2, 0, Math.PI * 2);
      c.arc(8, -7, 3.2, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.moveTo(-6, 5);
      c.bezierCurveTo(-6, -6, 6, 6, 6, -5);
      c.stroke();
    } else if (kind === 'book') {
      c.beginPath();
      c.moveTo(0, -7);
      c.quadraticCurveTo(-8, -11, -14, -7);
      c.lineTo(-14, 9);
      c.quadraticCurveTo(-8, 5, 0, 9);
      c.quadraticCurveTo(8, 5, 14, 9);
      c.lineTo(14, -7);
      c.quadraticCurveTo(8, -11, 0, -7);
      c.stroke();
      c.beginPath();
      c.moveTo(0, -7);
      c.lineTo(0, 9);
      c.stroke();
    } else if (kind === 'regions') {
      c.beginPath();
      c.moveTo(-13, 9);
      c.lineTo(-4, -7);
      c.lineTo(3, 4);
      c.lineTo(7, -2);
      c.lineTo(14, 9);
      c.closePath();
      c.stroke();
      c.beginPath();
      c.arc(8, -9, 2.8, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }

  function wrapLines(c, text, maxWidth) {
    const words = String(text || '').trim().split(/\s+/);
    const lines = [];
    let current = '';
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const test = current ? `${current} ${w}` : w;
      if (c.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = w;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function drawCornerOrnament(c, x, y, sx, sy, color) {
    c.save();
    c.translate(x, y);
    c.scale(sx, sy);
    c.strokeStyle = color;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, 26);
    c.lineTo(0, 0);
    c.lineTo(26, 0);
    c.stroke();

    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(6, 20);
    c.lineTo(6, 6);
    c.lineTo(20, 6);
    c.stroke();

    c.fillStyle = color;
    c.beginPath();
    c.arc(6, 6, 3, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  // =========================================================================
  // Master 1920×1080 Museum Certificate Canvas Renderer
  // =========================================================================

  function drawCertificateCanvas(canvas, config, statsInfo) {
    if (!canvas) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const c = canvas.getContext('2d');
    if (!c) return;

    const theme = THEMES[config.theme] || THEMES.seljuk;

    // 1. Background Base Gradient + Ambient Glows
    c.fillStyle = makeLinearGrad(c, 0, 0, CANVAS_W, CANVAS_H, theme.bgStops);
    c.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const g1 = c.createRadialGradient(CANVAS_W * 0.25, CANVAS_H * 0.2, 20, CANVAS_W * 0.25, CANVAS_H * 0.2, 760);
    g1.addColorStop(0, theme.glowPrimary);
    g1.addColorStop(1, 'transparent');
    c.fillStyle = g1;
    c.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const g2 = c.createRadialGradient(CANVAS_W * 0.78, CANVAS_H * 0.82, 20, CANVAS_W * 0.78, CANVAS_H * 0.82, 720);
    g2.addColorStop(0, theme.glowSecondary);
    g2.addColorStop(1, 'transparent');
    c.fillStyle = g2;
    c.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 2. Subtle Sacred Geometry Lattice Background + Central Watermark Star
    c.save();
    c.strokeStyle = theme.patternColor;
    c.lineWidth = 1;
    const step = 96;
    for (let gx = -step; gx <= CANVAS_W + step; gx += step) {
      for (let gy = -step; gy <= CANVAS_H + step; gy += step) {
        c.beginPath();
        c.moveTo(gx, gy - 26);
        c.lineTo(gx + 26, gy);
        c.lineTo(gx, gy + 26);
        c.lineTo(gx - 26, gy);
        c.closePath();
        c.stroke();
      }
    }
    c.restore();

    // Central grand subtle watermark compass star
    c.save();
    c.translate(CANVAS_W / 2, CANVAS_H / 2 + 12);
    c.strokeStyle = theme.watermarkColor;
    c.lineWidth = 2.5;
    c.beginPath();
    c.arc(0, 0, 320, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(0, 0, 260, 0, Math.PI * 2);
    c.stroke();
    const wSq = 360;
    c.strokeRect(-wSq / 2, -wSq / 2, wSq, wSq);
    c.rotate(Math.PI / 4);
    c.strokeRect(-wSq / 2, -wSq / 2, wSq, wSq);
    c.restore();

    // 3. Outer & Inner Museum Frames
    canvasRoundRect(c, 22, 20, CANVAS_W - 44, CANVAS_H - 40, 20);
    c.strokeStyle = theme.borderOuter;
    c.lineWidth = 3;
    c.stroke();

    canvasRoundRect(c, 32, 30, CANVAS_W - 64, CANVAS_H - 60, 15);
    c.strokeStyle = theme.borderInner;
    c.lineWidth = 1.2;
    c.stroke();

    // Inner certificate enclosure (leaves dedicated channel for 81-star ring)
    canvasRoundRect(c, 118, 114, CANVAS_W - 236, CANVAS_H - 228, 16);
    c.strokeStyle = theme.borderInner;
    c.lineWidth = 2;
    c.stroke();

    canvasRoundRect(c, 128, 124, CANVAS_W - 256, CANVAS_H - 248, 11);
    c.strokeStyle = theme.borderHairline;
    c.lineWidth = 1;
    c.stroke();

    // Four Corner Brackets
    drawCornerOrnament(c, 24, 22, 1, 1, theme.borderOuter);
    drawCornerOrnament(c, CANVAS_W - 24, 22, -1, 1, theme.borderOuter);
    drawCornerOrnament(c, CANVAS_W - 24, CANVAS_H - 22, -1, -1, theme.borderOuter);
    drawCornerOrnament(c, 24, CANVAS_H - 22, 1, -1, theme.borderOuter);

    // 4. 81-Province Miniature Star Ring around the Border
    const ringX = 68;
    const ringY = 64;
    const ringW = CANVAS_W - 136; // 1784
    const ringH = CANVAS_H - 128; // 952
    const ringR = 36;

    // Connecting hairline ring filament
    c.save();
    canvasRoundRect(c, ringX, ringY, ringW, ringH, ringR);
    c.strokeStyle = theme.ringLine;
    c.lineWidth = 1.2;
    c.stroke();
    c.restore();

    const provinces = statsInfo.ringProvinces;
    for (let i = 0; i < 81; i++) {
      const prov = provinces[i] || { plate: i + 1, visited: false };
      const pt = pointOnRoundedRect(ringX, ringY, ringW, ringH, ringR, i / 81);
      const plateLabel = padPlate(prov.plate || i + 1);
      drawMiniatureSeljukStar(
        c,
        pt.x,
        pt.y,
        prov.visited ? 10.2 : 8.2,
        Boolean(prov.visited),
        theme,
        plateLabel,
        pt.nx,
        pt.ny,
        config.showRingPlates !== false
      );
    }

    // 5. Ceremonial Top Header Zone
    const centerX = CANVAS_W / 2;

    c.save();
    c.textAlign = 'center';
    c.fillStyle = theme.eyebrowColor;
    c.font = 'bold 15px "Outfit", "Segoe UI", sans-serif';
    c.fillText('T.C. ANADOLU SEYAHATNAMESİ  •  DİJİTAL SEYYAH DİVANI  •  81 İL MİRAS KAYDI', centerX, 168);

    // Main Berat Title
    const titleGrad = makeLinearGrad(c, centerX - 420, 185, centerX + 420, 235, theme.titleGrad);
    c.fillStyle = titleGrad;
    c.font = '800 54px "Georgia", "Times New Roman", serif';
    c.fillText('SEFER DER VATAN BERATI', centerX, 224);

    // Subtitle Ribbon Pill
    const pillW = 540;
    const pillH = 34;
    canvasRoundRect(c, centerX - pillW / 2, 242, pillW, pillH, 17);
    c.fillStyle = theme.subtitleBg;
    c.fill();
    c.strokeStyle = theme.subtitleBorder;
    c.lineWidth = 1.2;
    c.stroke();

    c.fillStyle = theme.subtitleText;
    c.font = 'bold 14.5px "Outfit", "Segoe UI", sans-serif';
    c.fillText('HÂFIZ-I ANADOLU  •  RESMÎ KEŞİF & İLİM İCAZETNAMESİ', centerX, 264);

    // Ornamental divider line with center star knot
    c.strokeStyle = theme.borderInner;
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(centerX - 360, 294);
    c.lineTo(centerX - 24, 294);
    c.moveTo(centerX + 24, 294);
    c.lineTo(centerX + 360, 294);
    c.stroke();

    c.fillStyle = theme.borderOuter;
    c.beginPath();
    c.moveTo(centerX, 284);
    c.lineTo(centerX + 10, 294);
    c.lineTo(centerX, 304);
    c.lineTo(centerX - 10, 294);
    c.closePath();
    c.fill();
    c.restore();

    // 6. Seyyah Identity Block
    c.save();
    c.textAlign = 'center';
    c.fillStyle = theme.preambleColor;
    c.font = 'italic 18px "Georgia", "Times New Roman", serif';
    c.fillText(
      'İşbu berat, Anadolu coğrafyasının şehir hafızasını, ilim ocaklarını ve irfan mirasını bizzat ziyaret ederek tefekkür eden',
      centerX,
      332
    );

    const travelerName = (config.travelerName || DEFAULT_CONFIG.travelerName).trim();
    let nameFontSize = 58;
    c.font = `800 ${nameFontSize}px "Georgia", "Times New Roman", serif`;
    while (c.measureText(travelerName).width > 1280 && nameFontSize > 32) {
      nameFontSize -= 2;
      c.font = `800 ${nameFontSize}px "Georgia", "Times New Roman", serif`;
    }

    c.shadowColor = 'rgba(0, 0, 0, 0.28)';
    c.shadowBlur = 12;
    c.fillStyle = makeLinearGrad(c, centerX - 380, 355, centerX + 380, 405, theme.nameGrad);
    c.fillText(travelerName, centerX, 398);
    c.shadowBlur = 0;

    const travelerTitle = (config.travelerTitle || DEFAULT_CONFIG.travelerTitle).trim();
    c.fillStyle = theme.rankColor;
    c.font = '700 22px "Outfit", "Plus Jakarta Sans", "Segoe UI", sans-serif';
    c.fillText(`✦   ${travelerTitle}   ✦`, centerX, 440);

    // Subtle underline flourish
    c.strokeStyle = theme.borderHairline;
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(centerX - 240, 458);
    c.lineTo(centerX + 240, 458);
    c.stroke();
    c.restore();

    // 7. Live Verified Expedition Stats Cards (4 Cards)
    const cardsY = 480;
    const cardW = 374;
    const cardH = 136;
    const cardGap = 28;
    const cardsStartX = centerX - (4 * cardW + 3 * cardGap) / 2;

    const statCards = [
      {
        icon: 'compass',
        label: 'İL KEŞİF KAPSAMI',
        value: `${statsInfo.visitedCities} / ${statsInfo.totalCities} İl (%${statsInfo.progressPct})`,
        sub: `${statsInfo.unvisitedCities} Müstakbel Vilayet`,
        progress: Math.min(1, Math.max(0, statsInfo.visitedCities / Math.max(1, statsInfo.totalCities)))
      },
      {
        icon: 'route',
        label: 'TOPLAM SEFER MESAFESİ',
        value: `${statsInfo.kmFormatted} km`,
        sub: 'Karayolu Menzili'
      },
      {
        icon: 'book',
        label: 'İLİM & KÜTÜPHANE MESAİSİ',
        value: `${statsInfo.visitedCities} İl Halk Kütüphanesi`,
        sub: `${statsInfo.libraryHours} Saat İlim Mesaisi`
      },
      {
        icon: 'regions',
        label: 'COĞRAFİ HÂKİMİYET',
        value: `${statsInfo.visitedRegions} / ${statsInfo.totalRegions} Coğrafi Bölge`,
        sub: 'Anadolu Bölge Tescili'
      }
    ];

    statCards.forEach((card, idx) => {
      const cx = cardsStartX + idx * (cardW + cardGap);
      c.save();
      canvasRoundRect(c, cx, cardsY, cardW, cardH, 14);
      c.fillStyle = theme.cardBg;
      c.fill();
      c.strokeStyle = theme.cardBorder;
      c.lineWidth = 1.5;
      c.stroke();

      // Top accent line
      canvasRoundRect(c, cx + 18, cardsY, cardW - 36, 3.5, 2);
      c.fillStyle = theme.cardAccent;
      c.fill();

      // Vector Icon Circle
      c.beginPath();
      c.arc(cx + 38, cardsY + 42, 20, 0, Math.PI * 2);
      c.fillStyle = theme.subtitleBg;
      c.fill();
      drawVectorStatIcon(c, card.icon, cx + 38, cardsY + 42, theme.cardAccent);

      // Text
      c.textAlign = 'left';
      c.fillStyle = theme.cardLabel;
      c.font = 'bold 12.5px "Outfit", "Segoe UI", sans-serif';
      c.fillText(card.label, cx + 70, cardsY + 34);

      c.fillStyle = theme.cardValue;
      let valSize = 23;
      c.font = `800 ${valSize}px "Outfit", "Segoe UI", sans-serif`;
      while (c.measureText(card.value).width > cardW - 86 && valSize > 16) {
        valSize -= 1;
        c.font = `800 ${valSize}px "Outfit", "Segoe UI", sans-serif`;
      }
      c.fillText(card.value, cx + 70, cardsY + 66);

      c.fillStyle = theme.cardSub;
      c.font = '600 14.5px "Plus Jakarta Sans", "Segoe UI", sans-serif';
      c.fillText(card.sub, cx + 70, cardsY + 95);

      if (typeof card.progress === 'number') {
        const barX = cx + 22;
        const barY = cardsY + 114;
        const barW = cardW - 44;
        canvasRoundRect(c, barX, barY, barW, 6, 3);
        c.fillStyle = theme.borderHairline;
        c.fill();
        canvasRoundRect(c, barX, barY, Math.max(10, barW * card.progress), 6, 3);
        c.fillStyle = theme.cardAccent;
        c.fill();
      }
      c.restore();
    });

    // 8. Günün Hikmeti / İthaf Metni Cartouche
    const quoteBoxW = 1480;
    const quoteBoxH = 104;
    const quoteBoxX = centerX - quoteBoxW / 2;
    const quoteBoxY = 638;

    c.save();
    canvasRoundRect(c, quoteBoxX, quoteBoxY, quoteBoxW, quoteBoxH, 14);
    c.fillStyle = theme.quoteBg;
    c.fill();
    c.strokeStyle = theme.quoteBorder;
    c.lineWidth = 1.4;
    c.stroke();

    // Top Cartouche Label
    c.fillStyle = theme.cardAccent;
    c.font = 'bold 12px "Outfit", "Segoe UI", sans-serif';
    c.textAlign = 'center';
    c.fillText('✦   GÜNÜN HİKMETİ & İTHAF METNİ   ✦', centerX, quoteBoxY + 23);

    const quoteRaw = (config.dedication || DEFAULT_CONFIG.dedication).trim();
    const quoteText = `« ${quoteRaw} »`;
    c.fillStyle = theme.quoteText;
    let qFontSize = 19;
    c.font = `italic ${qFontSize}px "Georgia", "Times New Roman", serif`;
    let qLines = wrapLines(c, quoteText, quoteBoxW - 110);
    if (qLines.length > 2) {
      qFontSize = 17;
      c.font = `italic ${qFontSize}px "Georgia", "Times New Roman", serif`;
      qLines = wrapLines(c, quoteText, quoteBoxW - 90);
    }
    if (qLines.length > 3) {
      qLines = qLines.slice(0, 3);
      qLines[2] = qLines[2].replace(/\s+\S*$/, '') + '… »';
    }

    const lineHeight = qFontSize + 7;
    const totalTextH = qLines.length * lineHeight;
    const textStartY = quoteBoxY + 58 - ((totalTextH - lineHeight) / 2);
    qLines.forEach((line, idx) => {
      c.fillText(line, centerX, textStartY + idx * lineHeight);
    });
    c.restore();

    // 9. Bottom Verification, Signature & Seljuk Golden Seal Zone
    const footY = 774;

    // Left: Verification Metadata Block
    c.save();
    c.textAlign = 'left';
    const metaX = 172;
    const rows = [
      ['BERAT SERİ NO', (config.serialNo || DEFAULT_CONFIG.serialNo).trim()],
      ['TANZİM TARİHİ', (config.issueDate || formatTodayTR()).trim()],
      ['MÜHÜR HALKASI', `${statsInfo.visitedCities} Mühürlü Altın Yıldız • ${statsInfo.unvisitedCities} Müstakbel`],
      ['KAYIT MERKEZİ', 'Anadolu Seyahatnamesi • Dijital Seyyah']
    ];
    rows.forEach((r, idx) => {
      const ry = footY + 22 + idx * 30;
      c.fillStyle = theme.metaLabel;
      c.font = 'bold 12px "Outfit", "Segoe UI", sans-serif';
      c.fillText(r[0] + ':', metaX, ry);
      c.fillStyle = theme.metaValue;
      c.font = '700 14px "Courier New", monospace';
      c.fillText(r[1], metaX + 148, ry);
    });
    c.restore();

    // Center: Signature & Tasdik Calligraphic Block
    c.save();
    c.textAlign = 'center';
    const sigX = centerX - 30;

    // Calligraphic signature flourish curve
    c.strokeStyle = theme.cardAccent;
    c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(sigX - 95, footY + 58);
    c.bezierCurveTo(sigX - 55, footY + 22, sigX - 15, footY + 75, sigX + 25, footY + 38);
    c.bezierCurveTo(sigX + 55, footY + 14, sigX + 75, footY + 62, sigX + 110, footY + 46);
    c.stroke();

    c.strokeStyle = theme.borderInner;
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(sigX - 150, footY + 78);
    c.lineTo(sigX + 150, footY + 78);
    c.stroke();

    c.fillStyle = theme.metaValue;
    c.font = 'bold 15px "Georgia", serif';
    c.fillText('Anadolu Seyahatnamesi Divanı', sigX, footY + 101);
    c.fillStyle = theme.metaLabel;
    c.font = '600 12.5px "Outfit", "Segoe UI", sans-serif';
    c.fillText('Hâfız-ı Anadolu Resmî Tescil & İcazet Makamı', sigX, footY + 122);
    c.restore();

    // Right: Intricate Seljuk 8-Pointed Star Golden Seal (Mühür)
    drawSeljukGoldenSeal(c, CANVAS_W - 315, footY + 72, 92, theme, statsInfo);
  }

  // =========================================================================
  // Download & Modal Helpers
  // =========================================================================

  function computeVerificationCode(config, statsInfo) {
    const raw = [
      (config.serialNo || DEFAULT_CONFIG.serialNo).trim(),
      (config.travelerName || DEFAULT_CONFIG.travelerName).trim(),
      String(statsInfo.visitedCities),
      String(statsInfo.totalCities),
      (config.issueDate || formatTodayTR()).trim()
    ].join('|');
    let hash = 2166136261;
    for (let i = 0; i < raw.length; i++) {
      hash ^= raw.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
    return `SDV-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
  }

  function copyCertificateVerification(config, statsInfo, ctx) {
    const code = computeVerificationCode(config, statsInfo);
    const summaryText = [
      '📜 ANADOLU SEYAHATNAMESİ — SEFER DER VATAN BERATI DOĞRULAMA ÖZETİ',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `👤 Seyyah: ${(config.travelerName || DEFAULT_CONFIG.travelerName).trim()}`,
      `🎖️ Unvan: ${(config.travelerTitle || DEFAULT_CONFIG.travelerTitle).trim()}`,
      `🔖 Berat Seri No: ${(config.serialNo || DEFAULT_CONFIG.serialNo).trim()}`,
      `🔐 Doğrulama Kodu: ${code}`,
      `📅 Tanzim Tarihi: ${(config.issueDate || formatTodayTR()).trim()}`,
      `🇹🇷 İl Keşfi: ${statsInfo.visitedCities} / ${statsInfo.totalCities} İl (%${statsInfo.progressPct})`,
      `🛣️ Sefer Menzili: ~${statsInfo.kmFormatted} km`,
      `📚 Kütüphane Mesaisi: ${statsInfo.libraryHours} saat (${statsInfo.visitedCities} İl Halk Kütüphanesi)`,
      `🌍 Bölge Kapsamı: ${statsInfo.visitedRegions} / ${statsInfo.totalRegions} Coğrafi Bölge`
    ].join('\n');

    const onSuccess = () => {
      notifyToast(ctx, `📋 Berat Doğrulama Kodu (${code}) ve özet panoya kopyalandı!`);
    };

    if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(summaryText).then(onSuccess).catch(() => {
        fallbackCopyText(summaryText, onSuccess, ctx);
      });
    } else {
      fallbackCopyText(summaryText, onSuccess, ctx);
    }
  }

  function fallbackCopyText(text, onSuccess, ctx) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onSuccess();
    } catch (e) {
      notifyToast(ctx, 'Panoya kopyalama tarayıcı tarafından engellendi.');
    }
  }

  function downloadCertificatePng(config, statsInfo, ctx) {
    try {
      const offscreen = document.createElement('canvas');
      drawCertificateCanvas(offscreen, config, statsInfo);
      const dataUrl = offscreen.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = DOWNLOAD_FILENAME;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      notifyToast(ctx, `📜 1920×1080 HD Berat "${DOWNLOAD_FILENAME}" olarak indirildi!`);
    } catch (err) {
      notifyToast(ctx, 'Berat PNG oluşturulurken bir hata oluştu.');
      if (typeof console !== 'undefined' && console.error) {
        console.error('[expedition-certificate] PNG export error:', err);
      }
    }
  }

  function closeFullscreenModal() {
    if (fullscreenModalEl && fullscreenModalEl.parentNode) {
      fullscreenModalEl.parentNode.removeChild(fullscreenModalEl);
    }
    fullscreenModalEl = null;
  }

  function openFullscreenModal(config, statsInfo, ctx) {
    closeFullscreenModal();
    const modal = document.createElement('div');
    modal.className = 'ec-modal-backdrop';

    const inner = document.createElement('div');
    inner.className = 'ec-modal-inner';

    const bar = document.createElement('div');
    bar.className = 'ec-modal-bar';
    bar.innerHTML = `
      <div style="font-weight:700;font-size:0.98rem;">📜 1920×1080 Müze Kalitesi Berat Önizleme</div>
      <div style="display:flex;gap:10px;align-items:center;">
        <button type="button" class="ec-btn-primary" data-ec-modal-dl>📥 1920×1080 HD Beratı İndir (PNG)</button>
        <button type="button" class="ec-btn-secondary" data-ec-modal-close>✕ Kapat</button>
      </div>
    `;

    const modalCanvas = document.createElement('canvas');
    modalCanvas.className = 'ec-modal-canvas';
    drawCertificateCanvas(modalCanvas, config, statsInfo);

    inner.appendChild(bar);
    inner.appendChild(modalCanvas);
    modal.appendChild(inner);

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-ec-modal-close]')) {
        closeFullscreenModal();
      } else if (e.target.closest('[data-ec-modal-dl]')) {
        downloadCertificatePng(config, statsInfo, ctx);
      }
    });

    document.body.appendChild(modal);
    fullscreenModalEl = modal;
  }

  // =========================================================================
  // Main Studio Render Entry: render(container, ctx)
  // =========================================================================

  function render(container, ctx) {
    if (!container) return;
    injectStyles();
    closeFullscreenModal();

    const data = getAppData(ctx);
    const statsInfo = extractLiveStatsAndProvinces(data);

    const regEntries = Object.keys(statsInfo.regionalBreakdown).map((k) => {
      const r = statsInfo.regionalBreakdown[k];
      return {
        name: (r.name || k).replace(' Bölgesi', ''),
        icon: r.icon || '📍',
        visited: r.visited != null ? r.visited : 0,
        total: r.total != null ? r.total : 0,
        color: r.color || '#38bdf8'
      };
    });

    const themeButtonsHtml = Object.keys(THEMES)
      .map((key) => {
        const t = THEMES[key];
        const activeClass = studioState.theme === key ? 'active' : '';
        const swatchesHtml = t.swatches
          .map((col) => `<span class="ec-swatch" style="background:${safeEscape(col, ctx)};"></span>`)
          .join('');
        return `
          <button type="button" class="ec-theme-btn ${activeClass}" data-ec-theme="${safeEscape(key, ctx)}">
            <span>${safeEscape(t.label, ctx)}</span>
            <span class="ec-swatches">${swatchesHtml}</span>
          </button>
        `;
      })
      .join('');

    const titleChipsHtml = TITLE_PRESETS.map(
      (preset) =>
        `<button type="button" class="ec-chip" data-ec-title-preset="${safeEscape(preset, ctx)}">${safeEscape(preset, ctx)}</button>`
    ).join('');

    const regionPillsHtml = regEntries
      .map(
        (r) => `
          <span class="ec-reg-pill">
            <span>${safeEscape(r.icon, ctx)}</span>
            <span>${safeEscape(r.name, ctx)}:</span>
            <strong style="color:${safeEscape(r.color, ctx)}">${r.visited}/${r.total}</strong>
          </span>
        `
      )
      .join('');

    container.innerHTML = `
      <div class="ec-root">
        <section class="ec-hero">
          <div class="ec-hero-left">
            <span class="ec-eyebrow">SEFER DİVANI • HÂFIZ-I ANADOLU SERTİFİKA STÜDYOSU</span>
            <h2 class="ec-hero-title">📜 Sefer Der Vatan Beratı &amp; Hâfız-ı Anadolu Sertifika Stüdyosu</h2>
            <p class="ec-hero-sub">
              Canlı sefer verilerinizden beslenen 81 il minyatür yıldız halkalı, Selçuklu 8 köşeli altın mühürlü ve
              <strong>1920×1080 High-DPI</strong> müze kalitesinde resmî keşif beratınızı tasarlayın ve indirin.
            </p>
          </div>
          <div class="ec-hero-actions">
            <button type="button" class="ec-btn-secondary" id="ec-btn-copy-verify">
              📋 Berat Doğrulama Kodu &amp; Özeti Kopyala
            </button>
            <button type="button" class="ec-btn-secondary" id="ec-btn-fullscreen">
              🔍 Tam Ekran Önizle
            </button>
            <button type="button" class="ec-btn-primary" id="ec-btn-download-top">
              📥 1920×1080 HD Beratı İndir (PNG)
            </button>
          </div>
        </section>

        <div class="ec-workspace">
          <!-- Left Studio Customizer -->
          <aside class="ec-panel">
            <div class="ec-panel-title">
              <span>🖋️ Berat Özelleştirme</span>
              <span style="font-size:0.74rem;color:var(--text-muted,#94a3b8);font-weight:600;">Canlı Önizleme</span>
            </div>

            <div class="ec-field">
              <label class="ec-label" for="ec-input-name">Seyyah Adı</label>
              <input
                type="text"
                id="ec-input-name"
                class="ec-input"
                maxlength="64"
                value="${safeEscape(studioState.travelerName, ctx)}"
                placeholder="Örn: Bahattin Yunus Çetin"
              />
            </div>

            <div class="ec-field">
              <label class="ec-label" for="ec-input-title">Unvan / Mahlas</label>
              <input
                type="text"
                id="ec-input-title"
                class="ec-input"
                maxlength="72"
                value="${safeEscape(studioState.travelerTitle, ctx)}"
                placeholder="Örn: Dijital Seyyah • Anadolu Kâşifi"
              />
              <div class="ec-chips">${titleChipsHtml}</div>
            </div>

            <div class="ec-field">
              <span class="ec-label">Berat Teması</span>
              <div class="ec-theme-grid" id="ec-theme-grid">
                ${themeButtonsHtml}
              </div>
            </div>

            <div class="ec-field">
              <label class="ec-label" for="ec-input-dedication">
                <span>Günün Hikmeti / İthaf Metni</span>
              </label>
              <textarea
                id="ec-input-dedication"
                class="ec-textarea"
                maxlength="240"
                placeholder="İthaf veya hikmet sözü yazın..."
              >${safeEscape(studioState.dedication, ctx)}</textarea>
              <div class="ec-mini-actions">
                <button type="button" class="ec-mini-btn" id="ec-btn-random-hikmet">🎲 Rastgele Hikmet</button>
                <button type="button" class="ec-mini-btn" id="ec-btn-reset">↺ Varsayılana Dön</button>
              </div>
            </div>

            <div class="ec-field-row">
              <div class="ec-field">
                <label class="ec-label" for="ec-input-serial">Berat Seri No</label>
                <input
                  type="text"
                  id="ec-input-serial"
                  class="ec-input"
                  maxlength="24"
                  value="${safeEscape(studioState.serialNo, ctx)}"
                />
              </div>
              <div class="ec-field">
                <label class="ec-label" for="ec-input-date">Tanzim Tarihi</label>
                <input
                  type="text"
                  id="ec-input-date"
                  class="ec-input"
                  maxlength="20"
                  value="${safeEscape(studioState.issueDate, ctx)}"
                />
              </div>
            </div>

            <label class="ec-toggle-row" for="ec-toggle-plates">
              <span>81 İl Yıldız Halkasında Plaka Kodlarını Göster (01–81)</span>
              <input type="checkbox" id="ec-toggle-plates" ${studioState.showRingPlates ? 'checked' : ''} />
            </label>

            <button type="button" class="ec-btn-primary" id="ec-btn-download-side" style="justify-content:center;width:100%;">
              📥 1920×1080 HD Beratı İndir (PNG)
            </button>
          </aside>

          <!-- Right Live Interactive Canvas Stage + Verified Stats -->
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div class="ec-preview-stage">
              <div class="ec-canvas-wrap">
                <canvas id="ec-live-canvas" class="ec-canvas-el" width="1920" height="1080"></canvas>
              </div>
              <div class="ec-preview-meta">
                <span class="ec-badge-pill">✦ 1920 × 1080 px • High-DPI Vektör Canvas</span>
                <span>
                  81 İl Halkası: <strong>${statsInfo.visitedCities}</strong> Mühürlü Yıldız •
                  <strong>${statsInfo.unvisitedCities}</strong> Müstakbel Yıldız
                </span>
              </div>
            </div>

            <div class="ec-panel" style="gap:12px;">
              <div class="ec-panel-title">
                <span>📊 Berata İşlenen Doğrulanmış Canlı Sefer Verileri</span>
                <span style="font-size:0.75rem;color:var(--accent-emerald,#10b981);font-weight:700;">● Canlı Senkron</span>
              </div>
              <div class="ec-stats-strip">
                <div class="ec-stat-card">
                  <span class="ec-stat-kicker">İl Keşfi</span>
                  <span class="ec-stat-val">${statsInfo.visitedCities} / ${statsInfo.totalCities} İl (%${statsInfo.progressPct})</span>
                  <span class="ec-stat-sub">81 İl Halka Kaydı</span>
                </div>
                <div class="ec-stat-card">
                  <span class="ec-stat-kicker">Sefer Menzili</span>
                  <span class="ec-stat-val">${statsInfo.kmFormatted} km</span>
                  <span class="ec-stat-sub">Karayolu Menzili</span>
                </div>
                <div class="ec-stat-card">
                  <span class="ec-stat-kicker">İlim Mesaisi</span>
                  <span class="ec-stat-val">${statsInfo.visitedCities} İl Halk Kütüphanesi</span>
                  <span class="ec-stat-sub">${statsInfo.libraryHours} Saat İlim Mesaisi</span>
                </div>
                <div class="ec-stat-card">
                  <span class="ec-stat-kicker">Coğrafi Kapsam</span>
                  <span class="ec-stat-val">${statsInfo.visitedRegions} / ${statsInfo.totalRegions} Coğrafi Bölge</span>
                  <span class="ec-stat-sub">Anadolu Bölge Tescili</span>
                </div>
              </div>
              ${regEntries.length ? `<div class="ec-regions-bar">${regionPillsHtml}</div>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#ec-live-canvas');
    const nameInput = container.querySelector('#ec-input-name');
    const titleInput = container.querySelector('#ec-input-title');
    const dedicationInput = container.querySelector('#ec-input-dedication');
    const serialInput = container.querySelector('#ec-input-serial');
    const dateInput = container.querySelector('#ec-input-date');
    const platesToggle = container.querySelector('#ec-toggle-plates');
    const themeGrid = container.querySelector('#ec-theme-grid');

    function scheduleRedraw() {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        drawCertificateCanvas(canvas, studioState, statsInfo);
      });
    }

    drawCertificateCanvas(canvas, studioState, statsInfo);

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        studioState.travelerName = nameInput.value;
        saveState();
        scheduleRedraw();
      });
    }

    if (titleInput) {
      titleInput.addEventListener('input', () => {
        studioState.travelerTitle = titleInput.value;
        saveState();
        scheduleRedraw();
      });
    }

    if (dedicationInput) {
      dedicationInput.addEventListener('input', () => {
        studioState.dedication = dedicationInput.value;
        saveState();
        scheduleRedraw();
      });
    }

    if (serialInput) {
      serialInput.addEventListener('input', () => {
        studioState.serialNo = serialInput.value;
        saveState();
        scheduleRedraw();
      });
    }

    if (dateInput) {
      dateInput.addEventListener('input', () => {
        studioState.issueDate = dateInput.value;
        saveState();
        scheduleRedraw();
      });
    }

    if (platesToggle) {
      platesToggle.addEventListener('change', () => {
        studioState.showRingPlates = Boolean(platesToggle.checked);
        saveState();
        scheduleRedraw();
      });
    }

    if (themeGrid) {
      themeGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-ec-theme]');
        if (!btn) return;
        const nextTheme = btn.getAttribute('data-ec-theme');
        if (!THEMES[nextTheme]) return;
        studioState.theme = nextTheme;
        saveState();
        themeGrid.querySelectorAll('.ec-theme-btn').forEach((el) => {
          el.classList.toggle('active', el === btn);
        });
        scheduleRedraw();
      });
    }

    container.querySelectorAll('[data-ec-title-preset]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-ec-title-preset') || '';
        studioState.travelerTitle = val;
        if (titleInput) titleInput.value = val;
        saveState();
        scheduleRedraw();
      });
    });

    const randomHikmetBtn = container.querySelector('#ec-btn-random-hikmet');
    if (randomHikmetBtn) {
      randomHikmetBtn.addEventListener('click', () => {
        const pool = CURATED_HIKMETS.slice();
        statsInfo.quotes.forEach((q) => {
          if (q && q.quote) {
            pool.push(q.author ? `${q.quote} — ${q.author}` : q.quote);
          }
        });
        const filtered = pool.filter((item) => item !== studioState.dedication);
        const choices = filtered.length ? filtered : pool;
        const picked = choices[Math.floor(Math.random() * choices.length)] || DEFAULT_CONFIG.dedication;
        studioState.dedication = picked;
        if (dedicationInput) dedicationInput.value = picked;
        saveState();
        scheduleRedraw();
        notifyToast(ctx, '✨ Yeni hikmet sözü berata işlendi.');
      });
    }

    const resetBtn = container.querySelector('#ec-btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        studioState = Object.assign({}, DEFAULT_CONFIG, { issueDate: formatTodayTR() });
        saveState();
        if (nameInput) nameInput.value = studioState.travelerName;
        if (titleInput) titleInput.value = studioState.travelerTitle;
        if (dedicationInput) dedicationInput.value = studioState.dedication;
        if (serialInput) serialInput.value = studioState.serialNo;
        if (dateInput) dateInput.value = studioState.issueDate;
        if (platesToggle) platesToggle.checked = studioState.showRingPlates;
        if (themeGrid) {
          themeGrid.querySelectorAll('.ec-theme-btn').forEach((el) => {
            el.classList.toggle('active', el.getAttribute('data-ec-theme') === studioState.theme);
          });
        }
        scheduleRedraw();
        notifyToast(ctx, '↺ Berat alanları varsayılan değerlere döndürüldü.');
      });
    }

    const dlTop = container.querySelector('#ec-btn-download-top');
    const dlSide = container.querySelector('#ec-btn-download-side');
    [dlTop, dlSide].forEach((btn) => {
      if (btn) {
        btn.addEventListener('click', () => {
          downloadCertificatePng(studioState, statsInfo, ctx);
        });
      }
    });

    const fullscreenBtn = container.querySelector('#ec-btn-fullscreen');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        openFullscreenModal(studioState, statsInfo, ctx);
      });
    }

    const copyVerifyBtn = container.querySelector('#ec-btn-copy-verify');
    if (copyVerifyBtn) {
      copyVerifyBtn.addEventListener('click', () => {
        copyCertificateVerification(studioState, statsInfo, ctx);
      });
    }
  }

  window.SEYYAH_MODULES.certificate = {
    render
  };
})();
