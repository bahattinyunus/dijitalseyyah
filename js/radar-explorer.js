/**
 * Anadolu Seyahatnamesi — Menzil Radarı (Proximity Radar Explorer)
 * "Yakınımdaki İller" + Animasyonlu SVG Radar Tarayıcı
 * Registers on window.SEYYAH_MODULES.radar = { render(container, ctx) }
 */

(function () {
  'use strict';

  const DEFAULT_ORIGIN_KEY = '04_IcAnadolu/Ankara';
  const MIN_RADIUS_KM = 50;
  const MAX_RADIUS_KM = 600;
  const STEP_RADIUS_KM = 25;
  const DEFAULT_RADIUS_KM = 250;
  const ROAD_FACTOR = 1.35;
  const AVG_SPEED_KMH = 80;

  const SVG_SIZE = 420;
  const SVG_CENTER = 210;
  const RADAR_MAX_R = 172;
  const RING_FRACTIONS = [0.25, 0.5, 0.75, 1.0];

  const COMPASS_DIRS = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
  const COMPASS_ARROWS = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
  const COMPASS_NAMES = [
    'Kuzey',
    'Kuzeydoğu',
    'Doğu',
    'Güneydoğu',
    'Güney',
    'Güneybatı',
    'Batı',
    'Kuzeybatı'
  ];

  // Persistent module state across re-renders
  const radarState = {
    originKey: DEFAULT_ORIGIN_KEY,
    radiusKm: DEFAULT_RADIUS_KM,
    filter: 'all', // 'all' | 'visited' | 'unvisited'
    gpsCoords: null, // { lat, lng, nearestKey, nearestName, nearestDistKm }
    gpsLoading: false
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

  function fallbackCalcDistKm(lat1, lon1, lat2, lon2) {
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

  function calcBearingRad(lat1, lon1, lat2, lon2) {
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const dLambda = ((lon2 - lon1) * Math.PI) / 180;
    const y = Math.sin(dLambda) * Math.cos(phi2);
    const x =
      Math.cos(phi1) * Math.sin(phi2) -
      Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
    return (Math.atan2(y, x) + 2 * Math.PI) % (2 * Math.PI);
  }

  function getCompassInfo(bearingRad) {
    const deg = ((bearingRad * 180) / Math.PI + 360) % 360;
    const idx = Math.round(deg / 45) % 8;
    return {
      code: COMPASS_DIRS[idx],
      arrow: COMPASS_ARROWS[idx],
      name: COMPASS_NAMES[idx],
      deg: Math.round(deg)
    };
  }

  function formatKm(num) {
    return Math.round(Number(num) || 0).toLocaleString('tr-TR');
  }

  function formatDriveTime(roadKm) {
    const totalMinutes = Math.max(1, Math.round((roadKm / AVG_SPEED_KMH) * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins} dk`;
    if (mins === 0) return `${hours} sa`;
    return `${hours} sa ${mins} dk`;
  }

  function padPlate(plate) {
    const n = Number(plate);
    if (!Number.isFinite(n)) return '--';
    return n < 10 ? `0${n}` : String(n);
  }

  function ensureStyles() {
    if (typeof document === 'undefined' || !document.head) return;
    if (document.getElementById('seyyah-radar-explorer-styles')) return;

    const style = document.createElement('style');
    style.id = 'seyyah-radar-explorer-styles';
    style.textContent = `
      @keyframes radarSweepSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes radarBeaconPulse {
        0% { opacity: 0.85; r: 6; }
        100% { opacity: 0; r: 22; }
      }
      @keyframes radarBlipFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .radar-explorer {
        display: flex;
        flex-direction: column;
        gap: 18px;
        max-width: 1240px;
        margin: 0 auto;
        animation: modFadeSlideUp 0.35s ease;
      }

      .radar-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-end;
        gap: 12px;
      }
      .radar-header h2 {
        font-family: var(--font-heading);
        font-size: 1.55rem;
        font-weight: 800;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .radar-header p {
        font-size: 0.88rem;
        color: var(--text-secondary);
        margin-top: 4px;
      }
      .radar-gps-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: var(--radius-full);
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.35);
        color: var(--accent-cyan);
        font-size: 0.78rem;
        font-weight: 600;
      }
      .radar-gps-clear {
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 0.85rem;
        padding: 0 2px;
        opacity: 0.8;
      }
      .radar-gps-clear:hover {
        opacity: 1;
      }

      /* Controls Panel */
      .radar-controls {
        padding: 18px 20px;
        display: grid;
        grid-template-columns: minmax(220px, 1.15fr) auto minmax(230px, 1.25fr);
        gap: 16px;
        align-items: end;
      }
      .radar-ctrl-group {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .radar-ctrl-label {
        font-size: 0.74rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-secondary);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      .radar-select {
        width: 100%;
        padding: 10px 14px;
        border-radius: var(--radius-sm);
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid var(--border-glass);
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 0.9rem;
        font-weight: 600;
        outline: none;
        cursor: pointer;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .radar-select:focus,
      .radar-select:hover {
        border-color: var(--accent-cyan);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .radar-gps-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: var(--radius-sm);
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.18), rgba(79, 172, 254, 0.22));
        border: 1px solid rgba(0, 242, 254, 0.45);
        color: var(--text-primary);
        font-family: var(--font-heading);
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.22s ease;
        min-height: 41px;
      }
      .radar-gps-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.3), rgba(79, 172, 254, 0.34));
        box-shadow: 0 0 18px rgba(0, 242, 254, 0.28);
        transform: translateY(-1px);
      }
      .radar-gps-btn:disabled {
        opacity: 0.65;
        cursor: wait;
      }
      .radar-gps-btn.is-active {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.28), rgba(0, 242, 254, 0.28));
        border-color: var(--accent-emerald);
      }

      .radar-radius-readout {
        font-family: var(--font-heading);
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--accent-cyan);
      }
      .radar-radius-sub {
        font-size: 0.72rem;
        color: var(--text-muted);
        font-weight: 500;
        text-transform: none;
        letter-spacing: 0;
      }
      .radar-slider-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .radar-range-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 7px;
        border-radius: var(--radius-full);
        background: linear-gradient(90deg, rgba(0, 242, 254, 0.45), rgba(79, 172, 254, 0.25));
        outline: none;
        cursor: pointer;
      }
      .radar-range-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--accent-cyan);
        border: 3px solid #0a0f1d;
        box-shadow: 0 0 12px rgba(0, 242, 254, 0.75);
        cursor: pointer;
        transition: transform 0.15s ease;
      }
      .radar-range-slider::-webkit-slider-thumb:hover {
        transform: scale(1.14);
      }
      .radar-range-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--accent-cyan);
        border: 3px solid #0a0f1d;
        box-shadow: 0 0 12px rgba(0, 242, 254, 0.75);
        cursor: pointer;
      }
      .radar-range-ticks {
        display: flex;
        justify-content: space-between;
        font-size: 0.68rem;
        color: var(--text-muted);
        margin-top: 2px;
      }

      /* Filter Row */
      .radar-toolbar-row {
        grid-column: 1 / -1;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--border-glass);
      }
      .radar-filter-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .radar-filter-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 14px;
        border-radius: var(--radius-full);
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass);
        color: var(--text-secondary);
        font-family: var(--font-heading);
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .radar-filter-btn:hover {
        border-color: var(--border-glow);
        color: var(--text-primary);
      }
      .radar-filter-btn.active {
        background: rgba(0, 242, 254, 0.16);
        border-color: var(--accent-cyan);
        color: var(--accent-cyan);
        box-shadow: 0 0 14px rgba(0, 242, 254, 0.18);
      }
      .radar-filter-count {
        font-size: 0.72rem;
        padding: 1px 7px;
        border-radius: var(--radius-full);
        background: rgba(255, 255, 255, 0.08);
        color: inherit;
      }

      .radar-preset-group {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .radar-preset-label {
        font-size: 0.72rem;
        color: var(--text-muted);
        margin-right: 2px;
      }
      .radar-preset-chip {
        padding: 4px 10px;
        border-radius: var(--radius-full);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-glass);
        color: var(--text-secondary);
        font-size: 0.72rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }
      .radar-preset-chip:hover,
      .radar-preset-chip.active {
        border-color: var(--accent-cyan);
        color: var(--accent-cyan);
        background: rgba(0, 242, 254, 0.1);
      }

      /* Summary Telemetry Strip */
      .radar-summary-strip {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      .radar-stat-card {
        padding: 12px 15px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .radar-stat-label {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
      }
      .radar-stat-val {
        font-family: var(--font-heading);
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .radar-stat-sub {
        font-size: 0.74rem;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Main 2-Column Workspace */
      .radar-workspace {
        display: grid;
        grid-template-columns: minmax(320px, 460px) 1fr;
        gap: 20px;
        align-items: start;
      }

      /* Radar Scope Panel */
      .radar-scope-card {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: radial-gradient(circle at 50% 45%, rgba(6, 28, 46, 0.94), rgba(8, 15, 30, 0.98));
        border: 1px solid rgba(0, 242, 254, 0.25);
        border-radius: var(--radius-lg);
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.45), inset 0 0 40px rgba(0, 242, 254, 0.06);
        position: sticky;
        top: 12px;
      }
      .radar-scope-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        font-size: 0.74rem;
        color: #94a3b8;
      }
      .radar-live-dot {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #00f2fe;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .radar-live-dot::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #00f2fe;
        box-shadow: 0 0 10px #00f2fe;
      }

      .radar-svg-wrap {
        width: 100%;
        max-width: 420px;
        margin: 0 auto;
        aspect-ratio: 1 / 1;
        position: relative;
      }
      .radar-svg {
        width: 100%;
        height: 100%;
        display: block;
        overflow: visible;
        user-select: none;
      }
      .radar-sweep-group {
        transform-origin: 210px 210px;
        animation: radarSweepSpin 4.8s linear infinite;
        pointer-events: none;
      }
      .radar-beacon-pulse {
        animation: radarBeaconPulse 2.4s cubic-bezier(0.2, 0.6, 0.35, 1) infinite;
        pointer-events: none;
      }
      .radar-blip {
        cursor: pointer;
        outline: none;
        animation: radarBlipFadeIn 0.25s ease;
      }
      .radar-blip-dot {
        transition: r 0.18s ease, stroke-width 0.18s ease, filter 0.18s ease;
      }
      .radar-blip-label {
        font-family: var(--font-body);
        font-size: 9.5px;
        font-weight: 700;
        fill: #e2e8f0;
        paint-order: stroke;
        stroke: rgba(6, 14, 28, 0.92);
        stroke-width: 3px;
        stroke-linejoin: round;
        pointer-events: none;
        transition: fill 0.18s ease, font-size 0.18s ease;
      }
      .radar-blip:hover .radar-blip-dot,
      .radar-blip:focus .radar-blip-dot,
      .radar-blip.is-highlighted .radar-blip-dot {
        r: 8.5;
        stroke: #ffffff;
        stroke-width: 2.2;
      }
      .radar-blip:hover .radar-blip-label,
      .radar-blip:focus .radar-blip-label,
      .radar-blip.is-highlighted .radar-blip-label {
        fill: #00f2fe;
        font-size: 11px;
      }

      .radar-hud-bar {
        min-height: 44px;
        padding: 8px 12px;
        border-radius: var(--radius-sm);
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(0, 242, 254, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        font-size: 0.78rem;
        color: #cbd5e1;
      }
      .radar-hud-title {
        font-family: var(--font-heading);
        font-weight: 700;
        color: #f8fafc;
      }
      .radar-hud-meta {
        color: #00f2fe;
        font-weight: 600;
        white-space: nowrap;
      }

      .radar-legend {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 14px;
        font-size: 0.72rem;
        color: #94a3b8;
      }
      .radar-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .radar-legend-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        display: inline-block;
      }

      /* Discovered Provinces List */
      .radar-list-panel {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .radar-list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding: 0 4px;
      }
      .radar-list-title {
        font-family: var(--font-heading);
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .radar-list-hint {
        font-size: 0.76rem;
        color: var(--text-muted);
      }
      .radar-results-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .radar-city-card {
        display: grid;
        grid-template-columns: 74px 1fr auto;
        gap: 14px;
        align-items: center;
        padding: 11px 14px;
        cursor: pointer;
        text-align: left;
        width: 100%;
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-md);
        background: var(--bg-card);
        backdrop-filter: blur(12px);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .radar-city-card:hover,
      .radar-city-card.is-highlighted {
        border-color: var(--accent-cyan);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 242, 254, 0.16);
      }

      .radar-thumb-wrap {
        width: 74px;
        height: 56px;
        border-radius: var(--radius-sm);
        overflow: hidden;
        position: relative;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.25));
        border: 1px solid rgba(255, 255, 255, 0.12);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .radar-thumb-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .radar-thumb-plate {
        position: absolute;
        bottom: 4px;
        left: 4px;
        padding: 1px 5px;
        border-radius: 4px;
        background: rgba(10, 15, 29, 0.82);
        color: #f8fafc;
        font-family: var(--font-heading);
        font-size: 0.66rem;
        font-weight: 800;
        letter-spacing: 0.03em;
      }

      .radar-city-info {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .radar-city-top {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }
      .radar-city-name {
        font-family: var(--font-heading);
        font-size: 1rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .radar-status-badge {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: var(--radius-full);
        white-space: nowrap;
      }
      .radar-status-badge.visited {
        background: rgba(16, 185, 129, 0.16);
        border: 1px solid rgba(16, 185, 129, 0.42);
        color: #34d399;
      }
      .radar-status-badge.unvisited {
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.38);
        color: #fbbf24;
      }
      .radar-city-region {
        font-size: 0.76rem;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .radar-city-metrics {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }
      .radar-compass-chip {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 44px;
        padding: 5px 7px;
        border-radius: var(--radius-sm);
        background: rgba(0, 242, 254, 0.08);
        border: 1px solid rgba(0, 242, 254, 0.24);
        color: var(--accent-cyan);
      }
      .radar-compass-arrow {
        font-size: 0.92rem;
        line-height: 1;
      }
      .radar-compass-code {
        font-family: var(--font-heading);
        font-size: 0.72rem;
        font-weight: 800;
        margin-top: 2px;
      }
      .radar-dist-col {
        text-align: right;
        min-width: 96px;
      }
      .radar-road-km {
        font-family: var(--font-heading);
        font-size: 0.96rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .radar-drive-time {
        font-size: 0.76rem;
        font-weight: 600;
        color: var(--accent-cyan);
      }
      .radar-air-km {
        font-size: 0.68rem;
        color: var(--text-muted);
      }

      .radar-empty-state {
        padding: 36px 24px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .radar-empty-icon {
        font-size: 2.4rem;
      }
      .radar-empty-title {
        font-family: var(--font-heading);
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .radar-empty-desc {
        font-size: 0.84rem;
        color: var(--text-secondary);
        max-width: 380px;
      }

      /* Light Theme Adjustments */
      body.light-theme .radar-select,
      body.light-theme .radar-filter-btn {
        background: rgba(255, 255, 255, 0.85);
        color: var(--text-primary);
      }
      body.light-theme .radar-status-badge.visited {
        color: #059669;
      }
      body.light-theme .radar-status-badge.unvisited {
        color: #b45309;
      }
      body.light-theme .radar-drive-time,
      body.light-theme .radar-compass-chip {
        color: #0284c7;
      }

      /* Responsive */
      @media (max-width: 980px) {
        .radar-controls {
          grid-template-columns: 1fr 1fr;
        }
        .radar-controls .radar-ctrl-radius {
          grid-column: 1 / -1;
        }
        .radar-workspace {
          grid-template-columns: 1fr;
        }
        .radar-scope-card {
          position: static;
        }
        .radar-summary-strip {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 600px) {
        .radar-controls {
          grid-template-columns: 1fr;
          padding: 14px;
        }
        .radar-city-card {
          grid-template-columns: 60px 1fr;
          gap: 10px;
        }
        .radar-thumb-wrap {
          width: 60px;
          height: 48px;
        }
        .radar-city-metrics {
          grid-column: 1 / -1;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid var(--border-glass);
        }
        .radar-dist-col {
          text-align: right;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function resolveOrigin(provinces) {
    const keys = Object.keys(provinces);
    if (radarState.gpsCoords) {
      return {
        isGps: true,
        key: null,
        name: 'GPS Konumum',
        lat: radarState.gpsCoords.lat,
        lng: radarState.gpsCoords.lng,
        nearestName: radarState.gpsCoords.nearestName,
        nearestDistKm: radarState.gpsCoords.nearestDistKm
      };
    }

    let key = radarState.originKey;
    if (!key || !provinces[key]) {
      key = provinces[DEFAULT_ORIGIN_KEY] ? DEFAULT_ORIGIN_KEY : keys[0];
      radarState.originKey = key;
    }
    const city = provinces[key];
    return {
      isGps: false,
      key: key,
      name: city ? city.name : 'Ankara',
      lat: city ? Number(city.lat) : 39.9334,
      lng: city ? Number(city.lng) : 32.8597
    };
  }

  function computeDiscoveries(provinces, regions, origin, radiusKm, calcDistKm) {
    const allInRange = [];

    Object.entries(provinces).forEach(function (entry) {
      const key = entry[0];
      const city = entry[1];
      if (!city || !Number.isFinite(Number(city.lat)) || !Number.isFinite(Number(city.lng))) {
        return;
      }
      if (!origin.isGps && key === origin.key) {
        return;
      }

      const lat = Number(city.lat);
      const lng = Number(city.lng);
      const distKm = calcDistKm(origin.lat, origin.lng, lat, lng);
      if (distKm > radiusKm) return;

      const bearingRad = calcBearingRad(origin.lat, origin.lng, lat, lng);
      const compass = getCompassInfo(bearingRad);
      const roadKm = Math.round(distKm * ROAD_FACTOR);
      const frac = Math.min(1, distKm / radiusKm);
      const dx = Math.sin(bearingRad) * frac * RADAR_MAX_R;
      const dy = -Math.cos(bearingRad) * frac * RADAR_MAX_R;
      const regionInfo = (regions && regions[city.region_code]) || null;

      allInRange.push({
        key: key,
        city: city,
        distKm: distKm,
        roadKm: roadKm,
        driveTime: formatDriveTime(roadKm),
        bearingRad: bearingRad,
        compass: compass,
        x: SVG_CENTER + dx,
        y: SVG_CENTER + dy,
        visited: Boolean(city.visited),
        regionIcon: regionInfo ? regionInfo.icon : '📍',
        regionName: regionInfo ? regionInfo.name : city.region || ''
      });
    });

    allInRange.sort(function (a, b) {
      return a.distKm - b.distKm;
    });

    const visitedCount = allInRange.filter(function (item) {
      return item.visited;
    }).length;
    const unvisitedCount = allInRange.length - visitedCount;

    return {
      allInRange: allInRange,
      visitedCount: visitedCount,
      unvisitedCount: unvisitedCount
    };
  }

  function buildStaticRadarSvg() {
    // 36 outer tick marks (every 10 degrees)
    let ticksSvg = '';
    for (let deg = 0; deg < 360; deg += 10) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = deg % 30 === 0;
      const rInner = isMajor ? RADAR_MAX_R - 7 : RADAR_MAX_R - 3.5;
      const rOuter = RADAR_MAX_R;
      const x1 = (SVG_CENTER + Math.sin(rad) * rInner).toFixed(2);
      const y1 = (SVG_CENTER - Math.cos(rad) * rInner).toFixed(2);
      const x2 = (SVG_CENTER + Math.sin(rad) * rOuter).toFixed(2);
      const y2 = (SVG_CENTER - Math.cos(rad) * rOuter).toFixed(2);
      ticksSvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(0, 242, 254, ${isMajor ? '0.45' : '0.2'})" stroke-width="${isMajor ? '1.3' : '0.8'}" />`;
    }

    // Sweep wedge path: 55-degree trailing sector behind 0 deg (12 o'clock)
    const sweepAngleDeg = 58;
    const sweepStartRad = (-sweepAngleDeg * Math.PI) / 180;
    const sx = (SVG_CENTER + Math.sin(sweepStartRad) * RADAR_MAX_R).toFixed(2);
    const sy = (SVG_CENTER - Math.cos(sweepStartRad) * RADAR_MAX_R).toFixed(2);
    const ex = SVG_CENTER.toFixed(2);
    const ey = (SVG_CENTER - RADAR_MAX_R).toFixed(2);
    const sweepPath = `M ${SVG_CENTER} ${SVG_CENTER} L ${sx} ${sy} A ${RADAR_MAX_R} ${RADAR_MAX_R} 0 0 1 ${ex} ${ey} Z`;

    // Diagonal crosshairs
    const diagOffset = (RADAR_MAX_R * Math.SQRT1_2).toFixed(2);

    return `
      <svg class="radar-svg" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}" role="img" aria-label="Anadolu Menzil Radarı Tarayıcısı">
        <defs>
          <radialGradient id="radarScopeBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#0a2e42" stop-opacity="0.95" />
            <stop offset="65%" stop-color="#071a2b" stop-opacity="0.98" />
            <stop offset="100%" stop-color="#040d18" stop-opacity="1" />
          </radialGradient>
          <linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#00f2fe" stop-opacity="0" />
            <stop offset="65%" stop-color="#00f2fe" stop-opacity="0.16" />
            <stop offset="100%" stop-color="#00f2fe" stop-opacity="0.46" />
          </linearGradient>
          <filter id="radarCyanGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="radarBlipGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Outer Bezel & Scope Background -->
        <circle cx="${SVG_CENTER}" cy="${SVG_CENTER}" r="${RADAR_MAX_R + 5}" fill="none" stroke="rgba(0, 242, 254, 0.16)" stroke-width="1.5" />
        <circle cx="${SVG_CENTER}" cy="${SVG_CENTER}" r="${RADAR_MAX_R}" fill="url(#radarScopeBg)" stroke="rgba(0, 242, 254, 0.52)" stroke-width="1.8" />

        <!-- Crosshairs & Diagonals -->
        <line x1="${SVG_CENTER}" y1="${SVG_CENTER - RADAR_MAX_R}" x2="${SVG_CENTER}" y2="${SVG_CENTER + RADAR_MAX_R}" stroke="rgba(0, 242, 254, 0.16)" stroke-width="1" stroke-dasharray="3 4" />
        <line x1="${SVG_CENTER - RADAR_MAX_R}" y1="${SVG_CENTER}" x2="${SVG_CENTER + RADAR_MAX_R}" y2="${SVG_CENTER}" stroke="rgba(0, 242, 254, 0.16)" stroke-width="1" stroke-dasharray="3 4" />
        <line x1="${SVG_CENTER - Number(diagOffset)}" y1="${SVG_CENTER - Number(diagOffset)}" x2="${SVG_CENTER + Number(diagOffset)}" y2="${SVG_CENTER + Number(diagOffset)}" stroke="rgba(0, 242, 254, 0.08)" stroke-width="1" />
        <line x1="${SVG_CENTER + Number(diagOffset)}" y1="${SVG_CENTER - Number(diagOffset)}" x2="${SVG_CENTER - Number(diagOffset)}" y2="${SVG_CENTER + Number(diagOffset)}" stroke="rgba(0, 242, 254, 0.08)" stroke-width="1" />

        <!-- Degree Ticks -->
        <g class="radar-ticks-layer">${ticksSvg}</g>

        <!-- Concentric Distance Rings (Dynamic Labels) -->
        <g class="radar-rings-layer"></g>

        <!-- Cardinal Compass Labels -->
        <text x="${SVG_CENTER}" y="${SVG_CENTER - RADAR_MAX_R - 14}" text-anchor="middle" fill="#00f2fe" font-size="12" font-weight="800" font-family="var(--font-heading)">K</text>
        <text x="${SVG_CENTER + RADAR_MAX_R + 18}" y="${SVG_CENTER + 4}" text-anchor="middle" fill="#94a3b8" font-size="11.5" font-weight="700" font-family="var(--font-heading)">D</text>
        <text x="${SVG_CENTER}" y="${SVG_CENTER + RADAR_MAX_R + 22}" text-anchor="middle" fill="#94a3b8" font-size="11.5" font-weight="700" font-family="var(--font-heading)">G</text>
        <text x="${SVG_CENTER - RADAR_MAX_R - 18}" y="${SVG_CENTER + 4}" text-anchor="middle" fill="#94a3b8" font-size="11.5" font-weight="700" font-family="var(--font-heading)">B</text>

        <!-- Animated Rotating Cyan Sweep Beam -->
        <g class="radar-sweep-group">
          <path d="${sweepPath}" fill="url(#radarSweepGrad)" />
          <line x1="${SVG_CENTER}" y1="${SVG_CENTER}" x2="${SVG_CENTER}" y2="${SVG_CENTER - RADAR_MAX_R}" stroke="#00f2fe" stroke-width="2.2" filter="url(#radarCyanGlow)" />
        </g>

        <!-- Dynamic Province Blips Layer -->
        <g class="radar-blips-layer"></g>

        <!-- Origin Beacon at Center -->
        <g class="radar-origin-beacon">
          <circle class="radar-beacon-pulse" cx="${SVG_CENTER}" cy="${SVG_CENTER}" r="6" fill="none" stroke="#00f2fe" stroke-width="1.6" />
          <circle cx="${SVG_CENTER}" cy="${SVG_CENTER}" r="7.5" fill="rgba(0, 242, 254, 0.25)" stroke="#00f2fe" stroke-width="1.5" />
          <circle cx="${SVG_CENTER}" cy="${SVG_CENTER}" r="3.5" fill="#ffffff" filter="url(#radarCyanGlow)" />
          <text class="radar-origin-label" x="${SVG_CENTER}" y="${SVG_CENTER + 19}" text-anchor="middle" fill="#00f2fe" font-size="10" font-weight="800" stroke="rgba(4, 13, 24, 0.9)" stroke-width="3" paint-order="stroke"></text>
        </g>
      </svg>
    `;
  }

  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const data = safeCtx.data || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const state = safeCtx.state || null;
    const escapeHtml =
      typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const calcDistKm =
      typeof safeCtx.calcDistKm === 'function' ? safeCtx.calcDistKm : fallbackCalcDistKm;
    const selectCity =
      typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};
    const showToast =
      typeof safeCtx.showToast === 'function' ? safeCtx.showToast : function () {};

    if (!data || !data.provinces || Object.keys(data.provinces).length === 0) {
      container.innerHTML = `
        <div class="glass-card radar-empty-state">
          <div class="radar-empty-icon">📡</div>
          <div class="radar-empty-title">Radar Verisi Yüklenemedi</div>
          <div class="radar-empty-desc">İl koordinat verileri henüz hazır değil.</div>
        </div>
      `;
      return;
    }

    // Sync initial persisted preferences from app state if available
    if (state) {
      if (state.radarOriginKey && data.provinces[state.radarOriginKey]) {
        radarState.originKey = state.radarOriginKey;
      }
      if (Number.isFinite(Number(state.radarRadiusKm))) {
        radarState.radiusKm = Math.max(
          MIN_RADIUS_KM,
          Math.min(MAX_RADIUS_KM, Number(state.radarRadiusKm))
        );
      }
      if (state.radarFilter) {
        radarState.filter = state.radarFilter;
      }
    }

    const provinces = data.provinces;
    const regions = data.regions || {};

    // Sort all 81 provinces alphabetically in Turkish for dropdown
    const sortedProvinces = Object.entries(provinces).sort(function (a, b) {
      return a[1].name.localeCompare(b[1].name, 'tr');
    });

    const origin = resolveOrigin(provinces);

    const optionsHtml = sortedProvinces
      .map(function (entry) {
        const key = entry[0];
        const city = entry[1];
        const selected = !origin.isGps && key === origin.key ? 'selected' : '';
        const statusMark = city.visited ? '✅' : '⏳';
        return `<option value="${escapeHtml(key)}" ${selected}>${padPlate(city.plate)} · ${escapeHtml(city.name)} (${statusMark})</option>`;
      })
      .join('');

    const presetRadii = [100, 250, 400, 600];

    container.innerHTML = `
      <section class="radar-explorer" aria-label="Menzil Radarı">
        <div class="radar-header">
          <div>
            <h2>📡 Menzil Radarı <span style="font-size:0.85rem;font-weight:600;color:var(--accent-cyan);">Yakınımdaki İller</span></h2>
            <p>Merkez ilinizi veya anlık GPS konumunuzu seçin; belirlediğiniz menzil içindeki Anadolu illerini yön, karayolu mesafesi ve sürüş süresiyle tarayın.</p>
          </div>
          <div id="radar-gps-badge-host"></div>
        </div>

        <div class="glass-card radar-controls">
          <div class="radar-ctrl-group">
            <label class="radar-ctrl-label" for="radar-origin-select">
              <span>🧭 Merkez İl (81 İl)</span>
            </label>
            <select id="radar-origin-select" class="radar-select" aria-label="Merkez il seçimi">
              ${optionsHtml}
            </select>
          </div>

          <div class="radar-ctrl-group">
            <span class="radar-ctrl-label"><span>🛰️ Konum Algıla</span></span>
            <button type="button" id="radar-gps-btn" class="radar-gps-btn ${origin.isGps ? 'is-active' : ''}">
              📍 GPS Konumumu Kullan
            </button>
          </div>

          <div class="radar-ctrl-group radar-ctrl-radius">
            <label class="radar-ctrl-label" for="radar-radius-slider">
              <span>🎯 Tarama Yarıçapı</span>
              <span class="radar-radius-readout" id="radar-radius-readout">
                ${formatKm(radarState.radiusKm)} km
                <span class="radar-radius-sub">(~${formatKm(radarState.radiusKm * ROAD_FACTOR)} km yol)</span>
              </span>
            </label>
            <div class="radar-slider-row">
              <input
                type="range"
                id="radar-radius-slider"
                class="radar-range-slider"
                min="${MIN_RADIUS_KM}"
                max="${MAX_RADIUS_KM}"
                step="${STEP_RADIUS_KM}"
                value="${radarState.radiusKm}"
                aria-label="Tarama yarıçapı kilometre"
              />
            </div>
            <div class="radar-range-ticks">
              <span>50 km</span>
              <span>200 km</span>
              <span>400 km</span>
              <span>600 km</span>
            </div>
          </div>

          <div class="radar-toolbar-row">
            <div class="radar-filter-group" role="group" aria-label="Ziyaret filtresi">
              <button type="button" class="radar-filter-btn ${radarState.filter === 'all' ? 'active' : ''}" data-radar-filter="all">
                Tümü <span class="radar-filter-count" id="radar-cnt-all">0</span>
              </button>
              <button type="button" class="radar-filter-btn ${radarState.filter === 'visited' ? 'active' : ''}" data-radar-filter="visited">
                ✅ Sadece Gezilenler <span class="radar-filter-count" id="radar-cnt-visited">0</span>
              </button>
              <button type="button" class="radar-filter-btn ${radarState.filter === 'unvisited' ? 'active' : ''}" data-radar-filter="unvisited">
                ⏳ Sadece Gezilmemişler <span class="radar-filter-count" id="radar-cnt-unvisited">0</span>
              </button>
            </div>

            <div class="radar-preset-group">
              <span class="radar-preset-label">Hızlı Menzil:</span>
              ${presetRadii
                .map(function (r) {
                  return `<button type="button" class="radar-preset-chip ${radarState.radiusKm === r ? 'active' : ''}" data-radar-preset="${r}">${r} km</button>`;
                })
                .join('')}
            </div>
          </div>
        </div>

        <div class="radar-summary-strip" id="radar-summary-strip"></div>

        <div class="radar-workspace">
          <div class="radar-scope-card">
            <div class="radar-scope-topbar">
              <span class="radar-live-dot">CANLI TARAMA</span>
              <span id="radar-scope-meta"></span>
            </div>
            <div class="radar-svg-wrap" id="radar-svg-host">
              ${buildStaticRadarSvg()}
            </div>
            <div class="radar-hud-bar" id="radar-hud-bar">
              <span class="radar-hud-title">Hedef seçmek için bir noktaya tıklayın</span>
              <span class="radar-hud-meta">×1.35 karayolu</span>
            </div>
            <div class="radar-legend">
              <span class="radar-legend-item"><span class="radar-legend-dot" style="background:#10b981;box-shadow:0 0 8px #10b981;"></span> Gezilen İl</span>
              <span class="radar-legend-item"><span class="radar-legend-dot" style="background:#f59e0b;box-shadow:0 0 8px #f59e0b;"></span> Keşif Bekleyen</span>
              <span class="radar-legend-item"><span class="radar-legend-dot" style="background:#00f2fe;box-shadow:0 0 8px #00f2fe;"></span> Merkez</span>
            </div>
          </div>

          <div class="radar-list-panel">
            <div class="radar-list-header">
              <h3 class="radar-list-title" id="radar-list-title">Menzildeki İller</h3>
              <span class="radar-list-hint">Yakından uzağa sıralı • Karayolu tahmini</span>
            </div>
            <div class="radar-results-grid" id="radar-results-grid"></div>
          </div>
        </div>
      </section>
    `;

    // Element references
    const originSelect = container.querySelector('#radar-origin-select');
    const gpsBtn = container.querySelector('#radar-gps-btn');
    const gpsBadgeHost = container.querySelector('#radar-gps-badge-host');
    const radiusSlider = container.querySelector('#radar-radius-slider');
    const radiusReadout = container.querySelector('#radar-radius-readout');
    const summaryStrip = container.querySelector('#radar-summary-strip');
    const scopeMeta = container.querySelector('#radar-scope-meta');
    const hudBar = container.querySelector('#radar-hud-bar');
    const listTitle = container.querySelector('#radar-list-title');
    const resultsGrid = container.querySelector('#radar-results-grid');
    const ringsLayer = container.querySelector('.radar-rings-layer');
    const blipsLayer = container.querySelector('.radar-blips-layer');
    const originLabelEl = container.querySelector('.radar-origin-label');
    const cntAllEl = container.querySelector('#radar-cnt-all');
    const cntVisitedEl = container.querySelector('#radar-cnt-visited');
    const cntUnvisitedEl = container.querySelector('#radar-cnt-unvisited');

    let currentFilteredItems = [];

    function syncState() {
      if (state) {
        state.radarOriginKey = radarState.originKey;
        state.radarRadiusKm = radarState.radiusKm;
        state.radarFilter = radarState.filter;
      }
    }

    function updateHud(item) {
      if (!hudBar) return;
      if (!item) {
        hudBar.innerHTML = `
          <span class="radar-hud-title">Hedef seçmek için bir noktaya tıklayın</span>
          <span class="radar-hud-meta">${currentFilteredItems.length} hedef radar ekranında</span>
        `;
        return;
      }
      const badge = item.visited ? '✅' : '⏳';
      hudBar.innerHTML = `
        <span class="radar-hud-title">${badge} ${escapeHtml(item.city.name)} (${item.compass.arrow} ${item.compass.code})</span>
        <span class="radar-hud-meta">${formatKm(item.roadKm)} km • ${escapeHtml(item.driveTime)}</span>
      `;
    }

    function setHighlightedCity(cityKey) {
      container.querySelectorAll('.radar-blip.is-highlighted').forEach(function (el) {
        el.classList.remove('is-highlighted');
      });
      container.querySelectorAll('.radar-city-card.is-highlighted').forEach(function (el) {
        el.classList.remove('is-highlighted');
      });

      if (!cityKey) {
        updateHud(null);
        return;
      }

      const item = currentFilteredItems.find(function (d) {
        return d.key === cityKey;
      });
      let blip = null;
      if (blipsLayer) {
        blipsLayer.querySelectorAll('.radar-blip').forEach(function (el) {
          if (el.getAttribute('data-city-key') === cityKey) blip = el;
        });
      }
      let card = null;
      if (resultsGrid) {
        resultsGrid.querySelectorAll('.radar-city-card').forEach(function (el) {
          if (el.getAttribute('data-city-key') === cityKey) card = el;
        });
      }

      if (blip) blip.classList.add('is-highlighted');
      if (card) card.classList.add('is-highlighted');
      if (item) updateHud(item);
    }

    function updateDynamicViews() {
      syncState();
      const activeOrigin = resolveOrigin(provinces);
      const radiusKm = radarState.radiusKm;

      // Update GPS badge & button state
      if (gpsBtn) {
        gpsBtn.classList.toggle('is-active', activeOrigin.isGps);
        gpsBtn.disabled = radarState.gpsLoading;
        gpsBtn.textContent = radarState.gpsLoading
          ? '⏳ Konum Alınıyor...'
          : activeOrigin.isGps
            ? '📍 GPS Konumu Aktif'
            : '📍 GPS Konumumu Kullan';
      }

      if (gpsBadgeHost) {
        if (activeOrigin.isGps) {
          gpsBadgeHost.innerHTML = `
            <div class="radar-gps-pill">
              <span>🛰️ GPS: ${activeOrigin.lat.toFixed(3)}, ${activeOrigin.lng.toFixed(3)} • En yakın: ${escapeHtml(activeOrigin.nearestName)} (${formatKm(activeOrigin.nearestDistKm)} km)</span>
              <button type="button" class="radar-gps-clear" id="radar-gps-clear-btn" title="GPS modundan çık">✕</button>
            </div>
          `;
          const clearBtn = gpsBadgeHost.querySelector('#radar-gps-clear-btn');
          if (clearBtn) {
            clearBtn.addEventListener('click', function () {
              radarState.gpsCoords = null;
              updateDynamicViews();
              showToast('🧭 Merkez il moduna dönüldü');
            });
          }
        } else {
          gpsBadgeHost.innerHTML = '';
        }
      }

      // Update radius readout & presets
      if (radiusReadout) {
        radiusReadout.innerHTML = `${formatKm(radiusKm)} km <span class="radar-radius-sub">(~${formatKm(radiusKm * ROAD_FACTOR)} km yol)</span>`;
      }
      container.querySelectorAll('.radar-preset-chip').forEach(function (chip) {
        chip.classList.toggle('active', Number(chip.getAttribute('data-radar-preset')) === radiusKm);
      });

      // Compute discoveries
      const computed = computeDiscoveries(provinces, regions, activeOrigin, radiusKm, calcDistKm);
      const allInRange = computed.allInRange;

      if (cntAllEl) cntAllEl.textContent = String(allInRange.length);
      if (cntVisitedEl) cntVisitedEl.textContent = String(computed.visitedCount);
      if (cntUnvisitedEl) cntUnvisitedEl.textContent = String(computed.unvisitedCount);

      container.querySelectorAll('.radar-filter-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-radar-filter') === radarState.filter);
      });

      const filtered = allInRange.filter(function (item) {
        if (radarState.filter === 'visited') return item.visited;
        if (radarState.filter === 'unvisited') return !item.visited;
        return true;
      });
      currentFilteredItems = filtered;

      // Update scope metadata & origin label
      if (scopeMeta) {
        scopeMeta.textContent = `${activeOrigin.name} • R = ${formatKm(radiusKm)} km`;
      }
      if (originLabelEl) {
        originLabelEl.textContent = activeOrigin.name;
      }

      // Update concentric distance rings (25%, 50%, 75%, 100%)
      if (ringsLayer) {
        ringsLayer.innerHTML = RING_FRACTIONS.map(function (frac) {
          const r = (RADAR_MAX_R * frac).toFixed(2);
          const kmLabel = Math.round(radiusKm * frac);
          const isOuter = frac === 1.0;
          return `
            <circle
              cx="${SVG_CENTER}"
              cy="${SVG_CENTER}"
              r="${r}"
              fill="none"
              stroke="rgba(0, 242, 254, ${isOuter ? '0.45' : '0.22'})"
              stroke-width="${isOuter ? '1.4' : '1'}"
              ${isOuter ? '' : 'stroke-dasharray="4 4"'}
            />
            <text
              x="${SVG_CENTER + 4}"
              y="${(SVG_CENTER - Number(r) + 11).toFixed(2)}"
              fill="rgba(0, 242, 254, 0.78)"
              font-size="8.5"
              font-weight="700"
              font-family="var(--font-heading)"
            >${kmLabel} km</text>
          `;
        }).join('');
      }

      // Update radar blips
      if (blipsLayer) {
        const showAllLabels = filtered.length <= 28;
        blipsLayer.innerHTML = filtered
          .map(function (item, idx) {
            const fill = item.visited ? '#10b981' : '#f59e0b';
            const halo = item.visited ? 'rgba(16, 185, 129, 0.28)' : 'rgba(245, 158, 11, 0.25)';
            const x = item.x.toFixed(2);
            const y = item.y.toFixed(2);
            const labelOnRight = item.x <= SVG_CENTER + 115;
            const lx = (item.x + (labelOnRight ? 8 : -8)).toFixed(2);
            const ly = (item.y + 3).toFixed(2);
            const anchor = labelOnRight ? 'start' : 'end';
            const showLabel = showAllLabels || idx < 18;
            const titleText = `${item.city.name} — ${formatKm(item.roadKm)} km karayolu (${item.driveTime}), ${item.compass.name} (${item.compass.code})`;

            return `
              <g
                class="radar-blip"
                data-city-key="${escapeHtml(item.key)}"
                role="button"
                tabindex="0"
                aria-label="${escapeHtml(titleText)}"
              >
                <title>${escapeHtml(titleText)}</title>
                <circle cx="${x}" cy="${y}" r="9.5" fill="${halo}" />
                <circle class="radar-blip-dot" cx="${x}" cy="${y}" r="5" fill="${fill}" stroke="#061224" stroke-width="1.4" filter="url(#radarBlipGlow)" />
                ${
                  showLabel
                    ? `<text class="radar-blip-label" x="${lx}" y="${ly}" text-anchor="${anchor}">${escapeHtml(item.city.name)}</text>`
                    : ''
                }
              </g>
            `;
          })
          .join('');
      }

      // Update telemetry summary strip
      if (summaryStrip) {
        const closest = filtered[0] || null;
        const farthest = filtered.length > 0 ? filtered[filtered.length - 1] : null;
        const pctVisited =
          allInRange.length > 0 ? Math.round((computed.visitedCount / allInRange.length) * 100) : 0;

        summaryStrip.innerHTML = `
          <div class="glass-card radar-stat-card">
            <span class="radar-stat-label">Menzildeki İller</span>
            <span class="radar-stat-val">${filtered.length} <span style="font-size:0.8rem;font-weight:600;color:var(--text-muted);">/ ${allInRange.length}</span></span>
            <span class="radar-stat-sub">${escapeHtml(activeOrigin.name)} çevresi (${formatKm(radiusKm)} km)</span>
          </div>
          <div class="glass-card radar-stat-card">
            <span class="radar-stat-label">Bölge Hakimiyeti</span>
            <span class="radar-stat-val" style="color:var(--accent-emerald);">%${pctVisited}</span>
            <span class="radar-stat-sub">✅ ${computed.visitedCount} gezildi • ⏳ ${computed.unvisitedCount} kaldı</span>
          </div>
          <div class="glass-card radar-stat-card">
            <span class="radar-stat-label">En Yakın Hedef</span>
            <span class="radar-stat-val" style="font-size:1.05rem;">${closest ? escapeHtml(closest.city.name) : '—'}</span>
            <span class="radar-stat-sub">${closest ? `${formatKm(closest.roadKm)} km • ${closest.driveTime} (${closest.compass.code})` : 'Menzili genişletin'}</span>
          </div>
          <div class="glass-card radar-stat-card">
            <span class="radar-stat-label">En Uzak Hedef</span>
            <span class="radar-stat-val" style="font-size:1.05rem;">${farthest ? escapeHtml(farthest.city.name) : '—'}</span>
            <span class="radar-stat-sub">${farthest ? `${formatKm(farthest.roadKm)} km • ${farthest.driveTime} (${farthest.compass.code})` : 'Menzili genişletin'}</span>
          </div>
        `;
      }

      // Update list title & sorted province cards
      if (listTitle) {
        listTitle.textContent = `Menzildeki İller (${filtered.length})`;
      }

      if (resultsGrid) {
        if (filtered.length === 0) {
          resultsGrid.innerHTML = `
            <div class="glass-card radar-empty-state">
              <div class="radar-empty-icon">🔭</div>
              <div class="radar-empty-title">Bu menzilde eşleşen il bulunamadı</div>
              <div class="radar-empty-desc">
                ${escapeHtml(activeOrigin.name)} merkezli ${formatKm(radiusKm)} km yarıçapında seçili filtreye uyan il yok. Menzili artırabilir veya filtreyi sıfırlayabilirsiniz.
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:6px;">
                <button type="button" class="radar-gps-btn" id="radar-expand-btn">📡 Menzili 400 km Yap</button>
                ${
                  radarState.filter !== 'all'
                    ? '<button type="button" class="radar-filter-btn active" id="radar-reset-filter-btn">Filtreyi Tümü Yap</button>'
                    : ''
                }
              </div>
            </div>
          `;

          const expandBtn = resultsGrid.querySelector('#radar-expand-btn');
          if (expandBtn) {
            expandBtn.addEventListener('click', function () {
              radarState.radiusKm = Math.max(400, Math.min(MAX_RADIUS_KM, radarState.radiusKm + 150));
              if (radiusSlider) radiusSlider.value = String(radarState.radiusKm);
              updateDynamicViews();
            });
          }
          const resetFilterBtn = resultsGrid.querySelector('#radar-reset-filter-btn');
          if (resetFilterBtn) {
            resetFilterBtn.addEventListener('click', function () {
              radarState.filter = 'all';
              updateDynamicViews();
            });
          }
        } else {
          resultsGrid.innerHTML = filtered
            .map(function (item) {
              const thumbSrc =
                item.city.banner_rel ||
                (Array.isArray(item.city.images) && item.city.images[0]) ||
                '';
              const statusClass = item.visited ? 'visited' : 'unvisited';
              const statusLabel = item.visited ? '✅ Gezildi' : '⏳ Gezilmedi';

              return `
                <button
                  type="button"
                  class="radar-city-card"
                  data-city-key="${escapeHtml(item.key)}"
                  aria-label="${escapeHtml(item.city.name)} şehrine git"
                >
                  <div class="radar-thumb-wrap">
                    ${
                      thumbSrc
                        ? `<img class="radar-thumb-img" src="${escapeHtml(thumbSrc)}" alt="${escapeHtml(item.city.name)}" loading="lazy" onerror="this.style.display='none'" />`
                        : ''
                    }
                    <span class="radar-thumb-plate">${padPlate(item.city.plate)}</span>
                  </div>

                  <div class="radar-city-info">
                    <div class="radar-city-top">
                      <span class="radar-city-name">${escapeHtml(item.city.name)}</span>
                      <span class="radar-status-badge ${statusClass}">${statusLabel}</span>
                    </div>
                    <div class="radar-city-region">
                      <span>${escapeHtml(item.regionIcon)} ${escapeHtml(item.regionName)}</span>
                    </div>
                  </div>

                  <div class="radar-city-metrics">
                    <div class="radar-compass-chip" title="${escapeHtml(item.compass.name)} (${item.compass.deg}°)">
                      <span class="radar-compass-arrow">${item.compass.arrow}</span>
                      <span class="radar-compass-code">${item.compass.code}</span>
                    </div>
                    <div class="radar-dist-col">
                      <div class="radar-road-km">~${formatKm(item.roadKm)} km</div>
                      <div class="radar-drive-time">🚗 ${escapeHtml(item.driveTime)}</div>
                      <div class="radar-air-km">Kuş uçuşu ${formatKm(item.distKm)} km</div>
                    </div>
                  </div>
                </button>
              `;
            })
            .join('');
        }
      }

      updateHud(null);
    }

    // Event Listeners
    if (originSelect) {
      originSelect.addEventListener('change', function () {
        radarState.originKey = originSelect.value;
        radarState.gpsCoords = null;
        updateDynamicViews();
      });
    }

    if (radiusSlider) {
      radiusSlider.addEventListener('input', function () {
        radarState.radiusKm = Number(radiusSlider.value);
        updateDynamicViews();
      });
    }

    container.querySelectorAll('.radar-filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        radarState.filter = btn.getAttribute('data-radar-filter') || 'all';
        updateDynamicViews();
      });
    });

    container.querySelectorAll('.radar-preset-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        const val = Number(chip.getAttribute('data-radar-preset'));
        if (Number.isFinite(val)) {
          radarState.radiusKm = val;
          if (radiusSlider) radiusSlider.value = String(val);
          updateDynamicViews();
        }
      });
    });

    if (gpsBtn) {
      gpsBtn.addEventListener('click', function () {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          showToast('⚠️ Tarayıcınız GPS konum servisini desteklemiyor.');
          return;
        }
        if (radarState.gpsLoading) return;

        radarState.gpsLoading = true;
        updateDynamicViews();

        navigator.geolocation.getCurrentPosition(
          function (pos) {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            // Find nearest Turkish province
            let nearestKey = null;
            let nearestName = '';
            let nearestDistKm = Infinity;

            Object.entries(provinces).forEach(function (entry) {
              const key = entry[0];
              const city = entry[1];
              if (!city || !Number.isFinite(Number(city.lat)) || !Number.isFinite(Number(city.lng))) {
                return;
              }
              const d = calcDistKm(lat, lng, Number(city.lat), Number(city.lng));
              if (d < nearestDistKm) {
                nearestDistKm = d;
                nearestKey = key;
                nearestName = city.name;
              }
            });

            radarState.gpsLoading = false;
            radarState.gpsCoords = {
              lat: lat,
              lng: lng,
              nearestKey: nearestKey,
              nearestName: nearestName || 'Türkiye',
              nearestDistKm: nearestDistKm
            };
            if (nearestKey && originSelect) {
              radarState.originKey = nearestKey;
              originSelect.value = nearestKey;
            }

            updateDynamicViews();
            showToast(
              `📍 GPS konumu kilitlendi — En yakın il: ${nearestName} (${formatKm(nearestDistKm)} km)`
            );
          },
          function (err) {
            radarState.gpsLoading = false;
            updateDynamicViews();
            let msg = '⚠️ GPS konumu alınamadı.';
            if (err && err.code === 1) {
              msg = '⚠️ Konum izni reddedildi. Tarayıcı ayarlarından izin verebilirsiniz.';
            } else if (err && err.code === 2) {
              msg = '⚠️ Konum bilgisi şu an kullanılamıyor.';
            } else if (err && err.code === 3) {
              msg = '⚠️ GPS konum isteği zaman aşımına uğradı.';
            }
            showToast(msg);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });
    }

    // Delegated click & hover on radar blips
    if (blipsLayer) {
      blipsLayer.addEventListener('click', function (e) {
        const blip = e.target.closest('.radar-blip');
        if (!blip) return;
        const key = blip.getAttribute('data-city-key');
        if (key) selectCity(key);
      });

      blipsLayer.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const blip = e.target.closest('.radar-blip');
        if (!blip) return;
        e.preventDefault();
        const key = blip.getAttribute('data-city-key');
        if (key) selectCity(key);
      });

      blipsLayer.addEventListener('mouseover', function (e) {
        const blip = e.target.closest('.radar-blip');
        if (blip) setHighlightedCity(blip.getAttribute('data-city-key'));
      });

      blipsLayer.addEventListener('mouseout', function (e) {
        const blip = e.target.closest('.radar-blip');
        if (blip) setHighlightedCity(null);
      });
    }

    // Delegated click & hover on discovered province cards
    if (resultsGrid) {
      resultsGrid.addEventListener('click', function (e) {
        const card = e.target.closest('.radar-city-card');
        if (!card) return;
        const key = card.getAttribute('data-city-key');
        if (key) selectCity(key);
      });

      resultsGrid.addEventListener('mouseover', function (e) {
        const card = e.target.closest('.radar-city-card');
        if (card) setHighlightedCity(card.getAttribute('data-city-key'));
      });

      resultsGrid.addEventListener('mouseout', function (e) {
        const card = e.target.closest('.radar-city-card');
        if (card) setHighlightedCity(null);
      });
    }

    // Initial dynamic render
    updateDynamicViews();
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.radar = {
    render: render
  };
})();
