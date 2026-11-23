/* ==========================================================================
   Dijital Seyyah — Günün Menzili & Günün Anıtı (Daily Featured Showcase)
   Deterministically highlights 1 of 81 provinces + 1 of 86 authentic monuments
   each day on the Dashboard, with instant "🎲 Yeni Öneri" shuffle support.
   ========================================================================== */
(function () {
  'use strict';

  const WIDGET_ID = 'seyyah-daily-featured-showcase';
  let shuffleOffset = 0;

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getDaySeed() {
    const now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  }

  function isDashboardActive() {
    const h = window.location.hash || '';
    return h === '' || h === '#' || h === '#dashboard';
  }

  function formatTodayTr() {
    try {
      return new Date().toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  function renderWidget() {
    if (!isDashboardActive()) return;
    const viewport = document.getElementById('viewport-content');
    if (!viewport || !viewport.children.length) return;

    const raw = window.TRAVEL_DATA || window.SEYYAH_DATA || null;
    const provincesObj = raw && raw.provinces ? raw.provinces : null;
    const catalog = Array.isArray(window.SEYYAH_MONUMENTS_CATALOG) ? window.SEYYAH_MONUMENTS_CATALOG : [];
    if (!provincesObj || !catalog.length) return;

    const provKeys = Object.keys(provincesObj).sort(
      (a, b) => (provincesObj[a].plate || 0) - (provincesObj[b].plate || 0)
    );
    if (!provKeys.length) return;

    const seed = getDaySeed() + shuffleOffset * 17;
    const cityKey = provKeys[Math.abs(seed * 31) % provKeys.length];
    const city = provincesObj[cityKey];
    const monument = catalog[Math.abs(seed * 13 + 7) % catalog.length];
    const monProvKey = Array.isArray(monument.provinces) && monument.provinces.length ? monument.provinces[0] : '';
    const monProvName = monProvKey && provincesObj[monProvKey] ? provincesObj[monProvKey].name : 'Anadolu';

    let el = document.getElementById(WIDGET_ID);
    if (!el) {
      el = document.createElement('section');
      el.id = WIDGET_ID;
      el.className = 'daily-featured-wrap';
      // Insert right after the first hero/ribbon child so it sits prominently on the dashboard
      if (viewport.children.length > 1) {
        viewport.insertBefore(el, viewport.children[1]);
      } else {
        viewport.appendChild(el);
      }
    }

    const plateStr = String(city.plate || 0).padStart(2, '0');
    const statusBadge = city.visited ? '✅ Ziyaret Edildi' : '⏳ Keşif Bekliyor';
    const cityImg = city.banner_rel || 'assets/banner.jpg';
    const quoteText = (city.custom_quote || city.quote || '').slice(0, 120);

    el.innerHTML = `
      <div class="daily-featured-topbar">
        <div class="daily-featured-heading">
          <span class="daily-featured-tag">✨ Günün Seçkisi &amp; Fütüristik Stüdyolar</span>
          <span class="daily-featured-date">${escapeHtml(formatTodayTr())}</span>
        </div>
        <div class="daily-featured-quickbar">
          <a class="daily-featured-link" href="#holoGlobe">🌐 3D Hologram Küre</a>
          <a class="daily-featured-link" href="#fogReplay">🌫️ Fog of War &amp; Replay</a>
          <a class="daily-featured-link" href="#missionControl">🎛️ Sefer Komuta</a>
          <button type="button" class="daily-featured-shuffle" id="daily-featured-shuffle-btn" title="Yeni İl ve Anıt Önerisi Getir">
            🎲 Yeni Öneri
          </button>
        </div>
      </div>
      <div class="daily-featured-grid">
        <article class="daily-featured-card">
          <div class="daily-featured-media">
            <img src="${escapeHtml(cityImg)}" alt="${escapeHtml(city.name)}" loading="lazy" decoding="async" />
            <span class="daily-featured-badge">${plateStr} • ${escapeHtml(city.region || '')}</span>
          </div>
          <div class="daily-featured-info">
            <div class="daily-featured-kicker">📍 Günün Menzili • ${statusBadge}</div>
            <h3>${escapeHtml(city.name)}</h3>
            <p>${escapeHtml(quoteText)}${quoteText.length >= 120 ? '…' : ''}</p>
            <div class="daily-featured-actions">
              <a class="daily-featured-link" href="#city/${encodeURIComponent(cityKey)}">Menzili Keşfet ➔</a>
            </div>
          </div>
        </article>

        <article class="daily-featured-card monument-accent">
          <div class="daily-featured-media">
            <img src="${escapeHtml(monument.src)}" alt="${escapeHtml(monument.title)}" loading="lazy" decoding="async" />
            <span class="daily-featured-badge gold">${escapeHtml(monument.category)}</span>
          </div>
          <div class="daily-featured-info">
            <div class="daily-featured-kicker">🏛️ Günün Anıtı • ${escapeHtml(monProvName)}</div>
            <h3>${escapeHtml(monument.title)}</h3>
            <p>86 özgün anıt arşivinden seçilen gerçek miras fotoğrafı — büyütmek için görsele tıklayın.</p>
            <div class="daily-featured-actions">
              ${monProvKey ? `<a class="daily-featured-link" href="#city/${encodeURIComponent(monProvKey)}">${escapeHtml(monProvName)} Sayfası ➔</a>` : ''}
              <a class="daily-featured-link secondary" href="#${escapeHtml(monument.view)}">${escapeHtml(monument.category)} Stüdyosu</a>
            </div>
          </div>
        </article>
      </div>
    `;

    const shuffleBtn = el.querySelector('#daily-featured-shuffle-btn');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        shuffleOffset += 1;
        renderWidget();
      });
    }
  }

  let timer = null;
  function scheduleRender() {
    clearTimeout(timer);
    timer = setTimeout(renderWidget, 180);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('viewport-content');
    if (viewport && typeof MutationObserver !== 'undefined') {
      const obs = new MutationObserver(() => {
        if (isDashboardActive() && !document.getElementById(WIDGET_ID)) {
          scheduleRender();
        }
      });
      obs.observe(viewport, { childList: true });
    }
    window.addEventListener('hashchange', scheduleRender);
    scheduleRender();
  });

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.dailyFeaturedShowcase = {
    refresh: renderWidget
  };
})();
