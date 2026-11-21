/* ==========================================================================
   Dijital Seyyah — Awwwards Ambient Motion & Visual Polish Engine
   File: js/ambient-motion.js
   Registers on: window.SEYYAH_MODULES.ambientMotion = { init(ctx), animateNumbers(root) }
   Features:
     1. Respects prefers-reduced-motion: reduce (initial & live media query changes)
     2. Subtle Animated Constellation / Starfield Canvas (#seyyah-ambient-canvas)
        - ~42 softly drifting cyan/emerald/gold particles + faint connecting lines
        - Auto-pauses on visibilitychange (near-zero CPU when tab is hidden)
     3. Interactive Card Spotlight Glow (--mouse-x / --mouse-y on .glass-card)
        - Passive, rAF-throttled pointermove on .content-viewport
     4. Smooth Number Count-Up (animateNumbers(root))
        - 650ms ease-out cubic rAF animation on .stat-card-value
        - Preserves Turkish formatting (%48.1, 10.898 km, 7 / 7, etc.)
     5. MutationObserver on #viewport-content for staggered .view-fade-in entrance
   ========================================================================== */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const CANVAS_ID = 'seyyah-ambient-canvas';
  const STYLE_ID = 'seyyah-ambient-motion-styles';
  const PARTICLE_COUNT = 42;
  const LINK_DISTANCE = 135;
  const LINK_DISTANCE_SQ = LINK_DISTANCE * LINK_DISTANCE;
  const COUNT_UP_DURATION_MS = 650;
  const MAX_STAGGER_ITEMS = 12;
  const STAGGER_STEP_MS = 45;

  // Cyber-Sufi luminous palette: cyan, emerald, gold
  const PARTICLE_PALETTE = [
    { r: 0, g: 242, b: 254 },   // --accent-cyan (#00f2fe)
    { r: 16, g: 185, b: 129 },  // --accent-emerald (#10b981)
    { r: 245, g: 158, b: 11 }   // --accent-gold (#f59e0b)
  ];

  let initialized = false;
  let reducedMotionQuery = null;
  let isReducedMotion = false;

  // Canvas & constellation state
  let canvasEl = null;
  let canvasCtx = null;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let particles = [];
  let canvasRafId = null;
  let lastFrameTime = 0;
  let resizeTimerId = null;

  // Spotlight glow state
  let spotlightTargetEl = null;
  let spotlightRafPending = false;
  let latestPointerEvent = null;
  let lastHoveredCard = null;

  // Viewport observer & number animation tracking
  let viewportObserver = null;
  const activeNumberAnims = new WeakMap();

  /**
   * Detect user reduced-motion preference.
   */
  function checkReducedMotion() {
    if (typeof window.matchMedia !== 'function') {
      return false;
    }
    if (!reducedMotionQuery) {
      reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    }
    return Boolean(reducedMotionQuery.matches);
  }

  /**
   * Inject minimal, self-contained CSS for the ambient canvas, card spotlight sheen,
   * and staggered .view-fade-in entrance animations.
   */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${CANVAS_ID} {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
        opacity: 0.45;
        transition: opacity 0.4s ease;
      }

      [data-theme="light"] #${CANVAS_ID},
      body.light-theme #${CANVAS_ID} {
        opacity: 0.25;
      }

      .app-container {
        position: relative;
        z-index: 1;
      }

      /* Interactive Card Spotlight Radial Sheen */
      .glass-card {
        position: relative;
        overflow: hidden;
      }

      .glass-card::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        background: radial-gradient(
          380px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
          rgba(0, 242, 254, 0.12),
          rgba(16, 185, 129, 0.05) 40%,
          transparent 72%
        );
        z-index: 0;
      }

      .glass-card:hover::before {
        opacity: 1;
      }

      /* Subtle Staggered View Entrance */
      @keyframes seyyahViewFadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .view-fade-in {
        animation: seyyahViewFadeIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
        animation-delay: var(--seyyah-stagger, 0ms);
        will-change: opacity, transform;
      }

      @media (prefers-reduced-motion: reduce) {
        #${CANVAS_ID} {
          display: none !important;
        }
        .glass-card::before {
          display: none !important;
        }
        .view-fade-in {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /* ========================================================================
     1. SUBTLE ANIMATED CONSTELLATION / STARFIELD CANVAS
     ======================================================================== */

  function createParticles(width, height) {
    const list = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const color = PARTICLE_PALETTE[i % PARTICLE_PALETTE.length];
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.08 + Math.random() * 0.22; // gentle, serene drift
      list.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.15 + Math.random() * 1.55,
        baseAlpha: 0.38 + Math.random() * 0.44,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.0008 + Math.random() * 0.0014,
        color: color
      });
    }
    return list;
  }

  function resizeCanvas() {
    if (!canvasEl || !canvasCtx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth || document.documentElement.clientWidth || 1024;
    const height = window.innerHeight || document.documentElement.clientHeight || 768;

    const prevWidth = canvasWidth;
    const prevHeight = canvasHeight;

    canvasWidth = width;
    canvasHeight = height;

    canvasEl.width = Math.floor(width * dpr);
    canvasEl.height = Math.floor(height * dpr);
    canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (particles.length === 0) {
      particles = createParticles(width, height);
    } else if (prevWidth > 0 && prevHeight > 0) {
      // Proportionally reposition existing particles on viewport resize
      const scaleX = width / prevWidth;
      const scaleY = height / prevHeight;
      for (let i = 0; i < particles.length; i++) {
        particles[i].x *= scaleX;
        particles[i].y *= scaleY;
      }
    }
  }

  function handleResize() {
    if (resizeTimerId) {
      window.clearTimeout(resizeTimerId);
    }
    resizeTimerId = window.setTimeout(() => {
      resizeTimerId = null;
      resizeCanvas();
    }, 150);
  }

  function renderConstellationFrame(now) {
    if (isReducedMotion || document.hidden || !canvasCtx) {
      canvasRafId = null;
      return;
    }

    // Clamp delta time so returning from sleep/tab switch never jumps particles
    const dt = lastFrameTime ? Math.min(now - lastFrameTime, 50) : 16.67;
    lastFrameTime = now;
    const step = dt / 16.67;

    const ctx = canvasCtx;
    const w = canvasWidth;
    const h = canvasHeight;
    const count = particles.length;

    ctx.clearRect(0, 0, w, h);

    // Update particle positions (soft wrap-around at edges)
    const pad = 16;
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.x += p.vx * step;
      p.y += p.vy * step;

      if (p.x < -pad) p.x = w + pad;
      else if (p.x > w + pad) p.x = -pad;

      if (p.y < -pad) p.y = h + pad;
      else if (p.y > h + pad) p.y = -pad;
    }

    // Draw faint connecting constellation lines
    ctx.lineWidth = 0.85;
    for (let i = 0; i < count; i++) {
      const a = particles[i];
      for (let j = i + 1; j < count; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < LINK_DISTANCE_SQ) {
          const proximity = 1 - Math.sqrt(distSq) / LINK_DISTANCE;
          const lineAlpha = proximity * 0.22;
          const r = (a.color.r + b.color.r) >> 1;
          const g = (a.color.g + b.color.g) >> 1;
          const bl = (a.color.b + b.color.b) >> 1;

          ctx.strokeStyle = `rgba(${r}, ${g}, ${bl}, ${lineAlpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw luminous particles with soft outer halo
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const twinkle = 0.72 + 0.28 * Math.sin(now * p.twinkleSpeed + p.twinklePhase);
      const alpha = p.baseAlpha * twinkle;
      const { r, g, b } = p.color;

      // Soft ambient halo
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(alpha * 0.22).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Core star point
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    canvasRafId = window.requestAnimationFrame(renderConstellationFrame);
  }

  function startConstellation() {
    if (isReducedMotion || document.hidden || !canvasEl || !canvasCtx) {
      return;
    }
    if (canvasRafId !== null) {
      return;
    }
    canvasEl.style.display = 'block';
    lastFrameTime = 0;
    canvasRafId = window.requestAnimationFrame(renderConstellationFrame);
  }

  function stopConstellation(hideCanvas) {
    if (canvasRafId !== null) {
      window.cancelAnimationFrame(canvasRafId);
      canvasRafId = null;
    }
    lastFrameTime = 0;
    if (hideCanvas && canvasEl) {
      canvasEl.style.display = 'none';
    }
  }

  function initConstellationCanvas() {
    if (!document.body) return;

    canvasEl = document.getElementById(CANVAS_ID);
    if (!canvasEl) {
      canvasEl = document.createElement('canvas');
      canvasEl.id = CANVAS_ID;
      canvasEl.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(canvasEl, document.body.firstChild);
    }

    canvasCtx = canvasEl.getContext('2d', { alpha: true });
    if (!canvasCtx) return;

    resizeCanvas();

    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopConstellation(false);
      } else if (!isReducedMotion) {
        startConstellation();
      }
    });

    if (isReducedMotion) {
      stopConstellation(true);
    } else {
      startConstellation();
    }
  }

  /* ========================================================================
     2. INTERACTIVE CARD SPOTLIGHT GLOW (.content-viewport -> .glass-card)
     ======================================================================== */

  function flushSpotlightPosition() {
    spotlightRafPending = false;
    if (isReducedMotion || !latestPointerEvent) return;

    const evt = latestPointerEvent;
    latestPointerEvent = null;

    const target = evt.target;
    const card = target && typeof target.closest === 'function'
      ? target.closest('.glass-card')
      : null;

    if (!card) {
      lastHoveredCard = null;
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = Math.round(evt.clientX - rect.left);
    const y = Math.round(evt.clientY - rect.top);

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    lastHoveredCard = card;
  }

  function handlePointerMove(evt) {
    if (isReducedMotion) return;
    // Skip touch pointers to avoid unnecessary layout reads while scrolling on mobile
    if (evt.pointerType === 'touch') return;

    latestPointerEvent = evt;
    if (!spotlightRafPending) {
      spotlightRafPending = true;
      window.requestAnimationFrame(flushSpotlightPosition);
    }
  }

  function initCardSpotlight() {
    spotlightTargetEl =
      document.querySelector('.content-viewport') ||
      document.getElementById('viewport-content');

    if (!spotlightTargetEl) return;

    spotlightTargetEl.addEventListener('pointermove', handlePointerMove, {
      passive: true
    });
  }

  /* ========================================================================
     3. SMOOTH NUMBER COUNT-UP (animateNumbers(root))
     ======================================================================== */

  /**
   * Parse Turkish & standard numeric stat strings such as:
   *   "%48.1"      -> prefix "%", value 48.1, decimals 1, decimalSep "."
   *   "10.898 km"  -> prefix "",  value 10898, decimals 0, useGrouping true, suffix " km"
   *   "39"         -> prefix "",  value 39, decimals 0
   *   "7 / 7"      -> prefix "",  value 7, decimals 0, suffix " / 7"
   *   "1.250,5 ₺"  -> prefix "",  value 1250.5, decimals 1, useGrouping true, decimalSep ","
   */
  function parseNumericStat(rawText) {
    const text = String(rawText || '').trim();
    if (!text) return null;

    const match = text.match(/^([^\d-]*)(-?\d[\d.,]*)(.*)$/);
    if (!match) return null;

    const prefix = match[1];
    const numStr = match[2];
    const suffix = match[3];

    let value = NaN;
    let decimals = 0;
    let useGrouping = false;
    let decimalSep = '.';

    const hasDot = numStr.includes('.');
    const hasComma = numStr.includes(',');

    if (hasDot && hasComma) {
      if (numStr.lastIndexOf(',') > numStr.lastIndexOf('.')) {
        // Turkish grouping (.) + decimal (,)
        useGrouping = true;
        decimalSep = ',';
        const parts = numStr.split(',');
        decimals = parts[1] ? parts[1].length : 0;
        value = parseFloat(parts[0].replace(/\./g, '') + '.' + (parts[1] || '0'));
      } else {
        // Standard grouping (,) + decimal (.)
        useGrouping = true;
        decimalSep = '.';
        const parts = numStr.split('.');
        decimals = parts[1] ? parts[1].length : 0;
        value = parseFloat(parts[0].replace(/,/g, '') + '.' + (parts[1] || '0'));
      }
    } else if (hasDot) {
      // Turkish thousands grouping pattern: e.g. 10.898 or 1.234.567 (not 0.123)
      if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(numStr)) {
        useGrouping = true;
        decimals = 0;
        value = parseInt(numStr.replace(/\./g, ''), 10);
      } else {
        decimalSep = '.';
        const parts = numStr.split('.');
        decimals = parts[1] ? parts[1].length : 0;
        value = parseFloat(numStr);
      }
    } else if (hasComma) {
      if (/^-?[1-9]\d{0,2}(,\d{3})+$/.test(numStr)) {
        useGrouping = true;
        decimals = 0;
        value = parseInt(numStr.replace(/,/g, ''), 10);
      } else {
        decimalSep = ',';
        const parts = numStr.split(',');
        decimals = parts[1] ? parts[1].length : 0;
        value = parseFloat(numStr.replace(',', '.'));
      }
    } else {
      value = parseInt(numStr, 10);
    }

    if (!Number.isFinite(value)) return null;

    return {
      originalText: text,
      prefix,
      suffix,
      value,
      decimals,
      useGrouping,
      decimalSep
    };
  }

  function formatNumericStat(currentValue, parsed) {
    let formatted;
    if (parsed.useGrouping) {
      formatted = currentValue.toLocaleString('tr-TR', {
        minimumFractionDigits: parsed.decimals,
        maximumFractionDigits: parsed.decimals
      });
    } else if (parsed.decimals > 0) {
      formatted = currentValue.toFixed(parsed.decimals);
      if (parsed.decimalSep === ',') {
        formatted = formatted.replace('.', ',');
      }
    } else {
      formatted = String(Math.round(currentValue));
    }
    return parsed.prefix + formatted + parsed.suffix;
  }

  /**
   * Smoothly animates all .stat-card-value elements inside `root` (defaults to #viewport-content or document)
   * using requestAnimationFrame ease-out cubic over 650ms.
   */
  function animateNumbers(root) {
    const scope =
      root && typeof root.querySelectorAll === 'function'
        ? root
        : document.getElementById('viewport-content') || document;

    const nodes = scope.querySelectorAll('.stat-card-value');
    if (!nodes || nodes.length === 0) return;

    const reduced = checkReducedMotion();

    nodes.forEach((el) => {
      const targetText = (el.dataset.ambientTargetText || el.textContent || '').trim();
      if (!targetText) return;

      // Cancel any in-flight animation for this element
      const existingRaf = activeNumberAnims.get(el);
      if (existingRaf) {
        window.cancelAnimationFrame(existingRaf);
        activeNumberAnims.delete(el);
      }

      if (reduced) {
        el.textContent = targetText;
        return;
      }

      // Avoid double-animating the exact same untouched value on the same DOM node
      if (el.dataset.ambientAnimated === targetText) {
        return;
      }

      const parsed = parseNumericStat(targetText);
      if (!parsed || parsed.value === 0) {
        el.dataset.ambientAnimated = targetText;
        return;
      }

      el.dataset.ambientTargetText = parsed.originalText;
      el.dataset.ambientAnimated = parsed.originalText;

      const startTime = performance.now();
      const targetVal = parsed.value;

      function tick(now) {
        if (!el.isConnected) {
          activeNumberAnims.delete(el);
          return;
        }

        const elapsed = now - startTime;
        const progress = Math.min(elapsed / COUNT_UP_DURATION_MS, 1);
        // Ease-out cubic: 1 - (1 - t)^3
        const eased = 1 - Math.pow(1 - progress, 3);

        if (progress < 1) {
          const current = targetVal * eased;
          el.textContent = formatNumericStat(current, parsed);
          const rafId = window.requestAnimationFrame(tick);
          activeNumberAnims.set(el, rafId);
        } else {
          // Restore exact original string to guarantee 100% formatting fidelity
          el.textContent = parsed.originalText;
          activeNumberAnims.delete(el);
        }
      }

      el.textContent = formatNumericStat(0, parsed);
      const rafId = window.requestAnimationFrame(tick);
      activeNumberAnims.set(el, rafId);
    });
  }

  /* ========================================================================
     4. VIEWPORT MUTATION OBSERVER (.view-fade-in staggered entrance)
     ======================================================================== */

  function applyStaggeredEntrance(viewport) {
    if (isReducedMotion || !viewport) return;

    // Collect top-level visible children; if a single wrapper container is rendered,
    // stagger its direct children so dashboards/views cascade gracefully.
    let targets = Array.from(viewport.children).filter(
      (el) => el.nodeType === 1 && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE'
    );

    if (targets.length === 1 && targets[0].children && targets[0].children.length > 1) {
      targets = Array.from(targets[0].children).filter(
        (el) => el.nodeType === 1 && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE'
      );
    }

    targets.forEach((el, idx) => {
      const delayMs = Math.min(idx, MAX_STAGGER_ITEMS) * STAGGER_STEP_MS;
      el.style.setProperty('--seyyah-stagger', `${delayMs}ms`);
      el.classList.remove('view-fade-in');
      // Force class re-application cleanly on next animation frame when reused
      el.classList.add('view-fade-in');
    });
  }

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

      applyStaggeredEntrance(viewport);
      animateNumbers(viewport);
    });

    viewportObserver.observe(viewport, { childList: true });

    // If initial content is already mounted when init() runs, polish it immediately
    if (viewport.children.length > 0) {
      applyStaggeredEntrance(viewport);
      animateNumbers(viewport);
    }
  }

  /* ========================================================================
     5. REDUCED-MOTION LIVE LISTENER & PUBLIC MODULE API
     ======================================================================== */

  function bindReducedMotionListener() {
    isReducedMotion = checkReducedMotion();

    if (!reducedMotionQuery) return;

    const onChange = (evt) => {
      isReducedMotion = Boolean(evt.matches);
      if (isReducedMotion) {
        stopConstellation(true);
        if (lastHoveredCard) {
          lastHoveredCard.style.removeProperty('--mouse-x');
          lastHoveredCard.style.removeProperty('--mouse-y');
          lastHoveredCard = null;
        }
      } else {
        startConstellation();
      }
    };

    if (typeof reducedMotionQuery.addEventListener === 'function') {
      reducedMotionQuery.addEventListener('change', onChange);
    } else if (typeof reducedMotionQuery.addListener === 'function') {
      reducedMotionQuery.addListener(onChange);
    }
  }

  function init(ctx) {
    if (initialized) {
      // Allow re-triggering number count-up if caller re-invokes init with a root
      if (ctx && ctx.viewport) {
        animateNumbers(ctx.viewport);
      }
      return;
    }
    initialized = true;

    bindReducedMotionListener();
    injectStyles();
    initConstellationCanvas();
    initCardSpotlight();
    initViewportObserver();
  }

  window.SEYYAH_MODULES.ambientMotion = {
    init: init,
    animateNumbers: animateNumbers
  };
})();
