/**
 * Anadolu Seyahatnamesi — AI Ruh Hali & Kişilik Kaşifi Stüdyosu
 * Luxury mood & personality-driven Anatolia discovery studio powered by
 * window.SEYYAH_AI (with direct Gemini & offline scoring fallback).
 * Registers on window.SEYYAH_MODULES.aiMood = { render(container, ctx) }
 */
(function () {
  'use strict';

  const STYLE_ID = 'seyyah-ai-mood-styles';
  const GEMINI_KEY_STORAGE = 'dijital_seyyah_gemini_api_key';
  const GEMINI_MODEL_STORAGE = 'dijital_seyyah_gemini_model';
  const DEFAULT_MODEL = 'gemini-flash-lite-latest';
  const FALLBACK_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];
  const RETIRED_MODELS = new Set([
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-pro'
  ]);

  const MOODS = [
    {
      id: 'sukunet',
      icon: '🕊️',
      title: 'İçsel Sükûnet & Tefekkür',
      subtitle: 'Kadim dergâhlar, taş avlular ve gönlü dinlendiren sessiz menziller.',
      tag: 'Manevîyat & Huzur',
      accent: '#38bdf8',
      accentSoft: 'rgba(56, 189, 248, 0.16)',
      promptDesc: 'manevi derinlik, tarihi camiler, türbeler, taş avlular, yavaş yürüyüş ve içsel sükûnet',
      regions: ['04_IcAnadolu', '07_GuneydoguAnadolu', '01_Marmara', '05_Karadeniz'],
      keywords: [
        'turbe', 'camii', 'cami', 'kulliye', 'medrese', 'dergah', 'mevlana',
        'yunus', 'haci', 'irfan', 'manevi', 'huzur', 'sukunet', 'tefekkur',
        'selcuklu', 'tekke', 'veli', 'divriği', 'divrigi', 'eyup', 'ulucami'
      ]
    },
    {
      id: 'macera',
      icon: '🔥',
      title: 'Macera & Keşif',
      subtitle: 'Sarp kaleler, derin kanyonlar, zirve geçitleri ve vahşi Anadolu rotaları.',
      tag: 'Adrenalin & Yükseklik',
      accent: '#f97316',
      accentSoft: 'rgba(249, 115, 22, 0.16)',
      promptDesc: 'sarp kanyonlar, dağ geçitleri, yüksek yaylalar, antik kaleler, şelaleler ve dinamik keşif',
      regions: ['06_DoguAnadolu', '05_Karadeniz', '03_Akdeniz'],
      keywords: [
        'kanyon', 'kale', 'dag', 'zirve', 'yayla', 'selale', 'magara',
        'vadi', 'milli park', 'krater', 'nehir', 'rafting', 'nemrut',
        'agri', 'kackar', 'munzur', 'sumela', 'ani', 'ishak pasa'
      ]
    },
    {
      id: 'kodlama',
      icon: '📚',
      title: 'Derin Kodlama & Kütüphane',
      subtitle: 'İl Halk Kütüphanesi masalarında verimli odak, dingin kampüs ve kahve ritmi.',
      tag: 'Odak & Üretkenlik',
      accent: '#a855f7',
      accentSoft: 'rgba(168, 85, 247, 0.16)',
      promptDesc: 'İl Halk Kütüphanesi çalışma atmosferi, sakin ve düzenli şehir yapısı, nitelikli kahve molaları ve derin odaklanma',
      regions: ['04_IcAnadolu', '01_Marmara', '02_Ege'],
      keywords: [
        'kutuphane', 'odak', 'sakin', 'universite', 'kampus', 'ferah',
        'duzenli', 'sessiz', 'butik', 'bahce', 'modern', 'okuma', 'not',
        'verimli', 'calisma', 'konfor', 'yaya'
      ]
    },
    {
      id: 'gurme',
      icon: '🍽️',
      title: 'Gurme Lezzet Avı',
      subtitle: 'Tarihî çarşılar, taş fırınlar, coğrafi işaretli sofralar ve şerbet durakları.',
      tag: 'Sofra & Zanaat',
      accent: '#f59e0b',
      accentSoft: 'rgba(245, 158, 11, 0.16)',
      promptDesc: 'köklü Anadolu mutfağı, coğrafi işaretli yemekler, tarihi çarşı esnaf lokantaları ve tatlı-kahve mirası',
      regions: ['07_GuneydoguAnadolu', '03_Akdeniz', '01_Marmara', '04_IcAnadolu'],
      keywords: [
        'kebap', 'baklava', 'kunefe', 'manti', 'tava', 'pide', 'corba',
        'helva', 'kaymak', 'cig kofte', 'iskender', 'tantuni', 'lokum',
        'kahve', 'carsi', 'lezzet', 'gastronomi', 'unesco', 'guvec', 'etli'
      ]
    },
    {
      id: 'fotograf',
      icon: '📸',
      title: 'Altın Saat Fotoğrafçılığı',
      subtitle: 'Gün batımı silüetleri, taş konaklar, göl yansımaları ve masalsı kadrajlar.',
      tag: 'Işık & Perspektif',
      accent: '#00f2fe',
      accentSoft: 'rgba(0, 242, 254, 0.15)',
      promptDesc: 'gün doğumu ve altın saat kadrajları, taş konak silüetleri, göl-deniz yansımaları ve renkli sokak dokuları',
      regions: ['02_Ege', '06_DoguAnadolu', '07_GuneydoguAnadolu', '05_Karadeniz'],
      keywords: [
        'gun batimi', 'konak', 'tas', 'gol', 'ada', 'antik', 'tiyatro',
        'peri bacalari', 'kopru', 'manzara', 'seyir', 'liman', 'sahil',
        'renkli', 'kilise', 'kale', 'saat kulesi', 'cunda', 'safranbolu', 'mardin'
      ]
    },
    {
      id: 'melankoli',
      icon: '🌧️',
      title: 'Yağmurlu Melankoli',
      subtitle: 'Sisli yaylalar, buğulu çay bardakları, ıslak Arnavut kaldırımları ve şiir.',
      tag: 'Sis & Nostalji',
      accent: '#10b981',
      accentSoft: 'rgba(16, 185, 129, 0.16)',
      promptDesc: 'sisli ormanlar, yağmurlu sokaklar, edebî nostalji, buğulu çay sohbetleri ve hüzünlü ama iyileştirici atmosfer',
      regions: ['05_Karadeniz', '01_Marmara', '02_Ege'],
      keywords: [
        'sis', 'yagmur', 'orman', 'cay', 'ahsap', 'yayla', 'sisli',
        'dalga', 'liman', 'edebiyat', 'siir', 'sabahattin', 'nostalji',
        'eski', 'hamsi', 'yesil', 'cam', 'serin', 'sonbahar'
      ]
    }
  ];

  const SEASONS = [
    { id: 'İlkbahar', icon: '🌸', label: 'İlkbahar', hint: 'Badem çiçeği & uyanış' },
    { id: 'Yaz', icon: '☀️', label: 'Yaz', hint: 'Yayla serinliği & uzun gün' },
    { id: 'Sonbahar', icon: '🍂', label: 'Sonbahar', hint: 'Hazan altını & sakinlik' },
    { id: 'Kış', icon: '❄️', label: 'Kış', hint: 'Kar, soba & kütüphane' }
  ];

  const COMPANIONS = [
    { id: 'Tek Başına', icon: '🧳', label: 'Tek Başına', hint: 'Özgür ritim & tefekkür' },
    { id: 'Arkadaşla', icon: '🧭', label: 'Arkadaşla', hint: 'Paylaşılan rota & sohbet' },
    { id: 'Aileyle', icon: '🏡', label: 'Aileyle', hint: 'Konforlu duraklar & sofra' }
  ];

  function detectDefaultSeason() {
    try {
      const m = new Date().getMonth(); // 0-11
      if (m >= 2 && m <= 4) return 'İlkbahar';
      if (m >= 5 && m <= 7) return 'Yaz';
      if (m >= 8 && m <= 10) return 'Sonbahar';
      return 'Kış';
    } catch (e) {
      return 'Sonbahar';
    }
  }

  const uiState = {
    moodId: MOODS[0].id,
    season: detectDefaultSeason(),
    companion: COMPANIONS[0].id,
    onlyUnvisited: true,
    isLoading: false,
    errorMsg: '',
    result: null,
    rerollCount: 0,
    previousKeys: []
  };

  // ---------------------------------------------------------------------------
  // Utilities
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
    const num = Number(plate);
    if (!Number.isFinite(num) || num <= 0) return '00';
    return num < 10 ? `0${num}` : String(num);
  }

  function getStoredGeminiKey() {
    try {
      return (localStorage.getItem(GEMINI_KEY_STORAGE) || '').trim();
    } catch (e) {
      return '';
    }
  }

  function getStoredGeminiModel() {
    try {
      const m = (localStorage.getItem(GEMINI_MODEL_STORAGE) || DEFAULT_MODEL).trim();
      return RETIRED_MODELS.has(m) ? DEFAULT_MODEL : m;
    } catch (e) {
      return DEFAULT_MODEL;
    }
  }

  function extractProvinceList(ctx) {
    const raw = (ctx && ctx.data && ctx.data.provinces) || {};
    return Object.entries(raw).map(([key, val]) => Object.assign({ key }, val || {}));
  }

  function resolveBannerPath(p) {
    if (p && p.has_banner && p.banner_rel) return p.banner_rel;
    if (p && p.banner_rel) return p.banner_rel;
    return 'assets/banner.jpg';
  }

  function getMoodById(id) {
    return MOODS.find((m) => m.id === id) || MOODS[0];
  }

  function cleanSnippet(text, maxLen) {
    if (!text) return '';
    const cleaned = String(text).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLen) return cleaned;
    return `${cleaned.slice(0, maxLen - 1).trim()}…`;
  }

  // ---------------------------------------------------------------------------
  // Scoped Luxury CSS (Dark & Light Theme Compatible)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .amd-shell {
        position: relative;
        max-width: 1180px;
        margin: 0 auto;
        padding: 8px 4px 44px;
        display: flex;
        flex-direction: column;
        gap: 22px;
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
      }

      /* Hero Header */
      .amd-hero {
        position: relative;
        overflow: hidden;
        border-radius: 22px;
        padding: 26px 28px;
        background:
          radial-gradient(circle at 8% 15%, rgba(168, 85, 247, 0.2), transparent 46%),
          radial-gradient(circle at 92% 10%, rgba(0, 242, 254, 0.16), transparent 44%),
          radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.1), transparent 55%),
          var(--bg-glass, rgba(15, 23, 42, 0.85));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        box-shadow: var(--shadow-subtle, 0 12px 32px rgba(0, 0, 0, 0.45));
      }

      .amd-hero-top {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 14px;
      }

      .amd-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--accent-cyan, #00f2fe);
        padding: 5px 12px;
        border-radius: 999px;
        background: rgba(0, 242, 254, 0.1);
        border: 1px solid rgba(0, 242, 254, 0.28);
        margin-bottom: 10px;
      }

      .amd-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.55rem, 2.7vw, 2.15rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.2;
        margin: 0 0 8px;
        background: linear-gradient(125deg, var(--text-primary, #f8fafc) 20%, var(--accent-cyan, #00f2fe) 65%, var(--accent-gold, #f59e0b) 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .amd-subtitle {
        max-width: 720px;
        font-size: 0.94rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.55;
        margin: 0;
      }

      .amd-engine-pill {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 7px 14px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 600;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        color: var(--text-primary, #f8fafc);
        white-space: nowrap;
      }

      .amd-engine-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent-emerald, #10b981);
        box-shadow: 0 0 10px var(--accent-emerald, #10b981);
      }

      .amd-engine-dot.offline {
        background: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 10px var(--accent-gold, #f59e0b);
      }

      /* Studio Section Card */
      .amd-section {
        border-radius: 20px;
        padding: 22px 24px;
        background: var(--bg-card, rgba(30, 41, 59, 0.7));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      }

      .amd-step-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 16px;
      }

      .amd-step-label {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.08rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      .amd-step-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 9px;
        font-size: 0.78rem;
        font-weight: 800;
        background: linear-gradient(135deg, var(--accent-cyan, #00f2fe), var(--accent-blue, #4facfe));
        color: #06101f;
      }

      .amd-step-hint {
        font-size: 0.82rem;
        color: var(--text-muted, #64748b);
      }

      /* Step 1: Mood Grid */
      .amd-mood-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .amd-mood-card {
        position: relative;
        text-align: left;
        cursor: pointer;
        border-radius: 16px;
        padding: 18px 18px 16px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.11));
        background:
          linear-gradient(160deg, var(--amd-card-tint, rgba(56, 189, 248, 0.1)) 0%, rgba(15, 23, 42, 0.55) 68%);
        color: var(--text-primary, #f8fafc);
        transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.24s ease, box-shadow 0.24s ease;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow: hidden;
      }

      .amd-mood-card:hover {
        transform: translateY(-3px);
        border-color: var(--amd-card-accent, var(--accent-cyan, #00f2fe));
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.32);
      }

      .amd-mood-card.active {
        border-color: var(--amd-card-accent, var(--accent-cyan, #00f2fe));
        box-shadow:
          0 0 0 1px var(--amd-card-accent, var(--accent-cyan, #00f2fe)),
          0 14px 30px rgba(0, 0, 0, 0.36);
        background:
          linear-gradient(155deg, var(--amd-card-tint, rgba(56, 189, 248, 0.22)) 0%, rgba(15, 23, 42, 0.78) 72%);
      }

      .amd-mood-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .amd-mood-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 13px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.45rem;
        background: var(--amd-card-tint, rgba(56, 189, 248, 0.16));
        border: 1px solid rgba(255, 255, 255, 0.14);
      }

      .amd-mood-tag {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        padding: 4px 9px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-secondary, #94a3b8);
      }

      .amd-mood-card.active .amd-mood-tag {
        background: var(--amd-card-tint, rgba(56, 189, 248, 0.22));
        border-color: var(--amd-card-accent, var(--accent-cyan, #00f2fe));
        color: var(--text-primary, #f8fafc);
      }

      .amd-mood-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.28;
        color: var(--text-primary, #f8fafc);
      }

      .amd-mood-desc {
        font-size: 0.81rem;
        line-height: 1.48;
        color: var(--text-secondary, #94a3b8);
      }

      .amd-mood-check {
        position: absolute;
        bottom: 12px;
        right: 12px;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--amd-card-accent, var(--accent-cyan, #00f2fe));
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 0.2s ease, transform 0.2s ease;
      }

      .amd-mood-card.active .amd-mood-check {
        opacity: 1;
        transform: translateY(0);
      }

      /* Step 2: Parameters Row */
      .amd-params-grid {
        display: grid;
        grid-template-columns: 1.2fr 1fr auto;
        gap: 18px;
        align-items: stretch;
      }

      .amd-param-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .amd-param-title {
        font-size: 0.79rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--text-secondary, #94a3b8);
      }

      .amd-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .amd-chip {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.5);
        color: var(--text-secondary, #94a3b8);
        border-radius: 12px;
        padding: 9px 13px;
        font-size: 0.84rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        transition: all 0.2s ease;
      }

      .amd-chip:hover {
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
        transform: translateY(-1px);
      }

      .amd-chip.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.18), rgba(79, 172, 254, 0.16));
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
        box-shadow: 0 0 18px rgba(0, 242, 254, 0.18);
      }

      .amd-toggle-box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 12px 16px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        min-width: 245px;
      }

      .amd-toggle-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        cursor: pointer;
        user-select: none;
      }

      .amd-toggle-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .amd-toggle-main {
        font-size: 0.86rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      .amd-toggle-sub {
        font-size: 0.74rem;
        color: var(--text-muted, #64748b);
      }

      .amd-switch {
        position: relative;
        width: 46px;
        height: 26px;
        flex-shrink: 0;
      }

      .amd-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .amd-switch-track {
        position: absolute;
        inset: 0;
        border-radius: 999px;
        background: rgba(100, 116, 139, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.14);
        transition: background 0.25s ease, border-color 0.25s ease;
      }

      .amd-switch-track::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
        transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .amd-switch input:checked + .amd-switch-track {
        background: linear-gradient(135deg, var(--accent-emerald, #10b981), var(--accent-cyan, #00f2fe));
        border-color: transparent;
      }

      .amd-switch input:checked + .amd-switch-track::after {
        transform: translateX(20px);
      }

      /* Primary Action Bar */
      .amd-action-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-top: 18px;
        padding-top: 18px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .amd-summary-pills {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
      }

      .amd-mini-pill {
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        color: var(--text-primary, #f8fafc);
        font-weight: 600;
      }

      .amd-cta-btn {
        position: relative;
        cursor: pointer;
        border: none;
        border-radius: 14px;
        padding: 13px 26px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.96rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        color: #061224;
        background: linear-gradient(135deg, var(--accent-cyan, #00f2fe) 0%, var(--accent-blue, #4facfe) 52%, var(--accent-emerald, #10b981) 100%);
        box-shadow: 0 10px 28px rgba(0, 242, 254, 0.28);
        display: inline-flex;
        align-items: center;
        gap: 9px;
        transition: transform 0.22s ease, box-shadow 0.22s ease, opacity 0.22s ease;
      }

      .amd-cta-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 14px 34px rgba(0, 242, 254, 0.38);
      }

      .amd-cta-btn:disabled {
        opacity: 0.7;
        cursor: wait;
      }

      /* Loading Skeleton */
      .amd-loading-wrap {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .amd-loading-banner {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        border-radius: 16px;
        background: rgba(0, 242, 254, 0.08);
        border: 1px solid rgba(0, 242, 254, 0.26);
        font-size: 0.92rem;
        font-weight: 600;
        color: var(--text-primary, #f8fafc);
      }

      .amd-spinner {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2.5px solid rgba(0, 242, 254, 0.25);
        border-top-color: var(--accent-cyan, #00f2fe);
        animation: amdSpin 0.8s linear infinite;
        flex-shrink: 0;
      }

      .amd-skeleton-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }

      .amd-skeleton-card {
        height: 410px;
        border-radius: 20px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: linear-gradient(110deg, rgba(30, 41, 59, 0.55) 25%, rgba(51, 65, 85, 0.72) 48%, rgba(30, 41, 59, 0.55) 75%);
        background-size: 200% 100%;
        animation: amdShimmer 1.4s infinite linear;
      }

      @keyframes amdSpin {
        to { transform: rotate(360deg); }
      }

      @keyframes amdShimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* Results Section */
      .amd-results-wrap {
        display: flex;
        flex-direction: column;
        gap: 18px;
        animation: amdFadeIn 0.35s ease;
      }

      @keyframes amdFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .amd-manifesto {
        position: relative;
        border-radius: 18px;
        padding: 20px 22px;
        background:
          radial-gradient(circle at 0% 0%, rgba(245, 158, 11, 0.14), transparent 45%),
          radial-gradient(circle at 100% 100%, rgba(0, 242, 254, 0.12), transparent 50%),
          var(--bg-card, rgba(30, 41, 59, 0.78));
        border: 1px solid var(--border-glow, rgba(0, 242, 254, 0.3));
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
      }

      .amd-manifesto-body {
        flex: 1 1 520px;
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .amd-source-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        width: fit-content;
        font-size: 0.73rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.35);
        color: var(--accent-emerald, #10b981);
      }

      .amd-source-badge.offline {
        background: rgba(245, 158, 11, 0.15);
        border-color: rgba(245, 158, 11, 0.35);
        color: var(--accent-gold, #f59e0b);
      }

      .amd-manifesto-text {
        font-size: 0.96rem;
        line-height: 1.62;
        color: var(--text-primary, #f8fafc);
        font-style: italic;
      }

      .amd-reroll-btn {
        cursor: pointer;
        border-radius: 12px;
        padding: 9px 14px;
        font-size: 0.82rem;
        font-weight: 700;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        color: var(--text-primary, #f8fafc);
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .amd-reroll-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
      }

      /* 3 Luxury Province Cards */
      .amd-cards-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .amd-city-card {
        position: relative;
        cursor: pointer;
        border-radius: 20px;
        overflow: hidden;
        background: var(--bg-card, rgba(15, 23, 42, 0.82));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        box-shadow: var(--shadow-subtle, 0 12px 30px rgba(0, 0, 0, 0.38));
        display: flex;
        flex-direction: column;
        transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.26s ease, box-shadow 0.26s ease;
      }

      .amd-city-card:hover {
        transform: translateY(-5px);
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45), 0 0 24px rgba(0, 242, 254, 0.18);
      }

      .amd-city-banner {
        position: relative;
        height: 185px;
        overflow: hidden;
        background: #0f172a;
      }

      .amd-city-banner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .amd-city-card:hover .amd-city-banner img {
        transform: scale(1.06);
      }

      .amd-city-banner-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(6, 12, 24, 0.28) 0%, rgba(6, 12, 24, 0.18) 45%, rgba(6, 12, 24, 0.9) 100%);
      }

      .amd-banner-top {
        position: absolute;
        top: 12px;
        left: 12px;
        right: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .amd-plate-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        height: 28px;
        padding: 0 9px;
        border-radius: 9px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: #ffffff;
        background: rgba(10, 15, 29, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.28);
        backdrop-filter: blur(8px);
      }

      .amd-match-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: 999px;
        font-size: 0.76rem;
        font-weight: 800;
        color: #04131c;
        background: linear-gradient(135deg, #34d399, #00f2fe);
        box-shadow: 0 4px 14px rgba(0, 242, 254, 0.35);
      }

      .amd-banner-bottom {
        position: absolute;
        bottom: 12px;
        left: 14px;
        right: 14px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 8px;
      }

      .amd-city-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.38rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.15;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.65);
      }

      .amd-city-region {
        font-size: 0.75rem;
        font-weight: 600;
        color: rgba(241, 245, 249, 0.86);
      }

      .amd-visited-pill {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 4px 9px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #e2e8f0;
        white-space: nowrap;
      }

      .amd-visited-pill.done {
        border-color: rgba(16, 185, 129, 0.55);
        color: #6ee7b7;
      }

      .amd-city-body {
        padding: 16px 18px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
      }

      .amd-poetic-reason {
        font-size: 0.87rem;
        line-height: 1.58;
        color: var(--text-primary, #f8fafc);
        padding-left: 11px;
        border-left: 2.5px solid var(--accent-cyan, #00f2fe);
      }

      .amd-detail-box {
        border-radius: 12px;
        padding: 10px 12px;
        background: rgba(15, 23, 42, 0.42);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .amd-detail-label {
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--accent-gold, #f59e0b);
      }

      .amd-detail-label.rhythm {
        color: var(--accent-cyan, #00f2fe);
      }

      .amd-detail-value {
        font-size: 0.82rem;
        line-height: 1.48;
        color: var(--text-secondary, #94a3b8);
      }

      .amd-card-footer {
        margin-top: auto;
        padding-top: 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .amd-go-btn {
        width: 100%;
        cursor: pointer;
        border-radius: 12px;
        padding: 10px 14px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.87rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.14), rgba(79, 172, 254, 0.16));
        border: 1px solid rgba(0, 242, 254, 0.35);
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
      }

      .amd-city-card:hover .amd-go-btn,
      .amd-go-btn:hover {
        background: linear-gradient(135deg, var(--accent-cyan, #00f2fe), var(--accent-blue, #4facfe));
        color: #061224;
        border-color: transparent;
      }

      .amd-empty-note {
        padding: 14px 16px;
        border-radius: 14px;
        font-size: 0.86rem;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.32);
        color: var(--text-primary, #f8fafc);
      }

      /* Light Theme Overrides */
      body.light-theme .amd-hero {
        background:
          radial-gradient(circle at 8% 15%, rgba(124, 58, 237, 0.1), transparent 46%),
          radial-gradient(circle at 92% 10%, rgba(2, 132, 199, 0.1), transparent 44%),
          rgba(255, 255, 255, 0.94);
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
      }

      body.light-theme .amd-eyebrow {
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.25);
      }

      body.light-theme .amd-engine-pill {
        background: rgba(241, 245, 249, 0.95);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .amd-section {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
      }

      body.light-theme .amd-mood-card {
        background: linear-gradient(160deg, var(--amd-card-tint, rgba(2, 132, 199, 0.08)) 0%, #ffffff 74%);
        border-color: rgba(15, 23, 42, 0.11);
      }

      body.light-theme .amd-mood-card:hover {
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
      }

      body.light-theme .amd-mood-card.active {
        background: linear-gradient(155deg, var(--amd-card-tint, rgba(2, 132, 199, 0.18)) 0%, #ffffff 78%);
        box-shadow:
          0 0 0 1px var(--amd-card-accent, #0284c7),
          0 12px 26px rgba(2, 132, 199, 0.14);
      }

      body.light-theme .amd-mood-icon-wrap {
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .amd-mood-tag {
        background: rgba(15, 23, 42, 0.05);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .amd-chip {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.12);
        color: #334155;
      }

      body.light-theme .amd-chip.active {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.14), rgba(37, 99, 235, 0.12));
        color: #0f172a;
      }

      body.light-theme .amd-toggle-box {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .amd-mini-pill {
        background: #f1f5f9;
        border-color: rgba(15, 23, 42, 0.1);
        color: #0f172a;
      }

      body.light-theme .amd-cta-btn {
        color: #ffffff;
        background: linear-gradient(135deg, #0284c7 0%, #2563eb 55%, #059669 100%);
        box-shadow: 0 10px 24px rgba(2, 132, 199, 0.25);
      }

      body.light-theme .amd-manifesto {
        background:
          radial-gradient(circle at 0% 0%, rgba(217, 119, 6, 0.1), transparent 45%),
          radial-gradient(circle at 100% 100%, rgba(2, 132, 199, 0.1), transparent 50%),
          #ffffff;
        box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
      }

      body.light-theme .amd-reroll-btn {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      body.light-theme .amd-city-card {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.11);
        box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
      }

      body.light-theme .amd-city-card:hover {
        box-shadow: 0 18px 34px rgba(2, 132, 199, 0.16);
      }

      body.light-theme .amd-detail-box {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .amd-go-btn {
        color: #0284c7;
        background: rgba(2, 132, 199, 0.08);
        border-color: rgba(2, 132, 199, 0.3);
      }

      body.light-theme .amd-city-card:hover .amd-go-btn,
      body.light-theme .amd-go-btn:hover {
        color: #ffffff;
        background: linear-gradient(135deg, #0284c7, #2563eb);
      }

      body.light-theme .amd-skeleton-card {
        background: linear-gradient(110deg, #e2e8f0 25%, #f1f5f9 48%, #e2e8f0 75%);
        background-size: 200% 100%;
      }

      /* Responsive */
      @media (max-width: 980px) {
        .amd-mood-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .amd-params-grid {
          grid-template-columns: 1fr;
        }
        .amd-cards-grid,
        .amd-skeleton-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .amd-hero {
          padding: 20px 18px;
        }
        .amd-section {
          padding: 18px 16px;
        }
        .amd-mood-grid {
          grid-template-columns: 1fr;
        }
        .amd-cta-btn {
          width: 100%;
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Offline Scoring & Synthesis Fallback
  // ---------------------------------------------------------------------------
  function scoreProvinceForMood(p, mood, season, companion, normFn, seedOffset) {
    const corpus = normFn([
      p.name,
      p.region,
      p.quote,
      p.custom_quote,
      p.library,
      p.history,
      ...(p.landmarks || []),
      ...(p.specialties || []),
      ...(p.spiritual_figures || []),
      ...(p.literary_quotes || []),
      ...(p.five_day_plan || [])
    ].join(' '));

    let score = 40;

    // 1. Mood keyword hits
    for (const kw of mood.keywords) {
      if (corpus.includes(normFn(kw))) score += 6;
    }

    // 2. Mood-region affinity
    const regIdx = mood.regions.indexOf(p.region_code);
    if (regIdx === 0) score += 18;
    else if (regIdx === 1) score += 13;
    else if (regIdx > 1) score += 8;

    // 3. Season affinity
    const rc = p.region_code || '';
    if (season === 'İlkbahar') {
      if (rc === '02_Ege' || rc === '03_Akdeniz' || rc === '04_IcAnadolu' || rc === '07_GuneydoguAnadolu') score += 10;
    } else if (season === 'Yaz') {
      if (rc === '05_Karadeniz' || rc === '06_DoguAnadolu' || rc === '02_Ege' || rc === '01_Marmara') score += 10;
    } else if (season === 'Sonbahar') {
      if (rc === '01_Marmara' || rc === '04_IcAnadolu' || rc === '05_Karadeniz' || rc === '07_GuneydoguAnadolu') score += 10;
    } else if (season === 'Kış') {
      if (rc === '06_DoguAnadolu' || rc === '04_IcAnadolu' || rc === '01_Marmara' || rc === '03_Akdeniz') score += 10;
    }

    // 4. Companion affinity
    if (companion === 'Tek Başına') {
      if (/kutuphane|tefekkur|sakin|turbe|manastir|siir/.test(corpus)) score += 7;
    } else if (companion === 'Arkadaşla') {
      if (/kanyon|yayla|carsi|kebap|antik|sahil|ada/.test(corpus)) score += 7;
    } else if (companion === 'Aileyle') {
      if (/park|gol|konak|muze|saat kulesi|helva|pide/.test(corpus)) score += 7;
    }

    // 5. Richness bonus (content_size / landmarks)
    score += Math.min(8, Math.floor(((p.landmarks && p.landmarks.length) || 0) * 1.5));
    if (!p.visited) score += 5;

    // Deterministic micro tie-breaker with reroll rotation support
    const plateNum = Number(p.plate) || 1;
    const hash = ((plateNum * 17 + (seedOffset || 0) * 29) % 11) * 0.4;
    return score + hash;
  }

  function buildOfflineRhythm(p, mood, season, companion) {
    const landmark1 = (p.landmarks && p.landmarks[0]) || `${p.name} tarihî merkezi`;
    const landmark2 = (p.landmarks && p.landmarks[1]) || `${p.name} seyir noktası`;
    const libName = p.library ? cleanSnippet(p.library.split(' - ')[0], 46) : `${p.name} İl Halk Kütüphanesi`;
    const firstDish = (p.specialties && p.specialties[0]) || 'yöresel sofra';

    if (mood.id === 'kodlama') {
      return `Sabah ${libName}'nde derin odak ve kodlama bloğu; ikindi vakti ${landmark1} çevresinde yürüyüş; akşam ${firstDish} eşliğinde gün değerlendirmesi.`;
    }
    if (mood.id === 'gurme') {
      return `Sabah tarihî çarşıda fırından taze ikramlar; öğlen ${landmark1} ve esnaf lokantası turu; akşam ${firstDish} ile ${season.toLowerCase()} sofrası.`;
    }
    if (mood.id === 'fotograf') {
      return `Şafakta ${landmark1} silüetiyle ilk kareler; öğlen ${libName} civarında dinlenme; altın saatte ${landmark2} noktasında gün batımı kadrajı.`;
    }
    if (mood.id === 'macera') {
      return `Erken saatte ${landmark1} parkuruna çıkış; öğleden sonra ${landmark2} keşfi; akşam ${companion.toLowerCase()} ${firstDish} eşliğinde rota muhasebesi.`;
    }
    if (mood.id === 'melankoli') {
      return `${season} serinliğinde ${libName} penceresinde okuma ve çay; ikindide ${landmark1} sokaklarında ağır adımlar; akşam ${firstDish} ile sıcacık mola.`;
    }
    return `Sabah ${landmark1} avlusunda sükûnet; öğle sonrası ${libName}'nde tefekkür ve okuma; akşam ${landmark2} yönünde dingin yürüyüş.`;
  }

  function buildOfflineReason(p, mood, season, companion) {
    const quote = cleanSnippet(p.custom_quote || p.quote || '', 120);
    const lm = (p.landmarks && p.landmarks.slice(0, 2).join(' ve ')) || `${p.name} mirası`;
    const prefixMap = {
      sukunet: `${p.name}, ${season.toLowerCase()} dinginliğinde ${lm} ile gönle duruluk veren bir sükûnet durağı.`,
      macera: `${p.name}, ${lm} hattıyla ${companion.toLowerCase()} çıkılacak keşiflere diri bir Anadolu heyecanı katar.`,
      kodlama: `${p.name}, düzenli şehir ritmi ve ${lm} yakınındaki kütüphane iklimiyle derin çalışma için biçilmiş kaftan.`,
      gurme: `${p.name}, köklü mutfak geleneği ve ${lm} çevresindeki çarşı kültürüyle gerçek bir lezzet menzili.`,
      fotograf: `${p.name}, ${season.toLowerCase()} ışığının ${lm} dokusuna vurduğu anlarda unutulmaz kareler sunar.`,
      melankoli: `${p.name}, ${season.toLowerCase()} göğü altında ${lm} izleriyle şiirsel bir hüzün ve dinginlik taşır.`
    };
    const lead = prefixMap[mood.id] || `${p.name}, ruh halinle örtüşen kadim bir menzil.`;
    return quote ? `${lead} “${quote}”` : lead;
  }

  function generateOfflineRecommendations(candidates, mood, season, companion, normFn, rerollCount, prevKeys) {
    const scored = candidates
      .map((p) => ({
        province: p,
        score: scoreProvinceForMood(p, mood, season, companion, normFn, rerollCount)
      }))
      .sort((a, b) => b.score - a.score);

    // Take a pool of top candidates and rotate slightly on reroll so clicking again yields fresh cities
    const poolSize = Math.min(scored.length, 9);
    const topPool = scored.slice(0, poolSize);
    let chosen = [];

    if (rerollCount > 0 && topPool.length > 3) {
      const fresh = topPool.filter((item) => !prevKeys.includes(item.province.key));
      chosen = fresh.slice(0, 3);
      for (const item of topPool) {
        if (chosen.length >= 3) break;
        if (!chosen.includes(item)) chosen.push(item);
      }
    } else {
      chosen = topPool.slice(0, 3);
    }

    const matchPills = [99, 97, 96];
    const picks = chosen.map((item, idx) => {
      const p = item.province;
      const dish = (p.specialties && p.specialties.slice(0, 2).join(' & ')) || 'Yöresel Anadolu Sofrası';
      return {
        key: p.key,
        province: p,
        matchScore: matchPills[idx] || 96,
        poeticReason: buildOfflineReason(p, mood, season, companion),
        dailyRhythm: buildOfflineRhythm(p, mood, season, companion),
        dishPairing: `${dish} — ${season} akşamına yakışan sıcak bir sofra eşleşmesi.`
      };
    });

    const manifesto = `${season} mevsiminde "${mood.title}" ruh hâliyle ${companion.toLowerCase()} yola çıkan seyyah için 81 il hafızasından en uyumlu 3 menzil süzüldü.`;

    return {
      manifesto,
      picks,
      isLiveAI: false,
      sourceLabel: '🧭 Seyyah Çevrimdışı Sezgi Motoru'
    };
  }

  // ---------------------------------------------------------------------------
  // AI Prompting, Execution & JSON Normalization
  // ---------------------------------------------------------------------------
  function buildCompactCandidates(candidates, mood, season, companion, normFn, limit) {
    const ordered = candidates
      .map((p) => ({ p, s: scoreProvinceForMood(p, mood, season, companion, normFn, 0) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, limit || candidates.length)
      .map((x) => x.p);

    return ordered.map((p) => {
      const dishes = (p.specialties || []).slice(0, 2).join(', ');
      const lms = (p.landmarks || []).slice(0, 2).join(', ');
      return `${formatPlate(p.plate)} ${p.name} [${p.region}] | Eser: ${lms} | Lezzet: ${dishes}`;
    }).join('\n');
  }

  function buildPromptText(candidates, mood, season, companion, normFn, previousKeys, compactMode) {
    const limit = compactMode ? 18 : Math.min(candidates.length, 45);
    const listText = buildCompactCandidates(candidates, mood, season, companion, normFn, limit);
    const avoidNames = previousKeys
      .map((k) => {
        const found = candidates.find((c) => c.key === k);
        return found ? found.name : '';
      })
      .filter(Boolean);

    const avoidLine = avoidNames.length
      ? `Önceki önerileri tekrarlama: ${avoidNames.join(', ')}.\n`
      : '';

    const prompt = [
      `Sen "Dijital Seyyah: Anadolu Seyahatnamesi"nin zarif, şiirsel ruh hâli küratörüsün.`,
      `Kullanıcı seçimi:`,
      `- Ruh Hali: ${mood.title} (${mood.promptDesc})`,
      `- Mevsim: ${season}`,
      `- Yol Arkadaşı: ${companion}`,
      avoidLine + `Aşağıdaki gerçek il havuzundan bu profille en uyumlu TAM 3 İL seç:`,
      listText,
      `Yanıtını SADECE geçerli JSON olarak ver (ekstra açıklama veya markdown kod bloğu yazma):`,
      `{"manifesto":"Ruh haline ve mevsime özel 2 cümlelik şiirsel Türkçe giriş","picks":[{"name":"İlAdı","matchScore":99,"poeticReason":"2 cümlelik şiirsel ve özgün neden","dailyRhythm":"Sabah ... Öğle ... Akşam ... günlük ritim","dishPairing":"Bu ilin gerçek yöresel yemeği ve eşleşme notu"}]}`
    ].join('\n');

    return prompt;
  }

  function extractTextFromAIResponse(res) {
    if (!res) return { text: '', source: '' };
    if (typeof res === 'string') return { text: res, source: 'window.SEYYAH_AI' };
    if (typeof res === 'object') {
      const text = res.text || res.reply || res.content || res.answer || res.output || '';
      const model = res.model || res.modelUsed || '';
      const source = res.source || (model ? `Gemini (${model})` : 'window.SEYYAH_AI');
      return { text: String(text || ''), source };
    }
    return { text: '', source: '' };
  }

  async function requestLiveAI(candidates, mood, season, companion, normFn) {
    const fullPrompt = buildPromptText(candidates, mood, season, companion, normFn, uiState.previousKeys, false);
    const systemPrompt = 'Sen Anadolu Seyahatnamesi platformunun yapay zekâ destekli ruh hâli kaşifisin. Yalnızca verilen il listesinden 3 gerçek Türkiye ili seç ve geçerli JSON döndür.';

    // 1. Primary path: window.SEYYAH_AI.ask(...)
    if (typeof window !== 'undefined' && window.SEYYAH_AI && typeof window.SEYYAH_AI.ask === 'function') {
      try {
        const aiRes = await window.SEYYAH_AI.ask(fullPrompt, {
          systemPrompt,
          systemInstruction: systemPrompt,
          temperature: 0.75,
          maxOutputTokens: 1400,
          responseMimeType: 'application/json'
        });
        const extracted = extractTextFromAIResponse(aiRes);
        if (extracted.text && extracted.text.trim()) {
          return {
            rawText: extracted.text,
            sourceLabel: `✨ ${extracted.source || 'SEYYAH_AI • Gemini Canlı'}`
          };
        }
      } catch (err) {
        // Continue to direct BYOK / proxy fallback if SEYYAH_AI threw or had no key
      }
    }

    // 2. Direct Gemini BYOK fallback (shared localStorage key across Seyyah modules)
    const byokKey = getStoredGeminiKey();
    if (byokKey) {
      const prefModel = getStoredGeminiModel();
      const models = [prefModel, ...FALLBACK_MODELS].filter((m, idx, arr) => m && arr.indexOf(m) === idx);
      let lastErr = null;

      for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(byokKey)}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.75,
              maxOutputTokens: 1400,
              responseMimeType: 'application/json'
            }
          })
        });
        const data = await res.json();
        if (!res.ok) {
          const msg = (data && data.error && data.error.message) || `HTTP ${res.status}`;
          lastErr = new Error(msg);
          if (res.status === 429 || res.status === 404 || res.status === 503 || /quota|limit|not found|high demand|no longer/i.test(msg)) {
            continue;
          }
          throw lastErr;
        }
        const reply =
          data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts
            ? data.candidates[0].content.parts.map((pt) => pt.text || '').join('\n').trim()
            : '';
        if (reply) {
          return { rawText: reply, sourceLabel: `✨ Gemini (${model} • Canlı AI)` };
        }
      }
      if (lastErr) throw lastErr;
    }

    // 3. Netlify Serverless Proxy fallback on http/https (respecting 1500 char limit)
    if (typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
      let compactPrompt = buildPromptText(candidates, mood, season, companion, normFn, uiState.previousKeys, true);
      if (compactPrompt.length > 1450) {
        compactPrompt = compactPrompt.slice(0, 1450);
      }
      const res = await fetch('/.netlify/functions/seyyah-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: compactPrompt,
          model: 'gemini-2.5-flash',
          context: `Ruh Hali: ${mood.title}, Mevsim: ${season}, Eşlikçi: ${companion}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          return {
            rawText: data.reply,
            sourceLabel: `✨ Gemini (${data.model || 'Proxy'} • Canlı API)`
          };
        }
      }
    }

    return null;
  }

  function parseJsonSafely(rawText) {
    if (!rawText) return null;
    const cleaned = String(rawText)
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      const objMatch = cleaned.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try {
          return JSON.parse(objMatch[0]);
        } catch (err2) {
          return null;
        }
      }
      const arrMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrMatch) {
        try {
          return { picks: JSON.parse(arrMatch[0]) };
        } catch (err3) {
          return null;
        }
      }
      return null;
    }
  }

  function findProvinceMatch(pick, allProvinces, preferredPool, normFn) {
    if (!pick) return null;
    const targetKey = pick.key ? String(pick.key).trim() : '';
    const targetName = pick.name || pick.city || pick.province || '';
    const normTarget = normFn(targetName);

    const searchIn = (pool) => {
      if (targetKey) {
        const byKey = pool.find((p) => p.key === targetKey);
        if (byKey) return byKey;
      }
      if (normTarget) {
        const exact = pool.find((p) => normFn(p.name) === normTarget);
        if (exact) return exact;
        const partial = pool.find((p) => normFn(p.name).includes(normTarget) || normTarget.includes(normFn(p.name)));
        if (partial) return partial;
      }
      return null;
    };

    return searchIn(preferredPool) || searchIn(allProvinces);
  }

  function normalizeAIResult(rawText, sourceLabel, allProvinces, candidates, mood, season, companion, normFn) {
    const parsed = parseJsonSafely(rawText);
    const offlineFallback = generateOfflineRecommendations(
      candidates,
      mood,
      season,
      companion,
      normFn,
      uiState.rerollCount,
      uiState.previousKeys
    );

    const rawPicks = parsed && Array.isArray(parsed.picks)
      ? parsed.picks
      : (Array.isArray(parsed) ? parsed : []);

    const finalPicks = [];
    const usedKeys = new Set();
    const defaultScores = [99, 97, 96];

    for (const item of rawPicks) {
      if (finalPicks.length >= 3) break;
      const prov = findProvinceMatch(item, allProvinces, candidates, normFn);
      if (!prov || usedKeys.has(prov.key)) continue;
      usedKeys.add(prov.key);

      const rawScore = Number(item.matchScore || item.score);
      const clampedScore = Number.isFinite(rawScore)
        ? Math.max(96, Math.min(99, Math.round(rawScore)))
        : (defaultScores[finalPicks.length] || 96);

      const fallbackDish = (prov.specialties && prov.specialties[0]) || 'Yöresel Lezzet';
      finalPicks.push({
        key: prov.key,
        province: prov,
        matchScore: clampedScore,
        poeticReason: cleanSnippet(item.poeticReason || item.reason || item.neden, 260) || buildOfflineReason(prov, mood, season, companion),
        dailyRhythm: cleanSnippet(item.dailyRhythm || item.rhythm || item.gunlukRitim, 240) || buildOfflineRhythm(prov, mood, season, companion),
        dishPairing: cleanSnippet(item.dishPairing || item.dish || item.lezzetEslesmesi, 180) || `${fallbackDish} — yöresel sofra eşleşmesi.`
      });
    }

    // If AI returned prose instead of JSON, try extracting mentioned provinces
    if (finalPicks.length === 0 && rawText) {
      const normRaw = normFn(rawText);
      for (const p of candidates) {
        if (finalPicks.length >= 3) break;
        const pn = normFn(p.name);
        if (pn.length >= 3 && new RegExp(`(^|[^a-z])${pn}([^a-z]|$)`).test(normRaw) && !usedKeys.has(p.key)) {
          usedKeys.add(p.key);
          finalPicks.push({
            key: p.key,
            province: p,
            matchScore: defaultScores[finalPicks.length] || 96,
            poeticReason: buildOfflineReason(p, mood, season, companion),
            dailyRhythm: buildOfflineRhythm(p, mood, season, companion),
            dishPairing: `${(p.specialties && p.specialties[0]) || 'Yöresel Tat'} — AI önerisiyle eşleşti.`
          });
        }
      }
    }

    // Guarantee 3 real provinces by filling any missing slots from offline scorer
    for (const offPick of offlineFallback.picks) {
      if (finalPicks.length >= 3) break;
      if (!usedKeys.has(offPick.key)) {
        usedKeys.add(offPick.key);
        finalPicks.push(offPick);
      }
    }

    // Also fill from candidates if needed
    for (const p of candidates) {
      if (finalPicks.length >= 3) break;
      if (!usedKeys.has(p.key)) {
        usedKeys.add(p.key);
        finalPicks.push({
          key: p.key,
          province: p,
          matchScore: 96,
          poeticReason: buildOfflineReason(p, mood, season, companion),
          dailyRhythm: buildOfflineRhythm(p, mood, season, companion),
          dishPairing: `${(p.specialties && p.specialties[0]) || 'Yöresel Tat'} — menzil sofrası.`
        });
      }
    }

    const manifesto = (parsed && parsed.manifesto && cleanSnippet(parsed.manifesto, 320)) ||
      offlineFallback.manifesto;

    return {
      manifesto,
      picks: finalPicks.slice(0, 3),
      isLiveAI: true,
      sourceLabel: sourceLabel || '✨ Gemini AI Canlı Analiz'
    };
  }

  // ---------------------------------------------------------------------------
  // Main Render Function
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const safeCtx = ctx || {};
    const esc = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const normFn = typeof safeCtx.normalizeTurkish === 'function' ? safeCtx.normalizeTurkish : fallbackNormalizeTurkish;
    const notify = (msg) => {
      if (typeof safeCtx.showToast === 'function') safeCtx.showToast(msg);
    };

    const allProvinces = extractProvinceList(safeCtx);
    const unvisitedProvinces = allProvinces.filter((p) => !p.visited);

    function getCandidatePool() {
      if (uiState.onlyUnvisited && unvisitedProvinces.length >= 3) {
        return unvisitedProvinces;
      }
      return allProvinces;
    }

    function hasLiveAIConfigured() {
      const hasGlobal = typeof window !== 'undefined' && window.SEYYAH_AI && typeof window.SEYYAH_AI.ask === 'function';
      const hasByok = Boolean(getStoredGeminiKey());
      return hasGlobal || hasByok;
    }

    async function runDiscovery(isReroll) {
      if (uiState.isLoading) return;
      if (allProvinces.length === 0) {
        notify('⚠️ İl verileri henüz yüklenmedi.');
        return;
      }

      if (isReroll) {
        uiState.rerollCount += 1;
      } else {
        uiState.rerollCount = 0;
        uiState.previousKeys = [];
      }

      const mood = getMoodById(uiState.moodId);
      const candidates = getCandidatePool();

      uiState.isLoading = true;
      uiState.errorMsg = '';
      renderView();

      try {
        const aiResponse = await requestLiveAI(
          candidates,
          mood,
          uiState.season,
          uiState.companion,
          normFn
        );

        if (aiResponse && aiResponse.rawText) {
          const normalized = normalizeAIResult(
            aiResponse.rawText,
            aiResponse.sourceLabel,
            allProvinces,
            candidates,
            mood,
            uiState.season,
            uiState.companion,
            normFn
          );
          uiState.result = normalized;
          uiState.previousKeys = normalized.picks.map((pk) => pk.key);
          notify('✨ Ruh hâline göre 3 menzil belirlendi!');
        } else {
          const offlineRes = generateOfflineRecommendations(
            candidates,
            mood,
            uiState.season,
            uiState.companion,
            normFn,
            uiState.rerollCount,
            uiState.previousKeys
          );
          uiState.result = offlineRes;
          uiState.previousKeys = offlineRes.picks.map((pk) => pk.key);
          notify('🧭 Çevrimdışı seyahat sezgi motoruyla 3 menzil hazırlandı!');
        }
      } catch (err) {
        const errText = (err && err.message) || 'Bağlantı hatası';
        const offlineRes = generateOfflineRecommendations(
          candidates,
          mood,
          uiState.season,
          uiState.companion,
          normFn,
          uiState.rerollCount,
          uiState.previousKeys
        );
        offlineRes.sourceLabel = `🧭 Çevrimdışı Sezgi Motoru (AI yedeklendi)`;
        uiState.result = offlineRes;
        uiState.previousKeys = offlineRes.picks.map((pk) => pk.key);
        uiState.errorMsg = errText;
        notify(`⚠️ AI yanıt vermedi (${errText}) — Çevrimdışı 3 menzil sunuldu.`);
      } finally {
        uiState.isLoading = false;
        renderView();
      }
    }

    function renderMoodCards(activeMood) {
      return MOODS.map((m) => {
        const isActive = m.id === activeMood.id;
        return `
          <button
            type="button"
            class="amd-mood-card ${isActive ? 'active' : ''}"
            data-amd-mood="${esc(m.id)}"
            style="--amd-card-accent:${esc(m.accent)}; --amd-card-tint:${esc(m.accentSoft)};"
          >
            <div class="amd-mood-top">
              <span class="amd-mood-icon-wrap">${esc(m.icon)}</span>
              <span class="amd-mood-tag">${esc(m.tag)}</span>
            </div>
            <div class="amd-mood-title">${esc(m.icon)} ${esc(m.title)}</div>
            <div class="amd-mood-desc">${esc(m.subtitle)}</div>
            <span class="amd-mood-check">✓ Seçili</span>
          </button>
        `;
      }).join('');
    }

    function renderResultsArea() {
      if (uiState.isLoading) {
        return `
          <div class="amd-loading-wrap">
            <div class="amd-loading-banner">
              <span class="amd-spinner" aria-hidden="true"></span>
              <span>Anadolu'nun 81 ili ruh hâline göre taranıyor, menziller ve lezzet eşleşmeleri dokunuyor…</span>
            </div>
            <div class="amd-skeleton-grid">
              <div class="amd-skeleton-card"></div>
              <div class="amd-skeleton-card"></div>
              <div class="amd-skeleton-card"></div>
            </div>
          </div>
        `;
      }

      if (!uiState.result) return '';

      const res = uiState.result;
      const cardsHtml = res.picks.map((pick) => {
        const p = pick.province;
        const bannerSrc = resolveBannerPath(p);
        const plateStr = formatPlate(p.plate);
        const visitedText = p.visited ? '✓ Gezildi' : '✦ Keşfedilmedi';
        return `
          <article class="amd-city-card" data-amd-card="${esc(p.key)}" tabindex="0" role="button" aria-label="${esc(p.name)} detayına git">
            <div class="amd-city-banner">
              <img
                src="${esc(bannerSrc)}"
                alt="${esc(p.name)} manzarası"
                loading="lazy"
                onerror="this.onerror=null;this.src='assets/banner.jpg';"
              >
              <div class="amd-city-banner-scrim"></div>
              <div class="amd-banner-top">
                <span class="amd-plate-badge">${esc(plateStr)}</span>
                <span class="amd-match-pill">✨ %${esc(String(pick.matchScore))} Uyum</span>
              </div>
              <div class="amd-banner-bottom">
                <div>
                  <div class="amd-city-name">${esc(p.name)}</div>
                  <div class="amd-city-region">${esc(p.region || '')} Bölgesi</div>
                </div>
                <span class="amd-visited-pill ${p.visited ? 'done' : ''}">${esc(visitedText)}</span>
              </div>
            </div>
            <div class="amd-city-body">
              <div class="amd-poetic-reason">${esc(pick.poeticReason)}</div>
              <div class="amd-detail-box">
                <span class="amd-detail-label rhythm">🕰️ İdeal Günlük Ritim</span>
                <span class="amd-detail-value">${esc(pick.dailyRhythm)}</span>
              </div>
              <div class="amd-detail-box">
                <span class="amd-detail-label">🍽️ Lezzet Eşleşmesi</span>
                <span class="amd-detail-value">${esc(pick.dishPairing)}</span>
              </div>
              <div class="amd-card-footer">
                <button type="button" class="amd-go-btn" data-amd-go="${esc(p.key)}">
                  📍 Menzile Git
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');

      return `
        <div class="amd-results-wrap">
          <div class="amd-manifesto">
            <div class="amd-manifesto-body">
              <span class="amd-source-badge ${res.isLiveAI ? '' : 'offline'}">
                ${esc(res.sourceLabel)}
              </span>
              <div class="amd-manifesto-text">“${esc(res.manifesto)}”</div>
            </div>
            <button type="button" class="amd-reroll-btn" data-amd-reroll>
              🎲 Farklı 3 Menzil
            </button>
          </div>
          <div class="amd-cards-grid">
            ${cardsHtml}
          </div>
        </div>
      `;
    }

    function renderView() {
      const activeMood = getMoodById(uiState.moodId);
      const liveConfigured = hasLiveAIConfigured();
      const candidateCount = getCandidatePool().length;
      const unvisitedWarning = uiState.onlyUnvisited && unvisitedProvinces.length < 3
        ? `<div class="amd-empty-note">Tebrikler! Gezilmemiş 3'ten az il kaldığı için (${unvisitedProvinces.length} il) tüm 81 il havuzundan öneri sunulacaktır.</div>`
        : '';

      container.innerHTML = `
        <div class="amd-shell">
          <section class="amd-hero">
            <div class="amd-hero-top">
              <div>
                <span class="amd-eyebrow">✨ Yapay Zekâ Seyahat Psikolojisi</span>
                <h2 class="amd-title">🎭 AI Ruh Hali & Kişilik Kaşifi</h2>
                <p class="amd-subtitle">
                  İçindeki yolculuk arzusunu, mevsimi ve yol arkadaşını seç; 81 ilin tarihî dokusu, kütüphaneleri ve sofraları arasından ruhuna en çok yakışan 3 Anadolu menzilini keşfet.
                </p>
              </div>
              <div class="amd-engine-pill">
                <span class="amd-engine-dot ${liveConfigured ? '' : 'offline'}"></span>
                <span>${liveConfigured ? 'Gemini AI + Çevrimdışı Sezgi' : 'Çevrimdışı Akıllı Sezgi Motoru'}</span>
              </div>
            </div>
          </section>

          <section class="amd-section">
            <div class="amd-step-head">
              <div class="amd-step-label">
                <span class="amd-step-num">1</span>
                <span>Bugünkü Seyahat Ruh Hâlini Seç</span>
              </div>
              <span class="amd-step-hint">6 atmosferden biriyle başla</span>
            </div>
            <div class="amd-mood-grid">
              ${renderMoodCards(activeMood)}
            </div>
          </section>

          <section class="amd-section">
            <div class="amd-step-head">
              <div class="amd-step-label">
                <span class="amd-step-num">2</span>
                <span>Mevsim, Yol Arkadaşı & Keşif Filtresi</span>
              </div>
              <span class="amd-step-hint">${esc(String(candidateCount))} aday il havuzda</span>
            </div>

            <div class="amd-params-grid">
              <div class="amd-param-group">
                <span class="amd-param-title">Mevsim</span>
                <div class="amd-chip-row">
                  ${SEASONS.map((s) => `
                    <button
                      type="button"
                      class="amd-chip ${uiState.season === s.id ? 'active' : ''}"
                      data-amd-season="${esc(s.id)}"
                      title="${esc(s.hint)}"
                    >
                      <span>${esc(s.icon)}</span>
                      <span>${esc(s.label)}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="amd-param-group">
                <span class="amd-param-title">Yol Arkadaşı</span>
                <div class="amd-chip-row">
                  ${COMPANIONS.map((c) => `
                    <button
                      type="button"
                      class="amd-chip ${uiState.companion === c.id ? 'active' : ''}"
                      data-amd-companion="${esc(c.id)}"
                      title="${esc(c.hint)}"
                    >
                      <span>${esc(c.icon)}</span>
                      <span>${esc(c.label)}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="amd-toggle-box">
                <label class="amd-toggle-label">
                  <span class="amd-toggle-text">
                    <span class="amd-toggle-main">Sadece Gezilmemiş İller</span>
                    <span class="amd-toggle-sub">${esc(String(unvisitedProvinces.length))} gezilmemiş / ${esc(String(allProvinces.length))} il</span>
                  </span>
                  <span class="amd-switch">
                    <input type="checkbox" data-amd-unvisited ${uiState.onlyUnvisited ? 'checked' : ''}>
                    <span class="amd-switch-track"></span>
                  </span>
                </label>
              </div>
            </div>

            ${unvisitedWarning}

            <div class="amd-action-bar">
              <div class="amd-summary-pills">
                <span>Seçili Profil:</span>
                <span class="amd-mini-pill">${esc(activeMood.icon)} ${esc(activeMood.title)}</span>
                <span class="amd-mini-pill">${esc(uiState.season)}</span>
                <span class="amd-mini-pill">${esc(uiState.companion)}</span>
                <span class="amd-mini-pill">${uiState.onlyUnvisited ? 'Sadece Gezilmemiş' : 'Tüm 81 İl'}</span>
              </div>
              <button type="button" class="amd-cta-btn" data-amd-discover ${uiState.isLoading ? 'disabled' : ''}>
                ${uiState.isLoading ? '⏳ Menziller Aranıyor…' : '✨ Ruh Halime Göre 3 Menzil Bul'}
              </button>
            </div>
          </section>

          ${renderResultsArea()}
        </div>
      `;

      bindEvents();
    }

    function navigateToCity(key) {
      if (key && typeof safeCtx.selectCity === 'function') {
        safeCtx.selectCity(key);
      }
    }

    function bindEvents() {
      container.querySelectorAll('[data-amd-mood]').forEach((btn) => {
        btn.addEventListener('click', () => {
          uiState.moodId = btn.getAttribute('data-amd-mood');
          renderView();
        });
      });

      container.querySelectorAll('[data-amd-season]').forEach((btn) => {
        btn.addEventListener('click', () => {
          uiState.season = btn.getAttribute('data-amd-season');
          renderView();
        });
      });

      container.querySelectorAll('[data-amd-companion]').forEach((btn) => {
        btn.addEventListener('click', () => {
          uiState.companion = btn.getAttribute('data-amd-companion');
          renderView();
        });
      });

      const unvisitedCheckbox = container.querySelector('[data-amd-unvisited]');
      if (unvisitedCheckbox) {
        unvisitedCheckbox.addEventListener('change', (e) => {
          uiState.onlyUnvisited = Boolean(e.target.checked);
          renderView();
        });
      }

      const discoverBtn = container.querySelector('[data-amd-discover]');
      if (discoverBtn) {
        discoverBtn.addEventListener('click', () => {
          runDiscovery(false);
        });
      }

      const rerollBtn = container.querySelector('[data-amd-reroll]');
      if (rerollBtn) {
        rerollBtn.addEventListener('click', () => {
          runDiscovery(true);
        });
      }

      container.querySelectorAll('[data-amd-go]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const key = btn.getAttribute('data-amd-go');
          navigateToCity(key);
        });
      });

      container.querySelectorAll('[data-amd-card]').forEach((card) => {
        card.addEventListener('click', () => {
          const key = card.getAttribute('data-amd-card');
          navigateToCity(key);
        });
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const key = card.getAttribute('data-amd-card');
            navigateToCity(key);
          }
        });
      });
    }

    renderView();
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.aiMood = { render };
})();
