/**
 * Anadolu Seyahatnamesi — Mantıku't-Tayr: Yedi Vadi & Sefer Merhaleleri
 * Ferîdüddin Attâr'ın Mantıku't-Tayr eseri ve tasavvufî sefer doktrini
 * (Sefer-i Sûrî, Sefer-i Manevî, Sefer der Vatan) ışığında 81 illik yolculuk stüdyosu.
 * Registers on: window.SEYYAH_MODULES.sevenValleys = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-seven-valleys-styles';
  const VALLEY_NOTES_STORAGE = 'dijital_seyyah_seven_valleys_notes_v1';

  // Interactive Personal Valley Assessment ("Hangi Vadidesin?" Tefekkür Pusulası)
  const COMPASS_QUESTIONS = [
    {
      id: 'q1',
      prompt: 'Yola çıkarken veya yeni bir şehre adım atarken kalbindeki en baskın niyet hangisidir?',
      options: [
        { label: 'Alışkanlık kafesini kırıp yeni bir ufka revan olmak', valleyId: 1 },
        { label: 'Dağa, taşa ve o beldenin insanına muhabbetle bağlanmak', valleyId: 2 },
        { label: 'İl Halk Kütüphanesinde ve tarihî eserlerde derin ilim aramak', valleyId: 3 },
        { label: 'Tek bir sırt çantasıyla hafifleyip az eşyayla hürleşmek', valleyId: 4 }
      ]
    },
    {
      id: 'q2',
      prompt: 'Bir Anadolu şehrinde ikindi vakti taş bir avluda oturduğunda iç âleminde hangi hâl uyanır?',
      options: [
        { label: '7 bölgenin farklı renklerinde tek bir medeniyet ruhunu görmek', valleyId: 5 },
        { label: 'Göbeklitepe’den Selimiye’ye zaman ve sanat karşısında sessiz bir hayret', valleyId: 6 },
        { label: '“Yolun kendisi menzildir” sırrıyla benlikten soyunup şükretmek', valleyId: 7 },
        { label: 'Şehrin kütüphanesinde okuyup tefekkür notları derlemek', valleyId: 3 }
      ]
    },
    {
      id: 'q3',
      prompt: 'Yolculukta karşına çıkan zahmet, yorgunluk veya yalnızlık anlarını nasıl karşılarsın?',
      options: [
        { label: 'Yola çıkma irademi bileyleyen ilk eşik olarak görürüm', valleyId: 1 },
        { label: 'Sevdiğim coğrafyaya duyduğum aşkın tatlı bir bedeli sayarım', valleyId: 2 },
        { label: 'İstiğna ve kanaatle fazlalıklardan arınma fırsatı bilirim', valleyId: 4 },
        { label: 'Kesrette vahdeti ve derin hayreti büyüten bir sükût anı sayarım', valleyId: 6 }
      ]
    }
  ];

  // ---------------------------------------------------------------------------
  // 7 Valleys of Attâr's Mantıku't-Tayr mapped to 81 Anatolian Provinces
  // ---------------------------------------------------------------------------
  const VALLEYS = [
    {
      id: 1,
      roman: 'I',
      slug: 'talep',
      arabicTitle: 'Vâdî-i Taleb',
      title: 'Talep (İstek) Vadisi',
      shortTitle: 'Talep',
      minCities: 1,
      maxCities: 10,
      tagline: 'Yola çıkma iradesi ve alışkanlık kafesini kırmak',
      accent: '#38bdf8',
      accentSoft: 'rgba(56, 189, 248, 0.16)',
      icon: '🕊️',
      svgPos: { x: 96, y: 342 },
      sufiQuote: '“Talep vadisine adım atan kuşun ilk işi, yüzünü eski kafesinden çevirip yola revan olmaktır.”',
      sufiSource: 'Ferîdüddin Attâr — Mantıku’t-Tayr',
      sufiMeaning:
        'Mantıku’t-Tayr’da Hüdhüd’ün çağrısıyla başlayan ilk merhale Taleb’dir. Burada yolcu, konfor alanının, alışkanlıkların ve bildik limanların güvenlik yanılsamasını terk eder; hakikat arayışı uğruna belirsizliğe razı olur. İlk adımda kırılan şey mesafeler değil, insanı yerinde tutan atâlet kafesidir.',
      seferDiscipline:
        'Dijital Seyyah için Talep Vadisi; masa başı rutini kırıp ilk şehirlerarası bileti almak, 5 Gün Kuralı ile bir şehri tüketmeden sindirmeye niyet etmek ve yolculuğa bir turistik gezi değil, şahsî bir sefer defteri bilinciyle başlamaktır.',
      practices: [
        'İlk 10 ili aceleyle işaretlemek yerine her menzilde en az birkaç gün kök salmak',
        'Alışılmış konfor kalıplarını bırakıp sade bir sefer çantasıyla eşikten çıkmak',
        'Her yeni şehirde ilk akşam o beldenin tarihî meydanında niyet tazelemek'
      ],
      matchedProvinces: [
        { key: '01_Marmara/Bursa', reason: 'Emir Sultan ve Ulu Cami eşiğinde ilk sefer niyetinin mayalandığı payitaht kapısı.' },
        { key: '01_Marmara/Istanbul', reason: 'İki kıta arasında konfor kafesini kırıp Anadolu ufkuna açılan kadim hareket noktası.' },
        { key: '01_Marmara/Bilecik', reason: 'Şeyh Edebali ve Ertuğrul Gazi otağında küçük bir adımdan büyük bir ufka çıkış.' },
        { key: '04_IcAnadolu/Ankara', reason: 'Anadolu’nun tam kalbinden yedi yöne doğru yola revan olunan merkez menzil.' },
        { key: '04_IcAnadolu/Eskisehir', reason: 'Yunus Emre’nin “Gelin tanış olalım” çağrısıyla yolcuyu yola davet eden eşik.' },
        { key: '02_Ege/Izmir', reason: 'Batı rüzgârına karşı yeni ufuklara ve bilinmeyen denizlere açılma cesareti.' }
      ]
    },
    {
      id: 2,
      roman: 'II',
      slug: 'ask',
      arabicTitle: 'Vâdî-i Aşk',
      title: 'Aşk Vadisi',
      shortTitle: 'Aşk',
      minCities: 11,
      maxCities: 22,
      tagline: 'Coğrafyaya ve yaratılışa muhabbetle bakmak',
      accent: '#fb7185',
      accentSoft: 'rgba(251, 113, 133, 0.16)',
      icon: '🌹',
      svgPos: { x: 222, y: 294 },
      sufiQuote: '“Bu vadide akıl tereddüt eder; yolcuyu ateşe ve yola yürüten yegâne güç muhabbettir.”',
      sufiSource: 'Ferîdüddin Attâr — Mantıku’t-Tayr',
      sufiMeaning:
        'Talep iradesi yerini Aşk vadisine bıraktığında seyyah artık yalnızca merak eden bir gözlemci değildir; dağa, taşa, insana ve suya muhabbetle bağlanır. Attâr’a göre Aşk, soğuk hesabı eriten ateştir. Coğrafya haritada bir koordinat olmaktan çıkar, kalpte yankılanan canlı bir emanete dönüşür.',
      seferDiscipline:
        'Bu merhalede Dijital Seyyah, fotoğraf çekip geçmek yerine şehrin insanıyla sohbet eder, sabah çayında esnafın hikâyesini dinler ve doğanın (yaylaların, göllerin, bozkırın) dilini kalp gözüyle okumaya başlar.',
      practices: [
        'Şehirlerin yalnızca anıtlarını değil, insanını ve gündelik muhabbetini dinlemek',
        'Yol zahmetini şikâyet konusu değil, coğrafyaya duyulan sevginin bedeli görmek',
        'Seyir defterine bilgi kadar hissedilen duyguları ve insan portrelerini kaydetmek'
      ],
      matchedProvinces: [
        { key: '04_IcAnadolu/Konya', reason: 'Hz. Mevlânâ ve Şems-i Tebrîzî ikliminde muhabbetin bozkırı gülistana çevirdiği merkez.' },
        { key: '04_IcAnadolu/Nevsehir', reason: 'Hacı Bektaş Veli’nin “İncinsen de incitme” düsturu ve Kapadokya’nın masalsı vadileri.' },
        { key: '03_Akdeniz/Isparta', reason: 'Gül bahçeleri ve Eğirdir Gölü kıyısında yaratılışa sevgiyle nazar edilen iklim.' },
        { key: '05_Karadeniz/Artvin', reason: 'Bulutlara değen vadilerinde tabiatın ihtişamına gönül verilen zümrüt coğrafya.' },
        { key: '05_Karadeniz/Rize', reason: 'Yağmur ve çay buğusu eşliğinde insanı kendine hayran bırakan yeşil muhabbet.' },
        { key: '02_Ege/Mugla', reason: 'Zeytin ağaçları ve koylar arasında tabiatla barışık yavaş yaşamın durağı.' }
      ]
    },
    {
      id: 3,
      roman: 'III',
      slug: 'marifet',
      arabicTitle: 'Vâdî-i Ma‘rifet',
      title: 'Marifet (İrfan & İlim) Vadisi',
      shortTitle: 'Marifet',
      minCities: 23,
      maxCities: 34,
      tagline: 'İl Halk Kütüphanelerinde ilim ve tefekkür',
      accent: '#a855f7',
      accentSoft: 'rgba(168, 85, 247, 0.16)',
      icon: '📚',
      svgPos: { x: 356, y: 248 },
      sufiQuote: '“Ma‘rifet vadisinin yolu tektir sanma; her kabiliyet kendi penceresinden hakikati seyreder.”',
      sufiSource: 'Ferîdüddin Attâr — Mantıku’t-Tayr',
      sufiMeaning:
        'Aşkın harareti yolcuyu Marifet vadisinin berrak ışığına ulaştırır. Burası yalnızca kuru malumat biriktirme yeri değil; medeniyetin, tarihin, mimarinin ve insan nefsinin hikmetini kavrama makamıdır. Her şehir bir kitap sayfası, her taş kitabe bir irfan cümlesidir.',
      seferDiscipline:
        'Dijital Seyyah’ın omurgası bu vadide belirginleşir: Gündüz İl Halk Kütüphanelerinin sessiz masalarında derin çalışma, üretim ve okuma; ikindi vakti tarihî medreselerin, darüşşifaların ve kadim külliyelerin avlusunda tefekkür.',
      practices: [
        'Gidilen her ilin İl Halk Kütüphanesini düzenli bir çalışma ve tefekkür ofisine dönüştürmek',
        'Tarihî eserleri kronoloji ezberi yerine kurucu irfan ve şehir felsefesiyle okumak',
        'Okunan kitapları o şehrin mekânlarıyla eşleştirip sentez notları çıkarmak'
      ],
      matchedProvinces: [
        { key: '04_IcAnadolu/Sivas', reason: 'Çifte Minareli Medrese, Gök Medrese ve Divriği Ulu Camii ile Anadolu’nun taş ilim hazinesi.' },
        { key: '06_DoguAnadolu/Erzurum', reason: 'Yakutiye ve Çifte Minareli Medreselerde asırlık ilim geleneğinin vakur nöbeti.' },
        { key: '04_IcAnadolu/Kirsehir', reason: 'Cacabey Gökbilim Medresesi ve Ahi Evran irfanıyla bilim ile ahlakın birleştiği yurt.' },
        { key: '04_IcAnadolu/Kayseri', reason: 'Gevher Nesibe Şifahanesi ve Hunat Hatun Külliyesiyle kurumsal bilgi mirası.' },
        { key: '05_Karadeniz/Amasya', reason: 'Yeşilırmak kıyısında şehzadeler, tabipler ve kütüphaneler yetiştiren ilim vadisi.' },
        { key: '05_Karadeniz/Corum', reason: 'Hattuşa’dan Osmanlı külliyelerine kesintisiz medeniyet hafızasını okuma durağı.' }
      ]
    },
    {
      id: 4,
      roman: 'IV',
      slug: 'istigna',
      arabicTitle: 'Vâdî-i İstiğnâ',
      title: 'İstiğna (Kanaat & Az Eşya) Vadisi',
      shortTitle: 'İstiğna',
      minCities: 35,
      maxCities: 46,
      tagline: 'Tek sırt çantası ve GSB kervansaray sadeliği',
      accent: '#00f2fe',
      accentSoft: 'rgba(0, 242, 254, 0.16)',
      icon: '🎒',
      svgPos: { x: 492, y: 204 },
      sufiQuote: '“İstiğnâ rüzgârı estiğinde yedi deniz bir damla, büyük dünyalar bir zerre gibi hafifler.”',
      sufiSource: 'Ferîdüddin Attâr — Mantıku’t-Tayr',
      sufiMeaning:
        'Dördüncü vadi İstiğnâ; ihtiyaçsızlık, gönül tokluğu ve yüklerden sıyrılma makamıdır. Seyyah burada anlar ki yolun ağırlığı eşyanın çokluğundan değil, kalbin dünyaya olan gereksiz bağımlılığından doğar. Azla yetinen yolcu özgürleşir; hiçbir lüksün esiri olmadan her şehre sığar.',
      seferDiscipline:
        'Tek bir sırt çantasına sığan bütün bir hayat, GSB yurtlarının ve mütevazı misafirhanelerin modern kervansaray sadeliği, gösterişten uzak esnaf sofraları ve dijital minimalizm… İstiğna Vadisi, “az eşya, çok keşif” ilkesinin bizzat yaşanmış hâlidir.',
      practices: [
        'Tek sırt çantası disiplinini koruyarak her fazlalığı yoldan önce elemek',
        'GSB kervansarayları ve sade konaklama kültürüyle gösterişsiz seyahat ahlakını yaşamak',
        'Tüketim odaklı turizmden arınıp yürüyüş, kütüphane ve sükûnetle yetinmek'
      ],
      matchedProvinces: [
        { key: '04_IcAnadolu/Aksaray', reason: 'Somuncu Baba’nın kanaat fırını ve Ihlara Vadisi’nin dünya gürültüsünden uzak uzleti.' },
        { key: '05_Karadeniz/Sinop', reason: '“Gölge etme başka ihsan istemem” diyen Diyojen’in limanında kanaat tefekkürü.' },
        { key: '06_DoguAnadolu/Tunceli', reason: 'Munzur Vadisi’nin berrak sularında gösterişsiz tabiatla hemhâl olma sükûneti.' },
        { key: '05_Karadeniz/Bayburt', reason: 'Çoruh kıyısında gürültüden uzak, tevazusu ve dinginliğiyle gönlü dinlendiren şehir.' },
        { key: '05_Karadeniz/Gumushane', reason: 'Sarp dağlar arasında sade yaşamın ve azla yetinmenin vakur Anadolu örneği.' },
        { key: '06_DoguAnadolu/Erzincan', reason: 'Geniş ovası ve Fırat eşiğiyle ferahlık veren, sade ama derin bir yol durağı.' }
      ]
    },
    {
      id: 5,
      roman: 'V',
      slug: 'tevhid',
      arabicTitle: 'Vâdî-i Tevhîd',
      title: 'Tevhid (Kesrette Vahdet) Vadisi',
      shortTitle: 'Tevhid',
      minCities: 47,
      maxCities: 58,
      tagline: '7 bölgenin farklılığında tek bir medeniyet ruhunu görmek',
      accent: '#10b981',
      accentSoft: 'rgba(16, 185, 129, 0.16)',
      icon: '🧭',
      svgPos: { x: 632, y: 162 },
      sufiQuote: '“Kesrette boğulma; çokluk sandığın bütün renkler tek bir nurun tecellisidir.”',
      sufiSource: 'Ferîdüddin Attâr — Mantıku’t-Tayr',
      sufiMeaning:
        'Beşinci vadi Tevhid; çokluğun içinde birliği (kesrette vahdeti) görebilme basiretidir. Artık yolcu şivelerin, iklimlerin, taş işçiliğinin ve sofraların değiştiğini görür; fakat bütün bu zenginliğin altında aynı insanlık mayasının, aynı medeniyet ruhunun aktığını fark eder.',
      seferDiscipline:
        'Türkiye’nin 7 coğrafi bölgesini —Karadeniz’in sisinden Güneydoğu’nun taş konaklarına, Ege’nin zeytinliğinden Doğu’nun yaylalarına— ayrı kutuplar gibi değil, tek bir büyük nakışın tamamlayıcı desenleri olarak okuma makamıdır.',
      practices: [
        '7 bölgenin tamamında iz bırakarak Anadolu’nun bütünlüğünü bizzat müşahede etmek',
        'Farklı şehirlerin mimari ve mutfak dillerindeki ortak medeniyet köprüsünü not etmek',
        'Bölgeler arası önyargıları yol tecrübesiyle eritip bütüncül bir bakış kurmak'
      ],
      matchedProvinces: [
        { key: '03_Akdeniz/Hatay', reason: 'Farklı inançların, dillerin ve sofraların aynı sokakta kucaklaştığı birlik harcı.' },
        { key: '07_GuneydoguAnadolu/Mardin', reason: 'Sarı kalker taşlarında asırların çok sesli hoşgörüsünü taşıyan Mezopotamya balkonu.' },
        { key: '06_DoguAnadolu/Bitlis', reason: 'Ahlat Selçuklu Meydan Mezarlığı ile doğu-batı arasında kurulan kadim medeniyet mührü.' },
        { key: '01_Marmara/Canakkale', reason: '7 bölgeden gelen evlatların aynı siperde ve aynı duada birleştiği ortak hafıza.' },
        { key: '03_Akdeniz/Antalya', reason: 'Likya’dan Selçuklu’ya, Toros Yörüklerinden Akdeniz limanlarına uzanan tarih sentezi.' },
        { key: '07_GuneydoguAnadolu/Diyarbakir', reason: 'Bazalt surlarında otuzdan fazla medeniyetin izini tek çatı altında tutan kadim şehir.' }
      ]
    },
    {
      id: 6,
      roman: 'VI',
      slug: 'hayret',
      arabicTitle: 'Vâdî-i Hayret',
      title: 'Hayret Vadisi',
      shortTitle: 'Hayret',
      minCities: 59,
      maxCities: 70,
      tagline: 'Göbeklitepe’den Selimiye’ye zaman ve taş karşısında hayret makamı',
      accent: '#f59e0b',
      accentSoft: 'rgba(245, 158, 11, 0.16)',
      icon: '🏛️',
      svgPos: { x: 766, y: 118 },
      sufiQuote: '“Bu vadide söz susar, hayret konuşur; insan ne bildiğini değil, nasıl hayran kaldığını görür.”',
      sufiSource: 'Ferîdüddin Attâr — Mantıku’t-Tayr',
      sufiMeaning:
        'Tevhid’den sonra gelen Hayret vadisi; insanın kendi bildiklerinin küçük kalıplarının dağıldığı, zamanın derinliği ve sanatın ihtişamı karşısında sükûta vardığı makamdır. Bu hayret şaşkınlık değil, idrakin genişlemesinden doğan huşû dolu bir hayranlıktır.',
      seferDiscipline:
        '12 bin yıllık Göbeklitepe dikilitaşlarından Mimar Sinan’ın “ustalık eserim” dediği Selimiye kubbesine, Nemrut’un şafak vaktinden Ani’nin sessiz katedraline kadar zaman ve taş karşısında kelimelerin sustuğu anları yaşama disiplinidir.',
      practices: [
        'Büyük anıtların karşısında hızla fotoğraf çekmek yerine en az 20 dakika sessizce temaşa etmek',
        'Tarih öncesi çağlardan klasik Osmanlı mimarisine uzanan zaman ölçeğini tefekkür etmek',
        '“Bilmek” iddiasını bırakıp hayret ve hayranlık duygusunu diri tutmak'
      ],
      matchedProvinces: [
        { key: '07_GuneydoguAnadolu/Sanliurfa', reason: 'Göbeklitepe ve Karahantepe ile insanlık tarihinin sıfır noktasında yaşanan derin hayret.' },
        { key: '01_Marmara/Edirne', reason: 'Selimiye Camii’nin mekânı eriten kubbesi altında Mimar Sinan dehasına duyulan hayranlık.' },
        { key: '07_GuneydoguAnadolu/Adiyaman', reason: 'Nemrut Dağı’nın 2.150 metrelik zirvesinde güneşin doğuşuna tanıklık eden taş devler.' },
        { key: '06_DoguAnadolu/Kars', reason: 'Arpaçay kıyısındaki Ani Harabeleri’nde zamanın sesini dinleten büyülü sükût.' },
        { key: '02_Ege/Denizli', reason: 'Pamukkale’nin bembeyaz travertenleri ile Hierapolis’in antik mermerlerinin tabiat mucizesi.' },
        { key: '06_DoguAnadolu/Van', reason: 'Van Gölü’nün derin mavisi içinde Akdamar Adası ve Urartu kayalıklarının vakarı.' }
      ]
    },
    {
      id: 7,
      roman: 'VII',
      slug: 'vuslat',
      arabicTitle: 'Vâdî-i Fakr u Fenâ',
      title: 'Fakr u Fenâ & Vuslat Vadisi',
      shortTitle: 'Fakr & Vuslat',
      minCities: 71,
      maxCities: 81,
      tagline: '“Yolun kendisi menzildir” sırrına ermek',
      accent: '#fbbf24',
      accentSoft: 'rgba(251, 191, 36, 0.2)',
      icon: '🦅',
      svgPos: { x: 886, y: 74 },
      sufiQuote: '“Yedi vadiyi aşan otuz kuş aynaya baktı; aradıkları Sî-murg’un bizzat kendileri olduğunu gördü.”',
      sufiSource: 'Ferîdüddin Attâr — Mantıku’t-Tayr',
      sufiMeaning:
        'Yedinci ve son vadi olan Fakr u Fenâ’da yolcu, “Ben gezdim, ben başardım” enâniyetinden soyunur; yol ile yolcu arasındaki perde kalkar. Attâr’ın ölümsüz sırrı burada tecelli eder: Kaf Dağı’na varan otuz kuş (sî-murg), aradıkları Simurgh’un yolda dönüşen kendi hakikatleri olduğunu idrak eder.',
      seferDiscipline:
        '81 ilin tamamına erişen ya da son eşiğe varan seyyah için artık liste doldurmak değil, “Yolun kendisi menzildir” sırrıyla yaşamak esastır. Sefer der Vatan tamamlanır: insan şehirlere değil, şehirler insanın içine yerleşir.',
      practices: [
        '81 il tamamlandığında bunu bir kibir madalyası değil, şükür ve sorumluluk halkası saymak',
        'Elde edilen birikimi (notları, kütüphane disiplinini, tecrübeyi) başkalarına yol açacak şekilde paylaşmak',
        'Her sıradan günü ve kendi şehrini de aynı keşif hayretiyle yeniden okumak (Sefer der Vatan)'
      ],
      matchedProvinces: [
        { key: '06_DoguAnadolu/Agri', reason: 'Anadolu’nun çatısı Ağrı Dağı ve İshak Paşa Sarayı’nda göğe en yakın vuslat eşiği.' },
        { key: '06_DoguAnadolu/Hakkari', reason: 'Cilo-Sat zirveleri ve derin vadilerle ülkenin en doğu ucundaki sükût ve kemâl durağı.' },
        { key: '07_GuneydoguAnadolu/Gaziantep', reason: 'Emek, zanaat ve bereket sofrasında yol yorgunluğunun vuslat sevincine dönüştüğü şehir.' },
        { key: '05_Karadeniz/Trabzon', reason: 'Sümela’nın dik kayalıklarından Karadeniz ufkuna bakan kadim seyahat zirvesi.' },
        { key: '01_Marmara/Tekirdag', reason: 'Trakya kıyılarında seferi tamamlayıp ufuk çizgisini dinginlikle mühürleme durağı.' },
        { key: '07_GuneydoguAnadolu/Sirnak', reason: 'Cudi eteklerinde seyahatin son halkalarından birini gönül huzuruyla tamamlama menzili.' }
      ]
    }
  ];

  // ---------------------------------------------------------------------------
  // Threefold Sufi Doctrine of Travel (Sefer-i Sûrî, Manevî, Sefer der Vatan)
  // ---------------------------------------------------------------------------
  const SEFER_DOCTRINES = [
    {
      id: 'suri',
      title: 'Sefer-i Sûrî',
      subtitle: 'Zâhirî & Coğrafi Yolculuk',
      icon: '🗺️',
      accent: '#38bdf8',
      desc: 'Bedenin şehirleri, dağ geçitlerini, deniz kıyılarını ve bozkırı bizzat adımlaması; haritadaki isimlerin ayak izine dönüşmesi.'
    },
    {
      id: 'manevi',
      title: 'Sefer-i Manevî',
      subtitle: 'Bâtınî & İrfânî Derinleşme',
      icon: '🕯️',
      accent: '#a855f7',
      desc: '5 Gün Kuralı, İl Halk Kütüphanesi tefekkürü ve tek sırt çantası disipliniyle nefsin yedi vadiden geçerek olgunlaşması.'
    },
    {
      id: 'vatan',
      title: 'Sefer der Vatan',
      subtitle: 'Memlekete & Öze Dönüş',
      icon: '🕊️',
      accent: '#f59e0b',
      desc: 'Dışarıda aranan hikmetin iç âlemde ve kendi yurdunda yeniden bulunması; halk içinde Hak ile, yol hâlinde huzurda kalmak.'
    }
  ];

  // ---------------------------------------------------------------------------
  // Module UI State
  // ---------------------------------------------------------------------------
  const uiState = {
    selectedValleyId: null,
    selectedDoctrineId: 'manevi',
    aiOutputs: {},       // cacheKey -> { text, source, isLiveAI }
    aiLoadingKey: null,
    aiError: '',
    activeRequestId: 0,
    compassOpen: false,
    compassAnswers: {},  // qId -> valleyId
    noteDrafts: {}       // slug -> string
  };

  // ---------------------------------------------------------------------------
  // Per-Valley Personal Tefekkür Journal Storage
  // ---------------------------------------------------------------------------
  function loadValleyNotes() {
    try {
      const raw = localStorage.getItem(VALLEY_NOTES_STORAGE);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveValleyNotes(notesMap) {
    try {
      localStorage.setItem(VALLEY_NOTES_STORAGE, JSON.stringify(notesMap));
      return true;
    } catch (_) {
      return false;
    }
  }

  function getValleyNoteEntry(notesMap, slug) {
    const raw = notesMap && notesMap[slug];
    if (!raw) return { text: '', updatedAt: '' };
    if (typeof raw === 'string') return { text: raw, updatedAt: '' };
    return {
      text: typeof raw.text === 'string' ? raw.text : '',
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : ''
    };
  }

  function computeCompassResult(answers) {
    const ids = Object.values(answers || {}).filter((v) => Number.isFinite(Number(v)));
    if (ids.length < COMPASS_QUESTIONS.length) return null;
    const freq = {};
    ids.forEach((id) => {
      freq[id] = (freq[id] || 0) + 1;
    });
    let bestId = ids[0];
    let bestCount = 0;
    Object.keys(freq).forEach((k) => {
      const numId = Number(k);
      if (freq[k] > bestCount || (freq[k] === bestCount && numId > bestId)) {
        bestCount = freq[k];
        bestId = numId;
      }
    });
    return VALLEYS.find((v) => v.id === bestId) || VALLEYS[0];
  }

  // ---------------------------------------------------------------------------
  // Safe Helpers
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

  function defaultNormalizeTr(str) {
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

  function formatInlineMd(rawText, esc) {
    let safe = esc(rawText);
    safe = safe.replace(/`([^`]+?)`/g, '<code>$1</code>');
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/(^|[^\w*])\*([^\s*](?:[^*]*?[^\s*])?)\*(?=[^\w*]|$)/g, '$1<em>$2</em>');
    return safe;
  }

  function renderSafeMarkdown(md, esc) {
    if (window.SEYYAH_AI && typeof window.SEYYAH_AI.renderMarkdown === 'function') {
      return window.SEYYAH_AI.renderMarkdown(md, esc);
    }
    if (!md) return '';
    const lines = String(md).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let inList = false;

    function closeList() {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
    }

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].trim();
      if (!line) {
        closeList();
        continue;
      }
      const h = line.match(/^(#{1,4})\s+(.+)$/);
      if (h) {
        closeList();
        const lvl = h[1].length;
        out.push(`<h${lvl} class="seyyah-md-h${lvl}">${formatInlineMd(h[2], esc)}</h${lvl}>`);
        continue;
      }
      if (line.startsWith('> ')) {
        closeList();
        out.push(`<blockquote class="seyyah-md-quote">${formatInlineMd(line.slice(2), esc)}</blockquote>`);
        continue;
      }
      const li = line.match(/^[-*•]\s+(.+)$/);
      if (li) {
        if (!inList) {
          out.push('<ul class="seyyah-md-list">');
          inList = true;
        }
        out.push(`<li>${formatInlineMd(li[1], esc)}</li>`);
        continue;
      }
      closeList();
      out.push(`<p class="seyyah-md-p">${formatInlineMd(line, esc)}</p>`);
    }
    closeList();
    return out.join('\n');
  }

  function resolveData(ctx) {
    if (ctx && ctx.data) return ctx.data;
    if (typeof TRAVEL_DATA !== 'undefined' && TRAVEL_DATA) return TRAVEL_DATA;
    if (typeof window !== 'undefined' && window.TRAVEL_DATA) return window.TRAVEL_DATA;
    return { stats: {}, provinces: {}, regions: {} };
  }

  function computeTravelSnapshot(data) {
    const stats = (data && data.stats) || {};
    const provincesMap = (data && data.provinces) || {};
    const provinceEntries = Object.entries(provincesMap);

    let liveVisitedCount = 0;
    const visitedRegionsSet = new Set();

    for (let i = 0; i < provinceEntries.length; i += 1) {
      const p = provinceEntries[i][1];
      if (p && p.visited) {
        liveVisitedCount += 1;
        if (p.region_code) visitedRegionsSet.add(p.region_code);
      }
    }

    const totalCities = Number(stats.total_cities) || provinceEntries.length || 81;
    // Prefer live visited_cities from ctx.data.stats if provided, or province count
    const visitedCities =
      typeof stats.visited_cities === 'number'
        ? stats.visited_cities
        : liveVisitedCount;

    const clampedVisited = Math.max(0, Math.min(totalCities, visitedCities));
    const progressPct = totalCities > 0 ? ((clampedVisited / totalCities) * 100).toFixed(1) : '0.0';
    const estimatedKm = Number(stats.estimated_km) || clampedVisited * 279;
    const daysOnRoad = Number(stats.days_on_road) || clampedVisited * 5;
    const libraryHours = Number(stats.library_hours) || clampedVisited * 20;
    const visitedRegions = Number(stats.visited_regions) || visitedRegionsSet.size || 0;
    const totalRegions = Number(stats.total_regions) || 7;

    let activeValley = VALLEYS[0];
    if (clampedVisited >= 1) {
      for (let i = 0; i < VALLEYS.length; i += 1) {
        const v = VALLEYS[i];
        if (clampedVisited >= v.minCities && clampedVisited <= v.maxCities) {
          activeValley = v;
          break;
        }
      }
      if (clampedVisited > VALLEYS[VALLEYS.length - 1].maxCities) {
        activeValley = VALLEYS[VALLEYS.length - 1];
      }
    }

    return {
      totalCities,
      visitedCities: clampedVisited,
      remainingCities: Math.max(0, totalCities - clampedVisited),
      progressPct,
      estimatedKm,
      daysOnRoad,
      libraryHours,
      visitedRegions,
      totalRegions,
      activeValley,
      provincesMap
    };
  }

  function getValleyStatus(valley, visitedCities, activeValleyId) {
    if (visitedCities === 0) {
      return valley.id === 1 ? 'active' : 'upcoming';
    }
    if (valley.id < activeValleyId) return 'completed';
    if (valley.id === activeValleyId) return 'active';
    return 'upcoming';
  }

  function getValleyProgressInfo(valley, visitedCities, activeValleyId) {
    const status = getValleyStatus(valley, visitedCities, activeValleyId);
    const span = valley.maxCities - valley.minCities + 1;
    if (status === 'completed') {
      return {
        status,
        label: 'Aşıldı',
        badgeText: `✓ ${valley.minCities}–${valley.maxCities} İl Tamam`,
        pct: 100,
        detail: `Bu vadinin eşiği olan ${valley.maxCities}. ili geride bıraktın.`
      };
    }
    if (status === 'active') {
      const floorBase = valley.minCities - 1;
      const doneInValley = Math.max(0, Math.min(span, visitedCities - floorBase));
      const pct = Math.round((doneInValley / span) * 100);
      const nextStep = valley.id < 7 ? valley.maxCities + 1 : 81;
      const toNext = Math.max(0, nextStep - visitedCities);
      return {
        status,
        label: 'Aktif Makam',
        badgeText: `🔥 Aktif Vadi • ${visitedCities}/81 İl`,
        pct,
        detail:
          valley.id < 7
            ? `${visitedCities} il ile şu an bu vadidesin. Sonraki vadiye (${VALLEYS[valley.id].shortTitle}) ${toNext} il kaldı.`
            : `${visitedCities}/81 il ile zirve vadidesin; kalan ${Math.max(0, 81 - visitedCities)} il vuslatı tamamlayacak.`
      };
    }
    const needed = Math.max(0, valley.minCities - visitedCities);
    return {
      status,
      label: 'Ufuktaki Merhale',
      badgeText: `⏳ ${needed} il sonra açılır`,
      pct: 0,
      detail: `${valley.minCities}. il itibarıyla bu vadinin eşiğinden içeri adım atacaksın.`
    };
  }

  function resolveMatchedProvinces(valley, provincesMap) {
    return valley.matchedProvinces
      .map((item) => {
        const p = provincesMap[item.key];
        if (!p) return null;
        return {
          key: item.key,
          reason: item.reason,
          name: p.name || item.key.split('/')[1],
          plate: p.plate ? String(p.plate).padStart(2, '0') : '--',
          region: p.region || '',
          visited: Boolean(p.visited),
          landmark: Array.isArray(p.landmarks) && p.landmarks.length ? p.landmarks[0] : '',
          library: p.library ? String(p.library).split(' - ')[0] : '',
          quote: p.custom_quote || p.quote || ''
        };
      })
      .filter(Boolean);
  }

  // ---------------------------------------------------------------------------
  // AI Prompt & Offline Reflection Fallback Generator
  // ---------------------------------------------------------------------------
  function buildValleyAiPrompt(valley, snapshot, matchedList) {
    const visitedInValley = matchedList.filter((m) => m.visited).map((m) => m.name);
    const unvisitedInValley = matchedList.filter((m) => !m.visited).map((m) => m.name);
    const status = getValleyStatus(valley, snapshot.visitedCities, snapshot.activeValley.id);
    const statusText =
      status === 'completed'
        ? 'Bu vadi daha önce aşılmış durumda.'
        : status === 'active'
          ? `Seyyah şu an ${snapshot.visitedCities}/81 il ile tam bu vadinin içinde yürüyor.`
          : `Seyyah henüz ${snapshot.visitedCities}/81 ilde; bu vadi ilerideki ufuk merhalesi.`;

    const anatoliaCtx =
      window.SEYYAH_AI && typeof window.SEYYAH_AI.buildAnatoliaContext === 'function'
        ? window.SEYYAH_AI.buildAnatoliaContext({ data: { provinces: snapshot.provincesMap, stats: { visited_cities: snapshot.visitedCities } } })
        : `Gezilen İl: ${snapshot.visitedCities}/${snapshot.totalCities}`;

    return {
      system:
        'Sen "Dijital Seyyah: Anadolu Seyahatnamesi" projesinin tasavvuf, edebiyat ve sefer felsefesi mürşidisin. ' +
        'Ferîdüddin Attâr’ın Mantıku’t-Tayr eseri ile Sefer-i Sûrî, Sefer-i Manevî ve Sefer der Vatan kavramlarını ' +
        'modern "Dijital Seyyah" pratiğine (5 Gün Kuralı, İl Halk Kütüphanesi, GSB kervansarayları, tek sırt çantası) zarif bir Türkçeyle bağla. ' +
        'Yanıtını okunaklı Markdown başlıkları (###), kısa paragraflar, madde işaretleri ve bir kapanış hikmet cümlesiyle (>) kur.',
      prompt:
        `Vadi: ${valley.roman}. ${valley.title} (${valley.arabicTitle}) — ${valley.minCities}–${valley.maxCities} İl\n` +
        `Ana Tema: ${valley.tagline}\n` +
        `Seyyahın Durumu: ${statusText}\n` +
        `Özet İstatistikler: ${snapshot.visitedCities}/81 il, ${snapshot.visitedRegions}/7 bölge, ~${snapshot.estimatedKm} km, ${snapshot.libraryHours} saat kütüphane mesaisi.\n` +
        `Bu vadideki gezilmiş örnek iller: ${visitedInValley.length ? visitedInValley.join(', ') : 'Henüz yok'}\n` +
        `Bu vadideki sıradaki/hedef iller: ${unvisitedInValley.length ? unvisitedInValley.join(', ') : 'Tümü gezildi'}\n` +
        `Ek Bağlam:\n${anatoliaCtx}\n\n` +
        `Lütfen şu 4 başlıkla derin, özgün ve uygulanabilir bir Vadi Tefekkürü yaz:\n` +
        `### 1. ${valley.shortTitle} Vadisinin Tasavvufî Sırrı\n` +
        `### 2. Sefer-i Sûrî, Sefer-i Manevî ve Sefer der Vatan Açısından Mevcut Konumun\n` +
        `### 3. Anadolu Coğrafyasında Yansıması (${matchedList.slice(0, 3).map((m) => m.name).join(', ')} üzerinden)\n` +
        `### 4. Bu Vadi İçin 3 Somut Seyyah Ameli\n` +
        `Sonuna tek cümlelik çarpıcı bir ">" hikmet alıntısı ekle.`
    };
  }

  function buildOfflineValleyReflection(valley, snapshot, matchedList) {
    const visitedNames = matchedList.filter((m) => m.visited).map((m) => m.name);
    const unvisitedNames = matchedList.filter((m) => !m.visited).map((m) => m.name);
    const statusInfo = getValleyProgressInfo(valley, snapshot.visitedCities, snapshot.activeValley.id);

    let positionSentence = '';
    if (statusInfo.status === 'active') {
      positionSentence =
        `Şu anda **${snapshot.visitedCities}/81 il** (%${snapshot.progressPct}) ile doğrudan **${valley.title}** içindesin. ` +
        `Bugüne dek katettiğin **~${snapshot.estimatedKm.toLocaleString('tr-TR')} km** yol (*Sefer-i Sûrî*) ve İl Halk Kütüphanelerinde biriktirdiğin ` +
        `**${snapshot.libraryHours} saat** tefekkür mesaisi (*Sefer-i Manevî*), seni bu makamın olgunluğuna taşıdı.`;
    } else if (statusInfo.status === 'completed') {
      positionSentence =
        `Şu an **${snapshot.visitedCities}/81 il** ile bu vadiyi aşmış ve **${snapshot.activeValley.title}** merhalesine yükselmiş durumdasın. ` +
        `Ancak tasavvufta her aşılan vadi geride bırakılmaz; **Sefer der Vatan** gereği, ${valley.shortTitle} hâli sonraki tüm menzillerin içinde yaşamaya devam eder.`;
    } else {
      const needed = Math.max(1, valley.minCities - snapshot.visitedCities);
      positionSentence =
        `Şu an **${snapshot.visitedCities}/81 il** ile **${snapshot.activeValley.title}** makamındasın; **${valley.title}** eşiğine ulaşmana **${needed} il** var. ` +
        `Bu vadi senin için şimdiden ufukta parlayan bir niyet yıldızıdır; bugünkü kütüphane disiplinin ve yol sadeliğin yarınki bu kapıyı aralayacaktır.`;
    }

    const geoLine = visitedNames.length && unvisitedNames.length
      ? `Bu vadinin Anadolu’daki timsallerinden **${visitedNames.join(', ')}** topraklarında zaten ayak izin var; sıradaki **${unvisitedNames.slice(0, 3).join(', ')}** menzilleri ise bu makamın hikmetini tamamlaman için seni bekliyor.`
      : visitedNames.length
        ? `Bu vadinin Anadolu’daki temsilcileri olan **${visitedNames.join(', ')}** illerinin tamamını adımlayarak vadinin coğrafi şahitliğini tamamlamışsın.`
        : `Bu vadinin ruhunu en berrak taşıyan **${unvisitedNames.slice(0, 4).join(', ')}** menzilleri, sıradaki sefer defterinin başköşesinde seni bekliyor.`;

    return [
      `### 1. ${valley.shortTitle} Vadisinin Tasavvufî Sırrı (${valley.arabicTitle})`,
      `${valley.sufiMeaning}`,
      '',
      `### 2. Üçlü Sefer Doktrini ve Mevcut Konumun`,
      `${positionSentence}`,
      `- **Sefer-i Sûrî:** ${snapshot.visitedCities} il ve ${snapshot.visitedRegions}/7 bölgede atılan gerçek adımlar.`,
      `- **Sefer-i Manevî:** ${snapshot.daysOnRoad} günlük sindirilmiş sefer ve kütüphane sessizliğinde içe dönüş.`,
      `- **Sefer der Vatan:** ${valley.seferDiscipline}`,
      '',
      `### 3. Anadolu Coğrafyasındaki Yansıması`,
      `${geoLine}`,
      '',
      `### 4. Bu Vadi İçin 3 Somut Seyyah Ameli`,
      ...valley.practices.map((p) => `- ${p}`),
      '',
      `> ${valley.sufiQuote} — *${valley.sufiSource}*`
    ].join('\n');
  }

  // ---------------------------------------------------------------------------
  // Scoped CSS (Dark Obsidian & Light Alabaster Compatible)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .svs-shell {
        max-width: 1240px;
        margin: 0 auto;
        padding: 4px 2px 36px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        color: var(--text-primary, #f8fafc);
        animation: svsFadeIn 0.35s ease;
      }

      @keyframes svsFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes svsPulseHalo {
        0%, 100% { transform: scale(1); opacity: 0.72; }
        50% { transform: scale(1.18); opacity: 0.25; }
      }

      @keyframes svsBirdFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }

      /* Hero Banner */
      .svs-hero {
        position: relative;
        border-radius: 22px;
        padding: 24px 26px;
        background:
          radial-gradient(circle at 88% 18%, rgba(251, 191, 36, 0.16), transparent 44%),
          radial-gradient(circle at 10% 88%, rgba(0, 242, 254, 0.14), transparent 46%),
          var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        overflow: hidden;
      }

      .svs-hero-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
        flex-wrap: wrap;
      }

      .svs-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.28);
        padding: 5px 12px;
        border-radius: 999px;
        margin-bottom: 10px;
      }

      .svs-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.38rem, 2.5vw, 1.95rem);
        font-weight: 800;
        line-height: 1.22;
        margin: 0 0 8px;
        background: linear-gradient(135deg, #f8fafc 10%, #fbbf24 55%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .svs-subtitle {
        max-width: 740px;
        font-size: 0.92rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.6;
        margin: 0;
      }

      .svs-hero-meter {
        min-width: 245px;
        padding: 14px 16px;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.56);
        border: 1px solid rgba(0, 242, 254, 0.28);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .svs-meter-label {
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted, #94a3b8);
        font-weight: 700;
      }

      .svs-meter-value {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
      }

      .svs-meter-value strong {
        font-size: 1.45rem;
        color: var(--accent-cyan, #00f2fe);
      }

      .svs-meter-value span {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--accent-gold, #f59e0b);
      }

      .svs-meter-bar {
        width: 100%;
        height: 7px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }

      .svs-meter-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent-cyan, #00f2fe), var(--accent-emerald, #10b981), var(--accent-gold, #f59e0b));
        transition: width 0.5s ease;
      }

      .svs-meter-active-name {
        font-size: 0.78rem;
        color: var(--text-secondary, #cbd5e1);
        line-height: 1.35;
      }

      /* Threefold Sefer Doctrine Strip */
      .svs-doctrine-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-top: 18px;
      }

      .svs-doctrine-card {
        text-align: left;
        cursor: pointer;
        border-radius: 15px;
        padding: 13px 15px;
        background: rgba(15, 23, 42, 0.48);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        color: inherit;
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .svs-doctrine-card:hover {
        transform: translateY(-2px);
        border-color: var(--svs-doc-accent, #00f2fe);
      }

      .svs-doctrine-card.active {
        border-color: var(--svs-doc-accent, #00f2fe);
        box-shadow: 0 0 0 1px var(--svs-doc-accent, #00f2fe), 0 8px 22px rgba(0, 0, 0, 0.22);
      }

      .svs-doctrine-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .svs-doctrine-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-weight: 700;
        font-size: 0.95rem;
      }

      .svs-doctrine-stat {
        font-size: 0.73rem;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: var(--svs-doc-accent, #00f2fe);
        white-space: nowrap;
      }

      .svs-doctrine-sub {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted, #94a3b8);
      }

      .svs-doctrine-desc {
        font-size: 0.8rem;
        color: var(--text-secondary, #cbd5e1);
        line-height: 1.48;
      }

      /* Interactive SVG Mountain Ascent Card */
      .svs-map-section {
        border-radius: 22px;
        padding: 20px 22px;
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(14px);
      }

      .svs-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 14px;
      }

      .svs-section-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.08rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .svs-legend {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      .svs-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .svs-legend-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
      }

      .svs-svg-wrap {
        position: relative;
        width: 100%;
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: linear-gradient(180deg, #070d1d 0%, #0d1930 60%, #101f3a 100%);
      }

      .svs-svg {
        display: block;
        width: 100%;
        height: auto;
        min-height: 250px;
      }

      .svs-svg-node {
        cursor: pointer;
        outline: none;
        transition: transform 0.2s ease;
      }

      .svs-svg-node:hover .svs-node-core,
      .svs-svg-node:focus-visible .svs-node-core {
        filter: brightness(1.25);
        stroke-width: 3.5;
      }

      .svs-svg-pulse {
        transform-box: fill-box;
        transform-origin: center;
        animation: svsPulseHalo 2.4s ease-in-out infinite;
      }

      .svs-svg-bird {
        animation: svsBirdFloat 2.8s ease-in-out infinite;
      }

      .svs-svg-label-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 12px;
        font-weight: 700;
        fill: #f8fafc;
      }

      .svs-svg-label-range {
        font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
        font-size: 10px;
        font-weight: 600;
        fill: #94a3b8;
      }

      /* 7-Step Quick Selector Pills */
      .svs-pills-row {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 8px;
        margin-top: 14px;
      }

      .svs-valley-pill {
        cursor: pointer;
        border-radius: 12px;
        padding: 9px 8px;
        text-align: center;
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        color: var(--text-secondary, #cbd5e1);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        transition: all 0.2s ease;
      }

      .svs-valley-pill:hover {
        border-color: var(--svs-v-accent, #00f2fe);
        transform: translateY(-2px);
      }

      .svs-valley-pill.selected {
        background: var(--svs-v-soft, rgba(0, 242, 254, 0.16));
        border-color: var(--svs-v-accent, #00f2fe);
        color: var(--text-primary, #f8fafc);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
      }

      .svs-pill-top {
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--svs-v-accent, #00f2fe);
      }

      .svs-pill-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.78rem;
        font-weight: 700;
        line-height: 1.2;
      }

      .svs-pill-range {
        font-size: 0.68rem;
        color: var(--text-muted, #94a3b8);
      }

      /* Selected Valley Detail Studio */
      .svs-detail-card {
        border-radius: 22px;
        padding: 24px;
        background: var(--bg-card, rgba(30, 41, 59, 0.76));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(14px);
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .svs-detail-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .svs-detail-badge-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 8px;
      }

      .svs-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.74rem;
        font-weight: 700;
        padding: 4px 11px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      .svs-badge.active {
        background: rgba(0, 242, 254, 0.15);
        border-color: rgba(0, 242, 254, 0.45);
        color: #67e8f9;
      }

      .svs-badge.completed {
        background: rgba(16, 185, 129, 0.16);
        border-color: rgba(16, 185, 129, 0.4);
        color: #6ee7b7;
      }

      .svs-badge.upcoming {
        background: rgba(245, 158, 11, 0.14);
        border-color: rgba(245, 158, 11, 0.35);
        color: #fcd34d;
      }

      .svs-detail-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.25rem, 2.2vw, 1.65rem);
        font-weight: 800;
        margin: 0 0 4px;
      }

      .svs-detail-tagline {
        font-size: 0.94rem;
        color: var(--text-secondary, #cbd5e1);
        margin: 0;
      }

      .svs-quote-box {
        max-width: 420px;
        padding: 12px 15px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.5);
        border-left: 3px solid var(--svs-v-accent, #f59e0b);
        font-size: 0.84rem;
        font-style: italic;
        color: var(--text-secondary, #cbd5e1);
        line-height: 1.5;
      }

      .svs-quote-src {
        display: block;
        margin-top: 5px;
        font-style: normal;
        font-size: 0.74rem;
        font-weight: 700;
        color: var(--svs-v-accent, #f59e0b);
      }

      /* Dual Meaning & Discipline Grid */
      .svs-wisdom-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .svs-wisdom-box {
        border-radius: 16px;
        padding: 18px;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.09));
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .svs-wisdom-box h4 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1rem;
        font-weight: 700;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .svs-wisdom-box p {
        font-size: 0.88rem;
        color: var(--text-secondary, #cbd5e1);
        line-height: 1.62;
        margin: 0;
      }

      .svs-practice-list {
        list-style: none;
        padding: 0;
        margin: 4px 0 0;
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .svs-practice-list li {
        font-size: 0.83rem;
        color: var(--text-primary, #e2e8f0);
        padding: 7px 10px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }

      /* Matched Anatolian Provinces */
      .svs-provinces-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
      }

      .svs-provinces-head h4 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1rem;
        font-weight: 700;
        margin: 0;
      }

      .svs-provinces-count {
        font-size: 0.78rem;
        color: var(--text-muted, #94a3b8);
      }

      .svs-provinces-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .svs-prov-card {
        text-align: left;
        cursor: pointer;
        border-radius: 14px;
        padding: 13px 14px;
        background: rgba(15, 23, 42, 0.48);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        color: inherit;
        display: flex;
        flex-direction: column;
        gap: 7px;
        transition: transform 0.2s ease, border-color 0.2s ease;
      }

      .svs-prov-card:hover {
        transform: translateY(-2px);
        border-color: var(--svs-v-accent, #00f2fe);
      }

      .svs-prov-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .svs-prov-name {
        display: flex;
        align-items: center;
        gap: 7px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-weight: 700;
        font-size: 0.94rem;
      }

      .svs-plate {
        font-size: 0.72rem;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.1);
      }

      .svs-prov-status {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
      }

      .svs-prov-status.visited {
        background: rgba(16, 185, 129, 0.16);
        color: #6ee7b7;
      }

      .svs-prov-status.pending {
        background: rgba(148, 163, 184, 0.15);
        color: #94a3b8;
      }

      .svs-prov-reason {
        font-size: 0.8rem;
        color: var(--text-secondary, #cbd5e1);
        line-height: 1.45;
      }

      .svs-prov-meta {
        font-size: 0.73rem;
        color: var(--text-muted, #94a3b8);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        margin-top: auto;
      }

      /* AI Reflection Studio */
      .svs-ai-panel {
        border-radius: 18px;
        padding: 18px 20px;
        background:
          linear-gradient(135deg, rgba(0, 242, 254, 0.08), rgba(168, 85, 247, 0.08)),
          rgba(15, 23, 42, 0.56);
        border: 1px solid rgba(0, 242, 254, 0.25);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .svs-ai-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
      }

      .svs-ai-cta {
        cursor: pointer;
        border: none;
        border-radius: 12px;
        padding: 11px 18px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.92rem;
        font-weight: 700;
        color: #06101f;
        background: linear-gradient(135deg, var(--accent-cyan, #00f2fe), var(--accent-gold, #f59e0b));
        box-shadow: 0 8px 20px rgba(0, 242, 254, 0.22);
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: transform 0.2s ease, opacity 0.2s ease;
      }

      .svs-ai-cta:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      .svs-ai-cta:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      .svs-ai-source {
        font-size: 0.76rem;
        font-weight: 600;
        color: var(--text-secondary, #94a3b8);
        padding: 5px 11px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .svs-ai-output {
        padding: 14px 16px;
        border-radius: 14px;
        background: rgba(8, 13, 27, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 0.9rem;
        line-height: 1.65;
        color: var(--text-primary, #f1f5f9);
      }

      .svs-ai-output h3,
      .svs-ai-output .seyyah-md-h3 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1rem;
        color: var(--accent-cyan, #00f2fe);
        margin: 12px 0 6px;
      }

      .svs-ai-output h3:first-child,
      .svs-ai-output .seyyah-md-h3:first-child {
        margin-top: 0;
      }

      .svs-ai-output .seyyah-md-p {
        margin: 0 0 8px;
      }

      .svs-ai-output .seyyah-md-list {
        margin: 4px 0 10px 18px;
      }

      .svs-ai-output .seyyah-md-quote {
        margin: 10px 0 0;
        padding: 10px 14px;
        border-left: 3px solid var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.08);
        border-radius: 0 10px 10px 0;
        font-style: italic;
      }

      /* İçsel Pusula ("Hangi Vadidesin?") Card */
      .svs-compass-card {
        border-radius: 18px;
        padding: 16px 20px;
        background:
          linear-gradient(135deg, rgba(245, 158, 11, 0.09), rgba(0, 242, 254, 0.07)),
          var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid rgba(245, 158, 11, 0.28);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .svs-compass-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
      }

      .svs-compass-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .svs-compass-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
      }

      .svs-compass-desc {
        font-size: 0.84rem;
        color: var(--text-secondary, #cbd5e1);
        margin: 0;
        line-height: 1.5;
      }

      .svs-compass-actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .svs-btn-ghost {
        cursor: pointer;
        border-radius: 11px;
        padding: 8px 13px;
        font-family: inherit;
        font-size: 0.82rem;
        font-weight: 700;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: var(--text-primary, #f8fafc);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .svs-btn-ghost:hover {
        border-color: var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.14);
        transform: translateY(-1px);
      }

      .svs-btn-gold {
        cursor: pointer;
        border-radius: 11px;
        padding: 8px 14px;
        font-family: inherit;
        font-size: 0.82rem;
        font-weight: 700;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(0, 242, 254, 0.18));
        border: 1px solid rgba(245, 158, 11, 0.42);
        color: var(--text-primary, #f8fafc);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .svs-btn-gold:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(245, 158, 11, 0.2);
      }

      .svs-compass-quiz {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .svs-compass-q {
        padding: 12px 14px;
        border-radius: 13px;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .svs-compass-q-prompt {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      .svs-compass-opts {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .svs-compass-opt {
        text-align: left;
        cursor: pointer;
        padding: 8px 11px;
        border-radius: 10px;
        font-family: inherit;
        font-size: 0.8rem;
        line-height: 1.4;
        color: var(--text-secondary, #cbd5e1);
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.18s ease;
      }

      .svs-compass-opt:hover {
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
      }

      .svs-compass-opt.selected {
        background: rgba(0, 242, 254, 0.16);
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
        font-weight: 600;
      }

      .svs-compass-result {
        padding: 13px 15px;
        border-radius: 13px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.35);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
        font-size: 0.86rem;
      }

      /* Per-Valley Personal Tefekkür Journal */
      .svs-journal-panel {
        border-radius: 18px;
        padding: 18px 20px;
        background: rgba(15, 23, 42, 0.48);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .svs-journal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
      }

      .svs-journal-head h4 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1rem;
        font-weight: 700;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .svs-journal-meta {
        font-size: 0.76rem;
        color: var(--text-muted, #94a3b8);
      }

      .svs-journal-textarea {
        width: 100%;
        min-height: 108px;
        resize: vertical;
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(8, 13, 27, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.88rem;
        line-height: 1.6;
        outline: none;
        transition: border-color 0.2s ease;
        box-sizing: border-box;
      }

      .svs-journal-textarea:focus {
        border-color: var(--svs-v-accent, #00f2fe);
      }

      .svs-journal-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
      }

      .svs-journal-btns {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .svs-saved-strip {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 7px;
        padding-top: 10px;
        border-top: 1px dashed rgba(255, 255, 255, 0.1);
      }

      .svs-saved-chip {
        cursor: pointer;
        border-radius: 999px;
        padding: 4px 11px;
        font-size: 0.75rem;
        font-weight: 600;
        font-family: inherit;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.3);
        color: var(--text-primary, #f8fafc);
        transition: all 0.18s ease;
      }

      .svs-saved-chip:hover {
        background: rgba(245, 158, 11, 0.24);
      }

      .svs-saved-preview {
        padding: 11px 14px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        border-left: 3px solid var(--svs-v-accent, #f59e0b);
        font-size: 0.85rem;
        line-height: 1.58;
        color: var(--text-secondary, #cbd5e1);
        white-space: pre-wrap;
      }

      /* ---------------------------------------------------------------------
         Light Theme Overrides (body.light-theme)
         --------------------------------------------------------------------- */
      body.light-theme .svs-title {
        background: linear-gradient(135deg, #0f172a 10%, #b45309 55%, #0284c7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .svs-hero-meter,
      body.light-theme .svs-doctrine-card,
      body.light-theme .svs-valley-pill,
      body.light-theme .svs-quote-box,
      body.light-theme .svs-wisdom-box,
      body.light-theme .svs-prov-card {
        background: rgba(241, 245, 249, 0.9);
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      body.light-theme .svs-meter-bar {
        background: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .svs-meter-active-name,
      body.light-theme .svs-doctrine-desc,
      body.light-theme .svs-wisdom-box p,
      body.light-theme .svs-prov-reason,
      body.light-theme .svs-quote-box {
        color: #334155;
      }

      body.light-theme .svs-practice-list li {
        background: rgba(255, 255, 255, 0.88);
        border-color: rgba(15, 23, 42, 0.08);
        color: #0f172a;
      }

      body.light-theme .svs-plate {
        background: #e2e8f0;
        color: #0f172a;
      }

      body.light-theme .svs-doctrine-stat {
        background: rgba(15, 23, 42, 0.06);
      }

      body.light-theme .svs-badge.active {
        color: #0369a1;
      }

      body.light-theme .svs-badge.completed {
        color: #047857;
      }

      body.light-theme .svs-badge.upcoming {
        color: #b45309;
      }

      body.light-theme .svs-prov-status.visited {
        color: #047857;
      }

      body.light-theme .svs-prov-status.pending {
        color: #475569;
      }

      body.light-theme .svs-svg-wrap {
        background: linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 55%, #f8fafc 100%);
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .svs-svg-sky-star {
        opacity: 0.25;
      }

      body.light-theme .svs-svg-ridge-1 { fill: #dbeafe; }
      body.light-theme .svs-svg-ridge-2 { fill: #cbd5e1; }
      body.light-theme .svs-svg-ridge-3 { fill: #e2e8f0; }

      body.light-theme .svs-svg-label-title {
        fill: #0f172a;
      }

      body.light-theme .svs-svg-label-range {
        fill: #475569;
      }

      body.light-theme .svs-ai-panel {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.08), rgba(124, 58, 237, 0.06)), rgba(255, 255, 255, 0.92);
        border-color: rgba(2, 132, 199, 0.28);
      }

      body.light-theme .svs-ai-output {
        background: rgba(248, 250, 252, 0.96);
        border-color: rgba(15, 23, 42, 0.1);
        color: #0f172a;
      }

      body.light-theme .svs-ai-output h3,
      body.light-theme .svs-ai-output .seyyah-md-h3 {
        color: #0284c7;
      }

      body.light-theme .svs-ai-source {
        background: rgba(15, 23, 42, 0.06);
        border-color: rgba(15, 23, 42, 0.12);
        color: #334155;
      }

      body.light-theme .svs-compass-card {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(2, 132, 199, 0.06)), rgba(255, 255, 255, 0.94);
        border-color: rgba(180, 83, 9, 0.25);
        color: #0f172a;
      }

      body.light-theme .svs-compass-desc,
      body.light-theme .svs-compass-opt,
      body.light-theme .svs-saved-preview {
        color: #334155;
      }

      body.light-theme .svs-compass-q,
      body.light-theme .svs-journal-panel {
        background: rgba(241, 245, 249, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      body.light-theme .svs-compass-q-prompt {
        color: #0f172a;
      }

      body.light-theme .svs-compass-opt {
        background: rgba(255, 255, 255, 0.88);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .svs-compass-opt.selected {
        background: rgba(2, 132, 199, 0.12);
        border-color: #0284c7;
        color: #0c4a6e;
      }

      body.light-theme .svs-btn-ghost,
      body.light-theme .svs-btn-gold,
      body.light-theme .svs-saved-chip {
        color: #0f172a;
        background: rgba(15, 23, 42, 0.06);
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .svs-btn-gold {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(2, 132, 199, 0.12));
        border-color: rgba(180, 83, 9, 0.35);
      }

      body.light-theme .svs-journal-textarea {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.16);
        color: #0f172a;
      }

      body.light-theme .svs-saved-preview {
        background: rgba(255, 255, 255, 0.88);
      }

      @media (max-width: 980px) {
        .svs-doctrine-grid,
        .svs-provinces-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .svs-pills-row {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .svs-wisdom-grid,
        .svs-compass-opts {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .svs-hero,
        .svs-map-section,
        .svs-detail-card {
          padding: 16px;
        }
        .svs-doctrine-grid,
        .svs-provinces-grid,
        .svs-pills-row {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // SVG Mountain Ascent Map Builder
  // ---------------------------------------------------------------------------
  function buildMountainSvg(snapshot, selectedValleyId, esc) {
    const activeId = snapshot.activeValley.id;
    const points = VALLEYS.map((v) => v.svgPos);

    // Build smooth cubic path segments between valleys
    function buildPathSegment(pts) {
      if (pts.length < 2) return '';
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i += 1) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cx = (p0.x + p1.x) / 2;
        d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
      }
      return d;
    }

    const fullPathD = buildPathSegment(points);
    const activeIndex = Math.max(0, VALLEYS.findIndex((v) => v.id === activeId));
    const completedPathD = buildPathSegment(points.slice(0, activeIndex + 1));

    const stars = [
      [85, 58, 1.4], [160, 92, 1.1], [240, 46, 1.6], [330, 74, 1.2],
      [430, 42, 1.5], [520, 80, 1.1], [610, 48, 1.4], [705, 62, 1.2],
      [805, 36, 1.7], [918, 128, 1.3], [140, 148, 1.1], [470, 118, 1.2]
    ]
      .map(
        ([x, y, r]) =>
          `<circle class="svs-svg-sky-star" cx="${x}" cy="${y}" r="${r}" fill="#e2e8f0" opacity="0.65" />`
      )
      .join('');

    const nodesMarkup = VALLEYS.map((v) => {
      const status = getValleyStatus(v, snapshot.visitedCities, activeId);
      const isSelected = v.id === selectedValleyId;
      const { x, y } = v.svgPos;

      const coreFill =
        status === 'completed'
          ? '#10b981'
          : status === 'active'
            ? '#00f2fe'
            : '#334155';
      const strokeColor = isSelected ? '#fbbf24' : v.accent;
      const strokeW = isSelected ? 3.5 : 2;
      const radius = status === 'active' || isSelected ? 21 : 17;
      const labelYOffset = v.id % 2 === 0 ? -31 : 36;
      const rangeYOffset = v.id % 2 === 0 ? -18 : 49;

      const pulseHalo =
        status === 'active'
          ? `<circle class="svs-svg-pulse" cx="${x}" cy="${y}" r="31" fill="none" stroke="${v.accent}" stroke-width="2" opacity="0.7" />`
          : '';

      const selectedRing = isSelected
        ? `<circle cx="${x}" cy="${y}" r="27" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4 3" />`
        : '';

      const activeBirdBadge =
        status === 'active'
          ? `
            <g class="svs-svg-bird" transform="translate(${x}, ${y - 44})">
              <rect x="-54" y="-13" width="108" height="22" rx="11" fill="#06101f" stroke="#00f2fe" stroke-width="1.2" opacity="0.92" />
              <text x="0" y="2" text-anchor="middle" font-size="10.5" font-weight="700" fill="#67e8f9">🕊️ Buradasın (${snapshot.visitedCities}/81)</text>
            </g>
          `
          : '';

      const ariaLabel = `${v.roman}. ${v.title} (${v.minCities}–${v.maxCities} İl) - ${
        status === 'completed' ? 'Aşıldı' : status === 'active' ? 'Aktif Vadi' : 'Ufuktaki Merhale'
      }`;

      return `
        <g
          class="svs-svg-node"
          data-svs-valley="${v.id}"
          role="button"
          tabindex="0"
          aria-label="${esc(ariaLabel)}"
        >
          ${pulseHalo}
          ${selectedRing}
          <circle
            class="svs-node-core"
            cx="${x}"
            cy="${y}"
            r="${radius}"
            fill="${coreFill}"
            fill-opacity="${status === 'upcoming' ? '0.78' : '0.95'}"
            stroke="${strokeColor}"
            stroke-width="${strokeW}"
          />
          <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14">${v.icon}</text>
          <text class="svs-svg-label-title" x="${x}" y="${y + labelYOffset}" text-anchor="middle">${esc(v.roman + '. ' + v.shortTitle)}</text>
          <text class="svs-svg-label-range" x="${x}" y="${y + rangeYOffset}" text-anchor="middle">${v.minCities}–${v.maxCities} İl</text>
          ${activeBirdBadge}
        </g>
      `;
    }).join('');

    return `
      <svg class="svs-svg" viewBox="0 0 980 420" role="img" aria-label="Mantıku't-Tayr Yedi Vadi Kaf Dağı Yükseliş Haritası">
        <defs>
          <linearGradient id="svsPathDone" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="55%" stop-color="#10b981" />
            <stop offset="100%" stop-color="#00f2fe" />
          </linearGradient>
          <radialGradient id="svsSimurghGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.55" />
            <stop offset="65%" stop-color="#f59e0b" stop-opacity="0.14" />
            <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Celestial Starfield & Simurgh Peak Aura -->
        ${stars}
        <circle cx="886" cy="74" r="95" fill="url(#svsSimurghGlow)" />
        <circle cx="886" cy="74" r="54" fill="none" stroke="#fbbf24" stroke-width="1" stroke-dasharray="3 5" opacity="0.45" />

        <!-- Layered Kaf Dağı Mountain Silhouettes -->
        <path class="svs-svg-ridge-1" d="M 0 420 L 0 315 L 140 250 L 295 292 L 455 190 L 620 225 L 785 110 L 895 72 L 980 128 L 980 420 Z" fill="#0f213d" opacity="0.82" />
        <path class="svs-svg-ridge-2" d="M 0 420 L 0 350 L 180 286 L 345 318 L 515 228 L 690 256 L 835 162 L 980 205 L 980 420 Z" fill="#13294b" opacity="0.88" />
        <path class="svs-svg-ridge-3" d="M 0 420 L 0 375 L 220 335 L 410 356 L 600 286 L 775 305 L 980 252 L 980 420 Z" fill="#183258" opacity="0.92" />

        <!-- Future Path (Dashed Astral Trail) -->
        <path d="${fullPathD}" fill="none" stroke="#64748b" stroke-width="3" stroke-dasharray="7 7" opacity="0.55" />

        <!-- Completed / Active Path -->
        ${completedPathD ? `<path d="${completedPathD}" fill="none" stroke="url(#svsPathDone)" stroke-width="4.5" stroke-linecap="round" />` : ''}

        <!-- Kaf Dağı Summit Caption -->
        <text x="886" y="28" text-anchor="middle" font-size="11" font-weight="700" fill="#fbbf24" opacity="0.9">KAF DAĞI • SÎ-MURG ZİRVESİ</text>

        <!-- Interactive 7 Valley Nodes -->
        ${nodesMarkup}
      </svg>
    `;
  }

  // ---------------------------------------------------------------------------
  // Main Render Function
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const esc = ctx && typeof ctx.escapeHtml === 'function' ? ctx.escapeHtml : defaultEscapeHtml;
    const data = resolveData(ctx);
    const snapshot = computeTravelSnapshot(data);

    if (!uiState.selectedValleyId || !VALLEYS.some((v) => v.id === uiState.selectedValleyId)) {
      uiState.selectedValleyId = snapshot.activeValley.id;
    }

    function getDoctrineStat(docId) {
      if (docId === 'suri') {
        return `${snapshot.visitedCities}/${snapshot.totalCities} İl • ~${snapshot.estimatedKm.toLocaleString('tr-TR')} km`;
      }
      if (docId === 'manevi') {
        return `${snapshot.libraryHours} sa. kütüphane • ${snapshot.daysOnRoad} gün`;
      }
      return `${snapshot.visitedRegions}/${snapshot.totalRegions} Bölge • ${snapshot.remainingCities} menzil kaldı`;
    }

    function updateAiDomOnly(cacheKey, text, sourceLabel, isLoading) {
      const outputEl = container.querySelector('[data-svs-ai-output]');
      const sourceEl = container.querySelector('[data-svs-ai-source]');
      const btnEl = container.querySelector('[data-svs-ai-btn]');
      if (btnEl) {
        btnEl.disabled = Boolean(isLoading);
        btnEl.textContent = isLoading
          ? '⏳ Tefekkür Süzülüyor...'
          : '✨ Bu Vadinin Tefekkürünü AI ile Aç';
      }
      if (sourceEl && sourceLabel) {
        sourceEl.textContent = sourceLabel;
      }
      if (outputEl) {
        outputEl.style.display = text ? 'block' : 'none';
        if (text) {
          outputEl.innerHTML = renderSafeMarkdown(text, esc);
        }
      }
    }

    async function runValleyReflection(valley, matchedList) {
      const cacheKey = `svs_${valley.slug}_${snapshot.visitedCities}`;
      const requestId = ++uiState.activeRequestId;
      uiState.aiLoadingKey = cacheKey;
      uiState.aiError = '';
      updateAiDomOnly(cacheKey, '', '✨ Tefekkür hazırlanıyor...', true);

      const { system, prompt } = buildValleyAiPrompt(valley, snapshot, matchedList);
      const ai = typeof window !== 'undefined' ? window.SEYYAH_AI : null;
      const canUseLiveAi = Boolean(
        ai &&
          typeof ai.stream === 'function' &&
          (typeof ai.hasKey !== 'function' || ai.hasKey())
      );

      if (canUseLiveAi) {
        let streamedText = '';
        try {
          const res = await ai.stream({
            prompt,
            system,
            temperature: 0.82,
            maxTokens: 1400,
            cacheKey,
            onChunk: (_delta, fullText) => {
              if (requestId !== uiState.activeRequestId) return;
              streamedText = fullText || streamedText;
              if (streamedText) {
                updateAiDomOnly(cacheKey, streamedText, '⚡ Gemini Canlı Tefekkür Akışı...', true);
              }
            }
          });
          if (requestId !== uiState.activeRequestId) return;
          const finalText = (res && res.text) || streamedText;
          if (finalText && finalText.trim()) {
            const sourceLabel = res && res.model ? `⚡ Gemini AI (${res.model})` : '⚡ Gemini AI Canlı Tefekkür';
            uiState.aiOutputs[cacheKey] = { text: finalText.trim(), source: sourceLabel, isLiveAI: true };
            uiState.aiLoadingKey = null;
            updateAiDomOnly(cacheKey, finalText.trim(), sourceLabel, false);
            return;
          }
        } catch (err) {
          // Graceful fallback to offline Sufi reflection engine
          if (requestId !== uiState.activeRequestId) return;
        }
      }

      // Offline / No-Key / Fallback Reflection with subtle streaming feel
      const offlineText = buildOfflineValleyReflection(valley, snapshot, matchedList);
      const offlineSource = '🕊️ Seyyah Çevrimdışı İrfan Motoru';
      uiState.aiOutputs[cacheKey] = { text: offlineText, source: offlineSource, isLiveAI: false };
      uiState.aiLoadingKey = null;
      if (requestId === uiState.activeRequestId) {
        updateAiDomOnly(cacheKey, offlineText, offlineSource, false);
      }
    }

    function draw() {
      const selectedValley = VALLEYS.find((v) => v.id === uiState.selectedValleyId) || snapshot.activeValley;
      const progressInfo = getValleyProgressInfo(selectedValley, snapshot.visitedCities, snapshot.activeValley.id);
      const activeProgressInfo = getValleyProgressInfo(snapshot.activeValley, snapshot.visitedCities, snapshot.activeValley.id);
      const matchedList = resolveMatchedProvinces(selectedValley, snapshot.provincesMap);
      const visitedMatchedCount = matchedList.filter((m) => m.visited).length;
      const cacheKey = `svs_${selectedValley.slug}_${snapshot.visitedCities}`;
      const cachedAi = uiState.aiOutputs[cacheKey] || null;
      const isCurrentlyLoading = uiState.aiLoadingKey === cacheKey;

      const allNotes = loadValleyNotes();
      const savedEntry = getValleyNoteEntry(allNotes, selectedValley.slug);
      const draftValue = Object.prototype.hasOwnProperty.call(uiState.noteDrafts, selectedValley.slug)
        ? uiState.noteDrafts[selectedValley.slug]
        : savedEntry.text;
      const valleysWithNotes = VALLEYS.filter((v) => Boolean(getValleyNoteEntry(allNotes, v.slug).text.trim()));
      const compassResult = computeCompassResult(uiState.compassAnswers);

      const doctrinesHtml = SEFER_DOCTRINES.map((doc) => {
        const isDocActive = uiState.selectedDoctrineId === doc.id;
        return `
          <button
            type="button"
            class="svs-doctrine-card ${isDocActive ? 'active' : ''}"
            style="--svs-doc-accent: ${doc.accent};"
            data-svs-doctrine="${doc.id}"
          >
            <div class="svs-doctrine-head">
              <span class="svs-doctrine-title">${doc.icon} ${esc(doc.title)}</span>
              <span class="svs-doctrine-stat">${esc(getDoctrineStat(doc.id))}</span>
            </div>
            <span class="svs-doctrine-sub">${esc(doc.subtitle)}</span>
            <span class="svs-doctrine-desc">${esc(doc.desc)}</span>
          </button>
        `;
      }).join('');

      const pillsHtml = VALLEYS.map((v) => {
        const st = getValleyStatus(v, snapshot.visitedCities, snapshot.activeValley.id);
        const isSel = v.id === selectedValley.id;
        const statusIcon = st === 'completed' ? '✓' : st === 'active' ? '🔥' : '○';
        const hasNote = Boolean(getValleyNoteEntry(allNotes, v.slug).text.trim());
        return `
          <button
            type="button"
            class="svs-valley-pill ${isSel ? 'selected' : ''}"
            style="--svs-v-accent: ${v.accent}; --svs-v-soft: ${v.accentSoft};"
            data-svs-valley="${v.id}"
          >
            <span class="svs-pill-top">${statusIcon} ${v.roman}${hasNote ? ' 📝' : ''}</span>
            <span class="svs-pill-name">${v.icon} ${esc(v.shortTitle)}</span>
            <span class="svs-pill-range">${v.minCities}–${v.maxCities} İl</span>
          </button>
        `;
      }).join('');

      const compassQuizHtml = uiState.compassOpen
        ? `
          <div class="svs-compass-quiz">
            ${COMPASS_QUESTIONS.map((q, idx) => `
              <div class="svs-compass-q">
                <div class="svs-compass-q-prompt">${idx + 1}. ${esc(q.prompt)}</div>
                <div class="svs-compass-opts">
                  ${q.options
                    .map((opt) => {
                      const isPicked = Number(uiState.compassAnswers[q.id]) === opt.valleyId;
                      return `
                        <button
                          type="button"
                          class="svs-compass-opt ${isPicked ? 'selected' : ''}"
                          data-svs-compass-q="${esc(q.id)}"
                          data-svs-compass-v="${opt.valleyId}"
                        >
                          ${isPicked ? '✦ ' : ''}${esc(opt.label)}
                        </button>
                      `;
                    })
                    .join('')}
                </div>
              </div>
            `).join('')}
            ${
              compassResult
                ? `
                  <div class="svs-compass-result">
                    <div>
                      <strong>🧭 Gönül Pusulası İşareti:</strong>
                      ${compassResult.icon} <strong>${compassResult.roman}. ${esc(compassResult.title)}</strong>
                      — ${esc(compassResult.tagline)}
                    </div>
                    <button type="button" class="svs-btn-gold" data-svs-valley="${compassResult.id}">
                      ${compassResult.icon} Bu Vadiyi İncele →
                    </button>
                  </div>
                `
                : `<div class="svs-journal-meta">3 soruyu yanıtladığında gönlündeki baskın vadi makamı burada belirir.</div>`
            }
          </div>
        `
        : '';

      const savedStripHtml = valleysWithNotes.length
        ? `
          <div class="svs-saved-strip">
            <span class="svs-journal-meta">📖 Kayıtlı Vadi Notların (${valleysWithNotes.length}/7):</span>
            ${valleysWithNotes
              .map(
                (v) => `
                  <button type="button" class="svs-saved-chip" data-svs-valley="${v.id}">
                    ${v.icon} ${v.roman}. ${esc(v.shortTitle)}
                  </button>
                `
              )
              .join('')}
          </div>
        `
        : '';

      const provincesHtml = matchedList
        .map((m) => {
          return `
            <button
              type="button"
              class="svs-prov-card"
              style="--svs-v-accent: ${selectedValley.accent};"
              data-svs-city="${esc(m.key)}"
            >
              <div class="svs-prov-top">
                <span class="svs-prov-name">
                  <span class="svs-plate">${esc(m.plate)}</span>
                  <span>${esc(m.name)}</span>
                </span>
                <span class="svs-prov-status ${m.visited ? 'visited' : 'pending'}">
                  ${m.visited ? '✓ Gezildi' : '○ Menzil'}
                </span>
              </div>
              <div class="svs-prov-reason">${esc(m.reason)}</div>
              <div class="svs-prov-meta">
                <span>${esc(m.region)}</span>
                <span>${m.landmark ? '📍 ' + esc(m.landmark) : 'İncele →'}</span>
              </div>
            </button>
          `;
        })
        .join('');

      const activeDoctrine = SEFER_DOCTRINES.find((d) => d.id === uiState.selectedDoctrineId) || SEFER_DOCTRINES[1];

      container.innerHTML = `
        <div class="svs-shell">
          <!-- Hero Header & Threefold Sufi Travel Doctrine -->
          <section class="svs-hero">
            <div class="svs-hero-top">
              <div>
                <div class="svs-eyebrow">🕊️ Ferîdüddin Attâr • Mantıku’t-Tayr &amp; Sefer Merhaleleri</div>
                <h2 class="svs-title">🕊️ Mantıku’t-Tayr: Yedi Vadi &amp; Sefer Merhaleleri</h2>
                <p class="svs-subtitle">
                  Anadolu’nun 81 ili yalnızca coğrafi bir liste değil; nefsin <strong>Talep</strong> ile yola çıkıp
                  <strong>İstiğna</strong> sadeliğinde hafiflediği ve <strong>Vuslat</strong> ufkunda “yolun kendisi menzildir”
                  sırrına erdiği yedi tasavvufî vadidir.
                </p>
              </div>
              <div class="svs-hero-meter">
                <span class="svs-meter-label">Gerçek Sefer Konumun</span>
                <div class="svs-meter-value">
                  <strong>${snapshot.visitedCities}/${snapshot.totalCities} İl</strong>
                  <span>%${snapshot.progressPct}</span>
                </div>
                <div class="svs-meter-bar">
                  <div class="svs-meter-fill" style="width: ${snapshot.progressPct}%;"></div>
                </div>
                <div class="svs-meter-active-name">
                  Aktif Makam: <strong>${snapshot.activeValley.roman}. ${esc(snapshot.activeValley.shortTitle)} Vadisi</strong>
                  (${snapshot.activeValley.minCities}–${snapshot.activeValley.maxCities} İl)
                </div>
              </div>
            </div>

            <div class="svs-doctrine-grid">
              ${doctrinesHtml}
            </div>
          </section>

          <!-- Hangi Vadidesin? (İçsel Pusula) Quick Indicator & Quiz -->
          <section class="svs-compass-card">
            <div class="svs-compass-top">
              <div class="svs-compass-info">
                <h3 class="svs-compass-title">
                  <span>🧭 Hangi Vadidesin? (İçsel Pusula)</span>
                </h3>
                <p class="svs-compass-desc">
                  Gezilen <strong>${snapshot.visitedCities}/${snapshot.totalCities} il</strong> ilerlemene göre şu an
                  <strong>${snapshot.activeValley.icon} ${snapshot.activeValley.roman}. ${esc(snapshot.activeValley.title)}</strong>
                  makamındasın — ${esc(activeProgressInfo.detail)}
                </p>
              </div>
              <div class="svs-compass-actions">
                ${
                  selectedValley.id !== snapshot.activeValley.id
                    ? `<button type="button" class="svs-btn-gold" data-svs-valley="${snapshot.activeValley.id}">🎯 Aktif Vadime Git (${esc(snapshot.activeValley.shortTitle)})</button>`
                    : ''
                }
                <button type="button" class="svs-btn-ghost" data-svs-toggle-compass>
                  ${uiState.compassOpen ? '▲ İçsel Pusulayı Gizle' : '🧭 3 Soruluk İçsel Pusulayı Aç'}
                </button>
              </div>
            </div>
            ${compassQuizHtml}
          </section>

          <!-- Interactive SVG 7-Valley Mountain Ascent Map -->
          <section class="svs-map-section">
            <div class="svs-section-head">
              <div class="svs-section-title">
                <span>🏔️ Kaf Dağı &amp; Yedi Vadi Yükseliş Haritası</span>
              </div>
              <div class="svs-legend">
                <span class="svs-legend-item"><span class="svs-legend-dot" style="background:#10b981;"></span> Aşılan Vadi</span>
                <span class="svs-legend-item"><span class="svs-legend-dot" style="background:#00f2fe;"></span> Aktif Makam (${snapshot.visitedCities}/81)</span>
                <span class="svs-legend-item"><span class="svs-legend-dot" style="background:#fbbf24;"></span> Seçili Vadi</span>
                <span class="svs-legend-item"><span class="svs-legend-dot" style="background:#64748b;"></span> Ufuktaki Merhale</span>
              </div>
            </div>

            <div class="svs-svg-wrap">
              ${buildMountainSvg(snapshot, selectedValley.id, esc)}
            </div>

            <div class="svs-pills-row">
              ${pillsHtml}
            </div>
          </section>

          <!-- Selected Valley Detail Studio -->
          <section class="svs-detail-card" style="--svs-v-accent: ${selectedValley.accent};">
            <div class="svs-detail-header">
              <div>
                <div class="svs-detail-badge-row">
                  <span class="svs-badge ${progressInfo.status}">${esc(progressInfo.badgeText)}</span>
                  <span class="svs-badge">${esc(selectedValley.arabicTitle)} • ${selectedValley.minCities}–${selectedValley.maxCities} İl</span>
                  <span class="svs-badge">${activeDoctrine.icon} ${esc(activeDoctrine.title)}</span>
                </div>
                <h3 class="svs-detail-title">${selectedValley.icon} ${selectedValley.roman}. ${esc(selectedValley.title)}</h3>
                <p class="svs-detail-tagline">${esc(selectedValley.tagline)} — <span style="opacity:0.85;">${esc(progressInfo.detail)}</span></p>
              </div>

              <blockquote class="svs-quote-box">
                ${esc(selectedValley.sufiQuote)}
                <span class="svs-quote-src">— ${esc(selectedValley.sufiSource)}</span>
              </blockquote>
            </div>

            <div class="svs-wisdom-grid">
              <div class="svs-wisdom-box">
                <h4><span>🕌</span> Klasik Tasavvufî Mânâ (Mantıku’t-Tayr)</h4>
                <p>${esc(selectedValley.sufiMeaning)}</p>
              </div>
              <div class="svs-wisdom-box">
                <h4><span>🎒</span> Dijital Seyyah Disiplini</h4>
                <p>${esc(selectedValley.seferDiscipline)}</p>
                <ul class="svs-practice-list">
                  ${selectedValley.practices.map((item) => `<li><span>✦</span><span>${esc(item)}</span></li>`).join('')}
                </ul>
              </div>
            </div>

            <div>
              <div class="svs-provinces-head">
                <h4>📍 Bu Vadinin Anadolu Menzilleri</h4>
                <span class="svs-provinces-count">
                  Eşleşen ${matchedList.length} ilden ${visitedMatchedCount} tanesi ziyaret edildi (tıklayıp şehir dosyasını aç)
                </span>
              </div>
              <div class="svs-provinces-grid" style="margin-top: 12px;">
                ${provincesHtml}
              </div>
            </div>

            <!-- AI Reflection Studio -->
            <div class="svs-ai-panel">
              <div class="svs-ai-bar">
                <button
                  type="button"
                  class="svs-ai-cta"
                  data-svs-ai-btn
                  ${isCurrentlyLoading ? 'disabled' : ''}
                >
                  ${isCurrentlyLoading ? '⏳ Tefekkür Süzülüyor...' : '✨ Bu Vadinin Tefekkürünü AI ile Aç'}
                </button>
                <span class="svs-ai-source" data-svs-ai-source>
                  ${cachedAi ? esc(cachedAi.source) : 'Hazır • Gemini AI + Çevrimdışı İrfan Motoru'}
                </span>
              </div>

              <div
                class="svs-ai-output"
                data-svs-ai-output
                style="display: ${cachedAi && cachedAi.text ? 'block' : 'none'};"
              >
                ${cachedAi && cachedAi.text ? renderSafeMarkdown(cachedAi.text, esc) : ''}
              </div>
            </div>

            <!-- Per-Valley Personal Tefekkür Journal -->
            <div class="svs-journal-panel">
              <div class="svs-journal-head">
                <h4><span>📝</span> ${selectedValley.roman}. ${esc(selectedValley.shortTitle)} Vadisi — Şahsî Tefekkür Defterin</h4>
                <span class="svs-journal-meta">
                  ${
                    savedEntry.updatedAt
                      ? `Son kayıt: ${esc(savedEntry.updatedAt)}`
                      : `Bu vadi için henüz kayıtlı notun yok (${valleysWithNotes.length}/7 vadi notlu)`
                  }
                </span>
              </div>

              ${
                savedEntry.text.trim()
                  ? `<div class="svs-saved-preview"><strong>Kayıtlı Tefekkürün:</strong>\n${esc(savedEntry.text)}</div>`
                  : ''
              }

              <textarea
                class="svs-journal-textarea"
                data-svs-note-input
                placeholder="${esc(selectedValley.title)} makamına dair içsel tefekkürünü, yolda öğrendiklerini veya bu vadideki niyetini buraya yaz..."
              >${esc(draftValue)}</textarea>

              <div class="svs-journal-footer">
                <div class="svs-journal-btns">
                  <button type="button" class="svs-btn-gold" data-svs-note-save>
                    💾 Bu Vadinin Tefekkürünü Kaydet
                  </button>
                  ${
                    savedEntry.text.trim()
                      ? `<button type="button" class="svs-btn-ghost" data-svs-note-clear>🗑️ Notu Temizle</button>`
                      : ''
                  }
                </div>
                <span class="svs-journal-meta">Tarayıcında güvenle saklanır (localStorage)</span>
              </div>

              ${savedStripHtml}
            </div>
          </section>
        </div>
      `;

      bindEvents(selectedValley, matchedList);
    }

    function bindEvents(selectedValley, matchedList) {
      // Valley selection (both SVG nodes and quick pills)
      container.querySelectorAll('[data-svs-valley]').forEach((el) => {
        const handleSelect = () => {
          const nextId = Number(el.getAttribute('data-svs-valley'));
          if (nextId && nextId !== uiState.selectedValleyId) {
            uiState.selectedValleyId = nextId;
            uiState.aiLoadingKey = null;
            draw();
          }
        };
        el.addEventListener('click', handleSelect);
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect();
          }
        });
      });

      // Toggle İçsel Pusula quiz
      const compassToggle = container.querySelector('[data-svs-toggle-compass]');
      if (compassToggle) {
        compassToggle.addEventListener('click', () => {
          uiState.compassOpen = !uiState.compassOpen;
          draw();
        });
      }

      // İçsel Pusula question options
      container.querySelectorAll('[data-svs-compass-q]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const qId = btn.getAttribute('data-svs-compass-q');
          const vId = Number(btn.getAttribute('data-svs-compass-v'));
          if (qId && vId) {
            uiState.compassAnswers[qId] = vId;
            draw();
          }
        });
      });

      // Threefold Sefer Doctrine selection
      container.querySelectorAll('[data-svs-doctrine]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const docId = btn.getAttribute('data-svs-doctrine');
          if (docId) {
            uiState.selectedDoctrineId = docId;
            draw();
          }
        });
      });

      // Navigate to clicked province dossier
      container.querySelectorAll('[data-svs-city]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-svs-city');
          if (key && ctx && typeof ctx.selectCity === 'function') {
            ctx.selectCity(key);
          }
        });
      });

      // AI Reflection trigger
      const aiBtn = container.querySelector('[data-svs-ai-btn]');
      if (aiBtn) {
        aiBtn.addEventListener('click', () => {
          runValleyReflection(selectedValley, matchedList);
        });
      }

      // Per-Valley Personal Tefekkür Journal events
      const noteInput = container.querySelector('[data-svs-note-input]');
      if (noteInput) {
        noteInput.addEventListener('input', () => {
          uiState.noteDrafts[selectedValley.slug] = noteInput.value;
        });
      }

      const noteSaveBtn = container.querySelector('[data-svs-note-save]');
      if (noteSaveBtn) {
        noteSaveBtn.addEventListener('click', () => {
          const rawText = noteInput ? noteInput.value.trim() : '';
          const notes = loadValleyNotes();
          if (!rawText) {
            delete notes[selectedValley.slug];
            delete uiState.noteDrafts[selectedValley.slug];
            saveValleyNotes(notes);
            if (ctx && typeof ctx.showToast === 'function') {
              ctx.showToast(`🗑️ ${selectedValley.shortTitle} Vadisi notu temizlendi.`);
            }
            draw();
            return;
          }
          const stamp = new Date().toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          notes[selectedValley.slug] = { text: rawText, updatedAt: stamp };
          uiState.noteDrafts[selectedValley.slug] = rawText;
          if (saveValleyNotes(notes)) {
            if (ctx && typeof ctx.showToast === 'function') {
              ctx.showToast(`📝 ${selectedValley.shortTitle} Vadisi tefekkürün kaydedildi!`);
            }
            draw();
          }
        });
      }

      const noteClearBtn = container.querySelector('[data-svs-note-clear]');
      if (noteClearBtn) {
        noteClearBtn.addEventListener('click', () => {
          const notes = loadValleyNotes();
          delete notes[selectedValley.slug];
          uiState.noteDrafts[selectedValley.slug] = '';
          saveValleyNotes(notes);
          if (ctx && typeof ctx.showToast === 'function') {
            ctx.showToast(`🗑️ ${selectedValley.shortTitle} Vadisi notu silindi.`);
          }
          draw();
        });
      }
    }

    draw();
  }

  window.SEYYAH_MODULES.sevenValleys = { render };
})();
