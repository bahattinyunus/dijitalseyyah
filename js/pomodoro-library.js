/**
 * Anadolu Seyahatnamesi — Kütüphane Odak & Pomodoro Stüdyosu
 * Registers on window.SEYYAH_MODULES.pomodoro = { render(container, ctx), init(ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-pomodoro-library-styles';
  const STORAGE_KEY = 'dijital_seyyah_pomodoro_stats';
  const FLOATING_PILL_ID = 'seyyah-pomodoro-floating-pill';
  const RING_RADIUS = 104;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const MAX_RECENT_LOGS = 25;

  const PRESETS = [
    {
      id: 'focus25',
      emoji: '🍅',
      label: '🍅 25 dk Odak',
      shortLabel: '25 dk Odak',
      badge: 'Klasik Odak',
      minutes: 25,
      isFocus: true,
      accent: '#00f2fe',
      accentLight: '#0284c7',
      glow: 'rgba(0, 242, 254, 0.35)',
      subtitle: 'İl Halk Kütüphanesi masasında tempolu ve verimli odak seansı'
    },
    {
      id: 'deep50',
      emoji: '🧠',
      label: '🧠 50 dk Derin Çalışma',
      shortLabel: '50 dk Derin Çalışma',
      badge: 'Derin Çalışma',
      minutes: 50,
      isFocus: true,
      accent: '#a855f7',
      accentLight: '#7c3aed',
      glow: 'rgba(168, 85, 247, 0.35)',
      subtitle: 'Kesintisiz kodlama, araştırma ve derin tefekkür mesaisi'
    },
    {
      id: 'short5',
      emoji: '☕',
      label: '☕ 5 dk Kısa Mola',
      shortLabel: '5 dk Kısa Mola',
      badge: 'Kısa Mola',
      minutes: 5,
      isFocus: false,
      accent: '#f59e0b',
      accentLight: '#d97706',
      glow: 'rgba(245, 158, 11, 0.35)',
      subtitle: 'Bir fincan çay, derin nefes ve göz dinlendirme molası'
    },
    {
      id: 'long15',
      emoji: '🌿',
      label: '🌿 15 dk Uzun Mola',
      shortLabel: '15 dk Uzun Mola',
      badge: 'Uzun Mola',
      minutes: 15,
      isFocus: false,
      accent: '#10b981',
      accentLight: '#059669',
      glow: 'rgba(16, 185, 129, 0.35)',
      subtitle: 'Kütüphane avlusunda yürüyüş ve zihni tazeleme arası'
    }
  ];

  const TASK_SUGGESTIONS = [
    '📖 Seyahatname Notları',
    '💻 Kod & Mimari Odak',
    '🗺️ 5 Günlük Rota Tasarımı',
    '✍️ Makale & Günlük Yazımı'
  ];

  // Persistent module state (survives view transitions cleanly)
  const timerState = {
    presetId: 'focus25',
    totalSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    running: false,
    endTimestamp: null,
    intervalId: null,
    soundEnabled: true,
    selectedProvinceKey: '',
    taskText: '',
    justCompletedBanner: ''
  };

  let initialized = false;
  let activeCtx = null;
  let activeContainer = null;
  let activeStudioRoot = null;
  let viewportObserver = null;
  let floatingPillEl = null;

  // ---------------------------------------------------------------------------
  // Helpers & Persistence
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

  function esc(str) {
    if (activeCtx && typeof activeCtx.escapeHtml === 'function') {
      return activeCtx.escapeHtml(str);
    }
    return fallbackEscapeHtml(str);
  }

  function formatPlate(plate) {
    const num = Number(plate);
    if (Number.isFinite(num) && num > 0) {
      return String(Math.floor(num)).padStart(2, '0');
    }
    return '00';
  }

  function formatTime(totalSeconds) {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function formatTotalDuration(totalMinutes) {
    const mins = Math.max(0, Math.floor(Number(totalMinutes) || 0));
    if (mins < 60) return `${mins} dk`;
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem > 0 ? `${hours} sa ${rem} dk` : `${hours} sa`;
  }

  function formatLogTimestamp(iso) {
    if (!iso) return '';
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  }

  function getPreset(presetId) {
    return PRESETS.find(p => p.id === presetId) || PRESETS[0];
  }

  function loadStats() {
    const fallback = {
      completedSessions: 0,
      totalFocusMinutes: 0,
      recentLogs: [],
      soundEnabled: true,
      lastProvinceKey: '',
      lastTask: ''
    };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return fallback;
      return {
        completedSessions: Math.max(0, Number(parsed.completedSessions) || 0),
        totalFocusMinutes: Math.max(0, Number(parsed.totalFocusMinutes) || 0),
        recentLogs: Array.isArray(parsed.recentLogs) ? parsed.recentLogs.slice(0, MAX_RECENT_LOGS) : [],
        soundEnabled: parsed.soundEnabled !== false,
        lastProvinceKey: typeof parsed.lastProvinceKey === 'string' ? parsed.lastProvinceKey : '',
        lastTask: typeof parsed.lastTask === 'string' ? parsed.lastTask : ''
      };
    } catch (e) {
      return fallback;
    }
  }

  function saveStats(stats) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      // Ignore storage quota or private mode restrictions
    }
  }

  function updatePersistedMeta(patch) {
    const current = loadStats();
    const next = Object.assign({}, current, patch);
    saveStats(next);
    return next;
  }

  function getSortedProvinces(ctx) {
    const provincesMap = (ctx && ctx.data && ctx.data.provinces) || {};
    return Object.entries(provincesMap)
      .map(([key, p]) => ({ key, data: p || {} }))
      .sort((a, b) => {
        const pa = Number(a.data.plate) || 999;
        const pb = Number(b.data.plate) || 999;
        if (pa !== pb) return pa - pb;
        return String(a.data.name || a.key).localeCompare(String(b.data.name || b.key), 'tr');
      });
  }

  function resolveInitialProvinceKey(sortedProvinces, ctx) {
    if (!sortedProvinces.length) return '';
    const map = (ctx && ctx.data && ctx.data.provinces) || {};
    if (timerState.selectedProvinceKey && map[timerState.selectedProvinceKey]) {
      return timerState.selectedProvinceKey;
    }
    const stats = loadStats();
    if (stats.lastProvinceKey && map[stats.lastProvinceKey]) {
      return stats.lastProvinceKey;
    }
    if (ctx && ctx.state && ctx.state.selectedCityKey && map[ctx.state.selectedCityKey]) {
      return ctx.state.selectedCityKey;
    }
    const ankara = sortedProvinces.find(item => Number(item.data.plate) === 6);
    if (ankara) return ankara.key;
    const firstVisited = sortedProvinces.find(item => Boolean(item.data.visited));
    return (firstVisited || sortedProvinces[0]).key;
  }

  function getProvinceBanner(province) {
    if (province && province.has_banner && province.banner_rel) {
      return province.banner_rel;
    }
    return 'assets/banner.jpg';
  }

  function getProvinceLibraryNote(province) {
    if (!province) return 'İl Halk Kütüphanesi — Sessiz ve verimli dijital çalışma masası.';
    return (
      province.custom_library ||
      province.library ||
      `${province.name || 'Anadolu'} İl Halk Kütüphanesi — Derin odaklanma ve tefekkür çalışma masası.`
    );
  }

  function notifyToast(msg) {
    if (activeCtx && typeof activeCtx.showToast === 'function') {
      activeCtx.showToast(msg);
    }
  }

  // ---------------------------------------------------------------------------
  // Web Audio Resonant Chime (Zero External Audio Files)
  // ---------------------------------------------------------------------------

  function playResonantChime(isFocusComplete) {
    if (!timerState.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.45, audioCtx.currentTime);

      const warmthFilter = audioCtx.createBiquadFilter();
      warmthFilter.type = 'lowpass';
      warmthFilter.frequency.setValueAtTime(2400, audioCtx.currentTime);
      warmthFilter.Q.setValueAtTime(0.7, audioCtx.currentTime);

      masterGain.connect(warmthFilter);
      warmthFilter.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      // Gentle resonant harmonic chord
      const notes = isFocusComplete
        ? [528.0, 660.0, 792.0, 1056.0]
        : [440.0, 554.37, 659.25];

      notes.forEach((freq, idx) => {
        const start = now + idx * 0.17;
        const duration = idx === notes.length - 1 ? 2.1 : 1.5;

        // Primary bell tone
        const oscMain = audioCtx.createOscillator();
        const gainMain = audioCtx.createGain();
        oscMain.type = 'sine';
        oscMain.frequency.setValueAtTime(freq, start);

        gainMain.gain.setValueAtTime(0.0001, start);
        gainMain.gain.exponentialRampToValueAtTime(0.14, start + 0.035);
        gainMain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        oscMain.connect(gainMain);
        gainMain.connect(masterGain);
        oscMain.start(start);
        oscMain.stop(start + duration + 0.05);

        // Soft harmonic overtone shimmer
        const oscHarmonic = audioCtx.createOscillator();
        const gainHarmonic = audioCtx.createGain();
        oscHarmonic.type = 'triangle';
        oscHarmonic.frequency.setValueAtTime(freq * 2, start);

        gainHarmonic.gain.setValueAtTime(0.0001, start);
        gainHarmonic.gain.exponentialRampToValueAtTime(0.03, start + 0.025);
        gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, start + duration * 0.65);

        oscHarmonic.connect(gainHarmonic);
        gainHarmonic.connect(masterGain);
        oscHarmonic.start(start);
        oscHarmonic.stop(start + duration * 0.7 + 0.05);
      });

      setTimeout(() => {
        try {
          audioCtx.close();
        } catch (e) {}
      }, 3200);
    } catch (e) {
      // Gracefully ignore audio errors if blocked by browser policy
    }
  }

  // ---------------------------------------------------------------------------
  // Scoped CSS Injection (Light-Theme & Cyber-Sufi Dark-Theme Compatible)
  // ---------------------------------------------------------------------------

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .pomo-studio-root {
        display: flex;
        flex-direction: column;
        gap: 22px;
        animation: pomoFadeIn 0.35s ease;
        --pomo-accent: var(--accent-cyan, #00f2fe);
        --pomo-glow: rgba(0, 242, 254, 0.32);
      }

      @keyframes pomoFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes pomoPulseDot {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.35); opacity: 0.55; }
      }

      @keyframes pomoAuraPulse {
        0%, 100% { box-shadow: 0 0 26px var(--pomo-glow), inset 0 0 20px rgba(255, 255, 255, 0.03); }
        50% { box-shadow: 0 0 42px var(--pomo-glow), inset 0 0 28px rgba(255, 255, 255, 0.06); }
      }

      /* Top Studio Header */
      .pomo-hero-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        padding: 20px 24px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 8% 15%, rgba(0, 242, 254, 0.14), transparent 45%),
          radial-gradient(circle at 92% 85%, rgba(168, 85, 247, 0.12), transparent 45%),
          var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
      }

      .pomo-hero-titles {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .pomo-kicker {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--pomo-accent);
      }

      .pomo-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.35rem, 2.2vw, 1.85rem);
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        margin: 0;
        line-height: 1.2;
      }

      .pomo-subtitle {
        font-size: 0.88rem;
        color: var(--text-secondary, #94a3b8);
        margin: 0;
      }

      .pomo-header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .pomo-icon-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 9px 14px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pomo-icon-btn:hover {
        border-color: var(--pomo-accent);
        transform: translateY(-1px);
      }

      .pomo-icon-btn.is-muted {
        color: var(--text-muted, #64748b);
      }

      /* Main 2-Column Studio Grid */
      .pomo-main-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.95fr);
        gap: 22px;
        align-items: stretch;
      }

      /* Left Panel: Timer & Controls */
      .pomo-timer-card {
        position: relative;
        padding: 26px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 50% 0%, var(--pomo-glow), transparent 62%),
          var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }

      .pomo-presets-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        width: 100%;
      }

      .pomo-preset-btn {
        padding: 8px 14px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.5);
        color: var(--text-secondary, #94a3b8);
        font-family: inherit;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.22s ease;
      }

      .pomo-preset-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: var(--pomo-accent);
      }

      .pomo-preset-btn.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.18), rgba(79, 172, 254, 0.14));
        border-color: var(--pomo-accent);
        color: var(--text-primary, #f8fafc);
        box-shadow: 0 0 18px var(--pomo-glow);
      }

      /* SVG Countdown Ring */
      .pomo-ring-stage {
        position: relative;
        width: 244px;
        height: 244px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: box-shadow 0.35s ease;
      }

      .pomo-ring-stage.is-running {
        animation: pomoAuraPulse 2.8s ease-in-out infinite;
      }

      .pomo-ring-svg {
        width: 244px;
        height: 244px;
        transform: rotate(-90deg);
        overflow: visible;
      }

      .pomo-ring-track {
        fill: none;
        stroke: var(--border-glass, rgba(255, 255, 255, 0.12));
        stroke-width: 11;
      }

      .pomo-ring-deco {
        fill: none;
        stroke: var(--border-glass, rgba(255, 255, 255, 0.16));
        stroke-width: 1.5;
        stroke-dasharray: 2 8;
      }

      .pomo-ring-progress {
        fill: none;
        stroke: var(--pomo-accent);
        stroke-width: 11;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.35s linear, stroke 0.3s ease;
        filter: drop-shadow(0 0 10px var(--pomo-glow));
      }

      .pomo-ring-center {
        position: absolute;
        inset: 18px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 12px;
      }

      .pomo-status-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 10px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        color: var(--pomo-accent);
        margin-bottom: 6px;
      }

      .pomo-live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--pomo-accent);
        display: none;
      }

      .pomo-ring-stage.is-running .pomo-live-dot {
        display: inline-block;
        animation: pomoPulseDot 1.3s ease-in-out infinite;
      }

      .pomo-clock-readout {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-variant-numeric: tabular-nums;
        font-size: 2.95rem;
        font-weight: 800;
        letter-spacing: 0.03em;
        color: var(--text-primary, #f8fafc);
        line-height: 1.05;
      }

      .pomo-preset-caption {
        margin-top: 6px;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary, #94a3b8);
        max-width: 170px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pomo-preset-desc {
        font-size: 0.83rem;
        color: var(--text-secondary, #94a3b8);
        text-align: center;
        margin: -6px 0 0;
      }

      /* Controls */
      .pomo-controls-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
        width: 100%;
      }

      .pomo-btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-width: 158px;
        padding: 12px 24px;
        border-radius: var(--radius-full, 9999px);
        border: none;
        background: linear-gradient(135deg, var(--accent-cyan, #00f2fe), var(--accent-blue, #4facfe));
        color: #06101f;
        font-family: var(--font-heading, inherit);
        font-size: 0.95rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 8px 24px var(--pomo-glow);
        transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
      }

      .pomo-btn-primary:hover {
        transform: translateY(-2px);
        filter: brightness(1.06);
      }

      .pomo-btn-primary.is-running {
        background: linear-gradient(135deg, var(--accent-gold, #f59e0b), #f97316);
        color: #0f172a;
      }

      .pomo-btn-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 12px 18px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.5);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pomo-btn-secondary:hover {
        border-color: var(--pomo-accent);
        transform: translateY(-1px);
      }

      /* Task Input Box */
      .pomo-task-box {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 9px;
        padding-top: 8px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .pomo-task-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .pomo-task-input {
        width: 100%;
        padding: 12px 15px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.6);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.92rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .pomo-task-input::placeholder {
        color: var(--text-muted, #64748b);
      }

      .pomo-task-input:focus {
        border-color: var(--pomo-accent);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .pomo-suggestion-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .pomo-chip-btn {
        padding: 4px 10px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(255, 255, 255, 0.04);
        color: var(--text-secondary, #94a3b8);
        font-family: inherit;
        font-size: 0.74rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pomo-chip-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: var(--pomo-accent);
      }

      /* Right Panel: Province Library Selector + Backdrop */
      .pomo-library-card {
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        overflow: hidden;
      }

      .pomo-selector-bar {
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .pomo-selector-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .pomo-selector-title {
        font-family: var(--font-heading, inherit);
        font-size: 0.98rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      .pomo-selector-controls {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .pomo-province-select {
        flex: 1;
        min-width: 0;
        padding: 10px 12px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.16));
        background: rgba(15, 23, 42, 0.75);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        outline: none;
      }

      .pomo-province-select:focus {
        border-color: var(--pomo-accent);
      }

      .pomo-random-btn {
        padding: 10px 13px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.6);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;
      }

      .pomo-random-btn:hover {
        border-color: var(--pomo-accent);
        transform: translateY(-1px);
      }

      /* Banner Backdrop Stage */
      .pomo-banner-stage {
        position: relative;
        flex: 1;
        min-height: 290px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 22px;
        overflow: hidden;
      }

      .pomo-banner-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s ease;
      }

      .pomo-library-card:hover .pomo-banner-img {
        transform: scale(1.03);
      }

      .pomo-banner-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(7, 12, 24, 0.28) 0%,
          rgba(7, 12, 24, 0.62) 45%,
          rgba(7, 12, 24, 0.94) 100%
        );
      }

      .pomo-banner-content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        gap: 12px;
        color: #f8fafc;
      }

      .pomo-province-badges {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .pomo-plate-badge {
        padding: 4px 10px;
        border-radius: var(--radius-sm, 8px);
        background: rgba(0, 242, 254, 0.22);
        border: 1px solid rgba(0, 242, 254, 0.45);
        color: #e0f2fe;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.05em;
      }

      .pomo-region-badge {
        padding: 4px 10px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(15, 23, 42, 0.68);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #e2e8f0;
        font-size: 0.76rem;
        font-weight: 600;
      }

      .pomo-status-badge {
        padding: 4px 10px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.74rem;
        font-weight: 700;
      }

      .pomo-status-badge.visited {
        background: rgba(16, 185, 129, 0.24);
        border: 1px solid rgba(16, 185, 129, 0.55);
        color: #a7f3d0;
      }

      .pomo-status-badge.planned {
        background: rgba(245, 158, 11, 0.22);
        border: 1px solid rgba(245, 158, 11, 0.5);
        color: #fde68a;
      }

      .pomo-province-heading {
        font-family: var(--font-heading, inherit);
        font-size: 1.5rem;
        font-weight: 800;
        color: #ffffff;
        margin: 0;
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
      }

      .pomo-library-note-box {
        padding: 13px 15px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.16);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      .pomo-library-note-label {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #38bdf8;
        margin-bottom: 4px;
      }

      .pomo-library-note-text {
        font-size: 0.88rem;
        line-height: 1.55;
        color: #f1f5f9;
        margin: 0;
      }

      .pomo-banner-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 2px;
      }

      .pomo-inspect-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 9px 16px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid rgba(0, 242, 254, 0.5);
        background: rgba(0, 242, 254, 0.18);
        color: #ffffff;
        font-family: inherit;
        font-size: 0.84rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pomo-inspect-btn:hover {
        background: rgba(0, 242, 254, 0.32);
        transform: translateY(-1px);
      }

      /* Stats & Recent Focus Log */
      .pomo-stats-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .pomo-stat-card {
        padding: 16px 18px;
        border-radius: var(--radius-md, 14px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .pomo-stat-label {
        font-size: 0.76rem;
        font-weight: 600;
        color: var(--text-secondary, #94a3b8);
      }

      .pomo-stat-val {
        font-family: var(--font-heading, inherit);
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .pomo-log-card {
        padding: 20px 22px;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .pomo-log-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .pomo-log-title {
        font-family: var(--font-heading, inherit);
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        margin: 0;
      }

      .pomo-clear-log-btn {
        padding: 5px 12px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: transparent;
        color: var(--text-muted, #64748b);
        font-family: inherit;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pomo-clear-log-btn:hover {
        color: #f87171;
        border-color: rgba(248, 113, 113, 0.45);
      }

      .pomo-log-list {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }

      .pomo-log-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 11px 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .pomo-log-left {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }

      .pomo-log-task {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pomo-log-meta {
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      .pomo-log-duration {
        flex-shrink: 0;
        padding: 4px 10px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: var(--accent-emerald, #10b981);
        font-size: 0.76rem;
        font-weight: 700;
      }

      .pomo-log-empty {
        padding: 20px;
        text-align: center;
        border-radius: var(--radius-md, 12px);
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.14));
        color: var(--text-secondary, #94a3b8);
        font-size: 0.86rem;
      }

      /* Floating Mini Timer Pill (Visible on other views when timer runs) */
      #${FLOATING_PILL_ID} {
        position: fixed;
        top: 76px;
        right: 20px;
        z-index: 9300;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 8px 14px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid rgba(0, 242, 254, 0.45);
        background: rgba(10, 15, 29, 0.88);
        color: #f8fafc;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45), 0 0 18px rgba(0, 242, 254, 0.25);
        font-family: var(--font-body, sans-serif);
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        max-width: calc(100vw - 40px);
      }

      #${FLOATING_PILL_ID}:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 242, 254, 0.4);
      }

      #${FLOATING_PILL_ID} .pomo-pill-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
        animation: pomoPulseDot 1.2s ease-in-out infinite;
        flex-shrink: 0;
      }

      #${FLOATING_PILL_ID} .pomo-pill-time {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-variant-numeric: tabular-nums;
        font-size: 0.9rem;
        font-weight: 800;
        letter-spacing: 0.04em;
      }

      #${FLOATING_PILL_ID} .pomo-pill-city {
        color: #94a3b8;
        font-weight: 600;
        font-size: 0.76rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 115px;
      }

      /* Light Theme Overrides */
      body.light-theme .pomo-hero-bar,
      body.light-theme .pomo-timer-card,
      body.light-theme .pomo-library-card,
      body.light-theme .pomo-stat-card,
      body.light-theme .pomo-log-card {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 10px 26px -6px rgba(15, 23, 42, 0.08);
      }

      body.light-theme .pomo-icon-btn,
      body.light-theme .pomo-preset-btn,
      body.light-theme .pomo-btn-secondary,
      body.light-theme .pomo-random-btn,
      body.light-theme .pomo-status-chip {
        background: rgba(241, 245, 249, 0.92);
        border-color: rgba(15, 23, 42, 0.14);
        color: var(--text-primary, #0f172a);
      }

      body.light-theme .pomo-preset-btn {
        color: var(--text-secondary, #334155);
      }

      body.light-theme .pomo-preset-btn.active {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.16), rgba(37, 99, 235, 0.12));
        color: var(--text-primary, #0f172a);
      }

      body.light-theme .pomo-task-input,
      body.light-theme .pomo-province-select {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.16);
        color: var(--text-primary, #0f172a);
      }

      body.light-theme .pomo-chip-btn,
      body.light-theme .pomo-log-item {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .pomo-ring-track {
        stroke: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .pomo-ring-deco {
        stroke: rgba(15, 23, 42, 0.15);
      }

      body.light-theme #${FLOATING_PILL_ID} {
        background: rgba(255, 255, 255, 0.94);
        color: #0f172a;
        border-color: rgba(2, 132, 199, 0.45);
        box-shadow: 0 10px 26px rgba(15, 23, 42, 0.15);
      }

      body.light-theme #${FLOATING_PILL_ID} .pomo-pill-city {
        color: #475569;
      }

      /* Responsive */
      @media (max-width: 980px) {
        .pomo-main-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .pomo-stats-grid {
          grid-template-columns: 1fr;
        }
        .pomo-timer-card {
          padding: 20px 16px;
        }
        .pomo-ring-stage,
        .pomo-ring-svg {
          width: 216px;
          height: 216px;
        }
        .pomo-clock-readout {
          font-size: 2.45rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Floating Timer Pill Management
  // ---------------------------------------------------------------------------

  function isStudioMounted() {
    return Boolean(activeStudioRoot && activeStudioRoot.isConnected && document.body.contains(activeStudioRoot));
  }

  function removeFloatingPill() {
    if (floatingPillEl && floatingPillEl.parentNode) {
      floatingPillEl.parentNode.removeChild(floatingPillEl);
    }
    floatingPillEl = null;
  }

  function syncFloatingPill() {
    if (!timerState.running || isStudioMounted()) {
      removeFloatingPill();
      return;
    }

    const preset = getPreset(timerState.presetId);
    const provincesMap = (activeCtx && activeCtx.data && activeCtx.data.provinces) || {};
    const province = provincesMap[timerState.selectedProvinceKey];
    const cityLabel = province ? `${formatPlate(province.plate)} ${province.name}` : 'Kütüphane';
    const timeText = formatTime(timerState.remainingSeconds);

    if (!floatingPillEl || !floatingPillEl.isConnected) {
      floatingPillEl = document.createElement('button');
      floatingPillEl.type = 'button';
      floatingPillEl.id = FLOATING_PILL_ID;
      floatingPillEl.title = 'Kütüphane Odak Stüdyosuna Dön';
      floatingPillEl.setAttribute('aria-label', 'Aktif Pomodoro sayacını aç');
      floatingPillEl.addEventListener('click', () => {
        if (activeCtx && typeof activeCtx.openView === 'function') {
          activeCtx.openView('pomodoro');
        }
      });
      document.body.appendChild(floatingPillEl);
    }

    const isLight = document.body.classList.contains('light-theme');
    const accent = isLight ? preset.accentLight : preset.accent;
    floatingPillEl.style.borderColor = accent;

    floatingPillEl.innerHTML = `
      <span class="pomo-pill-dot"></span>
      <span>${esc(preset.emoji)}</span>
      <span class="pomo-pill-time">${esc(timeText)}</span>
      <span class="pomo-pill-city">${esc(cityLabel)}</span>
      <span aria-hidden="true">↗</span>
    `;
  }

  // ---------------------------------------------------------------------------
  // Timer Engine
  // ---------------------------------------------------------------------------

  function clearTimerInterval() {
    if (timerState.intervalId !== null) {
      clearInterval(timerState.intervalId);
      timerState.intervalId = null;
    }
  }

  function getAccentForTheme(preset) {
    const isLight = document.body && document.body.classList.contains('light-theme');
    return isLight ? preset.accentLight : preset.accent;
  }

  function updateMountedTimerUI() {
    syncFloatingPill();
    if (!isStudioMounted() || !activeStudioRoot) return;

    const preset = getPreset(timerState.presetId);
    const accent = getAccentForTheme(preset);
    activeStudioRoot.style.setProperty('--pomo-accent', accent);
    activeStudioRoot.style.setProperty('--pomo-glow', preset.glow);

    const ringStage = activeStudioRoot.querySelector('[data-pomo-ring-stage]');
    const ringProgress = activeStudioRoot.querySelector('[data-pomo-ring-progress]');
    const clockEl = activeStudioRoot.querySelector('[data-pomo-clock]');
    const statusTextEl = activeStudioRoot.querySelector('[data-pomo-status-text]');
    const playBtn = activeStudioRoot.querySelector('[data-pomo-toggle]');

    const progressRatio = timerState.totalSeconds > 0
      ? Math.max(0, Math.min(1, timerState.remainingSeconds / timerState.totalSeconds))
      : 0;
    const offset = RING_CIRCUMFERENCE * (1 - progressRatio);

    if (ringProgress) {
      ringProgress.style.strokeDasharray = String(RING_CIRCUMFERENCE);
      ringProgress.style.strokeDashoffset = String(offset);
    }

    if (ringStage) {
      ringStage.classList.toggle('is-running', timerState.running);
    }

    if (clockEl) {
      clockEl.textContent = formatTime(timerState.remainingSeconds);
    }

    if (statusTextEl) {
      if (timerState.running) {
        statusTextEl.textContent = preset.isFocus ? 'ODAKLANIYOR' : 'MOLADA';
      } else if (timerState.remainingSeconds < timerState.totalSeconds) {
        statusTextEl.textContent = 'DURAKLATILDI';
      } else {
        statusTextEl.textContent = 'HAZIR';
      }
    }

    if (playBtn) {
      playBtn.classList.toggle('is-running', timerState.running);
      if (timerState.running) {
        playBtn.textContent = '⏸ Duraklat';
      } else if (timerState.remainingSeconds < timerState.totalSeconds) {
        playBtn.textContent = '▶ Devam Et';
      } else {
        playBtn.textContent = '▶ Başlat';
      }
    }
  }

  function completeSession() {
    clearTimerInterval();
    timerState.running = false;
    timerState.endTimestamp = null;

    const preset = getPreset(timerState.presetId);
    playResonantChime(preset.isFocus);

    const provincesMap = (activeCtx && activeCtx.data && activeCtx.data.provinces) || {};
    const province = provincesMap[timerState.selectedProvinceKey];
    const provinceName = province ? province.name : 'Anadolu Kütüphanesi';
    const plate = province ? province.plate : 0;

    if (preset.isFocus) {
      const stats = loadStats();
      const taskLabel = (timerState.taskText || '').trim() || 'Kütüphane Odak Seansı';
      const entry = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        task: taskLabel,
        provinceKey: timerState.selectedProvinceKey,
        provinceName,
        plate,
        presetLabel: preset.shortLabel,
        minutes: preset.minutes,
        completedAt: new Date().toISOString()
      };

      const nextStats = {
        completedSessions: stats.completedSessions + 1,
        totalFocusMinutes: stats.totalFocusMinutes + preset.minutes,
        recentLogs: [entry, ...stats.recentLogs].slice(0, MAX_RECENT_LOGS),
        soundEnabled: timerState.soundEnabled,
        lastProvinceKey: timerState.selectedProvinceKey,
        lastTask: timerState.taskText
      };
      saveStats(nextStats);
      notifyToast(`✅ ${preset.minutes} dk odak tamamlandı! (${provinceName})`);
    } else {
      notifyToast(`🌿 ${preset.shortLabel} tamamlandı! Yeni seansa hazırsınız.`);
    }

    // Reset timer to current preset duration for the next round
    timerState.totalSeconds = preset.minutes * 60;
    timerState.remainingSeconds = preset.minutes * 60;

    if (isStudioMounted() && activeContainer && activeCtx) {
      render(activeContainer, activeCtx);
    } else {
      syncFloatingPill();
    }
  }

  function tickTimer() {
    if (!timerState.running || !timerState.endTimestamp) return;
    const msLeft = timerState.endTimestamp - Date.now();
    const nextSeconds = Math.max(0, Math.ceil(msLeft / 1000));
    if (nextSeconds !== timerState.remainingSeconds) {
      timerState.remainingSeconds = nextSeconds;
    }
    updateMountedTimerUI();
    if (msLeft <= 0) {
      completeSession();
    }
  }

  function startTimer() {
    if (timerState.running) return;
    if (timerState.remainingSeconds <= 0) {
      const preset = getPreset(timerState.presetId);
      timerState.totalSeconds = preset.minutes * 60;
      timerState.remainingSeconds = preset.minutes * 60;
    }
    timerState.running = true;
    timerState.endTimestamp = Date.now() + timerState.remainingSeconds * 1000;
    clearTimerInterval();
    timerState.intervalId = setInterval(tickTimer, 250);
    updateMountedTimerUI();
  }

  function pauseTimer() {
    if (!timerState.running) return;
    if (timerState.endTimestamp) {
      timerState.remainingSeconds = Math.max(0, Math.ceil((timerState.endTimestamp - Date.now()) / 1000));
    }
    clearTimerInterval();
    timerState.running = false;
    timerState.endTimestamp = null;
    updateMountedTimerUI();
  }

  function resetTimer() {
    clearTimerInterval();
    timerState.running = false;
    timerState.endTimestamp = null;
    const preset = getPreset(timerState.presetId);
    timerState.totalSeconds = preset.minutes * 60;
    timerState.remainingSeconds = preset.minutes * 60;
    updateMountedTimerUI();
  }

  function selectPreset(presetId) {
    const preset = getPreset(presetId);
    clearTimerInterval();
    timerState.running = false;
    timerState.endTimestamp = null;
    timerState.presetId = preset.id;
    timerState.totalSeconds = preset.minutes * 60;
    timerState.remainingSeconds = preset.minutes * 60;

    if (isStudioMounted() && activeContainer && activeCtx) {
      render(activeContainer, activeCtx);
    } else {
      syncFloatingPill();
    }
  }

  // ---------------------------------------------------------------------------
  // Lifecycle: init(ctx) & render(container, ctx)
  // ---------------------------------------------------------------------------

  function init(ctx) {
    if (ctx) activeCtx = ctx;
    injectStyles();

    if (!initialized) {
      const stats = loadStats();
      timerState.soundEnabled = stats.soundEnabled !== false;
      if (stats.lastTask && !timerState.taskText) {
        timerState.taskText = stats.lastTask;
      }

      const sortedProvinces = getSortedProvinces(activeCtx);
      if (sortedProvinces.length) {
        timerState.selectedProvinceKey = resolveInitialProvinceKey(sortedProvinces, activeCtx);
      }

      // Observe #viewport-content mutations so floating pill reacts immediately on navigation
      const viewport = document.getElementById('viewport-content');
      if (viewport && typeof MutationObserver === 'function' && !viewportObserver) {
        viewportObserver = new MutationObserver(() => {
          syncFloatingPill();
        });
        viewportObserver.observe(viewport, { childList: true });
      }

      window.addEventListener('hashchange', syncFloatingPill);
      initialized = true;
    }

    syncFloatingPill();
  }

  function render(container, ctx) {
    if (!container) return;
    if (ctx) activeCtx = ctx;
    activeContainer = container;

    init(activeCtx);

    const sortedProvinces = getSortedProvinces(activeCtx);
    timerState.selectedProvinceKey = resolveInitialProvinceKey(sortedProvinces, activeCtx);

    const provincesMap = (activeCtx && activeCtx.data && activeCtx.data.provinces) || {};
    const selectedProvince = provincesMap[timerState.selectedProvinceKey] || null;
    const preset = getPreset(timerState.presetId);
    const accent = getAccentForTheme(preset);
    const stats = loadStats();

    const bannerSrc = getProvinceBanner(selectedProvince);
    const libraryNote = getProvinceLibraryNote(selectedProvince);
    const provinceName = selectedProvince ? selectedProvince.name : 'Anadolu Kütüphanesi';
    const provincePlate = selectedProvince ? formatPlate(selectedProvince.plate) : '00';
    const provinceRegion = selectedProvince ? selectedProvince.region : 'Türkiye';
    const isVisited = Boolean(selectedProvince && selectedProvince.visited);

    const progressRatio = timerState.totalSeconds > 0
      ? Math.max(0, Math.min(1, timerState.remainingSeconds / timerState.totalSeconds))
      : 0;
    const initialOffset = RING_CIRCUMFERENCE * (1 - progressRatio);

    const presetButtonsHtml = PRESETS.map(p => `
      <button
        type="button"
        class="pomo-preset-btn ${p.id === preset.id ? 'active' : ''}"
        data-pomo-preset="${esc(p.id)}"
      >${esc(p.label)}</button>
    `).join('');

    const provinceOptionsHtml = sortedProvinces.length
      ? sortedProvinces.map(({ key, data }) => {
          const selectedAttr = key === timerState.selectedProvinceKey ? 'selected' : '';
          const mark = data.visited ? '✓' : '⏳';
          return `<option value="${esc(key)}" ${selectedAttr}>${esc(formatPlate(data.plate))} — ${esc(data.name)} (${esc(data.region)}) ${mark}</option>`;
        }).join('')
      : '<option value="">İl verisi bulunamadı</option>';

    const suggestionChipsHtml = TASK_SUGGESTIONS.map(label => `
      <button type="button" class="pomo-chip-btn" data-pomo-chip="${esc(label)}">${esc(label)}</button>
    `).join('');

    const logsHtml = stats.recentLogs.length
      ? stats.recentLogs.map(log => {
          const plateStr = log.plate ? `${formatPlate(log.plate)} ` : '';
          const timeStr = formatLogTimestamp(log.completedAt);
          return `
            <div class="pomo-log-item">
              <div class="pomo-log-left">
                <div class="pomo-log-task">${esc(log.task)}</div>
                <div class="pomo-log-meta">📚 ${esc(plateStr)}${esc(log.provinceName)} · ${esc(log.presetLabel)}${timeStr ? ` · ${esc(timeStr)}` : ''}</div>
              </div>
              <span class="pomo-log-duration">+${esc(log.minutes)} dk</span>
            </div>
          `;
        }).join('')
      : `
        <div class="pomo-log-empty">
          Henüz tamamlanmış odak seansı yok. Bir il halk kütüphanesi masası seçin, görevinizi yazın ve sayacı başlatın.
        </div>
      `;

    const statusLabel = timerState.running
      ? (preset.isFocus ? 'ODAKLANIYOR' : 'MOLADA')
      : (timerState.remainingSeconds < timerState.totalSeconds ? 'DURAKLATILDI' : 'HAZIR');

    const toggleLabel = timerState.running
      ? '⏸ Duraklat'
      : (timerState.remainingSeconds < timerState.totalSeconds ? '▶ Devam Et' : '▶ Başlat');

    container.innerHTML = `
      <section class="pomo-studio-root" style="--pomo-accent: ${esc(accent)}; --pomo-glow: ${esc(preset.glow)};">
        <header class="pomo-hero-bar">
          <div class="pomo-hero-titles">
            <span class="pomo-kicker">Dijital Seyyah Çalışma Disiplini</span>
            <h2 class="pomo-title">📚 Kütüphane Odak &amp; Pomodoro Stüdyosu</h2>
            <p class="pomo-subtitle">81 ilin İl Halk Kütüphanesi atmosferinde derin odaklanma, ritmik mola ve üretim günlüğü.</p>
          </div>
          <div class="pomo-header-actions">
            <button
              type="button"
              class="pomo-icon-btn ${timerState.soundEnabled ? '' : 'is-muted'}"
              data-pomo-sound-toggle
              title="Seans bitiş zilini aç/kapat"
            >${timerState.soundEnabled ? '🔔 Zil Açık' : '🔕 Zil Sessiz'}</button>
            <button
              type="button"
              class="pomo-icon-btn"
              data-pomo-test-chime
              title="Rezonans zil sesini önizle"
            >🎵 Zili Dene</button>
          </div>
        </header>

        <div class="pomo-main-grid">
          <!-- Left Column: Animated SVG Ring, Presets, Controls & Task -->
          <div class="pomo-timer-card">
            <div class="pomo-presets-row" role="tablist" aria-label="Odak Süresi Şablonları">
              ${presetButtonsHtml}
            </div>

            <div class="pomo-ring-stage ${timerState.running ? 'is-running' : ''}" data-pomo-ring-stage>
              <svg class="pomo-ring-svg" viewBox="0 0 240 240" aria-hidden="true">
                <circle class="pomo-ring-deco" cx="120" cy="120" r="115"></circle>
                <circle class="pomo-ring-track" cx="120" cy="120" r="${RING_RADIUS}"></circle>
                <circle
                  class="pomo-ring-progress"
                  data-pomo-ring-progress
                  cx="120"
                  cy="120"
                  r="${RING_RADIUS}"
                  stroke-dasharray="${RING_CIRCUMFERENCE}"
                  stroke-dashoffset="${initialOffset}"
                ></circle>
              </svg>
              <div class="pomo-ring-center">
                <span class="pomo-status-chip">
                  <span class="pomo-live-dot"></span>
                  <span data-pomo-status-text>${esc(statusLabel)}</span>
                </span>
                <div class="pomo-clock-readout" data-pomo-clock>${esc(formatTime(timerState.remainingSeconds))}</div>
                <div class="pomo-preset-caption">${esc(preset.emoji)} ${esc(preset.badge)}</div>
              </div>
            </div>

            <p class="pomo-preset-desc">${esc(preset.subtitle)}</p>

            <div class="pomo-controls-row">
              <button
                type="button"
                class="pomo-btn-primary ${timerState.running ? 'is-running' : ''}"
                data-pomo-toggle
              >${esc(toggleLabel)}</button>
              <button type="button" class="pomo-btn-secondary" data-pomo-reset>↺ Sıfırla</button>
            </div>

            <div class="pomo-task-box">
              <label class="pomo-task-label" for="pomo-task-input">
                <span>✍️ Seans Hedefi</span>
                <span style="font-weight: 500; opacity: 0.78;">${esc(provincePlate)} ${esc(provinceName)}</span>
              </label>
              <input
                id="pomo-task-input"
                type="text"
                class="pomo-task-input"
                data-pomo-task-input
                maxlength="140"
                placeholder="Bugünkü Odak Göreviniz..."
                value="${esc(timerState.taskText)}"
              />
              <div class="pomo-suggestion-chips">
                ${suggestionChipsHtml}
              </div>
            </div>
          </div>

          <!-- Right Column: 81-Province Library Backdrop & Info -->
          <div class="pomo-library-card">
            <div class="pomo-selector-bar">
              <div class="pomo-selector-top">
                <span class="pomo-selector-title">🏛️ İl Halk Kütüphanesi Seçin (${sortedProvinces.length} İl)</span>
              </div>
              <div class="pomo-selector-controls">
                <select class="pomo-province-select" data-pomo-province-select aria-label="İl Halk Kütüphanesi Seçin">
                  ${provinceOptionsHtml}
                </select>
                <button type="button" class="pomo-random-btn" data-pomo-random-province title="Rastgele bir il kütüphanesi seç">
                  🎲 Rastgele
                </button>
              </div>
            </div>

            <div class="pomo-banner-stage">
              <img
                class="pomo-banner-img"
                src="${esc(bannerSrc)}"
                alt="${esc(provinceName)} manzarası"
                onerror="this.onerror=null;this.src='assets/banner.jpg';"
              />
              <div class="pomo-banner-scrim"></div>
              <div class="pomo-banner-content">
                <div class="pomo-province-badges">
                  <span class="pomo-plate-badge">${esc(provincePlate)}</span>
                  <span class="pomo-region-badge">${esc(provinceRegion)}</span>
                  <span class="pomo-status-badge ${isVisited ? 'visited' : 'planned'}">
                    ${isVisited ? '✓ Ziyaret Edildi' : '⏳ Rotada Bekliyor'}
                  </span>
                </div>
                <h3 class="pomo-province-heading">${esc(provinceName)} İl Halk Kütüphanesi</h3>
                <div class="pomo-library-note-box">
                  <div class="pomo-library-note-label">Kütüphane Çalışma Ortamı</div>
                  <p class="pomo-library-note-text">${esc(libraryNote)}</p>
                </div>
                <div class="pomo-banner-actions">
                  <button
                    type="button"
                    class="pomo-inspect-btn"
                    data-pomo-inspect-province
                    ${selectedProvince ? '' : 'disabled'}
                  >📍 İli İncele</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="pomo-stats-grid">
          <div class="pomo-stat-card">
            <span class="pomo-stat-label">🍅 Tamamlanan Odak Seansı</span>
            <strong class="pomo-stat-val">${esc(stats.completedSessions)}</strong>
          </div>
          <div class="pomo-stat-card">
            <span class="pomo-stat-label">⏱️ Toplam Odak Süresi</span>
            <strong class="pomo-stat-val">${esc(formatTotalDuration(stats.totalFocusMinutes))}</strong>
          </div>
          <div class="pomo-stat-card">
            <span class="pomo-stat-label">📚 Aktif Çalışma Masası</span>
            <strong class="pomo-stat-val" style="font-size: 1.18rem;">${esc(provincePlate)} ${esc(provinceName)}</strong>
          </div>
        </div>

        <!-- Recent Focus Log -->
        <div class="pomo-log-card">
          <div class="pomo-log-header">
            <h3 class="pomo-log-title">📜 Son Odak Günlüğü</h3>
            ${stats.recentLogs.length
              ? '<button type="button" class="pomo-clear-log-btn" data-pomo-clear-log>Günlüğü Temizle</button>'
              : ''}
          </div>
          <div class="pomo-log-list">
            ${logsHtml}
          </div>
        </div>
      </section>
    `;

    activeStudioRoot = container.querySelector('.pomo-studio-root');
    bindEvents(activeStudioRoot, sortedProvinces);
    syncFloatingPill();
  }

  // ---------------------------------------------------------------------------
  // Event Wiring
  // ---------------------------------------------------------------------------

  function bindEvents(root, sortedProvinces) {
    if (!root) return;

    root.querySelectorAll('[data-pomo-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetId = btn.getAttribute('data-pomo-preset');
        selectPreset(presetId);
      });
    });

    const toggleBtn = root.querySelector('[data-pomo-toggle]');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (timerState.running) {
          pauseTimer();
        } else {
          startTimer();
        }
      });
    }

    const resetBtn = root.querySelector('[data-pomo-reset]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetTimer();
      });
    }

    const soundToggleBtn = root.querySelector('[data-pomo-sound-toggle]');
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        timerState.soundEnabled = !timerState.soundEnabled;
        updatePersistedMeta({ soundEnabled: timerState.soundEnabled });
        soundToggleBtn.classList.toggle('is-muted', !timerState.soundEnabled);
        soundToggleBtn.textContent = timerState.soundEnabled ? '🔔 Zil Açık' : '🔕 Zil Sessiz';
        notifyToast(timerState.soundEnabled ? '🔔 Seans bitiş zili açıldı' : '🔕 Seans bitiş zili kapatıldı');
      });
    }

    const testChimeBtn = root.querySelector('[data-pomo-test-chime]');
    if (testChimeBtn) {
      testChimeBtn.addEventListener('click', () => {
        const prev = timerState.soundEnabled;
        timerState.soundEnabled = true;
        playResonantChime(true);
        timerState.soundEnabled = prev;
      });
    }

    const taskInput = root.querySelector('[data-pomo-task-input]');
    if (taskInput) {
      taskInput.addEventListener('input', () => {
        timerState.taskText = taskInput.value;
        updatePersistedMeta({ lastTask: timerState.taskText });
      });
    }

    root.querySelectorAll('[data-pomo-chip]').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-pomo-chip') || '';
        timerState.taskText = val;
        if (taskInput) {
          taskInput.value = val;
          taskInput.focus();
        }
        updatePersistedMeta({ lastTask: val });
      });
    });

    const provinceSelect = root.querySelector('[data-pomo-province-select]');
    if (provinceSelect) {
      provinceSelect.addEventListener('change', () => {
        const nextKey = provinceSelect.value;
        if (!nextKey) return;
        timerState.selectedProvinceKey = nextKey;
        updatePersistedMeta({ lastProvinceKey: nextKey });
        if (activeContainer && activeCtx) {
          render(activeContainer, activeCtx);
        }
      });
    }

    const randomBtn = root.querySelector('[data-pomo-random-province]');
    if (randomBtn && sortedProvinces.length) {
      randomBtn.addEventListener('click', () => {
        let idx = Math.floor(Math.random() * sortedProvinces.length);
        if (sortedProvinces.length > 1 && sortedProvinces[idx].key === timerState.selectedProvinceKey) {
          idx = (idx + 1) % sortedProvinces.length;
        }
        const pick = sortedProvinces[idx].key;
        timerState.selectedProvinceKey = pick;
        updatePersistedMeta({ lastProvinceKey: pick });
        if (activeContainer && activeCtx) {
          render(activeContainer, activeCtx);
        }
      });
    }

    const inspectBtn = root.querySelector('[data-pomo-inspect-province]');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => {
        const key = timerState.selectedProvinceKey;
        if (!key) return;
        if (activeCtx && typeof activeCtx.selectCity === 'function') {
          activeCtx.selectCity(key);
        } else {
          window.location.hash = `#city/${encodeURIComponent(key)}`;
        }
      });
    }

    const clearLogBtn = root.querySelector('[data-pomo-clear-log]');
    if (clearLogBtn) {
      clearLogBtn.addEventListener('click', () => {
        updatePersistedMeta({ recentLogs: [] });
        notifyToast('📜 Odak günlüğü temizlendi');
        if (activeContainer && activeCtx) {
          render(activeContainer, activeCtx);
        }
      });
    }
  }

  window.SEYYAH_MODULES.pomodoro = {
    render,
    init
  };
})();
