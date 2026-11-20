/**
 * Anadolu Seyahatnamesi — 81 İl Kütüphane Ofis Rehberi & Mesai Sayacı (Pomodoro)
 * Registers on window.SEYYAH_MODULES.libraries
 */

(function () {
  'use strict';

  const STORAGE_COUNT_KEY = 'dijital_seyyah_pomodoro_count';
  const STORAGE_MINUTES_KEY = 'dijital_seyyah_pomodoro_minutes';
  const STYLE_ELEMENT_ID = 'seyyah-library-directory-styles';

  const MODES = [
    {
      id: 'pomodoro',
      label: '25 dk Pomodoro',
      shortLabel: 'Pomodoro',
      minutes: 25,
      isFocus: true,
      accent: 'var(--accent-cyan)',
      tagline: 'Klasik ilim ve odaklanma seansı'
    },
    {
      id: 'deep',
      label: '50 dk Derin Çalışma',
      shortLabel: 'Derin Çalışma',
      minutes: 50,
      isFocus: true,
      accent: 'var(--accent-emerald)',
      tagline: 'Kesintisiz üretim ve derin tefekkür mesaisi'
    },
    {
      id: 'break',
      label: '5 dk Mola',
      shortLabel: 'Mola',
      minutes: 5,
      isFocus: false,
      accent: 'var(--accent-gold)',
      tagline: 'Çay, nefes ve zihin dinlendirme arası'
    }
  ];

  // Persistent module-level timer & filter state (with strict interval cleanup)
  const timerState = {
    modeId: 'pomodoro',
    totalSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    running: false,
    intervalId: null,
    activeLibraryTitle: 'Anadolu İl Halk Kütüphanesi Ofisi',
    soundEnabled: true
  };

  const directoryState = {
    search: '',
    region: 'all',
    filter: 'all' // 'all' | 'visited' | 'planned'
  };

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

  function getMode(modeId) {
    return MODES.find(m => m.id === modeId) || MODES[0];
  }

  function loadPomodoroStats() {
    let count = 0;
    let minutes = 0;
    try {
      const rawCount = localStorage.getItem(STORAGE_COUNT_KEY);
      const parsedCount = parseInt(rawCount, 10);
      if (!isNaN(parsedCount) && parsedCount > 0) count = parsedCount;

      const rawMinutes = localStorage.getItem(STORAGE_MINUTES_KEY);
      const parsedMinutes = parseInt(rawMinutes, 10);
      if (!isNaN(parsedMinutes) && parsedMinutes >= 0) {
        minutes = parsedMinutes;
      } else {
        minutes = count * 25;
      }
    } catch (e) {
      // Ignore storage errors in restricted contexts
    }
    return { count, minutes };
  }

  function recordCompletedFocusSession(sessionMinutes) {
    const current = loadPomodoroStats();
    const nextCount = current.count + 1;
    const nextMinutes = current.minutes + sessionMinutes;
    try {
      localStorage.setItem(STORAGE_COUNT_KEY, String(nextCount));
      localStorage.setItem(STORAGE_MINUTES_KEY, String(nextMinutes));
    } catch (e) {
      // Ignore storage errors
    }
    return { count: nextCount, minutes: nextMinutes };
  }

  function clearTimerInterval() {
    if (timerState.intervalId !== null) {
      clearInterval(timerState.intervalId);
      timerState.intervalId = null;
    }
  }

  function formatTime(totalSeconds) {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function formatPlate(plate) {
    const num = Number(plate);
    if (!isNaN(num) && num > 0) return String(num).padStart(2, '0');
    return '00';
  }

  /**
   * Gentle Web Audio API harmonic chime played on session completion
   */
  function playCompletionChime(isFocusComplete) {
    if (!timerState.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      // Soft pentatonic bell-like chord (D5 -> F#5 -> A5 -> D6 for focus, C5 -> E5 -> G5 for break)
      const notes = isFocusComplete
        ? [587.33, 739.99, 880.0, 1174.66]
        : [523.25, 659.25, 783.99];

      notes.forEach((freq, idx) => {
        const start = now + idx * 0.16;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.11, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 1.2);
      });

      setTimeout(() => {
        try {
          ctx.close();
        } catch (e) {}
      }, 2400);
    } catch (e) {
      // Gracefully ignore audio errors if autoplay policy blocks it
    }
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ELEMENT_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ELEMENT_ID;
    style.textContent = `
      .lib-dir-view {
        display: flex;
        flex-direction: column;
        gap: 24px;
        animation: libFadeIn 0.35s ease;
      }

      @keyframes libFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Pomodoro Focus Widget */
      .lib-pomodoro-card {
        padding: 24px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 12% 18%, rgba(0, 242, 254, 0.12), transparent 46%),
          radial-gradient(circle at 88% 82%, rgba(16, 185, 129, 0.12), transparent 48%),
          var(--bg-card, rgba(30, 41, 59, 0.7));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: grid;
        grid-template-columns: 220px 1fr;
        gap: 28px;
        align-items: center;
      }

      .lib-pomodoro-ring-wrap {
        position: relative;
        width: 204px;
        height: 204px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .lib-pomodoro-svg {
        width: 204px;
        height: 204px;
        transform: rotate(-90deg);
        overflow: visible;
      }

      .lib-ring-track {
        fill: none;
        stroke: var(--border-glass, rgba(255, 255, 255, 0.12));
        stroke-width: 10;
      }

      .lib-ring-progress {
        fill: none;
        stroke: var(--accent-cyan, #00f2fe);
        stroke-width: 10;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.45s ease, stroke 0.3s ease;
        filter: drop-shadow(0 0 8px rgba(0, 242, 254, 0.35));
      }

      .lib-pomodoro-center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 16px;
      }

      .lib-timer-readout {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 2.35rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: var(--text-primary, #f8fafc);
        line-height: 1.05;
      }

      .lib-timer-mode-badge {
        margin-top: 6px;
        font-size: 0.74rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--accent-cyan, #00f2fe);
      }

      .lib-pomodoro-info {
        display: flex;
        flex-direction: column;
        gap: 14px;
        min-width: 0;
      }

      .lib-pomodoro-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        flex-wrap: wrap;
      }

      .lib-pomodoro-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        margin: 0;
      }

      .lib-pomodoro-subtitle {
        font-size: 0.85rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 4px;
      }

      .lib-active-desk {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(0, 242, 254, 0.1);
        border: 1px solid rgba(0, 242, 254, 0.25);
        color: var(--accent-cyan, #00f2fe);
        font-size: 0.78rem;
        font-weight: 600;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .lib-mode-pills {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .lib-mode-btn {
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        color: var(--text-secondary, #94a3b8);
        padding: 7px 14px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      body.light-theme .lib-mode-btn {
        background: rgba(241, 245, 249, 0.9);
      }

      .lib-mode-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
      }

      .lib-mode-btn.active {
        background: rgba(0, 242, 254, 0.16);
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
        box-shadow: 0 0 14px rgba(0, 242, 254, 0.18);
      }

      .lib-pomodoro-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .lib-pomodoro-stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(120px, 1fr));
        gap: 10px;
        margin-top: 2px;
      }

      .lib-mini-stat {
        padding: 10px 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      body.light-theme .lib-mini-stat {
        background: rgba(241, 245, 249, 0.85);
      }

      .lib-mini-stat-val {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .lib-mini-stat-label {
        font-size: 0.72rem;
        color: var(--text-muted, #64748b);
      }

      /* Directory Header & Filters */
      .lib-directory-toolbar {
        padding: 18px 20px;
        border-radius: var(--radius-md, 12px);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .lib-directory-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .lib-directory-heading {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        margin: 0;
      }

      .lib-directory-count {
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
        font-weight: 600;
      }

      .lib-controls-row {
        display: grid;
        grid-template-columns: 1fr 230px;
        gap: 12px;
      }

      .lib-search-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .lib-search-wrap svg {
        position: absolute;
        left: 12px;
        color: var(--text-muted, #64748b);
        pointer-events: none;
      }

      .lib-search-input {
        width: 100%;
        padding: 10px 14px 10px 38px;
        border-radius: var(--radius-sm, 8px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary, #f8fafc);
        font-size: 0.88rem;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      body.light-theme .lib-search-input {
        background: rgba(241, 245, 249, 0.9);
      }

      .lib-search-input:focus {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .lib-filter-pills {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      /* Library Cards Grid */
      .lib-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }

      .lib-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 0;
      }

      .lib-card-media {
        position: relative;
        height: 146px;
        background: rgba(15, 23, 42, 0.85);
        overflow: hidden;
      }

      .lib-card-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.35s ease;
      }

      .lib-card:hover .lib-card-media img {
        transform: scale(1.05);
      }

      .lib-card-media-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(10, 15, 29, 0.18) 0%, rgba(10, 15, 29, 0.82) 100%);
        pointer-events: none;
      }

      .lib-card-plate {
        position: absolute;
        top: 10px;
        left: 10px;
        padding: 3px 9px;
        border-radius: var(--radius-sm, 8px);
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #f8fafc;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.76rem;
        font-weight: 800;
        backdrop-filter: blur(8px);
      }

      .lib-card-status {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 3px 10px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.72rem;
        font-weight: 700;
        backdrop-filter: blur(8px);
      }

      .lib-card-status.visited {
        background: rgba(16, 185, 129, 0.88);
        color: #04121d;
      }

      .lib-card-status.planned {
        background: rgba(15, 23, 42, 0.82);
        color: #fcd34d;
        border: 1px solid rgba(245, 158, 11, 0.45);
      }

      .lib-card-city-title {
        position: absolute;
        bottom: 10px;
        left: 12px;
        right: 12px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 8px;
      }

      .lib-card-city-name {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.15rem;
        font-weight: 800;
        color: #ffffff;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
      }

      .lib-card-region-tag {
        font-size: 0.72rem;
        font-weight: 600;
        color: #e2e8f0;
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.16);
        padding: 2px 8px;
        border-radius: var(--radius-full, 9999px);
        white-space: nowrap;
      }

      .lib-card-body {
        padding: 14px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
      }

      .lib-card-desc {
        font-size: 0.86rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.55;
        flex: 1;
      }

      .lib-card-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .lib-focus-pick-btn {
        background: transparent;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        color: var(--text-secondary, #94a3b8);
        border-radius: var(--radius-sm, 8px);
        padding: 6px 10px;
        font-size: 0.76rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .lib-focus-pick-btn:hover {
        border-color: var(--accent-emerald, #10b981);
        color: var(--accent-emerald, #10b981);
        background: rgba(16, 185, 129, 0.1);
      }

      .lib-go-city-btn {
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.35);
        color: var(--accent-cyan, #00f2fe);
        border-radius: var(--radius-sm, 8px);
        padding: 6px 12px;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
        white-space: nowrap;
      }

      .lib-go-city-btn:hover {
        background: var(--accent-cyan, #00f2fe);
        color: #04121d;
      }

      .lib-empty-state {
        grid-column: 1 / -1;
        padding: 40px 20px;
        text-align: center;
        color: var(--text-secondary, #94a3b8);
        border-radius: var(--radius-md, 12px);
      }

      @media (max-width: 820px) {
        .lib-pomodoro-card {
          grid-template-columns: 1fr;
          text-align: center;
          gap: 18px;
        }
        .lib-pomodoro-header,
        .lib-mode-pills,
        .lib-pomodoro-controls {
          justify-content: center;
        }
        .lib-controls-row {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 540px) {
        .lib-pomodoro-stats {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function render(container, ctx) {
    if (!container) return;

    // Ensure any previous timer interval is cleaned up before re-rendering
    clearTimerInterval();
    injectStyles();

    const safeCtx = ctx || {};
    const data = safeCtx.data || (safeCtx.state && safeCtx.state.data) || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const escapeHtml = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const normalizeTurkish = typeof safeCtx.normalizeTurkish === 'function' ? safeCtx.normalizeTurkish : fallbackNormalizeTurkish;
    const selectCity = typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};
    const showToast = typeof safeCtx.showToast === 'function' ? safeCtx.showToast : function () {};

    if (!data || !data.provinces) {
      container.innerHTML = `
        <div class="glass-card lib-empty-state">
          <h3>📚 Kütüphane Verisi Yüklenemedi</h3>
          <p>İl verileri henüz hazır değil.</p>
        </div>
      `;
      return;
    }

    const allEntries = Object.entries(data.provinces).map(([key, prov]) => {
      const regionInfo = (data.regions && data.regions[prov.region_code]) || {};
      const libraryText = prov.custom_library || prov.library || `${prov.name} İl Halk Kütüphanesi — Sakin çalışma ve okuma alanı.`;
      const bannerSrc = prov.banner_rel || (Array.isArray(prov.images) && prov.images[0]) || 'assets/banner.jpg';
      return {
        key,
        prov,
        libraryText,
        bannerSrc,
        regionName: regionInfo.name || prov.region || '',
        regionIcon: regionInfo.icon || '📍',
        plateStr: formatPlate(prov.plate),
        searchHaystack: normalizeTurkish(
          `${prov.name} ${formatPlate(prov.plate)} ${prov.plate} ${prov.region || ''} ${regionInfo.name || ''} ${libraryText}`
        )
      };
    }).sort((a, b) => (a.prov.plate || 0) - (b.prov.plate || 0));

    const totalCount = allEntries.length;
    const visitedCount = allEntries.filter(item => item.prov.visited).length;
    const plannedCount = totalCount - visitedCount;

    const regionOptions = Object.entries(data.regions || {})
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([code, info]) => {
        const selected = directoryState.region === code ? 'selected' : '';
        return `<option value="${escapeHtml(code)}" ${selected}>${escapeHtml(info.icon || '')} ${escapeHtml(info.name || code)}</option>`;
      })
      .join('');

    const currentMode = getMode(timerState.modeId);
    const stats = loadPomodoroStats();
    const radius = 88;
    const circumference = 2 * Math.PI * radius;

    container.innerHTML = `
      <div class="lib-dir-view">
        <!-- Top Pomodoro / İlim Mesaisi Widget -->
        <section class="lib-pomodoro-card glass-card" aria-label="Kütüphane Odaklanma Sayacı">
          <div class="lib-pomodoro-ring-wrap">
            <svg class="lib-pomodoro-svg" viewBox="0 0 204 204" aria-hidden="true">
              <circle class="lib-ring-track" cx="102" cy="102" r="${radius}"></circle>
              <circle
                class="lib-ring-progress"
                id="lib-ring-progress"
                cx="102"
                cy="102"
                r="${radius}"
                stroke-dasharray="${circumference.toFixed(2)}"
                stroke-dashoffset="0"
              ></circle>
            </svg>
            <div class="lib-pomodoro-center">
              <div class="lib-timer-readout" id="lib-timer-readout">${formatTime(timerState.remainingSeconds)}</div>
              <div class="lib-timer-mode-badge" id="lib-timer-mode-badge">${escapeHtml(currentMode.shortLabel)}</div>
            </div>
          </div>

          <div class="lib-pomodoro-info">
            <div class="lib-pomodoro-header">
              <div>
                <h2 class="lib-pomodoro-title">⏱️ Kütüphane Odaklanma Sayacı</h2>
                <p class="lib-pomodoro-subtitle" id="lib-timer-tagline">${escapeHtml(currentMode.tagline)}</p>
              </div>
              <div class="lib-active-desk" id="lib-active-desk" title="Aktif Çalışma Masası">
                📚 ${escapeHtml(timerState.activeLibraryTitle)}
              </div>
            </div>

            <div class="lib-mode-pills" role="group" aria-label="Sayaç Modları">
              ${MODES.map(m => `
                <button
                  type="button"
                  class="lib-mode-btn ${m.id === timerState.modeId ? 'active' : ''}"
                  data-lib-mode="${escapeHtml(m.id)}"
                >${escapeHtml(m.label)}</button>
              `).join('')}
            </div>

            <div class="lib-pomodoro-controls">
              <button type="button" class="btn btn-primary" id="lib-btn-start-pause">
                ${timerState.running ? '⏸️ Duraklat' : '▶️ Başlat'}
              </button>
              <button type="button" class="btn btn-outline" id="lib-btn-reset">
                ↺ Sıfırla
              </button>
              <button type="button" class="btn btn-outline" id="lib-btn-chime" title="Bitiş Zilini Aç/Kapat">
                ${timerState.soundEnabled ? '🔔 Zil Açık' : '🔕 Zil Kapalı'}
              </button>
            </div>

            <div class="lib-pomodoro-stats">
              <div class="lib-mini-stat">
                <span class="lib-mini-stat-val" id="lib-stat-sessions">${stats.count}</span>
                <span class="lib-mini-stat-label">Tamamlanan Mesai</span>
              </div>
              <div class="lib-mini-stat">
                <span class="lib-mini-stat-val" id="lib-stat-minutes">${stats.minutes} dk</span>
                <span class="lib-mini-stat-label">Toplam Odaklanma</span>
              </div>
              <div class="lib-mini-stat">
                <span class="lib-mini-stat-val">${visitedCount} / ${totalCount}</span>
                <span class="lib-mini-stat-label">Gezilen Kütüphane</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 81 İl Halk Kütüphanesi Rehberi -->
        <section class="lib-directory-toolbar glass-card" aria-label="Kütüphane Rehberi Filtreleri">
          <div class="lib-directory-top">
            <div>
              <h3 class="lib-directory-heading">📚 81 İl Halk Kütüphanesi Ofis Rehberi</h3>
            </div>
            <div class="lib-directory-count" id="lib-result-count">${totalCount} kütüphane gösteriliyor</div>
          </div>

          <div class="lib-controls-row">
            <div class="lib-search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                id="lib-search-input"
                class="lib-search-input"
                placeholder="İl, plaka, bölge veya kütüphane özelliği ara..."
                value="${escapeHtml(directoryState.search)}"
              >
            </div>

            <select id="lib-region-select" class="region-select" aria-label="Bölge Filtresi">
              <option value="all" ${directoryState.region === 'all' ? 'selected' : ''}>Tüm Bölgeler (7 Bölge)</option>
              ${regionOptions}
            </select>
          </div>

          <div class="lib-filter-pills" role="group" aria-label="Kütüphane Durum Filtresi">
            <button type="button" class="filter-pill ${directoryState.filter === 'all' ? 'active' : ''}" data-lib-filter="all">
              Tümü (${totalCount})
            </button>
            <button type="button" class="filter-pill ${directoryState.filter === 'visited' ? 'active' : ''}" data-lib-filter="visited">
              ✅ Gezilen Kütüphaneler (${visitedCount})
            </button>
            <button type="button" class="filter-pill ${directoryState.filter === 'planned' ? 'active' : ''}" data-lib-filter="planned">
              ⏳ Planlananlar (${plannedCount})
            </button>
          </div>
        </section>

        <!-- Library Cards Grid -->
        <section class="lib-cards-grid" id="lib-cards-grid" aria-live="polite"></section>
      </div>
    `;

    // Query DOM references inside this rendered container
    const readoutEl = container.querySelector('#lib-timer-readout');
    const modeBadgeEl = container.querySelector('#lib-timer-mode-badge');
    const taglineEl = container.querySelector('#lib-timer-tagline');
    const ringProgressEl = container.querySelector('#lib-ring-progress');
    const activeDeskEl = container.querySelector('#lib-active-desk');
    const startPauseBtn = container.querySelector('#lib-btn-start-pause');
    const resetBtn = container.querySelector('#lib-btn-reset');
    const chimeBtn = container.querySelector('#lib-btn-chime');
    const sessionsValEl = container.querySelector('#lib-stat-sessions');
    const minutesValEl = container.querySelector('#lib-stat-minutes');
    const modeBtns = container.querySelectorAll('[data-lib-mode]');

    const searchInput = container.querySelector('#lib-search-input');
    const regionSelect = container.querySelector('#lib-region-select');
    const filterBtns = container.querySelectorAll('[data-lib-filter]');
    const resultCountEl = container.querySelector('#lib-result-count');
    const cardsGridEl = container.querySelector('#lib-cards-grid');

    function updateTimerUI() {
      const mode = getMode(timerState.modeId);
      const ratio = timerState.totalSeconds > 0
        ? Math.max(0, Math.min(1, timerState.remainingSeconds / timerState.totalSeconds))
        : 0;
      const offset = circumference * (1 - ratio);

      if (readoutEl) readoutEl.textContent = formatTime(timerState.remainingSeconds);
      if (modeBadgeEl) {
        modeBadgeEl.textContent = mode.shortLabel;
        modeBadgeEl.style.color = mode.accent;
      }
      if (taglineEl) taglineEl.textContent = mode.tagline;
      if (ringProgressEl) {
        ringProgressEl.style.strokeDashoffset = offset.toFixed(2);
        ringProgressEl.style.stroke = mode.accent;
      }
      if (startPauseBtn) {
        startPauseBtn.textContent = timerState.running ? '⏸️ Duraklat' : '▶️ Başlat';
      }
      if (chimeBtn) {
        chimeBtn.textContent = timerState.soundEnabled ? '🔔 Zil Açık' : '🔕 Zil Kapalı';
      }
      if (activeDeskEl) {
        activeDeskEl.textContent = `📚 ${timerState.activeLibraryTitle}`;
      }
      modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lib-mode') === timerState.modeId);
      });
    }

    function refreshStatsUI(nextStats) {
      const s = nextStats || loadPomodoroStats();
      if (sessionsValEl) sessionsValEl.textContent = String(s.count);
      if (minutesValEl) minutesValEl.textContent = `${s.minutes} dk`;
    }

    function handleTimerComplete() {
      clearTimerInterval();
      timerState.running = false;
      const mode = getMode(timerState.modeId);
      playCompletionChime(mode.isFocus);

      if (mode.isFocus) {
        const updated = recordCompletedFocusSession(mode.minutes);
        refreshStatsUI(updated);
        showToast(`🎉 ${mode.label} tamamlandı! Toplam ${updated.count} ilim mesaisi (${updated.minutes} dk).`);
      } else {
        showToast('☕ Mola tamamlandı! Yeni bir ilim mesaisine hazırsın.');
      }

      // Reset timer cleanly to current mode duration after completion
      timerState.remainingSeconds = mode.minutes * 60;
      timerState.totalSeconds = mode.minutes * 60;
      updateTimerUI();
    }

    function startTicker() {
      clearTimerInterval();
      timerState.running = true;
      updateTimerUI();

      timerState.intervalId = setInterval(() => {
        // Auto-clean interval if container was removed from DOM (user switched views)
        if (!document.body.contains(readoutEl)) {
          clearTimerInterval();
          timerState.running = false;
          return;
        }

        if (timerState.remainingSeconds <= 1) {
          timerState.remainingSeconds = 0;
          updateTimerUI();
          handleTimerComplete();
          return;
        }

        timerState.remainingSeconds -= 1;
        updateTimerUI();
      }, 1000);
    }

    function pauseTicker() {
      clearTimerInterval();
      timerState.running = false;
      updateTimerUI();
    }

    function selectMode(modeId) {
      const mode = getMode(modeId);
      clearTimerInterval();
      timerState.modeId = mode.id;
      timerState.totalSeconds = mode.minutes * 60;
      timerState.remainingSeconds = mode.minutes * 60;
      timerState.running = false;
      updateTimerUI();
    }

    // Bind Pomodoro Controls
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-lib-mode');
        if (id) selectMode(id);
      });
    });

    if (startPauseBtn) {
      startPauseBtn.addEventListener('click', () => {
        if (timerState.running) {
          pauseTicker();
        } else {
          startTicker();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        selectMode(timerState.modeId);
        showToast('↺ Sayaç sıfırlandı');
      });
    }

    if (chimeBtn) {
      chimeBtn.addEventListener('click', () => {
        timerState.soundEnabled = !timerState.soundEnabled;
        updateTimerUI();
        showToast(timerState.soundEnabled ? '🔔 Seans bitiş zili açıldı' : '🔕 Seans bitiş zili kapatıldı');
      });
    }

    // Resume ticker seamlessly if timer was already running when re-rendered
    if (timerState.running) {
      startTicker();
    } else {
      updateTimerUI();
    }

    // Render filtered library cards
    function renderCards() {
      const q = normalizeTurkish(directoryState.search);
      const filtered = allEntries.filter(item => {
        if (directoryState.region !== 'all' && item.prov.region_code !== directoryState.region) {
          return false;
        }
        if (directoryState.filter === 'visited' && !item.prov.visited) {
          return false;
        }
        if (directoryState.filter === 'planned' && item.prov.visited) {
          return false;
        }
        if (q && !item.searchHaystack.includes(q)) {
          return false;
        }
        return true;
      });

      if (resultCountEl) {
        resultCountEl.textContent = `${filtered.length} / ${totalCount} kütüphane gösteriliyor`;
      }

      if (!cardsGridEl) return;

      if (filtered.length === 0) {
        cardsGridEl.innerHTML = `
          <div class="glass-card lib-empty-state">
            <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
            <strong>Aramanızla eşleşen kütüphane bulunamadı.</strong>
            <p style="font-size: 0.85rem; margin-top: 6px;">Farklı bir il, bölge veya filtre deneyebilirsiniz.</p>
          </div>
        `;
        return;
      }

      cardsGridEl.innerHTML = filtered.map(item => {
        const isVisited = Boolean(item.prov.visited);
        const statusClass = isVisited ? 'visited' : 'planned';
        const statusLabel = isVisited ? '✅ Gezildi' : '⏳ Planlanan';
        const deskTitle = `${item.prov.name} İl Halk Kütüphanesi`;

        return `
          <article class="glass-card lib-card">
            <div class="lib-card-media">
              <img
                src="${escapeHtml(item.bannerSrc)}"
                alt="${escapeHtml(item.prov.name)} İl Halk Kütüphanesi"
                loading="lazy"
                onerror="this.src='assets/banner.jpg'"
              >
              <div class="lib-card-media-overlay"></div>
              <span class="lib-card-plate">${escapeHtml(item.plateStr)}</span>
              <span class="lib-card-status ${statusClass}">${statusLabel}</span>
              <div class="lib-card-city-title">
                <span class="lib-card-city-name">${escapeHtml(item.prov.name)}</span>
                <span class="lib-card-region-tag">${escapeHtml(item.regionIcon)} ${escapeHtml(item.prov.region || item.regionName)}</span>
              </div>
            </div>
            <div class="lib-card-body">
              <p class="lib-card-desc">${escapeHtml(item.libraryText)}</p>
              <div class="lib-card-actions">
                <button
                  type="button"
                  class="lib-focus-pick-btn"
                  data-pick-desk="${escapeHtml(deskTitle)}"
                  title="Bu kütüphaneyi aktif çalışma masası yap"
                >⏱️ Mesai Masası Seç</button>
                <button
                  type="button"
                  class="lib-go-city-btn"
                  data-go-city="${escapeHtml(item.key)}"
                >Şehre Git ➔</button>
              </div>
            </div>
          </article>
        `;
      }).join('');

      cardsGridEl.querySelectorAll('[data-go-city]').forEach(btn => {
        btn.addEventListener('click', () => {
          const cityKey = btn.getAttribute('data-go-city');
          if (cityKey) selectCity(cityKey);
        });
      });

      cardsGridEl.querySelectorAll('[data-pick-desk]').forEach(btn => {
        btn.addEventListener('click', () => {
          const desk = btn.getAttribute('data-pick-desk');
          if (desk) {
            timerState.activeLibraryTitle = desk;
            updateTimerUI();
            showToast(`📚 Çalışma masası seçildi: ${desk}`);
            container.scrollTo ? container.scrollTo({ top: 0, behavior: 'smooth' }) : window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      });
    }

    // Bind Directory Filter Controls
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        directoryState.search = e.target.value || '';
        renderCards();
      });
    }

    if (regionSelect) {
      regionSelect.addEventListener('change', (e) => {
        directoryState.region = e.target.value || 'all';
        renderCards();
      });
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        directoryState.filter = btn.getAttribute('data-lib-filter') || 'all';
        filterBtns.forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-lib-filter') === directoryState.filter);
        });
        renderCards();
      });
    });

    renderCards();
  }

  function destroy() {
    clearTimerInterval();
    timerState.running = false;
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.libraries = {
    render,
    destroy
  };
})();
