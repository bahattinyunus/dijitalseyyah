/**
 * 🛂 Dijital Seyyah Pasaportu (81 İl Özel SVG Mühür Damgaları)
 * Luxury Digital Travel Passport Cover, Regional & Status Filters,
 * 81 Procedural Vintage SVG Ink Stamps, and Pure-Vector HTML5 Canvas PNG Export.
 * Registers on window.SEYYAH_MODULES.passport
 */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const PASSPORT_NO = 'TR-SYH-2026-081';
  const STYLE_ID = 'seyyah-passport-styles';
  const PROFILE_STORAGE_KEY = 'dijital_seyyah_passport_profile_v1';

  function loadPassportProfile() {
    const fallback = { travelerName: 'Dijital Seyyah', travelerTitle: 'Anadolu Kâşifi' };
    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return fallback;
      return {
        travelerName: typeof parsed.travelerName === 'string' && parsed.travelerName.trim()
          ? parsed.travelerName.trim().slice(0, 48)
          : fallback.travelerName,
        travelerTitle: typeof parsed.travelerTitle === 'string' && parsed.travelerTitle.trim()
          ? parsed.travelerTitle.trim().slice(0, 56)
          : fallback.travelerTitle
      };
    } catch (_) {
      return fallback;
    }
  }

  function savePassportProfile(profile) {
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
        travelerName: String(profile.travelerName || '').trim().slice(0, 48),
        travelerTitle: String(profile.travelerTitle || '').trim().slice(0, 56)
      }));
    } catch (_) {
      // Ignore storage quota/privacy restrictions
    }
  }

  function toMrzToken(str) {
    return String(str || 'SEYYAH')
      .replace(/İ/g, 'I').replace(/ı/g, 'I').replace(/ç/gi, 'C')
      .replace(/ğ/gi, 'G').replace(/ö/gi, 'O').replace(/ş/gi, 'S').replace(/ü/gi, 'U')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '<')
      .replace(/^<+|<+$/g, '') || 'SEYYAH';
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
    '01_Marmara': { name: 'Marmara Bölgesi', shortName: 'Marmara', icon: '🏰', color: '#38bdf8' },
    '02_Ege': { name: 'Ege Bölgesi', shortName: 'Ege', icon: '🌊', color: '#34d399' },
    '03_Akdeniz': { name: 'Akdeniz Bölgesi', shortName: 'Akdeniz', icon: '☀️', color: '#f59e0b' },
    '04_IcAnadolu': { name: 'İç Anadolu Bölgesi', shortName: 'İç Anadolu', icon: '🌾', color: '#fbbf24' },
    '05_Karadeniz': { name: 'Karadeniz Bölgesi', shortName: 'Karadeniz', icon: '🌲', color: '#10b981' },
    '06_DoguAnadolu': { name: 'Doğu Anadolu Bölgesi', shortName: 'Doğu Anadolu', icon: '🏔️', color: '#a855f7' },
    '07_GuneydoguAnadolu': { name: 'Güneydoğu Anadolu Bölgesi', shortName: 'Güneydoğu', icon: '🏜️', color: '#f97316' }
  };

  // Module-scoped UI filter state
  const uiState = {
    region: 'all',      // 'all' | region_code
    status: 'all',      // 'all' | 'visited' | 'unvisited'
    sortBy: 'plate'     // 'plate' | 'name' | 'visited'
  };

  // Fallback HTML escaper
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

  function notify(msg, ctx) {
    if (ctx && typeof ctx.showToast === 'function') {
      ctx.showToast(msg);
    }
  }

  function padPlate(plate) {
    const n = Number(plate) || 0;
    return n < 10 ? '0' + n : String(n);
  }

  function toTurkishUpper(str) {
    if (!str) return '';
    try {
      return String(str).toLocaleUpperCase('tr-TR');
    } catch (e) {
      return String(str).toUpperCase();
    }
  }

  // Deterministic tilt angle between -6deg and +6deg by plate
  function getStampAngle(plate) {
    const p = Number(plate) || 1;
    const raw = ((p * 17 + 5) % 13) - 6; // -6 .. +6
    return raw === 0 ? (p % 2 === 0 ? 2 : -2) : raw;
  }

  // Deterministic stamp geometry variant: 0 = circular, 1 = octagonal, 2 = notched-seal
  function getStampShape(plate) {
    const p = Number(plate) || 1;
    return p % 3;
  }

  function hexToRgba(hex, alpha) {
    const clean = (hex || '#38bdf8').replace('#', '');
    const full = clean.length === 3
      ? clean.split('').map(c => c + c).join('')
      : clean;
    const num = parseInt(full, 16);
    if (isNaN(num)) return `rgba(56, 189, 248, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sp-root {
        max-width: 1280px;
        margin: 0 auto;
        padding: 4px 0 40px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        animation: spFadeIn 0.35s ease;
      }

      @keyframes spFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* === LUXURY PASSPORT COVER HEADER === */
      .sp-cover {
        position: relative;
        border-radius: 20px;
        padding: 26px 28px 20px;
        background:
          radial-gradient(circle at 12% 18%, rgba(212, 163, 74, 0.16) 0%, transparent 45%),
          radial-gradient(circle at 88% 82%, rgba(56, 189, 248, 0.12) 0%, transparent 45%),
          repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.015) 0px,
            rgba(255, 255, 255, 0.015) 2px,
            transparent 2px,
            transparent 8px
          ),
          linear-gradient(135deg, #1b0c18 0%, #2a1021 38%, #101932 100%);
        border: 1.5px solid rgba(212, 163, 74, 0.45);
        box-shadow:
          0 20px 45px -12px rgba(0, 0, 0, 0.65),
          inset 0 0 0 6px rgba(10, 15, 29, 0.35),
          inset 0 0 0 7.5px rgba(212, 163, 74, 0.25);
        color: #f8fafc;
        overflow: hidden;
      }

      .sp-cover::before {
        content: '';
        position: absolute;
        inset: 10px;
        border: 1px dashed rgba(212, 163, 74, 0.22);
        border-radius: 14px;
        pointer-events: none;
      }

      .sp-cover-top {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .sp-identity {
        display: flex;
        align-items: center;
        gap: 18px;
        min-width: 260px;
        flex: 1 1 360px;
      }

      .sp-emblem-wrap {
        width: 82px;
        height: 82px;
        flex-shrink: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(245, 197, 94, 0.18) 0%, rgba(212, 163, 74, 0.04) 70%);
        border: 1.5px solid rgba(245, 197, 94, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 24px rgba(245, 158, 11, 0.22), inset 0 0 12px rgba(245, 197, 94, 0.18);
      }

      .sp-title-block {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .sp-republic {
        font-size: 0.72rem;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #e6c27a;
        font-weight: 700;
      }

      .sp-main-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.35rem, 2.3vw, 1.85rem);
        font-weight: 800;
        letter-spacing: 0.04em;
        background: linear-gradient(135deg, #fff5d6 0%, #f5c55e 45%, #d49635 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.15;
      }

      .sp-meta-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        margin-top: 4px;
      }

      .sp-rank-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 999px;
        background: rgba(245, 197, 94, 0.16);
        border: 1px solid rgba(245, 197, 94, 0.42);
        color: #fde68a;
        font-size: 0.8rem;
        font-weight: 700;
      }

      .sp-passport-no {
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.82rem;
        letter-spacing: 0.12em;
        padding: 4px 10px;
        border-radius: 6px;
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: #cbd5e1;
      }

      .sp-stats-cluster {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }

      .sp-stat-box {
        min-width: 112px;
        padding: 10px 14px;
        border-radius: 12px;
        background: rgba(10, 15, 29, 0.55);
        border: 1px solid rgba(212, 163, 74, 0.28);
        text-align: center;
      }

      .sp-stat-val {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
        color: #fef3c7;
        line-height: 1.15;
      }

      .sp-stat-val.sp-accent-cyan {
        color: #38bdf8;
      }

      .sp-stat-val.sp-accent-emerald {
        color: #34d399;
      }

      .sp-stat-lbl {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #cbd5e1;
        margin-top: 2px;
      }

      .sp-download-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 18px;
        border-radius: 12px;
        border: 1px solid rgba(245, 197, 94, 0.65);
        background: linear-gradient(135deg, #d99b26 0%, #f5c55e 50%, #c6831c 100%);
        color: #1a1205;
        font-weight: 800;
        font-size: 0.86rem;
        cursor: pointer;
        box-shadow: 0 8px 20px rgba(217, 155, 38, 0.28);
        transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        white-space: nowrap;
      }

      .sp-download-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 26px rgba(245, 197, 94, 0.4);
        filter: brightness(1.06);
      }

      .sp-download-btn:active {
        transform: translateY(0);
      }

      /* Progress bar inside cover */
      .sp-progress-wrap {
        position: relative;
        z-index: 1;
        margin-top: 18px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .sp-progress-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.78rem;
        color: #cbd5e1;
      }

      .sp-progress-track {
        height: 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }

      .sp-progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #d4a34a 0%, #f5c55e 50%, #34d399 100%);
        box-shadow: 0 0 14px rgba(245, 197, 94, 0.5);
        transition: width 0.5s ease;
      }

      /* Machine Readable Zone (MRZ) */
      .sp-mrz {
        position: relative;
        z-index: 1;
        margin-top: 16px;
        padding: 8px 12px;
        border-radius: 8px;
        background: rgba(5, 9, 18, 0.52);
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.72rem;
        letter-spacing: 0.16em;
        color: rgba(226, 232, 240, 0.65);
        line-height: 1.45;
        overflow-x: auto;
        white-space: nowrap;
        user-select: all;
      }

      /* === FILTER BAR === */
      .sp-controls {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px 18px;
        border-radius: 16px;
        background: var(--bg-card, rgba(30, 41, 59, 0.7));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
      }

      .sp-controls-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .sp-pill-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .sp-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 13px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .sp-pill:hover {
        border-color: rgba(245, 197, 94, 0.45);
        color: var(--text-primary, #f8fafc);
        transform: translateY(-1px);
      }

      .sp-pill.active {
        background: rgba(245, 197, 94, 0.18);
        border-color: rgba(245, 197, 94, 0.7);
        color: #fde68a;
        box-shadow: 0 0 14px rgba(245, 197, 94, 0.18);
      }

      .sp-pill-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .sp-pill-count {
        font-size: 0.72rem;
        opacity: 0.85;
        padding: 1px 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
      }

      .sp-status-group {
        display: inline-flex;
        padding: 4px;
        border-radius: 999px;
        background: rgba(10, 15, 29, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        gap: 4px;
      }

      .sp-status-btn {
        padding: 6px 13px;
        border-radius: 999px;
        border: none;
        background: transparent;
        color: var(--text-secondary, #94a3b8);
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .sp-status-btn:hover {
        color: var(--text-primary, #f8fafc);
      }

      .sp-status-btn.active {
        background: linear-gradient(135deg, rgba(212, 163, 74, 0.35), rgba(245, 197, 94, 0.22));
        color: #fef3c7;
        box-shadow: inset 0 0 0 1px rgba(245, 197, 94, 0.5);
      }

      .sp-sort-select {
        padding: 7px 12px;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.75);
        color: var(--text-primary, #f8fafc);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
      }

      /* === PASSPORT PAGE (STAMP BOOK) === */
      .sp-page {
        position: relative;
        border-radius: 20px;
        padding: 24px 22px 28px;
        background:
          radial-gradient(circle at 50% 0%, rgba(212, 163, 74, 0.08) 0%, transparent 55%),
          repeating-linear-gradient(
            0deg,
            rgba(212, 163, 74, 0.025) 0px,
            rgba(212, 163, 74, 0.025) 1px,
            transparent 1px,
            transparent 26px
          ),
          linear-gradient(180deg, rgba(22, 31, 50, 0.92) 0%, rgba(15, 23, 42, 0.96) 100%);
        border: 1px solid rgba(212, 163, 74, 0.26);
        box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.25);
      }

      .sp-page-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding-bottom: 14px;
        margin-bottom: 20px;
        border-bottom: 1px dashed rgba(212, 163, 74, 0.3);
      }

      .sp-page-label {
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.8rem;
        letter-spacing: 0.16em;
        color: #e6c27a;
        text-transform: uppercase;
        font-weight: 700;
      }

      .sp-page-counter {
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* === 81 STAMP GRID === */
      .sp-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
        gap: 16px;
      }

      .sp-stamp-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 12px 10px;
        min-height: 186px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.42);
        border: 1px solid rgba(255, 255, 255, 0.07);
        cursor: pointer;
        text-align: center;
        color: inherit;
        font-family: inherit;
        transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                    border-color 0.25s ease,
                    box-shadow 0.25s ease,
                    background 0.25s ease;
      }

      .sp-stamp-card:focus-visible {
        outline: 2px solid #f5c55e;
        outline-offset: 2px;
      }

      .sp-stamp-card.is-visited {
        background: radial-gradient(circle at 50% 45%, var(--stamp-tint, rgba(56, 189, 248, 0.1)) 0%, rgba(15, 23, 42, 0.5) 75%);
        border-color: var(--stamp-border, rgba(255, 255, 255, 0.12));
      }

      .sp-stamp-card.is-visited:hover {
        transform: translateY(-4px) scale(1.02);
        border-color: var(--stamp-color, #38bdf8);
        box-shadow: 0 12px 28px -8px var(--stamp-glow, rgba(56, 189, 248, 0.35));
      }

      .sp-stamp-svg-wrap {
        width: 146px;
        height: 146px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(var(--stamp-angle, 0deg));
        transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), filter 0.3s ease;
        filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
      }

      .sp-stamp-card.is-visited:hover .sp-stamp-svg-wrap {
        transform: rotate(0deg) scale(1.05);
        filter: drop-shadow(0 4px 12px var(--stamp-glow, rgba(56, 189, 248, 0.4)));
      }

      .sp-stamp-svg {
        width: 100%;
        height: 100%;
        overflow: visible;
      }

      .sp-stamp-region-tag {
        margin-top: 4px;
        font-size: 0.7rem;
        color: var(--text-secondary, #94a3b8);
        display: inline-flex;
        align-items: center;
        gap: 4px;
        opacity: 0.85;
      }

      /* Empty Unvisited Passport Slot */
      .sp-stamp-card.is-empty {
        background: rgba(10, 15, 29, 0.32);
        border: 2px dashed rgba(148, 163, 184, 0.24);
        justify-content: space-between;
        padding: 16px 12px;
      }

      .sp-stamp-card.is-empty:hover {
        border-color: rgba(245, 197, 94, 0.55);
        background: rgba(30, 41, 59, 0.48);
        transform: translateY(-3px);
      }

      .sp-empty-plate {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 1.5px dashed rgba(148, 163, 184, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-muted, #64748b);
      }

      .sp-empty-city {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.96rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        margin-top: 6px;
      }

      .sp-empty-status {
        font-size: 0.67rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: var(--text-muted, #64748b);
        padding: 4px 8px;
        border-radius: 6px;
        background: rgba(148, 163, 184, 0.08);
        margin-top: 8px;
      }

      .sp-empty-msg {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px 20px;
        color: var(--text-secondary, #94a3b8);
        font-size: 0.95rem;
      }

      /* Custom Traveler Inscription Bar */
      .sp-inscription-bar {
        position: relative;
        z-index: 1;
        margin-top: 14px;
        padding: 10px 14px;
        border-radius: 12px;
        background: rgba(10, 15, 29, 0.52);
        border: 1px solid rgba(212, 163, 74, 0.3);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
      }

      .sp-inscription-label {
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #e6c27a;
        white-space: nowrap;
      }

      .sp-inscription-input {
        flex: 1 1 160px;
        min-width: 140px;
        padding: 7px 11px;
        border-radius: 8px;
        border: 1px solid rgba(245, 197, 94, 0.32);
        background: rgba(15, 23, 42, 0.78);
        color: #f8fafc;
        font-size: 0.82rem;
        font-weight: 600;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .sp-inscription-input:focus {
        border-color: #f5c55e;
        box-shadow: 0 0 0 2px rgba(245, 197, 94, 0.2);
      }

      .sp-inscription-save {
        padding: 7px 13px;
        border-radius: 8px;
        border: 1px solid rgba(245, 197, 94, 0.55);
        background: rgba(245, 197, 94, 0.18);
        color: #fde68a;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .sp-inscription-save:hover {
        background: rgba(245, 197, 94, 0.3);
        color: #ffffff;
      }

      .sp-holder-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 11px;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.14);
        border: 1px solid rgba(56, 189, 248, 0.35);
        color: #bae6fd;
        font-size: 0.79rem;
        font-weight: 700;
      }

      /* Light theme harmony */
      body.light-theme .sp-controls,
      body[data-theme="light"] .sp-controls,
      [data-theme="light"] .sp-controls {
        background: rgba(255, 255, 255, 0.88);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .sp-pill,
      body[data-theme="light"] .sp-pill,
      [data-theme="light"] .sp-pill {
        background: rgba(241, 245, 249, 0.9);
        color: #334155;
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .sp-pill.active,
      body[data-theme="light"] .sp-pill.active,
      [data-theme="light"] .sp-pill.active {
        background: #fef3c7;
        color: #92400e;
        border-color: #d97706;
      }

      body.light-theme .sp-status-group,
      body[data-theme="light"] .sp-status-group,
      [data-theme="light"] .sp-status-group {
        background: #f1f5f9;
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .sp-status-btn,
      body[data-theme="light"] .sp-status-btn,
      [data-theme="light"] .sp-status-btn {
        color: #475569;
      }

      body.light-theme .sp-status-btn.active,
      body[data-theme="light"] .sp-status-btn.active,
      [data-theme="light"] .sp-status-btn.active {
        background: #ffffff;
        color: #92400e;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      }

      body.light-theme .sp-sort-select,
      body[data-theme="light"] .sp-sort-select,
      [data-theme="light"] .sp-sort-select {
        background: #ffffff;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.15);
      }

      body.light-theme .sp-page,
      body[data-theme="light"] .sp-page,
      [data-theme="light"] .sp-page {
        background:
          radial-gradient(circle at 50% 0%, rgba(217, 155, 38, 0.1) 0%, transparent 55%),
          repeating-linear-gradient(
            0deg,
            rgba(180, 130, 50, 0.05) 0px,
            rgba(180, 130, 50, 0.05) 1px,
            transparent 1px,
            transparent 26px
          ),
          linear-gradient(180deg, #fcfaf2 0%, #f5efe0 100%);
        border-color: rgba(180, 130, 50, 0.35);
        box-shadow: inset 0 0 30px rgba(146, 108, 42, 0.08);
      }

      body.light-theme .sp-page-label,
      body[data-theme="light"] .sp-page-label,
      [data-theme="light"] .sp-page-label {
        color: #92400e;
      }

      body.light-theme .sp-stamp-card.is-visited,
      body[data-theme="light"] .sp-stamp-card.is-visited,
      [data-theme="light"] .sp-stamp-card.is-visited {
        background: rgba(255, 255, 255, 0.72);
      }

      body.light-theme .sp-stamp-card.is-empty,
      body[data-theme="light"] .sp-stamp-card.is-empty,
      [data-theme="light"] .sp-stamp-card.is-empty {
        background: rgba(255, 255, 255, 0.45);
        border-color: rgba(100, 116, 139, 0.35);
      }

      @media (max-width: 680px) {
        .sp-cover {
          padding: 20px 16px 16px;
        }
        .sp-grid {
          grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
          gap: 12px;
        }
        .sp-stamp-svg-wrap {
          width: 130px;
          height: 130px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Gold Embossed Seljuk Star & Compass Emblem SVG for Passport Cover
  function renderCoverEmblemSvg() {
    return `
      <svg width="64" height="64" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="spGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff4cc"/>
            <stop offset="50%" stop-color="#f5c55e"/>
            <stop offset="100%" stop-color="#b87718"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="none" stroke="url(#spGoldGrad)" stroke-width="2" stroke-dasharray="3 2"/>
        <circle cx="50" cy="50" r="39" fill="none" stroke="url(#spGoldGrad)" stroke-width="1.2"/>
        <!-- 8-pointed Seljuk Star (two overlapping rotated squares) -->
        <rect x="27" y="27" width="46" height="46" fill="none" stroke="url(#spGoldGrad)" stroke-width="2.4"/>
        <rect x="27" y="27" width="46" height="46" fill="none" stroke="url(#spGoldGrad)" stroke-width="2.4" transform="rotate(45 50 50)"/>
        <circle cx="50" cy="50" r="14" fill="rgba(245,197,94,0.16)" stroke="url(#spGoldGrad)" stroke-width="1.8"/>
        <!-- Inner Compass Star -->
        <polygon points="50,39 53,47 61,50 53,53 50,61 47,53 39,50 47,47" fill="url(#spGoldGrad)"/>
      </svg>
    `;
  }

  // Procedural Vintage SVG Ink Stamp for a Visited Province
  function renderVisitedStampSvg(city, regionColor, ctx) {
    const plateStr = padPlate(city.plate);
    const cityUpper = toTurkishUpper(city.name);
    const safeCity = safeEscape(cityUpper, ctx);
    const shape = getStampShape(city.plate);
    const color = regionColor || '#38bdf8';
    const uid = `sp-${city.plate}`;

    // Adjust city font size for longer Turkish names (e.g. Kahramanmaraş, Afyonkarahisar)
    let cityFontSize = 13.5;
    if (cityUpper.length > 13) cityFontSize = 9.5;
    else if (cityUpper.length > 10) cityFontSize = 10.8;
    else if (cityUpper.length > 8) cityFontSize = 12;

    // Outer & inner geometric frames depending on deterministic shape
    let frameMarkup = '';
    if (shape === 0) {
      // Classic Double-Ring Circular Passport Stamp
      frameMarkup = `
        <circle cx="80" cy="80" r="73" fill="${hexToRgba(color, 0.06)}" stroke="${color}" stroke-width="3.2"/>
        <circle cx="80" cy="80" r="66" fill="none" stroke="${color}" stroke-width="1.4" stroke-dasharray="4 3"/>
        <circle cx="80" cy="80" r="47" fill="none" stroke="${color}" stroke-width="1.2" opacity="0.75"/>
      `;
    } else if (shape === 1) {
      // Vintage Octagonal Seljuk Stamp
      frameMarkup = `
        <polygon points="50,8 110,8 152,50 152,110 110,152 50,152 8,110 8,50"
                 fill="${hexToRgba(color, 0.06)}" stroke="${color}" stroke-width="3.2" stroke-linejoin="round"/>
        <polygon points="53,15 107,15 145,53 145,107 107,145 53,145 15,107 15,53"
                 fill="none" stroke="${color}" stroke-width="1.3" stroke-dasharray="4 2.5" stroke-linejoin="round"/>
        <circle cx="80" cy="80" r="47" fill="none" stroke="${color}" stroke-width="1.1" opacity="0.7"/>
      `;
    } else {
      // Scalloped / Double-Notched Seal Stamp
      frameMarkup = `
        <circle cx="80" cy="80" r="73" fill="${hexToRgba(color, 0.06)}" stroke="${color}" stroke-width="3.5" stroke-dasharray="9 3"/>
        <circle cx="80" cy="80" r="67" fill="none" stroke="${color}" stroke-width="2"/>
        <circle cx="80" cy="80" r="47" fill="none" stroke="${color}" stroke-width="1.2" stroke-dasharray="2.5 2.5" opacity="0.85"/>
      `;
    }

    return `
      <svg class="sp-stamp-svg" viewBox="0 0 160 160" role="img" aria-label="${safeCity} mühür damgası">
        <defs>
          <path id="${uid}-top" d="M 24,80 A 56,56 0 1,1 136,80"/>
          <path id="${uid}-bot" d="M 136,80 A 56,56 0 1,1 24,80"/>
        </defs>
        ${frameMarkup}

        <!-- Curved Top Arc: ANADOLU SEYYAH -->
        <text fill="${color}" font-size="8.2" font-weight="800" letter-spacing="2.2" opacity="0.92">
          <textPath href="#${uid}-top" startOffset="50%" text-anchor="middle">★ ANADOLU SEYYAH ★</textPath>
        </text>

        <!-- Curved Bottom Arc: TEFEKKÜR EDİLDİ ✓ -->
        <text fill="${color}" font-size="7.8" font-weight="800" letter-spacing="1.3" opacity="0.95">
          <textPath href="#${uid}-bot" startOffset="50%" text-anchor="middle">TEFEKKÜR EDİLDİ ✓</textPath>
        </text>

        <!-- Side Star Ornaments -->
        <text x="19" y="84" fill="${color}" font-size="9" text-anchor="middle" opacity="0.85">✦</text>
        <text x="141" y="84" fill="${color}" font-size="9" text-anchor="middle" opacity="0.85">✦</text>

        <!-- Center Stamp Banner Lines -->
        <line x1="38" y1="62" x2="122" y2="62" stroke="${color}" stroke-width="1.1" opacity="0.6"/>
        <line x1="38" y1="98" x2="122" y2="98" stroke="${color}" stroke-width="1.1" opacity="0.6"/>

        <!-- Plate Number -->
        <text x="80" y="55" fill="${color}" font-family="Outfit, sans-serif" font-size="16" font-weight="900" text-anchor="middle" letter-spacing="1.5">${plateStr}</text>

        <!-- City Name -->
        <text x="80" y="84" fill="${color}" font-family="Outfit, sans-serif" font-size="${cityFontSize}" font-weight="900" text-anchor="middle" letter-spacing="0.8">${safeCity}</text>

        <!-- Verified Check Footer inside Center -->
        <text x="80" y="113" fill="${color}" font-family="monospace" font-size="7.6" font-weight="800" text-anchor="middle" letter-spacing="0.9" opacity="0.9">TR-${plateStr} • MÜHÜR</text>
      </svg>
    `;
  }

  // Helper: Draw a rounded rectangle path on Canvas 2D
  function canvasRoundRect(c, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + radius, y);
    c.arcTo(x + w, y, x + w, y + h, radius);
    c.arcTo(x + w, y + h, x, y + h, radius);
    c.arcTo(x, y + h, x, y, radius);
    c.arcTo(x, y, x + w, y, radius);
    c.closePath();
  }

  // Helper: Draw an 8-pointed Seljuk star emblem purely with Canvas 2D vector ops
  function drawSeljukEmblem(c, cx, cy, r) {
    c.save();
    c.translate(cx, cy);

    // Outer dashed ring
    c.strokeStyle = '#f5c55e';
    c.lineWidth = 2;
    c.setLineDash([4, 3]);
    c.beginPath();
    c.arc(0, 0, r, 0, Math.PI * 2);
    c.stroke();

    // Inner solid ring
    c.setLineDash([]);
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(0, 0, r * 0.86, 0, Math.PI * 2);
    c.stroke();

    // Two rotated squares
    const s = r * 1.02;
    c.lineWidth = 2.2;
    c.strokeRect(-s / 2, -s / 2, s, s);
    c.rotate(Math.PI / 4);
    c.strokeRect(-s / 2, -s / 2, s, s);

    // Center star
    c.rotate(-Math.PI / 4);
    c.fillStyle = '#f5c55e';
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      const rad = i % 2 === 0 ? r * 0.34 : r * 0.14;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    c.fill();
    c.restore();
  }

  // Pure-Vector Offscreen Canvas Export (NEVER taints on file:// or https://)
  function exportPassportPng(data, provincesList, regionsMap, ctx) {
    try {
      const W = 1600;
      const H = 1140;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const c = canvas.getContext('2d');

      const total = provincesList.length || 81;
      const visitedList = provincesList.filter(p => p.visited);
      const visitedCount = visitedList.length;
      const remainingCount = total - visitedCount;
      const pct = total > 0 ? ((visitedCount / total) * 100).toFixed(1) : '0.0';
      const rankTitle = (data && data.achievements && data.achievements.rank && data.achievements.rank.title)
        ? data.achievements.rank.title
        : 'Anadolu Kâşifi';
      const profile = loadPassportProfile();
      const holderNameUpper = toTurkishUpper(profile.travelerName || 'Dijital Seyyah');
      const holderTitleUpper = toTurkishUpper(profile.travelerTitle || rankTitle);

      // 1. Luxury Deep Burgundy-Midnight Background
      const bgGrad = c.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#120914');
      bgGrad.addColorStop(0.45, '#1c1024');
      bgGrad.addColorStop(1, '#0b1428');
      c.fillStyle = bgGrad;
      c.fillRect(0, 0, W, H);

      // Subtle guilloché background lines
      c.save();
      c.strokeStyle = 'rgba(245, 197, 94, 0.04)';
      c.lineWidth = 1;
      for (let i = -H; i < W + H; i += 28) {
        c.beginPath();
        c.moveTo(i, 0);
        c.lineTo(i + H, H);
        c.stroke();
      }
      c.restore();

      // 2. Gold Double Passport Frame
      canvasRoundRect(c, 24, 24, W - 48, H - 48, 22);
      c.strokeStyle = 'rgba(245, 197, 94, 0.65)';
      c.lineWidth = 3;
      c.stroke();

      canvasRoundRect(c, 36, 36, W - 72, H - 72, 16);
      c.strokeStyle = 'rgba(245, 197, 94, 0.25)';
      c.lineWidth = 1.2;
      c.setLineDash([6, 4]);
      c.stroke();
      c.setLineDash([]);

      // 3. Top Header Section
      drawSeljukEmblem(c, 118, 114, 44);

      c.fillStyle = '#e6c27a';
      c.font = 'bold 14px "Segoe UI", Arial, sans-serif';
      c.fillText('TÜRKİYE CUMHURİYETİ  •  ANADOLU SEYAHATNAMESİ', 184, 86);

      c.fillStyle = '#fff5d6';
      c.font = 'bold 34px "Segoe UI", Arial, sans-serif';
      c.fillText('DİJİTAL SEYYAH PASAPORTU', 184, 124);

      c.fillStyle = '#cbd5e1';
      c.font = 'bold 16px "Courier New", monospace';
      c.fillText(`SEYYAH: ${holderNameUpper}   |   UNVAN: ${holderTitleUpper}   |   NO: ${PASSPORT_NO}`, 184, 152);

      // Right-hand Stat Pills
      const statCards = [
        { label: 'MÜHÜR SAYISI', value: `${visitedCount} / ${total}`, color: '#34d399' },
        { label: 'KALAN ŞEHİR', value: String(remainingCount), color: '#f5c55e' },
        { label: 'TAMAMLANMA', value: `%${pct}`, color: '#38bdf8' }
      ];
      statCards.forEach((sc, idx) => {
        const bx = W - 498 + idx * 150;
        const by = 72;
        canvasRoundRect(c, bx, by, 138, 84, 12);
        c.fillStyle = 'rgba(10, 15, 29, 0.72)';
        c.fill();
        c.strokeStyle = 'rgba(245, 197, 94, 0.35)';
        c.lineWidth = 1.4;
        c.stroke();

        c.fillStyle = sc.color;
        c.font = 'bold 26px "Segoe UI", Arial, sans-serif';
        c.textAlign = 'center';
        c.fillText(sc.value, bx + 69, by + 44);

        c.fillStyle = '#94a3b8';
        c.font = 'bold 11px "Segoe UI", Arial, sans-serif';
        c.fillText(sc.label, bx + 69, by + 68);
      });
      c.textAlign = 'left';

      // Divider
      c.strokeStyle = 'rgba(245, 197, 94, 0.28)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(58, 178);
      c.lineTo(W - 58, 178);
      c.stroke();

      // 4. Regional Progress Strip (7 Regions)
      const regGap = 14;
      const regTotalW = W - 116;
      const regW = (regTotalW - regGap * 6) / 7;
      REGION_ORDER.forEach((code, idx) => {
        const reg = regionsMap[code] || DEFAULT_REGIONS[code];
        const rx = 58 + idx * (regW + regGap);
        const ry = 194;
        const rPct = reg.total > 0 ? reg.visited / reg.total : 0;

        canvasRoundRect(c, rx, ry, regW, 54, 10);
        c.fillStyle = 'rgba(15, 23, 42, 0.75)';
        c.fill();
        c.strokeStyle = hexToRgba(reg.color, 0.38);
        c.lineWidth = 1.2;
        c.stroke();

        c.fillStyle = '#f8fafc';
        c.font = 'bold 12px "Segoe UI", Arial, sans-serif';
        c.fillText(reg.shortName || reg.name, rx + 10, ry + 20);

        c.fillStyle = reg.color;
        c.font = 'bold 12px "Courier New", monospace';
        c.textAlign = 'right';
        c.fillText(`${reg.visited}/${reg.total}`, rx + regW - 10, ry + 20);
        c.textAlign = 'left';

        // Mini progress bar
        canvasRoundRect(c, rx + 10, ry + 34, regW - 20, 7, 4);
        c.fillStyle = 'rgba(255, 255, 255, 0.1)';
        c.fill();
        if (rPct > 0) {
          canvasRoundRect(c, rx + 10, ry + 34, Math.max(8, (regW - 20) * rPct), 7, 4);
          c.fillStyle = reg.color;
          c.fill();
        }
      });

      // 5. 81 Mini Passport Stamps Grid (9 x 9)
      const sortedByPlate = [...provincesList].sort((a, b) => (a.plate || 0) - (b.plate || 0));
      const cols = 9;
      const rows = 9;
      const gridX = 58;
      const gridY = 266;
      const gridW = W - 116;
      const gridH = 765;
      const cellW = gridW / cols;
      const cellH = gridH / rows;

      sortedByPlate.forEach((city, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        if (row >= rows) return;

        const cx = gridX + col * cellW + cellW / 2;
        const cy = gridY + row * cellH + cellH / 2;
        const reg = regionsMap[city.region_code] || DEFAULT_REGIONS[city.region_code] || { color: '#38bdf8' };
        const color = reg.color || '#38bdf8';
        const plateStr = padPlate(city.plate);
        const cityUpper = toTurkishUpper(city.name);

        if (city.visited) {
          const angle = (getStampAngle(city.plate) * Math.PI) / 180;
          const shape = getStampShape(city.plate);
          c.save();
          c.translate(cx, cy);
          c.rotate(angle);

          if (shape === 1) {
            // Octagonal mini stamp
            const rw = 64;
            const rh = 34;
            const cut = 10;
            c.beginPath();
            c.moveTo(-rw + cut, -rh);
            c.lineTo(rw - cut, -rh);
            c.lineTo(rw, -rh + cut);
            c.lineTo(rw, rh - cut);
            c.lineTo(rw - cut, rh);
            c.lineTo(-rw + cut, rh);
            c.lineTo(-rw, rh - cut);
            c.lineTo(-rw, -rh + cut);
            c.closePath();
            c.fillStyle = hexToRgba(color, 0.14);
            c.fill();
            c.strokeStyle = color;
            c.lineWidth = 2;
            c.stroke();
          } else {
            // Rounded / Oval Ink Stamp
            canvasRoundRect(c, -66, -34, 132, 68, shape === 0 ? 32 : 14);
            c.fillStyle = hexToRgba(color, 0.14);
            c.fill();
            c.strokeStyle = color;
            c.lineWidth = 2;
            c.stroke();

            canvasRoundRect(c, -61, -29, 122, 58, shape === 0 ? 28 : 10);
            c.strokeStyle = hexToRgba(color, 0.55);
            c.lineWidth = 1;
            c.setLineDash([3, 2]);
            c.stroke();
            c.setLineDash([]);
          }

          c.textAlign = 'center';
          c.fillStyle = color;
          c.font = 'bold 13px "Courier New", monospace';
          c.fillText(`★ ${plateStr} ★`, 0, -10);

          const fontSize = cityUpper.length > 11 ? 10 : 11.5;
          c.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
          c.fillText(cityUpper, 0, 7);

          c.font = 'bold 8px "Segoe UI", Arial, sans-serif';
          c.fillStyle = hexToRgba(color, 0.9);
          c.fillText('TEFEKKÜR EDİLDİ ✓', 0, 21);

          c.restore();
        } else {
          // Empty dashed slot
          c.save();
          c.translate(cx, cy);
          canvasRoundRect(c, -64, -32, 128, 64, 10);
          c.fillStyle = 'rgba(15, 23, 42, 0.42)';
          c.fill();
          c.strokeStyle = 'rgba(148, 163, 184, 0.24)';
          c.lineWidth = 1.2;
          c.setLineDash([4, 4]);
          c.stroke();
          c.setLineDash([]);

          c.textAlign = 'center';
          c.fillStyle = '#64748b';
          c.font = 'bold 12px "Courier New", monospace';
          c.fillText(plateStr, 0, -8);

          const fontSize = cityUpper.length > 11 ? 9.5 : 11;
          c.font = `600 ${fontSize}px "Segoe UI", Arial, sans-serif`;
          c.fillStyle = '#94a3b8';
          c.fillText(cityUpper, 0, 8);

          c.font = '600 8px "Segoe UI", Arial, sans-serif';
          c.fillStyle = '#475569';
          c.fillText('MÜHÜR BEKLENİYOR', 0, 22);
          c.restore();
        }
      });

      // 6. MRZ Footer Strip
      const mrzY = H - 86;
      canvasRoundRect(c, 58, mrzY, W - 116, 40, 8);
      c.fillStyle = 'rgba(5, 9, 18, 0.72)';
      c.fill();
      c.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      c.lineWidth = 1;
      c.stroke();

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      c.fillStyle = 'rgba(226, 232, 240, 0.72)';
      c.font = 'bold 13px "Courier New", monospace';
      c.textAlign = 'left';
      c.fillText(
        `P<TURSEYYAH<<ANADOLU<KASIFI<<<<<<<${PASSPORT_NO}<<VISITED${padPlate(visitedCount)}OF${total}<<DATE${dateStr}<<<<<<`,
        74,
        mrzY + 25
      );

      // Trigger PNG Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'dijital_seyyah_pasaportu.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notify('🛂 Pasaport özeti dijital_seyyah_pasaportu.png olarak indirildi!', ctx);
    } catch (err) {
      notify('Pasaport PNG oluşturulurken bir hata oluştu.', ctx);
      if (typeof console !== 'undefined' && console.error) {
        console.error('[seyyah-passport] PNG export error:', err);
      }
    }
  }

  // Build normalized provinces list & regional counts
  function preparePassportData(data) {
    const rawProvinces = (data && data.provinces) ? data.provinces : {};
    const provincesList = Object.keys(rawProvinces).map(key => {
      const p = rawProvinces[key];
      return Object.assign({ key }, p);
    });

    const regionsMap = {};
    const breakdown = (data && data.stats && data.stats.regional_breakdown) || {};

    REGION_ORDER.forEach(code => {
      const def = DEFAULT_REGIONS[code];
      const src = breakdown[code] || {};
      regionsMap[code] = {
        code,
        name: src.name || def.name,
        shortName: def.shortName,
        icon: src.icon || def.icon,
        color: src.color || def.color,
        total: 0,
        visited: 0
      };
    });

    provincesList.forEach(p => {
      const code = p.region_code;
      if (regionsMap[code]) {
        regionsMap[code].total += 1;
        if (p.visited) regionsMap[code].visited += 1;
      }
    });

    return { provincesList, regionsMap };
  }

  function renderPassport(container, ctx) {
    if (!container) return;
    injectStyles();

    const data = (ctx && ctx.data) || (ctx && ctx.state && ctx.state.data) || (typeof window.TRAVEL_DATA !== 'undefined' ? window.TRAVEL_DATA : null);
    if (!data || !data.provinces) {
      container.innerHTML = `<div class="sp-empty-msg">Pasaport verileri yüklenemedi.</div>`;
      return;
    }

    const { provincesList, regionsMap } = preparePassportData(data);
    const totalCount = provincesList.length;
    const visitedCount = provincesList.filter(p => p.visited).length;
    const remainingCount = totalCount - visitedCount;
    const progressPct = totalCount > 0 ? ((visitedCount / totalCount) * 100).toFixed(1) : '0.0';

    const rankObj = (data.achievements && data.achievements.rank) || { title: 'Anadolu Kâşifi', icon: '🗺️' };
    const nextRankObj = (data.achievements && data.achievements.next_rank) || null;
    const citiesToNext = (data.achievements && typeof data.achievements.cities_to_next_rank === 'number')
      ? data.achievements.cities_to_next_rank
      : null;

    // Apply Filters
    let filtered = provincesList.filter(city => {
      if (uiState.region !== 'all' && city.region_code !== uiState.region) return false;
      if (uiState.status === 'visited' && !city.visited) return false;
      if (uiState.status === 'unvisited' && city.visited) return false;
      return true;
    });

    // Apply Sort
    if (uiState.sortBy === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr'));
    } else if (uiState.sortBy === 'visited') {
      filtered.sort((a, b) => {
        if (a.visited !== b.visited) return a.visited ? -1 : 1;
        return (a.plate || 0) - (b.plate || 0);
      });
    } else {
      filtered.sort((a, b) => (a.plate || 0) - (b.plate || 0));
    }

    // Build Region Filter Pills HTML
    const regionPillsHtml = [
      `<button type="button" class="sp-pill ${uiState.region === 'all' ? 'active' : ''}" data-sp-region="all">
        <span>🇹🇷</span>
        <span>Tümü</span>
        <span class="sp-pill-count">${visitedCount}/${totalCount}</span>
      </button>`
    ].concat(
      REGION_ORDER.map(code => {
        const reg = regionsMap[code];
        const isActive = uiState.region === code;
        return `
          <button type="button" class="sp-pill ${isActive ? 'active' : ''}" data-sp-region="${safeEscape(code, ctx)}">
            <span class="sp-pill-dot" style="background:${safeEscape(reg.color, ctx)};"></span>
            <span>${safeEscape(reg.icon, ctx)} ${safeEscape(reg.shortName, ctx)}</span>
            <span class="sp-pill-count">${reg.visited}/${reg.total}</span>
          </button>
        `;
      })
    ).join('');

    // Build Stamps Grid HTML
    const stampsHtml = filtered.length === 0
      ? `<div class="sp-empty-msg">Seçili filtreye uygun mühür yuvası bulunamadı.</div>`
      : filtered.map(city => {
          const reg = regionsMap[city.region_code] || DEFAULT_REGIONS[city.region_code] || { color: '#38bdf8', icon: '📍', shortName: city.region || '' };
          const plateStr = padPlate(city.plate);
          const safeKey = safeEscape(city.key, ctx);
          const safeName = safeEscape(city.name, ctx);

          if (city.visited) {
            const angle = getStampAngle(city.plate);
            const color = reg.color;
            return `
              <button type="button"
                class="sp-stamp-card is-visited"
                data-sp-city="${safeKey}"
                title="${safeName} (${plateStr}) — Şehir seyahatnamesini aç"
                style="--stamp-angle:${angle}deg; --stamp-color:${color}; --stamp-tint:${hexToRgba(color, 0.14)}; --stamp-border:${hexToRgba(color, 0.3)}; --stamp-glow:${hexToRgba(color, 0.4)};">
                <div class="sp-stamp-svg-wrap">
                  ${renderVisitedStampSvg(city, color, ctx)}
                </div>
                <span class="sp-stamp-region-tag">${safeEscape(reg.icon, ctx)} ${safeEscape(reg.shortName, ctx)}</span>
              </button>
            `;
          }

          return `
            <button type="button"
              class="sp-stamp-card is-empty"
              data-sp-city="${safeKey}"
              title="${safeName} (${plateStr}) — Henüz ziyaret edilmedi, rehberi incele">
              <div class="sp-empty-plate">${plateStr}</div>
              <div>
                <div class="sp-empty-city">${safeName}</div>
                <div class="sp-stamp-region-tag">${safeEscape(reg.icon, ctx)} ${safeEscape(reg.shortName, ctx)}</div>
              </div>
              <div class="sp-empty-status">⏳ MÜHÜR BEKLENİYOR</div>
            </button>
          `;
        }).join('');

    const nextRankText = (nextRankObj && citiesToNext != null)
      ? `Sonraki Rütbe: ${safeEscape(nextRankObj.icon || '📜', ctx)} ${safeEscape(nextRankObj.title, ctx)} (${citiesToNext} şehir kaldı)`
      : 'Anadolu Seyahatnamesi Mühür İlerlemesi';

    const activeRegionLabel = uiState.region === 'all'
      ? 'TÜM TÜRKİYE (81 İL)'
      : toTurkishUpper((regionsMap[uiState.region] && regionsMap[uiState.region].name) || uiState.region);

    const profile = loadPassportProfile();
    const mrzName = toMrzToken(profile.travelerName).slice(0, 18);
    const mrzTitle = toMrzToken(profile.travelerTitle).slice(0, 18);

    container.innerHTML = `
      <section class="sp-root" aria-label="Dijital Seyyah Pasaportu">
        <!-- Luxury Passport Cover Header -->
        <div class="sp-cover">
          <div class="sp-cover-top">
            <div class="sp-identity">
              <div class="sp-emblem-wrap">${renderCoverEmblemSvg()}</div>
              <div class="sp-title-block">
                <span class="sp-republic">Türkiye Cumhuriyeti • Anadolu Seyahatnamesi</span>
                <h1 class="sp-main-title">DİJİTAL SEYYAH PASAPORTU</h1>
                <div class="sp-meta-row">
                  <span class="sp-holder-badge" id="sp-holder-display">🖋️ ${safeEscape(profile.travelerName, ctx)} • ${safeEscape(profile.travelerTitle, ctx)}</span>
                  <span class="sp-rank-badge">${safeEscape(rankObj.icon || '🗺️', ctx)} ${safeEscape(rankObj.title || 'Anadolu Kâşifi', ctx)}</span>
                  <span class="sp-passport-no">NO: ${PASSPORT_NO}</span>
                </div>
              </div>
            </div>

            <div class="sp-stats-cluster">
              <div class="sp-stat-box">
                <div class="sp-stat-val sp-accent-emerald">${visitedCount} / ${totalCount}</div>
                <div class="sp-stat-lbl">Mühür</div>
              </div>
              <div class="sp-stat-box">
                <div class="sp-stat-val">${remainingCount}</div>
                <div class="sp-stat-lbl">Kalan</div>
              </div>
              <div class="sp-stat-box">
                <div class="sp-stat-val sp-accent-cyan">%${progressPct}</div>
                <div class="sp-stat-lbl">Tamamlandı</div>
              </div>
              <button type="button" class="sp-download-btn" id="sp-export-png-btn">
                <span>📥</span>
                <span>Pasaport Özeti PNG İndir</span>
              </button>
            </div>
          </div>

          <div class="sp-inscription-bar">
            <span class="sp-inscription-label">✍️ Seyyah Künyesi:</span>
            <input
              type="text"
              id="sp-input-name"
              class="sp-inscription-input"
              maxlength="48"
              value="${safeEscape(profile.travelerName, ctx)}"
              placeholder="Seyyah Adınız..."
              aria-label="Seyyah Adı"
            />
            <input
              type="text"
              id="sp-input-title"
              class="sp-inscription-input"
              maxlength="56"
              value="${safeEscape(profile.travelerTitle, ctx)}"
              placeholder="Unvan / Mahlas..."
              aria-label="Seyyah Unvanı"
            />
            <button type="button" class="sp-inscription-save" id="sp-save-profile-btn">💾 Pasaporta İşle</button>
          </div>

          <div class="sp-progress-wrap">
            <div class="sp-progress-meta">
              <span>${nextRankText}</span>
              <strong>${visitedCount} / ${totalCount} Mühür Basıldı</strong>
            </div>
            <div class="sp-progress-track">
              <div class="sp-progress-fill" style="width:${progressPct}%;"></div>
            </div>
          </div>

          <div class="sp-mrz" id="sp-mrz-strip" aria-hidden="true">
            P&lt;TUR${safeEscape(mrzName, ctx)}&lt;&lt;${safeEscape(mrzTitle, ctx)}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>
            TRSYH2026081&lt;TUR81${padPlate(visitedCount)}${padPlate(remainingCount)}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
          </div>
        </div>

        <!-- Region & Stamp Status Filter Controls -->
        <div class="sp-controls">
          <div class="sp-pill-group" role="tablist" aria-label="Bölge Filtresi">
            ${regionPillsHtml}
          </div>

          <div class="sp-controls-row">
            <div class="sp-status-group" role="group" aria-label="Mühür Durumu">
              <button type="button" class="sp-status-btn ${uiState.status === 'all' ? 'active' : ''}" data-sp-status="all">Tümü (${totalCount})</button>
              <button type="button" class="sp-status-btn ${uiState.status === 'visited' ? 'active' : ''}" data-sp-status="visited">✓ Sadece Mühürlüler (${visitedCount})</button>
              <button type="button" class="sp-status-btn ${uiState.status === 'unvisited' ? 'active' : ''}" data-sp-status="unvisited">⏳ Boş Yuvalar (${remainingCount})</button>
            </div>

            <select class="sp-sort-select" id="sp-sort-select" aria-label="Sıralama">
              <option value="plate" ${uiState.sortBy === 'plate' ? 'selected' : ''}>Plaka Sırası (01 → 81)</option>
              <option value="name" ${uiState.sortBy === 'name' ? 'selected' : ''}>Alfabetik (A → Z)</option>
              <option value="visited" ${uiState.sortBy === 'visited' ? 'selected' : ''}>Önce Mühürlüler</option>
            </select>
          </div>
        </div>

        <!-- Passport Stamp Book Page -->
        <div class="sp-page">
          <div class="sp-page-header">
            <span class="sp-page-label">SAYFA 01 — ${safeEscape(activeRegionLabel, ctx)} MÜHÜR DEFTERİ</span>
            <span class="sp-page-counter">${filtered.length} il gösteriliyor • Detay için mühre tıklayın</span>
          </div>

          <div class="sp-grid" id="sp-stamps-grid">
            ${stampsHtml}
          </div>
        </div>
      </section>
    `;

    // Bind Interactions
    const rootEl = container.querySelector('.sp-root');
    if (!rootEl) return;

    // Region filter pills
    rootEl.querySelectorAll('[data-sp-region]').forEach(btn => {
      btn.addEventListener('click', () => {
        uiState.region = btn.getAttribute('data-sp-region') || 'all';
        renderPassport(container, ctx);
      });
    });

    // Status filter buttons
    rootEl.querySelectorAll('[data-sp-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        uiState.status = btn.getAttribute('data-sp-status') || 'all';
        renderPassport(container, ctx);
      });
    });

    // Sort selector
    const sortSelect = rootEl.querySelector('#sp-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        uiState.sortBy = sortSelect.value || 'plate';
        renderPassport(container, ctx);
      });
    }

    // PNG Export button
    const exportBtn = rootEl.querySelector('#sp-export-png-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        exportPassportPng(data, provincesList, regionsMap, ctx);
      });
    }

    // Custom Traveler Inscription Save (localStorage)
    const nameInp = rootEl.querySelector('#sp-input-name');
    const titleInp = rootEl.querySelector('#sp-input-title');
    const saveProfileBtn = rootEl.querySelector('#sp-save-profile-btn');
    const holderDisplay = rootEl.querySelector('#sp-holder-display');
    const mrzStrip = rootEl.querySelector('#sp-mrz-strip');

    function persistInscription(showFeedback) {
      const nextName = (nameInp ? nameInp.value : '').trim() || 'Dijital Seyyah';
      const nextTitle = (titleInp ? titleInp.value : '').trim() || 'Anadolu Kâşifi';
      savePassportProfile({ travelerName: nextName, travelerTitle: nextTitle });
      if (holderDisplay) {
        holderDisplay.textContent = `🖋️ ${nextName} • ${nextTitle}`;
      }
      if (mrzStrip) {
        const mn = toMrzToken(nextName).slice(0, 18);
        const mt = toMrzToken(nextTitle).slice(0, 18);
        mrzStrip.innerHTML =
          `P&lt;TUR${safeEscape(mn, ctx)}&lt;&lt;${safeEscape(mt, ctx)}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>` +
          `TRSYH2026081&lt;TUR81${padPlate(visitedCount)}${padPlate(remainingCount)}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;`;
      }
      if (showFeedback) {
        notify('🛂 Seyyah künyesi pasaportunuza mühürlendi!', ctx);
      }
    }

    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', () => persistInscription(true));
    }
    if (nameInp) {
      nameInp.addEventListener('input', () => persistInscription(false));
    }
    if (titleInp) {
      titleInp.addEventListener('input', () => persistInscription(false));
    }

    // Stamp card click -> open province via ctx.selectCity(key)
    const gridEl = rootEl.querySelector('#sp-stamps-grid');
    if (gridEl) {
      gridEl.addEventListener('click', e => {
        const card = e.target.closest('[data-sp-city]');
        if (!card) return;
        const cityKey = card.getAttribute('data-sp-city');
        if (cityKey && ctx && typeof ctx.selectCity === 'function') {
          ctx.selectCity(cityKey);
        }
      });
    }
  }

  window.SEYYAH_MODULES.passport = {
    render: renderPassport
  };
})();
