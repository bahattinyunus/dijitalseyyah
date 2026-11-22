/**
 * Anadolu Seyahatnamesi — Akıllı Seyyah Rehberi (İnteraktif Soru-Cevap & Öneri Asistanı)
 * 100% client-side Turkish NLP & travel concierge powered by ctx.data.provinces.
 * Registers on window.SEYYAH_MODULES.advisor = { render(container, ctx) }
 */

(function () {
  'use strict';

  const QUICK_PROMPTS = [
    "🧭 Ankara'ya yakın gezilmemiş 5 il",
    '🏜️ Güneydoğu Anadolu (Mezopotamya) önerisi',
    '🍽️ En meşhur kebap ve tatlı şehirleri',
    '📚 En iyi kütüphane ofisleri',
    '🌊 Deniz ve şelale rotası öner',
    '🕌 Tasavvuf ve maneviyat şehirleri',
    '❄️ Kışın gidilecek en güzel iller',
    '🎲 Bana sürpriz bir 3 duraklı hafta sonu rotası kur'
  ];

  const ADVISOR_PERSONAS = [
    {
      id: 'modern',
      label: '🧭 Modern Dijital Seyyah',
      systemHint:
        'Üslup: Modern Dijital Seyyah. 5 Gün Kuralı, İl Halk Kütüphanesi çalışma mesaisi, GSB Seyahatsever KYK kültürü ve pratik dijital göçebe ipuçlarını ön plana çıkar.',
      prefix: '',
      suffix: ''
    },
    {
      id: 'evliya',
      label: '📜 Evliya Çelebi Üslubu',
      systemHint:
        'Üslup: Evliya Çelebi Seyahatnâmesi. Zarif Osmanlıca/klasik Türkçe nüanslar ("Seyahat ya Resûlallah", "bi-hamdillah", "temaşa eyledik", "ab-ı hayat") kullanarak edebi, hikmetli ve sıcak bir seyyah diliyle anlat.',
      prefix: '📜 *Seyahatnâme-i Anadolu kaydıdır:* ',
      suffix: '\n\n*Vesselâm, yolumuz ilim ve hikmet menziline açık ola!*'
    },
    {
      id: 'akademik',
      label: '🏛️ Akademik Tarihçi',
      systemHint:
        'Üslup: Akademik Tarihçi ve Mimarlık Tarihçisi. Medeniyet katmanlarını (Hitit, Roma, Selçuklu, Beylikler, Osmanlı, Cumhuriyet), taş işçiliğini, külliye/kervansaray mimarisini ve kronolojik bağlamı analitik bir dille açıkla.',
      prefix: '🏛️ **Tarihsel & Mimari Analiz:** ',
      suffix: '\n\n*Mimari Not:* Şehir dokusunu incelerken portal taş işçiliği, kervansaray aksları ve vakıf kütüphanelerinin mekânsal kurgusuna özellikle dikkat edilmelidir.'
    },
    {
      id: 'gurme',
      label: '🍽️ Anadolu Gurme Rehberi',
      systemHint:
        'Üslup: Anadolu Gurme & Gastronomi Rehberi. Coğrafi işaretli yöresel lezzetleri, asırlık esnaf lokantalarını, pişirme tekniklerini, baharat dengesini ve tatlı-kahve ritüellerini iştah açıcı bir dille vurgula.',
      prefix: '🍽️ **Anadolu Gastronomi & Lezzet Seçkisi:** ',
      suffix: '\n\n*Gurme İpucu:* Sabah kütüphane mesaisi sonrası öğle saatlerinde tarihî çarşı esnaf lokantalarında coğrafi işaretli ürünleri yerinde tatmayı unutmayın.'
    }
  ];

  // In-memory session chat history (persists across view switches during session)
  let chatHistory = [];
  let messageSeq = 0;
  let activePersonaId = 'modern';
  let isTtsSpeaking = false;

  function getActivePersona() {
    return ADVISOR_PERSONAS.find((p) => p.id === activePersonaId) || ADVISOR_PERSONAS[0];
  }

  function applyPersonaToOfflineText(rawText) {
    const persona = getActivePersona();
    if (!rawText || persona.id === 'modern') return rawText;
    return `${persona.prefix}${rawText}${persona.suffix}`;
  }

  // Gemini API Storage & Helpers (BYOK localStorage + Netlify Serverless Proxy)
  const GEMINI_KEY_STORAGE = 'dijital_seyyah_gemini_api_key';
  const GEMINI_MODEL_STORAGE = 'dijital_seyyah_gemini_model';
  const GEMINI_SYSTEM_PROMPT = `Sen "Dijital Seyyah: Anadolu Seyahatnamesi" projesinin yapay zekâ destekli seyahat ve tefekkür rehberisin.
Türkiye'nin 81 ili, 7 bölgesi, tarihî/manevi mirası, yöresel lezzetleri, İl Halk Kütüphanesi çalışma ofisleri, 5 Gün Kuralı ve GSB Seyahatsever KYK kültürü hakkında doğru, samimi ve ilham verici Türkçe yanıtlar ver. Cevaplarını kısa, net ve **kalın** şehir adlarıyla yapılandır (en fazla 220 kelime).`;

  function getStoredGeminiKey() {
    try { return (localStorage.getItem(GEMINI_KEY_STORAGE) || '').trim(); } catch (e) { return ''; }
  }

  function setStoredGeminiKey(key) {
    try {
      if (key && key.trim()) localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
      else localStorage.removeItem(GEMINI_KEY_STORAGE);
    } catch (e) {}
  }

  const RETIRED_MODELS = new Set(['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite', 'gemini-2.0-flash']);

  function getStoredGeminiModel() {
    try {
      const m = localStorage.getItem(GEMINI_MODEL_STORAGE) || 'gemini-flash-lite-latest';
      return RETIRED_MODELS.has(m) ? 'gemini-flash-lite-latest' : m;
    } catch (e) {
      return 'gemini-flash-lite-latest';
    }
  }

  function setStoredGeminiModel(model) {
    try { localStorage.setItem(GEMINI_MODEL_STORAGE, model); } catch (e) {}
  }

  function buildSeyyahContextSummary(provinces, safeCtx) {
    const visited = provinces.filter((p) => p.visited).map((p) => p.name);
    const customRoute = (safeCtx.state && safeCtx.state.customRouteCities) ||
      (safeCtx.data && safeCtx.data.custom_route) ||
      ['Ankara', 'Çankırı', 'Kastamonu', 'Karabük', 'Bartın', 'Zonguldak', 'Düzce', 'Sakarya', 'İstanbul', 'Edirne'];
    return [
      `Toplam 81 ilin ${visited.length} tanesi gezildi (%${((visited.length / 81) * 100).toFixed(1)}).`,
      `Gezilen iller: ${visited.join(', ')}.`,
      `Aktif sıradaki sefer rotası: ${customRoute.join(' -> ')}.`,
      `Güneydoğu Anadolu (0/9) sıradaki büyük Mezopotamya hedefidir.`
    ].join('\n');
  }

  function extractMentionedProvinceCards(replyText, provinces, normalizeFn) {
    const normReply = normalizeFn(replyText || '');
    if (!normReply) return [];
    const matched = [];
    for (const p of provinces) {
      const pNorm = normalizeFn(p.name);
      if (pNorm.length >= 3 && new RegExp(`(^|[^a-z])${pNorm}([^a-z]|$)`).test(normReply)) {
        matched.push({
          key: p.key,
          name: p.name,
          plate: p.plate,
          visited: p.visited,
          thumb: p.banner_rel || '',
          badge: p.region,
          reason: (p.landmarks && p.landmarks[0]) ? `📍 ${p.landmarks[0]}` : (p.quote || p.region)
        });
        if (matched.length >= 6) break;
      }
    }
    return matched;
  }

  async function askGeminiEngine(prompt, provinces, safeCtx, currentUserMsgId) {
    const model = getStoredGeminiModel();
    const byokKey = getStoredGeminiKey();
    const persona = getActivePersona();
    const contextSummary = `${buildSeyyahContextSummary(provinces, safeCtx)}\n\nSeçili Üslup / Persona Talimatı:\n${persona.systemHint}`;

    // Build strictly alternating user -> model history (excluding welcome msg, loading msg, and current prompt)
    const rawTurns = chatHistory
      .filter((m) => !m.loading && m.id !== 0 && m.id !== currentUserMsgId && (m.role === 'user' || m.role === 'assistant'))
      .slice(-6);
    const alternatingHistory = [];
    for (const m of rawTurns) {
      const role = m.role === 'assistant' ? 'model' : 'user';
      if (alternatingHistory.length === 0 && role !== 'user') continue;
      if (alternatingHistory.length > 0 && alternatingHistory[alternatingHistory.length - 1].role === role) continue;
      alternatingHistory.push({ role, text: String(m.text || '').slice(0, 700) });
    }
    // Ensure history ends with 'model' so appending the new 'user' turn always alternates cleanly
    if (alternatingHistory.length > 0 && alternatingHistory[alternatingHistory.length - 1].role === 'user') {
      alternatingHistory.pop();
    }

    // 1. Direct BYOK call if user configured their own key in localStorage
    if (byokKey) {
      const candidateModels = [model, 'gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest']
        .filter((m, idx, arr) => m && arr.indexOf(m) === idx);
      const contents = alternatingHistory.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
      contents.push({ role: 'user', parts: [{ text: prompt }] });

      let lastErr = null;
      for (const tryModel of candidateModels) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(tryModel)}:generateContent?key=${encodeURIComponent(byokKey)}`;
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: `${GEMINI_SYSTEM_PROMPT}\n\n${persona.systemHint}\n\nGüncel Veri:\n${contextSummary}` }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
          })
        });
        const data = await res.json();
        if (!res.ok) {
          const msg = (data && data.error && data.error.message) || `HTTP ${res.status}`;
          lastErr = new Error(msg);
          // If quota/billing/overload/not-found for this specific model, try next live model
          if (res.status === 429 || res.status === 404 || res.status === 503 || /quota|billing|limit|not found|high demand|no longer available/i.test(msg)) {
            continue;
          }
          throw lastErr;
        }
        const reply =
          data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts
            ? data.candidates[0].content.parts.map((pt) => pt.text || '').join('\n').trim()
            : '';
        if (reply) return { reply, source: `Gemini (${tryModel} • Canlı AI)` };
        lastErr = new Error('Gemini boş yanıt döndü');
      }
      throw lastErr || new Error('Gemini API yanıt vermedi');
    }

    // 2. Netlify Serverless Proxy (/.netlify/functions/seyyah-ai) on http/https
    if (typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
      const res = await fetch('/.netlify/functions/seyyah-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model,
          context: contextSummary,
          history: alternatingHistory
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          return { reply: data.reply, source: `Gemini (${data.model || model} • Canlı API)` };
        }
      }
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Helper Fallbacks & Utilities
  // ---------------------------------------------------------------------------
  function fallbackNormalize(str) {
    if (!str) return '';
    return String(str)
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .trim();
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

  function fallbackCalcDistKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function padPlate(plate) {
    const n = Number(plate) || 0;
    return n < 10 ? '0' + n : String(n);
  }

  function stripMarkdownBold(str) {
    return String(str || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
  }

  function truncate(str, maxLen) {
    const clean = stripMarkdownBold(str).trim();
    if (clean.length <= maxLen) return clean;
    return clean.slice(0, maxLen - 1).trimEnd() + '…';
  }

  function formatRichText(text, escapeHtml) {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function nowTimeLabel() {
    try {
      return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function stripLeadingEmoji(str) {
    return String(str || '')
      .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\s]+/u, '')
      .trim();
  }

  // ---------------------------------------------------------------------------
  // Data Indexing
  // ---------------------------------------------------------------------------
  function buildProvinceIndex(ctx) {
    const norm = ctx.normalizeTurkish || fallbackNormalize;
    const provincesObj = (ctx.data && ctx.data.provinces) || {};
    const list = [];

    Object.keys(provincesObj).forEach((key) => {
      const p = provincesObj[key];
      if (!p || !p.name) return;

      const landmarks = Array.isArray(p.landmarks) ? p.landmarks : [];
      const specialties = Array.isArray(p.specialties) ? p.specialties : [];
      const spiritual = Array.isArray(p.spiritual_figures) ? p.spiritual_figures : [];
      const literary = Array.isArray(p.literary_quotes) ? p.literary_quotes : [];
      const plan = Array.isArray(p.five_day_plan) ? p.five_day_plan : [];
      const thumb = p.banner_rel || (Array.isArray(p.images) && p.images[0]) || p.gallery_rel || '';

      list.push({
        key,
        plate: Number(p.plate) || 0,
        name: p.name,
        region: p.region || '',
        region_code: p.region_code || '',
        lat: Number(p.lat) || 0,
        lng: Number(p.lng) || 0,
        visited: Boolean(p.visited),
        landmarks,
        specialties,
        spiritual_figures: spiritual,
        literary_quotes: literary,
        five_day_plan: plan,
        library: p.library || '',
        quote: p.custom_quote || p.quote || '',
        history: p.history || '',
        thumb,
        normName: norm(p.name),
        normRegion: norm(p.region || ''),
        normLandmarks: norm(landmarks.join(' ')),
        normSpecialties: norm(specialties.join(' ')),
        normSpiritual: norm(spiritual.join(' ')),
        normLibrary: norm(p.library || ''),
        normQuote: norm((p.custom_quote || p.quote || '') + ' ' + literary.join(' ')),
        normPlan: norm(plan.join(' ')),
        normHistory: norm(p.history || ''),
        normAll: norm(
          [
            p.name,
            p.region,
            landmarks.join(' '),
            specialties.join(' '),
            spiritual.join(' '),
            p.library,
            p.custom_quote || p.quote,
            literary.join(' '),
            plan.join(' '),
            p.history
          ].join(' ')
        )
      });
    });

    return list;
  }

  // ---------------------------------------------------------------------------
  // Turkish NLP Intent Helpers
  // ---------------------------------------------------------------------------
  const REGION_ALIASES = [
    { code: '07_GuneydoguAnadolu', label: 'Güneydoğu Anadolu', keywords: ['guneydogu', 'mezopotamya', 'gap'] },
    { code: '06_DoguAnadolu', label: 'Doğu Anadolu', keywords: ['dogu anadolu', 'serhat'] },
    { code: '05_Karadeniz', label: 'Karadeniz', keywords: ['karadeniz'] },
    { code: '04_IcAnadolu', label: 'İç Anadolu', keywords: ['ic anadolu', 'bozkir'] },
    { code: '03_Akdeniz', label: 'Akdeniz', keywords: ['akdeniz', 'toroslar'] },
    { code: '02_Ege', label: 'Ege', keywords: ['ege'] },
    { code: '01_Marmara', label: 'Marmara', keywords: ['marmara'] }
  ];

  const SUBREGION_CITIES = {
    kapadokya: ['Nevşehir', 'Aksaray', 'Kayseri', 'Niğde', 'Kırşehir'],
    trakya: ['Edirne', 'Kırklareli', 'Tekirdağ', 'Çanakkale', 'İstanbul'],
    'dogu karadeniz': ['Trabzon', 'Rize', 'Artvin', 'Giresun', 'Ordu', 'Gümüşhane', 'Bayburt'],
    'bati karadeniz': ['Kastamonu', 'Bartın', 'Karabük', 'Zonguldak', 'Bolu', 'Düzce', 'Sinop']
  };

  const STOPWORDS = new Set([
    've', 'ile', 'icin', 'bir', 'bu', 'su', 'o', 'da', 'de', 'mi', 'mu', 'mi', 'en',
    'olan', 'il', 'iller', 'illeri', 'sehir', 'sehirler', 'sehirleri', 'bana', 'benim',
    'oner', 'onerisi', 'onerir', 'misin', 'nedir', 'neler', 'nasil', 'hangisi', 'hangileri',
    'kac', 'tane', 'adet', 'guzel', 'meshur', 'unlu', 'iyi', 'kur', 'yap', 'goster',
    'bul', 'listele', 'rotasi', 'rota', 'gidilecek', 'gitmek', 'istiyorum', 'hakkinda',
    'var', 'mi', 'mı', 'yakin', 'yakininda', 'yakinindaki', 'cevresinde', 'cevresi',
    'gezilmemis', 'gezilmis', 'gidilmemis', 'gidilmis', 'kesfedilmemis'
  ]);

  function detectVisitedFilter(q) {
    if (/(gezilmemis|gidilmemis|kesfedilmemis|kalmis|kalan|henuz gitmedigim|gitmedigim)/.test(q)) {
      return 'unvisited';
    }
    if (/(gezilmis|gidilmis|gezdigim|gittigim|tamamlanan)/.test(q)) {
      return 'visited';
    }
    return 'all';
  }

  function detectRegion(q) {
    for (let i = 0; i < REGION_ALIASES.length; i++) {
      const r = REGION_ALIASES[i];
      for (let j = 0; j < r.keywords.length; j++) {
        const kw = r.keywords[j];
        if (kw === 'ege') {
          if (/\bege(?:de|ye|nin|li|yi|\b)/.test(q)) return r;
        } else if (q.includes(kw)) {
          return r;
        }
      }
    }
    return null;
  }

  function detectSubregion(q, provinces, norm) {
    const keys = Object.keys(SUBREGION_CITIES);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (q.includes(k)) {
        const names = SUBREGION_CITIES[k].map((n) => norm(n));
        return {
          name: k,
          provinces: provinces.filter((p) => names.includes(p.normName))
        };
      }
    }
    return null;
  }

  function detectRequestedCount(q, defaultCount, minCount, maxCount) {
    const m = q.match(/\b(\d{1,2})\s*(?:il|sehir|durak|oner|tane|adet|gun)\b/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n)) return Math.max(minCount, Math.min(maxCount, n));
    }
    return defaultCount;
  }

  function findMentionedProvince(q, provinces) {
    // Sort by name length descending so "Kahramanmaraş" matches before shorter names
    const sorted = provinces.slice().sort((a, b) => b.normName.length - a.normName.length);
    const cleaned = q.replace(/['’`]/g, '');

    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i];
      if (p.normName.length < 3) continue;
      // Match whole word or Turkish suffixed form (e.g. ankaraya, konyada, istanbula, izmirin)
      const re = new RegExp('(?:^|\\s)' + p.normName + '(?:$|\\s|[a-z]{1,6}(?:\\s|$))');
      if (re.test(cleaned)) {
        // Guard against false positive "van" inside "kavan" / "devan" or "mus" inside "olmus" / "meshur"
        if (p.normName === 'van' && !/(?:^|\s)van(?:'|’|\s|$|a\b|da\b|dan\b|in\b|i\b|li\b)/.test(q)) {
          continue;
        }
        if (p.normName === 'mus' && !/(?:^|\s)mus(?:'|’|\s|$|a\b|ta\b|tan\b|un\b|u\b|lu\b)/.test(q)) {
          continue;
        }
        return p;
      }
    }
    return null;
  }

  function applyVisitedFilter(list, filter) {
    if (filter === 'unvisited') return list.filter((p) => !p.visited);
    if (filter === 'visited') return list.filter((p) => p.visited);
    return list;
  }

  function roadKm(p1, p2, calcDistKm) {
    return Math.round(calcDistKm(p1.lat, p1.lng, p2.lat, p2.lng) * 1.35);
  }

  function makeCard(p, opts) {
    const o = opts || {};
    return {
      key: p.key,
      plate: p.plate,
      name: p.name,
      region: p.region,
      visited: p.visited,
      thumb: p.thumb,
      badge: o.badge || '',
      reason: o.reason || truncate(p.landmarks.slice(0, 2).join(' • ') || p.quote, 95)
    };
  }

  // ---------------------------------------------------------------------------
  // Core Smart Query Resolver
  // ---------------------------------------------------------------------------
  function resolveQuery(rawQuery, provinces, ctx) {
    const norm = ctx.normalizeTurkish || fallbackNormalize;
    const calcDistKm = ctx.calcDistKm || fallbackCalcDistKm;
    const cleanRaw = stripLeadingEmoji(rawQuery);
    const q = norm(cleanRaw);

    if (!q) {
      return {
        text: 'Bir şehir, bölge, lezzet, kütüphane, plaka veya rota sorabilirsin. Yukarıdaki hızlı sorulardan birine de dokunabilirsin!',
        cards: []
      };
    }

    const visitedFilter = detectVisitedFilter(q);
    const regionMatch = detectRegion(q);
    const subregionMatch = detectSubregion(q, provinces, norm);
    const totalCount = provinces.length;
    const visitedProvinces = provinces.filter((p) => p.visited);
    const unvisitedProvinces = provinces.filter((p) => !p.visited);

    // -------------------------------------------------------------------------
    // 1. Greeting / Help
    // -------------------------------------------------------------------------
    if (/^(merhaba|selam|slm|hey|gunaydin|iyi aksamlar|nasilsin|yardim|neler yapabilirsin|kimsin)/.test(q) && q.length < 36) {
      const pct = totalCount ? ((visitedProvinces.length / totalCount) * 100).toFixed(1) : '0';
      return {
        text:
          `Selam seyyah! Ben **Akıllı Seyyah Rehberi** — 81 ilin tarihi, kütüphaneleri, gastronomisi, manevi mirası ve koordinatlarıyla anlık çalışırım.\n` +
          `Şu an **${visitedProvinces.length}/${totalCount} il (%${pct})** tamamlanmış durumda. Bana şunları sorabilirsin:\n` +
          `• Yakınlık: *"Konya yakınında gezilmemiş iller"*\n` +
          `• Tema: *"kanyon olan şehirler"*, *"Mevlana"*, *"tatlı"*\n` +
          `• Plaka & Rota: *"34 plaka"*, *"sürpriz 3 duraklı rota kur"*`,
        cards: []
      };
    }

    // -------------------------------------------------------------------------
    // 2. Stats / Progress Queries ("kaç il gezildi", "istatistik", "rütbe")
    // -------------------------------------------------------------------------
    if (
      /(kac il|kac sehir|istatistik|ilerleme|yuzde|kac tane gez|ne kadar gez|rutbe|rozet|ozet|durumum|kac km|kutuphane saati)/.test(q) &&
      !/(yakin|rota|oner)/.test(q)
    ) {
      const stats = (ctx.data && ctx.data.stats) || {};
      const ach = (ctx.data && ctx.data.achievements) || {};
      const pct = totalCount ? ((visitedProvinces.length / totalCount) * 100).toFixed(1) : '0.0';
      const rankTitle = ach.rank ? `${ach.rank.icon || '🏅'} **${ach.rank.title}**` : 'Seyyah';
      const nextRankInfo = ach.next_rank
        ? `\nBir sonraki rütbe (**${ach.next_rank.title}**) için yalnızca **${ach.cities_to_next_rank || Math.max(0, ach.next_rank.min_cities - visitedProvinces.length)} il** kaldı!`
        : '';

      // Regional breakdown
      const regLines = [];
      const regData = stats.regional_breakdown || {};
      Object.keys(regData).forEach((code) => {
        const r = regData[code];
        regLines.push(`${r.icon || '📍'} ${r.name.replace(' Bölgesi', '')}: **${r.visited}/${r.total}**`);
      });

      const suggested = unvisitedProvinces
        .slice()
        .sort((a, b) => (a.region_code === '07_GuneydoguAnadolu' ? -1 : 1) - (b.region_code === '07_GuneydoguAnadolu' ? -1 : 1))
        .slice(0, 4)
        .map((p) =>
          makeCard(p, {
            badge: p.region,
            reason: `Keşif bekliyor • ${p.landmarks.slice(0, 2).join(', ')}`
          })
        );

      return {
        text:
          `📊 **Anadolu Seyahatnamesi Güncel Durumun:**\n` +
          `• **Gezilen:** ${visitedProvinces.length} il • **Keşif Bekleyen:** ${unvisitedProvinces.length} il (**%${pct}**)\n` +
          `• **Rütbe:** ${rankTitle}${stats.estimated_km ? ` • **~${Number(stats.estimated_km).toLocaleString('tr-TR')} km** yol` : ''}${stats.library_hours ? ` • **${stats.library_hours} saat** kütüphane mesaisi` : ''}` +
          nextRankInfo +
          (regLines.length ? `\n\n**Bölge Dağılımı:** ${regLines.join(' | ')}` : '') +
          `\n\nSıradaki hedefin için birkaç keşif önerisi:`,
        cards: suggested
      };
    }

    // -------------------------------------------------------------------------
    // 3. Plate Code Lookup ("34 plaka", "plaka 06", "42")
    // -------------------------------------------------------------------------
    const plateMatch =
      q.match(/\bplaka(?:si|li)?\s*[:#-]?\s*0?(\d{1,2})\b/) ||
      q.match(/\b0?(\d{1,2})\s*(?:nolu|numarali)?\s*plaka(?:li|si)?\b/) ||
      q.match(/^0?(\d{1,2})$/);

    if (plateMatch) {
      const plateNum = parseInt(plateMatch[1], 10);
      const found = provinces.find((p) => p.plate === plateNum);
      if (found) {
        const neighbors = provinces
          .filter((p) => p.key !== found.key)
          .map((p) => ({ p, km: roadKm(found, p, calcDistKm) }))
          .sort((a, b) => a.km - b.km)
          .slice(0, 3);

        const cards = [
          makeCard(found, {
            badge: `Plaka ${padPlate(found.plate)}`,
            reason: `${found.landmarks.slice(0, 2).join(' • ')}`
          })
        ].concat(
          neighbors.map((n) =>
            makeCard(n.p, {
              badge: `~${n.km} km komşu`,
              reason: truncate(n.p.specialties.slice(0, 2).join(', ') || n.p.landmarks[0] || n.p.quote, 85)
            })
          )
        );

        return {
          text:
            `🪪 **${padPlate(found.plate)} Plaka → ${found.name}** (${found.region} Bölgesi • ${found.visited ? '✅ Gezildi' : '🧭 Keşif Bekliyor'})\n` +
            `• **Öne Çıkanlar:** ${found.landmarks.join(', ')}\n` +
            `• **Meşhur Lezzetler:** ${found.specialties.join(', ')}\n` +
            `• **Kütüphane Ofisi:** ${truncate(found.library, 110)}\n` +
            `Aşağıda **${found.name}** ve en yakın 3 komşu ilini bulabilirsin:`,
          cards
        };
      } else {
        return {
          text: `Türkiye'de **01 ile 81** arasında il plaka kodu bulunuyor. Girdiğin **${plateNum}** numaralı bir il plakası bulunamadı.`,
          cards: []
        };
      }
    }

    // -------------------------------------------------------------------------
    // 4. Surprise / Weekend Multi-Stop Route Builder
    // -------------------------------------------------------------------------
    if (
      /(surpriz|rastgele|hafta sonu|durakli|rota kur|rota olustur|bana.*rota)/.test(q) &&
      !/(deniz|selale)/.test(q)
    ) {
      const stopCount = detectRequestedCount(q, 3, 2, 6);
      const anchorCity = findMentionedProvince(q, provinces);
      let pool = provinces.slice();

      if (regionMatch) {
        pool = pool.filter((p) => p.region_code === regionMatch.code);
      } else if (subregionMatch && subregionMatch.provinces.length >= 2) {
        pool = subregionMatch.provinces.slice();
      }

      if (visitedFilter === 'unvisited' || (!visitedFilter || visitedFilter === 'all')) {
        const unvisPool = pool.filter((p) => !p.visited);
        if (unvisPool.length >= stopCount) pool = unvisPool;
      } else if (visitedFilter === 'visited') {
        const visPool = pool.filter((p) => p.visited);
        if (visPool.length >= 2) pool = visPool;
      }

      if (pool.length === 0) pool = provinces.slice();

      // Pick start city (anchor if specified, else random seed from pool)
      const seed = anchorCity || pool[Math.floor(Math.random() * pool.length)];
      const route = [seed];
      const used = new Set([seed.key]);

      while (route.length < stopCount) {
        const last = route[route.length - 1];
        const candidates = pool
          .filter((p) => !used.has(p.key))
          .map((p) => ({ p, km: roadKm(last, p, calcDistKm) }))
          .sort((a, b) => a.km - b.km);

        if (candidates.length === 0) break;
        // Slight randomness among top 2 closest for variety on repeated clicks
        const pickIdx = candidates.length > 1 && Math.random() < 0.35 ? 1 : 0;
        const chosen = candidates[pickIdx].p;
        route.push(chosen);
        used.add(chosen.key);
      }

      let totalKm = 0;
      const legTexts = [];
      const cards = route.map((p, idx) => {
        let legBadge = `${idx + 1}. Durak • Başlangıç`;
        if (idx > 0) {
          const km = roadKm(route[idx - 1], p, calcDistKm);
          totalKm += km;
          legBadge = `${idx + 1}. Durak • +${km} km`;
          legTexts.push(`${route[idx - 1].name} → ${p.name} (~${km} km)`);
        }
        return makeCard(p, {
          badge: legBadge,
          reason: `${p.landmarks[0] || p.region} • 🍽️ ${p.specialties[0] || 'Yerel lezzetler'}`
        });
      });

      const routeTitle = route.map((p) => p.name).join(' → ');
      return {
        text:
          `🎲 **Sürpriz ${route.length} Duraklı Seyyah Rotan Hazır!**\n` +
          `🗺️ **Güzergâh:** ${routeTitle}\n` +
          `🛣️ **Tahmini Karayolu Mesafesi:** ~${totalKm.toLocaleString('tr-TR')} km (${legTexts.join(' | ')})\n` +
          `Her durakta sabah İl Halk Kütüphanesi mesaisi, öğleden sonra şehir keşfi yapabilirsin. Detayları görmek için kartlara tıkla:`,
        cards
      };
    }

    // -------------------------------------------------------------------------
    // 5. Proximity / Near-City Queries ("Ankara'ya yakın gezilmemiş 5 il")
    // -------------------------------------------------------------------------
    const isProximity = /(yakin|cevre|komsu|etraf|civar|mesafe|uzaklik)/.test(q);
    if (isProximity) {
      const anchor = findMentionedProvince(q, provinces);
      if (anchor) {
        const count = detectRequestedCount(q, 5, 1, 10);
        let candidates = provinces.filter((p) => p.key !== anchor.key);
        if (regionMatch) {
          candidates = candidates.filter((p) => p.region_code === regionMatch.code);
        }
        candidates = applyVisitedFilter(candidates, visitedFilter);

        const ranked = candidates
          .map((p) => ({ p, km: roadKm(anchor, p, calcDistKm) }))
          .sort((a, b) => a.km - b.km)
          .slice(0, count);

        const filterLabel =
          visitedFilter === 'unvisited'
            ? 'gezilmemiş '
            : visitedFilter === 'visited'
            ? 'gezilmiş '
            : '';

        if (ranked.length === 0) {
          return {
            text: `**${anchor.name}** yakınında bu kritere uyan başka il bulunamadı. Filtreyi genişleterek tekrar deneyebilirsin!`,
            cards: []
          };
        }

        const cards = ranked.map((item, idx) =>
          makeCard(item.p, {
            badge: `#${idx + 1} • ~${item.km} km`,
            reason: `${item.p.landmarks.slice(0, 2).join(' • ')}`
          })
        );

        return {
          text:
            `🧭 **${anchor.name}** merkezine en yakın **${ranked.length} ${filterLabel}il** (tahmini karayolu mesafesine göre):\n` +
            `En yakın durak **${ranked[0].p.name} (~${ranked[0].km} km)**, en uzak durak **${ranked[ranked.length - 1].p.name} (~${ranked[ranked.length - 1].km} km)**. İncelemek istediğin şehre tıkla:`,
          cards
        };
      }
    }

    // -------------------------------------------------------------------------
    // 6. Winter / Seasonal Recommendations
    // -------------------------------------------------------------------------
    if (/(kisin|kis |^kis$|karli|kayak|uludag|palandoken|erciyes|sarikamis|termal|kaplica)/.test(q)) {
      const winterBoostNames = new Set([
        'erzurum', 'kars', 'bursa', 'kayseri', 'bolu', 'nevsehir', 'kastamonu',
        'afyonkarahisar', 'ardahan', 'sivas', 'van', 'bitlis', 'agri'
      ]);
      const winterTerms = ['kayak', 'palandoken', 'uludag', 'erciyes', 'kar', 'kis', 'termal', 'kaplica', 'kartalkaya', 'sarikamis', 'ilgaz', 'cildir', 'abant'];

      let pool = applyVisitedFilter(provinces, visitedFilter);
      if (regionMatch) pool = pool.filter((p) => p.region_code === regionMatch.code);

      const scored = pool
        .map((p) => {
          let score = winterBoostNames.has(p.normName) ? 10 : 0;
          const hits = [];
          winterTerms.forEach((t) => {
            if (p.normLandmarks.includes(t)) {
              score += 5;
              hits.push(t);
            } else if (p.normAll.includes(t)) {
              score += 2;
            }
          });
          return { p, score, hits };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      const cards = scored.map((x) =>
        makeCard(x.p, {
          badge: `❄️ ${x.p.region}`,
          reason: `${x.p.landmarks.slice(0, 2).join(' • ')}`
        })
      );

      return {
        text:
          `❄️ **Kışın Gidilecek En Güzel Anadolu İlleri:**\n` +
          `Karlı zirveler, kayak merkezleri, donmuş göller, sıcak termal sular ve kışın bambaşka bir masala bürünen tarihi dokularıyla öne çıkan **${cards.length} şehir**:`,
        cards
      };
    }

    if (/(sonbahar|ilkbahar|bahar|guz|yazin|yaz tatili)/.test(q)) {
      const isSummer = /(yazin|yaz tatili)/.test(q);
      const targetNames = isSummer
        ? new Set(['mugla', 'antalya', 'izmir', 'aydin', 'canakkale', 'rize', 'artvin', 'trabzon', 'sinop', 'balikesir', 'mersin'])
        : new Set(['bolu', 'nevsehir', 'artvin', 'karabuk', 'mardin', 'sanliurfa', 'amasya', 'kastamonu', 'eskişehir', 'eskisehir', 'bursa']);

      let pool = applyVisitedFilter(provinces, visitedFilter);
      const picked = pool
        .filter((p) => targetNames.has(p.normName))
        .slice(0, 6);

      const label = isSummer ? '☀️ Yazın Serin Yaylalar & Turkuaz Kıyılar' : '🍂 Bahar Aylarında Büyüleyen Anadolu Şehirleri';
      return {
        text: `${label} için veri tabanımızdan öne çıkan **${picked.length} rota önerisi**:`,
        cards: picked.map((p) =>
          makeCard(p, {
            badge: p.region,
            reason: `${p.landmarks.slice(0, 2).join(' • ')}`
          })
        )
      };
    }

    // -------------------------------------------------------------------------
    // 7. Gastronomy: Kebap & Tatlı / Food Queries
    // -------------------------------------------------------------------------
    if (/(kebap|tatli|yemek|lezzet|mutfak|gastronomi|baklava|kunefe|borek|manti|kofte|pide|helva|hosmerim|lokum|corba|doner|cig kofte|katmer)/.test(q)) {
      const wantsKebap = /kebap/.test(q);
      const wantsTatli = /(tatli|baklava|kunefe|helva|hosmerim|katmer|lokum|kadayıf|kadayif)/.test(q);
      const foodTokens = q
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !/(yemek|lezzet|mutfak|gastronomi)/.test(w));

      const dessertRegex = /(baklava|kunefe|tatli|helva|hosmerim|katmer|lokum|kadayif|sutlac|kaymak|pestil|kome|cevizli sucuk|pişmaniye|pismaniye|cezerye|incir|uzum|seker|macun|dondurma|kalburabasti|revani|peynir helvasi|künefe)/;
      const kebapRegex = /(kebap|kebab|cag|iskender|tantuni|tava|kavurma|tandir|pirzola|kofte|ciğer|ciger|etli|lahmacun|beyran|ali nazik|tepsi)/;

      let pool = applyVisitedFilter(provinces, visitedFilter);
      if (regionMatch) pool = pool.filter((p) => p.region_code === regionMatch.code);

      const scored = pool
        .map((p) => {
          let score = 0;
          const hasKebap = kebapRegex.test(p.normSpecialties);
          const hasTatli = dessertRegex.test(p.normSpecialties);

          if (wantsKebap && wantsTatli) {
            if (hasKebap && hasTatli) score += 14;
            else if (hasKebap || hasTatli) score += 6;
          } else if (wantsKebap && hasKebap) {
            score += 10;
          } else if (wantsTatli && hasTatli) {
            score += 10;
          }

          foodTokens.forEach((tok) => {
            if (p.normSpecialties.includes(tok)) score += 7;
            else if (p.normPlan.includes(tok)) score += 2;
          });

          // Gastronomy capitals tie-breaker
          if (['gaziantep', 'sanliurfa', 'hatay', 'adana', 'kahramanmaras', 'bursa', 'konya', 'kayseri', 'erzurum'].includes(p.normName)) {
            score += 2;
          }

          return { p, score };
        })
        .filter((x) => x.score > 2)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      const cards = scored.map((x) =>
        makeCard(x.p, {
          badge: `🍽️ ${x.p.region}`,
          reason: x.p.specialties.join(' • ')
        })
      );

      const title =
        wantsKebap && wantsTatli
          ? '🍽️ **En Meşhur Kebap & Tatlı Başkentleri:**'
          : wantsTatli
          ? '🍯 **Anadolu’nun Meşhur Tatlı Durakları:**'
          : wantsKebap
          ? '🔥 **Anadolu’nun Efsane Kebap Şehirleri:**'
          : '🍽️ **Gastronomi & Yöresel Lezzet Önerileri:**';

      return {
        text: `${title}\n81 ilin yöresel mutfak kayıtlarından senin için seçtiğim **${cards.length} lezzet durağı**:`,
        cards
      };
    }

    // -------------------------------------------------------------------------
    // 8. Library Offices ("kütüphane", "ofis", "çalışma", "odak")
    // -------------------------------------------------------------------------
    if (/(kutuphane|ofis|calisma alani|odaklan|dijital gocebe|laptop|ders calis)/.test(q)) {
      const libBoostTerms = [
        'modern', 'genis', 'tarihi', 'manzara', 'ferah', 'sakin', 'dijital',
        'zengin', 'merkezi', 'millet', 'konak', 'bahce', 'mimari', 'huzurlu', 'koleksiyon', 'kultur'
      ];
      let pool = applyVisitedFilter(provinces, visitedFilter);
      if (regionMatch) pool = pool.filter((p) => p.region_code === regionMatch.code);

      const scored = pool
        .map((p) => {
          let score = p.library ? 3 : 0;
          libBoostTerms.forEach((t) => {
            if (p.normLibrary.includes(t)) score += 2;
          });
          // Richer library notes & iconic library cities
          if (p.library.length > 95) score += 2;
          if (['ankara', 'istanbul', 'izmir', 'konya', 'eskisehir', 'bursa', 'kayseri', 'trabzon', 'kastamonu', 'erzurum'].includes(p.normName)) {
            score += 3;
          }
          return { p, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      const cards = scored.map((x) =>
        makeCard(x.p, {
          badge: '📚 Kütüphane Ofisi',
          reason: truncate(x.p.library, 105)
        })
      );

      return {
        text:
          `📚 **Dijital Seyyahlar İçin En İyi Kütüphane Ofisleri:**\n` +
          `Sabah **09:00–13:00** arası derin odaklanma ve üretim için atmosferiyle öne çıkan **${cards.length} İl Halk Kütüphanesi**:`,
        cards
      };
    }

    // -------------------------------------------------------------------------
    // 9. Sea & Waterfall / Nature Route ("deniz", "şelale", "kanyon", "yayla", "göl")
    // -------------------------------------------------------------------------
    if (/(deniz|selale|kanyon|yayla|plaj|sahil|koy|gol|magara|vadi|milli park|doga)/.test(q)) {
      const wantsSea = /(deniz|plaj|sahil|koy)/.test(q);
      const wantsWaterfall = /selale/.test(q);
      const wantsCanyon = /kanyon/.test(q);
      const wantsYayla = /yayla/.test(q);
      const wantsLake = /\bgol/.test(q);
      const wantsCave = /magara/.test(q);

      const coastalNames = new Set([
        'antalya', 'mugla', 'izmir', 'aydin', 'mersin', 'hatay', 'adana', 'balikesir',
        'canakkale', 'bursa', 'istanbul', 'kocaeli', 'sakarya', 'duzce', 'zonguldak',
        'bartin', 'kastamonu', 'sinop', 'samsun', 'ordu', 'giresun', 'trabzon', 'rize',
        'artvin', 'tekirdag', 'edirne', 'kirklareli', 'yalova'
      ]);

      let pool = applyVisitedFilter(provinces, visitedFilter);
      if (regionMatch) pool = pool.filter((p) => p.region_code === regionMatch.code);

      const scored = pool
        .map((p) => {
          let score = 0;
          const isCoastal = coastalNames.has(p.normName) || /(deniz|plaj|sahil|koy|korfez)/.test(p.normAll);
          const hasWaterfall = /selale/.test(p.normAll);
          const hasCanyon = /kanyon/.test(p.normAll);
          const hasYayla = /yayla/.test(p.normAll);
          const hasLake = /\bgol/.test(p.normAll);
          const hasCave = /magara/.test(p.normAll);

          if (wantsSea && wantsWaterfall) {
            if (isCoastal && hasWaterfall) score += 16;
            else if (hasWaterfall) score += 7;
            else if (isCoastal) score += 4;
          } else {
            if (wantsSea && isCoastal) score += 9;
            if (wantsWaterfall && hasWaterfall) score += 12;
            if (wantsCanyon && hasCanyon) score += 14;
            if (wantsYayla && hasYayla) score += 12;
            if (wantsLake && hasLake) score += 10;
            if (wantsCave && hasCave) score += 12;
          }

          // Extra boost if keyword is directly in landmarks
          if (wantsWaterfall && /selale/.test(p.normLandmarks)) score += 6;
          if (wantsCanyon && /kanyon/.test(p.normLandmarks)) score += 8;
          if (wantsYayla && /yayla/.test(p.normLandmarks)) score += 6;
          if (wantsCave && /magara/.test(p.normLandmarks)) score += 6;

          // Extract best matching landmark/plan line
          let matchReason = p.landmarks.slice(0, 2).join(' • ');
          const natureKeyword = wantsCanyon
            ? 'kanyon'
            : wantsWaterfall
            ? 'selale'
            : wantsYayla
            ? 'yayla'
            : wantsCave
            ? 'magara'
            : wantsLake
            ? 'gol'
            : 'deniz';
          const lmHit = p.landmarks.find((l) => norm(l).includes(natureKeyword));
          if (lmHit) {
            matchReason = `✨ ${lmHit}` + (p.landmarks.length > 1 ? ` • ${p.landmarks.find((l) => l !== lmHit)}` : '');
          }

          return { p, score, matchReason };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      const cards = scored.map((x) =>
        makeCard(x.p, {
          badge: `🌊 ${x.p.region}`,
          reason: truncate(x.matchReason, 95)
        })
      );

      let heading = '🌿 **Doğa & Su Rotaları:**';
      if (wantsSea && wantsWaterfall) heading = '🌊 **Deniz ve Şelale Buluşması — En İyi Rotalar:**';
      else if (wantsCanyon) heading = '🏞️ **Kanyonlarıyla Nefes Kesen Anadolu Şehirleri:**';
      else if (wantsWaterfall) heading = '💧 **Şelaleleriyle Ünlü Şehirler:**';
      else if (wantsYayla) heading = '🏔️ **Yaylalarıyla Huzur Veren İller:**';
      else if (wantsCave) heading = '🕳️ **Mağaralarıyla Ünlü İller:**';

      return {
        text: `${heading}\nGerçek gezi noktası verilerine göre öne çıkan **${cards.length} şehir**:`,
        cards
      };
    }

    // -------------------------------------------------------------------------
    // 10. Sufism & Spirituality ("tasavvuf", "maneviyat", "Mevlana", "evliya")
    // -------------------------------------------------------------------------
    if (/(tasavvuf|manevi|maneviyat|evliya|turbe|dergah|irfan|tekke|mevlana|yunus emre|haci bektas|edebali|somuncu baba|sems|bayram|saban|peygamber|sahabe|veysel karani|emir sultan|ahmet yesevi|ahi evran)/.test(q)) {
      const specificTokens = q
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !/(tasavvuf|manevi|maneviyat|evliya|turbe|dergah|irfan)/.test(w));

      const sufiCapitals = new Set([
        'konya', 'nevsehir', 'bursa', 'bilecik', 'sanliurfa', 'eskisehir', 'ankara',
        'kastamonu', 'erzurum', 'siirt', 'kirsehir', 'karaman', 'malatya', 'aksaray', 'tokat', 'diyarbakir'
      ]);

      let pool = applyVisitedFilter(provinces, visitedFilter);
      if (regionMatch) pool = pool.filter((p) => p.region_code === regionMatch.code);

      const scored = pool
        .map((p) => {
          let score = 0;
          let matchedFigure = '';

          if (specificTokens.length > 0) {
            specificTokens.forEach((tok) => {
              if (p.normSpiritual.includes(tok)) score += 14;
              if (p.normLandmarks.includes(tok)) score += 10;
              if (p.normHistory.includes(tok) || p.normQuote.includes(tok)) score += 5;
            });
            const fig = p.spiritual_figures.find((f) => specificTokens.some((tok) => norm(f).includes(tok)));
            if (fig) matchedFigure = truncate(fig, 100);
          } else {
            if (sufiCapitals.has(p.normName)) score += 10;
            score += Math.min(p.spiritual_figures.length * 2, 8);
            if (/(tasavvuf|irfan|veli|evliya|dergah|mevlana|yunus|bektas|edebali)/.test(p.normSpiritual)) {
              score += 5;
            }
          }

          if (!matchedFigure && p.spiritual_figures.length > 0) {
            matchedFigure = truncate(p.spiritual_figures[0], 100);
          }

          return { p, score, matchedFigure };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      const cards = scored.map((x) =>
        makeCard(x.p, {
          badge: `🕌 ${x.p.region}`,
          reason: x.matchedFigure || x.p.landmarks.slice(0, 2).join(' • ')
        })
      );

      return {
        text:
          `🕌 **Anadolu’nun Tasavvuf, İrfan ve Maneviyat Durakları:**\n` +
          `Gönül sultanlarının, türbelerin ve kadim dergâhların izini sürebileceğin **${cards.length} şehir**:`,
        cards
      };
    }

    // -------------------------------------------------------------------------
    // 11. Region / Subregion Explorer ("Güneydoğu Anadolu", "Karadeniz gezilmemiş")
    // -------------------------------------------------------------------------
    if (regionMatch || subregionMatch) {
      let pool = regionMatch
        ? provinces.filter((p) => p.region_code === regionMatch.code)
        : subregionMatch.provinces.slice();

      const totalInReg = pool.length;
      const visitedInReg = pool.filter((p) => p.visited).length;
      const filtered = applyVisitedFilter(pool, visitedFilter);
      const displayList = filtered.slice(0, 9);

      const regMeta = regionMatch && ctx.data && ctx.data.regions && ctx.data.regions[regionMatch.code];
      const regName = regMeta ? `${regMeta.icon || '🗺️'} **${regMeta.name}**` : `🗺️ **${regionMatch ? regionMatch.label : subregionMatch.name.toUpperCase()}**`;
      const regDesc = regMeta && regMeta.desc ? `\n_${regMeta.desc}_` : '';
      const filterSuffix =
        visitedFilter === 'unvisited'
          ? ` (gezilmemiş **${filtered.length}** il gösteriliyor)`
          : visitedFilter === 'visited'
          ? ` (gezilmiş **${filtered.length}** il gösteriliyor)`
          : '';

      if (displayList.length === 0) {
        return {
          text: `${regName} için bu filtreye uyan il kalmamış! (${visitedInReg}/${totalInReg} gezildi). Tüm illeri görmek için filtresiz sorabilirsin.`,
          cards: []
        };
      }

      return {
        text:
          `${regName} — **${visitedInReg}/${totalInReg} il gezildi**${filterSuffix}.${regDesc}\n` +
          `Keşfetmek istediğin şehre tıklayarak 5 günlük planını ve kütüphane notlarını açabilirsin:`,
        cards: displayList.map((p) =>
          makeCard(p, {
            badge: p.visited ? '✅ Gezildi' : '🧭 Keşif Bekliyor',
            reason: `${p.landmarks.slice(0, 2).join(' • ')}`
          })
        )
      };
    }

    // -------------------------------------------------------------------------
    // 12. Direct Single-City Query (e.g. "Mardin", "Kastamonu nasıl")
    // -------------------------------------------------------------------------
    const mentionedCity = findMentionedProvince(q, provinces);
    if (mentionedCity && q.split(/\s+/).length <= 4) {
      const nearestUnvisited = provinces
        .filter((p) => p.key !== mentionedCity.key && !p.visited)
        .map((p) => ({ p, km: roadKm(mentionedCity, p, calcDistKm) }))
        .sort((a, b) => a.km - b.km)
        .slice(0, 3);

      const cards = [
        makeCard(mentionedCity, {
          badge: `Plaka ${padPlate(mentionedCity.plate)} • ${mentionedCity.region}`,
          reason: truncate(mentionedCity.quote || mentionedCity.landmarks.join(' • '), 100)
        })
      ].concat(
        nearestUnvisited.map((n) =>
          makeCard(n.p, {
            badge: `~${n.km} km • Gezilmemiş`,
            reason: `${n.p.landmarks.slice(0, 2).join(' • ')}`
          })
        )
      );

      return {
        text:
          `📍 **${mentionedCity.name}** (${mentionedCity.region} • ${mentionedCity.visited ? '✅ Gezildi' : '🧭 Keşif Bekliyor'})\n` +
          `• **Gezilecek Yerler:** ${mentionedCity.landmarks.join(', ')}\n` +
          `• **Yöresel Lezzetler:** ${mentionedCity.specialties.join(', ')}\n` +
          `• **Kütüphane:** ${truncate(mentionedCity.library, 115)}\n` +
          `Aşağıda **${mentionedCity.name}** ve ona en yakın gezilmemiş 3 komşu durağı bulabilirsin:`,
        cards
      };
    }

    // -------------------------------------------------------------------------
    // 13. Universal Weighted Turkish Full-Text Search across all 81 provinces
    // -------------------------------------------------------------------------
    const tokens = q
      .split(/[\s,.;:!?'"()/-]+/)
      .filter((t) => t.length >= 2 && !STOPWORDS.has(t));

    if (tokens.length === 0) {
      // Only filter words like "gezilmemiş iller"
      const pool = applyVisitedFilter(provinces, visitedFilter);
      const sample = pool.slice(0, 6);
      return {
        text: `Kriterine göre **${pool.length} il** bulundu. İşte öne çıkan **${sample.length}** öneri:`,
        cards: sample.map((p) =>
          makeCard(p, {
            badge: p.region,
            reason: `${p.landmarks.slice(0, 2).join(' • ')}`
          })
        )
      };
    }

    const searchPool = applyVisitedFilter(provinces, visitedFilter);
    const matches = searchPool
      .map((p) => {
        let score = 0;
        let reason = '';

        tokens.forEach((tok) => {
          if (p.normName.includes(tok)) {
            score += 12;
          }
          if (p.normLandmarks.includes(tok)) {
            score += 9;
            if (!reason) {
              const hit = p.landmarks.find((l) => norm(l).includes(tok));
              if (hit) reason = `🏛️ ${hit}`;
            }
          }
          if (p.normSpecialties.includes(tok)) {
            score += 9;
            if (!reason) {
              const hit = p.specialties.find((s) => norm(s).includes(tok));
              if (hit) reason = `🍽️ ${hit}`;
            }
          }
          if (p.normSpiritual.includes(tok)) {
            score += 8;
            if (!reason) {
              const hit = p.spiritual_figures.find((s) => norm(s).includes(tok));
              if (hit) reason = `🕌 ${truncate(hit, 90)}`;
            }
          }
          if (p.normLibrary.includes(tok)) {
            score += 6;
            if (!reason) reason = `📚 ${truncate(p.library, 90)}`;
          }
          if (p.normQuote.includes(tok)) score += 4;
          if (p.normPlan.includes(tok)) {
            score += 4;
            if (!reason) {
              const hit = p.five_day_plan.find((d) => norm(d).includes(tok));
              if (hit) reason = `🗓️ ${truncate(hit, 90)}`;
            }
          }
          if (p.normHistory.includes(tok)) score += 3;
        });

        return { p, score, reason };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    if (matches.length > 0) {
      return {
        text: `🔍 **"${cleanRaw}"** araman için 81 il arşivinde **${matches.length}** güçlü eşleşme buldum:`,
        cards: matches.map((m) =>
          makeCard(m.p, {
            badge: m.p.region,
            reason: m.reason || `${m.p.landmarks.slice(0, 2).join(' • ')}`
          })
        )
      };
    }

    // Graceful no-match response with inspiring fallback cards
    const fallbackPicks = (unvisitedProvinces.length >= 3 ? unvisitedProvinces : provinces)
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return {
      text:
        `🤔 **"${cleanRaw}"** için doğrudan bir eşleşme bulamadım.\n` +
        `Şunları deneyebilirsin: bir **il adı** (*"Mardin"*), **plaka** (*"34 plaka"*), **yakınlık** (*"Konya yakınında gezilmemiş iller"*), **lezzet** (*"tatlı"*) veya **doğa** (*"kanyon"*).\n` +
        `Bu arada senin için 3 ilham verici durak seçtim:`,
      cards: fallbackPicks.map((p) =>
        makeCard(p, {
          badge: `✨ Öneri • ${p.region}`,
          reason: `${p.landmarks.slice(0, 2).join(' • ')}`
        })
      )
    };
  }

  // ---------------------------------------------------------------------------
  // Scoped Styles Injection (Dark + Light Theme + Responsive)
  // ---------------------------------------------------------------------------
  function ensureStyles() {
    if (document.getElementById('seyyah-advisor-styles')) return;
    const style = document.createElement('style');
    style.id = 'seyyah-advisor-styles';
    style.textContent = `
      .sa-shell {
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-width: 1120px;
        margin: 0 auto;
        animation: saFadeIn 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      }
      @keyframes saFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .sa-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 18px 22px;
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-lg, 20px);
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.45));
      }
      .sa-header-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .sa-avatar-hero {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(168, 85, 247, 0.28));
        border: 1px solid rgba(0, 242, 254, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;
        box-shadow: 0 0 18px rgba(0, 242, 254, 0.22);
      }
      .sa-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.2;
      }
      .sa-subtitle {
        font-size: 0.84rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 3px;
      }
      .sa-header-actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
      }
      .sa-stat-pill {
        font-size: 0.8rem;
        font-weight: 600;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.35);
        color: var(--accent-emerald, #10b981);
      }
      .sa-clear-btn {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.82rem;
        font-weight: 600;
        padding: 8px 14px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(239, 68, 68, 0.12);
        color: #fca5a5;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .sa-clear-btn:hover {
        background: rgba(239, 68, 68, 0.24);
        border-color: rgba(239, 68, 68, 0.5);
        transform: translateY(-1px);
      }
      .sa-action-btn {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.8rem;
        font-weight: 600;
        padding: 8px 13px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid rgba(0, 242, 254, 0.32);
        background: rgba(0, 242, 254, 0.1);
        color: #67e8f9;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .sa-action-btn:hover {
        background: rgba(0, 242, 254, 0.22);
        border-color: rgba(0, 242, 254, 0.6);
        transform: translateY(-1px);
      }
      .sa-action-btn.gold {
        border-color: rgba(245, 158, 11, 0.38);
        background: rgba(245, 158, 11, 0.12);
        color: #fbbf24;
      }
      .sa-action-btn.gold:hover {
        background: rgba(245, 158, 11, 0.24);
        border-color: rgba(245, 158, 11, 0.65);
      }
      .sa-action-btn.is-speaking {
        border-color: rgba(16, 185, 129, 0.6);
        background: rgba(16, 185, 129, 0.22);
        color: #6ee7b7;
        box-shadow: 0 0 16px rgba(16, 185, 129, 0.28);
      }
      .sa-persona-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: var(--bg-card, rgba(30, 41, 59, 0.58));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-md, 14px);
      }
      .sa-persona-label {
        font-size: 0.76rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary, #94a3b8);
        margin-right: 4px;
      }
      .sa-persona-pill {
        font-family: var(--font-body, sans-serif);
        font-size: 0.8rem;
        font-weight: 600;
        padding: 7px 13px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.13);
        background: rgba(15, 23, 42, 0.68);
        color: var(--text-secondary, #cbd5e1);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .sa-persona-pill:hover {
        border-color: rgba(0, 242, 254, 0.48);
        color: var(--text-primary, #f8fafc);
        transform: translateY(-1px);
      }
      .sa-persona-pill.active {
        border-color: rgba(0, 242, 254, 0.72);
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(168, 85, 247, 0.22));
        color: #f8fafc;
        box-shadow: 0 0 16px rgba(0, 242, 254, 0.18);
      }
      .sa-chips-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .sa-chip {
        font-family: var(--font-body, sans-serif);
        font-size: 0.82rem;
        font-weight: 500;
        padding: 8px 13px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: var(--bg-glass, rgba(15, 23, 42, 0.82));
        color: var(--text-primary, #f8fafc);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .sa-chip:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(0, 242, 254, 0.18);
      }
      .sa-chat-panel {
        display: flex;
        flex-direction: column;
        background: var(--bg-card, rgba(30, 41, 59, 0.65));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-lg, 20px);
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.45));
        overflow: hidden;
      }
      .sa-messages {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px;
        min-height: 360px;
        max-height: 58vh;
        overflow-y: auto;
        scroll-behavior: smooth;
      }
      .sa-msg {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        animation: saFadeIn 0.22s ease;
      }
      .sa-msg-user {
        flex-direction: row-reverse;
      }
      .sa-msg-avatar {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
        background: rgba(0, 242, 254, 0.16);
        border: 1px solid rgba(0, 242, 254, 0.3);
      }
      .sa-msg-user .sa-msg-avatar {
        background: rgba(16, 185, 129, 0.18);
        border-color: rgba(16, 185, 129, 0.35);
      }
      .sa-msg-body {
        max-width: 86%;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .sa-msg-user .sa-msg-body {
        align-items: flex-end;
      }
      .sa-bubble {
        padding: 13px 16px;
        border-radius: 16px;
        font-size: 0.92rem;
        line-height: 1.58;
        color: var(--text-primary, #f8fafc);
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }
      .sa-msg-user .sa-bubble {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.22), rgba(16, 185, 129, 0.22));
        border-color: rgba(0, 242, 254, 0.38);
      }
      .sa-msg-time {
        font-size: 0.72rem;
        color: var(--text-muted, #64748b);
        padding: 0 4px;
      }
      .sa-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(235px, 1fr));
        gap: 10px;
        width: 100%;
      }
      .sa-city-card {
        display: flex;
        flex-direction: column;
        text-align: left;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        border-radius: 14px;
        overflow: hidden;
        cursor: pointer;
        color: inherit;
        font-family: inherit;
        transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 0;
      }
      .sa-city-card:hover {
        border-color: var(--accent-cyan, #00f2fe);
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(0, 242, 254, 0.2);
      }
      .sa-card-media {
        position: relative;
        height: 92px;
        width: 100%;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.18), rgba(168, 85, 247, 0.2));
        overflow: hidden;
      }
      .sa-card-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .sa-card-plate {
        position: absolute;
        top: 8px;
        left: 8px;
        font-family: var(--font-heading, sans-serif);
        font-size: 0.72rem;
        font-weight: 800;
        padding: 3px 7px;
        border-radius: 7px;
        background: rgba(10, 15, 29, 0.82);
        color: var(--accent-cyan, #00f2fe);
        border: 1px solid rgba(0, 242, 254, 0.35);
      }
      .sa-card-status {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 0.68rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(10, 15, 29, 0.82);
        color: #fbbf24;
        border: 1px solid rgba(251, 191, 36, 0.4);
      }
      .sa-card-status.visited {
        color: #34d399;
        border-color: rgba(52, 211, 153, 0.45);
      }
      .sa-card-info {
        padding: 10px 12px 12px;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .sa-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }
      .sa-card-name {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.96rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }
      .sa-card-badge {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 6px;
        background: rgba(0, 242, 254, 0.12);
        color: var(--accent-cyan, #00f2fe);
        white-space: nowrap;
      }
      .sa-card-reason {
        font-size: 0.78rem;
        line-height: 1.42;
        color: var(--text-secondary, #94a3b8);
      }
      .sa-composer {
        display: flex;
        gap: 10px;
        padding: 14px 16px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(10, 15, 29, 0.55);
      }
      .sa-input {
        flex: 1;
        font-family: var(--font-body, sans-serif);
        font-size: 0.92rem;
        padding: 11px 15px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.85);
        color: var(--text-primary, #f8fafc);
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .sa-input:focus {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.16);
      }
      .sa-send-btn {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.88rem;
        font-weight: 700;
        padding: 11px 20px;
        border-radius: var(--radius-md, 12px);
        border: none;
        background: linear-gradient(135deg, var(--accent-cyan, #00f2fe), var(--accent-emerald, #10b981));
        color: #06131f;
        cursor: pointer;
        white-space: nowrap;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }
      .sa-send-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(0, 242, 254, 0.32);
      }

      /* Light theme adaptations */
      body.light-theme .sa-bubble,
      body.light-theme .sa-city-card,
      body.light-theme .sa-input,
      body.light-theme .sa-chip {
        background: rgba(255, 255, 255, 0.88);
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.12);
      }
      body.light-theme .sa-msg-user .sa-bubble {
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.16), rgba(16, 185, 129, 0.16));
        border-color: rgba(14, 165, 233, 0.35);
      }
      body.light-theme .sa-composer {
        background: rgba(241, 245, 249, 0.85);
      }
      body.light-theme .sa-clear-btn {
        color: #b91c1c;
        background: rgba(239, 68, 68, 0.1);
      }
      body.light-theme .sa-card-badge {
        background: rgba(14, 165, 233, 0.12);
        color: #0369a1;
      }
      body.light-theme .sa-persona-bar {
        background: rgba(255, 255, 255, 0.86);
        border-color: rgba(15, 23, 42, 0.12);
      }
      body.light-theme .sa-persona-pill {
        background: rgba(241, 245, 249, 0.92);
        border-color: rgba(15, 23, 42, 0.14);
        color: #334155;
      }
      body.light-theme .sa-persona-pill.active {
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.16), rgba(124, 58, 237, 0.14));
        border-color: #0284c7;
        color: #0f172a;
      }
      body.light-theme .sa-action-btn {
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.32);
        color: #0369a1;
      }
      body.light-theme .sa-action-btn.gold {
        background: rgba(217, 119, 6, 0.12);
        border-color: rgba(217, 119, 6, 0.35);
        color: #b45309;
      }
      body.light-theme .sa-action-btn.is-speaking {
        background: rgba(16, 185, 129, 0.16);
        border-color: rgba(5, 150, 105, 0.45);
        color: #047857;
      }

      @media (max-width: 640px) {
        .sa-messages {
          padding: 14px;
          max-height: 54vh;
        }
        .sa-msg-body {
          max-width: 94%;
        }
        .sa-cards-grid {
          grid-template-columns: 1fr;
        }
        .sa-composer {
          flex-direction: column;
        }
        .sa-send-btn {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Welcome Message Factory
  // ---------------------------------------------------------------------------
  function createWelcomeMessage(provinces) {
    const visitedCount = provinces.filter((p) => p.visited).length;
    const unvisitedCount = provinces.length - visitedCount;
    return {
      id: ++messageSeq,
      role: 'assistant',
      time: nowTimeLabel(),
      text:
        `Hoş geldin seyyah! ✨ **${provinces.length} ilin** tüm tarihi, kütüphaneleri, yöresel lezzetleri ve koordinatları hafızamda.\n` +
        `Şu an **${visitedCount} il** gezilmiş, **${unvisitedCount} il** keşif bekliyor. Yukarıdaki hazır sorulardan birini seçebilir ya da aşağıya istediğin soruyu yazabilirsin!`,
      cards: []
    };
  }

  // ---------------------------------------------------------------------------
  // Module Renderer
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const escapeHtml = safeCtx.escapeHtml || fallbackEscape;
    const provinces = buildProvinceIndex(safeCtx);
    const visitedCount = provinces.filter((p) => p.visited).length;
    const unvisitedCount = provinces.length - visitedCount;

    if (chatHistory.length === 0) {
      chatHistory.push(createWelcomeMessage(provinces));
    }

    container.innerHTML = `
      <section class="sa-shell" aria-label="Akıllı Seyyah Rehberi">
        <div class="sa-header">
          <div class="sa-header-left">
            <div class="sa-avatar-hero" aria-hidden="true">✨</div>
            <div>
              <h2 class="sa-title">Akıllı Seyyah Rehberi</h2>
              <p class="sa-subtitle">İnteraktif Türkçe Soru-Cevap, Rota & Keşif Asistanı • 81 İl Canlı Veri</p>
            </div>
          </div>
          <div class="sa-header-actions">
            <span class="sa-stat-pill" data-sa-engine-badge>${getStoredGeminiKey() ? '🟢 Gemini AI Aktif' : '✨ Seyyah Akıllı Motor'}</span>
            <button type="button" class="sa-action-btn ${isTtsSpeaking ? 'is-speaking' : ''}" data-sa-tts>${isTtsSpeaking ? '⏹️ Sesli Okumayı Durdur' : '🔊 Son Yanıtı Sesli Dinle (TTS)'}</button>
            <button type="button" class="sa-action-btn gold" data-sa-export-md>📥 Sohbeti Markdown İndir</button>
            <button type="button" class="sa-clear-btn" data-sa-clear>🗑️ Temizle</button>
          </div>
        </div>

        <div class="sa-persona-bar" role="radiogroup" aria-label="Persona ve Üslup Seçici">
          <span class="sa-persona-label">🎭 Üslup / Persona:</span>
          ${ADVISOR_PERSONAS.map(
            (p) =>
              `<button type="button" class="sa-persona-pill ${p.id === activePersonaId ? 'active' : ''}" data-sa-persona="${escapeHtml(p.id)}" aria-pressed="${p.id === activePersonaId ? 'true' : 'false'}">${escapeHtml(p.label)}</button>`
          ).join('')}
        </div>

        <div class="sa-chips-wrap" role="group" aria-label="Hızlı sorular">
          ${QUICK_PROMPTS.map(
            (prompt) =>
              `<button type="button" class="sa-chip" data-sa-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`
          ).join('')}
        </div>

        <div class="sa-chat-panel">
          <div class="sa-messages" data-sa-messages aria-live="polite"></div>
          <form class="sa-composer" data-sa-form>
            <input
              type="text"
              class="sa-input"
              data-sa-input
              placeholder='Bir şehir, lezzet, kanyon, plaka veya rota sor... (ör. "Konya yakınında gezilmemiş iller")'
              autocomplete="off"
            />
            <button type="submit" class="sa-send-btn">Gönder ↵</button>
          </form>
        </div>
      </section>
    `;

    const messagesEl = container.querySelector('[data-sa-messages]');
    const formEl = container.querySelector('[data-sa-form]');
    const inputEl = container.querySelector('[data-sa-input]');
    const clearBtn = container.querySelector('[data-sa-clear]');
    const geminiToggleBtn = container.querySelector('[data-sa-gemini-toggle]');
    const geminiDrawer = container.querySelector('[data-sa-gemini-drawer]');
    const engineBadge = container.querySelector('[data-sa-engine-badge]');
    const modelSelect = container.querySelector('[data-sa-model-select]');
    const keyInput = container.querySelector('[data-sa-key-input]');
    const keySaveBtn = container.querySelector('[data-sa-key-save]');
    const keyClearBtn = container.querySelector('[data-sa-key-clear]');
    const normalizeFn = safeCtx.normalizeTurkish || fallbackNormalize;

    if (geminiToggleBtn && geminiDrawer) {
      geminiToggleBtn.addEventListener('click', () => {
        const isHidden = geminiDrawer.style.display === 'none';
        geminiDrawer.style.display = isHidden ? 'block' : 'none';
      });
    }

    if (modelSelect) {
      modelSelect.addEventListener('change', (e) => {
        setStoredGeminiModel(e.target.value);
        if (typeof safeCtx.showToast === 'function') safeCtx.showToast(`🧠 Model seçildi: ${e.target.value}`);
      });
    }

    if (keySaveBtn && keyInput) {
      keySaveBtn.addEventListener('click', () => {
        setStoredGeminiKey(keyInput.value);
        if (engineBadge) engineBadge.textContent = getStoredGeminiKey() ? '🟢 Gemini AI (Kişisel)' : '✨ Gemini AI + Çevrimdışı';
        if (geminiDrawer) geminiDrawer.style.display = 'none';
        if (typeof safeCtx.showToast === 'function') safeCtx.showToast('🔑 Gemini API anahtarı tarayıcınıza kaydedildi!');
      });
    }

    if (keyClearBtn && keyInput) {
      keyClearBtn.addEventListener('click', () => {
        keyInput.value = '';
        setStoredGeminiKey('');
        if (engineBadge) engineBadge.textContent = '✨ Gemini AI + Çevrimdışı';
        if (typeof safeCtx.showToast === 'function') safeCtx.showToast('🗑️ Kişisel API anahtarı temizlendi');
      });
    }

    function renderMessages() {
      messagesEl.innerHTML = chatHistory
        .map((msg) => {
          const isUser = msg.role === 'user';
          const cardsHtml =
            Array.isArray(msg.cards) && msg.cards.length > 0
              ? `<div class="sa-cards-grid">${msg.cards
                  .map(
                    (c) => `
                  <button type="button" class="sa-city-card" data-sa-city="${escapeHtml(c.key)}" title="${escapeHtml(c.name)} detayını aç">
                    <div class="sa-card-media">
                      ${
                        c.thumb
                          ? `<img src="${escapeHtml(c.thumb)}" alt="${escapeHtml(c.name)}" loading="lazy" onerror="this.style.display='none'" />`
                          : ''
                      }
                      <span class="sa-card-plate">${escapeHtml(padPlate(c.plate))}</span>
                      <span class="sa-card-status ${c.visited ? 'visited' : ''}">${c.visited ? '✅ Gezildi' : '🧭 Keşif'}</span>
                    </div>
                    <div class="sa-card-info">
                      <div class="sa-card-head">
                        <span class="sa-card-name">${escapeHtml(c.name)}</span>
                        ${c.badge ? `<span class="sa-card-badge">${escapeHtml(c.badge)}</span>` : ''}
                      </div>
                      <div class="sa-card-reason">${escapeHtml(c.reason)}</div>
                    </div>
                  </button>`
                  )
                  .join('')}</div>`
              : '';

          return `
            <div class="sa-msg ${isUser ? 'sa-msg-user' : 'sa-msg-assistant'}">
              <div class="sa-msg-avatar" aria-hidden="true">${isUser ? '🎒' : '🧭'}</div>
              <div class="sa-msg-body">
                <div class="sa-bubble">${formatRichText(msg.text, escapeHtml)}</div>
                ${cardsHtml}
                ${msg.time ? `<span class="sa-msg-time">${escapeHtml(msg.time)}</span>` : ''}
              </div>
            </div>
          `;
        })
        .join('');

      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    async function handleAsk(queryText) {
      const trimmed = String(queryText || '').trim();
      if (!trimmed) return;

      const userMsgId = ++messageSeq;
      chatHistory.push({
        id: userMsgId,
        role: 'user',
        time: nowTimeLabel(),
        text: trimmed,
        cards: []
      });

      const loadingId = ++messageSeq;
      chatHistory.push({
        id: loadingId,
        role: 'assistant',
        loading: true,
        time: nowTimeLabel(),
        text: '✨ Gemini düşünüyor...',
        cards: []
      });
      renderMessages();

      let geminiErrMsg = '';
      try {
        const aiRes = await askGeminiEngine(trimmed, provinces, safeCtx, userMsgId);
        const idx = chatHistory.findIndex((m) => m.id === loadingId);
        if (aiRes && aiRes.reply) {
          const mentionedCards = extractMentionedProvinceCards(aiRes.reply, provinces, normalizeFn);
          const aiMsg = {
            id: loadingId,
            role: 'assistant',
            time: `${nowTimeLabel()} • 🟢 ${aiRes.source}`,
            text: aiRes.reply,
            cards: mentionedCards
          };
          if (idx >= 0) chatHistory[idx] = aiMsg;
          else chatHistory.push(aiMsg);
          if (engineBadge) engineBadge.textContent = `🟢 ${aiRes.source}`;
          renderMessages();
          return;
        }
      } catch (err) {
        geminiErrMsg = err.message || 'Bilinmeyen hata';
        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast(`⚠️ Gemini API hatası: ${geminiErrMsg}`);
        }
      }

      // Graceful fallback to local instant Turkish NLP engine
      const reply = resolveQuery(trimmed, provinces, safeCtx);
      const persona = getActivePersona();
      const fallbackMsg = {
        id: loadingId,
        role: 'assistant',
        time: `${nowTimeLabel()} • ⚠️ Çevrimdışı Motor (${persona.label})${geminiErrMsg ? ` (Gemini: ${geminiErrMsg})` : ''}`,
        text: applyPersonaToOfflineText(reply.text),
        cards: reply.cards || []
      };
      const idx = chatHistory.findIndex((m) => m.id === loadingId);
      if (idx >= 0) chatHistory[idx] = fallbackMsg;
      else chatHistory.push(fallbackMsg);

      renderMessages();
    }

    const ttsBtn = container.querySelector('[data-sa-tts]');
    const exportMdBtn = container.querySelector('[data-sa-export-md]');

    function updateTtsButtonUi() {
      if (!ttsBtn) return;
      ttsBtn.classList.toggle('is-speaking', isTtsSpeaking);
      ttsBtn.textContent = isTtsSpeaking ? '⏹️ Sesli Okumayı Durdur' : '🔊 Son Yanıtı Sesli Dinle (TTS)';
    }

    function stopTtsPlayback() {
      try {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch (_) {}
      isTtsSpeaking = false;
      updateTtsButtonUi();
    }

    function stripForSpeech(rawText) {
      return String(rawText || '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[#>*_~|]/g, ' ')
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (ttsBtn) {
      ttsBtn.addEventListener('click', () => {
        if (isTtsSpeaking) {
          stopTtsPlayback();
          if (typeof safeCtx.showToast === 'function') {
            safeCtx.showToast('⏹️ Sesli okuma durduruldu.', 'info');
          }
          return;
        }

        if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
          if (typeof safeCtx.showToast === 'function') {
            safeCtx.showToast('⚠️ Tarayıcınız sesli okuma (TTS) özelliğini desteklemiyor.', 'warning');
          }
          return;
        }

        const lastAssistant = chatHistory
          .slice()
          .reverse()
          .find((m) => m && m.role === 'assistant' && !m.loading && m.text);

        if (!lastAssistant) {
          if (typeof safeCtx.showToast === 'function') {
            safeCtx.showToast('⚠️ Okunacak bir asistan yanıtı bulunamadı.', 'warning');
          }
          return;
        }

        const speechText = stripForSpeech(lastAssistant.text);
        if (!speechText) return;

        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(speechText);
          utterance.lang = 'tr-TR';
          utterance.rate = 1.0;
          utterance.pitch = 1.0;

          const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
          const trVoice = voices.find((v) => v && /^tr(-|_|$)/i.test(v.lang || ''));
          if (trVoice) utterance.voice = trVoice;

          utterance.onstart = () => {
            isTtsSpeaking = true;
            updateTtsButtonUi();
          };
          utterance.onend = () => {
            isTtsSpeaking = false;
            updateTtsButtonUi();
          };
          utterance.onerror = () => {
            isTtsSpeaking = false;
            updateTtsButtonUi();
          };

          isTtsSpeaking = true;
          updateTtsButtonUi();
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          isTtsSpeaking = false;
          updateTtsButtonUi();
          if (typeof safeCtx.showToast === 'function') {
            safeCtx.showToast('⚠️ Sesli okuma başlatılamadı.', 'warning');
          }
        }
      });
    }

    if (exportMdBtn) {
      exportMdBtn.addEventListener('click', () => {
        const exportable = chatHistory.filter((m) => m && !m.loading && m.text);
        if (!exportable.length) {
          if (typeof safeCtx.showToast === 'function') {
            safeCtx.showToast('⚠️ İndirilecek sohbet kaydı bulunamadı.', 'warning');
          }
          return;
        }

        const persona = getActivePersona();
        const now = new Date();
        const dateSlug = now.toISOString().slice(0, 10);
        const mdLines = [
          '# Anadolu Seyahatnamesi — Akıllı Seyyah Rehberi Sohbet Kaydı',
          '',
          `- **Tarih:** ${now.toLocaleString('tr-TR')}`,
          `- **Aktif Üslup / Persona:** ${persona.label}`,
          `- **Seyyah İlerlemesi:** ${visitedCount}/${provinces.length} il gezildi (${unvisitedCount} il keşif bekliyor)`,
          '',
          '---',
          ''
        ];

        exportable.forEach((m) => {
          const speaker = m.role === 'user' ? '🎒 Seyyah' : '🧭 Akıllı Seyyah Rehberi';
          mdLines.push(`### ${speaker}${m.time ? ` (${m.time})` : ''}`);
          mdLines.push('');
          mdLines.push(String(m.text || '').trim());
          if (Array.isArray(m.cards) && m.cards.length > 0) {
            mdLines.push('');
            mdLines.push(
              `**Önerilen Şehirler:** ${m.cards
                .map((c) => `${c.name} (${padPlate(c.plate)})`)
                .join(', ')}`
            );
          }
          mdLines.push('');
          mdLines.push('---');
          mdLines.push('');
        });

        const filename = `anadolu-seyyah-sohbet-${dateSlug}.md`;
        const blob = new Blob([mdLines.join('\n')], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast(`📥 ${filename} indirildi!`, 'success');
        }
      });
    }

    // Bind persona selector pills
    container.querySelectorAll('[data-sa-persona]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextId = btn.getAttribute('data-sa-persona');
        if (!nextId) return;
        activePersonaId = nextId;
        container.querySelectorAll('[data-sa-persona]').forEach((b) => {
          const isActive = b.getAttribute('data-sa-persona') === activePersonaId;
          b.classList.toggle('active', isActive);
          b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        const activePersona = getActivePersona();
        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast(`🎭 Üslup değiştirildi: ${activePersona.label}`, 'info');
        }
      });
    });

    // Bind quick prompt chips
    container.querySelectorAll('[data-sa-prompt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-sa-prompt');
        handleAsk(prompt);
        if (inputEl) inputEl.focus();
      });
    });

    // Bind city card click via event delegation
    messagesEl.addEventListener('click', (e) => {
      const cardBtn = e.target.closest('[data-sa-city]');
      if (!cardBtn) return;
      const cityKey = cardBtn.getAttribute('data-sa-city');
      if (cityKey && typeof safeCtx.selectCity === 'function') {
        safeCtx.selectCity(cityKey);
      }
    });

    // Bind input submit
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = inputEl.value;
      if (!val.trim()) return;
      inputEl.value = '';
      handleAsk(val);
    });

    // Bind clear chat button
    clearBtn.addEventListener('click', () => {
      stopTtsPlayback();
      chatHistory = [createWelcomeMessage(provinces)];
      renderMessages();
      if (typeof safeCtx.showToast === 'function') {
        safeCtx.showToast('Sohbet geçmişi temizlendi.', 'info');
      }
    });

    renderMessages();
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.advisor = { render };
})();
