/**
 * Anadolu Seyahatnamesi — Floating Gemini AI Copilot (Bottom-Right Aurora Orb & Drawer)
 * Luxury Obsidian glassmorphism floating AI assistant powered directly by Google Gemini API.
 * Registers on window.SEYYAH_MODULES.floatingCopilot = { init(ctx) }
 */
(function () {
  'use strict';

  const STYLE_ID = 'seyyah-copilot-styles';
  const ROOT_ID = 'seyyah-copilot-root';
  const GEMINI_KEY_STORAGE = 'dijital_seyyah_gemini_api_key';
  const GEMINI_MODEL_STORAGE = 'dijital_seyyah_gemini_model';
  const DEFAULT_MODEL = 'gemini-flash-lite-latest';
  const FALLBACK_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];
  const RETIRED_MODELS = new Set([
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-pro'
  ]);

  let _ctx = null;
  let _initialized = false;
  let _isOpen = false;
  let _isLoading = false;
  let _activeModel = DEFAULT_MODEL;
  let _lastContextSignature = '';
  let _messages = [];
  let _msgSeq = 0;

  let _rootEl = null;
  let _orbBtn = null;
  let _drawerEl = null;
  let _modelBadgeEl = null;
  let _contextBarEl = null;
  let _messagesEl = null;
  let _chipsEl = null;
  let _inputEl = null;
  let _sendBtn = null;

  // ---------------------------------------------------------------------------
  // Safe Helpers
  // ---------------------------------------------------------------------------
  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  function esc(str) {
    if (_ctx && typeof _ctx.escapeHtml === 'function') {
      return _ctx.escapeHtml(str);
    }
    return fallbackEscapeHtml(str);
  }

  function norm(str) {
    if (_ctx && typeof _ctx.normalizeTurkish === 'function') {
      return _ctx.normalizeTurkish(str);
    }
    return fallbackNormalizeTurkish(str);
  }

  function formatReplyHtml(rawText) {
    return esc(rawText)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\r?\n/g, '<br>');
  }

  function nowTimeLabel() {
    try {
      return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function toast(msg, type) {
    if (_ctx && typeof _ctx.showToast === 'function') {
      _ctx.showToast(msg, type);
    }
  }

  // ---------------------------------------------------------------------------
  // Storage & Model Helpers
  // ---------------------------------------------------------------------------
  function getStoredApiKey() {
    try {
      return (localStorage.getItem(GEMINI_KEY_STORAGE) || '').trim();
    } catch (e) {
      return '';
    }
  }

  function isRetiredModel(modelName) {
    if (!modelName) return false;
    return RETIRED_MODELS.has(modelName) || /^gemini-2\.[05]($|-)/i.test(modelName);
  }

  function getStoredModel() {
    try {
      const raw = (localStorage.getItem(GEMINI_MODEL_STORAGE) || '').trim();
      if (!raw) return DEFAULT_MODEL;
      if (isRetiredModel(raw)) {
        localStorage.setItem(GEMINI_MODEL_STORAGE, DEFAULT_MODEL);
        return DEFAULT_MODEL;
      }
      return raw;
    } catch (e) {
      return DEFAULT_MODEL;
    }
  }

  function getCandidateModels() {
    const preferred = getStoredModel();
    const list = [preferred].concat(FALLBACK_MODELS);
    return list.filter((m, idx) => m && list.indexOf(m) === idx);
  }

  // ---------------------------------------------------------------------------
  // Province & Context Helpers
  // ---------------------------------------------------------------------------
  function getAllProvinces() {
    const obj = (_ctx && _ctx.data && _ctx.data.provinces) || {};
    return Object.keys(obj)
      .map((key) => {
        const p = obj[key];
        if (!p || !p.name) return null;
        return {
          key,
          name: p.name,
          plate: Number(p.plate) || 0,
          region: p.region || '',
          visited: Boolean(p.visited),
          landmarks: Array.isArray(p.landmarks) ? p.landmarks : [],
          specialties: Array.isArray(p.specialties) ? p.specialties : [],
          library: p.library || '',
          quote: p.custom_quote || p.quote || '',
          history: p.history || '',
          five_day_plan: Array.isArray(p.five_day_plan) ? p.five_day_plan : [],
          normName: norm(p.name)
        };
      })
      .filter(Boolean);
  }

  function getActiveCityContext() {
    const key = _ctx && _ctx.state && _ctx.state.selectedCityKey;
    const obj = _ctx && _ctx.data && _ctx.data.provinces;
    if (!key || !obj || !obj[key]) return null;
    const p = obj[key];
    return {
      key,
      name: p.name || key,
      plate: Number(p.plate) || 0,
      region: p.region || '',
      visited: Boolean(p.visited),
      landmarks: Array.isArray(p.landmarks) ? p.landmarks : [],
      specialties: Array.isArray(p.specialties) ? p.specialties : [],
      library: p.library || '',
      quote: p.custom_quote || p.quote || '',
      history: p.history || '',
      five_day_plan: Array.isArray(p.five_day_plan) ? p.five_day_plan : []
    };
  }

  function buildSystemInstruction(activeCity) {
    const provinces = getAllProvinces();
    const total = provinces.length || 81;
    const visitedList = provinces.filter((p) => p.visited).map((p) => p.name);
    const pct = total ? ((visitedList.length / total) * 100).toFixed(1) : '0.0';
    const customRoute =
      (_ctx && _ctx.state && _ctx.state.customRouteCities) ||
      (_ctx && _ctx.data && _ctx.data.custom_route) ||
      ['Ankara', 'Çankırı', 'Kastamonu', 'Karabük', 'Bartın', 'Zonguldak', 'Düzce', 'Sakarya', 'İstanbul', 'Edirne'];

    const lines = [
      'Sen "Dijital Seyyah: Anadolu Seyahatnamesi" uygulamasının sağ alt köşesindeki akıllı Seyyah AI Copilot asistanısın.',
      'Türkiye\'nin 81 ili, 7 coğrafi bölgesi, tarihî/kültürel mirası, yöresel lezzetleri, İl Halk Kütüphanesi çalışma ortamları, 5 Gün Kuralı ve GSB Seyahatsever KYK kültürü hakkında net, samimi ve ilham verici Türkçe yanıtlar ver.',
      'Yanıtlarında şehir adlarını **kalın** yaz, kısa paragraflar kullan ve pratik öneriler sun (en fazla 220 kelime).',
      '',
      `Canlı 81 İl Özeti: ${total} ilin ${visitedList.length} tanesi gezildi (%${pct}).`,
      visitedList.length ? `Gezilen iller: ${visitedList.join(', ')}.` : 'Henüz gezilen il işaretlenmedi.',
      `Aktif sefer rotası: ${customRoute.join(' -> ')}.`
    ];

    if (activeCity) {
      lines.push(
        '',
        `Şu An Açık Olan Şehir Bağlamı: ${activeCity.name} (Plaka ${activeCity.plate}, Bölge: ${activeCity.region || 'Türkiye'}, Durum: ${activeCity.visited ? 'Gezildi' : 'Gezilmedi'}).`
      );
      if (activeCity.landmarks.length) {
        lines.push(`Önemli duraklar: ${activeCity.landmarks.slice(0, 6).join(', ')}.`);
      }
      if (activeCity.specialties.length) {
        lines.push(`Yöresel lezzetler: ${activeCity.specialties.slice(0, 6).join(', ')}.`);
      }
      if (activeCity.library) {
        lines.push(`Kütüphane / çalışma notu: ${activeCity.library}.`);
      }
      if (activeCity.quote) {
        lines.push(`Şehir notu: ${String(activeCity.quote).slice(0, 180)}.`);
      }
    }

    return lines.join('\n');
  }

  function extractMentionedProvinces(replyText) {
    const normReply = norm(replyText || '');
    if (!normReply) return [];
    const provinces = getAllProvinces().sort((a, b) => b.normName.length - a.normName.length);
    const matched = [];
    const seen = new Set();

    for (let i = 0; i < provinces.length; i++) {
      const p = provinces[i];
      if (!p.normName || p.normName.length < 3 || seen.has(p.key)) continue;
      const pattern = new RegExp(`(^|[^a-z])${p.normName}([^a-z]|$)`);
      if (pattern.test(normReply)) {
        seen.add(p.key);
        matched.push({
          key: p.key,
          name: p.name,
          plate: p.plate,
          visited: p.visited
        });
        if (matched.length >= 6) break;
      }
    }

    return matched;
  }

  function getContextChips(activeCity) {
    if (activeCity) {
      const name = activeCity.name;
      return [
        {
          label: '🗓️ 5 günlük plan',
          prompt: `${name} için 5 günlük gezi, kütüphane ve tefekkür planı öner.`
        },
        {
          label: '📚 Kütüphane & çalışma',
          prompt: `${name} İl Halk Kütüphanesi ve şehirdeki sessiz çalışma ortamları hakkında bilgi ver.`
        },
        {
          label: '🍽️ Yöresel lezzetler',
          prompt: `${name} yöresel lezzetleri, meşhur yemekleri ve tatlıları nelerdir?`
        }
      ];
    }

    return [
      {
        label: '🧭 Gezilmemiş rota öner',
        prompt: 'Henüz gezmediğim illerden bana 3 duraklı anlamlı bir Anadolu rotası öner.'
      },
      {
        label: '📚 En iyi kütüphane şehirleri',
        prompt: 'Anadolu\'da çalışma ve okuma kültürü en güçlü kütüphaneli şehirler hangileri?'
      },
      {
        label: '🍽️ Anadolu lezzet durakları',
        prompt: 'Türkiye\'de mutlaka denenmesi gereken 4 yöresel lezzet şehri öner.'
      }
    ];
  }

  // ---------------------------------------------------------------------------
  // Gemini Direct API Engine (Strictly Alternating Contents + Model Fallback)
  // ---------------------------------------------------------------------------
  function buildAlternatingContents(historyMessages, currentPrompt) {
    const recent = historyMessages
      .filter((m) => m && !m.isStatus && (m.role === 'user' || m.role === 'model') && m.text)
      .slice(-8);

    const alternating = [];
    for (let i = 0; i < recent.length; i++) {
      const item = recent[i];
      const role = item.role;
      const text = String(item.text).slice(0, 1200);
      if (alternating.length === 0 && role !== 'user') continue;
      if (alternating.length > 0 && alternating[alternating.length - 1].role === role) continue;
      alternating.push({ role, parts: [{ text }] });
    }

    // Ensure history ends with 'model' before appending the new 'user' turn
    if (alternating.length > 0 && alternating[alternating.length - 1].role === 'user') {
      alternating.pop();
    }

    alternating.push({
      role: 'user',
      parts: [{ text: String(currentPrompt).trim() }]
    });

    return alternating;
  }

  async function requestGeminiReply(promptText, historySnapshot, activeCity) {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      return { missingKey: true };
    }

    const candidates = getCandidateModels();
    const systemText = buildSystemInstruction(activeCity);
    const contents = buildAlternatingContents(historySnapshot, promptText);
    let lastError = null;

    for (let i = 0; i < candidates.length; i++) {
      const modelName = candidates[i];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;

      let res;
      let data = null;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemText }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048
            }
          })
        });
        data = await res.json().catch(() => null);
      } catch (networkErr) {
        lastError = networkErr;
        continue;
      }

      if (!res.ok) {
        const errMsg = (data && data.error && data.error.message) || `HTTP ${res.status}`;
        lastError = new Error(errMsg);
        if (
          res.status === 404 ||
          res.status === 429 ||
          res.status === 503 ||
          /quota|limit|not found|high demand|overloaded|no longer available/i.test(errMsg)
        ) {
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
      const reply = Array.isArray(parts)
        ? parts.map((pt) => pt.text || '').join('\n').trim()
        : '';

      if (reply) {
        return { reply, model: modelName };
      }

      lastError = new Error('Gemini boş yanıt döndürdü.');
    }

    throw lastError || new Error('Gemini API yanıt vermedi.');
  }

  // ---------------------------------------------------------------------------
  // Scoped CSS Injection
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID} {
        font-family: var(--font-body, 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      }

      /* Aurora Floating Trigger Orb */
      .sc-orb-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9900;
        width: 58px;
        height: 58px;
        border-radius: 9999px;
        border: 1px solid rgba(0, 242, 254, 0.45);
        background:
          radial-gradient(circle at 30% 25%, rgba(0, 242, 254, 0.35), transparent 55%),
          radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.42), transparent 60%),
          rgba(10, 15, 29, 0.92);
        color: #f8fafc;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
          0 12px 32px rgba(0, 0, 0, 0.55),
          0 0 24px rgba(0, 242, 254, 0.28),
          0 0 36px rgba(168, 85, 247, 0.22);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.26s ease, border-color 0.26s ease;
        outline: none;
        padding: 0;
      }

      .sc-orb-btn::before {
        content: '';
        position: absolute;
        inset: -5px;
        border-radius: 9999px;
        background: conic-gradient(from 0deg, rgba(0, 242, 254, 0.65), rgba(168, 85, 247, 0.65), rgba(79, 172, 254, 0.4), rgba(0, 242, 254, 0.65));
        z-index: -1;
        opacity: 0.55;
        filter: blur(7px);
        animation: scAuroraPulse 3.4s ease-in-out infinite;
      }

      .sc-orb-btn:hover {
        transform: translateY(-3px) scale(1.05);
        border-color: rgba(0, 242, 254, 0.8);
        box-shadow:
          0 16px 38px rgba(0, 0, 0, 0.65),
          0 0 30px rgba(0, 242, 254, 0.45),
          0 0 44px rgba(168, 85, 247, 0.34);
      }

      .sc-orb-btn:active {
        transform: scale(0.96);
      }

      .sc-orb-btn.is-open {
        border-color: rgba(168, 85, 247, 0.75);
      }

      .sc-orb-icon {
        font-size: 1.45rem;
        line-height: 1;
        filter: drop-shadow(0 0 8px rgba(0, 242, 254, 0.6));
        transition: transform 0.25s ease;
      }

      .sc-orb-btn.is-open .sc-orb-icon {
        transform: rotate(15deg) scale(0.95);
      }

      @keyframes scAuroraPulse {
        0%, 100% {
          transform: scale(0.96) rotate(0deg);
          opacity: 0.45;
        }
        50% {
          transform: scale(1.08) rotate(180deg);
          opacity: 0.85;
        }
      }

      /* Floating Obsidian Glass Drawer */
      .sc-drawer {
        position: fixed;
        bottom: 94px;
        right: 24px;
        z-index: 9900;
        width: 390px;
        height: 560px;
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 118px);
        display: flex;
        flex-direction: column;
        border-radius: 22px;
        background:
          radial-gradient(circle at 0% 0%, rgba(0, 242, 254, 0.08), transparent 45%),
          radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.09), transparent 45%),
          rgba(10, 15, 29, 0.9);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.13);
        box-shadow:
          0 28px 65px -12px rgba(0, 0, 0, 0.78),
          0 0 0 1px rgba(0, 242, 254, 0.12),
          0 0 40px rgba(0, 242, 254, 0.12);
        color: #f8fafc;
        overflow: hidden;
        opacity: 0;
        transform: translateY(16px) scale(0.96);
        pointer-events: none;
        transition: opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1), transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .sc-drawer.is-open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      /* Header */
      .sc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 13px 14px 11px;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.86), rgba(30, 41, 59, 0.66));
        border-bottom: 1px solid rgba(255, 255, 255, 0.09);
        flex-shrink: 0;
      }

      .sc-header-left {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }

      .sc-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.96rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
      }

      .sc-model-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        width: fit-content;
        max-width: 195px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.68rem;
        font-weight: 600;
        color: #67e8f9;
        background: rgba(0, 242, 254, 0.1);
        border: 1px solid rgba(0, 242, 254, 0.25);
        border-radius: 9999px;
        padding: 2px 8px;
      }

      .sc-model-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 6px #10b981;
        flex-shrink: 0;
      }

      .sc-model-dot.no-key {
        background: #f59e0b;
        box-shadow: 0 0 6px #f59e0b;
      }

      .sc-header-actions {
        display: flex;
        align-items: center;
        gap: 5px;
        flex-shrink: 0;
      }

      .sc-icon-btn {
        height: 29px;
        min-width: 29px;
        padding: 0 8px;
        border-radius: 9px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.05);
        color: #cbd5e1;
        font-size: 0.74rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        transition: all 0.18s ease;
      }

      .sc-icon-btn:hover {
        background: rgba(0, 242, 254, 0.14);
        border-color: rgba(0, 242, 254, 0.42);
        color: #f8fafc;
      }

      /* Context Strip */
      .sc-context-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 7px 14px;
        font-size: 0.73rem;
        font-weight: 600;
        color: #94a3b8;
        background: rgba(15, 23, 42, 0.55);
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        flex-shrink: 0;
      }

      .sc-context-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: #e2e8f0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .sc-context-pill strong {
        color: #00f2fe;
      }

      .sc-context-sub {
        font-size: 0.68rem;
        color: #64748b;
        white-space: nowrap;
      }

      /* Messages Area */
      .sc-messages {
        flex: 1;
        overflow-y: auto;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 11px;
        scroll-behavior: smooth;
      }

      .sc-msg-row {
        display: flex;
        flex-direction: column;
        max-width: 90%;
      }

      .sc-msg-row.user {
        align-self: flex-end;
        align-items: flex-end;
      }

      .sc-msg-row.model {
        align-self: flex-start;
        align-items: flex-start;
        max-width: 94%;
      }

      .sc-bubble {
        padding: 10px 13px;
        border-radius: 15px;
        font-size: 0.84rem;
        line-height: 1.55;
        word-break: break-word;
      }

      .sc-msg-row.user .sc-bubble {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(168, 85, 247, 0.24));
        border: 1px solid rgba(0, 242, 254, 0.35);
        color: #f8fafc;
        border-bottom-right-radius: 5px;
      }

      .sc-msg-row.model .sc-bubble {
        background: rgba(30, 41, 59, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #e2e8f0;
        border-bottom-left-radius: 5px;
      }

      .sc-bubble strong {
        color: #67e8f9;
        font-weight: 700;
      }

      /* Typing Wave Animation */
      .sc-typing-wave {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 2px;
      }

      .sc-typing-wave span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: linear-gradient(135deg, #00f2fe, #a855f7);
        animation: scWaveBounce 1.15s infinite ease-in-out;
      }

      .sc-typing-wave span:nth-child(2) {
        animation-delay: 0.16s;
      }

      .sc-typing-wave span:nth-child(3) {
        animation-delay: 0.32s;
      }

      @keyframes scWaveBounce {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.45;
        }
        30% {
          transform: translateY(-6px);
          opacity: 1;
        }
      }

      /* Province Mini Pills */
      .sc-province-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }

      .sc-province-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 9px;
        border-radius: 9999px;
        font-size: 0.71rem;
        font-weight: 600;
        color: #67e8f9;
        background: rgba(0, 242, 254, 0.1);
        border: 1px solid rgba(0, 242, 254, 0.3);
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .sc-province-pill:hover {
        background: rgba(0, 242, 254, 0.22);
        border-color: rgba(0, 242, 254, 0.65);
        transform: translateY(-1px);
      }

      /* Message Footer */
      .sc-msg-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        padding: 0 2px;
        font-size: 0.67rem;
        color: #64748b;
      }

      .sc-copy-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 0.68rem;
        font-weight: 600;
        cursor: pointer;
        padding: 1px 5px;
        border-radius: 6px;
        transition: color 0.15s ease, background 0.15s ease;
      }

      .sc-copy-btn:hover {
        color: #00f2fe;
        background: rgba(0, 242, 254, 0.1);
      }

      /* Inline Missing API Key Card */
      .sc-nokey-card {
        background: linear-gradient(145deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.92));
        border: 1px solid rgba(245, 158, 11, 0.38);
        border-radius: 14px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 9px;
      }

      .sc-nokey-title {
        font-size: 0.82rem;
        font-weight: 700;
        color: #fcd34d;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .sc-nokey-desc {
        font-size: 0.77rem;
        line-height: 1.48;
        color: #cbd5e1;
      }

      .sc-nokey-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .sc-btn-primary {
        padding: 6px 11px;
        border-radius: 9px;
        border: none;
        background: linear-gradient(135deg, #00f2fe, #4facfe);
        color: #04121d;
        font-size: 0.74rem;
        font-weight: 700;
        cursor: pointer;
        transition: opacity 0.18s ease, transform 0.18s ease;
      }

      .sc-btn-primary:hover {
        opacity: 0.92;
        transform: translateY(-1px);
      }

      /* Error Bubble & Retry Action */
      .sc-msg-row.model.is-error .sc-bubble {
        background: rgba(127, 29, 29, 0.28);
        border-color: rgba(248, 113, 113, 0.42);
        color: #fee2e2;
      }

      .sc-error-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 9px;
      }

      .sc-retry-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: 9px;
        border: 1px solid rgba(248, 113, 113, 0.45);
        background: rgba(239, 68, 68, 0.16);
        color: #fecaca;
        font-size: 0.74rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .sc-retry-btn:hover {
        background: rgba(239, 68, 68, 0.28);
        border-color: rgba(248, 113, 113, 0.72);
        transform: translateY(-1px);
      }

      /* Contextual Chips */
      .sc-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 8px 14px 6px;
        border-top: 1px solid rgba(255, 255, 255, 0.07);
        background: rgba(15, 23, 42, 0.45);
        flex-shrink: 0;
      }

      .sc-chip {
        padding: 5px 10px;
        border-radius: 9999px;
        border: 1px solid rgba(168, 85, 247, 0.32);
        background: rgba(168, 85, 247, 0.12);
        color: #e9d5ff;
        font-size: 0.72rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
        white-space: nowrap;
      }

      .sc-chip:hover {
        background: rgba(0, 242, 254, 0.16);
        border-color: rgba(0, 242, 254, 0.55);
        color: #f8fafc;
        transform: translateY(-1px);
      }

      /* Composer */
      .sc-composer {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        padding: 10px 12px 12px;
        background: rgba(15, 23, 42, 0.78);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        flex-shrink: 0;
      }

      .sc-input {
        flex: 1;
        min-height: 38px;
        max-height: 92px;
        overflow-y: auto;
        resize: none;
        padding: 9px 12px;
        border-radius: 13px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(10, 15, 29, 0.82);
        color: #f8fafc;
        font-family: inherit;
        font-size: 0.82rem;
        line-height: 1.4;
        outline: none;
        transition: border-color 0.18s ease, box-shadow 0.18s ease;
      }

      .sc-input::placeholder {
        color: #64748b;
      }

      .sc-input:focus {
        border-color: rgba(0, 242, 254, 0.6);
        box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.14);
      }

      .sc-send-btn {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        border: none;
        background: linear-gradient(135deg, #00f2fe, #a855f7);
        color: #061320;
        font-size: 0.95rem;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
        box-shadow: 0 6px 18px rgba(0, 242, 254, 0.25);
      }

      .sc-send-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(0, 242, 254, 0.38);
      }

      .sc-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Light Theme Support */
      body.light-theme .sc-orb-btn {
        background:
          radial-gradient(circle at 30% 25%, rgba(2, 132, 199, 0.22), transparent 55%),
          radial-gradient(circle at 75% 75%, rgba(124, 58, 237, 0.24), transparent 60%),
          rgba(255, 255, 255, 0.96);
        color: #0f172a;
        border-color: rgba(2, 132, 199, 0.45);
        box-shadow:
          0 12px 28px rgba(15, 23, 42, 0.18),
          0 0 20px rgba(2, 132, 199, 0.22);
      }

      body.light-theme .sc-drawer {
        background:
          radial-gradient(circle at 0% 0%, rgba(2, 132, 199, 0.08), transparent 45%),
          radial-gradient(circle at 100% 100%, rgba(124, 58, 237, 0.08), transparent 45%),
          rgba(255, 255, 255, 0.95);
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow:
          0 24px 55px -12px rgba(15, 23, 42, 0.24),
          0 0 0 1px rgba(2, 132, 199, 0.12);
        color: #0f172a;
      }

      body.light-theme .sc-header {
        background: linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(241, 245, 249, 0.92));
        border-bottom-color: rgba(15, 23, 42, 0.09);
      }

      body.light-theme .sc-title {
        color: #0f172a;
      }

      body.light-theme .sc-model-badge {
        color: #0369a1;
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.28);
      }

      body.light-theme .sc-icon-btn {
        background: rgba(15, 23, 42, 0.04);
        border-color: rgba(15, 23, 42, 0.12);
        color: #334155;
      }

      body.light-theme .sc-icon-btn:hover {
        background: rgba(2, 132, 199, 0.12);
        border-color: rgba(2, 132, 199, 0.35);
        color: #0f172a;
      }

      body.light-theme .sc-context-bar {
        background: rgba(241, 245, 249, 0.85);
        border-bottom-color: rgba(15, 23, 42, 0.08);
        color: #475569;
      }

      body.light-theme .sc-context-pill {
        color: #0f172a;
      }

      body.light-theme .sc-context-pill strong {
        color: #0284c7;
      }

      body.light-theme .sc-msg-row.user .sc-bubble {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.14), rgba(124, 58, 237, 0.14));
        border-color: rgba(2, 132, 199, 0.3);
        color: #0f172a;
      }

      body.light-theme .sc-msg-row.model .sc-bubble {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.1);
        color: #1e293b;
      }

      body.light-theme .sc-bubble strong {
        color: #0369a1;
      }

      body.light-theme .sc-province-pill {
        color: #0369a1;
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.28);
      }

      body.light-theme .sc-province-pill:hover {
        background: rgba(2, 132, 199, 0.18);
        border-color: rgba(2, 132, 199, 0.55);
      }

      body.light-theme .sc-copy-btn {
        color: #64748b;
      }

      body.light-theme .sc-copy-btn:hover {
        color: #0284c7;
        background: rgba(2, 132, 199, 0.1);
      }

      body.light-theme .sc-nokey-card {
        background: #fffbeb;
        border-color: rgba(217, 119, 6, 0.35);
      }

      body.light-theme .sc-nokey-title {
        color: #b45309;
      }

      body.light-theme .sc-nokey-desc {
        color: #334155;
      }

      body.light-theme .sc-msg-row.model.is-error .sc-bubble {
        background: #fef2f2;
        border-color: rgba(220, 38, 38, 0.3);
        color: #7f1d1d;
      }

      body.light-theme .sc-retry-btn {
        background: rgba(220, 38, 38, 0.1);
        border-color: rgba(220, 38, 38, 0.35);
        color: #b91c1c;
      }

      body.light-theme .sc-retry-btn:hover {
        background: rgba(220, 38, 38, 0.18);
        border-color: rgba(220, 38, 38, 0.55);
      }

      body.light-theme .sc-chips {
        background: rgba(248, 250, 252, 0.9);
        border-top-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .sc-chip {
        background: rgba(124, 58, 237, 0.08);
        border-color: rgba(124, 58, 237, 0.24);
        color: #5b21b6;
      }

      body.light-theme .sc-chip:hover {
        background: rgba(2, 132, 199, 0.12);
        border-color: rgba(2, 132, 199, 0.45);
        color: #0f172a;
      }

      body.light-theme .sc-composer {
        background: rgba(248, 250, 252, 0.96);
        border-top-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .sc-input {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.16);
        color: #0f172a;
      }

      body.light-theme .sc-send-btn {
        color: #ffffff;
      }

      /* Mobile Responsive Drawer */
      @media (max-width: 520px) {
        .sc-orb-btn {
          bottom: 24px;
          right: 24px;
        }
        .sc-drawer {
          width: calc(100vw - 20px);
          right: 10px;
          bottom: 92px;
          height: min(560px, calc(100vh - 108px));
          max-width: none;
          border-radius: 18px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .sc-orb-btn::before,
        .sc-typing-wave span {
          animation: none;
        }
        .sc-drawer,
        .sc-orb-btn {
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // UI Construction & Rendering
  // ---------------------------------------------------------------------------
  function createWelcomeMessage(activeCity) {
    const cityIntro = activeCity
      ? `Şu an **${activeCity.name}** bağlamındayız. 5 günlük plan, kütüphane çalışma notları veya yöresel lezzetler hakkında hemen sorabilirsin.`
      : '81 il Anadolu arşiviyle senkronizeyim. Rota, kütüphane, yöresel lezzet veya seyahat planı sorabilirsin.';
    return {
      id: ++_msgSeq,
      role: 'model',
      isStatus: true,
      time: nowTimeLabel(),
      model: getStoredModel(),
      text: `Merhaba Seyyah! ✨ ${cityIntro}`,
      provinces: []
    };
  }

  function updateHeaderBadge() {
    if (!_modelBadgeEl) return;
    const hasKey = Boolean(getStoredApiKey());
    const model = _activeModel || getStoredModel();
    _modelBadgeEl.innerHTML = `<span class="sc-model-dot${hasKey ? '' : ' no-key'}"></span><span>${esc(model)}</span>`;
    _modelBadgeEl.title = hasKey
      ? `Aktif Gemini modeli: ${model}`
      : `Gemini API anahtarı henüz girilmedi (Varsayılan: ${model})`;
  }

  function renderContextAndChips() {
    const activeCity = getActiveCityContext();
    const signature = activeCity ? `city:${activeCity.key}` : 'all';
    _lastContextSignature = signature;

    if (_contextBarEl) {
      if (activeCity) {
        const plateText = activeCity.plate ? ` (${activeCity.plate < 10 ? '0' + activeCity.plate : activeCity.plate})` : '';
        _contextBarEl.innerHTML = `
          <span class="sc-context-pill">📍 Bağlam: <strong>${esc(activeCity.name)}${esc(plateText)}</strong></span>
          <span class="sc-context-sub">${esc(activeCity.region || 'Türkiye')}</span>
        `;
      } else {
        const all = getAllProvinces();
        const visitedCount = all.filter((p) => p.visited).length;
        _contextBarEl.innerHTML = `
          <span class="sc-context-pill">🇹🇷 Bağlam: <strong>Anadolu Atlası</strong></span>
          <span class="sc-context-sub">${visitedCount}/${all.length || 81} il gezildi</span>
        `;
      }
    }

    if (_chipsEl) {
      const chips = getContextChips(activeCity);
      _chipsEl.innerHTML = chips
        .map(
          (chip, idx) =>
            `<button type="button" class="sc-chip" data-sc-chip="${idx}">${esc(chip.label)}</button>`
        )
        .join('');
    }
  }

  function scrollMessagesToBottom() {
    if (!_messagesEl) return;
    requestAnimationFrame(() => {
      if (!_messagesEl) return;
      if (typeof _messagesEl.scrollTo === 'function') {
        _messagesEl.scrollTo({
          top: _messagesEl.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        _messagesEl.scrollTop = _messagesEl.scrollHeight;
      }
    });
  }

  function renderNoKeyCardHtml() {
    return `
      <div class="sc-nokey-card" data-sc-nokey-box>
        <div class="sc-nokey-title">🔒 Gemini API Yapılandırması Bekleniyor</div>
        <div class="sc-nokey-desc">
          Canlı Gemini AI sohbeti için henüz bir API anahtarı tanımlanmamış. API ayarları yalnızca <strong>Admin Paneli</strong> üzerinden güvenle yapılandırılır; dilersen tam danışman ekranını açabilirsin.
        </div>
        <div class="sc-nokey-actions">
          <button type="button" class="sc-btn-primary" data-sc-open-advisor>Tam Danışmanı Aç</button>
        </div>
      </div>
    `;
  }

  function renderMessages() {
    if (!_messagesEl) return;

    const hasKey = Boolean(getStoredApiKey());
    const itemsHtml = _messages
      .map((m) => {
        if (m.loading) {
          return `
            <div class="sc-msg-row model">
              <div class="sc-bubble">
                <div class="sc-typing-wave" aria-label="Gemini yanıt hazırlıyor">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          `;
        }

        if (m.missingKey) {
          return `
            <div class="sc-msg-row model">
              ${renderNoKeyCardHtml()}
            </div>
          `;
        }

        if (m.role === 'user') {
          return `
            <div class="sc-msg-row user">
              <div class="sc-bubble">${formatReplyHtml(m.text)}</div>
              <div class="sc-msg-meta"><span>${esc(m.time || '')}</span></div>
            </div>
          `;
        }

        const pillsHtml =
          Array.isArray(m.provinces) && m.provinces.length
            ? `<div class="sc-province-pills">
                ${m.provinces
                  .map(
                    (p) =>
                      `<button type="button" class="sc-province-pill" data-sc-city="${esc(p.key)}" title="${esc(p.name)} detayını aç">📍 ${esc(p.name)}</button>`
                  )
                  .join('')}
              </div>`
            : '';

        const retryHtml = m.isError
          ? `<div class="sc-error-actions">
               <button type="button" class="sc-retry-btn" data-sc-retry="${m.id}">🔄 Tekrar Dene</button>
             </div>`
          : '';

        return `
          <div class="sc-msg-row model${m.isError ? ' is-error' : ''}">
            <div class="sc-bubble">
              <div>${formatReplyHtml(m.text)}</div>
              ${pillsHtml}
              ${retryHtml}
            </div>
            <div class="sc-msg-meta">
              <span>${esc(m.time || '')}${m.model ? ` • ${esc(m.model)}` : ''}</span>
              ${m.isError ? '' : `<button type="button" class="sc-copy-btn" data-sc-copy="${m.id}">📋 Kopyala</button>`}
            </div>
          </div>
        `;
      })
      .join('');

    const missingKeyBanner =
      !hasKey && !_messages.some((m) => m.missingKey)
        ? `<div class="sc-msg-row model">${renderNoKeyCardHtml()}</div>`
        : '';

    _messagesEl.innerHTML = itemsHtml + missingKeyBanner;
    scrollMessagesToBottom();
  }

  function syncContextIfChanged() {
    const activeCity = getActiveCityContext();
    const signature = activeCity ? `city:${activeCity.key}` : 'all';
    if (signature !== _lastContextSignature) {
      renderContextAndChips();
    }
    updateHeaderBadge();
  }

  function buildDom() {
    if (document.getElementById(ROOT_ID)) return;

    _rootEl = document.createElement('div');
    _rootEl.id = ROOT_ID;

    _orbBtn = document.createElement('button');
    _orbBtn.type = 'button';
    _orbBtn.className = 'sc-orb-btn';
    _orbBtn.setAttribute('aria-label', 'Seyyah AI Copilot aç');
    _orbBtn.setAttribute('aria-expanded', 'false');
    _orbBtn.title = 'Seyyah AI Copilot';
    _orbBtn.innerHTML = '<span class="sc-orb-icon" aria-hidden="true">✨</span>';

    _drawerEl = document.createElement('section');
    _drawerEl.className = 'sc-drawer';
    _drawerEl.setAttribute('role', 'dialog');
    _drawerEl.setAttribute('aria-label', 'Seyyah AI Copilot');
    _drawerEl.setAttribute('aria-hidden', 'true');
    _drawerEl.innerHTML = `
      <header class="sc-header">
        <div class="sc-header-left">
          <div class="sc-title">✨ Seyyah AI Copilot</div>
          <div class="sc-model-badge" data-sc-model-badge></div>
        </div>
        <div class="sc-header-actions">
          <button type="button" class="sc-icon-btn" data-sc-clear title="Sohbeti temizle" aria-label="Sohbeti temizle">🗑️</button>
          <button type="button" class="sc-icon-btn" data-sc-expand title="Tam Seyyah Danışmanı aç" aria-label="Tam Seyyah Danışmanı aç">⤢</button>
          <button type="button" class="sc-icon-btn" data-sc-close title="Kapat (ESC)" aria-label="Kapat">✕</button>
        </div>
      </header>
      <div class="sc-context-bar" data-sc-context-bar></div>
      <div class="sc-messages" data-sc-messages></div>
      <div class="sc-chips" data-sc-chips></div>
      <form class="sc-composer" data-sc-form>
        <textarea class="sc-input" data-sc-input rows="1" placeholder="Anadolu veya bu şehir hakkında sor..."></textarea>
        <button type="submit" class="sc-send-btn" data-sc-send title="Gönder" aria-label="Gönder">➤</button>
      </form>
    `;

    _rootEl.appendChild(_drawerEl);
    _rootEl.appendChild(_orbBtn);
    document.body.appendChild(_rootEl);

    _modelBadgeEl = _drawerEl.querySelector('[data-sc-model-badge]');
    _contextBarEl = _drawerEl.querySelector('[data-sc-context-bar]');
    _messagesEl = _drawerEl.querySelector('[data-sc-messages]');
    _chipsEl = _drawerEl.querySelector('[data-sc-chips]');
    _inputEl = _drawerEl.querySelector('[data-sc-input]');
    _sendBtn = _drawerEl.querySelector('[data-sc-send]');
  }

  // ---------------------------------------------------------------------------
  // Drawer State & Actions
  // ---------------------------------------------------------------------------
  function setOpen(nextOpen) {
    _isOpen = Boolean(nextOpen);
    if (!_drawerEl || !_orbBtn) return;

    _drawerEl.classList.toggle('is-open', _isOpen);
    _drawerEl.setAttribute('aria-hidden', _isOpen ? 'false' : 'true');
    _orbBtn.classList.toggle('is-open', _isOpen);
    _orbBtn.setAttribute('aria-expanded', _isOpen ? 'true' : 'false');

    if (_isOpen) {
      syncContextIfChanged();
      renderMessages();
      if (_inputEl) {
        setTimeout(() => _inputEl.focus(), 60);
      }
    }
  }

  function clearConversation() {
    const activeCity = getActiveCityContext();
    _messages = [createWelcomeMessage(activeCity)];
    renderMessages();
    toast('Copilot sohbeti temizlendi');
  }

  function copyReplyById(msgId, btnEl) {
    const target = _messages.find((m) => m.id === msgId);
    if (!target || !target.text) return;

    const markCopied = () => {
      if (btnEl) {
        const prev = btnEl.textContent;
        btnEl.textContent = '✓ Kopyalandı';
        setTimeout(() => {
          btnEl.textContent = prev || '📋 Kopyala';
        }, 1600);
      }
      toast('Yanıt panoya kopyalandı');
    };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(target.text).then(markCopied).catch(() => {});
      return;
    }

    try {
      const ta = document.createElement('textarea');
      ta.value = target.text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      markCopied();
    } catch (e) {}
  }

  async function sendPrompt(promptText) {
    const clean = String(promptText || '').trim();
    if (!clean || _isLoading) return;

    const activeCity = getActiveCityContext();

    if (!getStoredApiKey()) {
      _messages.push({
        id: ++_msgSeq,
        role: 'user',
        time: nowTimeLabel(),
        text: clean
      });
      _messages.push({
        id: ++_msgSeq,
        role: 'model',
        isStatus: true,
        missingKey: true,
        time: nowTimeLabel(),
        text: ''
      });
      renderMessages();
      return;
    }

    const historySnapshot = _messages.slice();
    _messages.push({
      id: ++_msgSeq,
      role: 'user',
      time: nowTimeLabel(),
      text: clean
    });

    const loadingId = ++_msgSeq;
    _messages.push({
      id: loadingId,
      role: 'model',
      isStatus: true,
      loading: true,
      time: nowTimeLabel(),
      text: ''
    });

    _isLoading = true;
    if (_sendBtn) _sendBtn.disabled = true;
    renderMessages();

    try {
      const result = await requestGeminiReply(clean, historySnapshot, activeCity);
      const idx = _messages.findIndex((m) => m.id === loadingId);

      if (result && result.missingKey) {
        const missingMsg = {
          id: loadingId,
          role: 'model',
          isStatus: true,
          missingKey: true,
          time: nowTimeLabel(),
          text: ''
        };
        if (idx >= 0) _messages[idx] = missingMsg;
        else _messages.push(missingMsg);
      } else if (result && result.reply) {
        _activeModel = result.model || _activeModel;
        updateHeaderBadge();
        const mentioned = extractMentionedProvinces(result.reply);
        const replyMsg = {
          id: loadingId,
          role: 'model',
          time: nowTimeLabel(),
          model: result.model,
          text: result.reply,
          provinces: mentioned
        };
        if (idx >= 0) _messages[idx] = replyMsg;
        else _messages.push(replyMsg);
      } else {
        const emptyErrMsg = {
          id: loadingId,
          role: 'model',
          isStatus: true,
          isError: true,
          retryPrompt: clean,
          time: nowTimeLabel(),
          text: '⚠️ Gemini boş veya geçersiz bir yanıt döndürdü.'
        };
        if (idx >= 0) _messages[idx] = emptyErrMsg;
        else _messages.push(emptyErrMsg);
      }
    } catch (err) {
      const idx = _messages.findIndex((m) => m.id === loadingId);
      const errMsg = {
        id: loadingId,
        role: 'model',
        isStatus: true,
        isError: true,
        retryPrompt: clean,
        time: nowTimeLabel(),
        text: `⚠️ Gemini isteği tamamlanamadı: **${err && err.message ? err.message : 'Bilinmeyen hata'}**`
      };
      if (idx >= 0) _messages[idx] = errMsg;
      else _messages.push(errMsg);
    } finally {
      _isLoading = false;
      if (_sendBtn) _sendBtn.disabled = false;
      renderMessages();
    }
  }

  function retryMessageById(msgId) {
    if (_isLoading) return;
    const errIdx = _messages.findIndex((m) => m.id === msgId);
    if (errIdx < 0) return;

    const errMsg = _messages[errIdx];
    let promptToRetry = (errMsg.retryPrompt || '').trim();
    if (!promptToRetry) {
      for (let i = errIdx - 1; i >= 0; i--) {
        if (_messages[i].role === 'user' && _messages[i].text) {
          promptToRetry = _messages[i].text.trim();
          break;
        }
      }
    }
    if (!promptToRetry) return;

    if (
      errIdx === _messages.length - 1 &&
      errIdx > 0 &&
      _messages[errIdx - 1].role === 'user' &&
      _messages[errIdx - 1].text.trim() === promptToRetry
    ) {
      _messages.splice(errIdx - 1, 2);
    } else {
      _messages.splice(errIdx, 1);
    }

    sendPrompt(promptToRetry);
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  function bindEvents() {
    _orbBtn.addEventListener('click', () => {
      setOpen(!_isOpen);
    });

    _drawerEl.querySelector('[data-sc-close]').addEventListener('click', () => {
      setOpen(false);
    });

    _drawerEl.querySelector('[data-sc-clear]').addEventListener('click', () => {
      clearConversation();
    });

    _drawerEl.querySelector('[data-sc-expand]').addEventListener('click', () => {
      setOpen(false);
      if (_ctx && typeof _ctx.openView === 'function') {
        _ctx.openView('advisor');
      }
    });

    _chipsEl.addEventListener('click', (e) => {
      const chipBtn = e.target.closest('[data-sc-chip]');
      if (!chipBtn) return;
      const idx = Number(chipBtn.getAttribute('data-sc-chip'));
      const chips = getContextChips(getActiveCityContext());
      if (chips[idx]) {
        sendPrompt(chips[idx].prompt);
      }
    });

    _messagesEl.addEventListener('click', (e) => {
      const cityBtn = e.target.closest('[data-sc-city]');
      if (cityBtn) {
        const key = cityBtn.getAttribute('data-sc-city');
        if (key && _ctx && typeof _ctx.selectCity === 'function') {
          _ctx.selectCity(key);
          setTimeout(syncContextIfChanged, 0);
        }
        return;
      }

      const copyBtn = e.target.closest('[data-sc-copy]');
      if (copyBtn) {
        const id = Number(copyBtn.getAttribute('data-sc-copy'));
        copyReplyById(id, copyBtn);
        return;
      }

      if (e.target.closest('[data-sc-open-advisor]')) {
        setOpen(false);
        if (_ctx && typeof _ctx.openView === 'function') {
          _ctx.openView('advisor');
        }
        return;
      }

      const retryBtn = e.target.closest('[data-sc-retry]');
      if (retryBtn) {
        const id = Number(retryBtn.getAttribute('data-sc-retry'));
        retryMessageById(id);
      }
    });

    const composerForm = _drawerEl.querySelector('[data-sc-form]');

    function submitComposer() {
      if (!_inputEl || _isLoading) return;
      const val = _inputEl.value;
      if (!val.trim()) return;
      _inputEl.value = '';
      _inputEl.style.height = 'auto';
      sendPrompt(val);
    }

    composerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitComposer();
    });

    _inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        submitComposer();
      }
    });

    _inputEl.addEventListener('input', () => {
      _inputEl.style.height = 'auto';
      _inputEl.style.height = Math.min(_inputEl.scrollHeight, 92) + 'px';
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _isOpen) {
        setOpen(false);
      }
    });

    window.addEventListener('hashchange', syncContextIfChanged);
    window.addEventListener('popstate', syncContextIfChanged);
    document.addEventListener('click', () => {
      if (_isOpen) {
        setTimeout(syncContextIfChanged, 0);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Module Init
  // ---------------------------------------------------------------------------
  function init(ctx) {
    _ctx = ctx || _ctx || {};
    _activeModel = getStoredModel();

    if (_initialized) {
      syncContextIfChanged();
      return;
    }
    _initialized = true;

    injectStyles();
    buildDom();
    _messages = [createWelcomeMessage(getActiveCityContext())];
    updateHeaderBadge();
    renderContextAndChips();
    renderMessages();
    bindEvents();
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.floatingCopilot = {
    init,
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!_isOpen)
  };
})();
