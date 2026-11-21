/**
 * Dijital Seyyah — 🖼️ 162 Kare Mozaik Duvarı (Pinterest / Masonry Photo Wall)
 * Registers on window.SEYYAH_MODULES.photoWall = { render(container, ctx) }
 *
 * Features:
 *   - Collects all 162 verified province photos (banner_rel + gallery_rel) from ctx.data.provinces
 *   - Full-bleed sticky glass filter bar:
 *       * Region selector (7 regions + All)
 *       * Status filter (Tümü / ✅ Gezilen / ⏳ Bekleyen)
 *       * Photo type filter (Hepsi / Kapak / Galeri)
 *       * Search box (province, region, or plate number with Turkish normalization)
 *       * "🔀 Karıştır (Shuffle)" & "▶️ Otomatik Slayt" controls
 *   - CSS multi-column Masonry layout (4 desktop / 3 tablet / 2 mobile)
 *   - Lazy-loaded images, subtle zoom-on-hover, glass overlay with plate, province, region
 *   - 2 quick actions: click image -> ctx.openLightbox(images, index), click "📍 İle Git" -> ctx.selectCity(key)
 *   - Built-in fullscreen Auto-Slide theater modal with Play/Pause, keyboard controls, and cleanup
 *   - Scoped CSS, dark & light-theme compatible
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-photo-wall-styles';
  const SLIDE_INTERVAL_MS = 4000;
  const ASPECT_RATIOS = ['16/9', '4/3', '1/1', '16/10', '5/4', '10/9'];

  const FALLBACK_REGIONS = {
    '01_Marmara': { name: 'Marmara Bölgesi', icon: '🏰', color: '#38bdf8' },
    '02_Ege': { name: 'Ege Bölgesi', icon: '🌊', color: '#34d399' },
    '03_Akdeniz': { name: 'Akdeniz Bölgesi', icon: '☀️', color: '#f59e0b' },
    '04_IcAnadolu': { name: 'İç Anadolu Bölgesi', icon: '🌾', color: '#fbbf24' },
    '05_Karadeniz': { name: 'Karadeniz Bölgesi', icon: '🌲', color: '#10b981' },
    '06_DoguAnadolu': { name: 'Doğu Anadolu Bölgesi', icon: '🏔️', color: '#a855f7' },
    '07_GuneydoguAnadolu': { name: 'Güneydoğu Anadolu Bölgesi', icon: '🏜️', color: '#f97316' }
  };

  // Module UI state (persists nicely across re-renders within session)
  const uiState = {
    region: 'all',
    status: 'all', // 'all' | 'visited' | 'pending'
    photoType: 'all', // 'all' | 'banner' | 'gallery'
    search: '',
    shuffledIds: null // null = plate order, Array<string> = shuffled order
  };

  let activeSlideCleanup = null;

  // =========================================================================
  // Utilities
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

  function formatPlate(plate) {
    const num = Number(plate);
    if (!Number.isFinite(num) || num <= 0) return '00';
    return String(num).padStart(2, '0');
  }

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function pickAspectRatio(id) {
    return ASPECT_RATIOS[hashString(id) % ASPECT_RATIOS.length];
  }

  function fisherYatesShuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
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
    }, 3200);
  }

  // =========================================================================
  // Data Collection
  // =========================================================================

  function collectAllPhotos(data, regionsMap) {
    const provinces = (data && data.provinces) || {};
    const entries = Object.entries(provinces).sort((a, b) => {
      const pa = Number(a[1] && a[1].plate) || 999;
      const pb = Number(b[1] && b[1].plate) || 999;
      if (pa !== pb) return pa - pb;
      return String((a[1] && a[1].name) || '').localeCompare(String((b[1] && b[1].name) || ''), 'tr');
    });

    const photos = [];
    for (const [key, p] of entries) {
      if (!p) continue;
      const plateNum = Number(p.plate) || 0;
      const plateStr = formatPlate(plateNum);
      const regionInfo = regionsMap[p.region_code] || {};
      const regionColor = regionInfo.color || '#38bdf8';
      const regionIcon = regionInfo.icon || '📍';

      if (p.has_banner !== false && p.banner_rel) {
        const id = `${key}::banner`;
        photos.push({
          id,
          key,
          plate: plateNum,
          plateStr,
          city: p.name || key,
          region: p.region || '',
          regionCode: p.region_code || '',
          regionIcon,
          regionColor,
          visited: Boolean(p.visited),
          photoType: 'banner',
          typeLabel: 'Kapak',
          src: p.banner_rel,
          caption: `${plateStr} • ${p.name} (${p.region}) — Kapak Fotoğrafı`,
          aspect: pickAspectRatio(id)
        });
      }

      if (p.has_gallery !== false && p.gallery_rel) {
        const id = `${key}::gallery`;
        photos.push({
          id,
          key,
          plate: plateNum,
          plateStr,
          city: p.name || key,
          region: p.region || '',
          regionCode: p.region_code || '',
          regionIcon,
          regionColor,
          visited: Boolean(p.visited),
          photoType: 'gallery',
          typeLabel: 'Galeri',
          src: p.gallery_rel,
          caption: `${plateStr} • ${p.name} (${p.region}) — Şehir Vitrini`,
          aspect: pickAspectRatio(id)
        });
      }
    }

    return photos;
  }

  // =========================================================================
  // Scoped Styles (Dark + Light Theme)
  // =========================================================================

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .pmw-studio {
        width: 100%;
        max-width: 100%;
        padding: 4px 2px 32px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        color: var(--text-primary, #f8fafc);
        animation: pmwFadeIn 0.32s ease;
      }

      @keyframes pmwFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Hero Banner */
      .pmw-hero {
        position: relative;
        border-radius: var(--radius-lg, 20px);
        padding: 20px 24px;
        background:
          linear-gradient(125deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.78) 55%, rgba(2, 132, 199, 0.24) 100%);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.5));
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        overflow: hidden;
      }

      .pmw-hero::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 88% 18%, rgba(0, 242, 254, 0.14), transparent 46%);
        pointer-events: none;
      }

      .pmw-hero-copy {
        position: relative;
        z-index: 1;
        max-width: 680px;
      }

      .pmw-kicker {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 10px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.26);
        margin-bottom: 8px;
      }

      .pmw-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.35rem, 2.2vw, 1.85rem);
        font-weight: 800;
        line-height: 1.2;
        margin: 0 0 6px;
        background: linear-gradient(135deg, #ffffff 0%, #7dd3fc 55%, #34d399 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .pmw-subtitle {
        font-size: 0.88rem;
        color: var(--text-secondary, #94a3b8);
        margin: 0;
      }

      .pmw-stats {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .pmw-stat-chip {
        min-width: 84px;
        padding: 9px 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .pmw-stat-val {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.15;
      }

      .pmw-stat-lbl {
        font-size: 0.71rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* Filter Toolbar */
      .pmw-toolbar {
        position: sticky;
        top: 0;
        z-index: 25;
        border-radius: var(--radius-md, 12px);
        padding: 14px 16px;
        background: var(--bg-glass, rgba(15, 23, 42, 0.88));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        box-shadow: 0 12px 28px -10px rgba(0, 0, 0, 0.45);
        display: flex;
        flex-direction: column;
        gap: 11px;
      }

      .pmw-toolbar-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .pmw-region-strip {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }

      .pmw-pill {
        appearance: none;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(30, 41, 59, 0.6);
        color: var(--text-secondary, #94a3b8);
        font-family: inherit;
        font-size: 0.78rem;
        font-weight: 600;
        padding: 6px 11px;
        border-radius: var(--radius-full, 9999px);
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
      }

      .pmw-pill:hover {
        color: var(--text-primary, #f8fafc);
        border-color: var(--border-glow, rgba(0, 242, 254, 0.4));
        transform: translateY(-1px);
      }

      .pmw-pill.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.22));
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
        box-shadow: 0 0 14px rgba(0, 242, 254, 0.18);
      }

      .pmw-controls-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .pmw-segmented {
        display: inline-flex;
        padding: 3px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        gap: 2px;
      }

      .pmw-seg-btn {
        appearance: none;
        border: none;
        background: transparent;
        color: var(--text-secondary, #94a3b8);
        font-family: inherit;
        font-size: 0.76rem;
        font-weight: 600;
        padding: 5px 10px;
        border-radius: var(--radius-full, 9999px);
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .pmw-seg-btn:hover {
        color: var(--text-primary, #f8fafc);
      }

      .pmw-seg-btn.active {
        background: rgba(0, 242, 254, 0.18);
        color: var(--accent-cyan, #00f2fe);
      }

      .pmw-search-wrap {
        position: relative;
        flex: 1 1 210px;
        min-width: 185px;
        max-width: 310px;
      }

      .pmw-search-icon {
        position: absolute;
        left: 11px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.82rem;
        opacity: 0.72;
        pointer-events: none;
      }

      .pmw-search-input {
        width: 100%;
        padding: 7px 30px 7px 32px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.82rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .pmw-search-input::placeholder {
        color: var(--text-muted, #64748b);
      }

      .pmw-search-input:focus {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .pmw-search-clear {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        border: none;
        background: rgba(148, 163, 184, 0.2);
        color: var(--text-primary, #f8fafc);
        width: 19px;
        height: 19px;
        border-radius: 50%;
        font-size: 0.7rem;
        line-height: 1;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
      }

      .pmw-search-clear.visible {
        display: inline-flex;
      }

      .pmw-actions-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .pmw-action-btn {
        appearance: none;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.15));
        background: rgba(30, 41, 59, 0.78);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.8rem;
        font-weight: 700;
        padding: 7px 13px;
        border-radius: var(--radius-full, 9999px);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .pmw-action-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(0, 242, 254, 0.18);
      }

      .pmw-action-btn.pmw-btn-primary {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.22), rgba(16, 185, 129, 0.24));
        border-color: rgba(0, 242, 254, 0.45);
      }

      .pmw-action-btn.pmw-btn-shuffle.is-shuffled {
        border-color: var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.16);
      }

      .pmw-action-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      /* Result Strip */
      .pmw-result-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 0 4px;
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
      }

      .pmw-reset-order-btn {
        appearance: none;
        border: none;
        background: transparent;
        color: var(--accent-cyan, #00f2fe);
        font-family: inherit;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
        padding: 2px 4px;
      }

      /* CSS Multi-Column Masonry Grid (4 desktop / 3 tablet / 2 mobile) */
      .pmw-masonry {
        column-count: 4;
        column-gap: 14px;
        width: 100%;
      }

      @media (max-width: 1180px) {
        .pmw-masonry {
          column-count: 3;
        }
      }

      @media (max-width: 720px) {
        .pmw-masonry {
          column-count: 2;
          column-gap: 10px;
        }
      }

      /* Masonry Card */
      .pmw-card {
        position: relative;
        display: block;
        width: 100%;
        break-inside: avoid;
        -webkit-column-break-inside: avoid;
        page-break-inside: avoid;
        margin: 0 0 14px;
        border-radius: 14px;
        overflow: hidden;
        background: var(--bg-card, rgba(30, 41, 59, 0.75));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.45);
        cursor: zoom-in;
        transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.25s ease, box-shadow 0.25s ease;
      }

      @media (max-width: 720px) {
        .pmw-card {
          margin-bottom: 10px;
          border-radius: 11px;
        }
      }

      .pmw-card:hover {
        transform: translateY(-2px);
        border-color: var(--border-glow, rgba(0, 242, 254, 0.42));
        box-shadow: 0 14px 30px -10px rgba(0, 242, 254, 0.25);
      }

      .pmw-card-media {
        position: relative;
        width: 100%;
        overflow: hidden;
        background: rgba(15, 23, 42, 0.7);
      }

      .pmw-img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
        object-position: center;
        transition: transform 0.48s cubic-bezier(0.22, 1, 0.36, 1), filter 0.3s ease;
      }

      .pmw-card:hover .pmw-img {
        transform: scale(1.06);
      }

      /* Top Mini Badges */
      .pmw-top-badges {
        position: absolute;
        top: 9px;
        left: 9px;
        right: 9px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
        pointer-events: none;
        z-index: 2;
      }

      .pmw-type-pill,
      .pmw-status-pill {
        padding: 3px 8px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.16);
        color: #f8fafc;
        background: rgba(10, 15, 29, 0.64);
      }

      .pmw-status-pill.visited {
        background: rgba(16, 185, 129, 0.78);
        border-color: rgba(110, 231, 183, 0.45);
      }

      .pmw-status-pill.pending {
        background: rgba(245, 158, 11, 0.72);
        border-color: rgba(253, 230, 138, 0.4);
      }

      /* Glass Overlay */
      .pmw-overlay {
        position: absolute;
        inset: auto 0 0 0;
        padding: 28px 11px 10px;
        background: linear-gradient(180deg, rgba(6, 10, 20, 0) 0%, rgba(6, 10, 20, 0.78) 42%, rgba(6, 10, 20, 0.94) 100%);
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 8px;
        z-index: 2;
        transition: padding-bottom 0.25s ease, background 0.25s ease;
      }

      .pmw-overlay-glass {
        width: 100%;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.62);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.14);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
      }

      .pmw-card:hover .pmw-overlay-glass {
        background: rgba(15, 23, 42, 0.8);
        border-color: rgba(0, 242, 254, 0.36);
        transform: translateY(-2px);
      }

      .pmw-meta {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .pmw-plate {
        flex-shrink: 0;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.76rem;
        font-weight: 800;
        padding: 3px 7px;
        border-radius: 7px;
        background: rgba(0, 242, 254, 0.18);
        border: 1px solid rgba(0, 242, 254, 0.38);
        color: #e0f2fe;
      }

      .pmw-titles {
        min-width: 0;
      }

      .pmw-city {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.88rem;
        font-weight: 700;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2;
      }

      .pmw-region {
        font-size: 0.7rem;
        color: #cbd5e1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pmw-city-btn {
        flex-shrink: 0;
        appearance: none;
        border: 1px solid rgba(255, 255, 255, 0.22);
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        font-family: inherit;
        font-size: 0.71rem;
        font-weight: 700;
        padding: 5px 8px;
        border-radius: var(--radius-full, 9999px);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;
      }

      .pmw-city-btn:hover {
        background: var(--accent-cyan, #00f2fe);
        border-color: var(--accent-cyan, #00f2fe);
        color: #06101e;
      }

      @media (max-width: 600px) {
        .pmw-overlay {
          padding: 20px 6px 6px;
        }
        .pmw-overlay-glass {
          padding: 6px 7px;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
        }
        .pmw-city-btn {
          width: 100%;
          text-align: center;
          padding: 4px 6px;
        }
      }

      /* Empty State */
      .pmw-empty {
        padding: 48px 20px;
        text-align: center;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-card, rgba(30, 41, 59, 0.7));
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.18));
      }

      .pmw-empty-icon {
        font-size: 2.3rem;
        margin-bottom: 8px;
      }

      .pmw-empty h3 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.08rem;
        margin: 0 0 6px;
      }

      .pmw-empty p {
        font-size: 0.85rem;
        color: var(--text-secondary, #94a3b8);
        margin: 0 0 14px;
      }

      /* Auto-Slide Theater Modal */
      .pmw-slide-modal {
        position: fixed;
        inset: 0;
        z-index: 3000;
        background: rgba(4, 8, 18, 0.94);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 16px 20px 20px;
        color: #f8fafc;
        animation: pmwFadeIn 0.25s ease;
      }

      .pmw-slide-progress-track {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.14);
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 12px;
      }

      .pmw-slide-progress-fill {
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #00f2fe, #10b981);
        transition: width 0.12s linear;
      }

      .pmw-slide-top {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      .pmw-slide-counter {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.86rem;
        font-weight: 700;
        color: #cbd5e1;
      }

      .pmw-slide-top-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .pmw-slide-btn {
        appearance: none;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(15, 23, 42, 0.72);
        color: #f8fafc;
        font-family: inherit;
        font-size: 0.8rem;
        font-weight: 600;
        padding: 7px 13px;
        border-radius: 9999px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pmw-slide-btn:hover {
        border-color: #00f2fe;
        background: rgba(0, 242, 254, 0.18);
      }

      .pmw-slide-stage {
        position: relative;
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 14px 48px;
      }

      .pmw-slide-img {
        max-width: 100%;
        max-height: calc(100vh - 210px);
        border-radius: 16px;
        object-fit: contain;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.14);
      }

      .pmw-slide-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.22);
        background: rgba(15, 23, 42, 0.75);
        color: #ffffff;
        font-size: 1.4rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .pmw-slide-nav:hover {
        border-color: #00f2fe;
        background: rgba(0, 242, 254, 0.22);
      }

      .pmw-slide-nav.prev { left: 4px; }
      .pmw-slide-nav.next { right: 4px; }

      .pmw-slide-caption {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      /* Light Theme Compatibility */
      body.light-theme .pmw-hero {
        background:
          linear-gradient(125deg, rgba(255, 255, 255, 0.96) 0%, rgba(241, 245, 249, 0.94) 60%, rgba(2, 132, 199, 0.14) 100%);
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 10px 28px -10px rgba(15, 23, 42, 0.12);
      }

      body.light-theme .pmw-title {
        background: linear-gradient(135deg, #0f172a 0%, #0284c7 60%, #059669 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .pmw-kicker {
        color: #0284c7;
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.24);
      }

      body.light-theme .pmw-stat-chip {
        background: rgba(255, 255, 255, 0.86);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .pmw-toolbar {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 10px 24px -10px rgba(15, 23, 42, 0.12);
      }

      body.light-theme .pmw-pill {
        background: rgba(241, 245, 249, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
        color: #334155;
      }

      body.light-theme .pmw-pill:hover {
        color: #0f172a;
        border-color: #0284c7;
      }

      body.light-theme .pmw-pill.active {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.14), rgba(37, 99, 235, 0.14));
        border-color: #0284c7;
        color: #0f172a;
        box-shadow: 0 0 10px rgba(2, 132, 199, 0.14);
      }

      body.light-theme .pmw-segmented {
        background: rgba(241, 245, 249, 0.95);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .pmw-seg-btn {
        color: #475569;
      }

      body.light-theme .pmw-seg-btn.active {
        background: #ffffff;
        color: #0284c7;
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
      }

      body.light-theme .pmw-search-input {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      body.light-theme .pmw-action-btn {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      body.light-theme .pmw-action-btn.pmw-btn-primary {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(5, 150, 105, 0.15));
        border-color: rgba(2, 132, 199, 0.4);
      }

      body.light-theme .pmw-card {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 8px 18px -8px rgba(15, 23, 42, 0.16);
      }

      body.light-theme .pmw-card-media {
        background: #e2e8f0;
      }

      body.light-theme .pmw-reset-order-btn {
        color: #0284c7;
      }

      body.light-theme .pmw-empty {
        background: rgba(255, 255, 255, 0.85);
        border-color: rgba(15, 23, 42, 0.16);
      }
    `;

    document.head.appendChild(style);
  }

  // =========================================================================
  // Auto-Slide Theater Modal
  // =========================================================================

  function stopActiveSlideshow() {
    if (typeof activeSlideCleanup === 'function') {
      activeSlideCleanup();
      activeSlideCleanup = null;
    }
  }

  function startAutoSlideshow(items, ctx) {
    stopActiveSlideshow();
    if (!items || !items.length) {
      notifyToast(ctx, 'Slayt başlatmak için en az 1 fotoğraf görünür olmalıdır.');
      return;
    }

    const esc = (ctx && typeof ctx.escapeHtml === 'function') ? ctx.escapeHtml : fallbackEscapeHtml;
    let currentIdx = 0;
    let isPlaying = true;
    let elapsed = 0;
    const tickMs = 100;

    const modal = document.createElement('div');
    modal.className = 'pmw-slide-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', '162 Kare Otomatik Slayt Gösterisi');

    modal.innerHTML = `
      <div>
        <div class="pmw-slide-progress-track">
          <div class="pmw-slide-progress-fill" data-pmw-slide-progress></div>
        </div>
        <div class="pmw-slide-top">
          <div class="pmw-slide-counter" data-pmw-slide-counter></div>
          <div class="pmw-slide-top-actions">
            <button type="button" class="pmw-slide-btn" data-pmw-slide-toggle>⏸ Duraklat</button>
            <button type="button" class="pmw-slide-btn" data-pmw-slide-lightbox>🔍 Lightbox</button>
            <button type="button" class="pmw-slide-btn" data-pmw-slide-city>📍 İle Git</button>
            <button type="button" class="pmw-slide-btn" data-pmw-slide-close>✕ Kapat</button>
          </div>
        </div>
      </div>

      <div class="pmw-slide-stage">
        <button type="button" class="pmw-slide-nav prev" data-pmw-slide-prev aria-label="Önceki fotoğraf">‹</button>
        <img class="pmw-slide-img" data-pmw-slide-img alt="" />
        <button type="button" class="pmw-slide-nav next" data-pmw-slide-next aria-label="Sonraki fotoğraf">›</button>
      </div>

      <div class="pmw-slide-caption">
        <div>
          <div style="font-family: var(--font-heading, 'Outfit', sans-serif); font-weight: 800; font-size: 1.05rem;" data-pmw-slide-title></div>
          <div style="font-size: 0.8rem; color: #94a3b8;" data-pmw-slide-sub></div>
        </div>
        <div style="font-size: 0.78rem; color: #cbd5e1;" data-pmw-slide-badge></div>
      </div>
    `;

    document.body.appendChild(modal);

    const progressEl = modal.querySelector('[data-pmw-slide-progress]');
    const counterEl = modal.querySelector('[data-pmw-slide-counter]');
    const imgEl = modal.querySelector('[data-pmw-slide-img]');
    const titleEl = modal.querySelector('[data-pmw-slide-title]');
    const subEl = modal.querySelector('[data-pmw-slide-sub]');
    const badgeEl = modal.querySelector('[data-pmw-slide-badge]');
    const toggleBtn = modal.querySelector('[data-pmw-slide-toggle]');

    function renderSlide() {
      const item = items[currentIdx];
      if (!item) return;
      imgEl.src = item.src;
      imgEl.alt = item.caption;
      counterEl.textContent = `▶️ Otomatik Slayt • ${currentIdx + 1} / ${items.length}`;
      titleEl.textContent = `${item.plateStr} • ${item.city}`;
      subEl.textContent = `${item.regionIcon} ${item.region} Bölgesi • ${item.typeLabel}`;
      badgeEl.textContent = item.visited ? '✅ Gezilen İl' : '⏳ Keşif Bekleyen İl';
      progressEl.style.width = '0%';
      elapsed = 0;

      // Preload next slide image for seamless transition
      if (items.length > 1 && typeof Image === 'function') {
        const nextItem = items[(currentIdx + 1) % items.length];
        const pre = new Image();
        pre.src = nextItem.src;
      }
    }

    function step(delta) {
      currentIdx = (currentIdx + delta + items.length) % items.length;
      renderSlide();
    }

    function updateToggleUi() {
      toggleBtn.textContent = isPlaying ? '⏸ Duraklat' : '▶️ Devam Et';
    }

    const timerId = window.setInterval(() => {
      if (!document.body.contains(modal)) {
        cleanup();
        return;
      }
      if (!isPlaying) return;
      elapsed += tickMs;
      const pct = Math.min(100, (elapsed / SLIDE_INTERVAL_MS) * 100);
      progressEl.style.width = `${pct}%`;
      if (elapsed >= SLIDE_INTERVAL_MS) {
        step(1);
      }
    }, tickMs);

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        cleanup();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
      } else if (e.key === ' ') {
        e.preventDefault();
        isPlaying = !isPlaying;
        updateToggleUi();
      }
    }

    function cleanup() {
      window.clearInterval(timerId);
      document.removeEventListener('keydown', onKeyDown);
      if (modal.parentNode) modal.parentNode.removeChild(modal);
      if (activeSlideCleanup === cleanup) {
        activeSlideCleanup = null;
      }
    }

    activeSlideCleanup = cleanup;
    document.addEventListener('keydown', onKeyDown);

    modal.querySelector('[data-pmw-slide-close]').addEventListener('click', cleanup);
    modal.querySelector('[data-pmw-slide-prev]').addEventListener('click', () => step(-1));
    modal.querySelector('[data-pmw-slide-next]').addEventListener('click', () => step(1));

    toggleBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      updateToggleUi();
    });

    modal.querySelector('[data-pmw-slide-lightbox]').addEventListener('click', () => {
      const idx = currentIdx;
      cleanup();
      if (ctx && typeof ctx.openLightbox === 'function') {
        ctx.openLightbox(items, idx);
      }
    });

    modal.querySelector('[data-pmw-slide-city]').addEventListener('click', () => {
      const item = items[currentIdx];
      cleanup();
      if (item && ctx && typeof ctx.selectCity === 'function') {
        ctx.selectCity(item.key);
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cleanup();
      }
    });

    // Safe attribute title fallback via escaped text already set with textContent
    modal.setAttribute('data-count', esc(String(items.length)));
    renderSlide();
  }

  // =========================================================================
  // Render Entrypoint
  // =========================================================================

  function render(container, ctx) {
    if (!container) return;

    stopActiveSlideshow();
    injectStyles();

    const data = (ctx && ctx.data) || (ctx && ctx.state && ctx.state.data) || {};
    const regionsMap = (data && data.regions) || FALLBACK_REGIONS;
    const esc = (ctx && typeof ctx.escapeHtml === 'function') ? ctx.escapeHtml : fallbackEscapeHtml;
    const norm = (ctx && typeof ctx.normalizeTurkish === 'function') ? ctx.normalizeTurkish : fallbackNormalizeTr;

    const allPhotos = collectAllPhotos(data, regionsMap);
    const totalVisitedPhotos = allPhotos.filter((p) => p.visited).length;
    const totalPendingPhotos = allPhotos.length - totalVisitedPhotos;

    function getOrderedPhotos() {
      if (!Array.isArray(uiState.shuffledIds) || !uiState.shuffledIds.length) {
        return allPhotos;
      }
      const map = new Map(allPhotos.map((p) => [p.id, p]));
      const ordered = [];
      for (const id of uiState.shuffledIds) {
        const item = map.get(id);
        if (item) {
          ordered.push(item);
          map.delete(id);
        }
      }
      for (const leftover of map.values()) {
        ordered.push(leftover);
      }
      return ordered;
    }

    function getFilteredPhotos() {
      const queryNorm = norm(uiState.search);
      const ordered = getOrderedPhotos();

      return ordered.filter((item) => {
        if (uiState.region !== 'all' && item.regionCode !== uiState.region) return false;
        if (uiState.status === 'visited' && !item.visited) return false;
        if (uiState.status === 'pending' && item.visited) return false;
        if (uiState.photoType !== 'all' && item.photoType !== uiState.photoType) return false;

        if (queryNorm) {
          const hay = norm(`${item.plateStr} ${item.plate} ${item.city} ${item.region} ${item.typeLabel}`);
          if (!hay.includes(queryNorm)) return false;
        }
        return true;
      });
    }

    const regionButtonsHtml = `
      <button type="button" class="pmw-pill ${uiState.region === 'all' ? 'active' : ''}" data-pmw-region="all">
        🇹🇷 Tümü
      </button>
      ${Object.entries(regionsMap).map(([code, info]) => {
        const shortName = String(info.name || code).replace(' Bölgesi', '');
        const activeCls = uiState.region === code ? 'active' : '';
        return `
          <button type="button" class="pmw-pill ${activeCls}" data-pmw-region="${esc(code)}">
            ${esc(info.icon || '📍')} ${esc(shortName)}
          </button>
        `;
      }).join('')}
    `;

    container.innerHTML = `
      <div class="pmw-studio" id="seyyah-photo-wall-root">
        <section class="pmw-hero">
          <div class="pmw-hero-copy">
            <span class="pmw-kicker">Pinterest Mozaik Stüdyosu • 81 İl</span>
            <h2 class="pmw-title">🖼️ 162 Kare Mozaik Duvarı</h2>
            <p class="pmw-subtitle">
              Anadolu'nun 81 iline ait kapak ve şehir vitrini karelerini kesintisiz Pinterest duvarında keşfedin; görsele tıklayarak Lightbox'ı açın veya doğrudan ile gidin.
            </p>
          </div>
          <div class="pmw-stats">
            <div class="pmw-stat-chip">
              <span class="pmw-stat-val" data-pmw-stat-shown>${allPhotos.length}</span>
              <span class="pmw-stat-lbl">Gösterilen Kare</span>
            </div>
            <div class="pmw-stat-chip">
              <span class="pmw-stat-val" style="color: var(--accent-emerald, #10b981);">${totalVisitedPhotos}</span>
              <span class="pmw-stat-lbl">✅ Gezilen</span>
            </div>
            <div class="pmw-stat-chip">
              <span class="pmw-stat-val" style="color: var(--accent-gold, #f59e0b);">${totalPendingPhotos}</span>
              <span class="pmw-stat-lbl">⏳ Bekleyen</span>
            </div>
          </div>
        </section>

        <section class="pmw-toolbar" aria-label="Mozaik Duvarı Filtreleri">
          <div class="pmw-toolbar-row">
            <div class="pmw-region-strip" role="group" aria-label="Bölge seçici">
              ${regionButtonsHtml}
            </div>
          </div>

          <div class="pmw-toolbar-row">
            <div class="pmw-controls-group">
              <div class="pmw-segmented" role="group" aria-label="Durum filtresi">
                <button type="button" class="pmw-seg-btn ${uiState.status === 'all' ? 'active' : ''}" data-pmw-status="all">Tümü</button>
                <button type="button" class="pmw-seg-btn ${uiState.status === 'visited' ? 'active' : ''}" data-pmw-status="visited">✅ Gezilen</button>
                <button type="button" class="pmw-seg-btn ${uiState.status === 'pending' ? 'active' : ''}" data-pmw-status="pending">⏳ Bekleyen</button>
              </div>

              <div class="pmw-segmented" role="group" aria-label="Fotoğraf türü">
                <button type="button" class="pmw-seg-btn ${uiState.photoType === 'all' ? 'active' : ''}" data-pmw-type="all">Hepsi</button>
                <button type="button" class="pmw-seg-btn ${uiState.photoType === 'banner' ? 'active' : ''}" data-pmw-type="banner">Kapak</button>
                <button type="button" class="pmw-seg-btn ${uiState.photoType === 'gallery' ? 'active' : ''}" data-pmw-type="gallery">Galeri</button>
              </div>

              <div class="pmw-search-wrap">
                <span class="pmw-search-icon" aria-hidden="true">🔍</span>
                <input
                  type="search"
                  class="pmw-search-input"
                  data-pmw-search
                  value="${esc(uiState.search)}"
                  placeholder="İl, plaka (34) veya bölge ara..."
                  aria-label="Fotoğraf duvarında ara"
                />
                <button type="button" class="pmw-search-clear ${uiState.search ? 'visible' : ''}" data-pmw-search-clear aria-label="Aramayı temizle">✕</button>
              </div>
            </div>

            <div class="pmw-actions-group">
              <button
                type="button"
                class="pmw-action-btn pmw-btn-shuffle ${uiState.shuffledIds ? 'is-shuffled' : ''}"
                data-pmw-shuffle
              >
                🔀 Karıştır (Shuffle)
              </button>
              <button type="button" class="pmw-action-btn pmw-btn-primary" data-pmw-slideshow>
                ▶️ Otomatik Slayt
              </button>
            </div>
          </div>
        </section>

        <div class="pmw-result-meta">
          <span data-pmw-result-text></span>
          <button
            type="button"
            class="pmw-reset-order-btn"
            data-pmw-reset-order
            style="display: ${uiState.shuffledIds ? 'inline-block' : 'none'};"
          >
            ↺ Plaka Sırasına Dön
          </button>
        </div>

        <div data-pmw-grid-host></div>
      </div>
    `;

    const rootEl = container.querySelector('#seyyah-photo-wall-root');
    const gridHost = rootEl.querySelector('[data-pmw-grid-host]');
    const shownStatEl = rootEl.querySelector('[data-pmw-stat-shown]');
    const resultTextEl = rootEl.querySelector('[data-pmw-result-text]');
    const shuffleBtn = rootEl.querySelector('[data-pmw-shuffle]');
    const slideshowBtn = rootEl.querySelector('[data-pmw-slideshow]');
    const resetOrderBtn = rootEl.querySelector('[data-pmw-reset-order]');
    const searchInput = rootEl.querySelector('[data-pmw-search]');
    const searchClearBtn = rootEl.querySelector('[data-pmw-search-clear]');

    let currentFiltered = [];

    function renderGrid() {
      currentFiltered = getFilteredPhotos();
      if (shownStatEl) shownStatEl.textContent = String(currentFiltered.length);
      if (slideshowBtn) slideshowBtn.disabled = currentFiltered.length === 0;
      if (resetOrderBtn) resetOrderBtn.style.display = uiState.shuffledIds ? 'inline-block' : 'none';
      if (shuffleBtn) shuffleBtn.classList.toggle('is-shuffled', Boolean(uiState.shuffledIds));

      if (resultTextEl) {
        const orderLabel = uiState.shuffledIds ? 'Karışık mozaik sırası' : 'Plaka sırası (01–81)';
        resultTextEl.textContent = `${currentFiltered.length} / ${allPhotos.length} fotoğraf listeleniyor • ${orderLabel}`;
      }

      if (!currentFiltered.length) {
        gridHost.innerHTML = `
          <div class="pmw-empty">
            <div class="pmw-empty-icon">🖼️</div>
            <h3>Eşleşen Fotoğraf Bulunamadı</h3>
            <p>Seçili bölge, durum veya arama kriterine uyan kare yok.</p>
            <button type="button" class="pmw-action-btn" data-pmw-clear-filters>Filtreleri Sıfırla</button>
          </div>
        `;
        const clearBtn = gridHost.querySelector('[data-pmw-clear-filters]');
        if (clearBtn) {
          clearBtn.addEventListener('click', () => {
            uiState.region = 'all';
            uiState.status = 'all';
            uiState.photoType = 'all';
            uiState.search = '';
            searchInput.value = '';
            searchClearBtn.classList.remove('visible');
            syncActiveButtons();
            renderGrid();
          });
        }
        return;
      }

      const cardsHtml = currentFiltered.map((item, idx) => `
        <article
          class="pmw-card"
          data-pmw-idx="${idx}"
          role="button"
          tabindex="0"
          aria-label="${esc(item.caption)} — Lightbox ile büyüt"
        >
          <div class="pmw-card-media" style="aspect-ratio: ${esc(item.aspect)};">
            <img
              class="pmw-img"
              src="${esc(item.src)}"
              alt="${esc(item.caption)}"
              loading="lazy"
              decoding="async"
            />
            <div class="pmw-top-badges">
              <span class="pmw-type-pill">${esc(item.typeLabel)}</span>
              <span class="pmw-status-pill ${item.visited ? 'visited' : 'pending'}">
                ${item.visited ? '✓ Gezildi' : '⏳ Bekliyor'}
              </span>
            </div>
            <div class="pmw-overlay">
              <div class="pmw-overlay-glass">
                <div class="pmw-meta">
                  <span class="pmw-plate">${esc(item.plateStr)}</span>
                  <div class="pmw-titles">
                    <div class="pmw-city">${esc(item.city)}</div>
                    <div class="pmw-region">${esc(item.regionIcon)} ${esc(item.region)}</div>
                  </div>
                </div>
                <button
                  type="button"
                  class="pmw-city-btn"
                  data-pmw-city-key="${esc(item.key)}"
                  title="${esc(item.city)} il sayfasına git"
                >
                  📍 İle Git
                </button>
              </div>
            </div>
          </div>
        </article>
      `).join('');

      gridHost.innerHTML = `<div class="pmw-masonry">${cardsHtml}</div>`;
    }

    function syncActiveButtons() {
      rootEl.querySelectorAll('[data-pmw-region]').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-pmw-region') === uiState.region);
      });
      rootEl.querySelectorAll('[data-pmw-status]').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-pmw-status') === uiState.status);
      });
      rootEl.querySelectorAll('[data-pmw-type]').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-pmw-type') === uiState.photoType);
      });
    }

    // Region buttons
    rootEl.querySelectorAll('[data-pmw-region]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiState.region = btn.getAttribute('data-pmw-region') || 'all';
        syncActiveButtons();
        renderGrid();
      });
    });

    // Status filter
    rootEl.querySelectorAll('[data-pmw-status]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiState.status = btn.getAttribute('data-pmw-status') || 'all';
        syncActiveButtons();
        renderGrid();
      });
    });

    // Photo type filter
    rootEl.querySelectorAll('[data-pmw-type]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiState.photoType = btn.getAttribute('data-pmw-type') || 'all';
        syncActiveButtons();
        renderGrid();
      });
    });

    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        uiState.search = searchInput.value;
        searchClearBtn.classList.toggle('visible', Boolean(uiState.search));
        renderGrid();
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        uiState.search = '';
        searchInput.value = '';
        searchClearBtn.classList.remove('visible');
        renderGrid();
        searchInput.focus();
      });
    }

    // Shuffle button
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        const shuffled = fisherYatesShuffle(allPhotos);
        uiState.shuffledIds = shuffled.map((p) => p.id);
        renderGrid();
        notifyToast(ctx, '🔀 162 kare mozaik duvarı karıştırıldı!');
      });
    }

    // Reset to plate order
    if (resetOrderBtn) {
      resetOrderBtn.addEventListener('click', () => {
        uiState.shuffledIds = null;
        renderGrid();
      });
    }

    // Auto-slide button
    if (slideshowBtn) {
      slideshowBtn.addEventListener('click', () => {
        startAutoSlideshow(currentFiltered, ctx);
      });
    }

    // Event delegation on Masonry grid for Lightbox & "📍 İle Git"
    gridHost.addEventListener('click', (e) => {
      const cityBtn = e.target.closest('[data-pmw-city-key]');
      if (cityBtn) {
        e.stopPropagation();
        const key = cityBtn.getAttribute('data-pmw-city-key');
        if (key && ctx && typeof ctx.selectCity === 'function') {
          ctx.selectCity(key);
        }
        return;
      }

      const card = e.target.closest('[data-pmw-idx]');
      if (card) {
        const idx = parseInt(card.getAttribute('data-pmw-idx'), 10) || 0;
        if (ctx && typeof ctx.openLightbox === 'function' && currentFiltered.length) {
          ctx.openLightbox(currentFiltered, idx);
        }
      }
    });

    // Keyboard activation on focused card
    gridHost.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.target.closest('[data-pmw-city-key]')) return;
      const card = e.target.closest('[data-pmw-idx]');
      if (card) {
        e.preventDefault();
        const idx = parseInt(card.getAttribute('data-pmw-idx'), 10) || 0;
        if (ctx && typeof ctx.openLightbox === 'function' && currentFiltered.length) {
          ctx.openLightbox(currentFiltered, idx);
        }
      }
    });

    renderGrid();
  }

  window.SEYYAH_MODULES.photoWall = {
    render
  };
})();
