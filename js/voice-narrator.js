/* ==========================================================================
   Dijital Seyyah — Turkish Voice Narrator & Focus Reading Mode
   File: js/voice-narrator.js
   Registers on: window.SEYYAH_MODULES.voiceNarrator = { init(ctx) }
   Features:
     1. MutationObserver on #viewport-content detecting city detail views
     2. Compact luxury floating toolbar (.voice-narrator-bar) at top of city view
     3. Web Speech API Turkish (tr-TR) narration (name, quote, history,
        reflection, landmarks) with sentence chunking & clean markdown stripping
     4. Speed toggle (0.9x / 1.0x / 1.2x) with live rate switching
     5. "📖 Odak Modu" toggle hiding sidebar & module nav strip cleanly
     6. Automatic speech cancellation & focus restore on navigation
     7. Full dark & light-theme compatibility, zero external dependencies
   ========================================================================== */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-voice-narrator-styles';
  const BAR_CLASS = 'voice-narrator-bar';
  const FOCUS_BODY_CLASS = 'seyyah-focus-mode';
  const SPEEDS = [0.9, 1.0, 1.2];
  const MAX_CHUNK_LEN = 220;

  let initialized = false;
  let moduleCtx = null;
  let viewportEl = null;
  let observer = null;

  // Navigation & UI state
  let activeCityKey = null;
  let focusModeActive = false;

  // Speech state
  let speechRate = 1.0;
  let isSpeaking = false;
  let isPaused = false;
  let speechQueue = [];
  let currentChunkIndex = 0;
  let sessionCounter = 0;
  let selectedVoice = null;
  let voicesListenerBound = false;

  /**
   * Inject self-contained styles for the floating narrator bar and focus mode,
   * supporting both dark Cyber-Sufi and light themes.
   */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Focus Reading Mode */
      body.${FOCUS_BODY_CLASS} .module-nav-strip {
        display: none !important;
      }

      body.${FOCUS_BODY_CLASS} aside.sidebar,
      body.${FOCUS_BODY_CLASS} #city-sidebar,
      body.${FOCUS_BODY_CLASS} .sidebar-backdrop {
        display: none !important;
      }

      body.${FOCUS_BODY_CLASS} .main-layout {
        grid-template-columns: 1fr !important;
      }

      body.${FOCUS_BODY_CLASS} .content-viewport {
        padding-left: clamp(16px, 4vw, 48px);
        padding-right: clamp(16px, 4vw, 48px);
      }

      body.${FOCUS_BODY_CLASS} .city-detail-view {
        max-width: 900px;
        margin-left: auto;
        margin-right: auto;
      }

      /* Floating Luxury Narrator Toolbar */
      .${BAR_CLASS} {
        position: sticky;
        top: 8px;
        z-index: 35;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px 14px;
        padding: 10px 16px;
        margin-bottom: 16px;
        border-radius: var(--radius-md, 12px);
        background: var(--bg-glass, rgba(15, 23, 42, 0.88));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(0, 242, 254, 0.24);
        box-shadow:
          0 10px 30px -8px rgba(0, 0, 0, 0.48),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);
        transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
      }

      .${BAR_CLASS}.is-speaking {
        border-color: rgba(0, 242, 254, 0.55);
        box-shadow:
          0 12px 32px -6px rgba(0, 242, 254, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.12);
      }

      .${BAR_CLASS}.is-paused {
        border-color: rgba(245, 158, 11, 0.45);
      }

      .vn-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex: 1 1 200px;
      }

      .vn-wave {
        display: inline-flex;
        align-items: flex-end;
        gap: 2.5px;
        height: 16px;
        width: 18px;
        flex-shrink: 0;
        justify-content: center;
      }

      .vn-wave span {
        display: block;
        width: 3px;
        height: 5px;
        border-radius: 999px;
        background: var(--accent-cyan, #00f2fe);
        opacity: 0.55;
        transition: height 0.2s ease, opacity 0.2s ease;
      }

      .${BAR_CLASS}.is-speaking .vn-wave span {
        opacity: 1;
        animation: seyyahVnWave 0.9s ease-in-out infinite;
      }

      .${BAR_CLASS}.is-speaking .vn-wave span:nth-child(2) {
        animation-delay: 0.18s;
      }

      .${BAR_CLASS}.is-speaking .vn-wave span:nth-child(3) {
        animation-delay: 0.36s;
      }

      .${BAR_CLASS}.is-paused .vn-wave span {
        background: var(--accent-gold, #f59e0b);
        opacity: 0.85;
        height: 7px;
      }

      @keyframes seyyahVnWave {
        0%, 100% { height: 4px; }
        50% { height: 15px; }
      }

      .vn-meta {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .vn-title {
        font-family: var(--font-heading, inherit);
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.3px;
        color: var(--text-primary, #f8fafc);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .vn-status {
        font-size: 0.72rem;
        color: var(--text-secondary, #94a3b8);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .vn-controls {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .vn-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: var(--radius-sm, 8px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, inherit);
        font-size: 0.8rem;
        font-weight: 600;
        line-height: 1.2;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .vn-btn:hover:not(:disabled) {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        transform: translateY(-1px);
      }

      .vn-btn:focus-visible,
      .vn-speed-btn:focus-visible {
        outline: 2px solid var(--accent-cyan, #00f2fe);
        outline-offset: 2px;
      }

      .vn-btn:disabled {
        opacity: 0.42;
        cursor: not-allowed;
        transform: none;
      }

      .vn-btn-play {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.22), rgba(16, 185, 129, 0.18));
        border-color: rgba(0, 242, 254, 0.4);
      }

      .${BAR_CLASS}.is-speaking .vn-btn-play {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(217, 119, 6, 0.16));
        border-color: rgba(245, 158, 11, 0.45);
      }

      .vn-btn-stop:hover:not(:disabled) {
        border-color: rgba(244, 63, 94, 0.55);
        background: rgba(244, 63, 94, 0.14);
      }

      .vn-speed-group {
        display: inline-flex;
        align-items: center;
        padding: 2px;
        border-radius: var(--radius-sm, 8px);
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        gap: 2px;
      }

      .vn-speed-btn {
        border: none;
        background: transparent;
        color: var(--text-secondary, #94a3b8);
        font-family: var(--font-body, inherit);
        font-size: 0.75rem;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .vn-speed-btn:hover {
        color: var(--text-primary, #f8fafc);
        background: rgba(255, 255, 255, 0.08);
      }

      .vn-speed-btn.active {
        background: rgba(0, 242, 254, 0.2);
        color: var(--accent-cyan, #00f2fe);
        box-shadow: inset 0 0 0 1px rgba(0, 242, 254, 0.35);
      }

      .vn-btn-focus.active {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(0, 242, 254, 0.16));
        border-color: var(--accent-emerald, #10b981);
        color: #6ee7b7;
        box-shadow: 0 0 14px rgba(16, 185, 129, 0.22);
      }

      /* Light Theme Overrides */
      body.light-theme .${BAR_CLASS},
      [data-theme="light"] .${BAR_CLASS} {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(2, 132, 199, 0.26);
        box-shadow:
          0 10px 26px -8px rgba(15, 23, 42, 0.14),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
      }

      body.light-theme .${BAR_CLASS}.is-speaking,
      [data-theme="light"] .${BAR_CLASS}.is-speaking {
        border-color: rgba(2, 132, 199, 0.55);
        box-shadow: 0 10px 28px -6px rgba(2, 132, 199, 0.2);
      }

      body.light-theme .vn-btn,
      [data-theme="light"] .vn-btn {
        background: rgba(241, 245, 249, 0.9);
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      body.light-theme .vn-btn:hover:not(:disabled),
      [data-theme="light"] .vn-btn:hover:not(:disabled) {
        background: rgba(2, 132, 199, 0.1);
        border-color: #0284c7;
      }

      body.light-theme .vn-btn-play,
      [data-theme="light"] .vn-btn-play {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.14), rgba(5, 150, 105, 0.12));
        border-color: rgba(2, 132, 199, 0.35);
        color: #0f172a;
      }

      body.light-theme .${BAR_CLASS}.is-speaking .vn-btn-play,
      [data-theme="light"] .${BAR_CLASS}.is-speaking .vn-btn-play {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.16), rgba(245, 158, 11, 0.14));
        border-color: rgba(217, 119, 6, 0.45);
      }

      body.light-theme .vn-speed-group,
      [data-theme="light"] .vn-speed-group {
        background: rgba(241, 245, 249, 0.95);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .vn-speed-btn,
      [data-theme="light"] .vn-speed-btn {
        color: #475569;
      }

      body.light-theme .vn-speed-btn:hover,
      [data-theme="light"] .vn-speed-btn:hover {
        color: #0f172a;
        background: rgba(15, 23, 42, 0.06);
      }

      body.light-theme .vn-speed-btn.active,
      [data-theme="light"] .vn-speed-btn.active {
        background: rgba(2, 132, 199, 0.14);
        color: #0284c7;
        box-shadow: inset 0 0 0 1px rgba(2, 132, 199, 0.3);
      }

      body.light-theme .vn-btn-focus.active,
      [data-theme="light"] .vn-btn-focus.active {
        background: linear-gradient(135deg, rgba(5, 150, 105, 0.16), rgba(2, 132, 199, 0.1));
        border-color: #059669;
        color: #065f46;
      }

      @media (max-width: 640px) {
        .${BAR_CLASS} {
          padding: 10px 12px;
        }
        .vn-left {
          flex-basis: 100%;
        }
        .vn-controls {
          width: 100%;
          justify-content: flex-start;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .${BAR_CLASS}.is-speaking .vn-wave span {
          animation: none;
          height: 11px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function notifyToast(msg) {
    if (moduleCtx && typeof moduleCtx.showToast === 'function') {
      moduleCtx.showToast(msg);
    }
  }

  function isSpeechSupported() {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance === 'function'
    );
  }

  /**
   * Pick the clearest available Turkish (tr-TR) voice.
   */
  function pickTurkishVoice() {
    if (!isSpeechSupported()) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    const scoreVoice = (v) => {
      const lang = String(v.lang || '').toLowerCase().replace('_', '-');
      const name = String(v.name || '').toLowerCase();
      let score = 0;

      if (lang === 'tr-tr') score += 100;
      else if (lang.startsWith('tr')) score += 60;
      else return -1;

      if (name.includes('natural') || name.includes('online')) score += 25;
      if (name.includes('google') || name.includes('microsoft')) score += 15;
      if (name.includes('emel') || name.includes('ahmet') || name.includes('yelda') || name.includes('tolga')) {
        score += 10;
      }
      if (v.localService) score += 5;
      if (v.default) score += 2;
      return score;
    };

    let best = null;
    let bestScore = -1;
    for (let i = 0; i < voices.length; i += 1) {
      const s = scoreVoice(voices[i]);
      if (s > bestScore) {
        bestScore = s;
        best = voices[i];
      }
    }

    selectedVoice = best;
    return best;
  }

  function bindVoiceListener() {
    if (voicesListenerBound || !isSpeechSupported()) return;
    voicesListenerBound = true;
    pickTurkishVoice();

    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', pickTurkishVoice);
    } else if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = pickTurkishVoice;
    }
  }

  /**
   * Strip inline markdown and normalize whitespace so TTS reads naturally.
   */
  function cleanSpeechText(raw) {
    if (!raw) return '';
    return String(raw)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`#>~]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Split long prose into manageable chunks (avoids browser ~15s TTS cutoffs).
   */
  function chunkSentences(text, label) {
    const cleaned = cleanSpeechText(text);
    if (!cleaned) return [];

    const rawSentences = cleaned.split(/(?<=[.!?…])\s+/);
    const result = [];

    for (let i = 0; i < rawSentences.length; i += 1) {
      let s = rawSentences[i].trim();
      if (!s) continue;

      if (s.length <= MAX_CHUNK_LEN) {
        result.push({ label, text: s });
        continue;
      }

      // Break overly long sentences at natural punctuation or word boundaries
      const parts = s.split(/(?<=[,;:])\s+/);
      let buffer = '';
      for (let j = 0; j < parts.length; j += 1) {
        const part = parts[j].trim();
        if (!part) continue;
        if (buffer && (buffer.length + 1 + part.length) > MAX_CHUNK_LEN) {
          result.push({ label, text: buffer });
          buffer = part;
        } else {
          buffer = buffer ? `${buffer} ${part}` : part;
        }
      }
      if (buffer) {
        result.push({ label, text: buffer });
      }
    }

    return result;
  }

  /**
   * Assemble structured Turkish narration chunks for a province.
   */
  function buildNarrationQueue(province) {
    if (!province) return [];
    const queue = [];

    const plateStr = province.plate != null ? `, ${province.plate} plaka koduyla` : '';
    const regionStr = province.region ? `${province.region} Bölgesi'nde yer alan` : '';
    queue.push({
      label: 'Şehir',
      text: `${province.name}. ${regionStr}${plateStr} Anadolu menzili.`.replace(/\s+/g, ' ').trim()
    });

    const quote = province.custom_quote || province.quote;
    if (quote) {
      queue.push(...chunkSentences(`Şehrin ruhu: ${cleanSpeechText(quote)}`, 'Tefekkür Notu'));
    }

    if (province.history) {
      queue.push({ label: 'Tarihçe', text: 'Şehrin dokusu ve tarihsel arka planı.' });
      queue.push(...chunkSentences(province.history, 'Tarihçe'));
    }

    if (province.reflection) {
      queue.push({ label: 'Tefekkür', text: 'Gezginin not defterinden.' });
      queue.push(...chunkSentences(province.reflection, 'Tefekkür'));
    }

    const landmarks = Array.isArray(province.landmarks) ? province.landmarks.filter(Boolean) : [];
    if (landmarks.length > 0) {
      const lmText = `Öne çıkan miras ve duraklar: ${landmarks.map(cleanSpeechText).join(', ')}.`;
      queue.push(...chunkSentences(lmText, 'Miras & Duraklar'));
    }

    return queue;
  }

  function getProvinceByKey(key) {
    if (!key || !moduleCtx || !moduleCtx.state || !moduleCtx.state.data || !moduleCtx.state.data.provinces) {
      return null;
    }
    return moduleCtx.state.data.provinces[key] || null;
  }

  function isCityViewActive() {
    return Boolean(
      moduleCtx &&
      moduleCtx.state &&
      moduleCtx.state.currentView === 'city' &&
      moduleCtx.state.selectedCityKey
    );
  }

  function getActiveBar() {
    return viewportEl ? viewportEl.querySelector(`.${BAR_CLASS}`) : null;
  }

  /**
   * Update toolbar controls and visual state without recreating DOM nodes.
   */
  function syncBarUI() {
    const bar = getActiveBar();
    if (!bar) return;

    bar.classList.toggle('is-speaking', isSpeaking && !isPaused);
    bar.classList.toggle('is-paused', isPaused);

    const playBtn = bar.querySelector('.vn-btn-play');
    const stopBtn = bar.querySelector('.vn-btn-stop');
    const statusEl = bar.querySelector('.vn-status');
    const focusBtn = bar.querySelector('.vn-btn-focus');

    if (playBtn) {
      if (isSpeaking && !isPaused) {
        playBtn.textContent = '⏸️ Duraklat';
        playBtn.setAttribute('aria-label', 'Seslendirmeyi Duraklat');
      } else if (isPaused) {
        playBtn.textContent = '🔊 Devam Et';
        playBtn.setAttribute('aria-label', 'Seslendirmeye Devam Et');
      } else {
        playBtn.textContent = '🔊 Şehri Dinle';
        playBtn.setAttribute('aria-label', 'Şehri Türkçe Sesli Dinle');
      }
    }

    if (stopBtn) {
      stopBtn.disabled = !isSpeaking && !isPaused;
    }

    if (statusEl) {
      if (isSpeaking && !isPaused) {
        const chunk = speechQueue[currentChunkIndex];
        const section = chunk && chunk.label ? ` • ${chunk.label}` : '';
        statusEl.textContent = `Seslendiriliyor (${speechRate.toFixed(1)}x)${section}`;
      } else if (isPaused) {
        statusEl.textContent = `Duraklatıldı (${speechRate.toFixed(1)}x)`;
      } else {
        const voiceHint = selectedVoice ? selectedVoice.name : 'Türkçe (tr-TR)';
        statusEl.textContent = `Hazır • ${voiceHint}`;
      }
    }

    bar.querySelectorAll('.vn-speed-btn').forEach((btn) => {
      const rate = parseFloat(btn.getAttribute('data-rate'));
      const active = Math.abs(rate - speechRate) < 0.01;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (focusBtn) {
      focusBtn.classList.toggle('active', focusModeActive);
      focusBtn.setAttribute('aria-pressed', focusModeActive ? 'true' : 'false');
    }
  }

  /**
   * Cancel any ongoing speech synthesis and reset playback state.
   */
  function stopSpeech() {
    sessionCounter += 1;
    isSpeaking = false;
    isPaused = false;
    currentChunkIndex = 0;
    speechQueue = [];

    if (isSpeechSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    syncBarUI();
  }

  function speakChunkAt(index) {
    if (!isSpeechSupported()) return;

    if (index >= speechQueue.length) {
      isSpeaking = false;
      isPaused = false;
      currentChunkIndex = 0;
      syncBarUI();
      return;
    }

    const mySession = sessionCounter;
    currentChunkIndex = index;
    const item = speechQueue[index];

    const utterance = new window.SpeechSynthesisUtterance(item.text);
    utterance.lang = 'tr-TR';
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    const voice = selectedVoice || pickTurkishVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      if (mySession !== sessionCounter) return;
      speakChunkAt(index + 1);
    };

    utterance.onerror = (evt) => {
      if (mySession !== sessionCounter) return;
      const err = evt && evt.error;
      if (err === 'canceled' || err === 'interrupted') return;
      stopSpeech();
      notifyToast('🔇 Sesli anlatım sırasında bir hata oluştu.');
    };

    syncBarUI();
    try {
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      stopSpeech();
      notifyToast('🔇 Tarayıcı sesli okuma başlatılamadı.');
    }
  }

  function startSpeech() {
    if (!isSpeechSupported()) {
      notifyToast('⚠️ Bu tarayıcıda Web Speech seslendirme desteklenmiyor.');
      return;
    }

    const province = getProvinceByKey(activeCityKey);
    if (!province) return;

    const queue = buildNarrationQueue(province);
    if (!queue.length) {
      notifyToast('Bu şehir için seslendirilecek metin bulunamadı.');
      return;
    }

    sessionCounter += 1;
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}

    speechQueue = queue;
    currentChunkIndex = 0;
    isSpeaking = true;
    isPaused = false;
    pickTurkishVoice();
    speakChunkAt(0);
  }

  function togglePlayPause() {
    if (!isSpeechSupported()) {
      notifyToast('⚠️ Bu tarayıcıda Web Speech seslendirme desteklenmiyor.');
      return;
    }

    if (!isSpeaking) {
      startSpeech();
      return;
    }

    if (isPaused) {
      isPaused = false;
      try {
        window.speechSynthesis.resume();
      } catch (_) {}
      // If browser dropped paused utterance, restart cleanly from current chunk
      if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
        sessionCounter += 1;
        speakChunkAt(currentChunkIndex);
        return;
      }
      syncBarUI();
    } else {
      isPaused = true;
      try {
        window.speechSynthesis.pause();
      } catch (_) {}
      syncBarUI();
    }
  }

  function setSpeed(nextRate) {
    if (!SPEEDS.includes(nextRate)) return;
    if (Math.abs(speechRate - nextRate) < 0.01) return;

    speechRate = nextRate;

    if (isSpeaking && !isPaused && speechQueue.length > 0 && isSpeechSupported()) {
      const resumeIdx = currentChunkIndex;
      sessionCounter += 1;
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
      speakChunkAt(resumeIdx);
      return;
    }

    syncBarUI();
  }

  function setFocusMode(enabled, announce = false) {
    const next = Boolean(enabled);
    if (focusModeActive === next) return;

    focusModeActive = next;
    document.body.classList.toggle(FOCUS_BODY_CLASS, focusModeActive);
    syncBarUI();

    if (announce) {
      notifyToast(
        focusModeActive
          ? '📖 Odak Modu açıldı — dikkat dağıtıcı paneller gizlendi'
          : '📖 Odak Modu kapatıldı'
      );
    }
  }

  function toggleFocusMode() {
    setFocusMode(!focusModeActive, true);
  }

  /**
   * Build and inject the floating .voice-narrator-bar at the top of .city-detail-view.
   */
  function injectToolbar(cityKey) {
    if (!viewportEl) return;
    const detailView = viewportEl.querySelector('.city-detail-view');
    if (!detailView) return;
    if (detailView.querySelector(`.${BAR_CLASS}`)) return;

    const province = getProvinceByKey(cityKey);
    const cityName = province && province.name ? province.name : 'Şehir Rehberi';

    const bar = document.createElement('div');
    bar.className = BAR_CLASS;
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', `${cityName} Sesli Rehber ve Odak Araç Çubuğu`);

    const left = document.createElement('div');
    left.className = 'vn-left';
    left.innerHTML = `
      <div class="vn-wave" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <div class="vn-meta">
        <span class="vn-title"></span>
        <span class="vn-status"></span>
      </div>
    `;
    left.querySelector('.vn-title').textContent = `${cityName} • Sesli Seyahatname`;

    const controls = document.createElement('div');
    controls.className = 'vn-controls';

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'vn-btn vn-btn-play';
    playBtn.textContent = '🔊 Şehri Dinle';
    playBtn.addEventListener('click', togglePlayPause);

    const stopBtn = document.createElement('button');
    stopBtn.type = 'button';
    stopBtn.className = 'vn-btn vn-btn-stop';
    stopBtn.textContent = '⏹️ Durdur';
    stopBtn.setAttribute('aria-label', 'Seslendirmeyi Durdur');
    stopBtn.disabled = true;
    stopBtn.addEventListener('click', stopSpeech);

    const speedGroup = document.createElement('div');
    speedGroup.className = 'vn-speed-group';
    speedGroup.setAttribute('role', 'group');
    speedGroup.setAttribute('aria-label', 'Okuma Hızı');

    SPEEDS.forEach((rate) => {
      const sBtn = document.createElement('button');
      sBtn.type = 'button';
      sBtn.className = 'vn-speed-btn';
      sBtn.setAttribute('data-rate', String(rate));
      sBtn.textContent = `${rate.toFixed(1)}x`;
      sBtn.addEventListener('click', () => setSpeed(rate));
      speedGroup.appendChild(sBtn);
    });

    const focusBtn = document.createElement('button');
    focusBtn.type = 'button';
    focusBtn.className = 'vn-btn vn-btn-focus';
    focusBtn.textContent = '📖 Odak Modu';
    focusBtn.title = 'Sol menü ve üst modül şeridini gizle';
    focusBtn.addEventListener('click', toggleFocusMode);

    controls.appendChild(playBtn);
    controls.appendChild(stopBtn);
    controls.appendChild(speedGroup);
    controls.appendChild(focusBtn);

    bar.appendChild(left);
    bar.appendChild(controls);

    detailView.insertBefore(bar, detailView.firstChild);
    syncBarUI();
  }

  /**
   * Synchronize narrator & focus mode state with the current viewport view.
   */
  function handleViewportChange() {
    if (!isCityViewActive()) {
      if (activeCityKey !== null || isSpeaking || isPaused) {
        stopSpeech();
      }
      if (focusModeActive) {
        setFocusMode(false, false);
      }
      activeCityKey = null;
      return;
    }

    const nextKey = moduleCtx.state.selectedCityKey;
    if (activeCityKey && activeCityKey !== nextKey) {
      stopSpeech();
      if (focusModeActive) {
        setFocusMode(false, false);
      }
    }

    activeCityKey = nextKey;
    injectToolbar(nextKey);
  }

  function setupObserver() {
    viewportEl = document.getElementById('viewport-content');
    if (!viewportEl) return;

    if (observer) {
      observer.disconnect();
    }

    observer = new MutationObserver(() => {
      handleViewportChange();
    });

    observer.observe(viewportEl, { childList: true });
    handleViewportChange();
  }

  function init(ctx) {
    moduleCtx = ctx || moduleCtx;

    if (initialized) {
      handleViewportChange();
      return;
    }
    initialized = true;

    injectStyles();
    bindVoiceListener();
    setupObserver();

    window.addEventListener('hashchange', handleViewportChange);
    window.addEventListener('pagehide', stopSpeech);
    window.addEventListener('beforeunload', stopSpeech);
  }

  window.SEYYAH_MODULES.voiceNarrator = {
    init
  };
})();
