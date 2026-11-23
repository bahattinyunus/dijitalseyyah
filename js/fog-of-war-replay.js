/* ==========================================================================
   Dijital Seyyah — Fog of War, Isı Haritası & Bezier Sefer Replay Stüdyosu
   Inspired by Dawarich (Fog of War + Heatmap), TripTrail & Lil-Mappo (Bezier
   Route Replay + In-Browser WebM Video Export) & AdventureLog (Scratch Stats).
   Zero-dependency HiDPI HTML5 Canvas engine.
   Registers on window.SEYYAH_MODULES.fogReplay = { render(container, ctx), stop() }
   ========================================================================== */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const TURKEY_BOUNDS = {
    minLng: 25.4,
    maxLng: 45.2,
    minLat: 35.6,
    maxLat: 42.4
  };

  // Stylized simplified Turkey coastline polygon (lng, lat) for crisp vector silhouette
  const ANATOLIA_OUTLINE = [
    [26.1, 40.1], [26.8, 41.2], [27.9, 41.9], [29.0, 41.2], [30.5, 41.1],
    [32.3, 41.7], [34.9, 42.0], [36.3, 41.4], [38.0, 41.0], [39.7, 41.0],
    [41.5, 41.5], [43.5, 41.1], [44.8, 39.7], [44.3, 38.2], [44.7, 37.2],
    [42.4, 37.1], [40.5, 37.1], [38.7, 36.7], [36.6, 36.8], [36.0, 35.9],
    [35.4, 36.6], [34.2, 36.5], [32.9, 36.1], [31.5, 36.7], [30.4, 36.2],
    [29.1, 36.6], [27.4, 37.0], [27.0, 38.4], [26.3, 39.4], [26.1, 40.1]
  ];

  const REGION_COLORS = {
    '01_Marmara': '#38bdf8',
    '02_Ege': '#34d399',
    '03_Akdeniz': '#f59e0b',
    '04_IcAnadolu': '#fbbf24',
    '05_Karadeniz': '#10b981',
    '06_DoguAnadolu': '#a855f7',
    '07_GuneydoguAnadolu': '#f97316'
  };

  const VEHICLES = {
    road: { icon: '🚌', label: 'Karayolu' },
    flight: { icon: '✈️', label: 'Uçuş' },
    train: { icon: '🚂', label: 'Ekspres' },
    caravan: { icon: '🐪', label: 'Kervan' }
  };

  let rafId = null;
  let activeRecorder = null;
  let recordedChunks = [];

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function haversineRoadKm(lat1, lng1, lat2, lng2) {
    const R = 6371.0;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.35);
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (activeRecorder && activeRecorder.state === 'recording') {
      try { activeRecorder.stop(); } catch (e) {}
    }
    activeRecorder = null;
  }

  function render(container, ctx) {
    stop();

    const data = (ctx && ctx.data) || window.TRAVEL_DATA || {};
    const provincesObj = data.provinces || {};
    const allProvinces = Object.entries(provincesObj)
      .map(([key, p]) => ({ key, ...p }))
      .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
      .sort((a, b) => (a.plate || 0) - (b.plate || 0));

    // Build chronological west-to-east expedition sequence of visited provinces
    const visitedSeq = allProvinces
      .filter((p) => p.visited)
      .sort((a, b) => (a.lng - b.lng) || (a.lat - b.lat));

    // Precompute cumulative km along sequence
    let cumKm = 0;
    const legs = visitedSeq.map((city, idx) => {
      const segKm = idx === 0
        ? 0
        : haversineRoadKm(visitedSeq[idx - 1].lat, visitedSeq[idx - 1].lng, city.lat, city.lng);
      cumKm += segKm;
      return {
        ...city,
        stopIndex: idx,
        segKm,
        cumKm,
        cumDays: (idx + 1) * 5
      };
    });

    const totalStops = legs.length;
    const totalKm = legs.length ? legs[legs.length - 1].cumKm : 0;
    const uncoveredPct = allProvinces.length
      ? ((visitedSeq.length / allProvinces.length) * 100).toFixed(1)
      : '0.0';

    const state = {
      playing: true,
      speed: 1,
      progress: 0, // 0 .. totalStops - 1
      layers: {
        fog: true,
        heat: false,
        arcs: true,
        allCities: true
      },
      vehicle: 'road',
      hoverCity: null,
      recording: false,
      lastFrameTs: performance.now(),
      pulsePhase: 0
    };

    container.innerHTML = `
      <div class="fow-studio">
        <div class="fow-header glass-card">
          <div>
            <span class="fow-kicker">🌫️ DAWARICH FOG-OF-WAR • ✈️ TRIPTRAIL BEZIER REPLAY</span>
            <h2>🌫️ Fog of War &amp; Sinematik Sefer Replay</h2>
            <p>Anadolu'da açılan keşif sisi, termal yoğunluk ısı haritası ve 39 illik animasyonlu Bezier sefer yaylarını 60 FPS izleyin; HD PNG poster veya WebM video kaydedin.</p>
          </div>
          <div class="fow-kpi-row">
            <div class="fow-kpi">
              <strong id="fow-kpi-pct">%${uncoveredPct}</strong>
              <span>Açılan Anadolu</span>
            </div>
            <div class="fow-kpi">
              <strong id="fow-kpi-km">${totalKm.toLocaleString('tr-TR')} km</strong>
              <span>Sefer Yayı</span>
            </div>
            <div class="fow-kpi">
              <strong>${totalStops} / ${allProvinces.length}</strong>
              <span>Menzil</span>
            </div>
          </div>
        </div>

        <div class="fow-toolbar glass-card">
          <div class="fow-layer-group">
            <button type="button" class="fow-chip active" data-layer="fog">🌫️ Fog of War</button>
            <button type="button" class="fow-chip" data-layer="heat">🔥 Isı Haritası</button>
            <button type="button" class="fow-chip active" data-layer="arcs">✨ Bezier Yaylar</button>
            <button type="button" class="fow-chip active" data-layer="allCities">🗺️ 81 İl Ağı</button>
          </div>
          <div class="fow-vehicle-group">
            ${Object.entries(VEHICLES)
              .map(
                ([k, v]) =>
                  `<button type="button" class="fow-vbtn ${k === state.vehicle ? 'active' : ''}" data-vehicle="${k}" title="${v.label}">${v.icon}</button>`
              )
              .join('')}
          </div>
          <div class="fow-export-group">
            <button type="button" class="fow-action-btn" id="fow-btn-png">📸 PNG Poster</button>
            <button type="button" class="fow-action-btn gold" id="fow-btn-webm">🎞️ WebM Video</button>
          </div>
        </div>

        <div class="fow-main-grid">
          <div class="fow-canvas-card glass-card">
            <canvas id="fow-canvas" aria-label="Anadolu Fog of War ve Sefer Replay Haritası"></canvas>
            <div class="fow-canvas-tooltip" id="fow-tooltip" hidden></div>
            <div class="fow-recording-pill" id="fow-rec-pill" hidden>● KAYIT ALINIYOR (WebM)</div>
          </div>

          <aside class="fow-telemetry-card glass-card" id="fow-telemetry">
            <div class="fow-tele-media">
              <img id="fow-tele-img" src="assets/banner.jpg" alt="Aktif Menzil" />
              <span class="fow-tele-badge" id="fow-tele-plate">01 • MARMARA</span>
            </div>
            <div class="fow-tele-body">
              <div class="fow-tele-step" id="fow-tele-step">DURAK 1 / ${totalStops}</div>
              <h3 id="fow-tele-name">Başlatılıyor...</h3>
              <p class="fow-tele-quote" id="fow-tele-quote"></p>
              <div class="fow-tele-metrics">
                <div><small>Kümülatif Yol</small><strong id="fow-tele-km">0 km</strong></div>
                <div><small>Sefer Günü</small><strong id="fow-tele-days">5 gün</strong></div>
              </div>
              <button type="button" class="fow-open-city-btn" id="fow-open-city">📍 Bu Menzili Aç ➔</button>
            </div>
          </aside>
        </div>

        <div class="fow-timeline-bar glass-card">
          <div class="fow-playback-btns">
            <button type="button" class="fow-play-btn" id="fow-btn-play">⏸️ Duraklat</button>
            <button type="button" class="fow-chip" id="fow-btn-restart" title="Baştan Oynat">↺ Başa Sar</button>
          </div>
          <input type="range" id="fow-scrubber" class="fow-scrubber" min="0" max="${Math.max(1, (totalStops - 1) * 100)}" value="0" aria-label="Sefer Zaman Çizelgesi" />
          <div class="fow-speed-group">
            ${[0.5, 1, 2, 4]
              .map(
                (sp) =>
                  `<button type="button" class="fow-speed-btn ${sp === state.speed ? 'active' : ''}" data-speed="${sp}">${sp}x</button>`
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#fow-canvas');
    const c2d = canvas.getContext('2d');
    const tooltip = container.querySelector('#fow-tooltip');
    const scrubber = container.querySelector('#fow-scrubber');
    const playBtn = container.querySelector('#fow-btn-play');
    const recPill = container.querySelector('#fow-rec-pill');
    const webmBtn = container.querySelector('#fow-btn-webm');

    let width = 900;
    let height = 470;
    let lastShownStop = -1;

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = Math.max(320, Math.floor(rect.width));
      height = Math.max(300, Math.min(520, Math.floor(width * 0.52)));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function project(lat, lng) {
      const padX = 36;
      const padY = 34;
      const x =
        padX +
        ((lng - TURKEY_BOUNDS.minLng) / (TURKEY_BOUNDS.maxLng - TURKEY_BOUNDS.minLng)) *
          (width - padX * 2);
      const y =
        padY +
        ((TURKEY_BOUNDS.maxLat - lat) / (TURKEY_BOUNDS.maxLat - TURKEY_BOUNDS.minLat)) *
          (height - padY * 2);
      return { x, y };
    }

    function updateTelemetry(stopIdx) {
      if (!legs.length) return;
      const safeIdx = Math.max(0, Math.min(legs.length - 1, stopIdx));
      if (safeIdx === lastShownStop) return;
      lastShownStop = safeIdx;

      const cur = legs[safeIdx];
      const img = container.querySelector('#fow-tele-img');
      if (img) img.src = cur.banner_rel || 'assets/banner.jpg';
      const plateEl = container.querySelector('#fow-tele-plate');
      if (plateEl) plateEl.textContent = `${String(cur.plate).padStart(2, '0')} • ${(cur.region || '').toUpperCase()}`;
      const stepEl = container.querySelector('#fow-tele-step');
      if (stepEl) stepEl.textContent = `DURAK ${safeIdx + 1} / ${totalStops}`;
      const nameEl = container.querySelector('#fow-tele-name');
      if (nameEl) nameEl.textContent = cur.name;
      const quoteEl = container.querySelector('#fow-tele-quote');
      if (quoteEl) quoteEl.textContent = `"${(cur.custom_quote || cur.quote || '').slice(0, 115)}"`;
      const kmEl = container.querySelector('#fow-tele-km');
      if (kmEl) kmEl.textContent = `${cur.cumKm.toLocaleString('tr-TR')} km`;
      const daysEl = container.querySelector('#fow-tele-days');
      if (daysEl) daysEl.textContent = `${cur.cumDays} gün`;

      const openBtn = container.querySelector('#fow-open-city');
      if (openBtn) {
        openBtn.onclick = () => {
          if (ctx && typeof ctx.selectCity === 'function') {
            ctx.selectCity(cur.key);
          } else {
            window.location.hash = `#city/${encodeURIComponent(cur.key)}`;
          }
        };
      }
    }

    function drawFrame(now) {
      const dt = Math.min(0.05, (now - state.lastFrameTs) / 1000);
      state.lastFrameTs = now;
      state.pulsePhase += dt * 3.2;

      if (state.playing && totalStops > 1) {
        state.progress += dt * 1.25 * state.speed;
        if (state.progress >= totalStops - 1) {
          state.progress = totalStops - 1;
          state.playing = false;
          playBtn.textContent = '▶️ Tekrar Oynat';
        }
        scrubber.value = String(Math.round(state.progress * 100));
      }

      const activeIdx = Math.floor(state.progress);
      updateTelemetry(activeIdx);

      // 1. Deep space-atlas background
      const bg = c2d.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, '#060b18');
      bg.addColorStop(0.5, '#0b1327');
      bg.addColorStop(1, '#070d1c');
      c2d.fillStyle = bg;
      c2d.fillRect(0, 0, width, height);

      // Subtle lat/lng coordinate grid
      c2d.strokeStyle = 'rgba(56, 189, 248, 0.06)';
      c2d.lineWidth = 1;
      for (let lng = 26; lng <= 44; lng += 2) {
        const p1 = project(TURKEY_BOUNDS.maxLat, lng);
        const p2 = project(TURKEY_BOUNDS.minLat, lng);
        c2d.beginPath();
        c2d.moveTo(p1.x, p1.y);
        c2d.lineTo(p2.x, p2.y);
        c2d.stroke();
      }
      for (let lat = 36; lat <= 42; lat += 1) {
        const p1 = project(lat, TURKEY_BOUNDS.minLng);
        const p2 = project(lat, TURKEY_BOUNDS.maxLng);
        c2d.beginPath();
        c2d.moveTo(p1.x, p1.y);
        c2d.lineTo(p2.x, p2.y);
        c2d.stroke();
      }

      // 2. Anatolia Silhouette
      c2d.save();
      c2d.beginPath();
      ANATOLIA_OUTLINE.forEach(([lng, lat], i) => {
        const pt = project(lat, lng);
        if (i === 0) c2d.moveTo(pt.x, pt.y);
        else c2d.lineTo(pt.x, pt.y);
      });
      c2d.closePath();
      c2d.fillStyle = state.layers.fog ? 'rgba(15, 23, 42, 0.86)' : 'rgba(20, 34, 62, 0.72)';
      c2d.fill();
      c2d.strokeStyle = 'rgba(56, 189, 248, 0.28)';
      c2d.lineWidth = 1.5;
      c2d.stroke();
      c2d.restore();

      // 3. Dawarich-style Fog of War luminous clearing circles for reached visited stops
      if (state.layers.fog) {
        c2d.save();
        c2d.globalCompositeOperation = 'lighter';
        for (let i = 0; i <= Math.min(activeIdx, legs.length - 1); i++) {
          const city = legs[i];
          const pt = project(city.lat, city.lng);
          const radius = Math.max(28, width * 0.048);
          const grad = c2d.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, radius);
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.26)');
          grad.addColorStop(0.55, 'rgba(16, 185, 129, 0.10)');
          grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
          c2d.fillStyle = grad;
          c2d.beginPath();
          c2d.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          c2d.fill();
        }
        c2d.restore();
      }

      // 4. Thermal Exploration Heatmap
      if (state.layers.heat) {
        c2d.save();
        c2d.globalCompositeOperation = 'lighter';
        legs.forEach((city) => {
          const pt = project(city.lat, city.lng);
          const r = Math.max(34, width * 0.056);
          const hgrad = c2d.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, r);
          hgrad.addColorStop(0, 'rgba(249, 115, 22, 0.34)');
          hgrad.addColorStop(0.45, 'rgba(245, 158, 11, 0.14)');
          hgrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          c2d.fillStyle = hgrad;
          c2d.beginPath();
          c2d.arc(pt.x, pt.y, r, 0, Math.PI * 2);
          c2d.fill();
        });
        c2d.restore();
      }

      // 5. All 81 Provinces Constellation Dots
      if (state.layers.allCities) {
        allProvinces.forEach((p) => {
          const pt = project(p.lat, p.lng);
          const isHover = state.hoverCity && state.hoverCity.key === p.key;
          const color = p.visited ? (REGION_COLORS[p.region_code] || '#34d399') : 'rgba(148, 163, 184, 0.38)';
          c2d.beginPath();
          c2d.arc(pt.x, pt.y, isHover ? 6.5 : p.visited ? 3.8 : 2.3, 0, Math.PI * 2);
          c2d.fillStyle = isHover ? '#ffffff' : color;
          c2d.fill();
          if (isHover) {
            c2d.strokeStyle = '#38bdf8';
            c2d.lineWidth = 2;
            c2d.stroke();
          }
        });
      }

      // 6. TripTrail / Lil-Mappo Quadratic Bezier Animated Arcs
      if (state.layers.arcs && legs.length > 1) {
        const fullSegs = Math.floor(state.progress);
        const partialT = state.progress - fullSegs;

        for (let i = 0; i < Math.min(fullSegs + 1, legs.length - 1); i++) {
          const a = project(legs[i].lat, legs[i].lng);
          const b = project(legs[i + 1].lat, legs[i + 1].lng);
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2 - Math.min(46, Math.hypot(b.x - a.x, b.y - a.y) * 0.24);
          const tMax = i < fullSegs ? 1 : partialT;

          // Draw arc up to tMax
          c2d.save();
          c2d.beginPath();
          const steps = 24;
          for (let s = 0; s <= steps; s++) {
            const t = (s / steps) * tMax;
            const omt = 1 - t;
            const px = omt * omt * a.x + 2 * omt * t * midX + t * t * b.x;
            const py = omt * omt * a.y + 2 * omt * t * midY + t * t * b.y;
            if (s === 0) c2d.moveTo(px, py);
            else c2d.lineTo(px, py);
          }
          const isCurrent = i === fullSegs;
          c2d.strokeStyle = isCurrent ? '#fbbf24' : 'rgba(56, 189, 248, 0.72)';
          c2d.lineWidth = isCurrent ? 3 : 1.9;
          c2d.shadowColor = isCurrent ? '#fbbf24' : '#38bdf8';
          c2d.shadowBlur = isCurrent ? 14 : 6;
          c2d.stroke();
          c2d.restore();

          // Draw moving traveler beacon on current segment
          if (isCurrent) {
            const t = partialT;
            const omt = 1 - t;
            const bx = omt * omt * a.x + 2 * omt * t * midX + t * t * b.x;
            const by = omt * omt * a.y + 2 * omt * t * midY + t * t * b.y;

            const pulseR = 10 + Math.sin(state.pulsePhase) * 4;
            c2d.beginPath();
            c2d.arc(bx, by, pulseR, 0, Math.PI * 2);
            c2d.fillStyle = 'rgba(251, 191, 36, 0.25)';
            c2d.fill();

            c2d.font = '18px sans-serif';
            c2d.textAlign = 'center';
            c2d.textBaseline = 'middle';
            c2d.fillText((VEHICLES[state.vehicle] || VEHICLES.road).icon, bx, by);
          }
        }
      }

      // Subtle watermark inside canvas (great for PNG/WebM exports!)
      c2d.fillStyle = 'rgba(248, 250, 252, 0.75)';
      c2d.font = '700 12px Outfit, sans-serif';
      c2d.textAlign = 'left';
      c2d.fillText(`DİJİTAL SEYYAH • ANADOLU SEYAHATNAMESİ (${totalStops}/81 İL • %${uncoveredPct})`, 16, height - 14);

      rafId = requestAnimationFrame(drawFrame);
    }

    // Event wiring
    container.querySelectorAll('[data-layer]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-layer');
        state.layers[key] = !state.layers[key];
        btn.classList.toggle('active', state.layers[key]);
      });
    });

    container.querySelectorAll('[data-vehicle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.vehicle = btn.getAttribute('data-vehicle') || 'road';
        container.querySelectorAll('[data-vehicle]').forEach((b) =>
          b.classList.toggle('active', b === btn)
        );
      });
    });

    container.querySelectorAll('[data-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.speed = Number(btn.getAttribute('data-speed')) || 1;
        container.querySelectorAll('[data-speed]').forEach((b) =>
          b.classList.toggle('active', b === btn)
        );
      });
    });

    playBtn.addEventListener('click', () => {
      if (!state.playing && state.progress >= totalStops - 1) {
        state.progress = 0;
      }
      state.playing = !state.playing;
      playBtn.textContent = state.playing ? '⏸️ Duraklat' : '▶️ Oynat';
    });

    container.querySelector('#fow-btn-restart').addEventListener('click', () => {
      state.progress = 0;
      state.playing = true;
      playBtn.textContent = '⏸️ Duraklat';
    });

    scrubber.addEventListener('input', () => {
      state.progress = Number(scrubber.value) / 100;
      state.playing = false;
      playBtn.textContent = '▶️ Oynat';
    });

    // Hover & Click interaction on 81 provinces
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let nearest = null;
      let bestDist = 16;

      for (let i = 0; i < allProvinces.length; i++) {
        const p = allProvinces[i];
        const pt = project(p.lat, p.lng);
        const d = Math.hypot(pt.x - mx, pt.y - my);
        if (d < bestDist) {
          bestDist = d;
          nearest = p;
        }
      }
      state.hoverCity = nearest;
      canvas.style.cursor = nearest ? 'pointer' : 'crosshair';
      if (nearest) {
        tooltip.hidden = false;
        tooltip.style.left = `${Math.min(width - 180, Math.max(10, mx + 14))}px`;
        tooltip.style.top = `${Math.max(10, my - 38)}px`;
        tooltip.innerHTML = `<strong>${String(nearest.plate).padStart(2, '0')} ${escapeHtml(nearest.name)}</strong><span>${nearest.visited ? '✅ Ziyaret Edildi' : '⏳ Bekliyor'} • ${escapeHtml(nearest.region)}</span>`;
      } else {
        tooltip.hidden = true;
      }
    });

    canvas.addEventListener('mouseleave', () => {
      state.hoverCity = null;
      tooltip.hidden = true;
    });

    canvas.addEventListener('click', () => {
      if (state.hoverCity) {
        if (ctx && typeof ctx.selectCity === 'function') {
          ctx.selectCity(state.hoverCity.key);
        } else {
          window.location.hash = `#city/${encodeURIComponent(state.hoverCity.key)}`;
        }
      }
    });

    // HD PNG Poster Export
    container.querySelector('#fow-btn-png').addEventListener('click', () => {
      try {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `dijital-seyyah-fog-of-war-${new Date().toISOString().slice(0, 10)}.png`;
        a.click();
        if (ctx && typeof ctx.showToast === 'function') {
          ctx.showToast('📸 HD Fog of War posteri PNG olarak indirildi!');
        }
      } catch (err) {}
    });

    // In-Browser WebM Video Export (TripTrail / Travelback inspired!)
    webmBtn.addEventListener('click', () => {
      if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
        if (ctx && typeof ctx.showToast === 'function') {
          ctx.showToast('⚠️ Tarayıcınız MediaRecorder WebM kaydını desteklemiyor.');
        }
        return;
      }
      if (state.recording && activeRecorder) {
        activeRecorder.stop();
        return;
      }

      try {
        recordedChunks = [];
        const stream = canvas.captureStream(30);
        const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';
        activeRecorder = new MediaRecorder(stream, { mimeType: mime });
        activeRecorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) recordedChunks.push(ev.data);
        };
        activeRecorder.onstop = () => {
          state.recording = false;
          recPill.hidden = true;
          webmBtn.textContent = '🎞️ WebM Video';
          if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dijital-seyyah-sefer-replay-${new Date().toISOString().slice(0, 10)}.webm`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            if (ctx && typeof ctx.showToast === 'function') {
              ctx.showToast('🎞️ Sefer Replay videosu (.webm) indirildi!');
            }
          }
        };

        state.progress = 0;
        state.speed = 2;
        state.playing = true;
        playBtn.textContent = '⏸️ Duraklat';
        state.recording = true;
        recPill.hidden = false;
        webmBtn.textContent = '⏹️ Kaydı Bitir';
        activeRecorder.start();
      } catch (err) {
        state.recording = false;
        recPill.hidden = true;
      }
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    rafId = requestAnimationFrame(drawFrame);
  }

  window.SEYYAH_MODULES.fogReplay = {
    render,
    stop
  };
})();
