/**
 * Anadolu Seyahatnamesi — Yapay Zekâ Sefer & 5 Gün Kuralı Planlayıcı Stüdyosu
 * Interactive AI Expedition & 5-Day Planner Studio powered by Google Gemini API
 * with instant offline 81-province corridor fallback.
 * Registers on window.SEYYAH_MODULES.aiPlanner = { render(container, ctx) }
 */

(function () {
  'use strict';

  const GEMINI_KEY_STORAGE = 'dijital_seyyah_gemini_api_key';
  const GEMINI_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash'
  ];

  const DURATIONS = [
    { id: '3', days: 3, stops: 1, label: '3 Gün', hint: 'Hafta sonu ekspres sefer' },
    { id: '5', days: 5, stops: 2, label: '5 Gün Kuralı', hint: 'Kütüphane & keşif dengesi' },
    { id: '7', days: 7, stops: 3, label: '7 Gün', hint: 'Bölgesel derinlemesine rota' },
    { id: '14', days: 14, stops: 5, label: '14 Gün Büyük Tur', hint: 'Çok duraklı Anadolu kervanı' }
  ];

  const FOCUSES = [
    {
      id: 'tefekkur',
      label: '🕊️ Tefekkür & Kütüphane',
      shortLabel: 'Tefekkür & Kütüphane',
      promptHint: 'İl Halk Kütüphanesi çalışma mesaisi, manevi şahsiyetler, sakin tefekkür durakları ve edebî izlek',
      keywords: ['kutuphane', 'turbe', 'camii', 'dergah', 'medrese', 'huzur', 'tefekkur', 'kulliye', 'mevlana', 'yunus', 'haci']
    },
    {
      id: 'gastronomi',
      label: '🍽️ Gastronomi & Lezzet',
      shortLabel: 'Gastronomi & Lezzet',
      promptHint: 'coğrafi işaretli yöresel yemekler, tarihi çarşılar, esnaf lokantaları ve tatlı-kahve molaları',
      keywords: ['kebap', 'corba', 'baklava', 'kunefe', 'pide', 'manti', 'borek', 'helva', 'kahve', 'lezzet', 'cig kofte', 'tava']
    },
    {
      id: 'tarih',
      label: '🏛️ Tarih & UNESCO',
      shortLabel: 'Tarih & UNESCO',
      promptHint: 'UNESCO Dünya Mirası alanları, antik kentler, Selçuklu ve Osmanlı eserleri, kaleler ve müzeler',
      keywords: ['unesco', 'antik', 'kale', 'muze', 'saray', 'han', 'kervansaray', 'selcuklu', 'osmanli', 'roma', 'hitit', 'hoyuk']
    },
    {
      id: 'doga',
      label: '🌲 Doğa & Fotoğraf',
      shortLabel: 'Doğa & Fotoğraf',
      promptHint: 'milli parklar, kanyonlar, şelaleler, yaylalar, krater gölleri ve gün doğumu/batımı kadrajları',
      keywords: ['yayla', 'kanyon', 'selale', 'gol', 'milli park', 'dag', 'vadi', 'magara', 'sahil', 'deniz', 'orman', 'tabiat']
    }
  ];

  const BUDGETS = [
    {
      id: 'kyk',
      label: '🎒 GSB Seyahatsever KYK Ekonomik',
      shortLabel: 'GSB KYK Ekonomik',
      dailyTl: 450,
      transportNote: 'Şehirlerarası otobüs / TCDD tren + şehir içi halk ulaşımı',
      stayNote: 'GSB Seyahatsever KYK Yurdu (ücretsiz / sembolik bedel) ve halk lokantaları'
    },
    {
      id: 'standart',
      label: '🚌 Standart',
      shortLabel: 'Standart',
      dailyTl: 1650,
      transportNote: 'YHT / konforlu şehirlerarası otobüs',
      stayNote: 'Öğretmenevi, kamu misafirhanesi veya merkezî butik pansiyon'
    },
    {
      id: 'konfor',
      label: '✨ Konfor',
      shortLabel: 'Konfor',
      dailyTl: 3800,
      transportNote: 'Özel araç veya uçak + esnek transfer',
      stayNote: 'Tarihî taş konak / butik otel ve imza yöresel restoranlar'
    }
  ];

  // Session state preserved across view switches
  const uiState = {
    startCityKey: '',
    durationId: '5',
    focusId: 'tefekkur',
    budgetId: 'kyk',
    extraNote: '',
    isGenerating: false,
    result: null
  };

  // ---------------------------------------------------------------------------
  // Utilities & Safe Fallbacks
  // ---------------------------------------------------------------------------
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

  function normalizeKeepApostrophe(str) {
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
      .replace(/[’`]/g, "'");
  }

  function fallbackCalcDistKm(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
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

  function getStoredGeminiKey() {
    try {
      return (localStorage.getItem(GEMINI_KEY_STORAGE) || '').trim();
    } catch (e) {
      return '';
    }
  }

  function setStoredGeminiKey(key) {
    try {
      if (key && key.trim()) {
        localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
      } else {
        localStorage.removeItem(GEMINI_KEY_STORAGE);
      }
    } catch (e) {}
  }

  function stripBold(str) {
    return String(str || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
  }

  function formatTrNumber(num) {
    return (Number(num) || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 });
  }

  function nowTimeStr() {
    try {
      return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  // ---------------------------------------------------------------------------
  // Province Index Builder
  // ---------------------------------------------------------------------------
  function buildProvinceIndex(ctx) {
    const norm = (ctx && ctx.normalizeTurkish) || fallbackNormalize;
    const raw = (ctx && ctx.data && ctx.data.provinces) || {};
    const list = [];

    Object.keys(raw).forEach((key) => {
      const p = raw[key];
      if (!p || !p.name) return;
      const landmarks = Array.isArray(p.landmarks) ? p.landmarks : [];
      const specialties = Array.isArray(p.specialties) ? p.specialties : [];
      const spiritual = Array.isArray(p.spiritual_figures) ? p.spiritual_figures : [];
      const fiveDay = Array.isArray(p.five_day_plan) ? p.five_day_plan : [];
      const thumb = p.banner_rel || (Array.isArray(p.images) && p.images[0]) || p.gallery_rel || '';

      list.push({
        key,
        plate: Number(p.plate) || 0,
        name: p.name,
        slug: p.slug || norm(p.name),
        region: p.region || '',
        region_code: p.region_code || '',
        lat: Number(p.lat) || 0,
        lng: Number(p.lng) || 0,
        visited: Boolean(p.visited),
        landmarks,
        specialties,
        spiritual_figures: spiritual,
        five_day_plan: fiveDay,
        library: p.library || '',
        quote: p.custom_quote || p.quote || '',
        history: p.history || '',
        thumb,
        normName: norm(p.name),
        normSearchBlob: norm(
          [
            p.name,
            p.region,
            landmarks.join(' '),
            specialties.join(' '),
            spiritual.join(' '),
            p.library,
            p.history
          ].join(' ')
        )
      });
    });

    list.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    return list;
  }

  function findDefaultAnkara(provinces) {
    const found = provinces.find((p) => p.normName === 'ankara');
    return found ? found.key : (provinces[0] ? provinces[0].key : '');
  }

  // ---------------------------------------------------------------------------
  // Real Visited / Unvisited Context & Nearest Corridor Calculation
  // ---------------------------------------------------------------------------
  function buildGeminiPromptPayload(provinces, startProv, duration, focus, budget, extraNote, distFn) {
    const visitedProvs = provinces.filter((p) => p.visited);
    const unvisitedProvs = provinces.filter((p) => !p.visited);

    const othersWithDist = provinces
      .filter((p) => p.key !== startProv.key)
      .map((p) => ({
        prov: p,
        distKm: Math.round(distFn(startProv.lat, startProv.lng, p.lat, p.lng))
      }))
      .sort((a, b) => a.distKm - b.distKm);

    const nearbyUnvisited = othersWithDist.filter((item) => !item.prov.visited).slice(0, 14);
    const nearbyVisited = othersWithDist.filter((item) => item.prov.visited).slice(0, 6);

    const formatCandidate = (item) => {
      const p = item.prov;
      const lm = p.landmarks.slice(0, 2).join(', ') || 'Şehir merkezi';
      const sp = p.specialties.slice(0, 2).join(', ') || 'Yöresel mutfak';
      const lib = p.library ? p.library.split('-')[0].trim() : `${p.name} İl Halk Kütüphanesi`;
      return `- ${p.name} (${padPlate(p.plate)} | ${p.region} | ~${item.distKm} km | ${p.visited ? 'GEZİLDİ' : 'GEZİLMEDİ'}): Eserler: ${lm}; Lezzetler: ${sp}; Kütüphane: ${lib}`;
    };

    const pct = provinces.length ? ((visitedProvs.length / provinces.length) * 100).toFixed(1) : '0.0';

    const systemInstruction = [
      'Sen "Dijital Seyyah: Anadolu Seyahatnamesi" projesinin baş seyahat mimarı ve yapay zekâ sefer planlayıcısısın.',
      'Evliya Çelebi ve İbn Battûta geleneğinin zarif üslubunu; 5 Gün Kuralı, İl Halk Kütüphanesi çalışma disiplini ve GSB Seyahatsever KYK kültürüyle birleştirerek uygulanabilir, gerçekçi ve ilham verici sefer planları üretirsin.',
      'Kurallar:',
      '1. Yanıtını temiz Türkçe Markdown olarak yapılandır: # Sefer Başlığı, kısa özet, ## 1. Gün ... ## N. Gün başlıkları ve sonunda Bütçe & Hazırlık Özeti.',
      '2. Kullanıcı aksini istemedikçe öncelikle HENÜZ GEZİLMEMİŞ (GEZİLMEDİ) illerden coğrafi olarak mantıklı bir koridor oluştur; başlangıç şehrini ve yol üzerindeki yakın illeri gerçekçi mesafelerle bağla.',
      '3. Geçen her il adını mutlaka **Kalın** yaz (ör. **Şanlıurfa**, **Mardin**).',
      '4. Her gün içinde Sabah (Kütüphane / Keşif), Öğle (Ana Ziyaret), Akşam (Gastronomi & Tefekkür) ve Konaklama/Bütçe notu ver.',
      '5. Sadece verilen Türkiye illerini ve gerçekçi mesafe/mekân bilgilerini kullan; uydurma yer adı ekleme.'
    ].join('\n');

    const userPrompt = [
      `## Seyyahın Güncel Anadolu Envanteri (${provinces.length} İl)`,
      `- Toplam ilerleme: ${visitedProvs.length}/${provinces.length} il gezildi (%${pct}), ${unvisitedProvs.length} il keşif bekliyor.`,
      `- Gezilen iller: ${visitedProvs.map((p) => p.name).join(', ') || 'Henüz yok'}`,
      `- Gezilmemiş iller: ${unvisitedProvs.map((p) => p.name).join(', ') || 'Tamamı gezildi!'}`,
      '',
      '## İstenen Sefer Parametreleri',
      `- Başlangıç Şehri: **${startProv.name}** (${padPlate(startProv.plate)} • ${startProv.region} • Durum: ${startProv.visited ? 'Gezildi' : 'Gezilmedi'})`,
      `- Sefer Süresi: ${duration.label} (${duration.days} gün, önerilen ~${duration.stops} ana durak / çevre il)`,
      `- Seyyah Odağı: ${focus.label} (${focus.promptHint})`,
      `- Bütçe Modu: ${budget.label} — Günlük hedef ~${formatTrNumber(budget.dailyTl)} ₺ (${budget.stayNote}; ${budget.transportNote})`,
      extraNote ? `- Ek Not / Özel Tercih: ${extraNote}` : '- Ek Not / Özel Tercih: Belirtilmedi',
      '',
      `## ${startProv.name} Çevresindeki Öncelikli Gezilmemiş İller (Kuş Uçuşu Mesafe Sıralı)`,
      nearbyUnvisited.map(formatCandidate).join('\n') || '- Tüm iller gezilmiş görünüyor.',
      '',
      `## ${startProv.name} Çevresindeki Gezilmiş İller (Referans / Geçiş Koridoru)`,
      nearbyVisited.map(formatCandidate).join('\n') || '- Yakın gezilmiş il yok.',
      '',
      `Lütfen yukarıdaki gerçek envanter ve tercihlere göre ${duration.days} günlük eksiksiz, günlük saat akışlı, kütüphane ve yöresel lezzet dokunuşlu bir Anadolu Sefer Planı oluştur.`
    ].join('\n');

    return { systemInstruction, userPrompt };
  }

  // ---------------------------------------------------------------------------
  // Google Gemini API Caller with Model Auto-Fallback
  // ---------------------------------------------------------------------------
  async function requestGeminiExpedition(apiKey, systemInstruction, userPrompt) {
    let lastError = null;

    for (let i = 0; i < GEMINI_MODELS.length; i++) {
      const model = GEMINI_MODELS[i];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.72,
            maxOutputTokens: 3200
          }
        })
      });

      let data = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        data = null;
      }

      if (!res.ok) {
        const errMsg = (data && data.error && data.error.message) || `HTTP ${res.status}`;
        lastError = new Error(`${model}: ${errMsg}`);
        const isFallbackWorthy =
          res.status === 429 ||
          res.status === 404 ||
          res.status === 503 ||
          /quota|billing|limit|not found|high demand|overload|unavailable/i.test(errMsg);
        if (isFallbackWorthy && i < GEMINI_MODELS.length - 1) {
          continue;
        }
        throw lastError;
      }

      const parts =
        data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts;
      const text = Array.isArray(parts)
        ? parts.map((pt) => pt.text || '').join('\n').trim()
        : '';

      if (text) {
        return {
          markdown: text,
          modelUsed: model,
          isLive: true
        };
      }

      lastError = new Error(`${model}: Boş yanıt döndü`);
    }

    throw lastError || new Error('Gemini API yanıt alınamadı.');
  }

  // ---------------------------------------------------------------------------
  // Instant Offline Fallback Plan Generator (Uses Real ctx.data.provinces)
  // ---------------------------------------------------------------------------
  function scoreFocusMatch(prov, focus) {
    let score = 0;
    for (const kw of focus.keywords) {
      if (prov.normSearchBlob.includes(kw)) score += 1;
    }
    if (!prov.visited) score += 2.5;
    return score;
  }

  function buildCorridorStops(provinces, startProv, stopCount, focus, extraNote, distFn, normFn) {
    const pool = provinces.filter((p) => p.key !== startProv.key);
    const unvisitedPool = pool.filter((p) => !p.visited);
    const activePool = unvisitedPool.length >= stopCount ? unvisitedPool : pool;

    const noteNorm = normFn(extraNote || '');
    const selected = [];
    const usedKeys = new Set([startProv.key]);
    let cursor = startProv;

    for (let step = 0; step < stopCount; step++) {
      let bestItem = null;
      let bestCost = Infinity;

      for (const candidate of activePool) {
        if (usedKeys.has(candidate.key)) continue;
        const km = distFn(cursor.lat, cursor.lng, candidate.lat, candidate.lng);
        const focusBonus = scoreFocusMatch(candidate, focus) * 45;
        let noteBonus = 0;
        if (noteNorm) {
          if (noteNorm.includes(candidate.normName) || noteNorm.includes(normFn(candidate.region))) {
            noteBonus = 500;
          }
        }
        // Keep realistic sequential road hops while favoring focus & unvisited
        const effectiveCost = km - focusBonus - noteBonus;
        if (effectiveCost < bestCost) {
          bestCost = effectiveCost;
          bestItem = { prov: candidate, legKm: Math.round(km) };
        }
      }

      if (!bestItem) break;
      usedKeys.add(bestItem.prov.key);
      selected.push(bestItem);
      cursor = bestItem.prov;
    }

    return selected;
  }

  function generateOfflinePlan(provinces, startProv, duration, focus, budget, extraNote, distFn, normFn, fallbackReason) {
    const stops = buildCorridorStops(provinces, startProv, duration.stops, focus, extraNote, distFn, normFn);
    const fullRoute = [{ prov: startProv, legKm: 0 }].concat(stops);
    const totalKm = stops.reduce((acc, s) => acc + s.legKm, 0);
    const estRoadKm = Math.round(totalKm * 1.24); // Winding Anatolian road factor
    const estBudgetTl = duration.days * budget.dailyTl + Math.round(estRoadKm * (budget.id === 'kyk' ? 1.8 : budget.id === 'standart' ? 2.6 : 4.2));

    const routeNamesBold = fullRoute.map((r) => `**${r.prov.name}**`).join(' → ');
    const visitedCount = provinces.filter((p) => p.visited).length;
    const unvisitedCount = provinces.length - visitedCount;

    const lines = [];
    lines.push(`# ${startProv.name} Çıkışlı ${duration.label} — ${focus.shortLabel} Seferi`);
    lines.push('');
    lines.push(
      `> *"${stripBold(startProv.quote || 'Yola çık ki yol sana görünsün; kendini yola bırak ki menzile eresin.')}"*`
    );
    lines.push('');
    lines.push(`- **Rota Koridoru:** ${routeNamesBold}`);
    lines.push(`- **Sefer Profili:** ${duration.label} (${duration.days} Gün) • ${focus.label}`);
    lines.push(`- **Konaklama & Bütçe Modu:** ${budget.label} (Tahmini toplam ~**${formatTrNumber(estBudgetTl)} ₺**)`);
    lines.push(`- **Tahmini Karayolu Mesafesi:** ~**${formatTrNumber(estRoadKm)} km** (kuş uçuşu ${formatTrNumber(totalKm)} km)`);
    lines.push(
      `- **Seyyah İstatistik Bağlamı:** 81 ilin **${visitedCount}** tanesi gezilmiş, **${unvisitedCount}** il keşif bekliyor (sefer önceliği gezilmemiş illere verildi).`
    );
    if (extraNote && extraNote.trim()) {
      lines.push(`- **Özel Notunuz:** *${extraNote.trim()}*`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');

    // Distribute days across stops evenly
    const totalStopsCount = fullRoute.length;
    for (let day = 1; day <= duration.days; day++) {
      const routeIdx = Math.min(
        totalStopsCount - 1,
        Math.floor(((day - 1) * totalStopsCount) / duration.days)
      );
      const stop = fullRoute[routeIdx];
      const p = stop.prov;
      const isTransitionDay =
        routeIdx > 0 &&
        Math.floor(((day - 2) * totalStopsCount) / duration.days) !== routeIdx;

      const landmarks = p.landmarks.length ? p.landmarks : [`${p.name} Tarihî Merkezi`];
      const specialties = p.specialties.length ? p.specialties : [`${p.name} Yöresel Sofrası`];
      const primaryLandmark = landmarks[(day - 1) % landmarks.length];
      const secondaryLandmark = landmarks[day % landmarks.length];
      const dish = specialties[(day - 1) % specialties.length];
      const libName = p.library
        ? p.library.split('-')[0].trim()
        : `${p.name} İl Halk Kütüphanesi`;
      const spiritualSnippet = p.spiritual_figures.length
        ? stripBold(p.spiritual_figures[(day - 1) % p.spiritual_figures.length]).slice(0, 140)
        : '';
      const planSnippet = p.five_day_plan.length
        ? stripBold(p.five_day_plan[(day - 1) % p.five_day_plan.length])
        : '';

      lines.push(
        `## ${day}. Gün — **${p.name}** (${padPlate(p.plate)} • ${p.region})${p.visited ? ' [Gezilmiş Durak]' : ' [Yeni Keşif]'}`
      );
      if (isTransitionDay && stop.legKm > 0) {
        const prevProv = fullRoute[routeIdx - 1].prov;
        lines.push(
          `- **Sabah İntikali:** **${prevProv.name}** → **${p.name}** güzergâhında (~${Math.round(stop.legKm * 1.24)} km) ${budget.transportNote} ile varış ve eşya bırakma.`
        );
      } else {
        lines.push(
          `- **Sabah (08:30 – 12:30) • Kütüphane & Odak:** **${libName}** bünyesinde derin okuma / çalışma mesaisi ve günün rota notlarını derleme.`
        );
      }

      if (focus.id === 'tefekkur') {
        lines.push(
          `- **Öğle (13:30 – 17:30) • İrfan & Mekân:** **${primaryLandmark}** ziyareti${secondaryLandmark !== primaryLandmark ? ` ve ${secondaryLandmark} çevresinde sakin yürüyüş` : ''}.${spiritualSnippet ? ` *(İzlek: ${spiritualSnippet}...)*` : ''}`
        );
      } else if (focus.id === 'gastronomi') {
        lines.push(
          `- **Öğle (13:00 – 17:00) • Çarşı & Kültür:** **${primaryLandmark}** gezisi sonrası tarihî çarşıda **${dish}** ve bölgeye özgü lezzet tadımı.`
        );
      } else if (focus.id === 'tarih') {
        lines.push(
          `- **Öğle (13:00 – 17:30) • Tarih & Miras:** **${primaryLandmark}**${secondaryLandmark !== primaryLandmark ? ` ve **${secondaryLandmark}**` : ''} ekseninde medeniyet katmanlarını inceleme.`
        );
      } else {
        lines.push(
          `- **Öğle & Altın Saat (13:30 – 18:30) • Doğa & Kadraj:** **${primaryLandmark}** çevresinde açık hava yürüyüşü ve gün batımı fotoğraf çekimi.`
        );
      }

      if (planSnippet) {
        lines.push(`- **Şehir Defteri Notu:** ${planSnippet}`);
      }

      lines.push(
        `- **Akşam & Konaklama:** Akşam sofrasında **${dish}** deneyimi; ardından ${budget.stayNote} konaklamasında sefer günlüğü kaydı.`
      );
      lines.push('');
    }

    lines.push('---');
    lines.push('');
    lines.push('### 🎒 Sefer Hazırlık & Bütçe Özeti');
    lines.push(
      `- **Günlük Harcama Hedefi:** ~${formatTrNumber(budget.dailyTl)} ₺/gün (${budget.shortLabel})`
    );
    lines.push(`- **Ulaşım Stratejisi:** ${budget.transportNote}`);
    lines.push(`- **Konaklama Tavsiyesi:** ${budget.stayNote}`);
    lines.push(
      `- **5 Gün Kuralı İpucu:** Her yeni şehirde ilk sabahı İl Halk Kütüphanesi'ne ayırmak hem çalışma ritmini korur hem de şehrin yerlileriyle tanışma fırsatı sunar.`
    );

    return {
      markdown: lines.join('\n'),
      modelUsed: fallbackReason
        ? `Çevrimdışı Plan Motoru (Gemini yedek: ${fallbackReason})`
        : 'Çevrimdışı Akıllı Plan Motoru (81 İl Verisi)',
      isLive: false,
      noKey: !fallbackReason
    };
  }

  // ---------------------------------------------------------------------------
  // Safe Markdown -> HTML Renderer
  // ---------------------------------------------------------------------------
  function formatInlineMarkdown(escapedLine) {
    return escapedLine
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  function renderMarkdownToHtml(markdown, escapeHtml) {
    const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    const htmlParts = [];
    let listType = null; // 'ul' | 'ol'

    function closeList() {
      if (listType) {
        htmlParts.push(`</${listType}>`);
        listType = null;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      if (!trimmed) {
        closeList();
        continue;
      }

      if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
        closeList();
        htmlParts.push('<hr class="sap-md-hr" />');
        continue;
      }

      const h3Match = trimmed.match(/^###\s+(.+)$/);
      if (h3Match) {
        closeList();
        htmlParts.push(`<h3 class="sap-md-h3">${formatInlineMarkdown(escapeHtml(h3Match[1]))}</h3>`);
        continue;
      }

      const h2Match = trimmed.match(/^##\s+(.+)$/);
      if (h2Match) {
        closeList();
        htmlParts.push(`<h2 class="sap-md-h2">${formatInlineMarkdown(escapeHtml(h2Match[1]))}</h2>`);
        continue;
      }

      const h1Match = trimmed.match(/^#\s+(.+)$/);
      if (h1Match) {
        closeList();
        htmlParts.push(`<h1 class="sap-md-h1">${formatInlineMarkdown(escapeHtml(h1Match[1]))}</h1>`);
        continue;
      }

      const bqMatch = trimmed.match(/^>\s?(.*)$/);
      if (bqMatch) {
        closeList();
        htmlParts.push(
          `<blockquote class="sap-md-quote">${formatInlineMarkdown(escapeHtml(bqMatch[1]))}</blockquote>`
        );
        continue;
      }

      const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
      if (ulMatch) {
        if (listType !== 'ul') {
          closeList();
          listType = 'ul';
          htmlParts.push('<ul class="sap-md-list">');
        }
        htmlParts.push(`<li>${formatInlineMarkdown(escapeHtml(ulMatch[1]))}</li>`);
        continue;
      }

      const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
      if (olMatch) {
        if (listType !== 'ol') {
          closeList();
          listType = 'ol';
          htmlParts.push('<ol class="sap-md-list sap-md-ol">');
        }
        htmlParts.push(`<li>${formatInlineMarkdown(escapeHtml(olMatch[1]))}</li>`);
        continue;
      }

      closeList();
      htmlParts.push(`<p class="sap-md-p">${formatInlineMarkdown(escapeHtml(trimmed))}</p>`);
    }

    closeList();
    return htmlParts.join('\n');
  }

  // ---------------------------------------------------------------------------
  // Extract Clickable Province Cards from Generated Itinerary
  // ---------------------------------------------------------------------------
  function extractProvinceCardsFromMarkdown(markdown, provinces, startProv, distFn) {
    const normText = normalizeKeepApostrophe(markdown || '');
    if (!normText) return [];

    // Sort longest names first so multi-word or longer names match cleanly
    const sorted = provinces.slice().sort((a, b) => b.normName.length - a.normName.length);
    const hits = [];

    for (const p of sorted) {
      if (!p.normName || p.normName.length < 3) continue;
      const escapedName = p.normName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-z])(${escapedName})(?=$|[^a-z])`);
      const match = regex.exec(normText);
      if (match) {
        const idx = match.index + match[0].indexOf(match[1]);
        hits.push({ prov: p, pos: idx });
      }
    }

    hits.sort((a, b) => a.pos - b.pos);

    return hits.slice(0, 10).map(({ prov }) => {
      const km =
        prov.key === startProv.key
          ? 0
          : Math.round(distFn(startProv.lat, startProv.lng, prov.lat, prov.lng));
      return {
        key: prov.key,
        name: prov.name,
        plate: prov.plate,
        region: prov.region,
        visited: prov.visited,
        thumb: prov.thumb,
        kmFromStart: km,
        highlight:
          (prov.landmarks && prov.landmarks[0]) ||
          (prov.specialties && prov.specialties[0]) ||
          prov.region
      };
    });
  }

  // ---------------------------------------------------------------------------
  // Clipboard & File Download Helpers
  // ---------------------------------------------------------------------------
  async function copyMarkdownText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {}
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  function downloadMarkdownFile(filename, content) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---------------------------------------------------------------------------
  // Scoped Luxury Glassmorphism Styles
  // ---------------------------------------------------------------------------
  function ensureStyles() {
    if (document.getElementById('seyyah-ai-planner-styles')) return;
    const style = document.createElement('style');
    style.id = 'seyyah-ai-planner-styles';
    style.textContent = `
      .sap-shell {
        max-width: 1120px;
        margin: 0 auto;
        padding: 10px 4px 36px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .sap-hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 14px;
        padding: 20px 24px;
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(30, 41, 59, 0.72));
        border: 1px solid rgba(0, 242, 254, 0.24);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(16px);
      }

      .sap-hero-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .sap-hero-orb {
        width: 50px;
        height: 50px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        font-size: 1.55rem;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(168, 85, 247, 0.24));
        border: 1px solid rgba(0, 242, 254, 0.4);
        box-shadow: 0 0 22px rgba(0, 242, 254, 0.2);
        flex-shrink: 0;
      }

      .sap-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.38rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        margin: 0;
        letter-spacing: -0.01em;
      }

      .sap-subtitle {
        font-size: 0.84rem;
        color: var(--text-secondary, #94a3b8);
        margin: 3px 0 0;
      }

      .sap-hero-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .sap-status-pill {
        font-size: 0.76rem;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.14);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }

      .sap-status-pill.is-offline {
        background: rgba(245, 158, 11, 0.14);
        color: #fbbf24;
        border-color: rgba(245, 158, 11, 0.32);
      }

      .sap-ghost-btn {
        cursor: pointer;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary, #f8fafc);
        border-radius: 10px;
        padding: 7px 12px;
        font-size: 0.8rem;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .sap-ghost-btn:hover {
        border-color: rgba(0, 242, 254, 0.45);
        color: var(--accent-cyan, #00f2fe);
        transform: translateY(-1px);
      }

      .sap-api-drawer {
        padding: 16px 20px;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.84);
        border: 1px solid rgba(0, 242, 254, 0.28);
        backdrop-filter: blur(14px);
      }

      .sap-api-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
        margin-top: 10px;
      }

      .sap-form-card {
        padding: 22px 24px;
        border-radius: 20px;
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.11);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(18px);
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .sap-form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .sap-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .sap-field-full {
        grid-column: 1 / -1;
      }

      .sap-label {
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--accent-cyan, #00f2fe);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .sap-label-hint {
        font-size: 0.72rem;
        font-weight: 500;
        text-transform: none;
        letter-spacing: 0;
        color: var(--text-secondary, #94a3b8);
      }

      .sap-select,
      .sap-input {
        width: 100%;
        padding: 11px 14px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(10, 15, 29, 0.78);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .sap-select:focus,
      .sap-input:focus {
        border-color: rgba(0, 242, 254, 0.55);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .sap-pill-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 8px;
      }

      .sap-pill-btn {
        cursor: pointer;
        text-align: left;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(30, 41, 59, 0.45);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .sap-pill-btn:hover {
        border-color: rgba(0, 242, 254, 0.4);
        background: rgba(30, 41, 59, 0.75);
      }

      .sap-pill-btn.active {
        border-color: rgba(0, 242, 254, 0.7);
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.16), rgba(79, 172, 254, 0.18));
        box-shadow: 0 0 20px rgba(0, 242, 254, 0.15);
      }

      .sap-pill-main {
        font-size: 0.85rem;
        font-weight: 700;
      }

      .sap-pill-sub {
        font-size: 0.71rem;
        color: var(--text-secondary, #94a3b8);
      }

      .sap-submit-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding-top: 4px;
      }

      .sap-context-note {
        font-size: 0.78rem;
        color: var(--text-secondary, #94a3b8);
      }

      .sap-generate-btn {
        cursor: pointer;
        border: none;
        border-radius: 14px;
        padding: 13px 24px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.96rem;
        font-weight: 700;
        color: #06121f;
        background: linear-gradient(135deg, #00f2fe 0%, #4facfe 55%, #34d399 100%);
        box-shadow: 0 8px 24px rgba(0, 242, 254, 0.28);
        transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .sap-generate-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(0, 242, 254, 0.4);
      }

      .sap-generate-btn:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      /* Luxury Glass Output Card */
      .sap-result-card {
        border-radius: 22px;
        padding: 24px 26px;
        background: linear-gradient(155deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.76));
        border: 1px solid rgba(0, 242, 254, 0.28);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(20px);
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .sap-result-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .sap-result-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .sap-meta-badge {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 5px 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: var(--text-primary, #f8fafc);
      }

      .sap-meta-badge.live {
        background: rgba(16, 185, 129, 0.15);
        border-color: rgba(16, 185, 129, 0.35);
        color: #34d399;
      }

      .sap-meta-badge.offline {
        background: rgba(245, 158, 11, 0.14);
        border-color: rgba(245, 158, 11, 0.32);
        color: #fbbf24;
      }

      .sap-result-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .sap-action-btn {
        cursor: pointer;
        border: 1px solid rgba(0, 242, 254, 0.3);
        background: rgba(0, 242, 254, 0.1);
        color: var(--accent-cyan, #00f2fe);
        border-radius: 10px;
        padding: 8px 14px;
        font-size: 0.82rem;
        font-weight: 700;
        font-family: inherit;
        transition: all 0.2s ease;
      }

      .sap-action-btn:hover {
        background: rgba(0, 242, 254, 0.2);
        transform: translateY(-1px);
      }

      .sap-action-btn.gold {
        border-color: rgba(245, 158, 11, 0.35);
        background: rgba(245, 158, 11, 0.12);
        color: #fbbf24;
      }

      .sap-action-btn.gold:hover {
        background: rgba(245, 158, 11, 0.22);
      }

      .sap-offline-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        padding: 10px 14px;
        border-radius: 12px;
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.28);
        font-size: 0.8rem;
        color: #fde68a;
      }

      /* Markdown Typography */
      .sap-markdown {
        color: var(--text-primary, #f8fafc);
        font-size: 0.94rem;
        line-height: 1.7;
      }

      .sap-md-h1 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.42rem;
        font-weight: 800;
        margin: 0 0 12px;
        background: linear-gradient(90deg, #f8fafc, #00f2fe);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .sap-md-h2 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.12rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
        margin: 18px 0 8px;
        padding-bottom: 5px;
        border-bottom: 1px solid rgba(0, 242, 254, 0.16);
      }

      .sap-md-h3 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1rem;
        font-weight: 700;
        color: var(--accent-gold, #f59e0b);
        margin: 14px 0 6px;
      }

      .sap-md-p {
        margin: 0 0 10px;
      }

      .sap-md-list {
        margin: 6px 0 12px 20px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .sap-md-quote {
        margin: 10px 0 14px;
        padding: 10px 14px;
        border-left: 3px solid var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.08);
        border-radius: 0 10px 10px 0;
        font-style: italic;
        color: #fef3c7;
      }

      .sap-md-hr {
        border: none;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin: 16px 0;
      }

      .sap-markdown code {
        padding: 2px 6px;
        border-radius: 6px;
        background: rgba(0, 242, 254, 0.1);
        color: var(--accent-cyan, #00f2fe);
        font-size: 0.86em;
      }

      /* Extracted Clickable Province Cards */
      .sap-provinces-section {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 16px;
      }

      .sap-provinces-title {
        font-size: 0.82rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary, #94a3b8);
        margin: 0 0 12px;
      }

      .sap-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(215px, 1fr));
        gap: 12px;
      }

      .sap-city-card {
        cursor: pointer;
        text-align: left;
        padding: 0;
        border-radius: 14px;
        overflow: hidden;
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        display: flex;
        flex-direction: column;
      }

      .sap-city-card:hover {
        transform: translateY(-3px);
        border-color: rgba(0, 242, 254, 0.55);
        box-shadow: 0 10px 26px rgba(0, 242, 254, 0.16);
      }

      .sap-card-media {
        position: relative;
        height: 86px;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.16), rgba(168, 85, 247, 0.2));
        overflow: hidden;
      }

      .sap-card-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .sap-card-plate {
        position: absolute;
        top: 8px;
        left: 8px;
        font-size: 0.72rem;
        font-weight: 800;
        padding: 3px 7px;
        border-radius: 6px;
        background: rgba(10, 15, 29, 0.82);
        color: #00f2fe;
        border: 1px solid rgba(0, 242, 254, 0.35);
      }

      .sap-card-status {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 0.69rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.88);
        color: #0f172a;
      }

      .sap-card-status.visited {
        background: rgba(16, 185, 129, 0.9);
        color: #052e16;
      }

      .sap-card-body {
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .sap-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .sap-card-name {
        font-weight: 700;
        font-size: 0.94rem;
      }

      .sap-card-km {
        font-size: 0.72rem;
        color: var(--accent-cyan, #00f2fe);
        font-weight: 600;
      }

      .sap-card-meta {
        font-size: 0.75rem;
        color: var(--text-secondary, #94a3b8);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sap-loading-box {
        padding: 34px 20px;
        text-align: center;
        border-radius: 18px;
        background: rgba(15, 23, 42, 0.75);
        border: 1px dashed rgba(0, 242, 254, 0.35);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.92rem;
      }

      /* Light theme adjustments */
      body.light-theme .sap-hero,
      body.light-theme .sap-form-card,
      body.light-theme .sap-result-card,
      body.light-theme .sap-api-drawer,
      body.light-theme .sap-loading-box {
        background: rgba(255, 255, 255, 0.88);
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
      }

      body.light-theme .sap-select,
      body.light-theme .sap-input,
      body.light-theme .sap-ghost-btn {
        background: rgba(248, 250, 252, 0.95);
        border-color: rgba(15, 23, 42, 0.16);
        color: #0f172a;
      }

      body.light-theme .sap-pill-btn,
      body.light-theme .sap-city-card {
        background: rgba(241, 245, 249, 0.85);
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      body.light-theme .sap-pill-btn.active {
        background: rgba(14, 165, 233, 0.14);
        border-color: #0284c7;
      }

      body.light-theme .sap-md-h1 {
        background: linear-gradient(90deg, #0f172a, #0284c7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .sap-md-h2,
      body.light-theme .sap-label,
      body.light-theme .sap-card-km {
        color: #0369a1;
      }

      body.light-theme .sap-md-quote {
        color: #78350f;
        background: rgba(245, 158, 11, 0.12);
      }

      body.light-theme .sap-offline-banner {
        color: #92400e;
        background: rgba(245, 158, 11, 0.14);
      }

      @media (max-width: 768px) {
        .sap-form-grid {
          grid-template-columns: 1fr;
        }
        .sap-hero,
        .sap-form-card,
        .sap-result-card {
          padding: 16px;
        }
        .sap-generate-btn {
          width: 100%;
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Main Module Renderer
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const escapeHtml = safeCtx.escapeHtml || fallbackEscape;
    const normFn = safeCtx.normalizeTurkish || fallbackNormalize;
    const distFn = safeCtx.calcDistKm || fallbackCalcDistKm;
    const notify = (msg) => {
      if (typeof safeCtx.showToast === 'function') safeCtx.showToast(msg);
    };

    const provinces = buildProvinceIndex(safeCtx);
    if (!uiState.startCityKey || !provinces.some((p) => p.key === uiState.startCityKey)) {
      uiState.startCityKey = findDefaultAnkara(provinces);
    }

    const visitedCount = provinces.filter((p) => p.visited).length;
    const unvisitedCount = provinces.length - visitedCount;

    function getSelectedOption(arr, id) {
      return arr.find((item) => item.id === id) || arr[0];
    }

    function renderView() {
      const hasKey = Boolean(getStoredGeminiKey());
      const startProv = provinces.find((p) => p.key === uiState.startCityKey) || provinces[0];

      const resultHtml = (() => {
        if (uiState.isGenerating) {
          return `
            <div class="sap-loading-box">
              <div style="font-size: 1.8rem; margin-bottom: 8px;">✨</div>
              <strong>Gemini AI & Anadolu Rota Motoru Sefer Planını Hazırlıyor...</strong>
              <div style="margin-top: 6px; font-size: 0.8rem;">81 il verisi, gezilmemiş duraklar ve 5 Gün Kuralı dengesi analiz ediliyor.</div>
            </div>
          `;
        }

        if (!uiState.result) return '';

        const res = uiState.result;
        const cards = startProv
          ? extractProvinceCardsFromMarkdown(res.markdown, provinces, startProv, distFn)
          : [];
        const mdHtml = renderMarkdownToHtml(res.markdown, escapeHtml);

        const cardsGridHtml = cards.length
          ? `
            <div class="sap-provinces-section">
              <h3 class="sap-provinces-title">📍 Planda Geçen Duraklar (${cards.length} İl • Detay İçin Tıklayın)</h3>
              <div class="sap-cards-grid">
                ${cards
                  .map(
                    (c) => `
                  <button type="button" class="sap-city-card" data-sap-city="${escapeHtml(c.key)}" title="${escapeHtml(c.name)} şehrini aç">
                    <div class="sap-card-media">
                      ${
                        c.thumb
                          ? `<img src="${escapeHtml(c.thumb)}" alt="${escapeHtml(c.name)}" loading="lazy" onerror="this.style.display='none'" />`
                          : ''
                      }
                      <span class="sap-card-plate">${escapeHtml(padPlate(c.plate))}</span>
                      <span class="sap-card-status ${c.visited ? 'visited' : ''}">${c.visited ? '✅ Gezildi' : '🧭 Keşif'}</span>
                    </div>
                    <div class="sap-card-body">
                      <div class="sap-card-head">
                        <span class="sap-card-name">${escapeHtml(c.name)}</span>
                        <span class="sap-card-km">${c.kmFromStart === 0 ? 'Başlangıç' : `~${formatTrNumber(c.kmFromStart)} km`}</span>
                      </div>
                      <div class="sap-card-meta">${escapeHtml(c.region)} • ${escapeHtml(c.highlight)}</div>
                    </div>
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
          : '';

        return `
          <article class="sap-result-card" aria-label="Üretilen Sefer Planı">
            <div class="sap-result-header">
              <div class="sap-result-meta">
                <span class="sap-meta-badge ${res.isLive ? 'live' : 'offline'}">
                  ${res.isLive ? `🟢 Gemini (${escapeHtml(res.modelUsed)})` : `⚡ ${escapeHtml(res.modelUsed)}`}
                </span>
                <span class="sap-meta-badge">📍 ${escapeHtml(res.meta.startCity)}</span>
                <span class="sap-meta-badge">🗓️ ${escapeHtml(res.meta.duration)}</span>
                <span class="sap-meta-badge">${escapeHtml(res.meta.focus)}</span>
                <span class="sap-meta-badge">${escapeHtml(res.meta.budget)}</span>
                ${res.createdAt ? `<span class="sap-meta-badge">🕒 ${escapeHtml(res.createdAt)}</span>` : ''}
              </div>
              <div class="sap-result-actions">
                <button type="button" class="sap-action-btn" data-sap-copy>📋 Kopyala</button>
                <button type="button" class="sap-action-btn gold" data-sap-download>📥 Markdown İndir</button>
              </div>
            </div>

            ${
              res.noKey
                ? `
              <div class="sap-offline-banner">
                <span>💡 Tarayıcınızda Gemini API anahtarı henüz tanımlı değil; plan yerel 81 il verisiyle anında üretildi.</span>
                <button type="button" class="sap-ghost-btn" data-sap-open-key style="padding: 5px 10px; font-size: 0.76rem;">🔑 API Anahtarı Gir</button>
              </div>
            `
                : ''
            }

            <div class="sap-markdown">${mdHtml}</div>
            ${cardsGridHtml}
          </article>
        `;
      })();

      container.innerHTML = `
        <section class="sap-shell" aria-label="AI Sefer ve 5 Gün Planlayıcı Stüdyosu">
          <header class="sap-hero">
            <div class="sap-hero-left">
              <div class="sap-hero-orb" aria-hidden="true">🧭</div>
              <div>
                <h2 class="sap-title">AI Sefer &amp; 5 Gün Planlayıcı Stüdyosu</h2>
                <p class="sap-subtitle">81 il envanterinle senkronize Gemini destekli akıllı sefer mimarı • ${visitedCount}/81 il gezildi, ${unvisitedCount} il keşif bekliyor</p>
              </div>
            </div>
            <div class="sap-hero-actions">
              <span class="sap-status-pill ${hasKey ? '' : 'is-offline'}" data-sap-key-badge>
                ${hasKey ? '🟢 Gemini API Anahtarı Kayıtlı' : '⚡ Çevrimdışı Hazır (API Anahtarsız)'}
              </span>
              <button type="button" class="sap-ghost-btn" data-sap-key-toggle>🔑 Gemini API Ayarı</button>
            </div>
          </header>

          <div class="sap-api-drawer" data-sap-api-drawer style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
              <strong style="font-size: 0.88rem; color: var(--accent-cyan, #00f2fe);">🔑 Google Gemini API Anahtarı (localStorage)</strong>
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style="font-size: 0.76rem; color: var(--accent-gold, #f59e0b); text-decoration: none;">Google AI Studio'dan Ücretsiz Anahtar Al ↗</a>
            </div>
            <p style="font-size: 0.77rem; color: var(--text-secondary, #94a3b8); margin: 6px 0 0;">
              Anahtarınız yalnızca tarayıcınızda (<code>dijital_seyyah_gemini_api_key</code>) saklanır. Otomatik model yedekleme sırası: <code>gemini-flash-lite-latest</code> → <code>gemini-3.5-flash-lite</code> → <code>gemini-3.8-flash</code>.
            </p>
            <div class="sap-api-row">
              <input type="password" class="sap-input" data-sap-key-input style="flex: 1; min-width: 220px;" placeholder="AIza... (Kişisel Gemini API anahtarı)" value="${escapeHtml(getStoredGeminiKey())}" />
              <button type="button" class="sap-action-btn" data-sap-key-save>Kaydet</button>
              <button type="button" class="sap-ghost-btn" data-sap-key-clear>Temizle</button>
            </div>
          </div>

          <form class="sap-form-card" data-sap-form>
            <div class="sap-form-grid">
              <div class="sap-field">
                <label class="sap-label" for="sap-start-city">
                  <span>Başlangıç Şehri</span>
                  <span class="sap-label-hint">81 İl</span>
                </label>
                <select id="sap-start-city" class="sap-select" data-sap-start-city>
                  ${provinces
                    .map(
                      (p) => `
                    <option value="${escapeHtml(p.key)}" ${p.key === uiState.startCityKey ? 'selected' : ''}>
                      ${escapeHtml(p.name)} (${padPlate(p.plate)} • ${p.visited ? 'Gezildi' : 'Keşfedilmedi'})
                    </option>
                  `
                    )
                    .join('')}
                </select>
              </div>

              <div class="sap-field">
                <label class="sap-label" for="sap-extra-note">
                  <span>Ek Not / Tercih</span>
                  <span class="sap-label-hint">Opsiyonel</span>
                </label>
                <input
                  id="sap-extra-note"
                  type="text"
                  class="sap-input"
                  data-sap-extra-note
                  value="${escapeHtml(uiState.extraNote)}"
                  placeholder="Örn: Trenle gitmek istiyorum, Güneydoğu illerine öncelik ver..."
                />
              </div>

              <div class="sap-field sap-field-full">
                <span class="sap-label">
                  <span>Sefer Süresi</span>
                  <span class="sap-label-hint">Gün ve durak yoğunluğu</span>
                </span>
                <div class="sap-pill-group" role="radiogroup" aria-label="Sefer Süresi">
                  ${DURATIONS.map(
                    (d) => `
                    <button type="button" class="sap-pill-btn ${uiState.durationId === d.id ? 'active' : ''}" data-sap-duration="${d.id}">
                      <span class="sap-pill-main">${escapeHtml(d.label)}</span>
                      <span class="sap-pill-sub">${escapeHtml(d.hint)}</span>
                    </button>
                  `
                  ).join('')}
                </div>
              </div>

              <div class="sap-field sap-field-full">
                <span class="sap-label">
                  <span>Seyyah Odağı</span>
                  <span class="sap-label-hint">Tema &amp; içerik önceliği</span>
                </span>
                <div class="sap-pill-group" role="radiogroup" aria-label="Seyyah Odağı">
                  ${FOCUSES.map(
                    (f) => `
                    <button type="button" class="sap-pill-btn ${uiState.focusId === f.id ? 'active' : ''}" data-sap-focus="${f.id}">
                      <span class="sap-pill-main">${escapeHtml(f.label)}</span>
                    </button>
                  `
                  ).join('')}
                </div>
              </div>

              <div class="sap-field sap-field-full">
                <span class="sap-label">
                  <span>Bütçe Modu</span>
                  <span class="sap-label-hint">Konaklama &amp; ulaşım dengesi</span>
                </span>
                <div class="sap-pill-group" role="radiogroup" aria-label="Bütçe Modu">
                  ${BUDGETS.map(
                    (b) => `
                    <button type="button" class="sap-pill-btn ${uiState.budgetId === b.id ? 'active' : ''}" data-sap-budget="${b.id}">
                      <span class="sap-pill-main">${escapeHtml(b.label)}</span>
                      <span class="sap-pill-sub">~${formatTrNumber(b.dailyTl)} ₺/gün hedef</span>
                    </button>
                  `
                  ).join('')}
                </div>
              </div>
            </div>

            <div class="sap-submit-row">
              <span class="sap-context-note">
                ${
                  hasKey
                    ? '🟢 Canlı Gemini AI + gerçek gezilmiş/gezilmemiş il bağlamı aktif.'
                    : '⚡ API anahtarı yoksa anında çevrimdışı 81 il planı üretilir.'
                }
              </span>
              <button type="submit" class="sap-generate-btn" data-sap-submit ${uiState.isGenerating ? 'disabled' : ''}>
                ${uiState.isGenerating ? '⏳ Plan Üretiliyor...' : '✨ Gemini ile Sefer Planı Üret'}
              </button>
            </div>
          </form>

          ${resultHtml}
        </section>
      `;

      bindEvents();
    }

    async function handleGenerate() {
      if (uiState.isGenerating || !provinces.length) return;

      const startProv = provinces.find((p) => p.key === uiState.startCityKey) || provinces[0];
      const duration = getSelectedOption(DURATIONS, uiState.durationId);
      const focus = getSelectedOption(FOCUSES, uiState.focusId);
      const budget = getSelectedOption(BUDGETS, uiState.budgetId);
      const extraNote = (uiState.extraNote || '').trim();
      const apiKey = getStoredGeminiKey();

      const meta = {
        startCity: startProv.name,
        duration: duration.label,
        focus: focus.label,
        budget: budget.shortLabel,
        slug: startProv.slug || normFn(startProv.name),
        days: duration.days
      };

      if (!apiKey) {
        const offlineRes = generateOfflinePlan(
          provinces,
          startProv,
          duration,
          focus,
          budget,
          extraNote,
          distFn,
          normFn,
          null
        );
        uiState.result = {
          markdown: offlineRes.markdown,
          modelUsed: offlineRes.modelUsed,
          isLive: false,
          noKey: true,
          createdAt: nowTimeStr(),
          meta
        };
        renderView();
        notify('⚡ Çevrimdışı 81 il verisiyle sefer planı hazırlandı!');
        return;
      }

      uiState.isGenerating = true;
      renderView();

      try {
        const { systemInstruction, userPrompt } = buildGeminiPromptPayload(
          provinces,
          startProv,
          duration,
          focus,
          budget,
          extraNote,
          distFn
        );
        const aiRes = await requestGeminiExpedition(apiKey, systemInstruction, userPrompt);
        uiState.result = {
          markdown: aiRes.markdown,
          modelUsed: aiRes.modelUsed,
          isLive: true,
          noKey: false,
          createdAt: nowTimeStr(),
          meta
        };
        notify(`✨ Sefer planı ${aiRes.modelUsed} ile üretildi!`);
      } catch (err) {
        const errMsg = (err && err.message) || 'Bağlantı hatası';
        notify(`⚠️ Gemini API hatası (${errMsg}) — Çevrimdışı yedek plan oluşturuldu.`);
        const offlineRes = generateOfflinePlan(
          provinces,
          startProv,
          duration,
          focus,
          budget,
          extraNote,
          distFn,
          normFn,
          errMsg
        );
        uiState.result = {
          markdown: offlineRes.markdown,
          modelUsed: offlineRes.modelUsed,
          isLive: false,
          noKey: false,
          createdAt: nowTimeStr(),
          meta
        };
      } finally {
        uiState.isGenerating = false;
        renderView();
      }
    }

    function bindEvents() {
      const form = container.querySelector('[data-sap-form]');
      const startSelect = container.querySelector('[data-sap-start-city]');
      const noteInput = container.querySelector('[data-sap-extra-note]');
      const apiDrawer = container.querySelector('[data-sap-api-drawer]');
      const keyToggleBtn = container.querySelector('[data-sap-key-toggle]');
      const openKeyBtn = container.querySelector('[data-sap-open-key]');
      const keyInput = container.querySelector('[data-sap-key-input]');
      const keySaveBtn = container.querySelector('[data-sap-key-save]');
      const keyClearBtn = container.querySelector('[data-sap-key-clear]');
      const copyBtn = container.querySelector('[data-sap-copy]');
      const downloadBtn = container.querySelector('[data-sap-download]');

      function toggleDrawer(forceOpen) {
        if (!apiDrawer) return;
        const hidden = apiDrawer.style.display === 'none';
        apiDrawer.style.display = forceOpen === true ? 'block' : hidden ? 'block' : 'none';
        if (apiDrawer.style.display === 'block' && keyInput) keyInput.focus();
      }

      if (keyToggleBtn) keyToggleBtn.addEventListener('click', () => toggleDrawer());
      if (openKeyBtn) openKeyBtn.addEventListener('click', () => toggleDrawer(true));

      if (keySaveBtn && keyInput) {
        keySaveBtn.addEventListener('click', () => {
          setStoredGeminiKey(keyInput.value);
          notify('🔑 Gemini API anahtarı kaydedildi!');
          renderView();
        });
      }

      if (keyClearBtn && keyInput) {
        keyClearBtn.addEventListener('click', () => {
          setStoredGeminiKey('');
          notify('🗑️ Gemini API anahtarı temizlendi.');
          renderView();
        });
      }

      if (startSelect) {
        startSelect.addEventListener('change', (e) => {
          uiState.startCityKey = e.target.value;
        });
      }

      if (noteInput) {
        noteInput.addEventListener('input', (e) => {
          uiState.extraNote = e.target.value;
        });
      }

      container.querySelectorAll('[data-sap-duration]').forEach((btn) => {
        btn.addEventListener('click', () => {
          uiState.durationId = btn.getAttribute('data-sap-duration');
          container.querySelectorAll('[data-sap-duration]').forEach((b) =>
            b.classList.toggle('active', b === btn)
          );
        });
      });

      container.querySelectorAll('[data-sap-focus]').forEach((btn) => {
        btn.addEventListener('click', () => {
          uiState.focusId = btn.getAttribute('data-sap-focus');
          container.querySelectorAll('[data-sap-focus]').forEach((b) =>
            b.classList.toggle('active', b === btn)
          );
        });
      });

      container.querySelectorAll('[data-sap-budget]').forEach((btn) => {
        btn.addEventListener('click', () => {
          uiState.budgetId = btn.getAttribute('data-sap-budget');
          container.querySelectorAll('[data-sap-budget]').forEach((b) =>
            b.classList.toggle('active', b === btn)
          );
        });
      });

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          handleGenerate();
        });
      }

      if (copyBtn && uiState.result) {
        copyBtn.addEventListener('click', async () => {
          const ok = await copyMarkdownText(uiState.result.markdown);
          if (ok) {
            copyBtn.textContent = '✅ Kopyalandı';
            notify('📋 Sefer planı panoya kopyalandı!');
            setTimeout(() => {
              if (copyBtn.isConnected) copyBtn.textContent = '📋 Kopyala';
            }, 1800);
          } else {
            notify('⚠️ Pano erişimi sağlanamadı.');
          }
        });
      }

      if (downloadBtn && uiState.result) {
        downloadBtn.addEventListener('click', () => {
          const m = uiState.result.meta || {};
          const fname = `sefer-plani-${m.slug || 'anadolu'}-${m.days || 5}-gun.md`;
          downloadMarkdownFile(fname, uiState.result.markdown);
          notify(`📥 ${fname} indirildi!`);
        });
      }

      container.querySelectorAll('[data-sap-city]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-sap-city');
          if (key && typeof safeCtx.selectCity === 'function') {
            safeCtx.selectCity(key);
          }
        });
      });
    }

    renderView();
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.aiPlanner = { render };
})();
