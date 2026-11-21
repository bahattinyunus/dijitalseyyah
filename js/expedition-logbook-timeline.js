/**
 * Anadolu Seyahatnamesi — 🗓️ 39 Fethedilen İl Sefer Günlüğü & Hatırat Zaman Çizelgesi
 * (195 Gün • 10.898 km)
 * Chronological & regional editorial expedition logbook synthesizing all visited
 * provinces from ctx.data.provinces with dual-photo Lightbox, 5-Day Rule cumulative
 * day counters, inline localStorage memoir notes, regional filters, search, and
 * full 39-province Markdown report export.
 *
 * Registers on: window.SEYYAH_MODULES.expeditionLog = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STORAGE_KEY = 'dijital_seyyah_expedition_notes_v1';
  const STYLE_ID = 'seyyah-expedition-logbook-styles';
  const DAYS_PER_STOP = 5;

  const REGION_META = {
    '01_Marmara': {
      code: '01_Marmara',
      name: 'Marmara',
      fullName: 'Marmara Bölgesi',
      icon: '🏰',
      color: '#38bdf8',
      colorLight: '#0284c7',
      epithet: 'Payitaht & İki Kıtanın Eşiği'
    },
    '02_Ege': {
      code: '02_Ege',
      name: 'Ege',
      fullName: 'Ege Bölgesi',
      icon: '🌊',
      color: '#34d399',
      colorLight: '#059669',
      epithet: 'Zeytin Dalı & Kadim Mermerler'
    },
    '03_Akdeniz': {
      code: '03_Akdeniz',
      name: 'Akdeniz',
      fullName: 'Akdeniz Bölgesi',
      icon: '☀️',
      color: '#f59e0b',
      colorLight: '#d97706',
      epithet: 'Torosların Heybeti & Antik Limanlar'
    },
    '04_IcAnadolu': {
      code: '04_IcAnadolu',
      name: 'İç Anadolu',
      fullName: 'İç Anadolu Bölgesi',
      icon: '🌾',
      color: '#fbbf24',
      colorLight: '#b45309',
      epithet: 'Bozkırın Kalbi & İrfan Havzası'
    },
    '05_Karadeniz': {
      code: '05_Karadeniz',
      name: 'Karadeniz',
      fullName: 'Karadeniz Bölgesi',
      icon: '🌲',
      color: '#10b981',
      colorLight: '#047857',
      epithet: 'Zikir, Yayla & Hırçın Dalgalar'
    },
    '06_DoguAnadolu': {
      code: '06_DoguAnadolu',
      name: 'Doğu Anadolu',
      fullName: 'Doğu Anadolu Bölgesi',
      icon: '🏔️',
      color: '#a855f7',
      colorLight: '#7c3aed',
      epithet: 'Zirvelerin İhtişamı & Sarp Kaleler'
    },
    '07_GuneydoguAnadolu': {
      code: '07_GuneydoguAnadolu',
      name: 'Güneydoğu Anadolu',
      fullName: 'Güneydoğu Anadolu Bölgesi',
      icon: '🏜️',
      color: '#f97316',
      colorLight: '#ea580c',
      epithet: 'Mezopotamya & Taşın Hafızası'
    }
  };

  const MOOD_PRESETS = [
    { id: 'tefekkur', label: '🕊️ Tefekkür' },
    { id: 'ilim', label: '📚 Kütüphane Mesaisi' },
    { id: 'kesif', label: '🧭 Şehir Keşfi' },
    { id: 'hikmet', label: '✨ Gönül İzi' }
  ];

  // Persistent UI state across re-renders within session
  const uiState = {
    region: 'all',
    search: '',
    onlyWithNotes: false,
    sortOrder: 'chronological', // 'chronological' | 'reverse' | 'plate'
    editingKey: null,
    draftText: '',
    draftMood: 'tefekkur'
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
    return (Number(n) || 0).toLocaleString('tr-TR');
  }

  function formatTimestampTR(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return String(iso);
      return d.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (_) {
      return '';
    }
  }

  function getRegionInfo(regionCode, regionName) {
    if (regionCode && REGION_META[regionCode]) return REGION_META[regionCode];
    const byName = Object.values(REGION_META).find(
      (r) => r.name === regionName || r.fullName === regionName
    );
    return (
      byName || {
        code: regionCode || 'other',
        name: regionName || 'Anadolu',
        fullName: regionName || 'Anadolu',
        icon: '🧭',
        color: '#00f2fe',
        colorLight: '#0284c7',
        epithet: 'Sefer Yolu'
      }
    );
  }

  function stripMarkdownBold(str) {
    return String(str || '').replace(/\*\*/g, '');
  }

  // ---------------------------------------------------------------------------
  // LocalStorage Memoir Notes Persistence
  // ---------------------------------------------------------------------------

  function loadMemoirNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      const clean = {};
      Object.keys(parsed).forEach((key) => {
        const entry = parsed[key];
        if (typeof entry === 'string') {
          const text = entry.trim();
          if (text) {
            clean[key] = { text, mood: 'tefekkur', updatedAt: '' };
          }
        } else if (entry && typeof entry === 'object' && typeof entry.text === 'string') {
          const text = entry.text.trim();
          if (text) {
            clean[key] = {
              text: text.slice(0, 1500),
              mood: typeof entry.mood === 'string' ? entry.mood : 'tefekkur',
              updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : ''
            };
          }
        }
      });
      return clean;
    } catch (_) {
      return {};
    }
  }

  function saveMemoirNotes(notesMap) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notesMap || {}));
      return true;
    } catch (_) {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Expedition Dataset Builder
  // ---------------------------------------------------------------------------

  function buildExpeditionEntries(ctx) {
    const provincesMap = (ctx && ctx.data && ctx.data.provinces) || {};
    const entries = Object.entries(provincesMap)
      .filter(([, p]) => p && p.visited === true)
      .map(([key, p]) => ({ key, p }));

    // Canonical chronological/regional expedition sequence:
    // Ordered by region_code (01_Marmara .. 06_DoguAnadolu) then Turkish alphabetical name
    entries.sort((a, b) => {
      const regA = a.p.region_code || '';
      const regB = b.p.region_code || '';
      const regCmp = regA.localeCompare(regB);
      if (regCmp !== 0) return regCmp;
      return (a.p.name || '').localeCompare(b.p.name || '', 'tr');
    });

    const total = entries.length;
    return entries.map((item, idx) => {
      const p = item.p;
      const dayStart = idx * DAYS_PER_STOP + 1;
      const dayEnd = (idx + 1) * DAYS_PER_STOP;
      const regInfo = getRegionInfo(p.region_code, p.region);
      return {
        key: item.key,
        p,
        stopNumber: idx + 1,
        totalStops: total,
        dayStart,
        dayEnd,
        dayRangeLabel: `Gün ${dayStart}–${dayEnd}`,
        regionInfo: regInfo
      };
    });
  }

  function getVisitedRegionsSummary(entries) {
    const map = new Map();
    entries.forEach((entry) => {
      const code = entry.regionInfo.code;
      if (!map.has(code)) {
        map.set(code, {
          ...entry.regionInfo,
          count: 0,
          dayStart: entry.dayStart,
          dayEnd: entry.dayEnd
        });
      }
      const item = map.get(code);
      item.count += 1;
      item.dayStart = Math.min(item.dayStart, entry.dayStart);
      item.dayEnd = Math.max(item.dayEnd, entry.dayEnd);
    });
    return Array.from(map.values());
  }

  // ---------------------------------------------------------------------------
  // Markdown Report Generator & Download
  // ---------------------------------------------------------------------------

  function buildFullMarkdownReport(entries, notesMap, stats) {
    const totalStops = entries.length;
    const totalDays = totalStops * DAYS_PER_STOP;
    const totalKm = (stats && stats.estimated_km) || 10898;
    const regions = getVisitedRegionsSummary(entries);
    const savedNotesCount = entries.filter((e) => notesMap[e.key] && notesMap[e.key].text).length;
    const generatedAt = new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const lines = [];
    lines.push(`# 🗓️ Anadolu Seyahatnamesi — ${totalStops} Fethedilen İl Tam Sefer Raporu`);
    lines.push('');
    lines.push(
      `> *"Bir şehri gerçekten görmek, haritada nokta işaretlemek değil; kütüphanesinde 5 gün demlenip taşındaki tarihi ve insanındaki hikmeti okumaktır."*`
    );
    lines.push('');
    lines.push('## 📊 Sefer Künyesi');
    lines.push(`- **Fethedilen Menzil Sayısı:** ${totalStops} / ${(stats && stats.total_cities) || 81} İl`);
    lines.push(`- **Kapsanan Coğrafi Bölge:** ${regions.length} Bölge (${regions.map((r) => r.name).join(', ')})`);
    lines.push(`- **5 Gün Kuralı Toplam Sefer Süresi:** ${totalDays} Gün`);
    lines.push(`- **Kat Edilen Tahmini Mesafe:** ${formatNumber(totalKm)} km`);
    lines.push(`- **İl Halk Kütüphanesi Mesaisi:** ${formatNumber(totalStops * 20)} Saat`);
    lines.push(`- **Kişisel Hatıra Notu Eklenen Menzil:** ${savedNotesCount} / ${totalStops}`);
    lines.push(`- **Rapor Oluşturma Tarihi:** ${generatedAt}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    let lastRegionCode = '';
    entries.forEach((entry) => {
      const { p, stopNumber, dayRangeLabel, regionInfo } = entry;
      if (regionInfo.code !== lastRegionCode) {
        lastRegionCode = regionInfo.code;
        const regStats = regions.find((r) => r.code === lastRegionCode);
        lines.push(
          `## ${regionInfo.icon} ${regionInfo.fullName} (${regStats ? regStats.count : ''} İl • Gün ${regStats ? `${regStats.dayStart}–${regStats.dayEnd}` : ''})`
        );
        lines.push(`*${regionInfo.epithet}*`);
        lines.push('');
      }

      const plateStr = formatPlate(p.plate);
      const quote = p.custom_quote || p.quote || '';
      const library = p.custom_library || p.library || '';
      const reflection = p.reflection || '';
      const landmarks = Array.isArray(p.landmarks) ? p.landmarks : [];
      const specialties = Array.isArray(p.specialties) ? p.specialties : [];
      const personalNote = notesMap[entry.key];

      lines.push(`### ${stopNumber}. [${plateStr}] ${p.name} — ${dayRangeLabel}`);
      lines.push(`- **Bölge:** ${p.region || regionInfo.name}`);
      if (quote) lines.push(`- **Menzil Sözü:** *"${quote}"*`);
      if (library) lines.push(`- **Kütüphane Ofisi:** ${library}`);
      if (reflection) lines.push(`- **Tefekkür & Seyahatname Notu:** ${reflection}`);
      if (landmarks.length) lines.push(`- **Öne Çıkan Duraklar:** ${landmarks.join(' • ')}`);
      if (specialties.length) lines.push(`- **Yöresel Tatlar:** ${specialties.join(', ')}`);
      if (p.banner_rel || p.gallery_rel) {
        const photos = [p.banner_rel, p.gallery_rel].filter(Boolean);
        lines.push(`- **Fotoğraf Arşivi:** ${photos.map((src) => `\`${src}\``).join(' | ')}`);
      }
      if (personalNote && personalNote.text) {
        const moodObj = MOOD_PRESETS.find((m) => m.id === personalNote.mood);
        const moodTag = moodObj ? ` (${moodObj.label})` : '';
        lines.push(`- **✍️ Kişisel Hatıra Notum${moodTag}:** ${personalNote.text}`);
      }
      lines.push('');
    });

    lines.push('---');
    lines.push('*Anadolu Seyahatnamesi • Dijital Seyyah Sefer Günlüğü Stüdyosu tarafından üretildi.*');
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
  // Scoped Styles (Dark & Light Theme Compatible)
  // ---------------------------------------------------------------------------

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .elt-studio {
        max-width: 1220px;
        margin: 0 auto;
        padding: 18px 18px 56px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        animation: eltFadeIn 0.28s ease-out;
      }

      @keyframes eltFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Hero Header */
      .elt-hero {
        position: relative;
        overflow: hidden;
        padding: 26px 28px;
        border-radius: var(--radius-lg, 20px);
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(18, 34, 58, 0.88) 55%, rgba(15, 23, 42, 0.94) 100%);
        border: 1px solid rgba(0, 242, 254, 0.24);
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.5));
      }

      .elt-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 12% 18%, rgba(0, 242, 254, 0.14), transparent 42%),
          radial-gradient(circle at 88% 80%, rgba(245, 158, 11, 0.14), transparent 44%);
        pointer-events: none;
      }

      .elt-hero-inner {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 18px;
      }

      .elt-hero-text {
        flex: 1 1 520px;
      }

      .elt-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.76rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.1);
        border: 1px solid rgba(0, 242, 254, 0.28);
        padding: 4px 12px;
        border-radius: 999px;
        margin-bottom: 12px;
      }

      .elt-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.35rem, 2.5vw, 1.95rem);
        font-weight: 800;
        line-height: 1.25;
        color: var(--text-primary, #f8fafc);
        margin-bottom: 8px;
      }

      .elt-subtitle {
        font-size: 0.94rem;
        color: var(--text-secondary, #94a3b8);
        max-width: 720px;
        line-height: 1.6;
      }

      .elt-hero-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
      }

      .elt-export-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 11px 18px;
        border-radius: 12px;
        border: 1px solid rgba(245, 158, 11, 0.48);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(217, 119, 6, 0.16));
        color: #fef3c7;
        font-family: inherit;
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.22s ease;
        box-shadow: 0 4px 16px rgba(245, 158, 11, 0.16);
      }

      .elt-export-btn:hover {
        transform: translateY(-2px);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.34), rgba(217, 119, 6, 0.26));
        border-color: rgba(245, 158, 11, 0.78);
        box-shadow: 0 8px 22px rgba(245, 158, 11, 0.26);
      }

      /* KPI Stats Strip */
      .elt-kpi-grid {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin-top: 20px;
      }

      .elt-kpi-card {
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .elt-kpi-label {
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted, #64748b);
        font-weight: 600;
      }

      .elt-kpi-value {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .elt-kpi-sub {
        font-size: 0.76rem;
        color: var(--accent-cyan, #00f2fe);
      }

      /* Control Bar: Region Tabs + Search + Sort */
      .elt-controls {
        padding: 16px 18px;
        border-radius: var(--radius-md, 14px);
        background: var(--bg-card, rgba(30, 41, 59, 0.7));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .elt-region-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .elt-region-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 13px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.52);
        color: var(--text-secondary, #94a3b8);
        font-family: inherit;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .elt-region-pill:hover {
        border-color: var(--pill-color, var(--accent-cyan, #00f2fe));
        color: var(--text-primary, #f8fafc);
        transform: translateY(-1px);
      }

      .elt-region-pill.active {
        background: rgba(0, 242, 254, 0.14);
        border-color: var(--pill-color, var(--accent-cyan, #00f2fe));
        color: var(--text-primary, #f8fafc);
        box-shadow: 0 0 14px rgba(0, 242, 254, 0.18);
      }

      .elt-pill-count {
        font-size: 0.72rem;
        padding: 1px 7px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: inherit;
      }

      .elt-search-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
      }

      .elt-search-wrap {
        flex: 1 1 280px;
        position: relative;
        display: flex;
        align-items: center;
      }

      .elt-search-icon {
        position: absolute;
        left: 12px;
        font-size: 0.92rem;
        pointer-events: none;
        opacity: 0.75;
      }

      .elt-search-input {
        width: 100%;
        padding: 10px 36px 10px 36px;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.88rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .elt-search-input:focus {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .elt-clear-search {
        position: absolute;
        right: 10px;
        background: transparent;
        border: none;
        color: var(--text-muted, #64748b);
        cursor: pointer;
        font-size: 0.95rem;
        padding: 2px 5px;
      }

      .elt-clear-search:hover {
        color: var(--text-primary, #f8fafc);
      }

      .elt-sort-select,
      .elt-filter-toggle {
        padding: 9px 13px;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-secondary, #94a3b8);
        font-family: inherit;
        font-size: 0.83rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .elt-filter-toggle.active {
        background: rgba(168, 85, 247, 0.18);
        border-color: rgba(168, 85, 247, 0.55);
        color: var(--text-primary, #f8fafc);
      }

      .elt-result-meta {
        font-size: 0.82rem;
        color: var(--text-muted, #64748b);
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
      }

      /* Timeline Container & Spine */
      .elt-timeline {
        position: relative;
        padding-left: 34px;
        display: flex;
        flex-direction: column;
        gap: 22px;
      }

      .elt-timeline::before {
        content: '';
        position: absolute;
        left: 12px;
        top: 10px;
        bottom: 10px;
        width: 2px;
        background: linear-gradient(
          180deg,
          rgba(0, 242, 254, 0.6) 0%,
          rgba(16, 185, 129, 0.5) 35%,
          rgba(245, 158, 11, 0.5) 70%,
          rgba(168, 85, 247, 0.6) 100%
        );
        border-radius: 2px;
      }

      /* Regional Chapter Divider */
      .elt-chapter-banner {
        position: relative;
        margin-top: 6px;
        padding: 12px 18px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-left: 4px solid var(--reg-color, #00f2fe);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .elt-chapter-banner::before {
        content: '';
        position: absolute;
        left: -29px;
        top: 50%;
        width: 14px;
        height: 14px;
        border-radius: 4px;
        transform: translateY(-50%) rotate(45deg);
        background: var(--reg-color, #00f2fe);
        box-shadow: 0 0 12px var(--reg-color, #00f2fe);
      }

      .elt-chapter-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .elt-chapter-meta {
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
        font-weight: 600;
      }

      /* Stop Card */
      .elt-stop-card {
        position: relative;
        border-radius: 16px;
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
        padding: 20px 22px;
        transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
      }

      .elt-stop-card:hover {
        border-color: var(--reg-color, rgba(0, 242, 254, 0.45));
        box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.45);
      }

      .elt-stop-node {
        position: absolute;
        left: -30px;
        top: 24px;
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: var(--bg-primary, #0a0f1d);
        border: 3px solid var(--reg-color, #00f2fe);
        box-shadow: 0 0 12px var(--reg-color, rgba(0, 242, 254, 0.5));
      }

      .elt-card-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 14px;
      }

      .elt-card-title-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
      }

      .elt-plate-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 38px;
        height: 30px;
        padding: 0 9px;
        border-radius: 8px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-weight: 800;
        font-size: 0.92rem;
        background: rgba(0, 242, 254, 0.14);
        border: 1px solid rgba(0, 242, 254, 0.35);
        color: var(--accent-cyan, #00f2fe);
      }

      .elt-city-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.32rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        margin: 0;
      }

      .elt-region-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.77rem;
        font-weight: 700;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: var(--text-secondary, #cbd5e1);
      }

      .elt-day-badges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .elt-stop-index {
        font-size: 0.76rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        color: var(--text-secondary, #94a3b8);
      }

      .elt-day-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        font-weight: 800;
        padding: 5px 12px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.42);
        color: #fcd34d;
      }

      /* Dual Photo Strip */
      .elt-photo-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }

      .elt-photo-tile {
        position: relative;
        overflow: hidden;
        border-radius: 12px;
        aspect-ratio: 16 / 9;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(15, 23, 42, 0.85);
        cursor: pointer;
        padding: 0;
        display: block;
        width: 100%;
        text-align: left;
      }

      .elt-photo-tile img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.35s ease;
      }

      .elt-photo-tile:hover img {
        transform: scale(1.04);
      }

      .elt-photo-caption {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 20px 10px 7px;
        background: linear-gradient(180deg, transparent 0%, rgba(4, 9, 20, 0.86) 100%);
        color: #f8fafc;
        font-size: 0.74rem;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      /* Editorial Content Blocks */
      .elt-quote-block {
        margin: 0 0 14px;
        padding: 12px 16px;
        border-left: 3px solid var(--accent-gold, #f59e0b);
        border-radius: 0 10px 10px 0;
        background: rgba(245, 158, 11, 0.08);
        color: var(--text-primary, #f8fafc);
        font-style: italic;
        font-size: 0.94rem;
        line-height: 1.55;
      }

      .elt-details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 12px;
        margin-bottom: 14px;
      }

      .elt-detail-box {
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.52);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .elt-detail-label {
        font-size: 0.74rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--accent-cyan, #00f2fe);
        margin-bottom: 5px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .elt-detail-box.elt-reflection-box .elt-detail-label {
        color: var(--accent-emerald, #10b981);
      }

      .elt-detail-text {
        font-size: 0.87rem;
        color: var(--text-secondary, #cbd5e1);
        line-height: 1.58;
      }

      /* Landmarks */
      .elt-landmarks-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 7px;
        margin-bottom: 14px;
      }

      .elt-landmarks-prefix {
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--text-muted, #64748b);
        margin-right: 2px;
      }

      .elt-landmark-chip {
        font-size: 0.78rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.1);
        border: 1px solid rgba(56, 189, 248, 0.24);
        color: var(--text-primary, #e2e8f0);
      }

      /* Inline Memoir Note Section */
      .elt-memoir-section {
        margin-top: 8px;
        padding-top: 12px;
        border-top: 1px dashed rgba(255, 255, 255, 0.12);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .elt-memoir-saved {
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(168, 85, 247, 0.1);
        border: 1px solid rgba(168, 85, 247, 0.34);
      }

      .elt-memoir-saved-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }

      .elt-memoir-saved-title {
        font-size: 0.8rem;
        font-weight: 700;
        color: #d8b4fe;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .elt-memoir-saved-date {
        font-size: 0.74rem;
        color: var(--text-muted, #94a3b8);
        font-weight: 500;
      }

      .elt-memoir-saved-body {
        font-size: 0.89rem;
        color: var(--text-primary, #f8fafc);
        line-height: 1.55;
        white-space: pre-wrap;
      }

      .elt-card-footer-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      .elt-btn-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .elt-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 13px;
        border-radius: 9px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.6);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .elt-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
      }

      .elt-btn-note {
        border-color: rgba(168, 85, 247, 0.42);
        background: rgba(168, 85, 247, 0.12);
        color: #e9d5ff;
      }

      .elt-btn-note:hover {
        border-color: rgba(168, 85, 247, 0.75);
        background: rgba(168, 85, 247, 0.22);
      }

      .elt-btn-danger {
        border-color: rgba(244, 63, 94, 0.35);
        color: #fda4af;
      }

      .elt-btn-danger:hover {
        border-color: rgba(244, 63, 94, 0.7);
        background: rgba(244, 63, 94, 0.16);
      }

      .elt-btn-primary {
        border-color: rgba(16, 185, 129, 0.55);
        background: rgba(16, 185, 129, 0.2);
        color: #d1fae5;
      }

      .elt-btn-primary:hover {
        border-color: rgba(16, 185, 129, 0.85);
        background: rgba(16, 185, 129, 0.3);
      }

      /* Inline Editor */
      .elt-editor-box {
        padding: 14px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(168, 85, 247, 0.45);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .elt-editor-moods {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .elt-mood-chip {
        padding: 5px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.04);
        color: var(--text-secondary, #94a3b8);
        font-family: inherit;
        font-size: 0.76rem;
        font-weight: 600;
        cursor: pointer;
      }

      .elt-mood-chip.active {
        border-color: rgba(168, 85, 247, 0.7);
        background: rgba(168, 85, 247, 0.22);
        color: #f3e8ff;
      }

      .elt-editor-textarea {
        width: 100%;
        min-height: 86px;
        resize: vertical;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(10, 15, 29, 0.75);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.88rem;
        line-height: 1.5;
        outline: none;
      }

      .elt-editor-textarea:focus {
        border-color: #a855f7;
      }

      .elt-empty-state {
        padding: 40px 20px;
        text-align: center;
        border-radius: 16px;
        background: var(--bg-card, rgba(30, 41, 59, 0.6));
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.16));
        color: var(--text-secondary, #94a3b8);
      }

      /* Light Theme Overrides */
      body.light-theme .elt-hero {
        background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 55%, #fffbeb 100%);
        border-color: rgba(2, 132, 199, 0.25);
        box-shadow: 0 10px 28px -8px rgba(15, 23, 42, 0.1);
      }

      body.light-theme .elt-eyebrow {
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.28);
        color: #0369a1;
      }

      body.light-theme .elt-export-btn {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #ffffff;
        border-color: #b45309;
      }

      body.light-theme .elt-kpi-card {
        background: rgba(248, 250, 252, 0.9);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .elt-kpi-sub {
        color: #0284c7;
      }

      body.light-theme .elt-controls {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .elt-region-pill {
        background: #f1f5f9;
        border-color: rgba(15, 23, 42, 0.12);
        color: #334155;
      }

      body.light-theme .elt-region-pill.active {
        background: rgba(2, 132, 199, 0.12);
        color: #0f172a;
        box-shadow: none;
      }

      body.light-theme .elt-pill-count {
        background: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .elt-search-input,
      body.light-theme .elt-sort-select,
      body.light-theme .elt-filter-toggle {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.15);
        color: #0f172a;
      }

      body.light-theme .elt-chapter-banner {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .elt-stop-card {
        background: rgba(255, 255, 255, 0.94);
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 6px 20px -8px rgba(15, 23, 42, 0.1);
      }

      body.light-theme .elt-stop-node {
        background: #ffffff;
      }

      body.light-theme .elt-plate-badge {
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.3);
        color: #0369a1;
      }

      body.light-theme .elt-region-badge,
      body.light-theme .elt-stop-index {
        background: #f1f5f9;
        border-color: rgba(15, 23, 42, 0.1);
        color: #334155;
      }

      body.light-theme .elt-day-badge {
        background: rgba(217, 119, 6, 0.12);
        border-color: rgba(217, 119, 6, 0.35);
        color: #92400e;
      }

      body.light-theme .elt-quote-block {
        background: rgba(245, 158, 11, 0.1);
        color: #1e293b;
      }

      body.light-theme .elt-detail-box {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.09);
      }

      body.light-theme .elt-detail-label {
        color: #0284c7;
      }

      body.light-theme .elt-detail-box.elt-reflection-box .elt-detail-label {
        color: #059669;
      }

      body.light-theme .elt-detail-text {
        color: #334155;
      }

      body.light-theme .elt-landmark-chip {
        background: rgba(2, 132, 199, 0.08);
        border-color: rgba(2, 132, 199, 0.22);
        color: #0f172a;
      }

      body.light-theme .elt-memoir-section {
        border-top-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .elt-memoir-saved {
        background: rgba(124, 58, 237, 0.07);
        border-color: rgba(124, 58, 237, 0.28);
      }

      body.light-theme .elt-memoir-saved-title {
        color: #6d28d9;
      }

      body.light-theme .elt-btn {
        background: #f1f5f9;
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      body.light-theme .elt-btn-note {
        background: rgba(124, 58, 237, 0.1);
        border-color: rgba(124, 58, 237, 0.35);
        color: #5b21b6;
      }

      body.light-theme .elt-btn-danger {
        color: #be123c;
      }

      body.light-theme .elt-btn-primary {
        background: rgba(5, 150, 105, 0.14);
        border-color: rgba(5, 150, 105, 0.45);
        color: #065f46;
      }

      body.light-theme .elt-editor-box {
        background: #f8fafc;
        border-color: rgba(124, 58, 237, 0.38);
      }

      body.light-theme .elt-mood-chip {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.14);
        color: #475569;
      }

      body.light-theme .elt-mood-chip.active {
        background: rgba(124, 58, 237, 0.14);
        border-color: #7c3aed;
        color: #5b21b6;
      }

      body.light-theme .elt-editor-textarea {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.16);
        color: #0f172a;
      }

      @media (max-width: 720px) {
        .elt-studio {
          padding: 12px 10px 44px;
        }
        .elt-hero {
          padding: 18px 16px;
        }
        .elt-hero-actions {
          width: 100%;
          align-items: stretch;
        }
        .elt-export-btn {
          justify-content: center;
        }
        .elt-timeline {
          padding-left: 22px;
        }
        .elt-timeline::before {
          left: 6px;
        }
        .elt-stop-node {
          left: -23px;
        }
        .elt-chapter-banner::before {
          left: -22px;
        }
        .elt-photo-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Render Engine
  // ---------------------------------------------------------------------------

  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const esc = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const norm = typeof safeCtx.normalizeTurkish === 'function'
      ? safeCtx.normalizeTurkish
      : fallbackNormalizeTurkish;

    const allEntries = buildExpeditionEntries(safeCtx);
    const regions = getVisitedRegionsSummary(allEntries);
    const notesMap = loadMemoirNotes();
    const stats = (safeCtx.data && safeCtx.data.stats) || {};
    const totalStops = allEntries.length;
    const totalDays = totalStops * DAYS_PER_STOP;
    const totalKm = stats.estimated_km || 10898;
    const totalLibraryHours = totalStops * 20;
    const savedNotesCount = allEntries.filter((e) => notesMap[e.key] && notesMap[e.key].text).length;

    // Filter entries by region, notes toggle, and search query
    const searchNorm = norm(uiState.search);
    let filtered = allEntries.filter((entry) => {
      if (uiState.region !== 'all' && entry.regionInfo.code !== uiState.region) {
        return false;
      }
      if (uiState.onlyWithNotes && !(notesMap[entry.key] && notesMap[entry.key].text)) {
        return false;
      }
      if (!searchNorm) return true;
      const p = entry.p;
      const noteText = (notesMap[entry.key] && notesMap[entry.key].text) || '';
      const haystack = norm(
        [
          p.name,
          formatPlate(p.plate),
          p.region,
          p.custom_quote || p.quote,
          p.custom_library || p.library,
          p.reflection,
          (p.landmarks || []).join(' '),
          (p.specialties || []).join(' '),
          entry.dayRangeLabel,
          noteText
        ].join(' ')
      );
      return haystack.includes(searchNorm);
    });

    if (uiState.sortOrder === 'reverse') {
      filtered = [...filtered].reverse();
    } else if (uiState.sortOrder === 'plate') {
      filtered = [...filtered].sort((a, b) => (Number(a.p.plate) || 0) - (Number(b.p.plate) || 0));
    }

    const showRegionChapters = uiState.sortOrder !== 'plate';

    // Build timeline HTML
    let lastRegion = '';
    const timelineHtml = filtered.length
      ? filtered
          .map((entry) => {
            const { p, key, stopNumber, dayRangeLabel, regionInfo } = entry;
            const plateStr = formatPlate(p.plate);
            const quote = p.custom_quote || p.quote || '';
            const library = stripMarkdownBold(p.custom_library || p.library || '');
            const reflection = p.reflection || '';
            const landmarks = Array.isArray(p.landmarks) ? p.landmarks : [];
            const note = notesMap[key] || null;
            const isEditing = uiState.editingKey === key;

            let chapterHtml = '';
            if (showRegionChapters && regionInfo.code !== lastRegion) {
              lastRegion = regionInfo.code;
              const regSummary = regions.find((r) => r.code === lastRegion);
              chapterHtml = `
                <div class="elt-chapter-banner" style="--reg-color: ${esc(regionInfo.color)}">
                  <div class="elt-chapter-title">
                    <span>${esc(regionInfo.icon)}</span>
                    <span>${esc(regionInfo.fullName)}</span>
                  </div>
                  <div class="elt-chapter-meta">
                    ${regSummary ? `${regSummary.count} İl • Gün ${regSummary.dayStart}–${regSummary.dayEnd} • ${esc(regionInfo.epithet)}` : ''}
                  </div>
                </div>
              `;
            }

            const photosHtml = [
              p.banner_rel
                ? {
                    src: p.banner_rel,
                    label: 'Ana Görünüm (Banner)',
                    idx: 0
                  }
                : null,
              p.gallery_rel
                ? {
                    src: p.gallery_rel,
                    label: 'Sefer Galerisi',
                    idx: p.banner_rel ? 1 : 0
                  }
                : null
            ]
              .filter(Boolean)
              .map(
                (photo) => `
                <button
                  type="button"
                  class="elt-photo-tile"
                  data-elt-photo-key="${esc(key)}"
                  data-elt-photo-idx="${photo.idx}"
                  title="Fotoğrafı Lightbox'ta büyüt"
                >
                  <img src="${esc(photo.src)}" alt="${esc(p.name)} — ${esc(photo.label)}" loading="lazy" />
                  <span class="elt-photo-caption">
                    <span>📷 ${esc(photo.label)}</span>
                    <span>🔍 Büyüt</span>
                  </span>
                </button>
              `
              )
              .join('');

            const landmarksHtml = landmarks.length
              ? `
                <div class="elt-landmarks-row">
                  <span class="elt-landmarks-prefix">🏛️ Duraklar:</span>
                  ${landmarks.map((lm) => `<span class="elt-landmark-chip">${esc(lm)}</span>`).join('')}
                </div>
              `
              : '';

            const moodObj = note ? MOOD_PRESETS.find((m) => m.id === note.mood) : null;
            const savedNoteHtml =
              note && !isEditing
                ? `
                  <div class="elt-memoir-saved">
                    <div class="elt-memoir-saved-head">
                      <span class="elt-memoir-saved-title">
                        <span>✍️ Kişisel Hatıra Notum</span>
                        ${moodObj ? `<span>• ${esc(moodObj.label)}</span>` : ''}
                      </span>
                      ${note.updatedAt ? `<span class="elt-memoir-saved-date">${esc(formatTimestampTR(note.updatedAt))}</span>` : ''}
                    </div>
                    <div class="elt-memoir-saved-body">${esc(note.text)}</div>
                  </div>
                `
                : '';

            const editorHtml = isEditing
              ? `
                <div class="elt-editor-box" data-elt-editor="${esc(key)}">
                  <div class="elt-editor-moods">
                    ${MOOD_PRESETS.map(
                      (m) => `
                        <button
                          type="button"
                          class="elt-mood-chip ${uiState.draftMood === m.id ? 'active' : ''}"
                          data-elt-mood="${esc(m.id)}"
                        >${esc(m.label)}</button>
                      `
                    ).join('')}
                  </div>
                  <textarea
                    class="elt-editor-textarea"
                    data-elt-textarea="${esc(key)}"
                    placeholder="${esc(p.name)} menzilindeki kütüphane mesaisi, sokak izlenimi veya gönül notunuzu yazın..."
                  >${esc(uiState.draftText)}</textarea>
                  <div class="elt-btn-group">
                    <button type="button" class="elt-btn elt-btn-primary" data-elt-save="${esc(key)}">💾 Hatırayı Kaydet</button>
                    <button type="button" class="elt-btn" data-elt-cancel="${esc(key)}">Vazgeç</button>
                  </div>
                </div>
              `
              : '';

            return `
              ${chapterHtml}
              <article class="elt-stop-card" style="--reg-color: ${esc(regionInfo.color)}" data-elt-card="${esc(key)}">
                <span class="elt-stop-node" aria-hidden="true"></span>
                <div class="elt-card-header">
                  <div class="elt-card-title-group">
                    <span class="elt-plate-badge">${esc(plateStr)}</span>
                    <h3 class="elt-city-name">${esc(p.name)}</h3>
                    <span class="elt-region-badge">${esc(regionInfo.icon)} ${esc(p.region || regionInfo.name)}</span>
                  </div>
                  <div class="elt-day-badges">
                    <span class="elt-stop-index">Menzil #${stopNumber} / ${totalStops}</span>
                    <span class="elt-day-badge">🗓️ ${esc(dayRangeLabel)}</span>
                  </div>
                </div>

                ${photosHtml ? `<div class="elt-photo-grid">${photosHtml}</div>` : ''}

                ${quote ? `<blockquote class="elt-quote-block">“${esc(quote)}”</blockquote>` : ''}

                <div class="elt-details-grid">
                  ${
                    library
                      ? `
                        <div class="elt-detail-box">
                          <div class="elt-detail-label">📚 İl Halk Kütüphanesi Ofisi</div>
                          <div class="elt-detail-text">${esc(library)}</div>
                        </div>
                      `
                      : ''
                  }
                  ${
                    reflection
                      ? `
                        <div class="elt-detail-box elt-reflection-box">
                          <div class="elt-detail-label">🕊️ Seyahatname & Tefekkür Notu</div>
                          <div class="elt-detail-text">${esc(reflection)}</div>
                        </div>
                      `
                      : ''
                  }
                </div>

                ${landmarksHtml}

                <div class="elt-memoir-section">
                  ${savedNoteHtml}
                  ${editorHtml}
                  <div class="elt-card-footer-actions">
                    <div class="elt-btn-group">
                      ${
                        !isEditing
                          ? `<button type="button" class="elt-btn elt-btn-note" data-elt-edit="${esc(key)}">${
                              note ? '✏️ Hatıra Notunu Düzenle' : '✍️ Bu Menzile Özel Hatıra Notu Ekle'
                            }</button>`
                          : ''
                      }
                      ${
                        note && !isEditing
                          ? `<button type="button" class="elt-btn elt-btn-danger" data-elt-delete="${esc(key)}">🗑️ Notu Sil</button>`
                          : ''
                      }
                    </div>
                    <button type="button" class="elt-btn" data-elt-city="${esc(key)}">🧭 Şehir Dosyasını Aç →</button>
                  </div>
                </div>
              </article>
            `;
          })
          .join('')
      : `
        <div class="elt-empty-state">
          <p style="font-size: 1.05rem; font-weight: 700; margin-bottom: 6px;">Aranan kriterlere uygun fethedilmiş menzil bulunamadı.</p>
          <p style="font-size: 0.88rem;">Bölge filtresini veya arama terimini temizleyerek 39 menzilin tamamını görüntüleyebilirsiniz.</p>
        </div>
      `;

    container.innerHTML = `
      <section class="elt-studio" aria-label="39 Fethedilen İl Sefer Günlüğü ve Hatırat Zaman Çizelgesi">
        <header class="elt-hero">
          <div class="elt-hero-inner">
            <div class="elt-hero-text">
              <span class="elt-eyebrow">🧭 Dijital Seyyah • 5 Gün Kuralı Kronoloji & Hatırat Stüdyosu</span>
              <h2 class="elt-title">🗓️ ${totalStops} Fethedilen İl Sefer Günlüğü &amp; Hatırat Zaman Çizelgesi (${totalDays} Gün • ${formatNumber(totalKm)} km)</h2>
              <p class="elt-subtitle">
                ${regions.length} coğrafi bölgede adım adım işlenen her ilin kütüphane ofisi, saha fotoğrafçılığı,
                edebî sözleri ve tefekkür izleri tek bir editoryal zaman çizelgesinde. Her menzile kendi kişisel hatıra
                notunuzu ekleyebilir, tamamını tek tıkla Markdown külliyatı olarak indirebilirsiniz.
              </p>
            </div>
            <div class="elt-hero-actions">
              <button type="button" class="elt-export-btn" id="elt-btn-export-md">
                📥 39 İl Tam Sefer Raporunu İndir (Markdown)
              </button>
            </div>
          </div>

          <div class="elt-kpi-grid">
            <div class="elt-kpi-card">
              <span class="elt-kpi-label">Fethedilen Menzil</span>
              <span class="elt-kpi-value">${totalStops} İl</span>
              <span class="elt-kpi-sub">${regions.length} Bölgede Tamamlandı</span>
            </div>
            <div class="elt-kpi-card">
              <span class="elt-kpi-label">5 Gün Kuralı</span>
              <span class="elt-kpi-value">${totalDays} Gün</span>
              <span class="elt-kpi-sub">Gün 1–5 → Gün ${Math.max(1, totalDays - 4)}–${totalDays}</span>
            </div>
            <div class="elt-kpi-card">
              <span class="elt-kpi-label">Toplam Mesafe</span>
              <span class="elt-kpi-value">${formatNumber(totalKm)} km</span>
              <span class="elt-kpi-sub">Anadolu Sefer Hattı</span>
            </div>
            <div class="elt-kpi-card">
              <span class="elt-kpi-label">Kütüphane Mesaisi</span>
              <span class="elt-kpi-value">${formatNumber(totalLibraryHours)} Saat</span>
              <span class="elt-kpi-sub">${totalStops} İl Halk Kütüphanesi</span>
            </div>
            <div class="elt-kpi-card">
              <span class="elt-kpi-label">Kişisel Hatıra</span>
              <span class="elt-kpi-value">${savedNotesCount} / ${totalStops}</span>
              <span class="elt-kpi-sub">Tarayıcıda Kayıtlı Not</span>
            </div>
          </div>
        </header>

        <div class="elt-controls">
          <div class="elt-region-pills" role="tablist" aria-label="Bölge Filtresi">
            <button
              type="button"
              class="elt-region-pill ${uiState.region === 'all' ? 'active' : ''}"
              data-elt-region="all"
              style="--pill-color: #00f2fe"
            >
              <span>🇹🇷 Tüm Bölgeler</span>
              <span class="elt-pill-count">${totalStops}</span>
            </button>
            ${regions
              .map(
                (reg) => `
                  <button
                    type="button"
                    class="elt-region-pill ${uiState.region === reg.code ? 'active' : ''}"
                    data-elt-region="${esc(reg.code)}"
                    style="--pill-color: ${esc(reg.color)}"
                  >
                    <span>${esc(reg.icon)} ${esc(reg.name)}</span>
                    <span class="elt-pill-count">${reg.count}</span>
                  </button>
                `
              )
              .join('')}
          </div>

          <div class="elt-search-row">
            <div class="elt-search-wrap">
              <span class="elt-search-icon" aria-hidden="true">🔍</span>
              <input
                type="search"
                id="elt-search-input"
                class="elt-search-input"
                placeholder="İl adı, plaka, kütüphane, durak veya hatıra notunda ara..."
                value="${esc(uiState.search)}"
              />
              ${
                uiState.search
                  ? `<button type="button" class="elt-clear-search" id="elt-clear-search" title="Aramayı temizle">✕</button>`
                  : ''
              }
            </div>

            <select id="elt-sort-select" class="elt-sort-select" aria-label="Sıralama">
              <option value="chronological" ${uiState.sortOrder === 'chronological' ? 'selected' : ''}>🗓️ Sefer Sırası (Gün 1 → ${totalDays})</option>
              <option value="reverse" ${uiState.sortOrder === 'reverse' ? 'selected' : ''}>⏪ Sondan Başa (Gün ${totalDays} → 1)</option>
              <option value="plate" ${uiState.sortOrder === 'plate' ? 'selected' : ''}>🔢 Plaka Sırası (01 → 81)</option>
            </select>

            <button
              type="button"
              id="elt-notes-only-btn"
              class="elt-filter-toggle ${uiState.onlyWithNotes ? 'active' : ''}"
            >
              ✍️ Yalnızca Not Eklenenler (${savedNotesCount})
            </button>
          </div>

          <div class="elt-result-meta">
            <span>Gösterilen menzil: <strong>${filtered.length}</strong> / ${totalStops} fethedilen il</span>
            <span>Fotoğraflara tıklayarak tam ekran Lightbox galerisini açabilirsiniz</span>
          </div>
        </div>

        <div class="elt-timeline">
          ${timelineHtml}
        </div>
      </section>
    `;

    bindEvents(container, safeCtx, allEntries, notesMap);
  }

  // ---------------------------------------------------------------------------
  // Event Wiring
  // ---------------------------------------------------------------------------

  function bindEvents(container, ctx, allEntries, notesMap) {
    const entryByKey = new Map();
    allEntries.forEach((e) => entryByKey.set(e.key, e));

    // Region filter pills
    container.querySelectorAll('[data-elt-region]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiState.region = btn.getAttribute('data-elt-region') || 'all';
        render(container, ctx);
      });
    });

    // Search input (preserve focus & caret position across re-render)
    const searchInput = container.querySelector('#elt-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const pos = e.target.selectionStart || val.length;
        uiState.search = val;
        render(container, ctx);
        const nextInput = container.querySelector('#elt-search-input');
        if (nextInput) {
          nextInput.focus();
          try {
            nextInput.setSelectionRange(pos, pos);
          } catch (_) {}
        }
      });
    }

    const clearBtn = container.querySelector('#elt-clear-search');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        uiState.search = '';
        render(container, ctx);
      });
    }

    // Sort selector
    const sortSelect = container.querySelector('#elt-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        uiState.sortOrder = e.target.value || 'chronological';
        render(container, ctx);
      });
    }

    // Only with personal notes toggle
    const notesOnlyBtn = container.querySelector('#elt-notes-only-btn');
    if (notesOnlyBtn) {
      notesOnlyBtn.addEventListener('click', () => {
        uiState.onlyWithNotes = !uiState.onlyWithNotes;
        render(container, ctx);
      });
    }

    // Full 39-province Markdown export
    const exportBtn = container.querySelector('#elt-btn-export-md');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const latestNotes = loadMemoirNotes();
        const stats = (ctx && ctx.data && ctx.data.stats) || {};
        const md = buildFullMarkdownReport(allEntries, latestNotes, stats);
        downloadMarkdownFile('SEFER_GUNLUGU_39_IL_HATIRAT.md', md);
        if (ctx && typeof ctx.showToast === 'function') {
          ctx.showToast('📥 39 İl Tam Sefer Raporu (Markdown) indirildi!');
        }
      });
    }

    // Photo Lightbox clicks
    container.querySelectorAll('[data-elt-photo-key]').forEach((tile) => {
      tile.addEventListener('click', () => {
        const key = tile.getAttribute('data-elt-photo-key');
        const idx = parseInt(tile.getAttribute('data-elt-photo-idx') || '0', 10) || 0;
        const entry = entryByKey.get(key);
        if (!entry || !ctx || typeof ctx.openLightbox !== 'function') return;
        const p = entry.p;
        const items = [];
        if (p.banner_rel) {
          items.push({
            src: p.banner_rel,
            caption: `${p.name} (${formatPlate(p.plate)}) • ${entry.dayRangeLabel} — Ana Görünüm`
          });
        }
        if (p.gallery_rel) {
          items.push({
            src: p.gallery_rel,
            caption: `${p.name} (${formatPlate(p.plate)}) • ${entry.dayRangeLabel} — Sefer Galerisi`
          });
        }
        if (items.length) {
          ctx.openLightbox(items, idx);
        }
      });
    });

    // Open City Detail
    container.querySelectorAll('[data-elt-city]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-elt-city');
        if (key && ctx && typeof ctx.selectCity === 'function') {
          ctx.selectCity(key);
        }
      });
    });

    // Open inline memoir editor
    container.querySelectorAll('[data-elt-edit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-elt-edit');
        if (!key) return;
        const existing = notesMap[key];
        uiState.editingKey = key;
        uiState.draftText = existing ? existing.text : '';
        uiState.draftMood = existing && existing.mood ? existing.mood : 'tefekkur';
        render(container, ctx);
        const ta = container.querySelector(`[data-elt-textarea="${key}"]`);
        if (ta) {
          ta.focus();
          ta.setSelectionRange(ta.value.length, ta.value.length);
        }
      });
    });

    // Delete memoir note
    container.querySelectorAll('[data-elt-delete]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-elt-delete');
        if (!key) return;
        const nextNotes = loadMemoirNotes();
        delete nextNotes[key];
        saveMemoirNotes(nextNotes);
        if (uiState.editingKey === key) {
          uiState.editingKey = null;
          uiState.draftText = '';
        }
        if (ctx && typeof ctx.showToast === 'function') {
          ctx.showToast('🗑️ Hatıra notu kaldırıldı.');
        }
        render(container, ctx);
      });
    });

    // Mood chip selection inside active editor
    container.querySelectorAll('[data-elt-mood]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const mood = chip.getAttribute('data-elt-mood') || 'tefekkur';
        const activeTa = container.querySelector('.elt-editor-textarea');
        if (activeTa) uiState.draftText = activeTa.value;
        uiState.draftMood = mood;
        render(container, ctx);
      });
    });

    // Save memoir note
    container.querySelectorAll('[data-elt-save]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-elt-save');
        if (!key) return;
        const ta = container.querySelector(`[data-elt-textarea="${key}"]`);
        const rawText = ta ? ta.value.trim() : uiState.draftText.trim();
        const nextNotes = loadMemoirNotes();
        if (!rawText) {
          delete nextNotes[key];
          saveMemoirNotes(nextNotes);
          uiState.editingKey = null;
          uiState.draftText = '';
          if (ctx && typeof ctx.showToast === 'function') {
            ctx.showToast('Boş not kaydedilmedi; mevcut not temizlendi.');
          }
          render(container, ctx);
          return;
        }
        nextNotes[key] = {
          text: rawText.slice(0, 1500),
          mood: uiState.draftMood || 'tefekkur',
          updatedAt: new Date().toISOString()
        };
        saveMemoirNotes(nextNotes);
        uiState.editingKey = null;
        uiState.draftText = '';
        if (ctx && typeof ctx.showToast === 'function') {
          const entry = entryByKey.get(key);
          ctx.showToast(`✍️ ${entry ? entry.p.name : 'Menzil'} hatıra notu kaydedildi!`);
        }
        render(container, ctx);
      });
    });

    // Cancel inline editor
    container.querySelectorAll('[data-elt-cancel]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiState.editingKey = null;
        uiState.draftText = '';
        render(container, ctx);
      });
    });
  }

  window.SEYYAH_MODULES.expeditionLog = {
    render
  };
})();
