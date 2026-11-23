/**
 * Anadolu Seyahatnamesi — Spotlight Command Palette (Ctrl+K / Cmd+K)
 * Zero-dependency, ultra-fast Turkish-aware search over Quick Actions & 81 Provinces.
 * Registers on window.SEYYAH_MODULES.commandPalette
 */
(function () {
  'use strict';

  const MAX_SEARCH_RESULTS = 16;
  const RECENT_STORAGE_KEY = 'dijital_seyyah_cmd_recent_v1';
  const MAX_RECENT_ITEMS = 6;
  const STYLE_ID = 'seyyah-cmd-palette-v3-styles';
  const ROAD_FACTOR = 1.35;
  const AVG_SPEED_KMH = 80;

  const CATEGORY_CHIPS = [
    { id: 'all', label: 'Tümü' },
    { id: 'provinces', label: '🗺️ İller (81)' },
    { id: 'monuments', label: '🏛️ Anıtlar (86)' },
    { id: 'ai', label: '✨ Yapay Zekâ' },
    { id: 'irfan', label: '🕌 İrfan' },
    { id: 'studio', label: '🛠️ Stüdyo & Araçlar' }
  ];

  // Fallback helpers in case ctx omits them
  function defaultNormalizeTurkish(str) {
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

  function defaultEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fallbackHaversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371.0;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDriveHours(hoursFloat) {
    if (!Number.isFinite(hoursFloat) || hoursFloat <= 0) return '0 dk';
    const totalMinutes = Math.round(hoursFloat * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins} dk`;
    if (mins === 0) return `${hours} sa`;
    return `${hours} sa ${mins} dk`;
  }

  let _ctx = null;
  let _overlay = null;
  let _input = null;
  let _list = null;
  let _countEl = null;
  let _chipsBar = null;
  let _isOpen = false;
  let _initialized = false;
  let _selectedIndex = 0;
  let _activeCategory = 'all';
  let _currentItems = [];
  let _actionsIndex = [];
  let _provincesIndex = [];
  let _lastActiveElement = null;

  function loadRecents() {
    try {
      const raw = localStorage.getItem(RECENT_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_ITEMS) : [];
    } catch (e) {
      return [];
    }
  }

  function saveRecents(items) {
    try {
      localStorage.setItem(
        RECENT_STORAGE_KEY,
        JSON.stringify((items || []).slice(0, MAX_RECENT_ITEMS))
      );
    } catch (e) {}
  }

  function recordRecentItem(entry) {
    if (!entry) return;
    let recItem = null;
    if (entry.kind === 'province' && entry.item) {
      recItem = {
        kind: 'province',
        id: `city-${entry.item.key}`,
        key: entry.item.key
      };
    } else if (entry.kind === 'action' && entry.item) {
      recItem = {
        kind: 'action',
        id: entry.item.id
      };
    } else if (entry.kind === 'calculator' && entry.calc) {
      recItem = {
        kind: 'calculator',
        id: `calc-${entry.calc.cityA.key}-${entry.calc.cityB.key}`,
        keyA: entry.calc.cityA.key,
        keyB: entry.calc.cityB.key
      };
    }
    if (!recItem) return;

    const existing = loadRecents().filter((r) => r && r.id !== recItem.id);
    existing.unshift(recItem);
    saveRecents(existing.slice(0, MAX_RECENT_ITEMS));
  }

  function clearRecents() {
    try {
      localStorage.removeItem(RECENT_STORAGE_KEY);
    } catch (e) {}
    _selectedIndex = 0;
    renderList(_input ? _input.value : '');
  }

  function norm(str) {
    if (_ctx && typeof _ctx.normalizeTurkish === 'function') {
      return _ctx.normalizeTurkish(str);
    }
    return defaultNormalizeTurkish(str);
  }

  function esc(str) {
    if (_ctx && typeof _ctx.escapeHtml === 'function') {
      return _ctx.escapeHtml(str);
    }
    return defaultEscapeHtml(str);
  }

  function safeCall(fnName, ...args) {
    if (_ctx && typeof _ctx[fnName] === 'function') {
      return _ctx[fnName](...args);
    }
    return undefined;
  }

  function buildActionsIndex() {
    const rawActions = [
      {
        id: 'action-dashboard',
        type: 'action',
        icon: '🧭',
        title: 'Genel Bakış',
        subtitle: 'Seyahatname özet paneli, istatistikler ve rütbe durumu',
        category: 'Görünüm',
        keywords: 'dashboard anasayfa özet genel bakis istatistik panel',
        run: () => safeCall('openView', 'dashboard')
      },
      {
        id: 'action-map',
        type: 'action',
        icon: '🗺️',
        title: 'İnteraktif Harita',
        subtitle: '81 ilin etkileşimli Türkiye haritasını aç',
        category: 'Görünüm',
        keywords: 'harita map turkiye interaktif konum pin',
        run: () => safeCall('openMapModal')
      },
      {
        id: 'action-route',
        type: 'action',
        icon: '🛣️',
        title: 'Rota Planlayıcı',
        subtitle: 'Aktif sefer rotası ve 2-Opt otomatik rota optimizasyonu',
        category: 'Görünüm',
        keywords: 'rota planlayici sefer yol guzergah 2-opt km',
        run: () => safeCall('openView', 'route')
      },
      {
        id: 'action-gallery',
        type: 'action',
        icon: '🖼️',
        title: '162 Fotoğraf Galerisi',
        subtitle: '81 ilden seçilmiş 162 fotoğraflık Anadolu arşivi',
        category: 'Görünüm',
        keywords: 'galeri fotograf resim 162 gorsel lightbox',
        run: () => safeCall('openView', 'gallery')
      },
      {
        id: 'action-compare',
        type: 'action',
        icon: '⚖️',
        title: 'Şehir Karşılaştır',
        subtitle: 'İki ili tarih, mesafe, mutfak ve kütüphane yönünden kıyasla',
        category: 'Araç',
        keywords: 'sehir karsilastir kiysala compare iki il',
        run: () => safeCall('openView', 'compare')
      },
      {
        id: 'action-gastronomy',
        type: 'action',
        icon: '🍲',
        title: 'Lezzet Atlası',
        subtitle: '81 ilin meşhur yemekleri, tatlıları ve yöresel mutfak rehberi',
        category: 'Keşif',
        keywords: 'lezzet atlasi yemek mutfak tatli gastronomi yoresel',
        run: () => safeCall('openView', 'gastronomy')
      },
      {
        id: 'action-library',
        type: 'action',
        icon: '📚',
        title: 'Kütüphane & Pomodoro',
        subtitle: '81 İl Halk Kütüphanesi rehberi ve odaklanma sayacı',
        category: 'Araç',
        keywords: 'kutuphane pomodoro odak ders calisma sayac zamanlayici',
        run: () => safeCall('openView', 'library')
      },
      {
        id: 'action-quiz',
        type: 'action',
        icon: '🎯',
        title: 'Anadolu Bilgi Yarışması',
        subtitle: 'Plaka, bölge, eser ve lezzet soruları ile kendini sına',
        category: 'Oyun',
        keywords: 'quiz bilgi yarismasi test soru plaka oyun',
        run: () => safeCall('openView', 'quiz')
      },
      {
        id: 'action-analytics',
        type: 'action',
        icon: '📊',
        title: 'Analitik & 81 Plaka Haritası',
        subtitle: 'Bölgesel ilerleme grafikleri ve 81 plaka tamamlama matrisi',
        category: 'Görünüm',
        keywords: 'analitik 81 plaka haritasi istatistik grafik rapor matris',
        run: () => safeCall('openView', 'analytics')
      },
      {
        id: 'action-journal',
        type: 'action',
        icon: '✍️',
        title: 'Kişisel Seyir Defteri',
        subtitle: 'Şehirlere özel kişisel notlarını, anılarını ve planlarını yaz',
        category: 'Araç',
        keywords: 'kisisel seyir defteri gunluk not ani journal defter',
        run: () => safeCall('openView', 'journal')
      },
      {
        id: 'action-atlas',
        type: 'action',
        icon: '🗺️',
        title: '81 İl Vektör Keşif Atlası',
        subtitle: 'Zoom/pan destekli SVG Anadolu haritası ve aktif sefer rotası',
        category: 'Görünüm',
        keywords: 'atlas vektor svg harita turkiye zoom bolge rota',
        run: () => safeCall('openView', 'atlas')
      },
      {
        id: 'action-landmarks',
        type: 'action',
        icon: '🕌',
        title: '373 Anadolu Miras & Durak Ansiklopedisi',
        subtitle: 'Camiler, kaleler, antik kentler ve doğa harikalarını kategorize keşfet',
        category: 'Keşif',
        keywords: 'miras durak cami kale antik kent selale kanyon ansiklopedi',
        run: () => safeCall('openView', 'landmarks')
      },
      {
        id: 'action-timeline',
        type: 'action',
        icon: '🏛️',
        title: '12.000 Yıllık Anadolu Kronolojisi',
        subtitle: 'Göbeklitepe\'den Cumhuriyet\'e medeniyetler ve manevi mimarlar',
        category: 'Keşif',
        keywords: 'kronoloji tarih medeniyet selcuklu osmanli gobeklitepe mevlana',
        run: () => safeCall('openView', 'timeline')
      },
      {
        id: 'action-seasons',
        type: 'action',
        icon: '🌤️',
        title: '12 Aylık & Mevsimlik Seyahat Takvimi',
        subtitle: 'Hangi ayda hangi il gezilir? GSB Seyahatsever yaz dönemi rehberi',
        category: 'Araç',
        keywords: 'mevsim takvim ay hava durumu yaz kis ilkbahar sonbahar gsb',
        run: () => safeCall('openView', 'seasons')
      },
      {
        id: 'action-postcard',
        type: 'action',
        icon: '📮',
        title: 'Dijital Kartpostal Stüdyosu',
        subtitle: '81 il için 1200×675 HD PNG kartpostal tasarla ve indir',
        category: 'Stüdyo',
        keywords: 'kartpostal postcard png canvas paylasim kart tasarim',
        run: () => safeCall('openView', 'postcard')
      },
      {
        id: 'action-sound',
        type: 'action',
        icon: '🎧',
        title: '5 Kanallı Sufi & Doğa Ses Stüdyosu',
        subtitle: 'Ney, yağmur, rüzgar, dalga ve ocak seslerini karıştır + canlı görselleştirici',
        category: 'Stüdyo',
        keywords: 'ses mikser ney yagmur ruzgar dalga ambient tefekkur studyo',
        run: () => safeCall('openView', 'sound')
      },
      {
        id: 'action-packing',
        type: 'action',
        icon: '🎒',
        title: 'Sırt Çantası & Sefer Hazırlık Listesi',
        subtitle: 'Mevsimlik çanta kontrol listesi ve canlı gram/kg ağırlık hesabı',
        category: 'Araç',
        keywords: 'sirt cantasi packing checklist hazirlik agirlik kyk esya',
        run: () => safeCall('openView', 'packing')
      },
      {
        id: 'action-budget',
        type: 'action',
        icon: '💰',
        title: 'Sefer Bütçe & GSB Tasarruf Simülatörü',
        subtitle: '5 Gün Kuralı maliyet hesabı, SVG grafik ve KYK otel tasarrufu',
        category: 'Araç',
        keywords: 'butce maliyet tasarruf kyk gsb otobus yakit hesaplayici',
        run: () => safeCall('openView', 'budget')
      },
      {
        id: 'action-reader',
        type: 'action',
        icon: '📖',
        title: 'Seyyah Yazılım Serisi Okuyucusu',
        subtitle: '7 bölümlük manifesto ve rehber makalelerini uygulama içinde oku',
        category: 'Okuma',
        keywords: 'makale kitap okuyucu reader medium seri manifesto',
        run: () => safeCall('openView', 'reader')
      },
      {
        id: 'action-cinematic',
        type: 'action',
        icon: '🎬',
        title: 'Sinematik Anadolu Turu',
        subtitle: 'Ken Burns efektli belgesel slayt gösterisi ve tam ekran tur',
        category: 'Stüdyo',
        keywords: 'sinematik tur belgesel slayt video ken burns tam ekran',
        run: () => safeCall('openView', 'cinematicTour')
      },
      {
        id: 'action-passport',
        type: 'action',
        icon: '🛂',
        title: 'Dijital Seyyah Pasaportu',
        subtitle: '39 il SVG mühür damgası, 42 boş yuva ve PNG pasaport indirme',
        category: 'Stüdyo',
        keywords: 'pasaport muhur damga svg png koleksiyon rozet',
        run: () => safeCall('openView', 'passport')
      },
      {
        id: 'action-radar',
        type: 'action',
        icon: '📡',
        title: 'Menzil Radarı (Yakınımdaki İller)',
        subtitle: '50-600 km yarıçaplı animasyonlu SVG radar ve GPS tarayıcı',
        category: 'Araç',
        keywords: 'radar yakinimdakiler gps mesafe yaricap tarayici',
        run: () => safeCall('openView', 'radar')
      },
      {
        id: 'action-advisor',
        type: 'action',
        icon: '✨',
        title: 'Akıllı Seyyah Rehberi (Asistan)',
        subtitle: 'Doğal Türkçe sorularla anında rota, lezzet ve şehir önerileri al',
        category: 'Asistan',
        keywords: 'asistan rehber yapay zeka soru sor oneri sohbet chat',
        run: () => safeCall('openView', 'advisor')
      },
      {
        id: 'action-ai-planner',
        type: 'action',
        icon: '🧠',
        title: 'AI Sefer Mühendisi (Planlayıcı)',
        subtitle: 'Gemini AI ile gün, bütçe ve odağa göre kişiselleştirilmiş sefer planı üret',
        category: 'Yapay Zekâ',
        keywords: 'ai planlayici sefer muhendisi gemini 5 gun rota butce kyk',
        run: () => safeCall('openView', 'aiPlanner')
      },
      {
        id: 'action-ai-mood',
        type: 'action',
        icon: '🎭',
        title: 'AI Ruh Hali & Kişilik Kaşifi',
        subtitle: 'O anki ruh haline, mevsime ve yol arkadaşına göre %99 uyumlu 3 menzil',
        category: 'Yapay Zekâ',
        keywords: 'ai ruh hali mood kisilik kesif tefekkur macera melankoli',
        run: () => safeCall('openView', 'aiMood')
      },
      {
        id: 'action-ai-writer',
        type: 'action',
        icon: '✍️',
        title: 'AI Evliya Çelebi Seyahatname Yazarı',
        subtitle: 'Kısa notlarından canlı akan (streaming) edebi seyahatname ve blog üret',
        category: 'Yapay Zekâ',
        keywords: 'ai yazar evliya celebi seyahatname blog makale deneme',
        run: () => safeCall('openView', 'aiWriter')
      },
      {
        id: 'action-ai-battle',
        type: 'action',
        icon: '⚔️',
        title: 'AI Şehir Düellosu & Uzman Hakem',
        subtitle: 'İki ili 5 kriterde yan yana yarıştırıp Gemini AI hakem kararı al',
        category: 'Yapay Zekâ',
        keywords: 'ai duello vs karsilastir hakem iki sehir',
        run: () => safeCall('openView', 'aiBattle')
      },
      {
        id: 'action-ai-quiz',
        type: 'action',
        icon: '🧩',
        title: 'Sonsuz AI Anadolu Kültür Yarışması',
        subtitle: 'Gemini tarafından anlık üretilen 4 şıklı tarih, mutfak ve tasavvuf soruları',
        category: 'Yapay Zekâ',
        keywords: 'ai quiz bilgi yarismasi soru tarih kultur',
        run: () => safeCall('openView', 'aiQuiz')
      },
      {
        id: 'action-ai-chef',
        type: 'action',
        icon: '🍽️',
        title: 'AI Anadolu Gurme Şefi & Sofra Rehberi',
        subtitle: '81 ilde öğün ve bütçeye göre canlı akan yöresel lezzet ve sofra rotası',
        category: 'Yapay Zekâ',
        keywords: 'ai gurme sef yemek lezzet mutfak sofra',
        run: () => safeCall('openView', 'aiChef')
      },
      {
        id: 'action-ai-search',
        type: 'action',
        icon: '🔎',
        title: 'AI Doğal Dil Akıllı Arama',
        subtitle: 'Çok kriterli doğal Türkçe cümlelerle 81 il içinde semantik keşif',
        category: 'Yapay Zekâ',
        keywords: 'ai arama dogal dil semantik filtre',
        run: () => safeCall('openView', 'aiSearch')
      },
      {
        id: 'action-irfan-atlas',
        type: 'action',
        icon: '🕌',
        title: 'Anadolu İrfan & Gönül Coğrafyası Atlası',
        subtitle: '24 gönül sultanı, 303 manevi şahsiyet ve Gemini AI tefekkür sohbeti',
        category: 'İrfan & Felsefe',
        keywords: 'irfan gonul atlasi mevlana yunus emre haci bayram tasavvuf',
        run: () => safeCall('openView', 'irfanAtlas')
      },
      {
        id: 'action-hikmet-meclisi',
        type: 'action',
        icon: '📜',
        title: 'Hikmet Meclisi (5 Kadim Bilge ile AI Sohbet)',
        subtitle: 'Evliya Çelebi, İbn Battûta, İbnü\'l-Arabî, Yunus Emre ve İbn Haldûn ile diyalog',
        category: 'İrfan & Felsefe',
        keywords: 'hikmet meclisi evliya celebi ibn arabi ibn haldun felsefe diyalog',
        run: () => safeCall('openView', 'hikmetMeclisi')
      },
      {
        id: 'action-seven-valleys',
        type: 'action',
        icon: '🕊️',
        title: 'Mantıku\'t-Tayr: Yedi Vadi & Sefer Merhaleleri',
        subtitle: 'Ferîdüddin Attâr\'ın 7 vadisinde 81 il içsel yolculuk haritası',
        category: 'İrfan & Felsefe',
        keywords: 'yedi vadi mantikut tayr attar simurg sefer merhaleleri istigna',
        run: () => safeCall('openView', 'sevenValleys')
      },
      {
        id: 'action-halvet',
        type: 'action',
        icon: '🕯️',
        title: 'Halvet & Tefekkür Odası (Sükûnet Stüdyosu)',
        subtitle: 'Selçuklu yıldızı nefes ritmi, Tasavvufi Ney Taksimi ve 18 kadim hikmet',
        category: 'İrfan & Felsefe',
        keywords: 'halvet tefekkur nefes ney sukunet zen zikir',
        run: () => safeCall('openView', 'halvet')
      },
      {
        id: 'action-ethos',
        type: 'action',
        icon: '⚖️',
        title: 'Seyyah Ahlâkı & 24 Kavramlık İrfan Lügatı',
        subtitle: '7 Fütüvvet ilkesi ve Sefer der Vatan, Halvet der Encümen, Umran sözlüğü',
        category: 'İrfan & Felsefe',
        keywords: 'ahlak futuvvet lugat sozluk sefer der vatan umran tecerrud',
        run: () => safeCall('openView', 'ethos')
      },
      {
        id: 'action-civ-layers',
        type: 'action',
        icon: '🏛️',
        title: 'Anadolu Medeniyet Katmanları & Zaman Felsefesi',
        subtitle: 'Göbeklitepe\'den Selçuklu ve Osmanlı\'ya 7 katmanda taşın hafızası',
        category: 'İrfan & Felsefe',
        keywords: 'medeniyet katmanlari zaman felsefesi gobeklitepe selcuklu osmanli',
        run: () => safeCall('openView', 'civLayers')
      },
      {
        id: 'action-sky-map',
        type: 'action',
        icon: '🌌',
        title: 'Anadolu Semâsı: 81 Yıldız & Takımyıldızı Haritası',
        subtitle: '81 ilin gece göğündeki yıldız haritası, kuyrukluyıldız rotası ve Marifetnâme',
        category: 'Keşif',
        keywords: 'sema yildiz takim yildizi gok haritasi rasathane marifetname astronomi',
        run: () => safeCall('openView', 'skyMap')
      },
      {
        id: 'action-caravanserai',
        type: 'action',
        icon: '🏰',
        title: 'Anadolu Kervansarayları & Modern GSB Menzil Atlası',
        subtitle: '13 tarihi Sultan Hanı, İpek Yolu ve 81 il GSB Seyahatsever kervansaray rehberi',
        category: 'Rota & Plan',
        keywords: 'kervansaray sultanhani ipek yolu han gsb kyk vakif',
        run: () => safeCall('openView', 'caravanserai')
      },
      {
        id: 'action-divan',
        type: 'action',
        icon: '🖋️',
        title: 'Anadolu Şiir, Türkü & "Beş Şehir" Edebiyat Divanı',
        subtitle: 'Tanpınar Beş Şehir, Yunus Emre, Âşık Veysel, Karacaoğlan ve AI Şiir Yazarı',
        category: 'İrfan & Felsefe',
        keywords: 'siir turku edebiyat divan tanpinar bes sehir asik veysel neset ertas',
        run: () => safeCall('openView', 'divan')
      },
      {
        id: 'action-work-log',
        type: 'action',
        icon: '💻',
        title: '81 İl Kütüphane Mesai Defteri & 780+ Saat Heatmap',
        subtitle: 'İl Halk Kütüphanelerindeki yazılım/okuma mesaisi katkı matrisi ve kaydı',
        category: 'Analiz',
        keywords: 'kutuphane mesai heatmap calisma kodlama 780 saat portfoy',
        run: () => safeCall('openView', 'workLog')
      },
      {
        id: 'action-certificate',
        type: 'action',
        icon: '📜',
        title: 'Sefer Der Vatan Beratı & 1920×1080 Sertifika Stüdyosu',
        subtitle: 'Selçuklu 8 köşeli yıldız altın mühürlü, isme özel HD PNG sefer beratı indir',
        category: 'Stüdyo',
        keywords: 'berat sertifika muhur ferman png 1920x1080 hafizi anadolu',
        run: () => safeCall('openView', 'certificate')
      },
      {
        id: 'action-proverbs',
        type: 'action',
        icon: '🗣️',
        title: 'Anadolu Sözlüğü: Deyimler, Atasözleri & Yol Duaları',
        subtitle: '7 bölgeden 28 otantik yol atasözü, yöresel ağız ve kadim misafir duaları',
        category: 'İrfan & Felsefe',
        keywords: 'atasozu deyim dua sozluk agiz yoresel kelime',
        run: () => safeCall('openView', 'proverbs')
      },
      {
        id: 'action-nature-wonders',
        type: 'action',
        icon: '🏔️',
        title: 'Anadolu Tabiat Harikaları & Şifalı Kaplıcalar Atlası',
        subtitle: '28 kanyon, şelale, krater gölü, mağara ve şifalı termal kaynaklar',
        category: 'Keşif',
        keywords: 'tabiat doga kanyon selale magara kaplica termal gol',
        run: () => safeCall('openView', 'natureWonders')
      },
      {
        id: 'action-bazaar',
        type: 'action',
        icon: '🏺',
        title: 'Geleneksel Sanatlar, Zanaatlar & Tarihi Çarşılar Bedesteni',
        subtitle: 'Ahîlik ahlâkı, 24 el sanatı (çini, telkâri, oltu, lületaşı, ipek) ve hanlar',
        category: 'Kültür & Miras',
        keywords: 'zanaat sanat carsi bedesten ahilik cini telkari oltu ipek hali',
        run: () => safeCall('openView', 'bazaar')
      },
      {
        id: 'action-expedition-log',
        type: 'action',
        icon: '🗓️',
        title: '39 Fethedilen İl Sefer Günlüğü (195 Gün • 10.898 km)',
        subtitle: 'Gezilen 39 menzilin çift fotoğraflı kronolojik hatıratı ve anı defteri',
        category: 'Rota & Plan',
        keywords: 'sefer gunlugu 39 il 195 gun hatirat kronoloji ani',
        run: () => safeCall('openView', 'expeditionLog')
      },
      {
        id: 'action-mesopotamia',
        type: 'action',
        icon: '🏜️',
        title: 'Mezopotamya (Güneydoğu Anadolu 0/9) Özel Sefer Merkezi',
        subtitle: 'Gaziantep ➔ Şırnak 9 duraklı 2-Opt koridor haritası ve 45 gün master planı',
        category: 'Rota & Plan',
        keywords: 'mezopotamya guneydogu 9 il gaziantep mardin sanliurfa diyarbakir',
        run: () => safeCall('openView', 'mesopotamia')
      },
      {
        id: 'action-makam-atlas',
        type: 'action',
        icon: '🎶',
        title: 'Anadolu Makamları, Fârâbî Mûsikî Şifası & Türkü Atlası',
        subtitle: '8 klasik makamın ruh şifası, canlı makam dem sentezleyici ve 7 bölge türküleri',
        category: 'İrfan & Felsefe',
        keywords: 'makam musiki farabi sifa hicaz rast ussak ney turku bozlak',
        run: () => safeCall('openView', 'makamAtlas')
      },
      {
        id: 'action-architecture',
        type: 'action',
        icon: '🕌',
        title: 'Anadolu Mimari Şaheserleri & Kubbe/Mukarnas Hendesesi',
        subtitle: '24 selâtin camii, taş köprü, darüşşifa ve interaktif SVG mimari kesit',
        category: 'Kültür & Miras',
        keywords: 'mimari kubbe kemer mukarnas hendese selimiye suleymaniye darussifa kopru',
        run: () => safeCall('openView', 'architecture')
      },
      {
        id: 'action-quote-vault',
        type: 'action',
        icon: '🔖',
        title: 'Hikmet & Alıntı Hazinesi (302 Edebî İktibas & Fikir Kartı)',
        subtitle: '81 ilin ruhu, klasik beyitler, tam ekran tefekkür destesi ve kişisel seçki',
        category: 'İrfan & Felsefe',
        keywords: 'hikmet alinti iktibas soz hazine fikir karti',
        run: () => safeCall('openView', 'quoteVault')
      },
      {
        id: 'action-data-vault',
        type: 'action',
        icon: '🗄️',
        title: 'Seyyah Veri Kasası (JSON Yedekle / Geri Yükle / GeoJSON)',
        subtitle: 'Kişisel verilerini yedekle veya 81 ili RFC 7946 GeoJSON indir (Alt+B)',
        category: 'Araçlar',
        keywords: 'veri kasasi yedek backup restore geojson indir disa aktar json vault',
        run: () => {
          if (window.SEYYAH_MODULES && window.SEYYAH_MODULES.dataVault) {
            window.SEYYAH_MODULES.dataVault.open();
          }
        }
      },
      {
        id: 'action-print-pdf',
        type: 'action',
        icon: '🖨️',
        title: 'Mevcut Sayfayı Yazdır / PDF Olarak Kaydet',
        subtitle: 'Şehir dosyasını veya aktif görünümü temiz editoryal PDF çıktısına dönüştür',
        category: 'Araçlar',
        keywords: 'yazdir print pdf cikti dosya kaydet',
        run: () => setTimeout(() => window.print(), 120)
      },
      {
        id: 'action-copy-link',
        type: 'action',
        icon: '🔗',
        title: 'Aktif Sayfa Bağlantısını Kopyala',
        subtitle: 'Şu an açık olan il veya stüdyonun doğrudan bağlantısını panoya al',
        category: 'Araçlar',
        keywords: 'baglanti link paylas share kopyala url',
        run: () => {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(window.location.href).then(() => {
              safeCall('showToast', '🔗 Sayfa bağlantısı panoya kopyalandı!');
            }).catch(() => {});
          }
        }
      },
      {
        id: 'action-pomodoro',
        type: 'action',
        icon: '🍅',
        title: 'Kütüphane Odak & Pomodoro Stüdyosu',
        subtitle: '81 İl Halk Kütüphanesi eşliğinde 25/50 dk derin çalışma zamanlayıcısı',
        category: 'Üretkenlik',
        keywords: 'pomodoro odak kutuphane zamanlayici timer calisma 25 50 dk',
        run: () => safeCall('openView', 'pomodoro')
      },
      {
        id: 'action-achievements',
        type: 'action',
        icon: '🏆',
        title: 'Rütbe & Başarım Galerisi',
        subtitle: '23 veri tabanlı rozet, XP barı ve Cihan Seyyahı rütbe merdiveni',
        category: 'Keşif',
        keywords: 'basarim rozet rutbe xp kupa odul cihan seyyahi',
        run: () => safeCall('openView', 'achievements')
      },
      {
        id: 'action-bucket-list',
        type: 'action',
        icon: '🎯',
        title: 'Anadolu Bucket List & Sefer Hedefleri',
        subtitle: '7 bölgeden 24 küratörlü ikonik görev ve kişisel hedef takipçisi',
        category: 'Planlama',
        keywords: 'bucket list hedefler gorevler yapilacaklar checklist anadolu',
        run: () => safeCall('openView', 'bucketList')
      },
      {
        id: 'action-photo-wall',
        type: 'action',
        icon: '🖼️',
        title: '162 Kare Mozaik Duvarı',
        subtitle: 'Pinterest/Masonry düzende tüm 162 il fotoğrafı, karıştır & slayt modu',
        category: 'Görünüm',
        keywords: 'mozaik duvar masonry 162 fotograf galeri slayt karistir',
        run: () => safeCall('openView', 'photoWall')
      },
      {
        id: 'action-deep-stats',
        type: 'action',
        icon: '📈',
        title: 'İleri Analitik & 81/81 Tahmin Stüdyosu',
        subtitle: '7 bölge SVG Radar grafiği, koordinat haritası ve bitiş tarihi simülatörü',
        category: 'Analiz',
        keywords: 'analitik radar grafik istatistik tahmin 81 kyk tasarruf',
        run: () => safeCall('openView', 'deepStats')
      },
      {
        id: 'action-pro-shortcuts',
        type: 'action',
        icon: '⌨️',
        title: 'Klavye Kısayolları & Güvenli Veri Yedeği',
        subtitle: 'Tüm kısayolları gör ve kişisel verilerini JSON olarak yedekle/yükle',
        category: 'Sistem',
        keywords: 'kisayol klavye yedek backup json export import pro',
        run: () => {
          if (window.SEYYAH_MODULES && window.SEYYAH_MODULES.proTools && typeof window.SEYYAH_MODULES.proTools.openShortcutsModal === 'function') {
            window.SEYYAH_MODULES.proTools.openShortcutsModal();
          }
        }
      },
      {
        id: 'action-unesco',
        type: 'action',
        icon: '🏛️',
        title: 'UNESCO Türkiye Dünya Mirası (21)',
        subtitle: 'Türkiye\'nin 21 UNESCO Dünya Mirası alanı ve ziyaret durumu',
        category: 'Keşif',
        keywords: 'unesco dunya mirasi gobeklitepe efes selimiye pamukkale ani',
        run: () => safeCall('openView', 'unesco')
      },
      {
        id: 'action-distance-game',
        type: 'action',
        icon: '🎮',
        title: 'Anadolu Mesafe & Coğrafya Düellosu',
        subtitle: 'İki şehir arası km tahmini ve doğu/kuzey hız düellosu',
        category: 'Oyun',
        keywords: 'oyun duello mesafe tahmin cografya km game',
        run: () => safeCall('openView', 'distanceGame')
      },
      {
        id: 'action-regions',
        type: 'action',
        icon: '🌍',
        title: '7 Bölge Derin Keşif Vitrini',
        subtitle: '4 fotoğraflı bölge mozaikleri, bölge karneleri ve 2-Opt rota başlatıcı',
        category: 'Keşif',
        keywords: 'bolge marmara ege akdeniz karadeniz dogu guneydogu ic anadolu',
        run: () => safeCall('openView', 'regions')
      },
      {
        id: 'action-random',
        type: 'action',
        icon: '🎲',
        title: 'Rastgele Menzil',
        subtitle: '81 ilden sürpriz bir şehre ışınlan',
        category: 'Eylem',
        keywords: 'rastgele menzil surpriz random sans sehir',
        run: () => safeCall('selectRandomCity')
      },
      {
        id: 'action-theme',
        type: 'action',
        icon: '🌓',
        title: 'Gece/Gündüz Tema',
        subtitle: 'Karanlık ve aydınlık görünüm arasında geçiş yap',
        category: 'Ayar',
        keywords: 'gece gunduz tema karanlik aydinlik dark light mode',
        run: () => safeCall('toggleTheme')
      },
      {
        id: 'action-ambient',
        type: 'action',
        icon: '🎵',
        title: 'Tefekkür Sesi',
        subtitle: 'Ney & Bozkır, Kütüphane Yağmuru veya Kervansaray Sükuneti',
        category: 'Ayar',
        keywords: 'tefekkur sesi muzik ambient ney yagmur sukunet ses',
        run: () => safeCall('cycleAmbientSound')
      },
      {
        id: 'action-quote',
        type: 'action',
        icon: '📜',
        title: 'Günün Hikmeti',
        subtitle: 'Seyahat ve tefekkür üzerine seçilmiş bir hikmetli söz oku',
        category: 'Eylem',
        keywords: 'gunun hikmeti soz alinti quote evliya mevlana',
        run: () => safeCall('openQuoteModal')
      },
      {
        id: 'action-export',
        type: 'action',
        icon: '📥',
        title: 'E-Kitap İndir',
        subtitle: 'ANADOLU_SEYAHATNAMESI.md dosyasını cihazına indir',
        category: 'Eylem',
        keywords: 'e-kitap indir export markdown kitap dosya',
        run: () => {
          safeCall('exportMarkdownBook');
          safeCall('showToast', '📚 ANADOLU_SEYAHATNAMESI.md indirildi!');
        }
      }
    ];

    // Append all 86 verified authentic monuments from SEYYAH_MONUMENTS_CATALOG
    const monumentsCatalog = Array.isArray(window.SEYYAH_MONUMENTS_CATALOG) ? window.SEYYAH_MONUMENTS_CATALOG : [];
    const provData = (_ctx && _ctx.data && _ctx.data.provinces) || (typeof TRAVEL_DATA !== 'undefined' && TRAVEL_DATA && TRAVEL_DATA.provinces) || {};
    const catIcons = { UNESCO: '🏛️', Kervansaray: '🐪', Mimari: '🕌', 'Doğa & Termal': '🌿' };
    monumentsCatalog.forEach((m) => {
      const primaryKey = Array.isArray(m.provinces) && m.provinces.length ? m.provinces[0] : '';
      const provNames = (m.provinces || []).map((k) => (provData[k] ? provData[k].name : k)).join(', ');
      rawActions.push({
        id: `monument-${m.id}`,
        type: 'action',
        icon: catIcons[m.category] || '🏛️',
        title: m.title,
        subtitle: `${m.category}${provNames ? ` • ${provNames}` : ''} — Özgün Anıt & Miras`,
        category: 'Anıt & Miras',
        keywords: `${m.id} ${m.title} ${m.category} ${provNames} anit miras`,
        run: () => {
          if (primaryKey) {
            safeCall('selectCity', primaryKey);
          } else if (m.view) {
            safeCall('openView', m.view);
          }
        }
      });
    });

    _actionsIndex = rawActions.map((a) => ({
      ...a,
      _normTitle: norm(a.title),
      _normSub: norm(a.subtitle),
      _normKeywords: norm(a.keywords),
      _normCat: norm(a.category),
      _searchBlob: norm(`${a.title} ${a.subtitle} ${a.keywords} ${a.category}`)
    }));
  }

  function buildProvincesIndex() {
    const data = (_ctx && _ctx.data) || (_ctx && _ctx.state && _ctx.state.data) || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    if (!data || !data.provinces) {
      _provincesIndex = [];
      return;
    }

    const regionsMap = data.regions || {};
    _provincesIndex = Object.entries(data.provinces).map(([key, city]) => {
      const plateNum = Number(city.plate) || 0;
      const plateStr = String(plateNum).padStart(2, '0');
      const regionShort = city.region || '';
      const regionFull = (city.region_code && regionsMap[city.region_code] && regionsMap[city.region_code].name) || regionShort;
      const landmarks = Array.isArray(city.landmarks) ? city.landmarks : [];
      const specialties = Array.isArray(city.specialties) ? city.specialties : [];
      const library = city.library || '';
      const banner = city.has_banner && city.banner_rel ? city.banner_rel : (Array.isArray(city.images) && city.images[0] ? city.images[0] : '');

      const normLandmarks = landmarks.map((l) => ({ raw: l, n: norm(l) }));
      const normSpecialties = specialties.map((s) => ({ raw: s, n: norm(s) }));
      const normLibrary = norm(library);
      const normName = norm(city.name || '');
      const normRegion = norm(`${regionShort} ${regionFull}`);

      const defaultSubParts = [];
      if (landmarks[0]) defaultSubParts.push(landmarks[0]);
      if (specialties[0]) defaultSubParts.push(specialties[0]);

      return {
        id: `city-${key}`,
        type: 'province',
        key,
        plate: plateNum,
        plateStr,
        name: city.name || key,
        lat: Number(city.lat),
        lng: Number(city.lng),
        region: regionShort,
        regionFull,
        visited: Boolean(city.visited),
        banner,
        landmarks,
        specialties,
        library,
        defaultSubtitle: defaultSubParts.join(' • ') || regionFull,
        _normName: normName,
        _normRegion: normRegion,
        _normLandmarks: normLandmarks,
        _normSpecialties: normSpecialties,
        _normLibrary: normLibrary,
        _searchBlob: norm(
          `${plateStr} ${plateNum} ${city.name || ''} ${regionShort} ${regionFull} ${landmarks.join(' ')} ${specialties.join(' ')} ${library}`
        )
      };
    });

    _provincesIndex.sort((a, b) => a.plate - b.plate);
  }

  function matchActionToChip(action, chipId) {
    if (!chipId || chipId === 'all') return true;
    if (chipId === 'provinces') return false;
    const cat = action.category || '';
    if (chipId === 'monuments') {
      return cat === 'Anıt & Miras';
    }
    if (cat === 'Anıt & Miras') {
      return false;
    }
    if (chipId === 'ai') {
      return cat === 'Yapay Zekâ' || cat === 'Asistan' || action.id.indexOf('action-ai-') === 0 || action.id === 'action-advisor';
    }
    if (chipId === 'irfan') {
      return cat === 'İrfan & Felsefe' || action.id === 'action-quote';
    }
    if (chipId === 'studio') {
      return cat !== 'Yapay Zekâ' && cat !== 'Asistan' && cat !== 'İrfan & Felsefe';
    }
    return true;
  }

  function findProvinceByToken(rawToken) {
    if (!rawToken) return null;
    const token = norm(rawToken);
    if (!token) return null;

    if (/^\d{1,2}$/.test(token)) {
      const pNum = parseInt(token, 10);
      if (pNum >= 1 && pNum <= 81) {
        return _provincesIndex.find((p) => p.plate === pNum) || null;
      }
    }

    const exact = _provincesIndex.find((p) => p._normName === token);
    if (exact) return exact;

    if (token.length >= 2) {
      const prefixMatches = _provincesIndex.filter((p) => p._normName.startsWith(token));
      if (prefixMatches.length > 0) {
        prefixMatches.sort((a, b) => a._normName.length - b._normName.length);
        return prefixMatches[0];
      }
    }
    return null;
  }

  function parseDistanceCalculatorQuery(rawQuery) {
    if (!rawQuery) return null;
    const str = String(rawQuery).trim();
    const match = str.match(/^(.+?)\s*(?:->|→|>|-)\s*(.+)$/);
    if (!match) return null;

    const partA = match[1].trim();
    const partB = match[2].trim();
    if (!partA || !partB) return null;

    const cityA = findProvinceByToken(partA);
    const cityB = findProvinceByToken(partB);
    if (!cityA || !cityB) return null;

    return buildDistanceCalcItem(cityA, cityB);
  }

  function buildDistanceCalcItem(cityA, cityB) {
    if (!cityA || !cityB) return null;
    const distFn = (_ctx && typeof _ctx.calcDistKm === 'function') ? _ctx.calcDistKm : fallbackHaversineKm;
    const isSame = cityA.key === cityB.key;
    const airRaw = (!isSame && Number.isFinite(cityA.lat) && Number.isFinite(cityB.lat))
      ? distFn(cityA.lat, cityA.lng, cityB.lat, cityB.lng)
      : 0;
    const airKm = Math.round(airRaw);
    const roadKm = Math.round(airRaw * ROAD_FACTOR);
    const driveHoursFloat = roadKm / AVG_SPEED_KMH;
    const driveTimeText = isSame ? '0 dk' : formatDriveHours(driveHoursFloat);

    return {
      kind: 'calculator',
      group: '📐 Anlık Plaka & Mesafe Hesaplayıcı',
      score: 999,
      calc: {
        cityA,
        cityB,
        airKm,
        roadKm,
        driveHoursFloat,
        driveTimeText
      }
    };
  }

  function getRecentEntriesForCategory(chipId) {
    const recents = loadRecents();
    if (!recents.length) return [];

    const out = [];
    for (let i = 0; i < recents.length; i++) {
      const rec = recents[i];
      if (!rec) continue;
      if (rec.kind === 'province' && rec.key) {
        if (chipId !== 'all' && chipId !== 'provinces') continue;
        const prov = _provincesIndex.find((p) => p.key === rec.key);
        if (prov) {
          out.push({
            kind: 'province',
            group: '🕘 Son Gezilen & Arananlar',
            isRecentGroup: true,
            item: prov,
            score: 200 - i
          });
        }
      } else if (rec.kind === 'action' && rec.id) {
        if (chipId === 'provinces') continue;
        const act = _actionsIndex.find((a) => a.id === rec.id);
        if (act && matchActionToChip(act, chipId)) {
          out.push({
            kind: 'action',
            group: '🕘 Son Gezilen & Arananlar',
            isRecentGroup: true,
            item: act,
            score: 200 - i
          });
        }
      } else if (rec.kind === 'calculator' && rec.keyA && rec.keyB) {
        if (chipId !== 'all' && chipId !== 'provinces' && chipId !== 'studio') continue;
        const cA = _provincesIndex.find((p) => p.key === rec.keyA);
        const cB = _provincesIndex.find((p) => p.key === rec.keyB);
        if (cA && cB) {
          const calcEntry = buildDistanceCalcItem(cA, cB);
          if (calcEntry) {
            calcEntry.group = '🕘 Son Gezilen & Arananlar';
            calcEntry.isRecentGroup = true;
            out.push(calcEntry);
          }
        }
      }
    }
    return out;
  }

  function scoreAction(action, nq, tokens) {
    if (!tokens.every((t) => action._searchBlob.includes(t))) return 0;

    let score = 35;
    if (action._normTitle === nq) score = 120;
    else if (action._normTitle.startsWith(nq)) score = 105;
    else if (action._normTitle.includes(nq)) score = 88;
    else if (action._normKeywords.includes(nq)) score = 72;
    else if (action._normSub.includes(nq)) score = 55;

    return score;
  }

  function scoreProvince(prov, nq, tokens) {
    if (!tokens.every((t) => prov._searchBlob.includes(t))) {
      return { score: 0, matchHint: null };
    }

    let score = 30;
    let matchHint = null;

    if (nq === prov.plateStr || nq === String(prov.plate)) {
      score = 130;
    } else if (prov._normName === nq) {
      score = 125;
    } else if (prov._normName.startsWith(nq)) {
      score = 110;
    } else if (prov._normName.includes(nq)) {
      score = 92;
    } else {
      const matchedLandmark = prov._normLandmarks.find((l) => l.n.includes(nq) || tokens.some((t) => t.length > 1 && l.n.includes(t)));
      const matchedSpecialty = prov._normSpecialties.find((s) => s.n.includes(nq) || tokens.some((t) => t.length > 1 && s.n.includes(t)));
      const matchedLibrary = prov._normLibrary.includes(nq) || (tokens.length > 0 && tokens.every((t) => prov._normLibrary.includes(t)));

      if (prov._normRegion.includes(nq)) {
        score = 68;
      }
      if (matchedLandmark) {
        score = Math.max(score, 64);
        matchHint = `🏛️ ${matchedLandmark.raw}`;
      }
      if (matchedSpecialty) {
        score = Math.max(score, 60);
        if (!matchHint) matchHint = `🍲 ${matchedSpecialty.raw}`;
      }
      if (matchedLibrary) {
        score = Math.max(score, 52);
        if (!matchHint) {
          const snippet = prov.library.length > 72 ? prov.library.slice(0, 69) + '…' : prov.library;
          matchHint = `📚 ${snippet}`;
        }
      }
    }

    // Slight boost for visited cities on ties
    if (prov.visited) score += 1;

    return { score, matchHint };
  }

  function getFilteredItems(rawQuery) {
    if (!_provincesIndex.length) {
      buildProvincesIndex();
    }

    const nq = norm(rawQuery);
    const chipId = _activeCategory || 'all';

    if (!nq) {
      const results = [];
      const recentEntries = getRecentEntriesForCategory(chipId);
      if (recentEntries.length) {
        results.push(...recentEntries);
      }

      if (chipId === 'provinces') {
        const provItems = _provincesIndex.map((p) => ({
          kind: 'province',
          group: '81 İl & Menziller',
          item: p,
          score: 100
        }));
        results.push(...provItems);
        return results;
      }

      const filteredActions = _actionsIndex
        .filter((a) => {
          if (chipId === 'all' && a.category === 'Anıt & Miras') return false;
          return matchActionToChip(a, chipId);
        })
        .map((a) => ({
          kind: 'action',
          group: chipId === 'monuments' ? '🏛️ 86 Özgün Anıt & Miras' : 'Hızlı Eylemler',
          item: a,
          score: 100
        }));

      results.push(...filteredActions);
      return results;
    }

    const matches = [];

    // 1. Check Quick Math / Plate & Distance Calculator (e.g. "Ankara - Mardin" or "06 - 34" or "İstanbul > Konya")
    const calcResult = parseDistanceCalculatorQuery(rawQuery);
    if (calcResult) {
      matches.push(calcResult);
    }

    const tokens = nq.split(/\s+/).filter(Boolean);

    // 2. Score Actions if category chip allows
    if (chipId !== 'provinces') {
      for (let i = 0; i < _actionsIndex.length; i++) {
        const a = _actionsIndex[i];
        if (!matchActionToChip(a, chipId)) continue;
        const score = scoreAction(a, nq, tokens);
        if (score > 0) {
          matches.push({
            kind: 'action',
            group: 'Hızlı Eylemler',
            item: a,
            score
          });
        }
      }
    }

    // 3. Score Provinces if category chip allows (or if distance calculator matched both cities, also show the 2 provinces)
    if (chipId === 'all' || chipId === 'provinces') {
      for (let i = 0; i < _provincesIndex.length; i++) {
        const p = _provincesIndex[i];
        const { score, matchHint } = scoreProvince(p, nq, tokens);
        if (score > 0) {
          matches.push({
            kind: 'province',
            group: '81 İl & Menziller',
            item: p,
            matchHint,
            score
          });
        }
      }
    }

    // Also include the 2 matched calculator cities right below the calculator card if not already matched
    if (calcResult && (chipId === 'all' || chipId === 'provinces')) {
      const { cityA, cityB } = calcResult.calc;
      if (!matches.some((m) => m.kind === 'province' && m.item.key === cityA.key)) {
        matches.push({
          kind: 'province',
          group: '81 İl & Menziller',
          item: cityA,
          score: 140
        });
      }
      if (cityB.key !== cityA.key && !matches.some((m) => m.kind === 'province' && m.item.key === cityB.key)) {
        matches.push({
          kind: 'province',
          group: '81 İl & Menziller',
          item: cityB,
          score: 139
        });
      }
    }

    matches.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.kind !== b.kind) {
        if (a.kind === 'calculator') return -1;
        if (b.kind === 'calculator') return 1;
        return a.kind === 'province' ? -1 : 1;
      }
      if (a.kind === 'province' && b.kind === 'province') return a.item.plate - b.item.plate;
      if (a.kind === 'action' && b.kind === 'action') return a.item.title.localeCompare(b.item.title, 'tr');
      return 0;
    });

    return matches.slice(0, MAX_SEARCH_RESULTS);
  }

  function renderCalculatorRow(entry, index) {
    const c = entry.calc;
    const selectedClass = index === _selectedIndex ? ' selected' : '';
    const sameRegion = c.cityA.region === c.cityB.region;
    const regionBadge = sameRegion
      ? `${c.cityA.region} İçi`
      : `${c.cityA.region} ➔ ${c.cityB.region}`;

    return `
      <div class="cmd-item cmd-calc-card${selectedClass}" role="option" id="cmd-opt-${index}" data-cmd-index="${index}" aria-selected="${index === _selectedIndex ? 'true' : 'false'}">
        <div class="cmd-calc-top">
          <div class="cmd-calc-route">
            <span class="cmd-plate-badge">${esc(c.cityA.plateStr)}</span>
            <strong class="cmd-calc-city">${esc(c.cityA.name)}</strong>
            <span class="cmd-calc-arrow" aria-hidden="true">⇄</span>
            <span class="cmd-plate-badge">${esc(c.cityB.plateStr)}</span>
            <strong class="cmd-calc-city">${esc(c.cityB.name)}</strong>
            <span class="cmd-pill cmd-pill-region">${esc(regionBadge)}</span>
          </div>
          <span class="cmd-calc-compare-cta">⚖️ Karşılaştırma Stüdyosunda Aç <kbd class="cmd-kbd">↵</kbd></span>
        </div>
        <div class="cmd-calc-metrics">
          <div class="cmd-calc-metric">
            <span class="cmd-calc-metric-lbl">🦅 Kuş Uçuşu</span>
            <span class="cmd-calc-metric-val cyan">${c.airKm.toLocaleString('tr-TR')} km</span>
          </div>
          <div class="cmd-calc-metric">
            <span class="cmd-calc-metric-lbl">🛣️ Karayolu (~1.35x)</span>
            <span class="cmd-calc-metric-val gold">~${c.roadKm.toLocaleString('tr-TR')} km</span>
          </div>
          <div class="cmd-calc-metric">
            <span class="cmd-calc-metric-lbl">🚗 Tahmini Sürüş</span>
            <span class="cmd-calc-metric-val emerald">${esc(c.driveTimeText)}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderActionRow(entry, index) {
    const a = entry.item;
    const selectedClass = index === _selectedIndex ? ' selected' : '';
    return `
      <div class="cmd-item${selectedClass}" role="option" id="cmd-opt-${index}" data-cmd-index="${index}" aria-selected="${index === _selectedIndex ? 'true' : 'false'}">
        <span class="cmd-item-icon" aria-hidden="true">${esc(a.icon)}</span>
        <div class="cmd-item-body">
          <div class="cmd-item-title">${esc(a.title)}</div>
          <div class="cmd-item-sub">${esc(a.subtitle)}</div>
        </div>
        <div class="cmd-item-meta">
          <span class="cmd-pill cmd-pill-action">${esc(a.category)}</span>
          <kbd class="cmd-kbd">↵</kbd>
        </div>
      </div>
    `;
  }

  function renderProvinceRow(entry, index) {
    const p = entry.item;
    const selectedClass = index === _selectedIndex ? ' selected' : '';
    const subText = entry.matchHint || p.defaultSubtitle;
    const statusClass = p.visited ? 'visited' : 'unvisited';
    const statusText = p.visited ? '✓ Gezildi' : '○ Hedef';
    const thumbHtml = p.banner
      ? `<img class="cmd-item-thumb" src="${esc(p.banner)}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.display='none'">`
      : '';

    return `
      <div class="cmd-item${selectedClass}" role="option" id="cmd-opt-${index}" data-cmd-index="${index}" aria-selected="${index === _selectedIndex ? 'true' : 'false'}">
        <div class="cmd-item-visual">
          ${thumbHtml}
          <span class="cmd-plate-badge">${esc(p.plateStr)}</span>
        </div>
        <div class="cmd-item-body">
          <div class="cmd-item-title">${esc(p.name)}</div>
          <div class="cmd-item-sub">${esc(subText)}</div>
        </div>
        <div class="cmd-item-meta">
          <span class="cmd-pill cmd-pill-region">${esc(p.region)}</span>
          <span class="cmd-status ${statusClass}">${statusText}</span>
        </div>
      </div>
    `;
  }

  function syncCategoryChipsUI() {
    if (!_chipsBar) return;
    _chipsBar.querySelectorAll('.cmd-cat-chip').forEach((btn) => {
      const cid = btn.getAttribute('data-cmd-cat');
      const isActive = cid === _activeCategory;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function setCategory(catId) {
    const valid = CATEGORY_CHIPS.some((c) => c.id === catId);
    _activeCategory = valid ? catId : 'all';
    _selectedIndex = 0;
    syncCategoryChipsUI();
    renderList(_input ? _input.value : '');
  }

  function cycleCategory(dir) {
    const idx = CATEGORY_CHIPS.findIndex((c) => c.id === _activeCategory);
    const nextIdx = ((idx + dir) % CATEGORY_CHIPS.length + CATEGORY_CHIPS.length) % CATEGORY_CHIPS.length;
    setCategory(CATEGORY_CHIPS[nextIdx].id);
  }

  function renderList(query) {
    if (!_list) return;

    _currentItems = getFilteredItems(query);
    if (_selectedIndex >= _currentItems.length) {
      _selectedIndex = 0;
    }

    if (_countEl) {
      const qTrim = (query || '').trim();
      _countEl.textContent = qTrim
        ? `${_currentItems.length} eşleşme`
        : `${_actionsIndex.length} hızlı eylem • 81 il`;
    }

    if (!_currentItems.length) {
      _list.innerHTML = `
        <div class="cmd-empty">
          <div class="cmd-empty-icon">🧭</div>
          <div class="cmd-empty-title">"${esc(query)}" için sonuç bulunamadı</div>
          <div class="cmd-empty-sub">İl adı, plaka kodu (ör. 06), mesafe hesabı (Ankara - Mardin veya 06 - 34), lezzet veya stüdyo deneyin.</div>
        </div>
      `;
      if (_input) _input.removeAttribute('aria-activedescendant');
      return;
    }

    const qTrim = (query || '').trim();
    let html = '';
    let lastGroup = null;

    for (let i = 0; i < _currentItems.length; i++) {
      const entry = _currentItems[i];
      const shouldShowGroupHeader = (!qTrim || entry.kind === 'calculator') && entry.group !== lastGroup;
      if (shouldShowGroupHeader) {
        lastGroup = entry.group;
        if (entry.isRecentGroup) {
          html += `
            <div class="cmd-group-label cmd-group-label-row">
              <span>${esc(entry.group)}</span>
              <button type="button" class="cmd-clear-recent-btn" data-cmd-clear-recent="1" title="Son aramaları ve gezilen görünümleri temizle">Temizle</button>
            </div>
          `;
        } else {
          html += `<div class="cmd-group-label">${esc(entry.group)}</div>`;
        }
      }
      if (entry.kind === 'calculator') {
        html += renderCalculatorRow(entry, i);
      } else if (entry.kind === 'province') {
        html += renderProvinceRow(entry, i);
      } else {
        html += renderActionRow(entry, i);
      }
    }

    _list.innerHTML = html;
    if (_input && _currentItems.length) {
      _input.setAttribute('aria-activedescendant', `cmd-opt-${_selectedIndex}`);
    }
  }

  function updateSelection(newIndex, shouldScroll) {
    if (!_currentItems.length || !_list) return;
    const len = _currentItems.length;
    _selectedIndex = ((newIndex % len) + len) % len;

    const prev = _list.querySelector('.cmd-item.selected');
    if (prev) {
      prev.classList.remove('selected');
      prev.setAttribute('aria-selected', 'false');
    }

    const next = _list.querySelector(`.cmd-item[data-cmd-index="${_selectedIndex}"]`);
    if (next) {
      next.classList.add('selected');
      next.setAttribute('aria-selected', 'true');
      if (shouldScroll && typeof next.scrollIntoView === 'function') {
        next.scrollIntoView({ block: 'nearest' });
      }
      if (_input) {
        _input.setAttribute('aria-activedescendant', next.id);
      }
    }
  }

  function openCitiesInCompareStudio(cityA, cityB) {
    if (!cityA || !cityB) return;
    if (_ctx && _ctx.state) {
      _ctx.state.compareCityA = cityA.key;
      _ctx.state.compareCityB = cityB.key;
    }
    safeCall('openView', 'compare');
    setTimeout(() => {
      const selA = document.getElementById('compare-select-a');
      const selB = document.getElementById('compare-select-b');
      if (selA && selA.value !== cityA.key) {
        selA.value = cityA.key;
        selA.dispatchEvent(new Event('change'));
      }
      if (selB && selB.value !== cityB.key) {
        selB.value = cityB.key;
        selB.dispatchEvent(new Event('change'));
      }
    }, 30);
  }

  function executeItem(index) {
    const entry = _currentItems[index];
    if (!entry) return;

    recordRecentItem(entry);
    close();

    if (entry.kind === 'calculator' && entry.calc) {
      openCitiesInCompareStudio(entry.calc.cityA, entry.calc.cityB);
    } else if (entry.kind === 'province') {
      safeCall('selectCity', entry.item.key);
    } else if (entry.kind === 'action' && typeof entry.item.run === 'function') {
      entry.item.run();
    }
  }

  function injectStyles() {
    if (typeof document === 'undefined' || !document.head) return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cmd-subbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 14px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(15, 23, 42, 0.55);
        overflow-x: auto;
        scrollbar-width: none;
      }
      .cmd-subbar::-webkit-scrollbar {
        display: none;
      }
      .cmd-cat-chips {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: nowrap;
      }
      .cmd-cat-chip {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(30, 41, 59, 0.65);
        color: var(--text-secondary, #94a3b8);
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.75rem;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.18s ease;
      }
      .cmd-cat-chip:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(0, 242, 254, 0.42);
        background: rgba(30, 41, 59, 0.92);
      }
      .cmd-cat-chip.active {
        color: #ffffff;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.24) 0%, rgba(79, 172, 254, 0.24) 100%);
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 14px rgba(0, 242, 254, 0.2);
      }
      .cmd-tab-hint {
        font-size: 0.68rem;
        color: var(--text-muted, #64748b);
        white-space: nowrap;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .cmd-group-label-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .cmd-clear-recent-btn {
        appearance: none;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.68rem;
        font-weight: 700;
        padding: 2px 9px;
        border-radius: 999px;
        cursor: pointer;
        transition: all 0.16s ease;
      }
      .cmd-clear-recent-btn:hover {
        color: #f8fafc;
        border-color: rgba(239, 68, 68, 0.55);
        background: rgba(239, 68, 68, 0.18);
      }
      .cmd-calc-card {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 10px !important;
        padding: 13px 15px !important;
        border-radius: 14px !important;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.12) 0%, rgba(245, 158, 11, 0.1) 100%) !important;
        border: 1px solid rgba(0, 242, 254, 0.38) !important;
      }
      .cmd-calc-card.selected,
      .cmd-calc-card:hover {
        border-color: var(--accent-cyan, #00f2fe) !important;
        box-shadow: 0 8px 24px -8px rgba(0, 242, 254, 0.28) !important;
      }
      .cmd-calc-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }
      .cmd-calc-route {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-wrap: wrap;
      }
      .cmd-calc-city {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.96rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }
      .cmd-calc-arrow {
        color: var(--accent-cyan, #00f2fe);
        font-weight: 800;
      }
      .cmd-calc-compare-cta {
        font-size: 0.74rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .cmd-calc-metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }
      .cmd-calc-metric {
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 7px 10px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .cmd-calc-metric-lbl {
        font-size: 0.67rem;
        color: var(--text-secondary, #94a3b8);
      }
      .cmd-calc-metric-val {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.92rem;
        font-weight: 800;
      }
      .cmd-calc-metric-val.cyan { color: var(--accent-cyan, #00f2fe); }
      .cmd-calc-metric-val.gold { color: var(--accent-gold, #f59e0b); }
      .cmd-calc-metric-val.emerald { color: var(--accent-emerald, #10b981); }

      body.light-theme .cmd-subbar {
        background: rgba(241, 245, 249, 0.92);
        border-bottom-color: rgba(15, 23, 42, 0.09);
      }
      body.light-theme .cmd-cat-chip {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.12);
        color: #475569;
      }
      body.light-theme .cmd-cat-chip:hover {
        color: #0f172a;
        border-color: #0284c7;
      }
      body.light-theme .cmd-cat-chip.active {
        background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
        border-color: #0284c7;
        color: #ffffff;
      }
      body.light-theme .cmd-clear-recent-btn {
        background: rgba(15, 23, 42, 0.05);
        border-color: rgba(15, 23, 42, 0.14);
        color: #475569;
      }
      body.light-theme .cmd-calc-card {
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(245, 158, 11, 0.1) 100%) !important;
        border-color: rgba(2, 132, 199, 0.38) !important;
      }
      body.light-theme .cmd-calc-city {
        color: #0f172a;
      }
      body.light-theme .cmd-calc-compare-cta {
        color: #0369a1;
      }
      body.light-theme .cmd-calc-metric {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(15, 23, 42, 0.1);
      }
      @media (max-width: 560px) {
        .cmd-calc-metrics {
          grid-template-columns: 1fr;
        }
        .cmd-tab-hint {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function injectDOM() {
    injectStyles();
    let existing = document.getElementById('cmd-palette-overlay');
    if (existing) {
      _overlay = existing;
      _input = existing.querySelector('#cmd-palette-input');
      _list = existing.querySelector('#cmd-palette-list');
      _countEl = existing.querySelector('#cmd-palette-count');
      _chipsBar = existing.querySelector('#cmd-palette-chips');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'cmd-palette-overlay';
    overlay.className = 'cmd-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Hızlı Komut ve Şehir Arama');
    overlay.setAttribute('aria-hidden', 'true');

    const chipsHtml = CATEGORY_CHIPS.map((c) => {
      const isAct = c.id === _activeCategory;
      return `<button type="button" class="cmd-cat-chip${isAct ? ' active' : ''}" role="tab" aria-selected="${isAct ? 'true' : 'false'}" data-cmd-cat="${esc(c.id)}">${esc(c.label)}</button>`;
    }).join('');

    overlay.innerHTML = `
      <div class="cmd-box" role="document">
        <div class="cmd-input-wrap">
          <span class="cmd-search-icon" aria-hidden="true">⌘</span>
          <input
            id="cmd-palette-input"
            class="cmd-input"
            type="text"
            autocomplete="off"
            spellcheck="false"
            placeholder="Şehir, plaka (06), mesafe (Ankara - Mardin / 06 - 34) veya stüdyo ara..."
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-palette-list"
            aria-autocomplete="list"
          />
          <span id="cmd-palette-count" class="cmd-count"></span>
          <kbd class="cmd-kbd">ESC</kbd>
        </div>
        <div class="cmd-subbar">
          <div id="cmd-palette-chips" class="cmd-cat-chips" role="tablist" aria-label="Kategori Filtreleri">
            ${chipsHtml}
          </div>
          <span class="cmd-tab-hint"><kbd class="cmd-kbd">Tab</kbd> Kategori</span>
        </div>
        <div id="cmd-palette-list" class="cmd-list" role="listbox" aria-label="Arama sonuçları"></div>
        <div class="cmd-footer">
          <div class="cmd-footer-hints">
            <span><kbd class="cmd-kbd">↑</kbd><kbd class="cmd-kbd">↓</kbd> Gezin</span>
            <span><kbd class="cmd-kbd">Tab</kbd> Filtre</span>
            <span><kbd class="cmd-kbd">↵</kbd> Aç</span>
            <span><kbd class="cmd-kbd">ESC</kbd> Kapat</span>
          </div>
          <div class="cmd-footer-brand">Dijital Seyyah • Spotlight</div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    _overlay = overlay;
    _input = overlay.querySelector('#cmd-palette-input');
    _list = overlay.querySelector('#cmd-palette-list');
    _countEl = overlay.querySelector('#cmd-palette-count');
    _chipsBar = overlay.querySelector('#cmd-palette-chips');

    // Close when clicking backdrop
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close();
      }
    });

    // Category chip clicks
    if (_chipsBar) {
      _chipsBar.addEventListener('click', (e) => {
        const chipBtn = e.target.closest('.cmd-cat-chip[data-cmd-cat]');
        if (!chipBtn) return;
        const catId = chipBtn.getAttribute('data-cmd-cat');
        setCategory(catId);
        if (_input) _input.focus();
      });
    }

    // Live filtering
    if (_input) {
      _input.addEventListener('input', (e) => {
        _selectedIndex = 0;
        renderList(e.target.value);
      });
    }

    // Delegate hover & click on list items + clear recents button
    if (_list) {
      _list.addEventListener('click', (e) => {
        const clearBtn = e.target.closest('[data-cmd-clear-recent]');
        if (clearBtn) {
          e.stopPropagation();
          clearRecents();
          if (_input) _input.focus();
          return;
        }
        const itemEl = e.target.closest('.cmd-item');
        if (!itemEl) return;
        const idx = Number(itemEl.getAttribute('data-cmd-index'));
        if (!Number.isNaN(idx)) {
          executeItem(idx);
        }
      });

      _list.addEventListener('mousemove', (e) => {
        const itemEl = e.target.closest('.cmd-item');
        if (!itemEl) return;
        const idx = Number(itemEl.getAttribute('data-cmd-index'));
        if (!Number.isNaN(idx) && idx !== _selectedIndex) {
          updateSelection(idx, false);
        }
      });
    }
  }

  function handleGlobalKeydown(e) {
    const key = e.key || '';
    const isCtrlOrCmdK = (e.ctrlKey || e.metaKey) && !e.altKey && key.toLowerCase() === 'k';

    if (isCtrlOrCmdK) {
      e.preventDefault();
      e.stopPropagation();
      if (_isOpen) {
        close();
      } else {
        open();
      }
      return;
    }

    if (!_isOpen) return;

    if (key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (key === 'Tab') {
      e.preventDefault();
      cycleCategory(e.shiftKey ? -1 : 1);
    } else if (key === 'ArrowDown') {
      e.preventDefault();
      updateSelection(_selectedIndex + 1, true);
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      updateSelection(_selectedIndex - 1, true);
    } else if (key === 'Enter') {
      e.preventDefault();
      executeItem(_selectedIndex);
    }
  }

  function open() {
    if (!_overlay) {
      injectDOM();
    }
    if (!_actionsIndex.length) {
      buildActionsIndex();
    }
    if (!_provincesIndex.length) {
      buildProvincesIndex();
    }

    _lastActiveElement = document.activeElement;
    _isOpen = true;
    _selectedIndex = 0;
    _activeCategory = 'all';
    syncCategoryChipsUI();

    if (_input) {
      _input.value = '';
    }
    renderList('');

    _overlay.classList.add('active');
    _overlay.setAttribute('aria-hidden', 'false');

    if (_input) {
      requestAnimationFrame(() => {
        _input.focus();
      });
    }
  }

  function close() {
    if (!_isOpen && (!_overlay || !_overlay.classList.contains('active'))) return;
    _isOpen = false;
    if (_overlay) {
      _overlay.classList.remove('active');
      _overlay.setAttribute('aria-hidden', 'true');
    }
    if (_lastActiveElement && typeof _lastActiveElement.focus === 'function' && document.contains(_lastActiveElement)) {
      try {
        _lastActiveElement.focus();
      } catch (err) {}
    }
    _lastActiveElement = null;
  }

  function init(ctx) {
    _ctx = ctx || {};
    buildActionsIndex();
    buildProvincesIndex();
    injectDOM();

    if (!_initialized) {
      document.addEventListener('keydown', handleGlobalKeydown, true);
      _initialized = true;
    }
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.commandPalette = {
    init,
    open,
    close
  };
})();
