/* ==========================================================================
   Dijital Seyyah — Reading Progress Bar, Scroll-to-Top & Plate Quick-Nav
   Zero-dependency UX layer:
     - Live scroll progress hairline synced to #viewport-content or window
     - Floating glassmorphic "↑ Yukarı" + "🔗 Paylaş" quick-action dock
     - Keyboard '[' and ']' to step through provinces in plate order (01 → 81)
   ========================================================================== */
(function () {
  'use strict';

  let progressBar = null;
  let scrollTopBtn = null;
  let quickShareBtn = null;
  let scrollContainer = null;

  function ensureUI() {
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'seyyah-reading-progress';
      progressBar.className = 'seyyah-reading-progress';
      progressBar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progressBar);
    }

    if (!scrollTopBtn) {
      const dock = document.createElement('div');
      dock.className = 'seyyah-quick-float-dock';
      dock.id = 'seyyah-quick-float-dock';
      dock.innerHTML = `
        <button type="button" class="seyyah-float-pill" id="seyyah-btn-quick-share" title="Aktif Sayfa Bağlantısını Kopyala (Shift+C)" aria-label="Bağlantıyı Kopyala">
          🔗
        </button>
        <button type="button" class="seyyah-float-pill" id="seyyah-btn-scroll-top" title="Yukarı Çık" aria-label="Yukarı Çık">
          ↑
        </button>
      `;
      document.body.appendChild(dock);

      scrollTopBtn = dock.querySelector('#seyyah-btn-scroll-top');
      quickShareBtn = dock.querySelector('#seyyah-btn-quick-share');

      scrollTopBtn.addEventListener('click', () => {
        if (scrollContainer && scrollContainer.scrollTop > 0) {
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      quickShareBtn.addEventListener('click', copyActiveUrl);
    }
  }

  function showMiniToast(text) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = 'toast show';
    t.textContent = text;
    container.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  function copyActiveUrl() {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showMiniToast('🔗 Sayfa bağlantısı kopyalandı!');
      }).catch(() => {});
    }
  }

  function updateProgress() {
    if (!progressBar || !scrollTopBtn) return;
    const vp = scrollContainer;
    const vpScrollable = vp && vp.scrollHeight > vp.clientHeight + 24;

    const scrollTop = vpScrollable
      ? vp.scrollTop
      : (window.scrollY || document.documentElement.scrollTop || 0);
    const maxScroll = vpScrollable
      ? (vp.scrollHeight - vp.clientHeight)
      : Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0;
    progressBar.style.width = `${pct.toFixed(2)}%`;
    progressBar.classList.toggle('visible', scrollTop > 20);

    const dock = document.getElementById('seyyah-quick-float-dock');
    if (dock) {
      dock.classList.toggle('visible', scrollTop > 380);
    }
  }

  function stepProvinceByPlate(delta) {
    const hash = window.location.hash || '';
    if (!hash.startsWith('#city/')) return false;
    const raw = window.TRAVEL_DATA || window.SEYYAH_DATA || null;
    if (!raw || !raw.provinces) return false;

    const currentKey = decodeURIComponent(hash.slice('#city/'.length));
    const sortedKeys = Object.keys(raw.provinces).sort(
      (a, b) => (raw.provinces[a].plate || 0) - (raw.provinces[b].plate || 0)
    );
    const idx = sortedKeys.indexOf(currentKey);
    if (idx === -1) return false;

    const nextKey = sortedKeys[(idx + delta + sortedKeys.length) % sortedKeys.length];
    window.location.hash = `#city/${encodeURIComponent(nextKey)}`;
    const nextProv = raw.provinces[nextKey];
    if (nextProv) {
      showMiniToast(`🧭 ${String(nextProv.plate).padStart(2, '0')} ${nextProv.name}`);
    }
    return true;
  }

  function isTypingTarget(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  document.addEventListener('keydown', (e) => {
    if (isTypingTarget(e.target)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === '[') {
      if (stepProvinceByPlate(-1)) e.preventDefault();
    } else if (e.key === ']') {
      if (stepProvinceByPlate(1)) e.preventDefault();
    } else if (e.shiftKey && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      copyActiveUrl();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    ensureUI();
    scrollContainer = document.getElementById('viewport-content');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateProgress, { passive: true });
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('hashchange', () => setTimeout(updateProgress, 120));
    updateProgress();
  });

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.readingUxPro = {
    updateProgress,
    copyActiveUrl,
    stepProvinceByPlate
  };
})();
