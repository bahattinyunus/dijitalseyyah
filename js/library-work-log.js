/**
 * Anadolu Seyahatnamesi — 💻 Yolda İlim & 81 İl Halk Kütüphanesi Mesai Defteri (780+ Saat Heatmap)
 * Synthesizes baseline 39 visited provinces × 20 hours = 780 hours from ctx.data.provinces
 * plus user-logged custom study sessions persisted in localStorage (`dijital_seyyah_library_worklog_v1`).
 * Registers on: window.SEYYAH_MODULES.workLog = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STORAGE_KEY = 'dijital_seyyah_library_worklog_v1';
  const STYLE_ID = 'seyyah-library-worklog-styles';
  const TOOLTIP_ID = 'lwl-floating-tooltip';
  const BASELINE_HOURS_PER_VISITED = 20;

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
    '07_GuneydoguAnadolu': 'G.Doğu'
  };

  const WORK_CATEGORIES = [
    {
      id: 'coding',
      label: '💻 Yazılım & Kod',
      shortLabel: 'Yazılım & Kod',
      icon: '💻',
      color: '#00f2fe',
      colorLight: '#0284c7'
    },
    {
      id: 'reading',
      label: '📖 Kitap & Okuma',
      shortLabel: 'Kitap & Okuma',
      icon: '📖',
      color: '#10b981',
      colorLight: '#059669'
    },
    {
      id: 'research',
      label: '🔬 Araştırma & Makale',
      shortLabel: 'Araştırma & Makale',
      icon: '🔬',
      color: '#a855f7',
      colorLight: '#7c3aed'
    },
    {
      id: 'writing',
      label: '✍️ Seyahatname Yazımı',
      shortLabel: 'Seyahatname Yazımı',
      icon: '✍️',
      color: '#f59e0b',
      colorLight: '#d97706'
    }
  ];

  const MONTHS_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Persistent module UI state across re-renders
  const uiState = {
    search: '',
    region: 'all',
    statusFilter: 'all', // 'all' | 'completed' | 'upcoming' | 'logged'
    selectedKey: null,
    formProvinceKey: '',
    formHours: 4,
    formCategory: 'coding',
    formTitle: '',
    formNote: '',
    formDate: ''
  };

  // ---------------------------------------------------------------------------
  // Utility Helpers
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

  function formatPlate(plate) {
    const n = Number(plate) || 0;
    return n < 10 ? '0' + n : String(n);
  }

  function formatNumber(n) {
    const num = Number(n) || 0;
    return Math.round(num).toLocaleString('tr-TR');
  }

  function getTodayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function formatDateTR(iso) {
    if (!iso || typeof iso !== 'string') return '';
    const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return iso;
    const monthIdx = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    if (monthIdx < 0 || monthIdx > 11) return iso;
    return `${day} ${MONTHS_TR[monthIdx]} ${match[1]}`;
  }

  function getCategoryMeta(catIdOrLabel) {
    const byId = WORK_CATEGORIES.find((c) => c.id === catIdOrLabel || c.label === catIdOrLabel);
    return byId || WORK_CATEGORIES[0];
  }

  function createSessionId() {
    return 'lwl_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  }

  // ---------------------------------------------------------------------------
  // LocalStorage Persistence
  // ---------------------------------------------------------------------------

  function loadCustomSessions(provincesMap) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.sessions) ? parsed.sessions : []);
      const clean = [];
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (!item || typeof item !== 'object') continue;
        const provinceKey = typeof item.provinceKey === 'string' ? item.provinceKey.trim() : '';
        if (!provinceKey) continue;
        if (provincesMap && !Object.prototype.hasOwnProperty.call(provincesMap, provinceKey)) continue;

        const rawHours = Number(item.hours);
        const hours = Number.isFinite(rawHours) ? Math.max(1, Math.min(12, Math.round(rawHours))) : 1;
        const cat = getCategoryMeta(item.category);
        const title = typeof item.title === 'string' ? item.title.trim().slice(0, 140) : '';
        const note = typeof item.note === 'string' ? item.note.trim().slice(0, 600) : '';
        const date = typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date.trim())
          ? item.date.trim()
          : getTodayISO();
        const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : createSessionId();
        const createdAt = Number(item.createdAt) || Date.now();

        clean.push({
          id,
          provinceKey,
          hours,
          category: cat.id,
          title: title || `${cat.shortLabel} Mesaisi`,
          note,
          date,
          createdAt
        });
      }
      clean.sort((a, b) => (b.date.localeCompare(a.date) || (b.createdAt - a.createdAt)));
      return clean;
    } catch (err) {
      return [];
    }
  }

  function saveCustomSessions(sessions) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      return true;
    } catch (err) {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Scoped Styles (Dark & body.light-theme compatible)
  // ---------------------------------------------------------------------------

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .lwl-studio {
        max-width: 1280px;
        margin: 0 auto;
        padding: 18px 18px 48px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        animation: lwlFadeIn 0.28s ease-out;
      }

      @keyframes lwlFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Hero Banner */
      .lwl-hero {
        position: relative;
        overflow: hidden;
        padding: 24px 26px;
        border-radius: var(--radius-lg, 20px);
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(17, 34, 58, 0.84));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        box-shadow: var(--shadow-subtle, 0 12px 28px -6px rgba(0, 0, 0, 0.48));
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .lwl-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 86% 16%, rgba(16, 185, 129, 0.16), transparent 44%),
          radial-gradient(circle at 12% 88%, rgba(0, 242, 254, 0.14), transparent 46%);
        pointer-events: none;
      }

      .lwl-hero-top {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
      }

      .lwl-hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--accent-emerald, #10b981);
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.3);
        margin-bottom: 10px;
      }

      .lwl-hero-title {
        font-family: var(--font-heading, inherit);
        font-size: clamp(1.32rem, 2.5vw, 1.85rem);
        font-weight: 800;
        line-height: 1.25;
        margin: 0 0 8px;
        background: linear-gradient(135deg, #f8fafc 0%, #34d399 48%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .lwl-hero-desc {
        margin: 0;
        max-width: 720px;
        font-size: 0.92rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.55;
      }

      .lwl-hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
      }

      .lwl-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 10px 16px;
        border-radius: var(--radius-md, 12px);
        font-family: inherit;
        font-size: 0.86rem;
        font-weight: 700;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.2s ease;
        text-decoration: none;
        white-space: nowrap;
      }

      .lwl-btn-primary {
        background: linear-gradient(135deg, #10b981, #06b6d4);
        color: #04131c;
        box-shadow: 0 6px 18px rgba(16, 185, 129, 0.25);
      }

      .lwl-btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(0, 242, 254, 0.32);
      }

      .lwl-btn-secondary {
        background: rgba(255, 255, 255, 0.06);
        color: var(--text-primary, #f8fafc);
        border-color: var(--border-glass, rgba(255, 255, 255, 0.14));
      }

      .lwl-btn-secondary:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.1);
      }

      .lwl-btn-sm {
        padding: 6px 11px;
        font-size: 0.78rem;
        border-radius: 9px;
      }

      /* KPI Row */
      .lwl-kpi-grid {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .lwl-kpi-card {
        padding: 14px 16px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.58);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .lwl-kpi-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .lwl-kpi-val {
        font-family: var(--font-heading, inherit);
        font-size: 1.55rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.15;
      }

      .lwl-kpi-val.emerald { color: var(--accent-emerald, #10b981); }
      .lwl-kpi-val.cyan { color: var(--accent-cyan, #00f2fe); }
      .lwl-kpi-val.gold { color: var(--accent-gold, #f59e0b); }

      .lwl-kpi-sub {
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      .lwl-progress-track {
        margin-top: 6px;
        height: 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
      }

      .lwl-progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #10b981, #00f2fe);
        transition: width 0.35s ease;
      }

      /* Charts Grid */
      .lwl-charts-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.32fr) minmax(0, 1fr);
        gap: 18px;
        align-items: stretch;
      }

      .lwl-panel {
        padding: 20px;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .lwl-panel-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }

      .lwl-panel-title {
        font-family: var(--font-heading, inherit);
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .lwl-panel-sub {
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
        margin: 3px 0 0;
      }

      /* Legend */
      .lwl-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        font-size: 0.74rem;
        color: var(--text-secondary, #94a3b8);
      }

      .lwl-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .lwl-legend-swatch {
        width: 11px;
        height: 11px;
        border-radius: 3px;
        display: inline-block;
      }

      /* SVG Heatmap & Bar Chart */
      .lwl-svg-wrap {
        width: 100%;
        overflow-x: auto;
      }

      .lwl-heatmap-svg {
        width: 100%;
        height: auto;
        display: block;
        user-select: none;
      }

      .lwl-heat-cell {
        cursor: pointer;
        transition: opacity 0.16s ease, transform 0.16s ease;
      }

      .lwl-heat-cell:hover .lwl-heat-rect,
      .lwl-heat-cell:focus-visible .lwl-heat-rect {
        stroke: #f8fafc;
        stroke-width: 2;
      }

      .lwl-heat-cell.is-selected .lwl-heat-rect {
        stroke: #f59e0b;
        stroke-width: 2.5;
      }

      .lwl-heat-cell:focus-visible {
        outline: none;
      }

      .lwl-region-svg {
        width: 100%;
        height: auto;
        display: block;
        user-select: none;
      }

      .lwl-region-row {
        cursor: pointer;
      }

      .lwl-region-row:hover .lwl-region-bg {
        fill: rgba(255, 255, 255, 0.08);
      }

      .lwl-region-row.is-active .lwl-region-bg {
        stroke: var(--accent-cyan, #00f2fe);
        stroke-width: 1.5;
      }

      /* Selected Library Inspector */
      .lwl-inspector {
        padding: 18px 20px;
        border-radius: var(--radius-lg, 20px);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(0, 242, 254, 0.08));
        border: 1px solid rgba(0, 242, 254, 0.28);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .lwl-inspector-top {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }

      .lwl-inspector-title-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
      }

      .lwl-plate-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 34px;
        height: 28px;
        padding: 0 8px;
        border-radius: 8px;
        font-family: var(--font-heading, inherit);
        font-size: 0.82rem;
        font-weight: 800;
        background: rgba(15, 23, 42, 0.72);
        color: var(--accent-cyan, #00f2fe);
        border: 1px solid rgba(0, 242, 254, 0.25);
      }

      .lwl-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.74rem;
        font-weight: 700;
      }

      .lwl-status-pill.completed {
        background: rgba(16, 185, 129, 0.16);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.35);
      }

      .lwl-status-pill.upcoming {
        background: rgba(0, 242, 254, 0.14);
        color: #38bdf8;
        border: 1px solid rgba(0, 242, 254, 0.35);
      }

      .lwl-inspector-note {
        font-size: 0.9rem;
        color: var(--text-primary, #f8fafc);
        line-height: 1.55;
        padding: 11px 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      /* Form & Custom Sessions Split */
      .lwl-workspace-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.15fr);
        gap: 18px;
        align-items: start;
      }

      .lwl-form {
        display: flex;
        flex-direction: column;
        gap: 13px;
      }

      .lwl-form-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .lwl-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .lwl-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
      }

      .lwl-input,
      .lwl-select,
      .lwl-textarea {
        width: 100%;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.72);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.88rem;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .lwl-input:focus,
      .lwl-select:focus,
      .lwl-textarea:focus {
        outline: none;
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .lwl-textarea {
        min-height: 76px;
        resize: vertical;
      }

      .lwl-hours-picker {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .lwl-hours-range {
        flex: 1;
        accent-color: #10b981;
        cursor: pointer;
      }

      .lwl-hours-badge {
        min-width: 62px;
        text-align: center;
        padding: 7px 10px;
        border-radius: 9px;
        font-weight: 800;
        font-size: 0.88rem;
        background: rgba(16, 185, 129, 0.16);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.32);
      }

      .lwl-cat-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .lwl-cat-btn {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 9px 11px;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-secondary, #94a3b8);
        font-family: inherit;
        font-size: 0.81rem;
        font-weight: 600;
        cursor: pointer;
        text-align: left;
        transition: all 0.18s ease;
      }

      .lwl-cat-btn:hover {
        border-color: rgba(0, 242, 254, 0.4);
        color: var(--text-primary, #f8fafc);
      }

      .lwl-cat-btn.active {
        background: rgba(0, 242, 254, 0.14);
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
        box-shadow: 0 0 12px rgba(0, 242, 254, 0.15);
      }

      /* Category Summary & Sessions Log */
      .lwl-cat-summary {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .lwl-cat-stat {
        padding: 10px 12px;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8rem;
      }

      .lwl-session-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 410px;
        overflow-y: auto;
        padding-right: 4px;
      }

      .lwl-session-item {
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.09));
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .lwl-session-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }

      .lwl-session-title {
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--text-primary, #f8fafc);
      }

      .lwl-session-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      .lwl-session-note {
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.45;
      }

      .lwl-delete-btn {
        background: transparent;
        border: 1px solid rgba(239, 68, 68, 0.25);
        color: #f87171;
        border-radius: 8px;
        padding: 3px 8px;
        font-size: 0.74rem;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .lwl-delete-btn:hover {
        background: rgba(239, 68, 68, 0.14);
        border-color: #ef4444;
      }

      /* Directory Controls & 81 Cards Grid */
      .lwl-dir-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
      }

      .lwl-dir-inputs {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        flex: 1;
        min-width: 240px;
      }

      .lwl-dir-inputs .lwl-input {
        flex: 1.5;
        min-width: 190px;
      }

      .lwl-dir-inputs .lwl-select {
        flex: 1;
        min-width: 170px;
      }

      .lwl-filter-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .lwl-pill-btn {
        padding: 7px 12px;
        border-radius: 999px;
        font-family: inherit;
        font-size: 0.78rem;
        font-weight: 700;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-secondary, #94a3b8);
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .lwl-pill-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(0, 242, 254, 0.4);
      }

      .lwl-pill-btn.active {
        background: rgba(16, 185, 129, 0.18);
        border-color: var(--accent-emerald, #10b981);
        color: #34d399;
      }

      .lwl-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 14px;
      }

      .lwl-lib-card {
        padding: 15px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.56);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
        cursor: pointer;
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .lwl-lib-card:hover {
        transform: translateY(-2px);
        border-color: rgba(0, 242, 254, 0.42);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
      }

      .lwl-lib-card.is-completed {
        border-left: 3px solid #10b981;
      }

      .lwl-lib-card.is-upcoming {
        border-left: 3px solid #00f2fe;
      }

      .lwl-lib-card.is-selected {
        border-color: #f59e0b;
        box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.45);
      }

      .lwl-card-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
      }

      .lwl-card-city {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .lwl-card-name {
        font-family: var(--font-heading, inherit);
        font-size: 0.98rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .lwl-card-region {
        font-size: 0.74rem;
        color: var(--text-muted, #64748b);
      }

      .lwl-hours-chip {
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 0.74rem;
        font-weight: 800;
        white-space: nowrap;
      }

      .lwl-hours-chip.completed {
        background: rgba(16, 185, 129, 0.16);
        color: #34d399;
      }

      .lwl-hours-chip.upcoming {
        background: rgba(0, 242, 254, 0.14);
        color: #38bdf8;
      }

      .lwl-card-note {
        font-size: 0.81rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.48;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .lwl-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        font-size: 0.76rem;
        color: var(--text-muted, #64748b);
      }

      .lwl-card-link {
        background: transparent;
        border: none;
        padding: 0;
        font-family: inherit;
        font-size: 0.77rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
        cursor: pointer;
      }

      .lwl-card-link:hover {
        text-decoration: underline;
      }

      .lwl-empty-state {
        padding: 28px 18px;
        text-align: center;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.42);
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.14));
        color: var(--text-secondary, #94a3b8);
        font-size: 0.88rem;
      }

      /* Floating SVG Tooltip */
      .lwl-tooltip {
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        max-width: 280px;
        padding: 10px 12px;
        border-radius: 11px;
        background: rgba(15, 23, 42, 0.96);
        border: 1px solid rgba(0, 242, 254, 0.35);
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.45);
        color: #f8fafc;
        font-size: 0.78rem;
        line-height: 1.45;
        opacity: 0;
        transition: opacity 0.12s ease;
      }

      .lwl-tooltip.visible {
        opacity: 1;
      }

      /* Light Theme Overrides */
      body.light-theme .lwl-hero {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(241, 245, 249, 0.94));
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
      }

      body.light-theme .lwl-hero-title {
        background: linear-gradient(135deg, #0f172a 0%, #059669 52%, #0284c7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .lwl-hero-badge {
        color: #047857;
        background: rgba(5, 150, 105, 0.12);
        border-color: rgba(5, 150, 105, 0.28);
      }

      body.light-theme .lwl-kpi-card,
      body.light-theme .lwl-session-item,
      body.light-theme .lwl-cat-stat,
      body.light-theme .lwl-lib-card,
      body.light-theme .lwl-inspector-note,
      body.light-theme .lwl-empty-state {
        background: rgba(248, 250, 252, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .lwl-panel {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .lwl-btn-secondary,
      body.light-theme .lwl-cat-btn,
      body.light-theme .lwl-pill-btn {
        background: rgba(241, 245, 249, 0.9);
        color: #1e293b;
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .lwl-cat-btn.active {
        background: rgba(2, 132, 199, 0.12);
        border-color: #0284c7;
        color: #0f172a;
      }

      body.light-theme .lwl-pill-btn.active {
        background: rgba(5, 150, 105, 0.14);
        border-color: #059669;
        color: #047857;
      }

      body.light-theme .lwl-input,
      body.light-theme .lwl-select,
      body.light-theme .lwl-textarea {
        background: #ffffff;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.18);
      }

      body.light-theme .lwl-plate-pill {
        background: #e2e8f0;
        color: #0284c7;
        border-color: rgba(2, 132, 199, 0.25);
      }

      body.light-theme .lwl-status-pill.completed,
      body.light-theme .lwl-hours-chip.completed,
      body.light-theme .lwl-hours-badge {
        background: rgba(5, 150, 105, 0.12);
        color: #047857;
      }

      body.light-theme .lwl-status-pill.upcoming,
      body.light-theme .lwl-hours-chip.upcoming {
        background: rgba(2, 132, 199, 0.12);
        color: #0369a1;
      }

      body.light-theme .lwl-progress-track {
        background: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .lwl-card-footer {
        border-top-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .lwl-card-link {
        color: #0284c7;
      }

      body.light-theme .lwl-inspector {
        background: linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(2, 132, 199, 0.08));
        border-color: rgba(2, 132, 199, 0.3);
      }

      body.light-theme .lwl-heat-cell:hover .lwl-heat-rect,
      body.light-theme .lwl-heat-cell:focus-visible .lwl-heat-rect {
        stroke: #0f172a;
      }

      body.light-theme .lwl-region-row:hover .lwl-region-bg {
        fill: rgba(15, 23, 42, 0.05);
      }

      body.light-theme .lwl-tooltip {
        background: rgba(255, 255, 255, 0.98);
        color: #0f172a;
        border-color: rgba(2, 132, 199, 0.35);
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.14);
      }

      @media (max-width: 980px) {
        .lwl-kpi-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .lwl-charts-grid,
        .lwl-workspace-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      @media (max-width: 600px) {
        .lwl-studio {
          padding: 12px 12px 36px;
        }
        .lwl-kpi-grid,
        .lwl-form-row,
        .lwl-cat-grid,
        .lwl-cat-summary {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Tooltip Management
  // ---------------------------------------------------------------------------

  function ensureTooltip() {
    let el = document.getElementById(TOOLTIP_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = TOOLTIP_ID;
      el.className = 'lwl-tooltip';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    }
    return el;
  }

  function showTooltip(html, clientX, clientY) {
    const el = ensureTooltip();
    el.innerHTML = html;
    el.classList.add('visible');
    const pad = 14;
    const vw = window.innerWidth || 1200;
    const vh = window.innerHeight || 800;
    const rect = el.getBoundingClientRect();
    let left = clientX + pad;
    let top = clientY + pad;
    if (left + rect.width > vw - 10) left = Math.max(10, clientX - rect.width - pad);
    if (top + rect.height > vh - 10) top = Math.max(10, clientY - rect.height - pad);
    el.style.left = left + 'px';
    el.style.top = top + 'px';
  }

  function hideTooltip() {
    const el = document.getElementById(TOOLTIP_ID);
    if (el) el.classList.remove('visible');
  }

  // ---------------------------------------------------------------------------
  // Data Synthesis (Baseline 39 × 20h = 780h + Custom LocalStorage Sessions)
  // ---------------------------------------------------------------------------

  function synthesizeWorkData(data, customSessions, normalizeTurkish) {
    const provincesMap = data.provinces || {};
    const regionsMap = data.regions || {};

    const sessionsByProvince = {};
    const categoryTotals = {};
    WORK_CATEGORIES.forEach((c) => {
      categoryTotals[c.id] = { hours: 0, count: 0 };
    });

    let totalCustomHours = 0;
    customSessions.forEach((s) => {
      totalCustomHours += s.hours;
      if (!sessionsByProvince[s.provinceKey]) sessionsByProvince[s.provinceKey] = [];
      sessionsByProvince[s.provinceKey].push(s);
      if (categoryTotals[s.category]) {
        categoryTotals[s.category].hours += s.hours;
        categoryTotals[s.category].count += 1;
      }
    });

    const libraries = Object.entries(provincesMap)
      .map(([key, prov]) => {
        const visited = Boolean(prov.visited);
        const baselineHours = visited ? BASELINE_HOURS_PER_VISITED : 0;
        const provSessions = sessionsByProvince[key] || [];
        const customHours = provSessions.reduce((sum, s) => sum + s.hours, 0);
        const totalHours = baselineHours + customHours;
        const regionCode = prov.region_code || '';
        const regionInfo = regionsMap[regionCode] || {};
        const libraryNote =
          (prov.custom_library && String(prov.custom_library).trim()) ||
          (prov.library && String(prov.library).trim()) ||
          `${prov.name} İl Halk Kütüphanesi — Sessiz çalışma ve araştırma masası.`;

        return {
          key,
          plate: Number(prov.plate) || 0,
          plateStr: formatPlate(prov.plate),
          name: prov.name || key,
          regionCode,
          regionName: regionInfo.name || prov.region || regionCode,
          regionShort: REGION_SHORT_NAMES[regionCode] || prov.region || '',
          regionIcon: regionInfo.icon || '📍',
          visited,
          baselineHours,
          customHours,
          totalHours,
          sessions: provSessions,
          libraryNote,
          searchHaystack: normalizeTurkish(
            `${formatPlate(prov.plate)} ${prov.name} ${prov.region || ''} ${regionInfo.name || ''} ${libraryNote}`
          )
        };
      })
      .sort((a, b) => a.plate - b.plate);

    const byKey = {};
    libraries.forEach((lib) => {
      byKey[lib.key] = lib;
    });

    const visitedCount = libraries.filter((l) => l.visited).length;
    const totalBaselineHours = visitedCount * BASELINE_HOURS_PER_VISITED;
    const grandTotalHours = totalBaselineHours + totalCustomHours;
    const targetTotalHours = libraries.length * BASELINE_HOURS_PER_VISITED;

    const regionalStats = REGION_ORDER.map((code) => {
      const info = regionsMap[code] || {};
      const inRegion = libraries.filter((l) => l.regionCode === code);
      const completedOffices = inRegion.filter((l) => l.visited).length;
      const baselineHours = inRegion.reduce((sum, l) => sum + l.baselineHours, 0);
      const customHours = inRegion.reduce((sum, l) => sum + l.customHours, 0);
      return {
        code,
        name: info.name || code,
        shortName: REGION_SHORT_NAMES[code] || code,
        icon: info.icon || '📍',
        color: info.color || '#10b981',
        totalOffices: inRegion.length,
        completedOffices,
        baselineHours,
        customHours,
        totalHours: baselineHours + customHours
      };
    });

    return {
      libraries,
      byKey,
      visitedCount,
      upcomingCount: Math.max(0, libraries.length - visitedCount),
      totalBaselineHours,
      totalCustomHours,
      grandTotalHours,
      targetTotalHours,
      categoryTotals,
      regionalStats
    };
  }

  // ---------------------------------------------------------------------------
  // SVG Builders: 81-Plate Contribution Matrix & 7-Region Breakdown Bar Chart
  // ---------------------------------------------------------------------------

  function getCellColors(lib, isLight) {
    if (lib.visited) {
      if (lib.customHours >= 10) {
        return {
          fill: isLight ? '#047857' : '#059669',
          text: '#ecfdf5',
          stroke: isLight ? '#065f46' : '#34d399'
        };
      }
      if (lib.customHours > 0) {
        return {
          fill: isLight ? '#059669' : '#10b981',
          text: '#ecfdf5',
          stroke: isLight ? '#047857' : '#6ee7b7'
        };
      }
      return {
        fill: isLight ? 'rgba(16, 185, 129, 0.78)' : 'rgba(16, 185, 129, 0.56)',
        text: isLight ? '#ffffff' : '#ecfdf5',
        stroke: isLight ? 'rgba(5, 150, 105, 0.85)' : 'rgba(52, 211, 153, 0.45)'
      };
    }

    // Upcoming (unvisited) library office => Cyan cells
    if (lib.customHours > 0) {
      return {
        fill: isLight ? '#0284c7' : '#06b6d4',
        text: '#f0f9ff',
        stroke: isLight ? '#0369a1' : '#67e8f9'
      };
    }
    return {
      fill: isLight ? 'rgba(14, 165, 233, 0.2)' : 'rgba(0, 242, 254, 0.16)',
      text: isLight ? '#0369a1' : '#7dd3fc',
      stroke: isLight ? 'rgba(2, 132, 199, 0.45)' : 'rgba(0, 242, 254, 0.38)'
    };
  }

  function renderHeatmapSVG(synth, selectedKey, isLight, esc) {
    const cols = 9;
    const rows = Math.ceil(synth.libraries.length / cols) || 9;
    const cellW = 54;
    const cellH = 40;
    const gap = 7;
    const padX = 10;
    const padY = 10;
    const svgW = padX * 2 + cols * cellW + (cols - 1) * gap;
    const svgH = padY * 2 + rows * cellH + (rows - 1) * gap;

    const cellsSvg = synth.libraries.map((lib, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = padX + col * (cellW + gap);
      const y = padY + row * (cellH + gap);
      const palette = getCellColors(lib, isLight);
      const isSelected = selectedKey === lib.key;
      const subText = lib.totalHours > 0 ? `${lib.totalHours}s` : 'Plan';
      const subFill = lib.visited
        ? (isLight ? 'rgba(255,255,255,0.88)' : 'rgba(236,253,245,0.85)')
        : (lib.customHours > 0 ? '#e0f2fe' : (isLight ? '#0284c7' : 'rgba(125,211,252,0.82)'));

      const customDot = lib.customHours > 0
        ? `<circle cx="${x + cellW - 7}" cy="${y + 7}" r="3" fill="#f59e0b" />`
        : '';

      return `
        <g
          class="lwl-heat-cell ${isSelected ? 'is-selected' : ''}"
          data-key="${esc(lib.key)}"
          tabindex="0"
          role="button"
          aria-label="${esc(lib.plateStr)} ${esc(lib.name)} — ${lib.totalHours} saat mesai"
        >
          <rect
            class="lwl-heat-rect"
            x="${x}"
            y="${y}"
            width="${cellW}"
            height="${cellH}"
            rx="8"
            fill="${palette.fill}"
            stroke="${isSelected ? '#f59e0b' : palette.stroke}"
            stroke-width="${isSelected ? '2.5' : '1.1'}"
          />
          <text
            x="${x + cellW / 2}"
            y="${y + 17}"
            text-anchor="middle"
            font-size="11.5"
            font-weight="800"
            fill="${palette.text}"
          >${esc(lib.plateStr)}</text>
          <text
            x="${x + cellW / 2}"
            y="${y + 31}"
            text-anchor="middle"
            font-size="9"
            font-weight="700"
            fill="${subFill}"
          >${esc(subText)}</text>
          ${customDot}
        </g>
      `;
    }).join('');

    return `
      <svg class="lwl-heatmap-svg" viewBox="0 0 ${svgW} ${svgH}" role="img" aria-label="81 İl Halk Kütüphanesi Mesai Heatmap Matrisi">
        ${cellsSvg}
      </svg>
    `;
  }

  function renderRegionBreakdownSVG(synth, activeRegion, isLight, esc) {
    const maxHours = Math.max(
      20,
      ...synth.regionalStats.map((r) => r.totalHours)
    );
    const svgW = 460;
    const rowH = 44;
    const padTop = 10;
    const padBottom = 10;
    const svgH = padTop + synth.regionalStats.length * rowH + padBottom;
    const labelW = 114;
    const barStartX = 122;
    const barMaxW = 248;
    const textPrimary = isLight ? '#0f172a' : '#f8fafc';
    const textMuted = isLight ? '#475569' : '#94a3b8';
    const trackFill = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.07)';

    const rowsSvg = synth.regionalStats.map((reg, idx) => {
      const y = padTop + idx * rowH;
      const baseW = reg.baselineHours > 0 ? Math.max(4, (reg.baselineHours / maxHours) * barMaxW) : 0;
      const customW = reg.customHours > 0 ? Math.max(4, (reg.customHours / maxHours) * barMaxW) : 0;
      const isActive = activeRegion === reg.code;
      const rightLabel = `${reg.totalHours} sa (${reg.completedOffices}/${reg.totalOffices})`;

      return `
        <g
          class="lwl-region-row ${isActive ? 'is-active' : ''}"
          data-region="${esc(reg.code)}"
          tabindex="0"
          role="button"
          aria-label="${esc(reg.name)}: ${reg.totalHours} saat, ${reg.completedOffices}/${reg.totalOffices} kütüphane"
        >
          <rect
            class="lwl-region-bg"
            x="2"
            y="${y + 2}"
            width="${svgW - 4}"
            height="${rowH - 6}"
            rx="9"
            fill="${isActive ? (isLight ? 'rgba(2, 132, 199, 0.1)' : 'rgba(0, 242, 254, 0.09)') : 'transparent'}"
          />
          <text
            x="10"
            y="${y + 25}"
            font-size="11.5"
            font-weight="700"
            fill="${textPrimary}"
          >${esc(reg.icon)} ${esc(reg.shortName)}</text>

          <rect
            x="${barStartX}"
            y="${y + 13}"
            width="${barMaxW}"
            height="14"
            rx="7"
            fill="${trackFill}"
          />
          ${baseW > 0 ? `
            <rect
              x="${barStartX}"
              y="${y + 13}"
              width="${baseW.toFixed(1)}"
              height="14"
              rx="7"
              fill="#10b981"
            />
          ` : ''}
          ${customW > 0 ? `
            <rect
              x="${(barStartX + baseW).toFixed(1)}"
              y="${y + 13}"
              width="${Math.min(barMaxW - baseW, customW).toFixed(1)}"
              height="14"
              rx="4"
              fill="#00f2fe"
            />
          ` : ''}
          <text
            x="${svgW - 10}"
            y="${y + 24}"
            text-anchor="end"
            font-size="11"
            font-weight="700"
            fill="${reg.totalHours > 0 ? textPrimary : textMuted}"
          >${esc(rightLabel)}</text>
        </g>
      `;
    }).join('');

    return `
      <svg class="lwl-region-svg" viewBox="0 0 ${svgW} ${svgH}" role="img" aria-label="7 Bölge Kütüphane Mesai Dağılımı Grafiği">
        ${rowsSvg}
      </svg>
    `;
  }

  // ---------------------------------------------------------------------------
  // Markdown Portfolio Generator
  // ---------------------------------------------------------------------------

  function buildMarkdownPortfolio(synth, customSessions) {
    const today = formatDateTR(getTodayISO());
    const lines = [];

    lines.push('# 💻 Yolda İlim & 81 İl Halk Kütüphanesi Mesai Portföyü');
    lines.push('');
    lines.push(`> Oluşturulma Tarihi: **${today}** · *Anadolu Seyahatnamesi — 5 Gün Kuralı (Günde 4 Saat × 5 Gün = İl Başına 20 Saat Kütüphane Ofis Mesaisi)*`);
    lines.push('');
    lines.push('## 📊 Genel Mesai Özeti');
    lines.push('');
    lines.push(`- **Toplam İlim Mesaisi:** **${synth.grandTotalHours} saat** (${synth.totalBaselineHours} saat temel + ${synth.totalCustomHours} saat ek kişisel oturum)`);
    lines.push(`- **Tamamlanan Kütüphane Ofisi:** **${synth.visitedCount} / ${synth.libraries.length} il**`);
    lines.push(`- **Sıradaki Kütüphane Ofisleri:** **${synth.upcomingCount} il**`);
    lines.push(`- **Kayıtlı Özel Oturum:** **${customSessions.length} oturum**`);
    lines.push('');

    lines.push('## 🗺️ 7 Bölgeye Göre Mesai Dağılımı');
    lines.push('');
    lines.push('| Bölge | Tamamlanan Ofis | Temel Mesai | Özel Oturum | Toplam Saat |');
    lines.push('| :--- | :---: | :---: | :---: | :---: |');
    synth.regionalStats.forEach((reg) => {
      lines.push(`| ${reg.icon} ${reg.name} | ${reg.completedOffices}/${reg.totalOffices} | ${reg.baselineHours} sa | ${reg.customHours} sa | **${reg.totalHours} sa** |`);
    });
    lines.push('');

    lines.push('## ✍️ Kayıtlı Kişisel Kütüphane Oturumları');
    lines.push('');
    if (customSessions.length === 0) {
      lines.push('_Henüz kişisel ek kütüphane oturumu eklenmemiş._');
    } else {
      lines.push('| Tarih | İl | Kategori | Süre | Proje / Kitap | Not |');
      lines.push('| :--- | :--- | :--- | :---: | :--- | :--- |');
      customSessions.forEach((s) => {
        const lib = synth.byKey[s.provinceKey];
        const cityLabel = lib ? `${lib.plateStr} ${lib.name}` : s.provinceKey;
        const cat = getCategoryMeta(s.category);
        const safeTitle = (s.title || '-').replace(/\|/g, '\\|');
        const safeNote = (s.note || '-').replace(/\|/g, '\\|').replace(/\n+/g, ' ');
        lines.push(`| ${s.date} | ${cityLabel} | ${cat.label} | ${s.hours} sa | ${safeTitle} | ${safeNote} |`);
      });
    }
    lines.push('');

    lines.push('## ✅ Tamamlanan Kütüphane Ofisleri (Temel 20 sa + Ek Oturumlar)');
    lines.push('');
    synth.libraries.filter((l) => l.visited).forEach((l) => {
      lines.push(`- **${l.plateStr} ${l.name}** (${l.regionName}) — **${l.totalHours} sa**: ${l.libraryNote}`);
    });
    lines.push('');

    lines.push('## 🧭 Sıradaki Kütüphane Ofisleri');
    lines.push('');
    synth.libraries.filter((l) => !l.visited).forEach((l) => {
      const extra = l.customHours > 0 ? ` *(Ön-hazırlık: +${l.customHours} sa)*` : '';
      lines.push(`- **${l.plateStr} ${l.name}** (${l.regionName})${extra}: ${l.libraryNote}`);
    });
    lines.push('');

    return lines.join('\n');
  }

  function downloadMarkdownFile(filename, content) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---------------------------------------------------------------------------
  // Main Render Entry Point
  // ---------------------------------------------------------------------------

  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const safeCtx = ctx || {};
    const data = safeCtx.data || (safeCtx.state && safeCtx.state.data) || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const esc = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const norm = typeof safeCtx.normalizeTurkish === 'function' ? safeCtx.normalizeTurkish : fallbackNormalizeTurkish;
    const selectCity = typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};
    const showToast = typeof safeCtx.showToast === 'function' ? safeCtx.showToast : function () {};

    if (!data || !data.provinces) {
      container.innerHTML = `
        <div class="lwl-studio">
          <div class="lwl-empty-state">
            <h3>📚 Kütüphane Mesai Verisi Yüklenemedi</h3>
            <p>İl verileri henüz hazır değil. Lütfen veri kaynağını kontrol edin.</p>
          </div>
        </div>
      `;
      return;
    }

    const customSessions = loadCustomSessions(data.provinces);
    const synth = synthesizeWorkData(data, customSessions, norm);

    if (!uiState.formProvinceKey && synth.libraries.length > 0) {
      const firstVisited = synth.libraries.find((l) => l.visited);
      uiState.formProvinceKey = (firstVisited || synth.libraries[0]).key;
    }
    if (!uiState.formDate) {
      uiState.formDate = getTodayISO();
    }
    if (!uiState.selectedKey || !synth.byKey[uiState.selectedKey]) {
      const defaultSelected = synth.libraries.find((l) => l.visited) || synth.libraries[0];
      uiState.selectedKey = defaultSelected ? defaultSelected.key : null;
    }

    const isLight = document.body.classList.contains('light-theme');
    const goalPct = synth.targetTotalHours > 0
      ? Math.min(100, Math.round((synth.grandTotalHours / synth.targetTotalHours) * 1000) / 10)
      : 0;
    const visitedPct = synth.libraries.length > 0
      ? Math.round((synth.visitedCount / synth.libraries.length) * 1000) / 10
      : 0;

    let topCategory = null;
    WORK_CATEGORIES.forEach((c) => {
      const stat = synth.categoryTotals[c.id];
      if (stat && stat.hours > 0 && (!topCategory || stat.hours > topCategory.hours)) {
        topCategory = { ...c, hours: stat.hours };
      }
    });

    const selectedLib = uiState.selectedKey ? synth.byKey[uiState.selectedKey] : null;
    const normalizedSearch = norm(uiState.search);

    const filteredLibraries = synth.libraries.filter((lib) => {
      if (uiState.region !== 'all' && lib.regionCode !== uiState.region) return false;
      if (uiState.statusFilter === 'completed' && !lib.visited) return false;
      if (uiState.statusFilter === 'upcoming' && lib.visited) return false;
      if (uiState.statusFilter === 'logged' && lib.customHours === 0) return false;
      if (normalizedSearch && !lib.searchHaystack.includes(normalizedSearch)) return false;
      return true;
    });

    const provinceOptionsHtml = synth.libraries.map((lib) => {
      const marker = lib.visited ? '✓' : '○';
      const selected = uiState.formProvinceKey === lib.key ? 'selected' : '';
      return `<option value="${esc(lib.key)}" ${selected}>${esc(lib.plateStr)} — ${esc(lib.name)} [${marker}]</option>`;
    }).join('');

    const regionOptionsHtml = REGION_ORDER.map((code) => {
      const info = (data.regions && data.regions[code]) || {};
      const selected = uiState.region === code ? 'selected' : '';
      return `<option value="${esc(code)}" ${selected}>${esc(info.icon || '')} ${esc(info.name || code)}</option>`;
    }).join('');

    const categoryButtonsHtml = WORK_CATEGORIES.map((cat) => {
      const active = uiState.formCategory === cat.id ? 'active' : '';
      return `
        <button type="button" class="lwl-cat-btn ${active}" data-cat-id="${esc(cat.id)}">
          <span>${esc(cat.label)}</span>
        </button>
      `;
    }).join('');

    const categorySummaryHtml = WORK_CATEGORIES.map((cat) => {
      const stat = synth.categoryTotals[cat.id] || { hours: 0, count: 0 };
      return `
        <div class="lwl-cat-stat">
          <span>${esc(cat.icon)} ${esc(cat.shortLabel)}</span>
          <strong>${formatNumber(stat.hours)} sa (${stat.count})</strong>
        </div>
      `;
    }).join('');

    const sessionsListHtml = customSessions.length === 0
      ? `
        <div class="lwl-empty-state">
          Henüz kişisel ek mesai oturumu kaydedilmedi.<br />
          Soldaki formu kullanarak ilk kütüphane çalışma seansını deftere ekle!
        </div>
      `
      : customSessions.map((s) => {
        const lib = synth.byKey[s.provinceKey];
        const cat = getCategoryMeta(s.category);
        const cityLabel = lib ? `${lib.plateStr} ${lib.name}` : s.provinceKey;
        return `
          <div class="lwl-session-item">
            <div class="lwl-session-head">
              <div>
                <div class="lwl-session-title">${esc(cat.icon)} ${esc(s.title)}</div>
                <div class="lwl-session-meta">
                  <button type="button" class="lwl-card-link" data-jump-city="${esc(s.provinceKey)}">🏛️ ${esc(cityLabel)}</button>
                  <span>·</span>
                  <span>${esc(cat.shortLabel)}</span>
                  <span>·</span>
                  <strong>+${s.hours} sa</strong>
                  <span>·</span>
                  <span>${esc(formatDateTR(s.date))}</span>
                </div>
              </div>
              <button type="button" class="lwl-delete-btn" data-delete-session="${esc(s.id)}" title="Bu mesai kaydını sil">Sil</button>
            </div>
            ${s.note ? `<div class="lwl-session-note">${esc(s.note)}</div>` : ''}
          </div>
        `;
      }).join('');

    const inspectorHtml = selectedLib ? `
      <section class="lwl-inspector" id="lwl-selected-inspector" aria-label="Seçili Kütüphane Ofisi Detayı">
        <div class="lwl-inspector-top">
          <div>
            <div class="lwl-inspector-title-row">
              <span class="lwl-plate-pill">${esc(selectedLib.plateStr)}</span>
              <h3 class="lwl-panel-title">${esc(selectedLib.name)} İl Halk Kütüphanesi Ofisi</h3>
              <span class="lwl-status-pill ${selectedLib.visited ? 'completed' : 'upcoming'}">
                ${selectedLib.visited ? '✅ Tamamlanan Ofis' : '🧭 Sıradaki Ofis'}
              </span>
            </div>
            <p class="lwl-panel-sub">
              ${esc(selectedLib.regionIcon)} ${esc(selectedLib.regionName)} ·
              <strong>${formatNumber(selectedLib.totalHours)} saat</strong> toplam mesai
              (${selectedLib.baselineHours} sa temel + ${selectedLib.customHours} sa özel oturum)
            </p>
          </div>
          <div class="lwl-hero-actions">
            <button type="button" class="lwl-btn lwl-btn-secondary lwl-btn-sm" id="lwl-inspector-add-btn" data-prefill-key="${esc(selectedLib.key)}">
              ➕ Bu Ofise Mesai Ekle
            </button>
            <button type="button" class="lwl-btn lwl-btn-primary lwl-btn-sm" id="lwl-inspector-city-btn" data-jump-city="${esc(selectedLib.key)}">
              🏛️ Şehir Rehberine Git →
            </button>
          </div>
        </div>
        <div class="lwl-inspector-note">
          📚 <strong>Ofis Notu:</strong> ${esc(selectedLib.libraryNote)}
        </div>
        ${selectedLib.sessions.length > 0 ? `
          <div class="lwl-session-meta">
            <strong>Bu şehirdeki kişisel oturumlar (${selectedLib.sessions.length}):</strong>
            ${selectedLib.sessions.map((s) => `${getCategoryMeta(s.category).icon} ${esc(s.title)} (+${s.hours} sa)`).join(' · ')}
          </div>
        ` : ''}
      </section>
    ` : '';

    const cardsHtml = filteredLibraries.length === 0
      ? `<div class="lwl-empty-state">Filtre kriterlerine uyan kütüphane ofisi bulunamadı.</div>`
      : filteredLibraries.map((lib) => {
        const isSelected = uiState.selectedKey === lib.key;
        const hoursText = lib.totalHours > 0
          ? `${lib.totalHours} sa${lib.customHours > 0 ? ` (+${lib.customHours})` : ''}`
          : 'Planlı · 0 sa';
        return `
          <article
            class="lwl-lib-card ${lib.visited ? 'is-completed' : 'is-upcoming'} ${isSelected ? 'is-selected' : ''}"
            data-card-key="${esc(lib.key)}"
            tabindex="0"
            role="button"
            aria-label="${esc(lib.plateStr)} ${esc(lib.name)} kütüphane ofis detayını aç"
          >
            <div>
              <div class="lwl-card-top">
                <div class="lwl-card-city">
                  <span class="lwl-plate-pill">${esc(lib.plateStr)}</span>
                  <div>
                    <div class="lwl-card-name">${esc(lib.name)}</div>
                    <div class="lwl-card-region">${esc(lib.regionIcon)} ${esc(lib.regionShort)}</div>
                  </div>
                </div>
                <span class="lwl-hours-chip ${lib.visited ? 'completed' : 'upcoming'}">${esc(hoursText)}</span>
              </div>
              <p class="lwl-card-note" style="margin-top:10px;">${esc(lib.libraryNote)}</p>
            </div>
            <div class="lwl-card-footer">
              <span>${lib.sessions.length > 0 ? `📝 ${lib.sessions.length} özel oturum` : (lib.visited ? '✅ 20 sa temel mesai' : '🧭 Sıradaki durak')}</span>
              <button type="button" class="lwl-card-link" data-jump-city="${esc(lib.key)}">Şehir Detayı →</button>
            </div>
          </article>
        `;
      }).join('');

    container.innerHTML = `
      <div class="lwl-studio">
        <!-- Hero & KPIs -->
        <section class="lwl-hero">
          <div class="lwl-hero-top">
            <div>
              <div class="lwl-hero-badge">📚 Dijital Seyyah · 5 Gün Kuralı İlim Atölyesi</div>
              <h2 class="lwl-hero-title">💻 Yolda İlim & 81 İl Halk Kütüphanesi Mesai Defteri</h2>
              <p class="lwl-hero-desc">
                Gezilen <strong>${synth.visitedCount} il × ${BASELINE_HOURS_PER_VISITED} saat = ${formatNumber(synth.totalBaselineHours)} saat</strong> temel kütüphane ofis mesaisini
                kişisel kodlama, okuma ve araştırma oturumlarınla birleştir; 81 ilin tamamındaki üretim haritanı canlı takip et.
              </p>
            </div>
            <div class="lwl-hero-actions">
              <button type="button" class="lwl-btn lwl-btn-secondary" id="lwl-scroll-form-btn">
                ➕ Yeni Mesai Kaydet
              </button>
              <button type="button" class="lwl-btn lwl-btn-primary" id="lwl-export-md-btn">
                📥 Mesai Portföyünü Markdown İndir
              </button>
            </div>
          </div>

          <div class="lwl-kpi-grid">
            <div class="lwl-kpi-card">
              <div class="lwl-kpi-label">Toplam İlim Mesaisi</div>
              <div class="lwl-kpi-val emerald">${formatNumber(synth.grandTotalHours)} sa</div>
              <div class="lwl-kpi-sub">${formatNumber(synth.totalBaselineHours)} sa temel + ${formatNumber(synth.totalCustomHours)} sa özel</div>
            </div>
            <div class="lwl-kpi-card">
              <div class="lwl-kpi-label">Kütüphane Ofisi</div>
              <div class="lwl-kpi-val cyan">${synth.visitedCount} / ${synth.libraries.length}</div>
              <div class="lwl-kpi-sub">%${visitedPct} tamamlandı · ${synth.upcomingCount} sıradaki ofis</div>
            </div>
            <div class="lwl-kpi-card">
              <div class="lwl-kpi-label">Kayıtlı Özel Oturum</div>
              <div class="lwl-kpi-val gold">${customSessions.length} oturum</div>
              <div class="lwl-kpi-sub">${topCategory ? `Favori: ${esc(topCategory.icon)} ${esc(topCategory.shortLabel)}` : 'İlk özel oturumunu ekle'}</div>
            </div>
            <div class="lwl-kpi-card">
              <div class="lwl-kpi-label">81 İl Nihai Hedef</div>
              <div class="lwl-kpi-val">%${goalPct}</div>
              <div class="lwl-kpi-sub">${formatNumber(synth.grandTotalHours)} / ${formatNumber(synth.targetTotalHours)} saat</div>
              <div class="lwl-progress-track">
                <div class="lwl-progress-fill" style="width:${goalPct}%"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- SVG Contribution Heatmap + 7-Region Breakdown -->
        <section class="lwl-charts-grid">
          <div class="lwl-panel">
            <div class="lwl-panel-head">
              <div>
                <h3 class="lwl-panel-title">🟩 81 İl Kütüphane Mesai Heatmap Matrisi</h3>
                <p class="lwl-panel-sub">Her hücre 01–81 plaka sırasıyla bir İl Halk Kütüphanesi ofisini temsil eder; detay için tıkla.</p>
              </div>
              <div class="lwl-legend">
                <span class="lwl-legend-item">
                  <span class="lwl-legend-swatch" style="background:#10b981;"></span> Tamamlanan Ofis (20+ sa)
                </span>
                <span class="lwl-legend-item">
                  <span class="lwl-legend-swatch" style="background:#00f2fe;"></span> Sıradaki Ofis
                </span>
                <span class="lwl-legend-item">
                  <span class="lwl-legend-swatch" style="background:#f59e0b;border-radius:999px;"></span> Özel Oturumlu
                </span>
              </div>
            </div>
            <div class="lwl-svg-wrap" id="lwl-heatmap-wrap">
              ${renderHeatmapSVG(synth, uiState.selectedKey, isLight, esc)}
            </div>
          </div>

          <div class="lwl-panel">
            <div class="lwl-panel-head">
              <div>
                <h3 class="lwl-panel-title">📊 7 Bölge Mesai Saatleri Dağılımı</h3>
                <p class="lwl-panel-sub">Yeşil: temel 20 sa/il · Camgöbeği: özel ek oturumlar. Filtrelemek için bölgeye tıkla.</p>
              </div>
              ${uiState.region !== 'all' ? `
                <button type="button" class="lwl-btn lwl-btn-secondary lwl-btn-sm" id="lwl-clear-region-btn">Filtreyi Temizle</button>
              ` : ''}
            </div>
            <div class="lwl-svg-wrap" id="lwl-region-chart-wrap">
              ${renderRegionBreakdownSVG(synth, uiState.region, isLight, esc)}
            </div>
          </div>
        </section>

        <!-- Selected Library Detail Inspector -->
        ${inspectorHtml}

        <!-- New Session Form & Logged Sessions -->
        <section class="lwl-workspace-grid" id="lwl-form-section">
          <div class="lwl-panel">
            <div class="lwl-panel-head">
              <div>
                <h3 class="lwl-panel-title">✍️ + Yeni Kütüphane Mesaisi Kaydet</h3>
                <p class="lwl-panel-sub">01–81 arası herhangi bir ilde yaptığın kodlama, okuma veya araştırma oturumunu işle.</p>
              </div>
            </div>

            <form class="lwl-form" id="lwl-add-session-form">
              <div class="lwl-form-row">
                <div class="lwl-field">
                  <label class="lwl-label" for="lwl-input-province">İl Seçimi (01–81)</label>
                  <select class="lwl-select" id="lwl-input-province" required>
                    ${provinceOptionsHtml}
                  </select>
                </div>
                <div class="lwl-field">
                  <label class="lwl-label" for="lwl-input-date">Mesai Tarihi</label>
                  <input class="lwl-input" id="lwl-input-date" type="date" value="${esc(uiState.formDate)}" required />
                </div>
              </div>

              <div class="lwl-field">
                <label class="lwl-label" for="lwl-input-hours">Çalışma Süresi (1–12 sa)</label>
                <div class="lwl-hours-picker">
                  <input
                    class="lwl-hours-range"
                    id="lwl-input-hours"
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value="${uiState.formHours}"
                  />
                  <span class="lwl-hours-badge" id="lwl-hours-display">${uiState.formHours} sa</span>
                </div>
              </div>

              <div class="lwl-field">
                <span class="lwl-label">Çalışma Kategorisi</span>
                <div class="lwl-cat-grid" id="lwl-cat-grid">
                  ${categoryButtonsHtml}
                </div>
              </div>

              <div class="lwl-field">
                <label class="lwl-label" for="lwl-input-title">Proje / Kitap Adı</label>
                <input
                  class="lwl-input"
                  id="lwl-input-title"
                  type="text"
                  maxlength="140"
                  placeholder="Örn: Anadolu Seyahatnamesi API veya Safahat Okuması"
                  value="${esc(uiState.formTitle)}"
                  required
                />
              </div>

              <div class="lwl-field">
                <label class="lwl-label" for="lwl-input-note">Kütüphane & Mesai Notu</label>
                <textarea
                  class="lwl-textarea"
                  id="lwl-input-note"
                  maxlength="600"
                  placeholder="Masa düzeni, sessizlik, internet hızı veya aldığın ilham notları..."
                >${esc(uiState.formNote)}</textarea>
              </div>

              <button type="submit" class="lwl-btn lwl-btn-primary">
                💾 Mesaiyi Deftere İşle
              </button>
            </form>
          </div>

          <div class="lwl-panel">
            <div class="lwl-panel-head">
              <div>
                <h3 class="lwl-panel-title">🗂️ Kategori Dağılımı & Özel Mesai Günlüğü</h3>
                <p class="lwl-panel-sub">Tarayıcı hafızasında (<code>${STORAGE_KEY}</code>) saklanan kişisel oturumların.</p>
              </div>
            </div>

            <div class="lwl-cat-summary">
              ${categorySummaryHtml}
            </div>

            <div class="lwl-session-list">
              ${sessionsListHtml}
            </div>
          </div>
        </section>

        <!-- 81 Province Library Directory -->
        <section class="lwl-panel">
          <div class="lwl-panel-head">
            <div>
              <h3 class="lwl-panel-title">🏛️ 81 İl Halk Kütüphanesi Ofis Kartları (${filteredLibraries.length}/${synth.libraries.length})</h3>
              <p class="lwl-panel-sub">Karta tıklayarak ofis detayını incele veya doğrudan şehir rehberine geç.</p>
            </div>
          </div>

          <div class="lwl-dir-controls">
            <div class="lwl-dir-inputs">
              <input
                type="search"
                class="lwl-input"
                id="lwl-dir-search"
                placeholder="İl adı, plaka veya kütüphane notu ara..."
                value="${esc(uiState.search)}"
              />
              <select class="lwl-select" id="lwl-dir-region">
                <option value="all" ${uiState.region === 'all' ? 'selected' : ''}>🗺️ Tüm Bölgeler (7)</option>
                ${regionOptionsHtml}
              </select>
            </div>
            <div class="lwl-filter-pills">
              <button type="button" class="lwl-pill-btn ${uiState.statusFilter === 'all' ? 'active' : ''}" data-status-filter="all">
                Tümü (${synth.libraries.length})
              </button>
              <button type="button" class="lwl-pill-btn ${uiState.statusFilter === 'completed' ? 'active' : ''}" data-status-filter="completed">
                ✅ Tamamlanan (${synth.visitedCount})
              </button>
              <button type="button" class="lwl-pill-btn ${uiState.statusFilter === 'upcoming' ? 'active' : ''}" data-status-filter="upcoming">
                🧭 Sıradaki (${synth.upcomingCount})
              </button>
              <button type="button" class="lwl-pill-btn ${uiState.statusFilter === 'logged' ? 'active' : ''}" data-status-filter="logged">
                ⭐ Özel Mesaili
              </button>
            </div>
          </div>

          <div class="lwl-cards-grid">
            ${cardsHtml}
          </div>
        </section>
      </div>
    `;

    // -------------------------------------------------------------------------
    // Event Wiring
    // -------------------------------------------------------------------------

    const rerender = () => {
      hideTooltip();
      render(container, safeCtx);
    };

    // Hero Actions
    const scrollFormBtn = container.querySelector('#lwl-scroll-form-btn');
    if (scrollFormBtn) {
      scrollFormBtn.addEventListener('click', () => {
        const formSection = container.querySelector('#lwl-form-section');
        if (formSection) formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const titleInput = container.querySelector('#lwl-input-title');
        if (titleInput) titleInput.focus();
      });
    }

    const exportMdBtn = container.querySelector('#lwl-export-md-btn');
    if (exportMdBtn) {
      exportMdBtn.addEventListener('click', () => {
        const md = buildMarkdownPortfolio(synth, customSessions);
        const filename = `dijital-seyyah-kutuphane-mesai-defteri-${getTodayISO()}.md`;
        downloadMarkdownFile(filename, md);
        showToast('📥 Kütüphane mesai portföyü Markdown olarak indirildi.', 'success');
      });
    }

    // Heatmap SVG Interactivity
    container.querySelectorAll('.lwl-heat-cell').forEach((cell) => {
      const key = cell.getAttribute('data-key');
      const lib = synth.byKey[key];
      if (!lib) return;

      const handleTooltipMove = (ev) => {
        const statusLabel = lib.visited ? '✅ Tamamlanan Ofis' : '🧭 Sıradaki Ofis';
        const tipHtml = `
          <div style="font-weight:800;margin-bottom:3px;">${esc(lib.plateStr)} — ${esc(lib.name)}</div>
          <div style="opacity:0.85;margin-bottom:4px;">${statusLabel} · <strong>${lib.totalHours} saat</strong> (${lib.baselineHours}s temel + ${lib.customHours}s özel)</div>
          <div style="opacity:0.78;">${esc(lib.libraryNote)}</div>
        `;
        showTooltip(tipHtml, ev.clientX, ev.clientY);
      };

      cell.addEventListener('mouseenter', handleTooltipMove);
      cell.addEventListener('mousemove', handleTooltipMove);
      cell.addEventListener('mouseleave', hideTooltip);

      const activateCell = () => {
        uiState.selectedKey = key;
        uiState.formProvinceKey = key;
        rerender();
        const insp = container.querySelector('#lwl-selected-inspector');
        if (insp) insp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };

      cell.addEventListener('click', activateCell);
      cell.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          activateCell();
        }
      });
    });

    // 7-Region Bar Chart Interactivity
    container.querySelectorAll('.lwl-region-row').forEach((row) => {
      const regCode = row.getAttribute('data-region');
      const toggleRegion = () => {
        uiState.region = uiState.region === regCode ? 'all' : regCode;
        rerender();
      };
      row.addEventListener('click', toggleRegion);
      row.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          toggleRegion();
        }
      });
    });

    const clearRegionBtn = container.querySelector('#lwl-clear-region-btn');
    if (clearRegionBtn) {
      clearRegionBtn.addEventListener('click', () => {
        uiState.region = 'all';
        rerender();
      });
    }

    // Inspector Actions
    const prefillBtn = container.querySelector('#lwl-inspector-add-btn');
    if (prefillBtn) {
      prefillBtn.addEventListener('click', () => {
        const key = prefillBtn.getAttribute('data-prefill-key');
        if (key) {
          uiState.formProvinceKey = key;
          const sel = container.querySelector('#lwl-input-province');
          if (sel) sel.value = key;
        }
        const formSection = container.querySelector('#lwl-form-section');
        if (formSection) formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const titleInput = container.querySelector('#lwl-input-title');
        if (titleInput) titleInput.focus();
      });
    }

    // Jump to City buttons (Inspector, Sessions, Cards)
    container.querySelectorAll('[data-jump-city]').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const key = btn.getAttribute('data-jump-city');
        if (key) selectCity(key);
      });
    });

    // Form Controls
    const provinceSelect = container.querySelector('#lwl-input-province');
    if (provinceSelect) {
      provinceSelect.addEventListener('change', (ev) => {
        uiState.formProvinceKey = ev.target.value;
      });
    }

    const dateInput = container.querySelector('#lwl-input-date');
    if (dateInput) {
      dateInput.addEventListener('change', (ev) => {
        uiState.formDate = ev.target.value;
      });
    }

    const hoursInput = container.querySelector('#lwl-input-hours');
    const hoursDisplay = container.querySelector('#lwl-hours-display');
    if (hoursInput) {
      hoursInput.addEventListener('input', (ev) => {
        const val = Math.max(1, Math.min(12, parseInt(ev.target.value, 10) || 1));
        uiState.formHours = val;
        if (hoursDisplay) hoursDisplay.textContent = `${val} sa`;
      });
    }

    container.querySelectorAll('[data-cat-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiState.formCategory = btn.getAttribute('data-cat-id') || 'coding';
        container.querySelectorAll('[data-cat-id]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-cat-id') === uiState.formCategory);
        });
      });
    });

    const titleField = container.querySelector('#lwl-input-title');
    if (titleField) {
      titleField.addEventListener('input', (ev) => {
        uiState.formTitle = ev.target.value;
      });
    }

    const noteField = container.querySelector('#lwl-input-note');
    if (noteField) {
      noteField.addEventListener('input', (ev) => {
        uiState.formNote = ev.target.value;
      });
    }

    const formEl = container.querySelector('#lwl-add-session-form');
    if (formEl) {
      formEl.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const provinceKey = (provinceSelect && provinceSelect.value) || uiState.formProvinceKey;
        const hours = Math.max(1, Math.min(12, parseInt((hoursInput && hoursInput.value) || uiState.formHours, 10) || 1));
        const category = getCategoryMeta(uiState.formCategory).id;
        const title = ((titleField && titleField.value) || '').trim();
        const note = ((noteField && noteField.value) || '').trim();
        const date = ((dateInput && dateInput.value) || getTodayISO()).trim();

        if (!provinceKey || !synth.byKey[provinceKey]) {
          showToast('Lütfen geçerli bir il seçin.', 'warning');
          return;
        }
        if (!title) {
          showToast('Lütfen proje veya kitap adını girin.', 'warning');
          if (titleField) titleField.focus();
          return;
        }

        const nextSession = {
          id: createSessionId(),
          provinceKey,
          hours,
          category,
          title,
          note,
          date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getTodayISO(),
          createdAt: Date.now()
        };

        const updated = [nextSession, ...customSessions];
        saveCustomSessions(updated);

        uiState.selectedKey = provinceKey;
        uiState.formTitle = '';
        uiState.formNote = '';
        const lib = synth.byKey[provinceKey];
        showToast(`✅ ${lib.plateStr} ${lib.name} için +${hours} saat kütüphane mesaisi kaydedildi!`, 'success');
        rerender();
      });
    }

    // Delete Custom Session
    container.querySelectorAll('[data-delete-session]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-session');
        const next = customSessions.filter((s) => s.id !== id);
        saveCustomSessions(next);
        showToast('🗑️ Kütüphane mesai kaydı silindi.', 'info');
        rerender();
      });
    });

    // Directory Filters
    const searchInput = container.querySelector('#lwl-dir-search');
    if (searchInput) {
      searchInput.addEventListener('input', (ev) => {
        uiState.search = ev.target.value;
        rerender();
        const nextInput = container.querySelector('#lwl-dir-search');
        if (nextInput) {
          nextInput.focus();
          const len = nextInput.value.length;
          nextInput.setSelectionRange(len, len);
        }
      });
    }

    const regionSelect = container.querySelector('#lwl-dir-region');
    if (regionSelect) {
      regionSelect.addEventListener('change', (ev) => {
        uiState.region = ev.target.value;
        rerender();
      });
    }

    container.querySelectorAll('[data-status-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiState.statusFilter = btn.getAttribute('data-status-filter') || 'all';
        rerender();
      });
    });

    // Library Card Selection
    container.querySelectorAll('.lwl-lib-card').forEach((card) => {
      const key = card.getAttribute('data-card-key');
      const openCardDetails = () => {
        uiState.selectedKey = key;
        uiState.formProvinceKey = key;
        rerender();
        const insp = container.querySelector('#lwl-selected-inspector');
        if (insp) insp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
      card.addEventListener('click', openCardDetails);
      card.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          openCardDetails();
        }
      });
    });
  }

  window.SEYYAH_MODULES.workLog = { render };
})();
