/**
 * Anadolu Seyahatnamesi - Kişisel Seyir Defterim Modülü
 * Kullanıcı Ziyaret Takibi, Kişisel Notlar, Karşılaştırmalı İlerleme & JSON/Markdown Yedekleme
 * Registers on window.SEYYAH_MODULES.journal
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'dijital_seyyah_personal_journal_v1';
  const STYLE_ID = 'seyyah-journal-styles';

  const MONTHS_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Fallback helpers in case ctx omits any utility
  function defaultEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function defaultNormalizeTurkish(str) {
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
    const n = Number(plate);
    if (!Number.isFinite(n)) return '00';
    return n < 10 ? '0' + n : String(n);
  }

  function formatDateTR(isoDate) {
    if (!isoDate || typeof isoDate !== 'string') return '';
    const m = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return isoDate;
    const year = m[1];
    const monthIdx = parseInt(m[2], 10) - 1;
    const day = parseInt(m[3], 10);
    if (monthIdx < 0 || monthIdx > 11) return isoDate;
    return `${day} ${MONTHS_TR[monthIdx]} ${year}`;
  }

  function getTodayISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getPersonalRank(visitedCount) {
    if (visitedCount >= 81) return { icon: '👑', title: '81 İl Fatihi' };
    if (visitedCount >= 60) return { icon: '🦅', title: 'Büyük Seyyah' };
    if (visitedCount >= 41) return { icon: '📜', title: 'Evliya Çelebi İzinde' };
    if (visitedCount >= 25) return { icon: '🗺️', title: 'Anadolu Kâşifi' };
    if (visitedCount >= 10) return { icon: '🧭', title: 'Yol Eri' };
    if (visitedCount >= 1) return { icon: '👣', title: 'İlk Adım Yolcusu' };
    return { icon: '🌱', title: 'Yola Çıkmaya Hazır' };
  }

  // Storage helpers
  function createEmptyJournal() {
    return { visited: [], notes: {}, dates: {} };
  }

  function sanitizeJournal(raw, provinces) {
    const clean = createEmptyJournal();
    if (!raw || typeof raw !== 'object') return clean;

    const validKey = (k) => {
      if (typeof k !== 'string' || !k.trim()) return false;
      return provinces ? Object.prototype.hasOwnProperty.call(provinces, k) : true;
    };

    if (Array.isArray(raw.visited)) {
      const seen = new Set();
      raw.visited.forEach((k) => {
        if (validKey(k) && !seen.has(k)) {
          seen.add(k);
          clean.visited.push(k);
        }
      });
    }

    if (raw.notes && typeof raw.notes === 'object' && !Array.isArray(raw.notes)) {
      Object.keys(raw.notes).forEach((k) => {
        if (validKey(k) && typeof raw.notes[k] === 'string') {
          const val = raw.notes[k].trim();
          if (val) clean.notes[k] = raw.notes[k];
        }
      });
    }

    if (raw.dates && typeof raw.dates === 'object' && !Array.isArray(raw.dates)) {
      Object.keys(raw.dates).forEach((k) => {
        if (validKey(k) && typeof raw.dates[k] === 'string') {
          const val = raw.dates[k].trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            clean.dates[k] = val;
          }
        }
      });
    }

    return clean;
  }

  function loadJournal(provinces) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyJournal();
      return sanitizeJournal(JSON.parse(raw), provinces);
    } catch (e) {
      return createEmptyJournal();
    }
  }

  function saveJournal(journal) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        visited: journal.visited,
        notes: journal.notes,
        dates: journal.dates
      }));
      return true;
    } catch (e) {
      return false;
    }
  }

  function triggerDownload(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  }

  function buildMarkdownExport(journal, data) {
    const provinces = (data && data.provinces) || {};
    const regions = (data && data.regions) || {};
    const totalCities = (data && data.stats && data.stats.total_cities) || Object.keys(provinces).length || 81;
    const seyyahVisited = (data && data.stats && data.stats.visited_cities) || 39;

    const visitedSet = new Set(journal.visited);
    const personalCount = visitedSet.size;
    const personalPct = totalCities ? ((personalCount / totalCities) * 100).toFixed(1) : '0.0';
    const seyyahPct = totalCities ? ((seyyahVisited / totalCities) * 100).toFixed(1) : '48.1';
    const rank = getPersonalRank(personalCount);
    const today = getTodayISO();

    const lines = [];
    lines.push('# 📝 Kişisel Anadolu Seyir Defterim');
    lines.push('');
    lines.push(`> Dışa aktarım tarihi: **${formatDateTR(today)}** (${today})`);
    lines.push('');
    lines.push('## 📊 Seyahat Özeti');
    lines.push('');
    lines.push(`- **Kişisel İlerleme:** ${personalCount} / ${totalCities} (%${personalPct}) — ${rank.icon} *${rank.title}*`);
    lines.push(`- **Dijital Seyyah İlerlemesi:** ${seyyahVisited} / ${totalCities} (%${seyyahPct})`);
    lines.push(`- **Kayıtlı Not Sayısı:** ${Object.keys(journal.notes).length}`);
    lines.push('');

    // Regional breakdown table
    const regionKeys = Object.keys(regions).sort();
    if (regionKeys.length > 0) {
      lines.push('## 🗺️ Bölgesel Dağılım');
      lines.push('');
      lines.push('| Bölge | Ziyaret Edilen | Toplam | Oran |');
      lines.push('| :--- | :---: | :---: | :---: |');
      regionKeys.forEach((rk) => {
        const reg = regions[rk];
        const regCities = Object.keys(provinces).filter((k) => provinces[k].region_code === rk);
        const regVisited = regCities.filter((k) => visitedSet.has(k)).length;
        const pct = regCities.length ? ((regVisited / regCities.length) * 100).toFixed(1) : '0.0';
        lines.push(`| ${reg.icon || ''} ${reg.name || rk} | ${regVisited} | ${regCities.length} | %${pct} |`);
      });
      lines.push('');
    }

    // Collect all logged keys (visited OR has note OR has date)
    const loggedKeys = Array.from(new Set([
      ...journal.visited,
      ...Object.keys(journal.notes),
      ...Object.keys(journal.dates)
    ])).filter((k) => provinces[k]);

    lines.push('## 🏛️ Şehir Kayıtları & Seyahat Notları');
    lines.push('');

    if (loggedKeys.length === 0) {
      lines.push('*Henüz kayıtlı bir şehir veya not bulunmuyor.*');
    } else {
      // Group by region
      const byRegion = {};
      loggedKeys.forEach((k) => {
        const p = provinces[k];
        const rk = p.region_code || 'Diger';
        if (!byRegion[rk]) byRegion[rk] = [];
        byRegion[rk].push(k);
      });

      Object.keys(byRegion).sort().forEach((rk) => {
        const reg = regions[rk];
        lines.push(`### ${(reg && reg.icon) ? reg.icon + ' ' : ''}${(reg && reg.name) || rk}`);
        lines.push('');

        byRegion[rk]
          .sort((a, b) => (provinces[a].name || '').localeCompare(provinces[b].name || '', 'tr'))
          .forEach((k) => {
            const p = provinces[k];
            const isVisited = visitedSet.has(k);
            const dateStr = journal.dates[k] ? formatDateTR(journal.dates[k]) : '';
            const note = journal.notes[k] || '';
            const statusText = isVisited ? '✅ Ziyaret Edildi' : '📌 Not / Plan';
            const headerMeta = dateStr ? `${statusText} · 📅 ${dateStr}` : statusText;

            lines.push(`#### ${formatPlate(p.plate)} — ${p.name} (${headerMeta})`);
            if (note) {
              lines.push('');
              lines.push(note);
            }
            lines.push('');
          });
      });
    }

    lines.push('---');
    lines.push('*Anadolu Seyahatnamesi — Kişisel Seyir Defteri ile oluşturuldu.*');
    return lines.join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .journal-view {
        display: flex;
        flex-direction: column;
        gap: 22px;
        max-width: 1120px;
        margin: 0 auto;
        padding-bottom: 32px;
      }

      .journal-banner {
        padding: 24px 26px;
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.78) 100%);
      }

      .journal-banner-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 18px;
      }

      .journal-title {
        font-family: var(--font-heading);
        font-size: 1.45rem;
        font-weight: 800;
        background: linear-gradient(135deg, #ffffff 0%, var(--accent-cyan) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 4px;
      }

      .journal-subtitle {
        font-size: 0.85rem;
        color: var(--text-secondary);
      }

      .journal-rank-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        border-radius: var(--radius-full);
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.35);
        color: var(--accent-gold);
        font-family: var(--font-heading);
        font-size: 0.82rem;
        font-weight: 700;
        white-space: nowrap;
      }

      .journal-compare-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }

      .journal-progress-box {
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-md);
        padding: 14px 16px;
      }

      .journal-progress-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 10px;
        margin-bottom: 8px;
      }

      .journal-progress-label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-secondary);
      }

      .journal-progress-value {
        font-family: var(--font-heading);
        font-size: 1rem;
        font-weight: 800;
      }

      .journal-progress-value.personal { color: var(--accent-cyan); }
      .journal-progress-value.seyyah { color: var(--accent-emerald); }

      .journal-bar-track {
        width: 100%;
        height: 10px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: var(--radius-full);
        overflow: hidden;
      }

      .journal-bar-fill {
        height: 100%;
        border-radius: var(--radius-full);
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .journal-bar-fill.personal {
        background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue));
      }

      .journal-bar-fill.seyyah {
        background: linear-gradient(90deg, var(--accent-emerald), var(--accent-gold));
      }

      .journal-kpi-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .journal-kpi-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: var(--radius-full);
        background: rgba(30, 41, 59, 0.65);
        border: 1px solid var(--border-glass);
        font-size: 0.78rem;
        color: var(--text-secondary);
      }

      .journal-kpi-chip strong {
        color: var(--text-primary);
        font-family: var(--font-heading);
      }

      .journal-main-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
        gap: 20px;
        align-items: start;
      }

      .journal-card {
        padding: 20px 22px;
      }

      .journal-card:hover {
        transform: none;
      }

      .journal-section-title {
        font-family: var(--font-heading);
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }

      .journal-field-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 14px;
      }

      .journal-label {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .journal-input,
      .journal-select,
      .journal-textarea {
        width: 100%;
        padding: 10px 12px;
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 0.88rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .journal-input:focus,
      .journal-select:focus,
      .journal-textarea:focus {
        border-color: var(--accent-cyan);
        box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.16);
      }

      .journal-textarea {
        min-height: 140px;
        resize: vertical;
        line-height: 1.6;
      }

      .journal-picker-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
      }

      .journal-controls-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 14px;
      }

      .journal-toggle-btn {
        width: 100%;
        padding: 10px 14px;
        border-radius: var(--radius-md);
        font-family: var(--font-heading);
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        border: 1px solid var(--border-glass);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
      }

      .journal-toggle-btn.is-visited {
        background: rgba(16, 185, 129, 0.2);
        border-color: rgba(16, 185, 129, 0.55);
        color: #6ee7b7;
        box-shadow: 0 0 14px rgba(16, 185, 129, 0.18);
      }

      .journal-toggle-btn.is-unvisited {
        background: rgba(30, 41, 59, 0.65);
        border-color: var(--border-glass);
        color: var(--text-secondary);
      }

      .journal-toggle-btn:hover {
        border-color: var(--accent-cyan);
      }

      .journal-date-wrap {
        display: flex;
        gap: 6px;
        align-items: center;
      }

      .journal-date-wrap .journal-input {
        flex: 1;
        min-width: 0;
      }

      .journal-mini-btn {
        padding: 9px 10px;
        border-radius: var(--radius-md);
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid var(--border-glass);
        color: var(--text-secondary);
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;
      }

      .journal-mini-btn:hover {
        border-color: var(--accent-cyan);
        color: var(--accent-cyan);
      }

      .journal-editor-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 4px;
      }

      .journal-save-status {
        font-size: 0.76rem;
        color: var(--text-muted);
      }

      .journal-save-status.saved {
        color: var(--accent-emerald);
      }

      .journal-backup-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
      }

      .journal-backup-bar:hover {
        transform: none;
      }

      .journal-backup-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .journal-list-toolbar {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 14px;
      }

      .journal-list-search-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
      }

      .journal-filter-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .journal-entries-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 540px;
        overflow-y: auto;
        padding-right: 4px;
      }

      .journal-entry-card {
        background: rgba(15, 23, 42, 0.58);
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-md);
        padding: 13px 15px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        transition: border-color 0.2s ease, background 0.2s ease;
      }

      .journal-entry-card:hover {
        border-color: rgba(0, 242, 254, 0.35);
      }

      .journal-entry-card.is-selected {
        border-color: var(--accent-cyan);
        background: rgba(0, 242, 254, 0.06);
      }

      .journal-entry-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }

      .journal-entry-city {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .journal-entry-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        justify-content: flex-end;
      }

      .journal-date-badge {
        font-size: 0.72rem;
        padding: 2px 8px;
        border-radius: var(--radius-full);
        background: rgba(56, 189, 248, 0.14);
        color: var(--accent-cyan);
        border: 1px solid rgba(56, 189, 248, 0.28);
        white-space: nowrap;
      }

      .journal-entry-note {
        font-size: 0.84rem;
        color: var(--text-secondary);
        white-space: pre-wrap;
        word-break: break-word;
        background: rgba(30, 41, 59, 0.45);
        padding: 8px 10px;
        border-radius: var(--radius-sm);
        border-left: 2px solid var(--accent-cyan);
      }

      .journal-entry-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        justify-content: flex-end;
      }

      .journal-action-btn {
        padding: 5px 10px;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid var(--border-glass);
        background: rgba(30, 41, 59, 0.7);
        color: var(--text-primary);
        transition: all 0.18s ease;
      }

      .journal-action-btn:hover {
        border-color: var(--accent-cyan);
        color: var(--accent-cyan);
      }

      .journal-action-btn.danger:hover {
        border-color: #ef4444;
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.14);
      }

      .journal-empty {
        text-align: center;
        padding: 28px 16px;
        color: var(--text-secondary);
        border: 1px dashed var(--border-glass);
        border-radius: var(--radius-md);
      }

      .journal-quick-chips {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        margin-top: 14px;
      }

      /* Light theme adjustments */
      body.light-theme .journal-banner {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(241, 245, 249, 0.92) 100%);
      }

      body.light-theme .journal-title {
        background: linear-gradient(135deg, #0f172a 0%, #0284c7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .journal-progress-box,
      body.light-theme .journal-entry-card,
      body.light-theme .journal-input,
      body.light-theme .journal-select,
      body.light-theme .journal-textarea {
        background: rgba(255, 255, 255, 0.85);
        color: var(--text-primary);
      }

      body.light-theme .journal-entry-note,
      body.light-theme .journal-kpi-chip,
      body.light-theme .journal-mini-btn,
      body.light-theme .journal-action-btn,
      body.light-theme .journal-toggle-btn.is-unvisited {
        background: rgba(241, 245, 249, 0.9);
        color: var(--text-primary);
      }

      body.light-theme .journal-toggle-btn.is-visited {
        background: rgba(16, 185, 129, 0.16);
        color: #047857;
      }

      body.light-theme .journal-bar-track {
        background: rgba(15, 23, 42, 0.1);
      }

      @media (max-width: 900px) {
        .journal-main-grid,
        .journal-compare-grid,
        .journal-controls-row {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const safeCtx = ctx || {};
    const data = safeCtx.data || (safeCtx.state && safeCtx.state.data) || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const escapeHtml = safeCtx.escapeHtml || defaultEscapeHtml;
    const normalizeTurkish = safeCtx.normalizeTurkish || defaultNormalizeTurkish;
    const selectCity = typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};
    const showToast = typeof safeCtx.showToast === 'function' ? safeCtx.showToast : function () {};

    if (!data || !data.provinces) {
      container.innerHTML = `
        <div class="glass-card journal-card" style="max-width: 600px; margin: 32px auto; text-align: center;">
          <h2 style="color: var(--accent-gold); margin-bottom: 8px;">Veri Bulunamadı</h2>
          <p style="color: var(--text-secondary);">Kişisel Seyir Defteri için il verileri yüklenemedi.</p>
        </div>
      `;
      return;
    }

    const provinces = data.provinces;
    const regions = data.regions || {};
    const allCityKeys = Object.keys(provinces).sort((a, b) =>
      (provinces[a].name || '').localeCompare(provinces[b].name || '', 'tr')
    );

    const totalCities = (data.stats && data.stats.total_cities) || allCityKeys.length || 81;
    const seyyahVisitedCount = (data.stats && typeof data.stats.visited_cities === 'number')
      ? data.stats.visited_cities
      : allCityKeys.filter((k) => provinces[k].visited).length;
    const seyyahPct = totalCities ? ((seyyahVisitedCount / totalCities) * 100).toFixed(1) : '48.1';

    // Module-local UI state
    let journal = loadJournal(provinces);
    const initialCity = (safeCtx.state && safeCtx.state.selectedCityKey && provinces[safeCtx.state.selectedCityKey])
      ? safeCtx.state.selectedCityKey
      : (journal.visited[0] || allCityKeys[0] || '');

    const ui = {
      selectedCityKey: initialCity,
      pickerFilter: '',
      listSearch: '',
      listFilter: 'all', // 'all' | 'visited' | 'noted' | 'shared'
      listSort: 'recent', // 'recent' | 'name' | 'plate'
      saveTimer: null
    };

    function getVisitedSet() {
      return new Set(journal.visited);
    }

    function computeStats() {
      const vSet = getVisitedSet();
      const personalCount = vSet.size;
      const personalPct = totalCities ? ((personalCount / totalCities) * 100).toFixed(1) : '0.0';
      const notedCount = Object.keys(journal.notes).length;
      const coveredRegions = new Set();
      let sharedWithSeyyah = 0;
      let uniqueToUser = 0;

      vSet.forEach((k) => {
        const p = provinces[k];
        if (!p) return;
        if (p.region_code) coveredRegions.add(p.region_code);
        if (p.visited) sharedWithSeyyah++;
        else uniqueToUser++;
      });

      return {
        personalCount,
        personalPct,
        notedCount,
        coveredRegionsCount: coveredRegions.size,
        sharedWithSeyyah,
        uniqueToUser,
        rank: getPersonalRank(personalCount)
      };
    }

    function getLoggedKeys() {
      const vSet = getVisitedSet();
      const allLogged = Array.from(new Set([
        ...journal.visited,
        ...Object.keys(journal.notes),
        ...Object.keys(journal.dates)
      ])).filter((k) => provinces[k]);

      const q = normalizeTurkish(ui.listSearch);

      const filtered = allLogged.filter((k) => {
        const p = provinces[k];
        const isVisited = vSet.has(k);
        const note = journal.notes[k] || '';
        const date = journal.dates[k] || '';

        if (ui.listFilter === 'visited' && !isVisited) return false;
        if (ui.listFilter === 'noted' && !note.trim()) return false;
        if (ui.listFilter === 'shared' && !(isVisited && p.visited)) return false;

        if (q) {
          const hay = normalizeTurkish(
            `${p.name} ${p.region || ''} ${formatPlate(p.plate)} ${date} ${formatDateTR(date)} ${note}`
          );
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      filtered.sort((a, b) => {
        if (ui.listSort === 'plate') {
          return (provinces[a].plate || 0) - (provinces[b].plate || 0);
        }
        if (ui.listSort === 'name') {
          return (provinces[a].name || '').localeCompare(provinces[b].name || '', 'tr');
        }
        // 'recent': sort by visit date desc, then visited first, then name
        const da = journal.dates[a] || '';
        const db = journal.dates[b] || '';
        if (da !== db) return db.localeCompare(da);
        const va = vSet.has(a) ? 1 : 0;
        const vb = vSet.has(b) ? 1 : 0;
        if (va !== vb) return vb - va;
        return (provinces[a].name || '').localeCompare(provinces[b].name || '', 'tr');
      });

      return { allLogged, filtered };
    }

    // Build initial skeleton once, then selectively update regions to preserve focus
    container.innerHTML = `
      <div class="journal-view" id="journal-root">
        <section class="glass-card journal-banner" id="journal-banner-slot"></section>

        <section class="glass-card journal-backup-bar">
          <div>
            <div style="font-family: var(--font-heading); font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">
              💾 Yedekleme & Dışa Aktarım
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">
              Seyir defterin tarayıcında (localStorage) saklanır. JSON ile yedekleyebilir veya Markdown seyahatnameni indirebilirsin.
            </div>
          </div>
          <div class="journal-backup-actions">
            <button type="button" class="btn btn-outline" id="journal-btn-export-json">📥 JSON Yedek İndir</button>
            <button type="button" class="btn btn-outline" id="journal-btn-import-json">📤 JSON Yedek Yükle</button>
            <button type="button" class="btn btn-primary" id="journal-btn-export-md">📄 Kişisel Markdown İndir</button>
            <input type="file" id="journal-import-file" accept=".json,application/json" style="display: none;" />
          </div>
        </section>

        <div class="journal-main-grid">
          <section class="glass-card journal-card" id="journal-editor-card">
            <div class="journal-section-title">
              <span>✍️ Şehir Kaydı & Seyahat Notu</span>
              <button type="button" class="journal-mini-btn" id="journal-btn-open-city">🏛️ Şehir Detayına Git →</button>
            </div>

            <div class="journal-field-group">
              <label class="journal-label" for="journal-picker-search">
                <span>Hızlı Şehir Seçici (81 İl)</span>
                <span id="journal-picker-count" style="color: var(--text-muted); font-weight: 500;">81 il</span>
              </label>
              <div class="journal-picker-row">
                <input type="text" id="journal-picker-search" class="journal-input" placeholder="Şehir veya plaka ara (örn. 06, İzmir, Trabzon)..." autocomplete="off" />
                <button type="button" class="journal-mini-btn" id="journal-picker-clear" title="Aramayı temizle">✕</button>
              </div>
              <select id="journal-city-select" class="journal-select" aria-label="Şehir seçin"></select>
            </div>

            <div class="journal-controls-row">
              <div class="journal-field-group" style="margin-bottom: 0;">
                <span class="journal-label">Ziyaret Durumun</span>
                <button type="button" id="journal-toggle-visited" class="journal-toggle-btn is-unvisited"></button>
              </div>
              <div class="journal-field-group" style="margin-bottom: 0;">
                <label class="journal-label" for="journal-date-input">Ziyaret Tarihi</label>
                <div class="journal-date-wrap">
                  <input type="date" id="journal-date-input" class="journal-input" />
                  <button type="button" class="journal-mini-btn" id="journal-btn-today" title="Bugünün tarihini seç">Bugün</button>
                </div>
              </div>
            </div>

            <div class="journal-field-group" style="margin-top: 14px; margin-bottom: 8px;">
              <label class="journal-label" for="journal-note-textarea">
                <span>Kişisel Notların & Hatıraların</span>
                <span id="journal-note-chars" style="color: var(--text-muted); font-weight: 500;">0 karakter</span>
              </label>
              <textarea id="journal-note-textarea" class="journal-textarea" placeholder="Bu şehirde neler hissettin? Hangi kütüphanede çalıştın, hangi lezzeti denedin, unutulmaz anın neydi?"></textarea>
            </div>

            <div class="journal-editor-footer">
              <span id="journal-save-status" class="journal-save-status">Otomatik kayıt aktif</span>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="journal-action-btn danger" id="journal-btn-clear-note">🗑️ Notu Temizle</button>
                <button type="button" class="btn btn-primary" id="journal-btn-save-now" style="padding: 6px 14px; font-size: 0.8rem;">💾 Kaydet</button>
              </div>
            </div>
          </section>

          <section class="glass-card journal-card">
            <div class="journal-section-title">
              <span>📚 Kayıtlı Şehirlerim</span>
              <span id="journal-logged-count" style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600;">0 kayıt</span>
            </div>

            <div class="journal-list-toolbar">
              <div class="journal-list-search-row">
                <input type="text" id="journal-list-search" class="journal-input" placeholder="Kayıtlarında ara (şehir, bölge, not, tarih)..." autocomplete="off" />
                <select id="journal-list-sort" class="journal-select" style="width: auto;" aria-label="Sıralama">
                  <option value="recent">Tarihe Göre</option>
                  <option value="name">Alfabetik (A-Z)</option>
                  <option value="plate">Plaka Kodu</option>
                </select>
              </div>
              <div class="journal-filter-pills" id="journal-filter-pills">
                <button type="button" class="filter-pill active" data-filter="all">Tümü</button>
                <button type="button" class="filter-pill" data-filter="visited">✅ Gittiklerim</button>
                <button type="button" class="filter-pill" data-filter="noted">📝 Notlu</button>
                <button type="button" class="filter-pill" data-filter="shared">🤝 Seyyah ile Ortak</button>
              </div>
            </div>

            <div class="journal-entries-list" id="journal-entries-list"></div>
          </section>
        </div>
      </div>
    `;

    // Cache DOM references
    const bannerSlot = container.querySelector('#journal-banner-slot');
    const pickerSearch = container.querySelector('#journal-picker-search');
    const pickerClear = container.querySelector('#journal-picker-clear');
    const pickerCount = container.querySelector('#journal-picker-count');
    const citySelect = container.querySelector('#journal-city-select');
    const btnOpenCity = container.querySelector('#journal-btn-open-city');
    const btnToggleVisited = container.querySelector('#journal-toggle-visited');
    const dateInput = container.querySelector('#journal-date-input');
    const btnToday = container.querySelector('#journal-btn-today');
    const noteTextarea = container.querySelector('#journal-note-textarea');
    const noteChars = container.querySelector('#journal-note-chars');
    const saveStatus = container.querySelector('#journal-save-status');
    const btnClearNote = container.querySelector('#journal-btn-clear-note');
    const btnSaveNow = container.querySelector('#journal-btn-save-now');
    const listSearch = container.querySelector('#journal-list-search');
    const listSort = container.querySelector('#journal-list-sort');
    const filterPills = container.querySelector('#journal-filter-pills');
    const entriesList = container.querySelector('#journal-entries-list');
    const loggedCountEl = container.querySelector('#journal-logged-count');
    const btnExportJson = container.querySelector('#journal-btn-export-json');
    const btnImportJson = container.querySelector('#journal-btn-import-json');
    const importFileInput = container.querySelector('#journal-import-file');
    const btnExportMd = container.querySelector('#journal-btn-export-md');

    function renderBanner() {
      const s = computeStats();
      const diff = s.personalCount - seyyahVisitedCount;
      let compareText = '';
      if (diff > 0) {
        compareText = `🏆 Dijital Seyyah'ın ${diff} il önündesin!`;
      } else if (diff === 0) {
        compareText = `⚖️ Dijital Seyyah ile başa başsın!`;
      } else {
        compareText = `🎯 Dijital Seyyah'a yetişmek için ${Math.abs(diff)} il kaldı`;
      }

      bannerSlot.innerHTML = `
        <div class="journal-banner-top">
          <div>
            <h2 class="journal-title">📝 Kişisel Seyir Defterim</h2>
            <p class="journal-subtitle">Kendi Anadolu yolculuğunu takip et, hatıralarını not al ve Dijital Seyyah ile kıyasla.</p>
          </div>
          <div class="journal-rank-pill">
            <span>${escapeHtml(s.rank.icon)}</span>
            <span>${escapeHtml(s.rank.title)}</span>
          </div>
        </div>

        <div class="journal-compare-grid">
          <div class="journal-progress-box">
            <div class="journal-progress-header">
              <span class="journal-progress-label">🧭 Senin Seyir Defterin</span>
              <span class="journal-progress-value personal">${s.personalCount} / ${totalCities} (%${s.personalPct})</span>
            </div>
            <div class="journal-bar-track">
              <div class="journal-bar-fill personal" style="width: ${Math.min(100, Number(s.personalPct))}%"></div>
            </div>
          </div>

          <div class="journal-progress-box">
            <div class="journal-progress-header">
              <span class="journal-progress-label">✨ Dijital Seyyah İlerlemesi</span>
              <span class="journal-progress-value seyyah">${seyyahVisitedCount} / ${totalCities} (%${seyyahPct})</span>
            </div>
            <div class="journal-bar-track">
              <div class="journal-bar-fill seyyah" style="width: ${Math.min(100, Number(seyyahPct))}%"></div>
            </div>
          </div>
        </div>

        <div class="journal-kpi-strip">
          <span class="journal-kpi-chip">🗺️ Bölge: <strong>${s.coveredRegionsCount} / 7</strong></span>
          <span class="journal-kpi-chip">📝 Notlu Şehir: <strong>${s.notedCount}</strong></span>
          <span class="journal-kpi-chip">🤝 Ortak İl: <strong>${s.sharedWithSeyyah}</strong></span>
          <span class="journal-kpi-chip">🌟 Sadece Senin Gittiğin: <strong>${s.uniqueToUser}</strong></span>
          <span class="journal-kpi-chip">${escapeHtml(compareText)}</span>
        </div>
      `;
    }

    function renderCityOptions() {
      const vSet = getVisitedSet();
      const q = normalizeTurkish(ui.pickerFilter);
      const matching = allCityKeys.filter((k) => {
        if (!q) return true;
        const p = provinces[k];
        const hay = normalizeTurkish(`${p.name} ${p.region || ''} ${formatPlate(p.plate)}`);
        return hay.includes(q);
      });

      pickerCount.textContent = `${matching.length} / ${allCityKeys.length} il`;

      if (matching.length === 0) {
        citySelect.innerHTML = `<option value="">Eşleşen şehir bulunamadı</option>`;
        return;
      }

      if (!matching.includes(ui.selectedCityKey)) {
        ui.selectedCityKey = matching[0];
      }

      citySelect.innerHTML = matching.map((k) => {
        const p = provinces[k];
        const isVisited = vSet.has(k);
        const hasNote = Boolean(journal.notes[k]);
        const markers = `${isVisited ? ' ✅' : ''}${hasNote ? ' 📝' : ''}`;
        const label = `${formatPlate(p.plate)} — ${p.name} (${p.region || ''})${markers}`;
        return `<option value="${escapeHtml(k)}"${k === ui.selectedCityKey ? ' selected' : ''}>${escapeHtml(label)}</option>`;
      }).join('');
    }

    function syncEditorFromState() {
      const k = ui.selectedCityKey;
      const p = provinces[k];
      if (!p) return;

      const isVisited = getVisitedSet().has(k);
      btnToggleVisited.className = `journal-toggle-btn ${isVisited ? 'is-visited' : 'is-unvisited'}`;
      btnToggleVisited.innerHTML = isVisited
        ? '✅ Gittim <span style="font-size:0.75rem; opacity:0.85;">(Değiştir)</span>'
        : '🧭 Gitmedim <span style="font-size:0.75rem; opacity:0.85;">(Gittim olarak işaretle)</span>';

      dateInput.value = journal.dates[k] || '';
      const noteVal = journal.notes[k] || '';
      noteTextarea.value = noteVal;
      noteChars.textContent = `${noteVal.length} karakter`;
      saveStatus.textContent = noteVal ? '✓ Kayıtlı' : 'Otomatik kayıt aktif';
      saveStatus.className = `journal-save-status${noteVal ? ' saved' : ''}`;
      btnOpenCity.textContent = `🏛️ ${p.name} Detayı →`;
    }

    function renderEntriesList() {
      const vSet = getVisitedSet();
      const { allLogged, filtered } = getLoggedKeys();
      loggedCountEl.textContent = `${filtered.length} / ${allLogged.length} kayıt`;

      if (allLogged.length === 0) {
        const suggestions = ['01_Marmara/Istanbul', '04_IcAnadolu/Ankara', '02_Ege/Izmir', '04_IcAnadolu/Konya', '05_Karadeniz/Trabzon']
          .filter((k) => provinces[k]);

        entriesList.innerHTML = `
          <div class="journal-empty">
            <div style="font-size: 2rem; margin-bottom: 6px;">🧭</div>
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Seyir defterin henüz boş</div>
            <div style="font-size: 0.82rem;">Soldaki seçiciden bir il seçip <strong>Gittim</strong> olarak işaretleyebilir veya ilk seyahat notunu bırakabilirsin.</div>
            ${suggestions.length ? `
              <div class="journal-quick-chips">
                ${suggestions.map((k) => `
                  <button type="button" class="journal-action-btn" data-quick-add="${escapeHtml(k)}">+ ${escapeHtml(provinces[k].name)} Ekle</button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `;
        return;
      }

      if (filtered.length === 0) {
        entriesList.innerHTML = `
          <div class="journal-empty">
            <div style="font-size: 1.5rem; margin-bottom: 4px;">🔍</div>
            <div style="font-size: 0.84rem;">Arama veya filtre kriterlerine uyan kayıt bulunamadı.</div>
          </div>
        `;
        return;
      }

      entriesList.innerHTML = filtered.map((k) => {
        const p = provinces[k];
        const reg = regions[p.region_code] || {};
        const isVisited = vSet.has(k);
        const dateVal = journal.dates[k] || '';
        const noteVal = journal.notes[k] || '';
        const isSelected = k === ui.selectedCityKey;

        return `
          <article class="journal-entry-card${isSelected ? ' is-selected' : ''}" data-city-key="${escapeHtml(k)}">
            <div class="journal-entry-head">
              <div class="journal-entry-city">
                <div class="city-plate">${escapeHtml(formatPlate(p.plate))}</div>
                <div>
                  <div class="city-name-text">${escapeHtml(p.name)}</div>
                  <div class="city-region-sub">${escapeHtml(reg.icon || '')} ${escapeHtml(p.region || '')}${p.visited ? ' · ✨ Seyyah da gitti' : ''}</div>
                </div>
              </div>
              <div class="journal-entry-badges">
                ${dateVal ? `<span class="journal-date-badge">📅 ${escapeHtml(formatDateTR(dateVal))}</span>` : ''}
                <span class="city-status-badge ${isVisited ? 'visited' : 'unvisited'}">${isVisited ? '✅ Gittim' : '📌 Not'}</span>
              </div>
            </div>
            ${noteVal ? `<div class="journal-entry-note">${escapeHtml(noteVal)}</div>` : ''}
            <div class="journal-entry-actions">
              <button type="button" class="journal-action-btn" data-action="edit" data-key="${escapeHtml(k)}">✏️ Düzenle</button>
              ${noteVal ? `<button type="button" class="journal-action-btn danger" data-action="delete-note" data-key="${escapeHtml(k)}">🗑️ Notu Sil</button>` : ''}
              <button type="button" class="journal-action-btn danger" data-action="remove-entry" data-key="${escapeHtml(k)}" title="Ziyaret ve not kaydını kaldır">✕ Kaydı Kaldır</button>
              <button type="button" class="journal-action-btn" data-action="detail" data-key="${escapeHtml(k)}">🏛️ Detay →</button>
            </div>
          </article>
        `;
      }).join('');
    }

    function persistAndRefresh(toastMsg, refreshPicker = true) {
      const ok = saveJournal(journal);
      renderBanner();
      if (refreshPicker) renderCityOptions();
      syncEditorFromState();
      renderEntriesList();
      if (toastMsg) {
        showToast(ok ? toastMsg : '⚠️ Tarayıcı depolama alanına kaydedilemedi');
      }
    }

    function saveNoteNow(silent) {
      const k = ui.selectedCityKey;
      if (!k || !provinces[k]) return;
      const val = noteTextarea.value;
      const trimmed = val.trim();
      const prev = journal.notes[k] || '';

      if (trimmed) {
        journal.notes[k] = val;
      } else {
        delete journal.notes[k];
      }

      saveJournal(journal);
      saveStatus.textContent = trimmed ? '✓ Otomatik kaydedildi' : 'Not temizlendi';
      saveStatus.className = 'journal-save-status saved';
      renderBanner();
      renderCityOptions();
      renderEntriesList();

      if (!silent && val !== prev) {
        showToast(trimmed
          ? `📝 ${provinces[k].name} notu kaydedildi`
          : `🗑️ ${provinces[k].name} notu temizlendi`);
      }
    }

    // Event bindings
    pickerSearch.addEventListener('input', () => {
      ui.pickerFilter = pickerSearch.value;
      renderCityOptions();
      syncEditorFromState();
    });

    pickerClear.addEventListener('click', () => {
      pickerSearch.value = '';
      ui.pickerFilter = '';
      renderCityOptions();
      syncEditorFromState();
      pickerSearch.focus();
    });

    citySelect.addEventListener('change', () => {
      if (ui.saveTimer) {
        clearTimeout(ui.saveTimer);
        ui.saveTimer = null;
        saveNoteNow(true);
      }
      if (citySelect.value && provinces[citySelect.value]) {
        ui.selectedCityKey = citySelect.value;
        syncEditorFromState();
        renderEntriesList();
      }
    });

    btnOpenCity.addEventListener('click', () => {
      if (ui.selectedCityKey && provinces[ui.selectedCityKey]) {
        selectCity(ui.selectedCityKey);
      }
    });

    btnToggleVisited.addEventListener('click', () => {
      const k = ui.selectedCityKey;
      if (!k || !provinces[k]) return;
      const idx = journal.visited.indexOf(k);
      if (idx >= 0) {
        journal.visited.splice(idx, 1);
        persistAndRefresh(`🧭 ${provinces[k].name} ziyaret listenden çıkarıldı`);
      } else {
        journal.visited.push(k);
        if (!journal.dates[k]) {
          journal.dates[k] = getTodayISO();
        }
        persistAndRefresh(`✅ ${provinces[k].name} gidilen illere eklendi!`);
      }
    });

    dateInput.addEventListener('change', () => {
      const k = ui.selectedCityKey;
      if (!k || !provinces[k]) return;
      const val = dateInput.value.trim();
      if (val) {
        journal.dates[k] = val;
        persistAndRefresh(`📅 ${provinces[k].name} ziyaret tarihi kaydedildi (${formatDateTR(val)})`, false);
      } else {
        delete journal.dates[k];
        persistAndRefresh(`📅 ${provinces[k].name} ziyaret tarihi kaldırıldı`, false);
      }
    });

    btnToday.addEventListener('click', () => {
      const k = ui.selectedCityKey;
      if (!k || !provinces[k]) return;
      const today = getTodayISO();
      journal.dates[k] = today;
      dateInput.value = today;
      persistAndRefresh(`📅 ${provinces[k].name} tarihi bugün olarak ayarlandı`, false);
    });

    noteTextarea.addEventListener('input', () => {
      noteChars.textContent = `${noteTextarea.value.length} karakter`;
      saveStatus.textContent = 'Kaydediliyor...';
      saveStatus.className = 'journal-save-status';
      if (ui.saveTimer) clearTimeout(ui.saveTimer);
      ui.saveTimer = setTimeout(() => {
        ui.saveTimer = null;
        saveNoteNow(false);
      }, 650);
    });

    noteTextarea.addEventListener('blur', () => {
      if (ui.saveTimer) {
        clearTimeout(ui.saveTimer);
        ui.saveTimer = null;
        saveNoteNow(false);
      }
    });

    btnSaveNow.addEventListener('click', () => {
      if (ui.saveTimer) {
        clearTimeout(ui.saveTimer);
        ui.saveTimer = null;
      }
      const k = ui.selectedCityKey;
      if (!k || !provinces[k]) return;
      const val = noteTextarea.value;
      if (val.trim()) {
        journal.notes[k] = val;
      } else {
        delete journal.notes[k];
      }
      saveJournal(journal);
      saveStatus.textContent = '✓ Kaydedildi';
      saveStatus.className = 'journal-save-status saved';
      renderBanner();
      renderCityOptions();
      renderEntriesList();
      showToast(`💾 ${provinces[k].name} kaydı güncellendi`);
    });

    btnClearNote.addEventListener('click', () => {
      const k = ui.selectedCityKey;
      if (!k || !provinces[k]) return;
      if (!journal.notes[k] && !noteTextarea.value) return;
      delete journal.notes[k];
      noteTextarea.value = '';
      persistAndRefresh(`🗑️ ${provinces[k].name} notu silindi`);
    });

    listSearch.addEventListener('input', () => {
      ui.listSearch = listSearch.value;
      renderEntriesList();
    });

    listSort.addEventListener('change', () => {
      ui.listSort = listSort.value;
      renderEntriesList();
    });

    filterPills.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      ui.listFilter = btn.getAttribute('data-filter') || 'all';
      filterPills.querySelectorAll('.filter-pill').forEach((p) => {
        p.classList.toggle('active', p === btn);
      });
      renderEntriesList();
    });

    entriesList.addEventListener('click', (e) => {
      const quickBtn = e.target.closest('[data-quick-add]');
      if (quickBtn) {
        const k = quickBtn.getAttribute('data-quick-add');
        if (k && provinces[k]) {
          if (!journal.visited.includes(k)) journal.visited.push(k);
          if (!journal.dates[k]) journal.dates[k] = getTodayISO();
          ui.selectedCityKey = k;
          persistAndRefresh(`✅ ${provinces[k].name} seyir defterine eklendi!`);
        }
        return;
      }

      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;
      const action = actionBtn.getAttribute('data-action');
      const k = actionBtn.getAttribute('data-key');
      if (!k || !provinces[k]) return;

      if (action === 'edit') {
        ui.selectedCityKey = k;
        pickerSearch.value = '';
        ui.pickerFilter = '';
        renderCityOptions();
        syncEditorFromState();
        renderEntriesList();
        const editorEl = container.querySelector('#journal-editor-card');
        if (editorEl && typeof editorEl.scrollIntoView === 'function') {
          editorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        noteTextarea.focus();
      } else if (action === 'delete-note') {
        delete journal.notes[k];
        persistAndRefresh(`🗑️ ${provinces[k].name} notu silindi`);
      } else if (action === 'remove-entry') {
        journal.visited = journal.visited.filter((item) => item !== k);
        delete journal.notes[k];
        delete journal.dates[k];
        persistAndRefresh(`🗑️ ${provinces[k].name} kaydı defterden kaldırıldı`);
      } else if (action === 'detail') {
        selectCity(k);
      }
    });

    // Export JSON
    btnExportJson.addEventListener('click', () => {
      const payload = {
        app: 'Anadolu Seyahatnamesi — Kişisel Seyir Defteri',
        version: 1,
        exportedAt: new Date().toISOString(),
        visited: journal.visited,
        notes: journal.notes,
        dates: journal.dates
      };
      const filename = `kisisel-seyir-defterim-${getTodayISO()}.json`;
      triggerDownload(filename, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
      showToast(`📥 ${filename} indirildi`);
    });

    // Import JSON
    btnImportJson.addEventListener('click', () => {
      importFileInput.value = '';
      importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || '{}'));
          if (!parsed || typeof parsed !== 'object' || (!Array.isArray(parsed.visited) && typeof parsed.notes !== 'object')) {
            showToast('⚠️ Geçersiz seyir defteri JSON dosyası');
            return;
          }
          journal = sanitizeJournal(parsed, provinces);
          if (journal.visited.length > 0 && !provinces[ui.selectedCityKey]) {
            ui.selectedCityKey = journal.visited[0];
          }
          persistAndRefresh(`📤 Yedek yüklendi: ${journal.visited.length} il, ${Object.keys(journal.notes).length} not`);
        } catch (err) {
          showToast('⚠️ JSON dosyası okunamadı');
        }
      };
      reader.onerror = () => showToast('⚠️ Dosya okuma hatası');
      reader.readAsText(file, 'utf-8');
    });

    // Export Markdown
    btnExportMd.addEventListener('click', () => {
      const md = buildMarkdownExport(journal, data);
      const filename = `kisisel-seyahatnamem-${getTodayISO()}.md`;
      triggerDownload(filename, md, 'text/markdown;charset=utf-8');
      showToast(`📄 ${filename} indirildi`);
    });

    // Initial render
    renderBanner();
    renderCityOptions();
    syncEditorFromState();
    renderEntriesList();
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.journal = {
    render,
    STORAGE_KEY
  };
})();
