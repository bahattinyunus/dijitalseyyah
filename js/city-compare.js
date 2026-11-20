/**
 * Anadolu Seyahatnamesi — İki Şehri Karşılaştır (City Comparison Studio)
 * Registers on window.SEYYAH_MODULES.cityCompare
 */

(function () {
  'use strict';

  const DEFAULT_CITY_A = '01_Marmara/Istanbul';
  const DEFAULT_CITY_B = '04_IcAnadolu/Konya';
  const ROAD_FACTOR = 1.35;
  const AVG_SPEED_KMH = 80;

  let selectedKeyA = null;
  let selectedKeyB = null;

  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fallbackCalcDistKm(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function ensureBaseStyles() {
    if (typeof document === 'undefined' || !document.head) return;
    if (document.getElementById('seyyah-city-compare-styles')) return;

    const style = document.createElement('style');
    style.id = 'seyyah-city-compare-styles';
    style.textContent = `
      .compare-studio {
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 1180px;
        margin: 0 auto;
      }
      .compare-header {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .compare-header h2 {
        font-family: var(--font-heading);
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .compare-header p {
        font-size: 0.88rem;
        color: var(--text-secondary);
      }
      .compare-controls {
        padding: 18px 20px;
        display: grid;
        grid-template-columns: 1fr auto 1fr auto;
        gap: 12px;
        align-items: end;
      }
      .compare-select-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .compare-select-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-secondary);
      }
      .compare-telemetry {
        padding: 18px 20px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
      }
      .compare-telemetry-item {
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-md);
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .compare-telemetry-label {
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: var(--text-muted);
      }
      .compare-telemetry-value {
        font-family: var(--font-heading);
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .compare-telemetry-sub {
        font-size: 0.74rem;
        color: var(--text-secondary);
      }
      .compare-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
        align-items: start;
      }
      .compare-card {
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .compare-hero {
        position: relative;
        height: 210px;
        background-size: cover;
        background-position: center;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 16px 18px;
        border-bottom: 1px solid var(--border-glass);
      }
      .compare-hero-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(10, 15, 29, 0.35) 0%, rgba(10, 15, 29, 0.92) 100%);
      }
      .compare-hero-top,
      .compare-hero-bottom {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }
      .compare-hero-title {
        font-family: var(--font-heading);
        font-size: 1.55rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.2;
      }
      .compare-card-body {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .compare-meta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .compare-coords {
        font-family: monospace;
        font-size: 0.78rem;
        color: var(--accent-cyan);
        background: rgba(0, 242, 254, 0.08);
        border: 1px solid rgba(0, 242, 254, 0.22);
        padding: 4px 10px;
        border-radius: var(--radius-full);
      }
      .compare-section-heading {
        font-family: var(--font-heading);
        font-size: 0.88rem;
        font-weight: 700;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .compare-quote {
        font-size: 0.9rem;
        font-style: italic;
        color: var(--text-primary);
        border-left: 3px solid var(--accent-cyan);
        padding-left: 12px;
        line-height: 1.55;
      }
      .compare-library-box {
        font-size: 0.84rem;
        color: var(--text-secondary);
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-md);
        padding: 10px 12px;
        line-height: 1.5;
      }
      .compare-stats {
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-md);
        padding: 12px 14px;
      }
      .compare-stat-row {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .compare-stat-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.78rem;
        color: var(--text-secondary);
      }
      .compare-stat-val {
        font-family: var(--font-heading);
        font-weight: 700;
        color: var(--text-primary);
      }
      .compare-stat-track {
        width: 100%;
        height: 7px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: var(--radius-full);
        overflow: hidden;
      }
      .compare-stat-fill {
        height: 100%;
        border-radius: var(--radius-full);
        transition: width 0.45s ease;
      }
      @media (max-width: 960px) {
        .compare-controls {
          grid-template-columns: 1fr;
        }
        .compare-telemetry {
          grid-template-columns: repeat(2, 1fr);
        }
        .compare-grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 540px) {
        .compare-telemetry {
          grid-template-columns: 1fr;
        }
      }
    `;
    // Insert as first child so any rules defined in style.css naturally take precedence
    document.head.insertBefore(style, document.head.firstChild);
  }

  function getPhotoCount(province) {
    if (!province) return 0;
    if (Array.isArray(province.images) && province.images.length > 0) {
      return province.images.length;
    }
    let count = 0;
    if (province.has_banner) count += 1;
    if (province.has_gallery) count += 1;
    return count;
  }

  function formatDrivingTime(hoursFloat) {
    if (!Number.isFinite(hoursFloat) || hoursFloat <= 0) {
      return '0 dk';
    }
    const totalMinutes = Math.round(hoursFloat * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins} dk`;
    if (mins === 0) return `${hours} sa`;
    return `${hours} sa ${mins} dk`;
  }

  function getSortedEntries(provinces) {
    return Object.entries(provinces || {}).sort((a, b) =>
      String((a[1] && a[1].name) || a[0]).localeCompare(
        String((b[1] && b[1].name) || b[0]),
        'tr'
      )
    );
  }

  function resolveInitialSelection(provinces, sortedEntries, state) {
    const keys = sortedEntries.map(([k]) => k);
    if (keys.length === 0) return;

    const stateA = state && state.compareCityA;
    const stateB = state && state.compareCityB;

    if (!selectedKeyA || !provinces[selectedKeyA]) {
      if (stateA && provinces[stateA]) {
        selectedKeyA = stateA;
      } else if (provinces[DEFAULT_CITY_A]) {
        selectedKeyA = DEFAULT_CITY_A;
      } else {
        selectedKeyA = keys[0];
      }
    }

    if (!selectedKeyB || !provinces[selectedKeyB]) {
      if (stateB && provinces[stateB]) {
        selectedKeyB = stateB;
      } else if (provinces[DEFAULT_CITY_B]) {
        selectedKeyB = DEFAULT_CITY_B;
      } else {
        selectedKeyB = keys.length > 1 ? keys[1] : keys[0];
      }
    }

    if (state) {
      state.compareCityA = selectedKeyA;
      state.compareCityB = selectedKeyB;
    }
  }

  function buildCityOptionsHtml(sortedEntries, selectedKey, escapeHtml) {
    return sortedEntries
      .map(([key, p]) => {
        const plate = String(p.plate || 0).padStart(2, '0');
        const statusIcon = p.visited ? ' ✓' : '';
        const selectedAttr = key === selectedKey ? ' selected' : '';
        return `<option value="${escapeHtml(key)}"${selectedAttr}>${escapeHtml(plate)} • ${escapeHtml(p.name)}${statusIcon}</option>`;
      })
      .join('');
  }

  function buildStatBarHtml(label, value, maxVal, gradientCss, isLeader) {
    const pct = maxVal > 0 ? Math.max(8, Math.round((value / maxVal) * 100)) : 0;
    const leaderMark = isLeader ? ' ★' : '';
    return `
      <div class="compare-stat-row">
        <div class="compare-stat-top">
          <span>${label}</span>
          <span class="compare-stat-val">${value}${leaderMark}</span>
        </div>
        <div class="compare-stat-track">
          <div class="compare-stat-fill" style="width: ${pct}%; background: ${gradientCss};"></div>
        </div>
      </div>
    `;
  }

  function buildCityCardHtml(slotLabel, key, p, statsMeta, escapeHtml) {
    const bannerImg = p.has_banner && p.banner_rel ? p.banner_rel : 'assets/banner.jpg';
    const plateStr = String(p.plate || 0).padStart(2, '0');
    const latStr = Number.isFinite(Number(p.lat)) ? Number(p.lat).toFixed(4) : '—';
    const lngStr = Number.isFinite(Number(p.lng)) ? Number(p.lng).toFixed(4) : '—';

    const statusBadge = p.visited
      ? '<span class="tag-badge" style="background: rgba(16,185,129,0.2); color: #6ee7b7; border-color: #10b981;">✓ Gezildi</span>'
      : '<span class="tag-badge" style="background: rgba(245,158,11,0.2); color: #fcd34d; border-color: #f59e0b;">⏳ Bekliyor</span>';

    const landmarks = Array.isArray(p.landmarks) ? p.landmarks : [];
    const specialties = Array.isArray(p.specialties) ? p.specialties : [];
    const libraryText = p.custom_library || p.library || 'İl Halk Kütüphanesi bilgisi henüz eklenmedi.';
    const quoteText = p.custom_quote || p.quote || '';

    const landmarksHtml =
      landmarks.length > 0
        ? landmarks
            .map(
              lm => `
          <div class="landmark-item">
            <span style="color: ${p.visited ? '#10b981' : '#64748b'};">${p.visited ? '✓' : '○'}</span>
            <span>${escapeHtml(lm)}</span>
          </div>
        `
            )
            .join('')
        : '<div style="font-size: 0.82rem; color: var(--text-muted);">Kayıtlı durak bulunmuyor.</div>';

    const specialtiesHtml =
      specialties.length > 0
        ? specialties
            .map(
              sp => `
          <span class="tag-badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3);">
            🍽️ ${escapeHtml(sp)}
          </span>
        `
            )
            .join('')
        : '<span style="font-size: 0.82rem; color: var(--text-muted);">Kayıtlı yöresel lezzet bulunmuyor.</span>';

    return `
      <article class="glass-card compare-card" data-compare-slot="${escapeHtml(slotLabel)}">
        <div class="compare-hero" style="background-image: url('${escapeHtml(bannerImg)}');">
          <div class="compare-hero-overlay"></div>
          <div class="compare-hero-top">
            <span class="tag-badge" style="background: rgba(15, 23, 42, 0.78); color: #f8fafc; border-color: rgba(255,255,255,0.2);">
              ${escapeHtml(slotLabel)} • Plaka ${escapeHtml(plateStr)}
            </span>
            ${statusBadge}
          </div>
          <div class="compare-hero-bottom">
            <h3 class="compare-hero-title">📍 ${escapeHtml(p.name)}</h3>
            <button type="button" class="btn btn-primary compare-open-city-btn" data-city-key="${escapeHtml(key)}">
              Şehri Aç ➔
            </button>
          </div>
        </div>

        <div class="compare-card-body">
          <!-- Region & Coordinates -->
          <div class="compare-meta-row">
            <span class="tag-badge">🗺️ ${escapeHtml(p.region || 'Bilinmiyor')} Bölgesi</span>
            <span class="compare-coords">${escapeHtml(latStr)}° K, ${escapeHtml(lngStr)}° D</span>
          </div>

          <!-- Visual Stat Comparison Bars -->
          <div class="compare-stats">
            <div class="compare-section-heading" style="color: var(--accent-cyan); margin-bottom: 2px;">
              📊 Karşılaştırma Ölçütleri
            </div>
            ${buildStatBarHtml(
              '🏛️ Miras & Durak Sayısı',
              statsMeta.landmarks,
              statsMeta.maxLandmarks,
              'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))',
              statsMeta.landmarks > statsMeta.otherLandmarks
            )}
            ${buildStatBarHtml(
              '🍽️ Yöresel Tat Sayısı',
              statsMeta.specialties,
              statsMeta.maxSpecialties,
              'linear-gradient(90deg, var(--accent-gold), #f97316)',
              statsMeta.specialties > statsMeta.otherSpecialties
            )}
            ${buildStatBarHtml(
              '📸 Fotoğraf Sayısı',
              statsMeta.photos,
              statsMeta.maxPhotos,
              'linear-gradient(90deg, var(--accent-emerald), var(--accent-cyan))',
              statsMeta.photos > statsMeta.otherPhotos
            )}
          </div>

          <!-- City Quote -->
          ${
            quoteText
              ? `
            <div>
              <div class="compare-section-heading" style="color: var(--accent-gold);">
                📜 Şehrin Ruhu
              </div>
              <p class="compare-quote">"${escapeHtml(quoteText)}"</p>
            </div>
          `
              : ''
          }

          <!-- Landmarks -->
          <div>
            <div class="compare-section-heading" style="color: var(--accent-cyan);">
              🏛️ Öne Çıkan Miras & Duraklar (${landmarks.length})
            </div>
            <div class="landmarks-list" style="grid-template-columns: 1fr;">
              ${landmarksHtml}
            </div>
          </div>

          <!-- Regional Specialties -->
          <div>
            <div class="compare-section-heading" style="color: var(--accent-gold);">
              🍽️ Yöresel Tatlar & Kültür (${specialties.length})
            </div>
            <div class="tags-cloud">
              ${specialtiesHtml}
            </div>
          </div>

          <!-- Library Office -->
          <div>
            <div class="compare-section-heading" style="color: var(--accent-emerald);">
              📚 Kütüphane Ofisi
            </div>
            <div class="compare-library-box">
              ${escapeHtml(libraryText)}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function render(container, ctx) {
    if (!container) return;

    ensureBaseStyles();

    const safeCtx = ctx || {};
    const data = safeCtx.data || (safeCtx.state && safeCtx.state.data) || (typeof window !== 'undefined' ? window.TRAVEL_DATA : null);
    const state = safeCtx.state || null;
    const escapeHtml = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const selectCity = typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};
    const calcDistKm = typeof safeCtx.calcDistKm === 'function' ? safeCtx.calcDistKm : fallbackCalcDistKm;
    const showToast = typeof safeCtx.showToast === 'function' ? safeCtx.showToast : function () {};

    if (!data || !data.provinces) {
      container.innerHTML = `
        <div class="glass-card detail-card" style="max-width: 600px; margin: 32px auto; text-align: center;">
          <h2 style="color: var(--accent-gold);">Şehir Verisi Bulunamadı</h2>
          <p style="color: var(--text-secondary);">Karşılaştırma stüdyosu için il verileri yüklenemedi.</p>
        </div>
      `;
      return;
    }

    const provinces = data.provinces;
    const sortedEntries = getSortedEntries(provinces);
    if (sortedEntries.length === 0) return;

    resolveInitialSelection(provinces, sortedEntries, state);

    const cityA = provinces[selectedKeyA];
    const cityB = provinces[selectedKeyB];
    if (!cityA || !cityB) return;

    // Distance & travel telemetry calculations
    const isSameCity = selectedKeyA === selectedKeyB;
    const airKmRaw = isSameCity
      ? 0
      : calcDistKm(Number(cityA.lat), Number(cityA.lng), Number(cityB.lat), Number(cityB.lng));
    const airKm = Number.isFinite(airKmRaw) ? Math.round(airKmRaw) : 0;
    const roadKm = Math.round(airKmRaw * ROAD_FACTOR);
    const driveHours = roadKm / AVG_SPEED_KMH;
    const driveTimeText = isSameCity ? '0 dk' : formatDrivingTime(driveHours);

    const sameRegion =
      cityA.region_code && cityB.region_code
        ? cityA.region_code === cityB.region_code
        : cityA.region === cityB.region;

    const regionRelTitle = sameRegion ? 'Aynı Bölge' : 'Farklı Bölge';
    const regionRelSub = sameRegion
      ? `${cityA.region || ''} Bölgesi içinde`
      : `${cityA.region || ''} ↔ ${cityB.region || ''}`;
    const regionRelColor = sameRegion ? 'var(--accent-emerald)' : 'var(--accent-purple)';

    // Comparison metrics
    const lmA = Array.isArray(cityA.landmarks) ? cityA.landmarks.length : 0;
    const lmB = Array.isArray(cityB.landmarks) ? cityB.landmarks.length : 0;
    const spA = Array.isArray(cityA.specialties) ? cityA.specialties.length : 0;
    const spB = Array.isArray(cityB.specialties) ? cityB.specialties.length : 0;
    const phA = getPhotoCount(cityA);
    const phB = getPhotoCount(cityB);

    const maxLandmarks = Math.max(lmA, lmB, 1);
    const maxSpecialties = Math.max(spA, spB, 1);
    const maxPhotos = Math.max(phA, phB, 1);

    const optionsA = buildCityOptionsHtml(sortedEntries, selectedKeyA, escapeHtml);
    const optionsB = buildCityOptionsHtml(sortedEntries, selectedKeyB, escapeHtml);

    container.innerHTML = `
      <div class="compare-studio">
        <div class="compare-header">
          <h2>⚖️ İki Şehri Karşılaştır</h2>
          <p>Anadolu'nun iki menzilini mesafe, coğrafya, miras, yöresel tatlar ve kütüphane ofisi açısından yan yana inceleyin.</p>
        </div>

        <!-- Selector & Action Controls -->
        <div class="glass-card compare-controls">
          <div class="compare-select-group">
            <label class="compare-select-label" for="compare-select-a">1. Şehir (Menzil A)</label>
            <select id="compare-select-a" class="region-select" aria-label="Birinci şehir seçimi">
              ${optionsA}
            </select>
          </div>

          <button type="button" id="compare-btn-swap" class="btn btn-outline" title="İki şehri yer değiştir">
            ⇄ Yer Değiştir
          </button>

          <div class="compare-select-group">
            <label class="compare-select-label" for="compare-select-b">2. Şehir (Menzil B)</label>
            <select id="compare-select-b" class="region-select" aria-label="İkinci şehir seçimi">
              ${optionsB}
            </select>
          </div>

          <button type="button" id="compare-btn-random" class="btn btn-primary" title="Rastgele iki şehir karşılaştır">
            🎲 Rastgele İkili
          </button>
        </div>

        <!-- Distance & Travel Telemetry Banner -->
        <div class="glass-card compare-telemetry">
          <div class="compare-telemetry-item">
            <span class="compare-telemetry-label">🦅 Kuş Uçuşu Mesafe</span>
            <span class="compare-telemetry-value" style="color: var(--accent-cyan);">
              ${airKm.toLocaleString('tr-TR')} km
            </span>
            <span class="compare-telemetry-sub">Haversine küresel ölçüm</span>
          </div>

          <div class="compare-telemetry-item">
            <span class="compare-telemetry-label">🛣️ Tahmini Karayolu</span>
            <span class="compare-telemetry-value" style="color: var(--accent-gold);">
              ${roadKm.toLocaleString('tr-TR')} km
            </span>
            <span class="compare-telemetry-sub">Kuş uçuşu × 1.35 katsayısı</span>
          </div>

          <div class="compare-telemetry-item">
            <span class="compare-telemetry-label">🚗 Tahmini Sürüş Süresi</span>
            <span class="compare-telemetry-value" style="color: var(--accent-emerald);">
              ${escapeHtml(driveTimeText)}
            </span>
            <span class="compare-telemetry-sub">Ortalama 80 km/sa hız ile</span>
          </div>

          <div class="compare-telemetry-item">
            <span class="compare-telemetry-label">🧭 Bölge İlişkisi</span>
            <span class="compare-telemetry-value" style="color: ${regionRelColor};">
              ${escapeHtml(regionRelTitle)}
            </span>
            <span class="compare-telemetry-sub">${escapeHtml(regionRelSub)}</span>
          </div>
        </div>

        <!-- Side-by-Side Comparison Cards -->
        <div class="compare-grid">
          ${buildCityCardHtml(
            'Menzil A',
            selectedKeyA,
            cityA,
            {
              landmarks: lmA,
              otherLandmarks: lmB,
              maxLandmarks,
              specialties: spA,
              otherSpecialties: spB,
              maxSpecialties,
              photos: phA,
              otherPhotos: phB,
              maxPhotos
            },
            escapeHtml
          )}

          ${buildCityCardHtml(
            'Menzil B',
            selectedKeyB,
            cityB,
            {
              landmarks: lmB,
              otherLandmarks: lmA,
              maxLandmarks,
              specialties: spB,
              otherSpecialties: spA,
              maxSpecialties,
              photos: phB,
              otherPhotos: phA,
              maxPhotos
            },
            escapeHtml
          )}
        </div>
      </div>
    `;

    // Bind interactive listeners
    const selectAEl = container.querySelector('#compare-select-a');
    const selectBEl = container.querySelector('#compare-select-b');
    const swapBtn = container.querySelector('#compare-btn-swap');
    const randomBtn = container.querySelector('#compare-btn-random');

    if (selectAEl) {
      selectAEl.addEventListener('change', function () {
        selectedKeyA = selectAEl.value;
        if (state) state.compareCityA = selectedKeyA;
        render(container, safeCtx);
      });
    }

    if (selectBEl) {
      selectBEl.addEventListener('change', function () {
        selectedKeyB = selectBEl.value;
        if (state) state.compareCityB = selectedKeyB;
        render(container, safeCtx);
      });
    }

    if (swapBtn) {
      swapBtn.addEventListener('click', function () {
        const tmp = selectedKeyA;
        selectedKeyA = selectedKeyB;
        selectedKeyB = tmp;
        if (state) {
          state.compareCityA = selectedKeyA;
          state.compareCityB = selectedKeyB;
        }
        render(container, safeCtx);
        showToast('⇄ Şehirler yer değiştirildi');
      });
    }

    if (randomBtn) {
      randomBtn.addEventListener('click', function () {
        if (sortedEntries.length < 2) return;
        const idxA = Math.floor(Math.random() * sortedEntries.length);
        let idxB = Math.floor(Math.random() * (sortedEntries.length - 1));
        if (idxB >= idxA) idxB += 1;

        selectedKeyA = sortedEntries[idxA][0];
        selectedKeyB = sortedEntries[idxB][0];
        if (state) {
          state.compareCityA = selectedKeyA;
          state.compareCityB = selectedKeyB;
        }
        render(container, safeCtx);
        showToast(
          `🎲 ${provinces[selectedKeyA].name} vs ${provinces[selectedKeyB].name}`
        );
      });
    }

    container.querySelectorAll('.compare-open-city-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const key = btn.getAttribute('data-city-key');
        if (key) {
          selectCity(key);
        }
      });
    });
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.cityCompare = {
    render: render
  };
})();
