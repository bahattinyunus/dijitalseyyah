/**
 * Anadolu Bilgi Yarışması (5 Modlu Keşif Oyunu)
 * Registers on window.SEYYAH_MODULES.quiz
 */
(function () {
  'use strict';

  const BEST_SCORE_KEY = 'dijital_seyyah_quiz_best';
  const ROUND_LENGTH = 10;

  const MODES = [
    {
      id: 'photo',
      icon: '📸',
      title: 'Fotoğraftan Şehir Tanı',
      shortTitle: 'Fotoğraf',
      desc: 'Anadolu manzarasından şehri tahmin et'
    },
    {
      id: 'plate',
      icon: '🔢',
      title: 'Plaka Kodu Meydan Okuması',
      shortTitle: 'Plaka Kodu',
      desc: '01–81 arası plaka kodlarını ne kadar biliyorsun?'
    },
    {
      id: 'specialty',
      icon: '🍽️',
      title: 'Bu Lezzet Hangi İlin?',
      shortTitle: 'Yöresel Lezzet',
      desc: 'Meşhur yöresel lezzetleri şehirleriyle eşleştir'
    },
    {
      id: 'landmark',
      icon: '🏛️',
      title: 'Bu Miras Nerede?',
      shortTitle: 'Tarihi Miras',
      desc: 'Tarihi ve doğal mirasların adresini bul'
    },
    {
      id: 'quote',
      icon: '📜',
      title: 'Şehrin Ruhu & Hikmetten Şehir Tanı',
      shortTitle: 'Şehrin Ruhu',
      desc: 'Şehrin ruhu sözünden veya manevi mimarlarından ili bul'
    }
  ];

  // Module-scoped persistent quiz session state
  const quizState = {
    mode: 'photo',       // 'photo' | 'plate' | 'specialty' | 'landmark' | 'quote'
    playType: 'round10', // 'round10' | 'endless'
    score: 0,
    correctCount: 0,
    answeredCount: 0,
    streak: 0,
    maxStreak: 0,
    bestScore: loadBestScore(),
    newRecordHit: false,
    usedKeys: new Set(),
    history: [],         // { key, name, plate, correct, promptLabel }
    currentQuestion: null,
    selectedKey: null,
    isAnswered: false,
    roundFinished: false,
    hintRevealed: false,
    joker5050Used: false,
    eliminatedKeys: [],
    activeContainer: null,
    activeCtx: null,
    keyHandler: null
  };

  function loadBestScore() {
    try {
      const val = parseInt(localStorage.getItem(BEST_SCORE_KEY) || '0', 10);
      return Number.isFinite(val) && val > 0 ? val : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBestScore(val) {
    try {
      localStorage.setItem(BEST_SCORE_KEY, String(val));
    } catch (e) {
      // Ignore storage errors (private mode / quota)
    }
  }

  function defaultEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatPlate(plate) {
    return String(plate || '').padStart(2, '0');
  }

  function shuffleArray(arr) {
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

  function getProvinceEntries(data) {
    if (!data || !data.provinces) return [];
    return Object.entries(data.provinces).map(([key, p]) => ({ key, ...p }));
  }

  function getModeMeta(modeId) {
    return MODES.find(m => m.id === modeId) || MODES[0];
  }

  function getProvinceImages(p) {
    const imgs = [];
    if (p.banner_rel) imgs.push({ src: p.banner_rel, label: 'Şehir Panoraması' });
    if (p.gallery_rel && p.gallery_rel !== p.banner_rel) {
      imgs.push({ src: p.gallery_rel, label: 'Şehir Galerisi' });
    }
    if (!imgs.length && Array.isArray(p.images)) {
      p.images.forEach(src => {
        if (src) imgs.push({ src, label: 'Anadolu Karesi' });
      });
    }
    return imgs;
  }

  function maskProvinceName(text, provinceName) {
    if (!text) return '';
    if (!provinceName) return String(text);
    const escaped = String(provinceName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return String(text).replace(new RegExp(escaped, 'gi'), '••••');
    } catch (e) {
      return String(text);
    }
  }

  function hasQuoteOrSpiritClue(p) {
    if (!p) return false;
    const q = (p.custom_quote || p.quote || p.soul || '').trim();
    if (q.length > 4) return true;
    if (Array.isArray(p.spiritual_figures) && p.spiritual_figures.length > 0) return true;
    return false;
  }

  function generateQuestion(entries, mode) {
    let eligible = entries;

    if (mode === 'photo') {
      eligible = entries.filter(p => getProvinceImages(p).length > 0);
    } else if (mode === 'plate') {
      eligible = entries.filter(p => p.plate != null);
    } else if (mode === 'specialty') {
      eligible = entries.filter(p => Array.isArray(p.specialties) && p.specialties.length > 0);
    } else if (mode === 'landmark') {
      eligible = entries.filter(p => Array.isArray(p.landmarks) && p.landmarks.length > 0);
    } else if (mode === 'quote') {
      eligible = entries.filter(p => hasQuoteOrSpiritClue(p));
    }

    if (eligible.length < 4) return null;

    // Prefer cities not yet asked in this round/session
    let pool = eligible.filter(p => !quizState.usedKeys.has(p.key));
    if (pool.length === 0) {
      quizState.usedKeys.clear();
      pool = eligible;
    }

    const correct = pickRandom(pool);
    quizState.usedKeys.add(correct.key);

    let questionPayload = {
      mode,
      correctKey: correct.key,
      correctProvince: correct,
      promptTitle: '',
      promptHighlight: '',
      promptSub: '',
      imageSrc: null,
      imageLabel: '',
      plateStr: formatPlate(correct.plate),
      promptLabel: '',
      options: []
    };

    let distractorPool = entries.filter(p => p.key !== correct.key);

    if (mode === 'photo') {
      const imgs = getProvinceImages(correct);
      const chosenImg = pickRandom(imgs);
      questionPayload.imageSrc = chosenImg.src;
      questionPayload.imageLabel = chosenImg.label;
      questionPayload.promptTitle = 'Bu fotoğraf hangi ilimize aittir?';
      questionPayload.promptLabel = 'Fotoğraf Sorusu';
    } else if (mode === 'plate') {
      const plateStr = formatPlate(correct.plate);
      questionPayload.promptTitle = `${plateStr} plaka kodu hangi ilimize aittir?`;
      questionPayload.promptHighlight = plateStr;
      questionPayload.promptLabel = `${plateStr} Plaka`;
    } else if (mode === 'specialty') {
      const item = pickRandom(correct.specialties);
      const normItem = item.trim().toLowerCase();
      distractorPool = distractorPool.filter(p => {
        if (!Array.isArray(p.specialties)) return true;
        return !p.specialties.some(s => String(s).trim().toLowerCase() === normItem);
      });
      questionPayload.promptTitle = 'Bu yöresel lezzet hangi ilimizle özdeşleşmiştir?';
      questionPayload.promptHighlight = item;
      questionPayload.promptLabel = item;
    } else if (mode === 'landmark') {
      const item = pickRandom(correct.landmarks);
      const normItem = item.trim().toLowerCase();
      distractorPool = distractorPool.filter(p => {
        if (!Array.isArray(p.landmarks)) return true;
        return !p.landmarks.some(l => String(l).trim().toLowerCase() === normItem);
      });
      questionPayload.promptTitle = 'Bu tarihi / doğal miras hangi ilimizde yer alır?';
      questionPayload.promptHighlight = item;
      questionPayload.promptLabel = item;
    } else if (mode === 'quote') {
      const rawQuote = maskProvinceName((correct.custom_quote || correct.quote || correct.soul || '').trim(), correct.name);
      const figures = Array.isArray(correct.spiritual_figures)
        ? correct.spiritual_figures.map(f => typeof f === 'string' ? f : (f && (f.name || f.title)) || '').filter(Boolean)
        : [];
      const figuresLine = figures.length > 0 ? `Manevi & İrfan Mimarları: ${figures.slice(0, 3).join(' • ')}` : '';
      questionPayload.promptTitle = 'Bu ruh & hikmet tasviri hangi ilimize aittir?';
      questionPayload.promptHighlight = rawQuote || (figures.length ? figures.join(' • ') : 'Kadim Anadolu Menzili');
      questionPayload.promptSub = rawQuote && figuresLine ? figuresLine : (correct.landmarks && correct.landmarks[0] ? `İpucu Miras: ${correct.landmarks[0]}` : '');
      questionPayload.promptLabel = figures.length ? figures[0] : 'Şehrin Ruhu';
    }

    // Pick 3 distractors (fallback to any other city if filter narrowed too much)
    const finalPool = distractorPool.length >= 3
      ? distractorPool
      : entries.filter(p => p.key !== correct.key);

    const distractors = shuffleArray(finalPool).slice(0, 3);
    questionPayload.options = shuffleArray([correct, ...distractors]).map(p => ({
      key: p.key,
      name: p.name,
      plate: p.plate,
      region: p.region
    }));

    return questionPayload;
  }

  function getAccuracyPct() {
    if (quizState.answeredCount === 0) return 0;
    return Math.round((quizState.correctCount / quizState.answeredCount) * 100);
  }

  function getRankForAccuracy(pct) {
    if (pct >= 90) return { icon: '👑', title: 'Evliya Çelebi Mertebesi', desc: 'Anadolu coğrafyasına tam hâkimiyet!' };
    if (pct >= 70) return { icon: '🗺️', title: 'Usta Anadolu Kâşifi', desc: 'Şehirleri, lezzetleri ve mirası yakından tanıyorsun.' };
    if (pct >= 50) return { icon: '🧭', title: 'Meraklı Seyyah', desc: 'Güzel bir keşif temeli, birkaç durak daha kaldı.' };
    return { icon: '👣', title: 'Yolun Başında', desc: 'Anadolu seni bekliyor — şehir rehberlerini keşfetmeye başla!' };
  }

  function injectStyles() {
    if (document.getElementById('seyyah-quiz-styles')) return;
    const style = document.createElement('style');
    style.id = 'seyyah-quiz-styles';
    style.textContent = `
      .aq-wrap {
        max-width: 960px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding-bottom: 32px;
      }

      .aq-hero {
        padding: 22px 24px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.1), rgba(168, 85, 247, 0.12));
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-lg);
      }

      .aq-hero-title {
        font-family: var(--font-heading);
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .aq-hero-sub {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-top: 4px;
      }

      .aq-playtype-toggle {
        display: inline-flex;
        background: var(--bg-glass);
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-full);
        padding: 4px;
        gap: 4px;
      }

      .aq-playtype-btn {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        font-family: var(--font-heading);
        font-size: 0.8rem;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .aq-playtype-btn.active {
        background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
        color: #04121d;
        box-shadow: 0 2px 12px rgba(0, 242, 254, 0.35);
      }

      .aq-modes-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 10px;
      }

      .aq-mode-btn {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        padding: 12px 14px;
        border-radius: var(--radius-md);
        background: var(--bg-card);
        border: 1px solid var(--border-glass);
        color: var(--text-primary);
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
      }

      .aq-mode-btn:hover {
        border-color: var(--accent-cyan);
        transform: translateY(-2px);
      }

      .aq-mode-btn.active {
        background: rgba(0, 242, 254, 0.14);
        border-color: var(--accent-cyan);
        box-shadow: 0 0 18px rgba(0, 242, 254, 0.2);
      }

      .aq-mode-top {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: var(--font-heading);
        font-size: 0.86rem;
        font-weight: 700;
      }

      .aq-mode-desc {
        font-size: 0.72rem;
        color: var(--text-secondary);
        line-height: 1.35;
      }

      .aq-stats-bar {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .aq-stat-pill {
        background: var(--bg-card);
        border: 1px solid var(--border-glass);
        border-radius: var(--radius-md);
        padding: 10px 14px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .aq-stat-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted);
        font-weight: 600;
      }

      .aq-stat-value {
        font-family: var(--font-heading);
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .aq-stat-value.streak-hot {
        color: #f97316;
      }

      .aq-stat-value.best-gold {
        color: var(--accent-gold);
      }

      .aq-stat-value.acc-emerald {
        color: var(--accent-emerald);
      }

      .aq-card {
        padding: 24px;
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .aq-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .aq-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: var(--radius-full);
        font-size: 0.76rem;
        font-weight: 700;
        background: rgba(0, 242, 254, 0.12);
        color: var(--accent-cyan);
        border: 1px solid rgba(0, 242, 254, 0.3);
      }

      .aq-progress-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.8rem;
        color: var(--text-secondary);
        font-weight: 600;
      }

      .aq-progress-track {
        width: 120px;
        height: 7px;
        background: rgba(148, 163, 184, 0.2);
        border-radius: var(--radius-full);
        overflow: hidden;
      }

      .aq-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald));
        border-radius: var(--radius-full);
        transition: width 0.35s ease;
      }

      .aq-prompt-stage {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 14px;
      }

      .aq-prompt-title {
        font-family: var(--font-heading);
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .aq-photo-frame {
        position: relative;
        width: 100%;
        max-width: 640px;
        aspect-ratio: 16 / 9;
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 1px solid var(--border-glass);
        background: rgba(15, 23, 42, 0.85);
        box-shadow: var(--shadow-subtle);
      }

      .aq-photo-frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.45s ease;
      }

      .aq-photo-tag {
        position: absolute;
        bottom: 10px;
        left: 10px;
        padding: 4px 10px;
        border-radius: var(--radius-full);
        background: rgba(10, 15, 29, 0.78);
        color: #f8fafc;
        font-size: 0.72rem;
        font-weight: 600;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.14);
      }

      /* Turkish License Plate Visual */
      .aq-plate-box {
        display: inline-flex;
        align-items: stretch;
        border-radius: 12px;
        overflow: hidden;
        border: 3px solid #0f172a;
        background: #f8fafc;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35), 0 0 0 2px rgba(255, 255, 255, 0.25);
        min-width: 240px;
        height: 82px;
      }

      .aq-plate-tr {
        width: 44px;
        background: #1d4ed8;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        padding-bottom: 10px;
        font-family: var(--font-heading);
        font-weight: 800;
        font-size: 0.95rem;
        letter-spacing: 1px;
      }

      .aq-plate-num {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 0 22px;
        color: #0f172a;
        font-family: var(--font-heading);
        font-size: 2.3rem;
        font-weight: 900;
        letter-spacing: 4px;
      }

      .aq-plate-dots {
        font-size: 1.25rem;
        color: #94a3b8;
        letter-spacing: 3px;
      }

      .aq-feature-pill {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 18px 28px;
        border-radius: var(--radius-lg);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(168, 85, 247, 0.15));
        border: 1px solid rgba(245, 158, 11, 0.4);
        font-family: var(--font-heading);
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      }

      .aq-quote-stage {
        max-width: 680px;
        padding: 20px 26px;
        border-radius: var(--radius-lg);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(0, 242, 254, 0.1));
        border: 1px solid rgba(245, 158, 11, 0.42);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .aq-quote-text {
        font-family: Georgia, "Times New Roman", serif;
        font-style: italic;
        font-size: 1.18rem;
        line-height: 1.55;
        color: var(--text-primary);
      }

      .aq-quote-sub {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--accent-gold);
      }

      .aq-option-btn.is-eliminated {
        opacity: 0.28;
        text-decoration: line-through;
        pointer-events: none;
        filter: grayscale(0.8);
      }

      .aq-joker-btn {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(168, 85, 247, 0.18));
        border: 1px solid rgba(245, 158, 11, 0.5);
        color: var(--accent-gold);
        font-size: 0.76rem;
        font-weight: 700;
        padding: 5px 13px;
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .aq-joker-btn:hover:not(:disabled) {
        background: rgba(245, 158, 11, 0.28);
        transform: translateY(-1px);
      }

      .aq-joker-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .aq-hint-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .aq-hint-btn {
        background: transparent;
        border: 1px dashed var(--border-glass);
        color: var(--text-secondary);
        font-size: 0.76rem;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .aq-hint-btn:hover {
        border-color: var(--accent-gold);
        color: var(--accent-gold);
      }

      .aq-hint-text {
        font-size: 0.8rem;
        color: var(--accent-gold);
        font-weight: 600;
      }

      .aq-options-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .aq-option-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-radius: var(--radius-md);
        background: var(--bg-card);
        border: 1px solid var(--border-glass);
        color: var(--text-primary);
        font-family: var(--font-heading);
        font-size: 0.98rem;
        font-weight: 700;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
      }

      .aq-option-btn:hover:not(:disabled) {
        border-color: var(--accent-cyan);
        background: rgba(0, 242, 254, 0.1);
        transform: translateY(-2px);
      }

      .aq-option-btn:disabled {
        cursor: default;
      }

      .aq-option-key {
        width: 28px;
        height: 28px;
        border-radius: var(--radius-sm);
        background: rgba(148, 163, 184, 0.16);
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: 800;
        flex-shrink: 0;
      }

      .aq-option-name {
        flex: 1;
      }

      .aq-option-mark {
        font-size: 1.05rem;
        font-weight: 800;
      }

      .aq-option-btn.is-correct {
        background: rgba(16, 185, 129, 0.2) !important;
        border-color: #10b981 !important;
        color: #10b981 !important;
        box-shadow: 0 0 18px rgba(16, 185, 129, 0.25);
      }

      .aq-option-btn.is-correct .aq-option-key {
        background: #10b981;
        color: #04121d;
      }

      .aq-option-btn.is-wrong {
        background: rgba(239, 68, 68, 0.2) !important;
        border-color: #ef4444 !important;
        color: #f87171 !important;
        box-shadow: 0 0 18px rgba(239, 68, 68, 0.22);
      }

      .aq-option-btn.is-wrong .aq-option-key {
        background: #ef4444;
        color: #ffffff;
      }

      .aq-option-btn.is-dimmed {
        opacity: 0.52;
      }

      .aq-feedback-box {
        border-radius: var(--radius-md);
        padding: 16px 18px;
        border: 1px solid var(--border-glass);
        display: flex;
        flex-direction: column;
        gap: 12px;
        animation: aqFadeUp 0.25s ease;
      }

      .aq-feedback-box.correct {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.4);
      }

      .aq-feedback-box.wrong {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.4);
      }

      .aq-feedback-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .aq-feedback-status {
        font-family: var(--font-heading);
        font-size: 1rem;
        font-weight: 800;
      }

      .aq-feedback-status.correct { color: #10b981; }
      .aq-feedback-status.wrong { color: #f87171; }

      .aq-feedback-fact {
        font-size: 0.85rem;
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .aq-feedback-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        padding-top: 4px;
      }

      .aq-summary-card {
        padding: 28px 24px;
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 18px;
      }

      .aq-summary-icon {
        font-size: 3rem;
        line-height: 1;
      }

      .aq-summary-rank {
        font-family: var(--font-heading);
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .aq-summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        width: 100%;
      }

      .aq-history-list {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        text-align: left;
      }

      .aq-history-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 9px 12px;
        border-radius: var(--radius-sm);
        background: var(--bg-card);
        border: 1px solid var(--border-glass);
        font-size: 0.82rem;
      }

      .aq-history-item.ok { border-left: 3px solid #10b981; }
      .aq-history-item.fail { border-left: 3px solid #ef4444; }

      .aq-history-link {
        background: transparent;
        border: none;
        color: var(--accent-cyan);
        font-size: 0.76rem;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
      }

      .aq-history-link:hover {
        text-decoration: underline;
      }

      .aq-kbd-hint {
        text-align: center;
        font-size: 0.74rem;
        color: var(--text-muted);
      }

      @keyframes aqFadeUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 820px) {
        .aq-modes-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .aq-stats-bar, .aq-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .aq-history-list { grid-template-columns: 1fr; }
      }

      @media (max-width: 560px) {
        .aq-options-grid { grid-template-columns: 1fr; }
        .aq-card { padding: 16px; }
        .aq-hero { padding: 16px; }
        .aq-feature-pill { font-size: 1.2rem; padding: 14px 18px; }
      }
    `;
    document.head.appendChild(style);
  }

  function resetSession(entries, keepMode = true) {
    if (!keepMode) quizState.mode = 'photo';
    quizState.score = 0;
    quizState.correctCount = 0;
    quizState.answeredCount = 0;
    quizState.streak = 0;
    quizState.maxStreak = 0;
    quizState.newRecordHit = false;
    quizState.usedKeys.clear();
    quizState.history = [];
    quizState.selectedKey = null;
    quizState.isAnswered = false;
    quizState.roundFinished = false;
    quizState.hintRevealed = false;
    quizState.joker5050Used = false;
    quizState.eliminatedKeys = [];
    quizState.currentQuestion = generateQuestion(entries, quizState.mode);
  }

  function advanceQuestion(entries) {
    if (quizState.playType === 'round10' && quizState.answeredCount >= ROUND_LENGTH) {
      quizState.roundFinished = true;
      return;
    }
    quizState.selectedKey = null;
    quizState.isAnswered = false;
    quizState.hintRevealed = false;
    quizState.eliminatedKeys = [];
    quizState.currentQuestion = generateQuestion(entries, quizState.mode);
  }

  function useJoker5050(ctx) {
    if (quizState.isAnswered || quizState.joker5050Used || !quizState.currentQuestion) return;
    const q = quizState.currentQuestion;
    const wrongOptions = q.options.filter(o => o.key !== q.correctKey && !quizState.eliminatedKeys.includes(o.key));
    if (wrongOptions.length < 2) return;
    const toEliminate = shuffleArray(wrongOptions).slice(0, 2).map(o => o.key);
    quizState.eliminatedKeys = toEliminate;
    quizState.joker5050Used = true;
    if (ctx && typeof ctx.showToast === 'function') {
      ctx.showToast('💡 50:50 Joker kullanıldı: İki yanlış şık elendi!');
    }
  }

  function handleAnswer(chosenKey, ctx) {
    if (quizState.isAnswered || !quizState.currentQuestion) return;

    const q = quizState.currentQuestion;
    const isCorrect = chosenKey === q.correctKey;

    quizState.selectedKey = chosenKey;
    quizState.isAnswered = true;
    quizState.answeredCount += 1;

    if (isCorrect) {
      quizState.correctCount += 1;
      quizState.streak += 1;
      if (quizState.streak > quizState.maxStreak) {
        quizState.maxStreak = quizState.streak;
      }
      // Base 10 points + streak bonus (2 pts per consecutive hit, capped at +20)
      const bonus = Math.min(20, (quizState.streak - 1) * 2);
      const hintPenalty = quizState.hintRevealed ? 2 : 0;
      const earned = Math.max(5, 10 + bonus - hintPenalty);
      quizState.score += earned;

      if (quizState.score > quizState.bestScore) {
        quizState.bestScore = quizState.score;
        saveBestScore(quizState.bestScore);
        if (!quizState.newRecordHit) {
          quizState.newRecordHit = true;
          if (typeof ctx.showToast === 'function') {
            ctx.showToast(`🏆 Yeni Rekor: ${quizState.bestScore} Puan!`);
          }
        }
      }
    } else {
      quizState.streak = 0;
    }

    quizState.history.push({
      key: q.correctKey,
      name: q.correctProvince.name,
      plate: q.correctProvince.plate,
      correct: isCorrect,
      promptLabel: q.promptLabel
    });
  }

  function bindKeyboardShortcuts(container, ctx, entries) {
    if (quizState.keyHandler) {
      document.removeEventListener('keydown', quizState.keyHandler);
      quizState.keyHandler = null;
    }

    quizState.keyHandler = function (e) {
      if (!container || !container.isConnected || !container.querySelector('.aq-wrap')) {
        document.removeEventListener('keydown', quizState.keyHandler);
        quizState.keyHandler = null;
        return;
      }
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (quizState.roundFinished) return;

      if (!quizState.isAnswered && quizState.currentQuestion) {
        const idx = ['1', '2', '3', '4'].indexOf(e.key);
        if (idx !== -1 && quizState.currentQuestion.options[idx]) {
          const pickedOpt = quizState.currentQuestion.options[idx];
          if (quizState.eliminatedKeys.includes(pickedOpt.key)) return;
          e.preventDefault();
          handleAnswer(pickedOpt.key, ctx);
          renderUI(container, ctx, entries);
        }
      } else if (quizState.isAnswered && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        advanceQuestion(entries);
        renderUI(container, ctx, entries);
      }
    };

    document.addEventListener('keydown', quizState.keyHandler);
  }

  function renderPromptVisual(q, escapeHtml) {
    if (q.mode === 'photo') {
      return `
        <div class="aq-photo-frame">
          <img src="${escapeHtml(q.imageSrc)}" alt="Anadolu Şehir Fotoğrafı" loading="eager" onerror="this.style.opacity='0.25';">
          <span class="aq-photo-tag">📸 ${escapeHtml(q.imageLabel)}</span>
        </div>
      `;
    }
    if (q.mode === 'plate') {
      return `
        <div class="aq-plate-box" aria-label="Plaka kodu ${escapeHtml(q.plateStr)}">
          <div class="aq-plate-tr">TR</div>
          <div class="aq-plate-num">
            <span>${escapeHtml(q.plateStr)}</span>
            <span class="aq-plate-dots">•••</span>
          </div>
        </div>
      `;
    }
    if (q.mode === 'specialty') {
      return `
        <div class="aq-feature-pill">
          <span>🍽️</span>
          <span>${escapeHtml(q.promptHighlight)}</span>
        </div>
      `;
    }
    if (q.mode === 'quote') {
      return `
        <div class="aq-quote-stage">
          <div class="aq-quote-text">📜 “${escapeHtml(q.promptHighlight)}”</div>
          ${q.promptSub ? `<div class="aq-quote-sub">✦ ${escapeHtml(q.promptSub)}</div>` : ''}
        </div>
      `;
    }
    return `
      <div class="aq-feature-pill">
        <span>🏛️</span>
        <span>${escapeHtml(q.promptHighlight)}</span>
      </div>
    `;
  }

  function renderUI(container, ctx, entries) {
    const escapeHtml = ctx.escapeHtml || defaultEscapeHtml;
    const modeMeta = getModeMeta(quizState.mode);
    const accPct = getAccuracyPct();

    const modesHtml = MODES.map(m => `
      <button type="button" class="aq-mode-btn ${quizState.mode === m.id ? 'active' : ''}" data-quiz-mode="${escapeHtml(m.id)}">
        <div class="aq-mode-top">
          <span>${m.icon}</span>
          <span>${escapeHtml(m.title)}</span>
        </div>
        <div class="aq-mode-desc">${escapeHtml(m.desc)}</div>
      </button>
    `).join('');

    const statsHtml = `
      <div class="aq-stats-bar">
        <div class="aq-stat-pill">
          <span class="aq-stat-label">Puan</span>
          <span class="aq-stat-value">${quizState.score}</span>
        </div>
        <div class="aq-stat-pill">
          <span class="aq-stat-label">🔥 Seri</span>
          <span class="aq-stat-value ${quizState.streak >= 3 ? 'streak-hot' : ''}">${quizState.streak}</span>
        </div>
        <div class="aq-stat-pill">
          <span class="aq-stat-label">🎯 Doğruluk</span>
          <span class="aq-stat-value acc-emerald">%${accPct} <span style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">(${quizState.correctCount}/${quizState.answeredCount})</span></span>
        </div>
        <div class="aq-stat-pill">
          <span class="aq-stat-label">🏆 En İyi Skor</span>
          <span class="aq-stat-value best-gold">${quizState.bestScore}</span>
        </div>
      </div>
    `;

    let mainBodyHtml = '';

    if (quizState.roundFinished) {
      const rank = getRankForAccuracy(accPct);
      const wrongCount = quizState.answeredCount - quizState.correctCount;
      const historyHtml = quizState.history.map((h, i) => `
        <div class="aq-history-item ${h.correct ? 'ok' : 'fail'}">
          <div>
            <strong>${i + 1}. ${escapeHtml(h.name)}</strong>
            <span style="color:var(--text-muted);"> (${formatPlate(h.plate)})</span>
            <div style="font-size:0.72rem;color:var(--text-secondary);">${escapeHtml(h.promptLabel)}</div>
          </div>
          <button type="button" class="aq-history-link" data-explore-city="${escapeHtml(h.key)}">Şehri Keşfet ➔</button>
        </div>
      `).join('');

      mainBodyHtml = `
        <div class="glass-card aq-summary-card">
          <div class="aq-summary-icon">${rank.icon}</div>
          <div>
            <div class="aq-summary-rank">${escapeHtml(rank.title)}</div>
            <p style="color:var(--text-secondary);font-size:0.88rem;margin-top:4px;">${escapeHtml(rank.desc)}</p>
          </div>
          <div class="aq-summary-grid">
            <div class="aq-stat-pill">
              <span class="aq-stat-label">Tur Puanı</span>
              <span class="aq-stat-value">${quizState.score}</span>
            </div>
            <div class="aq-stat-pill">
              <span class="aq-stat-label">Doğru / Yanlış</span>
              <span class="aq-stat-value"><span style="color:#10b981;">${quizState.correctCount}</span> / <span style="color:#f87171;">${wrongCount}</span></span>
            </div>
            <div class="aq-stat-pill">
              <span class="aq-stat-label">Doğruluk</span>
              <span class="aq-stat-value acc-emerald">%${accPct}</span>
            </div>
            <div class="aq-stat-pill">
              <span class="aq-stat-label">En Uzun Seri</span>
              <span class="aq-stat-value streak-hot">🔥 ${quizState.maxStreak}</span>
            </div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
            <button type="button" class="btn btn-primary" id="aq-btn-restart">🔄 Yeni 10 Soruluk Tur</button>
            <button type="button" class="btn btn-outline" id="aq-btn-switch-endless">♾️ Sonsuz Moda Geç</button>
          </div>
          <div style="width:100%;text-align:left;margin-top:6px;">
            <div style="font-family:var(--font-heading);font-size:0.88rem;font-weight:700;color:var(--text-secondary);margin-bottom:8px;">
              📜 Tur Özeti — Sorulan Şehirler
            </div>
            <div class="aq-history-list">${historyHtml}</div>
          </div>
        </div>
      `;
    } else if (!quizState.currentQuestion) {
      mainBodyHtml = `
        <div class="glass-card aq-card" style="text-align:center;">
          <p style="color:var(--text-secondary);">Bu mod için yeterli şehir verisi bulunamadı.</p>
        </div>
      `;
    } else {
      const q = quizState.currentQuestion;
      const p = q.correctProvince;
      const qNum = quizState.isAnswered ? quizState.answeredCount : quizState.answeredCount + 1;
      const progressPct = quizState.playType === 'round10'
        ? Math.min(100, Math.round((quizState.answeredCount / ROUND_LENGTH) * 100))
        : 100;

      const progressHtml = quizState.playType === 'round10'
        ? `
          <div class="aq-progress-wrap">
            <span>Soru ${Math.min(qNum, ROUND_LENGTH)} / ${ROUND_LENGTH}</span>
            <div class="aq-progress-track">
              <div class="aq-progress-fill" style="width:${progressPct}%;"></div>
            </div>
          </div>
        `
        : `
          <div class="aq-progress-wrap">
            <span>♾️ Soru #${qNum}</span>
            <button type="button" class="aq-hint-btn" id="aq-btn-reset-endless">🔄 Sıfırla</button>
          </div>
        `;

      const optionsHtml = q.options.map((opt, idx) => {
        let cls = 'aq-option-btn';
        let mark = '';
        const isEliminated = quizState.eliminatedKeys.includes(opt.key);
        if (quizState.isAnswered) {
          if (opt.key === q.correctKey) {
            cls += ' is-correct';
            mark = '✓';
          } else if (opt.key === quizState.selectedKey) {
            cls += ' is-wrong';
            mark = '✕';
          } else {
            cls += ' is-dimmed';
          }
        } else if (isEliminated) {
          cls += ' is-eliminated';
          mark = '✕';
        }
        return `
          <button
            type="button"
            class="${cls}"
            data-option-key="${escapeHtml(opt.key)}"
            ${quizState.isAnswered || isEliminated ? 'disabled' : ''}
          >
            <span class="aq-option-key">${idx + 1}</span>
            <span class="aq-option-name">${escapeHtml(opt.name)}</span>
            <span class="aq-option-mark">${mark}</span>
          </button>
        `;
      }).join('');

      let hintHtml = '';
      if (!quizState.isAnswered) {
        const jokerBtnHtml = `
          <button type="button" class="aq-joker-btn" id="aq-btn-joker" ${quizState.joker5050Used ? 'disabled' : ''}>
            ${quizState.joker5050Used ? '💡 İki Şık Ele (Kullanıldı)' : '💡 İki Şık Ele (50:50 Joker)'}
          </button>
        `;
        if (quizState.hintRevealed) {
          hintHtml = `
            <div class="aq-hint-row">
              <span class="aq-hint-text">💡 İpucu: ${escapeHtml(p.region || 'Anadolu')} Bölgesi${q.mode !== 'plate' ? ` • Plaka ${formatPlate(p.plate)}` : ''}</span>
              ${jokerBtnHtml}
            </div>
          `;
        } else {
          hintHtml = `
            <div class="aq-hint-row">
              <button type="button" class="aq-hint-btn" id="aq-btn-hint">💡 Bölge İpucu Göster (-2 puan)</button>
              ${jokerBtnHtml}
            </div>
          `;
        }
      }

      let feedbackHtml = '';
      if (quizState.isAnswered) {
        const isCorrect = quizState.selectedKey === q.correctKey;
        const isLastOfRound = quizState.playType === 'round10' && quizState.answeredCount >= ROUND_LENGTH;
        const extraLandmarks = (p.landmarks || []).slice(0, 2).join(', ');
        const extraSpec = (p.specialties || []).slice(0, 2).join(', ');

        feedbackHtml = `
          <div class="aq-feedback-box ${isCorrect ? 'correct' : 'wrong'}">
            <div class="aq-feedback-head">
              <div class="aq-feedback-status ${isCorrect ? 'correct' : 'wrong'}">
                ${isCorrect
                  ? `✅ Doğru Bildin! ${escapeHtml(p.name)} (${formatPlate(p.plate)})`
                  : `❌ Yanlış! Doğru Cevap: ${escapeHtml(p.name)} (${formatPlate(p.plate)})`}
              </div>
              <span class="aq-badge" style="background:rgba(148,163,184,0.14);color:var(--text-secondary);border-color:var(--border-glass);">
                ${escapeHtml(p.region || '')} Bölgesi ${p.visited ? '• ✅ Gezildi' : '• ⏳ Rotada'}
              </span>
            </div>
            <div class="aq-feedback-fact">
              ${p.quote ? `<em>“${escapeHtml(p.quote)}”</em><br>` : ''}
              ${extraLandmarks ? `<span>🏛️ <strong>Miras:</strong> ${escapeHtml(extraLandmarks)}</span>` : ''}
              ${extraLandmarks && extraSpec ? ' &nbsp;•&nbsp; ' : ''}
              ${extraSpec ? `<span>🍽️ <strong>Lezzet:</strong> ${escapeHtml(extraSpec)}</span>` : ''}
            </div>
            <div class="aq-feedback-actions">
              <button type="button" class="btn btn-outline" data-explore-city="${escapeHtml(q.correctKey)}">
                🗺️ Şehri Keşfet ➔
              </button>
              <button type="button" class="btn btn-primary" id="aq-btn-next">
                ${isLastOfRound ? '🏆 Tur Sonucunu Gör ➔' : 'Sonraki Soru ➔'}
              </button>
            </div>
          </div>
        `;
      }

      mainBodyHtml = `
        <div class="glass-card aq-card">
          <div class="aq-card-header">
            <span class="aq-badge">${modeMeta.icon} ${escapeHtml(modeMeta.title)}</span>
            ${progressHtml}
          </div>

          <div class="aq-prompt-stage">
            ${renderPromptVisual(q, escapeHtml)}
            <div class="aq-prompt-title">${escapeHtml(q.promptTitle)}</div>
            ${hintHtml}
          </div>

          <div class="aq-options-grid">
            ${optionsHtml}
          </div>

          ${feedbackHtml}

          <div class="aq-kbd-hint">
            Klavye kısayolları: <strong>1–4</strong> şık seçimi • <strong>Enter</strong> sonraki soru
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="aq-wrap">
        <div class="aq-hero">
          <div>
            <div class="aq-hero-title">🎯 Anadolu Bilgi Yarışması</div>
            <div class="aq-hero-sub">81 ilin fotoğrafları, plakaları, lezzetleri, mirası ve şehrin ruhuyla 5 modlu keşif oyunu</div>
          </div>
          <div class="aq-playtype-toggle" role="tablist" aria-label="Oyun tipi">
            <button type="button" class="aq-playtype-btn ${quizState.playType === 'round10' ? 'active' : ''}" data-play-type="round10">
              🎯 10 Soruluk Tur
            </button>
            <button type="button" class="aq-playtype-btn ${quizState.playType === 'endless' ? 'active' : ''}" data-play-type="endless">
              ♾️ Sonsuz Mod
            </button>
          </div>
        </div>

        <div class="aq-modes-grid">
          ${modesHtml}
        </div>

        ${statsHtml}

        ${mainBodyHtml}
      </div>
    `;

    // Wire events
    container.querySelectorAll('[data-quiz-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextMode = btn.getAttribute('data-quiz-mode');
        if (!nextMode || nextMode === quizState.mode) return;
        quizState.mode = nextMode;
        resetSession(entries, true);
        renderUI(container, ctx, entries);
      });
    });

    container.querySelectorAll('[data-play-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextType = btn.getAttribute('data-play-type');
        if (!nextType || nextType === quizState.playType) return;
        quizState.playType = nextType;
        resetSession(entries, true);
        renderUI(container, ctx, entries);
      });
    });

    container.querySelectorAll('[data-option-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = btn.getAttribute('data-option-key');
        handleAnswer(chosen, ctx);
        renderUI(container, ctx, entries);
      });
    });

    const btnHint = container.querySelector('#aq-btn-hint');
    if (btnHint) {
      btnHint.addEventListener('click', () => {
        quizState.hintRevealed = true;
        renderUI(container, ctx, entries);
      });
    }

    const btnJoker = container.querySelector('#aq-btn-joker');
    if (btnJoker) {
      btnJoker.addEventListener('click', () => {
        useJoker5050(ctx);
        renderUI(container, ctx, entries);
      });
    }

    const btnNext = container.querySelector('#aq-btn-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        advanceQuestion(entries);
        renderUI(container, ctx, entries);
      });
    }

    const btnRestart = container.querySelector('#aq-btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        resetSession(entries, true);
        renderUI(container, ctx, entries);
      });
    }

    const btnSwitchEndless = container.querySelector('#aq-btn-switch-endless');
    if (btnSwitchEndless) {
      btnSwitchEndless.addEventListener('click', () => {
        quizState.playType = 'endless';
        resetSession(entries, true);
        renderUI(container, ctx, entries);
      });
    }

    const btnResetEndless = container.querySelector('#aq-btn-reset-endless');
    if (btnResetEndless) {
      btnResetEndless.addEventListener('click', () => {
        resetSession(entries, true);
        renderUI(container, ctx, entries);
      });
    }

    container.querySelectorAll('[data-explore-city]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-explore-city');
        if (key && typeof ctx.selectCity === 'function') {
          ctx.selectCity(key);
        }
      });
    });
  }

  function render(container, ctx) {
    if (!container) return;
    const safeCtx = ctx || {};
    const data = safeCtx.data || (safeCtx.state && safeCtx.state.data) || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const entries = getProvinceEntries(data);

    injectStyles();

    if (entries.length < 4) {
      container.innerHTML = `
        <div class="glass-card" style="padding:28px;text-align:center;max-width:560px;margin:32px auto;">
          <h3 style="margin-bottom:8px;">🎯 Anadolu Bilgi Yarışması</h3>
          <p style="color:var(--text-secondary);">Yarışmayı başlatmak için şehir verileri yüklenemedi.</p>
        </div>
      `;
      return;
    }

    quizState.activeContainer = container;
    quizState.activeCtx = safeCtx;
    quizState.bestScore = loadBestScore();

    if (!quizState.currentQuestion && !quizState.roundFinished) {
      quizState.currentQuestion = generateQuestion(entries, quizState.mode);
    }

    bindKeyboardShortcuts(container, safeCtx, entries);
    renderUI(container, safeCtx, entries);
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.quiz = { render };
})();
