/**
 * Dijital Seyyah — Günün Keşif Menzili & Sıradaki Hedef (js/daily-hikmet-banner.js)
 * Registers on: window.SEYYAH_MODULES.dailySpotlight = { init(ctx) }
 *
 * Features:
 *   1. MutationObserver on #viewport-content (plus immediate check on init):
 *      Mounts .daily-spotlight-card right after .anadolu-stories-bar (or at the top
 *      of #viewport-content) whenever ctx.state.currentView === 'dashboard'.
 *   2. Deterministic YYYY-MM-DD hash selection across unvisited provinces so the
 *      featured province stays consistent all day and refreshes automatically at midnight.
 *   3. Displays banner.jpg thumbnail, plate badge, region, quote, first landmark,
 *      Haversine distance from Ankara (km), and next-milestone progress bar.
 *   4. Quick actions: "📍 Menzili İncele", "🧠 AI ile Planla", "🎲 Başka Menzil Öner".
 *   5. Scoped CSS supporting both Dark Obsidian and Light (Alabaster) themes.
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-daily-spotlight-styles';
  const CARD_CLASS = 'daily-spotlight-card';
  const FALLBACK_ANKARA = { lat: 39.9334, lng: 32.8597 };
  const MILESTONES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 81];

  let activeCtx = null;
  let viewportObserver = null;
  let midnightTimerId = null;
  let lastDateKey = '';
  let cycleOffset = 0;

  // =========================================================================
  // Helpers
  // =========================================================================

  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function esc(str) {
    if (activeCtx && typeof activeCtx.escapeHtml === 'function') {
      return activeCtx.escapeHtml(str);
    }
    return fallbackEscapeHtml(str);
  }

  function fallbackNormalizeTr(str) {
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

  function norm(str) {
    if (activeCtx && typeof activeCtx.normalizeTurkish === 'function') {
      return activeCtx.normalizeTurkish(str);
    }
    return fallbackNormalizeTr(str);
  }

  function getTodayDateKey() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatTurkishDate(dateKey) {
    const parts = String(dateKey || '').split('-');
    if (parts.length !== 3) return dateKey;
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const day = Number(parts[2]);
    const monthIdx = Number(parts[1]) - 1;
    const year = parts[0];
    const monthName = months[monthIdx] || parts[1];
    return `${day} ${monthName} ${year}`;
  }

  function hashDateKey(dateStr) {
    let h = 2166136261;
    for (let i = 0; i < dateStr.length; i += 1) {
      h ^= dateStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    if (activeCtx && typeof activeCtx.calcDistKm === 'function') {
      return activeCtx.calcDistKm(lat1, lon1, lat2, lon2);
    }
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

  function formatPlate(plate) {
    const num = Number(plate);
    if (!Number.isFinite(num) || num <= 0) return '00';
    return String(num).padStart(2, '0');
  }

  function getBannerUrl(key, province) {
    if (!province) return 'assets/banner.jpg';
    if (province.banner_rel) return province.banner_rel;
    if (Array.isArray(province.images) && province.images[0]) return province.images[0];
    if (province.has_banner && key) return `${key}/banner.jpg`;
    return 'assets/banner.jpg';
  }

  function getFirstLandmark(province) {
    if (!province || !Array.isArray(province.landmarks) || !province.landmarks.length) {
      return 'Tarihi Şehir Merkezi';
    }
    const first = province.landmarks[0];
    if (typeof first === 'string') return first;
    if (first && typeof first.name === 'string') return first.name;
    return 'Tarihi Şehir Merkezi';
  }

  function getAnkaraCoords(provinces) {
    if (provinces) {
      for (const p of Object.values(provinces)) {
        if (p && (Number(p.plate) === 6 || norm(p.name) === 'ankara')) {
          const lat = Number(p.lat);
          const lng = Number(p.lng);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            return { lat, lng };
          }
        }
      }
    }
    return FALLBACK_ANKARA;
  }

  function getMilestoneInfo(visitedCount, totalCount) {
    const safeTotal = totalCount > 0 ? totalCount : 81;
    const safeVisited = Math.max(0, Math.min(visitedCount, safeTotal));

    if (safeVisited >= safeTotal) {
      return {
        pct: 100,
        label: `${safeVisited}/${safeTotal} ➔ Tüm Anadolu Tamamlandı! 🏆`
      };
    }

    let nextTarget = safeTotal;
    for (let i = 0; i < MILESTONES.length; i += 1) {
      if (MILESTONES[i] > safeVisited && MILESTONES[i] <= safeTotal) {
        nextTarget = MILESTONES[i];
        break;
      }
    }

    const remaining = Math.max(1, nextTarget - safeVisited);
    const pct = Math.min(100, Math.max(0, Math.round((safeVisited / safeTotal) * 100)));
    return {
      pct,
      label: `${safeVisited}/${safeTotal} ➔ ${nextTarget}. İl Hedefine ${remaining} İl Kaldı!`
    };
  }

  // =========================================================================
  // Data & Daily Selection
  // =========================================================================

  function getSpotlightModel(ctx) {
    const safeCtx = ctx || {};
    const data = safeCtx.data || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null) || {};
    const provinces = data.provinces || {};
    const regions = data.regions || {};

    const allEntries = Object.entries(provinces)
      .filter(([, p]) => Boolean(p))
      .map(([key, province]) => ({ key, province }))
      .sort((a, b) => {
        const plateDiff = (Number(a.province.plate) || 999) - (Number(b.province.plate) || 999);
        return plateDiff !== 0 ? plateDiff : a.key.localeCompare(b.key);
      });

    if (!allEntries.length) return null;

    const todayKey = getTodayDateKey();
    if (lastDateKey !== todayKey) {
      lastDateKey = todayKey;
      cycleOffset = 0;
    }

    const unvisited = allEntries.filter((entry) => !entry.province.visited);
    const pool = unvisited.length ? unvisited : allEntries;
    const baseIdx = hashDateKey(todayKey) % pool.length;
    const normalizedOffset = ((cycleOffset % pool.length) + pool.length) % pool.length;
    const pickedIdx = (baseIdx + normalizedOffset) % pool.length;
    const picked = pool[pickedIdx];

    const visitedCount = allEntries.filter((e) => Boolean(e.province.visited)).length;
    const milestone = getMilestoneInfo(visitedCount, allEntries.length);

    const ankara = getAnkaraCoords(provinces);
    const pLat = Number(picked.province.lat);
    const pLng = Number(picked.province.lng);
    let distKm = null;
    if (Number.isFinite(pLat) && Number.isFinite(pLng)) {
      distKm = Number(picked.province.plate) === 6 ? 0 : Math.round(haversineKm(ankara.lat, ankara.lng, pLat, pLng));
    }

    const regionInfo = regions[picked.province.region_code] || null;
    const regionColor = (regionInfo && regionInfo.color) || 'var(--accent-cyan, #00f2fe)';
    const regionIcon = (regionInfo && regionInfo.icon) || '🗺️';

    return {
      key: picked.key,
      province: picked.province,
      dateKey: todayKey,
      dateLabel: formatTurkishDate(todayKey),
      isDailyPick: normalizedOffset === 0,
      poolSize: pool.length,
      visitedCount,
      totalCount: allEntries.length,
      milestone,
      distKm,
      regionColor,
      regionIcon,
      bannerUrl: getBannerUrl(picked.key, picked.province),
      landmark: getFirstLandmark(picked.province),
      quote: picked.province.custom_quote || picked.province.quote || 'Anadolu yollarında yeni bir keşif ufku.'
    };
  }

  // =========================================================================
  // Scoped CSS Injection (Dark Obsidian & Light Alabaster Compatible)
  // =========================================================================

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* -------------------------------------------------------------------
         Günün Keşif Menzili & Sıradaki Hedef (.daily-spotlight-card)
         ------------------------------------------------------------------- */
      .daily-spotlight-card {
        position: relative;
        max-width: 1100px;
        margin: 0 auto 24px auto;
        padding: 20px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 92% 14%, rgba(0, 242, 254, 0.14), transparent 42%),
          radial-gradient(circle at 12% 88%, rgba(245, 158, 11, 0.11), transparent 44%),
          var(--bg-card, rgba(15, 22, 39, 0.78));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        box-shadow: 0 18px 42px -16px rgba(0, 0, 0, 0.58), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        overflow: hidden;
        color: var(--text-primary, #f8fafc);
        transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
      }

      .daily-spotlight-card:hover {
        border-color: var(--border-glow, rgba(0, 242, 254, 0.38));
      }

      body.light-theme .daily-spotlight-card,
      [data-theme="light"] .daily-spotlight-card {
        background:
          radial-gradient(circle at 92% 14%, rgba(2, 132, 199, 0.09), transparent 44%),
          radial-gradient(circle at 12% 88%, rgba(217, 119, 6, 0.08), transparent 46%),
          rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 14px 34px -14px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        color: var(--text-primary, #0f172a);
      }

      .dsb-grid {
        display: grid;
        grid-template-columns: minmax(220px, 310px) minmax(0, 1fr);
        gap: 22px;
        align-items: stretch;
      }

      .dsb-media {
        position: relative;
        border-radius: 15px;
        overflow: hidden;
        min-height: 205px;
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      body.light-theme .dsb-media,
      [data-theme="light"] .dsb-media {
        background: #e2e8f0;
        border-color: rgba(15, 23, 42, 0.08);
      }

      .dsb-thumb {
        width: 100%;
        height: 100%;
        min-height: 205px;
        object-fit: cover;
        display: block;
        transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .daily-spotlight-card:hover .dsb-thumb {
        transform: scale(1.04);
      }

      .dsb-media-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(6, 9, 19, 0.14) 0%, rgba(6, 9, 19, 0.78) 100%);
        pointer-events: none;
      }

      .dsb-plate-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 11px;
        border-radius: 9999px;
        font-family: var(--font-heading, inherit);
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: #f8fafc;
        background: rgba(9, 14, 28, 0.76);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.22);
      }

      .dsb-distance-pill {
        position: absolute;
        bottom: 12px;
        left: 12px;
        right: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 7px 11px;
        border-radius: 10px;
        font-size: 0.76rem;
        font-weight: 600;
        color: #f8fafc;
        background: rgba(9, 14, 28, 0.74);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.16);
      }

      .dsb-body {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 14px;
        min-width: 0;
      }

      .dsb-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px 12px;
      }

      .dsb-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 11px;
        border-radius: 9999px;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.11);
        border: 1px solid rgba(0, 242, 254, 0.28);
      }

      body.light-theme .dsb-eyebrow,
      [data-theme="light"] .dsb-eyebrow {
        color: #0369a1;
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.24);
      }

      .dsb-date-chip {
        font-size: 0.74rem;
        font-weight: 600;
        color: var(--text-secondary, #94a3b8);
        white-space: nowrap;
      }

      body.light-theme .dsb-date-chip,
      [data-theme="light"] .dsb-date-chip {
        color: #475569;
      }

      .dsb-title-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
      }

      .dsb-city-name {
        margin: 0;
        font-family: var(--font-heading, inherit);
        font-size: clamp(1.38rem, 2.2vw, 1.78rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.15;
        color: var(--text-primary, #f8fafc);
      }

      body.light-theme .dsb-city-name,
      [data-theme="light"] .dsb-city-name {
        color: #0f172a;
      }

      .dsb-region-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: var(--text-primary, #f8fafc);
      }

      body.light-theme .dsb-region-badge,
      [data-theme="light"] .dsb-region-badge {
        background: rgba(15, 23, 42, 0.05);
        border-color: rgba(15, 23, 42, 0.12);
        color: #1e293b;
      }

      .dsb-quote {
        margin: 0;
        padding: 9px 13px;
        border-left: 3px solid var(--accent-gold, #f59e0b);
        border-radius: 0 10px 10px 0;
        background: rgba(255, 255, 255, 0.035);
        font-size: 0.88rem;
        font-style: italic;
        line-height: 1.5;
        color: var(--text-secondary, #cbd5e1);
      }

      body.light-theme .dsb-quote,
      [data-theme="light"] .dsb-quote {
        background: rgba(245, 158, 11, 0.07);
        color: #334155;
      }

      .dsb-meta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .dsb-meta-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 11px;
        border-radius: 10px;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-primary, #e2e8f0);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.09);
      }

      body.light-theme .dsb-meta-pill,
      [data-theme="light"] .dsb-meta-pill {
        color: #1e293b;
        background: rgba(15, 23, 42, 0.04);
        border-color: rgba(15, 23, 42, 0.09);
      }

      .dsb-milestone {
        display: flex;
        flex-direction: column;
        gap: 7px;
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.36);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      body.light-theme .dsb-milestone,
      [data-theme="light"] .dsb-milestone {
        background: rgba(241, 245, 249, 0.85);
        border-color: rgba(15, 23, 42, 0.08);
      }

      .dsb-milestone-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 0.79rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      body.light-theme .dsb-milestone-head,
      [data-theme="light"] .dsb-milestone-head {
        color: #0f172a;
      }

      .dsb-milestone-pct {
        font-size: 0.74rem;
        font-weight: 800;
        color: var(--accent-emerald, #10b981);
      }

      .dsb-progress-track {
        position: relative;
        width: 100%;
        height: 8px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }

      body.light-theme .dsb-progress-track,
      [data-theme="light"] .dsb-progress-track {
        background: rgba(15, 23, 42, 0.1);
      }

      .dsb-progress-fill {
        height: 100%;
        border-radius: 9999px;
        background: linear-gradient(90deg, #00f2fe 0%, #10b981 65%, #f59e0b 100%);
        transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .dsb-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
      }

      .dsb-btn {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 9px 15px;
        border-radius: 11px;
        font-family: inherit;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        border: 1px solid transparent;
        transition: transform 0.18s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
      }

      .dsb-btn:hover {
        transform: translateY(-1px);
      }

      .dsb-btn:focus-visible {
        outline: 2px solid var(--accent-cyan, #00f2fe);
        outline-offset: 2px;
      }

      .dsb-btn-primary {
        background: linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%);
        color: #06101f;
        box-shadow: 0 8px 20px -8px rgba(0, 242, 254, 0.65);
      }

      .dsb-btn-primary:hover {
        box-shadow: 0 10px 24px -6px rgba(0, 242, 254, 0.78);
      }

      .dsb-btn-ai {
        background: rgba(168, 85, 247, 0.16);
        border-color: rgba(168, 85, 247, 0.4);
        color: #e9d5ff;
      }

      .dsb-btn-ai:hover {
        background: rgba(168, 85, 247, 0.26);
        border-color: rgba(168, 85, 247, 0.65);
      }

      body.light-theme .dsb-btn-ai,
      [data-theme="light"] .dsb-btn-ai {
        background: rgba(147, 51, 234, 0.1);
        border-color: rgba(147, 51, 234, 0.3);
        color: #6b21a8;
      }

      .dsb-btn-ghost {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.14);
        color: var(--text-primary, #f8fafc);
      }

      .dsb-btn-ghost:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(0, 242, 254, 0.38);
      }

      body.light-theme .dsb-btn-ghost,
      [data-theme="light"] .dsb-btn-ghost {
        background: rgba(15, 23, 42, 0.05);
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      body.light-theme .dsb-btn-ghost:hover,
      [data-theme="light"] .dsb-btn-ghost:hover {
        background: rgba(15, 23, 42, 0.09);
      }

      @media (max-width: 780px) {
        .daily-spotlight-card {
          padding: 15px;
          margin-bottom: 18px;
          border-radius: 16px;
        }

        .dsb-grid {
          grid-template-columns: 1fr;
          gap: 15px;
        }

        .dsb-media,
        .dsb-thumb {
          min-height: 175px;
          max-height: 210px;
        }

        .dsb-actions {
          display: grid;
          grid-template-columns: 1fr;
        }

        .dsb-btn {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // =========================================================================
  // Card Rendering & Event Binding
  // =========================================================================

  function buildCardMarkup(model) {
    const p = model.province;
    const plateStr = formatPlate(p.plate);
    const distText = model.distKm != null
      ? `${model.distKm.toLocaleString('tr-TR')} km`
      : 'Anadolu';
    const pickModeTag = model.isDailyPick
      ? `📅 ${esc(model.dateLabel)} • Günün Seçimi`
      : `🎲 Alternatif Öneri • ${esc(model.dateLabel)}`;

    return `
      <div class="dsb-grid">
        <div class="dsb-media">
          <img
            class="dsb-thumb"
            src="${esc(model.bannerUrl)}"
            alt="${esc(p.name)} manzarası"
            loading="lazy"
            onerror="this.onerror=null;this.src='assets/banner.jpg';"
          />
          <div class="dsb-media-scrim"></div>
          <span class="dsb-plate-badge">🚗 Plaka ${esc(plateStr)}</span>
          <div class="dsb-distance-pill">
            <span>🧭 Ankara'dan Mesafe</span>
            <strong>${esc(distText)}</strong>
          </div>
        </div>

        <div class="dsb-body">
          <div class="dsb-header">
            <span class="dsb-eyebrow">✨ Günün Keşif Menzili & Sıradaki Hedef</span>
            <span class="dsb-date-chip">${pickModeTag}</span>
          </div>

          <div class="dsb-title-row">
            <h3 class="dsb-city-name">${esc(p.name)}</h3>
            <span class="dsb-region-badge" style="border-color: ${esc(model.regionColor)};">
              <span aria-hidden="true">${esc(model.regionIcon)}</span>
              <span>${esc(p.region || 'Anadolu')}</span>
            </span>
          </div>

          <blockquote class="dsb-quote">“${esc(model.quote)}”</blockquote>

          <div class="dsb-meta-row">
            <span class="dsb-meta-pill">🏛️ İlk Durak: <strong>${esc(model.landmark)}</strong></span>
            <span class="dsb-meta-pill">📏 Ankara ➔ ${esc(p.name)}: <strong>${esc(distText)}</strong></span>
          </div>

          <div class="dsb-milestone" aria-label="Sonraki il hedefi ilerlemesi">
            <div class="dsb-milestone-head">
              <span>🎯 ${esc(model.milestone.label)}</span>
              <span class="dsb-milestone-pct">%${model.milestone.pct}</span>
            </div>
            <div class="dsb-progress-track" role="progressbar" aria-valuenow="${model.milestone.pct}" aria-valuemin="0" aria-valuemax="100">
              <div class="dsb-progress-fill" style="width: ${model.milestone.pct}%;"></div>
            </div>
          </div>

          <div class="dsb-actions">
            <button type="button" class="dsb-btn dsb-btn-primary" data-dsb-action="inspect" data-dsb-key="${esc(model.key)}">
              📍 Menzili İncele
            </button>
            <button type="button" class="dsb-btn dsb-btn-ai" data-dsb-action="ai-plan">
              🧠 AI ile Planla
            </button>
            <button type="button" class="dsb-btn dsb-btn-ghost" data-dsb-action="cycle" ${model.poolSize <= 1 ? 'disabled' : ''}>
              🎲 Başka Menzil Öner
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function bindCardEvents(card, ctx) {
    if (!card || card.dataset.dsbBound === '1') return;
    card.dataset.dsbBound = '1';

    card.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('[data-dsb-action]') : null;
      if (!btn) return;

      const action = btn.getAttribute('data-dsb-action');
      if (action === 'inspect') {
        const key = btn.getAttribute('data-dsb-key');
        if (key && ctx && typeof ctx.selectCity === 'function') {
          ctx.selectCity(key);
        }
      } else if (action === 'ai-plan') {
        if (ctx && typeof ctx.openView === 'function') {
          ctx.openView('aiPlanner');
        }
      } else if (action === 'cycle') {
        cycleOffset += 1;
        const nextModel = getSpotlightModel(activeCtx || ctx);
        if (nextModel) {
          card.setAttribute('data-spotlight-date', nextModel.dateKey);
          card.setAttribute('data-spotlight-key', nextModel.key);
          card.innerHTML = buildCardMarkup(nextModel);
        }
      }
    });
  }

  function mountSpotlightCard(viewport, ctx) {
    if (!viewport || !ctx) return;
    if (viewport.querySelector(`.${CARD_CLASS}`)) return;

    const model = getSpotlightModel(ctx);
    if (!model) return;

    const card = document.createElement('section');
    card.className = CARD_CLASS;
    card.setAttribute('aria-label', 'Günün Keşif Menzili ve Sıradaki Hedef');
    card.setAttribute('data-spotlight-date', model.dateKey);
    card.setAttribute('data-spotlight-key', model.key);
    card.innerHTML = buildCardMarkup(model);
    bindCardEvents(card, ctx);

    const storiesBar = viewport.querySelector('.anadolu-stories-bar');
    if (storiesBar) {
      storiesBar.insertAdjacentElement('afterend', card);
    } else {
      viewport.prepend(card);
    }
  }

  function refreshCardIfDateChanged(viewport, ctx) {
    const existing = viewport ? viewport.querySelector(`.${CARD_CLASS}`) : null;
    if (!existing) return;
    const todayKey = getTodayDateKey();
    if (existing.getAttribute('data-spotlight-date') === todayKey) return;

    cycleOffset = 0;
    const model = getSpotlightModel(ctx);
    if (!model) return;
    existing.setAttribute('data-spotlight-date', model.dateKey);
    existing.setAttribute('data-spotlight-key', model.key);
    existing.innerHTML = buildCardMarkup(model);
  }

  function maybeMountOnDashboard(viewport, ctx) {
    const safeCtx = ctx || activeCtx;
    if (!viewport || !safeCtx || !safeCtx.state) return;
    if (safeCtx.state.currentView !== 'dashboard') return;

    if (!viewport.querySelector(`.${CARD_CLASS}`)) {
      mountSpotlightCard(viewport, safeCtx);
    } else {
      refreshCardIfDateChanged(viewport, safeCtx);
    }
  }

  // =========================================================================
  // Lifecycle: MutationObserver + Midnight Auto-Refresh
  // =========================================================================

  function scheduleMidnightRefresh() {
    if (midnightTimerId) {
      clearTimeout(midnightTimerId);
      midnightTimerId = null;
    }

    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      1,
      0
    );
    const delayMs = Math.max(1000, nextMidnight.getTime() - now.getTime());

    midnightTimerId = setTimeout(() => {
      cycleOffset = 0;
      lastDateKey = getTodayDateKey();
      const viewport = document.getElementById('viewport-content');
      if (viewport && activeCtx && activeCtx.state && activeCtx.state.currentView === 'dashboard') {
        const existing = viewport.querySelector(`.${CARD_CLASS}`);
        if (existing) {
          const model = getSpotlightModel(activeCtx);
          if (model) {
            existing.setAttribute('data-spotlight-date', model.dateKey);
            existing.setAttribute('data-spotlight-key', model.key);
            existing.innerHTML = buildCardMarkup(model);
          }
        } else {
          maybeMountOnDashboard(viewport, activeCtx);
        }
      }
      scheduleMidnightRefresh();
    }, delayMs);
  }

  function initViewportObserver(ctx) {
    const viewport = document.getElementById('viewport-content');
    if (!viewport) return;

    if (viewportObserver) {
      viewportObserver.disconnect();
    }

    if (typeof MutationObserver === 'function') {
      viewportObserver = new MutationObserver(() => {
        maybeMountOnDashboard(viewport, activeCtx || ctx);
      });
      viewportObserver.observe(viewport, { childList: true });
    }

    maybeMountOnDashboard(viewport, ctx);
  }

  // =========================================================================
  // Public Module Entry Point
  // =========================================================================

  function init(ctx) {
    activeCtx = ctx || {};
    injectStyles();
    initViewportObserver(activeCtx);
    scheduleMidnightRefresh();
  }

  window.SEYYAH_MODULES.dailySpotlight = {
    init
  };
})();
