/**
 * Anadolu Mimari Şaheserleri: Kubbe, Taş, Köprü & Darüşşifa Hendesesi
 * "Taşa Nakşedilen Tevhid ve Merhamet" felsefesiyle 24 Anadolu şaheserini,
 * etkileşimli Kubbe/Kemer/Mukarnas Hendesesi diyagramını ve Gemini AI mimari yorumunu sunar.
 * Registers on window.SEYYAH_MODULES.architecture = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'saw-architecture-styles';
  const PHILOSOPHY_MOTTO = 'Taşa Nakşedilen Tevhid ve Merhamet';

  // ---------------------------------------------------------------------------
  // Helpers (Escaping, Turkish Normalization, Markdown, Province Resolution)
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

  function fallbackRenderMarkdown(md, esc) {
    if (!md) return '';
    const safeEsc = typeof esc === 'function' ? esc : fallbackEscapeHtml;
    const lines = String(md).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let inList = false;

    function inlineFormat(txt) {
      let s = safeEsc(txt);
      s = s.replace(/`([^`]+?)`/g, '<code>$1</code>');
      s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/(^|[^\w*])\*([^\s*](?:[^*]*?[^\s*])?)\*(?=[^\w*]|$)/g, '$1<em>$2</em>');
      return s;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        if (inList) {
          out.push('</ul>');
          inList = false;
        }
        continue;
      }
      const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
      if (hMatch) {
        if (inList) {
          out.push('</ul>');
          inList = false;
        }
        const lvl = hMatch[1].length;
        out.push(`<h${lvl} class="seyyah-md-h${lvl}">${inlineFormat(hMatch[2])}</h${lvl}>`);
        continue;
      }
      const qMatch = line.match(/^>\s?(.*)$/);
      if (qMatch) {
        if (inList) {
          out.push('</ul>');
          inList = false;
        }
        out.push(`<blockquote class="seyyah-md-quote">${inlineFormat(qMatch[1])}</blockquote>`);
        continue;
      }
      const liMatch = line.match(/^[-*•]\s+(.+)$/);
      if (liMatch) {
        if (!inList) {
          out.push('<ul class="seyyah-md-list">');
          inList = true;
        }
        out.push(`<li>${inlineFormat(liMatch[1])}</li>`);
        continue;
      }
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<p class="seyyah-md-p">${inlineFormat(line)}</p>`);
    }
    if (inList) out.push('</ul>');
    return out.join('\n');
  }

  function renderMdSafe(md, esc) {
    if (window.SEYYAH_AI && typeof window.SEYYAH_AI.renderMarkdown === 'function') {
      return window.SEYYAH_AI.renderMarkdown(md, esc);
    }
    return fallbackRenderMarkdown(md, esc);
  }

  function formatPlate(plate) {
    const n = Number(plate);
    if (!Number.isFinite(n) || n <= 0) return '--';
    return String(n).padStart(2, '0');
  }

  function resolveProvincesMap(ctx) {
    if (ctx && ctx.data && ctx.data.provinces) return ctx.data.provinces;
    if (typeof TRAVEL_DATA !== 'undefined' && TRAVEL_DATA && TRAVEL_DATA.provinces) {
      return TRAVEL_DATA.provinces;
    }
    return {};
  }

  function resolveBannerPath(prov) {
    if (prov && prov.has_banner && prov.banner_rel) return prov.banner_rel;
    if (prov && prov.banner_rel) return prov.banner_rel;
    if (prov && Array.isArray(prov.images) && prov.images[0]) return prov.images[0];
    return 'assets/banner.jpg';
  }

  // ---------------------------------------------------------------------------
  // Categories (4 Core Architectural Disciplines)
  // ---------------------------------------------------------------------------
  const CATEGORIES = [
    {
      id: 'camiler',
      icon: '🕌',
      label: 'Selâtin Camileri & Ulu Camiler',
      shortLabel: 'Camiler & Külliyeler',
      subtitle: 'Merkezî kubbe, akustik boşluk ve tevhidin göğe açılan taş hendesesi'
    },
    {
      id: 'kopruler',
      icon: '🌉',
      label: 'Tarihi Taş Köprüler & Su Kemerleri',
      shortLabel: 'Taş Köprüler',
      subtitle: 'Kilit taşı dengesi, tahliye gözleri ve iki yakayı birleştiren hayır mimarisi'
    },
    {
      id: 'darussifalar',
      icon: '🏥',
      label: 'Selçuklu & Osmanlı Darüşşifaları (Şifa Medeniyeti)',
      shortLabel: 'Darüşşifalar',
      subtitle: 'Su sesi, makam musikisi, eyvan serinliği ve merhametle tedavi eden mekânlar'
    },
    {
      id: 'saraylar',
      icon: '🏰',
      label: 'Saraylar, Surlar & Kaya Mimarisi',
      shortLabel: 'Saray & Surlar',
      subtitle: 'Topografyayla bütünleşen burçlar, yüksek rakımlı saraylar ve taş oyma destanları'
    }
  ];

  const CATEGORY_MAP = new Map(CATEGORIES.map(function (c) { return [c.id, c]; }));

  // ---------------------------------------------------------------------------
  // Interactive SVG Diagram Data: "Kubbe, Kemer ve Mukarnas Hendesesi"
  // ---------------------------------------------------------------------------
  const HENDESE_PARTS = [
    {
      id: 'kubbe',
      code: '01',
      title: 'Ana Kubbe & Kasnak Işık Çemberi',
      subtitle: 'Merkezî Gökkubbe · Tevhid Mekânı',
      color: '#00f2fe',
      geometry: 'Yarım küre kabuk geometrisi + 16–32 pencere kasnağı + kurşun kaplama',
      statics:
        'Kubbe ağırlığı meridyenel basınç kuvvetlerine dönüştürülür; kasnak pencereleri arasındaki payandalar dışa açılma (itki) kuvvetini dengeler. İç cidardaki küp/testi rezonatörleri sesi eşit dağıtır.',
      philosophy:
        'Çokluğu birliğe (kesretten vahdete) toplayan gökkubbe sembolüdür. Cemaati tek bir merkez altında eşitler; kasnak pencerelerinden süzülen ışık taşı ağırlıksız kılar.',
      examples: ['edirne-selimiye', 'istanbul-suleymaniye', 'bursa-ulu-cami']
    },
    {
      id: 'pandantif',
      code: '02',
      title: 'Pandantif & Türk Üçgeni Geçişi',
      subtitle: 'Kareden Daireye Kozmik Dönüşüm',
      color: '#f59e0b',
      geometry: 'Küresel üçgen (pandantif), tromp veya prizmatik Türk üçgeni kuşağı',
      statics:
        'Dairesel kubbe tabanını dörtgen (kare/sekizgen) ayaklara kesintisiz bağlayarak düşey ve yanal yüklerin köşe fil ayaklarına akmasını sağlar.',
      philosophy:
        'Dört köşeli yeryüzünden (dört unsur ve dört yön) dairesel gökyüzüne (sonsuzluk ve tevhid) yükselişin geometrik köprüsüdür.',
      examples: ['edirne-selimiye', 'bursa-ulu-cami', 'edirne-bayezid-darussifa']
    },
    {
      id: 'mukarnas',
      code: '03',
      title: 'Mukarnas Taçkapı & Petek Hendesesi',
      subtitle: 'Işık–Gölge Ritmi · Fraktal Taş Oyma',
      color: '#a855f7',
      geometry: 'İki boyutlu yıldız çokgen projeksiyonun üç boyutlu kademeli nişlere açılımı',
      statics:
        'Kademeli konsollar birbirine kilitlenerek derin taçkapı nişlerini kendi ağırlığıyla ayakta tutar; taş yüzeydeki oyuklar rüzgâr ve yağmur erozyonunu kırar.',
      philosophy:
        'Güneşin hareketiyle gün boyu değişen gölgeler oluşturur; taşa hareketsiz bir kütle değil, zikreden canlı bir geometri kazandırır.',
      examples: ['sivas-divrigi-ulu-cami', 'erzurum-cifte-minareli', 'mardin-kasimiye']
    },
    {
      id: 'kemer',
      code: '04',
      title: 'Sivri Kemer, Kilit Taşı & Tahliye Gözü',
      subtitle: 'Gerilimsiz Basınç Dengesi',
      color: '#10b981',
      geometry: 'İki merkezli sivri/beşik kemer + ortada kama biçimli kilit taşı (keystone)',
      statics:
        'Sivri kemer, yarım daire kemere kıyasla yanal itkiyi %35’e kadar azaltır. En tepedeki kilit taşı tüm taş blokları sıkıştırarak harçsız bile ayakta kalan bir basınç yayı kurar; taşkın gözleri sel basıncını boşaltır.',
      philosophy:
        'Her taş komşusuna yaslanarak yükselir; bir taş eksilirse kemer bozulur, kilit taşı konunca bütünlük tamamlanır — toplum ve kardeşlik nizamının taş halidir.',
      examples: ['diyarbakir-malabadi', 'adiyaman-cendere', 'adana-varda']
    },
    {
      id: 'darussifa',
      code: '05',
      title: 'Dört Eyvan, Şadırvan & Şifa Akustiği',
      subtitle: 'Su Sesi, Makam ve Işık Terapisi',
      color: '#38bdf8',
      geometry: 'Merkezi şadırvanlı avlu + dört ana yöne bakan eyvanlar + kubbeli şifa odaları',
      statics:
        'Kalın kesme taş duvarlar ısıl kütle (termal tampon) sağlar; orta şadırvandan buharlaşan su yazın doğal serinletme, kapalı kubbeli odalar ise kışın ısı muhafazası üretir.',
      philosophy:
        'Anadolu darüşşifalarında hastalık yalnız bedende değil ruhta aranır; su şırıltısı, gül kokusu ve Hüseynî/Rast makamları mimarinin iyileştirici unsurlarıdır.',
      examples: ['kayseri-gevher-nesibe', 'edirne-bayezid-darussifa', 'amasya-darussifasi']
    },
    {
      id: 'filayagi',
      code: '06',
      title: 'Fil Ayağı, Payanda & Horasan Temeli',
      subtitle: 'Sekizgen Taşıyıcı Sistem & Zemin Emniyeti',
      color: '#fb7185',
      geometry: 'Sekizgen/çokgen masif taş pâyeler + zıvana kurşun kenet + horasan harcı',
      statics:
        'Deprem dalgalarına karşı kireç-tuğla tozu karışımlı elastik horasan harcı ve taş bloklar arasına dökülen kurşun kenetler şok sönümleyici (sismik izolatör) görevi görür.',
      philosophy:
        'Görünmeyen temeldeki sadakat olmadan görünürdeki kubbe yükselmez. Mimar Sinan’ın “temeli kurutma ve oturtma” sabrı, kalıcılığın ahlakıdır.',
      examples: ['istanbul-suleymaniye', 'diyarbakir-surlari', 'agri-ishak-pasa']
    }
  ];

  // ---------------------------------------------------------------------------
  // 24 Architectural Masterpieces mapped to real ctx.data.provinces keys
  // ---------------------------------------------------------------------------
  const MASTERPIECES = [
    // 1. Selâtin Camileri & Ulu Camiler (6)
    {
      id: 'edirne-selimiye',
      name: 'Edirne Selimiye Camii',
      category: 'camiler',
      provinceKey: '01_Marmara/Edirne',
      provinceName: 'Edirne',
      district: 'Merkez',
      region: 'Marmara',
      era: 'Osmanlı Klasik Dönem',
      year: '1569–1575',
      architect: 'Mimar Sinan (Ustalık Eseri)',
      patron: 'Sultan II. Selim',
      material: 'Küfeki taşı, Marmara mermeri, İznik çinisi',
      structuralSystem: 'Sekizgen baldaken üzerine 31,3 m çaplı tek merkezî kubbe',
      dimensions: 'Kubbe çapı 31,3 m · Yükseklik 43,25 m · 4 minare (70,89 m)',
      unesco: 'UNESCO Dünya Mirası (2011)',
      philosophy:
        'Sinan, mekânı parçalayan ara sütunları kaldırarak tüm cemaati tek bir gökkubbe altında toplar. Tek merkezî kubbe, İslam tevhid anlayışının mimari zirvesidir.',
      architecturalDetails:
        'Sekiz fil ayağına oturan kubbenin çevresinde yarım kubbe kullanılmamış, köşe eksedraları ve ağırlık kuleleriyle yanal itki dengelenmiştir. 999 pencereli ışık kurgusu ve üçer yollu ince minareleri taş mühendisliği harikasıdır.'
    },
    {
      id: 'istanbul-suleymaniye',
      name: 'İstanbul Süleymaniye Camii',
      category: 'camiler',
      provinceKey: '01_Marmara/Istanbul',
      provinceName: 'İstanbul',
      district: 'Fatih (Süleymaniye Tepesi)',
      region: 'Marmara',
      era: 'Osmanlı Klasik Dönem',
      year: '1550–1557',
      architect: 'Mimar Sinan (Kalfalık Eseri)',
      patron: 'Kanuni Sultan Süleyman',
      material: 'Küfeki taşı, porfir ve granit devşirme sütunlar, kurşun',
      structuralSystem: '4 fil ayağı, 2 yarım kubbe ve 53 m yükselen ana kubbe sistemi',
      dimensions: 'Kubbe çapı 26,2 m · Yükseklik 47,8 m · 4 minare',
      unesco: 'UNESCO Dünya Mirası (İstanbul Tarihi Alanları)',
      philosophy:
        'Haliç silüetine hükmeden bir tevhid ve nizam külliyesidir; cami, medreseler, darüşşifa, kütüphane ve imaretle ilim ve merhameti tek tepede birleştirir.',
      architecturalDetails:
        'Kubbe içinde ses yankısını dengeleyen 64 adet içi boş toprak küp rezonatörü, kandil islerini toplayarak mürekkebe dönüştüren is odası ve Haliç rüzgarını kullanan doğal havalandırma kanallarıyla yaşar.'
    },
    {
      id: 'bursa-ulu-cami',
      name: 'Bursa Ulu Cami',
      category: 'camiler',
      provinceKey: '01_Marmara/Bursa',
      provinceName: 'Bursa',
      district: 'Osmangazi',
      region: 'Marmara',
      era: 'Erken Osmanlı',
      year: '1396–1400',
      architect: 'Ali Neccar',
      patron: 'Yıldırım Bayezid',
      material: 'Kesme küfeki taşı, ceviz ağacı (kündekâri minber)',
      structuralSystem: '12 masif ayak üzerinde 20 eşit kubbeli çok ayaklı (ulucami) şeması',
      dimensions: '55 × 69 m · 20 kubbe (4×5 düzen) · 16 köşeli şadırvan',
      unesco: 'UNESCO Dünya Mirası (2014)',
      philosophy:
        'İç mekanın tam ortasındaki aydınlık fenerinin altında yer alan 16 köşeli şadırvan, ibadet mekânına suyun arındırıcı sesini ve Somuncu Baba’nın tevazu mirasını taşır.',
      architecturalDetails:
        'Merkez kubbesi başlangıçta açık bırakılmış, sonradan cam fenerle kapatılmıştır. Çivisiz kündekâri tekniğiyle yapılan ceviz minberindeki güneş sistemi kabartması ve duvarlardaki 192 hat levhası eşsizdir.'
    },
    {
      id: 'sivas-divrigi-ulu-cami',
      name: 'Divriği Ulu Cami ve Darüşşifası',
      category: 'camiler',
      provinceKey: '04_IcAnadolu/Sivas',
      provinceName: 'Sivas',
      district: 'Divriği',
      region: 'İç Anadolu',
      era: 'Mengücekoğulları / Anadolu Selçuklu',
      year: '1228–1243',
      architect: 'Hürremşah el-Ahlatî',
      patron: 'Ahmed Şah & Melike Turan Melek',
      material: 'Sarımsı-kızıl kesme taş (volkanik tüf ve kalker)',
      structuralSystem: 'Tonoz ve yıldız kubbe örtülü cami + bitişik iki katlı darüşşifa',
      dimensions: 'Cami + Şifahane 64 × 32 m · 4 eşsiz taçkapı',
      unesco: 'UNESCO Dünya Mirası (1985 — Türkiye’nin İlkleri)',
      philosophy:
        'Cami ile darüşşifayı tek taş kütlede birleştirerek "ibadet ile şifa ikiz kardeştir" der. Taçkapılardaki hiçbir motif bir daha tekrarlanmaz; kâinattaki benzersizliği anlatır.',
      architecturalDetails:
        'Cennet Kapısı, Batı Kapısı, Şah Kapısı ve Şifahane Taçkapısı üç boyutlu yüksek kabartma taş oyma sanatının dünyada benzeri olmayan örnekleridir. İkindi vakti batı kapısında oluşan namaz kılan insan gölgesi ünlüdür.'
    },
    {
      id: 'diyarbakir-ulu-cami',
      name: 'Diyarbakır Ulu Cami',
      category: 'camiler',
      provinceKey: '07_GuneydoguAnadolu/Diyarbakir',
      provinceName: 'Diyarbakır',
      district: 'Sur',
      region: 'Güneydoğu Anadolu',
      era: 'Büyük Selçuklu / Artuklu',
      year: '1091 (Selçuklu Onarımı)',
      architect: 'Selçuklu & Artuklu Ustaları',
      patron: 'Melikşah (Onarım ve Külliye)',
      material: 'Siyah Diyarbakır bazalt taşı ve beyaz kalker (ablak örgü)',
      structuralSystem: 'Geniş avlulu, iki katlı sütunlu revaklar ve ahşap kırma/düz çatı harim',
      dimensions: 'Avlu + Harim ~90 × 65 m · 800 yıllık güneş saati',
      unesco: 'İslam’ın 5. Harem-i Şerifi',
      philosophy:
        'Karanlık bazalt ile aydınlık mermeri yan yana işleyerek zıtlıkların uyumunu sergiler; dört mezhebe açık avlusu ve El-Cezerî’nin güneş saatiyle ilim-hoşgörü merkezidir.',
      architecturalDetails:
        'Doğu ve batı maksure cephelerinde Korint başlıklı antik devşirme sütunlar üzerinde kûfî ve nesih hatlı taş kitabeler uzanır. Avludaki güneş saati gölge boyuyla namaz vakitlerini hassas biçimde gösterir.'
    },
    {
      id: 'erzurum-cifte-minareli',
      name: 'Erzurum Çifte Minareli Medrese',
      category: 'camiler',
      provinceKey: '06_DoguAnadolu/Erzurum',
      provinceName: 'Erzurum',
      district: 'Yakutiye',
      region: 'Doğu Anadolu',
      era: 'Anadolu Selçuklu / İlhanlı',
      year: 'XIII. Yüzyıl Sonu (~1271–1291)',
      architect: 'Selçuklu Taş & Çini Loncası',
      patron: 'Hüdâvend Hatun (Alâeddin Keykubad kızı rivayeti)',
      material: 'Andezit kesme taş, sırlı tuğla, firuze ve lacivert çini',
      structuralSystem: 'Açık avlulu, dört eyvanlı, iki katlı medrese + silindirik kümbet',
      dimensions: '35 × 46 m · 26 m yüksekliğinde çifte yivli tuğla minare',
      unesco: 'Anadolu Selçuklu Taş Süsleme Zirvesi',
      philosophy:
        'Taçkapısındaki Hayat Ağacı, çift başlı kartal ve ejder kabartmaları; ilmin yeryüzünden göğe uzanan köklerini ve koruyucu hikmeti simgeler.',
      architecturalDetails:
        'İki yanında yivli tuğla gövdeli minarelerin yükseldiği abidevî taçkapısı, 16 dilimli mukarnaslı nişi ve güney ucundaki onikigen kümbetiyle Erzurum’un kış ışığında parlayan taş anıtıdır.'
    },

    // 2. Tarihi Taş Köprüler & Su Kemerleri (6)
    {
      id: 'diyarbakir-malabadi',
      name: 'Malabadi Köprüsü',
      category: 'kopruler',
      provinceKey: '07_GuneydoguAnadolu/Diyarbakir',
      secondaryProvinceKey: '07_GuneydoguAnadolu/Batman',
      provinceName: 'Diyarbakır / Batman',
      district: 'Silvan (Batman Çayı)',
      region: 'Güneydoğu Anadolu',
      era: 'Artuklu',
      year: '1147',
      architect: 'Artuklu Başmimarı (Timurtaş dönemi)',
      patron: 'Timurtaş bin İlgazi',
      material: 'Sarı kalker kesme taş, tuğla kemer içi dolgusu',
      structuralSystem: 'Dünyanın en geniş açıklıklı taş sivri kemerlerinden biri (40,86 m)',
      dimensions: 'Toplam uzunluk 150 m · En 7 m · Su seviyesinden yükseklik 19 m',
      unesco: 'UNESCO Dünya Mirası Geçici Listesi (2016)',
      philosophy:
        'Kemerin iki yanında yolcular ve kervan muhafızları için taş odalar barındıran bir "köprü-han"dır; sadece nehri aşırmaz, yolcuya sığınak da olur.',
      architecturalDetails:
        '40,86 metrelik devasa sivri ana kemerin yanında sel yükünü hafifleten yan tahliye gözleri, üzerinde güneş/aslan/insan kabartmaları ve kemer içine gizlenmiş iki barınma odası bulunur.'
    },
    {
      id: 'edirne-uzunkopru',
      name: 'Edirne Uzunköprü (Ergene Köprüsü)',
      category: 'kopruler',
      provinceKey: '01_Marmara/Edirne',
      provinceName: 'Edirne',
      district: 'Uzunköprü',
      region: 'Marmara',
      era: 'Erken Osmanlı',
      year: '1427–1443',
      architect: 'Mimar Muslihiddin & Mehmed',
      patron: 'Sultan II. Murad',
      material: 'Yontulmuş küfeki ve kalker taşı, kurşun kenetler',
      structuralSystem: '174 gözlü, çift eğimli ve taşkın mahmuzlu dev taş köprü',
      dimensions: 'Uzunluk 1.392 m · Genişlik 6,80 m · 174 kemer gözü',
      unesco: 'UNESCO Dünya Mirası Geçici Listesi (Dünyanın En Uzun Taş Köprüsü)',
      philosophy:
        'Bataklık ve taşkın ovasını 1.392 metrelik kesintisiz taş iradeyle aşarak, etrafında cami, imaret ve hamamla yeni bir şehri yoktan var etmiştir.',
      architecturalDetails:
        'Sivri ve yuvarlak kemerlerin birleşimi, akıntıyı bölen üçgen sel yaranlar (mahmuzlar) ve korkuluk taşlarındaki fil, aslan, lale kabartmalarıyla 16 yıldır değil 600 yıldır Ergene’yi taşır.'
    },
    {
      id: 'adiyaman-cendere',
      name: 'Adıyaman Cendere Köprüsü',
      category: 'kopruler',
      provinceKey: '07_GuneydoguAnadolu/Adiyaman',
      provinceName: 'Adıyaman',
      district: 'Kâhta (Cendere Çayı)',
      region: 'Güneydoğu Anadolu',
      era: 'Roma İmparatorluğu (Kommagene)',
      year: 'MS 198–200',
      architect: 'XVI. Roma Lejyonu (Flavia Firma)',
      patron: 'İmparator Septimius Severus',
      material: 'Her biri 7–10 tonluk harçsız kesme kireçtaşı bloklar',
      structuralSystem: 'Harçsız (kuru duvar) tek ana yarım daire kemer + tahliye kemeri',
      dimensions: 'Uzunluk 120 m · Genişlik 7 m · Kemer açıklığı 34,2 m',
      unesco: 'Nemrut Dağı Milli Parkı Tarihi Güzergâhı',
      philosophy:
        'Tek bir gram harç kullanılmadan, yalnızca taşın kendi ağırlığı ve kusursuz kesim açısıyla 1.800 yıldır kanyona meydan okuyan saf geometri abidesidir.',
      architecturalDetails:
        'Cendere Çayı’nın iki dik kayasına doğrudan oturtulmuş 92 dev bloktan oluşan ana kemerin iki başında, imparator ailesi adına dikilmiş Korint başlıklı onur sütunları yer alır.'
    },
    {
      id: 'adana-taskopru',
      name: 'Adana Taşköprü',
      category: 'kopruler',
      provinceKey: '03_Akdeniz/Adana',
      provinceName: 'Adana',
      district: 'Seyhan / Yüreğir',
      region: 'Akdeniz',
      era: 'Roma – Bizans – Osmanlı',
      year: 'IV. Yüzyıl (Justinianus & Osmanlı onarımları)',
      architect: 'Auxentios & Osmanlı Hassa Mimarları',
      patron: 'Roma İmparatoru Hadrianus / I. Justinianus',
      material: 'Kesme taş, mermer kaplama, tuğla destekli kemerler',
      structuralSystem: 'Seyhan Nehri üzerinde 21 kemerli (14’ü günümüzde açık) taş köprü',
      dimensions: 'Uzunluk 310 m · Genişlik 11,4 m · 14 açık kemer gözü',
      unesco: 'Dünyanın Hâlâ Kullanılan En Eski Köprülerinden',
      philosophy:
        'İki bin yıldır Seyhan’ın iki yakasını birleştirirken Roma mühendisliği ile Osmanlı vakıf bakım geleneğini aynı taş kemerde buluşturur.',
      architecturalDetails:
        'Büyük ve küçük kemerlerin ritmik dizilimi, taş ayaklardaki selyaran çıkıntıları ve orta kısımdaki tarihî Osmanlı kitabe köşküyle Çukurova’nın simgesidir.'
    },
    {
      id: 'bursa-irgandi',
      name: 'Bursa Irgandı Çarşılı Köprü',
      category: 'kopruler',
      provinceKey: '01_Marmara/Bursa',
      provinceName: 'Bursa',
      district: 'Osmangazi / Yıldırım (Gökdere)',
      region: 'Marmara',
      era: 'Erken Osmanlı',
      year: '1442',
      architect: 'Timurtaş Paşa / Hacı İvaz Paşa ekolü',
      patron: 'Irgandılı Ali oğlu Hacı Muslihiddin',
      material: 'Kesme taş, tuğla kemer ve ahşap bedesten dükkanları',
      structuralSystem: 'Tek büyük sivri/yuvarlak taş kemer üzerinde iki sıralı 30 dükkanlı arasta',
      dimensions: 'Kemer açıklığı 16 m · Köprü üstü çarşı koridoru',
      unesco: 'Dünyadaki Dört Çarşılı Köprüden İlk Örneklerden',
      philosophy:
        'Nehrin üstünü yalnızca geçişe değil, zanaat ve berekete açarak köprüyü yaşayan bir ahî çarşısına dönüştürür.',
      architecturalDetails:
        'Gökdere yatağını tek kemerle aşan köprünün kemer karnında mescit ve depo birimleri, üst platformunda ise karşılıklı el sanatları atölyeleri sıralanır.'
    },
    {
      id: 'adana-varda',
      name: 'Adana Varda (Alman) Köprüsü',
      category: 'kopruler',
      provinceKey: '03_Akdeniz/Adana',
      provinceName: 'Adana',
      district: 'Karaisalı (Hacıkırı)',
      region: 'Akdeniz',
      era: 'Geç Osmanlı / XX. Yüzyıl Mühendisliği',
      year: '1907–1912',
      architect: 'Winkler & Hicaz/Bağdat Demiryolu Mühendisleri',
      patron: 'Sultan II. Abdülhamid (Bağdat Demiryolu Hattı)',
      material: 'Yüksek mukavemetli kesme kireçtaşı ve kâgir kemer örgüsü',
      structuralSystem: '3 ana büyük kemer + 8 yan kemerli kavisli yüksek vadi viyadüğü',
      dimensions: 'Uzunluk 172 m · Kanyon yüksekliği 99 m · Yarıçap 1.200 m kavis',
      unesco: 'Toroslar Kâgir Viyadük Mühendisliği Şaheseri',
      philosophy:
        'Çelik yerine Anadolu taşını tercih ederek Torosların 99 metrelik uçurumunu doğayla uyumlu bir taş kavisle birleştirir.',
      architecturalDetails:
        '1.200 metre yarıçaplı hafif bir yay (kurp) çizerek merkezkaç ve rüzgar yüklerini karşılar; ana ayakların içindeki bakım galerileri taş iskele tekniğiyle örülmüştür.'
    },

    // 3. Selçuklu & Osmanlı Darüşşifaları (6)
    {
      id: 'kayseri-gevher-nesibe',
      name: 'Kayseri Gevher Nesibe Şifahanesi & Tıp Medresesi',
      category: 'darussifalar',
      provinceKey: '04_IcAnadolu/Kayseri',
      provinceName: 'Kayseri',
      district: 'Kocasinan',
      region: 'İç Anadolu',
      era: 'Anadolu Selçuklu',
      year: '1205–1206',
      architect: 'Selçuklu Saray Mimarlığı',
      patron: 'I. Gıyaseddin Keyhüsrev (Gevher Nesibe Sultan vasiyeti)',
      material: 'Volkanik Kayseri kesme taşı (bazalt ve tüf)',
      structuralSystem: 'İkiz planlı (Çifte Medrese): Şifahane + Gıyasiye Tıp Medresesi',
      dimensions: '68 × 42 m · İki açık avlulu ve çok eyvanlı ikiz külliye',
      unesco: 'Dünyanın İlk Uygulamalı Tıp Fakültesi & Şifahanelerinden',
      philosophy:
        'Teori (tıp medresesi) ile merhamet pratiğini (şifahane) bir koridorla birbirine bağlar; hastaya ırk, din ve servet bakılmaksızın ücretsiz hekim ve ilaç sunar.',
      architecturalDetails:
        'Çifte medrese şemasında batıdaki darüşşifa ve doğudaki tıp medresesi dahili bir geçitle birleşir. Taçkapıdaki yılan kabartması, akustik şifa odaları ve hamam ısıtma kanalları dikkat çeker.'
    },
    {
      id: 'edirne-bayezid-darussifa',
      name: 'Edirne II. Bayezid Külliyesi Darüşşifası',
      category: 'darussifalar',
      provinceKey: '01_Marmara/Edirne',
      provinceName: 'Edirne',
      district: 'Yeniimaret (Tunca Kıyısı)',
      region: 'Marmara',
      era: 'Osmanlı Klasik Dönem',
      year: '1484–1488',
      architect: 'Mimar Hayreddin',
      patron: 'Sultan II. Bayezid',
      material: 'Kesme küfeki taşı, tuğla, kurşun kubbeler',
      structuralSystem: 'Altıgen merkezi şifahane kubbesi + akustik taş tonozlu hasta odaları',
      dimensions: 'Altıgen merkez salon · 10 kişilik müzisyen sahnesi · Tunca kenarı külliye',
      unesco: 'Avrupa Konseyi Müze Ödüllü (2004) · UNESCO Geçici Listesi',
      philosophy:
        'Ruhsal hastalıkları zincirle değil, merkezi kubbe altındaki fıskiyeli havuzun su sesi, gül-misk kokusu ve on farklı makamda icra edilen musiki ile tedavi etmiştir.',
      architecturalDetails:
        'Altıgen merkez salonun etrafındaki hasta odaları, sesin yankılanmadan her hücreye eşit yayılmasını sağlayan kubbe geometrisine göre yerleştirilmiştir.'
    },
    {
      id: 'amasya-darussifasi',
      name: 'Amasya Darüşşifası (Bîmarhâne)',
      category: 'darussifalar',
      provinceKey: '05_Karadeniz/Amasya',
      provinceName: 'Amasya',
      district: 'Merkez (Yeşilırmak Kıyısı)',
      region: 'Karadeniz',
      era: 'İlhanlı / Anadolu Selçuklu Geleneği',
      year: '1308–1309',
      architect: 'İlhanlı Taş Ustaları',
      patron: 'Yıldız Hatun (Anber bin Abdullah nezaretinde)',
      material: 'Sarı kesme taş ve tuğla tonozlar',
      structuralSystem: 'Açık avlulu, tek katlı revaklı ve eyvanlı simetrik plan',
      dimensions: '24 × 33 m · Kilit taşında diz çökmüş insan figürlü taçkapı',
      unesco: 'Sabuncuoğlu Şerefeddin Tıp & Cerrahi Mirası',
      philosophy:
        'Ünlü cerrah Sabuncuoğlu Şerefeddin’in 14 yıl hekimlik yaptığı bu mekân, deneysel cerrahi ile müzikle ruh tedavisini aynı taş avluda buluşturmuştur.',
      architecturalDetails:
        'Mukarnas kavsaralı taçkapısının kilit taşında diz çökmüş insan rölyefi yer alır. Avlu revakları ve yan koğuşlar Yeşilırmak vadisinden gelen serin hava akımını içeri çeker.'
    },
    {
      id: 'sivas-sifaiye-medresesi',
      name: 'Sivas Şifaiye Medresesi (Keykavus Darüşşifası)',
      category: 'darussifalar',
      provinceKey: '04_IcAnadolu/Sivas',
      provinceName: 'Sivas',
      district: 'Merkez (Selçuklu Parkı)',
      region: 'İç Anadolu',
      era: 'Anadolu Selçuklu',
      year: '1217–1218',
      architect: 'Ahmed bin Ebubekir el-Merendî (çini ustası) & Selçuklu Mimarları',
      patron: 'Sultan I. İzzeddin Keykavus',
      material: 'Kesme taş, tuğla eyvan, firuze ve patlıcan moru çini',
      structuralSystem: 'Anadolu’nun en büyük açık avlulu, dört eyvanlı şifahane planı',
      dimensions: '48 × 68 m · Güney eyvanda Sultan Keykavus Türbesi',
      unesco: 'UNESCO Dünya Mirası Geçici Listesi',
      philosophy:
        'Sultan İzzeddin Keykavus, sağlığında kurduğu bu şifahanenin ortasına defnedilmeyi vasiyet ederek "hastalara hizmetin gölgesinde yatmak" istemiştir.',
      architecturalDetails:
        'Ana eyvandaki güneş ve ay (şems ve kamer) madalyonları insan sağlığı ile kozmik dengeye işaret eder; güney eyvanındaki türbe cephesi Anadolu’nun en görkemli çini mozaik kompozisyonlarından biridir.'
    },
    {
      id: 'manisa-hafsa-sultan',
      name: 'Manisa Hafsa Sultan Külliyesi Darüşşifası',
      category: 'darussifalar',
      provinceKey: '02_Ege/Manisa',
      provinceName: 'Manisa',
      district: 'Şehzadeler',
      region: 'Ege',
      era: 'Osmanlı Klasik Dönem',
      year: '1539',
      architect: 'Acem Ali (Esir Ali)',
      patron: 'Kanuni Sultan Süleyman (Valide Hafsa Sultan adına)',
      material: 'Kesme taş, tuğla hatıllı duvar, kurşun kubbeler',
      structuralSystem: 'Merkezî avlulu, sütunlu revaklı ve tek kubbeli odalı şifahane',
      dimensions: 'Cami, medrese, imaret, sıbyan mektebi ve darüşşifa bütünü',
      unesco: 'Merkez Efendi & Mesir Macunu Şifa Geleneği',
      philosophy:
        'Beden şifasının sadece hastane içinde değil, bütün şehre dağıtılan 41 baharatlı şifa iksiriyle (Mesir) toplumsallaştığı koruyucu hekimlik anıtıdır.',
      architecturalDetails:
        'Acem Ali’nin tasarladığı dikdörtgen avlu çevresinde dizilen kubbeli hasta odaları, güneyde büyük ders/muayene salonu ve köşelerde ısıtma ocaklarıyla erken klasik Osmanlı hastane tipolojisini kurar.'
    },
    {
      id: 'tokat-gokmedrese',
      name: 'Tokat Gökmedrese (Pervane Bey Darüşşifası)',
      category: 'darussifalar',
      provinceKey: '05_Karadeniz/Tokat',
      provinceName: 'Tokat',
      district: 'Merkez',
      region: 'Karadeniz',
      era: 'Anadolu Selçuklu',
      year: '1277',
      architect: 'Selçuklu Başmimarlığı',
      patron: 'Vezir Muineddin Süleyman Pervane',
      material: 'Kesme taş, firuze ve lacivert sırlı çini kaplama',
      structuralSystem: 'İki katlı, açık avlulu, dört eyvanlı medrese ve şifahane',
      dimensions: 'İki katlı revaklı avlu · Mavi çinili eyvan kemerleri',
      unesco: 'Anadolu Selçuklu Çini & Tıp Eğitimi Merkezi',
      philosophy:
        'Firuze ve gök mavisi çinilerin verdiği ruhsal sükûneti şifa ve ilim mekânının duvarlarına işleyerek gökyüzünü avlunun içine indirir.',
      architecturalDetails:
        'Adını avlu revaklarını ve ana eyvanı süsleyen turkuaz çinilerden alır; alt katta hasta ve muayene odaları, üst katta ise talebe hücreleri yer alan nadir iki katlı plan şemasına sahiptir.'
    },

    // 4. Saraylar, Surlar & Kaya Mimarisi (6)
    {
      id: 'agri-ishak-pasa',
      name: 'Ağrı İshak Paşa Sarayı',
      category: 'saraylar',
      provinceKey: '06_DoguAnadolu/Agri',
      provinceName: 'Ağrı',
      district: 'Doğubayazıt',
      region: 'Doğu Anadolu',
      era: 'Osmanlı (Lale Devri – Geç Klasik)',
      year: '1685–1784 (99 yıl)',
      architect: 'Ahıskalı & Osmanlı Taş Ustaları',
      patron: 'Çolak Abdi Paşa & İshak Paşa',
      material: 'Kızıl-sarı volkanik Doğubayazıt kesme taşı',
      structuralSystem: 'İki avlulu saray külliyesi + sarp kayalık üzerine oturan istinat surları',
      dimensions: '115 × 50 m · 116 oda · 2.200 m rakım · Merkezi sıcak su kaloriferi',
      unesco: 'UNESCO Dünya Mirası Geçici Listesi (2000)',
      philosophy:
        'Ağrı Dağı’nın karşısındaki sarp kayalığa bir kartal yuvası gibi tutunurken duvarlarının içine yerleştirdiği sıcak su borularıyla insanı dondurucu kıştan koruyan teknik şefkattir.',
      architecturalDetails:
        'Selçuklu taçkapı geleneğini Osmanlı saray planı ve Barok taş süslemelerle sentezler. Taş duvar içindeki kil borulu merkezi kalorifer tesisatı ve altın kaplamalı kapılarıyla ünlüdür.'
    },
    {
      id: 'diyarbakir-surlari',
      name: 'Diyarbakır Surları & Hevsel Bahçeleri',
      category: 'saraylar',
      provinceKey: '07_GuneydoguAnadolu/Diyarbakir',
      provinceName: 'Diyarbakır',
      district: 'Sur',
      region: 'Güneydoğu Anadolu',
      era: 'Roma – Bizans – Mervani – Artuklu – Selçuklu',
      year: 'MS 349 (Ana Hat) · 1088–1208 (Burçlar)',
      architect: 'Çok Katmanlı Anadolu Ustaları (El-Cezerî izleri)',
      patron: 'Roma / Mervani / Artuklu / Selçuklu Hükümdarları',
      material: 'Karacadağ siyah bazalt kesme taşı',
      structuralSystem: '5,8 km kalkan balığı formunda çift sur + 82 anıtsal burç',
      dimensions: 'Uzunluk 5,8 km · Yükseklik 10–12 m · Kalınlık 3–5 m · 82 burç',
      unesco: 'UNESCO Dünya Mirası (2015)',
      philosophy:
        'Çin Seddi’nden sonra dünyanın en uzun kesintisiz savunma duvarlarından biridir; üstündeki hayvan kabartmaları ve kitabelerle taşı bir "açık hava tarih kitabı"na çevirir.',
      architecturalDetails:
        'Dağ, Urfa, Mardin ve Yeni Kapı ile Ulu Beden (Evli Beden) ve Keçi Burcu gibi savunma şaheserleri taş konsollar, gizli su yolları ve kabartma armalarla bezelidir.'
    },
    {
      id: 'trabzon-sumela',
      name: 'Trabzon Sümela Manastırı',
      category: 'saraylar',
      provinceKey: '05_Karadeniz/Trabzon',
      provinceName: 'Trabzon',
      district: 'Maçka (Altındere Vadisi)',
      region: 'Karadeniz',
      era: 'Doğu Roma / Komnenos – Osmanlı Himayesi',
      year: 'MS 386 (Kuruluş) · XIV. Yüzyıl (Ana Yapılar)',
      architect: 'Kaya Mühendisliği & Manastır Ustaları',
      patron: 'Atinalı Barnabas & Sophronios · III. Aleksios Komnenos',
      material: 'Doğal kalker mağara kayası, kesme taş istinat ve ahşap iç mekan',
      structuralSystem: '300 m dik uçurum yüzüne asılı 6 katlı kaya mimarisi + su kemeri',
      dimensions: 'Rakım 1.200 m · Vadi tabanından 300 m yükseklik · 72 oda',
      unesco: 'UNESCO Dünya Mirası Geçici Listesi (2000)',
      philosophy:
        'Kayayı oymak yerine sarp dağın koynuna yerleşir; sarp uçurumla çatışmadan doğanın kendi mağarasını mabede dönüştüren inziva mimarisidir.',
      architecturalDetails:
        'Ana kaya kilisesi freskleri, yamaca tutunan çok katlı keşiş hücreleri, dar taş merdivenleri ve vadiyi aşarak manastıra su taşıyan kemerli su yolu mühendisliğiyle benzersizdir.'
    },
    {
      id: 'mardin-kasimiye',
      name: 'Mardin Kasımiye Medresesi',
      category: 'saraylar',
      provinceKey: '07_GuneydoguAnadolu/Mardin',
      provinceName: 'Mardin',
      district: 'Artuklu',
      region: 'Güneydoğu Anadolu',
      era: 'Artuklu – Akkoyunlu',
      year: 'XIV. Yüzyıl Sonu – 1469 (Tamamlanma)',
      architect: 'Mardin Sarı Kalker Taş Ustaları',
      patron: 'Melik Kasım (Akkoyunlu Sultanı Kasım bin Cihangir)',
      material: 'Güneşte altın rengine dönen işlenebilir sarı Mardin kalkeri',
      structuralSystem: 'İki katlı, tek eyvanlı ve teraslı kesme taş avlu kompleksi',
      dimensions: 'Mezopotamya Ovası’na bakan teras · Selsebil su çeşmesi',
      unesco: 'Mardin Kültürel Peyzajı Taş İşçiliği Şaheseri',
      philosophy:
        'Eyvandaki selsebil çeşmeden akıp havuzda biriken ve ince kanalla toprağa karışan su; doğumu, gençliği, olgunluğu ve ölümü tek bir mimari çizgide özetler.',
      architecturalDetails:
        'Mardin taşı ocaktan çıktığında yumuşak olup havayla temas edince sertleşir; bu sayede pencere alınlıklarında ve kubbe geçişlerinde dantel gibi taş oyma işçiliği sağlanmıştır.'
    },
    {
      id: 'mersin-mamure-kalesi',
      name: 'Mersin Mamure Kalesi',
      category: 'saraylar',
      provinceKey: '03_Akdeniz/Mersin',
      provinceName: 'Mersin',
      district: 'Anamur',
      region: 'Akdeniz',
      era: 'Roma – Kilikya – Karamanoğulları – Osmanlı',
      year: 'III–IV. Yüzyıl (Temel) · 1300–1450 (Karamanoğlu)',
      architect: 'Akdeniz Kıyı İstihkâm Ustaları',
      patron: 'Karamanoğlu Mahmud Bey & Osmanlı Onarımları',
      material: 'Kumtaşı, kireçtaşı, devşirme Roma blokları ve tuğla dendanlar',
      structuralSystem: '39 burçlu kıyı hisarı, hendekli üç avlu ve iç kale camisi',
      dimensions: '23.500 m² alan · 39 kule/burç · Akdeniz’e sıfır hendek',
      unesco: 'UNESCO Dünya Mirası Geçici Listesi (2012)',
      philosophy:
        'Denizle kara arasındaki sınırda yalnız savunma kalesi değil, içinde tek kubbeli camisi ve hamamıyla kendi kendine yeten bir kıyı menzili olarak tasarlanmıştır.',
      architecturalDetails:
        '39 farklı biçimli (kare, çokgen, silindirik) burcu bağlayan seyirdim yolları, tatlı/tuzlu su hendeği ve dış avluda Karamanoğlu döneminden kalma özgün camisi kusursuz korunmuştur.'
    },
    {
      id: 'van-hosap-kalesi',
      name: 'Van Hoşap Kalesi',
      category: 'saraylar',
      provinceKey: '06_DoguAnadolu/Van',
      provinceName: 'Van',
      district: 'Gürpınar (Hoşap Suyu)',
      region: 'Doğu Anadolu',
      era: 'Osmanlı (Mahmudî Beyliği)',
      year: '1643',
      architect: 'Bölge Taş Ustaları',
      patron: 'Mahmudî Süleyman Bey',
      material: 'Siyah-kızıl bazalt, andezit ve sarı kesme taş kemer',
      structuralSystem: 'Sarp kaya kütlesi üzerine kademeli iç kale + yüksek taçkapılı burç',
      dimensions: 'Hoşap Çayı’ndan 70 m yükseklik · Aslan kabartmalı taçkapı · İki katlı harem/selamlık',
      unesco: 'Doğu Anadolu Sarp Kaya Kale & Saray Sentezi',
      philosophy:
        'Sarp kayayı aşılması imkânsız bir kaleye dönüştürürken giriş kapısındaki çift aslan kabartması ve içindeki seyir köşküyle güç ile zarafeti dengeler.',
      architecturalDetails:
        'Giriş burcundaki abidevî taçkapıda yer alan zincirli aslan rölyefleri, orijinal demir kapı kanatları, yeraltı zindanları, sarnıçlar ve Hoşap Çayı’na bakan seyir divanhanesiyle eşsizdir.'
    }
  ];

  const MASTERPIECE_BY_ID = new Map(MASTERPIECES.map(function (m) { return [m.id, m]; }));

  const AI_ANGLES = [
    {
      id: 'hendese',
      label: '📐 Hendese, Geometri & Taşıyıcı Sistem',
      shortLabel: 'Hendese & Statik'
    },
    {
      id: 'felsefe',
      label: '🕌 Tevhid, Tasavvuf & Merhamet Felsefesi',
      shortLabel: 'Tevhid & Merhamet'
    },
    {
      id: 'sifa-akustik',
      label: '💧 Akustik, Su Mühendisliği & Şifa Mekânı',
      shortLabel: 'Akustik & Su'
    },
    {
      id: 'seyyah-rotasi',
      label: '🧭 Seyyah Gözüyle Mekân Okuması & Rota',
      shortLabel: 'Seyyah Okuması'
    }
  ];

  // ---------------------------------------------------------------------------
  // Scoped CSS (Dark Cyber-Sufi + body.light-theme compatible)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .saw-root {
        display: flex;
        flex-direction: column;
        gap: 20px;
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, 'Plus Jakarta Sans', system-ui, sans-serif);
        padding-bottom: 36px;
      }

      /* Hero Section */
      .saw-hero {
        position: relative;
        overflow: hidden;
        padding: 24px 26px;
        border-radius: 20px;
        background:
          radial-gradient(circle at 12% 14%, rgba(245, 158, 11, 0.16), transparent 45%),
          radial-gradient(circle at 88% 18%, rgba(0, 242, 254, 0.14), transparent 44%),
          linear-gradient(145deg, rgba(15, 23, 42, 0.92), rgba(10, 15, 29, 0.96));
        border: 1px solid rgba(245, 158, 11, 0.28);
        box-shadow: 0 20px 45px -20px rgba(0, 0, 0, 0.65);
      }

      .saw-hero-top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 12px;
      }

      .saw-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 0.74rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #fcd34d;
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.35);
      }

      .saw-motto-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 0.76rem;
        font-weight: 700;
        color: #67e8f9;
        background: rgba(0, 242, 254, 0.1);
        border: 1px solid rgba(0, 242, 254, 0.28);
      }

      .saw-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.38rem, 2.5vw, 2.05rem);
        font-weight: 800;
        line-height: 1.22;
        margin-bottom: 10px;
        background: linear-gradient(120deg, #f8fafc 12%, #fcd34d 54%, #38bdf8 95%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .saw-subtitle {
        font-size: 0.92rem;
        line-height: 1.6;
        color: var(--text-secondary, #cbd5e1);
        max-width: 920px;
        margin-bottom: 14px;
      }

      .saw-quote-box {
        padding: 12px 16px;
        border-radius: 13px;
        background: rgba(245, 158, 11, 0.09);
        border-left: 3px solid #f59e0b;
        font-size: 0.86rem;
        line-height: 1.55;
        color: #fde68a;
        margin-bottom: 16px;
      }

      .saw-kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
        gap: 11px;
      }

      .saw-kpi-card {
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(30, 41, 59, 0.56);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .saw-kpi-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary, #94a3b8);
      }

      .saw-kpi-val {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.28rem;
        font-weight: 800;
        color: #f8fafc;
      }

      .saw-kpi-sub {
        font-size: 0.74rem;
        color: #94a3b8;
      }

      /* Section Shells */
      .saw-section {
        padding: 20px 22px;
        border-radius: 18px;
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
      }

      .saw-section-head {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
      }

      .saw-section-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.18rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .saw-section-desc {
        font-size: 0.84rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 3px;
      }

      /* Interactive SVG Hendese Studio */
      .saw-hendese-grid {
        display: grid;
        grid-template-columns: minmax(320px, 1.15fr) minmax(300px, 1fr);
        gap: 18px;
        align-items: stretch;
      }

      .saw-svg-stage {
        position: relative;
        border-radius: 16px;
        padding: 14px;
        background:
          radial-gradient(circle at 50% 25%, rgba(0, 242, 254, 0.1), transparent 55%),
          radial-gradient(circle at 50% 80%, rgba(245, 158, 11, 0.08), transparent 55%),
          rgba(10, 15, 29, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.11);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
      }

      .saw-svg-stage svg {
        width: 100%;
        height: auto;
        max-height: 390px;
        display: block;
      }

      .saw-svg-hotspot {
        cursor: pointer;
        transition: opacity 0.2s ease, transform 0.2s ease;
      }

      .saw-svg-hotspot:hover {
        opacity: 0.95;
      }

      .saw-svg-part-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .saw-part-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 10px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(30, 41, 59, 0.62);
        color: #cbd5e1;
        font-size: 0.74rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .saw-part-pill:hover {
        border-color: rgba(0, 242, 254, 0.45);
        color: #f8fafc;
      }

      .saw-part-pill.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.22), rgba(245, 158, 11, 0.18));
        border-color: rgba(0, 242, 254, 0.55);
        color: #ffffff;
        box-shadow: 0 4px 14px -4px rgba(0, 242, 254, 0.35);
      }

      .saw-hendese-inspector {
        border-radius: 16px;
        padding: 18px;
        background: rgba(30, 41, 59, 0.52);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .saw-insp-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
      }

      .saw-insp-code {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.78rem;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 8px;
        background: rgba(0, 242, 254, 0.14);
        border: 1px solid rgba(0, 242, 254, 0.35);
        color: #67e8f9;
      }

      .saw-insp-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.08rem;
        font-weight: 800;
        color: #f8fafc;
      }

      .saw-insp-sub {
        font-size: 0.78rem;
        color: #fcd34d;
        font-weight: 600;
      }

      .saw-insp-block {
        padding: 10px 12px;
        border-radius: 11px;
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 0.81rem;
        line-height: 1.5;
        color: #cbd5e1;
      }

      .saw-insp-block strong {
        display: block;
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #7dd3fc;
        margin-bottom: 3px;
      }

      .saw-insp-block.philo strong {
        color: #fcd34d;
      }

      .saw-insp-links {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: auto;
      }

      .saw-chip-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 10px;
        border-radius: 9px;
        border: 1px solid rgba(245, 158, 11, 0.35);
        background: rgba(245, 158, 11, 0.12);
        color: #fde68a;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .saw-chip-btn:hover {
        background: rgba(245, 158, 11, 0.25);
        transform: translateY(-1px);
      }

      /* Filter Toolbar */
      .saw-filters-wrap {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
      }

      .saw-cat-tabs {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(195px, 1fr));
        gap: 8px;
      }

      .saw-cat-tab {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 10px 13px;
        border-radius: 13px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(30, 41, 59, 0.52);
        color: #cbd5e1;
        font-size: 0.8rem;
        font-weight: 700;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .saw-cat-tab:hover {
        border-color: rgba(0, 242, 254, 0.4);
        color: #ffffff;
      }

      .saw-cat-tab.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(245, 158, 11, 0.18));
        border-color: rgba(0, 242, 254, 0.55);
        color: #ffffff;
        box-shadow: 0 8px 20px -10px rgba(0, 242, 254, 0.45);
      }

      .saw-cat-count {
        font-size: 0.72rem;
        padding: 2px 7px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        color: #f8fafc;
        flex-shrink: 0;
      }

      .saw-filter-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .saw-pill-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }

      .saw-pill {
        padding: 6px 11px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.13);
        background: rgba(30, 41, 59, 0.48);
        color: #cbd5e1;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .saw-pill:hover {
        border-color: rgba(0, 242, 254, 0.4);
        color: #fff;
      }

      .saw-pill.active {
        background: rgba(0, 242, 254, 0.18);
        border-color: rgba(0, 242, 254, 0.55);
        color: #67e8f9;
      }

      .saw-search-box {
        position: relative;
        min-width: 240px;
        flex: 1;
        max-width: 340px;
      }

      .saw-search-input {
        width: 100%;
        padding: 8px 13px;
        border-radius: 11px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(15, 23, 42, 0.75);
        color: #f8fafc;
        font-family: inherit;
        font-size: 0.82rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .saw-search-input:focus {
        border-color: #00f2fe;
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.16);
      }

      .saw-results-meta {
        font-size: 0.79rem;
        color: var(--text-secondary, #94a3b8);
        margin-bottom: 12px;
      }

      /* Masterpiece Cards Grid */
      .saw-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
        gap: 16px;
      }

      .saw-card {
        display: flex;
        flex-direction: column;
        border-radius: 16px;
        overflow: hidden;
        background: rgba(15, 23, 42, 0.68);
        border: 1px solid rgba(255, 255, 255, 0.11);
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .saw-card:hover {
        transform: translateY(-3px);
        border-color: rgba(0, 242, 254, 0.42);
        box-shadow: 0 14px 30px -12px rgba(0, 242, 254, 0.28);
      }

      .saw-card.is-highlighted {
        border-color: #f59e0b;
        box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.38), 0 14px 30px -10px rgba(245, 158, 11, 0.35);
      }

      .saw-card-banner {
        position: relative;
        height: 158px;
        overflow: hidden;
        background: #0f172a;
      }

      .saw-card-banner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.45s ease;
      }

      .saw-card:hover .saw-card-banner img {
        transform: scale(1.05);
      }

      .saw-banner-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(10, 15, 29, 0.28) 0%, rgba(10, 15, 29, 0.88) 100%);
      }

      .saw-banner-top {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .saw-era-badge {
        font-size: 0.69rem;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 8px;
        background: rgba(15, 23, 42, 0.82);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #e2e8f0;
        backdrop-filter: blur(6px);
      }

      .saw-status-badge {
        font-size: 0.69rem;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 8px;
        background: rgba(245, 158, 11, 0.22);
        border: 1px solid rgba(245, 158, 11, 0.42);
        color: #fde68a;
        backdrop-filter: blur(6px);
      }

      .saw-status-badge.visited {
        background: rgba(16, 185, 129, 0.24);
        border-color: rgba(16, 185, 129, 0.5);
        color: #a7f3d0;
      }

      .saw-banner-bottom {
        position: absolute;
        bottom: 10px;
        left: 12px;
        right: 12px;
      }

      .saw-card-cat {
        font-size: 0.69rem;
        font-weight: 700;
        color: #7dd3fc;
        margin-bottom: 2px;
      }

      .saw-card-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.03rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.24;
      }

      .saw-card-loc {
        font-size: 0.74rem;
        color: #cbd5e1;
        margin-top: 2px;
      }

      .saw-card-body {
        padding: 14px 15px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
      }

      .saw-meta-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .saw-meta-chip {
        font-size: 0.71rem;
        padding: 3px 8px;
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.11);
        color: #cbd5e1;
      }

      .saw-meta-chip.unesco {
        background: rgba(16, 185, 129, 0.14);
        border-color: rgba(16, 185, 129, 0.35);
        color: #a7f3d0;
      }

      .saw-card-block {
        font-size: 0.8rem;
        line-height: 1.5;
        color: #cbd5e1;
      }

      .saw-card-block strong {
        color: #f8fafc;
      }

      .saw-philo-box {
        padding: 9px 11px;
        border-radius: 10px;
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.25);
        font-size: 0.78rem;
        line-height: 1.48;
        color: #fde68a;
      }

      .saw-detail-drawer {
        padding: 10px 12px;
        border-radius: 10px;
        background: rgba(0, 242, 254, 0.07);
        border: 1px solid rgba(0, 242, 254, 0.22);
        font-size: 0.78rem;
        line-height: 1.5;
        color: #e2e8f0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .saw-card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        padding-top: 9px;
        margin-top: auto;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .saw-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 8px 11px;
        border-radius: 10px;
        font-family: inherit;
        font-size: 0.76rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .saw-btn-primary {
        flex: 1;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.22));
        border: 1px solid rgba(0, 242, 254, 0.42);
        color: #f8fafc;
      }

      .saw-btn-primary:hover {
        transform: translateY(-1px);
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.34), rgba(79, 172, 254, 0.34));
      }

      .saw-btn-ai {
        flex: 1.25;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(168, 85, 247, 0.18));
        border: 1px solid rgba(245, 158, 11, 0.42);
        color: #fef3c7;
      }

      .saw-btn-ai:hover {
        transform: translateY(-1px);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.32), rgba(168, 85, 247, 0.28));
      }

      .saw-btn-ghost {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: #cbd5e1;
      }

      .saw-btn-ghost:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
      }

      /* Gemini AI Architectural Philosophy Studio */
      .saw-ai-panel {
        padding: 22px;
        border-radius: 18px;
        background:
          radial-gradient(circle at 92% 10%, rgba(168, 85, 247, 0.13), transparent 42%),
          radial-gradient(circle at 8% 85%, rgba(0, 242, 254, 0.1), transparent 42%),
          rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(0, 242, 254, 0.28);
      }

      .saw-ai-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        margin-bottom: 14px;
      }

      .saw-select {
        flex: 1;
        min-width: 220px;
        padding: 9px 12px;
        border-radius: 11px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(10, 15, 29, 0.85);
        color: #f8fafc;
        font-family: inherit;
        font-size: 0.82rem;
        outline: none;
      }

      .saw-select:focus {
        border-color: #00f2fe;
      }

      .saw-ai-trigger {
        padding: 10px 16px;
        border-radius: 11px;
        border: 1px solid rgba(245, 158, 11, 0.52);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.28), rgba(0, 242, 254, 0.22));
        color: #ffffff;
        font-family: inherit;
        font-size: 0.83rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .saw-ai-trigger:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px -8px rgba(245, 158, 11, 0.55);
      }

      .saw-ai-trigger:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      .saw-ai-output {
        padding: 16px 18px;
        border-radius: 14px;
        background: rgba(10, 15, 29, 0.82);
        border: 1px solid rgba(0, 242, 254, 0.22);
      }

      .saw-ai-output-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-bottom: 10px;
        margin-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 0.78rem;
      }

      .saw-ai-source {
        font-weight: 700;
        color: #67e8f9;
      }

      .saw-ai-md {
        font-size: 0.87rem;
        line-height: 1.65;
        color: #e2e8f0;
      }

      .saw-ai-md h2,
      .saw-ai-md h3,
      .saw-ai-md h4 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        color: #fde68a;
        margin: 12px 0 6px;
      }

      .saw-ai-md p {
        margin-bottom: 8px;
      }

      .saw-ai-md ul {
        padding-left: 18px;
        margin-bottom: 10px;
      }

      .saw-ai-md blockquote {
        margin: 8px 0 10px;
        padding: 8px 12px;
        border-left: 3px solid #f59e0b;
        background: rgba(245, 158, 11, 0.08);
        border-radius: 8px;
        color: #fde68a;
      }

      .saw-ai-matches {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 7px;
      }

      .saw-empty {
        padding: 30px 18px;
        text-align: center;
        border-radius: 14px;
        border: 1px dashed rgba(255, 255, 255, 0.18);
        color: #94a3b8;
        font-size: 0.9rem;
      }

      /* ------------------------------------------------------------------ */
      /* Light Theme Overrides (body.light-theme)                           */
      /* ------------------------------------------------------------------ */
      body.light-theme .saw-root {
        color: #0f172a;
      }

      body.light-theme .saw-hero {
        background:
          radial-gradient(circle at 10% 12%, rgba(217, 119, 6, 0.14), transparent 46%),
          radial-gradient(circle at 90% 18%, rgba(2, 132, 199, 0.12), transparent 45%),
          rgba(255, 255, 255, 0.96);
        border-color: rgba(180, 83, 9, 0.25);
        box-shadow: 0 14px 30px -18px rgba(15, 23, 42, 0.2);
      }

      body.light-theme .saw-title {
        background: linear-gradient(125deg, #0f172a 12%, #b45309 55%, #0284c7 96%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .saw-eyebrow {
        color: #b45309;
        background: rgba(217, 119, 6, 0.12);
        border-color: rgba(217, 119, 6, 0.3);
      }

      body.light-theme .saw-motto-pill {
        color: #0369a1;
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.28);
      }

      body.light-theme .saw-subtitle,
      body.light-theme .saw-section-desc,
      body.light-theme .saw-kpi-label,
      body.light-theme .saw-kpi-sub,
      body.light-theme .saw-results-meta,
      body.light-theme .saw-card-block,
      body.light-theme .saw-insp-block {
        color: #334155;
      }

      body.light-theme .saw-card-block strong {
        color: #0f172a;
      }

      body.light-theme .saw-quote-box,
      body.light-theme .saw-philo-box {
        background: rgba(254, 243, 199, 0.72);
        border-color: rgba(217, 119, 6, 0.35);
        color: #78350f;
      }

      body.light-theme .saw-kpi-card,
      body.light-theme .saw-hendese-inspector {
        background: rgba(241, 245, 249, 0.94);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .saw-kpi-val,
      body.light-theme .saw-section-title,
      body.light-theme .saw-insp-title {
        color: #0f172a;
      }

      body.light-theme .saw-insp-sub {
        color: #b45309;
      }

      body.light-theme .saw-insp-code {
        background: rgba(2, 132, 199, 0.12);
        border-color: rgba(2, 132, 199, 0.32);
        color: #0369a1;
      }

      body.light-theme .saw-insp-block {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .saw-insp-block strong {
        color: #0369a1;
      }

      body.light-theme .saw-insp-block.philo strong {
        color: #b45309;
      }

      body.light-theme .saw-section,
      body.light-theme .saw-ai-panel {
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .saw-svg-stage {
        background:
          radial-gradient(circle at 50% 25%, rgba(2, 132, 199, 0.12), transparent 58%),
          #0f172a;
        border-color: rgba(15, 23, 42, 0.2);
      }

      body.light-theme .saw-part-pill,
      body.light-theme .saw-cat-tab,
      body.light-theme .saw-pill {
        background: #f1f5f9;
        border-color: rgba(15, 23, 42, 0.14);
        color: #334155;
      }

      body.light-theme .saw-part-pill.active,
      body.light-theme .saw-cat-tab.active,
      body.light-theme .saw-pill.active {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(217, 119, 6, 0.15));
        border-color: #0284c7;
        color: #0f172a;
      }

      body.light-theme .saw-cat-count {
        background: rgba(15, 23, 42, 0.1);
        color: #0f172a;
      }

      body.light-theme .saw-search-input,
      body.light-theme .saw-select {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.18);
        color: #0f172a;
      }

      body.light-theme .saw-card {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 8px 22px -14px rgba(15, 23, 42, 0.16);
      }

      body.light-theme .saw-meta-chip {
        background: #f1f5f9;
        border-color: rgba(15, 23, 42, 0.12);
        color: #334155;
      }

      body.light-theme .saw-meta-chip.unesco {
        background: rgba(16, 185, 129, 0.14);
        border-color: rgba(5, 150, 105, 0.35);
        color: #065f46;
      }

      body.light-theme .saw-detail-drawer {
        background: rgba(2, 132, 199, 0.08);
        border-color: rgba(2, 132, 199, 0.25);
        color: #1e293b;
      }

      body.light-theme .saw-card-actions {
        border-top-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .saw-btn-primary {
        background: linear-gradient(135deg, #0284c7, #2563eb);
        border-color: #0284c7;
        color: #ffffff;
      }

      body.light-theme .saw-btn-ai {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.18), rgba(147, 51, 234, 0.14));
        border-color: rgba(217, 119, 6, 0.45);
        color: #92400e;
      }

      body.light-theme .saw-btn-ghost,
      body.light-theme .saw-chip-btn {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.16);
        color: #1e293b;
      }

      body.light-theme .saw-ai-trigger {
        background: linear-gradient(135deg, #b45309, #0284c7);
        border-color: #b45309;
        color: #ffffff;
      }

      body.light-theme .saw-ai-output {
        background: #f8fafc;
        border-color: rgba(2, 132, 199, 0.28);
      }

      body.light-theme .saw-ai-output-head,
      body.light-theme .saw-ai-matches {
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .saw-ai-source {
        color: #0369a1;
      }

      body.light-theme .saw-ai-md {
        color: #1e293b;
      }

      body.light-theme .saw-ai-md h2,
      body.light-theme .saw-ai-md h3,
      body.light-theme .saw-ai-md h4 {
        color: #92400e;
      }

      body.light-theme .saw-ai-md blockquote {
        background: rgba(254, 243, 199, 0.72);
        color: #78350f;
      }

      @media (max-width: 920px) {
        .saw-hendese-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .saw-hero,
        .saw-section,
        .saw-ai-panel {
          padding: 16px 14px;
        }
        .saw-cards-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Interactive SVG Diagram Builder ("Kubbe, Kemer ve Mukarnas Hendesesi")
  // ---------------------------------------------------------------------------
  function buildHendeseSvgHtml(activePartId) {
    function partOpacity(id) {
      return activePartId === id ? '1' : '0.45';
    }
    function partStrokeWidth(id, base) {
      return activePartId === id ? String(base + 1.4) : String(base);
    }

    return `
      <svg viewBox="0 0 640 420" role="img" aria-label="Kubbe, Kemer ve Mukarnas Hendesesi Etkileşimli Şeması" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="saw-dome-glow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.34" />
            <stop offset="100%" stop-color="#0f172a" stop-opacity="0.05" />
          </radialGradient>
          <linearGradient id="saw-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fde68a" />
            <stop offset="100%" stop-color="#f59e0b" />
          </linearGradient>
          <linearGradient id="saw-water-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.45" />
            <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.85" />
            <stop offset="100%" stop-color="#0284c7" stop-opacity="0.45" />
          </linearGradient>
        </defs>

        <!-- Sacred Geometric Background Grid (8-pointed Seljuk star & plumb lines) -->
        <g opacity="0.16" stroke="#94a3b8" stroke-width="0.9" fill="none">
          <circle cx="320" cy="175" r="158" stroke-dasharray="4 5" />
          <circle cx="320" cy="175" r="112" stroke-dasharray="2 4" />
          <line x1="320" y1="14" x2="320" y2="395" stroke-dasharray="3 4" />
          <line x1="40" y1="362" x2="600" y2="362" />
          <rect x="208" y="63" width="224" height="224" stroke-dasharray="4 6" />
          <rect x="208" y="63" width="224" height="224" transform="rotate(45 320 175)" stroke-dasharray="4 6" />
        </g>

        <!-- 06: Fil Ayagi, Payanda & Horasan Temeli -->
        <g class="saw-svg-hotspot" data-saw-part="filayagi" opacity="${partOpacity('filayagi')}">
          <!-- Sub-foundation & Horasan bed -->
          <rect x="75" y="362" width="490" height="28" rx="4" fill="#1e293b" stroke="#fb7185" stroke-width="${partStrokeWidth('filayagi', 1.4)}" />
          <path d="M90 376 H550" stroke="#fb7185" stroke-width="1" stroke-dasharray="6 4" />
          <!-- Left & Right Monumental Piers (Fil Ayakları) -->
          <rect x="122" y="210" width="42" height="152" rx="3" fill="#1e293b" stroke="#fb7185" stroke-width="${partStrokeWidth('filayagi', 1.8)}" />
          <rect x="476" y="210" width="42" height="152" rx="3" fill="#1e293b" stroke="#fb7185" stroke-width="${partStrokeWidth('filayagi', 1.8)}" />
          <!-- Side Buttress Towers (Ağırlık Kuleleri) -->
          <path d="M88 362 V246 L105 224 L122 246 V362 Z" fill="#0f172a" stroke="#fb7185" stroke-width="${partStrokeWidth('filayagi', 1.4)}" />
          <path d="M518 362 V246 L535 224 L552 246 V362 Z" fill="#0f172a" stroke="#fb7185" stroke-width="${partStrokeWidth('filayagi', 1.4)}" />
          <!-- Force Flow Arrows -->
          <path d="M143 226 V345 M497 226 V345" stroke="#fda4af" stroke-width="1.6" stroke-dasharray="4 3" />
          <circle cx="143" cy="290" r="10" fill="#fb7185" />
          <text x="143" y="294" text-anchor="middle" fill="#0f172a" font-size="9" font-weight="800">06</text>
        </g>

        <!-- 01: Ana Kubbe & Kasnak Işık Çemberi -->
        <g class="saw-svg-hotspot" data-saw-part="kubbe" opacity="${partOpacity('kubbe')}">
          <!-- Alem (Finial) -->
          <line x1="320" y1="20" x2="320" y2="48" stroke="url(#saw-gold-grad)" stroke-width="2.6" />
          <circle cx="320" cy="34" r="4.5" fill="#fde68a" />
          <path d="M315 24 A6 6 0 1 0 325 24 A4.5 4.5 0 1 1 315 24 Z" fill="#fde68a" />
          <!-- Main Dome Shell -->
          <path d="M180 158 C180 78, 240 48, 320 48 C400 48, 460 78, 460 158 Z"
            fill="url(#saw-dome-glow)" stroke="#00f2fe" stroke-width="${partStrokeWidth('kubbe', 2.2)}" />
          <!-- Dome Ribs (Meridians) -->
          <path d="M320 48 C275 68, 242 108, 232 158 M320 48 C365 68, 398 108, 408 158 M320 48 V158"
            fill="none" stroke="#67e8f9" stroke-width="1.1" stroke-dasharray="3 3" />
          <!-- Kasnak Drum Windows -->
          <rect x="176" y="158" width="288" height="26" rx="3" fill="#0f172a" stroke="#00f2fe" stroke-width="${partStrokeWidth('kubbe', 1.6)}" />
          <g fill="#67e8f9" opacity="0.85">
            <rect x="196" y="164" width="14" height="14" rx="6" />
            <rect x="230" y="164" width="14" height="14" rx="6" />
            <rect x="264" y="164" width="14" height="14" rx="6" />
            <rect x="313" y="164" width="14" height="14" rx="6" />
            <rect x="362" y="164" width="14" height="14" rx="6" />
            <rect x="396" y="164" width="14" height="14" rx="6" />
            <rect x="430" y="164" width="14" height="14" rx="6" />
          </g>
          <circle cx="320" cy="84" r="11" fill="#00f2fe" />
          <text x="320" y="88" text-anchor="middle" fill="#0f172a" font-size="9.5" font-weight="800">01</text>
        </g>

        <!-- 02: Pandantif & Türk Üçgeni Geçişi -->
        <g class="saw-svg-hotspot" data-saw-part="pandantif" opacity="${partOpacity('pandantif')}">
          <path d="M164 210 L176 184 H238 C215 202, 195 215, 164 210 Z"
            fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" stroke-width="${partStrokeWidth('pandantif', 1.8)}" />
          <path d="M476 210 L464 184 H402 C425 202, 445 215, 476 210 Z"
            fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" stroke-width="${partStrokeWidth('pandantif', 1.8)}" />
          <!-- Geometric Turkish Triangle Facets -->
          <path d="M176 184 L196 208 L216 184 M464 184 L444 208 L424 184"
            fill="none" stroke="#fde68a" stroke-width="1.2" />
          <circle cx="204" cy="197" r="10" fill="#f59e0b" />
          <text x="204" y="201" text-anchor="middle" fill="#0f172a" font-size="9" font-weight="800">02</text>
        </g>

        <!-- 04: Sivri Kemer, Kilit Taşı & Tahliye Gözü -->
        <g class="saw-svg-hotspot" data-saw-part="kemer" opacity="${partOpacity('kemer')}">
          <!-- Great Pointed Arch -->
          <path d="M164 290 V245 C164 205, 240 190, 320 185 C400 190, 476 205, 476 245 V290"
            fill="none" stroke="#10b981" stroke-width="${partStrokeWidth('kemer', 2.6)}" />
          <!-- Keystone (Kilit Taşı) -->
          <polygon points="311,179 329,179 325,195 315,195" fill="#10b981" stroke="#ecfdf5" stroke-width="1.2" />
          <!-- Flood Relief Arch & Bridge Reference on Side -->
          <path d="M526 320 A16 18 0 0 1 558 320 V362 H526 Z" fill="rgba(16, 185, 129, 0.16)" stroke="#10b981" stroke-width="1.3" />
          <path d="M82 320 A16 18 0 0 1 114 320 V362 H82 Z" fill="rgba(16, 185, 129, 0.16)" stroke="#10b981" stroke-width="1.3" />
          <circle cx="320" cy="186" r="10" fill="#10b981" />
          <text x="320" y="190" text-anchor="middle" fill="#0f172a" font-size="9" font-weight="800">04</text>
        </g>

        <!-- 03: Mukarnas Taçkapı & Petek Hendesesi -->
        <g class="saw-svg-hotspot" data-saw-part="mukarnas" opacity="${partOpacity('mukarnas')}">
          <rect x="266" y="216" width="108" height="146" rx="4" fill="rgba(168, 85, 247, 0.12)" stroke="#a855f7" stroke-width="${partStrokeWidth('mukarnas', 1.7)}" />
          <!-- Tiered Muqarnas Honeycomb Vaulting -->
          <path d="M276 254 L286 242 L298 254 L310 242 L320 254 L330 242 L342 254 L354 242 L364 254"
            fill="none" stroke="#d8b4fe" stroke-width="1.6" />
          <path d="M286 242 L298 230 L310 242 L320 230 L330 242 L342 230 L354 242"
            fill="none" stroke="#c084fc" stroke-width="1.5" />
          <path d="M298 230 L320 218 L342 230" fill="none" stroke="#e9d5ff" stroke-width="1.6" />
          <!-- Inner Portal Arch -->
          <path d="M288 362 V290 C288 268, 305 258, 320 254 C335 258, 352 268, 352 290 V362"
            fill="rgba(168, 85, 247, 0.14)" stroke="#c084fc" stroke-width="1.5" />
          <circle cx="356" cy="236" r="10" fill="#a855f7" />
          <text x="356" y="240" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="800">03</text>
        </g>

        <!-- 05: Dört Eyvan, Şadırvan & Şifa Akustiği -->
        <g class="saw-svg-hotspot" data-saw-part="darussifa" opacity="${partOpacity('darussifa')}">
          <!-- Courtyard Şadırvan Basin & Water Ripples -->
          <ellipse cx="320" cy="347" rx="52" ry="9" fill="url(#saw-water-grad)" stroke="#38bdf8" stroke-width="${partStrokeWidth('darussifa', 1.7)}" />
          <path d="M320 347 V325 M320 325 C312 330, 308 336, 306 344 M320 325 C328 330, 332 336, 334 344"
            fill="none" stroke="#7dd3fc" stroke-width="1.6" stroke-linecap="round" />
          <!-- Acoustic Healing Waves -->
          <path d="M250 315 Q265 298 280 315 M360 315 Q375 298 390 315"
            fill="none" stroke="#38bdf8" stroke-width="1.3" stroke-dasharray="3 3" />
          <circle cx="320" cy="347" r="10" fill="#38bdf8" />
          <text x="320" y="351" text-anchor="middle" fill="#0f172a" font-size="9" font-weight="800">05</text>
        </g>

        <!-- Legend Caption -->
        <text x="320" y="408" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="600">
          Diyagramdaki numaralı katmanlara tıklayarak Kubbe, Pandantif, Mukarnas, Kemer ve Darüşşifa hendesesini inceleyin
        </text>
      </svg>
    `;
  }

  // ---------------------------------------------------------------------------
  // Offline AI Essay Generator (Rich Fallback when no Gemini key or error)
  // ---------------------------------------------------------------------------
  function generateOfflineEssay(focusId, angleId, provincesMap) {
    const angleObj = AI_ANGLES.find(function (a) { return a.id === angleId; }) || AI_ANGLES[0];
    const visitedCount = Object.values(provincesMap).filter(function (p) { return p && p.visited; }).length;

    if (focusId && focusId !== 'general') {
      const item = MASTERPIECE_BY_ID.get(focusId);
      if (item) {
        const prov = provincesMap[item.provinceKey] || {};
        const cat = CATEGORY_MAP.get(item.category);
        return [
          `## ${cat ? cat.icon : '🕌'} ${item.name} — ${angleObj.shortLabel}`,
          `> "${PHILOSOPHY_MOTTO}: ${item.philosophy}"`,
          '',
          `### 1. Yapısal Hendese & Mühendislik`,
          `- **Konum & Dönem:** ${item.provinceName} / ${item.district} (${item.era}, ${item.year})`,
          `- **Mimar & Bâni:** ${item.architect} · ${item.patron}`,
          `- **Taşıyıcı Sistem:** ${item.structuralSystem}`,
          `- **Ölçü & Malzeme:** ${item.dimensions} · *${item.material}*`,
          '',
          `### 2. ${angleObj.label}`,
          `${item.architecturalDetails}`,
          '',
          angleId === 'sifa-akustik'
            ? `Bu yapıda ışık, hava akımı ve ses yankısı tesadüfe bırakılmamış; taşın ısıl kütlesi ile geometrik oranlar insan ruhunu ve bedenini dinlendiren bir denge kurmuştur.`
            : angleId === 'felsefe'
            ? `Taşın sertliği burada kibre değil tevazuya ve merhamete dönüşür. Geometrik simetri evrendeki ilahi nizamı, vakıf düzeni ise insana duyulan hürmeti somutlaştırır.`
            : `Yük aktarımındaki zarafet, malzemeyi israf etmeden maksimum açıklık ve dayanıklılık üretme ilkesine dayanır.`,
          '',
          `### 3. Seyyah Defteri Notu`,
          prov.visited
            ? `✅ **${item.provinceName}** ili şu an gezilmiş illeriniz arasında! Bu eserin detaylarını seyahat günlüğünüzdeki notlarla karşılaştırabilirsiniz.`
            : `🗺️ **${item.provinceName}** henüz keşif listenizde (${visitedCount}/81 il tamamlandı). Şehrin İl Halk Kütüphanesi’nde kısa bir okuma molası verip bu şaheseri yerinde inceleyebilirsiniz.`
        ].join('\n');
      }
    }

    return [
      `## 🕌 ${PHILOSOPHY_MOTTO} — Anadolu Mimari Hendesesi`,
      `> "Kareden daireye yükselen kubbe Tevhidi, yola kurulan taş köprü ve darüşşifa ise Merhameti taşa nakşeder."`,
      '',
      `### 1. Dört Ana Disiplinde Anadolu Mekân Felsefesi`,
      `- **🕌 Selâtin & Ulu Camiler:** Selimiye’den Divriği’ye uzanan çizgide kubbe ve kemer, kesretten vahdete geçişin geometrik sembolüdür.`,
      `- **🌉 Taş Köprüler:** Malabadi ve Uzunköprü, kilit taşı ve tahliye gözleriyle doğanın sert akıntısına karşı sabrın ve kamusal hayrın mühendisliğidir.`,
      `- **🏥 Darüşşifalar:** Gevher Nesibe’den Edirne II. Bayezid’e kadar hastayı su sesi, makam musikisi ve güneş ışığıyla iyileştiren şefkat mekânlarıdır.`,
      `- **🏰 Saray & Surlar:** İshak Paşa Sarayı ve Sümela, topografyaya hükmetmek yerine kayayla ve iklimle uzlaşan akılcı mimariyi temsil eder.`,
      '',
      `### 2. Seyyah İçin Okuma Anahtarı`,
      `Bugün 24 şaheserin bulunduğu iller arasında **${visitedCount}/81** il gezilmiş durumda. Herhangi bir eserin kartından **✨ Hendese & Felsefe Yorumla** butonuna basarak derinlemesine yapısal analiz üretebilirsiniz.`
    ].join('\n');
  }

  // ---------------------------------------------------------------------------
  // Main Render Entry Point: window.SEYYAH_MODULES.architecture.render(container, ctx)
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const safeCtx = ctx || {};
    const esc = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const normFn = typeof safeCtx.normalizeTurkish === 'function' ? safeCtx.normalizeTurkish : fallbackNormalizeTurkish;
    const provincesMap = resolveProvincesMap(safeCtx);

    const regions = ['Tümü'];
    MASTERPIECES.forEach(function (item) {
      if (item.region && regions.indexOf(item.region) === -1) {
        regions.push(item.region);
      }
    });

    const uiState = {
      activeHendeseId: 'kubbe',
      categoryFilter: 'all',
      regionFilter: 'Tümü',
      visitedFilter: 'all',
      searchQuery: '',
      expandedIds: new Set(),
      highlightedId: null,
      aiFocusId: 'edirne-selimiye',
      aiAngleId: 'hendese',
      aiStatus: 'idle',
      aiText: '',
      aiSource: '',
      aiRequestToken: 0
    };

    const visitedProvinceCount = new Set(
      MASTERPIECES.filter(function (m) {
        const p = provincesMap[m.provinceKey];
        return Boolean(p && p.visited);
      }).map(function (m) { return m.provinceKey; })
    ).size;

    const totalArchProvinces = new Set(MASTERPIECES.map(function (m) { return m.provinceKey; })).size;
    const unescoCount = MASTERPIECES.filter(function (m) {
      return m.unesco && m.unesco.indexOf('UNESCO Dünya Mirası (') === 0;
    }).length;

    function getFilteredMasterpieces() {
      const q = normFn(uiState.searchQuery);
      return MASTERPIECES.filter(function (item) {
        if (uiState.categoryFilter !== 'all' && item.category !== uiState.categoryFilter) return false;
        if (uiState.regionFilter !== 'Tümü' && item.region !== uiState.regionFilter) return false;

        const prov = provincesMap[item.provinceKey];
        const isVisited = Boolean(prov && prov.visited);
        if (uiState.visitedFilter === 'visited' && !isVisited) return false;
        if (uiState.visitedFilter === 'unvisited' && isVisited) return false;

        if (q) {
          const hay = normFn(
            `${item.name} ${item.provinceName} ${item.district} ${item.region} ${item.era} ${item.architect} ${item.patron} ${item.material} ${item.structuralSystem} ${item.philosophy}`
          );
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
    }

    function buildHendeseInspectorHtml() {
      const part = HENDESE_PARTS.find(function (p) { return p.id === uiState.activeHendeseId; }) || HENDESE_PARTS[0];
      const exampleChips = part.examples.map(function (exId) {
        const m = MASTERPIECE_BY_ID.get(exId);
        if (!m) return '';
        return `<button type="button" class="saw-chip-btn" data-saw-jump="${esc(m.id)}">🏛️ ${esc(m.name)}</button>`;
      }).join('');

      return `
        <div class="saw-insp-head">
          <div>
            <div class="saw-insp-sub">${esc(part.subtitle)}</div>
            <div class="saw-insp-title">${esc(part.title)}</div>
          </div>
          <span class="saw-insp-code">Katman ${esc(part.code)}</span>
        </div>

        <div class="saw-insp-block">
          <strong>📐 Geometrik Formül</strong>
          ${esc(part.geometry)}
        </div>

        <div class="saw-insp-block">
          <strong>⚖️ Taşıyıcı Statik & Mühendislik</strong>
          ${esc(part.statics)}
        </div>

        <div class="saw-insp-block philo">
          <strong>✨ Tevhid & Merhamet Yorumu</strong>
          ${esc(part.philosophy)}
        </div>

        <div>
          <div style="font-size:0.74rem;font-weight:700;color:var(--text-secondary,#94a3b8);margin-bottom:6px;">
            Bu Hendeseyi Temsil Eden Şaheserler:
          </div>
          <div class="saw-insp-links">
            ${exampleChips}
          </div>
        </div>
      `;
    }

    function buildCardsHtml(items) {
      if (!items.length) {
        return '<div class="saw-empty">Seçili kategori, bölge veya arama kriteriyle eşleşen mimari şaheser bulunamadı.</div>';
      }

      return items.map(function (item) {
        const prov = provincesMap[item.provinceKey] || {};
        const bannerSrc = resolveBannerPath(prov);
        const isVisited = Boolean(prov.visited);
        const plate = prov.plate ? formatPlate(prov.plate) : '--';
        const cat = CATEGORY_MAP.get(item.category);
        const isExpanded = uiState.expandedIds.has(item.id);
        const isHighlighted = uiState.highlightedId === item.id;

        const secondaryBtn = item.secondaryProvinceKey
          ? `<button type="button" class="saw-btn saw-btn-ghost" data-saw-goto="${esc(item.secondaryProvinceKey)}" title="Batman il sayfasına git">📍 Batman</button>`
          : '';

        return `
          <article class="saw-card ${isHighlighted ? 'is-highlighted' : ''}" id="saw-card-${esc(item.id)}">
            <div class="saw-card-banner">
              <img src="${esc(bannerSrc)}" alt="${esc(item.name)}" loading="lazy" onerror="this.onerror=null;this.src='assets/banner.jpg';" />
              <div class="saw-banner-scrim"></div>
              <div class="saw-banner-top">
                <span class="saw-era-badge">${esc(item.era)} · ${esc(item.year)}</span>
                <span class="saw-status-badge ${isVisited ? 'visited' : ''}">
                  ${isVisited ? '✅ İl Gezildi' : '🧭 Keşif Bekliyor'}
                </span>
              </div>
              <div class="saw-banner-bottom">
                <div class="saw-card-cat">${cat ? esc(cat.icon + ' ' + cat.shortLabel) : ''} · ${esc(item.region)}</div>
                <div class="saw-card-title">${esc(item.name)}</div>
                <div class="saw-card-loc">📍 ${esc(item.provinceName)} / ${esc(item.district)} · Plaka ${esc(plate)}</div>
              </div>
            </div>

            <div class="saw-card-body">
              <div class="saw-meta-chips">
                <span class="saw-meta-chip">👷 ${esc(item.architect)}</span>
                ${item.unesco ? `<span class="saw-meta-chip unesco">🏛️ ${esc(item.unesco)}</span>` : ''}
              </div>

              <div class="saw-card-block">
                <strong>Taşıyıcı Sistem:</strong> ${esc(item.structuralSystem)}
              </div>

              <div class="saw-philo-box">
                <strong>🕊️ Taşa Nakşedilen Mana:</strong> ${esc(item.philosophy)}
              </div>

              ${isExpanded ? `
                <div class="saw-detail-drawer">
                  <div><strong>📏 Ölçüler:</strong> ${esc(item.dimensions)}</div>
                  <div><strong>🪨 Malzeme:</strong> ${esc(item.material)}</div>
                  <div><strong>👑 Bânisi:</strong> ${esc(item.patron)}</div>
                  <div><strong>🔍 Hendese Detayı:</strong> ${esc(item.architecturalDetails)}</div>
                </div>
              ` : ''}

              <div class="saw-card-actions">
                <button type="button" class="saw-btn saw-btn-primary" data-saw-goto="${esc(item.provinceKey)}">
                  📍 Şehre Git
                </button>
                ${secondaryBtn}
                <button type="button" class="saw-btn saw-btn-ai" data-saw-ai="${esc(item.id)}">
                  ✨ Hendese Yorumla
                </button>
                <button type="button" class="saw-btn saw-btn-ghost" data-saw-toggle="${esc(item.id)}" aria-expanded="${isExpanded ? 'true' : 'false'}">
                  ${isExpanded ? '▲ Kapat' : '📐 Detay'}
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }

    function updateHendeseOnly() {
      const root = container.querySelector('#saw-root');
      if (!root) return;
      const svgBox = root.querySelector('#saw-svg-stage-box');
      const inspBox = root.querySelector('#saw-hendese-inspector');
      if (svgBox) svgBox.innerHTML = buildHendeseSvgHtml(uiState.activeHendeseId);
      if (inspBox) inspBox.innerHTML = buildHendeseInspectorHtml();
      root.querySelectorAll('[data-saw-part-btn]').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-saw-part-btn') === uiState.activeHendeseId);
      });
    }

    function updateCardsOnly() {
      const root = container.querySelector('#saw-root');
      if (!root) return;
      const items = getFilteredMasterpieces();
      const grid = root.querySelector('#saw-cards-grid');
      const meta = root.querySelector('#saw-results-meta');
      if (grid) grid.innerHTML = buildCardsHtml(items);
      if (meta) {
        meta.textContent = `${items.length} / ${MASTERPIECES.length} mimari şaheser gösteriliyor`;
      }
    }

    function updateAiOutputOnly() {
      const root = container.querySelector('#saw-root');
      if (!root) return;
      const outBox = root.querySelector('#saw-ai-output-wrap');
      const triggerBtn = root.querySelector('#saw-ai-trigger');
      if (triggerBtn) {
        triggerBtn.disabled = uiState.aiStatus === 'streaming';
        triggerBtn.textContent = uiState.aiStatus === 'streaming'
          ? '⏳ Hendese Yorumlanıyor...'
          : '✨ Gemini AI ile Mimari & Hendese Felsefesi Yorumla';
      }
      if (!outBox) return;
      outBox.innerHTML = buildAiOutputHtml();
    }

    function buildAiOutputHtml() {
      const isStreaming = uiState.aiStatus === 'streaming';
      const hasAiKey = Boolean(window.SEYYAH_AI && typeof window.SEYYAH_AI.hasKey === 'function' && window.SEYYAH_AI.hasKey());
      const contentText = uiState.aiText || generateOfflineEssay(uiState.aiFocusId, uiState.aiAngleId, provincesMap);
      const sourceLabel = uiState.aiSource || (hasAiKey
        ? '⚡ Gemini AI Hazır — Yukarıdaki butona basarak canlı felsefe ve hendese analizi başlatın'
        : '📜 Çevrimdışı Mimari Hendese & Tevhid Arşivi (API Anahtarı olmadan da tam çalışır)');

      let matchedProvs = [];
      if (!isStreaming && uiState.aiText && window.SEYYAH_AI && typeof window.SEYYAH_AI.extractProvinceMatches === 'function') {
        matchedProvs = window.SEYYAH_AI.extractProvinceMatches(uiState.aiText, safeCtx, 6) || [];
      }

      const matchChipsHtml = matchedProvs.length
        ? `
          <div class="saw-ai-matches">
            <span style="font-size:0.76rem;font-weight:700;color:var(--text-secondary,#94a3b8);">📍 Anlatımda Geçen İller:</span>
            ${matchedProvs.map(function (mp) {
              return `<button type="button" class="saw-chip-btn" data-saw-goto="${esc(mp.key)}">${esc(mp.name)} (${esc(formatPlate(mp.plate))})</button>`;
            }).join('')}
          </div>
        `
        : '';

      return `
        <div class="saw-ai-output">
          <div class="saw-ai-output-head">
            <span class="saw-ai-source">${esc(sourceLabel)}</span>
            <span style="color:var(--text-secondary,#94a3b8);">${isStreaming ? 'Canlı akış...' : 'Hazır'}</span>
          </div>
          <div class="saw-ai-md" id="saw-ai-md-body">
            ${renderMdSafe(contentText, esc)}
          </div>
          ${matchChipsHtml}
        </div>
      `;
    }

    async function runAiInterpretation(overrideFocusId) {
      if (overrideFocusId) {
        uiState.aiFocusId = overrideFocusId;
        const focusSel = container.querySelector('#saw-ai-focus');
        if (focusSel) focusSel.value = overrideFocusId;
      }
      if (uiState.aiStatus === 'streaming') return;

      const reqToken = ++uiState.aiRequestToken;
      uiState.aiStatus = 'streaming';
      uiState.aiText = '';
      uiState.aiSource = '';
      updateAiOutputOnly();

      const focusId = uiState.aiFocusId || 'general';
      const angleId = uiState.aiAngleId || 'hendese';
      const angleObj = AI_ANGLES.find(function (a) { return a.id === angleId; }) || AI_ANGLES[0];

      const canUseLiveAi =
        window.SEYYAH_AI &&
        typeof window.SEYYAH_AI.stream === 'function' &&
        typeof window.SEYYAH_AI.hasKey === 'function' &&
        window.SEYYAH_AI.hasKey();

      if (!canUseLiveAi) {
        uiState.aiStatus = 'done';
        uiState.aiText = generateOfflineEssay(focusId, angleId, provincesMap);
        uiState.aiSource = '📜 Çevrimdışı Mimari & Hendese Arşivi';
        updateAiOutputOnly();
        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast('🕌 Mimari & hendese yorumu çevrimdışı arşivden hazırlandı.');
        }
        return;
      }

      const anatoliaCtx = typeof window.SEYYAH_AI.buildAnatoliaContext === 'function'
        ? window.SEYYAH_AI.buildAnatoliaContext(safeCtx)
        : '';

      const systemPrompt = [
        'Sen Mimar Sinan ekolünü, Anadolu Selçuklu taş işçiliğini, klasik İslam geometrisini (hendese) ve vakıf medeniyetini derinlemesine bilen bir mimarlık tarihçisi ve tefekkür yazarısın.',
        `Ana Felsefe: "${PHILOSOPHY_MOTTO}" — Kubbe ve mukarnasta Tevhid (kesretten vahdete geçiş), taş köprü ve darüşşifada Merhamet (kamusal hayır, şifa, su ve musiki).`,
        'Yanıtını Türkçe, somut teknik terimlerle (pandantif, tromp, kilit taşı, mukarnas, horasan harcı, baldaken, eyvan, selsebil vb.), edebi ve Markdown formatında yaz (başlıklar, alıntı ve madde işaretleri kullan).'
      ].join('\n');

      let focusPrompt = '';
      if (focusId !== 'general') {
        const item = MASTERPIECE_BY_ID.get(focusId);
        if (item) {
          focusPrompt = [
            `Odak Şaheser: ${item.name} (${item.provinceName} / ${item.district})`,
            `Dönem & Mimar: ${item.era} (${item.year}) · ${item.architect} · Bâni: ${item.patron}`,
            `Taşıyıcı Sistem & Malzeme: ${item.structuralSystem} · ${item.material}`,
            `Ölçüler: ${item.dimensions}`,
            `Öz Felsefe: ${item.philosophy}`,
            `Mimari Detay: ${item.architecturalDetails}`,
            `İstenen Analiz Açısı: ${angleObj.label}`,
            'Görev: Bu eserin yapısal hendesesini, ışık/akustik/su veya taş işçiliği sırlarını ve "Taşa Nakşedilen Tevhid ve Merhamet" felsefesindeki yerini derinlemesine yorumla; sonunda seyyahın bu yapıyı gezerken özellikle dikkat etmesi gereken 3 somut gözlem noktası ver.'
          ].join('\n');
        }
      }

      if (!focusPrompt) {
        focusPrompt = [
          `Anadolu Mimari Şaheserleri Atlası (24 Eser: Selimiye, Süleymaniye, Divriği Ulu Cami, Malabadi, Uzunköprü, Gevher Nesibe, Edirne II. Bayezid Darüşşifası, İshak Paşa Sarayı, Sümela vb.).`,
          `İstenen Analiz Açısı: ${angleObj.label}`,
          'Görev: Anadolu’daki cami, köprü, darüşşifa ve kale/saray mimarilerini birbirine bağlayan ortak geometriyi (kareden daireye geçiş, kilit taşı dengesi, şifa akustiği) ve "Taşa Nakşedilen Tevhid ve Merhamet" fikrini sentezleyen etkileyici bir deneme yaz.'
        ].join('\n');
      }

      const fullPrompt = [
        focusPrompt,
        anatoliaCtx ? `\nSeyyah Bağlamı:\n${anatoliaCtx}` : ''
      ].filter(Boolean).join('\n');

      try {
        const res = await window.SEYYAH_AI.stream({
          prompt: fullPrompt,
          system: systemPrompt,
          temperature: 0.72,
          maxTokens: 1500,
          cacheKey: `arch:${focusId}:${angleId}`,
          onChunk: function (_delta, fullText) {
            if (reqToken !== uiState.aiRequestToken) return;
            uiState.aiText = fullText;
            const mdBody = container.querySelector('#saw-ai-md-body');
            if (mdBody) {
              mdBody.innerHTML = renderMdSafe(fullText, esc);
            }
          }
        });

        if (reqToken !== uiState.aiRequestToken) return;
        uiState.aiStatus = 'done';
        uiState.aiText = (res && res.text) || uiState.aiText || generateOfflineEssay(focusId, angleId, provincesMap);
        uiState.aiSource = res && res.model
          ? `⚡ Gemini AI (${res.model})${res.cached ? ' · Önbellek' : ''}`
          : '⚡ Gemini AI Canlı Yorum';
        updateAiOutputOnly();
      } catch (_err) {
        if (reqToken !== uiState.aiRequestToken) return;
        uiState.aiStatus = 'done';
        uiState.aiText = generateOfflineEssay(focusId, angleId, provincesMap);
        uiState.aiSource = '📜 Çevrimdışı Mimari Arşivi (AI Yedeği)';
        updateAiOutputOnly();
        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast('⚠️ Gemini AI yanıt veremedi — Çevrimdışı mimari arşivi gösteriliyor.');
        }
      }
    }

    function paint() {
      const catTabsHtml = [
        `<button type="button" class="saw-cat-tab ${uiState.categoryFilter === 'all' ? 'active' : ''}" data-saw-cat="all">
          <span>🏛️ Tüm Şaheserler</span>
          <span class="saw-cat-count">${MASTERPIECES.length}</span>
        </button>`
      ].concat(CATEGORIES.map(function (cat) {
        const count = MASTERPIECES.filter(function (m) { return m.category === cat.id; }).length;
        return `
          <button type="button" class="saw-cat-tab ${uiState.categoryFilter === cat.id ? 'active' : ''}" data-saw-cat="${esc(cat.id)}">
            <span>${esc(cat.icon)} ${esc(cat.shortLabel)}</span>
            <span class="saw-cat-count">${count}</span>
          </button>
        `;
      })).join('');

      const regionPillsHtml = regions.map(function (reg) {
        return `<button type="button" class="saw-pill ${uiState.regionFilter === reg ? 'active' : ''}" data-saw-region="${esc(reg)}">${esc(reg)}</button>`;
      }).join('');

      const partButtonsHtml = HENDESE_PARTS.map(function (p) {
        return `
          <button type="button" class="saw-part-pill ${uiState.activeHendeseId === p.id ? 'active' : ''}" data-saw-part-btn="${esc(p.id)}">
            <span>${esc(p.code)}</span>
            <span>${esc(p.title.split('&')[0].trim())}</span>
          </button>
        `;
      }).join('');

      const focusOptionsHtml = [
        `<option value="general" ${uiState.aiFocusId === 'general' ? 'selected' : ''}>🌐 Genel Sentez: Taşa Nakşedilen Tevhid ve Merhamet</option>`
      ].concat(CATEGORIES.map(function (cat) {
        const opts = MASTERPIECES.filter(function (m) { return m.category === cat.id; }).map(function (m) {
          return `<option value="${esc(m.id)}" ${uiState.aiFocusId === m.id ? 'selected' : ''}>${esc(m.name)} (${esc(m.provinceName)})</option>`;
        }).join('');
        return `<optgroup label="${esc(cat.icon + ' ' + cat.label)}">${opts}</optgroup>`;
      })).join('');

      const angleOptionsHtml = AI_ANGLES.map(function (ang) {
        return `<option value="${esc(ang.id)}" ${uiState.aiAngleId === ang.id ? 'selected' : ''}>${esc(ang.label)}</option>`;
      }).join('');

      const filteredItems = getFilteredMasterpieces();

      container.innerHTML = `
        <div class="saw-root" id="saw-root">
          <!-- Hero -->
          <section class="saw-hero">
            <div class="saw-hero-top">
              <span class="saw-eyebrow">📐 Anadolu Mimari & Hendese Atölyesi</span>
              <span class="saw-motto-pill">🕊️ ${esc(PHILOSOPHY_MOTTO)}</span>
            </div>
            <h1 class="saw-title">🕌 Anadolu Mimari Şaheserleri: Kubbe, Taş, Köprü &amp; Darüşşifa Hendesesi</h1>
            <p class="saw-subtitle">
              Selimiye’nin tek merkezî kubbesinden Divriği’nin eşsiz taş taçkapılarına, Malabadi’nin 40 metrelik sivri kemerinden
              Gevher Nesibe ve Edirne Darüşşifalarının su sesiyle iyileştiren şifa odalarına kadar Anadolu medeniyetinin 24 başyapıtını
              yapısal hendese ve manevi felsefe ekseninde keşfedin.
            </p>
            <div class="saw-quote-box">
              <strong>“${esc(PHILOSOPHY_MOTTO)}”</strong> — Kareden daireye yükselen kubbe ve mukarnas <em>Tevhidi</em>;
              nehirleri birleştiren taş köprü ile su ve musikiyle şifa veren darüşşifa ise <em>Merhameti</em> taşa işler.
            </div>

            <div class="saw-kpi-grid">
              <div class="saw-kpi-card">
                <span class="saw-kpi-label">Küratörlü Ansiklopedi</span>
                <span class="saw-kpi-val">${MASTERPIECES.length} Şaheser</span>
                <span class="saw-kpi-sub">4 ana mimari disiplinde 6’şar eser</span>
              </div>
              <div class="saw-kpi-card">
                <span class="saw-kpi-label">Gezilen Mimari İller</span>
                <span class="saw-kpi-val">${visitedProvinceCount} / ${totalArchProvinces} İl</span>
                <span class="saw-kpi-sub">Seyahat defterinizle canlı senkron</span>
              </div>
              <div class="saw-kpi-card">
                <span class="saw-kpi-label">Coğrafi Kapsam</span>
                <span class="saw-kpi-val">7 Bölge</span>
                <span class="saw-kpi-sub">Roma’dan Selçuklu ve Osmanlı’ya</span>
              </div>
              <div class="saw-kpi-card">
                <span class="saw-kpi-label">Dünya Mirası Odağı</span>
                <span class="saw-kpi-val">${unescoCount}+ UNESCO</span>
                <span class="saw-kpi-sub">Ve Geçici Liste başyapıtları</span>
              </div>
            </div>
          </section>

          <!-- Interactive SVG Hendese Studio -->
          <section class="saw-section">
            <div class="saw-section-head">
              <div>
                <h2 class="saw-section-title">📐 Kubbe, Kemer ve Mukarnas Hendesesi — Etkileşimli Yapı Kesiti</h2>
                <p class="saw-section-desc">
                  Taşıyıcı sistemin altı temel katmanına tıklayarak geometrik formülü, kuvvet aktarımını ve manevi anlamını inceleyin.
                </p>
              </div>
            </div>

            <div class="saw-hendese-grid">
              <div class="saw-svg-stage">
                <div id="saw-svg-stage-box">
                  ${buildHendeseSvgHtml(uiState.activeHendeseId)}
                </div>
                <div class="saw-svg-part-tabs">
                  ${partButtonsHtml}
                </div>
              </div>
              <div class="saw-hendese-inspector" id="saw-hendese-inspector">
                ${buildHendeseInspectorHtml()}
              </div>
            </div>
          </section>

          <!-- 24 Architectural Masterpieces Encyclopedia -->
          <section class="saw-section">
            <div class="saw-section-head">
              <div>
                <h2 class="saw-section-title">🏛️ 24 Anadolu Mimari Şaheseri Ansiklopedisi</h2>
                <p class="saw-section-desc">
                  4 disipline ayrılmış 24 eser; il banner görselleri, yapısal sistem analizi, şehre geçiş ve Gemini AI hendese yorumuyla.
                </p>
              </div>
            </div>

            <div class="saw-filters-wrap">
              <div class="saw-cat-tabs">
                ${catTabsHtml}
              </div>

              <div class="saw-filter-bar">
                <div class="saw-pill-row" aria-label="Bölge Filtresi">
                  ${regionPillsHtml}
                </div>

                <div class="saw-pill-row" aria-label="Ziyaret Durumu">
                  <button type="button" class="saw-pill ${uiState.visitedFilter === 'all' ? 'active' : ''}" data-saw-visited="all">Tümü</button>
                  <button type="button" class="saw-pill ${uiState.visitedFilter === 'visited' ? 'active' : ''}" data-saw-visited="visited">✅ Gezilen İller</button>
                  <button type="button" class="saw-pill ${uiState.visitedFilter === 'unvisited' ? 'active' : ''}" data-saw-visited="unvisited">🧭 Keşfedilecekler</button>
                </div>

                <div class="saw-search-box">
                  <input
                    type="search"
                    id="saw-search-input"
                    class="saw-search-input"
                    placeholder="Eser, şehir, mimar veya malzeme ara..."
                    value="${esc(uiState.searchQuery)}"
                  />
                </div>
              </div>
            </div>

            <div class="saw-results-meta" id="saw-results-meta">
              ${filteredItems.length} / ${MASTERPIECES.length} mimari şaheser gösteriliyor
            </div>

            <div class="saw-cards-grid" id="saw-cards-grid">
              ${buildCardsHtml(filteredItems)}
            </div>
          </section>

          <!-- Gemini AI Studio -->
          <section class="saw-ai-panel" id="saw-ai-panel">
            <div class="saw-section-head">
              <div>
                <h2 class="saw-section-title">✨ Gemini AI ile Mimari &amp; Hendese Felsefesi Yorumla</h2>
                <p class="saw-section-desc">
                  Seçtiğiniz şaheserin taşıyıcı geometrisini, akustik/su mühendisliğini ve "Taşa Nakşedilen Tevhid ve Merhamet" felsefesini analiz edin.
                </p>
              </div>
            </div>

            <div class="saw-ai-controls">
              <select id="saw-ai-focus" class="saw-select" aria-label="Odak Şaheser">
                ${focusOptionsHtml}
              </select>
              <select id="saw-ai-angle" class="saw-select" aria-label="Yorum Açısı" style="max-width:300px;">
                ${angleOptionsHtml}
              </select>
              <button type="button" id="saw-ai-trigger" class="saw-ai-trigger">
                ✨ Gemini AI ile Mimari &amp; Hendese Felsefesi Yorumla
              </button>
            </div>

            <div id="saw-ai-output-wrap">
              ${buildAiOutputHtml()}
            </div>
          </section>
        </div>
      `;

      bindEvents();
    }

    function bindEvents() {
      const root = container.querySelector('#saw-root');
      if (!root) return;

      const searchInput = root.querySelector('#saw-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', function (e) {
          uiState.searchQuery = e.target.value || '';
          updateCardsOnly();
        });
      }

      const focusSelect = root.querySelector('#saw-ai-focus');
      if (focusSelect) {
        focusSelect.addEventListener('change', function (e) {
          uiState.aiFocusId = e.target.value || 'general';
        });
      }

      const angleSelect = root.querySelector('#saw-ai-angle');
      if (angleSelect) {
        angleSelect.addEventListener('change', function (e) {
          uiState.aiAngleId = e.target.value || 'hendese';
        });
      }

      const aiTrigger = root.querySelector('#saw-ai-trigger');
      if (aiTrigger) {
        aiTrigger.addEventListener('click', function () {
          runAiInterpretation();
        });
      }

      root.addEventListener('click', function (ev) {
        const target = ev.target;
        if (!target || typeof target.closest !== 'function') return;

        // SVG hotspot or layer pill click
        const partTarget = target.closest('[data-saw-part], [data-saw-part-btn]');
        if (partTarget) {
          const partId = partTarget.getAttribute('data-saw-part') || partTarget.getAttribute('data-saw-part-btn');
          if (partId) {
            uiState.activeHendeseId = partId;
            updateHendeseOnly();
          }
          return;
        }

        // Jump from Hendese inspector to masterpiece card
        const jumpBtn = target.closest('[data-saw-jump]');
        if (jumpBtn) {
          const jumpId = jumpBtn.getAttribute('data-saw-jump');
          if (jumpId) {
            uiState.categoryFilter = 'all';
            uiState.regionFilter = 'Tümü';
            uiState.visitedFilter = 'all';
            uiState.searchQuery = '';
            uiState.highlightedId = jumpId;
            uiState.expandedIds.add(jumpId);
            paint();
            const cardEl = container.querySelector('#saw-card-' + jumpId);
            if (cardEl && typeof cardEl.scrollIntoView === 'function') {
              cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
          return;
        }

        // Navigate to province detail
        const gotoBtn = target.closest('[data-saw-goto]');
        if (gotoBtn) {
          const cityKey = gotoBtn.getAttribute('data-saw-goto');
          if (cityKey && typeof safeCtx.selectCity === 'function') {
            safeCtx.selectCity(cityKey);
          }
          return;
        }

        // AI Interpretation trigger from card
        const cardAiBtn = target.closest('[data-saw-ai]');
        if (cardAiBtn) {
          const itemId = cardAiBtn.getAttribute('data-saw-ai');
          if (itemId) {
            const aiPanel = container.querySelector('#saw-ai-panel');
            if (aiPanel && typeof aiPanel.scrollIntoView === 'function') {
              aiPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            runAiInterpretation(itemId);
          }
          return;
        }

        // Toggle architectural detail drawer on card
        const toggleBtn = target.closest('[data-saw-toggle]');
        if (toggleBtn) {
          const itemId = toggleBtn.getAttribute('data-saw-toggle');
          if (itemId) {
            if (uiState.expandedIds.has(itemId)) {
              uiState.expandedIds.delete(itemId);
            } else {
              uiState.expandedIds.add(itemId);
            }
            updateCardsOnly();
          }
          return;
        }

        // Category tab
        const catBtn = target.closest('[data-saw-cat]');
        if (catBtn) {
          uiState.categoryFilter = catBtn.getAttribute('data-saw-cat') || 'all';
          root.querySelectorAll('[data-saw-cat]').forEach(function (b) {
            b.classList.toggle('active', b.getAttribute('data-saw-cat') === uiState.categoryFilter);
          });
          updateCardsOnly();
          return;
        }

        // Region filter pill
        const regBtn = target.closest('[data-saw-region]');
        if (regBtn) {
          uiState.regionFilter = regBtn.getAttribute('data-saw-region') || 'Tümü';
          root.querySelectorAll('[data-saw-region]').forEach(function (b) {
            b.classList.toggle('active', b.getAttribute('data-saw-region') === uiState.regionFilter);
          });
          updateCardsOnly();
          return;
        }

        // Visited filter pill
        const visBtn = target.closest('[data-saw-visited]');
        if (visBtn) {
          uiState.visitedFilter = visBtn.getAttribute('data-saw-visited') || 'all';
          root.querySelectorAll('[data-saw-visited]').forEach(function (b) {
            b.classList.toggle('active', b.getAttribute('data-saw-visited') === uiState.visitedFilter);
          });
          updateCardsOnly();
        }
      });
    }

    paint();
  }

  window.SEYYAH_MODULES.architecture = {
    render: render,
    MASTERPIECES: MASTERPIECES,
    CATEGORIES: CATEGORIES,
    HENDESE_PARTS: HENDESE_PARTS
  };
})();
