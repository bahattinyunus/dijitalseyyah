/**
 * Anadolu Seyahatnamesi — Spotlight Command Palette (Ctrl+K / Cmd+K)
 * Zero-dependency, ultra-fast Turkish-aware search over Quick Actions & 81 Provinces.
 * Registers on window.SEYYAH_MODULES.commandPalette
 */
(function () {
  'use strict';

  const MAX_SEARCH_RESULTS = 14;

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

  let _ctx = null;
  let _overlay = null;
  let _input = null;
  let _list = null;
  let _countEl = null;
  let _isOpen = false;
  let _initialized = false;
  let _selectedIndex = 0;
  let _currentItems = [];
  let _actionsIndex = [];
  let _provincesIndex = [];
  let _lastActiveElement = null;

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
    if (!nq) {
      // Empty query: show Quick Actions (all 15) so everything is one click away
      return _actionsIndex.map((a) => ({
        kind: 'action',
        group: 'Hızlı Eylemler',
        item: a,
        score: 100
      }));
    }

    const tokens = nq.split(/\s+/).filter(Boolean);
    const matches = [];

    for (let i = 0; i < _actionsIndex.length; i++) {
      const a = _actionsIndex[i];
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

    matches.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.kind !== b.kind) return a.kind === 'province' ? -1 : 1;
      if (a.kind === 'province') return a.item.plate - b.item.plate;
      return a.item.title.localeCompare(b.item.title, 'tr');
    });

    return matches.slice(0, MAX_SEARCH_RESULTS);
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
          <div class="cmd-empty-sub">İl adı, plaka kodu (ör. 06), bölge, yöresel lezzet, tarihi eser veya kütüphane adı deneyin.</div>
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
      if (!qTrim && entry.group !== lastGroup) {
        lastGroup = entry.group;
        html += `<div class="cmd-group-label">${esc(entry.group)}</div>`;
      }
      html += entry.kind === 'province'
        ? renderProvinceRow(entry, i)
        : renderActionRow(entry, i);
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

  function executeItem(index) {
    const entry = _currentItems[index];
    if (!entry) return;

    close();

    if (entry.kind === 'province') {
      safeCall('selectCity', entry.item.key);
    } else if (entry.kind === 'action' && typeof entry.item.run === 'function') {
      entry.item.run();
    }
  }

  function injectDOM() {
    let existing = document.getElementById('cmd-palette-overlay');
    if (existing) {
      _overlay = existing;
      _input = existing.querySelector('#cmd-palette-input');
      _list = existing.querySelector('#cmd-palette-list');
      _countEl = existing.querySelector('#cmd-palette-count');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'cmd-palette-overlay';
    overlay.className = 'cmd-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Hızlı Komut ve Şehir Arama');
    overlay.setAttribute('aria-hidden', 'true');

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
            placeholder="Şehir, plaka (06), lezzet, kütüphane veya eylem ara..."
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-palette-list"
            aria-autocomplete="list"
          />
          <span id="cmd-palette-count" class="cmd-count"></span>
          <kbd class="cmd-kbd">ESC</kbd>
        </div>
        <div id="cmd-palette-list" class="cmd-list" role="listbox" aria-label="Arama sonuçları"></div>
        <div class="cmd-footer">
          <div class="cmd-footer-hints">
            <span><kbd class="cmd-kbd">↑</kbd><kbd class="cmd-kbd">↓</kbd> Gezin</span>
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

    // Close when clicking backdrop
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close();
      }
    });

    // Live filtering
    if (_input) {
      _input.addEventListener('input', (e) => {
        _selectedIndex = 0;
        renderList(e.target.value);
      });
    }

    // Delegate hover & click on list items
    if (_list) {
      _list.addEventListener('click', (e) => {
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
