/**
 * Anadolu Seyahatnamesi — Anadolu Şiir, Türkü & 'Beş Şehir' Edebiyat Divanı
 * 7 bölge ve 81 ilin edebî hafızasını, 24 büyük Anadolu şair/ozan/yazar portresi,
 * 81 ilin literary_quotes & quote verileri ve Gemini AI canlı şiir/deneme akışı
 * (çevrimdışı edebî üslup yedekli) + Seyir Defterim entegrasyonuyla buluşturan stüdyo.
 * Registers on: window.SEYYAH_MODULES.divan = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-poetry-divan-styles';
  const JOURNAL_ENTRIES_STORAGE = 'dijital_seyyah_journal_entries';
  const PERSONAL_JOURNAL_STORAGE = 'dijital_seyyah_personal_journal_v1';

  const REGIONS = [
    { code: 'all', label: 'Tüm Bölgeler', shortLabel: 'Tümü', icon: '🗺️' },
    { code: '01_Marmara', label: 'Marmara', shortLabel: 'Marmara', icon: '🌉' },
    { code: '02_Ege', label: 'Ege', shortLabel: 'Ege', icon: '🫒' },
    { code: '03_Akdeniz', label: 'Akdeniz', shortLabel: 'Akdeniz', icon: '🍊' },
    { code: '04_IcAnadolu', label: 'İç Anadolu', shortLabel: 'İç Anadolu', icon: '🌾' },
    { code: '05_Karadeniz', label: 'Karadeniz', shortLabel: 'Karadeniz', icon: '🌲' },
    { code: '06_DoguAnadolu', label: 'Doğu Anadolu', shortLabel: 'Doğu Anadolu', icon: '🏔️' },
    { code: '07_GuneydoguAnadolu', label: 'Güneydoğu Anadolu', shortLabel: 'Güneydoğu', icon: '🕌' }
  ];

  const TRADITIONS = [
    { id: 'all', label: 'Tümü', icon: '✨', color: '#00f2fe', badgeBg: 'rgba(0, 242, 254, 0.14)' },
    {
      id: 'Klasik Divan & Tasavvuf',
      label: 'Klasik Divan & Tasavvuf',
      icon: '🕌',
      color: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.16)'
    },
    {
      id: 'Halk Ozanları & Türkü',
      label: 'Halk Ozanları & Türkü',
      icon: '🪕',
      color: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.16)'
    },
    {
      id: 'Modern Edebiyat & Beş Şehir',
      label: 'Modern Edebiyat & Beş Şehir',
      icon: '🖋️',
      color: '#a855f7',
      badgeBg: 'rgba(168, 85, 247, 0.16)'
    },
    {
      id: '81 İl Edebi Alıntıları',
      label: '81 İl Edebi Alıntıları',
      icon: '📜',
      color: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.16)'
    }
  ];

  const TRADITION_META = {};
  TRADITIONS.forEach(function (t) {
    TRADITION_META[t.id] = t;
  });

  const AI_GENRES = [
    {
      id: 'tanpinar',
      label: "Ahmet Hamdi Tanpınar 'Beş Şehir' Üslubu",
      shortLabel: 'Beş Şehir Denemesi',
      icon: '🏛️',
      badge: 'Zaman, Mimari & Hafıza',
      desc: 'Tarih, taş işçiliği, şadırvan musikisi ve rüya estetiğiyle şehir portresi',
      directive:
        "Ahmet Hamdi Tanpınar'ın 'Beş Şehir' denemelerinin zarif, musikîşinas, zaman-mekân derinliği yüksek, " +
        'geçmişle bugünü mimari, ışık ve hatıra üzerinden buluşturan yoğun edebî üslubuyla bir şehir denemesi kaleme al. ' +
        'Somut yerel mekânlara dokun, ancak kuru ansiklopedik bilgi yerine şehrin ruhunu ve zaman katmanlarını anlat.'
    },
    {
      id: 'yunus',
      label: 'Yunus Emre İlahi/Nefes Üslubu',
      shortLabel: 'İlahi / Nefes',
      icon: '🕊️',
      badge: 'Sade Türkçe & İrfan',
      desc: 'Hece ölçüsünün duru nefesiyle gönül, yol ve hikmet dizeleri',
      directive:
        'Yunus Emre ilahi ve nefeslerinin duru, içten, sade Türkçesiyle (7 veya 8 heceli dörtlükler ve son dörtlükte "Seyyah" mahlaslı mısralarla) ' +
        'seçili şehrin manevi iklimini, tevazuunu ve gönül yolculuğunu anlatan bir ilahi/nefes yaz.'
    },
    {
      id: 'karacaoglan',
      label: 'Karacaoğlan Koşma Üslubu',
      shortLabel: 'Koşma / Türkü',
      icon: '🪕',
      badge: '11’li Hece & Yayla Sesi',
      desc: 'Dağları, suları, gurbeti ve sevdayı saz teline döken koşma',
      directive:
        "Karacaoğlan koşmalarının tabiatla iç içe, samimi, coşkulu ve lirik 11'li hece (6+5) dörtlükleriyle " +
        'seçili şehrin dağlarını, rüzgârını, suyunu ve yolcu hasretini anlatan 4 veya 5 dörtlüklük bir koşma yaz.'
    },
    {
      id: 'modern',
      label: 'Modern Serbest Şiir',
      shortLabel: 'Modern Serbest Şiir',
      icon: '🌙',
      badge: 'Çağdaş İmge & Ritim',
      desc: 'Yahya Kemal, Cahit Sıtkı ve Sezai Karakoç duyarlığından beslenen serbest dizeler',
      directive:
        'Türk modern şiirinin (Sezai Karakoç, Cahit Sıtkı Tarancı, Ahmet Muhip Dıranas ve Orhan Veli çizgisinin) imge gücünü harmanlayan, ' +
        'seçili şehrin sabah ışığını, sokak seslerini ve insan hafızasını duyusal imgelerle yakalayan etkileyici bir serbest şiir yaz.'
    },
    {
      id: 'divan',
      label: 'Klasik Divan Gazeli (Beyit & Mahlas)',
      shortLabel: 'Divan Gazeli',
      icon: '🕌',
      badge: 'Aruz Ruhu & 5 Beyit',
      desc: 'Fuzûlî, Bâkî ve Nâbî geleneğinden matla-makta ahengiyle şehir gazeli',
      directive:
        'Klasik Osmanlı Divan şiiri (Bâkî, Fuzûlî, Nâbî) geleneğinde, aa / ba / ca / da / ea kafiye düzeniyle 5 beyitlik, son beyitte "Seyyah" mahlaslı, ' +
        'seçili şehrin kubbesini, suyunu, ilim meclisini ve hikmetini terennüm eden zarif ve anlaşılır bir gazel yaz.'
    }
  ];

  const MOTIF_CHIPS = [
    'sabah ışığı ve taş sokaklar',
    'şadırvan sesi ve ikindi vakti',
    'yolculuk, gurbet ve vuslat',
    'kütüphane sükûneti ve çay buharı',
    'dağ rüzgârı ve eski türkü'
  ];

  // 24 Curated Iconic Anatolian Literary Works & City Portraits
  const CURATED_ANTHOLOGY = [
    {
      id: 'tanpinar-ankara',
      author: 'Ahmet Hamdi Tanpınar',
      workTitle: 'Beş Şehir — Ankara',
      era: '1946 · Cumhuriyet Denemesi',
      tradition: 'Modern Edebiyat & Beş Şehir',
      provinceKey: '04_IcAnadolu/Ankara',
      relatedKeys: ['04_IcAnadolu/Kirikkale'],
      motifs: ['Ankara Kalesi', 'Bozkır Işığı', 'Tarih & Kuruluş', 'Hacı Bayram'],
      excerpt:
        '“Ankara Kalesi’nden bozkıra bakarken zamanın sert çizgilerinde hem eski Roma’nın, hem Selçuklu’nun, hem de yeni bir devletin doğuş iradesini aynı ışık altında görürsünüz.”',
      commentary:
        'Tanpınar, Beş Şehir’in ilk durağında Ankara’yı sadece bir bozkır kasabasının başkente dönüşümü olarak değil, Anadolu tarihinin sert ve vakur bir sentezi olarak okur.',
      travelEcho:
        'Kale burçlarından ikindi vaktinde Ulus’a ve Hacı Bayram avlusuna baktığınızda, bozkırın kuru ama berrak havasında bu tarihî nöbet duygusunu hâlâ duyarsınız.'
    },
    {
      id: 'tanpinar-erzurum',
      author: 'Ahmet Hamdi Tanpınar',
      workTitle: 'Beş Şehir — Erzurum',
      era: '1946 · Cumhuriyet Denemesi',
      tradition: 'Modern Edebiyat & Beş Şehir',
      provinceKey: '06_DoguAnadolu/Erzurum',
      relatedKeys: ['06_DoguAnadolu/Kars'],
      motifs: ['Çifte Minare', 'Palandöken', 'Kış & Yiğitlik', 'Dadaş Türküleri'],
      excerpt:
        '“Erzurum, Türkiye’nin bütün doğu hudutlarını bekleyen ulu bir kaledir; soğuk gecelerinde türküler bir ocak başı gibi insanın içini ısıtır.”',
      commentary:
        'Tanpınar’ın gençlik hatıralarıyla örülen Erzurum bölümü, yüksek yaylanın sert iklimini Çifte Minareli Medrese’nin taş zarafeti ve halk türkülerinin vakarıyla dengeler.',
      travelEcho:
        'Kar altında veya serin yaz akşamlarında Yakutiye ile Çifte Minare arasında yürürken, taşın içindeki sabır ve misafirperverlik aynı anda hissedilir.'
    },
    {
      id: 'tanpinar-konya',
      author: 'Ahmet Hamdi Tanpınar',
      workTitle: 'Beş Şehir — Konya',
      era: '1946 · Cumhuriyet Denemesi',
      tradition: 'Modern Edebiyat & Beş Şehir',
      provinceKey: '04_IcAnadolu/Konya',
      relatedKeys: ['04_IcAnadolu/Karaman'],
      motifs: ['Selçuklu Çini', 'Alâeddin Tepesi', 'Ney & Sema', 'Bozkır Sessizliği'],
      excerpt:
        '“Konya, Selçuklu medeniyetinin ruhunu taşa ve firuze çiniye nakşettiği, bozkırın ortasında içe dönük derin bir rüya şehridir.”',
      commentary:
        'Tanpınar Konya’yı "hülyalı bir Selçuklu başşehri" olarak çizer; İnce Minare’nin taş oymacılığından Mevlânâ dergâhının ney sesine uzanan bir içsel musiki yakalar.',
      travelEcho:
        'Sabah erken saatlerde Alâeddin Tepesi çevresinden Mevlânâ Meydanı’na yürümek, zamanın gürültüsünü yavaşlatan bir sükûnet ayinine dönüşür.'
    },
    {
      id: 'tanpinar-bursa',
      author: 'Ahmet Hamdi Tanpınar',
      workTitle: 'Beş Şehir — Bursa & “Bursa’da Zaman”',
      era: '1946 · Deneme ve Şiir',
      tradition: 'Modern Edebiyat & Beş Şehir',
      provinceKey: '01_Marmara/Bursa',
      relatedKeys: ['01_Marmara/Bilecik'],
      motifs: ['Su Musikisi', 'Yeşil Türbe', 'Muradiye', 'İkinci Zaman'],
      excerpt:
        '“Bursa’da bir eski cami avlusu, / Küçük şadırvanda şakırdayan su; / Orhan zamanından kalma bir duvar... / İhtiyar çınarla, yeşil türbede.”',
      commentary:
        'Türk edebiyatının en meşhur şehir portrelerinden biri olan Bursa anlatısında Tanpınar, "suyun ve mermerin musikisi" içinde tarihin durmadığını, ikinci bir zaman olarak aktığını söyler.',
      travelEcho:
        'Muradiye Külliyesi’nin çınar gölgelerinde veya Yeşil Türbe avlusunda şadırvan sesi dinlediğinizde şiirin mısraları mekânla birebir örtüşür.'
    },
    {
      id: 'tanpinar-istanbul',
      author: 'Ahmet Hamdi Tanpınar',
      workTitle: 'Beş Şehir — İstanbul',
      era: '1946 · Cumhuriyet Denemesi',
      tradition: 'Modern Edebiyat & Beş Şehir',
      provinceKey: '01_Marmara/Istanbul',
      relatedKeys: ['01_Marmara/Edirne'],
      motifs: ['Boğaziçi', 'Eski Mahalle', 'Itri Musikisi', 'Medeniyet Terkibi'],
      excerpt:
        '“İstanbul, ya vardır ya yoktur; fakat bir kere içine girildi mi, her tepesi ve her iskelesi ayrı bir rüya, ayrı bir musiki faslıdır.”',
      commentary:
        'Beş Şehir’in finalinde İstanbul; Boğaz ışıkları, Üsküdar sırtları, cami avluları ve Itri’nin Neva Kâr’ı eşliğinde medeniyetin yaşayan hafızası olarak yükselir.',
      travelEcho:
        'Eminönü’nden Üsküdar’a geçen bir vapurun güvertesinde martı sesleri arasında kubbelere bakmak, Tanpınar’ın cümlelerini canlı bir sahneye çevirir.'
    },
    {
      id: 'yunus-emre-divan',
      author: 'Yunus Emre',
      workTitle: 'Dîvân & Risâletü’n-Nushiyye',
      era: 'XIII–XIV. Yüzyıl (1240–1320)',
      tradition: 'Klasik Divan & Tasavvuf',
      provinceKey: '04_IcAnadolu/Eskisehir',
      relatedKeys: ['04_IcAnadolu/Karaman', '04_IcAnadolu/Aksaray'],
      motifs: ['Sade Türkçe', 'Gönül Yapmak', 'İlahi', 'Dervişlik'],
      excerpt:
        '“Bana seni gerek seni... / Gelin tanış olalım, / İşi kolay kılalım, / Sevelim sevilelim, / Dünya kimseye kalmaz.”',
      commentary:
        'Anadolu Türkçesini bir ilahi ve hikmet diline dönüştüren Yunus Emre, Eskişehir Mihalıççık (Sarıköy) ile Karaman arasındaki bozkırda en derin metafiziği en duru kelimelerle söyledi.',
      travelEcho:
        'Porsuk kıyısından Yunus Emre Külliyesi’ne uzanan bozkır yolu, gösterişsiz ama derin bir samimiyetle yolcuyu ağırlar.'
    },
    {
      id: 'asik-veysel-sivas',
      author: 'Âşık Veysel Şatıroğlu',
      workTitle: 'Uzun İnce Bir Yoldayım (Dostlar Beni Hatırlasın)',
      era: 'XX. Yüzyıl (1894–1973)',
      tradition: 'Halk Ozanları & Türkü',
      provinceKey: '04_IcAnadolu/Sivas',
      relatedKeys: ['04_IcAnadolu/Yozgat'],
      motifs: ['Saz & Toprak', 'Kara Toprak', 'Yolculuk', 'Şarkışla / Sivrialan'],
      excerpt:
        '“Uzun ince bir yoldayım, / Gidiyorum gündüz gece. / Bilmiyorum ne hâldayım, / Gidiyorum gündüz gece.”',
      commentary:
        'Gözlerini kaybettikten sonra iç âleminin ışığıyla dünyayı gören Âşık Veysel, Sivas Sivrialan’dan bütün insanlığa sabır, sadakat ve "sadık yâri kara toprak" bilincini armağan etti.',
      travelEcho:
        'Sivas bozkırında ufka uzanan bir yola çıkıldığında Veysel’in bağlamasından yükselen o dingin ritim her kilometrenin eşlikçisi olur.'
    },
    {
      id: 'karacaoglan-cukurova',
      author: 'Karacaoğlan',
      workTitle: 'Çukurova & Toroslar Koşmaları',
      era: 'XVII. Yüzyıl',
      tradition: 'Halk Ozanları & Türkü',
      provinceKey: '03_Akdeniz/Adana',
      relatedKeys: ['03_Akdeniz/Mersin', '03_Akdeniz/Osmaniye'],
      motifs: ['Toros Yaylaları', 'Koşma', 'Tabiat', 'Gurbet'],
      excerpt:
        '“İncecikten bir kar yağar, / Tozar Elif Elif diye. / Deli gönül abdal olmuş, / Gezer Elif Elif diye.”',
      commentary:
        'Âşık edebiyatının en lirik sesi Karacaoğlan; Çukurova’dan Toros yaylalarına uzanan göç yollarını, pınar başlarını ve insan kalbinin saf heyecanını sade bir Türkçeyle ölümsüzleştirdi.',
      travelEcho:
        'Adana ve Mersin’in Toros geçitlerinden yaylalara çıkarken serin çam kokusu hâlâ bir Karacaoğlan semaisi gibi eser.'
    },
    {
      id: 'neset-ertas-bozlak',
      author: 'Neşet Ertaş',
      workTitle: 'Kırşehir Bozlakları & Gönül Dağı',
      era: 'XX–XXI. Yüzyıl (1938–2012)',
      tradition: 'Halk Ozanları & Türkü',
      provinceKey: '04_IcAnadolu/Kirsehir',
      relatedKeys: ['04_IcAnadolu/Kırıkkale', '04_IcAnadolu/Nevsehir'],
      motifs: ['Bozlak', 'Abdal Geleneği', 'Tezene', 'Gönül Dağı'],
      excerpt:
        '“Gönül dağı yağmur yağmur boran olunca, / Akar can özünde sel gizli gizli. / Bir tenhada can cananı bulunca, / Sinemi yaralar dil gizli gizli.”',
      commentary:
        '"Bozkırın Tezenesi" Neşet Ertaş, Kırşehir Abdal geleneğinin asırlık feryadını ve tevazusunu bozlaklara dökerek Anadolu insanının sevincini ve sızısını tek telde birleştirdi.',
      travelEcho:
        'Kırşehir sokaklarında ve Neşet Ertaş Kültür Merkezi çevresinde her selamda o eşsiz "ayağınızın turabı" nezaketi hissedilir.'
    },
    {
      id: 'pir-sultan-abdal',
      author: 'Pir Sultan Abdal',
      workTitle: 'Sivas & Banaz Nefesleri',
      era: 'XVI. Yüzyıl',
      tradition: 'Halk Ozanları & Türkü',
      provinceKey: '04_IcAnadolu/Sivas',
      relatedKeys: ['05_Karadeniz/Tokat'],
      motifs: ['Banaz', 'Nefes & Deyiş', 'Turnalar', 'Yiğitlik'],
      excerpt:
        '“Ötme bülbül ötme şen değil bağım, / Dost senin derdinden ben yana yana. / Tükendi fitilim eridi yağım, / Dost senin derdinden ben yana yana.”',
      commentary:
        'Sivas’ın Yıldızeli Banaz köyünden yükselen Pir Sultan Abdal nefesleri, sözünün arkasında duran halk irfanının, turnalara selam gönderen doğa sevgisinin en güçlü anıtıdır.',
      travelEcho:
        'Yıldız Dağı eteklerinde rüzgârla salınan yayla otları, asırlardır söylenen deyişlerin canlı hafızasını taşır.'
    },
    {
      id: 'koroglu-bolu',
      author: 'Köroğlu',
      workTitle: 'Bolu Beyi’ne Selam & Koçaklamalar',
      era: 'XVI. Yüzyıl',
      tradition: 'Halk Ozanları & Türkü',
      provinceKey: '05_Karadeniz/Bolu',
      relatedKeys: ['05_Karadeniz/Duzce'],
      motifs: ['Çamlıbel', 'Kırat', 'Koçaklama', 'Zulme Direniş'],
      excerpt:
        '“Benden selam olsun Bolu Beyi’ne, / Çıkıp şu dağlara yaslanmalıdır. / Ok gıcırtısından kalkan sesinden, / Dağlar seda verip seslenmelidir.”',
      commentary:
        'Bolu dağlarının gür sesi Köroğlu, koçaklamalarıyla Türk halk şiirinde mertliğin, adaletin ve haksızlığa karşı korkusuz duruşun efsanevi temsilcisi olmuştur.',
      travelEcho:
        'Bolu’nun sisli çam ormanları ve yüksek geçitleri, destandaki Çamlıbel ufkunu bugün bile gözler önüne serer.'
    },
    {
      id: 'dadaloglu-toros',
      author: 'Dadaloğlu',
      workTitle: 'Avşar İlleri & Ferman Türküleri',
      era: 'XVIII–XIX. Yüzyıl (1785–1868)',
      tradition: 'Halk Ozanları & Türkü',
      provinceKey: '04_IcAnadolu/Kayseri',
      relatedKeys: ['03_Akdeniz/Adana', '03_Akdeniz/Kahramanmaras'],
      motifs: ['Avşar Obası', 'Binboğa Dağları', 'Özgürlük', 'Koçaklama'],
      excerpt:
        '“Kalktı göç eyledi Avşar elleri, / Ağır ağır giden eller bizimdir. / Arap atlar yakın eder ırağı, / Yüce dağdan aşan yollar bizimdir.”',
      commentary:
        'Kayseri Tomarza ve Pınarbaşı’ndan Çukurova’ya uzanan göç yollarının şairi Dadaloğlu, konargöçer ruhun hürriyet manifestosunu ölümsüz mısralarla söylemiştir.',
      travelEcho:
        'Erciyes’in eteklerinden Binboğa geçitlerine doğru yol alırken bozkır ile dağ arasındaki o kadim özgürlük hissi canlanır.'
    },
    {
      id: 'erzurumlu-emrah',
      author: 'Erzurumlu Emrah',
      workTitle: 'Emrah Dîvânı & “Sabahtan Uğradım Ben Bir Fidana”',
      era: 'XIX. Yüzyıl (1775–1854)',
      tradition: 'Halk Ozanları & Türkü',
      provinceKey: '06_DoguAnadolu/Erzurum',
      relatedKeys: ['05_Karadeniz/Tokat', '05_Karadeniz/Niksar'],
      motifs: ['Saz & Kalem', 'Semaî', 'Divan Tekniği', 'Anadolu Turnesi'],
      excerpt:
        '“Sabahtan uğradım ben bir fidana, / Dedim mahmur musun, dedi ki yok yok! / Ak elleri boğum boğum kınalı, / Dedim bayram mıdır, dedi ki yok yok!”',
      commentary:
        'Erzurum Tambura köyünde doğup Anadolu’nun dört bir yanını gezen Erzurumlu Emrah, hem aruzla divan şiiri hem heceyle âşık tarzı söyleyişlerde zirveye ulaşmış bir köprü ustadır.',
      travelEcho:
        'Erzurum’un tarihî kahvehanelerinden Karadeniz geçitlerine uzanan yollarda Emrah’ın ince zarafeti ve musikisi hâlâ yaşar.'
    },
    {
      id: 'yahya-kemal-istanbul',
      author: 'Yahya Kemal Beyatlı',
      workTitle: 'Kendi Gök Kubbemiz — Aziz İstanbul & Rumeli Ufku',
      era: 'XX. Yüzyıl (1884–1958)',
      tradition: 'Modern Edebiyat & Beş Şehir',
      provinceKey: '01_Marmara/Istanbul',
      relatedKeys: ['01_Marmara/Edirne', '01_Marmara/Bursa'],
      motifs: ['Aziz İstanbul', 'Üsküp & Rumeli', 'Kubbeler', 'Sessiz Gemi'],
      excerpt:
        '“Sana dün bir tepeden baktım aziz İstanbul! / Görmedim gezmediğim, sevmediğim hiçbir yer. / Ömrüm oldukça, gönül tahtıma keyfince kurul! / Sade bir semtini sevmek bile bir ömre değer.”',
      commentary:
        'Üsküp’te doğan ve Rumeli ufkunu İstanbul’un kubbelerinde sürdüren Yahya Kemal, coğrafya ile tarihi tek bir saf Türkçe musikisinde eriten büyük şairimizdir.',
      travelEcho:
        'Çamlıca, Süleymaniye ya da Edirne Selimiye tepesinden gün batımını izlemek, şairin "kendi gök kubbemiz" dediği bütünlüğü yaşatır.'
    },
    {
      id: 'sezai-karakoc-dirilis',
      author: 'Sezai Karakoç',
      workTitle: 'Mona Rosa, Körfez & Diyarbakır / Mardin Ufku',
      era: 'XX–XXI. Yüzyıl (1933–2021)',
      tradition: 'Modern Edebiyat & Beş Şehir',
      provinceKey: '07_GuneydoguAnadolu/Diyarbakir',
      relatedKeys: ['07_GuneydoguAnadolu/Mardin'],
      motifs: ['Ergani & Dicle', 'Mona Rosa', 'Diriliş', 'Taş & Gül'],
      excerpt:
        '“Güllerin içinde geçer bir ömür; / Açma pencereni perdeleri çek, / Mona Rosa, seni görmemeliyim.”',
      commentary:
        'Diyarbakır Ergani’den yetişen Sezai Karakoç, Dicle’nin kadim suskunluğunu ve Mardin taşının metafizik aydınlığını modern Türk şiirinin en özgün diriliş sesine dönüştürdü.',
      travelEcho:
        'Diyarbakır surlarının bazalt gölgesinde ve Mardin’in Mezopotamya’ya bakan teraslarında zamanın derin sessizliği duyulur.'
    },
    {
      id: 'necip-fazil-cile',
      author: 'Necip Fazıl Kısakürek',
      workTitle: 'Çile & Kaldırımlar (Maraş’tan İstanbul’a)',
      era: 'XX. Yüzyıl (1904–1983)',
      tradition: 'Modern Edebiyat & Beş Şehir',
      provinceKey: '03_Akdeniz/Kahramanmaras',
      relatedKeys: ['01_Marmara/Istanbul'],
      motifs: ['Kaldırımlar', 'Çile', 'Gece & Metafizik', 'Maraş Kökleri'],
      excerpt:
        '“Sokaktayım, kimsesiz bir sokak ortasında; / Yürüyorum, arkama bakmadan yürüyorum. / Yolumun karanlığa saplanan noktasında, / Sanki beni bekleyen bir hayal görüyorum.”',
      commentary:
        'Baba ocağı Kahramanmaraş’ın köklü geleneğinden İstanbul’un gece kaldırımlarına uzanan Necip Fazıl, modern insanın varoluşsal yalnızlığını keskin bir ritim ve sarsıcı imgelerle işledi.',
      travelEcho:
        'Kahramanmaraş’ın tarihî konaklarından gece sessizliğine indiğinizde şiirin o yoğun iç hesaplaşma atmosferi hissedilir.'
    },
    {
      id: 'fuzuli-su-kasidesi',
      author: 'Fuzûlî',
      workTitle: 'Su Kasîdesi & Leylâ vü Mecnûn',
      era: 'XVI. Yüzyıl (1483–1556)',
      tradition: 'Klasik Divan & Tasavvuf',
      provinceKey: '01_Marmara/Istanbul',
      relatedKeys: ['07_GuneydoguAnadolu/Sanliurfa', '04_IcAnadolu/Konya'],
      motifs: ['Su Kasîdesi', 'Aşk & Izdırap', 'Aruz Musikisi', 'Klasik Divan'],
      excerpt:
        '“Saçma ey göz eşkden gönlümdeki odlara su, / Kim bu denlü dutuşan odlara kılmaz çâre su.”',
      commentary:
        'Divan edebiyatının en büyük lirik dehası Fuzûlî, aşkı geçici bir heves değil insanı kemale erdiren varoluş ateşi olarak işlemiş; bütün Anadolu ve İstanbul divan geleneğine ufuk açmıştır.',
      travelEcho:
        'Bir tarihî şadırvan başında veya Dicle-Fırat havzasının su sesinde Fuzûlî’nin su redifi berrak bir dua gibi yankılanır.'
    },
    {
      id: 'baki-kanuni-mersiyesi',
      author: 'Bâkî',
      workTitle: 'Kânûnî Mersiyesi & İstanbul Gazelleri',
      era: 'XVI. Yüzyıl (1526–1600)',
      tradition: 'Klasik Divan & Tasavvuf',
      provinceKey: '01_Marmara/Istanbul',
      relatedKeys: ['01_Marmara/Edirne'],
      motifs: ['Sultânü’ş-Şuarâ', 'Âvâze', 'Süleymaniye', 'Gazel'],
      excerpt:
        '“Âvâzeyi bu âleme Dâvûd gibi sal, / Bâkî kalan bu kubbede bir hoş sadâ imiş.”',
      commentary:
        'Süleymaniye Camii’nin yükselişine tanıklık eden "Şairler Sultanı" Bâkî, İstanbul Türkçesini imparatorluk zarafetiyle buluşturarak gök kubbe altında kalıcı bir sadâ bırakmanın sırrını söyledi.',
      travelEcho:
        'Süleymaniye’nin muhteşem avlusunda yankılanan sessizlik, Bâkî’nin "hoş sadâ" dizesinin taştan bir anıtı gibidir.'
    },
    {
      id: 'dede-korkut-destani',
      author: 'Dede Korkut',
      workTitle: 'Kitâb-ı Dede Korkut (Bayburt / Kars / Ardahan)',
      era: 'X–XV. Yüzyıl · Oğuz Destanları',
      tradition: 'Halk Ozanları & Türkü',
      provinceKey: '05_Karadeniz/Bayburt',
      relatedKeys: ['06_DoguAnadolu/Kars', '06_DoguAnadolu/Ardahan'],
      motifs: ['Bamsı Beyrek', 'Kopuz', 'Bayburt Kalesi', 'Kuzeydoğu Yaylaları'],
      excerpt:
        '“Gelimli gidimli dünya, ahir son ucu ölümlü dünya... / Hanım hey! Ağzı dualı kocalarımız, yiğit alplarımız eksik olmasın.”',
      commentary:
        'Bayburt’un Masat köyündeki Dede Korkut Türbesi’nden Kars ve Ardahan yaylalarına uzanan Oğuz boyları, kopuz eşliğinde anlatılan bu destanlarda sözlü edebiyatımızın temel taşını döşedi.',
      travelEcho:
        'Çoruh vadisinden Çıldır Gölü bozkırlarına doğru ilerlerken destan kahramanlarının at koşturduğu kadim ufku görürsünüz.'
    },
    {
      id: 'mevlana-mesnevi',
      author: 'Mevlânâ Celâleddîn-i Rûmî',
      workTitle: 'Mesnevî-i Şerîf — Dinle Neyden',
      era: 'XIII. Yüzyıl (1207–1273)',
      tradition: 'Klasik Divan & Tasavvuf',
      provinceKey: '04_IcAnadolu/Konya',
      relatedKeys: ['04_IcAnadolu/Karaman'],
      motifs: ['Ney', 'Mesnevî', 'Ayrılık & Vuslat', 'Sema'],
      excerpt:
        '“Dinle bu neyin şikâyetini, ayrılıklardan nasıl hikâyet etmede: / Beni kamışlıktan kestiklerinden beri feryadım erkek ve kadını ağlattı.”',
      commentary:
        'Anadolu’nun kalbinde doğan Mesnevî’nin ilk 18 beyti, insanın köküne duyduğu özlemi bir kamış neyin nefesinde ölümsüzleştirir; asırlarca Anadolu tekkelerinde şerh edilmiştir.',
      travelEcho:
        'Konya Yeşil Kubbe’nin altında dinlenen bir ney taksimi, kelimelerin bittiği yerde kalbe doğrudan dokunur.'
    },
    {
      id: 'seyh-galib-husn-u-ask',
      author: 'Şeyh Galib',
      workTitle: 'Hüsn ü Aşk & Sebk-i Hindî',
      era: 'XVIII. Yüzyıl (1757–1799)',
      tradition: 'Klasik Divan & Tasavvuf',
      provinceKey: '01_Marmara/Istanbul',
      relatedKeys: ['04_IcAnadolu/Konya'],
      motifs: ['Hüsn ü Aşk', 'Galata Mevlevîhânesi', 'Ateş Denizinden Geçiş', 'İmge'],
      excerpt:
        '“Hoşça bak zâtına kim zübde-i âlemsin sen, / Merdüm-i dîde-i ekvân olan âdemsin sen.”',
      commentary:
        'Divan şiirinin son büyük yıldızı Şeyh Galib, Galata ve Yenikapı Mevlevîhânelerinde olgunlaşan derin hayal gücüyle insanı kâinatın göz bebeği olarak selamlar.',
      travelEcho:
        'Galata Mevlevîhânesi’nin ahşap avlusunda oturup bu beyti okumak, şehir gürültüsünün ortasında derin bir tefekkür adası açar.'
    },
    {
      id: 'nabi-urfa-hikmet',
      author: 'Yûsuf Nâbî',
      workTitle: 'Hayriyye & Urfa Hikmet Divanı',
      era: 'XVII. Yüzyıl (1642–1712)',
      tradition: 'Klasik Divan & Tasavvuf',
      provinceKey: '07_GuneydoguAnadolu/Sanliurfa',
      relatedKeys: ['01_Marmara/Istanbul'],
      motifs: ['Hikemî Şiir', 'Ruhâ (Urfa)', 'Ahlâk & Bilgelik', 'Balıklıgöl'],
      excerpt:
        '“Bâğ-ı dehrin hem hazânın hem bahârın görmüşüz, / Biz neşâtın da gamın da rûzgârın görmüşüz.”',
      commentary:
        'Şanlıurfa’da doğup yetişen Nâbî, Divan şiirine akılcı, bilge ve hikemî (didaktik-felsefî) bir damar kazandırarak hayatın gelgitlerine karşı vakur bir denge önerdi.',
      travelEcho:
        'Balıklıgöl kıyısındaki taş revaklarda gölge ve su ışığı oynarken Nâbî’nin hayatı kuşatan sakin bilgeliği akla gelir.'
    },
    {
      id: 'cahit-sitki-memleket',
      author: 'Cahit Sıtkı Tarancı',
      workTitle: 'Memleket İsterim & Otuz Beş Yaş',
      era: 'XX. Yüzyıl (1910–1956)',
      tradition: 'Modern Edebiyat & Beş Şehir',
      provinceKey: '07_GuneydoguAnadolu/Diyarbakir',
      relatedKeys: ['04_IcAnadolu/Ankara'],
      motifs: ['Memleket İsterim', 'Diyarbakır Evi', 'Yaşama Sevinci', 'Gök Mavi'],
      excerpt:
        '“Memleket isterim, / Gök mavi, dal yeşil, tarla sarı olsun; / Kuşların çiçeklerin diyarı olsun. / Memleket isterim, / Ne başta dert ne gönülde hasret olsun.”',
      commentary:
        'Diyarbakır’ın tarihî bazalt avlulu evlerinden birinde doğan Cahit Sıtkı Tarancı, ölümlülük bilincini duru bir yaşama sevinci ve kardeşçe bir memleket özlemiyle buluşturdu.',
      travelEcho:
        'Diyarbakır’daki Cahit Sıtkı Tarancı Müze Evi’nin eyvanında gökyüzüne bakmak, şairin "gök mavi, dal yeşil" arzusunu canlı kılar.'
    },
    {
      id: 'halikarnas-baliksisi-ege',
      author: 'Halikarnas Balıkçısı (Cevat Şakir Kabaağaçlı)',
      workTitle: 'Mavi Sürgün & Ege Kıyı Şiiri',
      era: 'XX. Yüzyıl (1890–1973)',
      tradition: 'Modern Edebiyat & Beş Şehir',
      provinceKey: '02_Ege/Mugla',
      relatedKeys: ['02_Ege/Izmir', '02_Ege/Aydin'],
      motifs: ['Mavi Anadolu', 'Bodrum / Halikarnas', 'Merhaba', 'Deniz & Işık'],
      excerpt:
        '“Merhaba! Göklerin ve denizlerin maviliğinden gelen bu selâm, Anadolu kıyılarının beş bin yıllık ışığını bugünün yolcusuna taşır.”',
      commentary:
        'Sürgün olarak gönderildiği Bodrum’u gönül yurduna dönüştüren Halikarnas Balıkçısı, Ege’nin zeytinliklerini, sünger avcılarını ve antik limanlarını destansı bir şiirsellikle anlattı.',
      travelEcho:
        'Ege kıyısında gün ağarırken denize açılan bir teknenin pruvasında onun gür "Merhaba!" selâmı hâlâ çınlar.'
    }
  ];

  // Persistent state across re-renders within session
  const uiState = {
    region: 'all',
    tradition: 'all',
    search: '',
    selectedCityKey: '',
    selectedGenreId: 'tanpinar',
    motifNotes: '',
    outputText: '',
    outputCityKey: '',
    outputGenreId: 'tanpinar',
    outputSource: '',
    isStreaming: false,
    streamRunId: 0,
    isSpeaking: false,
    speakingCardId: ''
  };

  function stopDivanTts() {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (_) {}
    uiState.isSpeaking = false;
    uiState.speakingCardId = '';
  }

  function speakTurkishText(rawText, cardId, onEnd) {
    if (typeof window === 'undefined' || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
      return false;
    }
    stopDivanTts();
    const clean = String(rawText || '')
      .replace(/^#+\s*/gm, '')
      .replace(/^>\s*/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/[_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return false;

    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'tr-TR';
    utter.rate = 0.92;
    utter.pitch = 1.0;

    try {
      const voices = window.speechSynthesis.getVoices() || [];
      const trVoice = voices.find(function (v) {
        return v && v.lang && v.lang.toLowerCase().indexOf('tr') === 0;
      });
      if (trVoice) utter.voice = trVoice;
    } catch (_) {}

    uiState.isSpeaking = true;
    uiState.speakingCardId = cardId || 'paper';

    utter.onend = function () {
      uiState.isSpeaking = false;
      uiState.speakingCardId = '';
      if (typeof onEnd === 'function') onEnd();
    };
    utter.onerror = function () {
      uiState.isSpeaking = false;
      uiState.speakingCardId = '';
      if (typeof onEnd === 'function') onEnd();
    };

    try {
      window.speechSynthesis.speak(utter);
      return true;
    } catch (_) {
      uiState.isSpeaking = false;
      uiState.speakingCardId = '';
      return false;
    }
  }

  async function copyTextReliable(text) {
    if (!text) return false;
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return Boolean(ok);
    } catch (_) {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------
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

  function formatPlate(plate) {
    const n = Number(plate);
    if (!Number.isFinite(n) || n <= 0) return '00';
    return n < 10 ? '0' + n : String(n);
  }

  function stripMdSyntax(str) {
    return String(str || '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .trim();
  }

  function countWords(text) {
    const t = String(text || '').trim();
    if (!t) return 0;
    return t.split(/\s+/).filter(Boolean).length;
  }

  function notify(ctx, message, type) {
    if (ctx && typeof ctx.showToast === 'function') {
      ctx.showToast(message, type);
      return;
    }
    const toastHost = document.getElementById('toast-container');
    if (!toastHost) return;
    const item = document.createElement('div');
    item.className = 'toast-item';
    item.textContent = message;
    toastHost.appendChild(item);
    setTimeout(function () {
      item.style.opacity = '0';
      item.style.transition = 'opacity 0.25s ease';
      setTimeout(function () {
        if (item.parentNode) item.parentNode.removeChild(item);
      }, 260);
    }, 2500);
  }

  function renderSafeMarkdown(mdText, escapeFn) {
    if (
      typeof window !== 'undefined' &&
      window.SEYYAH_AI &&
      typeof window.SEYYAH_AI.renderMarkdown === 'function'
    ) {
      return window.SEYYAH_AI.renderMarkdown(mdText, escapeFn);
    }

    const esc = typeof escapeFn === 'function' ? escapeFn : defaultEscapeHtml;
    const lines = String(mdText || '').split(/\r?\n/);
    const out = [];
    let inList = false;

    function fmtInline(raw) {
      let s = esc(raw);
      s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
      return s;
    }

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed) {
        if (inList) {
          out.push('</ul>');
          inList = false;
        }
        out.push('<div class="divan-md-spacer"></div>');
        continue;
      }
      const h = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (h) {
        if (inList) {
          out.push('</ul>');
          inList = false;
        }
        out.push('<h4 class="divan-md-h">' + fmtInline(h[2]) + '</h4>');
        continue;
      }
      const bq = trimmed.match(/^>\s?(.*)$/);
      if (bq) {
        if (inList) {
          out.push('</ul>');
          inList = false;
        }
        out.push('<blockquote class="divan-md-quote">' + fmtInline(bq[1]) + '</blockquote>');
        continue;
      }
      const li = trimmed.match(/^[-*•]\s+(.+)$/);
      if (li) {
        if (!inList) {
          out.push('<ul class="divan-md-list">');
          inList = true;
        }
        out.push('<li>' + fmtInline(li[1]) + '</li>');
        continue;
      }
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push('<p class="divan-md-p">' + fmtInline(trimmed) + '</p>');
    }
    if (inList) out.push('</ul>');
    return out.join('\n');
  }

  // ---------------------------------------------------------------------------
  // Seyir Defterim Persistence (AI Journal + Personal Journal Sync)
  // ---------------------------------------------------------------------------
  function getJournalEntryCount() {
    try {
      const raw = localStorage.getItem(JOURNAL_ENTRIES_STORAGE);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch (_) {
      return 0;
    }
  }

  function saveEntryToSeyirDefteri(entry, cityKey) {
    let entriesCount = 0;
    let savedEntries = false;
    try {
      const raw = localStorage.getItem(JOURNAL_ENTRIES_STORAGE);
      let entries = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) entries = parsed;
      }
      entries.unshift(entry);
      localStorage.setItem(JOURNAL_ENTRIES_STORAGE, JSON.stringify(entries));
      entriesCount = entries.length;
      savedEntries = true;
    } catch (_) {
      savedEntries = false;
    }

    // Also mirror a readable note into travel-journal.js storage (dijital_seyyah_personal_journal_v1)
    try {
      if (cityKey) {
        const rawPersonal = localStorage.getItem(PERSONAL_JOURNAL_STORAGE);
        let personal = { visited: [], notes: {}, dates: {} };
        if (rawPersonal) {
          const parsedP = JSON.parse(rawPersonal);
          if (parsedP && typeof parsedP === 'object') {
            personal = {
              visited: Array.isArray(parsedP.visited) ? parsedP.visited : [],
              notes: parsedP.notes && typeof parsedP.notes === 'object' ? parsedP.notes : {},
              dates: parsedP.dates && typeof parsedP.dates === 'object' ? parsedP.dates : {}
            };
          }
        }
        const stamp = new Date().toLocaleDateString('tr-TR');
        const header = '🖋️ [Edebiyat Divanı · ' + entry.styleLabel + ' · ' + stamp + ']';
        const snippet = String(entry.content || '').trim();
        const prev = personal.notes[cityKey] ? String(personal.notes[cityKey]).trim() + '\n\n---\n\n' : '';
        personal.notes[cityKey] = prev + header + '\n' + snippet;
        localStorage.setItem(PERSONAL_JOURNAL_STORAGE, JSON.stringify(personal));
      }
    } catch (_) {}

    return { saved: savedEntries, count: entriesCount };
  }

  function triggerMarkdownDownload(filename, textContent) {
    const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  }

  // ---------------------------------------------------------------------------
  // AI Prompt & Rich Offline Poetic/Essay Fallback
  // ---------------------------------------------------------------------------
  function getGenreMeta(genreId) {
    return (
      AI_GENRES.find(function (g) {
        return g.id === genreId;
      }) || AI_GENRES[0]
    );
  }

  function buildLiteraryPrompt(province, cityKey, genre, motifText) {
    const plate = formatPlate(province.plate);
    const landmarks = Array.isArray(province.landmarks) ? province.landmarks.slice(0, 4).join(', ') : '';
    const specialties = Array.isArray(province.specialties) ? province.specialties.slice(0, 3).join(', ') : '';
    const lq = Array.isArray(province.literary_quotes)
      ? province.literary_quotes.slice(0, 2).map(stripMdSyntax).join(' | ')
      : '';

    const parts = [
      'Şehir: ' + province.name + ' (Plaka: ' + plate + ', Bölge: ' + (province.region || 'Anadolu') + ')',
      'Seçilen Edebî Üslup: ' + genre.label,
      'Üslup Yönergesi: ' + genre.directive,
      province.quote ? 'Şehrin Özdeyişi: "' + province.quote + '"' : '',
      landmarks ? 'Simgesel Mekânlar: ' + landmarks : '',
      specialties ? 'Yerel Tat & Kültür İpuçları: ' + specialties : '',
      lq ? 'Şehre Dair Edebî Alıntılar: ' + lq : '',
      motifText ? 'Yolcunun Özel Teması / İzlenimi: ' + motifText : '',
      '',
      'Lütfen doğrudan başlık (## Başlık) ile başlayan, 180-320 kelime aralığında, edebî değeri yüksek, akıcı ve ilham verici bir Türkçe eser üret. Gereksiz ön söz veya açıklama yazma.'
    ];
    return parts.filter(Boolean).join('\n');
  }

  function buildOfflineLiteraryPiece(province, genre, motifText) {
    const city = province.name || 'Anadolu';
    const region = province.region || 'Anadolu';
    const landmarks = Array.isArray(province.landmarks) && province.landmarks.length
      ? province.landmarks
      : [city + ' Kalesi', city + ' Ulu Camii'];
    const lm1 = landmarks[0] || city + ' meydanı';
    const lm2 = landmarks[1] || 'eski taş sokaklar';
    const specialty = Array.isArray(province.specialties) && province.specialties[0]
      ? province.specialties[0]
      : 'akşam çayı';
    const quoteClean = stripMdSyntax(
      (Array.isArray(province.literary_quotes) && province.literary_quotes[0]) || province.quote || ''
    );
    const motifLine = motifText
      ? motifText.trim()
      : 'ikindi ışığı ve sessiz bir yol defteri';

    if (genre.id === 'tanpinar') {
      return [
        '## ' + city + '’de Zaman ve Taşın Musikisi',
        '',
        city + ', insanın içine yalnızca bir coğrafya olarak değil, asırların ağır ağır süzdüğü ikinci bir zaman olarak girer. Sabah serinliğinde **' + lm1 + '** çevresinden yükselip **' + lm2 + '** yönüne süzülen ışık, ' + region + ' göğünün altında taşın, suyun ve insan emeğinin nasıl tek bir terkip kurduğunu fısıldar.',
        '',
        'Burada her avlu kendi sessizliğini saklar. Bir yanda eski ustaların sabırla işlediği çizgiler, öte yanda **' + motifLine + '** eşliğinde soluklanan bugünün yolcusu... Günün telaşı biraz durulup da **' + specialty + '** kokusu akşam rüzgârına karıştığında, şehir bize yalnızca bugünü değil, geçmişin hiç kaybolmamış canlı rüyasını da açar.',
        '',
        quoteClean ? '> *' + quoteClean + '*' : '> *“Şehirler de insanlar gibidir; ancak sükûnetle dinleyenlere asıl musikisini verir.”*',
        '',
        city + '’den ayrılırken insanın valizinde eşyadan çok bir renk, bir saat tıkırtısı ve ruhu yıkayan derin bir huzur kalır.'
      ].join('\n');
    }

    if (genre.id === 'yunus') {
      return [
        '## ' + city + ' Yolunda Gönül Nefesi',
        '',
        'Yola düştüm ' + region + ' iline,',
        'Adım attım **' + city + '** gülüne,',
        'Selâm verdim esen yeline,',
        'Gönül ister dostun ilini.',
        '',
        '**' + lm1 + '** taşında sabır var,',
        '**' + lm2 + '** içinde sükût var,',
        'Gül yüzünde rahmet, huzur var,',
        'Yolcu arar kendi özünü.',
        '',
        'Ne şöhrette gözü, ne malda,',
        'Bir tas sıcak **' + specialty + '** balda,',
        '**' + motifLine + '** bu hâlde,',
        'Aşkla bulur Hak’kın izini.',
        '',
        '*Seyyah* der ki dünya bir handır,',
        'Her şehir bir ibret, nişandır,',
        'İncitmemek en ulu şandır,',
        'Sevgi açar gönül gözünü.'
      ].join('\n');
    }

    if (genre.id === 'karacaoglan') {
      return [
        '## ' + city + ' Yaylasından Koşma',
        '',
        'Sabah yeli eser **' + city + '** düzünden,',
        'Duman kalkar yüce dağın yüzünden,',
        'Bir türkü süzülür yolcu sözünden,',
        '**' + region + '** elleri ne güzel olur.',
        '',
        '**' + lm1 + '** karşıdan bakar durur,',
        'Sular çağlar, taşlar yankı vurur,',
        '**' + motifLine + '** gönlüme oturur,',
        'Gurbet akşamları bir masal olur.',
        '',
        '**' + lm2 + '** başında kurulur sofra,',
        'İkram edilir o **' + specialty + '** sonra,',
        'Dostun selâmıyla silinir efkâr,',
        'Yabancı diyarlar öz vatan olur.',
        '',
        'Karacaoğlan der ki yollar uzaktır,',
        'Sevda çeken yürek daim uyanıktır,',
        '**' + city + '** hatırası kalpte sıcaktır,',
        'Her menzil bir yeni bahar olur.'
      ].join('\n');
    }

    if (genre.id === 'divan') {
      const plateNum = Number(province.plate) || 1;
      const libName = province.library ? String(province.library).split(' - ')[0] : city + ' Dârü’l-Kütübü';
      const openingFlavors = [
        'Seher vaktinde açılır gül-i irfânı',
        'Gök kubbe altında çınlar hoş sadâsı',
        'Asırların nakşını taşır her taş duvarı'
      ];
      const opener = openingFlavors[plateNum % openingFlavors.length];
      return [
        '## ' + city + ' Medhinde Klasik Gazel (Plaka ' + formatPlate(plateNum) + ')',
        '',
        '*' + opener + ' **' + city + '** ilinin,*',
        '*Bahr-i hikmetten akar âb-ı revânı **' + region + '** ikliminin.*',
        '',
        '***' + lm1 + '*** burcunda parlar mihr ü mâh-ı ma‘rifet,',
        '***' + lm2 + '*** avlusunda dinlenir kalb-i hazîni yolcunun.',
        '',
        'Meclis-i ilme varıp ***' + libName + '*** içinde oturan,',
        'Satırından sadırına devşirir sırr-ı zamanın.',
        '',
        'Şükr ile kurulan sofrada ***' + specialty + '*** ikrâm olur,',
        '***' + motifLine + '*** ile tazelenir şevki bu cânın.',
        '',
        'Ey **Seyyah**, bâkî kalan şu kubbede bir hoş sadâdır,',
        'Gönül defterine nakşoldu muhabbeti **' + city + '** diyârının.',
        '',
        quoteClean ? '> *' + quoteClean + '*' : '> *“Bâkî kalan bu kubbede bir hoş sadâ imiş.”*'
      ].join('\n');
    }

    // Modern Serbest Şiir
    return [
      '## ' + city + ' Defterinden İmgeler',
      '',
      'Bir sabah uyanırsın,',
      'pencerede **' + region + '** mavisi,',
      'uzakta **' + lm1 + '**’nin taş gölgesi',
      'zamanın omzuna yaslanmış.',
      '',
      'Adımların **' + lm2 + '** kıvrımlarında',
      'eski bir mektubu arar gibi;',
      'cebinde **' + motifLine + '**,',
      'masanda buharı tüten **' + specialty + '**.',
      '',
      quoteClean ? '> *' + quoteClean + '*' : '',
      '',
      'Şehir bir harita noktası değil artık,',
      'kalbinde sessizce büyüyen bir cümle:',
      'İnsan gittiği yerleri değil,',
      '**' + city + '** gibi içinde taşıdığı şehirleri yaşar.'
    ]
      .filter(function (line, i, arr) {
        return !(line === '' && arr[i - 1] === '');
      })
      .join('\n');
  }

  // ---------------------------------------------------------------------------
  // Scoped CSS Injection (Dark + body.light-theme compatible)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .divan-studio {
        display: flex;
        flex-direction: column;
        gap: 22px;
        padding-bottom: 36px;
        color: var(--text-primary, #f8fafc);
      }

      /* Hero Banner */
      .divan-hero {
        position: relative;
        overflow: hidden;
        padding: 26px 28px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 86% 14%, rgba(245, 158, 11, 0.22), transparent 44%),
          radial-gradient(circle at 14% 88%, rgba(168, 85, 247, 0.18), transparent 46%),
          linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(30, 41, 59, 0.88));
        border: 1px solid rgba(245, 158, 11, 0.3);
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.45));
      }

      .divan-hero-top {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .divan-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.32);
        padding: 5px 12px;
        border-radius: 999px;
        margin-bottom: 10px;
      }

      .divan-hero h2 {
        font-family: var(--font-heading, sans-serif);
        font-size: clamp(1.35rem, 2.5vw, 1.95rem);
        font-weight: 800;
        line-height: 1.22;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #fef3c7 0%, #f59e0b 48%, #c084fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .divan-hero-sub {
        max-width: 780px;
        font-size: 0.92rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.62;
      }

      .divan-hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .divan-hero-btn {
        cursor: pointer;
        border: 1px solid rgba(245, 158, 11, 0.42);
        background: rgba(245, 158, 11, 0.16);
        color: #fef3c7;
        padding: 9px 14px;
        border-radius: 12px;
        font-size: 0.82rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        transition: all 0.2s ease;
      }

      .divan-hero-btn:hover {
        background: rgba(245, 158, 11, 0.28);
        transform: translateY(-1px);
      }

      .divan-stats-row {
        display: grid;
        grid-template-columns: repeat(4, minmax(120px, 1fr));
        gap: 10px;
        margin-top: 18px;
      }

      .divan-stat-pill {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 12px;
        padding: 11px 14px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .divan-stat-val {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.24rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .divan-stat-lbl {
        font-size: 0.74rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* Gemini AI Poetry / Beş Şehir Generator Studio */
      .divan-ai-studio {
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 95% 10%, rgba(168, 85, 247, 0.14), transparent 42%),
          radial-gradient(circle at 5% 95%, rgba(0, 242, 254, 0.1), transparent 40%),
          var(--bg-card, rgba(30, 41, 59, 0.78));
        border: 1px solid rgba(168, 85, 247, 0.34);
        padding: 22px;
        backdrop-filter: blur(14px);
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .divan-studio-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .divan-studio-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .divan-studio-sub {
        font-size: 0.84rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 3px;
      }

      .divan-engine-pill {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 999px;
        border: 1px solid rgba(16, 185, 129, 0.38);
        background: rgba(16, 185, 129, 0.14);
        color: #6ee7b7;
      }

      .divan-engine-pill.is-offline {
        border-color: rgba(245, 158, 11, 0.38);
        background: rgba(245, 158, 11, 0.14);
        color: #fcd34d;
      }

      .divan-studio-grid {
        display: grid;
        grid-template-columns: minmax(300px, 430px) minmax(0, 1fr);
        gap: 18px;
        align-items: stretch;
      }

      .divan-studio-form {
        display: flex;
        flex-direction: column;
        gap: 13px;
        background: rgba(15, 23, 42, 0.48);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: 15px;
        padding: 16px;
      }

      .divan-field-label {
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary, #94a3b8);
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }

      .divan-select,
      .divan-input,
      .divan-textarea {
        width: 100%;
        font-family: var(--font-body, sans-serif);
        font-size: 0.88rem;
        color: var(--text-primary, #f8fafc);
        background: rgba(10, 15, 29, 0.72);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        border-radius: 11px;
        padding: 10px 12px;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .divan-select:focus,
      .divan-input:focus,
      .divan-textarea:focus {
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.16);
      }

      .divan-genre-list {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .divan-genre-btn {
        cursor: pointer;
        text-align: left;
        padding: 10px 12px;
        border-radius: 11px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.56);
        color: var(--text-primary, #f8fafc);
        display: flex;
        flex-direction: column;
        gap: 3px;
        transition: all 0.18s ease;
      }

      .divan-genre-btn:hover {
        border-color: rgba(245, 158, 11, 0.48);
      }

      .divan-genre-btn.active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(168, 85, 247, 0.18));
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 18px rgba(245, 158, 11, 0.16);
      }

      .divan-genre-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.85rem;
        font-weight: 700;
      }

      .divan-genre-badge {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: var(--accent-gold, #f59e0b);
      }

      .divan-genre-desc {
        font-size: 0.75rem;
        color: var(--text-secondary, #94a3b8);
      }

      .divan-motif-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 6px;
      }

      .divan-mini-chip {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-secondary, #94a3b8);
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 0.72rem;
        font-weight: 600;
        transition: all 0.16s ease;
      }

      .divan-mini-chip:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(0, 242, 254, 0.42);
      }

      .divan-generate-row {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }

      .divan-generate-btn {
        flex: 1;
        cursor: pointer;
        border: none;
        border-radius: 12px;
        padding: 12px 16px;
        font-family: var(--font-heading, sans-serif);
        font-size: 0.92rem;
        font-weight: 800;
        color: #0f172a;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 55%, #fb7185 100%);
        box-shadow: 0 8px 20px rgba(245, 158, 11, 0.25);
        transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
      }

      .divan-generate-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 24px rgba(245, 158, 11, 0.35);
      }

      .divan-generate-btn:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      .divan-stop-btn {
        cursor: pointer;
        border: 1px solid rgba(244, 63, 94, 0.45);
        background: rgba(244, 63, 94, 0.15);
        color: #fda4af;
        border-radius: 12px;
        padding: 0 14px;
        font-size: 0.82rem;
        font-weight: 700;
      }

      /* Parchment Output Paper */
      .divan-paper {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-radius: 16px;
        background:
          radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.08), transparent 45%),
          rgba(10, 15, 29, 0.68);
        border: 1px solid rgba(245, 158, 11, 0.24);
        padding: 18px 20px;
        min-height: 360px;
      }

      .divan-paper-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .divan-paper-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.96rem;
        font-weight: 800;
        color: var(--accent-gold, #f59e0b);
      }

      .divan-paper-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .divan-action-btn {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(30, 41, 59, 0.78);
        color: var(--text-primary, #f8fafc);
        border-radius: 9px;
        padding: 6px 11px;
        font-size: 0.77rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.18s ease;
      }

      .divan-action-btn:hover:not(:disabled) {
        border-color: var(--accent-cyan, #00f2fe);
        transform: translateY(-1px);
      }

      .divan-action-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .divan-action-btn.is-save {
        border-color: rgba(16, 185, 129, 0.45);
        background: rgba(16, 185, 129, 0.16);
        color: #6ee7b7;
      }

      .divan-paper-body {
        flex: 1;
        padding: 16px 4px;
        font-size: 0.95rem;
        line-height: 1.75;
        color: var(--text-primary, #f8fafc);
        overflow-y: auto;
        max-height: 460px;
      }

      .divan-paper-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        min-height: 240px;
        gap: 10px;
        color: var(--text-secondary, #94a3b8);
        padding: 18px;
      }

      .divan-paper-foot {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-top: 10px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      .divan-md-h {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.08rem;
        font-weight: 800;
        color: var(--accent-gold, #f59e0b);
        margin-bottom: 10px;
      }

      .divan-md-p {
        margin-bottom: 6px;
      }

      .divan-md-spacer {
        height: 8px;
      }

      .divan-md-quote {
        margin: 10px 0;
        padding: 10px 14px;
        border-left: 3px solid var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.08);
        border-radius: 0 10px 10px 0;
        font-style: italic;
        color: var(--text-secondary, #cbd5e1);
      }

      .divan-md-list {
        padding-left: 20px;
        margin: 8px 0;
      }

      /* Filter Controls */
      .divan-controls {
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: 16px;
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 13px;
        backdrop-filter: blur(12px);
      }

      .divan-search-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .divan-search-box {
        position: relative;
        flex: 1;
        min-width: 240px;
        display: flex;
        align-items: center;
      }

      .divan-search-icon {
        position: absolute;
        left: 13px;
        font-size: 0.92rem;
        opacity: 0.75;
        pointer-events: none;
      }

      .divan-search-input {
        width: 100%;
        padding: 10px 36px 10px 38px;
        border-radius: 11px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary, #f8fafc);
        font-size: 0.88rem;
        outline: none;
      }

      .divan-search-input:focus {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .divan-search-clear {
        position: absolute;
        right: 10px;
        border: none;
        background: transparent;
        color: var(--text-muted, #64748b);
        cursor: pointer;
        font-size: 0.9rem;
        padding: 2px 6px;
      }

      .divan-results-meta {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-secondary, #94a3b8);
      }

      .divan-chip-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 7px;
      }

      .divan-chip-label {
        font-size: 0.74rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted, #64748b);
        margin-right: 4px;
      }

      .divan-chip {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.48);
        color: var(--text-secondary, #94a3b8);
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.18s ease;
      }

      .divan-chip:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(0, 242, 254, 0.45);
      }

      .divan-chip.active {
        background: rgba(0, 242, 254, 0.16);
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
      }

      .divan-chip.tradition-active {
        background: rgba(245, 158, 11, 0.18);
        border-color: var(--accent-gold, #f59e0b);
        color: var(--text-primary, #f8fafc);
      }

      /* Section Headings */
      .divan-section-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: 4px;
      }

      .divan-section-head h3 {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.08rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .divan-section-count {
        font-size: 0.78rem;
        font-weight: 700;
        padding: 4px 11px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        color: var(--text-secondary, #94a3b8);
      }

      /* Anthology & Province Grids */
      .divan-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(335px, 1fr));
        gap: 16px;
      }

      .divan-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        padding: 18px;
        border-radius: 16px;
        background: var(--bg-card, rgba(30, 41, 59, 0.74));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .divan-card:hover {
        transform: translateY(-3px);
        border-color: rgba(245, 158, 11, 0.45);
        box-shadow: 0 14px 30px -10px rgba(0, 0, 0, 0.45);
      }

      .divan-card.is-curated {
        border-color: rgba(245, 158, 11, 0.26);
        background:
          radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.08), transparent 46%),
          var(--bg-card, rgba(30, 41, 59, 0.78));
      }

      .divan-card-top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .divan-tradition-badge {
        font-size: 0.71rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid currentColor;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .divan-era-pill {
        font-size: 0.71rem;
        font-weight: 600;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        color: var(--text-secondary, #94a3b8);
      }

      .divan-work-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.08rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.3;
        margin-top: 4px;
      }

      .divan-author-name {
        font-size: 0.84rem;
        font-weight: 700;
        color: var(--accent-gold, #f59e0b);
        margin-top: 2px;
      }

      .divan-excerpt-box {
        padding: 11px 13px;
        border-radius: 12px;
        border-left: 3px solid var(--accent-gold, #f59e0b);
        background: rgba(15, 23, 42, 0.54);
        font-size: 0.86rem;
        line-height: 1.58;
        font-style: italic;
        color: var(--text-primary, #f1f5f9);
      }

      .divan-commentary {
        font-size: 0.83rem;
        line-height: 1.56;
        color: var(--text-secondary, #cbd5e1);
      }

      .divan-echo-note {
        font-size: 0.79rem;
        line-height: 1.5;
        color: var(--accent-emerald, #34d399);
        background: rgba(16, 185, 129, 0.09);
        border: 1px solid rgba(16, 185, 129, 0.22);
        border-radius: 10px;
        padding: 8px 11px;
      }

      .divan-lq-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .divan-lq-item {
        font-size: 0.81rem;
        line-height: 1.5;
        padding: 8px 11px;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.46);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        color: var(--text-secondary, #cbd5e1);
      }

      .divan-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .divan-tag {
        font-size: 0.71rem;
        font-weight: 600;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.09));
        color: var(--text-secondary, #94a3b8);
      }

      .divan-card-foot {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .divan-city-btn {
        cursor: pointer;
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.32);
        padding: 5px 10px;
        border-radius: 9px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.18s ease;
      }

      .divan-city-btn:hover {
        background: rgba(0, 242, 254, 0.22);
        transform: translateY(-1px);
      }

      .divan-compose-btn {
        cursor: pointer;
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--accent-gold, #fbbf24);
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.34);
        padding: 5px 10px;
        border-radius: 9px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.18s ease;
      }

      .divan-compose-btn:hover {
        background: rgba(245, 158, 11, 0.24);
        transform: translateY(-1px);
      }

      .divan-empty {
        text-align: center;
        padding: 36px 20px;
        border-radius: 16px;
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.18));
        background: rgba(15, 23, 42, 0.35);
        color: var(--text-secondary, #94a3b8);
      }

      /* Light Theme Compatibility */
      body.light-theme .divan-studio {
        color: var(--text-primary, #0f172a);
      }

      body.light-theme .divan-hero {
        background:
          radial-gradient(circle at 86% 14%, rgba(217, 119, 6, 0.16), transparent 46%),
          radial-gradient(circle at 14% 88%, rgba(124, 58, 237, 0.12), transparent 48%),
          linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(241, 245, 249, 0.94));
        border-color: rgba(217, 119, 6, 0.32);
      }

      body.light-theme .divan-hero h2 {
        background: linear-gradient(135deg, #0f172a 0%, #b45309 55%, #6d28d9 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .divan-hero-btn {
        background: rgba(217, 119, 6, 0.14);
        color: #92400e;
        border-color: rgba(217, 119, 6, 0.36);
      }

      body.light-theme .divan-stat-pill,
      body.light-theme .divan-studio-form,
      body.light-theme .divan-select,
      body.light-theme .divan-input,
      body.light-theme .divan-textarea,
      body.light-theme .divan-genre-btn,
      body.light-theme .divan-mini-chip,
      body.light-theme .divan-search-input,
      body.light-theme .divan-chip,
      body.light-theme .divan-era-pill,
      body.light-theme .divan-excerpt-box,
      body.light-theme .divan-lq-item,
      body.light-theme .divan-action-btn {
        background: rgba(241, 245, 249, 0.9);
        color: var(--text-primary, #0f172a);
        border-color: rgba(15, 23, 42, 0.13);
      }

      body.light-theme .divan-ai-studio {
        background:
          radial-gradient(circle at 95% 10%, rgba(124, 58, 237, 0.08), transparent 44%),
          rgba(255, 255, 255, 0.92);
        border-color: rgba(124, 58, 237, 0.26);
      }

      body.light-theme .divan-paper {
        background:
          radial-gradient(circle at 100% 0%, rgba(217, 119, 6, 0.07), transparent 45%),
          #fffdf8;
        border-color: rgba(217, 119, 6, 0.28);
      }

      body.light-theme .divan-card.is-curated {
        background:
          radial-gradient(circle at 100% 0%, rgba(217, 119, 6, 0.07), transparent 45%),
          rgba(255, 255, 255, 0.94);
      }

      body.light-theme .divan-genre-btn.active {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.16), rgba(124, 58, 237, 0.13));
        border-color: #d97706;
      }

      body.light-theme .divan-chip.active {
        background: rgba(2, 132, 199, 0.14);
        border-color: #0284c7;
      }

      body.light-theme .divan-chip.tradition-active {
        background: rgba(217, 119, 6, 0.16);
        border-color: #d97706;
      }

      body.light-theme .divan-commentary,
      body.light-theme .divan-lq-item,
      body.light-theme .divan-md-quote {
        color: var(--text-secondary, #334155);
      }

      body.light-theme .divan-echo-note {
        color: #047857;
        background: rgba(5, 150, 105, 0.09);
        border-color: rgba(5, 150, 105, 0.24);
      }

      body.light-theme .divan-author-name,
      body.light-theme .divan-paper-title,
      body.light-theme .divan-compose-btn {
        color: #b45309;
      }

      body.light-theme .divan-engine-pill {
        color: #047857;
      }

      body.light-theme .divan-engine-pill.is-offline {
        color: #b45309;
      }

      body.light-theme .divan-action-btn.is-save {
        color: #047857;
        background: rgba(5, 150, 105, 0.13);
      }

      body.light-theme .divan-stop-btn {
        color: #be123c;
      }

      body.light-theme .divan-tag {
        background: rgba(15, 23, 42, 0.05);
        color: var(--text-secondary, #334155);
      }

      body.light-theme .divan-empty {
        background: rgba(241, 245, 249, 0.75);
      }

      @media (max-width: 960px) {
        .divan-studio-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .divan-stats-row {
          grid-template-columns: repeat(2, 1fr);
        }
        .divan-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Catalog Builder: 24 Curated Works + 81 Province Literary Quotes
  // ---------------------------------------------------------------------------
  function buildCatalog(provinces, normFn) {
    const provMap = provinces && typeof provinces === 'object' ? provinces : {};
    const sortedKeys = Object.keys(provMap).sort(function (a, b) {
      const pa = Number(provMap[a] && provMap[a].plate) || 999;
      const pb = Number(provMap[b] && provMap[b].plate) || 999;
      if (pa !== pb) return pa - pb;
      return String((provMap[a] && provMap[a].name) || a).localeCompare(
        String((provMap[b] && provMap[b].name) || b),
        'tr'
      );
    });

    const curatedItems = CURATED_ANTHOLOGY.map(function (item) {
      const p = provMap[item.provinceKey] || {};
      const regionCode = p.region_code || item.provinceKey.split('/')[0] || '';
      const regionName = p.region || '';
      const relatedNames = (item.relatedKeys || [])
        .map(function (rk) {
          return (provMap[rk] && provMap[rk].name) || '';
        })
        .filter(Boolean);

      const searchBlob = normFn(
        [
          item.author,
          item.workTitle,
          item.era,
          item.tradition,
          item.excerpt,
          item.commentary,
          item.travelEcho,
          p.name || '',
          regionName,
          relatedNames.join(' '),
          (item.motifs || []).join(' ')
        ].join(' ')
      );

      return Object.assign({}, item, {
        provinceName: p.name || item.provinceKey.split('/')[1] || '',
        plate: p.plate || null,
        region: regionName,
        regionCode: regionCode,
        relatedNames: relatedNames,
        searchBlob: searchBlob
      });
    });

    let totalQuotesCount = 0;
    const provinceItems = sortedKeys.map(function (key) {
      const p = provMap[key] || {};
      const rawLqs = Array.isArray(p.literary_quotes) ? p.literary_quotes.filter(Boolean) : [];
      const quoteStr = typeof p.quote === 'string' ? p.quote.trim() : '';
      const customQuoteStr =
        typeof p.custom_quote === 'string' && p.custom_quote.trim() !== quoteStr
          ? p.custom_quote.trim()
          : '';
      totalQuotesCount += rawLqs.length + (quoteStr ? 1 : 0);

      const searchBlob = normFn(
        [
          p.name || '',
          formatPlate(p.plate),
          p.region || '',
          quoteStr,
          customQuoteStr,
          rawLqs.join(' '),
          Array.isArray(p.landmarks) ? p.landmarks.join(' ') : ''
        ].join(' ')
      );

      return {
        key: key,
        name: p.name || key.split('/')[1] || key,
        plate: p.plate || null,
        region: p.region || '',
        regionCode: p.region_code || key.split('/')[0] || '',
        quote: quoteStr,
        customQuote: customQuoteStr,
        literaryQuotes: rawLqs,
        landmarks: Array.isArray(p.landmarks) ? p.landmarks : [],
        searchBlob: searchBlob
      };
    });

    return {
      sortedKeys: sortedKeys,
      curatedItems: curatedItems,
      provinceItems: provinceItems,
      totalQuotesCount: totalQuotesCount
    };
  }

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const esc = ctx && typeof ctx.escapeHtml === 'function' ? ctx.escapeHtml : defaultEscapeHtml;
    const norm = ctx && typeof ctx.normalizeTurkish === 'function' ? ctx.normalizeTurkish : defaultNormalizeTurkish;
    const provinces = (ctx && ctx.data && ctx.data.provinces) || {};
    const catalog = buildCatalog(provinces, norm);

    // Initialize default selected city for AI generator
    if (!uiState.selectedCityKey || !provinces[uiState.selectedCityKey]) {
      const currentCity = ctx && ctx.state && ctx.state.currentCity;
      if (currentCity && provinces[currentCity]) {
        uiState.selectedCityKey = currentCity;
      } else if (provinces['01_Marmara/Bursa']) {
        uiState.selectedCityKey = '01_Marmara/Bursa';
      } else {
        uiState.selectedCityKey = catalog.sortedKeys[0] || '';
      }
    }

    const hasAiClient =
      typeof window !== 'undefined' &&
      window.SEYYAH_AI &&
      typeof window.SEYYAH_AI.stream === 'function';
    const hasAiKey =
      hasAiClient &&
      typeof window.SEYYAH_AI.hasKey === 'function' &&
      window.SEYYAH_AI.hasKey();

    function openCity(key) {
      if (key && ctx && typeof ctx.selectCity === 'function') {
        ctx.selectCity(key);
      }
    }

    function filterCurated() {
      if (uiState.tradition === '81 İl Edebi Alıntıları') return [];
      const q = norm(uiState.search);
      return catalog.curatedItems.filter(function (item) {
        if (uiState.region !== 'all' && item.regionCode !== uiState.region) return false;
        if (uiState.tradition !== 'all' && item.tradition !== uiState.tradition) return false;
        if (q && item.searchBlob.indexOf(q) === -1) return false;
        return true;
      });
    }

    function filterProvinceItems() {
      const showProvinces =
        uiState.tradition === 'all' || uiState.tradition === '81 İl Edebi Alıntıları';
      if (!showProvinces) return [];
      const q = norm(uiState.search);
      return catalog.provinceItems.filter(function (item) {
        if (uiState.region !== 'all' && item.regionCode !== uiState.region) return false;
        if (q && item.searchBlob.indexOf(q) === -1) return false;
        return true;
      });
    }

    function renderCuratedCard(item) {
      const tMeta = TRADITION_META[item.tradition] || TRADITIONS[1];
      const plateTxt = item.plate ? formatPlate(item.plate) + ' ' : '';
      const relatedTag =
        item.relatedNames && item.relatedNames.length
          ? '<span class="divan-tag">🔗 ' + esc(item.relatedNames.join(', ')) + '</span>'
          : '';
      const motifTags = (item.motifs || [])
        .map(function (m) {
          return '<span class="divan-tag">#' + esc(m) + '</span>';
        })
        .join('');

      return (
        '<article class="divan-card is-curated">' +
          '<div>' +
            '<div class="divan-card-top">' +
              '<span class="divan-tradition-badge" style="color:' + tMeta.color + ';background:' + tMeta.badgeBg + ';">' +
                esc(tMeta.icon + ' ' + item.tradition) +
              '</span>' +
              '<span class="divan-era-pill">' + esc(item.era) + '</span>' +
            '</div>' +
            '<h4 class="divan-work-title">' + esc(item.workTitle) + '</h4>' +
            '<div class="divan-author-name">✒️ ' + esc(item.author) + '</div>' +
          '</div>' +

          '<blockquote class="divan-excerpt-box">' + esc(item.excerpt) + '</blockquote>' +
          '<p class="divan-commentary">' + esc(item.commentary) + '</p>' +
          '<div class="divan-echo-note">🧭 <strong>Seyyahın İzlenimi:</strong> ' + esc(item.travelEcho) + '</div>' +

          '<div class="divan-tags">' + motifTags + relatedTag + '</div>' +

          '<div class="divan-card-foot">' +
            '<button type="button" class="divan-city-btn" data-open-city="' + esc(item.provinceKey) + '">' +
              '📍 ' + esc(plateTxt + item.provinceName) +
            '</button>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
              '<button type="button" class="divan-action-btn" data-card-tts="' + esc(item.id) + '" title="Sesli Dinle (tr-TR)">' +
                (uiState.isSpeaking && uiState.speakingCardId === item.id ? '⏹️ Durdur' : '🔊 Dinle') +
              '</button>' +
              '<button type="button" class="divan-action-btn" data-card-copy="' + esc(item.id) + '" title="Şiiri Kopyala">📋 Kopyala</button>' +
              '<button type="button" class="divan-compose-btn" data-compose-city="' + esc(item.provinceKey) + '">' +
                '✨ Bu Şehre Yaz' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }

    function renderProvinceQuoteCard(prov) {
      const lqHtml = prov.literaryQuotes.length
        ? '<div class="divan-lq-list">' +
            prov.literaryQuotes
              .map(function (q) {
                return '<div class="divan-lq-item">“' + esc(stripMdSyntax(q).replace(/^["“]|["”]$/g, '')) + '”</div>';
              })
              .join('') +
          '</div>'
        : '<div class="divan-lq-item" style="opacity:0.75;">Bu il için arşivde ek edebî alıntı bekleniyor.</div>';

      return (
        '<article class="divan-card">' +
          '<div>' +
            '<div class="divan-card-top">' +
              '<span class="divan-tradition-badge" style="color:#38bdf8;background:rgba(56,189,248,0.14);">' +
                '📜 81 İl Edebi Alıntısı' +
              '</span>' +
              '<span class="divan-era-pill">' + esc(prov.region) + '</span>' +
            '</div>' +
            '<h4 class="divan-work-title">' + esc(formatPlate(prov.plate) + ' · ' + prov.name) + '</h4>' +
          '</div>' +

          (prov.quote
            ? '<blockquote class="divan-excerpt-box">“' + esc(prov.quote) + '”</blockquote>'
            : '') +
          lqHtml +

          '<div class="divan-card-foot">' +
            '<button type="button" class="divan-city-btn" data-open-city="' + esc(prov.key) + '">' +
              '🏛️ Şehri Keşfet' +
            '</button>' +
            '<button type="button" class="divan-compose-btn" data-compose-city="' + esc(prov.key) + '">' +
              '✨ Şiir / Deneme Yaz' +
            '</button>' +
          '</div>' +
        '</article>'
      );
    }

    function updateCatalogView() {
      const curatedMatches = filterCurated();
      const provinceMatches = filterProvinceItems();
      const resultsMetaEl = container.querySelector('#divan-results-meta');
      const catalogHost = container.querySelector('#divan-catalog-host');
      if (!catalogHost) return;

      const totalVisible = curatedMatches.length + provinceMatches.length;
      if (resultsMetaEl) {
        resultsMetaEl.textContent =
          curatedMatches.length + ' seçkin eser · ' + provinceMatches.length + ' il alıntı dosyası gösteriliyor';
      }

      if (totalVisible === 0) {
        catalogHost.innerHTML =
          '<div class="divan-empty">' +
            '<p style="font-size:1.02rem;font-weight:700;margin-bottom:6px;">Aranan kriterlere uygun edebî kayıt bulunamadı</p>' +
            '<p style="font-size:0.85rem;">Bölge, edebî gelenek veya arama filtresini sadeleştirerek tüm Anadolu divanını görebilirsiniz.</p>' +
          '</div>';
        return;
      }

      let html = '';

      if (curatedMatches.length > 0) {
        html +=
          '<div class="divan-section-head">' +
            '<h3>🖋️ Seçkin Anadolu Şiir, Türkü &amp; “Beş Şehir” Antolojisi</h3>' +
            '<span class="divan-section-count">' + curatedMatches.length + ' / ' + catalog.curatedItems.length + ' Başyapıt</span>' +
          '</div>' +
          '<div class="divan-grid">' +
            curatedMatches.map(renderCuratedCard).join('') +
          '</div>';
      }

      if (provinceMatches.length > 0) {
        html +=
          '<div class="divan-section-head" style="margin-top:8px;">' +
            '<h3>📜 81 İl Edebi Alıntıları &amp; Şehir Özdeyişleri</h3>' +
            '<span class="divan-section-count">' + provinceMatches.length + ' / ' + catalog.provinceItems.length + ' İl</span>' +
          '</div>' +
          '<div class="divan-grid">' +
            provinceMatches.map(renderProvinceQuoteCard).join('') +
          '</div>';
      }

      catalogHost.innerHTML = html;

      catalogHost.querySelectorAll('[data-open-city]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          openCity(btn.getAttribute('data-open-city'));
        });
      });

      catalogHost.querySelectorAll('[data-card-tts]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const cardId = btn.getAttribute('data-card-tts');
          if (uiState.isSpeaking && uiState.speakingCardId === cardId) {
            stopDivanTts();
            updateCatalogView();
            updatePaperDom();
            return;
          }
          const found = CURATED_ANTHOLOGY.find(function (x) { return x.id === cardId; });
          if (!found) return;
          const ok = speakTurkishText(
            found.workTitle + '. ' + found.author + '. ' + found.excerpt,
            cardId,
            function () {
              updateCatalogView();
              updatePaperDom();
            }
          );
          if (!ok) {
            notify(ctx, '⚠️ Tarayıcınız sesli okuma (TTS) özelliğini desteklemiyor.');
          } else {
            notify(ctx, '🔊 ' + found.author + ' sesli okunuyor (tr-TR)...');
            updateCatalogView();
            updatePaperDom();
          }
        });
      });

      catalogHost.querySelectorAll('[data-card-copy]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const cardId = btn.getAttribute('data-card-copy');
          const found = CURATED_ANTHOLOGY.find(function (x) { return x.id === cardId; });
          if (!found) return;
          const txt = found.workTitle + ' — ' + found.author + '\n\n' + found.excerpt;
          copyTextReliable(txt).then(function (ok) {
            notify(ctx, ok ? '📋 Şiir alıntısı panoya kopyalandı!' : '⚠️ Panoya kopyalanamadı.');
          });
        });
      });

      catalogHost.querySelectorAll('[data-compose-city]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const cityKey = btn.getAttribute('data-compose-city');
          if (!cityKey || !provinces[cityKey]) return;
          uiState.selectedCityKey = cityKey;
          const citySelect = container.querySelector('#divan-ai-city-select');
          if (citySelect) citySelect.value = cityKey;
          const studioEl = container.querySelector('#divan-ai-studio');
          if (studioEl && typeof studioEl.scrollIntoView === 'function') {
            studioEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          notify(ctx, '🖋️ ' + provinces[cityKey].name + ' AI Şiir & Deneme Atölyesi için seçildi.');
        });
      });
    }

    function updatePaperDom() {
      const bodyEl = container.querySelector('#divan-paper-body');
      const titleEl = container.querySelector('#divan-paper-title');
      const wordEl = container.querySelector('#divan-word-count');
      const sourceEl = container.querySelector('#divan-source-label');
      const copyBtn = container.querySelector('#divan-copy-btn');
      const ttsBtn = container.querySelector('#divan-tts-btn');
      const dlBtn = container.querySelector('#divan-dl-btn');
      const saveBtn = container.querySelector('#divan-save-btn');
      const genBtn = container.querySelector('#divan-generate-btn');
      const stopBtn = container.querySelector('#divan-stop-btn');

      const activeProv = provinces[uiState.outputCityKey || uiState.selectedCityKey];
      const activeGenre = getGenreMeta(uiState.outputGenreId || uiState.selectedGenreId);

      if (titleEl) {
        titleEl.textContent = activeProv
          ? formatPlate(activeProv.plate) + ' ' + activeProv.name + ' · ' + activeGenre.shortLabel
          : 'Edebî Kalem Hazır';
      }

      if (bodyEl) {
        if (!uiState.outputText) {
          bodyEl.innerHTML =
            '<div class="divan-paper-empty">' +
              '<div style="font-size:2rem;">🖋️</div>' +
              '<div style="font-weight:700;color:var(--text-primary);">Sayfa Henüz Boş</div>' +
              '<p style="max-width:440px;font-size:0.85rem;">Sol taraftan 81 ilden birini ve dilediğiniz edebî üslubu seçip <strong>“Şiir / Deneme Yaz”</strong> düğmesine basın; Gemini AI canlı olarak yazsın, ardından Seyir Defterim’e kaydedin.</p>' +
            '</div>';
        } else {
          bodyEl.innerHTML = renderSafeMarkdown(uiState.outputText, esc);
          if (uiState.isStreaming) {
            bodyEl.scrollTop = bodyEl.scrollHeight;
          }
        }
      }

      const words = countWords(uiState.outputText);
      if (wordEl) {
        wordEl.textContent = words + ' kelime';
      }
      if (sourceEl) {
        sourceEl.textContent = uiState.isStreaming
          ? '⏳ Yazılıyor...'
          : (uiState.outputSource || 'Kalem hazır');
      }

      const hasOutput = Boolean(uiState.outputText && uiState.outputText.trim());
      if (copyBtn) copyBtn.disabled = !hasOutput || uiState.isStreaming;
      if (ttsBtn) {
        ttsBtn.disabled = !hasOutput || uiState.isStreaming;
        ttsBtn.textContent =
          uiState.isSpeaking && uiState.speakingCardId === 'paper'
            ? '⏹️ Sesi Durdur'
            : '🔊 Sesli Dinle (TTS)';
      }
      if (dlBtn) dlBtn.disabled = !hasOutput || uiState.isStreaming;
      if (saveBtn) saveBtn.disabled = !hasOutput || uiState.isStreaming;
      if (genBtn) {
        genBtn.disabled = uiState.isStreaming;
        genBtn.textContent = uiState.isStreaming ? '⏳ Yazılıyor...' : '✨ Şiir / Deneme Yaz';
      }
      if (stopBtn) {
        stopBtn.style.display = uiState.isStreaming ? 'inline-flex' : 'none';
      }
    }

    async function generatePiece(forceFresh) {
      const cityKey = uiState.selectedCityKey;
      const province = provinces[cityKey];
      if (!province) {
        notify(ctx, '⚠️ Lütfen önce bir il seçin.');
        return;
      }
      const genre = getGenreMeta(uiState.selectedGenreId);
      const runId = ++uiState.streamRunId;

      uiState.isStreaming = true;
      uiState.outputText = '';
      uiState.outputCityKey = cityKey;
      uiState.outputGenreId = genre.id;
      uiState.outputSource = '⏳ Gemini AI bağlantısı hazırlanıyor...';

      const saveBtn = container.querySelector('#divan-save-btn');
      if (saveBtn) saveBtn.textContent = "📝 Seyir Defterim'e Kaydet";
      updatePaperDom();

      const motifText = (uiState.motifNotes || '').trim();

      if (hasAiKey) {
        try {
          const prompt = buildLiteraryPrompt(province, cityKey, genre, motifText);
          const system =
            'Sen Türk edebiyatı, klasik divan şiiri, Anadolu âşık geleneği ve Ahmet Hamdi Tanpınar deneme üslubu konusunda derin bir edebiyatçısın. ' +
            'Yazdığın her şiir ve denemede Anadolu şehirlerinin gerçek dokusunu, tarihî hafızasını ve insan sıcaklığını zarif bir Türkçeyle işlersin.';
          const cacheKey =
            forceFresh || motifText
              ? null
              : 'divan_ai_v1_' + cityKey.replace(/[^a-z0-9]/gi, '_') + '_' + genre.id;

          uiState.outputSource = '✨ Gemini AI Canlı Akış';
          updatePaperDom();

          const res = await window.SEYYAH_AI.stream({
            prompt: prompt,
            system: system,
            temperature: 0.82,
            maxTokens: 1600,
            cacheKey: cacheKey,
            onChunk: function (_delta, fullText) {
              if (runId !== uiState.streamRunId) return;
              uiState.outputText = fullText;
              updatePaperDom();
            }
          });

          if (runId !== uiState.streamRunId) return;
          if (res && res.text) {
            uiState.outputText = res.text;
            uiState.outputSource =
              '✨ Gemini AI (' + (res.model || 'Canlı') + (res.cached ? ' · Önbellek' : '') + ')';
            uiState.isStreaming = false;
            updatePaperDom();
            return;
          }
        } catch (_err) {
          if (runId !== uiState.streamRunId) return;
          // Graceful fallback to rich offline poetic composition below
        }
      }

      // Rich offline poetic / Beş Şehir fallback with word-by-word reveal
      const offlineText = buildOfflineLiteraryPiece(province, genre, motifText);
      uiState.outputSource = '🕯️ Çevrimdışı Edebî Atölye (Gemini AI Anahtarı Yok / Yedek Üslup)';
      const tokens = offlineText.split(/(\s+)/);
      let cursor = 0;
      const step = 6;

      function revealNext() {
        if (runId !== uiState.streamRunId) return;
        cursor = Math.min(tokens.length, cursor + step);
        uiState.outputText = tokens.slice(0, cursor).join('');
        if (cursor >= tokens.length) {
          uiState.isStreaming = false;
          updatePaperDom();
          return;
        }
        updatePaperDom();
        setTimeout(revealNext, 24);
      }
      revealNext();
    }

    // Build province <option> list
    const cityOptionsHtml = catalog.sortedKeys
      .map(function (key) {
        const p = provinces[key];
        const selected = key === uiState.selectedCityKey ? ' selected' : '';
        return (
          '<option value="' + esc(key) + '"' + selected + '>' +
            esc(formatPlate(p.plate) + ' — ' + p.name + ' (' + (p.region || '') + ')') +
          '</option>'
        );
      })
      .join('');

    const genresHtml = AI_GENRES.map(function (g) {
      const activeCls = g.id === uiState.selectedGenreId ? ' active' : '';
      return (
        '<button type="button" class="divan-genre-btn' + activeCls + '" data-genre-id="' + esc(g.id) + '">' +
          '<div class="divan-genre-top">' +
            '<span>' + esc(g.icon + ' ' + g.label) + '</span>' +
            '<span class="divan-genre-badge">' + esc(g.badge) + '</span>' +
          '</div>' +
          '<span class="divan-genre-desc">' + esc(g.desc) + '</span>' +
        '</button>'
      );
    }).join('');

    const motifChipsHtml = MOTIF_CHIPS.map(function (chip) {
      return '<button type="button" class="divan-mini-chip" data-motif-chip="' + esc(chip) + '">+ ' + esc(chip) + '</button>';
    }).join('');

    container.innerHTML =
      '<div class="divan-studio">' +
        '<section class="divan-hero">' +
          '<div class="divan-hero-top">' +
            '<div>' +
              '<div class="divan-eyebrow">📜 7 Bölge · 81 İl Edebî Hafıza &amp; Şiir Divanı</div>' +
              '<h2>🖋️ Anadolu Şiir, Türkü &amp; “Beş Şehir” Edebiyat Divanı</h2>' +
              '<p class="divan-hero-sub">' +
                'Ahmet Hamdi Tanpınar’ın <em>Beş Şehir</em>’inden Yunus Emre ilahilerine, Âşık Veysel, Karacaoğlan, Neşet Ertaş ve Pir Sultan Abdal’dan Dede Korkut, Fuzûlî, Bâkî, Yahya Kemal, Sezai Karakoç ve Necip Fazıl’a uzanan <strong>24 başyapıtı</strong> ve <strong>81 ilin edebî alıntılarını</strong> keşfedin.' +
              '</p>' +
            '</div>' +
            '<div class="divan-hero-actions">' +
              '<button type="button" class="divan-hero-btn" id="divan-open-journal-btn">' +
                '📖 Seyir Defterim (<span id="divan-journal-count">' + getJournalEntryCount() + '</span>)' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div class="divan-stats-row">' +
            '<div class="divan-stat-pill"><span class="divan-stat-val">' + catalog.curatedItems.length + '</span><span class="divan-stat-lbl">Seçkin Eser &amp; Şehir Portresi</span></div>' +
            '<div class="divan-stat-pill"><span class="divan-stat-val">' + catalog.provinceItems.length + ' / 81</span><span class="divan-stat-lbl">İl Edebi Alıntı Dosyası</span></div>' +
            '<div class="divan-stat-pill"><span class="divan-stat-val">' + catalog.totalQuotesCount + '</span><span class="divan-stat-lbl">Toplam Şehir Özdeyişi &amp; Alıntı</span></div>' +
            '<div class="divan-stat-pill"><span class="divan-stat-val">4 Üslup</span><span class="divan-stat-lbl">Tanpınar · Yunus · Karacaoğlan · Serbest</span></div>' +
          '</div>' +
        '</section>' +

        '<!-- Interactive Gemini AI Poetry & Beş Şehir Essay Studio -->' +
        '<section class="divan-ai-studio" id="divan-ai-studio">' +
          '<div class="divan-studio-head">' +
            '<div>' +
              '<h3 class="divan-studio-title">✨ Gemini AI ile Seçili Şehre Özel Şiir veya “Beş Şehir” Denemesi Yaz</h3>' +
              '<p class="divan-studio-sub">81 ilden birini ve edebî üslubu seçin; seçtiğiniz şehrin tarihî dokusu ve alıntılarıyla özgün bir metin canlı olarak yazılsın.</p>' +
            '</div>' +
            '<span class="divan-engine-pill ' + (hasAiKey ? '' : 'is-offline') + '">' +
              (hasAiKey ? '⚡ Gemini AI Canlı Akış Hazır' : '🕯️ Çevrimdışı Edebî Atölye Modu') +
            '</span>' +
          '</div>' +

          '<div class="divan-studio-grid">' +
            '<div class="divan-studio-form">' +
              '<div>' +
                '<label class="divan-field-label" for="divan-ai-city-select">' +
                  '<span>1. Şehir Seçimi (81 İl)</span>' +
                  '<span>' + catalog.sortedKeys.length + ' il</span>' +
                '</label>' +
                '<select id="divan-ai-city-select" class="divan-select">' + cityOptionsHtml + '</select>' +
              '</div>' +

              '<div>' +
                '<div class="divan-field-label"><span>2. Edebî Üslup / Tür</span></div>' +
                '<div class="divan-genre-list" id="divan-genre-list">' + genresHtml + '</div>' +
              '</div>' +

              '<div>' +
                '<label class="divan-field-label" for="divan-motif-input">' +
                  '<span>3. İsteğe Bağlı Motif / Yol Hissiyatı</span>' +
                '</label>' +
                '<input type="text" id="divan-motif-input" class="divan-input" value="' + esc(uiState.motifNotes) + '" placeholder="Örn: İkindi güneşi, taş avlu, sıcak çay, gurbet..." />' +
                '<div class="divan-motif-chips">' + motifChipsHtml + '</div>' +
              '</div>' +

              '<div class="divan-generate-row">' +
                '<button type="button" class="divan-generate-btn" id="divan-generate-btn">✨ Şiir / Deneme Yaz</button>' +
                '<button type="button" class="divan-stop-btn" id="divan-stop-btn" style="display:none;">⏹ Durdur</button>' +
              '</div>' +
            '</div>' +

            '<div class="divan-paper">' +
              '<div class="divan-paper-head">' +
                '<div class="divan-paper-title" id="divan-paper-title">Edebî Kalem Hazır</div>' +
                '<div class="divan-paper-actions">' +
                  '<button type="button" class="divan-action-btn" id="divan-tts-btn" disabled>🔊 Sesli Dinle (TTS)</button>' +
                  '<button type="button" class="divan-action-btn" id="divan-copy-btn" disabled>📋 Şiiri Kopyala</button>' +
                  '<button type="button" class="divan-action-btn" id="divan-dl-btn" disabled>📥 .md İndir</button>' +
                  '<button type="button" class="divan-action-btn is-save" id="divan-save-btn" disabled>📝 Seyir Defterim\'e Kaydet</button>' +
                '</div>' +
              '</div>' +
              '<div class="divan-paper-body" id="divan-paper-body" aria-live="polite"></div>' +
              '<div class="divan-paper-foot">' +
                '<span id="divan-word-count">0 kelime</span>' +
                '<span id="divan-source-label">Kalem hazır</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</section>' +

        '<!-- Search & Filter Controls -->' +
        '<section class="divan-controls">' +
          '<div class="divan-search-row">' +
            '<div class="divan-search-box">' +
              '<span class="divan-search-icon">🔍</span>' +
              '<input type="text" id="divan-search-input" class="divan-search-input" value="' + esc(uiState.search) + '" placeholder="Şair, ozan, eser (Tanpınar, Veysel, Bozlak, Beş Şehir) veya şehir ara..." />' +
              '<button type="button" id="divan-search-clear" class="divan-search-clear" title="Aramayı temizle">✕</button>' +
            '</div>' +
            '<span class="divan-results-meta" id="divan-results-meta"></span>' +
          '</div>' +

          '<div class="divan-chip-bar" id="divan-region-chips">' +
            '<span class="divan-chip-label">Bölge:</span>' +
            REGIONS.map(function (r) {
              const cls = uiState.region === r.code ? ' active' : '';
              return '<button type="button" class="divan-chip' + cls + '" data-region="' + esc(r.code) + '">' + esc(r.icon + ' ' + r.shortLabel) + '</button>';
            }).join('') +
          '</div>' +

          '<div class="divan-chip-bar" id="divan-tradition-chips">' +
            '<span class="divan-chip-label">Gelenek:</span>' +
            TRADITIONS.map(function (t) {
              const cls = uiState.tradition === t.id ? ' tradition-active' : '';
              return '<button type="button" class="divan-chip' + cls + '" data-tradition="' + esc(t.id) + '">' + esc(t.icon + ' ' + t.label) + '</button>';
            }).join('') +
          '</div>' +
        '</section>' +

        '<section id="divan-catalog-host" style="display:flex;flex-direction:column;gap:16px;"></section>' +
      '</div>';

    // Wire AI Studio Controls
    const citySelect = container.querySelector('#divan-ai-city-select');
    const motifInput = container.querySelector('#divan-motif-input');
    const genBtn = container.querySelector('#divan-generate-btn');
    const stopBtn = container.querySelector('#divan-stop-btn');
    const ttsBtn = container.querySelector('#divan-tts-btn');
    const copyBtn = container.querySelector('#divan-copy-btn');
    const dlBtn = container.querySelector('#divan-dl-btn');
    const saveBtn = container.querySelector('#divan-save-btn');
    const openJournalBtn = container.querySelector('#divan-open-journal-btn');
    const journalCountEl = container.querySelector('#divan-journal-count');

    if (citySelect) {
      citySelect.addEventListener('change', function () {
        uiState.selectedCityKey = citySelect.value;
        if (!uiState.outputText && !uiState.isStreaming) {
          updatePaperDom();
        }
      });
    }

    container.querySelectorAll('#divan-genre-list .divan-genre-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        uiState.selectedGenreId = btn.getAttribute('data-genre-id') || 'tanpinar';
        container.querySelectorAll('#divan-genre-list .divan-genre-btn').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
        if (!uiState.outputText && !uiState.isStreaming) {
          updatePaperDom();
        }
      });
    });

    if (motifInput) {
      motifInput.addEventListener('input', function () {
        uiState.motifNotes = motifInput.value || '';
      });
    }

    container.querySelectorAll('[data-motif-chip]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        const val = chip.getAttribute('data-motif-chip') || '';
        const curr = (motifInput ? motifInput.value : uiState.motifNotes).trim();
        const next = curr ? curr + ', ' + val : val;
        uiState.motifNotes = next;
        if (motifInput) motifInput.value = next;
      });
    });

    if (genBtn) {
      genBtn.addEventListener('click', function () {
        generatePiece(Boolean(uiState.outputText));
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', function () {
        uiState.streamRunId += 1;
        uiState.isStreaming = false;
        uiState.outputSource = '⏹ Akış kullanıcı tarafından durduruldu';
        updatePaperDom();
      });
    }

    if (ttsBtn) {
      ttsBtn.addEventListener('click', function () {
        if (uiState.isSpeaking && uiState.speakingCardId === 'paper') {
          stopDivanTts();
          updatePaperDom();
          updateCatalogView();
          return;
        }
        if (!uiState.outputText) return;
        const ok = speakTurkishText(uiState.outputText, 'paper', function () {
          updatePaperDom();
          updateCatalogView();
        });
        if (!ok) {
          notify(ctx, '⚠️ Tarayıcınız sesli okuma (TTS) özelliğini desteklemiyor.');
        } else {
          notify(ctx, '🔊 Şiir / deneme sesli okunuyor (tr-TR)...');
          updatePaperDom();
          updateCatalogView();
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!uiState.outputText) return;
        const p = provinces[uiState.outputCityKey || uiState.selectedCityKey];
        const header = p ? p.name + ' — ' + getGenreMeta(uiState.outputGenreId).label + '\n\n' : '';
        copyTextReliable(header + uiState.outputText).then(function (ok) {
          notify(ctx, ok ? '📋 Şiir / edebî metin panoya kopyalandı!' : '⚠️ Panoya kopyalanamadı.');
        });
      });
    }

    if (dlBtn) {
      dlBtn.addEventListener('click', function () {
        if (!uiState.outputText) return;
        const cityKey = uiState.outputCityKey || uiState.selectedCityKey;
        const p = provinces[cityKey] || {};
        const genre = getGenreMeta(uiState.outputGenreId);
        const slug = norm(p.slug || p.name || 'anadolu').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const filename = (slug || 'divan') + '-' + genre.id + '.md';
        const header = '<!-- Anadolu Edebiyat Divanı · ' + (p.name || '') + ' (' + formatPlate(p.plate) + ') · ' + genre.label + ' -->\n\n';
        triggerMarkdownDownload(filename, header + uiState.outputText + '\n');
        notify(ctx, '📥 ' + filename + ' indirildi!');
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        if (!uiState.outputText) return;
        const cityKey = uiState.outputCityKey || uiState.selectedCityKey;
        const p = provinces[cityKey];
        if (!p) return;
        const genre = getGenreMeta(uiState.outputGenreId);

        const entry = {
          id: 'divan_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          cityKey: cityKey,
          cityName: p.name,
          plate: p.plate || null,
          region: p.region || '',
          mode: genre.id,
          styleLabel: genre.label,
          notes: (uiState.motifNotes || '').trim(),
          title: p.name + ' — ' + genre.shortLabel,
          content: uiState.outputText,
          model: uiState.outputSource || 'SEYYAH_AI',
          source: 'divan',
          createdAt: new Date().toISOString()
        };

        const res = saveEntryToSeyirDefteri(entry, cityKey);
        if (res.saved) {
          if (journalCountEl) journalCountEl.textContent = String(res.count);
          saveBtn.textContent = '✓ Kaydedildi';
          notify(ctx, '📝 ' + p.name + " eseri Seyir Defterim'e kaydedildi! (Toplam " + res.count + ' kayıt)');
        } else {
          notify(ctx, '⚠️ Yerel depolamaya kaydedilemedi.');
        }
      });
    }

    if (openJournalBtn) {
      openJournalBtn.addEventListener('click', function () {
        if (ctx && typeof ctx.openView === 'function') {
          ctx.openView('journal');
        }
      });
    }

    // Wire Catalog Filter Controls
    const searchInput = container.querySelector('#divan-search-input');
    const searchClear = container.querySelector('#divan-search-clear');

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        uiState.search = searchInput.value || '';
        updateCatalogView();
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', function () {
        uiState.search = '';
        if (searchInput) searchInput.value = '';
        updateCatalogView();
      });
    }

    container.querySelectorAll('#divan-region-chips .divan-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        uiState.region = chip.getAttribute('data-region') || 'all';
        container.querySelectorAll('#divan-region-chips .divan-chip').forEach(function (c) {
          c.classList.toggle('active', c === chip);
        });
        updateCatalogView();
      });
    });

    container.querySelectorAll('#divan-tradition-chips .divan-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        uiState.tradition = chip.getAttribute('data-tradition') || 'all';
        container.querySelectorAll('#divan-tradition-chips .divan-chip').forEach(function (c) {
          c.classList.toggle('tradition-active', c === chip);
        });
        updateCatalogView();
      });
    });

    updatePaperDom();
    updateCatalogView();
  }

  window.SEYYAH_MODULES.divan = {
    render: render
  };
})();
