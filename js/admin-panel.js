/**
 * Anadolu Seyahatnamesi — Dijital Seyyah Admin Paneli
 * SHA-256 Yerel Şifre Kilidi, 81 İl Canlı Düzenleyici, Rota Yöneticisi,
 * Gemini API Testi, GitHub API Doğrudan Commit & Sistem Tanılama.
 * Registers on window.SEYYAH_MODULES.admin = { render(container, ctx), applyOverrides(data) }
 */

(function () {
  'use strict';

  const KEYS = {
    pinHash: 'dijital_seyyah_admin_pin_hash',
    overrides: 'dijital_seyyah_admin_city_overrides',
    routeOverride: 'dijital_seyyah_admin_custom_route',
    ghConfig: 'dijital_seyyah_admin_github_cfg',
    geminiKey: 'dijital_seyyah_gemini_api_key',
    geminiModel: 'dijital_seyyah_gemini_model'
  };

  const AUTH_SALT = 'dijital-seyyah-v15-salt';
  const AUTH_DIGEST = 'f395248b5e6e762e29e4a39072cd95c978ac5525eff489ae71bdf86e801f6f7f';
  const SESSION_KEY = 'dijital_seyyah_admin_auth_ok';
  const ALLOWED_OWNER = 'bahattinyunus';
  const TARGET_REPO = 'dijitalseyyah';

  let isUnlocked = (
    sessionStorage.getItem(SESSION_KEY) === AUTH_DIGEST ||
    localStorage.getItem(SESSION_KEY) === AUTH_DIGEST
  );
  let activeTab = 'cities'; // 'cities' | 'route' | 'apis' | 'system'
  let selectedEditKey = '01_Marmara/Istanbul';
  let citySearch = '';

  async function verifyAdminCredentials(username, password) {
    const cleanUser = (username || '').trim().replace(/\s+/g, ' ').toLowerCase();
    const cleanPass = (password || '').trim();
    const digest = await sha256Hex(`${AUTH_SALT}:${cleanUser}:${cleanPass}`);
    return digest === AUTH_DIGEST;
  }

  function fallbackEscape(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fallbackNormalize(str) {
    if (!str) return '';
    return String(str)
      .replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase()
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
      .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').trim();
  }

  async function sha256Hex(text) {
    if (window.crypto && window.crypto.subtle) {
      const buf = new TextEncoder().encode(text);
      const hashBuf = await window.crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback deterministic hash if crypto.subtle unavailable on insecure context
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function recomputeStats(data) {
    if (!data || !data.provinces || !data.stats) return;
    const entries = Object.entries(data.provinces);
    const total = entries.length;
    const visited = entries.filter(([, p]) => p.visited).length;
    data.stats.visited_cities = visited;
    data.stats.unvisited_cities = total - visited;
    data.stats.progress_pct = total ? Math.round((visited / total) * 1000) / 10 : 0;
    data.stats.days_on_road = visited * 5;
    data.stats.library_hours = visited * 20;

    if (data.stats.regional_breakdown) {
      let visitedRegions = 0;
      for (const [regCode, rStat] of Object.entries(data.stats.regional_breakdown)) {
        const regEntries = entries.filter(([k]) => k.startsWith(regCode));
        const regVisited = regEntries.filter(([, p]) => p.visited).length;
        if (regVisited > 0) visitedRegions += 1;
        rStat.total = regEntries.length;
        rStat.visited = regVisited;
        rStat.percentage = regEntries.length ? Math.round((regVisited / regEntries.length) * 1000) / 10 : 0;
      }
      data.stats.visited_regions = visitedRegions;
    }
  }

  function applyOverrides(data, state) {
    if (!data || !data.provinces) return;
    const overrides = readJson(KEYS.overrides, {});
    let changed = false;
    for (const [k, patch] of Object.entries(overrides)) {
      if (data.provinces[k] && patch && typeof patch === 'object') {
        Object.assign(data.provinces[k], patch);
        changed = true;
      }
    }
    if (changed) recomputeStats(data);

    const routeOverride = readJson(KEYS.routeOverride, null);
    if (Array.isArray(routeOverride) && routeOverride.length > 0) {
      data.custom_route = [...routeOverride];
      if (state) state.customRouteCities = [...routeOverride];
    }
  }

  function generateCityMarkdown(p) {
    const landmarksMd = (p.landmarks || []).map(l => `- [${p.visited ? 'x' : ' '}] **${l}**`).join('\n');
    const specialtiesMd = (p.specialties || []).join(', ');
    const footer = p.visited
      ? '*Bu il bizzat deneyimlenmiş, yolları aşındırılmış ve seyahatnameye sevgiyle işlenmiştir.* ✅'
      : '*Bu kadim menzil henüz adımlanmamış olup sıradaki sefer rotasında yer almaktadır.*';

    return `<p align="center">
  <img src="banner.jpg" alt="${p.name}" width="100%" style="border-radius: 12px; max-height: 420px; object-fit: cover;" />
</p>

# 📍 ${p.name} - Seyahat ve Tefekkür Notları

## 📜 Şehrin Ruhu
> "${p.custom_quote || p.quote || ''}"

### 🌍 Şehrin Dokusu ve Tarihsel Arka Planı
${p.history || p.quote || ''}

### 🕊️ Gezginin Not Defterinden (Manevi Boyut ve Tefekkür)
${p.reflection || 'Yolun ve şehrin hikmetini tefekkür ederek adımlanan kadim bir menzil.'}

### 🍽️ Yöresel Lezzetler
${specialtiesMd}

### 💻 Yarı Göçebe Mesaisi (İlim Tahsili & Kütüphane)
* *Seyyahın Kütüphane Notu:* ${p.custom_library || p.library || ''}

### ✨ Keşfedilesi Duraklar ve Landmarks
${landmarksMd}

### 📸 Menzil Fotoğraf Galerisi
<table>
  <tr>
    <td width="50%" align="center"><img src="banner.jpg" alt="${p.name} Kapak" width="100%" style="border-radius: 8px;" /></td>
    <td width="50%" align="center"><img src="gallery.jpg" alt="${p.name} Vitrin" width="100%" style="border-radius: 8px;" /></td>
  </tr>
</table>

---
${footer}
`;
  }

  function ensureStyles() {
    if (document.getElementById('seyyah-admin-styles')) return;
    const style = document.createElement('style');
    style.id = 'seyyah-admin-styles';
    style.textContent = `
      .adm-shell { display: flex; flex-direction: column; gap: 18px; max-width: 1120px; margin: 0 auto; }
      .adm-lock-card { max-width: 460px; margin: 40px auto; padding: 30px 26px; text-align: center; display: flex; flex-direction: column; gap: 14px; }
      .adm-lock-icon { font-size: 2.6rem; }
      .adm-topbar { padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
      .adm-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
      .adm-grid-2 { display: grid; grid-template-columns: 310px 1fr; gap: 16px; align-items: start; }
      .adm-city-scroll { max-height: 540px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding-right: 4px; }
      .adm-city-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-radius: 10px; background: rgba(15,23,42,0.55); border: 1px solid var(--border-glass); cursor: pointer; font-size: 0.84rem; transition: all 0.18s ease; }
      .adm-city-row:hover { border-color: var(--accent-cyan); }
      .adm-city-row.active { border-color: var(--accent-cyan); background: rgba(0,242,254,0.14); }
      .adm-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
      .adm-field label { font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
      .adm-input, .adm-textarea { width: 100%; padding: 9px 12px; border-radius: 10px; background: rgba(15,23,42,0.65); border: 1px solid var(--border-glass); color: var(--text-primary); font-family: var(--font-body); font-size: 0.86rem; outline: none; }
      .adm-input:focus, .adm-textarea:focus { border-color: var(--accent-cyan); }
      .adm-textarea { min-height: 76px; resize: vertical; line-height: 1.5; }
      .adm-route-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; border-radius: 10px; background: rgba(15,23,42,0.55); border: 1px solid var(--border-glass); }
      .adm-kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
      .adm-kpi { padding: 14px 16px; border-radius: 12px; background: rgba(15,23,42,0.55); border: 1px solid var(--border-glass); }
      .adm-kpi-val { font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: var(--accent-cyan); }
      .adm-kpi-lbl { font-size: 0.74rem; color: var(--text-muted); }
      body.light-theme .adm-city-row, body.light-theme .adm-input, body.light-theme .adm-textarea, body.light-theme .adm-route-item, body.light-theme .adm-kpi { background: rgba(241,245,249,0.9); color: #0f172a; }
      @media (max-width: 860px) { .adm-grid-2 { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
  }

  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const escapeHtml = safeCtx.escapeHtml || fallbackEscape;
    const normalize = safeCtx.normalizeTurkish || fallbackNormalize;
    const toast = safeCtx.showToast || (() => {});
    const data = safeCtx.data || {};
    const provinces = data.provinces || {};

    // 1. Lock Screen (Username + Password verified via salted SHA-256)
    if (!isUnlocked) {
      container.innerHTML = `
        <div class="adm-shell">
          <div class="glass-card adm-lock-card">
            <div class="adm-lock-icon">🔐</div>
            <h2 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--accent-cyan);">
              Dijital Seyyah Yönetici Girişi
            </h2>
            <p style="font-size: 0.83rem; color: var(--text-secondary); line-height: 1.5;">
              Devam etmek için yönetici kullanıcı adınızı ve şifrenizi girin.
            </p>
            <div id="adm-auth-status" style="font-size: 0.8rem; min-height: 18px; color: #fca5a5;"></div>
            <form id="adm-auth-form" style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
              <div class="adm-field" style="margin-bottom: 2px;">
                <label>👤 Kullanıcı Adı</label>
                <input type="text" id="adm-user-input" class="adm-input" placeholder="Kullanıcı adınız" autocomplete="username" required />
              </div>
              <div class="adm-field" style="margin-bottom: 2px;">
                <label>🔑 Şifre</label>
                <input type="password" id="adm-pass-input" class="adm-input" placeholder="••••••••" autocomplete="current-password" required />
              </div>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: var(--text-secondary); cursor: pointer;">
                <input type="checkbox" id="adm-remember-chk" />
                Bu cihazda oturumu açık tut
              </label>
              <button type="submit" id="adm-auth-submit" class="btn btn-primary" style="justify-content: center; margin-top: 4px;">
                🔓 Giriş Yap
              </button>
            </form>
          </div>
        </div>
      `;

      const statusEl = document.getElementById('adm-auth-status');
      const form = document.getElementById('adm-auth-form');
      const userInput = document.getElementById('adm-user-input');
      const passInput = document.getElementById('adm-pass-input');
      const rememberChk = document.getElementById('adm-remember-chk');

      if (userInput) userInput.focus();
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const ok = await verifyAdminCredentials(userInput.value, passInput.value);
          if (ok) {
            isUnlocked = true;
            sessionStorage.setItem(SESSION_KEY, AUTH_DIGEST);
            if (rememberChk && rememberChk.checked) {
              localStorage.setItem(SESSION_KEY, AUTH_DIGEST);
            }
            toast('🔓 Hoş geldin! Admin paneli açıldı.');
            render(container, ctx);
          } else {
            if (statusEl) statusEl.textContent = '❌ Kullanıcı adı veya şifre hatalı!';
            toast('❌ Hatalı giriş!');
            passInput.value = '';
            passInput.focus();
          }
        });
      }
      return;
    }

    // 2. Unlocked Admin Shell
    const overrides = readJson(KEYS.overrides, {});
    const overrideCount = Object.keys(overrides).length;
    const ghCfg = readJson(KEYS.ghConfig, { owner: 'bahattinyunus', repo: 'dijitalseyyah', branch: 'main', token: '' });

    let tabBodyHtml = '';

    if (activeTab === 'cities') {
      const sortedEntries = Object.entries(provinces)
        .filter(([, p]) => !citySearch || normalize(`${p.name} ${p.plate} ${p.region}`).includes(normalize(citySearch)))
        .sort((a, b) => a[1].name.localeCompare(b[1].name, 'tr'));

      if (!provinces[selectedEditKey] && sortedEntries.length) {
        selectedEditKey = sortedEntries[0][0];
      }
      const p = provinces[selectedEditKey] || {};

      const listHtml = sortedEntries.map(([k, item]) => `
        <div class="adm-city-row ${k === selectedEditKey ? 'active' : ''}" data-adm-select="${escapeHtml(k)}">
          <span><strong>${String(item.plate).padStart(2, '0')}</strong> ${escapeHtml(item.name)}</span>
          <span style="font-size: 0.74rem; color: ${item.visited ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
            ${overrides[k] ? '✎ ' : ''}${item.visited ? '✅ Gezildi' : '⏳ Bekliyor'}
          </span>
        </div>
      `).join('');

      tabBodyHtml = `
        <div class="adm-grid-2">
          <div class="glass-card detail-card" style="padding: 16px;">
            <input type="text" id="adm-city-search" class="adm-input" placeholder="🔍 81 il içinde ara..." value="${escapeHtml(citySearch)}" style="margin-bottom: 10px;" />
            <div class="adm-city-scroll">${listHtml}</div>
          </div>

          <div class="glass-card detail-card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div>
                <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: var(--accent-cyan);">
                  📍 ${escapeHtml(p.name)} (${String(p.plate || 0).padStart(2, '0')}) — ${escapeHtml(p.region)}
                </h3>
                <div style="font-size: 0.76rem; color: var(--text-muted);">Dosya: <code>${escapeHtml(p.readme_rel || '')}</code></div>
              </div>
              <label style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; background: rgba(16,185,129,0.14); border: 1px solid rgba(16,185,129,0.35); cursor: pointer; font-weight: 700; font-size: 0.84rem; color: #6ee7b7;">
                <input type="checkbox" id="adm-f-visited" ${p.visited ? 'checked' : ''} />
                Ziyaret Edildi (✅)
              </label>
            </div>

            <div class="adm-field">
              <label>📜 Şehrin Ruhu (Alıntı)</label>
              <input type="text" id="adm-f-quote" class="adm-input" value="${escapeHtml(p.custom_quote || p.quote || '')}" />
            </div>
            <div class="adm-field">
              <label>📖 Seyyahın Kütüphane Notu</label>
              <input type="text" id="adm-f-library" class="adm-input" value="${escapeHtml(p.custom_library || p.library || '')}" />
            </div>
            <div class="adm-field">
              <label>🌍 Tarihsel Arka Plan</label>
              <textarea id="adm-f-history" class="adm-textarea">${escapeHtml(p.history || '')}</textarea>
            </div>
            <div class="adm-field">
              <label>🕊️ Manevi Boyut & Tefekkür Notu</label>
              <textarea id="adm-f-reflection" class="adm-textarea">${escapeHtml(p.reflection || '')}</textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="adm-field">
                <label>🏛️ Öne Çıkan Miraslar (virgülle ayır)</label>
                <input type="text" id="adm-f-landmarks" class="adm-input" value="${escapeHtml((p.landmarks || []).join(', '))}" />
              </div>
              <div class="adm-field">
                <label>🍽️ Yöresel Tatlar (virgülle ayır)</label>
                <input type="text" id="adm-f-specialties" class="adm-input" value="${escapeHtml((p.specialties || []).join(', '))}" />
              </div>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px;">
              <button type="button" class="btn btn-primary" id="adm-save-city">💾 Canlı Kaydet (Önizle)</button>
              <button type="button" class="btn btn-outline" id="adm-dl-readme">📥 README.md İndir</button>
              <button type="button" class="btn btn-outline" id="adm-gh-push-city" style="border-color: rgba(16,185,129,0.5); color: #6ee7b7;">🚀 GitHub'a Direkt Commit Et</button>
              <button type="button" class="btn btn-outline" id="adm-view-city">👁️ Sayfayı Gör</button>
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === 'route') {
      const routeCities = (safeCtx.state && safeCtx.state.customRouteCities) || data.custom_route || [];
      const sortedNames = Object.values(provinces).map(p => p.name).sort((a, b) => a.localeCompare(b, 'tr'));

      tabBodyHtml = `
        <div class="glass-card detail-card">
          <h3 style="font-family: var(--font-heading); color: var(--accent-cyan);">🧭 Aktif Sefer Rotası Yöneticisi (${routeCities.length} Durak)</h3>
          <p style="font-size: 0.84rem; color: var(--text-secondary);">Buradan yaptığınız değişiklikler Rota Planlayıcı, Vektör Atlas ve Ana Sayfa sefer şeridine anında yansır.</p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
            <select id="adm-route-add-sel" class="region-select" style="flex: 1; min-width: 220px;">
              ${sortedNames.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('')}
            </select>
            <button type="button" class="btn btn-primary" id="adm-route-add-btn">➕ Durak Ekle</button>
            <button type="button" class="btn btn-outline" id="adm-route-reset-btn">↺ Varsayılana Sıfırla</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
            ${routeCities.map((city, idx) => `
              <div class="adm-route-item">
                <span><strong style="color: var(--accent-gold);">#${idx + 1}</strong> ${escapeHtml(city)}</span>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn btn-outline" style="padding: 4px 9px;" data-adm-rmove="${idx}:-1" ${idx === 0 ? 'disabled' : ''}>↑</button>
                  <button type="button" class="btn btn-outline" style="padding: 4px 9px;" data-adm-rmove="${idx}:1" ${idx === routeCities.length - 1 ? 'disabled' : ''}>↓</button>
                  <button type="button" class="btn btn-outline" style="padding: 4px 9px; color: #fca5a5;" data-adm-rdel="${idx}">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (activeTab === 'apis') {
      const curGeminiKey = localStorage.getItem(KEYS.geminiKey) || '';
      const curGeminiModel = localStorage.getItem(KEYS.geminiModel) || 'gemini-2.5-flash';

      tabBodyHtml = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
          <div class="glass-card detail-card">
            <h3 style="font-family: var(--font-heading); color: var(--accent-cyan);">✨ Gemini AI Yapılandırması</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Canlıda Netlify <code>GEMINI_API_KEY</code> kullanılır; isterseniz burada kişisel anahtarınızı kaydedip canlı bağlantıyı test edebilirsiniz.</p>
            <div class="adm-field">
              <label>Varsayılan Gemini Modeli</label>
              <select id="adm-gem-model" class="region-select">
                <option value="gemini-2.5-flash" ${curGeminiModel === 'gemini-2.5-flash' ? 'selected' : ''}>⚡ gemini-2.5-flash (Hızlı &amp; Ekonomik)</option>
                <option value="gemini-2.5-flash-lite" ${curGeminiModel === 'gemini-2.5-flash-lite' ? 'selected' : ''}>🪶 gemini-2.5-flash-lite (Yüksek Ücretsiz Kota)</option>
                <option value="gemini-2.5-pro" ${curGeminiModel === 'gemini-2.5-pro' ? 'selected' : ''}>🧠 gemini-2.5-pro (Derin Muhakeme)</option>
                <option value="gemini-2.0-flash" ${curGeminiModel === 'gemini-2.0-flash' ? 'selected' : ''}>🚀 gemini-2.0-flash</option>
              </select>
            </div>
            <div class="adm-field">
              <label>Kişisel Gemini API Key (Opsiyonel BYOK)</label>
              <input type="password" id="adm-gem-key" class="adm-input" placeholder="AIza..." value="${escapeHtml(curGeminiKey)}" />
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn btn-primary" id="adm-gem-save">💾 Kaydet</button>
              <button type="button" class="btn btn-outline" id="adm-gem-test">🧪 Bağlantıyı Test Et</button>
            </div>
            <div id="adm-gem-test-out" style="font-size: 0.8rem; color: var(--text-secondary);"></div>
          </div>

          <div class="glass-card detail-card">
            <h3 style="font-family: var(--font-heading); color: var(--accent-emerald);">🚀 GitHub Doğrudan Yayın (GitHub API)</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Fine-grained veya Classic GitHub PAT (<code>contents: write</code>) girerseniz, "81 İl" sekmesindeki <strong>GitHub'a Direkt Commit Et</strong> butonu dosyayı doğrudan reponuza işler ve Netlify'ı tetikler.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div class="adm-field"><label>Owner</label><input type="text" id="adm-gh-owner" class="adm-input" value="${escapeHtml(ghCfg.owner)}" /></div>
              <div class="adm-field"><label>Repo</label><input type="text" id="adm-gh-repo" class="adm-input" value="${escapeHtml(ghCfg.repo)}" /></div>
            </div>
            <div class="adm-field"><label>Branch</label><input type="text" id="adm-gh-branch" class="adm-input" value="${escapeHtml(ghCfg.branch)}" /></div>
            <div class="adm-field"><label>GitHub Personal Access Token (Sadece localStorage)</label><input type="password" id="adm-gh-token" class="adm-input" placeholder="ghp_... veya github_pat_..." value="${escapeHtml(ghCfg.token || '')}" /></div>
            <button type="button" class="btn btn-primary" id="adm-gh-save">💾 GitHub Ayarlarını Kaydet</button>
          </div>
        </div>
      `;
    } else {
      const modCount = Object.keys(window.SEYYAH_MODULES || {}).length;
      const lsBytes = Object.keys(localStorage).reduce((sum, k) => sum + ((localStorage.getItem(k) || '').length * 2), 0);
      tabBodyHtml = `
        <div class="glass-card detail-card">
          <h3 style="font-family: var(--font-heading); color: var(--accent-cyan);">💾 Sistem Tanılama & Yedekleme</h3>
          <div class="adm-kpi-grid">
            <div class="adm-kpi"><div class="adm-kpi-val">${data.stats ? data.stats.visited_cities : 0} / 81</div><div class="adm-kpi-lbl">Ziyaret Edilen İl</div></div>
            <div class="adm-kpi"><div class="adm-kpi-val">${data.stats ? data.stats.total_photos || 162 : 162}</div><div class="adm-kpi-lbl">Fotoğraf Arşivi</div></div>
            <div class="adm-kpi"><div class="adm-kpi-val">${modCount}</div><div class="adm-kpi-lbl">Yüklü JS Modülü</div></div>
            <div class="adm-kpi"><div class="adm-kpi-val">${overrideCount} İl</div><div class="adm-kpi-lbl">Yerel Düzenleme</div></div>
            <div class="adm-kpi"><div class="adm-kpi-val">${(lsBytes / 1024).toFixed(1)} KB</div><div class="adm-kpi-lbl">Tarayıcı Depolama</div></div>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px;">
            <button type="button" class="btn btn-primary" id="adm-export-data">📥 Güncel travel_data.json İndir</button>
            <button type="button" class="btn btn-outline" id="adm-clear-sw">🧹 Önbelleği (SW) Temizle & Yenile</button>
            <button type="button" class="btn btn-outline" id="adm-clear-overrides" style="color: #fca5a5;">↺ Yerel Şehir Değişikliklerini Sıfırla</button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="adm-shell">
        <div class="glass-card adm-topbar">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 1.35rem; color: var(--accent-cyan); display: flex; align-items: center; gap: 8px;">
              ⚙️ Dijital Seyyah Admin Paneli
            </h2>
            <p style="font-size: 0.78rem; color: var(--text-secondary);">81 İl İçerik Yönetimi • Rota Editörü • Gemini AI &amp; GitHub Doğrudan Yayın</p>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <div class="adm-tabs">
              <button type="button" class="filter-pill ${activeTab === 'cities' ? 'active' : ''}" data-adm-tab="cities">🗺️ 81 İl (${overrideCount})</button>
              <button type="button" class="filter-pill ${activeTab === 'route' ? 'active' : ''}" data-adm-tab="route">🧭 Rota</button>
              <button type="button" class="filter-pill ${activeTab === 'apis' ? 'active' : ''}" data-adm-tab="apis">🔑 API &amp; GitHub</button>
              <button type="button" class="filter-pill ${activeTab === 'system' ? 'active' : ''}" data-adm-tab="system">💾 Sistem</button>
            </div>
            <button type="button" class="btn btn-outline" id="adm-lock-btn" style="padding: 6px 12px; font-size: 0.78rem;">🔒 Kilitle</button>
          </div>
        </div>
        ${tabBodyHtml}
      </div>
    `;

    // Tab switching & lock
    container.querySelectorAll('[data-adm-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-adm-tab');
        render(container, ctx);
      });
    });

    const lockBtn = document.getElementById('adm-lock-btn');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        isUnlocked = false;
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY);
        toast('🔒 Oturum kapatıldı ve panel kilitlendi');
        render(container, ctx);
      });
    }

    // Bind Cities tab
    if (activeTab === 'cities') {
      const searchEl = document.getElementById('adm-city-search');
      if (searchEl) {
        searchEl.addEventListener('input', (e) => {
          citySearch = e.target.value;
          render(container, ctx);
          const nextSearch = document.getElementById('adm-city-search');
          if (nextSearch) { nextSearch.focus(); nextSearch.setSelectionRange(citySearch.length, citySearch.length); }
        });
      }
      container.querySelectorAll('[data-adm-select]').forEach(row => {
        row.addEventListener('click', () => {
          selectedEditKey = row.getAttribute('data-adm-select');
          render(container, ctx);
        });
      });

      const collectPatch = () => ({
        visited: !!document.getElementById('adm-f-visited').checked,
        custom_quote: document.getElementById('adm-f-quote').value.trim(),
        custom_library: document.getElementById('adm-f-library').value.trim(),
        history: document.getElementById('adm-f-history').value.trim(),
        reflection: document.getElementById('adm-f-reflection').value.trim(),
        landmarks: document.getElementById('adm-f-landmarks').value.split(',').map(s => s.trim()).filter(Boolean),
        specialties: document.getElementById('adm-f-specialties').value.split(',').map(s => s.trim()).filter(Boolean)
      });

      const saveBtn = document.getElementById('adm-save-city');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const patch = collectPatch();
          const allOv = readJson(KEYS.overrides, {});
          allOv[selectedEditKey] = patch;
          writeJson(KEYS.overrides, allOv);
          Object.assign(provinces[selectedEditKey], patch);
          recomputeStats(data);
          toast(`✅ ${provinces[selectedEditKey].name} canlı olarak güncellendi!`);
          render(container, ctx);
        });
      }

      const dlBtn = document.getElementById('adm-dl-readme');
      if (dlBtn) {
        dlBtn.addEventListener('click', () => {
          const merged = { ...provinces[selectedEditKey], ...collectPatch() };
          const md = generateCityMarkdown(merged);
          const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${merged.slug || 'sehir'}_README.md`;
          a.click();
          URL.revokeObjectURL(url);
          toast('📥 README.md indirildi');
        });
      }

      const ghPushBtn = document.getElementById('adm-gh-push-city');
      if (ghPushBtn) {
        ghPushBtn.addEventListener('click', async () => {
          const cfg = readJson(KEYS.ghConfig, { owner: ALLOWED_OWNER, repo: TARGET_REPO, branch: 'main', token: '' });
          const activeToken = (cfg && cfg.token) || sessionStorage.getItem('dijital_seyyah_admin_session_pat') || '';
          if (!activeToken) {
            toast('⚠️ GitHub oturum tokenı bulunamadı.');
            return;
          }
          cfg.token = activeToken;
          cfg.owner = cfg.owner || ALLOWED_OWNER;
          cfg.repo = cfg.repo || TARGET_REPO;
          const merged = { ...provinces[selectedEditKey], ...collectPatch() };
          const md = generateCityMarkdown(merged);
          const apiBase = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${merged.readme_rel}`;
          ghPushBtn.disabled = true;
          ghPushBtn.textContent = '⏳ Gönderiliyor...';
          try {
            let sha;
            const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(cfg.branch || 'main')}`, {
              headers: { Authorization: `Bearer ${cfg.token}`, Accept: 'application/vnd.github+json' }
            });
            if (getRes.ok) {
              const meta = await getRes.json();
              sha = meta.sha;
            }
            const b64 = btoa(unescape(encodeURIComponent(md)));
            const putRes = await fetch(apiBase, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${cfg.token}`,
                Accept: 'application/vnd.github+json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                message: `feat(${merged.region}): ${merged.name} Admin Paneli uzerinden guncellendi`,
                content: b64,
                branch: cfg.branch || 'main',
                ...(sha ? { sha } : {})
              })
            });
            if (!putRes.ok) {
              const errData = await putRes.json().catch(() => ({}));
              throw new Error(errData.message || `HTTP ${putRes.status}`);
            }
            toast(`🚀 ${merged.name} doğrudan GitHub'a commit edildi!`);
          } catch (err) {
            toast(`❌ GitHub hatası: ${err.message}`);
          } finally {
            ghPushBtn.disabled = false;
            ghPushBtn.textContent = '🚀 GitHub\'a Direkt Commit Et';
          }
        });
      }

      const viewBtn = document.getElementById('adm-view-city');
      if (viewBtn) {
        viewBtn.addEventListener('click', () => {
          if (typeof safeCtx.selectCity === 'function') safeCtx.selectCity(selectedEditKey);
        });
      }
    }

    // Bind Route tab
    if (activeTab === 'route') {
      const saveRoute = (arr) => {
        writeJson(KEYS.routeOverride, arr);
        data.custom_route = [...arr];
        if (safeCtx.state) safeCtx.state.customRouteCities = [...arr];
        render(container, ctx);
      };

      const addBtn = document.getElementById('adm-route-add-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const val = document.getElementById('adm-route-add-sel').value;
          const cur = [...((safeCtx.state && safeCtx.state.customRouteCities) || data.custom_route || [])];
          if (val && !cur.includes(val)) {
            cur.push(val);
            saveRoute(cur);
            toast(`➕ ${val} rotaya eklendi`);
          }
        });
      }

      const resetBtn = document.getElementById('adm-route-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          localStorage.removeItem(KEYS.routeOverride);
          const def = ['Ankara', 'Çankırı', 'Kastamonu', 'Karabük', 'Bartın', 'Zonguldak', 'Düzce', 'Sakarya', 'İstanbul', 'Edirne'];
          data.custom_route = [...def];
          if (safeCtx.state) safeCtx.state.customRouteCities = [...def];
          toast('↺ Varsayılan Ankara ➔ Edirne rotasına dönüldü');
          render(container, ctx);
        });
      }

      container.querySelectorAll('[data-adm-rmove]').forEach(btn => {
        btn.addEventListener('click', () => {
          const [iStr, dStr] = btn.getAttribute('data-adm-rmove').split(':');
          const i = parseInt(iStr, 10), d = parseInt(dStr, 10);
          const cur = [...((safeCtx.state && safeCtx.state.customRouteCities) || data.custom_route || [])];
          const j = i + d;
          if (j >= 0 && j < cur.length) {
            [cur[i], cur[j]] = [cur[j], cur[i]];
            saveRoute(cur);
          }
        });
      });

      container.querySelectorAll('[data-adm-rdel]').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = parseInt(btn.getAttribute('data-adm-rdel'), 10);
          const cur = [...((safeCtx.state && safeCtx.state.customRouteCities) || data.custom_route || [])];
          cur.splice(i, 1);
          saveRoute(cur);
        });
      });
    }

    // Bind APIs tab
    if (activeTab === 'apis') {
      const gemSave = document.getElementById('adm-gem-save');
      if (gemSave) {
        gemSave.addEventListener('click', () => {
          const key = document.getElementById('adm-gem-key').value.trim();
          const model = document.getElementById('adm-gem-model').value;
          if (key) localStorage.setItem(KEYS.geminiKey, key);
          else localStorage.removeItem(KEYS.geminiKey);
          localStorage.setItem(KEYS.geminiModel, model);
          toast('✅ Gemini AI ayarları kaydedildi');
        });
      }

      const gemTest = document.getElementById('adm-gem-test');
      if (gemTest) {
        gemTest.addEventListener('click', async () => {
          const out = document.getElementById('adm-gem-test-out');
          const key = document.getElementById('adm-gem-key').value.trim();
          const model = document.getElementById('adm-gem-model').value;
          if (out) out.textContent = '⏳ Gemini bağlantısı test ediliyor...';
          try {
            let res;
            if (key) {
              res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Kısaca selam ver.' }] }] })
              });
            } else {
              res = await fetch('/.netlify/functions/seyyah-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: 'Kısaca selam ver.', model })
              });
            }
            if (res.ok) {
              if (out) out.innerHTML = `<span style="color: var(--accent-emerald);">✅ Bağlantı başarılı! (${key ? 'Kişisel BYOK' : 'Netlify Sunucu'} • ${escapeHtml(model)})</span>`;
            } else {
              const d = await res.json().catch(() => ({}));
              if (out) out.innerHTML = `<span style="color: #fca5a5;">❌ HTTP ${res.status}: ${escapeHtml((d && (d.message || (d.error && d.error.message) || d.error)) || 'Hata')}</span>`;
            }
          } catch (err) {
            if (out) out.innerHTML = `<span style="color: #fca5a5;">❌ Ağ hatası: ${escapeHtml(err.message)}</span>`;
          }
        });
      }

      const ghSave = document.getElementById('adm-gh-save');
      if (ghSave) {
        ghSave.addEventListener('click', () => {
          writeJson(KEYS.ghConfig, {
            owner: document.getElementById('adm-gh-owner').value.trim() || 'bahattinyunus',
            repo: document.getElementById('adm-gh-repo').value.trim() || 'dijitalseyyah',
            branch: document.getElementById('adm-gh-branch').value.trim() || 'main',
            token: document.getElementById('adm-gh-token').value.trim()
          });
          toast('✅ GitHub ayarları tarayıcınıza kaydedildi');
        });
      }
    }

    // Bind System tab
    if (activeTab === 'system') {
      const expBtn = document.getElementById('adm-export-data');
      if (expBtn) {
        expBtn.addEventListener('click', () => {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'travel_data.json';
          a.click();
          URL.revokeObjectURL(url);
          toast('📥 travel_data.json indirildi');
        });
      }

      const swBtn = document.getElementById('adm-clear-sw');
      if (swBtn) {
        swBtn.addEventListener('click', async () => {
          try {
            if ('caches' in window) {
              const names = await caches.keys();
              await Promise.all(names.map(n => caches.delete(n)));
            }
            if ('serviceWorker' in navigator) {
              const regs = await navigator.serviceWorker.getRegistrations();
              await Promise.all(regs.map(r => r.unregister()));
            }
          } catch (e) {}
          toast('🧹 Önbellek temizlendi, yenileniyor...');
          setTimeout(() => window.location.reload(), 500);
        });
      }

      const clrOvBtn = document.getElementById('adm-clear-overrides');
      if (clrOvBtn) {
        clrOvBtn.addEventListener('click', () => {
          if (confirm('Tarayıcıdaki tüm yerel şehir düzenlemeleri silinsin mi?')) {
            localStorage.removeItem(KEYS.overrides);
            toast('↺ Yerel değişiklikler sıfırlandı, sayfa yenileniyor...');
            setTimeout(() => window.location.reload(), 500);
          }
        });
      }
    }
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.admin = { render, applyOverrides };
})();
