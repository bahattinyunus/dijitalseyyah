/**
 * Anadolu Mesafe & Coğrafya Düellosu (2 Modlu Etkileşimli Mini Oyun)
 * Mode 1: Mesafe Tahmini (Slider Challenge — 5 Tur, 0-1000 puan/tur)
 * Mode 2: Hangisi Daha Doğuda / Kuzeyde / Plaka / Ankara'ya Yakın? (Rapid Duel)
 * Registers on window.SEYYAH_MODULES.distanceGame = { render(container, ctx) }
 */
(function () {
  'use strict';

  const DIST_BEST_KEY = 'dijital_seyyah_dist_best';
  const DUEL_BEST_KEY = 'dijital_seyyah_duel_best_streak';
  const SLIDER_MIN = 50;
  const SLIDER_MAX = 1800;
  const SLIDER_DEFAULT = 550;
  const ROAD_FACTOR = 1.35;
  const TOTAL_ROUNDS = 5;

  const ANKARA_FALLBACK = { lat: 39.9334, lng: 32.8597 };

  const DUEL_TYPES = [
    {
      id: 'east',
      icon: '🌅',
      badge: 'DOĞU — BATI',
      prompt: 'Hangisi daha DOĞUDA?',
      hint: 'Boylam değeri daha büyük olan şehir kazanır'
    },
    {
      id: 'north',
      icon: '🧭',
      badge: 'KUZEY — GÜNEY',
      prompt: 'Hangisi daha KUZEYDE?',
      hint: 'Enlem değeri daha büyük olan şehir kazanır'
    },
    {
      id: 'plate',
      icon: '🚘',
      badge: 'PLAKA DÜELLOSU',
      prompt: 'Hangisinin plaka kodu daha BÜYÜK?',
      hint: '01 Adana — 81 Düzce sıralamasına göre'
    },
    {
      id: 'ankara',
      icon: '🏛️',
      badge: 'BAŞKENTE MESAFE',
      prompt: "Hangisi Ankara'ya daha YAKIN?",
      hint: 'Tahmini karayolu mesafesine göre (Haversine × 1.35)'
    }
  ];

  // Persistent module state
  const gameState = {
    activeMode: 'distance', // 'distance' | 'duel'

    // Mode 1: Distance Slider Challenge
    distRound: 1,
    distScore: 0,
    distBest: loadStorageInt(DIST_BEST_KEY),
    distPair: null,         // { a, b, airKm, roadKm }
    distGuess: SLIDER_DEFAULT,
    distLocked: false,
    distLastResult: null,   // { guess, actual, airKm, errorKm, points, accuracyPct, tier }
    distHistory: [],        // Array of round results
    distFinished: false,
    distNewRecord: false,
    distUsedPairs: new Set(),

    // Mode 2: Rapid Geography Duel
    duelStreak: 0,
    duelBestStreak: loadStorageInt(DUEL_BEST_KEY),
    duelTotal: 0,
    duelCorrect: 0,
    duelQuestion: null,     // { type, a, b, valA, valB, labelA, labelB, winnerKey }
    duelAnswered: false,
    duelPickedKey: null,
    duelWasCorrect: false,
    duelNewRecord: false,
    duelLastTypeId: null,

    // Runtime references
    activeContainer: null,
    activeCtx: null,
    keyHandler: null
  };

  function loadStorageInt(key) {
    try {
      const val = parseInt(localStorage.getItem(key) || '0', 10);
      return Number.isFinite(val) && val > 0 ? val : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveStorageInt(key, val) {
    try {
      localStorage.setItem(key, String(val));
    } catch (e) {
      // Ignore storage quota/privacy errors
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

  function getDistFn(ctx) {
    if (ctx && typeof ctx.calcDistKm === 'function') {
      return ctx.calcDistKm;
    }
    return fallbackCalcDistKm;
  }

  function calcRoadKm(a, b, distFn) {
    const air = distFn(a.lat, a.lng, b.lat, b.lng);
    return {
      airKm: Math.round(air),
      roadKm: Math.round(air * ROAD_FACTOR)
    };
  }

  function formatKm(n) {
    return Number(n || 0).toLocaleString('tr-TR');
  }

  function formatPlate(plate) {
    return String(plate || '').padStart(2, '0');
  }

  function formatDriveTime(roadKm) {
    const hoursFloat = roadKm / 82;
    const hours = Math.floor(hoursFloat);
    const mins = Math.round((hoursFloat - hours) * 60);
    if (hours === 0) return `~${mins} dk`;
    if (mins === 0) return `~${hours} sa`;
    return `~${hours} sa ${mins} dk`;
  }

  function getProvincePhoto(p) {
    if (p.banner_rel) return p.banner_rel;
    if (p.gallery_rel) return p.gallery_rel;
    if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
    return '';
  }

  function getProvinceEntries(data) {
    if (!data || !data.provinces) return [];
    return Object.entries(data.provinces)
      .map(([key, p]) => ({ key, ...p }))
      .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  }

  function findAnkaraCoords(entries) {
    const ank = entries.find(
      p => p.plate === 6 || (p.name && p.name.toLowerCase() === 'ankara')
    );
    return ank ? { lat: ank.lat, lng: ank.lng, key: ank.key } : { ...ANKARA_FALLBACK, key: null };
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function notify(ctx, msg) {
    if (ctx && typeof ctx.showToast === 'function') {
      ctx.showToast(msg);
    }
  }

  // =========================================================================
  // MODE 1 LOGIC — DISTANCE SLIDER CHALLENGE
  // =========================================================================
  function generateDistancePair(entries, distFn) {
    if (entries.length < 2) return null;

    for (let attempt = 0; attempt < 80; attempt++) {
      const a = pickRandom(entries);
      const b = pickRandom(entries);
      if (!a || !b || a.key === b.key) continue;

      const pairId = [a.key, b.key].sort().join('|');
      if (attempt < 50 && gameState.distUsedPairs.has(pairId)) continue;

      const { airKm, roadKm } = calcRoadKm(a, b, distFn);
      if (roadKm >= SLIDER_MIN && roadKm <= SLIDER_MAX) {
        gameState.distUsedPairs.add(pairId);
        return { a, b, airKm, roadKm };
      }
    }

    // Guaranteed fallback
    const a = entries[0];
    const b = entries[entries.length - 1];
    const { airKm, roadKm } = calcRoadKm(a, b, distFn);
    return {
      a,
      b,
      airKm,
      roadKm: Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, roadKm))
    };
  }

  function scoreDistanceGuess(guess, actual) {
    const errorKm = Math.abs(guess - actual);
    let points;
    if (errorKm <= 10) {
      points = 1000;
    } else {
      points = Math.max(0, Math.round(1000 * Math.exp(-errorKm / 265)));
    }
    const accuracyPct = Math.max(0, Math.min(100, Math.round((1 - errorKm / Math.max(actual, 200)) * 100)));

    let tier;
    if (errorKm <= 20) {
      tier = { label: '🎯 Tam İsabet! Pusula Üstadı', cls: 'tier-legend' };
    } else if (errorKm <= 65) {
      tier = { label: '✨ Harika Tahmin! Keskin Göz', cls: 'tier-great' };
    } else if (errorKm <= 150) {
      tier = { label: '🧭 İyi Yaklaşım! Yol Tecrübesi', cls: 'tier-good' };
    } else if (errorKm <= 300) {
      tier = { label: '🗺️ Fena Değil, Haritaya Bir Göz At', cls: 'tier-mid' };
    } else {
      tier = { label: '🛤️ Anadolu Sandığından Geniş!', cls: 'tier-far' };
    }

    return { guess, actual, errorKm, points, accuracyPct, tier };
  }

  function getFinalRank(totalScore) {
    if (totalScore >= 4300) {
      return { icon: '👑', title: 'Evliya Çelebi Pusulası', desc: 'Anadolu yollarını karış karış biliyorsun!' };
    }
    if (totalScore >= 3500) {
      return { icon: '🧭', title: 'Usta Coğrafyacı', desc: 'Mesafe sezgin haritacılara taş çıkarır.' };
    }
    if (totalScore >= 2500) {
      return { icon: '🗺️', title: 'Anadolu Kâşifi', desc: 'Bölgeler arası mesafelere oldukça hâkimsin.' };
    }
    if (totalScore >= 1500) {
      return { icon: '🚗', title: 'Yol Yolcusu', desc: 'Birkaç sefer daha yaparsan pusulan keskinleşir.' };
    }
    return { icon: '🌱', title: 'Yeni Seyyah', desc: 'Şehir dosyalarını inceleyip rövanşa çık!' };
  }

  function startNewDistanceGame(entries, distFn) {
    gameState.distRound = 1;
    gameState.distScore = 0;
    gameState.distHistory = [];
    gameState.distFinished = false;
    gameState.distNewRecord = false;
    gameState.distLocked = false;
    gameState.distLastResult = null;
    gameState.distGuess = SLIDER_DEFAULT;
    gameState.distUsedPairs.clear();
    gameState.distPair = generateDistancePair(entries, distFn);
  }

  function lockDistanceGuess(ctx) {
    if (gameState.distLocked || !gameState.distPair) return;
    const { a, b, airKm, roadKm } = gameState.distPair;
    const res = scoreDistanceGuess(gameState.distGuess, roadKm);
    res.airKm = airKm;
    res.a = a;
    res.b = b;
    res.round = gameState.distRound;

    gameState.distLocked = true;
    gameState.distLastResult = res;
    gameState.distScore += res.points;
    gameState.distHistory.push(res);

    if (gameState.distRound >= TOTAL_ROUNDS) {
      if (gameState.distScore > gameState.distBest) {
        gameState.distBest = gameState.distScore;
        gameState.distNewRecord = true;
        saveStorageInt(DIST_BEST_KEY, gameState.distBest);
        notify(ctx, `🏆 Yeni Mesafe Rekoru: ${formatKm(gameState.distScore)} puan!`);
      }
    } else if (res.points >= 900) {
      notify(ctx, `🎯 Muhteşem! +${res.points} puan (±${res.errorKm} km)`);
    }
  }

  function advanceDistanceRound(entries, distFn) {
    if (gameState.distRound >= TOTAL_ROUNDS) {
      gameState.distFinished = true;
      return;
    }
    gameState.distRound += 1;
    gameState.distLocked = false;
    gameState.distLastResult = null;
    gameState.distGuess = SLIDER_DEFAULT;
    gameState.distPair = generateDistancePair(entries, distFn);
  }

  // =========================================================================
  // MODE 2 LOGIC — RAPID GEOGRAPHY DUEL
  // =========================================================================
  function generateDuelQuestion(entries, distFn) {
    if (entries.length < 2) return null;

    // Rotate away from previous question type for variety
    const candidateTypes = DUEL_TYPES.filter(t => t.id !== gameState.duelLastTypeId);
    const type = pickRandom(candidateTypes.length ? candidateTypes : DUEL_TYPES);
    const ankara = findAnkaraCoords(entries);

    for (let attempt = 0; attempt < 90; attempt++) {
      const a = pickRandom(entries);
      const b = pickRandom(entries);
      if (!a || !b || a.key === b.key) continue;

      if (type.id === 'east') {
        if (Math.abs(a.lng - b.lng) < 0.25) continue;
        const winnerKey = a.lng > b.lng ? a.key : b.key;
        gameState.duelLastTypeId = type.id;
        return {
          type,
          a,
          b,
          valA: a.lng,
          valB: b.lng,
          labelA: `${a.lng.toFixed(2)}° Doğu`,
          labelB: `${b.lng.toFixed(2)}° Doğu`,
          diffText: `Boylam farkı: ${Math.abs(a.lng - b.lng).toFixed(2)}°`,
          winnerKey
        };
      }

      if (type.id === 'north') {
        if (Math.abs(a.lat - b.lat) < 0.2) continue;
        const winnerKey = a.lat > b.lat ? a.key : b.key;
        gameState.duelLastTypeId = type.id;
        return {
          type,
          a,
          b,
          valA: a.lat,
          valB: b.lat,
          labelA: `${a.lat.toFixed(2)}° Kuzey`,
          labelB: `${b.lat.toFixed(2)}° Kuzey`,
          diffText: `Enlem farkı: ${Math.abs(a.lat - b.lat).toFixed(2)}°`,
          winnerKey
        };
      }

      if (type.id === 'plate') {
        if (a.plate == null || b.plate == null || a.plate === b.plate) continue;
        const winnerKey = a.plate > b.plate ? a.key : b.key;
        gameState.duelLastTypeId = type.id;
        return {
          type,
          a,
          b,
          valA: a.plate,
          valB: b.plate,
          labelA: `Plaka ${formatPlate(a.plate)}`,
          labelB: `Plaka ${formatPlate(b.plate)}`,
          diffText: `Plaka farkı: ${Math.abs(a.plate - b.plate)}`,
          winnerKey
        };
      }

      if (type.id === 'ankara') {
        if (a.key === ankara.key || b.key === ankara.key || a.plate === 6 || b.plate === 6) continue;
        const distA = calcRoadKm(a, ankara, distFn).roadKm;
        const distB = calcRoadKm(b, ankara, distFn).roadKm;
        if (Math.abs(distA - distB) < 30) continue;
        const winnerKey = distA < distB ? a.key : b.key;
        gameState.duelLastTypeId = type.id;
        return {
          type,
          a,
          b,
          valA: distA,
          valB: distB,
          labelA: `Ankara'ya ${formatKm(distA)} km`,
          labelB: `Ankara'ya ${formatKm(distB)} km`,
          diffText: `Mesafe farkı: ${formatKm(Math.abs(distA - distB))} km`,
          winnerKey
        };
      }
    }

    // Fallback to east comparison
    const a = entries[0];
    const b = entries[entries.length - 1];
    return {
      type: DUEL_TYPES[0],
      a,
      b,
      valA: a.lng,
      valB: b.lng,
      labelA: `${a.lng.toFixed(2)}° Doğu`,
      labelB: `${b.lng.toFixed(2)}° Doğu`,
      diffText: `Boylam farkı: ${Math.abs(a.lng - b.lng).toFixed(2)}°`,
      winnerKey: a.lng >= b.lng ? a.key : b.key
    };
  }

  function answerDuel(pickedKey, ctx) {
    if (gameState.duelAnswered || !gameState.duelQuestion) return;
    const q = gameState.duelQuestion;
    const isCorrect = pickedKey === q.winnerKey;

    gameState.duelAnswered = true;
    gameState.duelPickedKey = pickedKey;
    gameState.duelWasCorrect = isCorrect;
    gameState.duelTotal += 1;
    gameState.duelNewRecord = false;

    if (isCorrect) {
      gameState.duelCorrect += 1;
      gameState.duelStreak += 1;
      if (gameState.duelStreak > gameState.duelBestStreak) {
        gameState.duelBestStreak = gameState.duelStreak;
        gameState.duelNewRecord = true;
        saveStorageInt(DUEL_BEST_KEY, gameState.duelBestStreak);
        if (gameState.duelStreak >= 3) {
          notify(ctx, `🔥 Yeni Düello Seri Rekoru: ${gameState.duelStreak}!`);
        }
      }
    } else {
      gameState.duelStreak = 0;
    }
  }

  function nextDuel(entries, distFn) {
    gameState.duelAnswered = false;
    gameState.duelPickedKey = null;
    gameState.duelWasCorrect = false;
    gameState.duelNewRecord = false;
    gameState.duelQuestion = generateDuelQuestion(entries, distFn);
  }

  // =========================================================================
  // SCOPED STYLES (Glassmorphism Cyber-Sufi Dark & Light Theme + Responsive)
  // =========================================================================
  function injectStyles() {
    if (document.getElementById('seyyah-distance-game-styles')) return;
    const style = document.createElement('style');
    style.id = 'seyyah-distance-game-styles';
    style.textContent = `
      .dg-shell {
        max-width: 980px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
        animation: dgFadeUp 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      }

      @keyframes dgFadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes dgPop {
        0% { transform: scale(0.94); opacity: 0.4; }
        60% { transform: scale(1.03); }
        100% { transform: scale(1); opacity: 1; }
      }

      .dg-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 18px 22px;
        background: var(--bg-glass, rgba(15, 23, 42, 0.85));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-lg, 20px);
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0,0,0,0.45));
      }

      .dg-title-wrap {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .dg-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.38rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .dg-subtitle {
        font-size: 0.86rem;
        color: var(--text-secondary, #94a3b8);
      }

      .dg-mode-tabs {
        display: inline-flex;
        gap: 8px;
        padding: 5px;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-full, 9999px);
      }

      .dg-mode-tab {
        border: 1px solid transparent;
        background: transparent;
        color: var(--text-secondary, #94a3b8);
        font-family: var(--font-heading, sans-serif);
        font-weight: 700;
        font-size: 0.86rem;
        padding: 9px 16px;
        border-radius: var(--radius-full, 9999px);
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }

      .dg-mode-tab:hover {
        color: var(--text-primary, #f8fafc);
        background: rgba(255, 255, 255, 0.06);
      }

      .dg-mode-tab.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.24), rgba(16, 185, 129, 0.24));
        border-color: var(--accent-cyan, #00f2fe);
        color: #ffffff;
        box-shadow: 0 0 18px rgba(0, 242, 254, 0.22);
      }

      /* Stats HUD */
      .dg-hud {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .dg-stat-pill {
        background: var(--bg-card, rgba(30, 41, 59, 0.7));
        backdrop-filter: blur(12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-md, 12px);
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .dg-stat-label {
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-secondary, #94a3b8);
        font-weight: 600;
      }

      .dg-stat-value {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.2rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .dg-stat-value.accent-cyan { color: var(--accent-cyan, #00f2fe); }
      .dg-stat-value.accent-gold { color: var(--accent-gold, #f59e0b); }
      .dg-stat-value.accent-emerald { color: var(--accent-emerald, #10b981); }

      /* Round Progress Dots */
      .dg-round-dots {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 2px;
      }

      .dg-dot {
        height: 8px;
        flex: 1;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.22);
        transition: all 0.25s ease;
      }

      .dg-dot.done { background: var(--accent-emerald, #10b981); }
      .dg-dot.current {
        background: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
      }

      /* Prompt Banner */
      .dg-prompt-banner {
        text-align: center;
        padding: 16px 20px;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.12), rgba(168, 85, 247, 0.12));
        border: 1px solid rgba(0, 242, 254, 0.28);
        border-radius: var(--radius-lg, 20px);
        animation: dgPop 0.26s ease;
      }

      .dg-prompt-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        padding: 4px 11px;
        border-radius: 999px;
        background: rgba(0, 242, 254, 0.16);
        color: var(--accent-cyan, #00f2fe);
        margin-bottom: 6px;
      }

      .dg-prompt-question {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.25;
      }

      .dg-prompt-hint {
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 4px;
      }

      /* Versus Arena */
      .dg-arena {
        position: relative;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        align-items: stretch;
      }

      .dg-vs-badge {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 4;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #00f2fe, #4facfe);
        color: #061224;
        font-family: var(--font-heading, sans-serif);
        font-weight: 900;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 5px var(--bg-primary, #0a0f1d), 0 8px 22px rgba(0, 242, 254, 0.35);
        pointer-events: none;
      }

      /* City Card */
      .dg-city-card {
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 2px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        text-align: left;
        padding: 0;
        color: inherit;
        font: inherit;
      }

      .dg-city-card.is-interactive {
        cursor: pointer;
      }

      .dg-city-card.is-interactive:hover {
        transform: translateY(-4px);
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 14px 32px rgba(0, 242, 254, 0.2);
      }

      .dg-city-card.is-winner {
        border-color: var(--accent-emerald, #10b981);
        box-shadow: 0 0 28px rgba(16, 185, 129, 0.28);
      }

      .dg-city-card.is-wrong {
        border-color: #f43f5e;
        box-shadow: 0 0 24px rgba(244, 63, 94, 0.25);
      }

      .dg-city-card.is-dimmed {
        opacity: 0.78;
      }

      .dg-photo-wrap {
        position: relative;
        width: 100%;
        height: 215px;
        overflow: hidden;
        background: linear-gradient(135deg, #0f172a, #1e293b);
      }

      .dg-photo {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s ease;
      }

      .dg-city-card.is-interactive:hover .dg-photo {
        transform: scale(1.05);
      }

      .dg-photo-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to top,
          rgba(10, 15, 29, 0.92) 0%,
          rgba(10, 15, 29, 0.28) 50%,
          rgba(10, 15, 29, 0.15) 100%
        );
      }

      .dg-card-top-badges {
        position: absolute;
        top: 12px;
        left: 12px;
        right: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        z-index: 2;
      }

      .dg-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        backdrop-filter: blur(10px);
        background: rgba(15, 23, 42, 0.76);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #f8fafc;
      }

      .dg-pill.plate {
        background: rgba(0, 242, 254, 0.2);
        border-color: rgba(0, 242, 254, 0.45);
        color: #e0faff;
      }

      .dg-pill.visited {
        background: rgba(16, 185, 129, 0.24);
        border-color: rgba(16, 185, 129, 0.5);
        color: #d1fae5;
      }

      .dg-card-title-overlay {
        position: absolute;
        left: 16px;
        right: 16px;
        bottom: 12px;
        z-index: 2;
      }

      .dg-city-name {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.55rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.15;
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.65);
      }

      .dg-city-region {
        font-size: 0.82rem;
        color: rgba(226, 232, 240, 0.9);
        margin-top: 2px;
      }

      .dg-card-body {
        padding: 13px 16px 15px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
        justify-content: space-between;
      }

      .dg-city-quote {
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .dg-reveal-metric {
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 12px;
        border-radius: var(--radius-sm, 8px);
        font-family: var(--font-heading, sans-serif);
        font-weight: 700;
        font-size: 0.92rem;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: dgPop 0.24s ease;
      }

      .dg-reveal-metric.winner {
        background: rgba(16, 185, 129, 0.18);
        border-color: rgba(16, 185, 129, 0.5);
        color: #6ee7b7;
      }

      .dg-reveal-metric.loser {
        background: rgba(244, 63, 94, 0.12);
        border-color: rgba(244, 63, 94, 0.35);
        color: #fda4af;
      }

      .dg-explore-cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 8px 12px;
        border-radius: var(--radius-sm, 8px);
        font-family: var(--font-heading, sans-serif);
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.1);
        border: 1px dashed rgba(0, 242, 254, 0.38);
        transition: all 0.2s ease;
      }

      .dg-city-card.is-interactive:hover .dg-explore-cta {
        background: rgba(0, 242, 254, 0.2);
        border-style: solid;
      }

      .dg-pick-hint {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 8px 12px;
        border-radius: var(--radius-sm, 8px);
        font-family: var(--font-heading, sans-serif);
        font-size: 0.84rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      /* Slider Control Panel */
      .dg-control-panel {
        background: var(--bg-glass, rgba(15, 23, 42, 0.85));
        backdrop-filter: blur(16px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-lg, 20px);
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .dg-slider-header {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
      }

      .dg-slider-label {
        font-size: 0.9rem;
        color: var(--text-secondary, #94a3b8);
        font-weight: 600;
      }

      .dg-guess-readout {
        font-family: var(--font-heading, sans-serif);
        font-size: 2rem;
        font-weight: 900;
        background: linear-gradient(135deg, #00f2fe, #10b981);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.02em;
      }

      .dg-range-wrap {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .dg-range {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 12px;
        border-radius: 999px;
        background: linear-gradient(
          90deg,
          #00f2fe 0%,
          #10b981 var(--pct, 30%),
          rgba(148, 163, 184, 0.25) var(--pct, 30%),
          rgba(148, 163, 184, 0.25) 100%
        );
        outline: none;
        cursor: pointer;
      }

      .dg-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #ffffff;
        border: 4px solid #00f2fe;
        box-shadow: 0 0 18px rgba(0, 242, 254, 0.55);
        cursor: grab;
        transition: transform 0.15s ease;
      }

      .dg-range::-webkit-slider-thumb:hover {
        transform: scale(1.12);
      }

      .dg-range::-moz-range-thumb {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #ffffff;
        border: 4px solid #00f2fe;
        box-shadow: 0 0 18px rgba(0, 242, 254, 0.55);
        cursor: grab;
      }

      .dg-range-scale {
        display: flex;
        justify-content: space-between;
        font-size: 0.76rem;
        color: var(--text-muted, #64748b);
        font-weight: 600;
      }

      .dg-nudge-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .dg-nudge-group {
        display: inline-flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .dg-nudge-btn {
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-heading, sans-serif);
        font-size: 0.8rem;
        font-weight: 700;
        padding: 6px 11px;
        border-radius: var(--radius-sm, 8px);
        cursor: pointer;
        transition: all 0.16s ease;
      }

      .dg-nudge-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.14);
      }

      .dg-primary-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: none;
        border-radius: var(--radius-md, 12px);
        padding: 13px 24px;
        font-family: var(--font-heading, sans-serif);
        font-size: 0.98rem;
        font-weight: 800;
        cursor: pointer;
        color: #061224;
        background: linear-gradient(135deg, #00f2fe 0%, #10b981 100%);
        box-shadow: 0 8px 24px rgba(0, 242, 254, 0.28);
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }

      .dg-primary-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(0, 242, 254, 0.4);
      }

      .dg-secondary-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        border-radius: var(--radius-md, 12px);
        padding: 11px 18px;
        font-family: var(--font-heading, sans-serif);
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        color: var(--text-primary, #f8fafc);
        background: rgba(255, 255, 255, 0.06);
        transition: all 0.18s ease;
      }

      .dg-secondary-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
      }

      /* Result Reveal Panel */
      .dg-result-panel {
        background: var(--bg-glass, rgba(15, 23, 42, 0.88));
        border: 1px solid rgba(0, 242, 254, 0.3);
        border-radius: var(--radius-lg, 20px);
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        animation: dgPop 0.28s ease;
      }

      .dg-result-top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .dg-tier-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        border-radius: 999px;
        font-family: var(--font-heading, sans-serif);
        font-weight: 800;
        font-size: 0.92rem;
      }

      .dg-tier-badge.tier-legend { background: rgba(16, 185, 129, 0.22); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.45); }
      .dg-tier-badge.tier-great  { background: rgba(0, 242, 254, 0.18); color: #67e8f9; border: 1px solid rgba(0, 242, 254, 0.45); }
      .dg-tier-badge.tier-good   { background: rgba(79, 172, 254, 0.18); color: #93c5fd; border: 1px solid rgba(79, 172, 254, 0.45); }
      .dg-tier-badge.tier-mid    { background: rgba(245, 158, 11, 0.18); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.45); }
      .dg-tier-badge.tier-far    { background: rgba(244, 63, 94, 0.18); color: #fda4af; border: 1px solid rgba(244, 63, 94, 0.45); }

      .dg-points-burst {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.65rem;
        font-weight: 900;
        color: var(--accent-emerald, #10b981);
      }

      /* Visual Ruler Comparison */
      .dg-ruler-box {
        padding: 12px 14px 16px;
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        border-radius: var(--radius-md, 12px);
      }

      .dg-ruler-track {
        position: relative;
        height: 12px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.2);
        margin: 26px 8px 10px;
      }

      .dg-ruler-gap {
        position: absolute;
        top: 0;
        bottom: 0;
        border-radius: 999px;
        background: linear-gradient(90deg, rgba(245, 158, 11, 0.7), rgba(16, 185, 129, 0.85));
      }

      .dg-ruler-pin {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 3px solid #ffffff;
        z-index: 2;
      }

      .dg-ruler-pin.actual {
        background: #10b981;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.7);
      }

      .dg-ruler-pin.guess {
        background: #f59e0b;
        box-shadow: 0 0 12px rgba(245, 158, 11, 0.7);
      }

      .dg-ruler-tag {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        font-size: 0.72rem;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 6px;
        background: rgba(15, 23, 42, 0.92);
        color: #f8fafc;
        border: 1px solid rgba(255, 255, 255, 0.16);
      }

      .dg-metrics-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .dg-metric-cell {
        padding: 10px 12px;
        border-radius: var(--radius-sm, 8px);
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        text-align: center;
      }

      .dg-metric-cell small {
        display: block;
        font-size: 0.72rem;
        color: var(--text-secondary, #94a3b8);
        margin-bottom: 2px;
      }

      .dg-metric-cell strong {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.02rem;
        color: var(--text-primary, #f8fafc);
      }

      .dg-result-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .dg-tip-text {
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* 5-Round Summary Card */
      .dg-summary-card {
        background: var(--bg-glass, rgba(15, 23, 42, 0.9));
        border: 1px solid rgba(0, 242, 254, 0.32);
        border-radius: var(--radius-lg, 20px);
        padding: 28px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        animation: dgPop 0.3s ease;
      }

      .dg-summary-hero {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .dg-summary-icon {
        font-size: 3rem;
        line-height: 1;
      }

      .dg-summary-score {
        font-family: var(--font-heading, sans-serif);
        font-size: 2.5rem;
        font-weight: 900;
        background: linear-gradient(135deg, #00f2fe, #10b981);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .dg-record-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 14px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.2);
        border: 1px solid rgba(245, 158, 11, 0.55);
        color: #fcd34d;
        font-weight: 800;
        font-size: 0.84rem;
      }

      .dg-history-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .dg-history-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 11px 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .dg-history-cities {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        font-weight: 700;
      }

      .dg-city-chip-btn {
        border: 1px solid rgba(0, 242, 254, 0.3);
        background: rgba(0, 242, 254, 0.1);
        color: var(--text-primary, #f8fafc);
        border-radius: 8px;
        padding: 3px 9px;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.16s ease;
      }

      .dg-city-chip-btn:hover {
        background: rgba(0, 242, 254, 0.25);
        border-color: var(--accent-cyan, #00f2fe);
      }

      .dg-history-meta {
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .dg-history-pts {
        font-family: var(--font-heading, sans-serif);
        font-weight: 800;
        color: var(--accent-emerald, #10b981);
      }

      /* Duel Feedback Bar */
      .dg-duel-feedback {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 16px 20px;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-glass, rgba(15, 23, 42, 0.88));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        animation: dgPop 0.25s ease;
      }

      .dg-duel-feedback.correct {
        border-color: rgba(16, 185, 129, 0.55);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(15, 23, 42, 0.86));
      }

      .dg-duel-feedback.wrong {
        border-color: rgba(244, 63, 94, 0.55);
        background: linear-gradient(135deg, rgba(244, 63, 94, 0.16), rgba(15, 23, 42, 0.86));
      }

      .dg-duel-verdict {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .dg-duel-verdict strong {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.08rem;
        color: var(--text-primary, #f8fafc);
      }

      .dg-duel-verdict span {
        font-size: 0.84rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* Light Theme Adjustments */
      body.light-theme .dg-header,
      body.light-theme .dg-control-panel,
      body.light-theme .dg-result-panel,
      body.light-theme .dg-summary-card,
      body.light-theme .dg-duel-feedback {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .dg-mode-tabs {
        background: rgba(15, 23, 42, 0.06);
      }

      body.light-theme .dg-mode-tab.active {
        background: linear-gradient(135deg, #0284c7, #059669);
        border-color: transparent;
        color: #ffffff;
      }

      body.light-theme .dg-stat-pill,
      body.light-theme .dg-city-card {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .dg-ruler-box,
      body.light-theme .dg-metric-cell,
      body.light-theme .dg-history-row,
      body.light-theme .dg-nudge-btn,
      body.light-theme .dg-secondary-btn,
      body.light-theme .dg-pick-hint {
        background: rgba(15, 23, 42, 0.04);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .dg-reveal-metric {
        background: rgba(15, 23, 42, 0.05);
      }

      body.light-theme .dg-reveal-metric.winner {
        color: #047857;
      }

      body.light-theme .dg-reveal-metric.loser {
        color: #be123c;
      }

      body.light-theme .dg-vs-badge {
        box-shadow: 0 0 0 5px #f1f5f9, 0 8px 20px rgba(2, 132, 199, 0.25);
      }

      body.light-theme .dg-explore-cta {
        color: #0284c7;
        border-color: rgba(2, 132, 199, 0.45);
      }

      /* Responsive Breakpoints */
      @media (max-width: 820px) {
        .dg-hud {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .dg-metrics-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 640px) {
        .dg-arena {
          grid-template-columns: 1fr;
          gap: 14px;
        }
        .dg-vs-badge {
          width: 40px;
          height: 40px;
          font-size: 0.8rem;
        }
        .dg-photo-wrap {
          height: 175px;
        }
        .dg-header {
          padding: 14px 16px;
        }
        .dg-control-panel,
        .dg-result-panel,
        .dg-summary-card {
          padding: 16px;
        }
        .dg-mode-tabs {
          width: 100%;
        }
        .dg-mode-tab {
          flex: 1;
          justify-content: center;
          padding: 9px 10px;
          font-size: 0.8rem;
        }
        .dg-prompt-question {
          font-size: 1.2rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // RENDER HELPERS
  // =========================================================================
  function renderCityCard(city, options, esc) {
    const {
      side,
      hidePlate,
      clickableMode, // 'none' | 'explore' | 'pick'
      statusClass,   // '' | 'is-winner' | 'is-wrong' | 'is-dimmed'
      metricHtml,
      keyHint
    } = options;

    const photo = getProvincePhoto(city);
    const isInteractive = clickableMode !== 'none';
    const plateBadge = hidePlate
      ? `<span class="dg-pill plate">🚘 Plaka: ??</span>`
      : `<span class="dg-pill plate">🚘 ${formatPlate(city.plate)}</span>`;

    const visitedBadge = city.visited
      ? `<span class="dg-pill visited">✓ Gezildi</span>`
      : '';

    let footerHtml = '';
    if (clickableMode === 'explore') {
      footerHtml = `<div class="dg-explore-cta">📖 Şehir Dosyasını İncele →</div>`;
    } else if (clickableMode === 'pick') {
      footerHtml = `<div class="dg-pick-hint">👆 Bu Şehri Seç ${keyHint ? `(${keyHint})` : ''}</div>`;
    }

    const attrs =
      clickableMode === 'explore'
        ? `data-explore-city="${esc(city.key)}" role="button" tabindex="0"`
        : clickableMode === 'pick'
          ? `data-pick-city="${esc(city.key)}" role="button" tabindex="0"`
          : '';

    return `
      <div class="dg-city-card ${isInteractive ? 'is-interactive' : ''} ${statusClass || ''}" data-side="${side}" ${attrs}>
        <div class="dg-photo-wrap">
          ${
            photo
              ? `<img class="dg-photo" src="${esc(photo)}" alt="${esc(city.name)}" loading="lazy" />`
              : ''
          }
          <div class="dg-photo-overlay"></div>
          <div class="dg-card-top-badges">
            ${plateBadge}
            ${visitedBadge}
          </div>
          <div class="dg-card-title-overlay">
            <div class="dg-city-name">${esc(city.name)}</div>
            <div class="dg-city-region">📍 ${esc(city.region || '')} Bölgesi</div>
          </div>
        </div>
        <div class="dg-card-body">
          <p class="dg-city-quote">${esc(city.quote || city.custom_quote || 'Anadolu’nun kadim duraklarından biri.')}</p>
          ${metricHtml || ''}
          ${footerHtml}
        </div>
      </div>
    `;
  }

  function renderDistanceMode(esc) {
    // 5-Round Summary View
    if (gameState.distFinished) {
      const rank = getFinalRank(gameState.distScore);
      const avgErr = gameState.distHistory.length
        ? Math.round(
            gameState.distHistory.reduce((acc, r) => acc + r.errorKm, 0) /
              gameState.distHistory.length
          )
        : 0;

      const rowsHtml = gameState.distHistory
        .map(
          r => `
          <div class="dg-history-row">
            <div class="dg-history-cities">
              <span style="color:var(--text-muted);font-size:0.78rem;">#${r.round}</span>
              <button type="button" class="dg-city-chip-btn" data-explore-city="${esc(r.a.key)}">${esc(r.a.name)}</button>
              <span style="color:var(--text-muted);">↔</span>
              <button type="button" class="dg-city-chip-btn" data-explore-city="${esc(r.b.key)}">${esc(r.b.name)}</button>
            </div>
            <div class="dg-history-meta">
              <span>Tahmin: <strong>${formatKm(r.guess)} km</strong></span>
              <span>Gerçek: <strong>${formatKm(r.actual)} km</strong></span>
              <span>Sapma: <strong>±${formatKm(r.errorKm)} km</strong></span>
              <span class="dg-history-pts">+${formatKm(r.points)}</span>
            </div>
          </div>
        `
        )
        .join('');

      return `
        <div class="dg-summary-card">
          <div class="dg-summary-hero">
            <div class="dg-summary-icon">${rank.icon}</div>
            <h3 style="font-family:var(--font-heading);font-size:1.45rem;margin:0;">${esc(rank.title)}</h3>
            <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">${esc(rank.desc)}</p>
            <div class="dg-summary-score">${formatKm(gameState.distScore)} <span style="font-size:1.1rem;opacity:0.75;">/ 5.000</span></div>
            ${gameState.distNewRecord ? `<div class="dg-record-pill">🏆 YENİ KİŞİSEL REKOR!</div>` : ''}
            <div style="font-size:0.86rem;color:var(--text-secondary);">
              Ortalama Sapma: <strong>±${formatKm(avgErr)} km</strong> • Kişisel Rekor: <strong>${formatKm(gameState.distBest)}</strong>
            </div>
          </div>

          <div class="dg-history-list">
            ${rowsHtml}
          </div>

          <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
            <button type="button" class="dg-primary-btn" data-action="restart-distance">
              🔄 Yeni 5 Tur Başlat
            </button>
            <button type="button" class="dg-secondary-btn" data-switch-mode="duel">
              🧭 Hızlı Coğrafya Düellosuna Geç
            </button>
          </div>
          <p class="dg-tip-text" style="text-align:center;">
            İpucu: Yukarıdaki herhangi bir şehre tıklayarak tam seyahatname dosyasını açabilirsin.
          </p>
        </div>
      `;
    }

    const pair = gameState.distPair;
    if (!pair) return '';

    const pct = Math.max(
      0,
      Math.min(100, ((gameState.distGuess - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100)
    );

    const dotsHtml = Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
      const roundNum = i + 1;
      const cls =
        roundNum < gameState.distRound || (roundNum === gameState.distRound && gameState.distLocked)
          ? 'done'
          : roundNum === gameState.distRound
            ? 'current'
            : '';
      return `<span class="dg-dot ${cls}"></span>`;
    }).join('');

    const hudHtml = `
      <div class="dg-hud">
        <div class="dg-stat-pill">
          <span class="dg-stat-label">Tur İlerlemesi</span>
          <span class="dg-stat-value">${gameState.distRound} / ${TOTAL_ROUNDS}</span>
          <div class="dg-round-dots">${dotsHtml}</div>
        </div>
        <div class="dg-stat-pill">
          <span class="dg-stat-label">Anlık Skor</span>
          <span class="dg-stat-value accent-cyan">${formatKm(gameState.distScore)}</span>
        </div>
        <div class="dg-stat-pill">
          <span class="dg-stat-label">Kişisel Rekor</span>
          <span class="dg-stat-value accent-gold">🏆 ${formatKm(gameState.distBest)}</span>
        </div>
        <div class="dg-stat-pill">
          <span class="dg-stat-label">Maks. Tur Puanı</span>
          <span class="dg-stat-value accent-emerald">1.000</span>
        </div>
      </div>
    `;

    const promptHtml = `
      <div class="dg-prompt-banner">
        <div class="dg-prompt-badge">📏 MESAFE TAHMİNİ • TUR ${gameState.distRound}/${TOTAL_ROUNDS}</div>
        <div class="dg-prompt-question">${esc(pair.a.name)} ↔ ${esc(pair.b.name)} arası kaç km?</div>
        <div class="dg-prompt-hint">Karayolu tahmini (Kuş uçuşu × 1.35) • Sürgüyü ayarla ve tahminini kilitle</div>
      </div>
    `;

    const cardMode = gameState.distLocked ? 'explore' : 'none';
    const arenaHtml = `
      <div class="dg-arena">
        ${renderCityCard(pair.a, { side: 'left', hidePlate: false, clickableMode: cardMode }, esc)}
        <div class="dg-vs-badge">KM</div>
        ${renderCityCard(pair.b, { side: 'right', hidePlate: false, clickableMode: cardMode }, esc)}
      </div>
    `;

    let bottomHtml = '';
    if (!gameState.distLocked) {
      bottomHtml = `
        <div class="dg-control-panel">
          <div class="dg-slider-header">
            <span class="dg-slider-label">Tahmini Karayolu Mesafesi</span>
            <span class="dg-guess-readout" id="dg-guess-readout">${formatKm(gameState.distGuess)} km</span>
          </div>

          <div class="dg-range-wrap">
            <input
              type="range"
              id="dg-distance-slider"
              class="dg-range"
              min="${SLIDER_MIN}"
              max="${SLIDER_MAX}"
              step="5"
              value="${gameState.distGuess}"
              style="--pct:${pct.toFixed(1)}%"
              aria-label="Mesafe tahmini (km)"
            />
            <div class="dg-range-scale">
              <span>50 km</span>
              <span>450 km</span>
              <span>900 km</span>
              <span>1.350 km</span>
              <span>1.800 km</span>
            </div>
          </div>

          <div class="dg-nudge-row">
            <div class="dg-nudge-group">
              <button type="button" class="dg-nudge-btn" data-nudge="-100">-100</button>
              <button type="button" class="dg-nudge-btn" data-nudge="-25">-25</button>
              <button type="button" class="dg-nudge-btn" data-nudge="+25">+25</button>
              <button type="button" class="dg-nudge-btn" data-nudge="+100">+100</button>
            </div>
            <button type="button" class="dg-primary-btn" data-action="lock-guess">
              🔒 Tahmini Kilitle
            </button>
          </div>
        </div>
      `;
    } else if (gameState.distLastResult) {
      const r = gameState.distLastResult;
      const guessPct = Math.max(2, Math.min(98, ((r.guess - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100));
      const actualPct = Math.max(2, Math.min(98, ((r.actual - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100));
      const gapLeft = Math.min(guessPct, actualPct);
      const gapWidth = Math.max(1.5, Math.abs(actualPct - guessPct));
      const nextLabel =
        gameState.distRound >= TOTAL_ROUNDS
          ? '🏁 5 Tur Özetini Gör →'
          : `Sonraki Tur (${gameState.distRound + 1}/${TOTAL_ROUNDS}) →`;

      bottomHtml = `
        <div class="dg-result-panel">
          <div class="dg-result-top">
            <span class="dg-tier-badge ${r.tier.cls}">${esc(r.tier.label)}</span>
            <span class="dg-points-burst">+${formatKm(r.points)} puan</span>
          </div>

          <div class="dg-ruler-box">
            <div class="dg-ruler-track">
              <div class="dg-ruler-gap" style="left:${gapLeft.toFixed(1)}%;width:${gapWidth.toFixed(1)}%;"></div>
              <div class="dg-ruler-pin guess" style="left:${guessPct.toFixed(1)}%;">
                <span class="dg-ruler-tag">Tahmin: ${formatKm(r.guess)} km</span>
              </div>
              <div class="dg-ruler-pin actual" style="left:${actualPct.toFixed(1)}%;">
                <span class="dg-ruler-tag" style="top:20px;bottom:auto;border-color:rgba(16,185,129,0.6);">Gerçek: ${formatKm(r.actual)} km</span>
              </div>
            </div>
          </div>

          <div class="dg-metrics-grid">
            <div class="dg-metric-cell">
              <small>Karayolu Mesafesi</small>
              <strong>${formatKm(r.actual)} km</strong>
            </div>
            <div class="dg-metric-cell">
              <small>Hata Payı</small>
              <strong>±${formatKm(r.errorKm)} km</strong>
            </div>
            <div class="dg-metric-cell">
              <small>Kuş Uçuşu</small>
              <strong>${formatKm(r.airKm)} km</strong>
            </div>
            <div class="dg-metric-cell">
              <small>Tahmini Sürüş</small>
              <strong>${esc(formatDriveTime(r.actual))}</strong>
            </div>
          </div>

          <div class="dg-result-actions">
            <span class="dg-tip-text">📖 Yukarıdaki iki şehirden herhangi birine tıklayıp dosyasını keşfedebilirsin.</span>
            <button type="button" class="dg-primary-btn" data-action="next-dist-round">
              ${nextLabel}
            </button>
          </div>
        </div>
      `;
    }

    return `${hudHtml}${promptHtml}${arenaHtml}${bottomHtml}`;
  }

  function renderDuelMode(esc) {
    const q = gameState.duelQuestion;
    if (!q) return '';

    const accuracy =
      gameState.duelTotal > 0
        ? Math.round((gameState.duelCorrect / gameState.duelTotal) * 100)
        : 0;

    const hudHtml = `
      <div class="dg-hud">
        <div class="dg-stat-pill">
          <span class="dg-stat-label">Aktif Seri</span>
          <span class="dg-stat-value accent-gold">🔥 ${gameState.duelStreak}</span>
        </div>
        <div class="dg-stat-pill">
          <span class="dg-stat-label">En İyi Seri</span>
          <span class="dg-stat-value accent-cyan">🏆 ${gameState.duelBestStreak}</span>
        </div>
        <div class="dg-stat-pill">
          <span class="dg-stat-label">Doğru / Toplam</span>
          <span class="dg-stat-value accent-emerald">${gameState.duelCorrect} / ${gameState.duelTotal}</span>
        </div>
        <div class="dg-stat-pill">
          <span class="dg-stat-label">İsabet Oranı</span>
          <span class="dg-stat-value">%${accuracy}</span>
        </div>
      </div>
    `;

    const promptHtml = `
      <div class="dg-prompt-banner">
        <div class="dg-prompt-badge">${q.type.icon} ${esc(q.type.badge)}</div>
        <div class="dg-prompt-question">${esc(q.type.prompt)}</div>
        <div class="dg-prompt-hint">${esc(q.type.hint)}</div>
      </div>
    `;

    const hidePlate = q.type.id === 'plate' && !gameState.duelAnswered;
    const cardMode = gameState.duelAnswered ? 'explore' : 'pick';

    let statusA = '';
    let statusB = '';
    let metricA = '';
    let metricB = '';

    if (gameState.duelAnswered) {
      const aIsWinner = q.winnerKey === q.a.key;
      const bIsWinner = q.winnerKey === q.b.key;

      statusA = aIsWinner
        ? 'is-winner'
        : gameState.duelPickedKey === q.a.key
          ? 'is-wrong'
          : 'is-dimmed';
      statusB = bIsWinner
        ? 'is-winner'
        : gameState.duelPickedKey === q.b.key
          ? 'is-wrong'
          : 'is-dimmed';

      metricA = `
        <div class="dg-reveal-metric ${aIsWinner ? 'winner' : 'loser'}">
          <span>${esc(q.labelA)}</span>
          <span>${aIsWinner ? '👑 KAZANAN' : ''}</span>
        </div>
      `;
      metricB = `
        <div class="dg-reveal-metric ${bIsWinner ? 'winner' : 'loser'}">
          <span>${esc(q.labelB)}</span>
          <span>${bIsWinner ? '👑 KAZANAN' : ''}</span>
        </div>
      `;
    }

    const arenaHtml = `
      <div class="dg-arena">
        ${renderCityCard(
          q.a,
          {
            side: 'left',
            hidePlate,
            clickableMode: cardMode,
            statusClass: statusA,
            metricHtml: metricA,
            keyHint: '1'
          },
          esc
        )}
        <div class="dg-vs-badge">VS</div>
        ${renderCityCard(
          q.b,
          {
            side: 'right',
            hidePlate,
            clickableMode: cardMode,
            statusClass: statusB,
            metricHtml: metricB,
            keyHint: '2'
          },
          esc
        )}
      </div>
    `;

    let feedbackHtml = '';
    if (gameState.duelAnswered) {
      const winnerCity = q.winnerKey === q.a.key ? q.a : q.b;
      const verdictTitle = gameState.duelWasCorrect
        ? `✅ Doğru! ${winnerCity.name} kazandı ${gameState.duelNewRecord ? '• 🏆 Yeni Rekor!' : ''}`
        : `❌ Yanlış! Doğru cevap ${winnerCity.name} idi`;

      feedbackHtml = `
        <div class="dg-duel-feedback ${gameState.duelWasCorrect ? 'correct' : 'wrong'}">
          <div class="dg-duel-verdict">
            <strong>${esc(verdictTitle)}</strong>
            <span>${esc(q.diffText)} • Şehir kartlarına tıklayarak tam dosyalarını inceleyebilirsin.</span>
          </div>
          <button type="button" class="dg-primary-btn" data-action="next-duel">
            ⚡ Sonraki Düello →
          </button>
        </div>
      `;
    }

    return `${hudHtml}${promptHtml}${arenaHtml}${feedbackHtml}`;
  }

  // =========================================================================
  // MAIN UI RENDER & EVENT BINDING
  // =========================================================================
  function renderUI(container, ctx, entries) {
    const esc = ctx && typeof ctx.escapeHtml === 'function' ? ctx.escapeHtml : defaultEscapeHtml;
    const distFn = getDistFn(ctx);

    const bodyHtml =
      gameState.activeMode === 'distance' ? renderDistanceMode(esc) : renderDuelMode(esc);

    container.innerHTML = `
      <div class="dg-shell">
        <div class="dg-header">
          <div class="dg-title-wrap">
            <h2 class="dg-title">🎮 Anadolu Mesafe &amp; Coğrafya Düellosu</h2>
            <p class="dg-subtitle">81 ilin gerçek fotoğraflarıyla karayolu mesafelerini ve Anadolu coğrafyasını test et</p>
          </div>
          <div class="dg-mode-tabs" role="tablist" aria-label="Oyun Modları">
            <button type="button" class="dg-mode-tab ${gameState.activeMode === 'distance' ? 'active' : ''}" data-switch-mode="distance" role="tab" aria-selected="${gameState.activeMode === 'distance'}">
              📏 Mesafe Tahmini
            </button>
            <button type="button" class="dg-mode-tab ${gameState.activeMode === 'duel' ? 'active' : ''}" data-switch-mode="duel" role="tab" aria-selected="${gameState.activeMode === 'duel'}">
              🧭 Hızlı Düello
            </button>
          </div>
        </div>
        ${bodyHtml}
      </div>
    `;

    // Bind mode tabs
    container.querySelectorAll('[data-switch-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextMode = btn.getAttribute('data-switch-mode');
        if (!nextMode || nextMode === gameState.activeMode) return;
        gameState.activeMode = nextMode;
        if (nextMode === 'distance' && !gameState.distPair && !gameState.distFinished) {
          startNewDistanceGame(entries, distFn);
        }
        if (nextMode === 'duel' && !gameState.duelQuestion) {
          nextDuel(entries, distFn);
        }
        renderUI(container, ctx, entries);
      });
    });

    // Bind slider input live update
    const slider = container.querySelector('#dg-distance-slider');
    const readout = container.querySelector('#dg-guess-readout');
    if (slider) {
      const updateSliderVisual = val => {
        const clamped = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, val));
        gameState.distGuess = clamped;
        slider.value = String(clamped);
        const pct = ((clamped - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
        slider.style.setProperty('--pct', `${pct.toFixed(1)}%`);
        if (readout) {
          readout.textContent = `${formatKm(clamped)} km`;
        }
      };

      slider.addEventListener('input', e => {
        updateSliderVisual(parseInt(e.target.value, 10) || SLIDER_DEFAULT);
      });

      container.querySelectorAll('[data-nudge]').forEach(btn => {
        btn.addEventListener('click', () => {
          const delta = parseInt(btn.getAttribute('data-nudge'), 10) || 0;
          updateSliderVisual(gameState.distGuess + delta);
        });
      });
    }

    // Bind action buttons
    const lockBtn = container.querySelector('[data-action="lock-guess"]');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        lockDistanceGuess(ctx);
        renderUI(container, ctx, entries);
      });
    }

    const nextDistBtn = container.querySelector('[data-action="next-dist-round"]');
    if (nextDistBtn) {
      nextDistBtn.addEventListener('click', () => {
        advanceDistanceRound(entries, distFn);
        renderUI(container, ctx, entries);
      });
    }

    const restartBtn = container.querySelector('[data-action="restart-distance"]');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        startNewDistanceGame(entries, distFn);
        renderUI(container, ctx, entries);
      });
    }

    const nextDuelBtn = container.querySelector('[data-action="next-duel"]');
    if (nextDuelBtn) {
      nextDuelBtn.addEventListener('click', () => {
        nextDuel(entries, distFn);
        renderUI(container, ctx, entries);
      });
    }

    // Bind Duel city pick cards
    container.querySelectorAll('[data-pick-city]').forEach(card => {
      const handlePick = () => {
        const key = card.getAttribute('data-pick-city');
        if (!key) return;
        answerDuel(key, ctx);
        renderUI(container, ctx, entries);
      };
      card.addEventListener('click', handlePick);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePick();
        }
      });
    });

    // Bind Explore City dossier cards & chips
    container.querySelectorAll('[data-explore-city]').forEach(el => {
      const handleExplore = () => {
        const key = el.getAttribute('data-explore-city');
        if (key && ctx && typeof ctx.selectCity === 'function') {
          ctx.selectCity(key);
        }
      };
      el.addEventListener('click', handleExplore);
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleExplore();
        }
      });
    });
  }

  function bindKeyboardShortcuts(container, ctx, entries) {
    if (gameState.keyHandler) {
      document.removeEventListener('keydown', gameState.keyHandler);
    }

    gameState.keyHandler = e => {
      if (!container || !document.body.contains(container)) return;
      if (container.offsetParent === null) return; // Hidden tab/view

      const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        // Allow Enter to lock guess while slider has focus
        if (e.target.id === 'dg-distance-slider' && e.key === 'Enter' && !gameState.distLocked) {
          e.preventDefault();
          lockDistanceGuess(ctx);
          renderUI(container, ctx, entries);
        }
        return;
      }

      const distFn = getDistFn(ctx);

      if (gameState.activeMode === 'distance') {
        if (e.key === 'Enter') {
          if (gameState.distFinished) {
            e.preventDefault();
            startNewDistanceGame(entries, distFn);
            renderUI(container, ctx, entries);
          } else if (!gameState.distLocked) {
            e.preventDefault();
            lockDistanceGuess(ctx);
            renderUI(container, ctx, entries);
          } else {
            e.preventDefault();
            advanceDistanceRound(entries, distFn);
            renderUI(container, ctx, entries);
          }
        }
      } else if (gameState.activeMode === 'duel' && gameState.duelQuestion) {
        if (!gameState.duelAnswered) {
          if (e.key === '1' || e.key === 'ArrowLeft') {
            e.preventDefault();
            answerDuel(gameState.duelQuestion.a.key, ctx);
            renderUI(container, ctx, entries);
          } else if (e.key === '2' || e.key === 'ArrowRight') {
            e.preventDefault();
            answerDuel(gameState.duelQuestion.b.key, ctx);
            renderUI(container, ctx, entries);
          }
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          nextDuel(entries, distFn);
          renderUI(container, ctx, entries);
        }
      }
    };

    document.addEventListener('keydown', gameState.keyHandler);
  }

  // =========================================================================
  // PUBLIC MODULE ENTRYPOINT
  // =========================================================================
  function render(container, ctx) {
    if (!container) return;
    const safeCtx = ctx || {};
    const data =
      safeCtx.data ||
      (safeCtx.state && safeCtx.state.data) ||
      (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const entries = getProvinceEntries(data);
    const distFn = getDistFn(safeCtx);

    injectStyles();

    if (entries.length < 2) {
      container.innerHTML = `
        <div class="glass-card" style="padding:28px;text-align:center;max-width:560px;margin:32px auto;">
          <h3 style="margin-bottom:8px;">🎮 Anadolu Mesafe &amp; Coğrafya Düellosu</h3>
          <p style="color:var(--text-secondary);">Oyunu başlatmak için il koordinat verileri yüklenemedi.</p>
        </div>
      `;
      return;
    }

    gameState.activeContainer = container;
    gameState.activeCtx = safeCtx;
    gameState.distBest = loadStorageInt(DIST_BEST_KEY);
    gameState.duelBestStreak = loadStorageInt(DUEL_BEST_KEY);

    if (!gameState.distPair && !gameState.distFinished) {
      startNewDistanceGame(entries, distFn);
    }
    if (!gameState.duelQuestion) {
      nextDuel(entries, distFn);
    }

    bindKeyboardShortcuts(container, safeCtx, entries);
    renderUI(container, safeCtx, entries);
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.distanceGame = { render };
})();
