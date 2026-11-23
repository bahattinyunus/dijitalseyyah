/* ==========================================================================
   Dijital Seyyah — City Monuments Bridge, Reading Time & Neighbor Quick-Jump
   Automatically enhances any #city/<key> view with:
     1. Authentic Monument & Heritage Photos belonging to that province
     2. Nearest 4 Neighboring Provinces (Haversine road km) quick-jump chips
     3. Estimated Reading Time badge for the city dossier
   ========================================================================== */
(function () {
  'use strict';

  const WIDGET_ID = 'seyyah-city-monuments-bridge';
  let lastRenderedKey = null;

  function calcRoadKm(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const air = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(air * 1.35);
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getNearestNeighbors(provinces, currentKey, count) {
    const origin = provinces[currentKey];
    if (!origin || typeof origin.lat !== 'number') return [];
    return Object.keys(provinces)
      .filter((k) => k !== currentKey && provinces[k] && typeof provinces[k].lat === 'number')
      .map((k) => ({
        key: k,
        prov: provinces[k],
        km: calcRoadKm(origin.lat, origin.lng, provinces[k].lat, provinces[k].lng)
      }))
      .sort((a, b) => a.km - b.km)
      .slice(0, count);
  }

  function estimateReadMinutes(viewport) {
    const words = (viewport.textContent || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 190));
  }

  function injectBridge() {
    const hash = window.location.hash || '';
    if (!hash.startsWith('#city/')) {
      lastRenderedKey = null;
      return;
    }

    const viewport = document.getElementById('viewport-content');
    if (!viewport) return;

    const cityKey = decodeURIComponent(hash.slice('#city/'.length));
    if (document.getElementById(WIDGET_ID) && lastRenderedKey === cityKey) {
      return;
    }

    const raw = window.TRAVEL_DATA || window.SEYYAH_DATA || null;
    if (!raw || !raw.provinces || !raw.provinces[cityKey]) return;

    const existing = document.getElementById(WIDGET_ID);
    if (existing) existing.remove();

    const province = raw.provinces[cityKey];
    const catalog = Array.isArray(window.SEYYAH_MONUMENTS_CATALOG) ? window.SEYYAH_MONUMENTS_CATALOG : [];
    const cityMonuments = catalog.filter(
      (item) => Array.isArray(item.provinces) && item.provinces.includes(cityKey)
    );
    const neighbors = getNearestNeighbors(raw.provinces, cityKey, 4);
    const readMin = estimateReadMinutes(viewport);

    const section = document.createElement('section');
    section.id = WIDGET_ID;
    section.className = 'glass-card city-bridge-section';

    const monumentsHtml = cityMonuments.length
      ? `
        <div class="city-bridge-header">
          <div>
            <h3>🏛️ ${escapeHtml(province.name)} Özgün Anıt &amp; Miras Arşivi</h3>
            <p class="city-bridge-sub">Bu ile ait ${cityMonuments.length} gerçek miras fotoğrafı — büyütmek için görsele tıklayın.</p>
          </div>
          <span class="city-bridge-pill">⏱️ ~${readMin} dk okuma</span>
        </div>
        <div class="city-monuments-grid">
          ${cityMonuments
            .map(
              (m) => `
            <article class="city-monument-card">
              <div class="city-monument-img-wrap">
                <img src="${escapeHtml(m.src)}" alt="${escapeHtml(m.title)}" loading="lazy" decoding="async" />
                <a class="city-monument-cat" href="#${escapeHtml(m.view)}" title="${escapeHtml(m.category)} stüdyosuna git">
                  ${escapeHtml(m.category)} ➔
                </a>
              </div>
              <div class="city-monument-body">
                <h4>${escapeHtml(m.title)}</h4>
              </div>
            </article>
          `
            )
            .join('')}
        </div>
      `
      : `
        <div class="city-bridge-header">
          <div>
            <h3>🧭 ${escapeHtml(province.name)} Menzil Bağlantıları</h3>
            <p class="city-bridge-sub">Karayolu komşuluk ağı ve hızlı geçiş menzilleri.</p>
          </div>
          <span class="city-bridge-pill">⏱️ ~${readMin} dk okuma</span>
        </div>
      `;

    const neighborsHtml = neighbors.length
      ? `
        <div class="city-neighbors-wrap">
          <div class="city-neighbors-label">📍 En Yakın 4 Komşu İl (Tahmini Karayolu):</div>
          <div class="city-neighbors-row">
            ${neighbors
              .map((n) => {
                const statusIcon = n.prov.visited ? '✅' : '⏳';
                const plate = String(n.prov.plate || 0).padStart(2, '0');
                return `
                  <a class="city-neighbor-chip ${n.prov.visited ? 'visited' : ''}" href="#city/${encodeURIComponent(n.key)}">
                    <span>${statusIcon} <strong>${plate}</strong> ${escapeHtml(n.prov.name)}</span>
                    <small>~${n.km} km</small>
                  </a>
                `;
              })
              .join('')}
          </div>
        </div>
      `
      : '';

    section.innerHTML = `${monumentsHtml}${neighborsHtml}`;
    viewport.appendChild(section);
    lastRenderedKey = cityKey;
  }

  let debounceTimer = null;
  function scheduleInject() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(injectBridge, 140);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('viewport-content');
    if (viewport && typeof MutationObserver !== 'undefined') {
      const obs = new MutationObserver(() => {
        if ((window.location.hash || '').startsWith('#city/') && !document.getElementById(WIDGET_ID)) {
          scheduleInject();
        }
      });
      obs.observe(viewport, { childList: true });
    }
    window.addEventListener('hashchange', scheduleInject);
    scheduleInject();
  });

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.cityMonumentsBridge = {
    refresh: injectBridge
  };
})();
