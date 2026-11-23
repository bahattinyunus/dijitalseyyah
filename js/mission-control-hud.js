/* ==========================================================================
   Dijital Seyyah — Sefer Komuta Merkezi (Mission Control & Expedition Matrix)
   Interactive futuristic mission planner for the remaining unvisited provinces:
     - Departure city selector + Region filter + Smart Priority Scoring
     - Live Custom Mission Queue with real-time 2-Opt distance optimization
     - Instant GPX 1.1 & RFC 7946 GeoJSON export of your custom mission
     - 7-Region Holographic Completion Matrix
   Registers on window.SEYYAH_MODULES.missionControl = { render(container, ctx) }
   ========================================================================== */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const QUEUE_STORAGE_KEY = 'dijital_seyyah_mission_queue_v1';

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function haversineAirKm(lat1, lng1, lat2, lng2) {
    const R = 6371.0;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function roadKm(a, b) {
    return Math.round(haversineAirKm(a.lat, a.lng, b.lat, b.lng) * 1.35);
  }

  function twoOptOptimize(stops) {
    if (stops.length <= 3) return stops;
    const distOf = (seq) => {
      let sum = 0;
      for (let i = 0; i < seq.length - 1; i++) sum += roadKm(seq[i], seq[i + 1]);
      return sum;
    };
    let best = stops.slice();
    let bestDist = distOf(best);
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 1; i < best.length - 1; i++) {
        for (let j = i + 1; j < best.length; j++) {
          const cand = best.slice(0, i).concat(best.slice(i, j + 1).reverse(), best.slice(j + 1));
          const d = distOf(cand);
          if (d + 1 < bestDist) {
            best = cand;
            bestDist = d;
            improved = true;
          }
        }
      }
    }
    return best;
  }

  function loadQueue() {
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveQueue(keys) {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(keys));
    } catch (e) {}
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 250);
  }

  function buildGpx(stops) {
    const wpts = stops
      .map(
        (s, idx) =>
          `  <wpt lat="${s.lat}" lon="${s.lng}"><name>${String(idx + 1).padStart(2, '0')} - ${escapeHtml(s.name)}</name><desc>${escapeHtml(s.region || '')}</desc></wpt>`
      )
      .join('\n');
    const rtepts = stops
      .map((s) => `    <rtept lat="${s.lat}" lon="${s.lng}"><name>${escapeHtml(s.name)}</name></rtept>`)
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Dijital Seyyah Mission Control" xmlns="http://www.topografix.com/GPX/1/1">\n${wpts}\n  <rte>\n    <name>Dijital Seyyah Ozel Sefer Rotasi</name>\n${rtepts}\n  </rte>\n</gpx>`;
  }

  function render(container, ctx) {
    const data = (ctx && ctx.data) || window.TRAVEL_DATA || {};
    const provincesObj = data.provinces || {};
    const regionsObj = (data.stats && data.stats.regional_breakdown) || {};
    const catalog = Array.isArray(window.SEYYAH_MONUMENTS_CATALOG) ? window.SEYYAH_MONUMENTS_CATALOG : [];

    // Count monuments per province key
    const monCount = {};
    catalog.forEach((m) => {
      (m.provinces || []).forEach((pk) => {
        monCount[pk] = (monCount[pk] || 0) + 1;
      });
    });

    const allList = Object.entries(provincesObj)
      .map(([key, p]) => ({ key, ...p, monumentsCount: monCount[key] || 0 }))
      .sort((a, b) => (a.plate || 0) - (b.plate || 0));

    const unvisitedList = allList.filter((p) => !p.visited);
    let queueKeys = loadQueue().filter((k) => provincesObj[k]);

    const ui = {
      originKey: provincesObj['04_IcAnadolu/Ankara'] ? '04_IcAnadolu/Ankara' : (allList[0] ? allList[0].key : ''),
      regionFilter: 'all',
      sortBy: 'smart' // 'smart' | 'distance' | 'monuments' | 'plate'
    };

    function getOptimizedMission() {
      const origin = provincesObj[ui.originKey];
      if (!origin || !queueKeys.length) return { stops: origin ? [{ key: ui.originKey, ...origin }] : [], totalKm: 0 };
      const rawStops = [{ key: ui.originKey, ...origin }].concat(
        queueKeys.filter((k) => k !== ui.originKey).map((k) => ({ key: k, ...provincesObj[k] }))
      );
      const opt = twoOptOptimize(rawStops);
      let totalKm = 0;
      for (let i = 0; i < opt.length - 1; i++) totalKm += roadKm(opt[i], opt[i + 1]);
      return { stops: opt, totalKm };
    }

    function draw() {
      const origin = provincesObj[ui.originKey] || allList[0];
      const mission = getOptimizedMission();
      const newStopsCount = Math.max(0, mission.stops.length - 1);
      const seferDays = newStopsCount * 5;
      const libHours = newStopsCount * 20;
      const driveHours = (mission.totalKm / 80).toFixed(1);

      const candidates = unvisitedList
        .filter((p) => ui.regionFilter === 'all' || p.region_code === ui.regionFilter)
        .map((p) => {
          const dist = origin ? roadKm(origin, p) : 0;
          const regStat = regionsObj[p.region_code];
          const regPct = regStat ? regStat.percentage : 0;
          // Smart priority: closer + more monuments + region closer to completion
          const score = Math.max(10, Math.round(100 - dist / 18 + p.monumentsCount * 14 + regPct * 0.25));
          return { ...p, distKm: dist, smartScore: score };
        });

      if (ui.sortBy === 'distance') candidates.sort((a, b) => a.distKm - b.distKm);
      else if (ui.sortBy === 'monuments') candidates.sort((a, b) => (b.monumentsCount - a.monumentsCount) || (a.distKm - b.distKm));
      else if (ui.sortBy === 'plate') candidates.sort((a, b) => a.plate - b.plate);
      else candidates.sort((a, b) => b.smartScore - a.smartScore);

      const regionCardsHtml = Object.entries(regionsObj)
        .map(([code, r]) => {
          const active = ui.regionFilter === code ? 'active' : '';
          return `
            <button type="button" class="mc-reg-card ${active}" data-mc-reg="${escapeHtml(code)}">
              <div class="mc-reg-top">
                <span>${r.icon || '📍'} ${escapeHtml(r.name.replace(' Bölgesi', ''))}</span>
                <strong>%${r.percentage}</strong>
              </div>
              <div class="mc-reg-bar"><span style="width:${r.percentage}%"></span></div>
              <small>${r.visited}/${r.total} tamamlandı • ${r.total - r.visited} hedef</small>
            </button>
          `;
        })
        .join('');

      container.innerHTML = `
        <div class="mc-studio">
          <div class="mc-header glass-card">
            <div>
              <span class="holo-kicker">🎛️ MISSION CONTROL • 2-OPT EXPEDITION PLANNER</span>
              <h2>🎛️ Sefer Komuta Merkezi &amp; Hedef Matrisi</h2>
              <p>Keşfedilmeyi bekleyen ${unvisitedList.length} ili mesafe, anıt yoğunluğu ve bölge tamamlama skoruna göre analiz edin; kendi 2-Opt optimize seferinizi kurup GPX / GeoJSON indirin.</p>
            </div>
            <div class="mc-origin-box">
              <label for="mc-origin-select">🚀 Kalkış Merkezi</label>
              <select id="mc-origin-select">
                ${allList
                  .map(
                    (p) =>
                      `<option value="${escapeHtml(p.key)}" ${p.key === ui.originKey ? 'selected' : ''}>${String(p.plate).padStart(2, '0')} — ${escapeHtml(p.name)}</option>`
                  )
                  .join('')}
              </select>
            </div>
          </div>

          <div class="mc-regions-strip">
            <button type="button" class="mc-reg-card ${ui.regionFilter === 'all' ? 'active' : ''}" data-mc-reg="all">
              <div class="mc-reg-top"><span>🇹🇷 Tüm Bölgeler</span><strong>${unvisitedList.length}</strong></div>
              <div class="mc-reg-bar"><span style="width:${data.stats ? data.stats.progress_pct : 48}%"></span></div>
              <small>81 il genelinde bekleyenler</small>
            </button>
            ${regionCardsHtml}
          </div>

          <div class="mc-main-grid">
            <section class="mc-targets-panel glass-card">
              <div class="mc-panel-head">
                <h3>🎯 Sıradaki Hedef Adayları (${candidates.length} İl)</h3>
                <div class="mc-sort-pills">
                  <button type="button" class="fow-chip ${ui.sortBy === 'smart' ? 'active' : ''}" data-mc-sort="smart">⚡ Akıllı Skor</button>
                  <button type="button" class="fow-chip ${ui.sortBy === 'distance' ? 'active' : ''}" data-mc-sort="distance">📏 En Yakın</button>
                  <button type="button" class="fow-chip ${ui.sortBy === 'monuments' ? 'active' : ''}" data-mc-sort="monuments">🏛️ Anıt Yoğunluğu</button>
                  <button type="button" class="fow-chip ${ui.sortBy === 'plate' ? 'active' : ''}" data-mc-sort="plate">🔢 Plaka</button>
                </div>
              </div>
              <div class="mc-targets-grid">
                ${candidates
                  .map((c) => {
                    const inQueue = queueKeys.includes(c.key);
                    return `
                      <article class="mc-target-card ${inQueue ? 'queued' : ''}">
                        <div class="mc-target-img">
                          <img src="${escapeHtml(c.banner_rel || 'assets/banner.jpg')}" alt="${escapeHtml(c.name)}" loading="lazy" decoding="async" />
                          <span class="mc-score-pill">SKOR ${c.smartScore}</span>
                        </div>
                        <div class="mc-target-body">
                          <div class="mc-target-title">
                            <strong>${String(c.plate).padStart(2, '0')} ${escapeHtml(c.name)}</strong>
                            <span>~${c.distKm} km</span>
                          </div>
                          <div class="mc-target-meta">${escapeHtml(c.region)} ${c.monumentsCount ? `• 🏛️ ${c.monumentsCount} anıt` : ''}</div>
                          <div class="mc-target-actions">
                            <button type="button" class="mc-q-btn ${inQueue ? 'remove' : ''}" data-mc-toggle="${escapeHtml(c.key)}">
                              ${inQueue ? '✓ Rotada (Çıkar)' : '+ Rotaya Ekle'}
                            </button>
                            <a class="mc-view-link" href="#city/${encodeURIComponent(c.key)}">İncele ➔</a>
                          </div>
                        </div>
                      </article>
                    `;
                  })
                  .join('')}
              </div>
            </section>

            <aside class="mc-queue-panel glass-card">
              <div class="mc-panel-head">
                <h3>🛰️ Özel Sefer Kuyruğu</h3>
                ${queueKeys.length ? '<button type="button" class="mc-clear-btn" id="mc-btn-clear">Temizle</button>' : ''}
              </div>
              <div class="mc-queue-stats">
                <div><small>2-Opt Mesafe</small><strong>${mission.totalKm.toLocaleString('tr-TR')} km</strong></div>
                <div><small>Sürüş</small><strong>~${driveHours} sa</strong></div>
                <div><small>5 Gün Kuralı</small><strong>${seferDays} gün</strong></div>
                <div><small>Kütüphane</small><strong>${libHours} sa</strong></div>
              </div>
              <div class="mc-queue-list">
                ${
                  newStopsCount
                    ? mission.stops
                        .map(
                          (st, idx) => `
                        <div class="mc-queue-item ${idx === 0 ? 'origin' : ''}">
                          <span class="mc-step-num">${idx === 0 ? '🚀' : idx}</span>
                          <div class="mc-step-info">
                            <strong>${String(st.plate).padStart(2, '0')} ${escapeHtml(st.name)}</strong>
                            <small>${idx === 0 ? 'Kalkış Merkezi' : `+${roadKm(mission.stops[idx - 1], st)} km`}</small>
                          </div>
                          ${idx > 0 ? `<button type="button" class="mc-rm-x" data-mc-toggle="${escapeHtml(st.key)}" title="Çıkar">&times;</button>` : ''}
                        </div>
                      `
                        )
                        .join('')
                    : `<div class="mc-empty-queue">Soldaki illerden "+ Rotaya Ekle" diyerek kendi 2-Opt optimize seferini oluştur veya otomatik 5 duraklı öneri kur.</div>`
                }
              </div>
              <div class="mc-queue-actions">
                <button type="button" class="fow-play-btn" id="mc-btn-auto5" style="width:100%">⚡ En Akıllı 5 Durağı Otomatik Kur</button>
                <div class="mc-export-row">
                  <button type="button" class="fow-action-btn" id="mc-btn-gpx" ${newStopsCount ? '' : 'disabled'}>📡 GPX 1.1</button>
                  <button type="button" class="fow-action-btn gold" id="mc-btn-geo" ${newStopsCount ? '' : 'disabled'}>🗺️ GeoJSON</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      `;

      // Bindings
      container.querySelector('#mc-origin-select').addEventListener('change', (e) => {
        ui.originKey = e.target.value;
        draw();
      });

      container.querySelectorAll('[data-mc-reg]').forEach((btn) => {
        btn.addEventListener('click', () => {
          ui.regionFilter = btn.getAttribute('data-mc-reg') || 'all';
          draw();
        });
      });

      container.querySelectorAll('[data-mc-sort]').forEach((btn) => {
        btn.addEventListener('click', () => {
          ui.sortBy = btn.getAttribute('data-mc-sort') || 'smart';
          draw();
        });
      });

      container.querySelectorAll('[data-mc-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const k = btn.getAttribute('data-mc-toggle');
          if (!k) return;
          if (queueKeys.includes(k)) queueKeys = queueKeys.filter((x) => x !== k);
          else queueKeys.push(k);
          saveQueue(queueKeys);
          draw();
        });
      });

      const clearBtn = container.querySelector('#mc-btn-clear');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          queueKeys = [];
          saveQueue(queueKeys);
          draw();
        });
      }

      container.querySelector('#mc-btn-auto5').addEventListener('click', () => {
        queueKeys = candidates.slice(0, 5).map((c) => c.key);
        saveQueue(queueKeys);
        draw();
        if (ctx && typeof ctx.showToast === 'function') {
          ctx.showToast('⚡ En yüksek skorlu 5 hedef 2-Opt ile optimize edildi!');
        }
      });

      container.querySelector('#mc-btn-gpx').addEventListener('click', () => {
        if (!newStopsCount) return;
        downloadFile(
          `dijital-seyyah-ozel-sefer-${new Date().toISOString().slice(0, 10)}.gpx`,
          buildGpx(mission.stops),
          'application/gpx+xml;charset=utf-8'
        );
        if (ctx && typeof ctx.showToast === 'function') ctx.showToast('📡 Özel sefer GPX 1.1 olarak indirildi!');
      });

      container.querySelector('#mc-btn-geo').addEventListener('click', () => {
        if (!newStopsCount) return;
        const fc = {
          type: 'FeatureCollection',
          name: 'Dijital_Seyyah_Ozel_Sefer',
          features: mission.stops.map((s, idx) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
            properties: { order: idx + 1, plate: s.plate, name: s.name, region: s.region }
          }))
        };
        downloadFile(
          `dijital-seyyah-ozel-sefer-${new Date().toISOString().slice(0, 10)}.geojson`,
          JSON.stringify(fc, null, 2),
          'application/geo+json;charset=utf-8'
        );
        if (ctx && typeof ctx.showToast === 'function') ctx.showToast('🗺️ Özel sefer GeoJSON olarak indirildi!');
      });
    }

    draw();
  }

  window.SEYYAH_MODULES.missionControl = { render };
})();
