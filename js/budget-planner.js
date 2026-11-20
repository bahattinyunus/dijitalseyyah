/**
 * Anadolu Seyahatnamesi — 💰 Sefer Bütçe & Tasarruf Simülatörü
 * Zero-dependency interactive expedition budget planner with pure SVG Donut Chart
 * Registers on window.SEYYAH_MODULES.budget = { render(container, ctx) }
 */
(function () {
  'use strict';

  const STYLE_ID = 'seyyah-budget-planner-styles';
  const STANDARD_HOTEL_RATE = 2200;
  const CITY_TRANSIT_DAILY = 60;
  const NORMAL_MUSEUM_PER_CITY = 250;
  const MUZEKART_ANNUAL = 60;
  const LIBRARY_HOURS_PER_DAY = 4;

  const ACCOMM_OPTIONS = [
    {
      id: 'kyk',
      icon: '⛺',
      label: 'GSB Seyahatsever KYK',
      priceLabel: '0 ₺/gece',
      rate: 0,
      badge: 'ÜCRETSİZ'
    },
    {
      id: 'pension',
      icon: '🛏️',
      label: 'Öğretmenevi / Pansiyon',
      priceLabel: '900 ₺/gece',
      rate: 900,
      badge: 'EKONOMİK'
    },
    {
      id: 'hotel',
      icon: '🏨',
      label: 'Butik Otel',
      priceLabel: '2.200 ₺/gece',
      rate: 2200,
      badge: 'KONFOR'
    }
  ];

  const FOOD_OPTIONS = [
    {
      id: 'esnaf',
      icon: '🍲',
      label: 'Esnaf Lokantası',
      priceLabel: '450 ₺/gün',
      rate: 450
    },
    {
      id: 'balanced',
      icon: '🍽️',
      label: 'Dengeli',
      priceLabel: '750 ₺/gün',
      rate: 750
    },
    {
      id: 'gourmet',
      icon: '🌟',
      label: 'Gurme',
      priceLabel: '1.300 ₺/gün',
      rate: 1300
    }
  ];

  const TRANSPORT_OPTIONS = [
    {
      id: 'bus',
      icon: '🚌',
      label: 'Otobüs',
      priceLabel: '450 ₺/geçiş',
      rate: 450
    },
    {
      id: 'train',
      icon: '🚆',
      label: 'YHT / Tren',
      priceLabel: '380 ₺/geçiş',
      rate: 380
    },
    {
      id: 'car',
      icon: '🚗',
      label: 'Araç Yakıt',
      priceLabel: '950 ₺/geçiş',
      rate: 950
    }
  ];

  const PRESETS = [
    {
      id: 'ankara-edirne',
      label: '🎯 Aktif Ankara→Edirne Seferi (9 İl)',
      desc: '5 Gün Kuralı · GSB KYK · Esnaf Lokantası · Otobüs',
      state: {
        cities: 9,
        daysPerCity: 5,
        accommId: 'kyk',
        foodId: 'esnaf',
        transportId: 'bus',
        muzeKart: true
      }
    },
    {
      id: 'guneydogu',
      label: '🏜️ Güneydoğu Mezopotamya (9 İl)',
      desc: '5 Gün Kuralı · GSB KYK · Dengeli Lezzet · Otobüs',
      state: {
        cities: 9,
        daysPerCity: 5,
        accommId: 'kyk',
        foodId: 'balanced',
        transportId: 'bus',
        muzeKart: true
      }
    },
    {
      id: 'weekend',
      label: '🇹🇷 Hafta Sonu Kaçamağı (2 İl)',
      desc: '2 Gün/İl · Pansiyon · Dengeli · YHT/Tren',
      state: {
        cities: 2,
        daysPerCity: 2,
        accommId: 'pension',
        foodId: 'balanced',
        transportId: 'train',
        muzeKart: true
      }
    }
  ];

  const CATEGORY_META = [
    { key: 'accomm', label: 'Konaklama', color: '#a855f7', icon: '⛺' },
    { key: 'food', label: 'Yemek & Çay', color: '#f59e0b', icon: '🍲' },
    { key: 'transport', label: 'Şehirlerarası Ulaşım', color: '#00f2fe', icon: '🚌' },
    { key: 'museum', label: 'Müze & Şehir İçi', color: '#10b981', icon: '🎫' }
  ];

  function defaultEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatTL(amount) {
    const val = Math.round(Number(amount) || 0);
    return val.toLocaleString('tr-TR') + ' ₺';
  }

  function formatNum(amount) {
    const val = Math.round(Number(amount) || 0);
    return val.toLocaleString('tr-TR');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .bp-wrap {
        max-width: 1240px;
        margin: 0 auto;
        padding: 20px 18px 40px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        animation: bpFadeIn 0.25s ease-out;
      }

      @keyframes bpFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .bp-hero {
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-lg, 20px);
        padding: 22px 24px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.45));
      }

      .bp-hero-title h2 {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 4px;
      }

      .bp-hero-title p {
        font-size: 0.9rem;
        color: var(--text-secondary, #94a3b8);
        max-width: 640px;
      }

      .bp-hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .bp-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 9px 14px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(30, 41, 59, 0.65);
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-heading, sans-serif);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .bp-action-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.14);
        transform: translateY(-1px);
      }

      .bp-presets {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .bp-preset-btn {
        flex: 1 1 240px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 3px;
        padding: 12px 16px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary, #f8fafc);
        text-align: left;
        cursor: pointer;
        transition: all 0.22s ease;
      }

      .bp-preset-btn:hover {
        border-color: rgba(0, 242, 254, 0.45);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
      }

      .bp-preset-btn.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.16), rgba(16, 185, 129, 0.14));
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 20px rgba(0, 242, 254, 0.18);
      }

      .bp-preset-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.9rem;
        font-weight: 700;
      }

      .bp-preset-desc {
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      .bp-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
        gap: 20px;
        align-items: start;
      }

      .bp-card {
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-lg, 20px);
        padding: 20px 22px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .bp-card-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.02rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .bp-slider-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 14px 16px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .bp-slider-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .bp-slider-label {
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-primary, #f8fafc);
      }

      .bp-slider-val {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        padding: 3px 10px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid rgba(0, 242, 254, 0.3);
      }

      .bp-range {
        width: 100%;
        height: 6px;
        border-radius: 999px;
        accent-color: var(--accent-cyan, #00f2fe);
        cursor: pointer;
      }

      .bp-range-ticks {
        display: flex;
        justify-content: space-between;
        font-size: 0.72rem;
        color: var(--text-muted, #64748b);
      }

      .bp-section-label {
        font-size: 0.82rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary, #94a3b8);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .bp-option-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 9px;
      }

      .bp-opt-btn {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        padding: 11px 12px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(15, 23, 42, 0.52);
        color: var(--text-primary, #f8fafc);
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }

      .bp-opt-btn:hover {
        border-color: rgba(0, 242, 254, 0.4);
        background: rgba(30, 41, 59, 0.75);
      }

      .bp-opt-btn.active {
        border-color: var(--accent-cyan, #00f2fe);
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.16), rgba(79, 172, 254, 0.12));
        box-shadow: 0 0 16px rgba(0, 242, 254, 0.18);
      }

      .bp-opt-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 6px;
      }

      .bp-opt-icon {
        font-size: 1.2rem;
        line-height: 1;
      }

      .bp-opt-badge {
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        padding: 2px 6px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.18);
        color: var(--accent-emerald, #10b981);
        border: 1px solid rgba(16, 185, 129, 0.35);
      }

      .bp-opt-name {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.83rem;
        font-weight: 700;
        line-height: 1.25;
      }

      .bp-opt-price {
        font-size: 0.75rem;
        color: var(--text-secondary, #94a3b8);
        font-weight: 600;
      }

      .bp-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 13px 16px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        cursor: pointer;
        transition: border-color 0.2s ease;
      }

      .bp-toggle-row:hover {
        border-color: rgba(16, 185, 129, 0.45);
      }

      .bp-toggle-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .bp-toggle-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      .bp-toggle-sub {
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      .bp-switch {
        position: relative;
        width: 48px;
        height: 26px;
        flex-shrink: 0;
      }

      .bp-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .bp-switch-track {
        position: absolute;
        inset: 0;
        border-radius: 999px;
        background: rgba(100, 116, 139, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.14);
        transition: all 0.22s ease;
      }

      .bp-switch-track::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #ffffff;
        transition: transform 0.22s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
      }

      .bp-switch input:checked + .bp-switch-track {
        background: linear-gradient(135deg, #10b981, #00f2fe);
        border-color: rgba(16, 185, 129, 0.6);
      }

      .bp-switch input:checked + .bp-switch-track::after {
        transform: translateX(22px);
      }

      /* KPI Strip */
      .bp-kpi-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .bp-kpi {
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-md, 12px);
        padding: 13px 15px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .bp-kpi-primary {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.14), rgba(79, 172, 254, 0.12));
        border-color: rgba(0, 242, 254, 0.35);
      }

      .bp-kpi-label {
        font-size: 0.74rem;
        color: var(--text-secondary, #94a3b8);
        font-weight: 600;
      }

      .bp-kpi-val {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.32rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        letter-spacing: -0.01em;
      }

      .bp-kpi-sub {
        font-size: 0.72rem;
        color: var(--text-muted, #64748b);
      }

      /* Donut Chart Layout */
      .bp-donut-layout {
        display: grid;
        grid-template-columns: 200px minmax(0, 1fr);
        gap: 18px;
        align-items: center;
      }

      .bp-donut-box {
        position: relative;
        width: 200px;
        height: 200px;
        margin: 0 auto;
      }

      .bp-donut-svg {
        width: 100%;
        height: 100%;
        overflow: visible;
      }

      .bp-donut-seg {
        transition: stroke-width 0.2s ease, opacity 0.2s ease;
        cursor: pointer;
      }

      .bp-donut-seg:hover,
      .bp-donut-seg.is-active {
        stroke-width: 28;
      }

      .bp-donut-center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        pointer-events: none;
        padding: 20px;
      }

      .bp-donut-center-label {
        font-size: 0.7rem;
        color: var(--text-secondary, #94a3b8);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .bp-donut-center-val {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        margin-top: 2px;
      }

      .bp-donut-center-sub {
        font-size: 0.72rem;
        color: var(--accent-cyan, #00f2fe);
        font-weight: 600;
      }

      .bp-legend {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .bp-legend-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 11px;
        border-radius: var(--radius-sm, 8px);
        background: rgba(15, 23, 42, 0.48);
        border: 1px solid transparent;
        transition: all 0.18s ease;
        cursor: pointer;
      }

      .bp-legend-item:hover,
      .bp-legend-item.is-active {
        border-color: rgba(255, 255, 255, 0.18);
        background: rgba(30, 41, 59, 0.8);
      }

      .bp-legend-left {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
      }

      .bp-legend-dot {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .bp-legend-name {
        font-size: 0.83rem;
        font-weight: 600;
        color: var(--text-primary, #f8fafc);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .bp-legend-formula {
        font-size: 0.7rem;
        color: var(--text-muted, #64748b);
      }

      .bp-legend-right {
        text-align: right;
        flex-shrink: 0;
      }

      .bp-legend-amount {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      .bp-legend-pct {
        font-size: 0.72rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* GSB Savings Card */
      .bp-savings-card {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 78, 59, 0.42));
        border: 1px solid rgba(16, 185, 129, 0.48);
        border-radius: var(--radius-lg, 20px);
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-shadow: 0 12px 30px rgba(16, 185, 129, 0.14);
      }

      .bp-savings-card.bp-savings-muted {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(30, 41, 59, 0.6));
        border-color: rgba(245, 158, 11, 0.4);
        box-shadow: none;
      }

      .bp-savings-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .bp-savings-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.98rem;
        font-weight: 800;
        color: #6ee7b7;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .bp-savings-muted .bp-savings-title {
        color: #fcd34d;
      }

      .bp-savings-pill {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.78rem;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.22);
        color: #a7f3d0;
        border: 1px solid rgba(16, 185, 129, 0.45);
      }

      .bp-savings-amount {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.9rem;
        font-weight: 900;
        color: #ffffff;
        line-height: 1.1;
      }

      .bp-savings-desc {
        font-size: 0.83rem;
        color: #d1fae5;
        line-height: 1.45;
      }

      .bp-savings-muted .bp-savings-desc {
        color: var(--text-secondary, #cbd5e1);
      }

      .bp-compare-bars {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .bp-bar-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .bp-bar-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.74rem;
        color: rgba(248, 250, 252, 0.88);
        font-weight: 600;
      }

      .bp-bar-track {
        height: 8px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.55);
        overflow: hidden;
      }

      .bp-bar-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .bp-bar-fill-mine {
        background: linear-gradient(90deg, #10b981, #00f2fe);
      }

      .bp-bar-fill-hotel {
        background: linear-gradient(90deg, #f59e0b, #ef4444);
      }

      .bp-kyk-cta {
        align-self: flex-start;
        padding: 8px 14px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid rgba(16, 185, 129, 0.55);
        background: rgba(16, 185, 129, 0.2);
        color: #a7f3d0;
        font-family: var(--font-heading, sans-serif);
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .bp-kyk-cta:hover {
        background: rgba(16, 185, 129, 0.35);
        transform: translateY(-1px);
      }

      .bp-footnote {
        font-size: 0.76rem;
        color: var(--text-muted, #64748b);
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 8px;
        padding-top: 4px;
      }

      /* Light Theme Support */
      body.light-theme .bp-hero {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(241, 245, 249, 0.94));
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
      }

      body.light-theme .bp-card {
        background: rgba(255, 255, 255, 0.94);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .bp-preset-btn,
      body.light-theme .bp-slider-group,
      body.light-theme .bp-opt-btn,
      body.light-theme .bp-toggle-row,
      body.light-theme .bp-kpi,
      body.light-theme .bp-legend-item,
      body.light-theme .bp-action-btn {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      body.light-theme .bp-preset-btn.active,
      body.light-theme .bp-opt-btn.active,
      body.light-theme .bp-kpi-primary {
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(16, 185, 129, 0.1));
        border-color: #0284c7;
      }

      body.light-theme .bp-slider-val,
      body.light-theme .bp-donut-center-sub {
        color: #0284c7;
      }

      body.light-theme .bp-savings-card {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(236, 253, 245, 0.95));
        border-color: rgba(16, 185, 129, 0.45);
      }

      body.light-theme .bp-savings-title {
        color: #047857;
      }

      body.light-theme .bp-savings-amount {
        color: #064e3b;
      }

      body.light-theme .bp-savings-desc,
      body.light-theme .bp-bar-meta {
        color: #065f46;
      }

      body.light-theme .bp-savings-pill {
        background: rgba(16, 185, 129, 0.18);
        color: #047857;
      }

      body.light-theme .bp-savings-card.bp-savings-muted {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(255, 251, 235, 0.95));
      }

      body.light-theme .bp-savings-muted .bp-savings-title {
        color: #b45309;
      }

      body.light-theme .bp-savings-muted .bp-savings-amount,
      body.light-theme .bp-savings-muted .bp-savings-desc {
        color: #78350f;
      }

      body.light-theme .bp-kyk-cta {
        color: #047857;
        background: rgba(16, 185, 129, 0.14);
      }

      body.light-theme .bp-bar-track {
        background: rgba(15, 23, 42, 0.12);
      }

      @media (max-width: 960px) {
        .bp-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .bp-option-grid {
          grid-template-columns: 1fr;
        }
        .bp-donut-layout {
          grid-template-columns: 1fr;
        }
        .bp-kpi-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function calculateBudget(state) {
    const cities = Math.max(1, Math.min(20, Number(state.cities) || 9));
    const daysPerCity = Math.max(1, Math.min(7, Number(state.daysPerCity) || 5));
    const totalDays = cities * daysPerCity;
    const totalNights = totalDays;
    const libraryHours = cities * daysPerCity * LIBRARY_HOURS_PER_DAY;
    const transitions = cities;

    const accommOpt = ACCOMM_OPTIONS.find((o) => o.id === state.accommId) || ACCOMM_OPTIONS[0];
    const foodOpt = FOOD_OPTIONS.find((o) => o.id === state.foodId) || FOOD_OPTIONS[0];
    const transportOpt = TRANSPORT_OPTIONS.find((o) => o.id === state.transportId) || TRANSPORT_OPTIONS[0];

    const accommCost = accommOpt.rate * totalNights;
    const foodCost = foodOpt.rate * totalDays;
    const transportCost = transportOpt.rate * transitions;
    const museumEntryCost = state.muzeKart ? MUZEKART_ANNUAL : NORMAL_MUSEUM_PER_CITY * cities;
    const cityTransitCost = CITY_TRANSIT_DAILY * totalDays;
    const museumCost = museumEntryCost + cityTransitCost;

    const totalCost = accommCost + foodCost + transportCost + museumCost;
    const costPerDay = totalDays > 0 ? totalCost / totalDays : 0;
    const costPerCity = cities > 0 ? totalCost / cities : 0;

    // Standard hotel tourism baseline (same days, food, transport, normal museum entry, 2.200 ₺/gece hotel)
    const hotelAccommCost = STANDARD_HOTEL_RATE * totalNights;
    const hotelBaselineTotal = hotelAccommCost + foodCost + transportCost + (NORMAL_MUSEUM_PER_CITY * cities) + cityTransitCost;
    const accommSaved = Math.max(0, hotelAccommCost - accommCost);
    const muzeSaved = state.muzeKart ? Math.max(0, NORMAL_MUSEUM_PER_CITY * cities - MUZEKART_ANNUAL) : 0;
    const totalSaved = Math.max(0, hotelBaselineTotal - totalCost);
    const savedPct = hotelBaselineTotal > 0 ? Math.round((totalSaved / hotelBaselineTotal) * 100) : 0;

    return {
      cities,
      daysPerCity,
      totalDays,
      totalNights,
      libraryHours,
      transitions,
      accommOpt,
      foodOpt,
      transportOpt,
      costs: {
        accomm: accommCost,
        food: foodCost,
        transport: transportCost,
        museum: museumCost
      },
      formulas: {
        accomm: `${totalNights} gece × ${formatTL(accommOpt.rate)}`,
        food: `${totalDays} gün × ${formatTL(foodOpt.rate)}`,
        transport: `${transitions} geçiş × ${formatTL(transportOpt.rate)}`,
        museum: state.muzeKart
          ? `MüzeKart (${formatTL(MUZEKART_ANNUAL)}) + ${totalDays}g şehir içi`
          : `${cities} il müze + ${totalDays}g şehir içi`
      },
      totalCost,
      costPerDay,
      costPerCity,
      hotelBaselineTotal,
      accommSaved,
      muzeSaved,
      totalSaved,
      savedPct
    };
  }

  function buildDonutSvg(calc, activeKey) {
    const size = 200;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 72;
    const circumference = 2 * Math.PI * radius;
    const total = calc.totalCost;

    let offset = 0;
    const segments = [];

    CATEGORY_META.forEach((cat) => {
      const value = calc.costs[cat.key] || 0;
      if (value <= 0 || total <= 0) return;
      const fraction = value / total;
      const segLen = fraction * circumference;
      const gap = segLen > 6 ? 3 : 0;
      const dashArray = `${Math.max(1, segLen - gap).toFixed(2)} ${(circumference - Math.max(1, segLen - gap)).toFixed(2)}`;
      const dashOffset = -offset;
      offset += segLen;

      const isActive = activeKey === cat.key;
      segments.push(`
        <circle
          class="bp-donut-seg ${isActive ? 'is-active' : ''}"
          data-bp-seg="${cat.key}"
          cx="${cx}"
          cy="${cy}"
          r="${radius}"
          fill="none"
          stroke="${cat.color}"
          stroke-width="${isActive ? 28 : 22}"
          stroke-dasharray="${dashArray}"
          stroke-dashoffset="${dashOffset.toFixed(2)}"
          stroke-linecap="butt"
          transform="rotate(-90 ${cx} ${cy})"
        />
      `);
    });

    return `
      <svg class="bp-donut-svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Sefer bütçe dağılımı grafiği">
        <circle
          cx="${cx}"
          cy="${cy}"
          r="${radius}"
          fill="none"
          stroke="rgba(148, 163, 184, 0.16)"
          stroke-width="22"
        />
        ${segments.join('')}
      </svg>
    `;
  }

  function getActivePresetId(state) {
    const match = PRESETS.find((p) => {
      const s = p.state;
      return (
        s.cities === state.cities &&
        s.daysPerCity === state.daysPerCity &&
        s.accommId === state.accommId &&
        s.foodId === state.foodId &&
        s.transportId === state.transportId &&
        s.muzeKart === state.muzeKart
      );
    });
    return match ? match.id : null;
  }

  function buildSummaryText(calc, state) {
    return [
      `💰 Anadolu Seyahatnamesi — Sefer Bütçe Simülasyonu`,
      `• Rota Ölçeği: ${calc.cities} İl × ${calc.daysPerCity} Gün = ${calc.totalDays} Gün`,
      `• Kütüphane Mesaisi: ${formatNum(calc.libraryHours)} saat (${LIBRARY_HOURS_PER_DAY} saat/gün)`,
      `• Konaklama: ${calc.accommOpt.label} — ${formatTL(calc.costs.accomm)}`,
      `• Yemek & Çay: ${calc.foodOpt.label} — ${formatTL(calc.costs.food)}`,
      `• Ulaşım: ${calc.transportOpt.label} — ${formatTL(calc.costs.transport)}`,
      `• Müze & Şehir İçi (${state.muzeKart ? 'MüzeKart' : 'Normal Giriş'}): ${formatTL(calc.costs.museum)}`,
      `• TOPLAM BÜTÇE: ${formatTL(calc.totalCost)} (Günlük: ${formatTL(calc.costPerDay)})`,
      `• 💚 Standart Otel Turizmine Göre Tasarruf: ${formatTL(calc.totalSaved)} (%${calc.savedPct})`
    ].join('\n');
  }

  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const safeCtx = ctx || {};
    const escapeHtml = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : defaultEscapeHtml;
    const showToast = typeof safeCtx.showToast === 'function' ? safeCtx.showToast : function () {};
    const stats = (safeCtx.data && safeCtx.data.stats) || null;

    const state = {
      cities: 9,
      daysPerCity: 5,
      accommId: 'kyk',
      foodId: 'esnaf',
      transportId: 'bus',
      muzeKart: true,
      hoveredCat: null
    };

    const statsNote = stats
      ? `Mevcut kayıtlı sefer: ${formatNum(stats.visited_cities || 0)}/${formatNum(stats.total_cities || 81)} il · ${formatNum(stats.library_hours || 0)} saat kütüphane mesaisi`
      : '5 Gün Kuralı: Her ilde günde 4 saat kütüphane çalışması varsayılır.';

    // Render static shell once so range sliders keep smooth drag capture
    container.innerHTML = `
      <div class="bp-wrap">
        <div class="bp-hero">
          <div class="bp-hero-title">
            <h2>💰 Sefer Bütçe & Tasarruf Simülatörü</h2>
            <p>Anadolu seferini il sayısı, 5 Gün Kuralı, GSB Seyahatsever KYK ve ulaşım tercihlerine göre canlı hesapla; standart otel turizmiyle kıyasla.</p>
          </div>
          <div class="bp-hero-actions">
            <button type="button" class="bp-action-btn" data-bp-action="copy">📋 Özeti Kopyala</button>
            <button type="button" class="bp-action-btn" data-bp-action="reset">🔄 Varsayılana Dön</button>
          </div>
        </div>

        <div class="bp-presets" role="group" aria-label="Hızlı Sefer Şablonları">
          ${PRESETS.map((p) => `
            <button type="button" class="bp-preset-btn" data-bp-preset="${escapeHtml(p.id)}">
              <span class="bp-preset-title">${escapeHtml(p.label)}</span>
              <span class="bp-preset-desc">${escapeHtml(p.desc)}</span>
            </button>
          `).join('')}
        </div>

        <div class="bp-grid">
          <!-- LEFT: CONTROLS (persistent DOM for smooth slider dragging) -->
          <section class="bp-card" aria-label="Sefer Parametreleri">
            <div class="bp-card-title">
              <span>🎛️ Sefer Parametreleri</span>
              <span data-bp-bind="scaleMeta" style="font-size:0.78rem;color:var(--text-secondary);font-weight:600;"></span>
            </div>

            <div class="bp-slider-group">
              <div class="bp-slider-head">
                <label class="bp-slider-label" for="bp-cities-slider">🗺️ İl Sayısı</label>
                <span class="bp-slider-val" data-bp-bind="citiesVal"></span>
              </div>
              <input
                id="bp-cities-slider"
                class="bp-range"
                type="range"
                min="1"
                max="20"
                step="1"
                value="${state.cities}"
                data-bp-slider="cities"
              />
              <div class="bp-range-ticks">
                <span>1 İl</span>
                <span>9 İl (Aktif Sefer)</span>
                <span>20 İl</span>
              </div>
            </div>

            <div class="bp-slider-group">
              <div class="bp-slider-head">
                <label class="bp-slider-label" for="bp-days-slider">📅 Şehir Başına Gün (5 Gün Kuralı)</label>
                <span class="bp-slider-val" data-bp-bind="daysVal"></span>
              </div>
              <input
                id="bp-days-slider"
                class="bp-range"
                type="range"
                min="1"
                max="7"
                step="1"
                value="${state.daysPerCity}"
                data-bp-slider="daysPerCity"
              />
              <div class="bp-range-ticks">
                <span>1 Gün</span>
                <span>5 Gün Kuralı</span>
                <span>7 Gün</span>
              </div>
            </div>

            <div>
              <div class="bp-section-label">
                <span>🛏️ Konaklama Modeli</span>
                <span data-bp-bind="nightsMeta"></span>
              </div>
              <div class="bp-option-grid">
                ${ACCOMM_OPTIONS.map((opt) => `
                  <button
                    type="button"
                    class="bp-opt-btn"
                    data-bp-select="accommId"
                    data-bp-val="${escapeHtml(opt.id)}"
                  >
                    <div class="bp-opt-top">
                      <span class="bp-opt-icon">${opt.icon}</span>
                      ${opt.badge ? `<span class="bp-opt-badge">${escapeHtml(opt.badge)}</span>` : ''}
                    </div>
                    <span class="bp-opt-name">${escapeHtml(opt.label)}</span>
                    <span class="bp-opt-price">${escapeHtml(opt.priceLabel)}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div>
              <div class="bp-section-label">
                <span>🍲 Günlük Yemek & Çay</span>
                <span data-bp-bind="daysMeta"></span>
              </div>
              <div class="bp-option-grid">
                ${FOOD_OPTIONS.map((opt) => `
                  <button
                    type="button"
                    class="bp-opt-btn"
                    data-bp-select="foodId"
                    data-bp-val="${escapeHtml(opt.id)}"
                  >
                    <div class="bp-opt-top">
                      <span class="bp-opt-icon">${opt.icon}</span>
                    </div>
                    <span class="bp-opt-name">${escapeHtml(opt.label)}</span>
                    <span class="bp-opt-price">${escapeHtml(opt.priceLabel)}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div>
              <div class="bp-section-label">
                <span>🚌 Şehirlerarası Ulaşım</span>
                <span data-bp-bind="transitionsMeta"></span>
              </div>
              <div class="bp-option-grid">
                ${TRANSPORT_OPTIONS.map((opt) => `
                  <button
                    type="button"
                    class="bp-opt-btn"
                    data-bp-select="transportId"
                    data-bp-val="${escapeHtml(opt.id)}"
                  >
                    <div class="bp-opt-top">
                      <span class="bp-opt-icon">${opt.icon}</span>
                    </div>
                    <span class="bp-opt-name">${escapeHtml(opt.label)}</span>
                    <span class="bp-opt-price">${escapeHtml(opt.priceLabel)}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div>
              <div class="bp-section-label">
                <span>🏛️ Müze & Şehir İçi Ulaşım</span>
                <span data-bp-bind="museumMeta"></span>
              </div>
              <label class="bp-toggle-row">
                <div class="bp-toggle-info">
                  <span class="bp-toggle-title">🎫 MüzeKart (60 ₺/yıl)</span>
                  <span class="bp-toggle-sub" data-bp-bind="muzeSub"></span>
                </div>
                <span class="bp-switch">
                  <input type="checkbox" ${state.muzeKart ? 'checked' : ''} data-bp-toggle="muzeKart" />
                  <span class="bp-switch-track"></span>
                </span>
              </label>
            </div>
          </section>

          <!-- RIGHT: LIVE VISUAL OUTPUT -->
          <section class="bp-card" aria-label="Canlı Bütçe Çıktısı" data-bp-output></section>
        </div>
      </div>
    `;

    const outputEl = container.querySelector('[data-bp-output]');

    function syncControlsAndOutput() {
      const calc = calculateBudget(state);
      const activePreset = getActivePresetId(state);

      // Sync persistent controls
      const citiesSlider = container.querySelector('[data-bp-slider="cities"]');
      const daysSlider = container.querySelector('[data-bp-slider="daysPerCity"]');
      const muzeChk = container.querySelector('[data-bp-toggle="muzeKart"]');
      if (citiesSlider && Number(citiesSlider.value) !== calc.cities) citiesSlider.value = String(calc.cities);
      if (daysSlider && Number(daysSlider.value) !== calc.daysPerCity) daysSlider.value = String(calc.daysPerCity);
      if (muzeChk) muzeChk.checked = Boolean(state.muzeKart);

      const bindText = (key, text) => {
        const el = container.querySelector(`[data-bp-bind="${key}"]`);
        if (el) el.textContent = text;
      };
      bindText('scaleMeta', `${calc.cities} İl · ${calc.totalDays} Gün`);
      bindText('citiesVal', `${calc.cities} İl`);
      bindText('daysVal', `${calc.daysPerCity} Gün / İl`);
      bindText('nightsMeta', `${calc.totalNights} gece`);
      bindText('daysMeta', `${calc.totalDays} gün`);
      bindText('transitionsMeta', `${calc.transitions} geçiş`);
      bindText('museumMeta', formatTL(calc.costs.museum));
      bindText(
        'muzeSub',
        state.muzeKart
          ? `Aktif — Normal girişe göre ${formatTL(calc.muzeSaved)} tasarruf (+${CITY_TRANSIT_DAILY} ₺/gün şehir içi)`
          : `Kapalı — İl başı ort. ${formatTL(NORMAL_MUSEUM_PER_CITY)} müze girişi (+${CITY_TRANSIT_DAILY} ₺/gün şehir içi)`
      );

      container.querySelectorAll('[data-bp-preset]').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-bp-preset') === activePreset);
      });

      container.querySelectorAll('[data-bp-select]').forEach((btn) => {
        const key = btn.getAttribute('data-bp-select');
        const val = btn.getAttribute('data-bp-val');
        btn.classList.toggle('active', state[key] === val);
      });

      // Render live output panel
      const hoveredMeta = state.hoveredCat
        ? CATEGORY_META.find((c) => c.key === state.hoveredCat)
        : null;
      const centerLabel = hoveredMeta ? hoveredMeta.label : 'Toplam Bütçe';
      const centerVal = hoveredMeta ? formatTL(calc.costs[hoveredMeta.key]) : formatTL(calc.totalCost);
      const centerSub = hoveredMeta
        ? `%${calc.totalCost > 0 ? Math.round((calc.costs[hoveredMeta.key] / calc.totalCost) * 100) : 0}`
        : `${calc.totalDays} gün · ${calc.cities} il`;

      const mineBarPct = calc.hotelBaselineTotal > 0
        ? Math.max(8, Math.min(100, Math.round((calc.totalCost / calc.hotelBaselineTotal) * 100)))
        : 100;

      const isSaving = calc.accommSaved > 0 || calc.totalSaved > 0;
      const potentialKykSaving = STANDARD_HOTEL_RATE * calc.totalNights;

      outputEl.innerHTML = `
        <div class="bp-card-title">
          <span>📊 Canlı Maliyet Analizi</span>
          <span style="font-size:0.78rem;color:var(--accent-emerald);font-weight:700;">Anlık Hesap</span>
        </div>

        <div class="bp-kpi-grid">
          <div class="bp-kpi bp-kpi-primary">
            <span class="bp-kpi-label">Toplam Sefer Maliyeti</span>
            <strong class="bp-kpi-val">${formatTL(calc.totalCost)}</strong>
            <span class="bp-kpi-sub">${calc.cities} il · ${calc.totalDays} gün</span>
          </div>
          <div class="bp-kpi">
            <span class="bp-kpi-label">Günlük Ortalama</span>
            <strong class="bp-kpi-val">${formatTL(calc.costPerDay)}</strong>
            <span class="bp-kpi-sub">İl başı: ${formatTL(calc.costPerCity)}</span>
          </div>
          <div class="bp-kpi">
            <span class="bp-kpi-label">📚 Kütüphane Çalışma Saati</span>
            <strong class="bp-kpi-val">${formatNum(calc.libraryHours)} saat</strong>
            <span class="bp-kpi-sub">${calc.cities} × ${calc.daysPerCity} × ${LIBRARY_HOURS_PER_DAY} saat/gün</span>
          </div>
          <div class="bp-kpi">
            <span class="bp-kpi-label">⛺ Konaklama Payı</span>
            <strong class="bp-kpi-val">${formatTL(calc.costs.accomm)}</strong>
            <span class="bp-kpi-sub">${calc.costs.accomm === 0 ? 'GSB KYK ile 0 ₺!' : `${formatTL(calc.accommOpt.rate)}/gece`}</span>
          </div>
        </div>

        <div class="bp-donut-layout">
          <div class="bp-donut-box">
            ${buildDonutSvg(calc, state.hoveredCat)}
            <div class="bp-donut-center">
              <span class="bp-donut-center-label">${escapeHtml(centerLabel)}</span>
              <strong class="bp-donut-center-val">${escapeHtml(centerVal)}</strong>
              <span class="bp-donut-center-sub">${escapeHtml(centerSub)}</span>
            </div>
          </div>

          <div class="bp-legend">
            ${CATEGORY_META.map((cat) => {
              const amount = calc.costs[cat.key] || 0;
              const pct = calc.totalCost > 0 ? Math.round((amount / calc.totalCost) * 100) : 0;
              const isActive = state.hoveredCat === cat.key;
              return `
                <div class="bp-legend-item ${isActive ? 'is-active' : ''}" data-bp-legend="${cat.key}">
                  <div class="bp-legend-left">
                    <span class="bp-legend-dot" style="background:${cat.color};"></span>
                    <div style="min-width:0;">
                      <div class="bp-legend-name">${cat.icon} ${escapeHtml(cat.label)}</div>
                      <div class="bp-legend-formula">${escapeHtml(calc.formulas[cat.key])}</div>
                    </div>
                  </div>
                  <div class="bp-legend-right">
                    <div class="bp-legend-amount">${amount === 0 ? '0 ₺' : formatTL(amount)}</div>
                    <div class="bp-legend-pct">${amount === 0 ? 'Ücretsiz' : `%${pct}`}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Highlighted GSB Seyahatsever Savings Card -->
        <div class="bp-savings-card ${isSaving ? '' : 'bp-savings-muted'}">
          <div class="bp-savings-head">
            <span class="bp-savings-title">💚 GSB Seyahatsever Tasarruf Kartı</span>
            <span class="bp-savings-pill">
              ${isSaving ? `%${calc.savedPct} Tasarruf` : 'Otel Tarifesi'}
            </span>
          </div>

          <div class="bp-savings-amount">
            ${isSaving ? `${formatTL(calc.totalSaved)} Tasarruf!` : `0 ₺ Tasarruf`}
          </div>

          <p class="bp-savings-desc">
            ${state.accommId === 'kyk'
              ? `Standart otel turizmine (${formatTL(STANDARD_HOTEL_RATE)}/gece) kıyasla sadece GSB Seyahatsever KYK ile <strong>${formatTL(calc.accommSaved)}</strong>${calc.muzeSaved > 0 ? `, MüzeKart ile <strong>${formatTL(calc.muzeSaved)}</strong>` : ''} cebinde kalıyor.`
              : state.accommId === 'pension'
                ? `Butik otele kıyasla konaklamadan <strong>${formatTL(calc.accommSaved)}</strong> tasarruf ediyorsun. GSB Seyahatsever KYK'ya geçersen <strong>${formatTL(potentialKykSaving)}</strong> konaklama tasarrufuna ulaşırsın!`
                : `Şu an standart butik otel tarifesindesin (${formatTL(STANDARD_HOTEL_RATE)}/gece). GSB Seyahatsever KYK modeline geçerek tek seferde <strong>${formatTL(potentialKykSaving)}</strong> tasarruf edebilirsin!`}
          </p>

          <div class="bp-compare-bars">
            <div class="bp-bar-row">
              <div class="bp-bar-meta">
                <span>Senin Sefer Planın</span>
                <span>${formatTL(calc.totalCost)}</span>
              </div>
              <div class="bp-bar-track">
                <div class="bp-bar-fill bp-bar-fill-mine" style="width:${mineBarPct}%;"></div>
              </div>
            </div>
            <div class="bp-bar-row">
              <div class="bp-bar-meta">
                <span>Standart Otel Turizmi (${formatTL(STANDARD_HOTEL_RATE)}/gece)</span>
                <span>${formatTL(calc.hotelBaselineTotal)}</span>
              </div>
              <div class="bp-bar-track">
                <div class="bp-bar-fill bp-bar-fill-hotel" style="width:100%;"></div>
              </div>
            </div>
          </div>

          ${state.accommId !== 'kyk'
            ? `<button type="button" class="bp-kyk-cta" data-bp-action="switch-kyk">⛺ GSB Seyahatsever KYK (0 ₺) Moduna Geç</button>`
            : ''}
        </div>

        <div class="bp-footnote">
          <span>${escapeHtml(statsNote)}</span>
          <span>Tahmini 2026 Anadolu fiyat endeksi</span>
        </div>
      `;

      bindOutputInteractions(calc);
    }

    function bindOutputInteractions(calc) {
      const kykCta = outputEl.querySelector('[data-bp-action="switch-kyk"]');
      if (kykCta) {
        kykCta.addEventListener('click', () => {
          state.accommId = 'kyk';
          syncControlsAndOutput();
          showToast('⛺ GSB Seyahatsever KYK (0 ₺/gece) aktif edildi!');
        });
      }

      const centerLabelEl = outputEl.querySelector('.bp-donut-center-label');
      const centerValEl = outputEl.querySelector('.bp-donut-center-val');
      const centerSubEl = outputEl.querySelector('.bp-donut-center-sub');

      function setHighlight(catKey) {
        state.hoveredCat = catKey;
        outputEl.querySelectorAll('[data-bp-seg]').forEach((el) => {
          el.classList.toggle('is-active', el.getAttribute('data-bp-seg') === catKey);
        });
        outputEl.querySelectorAll('[data-bp-legend]').forEach((el) => {
          el.classList.toggle('is-active', el.getAttribute('data-bp-legend') === catKey);
        });
        if (!centerLabelEl || !centerValEl || !centerSubEl) return;
        if (!catKey) {
          centerLabelEl.textContent = 'Toplam Bütçe';
          centerValEl.textContent = formatTL(calc.totalCost);
          centerSubEl.textContent = `${calc.totalDays} gün · ${calc.cities} il`;
          return;
        }
        const meta = CATEGORY_META.find((c) => c.key === catKey);
        if (!meta) return;
        const amount = calc.costs[catKey] || 0;
        const pct = calc.totalCost > 0 ? Math.round((amount / calc.totalCost) * 100) : 0;
        centerLabelEl.textContent = meta.label;
        centerValEl.textContent = amount === 0 ? '0 ₺' : formatTL(amount);
        centerSubEl.textContent = amount === 0 ? 'Ücretsiz' : `%${pct} pay`;
      }

      outputEl.querySelectorAll('[data-bp-seg]').forEach((seg) => {
        const key = seg.getAttribute('data-bp-seg');
        seg.addEventListener('mouseenter', () => setHighlight(key));
        seg.addEventListener('mouseleave', () => setHighlight(null));
      });

      outputEl.querySelectorAll('[data-bp-legend]').forEach((item) => {
        const key = item.getAttribute('data-bp-legend');
        item.addEventListener('mouseenter', () => setHighlight(key));
        item.addEventListener('mouseleave', () => setHighlight(null));
      });
    }

    // Bind static control listeners once
    container.querySelectorAll('[data-bp-slider]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const key = e.currentTarget.getAttribute('data-bp-slider');
        state[key] = Number(e.currentTarget.value);
        syncControlsAndOutput();
      });
    });

    container.querySelectorAll('[data-bp-select]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const key = e.currentTarget.getAttribute('data-bp-select');
        const val = e.currentTarget.getAttribute('data-bp-val');
        if (state[key] !== val) {
          state[key] = val;
          syncControlsAndOutput();
        }
      });
    });

    container.querySelectorAll('[data-bp-toggle]').forEach((chk) => {
      chk.addEventListener('change', (e) => {
        const key = e.currentTarget.getAttribute('data-bp-toggle');
        state[key] = Boolean(e.currentTarget.checked);
        syncControlsAndOutput();
      });
    });

    container.querySelectorAll('[data-bp-preset]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const presetId = e.currentTarget.getAttribute('data-bp-preset');
        const preset = PRESETS.find((p) => p.id === presetId);
        if (!preset) return;
        Object.assign(state, preset.state);
        state.hoveredCat = null;
        syncControlsAndOutput();
        showToast(`Şablon uygulandı: ${preset.label}`);
      });
    });

    container.querySelectorAll('[data-bp-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-bp-action');
        if (action === 'reset') {
          Object.assign(state, PRESETS[0].state);
          state.hoveredCat = null;
          syncControlsAndOutput();
          showToast('Ankara→Edirne Seferi varsayılanlarına dönüldü.');
        } else if (action === 'copy') {
          const calc = calculateBudget(state);
          const summary = buildSummaryText(calc, state);
          if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(summary).then(
              () => showToast('📋 Sefer bütçe özeti panoya kopyalandı!'),
              () => showToast('Panoya kopyalanamadı.')
            );
          } else {
            showToast('Tarayıcı pano erişimini desteklemiyor.');
          }
        }
      });
    });

    syncControlsAndOutput();
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.budget = {
    render: render
  };
})();
