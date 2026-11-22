/**
 * Anadolu Seyahatnamesi — Sıradaki Büyük Sefer: Mezopotamya (Güneydoğu Anadolu 0/9 İl) Özel Komuta Merkezi
 * Flagship Expedition Studio covering the 9 unvisited provinces of 07_GuneydoguAnadolu:
 * Gaziantep ➔ Kilis ➔ Adıyaman ➔ Şanlıurfa ➔ Diyarbakır ➔ Mardin ➔ Batman ➔ Siirt ➔ Şırnak
 *
 * Registers on: window.SEYYAH_MODULES.mesopotamia = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-mesopotamia-styles';
  const PREP_STORAGE_KEY = 'seyyah_mezopotamya_prep_v1';
  const DAILY_HOTEL_RATE_TL = 2200;
  const DAYS_PER_CITY = 5;
  const LIB_HOURS_PER_DAY = 4;
  const ROAD_DETOUR_FACTOR = 1.35;

  // ---------------------------------------------------------------------------
  // Canonical 9-Stop Mesopotamia 2-Opt Corridor Definition + Curated Heritage
  // ---------------------------------------------------------------------------
  const MESOPOTAMIA_STOPS = [
    {
      key: '07_GuneydoguAnadolu/Gaziantep',
      slug: 'Gaziantep',
      name: 'Gaziantep',
      plate: 27,
      lat: 37.0662,
      lng: 37.3833,
      labelOffset: { dx: -16, dy: -16, anchor: 'end' },
      accent: '#f59e0b',
      eraBadge: 'Zeugma & İpek Yolu Kapısı',
      historySummary:
        'Hititlerden Kommagene ve Roma’nın Zeugma’sına, Memlüklerden Osmanlı’nın "Ayıntab" loncalarına ve Millî Mücadele’nin Gazi unvanına uzanan zanaat ve direniş şehri.',
      spiritualHeritage:
        'Şahinbey ve Karayılan’ın şehadet ruhu, Ökkeşiye geleneği, asırlık Bakırcılar ve Tahmis Kahvesi irfanı ile Fırat üzerindeki Rumkale’nin kadim manastır-kale mirası.',
      kykNote: 'Gaziantep İl Halk Kütüphanesi & Hasan Celal Güzel Kütüphanesi (20 saat mesai) • Şahinbey / Şehitkâmil GSB KYK yurtları.',
      defaultQuote: 'UNESCO Gastronomi Şehri; Zeugma’nın Çingene Kızı mozaiğinin derin bakışları ve asırlık hanların kahve kokusu.',
      defaultLibrary: 'Gaziantep İl Halk Kütüphanesi / Hasan Celal Güzel Kütüphanesi - Modern donanımlı ve dinamik çalışma atmosferi.',
      defaultLandmarks: ['Zeugma Mozaik Müzesi (Çingene Kızı)', 'Gaziantep Kalesi', 'Bakırcılar Çarşısı', 'Tahmis Kahvesi', 'Rumkale'],
      defaultSpecialties: ['Gaziantep Baklavası', 'Ali Nazik', 'Beyran Çorbası', 'Katmer', 'Küşleme', 'Menengiç Kahvesi']
    },
    {
      key: '07_GuneydoguAnadolu/Kilis',
      slug: 'Kilis',
      name: 'Kilis',
      plate: 79,
      lat: 36.7184,
      lng: 37.1212,
      labelOffset: { dx: -14, dy: 22, anchor: 'end' },
      accent: '#10b981',
      eraBadge: 'Oylum Höyük & Kabaltı Sokakları',
      historySummary:
        'Tunç Çağı’nın dev merkezi Oylum Höyük’ten Haçlı-Eyyûbî mücadelesinin Ravanda Kalesi’ne ve Halep sancağının âlimler diyarı kabaltılı taş konaklarına uzanan kadim sınır eşiği.',
      spiritualHeritage:
        'Sahabe Şurahbil bin Hasene Türbesi ve Makamı, Şeyh Mansur ve Ulu Cami çevresinde şekillenen hudut boyu tevazusu ve ilim geleneği.',
      kykNote: 'Kilis İl Halk Kütüphanesi (20 saat mesai) • GSB Seyahatsever Kilis KYK Yurdu (0 ₺).',
      defaultQuote: 'Zeytin ağaçlarının gölgesinde kadim kabaltılı sokaklar, lezzetli Kilis Tavası ve sınır boyunun sıcak insanları.',
      defaultLibrary: 'Kilis İl Halk Kütüphanesi - Samimi ve sessiz çalışma ortamı.',
      defaultLandmarks: ['Ravanda Kalesi', 'Oylum Höyük', 'Kilis Tarihi Taş Evleri ve Kabaltıları', 'Ulu Cami'],
      defaultSpecialties: ['Kilis Tavası', 'Cennet Çamuru Tatlısı', 'Kilis Katmeri', 'Zeytinyağı']
    },
    {
      key: '07_GuneydoguAnadolu/Adiyaman',
      slug: 'Adiyaman',
      name: 'Adıyaman',
      plate: 2,
      lat: 37.7648,
      lng: 38.2786,
      labelOffset: { dx: 0, dy: -16, anchor: 'middle' },
      accent: '#fb923c',
      eraBadge: 'Kommagene & Nemrut Tahtı',
      historySummary:
        '2.150 metre rakımlı Nemrut Dağı’ndaki Kommagene Krallığı tapınaklarından Roma’nın Cendere Köprüsü’ne, Perre kaya mezarlarından Hısn-ı Mansur’a uzanan görkemli tarih sahnesi.',
      spiritualHeritage:
        'Samsat’ta medfun Sahabe Safvan bin Muattal (r.a.) Hazretleri Külliyesi ve Nemrut zirvesinde gün doğumuyla fâniliği düşündüren tefekkür iklimi.',
      kykNote: 'Adıyaman İl Halk Kütüphanesi (20 saat mesai) • Nemrut şafak çıkışı için hafta sonu esnek planlama.',
      defaultQuote: 'Kommagene Krallığı’nın tanrı heykelleriyle bezeli Nemrut Zirvesi ve güneşin en görkemli doğup battığı taht.',
      defaultLibrary: 'Adıyaman İl Halk Kütüphanesi - Nemrut’un gölgesinde huzurlu çalışma alanı.',
      defaultLandmarks: ['Nemrut Dağı Heykelleri (Gündoğumu/Batımı)', 'Cendere Köprüsü', 'Arsemia Ören Yeri', 'Karakuş Tümülüsü', 'Perre Antik Kenti'],
      defaultSpecialties: ['Adıyaman Çiğ Köftesi', 'Besni Tavası', 'Meyir Çorbası', 'Buhara Pilavı']
    },
    {
      key: '07_GuneydoguAnadolu/Sanliurfa',
      slug: 'Sanliurfa',
      name: 'Şanlıurfa',
      plate: 63,
      lat: 37.1674,
      lng: 38.7938,
      labelOffset: { dx: 0, dy: 23, anchor: 'middle' },
      accent: '#f59e0b',
      eraBadge: 'Tarihin Sıfır Noktası & Nebiler Şehri',
      historySummary:
        '12.000 yıllık Göbeklitepe ve Karahantepe ile insanlık tarihini baştan yazan, Harran Üniversitesi ile İslam bilim çağını aydınlatan ve Edessa’dan Urfa’ya kesintisiz yaşayan kadim şehir.',
      spiritualHeritage:
        'Hz. İbrahim’in (a.s.) ateşinin gül bahçesine dönüştüğü Balıklıgöl (Halil-ür Rahman), Hz. Eyyüb Sabır Makamı, Hz. Şuayb (Şuayb Şehri) ve Şair Nâbî’nin edep mirası.',
      kykNote: 'Şanlıurfa İl Halk Kütüphanesi (20 saat mesai) • Harran & Göbeklitepe sabah serinliğinde ziyaret.',
      defaultQuote: 'Peygamberler şehri; Hz. İbrahim’in ateşinin gül bahçesine dönüştüğü Balıklıgöl ve insanlık tarihinin sıfır noktası Göbeklitepe.',
      defaultLibrary: 'Şanlıurfa İl Halk Kütüphanesi - Peygamberler şehrinde zengin araştırma kaynakları.',
      defaultLandmarks: ['Göbeklitepe (Tarihin Sıfır Noktası)', 'Balıklıgöl (Halil-ür Rahman)', 'Şanlıurfa Kalesi', 'Harran Kümbet Evleri', 'Karahantepe', 'Gümrük Hanı'],
      defaultSpecialties: ['Urfa Kebabı', 'Çiğ Köfte', 'Lahmacun', 'Şıllık Tatlısı', 'Mırra', 'Borani']
    },
    {
      key: '07_GuneydoguAnadolu/Diyarbakir',
      slug: 'Diyarbakir',
      name: 'Diyarbakır',
      plate: 21,
      lat: 37.9144,
      lng: 40.2306,
      labelOffset: { dx: -8, dy: -16, anchor: 'middle' },
      accent: '#38bdf8',
      eraBadge: '33 Medeniyet & Bazalt Surlar',
      historySummary:
        'UNESCO Dünya Mirası 5,8 km’lik kara bazalt surları, 8 bin yıllık Hevsel Bahçeleri, Artuklu’nun On Gözlü Köprüsü ve El-Cezerî’nin bilimsel saray atölyeleriyle Dicle’nin kalbi.',
      spiritualHeritage:
        'İslam âleminin 5. Harem-i Şerîfi sayılan Diyarbakır Ulu Camii, İçkale Hz. Süleyman Camii’ndeki 27 Sahabe kabri ve Eğil’de peygamber makamları (Hz. Zülkifl & Hz. Elyesa).',
      kykNote: 'Diyarbakır İl Halk Kütüphanesi / Sur İlçe Kütüphanesi (20 saat mesai) • Suriçi yürüyüş rotası.',
      defaultQuote: 'Kara bazalt taşlı asırlık surlar, sahabe mezarları ve İslam aleminin 5. Harem-i Şerifi sayılan Ulu Camii.',
      defaultLibrary: 'Diyarbakır İl Halk Kütüphanesi / Sur İlçe Kütüphanesi - Tarihi surların gölgesinde kadim bilgi ocağı.',
      defaultLandmarks: ['Diyarbakır Surları (UNESCO)', 'Hevsel Bahçeleri', 'Ulu Cami (İslam\'ın 5. Harem-i Şerifi)', 'On Gözlü Köprü', 'Dört Ayaklı Minare', 'Cahit Sıtkı Tarancı Müzesi'],
      defaultSpecialties: ['Diyarbakır Ciğeri', 'Kaburga Dolması', 'Burma Kadayıf', 'Diyarbakır Karpuzu', 'Meftune']
    },
    {
      key: '07_GuneydoguAnadolu/Mardin',
      slug: 'Mardin',
      name: 'Mardin',
      plate: 47,
      lat: 37.3212,
      lng: 40.7245,
      labelOffset: { dx: 0, dy: 23, anchor: 'middle' },
      accent: '#fbbf24',
      eraBadge: 'Sarı Kalker & Medeniyetler Sofrası',
      historySummary:
        'Mezopotamya ovasına nazır basamaklı sarı kalker evleri, abbaralı sokakları, Artuklu’nun taş işçiliği şaheseri medreseleri ve Doğu Roma’nın Dara Antik Kenti ile zamanın durduğu şehir.',
      spiritualHeritage:
        'Deyrulzafaran Manastırı ve Mor Gabriel’in binlerce yıllık Süryani dua mirası, Kasımiye ve Zinciriye Medreseleri’ndeki kozmolojik su havuzları ile Mardin Ulu Camii.',
      kykNote: 'Mardin İl Halk Kütüphanesi (20 saat mesai) • Artuklu & Midyat hattı arası 1 saatlik ulaşım.',
      defaultQuote: 'Gündüzü seyran, gecesi gerdanlık; Mezopotamya ovasına tepeden bakan sarı kalker taşlı masal diyarı.',
      defaultLibrary: 'Mardin İl Halk Kütüphanesi - Taş mimarisi ve Mezopotamya ovasına bakan avlusuyla seyyah yazılımcıya ilham kaynağı.',
      defaultLandmarks: ['Mardin Taş Evleri', 'Deyrulzafaran Manastırı', 'Kasımiye Medresesi', 'Mardin Ulu Cami', 'Dara Antik Kenti', 'Midyat Konukevi'],
      defaultSpecialties: ['Mardin Kebabı', 'Sembusek', 'İrok (Mardin İçli Köftesi)', 'Süryani Şarabı/Çöreği', 'Mavi Badem Şekeri']
    },
    {
      key: '07_GuneydoguAnadolu/Batman',
      slug: 'Batman',
      name: 'Batman',
      plate: 72,
      lat: 37.8812,
      lng: 41.1294,
      labelOffset: { dx: 8, dy: 22, anchor: 'start' },
      accent: '#00f2fe',
      eraBadge: '12 Bin Yıllık Hasankeyf & Dicle',
      historySummary:
        'Dicle Nehri kıyısında 12 bin yıllık mağara yerleşimi Hasankeyf, Akkoyunlu turkuaz çinili Zeynel Bey Türbesi ve Artuklu mühendislik harikası Malabadi Köprüsü’nün diyarı.',
      spiritualHeritage:
        'İmam Abdullah Zaviyesi, Mor Kiryakus Manastırı, Zeynel Bey Türbesi’nin Semerkant esintili ruhu ve Dicle suyuna karşı zamanı tefekkür durağı.',
      kykNote: 'Batman İl Halk Kütüphanesi (20 saat mesai) • Hasankeyf & Malabadi günübirlik hat.',
      defaultQuote: 'Dicle Nehri’nin bağrından doğan 12 bin yıllık Hasankeyf mağaraları ve Zeynel Bey Türbesi’nin turkuaz çinileri.',
      defaultLibrary: 'Batman İl Halk Kütüphanesi - Dicle kıyısında modern çalışma salonları.',
      defaultLandmarks: ['Hasankeyf Tarihi Kenti', 'Zeynel Bey Türbesi', 'Malabadi Köprüsü', 'Mor Kiryakus Manastırı'],
      defaultSpecialties: ['Batman Kütülk (İçli Köfte)', 'Şam Börek', 'Tırşık', 'Hevra Ekmeği']
    },
    {
      key: '07_GuneydoguAnadolu/Siirt',
      slug: 'Siirt',
      name: 'Siirt',
      plate: 56,
      lat: 37.9333,
      lng: 41.9500,
      labelOffset: { dx: 12, dy: -15, anchor: 'start' },
      accent: '#a855f7',
      eraBadge: 'Tillo İlim & Astronomi Havzası',
      historySummary:
        'Botan Kanyonu’nun sarp yamaçları üzerinde şekillenen, Selçuklu minareli Ulu Camii’si ve 18. yüzyılda Tillo’da kurulan ilim-astronomi medresesiyle marifet merkezi.',
      spiritualHeritage:
        'Baykan’da Veysel Karânî Hazretleri Türbesi, Tillo’da Erzurumlu İbrâhîm Hakkı Hazretleri & İsmail Fakirullah Türbesi ile ekinoksta gerçekleşen Işık Hadisesi.',
      kykNote: 'Siirt İl Halk Kütüphanesi (20 saat mesai) • Tillo & Veysel Karânî ziyaretleri + Botan Rasıl Hacar.',
      defaultQuote: 'İlim ve irfan beldesi Tillo’daki güneş hadisesi, Veysel Karani Hazretleri’nin aşkı ve sarp Botan Kanyonu.',
      defaultLibrary: 'Siirt İl Halk Kütüphanesi - Tillo’nun manevi atmosferinde sakin çalışma alanı.',
      defaultLandmarks: ['İsmail Fakirullah & İbrahim Hakkı Türbesi (Işık Hadisesi - Tillo)', 'Veysel Karani Türbesi', 'Siirt Ulu Cami', 'Rasıl Hacar (Delikli Taş)'],
      defaultSpecialties: ['Büryan Kebabı', 'Perde Pilavı', 'Siirt Fıstığı', 'Tayfi Üzümü']
    },
    {
      key: '07_GuneydoguAnadolu/Sirnak',
      slug: 'Sirnak',
      name: 'Şırnak',
      plate: 73,
      lat: 37.5164,
      lng: 42.4594,
      labelOffset: { dx: 0, dy: 23, anchor: 'middle' },
      accent: '#34d399',
      eraBadge: 'Cudi & Sibernetiğin Doğuşu',
      historySummary:
        'Tufan sonrası insanlığın yeniden filizlendiği Cudi Dağı etekleri, Kasrik Boğazı ve Cizre’de Artuklu döneminin bilim ve edebiyat merkezini yaşatan final menzil.',
      spiritualHeritage:
        'Hz. Nuh’un gemisinin oturduğu Cudi Dağı & Hz. Nuh Türbesi, sibernetik ve robotiğin kurucusu İsmail Ebul-İz El-Cezerî Türbesi, Kırmızı Medrese ve Mem û Zîn.',
      kykNote: 'Şırnak İl Halk Kütüphanesi (20 saat mesai) • 45. gün sonunda 48/81 İl & 7/7 Bölge zaferi!',
      defaultQuote: 'Hz. Nuh’un gemisinin oturduğu Cudi Dağı, sibernetiğin kurucusu El-Cezeri’nin memleketi ve Mem û Zîn destanı.',
      defaultLibrary: 'Şırnak İl Halk Kütüphanesi - Cudi eteklerinde sessiz ve düzenli çalışma alanı.',
      defaultLandmarks: ['Cudi Dağı (Hz. Nuh\'un Gemisi)', 'Kırmızı Medrese (Cizre)', 'Mem û Zîn Türbesi', 'İsmail Ebul-İz El-Cezeri Türbesi', 'Kasrik Boğazı'],
      defaultSpecialties: ['Kutlık', 'Serbıdev', 'Hekeheşandi', 'Suryaz']
    }
  ];

  // ---------------------------------------------------------------------------
  // Module-scoped UI State
  // ---------------------------------------------------------------------------
  const uiState = {
    direction: 'west-to-east', // 'west-to-east' (Gaziantep -> Sirnak) | 'east-to-west'
    selectedKey: '07_GuneydoguAnadolu/Gaziantep',
    dossierFilter: 'all', // 'all' | 'firat' (first 4) | 'dicle' (last 5)
    aiSeason: 'ilkbahar',
    aiFocus: 'dengeli',
    aiCustomNote: '',
    aiGenerating: false,
    aiText: '',
    aiSourceLabel: '',
    aiModel: ''
  };

  // ---------------------------------------------------------------------------
  // Helpers & Math
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

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371.0;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function cleanQuote(raw) {
    if (!raw) return '';
    return String(raw).replace(/\*\*/g, '').replace(/\*/g, '');
  }

  function readPrepState() {
    try {
      const raw = localStorage.getItem(PREP_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writePrepState(obj) {
    try {
      localStorage.setItem(PREP_STORAGE_KEY, JSON.stringify(obj));
    } catch (_) {}
  }

  function formatTL(num) {
    return `${Number(num || 0).toLocaleString('tr-TR')} ₺`;
  }

  function renderMarkdownFallback(md, esc) {
    if (!md) return '';
    const lines = String(md).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let inUl = false;
    let inOl = false;

    function closeLists() {
      if (inUl) {
        out.push('</ul>');
        inUl = false;
      }
      if (inOl) {
        out.push('</ol>');
        inOl = false;
      }
    }

    function fmtInline(txt) {
      let s = esc(txt);
      s = s.replace(/`([^`]+?)`/g, '<code>$1</code>');
      s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/(^|[^\w*])\*([^\s*][^*]*?[^\s*])\*(?=[^\w*]|$)/g, '$1<em>$2</em>');
      return s;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        closeLists();
        continue;
      }
      const h = line.match(/^(#{1,4})\s+(.+)$/);
      if (h) {
        closeLists();
        const lvl = h[1].length;
        out.push(`<h${lvl} class="mzp-md-h${lvl}">${fmtInline(h[2])}</h${lvl}>`);
        continue;
      }
      const q = line.match(/^>\s?(.*)$/);
      if (q) {
        closeLists();
        out.push(`<blockquote class="mzp-md-quote">${fmtInline(q[1])}</blockquote>`);
        continue;
      }
      const ul = line.match(/^[-*•]\s+(.+)$/);
      if (ul) {
        if (inOl) {
          out.push('</ol>');
          inOl = false;
        }
        if (!inUl) {
          out.push('<ul class="mzp-md-list">');
          inUl = true;
        }
        out.push(`<li>${fmtInline(ul[1])}</li>`);
        continue;
      }
      const ol = line.match(/^\d+\.\s+(.+)$/);
      if (ol) {
        if (inUl) {
          out.push('</ul>');
          inUl = false;
        }
        if (!inOl) {
          out.push('<ol class="mzp-md-list">');
          inOl = true;
        }
        out.push(`<li>${fmtInline(ol[1])}</li>`);
        continue;
      }
      closeLists();
      out.push(`<p class="mzp-md-p">${fmtInline(line)}</p>`);
    }
    closeLists();
    return out.join('\n');
  }

  function renderSafeMarkdown(md, esc) {
    if (window.SEYYAH_AI && typeof window.SEYYAH_AI.renderMarkdown === 'function') {
      return window.SEYYAH_AI.renderMarkdown(md, esc);
    }
    return renderMarkdownFallback(md, esc);
  }

  // ---------------------------------------------------------------------------
  // Build Enriched 9-Stop Route Data from ctx.data.provinces + Curated Specs
  // ---------------------------------------------------------------------------
  function buildCorridorStops(ctx) {
    const provinces = (ctx && ctx.data && ctx.data.provinces) || {};
    const distFn =
      ctx && typeof ctx.calcDistKm === 'function' ? ctx.calcDistKm : haversineKm;

    const orderedBase =
      uiState.direction === 'east-to-west'
        ? [...MESOPOTAMIA_STOPS].reverse()
        : [...MESOPOTAMIA_STOPS];

    let cumulativeRoadKm = 0;
    let cumulativeAirKm = 0;

    return orderedBase.map((spec, idx) => {
      const live = provinces[spec.key] || {};
      const lat = typeof live.lat === 'number' ? live.lat : spec.lat;
      const lng = typeof live.lng === 'number' ? live.lng : spec.lng;
      const prev = idx > 0 ? orderedBase[idx - 1] : null;
      const prevLive = prev ? provinces[prev.key] || {} : null;
      const prevLat = prev ? (typeof prevLive.lat === 'number' ? prevLive.lat : prev.lat) : lat;
      const prevLng = prev ? (typeof prevLive.lng === 'number' ? prevLive.lng : prev.lng) : lng;

      const legAirKm = idx === 0 ? 0 : distFn(prevLat, prevLng, lat, lng);
      const legRoadKm = idx === 0 ? 0 : Math.round(legAirKm * ROAD_DETOUR_FACTOR);
      cumulativeAirKm += legAirKm;
      cumulativeRoadKm += legRoadKm;

      const dayStart = idx * DAYS_PER_CITY + 1;
      const dayEnd = (idx + 1) * DAYS_PER_CITY;

      return {
        ...spec,
        stopNumber: idx + 1,
        name: live.name || spec.name,
        plate: live.plate || spec.plate,
        lat,
        lng,
        visited: Boolean(live.visited),
        quote: live.quote || spec.defaultQuote,
        library: live.library || spec.defaultLibrary,
        landmarks: Array.isArray(live.landmarks) && live.landmarks.length ? live.landmarks : spec.defaultLandmarks,
        specialties: Array.isArray(live.specialties) && live.specialties.length ? live.specialties : spec.defaultSpecialties,
        literaryQuotes: Array.isArray(live.literary_quotes) ? live.literary_quotes : [],
        reflection: live.reflection || spec.historySummary,
        bannerRel: live.banner_rel || `07_GuneydoguAnadolu/${spec.slug}/banner.jpg`,
        galleryRel: live.gallery_rel || `07_GuneydoguAnadolu/${spec.slug}/gallery.jpg`,
        legAirKm: Number(legAirKm.toFixed(1)),
        legRoadKm,
        legHours: Number((legRoadKm / 80).toFixed(1)),
        cumulativeRoadKm,
        cumulativeAirKm: Number(cumulativeAirKm.toFixed(1)),
        dayStart,
        dayEnd,
        dayLabel: `Gün ${dayStart}–${dayEnd}`,
        libHours: DAYS_PER_CITY * LIB_HOURS_PER_DAY
      };
    });
  }

  function computeExpeditionMetrics(ctx, stops) {
    const provinces = (ctx && ctx.data && ctx.data.provinces) || {};
    const stats = (ctx && ctx.data && ctx.data.stats) || {};
    const allProvs = Object.values(provinces);
    const totalCities = allProvs.length || stats.total_cities || 81;
    const currentVisitedCities = allProvs.length
      ? allProvs.filter((p) => p && p.visited).length
      : stats.visited_cities || 39;
    const unvisitedMesoCount = stops.filter((s) => !s.visited).length || stops.length;

    const visitedRegionsSet = new Set();
    allProvs.forEach((p) => {
      if (p && p.visited && p.region_code) visitedRegionsSet.add(p.region_code);
    });
    const currentVisitedRegions = visitedRegionsSet.size || stats.visited_regions || 6;
    const totalRegions = stats.total_regions || 7;

    const totalRoadKm = stops.length ? stops[stops.length - 1].cumulativeRoadKm : 972;
    const totalAirKm = stops.length ? Math.round(stops[stops.length - 1].cumulativeAirKm) : 720;
    const totalDriveHours = (totalRoadKm / 80).toFixed(1);

    const expeditionDays = stops.length * DAYS_PER_CITY; // 45
    const expeditionLibHours = expeditionDays * LIB_HOURS_PER_DAY; // 180
    const kykSavingsTl = expeditionDays * DAILY_HOTEL_RATE_TL; // 99.000 TL

    const currentDaysOnRoad = stats.days_on_road || currentVisitedCities * DAYS_PER_CITY;
    const currentLibHours = stats.library_hours || currentDaysOnRoad * LIB_HOURS_PER_DAY;
    const currentEstimatedKm = stats.estimated_km || 10898;

    const afterVisitedCities = Math.min(totalCities, currentVisitedCities + unvisitedMesoCount);
    const afterVisitedRegions = Math.min(totalRegions, currentVisitedRegions + (unvisitedMesoCount > 0 ? 1 : 0));
    const afterDaysOnRoad = currentDaysOnRoad + expeditionDays;
    const afterLibHours = currentLibHours + expeditionLibHours;
    const afterEstimatedKm = currentEstimatedKm + totalRoadKm;

    return {
      totalCities,
      currentVisitedCities,
      afterVisitedCities,
      currentPct: ((currentVisitedCities / totalCities) * 100).toFixed(1),
      afterPct: ((afterVisitedCities / totalCities) * 100).toFixed(1),
      currentVisitedRegions,
      afterVisitedRegions,
      totalRegions,
      unvisitedMesoCount,
      totalRoadKm,
      totalAirKm,
      totalDriveHours,
      expeditionDays,
      expeditionLibHours,
      kykSavingsTl,
      currentDaysOnRoad,
      afterDaysOnRoad,
      currentLibHours,
      afterLibHours,
      currentEstimatedKm,
      afterEstimatedKm
    };
  }

  // ---------------------------------------------------------------------------
  // Interactive SVG 9-Stop Mesopotamia Corridor Map
  // ---------------------------------------------------------------------------
  function buildMesopotamiaSvg(stops, selectedKey, esc) {
    const W = 860;
    const H = 390;
    const minLng = 36.45;
    const maxLng = 43.15;
    const minLat = 36.32;
    const maxLat = 38.34;

    const padX = 56;
    const padY = 44;

    const projX = (lng) => padX + ((lng - minLng) / (maxLng - minLng)) * (W - padX * 2);
    const projY = (lat) => H - padY - ((lat - minLat) / (maxLat - minLat)) * (H - padY * 2);

    // Coordinate graticule
    const lngLines = [37, 38, 39, 40, 41, 42, 43];
    const latLines = [36.5, 37.0, 37.5, 38.0];
    const gridHtml = [
      ...lngLines.map((lng) => {
        const x = projX(lng).toFixed(1);
        return `<line x1="${x}" y1="18" x2="${x}" y2="${H - 22}" class="mzp-svg-grid" />
                <text x="${x}" y="${H - 7}" text-anchor="middle" class="mzp-svg-coord">${lng}°E</text>`;
      }),
      ...latLines.map((lat) => {
        const y = projY(lat).toFixed(1);
        return `<line x1="22" y1="${y}" x2="${W - 18}" y2="${y}" class="mzp-svg-grid" />
                <text x="24" y="${(Number(y) - 4).toFixed(1)}" class="mzp-svg-coord">${lat.toFixed(1)}°N</text>`;
      })
    ].join('');

    // Stylized Euphrates (Fırat) & Tigris (Dicle) river curves across the basin
    const euphratesPts = [
      [38.75, 38.28],
      [38.55, 37.90],
      [38.30, 37.55],
      [38.00, 37.18],
      [37.92, 36.75],
      [38.10, 36.38]
    ]
      .map(([lng, lat]) => `${projX(lng).toFixed(1)},${projY(lat).toFixed(1)}`)
      .join(' ');

    const tigrisPts = [
      [40.15, 38.26],
      [40.25, 37.90],
      [40.68, 37.78],
      [41.18, 37.75],
      [41.65, 37.62],
      [42.18, 37.34],
      [42.45, 37.12]
    ]
      .map(([lng, lat]) => `${projX(lng).toFixed(1)},${projY(lat).toFixed(1)}`)
      .join(' ');

    const riversHtml = `
      <g class="mzp-svg-rivers" aria-hidden="true">
        <path d="M ${euphratesPts.split(' ').join(' L ')}" class="mzp-svg-river" />
        <path d="M ${tigrisPts.split(' ').join(' L ')}" class="mzp-svg-river" />
        <text x="${projX(38.15).toFixed(1)}" y="${projY(36.88).toFixed(1)}" class="mzp-svg-river-lbl">Fırat Havzası</text>
        <text x="${projX(41.58).toFixed(1)}" y="${projY(37.54).toFixed(1)}" class="mzp-svg-river-lbl">Dicle Havzası</text>
      </g>
    `;

    // Corridor route legs + midpoint km pills
    const legsHtml = stops
      .slice(1)
      .map((stop, i) => {
        const prev = stops[i];
        const x1 = projX(prev.lng);
        const y1 = projY(prev.lat);
        const x2 = projX(stop.lng);
        const y2 = projY(stop.lat);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const isActiveLeg = stop.key === selectedKey || prev.key === selectedKey;

        return `
          <g class="mzp-svg-leg ${isActiveLeg ? 'is-active' : ''}" data-stop-key="${esc(stop.key)}">
            <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="mzp-svg-leg-glow" />
            <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="mzp-svg-leg-dash" />
            <g transform="translate(${mx.toFixed(1)}, ${my.toFixed(1)})">
              <rect x="-24" y="-10" width="48" height="19" rx="9.5" class="mzp-svg-km-pill" />
              <text x="0" y="3" text-anchor="middle" class="mzp-svg-km-txt">${stop.legRoadKm} km</text>
            </g>
          </g>
        `;
      })
      .join('');

    // Clickable city nodes
    const nodesHtml = stops
      .map((stop) => {
        const x = projX(stop.lng);
        const y = projY(stop.lat);
        const isSelected = stop.key === selectedKey;
        const isFirst = stop.stopNumber === 1;
        const isLast = stop.stopNumber === stops.length;
        const off = stop.labelOffset || { dx: 0, dy: -16, anchor: 'middle' };

        const fill = isSelected
          ? '#00f2fe'
          : isFirst
          ? '#f59e0b'
          : isLast
          ? '#10b981'
          : '#fb923c';

        const r = isSelected ? 12.5 : isFirst || isLast ? 10.5 : 9.5;

        return `
          <g class="mzp-svg-node ${isSelected ? 'is-selected' : ''}"
             data-stop-key="${esc(stop.key)}"
             role="button"
             tabindex="0"
             aria-label="${esc(stop.stopNumber)}. Durak: ${esc(stop.name)} (${stop.dayLabel})">
            <title>${esc(stop.stopNumber)}. Durak: ${esc(stop.name)} (${esc(stop.dayLabel)}) — ${stop.legRoadKm ? stop.legRoadKm + ' km' : 'Başlangıç'}</title>
            ${
              isSelected
                ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="20" class="mzp-svg-pulse-ring" />`
                : ''
            }
            <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r + 4).toFixed(1)}" class="mzp-svg-node-halo" />
            <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}" class="mzp-svg-node-core" />
            <text x="${x.toFixed(1)}" y="${(y + 3.5).toFixed(1)}" text-anchor="middle" class="mzp-svg-node-num">${stop.stopNumber}</text>
            <text x="${(x + off.dx).toFixed(1)}" y="${(y + off.dy).toFixed(1)}" text-anchor="${off.anchor}" class="mzp-svg-node-lbl">${esc(stop.name)}</text>
            <text x="${(x + off.dx).toFixed(1)}" y="${(y + off.dy + 12).toFixed(1)}" text-anchor="${off.anchor}" class="mzp-svg-node-sub">${esc(stop.dayLabel)}</text>
          </g>
        `;
      })
      .join('');

    return `
      <svg class="mzp-svg-map" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mezopotamya 9 Duraklı 2-Opt Sefer Haritası">
        <defs>
          <radialGradient id="mzpBgGlow" cx="52%" cy="48%" r="65%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.12" />
            <stop offset="55%" stop-color="#00f2fe" stop-opacity="0.06" />
            <stop offset="100%" stop-color="#0a0f1d" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="url(#mzpBgGlow)" />
        ${gridHtml}
        ${riversHtml}
        ${legsHtml}
        ${nodesHtml}
      </svg>
    `;
  }

  // ---------------------------------------------------------------------------
  // AI Prompt & Rich Offline Fallback Strategy Generator
  // ---------------------------------------------------------------------------
  function buildGeminiPrompt(stops, metrics) {
    const seasonLabels = {
      ilkbahar: 'İlkbahar (Nisan–Mayıs — Mezopotamya’nın en yeşil ve ılıman mevsimi)',
      sonbahar: 'Sonbahar (Eylül–Ekim — Tillo ekinoksu ve bağ bozumu zamanı)',
      kis: 'Kış (Aralık–Şubat — Sakin müzeler ve kütüphane odaklı dönem)',
      yaz: 'Yaz (Haziran–Ağustos — Erken şafak çıkışı ve akşam gezisi disiplini)'
    };
    const focusLabels = {
      dengeli: 'Dengeli Sefer (5 Gün Kuralı + 180 Saat Kütüphane + İrfan & Tarih)',
      irfan: 'Manevî Miras & Tefekkür (Balıklıgöl, Veysel Karânî, Tillo Işık Hadisesi, Cudi & El-Cezerî, Deyrulzafaran)',
      verimlilik: 'Dijital Seyyah Kütüphane & Mühendislik Disiplini (El-Cezerî mirası + 9 İl Halk Kütüphanesi mesaisi)',
      gastronomi: 'Mezopotamya Gastronomi & Tarihî Çarşı İzleği (Beyran, Kilis Tavası, Urfa Ciğer/Mırra, Kaburga Dolması, Büryan)'
    };

    const routeSummary = stops
      .map(
        (s) =>
          `${s.stopNumber}. ${s.name} (${s.dayLabel}, ${s.legRoadKm ? '+' + s.legRoadKm + ' km' : 'Başlangıç'}, Kütüphane: ${s.library})`
      )
      .join('\n');

    return `Sen Anadolu Seyahatnamesi projesinin baş stratejisti ve irfan rehberisin.
Bir "Dijital Seyyah" (uzaktan çalışan yazılımcı/mühendis) 81 illik Türkiye seferinin SON BÖLGESİ olan Güneydoğu Anadolu (Mezopotamya 0/9 İl) etabına çıkmaya hazırlanıyor.

SOMUT VERİLER:
- Mevcut Durum: ${metrics.currentVisitedCities}/${metrics.totalCities} İl (%${metrics.currentPct}), ${metrics.currentVisitedRegions}/${metrics.totalRegions} Bölge, ${metrics.currentDaysOnRoad} gün, ${metrics.currentLibHours} saat kütüphane mesaisi.
- Mezopotamya 2-Opt Koridoru (${metrics.totalRoadKm} km karayolu, ~${metrics.totalDriveHours} saat sürüş):
${routeSummary}
- 5 Gün Kuralı: ${metrics.expeditionDays} gün (9 il × 5 gün), günlük 4 saatten toplam ${metrics.expeditionLibHours} saat İl Halk Kütüphanesi mesaisi.
- Konaklama: GSB Seyahatsever KYK yurtları ile 45 gece × 2.200 ₺ = ${formatTL(metrics.kykSavingsTl)} tasarruf.
- Sefer Sonrası Kazanım: ${metrics.afterVisitedCities}/${metrics.totalCities} İl (%${metrics.afterPct}), 7/7 Bölge ➔ "🌍 Yedi İklim Fatihi (7/7 Bölge)" & "📜 Evliya Çelebi İzinde (${metrics.afterVisitedCities}/${metrics.totalCities} İl)" unvanları.

KULLANICI SEÇİMLERİ:
- Sefer Mevsimi: ${seasonLabels[uiState.aiSeason] || seasonLabels.ilkbahar}
- Odak Ekseni: ${focusLabels[uiState.aiFocus] || focusLabels.dengeli}
${uiState.aiCustomNote ? `- Özel Not: ${uiState.aiCustomNote}` : ''}

Lütfen Türkçe, edebi ama son derece uygulanabilir, somut bir **Mezopotamya Sefer Stratejisi & Tefekkür Rehberi** üret. Şu 4 bölümü Markdown başlıklarıyla yaz:
1. **🧭 45 Günlük Lojistik & Mevsim Taktikleri** (Güneydoğu iklimi, şehirlerarası aktarmalar, sabah/akşam ritmi)
2. **📚 180 Saatlik Kütüphane & Dijital Seyyah Disiplini** (9 İl Halk Kütüphanesinde derin odaklanma + akşam keşif dengesi)
3. **🕌 Fırat’tan Dicle’ye Manevî Tefekkür Halkası** (Hz. İbrahim & Balıklıgöl, 27 Sahabe, Deyrulzafaran & Kasımiye, Veysel Karânî, İbrâhîm Hakkı Hz. & Tillo, El-Cezerî ve Hz. Nuh & Cudi ekseninde ruhî izlek)
4. **🌍 Yedi İklim Fatihi Eşiği İçin Seyyah Manifestosu** (7/7 Bölge ve ${metrics.afterVisitedCities}/81 İl zaferine dair ilham verici kapanış sözü).`;
  }

  function buildOfflineStrategyMarkdown(stops, metrics) {
    const seasonAdvice = {
      ilkbahar:
        'Nisan–Mayıs penceresi Mezopotamya bozkırının yeşile büründüğü, gündüz 22–27°C bandında gezilebilen altın dönemdir. Nemrut zirvesi hâlâ serin olacağından yanınıza rüzgârlık alın; Balıklıgöl ve Mardin taş sokaklarında ikindi yürüyüşleri eşsizdir.',
      sonbahar:
        'Eylül sonu–Ekim aralığı aşırı sıcağın kırıldığı, Siirt Tillo’da 23 Eylül ekinoks Işık Hadisesi’ne denk getirebileceğiniz en arifane mevsimdir. Bağ bozumu ve fıstık hasadı sofraları şenlendirir.',
      kis:
        'Aralık–Şubat döneminde müzeler ve İl Halk Kütüphaneleri son derece sakindir. Zeugma, Göbeklitepe, Ulu Cami avluları ve Mardin medreselerinde kalabalıksız derin tefekkür imkânı bulursunuz; Nemrut yolu kar durumuna göre kontrol edilmelidir.',
      yaz:
        'Haziran–Ağustos sıcağında **05:30–10:30 şafak keşfi ➔ 11:00–16:30 klimalı İl Halk Kütüphanesi mesaisi ➔ 17:30 sonrası taş avlu ve han gezisi** ritmi hayat kurtarır.'
    };

    const focusAdvice = {
      dengeli:
        'Her ilde 5 günün ilk 4 günü **09:00–13:00 (4 saat) İl Halk Kütüphanesi** derin çalışma bloğu, öğleden sonra ise tarihî çekirdek + akşam sohbeti şeklinde yapılandırılmıştır.',
      irfan:
        'Bu rotada her durak bir gönül mektebidir: Urfa’da Hz. İbrahim teslimiyeti, Diyarbakır’da 27 Sahabe vakarı, Mardin’de Kasımiye su kanalında ömür tefekkürü, Siirt’te Veysel Karânî sadakati ve Cizre’de Hz. Nuh şükrü ekseninde ilerleyin.',
      verimlilik:
        '9 İl Halk Kütüphanesinde toplam **180 saatlik** kesintisiz üretim, Şırnak/Cizre’de 820 yıl önce ilk otomasyonu kuran **İsmail Ebul-İz El-Cezerî**’nin kabri başında taçlanacak; her şehirde 1 teknik modül veya gezi notu tamamlayın.',
      gastronomi:
        'Gaziantep’te sabah 06:30 beyranı, Kilis’te fırın kürekleriyle gelen Kilis Tavası, Urfa’da Gümrük Hanı mırrası, Diyarbakır’da ciğer ve burma kadayıf, Mardin’de sembusek ve Siirt’te kuyu büryana yer açın.'
    };

    const firstStop = stops[0];
    const lastStop = stops[stops.length - 1];

    return `### 🧭 1. 45 Günlük Lojistik & Mevsim Taktikleri (${firstStop.name} ➔ ${lastStop.name})
- **2-Opt Koridor Omurgası:** ${stops.map((s) => s.name).join(' ➔ ')} hattı toplam **${metrics.totalRoadKm} km** karayolu (~${metrics.totalDriveHours} saat sürüş) ile geri dönüşsüz tek bir doğu yayını takip eder.
- **Mevsim Stratejisi:** ${seasonAdvice[uiState.aiSeason] || seasonAdvice.ilkbahar}
- **GSB Seyahatsever KYK Avantajı:** ${metrics.expeditionDays} gecelik konaklamayı GSB Seyahatsever KYK yurtlarında çözerek gecelik 2.200 ₺ otel maliyetinden toplam **${formatTL(metrics.kykSavingsTl)} tasarruf** sağlarsınız; bu bütçe Nemrut, Göbeklitepe, Dara ve Hasankeyf saha transferlerini fazlasıyla karşılar.

### 📚 2. 180 Saatlik İl Halk Kütüphanesi & Dijital Seyyah Disiplini
- **Odak Planı:** ${focusAdvice[uiState.aiFocus] || focusAdvice.dengeli}
- **5 Gün Kuralı Ritim Tablosu:**
  - *1. Gün:* Şehre varış, KYK yerleşimi, İl Halk Kütüphanesi masa tespiti + 4 saat çalışma, akşam tarihî meydan keşfi.
  - *2–3. Günler:* Sabah 4’er saat kütüphane mesaisi + öğleden sonra ana UNESCO / müze / manevi durak ziyaretleri.
  - *4. Gün:* 4 saat çalışma + çevre ilçe menzili (Rumkale, Harran, Nemrut, Dara, Hasankeyf, Tillo, Cizre).
  - *5. Gün:* 4 saat haftalık kapanış + **Travel.log** notlarını ve 2 fotoğrafını (\`banner.jpg\` & \`gallery.jpg\`) arşivleyip bir sonraki durağa hareket.

### 🕌 3. Fırat’tan Dicle’ye Manevî Tefekkür Halkası
- **Fırat Havzası (${stops.slice(0, 4).map((s) => s.name).join(' • ')}):** Zeugma’nın derin bakışlarından Oylum Höyük’e, Nemrut şafağında fâniliği seyrettikten sonra **Şanlıurfa Balıklıgöl**’de Hz. İbrahim’in teslimiyetini ve **Göbeklitepe**’de insanlığın ilk secde arayışını okuyun.
- **Yukarı Mezopotamya (${stops.slice(4).map((s) => s.name).join(' • ')}):** **Diyarbakır Ulu Camii** ve 27 Sahabe huzurundan **Mardin Deyrulzafaran & Kasımiye Medresesi**’nin suyla akan ömür alegorisine geçin. **Batman Hasankeyf**’te Dicle’ye direnen 12 bin yılı, **Siirt’te Veysel Karânî** ile **İbrâhîm Hakkı Hazretleri’nin Tillo Işık Hadisesi**ni tefekkür edin; finali **Şırnak/Cizre’de El-Cezerî** ve **Cudi Dağı** eteğinde Hz. Nuh şükrüyle yapın.

### 🌍 4. Yedi İklim Fatihi Eşiği İçin Seyyah Manifestosu
> *"39 ilde pişen sabrınız, Mezopotamya’nın 9 taş kapısından geçtiğinde ${metrics.afterVisitedCities}/${metrics.totalCities} il (%${metrics.afterPct}) ve 7/7 Bölge kemaline erişecek. Kilis’in kabaltısından Cudi’nin eteğine kadar atılan her adım; yalnızca coğrafyayı değil, kendi iç haritanızı da tamamlayacaktır."*
- **Açılacak Nişanlar:** **🌍 Yedi İklim Fatihi (7/7 Bölge)** & **📜 Evliya Çelebi İzinde (${metrics.afterVisitedCities}/${metrics.totalCities} İl)**.${
      uiState.aiCustomNote
        ? `\n- **Özel Notunuz İçin Tavsiye:** *"${uiState.aiCustomNote}"* başlığını özellikle 5. gün seyahatname özetlerinize ana tema olarak ekleyin.`
        : ''
    }`;
  }

  // ---------------------------------------------------------------------------
  // Scoped CSS Injector (Dark & body.light-theme compatible)
  // ---------------------------------------------------------------------------
  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .mzp-shell {
        --mzp-amber: #f59e0b;
        --mzp-terracotta: #ea580c;
        --mzp-tigris: #00f2fe;
        --mzp-emerald: #10b981;
        --mzp-sand: rgba(245, 158, 11, 0.14);
        --mzp-surface: var(--bg-card, rgba(30, 41, 59, 0.72));
        --mzp-surface-strong: rgba(15, 23, 42, 0.88);
        --mzp-border: var(--border-glass, rgba(255, 255, 255, 0.1));
        --mzp-border-warm: rgba(245, 158, 11, 0.34);
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-width: 1280px;
        margin: 0 auto;
        padding-bottom: 48px;
        animation: mzpFadeIn 0.32s cubic-bezier(0.22, 1, 0.36, 1);
      }

      body.light-theme .mzp-shell {
        --mzp-tigris: #0284c7;
        --mzp-amber: #d97706;
        --mzp-emerald: #059669;
        --mzp-surface: rgba(255, 255, 255, 0.92);
        --mzp-surface-strong: rgba(248, 250, 252, 0.97);
        --mzp-border: rgba(15, 23, 42, 0.12);
        --mzp-border-warm: rgba(217, 119, 6, 0.36);
      }

      @keyframes mzpFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes mzpDashFlow {
        to { stroke-dashoffset: -40; }
      }

      @keyframes mzpPulse {
        0%, 100% { r: 17; opacity: 0.75; }
        50% { r: 24; opacity: 0.15; }
      }

      /* Hero Command Banner */
      .mzp-hero {
        position: relative;
        overflow: hidden;
        border-radius: 20px;
        padding: 26px 28px;
        background:
          radial-gradient(circle at 88% 15%, rgba(245, 158, 11, 0.22), transparent 44%),
          radial-gradient(circle at 12% 85%, rgba(0, 242, 254, 0.14), transparent 46%),
          var(--mzp-surface);
        border: 1px solid var(--mzp-border-warm);
        box-shadow: var(--shadow-subtle);
      }

      body.light-theme .mzp-hero {
        background:
          radial-gradient(circle at 88% 15%, rgba(217, 119, 6, 0.14), transparent 46%),
          radial-gradient(circle at 12% 85%, rgba(2, 132, 199, 0.10), transparent 46%),
          #ffffff;
      }

      .mzp-hero-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 14px;
      }

      .mzp-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        color: var(--mzp-amber);
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.35);
      }

      .mzp-hero-title {
        font-family: var(--font-heading);
        font-size: 1.72rem;
        font-weight: 800;
        line-height: 1.22;
        margin-top: 10px;
        background: linear-gradient(135deg, #fff7ed 0%, #fbbf24 48%, #38bdf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .mzp-hero-title {
        background: linear-gradient(135deg, #0f172a 0%, #b45309 50%, #0369a1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .mzp-hero-sub {
        margin-top: 8px;
        max-width: 820px;
        font-size: 0.92rem;
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .mzp-kpi-strip {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 12px;
        margin-top: 20px;
      }

      .mzp-kpi-card {
        padding: 13px 14px;
        border-radius: 14px;
        background: var(--mzp-surface-strong);
        border: 1px solid var(--mzp-border);
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .mzp-kpi-val {
        font-family: var(--font-heading);
        font-size: 1.28rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .mzp-kpi-val.is-gold { color: var(--mzp-amber); }
      .mzp-kpi-val.is-cyan { color: var(--mzp-tigris); }
      .mzp-kpi-val.is-emerald { color: var(--mzp-emerald); }

      .mzp-kpi-lbl {
        font-size: 0.76rem;
        font-weight: 600;
        color: var(--text-secondary);
      }

      .mzp-kpi-sub {
        font-size: 0.7rem;
        color: var(--text-muted);
      }

      /* Section Heading */
      .mzp-section {
        background: var(--mzp-surface);
        border: 1px solid var(--mzp-border);
        border-radius: 18px;
        padding: 22px;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      .mzp-section-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 16px;
      }

      .mzp-section-title {
        font-family: var(--font-heading);
        font-size: 1.2rem;
        font-weight: 800;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mzp-section-sub {
        font-size: 0.84rem;
        color: var(--text-secondary);
        margin-top: 2px;
      }

      /* Buttons & Pills */
      .mzp-btn-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .mzp-pill-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 13px;
        border-radius: 999px;
        border: 1px solid var(--mzp-border);
        background: var(--mzp-surface-strong);
        color: var(--text-secondary);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .mzp-pill-btn:hover {
        border-color: var(--mzp-amber);
        color: var(--text-primary);
      }

      .mzp-pill-btn.active {
        background: rgba(245, 158, 11, 0.18);
        border-color: var(--mzp-amber);
        color: var(--mzp-amber);
      }

      .mzp-primary-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: 12px;
        border: 1px solid rgba(245, 158, 11, 0.5);
        background: linear-gradient(135deg, #f59e0b, #ea580c);
        color: #0b1120;
        font-weight: 800;
        font-size: 0.88rem;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        font-family: inherit;
      }

      .mzp-primary-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(245, 158, 11, 0.32);
      }

      .mzp-primary-btn:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      .mzp-secondary-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 10px;
        border: 1px solid var(--mzp-border);
        background: var(--mzp-surface-strong);
        color: var(--text-primary);
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .mzp-secondary-btn:hover {
        border-color: var(--mzp-tigris);
        color: var(--mzp-tigris);
      }

      /* Corridor Map + Inspector Grid */
      .mzp-map-layout {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(300px, 1fr);
        gap: 18px;
        align-items: stretch;
      }

      .mzp-svg-wrap {
        position: relative;
        border-radius: 16px;
        background: rgba(9, 14, 27, 0.9);
        border: 1px solid var(--mzp-border);
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      body.light-theme .mzp-svg-wrap {
        background: #f8fafc;
      }

      .mzp-svg-map {
        width: 100%;
        height: auto;
        display: block;
      }

      .mzp-svg-grid {
        stroke: rgba(148, 163, 184, 0.14);
        stroke-width: 1;
        stroke-dasharray: 3, 4;
      }

      body.light-theme .mzp-svg-grid {
        stroke: rgba(15, 23, 42, 0.09);
      }

      .mzp-svg-coord {
        fill: rgba(148, 163, 184, 0.6);
        font-size: 9.5px;
        font-family: var(--font-body);
      }

      body.light-theme .mzp-svg-coord {
        fill: #64748b;
      }

      .mzp-svg-river {
        fill: none;
        stroke: rgba(0, 242, 254, 0.22);
        stroke-width: 4;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      body.light-theme .mzp-svg-river {
        stroke: rgba(2, 132, 199, 0.24);
      }

      .mzp-svg-river-lbl {
        fill: rgba(0, 242, 254, 0.55);
        font-size: 10px;
        font-style: italic;
        font-weight: 600;
      }

      body.light-theme .mzp-svg-river-lbl {
        fill: rgba(2, 132, 199, 0.72);
      }

      .mzp-svg-leg-glow {
        stroke: rgba(245, 158, 11, 0.18);
        stroke-width: 7;
        stroke-linecap: round;
      }

      .mzp-svg-leg.is-active .mzp-svg-leg-glow {
        stroke: rgba(0, 242, 254, 0.34);
        stroke-width: 9;
      }

      .mzp-svg-leg-dash {
        stroke: #f59e0b;
        stroke-width: 2.6;
        stroke-dasharray: 8, 6;
        stroke-linecap: round;
        animation: mzpDashFlow 1.8s linear infinite;
      }

      .mzp-svg-leg.is-active .mzp-svg-leg-dash {
        stroke: #00f2fe;
        stroke-width: 3.2;
      }

      body.light-theme .mzp-svg-leg.is-active .mzp-svg-leg-dash {
        stroke: #0284c7;
      }

      .mzp-svg-km-pill {
        fill: rgba(15, 23, 42, 0.92);
        stroke: rgba(245, 158, 11, 0.45);
        stroke-width: 1;
      }

      body.light-theme .mzp-svg-km-pill {
        fill: #ffffff;
        stroke: rgba(217, 119, 6, 0.5);
      }

      .mzp-svg-km-txt {
        fill: #fcd34d;
        font-size: 9px;
        font-weight: 700;
        font-family: var(--font-heading);
      }

      body.light-theme .mzp-svg-km-txt {
        fill: #b45309;
      }

      .mzp-svg-node {
        cursor: pointer;
        outline: none;
      }

      .mzp-svg-node-halo {
        fill: rgba(255, 255, 255, 0.08);
        transition: transform 0.2s ease;
      }

      .mzp-svg-node:hover .mzp-svg-node-core,
      .mzp-svg-node:focus-visible .mzp-svg-node-core {
        stroke: #ffffff;
        stroke-width: 2.6;
      }

      .mzp-svg-node-core {
        stroke: #09101f;
        stroke-width: 2;
        transition: all 0.2s ease;
      }

      .mzp-svg-pulse-ring {
        fill: none;
        stroke: #00f2fe;
        stroke-width: 2;
        animation: mzpPulse 2s ease-in-out infinite;
      }

      body.light-theme .mzp-svg-pulse-ring {
        stroke: #0284c7;
      }

      .mzp-svg-node-num {
        fill: #07101f;
        font-size: 9.5px;
        font-weight: 900;
        font-family: var(--font-heading);
        pointer-events: none;
      }

      .mzp-svg-node-lbl {
        fill: #f8fafc;
        font-size: 11.5px;
        font-weight: 800;
        font-family: var(--font-heading);
        paint-order: stroke;
        stroke: rgba(7, 12, 24, 0.85);
        stroke-width: 3px;
        stroke-linejoin: round;
        pointer-events: none;
      }

      body.light-theme .mzp-svg-node-lbl {
        fill: #0f172a;
        stroke: rgba(255, 255, 255, 0.92);
      }

      .mzp-svg-node-sub {
        fill: #94a3b8;
        font-size: 8.8px;
        font-weight: 600;
        pointer-events: none;
      }

      body.light-theme .mzp-svg-node-sub {
        fill: #475569;
      }

      .mzp-map-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        align-items: center;
        justify-content: space-between;
        font-size: 0.76rem;
        color: var(--text-secondary);
        padding: 4px 4px 0;
      }

      .mzp-legend-items {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .mzp-dot {
        display: inline-block;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        margin-right: 5px;
      }

      /* Stop Inspector + Legs Sidebar */
      .mzp-inspector {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .mzp-inspector-card {
        border-radius: 14px;
        background: var(--mzp-surface-strong);
        border: 1px solid var(--mzp-border-warm);
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .mzp-inspector-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      .mzp-inspector-title {
        font-family: var(--font-heading);
        font-size: 1.08rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .mzp-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
        background: rgba(245, 158, 11, 0.16);
        color: var(--mzp-amber);
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .mzp-badge.is-cyan {
        background: rgba(0, 242, 254, 0.12);
        color: var(--mzp-tigris);
        border-color: rgba(0, 242, 254, 0.28);
      }

      .mzp-badge.is-emerald {
        background: rgba(16, 185, 129, 0.14);
        color: var(--mzp-emerald);
        border-color: rgba(16, 185, 129, 0.3);
      }

      .mzp-legs-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 235px;
        overflow-y: auto;
        padding-right: 4px;
      }

      .mzp-leg-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 11px;
        border-radius: 10px;
        background: var(--mzp-surface-strong);
        border: 1px solid var(--mzp-border);
        cursor: pointer;
        transition: all 0.18s ease;
        text-align: left;
        color: inherit;
        font-family: inherit;
      }

      .mzp-leg-row:hover {
        border-color: var(--mzp-amber);
      }

      .mzp-leg-row.is-selected {
        border-color: var(--mzp-tigris);
        background: rgba(0, 242, 254, 0.08);
      }

      body.light-theme .mzp-leg-row.is-selected {
        background: rgba(2, 132, 199, 0.08);
      }

      /* 3-Column Master Plan Bento */
      .mzp-master-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }

      .mzp-bento-card {
        border-radius: 16px;
        background: var(--mzp-surface-strong);
        border: 1px solid var(--mzp-border);
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .mzp-bento-title {
        font-family: var(--font-heading);
        font-size: 1.02rem;
        font-weight: 800;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .mzp-lib-checklist {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 245px;
        overflow-y: auto;
        padding-right: 4px;
      }

      .mzp-lib-item {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        padding: 7px 9px;
        border-radius: 10px;
        border: 1px solid var(--mzp-border);
        background: rgba(255, 255, 255, 0.02);
        cursor: pointer;
        font-size: 0.78rem;
        color: var(--text-secondary);
        transition: border-color 0.15s ease;
      }

      .mzp-lib-item:hover {
        border-color: var(--mzp-amber);
      }

      .mzp-lib-item.is-checked {
        border-color: rgba(16, 185, 129, 0.45);
        background: rgba(16, 185, 129, 0.09);
      }

      .mzp-lib-item input {
        margin-top: 2px;
        accent-color: #10b981;
      }

      .mzp-savings-box {
        padding: 14px;
        border-radius: 13px;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(245, 158, 11, 0.1));
        border: 1px solid rgba(16, 185, 129, 0.35);
      }

      .mzp-savings-big {
        font-family: var(--font-heading);
        font-size: 1.55rem;
        font-weight: 900;
        color: var(--mzp-emerald);
      }

      .mzp-bar-track {
        height: 9px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.18);
        overflow: hidden;
      }

      .mzp-bar-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #f59e0b, #10b981);
        transition: width 0.35s ease;
      }

      .mzp-milestone-pair {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }

      .mzp-milestone-card {
        padding: 11px 13px;
        border-radius: 12px;
        border: 1px solid var(--mzp-border-warm);
        background: rgba(245, 158, 11, 0.08);
        display: flex;
        align-items: center;
        gap: 11px;
      }

      .mzp-milestone-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      /* Gemini AI Studio */
      .mzp-ai-controls {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 14px;
      }

      .mzp-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .mzp-field label {
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--text-secondary);
      }

      .mzp-select,
      .mzp-input {
        width: 100%;
        padding: 9px 12px;
        border-radius: 10px;
        border: 1px solid var(--mzp-border);
        background: var(--mzp-surface-strong);
        color: var(--text-primary);
        font-size: 0.84rem;
        font-family: inherit;
      }

      .mzp-ai-output {
        margin-top: 16px;
        padding: 18px 20px;
        border-radius: 14px;
        background: var(--mzp-surface-strong);
        border: 1px solid var(--mzp-border);
        line-height: 1.68;
        font-size: 0.9rem;
        color: var(--text-primary);
      }

      .mzp-ai-output h1,
      .mzp-ai-output h2,
      .mzp-ai-output h3,
      .mzp-ai-output h4,
      .mzp-md-h3,
      .mzp-md-h4 {
        font-family: var(--font-heading);
        color: var(--mzp-amber);
        margin: 14px 0 8px;
        font-size: 1.03rem;
      }

      .mzp-ai-output h1:first-child,
      .mzp-ai-output h2:first-child,
      .mzp-ai-output h3:first-child {
        margin-top: 0;
      }

      .mzp-ai-output p,
      .mzp-md-p {
        margin-bottom: 10px;
        color: var(--text-secondary);
      }

      .mzp-ai-output ul,
      .mzp-ai-output ol,
      .mzp-md-list {
        margin: 6px 0 12px 18px;
        color: var(--text-secondary);
      }

      .mzp-ai-output li {
        margin-bottom: 5px;
      }

      .mzp-ai-output blockquote,
      .mzp-md-quote {
        margin: 10px 0;
        padding: 10px 14px;
        border-left: 3px solid var(--mzp-amber);
        background: rgba(245, 158, 11, 0.08);
        border-radius: 0 10px 10px 0;
        font-style: italic;
        color: var(--text-primary);
      }

      /* 9 Province Dossier Grid */
      .mzp-dossier-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
        gap: 18px;
      }

      .mzp-dossier-card {
        border-radius: 18px;
        overflow: hidden;
        background: var(--mzp-surface-strong);
        border: 1px solid var(--mzp-border);
        display: flex;
        flex-direction: column;
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .mzp-dossier-card:hover {
        transform: translateY(-3px);
        border-color: var(--mzp-amber);
        box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28);
      }

      .mzp-dossier-card.is-highlighted {
        border-color: var(--mzp-tigris);
        box-shadow: 0 0 0 1px var(--mzp-tigris), 0 14px 30px rgba(0, 242, 254, 0.15);
      }

      .mzp-photo-duo {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 3px;
        height: 170px;
        background: #060b16;
        position: relative;
      }

      .mzp-photo-slot {
        position: relative;
        overflow: hidden;
        cursor: zoom-in;
      }

      .mzp-photo-slot img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s ease;
      }

      .mzp-photo-slot:hover img {
        transform: scale(1.06);
      }

      .mzp-photo-tag {
        position: absolute;
        bottom: 7px;
        left: 7px;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(6, 11, 22, 0.78);
        color: #f8fafc;
        font-size: 0.68rem;
        font-weight: 700;
        backdrop-filter: blur(6px);
      }

      .mzp-stop-floating-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 2;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(10, 15, 29, 0.86);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.45);
        font-size: 0.73rem;
        font-weight: 800;
        backdrop-filter: blur(8px);
      }

      .mzp-dossier-body {
        padding: 16px 18px 18px;
        display: flex;
        flex-direction: column;
        gap: 11px;
        flex: 1;
      }

      .mzp-dossier-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }

      .mzp-city-name {
        font-family: var(--font-heading);
        font-size: 1.24rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .mzp-era-lbl {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--mzp-amber);
        margin-top: 2px;
      }

      .mzp-quote-txt {
        font-size: 0.84rem;
        font-style: italic;
        color: var(--text-primary);
        padding-left: 10px;
        border-left: 2px solid var(--mzp-amber);
        line-height: 1.5;
      }

      .mzp-block-label {
        font-size: 0.71rem;
        font-weight: 800;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 3px;
      }

      .mzp-prose {
        font-size: 0.82rem;
        color: var(--text-secondary);
        line-height: 1.55;
      }

      .mzp-irfan-box {
        padding: 10px 12px;
        border-radius: 11px;
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.24);
      }

      .mzp-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .mzp-chip {
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 0.73rem;
        font-weight: 600;
        background: rgba(148, 163, 184, 0.12);
        color: var(--text-primary);
        border: 1px solid var(--mzp-border);
      }

      .mzp-chip.is-food {
        background: rgba(234, 88, 12, 0.12);
        border-color: rgba(234, 88, 12, 0.28);
      }

      .mzp-lib-strip {
        padding: 8px 11px;
        border-radius: 10px;
        background: rgba(0, 242, 254, 0.07);
        border: 1px solid rgba(0, 242, 254, 0.2);
        font-size: 0.77rem;
        color: var(--text-secondary);
      }

      body.light-theme .mzp-lib-strip {
        background: rgba(2, 132, 199, 0.07);
        border-color: rgba(2, 132, 199, 0.24);
      }

      .mzp-dossier-footer {
        margin-top: auto;
        padding-top: 10px;
        border-top: 1px solid var(--mzp-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      /* Personal 9-Province Readiness Checklist */
      .mzp-readiness-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        margin-top: 14px;
      }

      .mzp-readiness-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 13px;
        background: var(--mzp-surface-strong);
        border: 1px solid var(--mzp-border);
        cursor: pointer;
        transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
      }

      .mzp-readiness-item:hover {
        border-color: var(--mzp-border-warm);
        transform: translateY(-1px);
      }

      .mzp-readiness-item.is-ready {
        background: rgba(16, 185, 129, 0.12);
        border-color: rgba(16, 185, 129, 0.45);
      }

      body.light-theme .mzp-readiness-item.is-ready {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(5, 150, 105, 0.45);
      }

      .mzp-readiness-item input[type="checkbox"] {
        width: 17px;
        height: 17px;
        margin-top: 2px;
        accent-color: #10b981;
        flex-shrink: 0;
        cursor: pointer;
      }

      .mzp-readiness-name {
        font-family: var(--font-heading);
        font-size: 0.9rem;
        font-weight: 800;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .mzp-readiness-item.is-ready .mzp-readiness-name {
        color: var(--mzp-emerald);
      }

      .mzp-readiness-sub {
        font-size: 0.74rem;
        color: var(--text-secondary);
        margin-top: 3px;
        line-height: 1.4;
      }

      .mzp-route-load-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: 12px;
        border: 1px solid rgba(16, 185, 129, 0.55);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(0, 242, 254, 0.2));
        color: #ecfdf5;
        font-family: var(--font-heading);
        font-size: 0.84rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .mzp-route-load-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.28);
      }

      body.light-theme .mzp-route-load-btn {
        background: linear-gradient(135deg, #059669, #0284c7);
        border-color: #059669;
        color: #ffffff;
      }

      @media (max-width: 1040px) {
        .mzp-kpi-strip {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .mzp-readiness-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .mzp-map-layout,
        .mzp-master-grid,
        .mzp-ai-controls {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 680px) {
        .mzp-hero {
          padding: 18px 16px;
        }
        .mzp-hero-title {
          font-size: 1.32rem;
        }
        .mzp-kpi-strip {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .mzp-dossier-grid,
        .mzp-readiness-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Main Render Controller
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const esc = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const selectCity = typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};
    const openLightbox = typeof safeCtx.openLightbox === 'function' ? safeCtx.openLightbox : null;
    const showToast = typeof safeCtx.showToast === 'function' ? safeCtx.showToast : function () {};

    const stops = buildCorridorStops(safeCtx);
    const metrics = computeExpeditionMetrics(safeCtx, stops);
    const prepState = readPrepState();

    if (!stops.some((s) => s.key === uiState.selectedKey)) {
      uiState.selectedKey = stops[0].key;
    }

    const activeStop = stops.find((s) => s.key === uiState.selectedKey) || stops[0];
    const readyCount = stops.filter((s) => Boolean(prepState[s.key])).length;
    const hasAiKey = Boolean(window.SEYYAH_AI && typeof window.SEYYAH_AI.hasKey === 'function' && window.SEYYAH_AI.hasKey());

    const visibleDossiers = stops.filter((s) => {
      if (uiState.dossierFilter === 'firat') {
        return ['Gaziantep', 'Kilis', 'Adiyaman', 'Sanliurfa'].includes(s.slug);
      }
      if (uiState.dossierFilter === 'dicle') {
        return ['Diyarbakir', 'Mardin', 'Batman', 'Siirt', 'Sirnak'].includes(s.slug);
      }
      return true;
    });

    const routeBannerText = stops.map((s) => s.name).join(' ➔ ');

    container.innerHTML = `
      <div class="mzp-shell">
        <!-- 1. Hero Command Banner -->
        <section class="mzp-hero">
          <div class="mzp-hero-top">
            <div>
              <span class="mzp-kicker">🧭 81 İllik Seferin Final Bölgesi • 07_GuneydoguAnadolu</span>
              <h1 class="mzp-hero-title">🏜️ Sıradaki Büyük Sefer: Mezopotamya (Güneydoğu Anadolu ${9 - metrics.unvisitedMesoCount}/9 İl) Özel Komuta Merkezi</h1>
              <p class="mzp-hero-sub">
                Fırat ve Dicle’nin bereketli havzasında <strong>${esc(routeBannerText)}</strong> hattını izleyen 45 günlük büyük kültür, kütüphane ve tefekkür seferi.
                Bu etap tamamlandığında Türkiye’nin <strong>7/7 coğrafi bölgesinin</strong> tamamına ayak basılmış olacak.
              </p>
            </div>
            <div class="mzp-btn-group">
              <button type="button" class="mzp-route-load-btn" id="mzp-load-main-route">🧭 9 İllik Mezopotamya Koridorunu Ana Rota Planlayıcıya Yükle</button>
              <button type="button" class="mzp-secondary-btn" id="mzp-scroll-ai">✨ AI Sefer Stratejisi</button>
              <button type="button" class="mzp-primary-btn" id="mzp-open-active-city">📍 ${esc(activeStop.name)} İncele</button>
            </div>
          </div>

          <div class="mzp-kpi-strip">
            <div class="mzp-kpi-card">
              <span class="mzp-kpi-val is-gold">${9 - metrics.unvisitedMesoCount}/9 İl</span>
              <span class="mzp-kpi-lbl">Mezopotamya Hedefi</span>
              <span class="mzp-kpi-sub">9 il tamamlanınca %100</span>
            </div>
            <div class="mzp-kpi-card">
              <span class="mzp-kpi-val">${metrics.expeditionDays} Gün</span>
              <span class="mzp-kpi-lbl">9 İl × 5 Gün Kuralı</span>
              <span class="mzp-kpi-sub">Her şehirde tam 5 günlük kök salma</span>
            </div>
            <div class="mzp-kpi-card">
              <span class="mzp-kpi-val is-cyan">${metrics.expeditionLibHours} Saat</span>
              <span class="mzp-kpi-lbl">9 İl Halk Kütüphanesi</span>
              <span class="mzp-kpi-sub">Günlük 4 saat × 45 gün üretim</span>
            </div>
            <div class="mzp-kpi-card">
              <span class="mzp-kpi-val is-emerald">${formatTL(metrics.kykSavingsTl)}</span>
              <span class="mzp-kpi-lbl">GSB KYK Tasarrufu</span>
              <span class="mzp-kpi-sub">45 gece × 2.200 ₺ otel yerine 0 ₺</span>
            </div>
            <div class="mzp-kpi-card">
              <span class="mzp-kpi-val">${metrics.totalRoadKm} km</span>
              <span class="mzp-kpi-lbl">2-Opt Koridor Menzili</span>
              <span class="mzp-kpi-sub">${metrics.totalAirKm} km kuş uçuşu • ~${metrics.totalDriveHours} sa</span>
            </div>
          </div>
        </section>

        <!-- 2. Interactive SVG 9-Stop Mesopotamia 2-Opt Corridor Map -->
        <section class="mzp-section">
          <div class="mzp-section-head">
            <div>
              <h2 class="mzp-section-title">🗺️ İnteraktif 9 Duraklı Mezopotamya 2-Opt Koridor Haritası</h2>
              <p class="mzp-section-sub">Gerçek enlem/boylam koordinatları, animasyonlu güzergâh hatları ve etap bazlı Haversine (×1.35 karayolu) mesafe telemetrisi.</p>
            </div>
            <div class="mzp-btn-group">
              <button type="button" class="mzp-pill-btn ${uiState.direction === 'west-to-east' ? 'active' : ''}" data-dir="west-to-east">➡️ Batı ➔ Doğu (Gaziantep ➔ Şırnak)</button>
              <button type="button" class="mzp-pill-btn ${uiState.direction === 'east-to-west' ? 'active' : ''}" data-dir="east-to-west">⬅️ Doğu ➔ Batı (Şırnak ➔ Gaziantep)</button>
            </div>
          </div>

          <div class="mzp-map-layout">
            <div class="mzp-svg-wrap">
              ${buildMesopotamiaSvg(stops, activeStop.key, esc)}
              <div class="mzp-map-legend">
                <div class="mzp-legend-items">
                  <span><i class="mzp-dot" style="background:#f59e0b"></i>Başlangıç Kapısı</span>
                  <span><i class="mzp-dot" style="background:#fb923c"></i>Ara Menzil</span>
                  <span><i class="mzp-dot" style="background:#10b981"></i>Final Menzil</span>
                  <span><i class="mzp-dot" style="background:#00f2fe"></i>Seçili Durak</span>
                </div>
                <span>Düğümlere tıklayarak durağı inceleyin</span>
              </div>
            </div>

            <div class="mzp-inspector">
              <div class="mzp-inspector-card">
                <div class="mzp-inspector-head">
                  <div>
                    <span class="mzp-badge">${activeStop.stopNumber}. Durak • ${esc(activeStop.dayLabel)}</span>
                    <div class="mzp-inspector-title" style="margin-top:6px;">${esc(activeStop.name)} <span style="font-size:0.78rem;color:var(--text-muted);font-weight:600;">(Plaka ${String(activeStop.plate).padStart(2, '0')})</span></div>
                  </div>
                  <button type="button" class="mzp-primary-btn" id="mzp-inspector-city-btn" style="padding:8px 13px;font-size:0.8rem;">📍 İli İncele</button>
                </div>
                <div style="font-size:0.81rem;color:var(--text-secondary);line-height:1.5;">
                  ${esc(activeStop.quote)}
                </div>
                <div class="mzp-chips">
                  <span class="mzp-badge is-cyan">${activeStop.stopNumber === 1 ? 'Başlangıç Durağı' : `Önceki etaptan ${activeStop.legRoadKm} km (${activeStop.legAirKm} km kuş uçuşu)`}</span>
                  <span class="mzp-badge is-emerald">Toplam Menzil: ${activeStop.cumulativeRoadKm} km</span>
                </div>
                <div style="font-size:0.76rem;color:var(--text-muted);">
                  📐 Koordinat: <code>${activeStop.lat.toFixed(4)}°N, ${activeStop.lng.toFixed(4)}°E</code> • 📚 ${esc(activeStop.library)}
                </div>
              </div>

              <div class="mzp-legs-list" aria-label="9 Duraklı Etap Mesafe Listesi">
                ${stops
                  .map((s) => {
                    const isSel = s.key === activeStop.key;
                    return `
                      <button type="button" class="mzp-leg-row ${isSel ? 'is-selected' : ''}" data-leg-key="${esc(s.key)}">
                        <div>
                          <div style="font-weight:700;font-size:0.84rem;color:var(--text-primary);">${s.stopNumber}. ${esc(s.name)} <span style="font-weight:500;color:var(--text-muted);font-size:0.74rem;">(${esc(s.dayLabel)})</span></div>
                          <div style="font-size:0.72rem;color:var(--text-muted);">${esc(s.eraBadge)}</div>
                        </div>
                        <div style="text-align:right;flex-shrink:0;">
                          <div style="font-weight:800;font-size:0.8rem;color:var(--mzp-amber);">${s.stopNumber === 1 ? '0 km' : '+' + s.legRoadKm + ' km'}</div>
                          <div style="font-size:0.7rem;color:var(--text-muted);">Σ ${s.cumulativeRoadKm} km</div>
                        </div>
                      </button>
                    `;
                  })
                  .join('')}
              </div>
            </div>
          </div>
        </section>

        <!-- 3. 45-Day Master Plan, 180-Hour Library Roster, KYK Savings & Milestones -->
        <section class="mzp-section">
          <div class="mzp-section-head">
            <div>
              <h2 class="mzp-section-title">📅 45 Günlük Büyük Sefer Master Planı & Kazanım Projeksiyonu</h2>
              <p class="mzp-section-sub">9 İl × 5 Gün Kuralı • 180 Saat Kütüphane Ofisi • 99.000 ₺ GSB Seyahatsever KYK Tasarrufu • Nişan Kilidi Açılımı</p>
            </div>
            <span class="mzp-badge is-emerald">Hazırlık Takibi: ${readyCount}/9 İl Hazır</span>
          </div>

          <div class="mzp-master-grid">
            <!-- Bento 1: 180-Hour Library Roster -->
            <div class="mzp-bento-card">
              <div class="mzp-bento-title">
                <span>📚 180 Saatlik Kütüphane Mesaisi</span>
                <span class="mzp-badge is-cyan">9 Ofis × 20 sa</span>
              </div>
              <p class="mzp-prose">Her ilde 5 gün boyunca günde 4 saat <strong>İl Halk Kütüphanesi</strong> çalışma disiplini (toplam <strong>180 saat</strong>):</p>
              <div class="mzp-lib-checklist">
                ${stops
                  .map((s) => {
                    const checked = Boolean(prepState[s.key]);
                    return `
                      <label class="mzp-lib-item ${checked ? 'is-checked' : ''}">
                        <input type="checkbox" class="mzp-prep-check" data-prep-key="${esc(s.key)}" ${checked ? 'checked' : ''} />
                        <div>
                          <strong style="color:var(--text-primary);">${esc(s.name)} (${esc(s.dayLabel)})</strong>
                          <div>${esc(s.library)}</div>
                        </div>
                      </label>
                    `;
                  })
                  .join('')}
              </div>
            </div>

            <!-- Bento 2: GSB KYK Savings -->
            <div class="mzp-bento-card">
              <div class="mzp-bento-title">
                <span>🎒 GSB Seyahatsever KYK Ekonomisi</span>
                <span class="mzp-badge is-emerald">%100 Konaklama</span>
              </div>
              <div class="mzp-savings-box">
                <div style="font-size:0.78rem;color:var(--text-secondary);font-weight:600;">45 Gece × 2.200 ₺ Ortalama Otel Maliyeti</div>
                <div class="mzp-savings-big">${formatTL(metrics.kykSavingsTl)} Tasarruf</div>
                <div style="font-size:0.76rem;color:var(--text-secondary);margin-top:4px;">GSB Seyahatsever KYK Yurtları ile 9 ilde konaklama bedeli: <strong>0 ₺</strong></div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:5px;color:var(--text-secondary);">
                  <span>Sefer Hazırlık İlerlemesi</span>
                  <strong>${readyCount}/9 İl (%${Math.round((readyCount / 9) * 100)})</strong>
                </div>
                <div class="mzp-bar-track">
                  <div class="mzp-bar-fill" style="width:${Math.round((readyCount / 9) * 100)}%"></div>
                </div>
              </div>
              <div class="mzp-prose">
                • <strong>9 İl × 5 Gün = 45 Gece</strong> konaklama planı.<br />
                • Tasarruf edilen <strong>${formatTL(metrics.kykSavingsTl)}</strong> doğrudan müze, şehirlerarası ulaşım ve Mezopotamya gastronomi bütçesine aktarılır.
              </div>
            </div>

            <!-- Bento 3: Milestone Unlock Preview -->
            <div class="mzp-bento-card">
              <div class="mzp-bento-title">
                <span>🏆 Nişan & Rütbe Önizlemesi</span>
                <span class="mzp-badge">${metrics.currentVisitedCities} ➔ ${metrics.afterVisitedCities} İl</span>
              </div>
              <div class="mzp-prose">
                Sefer Öncesi: <strong>${metrics.currentVisitedCities}/${metrics.totalCities} İl (%${metrics.currentPct})</strong> • <strong>${metrics.currentVisitedRegions}/${metrics.totalRegions} Bölge</strong> • ${metrics.currentDaysOnRoad} Gün • ${metrics.currentLibHours} sa kütüphane.<br />
                Sefer Sonrası: <strong style="color:var(--mzp-emerald);">${metrics.afterVisitedCities}/${metrics.totalCities} İl (%${metrics.afterPct})</strong> • <strong>${metrics.afterVisitedRegions}/${metrics.totalRegions} Bölge</strong> • ${metrics.afterDaysOnRoad} Gün • ${metrics.afterLibHours} sa kütüphane.
              </div>
              <div class="mzp-milestone-pair">
                <div class="mzp-milestone-card">
                  <div class="mzp-milestone-icon">🌍</div>
                  <div>
                    <div style="font-weight:800;font-size:0.88rem;color:var(--text-primary);">Yedi İklim Fatihi (${metrics.afterVisitedRegions}/${metrics.totalRegions} Bölge)</div>
                    <div style="font-size:0.75rem;color:var(--text-secondary);">Türkiye’nin 7 coğrafi bölgesinin tamamına ayak basma büyük rozeti açılır.</div>
                  </div>
                </div>
                <div class="mzp-milestone-card">
                  <div class="mzp-milestone-icon">📜</div>
                  <div>
                    <div style="font-weight:800;font-size:0.88rem;color:var(--text-primary);">Evliya Çelebi İzinde (${metrics.afterVisitedCities}/${metrics.totalCities} İl)</div>
                    <div style="font-size:0.75rem;color:var(--text-secondary);">41 il yarı yol eşiğini (⭐) aşarak yeni seyyah rütbesine terfi sağlanır.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3B. Personal 9-Province Readiness Checklist (localStorage persisted) -->
        <section class="mzp-section" aria-label="Kişisel 9 İl Mezopotamya Hazırlık Kontrol Listesi">
          <div class="mzp-section-head">
            <div>
              <h2 class="mzp-section-title">✅ Kişisel 9 İl Mezopotamya Hazırlık Kontrol Listesi</h2>
              <p class="mzp-section-sub">Her il için KYK rezervasyonu, kütüphane çalışma notu ve rota hazırlığınızı işaretleyin — tarayıcınızda otomatik kaydedilir.</p>
            </div>
            <div class="mzp-btn-group">
              <span class="mzp-badge is-emerald">${readyCount}/9 İl Hazır (%${Math.round((readyCount / 9) * 100)})</span>
              <button type="button" class="mzp-pill-btn" id="mzp-prep-check-all">☑️ Tümünü İşaretle</button>
              <button type="button" class="mzp-pill-btn" id="mzp-prep-clear-all">⬜ Sıfırla</button>
            </div>
          </div>

          <div class="mzp-bar-track" style="margin-top:4px;">
            <div class="mzp-bar-fill" style="width:${Math.round((readyCount / 9) * 100)}%"></div>
          </div>

          <div class="mzp-readiness-grid">
            ${stops
              .map((s) => {
                const isReady = Boolean(prepState[s.key]);
                return `
                  <label class="mzp-readiness-item ${isReady ? 'is-ready' : ''}">
                    <input type="checkbox" class="mzp-prep-check" data-prep-key="${esc(s.key)}" ${isReady ? 'checked' : ''} />
                    <div style="min-width:0;flex:1;">
                      <div class="mzp-readiness-name">
                        <span>#${s.stopNumber} ${esc(s.name)} (${String(s.plate).padStart(2, '0')})</span>
                        <span style="font-size:0.72rem;font-weight:700;">${isReady ? '✅ Hazır' : '⏳ Plan'}</span>
                      </div>
                      <div class="mzp-readiness-sub">${esc(s.dayLabel)} • ${esc(s.eraBadge)}</div>
                    </div>
                  </label>
                `;
              })
              .join('')}
          </div>
        </section>

        <!-- 4. Gemini AI Mezopotamya Sefer Stratejisi & Tefekkürü -->
        <section class="mzp-section" id="mzp-ai-section">
          <div class="mzp-section-head">
            <div>
              <h2 class="mzp-section-title">✨ Gemini AI ile Mezopotamya Sefer Stratejisi & Tefekkürü Üret</h2>
              <p class="mzp-section-sub">
                ${hasAiKey ? 'BYOK Gemini AI bağlantısı hazır (canlı SSE akışı + çevrimdışı yedek).' : 'API anahtarı girilmemişse yerleşik çevrimdışı Mezopotamya sefer rehberi devreye girer.'}
              </p>
            </div>
            ${uiState.aiText ? `<button type="button" class="mzp-secondary-btn" id="mzp-copy-ai">📋 Stratejiyi Kopyala</button>` : ''}
          </div>

          <div class="mzp-ai-controls">
            <div class="mzp-field">
              <label for="mzp-ai-season">Sefer Mevsimi</label>
              <select id="mzp-ai-season" class="mzp-select">
                <option value="ilkbahar" ${uiState.aiSeason === 'ilkbahar' ? 'selected' : ''}>🌸 İlkbahar (Nisan–Mayıs)</option>
                <option value="sonbahar" ${uiState.aiSeason === 'sonbahar' ? 'selected' : ''}>🍂 Sonbahar (Eylül–Ekim / Ekinoks)</option>
                <option value="kis" ${uiState.aiSeason === 'kis' ? 'selected' : ''}>❄️ Kış (Aralık–Şubat)</option>
                <option value="yaz" ${uiState.aiSeason === 'yaz' ? 'selected' : ''}>☀️ Yaz (Haziran–Ağustos)</option>
              </select>
            </div>
            <div class="mzp-field">
              <label for="mzp-ai-focus">Odak Ekseni</label>
              <select id="mzp-ai-focus" class="mzp-select">
                <option value="dengeli" ${uiState.aiFocus === 'dengeli' ? 'selected' : ''}>⚖️ Dengeli Sefer (5 Gün + İrfan + Tarih)</option>
                <option value="irfan" ${uiState.aiFocus === 'irfan' ? 'selected' : ''}>🕊️ Manevî Miras & Tefekkür</option>
                <option value="verimlilik" ${uiState.aiFocus === 'verimlilik' ? 'selected' : ''}>💻 Kütüphane & El-Cezerî Verimliliği</option>
                <option value="gastronomi" ${uiState.aiFocus === 'gastronomi' ? 'selected' : ''}>🍽️ Gastronomi & Tarihî Çarşılar</option>
              </select>
            </div>
            <div class="mzp-field">
              <label for="mzp-ai-note">Ek Seyyah Notu (İsteğe Bağlı)</label>
              <input id="mzp-ai-note" class="mzp-input" type="text" maxlength="140" value="${esc(uiState.aiCustomNote)}" placeholder="Örn: Tillo Işık Hadisesi ve Nemrut gün doğumu..." />
            </div>
          </div>

          <div class="mzp-btn-group">
            <button type="button" class="mzp-primary-btn" id="mzp-btn-generate-ai" ${uiState.aiGenerating ? 'disabled' : ''}>
              ${uiState.aiGenerating ? '⏳ Strateji Hazırlanıyor...' : '✨ Gemini AI ile Mezopotamya Sefer Stratejisi & Tefekkürü Üret'}
            </button>
            ${
              uiState.aiSourceLabel
                ? `<span class="mzp-badge is-cyan">${esc(uiState.aiSourceLabel)}${uiState.aiModel ? ' • ' + esc(uiState.aiModel) : ''}</span>`
                : ''
            }
          </div>

          <div id="mzp-ai-output-wrap" class="mzp-ai-output" ${uiState.aiText ? '' : 'style="display:none;"'}>
            ${uiState.aiText ? renderSafeMarkdown(uiState.aiText, esc) : ''}
          </div>
        </section>

        <!-- 5. 9 Detailed Province Dossier Cards -->
        <section class="mzp-section">
          <div class="mzp-section-head">
            <div>
              <h2 class="mzp-section-title">🏛️ 9 İl Detaylı Mezopotamya Sefer Dosyaları</h2>
              <p class="mzp-section-sub">Her ilin gerçek banner & galeri fotoğrafları, tarihi, manevî mirası, mutfağı, kütüphane ofisi ve il detay bağlantısı.</p>
            </div>
            <div class="mzp-btn-group">
              <button type="button" class="mzp-pill-btn ${uiState.dossierFilter === 'all' ? 'active' : ''}" data-filter="all">Tümü (9 İl)</button>
              <button type="button" class="mzp-pill-btn ${uiState.dossierFilter === 'firat' ? 'active' : ''}" data-filter="firat">🌊 Fırat Havzası (4)</button>
              <button type="button" class="mzp-pill-btn ${uiState.dossierFilter === 'dicle' ? 'active' : ''}" data-filter="dicle">🏜️ Dicle & Yukarı Mezopotamya (5)</button>
            </div>
          </div>

          <div class="mzp-dossier-grid">
            ${visibleDossiers
              .map((s) => {
                const isHighlighted = s.key === activeStop.key;
                const litQuote = s.literaryQuotes && s.literaryQuotes.length ? cleanQuote(s.literaryQuotes[0]) : '';
                return `
                  <article class="mzp-dossier-card ${isHighlighted ? 'is-highlighted' : ''}" id="mzp-card-${esc(s.slug)}">
                    <div class="mzp-photo-duo">
                      <span class="mzp-stop-floating-badge">#${s.stopNumber} • ${esc(s.dayLabel)}</span>
                      <div class="mzp-photo-slot" data-lightbox-key="${esc(s.key)}" data-lightbox-idx="0" title="Banner fotoğrafını büyüt">
                        <img src="${esc(s.bannerRel)}" alt="${esc(s.name)} manzarası" loading="lazy" />
                        <span class="mzp-photo-tag">banner.jpg</span>
                      </div>
                      <div class="mzp-photo-slot" data-lightbox-key="${esc(s.key)}" data-lightbox-idx="1" title="Galeri fotoğrafını büyüt">
                        <img src="${esc(s.galleryRel)}" alt="${esc(s.name)} dokusu" loading="lazy" />
                        <span class="mzp-photo-tag">gallery.jpg</span>
                      </div>
                    </div>

                    <div class="mzp-dossier-body">
                      <div class="mzp-dossier-head">
                        <div>
                          <h3 class="mzp-city-name">${esc(s.name)} <span style="font-size:0.8rem;color:var(--text-muted);font-weight:600;">(${String(s.plate).padStart(2, '0')})</span></h3>
                          <div class="mzp-era-lbl">${esc(s.eraBadge)}</div>
                        </div>
                        <span class="mzp-badge">${s.stopNumber === 1 ? 'Başlangıç' : '+' + s.legRoadKm + ' km'}</span>
                      </div>

                      <blockquote class="mzp-quote-txt">“${esc(s.quote)}”</blockquote>

                      <div>
                        <div class="mzp-block-label">📜 Tarih & Seyyah Tefekkürü</div>
                        <p class="mzp-prose">${esc(s.historySummary)}</p>
                      </div>

                      <div class="mzp-irfan-box">
                        <div class="mzp-block-label" style="color:var(--mzp-amber);">🕌 Manevî Miras & İrfan</div>
                        <p class="mzp-prose" style="color:var(--text-primary);">${esc(s.spiritualHeritage)}</p>
                      </div>

                      <div>
                        <div class="mzp-block-label">🍽️ Meşhur Lezzetler</div>
                        <div class="mzp-chips">
                          ${s.specialties
                            .map((food) => `<span class="mzp-chip is-food">${esc(food)}</span>`)
                            .join('')}
                        </div>
                      </div>

                      <div class="mzp-lib-strip">
                        📚 <strong>20 Saat Kütüphane Ofisi:</strong> ${esc(s.library)}
                      </div>

                      ${
                        litQuote
                          ? `<div style="font-size:0.75rem;color:var(--text-muted);font-style:italic;line-height:1.45;">✒️ ${esc(litQuote)}</div>`
                          : ''
                      }

                      <div class="mzp-dossier-footer">
                        <span style="font-size:0.74rem;color:var(--text-muted);font-weight:600;">Σ ${s.cumulativeRoadKm} km • 5 Gün / 0 ₺ KYK</span>
                        <button type="button" class="mzp-primary-btn mzp-city-inspect-btn" data-city-key="${esc(s.key)}" style="padding:7px 14px;font-size:0.8rem;">
                          📍 İli İncele
                        </button>
                      </div>
                    </div>
                  </article>
                `;
              })
              .join('')}
          </div>
        </section>
      </div>
    `;

    // -------------------------------------------------------------------------
    // Event Wiring
    // -------------------------------------------------------------------------
    function selectStop(key, scrollIntoView) {
      if (!key) return;
      uiState.selectedKey = key;
      render(container, safeCtx);
      if (scrollIntoView) {
        const stop = stops.find((s) => s.key === key);
        if (stop) {
          const card = container.querySelector(`#mzp-card-${stop.slug}`);
          if (card && typeof card.scrollIntoView === 'function') {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    }

    container.querySelectorAll('.mzp-svg-node, .mzp-svg-leg').forEach((el) => {
      el.addEventListener('click', () => {
        const key = el.getAttribute('data-stop-key');
        if (key) selectStop(key, false);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const key = el.getAttribute('data-stop-key');
          if (key) selectStop(key, false);
        }
      });
    });

    container.querySelectorAll('[data-leg-key]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-leg-key');
        if (key) selectStop(key, true);
      });
    });

    container.querySelectorAll('[data-dir]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = btn.getAttribute('data-dir');
        if (dir && dir !== uiState.direction) {
          uiState.direction = dir;
          render(container, safeCtx);
        }
      });
    });

    container.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        if (filter && filter !== uiState.dossierFilter) {
          uiState.dossierFilter = filter;
          render(container, safeCtx);
        }
      });
    });

    const loadMainRouteBtn = container.querySelector('#mzp-load-main-route');
    if (loadMainRouteBtn) {
      loadMainRouteBtn.addEventListener('click', () => {
        const corridorNames = stops.map((s) => s.name);
        if (safeCtx.state) {
          safeCtx.state.customRouteCities = corridorNames;
        }
        showToast(`🧭 9 İllik Mezopotamya Koridoru (${corridorNames[0]} ➔ ${corridorNames[corridorNames.length - 1]}) Rota Planlayıcıya yüklendi!`);
        if (typeof safeCtx.openView === 'function') {
          safeCtx.openView('route');
        } else if (typeof window !== 'undefined') {
          window.location.hash = '#route';
        }
      });
    }

    const prepCheckAllBtn = container.querySelector('#mzp-prep-check-all');
    if (prepCheckAllBtn) {
      prepCheckAllBtn.addEventListener('click', () => {
        const next = readPrepState();
        stops.forEach((s) => {
          next[s.key] = true;
        });
        writePrepState(next);
        render(container, safeCtx);
        showToast('✅ 9 Mezopotamya ilinin tamamı hazır olarak işaretlendi!');
      });
    }

    const prepClearAllBtn = container.querySelector('#mzp-prep-clear-all');
    if (prepClearAllBtn) {
      prepClearAllBtn.addEventListener('click', () => {
        const next = readPrepState();
        stops.forEach((s) => {
          next[s.key] = false;
        });
        writePrepState(next);
        render(container, safeCtx);
        showToast('⬜ Mezopotamya hazırlık kontrol listesi sıfırlandı.');
      });
    }

    const openActiveBtn = container.querySelector('#mzp-open-active-city');
    if (openActiveBtn) {
      openActiveBtn.addEventListener('click', () => selectCity(activeStop.key));
    }
    const inspectorCityBtn = container.querySelector('#mzp-inspector-city-btn');
    if (inspectorCityBtn) {
      inspectorCityBtn.addEventListener('click', () => selectCity(activeStop.key));
    }

    container.querySelectorAll('.mzp-city-inspect-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-city-key');
        if (key) selectCity(key);
      });
    });

    container.querySelectorAll('[data-lightbox-key]').forEach((slot) => {
      slot.addEventListener('click', () => {
        const key = slot.getAttribute('data-lightbox-key');
        const idx = parseInt(slot.getAttribute('data-lightbox-idx') || '0', 10);
        const stop = stops.find((s) => s.key === key);
        if (!stop || !openLightbox) return;
        openLightbox(
          [
            { src: stop.bannerRel, caption: `${stop.name} — Ana Manzara (banner.jpg)` },
            { src: stop.galleryRel, caption: `${stop.name} — Kültür & Mimari (gallery.jpg)` }
          ],
          idx
        );
      });
    });

    container.querySelectorAll('.mzp-prep-check').forEach((chk) => {
      chk.addEventListener('change', () => {
        const key = chk.getAttribute('data-prep-key');
        if (!key) return;
        const next = readPrepState();
        next[key] = chk.checked;
        writePrepState(next);
        render(container, safeCtx);
      });
    });

    const scrollAiBtn = container.querySelector('#mzp-scroll-ai');
    if (scrollAiBtn) {
      scrollAiBtn.addEventListener('click', () => {
        const sec = container.querySelector('#mzp-ai-section');
        if (sec && typeof sec.scrollIntoView === 'function') {
          sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    const seasonSelect = container.querySelector('#mzp-ai-season');
    const focusSelect = container.querySelector('#mzp-ai-focus');
    const noteInput = container.querySelector('#mzp-ai-note');
    if (seasonSelect) seasonSelect.addEventListener('change', () => { uiState.aiSeason = seasonSelect.value; });
    if (focusSelect) focusSelect.addEventListener('change', () => { uiState.aiFocus = focusSelect.value; });
    if (noteInput) noteInput.addEventListener('input', () => { uiState.aiCustomNote = noteInput.value; });

    const copyBtn = container.querySelector('#mzp-copy-ai');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        if (!uiState.aiText) return;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(uiState.aiText);
            showToast('📋 Mezopotamya Sefer Stratejisi panoya kopyalandı');
          }
        } catch (_) {
          showToast('Kopyalama desteklenmiyor');
        }
      });
    }

    const genBtn = container.querySelector('#mzp-btn-generate-ai');
    if (genBtn) {
      genBtn.addEventListener('click', async () => {
        if (uiState.aiGenerating) return;
        uiState.aiGenerating = true;
        uiState.aiText = '';
        uiState.aiModel = '';
        uiState.aiSourceLabel = '';
        genBtn.disabled = true;
        genBtn.textContent = '⏳ Mezopotamya Stratejisi Üretiliyor...';

        const outWrap = container.querySelector('#mzp-ai-output-wrap');
        if (outWrap) {
          outWrap.style.display = 'block';
          outWrap.innerHTML = '<p class="mzp-md-p">🏜️ Fırat’tan Dicle’ye 45 günlük strateji ve tefekkür metni hazırlanıyor...</p>';
        }

        const useGemini =
          window.SEYYAH_AI &&
          typeof window.SEYYAH_AI.stream === 'function' &&
          typeof window.SEYYAH_AI.hasKey === 'function' &&
          window.SEYYAH_AI.hasKey();

        if (useGemini) {
          try {
            const prompt = buildGeminiPrompt(stops, metrics);
            const cacheKey = `mzp_${uiState.direction}_${uiState.aiSeason}_${uiState.aiFocus}_${uiState.aiCustomNote.trim()}`;
            const res = await window.SEYYAH_AI.stream({
              prompt,
              system:
                'Sen Anadolu Seyahatnamesi projesinin edep, irfan ve seyahat stratejisi rehberisin. Yanıtların somut, tarihî bakımdan doğru, edebî ve uygulanabilir olsun.',
              temperature: 0.72,
              maxTokens: 2048,
              cacheKey,
              onChunk: function (_delta, full) {
                uiState.aiText = full;
                if (outWrap) {
                  outWrap.innerHTML = renderSafeMarkdown(full, esc);
                }
              }
            });
            uiState.aiText = (res && res.text) || uiState.aiText;
            uiState.aiModel = (res && res.model) || '';
            uiState.aiSourceLabel = '✨ Gemini AI';
            uiState.aiGenerating = false;
            render(container, safeCtx);
            return;
          } catch (_) {
            // Fall through smoothly to offline Mezopotamya strategist
          }
        }

        uiState.aiText = buildOfflineStrategyMarkdown(stops, metrics);
        uiState.aiSourceLabel = '🏜️ Çevrimdışı Mezopotamya Rehberi';
        uiState.aiModel = 'Yerleşik 9 İl Strateji Motoru';
        uiState.aiGenerating = false;
        render(container, safeCtx);
        showToast('✨ Mezopotamya Sefer Stratejisi hazırlandı');
      });
    }
  }

  window.SEYYAH_MODULES.mesopotamia = {
    render
  };
})();
