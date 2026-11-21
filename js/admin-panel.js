/**
 * Anadolu Seyahatnamesi — Dijital Seyyah Modern Admin Command Center (v2)
 * Salted SHA-256 Auth, Modern Sidebar Dashboard, 81-Province CMS with Live Banner Preview,
 * Route Builder, Gemini 3.5/Latest Live Tester, GitHub Direct Commit & System Diagnostics.
 * Registers on window.SEYYAH_MODULES.admin = { render(container, ctx), applyOverrides(data, state) }
 */

(function () {
  'use strict';

  const KEYS = {
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
  const RETIRED_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];

  let isUnlocked = (
    sessionStorage.getItem(SESSION_KEY) === AUTH_DIGEST ||
    localStorage.getItem(SESSION_KEY) === AUTH_DIGEST
  );
  let activeTab = 'overview'; // 'overview' | 'cities' | 'route' | 'apis' | 'system'
  let selectedEditKey = '01_Marmara/Istanbul';
  let citySearch = '';

  function fallbackEscape(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
  }

  async function verifyAdminCredentials(username, password) {
    const cleanUser = (username || '').trim().replace(/\s+/g, ' ').toLowerCase();
    const cleanPass = (password || '').trim();
    const digest = await sha256Hex(`${AUTH_SALT}:${cleanUser}:${cleanPass}`);
    return digest === AUTH_DIGEST;
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function writeJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function getActiveGeminiModel() {
    const raw = localStorage.getItem(KEYS.geminiModel) || 'gemini-flash-lite-latest';
    return RETIRED_MODELS.includes(raw) ? 'gemini-flash-lite-latest' : raw;
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
    const old = document.getElementById('seyyah-admin-styles');
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = 'seyyah-admin-styles';
    style.textContent = `
      .adm-wrap { max-width: 1260px; margin: 0 auto; animation: admFade 0.28s ease; }
      @keyframes admFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

      /* Modern Login Screen */
      .adm-auth-stage {
        min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 24px 12px;
        position: relative;
      }
      .adm-auth-card {
        width: 100%; max-width: 430px; padding: 34px 30px; border-radius: 22px;
        background: linear-gradient(155deg, rgba(15,23,42,0.92), rgba(7,12,24,0.96));
        border: 1px solid rgba(0,242,254,0.28);
        box-shadow: 0 24px 70px rgba(0,0,0,0.55), 0 0 40px rgba(0,242,254,0.08);
        backdrop-filter: blur(20px);
        display: flex; flex-direction: column; gap: 16px;
      }
      .adm-auth-badge {
        display: inline-flex; align-items: center; gap: 6px; align-self: center;
        padding: 5px 12px; border-radius: 999px; font-size: 0.72rem; font-weight: 700;
        background: rgba(0,242,254,0.12); border: 1px solid rgba(0,242,254,0.3); color: var(--accent-cyan);
        letter-spacing: 0.06em; text-transform: uppercase;
      }
      .adm-auth-title {
        text-align: center; font-family: var(--font-heading); font-size: 1.55rem; font-weight: 800;
        background: linear-gradient(135deg, #fff 0%, var(--accent-cyan) 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      }
      .adm-pass-wrap { position: relative; display: flex; align-items: center; }
      .adm-pass-toggle {
        position: absolute; right: 10px; background: none; border: none; color: var(--text-muted);
        cursor: pointer; font-size: 0.95rem; padding: 4px;
      }

      /* Modern Command Center Layout */
      .adm-layout {
        display: grid; grid-template-columns: 248px 1fr; gap: 18px; align-items: start;
      }
      .adm-rail {
        position: sticky; top: 12px; padding: 18px 14px; border-radius: 20px;
        background: linear-gradient(180deg, rgba(15,23,42,0.88), rgba(10,15,29,0.95));
        border: 1px solid var(--border-glass); display: flex; flex-direction: column; gap: 14px;
      }
      .adm-profile {
        display: flex; align-items: center; gap: 11px; padding: 10px; border-radius: 14px;
        background: rgba(0,242,254,0.07); border: 1px solid rgba(0,242,254,0.18);
      }
      .adm-avatar {
        width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
        font-size: 1.25rem; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue)); color: #04121d; font-weight: 800;
      }
      .adm-nav-list { display: flex; flex-direction: column; gap: 5px; }
      .adm-nav-item {
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
        padding: 10px 12px; border-radius: 12px; border: 1px solid transparent;
        background: transparent; color: var(--text-secondary); font-family: var(--font-heading);
        font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.18s ease; text-align: left;
      }
      .adm-nav-item:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
      .adm-nav-item.active {
        background: linear-gradient(135deg, rgba(0,242,254,0.16), rgba(59,130,246,0.14));
        border-color: rgba(0,242,254,0.38); color: var(--accent-cyan);
      }
      .adm-pill-mini {
        font-size: 0.68rem; padding: 2px 7px; border-radius: 999px;
        background: rgba(255,255,255,0.08); color: var(--text-secondary);
      }
      .adm-nav-item.active .adm-pill-mini { background: rgba(0,242,254,0.2); color: var(--accent-cyan); }

      .adm-main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
      .adm-hero-bar {
        padding: 20px 24px; border-radius: 20px;
        background: linear-gradient(135deg, rgba(15,23,42,0.9), rgba(20,33,61,0.72));
        border: 1px solid var(--border-glass);
        display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;
      }
      .adm-kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 12px; }
      .adm-kpi-card {
        padding: 16px 18px; border-radius: 16px;
        background: rgba(15,23,42,0.72); border: 1px solid var(--border-glass);
        display: flex; flex-direction: column; gap: 6px; position: relative; overflow: hidden;
      }
      .adm-kpi-card::after {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, var(--accent-cyan), transparent);
      }
      .adm-kpi-num { font-family: var(--font-heading); font-size: 1.55rem; font-weight: 800; color: var(--text-primary); }
      .adm-kpi-sub { font-size: 0.74rem; color: var(--text-muted); }

      .adm-panel-card {
        padding: 20px 22px; border-radius: 18px;
        background: rgba(15,23,42,0.75); border: 1px solid var(--border-glass);
        display: flex; flex-direction: column; gap: 14px;
      }
      .adm-reg-bar { height: 7px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; margin-top: 4px; }
      .adm-reg-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--accent-emerald), var(--accent-cyan)); }

      /* CMS Grid */
      .adm-cms-grid { display: grid; grid-template-columns: 270px 1fr; gap: 14px; align-items: start; }
      .adm-city-scroll { max-height: 540px; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; padding-right: 4px; }
      .adm-city-row {
        display: flex; justify-content: space-between; align-items: center; padding: 8px 10px;
        border-radius: 10px; background: rgba(10,15,29,0.6); border: 1px solid transparent;
        cursor: pointer; font-size: 0.82rem; transition: all 0.15s ease;
      }
      .adm-city-row:hover { border-color: rgba(0,242,254,0.35); }
      .adm-city-row.active { border-color: var(--accent-cyan); background: rgba(0,242,254,0.13); }
      .adm-banner-prev {
        width: 100%; height: 130px; object-fit: cover; border-radius: 12px;
        border: 1px solid var(--border-glass);
      }

      .adm-field { display: flex; flex-direction: column; gap: 5px; }
      .adm-field label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
      .adm-input, .adm-textarea {
        width: 100%; padding: 10px 13px; border-radius: 11px;
        background: rgba(7,12,24,0.72); border: 1px solid var(--border-glass);
        color: var(--text-primary); font-family: var(--font-body); font-size: 0.86rem; outline: none;
        transition: border-color 0.18s ease, box-shadow 0.18s ease;
      }
      .adm-input:focus, .adm-textarea:focus { border-color: var(--accent-cyan); box-shadow: 0 0 0 3px rgba(0,242,254,0.12); }
      .adm-textarea { min-height: 74px; resize: vertical; line-height: 1.5; }
      .adm-route-item {
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
        padding: 11px 14px; border-radius: 12px; background: rgba(7,12,24,0.65); border: 1px solid var(--border-glass);
      }
      .adm-status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

      body.light-theme .adm-auth-card, body.light-theme .adm-rail, body.light-theme .adm-hero-bar,
      body.light-theme .adm-kpi-card, body.light-theme .adm-panel-card { background: rgba(255,255,255,0.92); color: #0f172a; }
      body.light-theme .adm-input, body.light-theme .adm-textarea, body.light-theme .adm-city-row,
      body.light-theme .adm-route-item { background: #f1f5f9; color: #0f172a; }

      @media (max-width: 960px) {
        .adm-layout { grid-template-columns: 1fr; }
        .adm-rail { position: static; }
        .adm-nav-list { flex-direction: row; flex-wrap: wrap; }
        .adm-cms-grid { grid-template-columns: 1fr; }
      }
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

    // 1. MODERN AUTH SCREEN
    if (!isUnlocked) {
      container.innerHTML = `
        <div class="adm-wrap">
          <div class="adm-auth-stage">
            <div class="adm-auth-card">
              <img src="assets/logo.png" alt="Dijital Seyyah Logosu" style="width:72px;height:72px;border-radius:18px;align-self:center;border:1.5px solid rgba(251,191,36,0.55);box-shadow:0 8px 26px rgba(0,0,0,0.5),0 0 22px rgba(0,242,254,0.22);" />
              <div class="adm-auth-badge">🛡️ Yönetici Komuta Merkezi</div>
              <h2 class="adm-auth-title">Dijital Seyyah Admin</h2>
              <p style="text-align: center; font-size: 0.83rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">
                81 il içerik yönetimi, rota stüdyosu, Gemini AI ve GitHub yayını için yönetici girişi yapın.
              </p>
              <div id="adm-auth-status" style="text-align: center; font-size: 0.8rem; min-height: 18px; color: #fca5a5;"></div>
              <form id="adm-auth-form" style="display: flex; flex-direction: column; gap: 12px;">
                <div class="adm-field">
                  <label>👤 Kullanıcı Adı</label>
                  <input type="text" id="adm-user-input" class="adm-input" placeholder="Kullanıcı adınız" autocomplete="username" required />
                </div>
                <div class="adm-field">
                  <label>🔑 Şifre</label>
                  <div class="adm-pass-wrap">
                    <input type="password" id="adm-pass-input" class="adm-input" style="padding-right: 38px;" placeholder="••••••••" autocomplete="current-password" required />
                    <button type="button" id="adm-pass-eye" class="adm-pass-toggle" title="Şifreyi Göster/Gizle">👁️</button>
                  </div>
                </div>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.79rem; color: var(--text-secondary); cursor: pointer;">
                  <input type="checkbox" id="adm-remember-chk" checked />
                  Bu cihazda oturumu açık tut
                </label>
                <button type="submit" class="btn btn-primary" style="justify-content: center; padding: 11px 16px; font-size: 0.9rem;">
                  🔓 Komuta Merkezine Gir
                </button>
              </form>
            </div>
          </div>
        </div>
      `;

      const statusEl = document.getElementById('adm-auth-status');
      const form = document.getElementById('adm-auth-form');
      const userInput = document.getElementById('adm-user-input');
      const passInput = document.getElementById('adm-pass-input');
      const passEye = document.getElementById('adm-pass-eye');
      const rememberChk = document.getElementById('adm-remember-chk');

      if (passEye && passInput) {
        passEye.addEventListener('click', () => {
          const isPw = passInput.type === 'password';
          passInput.type = isPw ? 'text' : 'password';
          passEye.textContent = isPw ? '🙈' : '👁️';
        });
      }

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
            toast('🛡️ Hoş geldin Bahattin Yunus! Admin Paneli açıldı.');
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

    // 2. UNLOCKED MODERN ADMIN COMMAND CENTER
    const overrides = readJson(KEYS.overrides, {});
    const overrideCount = Object.keys(overrides).length;
    const ghCfg = readJson(KEYS.ghConfig, { owner: ALLOWED_OWNER, repo: TARGET_REPO, branch: 'main', token: '' });
    const curGeminiKey = localStorage.getItem(KEYS.geminiKey) || '';
    const curGeminiModel = getActiveGeminiModel();
    const curRoute = (safeCtx.state && safeCtx.state.customRouteCities) || data.custom_route || [];
    const stats = data.stats || { visited_cities: 0, unvisited_cities: 81, progress_pct: 0, total_photos: 162 };

    let mainHtml = '';

    // TAB 1: OVERVIEW
    if (activeTab === 'overview') {
      const regHtml = Object.entries((stats && stats.regional_breakdown) || {}).map(([code, r]) => {
        const regInfo = (data.regions && data.regions[code]) || { icon: '🗺️', name: code };
        return `
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;">
              <span>${regInfo.icon} <strong>${escapeHtml(regInfo.name)}</strong></span>
              <span style="color:var(--accent-cyan);font-weight:700;">${r.visited}/${r.total} (%${r.percentage})</span>
            </div>
            <div class="adm-reg-bar"><div class="adm-reg-fill" style="width:${r.percentage}%;"></div></div>
          </div>
        `;
      }).join('');

      mainHtml = `
        <div class="adm-kpi-row">
          <div class="adm-kpi-card">
            <span class="adm-kpi-sub">FETHEDİLEN MENZİL</span>
            <div class="adm-kpi-num" style="color:var(--accent-emerald);">${stats.visited_cities} / 81</div>
            <span class="adm-kpi-sub">%${stats.progress_pct} tamamlandı • ${stats.unvisited_cities} bekliyor</span>
          </div>
          <div class="adm-kpi-card">
            <span class="adm-kpi-sub">GEMINI AI DURUMU</span>
            <div class="adm-kpi-num" style="color:${curGeminiKey ? 'var(--accent-cyan)' : '#fbbf24'};font-size:1.15rem;">
              ${curGeminiKey ? '🟢 Bağlı' : '🟡 Anahtar Yok'}
            </div>
            <span class="adm-kpi-sub">${escapeHtml(curGeminiModel)}</span>
          </div>
          <div class="adm-kpi-card">
            <span class="adm-kpi-sub">AKTİF SEFER ROTASI</span>
            <div class="adm-kpi-num">${curRoute.length} Durak</div>
            <span class="adm-kpi-sub">${escapeHtml(curRoute[0] || '')} ➔ ${escapeHtml(curRoute[curRoute.length - 1] || '')}</span>
          </div>
          <div class="adm-kpi-card">
            <span class="adm-kpi-sub">YEREL CMS DÜZENLEME</span>
            <div class="adm-kpi-num">${overrideCount} İl</div>
            <span class="adm-kpi-sub">${ghCfg.token ? '🚀 GitHub Push Hazır' : '💾 Sadece Tarayıcı'}</span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;">
          <div class="adm-panel-card">
            <h3 style="font-family:var(--font-heading);font-size:1.05rem;color:var(--accent-cyan);margin:0;">🌍 7 Bölge İlerleme Raporu</h3>
            <div style="display:flex;flex-direction:column;gap:10px;">${regHtml}</div>
          </div>

          <div class="adm-panel-card">
            <h3 style="font-family:var(--font-heading);font-size:1.05rem;color:var(--accent-gold);margin:0;">⚡ Hızlı Komutlar</h3>
            <p style="font-size:0.8rem;color:var(--text-secondary);margin:0;">Sık kullanılan yönetim aksiyonlarına tek tıkla ulaşın.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <button type="button" class="btn btn-primary" data-adm-jump="apis" style="justify-content:center;">🤖 Gemini API Ayarla</button>
              <button type="button" class="btn btn-outline" data-adm-jump="cities" style="justify-content:center;">🗺️ 81 İl Düzenle</button>
              <button type="button" class="btn btn-outline" data-adm-jump="route" style="justify-content:center;">🧭 Rotayı Yönet</button>
              <button type="button" class="btn btn-outline" id="adm-quick-advisor" style="justify-content:center;">✨ AI Sohbete Geç</button>
              <button type="button" class="btn btn-outline" data-adm-jump="system" style="justify-content:center;">💾 Yedek &amp; Önbellek</button>
              <button type="button" class="btn btn-outline" id="adm-quick-home" style="justify-content:center;">🏠 Ana Siteye Dön</button>
            </div>
          </div>
        </div>
      `;
    }

    // TAB 2: 81 PROVINCES CMS
    else if (activeTab === 'cities') {
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
          <span style="font-size:0.72rem;color:${item.visited ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
            ${overrides[k] ? '✎ ' : ''}${item.visited ? '✅' : '⏳'}
          </span>
        </div>
      `).join('');

      mainHtml = `
        <div class="adm-cms-grid">
          <div class="adm-panel-card" style="padding:14px;">
            <input type="text" id="adm-city-search" class="adm-input" placeholder="🔍 81 il içinde ara..." value="${escapeHtml(citySearch)}" />
            <div class="adm-city-scroll">${listHtml}</div>
          </div>

          <div class="adm-panel-card">
            ${p.banner_rel ? `<img src="${escapeHtml(p.banner_rel)}" alt="${escapeHtml(p.name)}" class="adm-banner-prev" onerror="this.style.display='none'" />` : ''}
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
              <div>
                <h3 style="font-family:var(--font-heading);font-size:1.2rem;color:var(--accent-cyan);margin:0;">
                  📍 ${escapeHtml(p.name)} (${String(p.plate || 0).padStart(2, '0')}) — ${escapeHtml(p.region)}
                </h3>
                <div style="font-size:0.74rem;color:var(--text-muted);">${escapeHtml(p.readme_rel || '')}</div>
              </div>
              <label style="display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;background:rgba(16,185,129,0.14);border:1px solid rgba(16,185,129,0.35);cursor:pointer;font-weight:700;font-size:0.82rem;color:#6ee7b7;">
                <input type="checkbox" id="adm-f-visited" ${p.visited ? 'checked' : ''} />
                Ziyaret Edildi (✅)
              </label>
            </div>

            <div class="adm-field">
              <label>📜 Şehrin Ruhu (Alıntı)</label>
              <input type="text" id="adm-f-quote" class="adm-input" value="${escapeHtml(p.custom_quote || p.quote || '')}" />
            </div>
            <div class="adm-field">
              <label>📚 Kütüphane &amp; Çalışma Notu</label>
              <input type="text" id="adm-f-library" class="adm-input" value="${escapeHtml(p.custom_library || p.library || '')}" />
            </div>
            <div class="adm-field">
              <label>🌍 Tarihsel Arka Plan</label>
              <textarea id="adm-f-history" class="adm-textarea">${escapeHtml(p.history || '')}</textarea>
            </div>
            <div class="adm-field">
              <label>🕊️ Manevi Boyut &amp; Tefekkür</label>
              <textarea id="adm-f-reflection" class="adm-textarea">${escapeHtml(p.reflection || '')}</textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div class="adm-field">
                <label>✨ Miraslar (virgülle)</label>
                <input type="text" id="adm-f-landmarks" class="adm-input" value="${escapeHtml((p.landmarks || []).join(', '))}" />
              </div>
              <div class="adm-field">
                <label>🍽️ Lezzetler (virgülle)</label>
                <input type="text" id="adm-f-specialties" class="adm-input" value="${escapeHtml((p.specialties || []).join(', '))}" />
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:4px;">
              <button type="button" class="btn btn-primary" id="adm-save-city">💾 Canlı Kaydet</button>
              <button type="button" class="btn btn-outline" id="adm-dl-readme">📥 README.md İndir</button>
              <button type="button" class="btn btn-outline" id="adm-gh-push-city" style="border-color:rgba(16,185,129,0.45);color:#6ee7b7;">🚀 GitHub'a Commit Et</button>
              <button type="button" class="btn btn-outline" id="adm-view-city">👁️ Sayfayı Aç</button>
            </div>
          </div>
        </div>
      `;
    }

    // TAB 3: ROUTE BUILDER
    else if (activeTab === 'route') {
      const allCityNames = Object.values(provinces).map(p => p.name).sort((a, b) => a.localeCompare(b, 'tr'));
      mainHtml = `
        <div class="adm-panel-card">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <div>
              <h3 style="font-family:var(--font-heading);font-size:1.15rem;color:var(--accent-cyan);margin:0;">🧭 Aktif Sefer Rotası Yöneticisi</h3>
              <p style="font-size:0.8rem;color:var(--text-secondary);margin:4px 0 0 0;">Durak sırası tüm sitede ve Gemini AI bağlamında anında güncellenir.</p>
            </div>
            <button type="button" class="btn btn-outline" id="adm-route-reset-btn">↺ Varsayılan Rota</button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <select id="adm-route-add-sel" class="region-select" style="flex:1;min-width:200px;">
              ${allCityNames.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('')}
            </select>
            <button type="button" class="btn btn-primary" id="adm-route-add-btn">➕ Durak Ekle</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${curRoute.map((name, idx) => `
              <div class="adm-route-item">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="width:26px;height:26px;border-radius:50%;background:rgba(0,242,254,0.18);color:var(--accent-cyan);display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:0.78rem;">${idx + 1}</span>
                  <strong>${escapeHtml(name)}</strong>
                </div>
                <div style="display:flex;gap:6px;">
                  <button type="button" class="btn btn-outline" data-adm-rmove="${idx}:-1" style="padding:4px 9px;" ${idx === 0 ? 'disabled' : ''}>↑</button>
                  <button type="button" class="btn btn-outline" data-adm-rmove="${idx}:1" style="padding:4px 9px;" ${idx === curRoute.length - 1 ? 'disabled' : ''}>↓</button>
                  <button type="button" class="btn btn-outline" data-adm-rdel="${idx}" style="padding:4px 9px;color:#fca5a5;">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // TAB 4: GEMINI AI & GITHUB API
    else if (activeTab === 'apis') {
      mainHtml = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">
          <div class="adm-panel-card">
            <h3 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--accent-cyan);margin:0;">🤖 Gemini AI Bağlantısı</h3>
            <p style="font-size:0.8rem;color:var(--text-secondary);margin:0;">Google AI Studio anahtarınızı (<code>AQ....</code> veya <code>AIza...</code>) tarayıcınıza kaydedip canlı test edin.</p>
            <div class="adm-field">
              <label>Aktif Gemini Modeli</label>
              <select id="adm-gem-model" class="region-select">
                <option value="gemini-flash-lite-latest" ${curGeminiModel === 'gemini-flash-lite-latest' ? 'selected' : ''}>⚡ gemini-flash-lite-latest (Önerilen &amp; Hızlı)</option>
                <option value="gemini-3.5-flash-lite" ${curGeminiModel === 'gemini-3.5-flash-lite' ? 'selected' : ''}>🚀 gemini-3.5-flash-lite</option>
                <option value="gemini-3.8-flash" ${curGeminiModel === 'gemini-3.8-flash' ? 'selected' : ''}>✨ gemini-3.8-flash (Yeni Nesil)</option>
                <option value="gemini-flash-latest" ${curGeminiModel === 'gemini-flash-latest' ? 'selected' : ''}>🌟 gemini-flash-latest</option>
                <option value="gemini-pro-latest" ${curGeminiModel === 'gemini-pro-latest' ? 'selected' : ''}>🧠 gemini-pro-latest (Derin)</option>
              </select>
            </div>
            <div class="adm-field">
              <label>Gemini API Anahtarı ${curGeminiKey ? '<span style="color:var(--accent-emerald);">(✅ Kayıtlı — DOM\'da gizli)</span>' : ''}</label>
              <input type="password" id="adm-gem-key" class="adm-input" placeholder="${curGeminiKey ? '•••••••• (Değiştirmek için yeni anahtar yazın)' : 'AQ.... veya AIza...'}" value="" autocomplete="off" />
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" class="btn btn-primary" id="adm-gem-save">💾 Kaydet</button>
              <button type="button" class="btn btn-outline" id="adm-gem-test">🧪 Canlı Test Et</button>
              ${curGeminiKey ? '<button type="button" class="btn btn-outline" id="adm-gem-clear" style="color:#fca5a5;">🗑️ Sil</button>' : ''}
            </div>
            <div id="adm-gem-test-out" style="font-size:0.82rem;padding:10px 12px;border-radius:10px;background:rgba(7,12,24,0.55);border:1px solid var(--border-glass);min-height:40px;color:var(--text-secondary);">
              Test sonucunu görmek için <strong>Canlı Test Et</strong> butonuna basın.
            </div>
          </div>

          <div class="adm-panel-card">
            <h3 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--accent-emerald);margin:0;">🚀 GitHub Doğrudan Yayın</h3>
            <p style="font-size:0.8rem;color:var(--text-secondary);margin:0;">GitHub PAT (<code>repo</code> yetkili) eklerseniz 81 il düzenlemelerini doğrudan repoya commit edebilirsiniz.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div class="adm-field">
                <label>Sahip</label>
                <input type="text" id="adm-gh-owner" class="adm-input" value="${escapeHtml(ghCfg.owner || ALLOWED_OWNER)}" />
              </div>
              <div class="adm-field">
                <label>Repo</label>
                <input type="text" id="adm-gh-repo" class="adm-input" value="${escapeHtml(ghCfg.repo || TARGET_REPO)}" />
              </div>
            </div>
            <div class="adm-field">
              <label>Dal (Branch)</label>
              <input type="text" id="adm-gh-branch" class="adm-input" value="${escapeHtml(ghCfg.branch || 'main')}" />
            </div>
            <div class="adm-field">
              <label>GitHub PAT Token ${ghCfg.token ? '<span style="color:var(--accent-emerald);">(✅ Kayıtlı — DOM\'da gizli)</span>' : ''}</label>
              <input type="password" id="adm-gh-token" class="adm-input" placeholder="${ghCfg.token ? '•••••••• (Değiştirmek için yeni token yazın)' : 'ghp_... veya github_pat_...'}" value="" autocomplete="off" />
            </div>
            <button type="button" class="btn btn-primary" id="adm-gh-save">💾 GitHub Ayarlarını Kaydet</button>
          </div>
        </div>
      `;
    }

    // TAB 5: SYSTEM
    else if (activeTab === 'system') {
      const modCount = window.SEYYAH_MODULES ? Object.keys(window.SEYYAH_MODULES).length : 0;
      let lsBytes = 0;
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); lsBytes += (k.length + (localStorage.getItem(k) || '').length) * 2; } } catch (e) {}

      mainHtml = `
        <div class="adm-panel-card">
          <h3 style="font-family:var(--font-heading);font-size:1.15rem;color:var(--accent-cyan);margin:0;">💾 Sistem Tanılama &amp; Yedekleme</h3>
          <div class="adm-kpi-row">
            <div class="adm-kpi-card"><span class="adm-kpi-sub">YÜKLÜ MODÜL</span><div class="adm-kpi-num">${modCount}</div></div>
            <div class="adm-kpi-card"><span class="adm-kpi-sub">FOTOĞRAF ARŞİVİ</span><div class="adm-kpi-num">${stats.total_photos || 162}</div></div>
            <div class="adm-kpi-card"><span class="adm-kpi-sub">DEPOLAMA</span><div class="adm-kpi-num">${(lsBytes / 1024).toFixed(1)} KB</div></div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button type="button" class="btn btn-primary" id="adm-export-data">📥 travel_data.json İndir</button>
            <button type="button" class="btn btn-outline" id="adm-clear-sw">🧹 Önbelleği (SW) Temizle &amp; Yenile</button>
            <button type="button" class="btn btn-outline" id="adm-clear-overrides" style="color:#fca5a5;">↺ Yerel Düzenlemeleri Sıfırla</button>
          </div>
          <div style="font-size:0.78rem;color:var(--text-muted);padding-top:6px;border-top:1px solid var(--border-glass);">
            💡 <strong>Hızlı Erişim Yolları:</strong> Doğrudan <code>/admin/</code> adresi • Sol üst logoya <strong>3 kez hızlı tıkla</strong> • Klavyede <code>Alt + Shift + M</code>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="adm-wrap">
        <div class="adm-layout">
          <aside class="adm-rail">
            <div class="adm-profile">
              <img src="assets/logo.png" alt="Dijital Seyyah" style="width:40px;height:40px;border-radius:12px;object-fit:cover;border:1px solid rgba(251,191,36,0.5);" />
              <div style="min-width:0;">
                <div style="font-family:var(--font-heading);font-weight:700;font-size:0.9rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Bahattin Yunus</div>
                <div style="font-size:0.72rem;color:var(--accent-emerald);display:flex;align-items:center;gap:5px;">
                  <span class="adm-status-dot" style="background:var(--accent-emerald);"></span> Yönetici Aktif
                </div>
              </div>
            </div>

            <nav class="adm-nav-list">
              <button type="button" class="adm-nav-item ${activeTab === 'overview' ? 'active' : ''}" data-adm-tab="overview">
                <span>📊 Genel Bakış</span>
              </button>
              <button type="button" class="adm-nav-item ${activeTab === 'cities' ? 'active' : ''}" data-adm-tab="cities">
                <span>🗺️ 81 İl CMS</span>
                <span class="adm-pill-mini">${overrideCount}</span>
              </button>
              <button type="button" class="adm-nav-item ${activeTab === 'route' ? 'active' : ''}" data-adm-tab="route">
                <span>🧭 Sefer Rotası</span>
                <span class="adm-pill-mini">${curRoute.length}</span>
              </button>
              <button type="button" class="adm-nav-item ${activeTab === 'apis' ? 'active' : ''}" data-adm-tab="apis">
                <span>🤖 Gemini &amp; GitHub</span>
                <span class="adm-pill-mini">${curGeminiKey ? 'ON' : 'OFF'}</span>
              </button>
              <button type="button" class="adm-nav-item ${activeTab === 'system' ? 'active' : ''}" data-adm-tab="system">
                <span>💾 Sistem</span>
              </button>
            </nav>

            <div style="margin-top:auto;padding-top:10px;border-top:1px solid var(--border-glass);display:flex;flex-direction:column;gap:6px;">
              <button type="button" class="btn btn-outline" id="adm-back-site" style="justify-content:center;font-size:0.8rem;">← Siteye Dön</button>
              <button type="button" class="btn btn-outline" id="adm-lock-btn" style="justify-content:center;font-size:0.8rem;color:#fca5a5;">🔒 Oturumu Kapat</button>
            </div>
          </aside>

          <div class="adm-main">
            <div class="adm-hero-bar">
              <div>
                <h2 style="font-family:var(--font-heading);font-size:1.35rem;font-weight:800;margin:0;color:var(--text-primary);">
                  ⚙️ Dijital Seyyah Komuta Merkezi
                </h2>
                <p style="font-size:0.78rem;color:var(--text-secondary);margin:3px 0 0 0;">
                  Canlı CMS • Rota Mühendisliği • Gemini AI (${escapeHtml(curGeminiModel)})
                </p>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <span class="adm-pill-mini" style="padding:5px 10px;font-size:0.74rem;">${curGeminiKey ? '🟢 Gemini Hazır' : '🟡 API Anahtarı Bekliyor'}</span>
              </div>
            </div>
            ${mainHtml}
          </div>
        </div>
      </div>
    `;

    // Global rail & navigation bindings
    container.querySelectorAll('[data-adm-tab], [data-adm-jump]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-adm-tab') || btn.getAttribute('data-adm-jump');
        render(container, ctx);
      });
    });

    const backBtn = document.getElementById('adm-back-site');
    if (backBtn) backBtn.addEventListener('click', () => { if (typeof safeCtx.openView === 'function') safeCtx.openView('dashboard'); });

    const quickHome = document.getElementById('adm-quick-home');
    if (quickHome) quickHome.addEventListener('click', () => { if (typeof safeCtx.openView === 'function') safeCtx.openView('dashboard'); });

    const quickAdv = document.getElementById('adm-quick-advisor');
    if (quickAdv) quickAdv.addEventListener('click', () => { if (typeof safeCtx.openView === 'function') safeCtx.openView('advisor'); });

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
          if (!cfg.token) {
            toast('⚠️ Önce "Gemini & GitHub" sekmesinden GitHub PAT token girin.');
            activeTab = 'apis';
            render(container, ctx);
            return;
          }
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
            if (getRes.ok) { const meta = await getRes.json(); sha = meta.sha; }
            const b64 = btoa(unescape(encodeURIComponent(md)));
            const putRes = await fetch(apiBase, {
              method: 'PUT',
              headers: { Authorization: `Bearer ${cfg.token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
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
            ghPushBtn.textContent = '🚀 GitHub\'a Commit Et';
          }
        });
      }

      const viewBtn = document.getElementById('adm-view-city');
      if (viewBtn) viewBtn.addEventListener('click', () => { if (typeof safeCtx.selectCity === 'function') safeCtx.selectCity(selectedEditKey); });
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
          const cur = [...curRoute];
          if (val && !cur.includes(val)) { cur.push(val); saveRoute(cur); toast(`➕ ${val} rotaya eklendi`); }
        });
      }
      const resetBtn = document.getElementById('adm-route-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          localStorage.removeItem(KEYS.routeOverride);
          const def = ['Ankara', 'Çankırı', 'Kastamonu', 'Karabük', 'Bartın', 'Zonguldak', 'Düzce', 'Sakarya', 'İstanbul', 'Edirne'];
          data.custom_route = [...def];
          if (safeCtx.state) safeCtx.state.customRouteCities = [...def];
          toast('↺ Varsayılan rotaya dönüldü');
          render(container, ctx);
        });
      }
      container.querySelectorAll('[data-adm-rmove]').forEach(btn => {
        btn.addEventListener('click', () => {
          const [iStr, dStr] = btn.getAttribute('data-adm-rmove').split(':');
          const i = parseInt(iStr, 10), d = parseInt(dStr, 10);
          const cur = [...curRoute];
          const j = i + d;
          if (j >= 0 && j < cur.length) { [cur[i], cur[j]] = [cur[j], cur[i]]; saveRoute(cur); }
        });
      });
      container.querySelectorAll('[data-adm-rdel]').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = parseInt(btn.getAttribute('data-adm-rdel'), 10);
          const cur = [...curRoute];
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
          const typedKey = document.getElementById('adm-gem-key').value.trim();
          const model = document.getElementById('adm-gem-model').value;
          if (typedKey) localStorage.setItem(KEYS.geminiKey, typedKey);
          localStorage.setItem(KEYS.geminiModel, model);
          toast('✅ Gemini AI ayarları kaydedildi (anahtar DOM\'da gizli)');
          render(container, ctx);
        });
      }
      const gemClear = document.getElementById('adm-gem-clear');
      if (gemClear) {
        gemClear.addEventListener('click', () => {
          localStorage.removeItem(KEYS.geminiKey);
          toast('🗑️ Gemini API anahtarı temizlendi');
          render(container, ctx);
        });
      }
      const gemTest = document.getElementById('adm-gem-test');
      if (gemTest) {
        gemTest.addEventListener('click', async () => {
          const out = document.getElementById('adm-gem-test-out');
          const key = document.getElementById('adm-gem-key').value.trim() || (localStorage.getItem(KEYS.geminiKey) || '').trim();
          const model = document.getElementById('adm-gem-model').value;
          if (!key) {
            if (out) out.innerHTML = '<span style="color:#fbbf24;">⚠️ Önce Gemini API anahtarını girin.</span>';
            return;
          }
          if (out) out.textContent = `⏳ ${model} test ediliyor...`;
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Tek cümleyle Türkçe selam ver.' }] }] })
            });
            const d = await res.json().catch(() => ({}));
            if (res.ok) {
              const txt = d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts
                ? d.candidates[0].content.parts.map(pt => pt.text || '').join(' ').trim()
                : 'OK';
              if (out) out.innerHTML = `<span style="color:var(--accent-emerald);">✅ Bağlantı başarılı! (${escapeHtml(model)})</span><br><span style="color:var(--text-primary);">"${escapeHtml(txt)}"</span>`;
            } else {
              if (out) out.innerHTML = `<span style="color:#fca5a5;">❌ HTTP ${res.status}: ${escapeHtml((d && d.error && d.error.message) || 'Hata')}</span>`;
            }
          } catch (err) {
            if (out) out.innerHTML = `<span style="color:#fca5a5;">❌ Ağ hatası: ${escapeHtml(err.message)}</span>`;
          }
        });
      }
      const ghSave = document.getElementById('adm-gh-save');
      if (ghSave) {
        ghSave.addEventListener('click', () => {
          const typedTok = document.getElementById('adm-gh-token').value.trim();
          writeJson(KEYS.ghConfig, {
            owner: document.getElementById('adm-gh-owner').value.trim() || ALLOWED_OWNER,
            repo: document.getElementById('adm-gh-repo').value.trim() || TARGET_REPO,
            branch: document.getElementById('adm-gh-branch').value.trim() || 'main',
            token: typedTok || ghCfg.token || ''
          });
          toast('✅ GitHub ayarları tarayıcınıza kaydedildi');
          render(container, ctx);
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
          a.href = url; a.download = 'travel_data.json'; a.click();
          URL.revokeObjectURL(url);
          toast('📥 travel_data.json indirildi');
        });
      }
      const swBtn = document.getElementById('adm-clear-sw');
      if (swBtn) {
        swBtn.addEventListener('click', async () => {
          try {
            if ('caches' in window) { const names = await caches.keys(); await Promise.all(names.map(n => caches.delete(n))); }
            if ('serviceWorker' in navigator) { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r => r.unregister())); }
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
