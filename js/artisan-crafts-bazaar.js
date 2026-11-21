/**
 * Anadolu Geleneksel Sanatlar, Zanaatlar & Tarihi Çarşılar Bedesteni
 * Ahîlik Ahlâkı ("Elini, kapını, sofranı açık tut") ekseninde Anadolu'nun
 * 24 kadim zanaatını, ustalık geleneklerini ve tarihi bedesten/arastalarını keşfetme stüdyosu.
 * Registers on window.SEYYAH_MODULES.bazaar = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-artisan-bazaar-styles';

  const CRAFT_CATEGORIES = [
    'Seramik, Taş & Maden',
    'Dokuma, Halı & İpek',
    'Tarihi Bedesten & Hanlar',
    'Ahşap, Hat & Ebru'
  ];

  const CATEGORY_META = {
    'Seramik, Taş & Maden': { icon: '🏺', color: '#f59e0b', short: 'Seramik & Maden' },
    'Dokuma, Halı & İpek': { icon: '🧵', color: '#10b981', short: 'Dokuma & Halı' },
    'Tarihi Bedesten & Hanlar': { icon: '🏛️', color: '#00f2fe', short: 'Bedesten & Han' },
    'Ahşap, Hat & Ebru': { icon: '🪵', color: '#a855f7', short: 'Ahşap & Hat' }
  };

  const DEFAULT_REGIONS = {
    '01_Marmara': { name: 'Marmara Bölgesi', short: 'Marmara', icon: '🏰', color: '#38bdf8' },
    '02_Ege': { name: 'Ege Bölgesi', short: 'Ege', icon: '🌊', color: '#34d399' },
    '03_Akdeniz': { name: 'Akdeniz Bölgesi', short: 'Akdeniz', icon: '☀️', color: '#f59e0b' },
    '04_IcAnadolu': { name: 'İç Anadolu Bölgesi', short: 'İç Anadolu', icon: '🌾', color: '#fbbf24' },
    '05_Karadeniz': { name: 'Karadeniz Bölgesi', short: 'Karadeniz', icon: '🌲', color: '#10b981' },
    '06_DoguAnadolu': { name: 'Doğu Anadolu Bölgesi', short: 'Doğu Anadolu', icon: '🏔️', color: '#a855f7' },
    '07_GuneydoguAnadolu': { name: 'Güneydoğu Anadolu Bölgesi', short: 'Güneydoğu', icon: '🏜️', color: '#f97316' }
  };

  const AHILIK_PRINCIPLES = [
    {
      icon: '🤲',
      title: 'Elini Açık Tut',
      subtitle: 'Cömertlik & Alın Teri',
      desc: 'Usta, zanaatın sırrını kalfadan esirgemez; kazancını hakkaniyetle bölüşür, müşteriye kusurlu mal sunmaz ("Pabucu dama atılmak").'
    },
    {
      icon: '🚪',
      title: 'Kapını Açık Tut',
      subtitle: 'Çarşı Misafirperverliği',
      desc: 'Bedesten ve arasta dükkânları yoldan geçene sığınaktır. Çay ikramı, selam ve hürmet alışverişin önünde gelir.'
    },
    {
      icon: '🍞',
      title: 'Sofranı Açık Tut',
      subtitle: 'Ortak Sandık & Bereket',
      desc: 'Lonca orta sandığı; çırak yetiştiren, düşen esnafı ayağa kaldıran ve çarşıda kimseyi aç bırakmayan dayanışma ruhudur.'
    }
  ];

  // 24 İkonik Anadolu Zanaatı ve Tarihi Çarşısı (Doğrulanmış provinceKey eşleşmeleri)
  const CRAFTS_DATA = [
    {
      id: 'iznik-cinisi',
      title: 'İznik Çinisi',
      provinceKey: '01_Marmara/Bursa',
      cityName: 'Bursa (İznik)',
      regionCode: '01_Marmara',
      category: 'Seramik, Taş & Maden',
      icon: '💠',
      era: 'XV.–XVII. Yüzyıl Osmanlı Zirvesi',
      bazaar: 'İznik Çiniciler Çarşısı & Süleyman Paşa Medresesi Atölyeleri',
      material: '%85 kuvars hamuru, sır altı kobalt mavisi, firuze ve mercan kırmızısı',
      heritage: 'UNESCO Yaşayan İnsan Hazinesi · Coğrafi İşaret',
      ahilikNote: 'Kuvars fırınında 900 derecede sabırla pişen çini, "pabucu dama atılma" titizliğinin simgesidir; tek bir çatlak bile ustasının gönlünde kabul görmez.',
      story: 'Lale, karanfil, sümbül ve Rumi motifleriyle Osmanlı cami ve saraylarını bezeyen İznik çinisi; derin kuvars parlaklığı ve kabartma mercan kırmızısı sırıyla dünya seramik tarihinin zirvesidir.',
      visitTip: 'İznik Gölü kıyısındaki fırın atölyelerinde sır altı tahrir çizimini izleyin, İznik Çini Müzesi (Nilüfer Hatun İmareti) koleksiyonunu görün.'
    },
    {
      id: 'kutahya-cinisi',
      title: 'Kütahya Çinisi',
      provinceKey: '02_Ege/Kutahya',
      cityName: 'Kütahya',
      regionCode: '02_Ege',
      category: 'Seramik, Taş & Maden',
      icon: '🏺',
      era: 'XIV. Yüzyıldan Günümüze Kesintisiz Ocak',
      bazaar: 'Kütahya Çiniciler Çarşısı & Germiyan Sokağı',
      material: 'Kaolinli beyaz kil, kobalt, manganez moru, sarı ve yeşil sır altı boyalar',
      heritage: 'UNESCO Yaratıcı Şehirler Ağı (Zanaat ve Halk Sanatları)',
      ahilikNote: 'Kütahya’da çini ocağı asırlardır ailelerden çıraklara emanet edilir; çarkçı, tahrirci ve boyacı aynı sofrada buluşan bir lonca zinciridir.',
      story: 'İznik fırınlarının söndüğü XVIII. yüzyılda bayrağı devralan Kütahya, gündelik vazolardan kubbe kaplamalarına dek Anadolu çiniciliğini kesintisiz bugüne taşımıştır.',
      visitTip: 'Dönen çarkta hamur çekimini seyredip Kütahya Çini Müzesi’ndeki XVIII. yüzyıl fincan ve tabaklarını inceleyin.'
    },
    {
      id: 'gaziantep-bakircilar-kutnu',
      title: 'Gaziantep Bakırcılar Çarşısı & Kutnu Kumaşı',
      provinceKey: '07_GuneydoguAnadolu/Gaziantep',
      cityName: 'Gaziantep',
      regionCode: '07_GuneydoguAnadolu',
      category: 'Tarihi Bedesten & Hanlar',
      icon: '🔨',
      era: 'XVI. Yüzyıl Lonca Çarşısı Geleneği',
      bazaar: 'Tarihi Bakırcılar Çarşısı, Zincirli Bedesten & Elmacı Pazarı',
      material: 'Tek parça dövme bakır, kalay, ipek-pamuk çözgülü parlak Kutnu dokuması',
      heritage: 'Coğrafi İşaretli Antep Bakırı & Kutnu Dokuması',
      ahilikNote: 'Bakırcılar Çarşısı’nda çekiç sesi sabah duasının ritmidir; çırak önce bakırı tavlamayı değil, ustasına ve komşusuna hürmet etmeyi öğrenir.',
      story: '500 yıllık Bakırcılar Çarşısı’nda tek parça bakır çekiçle şekillenip kalemkârlıkla işlenirken; Zincirli Bedesten ve hanlarda Osmanlı sultanlarının kaftan kumaşı Kutnu tezgâhlarda şakır.',
      visitTip: 'Sabah erken saatte Bakırcılar Çarşısı’nın çekiç senfonisini dinleyin, Tahmis Kahvesi’nde menengiç molası verip Kutnu atölyelerini gezin.'
    },
    {
      id: 'mardin-telkari',
      title: 'Mardin Telkâri Gümüş İşçiliği',
      provinceKey: '07_GuneydoguAnadolu/Mardin',
      cityName: 'Mardin (Midyat & Artuklu)',
      regionCode: '07_GuneydoguAnadolu',
      category: 'Seramik, Taş & Maden',
      icon: '💍',
      era: 'Mezopotamya’dan Artuklu & Osmanlı’ya',
      bazaar: 'Mardin Revaklı Çarşı (Sipahiler) & Midyat Telkâriciler Arastası',
      material: '925–1000 ayar has gümüş tel (mikron inceliğinde bükülmüş)',
      heritage: 'Coğrafi İşaret · Mezopotamya Süryani-İslam Ortak Mirası',
      ahilikNote: 'Farklı inanç ve kültürlerden ustaların aynı çarşıda yan yana tezgâh açtığı telkâri loncası, "kapını herkese açık tut" düsturunun canlı örneğidir.',
      story: 'Saç telinden ince iki gümüş telin burulup minyatür güvercin, tavus kuşu ve Süryani yıldızı motiflerine dönüştürüldüğü telkâri, Mezopotamya taş konaklarının zarafetini gümüşe döker.',
      visitTip: 'Revaklı Çarşı ve Midyat Eski Çarşı’da cımbızla teli lehimleyen gümüş ustalarının tezgâh başındaki sabrına tanıklık edin.'
    },
    {
      id: 'erzurum-oltu-tasi',
      title: 'Erzurum Oltu Taşı',
      provinceKey: '06_DoguAnadolu/Erzurum',
      cityName: 'Erzurum',
      regionCode: '06_DoguAnadolu',
      category: 'Seramik, Taş & Maden',
      icon: '🖤',
      era: 'XVIII. Yüzyıldan Günümüze Erzurum Çarşıları',
      bazaar: 'Taşhan (Rüstem Paşa Bedesteni)',
      material: 'Oltu ilçesinden çıkarılan fosilleşmiş ardıç ağacı kökenli yarı değerli siyah taş',
      heritage: 'Coğrafi İşaretli Erzurum Oltu Taşı & Tesbihçilik',
      ahilikNote: 'Toprağın altında yumuşak, hava ile temas edince sertleşen Oltu taşı gibi çırak da ustanın elinde sabırla yontulur; sahte taş satmak loncadan men sebebidir.',
      story: 'Kanuni Sultan Süleyman’ın sadrazamı Rüstem Paşa’nın 1561’de yaptırdığı Taşhan’ın iki katlı kemerli dükkânlarında, "siyah kehribar" denilen Oltu taşı tespih, yüzük ve ağızlığa dönüşür.',
      visitTip: 'Rüstem Paşa Kervansarayı (Taşhan) avlusunda tespih imamesi tornalayan ustalarla sohbet edip hakiki Oltu taşının nefesle buğulanma testini öğrenin.'
    },
    {
      id: 'eskisehir-luletasi',
      title: 'Eskişehir Lületaşı',
      provinceKey: '04_IcAnadolu/Eskisehir',
      cityName: 'Eskişehir',
      regionCode: '04_IcAnadolu',
      category: 'Seramik, Taş & Maden',
      icon: '🤍',
      era: 'XIX. Yüzyıl Porsuk Çayı & Sepiyolit Madenleri',
      bazaar: 'Odunpazarı Atlıhan El Sanatları Çarşısı & Kurşunlu Külliyesi',
      material: 'Dünya rezervlerinin merkezinden çıkarılan beyaz sepiyolit ("Deniz Köpüğü")',
      heritage: 'Coğrafi İşaret · Dünya Çapında Eşsiz Maden Zanaatı',
      ahilikNote: 'Yerin 100 metre altından kazma-kürekle çıkarılan her yumru, ustanın hayal gücüyle hayat bulur; Atlıhan’da ustalar yeni yeteneklere el verir.',
      story: 'Topraktan nemli ve yumuşak çıkan, işlendikçe kuruyup fildişi hafifliğine ulaşan beyaz lületaşı; ince oymalı pipoları, kolyeleri ve minyatür heykelleriyle "beyaz altın" diye anılır.',
      visitTip: 'Odunpazarı’ndaki tarihi Atlıhan Çarşısı’nda ve Kurşunlu Külliyesi Lületaşı Müzesi’nde ödüllü oyma eserleri görün.'
    },
    {
      id: 'bursa-koza-han-ipek',
      title: 'Bursa Koza Han & İpekçilik',
      provinceKey: '01_Marmara/Bursa',
      cityName: 'Bursa',
      regionCode: '01_Marmara',
      category: 'Tarihi Bedesten & Hanlar',
      icon: '🦋',
      era: '1491 (Sultan II. Bayezid Dönemi)',
      bazaar: 'Koza Han, Emir Han, Fidan Han & Uzun Çarşı',
      material: 'Dut yaprağıyla beslenen ipek böceği kozasından çekilen doğal ham ipek',
      heritage: 'UNESCO Dünya Mirası (Bursa Hanlar Bölgesi)',
      ahilikNote: 'İpek böceğinin sabrını simgeleyen Koza Han’da, asırlardır ipek terazisi şaşmaz; hanın avlusundaki şadırvan üstü mescit ticaretle maneviyatı birleştirir.',
      story: 'İpek Yolu’nun batıdaki en görkemli durağı olan 95 odalı Koza Han, yüzyıllar boyunca ipek kozası mezatlarına ev sahipliği yapmış, Bursa kadifesi ve ipek şallarını dünyaya dağıtmıştır.',
      visitTip: 'Koza Han’ın asırlık çınarları altında Türk kahvesi içip üst kat revaklarındaki geleneksel ipek şal dükkânlarını gezin.'
    },
    {
      id: 'avanos-comlekcilik',
      title: 'Avanos Çömlekçiliği',
      provinceKey: '04_IcAnadolu/Nevsehir',
      cityName: 'Nevşehir (Avanos)',
      regionCode: '04_IcAnadolu',
      category: 'Seramik, Taş & Maden',
      icon: '🍶',
      era: 'Hititlerden Günümüze (M.Ö. 2000 – XXI. yy)',
      bazaar: 'Avanos Tarihi Çarşı & Kızılırmak Kıyısı Yeraltı İşlikleri',
      material: 'Kızılırmak’ın taşıdığı kırmızı milli kil ve dağlardan gelen yağlı toprak',
      heritage: '4.000 Yıllık Kesintisiz Ayak Tornası Geleneği',
      ahilikNote: 'Eski Avanos’ta "çanak-çömlek yapamayan gence kız verilmez" geleneği, emeğe ve meslek ehliyetine duyulan lonca saygısının halk kültüründeki izidir.',
      story: 'Tüf kayalara oyulmuş serin işliklerde ayakla çevrilen tezgâhlarda Kızılırmak’ın alüvyon kili; Hitit formlu testilere, süzgeçli güveçlere ve şahmeran motifli küplere dönüşür.',
      visitTip: 'Kızılırmak üzerindeki sallanan köprüden geçip yeraltı çömlek atölyelerinde usta eşliğinde ayak çarkında toprak yoğurun.'
    },
    {
      id: 'kahramanmaras-yemeni-bakir',
      title: 'Kahramanmaraş Yemenicilik & Bakır',
      provinceKey: '03_Akdeniz/Kahramanmaras',
      cityName: 'Kahramanmaraş',
      regionCode: '03_Akdeniz',
      category: 'Tarihi Bedesten & Hanlar',
      icon: '👞',
      era: 'XVI. Yüzyıl Dulkadiroğlu & Osmanlı Çarşısı',
      bazaar: 'Tarihi Kapalı Çarşı, Saraçhane & Bakırcılar Arastası',
      material: 'Manda köselesi, keçi ve koyun derisi (sahtiyan/meşin), dövme bakır',
      heritage: 'Coğrafi İşaretli Maraş Yemenisi & Maraş Bakır İşlemeciliği',
      ahilikNote: 'Ahîlikte ayakkabıcılar (kavaflar) ve bakırcılar çarşı disiplininin kalbidir; çürük deriden dikilen yemeni Ahî şeyhinin kararıyla dama atılırdı.',
      story: 'Tamamen doğal deriden, çivi ve yapıştırıcı kullanılmadan mumlu kendir ipiyle ters dikilip çevrilen nefes alan yemeni; aynı çarşının dövme bakır sinileriyle omuz omuza yaşar.',
      visitTip: 'Tarihi Kapalı Çarşı ve Saraçhane’de yemeni kalıplarını, ardından Ulu Camii çevresindeki bakırcı ustalarının çekiç işlerini ziyaret edin.'
    },
    {
      id: 'denizli-buldan-dokuma',
      title: 'Denizli Buldan Dokuması',
      provinceKey: '02_Ege/Denizli',
      cityName: 'Denizli (Buldan)',
      regionCode: '02_Ege',
      category: 'Dokuma, Halı & İpek',
      icon: '🧣',
      era: 'Antik Tripolis & Osmanlı "Bürümcük" Geleneği',
      bazaar: 'Buldan Dokumacılar Çarşısı & Tarihi Kaleiçi Çarşısı',
      material: 'Bükülü pamuk ipliği (bürümcük), doğal ham keten ve ipek',
      heritage: 'Coğrafi İşaretli Buldan Bezi · Osmanlı Saray Kumaşı',
      ahilikNote: 'Neredeyse her sokağından mekik sesi yükselen Buldan’da dokuma tezgâhı evin bereket ocağıdır; komşular çözgü ve tahar işini imeceyle yapar.',
      story: 'Ter emici, serin tutan kıvrımlı dokusuyla Yıldırım Bayezid’den Barbaros Hayrettin’e dek Osmanlı kaftan ve iç gömleklerini süsleyen Buldan bezi, kara tezgâhlarda hâlâ nefes alır.',
      visitTip: 'Buldan’ın cumbalı sokaklarında mekik seslerini takip edip kara tezgâh dokuma evlerini ve Kaleiçi’ni gezin.'
    },
    {
      id: 'sanliurfa-kazazlik-sipahi',
      title: 'Şanlıurfa Kazazlık & Sipahi Pazarı',
      provinceKey: '07_GuneydoguAnadolu/Sanliurfa',
      cityName: 'Şanlıurfa',
      regionCode: '07_GuneydoguAnadolu',
      category: 'Tarihi Bedesten & Hanlar',
      icon: '📿',
      era: '1563 (Gümrük Hanı & Tarihi Hanlar Bölgesi)',
      bazaar: 'Sipahi Pazarı, Gümrük Hanı, Hüseyniye & Kazzaz Pazarı',
      material: 'Ham ipek iplik (ibrişim), 24 ayar altın/gümüş tel, kehribar',
      heritage: 'Tarihi İpek Yolu Bedesten Zinciri · Urfa Kazazlığı',
      ahilikNote: 'Gümrük Hanı ve Sipahi Pazarı’nda sabah namazı sonrası açılan esnaf duası, halı-kilim, kürk ve kazaz ustalarını tek bir vicdan terazisinde birleştirir.',
      story: 'İpek ipliğin çıkrıkta bükülerek tespih püskülü, düğme ve şerit süslemelere dönüştürüldüğü Kazazlık zanaatı; tonozlu taş koridorlu Sipahi Pazarı’nda asırlardır yaşatılır.',
      visitTip: 'Balıklıgöl yürüyüşü sonrası Gümrük Hanı avlusunda mırra içip Kazzaz Pazarı ile Sipahi Pazarı’nın serin taş kemerlerinde dolaşın.'
    },
    {
      id: 'isparta-halicilik',
      title: 'Isparta Halıcılığı',
      provinceKey: '03_Akdeniz/Isparta',
      cityName: 'Isparta',
      regionCode: '03_Akdeniz',
      category: 'Dokuma, Halı & İpek',
      icon: '🧶',
      era: 'XIX. Yüzyıl Sonu – XX. Yüzyıl Anadolu Halı Rönesansı',
      bazaar: 'Isparta Tarihi Halıcılar Çarşısı & Üzüm Pazarı',
      material: 'Kirman yünü, kök boya, çift düğüm (Türk / Gördes düğümü) tekniği',
      heritage: 'Coğrafi İşaretli Isparta El Dokuma Halısı',
      ahilikNote: 'Her ilmek bir sabır ve gönül duasıdır; Isparta’da halı tezgâhları genç kızların çeyiz sandığını ve aile ekonomisini onurla ayakta tutmuştur.',
      story: 'Gül diyarı Isparta’da lale, gül, madalyon ve serpme çiçek desenleriyle desimetrekarede binlerce çift düğümle dokunan Isparta halıları, Anadolu salonlarının zamansız mirasıdır.',
      visitTip: 'Isparta Müzesi’ndeki tarihi halı örneklerini görüp eski halı yıkama/kırkım ve dokuma atölyelerinin izini sürün.'
    },
    {
      id: 'usak-halicilik',
      title: 'Uşak Halıcılığı',
      provinceKey: '02_Ege/Usak',
      cityName: 'Uşak',
      regionCode: '02_Ege',
      category: 'Dokuma, Halı & İpek',
      icon: '🕌',
      era: 'XV.–XVII. Yüzyıl Klasik Osmanlı Saray & Rönesans Halıları',
      bazaar: 'Uşak Tarihi Halı Dokuma Evleri & Bedesten Çevresi',
      material: 'Uzun elyaflı Ege yünü, palamut, cehri ve kökboya (kırmızı, çivit mavi, sarı)',
      heritage: 'Coğrafi İşaret · Rönesans Tablolarına Giren Efsanevi Tasarım',
      ahilikNote: 'Uşak halı ustaları doğal kök boyanın sırrını ticari hırsa feda etmemekle ün salmıştır; renk solmazlığı ustanın namusu sayılır.',
      story: 'Holbein ve Lotto gibi Avrupalı Rönesans ressamlarının tablolarına girecek kadar ünlenen "Madalyonlu" ve "Yıldızlı" Uşak halıları, Türk düğüm sanatının dünyadaki en parlak simgesidir.',
      visitTip: 'Uşak Halı Kilim Evi ve Dokur Evi’nde yıldızlı ve madalyonlu Uşak desenlerinin iplik ve kök boya serüvenini inceleyin.'
    },
    {
      id: 'kastamonu-tasbaski-ahsap',
      title: 'Kastamonu Taşbaskı & Ahşap',
      provinceKey: '05_Karadeniz/Kastamonu',
      cityName: 'Kastamonu',
      regionCode: '05_Karadeniz',
      category: 'Ahşap, Hat & Ebru',
      icon: '🪵',
      era: 'Selçuklu & Candaroğulları Ahşap Ekolü',
      bazaar: 'Münire Medresesi El Sanatları Çarşısı & Nasrullah Meydanı',
      material: 'Ihlamur ağacı baskı kalıpları, ceviz/çamsakızı oyma, pamuklu dokuma',
      heritage: 'Coğrafi İşaretli Kastamonu Taşbaskısı & Ahşap Oymacılığı',
      ahilikNote: 'Kastamonu loncalarında ağaç yontulmadan önce kurutulup dinlendirildiği gibi, çırak da ustasının yanında acele etmeden olgunlaşır.',
      story: 'Oyulmuş ıhlamur kalıplarla kumaşa basılan Çatalzeytin ve Kandilli motifli taşbaskılar ile çivisiz geçme ahşap oymacılık, Münire Medresesi’nin taş odalarında nefes alır.',
      visitTip: 'Nasrullah Camii yanındaki Münire Medresesi’nde ıhlamur kalıp oymacılarını ve Kastamonu el dokuması çarşaf bağlarını inceleyin.'
    },
    {
      id: 'edirne-edirnekari-arasta',
      title: 'Edirne Edirnekâri & Selimiye Arastası',
      provinceKey: '01_Marmara/Edirne',
      cityName: 'Edirne',
      regionCode: '01_Marmara',
      category: 'Ahşap, Hat & Ebru',
      icon: '🌷',
      era: 'XV.–XVIII. Yüzyıl Payitaht Süsleme Ekolü',
      bazaar: 'Selimiye Arastası, Bedesten (Çarşı-yı Kebir) & Ali Paşa Çarşısı',
      material: 'Ahşap, deri ve mukavva üzerine lale-karanfil bezemeli lak/altın varak, hat-ebru',
      heritage: 'UNESCO Selimiye Külliyesi Arastası · Coğrafi İşaretli Edirnekâri',
      ahilikNote: 'Mimar Sinan eseri Selimiye Arastası’nda her sabah yapılan Esnaf Duası, Rumeli’nin en köklü Ahî geleneğini beş asırdır kesintisiz yaşatır.',
      story: 'Lale devrinin ve payitaht Edirne’nin zarafetini ahşap rahlelere, kavukluklara, kitap ciltlerine ve hat-ebru levhalarına işleyen Edirnekâri; doğayı şükürle nakşeden bir sabır sanatıdır.',
      visitTip: 'Selimiye Arastası’nın kubbeli koridorunda Edirnekâri sandıklar ile Edirne’nin mis kokulu meyve sabunlarını görün.'
    },
    {
      id: 'istanbul-kapalicarsi-sahaflar',
      title: 'İstanbul Kapalıçarşı & Sahaflar',
      provinceKey: '01_Marmara/Istanbul',
      cityName: 'İstanbul',
      regionCode: '01_Marmara',
      category: 'Tarihi Bedesten & Hanlar',
      icon: '🕌',
      era: '1461 (Fatih Sultan Mehmed · Cevahir Bedesteni)',
      bazaar: 'Kapalıçarşı (Cevahir & Sandal Bedestenleri), Zincirli Han & Sahaflar Çarşısı',
      material: 'Altın/mücevher, halı, hat-ebru-tezhip eserleri, nadir elyazmaları ve cilt',
      heritage: 'Dünyanın En Eski ve En Büyük Tarihi Kapalı Çarşı Kompleksi',
      ahilikNote: '60’tan fazla sokağı ve 3.600’ü aşkın dükkânıyla Kapalıçarşı; her sokağın (Kuyumcular, Kalpakçılar, Sahaflar, Halıcılar) kendi lonca ahlâkıyla işlediği bir şehir içi medeniyettir.',
      story: 'Fatih’in Ayasofya vakfına gelir sağlamak için kurduğu Cevahir Bedesteni’nden Beyazıt’taki Sahaflar Çarşısı’na uzanan bu labirent; zanaatla kitap, hat ve ebru kültürünü birleştirir.',
      visitTip: 'Kalpakçılar Caddesi’nden girip Cevahir Bedesteni kubbelerini selamlayın, ardından Beyazıt kapısından çıkıp Sahaflar Çarşısı’nda asırlık kitap kokusunu içinize çekin.'
    },
    {
      id: 'trabzon-kazaziye-surmene',
      title: 'Trabzon Kazaziye & Sürmene Bıçağı',
      provinceKey: '05_Karadeniz/Trabzon',
      cityName: 'Trabzon (Merkez & Sürmene)',
      regionCode: '05_Karadeniz',
      category: 'Seramik, Taş & Maden',
      icon: '✨',
      era: 'Lidya & Kafkasya’dan Osmanlı Şehzadeler Şehrine',
      bazaar: 'Trabzon Bedesteni, Taşhan & Tarihi Kemeraltı Çarşısı',
      material: '24 ayar has altın veya 1000 ayar gümüşün 0,08 mm ipeğe sarılması; dövme çelik',
      heritage: 'Coğrafi İşaretli Trabzon Hasırı, Kazaziye & Sürmene Bıçağı',
      ahilikNote: 'Şehzadeler şehri Trabzon’da kuyumcu ve demirci esnafı "söz senettir" kuralıyla çalışır; kazaziye tek ipek çekirdek üzerine dantel gibi sabırla örülür.',
      story: 'Dünyada yalnızca Trabzon’da yaşatılan Kazaziye zanaatında saç telinden ince altın-gümüş teller düğümlenirken, Sürmene ocaklarında su verilen çelik bıçaklar ustalığın keskin nişanı olur.',
      visitTip: 'Kemeraltı ve Taşhan’da tel ören kazaziye ustalarını izleyin, tarihi Trabzon Bedesteni’nin tek kubbeli taş mimarisini görün.'
    },
    {
      id: 'sivas-agizlik-gumus',
      title: 'Sivas Ağızlık & Gümüş',
      provinceKey: '04_IcAnadolu/Sivas',
      cityName: 'Sivas',
      regionCode: '04_IcAnadolu',
      category: 'Ahşap, Hat & Ebru',
      icon: '✒️',
      era: 'Selçuklu Başkentinden Osmanlı Gümüş & Ahşap Loncalarına',
      bazaar: 'Taşhan, Behrampaşa Hanı & Sivas Bakırcılar/Bıçakçılar Çarşısı',
      material: 'Kiraz, kızılcık, abanoz ahşabı; 900–925 ayar savatlı gümüş ve kemik/boynuz',
      heritage: 'Coğrafi İşaretli Sivas Gümüş Savat İşlemeciliği & Ahşap Ağızlık',
      ahilikNote: 'Divriği ve Gök Medrese’nin taş ustalarından miras kalan estetik, Sivas’ta avuç içi büyüklüğündeki ahşap ağızlık ve gümüş savat işlemeciliğinde sürer.',
      story: 'Sivas ustaları, kurutulmuş kiraz ve kızılcık dallarını el tornasında delip üzerini siyah savat (gümüş-bakır-kurşun-kükürt karışımı) kakmalı gümüş halkalarla süsleyerek koleksiyonluk eserler üretir.',
      visitTip: 'Behrampaşa Hanı ve Taşhan’daki gümüşçü atölyelerinde savat macununun gümüş oluklara nasıl yedirildiğini keşfedin.'
    },
    {
      id: 'diyarbakir-hasanpasa-ipek',
      title: 'Diyarbakır Hasanpaşa Hanı & İpek',
      provinceKey: '07_GuneydoguAnadolu/Diyarbakir',
      cityName: 'Diyarbakır (Sur)',
      regionCode: '07_GuneydoguAnadolu',
      category: 'Tarihi Bedesten & Hanlar',
      icon: '🏛️',
      era: '1572–1575 (Vezirzade Hasan Paşa)',
      bazaar: 'Hasanpaşa Hanı, Yanık Çarşı, Bakırcılar & Kuyumcular Çarşısı',
      material: 'Siyah bazalt & beyaz kalker almaşık taş mimari, doğal Diyarbakır ipeği (poşu)',
      heritage: 'İpek Yolu Sur İçi Hanlar Mirası · Coğrafi İşaretli İpek Dokuma',
      ahilikNote: 'Ulu Camii karşısındaki Hasanpaşa Hanı’nda sabahın ilk ışığında kurulan bereket sofrası, yüzyıllardır kervan tüccarlarıyla yerli zanaatkârları buluşturur.',
      story: 'İki katlı bazalt-kalker avlusu ve ortasındaki şadırvanıyla İpek Yolu’nun güneydoğu kapısı olan Hasanpaşa Hanı; el dokuması ipek poşular, bakır işleri ve gümüş zanaatlarının kalbidir.',
      visitTip: 'Hasanpaşa Hanı’nın tarihi avlusunda kahvaltı yaptıktan sonra üst kat revaklarındaki ipek, tespih ve bakır atölyelerini gezin.'
    },
    {
      id: 'kayseri-kapalicarsi-bunyan',
      title: 'Kayseri Kapalıçarşı & Bünyan Halısı',
      provinceKey: '04_IcAnadolu/Kayseri',
      cityName: 'Kayseri',
      regionCode: '04_IcAnadolu',
      category: 'Tarihi Bedesten & Hanlar',
      icon: '🏮',
      era: '1497 (Vezir Hanı & Tarihi Bedesten)',
      bazaar: 'Kayseri Tarihi Kapalı Çarşısı, Bedesten, Kazancılar & Vezir Hanı',
      material: 'İnce bükümlü yün & ipek çözgü, 60×60 sık düğümlü Bünyan halısı',
      heritage: 'Anadolu’nun En Büyük İkinci Tarihi Kapalı Çarşısı · Coğrafi İşaret',
      ahilikNote: 'Ahî Evran’ın ilk debbağhaneyi (dericilik loncasını) kurduğu Kayseri, Anadolu Ahîlik teşkilatının başlangıç şehirlerinden biridir; ticaret ahlâkı atasözlerine işlemiştir.',
      story: 'Bünyan halısı incecik ipek gibi dokusu ve milimetrik çiçek desenleriyle ünlüdür; Kayseri Kapalıçarşısı ve Bedesteni ise pastırmacı, kazancı ve halıcı esnafını tek çatı altında toplar.',
      visitTip: 'Kapalıçarşı içindeki tarihi Bedesten kubbelerinin altından geçip Kazancılar Çarşısı’nı ve Hunat Hatun Medresesi zanaat galerisini görün.'
    },
    {
      id: 'afyon-mermer-sanati',
      title: 'Afyon Mermer Sanatı',
      provinceKey: '02_Ege/Afyonkarahisar',
      cityName: 'Afyonkarahisar (İscehisar)',
      regionCode: '02_Ege',
      category: 'Seramik, Taş & Maden',
      icon: '🏛️',
      era: 'Antik Dokimeion’dan Selçuklu & Osmanlı Taş Oymacılığına',
      bazaar: 'Afyon Tarihi Uzun Çarşı, Bedesten & İscehisar Mermer Atölyeleri',
      material: 'İscehisar beyaz mermeri, kaplan postu & mor damarlı Afyon menekşe mermeri',
      heritage: '2.500 Yıllık Dokimeion Heykel & Taş İşçiliği Mirası',
      ahilikNote: 'Mermer ustası taşa vurmadan önce damarını dinler; sabırsız çekiç mermeri çatlatır, usta eli ise sert taşa su gibi akışkanlık kazandırır.',
      story: 'Ayasofya’nın sütunlarından Anadolu camilerinin şadırvan ve mihraplarına dek uzanan Afyon mermeri, günümüzde oyma kurnalar, hat levhaları ve ince taş işçiliğiyle yaşamaya devam eder.',
      visitTip: 'Tarihi Bedesten ve Uzun Çarşı’yı gezdikten sonra Afyon Arkeoloji Müzesi ve Ulu Camii çevresindeki taş-ahşap işçiliğini inceleyin.'
    },
    {
      id: 'ankara-beypazari-telkari',
      title: 'Ankara Beypazarı Telkârisi & Çıkrıkçılar',
      provinceKey: '04_IcAnadolu/Ankara',
      cityName: 'Ankara (Beypazarı & Ulus)',
      regionCode: '04_IcAnadolu',
      category: 'Tarihi Bedesten & Hanlar',
      icon: '⚜️',
      era: 'Ahî Cumhuriyeti Ankara & Osmanlı İpek Yolu Menzili',
      bazaar: 'Beypazarı Suluhan & Demirciler Çarşısı · Ulus Çıkrıkçılar Yokuşu & Samanpazarı',
      material: '925 ayar bükülmüş gümüş tel (telkâri), kök boyalı bürümcük dokuma, bakır',
      heritage: 'Ahî Yönetimli Başkent Mirası · Coğrafi İşaretli Beypazarı Telkârisi',
      ahilikNote: 'XIV. yüzyılda bir dönem "Ahîler Cumhuriyeti" olarak yönetilen Ankara’da Arslanhane (Ahi Şerafettin) ve Suluhan esnaf loncaları dürüstlüğün kalesi olmuştur.',
      story: 'Ulus’taki dik Çıkrıkçılar Yokuşu’nda kumaşçı ve aktar kokuları yükselirken, tarihi Beypazarı konakları arasındaki çarşılarda gümüş telkâri kemerler ve bindallı nakışları işlenir.',
      visitTip: 'Ankara Kalesi eteğindeki Pirinç Han ve Çıkrıkçılar Yokuşu’nu yürüyün; Beypazarı’nda Suluhan Kervansarayı ile Yaşayan Müze’yi görün.'
    },
    {
      id: 'tokat-yazmaciligi',
      title: 'Tokat Yazmacılığı',
      provinceKey: '05_Karadeniz/Tokat',
      cityName: 'Tokat',
      regionCode: '05_Karadeniz',
      category: 'Dokuma, Halı & İpek',
      icon: '🎨',
      era: '600 Yıllık Osmanlı "Yazma & Basma" Lonca Merkezi',
      bazaar: 'Taşhan (Voyvoda Hanı) & Sulu Sokak Tarihi Çarşısı',
      material: 'Ihlamur ağacı kalıplar, elmalı, üzümlü ve soğanlı bitkisel kök boyalar, tülbent',
      heritage: 'Coğrafi İşaretli Tokat El Basması Yazması',
      ahilikNote: 'Bir dönem Anadolu’nun dört bir yanına basma gönderen Tokat yazmacıları, elma ve üzüm motiflerinde bereketi, kalıp baskıda el emeğini kutsamıştır.',
      story: '1631 tarihli Taşhan’ın avlusunda ıhlamur ağaçlarına oyulmuş "Elmalı", "Karagözlü" ve "Bahçeli" kalıplar kök boyaya batırılıp tülbende vurulunca Tokat yazması hayat bulur.',
      visitTip: 'Sulu Sokak ve Yağıbasan Medresesi çevresini gezip Taşhan’daki yazma atölyelerinde ıhlamur kalıp baskısı deneyimleyin.'
    },
    {
      id: 'siirt-tiftik-battaniyesi',
      title: 'Siirt Tiftik Battaniyesi',
      provinceKey: '07_GuneydoguAnadolu/Siirt',
      cityName: 'Siirt',
      regionCode: '07_GuneydoguAnadolu',
      category: 'Dokuma, Halı & İpek',
      icon: '🐑',
      era: 'Asırlık Güneydoğu Yayla & Tezgâh Geleneği',
      bazaar: 'Siirt Tarihi Helvacılar & Tiftik Dokuma Çarşısı',
      material: '%100 doğal Ankara/Siirt tiftik keçisi yünü (boya katılmadan kendi rengiyle)',
      heritage: 'Coğrafi İşaretli Siirt Tiftik Battaniyesi',
      ahilikNote: 'Tiftik ipliğinin çobanından eğiricisine, dokuyucusundan tel fırçayla tüy kabartan tarakçısına dek her halka aynı bereket halkasının ortağıdır.',
      story: 'Hiçbir sentetik boya kullanılmadan beyaz, siyah, kahverengi ve kırçıllı doğal keçi tiftiğinden dokunan Siirt battaniyesi; çelik fırçayla taranıp bulut gibi kabartılarak soğuğu geçirmez bir şahesere dönüşür.',
      visitTip: 'Siirt merkezdeki atölyelerde dokunan battaniyenin tarakla nasıl kabartıldığını izleyin; seccade ve heybe dokumalarını inceleyin.'
    }
  ];

  const CRAFT_BY_ID = new Map();
  const CRAFTS_BY_PROVINCE = new Map();
  CRAFTS_DATA.forEach(function (item) {
    CRAFT_BY_ID.set(item.id, item);
    if (!CRAFTS_BY_PROVINCE.has(item.provinceKey)) {
      CRAFTS_BY_PROVINCE.set(item.provinceKey, []);
    }
    CRAFTS_BY_PROVINCE.get(item.provinceKey).push(item);
  });

  // ---------------------------------------------------------------------------
  // Helpers (XSS-safe escaping, Turkish normalization, Markdown rendering)
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

  // ---------------------------------------------------------------------------
  // Module-scoped UI State
  // ---------------------------------------------------------------------------
  const uiState = {
    category: 'all',
    region: 'all',
    visitedOnly: false,
    searchQuery: '',
    detailId: null,
    aiFocusId: 'general',
    aiAngle: 'story', // 'story' | 'guide' | 'ahilik'
    aiStatus: 'idle', // 'idle' | 'loading' | 'done'
    aiText: '',
    aiSource: '',
    aiError: '',
    aiRequestToken: 0
  };

  // ---------------------------------------------------------------------------
  // Scoped Styles (Dark + body.light-theme compatible)
  // ---------------------------------------------------------------------------
  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sbz-root {
        display: flex;
        flex-direction: column;
        gap: 22px;
        max-width: 1200px;
        margin: 0 auto;
        padding-bottom: 36px;
        color: var(--text-primary, #f8fafc);
      }

      /* Hero Banner */
      .sbz-hero {
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-lg, 20px);
        border: 1px solid rgba(245, 158, 11, 0.32);
        background:
          radial-gradient(circle at 12% 18%, rgba(245, 158, 11, 0.16), transparent 45%),
          radial-gradient(circle at 88% 82%, rgba(0, 242, 254, 0.14), transparent 46%),
          linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(30, 41, 59, 0.88) 100%);
        padding: 26px 28px;
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0,0,0,0.45));
      }

      .sbz-hero-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.32);
        padding: 5px 12px;
        border-radius: 999px;
        margin-bottom: 12px;
      }

      .sbz-hero-title {
        font-family: var(--font-heading, inherit);
        font-size: clamp(1.38rem, 2.5vw, 1.95rem);
        font-weight: 800;
        line-height: 1.25;
        margin: 0 0 10px;
        background: linear-gradient(135deg, #ffffff 0%, #fde68a 52%, #38bdf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .sbz-hero-sub {
        font-size: 0.95rem;
        line-height: 1.65;
        color: var(--text-secondary, #cbd5e1);
        max-width: 860px;
        margin: 0 0 18px;
      }

      .sbz-ahilik-quote {
        border-left: 3px solid var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.08);
        padding: 12px 16px;
        border-radius: 0 12px 12px 0;
        margin-bottom: 18px;
        font-size: 0.92rem;
        color: var(--text-primary, #f8fafc);
      }

      .sbz-ahilik-quote strong {
        color: var(--accent-gold, #f59e0b);
      }

      /* Ahilik 3 Pillars */
      .sbz-pillars {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 18px;
      }

      .sbz-pillar {
        background: rgba(15, 23, 42, 0.58);
        border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
        border-radius: 14px;
        padding: 13px 15px;
      }

      .sbz-pillar-head {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        font-size: 0.93rem;
        color: var(--accent-gold, #f59e0b);
        margin-bottom: 4px;
      }

      .sbz-pillar-sub {
        font-size: 0.74rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--accent-cyan, #00f2fe);
        margin-bottom: 5px;
      }

      .sbz-pillar-desc {
        font-size: 0.82rem;
        line-height: 1.5;
        color: var(--text-secondary, #94a3b8);
      }

      /* Stats Strip */
      .sbz-stats-strip {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .sbz-stat-box {
        background: rgba(15, 23, 42, 0.68);
        border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
        border-radius: 12px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .sbz-stat-val {
        font-family: var(--font-heading, inherit);
        font-size: 1.32rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .sbz-stat-lbl {
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* Filter Toolbar */
      .sbz-toolbar {
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
        border-radius: var(--radius-md, 14px);
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .sbz-toolbar-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
      }

      .sbz-chip-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        flex: 1 1 auto;
      }

      .sbz-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 13px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255,255,255,0.12));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-secondary, #cbd5e1);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .sbz-chip:hover {
        border-color: var(--accent-gold, #f59e0b);
        color: var(--text-primary, #ffffff);
      }

      .sbz-chip.active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.24), rgba(0, 242, 254, 0.14));
        border-color: var(--accent-gold, #f59e0b);
        color: #ffffff;
        box-shadow: 0 0 14px rgba(245, 158, 11, 0.2);
      }

      .sbz-chip-count {
        font-size: 0.72rem;
        opacity: 0.82;
        background: rgba(255, 255, 255, 0.1);
        padding: 1px 6px;
        border-radius: 999px;
      }

      .sbz-search-wrap {
        position: relative;
        flex: 1 1 260px;
        min-width: 220px;
      }

      .sbz-search-input {
        width: 100%;
        padding: 9px 14px 9px 36px;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255,255,255,0.14));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary, #f8fafc);
        font-size: 0.88rem;
        outline: none;
        transition: border-color 0.2s ease;
      }

      .sbz-search-input:focus {
        border-color: var(--accent-cyan, #00f2fe);
      }

      .sbz-search-icon {
        position: absolute;
        left: 11px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.9rem;
        pointer-events: none;
        opacity: 0.7;
      }

      .sbz-select {
        padding: 9px 12px;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255,255,255,0.14));
        background: rgba(15, 23, 42, 0.75);
        color: var(--text-primary, #f8fafc);
        font-size: 0.85rem;
        outline: none;
        cursor: pointer;
      }

      .sbz-results-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 0.83rem;
        color: var(--text-secondary, #94a3b8);
      }

      .sbz-reset-btn {
        background: transparent;
        border: 1px solid var(--border-glass, rgba(255,255,255,0.18));
        color: var(--accent-cyan, #00f2fe);
        border-radius: 8px;
        padding: 5px 11px;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
      }

      .sbz-reset-btn:hover {
        background: rgba(0, 242, 254, 0.12);
      }

      /* Craft Cards Grid */
      .sbz-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
        gap: 16px;
      }

      .sbz-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        background: var(--bg-card, rgba(30, 41, 59, 0.75));
        border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
        border-radius: 16px;
        padding: 18px;
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .sbz-card:hover {
        transform: translateY(-2px);
        border-color: rgba(245, 158, 11, 0.45);
        box-shadow: 0 12px 26px -10px rgba(0, 0, 0, 0.55);
      }

      .sbz-card.is-visited {
        border-left: 3px solid var(--accent-emerald, #10b981);
      }

      .sbz-card-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
        flex-wrap: wrap;
      }

      .sbz-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .sbz-cat-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .sbz-region-badge {
        font-size: 0.72rem;
        font-weight: 600;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.12);
        color: #7dd3fc;
        border: 1px solid rgba(56, 189, 248, 0.25);
      }

      .sbz-visit-pill {
        font-size: 0.71rem;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
      }

      .sbz-visit-pill.visited {
        background: rgba(16, 185, 129, 0.16);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.35);
      }

      .sbz-visit-pill.pending {
        background: rgba(148, 163, 184, 0.12);
        color: var(--text-secondary, #94a3b8);
        border: 1px solid rgba(148, 163, 184, 0.22);
      }

      .sbz-card-head {
        display: flex;
        align-items: flex-start;
        gap: 11px;
      }

      .sbz-card-emoji {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.45rem;
        flex-shrink: 0;
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.25);
      }

      .sbz-card-title {
        font-family: var(--font-heading, inherit);
        font-size: 1.06rem;
        font-weight: 700;
        line-height: 1.3;
        color: var(--text-primary, #f8fafc);
        margin: 0 0 3px;
      }

      .sbz-card-loc {
        font-size: 0.8rem;
        color: var(--accent-cyan, #38bdf8);
        font-weight: 600;
      }

      .sbz-meta-block {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.82rem;
        line-height: 1.5;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass, rgba(255,255,255,0.08));
        border-radius: 10px;
        padding: 10px 12px;
      }

      .sbz-meta-line strong {
        color: var(--accent-gold, #fbbf24);
        font-weight: 600;
      }

      .sbz-story {
        font-size: 0.84rem;
        line-height: 1.58;
        color: var(--text-secondary, #cbd5e1);
      }

      .sbz-heritage-tag {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--accent-emerald, #34d399);
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.22);
        border-radius: 8px;
        padding: 6px 10px;
      }

      .sbz-card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding-top: 6px;
        border-top: 1px solid var(--border-glass, rgba(255,255,255,0.08));
      }

      .sbz-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 7px 12px;
        border-radius: 9px;
        font-size: 0.79rem;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.18s ease;
      }

      .sbz-btn-city {
        background: rgba(0, 242, 254, 0.12);
        border-color: rgba(0, 242, 254, 0.3);
        color: var(--accent-cyan, #38bdf8);
      }

      .sbz-btn-city:hover {
        background: rgba(0, 242, 254, 0.22);
      }

      .sbz-btn-ai {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(168, 85, 247, 0.22));
        border-color: rgba(245, 158, 11, 0.4);
        color: #fde68a;
        flex: 1 1 auto;
      }

      .sbz-btn-ai:hover {
        filter: brightness(1.12);
      }

      .sbz-btn-detail {
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--border-glass, rgba(255,255,255,0.14));
        color: var(--text-secondary, #cbd5e1);
      }

      .sbz-btn-detail:hover {
        border-color: var(--accent-gold, #f59e0b);
        color: var(--text-primary, #ffffff);
      }

      /* Inline Detail Drawer */
      .sbz-detail-drawer {
        background:
          radial-gradient(circle at 90% 10%, rgba(245, 158, 11, 0.12), transparent 45%),
          var(--bg-glass, rgba(15, 23, 42, 0.9));
        border: 1px solid rgba(245, 158, 11, 0.42);
        border-radius: 16px;
        padding: 20px 22px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .sbz-detail-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        flex-wrap: wrap;
      }

      .sbz-detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 12px;
      }

      .sbz-detail-box {
        background: rgba(30, 41, 59, 0.55);
        border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
        border-radius: 12px;
        padding: 12px 14px;
        font-size: 0.85rem;
        line-height: 1.55;
      }

      .sbz-detail-box h4 {
        font-size: 0.79rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--accent-gold, #fbbf24);
        margin: 0 0 6px;
      }

      /* Gemini AI Panel */
      .sbz-ai-panel {
        background:
          radial-gradient(circle at 8% 12%, rgba(168, 85, 247, 0.14), transparent 45%),
          radial-gradient(circle at 92% 88%, rgba(245, 158, 11, 0.14), transparent 45%),
          var(--bg-glass, rgba(15, 23, 42, 0.88));
        border: 1px solid rgba(168, 85, 247, 0.35);
        border-radius: 18px;
        padding: 22px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .sbz-ai-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 12px;
      }

      .sbz-ai-title {
        font-family: var(--font-heading, inherit);
        font-size: 1.18rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        margin: 0 0 4px;
      }

      .sbz-ai-sub {
        font-size: 0.84rem;
        color: var(--text-secondary, #94a3b8);
      }

      .sbz-ai-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
      }

      .sbz-ai-select {
        flex: 1 1 250px;
        min-width: 210px;
      }

      .sbz-ai-trigger {
        padding: 9px 18px;
        border-radius: 10px;
        border: 1px solid rgba(245, 158, 11, 0.5);
        background: linear-gradient(135deg, #d97706, #7c3aed);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.86rem;
        cursor: pointer;
        transition: transform 0.18s ease, filter 0.18s ease;
      }

      .sbz-ai-trigger:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
      }

      .sbz-ai-trigger:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      .sbz-ai-angles {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .sbz-ai-output {
        background: rgba(10, 15, 29, 0.68);
        border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
        border-radius: 14px;
        padding: 18px 20px;
        font-size: 0.91rem;
        line-height: 1.7;
        color: var(--text-primary, #f1f5f9);
      }

      .sbz-ai-meta-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--border-glass, rgba(255,255,255,0.1));
        font-size: 0.78rem;
        color: var(--accent-cyan, #38bdf8);
      }

      .sbz-ai-output .seyyah-md-h1,
      .sbz-ai-output .seyyah-md-h2,
      .sbz-ai-output .seyyah-md-h3,
      .sbz-ai-output .seyyah-md-h4 {
        font-family: var(--font-heading, inherit);
        color: var(--accent-gold, #fbbf24);
        margin: 12px 0 6px;
      }

      .sbz-ai-output .seyyah-md-h1:first-child,
      .sbz-ai-output .seyyah-md-h2:first-child,
      .sbz-ai-output .seyyah-md-h3:first-child {
        margin-top: 0;
      }

      .sbz-ai-output .seyyah-md-p {
        margin: 0 0 10px;
      }

      .sbz-ai-output .seyyah-md-list {
        margin: 6px 0 12px 20px;
      }

      .sbz-ai-output .seyyah-md-quote {
        border-left: 3px solid var(--accent-gold, #f59e0b);
        padding: 8px 12px;
        background: rgba(245, 158, 11, 0.08);
        border-radius: 0 8px 8px 0;
        margin: 10px 0;
      }

      .sbz-empty {
        text-align: center;
        padding: 36px 20px;
        background: var(--bg-card, rgba(30,41,59,0.5));
        border: 1px dashed var(--border-glass, rgba(255,255,255,0.18));
        border-radius: 16px;
        color: var(--text-secondary, #94a3b8);
      }

      /* Light Theme Overrides */
      body.light-theme .sbz-root {
        color: var(--text-primary, #0f172a);
      }

      body.light-theme .sbz-hero {
        background:
          radial-gradient(circle at 12% 18%, rgba(217, 119, 6, 0.14), transparent 45%),
          radial-gradient(circle at 88% 82%, rgba(2, 132, 199, 0.12), transparent 46%),
          linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(241, 245, 249, 0.95) 100%);
        border-color: rgba(217, 119, 6, 0.35);
      }

      body.light-theme .sbz-hero-title {
        background: linear-gradient(135deg, #0f172a 0%, #b45309 55%, #0284c7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .sbz-pillar,
      body.light-theme .sbz-stat-box,
      body.light-theme .sbz-meta-block,
      body.light-theme .sbz-detail-box {
        background: rgba(248, 250, 252, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .sbz-ahilik-quote {
        background: rgba(217, 119, 6, 0.08);
        color: #1e293b;
      }

      body.light-theme .sbz-ahilik-quote strong,
      body.light-theme .sbz-pillar-head,
      body.light-theme .sbz-meta-line strong {
        color: #b45309;
      }

      body.light-theme .sbz-chip,
      body.light-theme .sbz-search-input,
      body.light-theme .sbz-select {
        background: rgba(255, 255, 255, 0.92);
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .sbz-chip.active {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.18), rgba(2, 132, 199, 0.14));
        border-color: #d97706;
        color: #0f172a;
      }

      body.light-theme .sbz-chip-count {
        background: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .sbz-card {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .sbz-cat-badge {
        background: rgba(217, 119, 6, 0.12);
        color: #b45309;
        border-color: rgba(217, 119, 6, 0.28);
      }

      body.light-theme .sbz-region-badge {
        background: rgba(2, 132, 199, 0.1);
        color: #0369a1;
        border-color: rgba(2, 132, 199, 0.24);
      }

      body.light-theme .sbz-visit-pill.visited {
        color: #047857;
      }

      body.light-theme .sbz-heritage-tag {
        color: #047857;
      }

      body.light-theme .sbz-btn-ai {
        color: #78350f;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(124, 58, 237, 0.14));
      }

      body.light-theme .sbz-btn-detail {
        background: rgba(15, 23, 42, 0.05);
        color: #334155;
      }

      body.light-theme .sbz-detail-drawer,
      body.light-theme .sbz-ai-panel {
        background: rgba(255, 255, 255, 0.95);
      }

      body.light-theme .sbz-ai-output {
        background: #f8fafc;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .sbz-ai-output .seyyah-md-h1,
      body.light-theme .sbz-ai-output .seyyah-md-h2,
      body.light-theme .sbz-ai-output .seyyah-md-h3 {
        color: #b45309;
      }

      @media (max-width: 860px) {
        .sbz-pillars {
          grid-template-columns: 1fr;
        }
        .sbz-stats-strip {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 520px) {
        .sbz-hero {
          padding: 18px 16px;
        }
        .sbz-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    const firstStyle = document.querySelector('link[rel="stylesheet"], style');
    if (firstStyle && firstStyle.parentNode) {
      firstStyle.parentNode.insertBefore(style, firstStyle);
    } else {
      document.head.appendChild(style);
    }
  }

  // ---------------------------------------------------------------------------
  // Offline Fallback Guide Generator
  // ---------------------------------------------------------------------------
  function buildOfflineBazaarGuide(focusId, angle, provincesMap) {
    const item = CRAFT_BY_ID.get(focusId);

    if (!item) {
      const visitedCrafts = CRAFTS_DATA.filter(function (c) {
        const p = provincesMap[c.provinceKey];
        return Boolean(p && p.visited);
      });
      const pendingCrafts = CRAFTS_DATA.filter(function (c) {
        const p = provincesMap[c.provinceKey];
        return !(p && p.visited);
      });
      const samplePending = pendingCrafts.slice(0, 4).map(function (c) {
        return `**${c.title}** (${c.cityName} · *${c.bazaar}*)`;
      }).join(', ');

      return [
        '### 🏺 Anadolu Bedesteni: Ahîlik Ahlâkı ve Yaşayan Çarşılar Rotası',
        '> *"Elini, kapını, sofranı açık tut; gözünü, dilini, belini bağlı tut."* — Ahî Evran-ı Velî',
        '',
        'Anadolu’da zanaat yalnızca bir üretim biçimi değil; ustanın çırağına nefes, taş ve ipekle terbiye aktardığı canlı bir **Ahîlik medeniyetidir**. Selçuklu ve Osmanlı şehirlerinde bedesten, arasta ve hanlar; mescidi, çeşmesi ve ortak esnaf sandığıyla şehrin kalbini oluştururdu.',
        '',
        `- **Seyyah İlerlemen:** Bedestendeki **${CRAFTS_DATA.length}** kadim zanaat durağından **${visitedCrafts.length}** tanesinin bulunduğu şehri ziyaret ettin.`,
        `- **Çarşı Adabı:** Zanaatkâr dükkânına aceleyle değil, selam ve merakla girilir. Tezgâh başındaki bir çekiç vuruşunu veya mekik atışını izlemek, eserin ruhunu anlamanın ilk adımıdır.`,
        pendingCrafts.length
          ? `- **Sıradaki Önerilen Duraklar:** ${samplePending}`
          : '- **Tebrikler:** Anadolu’nun tüm ikonik zanaat şehirlerini adımladın!',
        '',
        '#### 🧭 Zanaatlar Arası Keşif Tavsiyesi',
        '- **Seramik & Taş Rotası:** İznik → Kütahya → Eskişehir → Avanos → Erzurum',
        '- **İpek & Dokuma Hattı:** Bursa Koza Han → Denizli Buldan → Tokat → Diyarbakır Hasanpaşa Hanı → Siirt',
        '- **Tarihi Bedestenler:** İstanbul Kapalıçarşı → Edirne Selimiye Arastası → Kayseri → Gaziantep → Şanlıurfa Sipahi Pazarı'
      ].join('\n');
    }

    const prov = provincesMap[item.provinceKey] || null;
    const libName = prov ? (prov.custom_library || prov.library || '') : '';
    const landmarks = prov && Array.isArray(prov.landmarks) ? prov.landmarks.slice(0, 4).join(', ') : '';
    const angleTitle =
      angle === 'guide'
        ? 'Çarşı Gezi & Atölye Rehberi'
        : angle === 'ahilik'
          ? 'Ahîlik Ahlâkı & Lonca Felsefesi'
          : 'Ustanın Hikâyesi & Zanaatın Sırrı';

    const lines = [
      `### ${item.icon} ${item.title} — ${angleTitle}`,
      `> *"${item.ahilikNote}"*`,
      '',
      `**Dönem & Gelenek:** ${item.era} · **Tarihi Mekân:** *${item.bazaar}*`,
      '',
      '#### 🔨 Zanaatın Özü ve Hammadde',
      `- **Kullanılan Malzeme:** ${item.material}`,
      `- **Hikâye:** ${item.story}`,
      `- **Miras Statüsü:** ${item.heritage}`,
      '',
      '#### 🧭 Seyyah İçin Çarşı & Şehir Notları',
      `- **Atölye İpucu:** ${item.visitTip}`
    ];

    if (landmarks) {
      lines.push(`- **Aynı Şehirdeki Diğer Duraklar:** ${landmarks}`);
    }
    if (libName) {
      lines.push(`- **Dijital Seyyah Ofisi (İl Kütüphanesi):** Çarşı yürüyüşünün ardından çalışma ve okuma molası için **${libName}** seni bekler.`);
    }

    lines.push('', `*Durum:* **${prov && prov.visited ? 'Bu şehri ziyaret ettin — anılarını not düşebilirsin.' : 'Henüz gidilmedi — sonraki Anadolu rotana ekle!'}**`);
    return lines.join('\n');
  }

  // ---------------------------------------------------------------------------
  // Main Render Entry Point: window.SEYYAH_MODULES.bazaar.render(container, ctx)
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const esc = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const norm = typeof safeCtx.normalizeTurkish === 'function' ? safeCtx.normalizeTurkish : fallbackNormalizeTurkish;
    const provincesMap = (safeCtx.data && safeCtx.data.provinces) || {};
    const regionsMeta = (safeCtx.data && safeCtx.data.regions) || DEFAULT_REGIONS;

    // Precompute counts & visited status
    function isVisited(item) {
      const prov = provincesMap[item.provinceKey];
      return Boolean(prov && prov.visited);
    }

    function getProvinceName(item) {
      const prov = provincesMap[item.provinceKey];
      return (prov && prov.name) || item.cityName;
    }

    const totalCrafts = CRAFTS_DATA.length;
    const uniqueProvinceCount = new Set(CRAFTS_DATA.map(function (c) { return c.provinceKey; })).size;
    const visitedCraftCount = CRAFTS_DATA.filter(isVisited).length;
    const visitedPct = totalCrafts > 0 ? Math.round((visitedCraftCount / totalCrafts) * 100) : 0;

    function getFilteredCrafts() {
      const q = norm(uiState.searchQuery);
      return CRAFTS_DATA.filter(function (item) {
        if (uiState.category !== 'all' && item.category !== uiState.category) return false;
        if (uiState.region !== 'all' && item.regionCode !== uiState.region) return false;
        if (uiState.visitedOnly && !isVisited(item)) return false;
        if (q) {
          const prov = provincesMap[item.provinceKey];
          const haystack = norm([
            item.title,
            item.cityName,
            prov ? prov.name : '',
            item.category,
            item.bazaar,
            item.material,
            item.story,
            item.heritage,
            item.era
          ].join(' '));
          if (haystack.indexOf(q) === -1) return false;
        }
        return true;
      });
    }

    function buildCategoryChipsHtml() {
      const allActive = uiState.category === 'all' ? 'active' : '';
      let html = `<button type="button" class="sbz-chip ${allActive}" data-sbz-cat="all">🏺 Tümü <span class="sbz-chip-count">${totalCrafts}</span></button>`;
      CRAFT_CATEGORIES.forEach(function (cat) {
        const meta = CATEGORY_META[cat] || { icon: '✨', short: cat };
        const count = CRAFTS_DATA.filter(function (c) { return c.category === cat; }).length;
        const active = uiState.category === cat ? 'active' : '';
        html += `<button type="button" class="sbz-chip ${active}" data-sbz-cat="${esc(cat)}">${esc(meta.icon)} ${esc(cat)} <span class="sbz-chip-count">${count}</span></button>`;
      });
      return html;
    }

    function buildRegionOptionsHtml() {
      let opts = `<option value="all"${uiState.region === 'all' ? ' selected' : ''}>🗺️ Tüm Bölgeler (7 Bölge)</option>`;
      Object.keys(DEFAULT_REGIONS).forEach(function (rCode) {
        const rInfo = regionsMeta[rCode] || DEFAULT_REGIONS[rCode];
        const count = CRAFTS_DATA.filter(function (c) { return c.regionCode === rCode; }).length;
        const selected = uiState.region === rCode ? ' selected' : '';
        opts += `<option value="${esc(rCode)}"${selected}>${esc(rInfo.icon || '')} ${esc(rInfo.name || rCode)} (${count})</option>`;
      });
      return opts;
    }

    function buildDetailDrawerHtml() {
      if (!uiState.detailId) return '';
      const item = CRAFT_BY_ID.get(uiState.detailId);
      if (!item) return '';
      const prov = provincesMap[item.provinceKey] || null;
      const visited = isVisited(item);
      const regionInfo = regionsMeta[item.regionCode] || DEFAULT_REGIONS[item.regionCode] || {};
      const libName = prov ? (prov.custom_library || prov.library || 'İl Halk Kütüphanesi') : 'İl Halk Kütüphanesi';
      const landmarks = prov && Array.isArray(prov.landmarks) && prov.landmarks.length
        ? prov.landmarks.join(' · ')
        : 'Şehir tarihi merkezinde yer alır';

      return `
        <section class="sbz-detail-drawer" id="sbz-detail-drawer" aria-label="Zanaat Detayı">
          <div class="sbz-detail-head">
            <div>
              <div class="sbz-badges" style="margin-bottom:8px;">
                <span class="sbz-cat-badge">${esc((CATEGORY_META[item.category] || {}).icon || '🏺')} ${esc(item.category)}</span>
                <span class="sbz-region-badge">${esc(regionInfo.short || regionInfo.name || '')}</span>
                <span class="sbz-visit-pill ${visited ? 'visited' : 'pending'}">${visited ? '✅ İl Ziyaret Edildi' : '🧭 Keşif Listesinde'}</span>
              </div>
              <h3 style="margin:0; font-size:1.25rem; font-family:var(--font-heading,inherit);">${esc(item.icon)} ${esc(item.title)} — ${esc(item.cityName)}</h3>
              <div style="font-size:0.84rem; color:var(--text-secondary,#94a3b8); margin-top:3px;">${esc(item.era)} · ${esc(item.heritage)}</div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" class="sbz-btn sbz-btn-city" data-sbz-goto="${esc(item.provinceKey)}">📍 Şehre Git (${esc(getProvinceName(item))})</button>
              <button type="button" class="sbz-btn sbz-btn-ai" data-sbz-ai="${esc(item.id)}">✨ AI Usta Hikâyesi</button>
              <button type="button" class="sbz-btn sbz-btn-detail" data-sbz-close-detail="1">✕ Kapat</button>
            </div>
          </div>

          <div class="sbz-detail-grid">
            <div class="sbz-detail-box">
              <h4>🏛️ Tarihi Çarşı & Bedesten</h4>
              <div><strong>${esc(item.bazaar)}</strong></div>
              <div style="margin-top:6px;">${esc(item.story)}</div>
            </div>
            <div class="sbz-detail-box">
              <h4>⚒️ Hammadde & Atölye Sırrı</h4>
              <div><strong>Malzeme:</strong> ${esc(item.material)}</div>
              <div style="margin-top:6px;"><strong>Gezi İpucu:</strong> ${esc(item.visitTip)}</div>
            </div>
            <div class="sbz-detail-box">
              <h4>🤲 Ahîlik Ahlâkı & Şehir Bağlantısı</h4>
              <div>${esc(item.ahilikNote)}</div>
              <div style="margin-top:8px; font-size:0.8rem; color:var(--text-secondary,#94a3b8);">
                <strong>Kütüphane:</strong> ${esc(libName)}<br />
                <strong>Duraklar:</strong> ${esc(landmarks)}
              </div>
            </div>
          </div>
        </section>
      `;
    }

    function buildCardsHtml(list) {
      if (!list.length) {
        return `
          <div class="sbz-empty">
            <div style="font-size:2rem; margin-bottom:8px;">🏺</div>
            <div style="font-weight:700; margin-bottom:4px;">Aradığınız kritere uygun zanaat veya çarşı bulunamadı.</div>
            <div style="font-size:0.85rem; margin-bottom:12px;">Filtreleri temizleyerek 24 Anadolu zanaatının tamamını yeniden görüntüleyebilirsiniz.</div>
            <button type="button" class="sbz-reset-btn" data-sbz-reset="1">Tüm Filtreleri Sıfırla</button>
          </div>
        `;
      }

      return `<div class="sbz-grid">` + list.map(function (item) {
        const visited = isVisited(item);
        const regionInfo = regionsMeta[item.regionCode] || DEFAULT_REGIONS[item.regionCode] || {};
        const catMeta = CATEGORY_META[item.category] || { icon: '✨', short: item.category };
        const provName = getProvinceName(item);

        return `
          <article class="sbz-card ${visited ? 'is-visited' : ''}" data-sbz-card="${esc(item.id)}">
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div class="sbz-card-top">
                <div class="sbz-badges">
                  <span class="sbz-cat-badge">${esc(catMeta.icon)} ${esc(item.category)}</span>
                  <span class="sbz-region-badge">${esc(regionInfo.short || regionInfo.name || '')}</span>
                </div>
                <span class="sbz-visit-pill ${visited ? 'visited' : 'pending'}">${visited ? '✅ Gezildi' : '🧭 Keşfet'}</span>
              </div>

              <div class="sbz-card-head">
                <div class="sbz-card-emoji" aria-hidden="true">${esc(item.icon)}</div>
                <div>
                  <h3 class="sbz-card-title">${esc(item.title)}</h3>
                  <div class="sbz-card-loc">📍 ${esc(item.cityName)} · ${esc(item.era)}</div>
                </div>
              </div>

              <div class="sbz-meta-block">
                <div class="sbz-meta-line"><strong>Tarihi Çarşı:</strong> ${esc(item.bazaar)}</div>
                <div class="sbz-meta-line"><strong>Hammadde:</strong> ${esc(item.material)}</div>
              </div>

              <p class="sbz-story">${esc(item.story)}</p>
              <div class="sbz-heritage-tag">🏅 ${esc(item.heritage)}</div>
            </div>

            <div class="sbz-card-actions">
              <button type="button" class="sbz-btn sbz-btn-city" data-sbz-goto="${esc(item.provinceKey)}" title="${esc(provName)} il sayfasına git">📍 Şehre Git</button>
              <button type="button" class="sbz-btn sbz-btn-detail" data-sbz-detail="${esc(item.id)}">🔍 Detay</button>
              <button type="button" class="sbz-btn sbz-btn-ai" data-sbz-ai="${esc(item.id)}">✨ Ustanın Hikâyesi</button>
            </div>
          </article>
        `;
      }).join('') + `</div>`;
    }

    function buildAiFocusOptionsHtml() {
      let html = `<option value="general"${uiState.aiFocusId === 'general' ? ' selected' : ''}>🏺 Genel Anadolu Ahîlik & Bedesten Rotası (24 Zanaat)</option>`;
      CRAFTS_DATA.forEach(function (c) {
        const selected = uiState.aiFocusId === c.id ? ' selected' : '';
        html += `<option value="${esc(c.id)}"${selected}>${esc(c.icon)} ${esc(c.title)} (${esc(c.cityName)})</option>`;
      });
      return html;
    }

    function buildAiOutputHtml() {
      const focusedCraft = CRAFT_BY_ID.get(uiState.aiFocusId) || null;
      const gotoBtn = focusedCraft
        ? `<button type="button" class="sbz-btn sbz-btn-city" data-sbz-goto="${esc(focusedCraft.provinceKey)}">📍 Şehre Git (${esc(getProvinceName(focusedCraft))})</button>`
        : '';

      if (uiState.aiStatus === 'idle' && !uiState.aiText) {
        const previewMd = buildOfflineBazaarGuide('general', uiState.aiAngle, provincesMap);
        return `
          <div class="sbz-ai-output">
            <div class="sbz-ai-meta-bar">
              <span>📜 Hazır Bedesten Rehberi · Yukarıdan bir zanaat seçin veya canlı Gemini AI anlatımı başlatın</span>
            </div>
            <div id="sbz-ai-md-body">${renderMdSafe(previewMd, esc)}</div>
          </div>
        `;
      }

      const statusLabel = uiState.aiStatus === 'loading'
        ? '⏳ Ustanın hikâyesi ve çarşı rehberi yazılıyor...'
        : (uiState.aiSource || '✨ Gemini AI Bedesten Rehberi');

      const bodyContent = uiState.aiText
        ? renderMdSafe(uiState.aiText, esc)
        : '<p class="seyyah-md-p"><em>Anlatım hazırlanıyor...</em></p>';

      return `
        <div class="sbz-ai-output">
          <div class="sbz-ai-meta-bar">
            <span>${esc(statusLabel)}</span>
            ${gotoBtn}
          </div>
          <div id="sbz-ai-md-body">${bodyContent}</div>
        </div>
      `;
    }

    function updateListOnly() {
      const list = getFilteredCrafts();
      const gridHost = container.querySelector('#sbz-grid-host');
      const countEl = container.querySelector('#sbz-results-count');
      if (gridHost) {
        gridHost.innerHTML = buildCardsHtml(list);
      }
      if (countEl) {
        countEl.textContent = `${list.length} / ${totalCrafts} zanaat & tarihi çarşı listeleniyor`;
      }
    }

    function paint() {
      const filtered = getFilteredCrafts();
      const hasActiveFilters =
        uiState.category !== 'all' ||
        uiState.region !== 'all' ||
        uiState.visitedOnly ||
        Boolean(uiState.searchQuery);

      const angleLabels = [
        { id: 'story', label: '📜 Usta Hikâyesi & Çıraklık' },
        { id: 'guide', label: '🧭 Çarşı Gezi & Atölye Rehberi' },
        { id: 'ahilik', label: '🤲 Ahîlik Ahlâkı & Lonca Sırrı' }
      ];

      container.innerHTML = `
        <div class="sbz-root" id="sbz-root">
          <!-- Hero & Ahilik Manifesto -->
          <header class="sbz-hero">
            <div class="sbz-hero-kicker">🏺 Anadolu Lonca &amp; Bedesten Mirası</div>
            <h2 class="sbz-hero-title">🏺 Anadolu Geleneksel Sanatlar, Zanaatlar &amp; Tarihi Çarşılar Bedesteni</h2>
            <p class="sbz-hero-sub">
              Anadolu’nun kalbinde asırlardır çekiç sesiyle bakırı konuşturan, mekikle ipeği ören, kuvarsla çiniye can veren
              <strong>24 kadim zanaat</strong> ve onları yaşatan tarihi han, arasta ve bedestenler.
            </p>
            <blockquote class="sbz-ahilik-quote">
              <strong>Ahîlik Ahlâkı:</strong> <em>"Elini, kapını, sofranı açık tut; gözünü, dilini, belini bağlı tut."</em>
              — Ahî Evran-ı Velî’nin asırlar öncesinden bugüne uzanan dürüstlük, ustalık ve paylaşım terazisi.
            </blockquote>

            <div class="sbz-pillars">
              ${AHILIK_PRINCIPLES.map(function (p) {
                return `
                  <div class="sbz-pillar">
                    <div class="sbz-pillar-head">${esc(p.icon)} ${esc(p.title)}</div>
                    <div class="sbz-pillar-sub">${esc(p.subtitle)}</div>
                    <div class="sbz-pillar-desc">${esc(p.desc)}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="sbz-stats-strip">
              <div class="sbz-stat-box">
                <div class="sbz-stat-val">${totalCrafts}</div>
                <div class="sbz-stat-lbl">Kadim Zanaat &amp; Tarihi Çarşı</div>
              </div>
              <div class="sbz-stat-box">
                <div class="sbz-stat-val">${uniqueProvinceCount} İl</div>
                <div class="sbz-stat-lbl">7 Bölgeden Doğrulanmış Merkez</div>
              </div>
              <div class="sbz-stat-box">
                <div class="sbz-stat-val">${visitedCraftCount} / ${totalCrafts}</div>
                <div class="sbz-stat-lbl">Ziyaret Ettiğin İllerdeki Zanaatlar</div>
              </div>
              <div class="sbz-stat-box">
                <div class="sbz-stat-val">%${visitedPct}</div>
                <div class="sbz-stat-lbl">Bedesten Keşif Tamamlanma</div>
              </div>
            </div>
          </header>

          <!-- Filter & Search Toolbar -->
          <section class="sbz-toolbar" aria-label="Zanaat ve Çarşı Filtreleri">
            <div class="sbz-toolbar-row">
              <div class="sbz-chip-group" role="tablist" aria-label="Zanaat Kategorileri">
                ${buildCategoryChipsHtml()}
              </div>
            </div>

            <div class="sbz-toolbar-row">
              <div class="sbz-search-wrap">
                <span class="sbz-search-icon" aria-hidden="true">🔍</span>
                <input
                  type="search"
                  id="sbz-search-input"
                  class="sbz-search-input"
                  placeholder="Zanaat, şehir, çarşı, hammadde ara (ör. çini, telkâri, Koza Han)..."
                  value="${esc(uiState.searchQuery)}"
                />
              </div>

              <select id="sbz-region-select" class="sbz-select" aria-label="Bölge Filtresi">
                ${buildRegionOptionsHtml()}
              </select>

              <button
                type="button"
                class="sbz-chip ${uiState.visitedOnly ? 'active' : ''}"
                id="sbz-visited-toggle"
              >
                ✅ Sadece Gezdiğim İller
              </button>
            </div>

            <div class="sbz-results-meta">
              <span id="sbz-results-count">${filtered.length} / ${totalCrafts} zanaat &amp; tarihi çarşı listeleniyor</span>
              ${hasActiveFilters ? '<button type="button" class="sbz-reset-btn" data-sbz-reset="1">✕ Filtreleri Temizle</button>' : ''}
            </div>
          </section>

          <!-- Inline Craft Detail Drawer -->
          ${buildDetailDrawerHtml()}

          <!-- Craft Cards Grid -->
          <section id="sbz-grid-host" aria-label="Anadolu Zanaatları ve Tarihi Çarşılar">
            ${buildCardsHtml(filtered)}
          </section>

          <!-- Gemini AI Studio Panel -->
          <section class="sbz-ai-panel" id="sbz-ai-panel" aria-label="Gemini AI Ustaların Hikayesi ve Çarşı Rehberi">
            <div class="sbz-ai-header">
              <div>
                <h3 class="sbz-ai-title">✨ Gemini AI ile Ustaların Hikâyesi &amp; Çarşı Rehberi</h3>
                <div class="sbz-ai-sub">
                  Seçtiğin zanaatın usta-çırak silsilesini, Ahîlik adaplarını ve tarihi çarşı yürüyüş rotasını keşfet. Çevrimdışı durumda yerel bedesten arşivi devreye girer.
                </div>
              </div>
            </div>

            <div class="sbz-ai-angles">
              ${angleLabels.map(function (ang) {
                const active = uiState.aiAngle === ang.id ? 'active' : '';
                return `<button type="button" class="sbz-chip ${active}" data-sbz-angle="${esc(ang.id)}">${esc(ang.label)}</button>`;
              }).join('')}
            </div>

            <div class="sbz-ai-controls">
              <select id="sbz-ai-focus" class="sbz-select sbz-ai-select" aria-label="AI Odak Zanaatı">
                ${buildAiFocusOptionsHtml()}
              </select>
              <button
                type="button"
                id="sbz-ai-trigger"
                class="sbz-ai-trigger"
                ${uiState.aiStatus === 'loading' ? 'disabled' : ''}
              >
                ${uiState.aiStatus === 'loading' ? '⏳ Anlatım Hazırlanıyor...' : '✨ Ustanın Hikâyesini &amp; Rehberi Getir'}
              </button>
            </div>

            <div id="sbz-ai-output-host">
              ${buildAiOutputHtml()}
            </div>
          </section>
        </div>
      `;

      bindEvents();
    }

    async function runAiGuide(explicitFocusId) {
      if (explicitFocusId) {
        uiState.aiFocusId = explicitFocusId;
      }
      const focusId = uiState.aiFocusId || 'general';
      const reqToken = ++uiState.aiRequestToken;

      uiState.aiStatus = 'loading';
      uiState.aiError = '';
      uiState.aiText = '';
      uiState.aiSource = '';
      paint();

      const canUseLiveAi =
        window.SEYYAH_AI &&
        typeof window.SEYYAH_AI.stream === 'function' &&
        typeof window.SEYYAH_AI.hasKey === 'function' &&
        window.SEYYAH_AI.hasKey();

      if (!canUseLiveAi) {
        uiState.aiStatus = 'done';
        uiState.aiText = buildOfflineBazaarGuide(focusId, uiState.aiAngle, provincesMap);
        uiState.aiSource = '📜 Çevrimdışı Bedesten & Ahîlik Arşivi';
        paint();
        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast('📜 Çevrimdışı Bedesten Arşivinden usta rehberi hazırlandı.');
        }
        return;
      }

      const anatoliaCtx =
        typeof window.SEYYAH_AI.buildAnatoliaContext === 'function'
          ? window.SEYYAH_AI.buildAnatoliaContext(safeCtx)
          : '';

      const angleInstruction =
        uiState.aiAngle === 'guide'
          ? 'Odak: Çarşı gezi rotası, atölye ziyaret adabı, hakiki el emeğini sahtesinden ayırt etme ipuçları ve şehir içi yürüyüş planı.'
          : uiState.aiAngle === 'ahilik'
            ? 'Odak: Ahîlik ahlâkı ("Elini, kapını, sofranı açık tut"), şed kuşanma, çırak-kalfa-usta terbiyesi ve esnaf lonca kültürü.'
            : 'Odak: Etkileyici bir usta-çırak hikâyesi, zanaatın tarihi kökeni, hammadde dönüşümü ve atölye atmosferi.';

      const systemPrompt = [
        'Sen Anadolu geleneksel el sanatları, lonca/Ahîlik kültürü ve tarihi Osmanlı/Selçuklu çarşıları (bedesten, arasta, han) konusunda derin bilgili bir kültür tarihçisi ve seyyahsın.',
        'Temel ilke: Ahî Evran’ın "Elini, kapını, sofranı açık tut" düsturu.',
        'Yanıtını akıcı, somut, tarihi ve coğrafi verilere sadık Markdown formatında (alt başlıklar, alıntı ve madde işaretleri ile) Türkçe yaz.'
      ].join('\n');

      const focusedCraft = CRAFT_BY_ID.get(focusId);
      let userPrompt = '';
      if (focusedCraft) {
        const prov = provincesMap[focusedCraft.provinceKey];
        const lib = prov ? (prov.custom_library || prov.library || '') : '';
        const landmarks = prov && Array.isArray(prov.landmarks) ? prov.landmarks.join(', ') : '';
        userPrompt = [
          `Zanaat: ${focusedCraft.title} (${focusedCraft.cityName})`,
          `Kategori: ${focusedCraft.category} | Dönem: ${focusedCraft.era}`,
          `Tarihi Çarşı: ${focusedCraft.bazaar}`,
          `Hammadde & Teknik: ${focusedCraft.material}`,
          `Ahîlik Notu: ${focusedCraft.ahilikNote}`,
          `Gezi İpucu: ${focusedCraft.visitTip}`,
          lib ? `İl Halk Kütüphanesi: ${lib}` : '',
          landmarks ? `Şehrin Diğer Önemli Durakları: ${landmarks}` : '',
          `Seyyahın İli Ziyaret Durumu: ${prov && prov.visited ? 'Gezildi' : 'Henüz Gezilmedi'}`,
          angleInstruction
        ].filter(Boolean).join('\n');
      } else {
        userPrompt = [
          `Anadolu Bedesteni 24 İkonik Zanaat Listesi: ${CRAFTS_DATA.map(function (c) { return `${c.title} (${c.cityName})`; }).join(', ')}.`,
          `Seyyah İlerlemesi: 24 zanaatın ${visitedCraftCount} tanesinin bulunduğu iller ziyaret edildi.`,
          angleInstruction,
          'Anadolu’daki İpek Yolu çarşılarını ve Ahîlik geleneğini özetleyen ilham verici bir rota önerisi sun.'
        ].join('\n');
      }

      if (anatoliaCtx) {
        userPrompt += `\n\nGenel Seyahat Bağlamı:\n${anatoliaCtx}`;
      }

      try {
        const res = await window.SEYYAH_AI.stream({
          prompt: userPrompt,
          system: systemPrompt,
          temperature: 0.75,
          maxTokens: 1600,
          cacheKey: `bazaar:${focusId}:${uiState.aiAngle}:v${visitedCraftCount}`,
          onChunk: function (_delta, fullText) {
            if (reqToken !== uiState.aiRequestToken) return;
            uiState.aiText = fullText;
            const mdBody = container.querySelector('#sbz-ai-md-body');
            if (mdBody) {
              mdBody.innerHTML = renderMdSafe(fullText, esc);
            }
          }
        });

        if (reqToken !== uiState.aiRequestToken) return;
        uiState.aiStatus = 'done';
        uiState.aiText = (res && res.text) || uiState.aiText || buildOfflineBazaarGuide(focusId, uiState.aiAngle, provincesMap);
        uiState.aiSource = res && res.model
          ? `⚡ Gemini AI (${res.model})${res.cached ? ' · Önbellek' : ''}`
          : '⚡ Gemini AI Canlı Rehber';
        paint();
      } catch (err) {
        if (reqToken !== uiState.aiRequestToken) return;
        uiState.aiStatus = 'done';
        uiState.aiError = (err && err.message) || 'AI yanıtı alınamadı';
        uiState.aiText = buildOfflineBazaarGuide(focusId, uiState.aiAngle, provincesMap);
        uiState.aiSource = '📜 Çevrimdışı Bedesten Arşivi (AI Yedeği)';
        paint();
        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast('⚠️ Gemini AI yanıt veremedi — Çevrimdışı bedesten arşivi gösteriliyor.');
        }
      }
    }

    function bindEvents() {
      const root = container.querySelector('#sbz-root');
      if (!root) return;

      const searchInput = root.querySelector('#sbz-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', function (e) {
          uiState.searchQuery = e.target.value || '';
          updateListOnly();
        });
      }

      const regionSelect = root.querySelector('#sbz-region-select');
      if (regionSelect) {
        regionSelect.addEventListener('change', function (e) {
          uiState.region = e.target.value || 'all';
          paint();
        });
      }

      const visitedToggle = root.querySelector('#sbz-visited-toggle');
      if (visitedToggle) {
        visitedToggle.addEventListener('click', function () {
          uiState.visitedOnly = !uiState.visitedOnly;
          paint();
        });
      }

      const aiFocusSelect = root.querySelector('#sbz-ai-focus');
      if (aiFocusSelect) {
        aiFocusSelect.addEventListener('change', function (e) {
          uiState.aiFocusId = e.target.value || 'general';
        });
      }

      const aiTrigger = root.querySelector('#sbz-ai-trigger');
      if (aiTrigger) {
        aiTrigger.addEventListener('click', function () {
          runAiGuide();
        });
      }

      root.addEventListener('click', function (ev) {
        const target = ev.target;
        if (!target || typeof target.closest !== 'function') return;

        const catBtn = target.closest('[data-sbz-cat]');
        if (catBtn) {
          uiState.category = catBtn.getAttribute('data-sbz-cat') || 'all';
          paint();
          return;
        }

        const resetBtn = target.closest('[data-sbz-reset]');
        if (resetBtn) {
          uiState.category = 'all';
          uiState.region = 'all';
          uiState.visitedOnly = false;
          uiState.searchQuery = '';
          paint();
          return;
        }

        const gotoBtn = target.closest('[data-sbz-goto]');
        if (gotoBtn) {
          const cityKey = gotoBtn.getAttribute('data-sbz-goto');
          if (cityKey && typeof safeCtx.selectCity === 'function') {
            safeCtx.selectCity(cityKey);
          }
          return;
        }

        const detailBtn = target.closest('[data-sbz-detail]');
        if (detailBtn) {
          const id = detailBtn.getAttribute('data-sbz-detail');
          uiState.detailId = uiState.detailId === id ? null : id;
          paint();
          if (uiState.detailId) {
            const drawer = container.querySelector('#sbz-detail-drawer');
            if (drawer && typeof drawer.scrollIntoView === 'function') {
              drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
          return;
        }

        const closeDetailBtn = target.closest('[data-sbz-close-detail]');
        if (closeDetailBtn) {
          uiState.detailId = null;
          paint();
          return;
        }

        const aiBtn = target.closest('[data-sbz-ai]');
        if (aiBtn) {
          const craftId = aiBtn.getAttribute('data-sbz-ai') || 'general';
          const aiPanel = container.querySelector('#sbz-ai-panel');
          if (aiPanel && typeof aiPanel.scrollIntoView === 'function') {
            aiPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          runAiGuide(craftId);
          return;
        }

        const angleBtn = target.closest('[data-sbz-angle]');
        if (angleBtn) {
          uiState.aiAngle = angleBtn.getAttribute('data-sbz-angle') || 'story';
          paint();
        }
      });
    }

    paint();
  }

  window.SEYYAH_MODULES.bazaar = {
    render: render
  };
})();
