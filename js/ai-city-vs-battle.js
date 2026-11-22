/**
 * Anadolu Seyahatnamesi — AI Şehir Düellosu & Uzman Hakem Stüdyosu
 * Interactive split-screen city comparison & Gemini AI 5-criteria referee powered by window.SEYYAH_AI.
 * Registers on: window.SEYYAH_MODULES.aiBattle = { render(container, ctx) }
 */
(function () {
  'use strict';

  const STYLE_ID = 'seyyah-ai-city-vs-battle-styles';
  const DEFAULT_CITY_A_KEY = '04_IcAnadolu/Konya';
  const DEFAULT_CITY_B_KEY = '01_Marmara/Bursa';
  const ROAD_FACTOR = 1.35;
  const BUS_SPEED_KMH = 75;

  const CRITERIA = [
    { key: 'tarih', icon: '🏛️', label: 'Tarih & Mimari' },
    { key: 'mutfak', icon: '🍽️', label: 'Yöresel Mutfak' },
    { key: 'kutuphane', icon: '📚', label: 'Kütüphane & Çalışma' },
    { key: 'manevi', icon: '🕌', label: 'Manevi Atmosfer' },
    { key: 'butce', icon: '🚌', label: 'Bütçe & Ulaşım' }
  ];

  const RADAR_AXES = [
    { key: 'tarih', icon: '🏛️', label: 'Tarihi Miras', shortLabel: 'Tarihi Miras' },
    { key: 'gastronomi', icon: '🍽️', label: 'Gastronomi', shortLabel: 'Gastronomi' },
    { key: 'irfan', icon: '🕌', label: 'İrfan & Maneviyat', shortLabel: 'İrfan & Maneviyat' },
    { key: 'doga', icon: '🌲', label: 'Doğa & İklim', shortLabel: 'Doğa & İklim' },
    { key: 'kutuphane', icon: '📚', label: 'Kütüphane & Göçebe Uyumu', shortLabel: 'Kütüphane & Göçebe' }
  ];

  const REGION_ICONS = {
    '01_Marmara': '🏰',
    '02_Ege': '🌊',
    '03_Akdeniz': '☀️',
    '04_IcAnadolu': '🌾',
    '05_Karadeniz': '🌲',
    '06_DoguAnadolu': '🏔️',
    '07_GuneydoguAnadolu': '🏜️'
  };

  let selectedKeyA = null;
  let selectedKeyB = null;
  let activeRequestId = 0;

  // Per-session cache: `${keyA}::${keyB}` -> { status, mode, text, errorMsg, updatedAt }
  const verdictCache = new Map();

  // ---------------------------------------------------------------------------
  // Safe Helpers & Fallbacks
  // ---------------------------------------------------------------------------
  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fallbackCalcDistKm(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function fallbackToast(msg) {
    const container = typeof document !== 'undefined' ? document.getElementById('toast-container') : null;
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast-item';
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.25s ease';
      setTimeout(function () {
        el.remove();
      }, 260);
    }, 2400);
  }

  function formatHoursMinutes(hoursFloat) {
    if (!Number.isFinite(hoursFloat) || hoursFloat <= 0) return '0 dk';
    const totalMinutes = Math.max(1, Math.round(hoursFloat * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return mins + ' dk';
    if (mins === 0) return hours + ' sa';
    return hours + ' sa ' + mins + ' dk';
  }

  function getPairCacheKey(keyA, keyB) {
    return keyA + '::' + keyB;
  }

  // ---------------------------------------------------------------------------
  // Scoped Styles (Dark & Light Theme Compatible)
  // ---------------------------------------------------------------------------
  function ensureStyles() {
    if (typeof document === 'undefined' || !document.head) return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .vsbattle-studio {
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 1220px;
        margin: 0 auto;
        padding-bottom: 24px;
      }

      /* Header Banner */
      .vsbattle-header {
        position: relative;
        overflow: hidden;
        padding: 22px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.78) 55%, rgba(15, 23, 42, 0.92) 100%);
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-lg);
      }

      .vsbattle-header::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 12% 20%, rgba(0, 242, 254, 0.14), transparent 45%),
          radial-gradient(circle at 88% 80%, rgba(245, 158, 11, 0.14), transparent 45%);
        pointer-events: none;
      }

      .vsbattle-header-main {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .vsbattle-title {
        font-family: var(--font-heading);
        font-size: 1.55rem;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.02em;
        margin: 0;
      }

      .vsbattle-subtitle {
        font-size: 0.9rem;
        color: var(--text-secondary);
        max-width: 720px;
      }

      .vsbattle-engine-pill {
        position: relative;
        z-index: 1;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 14px;
        border-radius: var(--radius-full);
        font-size: 0.78rem;
        font-weight: 700;
        background: rgba(0, 242, 254, 0.1);
        border: 1px solid rgba(0, 242, 254, 0.28);
        color: var(--accent-cyan);
        white-space: nowrap;
      }

      .vsbattle-engine-pill.is-fallback {
        background: rgba(245, 158, 11, 0.12);
        border-color: rgba(245, 158, 11, 0.32);
        color: var(--accent-gold);
      }

      .vsbattle-engine-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 8px currentColor;
      }

      /* Controls Bar */
      .vsbattle-controls {
        padding: 18px 20px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto;
        gap: 12px;
        align-items: end;
      }

      .vsbattle-select-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .vsbattle-select-label {
        font-size: 0.74rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .vsbattle-corner-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        display: inline-block;
      }

      .vsbattle-corner-dot.corner-a {
        background: var(--accent-cyan);
        box-shadow: 0 0 8px rgba(0, 242, 254, 0.6);
      }

      .vsbattle-corner-dot.corner-b {
        background: var(--accent-gold);
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
      }

      .vsbattle-select {
        width: 100%;
        min-height: 42px;
        padding: 9px 12px;
        border-radius: var(--radius-md);
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid var(--border-glass);
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .vsbattle-select:focus {
        outline: none;
        border-color: var(--accent-cyan);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.16);
      }

      .vsbattle-swap-btn {
        height: 42px;
        padding: 0 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-weight: 700;
      }

      .vsbattle-random-btn {
        height: 42px;
        white-space: nowrap;
      }

      /* Split-Screen Arena */
      .vsbattle-arena {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 170px minmax(0, 1fr);
        gap: 16px;
        align-items: stretch;
      }

      .vsbattle-fighter {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-lg);
      }

      .vsbattle-fighter-a {
        border-top: 3px solid var(--accent-cyan);
      }

      .vsbattle-fighter-b {
        border-top: 3px solid var(--accent-gold);
      }

      .vsbattle-hero {
        position: relative;
        height: 220px;
        overflow: hidden;
        background: #0f172a;
      }

      .vsbattle-hero-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.55s ease;
      }

      .vsbattle-fighter:hover .vsbattle-hero-img {
        transform: scale(1.04);
      }

      .vsbattle-hero-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(7, 11, 22, 0.36) 0%,
          rgba(7, 11, 22, 0.2) 38%,
          rgba(7, 11, 22, 0.92) 100%
        );
      }

      .vsbattle-hero-top {
        position: absolute;
        top: 12px;
        left: 14px;
        right: 14px;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
      }

      .vsbattle-plate-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: var(--radius-sm);
        background: rgba(10, 15, 29, 0.84);
        border: 1px solid rgba(255, 255, 255, 0.22);
        color: #f8fafc;
        font-family: var(--font-heading);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        backdrop-filter: blur(8px);
      }

      .vsbattle-plate-tr {
        background: #2563eb;
        color: #ffffff;
        font-size: 0.62rem;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: 800;
      }

      .vsbattle-visited-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: var(--radius-full);
        font-size: 0.73rem;
        font-weight: 700;
        backdrop-filter: blur(8px);
      }

      .vsbattle-visited-badge.is-visited {
        background: rgba(16, 185, 129, 0.25);
        border: 1px solid rgba(52, 211, 153, 0.55);
        color: #ecfdf5;
      }

      .vsbattle-visited-badge.is-unvisited {
        background: rgba(245, 158, 11, 0.25);
        border: 1px solid rgba(251, 191, 36, 0.55);
        color: #fef3c7;
      }

      .vsbattle-hero-bottom {
        position: absolute;
        bottom: 12px;
        left: 14px;
        right: 14px;
        z-index: 2;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }

      .vsbattle-city-name {
        font-family: var(--font-heading);
        font-size: 1.55rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.15;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
      }

      .vsbattle-region-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: var(--radius-full);
        background: rgba(255, 255, 255, 0.14);
        border: 1px solid rgba(255, 255, 255, 0.25);
        color: #f8fafc;
        font-size: 0.75rem;
        font-weight: 600;
        backdrop-filter: blur(8px);
      }

      .vsbattle-fighter-body {
        padding: 16px 18px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
      }

      .vsbattle-quote {
        font-size: 0.85rem;
        font-style: italic;
        color: var(--text-primary);
        line-height: 1.5;
        padding-left: 10px;
        border-left: 3px solid var(--accent-cyan);
      }

      .vsbattle-fighter-b .vsbattle-quote {
        border-left-color: var(--accent-gold);
      }

      .vsbattle-mini-block {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .vsbattle-mini-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
      }

      .vsbattle-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .vsbattle-chip {
        font-size: 0.75rem;
        padding: 3px 9px;
        border-radius: var(--radius-full);
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass);
        color: var(--text-secondary);
      }

      .vsbattle-lib-snippet {
        font-size: 0.8rem;
        color: var(--text-secondary);
        background: rgba(15, 23, 42, 0.42);
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-md);
        padding: 9px 11px;
        line-height: 1.45;
      }

      .vsbattle-go-city-btn {
        margin-top: auto;
        width: 100%;
        justify-content: center;
        font-weight: 700;
      }

      /* Center Distance & VS Column */
      .vsbattle-center-bridge {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 16px 12px;
        border-radius: var(--radius-lg);
        text-align: center;
      }

      .vsbattle-vs-emblem {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 50%, var(--accent-gold) 100%);
        color: #0a0f1d;
        font-family: var(--font-heading);
        font-size: 1.25rem;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        letter-spacing: 0.04em;
        box-shadow: 0 0 24px rgba(0, 242, 254, 0.35);
      }

      .vsbattle-dist-metric {
        display: flex;
        flex-direction: column;
        gap: 2px;
        width: 100%;
        padding: 8px 10px;
        border-radius: var(--radius-md);
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass);
      }

      .vsbattle-dist-label {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted);
      }

      .vsbattle-dist-val {
        font-family: var(--font-heading);
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .vsbattle-dist-sub {
        font-size: 0.7rem;
        color: var(--text-secondary);
      }

      /* Deterministic Data Comparison Bars */
      .vsbattle-bars-card {
        padding: 20px 22px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .vsbattle-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .vsbattle-section-title {
        font-family: var(--font-heading);
        font-size: 1.08rem;
        font-weight: 800;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .vsbattle-score-summary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-secondary);
        padding: 5px 12px;
        border-radius: var(--radius-full);
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass);
      }

      .vsbattle-duel-bars {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .vsbattle-bar-row {
        display: flex;
        flex-direction: column;
        gap: 7px;
        padding: 12px 14px;
        border-radius: var(--radius-md);
        background: rgba(15, 23, 42, 0.42);
        border: 1px solid var(--border-glass);
      }

      .vsbattle-bar-meta {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 10px;
      }

      .vsbattle-bar-val-a {
        font-family: var(--font-heading);
        font-size: 0.88rem;
        font-weight: 800;
        color: var(--accent-cyan);
        text-align: left;
      }

      .vsbattle-bar-label {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
      }

      .vsbattle-bar-val-b {
        font-family: var(--font-heading);
        font-size: 0.88rem;
        font-weight: 800;
        color: var(--accent-gold);
        text-align: right;
      }

      .vsbattle-bar-split {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        align-items: center;
      }

      .vsbattle-track {
        height: 9px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: var(--radius-full);
        overflow: hidden;
        display: flex;
      }

      .vsbattle-track-a {
        justify-content: flex-end;
      }

      .vsbattle-track-b {
        justify-content: flex-start;
      }

      .vsbattle-fill-a {
        height: 100%;
        border-radius: var(--radius-full);
        background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
        transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .vsbattle-fill-b {
        height: 100%;
        border-radius: var(--radius-full);
        background: linear-gradient(90deg, var(--accent-gold), #fb7185);
        transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
      }

      /* 5-Axis SVG Radar / Spider Comparison Card */
      .vsbattle-radar-card {
        padding: 20px 22px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .vsbattle-radar-layout {
        display: grid;
        grid-template-columns: minmax(280px, 410px) minmax(0, 1fr);
        gap: 20px;
        align-items: center;
      }

      .vsbattle-radar-svg-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 12px;
        border-radius: var(--radius-md);
        background: rgba(15, 23, 42, 0.44);
        border: 1px solid var(--border-glass);
      }

      .vsbattle-radar-svg {
        width: 100%;
        max-width: 390px;
        height: auto;
        overflow: visible;
      }

      .vsbattle-radar-grid-poly {
        fill: none;
        stroke: rgba(148, 163, 184, 0.24);
        stroke-width: 1;
      }

      .vsbattle-radar-spoke {
        stroke: rgba(148, 163, 184, 0.22);
        stroke-width: 1;
        stroke-dasharray: 3 3;
      }

      .vsbattle-radar-axis-label {
        font-family: var(--font-heading);
        font-size: 11px;
        font-weight: 700;
        fill: #e2e8f0;
      }

      .vsbattle-radar-ring-label {
        font-size: 9px;
        font-weight: 600;
        fill: #64748b;
      }

      .vsbattle-radar-poly-a {
        fill: rgba(0, 242, 254, 0.22);
        stroke: #00f2fe;
        stroke-width: 2.3;
        stroke-linejoin: round;
      }

      .vsbattle-radar-poly-b {
        fill: rgba(245, 158, 11, 0.22);
        stroke: #f59e0b;
        stroke-width: 2.3;
        stroke-linejoin: round;
      }

      .vsbattle-radar-legend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-top: 8px;
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .vsbattle-radar-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .vsbattle-radar-swatch {
        width: 11px;
        height: 11px;
        border-radius: 3px;
        display: inline-block;
      }

      .vsbattle-radar-table {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .vsbattle-radar-row {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) auto auto;
        align-items: center;
        gap: 10px;
        padding: 10px 13px;
        border-radius: var(--radius-md);
        background: rgba(15, 23, 42, 0.42);
        border: 1px solid var(--border-glass);
      }

      .vsbattle-radar-row-label {
        font-size: 0.83rem;
        font-weight: 700;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .vsbattle-radar-pill {
        font-family: var(--font-heading);
        font-size: 0.8rem;
        font-weight: 800;
        padding: 3px 10px;
        border-radius: var(--radius-full);
        min-width: 58px;
        text-align: center;
      }

      .vsbattle-radar-pill.is-a {
        background: rgba(0, 242, 254, 0.14);
        border: 1px solid rgba(0, 242, 254, 0.35);
        color: var(--accent-cyan);
      }

      .vsbattle-radar-pill.is-b {
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.35);
        color: var(--accent-gold);
      }

      .vsbattle-radar-pill.is-lead {
        box-shadow: 0 0 12px rgba(255, 255, 255, 0.14);
        transform: scale(1.03);
      }

      /* AI Referee Studio Card */
      .vsbattle-ai-card {
        padding: 22px 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        border: 1px solid rgba(0, 242, 254, 0.25);
      }

      .vsbattle-ai-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        flex-wrap: wrap;
      }

      .vsbattle-ai-criteria-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .vsbattle-criteria-pill {
        font-size: 0.74rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: var(--radius-full);
        background: rgba(168, 85, 247, 0.12);
        border: 1px solid rgba(168, 85, 247, 0.28);
        color: var(--text-secondary);
      }

      .vsbattle-judge-btn {
        background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 52%, var(--accent-purple) 100%);
        color: #ffffff;
        border: none;
        padding: 12px 22px;
        border-radius: var(--radius-md);
        font-family: var(--font-heading);
        font-size: 0.95rem;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 8px 22px rgba(0, 242, 254, 0.25);
        transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
      }

      .vsbattle-judge-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(0, 242, 254, 0.38);
      }

      .vsbattle-judge-btn:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      .vsbattle-verdict-box {
        border-radius: var(--radius-md);
        background: rgba(15, 23, 42, 0.52);
        border: 1px solid var(--border-glass);
        padding: 18px 20px;
        min-height: 110px;
      }

      .vsbattle-verdict-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 8px;
        padding: 18px 12px;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }

      .vsbattle-verdict-status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--border-glass);
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--accent-cyan);
      }

      .vsbattle-verdict-status.is-fallback {
        color: var(--accent-gold);
      }

      .vsbattle-verdict-content {
        font-size: 0.92rem;
        line-height: 1.7;
        color: var(--text-primary);
      }

      .vsbattle-md-h {
        font-family: var(--font-heading);
        font-size: 1.02rem;
        font-weight: 800;
        color: var(--accent-cyan);
        margin: 14px 0 6px;
      }

      .vsbattle-md-h:first-child {
        margin-top: 0;
      }

      .vsbattle-md-p {
        margin: 0 0 10px;
      }

      .vsbattle-md-p:last-child {
        margin-bottom: 0;
      }

      .vsbattle-md-ul,
      .vsbattle-md-ol {
        margin: 6px 0 12px 20px;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .vsbattle-md-quote {
        margin: 10px 0;
        padding: 8px 12px;
        border-left: 3px solid var(--accent-gold);
        background: rgba(245, 158, 11, 0.08);
        border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        font-style: italic;
      }

      .vsbattle-stream-cursor {
        display: inline-block;
        width: 8px;
        height: 1em;
        margin-left: 4px;
        vertical-align: -2px;
        background: var(--accent-cyan);
        animation: vsbattleBlink 0.9s steps(2, start) infinite;
      }

      @keyframes vsbattleBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.15; }
      }

      /* Light Theme Overrides */
      body.light-theme .vsbattle-header {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(241, 245, 249, 0.94) 100%);
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: var(--shadow-subtle);
      }

      body.light-theme .vsbattle-select {
        background: #ffffff;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.18);
      }

      body.light-theme .vsbattle-chip,
      body.light-theme .vsbattle-lib-snippet,
      body.light-theme .vsbattle-dist-metric,
      body.light-theme .vsbattle-score-summary,
      body.light-theme .vsbattle-bar-row,
      body.light-theme .vsbattle-radar-svg-wrap,
      body.light-theme .vsbattle-radar-row,
      body.light-theme .vsbattle-verdict-box {
        background: rgba(241, 245, 249, 0.88);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .vsbattle-radar-grid-poly,
      body.light-theme .vsbattle-radar-spoke {
        stroke: rgba(15, 23, 42, 0.18);
      }

      body.light-theme .vsbattle-radar-axis-label {
        fill: #0f172a;
      }

      body.light-theme .vsbattle-radar-poly-a {
        fill: rgba(2, 132, 199, 0.2);
        stroke: #0284c7;
      }

      body.light-theme .vsbattle-radar-poly-b {
        fill: rgba(217, 119, 6, 0.2);
        stroke: #d97706;
      }

      body.light-theme .vsbattle-radar-pill.is-a {
        background: rgba(2, 132, 199, 0.12);
        border-color: rgba(2, 132, 199, 0.34);
        color: #0369a1;
      }

      body.light-theme .vsbattle-radar-pill.is-b {
        background: rgba(217, 119, 6, 0.12);
        border-color: rgba(217, 119, 6, 0.34);
        color: #b45309;
      }

      body.light-theme .vsbattle-track {
        background: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .vsbattle-vs-emblem {
        color: #ffffff;
      }

      body.light-theme .vsbattle-md-h {
        color: #0284c7;
      }

      body.light-theme .vsbattle-criteria-pill {
        background: rgba(124, 58, 237, 0.08);
        border-color: rgba(124, 58, 237, 0.24);
        color: #4c1d95;
      }

      /* Responsive Breakpoints */
      @media (max-width: 980px) {
        .vsbattle-controls {
          grid-template-columns: 1fr;
        }
        .vsbattle-arena {
          grid-template-columns: 1fr;
        }
        .vsbattle-radar-layout {
          grid-template-columns: 1fr;
        }
        .vsbattle-center-bridge {
          display: grid;
          grid-template-columns: auto 1fr 1fr;
          align-items: center;
          gap: 10px;
          text-align: left;
        }
      }

      @media (max-width: 600px) {
        .vsbattle-center-bridge {
          grid-template-columns: 1fr;
          text-align: center;
        }
        .vsbattle-bar-meta {
          grid-template-columns: auto 1fr auto;
          gap: 6px;
        }
        .vsbattle-bar-label {
          font-size: 0.76rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Province Data & Deterministic Metrics
  // ---------------------------------------------------------------------------
  function getSortedProvinceEntries(provinces) {
    return Object.entries(provinces || {}).sort(function (a, b) {
      const nameA = String((a[1] && a[1].name) || a[0]);
      const nameB = String((b[1] && b[1].name) || b[0]);
      return nameA.localeCompare(nameB, 'tr');
    });
  }

  function findProvinceKeyByName(provinces, targetName) {
    const entries = Object.entries(provinces || {});
    for (let i = 0; i < entries.length; i++) {
      const key = entries[i][0];
      const p = entries[i][1];
      if (p && String(p.name || '').toLocaleLowerCase('tr') === targetName.toLocaleLowerCase('tr')) {
        return key;
      }
    }
    return null;
  }

  function resolveInitialSelection(provinces, sortedEntries, state) {
    const keys = sortedEntries.map(function (entry) { return entry[0]; });
    if (keys.length === 0) return;

    const stateA = state && state.aiBattleCityA;
    const stateB = state && state.aiBattleCityB;

    if (!selectedKeyA || !provinces[selectedKeyA]) {
      if (stateA && provinces[stateA]) {
        selectedKeyA = stateA;
      } else if (provinces[DEFAULT_CITY_A_KEY]) {
        selectedKeyA = DEFAULT_CITY_A_KEY;
      } else {
        selectedKeyA = findProvinceKeyByName(provinces, 'Konya') || keys[0];
      }
    }

    if (!selectedKeyB || !provinces[selectedKeyB]) {
      if (stateB && provinces[stateB]) {
        selectedKeyB = stateB;
      } else if (provinces[DEFAULT_CITY_B_KEY]) {
        selectedKeyB = DEFAULT_CITY_B_KEY;
      } else {
        selectedKeyB = findProvinceKeyByName(provinces, 'Bursa') || (keys.length > 1 ? keys[1] : keys[0]);
      }
    }

    if (selectedKeyA === selectedKeyB && keys.length > 1) {
      selectedKeyB = keys.find(function (k) { return k !== selectedKeyA; }) || keys[0];
    }

    if (state) {
      state.aiBattleCityA = selectedKeyA;
      state.aiBattleCityB = selectedKeyB;
    }
  }

  function computeStudyPlanRichness(province) {
    if (!province) return { score: 0, label: '0/100' };

    const libText = String(province.custom_library || province.library || '').trim();
    const hasCustomLib = Boolean(province.custom_library && String(province.custom_library).trim());
    const hasBaseLib = Boolean(province.library && String(province.library).trim());
    const planArr = Array.isArray(province.five_day_plan) ? province.five_day_plan : [];
    const planTextLen = planArr.join(' ').trim().length;
    const spiritualCount = Array.isArray(province.spiritual_figures)
      ? province.spiritual_figures.length
      : province.spiritual_figures
        ? 1
        : 0;
    const hasHistory = Boolean(province.history && String(province.history).trim().length > 60);
    const hasReflection = Boolean(province.reflection && String(province.reflection).trim().length > 40);

    // Deterministic 0-100 richness index combining library info + 5-day plan depth
    const libScore = Math.min(30, Math.round(libText.length / 5)) + (hasCustomLib && hasBaseLib ? 10 : 0);
    const planScore = Math.min(45, planArr.length * 9) + Math.min(10, Math.round(planTextLen / 90));
    const dossierBonus = Math.min(5, (hasHistory ? 2 : 0) + (hasReflection ? 2 : 0) + (spiritualCount > 0 ? 1 : 0));

    const total = Math.max(10, Math.min(100, libScore + planScore + dossierBonus));
    const tag = planArr.length > 0 ? planArr.length + ' Gün Plan + Kütüphane' : 'Kütüphane Ofisi';

    return {
      score: total,
      planDays: planArr.length,
      label: total + '/100 (' + tag + ')'
    };
  }

  function getProvinceMetrics(province) {
    const landmarksCount = Array.isArray(province && province.landmarks) ? province.landmarks.length : 0;
    const specialtiesCount = Array.isArray(province && province.specialties) ? province.specialties.length : 0;
    const richness = computeStudyPlanRichness(province);
    const radar = computeRadarScores(province, richness.score);
    return {
      landmarks: landmarksCount,
      specialties: specialtiesCount,
      richnessScore: richness.score,
      richnessLabel: richness.label,
      planDays: richness.planDays,
      radar: radar
    };
  }

  function computeRadarScores(province, richnessScore) {
    if (!province) {
      return { tarih: 50, gastronomi: 50, irfan: 50, doga: 50, kutuphane: 50 };
    }
    const landmarks = Array.isArray(province.landmarks) ? province.landmarks : [];
    const specialties = Array.isArray(province.specialties) ? province.specialties : [];
    const spirituals = Array.isArray(province.spiritual_figures)
      ? province.spiritual_figures
      : province.spiritual_figures
        ? [province.spiritual_figures]
        : [];
    const planArr = Array.isArray(province.five_day_plan) ? province.five_day_plan : [];
    const blob = [
      province.history || '',
      province.reflection || '',
      province.quote || '',
      landmarks.join(' '),
      planArr.join(' ')
    ].join(' ').toLocaleLowerCase('tr');

    // 1. Tarihi Miras (0-100)
    const historicHits = landmarks.filter(function (l) {
      return /cami|kale|antik|müze|medrese|köprü|saray|külliy|tapınak|höyük|han|kilise|manastır|türbe|hamam|tiyatro|unesco|sur|konak|çarşı|abide|anıt/i.test(String(l));
    }).length;
    const unescoBonus = /unesco|selçuklu|osmanlı|hitit|antik|roma|bizans|urartu/i.test(blob) ? 14 : 4;
    const historyDepth = Math.min(20, Math.round(String(province.history || '').length / 35));
    const tarih = Math.max(28, Math.min(99, 34 + landmarks.length * 7 + historicHits * 6 + unescoBonus + historyDepth));

    // 2. Gastronomi (0-100)
    const gastroRegions = { '07_GuneydoguAnadolu': 14, '03_Akdeniz': 11, '02_Ege': 10, '01_Marmara': 9, '04_IcAnadolu': 9, '05_Karadeniz': 9, '06_DoguAnadolu': 10 };
    const regionGastroBonus = gastroRegions[province.region_code] || 8;
    const specBlob = specialties.join(' ').toLocaleLowerCase('tr');
    const diversityBonus =
      (/(tatlı|baklava|helva|künefe|kadayıf|dondurma|lokum|sütlaç|hoşmerim|katmer)/i.test(specBlob) ? 6 : 0) +
      (/(çorba|beyran|tarhana|keşkek|paça|yuvalama)/i.test(specBlob) ? 6 : 0) +
      (/(kebap|köfte|tandır|pide|mantı|börek|kavurma|ciğer|döner)/i.test(specBlob) ? 6 : 0);
    const gastronomi = Math.max(30, Math.min(99, 36 + specialties.length * 10 + regionGastroBonus + diversityBonus));

    // 3. İrfan & Maneviyat (0-100)
    const irfanKeywords = (blob.match(/mevlana|dergâh|dergah|tekke|evliya|ahi|türbe|külliye|tasavvuf|irfan|medrese|yunus|hacı bektaş|somuncu|şems|eyüp|aziz|veli|eren/gi) || []).length;
    const reflectionDepth = Math.min(18, Math.round(String(province.reflection || '').length / 30));
    const irfan = Math.max(26, Math.min(99, 30 + spirituals.length * 14 + Math.min(24, irfanKeywords * 5) + reflectionDepth));

    // 4. Doğa & İklim (0-100)
    const naturalHits = landmarks.filter(function (l) {
      return /dağ|göl|kanyon|şelale|mağara|yayla|nehir|boğaz|ada|körfez|milli park|krater|vadi|plaj|kuş|orman|obruk|peri|kaplıca|termal|delta|falez|koy|ırmak|zirve/i.test(String(l));
    }).length;
    const natureKeywords = (blob.match(/yayla|şelale|kanyon|göl|deniz|sahil|plaj|orman|dağ|milli park|termal|kaplıca|vadi|koy|boğaz/gi) || []).length;
    const natureRegionBonus =
      province.region_code === '05_Karadeniz' || province.region_code === '03_Akdeniz' || province.region_code === '02_Ege'
        ? 14
        : province.region_code === '06_DoguAnadolu'
          ? 12
          : 8;
    const doga = Math.max(28, Math.min(99, 32 + naturalHits * 13 + Math.min(22, natureKeywords * 3) + natureRegionBonus));

    // 5. Kütüphane & Göçebe Uyumu (0-100)
    const kutuphane = Math.max(25, Math.min(99, Math.round(richnessScore || computeStudyPlanRichness(province).score)));

    return { tarih, gastronomi, irfan, doga, kutuphane };
  }

  function buildRadarSectionHtml(cityA, radarA, cityB, radarB, escapeHtml) {
    const cx = 190;
    const cy = 172;
    const maxR = 112;
    const rings = [25, 50, 75, 100];
    const axisCount = RADAR_AXES.length;

    function polarPoint(axisIndex, pct) {
      const angle = -Math.PI / 2 + (axisIndex * 2 * Math.PI) / axisCount;
      const r = (pct / 100) * maxR;
      return {
        x: Number((cx + r * Math.cos(angle)).toFixed(1)),
        y: Number((cy + r * Math.sin(angle)).toFixed(1))
      };
    }

    const ringPolys = rings.map(function (pct) {
      const pts = RADAR_AXES.map(function (_, idx) {
        const pt = polarPoint(idx, pct);
        return pt.x + ',' + pt.y;
      }).join(' ');
      const topPt = polarPoint(0, pct);
      return (
        '<polygon class="vsbattle-radar-grid-poly" points="' + pts + '" />' +
        '<text class="vsbattle-radar-ring-label" x="' + (topPt.x + 4) + '" y="' + (topPt.y + 3) + '">' + pct + '</text>'
      );
    }).join('');

    const spokesAndLabels = RADAR_AXES.map(function (axis, idx) {
      const edge = polarPoint(idx, 100);
      const labelPt = polarPoint(idx, 124);
      let anchor = 'middle';
      if (labelPt.x < cx - 22) anchor = 'end';
      else if (labelPt.x > cx + 22) anchor = 'start';
      const dy = labelPt.y < cy - 80 ? -2 : labelPt.y > cy + 80 ? 11 : 4;
      return (
        '<line class="vsbattle-radar-spoke" x1="' + cx + '" y1="' + cy + '" x2="' + edge.x + '" y2="' + edge.y + '" />' +
        '<text class="vsbattle-radar-axis-label" x="' + labelPt.x + '" y="' + (labelPt.y + dy) + '" text-anchor="' + anchor + '">' +
        escapeHtml(axis.icon + ' ' + axis.shortLabel) +
        '</text>'
      );
    }).join('');

    const polyPointsA = RADAR_AXES.map(function (axis, idx) {
      const pt = polarPoint(idx, radarA[axis.key] || 0);
      return pt.x + ',' + pt.y;
    }).join(' ');

    const polyPointsB = RADAR_AXES.map(function (axis, idx) {
      const pt = polarPoint(idx, radarB[axis.key] || 0);
      return pt.x + ',' + pt.y;
    }).join(' ');

    const dotsA = RADAR_AXES.map(function (axis, idx) {
      const val = radarA[axis.key] || 0;
      const pt = polarPoint(idx, val);
      return (
        '<circle cx="' + pt.x + '" cy="' + pt.y + '" r="4.2" fill="#00f2fe" stroke="#0f172a" stroke-width="1.5">' +
        '<title>' + escapeHtml(cityA.name + ' — ' + axis.label + ': ' + val + '/100') + '</title></circle>'
      );
    }).join('');

    const dotsB = RADAR_AXES.map(function (axis, idx) {
      const val = radarB[axis.key] || 0;
      const pt = polarPoint(idx, val);
      return (
        '<circle cx="' + pt.x + '" cy="' + pt.y + '" r="4.2" fill="#f59e0b" stroke="#0f172a" stroke-width="1.5">' +
        '<title>' + escapeHtml(cityB.name + ' — ' + axis.label + ': ' + val + '/100') + '</title></circle>'
      );
    }).join('');

    const avgA = Math.round(RADAR_AXES.reduce(function (s, a) { return s + (radarA[a.key] || 0); }, 0) / axisCount);
    const avgB = Math.round(RADAR_AXES.reduce(function (s, a) { return s + (radarB[a.key] || 0); }, 0) / axisCount);

    const rowsHtml = RADAR_AXES.map(function (axis) {
      const valA = radarA[axis.key] || 0;
      const valB = radarB[axis.key] || 0;
      return `
        <div class="vsbattle-radar-row">
          <span class="vsbattle-radar-row-label">${axis.icon} ${escapeHtml(axis.label)}</span>
          <span class="vsbattle-radar-pill is-a ${valA > valB ? 'is-lead' : ''}">${valA}${valA > valB ? ' ★' : ''}</span>
          <span class="vsbattle-radar-pill is-b ${valB > valA ? 'is-lead' : ''}">${valB > valA ? '★ ' : ''}${valB}</span>
        </div>
      `;
    }).join('');

    return `
      <section class="glass-card vsbattle-radar-card" aria-label="5 Eksenli Radar Karşılaştırma Grafiği">
        <div class="vsbattle-section-head">
          <h3 class="vsbattle-section-title">🕸️ 5 Eksenli Radar / Örümcek Karşılaştırması</h3>
          <span class="vsbattle-score-summary">
            Genel İndeks:
            <strong style="color:var(--accent-cyan);">${escapeHtml(cityA.name)} ${avgA}</strong>
            vs
            <strong style="color:var(--accent-gold);">${avgB} ${escapeHtml(cityB.name)}</strong>
          </span>
        </div>

        <div class="vsbattle-radar-layout">
          <div class="vsbattle-radar-svg-wrap">
            <svg class="vsbattle-radar-svg" viewBox="0 0 380 344" role="img" aria-label="${escapeHtml(cityA.name)} ve ${escapeHtml(cityB.name)} 5 eksenli radar grafiği">
              ${ringPolys}
              ${spokesAndLabels}
              <polygon class="vsbattle-radar-poly-a" points="${polyPointsA}" />
              <polygon class="vsbattle-radar-poly-b" points="${polyPointsB}" />
              ${dotsA}
              ${dotsB}
            </svg>
            <div class="vsbattle-radar-legend">
              <span class="vsbattle-radar-legend-item">
                <span class="vsbattle-radar-swatch" style="background:#00f2fe;"></span>
                <span>${escapeHtml(cityA.name)} (${avgA}/100)</span>
              </span>
              <span class="vsbattle-radar-legend-item">
                <span class="vsbattle-radar-swatch" style="background:#f59e0b;"></span>
                <span>${escapeHtml(cityB.name)} (${avgB}/100)</span>
              </span>
            </div>
          </div>

          <div class="vsbattle-radar-table">
            ${rowsHtml}
          </div>
        </div>
      </section>
    `;
  }

  // ---------------------------------------------------------------------------
  // AI Prompting, Stream/Ask Adapter & Markdown Renderer
  // ---------------------------------------------------------------------------
  function summarizeCityForPrompt(key, p) {
    const plate = String(p.plate || 0).padStart(2, '0');
    const landmarks = Array.isArray(p.landmarks) && p.landmarks.length ? p.landmarks.join(', ') : 'Belirtilmemiş';
    const specialties = Array.isArray(p.specialties) && p.specialties.length ? p.specialties.join(', ') : 'Belirtilmemiş';
    const library = p.custom_library || p.library || 'İl Halk Kütüphanesi';
    const planCount = Array.isArray(p.five_day_plan) ? p.five_day_plan.length : 0;
    const spiritual = Array.isArray(p.spiritual_figures) && p.spiritual_figures.length
      ? p.spiritual_figures.slice(0, 3).map(function (s) { return String(s).replace(/\*\*/g, ''); }).join(' | ')
      : '';
    const quote = p.custom_quote || p.quote || '';

    return [
      `Şehir: ${p.name} (Plaka ${plate}, Anahtar: ${key})`,
      `Bölge: ${p.region || 'Anadolu'}`,
      `Seyyah Durumu: ${p.visited ? 'Daha önce ziyaret edildi' : 'Henüz ziyaret edilmedi'}`,
      `Öne Çıkan Miraslar (${Array.isArray(p.landmarks) ? p.landmarks.length : 0}): ${landmarks}`,
      `Yöresel Lezzetler (${Array.isArray(p.specialties) ? p.specialties.length : 0}): ${specialties}`,
      `Kütüphane Çalışma Ofisi: ${library}`,
      `5 Gün Kuralı Planı: ${planCount > 0 ? planCount + ' günlük detaylı plan mevcut' : 'Temel şehir rehberi'}`,
      spiritual ? `Manevi İzler: ${spiritual}` : '',
      quote ? `Şehir Sözü: "${quote}"` : ''
    ].filter(Boolean).join('\n');
  }

  function buildJudgePrompt(keyA, cityA, keyB, cityB, distStats) {
    const system =
      'Sen "Dijital Seyyah: Anadolu Seyahatnamesi" platformunun bilge, tarafsız ve derinlikli Uzman Şehir Hakemisin. ' +
      'Evliya Çelebi zarafetiyle modern dijital göçebe ("5 Gün Kuralı", İl Halk Kütüphanesi çalışma disiplini, GSB Seyahatsever KYK bütçe bilinci) perspektifini birleştirirsin. ' +
      'Türkçe, akıcı, dengeli ve somut verilere dayanan bir karşılaştırma yap.';

    const prompt = [
      `Aşağıdaki iki Anadolu şehri arasında uzman hakem değerlendirmesi yap: **${cityA.name}** vs **${cityB.name}**.`,
      `İki şehir arası kuş uçuşu mesafe ${distStats.airKm} km, tahmini karayolu ${distStats.roadKm} km (otobüsle yaklaşık ${distStats.busTimeText}).`,
      '',
      'Yanıtını mutlaka şu 6 net başlık altında düzenle (her kriterde iki şehri somut özellikleriyle kıyaslayıp dengeli puan/yorum ver):',
      '### 1. 🏛️ Tarih & Mimari',
      '### 2. 🍽️ Yöresel Mutfak',
      '### 3. 📚 Kütüphane & Çalışma',
      '### 4. 🕌 Manevi Atmosfer',
      '### 5. 🚌 Bütçe & Ulaşım',
      '### 🏆 Uzman Hakem Kararı: Önce Hangi Şehre Gidilmeli?',
      '',
      'Son karar bölümünde hangi şehrin önce ziyaret edilmesi gerektiğini (henüz gezilmemiş olma durumu, 5 gün verimliliği ve mevsim/ulaşım dengesini gözeterek) net ama dengeli bir gerekçeyle açıkla.',
      '',
      '--- 1. KÖŞE ---',
      summarizeCityForPrompt(keyA, cityA),
      '',
      '--- 2. KÖŞE ---',
      summarizeCityForPrompt(keyB, cityB)
    ].join('\n');

    const context = `Düello: ${cityA.name} (${cityA.region}) vs ${cityB.name} (${cityB.region}) | Mesafe: ${distStats.airKm} km / ${distStats.busTimeText} otobüs`;
    const cacheKey = `ai_battle::${keyA}::${keyB}::v1`;

    return { system, systemPrompt: system, prompt, context, cacheKey };
  }

  function detectObjectParamStyle(fn) {
    try {
      const src = Function.prototype.toString.call(fn).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').trim();
      const match = src.match(/^[^(]*\(\s*([^)]*)\)/);
      if (!match) return false;
      const firstParam = match[1].split(',')[0].trim();
      return /^(\{|opts\b|options\b|params\b|cfg\b|config\b|req\b|payload\b|input\b)/i.test(firstParam);
    } catch (e) {
      return false;
    }
  }

  function detectCallbackSecondParam(fn) {
    try {
      const src = Function.prototype.toString.call(fn).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').trim();
      const match = src.match(/^[^(]*\(\s*([^)]*)\)/);
      if (!match) return false;
      const params = match[1].split(',');
      if (params.length < 2) return false;
      const secondParam = params[1].trim();
      return /^(onChunk|onToken|onDelta|onUpdate|onText|cb|callback|handler)/i.test(secondParam);
    } catch (e) {
      return false;
    }
  }

  function extractAiText(res) {
    if (typeof res === 'string') return res;
    if (!res || typeof res !== 'object') return '';
    return String(
      res.text ||
      res.reply ||
      res.content ||
      res.answer ||
      res.response ||
      res.output ||
      (res.data && (res.data.text || res.data.reply || res.data.content)) ||
      ''
    ).trim();
  }

  async function invokeSeyyahAi(payload, onProgress) {
    const ai = typeof window !== 'undefined' ? window.SEYYAH_AI : null;
    if (!ai || (typeof ai.stream !== 'function' && typeof ai.ask !== 'function')) {
      throw new Error('window.SEYYAH_AI modülü henüz yüklenmemiş.');
    }

    let accumulated = '';
    const handleChunk = function (chunkOrFull, maybeFull) {
      if (typeof maybeFull === 'string' && maybeFull.length >= (chunkOrFull ? String(chunkOrFull).length : 0)) {
        accumulated = maybeFull;
      } else if (typeof chunkOrFull === 'string') {
        if (accumulated && chunkOrFull.indexOf(accumulated) === 0) {
          accumulated = chunkOrFull;
        } else {
          accumulated += chunkOrFull;
        }
      } else if (chunkOrFull && typeof chunkOrFull === 'object') {
        const piece = extractAiText(chunkOrFull);
        if (piece) {
          if (accumulated && piece.indexOf(accumulated) === 0) {
            accumulated = piece;
          } else {
            accumulated += piece;
          }
        }
      }
      if (accumulated) {
        onProgress(accumulated);
      }
    };

    if (typeof ai.stream === 'function') {
      try {
        let res;
        if (detectObjectParamStyle(ai.stream)) {
          res = await ai.stream({
            prompt: payload.prompt,
            system: payload.system,
            systemPrompt: payload.systemPrompt,
            context: payload.context,
            cacheKey: payload.cacheKey,
            temperature: 0.72,
            maxTokens: 1600,
            maxOutputTokens: 1600,
            onChunk: handleChunk,
            onToken: handleChunk,
            onDelta: handleChunk,
            onUpdate: handleChunk
          });
        } else if (detectCallbackSecondParam(ai.stream)) {
          res = await ai.stream(payload.prompt, handleChunk, {
            system: payload.system,
            systemPrompt: payload.systemPrompt,
            context: payload.context,
            cacheKey: payload.cacheKey,
            temperature: 0.72,
            maxTokens: 1600,
            maxOutputTokens: 1600
          });
        } else {
          res = await ai.stream(payload.prompt, {
            system: payload.system,
            systemPrompt: payload.systemPrompt,
            context: payload.context,
            cacheKey: payload.cacheKey,
            temperature: 0.72,
            maxTokens: 1600,
            maxOutputTokens: 1600,
            onChunk: handleChunk,
            onToken: handleChunk,
            onDelta: handleChunk,
            onUpdate: handleChunk
          });
        }

        const finalText = extractAiText(res) || accumulated;
        if (finalText && finalText.trim()) {
          return {
            text: finalText.trim(),
            mode: 'stream',
            model: res && typeof res === 'object' ? res.model : undefined,
            latencyMs: res && typeof res === 'object' ? res.latencyMs : undefined,
            cached: res && typeof res === 'object' ? Boolean(res.cached) : false
          };
        }
      } catch (streamErr) {
        if (typeof ai.ask !== 'function') {
          throw streamErr;
        }
      }
    }

    if (typeof ai.ask === 'function') {
      const res = detectObjectParamStyle(ai.ask)
        ? await ai.ask({
            prompt: payload.prompt,
            system: payload.system,
            systemPrompt: payload.systemPrompt,
            context: payload.context,
            cacheKey: payload.cacheKey,
            temperature: 0.72,
            maxTokens: 1600,
            maxOutputTokens: 1600
          })
        : await ai.ask(payload.prompt, {
            system: payload.system,
            systemPrompt: payload.systemPrompt,
            context: payload.context,
            cacheKey: payload.cacheKey,
            temperature: 0.72,
            maxTokens: 1600,
            maxOutputTokens: 1600
          });

      const finalText = extractAiText(res);
      if (finalText) {
        return {
          text: finalText,
          mode: 'ask',
          model: res && typeof res === 'object' ? res.model : undefined,
          latencyMs: res && typeof res === 'object' ? res.latencyMs : undefined,
          cached: res && typeof res === 'object' ? Boolean(res.cached) : false
        };
      }
    }

    throw new Error('Gemini AI servisinden geçerli bir karar alınamadı.');
  }

  function buildOfflineJudgeFallback(cityA, cityB, metricsA, metricsB, distStats) {
    const rA = metricsA.radar || computeRadarScores(cityA, metricsA.richnessScore);
    const rB = metricsB.radar || computeRadarScores(cityB, metricsB.richnessScore);
    const totalA = rA.tarih + rA.gastronomi + rA.irfan + rA.doga + rA.kutuphane;
    const totalB = rB.tarih + rB.gastronomi + rB.irfan + rB.doga + rB.kutuphane;

    const visitAdvice =
      !cityA.visited && cityB.visited
        ? `**${cityA.name}** henüz ziyaret edilmemiş olduğu için yeni menzil keşfi açısından bir adım önde (5 eksenli indeks: **${Math.round(totalA / 5)}/100**).`
        : !cityB.visited && cityA.visited
          ? `**${cityB.name}** henüz ziyaret edilmemiş olduğu için seyahatname haritanı genişletmek adına öncelikli aday (5 eksenli indeks: **${Math.round(totalB / 5)}/100**).`
          : totalA >= totalB
            ? `**${cityA.name}**, 5 eksenli Bilgi Grafiği değerlendirmesinde **${Math.round(totalA / 5)}/100** ortalama skorla (vs ${Math.round(totalB / 5)}/100) ilk etap için öne çıkıyor.`
            : `**${cityB.name}**, 5 eksenli Bilgi Grafiği değerlendirmesinde **${Math.round(totalB / 5)}/100** ortalama skorla (vs ${Math.round(totalA / 5)}/100) ilk etap için güçlü bir başlangıç sunuyor.`;

    const lmA = (cityA.landmarks || []).slice(0, 3).join(', ') || 'tarihî merkez';
    const lmB = (cityB.landmarks || []).slice(0, 3).join(', ') || 'tarihî merkez';
    const spA = (cityA.specialties || []).slice(0, 3).join(', ') || 'yöresel tatlar';
    const spB = (cityB.specialties || []).slice(0, 3).join(', ') || 'yöresel tatlar';
    const libA = cityA.custom_library || cityA.library || `${cityA.name} İl Halk Kütüphanesi`;
    const libB = cityB.custom_library || cityB.library || `${cityB.name} İl Halk Kütüphanesi`;
    const spFigA = Array.isArray(cityA.spiritual_figures) && cityA.spiritual_figures.length
      ? String(cityA.spiritual_figures[0]).replace(/\*\*/g, '')
      : (cityA.custom_quote || cityA.quote || cityA.region);
    const spFigB = Array.isArray(cityB.spiritual_figures) && cityB.spiritual_figures.length
      ? String(cityB.spiritual_figures[0]).replace(/\*\*/g, '')
      : (cityB.custom_quote || cityB.quote || cityB.region);

    return [
      `### 1. 🏛️ Tarihi Miras (${cityA.name} ${rA.tarih} vs ${rB.tarih} ${cityB.name})`,
      `- **${cityA.name}** (${metricsA.landmarks} ana miras): ${lmA} gibi duraklarla öne çıkıyor.`,
      `- **${cityB.name}** (${metricsB.landmarks} ana miras): ${lmB} ile güçlü bir mimari miras sunuyor.`,
      '',
      `### 2. 🍽️ Gastronomi (${cityA.name} ${rA.gastronomi} vs ${rB.gastronomi} ${cityB.name})`,
      `- **${cityA.name}** (${metricsA.specialties} lezzet): ${spA} öne çıkan tatlar arasında.`,
      `- **${cityB.name}** (${metricsB.specialties} lezzet): ${spB} ile zengin bir sofra vadediyor.`,
      '',
      `### 3. 🕌 İrfan & Maneviyat (${cityA.name} ${rA.irfan} vs ${rB.irfan} ${cityB.name})`,
      `- **${cityA.name}**: ${spFigA}`,
      `- **${cityB.name}**: ${spFigB}`,
      '',
      `### 4. 🌲 Doğa & İklim (${cityA.name} ${rA.doga} vs ${rB.doga} ${cityB.name})`,
      `- **${cityA.name}** (${cityA.region}) ile **${cityB.name}** (${cityB.region}) arasında belirgin bir iklim ve tabiat kontrastı bulunuyor; mevsim tercihinize göre yayla/kıyı veya tarihî merkez dengesini kurabilirsiniz.`,
      '',
      `### 5. 📚 Kütüphane & Göçebe Uyumu (${cityA.name} ${rA.kutuphane} vs ${rB.kutuphane} ${cityB.name})`,
      `- **${cityA.name}** (${metricsA.richnessScore}/100): ${libA}`,
      `- **${cityB.name}** (${metricsB.richnessScore}/100): ${libB}`,
      `- **Ulaşım Köprüsü:** İki şehir arası kuş uçuşu **${distStats.airKm} km**, karayolu yaklaşık **${distStats.roadKm} km** (otobüsle tahmini **${distStats.busTimeText}**).`,
      '',
      `### 🏆 Uzman Hakem Kararı: Önce Hangi Şehre Gidilmeli?`,
      `${visitAdvice} Ardından diğer şehre otobüsle **${distStats.busTimeText}** yolculukla geçerek iki menzili tek koridorda birleştirebilirsin.`
    ].join('\n');
  }

  function formatInlineMarkdown(raw, escapeHtml) {
    return escapeHtml(raw)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
  }

  function renderMarkdownHtml(rawText, escapeHtml, isStreaming) {
    const lines = String(rawText || '').replace(/\r\n/g, '\n').split('\n');
    const html = [];
    let listTag = null;

    function closeList() {
      if (listTag) {
        html.push('</' + listTag + '>');
        listTag = null;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        closeList();
        continue;
      }

      const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
      if (headingMatch) {
        closeList();
        html.push('<h4 class="vsbattle-md-h">' + formatInlineMarkdown(headingMatch[1], escapeHtml) + '</h4>');
        continue;
      }

      const quoteMatch = line.match(/^>\s+(.+)$/);
      if (quoteMatch) {
        closeList();
        html.push('<blockquote class="vsbattle-md-quote">' + formatInlineMarkdown(quoteMatch[1], escapeHtml) + '</blockquote>');
        continue;
      }

      const ulMatch = line.match(/^[-*•]\s+(.+)$/);
      if (ulMatch) {
        if (listTag !== 'ul') {
          closeList();
          listTag = 'ul';
          html.push('<ul class="vsbattle-md-ul">');
        }
        html.push('<li>' + formatInlineMarkdown(ulMatch[1], escapeHtml) + '</li>');
        continue;
      }

      const olMatch = line.match(/^\d+[.)]\s+(.+)$/);
      if (olMatch) {
        if (listTag !== 'ol') {
          closeList();
          listTag = 'ol';
          html.push('<ol class="vsbattle-md-ol">');
        }
        html.push('<li>' + formatInlineMarkdown(olMatch[1], escapeHtml) + '</li>');
        continue;
      }

      closeList();
      html.push('<p class="vsbattle-md-p">' + formatInlineMarkdown(line, escapeHtml) + '</p>');
    }

    closeList();
    if (isStreaming) {
      html.push('<span class="vsbattle-stream-cursor" aria-hidden="true"></span>');
    }
    return html.join('');
  }

  // ---------------------------------------------------------------------------
  // HTML Builders
  // ---------------------------------------------------------------------------
  function buildSelectOptionsHtml(sortedEntries, selectedKey, escapeHtml) {
    return sortedEntries
      .map(function (entry) {
        const key = entry[0];
        const p = entry[1];
        const plate = String(p.plate || 0).padStart(2, '0');
        const visitedMark = p.visited ? ' ✓' : '';
        const selectedAttr = key === selectedKey ? ' selected' : '';
        return (
          '<option value="' +
          escapeHtml(key) +
          '"' +
          selectedAttr +
          '>' +
          escapeHtml(plate + ' • ' + p.name + visitedMark) +
          '</option>'
        );
      })
      .join('');
  }

  function buildFighterCardHtml(sideClass, cornerLabel, key, p, escapeHtml) {
    const plate = String(p.plate || 0).padStart(2, '0');
    const bannerSrc = p.has_banner && p.banner_rel ? p.banner_rel : 'assets/banner.jpg';
    const regionIcon = REGION_ICONS[p.region_code] || '🧭';
    const visitedClass = p.visited ? 'is-visited' : 'is-unvisited';
    const visitedLabel = p.visited ? '✅ Ziyaret Edildi' : '🧭 Keşif Bekliyor';
    const quoteText = p.custom_quote || p.quote || (p.region + ' bölgesinin özgün menzili.');
    const libText = p.custom_library || p.library || (p.name + ' İl Halk Kütüphanesi');
    const landmarks = Array.isArray(p.landmarks) ? p.landmarks.slice(0, 3) : [];
    const specialties = Array.isArray(p.specialties) ? p.specialties.slice(0, 3) : [];

    return `
      <article class="glass-card vsbattle-fighter ${sideClass}">
        <div class="vsbattle-hero">
          <img
            class="vsbattle-hero-img"
            src="${escapeHtml(bannerSrc)}"
            alt="${escapeHtml(p.name)} manzarası"
            loading="lazy"
            onerror="if(this.dataset.fb!=='1'){this.dataset.fb='1';this.src='assets/banner.jpg';}"
          />
          <div class="vsbattle-hero-scrim"></div>
          <div class="vsbattle-hero-top">
            <span class="vsbattle-plate-badge">
              <span class="vsbattle-plate-tr">TR</span>
              <span>${escapeHtml(plate)}</span>
              <span style="opacity:0.75;font-weight:600;">• ${escapeHtml(cornerLabel)}</span>
            </span>
            <span class="vsbattle-visited-badge ${visitedClass}">${visitedLabel}</span>
          </div>
          <div class="vsbattle-hero-bottom">
            <h3 class="vsbattle-city-name">${escapeHtml(p.name)}</h3>
            <span class="vsbattle-region-badge">${regionIcon} ${escapeHtml(p.region || 'Anadolu')}</span>
          </div>
        </div>

        <div class="vsbattle-fighter-body">
          <blockquote class="vsbattle-quote">"${escapeHtml(quoteText)}"</blockquote>

          <div class="vsbattle-mini-block">
            <span class="vsbattle-mini-label">🏛️ Öne Çıkan Miraslar</span>
            <div class="vsbattle-chips">
              ${
                landmarks.length
                  ? landmarks.map(function (lm) { return '<span class="vsbattle-chip">' + escapeHtml(lm) + '</span>'; }).join('')
                  : '<span class="vsbattle-chip">Tarihî şehir merkezi</span>'
              }
            </div>
          </div>

          <div class="vsbattle-mini-block">
            <span class="vsbattle-mini-label">🍽️ Yöresel Lezzetler</span>
            <div class="vsbattle-chips">
              ${
                specialties.length
                  ? specialties.map(function (sp) { return '<span class="vsbattle-chip">' + escapeHtml(sp) + '</span>'; }).join('')
                  : '<span class="vsbattle-chip">Anadolu mutfağı</span>'
              }
            </div>
          </div>

          <div class="vsbattle-mini-block">
            <span class="vsbattle-mini-label">📚 Kütüphane Çalışma Ofisi</span>
            <div class="vsbattle-lib-snippet">${escapeHtml(libText)}</div>
          </div>

          <button
            type="button"
            class="btn btn-primary vsbattle-go-city-btn"
            data-city-key="${escapeHtml(key)}"
          >
            📍 Şehre Git (${escapeHtml(p.name)})
          </button>
        </div>
      </article>
    `;
  }

  function buildComparisonRowHtml(label, valA, displayA, valB, displayB, maxScale) {
    const safeMax = Math.max(1, maxScale, valA, valB);
    const pctA = valA > 0 ? Math.max(10, Math.round((valA / safeMax) * 100)) : 4;
    const pctB = valB > 0 ? Math.max(10, Math.round((valB / safeMax) * 100)) : 4;
    const leadA = valA > valB ? ' ★' : '';
    const leadB = valB > valA ? '★ ' : '';

    return `
      <div class="vsbattle-bar-row">
        <div class="vsbattle-bar-meta">
          <span class="vsbattle-bar-val-a">${displayA}${leadA}</span>
          <span class="vsbattle-bar-label">${label}</span>
          <span class="vsbattle-bar-val-b">${leadB}${displayB}</span>
        </div>
        <div class="vsbattle-bar-split">
          <div class="vsbattle-track vsbattle-track-a">
            <div class="vsbattle-fill-a" style="width: ${pctA}%;"></div>
          </div>
          <div class="vsbattle-track vsbattle-track-b">
            <div class="vsbattle-fill-b" style="width: ${pctB}%;"></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderVerdictContent(verdictBox, cached, cityA, cityB, escapeHtml) {
    if (!verdictBox) return;

    if (!cached || cached.status === 'idle') {
      verdictBox.innerHTML = `
        <div class="vsbattle-verdict-empty">
          <div style="font-size: 1.7rem;">⚖️</div>
          <div>
            <strong>${escapeHtml(cityA.name)}</strong> ve <strong>${escapeHtml(cityB.name)}</strong> için 5 kriterli uzman değerlendirmesi hazır bekliyor.
          </div>
          <div style="font-size: 0.8rem; opacity: 0.85;">
            Yukarıdaki <strong>"⚡ Gemini AI Uzman Hakem Kararı"</strong> düğmesine basarak yapay zekâ hakemini başlatabilirsin.
          </div>
        </div>
      `;
      return;
    }

    if (cached.status === 'streaming') {
      const liveText = cached.text || 'Uzman hakem her iki şehri 5 kriterde inceliyor...';
      verdictBox.innerHTML = `
        <div class="vsbattle-verdict-status">
          <span>⚡ Gemini AI Uzman Hakem Canlı Değerlendiriyor...</span>
          <span>5 Kriter Analizi</span>
        </div>
        <div class="vsbattle-verdict-content">
          ${renderMarkdownHtml(liveText, escapeHtml, true)}
        </div>
      `;
      return;
    }

    const isFallback = cached.mode === 'fallback';
    const metaParts = [];
    if (cached.model) metaParts.push(cached.model);
    if (typeof cached.latencyMs === 'number') metaParts.push(cached.latencyMs + ' ms');
    if (cached.cached) metaParts.push('Önbellek');
    const metaSuffix = metaParts.length ? ' • ' + metaParts.join(' • ') : '';
    const statusText = isFallback
      ? '🧭 Yerel Veri Tabanlı Hakem Özeti' + (cached.errorMsg ? ' (' + cached.errorMsg + ')' : '')
      : '✨ Gemini AI Uzman Hakem Kararı Tamamlandı (' + (cached.mode === 'stream' ? 'Canlı Akış' : 'Yanıt') + metaSuffix + ')';

    verdictBox.innerHTML = `
      <div class="vsbattle-verdict-status ${isFallback ? 'is-fallback' : ''}">
        <span>${escapeHtml(statusText)}</span>
        <span>${escapeHtml(cityA.name)} vs ${escapeHtml(cityB.name)}</span>
      </div>
      <div class="vsbattle-verdict-content">
        ${renderMarkdownHtml(cached.text, escapeHtml, false)}
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const data = safeCtx.data || (typeof window !== 'undefined' ? window.TRAVEL_DATA : null) || { provinces: {} };
    const provinces = data.provinces || {};
    const state = safeCtx.state || null;
    const escapeHtml = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const calcDistKm = typeof safeCtx.calcDistKm === 'function' ? safeCtx.calcDistKm : fallbackCalcDistKm;
    const showToast = typeof safeCtx.showToast === 'function' ? safeCtx.showToast : fallbackToast;
    const selectCity = typeof safeCtx.selectCity === 'function'
      ? safeCtx.selectCity
      : function (key) {
          if (typeof window !== 'undefined') {
            window.location.hash = '#city/' + encodeURIComponent(key);
          }
        };

    const sortedEntries = getSortedProvinceEntries(provinces);
    if (sortedEntries.length < 2) {
      container.innerHTML = `
        <div class="glass-card" style="padding: 24px; text-align: center;">
          <h3>⚔️ AI Şehir Düellosu</h3>
          <p style="color: var(--text-secondary); margin-top: 8px;">Düello için yeterli şehir verisi bulunamadı.</p>
        </div>
      `;
      return;
    }

    resolveInitialSelection(provinces, sortedEntries, state);

    const cityA = provinces[selectedKeyA];
    const cityB = provinces[selectedKeyB];
    const metricsA = getProvinceMetrics(cityA);
    const metricsB = getProvinceMetrics(cityB);

    const sameCity = selectedKeyA === selectedKeyB;
    const rawDistKm = sameCity
      ? 0
      : calcDistKm(Number(cityA.lat), Number(cityA.lng), Number(cityB.lat), Number(cityB.lng));
    const airKm = Number.isFinite(rawDistKm) ? Math.round(rawDistKm) : 0;
    const roadKm = Math.round(airKm * ROAD_FACTOR);
    const busTimeText = formatHoursMinutes(roadKm / BUS_SPEED_KMH);
    const distStats = { airKm, roadKm, busTimeText };

    const maxLandmarks = Math.max(metricsA.landmarks, metricsB.landmarks, 6);
    const maxSpecialties = Math.max(metricsA.specialties, metricsB.specialties, 6);
    let scoreWinsA = 0;
    let scoreWinsB = 0;
    if (metricsA.landmarks > metricsB.landmarks) scoreWinsA++;
    else if (metricsB.landmarks > metricsA.landmarks) scoreWinsB++;
    if (metricsA.specialties > metricsB.specialties) scoreWinsA++;
    else if (metricsB.specialties > metricsA.specialties) scoreWinsB++;
    if (metricsA.richnessScore > metricsB.richnessScore) scoreWinsA++;
    else if (metricsB.richnessScore > metricsA.richnessScore) scoreWinsB++;

    const hasSeyyahAi =
      typeof window !== 'undefined' &&
      window.SEYYAH_AI &&
      (typeof window.SEYYAH_AI.stream === 'function' || typeof window.SEYYAH_AI.ask === 'function');
    const hasApiKey =
      hasSeyyahAi && typeof window.SEYYAH_AI.hasKey === 'function' ? window.SEYYAH_AI.hasKey() : hasSeyyahAi;
    const activeModelName =
      hasSeyyahAi && typeof window.SEYYAH_AI.getModel === 'function' ? window.SEYYAH_AI.getModel() : '';
    const engineLabel = !hasSeyyahAi
      ? 'SEYYAH_AI Bekleniyor (Yerel Yedek Hazır)'
      : hasApiKey
        ? 'SEYYAH_AI Aktif' + (activeModelName ? ' (' + activeModelName + ')' : '')
        : 'SEYYAH_AI (API Anahtarı Yok — Yerel Yedek Hazır)';

    const pairKey = getPairCacheKey(selectedKeyA, selectedKeyB);
    const cachedVerdict = verdictCache.get(pairKey) || null;
    const isBusy = Boolean(cachedVerdict && cachedVerdict.status === 'streaming');

    const optionsA = buildSelectOptionsHtml(sortedEntries, selectedKeyA, escapeHtml);
    const optionsB = buildSelectOptionsHtml(sortedEntries, selectedKeyB, escapeHtml);

    container.innerHTML = `
      <div class="vsbattle-studio">
        <!-- Studio Header -->
        <section class="vsbattle-header">
          <div class="vsbattle-header-main">
            <h2 class="vsbattle-title">⚔️ AI Şehir Düellosu &amp; Uzman Hakem</h2>
            <p class="vsbattle-subtitle">
              81 il arasından iki menzil seç; gerçek görsel arena, Haversine otobüs mesafesi ve
              <strong>SEYYAH_AI</strong> 5 kriterli hakem kararıyla önce hangisine gideceğine karar ver.
            </p>
          </div>
          <div class="vsbattle-engine-pill ${hasSeyyahAi && hasApiKey ? '' : 'is-fallback'}">
            <span class="vsbattle-engine-dot"></span>
            <span>${escapeHtml(engineLabel)}</span>
          </div>
        </section>

        <!-- Dual Selectors + Random Duel -->
        <section class="glass-card vsbattle-controls">
          <div class="vsbattle-select-wrap">
            <label class="vsbattle-select-label" for="vsbattle-select-a">
              <span class="vsbattle-corner-dot corner-a"></span>
              <span>1. Köşe (Menzil A)</span>
            </label>
            <select id="vsbattle-select-a" class="vsbattle-select" aria-label="Birinci şehir seçimi">
              ${optionsA}
            </select>
          </div>

          <button type="button" id="vsbattle-btn-swap" class="btn btn-outline vsbattle-swap-btn" title="Şehirleri yer değiştir">
            ⇄
          </button>

          <div class="vsbattle-select-wrap">
            <label class="vsbattle-select-label" for="vsbattle-select-b">
              <span class="vsbattle-corner-dot corner-b"></span>
              <span>2. Köşe (Menzil B)</span>
            </label>
            <select id="vsbattle-select-b" class="vsbattle-select" aria-label="İkinci şehir seçimi">
              ${optionsB}
            </select>
          </div>

          <button type="button" id="vsbattle-btn-random" class="btn btn-primary vsbattle-random-btn" title="81 il arasından rastgele kapışma başlat">
            🎲 Rastgele Kapışma
          </button>
        </section>

        <!-- Split-Screen Visual Arena + Haversine Telemetry -->
        <section class="vsbattle-arena">
          ${buildFighterCardHtml('vsbattle-fighter-a', '1. Köşe', selectedKeyA, cityA, escapeHtml)}

          <div class="glass-card vsbattle-center-bridge">
            <div class="vsbattle-vs-emblem" aria-hidden="true">VS</div>

            <div class="vsbattle-dist-metric">
              <span class="vsbattle-dist-label">🦅 Haversine Mesafe</span>
              <span class="vsbattle-dist-val" style="color: var(--accent-cyan);">
                ${airKm.toLocaleString('tr-TR')} km
              </span>
              <span class="vsbattle-dist-sub">Karayolu ~${roadKm.toLocaleString('tr-TR')} km</span>
            </div>

            <div class="vsbattle-dist-metric">
              <span class="vsbattle-dist-label">🚌 Tahmini Otobüs</span>
              <span class="vsbattle-dist-val" style="color: var(--accent-emerald);">
                ${escapeHtml(busTimeText)}
              </span>
              <span class="vsbattle-dist-sub">~75 km/sa ortalama</span>
            </div>
          </div>

          ${buildFighterCardHtml('vsbattle-fighter-b', '2. Köşe', selectedKeyB, cityB, escapeHtml)}
        </section>

        <!-- 5-Axis SVG Radar / Spider Comparison Chart -->
        ${buildRadarSectionHtml(cityA, metricsA.radar, cityB, metricsB.radar, escapeHtml)}

        <!-- Deterministic Instant Comparison Bars -->
        <section class="glass-card vsbattle-bars-card">
          <div class="vsbattle-section-head">
            <h3 class="vsbattle-section-title">📊 Anlık Veri Karşılaştırması</h3>
            <span class="vsbattle-score-summary">
              ${escapeHtml(cityA.name)} <strong style="color:var(--accent-cyan);">${scoreWinsA}</strong>
              —
              <strong style="color:var(--accent-gold);">${scoreWinsB}</strong> ${escapeHtml(cityB.name)}
            </span>
          </div>

          <div class="vsbattle-duel-bars">
            ${buildComparisonRowHtml(
              '🏛️ Miras Sayısı',
              metricsA.landmarks,
              metricsA.landmarks + ' durak',
              metricsB.landmarks,
              metricsB.landmarks + ' durak',
              maxLandmarks
            )}
            ${buildComparisonRowHtml(
              '🍽️ Lezzet Sayısı',
              metricsA.specialties,
              metricsA.specialties + ' lezzet',
              metricsB.specialties,
              metricsB.specialties + ' lezzet',
              maxSpecialties
            )}
            ${buildComparisonRowHtml(
              '📚 Kütüphane &amp; 5 Gün Planı Zenginliği',
              metricsA.richnessScore,
              escapeHtml(metricsA.richnessLabel),
              metricsB.richnessScore,
              escapeHtml(metricsB.richnessLabel),
              100
            )}
          </div>
        </section>

        <!-- Gemini AI Expert Judge Studio -->
        <section class="glass-card vsbattle-ai-card">
          <div class="vsbattle-ai-top">
            <div style="display:flex;flex-direction:column;gap:8px;">
              <h3 class="vsbattle-section-title">⚖️ Uzman Hakem Değerlendirmesi</h3>
              <div class="vsbattle-ai-criteria-pills">
                ${CRITERIA.map(function (c) {
                  return '<span class="vsbattle-criteria-pill">' + c.icon + ' ' + escapeHtml(c.label) + '</span>';
                }).join('')}
              </div>
            </div>

            <button
              type="button"
              id="vsbattle-btn-judge"
              class="vsbattle-judge-btn"
              ${isBusy ? 'disabled' : ''}
            >
              ⚡ Gemini AI Uzman Hakem Kararı
            </button>
          </div>

          <div id="vsbattle-verdict-box" class="vsbattle-verdict-box" aria-live="polite"></div>
        </section>
      </div>
    `;

    const verdictBox = container.querySelector('#vsbattle-verdict-box');
    renderVerdictContent(verdictBox, cachedVerdict, cityA, cityB, escapeHtml);

    // Event bindings
    const selectAEl = container.querySelector('#vsbattle-select-a');
    const selectBEl = container.querySelector('#vsbattle-select-b');
    const swapBtn = container.querySelector('#vsbattle-btn-swap');
    const randomBtn = container.querySelector('#vsbattle-btn-random');
    const judgeBtn = container.querySelector('#vsbattle-btn-judge');

    if (selectAEl) {
      selectAEl.addEventListener('change', function () {
        selectedKeyA = selectAEl.value;
        if (state) state.aiBattleCityA = selectedKeyA;
        activeRequestId++;
        render(container, safeCtx);
      });
    }

    if (selectBEl) {
      selectBEl.addEventListener('change', function () {
        selectedKeyB = selectBEl.value;
        if (state) state.aiBattleCityB = selectedKeyB;
        activeRequestId++;
        render(container, safeCtx);
      });
    }

    if (swapBtn) {
      swapBtn.addEventListener('click', function () {
        const tmp = selectedKeyA;
        selectedKeyA = selectedKeyB;
        selectedKeyB = tmp;
        if (state) {
          state.aiBattleCityA = selectedKeyA;
          state.aiBattleCityB = selectedKeyB;
        }
        activeRequestId++;
        render(container, safeCtx);
        showToast('⇄ Düello köşeleri yer değiştirildi');
      });
    }

    if (randomBtn) {
      randomBtn.addEventListener('click', function () {
        if (sortedEntries.length < 2) return;
        const idxA = Math.floor(Math.random() * sortedEntries.length);
        let idxB = Math.floor(Math.random() * (sortedEntries.length - 1));
        if (idxB >= idxA) idxB += 1;

        selectedKeyA = sortedEntries[idxA][0];
        selectedKeyB = sortedEntries[idxB][0];
        if (state) {
          state.aiBattleCityA = selectedKeyA;
          state.aiBattleCityB = selectedKeyB;
        }
        activeRequestId++;
        render(container, safeCtx);
        showToast('🎲 Rastgele Kapışma: ' + provinces[selectedKeyA].name + ' vs ' + provinces[selectedKeyB].name);
      });
    }

    container.querySelectorAll('.vsbattle-go-city-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const targetKey = btn.getAttribute('data-city-key');
        if (targetKey) {
          selectCity(targetKey);
        }
      });
    });

    if (judgeBtn) {
      judgeBtn.addEventListener('click', async function () {
        const reqId = ++activeRequestId;
        const currentPairKey = getPairCacheKey(selectedKeyA, selectedKeyB);
        const currentCityA = provinces[selectedKeyA];
        const currentCityB = provinces[selectedKeyB];
        const currentMetricsA = getProvinceMetrics(currentCityA);
        const currentMetricsB = getProvinceMetrics(currentCityB);

        const aiReadyNow =
          typeof window !== 'undefined' &&
          window.SEYYAH_AI &&
          typeof window.SEYYAH_AI.hasKey === 'function' &&
          window.SEYYAH_AI.hasKey();

        // Instant API-keyless Knowledge-Graph referee synthesis (zero network delay)
        if (!aiReadyNow) {
          const instantText = buildOfflineJudgeFallback(
            currentCityA,
            currentCityB,
            currentMetricsA,
            currentMetricsB,
            distStats
          );
          const instantEntry = {
            status: 'done',
            mode: 'fallback',
            text: instantText,
            errorMsg: 'Anlık Bilgi Grafiği Hakemi'
          };
          verdictCache.set(currentPairKey, instantEntry);
          renderVerdictContent(verdictBox, instantEntry, currentCityA, currentCityB, escapeHtml);
          showToast('⚖️ Anlık Yerel Hakem Kararı hazır!');
          return;
        }

        judgeBtn.disabled = true;
        verdictCache.set(currentPairKey, {
          status: 'streaming',
          mode: 'stream',
          text: ''
        });
        renderVerdictContent(verdictBox, verdictCache.get(currentPairKey), currentCityA, currentCityB, escapeHtml);

        const aiPayload = buildJudgePrompt(selectedKeyA, currentCityA, selectedKeyB, currentCityB, distStats);

        try {
          const result = await invokeSeyyahAi(aiPayload, function (partialText) {
            if (reqId !== activeRequestId) return;
            const entry = { status: 'streaming', mode: 'stream', text: partialText };
            verdictCache.set(currentPairKey, entry);
            renderVerdictContent(verdictBox, entry, currentCityA, currentCityB, escapeHtml);
          });

          if (reqId !== activeRequestId) return;
          const doneEntry = {
            status: 'done',
            mode: result.mode || 'ask',
            text: result.text,
            model: result.model,
            latencyMs: result.latencyMs,
            cached: result.cached
          };
          verdictCache.set(currentPairKey, doneEntry);
          renderVerdictContent(verdictBox, doneEntry, currentCityA, currentCityB, escapeHtml);
          showToast('⚖️ Uzman hakem kararı hazır!');
        } catch (err) {
          if (reqId !== activeRequestId) return;
          const fallbackText = buildOfflineJudgeFallback(
            currentCityA,
            currentCityB,
            currentMetricsA,
            currentMetricsB,
            distStats
          );
          const fallbackEntry = {
            status: 'done',
            mode: 'fallback',
            text: fallbackText,
            errorMsg: err && err.message ? err.message : 'AI bağlantısı kurulamadı'
          };
          verdictCache.set(currentPairKey, fallbackEntry);
          renderVerdictContent(verdictBox, fallbackEntry, currentCityA, currentCityB, escapeHtml);
          showToast('🧭 AI yanıt veremedi, yerel hakem özeti oluşturuldu');
        } finally {
          if (reqId === activeRequestId) {
            judgeBtn.disabled = false;
          }
        }
      });
    }
  }

  if (typeof window !== 'undefined') {
    window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
    window.SEYYAH_MODULES.aiBattle = {
      render: render
    };
  }
})();
