/* ==========================================================================
   Dijital Seyyah — Data Vault (Backup, Restore & GeoJSON Export Hub)
   Shortcut: Alt + B | Export/Import personal Seyyah localStorage + GeoJSON
   ========================================================================== */
(function () {
  'use strict';

  const BACKUP_SCHEMA = 'dijital-seyyah-vault-v1';
  const KEY_PREFIXES = ['seyyah', 'dijital_seyyah', 'dijitalSeyyah', 'travel_', 'anadolu_', 'ds_'];

  let modalEl = null;

  function isSeyyahKey(key) {
    const lower = String(key || '').toLowerCase();
    return KEY_PREFIXES.some((p) => lower.startsWith(p.toLowerCase()));
  }

  function collectVaultData() {
    const entries = {};
    let totalBytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !isSeyyahKey(k)) continue;
        const val = localStorage.getItem(k);
        entries[k] = val;
        totalBytes += (k.length + (val ? val.length : 0)) * 2;
      }
    } catch (e) {
      // Storage unavailable
    }
    return {
      entries,
      count: Object.keys(entries).length,
      kb: (totalBytes / 1024).toFixed(1)
    };
  }

  function triggerDownload(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
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

  function exportJsonBackup() {
    const vault = collectVaultData();
    const payload = {
      schema: BACKUP_SCHEMA,
      exported_at: new Date().toISOString(),
      app: 'Dijital Seyyah — Anadolu Seyahatnamesi',
      keys_count: vault.count,
      data: vault.entries
    };
    const stamp = new Date().toISOString().slice(0, 10);
    triggerDownload(
      `dijital-seyyah-yedek-${stamp}.json`,
      JSON.stringify(payload, null, 2),
      'application/json;charset=utf-8'
    );
    notify(`💾 ${vault.count} kişisel kayıt JSON olarak indirildi.`);
  }

  function buildGeoJson(visitedOnly) {
    const raw = window.TRAVEL_DATA || window.SEYYAH_DATA || null;
    const provincesObj = raw && raw.provinces ? raw.provinces : {};
    const features = [];

    Object.keys(provincesObj).forEach((key) => {
      const p = provincesObj[key];
      if (!p || typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
      if (visitedOnly && !p.visited) return;
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p.lng, p.lat]
        },
        properties: {
          id: key,
          plate: p.plate,
          name: p.name,
          region: p.region,
          region_code: p.region_code,
          visited: Boolean(p.visited),
          library: p.custom_library || p.library || '',
          landmarks: p.landmarks || [],
          specialties: p.specialties || [],
          quote: p.custom_quote || p.quote || ''
        }
      });
    });

    return {
      type: 'FeatureCollection',
      name: visitedOnly ? 'Dijital_Seyyah_Ziyaret_Edilen_Iller' : 'Dijital_Seyyah_81_Il_Anadolu',
      generated_at: new Date().toISOString(),
      features
    };
  }

  function exportGeoJson(visitedOnly) {
    const fc = buildGeoJson(visitedOnly);
    const stamp = new Date().toISOString().slice(0, 10);
    const suffix = visitedOnly ? 'ziyaret-edilen' : '81-il';
    triggerDownload(
      `anadolu-seyahatnamesi-${suffix}-${stamp}.geojson`,
      JSON.stringify(fc, null, 2),
      'application/geo+json;charset=utf-8'
    );
    notify(`🗺️ ${fc.features.length} il GeoJSON (RFC 7946) olarak dışa aktarıldı.`);
  }

  function importJsonBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        if (!parsed || typeof parsed.data !== 'object' || Array.isArray(parsed.data)) {
          notify('⚠️ Geçersiz yedek dosyası formatı.');
          return;
        }
        let restored = 0;
        Object.keys(parsed.data).forEach((k) => {
          if (!isSeyyahKey(k)) return;
          const v = parsed.data[k];
          if (typeof v === 'string') {
            localStorage.setItem(k, v);
            restored++;
          }
        });
        refreshStats();
        notify(`✅ ${restored} kayıt geri yüklendi. Değişiklikler için sayfa yenilenebilir.`);
      } catch (err) {
        notify('⚠️ JSON dosyası okunamadı.');
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function notify(msg) {
    const toast = document.getElementById('toast-container');
    if (toast) {
      const el = document.createElement('div');
      el.className = 'toast show';
      el.textContent = msg;
      toast.appendChild(el);
      setTimeout(() => el.remove(), 3400);
    }
  }

  function refreshStats() {
    if (!modalEl) return;
    const vault = collectVaultData();
    const raw = window.TRAVEL_DATA || {};
    const visitedCount = raw.stats ? raw.stats.visited_cities : 39;
    modalEl.querySelector('#vault-stat-keys').textContent = vault.count;
    modalEl.querySelector('#vault-stat-size').textContent = `${vault.kb} KB`;
    modalEl.querySelector('#vault-stat-cities').textContent = `${visitedCount} / 81`;
  }

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement('div');
    modalEl.id = 'seyyah-data-vault-modal';
    modalEl.className = 'vault-modal-overlay';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('aria-label', 'Seyyah Veri Kasası ve Dışa Aktarım');
    modalEl.innerHTML = `
      <div class="vault-modal-card">
        <div class="vault-header">
          <h2>🗄️ Seyyah Veri Kasası &amp; GeoJSON</h2>
          <button type="button" class="monument-lb-btn close-btn" id="vault-close-btn" aria-label="Kapat">&times;</button>
        </div>
        <div class="vault-stats-grid">
          <div class="vault-stat-box">
            <div class="vault-stat-val" id="vault-stat-keys">0</div>
            <div class="vault-stat-lbl">Kişisel Kayıt Anahtarı</div>
          </div>
          <div class="vault-stat-box">
            <div class="vault-stat-val" id="vault-stat-size">0 KB</div>
            <div class="vault-stat-lbl">Tarayıcı Depolama</div>
          </div>
          <div class="vault-stat-box">
            <div class="vault-stat-val" id="vault-stat-cities">39 / 81</div>
            <div class="vault-stat-lbl">Keşfedilen İl</div>
          </div>
        </div>
        <div class="vault-actions-grid">
          <div class="vault-action-card">
            <h3>💾 Kişisel Yedeği İndir</h3>
            <p>Günlük notları, pasaport damgaları, favoriler, okuma alıntıları ve çanta listeni tek JSON dosyasında sakla.</p>
            <button type="button" class="vault-btn" id="vault-export-json">⬇️ JSON Yedeği İndir</button>
          </div>
          <div class="vault-action-card">
            <h3>📥 Yedekten Geri Yükle</h3>
            <p>Daha önce indirdiğin Dijital Seyyah yedek dosyasını güvenli doğrulama ile tarayıcıya geri aktar.</p>
            <input type="file" id="vault-import-input" accept="application/json,.json" hidden />
            <button type="button" class="vault-btn gold" id="vault-import-btn">📂 JSON Dosyası Seç</button>
          </div>
          <div class="vault-action-card">
            <h3>🗺️ GeoJSON (Ziyaret Edilen)</h3>
            <p>Ziyaret edilen illeri koordinat, miras ve kütüphane bilgileriyle QGIS / Google Earth uyumlu dışa aktar.</p>
            <button type="button" class="vault-btn" id="vault-geo-visited">🧭 Ziyaret Edilen GeoJSON</button>
          </div>
          <div class="vault-action-card">
            <h3>🌍 GeoJSON (Tüm 81 İl)</h3>
            <p>Türkiye'nin 81 ilini kapsayan tam Anadolu Seyahatnamesi veri setini standart RFC 7946 GeoJSON indir.</p>
            <button type="button" class="vault-btn gold" id="vault-geo-all">🌐 81 İl Tam GeoJSON</button>
          </div>
        </div>
        <div class="vault-footer-note">
          <span>🔒 Tüm kişisel veriler yalnızca tarayıcında saklanır (Zero-Backend).</span>
          <kbd class="cmd-kbd">Alt + B</kbd>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);

    modalEl.querySelector('#vault-close-btn').addEventListener('click', close);
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) close();
    });
    modalEl.querySelector('#vault-export-json').addEventListener('click', exportJsonBackup);
    modalEl.querySelector('#vault-geo-visited').addEventListener('click', () => exportGeoJson(true));
    modalEl.querySelector('#vault-geo-all').addEventListener('click', () => exportGeoJson(false));

    const fileInput = modalEl.querySelector('#vault-import-input');
    modalEl.querySelector('#vault-import-btn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importJsonBackup(e.target.files[0]);
        e.target.value = '';
      }
    });

    return modalEl;
  }

  function open() {
    ensureModal();
    refreshStats();
    modalEl.classList.add('active');
  }

  function close() {
    if (modalEl) modalEl.classList.remove('active');
  }

  // Keyboard shortcut: Alt + B to toggle Data Vault
  document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      if (modalEl && modalEl.classList.contains('active')) {
        close();
      } else {
        open();
      }
    } else if (e.key === 'Escape' && modalEl && modalEl.classList.contains('active')) {
      close();
    }
  });

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.dataVault = {
    open,
    close,
    exportJsonBackup,
    exportGeoJson,
    buildGeoJson
  };
})();
