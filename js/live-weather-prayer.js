/* ==========================================================================
   Dijital Seyyah — Live Anatolia Weather & Horizon Telemetry Enhancer
   File: js/live-weather-prayer.js
   Registers on: window.SEYYAH_MODULES.liveWeather = { init(ctx) }
   Features:
     1. Zero-API-key Open-Meteo live forecast & daily sunrise/sunset telemetry
     2. 15-minute in-memory Map cache per city key + in-flight request dedupe
     3. WMO weather code mapping to Turkish labels & emojis
     4. MutationObserver on #viewport-content to inject .live-weather-pill
        inside active city detail views (.city-detail-view)
     5. Offline-safe (fails silently & cleanly) and light-theme compatible
   ========================================================================== */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-live-weather-styles';
  const PILL_CLASS = 'live-weather-pill';
  const CACHE_TTL_MS = 15 * 60 * 1000;
  const FETCH_TIMEOUT_MS = 8000;

  /** @type {Map<string, { data: object, expiresAt: number }>} */
  const weatherCache = new Map();
  /** @type {Map<string, Promise<object|null>>} */
  const inFlightRequests = new Map();

  let initialized = false;
  let activeCtx = null;
  let viewportObserver = null;

  /**
   * Maps Open-Meteo WMO weather codes (0-99) to Turkish labels and emojis.
   * @param {number} code
   * @returns {{ emoji: string, label: string }}
   */
  function mapWmoWeather(code) {
    const n = Number(code);
    if (!Number.isFinite(n)) {
      return { emoji: '⛅', label: 'Parçalı Bulutlu' };
    }
    if (n === 0) {
      return { emoji: '☀️', label: 'Açık' };
    }
    if (n === 1 || n === 2 || n === 3) {
      return { emoji: '⛅', label: 'Parçalı Bulutlu' };
    }
    if (n === 45 || n === 48) {
      return { emoji: '🌫️', label: 'Sisli' };
    }
    if (
      (n >= 51 && n <= 67) ||
      (n >= 80 && n <= 82)
    ) {
      return { emoji: '🌧️', label: 'Yağmurlu' };
    }
    if (
      (n >= 71 && n <= 77) ||
      n === 85 ||
      n === 86
    ) {
      return { emoji: '❄️', label: 'Karlı' };
    }
    if (n >= 95 && n <= 99) {
      return { emoji: '⛈️', label: 'Fırtınalı' };
    }
    return { emoji: '⛅', label: 'Parçalı Bulutlu' };
  }

  /**
   * Extracts HH:MM from an Open-Meteo ISO local timestamp string.
   * @param {unknown} isoStr
   * @returns {string}
   */
  function formatClockTime(isoStr) {
    if (typeof isoStr !== 'string') return '--:--';
    const match = isoStr.match(/T(\d{2}:\d{2})/);
    return match ? match[1] : '--:--';
  }

  /**
   * Formats temperature cleanly (drops trailing .0).
   * @param {unknown} value
   * @returns {string}
   */
  function formatTemp(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return '--';
    const rounded = Math.round(num * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }

  /**
   * Injects scoped CSS once into document.head.
   */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes liveWeatherFadeIn {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes liveWeatherPulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.45;
          transform: scale(0.82);
        }
      }

      .${PILL_CLASS} {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px 18px;
        padding: 12px 20px;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.35));
        color: var(--text-primary, #f8fafc);
        font-size: 0.86rem;
        line-height: 1.4;
        transition: border-color 0.25s ease, box-shadow 0.25s ease;
        animation: liveWeatherFadeIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .${PILL_CLASS}:hover {
        border-color: var(--border-glow, rgba(0, 242, 254, 0.35));
        box-shadow: var(--shadow-glow, 0 0 25px rgba(0, 242, 254, 0.2));
      }

      .${PILL_CLASS}-main {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
      }

      .${PILL_CLASS}-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent-emerald, #10b981);
        box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
        flex-shrink: 0;
        animation: liveWeatherPulse 2.4s ease-in-out infinite;
      }

      .${PILL_CLASS}-emoji {
        font-size: 1.15rem;
        line-height: 1;
      }

      .${PILL_CLASS}-temp {
        font-family: var(--font-heading, sans-serif);
        font-weight: 800;
        font-size: 1.02rem;
        color: var(--accent-cyan, #00f2fe);
        letter-spacing: -0.01em;
      }

      .${PILL_CLASS}-label {
        font-weight: 600;
        color: var(--text-primary, #f8fafc);
      }

      .${PILL_CLASS}-metrics {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 14px;
        color: var(--text-secondary, #94a3b8);
        font-size: 0.82rem;
        font-weight: 500;
      }

      .${PILL_CLASS}-metric {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
      }

      .${PILL_CLASS}-sep {
        width: 1px;
        height: 13px;
        background: var(--border-glass, rgba(255, 255, 255, 0.14));
      }

      body.light-theme .${PILL_CLASS} {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 8px 24px -6px rgba(15, 23, 42, 0.1);
        color: #0f172a;
      }

      body.light-theme .${PILL_CLASS}:hover {
        border-color: rgba(2, 132, 199, 0.35);
        box-shadow: 0 8px 25px rgba(2, 132, 199, 0.15);
      }

      body.light-theme .${PILL_CLASS}-temp {
        color: #0284c7;
      }

      body.light-theme .${PILL_CLASS}-label {
        color: #0f172a;
      }

      body.light-theme .${PILL_CLASS}-metrics {
        color: #334155;
      }

      body.light-theme .${PILL_CLASS}-sep {
        background: rgba(15, 23, 42, 0.15);
      }

      @media (max-width: 640px) {
        .${PILL_CLASS} {
          border-radius: var(--radius-md, 12px);
          padding: 11px 14px;
          gap: 8px 12px;
        }
        .${PILL_CLASS}-sep {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .${PILL_CLASS},
        .${PILL_CLASS}-dot {
          animation: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Fetches Open-Meteo weather & sunrise/sunset telemetry with a 15-min cache.
   * Fails silently (returns null) if offline or on any network/API error.
   * @param {string} cityKey
   * @param {number} lat
   * @param {number} lng
   * @returns {Promise<object|null>}
   */
  async function getCityTelemetry(cityKey, lat, lng) {
    const now = Date.now();
    const cached = weatherCache.get(cityKey);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return null;
    }

    if (typeof fetch !== 'function') {
      return null;
    }

    if (inFlightRequests.has(cityKey)) {
      return inFlightRequests.get(cityKey);
    }

    const reqPromise = (async () => {
      let timerId = null;
      try {
        const url =
          'https://api.open-meteo.com/v1/forecast' +
          `?latitude=${encodeURIComponent(lat)}` +
          `&longitude=${encodeURIComponent(lng)}` +
          '&current_weather=true' +
          '&daily=sunrise,sunset' +
          '&timezone=Europe%2FIstanbul';

        const fetchOptions = { method: 'GET' };
        let controller = null;
        if (typeof AbortController === 'function') {
          controller = new AbortController();
          fetchOptions.signal = controller.signal;
          timerId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        }

        const res = await fetch(url, fetchOptions);
        if (!res || !res.ok) return null;

        const payload = await res.json();
        if (!payload || !payload.current_weather) return null;

        const cw = payload.current_weather;
        const daily = payload.daily || {};
        const sunriseRaw = Array.isArray(daily.sunrise) ? daily.sunrise[0] : null;
        const sunsetRaw = Array.isArray(daily.sunset) ? daily.sunset[0] : null;

        const weather = mapWmoWeather(cw.weathercode);
        const windNum = Number(cw.windspeed);

        const telemetry = {
          tempText: `${formatTemp(cw.temperature)}°C`,
          emoji: weather.emoji,
          label: weather.label,
          windText: Number.isFinite(windNum) ? `${Math.round(windNum)} km/h` : '-- km/h',
          sunriseText: formatClockTime(sunriseRaw),
          sunsetText: formatClockTime(sunsetRaw)
        };

        weatherCache.set(cityKey, {
          data: telemetry,
          expiresAt: Date.now() + CACHE_TTL_MS
        });

        return telemetry;
      } catch (_) {
        return null;
      } finally {
        if (timerId !== null) {
          clearTimeout(timerId);
        }
        inFlightRequests.delete(cityKey);
      }
    })();

    inFlightRequests.set(cityKey, reqPromise);
    return reqPromise;
  }

  /**
   * Builds a safe DOM node for the .live-weather-pill element.
   * @param {string} cityKey
   * @param {string} cityName
   * @param {object} telemetry
   * @returns {HTMLDivElement}
   */
  function createWeatherPillElement(cityKey, cityName, telemetry) {
    const pill = document.createElement('div');
    pill.className = PILL_CLASS;
    pill.setAttribute('data-city-key', cityKey);
    pill.setAttribute('role', 'region');
    pill.setAttribute(
      'aria-label',
      `${cityName} canlı hava durumu: ${telemetry.tempText} ${telemetry.label}, rüzgar ${telemetry.windText}, gün doğumu ${telemetry.sunriseText}, gün batımı ${telemetry.sunsetText}`
    );

    const main = document.createElement('div');
    main.className = `${PILL_CLASS}-main`;

    const dot = document.createElement('span');
    dot.className = `${PILL_CLASS}-dot`;
    dot.setAttribute('aria-hidden', 'true');

    const emoji = document.createElement('span');
    emoji.className = `${PILL_CLASS}-emoji`;
    emoji.setAttribute('aria-hidden', 'true');
    emoji.textContent = telemetry.emoji;

    const temp = document.createElement('span');
    temp.className = `${PILL_CLASS}-temp`;
    temp.textContent = telemetry.tempText;

    const label = document.createElement('span');
    label.className = `${PILL_CLASS}-label`;
    label.textContent = telemetry.label;

    main.appendChild(dot);
    main.appendChild(emoji);
    main.appendChild(temp);
    main.appendChild(label);

    const metrics = document.createElement('div');
    metrics.className = `${PILL_CLASS}-metrics`;

    const windEl = document.createElement('span');
    windEl.className = `${PILL_CLASS}-metric`;
    windEl.title = 'Rüzgar Hızı';
    windEl.textContent = `💨 ${telemetry.windText}`;

    const sep1 = document.createElement('span');
    sep1.className = `${PILL_CLASS}-sep`;
    sep1.setAttribute('aria-hidden', 'true');

    const sunriseEl = document.createElement('span');
    sunriseEl.className = `${PILL_CLASS}-metric`;
    sunriseEl.title = 'Gün Doğumu (İstanbul Saati)';
    sunriseEl.textContent = `🌅 ${telemetry.sunriseText}`;

    const sep2 = document.createElement('span');
    sep2.className = `${PILL_CLASS}-sep`;
    sep2.setAttribute('aria-hidden', 'true');

    const sunsetEl = document.createElement('span');
    sunsetEl.className = `${PILL_CLASS}-metric`;
    sunsetEl.title = 'Gün Batımı (İstanbul Saati)';
    sunsetEl.textContent = `🌇 ${telemetry.sunsetText}`;

    metrics.appendChild(windEl);
    metrics.appendChild(sep1);
    metrics.appendChild(sunriseEl);
    metrics.appendChild(sep2);
    metrics.appendChild(sunsetEl);

    pill.appendChild(main);
    pill.appendChild(metrics);

    return pill;
  }

  /**
   * Checks active city detail view and injects .live-weather-pill when ready.
   */
  async function syncCityWeatherPill() {
    if (!activeCtx || !activeCtx.state) return;

    const state = activeCtx.state;
    if (state.currentView !== 'city' || !state.selectedCityKey) return;

    const cityKey = state.selectedCityKey;
    const viewport = document.getElementById('viewport-content');
    if (!viewport) return;

    const detailView = viewport.querySelector('.city-detail-view');
    if (!detailView) return;

    const existing = detailView.querySelector(`.${PILL_CLASS}`);
    if (existing && existing.getAttribute('data-city-key') === cityKey) {
      return;
    }

    const province =
      state.data &&
      state.data.provinces &&
      state.data.provinces[cityKey];
    if (!province) return;

    const lat = Number(province.lat);
    const lng = Number(province.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const telemetry = await getCityTelemetry(cityKey, lat, lng);
    if (!telemetry) return;

    // Guard against view/city switches while the async request was in flight
    if (
      !activeCtx ||
      !activeCtx.state ||
      activeCtx.state.currentView !== 'city' ||
      activeCtx.state.selectedCityKey !== cityKey
    ) {
      return;
    }

    const currentViewport = document.getElementById('viewport-content');
    const currentDetailView = currentViewport && currentViewport.querySelector('.city-detail-view');
    if (!currentDetailView) return;

    // Remove any stale pill before inserting
    const stalePills = currentDetailView.querySelectorAll(`.${PILL_CLASS}`);
    stalePills.forEach((node) => node.remove());

    const pill = createWeatherPillElement(cityKey, province.name || cityKey, telemetry);
    const heroEl = currentDetailView.querySelector('.city-hero');
    if (heroEl && heroEl.parentNode === currentDetailView) {
      heroEl.insertAdjacentElement('afterend', pill);
    } else {
      currentDetailView.insertBefore(pill, currentDetailView.firstChild);
    }
  }

  /**
   * Observes #viewport-content for city detail view renders.
   */
  function initViewportObserver() {
    const viewport = document.getElementById('viewport-content');
    if (!viewport || typeof MutationObserver !== 'function') return;

    if (viewportObserver) {
      viewportObserver.disconnect();
    }

    viewportObserver = new MutationObserver((mutations) => {
      let hasAddedElements = false;
      for (let i = 0; i < mutations.length; i++) {
        const added = mutations[i].addedNodes;
        for (let j = 0; j < added.length; j++) {
          if (added[j].nodeType === 1) {
            hasAddedElements = true;
            break;
          }
        }
        if (hasAddedElements) break;
      }

      if (!hasAddedElements) return;
      syncCityWeatherPill();
    });

    viewportObserver.observe(viewport, { childList: true });
    syncCityWeatherPill();
  }

  /**
   * Initializes the Live Weather & Horizon Telemetry module.
   * @param {object} ctx
   */
  function init(ctx) {
    activeCtx = ctx || activeCtx;
    if (initialized) {
      syncCityWeatherPill();
      return;
    }
    initialized = true;

    injectStyles();
    initViewportObserver();
  }

  window.SEYYAH_MODULES.liveWeather = {
    init: init
  };
})();
