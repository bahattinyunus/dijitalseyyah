/* ==========================================================================
   Dijital Seyyah — 3D Holografik Küre & Anadolu Yörünge Ağı (#holoGlobe)
   Zero-dependency 60 FPS 3D Orthographic Sphere Projection Engine:
     - Interactive 3D drag-to-rotate globe (yaw/pitch) + wheel zoom
     - Real 3D spherical projection of all 81 Turkish provinces
     - Elevated 3D orbital Bezier arcs connecting visited provinces
     - Orbiting telemetry satellites, holographic lat/lng graticule & scan ring
     - Click any 3D city node to jump to its dossier + HD PNG snapshot export
   Registers on window.SEYYAH_MODULES.holoGlobe = { render(container, ctx), stop() }
   ========================================================================== */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const DEG = Math.PI / 180;
  const ANATOLIA_DEFAULT = {
    rotLng: -35.2 * DEG, // Center on Turkey (~35.2E)
    rotLat: 39.0 * DEG,  // Center on Turkey (~39.0N)
    zoom: 2.35           // Close orbital view of Anatolia
  };

  const REGION_COLORS = {
    '01_Marmara': '#00f2fe',
    '02_Ege': '#34d399',
    '03_Akdeniz': '#fbbf24',
    '04_IcAnadolu': '#f59e0b',
    '05_Karadeniz': '#10b981',
    '06_DoguAnadolu': '#c084fc',
    '07_GuneydoguAnadolu': '#fb7185'
  };

  let rafId = null;

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function render(container, ctx) {
    stop();

    const data = (ctx && ctx.data) || window.TRAVEL_DATA || {};
    const provincesObj = data.provinces || {};
    const allProvinces = Object.entries(provincesObj)
      .map(([key, p]) => ({ key, ...p }))
      .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
      .sort((a, b) => (a.plate || 0) - (b.plate || 0));

    const visited = allProvinces
      .filter((p) => p.visited)
      .sort((a, b) => (a.lng - b.lng) || (a.lat - b.lat));

    const state = {
      rotLng: ANATOLIA_DEFAULT.rotLng,
      rotLat: ANATOLIA_DEFAULT.rotLat,
      targetRotLng: ANATOLIA_DEFAULT.rotLng,
      targetRotLat: ANATOLIA_DEFAULT.rotLat,
      zoom: ANATOLIA_DEFAULT.zoom,
      targetZoom: ANATOLIA_DEFAULT.zoom,
      autoRotate: true,
      showArcs: true,
      showSatellites: true,
      dragging: false,
      lastX: 0,
      lastY: 0,
      hoverCity: null,
      time: 0,
      lastTs: performance.now()
    };

    container.innerHTML = `
      <div class="holo-studio">
        <div class="holo-header glass-card">
          <div>
            <span class="holo-kicker">🛰️ ORBITAL TELEMETRY • 3D HOLOGRAPHIC PROJECTION ENGINE</span>
            <h2>🌐 3D Hologram Küre &amp; Anadolu Yörünge Ağı</h2>
            <p>Küreyi fare/dokunmatik ile 360° çevirin, yakınlaştırın; 81 ilin gerçek küresel koordinatlarını ve 3D yükselen sefer yörünge yaylarını keşfedin.</p>
          </div>
          <div class="holo-controls-top">
            <button type="button" class="holo-btn active" id="holo-btn-lock">🎯 Anadolu'ya Kilitlen</button>
            <button type="button" class="holo-btn" id="holo-btn-earth">🌍 Tam Dünya Görünümü</button>
            <button type="button" class="holo-btn active" id="holo-btn-auto">🔄 Yörünge Dönüşü</button>
            <button type="button" class="holo-btn gold" id="holo-btn-snap">📸 3D Hologram İndir</button>
          </div>
        </div>

        <div class="holo-main-grid">
          <div class="holo-viewport-card glass-card">
            <canvas id="holo-globe-canvas" aria-label="3D Holografik Anadolu Küresi"></canvas>
            <div class="holo-hud-corner tl">ORBITAL LOCK: 39.0°N 35.2°E</div>
            <div class="holo-hud-corner tr" id="holo-hud-zoom">ZOOM: 2.35x</div>
            <div class="holo-hud-corner bl">NODES: ${visited.length} ACTIVE / ${allProvinces.length} TOTAL</div>
            <div class="holo-hud-corner br" id="holo-hud-clock">UTC --:--:--</div>
            <div class="holo-tooltip" id="holo-tooltip" hidden></div>
          </div>

          <aside class="holo-side-panel glass-card">
            <div class="holo-side-title">🛰️ Yörünge Tarayıcı</div>
            <div class="holo-toggle-list">
              <button type="button" class="holo-toggle active" data-holo-toggle="showArcs">✨ 3D Sefer Yayları</button>
              <button type="button" class="holo-toggle active" data-holo-toggle="showSatellites">🛰️ Yörünge Uyduları</button>
            </div>
            <div class="holo-zoom-control">
              <label for="holo-zoom-slider">🔭 Yörünge Yakınlaştırma</label>
              <input type="range" id="holo-zoom-slider" min="95" max="360" value="235" />
            </div>
            <div class="holo-selected-box" id="holo-selected-box">
              <div class="holo-sel-kicker">AKTİF SİNYAL</div>
              <h3 id="holo-sel-name">Anadolu Merkezi</h3>
              <p id="holo-sel-meta">Küre üzerinde herhangi bir il düğümüne dokunun veya üzerine gelin.</p>
            </div>
            <div class="holo-legend">
              <span><i style="background:#00f2fe"></i> Ziyaret Edilen (${visited.length})</span>
              <span><i style="background:#fbbf24"></i> Keşif Bekleyen (${allProvinces.length - visited.length})</span>
              <span><i style="background:#c084fc"></i> 3D Sefer Yayı</span>
            </div>
          </aside>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#holo-globe-canvas');
    const c2d = canvas.getContext('2d');
    const tooltip = container.querySelector('#holo-tooltip');
    const zoomHud = container.querySelector('#holo-hud-zoom');
    const clockHud = container.querySelector('#holo-hud-clock');
    const zoomSlider = container.querySelector('#holo-zoom-slider');
    const selName = container.querySelector('#holo-sel-name');
    const selMeta = container.querySelector('#holo-sel-meta');

    let W = 820;
    let H = 520;
    let projectedNodes = [];

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = Math.max(300, Math.floor(rect.width));
      H = Math.max(340, Math.min(560, Math.floor(W * 0.62)));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // 3D Orthographic Sphere Projection (lat, lng in degrees, alt >= 1.0)
    function project3D(latDeg, lngDeg, alt, R, cx, cy) {
      const lat = latDeg * DEG;
      const lng = lngDeg * DEG + state.rotLng;

      const cosLat = Math.cos(lat);
      const x0 = cosLat * Math.sin(lng);
      const y0 = Math.sin(lat);
      const z0 = cosLat * Math.cos(lng);

      // Tilt by rotLat around X axis
      const cosT = Math.cos(state.rotLat);
      const sinT = Math.sin(state.rotLat);
      const y1 = y0 * cosT - z0 * sinT;
      const z1 = y0 * sinT + z0 * cosT;

      return {
        x: cx + x0 * R * alt,
        y: cy - y1 * R * alt,
        z: z1,
        visible: z1 > -0.05
      };
    }

    function drawFrame(now) {
      const dt = Math.min(0.05, (now - state.lastTs) / 1000);
      state.lastTs = now;
      state.time += dt;

      if (state.autoRotate && !state.dragging) {
        // Gentle orbital sway when zoomed on Anatolia, full spin when zoomed out
        if (state.targetZoom > 1.7) {
          state.targetRotLng = ANATOLIA_DEFAULT.rotLng + Math.sin(state.time * 0.35) * 0.12;
          state.targetRotLat = ANATOLIA_DEFAULT.rotLat + Math.cos(state.time * 0.25) * 0.04;
        } else {
          state.targetRotLng += dt * 0.22;
        }
      }

      // Smooth damping
      state.rotLng += (state.targetRotLng - state.rotLng) * Math.min(1, dt * 6);
      state.rotLat += (state.targetRotLat - state.rotLat) * Math.min(1, dt * 6);
      state.zoom += (state.targetZoom - state.zoom) * Math.min(1, dt * 6);

      if (zoomHud) zoomHud.textContent = `ZOOM: ${state.zoom.toFixed(2)}x`;
      if (clockHud) clockHud.textContent = `UTC ${new Date().toISOString().slice(11, 19)}`;

      // Deep cyber-space backdrop
      const bg = c2d.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, Math.max(W, H) * 0.72);
      bg.addColorStop(0, '#091a33');
      bg.addColorStop(0.55, '#050b18');
      bg.addColorStop(1, '#02040a');
      c2d.fillStyle = bg;
      c2d.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2 + (state.zoom > 1.8 ? H * 0.04 : 0);
      const R = Math.min(W, H) * 0.38 * state.zoom;

      // Atmospheric halo
      const halo = c2d.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.18);
      halo.addColorStop(0, 'rgba(0, 242, 254, 0.20)');
      halo.addColorStop(0.55, 'rgba(56, 189, 248, 0.07)');
      halo.addColorStop(1, 'rgba(56, 189, 248, 0)');
      c2d.fillStyle = halo;
      c2d.beginPath();
      c2d.arc(cx, cy, R * 1.18, 0, Math.PI * 2);
      c2d.fill();

      // Sphere body
      const sphereGrad = c2d.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.1, cx, cy, R);
      sphereGrad.addColorStop(0, '#0f2747');
      sphereGrad.addColorStop(0.65, '#08152b');
      sphereGrad.addColorStop(1, '#030814');
      c2d.fillStyle = sphereGrad;
      c2d.beginPath();
      c2d.arc(cx, cy, R, 0, Math.PI * 2);
      c2d.fill();

      // Clip interior to sphere for graticule
      c2d.save();
      c2d.beginPath();
      c2d.arc(cx, cy, R, 0, Math.PI * 2);
      c2d.clip();

      // Holographic Latitude / Longitude Graticule
      c2d.strokeStyle = 'rgba(0, 242, 254, 0.14)';
      c2d.lineWidth = 1;
      for (let lat = -60; lat <= 75; lat += 15) {
        c2d.beginPath();
        let started = false;
        for (let lng = -180; lng <= 180; lng += 6) {
          const p = project3D(lat, lng, 1.0, R, cx, cy);
          if (p.z > 0) {
            if (!started) { c2d.moveTo(p.x, p.y); started = true; }
            else c2d.lineTo(p.x, p.y);
          } else {
            started = false;
          }
        }
        c2d.stroke();
      }
      for (let lng = -180; lng < 180; lng += 15) {
        c2d.beginPath();
        let started = false;
        for (let lat = -80; lat <= 80; lat += 5) {
          const p = project3D(lat, lng, 1.0, R, cx, cy);
          if (p.z > 0) {
            if (!started) { c2d.moveTo(p.x, p.y); started = true; }
            else c2d.lineTo(p.x, p.y);
          } else {
            started = false;
          }
        }
        c2d.stroke();
      }

      // Radar scanline sweeping over Anatolia
      const scanY = ((state.time * 55) % (H + 80)) - 40;
      const scanGrad = c2d.createLinearGradient(0, scanY - 22, 0, scanY + 22);
      scanGrad.addColorStop(0, 'rgba(0, 242, 254, 0)');
      scanGrad.addColorStop(0.5, 'rgba(0, 242, 254, 0.12)');
      scanGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');
      c2d.fillStyle = scanGrad;
      c2d.fillRect(0, scanY - 22, W, 44);
      c2d.restore();

      // Crisp sphere rim glow
      c2d.strokeStyle = 'rgba(0, 242, 254, 0.45)';
      c2d.lineWidth = 1.6;
      c2d.beginPath();
      c2d.arc(cx, cy, R, 0, Math.PI * 2);
      c2d.stroke();

      // 3D Elevated Orbital Arcs between visited provinces
      if (state.showArcs && visited.length > 1) {
        for (let i = 0; i < visited.length - 1; i++) {
          const a = visited[i];
          const b = visited[i + 1];
          const pA = project3D(a.lat, a.lng, 1.0, R, cx, cy);
          const pB = project3D(b.lat, b.lng, 1.0, R, cx, cy);
          if (!pA.visible && !pB.visible) continue;

          const midLat = (a.lat + b.lat) / 2;
          const midLng = (a.lng + b.lng) / 2;
          const distDeg = Math.hypot(b.lat - a.lat, b.lng - a.lng);
          const lift = 1.0 + Math.min(0.18, 0.03 + distDeg * 0.012);
          const pMid = project3D(midLat, midLng, lift, R, cx, cy);

          c2d.save();
          c2d.beginPath();
          c2d.moveTo(pA.x, pA.y);
          c2d.quadraticCurveTo(pMid.x, pMid.y, pB.x, pB.y);
          const arcGrad = c2d.createLinearGradient(pA.x, pA.y, pB.x, pB.y);
          arcGrad.addColorStop(0, 'rgba(0, 242, 254, 0.72)');
          arcGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.9)');
          arcGrad.addColorStop(1, 'rgba(251, 191, 36, 0.78)');
          c2d.strokeStyle = arcGrad;
          c2d.lineWidth = 1.5;
          c2d.stroke();

          // Traveling data pulse packet along every 3rd arc
          const t = (state.time * 0.55 + i * 0.17) % 1;
          const omt = 1 - t;
          const px = omt * omt * pA.x + 2 * omt * t * pMid.x + t * t * pB.x;
          const py = omt * omt * pA.y + 2 * omt * t * pMid.y + t * t * pB.y;
          c2d.beginPath();
          c2d.arc(px, py, 2.2, 0, Math.PI * 2);
          c2d.fillStyle = '#ffffff';
          c2d.fill();
          c2d.restore();
        }
      }

      // Project & render all 81 provinces
      projectedNodes = [];
      allProvinces.forEach((p) => {
        const pt = project3D(p.lat, p.lng, 1.0, R, cx, cy);
        if (!pt.visible) return;
        projectedNodes.push({ city: p, x: pt.x, y: pt.y, z: pt.z });
      });

      projectedNodes.sort((a, b) => a.z - b.z);
      projectedNodes.forEach(({ city, x, y }) => {
        const isHover = state.hoverCity && state.hoverCity.key === city.key;
        const baseColor = city.visited
          ? (REGION_COLORS[city.region_code] || '#00f2fe')
          : 'rgba(251, 191, 36, 0.52)';

        if (city.visited || isHover) {
          c2d.beginPath();
          c2d.arc(x, y, isHover ? 11 : 6 + Math.sin(state.time * 3 + city.plate) * 1.5, 0, Math.PI * 2);
          c2d.fillStyle = isHover ? 'rgba(0, 242, 254, 0.35)' : 'rgba(0, 242, 254, 0.16)';
          c2d.fill();
        }

        c2d.beginPath();
        c2d.arc(x, y, isHover ? 5.5 : city.visited ? 3.4 : 2.1, 0, Math.PI * 2);
        c2d.fillStyle = isHover ? '#ffffff' : baseColor;
        c2d.fill();

        if (state.zoom >= 2.0 && (city.visited || isHover)) {
          c2d.font = isHover ? '700 11px Outfit, sans-serif' : '600 9px Outfit, sans-serif';
          c2d.fillStyle = isHover ? '#ffffff' : 'rgba(226, 232, 240, 0.78)';
          c2d.textAlign = 'left';
          c2d.fillText(city.name, x + 6, y + 3);
        }
      });

      // Orbiting Telemetry Satellites
      if (state.showSatellites) {
        [
          { latOff: 39, speed: 24, alt: 1.12, color: '#00f2fe' },
          { latOff: 36, speed: -18, alt: 1.16, color: '#fbbf24' }
        ].forEach((sat, idx) => {
          const satLng = (state.time * sat.speed + idx * 140) % 360 - 180;
          const satLat = sat.latOff + Math.sin(state.time * 0.9 + idx) * 10;
          const sp = project3D(satLat, satLng, sat.alt, R, cx, cy);
          if (sp.visible) {
            c2d.beginPath();
            c2d.arc(sp.x, sp.y, 3.5, 0, Math.PI * 2);
            c2d.fillStyle = sat.color;
            c2d.shadowColor = sat.color;
            c2d.shadowBlur = 12;
            c2d.fill();
            c2d.shadowBlur = 0;
          }
        });
      }

      rafId = requestAnimationFrame(drawFrame);
    }

    // Pointer Drag & Zoom Controls
    function startDrag(x, y) {
      state.dragging = true;
      state.autoRotate = false;
      const autoBtn = container.querySelector('#holo-btn-auto');
      if (autoBtn) autoBtn.classList.remove('active');
      state.lastX = x;
      state.lastY = y;
    }

    function moveDrag(x, y) {
      if (!state.dragging) return;
      const dx = x - state.lastX;
      const dy = y - state.lastY;
      state.lastX = x;
      state.lastY = y;
      const sens = 0.0055 / Math.max(0.8, state.zoom * 0.65);
      state.targetRotLng += dx * sens;
      state.targetRotLat = Math.max(-1.2, Math.min(1.2, state.targetRotLat + dy * sens));
    }

    canvas.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => {
      if (state.dragging) {
        moveDrag(e.clientX, e.clientY);
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      if (mx < 0 || my < 0 || mx > rect.width || my > rect.height) return;

      let hit = null;
      let best = 14;
      for (let i = 0; i < projectedNodes.length; i++) {
        const n = projectedNodes[i];
        const d = Math.hypot(n.x - mx, n.y - my);
        if (d < best) { best = d; hit = n.city; }
      }
      state.hoverCity = hit;
      canvas.style.cursor = hit ? 'pointer' : 'grab';
      if (hit) {
        tooltip.hidden = false;
        tooltip.style.left = `${Math.min(W - 180, Math.max(12, mx + 14))}px`;
        tooltip.style.top = `${Math.max(12, my - 40)}px`;
        tooltip.innerHTML = `<strong>${String(hit.plate).padStart(2, '0')} ${escapeHtml(hit.name)}</strong><span>${hit.visited ? '✅ Aktif Sinyal' : '⏳ Bekleyen Menzil'} • ${hit.lat.toFixed(2)}°K ${hit.lng.toFixed(2)}°D</span>`;
        if (selName) selName.textContent = `${String(hit.plate).padStart(2, '0')} • ${hit.name}`;
        if (selMeta) selMeta.textContent = `${hit.region} — ${hit.visited ? 'Ziyaret Edildi' : 'Keşif Bekliyor'} (${hit.lat.toFixed(2)}°K, ${hit.lng.toFixed(2)}°D)`;
      } else {
        tooltip.hidden = true;
      }
    });
    window.addEventListener('mouseup', () => { state.dragging = false; });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    canvas.addEventListener('touchend', () => { state.dragging = false; });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      state.targetZoom = Math.max(0.95, Math.min(3.6, state.targetZoom - e.deltaY * 0.0014));
      if (zoomSlider) zoomSlider.value = String(Math.round(state.targetZoom * 100));
    }, { passive: false });

    canvas.addEventListener('click', () => {
      if (state.hoverCity) {
        if (ctx && typeof ctx.selectCity === 'function') ctx.selectCity(state.hoverCity.key);
        else window.location.hash = `#city/${encodeURIComponent(state.hoverCity.key)}`;
      }
    });

    // Buttons
    container.querySelector('#holo-btn-lock').addEventListener('click', () => {
      state.targetRotLng = ANATOLIA_DEFAULT.rotLng;
      state.targetRotLat = ANATOLIA_DEFAULT.rotLat;
      state.targetZoom = ANATOLIA_DEFAULT.zoom;
      if (zoomSlider) zoomSlider.value = String(Math.round(ANATOLIA_DEFAULT.zoom * 100));
    });

    container.querySelector('#holo-btn-earth').addEventListener('click', () => {
      state.targetZoom = 1.05;
      state.targetRotLat = 26 * DEG;
      state.autoRotate = true;
      container.querySelector('#holo-btn-auto').classList.add('active');
      if (zoomSlider) zoomSlider.value = '105';
    });

    container.querySelector('#holo-btn-auto').addEventListener('click', (e) => {
      state.autoRotate = !state.autoRotate;
      e.currentTarget.classList.toggle('active', state.autoRotate);
    });

    container.querySelectorAll('[data-holo-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-holo-toggle');
        state[key] = !state[key];
        btn.classList.toggle('active', state[key]);
      });
    });

    zoomSlider.addEventListener('input', () => {
      state.targetZoom = Number(zoomSlider.value) / 100;
    });

    container.querySelector('#holo-btn-snap').addEventListener('click', () => {
      try {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `dijital-seyyah-3d-hologram-${new Date().toISOString().slice(0, 10)}.png`;
        a.click();
        if (ctx && typeof ctx.showToast === 'function') {
          ctx.showToast('📸 3D Hologram Küre görüntüsü indirildi!');
        }
      } catch (err) {}
    });

    window.addEventListener('resize', resize);
    resize();
    rafId = requestAnimationFrame(drawFrame);
  }

  window.SEYYAH_MODULES.holoGlobe = {
    render,
    stop
  };
})();
