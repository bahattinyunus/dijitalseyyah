/**
 * Anadolu Seyahatnamesi — Sonsuz AI Anadolu Kültür & Tarih Yarışması
 * Powered by window.SEYYAH_AI with resilient offline synthesis from ctx.data.provinces.
 * Registers on: window.SEYYAH_MODULES.aiQuiz = { render(container, ctx) }
 */
(function () {
  'use strict';

  const STYLE_ID = 'seyyah-ai-quiz-styles';
  const BEST_SCORE_STORAGE = 'dijital_seyyah_ai_quiz_best';
  const MAX_RECENT_HISTORY = 16;

  const DIFFICULTIES = [
    {
      id: 'cirak',
      icon: '🌱',
      label: '🌱 Çırak',
      shortLabel: 'Çırak',
      points: 100,
      desc: 'Temel Anadolu bilgisi, meşhur eserler ve bilinen şehir özellikleri'
    },
    {
      id: 'kalfa',
      icon: '🧭',
      label: '🧭 Kalfa',
      shortLabel: 'Kalfa',
      points: 150,
      desc: 'Derin kültür, bölgesel bağlam, yöresel lezzetler ve tarihî duraklar'
    },
    {
      id: 'evliya',
      icon: '👑',
      label: '👑 Evliya Çelebi',
      shortLabel: 'Evliya Çelebi',
      points: 200,
      desc: 'İnce tarihî ayrıntılar, tasavvufî miras ve ustalık gerektiren sorular'
    }
  ];

  const CATEGORIES = [
    {
      id: 'genel',
      icon: '🇹🇷',
      label: '🇹🇷 81 İl Genel',
      shortLabel: '81 İl Genel',
      promptFocus: 'Türkiye’nin 81 ilinin tarihi, coğrafyası, plakası, kültürü, kütüphaneleri ve genel seyahatname birikimi'
    },
    {
      id: 'tarih',
      icon: '🏛️',
      label: '🏛️ Tarih & UNESCO',
      shortLabel: 'Tarih & UNESCO',
      promptFocus: 'Anadolu uygarlıkları, Selçuklu ve Osmanlı mirası, antik kentler, kaleler, camiler, medreseler ve UNESCO Dünya Mirası alanları'
    },
    {
      id: 'mutfak',
      icon: '🍽️',
      label: '🍽️ Anadolu Mutfağı',
      shortLabel: 'Anadolu Mutfağı',
      promptFocus: 'Coğrafi işaretli yöresel yemekler, tatlılar, çorbalar, kahveler ve Anadolu şehirlerinin özgün gastronomi kültürü'
    },
    {
      id: 'tasavvuf',
      icon: '🕌',
      label: '🕌 Tasavvuf & İrfan',
      shortLabel: 'Tasavvuf & İrfan',
      promptFocus: 'Anadolu erenleri, mutasavvıflar, âlimler, âşıklar, şairler, külliyeler, tekkeler, ahilik ve irfan mirası'
    },
    {
      id: 'doga',
      icon: '🌲',
      label: '🌲 Doğa & Coğrafya',
      shortLabel: 'Doğa & Coğrafya',
      promptFocus: 'Dağlar, göller, kanyonlar, şelaleler, mağaralar, yaylalar, millî parklar, nehirler ve coğrafi konumlar'
    }
  ];

  const CITY_ALIASES = {
    icel: 'mersin',
    afyon: 'afyonkarahisar',
    urfa: 'sanliurfa',
    antep: 'gaziantep',
    maras: 'kahramanmaras',
    izmit: 'kocaeli',
    adapazari: 'sakarya',
    antakya: 'hatay'
  };

  const LETTERS = ['A', 'B', 'C', 'D'];

  const state = {
    difficulty: 'kalfa',
    category: 'genel',
    score: 0,
    bestScore: loadBestScore(),
    streak: 0,
    maxStreak: 0,
    answeredCount: 0,
    correctCount: 0,
    newRecordHit: false,
    isLoading: false,
    requestSeq: 0,
    currentQuestion: null, // { question, options, correctIndex, explanation, cityName, matchedKey, matchedProvince, source, fallbackReason, difficultyId, categoryId }
    selectedIndex: null,
    isAnswered: false,
    lastPointsEarned: 0,
    recentCities: [],
    recentSignatures: new Set(),
    container: null,
    ctx: null,
    keyHandler: null
  };

  // ---------------------------------------------------------------------------
  // Storage & Safe Helpers
  // ---------------------------------------------------------------------------
  function loadBestScore() {
    try {
      const parsed = parseInt(localStorage.getItem(BEST_SCORE_STORAGE) || '0', 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBestScore(value) {
    try {
      localStorage.setItem(BEST_SCORE_STORAGE, String(value));
    } catch (e) {
      // Ignore storage errors in restricted environments
    }
  }

  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function esc(str) {
    if (state.ctx && typeof state.ctx.escapeHtml === 'function') {
      return state.ctx.escapeHtml(str);
    }
    return fallbackEscapeHtml(str);
  }

  function fallbackNormalizeTurkish(str) {
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

  function norm(str) {
    if (state.ctx && typeof state.ctx.normalizeTurkish === 'function') {
      return state.ctx.normalizeTurkish(str);
    }
    return fallbackNormalizeTurkish(str);
  }

  function notify(msg) {
    if (state.ctx && typeof state.ctx.showToast === 'function') {
      state.ctx.showToast(msg);
    }
  }

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function padPlate(plate) {
    return String(plate || '').padStart(2, '0');
  }

  function getDifficultyMeta(id) {
    return DIFFICULTIES.find((d) => d.id === id) || DIFFICULTIES[1];
  }

  function getCategoryMeta(id) {
    return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
  }

  function getStreakMultiplier(streak) {
    if (!streak || streak < 2) return 1;
    return Math.min(5, streak);
  }

  function getAccuracyPct() {
    if (!state.answeredCount) return 0;
    return Math.round((state.correctCount / state.answeredCount) * 100);
  }

  // ---------------------------------------------------------------------------
  // Province Index & Matching
  // ---------------------------------------------------------------------------
  function getProvinceList(ctx) {
    const safeCtx = ctx || {};
    const data = safeCtx.data || (safeCtx.state && safeCtx.state.data) || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const raw = (data && data.provinces) || {};
    return Object.entries(raw)
      .filter(([, p]) => p && p.name)
      .map(([key, p]) => ({
        key,
        ...p,
        landmarks: Array.isArray(p.landmarks) ? p.landmarks : [],
        specialties: Array.isArray(p.specialties) ? p.specialties : [],
        spiritual_figures: Array.isArray(p.spiritual_figures) ? p.spiritual_figures : [],
        literary_quotes: Array.isArray(p.literary_quotes) ? p.literary_quotes : [],
        five_day_plan: Array.isArray(p.five_day_plan) ? p.five_day_plan : [],
        normName: norm(p.name)
      }));
  }

  function resolveProvinceByCityName(provinces, cityName) {
    if (!cityName || !provinces.length) return null;
    const cleaned = String(cityName).replace(/\([^)]*\)/g, ' ').replace(/\bili\b|\bşehri\b|\bsehri\b/gi, ' ').trim();
    const n = norm(cleaned);
    if (!n) return null;

    const aliased = CITY_ALIASES[n] || n;
    let match = provinces.find((p) => p.normName === aliased || p.normName === n);
    if (match) return match;

    if (aliased.length >= 4) {
      match = provinces.find((p) => p.normName.includes(aliased) || aliased.includes(p.normName));
    }
    return match || null;
  }

  function maskCityName(text, cityName) {
    if (!text || !cityName) return text || '';
    const escaped = String(cityName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Replace Turkish-cased mentions of the city name (including suffixes like "'de", "'in", "'a")
    const rx = new RegExp(`\\b${escaped}(?:'?[a-zçğıöşüA-ZÇĞIÖŞÜ]{0,5})\\b`, 'gi');
    return String(text).replace(rx, 'bu kadim ilimiz');
  }

  // ---------------------------------------------------------------------------
  // Robust JSON Extraction & Validation for SEYYAH_AI.ask
  // ---------------------------------------------------------------------------
  function extractRawText(raw) {
    if (raw == null) return '';
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'object') {
      if (typeof raw.question === 'string' && Array.isArray(raw.options)) {
        return raw;
      }
      const candidates = [raw.text, raw.content, raw.reply, raw.answer, raw.response, raw.output, raw.result, raw.data];
      for (let i = 0; i < candidates.length; i++) {
        if (typeof candidates[i] === 'string' && candidates[i].trim()) {
          return candidates[i];
        }
      }
      try {
        return JSON.stringify(raw);
      } catch (e) {
        return '';
      }
    }
    return String(raw);
  }

  function findBalancedJsonObjects(str) {
    const results = [];
    let depth = 0;
    let start = -1;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === '"') {
          inString = false;
        }
        continue;
      }
      if (ch === '"') {
        inString = true;
      } else if (ch === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (ch === '}') {
        if (depth > 0) {
          depth--;
          if (depth === 0 && start !== -1) {
            results.push(str.slice(start, i + 1));
            start = -1;
          }
        }
      }
    }
    return results;
  }

  function tryJsonParse(candidate) {
    if (!candidate || typeof candidate !== 'string') return null;
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // Retry after stripping trailing commas before } or ]
      try {
        const cleaned = candidate.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(cleaned);
      } catch (e2) {
        return null;
      }
    }
  }

  function validateQuestionPayload(obj, provinces) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;

    const question = typeof obj.question === 'string' ? obj.question.trim() : '';
    if (question.length < 10) return null;

    if (!Array.isArray(obj.options) || obj.options.length !== 4) return null;
    const options = obj.options.map((opt) => (opt == null ? '' : String(opt).trim()));
    if (options.some((opt) => opt.length === 0)) return null;

    const uniqueOptions = new Set(options.map((o) => norm(o)));
    if (uniqueOptions.size < 4) return null;

    let correctIndex = obj.correctIndex;
    if (typeof correctIndex === 'string' && /^[0-3]$/.test(correctIndex.trim())) {
      correctIndex = Number(correctIndex.trim());
    }
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) return null;

    const cityNameRaw = typeof obj.cityName === 'string' ? obj.cityName.trim() : '';
    const matched = resolveProvinceByCityName(provinces, cityNameRaw)
      || resolveProvinceByCityName(provinces, options[correctIndex]);
    const cityName = cityNameRaw || (matched ? matched.name : '');
    if (!cityName) return null;

    let explanation = typeof obj.explanation === 'string' ? obj.explanation.trim() : '';
    if (!explanation) {
      explanation = matched && matched.quote
        ? `${matched.name}: ${matched.quote}`
        : `${cityName}, Anadolu kültür ve tarih coğrafyasının özgün duraklarından biridir.`;
    }

    return {
      question,
      options,
      correctIndex,
      explanation,
      cityName,
      matchedKey: matched ? matched.key : null,
      matchedProvince: matched || null
    };
  }

  function parseAIQuizResponse(raw, provinces) {
    const extracted = extractRawText(raw);
    if (!extracted) return null;

    if (typeof extracted === 'object') {
      return validateQuestionPayload(extracted, provinces);
    }

    let text = extracted.trim();
    // Strip markdown code fences if present
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch && fenceMatch[1]) {
      const parsedFromFence = tryJsonParse(fenceMatch[1].trim());
      const validated = validateQuestionPayload(parsedFromFence, provinces);
      if (validated) return validated;
    }

    const strippedFences = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const directParsed = tryJsonParse(strippedFences);
    const directValid = validateQuestionPayload(directParsed, provinces);
    if (directValid) return directValid;

    // Scan balanced JSON blocks anywhere in prose
    const blocks = findBalancedJsonObjects(text);
    for (let i = 0; i < blocks.length; i++) {
      const parsed = tryJsonParse(blocks[i]);
      const validated = validateQuestionPayload(parsed, provinces);
      if (validated) return validated;
    }

    // Last resort: first { to last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const sliced = tryJsonParse(text.slice(firstBrace, lastBrace + 1));
      const validated = validateQuestionPayload(sliced, provinces);
      if (validated) return validated;
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // AI Prompt Builder & Caller
  // ---------------------------------------------------------------------------
  function buildAIPrompt(provinces, difficultyId, categoryId) {
    const diff = getDifficultyMeta(difficultyId);
    const cat = getCategoryMeta(categoryId);

    const avoidList = state.recentCities.slice(-10).join(', ');
    const sampleProvs = shuffle(provinces).slice(0, 6).map((p) => {
      const lm = p.landmarks.slice(0, 2).join(', ');
      const sp = p.specialties.slice(0, 2).join(', ');
      return `${p.name} (${padPlate(p.plate)}, ${p.region}${lm ? ', eser: ' + lm : ''}${sp ? ', lezzet: ' + sp : ''})`;
    }).join(' | ');

    const systemInstruction = [
      'Sen "Dijital Seyyah: Anadolu Seyahatnamesi" uygulamasının bilgi yarışması küratörüsün.',
      'Görevin Türkiye’nin 81 ili hakkında tarihsel ve kültürel açıdan doğru, özgün, tek doğru cevaplı çoktan seçmeli soru üretmektir.',
      'Yanıtın SADECE ve YALNIZCA geçerli bir JSON nesnesi olmalı; başka hiçbir açıklama, selamlama veya ek metin yazma.'
    ].join('\n');

    const prompt = [
      `Kategori: ${cat.label} — Odak: ${cat.promptFocus}.`,
      `Zorluk Seviyesi: ${diff.label} (${diff.desc}).`,
      avoidList ? `Mümkünse son sorulan şu şehirleri tekrar etme: ${avoidList}.` : '',
      sampleProvs ? `İlham için örnek il havuzu: ${sampleProvs}. (81 ilden dilediğin birini seçebilirsin.)` : '',
      '',
      'Aşağıdaki şemaya birebir uyan tek bir JSON nesnesi üret:',
      '{',
      '  "question": "Türkçe, net ve tek doğru cevabı olan soru metni",',
      '  "options": ["Seçenek A", "Seçenek B", "Seçenek C", "Seçenek D"],',
      '  "correctIndex": 0,',
      '  "explanation": "Cevabı açıklayan 2-3 cümlelik zengin kültürel/tarihî bilgi",',
      '  "cityName": "Sorunun odağındaki Türkiye ili adı (ör. Konya)"',
      '}',
      '',
      'Kurallar:',
      '- "options" dizisi mutlaka birbirinden farklı 4 seçenek içermelidir.',
      '- "correctIndex" 0, 1, 2 veya 3 tam sayısı olmalıdır.',
      '- Çeldiriciler gerçekçi ve aynı kategoriyle uyumlu olmalıdır.',
      '- Bilgi hatası yapma; kesin doğruluğundan emin olduğun tarihî/coğrafî bilgileri kullan.'
    ].filter(Boolean).join('\n');

    return { systemInstruction, prompt };
  }

  function checkAIStatus() {
    const ai = window.SEYYAH_AI;
    if (!ai || typeof ai.ask !== 'function') {
      return { available: false, reason: 'SEYYAH_AI modülü yüklü değil' };
    }
    if (typeof ai.hasKey === 'function' && !ai.hasKey()) {
      return { available: false, reason: 'Gemini API anahtarı tanımlı değil' };
    }
    if (typeof ai.isReady === 'function' && !ai.isReady()) {
      return { available: false, reason: 'AI servisi henüz hazır değil' };
    }
    return { available: true, reason: '' };
  }

  async function requestAIQuestion(provinces, difficultyId, categoryId) {
    const status = checkAIStatus();
    if (!status.available) {
      throw new Error(status.reason || 'AI_UNAVAILABLE');
    }
    const { systemInstruction, prompt } = buildAIPrompt(provinces, difficultyId, categoryId);
    const raw = await window.SEYYAH_AI.ask({
      prompt,
      system: systemInstruction,
      temperature: 0.85,
      maxTokens: 900
    });

    const parsed = parseAIQuizResponse(raw, provinces);
    if (!parsed) {
      throw new Error('AI_JSON_PARSE_ERROR');
    }
    return parsed;
  }

  // ---------------------------------------------------------------------------
  // Offline Dynamic Fallback Question Synthesizer (Uses ctx.data.provinces)
  // ---------------------------------------------------------------------------
  function parseSpiritualEntry(raw) {
    if (!raw) return null;
    const cleaned = String(raw).replace(/\*\*/g, '').trim();
    const colonIdx = cleaned.indexOf(':');
    if (colonIdx > 1 && colonIdx < 80) {
      return {
        name: cleaned.slice(0, colonIdx).trim(),
        desc: cleaned.slice(colonIdx + 1).trim()
      };
    }
    return { name: cleaned.slice(0, 60).trim(), desc: '' };
  }

  function isNaturalLandmark(item) {
    return /dağ|göl|kanyon|şelale|mağara|yayla|nehir|boğaz|ada|körfez|milli park|krater|vadi|plaj|kuş|orman|obruk|peri|kaplıca|termal|delta|falez|koy|ırmak|akarsu|zirve/i.test(String(item || ''));
  }

  function isHistoricLandmark(item) {
    return /cami|kale|antik|müze|medrese|köprü|saray|külliy|tapınak|höyük|han|kilise|manastır|türbe|hamam|tiyatro|unesco|surları|konak|çarşı|saat kulesi|abide|anıt|mezar|harabe/i.test(String(item || ''));
  }

  function pickDistractorProvinces(provinces, target, count, difficultyId, filterFn) {
    let pool = provinces.filter((p) => p.key !== target.key && (!filterFn || filterFn(p)));
    if (pool.length < count) {
      pool = provinces.filter((p) => p.key !== target.key);
    }
    // In Evliya Çelebi difficulty, bias towards same-region distractors for higher challenge
    if (difficultyId === 'evliya') {
      const sameRegion = pool.filter((p) => p.region === target.region);
      const others = pool.filter((p) => p.region !== target.region);
      return shuffle(sameRegion).concat(shuffle(others)).slice(0, count);
    }
    return shuffle(pool).slice(0, count);
  }

  function buildCityChoiceQuestion(provinces, target, questionText, explanation, difficultyId, signature, extraFilter) {
    const distractors = pickDistractorProvinces(provinces, target, 3, difficultyId, extraFilter);
    if (distractors.length < 3) return null;
    const mixed = shuffle([target, ...distractors]);
    const correctIndex = mixed.findIndex((p) => p.key === target.key);
    return {
      question: questionText,
      options: mixed.map((p) => p.name),
      correctIndex,
      explanation,
      cityName: target.name,
      matchedKey: target.key,
      matchedProvince: target,
      signature
    };
  }

  function buildItemChoiceQuestion(provinces, target, correctItem, itemExtractor, questionText, explanation, difficultyId, signature) {
    const normCorrect = norm(correctItem);
    const otherItems = [];
    const seen = new Set([normCorrect]);

    const pool = difficultyId === 'evliya'
      ? shuffle(provinces.filter((p) => p.key !== target.key && p.region === target.region))
          .concat(shuffle(provinces.filter((p) => p.key !== target.key && p.region !== target.region)))
      : shuffle(provinces.filter((p) => p.key !== target.key));

    for (let i = 0; i < pool.length && otherItems.length < 3; i++) {
      const candidates = itemExtractor(pool[i]) || [];
      for (let j = 0; j < candidates.length; j++) {
        const val = String(candidates[j] || '').trim();
        const nv = norm(val);
        if (val && !seen.has(nv)) {
          seen.add(nv);
          otherItems.push(val);
          break;
        }
      }
    }
    if (otherItems.length < 3) return null;

    const mixed = shuffle([{ val: correctItem, ok: true }, ...otherItems.map((val) => ({ val, ok: false }))]);
    return {
      question: questionText,
      options: mixed.map((x) => x.val),
      correctIndex: mixed.findIndex((x) => x.ok),
      explanation,
      cityName: target.name,
      matchedKey: target.key,
      matchedProvince: target,
      signature
    };
  }

  function synthesizeHistorySentence(p) {
    if (!p.history) return '';
    const sentences = String(p.history)
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 45 && s.length <= 240);
    if (!sentences.length) return '';
    const chosen = pickRandom(sentences);
    return maskCityName(chosen, p.name);
  }

  function synthesizeFallbackQuestion(provinces, difficultyId, categoryId) {
    if (!provinces || provinces.length < 4) return null;

    const recentSet = new Set(state.recentCities.slice(-12).map((c) => norm(c)));
    const freshFirst = (arr) => {
      const fresh = arr.filter((p) => !recentSet.has(p.normName));
      return fresh.length ? fresh : arr;
    };

    const generators = [];

    if (categoryId === 'tarih' || categoryId === 'genel') {
      generators.push(() => {
        const eligible = freshFirst(provinces.filter((p) => p.landmarks.some(isHistoricLandmark)));
        const target = pickRandom(eligible.length ? eligible : provinces.filter((p) => p.landmarks.length > 0));
        if (!target || !target.landmarks.length) return null;
        const historicList = target.landmarks.filter(isHistoricLandmark);
        const lmPool = historicList.length ? historicList : target.landmarks;
        const lm = difficultyId === 'cirak' ? lmPool[0] : pickRandom(lmPool);
        const sig = `tarih-lm-${target.key}-${norm(lm)}`;
        const hint = difficultyId === 'cirak' ? ` (${target.region} Bölgesi)` : '';
        const q = `Tarihî ve kültürel miras duraklarından "${lm}" hangi ilimizde bulunmaktadır?${hint}`;
        const exp = target.history
          ? `${target.name} (${padPlate(target.plate)}): ${target.history.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')}`
          : `${lm}, ${target.name} ilimizin öne çıkan tarihî değerlerinden biridir.`;
        return buildCityChoiceQuestion(
          provinces,
          target,
          q,
          exp,
          difficultyId,
          sig,
          (other) => !other.landmarks.some((x) => norm(x) === norm(lm))
        );
      });

      generators.push(() => {
        const eligible = freshFirst(provinces.filter((p) => p.history && p.history.length > 80));
        if (!eligible.length) return null;
        const target = pickRandom(eligible);
        const snippet = synthesizeHistorySentence(target);
        if (!snippet) return null;
        const sig = `tarih-hist-${target.key}`;
        const q = `Tarihî geçmişi şu satırlarla anlatılan Anadolu şehrimiz hangisidir?\n«${snippet}»`;
        const exp = `${target.name} (${target.region}), ${target.landmarks.slice(0, 3).join(', ')} gibi tarihî duraklarıyla öne çıkar.`;
        return buildCityChoiceQuestion(provinces, target, q, exp, difficultyId, sig);
      });
    }

    if (categoryId === 'mutfak' || categoryId === 'genel') {
      generators.push(() => {
        const eligible = freshFirst(provinces.filter((p) => p.specialties.length > 0));
        if (!eligible.length) return null;
        const target = pickRandom(eligible);
        const dish = difficultyId === 'cirak'
          ? target.specialties[0]
          : pickRandom(target.specialties);
        const sig = `mutfak-dish-${target.key}-${norm(dish)}`;
        const regionClue = difficultyId === 'cirak' ? ` (${target.region} Bölgesi)` : '';
        const q = `Anadolu mutfağının sevilen lezzetlerinden "${dish}" hangi ilimizle özdeşleşmiştir?${regionClue}`;
        const allDishes = target.specialties.join(', ');
        const exp = `${dish}, ${target.name} mutfağının baş tacıdır. Şehrin diğer meşhur tatları arasında ${allDishes} yer alır.`;
        return buildCityChoiceQuestion(
          provinces,
          target,
          q,
          exp,
          difficultyId,
          sig,
          (other) => !other.specialties.some((s) => norm(s) === norm(dish))
        );
      });

      generators.push(() => {
        const eligible = freshFirst(provinces.filter((p) => p.specialties.length > 0));
        if (!eligible.length) return null;
        const target = pickRandom(eligible);
        const dish = pickRandom(target.specialties);
        const sig = `mutfak-rev-${target.key}-${norm(dish)}`;
        const q = `${target.name} (${padPlate(target.plate)}) sofrasını ziyaret eden bir seyyah, aşağıdaki yöresel lezzetlerden hangisini özellikle bu şehirde tadar?`;
        const exp = `${target.name} (${target.region}), ${target.specialties.join(', ')} lezzetleriyle Anadolu gastronomi haritasında özel bir yere sahiptir.`;
        return buildItemChoiceQuestion(
          provinces,
          target,
          dish,
          (other) => other.specialties,
          q,
          exp,
          difficultyId,
          sig
        );
      });
    }

    if (categoryId === 'tasavvuf' || categoryId === 'genel') {
      generators.push(() => {
        const eligible = freshFirst(provinces.filter((p) => p.spiritual_figures.length > 0));
        if (!eligible.length) return null;
        const target = pickRandom(eligible);
        const rawFig = difficultyId === 'cirak' ? target.spiritual_figures[0] : pickRandom(target.spiritual_figures);
        const fig = parseSpiritualEntry(rawFig);
        if (!fig || !fig.name) return null;
        const maskedName = maskCityName(fig.name, target.name);
        const clue = fig.desc && difficultyId !== 'evliya'
          ? `\nİpucu: ${maskCityName(fig.desc.split(/(?<=[.!?])\s+/)[0], target.name)}`
          : '';
        const sig = `tasavvuf-fig-${target.key}-${norm(fig.name)}`;
        const q = `Anadolu irfan ve gönül dünyasında iz bırakan "${maskedName}" hangi şehrimizin manevi mirasıyla bütünleşmiştir?${clue}`;
        const exp = `${fig.name} — ${fig.desc || `${target.name} şehrinin manevi hafızasını şekillendiren önemli değerlerdendir.`}`;
        return buildCityChoiceQuestion(provinces, target, q, exp, difficultyId, sig);
      });

      generators.push(() => {
        const eligible = freshFirst(provinces.filter((p) => p.spiritual_figures.length > 0));
        if (!eligible.length) return null;
        const target = pickRandom(eligible);
        const fig = parseSpiritualEntry(pickRandom(target.spiritual_figures));
        if (!fig || !fig.name) return null;
        const sig = `tasavvuf-rev-${target.key}-${norm(fig.name)}`;
        const q = `${target.name} ilimizin manevi ve kültürel hafızasında yer edinen şahsiyet/değer aşağıdakilerden hangisidir?`;
        const exp = `${fig.name}: ${fig.desc || `${target.name} (${target.region}) gönül coğrafyasının müstesna simalarındandır.`}`;
        return buildItemChoiceQuestion(
          provinces,
          target,
          fig.name,
          (other) => other.spiritual_figures.map((r) => (parseSpiritualEntry(r) || {}).name).filter(Boolean),
          q,
          exp,
          difficultyId,
          sig
        );
      });
    }

    if (categoryId === 'doga' || categoryId === 'genel') {
      generators.push(() => {
        const eligible = freshFirst(provinces.filter((p) => p.landmarks.some(isNaturalLandmark)));
        const fallbackPool = eligible.length ? eligible : freshFirst(provinces.filter((p) => p.landmarks.length > 0));
        if (!fallbackPool.length) return null;
        const target = pickRandom(fallbackPool);
        const natList = target.landmarks.filter(isNaturalLandmark);
        const chosen = natList.length ? pickRandom(natList) : pickRandom(target.landmarks);
        const sig = `doga-lm-${target.key}-${norm(chosen)}`;
        const regionHint = difficultyId === 'cirak' ? ` (${target.region} Bölgesi)` : '';
        const q = `Türkiye'nin eşsiz doğa ve coğrafya duraklarından "${chosen}" hangi ilimiz sınırları içindedir?${regionHint}`;
        const exp = `${chosen}, ${target.region} Bölgesi'ndeki ${target.name} (${padPlate(target.plate)}) ilimizin öne çıkan doğal ve coğrafi miraslarındandır. ${target.quote || ''}`.trim();
        return buildCityChoiceQuestion(
          provinces,
          target,
          q,
          exp,
          difficultyId,
          sig,
          (other) => !other.landmarks.some((x) => norm(x) === norm(chosen))
        );
      });

      generators.push(() => {
        const eligible = freshFirst(provinces.filter((p) => p.landmarks.length > 0 && p.specialties.length > 0));
        if (!eligible.length) return null;
        const target = pickRandom(eligible);
        const lm = pickRandom(target.landmarks);
        const sp = pickRandom(target.specialties);
        const plateClue = difficultyId === 'cirak' ? ` ve ${padPlate(target.plate)} plaka kodu` : '';
        const sig = `doga-geo-${target.key}`;
        const q = `${target.region} Bölgesi'nde yer alan, ${lm}${plateClue} ve ${sp} ile tanınan ilimiz hangisidir?`;
        const exp = `${target.name} (${padPlate(target.plate)}), ${target.region} Bölgesi'nin nadide şehirlerindendir. ${target.quote || ''}`.trim();
        return buildCityChoiceQuestion(provinces, target, q, exp, difficultyId, sig);
      });
    }

    if (categoryId === 'genel') {
      generators.push(() => {
        const eligible = freshFirst(provinces.filter((p) => p.plate != null));
        if (!eligible.length) return null;
        const target = pickRandom(eligible);
        const plateStr = padPlate(target.plate);
        const sig = `genel-plate-${target.key}`;
        const clue = difficultyId === 'cirak' && target.landmarks[0]
          ? ` (${target.landmarks[0]} ile bilinen)`
          : '';
        const q = `${plateStr} plaka koduna sahip${clue} Anadolu ilimiz hangisidir?`;
        const exp = `${plateStr} plaka kodu ${target.name} (${target.region}) ilimize aittir. Öne çıkan durakları: ${target.landmarks.slice(0, 3).join(', ')}.`;
        return buildCityChoiceQuestion(provinces, target, q, exp, difficultyId, sig);
      });

      // 5 Gün Kuralı Planı Generator
      generators.push(() => {
        const eligible = freshFirst(provinces.filter((p) => p.five_day_plan && p.five_day_plan.length >= 2));
        if (!eligible.length) return null;
        const target = pickRandom(eligible);
        const rawPlan = pickRandom(target.five_day_plan);
        const cleanPlan = String(rawPlan || '').replace(/\*\*/g, '').trim();
        if (cleanPlan.length < 24) return null;
        const maskedPlan = maskCityName(cleanPlan, target.name);
        const sig = `genel-plan-${target.key}-${norm(cleanPlan).slice(0, 20)}`;
        const regionHint = difficultyId === 'cirak' ? ` (${target.region} Bölgesi)` : '';
        const q = `Dijital Seyyah "5 Gün Kuralı" rotasında şu gün planı hangi ilimize aittir?${regionHint}\n«${maskedPlan}»`;
        const exp = `Bu 5 günlük keşif rotası ${target.name} (${padPlate(target.plate)}) ilimize aittir. Şehrin öne çıkan durakları: ${target.landmarks.slice(0, 3).join(', ')}.`;
        return buildCityChoiceQuestion(provinces, target, q, exp, difficultyId, sig);
      });

      // Kütüphane & Dijital Göçebe Çalışma Durağı Generator
      generators.push(() => {
        const eligible = freshFirst(provinces.filter((p) => {
          const lib = String(p.custom_library || p.library || '').trim();
          return lib.length >= 22;
        }));
        if (!eligible.length) return null;
        const target = pickRandom(eligible);
        const rawLib = String(target.custom_library || target.library || '').trim();
        const maskedLib = maskCityName(rawLib, target.name);
        const sig = `genel-lib-${target.key}`;
        const clue = difficultyId === 'cirak' ? ` (${target.region} Bölgesi)` : '';
        const q = `Dijital göçebeler için önerilen şu kütüphane çalışma durağı hangi ilimizde yer alır?${clue}\n«${maskedLib}»`;
        const exp = `${target.name} (${padPlate(target.plate)}) kütüphane ofisi: ${rawLib}`;
        return buildCityChoiceQuestion(provinces, target, q, exp, difficultyId, sig);
      });

      // Şehir Sözü & Tefekkür Generator
      generators.push(() => {
        const eligible = freshFirst(provinces.filter((p) => {
          const txt = String(p.quote || p.reflection || '').trim();
          return txt.length >= 28;
        }));
        if (!eligible.length) return null;
        const target = pickRandom(eligible);
        const rawQuote = String(target.quote || target.reflection || '').trim();
        const snippet = rawQuote.length > 180 ? rawQuote.slice(0, 177).trim() + '...' : rawQuote;
        const masked = maskCityName(snippet, target.name);
        const sig = `genel-quote-${target.key}`;
        const q = `Anadolu Seyahatnamesi'nde şu sözle anılan kadim şehrimiz hangisidir?\n«${masked}»`;
        const exp = `${target.name} (${target.region}) — ${rawQuote}`;
        return buildCityChoiceQuestion(provinces, target, q, exp, difficultyId, sig);
      });
    }

    // Also include 5-day plan & library generators in tarih/doga for richer endless pool
    if (categoryId === 'tarih' || categoryId === 'doga') {
      generators.push(() => {
        const eligible = freshFirst(provinces.filter((p) => p.five_day_plan && p.five_day_plan.length >= 2));
        if (!eligible.length) return null;
        const target = pickRandom(eligible);
        const rawPlan = pickRandom(target.five_day_plan);
        const cleanPlan = String(rawPlan || '').replace(/\*\*/g, '').trim();
        if (cleanPlan.length < 24) return null;
        const maskedPlan = maskCityName(cleanPlan, target.name);
        const sig = `${categoryId}-plan-${target.key}-${norm(cleanPlan).slice(0, 20)}`;
        const q = `5 günlük seyahat planında şu rota hangi ilimizde uygulanır?\n«${maskedPlan}»`;
        const exp = `${target.name} (${padPlate(target.plate)}, ${target.region}) 5 Gün Kuralı rotası: ${cleanPlan}`;
        return buildCityChoiceQuestion(provinces, target, q, exp, difficultyId, sig);
      });
    }

    // Try generators in shuffled order, avoiding recently seen signatures
    const shuffledGens = shuffle(generators);
    let fallbackCandidate = null;
    for (let attempt = 0; attempt < 8; attempt++) {
      for (let g = 0; g < shuffledGens.length; g++) {
        const built = shuffledGens[g]();
        if (!built) continue;
        if (!fallbackCandidate) fallbackCandidate = built;
        if (!state.recentSignatures.has(built.signature)) {
          return built;
        }
      }
    }
    return fallbackCandidate;
  }

  // ---------------------------------------------------------------------------
  // Game Flow Actions
  // ---------------------------------------------------------------------------
  function recordAskedQuestion(q) {
    if (!q) return;
    if (q.cityName) {
      state.recentCities.push(q.cityName);
      if (state.recentCities.length > MAX_RECENT_HISTORY) {
        state.recentCities.shift();
      }
    }
    if (q.signature) {
      state.recentSignatures.add(q.signature);
      if (state.recentSignatures.size > 60) {
        state.recentSignatures.clear();
      }
    }
  }

  async function generateNewQuestion() {
    if (!state.container) return;
    const provinces = getProvinceList(state.ctx);
    if (provinces.length < 4) {
      notify('Soru üretmek için il verisi bulunamadı.');
      return;
    }

    const reqId = ++state.requestSeq;
    const activeDifficulty = state.difficulty;
    const activeCategory = state.category;
    const aiStatus = checkAIStatus();

    state.isAnswered = false;
    state.selectedIndex = null;
    state.lastPointsEarned = 0;

    // Instant API-keyless Knowledge-Graph synthesis (zero delay, no error flash)
    if (!aiStatus.available) {
      const synth = synthesizeFallbackQuestion(provinces, activeDifficulty, activeCategory);
      state.isLoading = false;
      if (!synth) {
        notify('Soru üretilemedi, lütfen tekrar deneyin.');
        renderUI();
        return;
      }
      state.currentQuestion = {
        ...synth,
        source: 'local-kg',
        fallbackReason: '',
        difficultyId: activeDifficulty,
        categoryId: activeCategory
      };
      recordAskedQuestion(state.currentQuestion);
      renderUI();
      return;
    }

    state.isLoading = true;
    renderUI();

    let questionObj = null;
    let source = 'ai';
    let fallbackReason = '';

    try {
      const aiData = await requestAIQuestion(provinces, activeDifficulty, activeCategory);
      questionObj = {
        ...aiData,
        source: 'ai',
        fallbackReason: '',
        difficultyId: activeDifficulty,
        categoryId: activeCategory,
        signature: `ai-${norm(aiData.cityName)}-${norm(aiData.question).slice(0, 32)}`
      };
    } catch (err) {
      source = 'fallback';
      const msg = err && err.message ? err.message : '';
      if (msg === 'AI_JSON_PARSE_ERROR') {
        fallbackReason = 'AI yanıtı JSON formatında çözümlenemedi — yerel Anadolu arşivinden dinamik soru sentezlendi.';
      } else if (/NO_API_KEY|SEYYAH_AI_UNAVAILABLE|API|key|anahtar/i.test(msg)) {
        fallbackReason = 'Gemini API anahtarı bulunamadı — ctx.data.provinces üzerinden dinamik soru sentezlendi.';
      } else {
        fallbackReason = 'AI bağlantısı geçici olarak sağlanamadı — yerel Anadolu arşivinden dinamik soru sentezlendi.';
      }

      const synth = synthesizeFallbackQuestion(provinces, activeDifficulty, activeCategory);
      if (synth) {
        questionObj = {
          ...synth,
          source,
          fallbackReason,
          difficultyId: activeDifficulty,
          categoryId: activeCategory
        };
      }
    }

    // Ignore stale async completion if user triggered another request or reset
    if (reqId !== state.requestSeq) return;

    state.isLoading = false;
    if (!questionObj) {
      notify('Soru üretilemedi, lütfen tekrar deneyin.');
      renderUI();
      return;
    }

    state.currentQuestion = questionObj;
    recordAskedQuestion(questionObj);
    renderUI();
  }

  function handleOptionSelect(index) {
    if (state.isLoading || state.isAnswered || !state.currentQuestion) return;
    if (index < 0 || index > 3) return;

    state.selectedIndex = index;
    state.isAnswered = true;
    state.answeredCount += 1;

    const isCorrect = index === state.currentQuestion.correctIndex;
    if (isCorrect) {
      state.correctCount += 1;
      state.streak += 1;
      if (state.streak > state.maxStreak) {
        state.maxStreak = state.streak;
      }
      const diff = getDifficultyMeta(state.currentQuestion.difficultyId || state.difficulty);
      const mult = getStreakMultiplier(state.streak);
      const earned = diff.points * mult;
      state.lastPointsEarned = earned;
      state.score += earned;

      if (state.score > state.bestScore) {
        const wasZeroOrLower = state.bestScore === 0 || !state.newRecordHit;
        state.bestScore = state.score;
        saveBestScore(state.bestScore);
        if (wasZeroOrLower) {
          state.newRecordHit = true;
          notify(`🏆 Yeni AI Yarışma Rekoru: ${state.bestScore} Puan!`);
        }
      }
    } else {
      state.streak = 0;
      state.lastPointsEarned = 0;
    }

    renderUI();
  }

  function resetSession() {
    state.requestSeq += 1;
    state.isLoading = false;
    state.score = 0;
    state.streak = 0;
    state.maxStreak = 0;
    state.answeredCount = 0;
    state.correctCount = 0;
    state.newRecordHit = false;
    state.currentQuestion = null;
    state.selectedIndex = null;
    state.isAnswered = false;
    state.lastPointsEarned = 0;
    state.recentCities = [];
    state.recentSignatures.clear();
    renderUI();
  }

  function jumpToCity(key) {
    if (!key) return;
    if (state.ctx && typeof state.ctx.selectCity === 'function') {
      state.ctx.selectCity(key);
      return;
    }
    try {
      window.location.hash = `#city/${encodeURIComponent(key)}`;
    } catch (e) {
      notify('Şehir detay görünümü açılamadı.');
    }
  }

  // ---------------------------------------------------------------------------
  // Scoped CSS (Dark & Light Theme Compatible)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .aiq-shell {
        max-width: 960px;
        margin: 0 auto;
        padding: 4px 2px 36px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
      }

      .aiq-hero {
        position: relative;
        overflow: hidden;
        padding: 22px 24px;
        border-radius: var(--radius-lg, 20px);
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.11), rgba(168, 85, 247, 0.14) 55%, rgba(245, 158, 11, 0.08));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .aiq-hero-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 10px;
        line-height: 1.25;
      }

      .aiq-hero-sub {
        margin-top: 5px;
        font-size: 0.87rem;
        color: var(--text-secondary, #94a3b8);
      }

      .aiq-hero-right {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
      }

      .aiq-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.76rem;
        font-weight: 700;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: var(--bg-glass, rgba(15, 23, 42, 0.75));
        color: var(--text-secondary, #94a3b8);
      }

      .aiq-status-pill.is-ai {
        border-color: rgba(16, 185, 129, 0.4);
        background: rgba(16, 185, 129, 0.14);
        color: #34d399;
      }

      .aiq-status-pill.is-offline {
        border-color: rgba(245, 158, 11, 0.4);
        background: rgba(245, 158, 11, 0.14);
        color: #fbbf24;
      }

      .aiq-reset-btn {
        background: var(--bg-glass, rgba(15, 23, 42, 0.75));
        color: var(--text-secondary, #94a3b8);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        border-radius: var(--radius-full, 9999px);
        padding: 6px 13px;
        font-size: 0.78rem;
        font-weight: 600;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .aiq-reset-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: var(--border-glow, rgba(0, 242, 254, 0.4));
      }

      /* Stats Strip */
      .aiq-stats-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .aiq-stat-card {
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-md, 12px);
        padding: 13px 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        backdrop-filter: blur(10px);
      }

      .aiq-stat-label {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted, #64748b);
        font-weight: 700;
      }

      .aiq-stat-val {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.32rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .aiq-streak-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 9px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.78rem;
        font-weight: 800;
        background: linear-gradient(135deg, rgba(249, 115, 22, 0.24), rgba(245, 158, 11, 0.26));
        border: 1px solid rgba(245, 158, 11, 0.45);
        color: #fbbf24;
        animation: aiqPulse 1.8s infinite ease-in-out;
      }

      @keyframes aiqPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.04); }
      }

      /* Setup Controls Card */
      .aiq-controls-card {
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-lg, 20px);
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        backdrop-filter: blur(12px);
      }

      .aiq-control-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .aiq-control-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        letter-spacing: 0.03em;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .aiq-pill-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .aiq-pill-btn {
        background: var(--bg-glass, rgba(15, 23, 42, 0.7));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        color: var(--text-secondary, #94a3b8);
        border-radius: var(--radius-full, 9999px);
        padding: 8px 14px;
        font-size: 0.84rem;
        font-weight: 600;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .aiq-pill-btn:hover:not(:disabled) {
        color: var(--text-primary, #f8fafc);
        border-color: var(--border-glow, rgba(0, 242, 254, 0.4));
        transform: translateY(-1px);
      }

      .aiq-pill-btn.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(168, 85, 247, 0.22));
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
        box-shadow: 0 0 16px rgba(0, 242, 254, 0.18);
      }

      .aiq-pill-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .aiq-action-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-top: 6px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .aiq-diff-note {
        font-size: 0.8rem;
        color: var(--text-muted, #64748b);
      }

      .aiq-generate-btn {
        background: linear-gradient(135deg, var(--accent-cyan, #00f2fe), var(--accent-purple, #a855f7));
        color: #06101f;
        border: none;
        border-radius: var(--radius-full, 9999px);
        padding: 11px 22px;
        font-size: 0.92rem;
        font-weight: 800;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        cursor: pointer;
        transition: all 0.22s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 8px 22px rgba(0, 242, 254, 0.25);
      }

      .aiq-generate-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 26px rgba(168, 85, 247, 0.35);
      }

      .aiq-generate-btn:disabled {
        opacity: 0.65;
        cursor: wait;
        transform: none;
      }

      /* Stage Card (Intro / Loading / Question) */
      .aiq-stage-card {
        background: var(--bg-card, rgba(30, 41, 59, 0.78));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        border-radius: var(--radius-lg, 20px);
        padding: 26px 24px;
        backdrop-filter: blur(14px);
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.45));
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .aiq-intro {
        text-align: center;
        padding: 18px 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .aiq-intro-icon {
        width: 64px;
        height: 64px;
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(168, 85, 247, 0.24));
        border: 1px solid var(--border-glow, rgba(0, 242, 254, 0.35));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
      }

      .aiq-intro h3 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .aiq-intro p {
        max-width: 560px;
        font-size: 0.9rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.65;
      }

      .aiq-loading-box {
        padding: 32px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        text-align: center;
      }

      .aiq-spinner {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 3px solid rgba(0, 242, 254, 0.18);
        border-top-color: var(--accent-cyan, #00f2fe);
        border-right-color: var(--accent-purple, #a855f7);
        animation: aiqSpin 0.85s linear infinite;
      }

      @keyframes aiqSpin {
        to { transform: rotate(360deg); }
      }

      .aiq-question-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .aiq-meta-tags {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .aiq-tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 11px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.75rem;
        font-weight: 700;
        background: var(--bg-glass, rgba(15, 23, 42, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        color: var(--text-secondary, #94a3b8);
      }

      .aiq-tag.source-ai {
        color: #67e8f9;
        border-color: rgba(0, 242, 254, 0.35);
        background: rgba(0, 242, 254, 0.12);
      }

      .aiq-tag.source-fallback {
        color: #fbbf24;
        border-color: rgba(245, 158, 11, 0.35);
        background: rgba(245, 158, 11, 0.12);
      }

      .aiq-question-text {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.2rem;
        font-weight: 700;
        line-height: 1.5;
        color: var(--text-primary, #f8fafc);
        white-space: pre-line;
      }

      .aiq-fallback-banner {
        font-size: 0.78rem;
        color: var(--text-secondary, #94a3b8);
        padding: 8px 12px;
        border-radius: var(--radius-sm, 8px);
        background: rgba(245, 158, 11, 0.08);
        border: 1px dashed rgba(245, 158, 11, 0.32);
      }

      /* 4 Option Cards */
      .aiq-options-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .aiq-option-card {
        text-align: left;
        background: var(--bg-glass, rgba(15, 23, 42, 0.75));
        border: 1.5px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        border-radius: var(--radius-md, 12px);
        padding: 14px 16px;
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, sans-serif);
        font-size: 0.94rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        line-height: 1.4;
      }

      .aiq-option-card:hover:not(:disabled) {
        border-color: var(--accent-cyan, #00f2fe);
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0, 242, 254, 0.16);
      }

      .aiq-option-card:disabled {
        cursor: default;
      }

      .aiq-option-letter {
        width: 30px;
        height: 30px;
        border-radius: 9px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.82rem;
        font-weight: 800;
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        color: var(--text-secondary, #94a3b8);
      }

      .aiq-option-text {
        flex: 1;
      }

      .aiq-option-badge {
        font-size: 0.95rem;
        font-weight: 800;
        flex-shrink: 0;
      }

      .aiq-option-card.is-correct {
        background: rgba(16, 185, 129, 0.18);
        border-color: #10b981;
        color: #ecfdf5;
        box-shadow: 0 0 18px rgba(16, 185, 129, 0.22);
      }

      .aiq-option-card.is-correct .aiq-option-letter {
        background: #10b981;
        border-color: #10b981;
        color: #052e16;
      }

      .aiq-option-card.is-wrong {
        background: rgba(239, 68, 68, 0.18);
        border-color: #ef4444;
        color: #fef2f2;
      }

      .aiq-option-card.is-wrong .aiq-option-letter {
        background: #ef4444;
        border-color: #ef4444;
        color: #ffffff;
      }

      .aiq-option-card.is-dimmed {
        opacity: 0.52;
      }

      /* Explanation Box */
      .aiq-explanation-box {
        border-radius: var(--radius-md, 12px);
        padding: 18px 20px;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.09), rgba(0, 242, 254, 0.08));
        border: 1px solid rgba(0, 242, 254, 0.25);
        display: flex;
        flex-direction: column;
        gap: 12px;
        animation: aiqFadeIn 0.25s ease-out;
      }

      .aiq-explanation-box.was-wrong {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08));
        border-color: rgba(245, 158, 11, 0.3);
      }

      @keyframes aiqFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .aiq-exp-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .aiq-exp-verdict {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.96rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .aiq-exp-verdict.ok {
        color: #34d399;
      }

      .aiq-exp-verdict.bad {
        color: #f87171;
      }

      .aiq-exp-text {
        font-size: 0.91rem;
        line-height: 1.65;
        color: var(--text-primary, #f8fafc);
      }

      .aiq-exp-footer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-top: 6px;
      }

      .aiq-city-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 15px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(0, 242, 254, 0.14);
        border: 1px solid rgba(0, 242, 254, 0.42);
        color: var(--accent-cyan, #00f2fe);
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.83rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .aiq-city-pill:hover {
        background: rgba(0, 242, 254, 0.24);
        transform: translateY(-1px);
      }

      .aiq-city-pill-static {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 14px;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-glass, rgba(15, 23, 42, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        color: var(--text-secondary, #94a3b8);
        font-size: 0.82rem;
        font-weight: 600;
      }

      .aiq-kbd-hint {
        font-size: 0.74rem;
        color: var(--text-muted, #64748b);
      }

      /* City Deep-Dive Card inside Explanation */
      .aiq-deepdive-card {
        display: grid;
        grid-template-columns: 96px minmax(0, 1fr) auto;
        gap: 14px;
        align-items: center;
        padding: 12px 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.56);
        border: 1px solid rgba(0, 242, 254, 0.28);
      }

      .aiq-deepdive-thumb {
        width: 96px;
        height: 68px;
        border-radius: 10px;
        object-fit: cover;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
      }

      .aiq-deepdive-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      .aiq-deepdive-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.96rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 7px;
        flex-wrap: wrap;
      }

      .aiq-deepdive-meta {
        font-size: 0.77rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.45;
      }

      .aiq-multiplier-live {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 11px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.76rem;
        font-weight: 800;
        background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(245, 158, 11, 0.24));
        border: 1px solid rgba(245, 158, 11, 0.48);
        color: #fbbf24;
      }

      body.light-theme .aiq-deepdive-card {
        background: rgba(241, 245, 249, 0.94);
        border-color: rgba(2, 132, 199, 0.3);
      }

      body.light-theme .aiq-multiplier-live {
        color: #b45309;
        background: rgba(245, 158, 11, 0.16);
      }

      @media (max-width: 720px) {
        .aiq-deepdive-card {
          grid-template-columns: 1fr;
        }
        .aiq-deepdive-thumb {
          width: 100%;
          height: 120px;
        }
      }

      /* Light Theme High-Contrast Overrides */
      body.light-theme .aiq-hero {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.1), rgba(124, 58, 237, 0.1) 55%, rgba(217, 119, 6, 0.08));
      }

      body.light-theme .aiq-status-pill.is-ai {
        color: #047857;
        background: rgba(5, 150, 105, 0.12);
        border-color: rgba(5, 150, 105, 0.35);
      }

      body.light-theme .aiq-status-pill.is-offline {
        color: #b45309;
        background: rgba(217, 119, 6, 0.12);
        border-color: rgba(217, 119, 6, 0.35);
      }

      body.light-theme .aiq-streak-badge {
        color: #b45309;
        background: rgba(245, 158, 11, 0.16);
      }

      body.light-theme .aiq-pill-btn {
        background: rgba(241, 245, 249, 0.9);
        color: #334155;
      }

      body.light-theme .aiq-pill-btn.active {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.16), rgba(124, 58, 237, 0.16));
        border-color: #0284c7;
        color: #0f172a;
      }

      body.light-theme .aiq-generate-btn {
        color: #ffffff;
        background: linear-gradient(135deg, #0284c7, #7c3aed);
      }

      body.light-theme .aiq-tag.source-ai {
        color: #0369a1;
        background: rgba(2, 132, 199, 0.12);
        border-color: rgba(2, 132, 199, 0.32);
      }

      body.light-theme .aiq-tag.source-fallback {
        color: #b45309;
        background: rgba(217, 119, 6, 0.12);
        border-color: rgba(217, 119, 6, 0.32);
      }

      body.light-theme .aiq-option-card {
        background: rgba(248, 250, 252, 0.96);
        color: #0f172a;
      }

      body.light-theme .aiq-option-letter {
        background: #e2e8f0;
        color: #334155;
      }

      body.light-theme .aiq-option-card.is-correct {
        background: rgba(16, 185, 129, 0.14);
        border-color: #059669;
        color: #064e3b;
      }

      body.light-theme .aiq-option-card.is-correct .aiq-option-letter {
        background: #059669;
        color: #ffffff;
      }

      body.light-theme .aiq-option-card.is-wrong {
        background: rgba(239, 68, 68, 0.12);
        border-color: #dc2626;
        color: #7f1d1d;
      }

      body.light-theme .aiq-exp-verdict.ok {
        color: #047857;
      }

      body.light-theme .aiq-exp-verdict.bad {
        color: #b91c1c;
      }

      body.light-theme .aiq-city-pill {
        background: rgba(2, 132, 199, 0.12);
        border-color: rgba(2, 132, 199, 0.4);
        color: #0369a1;
      }

      @media (max-width: 720px) {
        .aiq-stats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .aiq-options-grid {
          grid-template-columns: 1fr;
        }
        .aiq-hero {
          padding: 18px 16px;
        }
        .aiq-stage-card {
          padding: 20px 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Rendering & Event Binding
  // ---------------------------------------------------------------------------
  function renderStageHtml() {
    if (state.isLoading) {
      const cat = getCategoryMeta(state.category);
      const diff = getDifficultyMeta(state.difficulty);
      return `
        <div class="aiq-stage-card">
          <div class="aiq-loading-box">
            <div class="aiq-spinner" aria-hidden="true"></div>
            <div style="font-family:var(--font-heading);font-weight:700;font-size:1.05rem;">
              Yapay Zekâ Yeni Soru Hazırlıyor...
            </div>
            <div style="font-size:0.85rem;color:var(--text-secondary);">
              ${esc(cat.label)} · ${esc(diff.label)}
            </div>
          </div>
        </div>
      `;
    }

    if (!state.currentQuestion) {
      return `
        <div class="aiq-stage-card">
          <div class="aiq-intro">
            <div class="aiq-intro-icon">🧩</div>
            <h3>Anadolu İrfanı, Tarihi ve Coğrafyasıyla Yüzleşmeye Hazır Mısın?</h3>
            <p>
              Yukarıdan zorluk dereceni ve konu kategorini seç; ardından
              <strong>✨ AI Yeni Soru Üret</strong> düğmesine basarak Gemini destekli sonsuz
              Anadolu Kültür & Tarih yarışmasını başlat. Art arda doğru cevaplarda
              <strong>🔥 Seri Çarpanı</strong> puanlarını katlar!
            </p>
            <button type="button" class="aiq-generate-btn" data-aiq-generate>
              ✨ AI Yeni Soru Üret
            </button>
          </div>
        </div>
      `;
    }

    const q = state.currentQuestion;
    const diff = getDifficultyMeta(q.difficultyId || state.difficulty);
    const cat = getCategoryMeta(q.categoryId || state.category);
    const sourceBadge = q.source === 'ai'
      ? '<span class="aiq-tag source-ai">🤖 Gemini AI Sorusu</span>'
      : q.source === 'local-kg'
        ? '<span class="aiq-tag source-ai">⚡ Bilgi Grafiği (81 İl Hibrit)</span>'
        : '<span class="aiq-tag source-fallback">📜 Anadolu Arşivi (Dinamik Yedek)</span>';
    const liveMult = getStreakMultiplier(state.streak);
    const liveMultBadge = `<span class="aiq-multiplier-live" title="Art arda doğru cevaplarda puan çarpanı artar">🔥 x${liveMult} Çarpan${state.streak > 0 ? ' · ' + state.streak + ' Seri' : ''}</span>`;

    const optionsHtml = q.options.map((opt, idx) => {
      let cls = 'aiq-option-card';
      let badge = '';
      if (state.isAnswered) {
        if (idx === q.correctIndex) {
          cls += ' is-correct';
          badge = '<span class="aiq-option-badge">✓</span>';
        } else if (idx === state.selectedIndex) {
          cls += ' is-wrong';
          badge = '<span class="aiq-option-badge">✕</span>';
        } else {
          cls += ' is-dimmed';
        }
      }
      return `
        <button type="button" class="${cls}" data-aiq-option="${idx}" ${state.isAnswered ? 'disabled' : ''}>
          <span class="aiq-option-letter">${LETTERS[idx]}</span>
          <span class="aiq-option-text">${esc(opt)}</span>
          ${badge}
        </button>
      `;
    }).join('');

    let explanationHtml = '';
    if (state.isAnswered) {
      const wasCorrect = state.selectedIndex === q.correctIndex;
      const mult = getStreakMultiplier(state.streak);
      const streakBadge = wasCorrect && state.streak >= 2
        ? `<span class="aiq-streak-badge">🔥 x${mult} Seri!</span>`
        : '';

      const verdictHtml = wasCorrect
        ? `<div class="aiq-exp-verdict ok">✅ Tebrikler! +${state.lastPointsEarned} Puan ${streakBadge}</div>`
        : `<div class="aiq-exp-verdict bad">❌ Yanlış Seçim — Doğru Cevap: ${LETTERS[q.correctIndex]}) ${esc(q.options[q.correctIndex])}</div>`;

      const cityJumpHtml = q.matchedKey
        ? `<button type="button" class="aiq-city-pill" data-aiq-jump="${esc(q.matchedKey)}">📍 Şehir Rehberini Derinlemesine İncele ➔</button>`
        : `<span class="aiq-city-pill-static">📍 ${esc(q.cityName)}</span>`;

      const mp = q.matchedProvince;
      const deepDiveCardHtml = mp ? `
        <div class="aiq-deepdive-card">
          <img
            class="aiq-deepdive-thumb"
            src="${esc(mp.banner_rel || 'assets/banner.jpg')}"
            alt="${esc(mp.name)}"
            loading="lazy"
            onerror="if(this.dataset.fb!=='1'){this.dataset.fb='1';this.src='assets/banner.jpg';}"
          />
          <div class="aiq-deepdive-info">
            <div class="aiq-deepdive-title">
              <span>${esc(mp.name)}</span>
              <span class="aiq-tag">🏷️ ${padPlate(mp.plate)} · ${esc(mp.region)}</span>
              <span class="aiq-tag">${mp.visited ? '✅ Gezildi' : '⏳ Keşif Bekliyor'}</span>
            </div>
            <div class="aiq-deepdive-meta">
              ${mp.landmarks && mp.landmarks[0] ? `🏛️ ${esc(mp.landmarks.slice(0, 2).join(', '))}` : ''}
              ${mp.specialties && mp.specialties[0] ? ` · 🍽️ ${esc(mp.specialties.slice(0, 2).join(', '))}` : ''}
              ${mp.library ? `<br/>📚 ${esc(String(mp.library).slice(0, 95))}${String(mp.library).length > 95 ? '…' : ''}` : ''}
            </div>
          </div>
          <div>${cityJumpHtml}</div>
        </div>
      ` : '';

      explanationHtml = `
        <div class="aiq-explanation-box ${wasCorrect ? '' : 'was-wrong'}">
          <div class="aiq-exp-header">
            ${verdictHtml}
            ${mp ? `<span class="aiq-tag">🏷️ ${padPlate(mp.plate)} · ${esc(mp.region)}</span>` : ''}
          </div>
          <div class="aiq-exp-text">${esc(q.explanation)}</div>
          ${deepDiveCardHtml}
          <div class="aiq-exp-footer">
            ${mp ? `<span class="aiq-kbd-hint">Enter tuşu ile sıradaki soruya geçebilirsin</span>` : cityJumpHtml}
            <button type="button" class="aiq-generate-btn" data-aiq-generate>
              ✨ Sıradaki Soru
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="aiq-stage-card">
        <div class="aiq-question-meta">
          <div class="aiq-meta-tags">
            ${sourceBadge}
            <span class="aiq-tag">${esc(cat.label)}</span>
            <span class="aiq-tag">${esc(diff.label)} · ${diff.points} baz puan</span>
            ${liveMultBadge}
          </div>
          <span class="aiq-kbd-hint">Kısayol: A-D veya 1-4</span>
        </div>
        ${q.fallbackReason ? `<div class="aiq-fallback-banner">ℹ️ ${esc(q.fallbackReason)}</div>` : ''}
        <div class="aiq-question-text">${esc(q.question)}</div>
        <div class="aiq-options-grid">${optionsHtml}</div>
        ${explanationHtml}
      </div>
    `;
  }

  function renderUI() {
    const container = state.container;
    if (!container) return;

    const aiStatus = checkAIStatus();
    const diffMeta = getDifficultyMeta(state.difficulty);
    const mult = getStreakMultiplier(state.streak);
    const streakDisplay = state.streak >= 2
      ? `<span class="aiq-streak-badge">🔥 x${mult} Seri!</span>`
      : `<span style="font-size:0.84rem;color:var(--text-secondary);">(${state.streak} doğru)</span>`;

    const difficultyPills = DIFFICULTIES.map((d) => `
      <button
        type="button"
        class="aiq-pill-btn ${state.difficulty === d.id ? 'active' : ''}"
        data-aiq-diff="${d.id}"
        ${state.isLoading ? 'disabled' : ''}
      >${esc(d.label)}</button>
    `).join('');

    const categoryPills = CATEGORIES.map((c) => `
      <button
        type="button"
        class="aiq-pill-btn ${state.category === c.id ? 'active' : ''}"
        data-aiq-cat="${c.id}"
        ${state.isLoading ? 'disabled' : ''}
      >${esc(c.label)}</button>
    `).join('');

    container.innerHTML = `
      <section class="aiq-shell" aria-label="Sonsuz AI Anadolu Kültür ve Tarih Yarışması">
        <div class="aiq-hero">
          <div>
            <h2 class="aiq-hero-title">🧩 Sonsuz AI Anadolu Kültür &amp; Tarih Yarışması</h2>
            <p class="aiq-hero-sub">
              81 ilin tarihi, gastronomisi, tasavvuf irfanı ve tabiatı üzerine yapay zekâ destekli sonsuz bilgi meydanı.
            </p>
          </div>
          <div class="aiq-hero-right">
            <span class="aiq-status-pill ${aiStatus.available ? 'is-ai' : 'is-offline'}">
              ${aiStatus.available ? '🟢 SEYYAH AI Hazır' : '🟡 Çevrimdışı Sentez Modu'}
            </span>
            <button type="button" class="aiq-reset-btn" data-aiq-reset>🔄 Oturumu Sıfırla</button>
          </div>
        </div>

        <div class="aiq-stats-grid">
          <div class="aiq-stat-card">
            <span class="aiq-stat-label">Canlı Puan</span>
            <span class="aiq-stat-val">${state.score}</span>
          </div>
          <div class="aiq-stat-card">
            <span class="aiq-stat-label">Seri Çarpanı</span>
            <span class="aiq-stat-val">${state.streak} ${streakDisplay}</span>
          </div>
          <div class="aiq-stat-card">
            <span class="aiq-stat-label">İsabet Oranı</span>
            <span class="aiq-stat-val">${state.correctCount}/${state.answeredCount} <span style="font-size:0.85rem;color:var(--text-secondary);">(%${getAccuracyPct()})</span></span>
          </div>
          <div class="aiq-stat-card">
            <span class="aiq-stat-label">En Yüksek Skor</span>
            <span class="aiq-stat-val">🏆 ${state.bestScore}</span>
          </div>
        </div>

        <div class="aiq-controls-card">
          <div class="aiq-control-row">
            <div class="aiq-control-label">
              <span>Zorluk Seviyesi</span>
              <span>Baz puan: ${diffMeta.points} × seri</span>
            </div>
            <div class="aiq-pill-group">${difficultyPills}</div>
          </div>

          <div class="aiq-control-row">
            <div class="aiq-control-label">
              <span>Konu Kategorisi</span>
            </div>
            <div class="aiq-pill-group">${categoryPills}</div>
          </div>

          <div class="aiq-action-bar">
            <span class="aiq-diff-note">${esc(diffMeta.desc)}</span>
            <button type="button" class="aiq-generate-btn" data-aiq-generate ${state.isLoading ? 'disabled' : ''}>
              ${state.isLoading ? '⏳ Üretiliyor...' : '✨ AI Yeni Soru Üret'}
            </button>
          </div>
        </div>

        ${renderStageHtml()}
      </section>
    `;

    bindEvents(container);
  }

  function bindEvents(container) {
    container.querySelectorAll('[data-aiq-diff]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextDiff = btn.getAttribute('data-aiq-diff');
        if (!nextDiff || nextDiff === state.difficulty || state.isLoading) return;
        state.difficulty = nextDiff;
        renderUI();
      });
    });

    container.querySelectorAll('[data-aiq-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextCat = btn.getAttribute('data-aiq-cat');
        if (!nextCat || nextCat === state.category || state.isLoading) return;
        state.category = nextCat;
        renderUI();
      });
    });

    container.querySelectorAll('[data-aiq-generate]').forEach((btn) => {
      btn.addEventListener('click', () => {
        generateNewQuestion();
      });
    });

    container.querySelectorAll('[data-aiq-option]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-aiq-option'), 10);
        handleOptionSelect(idx);
      });
    });

    container.querySelectorAll('[data-aiq-jump]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-aiq-jump');
        jumpToCity(key);
      });
    });

    const resetBtn = container.querySelector('[data-aiq-reset]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetSession();
      });
    }
  }

  function bindKeyboardShortcuts() {
    if (state.keyHandler) {
      document.removeEventListener('keydown', state.keyHandler);
    }
    state.keyHandler = (e) => {
      if (!state.container || !document.body.contains(state.container)) return;
      if (!state.container.querySelector('.aiq-shell')) return;
      const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();
      const map = { '1': 0, a: 0, '2': 1, b: 1, '3': 2, c: 2, '4': 3, d: 3 };
      if (Object.prototype.hasOwnProperty.call(map, key) && state.currentQuestion && !state.isAnswered && !state.isLoading) {
        e.preventDefault();
        handleOptionSelect(map[key]);
      } else if (key === 'enter' && state.isAnswered && !state.isLoading) {
        e.preventDefault();
        generateNewQuestion();
      }
    };
    document.addEventListener('keydown', state.keyHandler);
  }

  function render(container, ctx) {
    if (!container) return;
    state.container = container;
    state.ctx = ctx || {};
    state.bestScore = loadBestScore();

    injectStyles();
    bindKeyboardShortcuts();
    renderUI();
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.aiQuiz = { render };
})();
