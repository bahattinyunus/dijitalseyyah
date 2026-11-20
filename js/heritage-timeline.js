/**
 * 12.000 Yıllık Anadolu Medeniyetleri & Manevi Mimarlar Kronolojisi
 * Göbeklitepe'den Milli Mücadele'ye Anadolu'nun kadim medeniyetleri,
 * ilim-irfan öncüleri ve şehirlerle doğrudan bağlantılı interaktif zaman tüneli.
 * Registers on window.SEYYAH_MODULES.timeline
 */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  // Fallback helpers if ctx omits utilities
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

  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Era Category Definitions
  const ERA_CATEGORIES = [
    {
      id: 'all',
      label: 'Tümü',
      icon: '🏛️',
      color: '#00f2fe',
      glow: 'rgba(0, 242, 254, 0.35)'
    },
    {
      id: 'antik',
      label: '🏺 Antik Çağ',
      shortLabel: 'Antik Çağ',
      icon: '🏺',
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.35)'
    },
    {
      id: 'selcuklu',
      label: '🕌 Selçuklu & İrfan',
      shortLabel: 'Selçuklu & İrfan',
      icon: '🕌',
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.35)'
    },
    {
      id: 'osmanli',
      label: '🏰 Osmanlı',
      shortLabel: 'Osmanlı',
      icon: '🏰',
      color: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.35)'
    },
    {
      id: 'yakin',
      label: '🇹🇷 Yakın Tarih',
      shortLabel: 'Yakın Tarih',
      icon: '🇹🇷',
      color: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.35)'
    }
  ];

  const ERA_MAP = {};
  ERA_CATEGORIES.forEach(function (era) {
    ERA_MAP[era.id] = era;
  });

  // 20 Deeply Researched Anatolian Civilizations & Spiritual Heritage Milestones
  const TIMELINE_MILESTONES = [
    {
      id: 'gobeklitepe-tas-tepeler',
      year: 'M.Ö. 9600',
      era: 'antik',
      icon: '🗿',
      title: 'Göbeklitepe & Taş Tepeler',
      subtitle: 'İnsanlık Tarihinin Sıfır Noktası ve İlk Anıtsal Tapınaklar',
      summary:
        'T biçimli kireçtaşı dikilitaşları ve üzerine oyulmuş yabani hayvan kabartmalarıyla Göbeklitepe, Karahantepe ve Taş Tepeler havzası, insanlığın tarıma geçmeden önce inanç ve ritüel etrafında örgütlendiğini kanıtlayarak arkeoloji tarihini yeniden yazdı.',
      highlights: ['UNESCO Dünya Mirası', 'T-Biçimli Dikilitaşlar', 'Karahantepe'],
      quote: 'Medeniyet, yalnızca toprağı işlemekle değil; göğe bakıp anlam aramakla başladı.',
      provinces: ['Şanlıurfa']
    },
    {
      id: 'catalhoyuk-neolitik',
      year: 'M.Ö. 7400',
      era: 'antik',
      icon: '🧱',
      title: 'Çatalhöyük Neolitik Kenti',
      subtitle: 'Bozkırda İlk Yerleşik Topluluk ve Eşitlikçi Kent Mimarisi',
      summary:
        'Konya Ovası’nda birbirine bitişik kerpiç evleri, damdan girilen yaşam alanları, duvar resimleri ve Ana Tanrıça figürinleriyle Çatalhöyük, 9.000 yıl önce binlerce insanın barış içinde bir arada yaşadığı en erken kentsel yerleşimlerden biridir.',
      highlights: ['UNESCO Dünya Mirası', 'Kerpiç Evler', 'Duvar Freskleri'],
      quote: 'Sokaksız bir şehirde damlar üzerinden kurulan ilk komşuluk hafızası.',
      provinces: ['Konya']
    },
    {
      id: 'hitit-hattusas',
      year: 'M.Ö. 1650',
      era: 'antik',
      icon: '☀️',
      title: 'Hitit İmparatorluğu & Hattuşaş',
      subtitle: 'Anadolu’nun İlk Büyük İmparatorluğu ve Kadeş Barış Antlaşması',
      summary:
        'Çivi yazılı kil tablet arşivleri, Aslanlı Kapı, Yazılıkaya Açık Hava Tapınağı ve tarihin bilinen ilk yazılı barış antlaşması Kadeş ile Hititler, Anadolu’da hukuk, diplomasi ve bin tanrılı hoşgörü geleneğinin temellerini attı. Karatepe-Aslantaş çift dilli yazıtları ise bu mirası Çukurova’ya taşıdı.',
      highlights: ['Hattuşaş Arşivi', 'Kadeş Antlaşması', 'Karatepe-Aslantaş'],
      quote: 'Güneş kursu altında diplomanın, hukukun ve yazılı hafızanın doğuşu.',
      provinces: ['Çorum', 'Osmaniye']
    },
    {
      id: 'troya-ege-antik',
      year: 'M.Ö. 1200',
      era: 'antik',
      icon: '🏛️',
      title: 'Troya & Ege Antik Medeniyetleri',
      subtitle: 'Homeros’un Destanından İyonya Felsefe Okullarına',
      summary:
        'Dokuz arkeolojik katmanıyla Troya, Boğazların stratejik kapısını tutarken; Efes, Bergama, Milet ve Priene gibi İyonya kentleri Thales, Herakleitos ve Celsus Kütüphanesi ile bilimsel düşüncenin, tıbbın ve şehir planlamacılığının merkezine dönüştü.',
      highlights: ['Troya Katmanları', 'Efes & Bergama', 'Milet Felsefe Okulu'],
      quote: 'Ege kıyılarında mermer, felsefe ve deniz rüzgârı tek bir medeniyet dilinde buluştu.',
      provinces: ['Çanakkale', 'İzmir', 'Aydın']
    },
    {
      id: 'urartu-van-kralligi',
      year: 'M.Ö. 800',
      era: 'antik',
      icon: '🏔️',
      title: 'Urartu & Van Krallığı',
      subtitle: 'Tuşpa’nın Sarp Kaleleri ve Mühendislik Harikası Su Kanalları',
      summary:
        'Van Gölü havzasında başkenti Tuşpa’yı kuran Urartular; sarp kayalara oyulmuş kaleleri, 51 kilometrelik Şamram Su Kanalı, çivi yazılı taş anıtları ve üstün metal işçiliğiyle Doğu Anadolu’nun zorlu coğrafyasını bayındır kıldı.',
      highlights: ['Tuşpa (Van Kalesi)', 'Şamram Kanalı', 'Kaya Mezarları'],
      quote: 'Sarp kayalara su ve hayat taşıyan Doğu’nun demir iradeli uygarlığı.',
      provinces: ['Van', 'Bitlis']
    },
    {
      id: 'frigya-lidya',
      year: 'M.Ö. 700',
      era: 'antik',
      icon: '🪙',
      title: 'Frigya & Lidya Medeniyetleri',
      subtitle: 'Kral Midas’ın Kaya Anıtları ve Tarihin İlk Madeni Parası',
      summary:
        'Frig Vadisi’ndeki Yazılıkaya (Midas Anıtı) ve kaya yerleşimleriyle Frigler Anadolu bozkırına eşsiz bir taş kültürü kazandırırken; Sardes merkezli Lidyalılar elektrumdan bastıkları ilk sikke ve Kral Yolu ile dünya ticaret tarihinde devrim yaptı.',
      highlights: ['Midas Anıtı', 'Sardes Antik Kenti', 'İlk Madeni Para'],
      quote: 'Bir yanda kayalara işlenen müzik ve mitoloji, diğer yanda ticareti dönüştüren ilk sikke.',
      provinces: ['Afyonkarahisar', 'Eskişehir', 'Manisa']
    },
    {
      id: 'kommagene-nemrut',
      year: 'M.Ö. 1. yy',
      era: 'antik',
      icon: '⛰️',
      title: 'Kommagene Krallığı',
      subtitle: 'Nemrut Dağı Zirvesinde Doğu ile Batı’nın Sentezi',
      summary:
        'Kral I. Antiochos’un 2.150 metre rakımlı Nemrut Dağı zirvesinde inşa ettirdiği dev tanrı heykelleri, Arsameia ve Cendere Köprüsü; Pers ve Helen uygarlıklarının inanç, astronomi ve sanat birikimini Fırat’a bakan görkemli bir anıtta birleştirdi.',
      highlights: ['Nemrut Tümülüsü', 'UNESCO Dünya Mirası', 'Aslanlı Horoskop'],
      quote: 'Güneşin doğuşu ve batışında Doğu ile Batı’yı aynı ufukta selamlayan zirve.',
      provinces: ['Adıyaman']
    },
    {
      id: 'roma-bizans-mirasi',
      year: 'M.S. 1.–6. yy',
      era: 'antik',
      icon: '🏟️',
      title: 'Roma & Bizans Mirası',
      subtitle: 'Anıtsal Tiyatrolar, İlk Hristiyanlık İzleri ve Ayasofya',
      summary:
        'Antakya’da St. Pierre Kilisesi ile ilk cemaatlerin şekillendiği, Pamukkale-Hierapolis ve Aspendos’ta Roma mühendisliğinin zirveye ulaştığı bu çağ; 537’de İstanbul’da yükselen Ayasofya’nın devasa kubbesiyle dünya mimarlık tarihinde yeni bir eşik açtı.',
      highlights: ['Ayasofya', 'Aspendos & Perge', 'Hierapolis & St. Pierre'],
      quote: 'Akdeniz’in mermer tiyatrolarından Boğaziçi’nin göğe açılan kubbesine uzanan miras.',
      provinces: ['İstanbul', 'Antalya', 'Hatay', 'Denizli']
    },
    {
      id: 'malazgirt-1071',
      year: '1071',
      era: 'selcuklu',
      icon: '⚔️',
      title: 'Malazgirt Zaferi & Anadolu’nun Fethi',
      subtitle: 'Sultan Alparslan ile Anadolu’nun Türk-İslam Yurdu Oluşu',
      summary:
        '26 Ağustos 1071’de Sultan Alparslan’ın Malazgirt Ovası’nda kazandığı tarihi zafer, Anadolu’nun kapılarını kesin olarak açtı. Ahlat Selçuklu Mezarlığı’ndaki anıtsal şahideler ve Ani’deki Ebu’l Menûçehr Camii bu kutlu başlangıcın taşlara mühürlenmiş tanıklarıdır.',
      highlights: ['Sultan Alparslan', 'Ahlat Selçuklu Mezarlığı', 'Ani Ören Yeri'],
      quote: 'Size öyle bir vatan aldım ki ebediyen sizin olacaktır.',
      provinces: ['Muş', 'Bitlis', 'Kars']
    },
    {
      id: 'anadolu-selcuklu-kervansaray',
      year: '1077–1308',
      era: 'selcuklu',
      icon: '🕌',
      title: 'Anadolu Selçuklu Medeniyeti & Kervansaraylar',
      subtitle: 'Taç Kapılar, Şifahaneler ve İpek Yolu’nun Güvenli Menzilleri',
      summary:
        'Başkent Konya’dan Sivas Çifte Minareli Medrese’ye, Kayseri Gevher Nesibe Şifahanesi’nden Erzurum Yakutiye’ye, Aksaray Sultanhanı’ndan Alanya Kızılkule’ye uzanan Selçuklu eserleri; ilim, tıp, ticaret sigortası ve geometrik taş işçiliğinde benzersiz bir medeniyet inşa etti.',
      highlights: ['Sultanhanı Kervansarayı', 'Gevher Nesibe Şifahanesi', 'Çifte Minareli Medrese'],
      quote: 'Her kırk kilometrede bir kurulan kervansaraylarla yolcuyu misafir, ticareti emanet bilen nizam.',
      provinces: ['Konya', 'Sivas', 'Kayseri', 'Erzurum', 'Aksaray', 'Antalya']
    },
    {
      id: 'anadolu-irfan-cagi',
      year: '1200–1300',
      era: 'selcuklu',
      icon: '🕊️',
      title: 'Anadolu İrfan Çağı',
      subtitle: 'Mevlânâ, Yunus Emre, Hacı Bektaş-ı Velî ve Ahi Evran',
      summary:
        'Moğol istilasının sarsıntılı yıllarında Anadolu’nun manevi harcını yoğuran gönül erleri; Mevlânâ’nın Mesnevî’si, Yunus Emre’nin duru Türkçesi, Hacı Bektaş-ı Velî’nin "eline, beline, diline" düsturu ve Ahi Evran’ın esnaf ahlâkıyla asırları aşan bir kardeşlik medeniyeti kurdu.',
      highlights: ['Mevlânâ Celâleddîn-i Rûmî', 'Yunus Emre', 'Hacı Bektaş-ı Velî', 'Ahi Evran'],
      quote: 'Sevelim, sevilelim; dünya kimseye kalmaz. — Yunus Emre',
      provinces: ['Konya', 'Eskişehir', 'Nevşehir', 'Kırşehir', 'Karaman']
    },
    {
      id: 'el-cezeri-sibernetik',
      year: '1206',
      era: 'selcuklu',
      icon: '⚙️',
      title: 'Sibernetiğin Kurucusu El-Cezerî',
      subtitle: 'Artuklu Sarayında Otomatlar, Su Saatleri ve Mühendislik Dehası',
      summary:
        'Cizre’de doğup Diyarbakır Artuklu Sarayı’nda 25 yıl başmühendislik yapan Ebü’l-İz İsmail el-Cezerî, "El-Câmi’ Beyne’l-İlm ve’l-Amel" adlı eserinde Filli Su Saati, krank mili, otomatik abdest robotları ve su pompalarını tasarlayarak sibernetik ve robotik biliminin öncüsü oldu.',
      highlights: ['Filli Su Saati', 'Krank Mili & Otomatlar', 'Artuklu Bilim Mirası'],
      quote: 'Tatbikata dönüşmeyen her teknik ilim, doğru ile yanlış arasında muallakta kalır. — El-Cezerî',
      provinces: ['Şırnak', 'Diyarbakır']
    },
    {
      id: 'divrigi-ulu-camii',
      year: '1228',
      era: 'selcuklu',
      icon: '✨',
      title: 'Divriği Ulu Camii & Darüşşifası',
      subtitle: 'Taşa İşlenen Işık, Gölge ve Şifa Senfonisi',
      summary:
        'Mengücekli Beyi Ahmed Şah ve eşi Melike Turan Melek tarafından Ahlatlı Hürremşah’a inşa ettirilen Divriği Külliyesi; birbirini asla tekrar etmeyen on binlerce üç boyutlu taş motifi ve ikindi vakti kapıda beliren namaz kılan insan gölgesiyle UNESCO’nun Türkiye’den listeye aldığı ilk anıttır.',
      highlights: ['UNESCO Dünya Mirası (1985)', 'Ahlatlı Hürremşah', 'Cennet & Taç Kapılar'],
      quote: 'Methedilmeye lâyık bir sanat ki, görenin dili tutulur, taş dile gelir.',
      provinces: ['Sivas', 'Erzincan', 'Malatya']
    },
    {
      id: 'osmanli-kurulus-1299',
      year: '1299',
      era: 'osmanli',
      icon: '🌿',
      title: 'Osmanlı Devleti’nin Kuruluşu',
      subtitle: 'Söğüt’ten Bursa’ya: Şeyh Edebali’nin Duasıyla Çınarlaşan Beylik',
      summary:
        'Ertuğrul Gazi’nin emaneti Söğüt’te Osman Bey’in önderliğinde ve Şeyh Edebali’nin "İnsanı yaşat ki devlet yaşasın" öğüdüyle filizlenen Osmanlı Beyliği; Bursa’nın fethi, İznik Medresesi ve Kocaeli geçitleriyle kısa sürede üç kıtaya hükmedecek bir cihan devletinin temelini attı.',
      highlights: ['Osman Gazi & Şeyh Edebali', 'Söğüt & Domaniç', 'İlk Payitaht Bursa'],
      quote: 'Ey oğul! İnsanı yaşat ki devlet yaşasın. — Şeyh Edebali',
      provinces: ['Bilecik', 'Bursa', 'Kocaeli']
    },
    {
      id: 'edirne-istanbul-fethi',
      year: '1361–1453',
      era: 'osmanli',
      icon: '🏰',
      title: 'Payitaht Edirne & İstanbul’un Fethi',
      subtitle: 'Rumeli’ye Açılan Kapı ve Çağ Açıp Çağ Kapatan Kutlu Fetih',
      summary:
        'Edirne’nin başkent olmasıyla Balkanlar’a kök salan Osmanlı; Akşemseddin’in manevi rehberliği ve Fatih Sultan Mehmed’in ilim, strateji ve mühendislik dehasıyla 29 Mayıs 1453’te İstanbul’u fethederek Orta Çağ’ı kapatıp Yeni Çağ’ı açtı.',
      highlights: ['Fatih Sultan Mehmed', 'Akşemseddin Hazretleri', 'Payitaht Edirne & İstanbul'],
      quote: 'Hüner bir şehr bünyâd eylemektir, reâyâ kalbin âbâd eylemektir. — Avnî (Fatih)',
      provinces: ['Edirne', 'İstanbul', 'Bolu']
    },
    {
      id: 'mimar-sinan-cagi',
      year: '1500–1588',
      era: 'osmanli',
      icon: '📐',
      title: 'Mimar Sinan Çağı',
      subtitle: 'Ağırnas’tan Selimiye’ye: Klasik Osmanlı Mimarisinin Zirvesi',
      summary:
        'Kayseri Ağırnas’ta doğup 50 yıl Hassa Başmimarı olarak 375’i aşkın eser veren Koca Mimar Sinan; İstanbul’da Şehzade ve Süleymaniye, Manisa’da Muradiye ve Edirne’de ustalık eseri Selimiye Camii ile akustik, statik ve mekân estetiğini kusursuzluğa taşıdı.',
      highlights: ['Süleymaniye Külliyesi', 'Selimiye Camii (UNESCO)', 'Muradiye & Ağırnas'],
      quote: 'Şehzade çıraklık, Süleymaniye kalfalık, Selimiye ise ustalık eserimdir. — Mimar Sinan',
      provinces: ['İstanbul', 'Edirne', 'Kayseri', 'Manisa']
    },
    {
      id: 'evliya-celebi-seyahatname',
      year: '1611–1682',
      era: 'osmanli',
      icon: '🧭',
      title: 'Evliya Çelebi & Seyahatnâme Geleneği',
      subtitle: 'Elli Yıllık Yolculuk ve 10 Ciltlik Medeniyet Hafızası',
      summary:
        'Rüyasında "Şefaat yâ Resûlallah" yerine heyecanla "Seyahat yâ Resûlallah" diyerek yollara düşen Evliya Çelebi; İstanbul’dan Bitlis’e, Erzurum’un dondurucu kışlarından Trabzon’un hamsi sofralarına kadar şehirlerin mimarisini, lehçelerini, mutfağını ve ruhunu eşsiz bir üslupla kayda geçirdi.',
      highlights: ['10 Ciltlik Seyahatnâme', 'UNESCO Dünya Belleği', 'Anadolu Şehir Tasvirleri'],
      quote: 'Seyahat yâ Resûlallah! — Dijital Seyyah’ın kadim ilham kaynağı.',
      provinces: ['İstanbul', 'Bitlis', 'Erzurum', 'Trabzon']
    },
    {
      id: 'tillo-isik-hadisesi',
      year: '1763',
      era: 'osmanli',
      icon: '🔭',
      title: 'Tillo Işık Hadisesi — İbrahim Hakkı & İsmail Fakirullah',
      subtitle: 'Astronomi, Optik ve Vefanın Taşa Yansıyan Mucizesi',
      summary:
        'Marifetnâme’nin müellifi Erzurumlu İbrahim Hakkı Hazretleri, hocası İsmail Fakirullah’ın vefatı üzerine Siirt Tillo’da öyle bir türbe ve ışık kulesi inşa etti ki; her yıl 21 Mart ve 23 Eylül ekinokslarında doğan ilk güneş ışığı kaledeki pencereden süzülüp doğrudan hocasının başucunu aydınlatır.',
      highlights: ['Marifetnâme', 'Ekinoks Işık Hadisesi', 'Tillo Astronomi Mirası'],
      quote: 'Yeni yılın ilk güneşi hocamın başucunu aydınlatmazsa o güneş neye yarar? — İbrahim Hakkı',
      provinces: ['Siirt', 'Erzurum']
    },
    {
      id: 'canakkale-milli-mucadele',
      year: '1915–1923',
      era: 'yakin',
      icon: '🇹🇷',
      title: 'Çanakkale & Milli Mücadele Destanı',
      subtitle: 'Çanakkale Geçilmez’den Samsun, Erzurum, Sivas ve Cumhuriyet’e',
      summary:
        '1915’te Çanakkale’de yazılan destanın ardından; 19 Mayıs 1919’da Samsun’dan yakılan bağımsızlık meşalesi Amasya Tamimi, Erzurum ve Sivas Kongreleri, Maraş ve Antep’in kahraman direnişiyle birleşerek Ankara’da Türkiye Büyük Millet Meclisi ve 29 Ekim 1923’te Cumhuriyet ile taçlandı.',
      highlights: ['Çanakkale Destanı', 'Erzurum & Sivas Kongreleri', 'TBMM & Cumhuriyet'],
      quote: 'Ya istiklal ya ölüm! — Anadolu’nun yeniden diriliş ve egemenlik destanı.',
      provinces: [
        'Çanakkale',
        'Samsun',
        'Amasya',
        'Erzurum',
        'Sivas',
        'Ankara',
        'Kahramanmaraş',
        'Gaziantep'
      ]
    },
    {
      id: 'cumhuriyet-kultur-mirasi',
      year: '1923–Günümüz',
      era: 'yakin',
      icon: '📚',
      title: 'Cumhuriyet’in Kültür, Kütüphane & Seyahat Mirası',
      subtitle: '81 İl Halk Kütüphanesi ve Anadolu’nun Yaşayan Kültür Atlası',
      summary:
        'Cumhuriyetin ilk yüzyılında kurulan Anadolu Medeniyetleri Müzesi, il halk kütüphaneleri, arkeoloji enstitüleri ve koruma altındaki UNESCO alanlarıyla 12.000 yıllık ortak miras gelecek kuşaklara aktarılıyor; her yeni seyahat bu kadim hikâyeye yeni bir satır ekliyor.',
      highlights: ['Anadolu Medeniyetleri Müzesi', '81 İl Halk Kütüphanesi', '21 UNESCO Miras Alanı'],
      quote: 'Geçmişin taşlarında geleceğin ilmini okuyan yeni nesil seyyahların yolculuğu.',
      provinces: ['Ankara', 'İstanbul', 'İzmir', 'Konya', 'Şanlıurfa']
    }
  ];

  // Persistent UI state within session
  const uiState = {
    activeEra: 'all',
    searchQuery: '',
    visitedOnly: false
  };

  // Inject component-scoped styles once (theme-aware using CSS variables)
  function ensureStyles() {
    if (document.getElementById('heritage-timeline-styles')) return;
    const style = document.createElement('style');
    style.id = 'heritage-timeline-styles';
    style.textContent = `
      .ht-view {
        display: flex;
        flex-direction: column;
        gap: 22px;
        max-width: 1120px;
        margin: 0 auto;
        padding-bottom: 42px;
      }

      /* Hero Header */
      .ht-hero {
        position: relative;
        overflow: hidden;
        padding: 26px 28px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 85% 15%, rgba(245, 158, 11, 0.16), transparent 50%),
          radial-gradient(circle at 12% 90%, rgba(0, 242, 254, 0.12), transparent 55%),
          var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .ht-hero-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 16px;
      }

      .ht-hero-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.65rem;
        font-weight: 800;
        line-height: 1.25;
        letter-spacing: 0.2px;
        background: linear-gradient(135deg, #ffffff 0%, var(--accent-gold, #f59e0b) 55%, var(--accent-cyan, #00f2fe) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .ht-hero-subtitle {
        color: var(--text-secondary, #94a3b8);
        font-size: 0.94rem;
        margin-top: 6px;
        max-width: 720px;
      }

      .ht-stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 12px;
      }

      .ht-stat-box {
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-md, 12px);
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .ht-stat-label {
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: var(--text-secondary, #94a3b8);
        font-weight: 600;
      }

      .ht-stat-value {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: baseline;
        gap: 6px;
      }

      .ht-stat-value small {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--accent-emerald, #10b981);
      }

      .ht-progress-track {
        width: 100%;
        height: 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
        margin-top: 4px;
      }

      .ht-progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent-gold, #f59e0b), var(--accent-emerald, #10b981), var(--accent-cyan, #00f2fe));
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Controls Bar */
      .ht-controls {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 16px 18px;
        border-radius: var(--radius-md, 12px);
        background: var(--bg-card, rgba(30, 41, 59, 0.7));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
      }

      .ht-controls-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .ht-era-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .ht-era-pill {
        appearance: none;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.45);
        color: var(--text-secondary, #94a3b8);
        font-family: var(--font-body, sans-serif);
        font-size: 0.84rem;
        font-weight: 600;
        padding: 7px 13px;
        border-radius: var(--radius-full, 9999px);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        transition: all 0.22s ease;
      }

      .ht-era-pill:hover {
        color: var(--text-primary, #f8fafc);
        border-color: var(--era-color, var(--accent-cyan, #00f2fe));
        transform: translateY(-1px);
      }

      .ht-era-pill.active {
        color: #ffffff;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.95));
        border-color: var(--era-color, var(--accent-cyan, #00f2fe));
        box-shadow: 0 0 16px var(--era-glow, rgba(0, 242, 254, 0.3));
      }

      .ht-era-count {
        font-size: 0.72rem;
        padding: 1px 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
        color: inherit;
      }

      .ht-search-group {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1 1 280px;
        max-width: 440px;
      }

      .ht-search-wrap {
        position: relative;
        flex: 1;
      }

      .ht-search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.9rem;
        pointer-events: none;
        opacity: 0.7;
      }

      .ht-search-input {
        width: 100%;
        padding: 9px 34px 9px 36px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, sans-serif);
        font-size: 0.88rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .ht-search-input::placeholder {
        color: var(--text-muted, #64748b);
      }

      .ht-search-input:focus {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .ht-search-clear {
        position: absolute;
        right: 9px;
        top: 50%;
        transform: translateY(-50%);
        border: none;
        background: rgba(255, 255, 255, 0.12);
        color: var(--text-primary, #f8fafc);
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-size: 0.72rem;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }

      .ht-search-clear.visible {
        display: inline-flex;
      }

      .ht-meta-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
      }

      .ht-toggle-btn {
        appearance: none;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.45);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.78rem;
        font-weight: 600;
        padding: 5px 11px;
        border-radius: var(--radius-full, 9999px);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ht-toggle-btn.active {
        background: rgba(16, 185, 129, 0.18);
        border-color: var(--accent-emerald, #10b981);
        color: #6ee7b7;
      }

      /* Vertical Glowing Timeline */
      .ht-timeline {
        position: relative;
        padding-left: 44px;
        display: flex;
        flex-direction: column;
        gap: 22px;
      }

      .ht-timeline::before {
        content: '';
        position: absolute;
        left: 17px;
        top: 14px;
        bottom: 14px;
        width: 3px;
        border-radius: 999px;
        background: linear-gradient(
          180deg,
          #f59e0b 0%,
          #10b981 36%,
          #a855f7 68%,
          #f43f5e 100%
        );
        box-shadow: 0 0 14px rgba(0, 242, 254, 0.3);
        opacity: 0.85;
      }

      .ht-item {
        position: relative;
        animation: htFadeUp 0.35s ease both;
      }

      @keyframes htFadeUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Glowing Node on the Spine */
      .ht-node {
        position: absolute;
        left: -38px;
        top: 22px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--bg-secondary, #0f172a);
        border: 2.5px solid var(--era-color, #00f2fe);
        box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.85), 0 0 16px var(--era-glow, rgba(0, 242, 254, 0.5));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.72rem;
        z-index: 2;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      }

      .ht-item:hover .ht-node {
        transform: scale(1.18);
        box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.85), 0 0 24px var(--era-color, #00f2fe);
      }

      /* Timeline Card */
      .ht-card {
        position: relative;
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-left: 3px solid var(--era-color, #00f2fe);
        border-radius: var(--radius-md, 14px);
        padding: 20px 22px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                    border-color 0.25s ease,
                    box-shadow 0.25s ease;
      }

      .ht-card:hover {
        transform: translateY(-2px);
        border-color: var(--era-color, rgba(0, 242, 254, 0.45));
        box-shadow: 0 10px 28px -8px rgba(0, 0, 0, 0.45), 0 0 20px var(--era-glow, rgba(0, 242, 254, 0.2));
      }

      .ht-card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .ht-badges-left {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .ht-year-badge {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.84rem;
        font-weight: 800;
        letter-spacing: 0.4px;
        padding: 4px 12px;
        border-radius: var(--radius-full, 9999px);
        background: linear-gradient(135deg, var(--era-color, #00f2fe), rgba(15, 23, 42, 0.9));
        color: #ffffff;
        box-shadow: 0 0 12px var(--era-glow, rgba(0, 242, 254, 0.35));
      }

      .ht-era-tag {
        font-size: 0.76rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-secondary, #cbd5e1);
      }

      .ht-coverage-badge {
        font-size: 0.74rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-secondary, #94a3b8);
      }

      .ht-coverage-badge.complete {
        background: rgba(16, 185, 129, 0.18);
        border-color: rgba(16, 185, 129, 0.45);
        color: #6ee7b7;
      }

      .ht-coverage-badge.partial {
        background: rgba(245, 158, 11, 0.14);
        border-color: rgba(245, 158, 11, 0.38);
        color: #fcd34d;
      }

      .ht-card-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.22rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.3;
      }

      .ht-card-subtitle {
        font-size: 0.86rem;
        font-weight: 600;
        color: var(--era-color, var(--accent-cyan, #00f2fe));
        margin-top: -6px;
        opacity: 0.92;
      }

      .ht-card-summary {
        font-size: 0.92rem;
        color: var(--text-secondary, #cbd5e1);
        line-height: 1.65;
      }

      .ht-highlights {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .ht-highlight-tag {
        font-size: 0.74rem;
        font-weight: 600;
        padding: 3px 9px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: var(--text-secondary, #94a3b8);
      }

      .ht-quote {
        font-size: 0.84rem;
        font-style: italic;
        color: var(--text-secondary, #cbd5e1);
        padding: 8px 12px;
        border-left: 2px solid var(--era-color, #00f2fe);
        background: rgba(15, 23, 42, 0.38);
        border-radius: 0 8px 8px 0;
      }

      /* Clickable Province Chips */
      .ht-provinces-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.07);
      }

      .ht-provinces-label {
        font-size: 0.73rem;
        text-transform: uppercase;
        letter-spacing: 0.55px;
        font-weight: 700;
        color: var(--text-muted, #64748b);
      }

      .ht-province-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .ht-province-chip {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: var(--radius-full, 9999px);
        font-family: var(--font-body, sans-serif);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .ht-province-chip.visited {
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.45);
        color: #d1fae5;
      }

      .ht-province-chip.visited:hover {
        background: rgba(16, 185, 129, 0.28);
        border-color: #34d399;
        transform: translateY(-2px);
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
      }

      .ht-province-chip.planned {
        background: rgba(245, 158, 11, 0.08);
        border: 1px dashed rgba(245, 158, 11, 0.4);
        color: #fde68a;
      }

      .ht-province-chip.planned:hover {
        background: rgba(245, 158, 11, 0.2);
        border-style: solid;
        border-color: #fbbf24;
        transform: translateY(-2px);
        box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
      }

      .ht-chip-plate {
        font-size: 0.7rem;
        font-weight: 700;
        opacity: 0.75;
        padding: 1px 5px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.22);
      }

      .ht-chip-arrow {
        font-size: 0.76rem;
        opacity: 0.65;
        transition: transform 0.2s ease;
      }

      .ht-province-chip:hover .ht-chip-arrow {
        transform: translateX(2px);
        opacity: 1;
      }

      /* Empty State */
      .ht-empty {
        text-align: center;
        padding: 42px 24px;
        border-radius: var(--radius-md, 14px);
        background: var(--bg-card, rgba(30, 41, 59, 0.65));
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.16));
        color: var(--text-secondary, #94a3b8);
      }

      .ht-empty-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        margin-top: 8px;
      }

      .ht-reset-btn {
        margin-top: 14px;
        appearance: none;
        border: 1px solid var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        color: var(--accent-cyan, #00f2fe);
        font-weight: 700;
        font-size: 0.84rem;
        padding: 8px 16px;
        border-radius: var(--radius-full, 9999px);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ht-reset-btn:hover {
        background: rgba(0, 242, 254, 0.24);
      }

      @media (max-width: 680px) {
        .ht-hero {
          padding: 18px 16px;
        }
        .ht-hero-title {
          font-size: 1.32rem;
        }
        .ht-timeline {
          padding-left: 28px;
        }
        .ht-timeline::before {
          left: 10px;
        }
        .ht-node {
          left: -26px;
          width: 20px;
          height: 20px;
          font-size: 0.65rem;
        }
        .ht-card {
          padding: 16px;
        }
        .ht-search-group {
          max-width: 100%;
          flex-basis: 100%;
        }
      }
    `;
    const firstStyle = document.head.querySelector('link[rel="stylesheet"], style');
    if (firstStyle) {
      document.head.insertBefore(style, firstStyle);
    } else {
      document.head.appendChild(style);
    }
  }

  // Build normalized lookup table: normName -> { key, name, plate, visited, region }
  function buildProvinceIndex(data, normalizeTurkish) {
    const index = {};
    const provinces = (data && data.provinces) || {};
    Object.keys(provinces).forEach(function (key) {
      const prov = provinces[key];
      if (!prov || !prov.name) return;
      const norm = normalizeTurkish(prov.name);
      index[norm] = {
        key: key,
        name: prov.name,
        plate: prov.plate != null ? String(prov.plate).padStart(2, '0') : '',
        visited: Boolean(prov.visited),
        region: prov.region || ''
      };
    });
    return index;
  }

  // Enrich milestones with resolved province info and search index
  function buildEnrichedMilestones(provinceIndex, normalizeTurkish) {
    return TIMELINE_MILESTONES.map(function (m) {
      const eraObj = ERA_MAP[m.era] || ERA_MAP.all;
      const resolvedProvinces = m.provinces.map(function (pName) {
        const norm = normalizeTurkish(pName);
        const match = provinceIndex[norm];
        if (match) {
          return {
            key: match.key,
            name: match.name,
            plate: match.plate,
            visited: match.visited
          };
        }
        return {
          key: null,
          name: pName,
          plate: '',
          visited: false
        };
      });

      const visitedCount = resolvedProvinces.filter(function (p) {
        return p.visited;
      }).length;

      const searchHaystack = normalizeTurkish(
        [
          m.year,
          m.title,
          m.subtitle,
          m.summary,
          m.quote || '',
          eraObj.label,
          (m.highlights || []).join(' '),
          m.provinces.join(' ')
        ].join(' ')
      );

      return Object.assign({}, m, {
        eraMeta: eraObj,
        resolvedProvinces: resolvedProvinces,
        visitedCount: visitedCount,
        totalProvinces: resolvedProvinces.length,
        searchHaystack: searchHaystack
      });
    });
  }

  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const data =
      safeCtx.data ||
      (safeCtx.state && safeCtx.state.data) ||
      (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const escapeHtml =
      typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const normalizeTurkish =
      typeof safeCtx.normalizeTurkish === 'function'
        ? safeCtx.normalizeTurkish
        : fallbackNormalizeTurkish;
    const selectCity =
      typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};

    const provinceIndex = buildProvinceIndex(data, normalizeTurkish);
    const milestones = buildEnrichedMilestones(provinceIndex, normalizeTurkish);

    // Compute overall heritage province coverage across unique provinces in the timeline
    const uniqueProvMap = {};
    milestones.forEach(function (m) {
      m.resolvedProvinces.forEach(function (p) {
        const id = p.key || p.name;
        if (!uniqueProvMap[id]) {
          uniqueProvMap[id] = p;
        }
      });
    });
    const uniqueProvinces = Object.values(uniqueProvMap);
    const totalHeritageProvinces = uniqueProvinces.length;
    const visitedHeritageProvinces = uniqueProvinces.filter(function (p) {
      return p.visited;
    }).length;
    const coveragePct = totalHeritageProvinces
      ? Math.round((visitedHeritageProvinces / totalHeritageProvinces) * 100)
      : 0;

    // Count per era
    const eraCounts = { all: milestones.length };
    milestones.forEach(function (m) {
      eraCounts[m.era] = (eraCounts[m.era] || 0) + 1;
    });

    // Build outer layout
    container.innerHTML = `
      <div class="ht-view">
        <section class="ht-hero">
          <div class="ht-hero-top">
            <div>
              <h2 class="ht-hero-title">🏛️ 12.000 Yıllık Anadolu Medeniyetleri &amp; Manevi Mimarlar Kronolojisi</h2>
              <p class="ht-hero-subtitle">
                Göbeklitepe'nin dikilitaşlarından Anadolu Selçuklu kervansaraylarına, Mevlânâ ve Yunus Emre'nin irfan havzasından Mimar Sinan, El-Cezerî, Evliya Çelebi ve Milli Mücadele'ye uzanan kadim zaman tüneli. Şehir etiketlerine tıklayarak o ilin seyahatname sayfasına hemen geçebilirsiniz.
              </p>
            </div>
          </div>

          <div class="ht-stats-row">
            <div class="ht-stat-box">
              <span class="ht-stat-label">Kronolojik Dönem</span>
              <span class="ht-stat-value">${milestones.length} <small style="color: var(--accent-cyan);">Dönüm Noktası</small></span>
            </div>
            <div class="ht-stat-box">
              <span class="ht-stat-label">Zaman Derinliği</span>
              <span class="ht-stat-value">~12.000 <small style="color: var(--accent-gold);">Yıllık Miras</small></span>
            </div>
            <div class="ht-stat-box">
              <span class="ht-stat-label">Tarihi Şehir İzi</span>
              <span class="ht-stat-value">
                ${visitedHeritageProvinces} / ${totalHeritageProvinces}
                <small>%${coveragePct} Gezildi</small>
              </span>
              <div class="ht-progress-track">
                <div class="ht-progress-fill" style="width: ${coveragePct}%;"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="ht-controls" aria-label="Kronoloji filtreleri">
          <div class="ht-controls-row">
            <div class="ht-era-pills" role="tablist" aria-label="Dönem kategorileri">
              ${ERA_CATEGORIES.map(function (era) {
                const activeCls = uiState.activeEra === era.id ? ' active' : '';
                return `
                  <button
                    type="button"
                    class="ht-era-pill${activeCls}"
                    data-era="${escapeHtml(era.id)}"
                    style="--era-color: ${escapeHtml(era.color)}; --era-glow: ${escapeHtml(era.glow)};"
                    role="tab"
                    aria-selected="${uiState.activeEra === era.id ? 'true' : 'false'}"
                  >
                    <span>${escapeHtml(era.label)}</span>
                    <span class="ht-era-count">${eraCounts[era.id] || 0}</span>
                  </button>
                `;
              }).join('')}
            </div>

            <div class="ht-search-group">
              <div class="ht-search-wrap">
                <span class="ht-search-icon" aria-hidden="true">🔍</span>
                <input
                  type="text"
                  class="ht-search-input"
                  id="ht-search-input"
                  placeholder="Medeniyet, şahsiyet, yıl veya şehir ara..."
                  value="${escapeHtml(uiState.searchQuery)}"
                  autocomplete="off"
                />
                <button
                  type="button"
                  class="ht-search-clear${uiState.searchQuery ? ' visible' : ''}"
                  id="ht-search-clear"
                  title="Aramayı temizle"
                  aria-label="Aramayı temizle"
                >✕</button>
              </div>
            </div>
          </div>

          <div class="ht-meta-bar">
            <span id="ht-result-summary"></span>
            <button
              type="button"
              class="ht-toggle-btn${uiState.visitedOnly ? ' active' : ''}"
              id="ht-visited-toggle"
            >
              ✅ Sadece Ziyaret Ettiğim İzler
            </button>
          </div>
        </section>

        <div id="ht-timeline-mount"></div>
      </div>
    `;

    const eraButtons = container.querySelectorAll('.ht-era-pill');
    const searchInput = container.querySelector('#ht-search-input');
    const searchClear = container.querySelector('#ht-search-clear');
    const visitedToggle = container.querySelector('#ht-visited-toggle');
    const resultSummary = container.querySelector('#ht-result-summary');
    const timelineMount = container.querySelector('#ht-timeline-mount');

    function renderTimelineList() {
      const normQuery = normalizeTurkish(uiState.searchQuery);

      const filtered = milestones.filter(function (m) {
        if (uiState.activeEra !== 'all' && m.era !== uiState.activeEra) {
          return false;
        }
        if (uiState.visitedOnly && m.visitedCount === 0) {
          return false;
        }
        if (normQuery && m.searchHaystack.indexOf(normQuery) === -1) {
          return false;
        }
        return true;
      });

      resultSummary.textContent =
        filtered.length + ' / ' + milestones.length + ' kronolojik dönem gösteriliyor';

      if (!filtered.length) {
        timelineMount.innerHTML = `
          <div class="ht-empty">
            <div style="font-size: 2rem;">🧭</div>
            <div class="ht-empty-title">Aramanızla eşleşen dönem bulunamadı</div>
            <p style="margin-top: 6px; font-size: 0.88rem;">
              Farklı bir anahtar kelime deneyebilir veya dönem filtrelerini sıfırlayabilirsiniz.
            </p>
            <button type="button" class="ht-reset-btn" id="ht-reset-filters">Filtreleri Sıfırla</button>
          </div>
        `;
        const resetBtn = timelineMount.querySelector('#ht-reset-filters');
        if (resetBtn) {
          resetBtn.addEventListener('click', function () {
            uiState.activeEra = 'all';
            uiState.searchQuery = '';
            uiState.visitedOnly = false;
            if (searchInput) searchInput.value = '';
            if (searchClear) searchClear.classList.remove('visible');
            if (visitedToggle) visitedToggle.classList.remove('active');
            eraButtons.forEach(function (btn) {
              const isAll = btn.getAttribute('data-era') === 'all';
              btn.classList.toggle('active', isAll);
              btn.setAttribute('aria-selected', isAll ? 'true' : 'false');
            });
            renderTimelineList();
          });
        }
        return;
      }

      const cardsHtml = filtered
        .map(function (m, idx) {
          const eraColor = m.eraMeta.color;
          const eraGlow = m.eraMeta.glow;
          const isAllVisited = m.totalProvinces > 0 && m.visitedCount === m.totalProvinces;
          const isPartialVisited = m.visitedCount > 0 && !isAllVisited;
          const coverageClass = isAllVisited
            ? ' complete'
            : isPartialVisited
            ? ' partial'
            : '';
          const coverageText = isAllVisited
            ? '✅ Tüm İzler Gezildi (' + m.visitedCount + '/' + m.totalProvinces + ')'
            : m.visitedCount > 0
            ? '🗺️ ' + m.visitedCount + '/' + m.totalProvinces + ' İl Gezildi'
            : '⏳ ' + m.totalProvinces + ' İl Planlandı';

          const highlightsHtml = (m.highlights || [])
            .map(function (h) {
              return '<span class="ht-highlight-tag">✦ ' + escapeHtml(h) + '</span>';
            })
            .join('');

          const chipsHtml = m.resolvedProvinces
            .map(function (p) {
              const stateCls = p.visited ? 'visited' : 'planned';
              const statusIcon = p.visited ? '✅' : '⏳';
              const statusTitle = p.visited
                ? p.name + ' (Ziyaret Edildi) — Detay sayfasını aç'
                : p.name + ' (Planlanan) — Detay sayfasını aç';
              const plateHtml = p.plate
                ? '<span class="ht-chip-plate">' + escapeHtml(p.plate) + '</span>'
                : '';
              const keyAttr = p.key ? ' data-city-key="' + escapeHtml(p.key) + '"' : '';
              return (
                '<button type="button" class="ht-province-chip ' +
                stateCls +
                '"' +
                keyAttr +
                ' title="' +
                escapeHtml(statusTitle) +
                '">' +
                '<span>' +
                statusIcon +
                '</span>' +
                plateHtml +
                '<span>' +
                escapeHtml(p.name) +
                '</span>' +
                '<span class="ht-chip-arrow" aria-hidden="true">→</span>' +
                '</button>'
              );
            })
            .join('');

          return `
            <article
              class="ht-item"
              style="--era-color: ${escapeHtml(eraColor)}; --era-glow: ${escapeHtml(eraGlow)}; animation-delay: ${Math.min(idx * 35, 280)}ms;"
            >
              <div class="ht-node" aria-hidden="true">${escapeHtml(m.icon)}</div>
              <div class="ht-card">
                <div class="ht-card-top">
                  <div class="ht-badges-left">
                    <span class="ht-year-badge">${escapeHtml(m.year)}</span>
                    <span class="ht-era-tag">${escapeHtml(m.eraMeta.label)}</span>
                  </div>
                  <span class="ht-coverage-badge${coverageClass}">${escapeHtml(coverageText)}</span>
                </div>

                <h3 class="ht-card-title">${escapeHtml(m.title)}</h3>
                <div class="ht-card-subtitle">${escapeHtml(m.subtitle)}</div>

                <p class="ht-card-summary">${escapeHtml(m.summary)}</p>

                ${highlightsHtml ? '<div class="ht-highlights">' + highlightsHtml + '</div>' : ''}

                ${m.quote ? '<blockquote class="ht-quote">“' + escapeHtml(m.quote) + '”</blockquote>' : ''}

                <div class="ht-provinces-section">
                  <span class="ht-provinces-label">İlgili Şehirler (Keşfetmek için tıklayın)</span>
                  <div class="ht-province-chips">${chipsHtml}</div>
                </div>
              </div>
            </article>
          `;
        })
        .join('');

      timelineMount.innerHTML = '<div class="ht-timeline">' + cardsHtml + '</div>';
    }

    // Event: Era pill click
    eraButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const eraId = btn.getAttribute('data-era') || 'all';
        uiState.activeEra = eraId;
        eraButtons.forEach(function (b) {
          const active = b.getAttribute('data-era') === eraId;
          b.classList.toggle('active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        renderTimelineList();
      });
    });

    // Event: Search input
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        uiState.searchQuery = searchInput.value;
        if (searchClear) {
          searchClear.classList.toggle('visible', Boolean(uiState.searchQuery));
        }
        renderTimelineList();
      });
    }

    // Event: Search clear
    if (searchClear) {
      searchClear.addEventListener('click', function () {
        uiState.searchQuery = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchClear.classList.remove('visible');
        renderTimelineList();
      });
    }

    // Event: Visited-only toggle
    if (visitedToggle) {
      visitedToggle.addEventListener('click', function () {
        uiState.visitedOnly = !uiState.visitedOnly;
        visitedToggle.classList.toggle('active', uiState.visitedOnly);
        renderTimelineList();
      });
    }

    // Event delegation: Clickable province chips
    timelineMount.addEventListener('click', function (e) {
      const chip = e.target.closest('.ht-province-chip[data-city-key]');
      if (!chip) return;
      const cityKey = chip.getAttribute('data-city-key');
      if (cityKey) {
        selectCity(cityKey);
      }
    });

    // Initial render of timeline items
    renderTimelineList();
  }

  window.SEYYAH_MODULES.timeline = {
    render: render,
    milestones: TIMELINE_MILESTONES
  };
})();
