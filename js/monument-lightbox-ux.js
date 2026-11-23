/* ==========================================================================
   Dijital Seyyah — Cinematic Monument Lightbox & Image Resilience Guard
   Zero-dependency delegated viewer for all 86+ monument, heritage & region photos
   ========================================================================== */
(function () {
  'use strict';

  const FALLBACK_IMG = 'assets/banner.jpg';
  const TARGET_SELECTOR = 'img[src*="assets/monuments/"], img[src*="assets/regions/"], img[src*="assets/visuals/"]';

  const state = {
    items: [],
    index: 0,
    zoomed: false,
    isOpen: false,
    touchStartX: 0
  };

  let overlay = null;
  let imgEl = null;
  let titleEl = null;
  let subEl = null;
  let counterEl = null;
  let prevBtn = null;
  let nextBtn = null;
  let downloadLink = null;
  let zoomBtn = null;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'monument-lightbox-overlay';
    overlay.className = 'monument-lb-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Anıt ve Miras Fotoğraf Önizleme');
    overlay.innerHTML = `
      <div class="monument-lb-shell">
        <div class="monument-lb-topbar">
          <div class="monument-lb-meta">
            <div class="monument-lb-title" id="mlb-title">Anıt Görseli</div>
            <div class="monument-lb-sub">
              <span class="monument-lb-counter" id="mlb-counter">1 / 1</span>
              <span id="mlb-sub">Anadolu Seyahatnamesi Arşivi</span>
            </div>
          </div>
          <div class="monument-lb-actions">
            <button type="button" class="monument-lb-btn" id="mlb-zoom" title="Yakınlaştır (Boşluk)">🔍 <span class="lb-label">Yakınlaştır</span></button>
            <button type="button" class="monument-lb-btn" id="mlb-copy" title="Görsel Bağlantısını Kopyala">🔗 <span class="lb-label">Kopyala</span></button>
            <a class="monument-lb-btn" id="mlb-download" download title="Fotoğrafı İndir">⬇️ <span class="lb-label">İndir</span></a>
            <button type="button" class="monument-lb-btn close-btn" id="mlb-close" aria-label="Kapat">&times;</button>
          </div>
        </div>
        <div class="monument-lb-stage" id="mlb-stage">
          <button type="button" class="monument-lb-nav prev" id="mlb-prev" aria-label="Önceki">&#10094;</button>
          <img class="monument-lb-img" id="mlb-img" src="" alt="Anıt Fotoğrafı" />
          <button type="button" class="monument-lb-nav next" id="mlb-next" aria-label="Sonraki">&#10095;</button>
        </div>
        <div class="monument-lb-hint">← / → Gezin • Boşluk / Tıkla: Yakınlaştır • Esc: Kapat</div>
      </div>
    `;
    document.body.appendChild(overlay);

    imgEl = overlay.querySelector('#mlb-img');
    titleEl = overlay.querySelector('#mlb-title');
    subEl = overlay.querySelector('#mlb-sub');
    counterEl = overlay.querySelector('#mlb-counter');
    prevBtn = overlay.querySelector('#mlb-prev');
    nextBtn = overlay.querySelector('#mlb-next');
    downloadLink = overlay.querySelector('#mlb-download');
    zoomBtn = overlay.querySelector('#mlb-zoom');

    overlay.querySelector('#mlb-close').addEventListener('click', close);
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));
    zoomBtn.addEventListener('click', toggleZoom);
    imgEl.addEventListener('click', toggleZoom);

    overlay.querySelector('#mlb-copy').addEventListener('click', () => {
      const current = state.items[state.index];
      if (!current) return;
      const absUrl = new URL(current.src, window.location.href).href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(absUrl).then(() => {
          const btn = overlay.querySelector('#mlb-copy');
          const orig = btn.innerHTML;
          btn.innerHTML = '✅ <span class="lb-label">Kopyalandı</span>';
          setTimeout(() => { btn.innerHTML = orig; }, 1600);
        }).catch(() => {});
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    const stage = overlay.querySelector('#mlb-stage');
    stage.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        state.touchStartX = e.touches[0].clientX;
      }
    }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (!e.changedTouches || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - state.touchStartX;
      if (Math.abs(dx) > 48) {
        step(dx < 0 ? 1 : -1);
      }
    }, { passive: true });

    return overlay;
  }

  function extractCaption(img) {
    const card = img.closest('article, .unesco-card, .karavansaray-card, .arch-card, .thermal-card, .glass-card, .card, figure, div');
    let title = (img.getAttribute('alt') || '').trim();
    let sub = '';
    if (card) {
      const heading = card.querySelector('h2, h3, h4, .card-title, figcaption');
      if (heading && heading.textContent.trim()) {
        title = heading.textContent.trim();
      }
      const badge = card.querySelector('.badge, .chip, .location, .city-tag, small');
      if (badge && badge.textContent.trim() && badge.textContent.trim() !== title) {
        sub = badge.textContent.trim();
      }
    }
    if (!title) {
      const fname = (img.getAttribute('src') || '').split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
      title = fname.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Anadolu Mirası';
    }
    return { title, sub: sub || 'Anadolu Seyahatnamesi • Özgün Miras Arşivi' };
  }

  function renderCurrent() {
    const item = state.items[state.index];
    if (!item) return;
    state.zoomed = false;
    imgEl.classList.remove('zoomed');
    imgEl.src = item.src;
    imgEl.alt = item.title;
    titleEl.textContent = item.title;
    subEl.textContent = item.sub;
    counterEl.textContent = `${state.index + 1} / ${state.items.length}`;
    downloadLink.href = item.src;
    downloadLink.setAttribute('download', (item.src.split('/').pop() || 'anadolu-miras.jpg').split('?')[0]);

    const multi = state.items.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;
  }

  function openFromImage(clickedImg) {
    const viewport = document.getElementById('viewport-content') || document.body;
    const allImgs = Array.from(viewport.querySelectorAll(TARGET_SELECTOR))
      .filter((el) => el.offsetParent !== null && el.getAttribute('src'));

    if (!allImgs.length) return;
    const seen = new Set();
    const items = [];
    let clickedIdx = 0;

    allImgs.forEach((el) => {
      const src = el.getAttribute('src');
      if (!src || seen.has(src)) return;
      seen.add(src);
      const meta = extractCaption(el);
      if (el === clickedImg || src === clickedImg.getAttribute('src')) {
        clickedIdx = items.length;
      }
      items.push({ src, title: meta.title, sub: meta.sub });
    });

    if (!items.length) return;
    state.items = items;
    state.index = clickedIdx;
    state.isOpen = true;

    ensureOverlay();
    renderCurrent();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function step(delta) {
    if (!state.items.length) return;
    state.index = (state.index + delta + state.items.length) % state.items.length;
    renderCurrent();
  }

  function toggleZoom() {
    state.zoomed = !state.zoomed;
    if (imgEl) imgEl.classList.toggle('zoomed', state.zoomed);
    if (zoomBtn) {
      zoomBtn.innerHTML = state.zoomed
        ? '🔎 <span class="lb-label">Uzaklaştır</span>'
        : '🔍 <span class="lb-label">Yakınlaştır</span>';
    }
  }

  function close() {
    if (!state.isOpen) return;
    state.isOpen = false;
    state.zoomed = false;
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Global keyboard controls when Monument Lightbox is open
  document.addEventListener('keydown', (e) => {
    if (!state.isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === ' ') {
      e.preventDefault();
      toggleZoom();
    }
  });

  // Delegated click handler on viewport for all monument/region/visual photos
  document.addEventListener('click', (e) => {
    const img = e.target && e.target.closest ? e.target.closest(TARGET_SELECTOR) : null;
    if (!img) return;
    if (!img.closest('#viewport-content')) return;
    // Do not hijack if user clicked an explicit button/link overlay
    if (e.target.closest('button, a')) return;
    e.preventDefault();
    e.stopPropagation();
    openFromImage(img);
  });

  // Global Image Resilience Guard (error fallback + async decoding)
  document.addEventListener('error', (e) => {
    const target = e.target;
    if (target && target.tagName === 'IMG' && !target.dataset.seyyahFallbackApplied) {
      target.dataset.seyyahFallbackApplied = '1';
      target.src = FALLBACK_IMG;
    }
  }, true);

  function enhanceImages(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('img').forEach((img) => {
      if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
      if (!img.getAttribute('loading') && !img.closest('header')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('viewport-content');
    if (viewport && typeof MutationObserver !== 'undefined') {
      enhanceImages(viewport);
      const obs = new MutationObserver(() => enhanceImages(viewport));
      obs.observe(viewport, { childList: true, subtree: true });
    }
  });

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.monumentLightbox = {
    openFromImage,
    close
  };
})();
