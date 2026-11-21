/**
 * Anadolu Seyahatnamesi — Enterprise Unified Gemini AI Client (window.SEYYAH_AI)
 * Centralized BYOK key handling, retired-model auto-upgrade, multi-model failover,
 * SSE streaming with ask() fallback, LRU memory+sessionStorage cache, live telemetry,
 * Anatolia context builder, Turkish province matcher, and XSS-safe Markdown renderer.
 */
(function (global) {
  'use strict';

  const GEMINI_KEY_STORAGE = 'dijital_seyyah_gemini_api_key';
  const GEMINI_MODEL_STORAGE = 'dijital_seyyah_gemini_model';
  const CACHE_STORAGE_KEY = 'seyyah_ai_lru_cache_v1';

  const DEFAULT_MODEL = 'gemini-flash-lite-latest';
  const FAILOVER_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];
  const RETIRED_MODELS = new Set([
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash'
  ]);

  const CACHE_MAX_ENTRIES = 40;
  const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
  const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

  // ---------------------------------------------------------------------------
  // Private Key & Model Helpers (API key NEVER leaves this closure)
  // ---------------------------------------------------------------------------
  function readApiKey() {
    try {
      if (typeof localStorage === 'undefined') return '';
      return String(localStorage.getItem(GEMINI_KEY_STORAGE) || '').trim();
    } catch (e) {
      return '';
    }
  }

  function sanitizeErrorText(msg, apiKey) {
    let out = String(msg || 'Bilinmeyen hata');
    if (apiKey) {
      out = out.split(apiKey).join('[REDACTED]');
    }
    return out.replace(/([?&]key=)[^&\s]+/gi, '$1[REDACTED]');
  }

  function getPreferredModel() {
    try {
      if (typeof localStorage === 'undefined') return DEFAULT_MODEL;
      const raw = String(localStorage.getItem(GEMINI_MODEL_STORAGE) || '').trim();
      if (!raw) return DEFAULT_MODEL;
      if (RETIRED_MODELS.has(raw)) {
        try {
          localStorage.setItem(GEMINI_MODEL_STORAGE, DEFAULT_MODEL);
        } catch (_) {}
        return DEFAULT_MODEL;
      }
      return raw;
    } catch (e) {
      return DEFAULT_MODEL;
    }
  }

  function getFailoverModels() {
    const preferred = getPreferredModel();
    const list = [preferred].concat(FAILOVER_MODELS);
    return list.filter(function (model, idx) {
      return Boolean(model) && list.indexOf(model) === idx;
    });
  }

  function isRetryableFailure(status, message) {
    if (status === 404 || status === 429 || status === 503) return true;
    return /quota|billing|limit|not found|high demand|no longer available|retired|overloaded|unavailable/i.test(
      String(message || '')
    );
  }

  function nowMs() {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }
    return Date.now();
  }

  // ---------------------------------------------------------------------------
  // Telemetry
  // ---------------------------------------------------------------------------
  const telemetry = {
    totalCalls: 0,
    cacheHits: 0,
    lastModel: null,
    lastLatencyMs: 0,
    errors: 0
  };

  function getTelemetry() {
    return {
      totalCalls: telemetry.totalCalls,
      cacheHits: telemetry.cacheHits,
      lastModel: telemetry.lastModel,
      lastLatencyMs: telemetry.lastLatencyMs,
      errors: telemetry.errors
    };
  }

  function emitTelemetry(extra) {
    try {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
        const detail = Object.assign(getTelemetry(), extra || {});
        window.dispatchEvent(new CustomEvent('seyyah:ai-telemetry', { detail }));
      }
    } catch (_) {}
  }

  // ---------------------------------------------------------------------------
  // In-Memory + sessionStorage LRU Cache (max 40 entries, 30 min TTL)
  // ---------------------------------------------------------------------------
  const memoryCache = new Map();
  let cacheHydrated = false;

  function hydrateCache() {
    if (cacheHydrated) return;
    cacheHydrated = true;
    try {
      if (typeof sessionStorage === 'undefined') return;
      const raw = sessionStorage.getItem(CACHE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const now = Date.now();
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (
          item &&
          typeof item.key === 'string' &&
          typeof item.text === 'string' &&
          typeof item.model === 'string' &&
          typeof item.ts === 'number' &&
          now - item.ts <= CACHE_TTL_MS
        ) {
          memoryCache.set(item.key, {
            text: item.text,
            model: item.model,
            ts: item.ts
          });
        }
      }
      while (memoryCache.size > CACHE_MAX_ENTRIES) {
        const oldest = memoryCache.keys().next().value;
        memoryCache.delete(oldest);
      }
    } catch (_) {}
  }

  function persistCache() {
    try {
      if (typeof sessionStorage === 'undefined') return;
      const payload = [];
      memoryCache.forEach(function (val, key) {
        payload.push({ key: key, text: val.text, model: val.model, ts: val.ts });
      });
      sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {
      try {
        // Evict oldest half if storage quota is tight
        const half = Math.ceil(memoryCache.size / 2);
        let removed = 0;
        for (const k of memoryCache.keys()) {
          if (removed >= half) break;
          memoryCache.delete(k);
          removed++;
        }
        const payload = [];
        memoryCache.forEach(function (val, key) {
          payload.push({ key: key, text: val.text, model: val.model, ts: val.ts });
        });
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(payload));
        }
      } catch (__) {}
    }
  }

  function cacheGet(cacheKey) {
    if (!cacheKey) return null;
    hydrateCache();
    const key = String(cacheKey);
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      memoryCache.delete(key);
      persistCache();
      return null;
    }
    // Refresh LRU recency
    memoryCache.delete(key);
    memoryCache.set(key, entry);
    persistCache();
    return entry;
  }

  function cacheSet(cacheKey, text, model) {
    if (!cacheKey) return;
    hydrateCache();
    const key = String(cacheKey);
    if (memoryCache.has(key)) {
      memoryCache.delete(key);
    }
    memoryCache.set(key, {
      text: String(text),
      model: String(model || DEFAULT_MODEL),
      ts: Date.now()
    });
    while (memoryCache.size > CACHE_MAX_ENTRIES) {
      const oldest = memoryCache.keys().next().value;
      memoryCache.delete(oldest);
    }
    persistCache();
  }

  function clearCache() {
    hydrateCache();
    memoryCache.clear();
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(CACHE_STORAGE_KEY);
      }
    } catch (_) {}
  }

  // ---------------------------------------------------------------------------
  // Request & History Builders
  // ---------------------------------------------------------------------------
  function extractTurnText(turn) {
    if (!turn) return '';
    if (typeof turn.text === 'string') return turn.text;
    if (typeof turn.content === 'string') return turn.content;
    if (Array.isArray(turn.parts)) {
      return turn.parts
        .map(function (pt) {
          return pt && typeof pt.text === 'string' ? pt.text : '';
        })
        .join('\n');
    }
    return '';
  }

  function buildContents(prompt, history) {
    const alternating = [];
    if (Array.isArray(history)) {
      for (let i = 0; i < history.length; i++) {
        const item = history[i];
        if (!item || item.loading) continue;
        const rawRole = String(item.role || '').toLowerCase();
        const role = rawRole === 'assistant' || rawRole === 'model' ? 'model' : rawRole === 'user' ? 'user' : '';
        if (!role) continue;
        const text = extractTurnText(item).trim();
        if (!text) continue;
        // Must start with 'user'
        if (alternating.length === 0 && role !== 'user') continue;
        // Must strictly alternate user -> model
        if (alternating.length > 0 && alternating[alternating.length - 1].role === role) continue;
        alternating.push({ role: role, parts: [{ text: text }] });
      }
    }
    // Ensure history ends on 'model' before appending current 'user' prompt
    if (alternating.length > 0 && alternating[alternating.length - 1].role === 'user') {
      alternating.pop();
    }
    alternating.push({ role: 'user', parts: [{ text: String(prompt) }] });
    return alternating;
  }

  function buildRequestBody(prompt, system, history, temperature, maxTokens) {
    const body = {
      contents: buildContents(prompt, history),
      generationConfig: {
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        maxOutputTokens: typeof maxTokens === 'number' ? maxTokens : 2048
      }
    };
    if (system && String(system).trim()) {
      body.system_instruction = {
        parts: [{ text: String(system).trim() }]
      };
    }
    return body;
  }

  function extractCandidateText(data) {
    const parts =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts;
    if (!Array.isArray(parts)) return '';
    return parts
      .map(function (pt) {
        return pt && typeof pt.text === 'string' ? pt.text : '';
      })
      .join('');
  }

  // ---------------------------------------------------------------------------
  // Core AI Methods: ask() and stream()
  // ---------------------------------------------------------------------------
  async function ask(options) {
    const opts = options || {};
    const prompt = opts.prompt;
    const system = opts.system;
    const history = opts.history;
    const temperature = opts.temperature === undefined ? 0.7 : opts.temperature;
    const maxTokens = opts.maxTokens === undefined ? 2048 : opts.maxTokens;
    const cacheKey = opts.cacheKey;

    if (!prompt || !String(prompt).trim()) {
      throw new Error('Geçerli bir prompt (soru) girilmelidir.');
    }

    const t0 = nowMs();

    if (cacheKey) {
      const hit = cacheGet(cacheKey);
      if (hit) {
        const latencyMs = Math.max(0, Math.round(nowMs() - t0));
        telemetry.totalCalls += 1;
        telemetry.cacheHits += 1;
        telemetry.lastModel = hit.model;
        telemetry.lastLatencyMs = latencyMs;
        emitTelemetry({ cached: true, streaming: false });
        return {
          text: hit.text,
          model: hit.model,
          cached: true,
          latencyMs: latencyMs
        };
      }
    }

    const apiKey = readApiKey();
    if (!apiKey) {
      const latencyMs = Math.max(0, Math.round(nowMs() - t0));
      telemetry.totalCalls += 1;
      telemetry.errors += 1;
      telemetry.lastLatencyMs = latencyMs;
      emitTelemetry({ cached: false, streaming: false, error: 'NO_API_KEY' });
      const err = new Error('Gemini API anahtarı bulunamadı.');
      err.code = 'NO_API_KEY';
      throw err;
    }

    const bodyJson = JSON.stringify(buildRequestBody(prompt, system, history, temperature, maxTokens));
    const models = getFailoverModels();
    let lastErr = null;

    for (let i = 0; i < models.length; i++) {
      const tryModel = models[i];
      const url = `${API_BASE}/${encodeURIComponent(tryModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyJson
        });
        let data = null;
        try {
          data = await res.json();
        } catch (_) {
          data = null;
        }

        if (!res.ok) {
          const rawMsg = (data && data.error && data.error.message) || `HTTP ${res.status}`;
          const safeMsg = sanitizeErrorText(rawMsg, apiKey);
          const err = new Error(safeMsg);
          err.status = res.status;
          lastErr = err;
          if (isRetryableFailure(res.status, safeMsg)) {
            continue;
          }
          throw err;
        }

        const text = extractCandidateText(data).trim();
        if (text) {
          if (cacheKey) {
            cacheSet(cacheKey, text, tryModel);
          }
          const latencyMs = Math.max(0, Math.round(nowMs() - t0));
          telemetry.totalCalls += 1;
          telemetry.lastModel = tryModel;
          telemetry.lastLatencyMs = latencyMs;
          emitTelemetry({ cached: false, streaming: false });
          return {
            text: text,
            model: tryModel,
            cached: false,
            latencyMs: latencyMs
          };
        }

        lastErr = new Error('Gemini boş yanıt döndü.');
      } catch (err) {
        const safeMsg = sanitizeErrorText(err && err.message, apiKey);
        const wrapped = err instanceof Error ? err : new Error(safeMsg);
        wrapped.message = safeMsg;
        lastErr = wrapped;
        if (err && isRetryableFailure(err.status, safeMsg)) {
          continue;
        }
        // Network/fetch failures shouldn't bypass fatal auth errors (400/401/403)
        if (err && typeof err.status === 'number' && !isRetryableFailure(err.status, safeMsg)) {
          break;
        }
      }
    }

    const latencyMs = Math.max(0, Math.round(nowMs() - t0));
    telemetry.totalCalls += 1;
    telemetry.errors += 1;
    telemetry.lastLatencyMs = latencyMs;
    const finalErr = lastErr || new Error('Gemini API yanıt vermedi.');
    emitTelemetry({ cached: false, streaming: false, error: finalErr.message });
    throw finalErr;
  }

  async function stream(options) {
    const opts = options || {};
    const prompt = opts.prompt;
    const system = opts.system;
    const history = opts.history;
    const temperature = opts.temperature === undefined ? 0.7 : opts.temperature;
    const maxTokens = opts.maxTokens === undefined ? 2048 : opts.maxTokens;
    const onChunk = typeof opts.onChunk === 'function' ? opts.onChunk : null;
    const cacheKey = opts.cacheKey;

    if (!prompt || !String(prompt).trim()) {
      throw new Error('Geçerli bir prompt (soru) girilmelidir.');
    }

    if (cacheKey) {
      const hit = cacheGet(cacheKey);
      if (hit) {
        const res = await ask(opts);
        if (onChunk && res.text) {
          try {
            onChunk(res.text, res.text);
          } catch (_) {}
        }
        return res;
      }
    }

    const apiKey = readApiKey();
    if (!apiKey) {
      return ask(opts);
    }

    const t0 = nowMs();
    const preferredModel = getPreferredModel();
    const url = `${API_BASE}/${encodeURIComponent(preferredModel)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
    const bodyJson = JSON.stringify(buildRequestBody(prompt, system, history, temperature, maxTokens));

    let fullText = '';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyJson
      });

      if (!res.ok || !res.body || typeof res.body.getReader !== 'function') {
        // Automatic fallback to ask() on 404/429/503 or unsupported stream
        const fallbackRes = await ask(opts);
        if (onChunk && fallbackRes.text) {
          try {
            onChunk(fallbackRes.text, fallbackRes.text);
          } catch (_) {}
        }
        return fallbackRes;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let eventDataLines = [];

      function processSseEvent(rawPayload) {
        const payload = rawPayload.trim();
        if (!payload || payload === '[DONE]') return;
        let parsed = null;
        try {
          parsed = JSON.parse(payload);
        } catch (_) {
          return;
        }
        if (parsed && parsed.error) {
          const msg = sanitizeErrorText(parsed.error.message || 'SSE akış hatası', apiKey);
          const streamErr = new Error(msg);
          streamErr.status = parsed.error.code;
          throw streamErr;
        }
        const delta = extractCandidateText(parsed);
        if (delta) {
          fullText += delta;
          if (onChunk) {
            try {
              onChunk(delta, fullText);
            } catch (_) {}
          }
        }
      }

      function processLine(line) {
        const clean = line.endsWith('\r') ? line.slice(0, -1) : line;
        if (clean === '') {
          if (eventDataLines.length > 0) {
            const joined = eventDataLines.join('\n');
            eventDataLines = [];
            processSseEvent(joined);
          }
          return;
        }
        if (clean.startsWith('data:')) {
          eventDataLines.push(clean.slice(5).trimStart());
        }
      }

      while (true) {
        const step = await reader.read();
        if (step.done) break;
        buffer += decoder.decode(step.value, { stream: true });
        let nlIndex = buffer.indexOf('\n');
        while (nlIndex !== -1) {
          const line = buffer.slice(0, nlIndex);
          buffer = buffer.slice(nlIndex + 1);
          processLine(line);
          nlIndex = buffer.indexOf('\n');
        }
      }

      buffer += decoder.decode();
      if (buffer.length > 0) {
        const remaining = buffer.split('\n');
        for (let i = 0; i < remaining.length; i++) {
          processLine(remaining[i]);
        }
      }
      if (eventDataLines.length > 0) {
        processSseEvent(eventDataLines.join('\n'));
      }

      const trimmed = fullText.trim();
      if (!trimmed) {
        const fallbackRes = await ask(opts);
        if (onChunk && fallbackRes.text) {
          try {
            onChunk(fallbackRes.text, fallbackRes.text);
          } catch (_) {}
        }
        return fallbackRes;
      }

      if (cacheKey) {
        cacheSet(cacheKey, trimmed, preferredModel);
      }
      const latencyMs = Math.max(0, Math.round(nowMs() - t0));
      telemetry.totalCalls += 1;
      telemetry.lastModel = preferredModel;
      telemetry.lastLatencyMs = latencyMs;
      emitTelemetry({ cached: false, streaming: true });

      return {
        text: trimmed,
        model: preferredModel,
        cached: false,
        latencyMs: latencyMs
      };
    } catch (_) {
      // SSE failed — fall back to ask() (which handles failover chain & telemetry)
      const fallbackRes = await ask(opts);
      if (onChunk && fallbackRes.text) {
        try {
          const delta = fullText && fallbackRes.text.indexOf(fullText) === 0
            ? fallbackRes.text.slice(fullText.length)
            : fallbackRes.text;
          onChunk(delta, fallbackRes.text);
        } catch (__) {}
      }
      return fallbackRes;
    }
  }

  // ---------------------------------------------------------------------------
  // Turkish Normalization & Anatolia Context / Province Extraction
  // ---------------------------------------------------------------------------
  function defaultNormalizeTurkish(str) {
    if (!str) return '';
    return String(str)
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .replace(/[âÂ]/g, 'a')
      .replace(/[îÎ]/g, 'i')
      .replace(/[ûÛ]/g, 'u')
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .trim();
  }

  function resolveProvincesMap(ctx) {
    if (ctx && ctx.data && ctx.data.provinces) return ctx.data.provinces;
    if (typeof TRAVEL_DATA !== 'undefined' && TRAVEL_DATA && TRAVEL_DATA.provinces) {
      return TRAVEL_DATA.provinces;
    }
    return {};
  }

  function buildAnatoliaContext(ctx) {
    const provincesMap = resolveProvincesMap(ctx);
    const entries = Object.entries(provincesMap);
    const totalCount = entries.length || 81;

    const visitedNames = [];
    for (let i = 0; i < entries.length; i++) {
      const p = entries[i][1];
      if (p && p.visited && p.name) visitedNames.push(p.name);
    }

    const pct = totalCount > 0 ? ((visitedNames.length / totalCount) * 100).toFixed(1) : '0.0';
    const customRoute =
      (ctx && ctx.state && Array.isArray(ctx.state.customRouteCities) && ctx.state.customRouteCities) ||
      (ctx && ctx.data && Array.isArray(ctx.data.custom_route) && ctx.data.custom_route) ||
      (typeof TRAVEL_DATA !== 'undefined' && Array.isArray(TRAVEL_DATA.custom_route) ? TRAVEL_DATA.custom_route : []);

    const lines = [
      `Seyahat İlerlemesi: ${visitedNames.length}/${totalCount} il gezildi (%${pct}).`
    ];

    if (visitedNames.length > 0) {
      lines.push(`Gezilen İller: ${visitedNames.join(', ')}.`);
    }

    if (customRoute.length > 0) {
      lines.push(`Aktif Sefer Rotası: ${customRoute.join(' -> ')}.`);
    }

    const selectedKey = ctx && ctx.state && ctx.state.selectedCityKey;
    const selectedCity = selectedKey && provincesMap[selectedKey] ? provincesMap[selectedKey] : null;
    if (selectedCity) {
      const statusLabel = selectedCity.visited ? 'Gezildi' : 'Gezilmedi';
      const landmarks = Array.isArray(selectedCity.landmarks) ? selectedCity.landmarks.slice(0, 4).join(', ') : '';
      const specialties = Array.isArray(selectedCity.specialties) ? selectedCity.specialties.slice(0, 4).join(', ') : '';
      const library = selectedCity.custom_library || selectedCity.library || '';
      const detailParts = [
        `Seçili İl: ${selectedCity.name} (Plaka ${String(selectedCity.plate || '').padStart(2, '0')}, ${selectedCity.region || ''}, ${statusLabel})`
      ];
      if (landmarks) detailParts.push(`Önemli Duraklar: ${landmarks}`);
      if (specialties) detailParts.push(`Yöresel Lezzetler: ${specialties}`);
      if (library) detailParts.push(`Kütüphane Ofisi: ${library}`);
      lines.push(detailParts.join(' | '));
    }

    return lines.join('\n');
  }

  function extractProvinceMatches(text, ctx, limit) {
    const maxItems = typeof limit === 'number' ? limit : 6;
    if (!text || maxItems <= 0) return [];

    const provincesMap = resolveProvincesMap(ctx);
    const entries = Object.entries(provincesMap);
    if (entries.length === 0) return [];

    const userNorm = ctx && typeof ctx.normalizeTurkish === 'function' ? ctx.normalizeTurkish : defaultNormalizeTurkish;
    const normalize = function (val) {
      return defaultNormalizeTurkish(userNorm(String(val || '').replace(/[âÂ]/g, 'a').replace(/[îÎ]/g, 'i').replace(/[ûÛ]/g, 'u')));
    };

    const normText = normalize(text);
    if (!normText) return [];

    // Sort longest normalized names first to match multi-char names cleanly
    const candidates = entries
      .map(function (entry) {
        const key = entry[0];
        const p = entry[1];
        if (!p || !p.name) return null;
        return {
          key: p.key || key,
          prov: p,
          normName: normalize(p.name)
        };
      })
      .filter(function (item) {
        return item && item.normName.length >= 3;
      })
      .sort(function (a, b) {
        return b.normName.length - a.normName.length;
      });

    const hits = [];
    for (let i = 0; i < candidates.length; i++) {
      const item = candidates[i];
      const escaped = item.normName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-z])(${escaped})(?=$|[^a-z])`);
      const match = regex.exec(normText);
      if (match) {
        const pos = match.index + match[0].indexOf(match[1]);
        hits.push({
          key: item.key,
          prov: item.prov,
          pos: pos
        });
      }
    }

    // Order matches by their appearance in the AI response
    hits.sort(function (a, b) {
      return a.pos - b.pos;
    });

    return hits.slice(0, maxItems).map(function (hit) {
      const p = hit.prov;
      return {
        key: hit.key,
        name: p.name,
        plate: p.plate,
        region: p.region || '',
        region_code: p.region_code || '',
        visited: Boolean(p.visited),
        thumb: p.has_banner && p.banner_rel ? p.banner_rel : (p.banner_rel || 'assets/banner.jpg'),
        banner_rel: p.banner_rel || '',
        lat: p.lat,
        lng: p.lng,
        badge: p.region || '',
        reason: (p.landmarks && p.landmarks[0]) || (p.specialties && p.specialties[0]) || p.custom_quote || p.quote || p.region || ''
      };
    });
  }

  // ---------------------------------------------------------------------------
  // XSS-Proof Markdown Renderer
  // ---------------------------------------------------------------------------
  function defaultEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatInlineSafe(rawText, esc) {
    // Escape ALL HTML first so no tag/attribute/script can ever survive
    let safe = esc(rawText);
    safe = safe.replace(/`([^`]+?)`/g, '<code>$1</code>');
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/__(.+?)__/g, '<strong>$1</strong>');
    safe = safe.replace(/(^|[^\w*])\*([^\s*](?:[^*]*?[^\s*])?)\*(?=[^\w*]|$)/g, '$1<em>$2</em>');
    return safe;
  }

  function renderMarkdown(md, escapeHtmlFn) {
    if (md == null || md === '') return '';
    const esc = typeof escapeHtmlFn === 'function' ? escapeHtmlFn : defaultEscapeHtml;
    const lines = String(md).replace(/\r\n?/g, '\n').split('\n');
    const html = [];

    let listType = null; // 'ul' | 'ol' | null
    let paragraphBuf = [];
    let quoteBuf = [];

    function flushParagraph() {
      if (paragraphBuf.length > 0) {
        const joined = paragraphBuf.map(function (l) {
          return formatInlineSafe(l, esc);
        }).join('<br />');
        html.push(`<p class="seyyah-md-p">${joined}</p>`);
        paragraphBuf = [];
      }
    }

    function flushQuote() {
      if (quoteBuf.length > 0) {
        const joined = quoteBuf.map(function (l) {
          return formatInlineSafe(l, esc);
        }).join('<br />');
        html.push(`<blockquote class="seyyah-md-quote">${joined}</blockquote>`);
        quoteBuf = [];
      }
    }

    function closeList() {
      if (listType === 'ul') {
        html.push('</ul>');
        listType = null;
      } else if (listType === 'ol') {
        html.push('</ol>');
        listType = null;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();

      if (!trimmed) {
        flushParagraph();
        flushQuote();
        closeList();
        continue;
      }

      if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        flushParagraph();
        flushQuote();
        closeList();
        html.push('<hr class="seyyah-md-hr" />');
        continue;
      }

      const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        flushQuote();
        closeList();
        const level = headingMatch[1].length;
        html.push(`<h${level} class="seyyah-md-h${level}">${formatInlineSafe(headingMatch[2], esc)}</h${level}>`);
        continue;
      }

      const quoteMatch = trimmed.match(/^>\s?(.*)$/);
      if (quoteMatch) {
        flushParagraph();
        closeList();
        quoteBuf.push(quoteMatch[1]);
        continue;
      }

      const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
      if (ulMatch) {
        flushParagraph();
        flushQuote();
        if (listType !== 'ul') {
          closeList();
          listType = 'ul';
          html.push('<ul class="seyyah-md-list">');
        }
        html.push(`<li>${formatInlineSafe(ulMatch[1], esc)}</li>`);
        continue;
      }

      const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
      if (olMatch) {
        flushParagraph();
        flushQuote();
        if (listType !== 'ol') {
          closeList();
          listType = 'ol';
          html.push('<ol class="seyyah-md-list seyyah-md-ol">');
        }
        html.push(`<li>${formatInlineSafe(olMatch[1], esc)}</li>`);
        continue;
      }

      flushQuote();
      closeList();
      paragraphBuf.push(trimmed);
    }

    flushParagraph();
    flushQuote();
    closeList();

    return html.join('\n');
  }

  // ---------------------------------------------------------------------------
  // Public API (Never exposes API key)
  // ---------------------------------------------------------------------------
  const SEYYAH_AI = {
    hasKey: function () {
      return Boolean(readApiKey());
    },
    getModel: getPreferredModel,
    getFailoverModels: getFailoverModels,
    ask: ask,
    stream: stream,
    buildAnatoliaContext: buildAnatoliaContext,
    extractProvinceMatches: extractProvinceMatches,
    renderMarkdown: renderMarkdown,
    getTelemetry: getTelemetry,
    clearCache: clearCache
  };

  if (global) {
    global.SEYYAH_AI = SEYYAH_AI;
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
