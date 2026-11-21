/**
 * Anadolu Seyahatnamesi — Anadolu Makamları, Fârâbî Mûsikî Şifası & Türkü Coğrafyası
 * - Fârâbî (Kitâbü'l-Mûsîka'l-Kebîr) & İbn Sînâ (Kitâbü'ş-Şifâ) geleneğinden 8 Klasik Makam
 * - Saf Web Audio API mikrotonal dem + seyir arpej sentezleyicisi & Gerçek Tasavvufi Ney Taksimi (assets/ney_tasavvuf.mp3)
 * - 7 Bölge Anadolu Türkü & Halk Müziği Atlası + İl Kartları (ctx.selectCity)
 * - Gemini AI (window.SEYYAH_AI.stream) ile Ruh Haline Göre Makam, Türkü ve Şehir Eşleştirme + Çevrimdışı Akıllı Yedek
 *
 * Registers on: window.SEYYAH_MODULES.makamAtlas = { render(container, ctx), stop() }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-makam-atlas-styles';
  const NEY_AUDIO_SRC = 'assets/ney_tasavvuf.mp3';

  // =========================================================================
  // Section 1 Data: 8 Klasik Makam (Fârâbî & İbn Sînâ Darüşşifa Geleneği)
  // Microtonal frequencies based on Turkish 53-TET comma system around Bolahenk/Kız Ney register
  // Reference D4 = 293.66 Hz (Neva) / G3 = 196.00 Hz (Rast) / A3 = 220.00 Hz (Dügâh)
  // =========================================================================

  function centsToFreq(baseHz, cents) {
    return Number((baseHz * Math.pow(2, cents / 1200)).toFixed(2));
  }

  const MAKAMLAR = [
    {
      id: 'rast',
      name: 'Rast',
      arabicRoot: 'Rast (G3) · Güçlü: Neva (D4)',
      vakit: 'Seher & Sabah',
      vakitTags: ['seher', 'kusluk'],
      element: 'Ateş · Kuru-Sıcak',
      accent: '#00f2fe',
      badgeBg: 'rgba(0, 242, 254, 0.14)',
      healing:
        'Fârâbî ve Gevher Nesîbe Darüşşifası kayıtlarına göre insana sefâ, neşe ve zihin berraklığı verir; felç, uyuşukluk ve sabah durgunluğuna karşı ruhu canlandırır.',
      farabiNote:
        'Türk mûsikîsinin "ana makamı" sayılır; dengeli beşli ve dörtlü yapısıyla bedenin nabzını tabiî ahenge çeker.',
      cities: ['01_Marmara/Istanbul', '01_Marmara/Bursa', '04_IcAnadolu/Konya'],
      drone: { rootHz: 196.0, fifthHz: 293.66, subHz: 98.0 },
      scale: [
        { label: 'Rast', hz: 196.0 },
        { label: 'Dügâh', hz: centsToFreq(196.0, 204) },
        { label: 'Segâh', hz: centsToFreq(196.0, 386) },
        { label: 'Çargâh', hz: centsToFreq(196.0, 498) },
        { label: 'Neva', hz: centsToFreq(196.0, 702) },
        { label: 'Hüseynî', hz: centsToFreq(196.0, 906) },
        { label: 'Evîç', hz: centsToFreq(196.0, 1088) },
        { label: 'Gerdâniye', hz: 392.0 }
      ],
      moodKeywords: ['huzur', 'sabah', 'nese', 'ferah', 'dingin', 'denge', 'baslangic', 'umut']
    },
    {
      id: 'hicaz',
      name: 'Hicaz',
      arabicRoot: 'Dügâh (A3) · Güçlü: Neva (D4)',
      vakit: 'İkindi – Akşam & Yatsı',
      vakitTags: ['ikindi', 'aksam', 'yatsi'],
      element: 'Ateş · Kuruluk',
      accent: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.16)',
      healing:
        'İbn Sînâ geleneğinde tevazu, derin tefekkür ve gözyaşıyla arınma makamıdır; Edirne II. Bayezid Darüşşifasında kemik-eklem sızıları ve ruhsal sıkışmada şifa vesilesi olarak icra edilmiştir.',
      farabiNote:
        'Artık ikili aralığı (Nim Hicaz – Dik Hisar) kalbe doğrudan dokunan yakıcı ama teskin edici bir vecd doğurur.',
      cities: ['07_GuneydoguAnadolu/Sanliurfa', '04_IcAnadolu/Konya', '01_Marmara/Edirne'],
      drone: { rootHz: 220.0, fifthHz: 293.66, subHz: 110.0 },
      scale: [
        { label: 'Dügâh', hz: 220.0 },
        { label: 'Dik Kürdî', hz: centsToFreq(220.0, 114) },
        { label: 'Nim Hicaz', hz: centsToFreq(220.0, 386) },
        { label: 'Neva', hz: centsToFreq(220.0, 498) },
        { label: 'Hüseynî', hz: centsToFreq(220.0, 702) },
        { label: 'Evîç', hz: centsToFreq(220.0, 884) },
        { label: 'Gerdâniye', hz: centsToFreq(220.0, 996) },
        { label: 'Muhayyer', hz: 440.0 }
      ],
      moodKeywords: ['tefekkur', 'huzun', 'dua', 'manevi', 'gece', 'hasret', 'sabr', 'ozlem']
    },
    {
      id: 'nihavend',
      name: 'Nihâvend',
      arabicRoot: 'Rast (G3) · Güçlü: Neva (D4)',
      vakit: 'Öğle & İkindi Sonu',
      vakitTags: ['ogle', 'ikindi'],
      element: 'Su · Nemli-Soğuk',
      accent: '#4facfe',
      badgeBg: 'rgba(79, 172, 254, 0.16)',
      healing:
        'Kan dolaşımını yumuşattığına, kalp çarpıntısını ve karın ağrısını yatıştırdığına; ruh hâlindeki keskin dalgalanmalara kuvvet ve yumuşaklık kazandırdığına inanılır.',
      farabiNote:
        'Buselik beşlisi ve Kürdî/Hicaz renkleriyle Anadolu şehir musikisinin en zarif ve kucaklayıcı seyirlerinden biridir.',
      cities: ['01_Marmara/Istanbul', '02_Ege/Izmir', '01_Marmara/Bursa'],
      drone: { rootHz: 196.0, fifthHz: 293.66, subHz: 98.0 },
      scale: [
        { label: 'Rast', hz: 196.0 },
        { label: 'Dügâh', hz: centsToFreq(196.0, 204) },
        { label: 'Kürdî', hz: centsToFreq(196.0, 294) },
        { label: 'Çargâh', hz: centsToFreq(196.0, 498) },
        { label: 'Neva', hz: centsToFreq(196.0, 702) },
        { label: 'Nim Hisar', hz: centsToFreq(196.0, 792) },
        { label: 'Acem', hz: centsToFreq(196.0, 996) },
        { label: 'Gerdâniye', hz: 392.0 }
      ],
      moodKeywords: ['romantik', 'zarif', 'yorgun', 'akin', 'deniz', 'kalp', 'sakin', 'tatli']
    },
    {
      id: 'ussak',
      name: 'Uşşak',
      arabicRoot: 'Dügâh (A3) · Güçlü: Neva (D4)',
      vakit: 'Öğle & Akşam Üzeri',
      vakitTags: ['ogle', 'aksam'],
      element: 'Hava & Su',
      accent: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.16)',
      healing:
        'Darüşşifa kaynaklarında "âşıkların makamı" olarak geçer; kalbe sevinç, gülme ve yumuşaklık verir, uykusuzluğu ve ayak/kalp ağrılarını hafifletir.',
      farabiNote:
        'Segâh perdesindeki 1–1.5 komalık pesleşme Uşşak’a ne ağlatan ne de taşkınlaştıran sıcak bir Anadolu samimiyeti katar.',
      cities: ['01_Marmara/Edirne', '05_Karadeniz/Amasya', '02_Ege/Kutahya'],
      drone: { rootHz: 220.0, fifthHz: 293.66, subHz: 110.0 },
      scale: [
        { label: 'Dügâh', hz: 220.0 },
        { label: 'Segâh (Uşşak)', hz: centsToFreq(220.0, 158) },
        { label: 'Çargâh', hz: centsToFreq(220.0, 294) },
        { label: 'Neva', hz: centsToFreq(220.0, 498) },
        { label: 'Hüseynî', hz: centsToFreq(220.0, 702) },
        { label: 'Acem', hz: centsToFreq(220.0, 792) },
        { label: 'Gerdâniye', hz: centsToFreq(220.0, 996) },
        { label: 'Muhayyer', hz: 440.0 }
      ],
      moodKeywords: ['sevgi', 'samimi', 'sicak', 'uyku', 'rahat', 'dostluk', 'gonul', 'huzurlu']
    },
    {
      id: 'segah',
      name: 'Segâh',
      arabicRoot: 'Segâh (B3♭-) · Güçlü: Neva (D4)',
      vakit: 'Kuşluk & Seher',
      vakitTags: ['kusluk', 'seher'],
      element: 'Toprak · Dengeli',
      accent: '#a855f7',
      badgeBg: 'rgba(168, 85, 247, 0.16)',
      healing:
        'İbn Sînâ risalelerinde zihin dağınıklığını ve vesveseyi toparladığı; nefes darlığı, beyin yorgunluğu ve uykusuzluğa karşı berraklık verdiği kaydedilir.',
      farabiNote:
        'Mevlevî âyinlerinin ve sabah salalarının sevilen makamıdır; tizlere çıkmadan insanı kendi iç merkezine döndürür.',
      cities: ['04_IcAnadolu/Konya', '04_IcAnadolu/Kayseri', '01_Marmara/Bursa'],
      drone: { rootHz: centsToFreq(196.0, 386), fifthHz: 329.63, subHz: centsToFreq(98.0, 386) },
      scale: [
        { label: 'Segâh', hz: centsToFreq(196.0, 386) },
        { label: 'Çargâh', hz: centsToFreq(196.0, 498) },
        { label: 'Neva', hz: centsToFreq(196.0, 702) },
        { label: 'Hüseynî', hz: centsToFreq(196.0, 906) },
        { label: 'Evîç', hz: centsToFreq(196.0, 1088) },
        { label: 'Gerdâniye', hz: 392.0 },
        { label: 'Muhayyer', hz: 440.0 },
        { label: 'Tiz Segâh', hz: centsToFreq(392.0, 386) }
      ],
      moodKeywords: ['odak', 'berrak', 'zihin', 'nefes', 'sukunet', 'meditasyon', 'vesvese', 'ders']
    },
    {
      id: 'huseyni',
      name: 'Hüseynî',
      arabicRoot: 'Dügâh (A3) · Güçlü: Hüseynî (E4)',
      vakit: 'Seher & Sabah',
      vakitTags: ['seher', 'kusluk'],
      element: 'Hava · Serin-Taze',
      accent: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.16)',
      healing:
        'Sulh, gönül genişliği ve içsel barış makamıdır; Fârâbî sonrası şifahânelerde öfke, sıtma harareti ve karaciğer/mide sıkıntılarını yatıştırmak için tercih edilmiştir.',
      farabiNote:
        'Anadolu türkülerinin ve yayla havalarının bel kemiğidir; Hüseynî perdesinden başlayan iniş insana dağ havası gibi nefes aldırır.',
      cities: ['06_DoguAnadolu/Erzurum', '04_IcAnadolu/Sivas', '06_DoguAnadolu/Elazig'],
      drone: { rootHz: 220.0, fifthHz: 329.63, subHz: 110.0 },
      scale: [
        { label: 'Dügâh', hz: 220.0 },
        { label: 'Segâh', hz: centsToFreq(220.0, 158) },
        { label: 'Çargâh', hz: centsToFreq(220.0, 294) },
        { label: 'Neva', hz: centsToFreq(220.0, 498) },
        { label: 'Hüseynî', hz: centsToFreq(220.0, 702) },
        { label: 'Evîç', hz: centsToFreq(220.0, 884) },
        { label: 'Gerdâniye', hz: centsToFreq(220.0, 996) },
        { label: 'Muhayyer', hz: 440.0 }
      ],
      moodKeywords: ['yayla', 'ozgurluk', 'yol', 'ferahlik', 'ofke', 'stres', 'baris', 'doga']
    },
    {
      id: 'irak',
      name: 'Irak',
      arabicRoot: 'Irak (F#3-) · Güçlü: Dügâh (A3) / Segâh',
      vakit: 'Kuşluk Vakti',
      vakitTags: ['kusluk', 'ogle'],
      element: 'Toprak · Serin',
      accent: '#14b8a6',
      badgeBg: 'rgba(20, 184, 166, 0.16)',
      healing:
        'Hararet, ateşli hastalıklar ve zihinsel bunaltıyı söndürdüğüne; baş dönmesi, öfke ve aceleciliğe karşı ağırbaşlı bir serinlik verdiğine inanılır.',
      farabiNote:
        'Yegâh ve Irak bölgesindeki pes seyriyle kök salma, sabır ve kadim Mezopotamya–Anadolu taş şehirlerinin vakarını taşır.',
      cities: ['07_GuneydoguAnadolu/Mardin', '07_GuneydoguAnadolu/Diyarbakir', '05_Karadeniz/Amasya'],
      drone: { rootHz: centsToFreq(196.0, -112), fifthHz: 277.18, subHz: centsToFreq(98.0, -112) },
      scale: [
        { label: 'Irak', hz: centsToFreq(196.0, -112) },
        { label: 'Rast', hz: 196.0 },
        { label: 'Dügâh', hz: centsToFreq(196.0, 204) },
        { label: 'Segâh', hz: centsToFreq(196.0, 386) },
        { label: 'Çargâh', hz: centsToFreq(196.0, 498) },
        { label: 'Neva', hz: centsToFreq(196.0, 702) },
        { label: 'Hüseynî', hz: centsToFreq(196.0, 906) },
        { label: 'Evîç', hz: centsToFreq(196.0, 1088) }
      ],
      moodKeywords: ['serin', 'sabir', 'tas', 'kadim', 'yorgunluk', 'sicak', 'vakar', 'kok']
    },
    {
      id: 'saba',
      name: 'Saba',
      arabicRoot: 'Dügâh (A3) · Güçlü: Çargâh (C4)',
      vakit: 'Seher (Gün Doğumu Öncesi)',
      vakitTags: ['seher', 'yatsi'],
      element: 'Su & Hava',
      accent: '#ec4899',
      badgeBg: 'rgba(236, 72, 153, 0.16)',
      healing:
        'Fârâbî ve Mevlevî meşrebinde cesaret, metanet ve hüzün üzerinden arınma makamıdır; içe kapanıklığı ve ruhsal durgunluğu çözerek gönlü diriltir.',
      farabiNote:
        'Eksik dörtlü (Saba dörtlüsü) ve Hicaz beşlisinin birleşimiyle en derin duygu kırılmalarını bile onurlu bir dirence dönüştürür.',
      cities: ['07_GuneydoguAnadolu/Sanliurfa', '01_Marmara/Istanbul', '01_Marmara/Edirne'],
      drone: { rootHz: 220.0, fifthHz: 261.63, subHz: 110.0 },
      scale: [
        { label: 'Dügâh', hz: 220.0 },
        { label: 'Segâh', hz: centsToFreq(220.0, 158) },
        { label: 'Çargâh', hz: centsToFreq(220.0, 294) },
        { label: 'Hicaz', hz: centsToFreq(220.0, 408) },
        { label: 'Dik Hisar', hz: centsToFreq(220.0, 680) },
        { label: 'Acem', hz: centsToFreq(220.0, 792) },
        { label: 'Gerdâniye', hz: centsToFreq(220.0, 996) },
        { label: 'Şehnaz', hz: centsToFreq(220.0, 1110) }
      ],
      moodKeywords: ['cesaret', 'seher', 'derin', 'huzun', 'direnc', 'uyan', 'ask', 'saba']
    }
  ];

  const VAKIT_FILTERS = [
    { id: 'all', label: 'Tüm Vakitler', icon: '🕰️' },
    { id: 'seher', label: 'Seher', icon: '🌅' },
    { id: 'kusluk', label: 'Kuşluk', icon: '☀️' },
    { id: 'ogle', label: 'Öğle', icon: '🌤️' },
    { id: 'ikindi', label: 'İkindi', icon: '🌇' },
    { id: 'aksam', label: 'Akşam', icon: '🌆' },
    { id: 'yatsi', label: 'Yatsı / Gece', icon: '🌙' }
  ];

  // =========================================================================
  // Section 2 Data: 7 Bölge Anadolu Türkü & Halk Müziği Atlası
  // =========================================================================

  const FOLK_REGIONS = [
    {
      id: 'orta-anadolu',
      title: 'Orta Anadolu Bozlakları',
      shortTitle: 'Orta Anadolu Bozlak',
      icon: '🌾',
      accent: '#f59e0b',
      makamId: 'huseyni',
      makamLabel: 'Hüseynî · Muhayyer · Kerem Ayağı',
      usul: 'Serbest Usul (Bozlak) & 4/4 – 2/4 Kırık Havalar',
      instruments: ['Bozuk Düzen Bağlama', 'Divan Sazı', 'Keman', 'Kaşık'],
      masters: ['Muharrem Ertaş', 'Neşet Ertaş', 'Âşık Veysel', 'Hacı Taşan'],
      repertoire: ['Zahidem', 'Gönül Dağı', 'Uzun İnce Bir Yoldayım', 'Allı Turnam'],
      description:
        'Bozkırın engin ufkunda Abdal geleneğinin tizden pese inen feryadı bozlaklar ve Sivas/Yozgat âşık deyişleri, Anadolu sözlü hafızasının kalbidir.',
      provinces: [
        { key: '04_IcAnadolu/Kirsehir', role: 'Abdal & Bozlak Başkenti (Neşet Ertaş)' },
        { key: '04_IcAnadolu/Sivas', role: 'Âşıklar Diyarı & Semahlar (Âşık Veysel)' },
        { key: '04_IcAnadolu/Ankara', role: 'Misket, Fidayda & Seymen Havaları' },
        { key: '04_IcAnadolu/Konya', role: 'Kaşık Oyun Havaları & Divan Oturakları' },
        { key: '04_IcAnadolu/Nevsehir', role: 'Ürgüp – Avanos Bozlakları' },
        { key: '04_IcAnadolu/Yozgat', role: 'Sürmeli & Hastane Önünde İncir Ağacı' }
      ]
    },
    {
      id: 'dogu-anadolu',
      title: 'Doğu Uzun Havaları',
      shortTitle: 'Doğu Uzun Havaları',
      icon: '🏔️',
      accent: '#38bdf8',
      makamId: 'huseyni',
      makamLabel: 'Hüseynî · Karçıgar · Hicaz (Maya / Hoyrat)',
      usul: 'Serbest Usul (Maya, Divan, Hoyrat) & 5/8 – 10/8 Bar',
      instruments: ['Mey', 'Bağlama', 'Gırnata (Klarnet)', 'Davul-Zurna'],
      masters: ['Mükerrem Kemertaş', 'Enver Demirbağ', 'Âşık Şenlik', 'İbrahim Erkal'],
      repertoire: ['Sarı Gelin', 'Yüksek Minarede Kandiller Yanar', 'Çayda Çıra', 'Bülbülüm Altın Kafeste'],
      description:
        'Palandöken’den Harput’a, Aras boylarından Van Gölü’ne uzanan yüksek yayla ikliminin mayaları, Harput divanları ve dadaş barları vakar ile hasreti aynı potada eritir.',
      provinces: [
        { key: '06_DoguAnadolu/Erzurum', role: 'Dadaş Barları & Tatyan Uzun Havaları' },
        { key: '06_DoguAnadolu/Elazig', role: 'Harput Kürsübaşı, Maya & Çayda Çıra' },
        { key: '06_DoguAnadolu/Kars', role: 'Âşık Atışmaları & Kafkas Ezgileri' },
        { key: '06_DoguAnadolu/Erzincan', role: 'Kemah – Tercan Deyişleri & Semah' },
        { key: '06_DoguAnadolu/Van', role: 'Serhat Türküleri & Hoş Bilezik' }
      ]
    },
    {
      id: 'ege',
      title: 'Ege Zeybekleri',
      shortTitle: 'Ege Zeybekleri',
      icon: '🫒',
      accent: '#10b981',
      makamId: 'ussak',
      makamLabel: 'Uşşak · Nihâvend · Nikriz · Hicaz',
      usul: '9/4 Ağır Zeybek, 9/8 Kıvrak Zeybek & 9/16 Teke',
      instruments: ['Üç Telli Bağlama', 'Çift Zurna & Davul', 'Kütahya Bağlaması', 'Kabak Kemane'],
      masters: ['Hisarlı Ahmet', 'Özay Gönlüm', 'Talip Özkan', 'Kerimoğlu Geleneği'],
      repertoire: ['Harmandalı', 'Çökertme', 'Kerimoğlu Zeybeği', 'Ferayi'],
      description:
        'Dokuz zamanlı ağır adımların dağlara meydan okuduğu Ege zeybekleri, Efelerin heybetini ve Yörük obalarının kıvrak saz tavrını taşır.',
      provinces: [
        { key: '02_Ege/Izmir', role: 'Harmandalı & Bergama – Ödemiş Zeybekleri' },
        { key: '02_Ege/Aydin', role: 'İnce Memed & Aydın Efe Havaları' },
        { key: '02_Ege/Mugla', role: 'Çökertme, Kerimoğlu & Ferayi' },
        { key: '02_Ege/Denizli', role: 'Denizli’nin Horozları & Yörük Tavrı' },
        { key: '02_Ege/Kutahya', role: 'Kütahya’nın Pınarları & Hisarlı Geleneği' }
      ]
    },
    {
      id: 'karadeniz',
      title: 'Karadeniz Kemençe & Horon',
      shortTitle: 'Karadeniz Kemençe & Horon',
      icon: '🌲',
      accent: '#00f2fe',
      makamId: 'rast',
      makamLabel: 'Uşşak · Hüseynî · Rast (Karadeniz Tavrı)',
      usul: '7/16 Horon, 5/8 & 9/8 Karşılama, Serbest Yol Havası',
      instruments: ['Karadeniz Kemençesi', 'Tulum', 'Kaval', 'Şimşir Kaşık'],
      masters: ['Hasan Sözeri', 'Erkan Ocaklı', 'Kâzım Koyuncu', 'Volkan Konak'],
      repertoire: ['Maçka Yolları Taşlı', 'Oy Asiye', 'Çayeli’nden Öteye', 'Giresun’un İçinde'],
      description:
        'Sisli yaylalarla hırçın dalgalar arasında kemençenin üç teli ve tulumun kesintisiz nefesi 7/16’lık horonlara can verir; yol havaları ise gurbeti anlatır.',
      provinces: [
        { key: '05_Karadeniz/Trabzon', role: 'Kemençe, Sıksara & Maçka Yol Havaları' },
        { key: '05_Karadeniz/Rize', role: 'Tulum, Hemşin Horonu & Atmaca Türküleri' },
        { key: '05_Karadeniz/Artvin', role: 'Kafkasya Sınırı Akordeon & Atabarı' },
        { key: '05_Karadeniz/Giresun', role: 'Giresun Karşılaması & Görele Kemençesi' },
        { key: '05_Karadeniz/Ordu', role: 'Ordu’nun Dereleri & Karşılama Ezgileri' }
      ]
    },
    {
      id: 'guneydogu',
      title: 'Güneydoğu Hoyrat & Sıra Gecesi',
      shortTitle: 'Güneydoğu Hoyrat & Sıra Gecesi',
      icon: '🕌',
      accent: '#ec4899',
      makamId: 'hicaz',
      makamLabel: 'Hicaz · Saba · Rast · Irak · Muhalif',
      usul: 'Serbest Usul (Hoyrat, Gazel) & 10/8 – 4/4 Çiftetelli',
      instruments: ['Ud', 'Cümbüş', 'Kanun', 'Keman', 'Darbuka & Erbane'],
      masters: ['Kazancı Bedih', 'Mukim Tahir', 'Celal Güzelses', 'Tenekeci Mahmut'],
      repertoire: ['Urfalıyam Ezelden', 'Ağlama Yar Ağlama', 'Diyarbakır Küçeleri', 'Telgrafın Tellerine'],
      description:
        'Şehir mûsikîsi ile halk türküsünün en yoğun buluştuğu Sıra Geceleri ve Kürsübaşı meclislerinde Hicaz, Saba ve Irak makamları hoyratlarla dile gelir.',
      provinces: [
        { key: '07_GuneydoguAnadolu/Sanliurfa', role: 'Sıra Gecesi, Gazel & Muhalif Hoyratlar' },
        { key: '07_GuneydoguAnadolu/Diyarbakir', role: 'Celal Güzelses & Suriçi Makamlı Türküler' },
        { key: '07_GuneydoguAnadolu/Gaziantep', role: 'Barak Uzun Havaları & Antep Halayları' },
        { key: '07_GuneydoguAnadolu/Mardin', role: 'Reyhani & Çok Kültürlü Mezopotamya Ezgileri' },
        { key: '07_GuneydoguAnadolu/Adiyaman', role: 'Harfane Meclisleri & Kahta Türküleri' }
      ]
    },
    {
      id: 'akdeniz',
      title: 'Akdeniz Teke Yöresi',
      shortTitle: 'Akdeniz Teke Yöresi',
      icon: '🍊',
      accent: '#14b8a6',
      makamId: 'segah',
      makamLabel: 'Uşşak · Hüseynî · Segâh (Gurbet Havası)',
      usul: '9/16 Teke Zortlatması, 9/8 Boğaz Havası & Serbest Gurbet',
      instruments: ['Sipsi', 'Cura / İkitelli', 'Üç Telli Bağlama', 'Kaval'],
      masters: ['Özay Gönlüm', 'Sümer Ezgü', 'Ramazan Güngör', 'Musa Eroğlu (Taşeli)'],
      repertoire: ['Serenler Zeybeği', 'Cemilem', 'Yayla Yollarında', 'Silifke’nin Yoğurdu'],
      description:
        'Toroslar’ın yüksek Yörük yaylalarında sipsinin keskin sesi ve curanın 9/16’lık neşesi, gurbet havalarının derin sızısıyla yan yana yaşar.',
      provinces: [
        { key: '03_Akdeniz/Burdur', role: 'Teke Zortlatması & Sipsi Merkezi' },
        { key: '03_Akdeniz/Isparta', role: 'Serenler Zeybeği & Göller Yöresi Havaları' },
        { key: '03_Akdeniz/Antalya', role: 'Elmalı – Korkuteli Boğaz Havaları' },
        { key: '03_Akdeniz/Mersin', role: 'Taşeli – Silifke Türküleri & Kaşık Oyunları' },
        { key: '03_Akdeniz/Adana', role: 'Çukurova Karacaoğlan Deyişleri & Bozlak' }
      ]
    },
    {
      id: 'trakya-rumeli',
      title: 'Trakya & Rumeli Türküleri',
      shortTitle: 'Trakya & Rumeli',
      icon: '🎻',
      accent: '#a855f7',
      makamId: 'nihavend',
      makamLabel: 'Nihâvend · Rast · Hicaz · Karcığar',
      usul: '9/8 Trakya Karşılaması, 7/8 Rumeli Aksağı & 2/4 Hora',
      instruments: ['Klarnet (Gırnata)', 'Keman', 'Cümbüş', 'Gayda', 'Davul'],
      masters: ['Arif Şentürk', 'Neşe Karaböcek (Rumeli)', 'Selim Sesler', 'Mustafa Kandıralı'],
      repertoire: ['Vardar Ovası', 'Çalın Davulları', 'Drama Köprüsü', 'Kızılcıklar Oldu mu'],
      description:
        'Edirne’den Balkanlar’a uzanan Rumeli türküleri; 9/8’lik neşeli Trakya karşılamalarıyla Tuna ve Vardar kıyılarından kalan derin göç hatıralarını harmanlar.',
      provinces: [
        { key: '01_Marmara/Edirne', role: '9/8 Trakya Karşılaması & Darüşşifa Geleneği' },
        { key: '01_Marmara/Kirklareli', role: 'Istranca Gaydası & Rumeli Horaları' },
        { key: '01_Marmara/Tekirdag', role: 'Malkara – Hayrabolu Oyun Havaları' },
        { key: '01_Marmara/Canakkale', role: 'Çanakkale İçinde Aynalı Çarşı & Zeybekler' },
        { key: '01_Marmara/Bursa', role: 'Rumeli Göçmen Türküleri & Kılıç-Kalkan' }
      ]
    }
  ];

  const MOOD_CHIPS = [
    'Yorgunum, zihnimi berraklaştıracak ve nefesimi açacak bir makam arıyorum',
    'İkindi vakti hüzünlü ama içimi ferahlatan derin bir tefekkür istiyorum',
    'Sabah enerjisiyle yola çıkmak ve Anadolu yaylalarını hissetmek istiyorum',
    'Gece vakti gurbet ve hasret duyguma eşlik edecek bir türkü ve şehir öner',
    'Stresimi azaltıp uykuya hazırlayacak dingin bir Darüşşifa şifası arıyorum'
  ];

  // =========================================================================
  // Persistent State & Audio Engine
  // =========================================================================

  const uiState = {
    vakitFilter: 'all',
    selectedRegionId: FOLK_REGIONS[0].id,
    regionSearch: '',
    moodInput: '',
    selectedVakitForAi: 'auto',
    aiLoading: false,
    aiText: '',
    aiSource: '',
    aiRecommendedMakamId: '',
    aiRecommendedCityKey: '',
    aiRunId: 0
  };

  const audioEngine = {
    audioCtx: null,
    masterGain: null,
    activeMakamId: null,
    activeNoteIndex: -1,
    nodes: [],
    timers: [],
    neyAudio: null,
    neyPlaying: false,
    rootEl: null,
    domObserver: null,
    hashListener: null
  };

  function defaultEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function defaultNormalizeTurkish(str) {
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

  function notify(ctx, msg, type) {
    if (ctx && typeof ctx.showToast === 'function') {
      ctx.showToast(msg, type);
    }
  }

  function renderSafeMarkdown(mdText, escFn) {
    if (
      typeof window !== 'undefined' &&
      window.SEYYAH_AI &&
      typeof window.SEYYAH_AI.renderMarkdown === 'function'
    ) {
      return window.SEYYAH_AI.renderMarkdown(mdText, escFn);
    }
    const paragraphs = String(mdText || '')
      .split(/\n{2,}/)
      .map(function (block) {
        return '<p>' + escFn(block).replace(/\n/g, '<br>') + '</p>';
      })
      .join('');
    return paragraphs;
  }

  function formatPlate(plate) {
    if (!plate) return '';
    const n = Number(plate);
    if (!Number.isFinite(n)) return '';
    return n < 10 ? '0' + n : String(n);
  }

  function getCurrentVakitLabel() {
    const h = new Date().getHours();
    if (h >= 4 && h < 7) return 'Seher (04:00–07:00)';
    if (h >= 7 && h < 11) return 'Kuşluk (07:00–11:00)';
    if (h >= 11 && h < 15) return 'Öğle (11:00–15:00)';
    if (h >= 15 && h < 18) return 'İkindi (15:00–18:00)';
    if (h >= 18 && h < 21) return 'Akşam (18:00–21:00)';
    return 'Yatsı / Gece (21:00–04:00)';
  }

  // =========================================================================
  // Audio Engine (Pure Web Audio API Makam Drone + Scale Arpeggio & Ney MP3)
  // =========================================================================

  function clearAudioTimers() {
    while (audioEngine.timers.length) {
      const id = audioEngine.timers.pop();
      clearTimeout(id);
    }
  }

  function stopSynthOnly() {
    clearAudioTimers();
    const nodes = audioEngine.nodes.slice();
    audioEngine.nodes = [];
    const ctx = audioEngine.audioCtx;
    const mg = audioEngine.masterGain;
    audioEngine.masterGain = null;
    audioEngine.activeMakamId = null;
    audioEngine.activeNoteIndex = -1;

    if (mg && ctx && ctx.state !== 'closed') {
      try {
        const now = ctx.currentTime;
        mg.gain.cancelScheduledValues(now);
        mg.gain.setValueAtTime(Math.max(0.0001, mg.gain.value || 0.01), now);
        mg.gain.linearRampToValueAtTime(0.0001, now + 0.12);
      } catch (_) {}
    }

    setTimeout(function () {
      nodes.forEach(function (n) {
        try {
          if (typeof n.stop === 'function') n.stop();
        } catch (_) {}
        try {
          if (typeof n.disconnect === 'function') n.disconnect();
        } catch (_) {}
      });
    }, 140);
  }

  function stopNeyAudio() {
    if (audioEngine.neyAudio) {
      try {
        audioEngine.neyAudio.pause();
        audioEngine.neyAudio.currentTime = 0;
      } catch (_) {}
      audioEngine.neyAudio = null;
    }
    audioEngine.neyPlaying = false;
  }

  function syncAudioUI() {
    const root = audioEngine.rootEl;
    if (!root || !root.isConnected) return;

    const activeId = audioEngine.activeMakamId;
    const activeNote = audioEngine.activeNoteIndex;
    const neyActive = audioEngine.neyPlaying;

    root.querySelectorAll('[data-play-makam]').forEach(function (btn) {
      const id = btn.getAttribute('data-play-makam');
      const isThis = activeId === id;
      btn.classList.toggle('is-playing', isThis);
      btn.innerHTML = isThis
        ? '⏹️ Makamı Durdur'
        : '🎵 Makam Demini &amp; Aralığını Dinle';
    });

    root.querySelectorAll('.makam-card').forEach(function (card) {
      const id = card.getAttribute('data-makam-card');
      card.classList.toggle('is-playing', activeId === id);
    });

    root.querySelectorAll('[data-makam-deg]').forEach(function (pill) {
      const mId = pill.getAttribute('data-makam-deg');
      const idx = Number(pill.getAttribute('data-deg-index'));
      pill.classList.toggle('is-lit', activeId === mId && activeNote === idx);
    });

    root.querySelectorAll('[data-toggle-ney]').forEach(function (btn) {
      btn.classList.toggle('is-playing', neyActive);
      btn.innerHTML = neyActive
        ? '⏹️ Tasavvufi Ney Taksimini Durdur'
        : '🎶 Gerçek Tasavvufi Ney Taksimi (assets/ney_tasavvuf.mp3) Çal';
    });

    const statusBar = root.querySelector('#makam-audio-status');
    if (statusBar) {
      if (activeId || neyActive) {
        const parts = [];
        if (activeId) {
          const m = MAKAMLAR.find(function (x) {
            return x.id === activeId;
          });
          if (m) parts.push('🎵 ' + m.name + ' Makamı Dem & Seyir Sentezi');
        }
        if (neyActive) {
          parts.push('🎶 Gerçek Tasavvufi Ney Taksimi');
        }
        statusBar.classList.add('is-active');
        statusBar.querySelector('.makam-audio-label').textContent = parts.join('  +  ');
      } else {
        statusBar.classList.remove('is-active');
        statusBar.querySelector('.makam-audio-label').textContent =
          'Ses Stüdyosu Hazır — Bir makam demi seçin veya Ney taksimini başlatın';
      }
    }
  }

  function ensureAudioContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioEngine.audioCtx || audioEngine.audioCtx.state === 'closed') {
      audioEngine.audioCtx = new AudioCtx();
    }
    if (audioEngine.audioCtx.state === 'suspended') {
      try {
        audioEngine.audioCtx.resume();
      } catch (_) {}
    }
    return audioEngine.audioCtx;
  }

  function playMakamSynth(makamId, ctxHelpers) {
    if (audioEngine.activeMakamId === makamId) {
      stopSynthOnly();
      syncAudioUI();
      return;
    }

    const makam = MAKAMLAR.find(function (m) {
      return m.id === makamId;
    });
    if (!makam) return;

    const ac = ensureAudioContext();
    if (!ac) {
      notify(ctxHelpers, '⚠️ Tarayıcınız Web Audio API desteklemiyor.', 'warning');
      return;
    }

    // Stop any previous makam synth cleanly before starting the new one
    stopSynthOnly();

    const now = ac.currentTime;
    const masterGain = ac.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.32, now + 0.35);

    const lowpass = ac.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1650, now);
    lowpass.Q.setValueAtTime(0.8, now);

    const compressor = ac.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-16, now);
    compressor.ratio.setValueAtTime(4, now);

    masterGain.connect(lowpass);
    lowpass.connect(compressor);
    compressor.connect(ac.destination);

    audioEngine.masterGain = masterGain;
    audioEngine.activeMakamId = makamId;

    // 1) Warm Continuous Harmonic Drone (Karar Sine + Sub Triangle + Fifth Sine + Breath LFO)
    const droneGain = ac.createGain();
    droneGain.gain.setValueAtTime(0.0001, now);
    droneGain.gain.linearRampToValueAtTime(0.24, now + 0.9);
    droneGain.connect(masterGain);

    const oscRoot = ac.createOscillator();
    oscRoot.type = 'sine';
    oscRoot.frequency.setValueAtTime(makam.drone.rootHz, now);
    const rootGain = ac.createGain();
    rootGain.gain.setValueAtTime(0.55, now);
    oscRoot.connect(rootGain);
    rootGain.connect(droneGain);

    const oscSub = ac.createOscillator();
    oscSub.type = 'triangle';
    oscSub.frequency.setValueAtTime(makam.drone.subHz, now);
    const subGain = ac.createGain();
    subGain.gain.setValueAtTime(0.22, now);
    oscSub.connect(subGain);
    subGain.connect(droneGain);

    const oscFifth = ac.createOscillator();
    oscFifth.type = 'sine';
    oscFifth.frequency.setValueAtTime(makam.drone.fifthHz, now);
    const fifthGain = ac.createGain();
    fifthGain.gain.setValueAtTime(0.26, now);
    oscFifth.connect(fifthGain);
    fifthGain.connect(droneGain);

    // Gentle LFO breathing modulation on drone
    const lfo = ac.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.22, now);
    const lfoDepth = ac.createGain();
    lfoDepth.gain.setValueAtTime(0.045, now);
    lfo.connect(lfoDepth);
    lfoDepth.connect(droneGain.gain);

    oscRoot.start(now);
    oscSub.start(now);
    oscFifth.start(now);
    lfo.start(now);

    audioEngine.nodes.push(
      oscRoot,
      oscSub,
      oscFifth,
      lfo,
      rootGain,
      subGain,
      fifthGain,
      lfoDepth,
      droneGain,
      masterGain,
      lowpass,
      compressor
    );

    // 2) Expressive Makam Scale Arpeggio (Ascending -> Pause on Güçlü -> Descending to Karar)
    const seq = [];
    for (let i = 0; i < makam.scale.length; i++) {
      seq.push({ idx: i, hz: makam.scale[i].hz, dur: i === 4 ? 0.85 : 0.56 });
    }
    for (let j = makam.scale.length - 2; j >= 0; j--) {
      seq.push({ idx: j, hz: makam.scale[j].hz, dur: j === 0 ? 1.45 : 0.54 });
    }

    let offsetSec = 0.45;
    seq.forEach(function (step) {
      const startAt = now + offsetSec;
      const endAt = startAt + step.dur;

      // Blend warm sine + soft triangle harmonic for ney/tanbur-like acoustic warmth
      const noteSine = ac.createOscillator();
      noteSine.type = 'sine';
      noteSine.frequency.setValueAtTime(step.hz, startAt);

      const noteTri = ac.createOscillator();
      noteTri.type = 'triangle';
      noteTri.frequency.setValueAtTime(step.hz, startAt);

      const noteGain = ac.createGain();
      noteGain.gain.setValueAtTime(0.0001, startAt);
      noteGain.gain.linearRampToValueAtTime(0.32, startAt + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.16, startAt + step.dur * 0.55);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, endAt);

      const triMix = ac.createGain();
      triMix.gain.setValueAtTime(0.28, startAt);

      noteSine.connect(noteGain);
      noteTri.connect(triMix);
      triMix.connect(noteGain);
      noteGain.connect(masterGain);

      noteSine.start(startAt);
      noteTri.start(startAt);
      noteSine.stop(endAt + 0.04);
      noteTri.stop(endAt + 0.04);

      audioEngine.nodes.push(noteSine, noteTri, triMix, noteGain);

      const delayMs = Math.max(0, Math.round(offsetSec * 1000));
      const tId = setTimeout(function () {
        if (audioEngine.activeMakamId !== makamId) return;
        if (!audioEngine.rootEl || !audioEngine.rootEl.isConnected) {
          stop();
          return;
        }
        audioEngine.activeNoteIndex = step.idx;
        syncAudioUI();
      }, delayMs);
      audioEngine.timers.push(tId);

      offsetSec += step.dur * 0.88;
    });

    // Keep drone gently breathing for ~2.6s after arpeggio resolves on karar, then fade out cleanly
    const totalMs = Math.round((offsetSec + 2.6) * 1000);
    const fadeTimer = setTimeout(function () {
      if (audioEngine.activeMakamId === makamId) {
        stopSynthOnly();
        syncAudioUI();
      }
    }, totalMs);
    audioEngine.timers.push(fadeTimer);

    syncAudioUI();
    notify(ctxHelpers, '🎵 ' + makam.name + ' makamı demi ve seyri çalınıyor...', 'info');
  }

  function toggleNeyTaksimi(ctxHelpers) {
    if (audioEngine.neyPlaying && audioEngine.neyAudio) {
      stopNeyAudio();
      syncAudioUI();
      notify(ctxHelpers, '🔇 Tasavvufi Ney Taksimi durduruldu.');
      return;
    }

    stopNeyAudio();
    try {
      const audio = new Audio(NEY_AUDIO_SRC);
      audio.loop = true;
      audio.volume = 0.48;
      audioEngine.neyAudio = audio;
      audioEngine.neyPlaying = true;
      syncAudioUI();

      audio.addEventListener('ended', function () {
        audioEngine.neyPlaying = false;
        syncAudioUI();
      });

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          audioEngine.neyPlaying = false;
          audioEngine.neyAudio = null;
          syncAudioUI();
          notify(ctxHelpers, '⚠️ Ney taksimi ses dosyası başlatılamadı; tekrar deneyin.', 'warning');
        });
      } else {
        notify(ctxHelpers, '🎶 Gerçek Tasavvufi Ney Taksimi çalınıyor...', 'success');
      }
    } catch (_) {
      audioEngine.neyPlaying = false;
      audioEngine.neyAudio = null;
      syncAudioUI();
    }
  }

  function stop() {
    stopSynthOnly();
    stopNeyAudio();

    if (audioEngine.domObserver) {
      try {
        audioEngine.domObserver.disconnect();
      } catch (_) {}
      audioEngine.domObserver = null;
    }
    if (audioEngine.hashListener) {
      window.removeEventListener('hashchange', audioEngine.hashListener);
      audioEngine.hashListener = null;
    }

    syncAudioUI();
  }

  // =========================================================================
  // AI + Offline Mood Matcher
  // =========================================================================

  function pickOfflineMatch(moodText, vakitPref) {
    const normMood = defaultNormalizeTurkish(moodText || '');
    const hour = new Date().getHours();
    const autoVakit =
      hour >= 4 && hour < 7
        ? 'seher'
        : hour >= 7 && hour < 11
          ? 'kusluk'
          : hour >= 11 && hour < 15
            ? 'ogle'
            : hour >= 15 && hour < 18
              ? 'ikindi'
              : hour >= 18 && hour < 21
                ? 'aksam'
                : 'yatsi';
    const effectiveVakit = vakitPref && vakitPref !== 'auto' ? vakitPref : autoVakit;

    let bestMakam = MAKAMLAR[0];
    let bestScore = -1;

    MAKAMLAR.forEach(function (m) {
      let score = 0;
      if (m.vakitTags.indexOf(effectiveVakit) !== -1) score += 2;
      (m.moodKeywords || []).forEach(function (kw) {
        if (normMood.indexOf(kw) !== -1) score += 3;
      });
      if (normMood.indexOf(defaultNormalizeTurkish(m.name)) !== -1) score += 5;
      if (score > bestScore) {
        bestScore = score;
        bestMakam = m;
      }
    });

    const matchedRegion =
      FOLK_REGIONS.find(function (r) {
        return r.makamId === bestMakam.id;
      }) || FOLK_REGIONS[0];

    const recommendedCityKey = bestMakam.cities[0] || matchedRegion.provinces[0].key;
    return {
      makam: bestMakam,
      region: matchedRegion,
      cityKey: recommendedCityKey,
      vakitLabel: getCurrentVakitLabel()
    };
  }

  function buildOfflineMoodMarkdown(moodText, match, provinces) {
    const prov = provinces[match.cityKey] || {};
    const cityName = prov.name || match.cityKey.split('/')[1] || 'Anadolu';
    const turku = match.region.repertoire[0] || 'Gönül Dağı';
    const master = match.region.masters[0] || 'Anadolu Ozanı';

    return [
      '### 🎼 Fârâbî & Darüşşifa Reçetesi: **' + match.makam.name + ' Makamı**',
      '- **Önerilen Vakit & Mizaç:** ' + match.makam.vakit + ' (' + match.makam.element + ')',
      '- **Ruh Şifası:** ' + match.makam.healing,
      '- **Mûsikî Sırrı:** ' + match.makam.farabiNote,
      '',
      '### 🪕 Türkü & Bölge Eşleşmesi: **' + match.region.title + '**',
      '- **Eşlikçi Türkü:** *' + turku + '* (' + master + ' geleneği)',
      '- **Sazlar & Usul:** ' + match.region.instruments.slice(0, 3).join(', ') + ' · ' + match.region.usul,
      '',
      '### 📍 Seyahat Rotası: **' + cityName + '**',
      'Ruh hâliniz ("' + (moodText || 'günlük tefekkür') + '") için **' + cityName + '** atmosferinde ' +
        match.makam.name + ' makamının dinginliğini dinleyip *' + turku + '* eşliğinde yürümek kalbinize denge getirecektir.'
    ].join('\n');
  }

  // =========================================================================
  // Scoped CSS (Dark + body.light-theme compatible)
  // =========================================================================

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .makam-studio {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-bottom: 32px;
        animation: makamFadeIn 0.35s ease;
      }

      @keyframes makamFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Hero */
      .makam-hero {
        position: relative;
        overflow: hidden;
        padding: 26px 28px;
        border-radius: 20px;
        background:
          radial-gradient(circle at 88% 15%, rgba(245, 158, 11, 0.18), transparent 44%),
          radial-gradient(circle at 12% 85%, rgba(0, 242, 254, 0.14), transparent 48%),
          linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.85));
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 18px 40px -15px rgba(0, 0, 0, 0.55);
      }

      .makam-hero-top {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
      }

      .makam-hero h2 {
        margin: 0 0 8px 0;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.65rem;
        line-height: 1.25;
        background: linear-gradient(135deg, #f8fafc 0%, #fde68a 45%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .makam-hero-sub {
        margin: 0;
        max-width: 780px;
        color: #cbd5e1;
        font-size: 0.94rem;
        line-height: 1.6;
      }

      .makam-hero-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        margin-top: 16px;
      }

      .makam-ney-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: 999px;
        border: 1px solid rgba(245, 158, 11, 0.48);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(217, 119, 6, 0.14));
        color: #fef3c7;
        font-weight: 600;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.22s ease;
      }

      .makam-ney-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.28);
        border-color: rgba(251, 191, 36, 0.85);
      }

      .makam-ney-btn.is-playing {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #0f172a;
        border-color: #fde68a;
        box-shadow: 0 0 22px rgba(245, 158, 11, 0.45);
      }

      .makam-stop-all-btn {
        padding: 9px 15px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(15, 23, 42, 0.65);
        color: #e2e8f0;
        font-size: 0.84rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .makam-stop-all-btn:hover {
        border-color: rgba(248, 113, 113, 0.6);
        color: #fecaca;
      }

      .makam-stats-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 16px;
      }

      .makam-stat-pill {
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #cbd5e1;
        font-size: 0.78rem;
        font-weight: 500;
      }

      /* Live Audio Status Bar */
      .makam-audio-status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 16px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 0.84rem;
        color: #94a3b8;
        transition: all 0.25s ease;
      }

      .makam-audio-status.is-active {
        border-color: rgba(0, 242, 254, 0.45);
        background: linear-gradient(90deg, rgba(0, 242, 254, 0.12), rgba(245, 158, 11, 0.1));
        color: #f8fafc;
        box-shadow: 0 0 20px rgba(0, 242, 254, 0.14);
      }

      .makam-eq-bars {
        display: inline-flex;
        align-items: flex-end;
        gap: 3px;
        height: 14px;
        margin-right: 8px;
      }

      .makam-eq-bars span {
        display: block;
        width: 3px;
        height: 4px;
        border-radius: 2px;
        background: #00f2fe;
        transition: height 0.2s ease;
      }

      .makam-audio-status.is-active .makam-eq-bars span {
        animation: makamEq 0.9s infinite ease-in-out;
      }
      .makam-audio-status.is-active .makam-eq-bars span:nth-child(2) { animation-delay: 0.2s; }
      .makam-audio-status.is-active .makam-eq-bars span:nth-child(3) { animation-delay: 0.4s; }
      .makam-audio-status.is-active .makam-eq-bars span:nth-child(4) { animation-delay: 0.6s; }

      @keyframes makamEq {
        0%, 100% { height: 4px; }
        50% { height: 14px; }
      }

      /* Section Headers */
      .makam-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 22px;
        border-radius: 18px;
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .makam-section-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-end;
        gap: 12px;
      }

      .makam-section-head h3 {
        margin: 0;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.22rem;
        color: #f8fafc;
      }

      .makam-section-sub {
        margin: 4px 0 0 0;
        color: #94a3b8;
        font-size: 0.86rem;
      }

      /* Filter Chips */
      .makam-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .makam-chip {
        padding: 7px 13px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(30, 41, 59, 0.65);
        color: #cbd5e1;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .makam-chip:hover {
        border-color: rgba(0, 242, 254, 0.45);
        color: #f8fafc;
      }

      .makam-chip.active {
        background: rgba(0, 242, 254, 0.18);
        border-color: #00f2fe;
        color: #00f2fe;
        font-weight: 600;
      }

      /* Makam Grid */
      .makam-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
        gap: 16px;
      }

      .makam-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        padding: 18px;
        border-radius: 16px;
        background: rgba(30, 41, 59, 0.64);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.25s ease;
      }

      .makam-card:hover {
        border-color: rgba(0, 242, 254, 0.35);
        transform: translateY(-2px);
      }

      .makam-card.is-playing {
        border-color: rgba(0, 242, 254, 0.72);
        box-shadow: 0 0 24px rgba(0, 242, 254, 0.2);
        background: rgba(30, 41, 59, 0.88);
      }

      .makam-card-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }

      .makam-name {
        margin: 0;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.2rem;
        color: #f8fafc;
      }

      .makam-root-meta {
        font-size: 0.77rem;
        color: #94a3b8;
        margin-top: 2px;
      }

      .makam-vakit-badge {
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.74rem;
        font-weight: 600;
        white-space: nowrap;
      }

      .makam-element-line {
        font-size: 0.76rem;
        color: #cbd5e1;
        opacity: 0.88;
      }

      .makam-healing-box {
        padding: 11px 12px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.6);
        border-left: 3px solid var(--makam-accent, #00f2fe);
        font-size: 0.84rem;
        color: #e2e8f0;
        line-height: 1.55;
      }

      .makam-farabi-note {
        font-size: 0.79rem;
        color: #94a3b8;
        line-height: 1.5;
      }

      .makam-scale-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .makam-deg-pill {
        padding: 3px 8px;
        border-radius: 8px;
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        font-size: 0.71rem;
        transition: all 0.15s ease;
      }

      .makam-deg-pill.is-lit {
        background: rgba(0, 242, 254, 0.25);
        border-color: #00f2fe;
        color: #f8fafc;
        transform: scale(1.06);
        box-shadow: 0 0 10px rgba(0, 242, 254, 0.4);
      }

      .makam-city-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .makam-city-btn {
        padding: 5px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(15, 23, 42, 0.65);
        color: #e2e8f0;
        font-size: 0.76rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .makam-city-btn:hover {
        border-color: #00f2fe;
        color: #00f2fe;
        background: rgba(0, 242, 254, 0.1);
      }

      .makam-play-btn {
        width: 100%;
        padding: 10px 14px;
        border-radius: 12px;
        border: 1px solid rgba(0, 242, 254, 0.4);
        background: rgba(0, 242, 254, 0.12);
        color: #e0f2fe;
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .makam-play-btn:hover {
        background: rgba(0, 242, 254, 0.22);
        border-color: #00f2fe;
      }

      .makam-play-btn.is-playing {
        background: linear-gradient(135deg, #00f2fe, #4facfe);
        color: #0f172a;
        border-color: transparent;
      }

      /* Section 2: 7 Bölge Türkü Atlası */
      .turku-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .turku-tab-btn {
        padding: 8px 13px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(30, 41, 59, 0.62);
        color: #cbd5e1;
        font-size: 0.82rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .turku-tab-btn:hover {
        border-color: rgba(245, 158, 11, 0.48);
        color: #f8fafc;
      }

      .turku-tab-btn.active {
        background: rgba(245, 158, 11, 0.18);
        border-color: #f59e0b;
        color: #fde68a;
        font-weight: 600;
      }

      .turku-dossier {
        padding: 20px;
        border-radius: 16px;
        background: rgba(30, 41, 59, 0.56);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .turku-dossier-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }

      .turku-dossier-title {
        margin: 0 0 6px 0;
        font-size: 1.25rem;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        color: #f8fafc;
      }

      .turku-dossier-desc {
        margin: 0;
        color: #cbd5e1;
        font-size: 0.88rem;
        line-height: 1.6;
        max-width: 820px;
      }

      .turku-meta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
      }

      .turku-meta-box {
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .turku-meta-label {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #94a3b8;
        margin-bottom: 5px;
      }

      .turku-meta-value {
        font-size: 0.84rem;
        color: #f1f5f9;
        line-height: 1.5;
      }

      .turku-province-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
        gap: 12px;
      }

      .turku-province-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
        padding: 14px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        text-align: left;
        transition: all 0.22s ease;
      }

      .turku-province-card:hover {
        border-color: rgba(0, 242, 254, 0.55);
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35);
      }

      .turku-prov-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .turku-prov-name {
        font-weight: 700;
        font-size: 0.96rem;
        color: #f8fafc;
      }

      .turku-prov-plate {
        padding: 2px 8px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.08);
        color: #cbd5e1;
        font-size: 0.74rem;
        font-weight: 700;
      }

      .turku-prov-role {
        font-size: 0.81rem;
        color: #fde68a;
        line-height: 1.45;
      }

      .turku-prov-quote {
        font-size: 0.77rem;
        color: #94a3b8;
        font-style: italic;
        line-height: 1.45;
      }

      .turku-prov-cta {
        font-size: 0.76rem;
        color: #00f2fe;
        font-weight: 600;
      }

      /* Section 3: AI Mood Studio */
      .makam-ai-box {
        padding: 22px;
        border-radius: 18px;
        background:
          radial-gradient(circle at 95% 10%, rgba(168, 85, 247, 0.15), transparent 40%),
          rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(168, 85, 247, 0.3);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .makam-ai-controls {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: start;
      }

      .makam-textarea {
        width: 100%;
        min-height: 76px;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(15, 23, 42, 0.8);
        color: #f8fafc;
        font-family: inherit;
        font-size: 0.88rem;
        resize: vertical;
      }

      .makam-textarea:focus {
        outline: none;
        border-color: #a855f7;
      }

      .makam-select {
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(15, 23, 42, 0.88);
        color: #f8fafc;
        font-size: 0.84rem;
      }

      .makam-ai-submit {
        padding: 11px 18px;
        border-radius: 12px;
        border: none;
        background: linear-gradient(135deg, #a855f7, #00f2fe);
        color: #0f172a;
        font-weight: 700;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .makam-ai-submit:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(168, 85, 247, 0.35);
      }

      .makam-ai-submit:disabled {
        opacity: 0.6;
        cursor: wait;
      }

      .makam-ai-paper {
        padding: 16px 18px;
        border-radius: 14px;
        background: rgba(30, 41, 59, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #e2e8f0;
        font-size: 0.9rem;
        line-height: 1.65;
      }

      .makam-ai-paper h3,
      .makam-ai-paper h4 {
        color: #fde68a;
        margin: 10px 0 6px 0;
      }

      .makam-ai-paper ul {
        padding-left: 18px;
        margin: 6px 0;
      }

      .makam-ai-paper-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 0.78rem;
        color: #94a3b8;
      }

      .makam-ai-quick-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }

      /* Light Theme Overrides */
      body.light-theme .makam-hero {
        background:
          radial-gradient(circle at 88% 15%, rgba(245, 158, 11, 0.14), transparent 44%),
          radial-gradient(circle at 12% 85%, rgba(2, 132, 199, 0.12), transparent 48%),
          linear-gradient(135deg, #ffffff, #f1f5f9);
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 12px 28px -12px rgba(15, 23, 42, 0.15);
      }

      body.light-theme .makam-hero h2 {
        background: linear-gradient(135deg, #0f172a 0%, #b45309 55%, #0284c7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .makam-hero-sub,
      body.light-theme .makam-section-sub,
      body.light-theme .makam-root-meta,
      body.light-theme .makam-farabi-note,
      body.light-theme .makam-element-line,
      body.light-theme .turku-prov-quote,
      body.light-theme .turku-meta-label {
        color: #475569;
      }

      body.light-theme .makam-section,
      body.light-theme .makam-ai-box {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .makam-card,
      body.light-theme .turku-dossier,
      body.light-theme .makam-ai-paper {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.1);
        color: #1e293b;
      }

      body.light-theme .makam-card.is-playing {
        background: #ffffff;
        border-color: #0284c7;
        box-shadow: 0 8px 24px rgba(2, 132, 199, 0.16);
      }

      body.light-theme .makam-section-head h3,
      body.light-theme .makam-name,
      body.light-theme .turku-dossier-title,
      body.light-theme .turku-prov-name,
      body.light-theme .turku-meta-value {
        color: #0f172a;
      }

      body.light-theme .makam-healing-box,
      body.light-theme .turku-meta-box,
      body.light-theme .turku-province-card,
      body.light-theme .makam-audio-status,
      body.light-theme .makam-stat-pill,
      body.light-theme .makam-deg-pill,
      body.light-theme .makam-chip,
      body.light-theme .turku-tab-btn,
      body.light-theme .makam-city-btn,
      body.light-theme .makam-stop-all-btn,
      body.light-theme .makam-textarea,
      body.light-theme .makam-select {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.14);
        color: #1e293b;
      }

      body.light-theme .makam-healing-box,
      body.light-theme .turku-dossier-desc {
        color: #334155;
      }

      body.light-theme .makam-chip.active,
      body.light-theme .makam-play-btn {
        background: rgba(2, 132, 199, 0.12);
        border-color: #0284c7;
        color: #0369a1;
      }

      body.light-theme .makam-play-btn.is-playing {
        background: linear-gradient(135deg, #0284c7, #0ea5e9);
        color: #ffffff;
      }

      body.light-theme .turku-tab-btn.active {
        background: rgba(217, 119, 6, 0.14);
        border-color: #d97706;
        color: #92400e;
      }

      body.light-theme .makam-ney-btn {
        color: #92400e;
        background: rgba(245, 158, 11, 0.16);
      }

      body.light-theme .makam-ney-btn.is-playing {
        color: #ffffff;
      }

      body.light-theme .turku-prov-role {
        color: #b45309;
      }

      body.light-theme .turku-prov-cta {
        color: #0284c7;
      }

      body.light-theme .makam-ai-paper h3,
      body.light-theme .makam-ai-paper h4 {
        color: #92400e;
      }

      body.light-theme .makam-audio-status.is-active {
        background: linear-gradient(90deg, rgba(2, 132, 199, 0.12), rgba(245, 158, 11, 0.12));
        color: #0f172a;
      }

      @media (max-width: 720px) {
        .makam-grid {
          grid-template-columns: 1fr;
        }
        .makam-ai-controls {
          grid-template-columns: 1fr;
        }
        .makam-hero {
          padding: 20px;
        }
        .makam-section {
          padding: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // Main Render
  // =========================================================================

  function render(container, ctx) {
    if (!container) return;
    stop();
    injectStyles();

    const esc = ctx && typeof ctx.escapeHtml === 'function' ? ctx.escapeHtml : defaultEscapeHtml;
    const provinces = (ctx && ctx.data && ctx.data.provinces) || {};
    const ctxHelpers = {
      showToast: ctx && typeof ctx.showToast === 'function' ? ctx.showToast : null
    };

    const hasAiClient =
      typeof window !== 'undefined' &&
      window.SEYYAH_AI &&
      typeof window.SEYYAH_AI.stream === 'function';
    const hasAiKey =
      hasAiClient &&
      typeof window.SEYYAH_AI.hasKey === 'function' &&
      window.SEYYAH_AI.hasKey();

    function openCity(key) {
      if (!key) return;
      stop();
      if (ctx && typeof ctx.selectCity === 'function') {
        ctx.selectCity(key);
      }
    }

    function getCityLabel(key) {
      const p = provinces[key];
      if (!p) return key.split('/')[1] || key;
      const plate = formatPlate(p.plate);
      return (plate ? plate + ' ' : '') + (p.name || key.split('/')[1] || key);
    }

    function renderMakamGrid() {
      const filtered = MAKAMLAR.filter(function (m) {
        if (uiState.vakitFilter === 'all') return true;
        return m.vakitTags.indexOf(uiState.vakitFilter) !== -1;
      });

      return filtered
        .map(function (m) {
          const isPlaying = audioEngine.activeMakamId === m.id;
          const degHtml = m.scale
            .map(function (deg, idx) {
              const lit = isPlaying && audioEngine.activeNoteIndex === idx ? ' is-lit' : '';
              return (
                '<span class="makam-deg-pill' + lit + '" data-makam-deg="' + esc(m.id) + '" data-deg-index="' + idx + '">' +
                  esc(deg.label) +
                '</span>'
              );
            })
            .join('');

          const citiesHtml = m.cities
            .map(function (cKey) {
              return (
                '<button type="button" class="makam-city-btn" data-open-city="' + esc(cKey) + '">' +
                  '📍 ' + esc(getCityLabel(cKey)) +
                '</button>'
              );
            })
            .join('');

          return (
            '<article class="makam-card' + (isPlaying ? ' is-playing' : '') + '" data-makam-card="' + esc(m.id) + '" style="--makam-accent:' + esc(m.accent) + ';">' +
              '<div class="makam-card-top">' +
                '<div>' +
                  '<h4 class="makam-name">' + esc(m.name) + ' Makamı</h4>' +
                  '<div class="makam-root-meta">' + esc(m.arabicRoot) + '</div>' +
                '</div>' +
                '<span class="makam-vakit-badge" style="color:' + esc(m.accent) + ';background:' + esc(m.badgeBg) + ';">' +
                  '🕰️ ' + esc(m.vakit) +
                '</span>' +
              '</div>' +

              '<div class="makam-element-line">✨ <strong>Tabiat / Unsur:</strong> ' + esc(m.element) + '</div>' +

              '<div class="makam-healing-box">' +
                '<strong>Darüşşifa Şifası:</strong> ' + esc(m.healing) +
              '</div>' +

              '<div class="makam-farabi-note">📜 ' + esc(m.farabiNote) + '</div>' +

              '<div class="makam-scale-strip" aria-label="Makam Seyri">' + degHtml + '</div>' +

              '<div class="makam-city-chips">' + citiesHtml + '</div>' +

              '<button type="button" class="makam-play-btn' + (isPlaying ? ' is-playing' : '') + '" data-play-makam="' + esc(m.id) + '">' +
                (isPlaying ? '⏹️ Makamı Durdur' : '🎵 Makam Demini &amp; Aralığını Dinle') +
              '</button>' +
            '</article>'
          );
        })
        .join('');
    }

    function renderRegionDossier() {
      const reg =
        FOLK_REGIONS.find(function (r) {
          return r.id === uiState.selectedRegionId;
        }) || FOLK_REGIONS[0];

      const provCards = reg.provinces
        .map(function (item) {
          const p = provinces[item.key] || {};
          const plate = formatPlate(p.plate);
          const name = p.name || item.key.split('/')[1] || item.key;
          const quote =
            typeof p.quote === 'string' && p.quote.trim()
              ? '“' + p.quote.trim().slice(0, 105) + (p.quote.trim().length > 105 ? '…' : '') + '”'
              : (Array.isArray(p.landmarks) && p.landmarks[0] ? '🏛️ ' + p.landmarks[0] : '');

          return (
            '<button type="button" class="turku-province-card" data-open-city="' + esc(item.key) + '">' +
              '<div>' +
                '<div class="turku-prov-top">' +
                  '<span class="turku-prov-name">' + esc(name) + '</span>' +
                  (plate ? '<span class="turku-prov-plate">' + esc(plate) + '</span>' : '') +
                '</div>' +
                '<div class="turku-prov-role">' + esc(item.role) + '</div>' +
              '</div>' +
              (quote ? '<div class="turku-prov-quote">' + esc(quote) + '</div>' : '') +
              '<div class="turku-prov-cta">İl Dosyasını Aç →</div>' +
            '</button>'
          );
        })
        .join('');

      return (
        '<div class="turku-dossier">' +
          '<div class="turku-dossier-head">' +
            '<div>' +
              '<h4 class="turku-dossier-title">' + esc(reg.icon + ' ' + reg.title) + '</h4>' +
              '<p class="turku-dossier-desc">' + esc(reg.description) + '</p>' +
            '</div>' +
            '<button type="button" class="makam-chip" data-play-makam="' + esc(reg.makamId) + '">' +
              '🎵 Yöre Makamını Dinle' +
            '</button>' +
          '</div>' +

          '<div class="turku-meta-grid">' +
            '<div class="turku-meta-box">' +
              '<div class="turku-meta-label">🎼 Baskın Makam / Ayak</div>' +
              '<div class="turku-meta-value">' + esc(reg.makamLabel) + '</div>' +
            '</div>' +
            '<div class="turku-meta-box">' +
              '<div class="turku-meta-label">🥁 Usul &amp; Ritim Yapısı</div>' +
              '<div class="turku-meta-value">' + esc(reg.usul) + '</div>' +
            '</div>' +
            '<div class="turku-meta-box">' +
              '<div class="turku-meta-label">🪕 Yöresel Sazlar</div>' +
              '<div class="turku-meta-value">' + esc(reg.instruments.join(' · ')) + '</div>' +
            '</div>' +
            '<div class="turku-meta-box">' +
              '<div class="turku-meta-label">🎙️ Büyük Ustalar &amp; Türküler</div>' +
              '<div class="turku-meta-value">' +
                esc(reg.masters.slice(0, 3).join(', ')) + '<br>' +
                '<em>' + esc(reg.repertoire.join(' · ')) + '</em>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="turku-province-grid">' + provCards + '</div>' +
        '</div>'
      );
    }

    function renderAiPaper() {
      if (!uiState.aiText && !uiState.aiLoading) return '';
      const bodyHtml = uiState.aiText
        ? renderSafeMarkdown(uiState.aiText, esc)
        : '<p>⏳ Fârâbî’nin mûsikî risaleleri ve Anadolu türkü hafızası taranıyor...</p>';

      const recMakam = MAKAMLAR.find(function (m) {
        return m.id === uiState.aiRecommendedMakamId;
      });
      const recCityKey = uiState.aiRecommendedCityKey;

      return (
        '<div class="makam-ai-paper">' +
          '<div class="makam-ai-paper-head">' +
            '<span>' + esc(uiState.aiSource || '✨ Gemini AI Eşleştirme') + '</span>' +
            '<span>🕰️ Vakit: ' + esc(getCurrentVakitLabel()) + '</span>' +
          '</div>' +
          '<div>' + bodyHtml + '</div>' +
          '<div class="makam-ai-quick-actions">' +
            (recMakam
              ? '<button type="button" class="makam-chip" data-play-makam="' + esc(recMakam.id) + '">🎵 Önerilen ' + esc(recMakam.name) + ' Makamını Dinle</button>'
              : '') +
            (recCityKey
              ? '<button type="button" class="makam-city-btn" data-open-city="' + esc(recCityKey) + '">📍 Önerilen Şehri Aç: ' + esc(getCityLabel(recCityKey)) + '</button>'
              : '') +
          '</div>' +
        '</div>'
      );
    }

    const vakitButtonsHtml = VAKIT_FILTERS.map(function (vf) {
      const cls = vf.id === uiState.vakitFilter ? ' active' : '';
      return (
        '<button type="button" class="makam-chip' + cls + '" data-vakit-filter="' + esc(vf.id) + '">' +
          esc(vf.icon + ' ' + vf.label) +
        '</button>'
      );
    }).join('');

    const regionTabsHtml = FOLK_REGIONS.map(function (r) {
      const cls = r.id === uiState.selectedRegionId ? ' active' : '';
      return (
        '<button type="button" class="turku-tab-btn' + cls + '" data-region-tab="' + esc(r.id) + '">' +
          esc(r.icon + ' ' + r.shortTitle) +
        '</button>'
      );
    }).join('');

    const moodChipsHtml = MOOD_CHIPS.map(function (chip) {
      return (
        '<button type="button" class="makam-chip" data-mood-chip="' + esc(chip) + '">' +
          '+ ' + esc(chip.slice(0, 44)) + (chip.length > 44 ? '…' : '') +
        '</button>'
      );
    }).join('');

    container.innerHTML = '';
    const rootEl = document.createElement('div');
    rootEl.className = 'makam-studio';
    rootEl.innerHTML =
      '<section class="makam-hero">' +
        '<div class="makam-hero-top">' +
          '<div>' +
            '<h2>🎶 Anadolu Makamları, Fârâbî Mûsikî Şifası &amp; Türkü Coğrafyası</h2>' +
            '<p class="makam-hero-sub">' +
              'Fârâbî’nin <em>Kitâbü’l-Mûsîka’l-Kebîr</em>’inden İbn Sînâ’nın <em>Kitâbü’ş-Şifâ</em>’sına ve Anadolu darüşşifalarına uzanan 8 klasik makamı vakitlerine göre keşfedin; mikrotonal Web Audio demini veya gerçek tasavvufi ney taksimini dinleyin, 7 bölgenin türkü coğrafyasında dolaşın.' +
            '</p>' +
          '</div>' +
        '</div>' +

        '<div class="makam-hero-actions">' +
          '<button type="button" class="makam-ney-btn" data-toggle-ney="1">' +
            '🎶 Gerçek Tasavvufi Ney Taksimi (assets/ney_tasavvuf.mp3) Çal' +
          '</button>' +
          '<button type="button" class="makam-stop-all-btn" data-stop-all="1">' +
            '⏹️ Tüm Sesleri Durdur' +
          '</button>' +
        '</div>' +

        '<div class="makam-stats-row">' +
          '<span class="makam-stat-pill">🎼 8 Klasik Makam &amp; Darüşşifa Şifası</span>' +
          '<span class="makam-stat-pill">🕰️ Şu Anki Vakit: ' + esc(getCurrentVakitLabel()) + '</span>' +
          '<span class="makam-stat-pill">🪕 7 Bölge Türkü Coğrafyası</span>' +
          '<span class="makam-stat-pill">🔊 Saf Web Audio Mikrotonal Sentez</span>' +
        '</div>' +
      '</section>' +

      '<div id="makam-audio-status" class="makam-audio-status">' +
        '<div>' +
          '<span class="makam-eq-bars"><span></span><span></span><span></span><span></span></span>' +
          '<span class="makam-audio-label">Ses Stüdyosu Hazır — Bir makam demi seçin veya Ney taksimini başlatın</span>' +
        '</div>' +
        '<button type="button" class="makam-chip" data-stop-all="1">🔇 Sustur</button>' +
      '</div>' +

      '<section class="makam-section">' +
        '<div class="makam-section-head">' +
          '<div>' +
            '<h3>🎼 1. Fârâbî &amp; İbn Sînâ’ya Göre 8 Klasik Makam, Vakitleri ve Ruh Şifası</h3>' +
            '<p class="makam-section-sub">Her makam kartında vakit uyumu, darüşşifa geleneğindeki şifa tesiri, şehir eşleşmeleri ve canlı Web Audio dem + seyir arpeji yer alır.</p>' +
          '</div>' +
          '<button type="button" class="makam-ney-btn" data-toggle-ney="1">' +
            '🎶 Gerçek Tasavvufi Ney Taksimi (assets/ney_tasavvuf.mp3) Çal' +
          '</button>' +
        '</div>' +

        '<div class="makam-chip-row" id="makam-vakit-filters">' + vakitButtonsHtml + '</div>' +
        '<div class="makam-grid" id="makam-cards-grid">' + renderMakamGrid() + '</div>' +
      '</section>' +

      '<section class="makam-section">' +
        '<div class="makam-section-head">' +
          '<div>' +
            '<h3>🪕 2. 7 Bölge Anadolu Türkü &amp; Halk Müziği Atlası</h3>' +
            '<p class="makam-section-sub">Bozlaklardan horonlara, zeybeklerden sıra gecelerine uzanan 7 yörenin sazları, usulleri ve il kartları (tıklayarak şehre gidin).</p>' +
          '</div>' +
        '</div>' +

        '<div class="turku-tabs" id="turku-region-tabs">' + regionTabsHtml + '</div>' +
        '<div id="turku-region-dossier">' + renderRegionDossier() + '</div>' +
      '</section>' +

      '<section class="makam-ai-box">' +
        '<div class="makam-section-head">' +
          '<div>' +
            '<h3>✨ Gemini AI ile Ruh Halime Uygun Makam, Türkü ve Şehir Eşleştir</h3>' +
            '<p class="makam-section-sub">Şu anki ruh hâlinizi veya günün vaktini yazın; Fârâbî’nin mûsikî şifası ve Anadolu türkü coğrafyası ışığında size özel eşleştirme sunulsun.</p>' +
          '</div>' +
        '</div>' +

        '<div class="makam-chip-row">' + moodChipsHtml + '</div>' +

        '<div class="makam-ai-controls">' +
          '<textarea id="makam-mood-input" class="makam-textarea" placeholder="Örn: Akşam üzeri biraz yorgunum, kalbimi yumuşatacak derin bir makam ve Anadolu şehri öner...">' +
            esc(uiState.moodInput) +
          '</textarea>' +
          '<div style="display:flex;flex-direction:column;gap:8px;">' +
            '<select id="makam-ai-vakit" class="makam-select" aria-label="Vakit Seçimi">' +
              '<option value="auto"' + (uiState.selectedVakitForAi === 'auto' ? ' selected' : '') + '>🕰️ Otomatik Vakit (' + esc(getCurrentVakitLabel().split(' ')[0]) + ')</option>' +
              '<option value="seher"' + (uiState.selectedVakitForAi === 'seher' ? ' selected' : '') + '>🌅 Seher</option>' +
              '<option value="kusluk"' + (uiState.selectedVakitForAi === 'kusluk' ? ' selected' : '') + '>☀️ Kuşluk</option>' +
              '<option value="ogle"' + (uiState.selectedVakitForAi === 'ogle' ? ' selected' : '') + '>🌤️ Öğle</option>' +
              '<option value="ikindi"' + (uiState.selectedVakitForAi === 'ikindi' ? ' selected' : '') + '>🌇 İkindi</option>' +
              '<option value="aksam"' + (uiState.selectedVakitForAi === 'aksam' ? ' selected' : '') + '>🌆 Akşam</option>' +
              '<option value="yatsi"' + (uiState.selectedVakitForAi === 'yatsi' ? ' selected' : '') + '>🌙 Yatsı / Gece</option>' +
            '</select>' +
            '<button type="button" id="makam-ai-btn" class="makam-ai-submit">' +
              '✨ Gemini AI ile Ruh Halime Uygun Makam, Türkü ve Şehir Eşleştir' +
            '</button>' +
          '</div>' +
        '</div>' +

        '<div id="makam-ai-output">' + renderAiPaper() + '</div>' +
      '</section>';

    container.appendChild(rootEl);
    audioEngine.rootEl = rootEl;

    // Auto-stop Web Audio & Ney audio when view changes or rootEl is removed from DOM
    if (typeof MutationObserver !== 'undefined' && container.parentNode) {
      const obs = new MutationObserver(function () {
        if (!rootEl.isConnected) {
          stop();
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      audioEngine.domObserver = obs;
    }

    audioEngine.hashListener = function () {
      if (!rootEl.isConnected) {
        stop();
      }
    };
    window.addEventListener('hashchange', audioEngine.hashListener);

    function updateMakamGridDom() {
      const grid = rootEl.querySelector('#makam-cards-grid');
      if (grid) grid.innerHTML = renderMakamGrid();
      syncAudioUI();
    }

    function updateRegionDossierDom() {
      const box = rootEl.querySelector('#turku-region-dossier');
      if (box) box.innerHTML = renderRegionDossier();
      rootEl.querySelectorAll('[data-region-tab]').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-region-tab') === uiState.selectedRegionId);
      });
      syncAudioUI();
    }

    function updateAiOutputDom() {
      const out = rootEl.querySelector('#makam-ai-output');
      if (out) out.innerHTML = renderAiPaper();
      const btn = rootEl.querySelector('#makam-ai-btn');
      if (btn) btn.disabled = uiState.aiLoading;
    }

    async function runAiMoodMatch() {
      const textarea = rootEl.querySelector('#makam-mood-input');
      const vakitSel = rootEl.querySelector('#makam-ai-vakit');
      uiState.moodInput = textarea ? textarea.value.trim() : uiState.moodInput;
      uiState.selectedVakitForAi = vakitSel ? vakitSel.value : 'auto';

      const moodPrompt =
        uiState.moodInput || 'Günün şu vaktinde gönlüme ferahlık ve derinlik verecek bir makam arıyorum.';
      const offlineMatch = pickOfflineMatch(moodPrompt, uiState.selectedVakitForAi);

      const runId = ++uiState.aiRunId;
      uiState.aiLoading = true;
      uiState.aiText = '';
      uiState.aiSource = '⏳ Gemini AI mûsikî reçetesi hazırlanıyor...';
      uiState.aiRecommendedMakamId = offlineMatch.makam.id;
      uiState.aiRecommendedCityKey = offlineMatch.cityKey;
      updateAiOutputDom();

      if (hasAiKey) {
        try {
          const vakitText =
            uiState.selectedVakitForAi === 'auto' ? getCurrentVakitLabel() : uiState.selectedVakitForAi;
          const system =
            'Sen Fârâbî (Kitâbü’l-Mûsîka’l-Kebîr), İbn Sînâ ve Anadolu Darüşşifa mûsikî şifası ile 7 bölge Anadolu halk müziği konusunda uzman bir mûsikîşinas ve kültür tarihçisisin. ' +
            'Yanıtını mutlaka bu 8 klasik makamdan biriyle eşleştir: Rast, Hicaz, Nihâvend, Uşşak, Segâh, Hüseynî, Irak, Saba.';
          const prompt =
            'Kullanıcının ruh hâli: "' + moodPrompt + '"\n' +
            'Vakit: ' + vakitText + '\n\n' +
            'Lütfen kısa, zarif ve Türkçe Markdown başlıklarıyla şunları öner:\n' +
            '1. **Önerilen Makam** (yukarıdaki 8 makamdan biri, vakti ve Fârâbî/İbn Sînâ şifa etkisi)\n' +
            '2. **Önerilen Anadolu Bölgesi & Türkü** (örnek bir türkü, saz ve usta adıyla)\n' +
            '3. **Önerilen Anadolu Şehri** (tarihî/kültürel bağlamıyla dinleme tavsiyesi)';

          uiState.aiSource = '✨ Gemini AI Canlı Akış';
          updateAiOutputDom();

          const res = await window.SEYYAH_AI.stream({
            prompt: prompt,
            system: system,
            temperature: 0.75,
            maxTokens: 900,
            onChunk: function (_delta, fullText) {
              if (runId !== uiState.aiRunId || !rootEl.isConnected) return;
              uiState.aiText = fullText;
              updateAiOutputDom();
            }
          });

          if (runId !== uiState.aiRunId || !rootEl.isConnected) return;
          if (res && res.text) {
            uiState.aiText = res.text;
            uiState.aiSource = '✨ Gemini AI (' + (res.model || 'Canlı') + (res.cached ? ' · Önbellek' : '') + ')';
            // Sync quick play button if AI mentioned a specific makam from the 8
            const normRes = defaultNormalizeTurkish(res.text);
            MAKAMLAR.forEach(function (m) {
              if (normRes.indexOf(defaultNormalizeTurkish(m.name)) !== -1) {
                uiState.aiRecommendedMakamId = m.id;
              }
            });
            uiState.aiLoading = false;
            updateAiOutputDom();
            return;
          }
        } catch (_) {
          if (runId !== uiState.aiRunId || !rootEl.isConnected) return;
        }
      }

      // Offline intelligent fallback with smooth progressive reveal
      const offlineMd = buildOfflineMoodMarkdown(moodPrompt, offlineMatch, provinces);
      uiState.aiSource = '🕯️ Çevrimdışı Fârâbî & Türkü Eşleştiricisi (Gemini AI Yedek)';
      const tokens = offlineMd.split(/(\s+)/);
      let cursor = 0;
      function revealNext() {
        if (runId !== uiState.aiRunId || !rootEl.isConnected) return;
        cursor = Math.min(tokens.length, cursor + 8);
        uiState.aiText = tokens.slice(0, cursor).join('');
        if (cursor >= tokens.length) {
          uiState.aiLoading = false;
          updateAiOutputDom();
          return;
        }
        updateAiOutputDom();
        setTimeout(revealNext, 20);
      }
      revealNext();
    }

    // Event Delegation inside rootEl
    rootEl.addEventListener('click', function (e) {
      const target = e.target && e.target.closest ? e.target.closest('button') : null;
      if (!target) return;

      const vakitId = target.getAttribute('data-vakit-filter');
      if (vakitId) {
        uiState.vakitFilter = vakitId;
        rootEl.querySelectorAll('[data-vakit-filter]').forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-vakit-filter') === vakitId);
        });
        updateMakamGridDom();
        return;
      }

      const playMakamId = target.getAttribute('data-play-makam');
      if (playMakamId) {
        playMakamSynth(playMakamId, ctxHelpers);
        return;
      }

      if (target.hasAttribute('data-toggle-ney')) {
        toggleNeyTaksimi(ctxHelpers);
        return;
      }

      if (target.hasAttribute('data-stop-all')) {
        stopSynthOnly();
        stopNeyAudio();
        syncAudioUI();
        notify(ctxHelpers, '🔇 Tüm mûsikî sesleri durduruldu.');
        return;
      }

      const regionId = target.getAttribute('data-region-tab');
      if (regionId) {
        uiState.selectedRegionId = regionId;
        updateRegionDossierDom();
        return;
      }

      const cityKey = target.getAttribute('data-open-city');
      if (cityKey) {
        openCity(cityKey);
        return;
      }

      const moodChip = target.getAttribute('data-mood-chip');
      if (moodChip) {
        uiState.moodInput = moodChip;
        const ta = rootEl.querySelector('#makam-mood-input');
        if (ta) ta.value = moodChip;
        runAiMoodMatch();
        return;
      }

      if (target.id === 'makam-ai-btn') {
        runAiMoodMatch();
      }
    });

    syncAudioUI();
  }

  window.SEYYAH_MODULES.makamAtlas = {
    render: render,
    stop: stop
  };
})();
