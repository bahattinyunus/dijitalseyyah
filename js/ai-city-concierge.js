/**
 * Anadolu Seyahatnamesi — In-Page Gemini AI City Concierge
 * Automatically injects a luxury glassmorphism AI concierge card on city detail views.
 * Registers on: window.SEYYAH_MODULES.aiCityConcierge = { init(ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-ai-city-concierge-styles';
  const VIEWPORT_ID = 'viewport-content';
  const BOX_CLASS = 'ai-city-concierge-box';

  const GEMINI_KEY_STORAGE = 'dijital_seyyah_gemini_api_key';
  const GEMINI_MODEL_STORAGE = 'dijital_seyyah_gemini_model';
  const JOURNAL_ENTRIES_STORAGE = 'dijital_seyyah_journal_entries';

  const DEFAULT_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash'
  ];

  const RETIRED_MODELS = new Set([
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite'
  ]);

  const CONCIERGE_ACTIONS = [
    {
      id: 'plan5',
      label: '🗓️ 5 Günlük Plan Üret',
      accent: 'cyan',
      title: '5 Günlük Seyahatsever Keşif Planı'
    },
    {
      id: 'reflection',
      label: '🕊️ Tefekkür & Hikmet Notu',
      accent: 'purple',
      title: 'Tefekkür & Hikmet Notu'
    },
    {
      id: 'library',
      label: '📚 Kütüphane & Odak Stratejisi',
      accent: 'emerald',
      title: 'Kütüphane & Derin Odak Stratejisi'
    },
    {
      id: 'gastronomy',
      label: '🍽️ Gurme Lezzet Rotası',
      accent: 'gold',
      title: 'Gurme Lezzet Rotası'
    }
  ];

  let activeCtx = null;
  let observer = null;
  let initialized = false;
  let requestCounter = 0;

  // Per-session cache keyed by `${cityKey}::${actionId}` so switching buttons feels instant
  const responseCache = new Map();

  function defaultEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function esc(str) {
    if (activeCtx && typeof activeCtx.escapeHtml === 'function') {
      return activeCtx.escapeHtml(str);
    }
    return defaultEscapeHtml(str);
  }

  function notify(message) {
    if (activeCtx && typeof activeCtx.showToast === 'function') {
      activeCtx.showToast(message);
      return;
    }
    const container = document.getElementById('toast-container');
    if (!container) return;
    const item = document.createElement('div');
    item.className = 'toast-item';
    item.textContent = message;
    container.appendChild(item);
    setTimeout(() => {
      item.style.opacity = '0';
      item.style.transition = 'opacity 0.25s ease';
      setTimeout(() => item.remove(), 260);
    }, 2400);
  }

  function getStoredApiKey() {
    try {
      return (localStorage.getItem(GEMINI_KEY_STORAGE) || '').trim();
    } catch (e) {
      return '';
    }
  }

  function isRetiredModel(modelName) {
    if (!modelName) return false;
    return RETIRED_MODELS.has(modelName) || /^gemini-2\.[05]/i.test(modelName);
  }

  function getCandidateModels() {
    let stored = '';
    try {
      stored = (localStorage.getItem(GEMINI_MODEL_STORAGE) || '').trim();
    } catch (e) {
      stored = '';
    }

    if (stored && isRetiredModel(stored)) {
      stored = DEFAULT_MODELS[0];
      try {
        localStorage.setItem(GEMINI_MODEL_STORAGE, stored);
      } catch (e) {}
    }

    const combined = stored ? [stored, ...DEFAULT_MODELS] : [...DEFAULT_MODELS];
    return combined.filter((m, idx, arr) => m && arr.indexOf(m) === idx);
  }

  function buildCityContextBlock(province, cityKey) {
    const landmarks = Array.isArray(province.landmarks) && province.landmarks.length
      ? province.landmarks.join(', ')
      : 'Belirtilmemiş';
    const specialties = Array.isArray(province.specialties) && province.specialties.length
      ? province.specialties.join(', ')
      : 'Belirtilmemiş';
    const spiritual = Array.isArray(province.spiritual_figures) && province.spiritual_figures.length
      ? province.spiritual_figures.join(' | ')
      : (province.spiritual_figures || 'Belirtilmemiş');
    const library = province.custom_library || province.library || 'İl Halk Kütüphanesi';
    const quote = province.custom_quote || province.quote || '';
    const plate = province.plate ? String(province.plate).padStart(2, '0') : '--';

    return [
      `Şehir: ${province.name} (Plaka: ${plate}, Anahtar: ${cityKey})`,
      `Bölge: ${province.region || 'Anadolu'}`,
      `Durum: ${province.visited ? 'Ziyaret edildi' : 'Henüz ziyaret edilmedi (Planlanan menzil)'}`,
      `Öne Çıkan Duraklar: ${landmarks}`,
      `Yöresel Lezzetler: ${specialties}`,
      `Kütüphane Ofisi: ${library}`,
      `Manevi İsimler / İzler: ${spiritual}`,
      quote ? `Mevcut Şehir Sözü: "${quote}"` : '',
      province.history ? `Tarihsel Özet: ${String(province.history).slice(0, 320)}` : ''
    ].filter(Boolean).join('\n');
  }

  function buildPromptForAction(actionId, province, cityKey) {
    const cityBlock = buildCityContextBlock(province, cityKey);
    const systemPrompt =
      'Sen "Dijital Seyyah: Anadolu Seyahatnamesi" projesinin şehir içi yapay zekâ mihmandarısın. ' +
      'Türkçe, zarif, ilham verici ve pratik cevaplar ver. Yanıtlarında net başlıklar, madde işaretleri ve **kalın** vurgular kullan. ' +
      '5 Gün Kuralı (bir şehirde sindirerek konaklama), İl Halk Kütüphanesi çalışma disiplini ve Anadolu irfanına saygılı bir üslup benimse.';

    let userPrompt = '';
    switch (actionId) {
      case 'plan5':
        userPrompt =
          `${province.name} için "5 Gün Kuralı" ruhuna uygun, dengeli ve uygulanabilir bir 5 günlük keşif & tefekkür planı hazırla.\n` +
          `Her günü "### X. Gün: ..." başlığıyla yaz; sabah keşfi, öğle İl Halk Kütüphanesi/okuma molası ve akşam yöresel lezzet/yürüyüş dengesini kur.\n\n` +
          `Şehir Verileri:\n${cityBlock}`;
        break;
      case 'reflection':
        userPrompt =
          `${province.name} şehrinin tarihî dokusundan, manevi mirası ve hikmet dünyasından beslenen özgün bir "Tefekkür & Hikmet Notu" kaleme al.\n` +
          `İçinde şehrin ruhunu yansıtan kısa bir girizgâh, 3 derin tefekkür maddesi ve yolcuya kalıcı bir hikmet cümlesi bulunsun.\n\n` +
          `Şehir Verileri:\n${cityBlock}`;
        break;
      case 'library':
        userPrompt =
          `${province.name} şehrinde bir dijital seyyah ve araştırmacı için "Kütüphane & Derin Odak Stratejisi" oluştur.\n` +
          `Mevcut kütüphane bilgisini merkeze alarak: 1) Çalışma ortamı ve günlük odak blokları (Pomodoro/derin çalışma), ` +
          `2) Bu şehirle bağlantılı 2-3 okuma/araştırma teması, 3) Zihin tazeleme ve yürüyüş molası önerisi ver.\n\n` +
          `Şehir Verileri:\n${cityBlock}`;
        break;
      case 'gastronomy':
        userPrompt =
          `${province.name} için sabahtan akşama uzanan otantik bir "Gurme Lezzet Rotası" çıkar.\n` +
          `Şehrin bilinen yöresel tatlarını öne çıkar; kahvaltı, öğle esnaf lokantası, ikindi çay/kahve durağı ve akşam yemeği olarak sırala, yanına küçük yerel seçicilik ipuçları ekle.\n\n` +
          `Şehir Verileri:\n${cityBlock}`;
        break;
      default:
        userPrompt = `${province.name} hakkında kısa bir seyyah rehberi özeti hazırla.\n\n${cityBlock}`;
        break;
    }

    return { systemPrompt, userPrompt };
  }

  async function callGeminiWithFallback(systemPrompt, userPrompt, apiKey) {
    const candidateModels = getCandidateModels();
    let lastError = null;

    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      let res;
      let data;

      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.75,
              maxOutputTokens: 1600
            }
          })
        });
        data = await res.json().catch(() => ({}));
      } catch (networkErr) {
        lastError = new Error('Ağ bağlantısı kurulamadı. İnternet bağlantınızı kontrol edin.');
        continue;
      }

      if (!res.ok) {
        const apiMsg = (data && data.error && data.error.message) || `HTTP ${res.status}`;
        lastError = new Error(apiMsg);

        const isRetryable =
          res.status === 429 ||
          res.status === 404 ||
          res.status === 503 ||
          /quota|billing|limit|not found|high demand|no longer available|deprecated|retired|overloaded/i.test(apiMsg);

        if (isRetryable) {
          continue;
        }
        throw lastError;
      }

      const parts =
        data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        Array.isArray(data.candidates[0].content.parts)
          ? data.candidates[0].content.parts
          : [];

      const text = parts.map((pt) => pt.text || '').join('\n').trim();
      if (text) {
        return { text, model };
      }

      lastError = new Error('Gemini modelinden boş yanıt döndü.');
    }

    throw lastError || new Error('Gemini API şu anda yanıt veremiyor.');
  }

  function formatInlineMd(text) {
    return esc(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
  }

  function renderMarkdownToHtml(rawText) {
    const lines = String(rawText || '').replace(/\r\n/g, '\n').split('\n');
    const htmlParts = [];
    let listType = null; // 'ul' | 'ol'

    const closeList = () => {
      if (listType) {
        htmlParts.push(`</${listType}>`);
        listType = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        closeList();
        continue;
      }

      const h3 = line.match(/^###\s+(.+)$/);
      const h2 = line.match(/^##\s+(.+)$/);
      const h1 = line.match(/^#\s+(.+)$/);
      if (h3 || h2 || h1) {
        closeList();
        const headingText = (h3 || h2 || h1)[1];
        htmlParts.push(`<h4 class="aicc-md-heading">${formatInlineMd(headingText)}</h4>`);
        continue;
      }

      const quoteMatch = line.match(/^>\s+(.+)$/);
      if (quoteMatch) {
        closeList();
        htmlParts.push(`<blockquote class="aicc-md-quote">${formatInlineMd(quoteMatch[1])}</blockquote>`);
        continue;
      }

      const ulMatch = line.match(/^[-*•]\s+(.+)$/);
      if (ulMatch) {
        if (listType !== 'ul') {
          closeList();
          listType = 'ul';
          htmlParts.push('<ul class="aicc-md-list">');
        }
        htmlParts.push(`<li>${formatInlineMd(ulMatch[1])}</li>`);
        continue;
      }

      const olMatch = line.match(/^\d+[.)]\s+(.+)$/);
      if (olMatch) {
        if (listType !== 'ol') {
          closeList();
          listType = 'ol';
          htmlParts.push('<ol class="aicc-md-list aicc-md-olist">');
        }
        htmlParts.push(`<li>${formatInlineMd(olMatch[1])}</li>`);
        continue;
      }

      closeList();
      htmlParts.push(`<p class="aicc-md-para">${formatInlineMd(line)}</p>`);
    }

    closeList();
    return htmlParts.join('');
  }

  async function copyToClipboard(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {}

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
      return Boolean(ok);
    } catch (e) {
      return false;
    }
  }

  function appendJournalEntry(entry) {
    try {
      const raw = localStorage.getItem(JOURNAL_ENTRIES_STORAGE);
      let entries = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) entries = parsed;
      }
      entries.unshift(entry);
      localStorage.setItem(JOURNAL_ENTRIES_STORAGE, JSON.stringify(entries));
      return { saved: true, count: entries.length };
    } catch (e) {
      return { saved: false, count: 0 };
    }
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .${BOX_CLASS} {
        position: relative;
        overflow: hidden;
        padding: 20px 22px;
        border-radius: var(--radius-lg, 20px);
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.72) 100%);
        border: 1px solid rgba(0, 242, 254, 0.28);
        box-shadow: 0 14px 36px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .${BOX_CLASS}::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(circle at 12% 0%, rgba(0, 242, 254, 0.12), transparent 45%),
                    radial-gradient(circle at 92% 100%, rgba(245, 158, 11, 0.1), transparent 45%);
      }

      .${BOX_CLASS} > * {
        position: relative;
        z-index: 1;
      }

      .aicc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .aicc-title-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .aicc-orb {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.05rem;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.22), rgba(168, 85, 247, 0.24));
        border: 1px solid rgba(0, 242, 254, 0.38);
        box-shadow: 0 0 18px rgba(0, 242, 254, 0.18);
        flex-shrink: 0;
      }

      .aicc-title {
        font-family: var(--font-heading);
        font-size: 1.02rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
        letter-spacing: 0.2px;
      }

      .aicc-subtitle {
        font-size: 0.78rem;
        color: var(--text-secondary);
        margin-top: 2px;
      }

      .aicc-badge {
        font-size: 0.72rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 9999px;
        background: rgba(0, 242, 254, 0.12);
        color: var(--accent-cyan);
        border: 1px solid rgba(0, 242, 254, 0.28);
        white-space: nowrap;
      }

      .aicc-badge.is-missing {
        background: rgba(245, 158, 11, 0.14);
        color: var(--accent-gold);
        border-color: rgba(245, 158, 11, 0.32);
      }

      .aicc-actions-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      @media (max-width: 900px) {
        .aicc-actions-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 520px) {
        .aicc-actions-grid {
          grid-template-columns: 1fr;
        }
      }

      .aicc-btn {
        appearance: none;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.56);
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 0.83rem;
        font-weight: 600;
        padding: 11px 12px;
        border-radius: var(--radius-md, 12px);
        cursor: pointer;
        text-align: left;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
      }

      .aicc-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        border-color: var(--accent-cyan);
        background: rgba(0, 242, 254, 0.1);
        box-shadow: 0 8px 20px -8px rgba(0, 242, 254, 0.35);
      }

      .aicc-btn[data-accent="purple"]:hover:not(:disabled),
      .aicc-btn[data-accent="purple"].is-active {
        border-color: var(--accent-purple);
        background: rgba(168, 85, 247, 0.14);
        box-shadow: 0 8px 20px -8px rgba(168, 85, 247, 0.35);
      }

      .aicc-btn[data-accent="emerald"]:hover:not(:disabled),
      .aicc-btn[data-accent="emerald"].is-active {
        border-color: var(--accent-emerald);
        background: rgba(16, 185, 129, 0.14);
        box-shadow: 0 8px 20px -8px rgba(16, 185, 129, 0.35);
      }

      .aicc-btn[data-accent="gold"]:hover:not(:disabled),
      .aicc-btn[data-accent="gold"].is-active {
        border-color: var(--accent-gold);
        background: rgba(245, 158, 11, 0.14);
        box-shadow: 0 8px 20px -8px rgba(245, 158, 11, 0.35);
      }

      .aicc-btn[data-accent="cyan"].is-active {
        border-color: var(--accent-cyan);
        background: rgba(0, 242, 254, 0.14);
      }

      .aicc-btn:disabled {
        opacity: 0.6;
        cursor: wait;
      }

      .aicc-result-panel {
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(10, 15, 29, 0.62);
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .aicc-result-panel.is-hidden {
        display: none;
      }

      .aicc-result-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        padding-bottom: 10px;
      }

      .aicc-result-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .aicc-result-title {
        font-family: var(--font-heading);
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--accent-cyan);
      }

      .aicc-model-pill {
        font-size: 0.7rem;
        padding: 2px 8px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.07);
        color: var(--text-secondary);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .aicc-result-tools {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .aicc-tool-btn {
        appearance: none;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(30, 41, 59, 0.75);
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 0.76rem;
        font-weight: 600;
        padding: 6px 11px;
        border-radius: 8px;
        cursor: pointer;
        transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;
      }

      .aicc-tool-btn:hover {
        border-color: var(--accent-cyan);
        background: rgba(0, 242, 254, 0.12);
        transform: translateY(-1px);
      }

      .aicc-tool-btn.is-journal {
        border-color: rgba(16, 185, 129, 0.35);
        background: rgba(16, 185, 129, 0.12);
        color: var(--accent-emerald);
      }

      .aicc-tool-btn.is-journal:hover {
        border-color: var(--accent-emerald);
        background: rgba(16, 185, 129, 0.22);
      }

      /* Typing Shimmer Loader */
      .aicc-shimmer-wrap {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 4px 0;
      }

      .aicc-typing-label {
        font-size: 0.84rem;
        color: var(--accent-cyan);
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .aicc-typing-dots {
        display: inline-flex;
        gap: 4px;
      }

      .aicc-typing-dots span {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--accent-cyan);
        animation: aicc-dot-pulse 1.2s infinite ease-in-out;
      }

      .aicc-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
      .aicc-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

      .aicc-shimmer-line {
        height: 12px;
        border-radius: 9999px;
        background: linear-gradient(90deg,
          rgba(148, 163, 184, 0.12) 0%,
          rgba(0, 242, 254, 0.24) 50%,
          rgba(148, 163, 184, 0.12) 100%);
        background-size: 200% 100%;
        animation: aicc-shimmer-slide 1.35s infinite linear;
      }

      .aicc-shimmer-line.w-95 { width: 95%; }
      .aicc-shimmer-line.w-82 { width: 82%; }
      .aicc-shimmer-line.w-68 { width: 68%; }

      @keyframes aicc-shimmer-slide {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      @keyframes aicc-dot-pulse {
        0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
        40% { opacity: 1; transform: scale(1.15); }
      }

      @media (prefers-reduced-motion: reduce) {
        .aicc-shimmer-line,
        .aicc-typing-dots span {
          animation: none;
        }
      }

      /* Rich Formatted Result Body */
      .aicc-result-body {
        font-size: 0.9rem;
        line-height: 1.68;
        color: var(--text-primary);
      }

      .aicc-md-heading {
        font-family: var(--font-heading);
        font-size: 0.96rem;
        font-weight: 700;
        color: var(--accent-gold);
        margin: 12px 0 6px;
      }

      .aicc-md-heading:first-child {
        margin-top: 0;
      }

      .aicc-md-para {
        margin: 0 0 8px;
        color: var(--text-secondary);
      }

      .aicc-md-para:last-child {
        margin-bottom: 0;
      }

      .aicc-md-para strong,
      .aicc-md-list strong {
        color: var(--text-primary);
      }

      .aicc-md-list {
        margin: 4px 0 10px 18px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        color: var(--text-secondary);
      }

      .aicc-md-quote {
        margin: 8px 0;
        padding: 8px 12px;
        border-left: 3px solid var(--accent-purple);
        background: rgba(168, 85, 247, 0.08);
        border-radius: 0 8px 8px 0;
        color: var(--text-primary);
        font-style: italic;
      }

      .aicc-notice {
        padding: 12px 14px;
        border-radius: 10px;
        border: 1px solid rgba(245, 158, 11, 0.35);
        background: rgba(245, 158, 11, 0.1);
        color: var(--text-primary);
        font-size: 0.86rem;
        line-height: 1.55;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .aicc-notice-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      /* Light Theme Compatibility */
      body.light-theme .${BOX_CLASS} {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(241, 245, 249, 0.9) 100%);
        border-color: rgba(2, 132, 199, 0.28);
        box-shadow: 0 12px 28px -8px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8);
      }

      body.light-theme .aicc-btn {
        background: rgba(248, 250, 252, 0.95);
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      body.light-theme .aicc-btn:hover:not(:disabled) {
        background: rgba(2, 132, 199, 0.09);
      }

      body.light-theme .aicc-result-panel {
        background: rgba(248, 250, 252, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .aicc-tool-btn {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      body.light-theme .aicc-tool-btn.is-journal {
        background: rgba(5, 150, 105, 0.1);
        border-color: rgba(5, 150, 105, 0.35);
        color: #047857;
      }

      body.light-theme .aicc-model-pill {
        background: rgba(15, 23, 42, 0.06);
        border-color: rgba(15, 23, 42, 0.1);
        color: #334155;
      }

      body.light-theme .aicc-shimmer-line {
        background: linear-gradient(90deg,
          rgba(15, 23, 42, 0.08) 0%,
          rgba(2, 132, 199, 0.2) 50%,
          rgba(15, 23, 42, 0.08) 100%);
        background-size: 200% 100%;
      }

      body.light-theme .aicc-notice {
        background: rgba(245, 158, 11, 0.1);
        border-color: rgba(217, 119, 6, 0.35);
        color: #1e293b;
      }
    `;
    document.head.appendChild(style);
  }

  function createConciergeCard(province, cityKey) {
    const hasKey = Boolean(getStoredApiKey());
    const box = document.createElement('section');
    box.className = BOX_CLASS;
    box.setAttribute('data-city-key', cityKey);
    box.setAttribute('aria-label', `${province.name} Yapay Zekâ Şehir Mihmandarı`);

    const buttonsHtml = CONCIERGE_ACTIONS.map((act) => `
      <button type="button" class="aicc-btn" data-action-id="${esc(act.id)}" data-accent="${esc(act.accent)}">
        <span>${esc(act.label)}</span>
      </button>
    `).join('');

    box.innerHTML = `
      <div class="aicc-header">
        <div class="aicc-title-wrap">
          <span class="aicc-orb" aria-hidden="true">✨</span>
          <div>
            <h3 class="aicc-title">Gemini AI Şehir Mihmandarı — ${esc(province.name)}</h3>
            <div class="aicc-subtitle">Tek tıkla bu ile özel gezi planı, tefekkür notu, odak stratejisi ve lezzet rotası üretin.</div>
          </div>
        </div>
        <span class="aicc-badge ${hasKey ? '' : 'is-missing'}" data-aicc-status-badge>
          ${hasKey ? '⚡ Gemini Hazır' : '🔑 API Anahtarı Bekleniyor'}
        </span>
      </div>

      <div class="aicc-actions-grid">
        ${buttonsHtml}
      </div>

      <div class="aicc-result-panel is-hidden" data-aicc-result-panel>
        <div class="aicc-result-head" data-aicc-result-head>
          <div class="aicc-result-meta">
            <span class="aicc-result-title" data-aicc-result-title></span>
            <span class="aicc-model-pill" data-aicc-model-pill></span>
          </div>
          <div class="aicc-result-tools" data-aicc-result-tools>
            <button type="button" class="aicc-tool-btn" data-aicc-copy>📋 Kopyala</button>
            <button type="button" class="aicc-tool-btn is-journal" data-aicc-journal>📝 Seyir Defterine Ekle</button>
          </div>
        </div>
        <div class="aicc-result-body" data-aicc-result-body></div>
      </div>
    `;

    const resultPanel = box.querySelector('[data-aicc-result-panel]');
    const resultHead = box.querySelector('[data-aicc-result-head]');
    const resultTitle = box.querySelector('[data-aicc-result-title]');
    const modelPill = box.querySelector('[data-aicc-model-pill]');
    const resultBody = box.querySelector('[data-aicc-result-body]');
    const statusBadge = box.querySelector('[data-aicc-status-badge]');
    const copyBtn = box.querySelector('[data-aicc-copy]');
    const journalBtn = box.querySelector('[data-aicc-journal]');
    const actionButtons = Array.from(box.querySelectorAll('.aicc-btn'));

    let currentOutputText = '';
    let currentActionMeta = null;
    let currentModelUsed = '';

    function setButtonsBusy(busy) {
      actionButtons.forEach((btn) => {
        btn.disabled = busy;
      });
    }

    function showMissingKeyNotice() {
      if (statusBadge) {
        statusBadge.classList.add('is-missing');
        statusBadge.textContent = '🔑 API Anahtarı Bekleniyor';
      }
      resultPanel.classList.remove('is-hidden');
      resultHead.style.display = 'none';
      resultBody.innerHTML = `
        <div class="aicc-notice">
          <div>
            <strong>Gemini API Anahtarı Tanımlı Değil:</strong> Canlı şehir mihmandarını çalıştırmak için
            <code>dijital_seyyah_gemini_api_key</code> anahtarınızı Seyyah Rehberi veya Admin Paneli üzerinden kaydedin.
          </div>
          <div class="aicc-notice-actions">
            <button type="button" class="aicc-tool-btn" data-aicc-open-advisor>🧭 Seyyah Rehberini Aç</button>
            <button type="button" class="aicc-tool-btn" data-aicc-open-admin>⚙️ Admin Panelini Aç</button>
          </div>
        </div>
      `;

      const advisorNav = resultBody.querySelector('[data-aicc-open-advisor]');
      const adminNav = resultBody.querySelector('[data-aicc-open-admin]');
      if (advisorNav) {
        advisorNav.addEventListener('click', () => {
          if (activeCtx && typeof activeCtx.openView === 'function') {
            activeCtx.openView('advisor');
          }
        });
      }
      if (adminNav) {
        adminNav.addEventListener('click', () => {
          if (activeCtx && typeof activeCtx.openView === 'function') {
            activeCtx.openView('admin');
          }
        });
      }
    }

    function showLoadingShimmer(actionMeta) {
      resultPanel.classList.remove('is-hidden');
      resultHead.style.display = 'flex';
      resultTitle.textContent = `${actionMeta.title} — ${province.name}`;
      modelPill.textContent = 'Üretiliyor...';
      copyBtn.style.display = 'none';
      journalBtn.style.display = 'none';
      resultBody.innerHTML = `
        <div class="aicc-shimmer-wrap" aria-live="polite">
          <div class="aicc-typing-label">
            <span>✨ ${esc(province.name)} için yapay zekâ yanıtı hazırlanıyor</span>
            <span class="aicc-typing-dots" aria-hidden="true"><span></span><span></span><span></span></span>
          </div>
          <div class="aicc-shimmer-line w-95"></div>
          <div class="aicc-shimmer-line w-82"></div>
          <div class="aicc-shimmer-line w-95"></div>
          <div class="aicc-shimmer-line w-68"></div>
        </div>
      `;
    }

    function renderSuccessResult(actionMeta, text, modelName) {
      currentOutputText = text;
      currentActionMeta = actionMeta;
      currentModelUsed = modelName;

      if (statusBadge) {
        statusBadge.classList.remove('is-missing');
        statusBadge.textContent = '⚡ Gemini Hazır';
      }

      resultPanel.classList.remove('is-hidden');
      resultHead.style.display = 'flex';
      resultTitle.textContent = `${actionMeta.title} — ${province.name}`;
      modelPill.textContent = modelName;
      copyBtn.style.display = 'inline-flex';
      journalBtn.style.display = 'inline-flex';
      journalBtn.textContent = '📝 Seyir Defterine Ekle';
      resultBody.innerHTML = renderMarkdownToHtml(text);
    }

    function renderErrorResult(actionMeta, errMsg) {
      currentOutputText = '';
      resultPanel.classList.remove('is-hidden');
      resultHead.style.display = 'flex';
      resultTitle.textContent = `${actionMeta.title} — ${province.name}`;
      modelPill.textContent = 'Bağlantı Hatası';
      copyBtn.style.display = 'none';
      journalBtn.style.display = 'none';
      resultBody.innerHTML = `
        <div class="aicc-notice">
          <div><strong>Yanıt Alınamadı:</strong> ${esc(errMsg || 'Beklenmeyen bir hata oluştu.')}</div>
        </div>
      `;
    }

    actionButtons.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const actionId = btn.getAttribute('data-action-id');
        const actionMeta = CONCIERGE_ACTIONS.find((a) => a.id === actionId);
        if (!actionMeta) return;

        actionButtons.forEach((b) => b.classList.toggle('is-active', b === btn));

        const apiKey = getStoredApiKey();
        if (!apiKey) {
          showMissingKeyNotice();
          return;
        }

        const cacheKey = `${cityKey}::${actionId}`;
        if (responseCache.has(cacheKey)) {
          const cached = responseCache.get(cacheKey);
          renderSuccessResult(actionMeta, cached.text, cached.model);
          return;
        }

        const token = ++requestCounter;
        setButtonsBusy(true);
        showLoadingShimmer(actionMeta);

        try {
          const { systemPrompt, userPrompt } = buildPromptForAction(actionId, province, cityKey);
          const result = await callGeminiWithFallback(systemPrompt, userPrompt, apiKey);

          if (!box.isConnected || token !== requestCounter) return;
          responseCache.set(cacheKey, result);
          renderSuccessResult(actionMeta, result.text, result.model);
        } catch (err) {
          if (!box.isConnected || token !== requestCounter) return;
          renderErrorResult(actionMeta, err && err.message ? err.message : String(err));
        } finally {
          if (box.isConnected) {
            setButtonsBusy(false);
          }
        }
      });
    });

    copyBtn.addEventListener('click', async () => {
      if (!currentOutputText) return;
      const ok = await copyToClipboard(currentOutputText);
      notify(ok ? `📋 ${province.name} AI notu panoya kopyalandı!` : '⚠️ Panoya kopyalanamadı.');
    });

    journalBtn.addEventListener('click', async () => {
      if (!currentOutputText || !currentActionMeta) return;

      const entry = {
        id: `aicc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        cityKey,
        cityName: province.name,
        plate: province.plate || null,
        region: province.region || '',
        mode: currentActionMeta.id,
        title: `${province.name} — ${currentActionMeta.title}`,
        content: currentOutputText,
        model: currentModelUsed,
        createdAt: new Date().toISOString()
      };

      const res = appendJournalEntry(entry);
      if (res.saved) {
        journalBtn.textContent = '✓ Seyir Defterine Eklendi';
        notify(`📝 ${province.name} notu Seyir Defterine eklendi! (Toplam ${res.count} kayıt)`);
      } else {
        const copied = await copyToClipboard(currentOutputText);
        notify(
          copied
            ? '📋 Yerel depolama dolu olduğu için içerik panoya kopyalandı.'
            : '⚠️ Seyir Defterine eklenemedi.'
        );
      }
    });

    return box;
  }

  function tryInjectIntoViewport() {
    const ctx = activeCtx;
    if (!ctx || !ctx.state || !ctx.data || !ctx.data.provinces) return;

    const viewport = document.getElementById(VIEWPORT_ID);
    if (!viewport) return;

    if (
      ctx.state.currentView === 'city' &&
      ctx.state.selectedCityKey &&
      !viewport.querySelector(`.${BOX_CLASS}`)
    ) {
      const cityKey = ctx.state.selectedCityKey;
      const province = ctx.data.provinces[cityKey];
      if (!province) return;

      const card = createConciergeCard(province, cityKey);
      const detailRoot = viewport.querySelector('.city-detail-view') || viewport;
      const heroEl = detailRoot.querySelector('.city-hero');

      if (heroEl && heroEl.parentElement === detailRoot) {
        heroEl.insertAdjacentElement('afterend', card);
      } else {
        detailRoot.insertAdjacentElement('afterbegin', card);
      }
    }
  }

  function init(ctx) {
    activeCtx = ctx || activeCtx;
    injectStyles();

    const viewport = document.getElementById(VIEWPORT_ID);
    if (!viewport) return;

    if (!initialized) {
      initialized = true;
      observer = new MutationObserver(() => {
        tryInjectIntoViewport();
      });
      observer.observe(viewport, { childList: true });
    }

    tryInjectIntoViewport();
  }

  window.SEYYAH_MODULES.aiCityConcierge = {
    init
  };
})();
