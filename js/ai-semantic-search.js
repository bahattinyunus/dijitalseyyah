/**
 * Anadolu Seyahatnamesi — AI Doğal Dil Akıllı Arama & Keşif Motoru
 * Powered by window.SEYYAH_AI with rich multi-criteria local semantic fallback.
 * Registers on window.SEYYAH_MODULES.aiSearch = { render(container, ctx) }
 */
(function () {
  'use strict';

  const EXAMPLE_QUERIES = [
    'Denize kıyısı olan, kütüphanesi güzel, henüz gitmediğim 4 sakin il',
    'Kışın kar manzarası ve sıcak yöresel çorbalarıyla ünlü Doğu illeri',
    'Selçuklu ve Osmanlı mirası en yoğun 5 şehir',
    'Ankara\'ya 400 km içinde hafta sonu kaçamağı yapılacak gezilmemiş iller',
    'Güneydoğu\'da gastronomi ve tarih dolu 4 durak',
    'Karadeniz\'de şelale, yayla ve sakin çalışma ortamı sunan iller'
  ];

  const COASTAL_PLATES = new Set([1, 7, 8, 9, 10, 16, 17, 22, 28, 31, 33, 34, 35, 37, 39, 41, 48, 52, 53, 54, 55, 57, 59, 61, 67, 74, 77, 81]);
  const ANKARA_COORDS = { lat: 39.9334, lng: 32.8597 };

  let lastQuery = '';
  let lastResults = null;

  function fallbackEsc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fallbackNorm(s) {
    if (!s) return '';
    return String(s).replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase()
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
      .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').trim();
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  function ensureStyles() {
    if (document.getElementById('seyyah-ai-search-styles')) return;
    const style = document.createElement('style');
    style.id = 'seyyah-ai-search-styles';
    style.textContent = `
      .aiss-shell { max-width: 1120px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
      .aiss-hero { padding: 24px 26px; border-radius: 20px; background: linear-gradient(140deg, rgba(15,23,42,0.9), rgba(20,33,61,0.75)); border: 1px solid rgba(0,242,254,0.26); display: flex; flex-direction: column; gap: 14px; }
      .aiss-form { display: flex; gap: 10px; flex-wrap: wrap; }
      .aiss-input { flex: 1; min-width: 240px; padding: 13px 16px; border-radius: 14px; background: rgba(7,12,24,0.78); border: 1px solid var(--border-glass); color: var(--text-primary); font-family: var(--font-body); font-size: 0.94rem; outline: none; }
      .aiss-input:focus { border-color: var(--accent-cyan); box-shadow: 0 0 0 3px rgba(0,242,254,0.14); }
      .aiss-chips { display: flex; gap: 8px; flex-wrap: wrap; }
      .aiss-chip { padding: 6px 12px; border-radius: 999px; font-size: 0.76rem; background: rgba(0,242,254,0.08); border: 1px solid rgba(0,242,254,0.22); color: var(--text-secondary); cursor: pointer; transition: all 0.18s ease; text-align: left; }
      .aiss-chip:hover { border-color: var(--accent-cyan); color: var(--accent-cyan); transform: translateY(-1px); }
      .aiss-summary { padding: 14px 18px; border-radius: 14px; background: rgba(0,242,254,0.07); border: 1px solid rgba(0,242,254,0.24); font-size: 0.86rem; color: var(--text-primary); line-height: 1.55; }
      .aiss-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(285px, 1fr)); gap: 16px; }
      .aiss-card { border-radius: 18px; overflow: hidden; background: rgba(15,23,42,0.78); border: 1px solid var(--border-glass); display: flex; flex-direction: column; cursor: pointer; transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease; }
      .aiss-card:hover { transform: translateY(-4px); border-color: rgba(0,242,254,0.5); box-shadow: 0 16px 36px rgba(0,0,0,0.4); }
      .aiss-media { position: relative; height: 152px; overflow: hidden; background: #0a0f1d; }
      .aiss-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
      .aiss-card:hover .aiss-media img { transform: scale(1.06); }
      .aiss-plate { position: absolute; top: 10px; left: 10px; padding: 3px 9px; border-radius: 999px; font-size: 0.72rem; font-weight: 800; background: rgba(6,9,19,0.82); color: var(--accent-cyan); border: 1px solid rgba(0,242,254,0.35); }
      .aiss-status { position: absolute; top: 10px; right: 10px; padding: 3px 9px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; background: rgba(6,9,19,0.82); color: #e2e8f0; }
      .aiss-status.visited { color: #6ee7b7; border: 1px solid rgba(16,185,129,0.4); }
      .aiss-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
      .aiss-reason { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; padding: 8px 10px; border-radius: 10px; background: rgba(0,242,254,0.06); border-left: 3px solid var(--accent-cyan); }
      body.light-theme .aiss-hero, body.light-theme .aiss-card { background: rgba(255,255,255,0.92); color: #0f172a; }
      body.light-theme .aiss-input { background: #f1f5f9; color: #0f172a; }
      body.light-theme .aiss-summary, body.light-theme .aiss-reason { background: rgba(2,132,199,0.08); color: #0f172a; }
    `;
    document.head.appendChild(style);
  }

  function localSemanticScore(query, provincesObj, norm) {
    const q = norm(query);
    const wantUnvisited = /(gitmedigim|gezilmemis|bekleyen|henuz|kesfedilmemis)/.test(q);
    const wantVisited = /(gezdigim|gittigim|gezilmis)/.test(q);
    const wantCoast = /(deniz|sahil|kiyi|plaj|ege|akdeniz|karadeniz)/.test(q);
    const wantWinter = /(kis|kar|kayak|soguk|corba)/.test(q);
    const wantHistory = /(selcuklu|osmanli|tarih|unesco|antik|medrese|kale|cami)/.test(q);
    const wantFood = /(yemek|lezzet|gurme|kebap|tatli|mutfak|corba)/.test(q);
    const wantLibrary = /(kutuphane|calisma|odak|sakin|kitap)/.test(q);
    const distMatch = q.match(/(\d{2,4})\s*km/);
    const maxKm = distMatch ? parseInt(distMatch[1], 10) : null;
    const countMatch = q.match(/\b([1-9]|1[0-2])\s*(il|sehir|durak|menzil|sakin)/);
    const limit = countMatch ? Math.min(12, Math.max(3, parseInt(countMatch[1], 10))) : 6;
    const tokens = q.split(/[^a-z0-9]+/).filter(t => t.length >= 3);

    const scored = Object.entries(provincesObj).map(([key, p]) => {
      if (wantUnvisited && p.visited) return null;
      if (wantVisited && !p.visited) return null;
      const distAnkara = (p.lat && p.lng) ? haversineKm(ANKARA_COORDS.lat, ANKARA_COORDS.lng, p.lat, p.lng) : 999;
      if (maxKm && q.includes('ankara') && distAnkara > maxKm) return null;

      let score = 10;
      const hay = norm([p.name, p.region, p.quote, p.history, p.library, ...(p.landmarks || []), ...(p.specialties || [])].join(' '));
      tokens.forEach(t => { if (hay.includes(t)) score += 14; });
      if (wantCoast && COASTAL_PLATES.has(Number(p.plate))) score += 26;
      if (wantWinter && (p.region_code === '06_DoguAnadolu' || /(kar|kis|kayak|erzurum|kars|ardahan|bolu|uludag)/.test(hay))) score += 24;
      if (wantHistory && /(selcuklu|osmanli|unesco|antik|medrese|kale|cami|turbe)/.test(hay)) score += 22;
      if (wantFood && (p.specialties || []).length >= 3) score += 18;
      if (wantLibrary && (p.library || p.custom_library)) score += 15;
      if (q.includes('guneydogu') && p.region_code === '07_GuneydoguAnadolu') score += 35;
      if (q.includes('dogu') && !q.includes('guneydogu') && p.region_code === '06_DoguAnadolu') score += 35;
      if (q.includes('karadeniz') && p.region_code === '05_Karadeniz') score += 35;
      if (q.includes('ege') && p.region_code === '02_Ege') score += 35;
      if (q.includes('akdeniz') && p.region_code === '03_Akdeniz') score += 35;
      if (q.includes('marmara') && p.region_code === '01_Marmara') score += 35;

      const reasonParts = [];
      if (p.landmarks && p.landmarks[0]) reasonParts.push(`🏛️ ${p.landmarks[0]}`);
      if (p.specialties && p.specialties[0]) reasonParts.push(`🍽️ ${p.specialties[0]}`);
      if (maxKm && q.includes('ankara')) reasonParts.push(`🧭 Ankara'ya ~${distAnkara} km`);
      return { key, p, score, reason: reasonParts.join(' • ') || p.quote || p.region };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, limit);

    return {
      source: 'Yerel Semantik Motor',
      summary: `"${query}" araması için 81 il veri tabanında en uyumlu ${scored.length} menzil sıralandı.`,
      items: scored
    };
  }

  function extractJsonBlock(raw) {
    if (!raw) return null;
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenced ? fenced[1].trim() : raw.trim();
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    try { return JSON.parse(candidate.slice(start, end + 1)); } catch (e) { return null; }
  }

  async function runSearch(query, ctx) {
    const provincesObj = (ctx.data && ctx.data.provinces) || {};
    const norm = ctx.normalizeTurkish || fallbackNorm;
    const ai = window.SEYYAH_AI;

    if (ai && typeof ai.hasKey === 'function' && ai.hasKey()) {
      const compactCatalog = Object.values(provincesObj).map(p =>
        `${p.name}(${p.plate},${p.region},${p.visited ? 'G' : 'B'},${(p.landmarks || []).slice(0, 2).join('/')},${(p.specialties || []).slice(0, 2).join('/')})`
      ).join('; ');

      const prompt = `Kullanıcı sorgusu: "${query}"
Aşağıdaki 81 il kataloğundan (G=Gezildi, B=Bekliyor/Gezilmedi) sorguya EN UYGUN 4 ila 6 ili seç ve SADECE şu JSON formatında yanıt ver:
{"summary":"1-2 cümlelik akıcı Türkçe özet","matches":[{"name":"Tam İl Adı","reason":"Bu sorgu için neden seçildiğini anlatan 1 net Türkçe cümle"}]}
Katalog: ${compactCatalog}`;

      try {
        const res = await ai.ask({
          prompt,
          system: 'Sen Türkiye 81 il akıllı arama motorusun. Yalnızca geçerli JSON döndür.',
          temperature: 0.45,
          maxTokens: 1400,
          cacheKey: 'aisearch:' + norm(query)
        });
        const parsed = extractJsonBlock(res.text);
        if (parsed && Array.isArray(parsed.matches) && parsed.matches.length > 0) {
          const byNormName = new Map();
          Object.entries(provincesObj).forEach(([k, p]) => byNormName.set(norm(p.name), { key: k, p }));
          const items = [];
          for (const m of parsed.matches) {
            const hit = byNormName.get(norm(m.name));
            if (hit && !items.some(x => x.key === hit.key)) {
              items.push({ key: hit.key, p: hit.p, reason: m.reason || hit.p.quote || hit.p.region });
            }
          }
          if (items.length > 0) {
            return {
              source: `🟢 Gemini (${res.model}${res.cached ? ' • Önbellek' : ''})`,
              summary: parsed.summary || `"${query}" için Gemini AI eşleşmeleri:`,
              items
            };
          }
        }
      } catch (e) {
        // fall back cleanly to local semantic engine
      }
    }

    return localSemanticScore(query, provincesObj, norm);
  }

  function render(container, ctx) {
    if (!container) return;
    ensureStyles();
    const safeCtx = ctx || {};
    const esc = safeCtx.escapeHtml || fallbackEsc;
    const hasAi = !!(window.SEYYAH_AI && window.SEYYAH_AI.hasKey && window.SEYYAH_AI.hasKey());

    const resultsHtml = lastResults ? `
      <div class="aiss-summary">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:6px;">
          <strong style="color:var(--accent-cyan);">✨ Arama Sonucu (${lastResults.items.length} Menzil)</strong>
          <span style="font-size:0.74rem;color:var(--text-muted);">${esc(lastResults.source)}</span>
        </div>
        <div>${esc(lastResults.summary)}</div>
      </div>
      <div class="aiss-grid">
        ${lastResults.items.map(it => `
          <article class="aiss-card" data-aiss-city="${esc(it.key)}">
            <div class="aiss-media">
              <img src="${esc(it.p.banner_rel || 'assets/banner.jpg')}" alt="${esc(it.p.name)}" loading="lazy" onerror="this.src='assets/banner.jpg'" />
              <span class="aiss-plate">${String(it.p.plate || 0).padStart(2, '0')}</span>
              <span class="aiss-status ${it.p.visited ? 'visited' : ''}">${it.p.visited ? '✅ Gezildi' : '⏳ Bekliyor'}</span>
            </div>
            <div class="aiss-body">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <strong style="font-family:var(--font-heading);font-size:1.05rem;">${esc(it.p.name)}</strong>
                <span style="font-size:0.74rem;color:var(--text-muted);">${esc(it.p.region)}</span>
              </div>
              <div class="aiss-reason">${esc(it.reason)}</div>
              <div style="margin-top:auto;font-size:0.76rem;color:var(--accent-cyan);font-weight:700;">📍 Menzili İncele ➔</div>
            </div>
          </article>
        `).join('')}
      </div>
    ` : `
      <div class="glass-card detail-card" style="text-align:center;padding:34px 20px;color:var(--text-secondary);">
        <div style="font-size:2.2rem;margin-bottom:8px;">🔎</div>
        <div>Yukarıya doğal Türkçe bir kriter yazın veya hazır örneklerden birine tıklayın.</div>
      </div>
    `;

    container.innerHTML = `
      <section class="aiss-shell">
        <div class="aiss-hero">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <div>
              <h2 style="font-family:var(--font-heading);font-size:1.45rem;margin:0;color:var(--accent-cyan);">🔎 AI Doğal Dil Akıllı Arama</h2>
              <p style="font-size:0.84rem;color:var(--text-secondary);margin:4px 0 0 0;">Çok kriterli doğal Türkçe sorularla 81 il arasında anında akıllı eşleştirme yapın.</p>
            </div>
            <span class="tag-badge" style="font-size:0.75rem;">${hasAi ? '🟢 Gemini AI Hazır' : '⚡ Semantik Yerel Motor'}</span>
          </div>
          <form class="aiss-form" id="aiss-form">
            <input type="text" id="aiss-input" class="aiss-input" placeholder='Örn: "Denize kıyısı olan, kütüphanesi güzel, henüz gitmediğim 4 sakin il"' value="${esc(lastQuery)}" required />
            <button type="submit" id="aiss-btn" class="btn btn-primary" style="padding:12px 22px;">✨ AI ile Ara</button>
          </form>
          <div class="aiss-chips">
            ${EXAMPLE_QUERIES.map(q => `<button type="button" class="aiss-chip" data-aiss-ex="${esc(q)}">${esc(q)}</button>`).join('')}
          </div>
        </div>
        <div id="aiss-results">${resultsHtml}</div>
      </section>
    `;

    const form = document.getElementById('aiss-form');
    const input = document.getElementById('aiss-input');
    const btn = document.getElementById('aiss-btn');
    const resultsWrap = document.getElementById('aiss-results');

    const execute = async (qText) => {
      const clean = String(qText || '').trim();
      if (!clean) return;
      lastQuery = clean;
      if (input) input.value = clean;
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Aranıyor...'; }
      if (resultsWrap) {
        resultsWrap.innerHTML = `<div class="aiss-summary">✨ 81 il taranıyor ve en iyi eşleşmeler hazırlanıyor...</div>`;
      }
      lastResults = await runSearch(clean, safeCtx);
      render(container, ctx);
    };

    if (form) form.addEventListener('submit', (e) => { e.preventDefault(); execute(input.value); });
    container.querySelectorAll('[data-aiss-ex]').forEach(el => {
      el.addEventListener('click', () => execute(el.getAttribute('data-aiss-ex')));
    });
    container.querySelectorAll('[data-aiss-city]').forEach(card => {
      card.addEventListener('click', () => {
        const key = card.getAttribute('data-aiss-city');
        if (key && typeof safeCtx.selectCity === 'function') safeCtx.selectCity(key);
      });
    });
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.aiSearch = { render };
})();
