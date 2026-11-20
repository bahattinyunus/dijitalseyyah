/**
 * 81 İl Mevsim & 12 Aylık Seyahat Takvimi Modülü
 * Anadolu Seyahatnamesi — Bölge İklim Matrisi, Öne Çıkan İller & GSB Seyahatsever Takvimi
 * Registers on window.SEYYAH_MODULES.seasons = { render(container, ctx) }
 */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---------------------------------------------------------------------------
  // 1. STATIC METADATA: REGIONS, SEASONS, 12 MONTHS, CLIMATE MATRIX & STANDOUTS
  // ---------------------------------------------------------------------------

  const DEFAULT_REGIONS = {
    '01_Marmara': { name: 'Marmara Bölgesi', short: 'Marmara', icon: '🏰', color: '#38bdf8' },
    '02_Ege': { name: 'Ege Bölgesi', short: 'Ege', icon: '🌊', color: '#34d399' },
    '03_Akdeniz': { name: 'Akdeniz Bölgesi', short: 'Akdeniz', icon: '☀️', color: '#f59e0b' },
    '04_IcAnadolu': { name: 'İç Anadolu Bölgesi', short: 'İç Anadolu', icon: '🌾', color: '#fbbf24' },
    '05_Karadeniz': { name: 'Karadeniz Bölgesi', short: 'Karadeniz', icon: '🌲', color: '#10b981' },
    '06_DoguAnadolu': { name: 'Doğu Anadolu Bölgesi', short: 'Doğu Anadolu', icon: '🏔️', color: '#a855f7' },
    '07_GuneydoguAnadolu': { name: 'Güneydoğu Anadolu Bölgesi', short: 'Güneydoğu', icon: '🏜️', color: '#f97316' }
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

  const SEASONS = [
    {
      id: 'spring',
      name: 'İlkbahar',
      pillLabel: '🌸 İlkbahar',
      icon: '🌸',
      months: [2, 3, 4], // Mart, Nisan, Mayıs
      accent: '#34d399',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(56, 189, 248, 0.18) 100%)',
      tempRange: '14°C – 24°C',
      gsbStatus: 'plan',
      gsbText: 'GSB Seyahatsever yazın (Temmuz–Ağustos) başlar; bahar rotaları için erken planlama dönemi!',
      headline: 'Mezopotamya’da Bahar, Ege & Akdeniz’de Çiçek Mevsimi',
      summary:
        'Yazın kavurucu sıcakları gelmeden Güneydoğu’nun kadim taş şehirleri (Mardin, Şanlıurfa, Gaziantep) ve Hatay en ideal iklimini yaşar. Ege ve Akdeniz kıyıları badem ve portakal çiçekleriyle uyanırken, İstanbul erguvan ve lale mevsimine girer.'
    },
    {
      id: 'summer',
      name: 'Yaz',
      pillLabel: '☀️ Yaz (GSB Seyahatsever Dönemi!)',
      icon: '☀️',
      months: [5, 6, 7], // Haziran, Temmuz, Ağustos
      accent: '#f59e0b',
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.24) 0%, rgba(16, 185, 129, 0.2) 100%)',
      tempRange: '20°C – 34°C',
      gsbStatus: 'active',
      gsbText: '🎒 GSB Seyahatsever Dönemi Aktif! (Temmuz–Ağustos) 18–30 yaş gençlere 81 ilde ücretsiz KYK yurdu imkânı.',
      headline: 'Karadeniz Yaylalarında Bulut Denizi & GSB Seyahatsever Seferleri',
      summary:
        'Sıcaktan kaçmak isteyen seyyahlar için Rize, Artvin, Trabzon, Ordu ve Giresun yaylaları 18–24°C serinliğiyle zirvededir. Temmuz–Ağustos aylarında GSB Seyahatsever projesi sayesinde 81 ilde ücretsiz konaklama ile uzun Anadolu seferleri yapılabilir.'
    },
    {
      id: 'autumn',
      name: 'Sonbahar',
      pillLabel: '🍂 Sonbahar',
      icon: '🍂',
      months: [8, 9, 10], // Eylül, Ekim, Kasım
      accent: '#f97316',
      gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.24) 0%, rgba(245, 158, 11, 0.18) 100%)',
      tempRange: '13°C – 25°C',
      gsbStatus: 'plan',
      gsbText: 'GSB Seyahatsever sona erdi; kütüphane & kültür odaklı sakin sonbahar seferlerinin altın çağı.',
      headline: 'Altın Yapraklar, Sarı Yaz ve Mezopotamya’ya Dönüş',
      summary:
        'Bolu Yedigöller, Nevşehir Kapadokya ve Amasya Yeşilırmak kıyısı sonbaharın en fotojenik renklerine bürünür. Eylül–Ekim’de Antalya, Muğla ve İzmir’de kalabalıksız “Sarı Yaz” yaşanırken, Mardin–Urfa–Antep hattı tekrar serinleyip seyahate açılır.'
    },
    {
      id: 'winter',
      name: 'Kış',
      pillLabel: '❄️ Kış',
      icon: '❄️',
      months: [11, 0, 1], // Aralık, Ocak, Şubat
      accent: '#38bdf8',
      gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.24) 0%, rgba(168, 85, 247, 0.2) 100%)',
      tempRange: '-8°C – 15°C',
      gsbStatus: 'plan',
      gsbText: 'Kış dönemi: Doğu Ekspresi, termal şehirler ve ılıman Akdeniz kaçamakları için ideal sezon.',
      headline: 'Doğu Ekspresi Kar Masalı, Donmuş Çıldır & Ilıman Akdeniz',
      summary:
        'Kars, Erzurum ve Ardahan bembeyaz kar örtüsü, donmuş Çıldır Gölü ve Palandöken pistleriyle kışın başkentleridir. Soğuktan kaçmak isteyenler için Antalya, Mersin ve Adana ılıman kış güneşi; Afyonkarahisar, Bursa ve Yalova şifalı termal sular sunar.'
    }
  ];

  // Monthly metadata (0 = Ocak ... 11 = Aralık)
  const MONTHS = [
    {
      index: 0,
      name: 'Ocak',
      short: 'Oca',
      seasonId: 'winter',
      icon: '❄️',
      tempRange: '-10°C – 14°C',
      gsbStatus: 'inactive',
      gsbText: 'GSB Seyahatsever Dönemi: Temmuz–Ağustos (Kış Seferi Planlama)',
      title: 'Kar Masalı, Donmuş Çıldır Gölü & Termal Sıcaklığı',
      highlight:
        'Doğu Ekspresi’nin en görkemli ayı! Kars’ta Ani Harabeleri kar altında parlar, Ardahan’da Çıldır Gölü buz tutar, Erzurum Palandöken’de kayak zirvededir. Güneyde ise Antalya ve Mersin güneşli ılıman günler sunar.',
      tip: 'Doğu Anadolu için termal içlik & su geçirmez bot şart; Akdeniz sahillerinde ise ince montla kütüphane ve antik kent gezisi yapılabilir.'
    },
    {
      index: 1,
      name: 'Şubat',
      short: 'Şub',
      seasonId: 'winter',
      icon: '🌨️',
      tempRange: '-7°C – 16°C',
      gsbStatus: 'inactive',
      gsbText: 'GSB Seyahatsever Dönemi: Temmuz–Ağustos (Kış & Erken Bahar)',
      title: 'Kış Sporlarının Zirvesi & Datça’da İlk Badem Çiçekleri',
      highlight:
        'Kars, Erzurum, Kayseri (Erciyes) ve Bursa (Uludağ) kar kalitesinin en yüksek olduğu dönemdedir. Ayın ikinci yarısında Muğla Datça’da badem çiçekleri açarak Anadolu’ya baharı müjdeler.',
      tip: 'Şubat ortasında Datça Badem Çiçeği şenlikleri veya Erzurum–Kars kış rotası arasında iki zıt mevsimi aynı ülkede yaşayabilirsiniz.'
    },
    {
      index: 2,
      name: 'Mart',
      short: 'Mar',
      seasonId: 'spring',
      icon: '🌱',
      tempRange: '8°C – 20°C',
      gsbStatus: 'inactive',
      gsbText: 'GSB Seyahatsever Dönemi: Temmuz–Ağustos (Bahar Hazırlığı)',
      title: 'Nevruz Uyanışı, Çanakkale Ruhu & Mezopotamya’ya İlk Adım',
      highlight:
        'Anadolu’da baharın kapısı aralanır. 18 Mart ruhuyla Çanakkale, ılıman havasıyla Adana, Hatay ve Mersin canlanır. Şanlıurfa ve Mardin’de gündüz sıcaklıkları yürüyüş için kusursuz seviyelere ulaşır.',
      tip: 'Mart ayı değişken yağışlar getirebilir; katmanlı giyim (soğan tekniği) ve hafif yağmurluk hayat kurtarır.'
    },
    {
      index: 3,
      name: 'Nisan',
      short: 'Nis',
      seasonId: 'spring',
      icon: '🌷',
      tempRange: '13°C – 23°C',
      gsbStatus: 'inactive',
      gsbText: 'GSB Seyahatsever Dönemi: Temmuz–Ağustos (Yaz Rotanı Şimdiden Çiz)',
      title: 'Güneydoğu’nun Altın Ayı, Portakal Çiçeği & İstanbul Laleleri',
      highlight:
        'Türkiye’de kültür seyahatinin en bereketli aylarından biri! Mardin, Şanlıurfa, Gaziantep ve Hatay kavurucu sıcaklar başlamadan yemyeşil ve serindir. Adana Portakal Çiçeği Karnavalı ve İstanbul Lale Festivali Nisan’a damga vurur.',
      tip: 'Güneydoğu Anadolu ve Kapadokya için Nisan, yılın en ideal iki ayından biridir (diğeri Ekim).'
    },
    {
      index: 4,
      name: 'Mayıs',
      short: 'May',
      seasonId: 'spring',
      icon: '🌺',
      tempRange: '17°C – 27°C',
      gsbStatus: 'soon',
      gsbText: 'GSB Seyahatsever’e 2 Ay Kaldı! (Temmuz–Ağustos)',
      title: 'Ege & Akdeniz’in En Tatlı Baharı, Gül Hasadı & Doğa Yürüyüşü',
      highlight:
        'Deniz suyu ısınmaya başlarken yaz kalabalığı henüz gelmemiştir. Antalya (Likya Yolu), Muğla ve İzmir bahar ışığıyla parlar; Isparta’da gül bahçeleri mis gibi kokar; Nevşehir ve Amasya yemyeşildir.',
      tip: 'Mayıs sonu hem Ege–Akdeniz antik kentlerini bunalmadan gezmek hem de Isparta gül hasadını yakalamak için mükemmeldir.'
    },
    {
      index: 5,
      name: 'Haziran',
      short: 'Haz',
      seasonId: 'summer',
      icon: '☀️',
      tempRange: '20°C – 31°C',
      gsbStatus: 'soon',
      gsbText: '⏳ GSB Seyahatsever Başlamak Üzere! (Temmuz–Ağustos’ta 81 İl Ücretsiz Yurt)',
      title: 'Karadeniz Yaylaları Açılıyor, Lavanta & Uzun Günler',
      highlight:
        'Karadeniz yaylalarındaki karlar eriyip çiçek açar: Rize, Artvin, Trabzon ve Ordu’da bulutların üstünde yürüyüş başlar. Isparta’da gül ve erken lavanta dönemi, Ege’de ise en berrak deniz günleri yaşanır.',
      tip: 'Haziran’da günler yılın en uzun süresindedir; sabah kütüphane mesaisi yapıp akşam 20:00’ye kadar şehir keşfine vakit kalır.'
    },
    {
      index: 6,
      name: 'Temmuz',
      short: 'Tem',
      seasonId: 'summer',
      icon: '🎒',
      tempRange: '21°C – 35°C',
      gsbStatus: 'active',
      gsbText: '🎒 GSB SEYAHATSEVER AKTİF! 81 İlde 5 Gün Ücretsiz KYK Yurdu (Temmuz–Ağustos)',
      title: 'GSB Seyahatsever Başladı! Yayla Serinliği & Lavanta Tarlaları',
      highlight:
        'Genç gezginlerin bayramı GSB Seyahatsever aktif! Güneydeki yüksek sıcaklıklardan kaçmak için Rize, Artvin, Trabzon, Ordu, Giresun yaylaları ve Van Gölü kıyısı 20–25°C serinlik sunar. Isparta Kuyucak lavanta tarlaları mora bürünür.',
      tip: 'GSB Seyahatsever başvurunu 1 gün önceden 444 0 472 hattından yap; yayla rotalarında akşam serinliği için polarını unutma!'
    },
    {
      index: 7,
      name: 'Ağustos',
      short: 'Ağu',
      seasonId: 'summer',
      icon: '⛰️',
      tempRange: '21°C – 36°C',
      gsbStatus: 'active',
      gsbText: '🎒 GSB SEYAHATSEVER SON FIRSAT! Ağustos Sonuna Kadar 81 İlde Ücretsiz Yurt',
      title: 'Doğu Karadeniz Zirvesi, Kuzey Ege Esintisi & Yüksek Rakım Kaçamağı',
      highlight:
        'GSB Seyahatsever’in ikinci ve son ayı! Rize (Pokut, Ayder), Artvin (Macahel, Şavşat), Trabzon, Ordu ve Sinop en canlı yayla şenliklerine sahne olur. Doğu Anadolu’da Van, Kars ve Erzurum yüksek rakımıyla ferah bir yaz sunar.',
      tip: 'Ağustos sonuna kadar GSB yurt hakkını kullanarak Doğu Karadeniz veya Kuzey Ege (Çanakkale–Balıkesir) zincir rotası yapabilirsin.'
    },
    {
      index: 8,
      name: 'Eylül',
      short: 'Eyl',
      seasonId: 'autumn',
      icon: '🍇',
      tempRange: '18°C – 29°C',
      gsbStatus: 'inactive',
      gsbText: 'GSB Seyahatsever Dönemi Sona Erdi — Sakin “Sarı Yaz” Başladı',
      title: 'Sarı Yaz, Bağbozumu & Kalabalıksız Turkuaz Koylar',
      highlight:
        'Seyyahların gizli favori ayı! Antalya, Muğla ve İzmir’de deniz hâlâ sıcak ama yakıcı nem azalmıştır. Nevşehir Kapadokya ve Çanakkale Bozcaada’da bağbozumu başlar; Karadeniz yaylaları sisli ve huzurludur.',
      tip: 'Eylül’de hem Ege–Akdeniz’de denize girip hem de Kapadokya ve İç Anadolu kültür rotalarını bunalmadan tamamlayabilirsin.'
    },
    {
      index: 9,
      name: 'Ekim',
      short: 'Eki',
      seasonId: 'autumn',
      icon: '🍁',
      tempRange: '12°C – 24°C',
      gsbStatus: 'inactive',
      gsbText: 'GSB Seyahatsever Dönemi: Temmuz–Ağustos (Sonbahar Kültür Rotası)',
      title: 'Yaprak Dökümü Şöleni, Safran Hasadı & Mezopotamya Zirvesi',
      highlight:
        'Fotoğraf ve kültür tutkunlarının baş tacı! Bolu (Yedigöller, Abant), Nevşehir ve Amasya kızıl-sarı sonbahar paletine bürünür. Karabük Safranbolu’da safran çiçeği açar. Mardin, Şanlıurfa, Gaziantep ve Hatay 22°C ideal havaya döner.',
      tip: 'Ekim sonu Bolu Yedigöller ve Safranbolu rotası ile Güneydoğu kültür-gastronomi turu yılın en yüksek puanlı deneyimleridir.'
    },
    {
      index: 10,
      name: 'Kasım',
      short: 'Kas',
      seasonId: 'autumn',
      icon: '🍂',
      tempRange: '7°C – 19°C',
      gsbStatus: 'inactive',
      gsbText: 'GSB Seyahatsever Dönemi: Temmuz–Ağustos (Sakin Şehir & Kütüphane Ayı)',
      title: 'Geç Sonbahar Sükuneti, Kütüphane Mesaisi & Ilıman Güney',
      highlight:
        'Bolu, Amasya ve Kastamonu’da yaprak dökümünün son büyüsü yaşanırken, Antalya, Mersin, Adana, Hatay ve Gaziantep hâlâ güneşli ve 18–22°C bandındadır. Eskişehir, Konya ve Ankara’da müze & kütüphane seferleri için sakin bir dönemdir.',
      tip: 'Kasım ayında doğu yükseklerinde ilk kar düşmeye başlar; güney illeri ve büyük kültür başkentleri konforlu alternatiflerdir.'
    },
    {
      index: 11,
      name: 'Aralık',
      short: 'Ara',
      seasonId: 'winter',
      icon: '☃️',
      tempRange: '-4°C – 15°C',
      gsbStatus: 'inactive',
      gsbText: 'GSB Seyahatsever Dönemi: Temmuz–Ağustos (Şeb-i Arus & Kış Başlangıcı)',
      title: 'Şeb-i Arus, İlk Kar & Doğu Ekspresi Sezon Açılışı',
      highlight:
        'Konya’da 7–17 Aralık Şeb-i Arus törenleriyle maneviyat zirveye çıkar. Kars, Erzurum ve Ardahan’da kış masalı ve Doğu Ekspresi seferleri başlar. Bursa Uludağ, Bolu Kartalkaya ve Kayseri Erciyes sezon açılışını yapar.',
      tip: 'Aralık’ta Konya Şeb-i Arus + Nevşehir Kapadokya karlı peri bacaları kombinasyonu unutulmaz bir kış başlangıcıdır.'
    }
  ];

  // Region Climate Matrix: for each region_code -> array of 12 months { temp: 'min°–max°C', score: 1..3, tag: '...' }
  // score: 3 = Zirve / İdeal, 2 = Güzel / Uygun, 1 = Zorlu / Alternatif
  const REGION_CLIMATE = {
    '01_Marmara': [
      { temp: '4°–10°C', score: 2, tag: 'Termal & Müze' },
      { temp: '5°–11°C', score: 2, tag: 'Kış & Uludağ' },
      { temp: '7°–14°C', score: 2, tag: 'Erken Bahar' },
      { temp: '11°–19°C', score: 3, tag: 'Lale & Erguvan' },
      { temp: '15°–24°C', score: 3, tag: 'İdeal Bahar' },
      { temp: '20°–28°C', score: 3, tag: 'Yaz Başlangıcı' },
      { temp: '22°–30°C', score: 2, tag: 'Kuzey Ege & Kıyı' },
      { temp: '22°–30°C', score: 2, tag: 'Esintili Yaz' },
      { temp: '18°–26°C', score: 3, tag: 'Sarı Yaz' },
      { temp: '14°–21°C', score: 3, tag: 'Sonbahar Kültür' },
      { temp: '9°–16°C', score: 2, tag: 'Sakin Şehir' },
      { temp: '5°–11°C', score: 2, tag: 'Kış & Tarih' }
    ],
    '02_Ege': [
      { temp: '6°–13°C', score: 2, tag: 'Termal & Ilıman' },
      { temp: '7°–15°C', score: 2, tag: 'Badem Çiçeği' },
      { temp: '10°–18°C', score: 3, tag: 'Bahar Uyanışı' },
      { temp: '14°–22°C', score: 3, tag: 'Antik Kent İdeal' },
      { temp: '18°–27°C', score: 3, tag: 'Zirve Bahar' },
      { temp: '23°–32°C', score: 3, tag: 'Berrak Deniz' },
      { temp: '26°–35°C', score: 2, tag: 'Sıcak Kıyı' },
      { temp: '26°–35°C', score: 2, tag: 'Deniz & Koy' },
      { temp: '21°–30°C', score: 3, tag: 'Sarı Yaz Zirve' },
      { temp: '16°–25°C', score: 3, tag: 'İdeal Sonbahar' },
      { temp: '11°–19°C', score: 2, tag: 'Sakin Ege' },
      { temp: '7°–14°C', score: 2, tag: 'Ilıman Kış' }
    ],
    '03_Akdeniz': [
      { temp: '8°–16°C', score: 3, tag: 'Kış Güneşi' },
      { temp: '9°–17°C', score: 3, tag: 'Ilıman Kaçamak' },
      { temp: '12°–20°C', score: 3, tag: 'Bahar Başlangıcı' },
      { temp: '16°–24°C', score: 3, tag: 'Portakal Çiçeği' },
      { temp: '20°–28°C', score: 3, tag: 'Likya & Deniz' },
      { temp: '24°–33°C', score: 2, tag: 'Gül & Lavanta' },
      { temp: '27°–36°C', score: 1, tag: 'Yüksek Sıcak' },
      { temp: '27°–36°C', score: 1, tag: 'Toros Yaylaları' },
      { temp: '23°–32°C', score: 3, tag: 'Sarı Yaz' },
      { temp: '18°–27°C', score: 3, tag: 'Zirve Sonbahar' },
      { temp: '13°–22°C', score: 3, tag: 'Ilıman Kültür' },
      { temp: '9°–17°C', score: 2, tag: 'Kış Güneşi' }
    ],
    '04_IcAnadolu': [
      { temp: '-4°–4°C', score: 2, tag: 'Erciyes & Kar' },
      { temp: '-3°–6°C', score: 2, tag: 'Kış & Termal' },
      { temp: '1°–12°C', score: 2, tag: 'Erken Bahar' },
      { temp: '6°–18°C', score: 3, tag: 'Bozkır Baharı' },
      { temp: '11°–23°C', score: 3, tag: 'Kapadokya İdeal' },
      { temp: '15°–27°C', score: 3, tag: 'Serin Akşamlar' },
      { temp: '18°–31°C', score: 2, tag: 'Kuru Yaz' },
      { temp: '18°–31°C', score: 2, tag: 'Kültür & Müze' },
      { temp: '14°–27°C', score: 3, tag: 'Bağbozumu' },
      { temp: '8°–20°C', score: 3, tag: 'Altın Sonbahar' },
      { temp: '3°–13°C', score: 2, tag: 'Kütüphane & İrfan' },
      { temp: '-2°–6°C', score: 2, tag: 'Şeb-i Arus & Kar' }
    ],
    '05_Karadeniz': [
      { temp: '2°–9°C', score: 1, tag: 'Kartalkaya & Kar' },
      { temp: '2°–10°C', score: 1, tag: 'Kış Sisleri' },
      { temp: '5°–13°C', score: 2, tag: 'Uyanan Orman' },
      { temp: '9°–17°C', score: 2, tag: 'Yeşil Bahar' },
      { temp: '13°–21°C', score: 3, tag: 'Çiçekli Yayla' },
      { temp: '17°–25°C', score: 3, tag: 'Yayla Açılışı' },
      { temp: '19°–26°C', score: 3, tag: 'Yayla Zirvesi' },
      { temp: '19°–26°C', score: 3, tag: 'Bulut Denizi' },
      { temp: '16°–23°C', score: 3, tag: 'Sisli Sonbahar' },
      { temp: '11°–18°C', score: 3, tag: 'Yaprak Dökümü' },
      { temp: '6°–13°C', score: 2, tag: 'Geç Sonbahar' },
      { temp: '3°–10°C', score: 1, tag: 'Kış Başlangıcı' }
    ],
    '06_DoguAnadolu': [
      { temp: '-12°–-2°C', score: 3, tag: 'Doğu Ekspresi' },
      { temp: '-10°–0°C', score: 3, tag: 'Donmuş Çıldır' },
      { temp: '-4°–6°C', score: 1, tag: 'Kar Erimesi' },
      { temp: '3°–13°C', score: 2, tag: 'Erken Bahar' },
      { temp: '8°–19°C', score: 2, tag: 'Ters Lale' },
      { temp: '13°–25°C', score: 3, tag: 'Serin Yüksekler' },
      { temp: '16°–28°C', score: 3, tag: 'Ferah Yayla' },
      { temp: '16°–28°C', score: 3, tag: 'Van & Zirveler' },
      { temp: '11°–24°C', score: 3, tag: 'Berrak Sonbahar' },
      { temp: '5°–16°C', score: 2, tag: 'Munzur Renkleri' },
      { temp: '-1°–9°C', score: 1, tag: 'İlk Kar' },
      { temp: '-8°–1°C', score: 3, tag: 'Kış Masalı' }
    ],
    '07_GuneydoguAnadolu': [
      { temp: '2°–10°C', score: 1, tag: 'Serin Kış' },
      { temp: '4°–12°C', score: 2, tag: 'Sakin Kültür' },
      { temp: '8°–17°C', score: 3, tag: 'Bahar Kapısı' },
      { temp: '13°–23°C', score: 3, tag: 'Zirve Bahar' },
      { temp: '18°–29°C', score: 3, tag: 'İdeal Kültür' },
      { temp: '24°–36°C', score: 1, tag: 'Sıcak Başlar' },
      { temp: '27°–40°C', score: 1, tag: 'Çok Sıcak' },
      { temp: '27°–40°C', score: 1, tag: 'Çok Sıcak' },
      { temp: '21°–34°C', score: 2, tag: 'Sıcak Azalır' },
      { temp: '14°–25°C', score: 3, tag: 'Zirve Sonbahar' },
      { temp: '8°–18°C', score: 3, tag: 'İdeal Gastronomi' },
      { temp: '3°–11°C', score: 2, tag: 'Sakin Tarih' }
    ]
  };

  // Curated Standout Provinces by Province Name (matches travel_data.json exact Turkish names)
  // Each entry defines peak months (0-11), custom temp override per season, badge, and vivid travel reason.
  const STANDOUT_PROVINCES = {
    // --- KIŞ YILDIZLARI (Doğu Anadolu Kar & Kayak + Ilıman Kaçamak) ---
    'Kars': {
      months: [11, 0, 1, 6, 7],
      winterBadge: '🚂 Doğu Ekspresi Zirvesi',
      summerBadge: '🌿 1768m Serin Yayla',
      reasons: {
        winter: 'Kar altındaki Ani Harabeleri, donmuş Çıldır Gölü’nde atlı kızak ve Baltık mimarili sokaklarıyla Türkiye’nin kış başkenti.',
        summer: 'Yüksek rakımı sayesinde Temmuz–Ağustos’ta bunaltıcı sıcaklardan uzak, yemyeşil meralar ve gravyer rotası.'
      },
      tempBySeason: { winter: '-14°–-3°C', spring: '4°–15°C', summer: '12°–25°C', autumn: '3°–16°C' }
    },
    'Erzurum': {
      months: [11, 0, 1, 6, 7],
      winterBadge: '⛷️ Palandöken Kar Cenneti',
      summerBadge: '🏔️ Serin Yüksek Plato',
      reasons: {
        winter: 'Palandöken’in kristal karı, kar altında Çifte Minareli Medrese ve dumanı tüten cağ kebabı ile unutulmaz kış deneyimi.',
        summer: 'Tortum Şelalesi ve Narman Peribacaları yaz sıcağında serin ve ferah bir Doğu Anadolu keşfi sunar.'
      },
      tempBySeason: { winter: '-13°–-2°C', spring: '3°–14°C', summer: '13°–26°C', autumn: '4°–16°C' }
    },
    'Ardahan': {
      months: [11, 0, 1, 6, 7],
      winterBadge: '❄️ Donmuş Çıldır Gölü',
      summerBadge: '🌼 Kafkas Yaylaları',
      reasons: {
        winter: 'Buz tutan Çıldır Gölü üzerinde yürüyüş, sarı balık ziyafeti ve Yalnızçam’ın el değmemiş beyaz örtüsü.',
        summer: 'Yüzlerce endemik çiçekle bezeli yaylalar, Şeytan Kalesi ve Kafkas arı balı sezonu.'
      },
      tempBySeason: { winter: '-15°–-4°C', spring: '2°–13°C', summer: '10°–23°C', autumn: '2°–14°C' }
    },
    'Bursa': {
      months: [11, 0, 1, 3, 4, 9],
      winterBadge: '⛷️ Uludağ & Termal',
      springBadge: '🌸 İpek & Yeşil Bursa',
      autumnBadge: '🍂 Cumalıkızık Sonbaharı',
      reasons: {
        winter: 'Uludağ’da teleferikle kar keyfi, akşamında tarihi Osmanlı hamamlarında şifalı termal dinlenme.',
        spring: 'Gölyazı, Tirilye ve İznik Gölü kıyısında bahar yürüyüşleri ve Ulu Camii maneviyatı.',
        autumn: 'Cumalıkızık’ın taş sokakları ve Uludağ eteklerinde kestane kokulu sonbahar.'
      },
      tempBySeason: { winter: '2°–9°C', spring: '11°–21°C', summer: '20°–31°C', autumn: '12°–22°C' }
    },
    'Kayseri': {
      months: [11, 0, 1, 8, 9],
      winterBadge: '⛷️ Erciyes Kayak',
      autumnBadge: '🌾 Kapuzbaşı & Tarih',
      reasons: {
        winter: '3917 m Erciyes Kayak Merkezi’nde modern pistler, akşamında Selçuklu medreseleri ve mantı ziyafeti.',
        autumn: 'Soğanlı Vadisi, Sultan Sazlığı kuş göçü ve serin sonbahar günlerinde Gevher Nesibe keşfi.'
      },
      tempBySeason: { winter: '-5°–4°C', spring: '7°–19°C', summer: '16°–30°C', autumn: '8°–21°C' }
    },
    'Afyonkarahisar': {
      months: [11, 0, 1, 4, 9],
      winterBadge: '♨️ Termal Başkent',
      reasons: {
        winter: 'Soğuk kış günlerinde Türkiye’nin termal başkentinde şifalı kaplıcalar ve kaymaklı ekmek kadayıfı.',
        spring: 'Frig Vadisi’nin antik kaya anıtları ve çiçeklenen yaylalarında keyifli kültür yürüyüşü.',
        autumn: 'Serin sonbaharda Frig Vadisi ve Afyon Kalesi panoraması.'
      },
      tempBySeason: { winter: '-3°–6°C', spring: '8°–19°C', summer: '16°–29°C', autumn: '9°–20°C' }
    },

    // --- KARADENİZ YAZ YAYLALARI & SONBAHAR YAPRAK DÖKÜMÜ ---
    'Rize': {
      months: [5, 6, 7, 8],
      summerBadge: '☁️ Bulut Denizi Yaylaları',
      autumnBadge: '🌫️ Sisli Çay Bahçeleri',
      reasons: {
        summer: 'Pokut, Sal, Gito ve Ayder yaylalarında 18–22°C serinlik, Zilkale ve Fırtına Deresi’nde doğa şöleni.',
        autumn: 'Eylül’de kalabalıksız yaylalar, sis bulutları arasında Zilkale ve taze hasat çayı.'
      },
      tempBySeason: { winter: '4°–11°C', spring: '11°–19°C', summer: '19°–25°C', autumn: '14°–21°C' }
    },
    'Artvin': {
      months: [5, 6, 7, 8, 9],
      summerBadge: '🌲 Karagöl & Macahel',
      autumnBadge: '🍁 Şavşat Renk Şöleni',
      reasons: {
        summer: 'Borçka ve Şavşat Karagöl, UNESCO biyosfer rezervi Macahel ve yüksek yaylalarda oksijen deposu yaz.',
        autumn: 'Ekim ayında Şavşat ve Borçka ormanları Türkiye’nin en dramatik kızıl-sarı tablosuna dönüşür.'
      },
      tempBySeason: { winter: '1°–8°C', spring: '10°–18°C', summer: '17°–25°C', autumn: '11°–19°C' }
    },
    'Trabzon': {
      months: [5, 6, 7, 8],
      summerBadge: '⛰️ Sümela & Yaylalar',
      autumnBadge: '🌫️ Huzurlu Uzungöl',
      reasons: {
        summer: 'Sümela Manastırı, Hıdırnebi ve Sultan Murat yaylalarında sıcaklardan kaçıp serin Karadeniz havası solumak için birebir.',
        autumn: 'Eylül’de sakinleşen Uzungöl, Atatürk Köşkü ve Boztepe’de çay keyfi.'
      },
      tempBySeason: { winter: '5°–11°C', spring: '11°–18°C', summer: '20°–26°C', autumn: '14°–21°C' }
    },
    'Ordu': {
      months: [5, 6, 7, 8],
      summerBadge: '🌿 Perşembe & Çambaşı',
      autumnBadge: '🌰 Fındık & Boztepe',
      reasons: {
        summer: 'Menderesleriyle ünlü Perşembe Yaylası, Çambaşı ve Yason Burnu’nda rüzgarlı, serin Karadeniz yazı.',
        autumn: 'Boztepe’den teleferikle sonbahar gün batımı ve sakin sahil şeridi.'
      },
      tempBySeason: { winter: '4°–11°C', spring: '11°–18°C', summer: '19°–26°C', autumn: '14°–21°C' }
    },
    'Giresun': {
      months: [5, 6, 7],
      summerBadge: '💧 Mavi Göl & Kümbet',
      reasons: {
        summer: 'Kuzalan Şelalesi, turkuaz Mavi Göl, Kümbet ve Kulakkaya yaylalarında ferahlatıcı yaz rotası.'
      },
      tempBySeason: { winter: '5°–11°C', spring: '11°–18°C', summer: '20°–26°C', autumn: '14°–21°C' }
    },
    'Sinop': {
      months: [5, 6, 7, 8],
      summerBadge: '🌊 Hamsilos & Sakin Deniz',
      reasons: {
        summer: 'Türkiye’nin en mutlu şehrinde Hamsilos Fiyordu, Erfelek Tatlıca Şelaleleri ve bunaltmayan Karadeniz esintisi.'
      },
      tempBySeason: { winter: '4°–10°C', spring: '10°–17°C', summer: '19°–26°C', autumn: '13°–20°C' }
    },
    'Bolu': {
      months: [9, 10, 11, 0, 1, 6, 7],
      autumnBadge: '🍁 Yedigöller Zirvesi',
      winterBadge: '❄️ Abant & Kartalkaya',
      summerBadge: '🌲 Serin Göl Ormanları',
      reasons: {
        autumn: 'Yedigöller, Abant ve Gölcük’te Ekim–Kasım aylarında Türkiye’nin en ikonik sonbahar yaprak dökümü yaşanır.',
        winter: 'Kar altında masalsı Abant Gölü yürüyüşü ve Kartalkaya’da kayak keyfi.',
        summer: 'Büyük şehirlerin sıcağından kaçış için çam ormanları içinde serin göl kenarı molası.'
      },
      tempBySeason: { winter: '-4°–5°C', spring: '7°–18°C', summer: '15°–26°C', autumn: '8°–19°C' }
    },
    'Amasya': {
      months: [3, 4, 8, 9, 10],
      autumnBadge: '🍂 Yeşilırmak Sonbaharı',
      springBadge: '🌸 Şehzadeler Baharı',
      reasons: {
        autumn: 'Yeşilırmak kıyısındaki Yalıboyu konakları ve Kral Kaya Mezarları sonbaharın sarı-kızıl ışığında tablo gibidir.',
        spring: 'Elma çiçekleri açarken Harşena Kalesi ve Ferhat ile Şirin diyarı en taze mevsimini yaşar.'
      },
      tempBySeason: { winter: '0°–7°C', spring: '10°–21°C', summer: '18°–30°C', autumn: '10°–21°C' }
    },
    'Karabük': {
      months: [3, 4, 9, 10],
      autumnBadge: '🌼 Safran Hasadı & Konak',
      springBadge: '🏛️ UNESCO Safranbolu',
      reasons: {
        autumn: 'Ekim ayında dünyanın en nadide baharatı safranın hasat mevsimi! Sisli Safranbolu konakları ve Yenice Ormanları büyüleyicidir.',
        spring: 'Tokatlı Kanyonu ve Kristal Teras bahar yeşiliyle canlanır.'
      },
      tempBySeason: { winter: '0°–8°C', spring: '9°–20°C', summer: '17°–29°C', autumn: '10°–20°C' }
    },
    'Kastamonu': {
      months: [5, 6, 7, 9],
      summerBadge: '🏞️ Küre Kanyonları',
      autumnBadge: '🍁 Pınarbaşı Sonbaharı',
      reasons: {
        summer: 'Valla Kanyonu, Horma ahşap yürüyüş yolu ve Ilıca Şelalesi yaz sıcağında serin keşif imkânı verir.',
        autumn: 'Küre Dağları Milli Parkı Ekim’de benzersiz sonbahar renklerine bürünür.'
      },
      tempBySeason: { winter: '-3°–5°C', spring: '7°–18°C', summer: '15°–27°C', autumn: '8°–19°C' }
    },

    // --- GÜNEYDOĞU & HATAY İLKBAHAR & SONBAHAR ZİRVESİ ---
    'Mardin': {
      months: [2, 3, 4, 9, 10],
      springBadge: '🏛️ Mezopotamya Baharı',
      autumnBadge: '🌅 Altın Taş Sokaklar',
      reasons: {
        spring: 'Kavurucu yaz öncesi 18–24°C ideal havada Mezopotamya Ovası’na karşı taş sokaklar, Dara ve Midyat keşfi.',
        autumn: 'Ekim–Kasım’da yumuşayan güneş ışığıyla sarı kalker taşlarının en güzel parladığı, yürüyüşe en uygun dönem.'
      },
      tempBySeason: { winter: '1°–8°C', spring: '12°–22°C', summer: '25°–38°C', autumn: '13°–24°C' }
    },
    'Şanlıurfa': {
      months: [2, 3, 4, 9, 10],
      springBadge: '🗿 Göbeklitepe İdeal',
      autumnBadge: '🕯️ Balıklıgöl Sonbaharı',
      reasons: {
        spring: '12.000 yıllık Göbeklitepe, Karahantepe, Harran ve Halfeti’yi sıcaktan bunalmadan gezmenin en mükemmel zamanı.',
        autumn: 'Ekim ve Kasım’da 20–25°C aralığında Balıklıgöl akşamları, sıra geceleri ve açık hava arkeolojisi için zirve dönem.'
      },
      tempBySeason: { winter: '3°–11°C', spring: '14°–25°C', summer: '27°–41°C', autumn: '15°–26°C' }
    },
    'Gaziantep': {
      months: [2, 3, 4, 9, 10],
      springBadge: '🥙 Gastronomi Baharı',
      autumnBadge: '🌿 Fıstık & Kültür',
      reasons: {
        spring: 'Zeugma Mozaik Müzesi, Bakırcılar Çarşısı ve UNESCO gastronomi duraklarını yürüyerek keşfetmek için kusursuz hava.',
        autumn: 'Fıstık hasadı sonrası serinleyen çarşılarda beyran, baklava ve Rumkale tekne turu için en ideal aylar.'
      },
      tempBySeason: { winter: '1°–9°C', spring: '12°–23°C', summer: '24°–38°C', autumn: '13°–24°C' }
    },
    'Hatay': {
      months: [2, 3, 4, 9, 10],
      springBadge: '🍊 Medeniyetler Baharı',
      autumnBadge: '🍽️ Kadim Lezzet Rotası',
      reasons: {
        spring: 'Titus Tüneli, Musa Ağacı, Samandağ kıyısı ve eşsiz Hatay mutfağı bahar çiçekleriyle buluşur.',
        autumn: 'Yaz neminin dağıldığı Ekim–Kasım aylarında 20–24°C ılıman Akdeniz esintisiyle tarih ve kültür gezisi.'
      },
      tempBySeason: { winter: '6°–14°C', spring: '15°–24°C', summer: '25°–34°C', autumn: '16°–25°C' }
    },
    'Adıyaman': {
      months: [3, 4, 8, 9],
      springBadge: '🌄 Nemrut Gün Doğumu',
      autumnBadge: '⛰️ Kommagene Sonbaharı',
      reasons: {
        spring: 'Nemrut Dağı yolunun karlardan açılıp kavurucu sıcağın başlamadığı, gün doğumu için en berrak bahar haftaları.',
        autumn: 'Eylül–Ekim’de 2150 m Nemrut zirvesinde serin rüzgar eşliğinde dev heykeller arasında gün batımı.'
      },
      tempBySeason: { winter: '2°–9°C', spring: '12°–23°C', summer: '25°–39°C', autumn: '13°–25°C' }
    },
    'Diyarbakır': {
      months: [3, 4, 9, 10],
      springBadge: '🏰 Hevsel Baharı',
      autumnBadge: '🌉 On Gözlü Sonbahar',
      reasons: {
        spring: 'UNESCO Diyarbakır Surları, yemyeşil Hevsel Bahçeleri ve Ulu Camii avlusunda bahar serinliği.',
        autumn: 'Dicle kıyısında serin sonbahar akşamları ve tarihi hanlarda kahve molası.'
      },
      tempBySeason: { winter: '0°–8°C', spring: '11°–23°C', summer: '24°–40°C', autumn: '12°–25°C' }
    },

    // --- İÇ ANADOLU YILDIZLARI (Kapadokya, Konya, Eskişehir) ---
    'Nevşehir': {
      months: [3, 4, 8, 9, 10, 11],
      autumnBadge: '🎈 Kapadokya Altın Çağı',
      springBadge: '🌸 Balon & Vadi Baharı',
      winterBadge: '❄️ Karlı Peri Bacaları',
      reasons: {
        autumn: 'Eylül–Ekim bağbozumu, yumuşak gün doğumu ışığı ve sakin vadilerde sıcak hava balonu uçuşları için yılın zirvesi.',
        spring: 'Ihlara, Kızılçukur ve Aşk Vadisi’nde badem çiçekleri arasında doğa yürüyüşü.',
        winter: 'Aralık’ta karla kaplanan peri bacaları ve mağara otellerin büyülü atmosferi.'
      },
      tempBySeason: { winter: '-3°–5°C', spring: '8°–20°C', summer: '16°–30°C', autumn: '9°–21°C' }
    },
    'Konya': {
      months: [3, 4, 9, 10, 11],
      winterBadge: '🕯️ Şeb-i Arus (Aralık)',
      autumnBadge: '🕌 İrfan & Sükunet',
      springBadge: '🌷 Laleler & Sille',
      reasons: {
        winter: '7–17 Aralık Şeb-i Arus törenleriyle Mevlana diyarı yılın en derin manevi iklimini yaşar.',
        spring: 'Çatalhöyük, Sille ve Tropikal Kelebek Bahçesi bahar güneşiyle canlanır.',
        autumn: 'Bozkırın serin sonbaharında Alaeddin Tepesi, medreseler ve zengin kütüphane rotası.'
      },
      tempBySeason: { winter: '-3°–6°C', spring: '8°–20°C', summer: '17°–31°C', autumn: '9°–21°C' }
    },
    'Eskişehir': {
      months: [3, 4, 8, 9, 10],
      springBadge: '🚣 Porsuk Baharı',
      autumnBadge: '🎨 Odunpazarı Sonbaharı',
      reasons: {
        spring: 'Porsuk Çayı kıyısında yürüyüş, Odunpazarı Modern Müze ve Sazova Parkı için en canlı bahar dönemi.',
        autumn: 'Öğrenci şehrinin kültürel takviminin açıldığı, müze ve kütüphane dolu keyifli sonbahar.'
      },
      tempBySeason: { winter: '-3°–5°C', spring: '7°–19°C', summer: '15°–29°C', autumn: '8°–20°C' }
    },

    // --- AKDENİZ & EGE YILDIZLARI (İlkbahar, Geç Yaz / Sarı Yaz & Kış Güneşi) ---
    'Antalya': {
      months: [0, 1, 2, 3, 4, 8, 9, 10],
      springBadge: '🥾 Likya Yolu & Bahar',
      autumnBadge: '🌊 Sarı Yaz Zirvesi',
      winterBadge: '☀️ Kış Güneşi (15°C)',
      reasons: {
        spring: 'Kaleiçi, Termessos, Olympos ve Likya Yolu’nu 22°C ideal sıcaklıkta, portakal çiçeği kokularıyla keşfet.',
        autumn: 'Eylül–Ekim’de deniz hâlâ 24–26°C sıcaktır; yaz bunaltıcılığı olmadan Kaş, Kekova ve Aspendos’un tadını çıkar.',
        winter: 'Anadolu kar altındayken 15–17°C güneşli havasıyla yürüyüş, şelale ve antik kent kaçamağı.'
      },
      tempBySeason: { winter: '8°–16°C', spring: '15°–24°C', summer: '25°–35°C', autumn: '17°–27°C' }
    },
    'Muğla': {
      months: [1, 3, 4, 5, 8, 9],
      springBadge: '🌸 Datça & Saklı Koylar',
      autumnBadge: '⛵ Sarı Yaz Koyları',
      summerBadge: '🏖️ Turkuaz Sezon',
      winterBadge: '🌼 Badem Çiçeği (Şubat)',
      reasons: {
        winter: 'Şubat ayında Datça yarımadası badem çiçekleriyle beyaza bürünür.',
        spring: 'Akyaka, Fethiye, Kayaköy ve Knidos yaz yoğunluğu başlamadan en dingin ve berrak hâlindedir.',
        summer: 'Haziran’da en berrak deniz suyu ve uzun günlerde Ege–Akdeniz birleşimi.',
        autumn: 'Eylül–Ekim’de kalabalıksız koylar, ılık deniz ve Likya kaya mezarları yürüyüşü.'
      },
      tempBySeason: { winter: '6°–14°C', spring: '14°–23°C', summer: '23°–34°C', autumn: '16°–26°C' }
    },
    'İzmir': {
      months: [2, 3, 4, 5, 8, 9, 10],
      springBadge: '🏛️ Efes & Urla Baharı',
      autumnBadge: '🍇 Bağbozumu & Sarı Yaz',
      summerBadge: '🌬️ Çeşme & Foça Esintisi',
      reasons: {
        spring: 'Efes, Bergama, Şirince ve Urla Enginar Festivali ile baharın en neşeli Ege rotası.',
        summer: 'Kuzey rüzgarı alan Çeşme, Karaburun ve Foça koylarında deniz keyfi.',
        autumn: 'Eylül–Ekim’de sıcak deniz, Urla bağbozumu ve Kordon’da serin gün batımı.'
      },
      tempBySeason: { winter: '7°–14°C', spring: '14°–23°C', summer: '24°–34°C', autumn: '16°–25°C' }
    },
    'Isparta': {
      months: [4, 5, 6],
      springBadge: '🌹 Gül Hasadı (Mayıs–Haziran)',
      summerBadge: '💜 Lavanta Tarlaları (Temmuz)',
      reasons: {
        spring: 'Mayıs sonu–Haziran başında Türkiye’nin gül bahçesi mis gibi kokar; Eğirdir Gölü berraktır.',
        summer: 'Temmuz ayında Kuyucak Köyü lavanta tarlaları uçsuz bucaksız mora bürünür.'
      },
      tempBySeason: { winter: '-1°–7°C', spring: '9°–20°C', summer: '17°–30°C', autumn: '10°–21°C' }
    },
    'Adana': {
      months: [0, 1, 2, 3, 10, 11],
      springBadge: '🍊 Portakal Çiçeği (Nisan)',
      winterBadge: '☀️ Ilıman Kış & Lezzet',
      autumnBadge: '🌉 Taşköprü Sonbaharı',
      reasons: {
        spring: 'Nisan’da Portakal Çiçeği Karnavalı ile sokaklar mis kokar; Varda Köprüsü ve Belemedik yemyeşildir.',
        winter: 'Ilıman kış güneşi altında Seyhan kıyısı ve efsanevi Adana mutfağı.',
        autumn: 'Kasım’da bunaltıcı sıcaklar biter, Belemedik Vadisi sonbahar renklerine bürünür.'
      },
      tempBySeason: { winter: '6°–16°C', spring: '15°–25°C', summer: '25°–36°C', autumn: '16°–27°C' }
    },
    'Mersin': {
      months: [0, 1, 2, 3, 4, 9, 10],
      winterBadge: '☀️ Ilıman Akdeniz',
      springBadge: '🏛️ Kızkalesi & Kanyon',
      autumnBadge: '🌊 Uzun Deniz Sezonu',
      reasons: {
        winter: 'Kış ortasında 16°C güneşli havasıyla Tarsus, Kızkalesi ve Cennet–Cehennem obrukları gezilebilir.',
        spring: 'Saklı kanyonlar, şelaleler ve antik Soli–Elaiussa Sebaste kalıntıları için ideal mevsim.',
        autumn: 'Ekim sonuna kadar denize girilebilen ılık Akdeniz kıyısı.'
      },
      tempBySeason: { winter: '8°–16°C', spring: '15°–24°C', summer: '25°–34°C', autumn: '17°–26°C' }
    },

    // --- MARMARA & KUZEY EGE & DOĞU ANADOLU EK YILDIZLAR ---
    'İstanbul': {
      months: [3, 4, 8, 9, 10],
      springBadge: '🌷 Lale & Erguvan',
      autumnBadge: '🚢 Boğaz’da Sonbahar',
      reasons: {
        spring: 'Nisan’da Emirgan laleleri, Mayıs’ta Boğaz sırtlarında erguvanlar ve Tarihi Yarımada yürüyüşleri.',
        autumn: 'Eylül–Ekim’de Adalar, Süleymaniye ve boğaz vapurlarında en berrak sonbahar ışığı.'
      },
      tempBySeason: { winter: '5°–10°C', spring: '12°–20°C', summer: '21°–29°C', autumn: '14°–21°C' }
    },
    'Çanakkale': {
      months: [2, 3, 4, 5, 6, 7, 8],
      springBadge: '🕊️ Gelibolu & Truva',
      summerBadge: '🏝️ Bozcaada & Kaz Dağı',
      autumnBadge: '🍇 Bağbozumu (Eylül)',
      reasons: {
        spring: '18 Mart ruhuyla Gelibolu Yarımadası, Assos ve Truva antik kenti bahar rüzgarıyla karşılar.',
        summer: 'Gökçeada, Bozcaada ve Kaz Dağları’nın serin poyrazıyla bunaltmayan yaz tatili.',
        autumn: 'Eylül’de Bozcaada bağbozumu ve sakin Assos gün batımı.'
      },
      tempBySeason: { winter: '4°–10°C', spring: '11°–20°C', summer: '21°–31°C', autumn: '13°–22°C' }
    },
    'Balıkesir': {
      months: [4, 5, 6, 7, 8],
      summerBadge: '🌲 Kaz Dağları & Cunda',
      springBadge: '🦢 Manyas Kuş Cenneti',
      autumnBadge: '🫒 Zeytin Hasadı',
      reasons: {
        spring: 'Manyas Kuş Cenneti’nde göçmen kuşlar ve Kaz Dağları şelaleleri baharda coşar.',
        summer: 'Ayvalık, Cunda Adası ve Kaz Dağları oksijeniyle serin Kuzey Ege yazı.',
        autumn: 'Eylül’de sakin Cunda sokakları ve zeytin hasadı atmosferi.'
      },
      tempBySeason: { winter: '3°–10°C', spring: '11°–21°C', summer: '21°–31°C', autumn: '13°–22°C' }
    },
    'Edirne': {
      months: [3, 4, 5, 8, 9],
      springBadge: '🕌 Selimiye & Bahar',
      autumnBadge: '🌉 Meriç Sonbaharı',
      reasons: {
        spring: 'Mimar Sinan’ın ustalık eseri Selimiye, Meriç Köprüsü ve Karaağaç yemyeşil bahara bürünür.',
        autumn: 'Serin sonbahar günlerinde tarihi köprüler, külliyeler ve tava ciğer rotası.'
      },
      tempBySeason: { winter: '1°–8°C', spring: '11°–22°C', summer: '20°–32°C', autumn: '12°–22°C' }
    },
    'Van': {
      months: [4, 5, 6, 7, 8],
      summerBadge: '⛵ Akdamar & 1648m Serinlik',
      springBadge: '🌸 Badem Çiçekli Akdamar',
      autumnBadge: '🌅 Turkuaz Göl Sonbaharı',
      reasons: {
        spring: 'Nisan sonu–Mayıs’ta Akdamar Adası’ndaki badem ağaçları çiçek açar, arka planda karlı Süphan yükselir.',
        summer: '1648 m rakımdaki Van Gölü kıyısı Temmuz–Ağustos’ta ferah serinliği ve Van kahvaltısıyla harikadır.',
        autumn: 'Eylül’de berrak gökyüzü altında Van Kalesi ve Muradiye Şelalesi.'
      },
      tempBySeason: { winter: '-6°–3°C', spring: '6°–17°C', summer: '16°–28°C', autumn: '7°–19°C' }
    },
    'Tunceli': {
      months: [5, 6, 7, 8, 9],
      summerBadge: '💧 Munzur Gözeleri',
      autumnBadge: '🍁 Munzur Vadisi Renkleri',
      reasons: {
        summer: 'Buz gibi Munzur Gözeleri, Ovacık yaylaları ve kanyon sularıyla yazın en serin Doğu duraklarından.',
        autumn: 'Eylül–Ekim’de Munzur Vadisi Milli Parkı büyüleyici sonbahar renklerine bürünür.'
      },
      tempBySeason: { winter: '-4°–4°C', spring: '9°–20°C', summer: '19°–31°C', autumn: '10°–22°C' }
    }
  };

  // ---------------------------------------------------------------------------
  // 2. MODULE STATE
  // ---------------------------------------------------------------------------

  const currentMonthIdx = new Date().getMonth(); // 0..11, defaults to today's month!

  const uiState = {
    mode: 'month', // 'month' | 'season'
    selectedMonth: currentMonthIdx,
    selectedSeason: MONTHS[currentMonthIdx].seasonId,
    regionFilter: 'all',
    visitFilter: 'all', // 'all' | 'visited' | 'planned'
    showAll81: false
  };

  // ---------------------------------------------------------------------------
  // 3. STYLES (THEME-AWARE DARK & LIGHT, GLASSMORPHISM)
  // ---------------------------------------------------------------------------

  function ensureStyles() {
    if (document.getElementById('weather-season-guide-styles')) return;
    const style = document.createElement('style');
    style.id = 'weather-season-guide-styles';
    style.textContent = `
      .wsg-view {
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 1200px;
        margin: 0 auto;
        padding-bottom: 36px;
        animation: modFadeSlideUp 0.32s ease both;
      }

      /* Header */
      .wsg-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 14px;
      }

      .wsg-title {
        font-family: var(--font-heading);
        font-size: 1.65rem;
        font-weight: 800;
        letter-spacing: 0.2px;
        background: linear-gradient(135deg, #ffffff 0%, var(--accent-cyan) 55%, var(--accent-gold) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .wsg-subtitle {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-top: 4px;
      }

      .wsg-today-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: var(--radius-full);
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.35);
        color: var(--accent-cyan);
        font-family: var(--font-heading);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .wsg-today-btn:hover {
        background: rgba(0, 242, 254, 0.22);
        transform: translateY(-1px);
      }

      /* 4-Season Quick Pills */
      .wsg-season-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .wsg-season-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: var(--radius-full);
        background: var(--bg-card);
        border: 1px solid var(--border-glass);
        color: var(--text-secondary);
        font-family: var(--font-heading);
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .wsg-season-pill:hover {
        color: var(--text-primary);
        border-color: var(--border-glow);
        transform: translateY(-1px);
      }

      .wsg-season-pill.is-active {
        color: #ffffff;
        border-color: var(--pill-accent, var(--accent-cyan));
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.16));
        box-shadow: 0 0 18px rgba(0, 242, 254, 0.22);
      }

      .wsg-season-pill.is-summer-gsb {
        border-color: rgba(245, 158, 11, 0.45);
      }

      .wsg-season-pill.is-summer-gsb.is-active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(16, 185, 129, 0.22));
        border-color: #f59e0b;
        box-shadow: 0 0 20px rgba(245, 158, 11, 0.32);
      }

      /* 12-Month Calendar Strip */
      .wsg-months-grid {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 8px;
      }

      .wsg-month-btn {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 10px 4px;
        border-radius: var(--radius-md);
        background: var(--bg-card);
        border: 1px solid var(--border-glass);
        color: var(--text-secondary);
        font-family: var(--font-heading);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .wsg-month-btn:hover {
        color: var(--text-primary);
        border-color: var(--border-glow);
        transform: translateY(-2px);
      }

      .wsg-month-btn.is-in-season {
        border-color: rgba(255, 255, 255, 0.22);
        color: var(--text-primary);
        background: rgba(51, 65, 85, 0.55);
      }

      .wsg-month-btn.is-active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.24), rgba(79, 172, 254, 0.24));
        border-color: var(--accent-cyan);
        color: #ffffff;
        box-shadow: 0 4px 16px rgba(0, 242, 254, 0.28);
        transform: translateY(-2px);
      }

      .wsg-month-btn.is-gsb-month::after {
        content: 'GSB';
        position: absolute;
        top: -7px;
        right: 4px;
        font-size: 0.58rem;
        font-weight: 800;
        letter-spacing: 0.4px;
        padding: 1px 5px;
        border-radius: 999px;
        background: linear-gradient(135deg, #f59e0b, #10b981);
        color: #0a0f1d;
        box-shadow: 0 2px 6px rgba(245, 158, 11, 0.45);
      }

      .wsg-month-icon {
        font-size: 1.05rem;
        line-height: 1;
      }

      .wsg-month-name {
        font-size: 0.78rem;
        font-weight: 700;
      }

      .wsg-month-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--accent-cyan);
        opacity: 0;
      }

      .wsg-month-btn.is-current .wsg-month-dot {
        opacity: 1;
      }

      /* Monthly / Seasonal Highlights Banner */
      .wsg-banner {
        position: relative;
        border-radius: var(--radius-lg);
        padding: 22px 24px;
        border: 1px solid var(--border-glass);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .wsg-banner-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 14px;
      }

      .wsg-banner-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--accent-cyan);
        margin-bottom: 4px;
      }

      .wsg-banner-title {
        font-family: var(--font-heading);
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.25;
      }

      .wsg-banner-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .wsg-temp-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 13px;
        border-radius: var(--radius-full);
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.16);
        font-family: var(--font-heading);
        font-size: 0.84rem;
        font-weight: 700;
        color: #ffffff;
      }

      .wsg-gsb-badge {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 7px 14px;
        border-radius: var(--radius-full);
        font-size: 0.8rem;
        font-weight: 700;
        line-height: 1.25;
      }

      .wsg-gsb-badge.is-active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.26), rgba(16, 185, 129, 0.26));
        border: 1px solid rgba(245, 158, 11, 0.65);
        color: #fde68a;
        box-shadow: 0 0 18px rgba(245, 158, 11, 0.24);
      }

      .wsg-gsb-badge.is-soon {
        background: rgba(56, 189, 248, 0.16);
        border: 1px solid rgba(56, 189, 248, 0.45);
        color: #bae6fd;
      }

      .wsg-gsb-badge.is-inactive {
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass);
        color: var(--text-secondary);
      }

      .wsg-banner-desc {
        color: var(--text-primary);
        opacity: 0.92;
        font-size: 0.94rem;
        line-height: 1.6;
        max-width: 920px;
      }

      .wsg-banner-tip {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        padding: 10px 14px;
        border-radius: var(--radius-md);
        background: rgba(15, 23, 42, 0.42);
        border: 1px solid rgba(255, 255, 255, 0.09);
        font-size: 0.84rem;
        color: var(--text-secondary);
      }

      /* 7-Region Climate Matrix Strip */
      .wsg-region-matrix {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 10px;
      }

      .wsg-reg-card {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 11px 10px;
        border-radius: var(--radius-md);
        background: var(--bg-card);
        border: 1px solid var(--border-glass);
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .wsg-reg-card:hover {
        border-color: var(--reg-color, var(--border-glow));
        transform: translateY(-2px);
      }

      .wsg-reg-card.is-selected {
        border-color: var(--reg-color, var(--accent-cyan));
        background: rgba(51, 65, 85, 0.72);
        box-shadow: 0 0 16px rgba(0, 242, 254, 0.2);
      }

      .wsg-reg-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 4px;
      }

      .wsg-reg-name {
        font-family: var(--font-heading);
        font-size: 0.79rem;
        font-weight: 700;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .wsg-reg-temp {
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--accent-cyan);
      }

      .wsg-reg-tag {
        font-size: 0.7rem;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .wsg-reg-stars {
        font-size: 0.68rem;
        letter-spacing: 1px;
      }

      /* Toolbar */
      .wsg-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        padding: 12px 16px;
        border-radius: var(--radius-md);
        background: var(--bg-card);
        border: 1px solid var(--border-glass);
      }

      .wsg-toolbar-group {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .wsg-chip {
        padding: 6px 12px;
        border-radius: var(--radius-full);
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass);
        color: var(--text-secondary);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .wsg-chip:hover {
        color: var(--text-primary);
        border-color: var(--border-glow);
      }

      .wsg-chip.is-active {
        background: rgba(0, 242, 254, 0.18);
        border-color: var(--accent-cyan);
        color: #ffffff;
      }

      .wsg-count-info {
        font-size: 0.82rem;
        color: var(--text-secondary);
        font-weight: 600;
      }

      /* Recommended Provinces Grid */
      .wsg-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
        gap: 16px;
      }

      .wsg-card {
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-md);
        background: var(--bg-card);
        border: 1px solid var(--border-glass);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .wsg-card:hover {
        transform: translateY(-4px);
        border-color: var(--border-glow);
        box-shadow: var(--shadow-glow);
      }

      .wsg-card:focus-visible {
        outline: 2px solid var(--accent-cyan);
        outline-offset: 2px;
      }

      .wsg-card.is-standout {
        border-color: rgba(245, 158, 11, 0.36);
      }

      .wsg-card-media {
        position: relative;
        height: 146px;
        overflow: hidden;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85));
      }

      .wsg-card-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s ease;
      }

      .wsg-card:hover .wsg-card-media img {
        transform: scale(1.06);
      }

      .wsg-card-media::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(10, 15, 29, 0.45) 0%, rgba(10, 15, 29, 0.05) 42%, rgba(10, 15, 29, 0.82) 100%);
        pointer-events: none;
      }

      .wsg-card-badges-top {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
      }

      .wsg-card-temp {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 9px;
        border-radius: var(--radius-full);
        background: rgba(10, 15, 29, 0.78);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #ffffff;
        font-size: 0.74rem;
        font-weight: 700;
      }

      .wsg-card-status {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 9px;
        border-radius: var(--radius-full);
        font-size: 0.72rem;
        font-weight: 700;
        backdrop-filter: blur(8px);
      }

      .wsg-card-status.is-visited {
        background: rgba(16, 185, 129, 0.85);
        color: #ffffff;
      }

      .wsg-card-status.is-planned {
        background: rgba(15, 23, 42, 0.76);
        border: 1px solid rgba(255, 255, 255, 0.22);
        color: #e2e8f0;
      }

      .wsg-card-media-bottom {
        position: absolute;
        left: 12px;
        right: 12px;
        bottom: 10px;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 8px;
      }

      .wsg-card-city {
        font-family: var(--font-heading);
        font-size: 1.12rem;
        font-weight: 800;
        color: #ffffff;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.65);
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .wsg-plate-tag {
        font-size: 0.7rem;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 6px;
        background: rgba(0, 242, 254, 0.22);
        border: 1px solid rgba(0, 242, 254, 0.45);
        color: #e0f2fe;
      }

      .wsg-card-region-pill {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: var(--radius-full);
        background: rgba(10, 15, 29, 0.74);
        border: 1px solid rgba(255, 255, 255, 0.16);
        color: #f8fafc;
        white-space: nowrap;
      }

      .wsg-card-body {
        padding: 13px 14px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }

      .wsg-card-season-tag {
        display: inline-flex;
        align-items: center;
        align-self: flex-start;
        gap: 5px;
        padding: 3px 10px;
        border-radius: var(--radius-full);
        font-size: 0.73rem;
        font-weight: 700;
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.28);
        color: var(--accent-cyan);
      }

      .wsg-card.is-standout .wsg-card-season-tag {
        background: rgba(245, 158, 11, 0.16);
        border-color: rgba(245, 158, 11, 0.42);
        color: #fbbf24;
      }

      .wsg-card-reason {
        font-size: 0.83rem;
        color: var(--text-secondary);
        line-height: 1.5;
        flex: 1;
      }

      .wsg-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 8px;
        border-top: 1px solid var(--border-glass);
        font-size: 0.76rem;
        color: var(--text-muted);
      }

      .wsg-card-cta {
        color: var(--accent-cyan);
        font-weight: 700;
      }

      .wsg-empty {
        text-align: center;
        padding: 40px 20px;
        border-radius: var(--radius-md);
        background: var(--bg-card);
        border: 1px dashed var(--border-glass);
        color: var(--text-secondary);
      }

      /* Light Theme Adjustments */
      body.light-theme .wsg-title {
        background: linear-gradient(135deg, #0f172a 0%, #0284c7 60%, #d97706 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      body.light-theme .wsg-today-btn {
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.35);
        color: #0369a1;
      }

      body.light-theme .wsg-season-pill.is-active,
      body.light-theme .wsg-month-btn.is-active,
      body.light-theme .wsg-chip.is-active {
        color: #0f172a;
        background: rgba(2, 132, 199, 0.16);
        border-color: #0284c7;
        box-shadow: 0 3px 12px rgba(2, 132, 199, 0.18);
      }

      body.light-theme .wsg-season-pill.is-summer-gsb.is-active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(16, 185, 129, 0.2));
        border-color: #d97706;
        color: #0f172a;
      }

      body.light-theme .wsg-month-btn.is-in-season {
        background: rgba(226, 232, 240, 0.7);
      }

      body.light-theme .wsg-temp-pill {
        background: rgba(255, 255, 255, 0.85);
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      body.light-theme .wsg-gsb-badge.is-active {
        color: #92400e;
        background: linear-gradient(135deg, rgba(254, 243, 199, 0.95), rgba(209, 250, 229, 0.9));
        border-color: #f59e0b;
      }

      body.light-theme .wsg-gsb-badge.is-soon {
        color: #075985;
        background: rgba(224, 242, 254, 0.9);
      }

      body.light-theme .wsg-gsb-badge.is-inactive,
      body.light-theme .wsg-banner-tip,
      body.light-theme .wsg-chip {
        background: rgba(255, 255, 255, 0.72);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .wsg-reg-card.is-selected {
        background: rgba(224, 242, 254, 0.8);
      }

      body.light-theme .wsg-reg-temp,
      body.light-theme .wsg-card-cta,
      body.light-theme .wsg-banner-kicker {
        color: #0284c7;
      }

      body.light-theme .wsg-card-season-tag {
        color: #0369a1;
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.28);
      }

      body.light-theme .wsg-card.is-standout .wsg-card-season-tag {
        color: #b45309;
        background: rgba(245, 158, 11, 0.16);
        border-color: rgba(245, 158, 11, 0.4);
      }

      /* Responsive */
      @media (max-width: 1024px) {
        .wsg-months-grid {
          grid-template-columns: repeat(6, minmax(0, 1fr));
        }
        .wsg-region-matrix {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }

      @media (max-width: 640px) {
        .wsg-months-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .wsg-region-matrix {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .wsg-banner {
          padding: 16px;
        }
      }
    `;
    const firstLink = document.head.querySelector('link[rel="stylesheet"]');
    if (firstLink) {
      document.head.insertBefore(style, firstLink);
    } else {
      document.head.appendChild(style);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. SCORING & RECOMMENDATION ENGINE
  // ---------------------------------------------------------------------------

  function getSeasonById(id) {
    return SEASONS.find((s) => s.id === id) || SEASONS[0];
  }

  function getRegionMeta(data, regionCode) {
    const fromData = data && data.regions && data.regions[regionCode];
    const fallback = DEFAULT_REGIONS[regionCode] || {
      name: regionCode,
      short: regionCode,
      icon: '🗺️',
      color: '#38bdf8'
    };
    return {
      name: (fromData && fromData.name) || fallback.name,
      short: fallback.short,
      icon: (fromData && fromData.icon) || fallback.icon,
      color: (fromData && fromData.color) || fallback.color
    };
  }

  function getRegionClimateForSelection(regionCode) {
    const arr = REGION_CLIMATE[regionCode] || REGION_CLIMATE['04_IcAnadolu'];
    if (uiState.mode === 'month') {
      return arr[uiState.selectedMonth];
    }
    const season = getSeasonById(uiState.selectedSeason);
    // Pick the best-scoring month within the season for temperature & tag summary
    let best = arr[season.months[0]];
    let scoreSum = 0;
    season.months.forEach((mIdx) => {
      const entry = arr[mIdx];
      scoreSum += entry.score;
      if (entry.score > best.score) best = entry;
    });
    return {
      temp: best.temp,
      score: Math.round(scoreSum / season.months.length),
      tag: best.tag
    };
  }

  function evaluateProvince(cityKey, prov) {
    const activeSeasonId =
      uiState.mode === 'month'
        ? MONTHS[uiState.selectedMonth].seasonId
        : uiState.selectedSeason;
    const activeMonths =
      uiState.mode === 'month'
        ? [uiState.selectedMonth]
        : getSeasonById(uiState.selectedSeason).months;

    const regClimate = getRegionClimateForSelection(prov.region_code);
    const standout = STANDOUT_PROVINCES[prov.name] || null;
    const isStandoutNow = Boolean(
      standout && standout.months.some((m) => activeMonths.includes(m))
    );

    // Determine temperature range
    let tempLabel = regClimate.temp;
    if (standout && standout.tempBySeason && standout.tempBySeason[activeSeasonId]) {
      tempLabel = standout.tempBySeason[activeSeasonId];
    }

    // Determine suitability score (1..4, where 4 = Standout Peak)
    let score = regClimate.score;
    if (isStandoutNow) {
      score = 4;
    }

    // Determine seasonal badge
    let badgeText = '';
    if (isStandoutNow) {
      const seasonBadgeKey = `${activeSeasonId}Badge`;
      badgeText =
        standout[seasonBadgeKey] ||
        standout.springBadge ||
        standout.summerBadge ||
        standout.autumnBadge ||
        standout.winterBadge ||
        '⭐ Zirve Dönem';
    } else if (score === 3) {
      badgeText = `✨ ${regClimate.tag}`;
    } else if (score === 2) {
      badgeText = `🌤️ ${regClimate.tag}`;
    } else {
      badgeText = `🧭 ${regClimate.tag}`;
    }

    // Determine tailored reason text
    let reason = '';
    if (isStandoutNow && standout.reasons && standout.reasons[activeSeasonId]) {
      reason = standout.reasons[activeSeasonId];
    } else {
      const landmarks = Array.isArray(prov.landmarks) ? prov.landmarks.slice(0, 2).join(', ') : '';
      const periodName =
        uiState.mode === 'month'
          ? `${MONTHS[uiState.selectedMonth].name} ayında`
          : `${getSeasonById(activeSeasonId).name} mevsiminde`;
      if (landmarks) {
        reason = `${periodName} ${regClimate.tag.toLowerCase()} atmosferinde ${landmarks} rotası için keyifli bir durak.`;
      } else {
        reason = prov.quote || `${periodName} ${regClimate.tag} temalı keşif rotası.`;
      }
    }

    return {
      key: cityKey,
      prov,
      score,
      isStandout: isStandoutNow,
      tempLabel,
      badgeText,
      reason
    };
  }

  function renderStars(score) {
    const filled = Math.max(1, Math.min(3, score));
    return '★'.repeat(filled) + '☆'.repeat(3 - filled);
  }

  // ---------------------------------------------------------------------------
  // 5. MAIN RENDERER
  // ---------------------------------------------------------------------------

  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const data = safeCtx.data || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const escapeHtml =
      typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const selectCity =
      typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};

    if (!data || !data.provinces) {
      container.innerHTML = `<div class="wsg-empty">Seyahat verisi yüklenemedi.</div>`;
      return;
    }

    const activeMonthObj = MONTHS[uiState.selectedMonth];
    const activeSeasonId =
      uiState.mode === 'month' ? activeMonthObj.seasonId : uiState.selectedSeason;
    const activeSeasonObj = getSeasonById(activeSeasonId);

    // Evaluate all 81 provinces
    const allEvaluated = Object.entries(data.provinces).map(([key, prov]) =>
      evaluateProvince(key, prov)
    );

    // Sort: Standouts first, then higher climate score, then unvisited/visited balance, then alphabetical
    allEvaluated.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.isStandout !== b.isStandout) return a.isStandout ? -1 : 1;
      return a.prov.name.localeCompare(b.prov.name, 'tr');
    });

    // Apply region & visit & view-mode filters
    const filtered = allEvaluated.filter((item) => {
      if (uiState.regionFilter !== 'all' && item.prov.region_code !== uiState.regionFilter) {
        return false;
      }
      if (uiState.visitFilter === 'visited' && !item.prov.visited) return false;
      if (uiState.visitFilter === 'planned' && item.prov.visited) return false;
      if (!uiState.showAll81 && uiState.regionFilter === 'all') {
        return item.score >= 3; // Recommended / ideal provinces
      }
      return true;
    });

    // Stats for banner
    const recommendedTotal = allEvaluated.filter((i) => i.score >= 3).length;
    const visitedInFiltered = filtered.filter((i) => i.prov.visited).length;
    const plannedInFiltered = filtered.length - visitedInFiltered;

    // Banner content
    const bannerKicker =
      uiState.mode === 'month'
        ? `${activeMonthObj.icon} ${activeMonthObj.name} Ayı Seyahat Rehberi • ${activeSeasonObj.name}`
        : `${activeSeasonObj.icon} ${activeSeasonObj.name} Mevsimi Genel Rehberi`;
    const bannerTitle =
      uiState.mode === 'month' ? activeMonthObj.title : activeSeasonObj.headline;
    const bannerDesc =
      uiState.mode === 'month' ? activeMonthObj.highlight : activeSeasonObj.summary;
    const bannerTemp =
      uiState.mode === 'month' ? activeMonthObj.tempRange : activeSeasonObj.tempRange;
    const bannerGsbStatus =
      uiState.mode === 'month' ? activeMonthObj.gsbStatus : activeSeasonObj.gsbStatus;
    const bannerGsbText =
      uiState.mode === 'month' ? activeMonthObj.gsbText : activeSeasonObj.gsbText;
    const bannerTip =
      uiState.mode === 'month'
        ? activeMonthObj.tip
        : 'Bir aya tıklayarak o aya özel sıcaklık, festival ve GSB Seyahatsever durumunu inceleyebilirsin.';

    const gsbBadgeClass =
      bannerGsbStatus === 'active'
        ? 'is-active'
        : bannerGsbStatus === 'soon'
        ? 'is-soon'
        : 'is-inactive';

    // Build Season Pills HTML
    const seasonPillsHtml = SEASONS.map((s) => {
      const isActive =
        (uiState.mode === 'season' && uiState.selectedSeason === s.id) ||
        (uiState.mode === 'month' && activeSeasonId === s.id);
      const isSummer = s.id === 'summer';
      return `
        <button
          type="button"
          class="wsg-season-pill ${isActive ? 'is-active' : ''} ${isSummer ? 'is-summer-gsb' : ''}"
          style="--pill-accent: ${s.accent};"
          data-season-id="${s.id}"
          aria-pressed="${isActive ? 'true' : 'false'}"
        >
          <span>${escapeHtml(s.pillLabel)}</span>
        </button>
      `;
    }).join('');

    // Build 12-Month Grid HTML
    const monthsGridHtml = MONTHS.map((m) => {
      const isActive = uiState.mode === 'month' && uiState.selectedMonth === m.index;
      const isInSelectedSeason =
        uiState.mode === 'season' && activeSeasonObj.months.includes(m.index);
      const isCurrent = m.index === currentMonthIdx;
      const isGsb = m.index === 6 || m.index === 7; // Temmuz & Ağustos
      return `
        <button
          type="button"
          class="wsg-month-btn ${isActive ? 'is-active' : ''} ${isInSelectedSeason ? 'is-in-season' : ''} ${isCurrent ? 'is-current' : ''} ${isGsb ? 'is-gsb-month' : ''}"
          data-month-index="${m.index}"
          title="${escapeHtml(m.name)}${isCurrent ? ' (İçinde Bulunduğumuz Ay)' : ''}${isGsb ? ' — GSB Seyahatsever Aktif!' : ''}"
          aria-pressed="${isActive ? 'true' : 'false'}"
        >
          <span class="wsg-month-icon">${m.icon}</span>
          <span class="wsg-month-name">${escapeHtml(m.name)}</span>
          <span class="wsg-month-dot" aria-hidden="true"></span>
        </button>
      `;
    }).join('');

    // Build 7-Region Climate Matrix HTML
    const regionMatrixHtml = REGION_ORDER.map((rCode) => {
      const meta = getRegionMeta(data, rCode);
      const clim = getRegionClimateForSelection(rCode);
      const isSelected = uiState.regionFilter === rCode;
      const starColor =
        clim.score === 3 ? '#fbbf24' : clim.score === 2 ? '#38bdf8' : '#94a3b8';
      return `
        <button
          type="button"
          class="wsg-reg-card ${isSelected ? 'is-selected' : ''}"
          style="--reg-color: ${meta.color};"
          data-region-code="${rCode}"
          title="${escapeHtml(meta.name)} — ${escapeHtml(clim.temp)} (${escapeHtml(clim.tag)})"
        >
          <div class="wsg-reg-top">
            <span class="wsg-reg-name">${meta.icon} ${escapeHtml(meta.short)}</span>
          </div>
          <div class="wsg-reg-temp">🌡️ ${escapeHtml(clim.temp)}</div>
          <div class="wsg-reg-tag">${escapeHtml(clim.tag)}</div>
          <div class="wsg-reg-stars" style="color: ${starColor};">${renderStars(clim.score)}</div>
        </button>
      `;
    }).join('');

    // Build Provinces Cards HTML
    const cardsHtml =
      filtered.length === 0
        ? `<div class="wsg-empty">
             Seçili filtrelerle eşleşen il bulunamadı. Bölge veya ziyaret filtresini temizleyebilirsin.
           </div>`
        : filtered
            .map((item) => {
              const p = item.prov;
              const regMeta = getRegionMeta(data, p.region_code);
              const thumb = p.has_banner && p.banner_rel ? p.banner_rel : 'assets/banner.jpg';
              const plateStr = String(p.plate).padStart(2, '0');
              const statusClass = p.visited ? 'is-visited' : 'is-planned';
              const statusText = p.visited ? '✅ Ziyaret Edildi' : '📍 Planlanan';
              return `
                <article
                  class="wsg-card ${item.isStandout ? 'is-standout' : ''}"
                  data-city-key="${escapeHtml(item.key)}"
                  tabindex="0"
                  role="button"
                  aria-label="${escapeHtml(p.name)} detaylarını aç"
                >
                  <div class="wsg-card-media">
                    <img src="${escapeHtml(thumb)}" alt="${escapeHtml(p.name)}" loading="lazy" />
                    <div class="wsg-card-badges-top">
                      <span class="wsg-card-temp">🌡️ ${escapeHtml(item.tempLabel)}</span>
                      <span class="wsg-card-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="wsg-card-media-bottom">
                      <div class="wsg-card-city">
                        <span class="wsg-plate-tag">${plateStr}</span>
                        <span>${escapeHtml(p.name)}</span>
                      </div>
                      <span class="wsg-card-region-pill">${regMeta.icon} ${escapeHtml(regMeta.short)}</span>
                    </div>
                  </div>
                  <div class="wsg-card-body">
                    <span class="wsg-card-season-tag">${escapeHtml(item.badgeText)}</span>
                    <p class="wsg-card-reason">${escapeHtml(item.reason)}</p>
                    <div class="wsg-card-footer">
                      <span>${escapeHtml(regMeta.name)}</span>
                      <span class="wsg-card-cta">Rehberi Aç →</span>
                    </div>
                  </div>
                </article>
              `;
            })
            .join('');

    container.innerHTML = `
      <section class="wsg-view" aria-label="81 İl Mevsim ve 12 Aylık Seyahat Takvimi">
        <div class="wsg-header">
          <div>
            <h2 class="wsg-title">🌤️ 81 İl Mevsim & 12 Aylık Seyahat Takvimi</h2>
            <p class="wsg-subtitle">
              Anadolu’nun 7 bölgesinde hangi ay nereye gidilir? İdeal sıcaklıklar, öne çıkan rotalar ve GSB Seyahatsever takvimi.
            </p>
          </div>
          <button type="button" class="wsg-today-btn" data-action="reset-today">
            <span>📅</span>
            <span>Bu Aya Dön (${escapeHtml(MONTHS[currentMonthIdx].name)})</span>
          </button>
        </div>

        <div class="wsg-season-pills" role="group" aria-label="4 Mevsim Hızlı Seçim">
          ${seasonPillsHtml}
        </div>

        <div class="wsg-months-grid" role="group" aria-label="12 Aylık Takvim">
          ${monthsGridHtml}
        </div>

        <div class="wsg-banner" style="background: ${activeSeasonObj.gradient};">
          <div class="wsg-banner-top">
            <div>
              <div class="wsg-banner-kicker">${escapeHtml(bannerKicker)}</div>
              <h3 class="wsg-banner-title">${escapeHtml(bannerTitle)}</h3>
            </div>
            <div class="wsg-banner-badges">
              <span class="wsg-temp-pill">🌡️ Tipik Sıcaklık: ${escapeHtml(bannerTemp)}</span>
              <span class="wsg-temp-pill">⭐ ${recommendedTotal} Önerilen İl</span>
            </div>
          </div>

          <div class="wsg-gsb-badge ${gsbBadgeClass}">
            <span>${escapeHtml(bannerGsbText)}</span>
          </div>

          <p class="wsg-banner-desc">${escapeHtml(bannerDesc)}</p>

          <div class="wsg-banner-tip">
            <span>💡</span>
            <span><strong>Seyyah İpucu:</strong> ${escapeHtml(bannerTip)}</span>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:8px; flex-wrap:wrap;">
            <span style="font-family:var(--font-heading); font-size:0.92rem; font-weight:700; color:var(--text-primary);">
              🗺️ 7 Bölge İklim Uygunluk Matrisi <span style="color:var(--text-secondary); font-weight:500; font-size:0.8rem;">(Filtrelemek için bölgeye tıkla)</span>
            </span>
            ${
              uiState.regionFilter !== 'all'
                ? `<button type="button" class="wsg-chip is-active" data-region-code="all">✕ Bölge Filtresini Temizle</button>`
                : ''
            }
          </div>
          <div class="wsg-region-matrix">
            ${regionMatrixHtml}
          </div>
        </div>

        <div class="wsg-toolbar">
          <div class="wsg-toolbar-group" role="group" aria-label="Ziyaret Durumu Filtresi">
            <button type="button" class="wsg-chip ${uiState.visitFilter === 'all' ? 'is-active' : ''}" data-visit-filter="all">
              Tümü (${filtered.length})
            </button>
            <button type="button" class="wsg-chip ${uiState.visitFilter === 'planned' ? 'is-active' : ''}" data-visit-filter="planned">
              📍 Planlanan (${plannedInFiltered})
            </button>
            <button type="button" class="wsg-chip ${uiState.visitFilter === 'visited' ? 'is-active' : ''}" data-visit-filter="visited">
              ✅ Ziyaret Edilen (${visitedInFiltered})
            </button>
          </div>

          <div class="wsg-toolbar-group">
            <button type="button" class="wsg-chip ${!uiState.showAll81 ? 'is-active' : ''}" data-scope="recommended">
              ⭐ Önerilen İller
            </button>
            <button type="button" class="wsg-chip ${uiState.showAll81 ? 'is-active' : ''}" data-scope="all81">
              🇹🇷 81 İl Tam Liste
            </button>
          </div>
        </div>

        <div class="wsg-grid">
          ${cardsHtml}
        </div>
      </section>
    `;

    // -------------------------------------------------------------------------
    // 6. EVENT BINDINGS
    // -------------------------------------------------------------------------

    const rerender = () => render(container, safeCtx);

    const todayBtn = container.querySelector('[data-action="reset-today"]');
    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        uiState.mode = 'month';
        uiState.selectedMonth = currentMonthIdx;
        uiState.selectedSeason = MONTHS[currentMonthIdx].seasonId;
        uiState.regionFilter = 'all';
        uiState.visitFilter = 'all';
        rerender();
      });
    }

    container.querySelectorAll('[data-season-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sId = btn.getAttribute('data-season-id');
        if (!sId) return;
        uiState.mode = 'season';
        uiState.selectedSeason = sId;
        rerender();
      });
    });

    container.querySelectorAll('[data-month-index]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-month-index'), 10);
        if (Number.isNaN(idx) || idx < 0 || idx > 11) return;
        uiState.mode = 'month';
        uiState.selectedMonth = idx;
        uiState.selectedSeason = MONTHS[idx].seasonId;
        rerender();
      });
    });

    container.querySelectorAll('[data-region-code]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rCode = btn.getAttribute('data-region-code');
        if (rCode === 'all' || uiState.regionFilter === rCode) {
          uiState.regionFilter = 'all';
        } else {
          uiState.regionFilter = rCode;
        }
        rerender();
      });
    });

    container.querySelectorAll('[data-visit-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const vf = btn.getAttribute('data-visit-filter');
        if (vf) {
          uiState.visitFilter = vf;
          rerender();
        }
      });
    });

    container.querySelectorAll('[data-scope]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiState.showAll81 = btn.getAttribute('data-scope') === 'all81';
        rerender();
      });
    });

    container.querySelectorAll('.wsg-card[data-city-key]').forEach((card) => {
      const openCity = () => {
        const key = card.getAttribute('data-city-key');
        if (key) selectCity(key);
      };
      card.addEventListener('click', openCity);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCity();
        }
      });
    });
  }

  // Register module
  window.SEYYAH_MODULES.seasons = {
    render
  };
})();
