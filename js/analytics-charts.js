/**
 * Anadolu Seyahatnamesi - İnteraktif Analitik & 81 Plaka Isı Haritası Modülü
 * Zero-dependency Pure SVG & HTML Analytics Dashboard
 * Registers on window.SEYYAH_MODULES.analytics
 */
(function () {
  'use strict';

  const STYLE_ID = 'seyyah-analytics-styles';
  const ROAD_FACTOR = 1.25;

  function defaultEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatNumber(n) {
    if (typeof n !== 'number' || Number.isNaN(n)) return '0';
    return Math.round(n).toLocaleString('tr-TR');
  }

  function formatPlate(plate) {
    const num = Number(plate) || 0;
    return num < 10 ? '0' + num : String(num);
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function computeAverageConsecutiveDistance(visitedCities) {
    const valid = visitedCities.filter(
      (c) => typeof c.lat === 'number' && typeof c.lng === 'number'
    );
    if (valid.length < 2) {
      return { avgRoadKm: 0, avgDirectKm: 0, totalChainRoadKm: 0, segments: 0 };
    }

    // Deterministic nearest-neighbor chain starting from Ankara (if visited) or westernmost visited city
    const remaining = valid.slice();
    let startIdx = remaining.findIndex((c) => c.plate === 6);
    if (startIdx === -1) {
      startIdx = 0;
      for (let i = 1; i < remaining.length; i++) {
        if (remaining[i].lng < remaining[startIdx].lng) startIdx = i;
      }
    }

    let current = remaining.splice(startIdx, 1)[0];
    let totalDirectKm = 0;
    let segments = 0;

    while (remaining.length > 0) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const d = haversineKm(current.lat, current.lng, remaining[i].lat, remaining[i].lng);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      totalDirectKm += bestDist;
      segments += 1;
      current = remaining.splice(bestIdx, 1)[0];
    }

    const totalChainRoadKm = totalDirectKm * ROAD_FACTOR;
    return {
      avgDirectKm: totalDirectKm / segments,
      avgRoadKm: totalChainRoadKm / segments,
      totalChainRoadKm,
      segments
    };
  }

  function computeExtremes(visitedCities) {
    const valid = visitedCities.filter(
      (c) => typeof c.lat === 'number' && typeof c.lng === 'number'
    );
    if (!valid.length) {
      return null;
    }

    let north = valid[0];
    let south = valid[0];
    let east = valid[0];
    let west = valid[0];

    for (let i = 1; i < valid.length; i++) {
      const c = valid[i];
      if (c.lat > north.lat) north = c;
      if (c.lat < south.lat) south = c;
      if (c.lng > east.lng) east = c;
      if (c.lng < west.lng) west = c;
    }

    const ewSpanKm = haversineKm(west.lat, west.lng, east.lat, east.lng);
    const nsSpanKm = haversineKm(south.lat, south.lng, north.lat, north.lng);

    return { north, south, east, west, ewSpanKm, nsSpanKm };
  }

  function computeRegionalRows(data, provincesList) {
    const breakdown = (data && data.stats && data.stats.regional_breakdown) || null;
    if (breakdown && Object.keys(breakdown).length > 0) {
      return Object.entries(breakdown)
        .map(([code, r]) => {
          const total = Number(r.total) || 0;
          const visited = Number(r.visited) || 0;
          const pct =
            typeof r.percentage === 'number'
              ? r.percentage
              : total > 0
                ? Number(((visited / total) * 100).toFixed(1))
                : 0;
          return {
            code,
            name: r.name || code,
            icon: r.icon || '📍',
            color: r.color || '#00f2fe',
            desc: r.desc || '',
            visited,
            total,
            percentage: pct
          };
        })
        .sort((a, b) => b.percentage - a.percentage || b.visited - a.visited || a.name.localeCompare(b.name, 'tr'));
    }

    const map = {};
    const regionMeta = (data && data.regions) || {};
    provincesList.forEach((city) => {
      const code = city.region_code || city.region || 'Diger';
      if (!map[code]) {
        const meta = regionMeta[code] || {};
        map[code] = {
          code,
          name: meta.name || city.region || code,
          icon: meta.icon || '📍',
          color: meta.color || '#00f2fe',
          desc: meta.desc || '',
          visited: 0,
          total: 0
        };
      }
      map[code].total += 1;
      if (city.visited) map[code].visited += 1;
    });

    return Object.values(map)
      .map((r) => ({
        ...r,
        percentage: r.total > 0 ? Number(((r.visited / r.total) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.percentage - a.percentage || b.visited - a.visited);
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .ana-dashboard {
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 1280px;
        margin: 0 auto;
        padding-bottom: 32px;
        animation: anaFadeIn 0.35s ease;
      }

      @keyframes anaFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .ana-hero {
        padding: 22px 26px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(16, 185, 129, 0.14), rgba(0, 242, 254, 0.12));
        border: 1px solid rgba(0, 242, 254, 0.25);
        border-radius: var(--radius-lg, 20px);
      }

      .ana-hero-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.5rem;
        font-weight: 800;
        background: linear-gradient(135deg, #ffffff 0%, var(--accent-cyan, #00f2fe) 60%, var(--accent-emerald, #10b981) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 4px;
      }

      .ana-hero-sub {
        color: var(--text-secondary, #94a3b8);
        font-size: 0.88rem;
      }

      .ana-hero-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .ana-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 9999px;
        font-size: 0.78rem;
        font-weight: 700;
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        color: var(--text-primary, #f8fafc);
      }

      .ana-chip strong {
        color: var(--accent-cyan, #00f2fe);
      }

      .ana-top-grid {
        display: grid;
        grid-template-columns: minmax(320px, 1fr) minmax(360px, 1.35fr);
        gap: 20px;
      }

      .ana-card {
        padding: 22px;
        border-radius: var(--radius-lg, 20px);
        position: relative;
        overflow: hidden;
      }

      .ana-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 18px;
        flex-wrap: wrap;
      }

      .ana-card-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .ana-card-badge {
        font-size: 0.74rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 9999px;
        background: rgba(0, 242, 254, 0.12);
        color: var(--accent-cyan, #00f2fe);
        border: 1px solid rgba(0, 242, 254, 0.28);
      }

      /* Radial / Donut Gauge Section */
      .ana-gauges-wrap {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .ana-donut-layout {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 24px;
        flex-wrap: wrap;
      }

      .ana-svg-box {
        position: relative;
        width: 196px;
        height: 196px;
        flex-shrink: 0;
      }

      .ana-donut-svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
        overflow: visible;
      }

      .ana-donut-arc {
        transition: stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .ana-donut-center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        pointer-events: none;
      }

      .ana-donut-pct {
        font-family: var(--font-heading, sans-serif);
        font-size: 2rem;
        font-weight: 800;
        line-height: 1.1;
        background: linear-gradient(135deg, #34d399, #00f2fe);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .ana-donut-label {
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
        font-weight: 600;
        margin-top: 2px;
      }

      .ana-donut-sub {
        font-size: 0.72rem;
        color: var(--accent-emerald, #10b981);
        font-weight: 700;
        margin-top: 2px;
      }

      .ana-gauge-stats {
        flex: 1;
        min-width: 170px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .ana-stat-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .ana-stat-left {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
      }

      .ana-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .ana-dot-visited {
        background: var(--accent-emerald, #10b981);
        box-shadow: 0 0 8px rgba(16, 185, 129, 0.75);
      }

      .ana-dot-remaining {
        background: #475569;
      }

      .ana-dot-photo {
        background: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.65);
      }

      .ana-stat-val {
        font-family: var(--font-heading, sans-serif);
        font-weight: 700;
        font-size: 0.92rem;
        color: var(--text-primary, #f8fafc);
      }

      /* Photo Archive Mini Bar */
      .ana-photo-panel {
        padding: 12px 14px;
        border-radius: var(--radius-md, 12px);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(16, 185, 129, 0.08));
        border: 1px solid rgba(245, 158, 11, 0.28);
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .ana-mini-ring {
        width: 54px;
        height: 54px;
        flex-shrink: 0;
        position: relative;
      }

      .ana-mini-ring svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .ana-mini-ring-text {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: 800;
        color: var(--accent-gold, #f59e0b);
      }

      .ana-photo-info {
        flex: 1;
        min-width: 0;
      }

      .ana-photo-title {
        font-size: 0.84rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .ana-photo-sub {
        font-size: 0.75rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 2px;
      }

      /* 7-Region Bar Chart */
      .ana-region-list {
        display: flex;
        flex-direction: column;
        gap: 11px;
      }

      .ana-region-row {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 8px 10px;
        border-radius: var(--radius-sm, 8px);
        cursor: pointer;
        border: 1px solid transparent;
        transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
      }

      .ana-region-row:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.1);
        transform: translateX(2px);
      }

      .ana-region-row.is-active {
        background: rgba(0, 242, 254, 0.09);
        border-color: rgba(0, 242, 254, 0.4);
      }

      .ana-region-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 0.83rem;
      }

      .ana-region-name {
        font-weight: 600;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .ana-region-nums {
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: var(--font-heading, sans-serif);
        font-size: 0.8rem;
      }

      .ana-region-ratio {
        color: var(--text-secondary, #94a3b8);
        font-weight: 600;
      }

      .ana-region-pct {
        font-weight: 800;
        min-width: 46px;
        text-align: right;
      }

      .ana-bar-track {
        width: 100%;
        height: 10px;
        border-radius: 9999px;
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.06);
        overflow: hidden;
      }

      .ana-bar-fill {
        height: 100%;
        border-radius: 9999px;
        transition: width 0.75s cubic-bezier(0.22, 1, 0.36, 1);
        min-width: 2px;
      }

      .ana-region-hint {
        font-size: 0.73rem;
        color: var(--text-muted, #64748b);
        margin-top: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .ana-reset-btn {
        background: transparent;
        border: 1px solid rgba(0, 242, 254, 0.35);
        color: var(--accent-cyan, #00f2fe);
        border-radius: 9999px;
        padding: 3px 10px;
        font-size: 0.72rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ana-reset-btn:hover {
        background: rgba(0, 242, 254, 0.14);
      }

      /* 81-Plate 9x9 Interactive Matrix */
      .ana-plate-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .ana-filter-btn {
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        color: var(--text-secondary, #94a3b8);
        border-radius: 9999px;
        padding: 5px 12px;
        font-size: 0.76rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ana-filter-btn:hover {
        border-color: rgba(0, 242, 254, 0.4);
        color: var(--text-primary, #f8fafc);
      }

      .ana-filter-btn.is-active {
        background: rgba(16, 185, 129, 0.2);
        border-color: rgba(16, 185, 129, 0.6);
        color: #34d399;
      }

      .ana-export-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .ana-export-btn {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.16), rgba(16, 185, 129, 0.18));
        border: 1px solid rgba(0, 242, 254, 0.42);
        color: var(--text-primary, #f8fafc);
        border-radius: 9999px;
        padding: 5px 13px;
        font-size: 0.76rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .ana-export-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 4px 14px rgba(0, 242, 254, 0.2);
        transform: translateY(-1px);
      }

      .ana-export-choices {
        display: none;
        align-items: center;
        gap: 6px;
      }

      .ana-export-choices.is-open {
        display: inline-flex;
      }

      .ana-export-opt {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(16, 185, 129, 0.45);
        color: #34d399;
        border-radius: 9999px;
        padding: 4px 11px;
        font-size: 0.74rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .ana-export-opt:hover {
        background: rgba(16, 185, 129, 0.22);
        color: #ffffff;
      }

      .ana-plate-matrix-wrap {
        position: relative;
      }

      .ana-plate-grid {
        display: grid;
        grid-template-columns: repeat(9, minmax(0, 1fr));
        gap: 8px;
      }

      .ana-plate-tile {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 4px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(30, 41, 59, 0.45);
        color: var(--text-secondary, #94a3b8);
        cursor: pointer;
        transition: transform 0.18s ease, box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.2s ease, background 0.2s ease;
        text-align: center;
        min-height: 60px;
        font-family: inherit;
      }

      .ana-plate-tile.is-visited {
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.28), rgba(6, 95, 70, 0.42));
        border-color: rgba(16, 185, 129, 0.58);
        color: #ecfdf5;
        box-shadow: 0 0 14px rgba(16, 185, 129, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.12);
      }

      .ana-plate-tile:hover,
      .ana-plate-tile:focus-visible {
        transform: translateY(-3px) scale(1.04);
        z-index: 5;
        outline: none;
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 8px 20px rgba(0, 242, 254, 0.28);
      }

      .ana-plate-tile.is-visited:hover,
      .ana-plate-tile.is-visited:focus-visible {
        border-color: #34d399;
        box-shadow: 0 0 22px rgba(16, 185, 129, 0.55);
      }

      .ana-plate-tile.is-dimmed {
        opacity: 0.22;
        filter: grayscale(0.5);
      }

      .ana-plate-num {
        font-family: var(--font-heading, sans-serif);
        font-size: 1rem;
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: 0.4px;
      }

      .ana-plate-name {
        font-size: 0.65rem;
        font-weight: 600;
        margin-top: 3px;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 3px;
        opacity: 0.9;
      }

      .ana-plate-fav {
        position: absolute;
        top: 4px;
        right: 5px;
        font-size: 0.62rem;
        color: var(--accent-gold, #f59e0b);
        line-height: 1;
      }

      .ana-plate-legend {
        margin-top: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      .ana-legend-items {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
      }

      .ana-legend-swatch {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .ana-swatch-box {
        width: 13px;
        height: 13px;
        border-radius: 4px;
        display: inline-block;
      }

      .ana-swatch-visited {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.7), rgba(6, 95, 70, 0.8));
        border: 1px solid #34d399;
        box-shadow: 0 0 8px rgba(16, 185, 129, 0.55);
      }

      .ana-swatch-unvisited {
        background: rgba(30, 41, 59, 0.65);
        border: 1px solid rgba(148, 163, 184, 0.35);
      }

      /* Floating Rich Tooltip */
      .ana-tooltip {
        position: fixed;
        z-index: 3000;
        pointer-events: none;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 0.14s ease, transform 0.14s ease;
        background: rgba(10, 15, 29, 0.96);
        color: #f8fafc;
        border: 1px solid rgba(0, 242, 254, 0.45);
        border-radius: 12px;
        padding: 10px 13px;
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(12px);
        max-width: 260px;
        font-size: 0.8rem;
      }

      .ana-tooltip.is-visible {
        opacity: 1;
        transform: translateY(0);
      }

      .ana-tooltip-head {
        font-family: var(--font-heading, sans-serif);
        font-weight: 800;
        font-size: 0.88rem;
        color: #ffffff;
        margin-bottom: 3px;
      }

      .ana-tooltip-status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.74rem;
        font-weight: 700;
      }

      .ana-tooltip-status.visited {
        color: #34d399;
      }

      .ana-tooltip-status.unvisited {
        color: #fbbf24;
      }

      .ana-tooltip-meta {
        font-size: 0.72rem;
        color: #94a3b8;
        margin-top: 4px;
      }

      /* Geographic Extremes & Fun Facts */
      .ana-bottom-grid {
        display: grid;
        grid-template-columns: minmax(300px, 1.15fr) minmax(280px, 1fr);
        gap: 20px;
      }

      .ana-extremes-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .ana-extreme-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.58);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
        width: 100%;
        font-family: inherit;
      }

      .ana-extreme-item:hover {
        border-color: rgba(0, 242, 254, 0.45);
        transform: translateY(-2px);
        background: rgba(15, 23, 42, 0.8);
      }

      .ana-extreme-dir {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
        flex-shrink: 0;
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.25);
      }

      .ana-extreme-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: var(--text-muted, #64748b);
        font-weight: 700;
      }

      .ana-extreme-city {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.98rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        margin-top: 1px;
      }

      .ana-extreme-coord {
        font-size: 0.72rem;
        color: var(--accent-cyan, #00f2fe);
        font-family: monospace;
        margin-top: 2px;
      }

      .ana-facts-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .ana-fact-box {
        padding: 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.58);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .ana-fact-icon {
        font-size: 1.2rem;
      }

      .ana-fact-val {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.2;
      }

      .ana-fact-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-secondary, #94a3b8);
      }

      .ana-fact-sub {
        font-size: 0.7rem;
        color: var(--text-muted, #64748b);
      }

      /* Light Theme Support */
      body.light-theme .ana-hero {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(16, 185, 129, 0.1), rgba(14, 165, 233, 0.1));
        border-color: rgba(14, 165, 233, 0.25);
      }

      body.light-theme .ana-hero-title {
        background: linear-gradient(135deg, #0f172a 0%, #0284c7 60%, #059669 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .ana-chip,
      body.light-theme .ana-stat-row,
      body.light-theme .ana-filter-btn,
      body.light-theme .ana-extreme-item,
      body.light-theme .ana-fact-box {
        background: rgba(248, 250, 252, 0.9);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .ana-bar-track {
        background: rgba(15, 23, 42, 0.08);
        border-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .ana-plate-tile {
        background: rgba(241, 245, 249, 0.95);
        border-color: rgba(15, 23, 42, 0.12);
        color: #475569;
      }

      body.light-theme .ana-plate-tile.is-visited {
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.22), rgba(5, 150, 105, 0.3));
        border-color: rgba(5, 150, 105, 0.65);
        color: #064e3b;
        box-shadow: 0 2px 10px rgba(16, 185, 129, 0.22);
      }

      body.light-theme .ana-region-row:hover {
        background: rgba(15, 23, 42, 0.04);
      }

      body.light-theme .ana-export-btn {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.12), rgba(5, 150, 105, 0.12));
        border-color: rgba(2, 132, 199, 0.35);
        color: #0f172a;
      }

      body.light-theme .ana-export-opt {
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(5, 150, 105, 0.45);
        color: #047857;
      }

      body.light-theme .ana-export-opt:hover {
        background: #059669;
        color: #ffffff;
      }

      @media (max-width: 980px) {
        .ana-top-grid,
        .ana-bottom-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 680px) {
        .ana-plate-grid {
          gap: 5px;
        }
        .ana-plate-tile {
          padding: 7px 2px;
          min-height: 48px;
          border-radius: 8px;
        }
        .ana-plate-num {
          font-size: 0.82rem;
        }
        .ana-plate-name {
          font-size: 0.56rem;
        }
        .ana-extremes-grid,
        .ana-facts-grid {
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
    const escapeHtml = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : defaultEscapeHtml;
    const state = safeCtx.state || {};
    const data = safeCtx.data || state.data || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const selectCity = typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};

    if (!data || !data.provinces) {
      container.innerHTML = `
        <div class="glass-card ana-card" style="text-align:center; max-width:560px; margin:32px auto;">
          <h3 style="color: var(--accent-gold, #f59e0b); margin-bottom:8px;">Analitik Verisi Bulunamadı</h3>
          <p style="color: var(--text-secondary, #94a3b8); font-size:0.9rem;">
            Şehir verileri henüz yüklenmedi. Lütfen veri dosyasının yüklendiğinden emin olun.
          </p>
        </div>
      `;
      return;
    }

    const favorites = state.favorites instanceof Set ? state.favorites : new Set(Array.isArray(state.favorites) ? state.favorites : []);
    const showToast = typeof safeCtx.showToast === 'function' ? safeCtx.showToast : function () {};

    // Normalize provinces list sorted by plate 01 -> 81
    const provincesList = Object.entries(data.provinces)
      .map(([key, p]) => ({
        key,
        plate: Number(p.plate) || 0,
        name: p.name || key,
        region: p.region || '',
        region_code: p.region_code || '',
        lat: typeof p.lat === 'number' ? p.lat : Number(p.lat),
        lng: typeof p.lng === 'number' ? p.lng : Number(p.lng),
        visited: Boolean(p.visited),
        landmarks: Array.isArray(p.landmarks) ? p.landmarks : [],
        has_banner: Boolean(p.has_banner),
        has_gallery: Boolean(p.has_gallery)
      }))
      .sort((a, b) => a.plate - b.plate);

    const stats = data.stats || {};
    const totalCities = Number(stats.total_cities) || provincesList.length || 81;
    const visitedList = provincesList.filter((p) => p.visited);
    const visitedCount = typeof stats.visited_cities === 'number' ? stats.visited_cities : visitedList.length;
    const remainingCount = typeof stats.unvisited_cities === 'number' ? stats.unvisited_cities : Math.max(0, totalCities - visitedCount);
    const progressPct =
      typeof stats.progress_pct === 'number'
        ? stats.progress_pct
        : totalCities > 0
          ? Number(((visitedCount / totalCities) * 100).toFixed(1))
          : 0;

    // Photo archive metrics
    const photoTarget = totalCities * 2;
    const totalPhotos =
      typeof stats.total_photos === 'number'
        ? stats.total_photos
        : provincesList.reduce((acc, p) => acc + (p.has_banner ? 1 : 0) + (p.has_gallery ? 1 : 0), 0);
    const photoPct = photoTarget > 0 ? Math.min(100, Number(((totalPhotos / photoTarget) * 100).toFixed(1))) : 0;
    const provincesWithTwo =
      typeof stats.provinces_with_two_photos === 'number'
        ? stats.provinces_with_two_photos
        : provincesList.filter((p) => p.has_banner && p.has_gallery).length;

    // Regional breakdown sorted by completion percentage
    const regionRows = computeRegionalRows(data, provincesList);
    const activeRegionsCount =
      typeof stats.visited_regions === 'number'
        ? stats.visited_regions
        : regionRows.filter((r) => r.visited > 0).length;

    // Geographic extremes & fun facts
    const extremes = computeExtremes(visitedList);
    const distanceMetrics = computeAverageConsecutiveDistance(visitedList);
    const daysOnRoad = typeof stats.days_on_road === 'number' ? stats.days_on_road : visitedCount * 5;
    const libraryHours = typeof stats.library_hours === 'number' ? stats.library_hours : visitedCount * 20;
    const estimatedKm = typeof stats.estimated_km === 'number' ? stats.estimated_km : Math.round(distanceMetrics.totalChainRoadKm);

    // SVG Donut Geometry
    const donutRadius = 78;
    const donutCircumference = 2 * Math.PI * donutRadius;
    const donutDashOffset = donutCircumference * (1 - Math.max(0, Math.min(100, progressPct)) / 100);

    // Secondary Inner Ring (Photo Archive)
    const innerRadius = 61;
    const innerCircumference = 2 * Math.PI * innerRadius;
    const innerDashOffset = innerCircumference * (1 - photoPct / 100);

    // Mini Photo Ring Geometry
    const miniRadius = 21;
    const miniCirc = 2 * Math.PI * miniRadius;
    const miniOffset = miniCirc * (1 - photoPct / 100);

    const regionBarsHtml = regionRows
      .map((r) => {
        const pctStr = `%${r.percentage.toFixed(1)}`;
        return `
          <div class="ana-region-row" data-region-code="${escapeHtml(r.code)}" role="button" tabindex="0" title="${escapeHtml(r.name)} illerini matriste vurgula">
            <div class="ana-region-meta">
              <span class="ana-region-name">
                <span>${escapeHtml(r.icon)}</span>
                <span>${escapeHtml(r.name)}</span>
              </span>
              <span class="ana-region-nums">
                <span class="ana-region-ratio">${r.visited}/${r.total}</span>
                <span class="ana-region-pct" style="color:${escapeHtml(r.color)};">${pctStr}</span>
              </span>
            </div>
            <div class="ana-bar-track">
              <div class="ana-bar-fill" style="width:${Math.max(0, Math.min(100, r.percentage))}%; background: linear-gradient(90deg, ${escapeHtml(r.color)}, rgba(0, 242, 254, 0.9)); box-shadow: 0 0 10px ${escapeHtml(r.color)}55;"></div>
            </div>
          </div>
        `;
      })
      .join('');

    const favoritesCount = provincesList.filter((c) => favorites.has(c.key)).length;

    const plateTilesHtml = provincesList
      .map((city) => {
        const plateStr = formatPlate(city.plate);
        const statusText = city.visited ? 'Gezildi' : 'Planlanan';
        const isFav = favorites.has(city.key);
        const tooltipLine = `${plateStr} ${city.name} • ${city.region} • ${statusText}`;
        return `
          <button
            type="button"
            class="ana-plate-tile ${city.visited ? 'is-visited' : 'is-unvisited'}"
            data-city-key="${escapeHtml(city.key)}"
            data-region-code="${escapeHtml(city.region_code)}"
            data-visited="${city.visited ? '1' : '0'}"
            data-favorite="${isFav ? '1' : '0'}"
            data-plate="${escapeHtml(plateStr)}"
            data-name="${escapeHtml(city.name)}"
            data-region="${escapeHtml(city.region)}"
            data-landmark="${escapeHtml(city.landmarks[0] || '')}"
            aria-label="${escapeHtml(tooltipLine)}"
            title="${escapeHtml(tooltipLine)}"
          >
            ${isFav ? '<span class="ana-plate-fav" aria-hidden="true">★</span>' : ''}
            <span class="ana-plate-num">${escapeHtml(plateStr)}</span>
            <span class="ana-plate-name">${escapeHtml(city.name)}</span>
          </button>
        `;
      })
      .join('');

    const extremesHtml = extremes
      ? [
          {
            dir: '⬆️',
            label: 'En Kuzey',
            city: extremes.north,
            coord: `${extremes.north.lat.toFixed(2)}° K`
          },
          {
            dir: '⬇️',
            label: 'En Güney',
            city: extremes.south,
            coord: `${extremes.south.lat.toFixed(2)}° K`
          },
          {
            dir: '➡️',
            label: 'En Doğu',
            city: extremes.east,
            coord: `${extremes.east.lng.toFixed(2)}° D`
          },
          {
            dir: '⬅️',
            label: 'En Batı',
            city: extremes.west,
            coord: `${extremes.west.lng.toFixed(2)}° D`
          }
        ]
          .map(
            (ex) => `
          <button type="button" class="ana-extreme-item" data-city-key="${escapeHtml(ex.city.key)}">
            <span class="ana-extreme-dir" aria-hidden="true">${ex.dir}</span>
            <span>
              <div class="ana-extreme-label">${escapeHtml(ex.label)}</div>
              <div class="ana-extreme-city">${formatPlate(ex.city.plate)} ${escapeHtml(ex.city.name)}</div>
              <div class="ana-extreme-coord">${escapeHtml(ex.coord)} • ${escapeHtml(ex.city.region)}</div>
            </span>
          </button>
        `
          )
          .join('')
      : `
        <div class="ana-fact-box" style="grid-column: 1 / -1; text-align:center;">
          <div class="ana-fact-label">Coğrafi uç noktaları görmek için en az 1 şehir gezilmiş olmalıdır.</div>
        </div>
      `;

    container.innerHTML = `
      <section class="ana-dashboard" aria-label="İnteraktif Analitik ve 81 Plaka Isı Haritası">
        <div class="ana-hero">
          <div>
            <h2 class="ana-hero-title">📊 İnteraktif Analitik &amp; 81 Plaka Isı Haritası</h2>
            <p class="ana-hero-sub">Türkiye'nin 81 ili ve 7 coğrafi bölgesi üzerindeki keşif verileri, fotoğraf arşivi ve coğrafi uç noktalar.</p>
          </div>
          <div class="ana-hero-chips">
            <span class="ana-chip">🧭 Keşif: <strong>%${progressPct.toFixed(1)}</strong></span>
            <span class="ana-chip">🗺️ Bölge: <strong>${activeRegionsCount}/${regionRows.length}</strong></span>
            <span class="ana-chip">🛣️ Menzil: <strong>~${formatNumber(estimatedKm)} km</strong></span>
          </div>
        </div>

        <div class="ana-top-grid">
          <!-- Donut / Radial Progress Gauge Card -->
          <div class="glass-card ana-card">
            <div class="ana-card-header">
              <h3 class="ana-card-title">🎯 Genel Keşif &amp; Arşiv Durumu</h3>
              <span class="ana-card-badge">${visitedCount} / ${totalCities} İl</span>
            </div>

            <div class="ana-gauges-wrap">
              <div class="ana-donut-layout">
                <div class="ana-svg-box">
                  <svg class="ana-donut-svg" viewBox="0 0 200 200" role="img" aria-label="Genel keşif oranı yüzde ${progressPct.toFixed(1)}">
                    <defs>
                      <linearGradient id="anaDiscoveryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#10b981" />
                        <stop offset="55%" stop-color="#00f2fe" />
                        <stop offset="100%" stop-color="#38bdf8" />
                      </linearGradient>
                      <linearGradient id="anaPhotoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f59e0b" />
                        <stop offset="100%" stop-color="#34d399" />
                      </linearGradient>
                      <filter id="anaGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <!-- Outer track -->
                    <circle cx="100" cy="100" r="${donutRadius}" fill="none" stroke="rgba(148, 163, 184, 0.16)" stroke-width="14" />
                    <!-- Outer progress arc -->
                    <circle
                      class="ana-donut-arc"
                      cx="100" cy="100" r="${donutRadius}"
                      fill="none"
                      stroke="url(#anaDiscoveryGrad)"
                      stroke-width="14"
                      stroke-linecap="round"
                      stroke-dasharray="${donutCircumference.toFixed(2)}"
                      stroke-dashoffset="${donutDashOffset.toFixed(2)}"
                      filter="url(#anaGlow)"
                    />
                    <!-- Inner photo archive track -->
                    <circle cx="100" cy="100" r="${innerRadius}" fill="none" stroke="rgba(245, 158, 11, 0.14)" stroke-width="6" />
                    <!-- Inner photo archive arc -->
                    <circle
                      class="ana-donut-arc"
                      cx="100" cy="100" r="${innerRadius}"
                      fill="none"
                      stroke="url(#anaPhotoGrad)"
                      stroke-width="6"
                      stroke-linecap="round"
                      stroke-dasharray="${innerCircumference.toFixed(2)}"
                      stroke-dashoffset="${innerDashOffset.toFixed(2)}"
                    />
                  </svg>
                  <div class="ana-donut-center">
                    <span class="ana-donut-pct">%${progressPct.toFixed(1)}</span>
                    <span class="ana-donut-label">Keşif Oranı</span>
                    <span class="ana-donut-sub">${visitedCount} / ${totalCities} İl</span>
                  </div>
                </div>

                <div class="ana-gauge-stats">
                  <div class="ana-stat-row">
                    <span class="ana-stat-left"><span class="ana-dot ana-dot-visited"></span> Gezilen İl</span>
                    <span class="ana-stat-val" style="color: var(--accent-emerald, #10b981);">${visitedCount}</span>
                  </div>
                  <div class="ana-stat-row">
                    <span class="ana-stat-left"><span class="ana-dot ana-dot-remaining"></span> Kalan İl</span>
                    <span class="ana-stat-val">${remainingCount}</span>
                  </div>
                  <div class="ana-stat-row">
                    <span class="ana-stat-left"><span class="ana-dot ana-dot-photo"></span> Fotoğraf Arşivi</span>
                    <span class="ana-stat-val" style="color: var(--accent-gold, #f59e0b);">${totalPhotos}/${photoTarget}</span>
                  </div>
                </div>
              </div>

              <div class="ana-photo-panel">
                <div class="ana-mini-ring">
                  <svg viewBox="0 0 54 54" aria-hidden="true">
                    <circle cx="27" cy="27" r="${miniRadius}" fill="none" stroke="rgba(245, 158, 11, 0.2)" stroke-width="5" />
                    <circle
                      cx="27" cy="27" r="${miniRadius}"
                      fill="none"
                      stroke="#f59e0b"
                      stroke-width="5"
                      stroke-linecap="round"
                      stroke-dasharray="${miniCirc.toFixed(2)}"
                      stroke-dashoffset="${miniOffset.toFixed(2)}"
                    />
                  </svg>
                  <span class="ana-mini-ring-text">%${Math.round(photoPct)}</span>
                </div>
                <div class="ana-photo-info">
                  <div class="ana-photo-title">
                    <span>📸 Görsel Arşiv Tamamlanma</span>
                    <span style="color: var(--accent-gold, #f59e0b);">${totalPhotos} / ${photoTarget}</span>
                  </div>
                  <div class="ana-photo-sub">
                    ${provincesWithTwo}/${totalCities} ilde banner + galeri fotoğrafı eksiksiz arşivlendi.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 7-Region Comparative Horizontal Bar Chart Card -->
          <div class="glass-card ana-card">
            <div class="ana-card-header">
              <h3 class="ana-card-title">🏔️ 7 Bölge Karşılaştırmalı İlerleme</h3>
              <span class="ana-card-badge">Tamamlanma Sırasına Göre</span>
            </div>

            <div class="ana-region-list" id="ana-region-list">
              ${regionBarsHtml}
            </div>

            <div class="ana-region-hint">
              <span>💡 Bir bölgeye tıklayarak 81 plaka matrisinde o bölgenin illerini vurgulayabilirsiniz.</span>
              <button type="button" class="ana-reset-btn" id="ana-region-reset" style="display:none;">Tüm Bölgeler</button>
            </div>
          </div>
        </div>

        <!-- Interactive 81-Plate 9x9 Matrix -->
        <div class="glass-card ana-card">
          <div class="ana-card-header">
            <div>
              <h3 class="ana-card-title">🔢 81 Plaka Isı Haritası (01 → 81 Matris)</h3>
              <p style="font-size:0.78rem; color: var(--text-secondary, #94a3b8); margin-top:3px;">
                Herhangi bir plaka kutusuna tıklayarak o şehrin seyahatname detayını anında açın.
              </p>
            </div>
            <div class="ana-plate-controls" id="ana-plate-filters">
              <button type="button" class="ana-filter-btn is-active" data-plate-filter="all">Tümü (${totalCities})</button>
              <button type="button" class="ana-filter-btn" data-plate-filter="visited">✅ Gezilen (${visitedCount})</button>
              <button type="button" class="ana-filter-btn" data-plate-filter="unvisited">⏳ Bekleyen (${remainingCount})</button>
              <button type="button" class="ana-filter-btn" data-plate-filter="favorites">⭐ Favoriler (${favoritesCount})</button>
            </div>
          </div>

          <div class="ana-plate-matrix-wrap">
            <div class="ana-plate-grid" id="ana-plate-grid">
              ${plateTilesHtml}
            </div>
          </div>

          <div class="ana-plate-legend">
            <div class="ana-legend-items">
              <span class="ana-legend-swatch"><span class="ana-swatch-box ana-swatch-visited"></span> Gezilen İl (${visitedCount})</span>
              <span class="ana-legend-swatch"><span class="ana-swatch-box ana-swatch-unvisited"></span> Bekleyen İl (${remainingCount})</span>
              <span class="ana-legend-swatch"><span style="color:var(--accent-gold, #f59e0b);">★</span> Favori İl (${favoritesCount})</span>
            </div>
            <div class="ana-export-wrap">
              <button type="button" class="ana-export-btn" id="ana-export-toggle" aria-expanded="false">
                📥 81 Plaka Durum Tablosunu CSV / Markdown İndir
              </button>
              <div class="ana-export-choices" id="ana-export-choices">
                <button type="button" class="ana-export-opt" data-ana-export="csv">📄 CSV (.csv)</button>
                <button type="button" class="ana-export-opt" data-ana-export="md">📝 Markdown (.md)</button>
              </div>
              <span id="ana-active-filter-label">Gösterilen: ${totalCities} İl (9×9 Matris)</span>
            </div>
          </div>
        </div>

        <!-- Geographic Extremes & Fun Facts -->
        <div class="ana-bottom-grid">
          <div class="glass-card ana-card">
            <div class="ana-card-header">
              <h3 class="ana-card-title">🧭 Coğrafi Uç Noktalar (Gezilen İller)</h3>
              <span class="ana-card-badge">Enlem &amp; Boylam</span>
            </div>
            <div class="ana-extremes-grid" id="ana-extremes-grid">
              ${extremesHtml}
            </div>
            ${
              extremes
                ? `<div class="ana-region-hint" style="margin-top:12px;">
                    <span>📐 Kuş uçuşu kapsam: Batı–Doğu <strong>${formatNumber(extremes.ewSpanKm)} km</strong> • Kuzey–Güney <strong>${formatNumber(extremes.nsSpanKm)} km</strong></span>
                  </div>`
                : ''
            }
          </div>

          <div class="glass-card ana-card">
            <div class="ana-card-header">
              <h3 class="ana-card-title">✨ Yolculuk Metrikleri &amp; İlginç Veriler</h3>
              <span class="ana-card-badge">Canlı Hesaplama</span>
            </div>
            <div class="ana-facts-grid">
              <div class="ana-fact-box">
                <span class="ana-fact-icon">🗓️</span>
                <span class="ana-fact-val" style="color: var(--accent-cyan, #00f2fe);">${formatNumber(daysOnRoad)} Gün</span>
                <span class="ana-fact-label">Toplam Yol Günü</span>
                <span class="ana-fact-sub">5 Gün Kuralı (İl başı 5 gün)</span>
              </div>
              <div class="ana-fact-box">
                <span class="ana-fact-icon">📚</span>
                <span class="ana-fact-val" style="color: var(--accent-purple, #a855f7);">${formatNumber(libraryHours)} Saat</span>
                <span class="ana-fact-label">Kütüphane Mesaisi</span>
                <span class="ana-fact-sub">İl Halk Kütüphanelerinde üretim</span>
              </div>
              <div class="ana-fact-box">
                <span class="ana-fact-icon">📏</span>
                <span class="ana-fact-val" style="color: var(--accent-emerald, #10b981);">~${formatNumber(distanceMetrics.avgRoadKm)} km</span>
                <span class="ana-fact-label">Ortalama Durak Mesafesi</span>
                <span class="ana-fact-sub">Ardışık duraklar arası (~${formatNumber(distanceMetrics.avgDirectKm)} km kuş uçuşu)</span>
              </div>
              <div class="ana-fact-box">
                <span class="ana-fact-icon">🛣️</span>
                <span class="ana-fact-val" style="color: var(--accent-gold, #f59e0b);">~${formatNumber(estimatedKm)} km</span>
                <span class="ana-fact-label">Tahmini Karayolu İzi</span>
                <span class="ana-fact-sub">${visitedCount} şehir arası keşif menzili</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    // Interactive state for heatmap filtering & region highlight
    let activeStatusFilter = 'all';
    let activeRegionCode = null;

    const plateGrid = container.querySelector('#ana-plate-grid');
    const regionList = container.querySelector('#ana-region-list');
    const resetRegionBtn = container.querySelector('#ana-region-reset');
    const filterContainer = container.querySelector('#ana-plate-filters');
    const activeFilterLabel = container.querySelector('#ana-active-filter-label');
    const extremesGrid = container.querySelector('#ana-extremes-grid');

    function applyMatrixHighlight() {
      if (!plateGrid) return;
      const tiles = plateGrid.querySelectorAll('.ana-plate-tile');
      let matched = 0;

      tiles.forEach((tile) => {
        const isVisited = tile.getAttribute('data-visited') === '1';
        const isFav = tile.getAttribute('data-favorite') === '1';
        const regionCode = tile.getAttribute('data-region-code');
        const statusOk =
          activeStatusFilter === 'all' ||
          (activeStatusFilter === 'visited' && isVisited) ||
          (activeStatusFilter === 'unvisited' && !isVisited) ||
          (activeStatusFilter === 'favorites' && isFav);
        const regionOk = !activeRegionCode || regionCode === activeRegionCode;

        const visible = statusOk && regionOk;
        tile.classList.toggle('is-dimmed', !visible);
        if (visible) matched += 1;
      });

      if (resetRegionBtn) {
        resetRegionBtn.style.display = activeRegionCode ? 'inline-block' : 'none';
      }

      if (activeFilterLabel) {
        if (!activeRegionCode && activeStatusFilter === 'all') {
          activeFilterLabel.textContent = `Gösterilen: ${totalCities} İl (9×9 Matris)`;
        } else {
          const regionObj = regionRows.find((r) => r.code === activeRegionCode);
          const parts = [];
          if (regionObj) parts.push(regionObj.name);
          if (activeStatusFilter === 'visited') parts.push('Gezilen');
          if (activeStatusFilter === 'unvisited') parts.push('Bekleyen');
          if (activeStatusFilter === 'favorites') parts.push('Favoriler');
          activeFilterLabel.textContent = `Vurgulanan: ${matched} İl (${parts.join(' • ')})`;
        }
      }
    }

    // Export 81-Plate Status Table as CSV or Markdown
    function triggerTextDownload(content, filename, mimeType) {
      try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (_) {
        showToast('Dosya indirme işlemi tarayıcı tarafından engellendi.');
      }
    }

    function exportPlateTable(format) {
      const dateStr = new Date().toISOString().slice(0, 10);
      if (format === 'csv') {
        const csvEscape = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
        const header = ['Plaka', 'İl', 'Bölge', 'Durum', 'Favori', 'Enlem', 'Boylam'].join(',');
        const rows = provincesList.map((c) => [
          csvEscape(formatPlate(c.plate)),
          csvEscape(c.name),
          csvEscape(c.region),
          csvEscape(c.visited ? 'Gezilen' : 'Bekleyen'),
          csvEscape(favorites.has(c.key) ? 'Evet' : 'Hayır'),
          Number.isFinite(c.lat) ? c.lat.toFixed(4) : '',
          Number.isFinite(c.lng) ? c.lng.toFixed(4) : ''
        ].join(','));
        const csvContent = '\uFEFF' + [header].concat(rows).join('\n');
        triggerTextDownload(csvContent, `anadolu-81-plaka-durum-${dateStr}.csv`, 'text/csv;charset=utf-8;');
        showToast('📥 81 Plaka Durum Tablosu CSV olarak indirildi!');
      } else {
        const mdLines = [
          '# Anadolu Seyahatnamesi — 81 Plaka Durum Tablosu',
          '',
          `- **Tarih:** ${dateStr}`,
          `- **İlerleme:** ${visitedCount} / ${totalCities} İl (%${progressPct.toFixed(1)})`,
          `- **Favoriler:** ${favoritesCount} İl`,
          '',
          '| Plaka | İl | Bölge | Durum | Favori |',
          '| :---: | :--- | :--- | :---: | :---: |'
        ];
        provincesList.forEach((c) => {
          const safePipe = (s) => String(s || '').replace(/\|/g, '\\|');
          mdLines.push(
            `| ${formatPlate(c.plate)} | ${safePipe(c.name)} | ${safePipe(c.region)} | ${c.visited ? '✅ Gezilen' : '⏳ Bekleyen'} | ${favorites.has(c.key) ? '⭐' : '—'} |`
          );
        });
        triggerTextDownload(mdLines.join('\n') + '\n', `anadolu-81-plaka-durum-${dateStr}.md`, 'text/markdown;charset=utf-8;');
        showToast('📝 81 Plaka Durum Tablosu Markdown (.md) olarak indirildi!');
      }
    }

    const exportToggleBtn = container.querySelector('#ana-export-toggle');
    const exportChoicesEl = container.querySelector('#ana-export-choices');
    if (exportToggleBtn && exportChoicesEl) {
      exportToggleBtn.addEventListener('click', () => {
        const nextOpen = !exportChoicesEl.classList.contains('is-open');
        exportChoicesEl.classList.toggle('is-open', nextOpen);
        exportToggleBtn.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
      });
      exportChoicesEl.addEventListener('click', (e) => {
        const opt = e.target.closest('[data-ana-export]');
        if (!opt) return;
        exportPlateTable(opt.getAttribute('data-ana-export'));
        exportChoicesEl.classList.remove('is-open');
        exportToggleBtn.setAttribute('aria-expanded', 'false');
      });
    }

    // Status Filter Buttons
    if (filterContainer) {
      filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.ana-filter-btn');
        if (!btn) return;
        activeStatusFilter = btn.getAttribute('data-plate-filter') || 'all';
        filterContainer.querySelectorAll('.ana-filter-btn').forEach((b) => {
          b.classList.toggle('is-active', b === btn);
        });
        applyMatrixHighlight();
      });
    }

    // Region Bar Click / Keyboard Toggle
    function toggleRegionSelection(rowEl) {
      if (!rowEl || !regionList) return;
      const code = rowEl.getAttribute('data-region-code');
      activeRegionCode = activeRegionCode === code ? null : code;
      regionList.querySelectorAll('.ana-region-row').forEach((r) => {
        r.classList.toggle('is-active', r.getAttribute('data-region-code') === activeRegionCode);
      });
      applyMatrixHighlight();
    }

    if (regionList) {
      regionList.addEventListener('click', (e) => {
        const row = e.target.closest('.ana-region-row');
        if (row) toggleRegionSelection(row);
      });
      regionList.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const row = e.target.closest('.ana-region-row');
          if (row) {
            e.preventDefault();
            toggleRegionSelection(row);
          }
        }
      });
    }

    if (resetRegionBtn) {
      resetRegionBtn.addEventListener('click', () => {
        activeRegionCode = null;
        if (regionList) {
          regionList.querySelectorAll('.ana-region-row').forEach((r) => r.classList.remove('is-active'));
        }
        applyMatrixHighlight();
      });
    }

    // Floating Tooltip for 81-Plate Matrix
    let tooltipEl = document.getElementById('ana-floating-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'ana-floating-tooltip';
      tooltipEl.className = 'ana-tooltip';
      tooltipEl.setAttribute('role', 'tooltip');
      document.body.appendChild(tooltipEl);
    }

    function positionTooltip(clientX, clientY) {
      const pad = 14;
      const rect = tooltipEl.getBoundingClientRect();
      let x = clientX + pad;
      let y = clientY - rect.height - pad;
      if (x + rect.width > window.innerWidth - 10) {
        x = Math.max(10, clientX - rect.width - pad);
      }
      if (y < 10) {
        y = clientY + pad;
      }
      tooltipEl.style.left = x + 'px';
      tooltipEl.style.top = y + 'px';
    }

    function showTileTooltip(tile, event) {
      const plate = tile.getAttribute('data-plate') || '';
      const name = tile.getAttribute('data-name') || '';
      const region = tile.getAttribute('data-region') || '';
      const isVisited = tile.getAttribute('data-visited') === '1';
      const landmark = tile.getAttribute('data-landmark') || '';
      const statusText = isVisited ? 'Gezildi' : 'Planlanan';

      tooltipEl.innerHTML = `
        <div class="ana-tooltip-head">${escapeHtml(plate)} ${escapeHtml(name)}</div>
        <div class="ana-tooltip-status ${isVisited ? 'visited' : 'unvisited'}">
          ${isVisited ? '✅' : '🧭'} ${escapeHtml(region)} • ${statusText}
        </div>
        ${landmark ? `<div class="ana-tooltip-meta">📍 ${escapeHtml(landmark)}</div>` : ''}
      `;
      tooltipEl.classList.add('is-visible');

      if (event && typeof event.clientX === 'number') {
        positionTooltip(event.clientX, event.clientY);
      } else {
        const rect = tile.getBoundingClientRect();
        positionTooltip(rect.left + rect.width / 2, rect.top);
      }
    }

    function hideTileTooltip() {
      if (tooltipEl) {
        tooltipEl.classList.remove('is-visible');
      }
    }

    // Plate Tile Click & Hover Interactions
    if (plateGrid) {
      plateGrid.addEventListener('click', (e) => {
        const tile = e.target.closest('.ana-plate-tile');
        if (!tile) return;
        hideTileTooltip();
        const key = tile.getAttribute('data-city-key');
        if (key) selectCity(key);
      });

      plateGrid.addEventListener('mouseover', (e) => {
        const tile = e.target.closest('.ana-plate-tile');
        if (tile) showTileTooltip(tile, e);
      });

      plateGrid.addEventListener('mousemove', (e) => {
        const tile = e.target.closest('.ana-plate-tile');
        if (tile && tooltipEl.classList.contains('is-visible')) {
          positionTooltip(e.clientX, e.clientY);
        }
      });

      plateGrid.addEventListener('mouseout', (e) => {
        const tile = e.target.closest('.ana-plate-tile');
        if (tile && !tile.contains(e.relatedTarget)) {
          hideTileTooltip();
        }
      });

      plateGrid.addEventListener('focusin', (e) => {
        const tile = e.target.closest('.ana-plate-tile');
        if (tile) showTileTooltip(tile, null);
      });

      plateGrid.addEventListener('focusout', () => {
        hideTileTooltip();
      });
    }

    // Geographic Extremes Click -> Open City Detail
    if (extremesGrid) {
      extremesGrid.addEventListener('click', (e) => {
        const item = e.target.closest('.ana-extreme-item');
        if (!item) return;
        const key = item.getAttribute('data-city-key');
        if (key) selectCity(key);
      });
    }
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.analytics = { render };
})();
