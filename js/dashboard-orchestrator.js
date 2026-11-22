/**
 * Dijital Seyyah — Editorial Dashboard Orchestrator & Vitrin Modu Switcher
 * File: js/dashboard-orchestrator.js
 * Registers on: window.SEYYAH_MODULES.dashboardOrchestrator = { init(ctx) }
 *
 * Purpose:
 *   Enforces an Apple / National Geographic editorial hierarchy on `.dashboard-view`
 *   so the Hero Banner (`.hero-banner-visual`) and the 4 core KPI cards (`.stats-grid`)
 *   are ALWAYS immediately visible at the very top of the page.
 *   Relocates Wave 4-7 widgets (`.anadolu-stories-bar`, `.daily-spotlight-card`,
 *   `.seyyah-philosophy-ribbon`) cleanly below `.stats-grid` and mounts a sleek
 *   1-click Vitrin Modu Switcher (`.seyyah-dash-mode-bar`) persisted in localStorage.
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-dashboard-orchestrator-styles';
  const MODE_BAR_CLASS = 'seyyah-dash-mode-bar';
  const STORAGE_KEY = 'dijital_seyyah_dash_mode';

  const VALID_MODES = ['full', 'focus', 'planner', 'irfan'];

  const MODE_META = {
    full: {
      id: 'full',
      label: '✨ Tam Külliyat',
      caption: 'Tüm keşif panelleri, hikâyeler, irfan ve stüdyolar açık'
    },
    focus: {
      id: 'focus',
      label: '🎯 Odak & Öz',
      caption: 'Yalın editoryal vitrin: Kahraman, 4 KPI, Aktif Rota ve 7 Bölge'
    },
    planner: {
      id: 'planner',
      label: '🧭 Sefer & Rota',
      caption: 'Sefer planlama vitrini: Kahraman, 4 KPI, Aktif Sefer Kartı ve 7 Bölge İlerlemesi'
    },
    irfan: {
      id: 'irfan',
      label: '🕌 İrfan & Hikmet',
      caption: 'Günün menzili, irfan şeridi ve manevi kapılara hızlı geçiş'
    }
  };

  const IRFAN_QUICK_BUTTONS = [
    { view: 'irfanAtlas', label: '🕌 İrfan Atlası', hint: '24 Gönül Sultanı' },
    { view: 'hikmetMeclisi', label: '📜 Hikmet Meclisi', hint: '5 Bilge AI' },
    { view: 'halvet', label: '🕯️ Halvet Odası', hint: 'Tefekkür & Ney' },
    { view: 'skyMap', label: '🌌 Anadolu Semâsı', hint: '81 Yıldız' }
  ];

  const PLANNER_QUICK_BUTTONS = [
    { view: 'route', label: '🧭 Rota & GPX', hint: '2-Opt Plan' },
    { view: 'mesopotamia', label: '🏜️ Mezopotamya', hint: '0/9 Özel Sefer' },
    { view: 'budget', label: '💰 Bütçe', hint: 'GSB Hesabı' },
    { view: 'packing', label: '🎒 Sırt Çantası', hint: 'Ekipman' }
  ];

  const SURPRISE_STUDIOS = [
    { view: 'cinematicTour', label: 'Sinematik Anadolu Turu' },
    { view: 'skyMap', label: 'Anadolu Semâsı (81 Yıldız)' },
    { view: 'hikmetMeclisi', label: 'Hikmet Meclisi (5 Bilge AI)' },
    { view: 'halvet', label: 'Halvet & Tefekkür Odası' },
    { view: 'aiMood', label: 'AI Ruh Hali Kaşifi' },
    { view: 'aiBattle', label: 'AI Şehir Düellosu' },
    { view: 'aiChef', label: 'AI Gurme Şef' },
    { view: 'postcard', label: 'Kartpostal Stüdyosu' },
    { view: 'sound', label: 'Sufi Ses Stüdyosu' },
    { view: 'quiz', label: '81 İl Bilgi Yarışması' },
    { view: 'distanceGame', label: 'Mesafe Düellosu' },
    { view: 'makamAtlas', label: 'Anadolu Makamları & Mûsikî' },
    { view: 'sevenValleys', label: 'Yedi Vadi (Mantıku\'t-Tayr)' },
    { view: 'natureWonders', label: 'Tabiat Harikaları & Kaplıcalar' },
    { view: 'caravanserai', label: 'Kervansaray & İpek Yolu' },
    { view: 'bazaar', label: 'Zanaatlar & Tarihi Çarşılar' }
  ];

  let activeCtx = null;
  let viewportObserver = null;
  let isOrchestrating = false;
  let lastSurpriseView = null;

  // =========================================================================
  // Persistence Helpers
  // =========================================================================

  function loadMode() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && VALID_MODES.indexOf(saved) !== -1) {
        return saved;
      }
    } catch (err) {
      // Ignore storage access errors in restricted contexts
    }
    return 'full';
  }

  function saveMode(mode) {
    if (VALID_MODES.indexOf(mode) === -1) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch (err) {
      // Ignore storage access errors
    }
  }

  // =========================================================================
  // Scoped Styles (Obsidian Dark & Alabaster Light Theme Parity)
  // =========================================================================

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* =====================================================================
         Dashboard Orchestrator & Vitrin Modu Switcher (Apple / NatGeo Grade)
         ===================================================================== */
      .dashboard-view > .anadolu-stories-bar,
      .dashboard-view > .daily-spotlight-card,
      .dashboard-view > .seyyah-philosophy-ribbon {
        width: 100%;
        max-width: 100%;
        margin: 0;
        box-sizing: border-box;
      }

      .${MODE_BAR_CLASS} {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        padding: 12px 16px;
        border-radius: var(--radius-lg, 18px);
        background:
          linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(10, 15, 29, 0.92) 100%);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(255, 255, 255, 0.11);
        box-shadow:
          0 12px 30px -14px rgba(0, 0, 0, 0.6),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);
        box-sizing: border-box;
      }

      .sdo-bar-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px 16px;
        flex-wrap: wrap;
      }

      .sdo-bar-info {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        min-width: 0;
      }

      .sdo-bar-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #fbbf24;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.28);
        white-space: nowrap;
      }

      .sdo-natgeo-mark {
        display: inline-block;
        width: 7px;
        height: 11px;
        border: 1.8px solid #fbbf24;
        border-radius: 1.5px;
        box-shadow: 0 0 8px rgba(251, 191, 36, 0.45);
        flex-shrink: 0;
      }

      .sdo-mode-caption {
        font-size: 0.78rem;
        font-weight: 500;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.35;
      }

      .sdo-bar-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .sdo-pills-track {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px;
        border-radius: 9999px;
        background: rgba(2, 6, 23, 0.62);
        border: 1px solid rgba(255, 255, 255, 0.08);
        flex-wrap: wrap;
      }

      .sdo-surprise-btn {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 9999px;
        border: 1px solid rgba(168, 85, 247, 0.45);
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(0, 242, 254, 0.16) 100%);
        color: #f5f3ff;
        font-family: inherit;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .sdo-surprise-btn:hover,
      .sdo-surprise-btn:focus-visible {
        outline: none;
        transform: translateY(-1px);
        border-color: rgba(0, 242, 254, 0.72);
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.34) 0%, rgba(0, 242, 254, 0.26) 100%);
        box-shadow: 0 8px 18px -6px rgba(168, 85, 247, 0.45);
      }

      .sdo-mode-pill {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 14px;
        border-radius: 9999px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--text-secondary, #cbd5e1);
        font-family: inherit;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .sdo-mode-pill:hover,
      .sdo-mode-pill:focus-visible {
        outline: none;
        color: #f8fafc;
        background: rgba(255, 255, 255, 0.07);
      }

      .sdo-mode-pill.is-active {
        color: #0b1120;
        background: linear-gradient(135deg, #fde68a 0%, #f59e0b 100%);
        border-color: rgba(254, 243, 199, 0.65);
        box-shadow: 0 4px 14px -4px rgba(245, 158, 11, 0.55);
      }

      .sdo-mode-pill[data-sdo-mode="focus"].is-active {
        color: #04131c;
        background: linear-gradient(135deg, #67e8f9 0%, #06b6d4 100%);
        border-color: rgba(207, 250, 254, 0.7);
        box-shadow: 0 4px 14px -4px rgba(6, 182, 212, 0.5);
      }

      .sdo-mode-pill[data-sdo-mode="planner"].is-active {
        color: #022c22;
        background: linear-gradient(135deg, #6ee7b7 0%, #10b981 100%);
        border-color: rgba(209, 250, 229, 0.72);
        box-shadow: 0 4px 14px -4px rgba(16, 185, 129, 0.52);
      }

      .sdo-mode-pill[data-sdo-mode="irfan"].is-active {
        color: #fef3c7;
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.35) 0%, rgba(20, 184, 166, 0.32) 100%);
        border-color: rgba(212, 175, 55, 0.65);
        box-shadow: 0 4px 16px -4px rgba(212, 175, 55, 0.35);
      }

      /* Planner Quick Gateways Strip */
      .sdo-planner-quickbar {
        display: none;
        align-items: center;
        justify-content: space-between;
        gap: 10px 14px;
        flex-wrap: wrap;
        padding-top: 10px;
        border-top: 1px solid rgba(16, 185, 129, 0.24);
      }

      .sdo-planner-quickbar.is-visible {
        display: flex;
      }

      .sdo-planner-quick-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        color: #6ee7b7;
        letter-spacing: 0.02em;
      }

      .sdo-planner-btn {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 7px 13px;
        border-radius: 12px;
        border: 1px solid rgba(16, 185, 129, 0.34);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(6, 182, 212, 0.1) 100%);
        color: #d1fae5;
        font-family: inherit;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .sdo-planner-btn:hover,
      .sdo-planner-btn:focus-visible {
        outline: none;
        transform: translateY(-1px);
        border-color: rgba(52, 211, 153, 0.75);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.26) 0%, rgba(6, 182, 212, 0.2) 100%);
        box-shadow: 0 8px 18px -8px rgba(16, 185, 129, 0.45);
      }

      /* İrfan & Hikmet Quick Gateways Strip */
      .sdo-irfan-quickbar {
        display: none;
        align-items: center;
        justify-content: space-between;
        gap: 10px 14px;
        flex-wrap: wrap;
        padding-top: 10px;
        border-top: 1px solid rgba(212, 175, 55, 0.22);
      }

      .sdo-irfan-quickbar.is-visible {
        display: flex;
      }

      .sdo-irfan-quick-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        color: #fde68a;
        letter-spacing: 0.02em;
      }

      .sdo-irfan-btns {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .sdo-irfan-btn {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 7px 13px;
        border-radius: 12px;
        border: 1px solid rgba(212, 175, 55, 0.32);
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(20, 184, 166, 0.08) 100%);
        color: #fef3c7;
        font-family: inherit;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .sdo-irfan-btn:hover,
      .sdo-irfan-btn:focus-visible {
        outline: none;
        transform: translateY(-1px);
        border-color: rgba(251, 191, 36, 0.72);
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.24) 0%, rgba(20, 184, 166, 0.18) 100%);
        box-shadow: 0 8px 18px -8px rgba(212, 175, 55, 0.45);
      }

      .sdo-irfan-btn-hint {
        font-size: 0.67rem;
        font-weight: 600;
        color: #94a3b8;
        padding-left: 5px;
        border-left: 1px solid rgba(255, 255, 255, 0.16);
      }

      /* =====================================================================
         Mode Filtering Rules
         ===================================================================== */

      /* 1. Odak & Öz: Hero + 4 KPIs + Mode Bar + Active Route + 7 Regions */
      .dashboard-view[data-dash-mode="focus"] > [data-sdo-role="stories"],
      .dashboard-view[data-dash-mode="focus"] > [data-sdo-role="spotlight"],
      .dashboard-view[data-dash-mode="focus"] > [data-sdo-role="philosophy"],
      .dashboard-view[data-dash-mode="focus"] > [data-sdo-role="marquee"],
      .dashboard-view[data-dash-mode="focus"] > [data-sdo-role="launchers"],
      .dashboard-view[data-dash-mode="focus"] > [data-sdo-role="feature-hub"],
      .dashboard-view[data-dash-mode="focus"] > [data-sdo-role="rank"],
      .dashboard-view[data-dash-mode="focus"] > [data-sdo-role="badges"],
      .dashboard-view[data-dash-mode="focus"] > [data-sdo-role="nomad-guide"],
      .dashboard-view[data-dash-mode="focus"] > .anadolu-stories-bar,
      .dashboard-view[data-dash-mode="focus"] > .daily-spotlight-card,
      .dashboard-view[data-dash-mode="focus"] > .seyyah-philosophy-ribbon,
      .dashboard-view[data-dash-mode="focus"] > [data-dv3-block="marquee"],
      .dashboard-view[data-dash-mode="focus"] > [data-dv3-block="launchers"],
      .dashboard-view[data-dash-mode="focus"] > .rank-banner,
      .dashboard-view[data-dash-mode="focus"] > .detail-card {
        display: none !important;
      }

      /* 2. Sefer & Rota (Planner): Hero + 4 KPIs + Mode Bar + Active Expedition Card + Regional Progress */
      .dashboard-view[data-dash-mode="planner"] > [data-sdo-role="stories"],
      .dashboard-view[data-dash-mode="planner"] > [data-sdo-role="spotlight"],
      .dashboard-view[data-dash-mode="planner"] > [data-sdo-role="philosophy"],
      .dashboard-view[data-dash-mode="planner"] > [data-sdo-role="marquee"],
      .dashboard-view[data-dash-mode="planner"] > [data-sdo-role="launchers"],
      .dashboard-view[data-dash-mode="planner"] > [data-sdo-role="feature-hub"],
      .dashboard-view[data-dash-mode="planner"] > [data-sdo-role="rank"],
      .dashboard-view[data-dash-mode="planner"] > [data-sdo-role="badges"],
      .dashboard-view[data-dash-mode="planner"] > [data-sdo-role="nomad-guide"],
      .dashboard-view[data-dash-mode="planner"] > .anadolu-stories-bar,
      .dashboard-view[data-dash-mode="planner"] > .daily-spotlight-card,
      .dashboard-view[data-dash-mode="planner"] > .seyyah-philosophy-ribbon,
      .dashboard-view[data-dash-mode="planner"] > [data-dv3-block="marquee"],
      .dashboard-view[data-dash-mode="planner"] > [data-dv3-block="launchers"],
      .dashboard-view[data-dash-mode="planner"] > .rank-banner,
      .dashboard-view[data-dash-mode="planner"] > .detail-card {
        display: none !important;
      }

      .dashboard-view[data-dash-mode="planner"] > [data-dv3-block="expedition"] .dv3-expedition-card {
        border-color: rgba(16, 185, 129, 0.56) !important;
        box-shadow:
          0 20px 44px -16px rgba(0, 0, 0, 0.68),
          0 0 28px -8px rgba(16, 185, 129, 0.32),
          inset 0 1px 0 rgba(209, 250, 229, 0.16) !important;
      }

      /* 3. İrfan & Hikmet: Hero + 4 KPIs + Mode Bar + Quick Links + Spotlight + Philosophy Ribbon */
      .dashboard-view[data-dash-mode="irfan"] > [data-sdo-role="stories"],
      .dashboard-view[data-dash-mode="irfan"] > [data-sdo-role="marquee"],
      .dashboard-view[data-dash-mode="irfan"] > [data-sdo-role="expedition"],
      .dashboard-view[data-dash-mode="irfan"] > [data-sdo-role="launchers"],
      .dashboard-view[data-dash-mode="irfan"] > [data-sdo-role="feature-hub"],
      .dashboard-view[data-dash-mode="irfan"] > [data-sdo-role="rank"],
      .dashboard-view[data-dash-mode="irfan"] > [data-sdo-role="badges"],
      .dashboard-view[data-dash-mode="irfan"] > [data-sdo-role="regions"],
      .dashboard-view[data-dash-mode="irfan"] > [data-sdo-role="nomad-guide"],
      .dashboard-view[data-dash-mode="irfan"] > .anadolu-stories-bar,
      .dashboard-view[data-dash-mode="irfan"] > [data-dv3-block="marquee"],
      .dashboard-view[data-dash-mode="irfan"] > [data-dv3-block="expedition"],
      .dashboard-view[data-dash-mode="irfan"] > [data-dv3-block="launchers"],
      .dashboard-view[data-dash-mode="irfan"] > .rank-banner,
      .dashboard-view[data-dash-mode="irfan"] > .detail-card {
        display: none !important;
      }

      /* Highlighted Spotlight & Philosophy Ribbon in İrfan & Hikmet mode */
      .dashboard-view[data-dash-mode="irfan"] > .daily-spotlight-card,
      .dashboard-view[data-dash-mode="irfan"] > .seyyah-philosophy-ribbon {
        border-color: rgba(212, 175, 55, 0.52) !important;
        box-shadow:
          0 20px 44px -16px rgba(0, 0, 0, 0.72),
          0 0 28px -8px rgba(212, 175, 55, 0.28),
          0 0 22px -10px rgba(20, 184, 166, 0.22),
          inset 0 1px 0 rgba(254, 243, 199, 0.16) !important;
      }

      /* =====================================================================
         Light Theme (Alabaster / Parchment) Parity
         ===================================================================== */
      body.light-theme .${MODE_BAR_CLASS},
      [data-theme="light"] .${MODE_BAR_CLASS} {
        background:
          linear-gradient(145deg, rgba(255, 253, 248, 0.96) 0%, rgba(246, 242, 232, 0.94) 100%);
        border-color: rgba(120, 92, 46, 0.16);
        box-shadow:
          0 10px 26px -12px rgba(41, 32, 18, 0.14),
          inset 0 1px 0 rgba(255, 255, 255, 0.98);
      }

      body.light-theme .sdo-bar-eyebrow,
      [data-theme="light"] .sdo-bar-eyebrow {
        color: #92400e;
        background: rgba(217, 119, 6, 0.12);
        border-color: rgba(180, 83, 9, 0.28);
      }

      body.light-theme .sdo-natgeo-mark,
      [data-theme="light"] .sdo-natgeo-mark {
        border-color: #b45309;
        box-shadow: none;
      }

      body.light-theme .sdo-mode-caption,
      [data-theme="light"] .sdo-mode-caption {
        color: #475569;
      }

      body.light-theme .sdo-pills-track,
      [data-theme="light"] .sdo-pills-track {
        background: rgba(15, 23, 42, 0.055);
        border-color: rgba(15, 23, 42, 0.09);
      }

      body.light-theme .sdo-mode-pill,
      [data-theme="light"] .sdo-mode-pill {
        color: #334155;
      }

      body.light-theme .sdo-mode-pill:hover,
      body.light-theme .sdo-mode-pill:focus-visible,
      [data-theme="light"] .sdo-mode-pill:hover,
      [data-theme="light"] .sdo-mode-pill:focus-visible {
        color: #0f172a;
        background: rgba(255, 255, 255, 0.72);
      }

      body.light-theme .sdo-mode-pill.is-active,
      [data-theme="light"] .sdo-mode-pill.is-active {
        color: #ffffff;
        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        border-color: rgba(180, 83, 9, 0.45);
        box-shadow: 0 4px 12px -4px rgba(180, 83, 9, 0.42);
      }

      body.light-theme .sdo-mode-pill[data-sdo-mode="focus"].is-active,
      [data-theme="light"] .sdo-mode-pill[data-sdo-mode="focus"].is-active {
        color: #ffffff;
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        border-color: rgba(3, 105, 161, 0.45);
        box-shadow: 0 4px 12px -4px rgba(2, 132, 199, 0.4);
      }

      body.light-theme .sdo-mode-pill[data-sdo-mode="planner"].is-active,
      [data-theme="light"] .sdo-mode-pill[data-sdo-mode="planner"].is-active {
        color: #ffffff;
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        border-color: rgba(4, 120, 87, 0.48);
        box-shadow: 0 4px 12px -4px rgba(5, 150, 105, 0.42);
      }

      body.light-theme .sdo-surprise-btn,
      [data-theme="light"] .sdo-surprise-btn {
        color: #5b21b6;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(14, 165, 233, 0.12) 100%);
        border-color: rgba(124, 58, 237, 0.34);
      }

      body.light-theme .sdo-surprise-btn:hover,
      body.light-theme .sdo-surprise-btn:focus-visible,
      [data-theme="light"] .sdo-surprise-btn:hover,
      [data-theme="light"] .sdo-surprise-btn:focus-visible {
        color: #4c1d95;
        border-color: rgba(124, 58, 237, 0.6);
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(14, 165, 233, 0.18) 100%);
        box-shadow: 0 6px 14px -6px rgba(124, 58, 237, 0.26);
      }

      body.light-theme .sdo-planner-quickbar,
      [data-theme="light"] .sdo-planner-quickbar {
        border-top-color: rgba(5, 150, 105, 0.2);
      }

      body.light-theme .sdo-planner-quick-label,
      [data-theme="light"] .sdo-planner-quick-label {
        color: #047857;
      }

      body.light-theme .sdo-planner-btn,
      [data-theme="light"] .sdo-planner-btn {
        color: #064e3b;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(209, 250, 229, 0.62) 100%);
        border-color: rgba(5, 150, 105, 0.28);
      }

      body.light-theme .sdo-planner-btn:hover,
      body.light-theme .sdo-planner-btn:focus-visible,
      [data-theme="light"] .sdo-planner-btn:hover,
      [data-theme="light"] .sdo-planner-btn:focus-visible {
        color: #064e3b;
        border-color: rgba(5, 150, 105, 0.56);
        background: linear-gradient(135deg, rgba(209, 250, 229, 0.92) 0%, rgba(207, 250, 254, 0.62) 100%);
        box-shadow: 0 6px 14px -6px rgba(5, 150, 105, 0.24);
      }

      body.light-theme .dashboard-view[data-dash-mode="planner"] > [data-dv3-block="expedition"] .dv3-expedition-card,
      [data-theme="light"] .dashboard-view[data-dash-mode="planner"] > [data-dv3-block="expedition"] .dv3-expedition-card {
        border-color: rgba(5, 150, 105, 0.45) !important;
        box-shadow:
          0 16px 36px -14px rgba(15, 23, 42, 0.16),
          0 0 22px -6px rgba(5, 150, 105, 0.22) !important;
      }

      body.light-theme .sdo-mode-pill[data-sdo-mode="irfan"].is-active,
      [data-theme="light"] .sdo-mode-pill[data-sdo-mode="irfan"].is-active {
        color: #78350f;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(13, 148, 136, 0.16) 100%);
        border-color: rgba(180, 83, 9, 0.48);
        box-shadow: 0 4px 12px -4px rgba(180, 83, 9, 0.22);
      }

      body.light-theme .sdo-irfan-quickbar,
      [data-theme="light"] .sdo-irfan-quickbar {
        border-top-color: rgba(161, 98, 7, 0.18);
      }

      body.light-theme .sdo-irfan-quick-label,
      [data-theme="light"] .sdo-irfan-quick-label {
        color: #92400e;
      }

      body.light-theme .sdo-irfan-btn,
      [data-theme="light"] .sdo-irfan-btn {
        color: #1c1917;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(254, 243, 199, 0.55) 100%);
        border-color: rgba(161, 98, 7, 0.28);
      }

      body.light-theme .sdo-irfan-btn:hover,
      body.light-theme .sdo-irfan-btn:focus-visible,
      [data-theme="light"] .sdo-irfan-btn:hover,
      [data-theme="light"] .sdo-irfan-btn:focus-visible {
        color: #78350f;
        border-color: rgba(180, 83, 9, 0.56);
        background: linear-gradient(135deg, rgba(254, 243, 199, 0.9) 0%, rgba(204, 251, 241, 0.55) 100%);
        box-shadow: 0 6px 14px -6px rgba(161, 98, 7, 0.24);
      }

      body.light-theme .sdo-irfan-btn-hint,
      [data-theme="light"] .sdo-irfan-btn-hint {
        color: #6b635b;
        border-left-color: rgba(120, 92, 46, 0.22);
      }

      body.light-theme .dashboard-view[data-dash-mode="irfan"] > .daily-spotlight-card,
      body.light-theme .dashboard-view[data-dash-mode="irfan"] > .seyyah-philosophy-ribbon,
      [data-theme="light"] .dashboard-view[data-dash-mode="irfan"] > .daily-spotlight-card,
      [data-theme="light"] .dashboard-view[data-dash-mode="irfan"] > .seyyah-philosophy-ribbon {
        border-color: rgba(180, 83, 9, 0.45) !important;
        box-shadow:
          0 16px 36px -14px rgba(41, 32, 18, 0.16),
          0 0 22px -6px rgba(217, 119, 6, 0.2) !important;
      }

      /* Responsive & Print */
      @media (max-width: 720px) {
        .${MODE_BAR_CLASS} {
          padding: 12px;
        }
        .sdo-pills-track {
          width: 100%;
          justify-content: space-between;
        }
        .sdo-mode-pill {
          flex: 1 1 auto;
          justify-content: center;
          padding: 7px 10px;
          font-size: 0.74rem;
        }
        .sdo-irfan-btn-hint {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .sdo-mode-pill,
        .sdo-irfan-btn {
          transition: none;
        }
      }

      @media print {
        .${MODE_BAR_CLASS} {
          display: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // =========================================================================
  // Vitrin Modu Bar Creation & Event Binding
  // =========================================================================

  function createModeBar(initialMode) {
    const bar = document.createElement('section');
    bar.className = MODE_BAR_CLASS;
    bar.setAttribute('aria-label', 'Vitrin Görünüm Çubuğu');
    bar.setAttribute('data-sdo-role', 'mode-bar');

    const pillsHtml = VALID_MODES.map((modeKey) => {
      const meta = MODE_META[modeKey];
      const isActive = modeKey === initialMode;
      return `<button type="button" class="sdo-mode-pill${isActive ? ' is-active' : ''}" role="tab" aria-selected="${isActive ? 'true' : 'false'}" data-sdo-mode="${modeKey}">${meta.label}</button>`;
    }).join('');

    const irfanBtnsHtml = IRFAN_QUICK_BUTTONS.map((btn) => (
      `<button type="button" class="sdo-irfan-btn" data-sdo-view="${btn.view}"><span>${btn.label}</span><span class="sdo-irfan-btn-hint">${btn.hint}</span></button>`
    )).join('');

    const plannerBtnsHtml = PLANNER_QUICK_BUTTONS.map((btn) => (
      `<button type="button" class="sdo-planner-btn" data-sdo-view="${btn.view}"><span>${btn.label}</span><span class="sdo-irfan-btn-hint">${btn.hint}</span></button>`
    )).join('');

    const activeMeta = MODE_META[initialMode] || MODE_META.full;

    bar.innerHTML = `
      <div class="sdo-bar-top">
        <div class="sdo-bar-info">
          <span class="sdo-bar-eyebrow"><span class="sdo-natgeo-mark" aria-hidden="true"></span>Vitrin Modu</span>
          <span class="sdo-mode-caption" data-sdo-caption>${activeMeta.caption}</span>
        </div>
        <div class="sdo-bar-controls">
          <div class="sdo-pills-track" role="tablist" aria-label="Vitrin Modu Seçici">
            ${pillsHtml}
          </div>
          <button type="button"
                  class="sdo-surprise-btn"
                  data-sdo-surprise="1"
                  title="Seçkin etkileşimli stüdyolardan birini rastgele aç">
            🎲 Sürpriz Stüdyo
          </button>
        </div>
      </div>
      <div class="sdo-planner-quickbar${initialMode === 'planner' ? ' is-visible' : ''}" data-sdo-planner-bar>
        <span class="sdo-planner-quick-label">🧭 Sefer &amp; Rota Araçları:</span>
        <div class="sdo-irfan-btns">
          ${plannerBtnsHtml}
        </div>
      </div>
      <div class="sdo-irfan-quickbar${initialMode === 'irfan' ? ' is-visible' : ''}" data-sdo-irfan-bar>
        <span class="sdo-irfan-quick-label">✨ İrfan &amp; Hikmet Kapıları:</span>
        <div class="sdo-irfan-btns">
          ${irfanBtnsHtml}
        </div>
      </div>
    `;

    bar.addEventListener('click', (e) => {
      const surpriseBtn = e.target && e.target.closest ? e.target.closest('[data-sdo-surprise]') : null;
      if (surpriseBtn) {
        launchSurpriseStudio();
        return;
      }

      const modeBtn = e.target && e.target.closest ? e.target.closest('[data-sdo-mode]') : null;
      if (modeBtn) {
        const nextMode = modeBtn.getAttribute('data-sdo-mode');
        if (VALID_MODES.indexOf(nextMode) !== -1) {
          saveMode(nextMode);
          const dashboardEl = bar.closest('.dashboard-view');
          if (dashboardEl) {
            applyModeState(dashboardEl, bar, nextMode);
          }
        }
        return;
      }

      const viewBtn = e.target && e.target.closest ? e.target.closest('[data-sdo-view]') : null;
      if (viewBtn) {
        const targetView = viewBtn.getAttribute('data-sdo-view');
        if (targetView) {
          navigateToView(targetView);
        }
      }
    });

    return bar;
  }

  function launchSurpriseStudio() {
    if (!SURPRISE_STUDIOS.length) return;
    const pool = SURPRISE_STUDIOS.filter((s) => s.view !== lastSurpriseView);
    const candidates = pool.length ? pool : SURPRISE_STUDIOS;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (!pick) return;

    lastSurpriseView = pick.view;
    if (activeCtx && typeof activeCtx.showToast === 'function') {
      activeCtx.showToast(`🎲 Sürpriz Stüdyo: ${pick.label}`);
    }
    navigateToView(pick.view);
  }

  function navigateToView(viewName) {
    if (activeCtx && typeof activeCtx.openView === 'function') {
      activeCtx.openView(viewName);
      if (viewName === 'skyMap' && activeCtx.state && activeCtx.state.currentView !== 'skyMap') {
        const skyMod = window.SEYYAH_MODULES && window.SEYYAH_MODULES.skyMap;
        const viewport = document.getElementById('viewport-content');
        if (skyMod && typeof skyMod.render === 'function' && viewport) {
          activeCtx.state.currentView = 'skyMap';
          skyMod.render(viewport, activeCtx);
        }
      }
      return;
    }

    const navFallback = document.querySelector(`[data-view="${viewName}"]`);
    if (navFallback && typeof navFallback.click === 'function') {
      navFallback.click();
    }
  }

  function applyModeState(dashboardEl, modeBar, mode) {
    const resolved = VALID_MODES.indexOf(mode) !== -1 ? mode : 'full';
    if (dashboardEl && dashboardEl.getAttribute('data-dash-mode') !== resolved) {
      dashboardEl.setAttribute('data-dash-mode', resolved);
    }

    if (!modeBar) return;

    const captionEl = modeBar.querySelector('[data-sdo-caption]');
    const meta = MODE_META[resolved] || MODE_META.full;
    if (captionEl && captionEl.textContent !== meta.caption) {
      captionEl.textContent = meta.caption;
    }

    modeBar.querySelectorAll('[data-sdo-mode]').forEach((btn) => {
      const btnMode = btn.getAttribute('data-sdo-mode');
      const active = btnMode === resolved;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    const plannerBar = modeBar.querySelector('[data-sdo-planner-bar]');
    if (plannerBar) {
      plannerBar.classList.toggle('is-visible', resolved === 'planner');
    }

    const irfanBar = modeBar.querySelector('[data-sdo-irfan-bar]');
    if (irfanBar) {
      irfanBar.classList.toggle('is-visible', resolved === 'irfan');
    }
  }

  // =========================================================================
  // Editorial Hierarchy & DOM Ordering
  // =========================================================================

  function setRoleIfChanged(el, role) {
    if (!el || !role) return;
    if (el.getAttribute('data-sdo-role') !== role) {
      el.setAttribute('data-sdo-role', role);
    }
  }

  function tagDashboardSections(dashboardEl) {
    const children = Array.from(dashboardEl.children);
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      if (child.classList.contains('hero-banner-visual') || child.classList.contains('hero-banner')) {
        setRoleIfChanged(child, 'hero');
      } else if (child.classList.contains('stats-grid')) {
        setRoleIfChanged(child, 'kpis');
      } else if (child.classList.contains(MODE_BAR_CLASS)) {
        setRoleIfChanged(child, 'mode-bar');
      } else if (child.classList.contains('anadolu-stories-bar')) {
        setRoleIfChanged(child, 'stories');
      } else if (child.classList.contains('daily-spotlight-card')) {
        setRoleIfChanged(child, 'spotlight');
      } else if (child.classList.contains('seyyah-philosophy-ribbon')) {
        setRoleIfChanged(child, 'philosophy');
      } else if (child.getAttribute('data-dv3-block') === 'marquee') {
        setRoleIfChanged(child, 'marquee');
      } else if (child.getAttribute('data-dv3-block') === 'expedition') {
        setRoleIfChanged(child, 'expedition');
      } else if (child.getAttribute('data-dv3-block') === 'launchers') {
        setRoleIfChanged(child, 'launchers');
      } else if (child.classList.contains('rank-banner')) {
        setRoleIfChanged(child, 'rank');
      } else if (child.classList.contains('detail-card')) {
        setRoleIfChanged(child, 'nomad-guide');
      } else if (child.querySelector('.regions-grid')) {
        setRoleIfChanged(child, 'regions');
      } else if (child.querySelector('.feature-hub-grid')) {
        setRoleIfChanged(child, 'feature-hub');
      } else if (child.querySelector('.badges-grid')) {
        setRoleIfChanged(child, 'badges');
      }
    }
  }

  function insertAfterIfNeeded(parent, node, anchor) {
    if (!parent || !node) return;
    if (!anchor || anchor.parentNode !== parent) {
      if (parent.firstElementChild !== node) {
        parent.prepend(node);
      }
      return;
    }
    if (anchor.nextElementSibling !== node) {
      anchor.insertAdjacentElement('afterend', node);
    }
  }

  function orchestrateDashboard(viewport, ctx) {
    const safeCtx = ctx || activeCtx;
    if (!viewport || !safeCtx || !safeCtx.state) return;
    if (safeCtx.state.currentView !== 'dashboard') return;

    const dashboardEl = viewport.querySelector('.dashboard-view');
    if (!dashboardEl) return;

    if (isOrchestrating) return;
    isOrchestrating = true;

    if (viewportObserver) {
      viewportObserver.disconnect();
    }

    try {
      const hero = dashboardEl.querySelector('.hero-banner-visual') || dashboardEl.querySelector('.hero-banner');
      const statsGrid = dashboardEl.querySelector('.stats-grid');

      // 1. Keep Hero Banner & 4 KPI cards (.stats-grid) pinned at the VERY TOP of .dashboard-view
      if (hero && hero.parentNode === dashboardEl && dashboardEl.firstElementChild !== hero) {
        dashboardEl.prepend(hero);
      }

      if (statsGrid) {
        if (hero && hero.parentNode === dashboardEl) {
          if (hero.nextElementSibling !== statsGrid) {
            hero.insertAdjacentElement('afterend', statsGrid);
          }
        } else if (dashboardEl.firstElementChild !== statsGrid) {
          dashboardEl.prepend(statsGrid);
        }
      }

      // 2. Mount or reposition the Vitrin Modu Switcher right after .stats-grid
      const currentMode = loadMode();
      let modeBar = dashboardEl.querySelector(`.${MODE_BAR_CLASS}`);
      if (!modeBar) {
        modeBar = createModeBar(currentMode);
      }

      const topAnchor = statsGrid || hero || null;
      insertAfterIfNeeded(dashboardEl, modeBar, topAnchor);

      // 3. Move Wave 4-7 widgets right AFTER .stats-grid / modeBar (never above Hero!)
      const storiesBar = viewport.querySelector('.anadolu-stories-bar');
      const dailyCard = viewport.querySelector('.daily-spotlight-card');
      const philosophyRibbon = viewport.querySelector('.seyyah-philosophy-ribbon');

      let widgetAnchor = modeBar;
      if (storiesBar) {
        insertAfterIfNeeded(dashboardEl, storiesBar, widgetAnchor);
        widgetAnchor = storiesBar;
      }
      if (dailyCard) {
        insertAfterIfNeeded(dashboardEl, dailyCard, widgetAnchor);
        widgetAnchor = dailyCard;
      }
      if (philosophyRibbon) {
        insertAfterIfNeeded(dashboardEl, philosophyRibbon, widgetAnchor);
      }

      // 4. Tag section roles and apply persisted Vitrin Modu
      tagDashboardSections(dashboardEl);
      applyModeState(dashboardEl, modeBar, currentMode);
    } finally {
      isOrchestrating = false;
      if (viewportObserver && viewport) {
        viewportObserver.observe(viewport, { childList: true, subtree: true });
      }
    }
  }

  // =========================================================================
  // Lifecycle: MutationObserver + Immediate Init
  // =========================================================================

  function initViewportObserver(ctx) {
    const viewport = document.getElementById('viewport-content');
    if (!viewport) return;

    if (viewportObserver) {
      viewportObserver.disconnect();
    }

    if (typeof MutationObserver === 'function') {
      viewportObserver = new MutationObserver(() => {
        if (isOrchestrating) return;
        orchestrateDashboard(viewport, activeCtx || ctx);
      });
      viewportObserver.observe(viewport, { childList: true, subtree: true });
    }

    orchestrateDashboard(viewport, ctx);
  }

  function init(ctx) {
    activeCtx = ctx || {};
    injectStyles();
    initViewportObserver(activeCtx);
  }

  window.SEYYAH_MODULES.dashboardOrchestrator = {
    init
  };
})();
