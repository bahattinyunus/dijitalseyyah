/* ==========================================================================
   Dijital Seyyah — Cyber-Anatolia 2099 Futuristic FX Engine
   - Ultra-lightweight ambient neural constellation starfield canvas
   - Hardware-accelerated cursor holographic spotlight aura (desktop)
   - Live orbital telemetry micro-HUD + Alt+F CYBER/KLASİK toggle
   - Respects prefers-reduced-motion and pauses automatically when tab hidden
   ========================================================================== */
(function () {
  'use strict';

  const STORAGE_KEY = 'dijital_seyyah_cyber_mode_v1';
  const REDUCED_MOTION =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cyberEnabled = true;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === '0') cyberEnabled = false;
  } catch (e) {}

  let bgCanvas = null;
  let bgCtx = null;
  let auraEl = null;
  let hudEl = null;
  let toggleBtn = null;
  let particles = [];
  let rafId = null;

  function applyCyberState() {
    document.body.classList.toggle('cyber-mode', cyberEnabled);
    if (toggleBtn) {
      toggleBtn.textContent = cyberEnabled ? '⚡ CYBER' : '🌙 KLASİK';
    }
    try {
      localStorage.setItem(STORAGE_KEY, cyberEnabled ? '1' : '0');
    } catch (e) {}

    if (cyberEnabled && !REDUCED_MOTION) {
      startConstellation();
    } else {
      stopConstellation();
    }
  }

  function initConstellation() {
    if (bgCanvas) return;
    bgCanvas = document.createElement('canvas');
    bgCanvas.id = 'cyber-bg-canvas';
    bgCanvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(bgCanvas, document.body.firstChild);
    bgCtx = bgCanvas.getContext('2d');

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      bgCanvas.width = w;
      bgCanvas.height = h;
      const count = Math.min(48, Math.max(20, Math.floor((w * h) / 34000)));
      particles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1 + Math.random() * 1.4,
        color: i % 4 === 0 ? 'rgba(251, 191, 36, 0.65)' : 'rgba(0, 242, 254, 0.65)'
      }));
    }

    window.addEventListener('resize', resize);
    resize();
  }

  function drawConstellation() {
    if (!bgCanvas || !bgCtx || !cyberEnabled || document.hidden) {
      rafId = null;
      return;
    }
    const w = bgCanvas.width;
    const h = bgCanvas.height;
    bgCtx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      bgCtx.beginPath();
      bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bgCtx.fillStyle = p.color;
      bgCtx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 130) {
          bgCtx.strokeStyle = `rgba(0, 242, 254, ${(1 - dist / 130) * 0.14})`;
          bgCtx.lineWidth = 0.8;
          bgCtx.beginPath();
          bgCtx.moveTo(p.x, p.y);
          bgCtx.lineTo(q.x, q.y);
          bgCtx.stroke();
        }
      }
    }
    rafId = requestAnimationFrame(drawConstellation);
  }

  function startConstellation() {
    if (REDUCED_MOTION) return;
    initConstellation();
    if (!rafId && !document.hidden) {
      rafId = requestAnimationFrame(drawConstellation);
    }
  }

  function stopConstellation() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (bgCtx && bgCanvas) {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    }
  }

  function initCursorAura() {
    if (REDUCED_MOTION || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) return;
    auraEl = document.createElement('div');
    auraEl.id = 'cyber-cursor-aura';
    auraEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(auraEl);

    let visible = false;
    window.addEventListener('pointermove', (e) => {
      if (!cyberEnabled) return;
      auraEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!visible) {
        visible = true;
        auraEl.classList.add('active');
      }
    }, { passive: true });
  }

  function initHudPill() {
    hudEl = document.createElement('div');
    hudEl.className = 'cyber-hud-pill';
    hudEl.id = 'cyber-hud-pill';
    hudEl.innerHTML = `
      <span class="cyber-hud-dot"></span>
      <span>SYS:ONLINE • 81 NODES • 248 ASSETS</span>
      <button type="button" class="cyber-mode-toggle" id="cyber-mode-toggle-btn" title="Fütüristik Modu Aç/Kapat (Alt+F)">⚡ CYBER</button>
    `;
    document.body.appendChild(hudEl);
    toggleBtn = hudEl.querySelector('#cyber-mode-toggle-btn');
    toggleBtn.addEventListener('click', () => {
      cyberEnabled = !cyberEnabled;
      applyCyberState();
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopConstellation();
    else if (cyberEnabled && !REDUCED_MOTION) startConstellation();
  });

  document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      cyberEnabled = !cyberEnabled;
      applyCyberState();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    initCursorAura();
    initHudPill();
    applyCyberState();
  });

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.futuristicFx = {
    toggle: () => {
      cyberEnabled = !cyberEnabled;
      applyCyberState();
    },
    isEnabled: () => cyberEnabled
  };
})();
