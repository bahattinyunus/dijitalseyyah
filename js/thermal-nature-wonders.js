/**
 * Anadolu Seyahatnamesi — Anadolu Tabiat Harikaları, Kanyonlar, Şelaleler & Şifalı Kaplıcalar Atlası
 * 7 bölgeye yayılan 28 seçkin tabiat harikasını (Kanyonlar & Vadiler, Şelaleler & Krater Gölleri,
 * Mağaralar & Jeoparklar, Şifalı Termal Kaplıcalar & İçmeler), "Âfâkî Tefekkür: Tabiat Kitabını Okumak"
 * felsefesini, 81 il banner/kütüphane verilerini ve Gemini AI canlı Tabiat & Şifa Rotası akışını
 * (çevrimdışı kürasyon rotası yedekli) tek stüdyoda buluşturur.
 *
 * Registers on: window.SEYYAH_MODULES.natureWonders = { render(container, ctx), WONDERS }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-thermal-nature-wonders-styles';

  // ---------------------------------------------------------------------------
  // Regions & Categories
  // ---------------------------------------------------------------------------
  const REGIONS = [
    { code: 'all', label: 'Tüm Bölgeler (7)', shortLabel: 'Tümü', icon: '🗺️' },
    { code: '01_Marmara', label: 'Marmara', shortLabel: 'Marmara', icon: '🌉' },
    { code: '02_Ege', label: 'Ege', shortLabel: 'Ege', icon: '🫒' },
    { code: '03_Akdeniz', label: 'Akdeniz', shortLabel: 'Akdeniz', icon: '🍊' },
    { code: '04_IcAnadolu', label: 'İç Anadolu', shortLabel: 'İç Anadolu', icon: '🌾' },
    { code: '05_Karadeniz', label: 'Karadeniz', shortLabel: 'Karadeniz', icon: '🌲' },
    { code: '06_DoguAnadolu', label: 'Doğu Anadolu', shortLabel: 'Doğu Anadolu', icon: '🏔️' },
    { code: '07_GuneydoguAnadolu', label: 'Güneydoğu Anadolu', shortLabel: 'Güneydoğu', icon: '🕌' }
  ];

  const CATEGORIES = [
    {
      id: 'all',
      label: 'Tümü',
      icon: '🏔️',
      color: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.14)'
    },
    {
      id: 'kanyon-vadi',
      label: '🏞️ Kanyonlar & Vadiler',
      shortLabel: 'Kanyonlar & Vadiler',
      icon: '🏞️',
      color: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.16)'
    },
    {
      id: 'selale-gol',
      label: '🌊 Şelaleler & Krater Gölleri',
      shortLabel: 'Şelaleler & Göller',
      icon: '🌊',
      color: '#06b6d4',
      badgeBg: 'rgba(6, 182, 212, 0.16)'
    },
    {
      id: 'magara-jeopark',
      label: '🕳️ Mağaralar & Jeoparklar',
      shortLabel: 'Mağaralar & Jeoparklar',
      icon: '🕳️',
      color: '#a855f7',
      badgeBg: 'rgba(168, 85, 247, 0.16)'
    },
    {
      id: 'termal-icme',
      label: '♨️ Şifalı Termal Kaplıcalar & İçmeler',
      shortLabel: 'Termal & İçmeler',
      icon: '♨️',
      color: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.16)'
    }
  ];

  const CATEGORY_MAP = {};
  CATEGORIES.forEach(function (c) {
    CATEGORY_MAP[c.id] = c;
  });

  const SEASONS = [
    { id: 'all', label: '🗓️ Tüm Mevsimler' },
    { id: 'ilkbahar', label: '🌸 İlkbahar' },
    { id: 'yaz', label: '☀️ Yaz' },
    { id: 'sonbahar', label: '🍂 Sonbahar' },
    { id: 'kis', label: '❄️ Kış' }
  ];

  function matchesSeason(wonder, seasonId, normFn) {
    if (!seasonId || seasonId === 'all') return true;
    const raw = normFn((wonder && wonder.season) || '');
    if (!raw) return true;
    if (raw.indexOf('4 mevsim') !== -1 || raw.indexOf('yil boyu') !== -1) return true;
    if (seasonId === 'ilkbahar') {
      return raw.indexOf('ilkbahar') !== -1 || raw.indexOf('nisan') !== -1 || raw.indexOf('mayis') !== -1 || raw.indexOf('mart') !== -1;
    }
    if (seasonId === 'yaz') {
      return (
        raw.indexOf('yaz') !== -1 ||
        raw.indexOf('haziran') !== -1 ||
        raw.indexOf('temmuz') !== -1 ||
        raw.indexOf('agustos') !== -1 ||
        raw.indexOf('mayis') !== -1 ||
        raw.indexOf('nisan') !== -1 ||
        (raw.indexOf('ilkbahar') !== -1 && raw.indexOf('sonbahar') !== -1 && raw.indexOf('&') === -1)
      );
    }
    if (seasonId === 'sonbahar') {
      return raw.indexOf('sonbahar') !== -1 || raw.indexOf('eylul') !== -1 || raw.indexOf('ekim') !== -1 || raw.indexOf('kasim') !== -1;
    }
    if (seasonId === 'kis') {
      return raw.indexOf('kis') !== -1 || raw.indexOf('aralik') !== -1 || raw.indexOf('ocak') !== -1 || raw.indexOf('subat') !== -1;
    }
    return true;
  }

  function dispatchRouteCities(ctx, provinceKeys, toastMsg) {
    const uniqueKeys = [];
    (provinceKeys || []).forEach(function (k) {
      if (k && uniqueKeys.indexOf(k) === -1) uniqueKeys.push(k);
    });
    if (!uniqueKeys.length) return;
    if (ctx && ctx.state) {
      ctx.state.customRouteCities = uniqueKeys.slice();
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('seyyah_custom_route', JSON.stringify(uniqueKeys));
      }
    } catch (_) {}
    if (ctx && typeof ctx.showToast === 'function' && toastMsg) {
      ctx.showToast(toastMsg);
    }
    if (typeof window !== 'undefined' && window.location) {
      window.location.hash = '#route';
    }
  }

  // ---------------------------------------------------------------------------
  // Philosophical Section: "Âfâkî Tefekkür: Tabiat Kitabını Okumak (Kâinat Âyetleri)"
  // ---------------------------------------------------------------------------
  const TEFEKKUR_PILLARS = [
    {
      id: 'kainat-kitabi',
      title: 'Kâinat Kitabını Okumak (Âfâk & Enfüs)',
      icon: '📖',
      source: 'Fussilet 53 · Ankebût 20 · Anadolu İrfanı',
      quote:
        '“Biz onlara hem dış dünyada (âfâkta) hem kendi iç dünyalarında (enfüste) âyetlerimizi göstereceğiz.”',
      body:
        'Anadolu irfanında tabiat, yalnızca fotoğrafı çekilecek bir dekor değil; her kayası, çağlayanı ve gölü birer satır olan büyük bir kitaptır. Seyyah kanyonlara bakarken yüceliği, gölün durgunluğunda kalbin sükûnetini okur; dış âlemdeki nizam iç âlemdeki dağınıklığı toplar.'
    },
    {
      id: 'suyun-zikri',
      title: 'Suyun Zikri, Termal Kaynak & Şifa Hikmeti',
      icon: '♨️',
      source: 'Enbiyâ 30 · Kaplıca & Darüşşifa Geleneği',
      quote:
        '“Her canlı şeyi sudan yarattık.” — Su aktığı yeri temizler, ısındığı yeraltından şifa getirir.',
      body:
        'Yerin derinliklerindeki fay hatlarından sabırla süzülüp mineralle zenginleşerek yeryüzüne çıkan kaplıcalar, Selçuklu ve Osmanlı’dan beri “şifahâne” bilinciyle korunmuştur. Ilık bir termal suda dinlenmek, modern hızın yorduğu bedeni ve zihni yeniden fıtrî ritmine döndürür.'
    },
    {
      id: 'tasin-sabri',
      title: 'Taşın Sabrı: Kanyonlar & Yeraltı Mağaraları',
      icon: '🪨',
      source: 'Zaman Estetiği · Jeolojik Tefekkür',
      quote:
        'Damla taşı delmez gücüyle; sabrıyla ve sürekliliğiyle vadiler açar, sarkıtlar örer.',
      body:
        'Valla’dan Ihlara’ya milyonlarca yılda oyulan kanyonlar ve Ballıca’dan Karaca’ya damla damla işlenen sarkıtlar, aceleci insana “zamanın terbiyesini” öğretir. Bir damlanın yüzyıllar içinde mermer sütuna dönüşmesi, küçük ama kararlı adımların bereketine şahitlik eder.'
    },
    {
      id: 'ekolojik-emanet',
      title: 'Ekolojik Emanet & Tüketmeyen Seyyah Ahlâkı',
      icon: '🌿',
      source: 'Yavaş Seyahat · Emanet Şuuru',
      quote:
        '“Bastığın yeri toprak diyerek geçme, tanı; gördüğün her kaynak sana bir emanettir.”',
      body:
        'Salda’nın kırılgan hidromanyezit kumundan Kelebekler Vadisi’nin sessizliğine kadar her tabiat harikası bizden “iz bırakmadan hayret etmeyi” ister. Gerçek dijital seyyah; gürültü üretmeden yürüyen, çöp değil yalnızca şükür ve tefekkür izi bırakan yolcudur.'
    }
  ];

  // ---------------------------------------------------------------------------
  // Curated Catalog of 28 Major Anatolian Natural & Thermal Wonders
  // Verified against ctx.data.provinces keys
  // ---------------------------------------------------------------------------
  const WONDERS = [
    // 1. 🏞️ Kanyonlar & Vadiler (7)
    {
      id: 'valla-kanyonu',
      name: 'Valla Kanyonu',
      category: 'kanyon-vadi',
      provinceKey: '05_Karadeniz/Kastamonu',
      district: 'Pınarbaşı · Küre Dağları',
      metric: 'Derinlik: 800–1.200 m',
      season: 'Mayıs – Ekim',
      featureType: 'Karstik Dev Kanyon',
      summary:
        'Devrekani Çayı’nın Küre Dağları’nı yararak oluşturduğu yaklaşık 12 km uzunluğundaki Valla Kanyonu, yer yer 1.200 metreye ulaşan sarp duvarlarıyla dünyanın en derin ikinci kanyonu kabul edilir. Komşusu Horma Kanyonu ve Ilıca Şelalesi ile eşsiz bir Karadeniz tabiat koridoru oluşturur.',
      tefekkurNote:
        'Seyir terasından aşağıya bakarken insan, kâinatın ölçüsü karşısında kibrini bırakıp hayret makamına geçer.',
      highlights: ['1.200 m Kayalık Duvarlar', 'Küre Dağları Millî Parkı', 'Horma & Ilıca Yakını']
    },
    {
      id: 'ihlara-vadisi',
      name: 'Ihlara Vadisi',
      category: 'kanyon-vadi',
      provinceKey: '04_IcAnadolu/Aksaray',
      district: 'Güzelyurt · Melendiz Çayı',
      metric: 'Uzunluk: 14 km · Derinlik: 120 m',
      season: 'İlkbahar & Sonbahar',
      featureType: 'Volkanik Tüf Kanyonu',
      summary:
        'Hasan Dağı’nın püskürttüğü volkanik tüflerin Melendiz Çayı tarafından milyonlarca yılda oyulmasıyla oluşan 14 km’lik yemyeşil vadi; su sesi, kavak gölgeleri ve kayalara oyulmuş yüzlerce tarihî kilise ile tabiat ve maneviyatı buluşturur.',
      tefekkurNote:
        'Bozkırın ortasında gizlenen bu serin vadi, zahirî kuraklığın altında her zaman bir rahmet pınarı saklandığını hatırlatır.',
      highlights: ['Melendiz Çayı', 'Kaya Kiliseleri', 'Belisırma & Selime']
    },
    {
      id: 'karanlik-kanyon',
      name: 'Karanlık Kanyon',
      category: 'kanyon-vadi',
      provinceKey: '06_DoguAnadolu/Erzincan',
      district: 'Kemaliye (Eğin) · Karasu',
      metric: 'Uzunluk: 25 km · Duvar: ~500 m',
      season: 'İlkbahar – Sonbahar',
      featureType: 'Fırat / Karasu Boğazı',
      summary:
        'Munzur Dağları ile Karasu Nehri’nin çarpıştığı noktada gökyüzünü ince bir şeride indiren Karanlık Kanyon, Kemaliye halkının 132 yılda el aletleriyle kayaya oyduğu 38 tünelli Taş Yolu ile insan azmi ve tabiat heybetinin destanıdır.',
      tefekkurNote:
        'Taş Yolu’nun tünelleri, sarp geçitlerin sabır ve dayanışmayla nasıl aşılacağının canlı vesikasıdır.',
      highlights: ['Taş Yolu Tünelleri', 'Karasu Tekne Turu', 'Kemaliye Taş Evleri']
    },
    {
      id: 'ulubey-kanyonu',
      name: 'Ulubey Kanyonu',
      category: 'kanyon-vadi',
      provinceKey: '02_Ege/Usak',
      district: 'Ulubey · Banaz Çayı',
      metric: 'Uzunluk: ~45 km · Derinlik: 170 m',
      season: 'Nisan – Kasım',
      featureType: 'Dünyanın 2. Uzun Kanyon Sistemi',
      summary:
        'Ulubey ve Banaz çaylarının Ege platosunu dantel gibi oymasıyla oluşan kanyon ağı, toplam uzunluğuyla Grand Canyon’dan sonra dünyanın en uzun ikinci kanyon sistemi olarak bilinir; cam seyir terası ve Blaundos Antik Kenti ile bütünleşir.',
      tefekkurNote:
        'Geniş ufuklu Ege düzlüklerinin altında saklanan bu yarık, yeryüzünün gizli derinliklerine açılan bir penceredir.',
      highlights: ['Cam Seyir Terası', 'Blaundos Antik Kenti', 'Clandras Köprüsü']
    },
    {
      id: 'saklikent-kanyonu',
      name: 'Saklıkent Kanyonu',
      category: 'kanyon-vadi',
      provinceKey: '02_Ege/Mugla',
      relatedKeys: ['03_Akdeniz/Antalya'],
      district: 'Seydikemer (Muğla–Antalya Sınırı)',
      metric: 'Uzunluk: 18 km · Yükseklik: 300 m',
      season: 'Mayıs – Ekim',
      featureType: 'Akarsu Karst Kanyonu',
      summary:
        'Eşen Çayı’nın kireçtaşı dağlarını yararak açtığı 18 kilometrelik serin boğaz, yaz sıcağında dahi buz gibi akan kaynak suları ve güneş ışığının zor ulaştığı dar kaya koridorlarıyla Akdeniz–Ege sınırının en etkileyici doğa yürüyüşü alanıdır.',
      tefekkurNote:
        'Temmuz sıcağında kayaların içinden fışkıran buz gibi su, tabiatın ölçülü ve cömert dengesini gösterir.',
      highlights: ['Buz Gibi Kaynak Suları', 'Ahşap Asma İskele', 'Eşen Çayı Vadisi']
    },
    {
      id: 'sahinkaya-kanyonu',
      name: 'Şahinkaya Kanyonu',
      category: 'kanyon-vadi',
      provinceKey: '05_Karadeniz/Samsun',
      district: 'Vezirköprü · Kızılırmak',
      metric: 'Uzunluk: 1,5 km · Duvar: 324 m',
      season: 'Nisan – Kasım',
      featureType: 'Turkuaz Baraj & Kalker Boğazı',
      summary:
        'Türkiye’nin en uzun nehri Kızılırmak’ın Altınkaya Baraj Gölü üzerinde oluşturduğu en dar ve en derin geçit olan Şahinkaya Kanyonu, zümrüt-turkuaz suları kucaklayan dik kalker duvarlarıyla sessiz tekne süzülüşleri sunar.',
      tefekkurNote:
        'Kızılırmak’ın deli akışını durgun bir aynaya çeviren bu boğaz, hareket ile sükûnetin aynı suda nasıl birleştiğini anlatır.',
      highlights: ['Altınkaya Baraj Gölü', '324 m Kalker Uçurum', 'Tekne & Kano Rotası']
    },
    {
      id: 'kelebekler-vadisi',
      name: 'Kelebekler Vadisi',
      category: 'kanyon-vadi',
      provinceKey: '02_Ege/Mugla',
      district: 'Fethiye · Faralya (Babadağ)',
      metric: 'Duvar Yüksekliği: 350 m',
      season: 'Mayıs – Ekim',
      featureType: '1. Derece Doğal SİT Vadisi',
      summary:
        'Babadağ’ın 350 metreyi bulan sarp kayalıklarıyla dış dünyadan yalıtılmış bu el değmemiş koy, adını bahar-yaz aylarında vadiyi süsleyen 80’den fazla kelebek türünden (özellikle Kaplan Kelebeği) ve şelalelerinden alır.',
      tefekkurNote:
        'Karayolu inmeyen bu kuytu vadi, insanın elini çektiği yerde tabiatın nasıl yeniden nefes aldığının örneğidir.',
      highlights: ['Kaplan Kelebeği Habitatı', 'Ölüdeniz Tekne Erişimi', 'Faralya Seyir Noktası']
    },

    // 2. 🌊 Şelaleler & Krater Gölleri (8)
    {
      id: 'tortum-selalesi',
      name: 'Tortum Şelalesi',
      category: 'selale-gol',
      provinceKey: '06_DoguAnadolu/Erzurum',
      district: 'Uzundere · Tortum Çayı',
      metric: 'Yükseklik: 48 m · Genişlik: 21 m',
      season: 'İlkbahar & Yaz',
      featureType: 'Heyelan Setti Çağlayanı',
      summary:
        '18. yüzyılda Kemerlidağ’dan kopan dev bir heyelanın Tortum Çayı’nı tıkamasıyla oluşan Tortum Gölü’nün döküldüğü bu görkemli şelale, 48 metreden gürleyerek düşerken güneşle buluştuğunda seyir balkonlarında gökkuşağı kurar.',
      tefekkurNote:
        'Bir heyelanın ardından doğan göl ve şelale, coğrafyada bile musibetlerin yeni güzelliklere kapı açabileceğini fısıldar.',
      highlights: ['48 m Serbest Düşüş', 'Gökkuşağı Seyir Balkonu', 'Tortum Gölü & Cittaslow Uzundere']
    },
    {
      id: 'muradiye-selalesi',
      name: 'Muradiye Şelalesi',
      category: 'selale-gol',
      provinceKey: '06_DoguAnadolu/Van',
      district: 'Muradiye · Bendimahi Çayı',
      metric: 'Yükseklik: ~18 m · Rakım: 1.850 m',
      season: '4 Mevsim (Kışın Buz Sarkıtları)',
      featureType: 'Volkanik Bazalt Çağlayanı',
      summary:
        'Tendürek Dağı’ndan beslenen Bendimahi Çayı’nın bazalt kayalardan dökülmesiyle oluşan Muradiye Şelalesi, yazın zümrüt yeşili köpükleriyle, sert Van kışında ise dev kristal buz heykellerine dönüşen görünümüyle büyüler.',
      tefekkurNote:
        'Yazın coşkun bir nağme, kışın donmuş bir billur sütun olan bu su, her mevsimin kendi zikri olduğunu gösterir.',
      highlights: ['Asma Yaya Köprüsü', 'Kış Buz Sarkıtları', 'Bendimahi Havzası']
    },
    {
      id: 'girlevik-selalesi',
      name: 'Girlevik Şelalesi',
      category: 'selale-gol',
      provinceKey: '06_DoguAnadolu/Erzincan',
      district: 'Çağlayan Beldesi',
      metric: 'Yükseklik: 30–40 m (3 Kademe)',
      season: '4 Mevsim',
      featureType: 'Traverten Basamaklı Çağlayan',
      summary:
        'Munzur eteklerindeki dokuz farklı gözelerden doğan soğuk suların birleşerek üç basamak hâlinde süzüldüğü Girlevik Şelalesi, yemyeşil ceviz ve söğüt ağaçları arasında Erzincan’ın en ferah nefes alma durağıdır.',
      tefekkurNote:
        'Dokuz ayrı pınarın birleşip tek bir çağlayana dönüşmesi, küçük iyiliklerin bir araya geldiğindeki kudretini hatırlatır.',
      highlights: ['9 Ayrı Kaynak Gözesi', '3 Katlı Traverten Düşüş', 'Kışın Buz Tırmanışı']
    },
    {
      id: 'mencuna-selalesi',
      name: 'Mençuna Şelalesi',
      category: 'selale-gol',
      provinceKey: '05_Karadeniz/Artvin',
      district: 'Arhavi · Kamilet Vadisi',
      metric: 'Yükseklik: 92 m (2 Kademe)',
      season: 'Mayıs – Ekim',
      featureType: 'Yağmur Ormanı Şelalesi',
      summary:
        'Doğu Karadeniz’in el değmemiş Kamilet Vadisi’nde, tarihî Çifte Köprü’den orman içi patikayla ulaşılan Mençuna; yemyeşil kestane ve ladin ormanlarının içinden 92 metrelik iki basamakla dökülen mistik bir çağlayandır.',
      tefekkurNote:
        'Patikayı yürürken duyulan su uğultusu, varıştan önce başlayan bir arınma çağrısıdır.',
      highlights: ['Kamilet Vadisi', 'Tarihî Çifte Köprü', '92 m Çift Kademe']
    },
    {
      id: 'kapuzbasi-selaleleri',
      name: 'Kapuzbaşı Şelaleleri',
      category: 'selale-gol',
      provinceKey: '04_IcAnadolu/Kayseri',
      district: 'Yahyalı · Aladağlar Millî Parkı',
      metric: 'Yükseklik: 30–70 m (7 Şelale)',
      season: 'Nisan – Ekim',
      featureType: 'Kayadan Fışkıran Takım Şelale',
      summary:
        'Aladağlar’ın kar ve buzul sularını yeraltı kanallarıyla taşıyıp sarp kaya yüzünün tam ortasından doğrudan fışkırtan 7 ayrı şelaleden oluşan Kapuzbaşı, 70 metreye varan debisiyle dünyanın en yüksek takım şelaleleri arasındadır.',
      tefekkurNote:
        'Sert bir kaya bağrından gürül gürül fışkıran pınarlar, en katı görünen engellerin ardında bile hayat saklı olduğunu anlatır.',
      highlights: ['7 Ayrı Dev Çağlayan', 'Aladağlar Kar Suları', 'Elif & Güney Şelaleleri']
    },
    {
      id: 'salda-golu',
      name: 'Salda Gölü',
      category: 'selale-gol',
      provinceKey: '03_Akdeniz/Burdur',
      district: 'Yeşilova · Göller Yöresi',
      metric: 'Derinlik: 184 m · Rakım: 1.193 m',
      season: 'Mayıs – Ekim',
      featureType: 'Tektonik / Karstik Krater Gölü',
      summary:
        'Türkiye’nin en derin tatlı su göllerinden biri olan Salda; stromatolit oluşumlarıyla beyazlaşan hidromanyezit kumsalı ve cam gibi turkuaz rengiyle Mars’taki Jezero Krateri’nin yeryüzündeki en yakın jeolojik ikizi olarak bilim dünyasının odağındadır.',
      tefekkurNote:
        'Yeryüzünden başka bir gezegenin kadim su hafızasına bakan Salda, “küçük bir gölde büyük kâinat” sırrını taşır.',
      highlights: ['Hidromanyezit Beyaz Kum', '184 m Derinlik', 'NASA Jezero Analoğu']
    },
    {
      id: 'nemrut-krater-golu',
      name: 'Nemrut Krater Gölü',
      category: 'selale-gol',
      provinceKey: '06_DoguAnadolu/Bitlis',
      district: 'Tatvan · Ahlat · Güroymak',
      metric: 'Rakım: 2.250 m · Çap: 8,3 km',
      season: 'Haziran – Eylül',
      featureType: 'Dünyanın 2. Büyük Kalderası',
      summary:
        'Van Gölü’nün batı kıyısında yükselen Nemrut Kalderası içinde yer alan bu doğa harikası; aynı çanakta hem masmavi soğuk krater gölünü, hem yeşil renkli sıcak su gölünü hem de buhar bacalarını bir arada barındırır.',
      tefekkurNote:
        'Bir zamanlar ateş püskürten yanardağın ağzında bugün duru bir gölün dinginleşmesi, öfkenin hikmete dönüşümünü simgeler.',
      highlights: ['Soğuk & Sıcak Göller', 'Buhar Bacaları', 'Avrupa Seçkin Destinasyonu']
    },
    {
      id: 'cildir-golu',
      name: 'Çıldır Gölü',
      category: 'selale-gol',
      provinceKey: '06_DoguAnadolu/Ardahan',
      relatedKeys: ['06_DoguAnadolu/Kars'],
      district: 'Çıldır (Ardahan–Kars Sınırı)',
      metric: 'Rakım: 1.959 m · Alan: 123 km²',
      season: 'Kış (Donmuş Göl) & Yaz',
      featureType: 'Lav Setti & Tektonik Göl',
      summary:
        'Doğu Anadolu’nun en büyük tatlı su gölü olan Çıldır, kış aylarında kalınlığı yarım metreyi aşan kristal buz tabakasıyla kaplanarak atlı kızakların süzüldüğü ve buz kırarak sarı balık tutulan masalsı bir beyaz ovaya dönüşür.',
      tefekkurNote:
        'Buzun altında sessizce akıp yaşayan hayat, kışın en soğuk günlerinde bile umudun sönmediğini öğretir.',
      highlights: ['Donmuş Göl Kızakları', 'Buz Altı Sarı Balık', 'Akçakale Adası']
    },

    // 3. 🕳️ Mağaralar & Jeoparklar (6)
    {
      id: 'ballica-magarasi',
      name: 'Ballıca Mağarası',
      category: 'magara-jeopark',
      provinceKey: '05_Karadeniz/Tokat',
      district: 'Pazar · Ballıca Köyü',
      metric: 'Yaş: ~3,4 Milyon Yıl · 8 Salon',
      season: '4 Mevsim',
      featureType: 'UNESCO Geçici Miras · Soğan Sarkıtlar',
      summary:
        'Dünyada yalnızca birkaç mağarada görülen “soğan sarkıtları”, dev sütunları ve toz-polen barındırmayan yüksek oksijenli havasıyla astım ve nefes hastalarına şifa sunan Ballıca, kristalize kireçtaşının yeraltı katedralidir.',
      tefekkurNote:
        'Yerin karanlığında yüzyıllarca sabırla örülen sarkıtlar, gözden uzak yapılan emeğin nasıl mücevhere dönüştüğünü gösterir.',
      highlights: ['Nadir Soğan Sarkıtlar', 'Astım Dostu Mikroiklim', '5 Katlı 8 Büyük Salon']
    },
    {
      id: 'karaca-magarasi',
      name: 'Karaca Mağarası',
      category: 'magara-jeopark',
      provinceKey: '05_Karadeniz/Gumushane',
      district: 'Torul · Cebeli Köyü',
      metric: 'Rakım: 1.550 m · Uzunluk: 105 m',
      season: 'Nisan – Kasım',
      featureType: 'Fosil Damlataş Mağarası',
      summary:
        'Zigana dağ silsilesinin 1.550 metre rakımında saklanan Karaca Mağarası; mağara gülleri, fil kulakları, org desenli duvarlar ve traverten havuzlarıyla Anadolu’nun en zengin damlataş formasyonlarını dört büyük salonda toplar.',
      tefekkurNote:
        'Dağın içine saklanmış bu renkli yeraltı sarayı, hakiki güzelliğin dış gösterişte değil derindeki cevherde olduğunu fısıldar.',
      highlights: ['Mağara Gülleri & İnciler', '1.550 m Yüksek İrtifa', 'Torul Cam Teras Yakını']
    },
    {
      id: 'insuyu-magarasi',
      name: 'İnsuyu Mağarası',
      category: 'magara-jeopark',
      provinceKey: '03_Akdeniz/Burdur',
      district: 'Burdur–Antalya Yolu (Çatağıl)',
      metric: 'Uzunluk: 597 m · Rakım: 900 m',
      season: '4 Mevsim',
      featureType: 'Türkiye’nin İlk Turistik Mağarası',
      summary:
        '1965 yılında Türkiye’de turizme açılan ilk mağara unvanını taşıyan İnsuyu; kireçtaşlarının erimesiyle oluşan yatay galerileri, binlerce yıllık sarkıt-dikitleri ve “Büyük Göl” ile “Dilek Gölü” gibi yeraltı su aynalarıyla büyüleyicidir.',
      tefekkurNote:
        'Kaya dehlizlerinde sessizce biriken duru su, zihnin karmaşasından sıyrılan tefekkür ehlinin aynasıdır.',
      highlights: ['1965 İlk Turistik Mağara', 'Yeraltı Gölleri', 'Dilek & Büyük Göl Galerisi']
    },
    {
      id: 'kaklik-magarasi',
      name: 'Kaklık Mağarası',
      category: 'magara-jeopark',
      provinceKey: '02_Ege/Denizli',
      district: 'Honaz · Kaklık',
      metric: 'Termal Su: ~30 °C · Obruk Mağara',
      season: '4 Mevsim',
      featureType: 'Yeraltı Traverten & Kükürtlü Mağara',
      summary:
        'Tavanının çökmesiyle gün ışığına kavuşan bu eşsiz obruk mağara, içerisindeki berrak kükürtlü termal suyun çökelttiği bembeyaz yeraltı traverten basamakları ve yosunlu duvarları sebebiyle “Küçük Pamukkale” olarak anılır.',
      tefekkurNote:
        'Tavanı çöktüğü hâlde içine güneş dolan Kaklık, kırılmaların bazen ışığa açılan bir pencere olduğunu hatırlatır.',
      highlights: ['Yeraltı Travertenleri', 'Gün Işıklı Obruk', 'Kükürtlü Termal Havuz']
    },
    {
      id: 'pamukkale-travertenleri',
      name: 'Pamukkale Travertenleri',
      category: 'magara-jeopark',
      provinceKey: '02_Ege/Denizli',
      district: 'Pamukkale · Hierapolis',
      metric: 'Su Sıcaklığı: 35–36 °C · UNESCO 1988',
      season: '4 Mevsim',
      featureType: 'Kalsiyum Karbonat Teras Jeoparkı',
      summary:
        'Yerin altından 35–36 °C sıcaklıkta çıkan kalsiyum bikarbonatlı termal suların yamaç boyunca karbondioksit salarak çökelttiği pamuk beyazı basamaklar, hemen tepesindeki Hierapolis antik şifa şehriyle 2.500 yıllık doğa-tarih ittifakıdır.',
      tefekkurNote:
        'Akışkan suyun zamanla bembeyaz mermere dönüşmesi, geçici anların nasıl kalıcı eserler bıraktığının sembolüdür.',
      highlights: ['UNESCO Karma Miras', 'Kleopatra Antik Havuzu', 'Hierapolis Antik Tiyatrosu']
    },
    {
      id: 'kapadokya-peribacalari',
      name: 'Kapadokya Peribacaları',
      category: 'magara-jeopark',
      provinceKey: '04_IcAnadolu/Nevsehir',
      district: 'Göreme · Ürgüp · Paşabağları',
      metric: 'Volkanik Tüf & Bazalt · UNESCO 1985',
      season: '4 Mevsim',
      featureType: 'Volkanik Jeopark & Kaya Vadileri',
      summary:
        'Erciyes, Hasan ve Güllüdağ yanardağlarının milyonlarca yıl önce serdiği tüf katmanlarını sel sularının ve rüzgârın yontmasıyla doğan peribacaları, sert bazalt şapkalarını taşıyan ince gövdeleri ve yeraltı şehirleriyle yeryüzünün açık hava jeoloji müzesidir.',
      tefekkurNote:
        'Rüzgârın yumuşak tüfü oyup sert başlığı yerinde bırakması, hayat rüzgârlarının insanı nasıl özüne yonttuğunu düşündürür.',
      highlights: ['Paşabağları & Aşk Vadisi', 'Derinkuyu Yeraltı Şehri', 'Gündoğumu Balon Ufku']
    },

    // 4. ♨️ Şifalı Termal Kaplıcalar & İçmeler (7)
    {
      id: 'gazligol-hudai',
      name: 'Gazlıgöl & Hüdai Kaplıcaları',
      category: 'termal-icme',
      provinceKey: '02_Ege/Afyonkarahisar',
      district: 'İhsaniye (Gazlıgöl) & Sandıklı (Hüdai)',
      metric: 'Sıcaklık: 64–70 °C · Termal Başkent',
      season: '4 Mevsim',
      featureType: 'Sodyum Bikarbonat & Şifalı Çamur',
      summary:
        'Friglerden Selçuklulara uzanan şifa geleneğiyle Türkiye’nin termal başkenti sayılan Afyonkarahisar; Gazlıgöl’ün sodyum bikarbonatlı ve karbondioksitli içme-banyo suları ile Sandıklı Hüdai’nin 2.000 yıllık şifalı çamur banyolarını bir arada sunar.',
      tefekkurNote:
        'Toprak ile sıcak suyun karıştığı Hüdai çamuru, insanın aslî mayası olan toprağa dönünce nasıl şifa bulduğunu hatırlatır.',
      highlights: ['Hüdai Şifalı Çamur Banyosu', 'Gazlıgöl İçme Suyu', 'Frig Vadisi Yakını']
    },
    {
      id: 'oylat-cekirge',
      name: 'Oylat & Çekirge Kaplıcaları',
      category: 'termal-icme',
      provinceKey: '01_Marmara/Bursa',
      district: 'İnegöl (Oylat) & Osmangazi (Çekirge)',
      metric: 'Sıcaklık: 40–84 °C · Osmanlı Şifahânesi',
      season: '4 Mevsim',
      featureType: 'Tarihî Osmanlı Hamamları & Orman Vadisi',
      summary:
        'Evliya Çelebi’nin övdüğü Çekirge’deki Bizans-Osmanlı yadigârı Eski Kaplıca (Armutlu) ile Uludağ’ın güney yamacında şelale ve mağarayla kucaklaşan Oylat Kaplıcaları, Bursa’nın asırlık “su ve şifa” medeniyetini yaşatır.',
      tefekkurNote:
        'Osmanlı’nın kubbeli taş hamamlarından yükselen buhar, mimarinin suyu nasıl bir huzur mekânına dönüştürdüğünü gösterir.',
      highlights: ['Eski Kaplıca (1385)', 'Oylat Mağarası & Şelalesi', 'Uludağ Orman Havası']
    },
    {
      id: 'yalova-termal',
      name: 'Yalova Termal Kaplıcaları',
      category: 'termal-icme',
      provinceKey: '01_Marmara/Yalova',
      district: 'Termal · Gökçedere Vadisi',
      metric: 'Sıcaklık: 57–66 °C · Sülfat & Florür',
      season: '4 Mevsim',
      featureType: 'Tarihî Botanik Park & Şifa Suları',
      summary:
        'Roma, Bizans ve Osmanlı dönemlerinde “Pythia Therma” adıyla bilinen, Atatürk’ün “Burası geleceğin su şehri olacaktır” vizyonuyla ihya edilen Yalova Termal; asırlık ağaçlar içindeki Kurşunlu Banyo, Valide Banyo ve Sudüşen Şelalesi ile meşhurdur.',
      tefekkurNote:
        'Asırlık çınarların gölgesindeki açık havuz, medeniyet mirasının doğayı bozmadan nasıl yaşatılacağının örneğidir.',
      highlights: ['Kurşunlu & Valide Banyo', 'Tarihî Termal Arboretumu', 'Sudüşen Şelalesi Yakını']
    },
    {
      id: 'balikli-cermik',
      name: 'Kangal Balıklı Çermik',
      category: 'termal-icme',
      provinceKey: '04_IcAnadolu/Sivas',
      district: 'Kangal · Kavak Köyü',
      metric: 'Sıcaklık: 36–37 °C · Selenyum & Doktor Balık',
      season: 'Mayıs – Ekim (Yıl Boyu Açık)',
      featureType: 'Dünyaca Ünlü Biyolojik Termal Şifa',
      summary:
        '36–37 °C sabit sıcaklıkta çıkan bikarbonatlı ve selenyum zengini sularda yaşayan zararsız “Garra rufa” (doktor balıklar) ile dünya çapında şöhret kazanan Kangal Balıklı Çermik, cilt rahatsızlıklarında doğanın sunduğu eşsiz bir iş birliğidir.',
      tefekkurNote:
        'Sıcak su, mineral ve küçük balıkların uyumla aynı şifaya hizmet etmesi, kâinattaki yardımlaşma kanununun zarif bir delilidir.',
      highlights: ['Garra Rufa Doktor Balıklar', 'Selenyum Zengini Kaynak', '36,5 °C Vücut Isısı Dengesi']
    },
    {
      id: 'yoncali-kaplicalari',
      name: 'Yoncalı Kaplıcaları',
      category: 'termal-icme',
      provinceKey: '02_Ege/Kutahya',
      district: 'Yoncalı · Tavşanlı Yolu',
      metric: 'Sıcaklık: 42 °C · Selçuklu Mirası (1233)',
      season: '4 Mevsim',
      featureType: 'Selçuklu Hamamı & Şifalı Çamur',
      summary:
        'Anadolu Selçuklu Sultanı II. Alâeddin Keykubad’ın kızı Gülümser Hatun’un şifa bulduğu rivayetiyle 1233 yılında inşa edilen tarihî hamam ve cami ile taçlanan Yoncalı, 42 °C bikarbonatlı-sülfatlı suları ve peloid çamuruyla 8 asırlık şifa ocağıdır.',
      tefekkurNote:
        'Sekiz yüz yıldır aynı kaynaktan şifa dağıtan bu ocak, iyilik ve vakıf kültürünün zamanı nasıl aştığını kanıtlar.',
      highlights: ['1233 Gülümser Hatun Hamamı', 'Peloid Termal Çamur', 'Kütahya Çini Geleneği']
    },
    {
      id: 'karahayit-kizilsu',
      name: 'Karahayıt Kızılsu Termal',
      category: 'termal-icme',
      provinceKey: '02_Ege/Denizli',
      district: 'Karahayıt · Pamukkale Kuzeyi',
      metric: 'Sıcaklık: 55–60 °C · Demir Oksitli Kızıl Su',
      season: '4 Mevsim',
      featureType: 'Kırmızı Traverten & Şifalı İçme',
      summary:
        'Pamukkale’nin bembeyaz travertenlerinden yalnızca birkaç kilometre ötede yer alan Karahayıt, yüksek demir oksit ve magnezyum içeren 55–60 °C sularıyla kayaları kızıl, turuncu ve yeşilin tonlarına boyayan sıra dışı bir şifa pınarıdır.',
      tefekkurNote:
        'Aynı coğrafyada bir yanda kar beyazı Pamukkale, diğer yanda yakut kızılı Karahayıt; tabiatın renk paletindeki sınırsızlığa işarettir.',
      highlights: ['Kızıl Traverten Oluşumları', 'Yüksek Demir & Magnezyum', 'Pamukkale Komşusu']
    },
    {
      id: 'kizilcahamam-kaplicalari',
      name: 'Kızılcahamam Kaplıcaları & İçmeleri',
      category: 'termal-icme',
      provinceKey: '04_IcAnadolu/Ankara',
      district: 'Kızılcahamam · Soğuksu Millî Parkı',
      metric: 'Sıcaklık: 44–86 °C · Volkanik Maden Suyu',
      season: '4 Mevsim',
      featureType: 'Jeotermal & Doğal Maden Suyu',
      summary:
        'Köroğlu Dağları’nın çam ormanlarıyla kaplı Soğuksu Millî Parkı kıyısında yer alan Kızılcahamam; sodyum bikarbonatlı, karbondioksitli jeotermal kaplıcaları ve Türkiye’nin en meşhur doğal maden suyu içme kaynaklarıyla Ankara’nın şifa vahasdır.',
      tefekkurNote:
        'Çam ormanlarının serin nefesiyle yeraltının sıcak şifasını aynı vadide buluşturan denge, bedene ve ruha sükûnet verir.',
      highlights: ['Soğuksu Millî Parkı', 'Şifalı Maden Suyu İçmesi', 'Büyük & Küçük Kaplıca']
    }
  ];

  // Complementary Southeast Anatolia natural/thermal highlights pulled when 07_GuneydoguAnadolu is filtered
  const SOUTHEAST_COMPLEMENTARY = [
    {
      provinceKey: '07_GuneydoguAnadolu/Sanliurfa',
      title: 'Balıklıgöl Kutsal Havzası & Halfeti Fırat Kanyonu',
      badge: '🌊 Su & Kanyon',
      note: 'Halil-ür Rahman pınarlarının bereketi ve Birecik–Halfeti’de Fırat’ın turkuaz kanyon kıvrımları.'
    },
    {
      provinceKey: '07_GuneydoguAnadolu/Diyarbakir',
      title: 'Hevsel Bahçeleri (UNESCO) & Dicle Vadisi',
      badge: '🌿 Vadi & Ekosistem',
      note: '8.000 yıllık tarım ve su ekolojisiyle Dicle Nehri kıyısında nefes alan bereketli taşkın ovası.'
    },
    {
      provinceKey: '07_GuneydoguAnadolu/Siirt',
      title: 'Botan Vadisi Millî Parkı & Billoris Kaplıcası',
      badge: '🏞️ Kanyon & Termal',
      note: 'Botan Çayı’nın açtığı derin kanyon duvarları (Rasıl Hacar) ve 34–38 °C kükürtlü şifa kaynağı.'
    },
    {
      provinceKey: '07_GuneydoguAnadolu/Gaziantep',
      title: 'Rumkale & Fırat Boğazı',
      badge: '🌊 Nehir Boğazı',
      note: 'Merzimen Çayı ile Fırat’ın buluştuğu dik yarımada üzerinde cam seyir teraslı nehir kanyonu.'
    },
    {
      provinceKey: '07_GuneydoguAnadolu/Sirnak',
      title: 'Kasrik Boğazı & Cudi Dağı Etekleri',
      badge: '🏔️ Dağ & Boğaz',
      note: 'Mezopotamya ile Doğu Anadolu arasında doğal geçit oluşturan görkemli dağ ve kanyon silsilesi.'
    }
  ];

  // ---------------------------------------------------------------------------
  // Helpers (Escaping, Turkish Normalization, Safe Markdown)
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

  function renderSafeMarkdown(md, esc) {
    if (typeof window !== 'undefined' && window.SEYYAH_AI && typeof window.SEYYAH_AI.renderMarkdown === 'function') {
      return window.SEYYAH_AI.renderMarkdown(md, esc);
    }
    const safeEsc = typeof esc === 'function' ? esc : fallbackEscapeHtml;
    const lines = String(md || '').replace(/\r\n?/g, '\n').split('\n');
    const html = [];
    let listType = null;

    function inlineFmt(text) {
      return safeEsc(text)
        .replace(/`([^`]+?)`/g, '<code>$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^\w*])\*([^\s*](?:[^*]*?[^\s*])?)\*(?=[^\w*]|$)/g, '$1<em>$2</em>');
    }

    function closeList() {
      if (listType) {
        html.push(listType === 'ol' ? '</ol>' : '</ul>');
        listType = null;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        closeList();
        continue;
      }
      const h = line.match(/^(#{1,4})\s+(.+)$/);
      if (h) {
        closeList();
        const lvl = h[1].length;
        html.push('<h' + lvl + ' class="seyyah-md-h' + lvl + '">' + inlineFmt(h[2]) + '</h' + lvl + '>');
        continue;
      }
      const q = line.match(/^>\s?(.*)$/);
      if (q) {
        closeList();
        html.push('<blockquote class="seyyah-md-quote">' + inlineFmt(q[1]) + '</blockquote>');
        continue;
      }
      const ul = line.match(/^[-*•]\s+(.+)$/);
      if (ul) {
        if (listType !== 'ul') {
          closeList();
          listType = 'ul';
          html.push('<ul class="seyyah-md-list">');
        }
        html.push('<li>' + inlineFmt(ul[1]) + '</li>');
        continue;
      }
      const ol = line.match(/^\d+\.\s+(.+)$/);
      if (ol) {
        if (listType !== 'ol') {
          closeList();
          listType = 'ol';
          html.push('<ol class="seyyah-md-list seyyah-md-ol">');
        }
        html.push('<li>' + inlineFmt(ol[1]) + '</li>');
        continue;
      }
      closeList();
      html.push('<p class="seyyah-md-p">' + inlineFmt(line) + '</p>');
    }
    closeList();
    return html.join('\n');
  }

  // ---------------------------------------------------------------------------
  // Scoped Styles (Dark & body.light-theme compatible)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tnw-studio {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-bottom: 36px;
        color: var(--text-primary, #f8fafc);
      }

      /* Hero Header */
      .tnw-hero {
        position: relative;
        overflow: hidden;
        padding: 26px 28px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 86% 16%, rgba(16, 185, 129, 0.22), transparent 45%),
          radial-gradient(circle at 14% 86%, rgba(245, 158, 11, 0.2), transparent 46%),
          radial-gradient(circle at 52% 50%, rgba(56, 189, 248, 0.12), transparent 55%),
          linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(17, 36, 46, 0.9));
        border: 1px solid rgba(16, 185, 129, 0.3);
        box-shadow: var(--shadow-subtle, 0 12px 28px -8px rgba(0, 0, 0, 0.45));
      }

      .tnw-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent-emerald, #10b981);
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.34);
        padding: 5px 12px;
        border-radius: 999px;
        margin-bottom: 10px;
      }

      .tnw-hero-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.3rem, 2.5vw, 1.92rem);
        font-weight: 800;
        line-height: 1.22;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #ecfeff 0%, #34d399 42%, #fbbf24 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .tnw-hero-sub {
        max-width: 820px;
        font-size: 0.92rem;
        color: var(--text-secondary, #cbd5e1);
        line-height: 1.62;
      }

      .tnw-kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(130px, 1fr));
        gap: 10px;
        margin-top: 18px;
      }

      .tnw-kpi-card {
        background: rgba(15, 23, 42, 0.56);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 13px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .tnw-kpi-val {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.28rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .tnw-kpi-lbl {
        font-size: 0.74rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* Philosophical Section: Âfâkî Tefekkür */
      .tnw-tefekkur-panel {
        border-radius: var(--radius-lg, 18px);
        background:
          radial-gradient(circle at 95% 15%, rgba(245, 158, 11, 0.12), transparent 42%),
          var(--bg-card, rgba(15, 23, 42, 0.74));
        border: 1px solid rgba(245, 158, 11, 0.26);
        padding: 20px 22px;
        backdrop-filter: blur(12px);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .tnw-tefekkur-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .tnw-tefekkur-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.08rem;
        font-weight: 800;
        color: var(--accent-gold, #f59e0b);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .tnw-tefekkur-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .tnw-pillar-btn {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.5);
        color: var(--text-secondary, #94a3b8);
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 0.77rem;
        font-weight: 600;
        transition: all 0.18s ease;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .tnw-pillar-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(245, 158, 11, 0.45);
      }

      .tnw-pillar-btn.active {
        background: rgba(245, 158, 11, 0.18);
        border-color: var(--accent-gold, #f59e0b);
        color: var(--text-primary, #f8fafc);
      }

      .tnw-tefekkur-body {
        display: grid;
        grid-template-columns: 1fr 1.35fr;
        gap: 16px;
        align-items: stretch;
      }

      .tnw-tefekkur-quote-box {
        background: rgba(15, 23, 42, 0.55);
        border-left: 3px solid var(--accent-gold, #f59e0b);
        border-radius: 0 12px 12px 0;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 8px;
      }

      .tnw-tefekkur-quote-text {
        font-size: 0.92rem;
        font-style: italic;
        line-height: 1.6;
        color: var(--text-primary, #f8fafc);
      }

      .tnw-tefekkur-source {
        font-size: 0.74rem;
        font-weight: 700;
        color: var(--accent-gold, #f59e0b);
      }

      .tnw-tefekkur-essay {
        font-size: 0.88rem;
        line-height: 1.66;
        color: var(--text-secondary, #cbd5e1);
        background: rgba(15, 23, 42, 0.35);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        border-radius: 12px;
        padding: 14px 16px;
      }

      /* Gemini AI Route Studio */
      .tnw-ai-studio {
        border-radius: var(--radius-lg, 18px);
        background:
          radial-gradient(circle at 12% 18%, rgba(56, 189, 248, 0.14), transparent 44%),
          radial-gradient(circle at 88% 85%, rgba(16, 185, 129, 0.14), transparent 46%),
          var(--bg-card, rgba(15, 23, 42, 0.8));
        border: 1px solid rgba(56, 189, 248, 0.3);
        padding: 20px 22px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .tnw-ai-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .tnw-ai-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.08rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .tnw-ai-subtitle {
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 2px;
      }

      .tnw-ai-controls {
        display: grid;
        grid-template-columns: repeat(3, minmax(170px, 1fr)) auto;
        gap: 10px;
        align-items: end;
      }

      .tnw-field-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .tnw-field-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted, #94a3b8);
      }

      .tnw-select {
        width: 100%;
        padding: 10px 12px;
        border-radius: 11px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.68);
        color: var(--text-primary, #f8fafc);
        font-size: 0.83rem;
        font-weight: 600;
        outline: none;
        cursor: pointer;
      }

      .tnw-select:focus {
        border-color: var(--accent-cyan, #38bdf8);
      }

      .tnw-ai-generate-btn {
        cursor: pointer;
        border: 1px solid rgba(16, 185, 129, 0.55);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(56, 189, 248, 0.25));
        color: var(--text-primary, #f8fafc);
        padding: 10px 18px;
        border-radius: 11px;
        font-size: 0.85rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        white-space: nowrap;
        transition: all 0.2s ease;
      }

      .tnw-ai-generate-btn:hover {
        border-color: var(--accent-emerald, #10b981);
        box-shadow: 0 8px 22px rgba(16, 185, 129, 0.24);
        transform: translateY(-1px);
      }

      .tnw-ai-generate-btn:disabled {
        opacity: 0.65;
        cursor: wait;
        transform: none;
      }

      .tnw-ai-output-wrap {
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.58);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .tnw-ai-output-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        padding-bottom: 10px;
      }

      .tnw-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 4px 11px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.15);
        color: var(--accent-emerald, #10b981);
        border: 1px solid rgba(16, 185, 129, 0.35);
      }

      .tnw-status-pill.offline {
        background: rgba(245, 158, 11, 0.15);
        color: var(--accent-gold, #f59e0b);
        border-color: rgba(245, 158, 11, 0.35);
      }

      .tnw-ai-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .tnw-mini-btn {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(30, 41, 59, 0.65);
        color: var(--text-primary, #f8fafc);
        padding: 5px 11px;
        border-radius: 8px;
        font-size: 0.76rem;
        font-weight: 600;
        transition: all 0.18s ease;
      }

      .tnw-mini-btn:hover {
        border-color: var(--accent-cyan, #38bdf8);
      }

      .tnw-ai-markdown {
        font-size: 0.9rem;
        line-height: 1.7;
        color: var(--text-secondary, #cbd5e1);
      }

      .tnw-ai-markdown .seyyah-md-h2,
      .tnw-ai-markdown .seyyah-md-h3 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        color: var(--accent-cyan, #38bdf8);
        margin: 12px 0 6px;
        font-size: 1.02rem;
      }

      .tnw-ai-markdown .seyyah-md-p {
        margin-bottom: 9px;
      }

      .tnw-ai-markdown .seyyah-md-quote {
        border-left: 3px solid var(--accent-gold, #f59e0b);
        padding: 8px 12px;
        margin: 8px 0;
        background: rgba(245, 158, 11, 0.08);
        border-radius: 0 8px 8px 0;
        color: var(--text-primary, #f8fafc);
      }

      .tnw-ai-markdown .seyyah-md-list {
        padding-left: 20px;
        margin: 6px 0 10px;
      }

      .tnw-ai-markdown .seyyah-md-list li {
        margin-bottom: 5px;
      }

      .tnw-route-jumps {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 7px;
        padding-top: 8px;
        border-top: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.12));
      }

      /* Filter Toolbar */
      .tnw-controls {
        background: var(--bg-card, rgba(15, 23, 42, 0.76));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: 16px;
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        backdrop-filter: blur(12px);
      }

      .tnw-search-row {
        display: grid;
        grid-template-columns: 1.6fr 1fr;
        gap: 12px;
        align-items: center;
      }

      .tnw-search-box {
        position: relative;
        display: flex;
        align-items: center;
      }

      .tnw-search-icon {
        position: absolute;
        left: 13px;
        font-size: 0.95rem;
        opacity: 0.75;
        pointer-events: none;
      }

      .tnw-search-input {
        width: 100%;
        padding: 10px 36px 10px 38px;
        border-radius: 11px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary, #f8fafc);
        font-size: 0.87rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .tnw-search-input:focus {
        border-color: var(--accent-emerald, #10b981);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.16);
      }

      .tnw-search-clear {
        position: absolute;
        right: 9px;
        border: none;
        background: transparent;
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        font-size: 0.9rem;
        padding: 2px 6px;
      }

      .tnw-chip-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 7px;
      }

      .tnw-chip-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted, #94a3b8);
        margin-right: 4px;
      }

      .tnw-chip {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.11));
        background: rgba(15, 23, 42, 0.48);
        color: var(--text-secondary, #94a3b8);
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.18s ease;
      }

      .tnw-chip:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(16, 185, 129, 0.45);
      }

      .tnw-chip.active-cat {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(56, 189, 248, 0.18));
        border-color: var(--accent-emerald, #10b981);
        color: var(--text-primary, #f8fafc);
      }

      .tnw-chip.active-region {
        background: rgba(56, 189, 248, 0.18);
        border-color: var(--accent-cyan, #38bdf8);
        color: var(--text-primary, #f8fafc);
      }

      .tnw-chip-count {
        font-size: 0.7rem;
        padding: 1px 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
      }

      .tnw-results-meta {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* Wonder Cards Grid */
      .tnw-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(335px, 1fr));
        gap: 18px;
      }

      .tnw-card {
        display: flex;
        flex-direction: column;
        border-radius: 18px;
        overflow: hidden;
        background: var(--bg-card, rgba(15, 23, 42, 0.8));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .tnw-card:hover {
        transform: translateY(-4px);
        border-color: rgba(16, 185, 129, 0.46);
        box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.55);
      }

      .tnw-card.is-visited {
        border-color: rgba(16, 185, 129, 0.35);
      }

      .tnw-card-media {
        position: relative;
        height: 175px;
        overflow: hidden;
        background: rgba(15, 23, 42, 0.9);
      }

      .tnw-card-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.45s ease;
        display: block;
      }

      .tnw-card:hover .tnw-card-img {
        transform: scale(1.05);
      }

      .tnw-card-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to bottom,
          rgba(2, 6, 23, 0.45) 0%,
          rgba(2, 6, 23, 0.12) 45%,
          rgba(2, 6, 23, 0.86) 100%
        );
      }

      .tnw-media-top {
        position: absolute;
        top: 11px;
        left: 11px;
        right: 11px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
        z-index: 2;
      }

      .tnw-cat-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid currentColor;
        backdrop-filter: blur(8px);
      }

      .tnw-visit-badge {
        font-size: 0.69rem;
        font-weight: 700;
        padding: 4px 9px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #e2e8f0;
      }

      .tnw-visit-badge.visited {
        background: rgba(16, 185, 129, 0.25);
        border-color: rgba(16, 185, 129, 0.55);
        color: #a7f3d0;
      }

      .tnw-media-bottom {
        position: absolute;
        bottom: 10px;
        left: 12px;
        right: 12px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 8px;
        z-index: 2;
      }

      .tnw-prov-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.78rem;
        font-weight: 700;
        color: #f8fafc;
      }

      .tnw-plate-chip {
        background: rgba(245, 158, 11, 0.92);
        color: #0f172a;
        font-weight: 800;
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 6px;
      }

      .tnw-region-pill {
        font-size: 0.7rem;
        font-weight: 600;
        color: #cbd5e1;
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.16);
        padding: 3px 8px;
        border-radius: 999px;
      }

      .tnw-card-body {
        padding: 16px 17px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex: 1;
        gap: 10px;
      }

      .tnw-card-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.12rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.25;
      }

      .tnw-card-district {
        font-size: 0.77rem;
        color: var(--accent-cyan, #38bdf8);
        font-weight: 600;
        margin-top: 2px;
      }

      .tnw-metrics-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .tnw-metric-tag {
        font-size: 0.71rem;
        font-weight: 600;
        padding: 3px 9px;
        border-radius: 7px;
        background: rgba(15, 23, 42, 0.52);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.09));
        color: var(--text-secondary, #cbd5e1);
      }

      .tnw-card-desc {
        font-size: 0.84rem;
        line-height: 1.58;
        color: var(--text-secondary, #cbd5e1);
      }

      .tnw-card-tefekkur {
        font-size: 0.78rem;
        font-style: italic;
        line-height: 1.5;
        color: var(--text-primary, #f8fafc);
        background: rgba(245, 158, 11, 0.08);
        border-left: 2px solid var(--accent-gold, #f59e0b);
        padding: 7px 10px;
        border-radius: 0 8px 8px 0;
      }

      .tnw-highlights {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .tnw-highlight-chip {
        font-size: 0.69rem;
        padding: 2px 8px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        color: var(--text-secondary, #94a3b8);
      }

      .tnw-card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding-top: 10px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .tnw-goto-btn {
        flex: 1 1 auto;
        cursor: pointer;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(56, 189, 248, 0.14);
        color: var(--accent-cyan, #38bdf8);
        padding: 8px 12px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.18s ease;
      }

      .tnw-goto-btn:hover {
        background: rgba(56, 189, 248, 0.24);
        transform: translateY(-1px);
      }

      .tnw-route-pick-btn {
        cursor: pointer;
        border: 1px solid rgba(16, 185, 129, 0.4);
        background: rgba(16, 185, 129, 0.12);
        color: var(--accent-emerald, #10b981);
        padding: 8px 11px;
        border-radius: 10px;
        font-size: 0.78rem;
        font-weight: 700;
        transition: all 0.18s ease;
      }

      .tnw-route-pick-btn:hover {
        background: rgba(16, 185, 129, 0.24);
      }

      .tnw-related-btn {
        cursor: pointer;
        border: 1px dashed rgba(245, 158, 11, 0.45);
        background: transparent;
        color: var(--accent-gold, #f59e0b);
        padding: 6px 10px;
        border-radius: 9px;
        font-size: 0.74rem;
        font-weight: 600;
      }

      .tnw-empty {
        text-align: center;
        padding: 40px 20px;
        border-radius: 16px;
        background: var(--bg-card, rgba(15, 23, 42, 0.6));
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.16));
        color: var(--text-secondary, #94a3b8);
      }

      .tnw-southeast-banner {
        border-radius: 16px;
        padding: 18px 20px;
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.28);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .tnw-chip.active-season {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.24), rgba(16, 185, 129, 0.2));
        border-color: var(--accent-gold, #f59e0b);
        color: #fef3c7;
        box-shadow: 0 0 12px rgba(245, 158, 11, 0.22);
      }

      .tnw-route-cta {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 15px;
        border-radius: 999px;
        border: 1px solid rgba(16, 185, 129, 0.48);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(6, 182, 212, 0.22));
        color: #ffffff;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .tnw-route-cta:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(16, 185, 129, 0.24);
        filter: brightness(1.08);
      }

      .tnw-route-cta:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Light Theme Compatibility */
      body.light-theme .tnw-chip.active-season {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.18), rgba(5, 150, 105, 0.14));
        border-color: #d97706;
        color: #78350f;
      }

      body.light-theme .tnw-route-cta {
        background: linear-gradient(135deg, rgba(5, 150, 105, 0.18), rgba(2, 132, 199, 0.16));
        border-color: rgba(5, 150, 105, 0.42);
        color: #064e3b;
      }

      body.light-theme .tnw-studio {
        color: var(--text-primary, #0f172a);
      }

      body.light-theme .tnw-hero {
        background:
          radial-gradient(circle at 86% 16%, rgba(5, 150, 105, 0.14), transparent 45%),
          radial-gradient(circle at 14% 86%, rgba(217, 119, 6, 0.14), transparent 46%),
          linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(241, 245, 249, 0.95));
        border-color: rgba(5, 150, 105, 0.28);
        box-shadow: 0 10px 24px -10px rgba(15, 23, 42, 0.14);
      }

      body.light-theme .tnw-hero-title {
        background: linear-gradient(135deg, #0f172a 0%, #047857 52%, #b45309 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .tnw-hero-sub,
      body.light-theme .tnw-card-desc,
      body.light-theme .tnw-tefekkur-essay,
      body.light-theme .tnw-ai-markdown,
      body.light-theme .tnw-results-meta,
      body.light-theme .tnw-ai-subtitle {
        color: #334155;
      }

      body.light-theme .tnw-kpi-card,
      body.light-theme .tnw-tefekkur-quote-box,
      body.light-theme .tnw-tefekkur-essay,
      body.light-theme .tnw-ai-output-wrap,
      body.light-theme .tnw-search-input,
      body.light-theme .tnw-select,
      body.light-theme .tnw-pillar-btn,
      body.light-theme .tnw-chip,
      body.light-theme .tnw-metric-tag,
      body.light-theme .tnw-mini-btn {
        background: rgba(241, 245, 249, 0.92);
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .tnw-tefekkur-panel,
      body.light-theme .tnw-ai-studio,
      body.light-theme .tnw-controls,
      body.light-theme .tnw-card {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 8px 22px -12px rgba(15, 23, 42, 0.14);
      }

      body.light-theme .tnw-kpi-val,
      body.light-theme .tnw-ai-title,
      body.light-theme .tnw-card-title,
      body.light-theme .tnw-tefekkur-quote-text,
      body.light-theme .tnw-card-tefekkur {
        color: #0f172a;
      }

      body.light-theme .tnw-pillar-btn.active {
        background: rgba(245, 158, 11, 0.2);
        color: #92400e;
        border-color: #d97706;
      }

      body.light-theme .tnw-chip.active-cat {
        background: rgba(16, 185, 129, 0.18);
        color: #065f46;
        border-color: #059669;
      }

      body.light-theme .tnw-chip.active-region {
        background: rgba(2, 132, 199, 0.16);
        color: #075985;
        border-color: #0284c7;
      }

      body.light-theme .tnw-ai-generate-btn {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(2, 132, 199, 0.2));
        color: #064e3b;
        border-color: #059669;
      }

      body.light-theme .tnw-goto-btn {
        background: rgba(2, 132, 199, 0.12);
        color: #0369a1;
        border-color: rgba(2, 132, 199, 0.36);
      }

      body.light-theme .tnw-route-pick-btn {
        background: rgba(5, 150, 105, 0.12);
        color: #047857;
        border-color: rgba(5, 150, 105, 0.36);
      }

      body.light-theme .tnw-highlight-chip {
        background: rgba(15, 23, 42, 0.05);
        color: #334155;
        border-color: rgba(15, 23, 42, 0.1);
      }

      @media (max-width: 960px) {
        .tnw-kpi-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .tnw-tefekkur-body {
          grid-template-columns: 1fr;
        }
        .tnw-ai-controls {
          grid-template-columns: 1fr 1fr;
        }
        .tnw-search-row {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .tnw-hero,
        .tnw-tefekkur-panel,
        .tnw-ai-studio,
        .tnw-controls {
          padding: 16px;
        }
        .tnw-ai-controls {
          grid-template-columns: 1fr;
        }
        .tnw-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Catalog Enrichment & Filtering
  // ---------------------------------------------------------------------------
  function enrichWonders(provinces) {
    return WONDERS.map(function (w) {
      const prov = (provinces && provinces[w.provinceKey]) || null;
      const regionCode = w.provinceKey.split('/')[0];
      const provinceName = prov && prov.name ? prov.name : w.provinceKey.split('/').pop();
      const regionName = prov && prov.region ? prov.region : regionCode;
      const plate = prov && prov.plate != null ? String(prov.plate).padStart(2, '0') : '--';
      const visited = Boolean(prov && prov.visited);
      const bannerSrc =
        prov && prov.has_banner && prov.banner_rel
          ? prov.banner_rel
          : w.provinceKey + '/banner.jpg';
      const library = prov && prov.library ? prov.library : '';
      const catMeta = CATEGORY_MAP[w.category] || CATEGORIES[0];

      return Object.assign({}, w, {
        regionCode: regionCode,
        regionName: regionName,
        provinceName: provinceName,
        plate: plate,
        visited: visited,
        bannerSrc: bannerSrc,
        library: library,
        catMeta: catMeta
      });
    });
  }

  // ---------------------------------------------------------------------------
  // AI Route Prompt & Rich Offline Fallback Builder
  // ---------------------------------------------------------------------------
  function buildRoutePrompt(opts, enrichedWonders, provinces) {
    const focusLabels = {
      'termal-sifa': 'Termal Şifa, Kaplıca & İçme Dinlenmesi',
      'kanyon-selale': 'Kanyon, Vadi & Şelale Doğa Keşfi',
      'magara-krater': 'Mağara, Jeopark & Krater Gölü Jeoloji Rotası',
      'karma-tefekkur': 'Âfâkî Tefekkür, Tabiat & Kütüphane Yavaş Seyahat Rotası'
    };

    const regionObj = REGIONS.find(function (r) {
      return r.code === opts.region;
    });
    const regionLabel = regionObj ? regionObj.label : 'Tüm Anadolu';
    const focusLabel = focusLabels[opts.focus] || focusLabels['karma-tefekkur'];

    let pool = enrichedWonders.slice();
    if (opts.region && opts.region !== 'all') {
      const regional = pool.filter(function (w) {
        return w.regionCode === opts.region;
      });
      if (regional.length > 0) pool = regional;
    }
    if (opts.focus === 'termal-sifa') {
      const thermals = pool.filter(function (w) {
        return w.category === 'termal-icme';
      });
      if (thermals.length > 0) pool = thermals;
    } else if (opts.focus === 'kanyon-selale') {
      const canyonWater = pool.filter(function (w) {
        return w.category === 'kanyon-vadi' || w.category === 'selale-gol';
      });
      if (canyonWater.length > 0) pool = canyonWater;
    } else if (opts.focus === 'magara-krater') {
      const geo = pool.filter(function (w) {
        return w.category === 'magara-jeopark' || w.category === 'selale-gol';
      });
      if (geo.length > 0) pool = geo;
    }

    const anchorWonder = opts.anchorId
      ? enrichedWonders.find(function (w) {
          return w.id === opts.anchorId;
        })
      : null;

    const selectedStops = [];
    if (anchorWonder) selectedStops.push(anchorWonder);
    pool.forEach(function (w) {
      if (selectedStops.length < 5 && !selectedStops.some(function (s) { return s.id === w.id; })) {
        selectedStops.push(w);
      }
    });

    const stopSummary = selectedStops
      .map(function (s) {
        const libNote = s.library ? ' | Kütüphane: ' + s.library : '';
        return (
          '- ' +
          s.name +
          ' (' +
          s.provinceName +
          ' / ' +
          s.regionName +
          ' — ' +
          s.metric +
          ', ' +
          s.featureType +
          libNote +
          ')'
        );
      })
      .join('\n');

    let southeastNote = '';
    if (opts.region === '07_GuneydoguAnadolu' && provinces) {
      southeastNote =
        '\nGüneydoğu Anadolu özel vurgusu: Şanlıurfa (Balıklıgöl & Halfeti Fırat Kanyonu), Diyarbakır (Hevsel Bahçeleri & Dicle Vadisi), Siirt (Botan Vadisi & Billoris Kaplıcası), Gaziantep (Rumkale) duraklarını ekle.';
    }

    return [
      'Anadolu Seyahatnamesi için kişiselleştirilmiş bir Tabiat & Şifa Rotası tasarla:',
      '• Odak Modu: ' + focusLabel,
      '• Bölge Tercihi: ' + regionLabel,
      '• Süre: ' + opts.days + ' Gün',
      anchorWonder ? '• Merkez Durak (Seyyahın Seçimi): ' + anchorWonder.name + ' (' + anchorWonder.provinceName + ')' : '',
      '• Atlas Envanterinden Aday Duraklar:\n' + stopSummary + southeastNote,
      '',
      'Yanıtını Türkçe, uygulanabilir, yavaş seyahat (kütüphane çalışma + doğa/şifa dengesi) ve âfâkî tefekkür perspektifiyle şu 4 net başlık altında yaz:',
      '## 1. Rotanın Ruhu & Âfâkî Tefekkür Niyeti',
      '## 2. ' + opts.days + ' Günlük Adım Adım Tabiat & Şifa Güzergâhı',
      '## 3. Şifa, Güvenlik & Ekolojik Emanet Protokolü (Su, Sıcaklık, Mevsim & Sırt Çantası)',
      '## 4. Kütüphane Ofisi & Akşam Tefekkür Pratiği'
    ]
      .filter(Boolean)
      .join('\n');
  }

  function buildOfflineRoute(opts, enrichedWonders, provinces) {
    const regionObj = REGIONS.find(function (r) {
      return r.code === opts.region;
    });
    const regionLabel = regionObj ? regionObj.label : 'Tüm Anadolu';

    let candidates = enrichedWonders.slice();
    if (opts.region && opts.region !== 'all') {
      const reg = candidates.filter(function (w) {
        return w.regionCode === opts.region;
      });
      if (reg.length > 0) candidates = reg;
    }

    if (opts.focus === 'termal-sifa') {
      const t = candidates.filter(function (w) { return w.category === 'termal-icme'; });
      if (t.length > 0) candidates = t;
    } else if (opts.focus === 'kanyon-selale') {
      const k = candidates.filter(function (w) {
        return w.category === 'kanyon-vadi' || w.category === 'selale-gol';
      });
      if (k.length > 0) candidates = k;
    } else if (opts.focus === 'magara-krater') {
      const m = candidates.filter(function (w) {
        return w.category === 'magara-jeopark' || w.category === 'selale-gol';
      });
      if (m.length > 0) candidates = m;
    }

    const anchorWonder = opts.anchorId
      ? enrichedWonders.find(function (w) { return w.id === opts.anchorId; })
      : null;

    const picked = [];
    if (anchorWonder) picked.push(anchorWonder);
    candidates.forEach(function (w) {
      if (!picked.some(function (p) { return p.id === w.id; })) {
        picked.push(w);
      }
    });

    const daysCount = Number(opts.days) || 5;
    const stopCount = Math.min(picked.length, daysCount === 3 ? 2 : daysCount === 5 ? 3 : 4);
    const routeStops = picked.slice(0, stopCount);

    // Special handling if user chose 07_GuneydoguAnadolu
    if (opts.region === '07_GuneydoguAnadolu') {
      const seLines = [
        '## 1. Rotanın Ruhu & Âfâkî Tefekkür Niyeti',
        '**Güneydoğu Anadolu**’nun kadim Fırat, Dicle ve Botan havzaları; taşın, güneşin ve suyun birbirine sabırla kavuştuğu bir **Tabiat & Su Şifa Rotası** sunar. Bu ' + daysCount + ' günlük seferde gürültüsüz yürüyüşü, yerel il halk kütüphanelerinde derin çalışmayı ve kanyon-kaplıca sükûnetini birleştiriyoruz.',
        '',
        '> *"Biz onlara hem dış dünyada (âfâkta) hem kendi iç dünyalarında (enfüste) âyetlerimizi göstereceğiz."* — Fussilet, 53',
        '',
        '## 2. ' + daysCount + ' Günlük Güneydoğu Tabiat & Su Güzergâhı',
        '- **1. Durak — Şanlıurfa (Balıklıgöl & Halfeti Fırat Kanyonu):** Sabah Şanlıurfa İl Halk Kütüphanesi’nde odaklanma; ikindi vakti Balıklıgöl pınarlarında tefekkür ve Halfeti’de Fırat kanyonunda tekneyle sessiz süzülüş.',
        '- **2. Durak — Diyarbakır (Hevsel Bahçeleri & Dicle Vadisi):** 8.000 yıllık Hevsel bahçelerinin ekolojik hafızasında sabah yürüyüşü, On Gözlü Köprü kıyısında Dicle’nin akışını dinleyiş.',
        '- **3. Durak — Siirt (Botan Vadisi & Billoris Kaplıcası):** Rasıl Hacar uçurumlarından Botan Kanyonu’nu seyir ve 34–38 °C kükürtlü Billoris kaplıca suyunda yol yorgunluğunu atış.',
        daysCount >= 5
          ? '- **4. Durak — Gaziantep (Rumkale) & Şırnak (Kasrik Boğazı):** Merzimen ve Fırat’ın kavuştuğu Rumkale’de gün batımı ve kadim dağ geçitlerinde âfâkî tefekkür.'
          : '',
        '',
        '## 3. Şifa, Güvenlik & Ekolojik Emanet Protokolü',
        '1. **Mevsim Dengesi:** Güneydoğu vadileri için en ideal zaman **Mart–Mayıs** ve **Eylül–Kasım** arasıdır; yaz öğlenleri kütüphane ve serin taş avlular tercih edilmelidir.',
        '2. **Su & Mineral Bilinci:** Billoris termal sularında 15–20 dakikalık ölçülü seanslar ve bol su tüketimi esastır.',
        '3. **İz Bırakmayan Seyyah:** Fırat ve Botan kıyılarında plastik atık bırakmadan, yerel üreticiden sade kumanya ile yol alın.',
        '',
        '## 4. Kütüphane Ofisi & Akşam Tefekkür Pratiği',
        'Sabah saatlerini il halk kütüphanelerinde üretkenliğe ayırıp ikindi sonrasında vadi rüzgârına çıkmak, dijital yorgunluğu sıfırlar. Akşam defterinize tek bir soru yazın: *"Bugün suyun ve kayanın sabrından kalbime ne damladı?"*'
      ].filter(Boolean);

      return {
        text: seLines.join('\n'),
        jumpKeys: SOUTHEAST_COMPLEMENTARY.slice(0, 4).map(function (s) { return s.provinceKey; })
      };
    }

    const dayPlans = [];
    for (let d = 1; d <= daysCount; d++) {
      const stop = routeStops[(d - 1) % routeStops.length];
      if (!stop) continue;
      if (d === 1) {
        dayPlans.push(
          '- **1. Gün — Varış & Kök Salma (' + stop.provinceName + ' · ' + stop.name + '):** Sabah ' +
            (stop.library ? stop.library.split(' - ')[0] : stop.provinceName + ' İl Halk Kütüphanesi') +
            '’nde 3 saatlik derin odaklanma; öğleden sonra **' + stop.name + '** (' + stop.district + ', ' + stop.metric + ') keşfi ve ilk tefekkür notları.'
        );
      } else if (d === daysCount) {
        dayPlans.push(
          '- **' + d + '. Gün — Şifa Kapanışı & Veda (' + stop.provinceName + ' · ' + stop.name + '):** Gündoğumunda ' +
            stop.name + ' çevresinde sessiz yürüyüş (veya termal sabah seansı), yerel pazarda sade tadım ve seyahat defterine özet düşerek dönüş.'
        );
      } else {
        dayPlans.push(
          '- **' + d + '. Gün — Derinleşme & Sükûnet (' + stop.provinceName + ' · ' + stop.name + '):** ' +
            stop.featureType + ' dokusunu acele etmeden sindirme (' + stop.highlights.slice(0, 2).join(' & ') + '). ' +
            stop.tefekkurNote
        );
      }
    }

    const lines = [
      '## 1. Rotanın Ruhu & Âfâkî Tefekkür Niyeti',
      '**' + regionLabel + '** ekseninde kurgulanan bu **' + daysCount + ' günlük Tabiat & Şifa Rotası**; ' +
        routeStops.map(function (s) { return '**' + s.name + '** (' + s.provinceName + ')'; }).join(', ') +
        ' duraklarını **yavaş seyahat ve tefekkür** disipliniyle birleştirir. Amaç kilometre tüketmek değil, kâinat kitabının bir sayfasını sindirerek okumaktır.',
      '',
      '> *"Yeryüzünde gezip dolaşın da yaratılışın nasıl başladığına bir bakın."* — Ankebût, 20',
      '',
      '## 2. ' + daysCount + ' Günlük Adım Adım Tabiat & Şifa Güzergâhı',
      dayPlans.join('\n'),
      '',
      '## 3. Şifa, Güvenlik & Ekolojik Emanet Protokolü',
      '1. **Zemin & Mevsim Uyumu:** Seçilen duraklar için en verimli dönemler: ' +
        routeStops.map(function (s) { return s.name + ' (' + s.season + ')'; }).join(' · ') + '.',
      '2. **Termal & Mağara Ölçüsü:** Kaplıcalarda 15–20 dakikalık seanslar arası serin dinlenme uygulayın; yüksek nemli mağara ve kaygan kanyon zeminlerinde bilek destekli yürüyüş ayakkabısı kullanın.',
      '3. **Emanet Bilinci:** Salda kumsalından kanyon dere yataklarına kadar tek bir taş, bitki veya atık izi bırakmadan yürüyün.',
      '',
      '## 4. Kütüphane Ofisi & Akşam Tefekkür Pratiği',
      'Her durakta günün ilk 2–3 saatini il halk kütüphanesinin sükûnetine, ikindi vaktini ise tabiat harikasına ayırın. Akşam günlüğünüze *"' +
        (routeStops[0] ? routeStops[0].tefekkurNote : 'Tabiatın sabrı bugün bana ne öğretti?') +
        '"* cümlesini rehber alarak 5 satırlık şükür ve gözlem notu yazın.'
    ];

    const jumpKeys = [];
    routeStops.forEach(function (s) {
      if (jumpKeys.indexOf(s.provinceKey) === -1) jumpKeys.push(s.provinceKey);
    });

    return {
      text: lines.join('\n'),
      jumpKeys: jumpKeys
    };
  }

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const safeCtx = ctx || {};
    const data = safeCtx.data || {};
    const provinces = data.provinces || {};
    const esc = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const norm = typeof safeCtx.normalizeTurkish === 'function' ? safeCtx.normalizeTurkish : fallbackNormalizeTurkish;
    const selectCity = typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};
    const showToast = typeof safeCtx.showToast === 'function' ? safeCtx.showToast : function () {};

    const enrichedWonders = enrichWonders(provinces);

    const uiState = {
      category: 'all',
      region: 'all',
      season: 'all',
      search: '',
      onlyVisited: 'all', // 'all' | 'visited' | 'pending'
      pillarId: TEFEKKUR_PILLARS[0].id,
      aiFocus: 'karma-tefekkur',
      aiRegion: 'all',
      aiDays: '5',
      aiAnchorId: '',
      aiStreaming: false,
      aiText: '',
      aiStatus: '',
      aiIsOffline: false,
      aiJumpKeys: [],
      aiRequestId: 0
    };

    function openCity(key) {
      if (key && provinces[key]) {
        selectCity(key);
      } else if (key) {
        selectCity(key);
      }
    }

    function getFilteredWonders() {
      const q = norm(uiState.search || '');
      return enrichedWonders.filter(function (w) {
        if (uiState.category !== 'all' && w.category !== uiState.category) return false;
        if (uiState.region !== 'all' && w.regionCode !== uiState.region) return false;
        if (uiState.season !== 'all' && !matchesSeason(w, uiState.season, norm)) return false;
        if (uiState.onlyVisited === 'visited' && !w.visited) return false;
        if (uiState.onlyVisited === 'pending' && w.visited) return false;

        if (q) {
          const hay = norm(
            [
              w.name,
              w.provinceName,
              w.regionName,
              w.district,
              w.featureType,
              w.metric,
              w.season,
              w.summary,
              w.tefekkurNote,
              w.highlights.join(' '),
              w.catMeta.label
            ].join(' ')
          );
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
    }

    function computeStats() {
      const uniqueProvinces = new Set();
      let visitedWonders = 0;
      const catCounts = { all: enrichedWonders.length };
      const regCounts = { all: enrichedWonders.length };
      const seasonCounts = { all: enrichedWonders.length };

      CATEGORIES.forEach(function (c) {
        if (c.id !== 'all') catCounts[c.id] = 0;
      });
      REGIONS.forEach(function (r) {
        if (r.code !== 'all') regCounts[r.code] = 0;
      });
      SEASONS.forEach(function (s) {
        if (s.id !== 'all') seasonCounts[s.id] = 0;
      });

      enrichedWonders.forEach(function (w) {
        uniqueProvinces.add(w.provinceKey);
        if (w.visited) visitedWonders += 1;
        catCounts[w.category] = (catCounts[w.category] || 0) + 1;
        regCounts[w.regionCode] = (regCounts[w.regionCode] || 0) + 1;
        SEASONS.forEach(function (s) {
          if (s.id !== 'all' && matchesSeason(w, s.id, norm)) {
            seasonCounts[s.id] = (seasonCounts[s.id] || 0) + 1;
          }
        });
      });

      // Southeast region has complementary inventory highlights
      regCounts['07_GuneydoguAnadolu'] = regCounts['07_GuneydoguAnadolu'] || SOUTHEAST_COMPLEMENTARY.length;

      return {
        total: enrichedWonders.length,
        uniqueProvinces: uniqueProvinces.size,
        visitedWonders: visitedWonders,
        catCounts: catCounts,
        regCounts: regCounts,
        seasonCounts: seasonCounts
      };
    }

    function renderTefekkurBody() {
      const pillar =
        TEFEKKUR_PILLARS.find(function (p) {
          return p.id === uiState.pillarId;
        }) || TEFEKKUR_PILLARS[0];

      const bodyEl = container.querySelector('#tnw-tefekkur-body');
      if (!bodyEl) return;
      bodyEl.innerHTML =
        '<div class="tnw-tefekkur-quote-box">' +
          '<div class="tnw-tefekkur-quote-text">' + esc(pillar.quote) + '</div>' +
          '<div class="tnw-tefekkur-source">' + esc(pillar.icon + ' ' + pillar.source) + '</div>' +
        '</div>' +
        '<div class="tnw-tefekkur-essay">' +
          '<strong style="display:block;margin-bottom:6px;color:var(--text-primary);">' + esc(pillar.title) + '</strong>' +
          esc(pillar.body) +
        '</div>';
    }

    function renderWonderCard(w) {
      const cat = w.catMeta;
      const highlightsHtml = w.highlights
        .map(function (h) {
          return '<span class="tnw-highlight-chip">' + esc(h) + '</span>';
        })
        .join('');

      let relatedHtml = '';
      if (w.relatedKeys && w.relatedKeys.length) {
        relatedHtml = w.relatedKeys
          .filter(function (rk) { return Boolean(provinces[rk]); })
          .map(function (rk) {
            const rp = provinces[rk];
            return (
              '<button type="button" class="tnw-related-btn" data-city-key="' +
              esc(rk) +
              '" title="Komşu il rehberini aç">📍 ' +
              esc(rp.name) +
              '</button>'
            );
          })
          .join('');
      }

      return (
        '<article class="tnw-card ' + (w.visited ? 'is-visited' : '') + '">' +
          '<div class="tnw-card-media">' +
            '<img class="tnw-card-img" src="' + esc(w.bannerSrc) + '" alt="' + esc(w.name + ' - ' + w.provinceName) + '" loading="lazy" onerror="this.onerror=null;this.src=\'assets/banner.jpg\';" />' +
            '<div class="tnw-card-scrim"></div>' +
            '<div class="tnw-media-top">' +
              '<span class="tnw-cat-badge" style="color:' + esc(cat.color) + ';background:' + esc(cat.badgeBg) + ';">' +
                esc(cat.icon + ' ' + (cat.shortLabel || cat.label)) +
              '</span>' +
              '<span class="tnw-visit-badge ' + (w.visited ? 'visited' : '') + '">' +
                (w.visited ? '✓ İl Gezildi' : '⏳ Keşif Bekliyor') +
              '</span>' +
            '</div>' +
            '<div class="tnw-media-bottom">' +
              '<span class="tnw-prov-pill">' +
                '<span class="tnw-plate-chip">' + esc(w.plate) + '</span>' +
                esc(w.provinceName) +
              '</span>' +
              '<span class="tnw-region-pill">' + esc(w.regionName) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="tnw-card-body">' +
            '<div>' +
              '<h3 class="tnw-card-title">' + esc(w.name) + '</h3>' +
              '<div class="tnw-card-district">🧭 ' + esc(w.district) + ' · ' + esc(w.featureType) + '</div>' +
            '</div>' +
            '<div class="tnw-metrics-row">' +
              '<span class="tnw-metric-tag">📏 ' + esc(w.metric) + '</span>' +
              '<span class="tnw-metric-tag">🗓️ ' + esc(w.season) + '</span>' +
            '</div>' +
            '<p class="tnw-card-desc">' + esc(w.summary) + '</p>' +
            '<div class="tnw-card-tefekkur">✨ ' + esc(w.tefekkurNote) + '</div>' +
            '<div class="tnw-highlights">' + highlightsHtml + '</div>' +
            '<div class="tnw-card-actions">' +
              '<button type="button" class="tnw-goto-btn" data-city-key="' + esc(w.provinceKey) + '">' +
                '📍 Menzile Git (' + esc(w.provinceName) + ')' +
              '</button>' +
              '<button type="button" class="tnw-route-pick-btn" data-pick-wonder="' + esc(w.id) + '" title="Bu harikayı AI rotasının merkezine al">' +
                '✨ Rotaya Al' +
              '</button>' +
              relatedHtml +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }

    function renderSoutheastComplementCards() {
      return (
        '<div class="tnw-southeast-banner">' +
          '<div>' +
            '<strong style="font-size:0.98rem;color:var(--accent-gold,#f59e0b);">🕌 7. Bölge Özel: Güneydoğu Anadolu Tabiat, Vadi & Şifa İzleri (İl Envanterinden)</strong>' +
            '<p style="font-size:0.83rem;color:var(--text-secondary);margin-top:4px;">' +
              '28 harikalık ana atlasımız yukarıdaki 6 bölgede yoğunlaşırken, 7. bölgemiz Güneydoğu Anadolu’nun Fırat, Dicle ve Botan havzalarındaki doğal & termal hazinelerine aşağıdaki il kartlarından doğrudan ulaşabilirsiniz.' +
            '</p>' +
          '</div>' +
          '<div class="tnw-grid">' +
            SOUTHEAST_COMPLEMENTARY.map(function (item) {
              const p = provinces[item.provinceKey];
              if (!p) return '';
              const banner = p.has_banner && p.banner_rel ? p.banner_rel : item.provinceKey + '/banner.jpg';
              const plate = p.plate != null ? String(p.plate).padStart(2, '0') : '--';
              return (
                '<article class="tnw-card ' + (p.visited ? 'is-visited' : '') + '">' +
                  '<div class="tnw-card-media">' +
                    '<img class="tnw-card-img" src="' + esc(banner) + '" alt="' + esc(p.name) + '" loading="lazy" onerror="this.onerror=null;this.src=\'assets/banner.jpg\';" />' +
                    '<div class="tnw-card-scrim"></div>' +
                    '<div class="tnw-media-top">' +
                      '<span class="tnw-cat-badge" style="color:#f59e0b;background:rgba(245,158,11,0.18);">' + esc(item.badge) + '</span>' +
                      '<span class="tnw-visit-badge ' + (p.visited ? 'visited' : '') + '">' + (p.visited ? '✓ İl Gezildi' : '⏳ Keşif Bekliyor') + '</span>' +
                    '</div>' +
                    '<div class="tnw-media-bottom">' +
                      '<span class="tnw-prov-pill"><span class="tnw-plate-chip">' + esc(plate) + '</span>' + esc(p.name) + '</span>' +
                      '<span class="tnw-region-pill">Güneydoğu Anadolu</span>' +
                    '</div>' +
                  '</div>' +
                  '<div class="tnw-card-body">' +
                    '<div><h3 class="tnw-card-title">' + esc(item.title) + '</h3></div>' +
                    '<p class="tnw-card-desc">' + esc(item.note) + '</p>' +
                    '<div class="tnw-card-actions">' +
                      '<button type="button" class="tnw-goto-btn" data-city-key="' + esc(item.provinceKey) + '">📍 Menzile Git (' + esc(p.name) + ')</button>' +
                    '</div>' +
                  '</div>' +
                '</article>'
              );
            }).join('') +
          '</div>' +
        '</div>'
      );
    }

    function updateGrid() {
      const gridWrap = container.querySelector('#tnw-grid-container');
      const countEl = container.querySelector('#tnw-results-count');
      const routeCtaBtn = container.querySelector('#tnw-build-route-btn');
      if (!gridWrap) return;

      const filtered = getFilteredWonders();
      const routeSourceKeys = [];
      if (uiState.region === '07_GuneydoguAnadolu' && filtered.length === 0) {
        SOUTHEAST_COMPLEMENTARY.forEach(function (item) {
          if (item.provinceKey && provinces[item.provinceKey] && routeSourceKeys.indexOf(item.provinceKey) === -1) {
            routeSourceKeys.push(item.provinceKey);
          }
        });
      } else {
        filtered.forEach(function (w) {
          if (w.provinceKey && routeSourceKeys.indexOf(w.provinceKey) === -1) {
            routeSourceKeys.push(w.provinceKey);
          }
        });
      }

      if (countEl) {
        countEl.textContent =
          filtered.length + ' tabiat & şifa harikası listeleniyor (Toplam ' + WONDERS.length + ' kürasyon)';
      }

      if (routeCtaBtn) {
        routeCtaBtn.disabled = routeSourceKeys.length === 0;
        routeCtaBtn.textContent = '🧭 Seçili Tabiat Harikalarından Rota Oluştur (' + routeSourceKeys.length + ' İl)';
      }

      if (uiState.region === '07_GuneydoguAnadolu' && filtered.length === 0) {
        gridWrap.innerHTML = renderSoutheastComplementCards();
      } else if (filtered.length === 0) {
        gridWrap.innerHTML =
          '<div class="tnw-empty">' +
            '<p style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">Seçili filtrelere uyan tabiat harikası bulunamadı</p>' +
            '<p style="font-size:0.84rem;">Kategori, bölge veya arama metnini sıfırlayarak 28 harikanın tamamını görüntüleyebilirsiniz.</p>' +
          '</div>';
      } else {
        gridWrap.innerHTML = '<div class="tnw-grid">' + filtered.map(renderWonderCard).join('') + '</div>';
      }

      // Bind card actions
      gridWrap.querySelectorAll('[data-city-key]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          openCity(btn.getAttribute('data-city-key'));
        });
      });

      gridWrap.querySelectorAll('[data-pick-wonder]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const id = btn.getAttribute('data-pick-wonder');
          const found = enrichedWonders.find(function (w) { return w.id === id; });
          if (!found) return;
          uiState.aiAnchorId = found.id;
          uiState.aiRegion = found.regionCode;
          const anchorSelect = container.querySelector('#tnw-ai-anchor');
          const regionSelect = container.querySelector('#tnw-ai-region');
          if (anchorSelect) anchorSelect.value = found.id;
          if (regionSelect) regionSelect.value = found.regionCode;
          const studioEl = container.querySelector('#tnw-ai-studio');
          if (studioEl && typeof studioEl.scrollIntoView === 'function') {
            studioEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          generateRoute(false);
        });
      });
    }

    function updateAiOutputDom() {
      const wrap = container.querySelector('#tnw-ai-output-wrap');
      const statusEl = container.querySelector('#tnw-ai-status');
      const mdEl = container.querySelector('#tnw-ai-markdown');
      const jumpsEl = container.querySelector('#tnw-route-jumps');
      const genBtn = container.querySelector('#tnw-ai-generate-btn');

      if (!wrap || !mdEl) return;
      wrap.style.display = uiState.aiText || uiState.aiStreaming ? 'flex' : 'none';

      if (genBtn) {
        genBtn.disabled = uiState.aiStreaming;
        genBtn.textContent = uiState.aiStreaming
          ? '⏳ Rota Tefekkür Ediliyor...'
          : '✨ Gemini AI ile Tabiat & Şifa Rotası Oluştur';
      }

      if (statusEl) {
        statusEl.className = 'tnw-status-pill' + (uiState.aiIsOffline ? ' offline' : '');
        statusEl.textContent = uiState.aiStatus || '✨ Hazır';
      }

      mdEl.innerHTML = renderSafeMarkdown(uiState.aiText, esc);

      if (jumpsEl) {
        const validJumps = (uiState.aiJumpKeys || []).filter(function (k) {
          return Boolean(provinces[k]);
        });
        if (validJumps.length > 0 && !uiState.aiStreaming) {
          jumpsEl.style.display = 'flex';
          jumpsEl.innerHTML =
            '<span class="tnw-chip-label">Rota Duraklarına Git:</span>' +
            validJumps
              .map(function (k) {
                const p = provinces[k];
                return (
                  '<button type="button" class="tnw-mini-btn" data-jump-city="' + esc(k) + '">' +
                    '📍 ' + esc(p.name) +
                  '</button>'
                );
              })
              .join('');
          jumpsEl.querySelectorAll('[data-jump-city]').forEach(function (btn) {
            btn.addEventListener('click', function () {
              openCity(btn.getAttribute('data-jump-city'));
            });
          });
        } else {
          jumpsEl.style.display = 'none';
          jumpsEl.innerHTML = '';
        }
      }
    }

    async function generateRoute(forceRefresh) {
      const reqId = ++uiState.aiRequestId;
      uiState.aiStreaming = true;
      uiState.aiText = '';
      uiState.aiIsOffline = false;
      uiState.aiStatus = '⏳ Tabiat & şifa rotası hazırlanıyor...';

      const opts = {
        focus: uiState.aiFocus,
        region: uiState.aiRegion,
        days: uiState.aiDays,
        anchorId: uiState.aiAnchorId
      };

      // Pre-compute jump keys so city buttons appear immediately after completion
      const offlinePreview = buildOfflineRoute(opts, enrichedWonders, provinces);
      uiState.aiJumpKeys = offlinePreview.jumpKeys;
      updateAiOutputDom();

      const hasAiClient =
        typeof window !== 'undefined' &&
        window.SEYYAH_AI &&
        typeof window.SEYYAH_AI.stream === 'function';
      const hasKey = hasAiClient && typeof window.SEYYAH_AI.hasKey === 'function' && window.SEYYAH_AI.hasKey();

      if (hasKey) {
        try {
          const prompt = buildRoutePrompt(opts, enrichedWonders, provinces);
          const system =
            'Sen Anadolu coğrafyası, jeoparklar, şifalı termal kaplıcalar, yavaş seyahat ve "Âfâkî Tefekkür" kültürü konusunda uzman bilge bir seyyah rehbersin. Üslubun şiirsel ama pratik, güvenli, ekolojik saygılı ve uygulanabilirdir.';
          const cacheKey = forceRefresh
            ? null
            : 'tnw_route_v1_' + [opts.focus, opts.region, opts.days, opts.anchorId || 'none'].join('_');

          uiState.aiStatus = '✨ Gemini AI Canlı Rota Akışı';
          updateAiOutputDom();

          const res = await window.SEYYAH_AI.stream({
            prompt: prompt,
            system: system,
            temperature: 0.72,
            maxTokens: 1700,
            cacheKey: cacheKey,
            onChunk: function (_delta, fullText) {
              if (reqId !== uiState.aiRequestId) return;
              uiState.aiText = fullText;
              updateAiOutputDom();
            }
          });

          if (reqId !== uiState.aiRequestId) return;
          if (res && res.text) {
            uiState.aiText = res.text;
            uiState.aiIsOffline = false;
            uiState.aiStatus =
              '✨ Gemini AI (' + (res.model || 'Canlı') + (res.cached ? ' · Önbellek' : '') + ')';
            uiState.aiStreaming = false;
            // Extract any additional province matches if AI helper exists
            if (typeof window.SEYYAH_AI.extractProvinceMatches === 'function') {
              try {
                const matched = window.SEYYAH_AI.extractProvinceMatches(res.text, provinces);
                if (Array.isArray(matched) && matched.length > 0) {
                  uiState.aiJumpKeys = matched.slice(0, 5).map(function (m) {
                    return m.key || m;
                  });
                }
              } catch (_) {}
            }
            updateAiOutputDom();
            return;
          }
        } catch (_err) {
          // Gracefully fall back to curated offline route
        }
      }

      // Offline progressive reveal fallback
      uiState.aiIsOffline = true;
      uiState.aiStatus = '🌿 Çevrimdışı Tabiat & Şifa Kürasyon Rotası (Gemini AI Anahtarı Yok / Çevrimdışı Yedek)';
      const words = offlinePreview.text.split(' ');
      let idx = 0;
      const chunkSize = 16;

      function step() {
        if (reqId !== uiState.aiRequestId) return;
        idx = Math.min(words.length, idx + chunkSize);
        uiState.aiText = words.slice(0, idx).join(' ');
        if (idx >= words.length) {
          uiState.aiStreaming = false;
          updateAiOutputDom();
          return;
        }
        updateAiOutputDom();
        setTimeout(step, 26);
      }
      step();
    }

    const stats = computeStats();

    const anchorOptionsHtml =
      '<option value="">🌟 Otomatik (Bölge & Odağa Göre Seç)</option>' +
      enrichedWonders
        .map(function (w) {
          return (
            '<option value="' + esc(w.id) + '">' +
              esc(w.name + ' — ' + w.provinceName) +
            '</option>'
          );
        })
        .join('');

    const regionOptionsHtml = REGIONS.map(function (r) {
      return '<option value="' + esc(r.code) + '">' + esc(r.icon + ' ' + r.label) + '</option>';
    }).join('');

    container.innerHTML =
      '<div class="tnw-studio">' +
        // Hero Section
        '<section class="tnw-hero">' +
          '<div class="tnw-eyebrow">🌿 7 Bölge · 28 Seçkin Harika · Jeopark & Şifa Envanteri</div>' +
          '<h2 class="tnw-hero-title">🏔️ Anadolu Tabiat Harikaları, Kanyonlar, Şelaleler &amp; Şifalı Kaplıcalar Atlası</h2>' +
          '<p class="tnw-hero-sub">' +
            'Küre Dağları’nın baş döndüren Valla uçurumlarından Salda’nın Mars ikizi beyaz kumsallarına, Nemrut’un krater göllerinden Yoncalı ve Kangal’ın asırlık şifahânelerine uzanan <strong>28 büyük Anadolu tabiat harikasını</strong> keşfedin. Her durakta şehrin gerçek kütüphane ve seyahatname rehberine geçin.' +
          '</p>' +
          '<div class="tnw-kpi-grid">' +
            '<div class="tnw-kpi-card"><span class="tnw-kpi-val">' + stats.total + '</span><span class="tnw-kpi-lbl">Kürasyon Tabiat &amp; Termal Harikası</span></div>' +
            '<div class="tnw-kpi-card"><span class="tnw-kpi-val">7 Bölge</span><span class="tnw-kpi-lbl">' + stats.uniqueProvinces + ' Çekirdek İl + Güneydoğu Su İzleri</span></div>' +
            '<div class="tnw-kpi-card"><span class="tnw-kpi-val">' + stats.visitedWonders + ' / ' + stats.total + '</span><span class="tnw-kpi-lbl">Ziyaret Edilmiş İldeki Harikalar</span></div>' +
            '<div class="tnw-kpi-card"><span class="tnw-kpi-val">' + (stats.catCounts['termal-icme'] || 7) + ' Şifahâne</span><span class="tnw-kpi-lbl">Termal Kaplıca &amp; İçme Kaynağı</span></div>' +
          '</div>' +
        '</section>' +

        // Philosophical Section: Âfâkî Tefekkür
        '<section class="tnw-tefekkur-panel" aria-label="Âfâkî Tefekkür">' +
          '<div class="tnw-tefekkur-head">' +
            '<div class="tnw-tefekkur-title">🧭 Âfâkî Tefekkür: Tabiat Kitabını Okumak (Kâinat Âyetleri)</div>' +
            '<div class="tnw-tefekkur-tabs" id="tnw-tefekkur-tabs">' +
              TEFEKKUR_PILLARS.map(function (p, i) {
                return (
                  '<button type="button" class="tnw-pillar-btn ' + (i === 0 ? 'active' : '') + '" data-pillar="' + esc(p.id) + '">' +
                    esc(p.icon + ' ' + p.title.split('(')[0].trim()) +
                  '</button>'
                );
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="tnw-tefekkur-body" id="tnw-tefekkur-body"></div>' +
        '</section>' +

        // Gemini AI Tabiat & Şifa Rotası Studio
        '<section class="tnw-ai-studio" id="tnw-ai-studio">' +
          '<div class="tnw-ai-header">' +
            '<div>' +
              '<h3 class="tnw-ai-title">✨ Gemini AI Tabiat &amp; Şifa Rotası Stüdyosu</h3>' +
              '<p class="tnw-ai-subtitle">Bölge, şifa/keşif odağı ve süre seçerek kütüphane çalışma disipliniyle uyumlu canlı rota oluşturun (çevrimdışı kürasyon yedekli).</p>' +
            '</div>' +
          '</div>' +
          '<div class="tnw-ai-controls">' +
            '<div class="tnw-field-group">' +
              '<label class="tnw-field-label" for="tnw-ai-focus">Rota Odağı</label>' +
              '<select id="tnw-ai-focus" class="tnw-select">' +
                '<option value="karma-tefekkur">🌿 Karma Tefekkür &amp; Yavaş Seyahat</option>' +
                '<option value="termal-sifa">♨️ Şifalı Termal Kaplıca &amp; Dinlenme</option>' +
                '<option value="kanyon-selale">🏞️ Kanyon, Vadi &amp; Şelale Keşfi</option>' +
                '<option value="magara-krater">🕳️ Mağara, Jeopark &amp; Krater Gölleri</option>' +
              '</select>' +
            '</div>' +
            '<div class="tnw-field-group">' +
              '<label class="tnw-field-label" for="tnw-ai-region">Bölge Tercihi</label>' +
              '<select id="tnw-ai-region" class="tnw-select">' + regionOptionsHtml + '</select>' +
            '</div>' +
            '<div class="tnw-field-group">' +
              '<label class="tnw-field-label" for="tnw-ai-anchor">Merkez Durak (İsteğe Bağlı)</label>' +
              '<select id="tnw-ai-anchor" class="tnw-select">' + anchorOptionsHtml + '</select>' +
            '</div>' +
            '<button type="button" id="tnw-ai-generate-btn" class="tnw-ai-generate-btn">' +
              '✨ Gemini AI ile Tabiat &amp; Şifa Rotası Oluştur' +
            '</button>' +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">' +
            '<span class="tnw-chip-label">Süre:</span>' +
            '<button type="button" class="tnw-chip" data-ai-days="3">🗓️ 3 Gün (Hafta Sonu)</button>' +
            '<button type="button" class="tnw-chip active-cat" data-ai-days="5">🗓️ 5 Gün (Seyyah Standardı)</button>' +
            '<button type="button" class="tnw-chip" data-ai-days="7">🗓️ 7 Gün (Büyük Keşif)</button>' +
          '</div>' +
          '<div class="tnw-ai-output-wrap" id="tnw-ai-output-wrap" style="display:none;">' +
            '<div class="tnw-ai-output-bar">' +
              '<span class="tnw-status-pill" id="tnw-ai-status">⏳ Hazırlanıyor...</span>' +
              '<div class="tnw-ai-actions">' +
                '<button type="button" class="tnw-mini-btn" id="tnw-ai-refresh-btn">🔄 Yeniden Oluştur</button>' +
                '<button type="button" class="tnw-mini-btn" id="tnw-ai-copy-btn">📋 Rotayı Kopyala</button>' +
              '</div>' +
            '</div>' +
            '<div class="tnw-ai-markdown" id="tnw-ai-markdown"></div>' +
            '<div class="tnw-route-jumps" id="tnw-route-jumps" style="display:none;"></div>' +
          '</div>' +
        '</section>' +

        // Search & Filter Controls
        '<section class="tnw-controls">' +
          '<div class="tnw-search-row">' +
            '<div class="tnw-search-box">' +
              '<span class="tnw-search-icon">🔍</span>' +
              '<input type="text" id="tnw-search-input" class="tnw-search-input" placeholder="Kanyon, şelale, mağara, kaplıca, mineral veya şehir ara (örn: Salda, Ihlara, kükürt, Kastamonu)..." />' +
              '<button type="button" id="tnw-search-clear" class="tnw-search-clear" title="Aramayı temizle">✕</button>' +
            '</div>' +
            '<select id="tnw-visit-select" class="tnw-select" aria-label="Ziyaret durumu filtresi">' +
              '<option value="all">🧭 Tümü (Gezilen &amp; Bekleyen İller)</option>' +
              '<option value="visited">✓ Yalnızca Gezdiğim İllerdeki Harikalar</option>' +
              '<option value="pending">⏳ Henüz Gitmediğim İllerdeki Harikalar</option>' +
            '</select>' +
          '</div>' +

          '<div class="tnw-chip-bar" id="tnw-cat-chips">' +
            '<span class="tnw-chip-label">Kategori:</span>' +
            CATEGORIES.map(function (c) {
              return (
                '<button type="button" class="tnw-chip ' + (c.id === 'all' ? 'active-cat' : '') + '" data-cat="' + esc(c.id) + '">' +
                  esc(c.label) +
                  '<span class="tnw-chip-count">' + (stats.catCounts[c.id] || 0) + '</span>' +
                '</button>'
              );
            }).join('') +
          '</div>' +

          '<div class="tnw-chip-bar" id="tnw-region-chips">' +
            '<span class="tnw-chip-label">Bölge:</span>' +
            REGIONS.map(function (r) {
              return (
                '<button type="button" class="tnw-chip ' + (r.code === 'all' ? 'active-region' : '') + '" data-region="' + esc(r.code) + '">' +
                  esc(r.icon + ' ' + r.shortLabel) +
                  '<span class="tnw-chip-count">' + (stats.regCounts[r.code] || 0) + '</span>' +
                '</button>'
              );
            }).join('') +
          '</div>' +

          '<div class="tnw-chip-bar" id="tnw-season-chips">' +
            '<span class="tnw-chip-label">Mevsim:</span>' +
            SEASONS.map(function (s) {
              return (
                '<button type="button" class="tnw-chip ' + (s.id === 'all' ? 'active-season' : '') + '" data-season="' + esc(s.id) + '">' +
                  esc(s.label) +
                  '<span class="tnw-chip-count">' + (stats.seasonCounts[s.id] || 0) + '</span>' +
                '</button>'
              );
            }).join('') +
          '</div>' +

          '<div class="tnw-results-meta">' +
            '<span id="tnw-results-count"></span>' +
            '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
              '<button type="button" id="tnw-build-route-btn" class="tnw-route-cta">🧭 Seçili Tabiat Harikalarından Rota Oluştur</button>' +
              '<button type="button" id="tnw-reset-filters" class="tnw-mini-btn">↺ Filtreleri Sıfırla</button>' +
            '</div>' +
          '</div>' +
        '</section>' +

        // Main Grid
        '<section id="tnw-grid-container"></section>' +
      '</div>';

    // Bind Philosophical Tabs
    container.querySelectorAll('#tnw-tefekkur-tabs .tnw-pillar-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        uiState.pillarId = btn.getAttribute('data-pillar') || TEFEKKUR_PILLARS[0].id;
        container.querySelectorAll('#tnw-tefekkur-tabs .tnw-pillar-btn').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
        renderTefekkurBody();
      });
    });

    // Bind AI Studio Controls
    const aiFocusSel = container.querySelector('#tnw-ai-focus');
    const aiRegionSel = container.querySelector('#tnw-ai-region');
    const aiAnchorSel = container.querySelector('#tnw-ai-anchor');
    const aiGenBtn = container.querySelector('#tnw-ai-generate-btn');
    const aiRefreshBtn = container.querySelector('#tnw-ai-refresh-btn');
    const aiCopyBtn = container.querySelector('#tnw-ai-copy-btn');

    if (aiFocusSel) {
      aiFocusSel.addEventListener('change', function () {
        uiState.aiFocus = aiFocusSel.value || 'karma-tefekkur';
      });
    }
    if (aiRegionSel) {
      aiRegionSel.addEventListener('change', function () {
        uiState.aiRegion = aiRegionSel.value || 'all';
      });
    }
    if (aiAnchorSel) {
      aiAnchorSel.addEventListener('change', function () {
        uiState.aiAnchorId = aiAnchorSel.value || '';
      });
    }

    container.querySelectorAll('[data-ai-days]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        uiState.aiDays = btn.getAttribute('data-ai-days') || '5';
        container.querySelectorAll('[data-ai-days]').forEach(function (b) {
          b.classList.toggle('active-cat', b === btn);
        });
      });
    });

    if (aiGenBtn) {
      aiGenBtn.addEventListener('click', function () {
        generateRoute(false);
      });
    }
    if (aiRefreshBtn) {
      aiRefreshBtn.addEventListener('click', function () {
        generateRoute(true);
      });
    }
    if (aiCopyBtn) {
      aiCopyBtn.addEventListener('click', function () {
        if (!uiState.aiText) return;
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(uiState.aiText)
            .then(function () {
              showToast('Tabiat & şifa rotası panoya kopyalandı.');
            })
            .catch(function () {});
        }
      });
    }

    // Bind Filter & Search Controls
    const searchInput = container.querySelector('#tnw-search-input');
    const searchClear = container.querySelector('#tnw-search-clear');
    const visitSelect = container.querySelector('#tnw-visit-select');
    const resetBtn = container.querySelector('#tnw-reset-filters');

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        uiState.search = searchInput.value || '';
        updateGrid();
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', function () {
        uiState.search = '';
        if (searchInput) searchInput.value = '';
        updateGrid();
      });
    }
    if (visitSelect) {
      visitSelect.addEventListener('change', function () {
        uiState.onlyVisited = visitSelect.value || 'all';
        updateGrid();
      });
    }

    container.querySelectorAll('#tnw-cat-chips .tnw-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        uiState.category = chip.getAttribute('data-cat') || 'all';
        container.querySelectorAll('#tnw-cat-chips .tnw-chip').forEach(function (c) {
          c.classList.toggle('active-cat', c === chip);
        });
        updateGrid();
      });
    });

    container.querySelectorAll('#tnw-region-chips .tnw-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        uiState.region = chip.getAttribute('data-region') || 'all';
        container.querySelectorAll('#tnw-region-chips .tnw-chip').forEach(function (c) {
          c.classList.toggle('active-region', c === chip);
        });
        updateGrid();
      });
    });

    container.querySelectorAll('#tnw-season-chips .tnw-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        uiState.season = chip.getAttribute('data-season') || 'all';
        container.querySelectorAll('#tnw-season-chips .tnw-chip').forEach(function (c) {
          c.classList.toggle('active-season', c === chip);
        });
        updateGrid();
      });
    });

    const buildRouteBtn = container.querySelector('#tnw-build-route-btn');
    if (buildRouteBtn) {
      buildRouteBtn.addEventListener('click', function () {
        const filtered = getFilteredWonders();
        const keys = [];
        if (uiState.region === '07_GuneydoguAnadolu' && filtered.length === 0) {
          SOUTHEAST_COMPLEMENTARY.forEach(function (item) {
            if (item.provinceKey && provinces[item.provinceKey] && keys.indexOf(item.provinceKey) === -1) {
              keys.push(item.provinceKey);
            }
          });
        } else {
          filtered.forEach(function (w) {
            if (w.provinceKey && keys.indexOf(w.provinceKey) === -1) {
              keys.push(w.provinceKey);
            }
          });
        }
        if (keys.length) {
          dispatchRouteCities(
            safeCtx,
            keys,
            '🧭 ' + keys.length + ' illik Tabiat & Şifa rotası oluşturuldu!'
          );
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        uiState.category = 'all';
        uiState.region = 'all';
        uiState.season = 'all';
        uiState.search = '';
        uiState.onlyVisited = 'all';
        if (searchInput) searchInput.value = '';
        if (visitSelect) visitSelect.value = 'all';
        container.querySelectorAll('#tnw-cat-chips .tnw-chip').forEach(function (c) {
          c.classList.toggle('active-cat', c.getAttribute('data-cat') === 'all');
        });
        container.querySelectorAll('#tnw-region-chips .tnw-chip').forEach(function (c) {
          c.classList.toggle('active-region', c.getAttribute('data-region') === 'all');
        });
        container.querySelectorAll('#tnw-season-chips .tnw-chip').forEach(function (c) {
          c.classList.toggle('active-season', c.getAttribute('data-season') === 'all');
        });
        updateGrid();
      });
    }

    renderTefekkurBody();
    updateGrid();
  }

  window.SEYYAH_MODULES.natureWonders = {
    render: render,
    WONDERS: WONDERS
  };
})();
