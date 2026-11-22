/**
 * Anadolu Seyahatnamesi — Anadolu İrfan & Gönül Coğrafyası Atlası
 * 81 ilin spiritual_figures, reflection ve literary_quotes verilerini
 * 24 büyük Anadolu gönül ve düşünce mimarıyla birleştiren, 7 bölge ve 4 tema
 * filtreli, Gemini AI canlı tefekkür akışlı (çevrimdışı felsefî deneme yedekli)
 * interaktif irfan stüdyosu.
 * Registers on window.SEYYAH_MODULES.irfanAtlas = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-irfan-atlas-styles';

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

  const THEMES = [
    { id: 'all', label: 'Tüm Temalar', icon: '✨', color: '#00f2fe', badgeBg: 'rgba(0, 242, 254, 0.14)' },
    { id: 'Tasavvuf & İrfan', label: 'Tasavvuf & İrfan', icon: '🕊️', color: '#10b981', badgeBg: 'rgba(16, 185, 129, 0.16)' },
    { id: 'Felsefe & İlim', label: 'Felsefe & İlim', icon: '🔭', color: '#38bdf8', badgeBg: 'rgba(56, 189, 248, 0.16)' },
    { id: 'Ahîlik & Ahlâk', label: 'Ahîlik & Ahlâk', icon: '⚖️', color: '#f59e0b', badgeBg: 'rgba(245, 158, 11, 0.16)' },
    { id: 'Şiir & Hikmet', label: 'Şiir & Hikmet', icon: '📜', color: '#a855f7', badgeBg: 'rgba(168, 85, 247, 0.16)' }
  ];

  const CENTURIES = [
    { id: 'all', label: 'Tüm Asırlar', shortLabel: 'Tümü', icon: '⏳' },
    { id: 'early', label: 'VII–XII. Yüzyıl (Kurucu Kökler)', shortLabel: '7–12. YY', icon: '🌱' },
    { id: '13', label: 'XIII. Yüzyıl (Selçuklu & Horasan)', shortLabel: '13. YY', icon: '🕌' },
    { id: '14_15', label: 'XIV–XV. Yüzyıl (Kuruluş & Fetih)', shortLabel: '14–15. YY', icon: '⚔️' },
    { id: '16_17', label: 'XVI–XVII. Yüzyıl (Klasik Osmanlı)', shortLabel: '16–17. YY', icon: '📜' },
    { id: '18_20', label: 'XVIII–XX. Yüzyıl (Modern & Ozanlar)', shortLabel: '18–20. YY', icon: '🪕' }
  ];

  const SCHOOLS = [
    { id: 'all', label: 'Tüm Ocak & Ekoller', icon: '🕯️' },
    { id: 'Mevlevî & Ekberî', label: 'Mevlevî & Ekberî', icon: '🌀' },
    { id: 'Bayramî & Halvetî', label: 'Bayramî & Halvetî', icon: '🌾' },
    { id: 'Bektaşî & Horasan', label: 'Bektaşî & Horasan', icon: '🕊️' },
    { id: 'Ahîlik & Fütüvvet', label: 'Ahîlik & Fütüvvet', icon: '⚖️' },
    { id: 'Kadirî & Hâlidî', label: 'Kadirî & Hâlidî', icon: '📿' },
    { id: 'Ozan, Âlim & Seyyah', label: 'Ozan, Âlim & Seyyah', icon: '🔭' }
  ];

  // Approximate Anatolian coordinates mapped to SVG viewBox (0 0 900 400) for the 24 Gönül Sultanı & Ocaklar
  const PROVINCE_SVG_COORDS = {
    '01_Marmara/Edirne': { x: 86, y: 82 },
    '01_Marmara/Istanbul': { x: 168, y: 112 },
    '01_Marmara/Bursa': { x: 185, y: 166 },
    '01_Marmara/Bilecik': { x: 222, y: 174 },
    '02_Ege/Izmir': { x: 102, y: 248 },
    '02_Ege/Kutahya': { x: 215, y: 206 },
    '02_Ege/Usak': { x: 200, y: 234 },
    '02_Ege/Afyonkarahisar': { x: 245, y: 235 },
    '03_Akdeniz/Hatay': { x: 525, y: 348 },
    '04_IcAnadolu/Eskisehir': { x: 254, y: 188 },
    '04_IcAnadolu/Ankara': { x: 336, y: 174 },
    '04_IcAnadolu/Konya': { x: 345, y: 278 },
    '04_IcAnadolu/Karaman': { x: 368, y: 316 },
    '04_IcAnadolu/Aksaray': { x: 406, y: 248 },
    '04_IcAnadolu/Nevsehir': { x: 438, y: 238 },
    '04_IcAnadolu/Kirsehir': { x: 416, y: 204 },
    '04_IcAnadolu/Kayseri': { x: 482, y: 238 },
    '04_IcAnadolu/Sivas': { x: 544, y: 188 },
    '05_Karadeniz/Bolu': { x: 276, y: 134 },
    '05_Karadeniz/Kastamonu': { x: 376, y: 104 },
    '05_Karadeniz/Samsun': { x: 486, y: 102 },
    '05_Karadeniz/Bayburt': { x: 678, y: 146 },
    '06_DoguAnadolu/Malatya': { x: 588, y: 246 },
    '06_DoguAnadolu/Erzincan': { x: 632, y: 178 },
    '06_DoguAnadolu/Erzurum': { x: 724, y: 162 },
    '06_DoguAnadolu/Kars': { x: 804, y: 134 },
    '06_DoguAnadolu/Hakkari': { x: 834, y: 292 },
    '07_GuneydoguAnadolu/Gaziantep': { x: 556, y: 312 },
    '07_GuneydoguAnadolu/Diyarbakir': { x: 676, y: 276 },
    '07_GuneydoguAnadolu/Siirt': { x: 754, y: 274 }
  };

  const THEME_META = {};
  THEMES.forEach(function (t) {
    THEME_META[t.id] = t;
  });

  // 24 Major Anatolian Spiritual & Philosophical Figures mapped to real province keys
  const MASTER_FIGURES = [
    {
      id: 'mevlana-celaleddin-rumi',
      name: 'Mevlânâ Celâleddîn-i Rûmî',
      title: 'Aşkın, Semaın ve Evrensel Hoşgörünün Pîri',
      era: 'XIII. Yüzyıl (1207–1273)',
      provinceKey: '04_IcAnadolu/Konya',
      relatedKeys: ['04_IcAnadolu/Karaman', '02_Ege/Afyonkarahisar'],
      theme: 'Tasavvuf & İrfan',
      concepts: ['İlâhî Aşk', 'Sema', 'Tevazu', 'Mesnevî', 'Hamdım Piştim Yandım', 'Hoşgörü'],
      coreTeaching:
        '"Gel, ne olursan ol yine gel" çağrısıyla insanı şekil ve önyargıların ötesinde özüne davet eder; yolculuğu bir mekân değişiminden ziyade kalbin hamlıktan olgunluğa pişmesi olarak görür.',
      quote: 'Hamdım, piştim, yandım; ne ararsan kendinde ara.',
      nomadWisdom:
        'Rûmî’ye göre insan bir misafirhanedir; her sabah yeni bir şehir, yeni bir duygu kapıyı çalar. Dijital çağın hızında tükenmeden yol almanın sırrı, pergelin bir ayağını içsel sükûnete sabitleyip diğer ayağıyla dünyayı gezebilmektir.'
    },
    {
      id: 'yunus-emre',
      name: 'Yunus Emre',
      title: 'Türkçe İrfan Şiirinin ve Gönül Yapmanın Mimarı',
      era: 'XIII–XIV. Yüzyıl (1240–1320)',
      provinceKey: '04_IcAnadolu/Eskisehir',
      relatedKeys: ['04_IcAnadolu/Karaman', '04_IcAnadolu/Aksaray'],
      theme: 'Şiir & Hikmet',
      concepts: ['Gönül Yapmak', 'Sevelim Sevilelim', 'İlim Kendini Bilmektir', 'Yalınlık', 'Dervişlik'],
      coreTeaching:
        'En büyük ibadetin bir gönle dokunmak olduğunu sade ve duru bir Türkçeyle haykırır: "İlim ilim bilmektir, ilim kendin bilmektir." Azla yetinmeyi ve yeryüzüne sevgiyle bakmayı öğretir.',
      quote: 'Gelin tanış olalım, işi kolay kılalım; sevelim sevilelim, dünya kimseye kalmaz.',
      nomadWisdom:
        'Bir sırt çantasıyla sadeleşen modern seyyah için Yunus Emre, eşya kalabalığından kurtulup her durakta "tanış olma" ve yerel halkla samimi gönül bağı kurma sanatının en berrak rehberidir.'
    },
    {
      id: 'haci-bayram-veli',
      name: 'Hacı Bayram-ı Velî',
      title: 'Ankara’nın Manevî Mîmârı, İmece ve Emek Önderi',
      era: 'XIV–XV. Yüzyıl (1352–1430)',
      provinceKey: '04_IcAnadolu/Ankara',
      relatedKeys: ['04_IcAnadolu/Aksaray', '05_Karadeniz/Bolu'],
      theme: 'Ahîlik & Ahlâk',
      concepts: ['Emek & İmece', 'Nefsini Bilmek', 'Gönül Şehri', 'Bayramiyye', 'Dayanışma'],
      coreTeaching:
        'Müritlerine hem toprağı ekip biçmeyi hem de kalbi imar etmeyi öğütleyen Hacı Bayram-ı Velî, çalışmayı ve toplumsal paylaşımı tasavvufun tam merkezine yerleştirmiştir.',
      quote: 'Noldu bu gönlüm, noldu bu gönlüm; kendini bilmekle buldu bu gönlüm.',
      nomadWisdom:
        'Uzaktan çalışan bir seyyah için "dünya işi ile içsel dinginliği" ayırmamak gerekir: Kütüphanede üretilen kod da, akşamüstü paylaşılan sıcak bir çay da aynı şuurla yapıldığında ibadete ve huzura dönüşür.'
    },
    {
      id: 'haci-bektas-veli',
      name: 'Hacı Bektaş-ı Velî',
      title: 'İlimden Gidilmeyen Yolun Karanlık Olduğunu Öğreten Horasan Ereni',
      era: 'XIII. Yüzyıl (1209–1271)',
      provinceKey: '04_IcAnadolu/Nevsehir',
      relatedKeys: ['04_IcAnadolu/Kirsehir'],
      theme: 'Tasavvuf & İrfan',
      concepts: ['Eline Beline Diline', 'İlim Yolu', 'Yetmiş İki Millet', 'Makâlât', 'Hoşgörü'],
      coreTeaching:
        '"Eline, beline, diline sahip ol" ve "Yetmiş iki millete bir nazarla bak" ilkeleriyle Anadolu’da aklın, bilimin ve koşulsuz insan sevgisinin ortak dilini kurmuştur.',
      quote: 'Hararet nardadır, sacda değildir; keramet baştadır, tacda değildir.',
      nomadWisdom:
        'Farklı coğrafya ve kültürlere ayak basan dijital göçebe için Hacı Bektaş-ı Velî’nin "incinsen de incitme" ilkesi, önyargısız gözlem yapmanın ve her şehirden bilgelik devşirmenin anahtarıdır.'
    },
    {
      id: 'seyh-edebali',
      name: 'Şeyh Edebali',
      title: 'İnsanı Yaşat ki Devlet Yaşasın Dünyasının Kurucu Bilgesi',
      era: 'XIII–XIV. Yüzyıl (1206–1326)',
      provinceKey: '01_Marmara/Bilecik',
      relatedKeys: ['04_IcAnadolu/Eskisehir', '04_IcAnadolu/Karaman'],
      theme: 'Ahîlik & Ahlâk',
      concepts: ['İnsanı Yaşat', 'Sabır', 'Adalet', 'Öfke Kontrolü', 'Devlet Ahlâkı'],
      coreTeaching:
        'Osman Gazi’ye yaptığı tarihî nasihatte gücü öfkeye değil sabra, merhamete ve tevazuya bağlar; her medeniyetin temel ölçüsünün insan onuru olduğunu vurgular.',
      quote: 'Ey oğul! Bundan sonra öfke bize, uysallık sana; insanı yaşat ki devlet yaşasın.',
      nomadWisdom:
        'Yolda aksayan planlar, geciken otobüsler ve belirsizlikler karşısında Edebali’nin "öfkeyi yutup sabrı kuşanma" disiplini, seyahat yorgunluğunu olgun bir soğukkanlılığa dönüştürür.'
    },
    {
      id: 'muhyiddin-ibnul-arabi',
      name: 'Muhyiddin İbnü’l-Arabî',
      title: 'Şeyh-i Ekber ve Varlığın Birliği Tefekkürünün Üstadı',
      era: 'XII–XIII. Yüzyıl (1165–1240)',
      provinceKey: '06_DoguAnadolu/Malatya',
      relatedKeys: ['04_IcAnadolu/Konya', '04_IcAnadolu/Kayseri'],
      theme: 'Felsefe & İlim',
      concepts: ['Vahdet-i Vücûd', 'Fütûhât-ı Mekkiyye', 'Âlem Kitabı', 'Hayret', 'Nazar'],
      coreTeaching:
        'Endülüs’ten Anadolu’ya (Malatya ve Konya’ya) taşıdığı derin metafizik düşünceyle kâinatı okunmayı bekleyen büyük bir kitap, her varlığı ise hakikatin bir yansıması olarak yorumlar.',
      quote: 'Kalbim her sûreti kabul eder oldu; ceylanlara otlak, rahiplere manastır, âşıklara Kâbe...',
      nomadWisdom:
        'İbnü’l-Arabî’nin "sefer" kavramı yalnızca coğrafî bir yer değiştirme değil, zihnin alışkanlıklardan sıyrılıp "hayret" makamına ulaşmasıdır; yeni bir şehirde sıradan bir sokağa hayretle bakabilmek içsel uyanıştır.'
    },
    {
      id: 'somuncu-baba',
      name: 'Somuncu Baba (Şeyh Hâmid-i Velî)',
      title: 'Somun Dağıtan Tevazu ve Gizli İrfan Sultânı',
      era: 'XIV–XV. Yüzyıl (1331–1412)',
      provinceKey: '04_IcAnadolu/Aksaray',
      relatedKeys: ['01_Marmara/Bursa', '06_DoguAnadolu/Malatya'],
      theme: 'Ahîlik & Ahlâk',
      concepts: ['Helal Lokma', 'Tevazu', 'Şöhretten Kaçış', 'Bursa Ulu Cami', 'Darende'],
      coreTeaching:
        'Büyük âlimliğini ekmek fırınının sıcağında gizleyen Somuncu Baba, sırrı açığa çıkınca şöhretten kaçıp Anadolu’nun mütevazı şehirlerine çekilerek alçakgönüllülüğün abide örneğini vermiştir.',
      quote: 'Mümin, ekmek gibi aziz ve her sofraya şifa olmalıdır; gösterişten uzak, halis ve sade.',
      nomadWisdom:
        'Sosyal medya ve görünürlük çağında Somuncu Baba, "kalabalıklar alkışlarken sessizliğe ve üretkenliğe çekilebilmenin", derinleşmek için görünürlükten vazgeçebilmenin bilgesidir.'
    },
    {
      id: 'aziz-mahmud-hudayi',
      name: 'Aziz Mahmud Hüdâyî',
      title: 'Kadı Cübbesini Çıkarıp Ciğer Satan Üsküdar Velîsi',
      era: 'XVI–XVII. Yüzyıl (1541–1628)',
      provinceKey: '01_Marmara/Istanbul',
      relatedKeys: ['01_Marmara/Bursa', '04_IcAnadolu/Ankara'],
      theme: 'Tasavvuf & İrfan',
      concepts: ['Ego Terbiyesi', 'Celvetiyye', 'Hüdayî Yolu', 'Üsküdar', 'Güzel Son'],
      coreTeaching:
        'Bursa kadılığı gibi yüksek bir makamdan vazgeçip mürşidi Üftade’nin işaretiyle sokaklarda ciğer satarak nefsin kibrini kıran Hüdâyî, statüden arınmanın özgürlüğünü temsil eder.',
      quote: 'Kuru bir dala bile tutunsan, ihlas ile tutun ki yeşersin; kibrini kapıda bırak.',
      nomadWisdom:
        'Unvanların ve dijital kartvizitlerin ardına saklanmadan yeni ortamlara sıfırdan uyum sağlayabilen modern seyyah, Hüdâyî’nin ego terbiyesinden büyük bir psikolojik esneklik öğrenir.'
    },
    {
      id: 'emir-sultan',
      name: 'Emir Sultan (Şemseddin Muhammed Buhârî)',
      title: 'Buhara’dan Yeşil Bursa’ya Uzanan Gönül Köprüsü',
      era: 'XIV–XV. Yüzyıl (1368–1429)',
      provinceKey: '01_Marmara/Bursa',
      relatedKeys: ['01_Marmara/Istanbul'],
      theme: 'Tasavvuf & İrfan',
      concepts: ['Şehir Muhafızı', 'Buhara-Bursa Hattı', 'Manevî Himmet', 'Vakar', 'Sükûnet'],
      coreTeaching:
        'Orta Asya’dan Anadolu’ya uzanan maneviyat akışının en zarif halkalarından biri olarak Bursa’nın kuruluş ruhunu şefkat, zarafet ve devlet adamlarıyla kurduğu yapıcı öğütle beslemiştir.',
      quote: 'Şehirler taşla değil, içinde yaşayan temiz gönüllerin duası ve adaletiyle ayakta kalır.',
      nomadWisdom:
        'Bir şehri sadece haritadan ve kafelerden ibaret görmeyip onun tarihî ruhuyla bağ kurmak; Emir Sultan’ın Bursa’sında olduğu gibi, bulunduğun yere geçici de olsa saygı ve zarafet katmaktır.'
    },
    {
      id: 'aksemseddin',
      name: 'Akşemseddin',
      title: 'Fethin Manevî Mîmârı, Hekim ve Mikroskobun Öncüsü',
      era: 'XV. Yüzyıl (1389–1459)',
      provinceKey: '05_Karadeniz/Bolu',
      relatedKeys: ['04_IcAnadolu/Ankara', '01_Marmara/Istanbul'],
      theme: 'Felsefe & İlim',
      concepts: ['Maddetü’l-Hayât', 'Mikroorganizma Öngörüsü', 'Göynük', 'İlim & İrfan', 'Fetih Şuuru'],
      coreTeaching:
        'Tıpta bulaşıcı hastalıkların gözle görülmeyen "tohumlarla" yayıldığını yüzyıllar önce tespit eden bilgin olduğu kadar, Fatih Sultan Mehmed’e rehberlik eden derin bir mutasavvıftır.',
      quote: 'Hastalıkların göze görünmeyen canlı tohumları vardır; ilimle hikmet birbirinin iki kanadıdır.',
      nomadWisdom:
        'Analitik zihin (bilim, yazılım, mühendislik) ile sezgisel derinliği (irfan, sanat) aynı potada eriten Akşemseddin, modern bilgi işçisi seyyahın Göynük sükûnetindeki en parlak rol modelidir.'
    },
    {
      id: 'veysel-karani',
      name: 'Veysel Karânî',
      title: 'Görmeden Sevmenin ve Sessiz Vefânın Üveysî Sembolü',
      era: 'VII. Yüzyıl (Anadolu Makam Geleneği)',
      provinceKey: '07_GuneydoguAnadolu/Siirt',
      relatedKeys: ['01_Marmara/Istanbul'],
      theme: 'Tasavvuf & İrfan',
      concepts: ['Üveysîlik', 'Anne Duası', 'Sessiz Sadakat', 'Zühd', 'Mekân Ötesi Bağ'],
      coreTeaching:
        'Fiziken hiç karşılaşmadan gönül bağı kurabilmenin (Üveysîlik) ve anne hizmetine gösterilen eşsiz vefânın sembolüdür; Anadolu’da Siirt Baykan’daki makamı derin bir hürmet durağıdır.',
      quote: 'Uzaklık tenlerin işidir; gönül bir kez bağlandı mı mesafe aradan çekilir.',
      nomadWisdom:
        'Sevdiklerinden uzakta çalışan dijital göçebeler için Veysel Karânî, fiziksel mesafelere rağmen köklere, aileye ve kalpten bağlı değerlere sadık kalabilmenin sessiz tesellisidir.'
    },
    {
      id: 'erzurumlu-ibrahim-hakki',
      name: 'Erzurumlu İbrahîm Hakkı',
      title: 'Marifetnâme’nin Astronom, Psikolog ve Mütefekkir Âlimi',
      era: 'XVIII. Yüzyıl (1703–1780)',
      provinceKey: '06_DoguAnadolu/Erzurum',
      relatedKeys: ['07_GuneydoguAnadolu/Siirt'],
      theme: 'Felsefe & İlim',
      concepts: ['Marifetnâme', 'Tefvîznâme', 'Astronomi & Tıp', 'Işık Hadisesi', 'Psikoloji'],
      coreTeaching:
        'Tillo’da kurduğu ışık düzeneğinden gökyüzünü, Marifetnâme’de ise insan anatomisi ve ruh hâllerini inceleyen büyük ansiklopedist; "Hak şerleri hayr eyler" dizeleriyle tevekkülü ölümsüzleştirmiştir.',
      quote: 'Hak şerleri hayr eyler, zannetme ki gayr eyler; ârif anı seyr eyler, Mevlâ görelim neyler.',
      nomadWisdom:
        'Bilimsel merakı (gözlem, veri, düzenek) sarsılmaz bir ruhsal sükûnetle birleştiren İbrahîm Hakkı, plansız sürprizler yaşayan her seyyaha olaylara panikle değil "seyr" bilinciyle bakmayı öğretir.'
    },
    {
      id: 'niyazi-i-misri',
      name: 'Niyâzî-i Mısrî',
      title: 'Dermanı Derdin İçinde Bulan Lirik Mutasavvıf Şair',
      era: 'XVII. Yüzyıl (1618–1694)',
      provinceKey: '06_DoguAnadolu/Malatya',
      relatedKeys: ['01_Marmara/Bursa', '02_Ege/Usak'],
      theme: 'Şiir & Hikmet',
      concepts: ['Dermân Arardım Derdime', 'Sürgün & Sabır', 'Halvetiyye', 'Vahdet', 'İçsel Keşif'],
      coreTeaching:
        'Malatya’dan Mısır’a, Bursa’dan Limni sürgünlerine uzanan çileli ömründe tüm zorlukları insanın kendini tanıması için birer ayna bilmiş; "Derman arardım derdime, derdim bana derman imiş" demiştir.',
      quote: 'Derman arardım derdime, derdim bana derman imiş; burhan arardım aslıma, aslım bana burhan imiş.',
      nomadWisdom:
        'Yolda yalnızlık veya yorgunluk hissettiğin anlarda Niyâzî-i Mısrî, dışarıda çözüm aramayı bırakıp o boşluğun içinde gizlenen içsel gücü ve yaratıcı ilhamı keşfetmeni fısıldar.'
    },
    {
      id: 'seyh-saban-i-veli',
      name: 'Şeyh Şâbân-ı Velî',
      title: 'Kastamonu’nun Gönül Pîri ve Şabâniyye Mektebinin Kurucusu',
      era: 'XVI. Yüzyıl (1499–1569)',
      provinceKey: '05_Karadeniz/Kastamonu',
      relatedKeys: ['05_Karadeniz/Bolu'],
      theme: 'Tasavvuf & İrfan',
      concepts: ['Gelişiniz Güle Güle', 'Halvet', 'Asa Suyu', 'Edep', 'Kastamonu İrfanı'],
      coreTeaching:
        'İnsanlara daima güler yüz ve tatlı dille yaklaşmayı esas alan Şeyh Şâbân-ı Velî’nin dergâh kapısındaki "Gelişiniz güle güle, gidişiniz güle güle, her işiniz güle güle" sözü Anadolu zarafetinin özetidir.',
      quote: 'Gelişiniz güle güle, gidişiniz güle güle, her işiniz güle güle olsun.',
      nomadWisdom:
        'Her yeni şehre varışında ve her vedada kalbi kırmadan, tebessümle iz bırakmayı öğütleyen bu düstur, kısa süreli 5 günlük şehir konaklamalarını sıcak bir insanlık ritüeline çevirir.'
    },
    {
      id: 'ahi-evran',
      name: 'Ahî Evran (Nâsırüddin Mahmud)',
      title: 'Anadolu Esnaf Ahlâkının, Kalitenin ve Ahîliğin Pîri',
      era: 'XII–XIII. Yüzyıl (1171–1261)',
      provinceKey: '04_IcAnadolu/Kirsehir',
      relatedKeys: ['04_IcAnadolu/Kayseri', '04_IcAnadolu/Konya'],
      theme: 'Ahîlik & Ahlâk',
      concepts: ['Elini Açık Tut', 'Üretim Ahlâkı', 'Meslek Onuru', 'Bacıyân-ı Rûm', 'Kırşehir'],
      coreTeaching:
        'Üretimi, zanaat kalitesini ve ticaret dürüstlüğünü kardeşlik ahlâkıyla birleştiren Ahîlik teşkilatını kurmuş; eşi Fatma Bacı ile Bacıyân-ı Rûm’a da ilham vermiştir.',
      quote: 'Ahînin eli, kapısı ve sofrası açık; gözü, beli ve dili bağlı olmalıdır.',
      nomadWisdom:
        'Serbest çalışan yazılımcı, tasarımcı veya yazar için Ahî Evran; uzaktan bile olsa işini en temiz ustalıkla teslim etmenin, dijital meslek etiğinin ve paylaşımcı topluluk kültürünün pîridir.'
    },
    {
      id: 'sadreddin-konevi',
      name: 'Sadreddin Konevî',
      title: 'İslam Düşüncesini Sistematik Felsefe İle Buluşturan Konya Âlimi',
      era: 'XIII. Yüzyıl (1207–1274)',
      provinceKey: '04_IcAnadolu/Konya',
      relatedKeys: ['06_DoguAnadolu/Malatya'],
      theme: 'Felsefe & İlim',
      concepts: ['Aklî & Kalbî Sentez', 'Hadis & Tasavvuf', 'Konevî Kütüphanesi', 'Nazari İrfan'],
      coreTeaching:
        'Mevlânâ’nın yakın dostu ve İbnü’l-Arabî’nin manevi varisi olarak tasavvufu mantık, felsefe ve hadis ilmiyle sistemleştirmiş; Konya’da asırlarca yaşayan bir kütüphane geleneği bırakmıştır.',
      quote: 'Akıl yolu ile kalp gözü birbirini inkâr etmez; kâmil insan ikisini bir ahenkte toplar.',
      nomadWisdom:
        'Şehir kütüphanelerinde saatlerce sistematik okuma ve kodlama yapan modern seyyah için Konevî, disiplinli entelektüel emeğin ruhsal incelikle nasıl bir arada yeşerdiğinin canlı kanıtıdır.'
    },
    {
      id: 'esrefoglu-rumi',
      name: 'Eşrefoğlu Rûmî',
      title: 'İznik’in Sakin Göl Kıyısından Yükselen İlâhîler Şairi',
      era: 'XV. Yüzyıl (1353–1469)',
      provinceKey: '01_Marmara/Bursa',
      relatedKeys: ['04_IcAnadolu/Ankara'],
      theme: 'Şiir & Hikmet',
      concepts: ['Müzekki’n-Nüfûs', 'İznik', 'Kadirî-Eşrefî', 'Nefis Muhasebesi', 'Sükûnet'],
      coreTeaching:
        'Hacı Bayram-ı Velî’nin damadı ve Kadirî-Eşrefî yolunun kurucusu olarak kaleme aldığı *Müzekki’n-Nüfûs* ve ilâhîleriyle, sade Türkçe üzerinden kalp temizliği ve iç gözlem rehberliği sunmuştur.',
      quote: 'Cihan bağında ey âşık, budur maksûd-ı bî-hemtâ: Gönül aynasını her gün sükût ile cilâlamak.',
      nomadWisdom:
        'Gürültülü turistik merkezler yerine İznik gibi göl kıyısı sakin kasabalarda durup günlük tutmak, Eşrefoğlu Rûmî’nin "nefsi dinlendirme ve zihni berraklaştırma" çağrısının günümüzdeki karşılığıdır.'
    },
    {
      id: 'abdulkadir-geylani-izleri',
      name: 'Abdülkâdir Geylânî İzleri (Kadirî İrfanı)',
      title: 'Anadolu Dergâhlarında Fütüvvet ve Doğruluk Çizgisi',
      era: 'XII. Yüzyıl Kökleri / Anadolu Mirası',
      provinceKey: '05_Karadeniz/Samsun',
      relatedKeys: ['07_GuneydoguAnadolu/Siirt', '01_Marmara/Bursa'],
      theme: 'Tasavvuf & İrfan',
      concepts: ['Fütüvvet', 'Doğruluk', 'Kadirîlik', 'Gönül Cömertliği', 'Tevekkül'],
      coreTeaching:
        'Anadolu’nun dört bir yanındaki Kadirî tekkeleri aracılığıyla "korkusuz doğruluk, cömert el ve Allah’a güven" ahlâkını Karadeniz’den Güneydoğu’ya taşımış köklü irfan geleneğidir.',
      quote: 'Doğruluktan ayrılma; çünkü doğruluk seni daima emniyete ve iç huzura çıkarır.',
      nomadWisdom:
        'Bilmediğin şehirlerde yürürken insanın en sağlam pusulası iç dürüstlüğü ve açık niyetidir; Kadirî irfanı, kaygı yerine güven ve cömertlik duygusuyla yola devam etme cesareti verir.'
    },
    {
      id: 'ebu-eyyub-el-ensari',
      name: 'Hz. Ebû Eyyûb el-Ensârî',
      title: 'Misafirperverliğin ve İstanbul’un Manevî Mihmandarlığının Sembolü',
      era: 'VII. Yüzyıl (576–674)',
      provinceKey: '01_Marmara/Istanbul',
      relatedKeys: ['01_Marmara/Edirne'],
      theme: 'Ahîlik & Ahlâk',
      concepts: ['Mihmandarlık', 'Misafirperverlik', 'Vefa', 'Eyüpsultan', 'Sabah Huzuru'],
      coreTeaching:
        'Medine’de Peygamber’e evini açan büyük misafirperverliğiyle tanınan ve ileri yaşında İstanbul surları önünde ebediyete yürüyen Ebû Eyyûb el-Ensârî, Anadolu’nun konukseverlik ruhunun temel taşıdır.',
      quote: 'Gerçek mihmandar, kapısını çalan yolcuya sadece yer değil, gönlünde emniyet açandır.',
      nomadWisdom:
        'Seyahat, iyi bir misafir olmayı öğrenmek kadar iyi bir ev sahibi (mihmandar) kalbi taşımaktır; İstanbul’da sabahın erken saatlerinde Haliç kıyısında yürümek bu kadim vefâyı hatırlatır.'
    },
    {
      id: 'mevlana-halid-bagdadi-izleri',
      name: 'Mevlânâ Hâlid-i Bağdâdî İzleri',
      title: 'Doğu ve Güneydoğu Anadolu’nun İlim-İrfan Medreselerini Besleyen Hâlidî Ekolü',
      era: 'XVIII–XIX. Yüzyıl (1779–1827)',
      provinceKey: '06_DoguAnadolu/Hakkari',
      relatedKeys: ['06_DoguAnadolu/Erzincan', '07_GuneydoguAnadolu/Siirt'],
      theme: 'Tasavvuf & İrfan',
      concepts: ['Hâlidîlik', 'Medrese & Dergâh Birliği', 'Sohbet', 'Rabıta-i Kalp', 'Şark İrfanı'],
      coreTeaching:
        'Doğu Anadolu’daki yüzlerce medrese ve âlim (Hakkâri, Van, Bitlis, Erzincan Terzi Baba hattı) üzerinden şer’î ilim ile kalbî derinliği aynı çatı altında buluşturan güçlü bir irfan hareketidir.',
      quote: 'İlmin ışığı olmadan yürüyen yolunu şaşırır; sohbetin sıcaklığı olmadan ilim kurur.',
      nomadWisdom:
        'Yalnızca ekran başından bilgi tüketmek yerine gerçek insanlarla yüz yüze sohbet etmenin, Doğu Anadolu’nun yüksek dağları arasındaki samimi çay meclislerinde bilgelik paylaşmanın değerini anımsatır.'
    },
    {
      id: 'dede-korkut',
      name: 'Dede Korkut',
      title: 'Oğuz Boylarının Bilge Ozanı, Kopuzu ve Sözlü Hafızası',
      era: 'X–XV. Yüzyıl (Sözlü Destan Çağı)',
      provinceKey: '05_Karadeniz/Bayburt',
      relatedKeys: ['06_DoguAnadolu/Erzurum', '06_DoguAnadolu/Kars'],
      theme: 'Şiir & Hikmet',
      concepts: ['Kopuz', 'Ad Verme', 'Yom Verme', 'Bozkır Ahlâkı', 'Hikâye Anlatıcılığı'],
      coreTeaching:
        'Bayburt’taki türbe geleneğiyle Anadolu’da yaşayan Dede Korkut; erdemi, cesareti, doğaya saygıyı ve topluluk bilincini kopuz eşliğinde anlatılan destansı hikâyelerle kuşaktan kuşağa aktarmıştır.',
      quote: 'Gelimli gidimli dünya, son ucu ölümlü dünya; kara dağların yıkılmasın, gölgelice kaba ağacın kesilmesin!',
      nomadWisdom:
        'Her dijital seyyah aslında kendi çağının bir hikâye anlatıcısıdır; Dede Korkut, gezdiğin şehirlerden sadece fotoğraf değil, insanları iyileştiren ve birleştiren anlamlı hikâyeler toplamanı öğütler.'
    },
    {
      id: 'asik-veysel',
      name: 'Âşık Veysel (Şatıroğlu)',
      title: 'Kara Toprağa Sadık, Gönül Gözü Açık Cumhuriyet Ozanı',
      era: 'XIX–XX. Yüzyıl (1894–1973)',
      provinceKey: '04_IcAnadolu/Sivas',
      relatedKeys: ['04_IcAnadolu/Ankara', '02_Ege/Izmir'],
      theme: 'Şiir & Hikmet',
      concepts: ['Kara Toprak', 'Uzun İnce Bir Yol', 'Gönül Gözü', 'Tevazu', 'Saz & Söz'],
      coreTeaching:
        'Dünyaya iki gözle değil "gönül gözüyle" bakan Âşık Veysel, hayatı "iki kapılı bir handa gece gündüz yürünən uzun ince bir yol" olarak tarif ederek çağdaş Anadolu irfanını zirveye taşımıştır.',
      quote: 'Uzun ince bir yoldayım, gidiyorum gündüz gece; bilmiyorum ne hâldeyim, gidiyorum gündüz gece.',
      nomadWisdom:
        'Ekranlara bakmaktan yorulan modern gezgin için Veysel, doğayla ve "kara toprakla" yeniden temas kurmayı, yolculuğun hızından çok yürüyüşün ritmine ve samimiyetine odaklanmayı öğretir.'
    },
    {
      id: 'fuzuli-nesimi-izleri',
      name: 'Fuzûlî / Nesîmî İzleri',
      title: 'Türkmen Coğrafyasından Anadolu’ya Taşan Vecd ve Divan Şiiri Hikmeti',
      era: 'XIV–XVI. Yüzyıl',
      provinceKey: '03_Akdeniz/Hatay',
      relatedKeys: ['07_GuneydoguAnadolu/Gaziantep', '07_GuneydoguAnadolu/Diyarbakir'],
      theme: 'Şiir & Hikmet',
      concepts: ['Sığmazam', 'İlimsiz Şiir Temelsiz Duvar', 'Aşk-ı Hakikî', 'Türkmen Divanı', 'Harf & Anlam'],
      coreTeaching:
        'Nesîmî’nin "Bende sığar iki cihan, ben bu cihâna sığmazam" haykırışı ile Fuzûlî’nin "İlimsiz şiir temelsiz duvar gibidir" ölçüsü, Anadolu’nun güney hatlarında dilin ve aşkın en yüksek metafiziğini örmüştür.',
      quote: 'Bende sığar iki cihan, ben bu cihâna sığmazam; ilimsiz şiir temelsiz bir duvar gibidir.',
      nomadWisdom:
        'Coğrafyalar ve sınırlar içine sığmayan insan ruhunu hatırlatırken, estetik ve sanatın daima sağlam bir bilgi temeline yaslanması gerektiğini öğreten güçlü bir yazınsal disiplindir.'
    },
    {
      id: 'evliya-celebi',
      name: 'Evliya Çelebi',
      title: 'Şefaat Yerine Seyahat İsteyen Cihan Seyyahı',
      era: 'XVII. Yüzyıl (1611–1682)',
      provinceKey: '02_Ege/Kutahya',
      relatedKeys: ['01_Marmara/Istanbul', '01_Marmara/Bursa'],
      theme: 'Felsefe & İlim',
      concepts: ['Seyahatnâme', 'Gözlem & Not Alma', 'Kültürel Merak', 'Kütahya', 'Seyahat Ya Resulallah'],
      coreTeaching:
        'Kırk yılı aşkın süre üç kıtayı gezip 10 ciltlik *Seyahatnâme*’yi yazan Evliya Çelebi, gördüğü her şehrin suyundan havasına, kütüphanesinden mutfağına ve evliyasına kadar her detayı merakla kayda geçirmiştir.',
      quote: 'Şefaat yâ Resûlallah diyecekken dilim sürçtü: Seyahat yâ Resûlallah dedim!',
      nomadWisdom:
        'Dijital Seyyah projesinin gerçek atası Evliya Çelebi’dir: Gittiğin yeri tüketip geçmek değil, dikkatle gözlemleyip yazıya dökmek ve her şehrin hikâyesini gelecek kuşaklara armağan etmektir.'
    }
  ];

  // Rich offline philosophical essays tailored for the 24 masters (+ dynamic builder for all 81 provinces)
  const OFFLINE_ESSAY_EXTRAS = {
    'mevlana-celaleddin-rumi':
      'Konya’nın Kubbe-i Hadrâ sükûneti, sürekli hareket hâlindeki dijital zihne **"dur ve dinle"** çağrısı yapar. Mevlânâ’nın semâ metaforu gibi, bir ayağını her sabah kütüphane masasında üretime ve iç disipline sabitle; diğer ayağınla ise Anadolu’nun sokaklarını önyargısızca keşfet.',
    'yunus-emre':
      'Sarıcakaya ve Karaman bozkırlarının rüzgârından doğan Yunus dili, dijital gürültüyü susturur. Yolda karşılaştığın esnafa, yurt görevlisine veya kütüphane komşuna **"tanış olalım"** niyetiyle yaklaşmak, seyahati yalnız bir koordinat listesinden çıkarıp canlı bir insanlık şölenine dönüştürür.',
    'haci-bayram-veli':
      'Ankara’nın kalbinde Augustus Tapınağı ile yan yana duran Hacı Bayram Camii, tarihin farklı katmanlarının barış içinde yan yana nefes alabildiğini gösterir. Çalışmakla tefekkürü ayırma; sabah ürettiğin emeği akşamüstü şehrin sükûnetiyle taçlandır.',
    'haci-bektas-veli':
      'Nevşehir bozkırındaki külliyenin avlusunda insanın aklına şu soru düşer: "Yolda taşıdığım en ağır yük eşyam mı, yoksa önyargılarım mı?" Hacı Bektaş, **"incinsen de incitme"** diyerek dijital göçebenin zihinsel çantasını hafifletir.',
    'seyh-edebali':
      'Bilecik’in Söğüt sırtlarından yükselen bu bilgelik, küçük bir başlangıcın büyük bir medeniyete dönüşmesinin sırrını açıklar: Acele etmemek, öfkeyi ertelemek ve her gittiğin şehirde önce insan onurunu gözetmek.',
    'muhyiddin-ibnul-arabi':
      'Malatya ve Konya hatlarında yankılanan İbnü’l-Arabî düşüncesi, gördüğün her taş kemeri, her nehir kıvrımını okunmayı bekleyen bir harf olarak görür. Seyahatte gerçek yenilik başka ülkeler görmek değil, bildiğin sokaklara yeni bir gözle bakabilmektir.',
    'somuncu-baba':
      'Aksaray’dan Bursa’ya, oradan Darende’ye uzanan ayak izleri; kalabalıklar seni alkışlamaya başladığında bile sade bir ekmek fırını sıcaklığında kalabilmenin, gösterişsiz üretkenliğin manifestosudur.',
    'aziz-mahmud-hudayi':
      'Üsküdar yokuşlarında esen rüzgâr, unvanlardan soyunmanın verdiği eşsiz hafifliği fısıldar. Dijital göçebelik de bir yönüyle statü zırhlarını çıkarıp her şehre sıfırdan öğrenci tevazuyla girebilmektir.',
    'emir-sultan':
      'Yeşil Bursa’nın çınarları altında otururken zamanın telaşı yavaşlar. Emir Sultan geleneği, geçtiğin şehirlere sadece tüketici bir turist gibi değil, dua ve zarafet katan bir konuk gibi yaklaşmanı öğütler.',
    'aksemseddin':
      'Göynük’ün ahşap konakları arasında yetişen bu iki kanatlı bilgelik, hem mikroskobik bilimsel dikkati hem de kalbî derinliği taşır. Modern bir yazılımcı veya araştırmacı için Göynük, zihni dinlendiren en berrak ilham menzilidir.',
    'veysel-karani':
      'Siirt’in vadilerinden yükselen Üveysîlik sırrı, fiziksel mesafelerin kalp bağını koparamayacağını anlatır. Ailenden ve dostlarından kilometrelerce uzaktayken bile içsel bağını canlı tutabilmenin adıdır vefa.',
    'erzurumlu-ibrahim-hakki':
      'Erzurum’un sert kışında ve Tillo’nun yıldızlı gecelerinde kurulan ışık düzeneği, aklın merakı ile kalbin teslimiyetinin aynı potada eridiğini gösterir. Rotan değiştiğinde telaşlanma; *"Mevlâ görelim neyler"* diyerek ana odaklan.',
    'niyazi-i-misri':
      'Malatya’nın bereketli ovasından sürgün adalarına uzanan Niyâzî, seyahatte karşımıza çıkan beklenmedik yalnızlıkların aslında kendi iç sesimizi duyabilmek için açılmış birer kapı olduğunu hatırlatır.',
    'seyh-saban-i-veli':
      'Kastamonu’nun ahşap revaklı külliyesinden yayılan *"Gelişiniz güle güle"* selamı, bir şehre varırken de o şehirden ayrılırken de kalpte kırgınlık değil tebessüm bırakmanın zarafetidir.',
    'ahi-evran':
      'Kırşehir’de temeli atılan Ahîlik, modern "remote work" etiğinin yüzlerce yıl öncesindeki karşılığıdır: İşi sağlam yapmak, kazancını paylaşmak ve gittiğin her topluluğa güven vermek.',
    'sadreddin-konevi':
      'Konya’daki kütüphane geleneğinin kurucu sütunlarından Konevî, bilgiyi dağınık notlar yığını olmaktan çıkarıp tutarlı bir dünya görüşüne dönüştürmeyi öğretir.',
    'esrefoglu-rumi':
      'İznik Gölü’nün durgun sularına bakan Eşrefoğlu, zihnini sürekli bildirimlerle kirleten modern insana her akşam kısa bir sükût ve iç muhasebe molası önerir.',
    'abdulkadir-geylani-izleri':
      'Anadolu’nun dört bir yanındaki dergâhlarda yankılanan Kadirî doğruluğu, yabancı bir şehirde yolunu arayan seyyaha *"doğruluk en güvenli pusuladır"* güvencesini verir.',
    'ebu-eyyub-el-ensari':
      'Haliç’in sabah serinliğinde Eyüpsultan avlusunda durmak, misafirliğin ve ev sahipliğinin kutsal dengesini hatırlatır. İyi bir seyyah, konuk olduğu şehrin ritmine saygı duyan kişidir.',
    'mevlana-halid-bagdadi-izleri':
      'Hakkâri’den Erzincan’a uzanan Şark irfanı, bilginin tek başına ekranda soğumaması için yüz yüze sohbetin ve samimi bir çay halkasının vazgeçilmez olduğunu vurgular.',
    'dede-korkut':
      'Bayburt’un yüksek yaylalarından kopuz sesiyle ulaşan Dede Korkut hikâyeleri, her yolculuğun sonunda *"bu yoldan insanlığa anlatacak nasıl bir hikâye getirdim?"* sorusunu sordurur.',
    'asik-veysel':
      'Sivas Sivrialan’ın toprağından yükselen Veysel sazı, *"uzun ince bir yol"* metaforuyla hayatın hızını yavaşlatır; asıl görmenin gözle değil kalple mümkün olduğunu hatırlatır.',
    'fuzuli-nesimi-izleri':
      'Hatay’dan Diyarbakır’a uzanan derin şiir damarı, ilhamsız ve bilgisiz her yapının çabuk yıkılacağını; ancak ilimle beslenen hayalin çağları aşabileceğini haykırır.',
    'evliya-celebi':
      'Kütahya köklerinden dünya yollarına çıkan Evliya Çelebi, bugünün dijital seyyahına en net yöntemi bırakır: Gördüğünü küçümseme, merak et, yerel tatları ve insan hikâyelerini üşenmeden defterine kaydet.'
  };

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

  function resolveProvincesMap(ctx) {
    if (ctx && ctx.data && ctx.data.provinces) return ctx.data.provinces;
    if (typeof window !== 'undefined' && window.TRAVEL_DATA && window.TRAVEL_DATA.provinces) {
      return window.TRAVEL_DATA.provinces;
    }
    return {};
  }

  function cleanInlineMarkdown(text) {
    return String(text || '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .trim();
  }

  function parseSpiritualEntry(raw) {
    const str = String(raw || '').trim();
    const boldMatch = str.match(/^\*\*([^*]+)\*\*[:：]?\s*(.*)$/);
    if (boldMatch) {
      const name = boldMatch[1].replace(/[:：]\s*$/, '').trim();
      const desc = cleanInlineMarkdown(boldMatch[2] || '');
      return { name: name, desc: desc };
    }
    const colonIdx = str.indexOf(':');
    if (colonIdx > 2 && colonIdx < 80) {
      return {
        name: cleanInlineMarkdown(str.slice(0, colonIdx)),
        desc: cleanInlineMarkdown(str.slice(colonIdx + 1))
      };
    }
    return {
      name: cleanInlineMarkdown(str.slice(0, 64)),
      desc: cleanInlineMarkdown(str)
    };
  }

  function classifyTheme(name, desc, normFn) {
    const hay = normFn(name + ' ' + desc);
    if (/ahi|esnaf|ticaret|adalet|devlet|komutan|gazi|pasa|sultan|kahraman|mudafaa|lonca|kurucu|kadi|belediye/.test(hay)) {
      return 'Ahîlik & Ahlâk';
    }
    if (/sair|siir|ozan|asik|edebiyat|yazar|destan|divan|korkut|turku|roman|hikaye|gazel|beste|hattat|musiki/.test(hay)) {
      return 'Şiir & Hikmet';
    }
    if (/alim|filozof|felsefe|bilim|tip|matematik|astronomi|mimar|tarih|seyahatname|medrese|tefsir|hukuk|muhendis|kutuphane|hekim|harita/.test(hay)) {
      return 'Felsefe & İlim';
    }
    return 'Tasavvuf & İrfan';
  }

  function extractEraFromText(name, desc) {
    const combined = name + ' ' + desc;
    const parenYears = combined.match(/\(([^)]*(?:\d{3,4}|M\.Ö\.|yy|yüzyıl)[^)]*)\)/i);
    if (parenYears) return parenYears[1].trim();
    const centuryMatch = combined.match(/([IVX]+\.\s*yüzyıl|\d{1,2}\.\s*yüzyıl|M\.Ö\.\s*\d+(?:\.\s*yy)?)/i);
    if (centuryMatch) return centuryMatch[1].trim();
    return 'Anadolu İrfan Çağı';
  }

  function classifyCenturyBucket(eraStr, textStr) {
    const s = String(eraStr || '') + ' ' + String(textStr || '');
    if (/\b(XIX|XX|XVIII|18\.|19\.|20\.|17\d\d|18\d\d|19\d\d)\b/i.test(s)) return '18_20';
    if (/\b(XVI|XVII|16\.|17\.|15\d\d|16\d\d)\b/i.test(s)) return '16_17';
    if (/\b(XIV|XV|14\.|15\.|13\d\d|14\d\d)\b/i.test(s)) return '14_15';
    if (/\b(XIII|13\.|12\d\d)\b/i.test(s)) return '13';
    if (/\b(VII|VIII|IX|X|XI|XII|7\.|8\.|9\.|10\.|11\.|12\.|576|11\d\d)\b/i.test(s)) return 'early';
    return '13';
  }

  function classifySchool(item, normFn) {
    const id = item.id || '';
    if (id === 'mevlana-celaleddin-rumi' || id === 'muhyiddin-ibnul-arabi' || id === 'sadreddin-konevi') {
      return 'Mevlevî & Ekberî';
    }
    if (id === 'haci-bayram-veli' || id === 'aksemseddin' || id === 'somuncu-baba' || id === 'aziz-mahmud-hudayi' || id === 'niyazi-i-misri' || id === 'seyh-saban-i-veli' || id === 'emir-sultan') {
      return 'Bayramî & Halvetî';
    }
    if (id === 'haci-bektas-veli' || id === 'yunus-emre') {
      return 'Bektaşî & Horasan';
    }
    if (id === 'ahi-evran' || id === 'seyh-edebali' || id === 'ebu-eyyub-el-ensari') {
      return 'Ahîlik & Fütüvvet';
    }
    if (id === 'abdulkadir-geylani-izleri' || id === 'esrefoglu-rumi' || id === 'mevlana-halid-bagdadi-izleri' || id === 'veysel-karani') {
      return 'Kadirî & Hâlidî';
    }
    if (id === 'erzurumlu-ibrahim-hakki' || id === 'dede-korkut' || id === 'asik-veysel' || id === 'fuzuli-nesimi-izleri' || id === 'evliya-celebi') {
      return 'Ozan, Âlim & Seyyah';
    }
    const hay = normFn((item.name || '') + ' ' + (item.coreTeaching || '') + ' ' + (item.theme || ''));
    if (/mevlana|mevlevi|konevi|arabi|vahdet|sema|mesnevi/.test(hay)) return 'Mevlevî & Ekberî';
    if (/bayram|halvet|hudayi|celvet|saban|somuncu|aksemseddin/.test(hay)) return 'Bayramî & Halvetî';
    if (/bektas|horasan|yunus|abdal|dede|pir sultan/.test(hay)) return 'Bektaşî & Horasan';
    if (/ahi|futuvvet|edebali|esnaf|lonca|ensari|vakif/.test(hay)) return 'Ahîlik & Fütüvvet';
    if (/kadiri|geylani|halidi|naksibendi|uveysi|esref/.test(hay)) return 'Kadirî & Hâlidî';
    return 'Ozan, Âlim & Seyyah';
  }

  function buildOfflineWisdomDialogue(item, userQuestion, normFn) {
    const q = String(userQuestion || '').trim();
    const nq = normFn(q);
    const quote = item.quote || (item.literaryQuotes && item.literaryQuotes[0]) || 'Gönül, hakikatin tecelli ettiği en geniş menzildir.';
    const teaching = item.coreTeaching || (item.provinceName + ' şehrinin kadim irfan mirası.');
    const concepts = (item.concepts && item.concepts.length) ? item.concepts.slice(0, 4).join(', ') : item.theme;

    let specificLens = '';
    if (/yol|sefer|seyahat|goc|seyyah|uzak|gurbet/.test(nq)) {
      specificLens =
        '**Yol ve Sefer Nazarından:** ' + item.name + ' geleneğinde yolculuk, sadece bir şehirden diğerine varmak değil; nefsin alışkanlıklarından sıyrılıp **' + item.provinceName + '** ufkunda içsel dinginliğe ulaşmasıdır. ' +
        (item.nomadWisdom || 'Her yeni menzilde 5 gün sükûnetle konaklamak, gördüğün coğrafyayı tüketen değil ondan hikmet devşiren bir seyyah olmanı sağlar.');
    } else if (/sabr|zor|sikinti|huzur|kaygi|yorgun|dert|stres/.test(nq)) {
      specificLens =
        '**Sabır ve İçsel Sükûnet Nazarından:** Kalbin daraldığı ve yolun ağırlaştığı demlerde **' + item.name + '** bize şunu hatırlatır: Derman çoğu kez derdin içinde gizlidir. ' +
        '**' + concepts + '** ilkeleriyle nefesini yavaşlatıp, telaşı tevekküle ve disiplinli üretime dönüştürmek gönül aynasını parlatır.';
    } else if (/ilim|kitap|kutuphane|calis|emek|meslek|kod|uretim/.test(nq)) {
      specificLens =
        '**İlim, Emek ve Tefekkür Nazarından:** Anadolu irfanında el kârda, gönül yârda tutulur. **' + item.provinceName + '** İl Halk Kütüphanesi sükûnetinde okunan her satır ve üretilen her temiz eser, **' + item.name + '** öğretisinde kalbî bir ibadet hükmündedir.';
    } else {
      specificLens =
        '**Gönül Sultanının Hikmet Nazarından:** Sorduğun *"' + (q || 'Hakikat ve yol adabı nedir?') + '"* suali, **' + item.name + '** hazretlerinin **' + concepts + '** eksenindeki irfan halkasında şöyle yankılanır: ' +
        (item.nomadWisdom || OFFLINE_ESSAY_EXTRAS[item.id] || 'İnsan önce kendi iç şehrinin sokaklarını tevazu ve merhametle imar etmelidir.');
    }

    return [
      '### 🕯️ ' + item.name + ' Meclisinden Hikmetli Cevap',
      '*(Sualiniz: "' + (q || 'Bu makamın yolcuya nasihati nedir?') + '")*',
      '',
      '> *“' + quote.replace(/^["“]|["”]$/g, '') + '”*',
      '',
      '**1. Öğretinin Özü (' + item.provinceName + ' · ' + (item.era || 'Anadolu İrfanı') + '):**',
      teaching + (item.provinceDetail ? ' ' + item.provinceDetail : ''),
      '',
      '2. ' + specificLens,
      '',
      '**3. Seyyah İçin Günün Ameli:**',
      '- Bugün **' + item.provinceName + '** ruhunu yâd ederek zihnini dağıtan meşguliyetlerden 15 dakika halvete çekil ve **' + (item.concepts && item.concepts[0] ? item.concepts[0] : item.theme) + '** kavramını tefekkür et.'
    ].join('\n');
  }

  function isSameMasterFigure(master, parsedName, normFn) {
    const nMaster = normFn(master.name);
    const nParsed = normFn(parsedName);
    if (!nParsed) return false;

    const coreTokens = [
      { id: 'mevlana-celaleddin-rumi', tokens: ['mevlana'] },
      { id: 'yunus-emre', tokens: ['yunus emre'] },
      { id: 'haci-bayram-veli', tokens: ['haci bayram'] },
      { id: 'haci-bektas-veli', tokens: ['haci bektas'] },
      { id: 'seyh-edebali', tokens: ['edebali'] },
      { id: 'muhyiddin-ibnul-arabi', tokens: ['ibnul-arabi', 'ibn arabi', 'muhyiddin'] },
      { id: 'somuncu-baba', tokens: ['somuncu baba', 'hamid-i veli'] },
      { id: 'aziz-mahmud-hudayi', tokens: ['mahmud hudayi'] },
      { id: 'emir-sultan', tokens: ['emir sultan'] },
      { id: 'aksemseddin', tokens: ['aksemseddin'] },
      { id: 'veysel-karani', tokens: ['veysel karani'] },
      { id: 'erzurumlu-ibrahim-hakki', tokens: ['ibrahim hakki'] },
      { id: 'niyazi-i-misri', tokens: ['niyazi-i misri', 'niyazi misri'] },
      { id: 'seyh-saban-i-veli', tokens: ['saban-i veli'] },
      { id: 'ahi-evran', tokens: ['ahi evran'] },
      { id: 'sadreddin-konevi', tokens: ['konevi'] },
      { id: 'esrefoglu-rumi', tokens: ['esrefoglu'] },
      { id: 'abdulkadir-geylani-izleri', tokens: ['geylani'] },
      { id: 'ebu-eyyub-el-ensari', tokens: ['eyyub el-ensari', 'eyup sultan'] },
      { id: 'mevlana-halid-bagdadi-izleri', tokens: ['halid-i bagdadi', 'halidi'] },
      { id: 'dede-korkut', tokens: ['dede korkut'] },
      { id: 'asik-veysel', tokens: ['asik veysel'] },
      { id: 'fuzuli-nesimi-izleri', tokens: ['fuzuli', 'nesimi'] },
      { id: 'evliya-celebi', tokens: ['evliya celebi'] }
    ];

    for (let i = 0; i < coreTokens.length; i++) {
      if (coreTokens[i].id === master.id) {
        return coreTokens[i].tokens.some(function (tok) {
          return nParsed.indexOf(tok) !== -1;
        });
      }
    }
    return nParsed.indexOf(nMaster) !== -1 || nMaster.indexOf(nParsed) !== -1;
  }

  function buildCatalog(ctx, normFn) {
    const provincesMap = resolveProvincesMap(ctx);
    const entries = Object.entries(provincesMap);

    const masterRecords = [];
    const provinceRecords = [];
    const provinceReflections = [];
    const usedMasterProvinceLinks = new Set();

    // Index provinces and prepare reflection/quote aggregation
    entries.forEach(function (entry) {
      const key = entry[0];
      const p = entry[1] || {};
      const sfList = Array.isArray(p.spiritual_figures) ? p.spiritual_figures : [];
      const lqList = Array.isArray(p.literary_quotes) ? p.literary_quotes : [];
      const reflection = typeof p.reflection === 'string' ? p.reflection.trim() : '';

      provinceReflections.push({
        key: key,
        name: p.name || key,
        plate: p.plate || 0,
        region: p.region || '',
        regionCode: p.region_code || '',
        visited: Boolean(p.visited),
        reflection: reflection,
        literaryQuotes: lqList.map(cleanInlineMarkdown),
        spiritualFigures: sfList.map(parseSpiritualEntry),
        hasContent: Boolean(reflection || lqList.length > 0 || sfList.length > 0)
      });
    });

    // 1. Build the 24 Master Directory records enriched with live province data
    MASTER_FIGURES.forEach(function (m) {
      const p = provincesMap[m.provinceKey] || {};
      const sfList = Array.isArray(p.spiritual_figures) ? p.spiritual_figures : [];
      let matchedProvinceNote = '';

      for (let i = 0; i < sfList.length; i++) {
        const parsed = parseSpiritualEntry(sfList[i]);
        if (isSameMasterFigure(m, parsed.name, normFn)) {
          matchedProvinceNote = parsed.desc;
          usedMasterProvinceLinks.add(m.provinceKey + '::' + normFn(parsed.name));
          break;
        }
      }

      const lqList = Array.isArray(p.literary_quotes) ? p.literary_quotes.map(cleanInlineMarkdown) : [];
      const reflection = typeof p.reflection === 'string' ? cleanInlineMarkdown(p.reflection) : '';

      const recordObj = {
        id: m.id,
        isMaster: true,
        name: m.name,
        subtitle: m.title,
        era: m.era,
        centuryBucket: classifyCenturyBucket(m.era, m.coreTeaching),
        theme: m.theme,
        concepts: m.concepts.slice(),
        coreTeaching: m.coreTeaching,
        provinceDetail: matchedProvinceNote,
        quote: m.quote,
        nomadWisdom: m.nomadWisdom,
        provinceKey: m.provinceKey,
        provinceName: p.name || m.provinceKey.split('/').pop(),
        plate: p.plate || 0,
        region: p.region || '',
        regionCode: p.region_code || m.provinceKey.split('/')[0],
        visited: Boolean(p.visited),
        relatedKeys: (m.relatedKeys || []).filter(function (rk) { return Boolean(provincesMap[rk]); }),
        reflection: reflection,
        literaryQuotes: lqList
      };
      recordObj.school = classifySchool(recordObj, normFn);
      masterRecords.push(recordObj);
    });

    // 2. Aggregate all spiritual_figures from all 81 provinces
    let provIdx = 0;
    entries.forEach(function (entry) {
      const key = entry[0];
      const p = entry[1] || {};
      const sfList = Array.isArray(p.spiritual_figures) ? p.spiritual_figures : [];
      const lqList = Array.isArray(p.literary_quotes) ? p.literary_quotes.map(cleanInlineMarkdown) : [];
      const reflection = typeof p.reflection === 'string' ? cleanInlineMarkdown(p.reflection) : '';

      sfList.forEach(function (rawSf) {
        const parsed = parseSpiritualEntry(rawSf);
        if (!parsed.name) return;
        const linkKey = key + '::' + normFn(parsed.name);
        if (usedMasterProvinceLinks.has(linkKey)) return;

        provIdx += 1;
        const theme = classifyTheme(parsed.name, parsed.desc, normFn);
        const era = extractEraFromText(parsed.name, parsed.desc);

        const provRecord = {
          id: 'prov-sf-' + provIdx,
          isMaster: false,
          name: parsed.name,
          subtitle: (p.name || '') + ' Manevî & Kültürel Hafızası',
          era: era,
          centuryBucket: classifyCenturyBucket(era, parsed.desc),
          theme: theme,
          concepts: [p.name || '', p.region || '', theme].filter(Boolean),
          coreTeaching: parsed.desc || reflection || (p.name + ' şehrinin kadim irfan mirası.'),
          provinceDetail: '',
          quote: lqList[0] || '',
          nomadWisdom: '',
          provinceKey: key,
          provinceName: p.name || key,
          plate: p.plate || 0,
          region: p.region || '',
          regionCode: p.region_code || key.split('/')[0],
          visited: Boolean(p.visited),
          relatedKeys: [],
          reflection: reflection,
          literaryQuotes: lqList
        };
        provRecord.school = classifySchool(provRecord, normFn);
        provinceRecords.push(provRecord);
      });
    });

    provinceReflections.sort(function (a, b) {
      return (a.plate || 999) - (b.plate || 999);
    });

    return {
      masters: masterRecords,
      provincial: provinceRecords,
      allFigures: masterRecords.concat(provinceRecords),
      provinceReflections: provinceReflections,
      provincesMap: provincesMap
    };
  }

  function buildAiPrompt(item) {
    const contextParts = [
      'Şahsiyet / Makam: ' + item.name,
      'Dönem: ' + (item.era || 'Anadolu İrfan Çağı'),
      'Şehir & Bölge: ' + item.provinceName + ' (' + item.region + ')',
      'Ana Tema: ' + item.theme,
      'Öz Öğreti: ' + item.coreTeaching
    ];
    if (item.provinceDetail) {
      contextParts.push('Şehir Envanter Notu: ' + item.provinceDetail);
    }
    if (item.reflection) {
      contextParts.push('Seyahatname Şehir Tefekkürü: ' + item.reflection);
    }
    if (item.literaryQuotes && item.literaryQuotes.length) {
      contextParts.push('Edebî Alıntı: ' + item.literaryQuotes[0]);
    }

    return [
      'Aşağıdaki Anadolu irfan büyüğünün veya şehrinin hikmetini günümüz seyyahı için tefekkür et:',
      contextParts.join('\n'),
      '',
      'Yanıtını Türkçe, akıcı, edebi ama uygulanabilir bir dille şu 3 net başlık altında yaz:',
      '## 1. Kadim Hikmetin Özü',
      'Bu ismin Anadolu irfan coğrafyasındaki temel mesajını ve şehriyle kurduğu manevî bağı derinleştir.',
      '## 2. Modern Seyahat & Dijital Göçebelik İçin Dersler',
      'Sırt çantası, kütüphane ofisleri, yavaş seyahat (5 gün kuralı), odaklanma ve tüketmeden keşfetme kültürüyle somut bağlar kur.',
      '## 3. İçsel Huzur & Yolculuk Tefekkür Pratiği',
      'Seyyahın o şehre ayak bastığında veya günlük dijital koşturmaca içinde uygulayabileceği 3 somut, sakinleştirici pratik öner.'
    ].join('\n');
  }

  function buildOfflineEssay(item) {
    const customExtra = OFFLINE_ESSAY_EXTRAS[item.id];
    const quoteLine = item.quote || (item.literaryQuotes && item.literaryQuotes[0]) || '';
    const refSnippet = item.reflection
      ? '\n\n**' + item.provinceName + ' Seyahatname Notu:** ' + item.reflection
      : '';

    const nomadSection = customExtra || item.nomadWisdom ||
      (item.provinceName + ' merkezli bu kadim hatıra, sürekli bildirim ve hız üreten dijital dünyada **yavaşlamayı, yerel hafızaya saygı duymayı ve kütüphane sükûnetinde derinleşmeyi** hatırlatır. Bir şehri sadece fotoğraf karelerine sığdırmak yerine, 5 günlük konaklama ritmiyle o coğrafyanın insanını, mimarisini ve ruhunu sindirmek modern göçebeliği gerçek bir keşfe dönüştürür.');

    const lines = [
      '## 1. Kadim Hikmetin Özü',
      '**' + item.name + '** (' + (item.era || 'Anadolu İrfanı') + '), **' + item.provinceName + '** (' + (item.region || 'Anadolu') + ') coğrafyasının **' + item.theme + '** damarını besleyen köklü bir duraktır.',
      '',
      item.coreTeaching + (item.provinceDetail && item.provinceDetail !== item.coreTeaching ? ' ' + item.provinceDetail : ''),
      quoteLine ? '\n> *"' + quoteLine.replace(/^["“]|["”]$/g, '') + '"*' : '',
      refSnippet,
      '',
      '## 2. Modern Seyahat & Dijital Göçebelik İçin Dersler',
      nomadSection,
      '',
      '## 3. İçsel Huzur & Yolculuk Tefekkür Pratiği',
      '1. **Sabah Kök Salma Ritüeli:** ' + item.provinceName + ' İl Halk Kütüphanesi veya sessiz bir tarihî avluda ekranı açmadan önce 5 dakika yalnızca nefesine ve mekânın sükûnetine odaklan.',
      '2. **Hafif Çanta, Derin Bakış:** Tüketim odaklı turistik aceleyi bırak; günde tek bir tarihî durağı sindirerek yürü ve akşam günlüğüne o gün öğrendiğin bir cümleyi not düş.',
      '3. **Gönül Köprüsü Kurma:** Şehrin bir esnafıyla ya da yerel sakiniyle samimi bir selamlaşma ve çay sohbeti kur; Anadolu irfanında yol, ancak insanla paylaşıldığında anlam kazanır.'
    ];

    return lines.filter(Boolean).join('\n');
  }

  function renderSafeMarkdown(md, escapeFn) {
    if (typeof window !== 'undefined' && window.SEYYAH_AI && typeof window.SEYYAH_AI.renderMarkdown === 'function') {
      return window.SEYYAH_AI.renderMarkdown(md, escapeFn);
    }
    const esc = typeof escapeFn === 'function' ? escapeFn : fallbackEscapeHtml;
    return String(md || '')
      .split(/\n{2,}/)
      .map(function (block) {
        const trimmed = block.trim();
        if (!trimmed) return '';
        if (/^##\s+/.test(trimmed)) {
          return '<h3 class="seyyah-md-h2">' + esc(trimmed.replace(/^##\s+/, '')) + '</h3>';
        }
        if (/^>\s*/.test(trimmed)) {
          return '<blockquote class="seyyah-md-quote">' + esc(trimmed.replace(/^>\s*/gm, '')) + '</blockquote>';
        }
        return '<p class="seyyah-md-p">' + esc(trimmed).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') + '</p>';
      })
      .join('\n');
  }

  function injectStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .irfan-studio {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-bottom: 32px;
        color: var(--text-primary);
      }

      .irfan-hero {
        position: relative;
        overflow: hidden;
        padding: 26px 28px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 88% 15%, rgba(245, 158, 11, 0.2), transparent 46%),
          radial-gradient(circle at 12% 85%, rgba(16, 185, 129, 0.18), transparent 48%),
          linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.85));
        border: 1px solid rgba(245, 158, 11, 0.28);
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.45));
      }

      .irfan-hero-top {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
      }

      .irfan-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.13);
        border: 1px solid rgba(245, 158, 11, 0.3);
        padding: 5px 12px;
        border-radius: 999px;
        margin-bottom: 10px;
      }

      .irfan-hero h2 {
        font-family: var(--font-heading, sans-serif);
        font-size: clamp(1.35rem, 2.5vw, 1.9rem);
        font-weight: 800;
        line-height: 1.2;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #fef3c7 0%, #f59e0b 45%, #34d399 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .irfan-hero-sub {
        max-width: 760px;
        font-size: 0.92rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.6;
      }

      .irfan-stats-row {
        display: grid;
        grid-template-columns: repeat(4, minmax(120px, 1fr));
        gap: 10px;
        margin-top: 18px;
      }

      .irfan-stat-pill {
        background: rgba(15, 23, 42, 0.58);
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 12px;
        padding: 11px 14px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .irfan-stat-val {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .irfan-stat-lbl {
        font-size: 0.74rem;
        color: var(--text-secondary, #94a3b8);
      }

      .irfan-controls {
        background: var(--bg-card, rgba(30, 41, 59, 0.7));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: 16px;
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        backdrop-filter: blur(12px);
      }

      .irfan-view-tabs {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        padding-bottom: 12px;
      }

      .irfan-tab-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .irfan-tab-btn {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.45);
        color: var(--text-secondary, #94a3b8);
        padding: 8px 14px;
        border-radius: 999px;
        font-size: 0.82rem;
        font-weight: 600;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .irfan-tab-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(245, 158, 11, 0.45);
      }

      .irfan-tab-btn.active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(16, 185, 129, 0.18));
        border-color: var(--accent-gold, #f59e0b);
        color: var(--text-primary, #f8fafc);
        box-shadow: 0 0 16px rgba(245, 158, 11, 0.18);
      }

      .irfan-search-row {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 12px;
        align-items: center;
      }

      .irfan-search-box {
        position: relative;
        display: flex;
        align-items: center;
      }

      .irfan-search-icon {
        position: absolute;
        left: 13px;
        font-size: 0.95rem;
        opacity: 0.75;
        pointer-events: none;
      }

      .irfan-search-input {
        width: 100%;
        padding: 10px 36px 10px 38px;
        border-radius: 11px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary, #f8fafc);
        font-size: 0.88rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .irfan-search-input:focus {
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
      }

      .irfan-search-clear {
        position: absolute;
        right: 10px;
        border: none;
        background: transparent;
        color: var(--text-muted, #64748b);
        cursor: pointer;
        font-size: 0.9rem;
        padding: 2px 6px;
      }

      .irfan-scope-select {
        width: 100%;
        padding: 10px 12px;
        border-radius: 11px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary, #f8fafc);
        font-size: 0.85rem;
        font-weight: 600;
        outline: none;
        cursor: pointer;
      }

      .irfan-chip-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        align-items: center;
      }

      .irfan-chip-label {
        font-size: 0.74rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted, #64748b);
        margin-right: 4px;
      }

      .irfan-chip {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(15, 23, 42, 0.45);
        color: var(--text-secondary, #94a3b8);
        padding: 6px 11px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 600;
        transition: all 0.18s ease;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .irfan-chip:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(0, 242, 254, 0.4);
      }

      .irfan-chip.active {
        background: rgba(0, 242, 254, 0.16);
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
      }

      .irfan-chip.theme-active {
        background: rgba(168, 85, 247, 0.18);
        border-color: var(--accent-purple, #a855f7);
        color: var(--text-primary, #f8fafc);
      }

      .irfan-results-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
      }

      .irfan-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
        gap: 16px;
      }

      .irfan-card {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        padding: 18px;
        border-radius: 16px;
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .irfan-card:hover {
        transform: translateY(-3px);
        border-color: rgba(245, 158, 11, 0.45);
        box-shadow: 0 14px 30px -10px rgba(0, 0, 0, 0.45);
      }

      .irfan-card.is-master {
        border-color: rgba(245, 158, 11, 0.28);
        background:
          radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.08), transparent 45%),
          var(--bg-card, rgba(30, 41, 59, 0.78));
      }

      .irfan-card-head {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .irfan-badges-top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .irfan-theme-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid currentColor;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .irfan-master-pill {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.16);
        color: var(--accent-gold, #f59e0b);
        border: 1px solid rgba(245, 158, 11, 0.35);
      }

      .irfan-prov-pill {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.14);
        color: var(--text-secondary, #94a3b8);
        border: 1px solid rgba(148, 163, 184, 0.25);
      }

      .irfan-sage-name {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.12rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.3;
      }

      .irfan-sage-subtitle {
        font-size: 0.8rem;
        color: var(--accent-emerald, #10b981);
        font-weight: 600;
      }

      .irfan-meta-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .irfan-era-badge {
        font-size: 0.74rem;
        color: var(--text-secondary, #94a3b8);
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        padding: 4px 9px;
        border-radius: 8px;
      }

      .irfan-province-btn {
        cursor: pointer;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.32);
        padding: 4px 10px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.18s ease;
      }

      .irfan-province-btn:hover {
        background: rgba(0, 242, 254, 0.22);
        transform: translateY(-1px);
      }

      .irfan-visited-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--accent-emerald, #10b981);
        display: inline-block;
      }

      .irfan-teaching {
        font-size: 0.86rem;
        line-height: 1.62;
        color: var(--text-secondary, #cbd5e1);
      }

      .irfan-quote-box {
        font-size: 0.8rem;
        font-style: italic;
        color: var(--text-primary, #f8fafc);
        background: rgba(15, 23, 42, 0.45);
        border-left: 3px solid var(--accent-gold, #f59e0b);
        padding: 8px 11px;
        border-radius: 0 8px 8px 0;
        line-height: 1.5;
      }

      .irfan-concept-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .irfan-concept-tag {
        font-size: 0.7rem;
        color: var(--text-secondary, #94a3b8);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        padding: 2px 8px;
        border-radius: 6px;
      }

      .irfan-card-foot {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .irfan-ai-btn {
        width: 100%;
        cursor: pointer;
        border: 1px solid rgba(245, 158, 11, 0.45);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(168, 85, 247, 0.18));
        color: var(--text-primary, #f8fafc);
        padding: 10px 14px;
        border-radius: 11px;
        font-size: 0.82rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        transition: all 0.2s ease;
      }

      .irfan-ai-btn:hover {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(168, 85, 247, 0.28));
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.22);
      }

      .irfan-related-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        color: var(--text-muted, #64748b);
      }

      .irfan-related-link {
        cursor: pointer;
        background: transparent;
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.16));
        color: var(--text-secondary, #94a3b8);
        border-radius: 6px;
        padding: 2px 7px;
        font-size: 0.71rem;
      }

      .irfan-related-link:hover {
        color: var(--accent-cyan, #00f2fe);
        border-color: var(--accent-cyan, #00f2fe);
      }

      .irfan-reflections-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 16px;
      }

      .irfan-lq-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .irfan-lq-item {
        font-size: 0.79rem;
        color: var(--text-secondary, #cbd5e1);
        background: rgba(15, 23, 42, 0.42);
        border-left: 2px solid var(--accent-purple, #a855f7);
        padding: 6px 10px;
        border-radius: 0 7px 7px 0;
        line-height: 1.48;
      }

      .irfan-empty {
        text-align: center;
        padding: 46px 20px;
        border-radius: 16px;
        background: var(--bg-card, rgba(30, 41, 59, 0.5));
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.16));
        color: var(--text-secondary, #94a3b8);
      }

      /* AI Contemplation Modal / Drawer */
      .irfan-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(2, 6, 23, 0.76);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px;
      }

      .irfan-modal {
        width: min(820px, 100%);
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        border-radius: 20px;
        background: var(--bg-secondary, #0f172a);
        border: 1px solid rgba(245, 158, 11, 0.35);
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
        overflow: hidden;
      }

      .irfan-modal-header {
        padding: 18px 22px;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(16, 185, 129, 0.1));
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
      }

      .irfan-modal-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.2rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .irfan-modal-close {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.16));
        background: rgba(15, 23, 42, 0.5);
        color: var(--text-primary, #f8fafc);
        width: 34px;
        height: 34px;
        border-radius: 10px;
        font-size: 1rem;
        flex-shrink: 0;
      }

      .irfan-modal-body {
        padding: 20px 22px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .irfan-stream-status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.76rem;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.15);
        color: var(--accent-emerald, #10b981);
        border: 1px solid rgba(16, 185, 129, 0.35);
        align-self: flex-start;
      }

      .irfan-stream-status.offline {
        background: rgba(245, 158, 11, 0.14);
        color: var(--accent-gold, #f59e0b);
        border-color: rgba(245, 158, 11, 0.35);
      }

      .irfan-stream-box {
        font-size: 0.93rem;
        line-height: 1.72;
        color: var(--text-primary, #f8fafc);
      }

      .irfan-stream-box .seyyah-md-h2,
      .irfan-stream-box .seyyah-md-h3 {
        font-family: var(--font-heading, sans-serif);
        color: var(--accent-gold, #f59e0b);
        margin: 14px 0 6px;
        font-size: 1.05rem;
      }

      .irfan-stream-box .seyyah-md-p {
        margin-bottom: 10px;
        color: var(--text-secondary, #cbd5e1);
      }

      .irfan-stream-box .seyyah-md-quote {
        border-left: 3px solid var(--accent-gold, #f59e0b);
        padding: 8px 12px;
        margin: 10px 0;
        background: rgba(245, 158, 11, 0.08);
        border-radius: 0 8px 8px 0;
        color: var(--text-primary, #f8fafc);
      }

      .irfan-stream-box .seyyah-md-list {
        padding-left: 20px;
        margin: 8px 0 12px;
        color: var(--text-secondary, #cbd5e1);
      }

      .irfan-stream-box .seyyah-md-list li {
        margin-bottom: 6px;
      }

      .irfan-modal-footer {
        padding: 12px 22px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      .irfan-action-btn {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.16));
        background: rgba(30, 41, 59, 0.7);
        color: var(--text-primary, #f8fafc);
        padding: 8px 13px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 600;
      }

      .irfan-action-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
      }

      /* Interactive SVG Constellation Map & Offline Dialogue Box */
      .irfan-constellation-box {
        background: var(--bg-card, rgba(15, 23, 42, 0.8));
        border: 1px solid rgba(245, 158, 11, 0.28);
        border-radius: 18px;
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .irfan-constellation-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .irfan-constellation-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .irfan-constellation-svg-wrap {
        width: 100%;
        border-radius: 14px;
        overflow: hidden;
        background: radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.08), rgba(7, 13, 27, 0.92));
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .irfan-constellation-svg {
        display: block;
        width: 100%;
        height: auto;
        max-height: 290px;
      }

      .irfan-c-node {
        cursor: pointer;
        transition: opacity 0.2s ease;
      }

      .irfan-c-node:hover circle {
        stroke-width: 3.2;
        filter: brightness(1.3);
      }

      .irfan-dialogue-box {
        margin-top: 10px;
        padding: 14px 16px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(0, 242, 254, 0.26);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .irfan-dialogue-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .irfan-dialogue-input {
        flex: 1;
        min-width: 220px;
        padding: 9px 12px;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.15));
        background: rgba(10, 15, 29, 0.8);
        color: var(--text-primary, #f8fafc);
        font-size: 0.85rem;
        outline: none;
      }

      .irfan-dialogue-input:focus {
        border-color: var(--accent-cyan, #00f2fe);
      }

      .irfan-dialogue-ask-btn {
        cursor: pointer;
        padding: 9px 15px;
        border-radius: 10px;
        border: 1px solid rgba(0, 242, 254, 0.45);
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(16, 185, 129, 0.22));
        color: var(--text-primary, #f8fafc);
        font-weight: 700;
        font-size: 0.82rem;
      }

      body.light-theme .irfan-constellation-box {
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(217, 119, 6, 0.3);
      }

      body.light-theme .irfan-constellation-svg-wrap {
        background: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%);
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .irfan-dialogue-box {
        background: #f8fafc;
        border-color: rgba(2, 132, 199, 0.28);
      }

      body.light-theme .irfan-dialogue-input {
        background: #ffffff;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.16);
      }

      /* Light Theme Compatibility */
      body.light-theme .irfan-hero {
        background:
          radial-gradient(circle at 88% 15%, rgba(217, 119, 6, 0.14), transparent 46%),
          radial-gradient(circle at 12% 85%, rgba(5, 150, 105, 0.12), transparent 48%),
          linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(241, 245, 249, 0.94));
        border-color: rgba(217, 119, 6, 0.3);
      }

      body.light-theme .irfan-hero h2 {
        background: linear-gradient(135deg, #0f172a 0%, #b45309 55%, #047857 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .irfan-stat-pill,
      body.light-theme .irfan-search-input,
      body.light-theme .irfan-scope-select,
      body.light-theme .irfan-era-badge,
      body.light-theme .irfan-quote-box,
      body.light-theme .irfan-lq-item,
      body.light-theme .irfan-tab-btn,
      body.light-theme .irfan-chip {
        background: rgba(241, 245, 249, 0.9);
        color: var(--text-primary, #0f172a);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .irfan-tab-btn.active {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.16), rgba(5, 150, 105, 0.14));
        border-color: #d97706;
      }

      body.light-theme .irfan-chip.active {
        background: rgba(2, 132, 199, 0.14);
        border-color: #0284c7;
      }

      body.light-theme .irfan-chip.theme-active {
        background: rgba(124, 58, 237, 0.14);
        border-color: #7c3aed;
      }

      body.light-theme .irfan-card.is-master {
        background:
          radial-gradient(circle at 100% 0%, rgba(217, 119, 6, 0.08), transparent 45%),
          rgba(255, 255, 255, 0.92);
      }

      body.light-theme .irfan-teaching,
      body.light-theme .irfan-stream-box .seyyah-md-p,
      body.light-theme .irfan-stream-box .seyyah-md-list {
        color: var(--text-secondary, #334155);
      }

      body.light-theme .irfan-concept-tag {
        background: rgba(15, 23, 42, 0.05);
        color: var(--text-secondary, #334155);
      }

      body.light-theme .irfan-ai-btn {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.14), rgba(124, 58, 237, 0.14));
        color: #0f172a;
      }

      body.light-theme .irfan-modal {
        background: #ffffff;
      }

      body.light-theme .irfan-modal-close,
      body.light-theme .irfan-action-btn {
        background: #f1f5f9;
        color: #0f172a;
      }

      @media (max-width: 780px) {
        .irfan-stats-row {
          grid-template-columns: repeat(2, 1fr);
        }
        .irfan-search-row {
          grid-template-columns: 1fr;
        }
        .irfan-grid,
        .irfan-reflections-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const esc = ctx && typeof ctx.escapeHtml === 'function' ? ctx.escapeHtml : fallbackEscapeHtml;
    const norm = ctx && typeof ctx.normalizeTurkish === 'function' ? ctx.normalizeTurkish : fallbackNormalizeTurkish;

    const catalog = buildCatalog(ctx, norm);

    const uiState = {
      activeTab: 'figures', // 'figures' | 'reflections'
      scope: 'all', // 'all' | 'masters' | 'provincial'
      region: 'all',
      theme: 'all',
      century: 'all',
      school: 'all',
      showConstellation: true,
      selectedMasterId: 'mevlana-celaleddin-rumi',
      search: '',
      modalItem: null,
      streaming: false,
      streamText: '',
      streamSource: '',
      streamRequestId: 0
    };

    function openCity(provinceKey) {
      if (!provinceKey) return;
      if (ctx && typeof ctx.selectCity === 'function' && catalog.provincesMap[provinceKey]) {
        closeModal();
        ctx.selectCity(provinceKey);
      } else if (ctx && typeof ctx.showToast === 'function') {
        ctx.showToast('Şehir profili bulunamadı: ' + provinceKey);
      }
    }

    function filterFigures() {
      const q = norm(uiState.search);
      let base = catalog.allFigures;
      if (uiState.scope === 'masters') base = catalog.masters;
      else if (uiState.scope === 'provincial') base = catalog.provincial;

      return base.filter(function (item) {
        if (uiState.region !== 'all' && item.regionCode !== uiState.region) return false;
        if (uiState.theme !== 'all' && item.theme !== uiState.theme) return false;
        if (uiState.century !== 'all' && item.centuryBucket !== uiState.century) return false;
        if (uiState.school !== 'all' && item.school !== uiState.school) return false;
        if (q) {
          const blob = norm(
            [
              item.name,
              item.subtitle,
              item.era,
              item.theme,
              item.school || '',
              item.coreTeaching,
              item.provinceDetail,
              item.quote,
              item.provinceName,
              item.region,
              item.reflection,
              (item.concepts || []).join(' '),
              (item.literaryQuotes || []).join(' ')
            ].join(' ')
          );
          if (blob.indexOf(q) === -1) return false;
        }
        return true;
      });
    }

    function filterReflections() {
      const q = norm(uiState.search);
      return catalog.provinceReflections.filter(function (p) {
        if (!p.hasContent) return false;
        if (uiState.region !== 'all' && p.regionCode !== uiState.region) return false;
        if (q) {
          const blob = norm(
            [
              p.name,
              p.region,
              p.reflection,
              p.literaryQuotes.join(' '),
              p.spiritualFigures.map(function (s) { return s.name + ' ' + s.desc; }).join(' ')
            ].join(' ')
          );
          if (blob.indexOf(q) === -1) return false;
        }
        return true;
      });
    }

    function getCounts() {
      const uniqueProvWithSF = new Set();
      catalog.allFigures.forEach(function (f) {
        if (f.provinceKey) uniqueProvWithSF.add(f.provinceKey);
      });
      const totalQuotes = catalog.provinceReflections.reduce(function (acc, p) {
        return acc + p.literaryQuotes.length;
      }, 0);
      const totalReflections = catalog.provinceReflections.filter(function (p) {
        return Boolean(p.reflection);
      }).length;

      return {
        mastersCount: catalog.masters.length,
        totalFigures: catalog.allFigures.length,
        provincesCovered: uniqueProvWithSF.size,
        totalReflections: totalReflections,
        totalQuotes: totalQuotes
      };
    }

    function renderFigureCard(item) {
      const tMeta = THEME_META[item.theme] || THEME_META['Tasavvuf & İrfan'];
      const plateLabel = item.plate ? String(item.plate).padStart(2, '0') + ' ' : '';
      const conceptsHtml = (item.concepts || []).slice(0, 4).map(function (c) {
        return '<span class="irfan-concept-tag">' + esc(c) + '</span>';
      }).join('');

      const relatedHtml = (item.relatedKeys || []).length > 0
        ? '<div class="irfan-related-row"><span>İzleri:</span>' +
          item.relatedKeys.map(function (rk) {
            const rp = catalog.provincesMap[rk];
            if (!rp) return '';
            return '<button type="button" class="irfan-related-link" data-city-key="' + esc(rk) + '">' + esc(rp.name) + '</button>';
          }).join('') +
          '</div>'
        : '';

      const quoteHtml = item.quote
        ? '<div class="irfan-quote-box">“' + esc(item.quote.replace(/^["“]|["”]$/g, '')) + '”</div>'
        : '';

      return (
        '<article class="irfan-card ' + (item.isMaster ? 'is-master' : '') + '">' +
          '<div class="irfan-card-head">' +
            '<div class="irfan-badges-top">' +
              '<span class="irfan-theme-badge" style="color:' + esc(tMeta.color) + ';background:' + esc(tMeta.badgeBg) + ';">' +
                esc(tMeta.icon + ' ' + item.theme) +
              '</span>' +
              (item.isMaster
                ? '<span class="irfan-master-pill">⭐ Ana Mimar</span>'
                : '<span class="irfan-prov-pill">🏛️ İl Arşivi</span>') +
            '</div>' +
            '<h3 class="irfan-sage-name">' + esc(item.name) + '</h3>' +
            (item.subtitle ? '<div class="irfan-sage-subtitle">' + esc(item.subtitle) + '</div>' : '') +
            '<div class="irfan-meta-row">' +
              '<span class="irfan-era-badge">⏳ ' + esc(item.era) + '</span>' +
              (item.school ? '<span class="irfan-era-badge">🕯️ ' + esc(item.school) + '</span>' : '') +
              '<button type="button" class="irfan-province-btn" data-city-key="' + esc(item.provinceKey) + '" title="Şehir detayına git">' +
                (item.visited ? '<span class="irfan-visited-dot" title="Gezildi"></span>' : '') +
                '📍 ' + esc(plateLabel + item.provinceName) + ' · ' + esc(item.region) +
              '</button>' +
            '</div>' +
          '</div>' +
          '<p class="irfan-teaching">' + esc(item.coreTeaching) + '</p>' +
          quoteHtml +
          (conceptsHtml ? '<div class="irfan-concept-tags">' + conceptsHtml + '</div>' : '') +
          '<div class="irfan-card-foot">' +
            '<button type="button" class="irfan-ai-btn" data-tefekkur-id="' + esc(item.id) + '">' +
              '✨ Bu Hikmeti Gemini AI ile Tefekkür Et' +
            '</button>' +
            relatedHtml +
          '</div>' +
        '</article>'
      );
    }

    function renderReflectionCard(prov) {
      const plateLabel = prov.plate ? String(prov.plate).padStart(2, '0') + ' ' : '';
      const lqHtml = prov.literaryQuotes.length
        ? '<ul class="irfan-lq-list">' +
          prov.literaryQuotes.map(function (q) {
            return '<li class="irfan-lq-item">' + esc(q) + '</li>';
          }).join('') +
          '</ul>'
        : '';

      const sfTags = prov.spiritualFigures.slice(0, 4).map(function (sf) {
        return '<span class="irfan-concept-tag">' + esc(sf.name) + '</span>';
      }).join('');

      return (
        '<article class="irfan-card">' +
          '<div class="irfan-card-head">' +
            '<div class="irfan-badges-top">' +
              '<span class="irfan-theme-badge" style="color:#f59e0b;background:rgba(245,158,11,0.14);">📜 Şehir Tefekkürü & Edebiyat</span>' +
              '<span class="irfan-prov-pill">' + prov.literaryQuotes.length + ' Alıntı</span>' +
            '</div>' +
            '<div class="irfan-meta-row">' +
              '<button type="button" class="irfan-province-btn" data-city-key="' + esc(prov.key) + '">' +
                (prov.visited ? '<span class="irfan-visited-dot" title="Gezildi"></span>' : '') +
                '📍 ' + esc(plateLabel + prov.name) + ' · ' + esc(prov.region) +
              '</button>' +
            '</div>' +
          '</div>' +
          (prov.reflection
            ? '<p class="irfan-teaching">' + esc(prov.reflection) + '</p>'
            : '<p class="irfan-teaching" style="opacity:0.75;">Bu ilin edebî alıntıları ve manevî şahsiyet izleri seyyah defterinde kayıtlıdır.</p>') +
          lqHtml +
          (sfTags ? '<div class="irfan-concept-tags">' + sfTags + '</div>' : '') +
          '<div class="irfan-card-foot">' +
            '<button type="button" class="irfan-ai-btn" data-prov-tefekkur="' + esc(prov.key) + '">' +
              '✨ Bu Hikmeti Gemini AI ile Tefekkür Et' +
            '</button>' +
          '</div>' +
        '</article>'
      );
    }

    function closeModal() {
      uiState.modalItem = null;
      uiState.streaming = false;
      uiState.streamRequestId += 1;
      const existing = document.getElementById('irfan-ai-modal-backdrop');
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    }

    function updateModalStreamDom() {
      const box = document.getElementById('irfan-modal-stream-box');
      const statusEl = document.getElementById('irfan-modal-status');
      if (box) {
        box.innerHTML = renderSafeMarkdown(uiState.streamText, esc);
      }
      if (statusEl) {
        const isOffline = uiState.streamSource.indexOf('Çevrimdışı') !== -1;
        statusEl.className = 'irfan-stream-status' + (isOffline ? ' offline' : '');
        statusEl.textContent = uiState.streaming
          ? '⏳ Hikmet tefekkür ediliyor...'
          : (uiState.streamSource || '✨ Tefekkür Tamamlandı');
      }
    }

    async function runContemplation(item, forceRefresh) {
      const reqId = ++uiState.streamRequestId;
      uiState.streaming = true;
      uiState.streamText = '';
      uiState.streamSource = '⏳ Gemini AI bağlantısı hazırlanıyor...';
      updateModalStreamDom();

      const hasAiClient =
        typeof window !== 'undefined' &&
        window.SEYYAH_AI &&
        typeof window.SEYYAH_AI.stream === 'function';
      const hasKey = hasAiClient && typeof window.SEYYAH_AI.hasKey === 'function' && window.SEYYAH_AI.hasKey();

      if (hasKey) {
        try {
          const prompt = buildAiPrompt(item);
          const system =
            'Sen Anadolu tasavvuf, felsefe ve kültür tarihi alanında derin bilgi sahibi, aynı zamanda modern dijital göçebelik, yavaş seyahat ve kütüphane çalışma disiplinini yakından tanıyan bilge bir rehbersin. Üslubun zarif, derinlikli, önyargısız ve umut vericidir.';
          const cacheKey = forceRefresh ? null : 'irfan_tefekkur_v1_' + item.id;

          uiState.streamSource = '✨ Gemini AI Canlı Tefekkür Akışı';
          updateModalStreamDom();

          const res = await window.SEYYAH_AI.stream({
            prompt: prompt,
            system: system,
            temperature: 0.72,
            maxTokens: 1600,
            cacheKey: cacheKey,
            onChunk: function (_delta, fullText) {
              if (reqId !== uiState.streamRequestId) return;
              uiState.streamText = fullText;
              updateModalStreamDom();
            }
          });

          if (reqId !== uiState.streamRequestId) return;
          if (res && res.text) {
            uiState.streamText = res.text;
            uiState.streamSource = '✨ Gemini AI (' + (res.model || 'Canlı') + (res.cached ? ' · Önbellek' : '') + ')';
            uiState.streaming = false;
            updateModalStreamDom();
            return;
          }
        } catch (_err) {
          // Gracefully fall through to offline philosophical essay fallback
        }
      }

      // Offline philosophical essay fallback with gentle progressive reveal
      const offlineText = buildOfflineEssay(item);
      uiState.streamSource = '📜 Çevrimdışı Felsefî Tefekkür Risalesi (Gemini AI Anahtarı Yok / Çevrimdışı Yedek)';
      const words = offlineText.split(' ');
      let idx = 0;
      const chunkSize = 14;

      function stepReveal() {
        if (reqId !== uiState.streamRequestId) return;
        idx = Math.min(words.length, idx + chunkSize);
        uiState.streamText = words.slice(0, idx).join(' ');
        if (idx >= words.length) {
          uiState.streaming = false;
          updateModalStreamDom();
          return;
        }
        updateModalStreamDom();
        setTimeout(stepReveal, 28);
      }
      stepReveal();
    }

    function buildConstellationSvgHtml(filteredFigures) {
      const visibleMasterIds = new Set();
      filteredFigures.forEach(function (f) {
        if (f.isMaster) visibleMasterIds.add(f.id);
      });
      const masters = catalog.masters;
      const linesHtml = [];
      const nodesHtml = [];

      // Draw spiritual transmission & geographic connection lines (Gönül Hatları)
      masters.forEach(function (m) {
        const p1 = PROVINCE_SVG_COORDS[m.provinceKey];
        if (!p1) return;
        const isActive = visibleMasterIds.size === 0 || visibleMasterIds.has(m.id);
        (m.relatedKeys || []).forEach(function (rk) {
          const p2 = PROVINCE_SVG_COORDS[rk];
          if (!p2) return;
          linesHtml.push(
            '<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" ' +
            'stroke="' + (isActive ? 'rgba(245, 158, 11, 0.42)' : 'rgba(148, 163, 184, 0.14)') + '" ' +
            'stroke-width="' + (isActive ? '1.8' : '1') + '" stroke-dasharray="4 3" />'
          );
        });
      });

      // Group masters by provinceKey to offset slightly if two masters share a city (e.g. Konya, Bursa, Istanbul, Malatya)
      const cityCountMap = {};
      masters.forEach(function (m, idx) {
        const basePos = PROVINCE_SVG_COORDS[m.provinceKey] || { x: 140 + (idx * 28) % 680, y: 120 + (idx * 47) % 180 };
        const count = cityCountMap[m.provinceKey] || 0;
        cityCountMap[m.provinceKey] = count + 1;
        const angle = count * 2.1;
        const radiusOffset = count === 0 ? 0 : 18;
        const cx = Math.round(basePos.x + Math.cos(angle) * radiusOffset);
        const cy = Math.round(basePos.y + Math.sin(angle) * radiusOffset);

        const isVisible = visibleMasterIds.size === 0 || visibleMasterIds.has(m.id);
        const isSelected = uiState.selectedMasterId === m.id;
        const tMeta = THEME_META[m.theme] || THEME_META['Tasavvuf & İrfan'];
        const shortName = m.name.split('(')[0].trim().split(' ').slice(0, 2).join(' ');

        nodesHtml.push(
          '<g class="irfan-c-node" data-constellation-master="' + esc(m.id) + '" opacity="' + (isVisible ? '1' : '0.28') + '">' +
            (isSelected
              ? '<circle cx="' + cx + '" cy="' + cy + '" r="15" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3 2" />'
              : '') +
            '<circle cx="' + cx + '" cy="' + cy + '" r="' + (isSelected ? '9' : '7') + '" fill="' + esc(tMeta.color) + '" stroke="#0f172a" stroke-width="2" />' +
            '<text x="' + cx + '" y="' + (cy - 11) + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="currentColor">' +
              esc(shortName) +
            '</text>' +
            '<title>' + esc(m.name + ' — ' + m.provinceName + ' (' + m.era + ' · ' + m.school + ')') + '</title>' +
          '</g>'
        );
      });

      return (
        '<svg class="irfan-constellation-svg" viewBox="0 0 900 385" role="img" aria-label="Anadolu İrfan Ocakları ve Gönül Hatları Haritası">' +
          '<defs>' +
            '<radialGradient id="irfanAnatoliaGlow" cx="50%" cy="50%" r="55%">' +
              '<stop offset="0%" stop-color="rgba(245, 158, 11, 0.14)" />' +
              '<stop offset="100%" stop-color="rgba(16, 185, 129, 0)" />' +
            '</radialGradient>' +
          '</defs>' +
          '<rect x="18" y="18" width="864" height="348" rx="22" fill="url(#irfanAnatoliaGlow)" stroke="rgba(245, 158, 11, 0.16)" stroke-width="1" />' +
          '<path d="M 65 95 Q 190 60 390 88 T 740 110 L 855 170 L 845 310 Q 670 335 510 355 L 330 330 Q 170 325 92 260 Z" fill="rgba(15, 23, 42, 0.25)" stroke="rgba(0, 242, 254, 0.18)" stroke-width="1.5" />' +
          linesHtml.join('') +
          nodesHtml.join('') +
        '</svg>'
      );
    }

    async function runWisdomQuestion(item, questionText) {
      const q = String(questionText || '').trim() || 'Bu gönül sultanının bugünün yolcusuna en büyük hikmet dersi nedir?';
      const reqId = ++uiState.streamRequestId;
      uiState.streaming = true;
      uiState.streamText = '';
      uiState.streamSource = '⏳ Gönül Sultanı meclisinden hikmet cevabı hazırlanıyor...';
      updateModalStreamDom();

      const hasAiClient =
        typeof window !== 'undefined' &&
        window.SEYYAH_AI &&
        typeof window.SEYYAH_AI.stream === 'function';
      const hasKey = hasAiClient && typeof window.SEYYAH_AI.hasKey === 'function' && window.SEYYAH_AI.hasKey();

      if (hasKey) {
        try {
          const prompt =
            'Gönül Sultanı / İrfan Büyüğü: ' + item.name + ' (' + (item.era || '') + ' · ' + item.provinceName + ')\n' +
            'Ekol / Ocak: ' + (item.school || item.theme) + '\n' +
            'Öz Öğreti: ' + item.coreTeaching + '\n' +
            'Vecize: "' + (item.quote || '') + '"\n' +
            'Seyyahın Suali: "' + q + '"\n\n' +
            'Lütfen bu gönül sultanının öğretileri, kavramları ve ' + item.provinceName + ' irfan mirası ışığında seyyahın sualine doğrudan, samimi ve hikmetli bir Türkçe ile cevap ver.';
          const system =
            'Sen Anadolu irfan geleneğinin ve ' + item.name + ' hazretlerinin öğretilerini temsil eden hikmetli bir mürşitsin. Zarif, derin ve yol gösterici bir dille yanıtla.';

          uiState.streamSource = '✨ Gemini AI Canlı Hikmet Söyleşisi';
          updateModalStreamDom();

          const res = await window.SEYYAH_AI.stream({
            prompt: prompt,
            system: system,
            temperature: 0.75,
            maxTokens: 1100,
            onChunk: function (_delta, fullText) {
              if (reqId !== uiState.streamRequestId) return;
              uiState.streamText = fullText;
              updateModalStreamDom();
            }
          });
          if (reqId !== uiState.streamRequestId) return;
          if (res && res.text) {
            uiState.streamText = res.text;
            uiState.streamSource = '✨ Gemini AI Hikmet Söyleşisi (' + (res.model || 'Canlı') + ')';
            uiState.streaming = false;
            updateModalStreamDom();
            return;
          }
        } catch (_e) {}
      }

      // Offline Wisdom Dialogue Fallback
      const offlineReply = buildOfflineWisdomDialogue(item, q, norm);
      uiState.streamSource = '🕯️ Çevrimdışı Hikmet Söyleşisi (' + item.name + ' Külliyatı & ' + item.provinceName + ' Mirası)';
      const words = offlineReply.split(' ');
      let idx = 0;
      function step() {
        if (reqId !== uiState.streamRequestId) return;
        idx = Math.min(words.length, idx + 12);
        uiState.streamText = words.slice(0, idx).join(' ');
        if (idx >= words.length) {
          uiState.streaming = false;
          updateModalStreamDom();
          return;
        }
        updateModalStreamDom();
        setTimeout(step, 24);
      }
      step();
    }

    function openContemplationModal(item) {
      closeModal();
      uiState.modalItem = item;

      const backdrop = document.createElement('div');
      backdrop.id = 'irfan-ai-modal-backdrop';
      backdrop.className = 'irfan-modal-backdrop';

      const plateLabel = item.plate ? String(item.plate).padStart(2, '0') + ' ' : '';

      backdrop.innerHTML =
        '<div class="irfan-modal" role="dialog" aria-modal="true" aria-label="Tefekkür Odası">' +
          '<div class="irfan-modal-header">' +
            '<div>' +
              '<div class="irfan-eyebrow" style="margin-bottom:6px;">✨ İrfan & Modern Seyyah Tefekkürü</div>' +
              '<h3 class="irfan-modal-title">' + esc(item.name) + '</h3>' +
              '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;align-items:center;">' +
                '<span class="irfan-era-badge">⏳ ' + esc(item.era) + '</span>' +
                (item.school ? '<span class="irfan-era-badge">🕯️ ' + esc(item.school) + '</span>' : '') +
                '<button type="button" class="irfan-province-btn" id="irfan-modal-city-btn">' +
                  '📍 ' + esc(plateLabel + item.provinceName) + ' · ' + esc(item.region) +
                '</button>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="irfan-modal-close" id="irfan-modal-close-btn" aria-label="Kapat">✕</button>' +
          '</div>' +
          '<div class="irfan-modal-body">' +
            '<span class="irfan-stream-status" id="irfan-modal-status">⏳ Hazırlanıyor...</span>' +
            '<div class="irfan-stream-box" id="irfan-modal-stream-box"></div>' +
            '<div class="irfan-dialogue-box">' +
              '<div style="font-size:0.8rem;font-weight:700;color:var(--accent-cyan,#00f2fe);">💬 Gönül Sultanına Hikmet Suali Sor (Canlı AI + Çevrimdışı Hikmet Yedekli)</div>' +
              '<div class="irfan-dialogue-row">' +
                '<input type="text" id="irfan-modal-question-input" class="irfan-dialogue-input" placeholder="Örn: Yolda sabır ve gönül huzuru nasıl korunur?" />' +
                '<button type="button" id="irfan-modal-ask-btn" class="irfan-dialogue-ask-btn">🕯️ Hikmet Sor</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="irfan-modal-footer">' +
            '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
              '<button type="button" class="irfan-action-btn" id="irfan-modal-refresh-btn">🔄 Ana Risaleyi Tefekkür Et</button>' +
              '<button type="button" class="irfan-action-btn" id="irfan-modal-copy-btn">📋 Metni Kopyala</button>' +
            '</div>' +
            '<button type="button" class="irfan-province-btn" id="irfan-modal-goto-btn">🗺️ Şehir Sayfasını Aç</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(backdrop);

      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) closeModal();
      });

      const closeBtn = document.getElementById('irfan-modal-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', closeModal);

      const cityBtn = document.getElementById('irfan-modal-city-btn');
      if (cityBtn) cityBtn.addEventListener('click', function () { openCity(item.provinceKey); });

      const gotoBtn = document.getElementById('irfan-modal-goto-btn');
      if (gotoBtn) gotoBtn.addEventListener('click', function () { openCity(item.provinceKey); });

      const refreshBtn = document.getElementById('irfan-modal-refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
          runContemplation(item, true);
        });
      }

      const qInput = document.getElementById('irfan-modal-question-input');
      const askBtn = document.getElementById('irfan-modal-ask-btn');
      if (askBtn) {
        askBtn.addEventListener('click', function () {
          runWisdomQuestion(item, qInput ? qInput.value : '');
        });
      }
      if (qInput) {
        qInput.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            runWisdomQuestion(item, qInput.value);
          }
        });
      }

      const copyBtn = document.getElementById('irfan-modal-copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          const textToCopy = item.name + ' — ' + item.provinceName + '\n\n' + uiState.streamText;
          if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(function () {
              if (ctx && typeof ctx.showToast === 'function') {
                ctx.showToast('Tefekkür metni panoya kopyalandı.');
              }
            }).catch(function () {});
          }
        });
      }

      runContemplation(item, false);
    }

    function updateView() {
      const counts = getCounts();
      const filteredFigures = filterFigures();
      const filteredReflections = filterReflections();

      const constellationHost = container.querySelector('#irfan-constellation-svg-host');
      if (constellationHost) {
        constellationHost.innerHTML = buildConstellationSvgHtml(filteredFigures);
        constellationHost.querySelectorAll('[data-constellation-master]').forEach(function (node) {
          node.addEventListener('click', function () {
            const mId = node.getAttribute('data-constellation-master');
            uiState.selectedMasterId = mId;
            const found = catalog.masters.find(function (m) { return m.id === mId; });
            if (found) openContemplationModal(found);
          });
        });
      }

      const resultsCountEl = container.querySelector('#irfan-results-count');
      const gridWrap = container.querySelector('#irfan-content-grid');
      if (!gridWrap) return;

      if (uiState.activeTab === 'figures') {
        if (resultsCountEl) {
          resultsCountEl.textContent = filteredFigures.length + ' gönül & irfan kaydı gösteriliyor (Toplam ' + counts.totalFigures + ')';
        }
        if (filteredFigures.length === 0) {
          gridWrap.className = '';
          gridWrap.innerHTML =
            '<div class="irfan-empty">' +
              '<p style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">Eşleşen irfan şahsiyeti bulunamadı</p>' +
              '<p style="font-size:0.85rem;">Bölge, tema veya arama filtresini temizleyerek 81 ilin tamamına göz atabilirsiniz.</p>' +
            '</div>';
        } else {
          gridWrap.className = 'irfan-grid';
          gridWrap.innerHTML = filteredFigures.map(renderFigureCard).join('');
        }
      } else {
        if (resultsCountEl) {
          resultsCountEl.textContent = filteredReflections.length + ' ilin tefekkür & edebî alıntı dosyası gösteriliyor';
        }
        if (filteredReflections.length === 0) {
          gridWrap.className = '';
          gridWrap.innerHTML =
            '<div class="irfan-empty">' +
              '<p style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">Eşleşen şehir tefekkürü bulunamadı</p>' +
              '<p style="font-size:0.85rem;">Farklı bir bölge seçebilir veya arama terimini sadeleştirebilirsiniz.</p>' +
            '</div>';
        } else {
          gridWrap.className = 'irfan-reflections-grid';
          gridWrap.innerHTML = filteredReflections.map(renderReflectionCard).join('');
        }
      }

      // Bind dynamic card buttons
      gridWrap.querySelectorAll('[data-city-key]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          openCity(btn.getAttribute('data-city-key'));
        });
      });

      gridWrap.querySelectorAll('[data-tefekkur-id]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const id = btn.getAttribute('data-tefekkur-id');
          const found = catalog.allFigures.find(function (f) { return f.id === id; });
          if (found) openContemplationModal(found);
        });
      });

      gridWrap.querySelectorAll('[data-prov-tefekkur]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const key = btn.getAttribute('data-prov-tefekkur');
          const prov = catalog.provinceReflections.find(function (p) { return p.key === key; });
          if (!prov) return;
          openContemplationModal({
            id: 'prov-ref-' + prov.key.replace(/[^a-z0-9]/gi, '_'),
            name: prov.name + ' İrfan & Edebiyat Mirası',
            era: '81 İl Seyahatname Arşivi',
            theme: 'Tasavvuf & İrfan',
            coreTeaching: prov.reflection || (prov.name + ' şehrinin edebî ve manevî mirası.'),
            quote: prov.literaryQuotes[0] || '',
            provinceKey: prov.key,
            provinceName: prov.name,
            plate: prov.plate,
            region: prov.region,
            reflection: prov.reflection,
            literaryQuotes: prov.literaryQuotes
          });
        });
      });
    }

    const counts = getCounts();

    container.innerHTML =
      '<div class="irfan-studio">' +
        '<section class="irfan-hero">' +
          '<div class="irfan-hero-top">' +
            '<div>' +
              '<div class="irfan-eyebrow">🕌 81 İl İrfan Envanteri & 24 Ana Mimar</div>' +
              '<h2>🕌 Anadolu İrfan & Gönül Coğrafyası Atlası</h2>' +
              '<p class="irfan-hero-sub">' +
                'Anadolu’nun 7 bölgesindeki 81 ilden derlenen <strong>manevi şahsiyetler</strong>, <strong>şehir tefekkürleri</strong> ve <strong>edebî alıntılar</strong> ile 24 büyük gönül mimarını keşfedin. Her bilgenin hikmetini Gemini AI ile modern seyahat ve içsel huzur ekseninde tefekkür edin.' +
              '</p>' +
            '</div>' +
          '</div>' +
          '<div class="irfan-stats-row">' +
            '<div class="irfan-stat-pill"><span class="irfan-stat-val">' + counts.mastersCount + '</span><span class="irfan-stat-lbl">Ana İrfan & Gönül Mimarı</span></div>' +
            '<div class="irfan-stat-pill"><span class="irfan-stat-val">' + counts.totalFigures + '</span><span class="irfan-stat-lbl">Toplam Şahsiyet Kaydı</span></div>' +
            '<div class="irfan-stat-pill"><span class="irfan-stat-val">' + counts.totalReflections + ' / 81</span><span class="irfan-stat-lbl">İl Tefekkürü & ' + counts.provincesCovered + ' İl</span></div>' +
            '<div class="irfan-stat-pill"><span class="irfan-stat-val">' + counts.totalQuotes + '</span><span class="irfan-stat-lbl">Edebî Alıntı & Hikmet</span></div>' +
          '</div>' +
        '</section>' +

        '<section class="irfan-controls">' +
          '<div class="irfan-view-tabs">' +
            '<div class="irfan-tab-group">' +
              '<button type="button" class="irfan-tab-btn active" data-tab="figures">🕌 Gönül Mimarları & İl Şahsiyetleri</button>' +
              '<button type="button" class="irfan-tab-btn" data-tab="reflections">📜 81 İl Tefekkürleri & Edebî Alıntılar</button>' +
            '</div>' +
            '<span id="irfan-results-count" class="irfan-results-meta"></span>' +
          '</div>' +

          '<div class="irfan-search-row">' +
            '<div class="irfan-search-box">' +
              '<span class="irfan-search-icon">🔍</span>' +
              '<input type="text" id="irfan-search-input" class="irfan-search-input" placeholder="Bilge adı, kavram (tevekkül, ahilik, sema) veya şehir ara..." />' +
              '<button type="button" id="irfan-search-clear" class="irfan-search-clear" title="Aramayı temizle">✕</button>' +
            '</div>' +
            '<select id="irfan-scope-select" class="irfan-scope-select" aria-label="Kaynak kapsamı">' +
              '<option value="all">🌟 Tümü (24 Ana Mimar + 81 İl Arşivi)</option>' +
              '<option value="masters">⭐ Yalnızca 24 Ana Gönül Mimarı</option>' +
              '<option value="provincial">🏛️ Yalnızca 81 İl Envanter Şahsiyetleri</option>' +
            '</select>' +
          '</div>' +

          '<div class="irfan-chip-bar" id="irfan-region-chips">' +
            '<span class="irfan-chip-label">Bölge:</span>' +
            REGIONS.map(function (r) {
              return '<button type="button" class="irfan-chip ' + (r.code === 'all' ? 'active' : '') + '" data-region="' + esc(r.code) + '">' + esc(r.icon + ' ' + r.shortLabel) + '</button>';
            }).join('') +
          '</div>' +

          '<div class="irfan-chip-bar" id="irfan-theme-chips">' +
            '<span class="irfan-chip-label">Tema:</span>' +
            THEMES.map(function (t) {
              return '<button type="button" class="irfan-chip ' + (t.id === 'all' ? 'theme-active' : '') + '" data-theme="' + esc(t.id) + '">' + esc(t.icon + ' ' + t.label) + '</button>';
            }).join('') +
          '</div>' +

          '<div class="irfan-chip-bar" id="irfan-century-chips">' +
            '<span class="irfan-chip-label">Asırlar Boyu İrfan:</span>' +
            CENTURIES.map(function (c) {
              return '<button type="button" class="irfan-chip ' + (c.id === 'all' ? 'active' : '') + '" data-century="' + esc(c.id) + '">' + esc(c.icon + ' ' + c.label) + '</button>';
            }).join('') +
          '</div>' +

          '<div class="irfan-chip-bar" id="irfan-school-chips">' +
            '<span class="irfan-chip-label">İrfan Ocağı / Ekol:</span>' +
            SCHOOLS.map(function (s) {
              return '<button type="button" class="irfan-chip ' + (s.id === 'all' ? 'theme-active' : '') + '" data-school="' + esc(s.id) + '">' + esc(s.icon + ' ' + s.label) + '</button>';
            }).join('') +
          '</div>' +
        '</section>' +

        '<section class="irfan-constellation-box">' +
          '<div class="irfan-constellation-head">' +
            '<div class="irfan-constellation-title">🌌 İrfan Ocakları &amp; Gönül Hatları Takımyıldız Haritası (24 Gönül Sultanı)</div>' +
            '<span style="font-size:0.76rem;color:var(--text-secondary,#94a3b8);">Düğümlere tıklayarak bilgenin tefekkür ve hikmet söyleşisini açabilirsiniz</span>' +
          '</div>' +
          '<div class="irfan-constellation-svg-wrap" id="irfan-constellation-svg-host"></div>' +
        '</section>' +

        '<section id="irfan-content-grid" class="irfan-grid"></section>' +
      '</div>';

    // Bind static controls
    const searchInput = container.querySelector('#irfan-search-input');
    const searchClear = container.querySelector('#irfan-search-clear');
    const scopeSelect = container.querySelector('#irfan-scope-select');
    const themeBar = container.querySelector('#irfan-theme-chips');

    container.querySelectorAll('.irfan-tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        uiState.activeTab = btn.getAttribute('data-tab') || 'figures';
        container.querySelectorAll('.irfan-tab-btn').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
        if (scopeSelect) {
          scopeSelect.disabled = uiState.activeTab !== 'figures';
          scopeSelect.style.opacity = uiState.activeTab !== 'figures' ? '0.5' : '1';
        }
        if (themeBar) {
          themeBar.style.display = uiState.activeTab === 'figures' ? 'flex' : 'none';
        }
        updateView();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        uiState.search = searchInput.value || '';
        updateView();
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', function () {
        uiState.search = '';
        if (searchInput) searchInput.value = '';
        updateView();
      });
    }

    if (scopeSelect) {
      scopeSelect.addEventListener('change', function () {
        uiState.scope = scopeSelect.value || 'all';
        updateView();
      });
    }

    container.querySelectorAll('#irfan-region-chips .irfan-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        uiState.region = chip.getAttribute('data-region') || 'all';
        container.querySelectorAll('#irfan-region-chips .irfan-chip').forEach(function (c) {
          c.classList.toggle('active', c === chip);
        });
        updateView();
      });
    });

    container.querySelectorAll('#irfan-theme-chips .irfan-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        uiState.theme = chip.getAttribute('data-theme') || 'all';
        container.querySelectorAll('#irfan-theme-chips .irfan-chip').forEach(function (c) {
          c.classList.toggle('theme-active', c === chip);
        });
        updateView();
      });
    });

    container.querySelectorAll('#irfan-century-chips .irfan-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        uiState.century = chip.getAttribute('data-century') || 'all';
        container.querySelectorAll('#irfan-century-chips .irfan-chip').forEach(function (c) {
          c.classList.toggle('active', c === chip);
        });
        updateView();
      });
    });

    container.querySelectorAll('#irfan-school-chips .irfan-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        uiState.school = chip.getAttribute('data-school') || 'all';
        container.querySelectorAll('#irfan-school-chips .irfan-chip').forEach(function (c) {
          c.classList.toggle('theme-active', c === chip);
        });
        updateView();
      });
    });

    updateView();
  }

  window.SEYYAH_MODULES.irfanAtlas = {
    render: render
  };
})();
