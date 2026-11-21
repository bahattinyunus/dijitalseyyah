/**
 * 🏆 Rütbe & Başarım Galerisi + Canlı Rozet Değerlendirici
 * Anadolu Seyahatnamesi — 23 veri güdümlü başarım, 6 kademeli Seyyah Rütbe Merdiveni,
 * XP barı, özel SVG rozetler & localStorage telemetrisi.
 * Registers on: window.SEYYAH_MODULES.achievements = { render(container, ctx), init(ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-achievements-styles';
  const UNLOCKED_CACHE_KEY = 'dijital_seyyah_achievements_unlocked_v1';
  const BUCKET_STORAGE_KEY = 'dijital_seyyah_achievements_bucket_v1';

  const STORAGE_KEYS = {
    favorites: 'dijital_seyyah_favorites',
    journalPersonal: 'dijital_seyyah_personal_journal_v1',
    journalAi: 'dijital_seyyah_journal_entries',
    pomodoroMinutes: 'dijital_seyyah_pomodoro_minutes',
    pomodoroCount: 'dijital_seyyah_pomodoro_count',
    pomodoroStats: 'dijital_seyyah_pomodoro_stats',
    packing: 'dijital_seyyah_packing_v1',
    readerCompleted: 'seyyah_reader_completed_v1',
    quizBest: 'dijital_seyyah_quiz_best',
    bucketListCandidates: [
      'dijital_seyyah_bucket_list',
      'dijital_seyyah_bucket_v1',
      'seyyah_bucket_list',
      'seyyah_bucket_v1',
      'dijital_seyyah_achievements_bucket_v1'
    ]
  };

  const REGION_ORDER = [
    '01_Marmara',
    '02_Ege',
    '03_Akdeniz',
    '04_IcAnadolu',
    '05_Karadeniz',
    '06_DoguAnadolu',
    '07_GuneydoguAnadolu'
  ];

  const DEFAULT_REGIONS = {
    '01_Marmara': { name: 'Marmara', icon: '🏰', color: '#38bdf8' },
    '02_Ege': { name: 'Ege', icon: '🌊', color: '#34d399' },
    '03_Akdeniz': { name: 'Akdeniz', icon: '☀️', color: '#f59e0b' },
    '04_IcAnadolu': { name: 'İç Anadolu', icon: '🌾', color: '#fbbf24' },
    '05_Karadeniz': { name: 'Karadeniz', icon: '🌲', color: '#10b981' },
    '06_DoguAnadolu': { name: 'Doğu Anadolu', icon: '🏔️', color: '#a855f7' },
    '07_GuneydoguAnadolu': { name: 'Güneydoğu', icon: '🏜️', color: '#f97316' }
  };

  // 6-Tier Rank Progression Ladder (Exact spec)
  const RANK_LADDER = [
    {
      id: 'cirak',
      min: 0,
      max: 9,
      rangeLabel: '0-9 il',
      icon: '🌱',
      title: 'Çırak Seyyah',
      emblem: 'seedling',
      accent: '#10b981',
      desc: 'Anadolu yollarına ilk niyetle adım atan genç yolcu.'
    },
    {
      id: 'kervan',
      min: 10,
      max: 24,
      rangeLabel: '10-24 il',
      icon: '🧭',
      title: 'Kervan Yolcusu',
      emblem: 'compass',
      accent: '#38bdf8',
      desc: 'Şehirler arası menzilleri birleştiren tecrübeli gezgin.'
    },
    {
      id: 'evliya',
      min: 25,
      max: 39,
      rangeLabel: '25-39 il',
      icon: '📜',
      title: 'Evliya Çelebi İzinde',
      emblem: 'scroll',
      accent: '#f59e0b',
      desc: 'Kadim seyahatname geleneğini günümüze taşıyan kalem ehli.'
    },
    {
      id: 'kasif',
      min: 40,
      max: 59,
      rangeLabel: '40-59 il',
      icon: '🏛️',
      title: 'Anadolu Kaşifi',
      emblem: 'arch',
      accent: '#00f2fe',
      desc: 'Anadolu yarımadasının yarısını aşmış, bölge fatihi seyyah.'
    },
    {
      id: 'ulu',
      min: 60,
      max: 79,
      rangeLabel: '60-79 il',
      icon: '🦅',
      title: 'Ulu Seyyah',
      emblem: 'falcon',
      accent: '#a855f7',
      desc: 'Dört iklimin zirvelerine mührünü vurmuş bilge seyyah.'
    },
    {
      id: 'cihan',
      min: 80,
      max: 81,
      rangeLabel: '80-81 il',
      icon: '👑',
      title: 'Cihan Seyyahı (81/81)',
      emblem: 'crown',
      accent: '#fbbf24',
      desc: '81 ilin tamamını adımlayarak Seyahatnameyi taçlandıran üstat.'
    }
  ];

  // Turkey's 28 coastal provinces by official traffic plate code
  const COASTAL_PLATES = new Set([
    1, 7, 8, 9, 10, 16, 17, 22, 28, 31, 33, 34, 35, 37,
    39, 41, 48, 52, 53, 54, 55, 57, 59, 61, 67, 74, 77, 81
  ]);

  // All 21 UNESCO World Heritage Sites of Turkey mapped to exact province keys
  const UNESCO_SITE_PROVINCE_KEYS = [
    '01_Marmara/Istanbul',
    '04_IcAnadolu/Nevsehir',
    '04_IcAnadolu/Sivas',
    '05_Karadeniz/Corum',
    '07_GuneydoguAnadolu/Adiyaman',
    '02_Ege/Denizli',
    '03_Akdeniz/Antalya',
    '05_Karadeniz/Karabuk',
    '01_Marmara/Canakkale',
    '01_Marmara/Edirne',
    '04_IcAnadolu/Konya',
    '01_Marmara/Bursa',
    '02_Ege/Izmir',
    '07_GuneydoguAnadolu/Diyarbakir',
    '02_Ege/Izmir',
    '06_DoguAnadolu/Kars',
    '02_Ege/Aydin',
    '07_GuneydoguAnadolu/Sanliurfa',
    '06_DoguAnadolu/Malatya',
    '04_IcAnadolu/Ankara',
    '04_IcAnadolu/Konya'
  ];

  // Historical capitals & ancient Anatolian centers
  const HISTORICAL_HUB_KEYS = [
    '01_Marmara/Istanbul',
    '01_Marmara/Bursa',
    '01_Marmara/Edirne',
    '04_IcAnadolu/Konya',
    '04_IcAnadolu/Sivas',
    '04_IcAnadolu/Ankara',
    '06_DoguAnadolu/Erzurum',
    '07_GuneydoguAnadolu/Mardin'
  ];

  const DEFAULT_ROUTE_ANAKARA_EDIRNE = [
    'Ankara', 'Çankırı', 'Kastamonu', 'Karabük', 'Bartın',
    'Zonguldak', 'Düzce', 'Sakarya', 'İstanbul', 'Edirne'
  ];

  // Interactive Seyyah Bucket List goals stored in localStorage
  const BUCKET_CATALOG = [
    { id: 'kapadokya-balon', title: 'Kapadokya’da gün doğumu yürüyüşü (Nevşehir)', icon: '🎈' },
    { id: 'nemrut-gunes', title: 'Nemrut Dağı’nda şafak vaktini karşıla (Adıyaman)', icon: '🌄' },
    { id: 'gobeklitepe', title: 'Göbeklitepe’de 12 bin yıllık taşları gör (Şanlıurfa)', icon: '🪨' },
    { id: 'selimiye-edirne', title: 'Mimar Sinan’ın ustalık eseri Selimiye’yi ziyaret et (Edirne)', icon: '🕌' },
    { id: 'sumela-manastiri', title: 'Sümela Manastırı patikasını tırman (Trabzon)', icon: '⛰️' },
    { id: 'mevlana-konya', title: 'Mevlana Dergâhı’nda tefekkür vakti geçir (Konya)', icon: '🌹' },
    { id: 'efes-antik', title: 'Efes Antik Kenti Celsus Kütüphanesi’ni gez (İzmir)', icon: '🏛️' },
    { id: 'ani-harabeleri', title: 'Ani Ören Yeri surlarında Arpaçay’ı izle (Kars)', icon: '🏰' },
    { id: 'mardin-tas-sokaklar', title: 'Mardin’in abbaralı taş sokaklarında kaybol (Mardin)', icon: '🏜️' },
    { id: 'safranbolu-konak', title: 'Safranbolu’da tarihi ahşap konakta çay iç (Karabük)', icon: '🍵' }
  ];

  const FILTER_PILLS = [
    { id: 'all', label: 'Tümü' },
    { id: 'unlocked', label: '✅ Kazanılan' },
    { id: 'locked', label: '🔒 Kilitli' },
    { id: 'regional', label: '🌍 Bölgesel' },
    { id: 'culture', label: '📚 Kültür & Odak' }
  ];

  const uiState = {
    filter: 'all',
    showBucketDrawer: false,
    lastCtx: null,
    lastContainer: null,
    initialized: false
  };

  function safeEscape(str, ctx) {
    if (ctx && typeof ctx.escapeHtml === 'function') {
      return ctx.escapeHtml(str);
    }
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeTr(str, ctx) {
    if (ctx && typeof ctx.normalizeTurkish === 'function') {
      return ctx.normalizeTurkish(str);
    }
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

  function readJsonStorage(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed != null ? parsed : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function readIntStorage(key) {
    try {
      const raw = window.localStorage.getItem(key);
      const val = parseInt(raw || '0', 10);
      return Number.isFinite(val) && val > 0 ? val : 0;
    } catch (_) {
      return 0;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  }

  function notify(msg, ctx) {
    if (ctx && typeof ctx.showToast === 'function') {
      ctx.showToast(msg);
    }
  }

  function resolveData(ctx) {
    if (ctx && ctx.data && ctx.data.provinces) return ctx.data;
    if (typeof window !== 'undefined' && window.TRAVEL_DATA && window.TRAVEL_DATA.provinces) {
      return window.TRAVEL_DATA;
    }
    return { provinces: {}, regions: DEFAULT_REGIONS, stats: {}, custom_route: DEFAULT_ROUTE_ANAKARA_EDIRNE };
  }

  function readBucketCompletedIds() {
    const ids = new Set();
    STORAGE_KEYS.bucketListCandidates.forEach((key) => {
      const val = readJsonStorage(key, null);
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach((item) => {
          if (typeof item === 'string' && item.trim()) {
            ids.add(item.trim());
          } else if (item && typeof item === 'object' && (item.done || item.completed)) {
            ids.add(String(item.id || item.title || item.name || Math.random()));
          }
        });
      } else if (typeof val === 'object') {
        if (Array.isArray(val.completed)) {
          val.completed.forEach((id) => {
            if (id) ids.add(String(id));
          });
        } else if (val.completed && typeof val.completed === 'object') {
          Object.keys(val.completed).forEach((k) => {
            if (val.completed[k] === true) ids.add(k);
          });
        } else {
          Object.keys(val).forEach((k) => {
            if (val[k] === true) ids.add(k);
          });
        }
        if (Array.isArray(val.customItems)) {
          val.customItems.forEach((item) => {
            if (item && typeof item === 'object' && (item.completed || item.done)) {
              ids.add(String(item.id || item.title || Math.random()));
            }
          });
        }
      }
    });
    return ids;
  }

  function toggleBucketItem(itemId) {
    const current = readJsonStorage(BUCKET_STORAGE_KEY, []);
    const set = new Set(Array.isArray(current) ? current.map(String) : []);
    if (set.has(itemId)) {
      set.delete(itemId);
    } else {
      set.add(itemId);
    }
    writeJsonStorage(BUCKET_STORAGE_KEY, Array.from(set));
    return set;
  }

  function collectMetrics(ctx) {
    const data = resolveData(ctx);
    const provincesMap = data.provinces || {};
    const provinceEntries = Object.entries(provincesMap);
    const totalProvinces = provinceEntries.length || 81;

    const visitedEntries = provinceEntries.filter(([, p]) => Boolean(p && p.visited));
    const visitedCount = visitedEntries.length;

    // 7 Regions Breakdown
    const regionMeta = Object.assign({}, DEFAULT_REGIONS, data.regions || {});
    const regionStats = {};
    REGION_ORDER.forEach((code) => {
      const meta = regionMeta[code] || { name: code, icon: '🌍', color: '#38bdf8' };
      regionStats[code] = {
        code,
        name: meta.name || code,
        icon: meta.icon || '🌍',
        color: meta.color || '#38bdf8',
        visited: 0,
        total: 0,
        percentage: 0
      };
    });

    const nameLookup = new Map();
    provinceEntries.forEach(([key, prov]) => {
      if (!prov) return;
      nameLookup.set(normalizeTr(prov.name, ctx), { key, prov });
      const rCode = prov.region_code || '04_IcAnadolu';
      if (!regionStats[rCode]) {
        regionStats[rCode] = {
          code: rCode,
          name: rCode,
          icon: '🌍',
          color: '#38bdf8',
          visited: 0,
          total: 0,
          percentage: 0
        };
      }
      regionStats[rCode].total += 1;
      if (prov.visited) regionStats[rCode].visited += 1;
    });

    const regionsBreakdown = REGION_ORDER.map((code) => {
      const r = regionStats[code];
      r.percentage = r.total > 0 ? Math.round((r.visited / r.total) * 100) : 0;
      r.isComplete = r.total > 0 && r.visited === r.total;
      return r;
    });

    const visitedRegionsCount = regionsBreakdown.filter((r) => r.visited > 0).length;
    const completedRegionsCount = regionsBreakdown.filter((r) => r.isComplete).length;

    // Coastal Cities
    const coastalAll = provinceEntries.filter(([, p]) => p && COASTAL_PLATES.has(Number(p.plate)));
    const coastalVisited = coastalAll.filter(([, p]) => Boolean(p.visited)).length;
    const coastalTotal = coastalAll.length || 28;

    // UNESCO & Historical Hubs
    const unescoVisitedSites = UNESCO_SITE_PROVINCE_KEYS.filter(
      (k) => provincesMap[k] && provincesMap[k].visited
    ).length;
    const unescoTotalSites = UNESCO_SITE_PROVINCE_KEYS.length;

    const historicalVisited = HISTORICAL_HUB_KEYS.filter(
      (k) => provincesMap[k] && provincesMap[k].visited
    ).length;
    const historicalTotal = HISTORICAL_HUB_KEYS.length;

    // Landmarks & KM
    const estimatedKm = Number((data.stats && data.stats.estimated_km) || (visitedCount * 279)) || 0;
    const visitedLandmarksCount = visitedEntries.reduce(
      (acc, [, p]) => acc + (Array.isArray(p.landmarks) ? p.landmarks.length : 0),
      0
    );

    // Ankara -> Edirne Route Progress
    const routeList = Array.isArray(data.custom_route) && data.custom_route.length
      ? data.custom_route
      : DEFAULT_ROUTE_ANAKARA_EDIRNE;

    const routeStops = routeList.map((cityName) => {
      const found = nameLookup.get(normalizeTr(cityName, ctx));
      return {
        name: cityName,
        key: found ? found.key : null,
        plate: found && found.prov ? found.prov.plate : null,
        visited: Boolean(found && found.prov && found.prov.visited)
      };
    });
    const routeVisitedCount = routeStops.filter((s) => s.visited).length;
    const routeTotalCount = routeStops.length || 10;

    // localStorage: Favorites
    const favStorage = readJsonStorage(STORAGE_KEYS.favorites, []);
    const favSet = new Set(Array.isArray(favStorage) ? favStorage : []);
    if (ctx && ctx.state && ctx.state.favorites && typeof ctx.state.favorites.forEach === 'function') {
      ctx.state.favorites.forEach((k) => favSet.add(k));
    }
    const favoritesCount = favSet.size;

    // localStorage: Journal Entries (Personal Journal + AI City Concierge)
    const personalJournal = readJsonStorage(STORAGE_KEYS.journalPersonal, {});
    const personalNotesCount = personalJournal && personalJournal.notes && typeof personalJournal.notes === 'object'
      ? Object.values(personalJournal.notes).filter((v) => typeof v === 'string' && v.trim().length > 0).length
      : 0;
    const personalVisitedCount = Array.isArray(personalJournal && personalJournal.visited)
      ? personalJournal.visited.length
      : 0;
    const aiJournalRaw = readJsonStorage(STORAGE_KEYS.journalAi, []);
    const aiJournalCount = Array.isArray(aiJournalRaw) ? aiJournalRaw.length : 0;
    const journalEntriesCount = Math.max(personalNotesCount, personalVisitedCount) + aiJournalCount;

    // localStorage: Pomodoro Minutes & Sessions (library-directory + pomodoro-library)
    const pomodoroStatsObj = readJsonStorage(STORAGE_KEYS.pomodoroStats, {});
    const studioPomodoroMins = Number(pomodoroStatsObj && pomodoroStatsObj.totalFocusMinutes) || 0;
    const studioPomodoroSessions = Number(pomodoroStatsObj && pomodoroStatsObj.completedSessions) || 0;
    const pomodoroMinutes = readIntStorage(STORAGE_KEYS.pomodoroMinutes) + Math.max(0, studioPomodoroMins);
    const pomodoroSessions = readIntStorage(STORAGE_KEYS.pomodoroCount) + Math.max(0, studioPomodoroSessions);

    // localStorage: Bucket List Completions
    const bucketCompletedIds = readBucketCompletedIds();
    const bucketCompletedCount = bucketCompletedIds.size;

    // localStorage: Packing & Reader & Quiz
    const packingRaw = readJsonStorage(STORAGE_KEYS.packing, {});
    const packingCheckedCount = packingRaw && packingRaw.checked && typeof packingRaw.checked === 'object'
      ? Object.values(packingRaw.checked).filter(Boolean).length
      : 0;

    const readerRaw = readJsonStorage(STORAGE_KEYS.readerCompleted, []);
    const readerCompletedCount = Array.isArray(readerRaw) ? readerRaw.length : 0;
    const quizBestScore = readIntStorage(STORAGE_KEYS.quizBest);

    return {
      totalProvinces,
      visitedCount,
      unvisitedCount: Math.max(0, totalProvinces - visitedCount),
      progressPct: totalProvinces ? Math.round((visitedCount / totalProvinces) * 1000) / 10 : 0,
      regionsBreakdown,
      regionMap: regionStats,
      visitedRegionsCount,
      completedRegionsCount,
      coastalVisited,
      coastalTotal,
      unescoVisitedSites,
      unescoTotalSites,
      historicalVisited,
      historicalTotal,
      estimatedKm,
      visitedLandmarksCount,
      routeStops,
      routeVisitedCount,
      routeTotalCount,
      favoritesCount,
      journalEntriesCount,
      pomodoroMinutes,
      pomodoroSessions,
      bucketCompletedIds,
      bucketCompletedCount,
      packingCheckedCount,
      readerCompletedCount,
      quizBestScore
    };
  }

  function buildAchievementsList(m) {
    const karadenizVisited = (m.regionMap['05_Karadeniz'] && m.regionMap['05_Karadeniz'].visited) || 0;
    const doguVisited = (m.regionMap['06_DoguAnadolu'] && m.regionMap['06_DoguAnadolu'].visited) || 0;
    const guneydoguVisited = (m.regionMap['07_GuneydoguAnadolu'] && m.regionMap['07_GuneydoguAnadolu'].visited) || 0;
    const icAnadoluVisited = (m.regionMap['04_IcAnadolu'] && m.regionMap['04_IcAnadolu'].visited) || 0;
    const akdenizVisited = (m.regionMap['03_Akdeniz'] && m.regionMap['03_Akdeniz'].visited) || 0;
    const egeVisited = (m.regionMap['02_Ege'] && m.regionMap['02_Ege'].visited) || 0;
    const marmaraVisited = (m.regionMap['01_Marmara'] && m.regionMap['01_Marmara'].visited) || 0;

    const defs = [
      // === 🌍 BÖLGESEL (12 Achievements) ===
      {
        id: 'first_step',
        title: 'İlk Adım Yolcusu',
        desc: 'Anadolu seyahatnamesinin ilk mührünü bas ve yolculuğu başlat.',
        unlockCondition: 'En az 1 ili ziyaret edilmiş olarak işaretle',
        category: 'regional',
        motif: 'footstep',
        accent: '#10b981',
        xp: 100,
        current: m.visitedCount,
        target: 1
      },
      {
        id: 'kervan_10',
        title: 'Kervan Yolcusu',
        desc: 'Anadolu menzillerinde ilk onluğunu tamamlayıp kervana katıl.',
        unlockCondition: '10 farklı ili ziyaret et (10-24 il rütbesi)',
        category: 'regional',
        motif: 'compass',
        accent: '#38bdf8',
        xp: 250,
        current: m.visitedCount,
        target: 10
      },
      {
        id: 'evliya_25',
        title: 'Evliya Çelebi İzinde',
        desc: 'Çeyrek asırlık seyahat tecrübesiyle 25 ili kayda geçir.',
        unlockCondition: '25 farklı ili ziyaret et (25-39 il rütbesi)',
        category: 'regional',
        motif: 'scroll',
        accent: '#f59e0b',
        xp: 450,
        current: m.visitedCount,
        target: 25
      },
      {
        id: 'anadolu_kasifi_40',
        title: 'Anadolu Kaşifi Eşiği',
        desc: 'Anadolu’nun tam ortasını aşarak 40 il sınırını fethet.',
        unlockCondition: '40 farklı ili ziyaret ederek Anadolu Kaşifi ol',
        category: 'regional',
        motif: 'arch',
        accent: '#00f2fe',
        xp: 700,
        current: m.visitedCount,
        target: 40
      },
      {
        id: 'ulu_seyyah_60',
        title: 'Ulu Seyyah Mertebesi',
        desc: '60 ilin kapısını aralayarak dört iklime adını yazdır.',
        unlockCondition: '60 farklı ili ziyaret et (60-79 il rütbesi)',
        category: 'regional',
        motif: 'falcon',
        accent: '#a855f7',
        xp: 1000,
        current: m.visitedCount,
        target: 60
      },
      {
        id: 'cihan_seyyahi_81',
        title: 'Cihan Seyyahı (81/81)',
        desc: 'Türkiye’nin 81 ilinin tamamına ayak basarak büyük destanı tamamla.',
        unlockCondition: '81 ilin 81’ini de ziyaret et',
        category: 'regional',
        motif: 'crown',
        accent: '#fbbf24',
        xp: 2000,
        current: m.visitedCount,
        target: 81
      },
      {
        id: 'yedi_iklim',
        title: 'Yedi İklim Fatihi',
        desc: 'Marmara’dan Güneydoğu’ya 7 coğrafi bölgenin her birine ayak bas.',
        unlockCondition: '7 coğrafi bölgenin tamamında en az 1 il ziyaret et',
        category: 'regional',
        motif: 'globe',
        accent: '#34d399',
        xp: 600,
        current: m.visitedRegionsCount,
        target: 7
      },
      {
        id: 'karadeniz_dogu',
        title: 'Yaylalar & Zirveler Öncüsü',
        desc: 'Karadeniz ve Doğu Anadolu’nun çetin coğrafyalarında 20 il keşfet.',
        unlockCondition: 'Karadeniz + Doğu Anadolu illerinden toplam 20 il gez',
        category: 'regional',
        motif: 'mountain',
        accent: '#10b981',
        xp: 450,
        current: karadenizVisited + doguVisited,
        target: 20
      },
      {
        id: 'bati_akdeniz_hatti',
        title: 'Marmara, Ege & Akdeniz Kuşağı',
        desc: 'Batı ve güney bölgelerinde en az 15 şehrin kapısından geç.',
        unlockCondition: 'Marmara + Ege + Akdeniz bölgelerinde toplam 15 il gez',
        category: 'regional',
        motif: 'sunrise',
        accent: '#38bdf8',
        xp: 400,
        current: marmaraVisited + egeVisited + akdenizVisited,
        target: 15
      },
      {
        id: 'guneydogu_uyanisi',
        title: 'Mezopotamya Şafağı',
        desc: 'Güneydoğu Anadolu’nun kadim taş şehirlerine sefer başlat.',
        unlockCondition: 'Güneydoğu Anadolu bölgesinde en az 3 il ziyaret et',
        category: 'regional',
        motif: 'oasis',
        accent: '#f97316',
        xp: 500,
        current: guneydoguVisited,
        target: 3
      },
      {
        id: 'kiyi_seyyahi',
        title: 'Dört Deniz Kıyı Seyyahı',
        desc: 'Karadeniz, Marmara, Ege ve Akdeniz sahillerinde 15 kıyı ilini gez.',
        unlockCondition: 'Türkiye’nin 28 kıyı ilinden en az 15’ini ziyaret et',
        category: 'regional',
        motif: 'waves',
        accent: '#00f2fe',
        xp: 450,
        current: m.coastalVisited,
        target: 15
      },
      {
        id: 'ankara_edirne_rotasi',
        title: 'Ankara → Edirne Sefer Hattı',
        desc: 'Başkent Ankara’dan payitaht Edirne’ye uzanan 10 duraklı seferi bitir.',
        unlockCondition: 'Aktif Sefer Rotasındaki 10 ilin tamamını ziyaret et',
        category: 'regional',
        motif: 'route',
        accent: '#f59e0b',
        xp: 650,
        current: m.routeVisitedCount,
        target: m.routeTotalCount
      },

      // === 📚 KÜLTÜR & ODAK (11 Achievements) ===
      {
        id: 'unesco_koruyucusu',
        title: 'UNESCO Miras Muhafızı',
        desc: 'İnsanlığın ortak hafızası olan UNESCO miras şehirlerini ziyaret et.',
        unlockCondition: '21 UNESCO Dünya Mirası alanından en az 10’unun ilini gez',
        category: 'culture',
        motif: 'unesco',
        accent: '#f59e0b',
        xp: 500,
        current: m.unescoVisitedSites,
        target: 10
      },
      {
        id: 'unesco_ustadi',
        title: 'Evrensel Miras Üstadı',
        desc: 'Anadolu’daki UNESCO Dünya Mirası haritasının neredeyse tamamını gör.',
        unlockCondition: '21 UNESCO Dünya Mirası alanından en az 18’inin ilini gez',
        category: 'culture',
        motif: 'monument',
        accent: '#fbbf24',
        xp: 1100,
        current: m.unescoVisitedSites,
        target: 18
      },
      {
        id: 'kadim_baskentler',
        title: 'Payitahtlar & İrfan Ocakları',
        desc: 'Selçuklu, Osmanlı ve Anadolu irfanına başkentlik etmiş şehirleri adımla.',
        unlockCondition: '8 kadim merkezden (İstanbul, Bursa, Edirne, Konya, Sivas, Ankara, Erzurum, Mardin) 6’sını gez',
        category: 'culture',
        motif: 'lantern',
        accent: '#a855f7',
        xp: 550,
        current: m.historicalVisited,
        target: 6
      },
      {
        id: 'ic_anadolu_irfan',
        title: 'Bozkırın İrfan Havzası',
        desc: 'Mevlana’dan Hacı Bektaş’a İç Anadolu’da 10 ili keşfet.',
        unlockCondition: 'İç Anadolu bölgesinde en az 10 il ziyaret et',
        category: 'culture',
        motif: 'wheat',
        accent: '#fbbf24',
        xp: 450,
        current: icAnadoluVisited,
        target: 10
      },
      {
        id: 'on_bin_km',
        title: '10.000 km Menzil İzi',
        desc: 'Anadolu yollarında beş haneli kilometre barajını aş.',
        unlockCondition: 'Tahmini toplam 10.000 km karayolu menziline ulaş',
        category: 'culture',
        motif: 'road',
        accent: '#38bdf8',
        xp: 500,
        current: m.estimatedKm,
        target: 10000
      },
      {
        id: 'favori_koleksiyoncu',
        title: 'Gönül Coğrafyası',
        desc: 'Kalbine dokunan şehirleri favori listende topla.',
        unlockCondition: 'En az 5 ili favorilerine ekle (localStorage)',
        category: 'culture',
        motif: 'heart',
        accent: '#f43f5e',
        xp: 250,
        current: m.favoritesCount,
        target: 5
      },
      {
        id: 'seyir_defteri_yazari',
        title: 'Seyir Defteri Kâtibi',
        desc: 'Yol hatıralarını kişisel Seyir Defteri’ne mürekkeple işleyip ölümsüzleştir.',
        unlockCondition: 'Seyir Defterinde en az 5 şehir notu veya ziyareti kaydet',
        category: 'culture',
        motif: 'feather',
        accent: '#10b981',
        xp: 350,
        current: m.journalEntriesCount,
        target: 5
      },
      {
        id: 'pomodoro_odak',
        title: 'Kütüphane İlim Mesaisi',
        desc: 'İl Halk Kütüphaneleri odak sayacıyla derin çalışma disiplini kur.',
        unlockCondition: 'Kütüphane Pomodoro sayacında toplam 60 dakika tamamla',
        category: 'culture',
        motif: 'hourglass',
        accent: '#00f2fe',
        xp: 400,
        current: m.pomodoroMinutes,
        target: 60
      },
      {
        id: 'pomodoro_ustasi',
        title: 'Mürekkep & Sabır Üstadı',
        desc: 'Uzun soluklu kütüphane nöbetleriyle 4 saatlik odak barajını geç.',
        unlockCondition: 'Kütüphane Pomodoro sayacında toplam 240 dakika biriktir',
        category: 'culture',
        motif: 'flame',
        accent: '#a855f7',
        xp: 800,
        current: m.pomodoroMinutes,
        target: 240
      },
      {
        id: 'bucket_list_kasifi',
        title: 'Menzil Hedef Listesi',
        desc: 'Seyyah Hedef Listesi’ndeki hayal duraklarını gerçeğe dönüştür.',
        unlockCondition: 'Seyyah Hedef Listesi’nden (Bucket List) en az 5 madde tamamla',
        category: 'culture',
        motif: 'target',
        accent: '#34d399',
        xp: 400,
        current: m.bucketCompletedCount,
        target: 5
      },
      {
        id: 'bilge_okur',
        title: 'Seyahatname Kıraat Ehli',
        desc: 'Okuma Rehberi’nden makaleler bitirip sırt çantası hazırlığını tamamla.',
        unlockCondition: 'Okuma Rehberi’nden en az 3 bölüm veya Sırt Çantası’ndan 5 eşya tamamla',
        category: 'culture',
        motif: 'book',
        accent: '#f59e0b',
        xp: 300,
        current: m.readerCompletedCount > 0 ? m.readerCompletedCount : Math.min(3, Math.floor(m.packingCheckedCount / 2)),
        target: 3
      }
    ];

    return defs.map((b) => {
      const safeCurrent = Math.max(0, Number(b.current) || 0);
      const safeTarget = Math.max(1, Number(b.target) || 1);
      const unlocked = safeCurrent >= safeTarget;
      const pct = Math.min(100, Math.round((safeCurrent / safeTarget) * 100));
      return Object.assign({}, b, {
        current: safeCurrent,
        target: safeTarget,
        displayCurrent: Math.min(safeCurrent, safeTarget),
        unlocked,
        pct
      });
    });
  }

  function resolveRankInfo(visitedCount) {
    let rankIndex = 0;
    for (let i = 0; i < RANK_LADDER.length; i += 1) {
      if (visitedCount >= RANK_LADDER[i].min) {
        rankIndex = i;
      }
    }
    const current = RANK_LADDER[rankIndex];
    const next = rankIndex < RANK_LADDER.length - 1 ? RANK_LADDER[rankIndex + 1] : null;
    const citiesToNext = next ? Math.max(0, next.min - visitedCount) : 0;
    const rankProgressPct = next
      ? Math.min(100, Math.max(0, Math.round(((visitedCount - current.min) / (next.min - current.min)) * 100)))
      : 100;

    return {
      rankIndex,
      current,
      next,
      citiesToNext,
      rankProgressPct
    };
  }

  function evaluate(ctx) {
    const metrics = collectMetrics(ctx);
    const badges = buildAchievementsList(metrics);
    const rankInfo = resolveRankInfo(metrics.visitedCount);

    const unlockedBadges = badges.filter((b) => b.unlocked);
    const lockedBadges = badges.filter((b) => !b.unlocked);

    // XP Calculation: visited cities + unlocked badge XP + activity XP
    const cityXp = metrics.visitedCount * 100;
    const badgeXp = unlockedBadges.reduce((sum, b) => sum + b.xp, 0);
    const activityXp =
      (metrics.favoritesCount * 15) +
      (metrics.journalEntriesCount * 30) +
      (metrics.pomodoroMinutes * 2) +
      (metrics.bucketCompletedCount * 40);
    const totalXp = cityXp + badgeXp + activityXp;

    const maxPossibleBadgeXp = badges.reduce((sum, b) => sum + b.xp, 0);
    const maxTheoreticalXp = (metrics.totalProvinces * 100) + maxPossibleBadgeXp;
    const xpLevel = Math.max(1, Math.floor(totalXp / 500) + 1);
    const xpInLevel = totalXp % 500;
    const xpLevelPct = Math.round((xpInLevel / 500) * 100);

    return {
      metrics,
      badges,
      unlockedCount: unlockedBadges.length,
      lockedCount: lockedBadges.length,
      totalBadges: badges.length,
      rankInfo,
      xp: {
        totalXp,
        cityXp,
        badgeXp,
        activityXp,
        maxTheoreticalXp,
        level: xpLevel,
        xpInLevel,
        xpForNextLevel: 500,
        xpLevelPct
      }
    };
  }

  // Crisp SVG Emblem for the 6-Tier Rank Banner
  function buildRankEmblemSvg(rank) {
    const accent = (rank && rank.accent) || '#f59e0b';
    const emblem = (rank && rank.emblem) || 'scroll';
    let inner = '';

    if (emblem === 'seedling') {
      inner = `
        <path d="M48 64V40" stroke="${accent}" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M48 48C48 37 36 33 32 34C32 45 40 50 48 48Z" fill="${accent}" fill-opacity="0.35" stroke="${accent}" stroke-width="2.2"/>
        <path d="M48 42C48 31 60 27 64 28C64 39 56 44 48 42Z" fill="${accent}" fill-opacity="0.65" stroke="${accent}" stroke-width="2.2"/>
      `;
    } else if (emblem === 'compass') {
      inner = `
        <circle cx="48" cy="48" r="19" fill="none" stroke="${accent}" stroke-width="2.2" stroke-dasharray="3 3"/>
        <polygon points="48,25 54,48 48,71 42,48" fill="none" stroke="${accent}" stroke-width="2.2"/>
        <polygon points="48,27 52,48 44,48" fill="${accent}"/>
        <circle cx="48" cy="48" r="3.5" fill="#fff"/>
      `;
    } else if (emblem === 'scroll') {
      inner = `
        <rect x="33" y="30" width="30" height="36" rx="4" fill="${accent}" fill-opacity="0.16" stroke="${accent}" stroke-width="2.4"/>
        <path d="M30 34H36M30 62H36M60 34H66M60 62H66" stroke="${accent}" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M40 41H56M40 48H56M40 55H50" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/>
      `;
    } else if (emblem === 'arch') {
      inner = `
        <path d="M32 64V44C32 34 40 28 48 28C56 28 64 34 64 44V64" fill="${accent}" fill-opacity="0.16" stroke="${accent}" stroke-width="2.4"/>
        <path d="M39 64V47C39 41 43 37 48 37C53 37 57 41 57 47V64" fill="none" stroke="${accent}" stroke-width="2"/>
        <line x1="28" y1="64" x2="68" y2="64" stroke="${accent}" stroke-width="2.6" stroke-linecap="round"/>
      `;
    } else if (emblem === 'falcon') {
      inner = `
        <path d="M26 42L48 32L70 42L58 50L48 66L38 50Z" fill="${accent}" fill-opacity="0.22" stroke="${accent}" stroke-width="2.3" stroke-linejoin="round"/>
        <path d="M48 32V66M36 44L48 52L60 44" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
      `;
    } else {
      inner = `
        <path d="M29 58L33 35L42 45L48 30L54 45L63 35L67 58Z" fill="${accent}" fill-opacity="0.28" stroke="${accent}" stroke-width="2.4" stroke-linejoin="round"/>
        <rect x="30" y="61" width="36" height="5" rx="2.5" fill="${accent}"/>
        <circle cx="48" cy="27" r="2.6" fill="${accent}"/>
      `;
    }

    return `
      <svg class="ach-rank-svg" viewBox="0 0 96 96" aria-hidden="true">
        <defs>
          <linearGradient id="achRankGrad-${safeEscape(rank.id)}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${accent}" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.45"/>
          </linearGradient>
        </defs>
        <!-- Seljuk 8-pointed double square star -->
        <rect x="18" y="18" width="60" height="60" rx="10" fill="none" stroke="url(#achRankGrad-${safeEscape(rank.id)})" stroke-width="1.8" opacity="0.55"/>
        <rect x="18" y="18" width="60" height="60" rx="10" transform="rotate(45 48 48)" fill="${accent}" fill-opacity="0.08" stroke="url(#achRankGrad-${safeEscape(rank.id)})" stroke-width="2"/>
        <circle cx="48" cy="48" r="27" fill="none" stroke="${accent}" stroke-opacity="0.25" stroke-width="1.2"/>
        ${inner}
      </svg>
    `;
  }

  // Crisp SVG Badge Icon per Achievement with live circular progress arc
  function buildAchievementBadgeSvg(badge) {
    const accent = badge.unlocked ? badge.accent : '#64748b';
    const r = 27;
    const circ = 2 * Math.PI * r;
    const dashOffset = circ - (circ * badge.pct) / 100;

    const motifs = {
      footstep: `<ellipse cx="28" cy="36" rx="5" ry="9" transform="rotate(-12 28 36)" fill="${accent}" fill-opacity="0.3" stroke="${accent}" stroke-width="2"/><ellipse cx="38" cy="28" rx="5" ry="9" transform="rotate(10 38 28)" fill="${accent}" fill-opacity="0.55" stroke="${accent}" stroke-width="2"/>`,
      compass: `<circle cx="32" cy="32" r="13" fill="none" stroke="${accent}" stroke-width="2"/><polygon points="32,20 36,32 32,44 28,32" fill="${accent}" fill-opacity="0.75"/>`,
      scroll: `<rect x="22" y="21" width="20" height="22" rx="3" fill="${accent}" fill-opacity="0.2" stroke="${accent}" stroke-width="2"/><path d="M26 28H38M26 33H38M26 38H34" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>`,
      arch: `<path d="M22 43V31C22 25 26.5 21 32 21C37.5 21 42 25 42 31V43" fill="${accent}" fill-opacity="0.2" stroke="${accent}" stroke-width="2.2"/><line x1="19" y1="43" x2="45" y2="43" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/>`,
      falcon: `<path d="M19 30L32 22L45 30L37 36L32 45L27 36Z" fill="${accent}" fill-opacity="0.25" stroke="${accent}" stroke-width="2" stroke-linejoin="round"/>`,
      crown: `<path d="M20 40L23 24L29 31L32 21L35 31L41 24L44 40Z" fill="${accent}" fill-opacity="0.3" stroke="${accent}" stroke-width="2" stroke-linejoin="round"/><line x1="20" y1="43" x2="44" y2="43" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>`,
      globe: `<circle cx="32" cy="32" r="13" fill="${accent}" fill-opacity="0.14" stroke="${accent}" stroke-width="2"/><ellipse cx="32" cy="32" rx="6.5" ry="13" fill="none" stroke="${accent}" stroke-width="1.6"/><line x1="19" y1="32" x2="45" y2="32" stroke="${accent}" stroke-width="1.6"/>`,
      mountain: `<polygon points="18,42 29,23 36,34 40,28 47,42" fill="${accent}" fill-opacity="0.25" stroke="${accent}" stroke-width="2" stroke-linejoin="round"/>`,
      sunrise: `<path d="M20 39H44" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/><path d="M24 39A8 8 0 0 1 40 39" fill="${accent}" fill-opacity="0.35" stroke="${accent}" stroke-width="2"/><path d="M32 22V26M23 26L26 29M41 26L38 29" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>`,
      oasis: `<path d="M18 41Q26 32 34 39T46 39" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/><circle cx="38" cy="25" r="4.5" fill="${accent}" fill-opacity="0.45" stroke="${accent}" stroke-width="1.8"/>`,
      waves: `<path d="M19 29Q25 24 32 29T45 29" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/><path d="M19 37Q25 32 32 37T45 37" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/>`,
      route: `<circle cx="22" cy="40" r="3.5" fill="${accent}"/><circle cx="42" cy="24" r="3.5" fill="none" stroke="${accent}" stroke-width="2.2"/><path d="M25 39C31 39 30 25 38 25" fill="none" stroke="${accent}" stroke-width="2.2" stroke-dasharray="3 2.5"/>`,
      unesco: `<polygon points="32,19 44,26 20,26" fill="${accent}" fill-opacity="0.3" stroke="${accent}" stroke-width="2"/><path d="M23 26V40M29 26V40M35 26V40M41 26V40M19 42H45" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>`,
      monument: `<polygon points="32,19 37,27 37,42 27,42 27,27" fill="${accent}" fill-opacity="0.25" stroke="${accent}" stroke-width="2" stroke-linejoin="round"/><line x1="22" y1="43" x2="42" y2="43" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/>`,
      lantern: `<path d="M32 19V23M26 25H38L40 36L32 43L24 36Z" fill="${accent}" fill-opacity="0.28" stroke="${accent}" stroke-width="2" stroke-linejoin="round"/>`,
      wheat: `<path d="M32 43V21M32 36L25 31M32 36L39 31M32 29L26 24M32 29L38 24" stroke="${accent}" stroke-width="2.1" stroke-linecap="round"/>`,
      road: `<path d="M25 43L29 21H35L39 43Z" fill="${accent}" fill-opacity="0.18" stroke="${accent}" stroke-width="2"/><line x1="32" y1="25" x2="32" y2="40" stroke="${accent}" stroke-width="2" stroke-dasharray="3 3"/>`,
      heart: `<path d="M32 42C24 36 20 31 20 26.5A6 6 0 0 1 32 24.5A6 6 0 0 1 44 26.5C44 31 40 36 32 42Z" fill="${accent}" fill-opacity="0.35" stroke="${accent}" stroke-width="2"/>`,
      feather: `<path d="M42 21C32 22 25 29 23 41L29 36C35 35 41 29 42 21Z" fill="${accent}" fill-opacity="0.28" stroke="${accent}" stroke-width="2" stroke-linejoin="round"/><line x1="21" y1="43" x2="35" y2="29" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>`,
      hourglass: `<path d="M24 21H40L32 32L40 43H24L32 32Z" fill="${accent}" fill-opacity="0.24" stroke="${accent}" stroke-width="2" stroke-linejoin="round"/>`,
      flame: `<path d="M32 20C36 25 40 29 40 34A8 8 0 1 1 24 34C24 29 29 25 32 20Z" fill="${accent}" fill-opacity="0.3" stroke="${accent}" stroke-width="2"/>`,
      target: `<circle cx="32" cy="32" r="12" fill="none" stroke="${accent}" stroke-width="2"/><circle cx="32" cy="32" r="6.5" fill="none" stroke="${accent}" stroke-width="1.8"/><circle cx="32" cy="32" r="2.5" fill="${accent}"/>`,
      book: `<path d="M21 23H30C31.5 23 32 24 32 25.5V42C32 41 30.5 40 29 40H21Z" fill="${accent}" fill-opacity="0.22" stroke="${accent}" stroke-width="2"/><path d="M43 23H34C32.5 23 32 24 32 25.5V42C32 41 33.5 40 35 40H43Z" fill="${accent}" fill-opacity="0.22" stroke="${accent}" stroke-width="2"/>`
    };

    const innerSvg = motifs[badge.motif] || motifs.compass;
    const checkSeal = badge.unlocked
      ? `<circle cx="52" cy="14" r="7.5" fill="#10b981" stroke="#0f172a" stroke-width="2"/><path d="M48.8 14.2L51 16.4L55.5 11.8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
      : '';

    return `
      <svg class="ach-badge-svg" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="${r}" fill="${accent}" fill-opacity="${badge.unlocked ? '0.1' : '0.05'}" stroke="currentColor" stroke-opacity="0.14" stroke-width="3.2"/>
        <circle
          cx="32" cy="32" r="${r}"
          fill="none"
          stroke="${accent}"
          stroke-width="3.2"
          stroke-linecap="round"
          stroke-dasharray="${circ.toFixed(2)}"
          stroke-dashoffset="${dashOffset.toFixed(2)}"
          transform="rotate(-90 32 32)"
        />
        ${innerSvg}
        ${checkSeal}
      </svg>
    `;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .ach-root {
        max-width: 1280px;
        margin: 0 auto;
        padding: 4px 0 42px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        animation: achFadeIn 0.32s ease;
      }

      @keyframes achFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* === HERO RANK & XP BANNER === */
      .ach-hero {
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-lg, 20px);
        padding: 24px 26px;
        background:
          radial-gradient(circle at 10% 15%, rgba(245, 158, 11, 0.16) 0%, transparent 45%),
          radial-gradient(circle at 90% 85%, rgba(0, 242, 254, 0.14) 0%, transparent 48%),
          var(--bg-card, rgba(15, 23, 42, 0.85));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        box-shadow: var(--shadow-subtle, 0 14px 36px -12px rgba(0, 0, 0, 0.5));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 22px;
        align-items: center;
      }

      .ach-rank-emblem-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      .ach-rank-svg {
        width: 92px;
        height: 92px;
        filter: drop-shadow(0 6px 18px rgba(245, 158, 11, 0.25));
      }

      .ach-level-chip {
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 3px 10px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.16);
        border: 1px solid rgba(245, 158, 11, 0.42);
        color: var(--accent-gold, #f59e0b);
      }

      .ach-hero-main {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }

      .ach-kicker {
        font-size: 0.74rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--accent-cyan, #00f2fe);
      }

      .ach-hero-title {
        font-family: var(--font-heading, sans-serif);
        font-size: clamp(1.35rem, 2.4vw, 1.85rem);
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.2;
      }

      .ach-hero-desc {
        font-size: 0.9rem;
        color: var(--text-secondary, #94a3b8);
        max-width: 680px;
      }

      .ach-xp-block {
        margin-top: 6px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .ach-xp-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
      }

      .ach-xp-meta strong {
        color: var(--text-primary, #f8fafc);
      }

      .ach-xp-track {
        width: 100%;
        height: 10px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.16);
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .ach-xp-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent-gold, #f59e0b), var(--accent-cyan, #00f2fe), var(--accent-emerald, #10b981));
        transition: width 0.55s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .ach-hero-side {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
      }

      .ach-score-pill {
        padding: 10px 16px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        text-align: right;
      }

      .ach-score-num {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--accent-emerald, #10b981);
        line-height: 1.1;
      }

      .ach-score-sub {
        font-size: 0.75rem;
        color: var(--text-muted, #64748b);
      }

      .ach-refresh-btn {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.15));
        background: rgba(0, 242, 254, 0.1);
        color: var(--accent-cyan, #00f2fe);
        padding: 8px 14px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 700;
        transition: all 0.2s ease;
      }

      .ach-refresh-btn:hover {
        background: rgba(0, 242, 254, 0.2);
        transform: translateY(-1px);
      }

      /* === 6-TIER RANK PROGRESSION LADDER === */
      .ach-section-card {
        border-radius: var(--radius-md, 14px);
        padding: 18px 20px;
        background: var(--bg-card, rgba(15, 23, 42, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      .ach-section-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 14px;
      }

      .ach-section-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.02rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .ach-section-sub {
        font-size: 0.8rem;
        color: var(--text-muted, #64748b);
      }

      .ach-ladder-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 10px;
      }

      .ach-tier {
        position: relative;
        padding: 12px 10px;
        border-radius: 12px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        background: rgba(15, 23, 42, 0.35);
        display: flex;
        flex-direction: column;
        gap: 5px;
        transition: transform 0.2s ease, border-color 0.2s ease;
      }

      .ach-tier.passed {
        border-color: rgba(16, 185, 129, 0.35);
        background: rgba(16, 185, 129, 0.08);
      }

      .ach-tier.current {
        border-color: rgba(245, 158, 11, 0.65);
        background: linear-gradient(155deg, rgba(245, 158, 11, 0.16), rgba(0, 242, 254, 0.08));
        box-shadow: 0 8px 24px -8px rgba(245, 158, 11, 0.35);
        transform: translateY(-2px);
      }

      .ach-tier.upcoming {
        opacity: 0.7;
      }

      .ach-tier-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
      }

      .ach-tier-icon {
        font-size: 1.25rem;
      }

      .ach-tier-range {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.15);
        color: var(--text-secondary, #94a3b8);
      }

      .ach-tier.current .ach-tier-range {
        background: rgba(245, 158, 11, 0.24);
        color: var(--accent-gold, #f59e0b);
      }

      .ach-tier-title {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        line-height: 1.25;
      }

      .ach-tier-state {
        font-size: 0.7rem;
        color: var(--text-muted, #64748b);
      }

      .ach-tier.current .ach-tier-state {
        color: var(--accent-gold, #f59e0b);
        font-weight: 700;
      }

      .ach-tier.passed .ach-tier-state {
        color: var(--accent-emerald, #10b981);
        font-weight: 600;
      }

      /* === LIVE TELEMETRY GRID === */
      .ach-telemetry-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .ach-tele-card {
        border-radius: 14px;
        padding: 16px;
        background: var(--bg-card, rgba(15, 23, 42, 0.7));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .ach-tele-title {
        font-size: 0.86rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .ach-region-bars {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .ach-region-row {
        display: grid;
        grid-template-columns: 96px 1fr 44px;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
        color: var(--text-secondary, #94a3b8);
      }

      .ach-mini-track {
        height: 6px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.15);
        overflow: hidden;
      }

      .ach-mini-fill {
        height: 100%;
        border-radius: 999px;
      }

      .ach-route-stops {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .ach-stop-chip {
        font-size: 0.72rem;
        padding: 4px 8px;
        border-radius: 8px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(148, 163, 184, 0.08);
        color: var(--text-muted, #64748b);
      }

      .ach-stop-chip.visited {
        border-color: rgba(16, 185, 129, 0.45);
        background: rgba(16, 185, 129, 0.14);
        color: var(--accent-emerald, #10b981);
        font-weight: 700;
      }

      .ach-ls-metrics {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .ach-ls-box {
        padding: 9px 10px;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.35);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .ach-ls-val {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.08rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .ach-ls-lbl {
        font-size: 0.71rem;
        color: var(--text-muted, #64748b);
      }

      .ach-bucket-toggle-btn {
        margin-top: auto;
        cursor: pointer;
        border: 1px dashed rgba(16, 185, 129, 0.45);
        background: rgba(16, 185, 129, 0.1);
        color: var(--accent-emerald, #10b981);
        padding: 8px 10px;
        border-radius: 10px;
        font-size: 0.78rem;
        font-weight: 700;
        transition: all 0.2s ease;
      }

      .ach-bucket-toggle-btn:hover {
        background: rgba(16, 185, 129, 0.18);
      }

      /* === BUCKET LIST DRAWER === */
      .ach-bucket-drawer {
        border-radius: 14px;
        padding: 16px 18px;
        background: var(--bg-card, rgba(15, 23, 42, 0.78));
        border: 1px solid rgba(16, 185, 129, 0.3);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .ach-bucket-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .ach-bucket-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.09));
        background: rgba(15, 23, 42, 0.35);
        color: var(--text-primary, #f8fafc);
        font-size: 0.82rem;
        cursor: pointer;
        text-align: left;
        transition: all 0.18s ease;
      }

      .ach-bucket-item:hover {
        border-color: rgba(16, 185, 129, 0.45);
      }

      .ach-bucket-item.done {
        background: rgba(16, 185, 129, 0.13);
        border-color: rgba(16, 185, 129, 0.5);
      }

      /* === FILTER PILLS BAR === */
      .ach-filters-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
      }

      .ach-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .ach-pill {
        cursor: pointer;
        padding: 8px 15px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: var(--bg-card, rgba(15, 23, 42, 0.68));
        color: var(--text-secondary, #94a3b8);
        font-size: 0.82rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .ach-pill:hover {
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
      }

      .ach-pill.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(16, 185, 129, 0.18));
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
        box-shadow: 0 4px 16px -4px rgba(0, 242, 254, 0.3);
      }

      .ach-pill-count {
        font-size: 0.72rem;
        padding: 1px 6px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.18);
      }

      /* === ACHIEVEMENT CARDS GRID === */
      .ach-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .ach-card {
        position: relative;
        border-radius: 16px;
        padding: 16px;
        background: var(--bg-card, rgba(15, 23, 42, 0.76));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 12px;
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .ach-card:hover {
        transform: translateY(-2px);
        border-color: var(--border-glow, rgba(0, 242, 254, 0.4));
        box-shadow: var(--shadow-glow, 0 12px 28px -10px rgba(0, 242, 254, 0.2));
      }

      .ach-card.unlocked {
        border-color: rgba(16, 185, 129, 0.35);
        background: linear-gradient(160deg, rgba(16, 185, 129, 0.08), var(--bg-card, rgba(15, 23, 42, 0.8)));
      }

      .ach-card.locked {
        opacity: 0.9;
      }

      .ach-card-top {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .ach-badge-svg {
        width: 56px;
        height: 56px;
        flex-shrink: 0;
        color: var(--text-muted, #64748b);
      }

      .ach-card-meta {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .ach-card-tags {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        flex-wrap: wrap;
      }

      .ach-xp-tag {
        font-size: 0.7rem;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.35);
        color: var(--accent-gold, #f59e0b);
      }

      .ach-status-tag {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
      }

      .ach-status-tag.open {
        background: rgba(16, 185, 129, 0.16);
        color: var(--accent-emerald, #10b981);
        border: 1px solid rgba(16, 185, 129, 0.38);
      }

      .ach-status-tag.closed {
        background: rgba(148, 163, 184, 0.14);
        color: var(--text-muted, #94a3b8);
        border: 1px solid rgba(148, 163, 184, 0.25);
      }

      .ach-card-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.98rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        line-height: 1.25;
      }

      .ach-card-desc {
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.45;
      }

      .ach-prog-wrap {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .ach-prog-nums {
        display: flex;
        justify-content: space-between;
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
      }

      .ach-prog-track {
        height: 7px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.16);
        overflow: hidden;
      }

      .ach-prog-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.4s ease;
      }

      .ach-condition {
        margin-top: auto;
        padding: 8px 10px;
        border-radius: 9px;
        background: rgba(15, 23, 42, 0.36);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.07));
        font-size: 0.74rem;
        color: var(--text-muted, #94a3b8);
        line-height: 1.35;
      }

      .ach-condition strong {
        color: var(--text-secondary, #cbd5e1);
      }

      /* === LIGHT THEME OVERRIDES === */
      body.light-theme .ach-hero {
        background:
          radial-gradient(circle at 10% 15%, rgba(217, 119, 6, 0.1) 0%, transparent 45%),
          radial-gradient(circle at 90% 85%, rgba(2, 132, 199, 0.1) 0%, transparent 48%),
          rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .ach-score-pill,
      body.light-theme .ach-tier,
      body.light-theme .ach-ls-box,
      body.light-theme .ach-bucket-item,
      body.light-theme .ach-condition {
        background: rgba(241, 245, 249, 0.9);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .ach-section-card,
      body.light-theme .ach-tele-card,
      body.light-theme .ach-card,
      body.light-theme .ach-pill,
      body.light-theme .ach-bucket-drawer {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .ach-card.unlocked {
        background: linear-gradient(160deg, rgba(5, 150, 105, 0.08), rgba(255, 255, 255, 0.95));
        border-color: rgba(5, 150, 105, 0.35);
      }

      body.light-theme .ach-tier.current {
        background: linear-gradient(155deg, rgba(217, 119, 6, 0.12), rgba(2, 132, 199, 0.08));
        border-color: rgba(217, 119, 6, 0.5);
      }

      body.light-theme .ach-pill.active {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.14), rgba(5, 150, 105, 0.14));
        border-color: #0284c7;
        color: #0f172a;
      }

      body.light-theme .ach-condition strong {
        color: #334155;
      }

      body.light-theme .ach-refresh-btn {
        background: rgba(2, 132, 199, 0.1);
        color: #0284c7;
        border-color: rgba(2, 132, 199, 0.3);
      }

      /* === RESPONSIVE === */
      @media (max-width: 1100px) {
        .ach-ladder-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .ach-telemetry-grid {
          grid-template-columns: 1fr;
        }
        .ach-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 720px) {
        .ach-hero {
          grid-template-columns: 1fr;
          text-align: center;
        }
        .ach-hero-side {
          align-items: center;
        }
        .ach-score-pill {
          text-align: center;
        }
        .ach-ladder-grid,
        .ach-grid,
        .ach-bucket-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderView(container, ctx) {
    if (!container) return;
    uiState.lastContainer = container;
    uiState.lastCtx = ctx || uiState.lastCtx;

    injectStyles();
    const evalResult = evaluate(uiState.lastCtx);
    const { metrics, badges, unlockedCount, lockedCount, totalBadges, rankInfo, xp } = evalResult;
    const rank = rankInfo.current;
    const nextRank = rankInfo.next;

    const regionalCount = badges.filter((b) => b.category === 'regional').length;
    const cultureCount = badges.filter((b) => b.category === 'culture').length;

    const filteredBadges = badges.filter((b) => {
      if (uiState.filter === 'unlocked') return b.unlocked;
      if (uiState.filter === 'locked') return !b.unlocked;
      if (uiState.filter === 'regional') return b.category === 'regional';
      if (uiState.filter === 'culture') return b.category === 'culture';
      return true;
    });

    const nextRankSummary = nextRank
      ? `Sonraki Rütbe: ${nextRank.icon} <strong>${safeEscape(nextRank.title, ctx)}</strong> (${metrics.visitedCount}/${nextRank.min} il • ${rankInfo.citiesToNext} il kaldı)`
      : `👑 <strong>Zirve Mertebe Tamamlandı!</strong> (81/81 İl)`;

    const ladderHtml = RANK_LADDER.map((tier, idx) => {
      const stateClass = idx < rankInfo.rankIndex
        ? 'passed'
        : idx === rankInfo.rankIndex
          ? 'current'
          : 'upcoming';
      const stateLabel = idx < rankInfo.rankIndex
        ? '✓ Tamamlandı'
        : idx === rankInfo.rankIndex
          ? '★ Aktif Rütbe'
          : `🔒 ${tier.min} il gerekir`;

      return `
        <div class="ach-tier ${stateClass}">
          <div class="ach-tier-top">
            <span class="ach-tier-icon">${tier.icon}</span>
            <span class="ach-tier-range">${safeEscape(tier.rangeLabel, ctx)}</span>
          </div>
          <div class="ach-tier-title">${safeEscape(tier.title, ctx)}</div>
          <div class="ach-tier-state">${stateLabel}</div>
        </div>
      `;
    }).join('');

    const regionsHtml = metrics.regionsBreakdown.map((r) => `
      <div class="ach-region-row">
        <span>${r.icon} ${safeEscape(r.name, ctx)}</span>
        <div class="ach-mini-track">
          <div class="ach-mini-fill" style="width:${r.percentage}%;background:${r.color};"></div>
        </div>
        <span style="text-align:right;font-weight:700;">${r.visited}/${r.total}</span>
      </div>
    `).join('');

    const routeStopsHtml = metrics.routeStops.map((s) => `
      <span class="ach-stop-chip ${s.visited ? 'visited' : ''}">
        ${s.visited ? '✓' : '○'} ${safeEscape(s.name, ctx)}
      </span>
    `).join('');

    const bucketDrawerHtml = uiState.showBucketDrawer ? `
      <section class="ach-bucket-drawer" aria-label="Seyyah Hedef Listesi">
        <div class="ach-section-head" style="margin-bottom:0;">
          <div class="ach-section-title">🎯 Seyyah Hedef Listesi (Bucket List) — Canlı XP Senkronizasyonu</div>
          <div class="ach-section-sub">${metrics.bucketCompletedCount}/${BUCKET_CATALOG.length} tamamlandı</div>
        </div>
        <div class="ach-bucket-grid">
          ${BUCKET_CATALOG.map((item) => {
            const done = metrics.bucketCompletedIds.has(item.id);
            return `
              <button type="button" class="ach-bucket-item ${done ? 'done' : ''}" data-bucket-id="${safeEscape(item.id, ctx)}">
                <span>${done ? '✅' : '⬜'}</span>
                <span>${item.icon} ${safeEscape(item.title, ctx)}</span>
              </button>
            `;
          }).join('')}
        </div>
      </section>
    ` : '';

    const pillCounts = {
      all: totalBadges,
      unlocked: unlockedCount,
      locked: lockedCount,
      regional: regionalCount,
      culture: cultureCount
    };

    const pillsHtml = FILTER_PILLS.map((p) => `
      <button type="button" class="ach-pill ${uiState.filter === p.id ? 'active' : ''}" data-ach-filter="${p.id}">
        <span>${safeEscape(p.label, ctx)}</span>
        <span class="ach-pill-count">${pillCounts[p.id]}</span>
      </button>
    `).join('');

    const cardsHtml = filteredBadges.length
      ? filteredBadges.map((b) => `
          <article class="ach-card ${b.unlocked ? 'unlocked' : 'locked'}">
            <div class="ach-card-top">
              ${buildAchievementBadgeSvg(b)}
              <div class="ach-card-meta">
                <div class="ach-card-tags">
                  <span class="ach-status-tag ${b.unlocked ? 'open' : 'closed'}">
                    ${b.unlocked ? '✅ Kazanıldı' : '🔒 Kilitli'}
                  </span>
                  <span class="ach-xp-tag">+${b.xp} XP</span>
                </div>
                <h3 class="ach-card-title">${safeEscape(b.title, ctx)}</h3>
                <p class="ach-card-desc">${safeEscape(b.desc, ctx)}</p>
              </div>
            </div>
            <div class="ach-prog-wrap">
              <div class="ach-prog-nums">
                <span>${b.current.toLocaleString('tr-TR')} / ${b.target.toLocaleString('tr-TR')}</span>
                <span>%${b.pct}</span>
              </div>
              <div class="ach-prog-track">
                <div class="ach-prog-fill" style="width:${b.pct}%;background:${b.unlocked ? 'var(--accent-emerald, #10b981)' : b.accent};"></div>
              </div>
            </div>
            <div class="ach-condition">
              <strong>Koşul:</strong> ${safeEscape(b.unlockCondition, ctx)}
            </div>
          </article>
        `).join('')
      : `<div class="ach-section-card" style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Bu filtrede henüz başarım bulunmuyor.</div>`;

    container.innerHTML = `
      <div class="ach-root">
        <section class="ach-hero">
          <div class="ach-rank-emblem-wrap">
            ${buildRankEmblemSvg(rank)}
            <span class="ach-level-chip">Seviye ${xp.level}</span>
          </div>
          <div class="ach-hero-main">
            <div class="ach-kicker">🏆 Rütbe &amp; Başarım Galerisi • Canlı Rozet Değerlendirici</div>
            <h2 class="ach-hero-title">${rank.icon} ${safeEscape(rank.title, ctx)}</h2>
            <p class="ach-hero-desc">${safeEscape(rank.desc, ctx)}</p>
            <div class="ach-xp-block">
              <div class="ach-xp-meta">
                <span>${nextRankSummary}</span>
                <span><strong>${xp.totalXp.toLocaleString('tr-TR')} XP</strong> (Sonraki seviye: ${xp.xpInLevel}/${xp.xpForNextLevel} XP)</span>
              </div>
              <div class="ach-xp-track">
                <div class="ach-xp-fill" style="width:${rankInfo.rankProgressPct}%;"></div>
              </div>
            </div>
          </div>
          <div class="ach-hero-side">
            <div class="ach-score-pill">
              <div class="ach-score-num">${unlockedCount}/${totalBadges}</div>
              <div class="ach-score-sub">Açılan Başarım • ${metrics.visitedCount}/${metrics.totalProvinces} İl</div>
            </div>
            <button type="button" class="ach-refresh-btn" id="ach-live-eval-btn">🔄 Canlı Değerlendir</button>
          </div>
        </section>

        <section class="ach-section-card">
          <div class="ach-section-head">
            <div class="ach-section-title">🪜 Seyyah Rütbe Merdiveni</div>
            <div class="ach-section-sub">${metrics.visitedCount} / ${metrics.totalProvinces} il (%${metrics.progressPct})</div>
          </div>
          <div class="ach-ladder-grid">
            ${ladderHtml}
          </div>
        </section>

        <section class="ach-telemetry-grid">
          <div class="ach-tele-card">
            <div class="ach-tele-title">
              <span>🌍 7 Coğrafi Bölge</span>
              <span style="color:var(--accent-cyan);font-size:0.78rem;">${metrics.visitedRegionsCount}/7 Bölge</span>
            </div>
            <div class="ach-region-bars">${regionsHtml}</div>
          </div>

          <div class="ach-tele-card">
            <div class="ach-tele-title">
              <span>🧭 Ankara → Edirne Hattı &amp; Miras</span>
              <span style="color:var(--accent-gold);font-size:0.78rem;">${metrics.routeVisitedCount}/${metrics.routeTotalCount} Durak</span>
            </div>
            <div class="ach-route-stops">${routeStopsHtml}</div>
            <div style="margin-top:auto;font-size:0.78rem;color:var(--text-secondary);display:flex;justify-content:space-between;gap:8px;padding-top:6px;border-top:1px solid var(--border-glass);">
              <span>🌊 Kıyı İli: <strong>${metrics.coastalVisited}/${metrics.coastalTotal}</strong></span>
              <span>🏛️ UNESCO: <strong>${metrics.unescoVisitedSites}/${metrics.unescoTotalSites}</strong></span>
            </div>
          </div>

          <div class="ach-tele-card">
            <div class="ach-tele-title">
              <span>💾 Canlı Aktivite (localStorage)</span>
              <span style="color:var(--accent-emerald);font-size:0.78rem;">+${xp.activityXp} XP</span>
            </div>
            <div class="ach-ls-metrics">
              <div class="ach-ls-box">
                <div class="ach-ls-val">⭐ ${metrics.favoritesCount}</div>
                <div class="ach-ls-lbl">Favori Şehir</div>
              </div>
              <div class="ach-ls-box">
                <div class="ach-ls-val">📝 ${metrics.journalEntriesCount}</div>
                <div class="ach-ls-lbl">Seyir Notu</div>
              </div>
              <div class="ach-ls-box">
                <div class="ach-ls-val">⏱️ ${metrics.pomodoroMinutes} dk</div>
                <div class="ach-ls-lbl">Pomodoro Odak</div>
              </div>
              <div class="ach-ls-box">
                <div class="ach-ls-val">🎯 ${metrics.bucketCompletedCount}</div>
                <div class="ach-ls-lbl">Hedef Listesi</div>
              </div>
            </div>
            <button type="button" class="ach-bucket-toggle-btn" id="ach-toggle-bucket-btn">
              ${uiState.showBucketDrawer ? '▲ Hedef Listesini Gizle' : '🎯 Seyyah Hedef Listesini Aç / İşaretle'}
            </button>
          </div>
        </section>

        ${bucketDrawerHtml}

        <div class="ach-filters-bar">
          <div class="ach-pills" role="tablist" aria-label="Başarım Kategorileri">
            ${pillsHtml}
          </div>
          <div class="ach-section-sub">Gösterilen: <strong>${filteredBadges.length}</strong> / ${totalBadges} başarım</div>
        </div>

        <section class="ach-grid" aria-label="Başarım Kartları">
          ${cardsHtml}
        </section>
      </div>
    `;

    // Bind interactive controls
    container.querySelectorAll('[data-ach-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiState.filter = btn.getAttribute('data-ach-filter') || 'all';
        renderView(container, uiState.lastCtx);
      });
    });

    const evalBtn = container.querySelector('#ach-live-eval-btn');
    if (evalBtn) {
      evalBtn.addEventListener('click', () => {
        const latest = evaluate(uiState.lastCtx);
        renderView(container, uiState.lastCtx);
        notify(`🏆 Canlı değerlendirme tamamlandı: ${latest.unlockedCount}/${latest.totalBadges} başarım • ${latest.xp.totalXp} XP`, uiState.lastCtx);
      });
    }

    const bucketBtn = container.querySelector('#ach-toggle-bucket-btn');
    if (bucketBtn) {
      bucketBtn.addEventListener('click', () => {
        uiState.showBucketDrawer = !uiState.showBucketDrawer;
        renderView(container, uiState.lastCtx);
      });
    }

    container.querySelectorAll('[data-bucket-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-bucket-id');
        if (!id) return;
        toggleBucketItem(id);
        renderView(container, uiState.lastCtx);
      });
    });
  }

  function checkAndCacheUnlocks(ctx) {
    const res = evaluate(ctx);
    const unlockedIds = res.badges.filter((b) => b.unlocked).map((b) => b.id);
    const prev = readJsonStorage(UNLOCKED_CACHE_KEY, null);

    if (Array.isArray(prev)) {
      const prevSet = new Set(prev);
      const newlyUnlocked = res.badges.filter((b) => b.unlocked && !prevSet.has(b.id));
      if (newlyUnlocked.length > 0) {
        const first = newlyUnlocked[0];
        notify(`🏆 Yeni Başarım Açıldı: ${first.title} (+${first.xp} XP)`, ctx);
      }
    }
    writeJsonStorage(UNLOCKED_CACHE_KEY, unlockedIds);
    return res;
  }

  function init(ctx) {
    uiState.lastCtx = ctx || uiState.lastCtx;
    injectStyles();
    const res = checkAndCacheUnlocks(uiState.lastCtx);

    if (!uiState.initialized && typeof window !== 'undefined') {
      uiState.initialized = true;
      window.addEventListener('storage', () => {
        if (uiState.lastContainer && document.body.contains(uiState.lastContainer)) {
          renderView(uiState.lastContainer, uiState.lastCtx);
        }
      });
    }
    return res;
  }

  window.SEYYAH_MODULES.achievements = {
    render: renderView,
    init,
    evaluate
  };
})();
