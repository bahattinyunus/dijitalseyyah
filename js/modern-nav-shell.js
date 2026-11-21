/**
 * Anadolu Seyahatnamesi — Modern 6-Group Categorized Mega-Navigation Shell
 * Transforms the flat .module-nav-strip into a SaaS-grade categorized navigation
 * bar with floating glassmorphic dropdown portals, AI badge highlighting,
 * keyboard navigation, and active view/hash synchronization.
 *
 * Registers on: window.SEYYAH_MODULES.modernNav = { init(ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-modern-nav-styles';
  const PORTAL_ID = 'mnav-dropdown-portal';

  const NAV_GROUPS = [
    {
      id: 'kesif',
      icon: '🏠',
      label: 'Keşif',
      accent: 'cyan',
      items: [
        { view: 'dashboard', icon: '🏠', title: 'Genel Bakış', subtitle: 'Anadolu seyahat özet paneli' },
        { view: 'atlas', icon: '🗺️', title: 'Vektör Atlas', subtitle: 'Etkileşimli 81 il haritası' },
        { view: 'regions', icon: '🌍', title: '7 Bölge', subtitle: 'Coğrafi bölge keşif dosyaları' },
        { view: 'photoWall', icon: '🖼️', title: '162 Mozaik', subtitle: 'Tüm illerin fotoğraf duvarı' },
        { view: 'gallery', icon: '📸', title: 'Galeri', subtitle: 'Yüksek çözünürlüklü şehir kareleri' },
        { view: 'cinematicTour', icon: '🎬', title: 'Sinematik Tur', subtitle: 'Otomatik görsel Anadolu yolculuğu' }
      ]
    },
    {
      id: 'yapay-zeka',
      icon: '✨',
      label: 'Yapay Zekâ',
      isAi: true,
      badge: 'AI',
      accent: 'ai',
      items: [
        { view: 'advisor', icon: '🧭', title: 'Akıllı Seyyah Rehberi', subtitle: 'Kişisel yapay zekâ danışmanı' },
        { view: 'aiPlanner', icon: '🧠', title: 'AI Sefer Mühendisi', subtitle: 'Akıllı rota ve gün planı' },
        { view: 'aiMood', icon: '🎭', title: 'AI Ruh Hali Kaşifi', subtitle: 'Moduna göre şehir önerisi' },
        { view: 'aiWriter', icon: '✍️', title: 'AI Seyahatname Yazarı', subtitle: 'Edebi gezi anısı oluşturucu' },
        { view: 'aiBattle', icon: '⚔️', title: 'AI Şehir Düellosu', subtitle: 'İki şehrin yapay zekâ kapışması' },
        { view: 'aiQuiz', icon: '🧩', title: 'AI Kültür Yarışması', subtitle: 'Yapay zekâ destekli tarih testi' },
        { view: 'aiChef', icon: '👨‍🍳', title: 'AI Gurme Şef', subtitle: 'Yöresel mutfak ve lezzet rehberi' },
        { view: 'aiSearch', icon: '🔮', title: 'AI Akıllı Arama', subtitle: 'Anlamsal kültür ve rota arama' }
      ]
    },
    {
      id: 'rota-plan',
      icon: '🧭',
      label: 'Rota & Plan',
      accent: 'emerald',
      items: [
        { view: 'route', icon: '🧭', title: 'Rota & GPX', subtitle: 'Mesafe hesapla ve GPX indir' },
        { view: 'radar', icon: '📡', title: 'Menzil Radarı', subtitle: 'Konumuna yakın şehirleri keşfet' },
        { view: 'bucketList', icon: '🎯', title: 'Bucket List', subtitle: 'Gezilecek hayal hedeflerini yönet' },
        { view: 'budget', icon: '💰', title: 'Bütçe', subtitle: 'Seyahat masraf ve harcama planı' },
        { view: 'packing', icon: '🎒', title: 'Sırt Çantası', subtitle: 'Akıllı bavul ve ekipman listesi' },
        { view: 'seasons', icon: '🌤️', title: 'Mevsimler', subtitle: 'İklim ve en iyi zamanlama' }
      ]
    },
    {
      id: 'kultur-miras',
      icon: '🏛️',
      label: 'Kültür & Miras',
      accent: 'gold',
      items: [
        { view: 'unesco', icon: '🏛️', title: 'UNESCO 21', subtitle: 'Dünya mirası listesi alanları' },
        { view: 'landmarks', icon: '🕌', title: 'Miras 373', subtitle: 'Tarihi eser ve anıt arşivi' },
        { view: 'timeline', icon: '⏳', title: 'Kronoloji', subtitle: 'Çağlar boyu Anadolu tarih şeridi' },
        { view: 'gastronomy', icon: '🍽️', title: 'Lezzetler', subtitle: '81 ilin yöresel mutfak atlası' },
        { view: 'libraries', icon: '📚', title: 'Kütüphaneler', subtitle: 'Tarihi ve modern kültür kütüphaneleri' },
        { view: 'reader', icon: '📖', title: 'Makaleler', subtitle: 'Kültür ve seyahat okuma köşesi' }
      ]
    },
    {
      id: 'studyo-odak',
      icon: '🎮',
      label: 'Stüdyo & Odak',
      accent: 'purple',
      items: [
        { view: 'pomodoro', icon: '🍅', title: 'Kütüphane Pomodoro', subtitle: 'Okuma ve odaklanma zamanlayıcısı' },
        { view: 'passport', icon: '🛂', title: 'Pasaport', subtitle: 'Dijital seyyah damga ve vize' },
        { view: 'postcard', icon: '📮', title: 'Kartpostal', subtitle: 'Özel şehir kartpostalı tasarla' },
        { view: 'sound', icon: '🎧', title: 'Ses Stüdyosu', subtitle: 'Doğa ve şehir ortam sesleri' },
        { view: 'quiz', icon: '🏆', title: 'Bilgi Yarışması', subtitle: '81 il kültür bilgi testi' },
        { view: 'distanceGame', icon: '🎮', title: 'Mesafe Düellosu', subtitle: 'Şehirler arası mesafe tahmin oyunu' }
      ]
    },
    {
      id: 'analiz-defter',
      icon: '📊',
      label: 'Analiz & Defter',
      accent: 'blue',
      items: [
        { view: 'deepStats', icon: '📈', title: 'İleri Analitik', subtitle: 'Bölge ve keşif yoğunluk grafikleri' },
        { view: 'analytics', icon: '📊', title: '81 Plaka', subtitle: 'Tüm illerin plaka tamamlama matrisi' },
        { view: 'achievements', icon: '🎖️', title: 'Rütbe & Başarımlar', subtitle: 'Rozetler, seviye ve seyyah rütben' },
        { view: 'journal', icon: '📝', title: 'Seyir Defterim', subtitle: 'Kişisel gezi notları ve anılar' },
        { view: 'compare', icon: '⚖️', title: 'Şehir Karşılaştır', subtitle: 'İki ili yan yana kıyasla' }
      ]
    }
  ];

  // Fast lookup: view -> group
  const VIEW_TO_GROUP = new Map();
  NAV_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      VIEW_TO_GROUP.set(item.view, group);
    });
  });

  let _ctx = null;
  let _navEl = null;
  let _portalEl = null;
  let _openGroupId = null;
  let _viewportObserver = null;
  let _syncRaf = 0;
  let _cleanupFns = [];

  function esc(str) {
    if (_ctx && typeof _ctx.escapeHtml === 'function') {
      return _ctx.escapeHtml(str);
    }
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeViewName(viewName) {
    if (!viewName) return '';
    return viewName === 'library' ? 'libraries' : String(viewName);
  }

  function getCurrentView() {
    const stateView = _ctx && _ctx.state && _ctx.state.currentView;
    if (stateView) return normalizeViewName(stateView);
    const h = (window.location.hash || '').trim();
    if (h && !h.startsWith('#city/')) {
      return normalizeViewName(h.slice(1));
    }
    return '';
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* ------------------------------------------------------------------
         MODERN 6-GROUP MEGA-NAVIGATION SHELL
         ------------------------------------------------------------------ */
      nav.module-nav-strip.mnav-strip {
        display: flex;
        align-items: center;
        padding: 9px 20px;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        -webkit-mask-image: none;
        mask-image: none;
        gap: 0;
      }

      nav.module-nav-strip.mnav-strip::-webkit-scrollbar {
        display: none;
      }

      .mnav-track {
        display: flex;
        align-items: center;
        gap: 8px;
        width: max-content;
        margin-inline: auto;
      }

      .mnav-trigger {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 7px 14px;
        border-radius: 9999px;
        background: rgba(20, 29, 49, 0.62);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-secondary, #94a3b8);
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.83rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        white-space: nowrap;
        flex-shrink: 0;
        cursor: pointer;
        user-select: none;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
        transition:
          background 0.2s ease,
          border-color 0.2s ease,
          color 0.2s ease,
          transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 0.22s ease;
      }

      .mnav-trigger:hover {
        background: rgba(30, 41, 59, 0.88);
        border-color: rgba(0, 242, 254, 0.38);
        color: var(--text-primary, #f8fafc);
        transform: translateY(-1px);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.14),
          0 6px 18px -6px rgba(0, 242, 254, 0.24);
      }

      .mnav-trigger:focus-visible {
        outline: 2px solid var(--accent-cyan, #00f2fe);
        outline-offset: 2px;
      }

      .mnav-trigger.is-open {
        background: rgba(28, 40, 66, 0.94);
        border-color: rgba(0, 242, 254, 0.55);
        color: #ffffff;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.18),
          0 8px 22px -6px rgba(0, 242, 254, 0.28);
      }

      .mnav-trigger.is-active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(79, 172, 254, 0.22) 100%);
        border-color: rgba(0, 242, 254, 0.65);
        color: #ffffff;
        box-shadow:
          0 0 18px rgba(0, 242, 254, 0.22),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      /* Highlighted Yapay Zekâ Trigger & Badge */
      .mnav-trigger.is-ai {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.11) 0%, rgba(168, 85, 247, 0.16) 100%);
        border-color: rgba(168, 85, 247, 0.36);
        color: #e2e8f0;
      }

      .mnav-trigger.is-ai:hover,
      .mnav-trigger.is-ai.is-open {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(168, 85, 247, 0.26) 100%);
        border-color: rgba(0, 242, 254, 0.62);
        color: #ffffff;
        box-shadow:
          0 0 22px rgba(168, 85, 247, 0.26),
          0 0 14px rgba(0, 242, 254, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .mnav-trigger.is-ai.is-active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.26) 0%, rgba(168, 85, 247, 0.32) 100%);
        border-color: rgba(0, 242, 254, 0.78);
        color: #ffffff;
        box-shadow:
          0 0 24px rgba(168, 85, 247, 0.3),
          0 0 16px rgba(0, 242, 254, 0.26),
          inset 0 1px 0 rgba(255, 255, 255, 0.24);
      }

      .mnav-ai-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 1px 6px;
        border-radius: 9999px;
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        line-height: 1.35;
        color: #ffffff;
        background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
        box-shadow: 0 0 10px rgba(139, 92, 246, 0.45);
      }

      .mnav-trigger-icon {
        font-size: 0.95rem;
        line-height: 1;
      }

      .mnav-active-dot {
        width: 6px;
        height: 6px;
        border-radius: 9999px;
        background: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 8px rgba(0, 242, 254, 0.85);
        display: none;
        flex-shrink: 0;
      }

      .mnav-trigger.is-active .mnav-active-dot {
        display: inline-block;
      }

      .mnav-chevron {
        width: 13px;
        height: 13px;
        opacity: 0.7;
        transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
        flex-shrink: 0;
      }

      .mnav-trigger:hover .mnav-chevron,
      .mnav-trigger.is-open .mnav-chevron {
        opacity: 1;
      }

      .mnav-trigger.is-open .mnav-chevron {
        transform: rotate(180deg);
      }

      /* ------------------------------------------------------------------
         FLOATING GLASSMORPHIC DROPDOWN PORTAL (NEVER CLIPPED BY OVERFLOW)
         ------------------------------------------------------------------ */
      #${PORTAL_ID} {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 2950;
        width: min(544px, calc(100vw - 24px));
        max-height: calc(100vh - 124px);
        overflow-y: auto;
        padding: 12px;
        border-radius: 16px;
        background: rgba(10, 16, 31, 0.93);
        backdrop-filter: blur(26px) saturate(170%);
        -webkit-backdrop-filter: blur(26px) saturate(170%);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow:
          0 24px 56px -12px rgba(0, 0, 0, 0.82),
          0 0 0 1px rgba(0, 242, 254, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.14);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateY(-6px) scale(0.985);
        transform-origin: top left;
        transition:
          opacity 0.17s ease,
          transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
          visibility 0.17s ease;
      }

      #${PORTAL_ID}.is-open {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateY(0) scale(1);
      }

      #${PORTAL_ID}.is-ai-panel {
        border-color: rgba(168, 85, 247, 0.32);
        box-shadow:
          0 24px 56px -12px rgba(0, 0, 0, 0.84),
          0 0 28px -6px rgba(139, 92, 246, 0.28),
          0 0 0 1px rgba(0, 242, 254, 0.14),
          inset 0 1px 0 rgba(255, 255, 255, 0.16);
      }

      .mnav-portal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 2px 6px 10px;
        margin-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .mnav-portal-title-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.84rem;
        font-weight: 700;
        color: #f8fafc;
        letter-spacing: 0.01em;
      }

      .mnav-portal-count {
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--text-secondary, #94a3b8);
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 2px 8px;
        border-radius: 9999px;
        white-space: nowrap;
      }

      .mnav-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
      }

      .mnav-item {
        display: flex;
        align-items: center;
        gap: 11px;
        width: 100%;
        padding: 9px 10px;
        border-radius: 11px;
        background: rgba(255, 255, 255, 0.025);
        border: 1px solid transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
        transition:
          background 0.16s ease,
          border-color 0.16s ease,
          transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 0.18s ease;
      }

      .mnav-item:hover,
      .mnav-item:focus-visible {
        background: rgba(255, 255, 255, 0.07);
        border-color: rgba(0, 242, 254, 0.35);
        transform: translateY(-1px);
        outline: none;
        box-shadow: 0 6px 16px -8px rgba(0, 242, 254, 0.32);
      }

      #${PORTAL_ID}.is-ai-panel .mnav-item:hover,
      #${PORTAL_ID}.is-ai-panel .mnav-item:focus-visible {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.09) 0%, rgba(168, 85, 247, 0.12) 100%);
        border-color: rgba(168, 85, 247, 0.45);
      }

      .mnav-item.is-active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.16) 0%, rgba(79, 172, 254, 0.14) 100%);
        border-color: rgba(0, 242, 254, 0.55);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
      }

      #${PORTAL_ID}.is-ai-panel .mnav-item.is-active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.18) 0%, rgba(168, 85, 247, 0.22) 100%);
        border-color: rgba(168, 85, 247, 0.62);
      }

      .mnav-item-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.08rem;
        flex-shrink: 0;
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.09);
        transition: transform 0.18s ease, border-color 0.18s ease;
      }

      .mnav-item:hover .mnav-item-icon {
        transform: scale(1.06);
        border-color: rgba(0, 242, 254, 0.42);
      }

      .mnav-item-body {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .mnav-item-title-row {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }

      .mnav-item-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.84rem;
        font-weight: 600;
        color: #f8fafc;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .mnav-item-active-pill {
        font-size: 0.6rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 1px 5px;
        border-radius: 9999px;
        background: rgba(0, 242, 254, 0.18);
        border: 1px solid rgba(0, 242, 254, 0.45);
        color: #67e8f9;
        flex-shrink: 0;
      }

      .mnav-item-sub {
        font-size: 0.72rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ------------------------------------------------------------------
         LIGHT THEME (body.light-theme) OVERRIDES
         ------------------------------------------------------------------ */
      body.light-theme .mnav-trigger {
        background: rgba(241, 245, 249, 0.9);
        border-color: rgba(15, 23, 42, 0.11);
        color: #334155;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
      }

      body.light-theme .mnav-trigger:hover {
        background: #ffffff;
        border-color: rgba(2, 132, 199, 0.45);
        color: #0f172a;
        box-shadow: 0 6px 16px -6px rgba(2, 132, 199, 0.18);
      }

      body.light-theme .mnav-trigger.is-open {
        background: #ffffff;
        border-color: #0284c7;
        color: #0f172a;
        box-shadow: 0 8px 20px -6px rgba(2, 132, 199, 0.22);
      }

      body.light-theme .mnav-trigger.is-active {
        background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
        border-color: #0284c7;
        color: #ffffff;
        box-shadow: 0 6px 16px -4px rgba(2, 132, 199, 0.34);
      }

      body.light-theme .mnav-trigger.is-active .mnav-active-dot {
        background: #ffffff;
        box-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
      }

      body.light-theme .mnav-trigger.is-ai {
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(124, 58, 237, 0.12) 100%);
        border-color: rgba(124, 58, 237, 0.28);
        color: #1e293b;
      }

      body.light-theme .mnav-trigger.is-ai:hover,
      body.light-theme .mnav-trigger.is-ai.is-open {
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.18) 0%, rgba(124, 58, 237, 0.2) 100%);
        border-color: rgba(124, 58, 237, 0.5);
        color: #0f172a;
      }

      body.light-theme .mnav-trigger.is-ai.is-active {
        background: linear-gradient(135deg, #0284c7 0%, #7c3aed 100%);
        border-color: #6d28d9;
        color: #ffffff;
        box-shadow: 0 6px 18px -4px rgba(124, 58, 237, 0.35);
      }

      body.light-theme #${PORTAL_ID} {
        background: rgba(255, 255, 255, 0.96);
        border-color: rgba(15, 23, 42, 0.11);
        box-shadow:
          0 22px 48px -12px rgba(15, 23, 42, 0.18),
          0 0 0 1px rgba(2, 132, 199, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 1);
      }

      body.light-theme #${PORTAL_ID}.is-ai-panel {
        border-color: rgba(124, 58, 237, 0.26);
        box-shadow:
          0 22px 48px -12px rgba(15, 23, 42, 0.18),
          0 0 24px -8px rgba(124, 58, 237, 0.22);
      }

      body.light-theme .mnav-portal-head {
        border-bottom-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .mnav-portal-title-wrap {
        color: #0f172a;
      }

      body.light-theme .mnav-portal-count {
        color: #475569;
        background: #f1f5f9;
        border-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .mnav-item {
        background: rgba(248, 250, 252, 0.72);
      }

      body.light-theme .mnav-item:hover,
      body.light-theme .mnav-item:focus-visible {
        background: #f1f5f9;
        border-color: rgba(2, 132, 199, 0.42);
        box-shadow: 0 6px 14px -8px rgba(2, 132, 199, 0.22);
      }

      body.light-theme #${PORTAL_ID}.is-ai-panel .mnav-item:hover,
      body.light-theme #${PORTAL_ID}.is-ai-panel .mnav-item:focus-visible {
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(124, 58, 237, 0.09) 100%);
        border-color: rgba(124, 58, 237, 0.4);
      }

      body.light-theme .mnav-item.is-active {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(37, 99, 235, 0.1) 100%);
        border-color: rgba(2, 132, 199, 0.48);
      }

      body.light-theme .mnav-item-icon {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.09);
        box-shadow: 0 2px 6px -2px rgba(15, 23, 42, 0.08);
      }

      body.light-theme .mnav-item-title {
        color: #0f172a;
      }

      body.light-theme .mnav-item-active-pill {
        background: rgba(2, 132, 199, 0.12);
        border-color: rgba(2, 132, 199, 0.35);
        color: #0369a1;
      }

      body.light-theme .mnav-item-sub {
        color: #475569;
      }

      /* ------------------------------------------------------------------
         MOBILE & RESPONSIVE POLISH
         ------------------------------------------------------------------ */
      @media (max-width: 768px) {
        nav.module-nav-strip.mnav-strip {
          padding: 8px 12px;
        }

        .mnav-track {
          gap: 6px;
        }

        .mnav-trigger {
          padding: 6px 11px;
          font-size: 0.78rem;
          gap: 5px;
        }
      }

      @media (max-width: 560px) {
        #${PORTAL_ID} {
          width: calc(100vw - 20px);
          padding: 10px;
          max-height: min(68vh, 460px);
        }

        .mnav-grid {
          grid-template-columns: 1fr;
        }
      }

      @media print {
        #${PORTAL_ID} {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderNavTriggers() {
    if (!_navEl) return;
    _navEl.classList.add('mnav-strip');

    const chevronSvg = `
      <svg class="mnav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;

    const triggersHtml = NAV_GROUPS.map((group) => {
      const aiClass = group.isAi ? ' is-ai' : '';
      const aiBadge = group.isAi ? `<span class="mnav-ai-badge">${esc(group.badge || 'AI')}</span>` : '';
      return `
        <button
          type="button"
          class="mnav-trigger${aiClass}"
          data-mnav-group="${esc(group.id)}"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls="${PORTAL_ID}"
        >
          <span class="mnav-trigger-icon" aria-hidden="true">${esc(group.icon)}</span>
          <span class="mnav-trigger-label">${esc(group.label)}</span>
          ${aiBadge}
          <span class="mnav-active-dot" aria-hidden="true"></span>
          ${chevronSvg}
        </button>
      `;
    }).join('');

    _navEl.innerHTML = `<div class="mnav-track" role="menubar" aria-label="Kategori Menüleri">${triggersHtml}</div>`;
  }

  function ensurePortal() {
    const existing = document.getElementById(PORTAL_ID);
    if (existing) {
      _portalEl = existing;
      return _portalEl;
    }
    const portal = document.createElement('div');
    portal.id = PORTAL_ID;
    portal.setAttribute('role', 'menu');
    portal.setAttribute('aria-hidden', 'true');
    document.body.appendChild(portal);
    _portalEl = portal;
    return _portalEl;
  }

  function positionPortal(triggerBtn) {
    if (!_portalEl || !triggerBtn) return;
    const rect = triggerBtn.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth || 1024;
    const vh = window.innerHeight || document.documentElement.clientHeight || 768;

    const panelWidth = _portalEl.offsetWidth || Math.min(544, vw - 24);
    const margin = 12;
    let left = rect.left;
    if (left + panelWidth > vw - margin) {
      left = vw - panelWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    let top = rect.bottom + 8;
    const panelHeight = _portalEl.offsetHeight || 280;
    if (top + panelHeight > vh - margin && rect.top > panelHeight + margin) {
      top = Math.max(margin, rect.top - panelHeight - 8);
    }

    _portalEl.style.left = `${Math.round(left)}px`;
    _portalEl.style.top = `${Math.round(top)}px`;
  }

  function renderPortalContent(group) {
    if (!_portalEl || !group) return;
    const currentView = getCurrentView();
    const countText = group.isAi ? `${group.items.length} AI Modülü` : `${group.items.length} Modül`;

    const itemsHtml = group.items.map((item) => {
      const isActive = currentView === item.view;
      return `
        <button
          type="button"
          class="mnav-item${isActive ? ' is-active' : ''}"
          role="menuitem"
          data-mnav-view="${esc(item.view)}"
          ${isActive ? 'aria-current="page"' : ''}
        >
          <span class="mnav-item-icon" aria-hidden="true">${esc(item.icon)}</span>
          <span class="mnav-item-body">
            <span class="mnav-item-title-row">
              <span class="mnav-item-title">${esc(item.title)}</span>
              ${isActive ? '<span class="mnav-item-active-pill">Aktif</span>' : ''}
            </span>
            <span class="mnav-item-sub">${esc(item.subtitle)}</span>
          </span>
        </button>
      `;
    }).join('');

    _portalEl.classList.toggle('is-ai-panel', Boolean(group.isAi));
    _portalEl.setAttribute('aria-label', `${group.label} Menüsü`);
    _portalEl.innerHTML = `
      <div class="mnav-portal-head">
        <div class="mnav-portal-title-wrap">
          <span aria-hidden="true">${esc(group.icon)}</span>
          <span>${esc(group.label)}</span>
          ${group.isAi ? `<span class="mnav-ai-badge">${esc(group.badge || 'AI')}</span>` : ''}
        </div>
        <span class="mnav-portal-count">${esc(countText)}</span>
      </div>
      <div class="mnav-grid">${itemsHtml}</div>
    `;
  }

  function openGroup(groupId, triggerBtn) {
    const group = NAV_GROUPS.find((g) => g.id === groupId);
    if (!group || !_portalEl) return;

    _openGroupId = groupId;
    renderPortalContent(group);

    if (_navEl) {
      _navEl.querySelectorAll('.mnav-trigger').forEach((btn) => {
        const isCurrent = btn.getAttribute('data-mnav-group') === groupId;
        btn.classList.toggle('is-open', isCurrent);
        btn.setAttribute('aria-expanded', isCurrent ? 'true' : 'false');
      });
    }

    _portalEl.setAttribute('aria-hidden', 'false');
    _portalEl.classList.add('is-open');
    positionPortal(triggerBtn);
  }

  function closeDropdown(restoreFocus = false) {
    if (!_openGroupId) return;
    const prevGroupId = _openGroupId;
    _openGroupId = null;

    if (_portalEl) {
      _portalEl.classList.remove('is-open');
      _portalEl.setAttribute('aria-hidden', 'true');
    }

    if (_navEl) {
      _navEl.querySelectorAll('.mnav-trigger').forEach((btn) => {
        btn.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        if (restoreFocus && btn.getAttribute('data-mnav-group') === prevGroupId) {
          btn.focus();
        }
      });
    }
  }

  function syncActiveCategory() {
    if (!_navEl) return;
    const activeView = getCurrentView();
    const activeGroup = VIEW_TO_GROUP.get(activeView) || null;
    const activeGroupId = activeGroup ? activeGroup.id : null;

    _navEl.querySelectorAll('.mnav-trigger').forEach((btn) => {
      const gid = btn.getAttribute('data-mnav-group');
      btn.classList.toggle('is-active', gid === activeGroupId);
    });

    if (_openGroupId && _portalEl && _portalEl.classList.contains('is-open')) {
      const openGroupObj = NAV_GROUPS.find((g) => g.id === _openGroupId);
      if (openGroupObj) {
        renderPortalContent(openGroupObj);
      }
    }
  }

  function scheduleSync() {
    if (_syncRaf) cancelAnimationFrame(_syncRaf);
    _syncRaf = requestAnimationFrame(() => {
      _syncRaf = 0;
      syncActiveCategory();
    });
  }

  function moveFocusInTriggers(currentBtn, dir) {
    if (!_navEl) return;
    const triggers = Array.from(_navEl.querySelectorAll('.mnav-trigger'));
    const idx = triggers.indexOf(currentBtn);
    if (idx === -1 || !triggers.length) return;
    const next = triggers[(idx + dir + triggers.length) % triggers.length];
    if (next) {
      next.focus();
      if (_openGroupId) {
        openGroup(next.getAttribute('data-mnav-group'), next);
      }
    }
  }

  function bindEvents() {
    if (!_navEl || !_portalEl) return;

    const onNavClick = (e) => {
      const trigger = e.target.closest('.mnav-trigger');
      if (!trigger || !_navEl.contains(trigger)) return;
      e.stopPropagation();
      const groupId = trigger.getAttribute('data-mnav-group');
      if (_openGroupId === groupId) {
        closeDropdown(false);
      } else {
        openGroup(groupId, trigger);
      }
    };

    const onNavKeyDown = (e) => {
      const trigger = e.target.closest('.mnav-trigger');
      if (!trigger) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveFocusInTriggers(trigger, 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveFocusInTriggers(trigger, -1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const groupId = trigger.getAttribute('data-mnav-group');
        if (_openGroupId !== groupId) {
          openGroup(groupId, trigger);
        }
        const firstItem = _portalEl.querySelector('.mnav-item');
        if (firstItem) firstItem.focus();
      }
    };

    const onPortalClick = (e) => {
      const itemBtn = e.target.closest('.mnav-item[data-mnav-view]');
      if (!itemBtn) return;
      const view = itemBtn.getAttribute('data-mnav-view');
      closeDropdown(false);
      if (view && _ctx && typeof _ctx.openView === 'function') {
        _ctx.openView(view);
      }
      scheduleSync();
    };

    const onPortalKeyDown = (e) => {
      if (!_openGroupId) return;
      const items = Array.from(_portalEl.querySelectorAll('.mnav-item'));
      if (!items.length) return;
      const idx = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        items[(idx + 1) % items.length].focus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1].focus();
      }
    };

    const onDocClick = (e) => {
      if (!_openGroupId) return;
      if (_portalEl.contains(e.target)) return;
      if (e.target.closest('.mnav-trigger') && _navEl.contains(e.target)) return;
      closeDropdown(false);
    };

    const onDocKeyDown = (e) => {
      if (e.key === 'Escape' && _openGroupId) {
        const focusInsidePortal = _portalEl.contains(document.activeElement);
        closeDropdown(focusInsidePortal);
      }
    };

    const onReposition = () => {
      if (!_openGroupId || !_navEl) return;
      const activeTrigger = _navEl.querySelector(`.mnav-trigger[data-mnav-group="${_openGroupId}"]`);
      if (activeTrigger) positionPortal(activeTrigger);
    };

    const onHashChange = () => {
      closeDropdown(false);
      scheduleSync();
    };

    _navEl.addEventListener('click', onNavClick);
    _navEl.addEventListener('keydown', onNavKeyDown);
    _navEl.addEventListener('scroll', onReposition, { passive: true });
    _portalEl.addEventListener('click', onPortalClick);
    _portalEl.addEventListener('keydown', onPortalKeyDown);
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKeyDown);
    window.addEventListener('resize', onReposition);
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onHashChange);

    // Observe #viewport-content mutations so programmatic ctx.openView() calls
    // from command palette, quick dock, or dashboard cards keep the active pill synced.
    const viewport = document.getElementById('viewport-content');
    if (viewport && typeof MutationObserver === 'function') {
      _viewportObserver = new MutationObserver(scheduleSync);
      _viewportObserver.observe(viewport, { childList: true });
    }

    _cleanupFns.push(() => {
      _navEl.removeEventListener('click', onNavClick);
      _navEl.removeEventListener('keydown', onNavKeyDown);
      _navEl.removeEventListener('scroll', onReposition);
      _portalEl.removeEventListener('click', onPortalClick);
      _portalEl.removeEventListener('keydown', onPortalKeyDown);
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onDocKeyDown);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onHashChange);
      if (_viewportObserver) {
        _viewportObserver.disconnect();
        _viewportObserver = null;
      }
    });
  }

  function cleanup() {
    closeDropdown(false);
    if (_syncRaf) {
      cancelAnimationFrame(_syncRaf);
      _syncRaf = 0;
    }
    _cleanupFns.forEach((fn) => {
      try { fn(); } catch (_) { /* noop */ }
    });
    _cleanupFns = [];
  }

  function init(ctx) {
    cleanup();
    _ctx = ctx || null;

    const navEl = document.querySelector('nav.module-nav-strip');
    if (!navEl) return;
    _navEl = navEl;

    injectStyles();
    renderNavTriggers();
    ensurePortal();
    bindEvents();
    syncActiveCategory();
  }

  window.SEYYAH_MODULES.modernNav = {
    init
  };
})();
