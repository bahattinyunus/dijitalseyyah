/* ==========================================================================
   Dijital Seyyah — Live AI Status Pill & Telemetry HUD
   File: js/ai-telemetry-hud.js
   Registers on: window.SEYYAH_MODULES.aiHud = { init(ctx) }
   Features:
     1. Injects #seyyah-ai-status-pill into header .header-actions (before #btn-map)
     2. Displays "🟢 AI" when window.SEYYAH_AI.hasKey() is true, or "✨ AI" otherwise
     3. Listens to `seyyah:ai-telemetry` events and updates a crisp glass hover
        popover (active model, call count, cache hits, last latency)
     4. Clicking toggles Floating AI Copilot or falls back to ctx.openView('advisor')
     5. Zero API key exposure, mobile-safe (hides label on small screens),
        scoped CSS, dark & light-theme compatible
   ========================================================================== */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-ai-hud-styles';
  const WRAP_ID = 'seyyah-ai-hud-wrap';
  const PILL_ID = 'seyyah-ai-status-pill';
  const POPOVER_ID = 'seyyah-ai-hud-popover';
  const MODEL_STORAGE_KEY = 'dijital_seyyah_gemini_model';
  const DEFAULT_MODEL = 'gemini-flash-lite-latest';

  let _ctx = null;
  let _initialized = false;
  let _listenersBound = false;
  let _pulseTimer = null;

  const _seenEvents = typeof WeakSet === 'function' ? new WeakSet() : null;

  const _state = {
    hasKey: false,
    activeModel: DEFAULT_MODEL,
    callCount: 0,
    cacheHits: 0,
    lastLatencyMs: null,
    inFlight: false,
    lastStatus: 'ready',
    lastSource: ''
  };

  /**
   * Sanitizes strings for safe display and ensures no accidental key patterns leak.
   * @param {unknown} value
   * @param {string} [fallback]
   * @returns {string}
   */
  function sanitizeLabel(value, fallback) {
    if (typeof value !== 'string') return fallback || '';
    const trimmed = value.trim();
    if (!trimmed) return fallback || '';
    // Redact any accidental Google/Gemini-style API key token if ever passed in metadata
    return trimmed.replace(/AIza[0-9A-Za-z_-]{16,}/g, '[gizli]').slice(0, 80);
  }

  /**
   * Checks key presence strictly via public boolean API — never reads any key value.
   * @returns {boolean}
   */
  function queryHasKey() {
    try {
      return Boolean(
        window.SEYYAH_AI &&
        typeof window.SEYYAH_AI.hasKey === 'function' &&
        window.SEYYAH_AI.hasKey()
      );
    } catch (_) {
      return false;
    }
  }

  /**
   * Reads initial model/telemetry metadata without touching any secret key.
   */
  function syncFromGlobalAi() {
    _state.hasKey = queryHasKey();

    const ai = window.SEYYAH_AI;
    if (ai && typeof ai === 'object') {
      try {
        const m =
          (typeof ai.getActiveModel === 'function' && ai.getActiveModel()) ||
          (typeof ai.getModel === 'function' && ai.getModel()) ||
          ai.activeModel ||
          ai.model;
        if (typeof m === 'string' && m.trim()) {
          _state.activeModel = sanitizeLabel(m, _state.activeModel);
        }
      } catch (_) {
        // Ignore non-critical getter errors
      }

      let snap = null;
      try {
        if (typeof ai.getTelemetry === 'function') snap = ai.getTelemetry();
        else if (typeof ai.getStats === 'function') snap = ai.getStats();
        else if (ai.telemetry && typeof ai.telemetry === 'object') snap = ai.telemetry;
        else if (ai.stats && typeof ai.stats === 'object') snap = ai.stats;
      } catch (_) {
        snap = null;
      }

      if (snap && typeof snap === 'object') {
        applyTelemetryPayload(snap, true);
      }
    }

    if (!_state.activeModel || _state.activeModel === DEFAULT_MODEL) {
      try {
        const storedModel = localStorage.getItem(MODEL_STORAGE_KEY);
        if (storedModel && storedModel.trim()) {
          _state.activeModel = sanitizeLabel(storedModel, DEFAULT_MODEL);
        }
      } catch (_) {
        // Ignore storage errors
      }
    }
  }

  /**
   * Parses finite non-negative integer from candidate properties.
   * @param {object} obj
   * @param {string[]} keys
   * @returns {number|null}
   */
  function pickNumber(obj, keys) {
    for (let i = 0; i < keys.length; i += 1) {
      const raw = obj[keys[i]];
      if (raw !== undefined && raw !== null && raw !== '') {
        const num = Number(raw);
        if (Number.isFinite(num) && num >= 0) {
          return Math.round(num);
        }
      }
    }
    return null;
  }

  /**
   * Merges a telemetry snapshot or incremental event detail into internal state.
   * @param {object} detail
   * @param {boolean} [isSnapshotOnly]
   */
  function applyTelemetryPayload(detail, isSnapshotOnly) {
    if (!detail || typeof detail !== 'object') return;

    if (typeof detail.hasKey === 'boolean') {
      _state.hasKey = queryHasKey() || detail.hasKey;
    } else {
      _state.hasKey = queryHasKey();
    }

    const modelCandidate = detail.activeModel || detail.lastModel || detail.model || detail.modelName;
    if (typeof modelCandidate === 'string' && modelCandidate.trim()) {
      _state.activeModel = sanitizeLabel(modelCandidate, _state.activeModel);
    }

    if (typeof detail.source === 'string' && detail.source.trim()) {
      _state.lastSource = sanitizeLabel(detail.source, '');
    }

    const statusRaw = typeof detail.status === 'string'
      ? detail.status.toLowerCase()
      : (typeof detail.phase === 'string' ? detail.phase.toLowerCase() : '');

    const isStartEvent = statusRaw === 'start' || statusRaw === 'loading' || statusRaw === 'pending' || detail.loading === true;
    _state.inFlight = Boolean(isStartEvent);

    if (statusRaw === 'error' || detail.ok === false || Boolean(detail.error)) {
      _state.lastStatus = 'error';
    } else if (detail.cacheHit === true || detail.cached === true || detail.fromCache === true || statusRaw === 'cached') {
      _state.lastStatus = 'cached';
    } else if (isStartEvent) {
      _state.lastStatus = 'active';
    } else if (statusRaw === 'success' || statusRaw === 'done' || statusRaw === 'ok' || detail.ok === true || !isSnapshotOnly) {
      _state.lastStatus = 'ready';
    }

    const explicitCalls = pickNumber(detail, ['callCount', 'calls', 'totalCalls', 'requests', 'requestCount']);
    const explicitHits = pickNumber(detail, ['cacheHits', 'cacheHitCount', 'hits']);
    const latency = pickNumber(detail, ['lastLatencyMs', 'latencyMs', 'latency', 'durationMs', 'elapsedMs']);

    if (explicitCalls !== null) {
      _state.callCount = explicitCalls;
    } else if (!isSnapshotOnly && !isStartEvent) {
      const looksLikeCompletedCall =
        latency !== null ||
        detail.cacheHit === true ||
        detail.cached === true ||
        detail.fromCache === true ||
        statusRaw === 'success' ||
        statusRaw === 'done' ||
        statusRaw === 'cached' ||
        statusRaw === 'error' ||
        detail.type === 'call';
      if (looksLikeCompletedCall) {
        _state.callCount += 1;
      }
    }

    if (explicitHits !== null) {
      _state.cacheHits = explicitHits;
    } else if (!isSnapshotOnly && (detail.cacheHit === true || detail.cached === true || detail.fromCache === true)) {
      _state.cacheHits += 1;
    }

    if (latency !== null) {
      if (isSnapshotOnly && _state.callCount === 0 && latency === 0) {
        _state.lastLatencyMs = null;
      } else {
        _state.lastLatencyMs = latency;
      }
    }
  }

  /**
   * Injects scoped CSS into document.head once.
   */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes seyyahAiHudPulse {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.38);
        }
        50% {
          box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
        }
      }

      #${WRAP_ID} {
        position: relative;
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }

      /* Invisible hover bridge so moving pointer from pill to popover stays open */
      #${WRAP_ID}::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 100%;
        height: 12px;
        display: none;
      }

      #${WRAP_ID}:hover::after,
      #${WRAP_ID}:focus-within::after {
        display: block;
      }

      #${PILL_ID} {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 6px 12px;
        height: 36px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(30, 41, 59, 0.72);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        line-height: 1;
        white-space: nowrap;
        flex-shrink: 0;
        cursor: pointer;
        transition: border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease, transform 0.18s ease;
      }

      #${PILL_ID}:hover,
      #${PILL_ID}:focus-visible {
        border-color: var(--border-glow, rgba(0, 242, 254, 0.42));
        background: rgba(30, 41, 59, 0.92);
        box-shadow: 0 0 18px rgba(0, 242, 254, 0.22);
        transform: translateY(-1px);
        outline: none;
      }

      #${PILL_ID}.has-key {
        border-color: rgba(16, 185, 129, 0.38);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(15, 23, 42, 0.78));
      }

      #${PILL_ID}.has-key:hover,
      #${PILL_ID}.has-key:focus-visible {
        border-color: rgba(16, 185, 129, 0.65);
        box-shadow: 0 0 18px rgba(16, 185, 129, 0.26);
      }

      #${PILL_ID}.no-key {
        border-color: rgba(0, 242, 254, 0.28);
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.1), rgba(79, 172, 254, 0.1));
      }

      #${PILL_ID}.is-pulsing,
      #${PILL_ID}.is-in-flight {
        animation: seyyahAiHudPulse 1.3s ease-in-out infinite;
      }

      .seyyah-ai-hud-icon {
        font-size: 0.78rem;
        line-height: 1;
        display: inline-flex;
        align-items: center;
      }

      .seyyah-ai-hud-label {
        font-size: 0.78rem;
        font-weight: 700;
        line-height: 1;
      }

      /* Crisp Glass Hover Popover */
      #${POPOVER_ID} {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 280px;
        padding: 13px 14px;
        border-radius: var(--radius-lg, 18px);
        background: rgba(15, 23, 42, 0.96);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 242, 254, 0.28);
        box-shadow: 0 22px 54px rgba(0, 0, 0, 0.72), 0 0 24px rgba(0, 242, 254, 0.14);
        color: var(--text-primary, #f8fafc);
        z-index: 2300;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-6px) scale(0.98);
        pointer-events: none;
        transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
      }

      #${WRAP_ID}:hover #${POPOVER_ID},
      #${WRAP_ID}:focus-within #${POPOVER_ID} {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .seyyah-ai-pop-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-bottom: 9px;
        margin-bottom: 9px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .seyyah-ai-pop-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      .seyyah-ai-pop-badge {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.28);
        color: var(--accent-cyan, #00f2fe);
        white-space: nowrap;
      }

      .seyyah-ai-pop-badge.is-live {
        background: rgba(16, 185, 129, 0.16);
        border-color: rgba(16, 185, 129, 0.42);
        color: #34d399;
      }

      .seyyah-ai-pop-badge.is-error {
        background: rgba(239, 68, 68, 0.16);
        border-color: rgba(239, 68, 68, 0.4);
        color: #fca5a5;
      }

      .seyyah-ai-pop-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 7px;
      }

      .seyyah-ai-pop-stat {
        padding: 7px 9px;
        border-radius: var(--radius-sm, 8px);
        background: rgba(30, 41, 59, 0.62);
        border: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .seyyah-ai-pop-stat.is-wide {
        grid-column: 1 / -1;
      }

      .seyyah-ai-pop-k {
        font-size: 0.67rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary, #94a3b8);
      }

      .seyyah-ai-pop-v {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .seyyah-ai-pop-v.is-mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 0.74rem;
        color: var(--accent-cyan, #00f2fe);
      }

      .seyyah-ai-pop-foot {
        margin-top: 9px;
        padding-top: 8px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.71rem;
        color: var(--text-secondary, #94a3b8);
      }

      .seyyah-ai-pop-cta {
        color: var(--accent-cyan, #00f2fe);
        font-weight: 700;
      }

      /* Light Theme Support */
      body.light-theme #${PILL_ID} {
        background: rgba(241, 245, 249, 0.92);
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      body.light-theme #${PILL_ID}:hover,
      body.light-theme #${PILL_ID}:focus-visible {
        background: #ffffff;
        border-color: rgba(2, 132, 199, 0.45);
        box-shadow: 0 6px 18px rgba(2, 132, 199, 0.16);
      }

      body.light-theme #${PILL_ID}.has-key {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(255, 255, 255, 0.94));
        border-color: rgba(5, 150, 105, 0.4);
      }

      body.light-theme #${PILL_ID}.no-key {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.1), rgba(248, 250, 252, 0.95));
        border-color: rgba(2, 132, 199, 0.28);
      }

      body.light-theme #${POPOVER_ID} {
        background: rgba(255, 255, 255, 0.97);
        border-color: rgba(2, 132, 199, 0.28);
        box-shadow: 0 20px 48px rgba(15, 23, 42, 0.18);
        color: #0f172a;
      }

      body.light-theme .seyyah-ai-pop-head,
      body.light-theme .seyyah-ai-pop-foot {
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .seyyah-ai-pop-title,
      body.light-theme .seyyah-ai-pop-v {
        color: #0f172a;
      }

      body.light-theme .seyyah-ai-pop-k,
      body.light-theme .seyyah-ai-pop-foot {
        color: #475569;
      }

      body.light-theme .seyyah-ai-pop-stat {
        background: rgba(241, 245, 249, 0.9);
        border-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .seyyah-ai-pop-v.is-mono,
      body.light-theme .seyyah-ai-pop-cta {
        color: #0284c7;
      }

      body.light-theme .seyyah-ai-pop-badge {
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.28);
        color: #0284c7;
      }

      body.light-theme .seyyah-ai-pop-badge.is-live {
        background: rgba(5, 150, 105, 0.12);
        border-color: rgba(5, 150, 105, 0.35);
        color: #047857;
      }

      body.light-theme .seyyah-ai-pop-badge.is-error {
        background: rgba(220, 38, 38, 0.1);
        border-color: rgba(220, 38, 38, 0.3);
        color: #b91c1c;
      }

      /* Mobile & Compact Screen Safeguards — never overflow header */
      @media (max-width: 720px) {
        .seyyah-ai-hud-label {
          display: none;
        }
        #${PILL_ID} {
          padding: 6px 9px;
          min-width: 34px;
          height: 34px;
        }
      }

      @media (max-width: 540px) {
        #${POPOVER_ID} {
          position: fixed;
          top: 62px;
          right: 12px;
          left: auto;
          width: min(286px, calc(100vw - 24px));
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #${PILL_ID},
        #${POPOVER_ID} {
          transition: none !important;
          animation: none !important;
        }
      }

      @media print {
        #${WRAP_ID} {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Builds the pill & hover popover DOM inside `header .header-actions` before `#btn-map`.
   */
  function ensureDom() {
    const headerActions = document.querySelector('header .header-actions');
    if (!headerActions) return null;

    let wrap = document.getElementById(WRAP_ID);
    if (wrap && headerActions.contains(wrap)) {
      return wrap;
    }

    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = WRAP_ID;
      wrap.innerHTML = `
        <button
          type="button"
          id="${PILL_ID}"
          class="no-key"
          aria-label="Yapay Zeka Durumu ve Telemetri"
          aria-describedby="${POPOVER_ID}"
        >
          <span class="seyyah-ai-hud-icon" data-hud-icon aria-hidden="true">✨</span>
          <span class="seyyah-ai-hud-label">AI</span>
        </button>
        <div id="${POPOVER_ID}" role="status" aria-live="polite">
          <div class="seyyah-ai-pop-head">
            <span class="seyyah-ai-pop-title">
              <span data-hud-pop-icon aria-hidden="true">✨</span>
              <span>Seyyah AI Telemetri</span>
            </span>
            <span class="seyyah-ai-pop-badge" data-hud-badge>Hazır</span>
          </div>
          <div class="seyyah-ai-pop-grid">
            <div class="seyyah-ai-pop-stat is-wide">
              <span class="seyyah-ai-pop-k">Aktif Model</span>
              <span class="seyyah-ai-pop-v is-mono" data-hud-model>gemini-flash-lite-latest</span>
            </div>
            <div class="seyyah-ai-pop-stat">
              <span class="seyyah-ai-pop-k">Çağrı Sayısı</span>
              <span class="seyyah-ai-pop-v" data-hud-calls>0</span>
            </div>
            <div class="seyyah-ai-pop-stat">
              <span class="seyyah-ai-pop-k">Önbellek İsabeti</span>
              <span class="seyyah-ai-pop-v" data-hud-cache>0</span>
            </div>
            <div class="seyyah-ai-pop-stat is-wide">
              <span class="seyyah-ai-pop-k">Son Gecikme</span>
              <span class="seyyah-ai-pop-v" data-hud-latency>—</span>
            </div>
          </div>
          <div class="seyyah-ai-pop-foot">
            <span data-hud-foot-note>Copilot veya Rehber</span>
            <span class="seyyah-ai-pop-cta">Tıkla &amp; Aç ➔</span>
          </div>
        </div>
      `;
    }

    const btnMap = headerActions.querySelector('#btn-map');
    if (btnMap && btnMap.parentElement === headerActions) {
      headerActions.insertBefore(wrap, btnMap);
    } else if (headerActions.firstChild) {
      headerActions.insertBefore(wrap, headerActions.firstChild);
    } else {
      headerActions.appendChild(wrap);
    }

    const pillBtn = wrap.querySelector(`#${PILL_ID}`);
    if (pillBtn && !pillBtn.dataset.hudClickBound) {
      pillBtn.dataset.hudClickBound = '1';
      pillBtn.addEventListener('click', handlePillClick);
      pillBtn.addEventListener('mouseenter', handleHoverRefresh);
      pillBtn.addEventListener('focus', handleHoverRefresh);
    }

    return wrap;
  }

  /**
   * Renders current AI & telemetry state into the pill and popover via textContent.
   */
  function renderState() {
    const wrap = ensureDom();
    if (!wrap) return;

    const pill = wrap.querySelector(`#${PILL_ID}`);
    const iconEl = wrap.querySelector('[data-hud-icon]');
    const popIconEl = wrap.querySelector('[data-hud-pop-icon]');
    const badgeEl = wrap.querySelector('[data-hud-badge]');
    const modelEl = wrap.querySelector('[data-hud-model]');
    const callsEl = wrap.querySelector('[data-hud-calls]');
    const cacheEl = wrap.querySelector('[data-hud-cache]');
    const latencyEl = wrap.querySelector('[data-hud-latency]');
    const footNoteEl = wrap.querySelector('[data-hud-foot-note]');

    const hasKey = Boolean(_state.hasKey);
    const iconChar = hasKey ? '🟢' : '✨';

    if (pill) {
      pill.classList.toggle('has-key', hasKey);
      pill.classList.toggle('no-key', !hasKey);
      pill.classList.toggle('is-in-flight', _state.inFlight);
      pill.setAttribute(
        'aria-label',
        hasKey
          ? `Yapay Zeka Aktif (${_state.activeModel}) — Copilot'u aç`
          : `Yapay Zeka Durumu (Anahtar yok) — Copilot'u aç`
      );
    }

    if (iconEl) iconEl.textContent = iconChar;
    if (popIconEl) popIconEl.textContent = iconChar;

    if (badgeEl) {
      badgeEl.classList.remove('is-live', 'is-error');
      if (_state.inFlight) {
        badgeEl.textContent = 'Çalışıyor…';
        badgeEl.classList.add('is-live');
      } else if (_state.lastStatus === 'error') {
        badgeEl.textContent = 'Hata';
        badgeEl.classList.add('is-error');
      } else if (hasKey) {
        badgeEl.textContent = 'Anahtar Bağlı';
        badgeEl.classList.add('is-live');
      } else {
        badgeEl.textContent = 'Yerel / Hazır';
      }
    }

    if (modelEl) {
      modelEl.textContent = _state.activeModel || DEFAULT_MODEL;
    }
    if (callsEl) {
      callsEl.textContent = String(_state.callCount);
    }
    if (cacheEl) {
      const hitRate =
        _state.callCount > 0 && _state.cacheHits > 0
          ? ` (%${Math.min(100, Math.round((_state.cacheHits / _state.callCount) * 100))})`
          : '';
      cacheEl.textContent = `${_state.cacheHits}${hitRate}`;
    }
    if (latencyEl) {
      if (_state.lastLatencyMs === null) {
        latencyEl.textContent = '—';
      } else if (_state.lastStatus === 'cached') {
        latencyEl.textContent = `${_state.lastLatencyMs} ms (Önbellek)`;
      } else {
        latencyEl.textContent = `${_state.lastLatencyMs} ms`;
      }
    }
    if (footNoteEl) {
      footNoteEl.textContent = _state.lastSource
        ? `Son kaynak: ${_state.lastSource}`
        : (hasKey ? 'Canlı Gemini AI' : 'Seyyah AI Rehberi');
    }
  }

  /**
   * Brief visual pulse when a telemetry update arrives.
   */
  function triggerPulse() {
    const pill = document.getElementById(PILL_ID);
    if (!pill) return;
    pill.classList.add('is-pulsing');
    if (_pulseTimer) clearTimeout(_pulseTimer);
    _pulseTimer = setTimeout(() => {
      pill.classList.remove('is-pulsing');
    }, 1100);
  }

  /**
   * Opens Floating AI Copilot if available, otherwise navigates to 'advisor'.
   */
  function handlePillClick() {
    const mods = window.SEYYAH_MODULES || {};
    const copilot = mods.floatingCopilot;
    if (copilot && typeof copilot.toggle === 'function') {
      copilot.toggle();
      return;
    }
    if (copilot && typeof copilot.open === 'function') {
      copilot.open();
      return;
    }
    if (_ctx && typeof _ctx.openView === 'function') {
      _ctx.openView('advisor');
    }
  }

  function handleHoverRefresh() {
    syncFromGlobalAi();
    renderState();
  }

  /**
   * Handles live `seyyah:ai-telemetry` events dispatched on window or document.
   * @param {CustomEvent} event
   */
  function handleTelemetryEvent(event) {
    if (_seenEvents && event && typeof event === 'object') {
      if (_seenEvents.has(event)) return;
      _seenEvents.add(event);
    }

    const detail = event && event.detail && typeof event.detail === 'object'
      ? event.detail
      : null;

    if (detail) {
      applyTelemetryPayload(detail, false);
    } else {
      syncFromGlobalAi();
    }

    renderState();
    triggerPulse();
  }

  function bindGlobalListeners() {
    if (_listenersBound) return;
    _listenersBound = true;

    window.addEventListener('seyyah:ai-telemetry', handleTelemetryEvent);
    document.addEventListener('seyyah:ai-telemetry', handleTelemetryEvent);

    // Refresh key/model status when window regains focus or storage changes (never reads key value)
    window.addEventListener('focus', handleHoverRefresh);
    window.addEventListener('storage', handleHoverRefresh);
  }

  /**
   * Module entry point called by app.js.
   * @param {object} [ctx]
   */
  function init(ctx) {
    _ctx = ctx || _ctx || {};

    const mount = () => {
      injectStyles();
      syncFromGlobalAi();
      ensureDom();
      renderState();
      bindGlobalListeners();
      _initialized = true;
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount, { once: true });
    } else {
      mount();
    }
  }

  window.SEYYAH_MODULES.aiHud = {
    init,
    refresh: () => {
      if (!_initialized) return init(_ctx);
      handleHoverRefresh();
    }
  };
})();
