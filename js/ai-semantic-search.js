/**
 * Anadolu Seyahatnamesi — AI Doğal Dil Akıllı Arama & Semantik TF-IDF Keşif Motoru
 * Powered by window.SEYYAH_AI with multi-token TF-IDF + Turkish synonym expansion
 * across all province fields, highlighted match snippets, and relevance bars.
 * Registers on window.SEYYAH_MODULES.aiSearch = { render(container, ctx) }
 */
(function () {
  'use strict';

  const STYLE_ID = 'seyyah-ai-search-styles';

  const EXAMPLE_QUERIES = [
    'Denize kıyısı olan, kütüphanesi güzel, henüz gitmediğim 4 sakin il',
    'Manevi huzur, dergâh, türbe ve tasavvuf mirası güçlü şehirler',
    'Yazın serin yayla, şelale ve kanyon dolu Karadeniz durakları',
    'Kışın kar manzarası ve sıcak yöresel çorbalarıyla ünlü Doğu illeri',
    'Ankara\'ya 400 km içinde hafta sonu kaçamağı yapılacak gezilmemiş iller',
    'Güneydoğu\'da yemek, kebap, tatlı ve tarih dolu 4 durak'
  ];

  const COASTAL_PLATES = new Set([1, 7, 8, 9, 10, 16, 17, 22, 28, 31, 33, 34, 35, 37, 39, 41, 48, 52, 53, 54, 55, 57, 59, 61, 67, 74, 77, 81]);
  const ANKARA_COORDS = { lat: 39.9334, lng: 32.8597 };

  const TURKISH_STOPWORDS = new Set([
    've', 'veya', 'ile', 'bir', 'olan', 'icin', 'daha', 'cok', 'gibi', 'ama',
    'fakat', 'ancak', 'ise', 'bu', 'su', 'her', 'hem', 'tum', 'en', 'da', 'de',
    'ki', 'mi', 'mu', 'il', 'ili', 'iller', 'illeri', 'sehir', 'sehirler',
    'sehirleri', 'durak', 'duraklar', 'duraklari', 'menzil', 'yer', 'yerler',
    'olan', 'icinde', 'yapilacak', 'sunan', 'unlu', 'dolu', 'guzel', 'yogun'
  ]);

  // Bidirectional Turkish semantic synonym clusters (normalized ASCII-folded roots)
  const SYNONYM_CLUSTERS = [
    {
      label: '🌊 Deniz & Kıyı',
      terms: ['deniz', 'sahil', 'koy', 'liman', 'plaj', 'kiyi', 'korfez', 'ada', 'bogaz', 'mavi', 'falez', 'marina']
    },
    {
      label: '🕌 Maneviyat & İrfan',
      terms: ['manevi', 'maneviyat', 'cami', 'turbe', 'dergah', 'mevlana', 'evliya', 'tasavvuf', 'irfan', 'kulliye', 'tekke', 'eren', 'veli', 'huzur', 'ahi', 'yunus']
    },
    {
      label: '🌲 Serin Doğa & Yayla',
      terms: ['serin', 'yayla', 'selale', 'kanyon', 'dag', 'orman', 'vadi', 'gol', 'akarsu', 'doga', 'yesil', 'zirve', 'milli', 'magara']
    },
    {
      label: '🍽️ Gastronomi & Sofra',
      terms: ['yemek', 'kebap', 'tatli', 'corba', 'pide', 'borek', 'manti', 'kofte', 'baklava', 'kunefe', 'lezzet', 'mutfak', 'gurme', 'sofra', 'kahve', 'helva', 'tandir', 'kadayif']
    },
    {
      label: '🏛️ Tarih & Miras',
      terms: ['tarih', 'tarihi', 'antik', 'selcuklu', 'osmanli', 'unesco', 'kale', 'saray', 'muze', 'hoyuk', 'sur', 'kopru', 'han', 'hamam', 'konak', 'kilise', 'manastir', 'medrese', 'kadim']
    },
    {
      label: '📚 Kütüphane & Odak',
      terms: ['kutuphane', 'calisma', 'kitap', 'odak', 'sakin', 'sessiz', 'dijital', 'gocebe', 'okuma', 'millet', 'ofis']
    },
    {
      label: '❄️ Kış & Termal',
      terms: ['kis', 'kar', 'kayak', 'soguk', 'termal', 'kaplica', 'sifa', 'sicak']
    }
  ];

  const FIELD_DEFS = [
    { key: 'name', label: '📍 Şehir', weight: 4.0 },
    { key: 'region', label: '🗺️ Bölge', weight: 2.5 },
    { key: 'landmarks', label: '🏛️ Miraslar', weight: 2.4 },
    { key: 'specialties', label: '🍽️ Lezzetler', weight: 2.4 },
    { key: 'spiritual_figures', label: '🕌 Manevi İzler', weight: 2.3 },
    { key: 'library', label: '📚 Kütüphane', weight: 2.1 },
    { key: 'quote', label: '💬 Şehir Sözü', weight: 1.8 },
    { key: 'five_day_plan', label: '📅 5 Gün Planı', weight: 1.75 },
    { key: 'history', label: '📜 Tarihçe', weight: 1.65 },
    { key: 'reflection', label: '💭 Tefekkür', weight: 1.6 }
  ];

  let lastQuery = '';
  let lastResults = null;

  function fallbackEsc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fallbackNorm(s) {
    if (!s) return '';
    return String(s)
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .replace(/â/g, 'a')
      .replace(/î/g, 'i')
      .replace(/û/g, 'u')
      .trim();
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  function tokenize(normalizedText) {
    return String(normalizedText || '')
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 2 && !TURKISH_STOPWORDS.has(t));
  }

  function tokenMatches(docToken, queryToken) {
    if (!docToken || !queryToken) return false;
    if (docToken === queryToken) return true;
    // Agglutinative Turkish prefix stem matching (e.g. "kutuphanesi" <-> "kutuphane")
    if (queryToken.length >= 4 && docToken.startsWith(queryToken)) return true;
    if (docToken.length >= 4 && queryToken.startsWith(docToken)) return true;
    if (queryToken.length >= 5 && docToken.length >= 5 && docToken.slice(0, 5) === queryToken.slice(0, 5)) {
      return true;
    }
    return false;
  }

  function expandQueryTokens(baseTokens) {
    const expandedMap = new Map(); // term -> weight (1.0 for direct, 0.58 for synonym)
    const activeClusters = [];

    for (const tok of baseTokens) {
      expandedMap.set(tok, 1.0);
    }

    for (const cluster of SYNONYM_CLUSTERS) {
      const triggered = baseTokens.some((tok) =>
        cluster.terms.some((ct) => tokenMatches(ct, tok))
      );
      if (triggered) {
        activeClusters.push(cluster.label);
        for (const syn of cluster.terms) {
          if (!expandedMap.has(syn)) {
            expandedMap.set(syn, 0.58);
          }
        }
      }
    }

    return { expandedMap, activeClusters };
  }

  function getProvinceFieldTexts(p) {
    return {
      name: String(p.name || ''),
      region: String(p.region || ''),
      landmarks: Array.isArray(p.landmarks) ? p.landmarks.join(' • ') : String(p.landmarks || ''),
      specialties: Array.isArray(p.specialties) ? p.specialties.join(' • ') : String(p.specialties || ''),
      spiritual_figures: Array.isArray(p.spiritual_figures)
        ? p.spiritual_figures.map((s) => String(s).replace(/\*\*/g, '')).join(' • ')
        : String(p.spiritual_figures || '').replace(/\*\*/g, ''),
      library: String(p.custom_library || p.library || ''),
      quote: String(p.custom_quote || p.quote || ''),
      five_day_plan: Array.isArray(p.five_day_plan)
        ? p.five_day_plan.map((s) => String(s).replace(/\*\*/g, '')).join(' • ')
        : String(p.five_day_plan || '').replace(/\*\*/g, ''),
      history: String(p.history || ''),
      reflection: String(p.reflection || '')
    };
  }

  /**
   * Safely highlights matched terms/synonyms in a snippet AFTER HTML-escaping.
   * Uses Turkish-normalized index alignment on plain text, then escapes segments.
   */
  function buildHighlightedSnippetHtml(rawText, matchTerms, norm, esc) {
    const clean = String(rawText || '').replace(/\s+/g, ' ').trim();
    if (!clean) return '';

    const activeTerms = Array.from(matchTerms || []).filter((t) => t && t.length >= 3);
    if (!activeTerms.length) {
      const clipped = clean.length > 155 ? clean.slice(0, 152).trim() + '…' : clean;
      return esc(clipped);
    }

    // Find first match position in normalized string to center the snippet window
    const normFull = norm(clean);
    let firstPos = -1;
    for (const term of activeTerms) {
      const idx = normFull.indexOf(term);
      if (idx !== -1 && (firstPos === -1 || idx < firstPos)) {
        firstPos = idx;
      }
    }

    let snippet = clean;
    if (clean.length > 165) {
      const start = firstPos > 45 ? Math.max(0, firstPos - 42) : 0;
      const end = Math.min(clean.length, start + 160);
      snippet = (start > 0 ? '…' : '') + clean.slice(start, end).trim() + (end < clean.length ? '…' : '');
    }

    // Tokenize snippet into words & separators, escape each, wrap matching words in <mark>
    const parts = snippet.split(/([A-Za-zÇĞİÖŞÜçğıöşüÂÎÛâîû0-9]+)/);
    return parts
      .map((part) => {
        if (!part) return '';
        if (/^[A-Za-zÇĞİÖŞÜçğıöşüÂÎÛâîû0-9]+$/.test(part)) {
          const np = norm(part);
          const isHit = activeTerms.some((t) => tokenMatches(np, t));
          if (isHit) {
            return `<mark class="aiss-hl">${esc(part)}</mark>`;
          }
        }
        return esc(part);
      })
      .join('');
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .aiss-shell { max-width: 1140px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
      .aiss-hero { padding: 24px 26px; border-radius: 20px; background: linear-gradient(140deg, rgba(15,23,42,0.9), rgba(20,33,61,0.78)); border: 1px solid rgba(0,242,254,0.26); display: flex; flex-direction: column; gap: 14px; }
      .aiss-form { display: flex; gap: 10px; flex-wrap: wrap; }
      .aiss-input { flex: 1; min-width: 240px; padding: 13px 16px; border-radius: 14px; background: rgba(7,12,24,0.78); border: 1px solid var(--border-glass); color: var(--text-primary); font-family: var(--font-body); font-size: 0.94rem; outline: none; }
      .aiss-input:focus { border-color: var(--accent-cyan); box-shadow: 0 0 0 3px rgba(0,242,254,0.14); }
      .aiss-chips { display: flex; gap: 8px; flex-wrap: wrap; }
      .aiss-chip { padding: 6px 12px; border-radius: 999px; font-size: 0.76rem; background: rgba(0,242,254,0.08); border: 1px solid rgba(0,242,254,0.22); color: var(--text-secondary); cursor: pointer; transition: all 0.18s ease; text-align: left; }
      .aiss-chip:hover { border-color: var(--accent-cyan); color: var(--accent-cyan); transform: translateY(-1px); }
      .aiss-summary { padding: 15px 18px; border-radius: 14px; background: rgba(0,242,254,0.07); border: 1px solid rgba(0,242,254,0.24); font-size: 0.86rem; color: var(--text-primary); line-height: 1.55; display: flex; flex-direction: column; gap: 8px; }
      .aiss-syn-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
      .aiss-syn-pill { font-size: 0.72rem; font-weight: 700; padding: 3px 9px; border-radius: 999px; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.34); color: #d8b4fe; }
      .aiss-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
      .aiss-card { border-radius: 18px; overflow: hidden; background: rgba(15,23,42,0.8); border: 1px solid var(--border-glass); display: flex; flex-direction: column; cursor: pointer; transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease; }
      .aiss-card:hover { transform: translateY(-4px); border-color: rgba(0,242,254,0.5); box-shadow: 0 16px 36px rgba(0,0,0,0.4); }
      .aiss-media { position: relative; height: 152px; overflow: hidden; background: #0a0f1d; }
      .aiss-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
      .aiss-card:hover .aiss-media img { transform: scale(1.06); }
      .aiss-plate { position: absolute; top: 10px; left: 10px; padding: 3px 9px; border-radius: 999px; font-size: 0.72rem; font-weight: 800; background: rgba(6,9,19,0.84); color: var(--accent-cyan); border: 1px solid rgba(0,242,254,0.35); }
      .aiss-status { position: absolute; top: 10px; right: 10px; padding: 3px 9px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; background: rgba(6,9,19,0.84); color: #e2e8f0; }
      .aiss-status.visited { color: #6ee7b7; border: 1px solid rgba(16,185,129,0.4); }
      .aiss-rel-badge { position: absolute; bottom: 10px; right: 10px; padding: 3px 10px; border-radius: 999px; font-family: var(--font-heading); font-size: 0.74rem; font-weight: 800; background: rgba(6,9,19,0.88); color: #34d399; border: 1px solid rgba(52,211,153,0.45); backdrop-filter: blur(6px); }
      .aiss-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 9px; flex: 1; }
      .aiss-rel-bar-wrap { display: flex; flex-direction: column; gap: 4px; }
      .aiss-rel-bar-head { display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); }
      .aiss-rel-pct { color: #34d399; font-family: var(--font-heading); font-weight: 800; }
      .aiss-rel-track { width: 100%; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.09); overflow: hidden; }
      .aiss-rel-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #00f2fe 0%, #34d399 100%); transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1); }
      .aiss-reason { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; padding: 8px 10px; border-radius: 10px; background: rgba(0,242,254,0.06); border-left: 3px solid var(--accent-cyan); }
      .aiss-snippet { font-size: 0.79rem; color: var(--text-secondary); line-height: 1.5; padding: 8px 10px; border-radius: 10px; background: rgba(168,85,247,0.07); border: 1px solid rgba(168,85,247,0.2); }
      .aiss-snippet-field { display: inline-block; font-size: 0.69rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: #c084fc; margin-bottom: 3px; }
      .aiss-hl { background: rgba(245,158,11,0.28); color: #fef08a; padding: 0 3px; border-radius: 4px; font-weight: 700; }
      body.light-theme .aiss-hero, body.light-theme .aiss-card { background: rgba(255,255,255,0.94); color: #0f172a; }
      body.light-theme .aiss-input { background: #f1f5f9; color: #0f172a; }
      body.light-theme .aiss-summary, body.light-theme .aiss-reason { background: rgba(2,132,199,0.08); color: #0f172a; }
      body.light-theme .aiss-snippet { background: rgba(124,58,237,0.06); border-color: rgba(124,58,237,0.2); color: #334155; }
      body.light-theme .aiss-snippet-field { color: #7c3aed; }
      body.light-theme .aiss-syn-pill { background: rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.28); color: #6d28d9; }
      body.light-theme .aiss-rel-track { background: rgba(15,23,42,0.1); }
      body.light-theme .aiss-rel-pct { color: #059669; }
      body.light-theme .aiss-hl { background: rgba(245,158,11,0.32); color: #78350f; }
    `;
    document.head.appendChild(style);
  }

  /**
   * Multi-token TF-IDF + Turkish synonym expansion across all province fields.
   */
  function localSemanticScore(query, provincesObj, norm, esc) {
    const q = norm(query);
    const wantUnvisited = /(gitmedigim|gezilmemis|bekleyen|henuz|kesfedilmemis)/.test(q);
    const wantVisited = /(gezdigim|gittigim|gezilmis)/.test(q);
    const wantCoast = /(deniz|sahil|kiyi|plaj|koy|liman|ege|akdeniz|karadeniz)/.test(q);
    const wantWinter = /(kis|kar|kayak|soguk|corba|termal|kaplica)/.test(q);
    const wantHistory = /(selcuklu|osmanli|tarih|unesco|antik|medrese|kale|cami|turbe|hoyuk)/.test(q);
    const wantFood = /(yemek|lezzet|gurme|kebap|tatli|mutfak|corba|pide|baklava|kunefe)/.test(q);
    const wantLibrary = /(kutuphane|calisma|odak|sakin|kitap|gocebe)/.test(q);
    const wantSpiritual = /(manevi|dergah|mevlana|evliya|tasavvuf|irfan|turbe|cami|tekke|huzur)/.test(q);
    const wantCoolNature = /(serin|yayla|selale|kanyon|dag|orman|vadi|gol|doga)/.test(q);

    const distMatch = q.match(/(\d{2,4})\s*km/);
    const maxKm = distMatch ? parseInt(distMatch[1], 10) : null;
    const countMatch = q.match(/\b([1-9]|1[0-2])\s*(il|sehir|durak|menzil|sakin)/);
    const limit = countMatch ? Math.min(12, Math.max(4, parseInt(countMatch[1], 10))) : 6;

    const baseTokens = tokenize(q);
    const { expandedMap, activeClusters } = expandQueryTokens(baseTokens);
    const expandedTerms = Array.from(expandedMap.keys());

    const entries = Object.entries(provincesObj || {});
    const totalDocs = Math.max(1, entries.length);

    // Pre-tokenize all fields per province and compute document frequency (df) for TF-IDF
    const docs = entries.map(([key, p]) => {
      const fields = getProvinceFieldTexts(p);
      const fieldTokens = {};
      const allTokens = [];
      for (const fd of FIELD_DEFS) {
        const toks = tokenize(norm(fields[fd.key]));
        fieldTokens[fd.key] = toks;
        for (let i = 0; i < toks.length; i++) allTokens.push(toks[i]);
      }
      return { key, p, fields, fieldTokens, allTokens };
    });

    // Compute IDF for each expanded query term across the 81-province corpus
    const idfMap = new Map();
    for (const term of expandedTerms) {
      let df = 0;
      for (let i = 0; i < docs.length; i++) {
        const toks = docs[i].allTokens;
        for (let j = 0; j < toks.length; j++) {
          if (tokenMatches(toks[j], term)) {
            df++;
            break;
          }
        }
      }
      idfMap.set(term, Math.log((totalDocs + 1) / (df + 1)) + 1);
    }

    const scoredRaw = docs
      .map((doc) => {
        const { key, p, fields, fieldTokens } = doc;
        if (wantUnvisited && p.visited) return null;
        if (wantVisited && !p.visited) return null;
        const distAnkara = p.lat && p.lng ? haversineKm(ANKARA_COORDS.lat, ANKARA_COORDS.lng, p.lat, p.lng) : 999;
        if (maxKm && q.includes('ankara') && distAnkara > maxKm) return null;

        let tfidfScore = 0;
        let bestField = null;
        let bestFieldScore = 0;
        const matchedTermSet = new Set();

        for (const fd of FIELD_DEFS) {
          const toks = fieldTokens[fd.key];
          if (!toks.length) continue;
          let fieldScore = 0;
          for (const [term, termWeight] of expandedMap.entries()) {
            let tf = 0;
            for (let i = 0; i < toks.length; i++) {
              if (tokenMatches(toks[i], term)) tf++;
            }
            if (tf > 0) {
              matchedTermSet.add(term);
              const sublinearTf = 1 + Math.log(tf);
              const idf = idfMap.get(term) || 1;
              fieldScore += sublinearTf * idf * termWeight * fd.weight;
            }
          }
          tfidfScore += fieldScore;
          if (fieldScore > bestFieldScore && fd.key !== 'name' && fd.key !== 'region') {
            bestFieldScore = fieldScore;
            bestField = fd;
          }
        }

        // Structured intent bonuses (geographic, coastal, region, visited, distance)
        let intentBonus = 0;
        if (wantCoast && COASTAL_PLATES.has(Number(p.plate))) intentBonus += 16;
        if (wantWinter && (p.region_code === '06_DoguAnadolu' || /(kar|kis|kayak|erzurum|kars|ardahan|bolu|uludag)/.test(norm(fields.history + ' ' + fields.landmarks)))) intentBonus += 14;
        if (wantHistory && /(selcuklu|osmanli|unesco|antik|medrese|kale|cami|turbe)/.test(norm(fields.history + ' ' + fields.landmarks))) intentBonus += 12;
        if (wantFood && (p.specialties || []).length >= 3) intentBonus += 10;
        if (wantLibrary && (p.library || p.custom_library)) intentBonus += 10;
        if (wantSpiritual && Array.isArray(p.spiritual_figures) && p.spiritual_figures.length > 0) intentBonus += 14;
        if (wantCoolNature && (p.region_code === '05_Karadeniz' || /(yayla|selale|kanyon|dag|gol|orman)/.test(norm(fields.landmarks + ' ' + fields.five_day_plan)))) intentBonus += 13;

        if (q.includes('guneydogu') && p.region_code === '07_GuneydoguAnadolu') intentBonus += 24;
        if (q.includes('dogu') && !q.includes('guneydogu') && p.region_code === '06_DoguAnadolu') intentBonus += 24;
        if (q.includes('karadeniz') && p.region_code === '05_Karadeniz') intentBonus += 24;
        if (q.includes('ege') && p.region_code === '02_Ege') intentBonus += 24;
        if (q.includes('akdeniz') && p.region_code === '03_Akdeniz') intentBonus += 24;
        if (q.includes('marmara') && p.region_code === '01_Marmara') intentBonus += 24;
        if (q.includes('ic anadolu') && p.region_code === '04_IcAnadolu') intentBonus += 24;

        const totalScore = tfidfScore + intentBonus + 2;

        // Build highlighted snippet from the highest-scoring field
        let snippetFieldLabel = '';
        let snippetHtml = '';
        if (bestField && fields[bestField.key]) {
          snippetFieldLabel = bestField.label;
          snippetHtml = buildHighlightedSnippetHtml(fields[bestField.key], matchedTermSet, norm, esc);
        } else if (fields.history || fields.quote) {
          snippetFieldLabel = fields.history ? '📜 Tarihçe' : '💬 Şehir Sözü';
          snippetHtml = buildHighlightedSnippetHtml(fields.history || fields.quote, matchedTermSet, norm, esc);
        }

        const reasonParts = [];
        if (p.landmarks && p.landmarks[0]) reasonParts.push(`🏛️ ${p.landmarks[0]}`);
        if (p.specialties && p.specialties[0]) reasonParts.push(`🍽️ ${p.specialties[0]}`);
        if (maxKm && q.includes('ankara')) reasonParts.push(`🧭 Ankara'ya ~${distAnkara} km`);

        return {
          key,
          p,
          score: totalScore,
          matchedCount: matchedTermSet.size,
          reason: reasonParts.join(' • ') || p.quote || p.region,
          snippetFieldLabel,
          snippetHtml
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Compute calibrated relevance percentages (62% - 99%)
    const topScore = scoredRaw.length ? Math.max(1, scoredRaw[0].score) : 1;
    const items = scoredRaw.map((item, idx) => {
      const ratio = item.score / topScore;
      const topCap = item.matchedCount > 0 ? 98 : 88;
      const relevancePct = Math.max(58, Math.min(99, Math.round(58 + ratio * (topCap - 58) - idx * 0.6)));
      return { ...item, relevancePct };
    });

    return {
      source: '⚡ Semantik TF-IDF + Türkçe Eş Anlamlılar Motoru',
      summary: `"${query}" sorgusu 81 ilin tarihçe, tefekkür, maneviyat, 5 günlük plan, kütüphane, miras ve lezzet alanlarında taranarak en uyumlu ${items.length} menzil sıralandı.`,
      activeClusters,
      items
    };
  }

  function extractJsonBlock(raw) {
    if (!raw) return null;
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenced ? fenced[1].trim() : raw.trim();
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch (e) {
      return null;
    }
  }

  async function runSearch(query, ctx) {
    const provincesObj = (ctx.data && ctx.data.provinces) || {};
    const norm = ctx.normalizeTurkish || fallbackNorm;
    const esc = ctx.escapeHtml || fallbackEsc;
    const ai = window.SEYYAH_AI;

    // Always compute local TF-IDF semantic metrics so we have snippets, synonym clusters & relevance %
    const localRes = localSemanticScore(query, provincesObj, norm, esc);
    const localByKey = new Map();
    localRes.items.forEach((it) => localByKey.set(it.key, it));

    if (ai && typeof ai.hasKey === 'function' && ai.hasKey()) {
      const compactCatalog = Object.values(provincesObj)
        .map(
          (p) =>
            `${p.name}(${p.plate},${p.region},${p.visited ? 'G' : 'B'},${(p.landmarks || []).slice(0, 2).join('/')},${(p.specialties || []).slice(0, 2).join('/')})`
        )
        .join('; ');

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
          parsed.matches.forEach((m, idx) => {
            const hit = byNormName.get(norm(m.name));
            if (hit && !items.some((x) => x.key === hit.key)) {
              const localHit = localByKey.get(hit.key);
              const relevancePct = localHit
                ? Math.max(localHit.relevancePct, 96 - idx * 3)
                : Math.max(76, 97 - idx * 4);
              items.push({
                key: hit.key,
                p: hit.p,
                reason: m.reason || hit.p.quote || hit.p.region,
                relevancePct,
                snippetFieldLabel: localHit ? localHit.snippetFieldLabel : '',
                snippetHtml: localHit ? localHit.snippetHtml : ''
              });
            }
          });
          if (items.length > 0) {
            return {
              source: `🟢 Gemini AI + TF-IDF Hibrit (${res.model}${res.cached ? ' • Önbellek' : ''})`,
              summary: parsed.summary || `"${query}" için Gemini AI eşleşmeleri:`,
              activeClusters: localRes.activeClusters,
              items
            };
          }
        }
      } catch (e) {
        // fall back cleanly to local TF-IDF semantic engine
      }
    }

    return localRes;
  }

  function render(container, ctx) {
    if (!container) return;
    ensureStyles();
    const safeCtx = ctx || {};
    const esc = safeCtx.escapeHtml || fallbackEsc;
    const hasAi = !!(window.SEYYAH_AI && window.SEYYAH_AI.hasKey && window.SEYYAH_AI.hasKey());

    const resultsHtml = lastResults
      ? `
      <div class="aiss-summary">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <strong style="color:var(--accent-cyan);">✨ Arama Sonucu (${lastResults.items.length} Menzil)</strong>
          <span style="font-size:0.74rem;color:var(--text-muted);">${esc(lastResults.source)}</span>
        </div>
        <div>${esc(lastResults.summary)}</div>
        ${
          lastResults.activeClusters && lastResults.activeClusters.length
            ? `<div class="aiss-syn-row">
                <span style="font-size:0.72rem;color:var(--text-muted);font-weight:700;">Genişletilen Kavramlar:</span>
                ${lastResults.activeClusters.map((c) => `<span class="aiss-syn-pill">${esc(c)}</span>`).join('')}
              </div>`
            : ''
        }
      </div>
      <div class="aiss-grid">
        ${lastResults.items
          .map(
            (it) => `
          <article class="aiss-card" data-aiss-city="${esc(it.key)}">
            <div class="aiss-media">
              <img src="${esc(it.p.banner_rel || 'assets/banner.jpg')}" alt="${esc(it.p.name)}" loading="lazy" onerror="this.src='assets/banner.jpg'" />
              <span class="aiss-plate">${String(it.p.plate || 0).padStart(2, '0')}</span>
              <span class="aiss-status ${it.p.visited ? 'visited' : ''}">${it.p.visited ? '✅ Gezildi' : '⏳ Bekliyor'}</span>
              <span class="aiss-rel-badge">%${it.relevancePct || 85} Uyum</span>
            </div>
            <div class="aiss-body">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <strong style="font-family:var(--font-heading);font-size:1.05rem;">${esc(it.p.name)}</strong>
                <span style="font-size:0.74rem;color:var(--text-muted);">${esc(it.p.region)}</span>
              </div>
              <div class="aiss-rel-bar-wrap">
                <div class="aiss-rel-bar-head">
                  <span>Semantik Eşleşme</span>
                  <span class="aiss-rel-pct">%${it.relevancePct || 85} Uyum</span>
                </div>
                <div class="aiss-rel-track">
                  <div class="aiss-rel-fill" style="width:${Math.min(100, Math.max(10, it.relevancePct || 85))}%;"></div>
                </div>
              </div>
              <div class="aiss-reason">${esc(it.reason)}</div>
              ${
                it.snippetHtml
                  ? `<div class="aiss-snippet">
                      <div class="aiss-snippet-field">${esc(it.snippetFieldLabel || '🔎 Eşleşen Kesit')}</div>
                      <div>${it.snippetHtml}</div>
                    </div>`
                  : ''
              }
              <div style="margin-top:auto;font-size:0.76rem;color:var(--accent-cyan);font-weight:700;">📍 Menzili İncele ➔</div>
            </div>
          </article>
        `
          )
          .join('')}
      </div>
    `
      : `
      <div class="glass-card detail-card" style="text-align:center;padding:34px 20px;color:var(--text-secondary);">
        <div style="font-size:2.2rem;margin-bottom:8px;">🔎</div>
        <div>Yukarıya doğal Türkçe bir kriter yazın veya hazır örneklerden birine tıklayın.</div>
        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:6px;">
          Çoklu-token TF-IDF + Türkçe eş anlamlı genişletme ile 81 ilin tüm alanlarında anında arama yapılır.
        </div>
      </div>
    `;

    container.innerHTML = `
      <section class="aiss-shell">
        <div class="aiss-hero">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <div>
              <h2 style="font-family:var(--font-heading);font-size:1.45rem;margin:0;color:var(--accent-cyan);">🔎 AI Doğal Dil Akıllı Arama</h2>
              <p style="font-size:0.84rem;color:var(--text-secondary);margin:4px 0 0 0;">Çok kriterli doğal Türkçe sorular, TF-IDF puanlaması ve eş anlamlı genişletme ile 81 ilde anında keşif yapın.</p>
            </div>
            <span class="tag-badge" style="font-size:0.75rem;">${hasAi ? '🟢 Gemini + TF-IDF Hibrit' : '⚡ TF-IDF Semantik Motor'}</span>
          </div>
          <form class="aiss-form" id="aiss-form">
            <input type="text" id="aiss-input" class="aiss-input" placeholder='Örn: "Manevi huzur, dergâh ve kütüphanesi güzel sakin iller"' value="${esc(lastQuery)}" required />
            <button type="submit" id="aiss-btn" class="btn btn-primary" style="padding:12px 22px;">✨ Ara</button>
          </form>
          <div class="aiss-chips">
            ${EXAMPLE_QUERIES.map((q) => `<button type="button" class="aiss-chip" data-aiss-ex="${esc(q)}">${esc(q)}</button>`).join('')}
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
      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Aranıyor...';
      }
      if (resultsWrap) {
        resultsWrap.innerHTML = `<div class="aiss-summary">✨ 81 ilin tarihçe, maneviyat, 5 günlük plan, kütüphane ve lezzet alanları TF-IDF ile taranıyor...</div>`;
      }
      lastResults = await runSearch(clean, safeCtx);
      render(container, ctx);
    };

    if (form)
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        execute(input.value);
      });
    container.querySelectorAll('[data-aiss-ex]').forEach((el) => {
      el.addEventListener('click', () => execute(el.getAttribute('data-aiss-ex')));
    });
    container.querySelectorAll('[data-aiss-city]').forEach((card) => {
      card.addEventListener('click', () => {
        const key = card.getAttribute('data-aiss-city');
        if (key && typeof safeCtx.selectCity === 'function') safeCtx.selectCity(key);
      });
    });
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.aiSearch = { render };
})();
