/**
 * Anadolu Seyahatnamesi — Anadolu İrfan Sözlüğü: 7 Bölge Deyimler, Atasözleri & Yol Duaları
 * 7 coğrafi bölgeden 28 özgün seyahat atasözü, kervansaray hikmeti, yöresel ağız/kelime
 * hazinesi ve kadim yolcu duası; Türkçe duyarlı arama, rastgele söz çekme spotlight kartı,
 * il bağlantısı ve Gemini AI canlı hikâye/felsefe akışı (çevrimdışı yedekli).
 * Registers on window.SEYYAH_MODULES.proverbs = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-anadolu-proverbs-styles';

  const REGIONS = [
    { code: 'all', label: 'Tümü', fullLabel: 'Tüm Bölgeler', icon: '🗺️' },
    { code: '01_Marmara', label: 'Marmara', fullLabel: 'Marmara', icon: '🌉' },
    { code: '02_Ege', label: 'Ege', fullLabel: 'Ege', icon: '🫒' },
    { code: '03_Akdeniz', label: 'Akdeniz', fullLabel: 'Akdeniz', icon: '🍊' },
    { code: '04_IcAnadolu', label: 'İç Anadolu', fullLabel: 'İç Anadolu', icon: '🌾' },
    { code: '05_Karadeniz', label: 'Karadeniz', fullLabel: 'Karadeniz', icon: '🌲' },
    { code: '06_DoguAnadolu', label: 'Doğu Anadolu', fullLabel: 'Doğu Anadolu', icon: '🏔️' },
    { code: '07_GuneydoguAnadolu', label: 'Güneydoğu', fullLabel: 'Güneydoğu Anadolu', icon: '🕌' }
  ];

  const CATEGORIES = [
    {
      id: 'all',
      label: 'Tümü',
      icon: '✨',
      color: '#00f2fe',
      badgeBg: 'rgba(0, 242, 254, 0.14)'
    },
    {
      id: 'yol-sefer',
      label: '🛣️ Yol & Sefer Atasözleri',
      shortLabel: 'Yol & Sefer',
      icon: '🛣️',
      color: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.16)'
    },
    {
      id: 'misafir-kervansaray',
      label: '🏡 Misafir & Kervansaray Hikmetleri',
      shortLabel: 'Misafir & Kervansaray',
      icon: '🏡',
      color: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.16)'
    },
    {
      id: 'yoresel-agiz',
      label: '🗣️ Yöresel Ağız & Kelime Hazinesi',
      shortLabel: 'Yöresel Ağız',
      icon: '🗣️',
      color: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.16)'
    },
    {
      id: 'yolcu-dualari',
      label: '🤲 Kadim Yolcu Duaları',
      shortLabel: 'Yolcu Duaları',
      icon: '🤲',
      color: '#a855f7',
      badgeBg: 'rgba(168, 85, 247, 0.16)'
    }
  ];

  const REGION_META = {};
  REGIONS.forEach(function (r) {
    REGION_META[r.code] = r;
  });

  const CATEGORY_META = {};
  CATEGORIES.forEach(function (c) {
    CATEGORY_META[c.id] = c;
  });

  // 28 Authentic Anatolian Proverbs, Kervansaray Maxims, Regional Dialects & Traveler Prayers
  // 7 regions × 4 categories = 28 entries, each mapped to a real province key in ctx.data.provinces
  const PROVERBS_CORPUS = [
    // 01_Marmara (4)
    {
      id: 'marmara-yol-edirne',
      regionCode: '01_Marmara',
      category: 'yol-sefer',
      provinceKey: '01_Marmara/Edirne',
      provinceLabel: 'Edirne',
      text: 'Yol yürümekle, borç ödemekle tükenir.',
      pronunciation: 'Rumeli & Trakya Kervan Sözü',
      meaning: 'En uzun mesafe de en ağır sorumluluk da ertelenmeden adım atıldığında azalır; menzile varmanın tek sırrı yola koyulup istikrarla yürümektir.',
      context: 'Balkanlar’a açılan tarihî Sultanlar Yolu’nun başlangıç menzili Edirne’de kervancıların ve seyyahların birbirine sabır ve azim aşılamak için söylediği kadim atasözü.',
      travelerNote: 'Büyük rotaları gözünde büyütmek yerine günün ilk durağına odaklanan gezgin, yolu kendi lehine çevirir.',
      tags: ['Azim', 'Rumeli Yolu', 'İstikrar', 'Menzil']
    },
    {
      id: 'marmara-misafir-bursa',
      regionCode: '01_Marmara',
      category: 'misafir-kervansaray',
      provinceKey: '01_Marmara/Bursa',
      provinceLabel: 'Bursa',
      text: 'Misafir on kısmetle gelir; birini yer, dokuzunu bırakır.',
      pronunciation: 'Bursa Hanlar Bölgesi & Osmanlı Sofrası Hikmeti',
      meaning: 'Konuğu ağırlamak ev sahibinden bir şey eksiltmez; aksine bereket, muhabbet ve gönül zenginliği getirir.',
      context: 'Koza Han ve Pirinç Han gibi asırlık Bursa hanlarında uzak diyarlardan gelen tüccar ve seyyahlara kapı açılırken söylenen köklü misafirperverlik düsturu.',
      travelerNote: 'Bir şehre yalnızca tüketici olarak değil, nezaket ve güzel söz taşıyan bir konuk olarak girdiğinde kapılar kendiliğinden açılır.',
      tags: ['Bereket', 'Han Geleneği', 'İkram', 'Paylaşım']
    },
    {
      id: 'marmara-agiz-kirklareli',
      regionCode: '01_Marmara',
      category: 'yoresel-agiz',
      provinceKey: '01_Marmara/Kirklareli',
      provinceLabel: 'Kırklareli',
      text: 'Abe kızan, hayde bre; yolcu yolunda gerek!',
      pronunciation: 'Trakya Ağzı · "kızan" (genç delikanlı/yol arkadaşı), "hayde bre" (neşe ve gayret çağrısı)',
      meaning: 'Trakya ağızlarında samimiyetin ve yol arkadaşlığının simgesi: "Kardeşim, haydi bakalım, vakit geldi; yola revan olalım."',
      context: 'Istranca eteklerinden Trakya köylerine uzanan sohbetlerde gençlere ve yola çıkacak misafirlere sıcak bir gülümsemeyle sesleniş biçimi.',
      travelerNote: 'Yerel ağızdaki bir selamı öğrenmek, bir bölgenin kalbine açılan en hızlı anahtardır.',
      tags: ['Trakya Ağzı', 'Kızan', 'Yoldaşlık', 'Samimiyet']
    },
    {
      id: 'marmara-dua-istanbul',
      regionCode: '01_Marmara',
      category: 'yolcu-dualari',
      provinceKey: '01_Marmara/Istanbul',
      provinceLabel: 'İstanbul',
      text: 'Yolun da bahtın da açık ola; su gibi gidip su gibi gelesin.',
      pronunciation: 'Boğaz İskeleleri & Üsküdar Menzili Uğurlama Duası',
      meaning: 'Yolcunun önündeki engellerin su gibi akıp gitmesi, yolculuğunun berrak, huzurlu ve sağ salim tamamlanması için edilen kadim dua.',
      context: 'İstanbul’da Anadolu’ya veya denizlere açılan seyyahların ardından bir tas su dökülürken edilen, temiz kalp ve selamet temennisi.',
      travelerNote: 'Suyun önündeki taşa öfkelenmeden etrafından dolaşıp yolunu bulması, her seyyahın içselleştirmesi gereken bir esnekliktir.',
      tags: ['Su Dökme', 'Selamet', 'İskele Duası', 'Esneklik']
    },

    // 02_Ege (4)
    {
      id: 'ege-yol-izmir',
      regionCode: '02_Ege',
      category: 'yol-sefer',
      provinceKey: '02_Ege/Izmir',
      provinceLabel: 'İzmir',
      text: 'Yoldan kal, yoldaştan kalma.',
      pronunciation: 'Ege Kervan & Efe Geleneği Atasözü',
      meaning: 'Gerektiğinde yolculuğu erteleyebilir veya rotayı değiştirebilirsin; ama dürüst, güvenilir ve gönüldaş bir yol arkadaşını asla yarı yolda bırakma.',
      context: 'Küçük Menderes ve İzmir kervan yollarından dağ geçitlerine uzanan zorlu rotalarda vefayı haritadan üstün tutan Ege bilgeliği.',
      travelerNote: 'Yolculukları unutulmaz kılan yalnızca görülen manzaralar değil, o manzaraya birlikte tanıklık edilen insanlardır.',
      tags: ['Vefa', 'Yoldaşlık', 'Güven', 'Ege İrfanı']
    },
    {
      id: 'ege-misafir-denizli',
      regionCode: '02_Ege',
      category: 'misafir-kervansaray',
      provinceKey: '02_Ege/Denizli',
      provinceLabel: 'Denizli',
      text: 'Gönül ne kahve ister ne kahvehane; gönül sohbet ister, kahve bahane.',
      pronunciation: 'Denizli Akhan & Ege Köy Kahvehaneleri Hikmeti',
      meaning: 'İkram edilen kahve veya çay yalnızca bir aracıdır; asıl şifa, iki insanın birbirine zaman ayırıp kalpten söyleşmesindedir.',
      context: 'Selçuklu eseri Akhan Kervansarayı’ndan Ege’nin çınar gölgeli meydan kahvelerine kadar yolcuların dinlenip haberleştiği sohbet meclislerinin mottosu.',
      travelerNote: 'Bir kütüphane ya da çay ocağı molasında kısa bir hal hatır sormak, dijital yalnızlığı dağıtır.',
      tags: ['Sohbet', 'Kahvehane', 'Muhabbet', 'Akhan']
    },
    {
      id: 'ege-agiz-mugla',
      regionCode: '02_Ege',
      category: 'yoresel-agiz',
      provinceKey: '02_Ege/Mugla',
      provinceLabel: 'Muğla',
      text: 'Gari! (Yol göründü gari, heybeni al da çık.)',
      pronunciation: 'Muğla & Batı Ege Ağzı · "gari" (artık, bundan böyle, şimdi)',
      meaning: 'Tereddüdü bir kenara bırakıp kararlılıkla harekete geçme anını anlatan, Ege’nin yumuşak ve telaffuzuyla yüz güldüren zamir/zarfı.',
      context: 'Muğla’nın kiremit damlı bacalarından Gökova kıyılarına inen yollarda hasat, göç ya da yolculuk vakti geldiğinde söylenir.',
      travelerNote: 'Planlama ne kadar uzarsa uzasın, bir noktada "gari" deyip sırt çantasını omza almak gerekir.',
      tags: ['Gari', 'Muğla Ağzı', 'Kararlılık', 'Yörük Dili']
    },
    {
      id: 'ege-dua-afyon',
      regionCode: '02_Ege',
      category: 'yolcu-dualari',
      provinceKey: '02_Ege/Afyonkarahisar',
      provinceLabel: 'Afyonkarahisar',
      text: 'Ayağına taş, gözüne yaş değmesin; Hızır yoldaşın olsun.',
      pronunciation: 'Kavşaklar Diyarı Afyonkarahisar Yolcu Duası',
      meaning: 'Yol boyunca bedensel bir zahmet ve kalbî bir keder yaşamaman; daraldığın her anda beklenmedik bir iyilik ve yardımla karşılaşman temennisi.',
      context: 'Anadolu’nun dört ana yolunun kesiştiği Afyonkarahisar menzillerinde giden yolcuların arkasından söylenen en içten dualardan biri.',
      travelerNote: 'Zor bir geçitte hiç tanımadığın birinin sunduğu yol tarifi ya da sıcak çay, Anadolu’da Hızır geleneğinin yaşayan halidir.',
      tags: ['Hızır Yoldaşlığı', 'Kavşak', 'Korunma', 'Hayırlı Yol']
    },

    // 03_Akdeniz (4)
    {
      id: 'akdeniz-yol-antalya',
      regionCode: '03_Akdeniz',
      category: 'yol-sefer',
      provinceKey: '03_Akdeniz/Antalya',
      provinceLabel: 'Antalya',
      text: 'Göç yolda düzülür.',
      pronunciation: 'Toros Yörükleri Göç Atasözü',
      meaning: 'Her ayrıntıyı yola çıkmadan önce kusursuzca planlayamazsın; asıl düzen, eksikleri görmek ve çözümler üretmek hareket halindeyken ortaya çıkar.',
      context: 'Baharda sahilden Toros yaylalarına çıkan Antalya Yörüklerinin denk bağlarken söyledikleri en köklü pratik bilgelik sözü.',
      travelerNote: 'Mükemmel zamanı beklemek yerine mevcut imkânla sefere çıkan seyyah, yolu yolda öğrenir.',
      tags: ['Yörük Hikmeti', 'Toroslar', 'Tevekkül', 'Hareket']
    },
    {
      id: 'akdeniz-misafir-hatay',
      regionCode: '03_Akdeniz',
      category: 'misafir-kervansaray',
      provinceKey: '03_Akdeniz/Hatay',
      provinceLabel: 'Hatay',
      text: 'Sofra kırk kişilikse kırk birinciye de yer vardır; bereket bölüşmekle artar.',
      pronunciation: 'Antakya Kadim Medeniyetler Sofrası Sözü',
      meaning: 'Farklı inanç, dil ve kültürden gelen her yolcuya gönülde ve sofrada yer açmanın şehri büyüttüğüne dair kadim kabul.',
      context: 'Asi Nehri kıyısındaki Antakya sokaklarında komşuluk ve konuk ağırlama kültürünü özetleyen köklü deyiş.',
      travelerNote: 'Paylaşılan tek bir zeytin veya ekmek lokması, yabancı bir şehri bir anda yuvaya dönüştürür.',
      tags: ['Hoşgörü', 'Sofra', 'Antakya', 'Kardeşlik']
    },
    {
      id: 'akdeniz-agiz-adana',
      regionCode: '03_Akdeniz',
      category: 'yoresel-agiz',
      provinceKey: '03_Akdeniz/Adana',
      provinceLabel: 'Adana',
      text: 'Gadasını aldığım! (Gel hele, bir soluklan.)',
      pronunciation: 'Çukurova & Toroslar Ağzı · "gada" (dert, keder, bela) — "gadasını aldığım" (derdini üstlendiğim, canım dostum)',
      meaning: 'Karşısındakinin bütün yorgunluğunu ve sıkıntısını kendi omzuna almaya hazır olacak kadar derin bir sevgi ve sahiplenme ifadesi.',
      context: 'Adana’nın bereketli ovalarından Kozan ve Aladağ yaylalarına kadar yorgun düşen yolcuya kapı açarken söylenen sıcacık hitap.',
      travelerNote: 'Bir kelimenin ardında saklı olan şefkat, Çukurova insanının misafire verdiği kıymeti tek nefeste özetler.',
      tags: ['Gadasını Aldığım', 'Çukurova Ağzı', 'Şefkat', 'Himaye']
    },
    {
      id: 'akdeniz-dua-mersin',
      regionCode: '03_Akdeniz',
      category: 'yolcu-dualari',
      provinceKey: '03_Akdeniz/Mersin',
      provinceLabel: 'Mersin',
      text: 'Rüzgârın kolayına, yelkenin pupa, menzilin selamet ola.',
      pronunciation: 'Akdeniz Denizcileri & Taşeli Liman Duası',
      meaning: 'Hem denizde hem karada şartların yolcunun lehine dönmesi, fırtınasız ve huzurlu bir varış nasip olması duası.',
      context: 'Mersin, Silifke ve Anamur iskelelerinden Akdeniz’e açılan gemiciler ile sahil yolcularını uğurlarken söylenen kadim temenni.',
      travelerNote: 'Rüzgârın yönünü değiştiremesek de yelkenimizi hikmetle ayarlayabiliriz.',
      tags: ['Pupa Yelken', 'Akdeniz', 'Liman Duası', 'Ferahlık']
    },

    // 04_IcAnadolu (4)
    {
      id: 'icanadolu-yol-konya',
      regionCode: '04_IcAnadolu',
      provinceLabel: 'Konya',
      category: 'yol-sefer',
      provinceKey: '04_IcAnadolu/Konya',
      text: 'Yol bilen kervana katılır, bilmeyen iz sürer.',
      pronunciation: 'Selçuklu İpek Yolu & Sultanhanı Atasözü',
      meaning: 'Tecrübe ve ilim sahibi rehberlerle yol almak menzili kısaltır; bilmeyen ise büyüklerin ve geçmişin izini dikkatle okumalıdır.',
      context: 'Konya’dan Aksaray ve Kayseri’ye uzanan görkemli Selçuklu kervansarayları zincirinde kervanbaşıların tecrübeye verdiği değerin ifadesi.',
      travelerNote: 'Yeni bir şehre vardığında önce o şehrin kütüphanesine ve tarihî hafızasına kulak vermek en sağlam iz sürmedir.',
      tags: ['İpek Yolu', 'Rehberlik', 'Selçuklu', 'Tecrübe']
    },
    {
      id: 'icanadolu-misafir-kirsehir',
      regionCode: '04_IcAnadolu',
      category: 'misafir-kervansaray',
      provinceKey: '04_IcAnadolu/Kirsehir',
      provinceLabel: 'Kırşehir',
      text: 'Ahî’nin kapısı açık, sofrası açık, eli açık olur.',
      pronunciation: 'Ahî Evran-ı Velî & Fütüvvet Ahlâkı İlkesi',
      meaning: 'Konuk ağırlamak bir lütuf değil ahlakî bir ödevdir; yolcuya ikram, cömertlik ve güler yüz Ahîliğin temel üç direğidir.',
      context: 'Kırşehir’de kurulan Ahîlik teşkilatının esnaf ve konaklama zaviyelerinde yabancı yolcuları üç gün sorgusuz misafir etme geleneği.',
      travelerNote: 'Gerçek medeniyet, hiç tanımadığı bir yolcuya karşılıksız güven ve ikram sunabilme olgunluğudur.',
      tags: ['Ahîlik', 'Fütüvvet', 'Cömertlik', 'Kırşehir']
    },
    {
      id: 'icanadolu-agiz-ankara',
      regionCode: '04_IcAnadolu',
      category: 'yoresel-agiz',
      provinceKey: '04_IcAnadolu/Ankara',
      provinceLabel: 'Ankara',
      text: 'Üleşmek & Yaren: "Az ekmeği yarenle üleşen yolda aç kalmaz."',
      pronunciation: 'İç Anadolu Bozkır Ağzı · "üleşmek" (paylaşmak, bölüşmek), "yaren" (sadık gönül ve yol arkadaşı)',
      meaning: 'Orta Anadolu’nun sade ama derin kelime hazinesinde "üleşmek" yalnızca malı bölmek değil, sevinci ve meşakkati de ortak kılmaktır.',
      context: 'Ankara, Çankırı ve Beypazarı yaren meclislerinden Hacı Bayram-ı Velî imece geleneğine uzanan kardeşlik lügatı.',
      travelerNote: 'Bozkırın ortasında bir termos çayı üleşmek, yol yorgunluğunu yarı yarıya hafifletir.',
      tags: ['Üleşmek', 'Yaren', 'Bozkır Ağzı', 'İmece']
    },
    {
      id: 'icanadolu-dua-sivas',
      regionCode: '04_IcAnadolu',
      category: 'yolcu-dualari',
      provinceKey: '04_IcAnadolu/Sivas',
      provinceLabel: 'Sivas',
      text: 'Yolun açık, yükün hafif, gönlün ferah ola; vardığın yerde yüzün güle.',
      pronunciation: 'Sivas & Divriği Yayla Menzili Duası',
      meaning: 'Hem sırtındaki maddî yükün hem de kalbindeki kaygıların hafiflemesi; ulaştığın yeni şehirde huzurla karşılanman dileği.',
      context: 'Sivas garından ve tarihî taş köprülerinden gurbete, ilme veya sefere çıkanların ardından söylenen dört başı mamur Anadolu duası.',
      travelerNote: 'Sırt çantasını hafifleten yolcu, zihnini de hafifletir ve gittiği her yerde tebessüm biriktirir.',
      tags: ['Hafif Yük', 'Ferahlık', 'Sivas', 'Gurbet Duası']
    },

    // 05_Karadeniz (4)
    {
      id: 'karadeniz-yol-trabzon',
      regionCode: '05_Karadeniz',
      category: 'yol-sefer',
      provinceKey: '05_Karadeniz/Trabzon',
      provinceLabel: 'Trabzon',
      text: 'Dere yatağını bulur, yolcu konağını.',
      pronunciation: 'Doğu Karadeniz & Zigana Geçidi Atasözü',
      meaning: 'Yollar ne kadar sarp, sisli ve kıvrımlı görünürse görünsün, sabırla yürüyen her seyyah sonunda sığınacağı limanı ve menzili bulur.',
      context: 'Trabzon’dan Maçka ve Zigana’nın dumanlı geçitlerine tırmanan kervanların ve yaylacıların umut tazeleyen sözü.',
      travelerNote: 'Bilinmezlikten korkma; suyun vadide kendine yol açması gibi sen de her şehirde kendi ritmini bulursun.',
      tags: ['Zigana', 'Sabır', 'Konak', 'Umut']
    },
    {
      id: 'karadeniz-misafir-rize',
      regionCode: '05_Karadeniz',
      category: 'misafir-kervansaray',
      provinceKey: '05_Karadeniz/Rize',
      provinceLabel: 'Rize',
      text: 'Çay bahanedir; iki kelam edip dertleşmek şifadır.',
      pronunciation: 'Kaçkar Etekleri & Rize Yayla Evi Hikmeti',
      meaning: 'Yağmurlu bir Karadeniz gününde demlenen ince belli bardaktaki çay, iki insanın ruhunu ısıtan samimi bir dertleşmenin başlangıcıdır.',
      context: 'Rize’nin dik yamaçlarındaki ahşap evlerde ıslanıp kapıyı çalan her yolcuya önce soba yanı ve taze çay sunulurken edilen söz.',
      travelerNote: 'Hızlı tüketilen değil, demlenerek içilen sohbetler yolculuğun gerçek hatırasıdır.',
      tags: ['Çay Muhabbeti', 'Kaçkar', 'Şifa', 'Dertleşme']
    },
    {
      id: 'karadeniz-agiz-giresun',
      regionCode: '05_Karadeniz',
      category: 'yoresel-agiz',
      provinceKey: '05_Karadeniz/Giresun',
      provinceLabel: 'Giresun',
      text: 'Haçan! (Haçan sis kalktı, yaylaya revan olalım.)',
      pronunciation: 'Karadeniz Ağzı · "haçan" (mademki, ne zaman ki, hele bir)',
      meaning: 'Karadeniz Türkçesinde cümleye hem zaman hem sebep hem de coşkulu bir ritim katan, doğayla uyumlu hareket etmeyi anlatan kadim bağlaç.',
      context: 'Giresun Kümbet ve Kulakkaya yaylalarına çıkarken havanın açmasını bekleyenlerin birbirini haberdar etme ünlemi.',
      travelerNote: 'Doğa ile inatlaşmadan "haçan sis açılır" diyebilmek, sabırlı seyahatin altın kuralıdır.',
      tags: ['Haçan', 'Karadeniz Ağzı', 'Yayla', 'Doğa Ritmi']
    },
    {
      id: 'karadeniz-dua-sinop',
      regionCode: '05_Karadeniz',
      category: 'yolcu-dualari',
      provinceKey: '05_Karadeniz/Sinop',
      provinceLabel: 'Sinop',
      text: 'Karadan gidersen iz, denizden gidersen dümen şaşmaya; Allah selamet vere.',
      pronunciation: 'Anadolu’nun Kuzey Burnu Sinop İskelesi Duası',
      meaning: 'Gerek kara yolunda gerekse hırçın dalgalar üstünde yönünü ve pusulanı kaybetmemen için edilen çifte muhafaza duası.',
      context: 'Karadeniz’in en güvenli doğal limanı Sinop’ta fırtına sonrası sefere çıkan denizci ve yolcular için edilen köklü dua.',
      travelerNote: 'Gönül pusulası sağlam olan yolcu, puslu havalarda bile yönünü şaşırmaz.',
      tags: ['Sinop Limanı', 'Pusula', 'Dümen', 'Selamet']
    },

    // 06_DoguAnadolu (4)
    {
      id: 'dogu-yol-erzurum',
      regionCode: '06_DoguAnadolu',
      category: 'yol-sefer',
      provinceKey: '06_DoguAnadolu/Erzurum',
      provinceLabel: 'Erzurum',
      text: 'Kışın yola çıkanın kürkü de sabrı da kalın gerek.',
      pronunciation: 'Palandöken & Dadaşlar Diyarı Atasözü',
      meaning: 'Çetin coğrafyalarda ve zorlu hedeflerde yalnızca iyi niyet yetmez; hazırlık, tedbir ve sarsılmaz bir sabır kuşanmak şarttır.',
      context: 'Yüksek rakımlı Erzurum geçitlerinde kar ve tipi altında menzil aşan kadim seyyahların tedbir ilkesi.',
      travelerNote: 'Her mevsimin ve her şehrin mizacına göre hazırlanmak, yolculuğu zahmetten keyfe çevirir.',
      tags: ['Tedbir', 'Palandöken', 'Sabır', 'Hazırlık']
    },
    {
      id: 'dogu-misafir-kars',
      regionCode: '06_DoguAnadolu',
      category: 'misafir-kervansaray',
      provinceKey: '06_DoguAnadolu/Kars',
      provinceLabel: 'Kars',
      text: 'Tanrı misafirine kapı sorulmaz, hâl sorulur.',
      pronunciation: 'Kars Yaylaları & Ani Bozkırı Konukseverliği',
      meaning: 'Soğuktan ve uzak yoldan çıkıp gelen bir yabancıya "kimsin, nereden geldin" diye sorgu çekilmez; önce karnı doyurulur, üşüyen eli ısıtılır.',
      context: 'Doğu Anadolu’nun sert kışlarında kapıyı çalan her yolcuyu "Tanrı misafiri" bilip başköşeye oturtan asil gelenek.',
      travelerNote: 'Önyargısız merak ve karşılıksız nezaket, insanlığın en eski ve en yüksek ortak dilidir.',
      tags: ['Tanrı Misafiri', 'Kars', 'İnsanlık', 'Başköşe']
    },
    {
      id: 'dogu-agiz-elazig',
      regionCode: '06_DoguAnadolu',
      category: 'yoresel-agiz',
      provinceKey: '06_DoguAnadolu/Elazig',
      provinceLabel: 'Elazığ',
      text: 'Gakgoş! (Gakgoş, bu şehrin kapısı dosta her daim açıktır.)',
      pronunciation: 'Harput & Elazığ Ağzı · "gakgoş" (kardeş, ağabey, mert ve sözünün eri dost)',
      meaning: 'Harput kültürünün yüzlerce yıllık samimiyet nişanı: Yabancıyı bir anda öz kardeş yerine koyan sıcak hitap.',
      context: 'Tarihî Harput Kalesi’nden Hazar Gölü kıyılarına kadar kürsübaşı sohbetlerinde ve esnaf selamlarında yankılanan vefalı sözcük.',
      travelerNote: 'Bir şehirde sana "kardeşim" diye seslenildiğini duyduğunda artık orada yabancı değilsindir.',
      tags: ['Gakgoş', 'Harput', 'Mertlik', 'Kardeşlik']
    },
    {
      id: 'dogu-dua-van',
      regionCode: '06_DoguAnadolu',
      category: 'yolcu-dualari',
      provinceKey: '06_DoguAnadolu/Van',
      provinceLabel: 'Van',
      text: 'Gündüzün güneş, gecen ay, önün düz, gönlün bay ola.',
      pronunciation: 'Van Gölü Çevresi & Doğu Yaylaları Duası',
      meaning: 'Gündüz yolunun aydınlık, gece dinlenişinin huzurlu, önündeki engellerin dümdüz ve kalbinin zengin ("bay") olması niyazı.',
      context: 'Van Denizi’nin turkuaz kıyılarından yüksek geçitlere uğurlanan kervanlara edilen ahenkli ve bereketli dua.',
      travelerNote: 'Zenginlik eşyada değil, gün batımında huzurla bakabilen "bay" bir gönüldedir.',
      tags: ['Van Denizi', 'Ahenkli Dua', 'Gönül Zenginliği', 'Aydınlık']
    },

    // 07_GuneydoguAnadolu (4)
    {
      id: 'guneydogu-yol-diyarbakir',
      regionCode: '07_GuneydoguAnadolu',
      category: 'yol-sefer',
      provinceKey: '07_GuneydoguAnadolu/Diyarbakir',
      provinceLabel: 'Diyarbakır',
      text: 'Sorarak Bağdat bulunur.',
      pronunciation: 'Diyarbakır Surları & Mezopotamya Kervan Atasözü',
      meaning: 'Bilmemek ayıp değildir; asıl yolu uzatan şey sormaktan çekinmektir. Danışan, soran ve öğrenen yolcu en uzak menzile bile ulaşır.',
      context: 'Dicle kıyısındaki Diyarbakır hanlarından Mezopotamya’nın kadim ticaret merkezlerine uzanan uzun yollarda söylenmiş klasik atasözü.',
      travelerNote: 'Her şeyi navigasyona bırakmak yerine yerel bir bilene sormak, en güzel sokakları ve hikâyeleri keşfettirir.',
      tags: ['İstişare', 'Dicle', 'Mezopotamya', 'Öğrenme']
    },
    {
      id: 'guneydogu-misafir-mardin',
      regionCode: '07_GuneydoguAnadolu',
      category: 'misafir-kervansaray',
      provinceKey: '07_GuneydoguAnadolu/Mardin',
      provinceLabel: 'Mardin',
      text: 'Bir fincan acı kahvenin kırk yıl hatırı vardır.',
      pronunciation: 'Mardin Taş Konakları & Mırra Divanı Hikmeti',
      meaning: 'Küçük bir ikramla kurulan samimi bağ, yıllar geçse ve yollar ayrılsa da vefayla hatırlanan ömürlük bir dostluk hukuku doğurur.',
      context: 'Mezopotamya ovasına bakan Mardin eyvanlarında saatlerce kaynatılan acı kahve (mırra) ikramının taşıdığı derin sadakat anlamı.',
      travelerNote: 'Seyahat defterinde en kalıcı izleri, büyük harcamalar değil küçük ama içten ikramlar bırakır.',
      tags: ['Mırra', 'Kırk Yıl Hatır', 'Mardin', 'Sadakat']
    },
    {
      id: 'guneydogu-agiz-gaziantep',
      regionCode: '07_GuneydoguAnadolu',
      category: 'yoresel-agiz',
      provinceKey: '07_GuneydoguAnadolu/Gaziantep',
      provinceLabel: 'Gaziantep',
      text: 'Hasbihal & Çimmek: "Fırat’ta çimip han avlusunda hasbihal edek!"',
      pronunciation: 'Gaziantep & Fırat Havzası Ağzı · "çimmek" (suya girip arınmak), "hasbihal" (gönülden söyleşi)',
      meaning: 'Yolun tozunu serin sularda yıkayıp attıktan sonra gönül dostlarıyla hiçbir hesap gözetmeden derin bir sohbete oturma kültürü.',
      context: 'Gaziantep’in tarihî Tahmis Kahvesi’nden Rumkale kıyılarına uzanan gündelik dilde dinlenme ve arınma çağrısı.',
      travelerNote: 'Uzun bir günün ardından zihni arındırıp samimi bir hasbihale oturmak, ruhun en iyi bakım rutinidir.',
      tags: ['Hasbihal', 'Çimmek', 'Gaziantep Ağzı', 'Arınma']
    },
    {
      id: 'guneydogu-dua-sanliurfa',
      regionCode: '07_GuneydoguAnadolu',
      category: 'yolcu-dualari',
      provinceKey: '07_GuneydoguAnadolu/Sanliurfa',
      provinceLabel: 'Şanlıurfa',
      text: 'Yolun Halil İbrahim bereketiyle dolsun; gittiğin her kapı hayra açılsın.',
      pronunciation: 'Balıklıgöl & Peygamberler Şehri Şanlıurfa Duası',
      meaning: 'Hz. İbrahim’in misafirsiz sofraya oturmayan cömertlik ve teslimiyet ruhunun yolcunun gittiği her yere bereket olarak eşlik etmesi duası.',
      context: 'Şanlıurfa’nın tarihî hanlarında ve Balıklıgöl avlusunda yola revan olanlara edilen en köklü bereket ve selamet duası.',
      travelerNote: 'Niyeti temiz ve paylaşmaya açık olan yolcunun önündeki kapılar her coğrafyada hayırla açılır.',
      tags: ['Halil İbrahim Bereketi', 'Balıklıgöl', 'Hayırlı Kapı', 'Cömertlik']
    }
  ];

  // ---------------------------------------------------------------------------
  // Helpers
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
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .trim();
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
        if (/^#{1,4}\s+/.test(trimmed)) {
          return '<h3 class="seyyah-md-h2">' + esc(trimmed.replace(/^#{1,4}\s+/, '')) + '</h3>';
        }
        if (/^>\s*/.test(trimmed)) {
          return '<blockquote class="seyyah-md-quote">' + esc(trimmed.replace(/^>\s*/gm, '')) + '</blockquote>';
        }
        return (
          '<p class="seyyah-md-p">' +
          esc(trimmed)
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br />') +
          '</p>'
        );
      })
      .join('\n');
  }

  function resolveProvinceData(ctx, provinceKey, fallbackLabel, regionCode) {
    const provinces = (ctx && ctx.data && ctx.data.provinces) || {};
    const prov = provinces[provinceKey] || null;
    const regionObj = REGION_META[regionCode] || { fullLabel: regionCode, label: regionCode, icon: '🗺️' };
    return {
      key: provinceKey,
      exists: Boolean(prov),
      name: (prov && prov.name) || fallbackLabel,
      plate: prov && prov.plate ? Number(prov.plate) : null,
      region: (prov && prov.region) || regionObj.fullLabel,
      visited: Boolean(prov && prov.visited),
      quote: (prov && prov.quote) || '',
      reflection: (prov && prov.reflection) || '',
      spiritualFigures: (prov && Array.isArray(prov.spiritual_figures) ? prov.spiritual_figures : [])
    };
  }

  function buildAiPrompt(item, provInfo) {
    const catMeta = CATEGORY_META[item.category] || { shortLabel: item.category };
    const plateText = provInfo.plate ? String(provInfo.plate).padStart(2, '0') + ' ' : '';
    const extraCityContext = provInfo.quote
      ? '\n- İlin Seyahatname Özeti / Sözü: "' + provInfo.quote + '"'
      : '';

    return [
      'Aşağıdaki Anadolu sözünü, yöresel ağız hazinesini veya kadim yol duasını tarihsel, kültürel ve felsefî derinliğiyle anlat:',
      '',
      '- Söz / İfade / Dua: "' + item.text + '"',
      '- Kategori: ' + catMeta.shortLabel,
      '- Bölge & İl: ' + provInfo.region + ' — ' + plateText + provInfo.name,
      '- Kaynak / Telaffuz Bağlamı: ' + item.pronunciation,
      '- Temel Anlam: ' + item.meaning,
      '- Kültürel Arka Plan: ' + item.context + extraCityContext,
      '',
      'Yanıtını şu 3 başlık altında, zarif, akıcı ve ilham verici bir Türkçeyle Markdown formatında yaz:',
      '## 1. Sözün Kökü ve Anadolu Coğrafyasındaki Hikâyesi',
      '(Bu ifadenin doğduğu yol, han, yayla veya liman atmosferini canlı bir anlatımla betimle.)',
      '',
      '## 2. Felsefî Derinliği ve İrfan Boyutu',
      '(Bu sözün sabır, yoldaşlık, misafirperverlik, tevazu veya tevekkül bakımından insan psikolojisine ve Anadolu ahlakına katkısını çözümle.)',
      '',
      '## 3. Modern Seyyah İçin Günlük Yol Pusulası',
      '(Bugün sırt çantasıyla veya uzaktan çalışarak şehir şehir gezen modern bir seyyah için 2–3 somut düşünce ve pratik öneri sun.)'
    ].join('\n');
  }

  function buildOfflineStory(item, provInfo) {
    const catMeta = CATEGORY_META[item.category] || { shortLabel: 'Anadolu İrfanı' };
    const plateText = provInfo.plate ? String(provInfo.plate).padStart(2, '0') + ' ' : '';
    const sfHint =
      provInfo.spiritualFigures.length > 0
        ? ' Bu toprakların manevî ikliminde **' +
          provInfo.spiritualFigures
            .slice(0, 2)
            .map(function (s) {
              return s.name || s;
            })
            .join(' ve ') +
          '** gibi gönül mimarlarının bıraktığı izler de aynı söz geleneğini beslemiştir.'
        : '';

    const reflectionBlock = provInfo.reflection
      ? '\n\n> *Seyahatname Defterinden (' + provInfo.name + '):* ' + provInfo.reflection
      : '';

    return [
      '## 1. Sözün Kökü ve ' + provInfo.name + ' Coğrafyasındaki Hikâyesi',
      '> *“' + item.text + '”*',
      '',
      '**' + catMeta.shortLabel + '** geleneğinin ' + provInfo.region + ' hattındaki en berrak yansımalarından biri olan bu ifade, **' + plateText + provInfo.name + '** çevresindeki yaşam ritminden süzülmüştür. ' + item.context + sfHint,
      '',
      '## 2. Felsefî Derinliği ve İrfan Boyutu',
      item.meaning + ' Anadolu irfanında kelimeler yalnızca bilgi aktarmaz; yolcunun kalbini sükûnete davet eden birer manevî işaret fişeğidir. Bu söz, telaşın ve bireyselliğin arttığı dönemlerde dahi paylaşmayı, sabrı ve yoldaşlık hukukunu canlı tutar.' + reflectionBlock,
      '',
      '## 3. Modern Seyyah İçin Günlük Yol Pusulası',
      '1. **Yavaşlama & Dinleme:** ' + provInfo.name + ' durağında bir mola verdiğinde bu sözü hatırla; yerel bir esnafla veya kütüphane okuruyla kuracağın iki dakikalık samimi bir sohbet, tüm günü aydınlatabilir.',
      '2. **Yolun Öğretmenliği:** ' + item.travelerNote,
      '3. **Seyahat Defteri Notu:** Günün sonunda defterine bu ifadeyi ve sana hissettirdiği tek bir cümleyi yazarak Anadolu sözlü hafızasını kendi yolculuğunla birleştir.'
    ].join('\n');
  }

  // ---------------------------------------------------------------------------
  // Scoped Styles (Dark Obsidian + Alabaster body.light-theme)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .proverb-studio {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-bottom: 36px;
        color: var(--text-primary, #f8fafc);
      }

      .proverb-hero {
        position: relative;
        overflow: hidden;
        padding: 26px 28px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 90% 15%, rgba(245, 158, 11, 0.2), transparent 46%),
          radial-gradient(circle at 12% 88%, rgba(56, 189, 248, 0.18), transparent 48%),
          linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(30, 41, 59, 0.86));
        border: 1px solid rgba(245, 158, 11, 0.3);
        box-shadow: var(--shadow-subtle, 0 12px 28px -8px rgba(0, 0, 0, 0.45));
      }

      .proverb-eyebrow {
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

      .proverb-hero h2 {
        font-family: var(--font-heading, sans-serif);
        font-size: clamp(1.3rem, 2.5vw, 1.85rem);
        font-weight: 800;
        line-height: 1.24;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #fef3c7 0%, #f59e0b 48%, #38bdf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .proverb-hero-sub {
        max-width: 780px;
        font-size: 0.92rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.62;
      }

      .proverb-stats-row {
        display: grid;
        grid-template-columns: repeat(4, minmax(120px, 1fr));
        gap: 10px;
        margin-top: 18px;
      }

      .proverb-stat-pill {
        background: rgba(15, 23, 42, 0.58);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 11px 14px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .proverb-stat-val {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.22rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .proverb-stat-lbl {
        font-size: 0.74rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* Spotlight Random Draw Card */
      .proverb-spotlight {
        position: relative;
        overflow: hidden;
        padding: 22px 24px;
        border-radius: 18px;
        background:
          radial-gradient(circle at 95% 10%, rgba(168, 85, 247, 0.18), transparent 44%),
          radial-gradient(circle at 5% 95%, rgba(16, 185, 129, 0.14), transparent 45%),
          var(--bg-card, rgba(30, 41, 59, 0.8));
        border: 1px solid rgba(245, 158, 11, 0.38);
        box-shadow: 0 14px 32px -12px rgba(0, 0, 0, 0.45);
        display: flex;
        flex-direction: column;
        gap: 14px;
        backdrop-filter: blur(12px);
      }

      .proverb-spotlight-top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .proverb-spotlight-badges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .proverb-draw-btn {
        cursor: pointer;
        border: 1px solid rgba(245, 158, 11, 0.55);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.18));
        color: var(--text-primary, #f8fafc);
        padding: 9px 16px;
        border-radius: 999px;
        font-size: 0.84rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        transition: transform 0.18s ease, box-shadow 0.2s ease, background 0.2s ease;
      }

      .proverb-draw-btn:hover {
        transform: translateY(-1px);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.38), rgba(217, 119, 6, 0.28));
        box-shadow: 0 8px 22px rgba(245, 158, 11, 0.24);
      }

      .proverb-spotlight-quote {
        font-family: var(--font-heading, sans-serif);
        font-size: clamp(1.18rem, 2.2vw, 1.55rem);
        font-weight: 800;
        line-height: 1.38;
        color: var(--text-primary, #f8fafc);
        padding-left: 16px;
        border-left: 4px solid var(--accent-gold, #f59e0b);
      }

      .proverb-spotlight-pron {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--accent-emerald, #10b981);
      }

      .proverb-spotlight-meaning {
        font-size: 0.92rem;
        line-height: 1.65;
        color: var(--text-secondary, #cbd5e1);
      }

      .proverb-spotlight-context {
        font-size: 0.83rem;
        line-height: 1.58;
        color: var(--text-secondary, #94a3b8);
        background: rgba(15, 23, 42, 0.42);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        padding: 10px 13px;
        border-radius: 10px;
      }

      .proverb-spotlight-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        padding-top: 4px;
      }

      /* Filter Controls */
      .proverb-controls {
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: 16px;
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 13px;
        backdrop-filter: blur(12px);
      }

      .proverb-search-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .proverb-search-box {
        position: relative;
        flex: 1 1 320px;
        display: flex;
        align-items: center;
      }

      .proverb-search-icon {
        position: absolute;
        left: 13px;
        font-size: 0.95rem;
        opacity: 0.75;
        pointer-events: none;
      }

      .proverb-search-input {
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

      .proverb-search-input:focus {
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
      }

      .proverb-search-clear {
        position: absolute;
        right: 10px;
        border: none;
        background: transparent;
        color: var(--text-muted, #64748b);
        cursor: pointer;
        font-size: 0.9rem;
        padding: 2px 6px;
      }

      .proverb-results-meta {
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
        font-weight: 600;
      }

      .proverb-chip-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        align-items: center;
      }

      .proverb-chip-label {
        font-size: 0.73rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted, #64748b);
        margin-right: 4px;
      }

      .proverb-chip {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(15, 23, 42, 0.48);
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

      .proverb-chip:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(0, 242, 254, 0.42);
      }

      .proverb-chip.region-active {
        background: rgba(0, 242, 254, 0.16);
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
      }

      .proverb-chip.cat-active {
        background: rgba(245, 158, 11, 0.18);
        border-color: var(--accent-gold, #f59e0b);
        color: var(--text-primary, #f8fafc);
      }

      /* Cards Grid */
      .proverb-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 16px;
      }

      .proverb-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        padding: 18px;
        border-radius: 16px;
        background: var(--bg-card, rgba(30, 41, 59, 0.74));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .proverb-card:hover {
        transform: translateY(-3px);
        border-color: rgba(245, 158, 11, 0.45);
        box-shadow: 0 14px 30px -10px rgba(0, 0, 0, 0.45);
      }

      .proverb-card-head {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }

      .proverb-badges-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .proverb-cat-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid currentColor;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .proverb-region-pill {
        font-size: 0.71rem;
        font-weight: 600;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.14);
        color: var(--text-secondary, #94a3b8);
        border: 1px solid rgba(148, 163, 184, 0.24);
      }

      .proverb-main-text {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.07rem;
        font-weight: 800;
        line-height: 1.4;
        color: var(--text-primary, #f8fafc);
        background: rgba(15, 23, 42, 0.42);
        border-left: 3px solid var(--accent-gold, #f59e0b);
        padding: 10px 12px;
        border-radius: 0 10px 10px 0;
      }

      .proverb-pron {
        font-size: 0.76rem;
        font-weight: 600;
        color: var(--accent-emerald, #10b981);
      }

      .proverb-meaning {
        font-size: 0.86rem;
        line-height: 1.6;
        color: var(--text-secondary, #cbd5e1);
      }

      .proverb-context {
        font-size: 0.79rem;
        line-height: 1.54;
        color: var(--text-secondary, #94a3b8);
      }

      .proverb-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .proverb-tag {
        font-size: 0.7rem;
        color: var(--text-secondary, #94a3b8);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        padding: 2px 8px;
        border-radius: 6px;
      }

      .proverb-card-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 10px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .proverb-province-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .proverb-city-label {
        font-size: 0.77rem;
        font-weight: 700;
        color: var(--text-secondary, #cbd5e1);
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .proverb-visited-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--accent-emerald, #10b981);
        display: inline-block;
      }

      .proverb-city-btn {
        cursor: pointer;
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.34);
        padding: 5px 11px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.18s ease;
      }

      .proverb-city-btn:hover {
        background: rgba(0, 242, 254, 0.22);
        transform: translateY(-1px);
      }

      .proverb-ai-btn {
        width: 100%;
        cursor: pointer;
        border: 1px solid rgba(245, 158, 11, 0.45);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(168, 85, 247, 0.18));
        color: var(--text-primary, #f8fafc);
        padding: 9px 13px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .proverb-spotlight-actions .proverb-ai-btn {
        width: auto;
        padding: 9px 16px;
      }

      .proverb-ai-btn:hover {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.32), rgba(168, 85, 247, 0.28));
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.2);
      }

      .proverb-empty {
        text-align: center;
        padding: 46px 20px;
        border-radius: 16px;
        background: var(--bg-card, rgba(30, 41, 59, 0.5));
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.18));
        color: var(--text-secondary, #94a3b8);
      }

      /* AI Story & Philosophy Modal */
      .proverb-modal-backdrop {
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

      .proverb-modal {
        width: min(820px, 100%);
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        border-radius: 20px;
        background: var(--bg-secondary, #0f172a);
        border: 1px solid rgba(245, 158, 11, 0.38);
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
        overflow: hidden;
      }

      .proverb-modal-header {
        padding: 18px 22px;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(56, 189, 248, 0.1));
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
      }

      .proverb-modal-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.35;
      }

      .proverb-modal-close {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.16));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-primary, #f8fafc);
        width: 34px;
        height: 34px;
        border-radius: 10px;
        font-size: 1rem;
        flex-shrink: 0;
      }

      .proverb-modal-body {
        padding: 20px 22px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .proverb-stream-status {
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

      .proverb-stream-status.offline {
        background: rgba(245, 158, 11, 0.14);
        color: var(--accent-gold, #f59e0b);
        border-color: rgba(245, 158, 11, 0.35);
      }

      .proverb-stream-box {
        font-size: 0.93rem;
        line-height: 1.72;
        color: var(--text-primary, #f8fafc);
      }

      .proverb-stream-box .seyyah-md-h2,
      .proverb-stream-box .seyyah-md-h3 {
        font-family: var(--font-heading, sans-serif);
        color: var(--accent-gold, #f59e0b);
        margin: 14px 0 6px;
        font-size: 1.05rem;
      }

      .proverb-stream-box .seyyah-md-p {
        margin-bottom: 10px;
        color: var(--text-secondary, #cbd5e1);
      }

      .proverb-stream-box .seyyah-md-quote {
        border-left: 3px solid var(--accent-gold, #f59e0b);
        padding: 8px 12px;
        margin: 10px 0;
        background: rgba(245, 158, 11, 0.08);
        border-radius: 0 8px 8px 0;
        color: var(--text-primary, #f8fafc);
      }

      .proverb-stream-box .seyyah-md-list {
        padding-left: 20px;
        margin: 8px 0 12px;
        color: var(--text-secondary, #cbd5e1);
      }

      .proverb-stream-box .seyyah-md-list li {
        margin-bottom: 6px;
      }

      .proverb-modal-footer {
        padding: 12px 22px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      .proverb-action-btn {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.16));
        background: rgba(30, 41, 59, 0.72);
        color: var(--text-primary, #f8fafc);
        padding: 8px 13px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 600;
      }

      .proverb-action-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
      }

      /* Light Theme (Alabaster) Compatibility */
      body.light-theme .proverb-studio {
        color: var(--text-primary, #0f172a);
      }

      body.light-theme .proverb-hero {
        background:
          radial-gradient(circle at 90% 15%, rgba(217, 119, 6, 0.14), transparent 46%),
          radial-gradient(circle at 12% 88%, rgba(2, 132, 199, 0.12), transparent 48%),
          linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(241, 245, 249, 0.94));
        border-color: rgba(217, 119, 6, 0.3);
      }

      body.light-theme .proverb-hero h2 {
        background: linear-gradient(135deg, #0f172a 0%, #b45309 55%, #0284c7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .proverb-spotlight {
        background:
          radial-gradient(circle at 95% 10%, rgba(124, 58, 237, 0.08), transparent 44%),
          radial-gradient(circle at 5% 95%, rgba(5, 150, 105, 0.08), transparent 45%),
          rgba(255, 255, 255, 0.94);
        border-color: rgba(217, 119, 6, 0.35);
      }

      body.light-theme .proverb-stat-pill,
      body.light-theme .proverb-search-input,
      body.light-theme .proverb-chip,
      body.light-theme .proverb-main-text,
      body.light-theme .proverb-spotlight-context,
      body.light-theme .proverb-action-btn,
      body.light-theme .proverb-modal-close {
        background: rgba(241, 245, 249, 0.92);
        color: var(--text-primary, #0f172a);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .proverb-card,
      body.light-theme .proverb-controls,
      body.light-theme .proverb-empty {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .proverb-chip.region-active {
        background: rgba(2, 132, 199, 0.14);
        border-color: #0284c7;
        color: #0f172a;
      }

      body.light-theme .proverb-chip.cat-active {
        background: rgba(217, 119, 6, 0.15);
        border-color: #d97706;
        color: #0f172a;
      }

      body.light-theme .proverb-draw-btn {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.18), rgba(245, 158, 11, 0.14));
        color: #0f172a;
        border-color: #d97706;
      }

      body.light-theme .proverb-spotlight-quote,
      body.light-theme .proverb-stat-val,
      body.light-theme .proverb-modal-title {
        color: #0f172a;
      }

      body.light-theme .proverb-hero-sub,
      body.light-theme .proverb-spotlight-meaning,
      body.light-theme .proverb-spotlight-context,
      body.light-theme .proverb-meaning,
      body.light-theme .proverb-context,
      body.light-theme .proverb-city-label,
      body.light-theme .proverb-stream-box .seyyah-md-p,
      body.light-theme .proverb-stream-box .seyyah-md-list {
        color: #334155;
      }

      body.light-theme .proverb-tag {
        background: rgba(15, 23, 42, 0.05);
        color: #334155;
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .proverb-city-btn {
        color: #0369a1;
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.3);
      }

      body.light-theme .proverb-ai-btn {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.14), rgba(124, 58, 237, 0.14));
        color: #0f172a;
      }

      body.light-theme .proverb-modal {
        background: #ffffff;
      }

      body.light-theme .proverb-stream-box .seyyah-md-quote {
        color: #0f172a;
      }

      @media (max-width: 780px) {
        .proverb-stats-row {
          grid-template-columns: repeat(2, 1fr);
        }
        .proverb-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const esc = ctx && typeof ctx.escapeHtml === 'function' ? ctx.escapeHtml : fallbackEscapeHtml;
    const norm = ctx && typeof ctx.normalizeTurkish === 'function' ? ctx.normalizeTurkish : fallbackNormalizeTurkish;

    const entries = PROVERBS_CORPUS.map(function (item) {
      return Object.assign({}, item, {
        prov: resolveProvinceData(ctx, item.provinceKey, item.provinceLabel, item.regionCode)
      });
    });

    const visitedLinkedCount = entries.filter(function (e) {
      return e.prov.visited;
    }).length;

    const uiState = {
      region: 'all',
      category: 'all',
      search: '',
      spotlightId: entries[Math.floor(Math.random() * entries.length)].id,
      streaming: false,
      streamText: '',
      streamSource: '',
      streamRequestId: 0
    };

    let modalKeyHandler = null;

    function getFilteredEntries() {
      const q = norm(uiState.search);
      return entries.filter(function (item) {
        if (uiState.region !== 'all' && item.regionCode !== uiState.region) return false;
        if (uiState.category !== 'all' && item.category !== uiState.category) return false;
        if (q) {
          const blob = norm(
            [
              item.text,
              item.pronunciation,
              item.meaning,
              item.context,
              item.travelerNote,
              item.prov.name,
              item.prov.region,
              (CATEGORY_META[item.category] && CATEGORY_META[item.category].label) || '',
              item.tags.join(' ')
            ].join(' ')
          );
          if (blob.indexOf(q) === -1) return false;
        }
        return true;
      });
    }

    function openCity(provinceKey) {
      if (!provinceKey) return;
      if (ctx && typeof ctx.selectCity === 'function' && ctx.data && ctx.data.provinces && ctx.data.provinces[provinceKey]) {
        closeModal();
        ctx.selectCity(provinceKey);
      } else if (ctx && typeof ctx.showToast === 'function') {
        ctx.showToast('Şehir profili bulunamadı: ' + provinceKey);
      }
    }

    function drawRandomSpotlight() {
      const filtered = getFilteredEntries();
      const pool = filtered.length > 0 ? filtered : entries;
      const candidates = pool.length > 1
        ? pool.filter(function (e) { return e.id !== uiState.spotlightId; })
        : pool;
      const chosen = candidates[Math.floor(Math.random() * candidates.length)] || entries[0];
      uiState.spotlightId = chosen.id;
      renderSpotlight();
    }

    function closeModal() {
      uiState.streaming = false;
      uiState.streamRequestId += 1;
      if (modalKeyHandler && typeof document !== 'undefined') {
        document.removeEventListener('keydown', modalKeyHandler);
        modalKeyHandler = null;
      }
      const existing = document.getElementById('proverb-ai-modal-backdrop');
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    }

    function updateModalStreamDom() {
      const box = document.getElementById('proverb-modal-stream-box');
      const statusEl = document.getElementById('proverb-modal-status');
      if (box) {
        box.innerHTML = renderSafeMarkdown(uiState.streamText, esc);
      }
      if (statusEl) {
        const isOffline = uiState.streamSource.indexOf('Çevrimdışı') !== -1;
        statusEl.className = 'proverb-stream-status' + (isOffline ? ' offline' : '');
        statusEl.textContent = uiState.streaming
          ? '⏳ Sözün hikâyesi & felsefesi dokunuyor...'
          : uiState.streamSource || '✨ Tefekkür Tamamlandı';
      }
    }

    async function runAiStoryStream(item, forceRefresh) {
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
          const prompt = buildAiPrompt(item, item.prov);
          const system =
            'Sen Anadolu halk edebiyatı, bölgesel ağızlar, tasavvuf irfanı ve kervan kültürü konusunda uzman, üslubu zarif ve bilge bir anlatıcısın. Her sözü modern bir seyyahın iç dünyasına ve yolculuk pratiğine incelikle bağlarsın.';
          const cacheKey = forceRefresh ? null : 'proverb_story_v1_' + item.id;

          uiState.streamSource = '✨ Gemini AI Canlı Hikâye & Felsefe Akışı';
          updateModalStreamDom();

          const res = await window.SEYYAH_AI.stream({
            prompt: prompt,
            system: system,
            temperature: 0.74,
            maxTokens: 1500,
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
            uiState.streamSource =
              '✨ Gemini AI (' + (res.model || 'Canlı') + (res.cached ? ' · Önbellek' : '') + ')';
            uiState.streaming = false;
            updateModalStreamDom();
            return;
          }
        } catch (_err) {
          // Gracefully fall through to offline reflection
        }
      }

      // Offline progressive reveal fallback
      const offlineText = buildOfflineStory(item, item.prov);
      uiState.streamSource = '📜 Çevrimdışı İrfan Risalesi (Gemini AI Anahtarı Yok / Çevrimdışı Yedek)';
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
        setTimeout(stepReveal, 26);
      }
      stepReveal();
    }

    function openStoryModal(item) {
      closeModal();

      const backdrop = document.createElement('div');
      backdrop.id = 'proverb-ai-modal-backdrop';
      backdrop.className = 'proverb-modal-backdrop';

      const plateLabel = item.prov.plate ? String(item.prov.plate).padStart(2, '0') + ' ' : '';
      const catMeta = CATEGORY_META[item.category] || CATEGORY_META.all;

      backdrop.innerHTML =
        '<div class="proverb-modal" role="dialog" aria-modal="true" aria-label="Anadolu Sözü Hikâyesi ve Felsefesi">' +
          '<div class="proverb-modal-header">' +
            '<div>' +
              '<div class="proverb-eyebrow" style="margin-bottom:6px;">' + esc(catMeta.label) + '</div>' +
              '<h3 class="proverb-modal-title">“' + esc(item.text) + '”</h3>' +
              '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;align-items:center;">' +
                '<span class="proverb-region-pill">' + esc(item.prov.region) + '</span>' +
                '<button type="button" class="proverb-city-btn" id="proverb-modal-city-btn">' +
                  '📍 İli İncele (' + esc(plateLabel + item.prov.name) + ')' +
                '</button>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="proverb-modal-close" id="proverb-modal-close-btn" aria-label="Kapat">✕</button>' +
          '</div>' +
          '<div class="proverb-modal-body">' +
            '<span class="proverb-stream-status" id="proverb-modal-status">⏳ Hazırlanıyor...</span>' +
            '<div class="proverb-stream-box" id="proverb-modal-stream-box"></div>' +
          '</div>' +
          '<div class="proverb-modal-footer">' +
            '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
              '<button type="button" class="proverb-action-btn" id="proverb-modal-refresh-btn">🔄 Yeniden Dinle</button>' +
              '<button type="button" class="proverb-action-btn" id="proverb-modal-copy-btn">📋 Metni Kopyala</button>' +
            '</div>' +
            '<button type="button" class="proverb-city-btn" id="proverb-modal-goto-btn">📍 İli İncele</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(backdrop);

      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) closeModal();
      });

      modalKeyHandler = function (e) {
        if (e.key === 'Escape') closeModal();
      };
      document.addEventListener('keydown', modalKeyHandler);

      const closeBtn = document.getElementById('proverb-modal-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', closeModal);

      const cityBtn = document.getElementById('proverb-modal-city-btn');
      if (cityBtn) cityBtn.addEventListener('click', function () { openCity(item.provinceKey); });

      const gotoBtn = document.getElementById('proverb-modal-goto-btn');
      if (gotoBtn) gotoBtn.addEventListener('click', function () { openCity(item.provinceKey); });

      const refreshBtn = document.getElementById('proverb-modal-refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
          runAiStoryStream(item, true);
        });
      }

      const copyBtn = document.getElementById('proverb-modal-copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          const textToCopy = item.text + ' (' + item.prov.name + ')\n\n' + uiState.streamText;
          if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(function () {
              if (ctx && typeof ctx.showToast === 'function') {
                ctx.showToast('Söz ve tefekkür metni panoya kopyalandı.');
              }
            }).catch(function () {});
          }
        });
      }

      runAiStoryStream(item, false);
    }

    function renderSpotlight() {
      const slot = container.querySelector('#proverb-spotlight-slot');
      if (!slot) return;

      const item = entries.find(function (e) { return e.id === uiState.spotlightId; }) || entries[0];
      const catMeta = CATEGORY_META[item.category] || CATEGORY_META.all;
      const regMeta = REGION_META[item.regionCode] || { icon: '🗺️', fullLabel: item.prov.region };
      const plateLabel = item.prov.plate ? String(item.prov.plate).padStart(2, '0') + ' ' : '';

      slot.innerHTML =
        '<div class="proverb-spotlight">' +
          '<div class="proverb-spotlight-top">' +
            '<div class="proverb-spotlight-badges">' +
              '<span class="proverb-cat-badge" style="color:' + esc(catMeta.color) + ';background:' + esc(catMeta.badgeBg) + ';">' +
                esc(catMeta.label) +
              '</span>' +
              '<span class="proverb-region-pill">' + esc(regMeta.icon + ' ' + item.prov.region) + '</span>' +
              '<span class="proverb-region-pill">' +
                (item.prov.visited ? '✅ ' : '') +
                esc(plateLabel + item.prov.name) +
              '</span>' +
            '</div>' +
            '<button type="button" class="proverb-draw-btn" id="proverb-random-btn">' +
              '🎲 Rastgele Anadolu Sözü Çek' +
            '</button>' +
          '</div>' +
          '<div class="proverb-spotlight-quote">“' + esc(item.text) + '”</div>' +
          '<div class="proverb-spotlight-pron">📖 ' + esc(item.pronunciation) + '</div>' +
          '<p class="proverb-spotlight-meaning">' + esc(item.meaning) + '</p>' +
          '<div class="proverb-spotlight-context">' +
            '<strong>Tarih & Yol Bağlamı:</strong> ' + esc(item.context) +
          '</div>' +
          '<div class="proverb-spotlight-actions">' +
            '<button type="button" class="proverb-ai-btn" data-story-id="' + esc(item.id) + '">' +
              '✨ Gemini AI ile Bu Sözün Hikâyesini & Felsefesini Dinle' +
            '</button>' +
            '<button type="button" class="proverb-city-btn" data-city-key="' + esc(item.provinceKey) + '">' +
              '📍 İli İncele (' + esc(item.prov.name) + ')' +
            '</button>' +
          '</div>' +
        '</div>';

      const randBtn = slot.querySelector('#proverb-random-btn');
      if (randBtn) randBtn.addEventListener('click', drawRandomSpotlight);

      const storyBtn = slot.querySelector('[data-story-id]');
      if (storyBtn) {
        storyBtn.addEventListener('click', function () {
          openStoryModal(item);
        });
      }

      const cityBtn = slot.querySelector('[data-city-key]');
      if (cityBtn) {
        cityBtn.addEventListener('click', function () {
          openCity(item.provinceKey);
        });
      }
    }

    function renderCard(item) {
      const catMeta = CATEGORY_META[item.category] || CATEGORY_META.all;
      const regMeta = REGION_META[item.regionCode] || { icon: '🗺️', fullLabel: item.prov.region };
      const plateLabel = item.prov.plate ? String(item.prov.plate).padStart(2, '0') + ' ' : '';

      const tagsHtml = item.tags
        .map(function (t) {
          return '<span class="proverb-tag">#' + esc(t) + '</span>';
        })
        .join('');

      return (
        '<article class="proverb-card">' +
          '<div class="proverb-card-head">' +
            '<div class="proverb-badges-row">' +
              '<span class="proverb-cat-badge" style="color:' + esc(catMeta.color) + ';background:' + esc(catMeta.badgeBg) + ';">' +
                esc(catMeta.label) +
              '</span>' +
              '<span class="proverb-region-pill">' + esc(regMeta.icon + ' ' + regMeta.label) + '</span>' +
            '</div>' +
            '<div class="proverb-main-text">“' + esc(item.text) + '”</div>' +
            '<div class="proverb-pron">' + esc(item.pronunciation) + '</div>' +
          '</div>' +
          '<p class="proverb-meaning">' + esc(item.meaning) + '</p>' +
          '<p class="proverb-context">' + esc(item.context) + '</p>' +
          '<div class="proverb-tags">' + tagsHtml + '</div>' +
          '<div class="proverb-card-actions">' +
            '<div class="proverb-province-row">' +
              '<span class="proverb-city-label">' +
                (item.prov.visited ? '<span class="proverb-visited-dot" title="Gezildi"></span>' : '') +
                esc(plateLabel + item.prov.name) + ' · ' + esc(item.prov.region) +
              '</span>' +
              '<button type="button" class="proverb-city-btn" data-city-key="' + esc(item.provinceKey) + '">' +
                '📍 İli İncele' +
              '</button>' +
            '</div>' +
            '<button type="button" class="proverb-ai-btn" data-story-id="' + esc(item.id) + '">' +
              '✨ Gemini AI ile Bu Sözün Hikâyesini & Felsefesini Dinle' +
            '</button>' +
          '</div>' +
        '</article>'
      );
    }

    function updateGrid() {
      const filtered = getFilteredEntries();
      const countEl = container.querySelector('#proverb-results-count');
      const gridEl = container.querySelector('#proverb-grid');
      if (!gridEl) return;

      if (countEl) {
        countEl.textContent = filtered.length + ' / ' + entries.length + ' Anadolu sözü gösteriliyor';
      }

      if (filtered.length === 0) {
        gridEl.className = '';
        gridEl.innerHTML =
          '<div class="proverb-empty">' +
            '<p style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">Aradığınız ölçüte uygun söz veya dua bulunamadı</p>' +
            '<p style="font-size:0.85rem;">Bölge, kategori ya da arama kutusunu temizleyerek 7 bölgedeki 28 kaydın tamamını görüntüleyebilirsiniz.</p>' +
          '</div>';
        return;
      }

      gridEl.className = 'proverb-grid';
      gridEl.innerHTML = filtered.map(renderCard).join('');

      gridEl.querySelectorAll('[data-city-key]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          openCity(btn.getAttribute('data-city-key'));
        });
      });

      gridEl.querySelectorAll('[data-story-id]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const id = btn.getAttribute('data-story-id');
          const found = entries.find(function (e) { return e.id === id; });
          if (found) openStoryModal(found);
        });
      });
    }

    // Initial Layout
    container.innerHTML =
      '<div class="proverb-studio">' +
        '<section class="proverb-hero">' +
          '<div class="proverb-eyebrow">🗣️ 7 Bölge Sözlü Hafıza & Kervansaray Lügatı</div>' +
          '<h2>🗣️ Anadolu İrfan Sözlüğü: 7 Bölge Deyimler, Atasözleri & Yol Duaları</h2>' +
          '<p class="proverb-hero-sub">' +
            'Marmara’dan Güneydoğu’ya 7 coğrafî bölgeden derlenen <strong>yol ve sefer atasözleri</strong>, <strong>kervansaray hikmetleri</strong>, <strong>yöresel ağız hazineleri</strong> ve <strong>kadim yolcu duaları</strong> ile Anadolu’nun yaşayan dilini keşfedin.' +
          '</p>' +
          '<div class="proverb-stats-row">' +
            '<div class="proverb-stat-pill"><span class="proverb-stat-val">' + entries.length + '</span><span class="proverb-stat-lbl">Özgün Söz, Ağız & Dua</span></div>' +
            '<div class="proverb-stat-pill"><span class="proverb-stat-val">7 Bölge</span><span class="proverb-stat-lbl">Tam Coğrafî Kapsama</span></div>' +
            '<div class="proverb-stat-pill"><span class="proverb-stat-val">4 Kategori</span><span class="proverb-stat-lbl">Atasözü, Hikmet, Ağız, Dua</span></div>' +
            '<div class="proverb-stat-pill"><span class="proverb-stat-val">' + visitedLinkedCount + ' / ' + entries.length + '</span><span class="proverb-stat-lbl">Gezilen İle Bağlı Söz</span></div>' +
          '</div>' +
        '</section>' +

        '<section id="proverb-spotlight-slot" aria-label="Rastgele Anadolu Sözü Vitrini"></section>' +

        '<section class="proverb-controls">' +
          '<div class="proverb-search-row">' +
            '<div class="proverb-search-box">' +
              '<span class="proverb-search-icon">🔍</span>' +
              '<input type="text" id="proverb-search-input" class="proverb-search-input" placeholder="Kelime, atasözü, yöresel ağız (gari, gakgoş, haçan) veya il ara..." />' +
              '<button type="button" id="proverb-search-clear" class="proverb-search-clear" title="Aramayı temizle">✕</button>' +
            '</div>' +
            '<span id="proverb-results-count" class="proverb-results-meta"></span>' +
          '</div>' +

          '<div class="proverb-chip-bar" id="proverb-region-chips">' +
            '<span class="proverb-chip-label">Bölge:</span>' +
            REGIONS.map(function (r) {
              return (
                '<button type="button" class="proverb-chip ' + (r.code === 'all' ? 'region-active' : '') + '" data-region="' + esc(r.code) + '">' +
                  esc(r.icon + ' ' + r.label) +
                '</button>'
              );
            }).join('') +
          '</div>' +

          '<div class="proverb-chip-bar" id="proverb-category-chips">' +
            '<span class="proverb-chip-label">Kategori:</span>' +
            CATEGORIES.map(function (c) {
              return (
                '<button type="button" class="proverb-chip ' + (c.id === 'all' ? 'cat-active' : '') + '" data-category="' + esc(c.id) + '">' +
                  esc(c.id === 'all' ? c.icon + ' ' + c.label : c.label) +
                '</button>'
              );
            }).join('') +
          '</div>' +
        '</section>' +

        '<section id="proverb-grid" class="proverb-grid"></section>' +
      '</div>';

    // Bind static controls
    const searchInput = container.querySelector('#proverb-search-input');
    const searchClear = container.querySelector('#proverb-search-clear');

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

    container.querySelectorAll('#proverb-region-chips .proverb-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        uiState.region = chip.getAttribute('data-region') || 'all';
        container.querySelectorAll('#proverb-region-chips .proverb-chip').forEach(function (c) {
          c.classList.toggle('region-active', c === chip);
        });
        updateGrid();
      });
    });

    container.querySelectorAll('#proverb-category-chips .proverb-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        uiState.category = chip.getAttribute('data-category') || 'all';
        container.querySelectorAll('#proverb-category-chips .proverb-chip').forEach(function (c) {
          c.classList.toggle('cat-active', c === chip);
        });
        updateGrid();
      });
    });

    renderSpotlight();
    updateGrid();
  }

  window.SEYYAH_MODULES.proverbs = {
    render: render
  };
})();
