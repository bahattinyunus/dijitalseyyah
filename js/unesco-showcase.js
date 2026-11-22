/**
 * Türkiye UNESCO Dünya Mirası Vitrini (Museum-Grade Showcase)
 * 1985–2023 arasında UNESCO Dünya Mirası Listesi'ne giren Türkiye'nin 21 evrensel hazinesi.
 * Registers on window.SEYYAH_MODULES.unesco = { render(container, ctx), SITES }
 */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  // Fallback utilities in case ctx omits any helper
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

  // Curated catalog of all 21 UNESCO World Heritage Sites of Turkey (exact province keys)
  const UNESCO_SITES = [
    {
      id: 'istanbul-tarihi-alanlari',
      name: 'İstanbul Tarihi Alanları',
      subtitle: 'İki Kıtanın ve Üç İmparatorluğun Ebedî Payitahtı',
      provinceKey: '01_Marmara/Istanbul',
      year: 1985,
      type: 'cultural',
      criteria: 'i, ii, iii, iv',
      era: 'Roma · Bizans · Osmanlı',
      description:
        'Sultanahmet Arkeolojik Parkı, Süleymaniye, Zeyrek ve Kara Surları olmak üzere dört koruma bölgesinden oluşan Tarihi Yarımada; Ayasofya, Topkapı Sarayı ve Sultanahmet Camii ile insanlık mimarisinin zirve siluetini taşır.',
      highlights: ['Ayasofya', 'Topkapı Sarayı', 'Süleymaniye Külliyesi', 'Kara Surları']
    },
    {
      id: 'goreme-kapadokya',
      name: 'Göreme Milli Parkı ve Kapadokya',
      subtitle: 'Volkanik Tüflere Oyulmuş Peribacaları ve Kaya Manastırları',
      provinceKey: '04_IcAnadolu/Nevsehir',
      year: 1985,
      type: 'mixed',
      criteria: 'i, iii, v, vii',
      era: 'Jeolojik Harika · Bizans',
      description:
        'Erciyes ve Hasan Dağı\'nın milyonlarca yıllık küllerini rüzgâr ve suyun yontmasıyla oluşan peribacaları, freskli kaya kiliseleri ve yeraltı şehirleriyle doğa ile insan dehasının eşsiz ortak eseridir.',
      highlights: ['Göreme Açık Hava Müzesi', 'Peribacaları', 'Derinkuyu & Kaymaklı', 'Kaya Kiliseleri']
    },
    {
      id: 'divrigi-ulu-camii',
      name: 'Divriği Ulu Camii ve Darüşşifası',
      subtitle: 'Taşa İşlenmiş Anadolu Selçuklu Mucizesi',
      provinceKey: '04_IcAnadolu/Sivas',
      year: 1985,
      type: 'cultural',
      criteria: 'i, iv',
      era: 'Mengücekliler (1228–1229)',
      description:
        'Ahmet Şah ve eşi Turan Melek tarafından yaptırılan, başmimar Ahlatlı Hürremşah\'ın imzasını taşıyan bu külliye; birbirini tekrar etmeyen üç boyutlu taş oyma taçkapılarıyla İslam mimarisinin benzersiz başyapıtıdır.',
      highlights: ['Cennet & Taç Kapılar', 'Turan Melek Darüşşifası', 'Ahlatlı Hürremşah', 'Gölge Silueti']
    },
    {
      id: 'hattusa',
      name: 'Hattuşa: Hitit Başkenti',
      subtitle: 'Tunç Çağı\'nın Süper Gücü ve İlk Yazılı Antlaşmanın Yurdu',
      provinceKey: '05_Karadeniz/Corum',
      year: 1986,
      type: 'cultural',
      criteria: 'i, ii, iii, iv',
      era: 'Hitit İmparatorluğu (M.Ö. 17–12. yy)',
      description:
        'Boğazköy\'de yükselen Aslanlı Kapı, Kral Kapısı, Sfenksli Kapı ve Yazılıkaya Açık Hava Tapınağı ile Hattuşa, binlerce çivi yazılı kil tabletiyle Anadolu\'nun en erken imparatorluk hafızasını saklar.',
      highlights: ['Aslanlı Kapı', 'Yazılıkaya Tapınağı', 'Büyük Tapınak', 'Kadeş Tabletleri']
    },
    {
      id: 'nemrut-dagi',
      name: 'Nemrut Dağı',
      subtitle: '2.150 Metrede Güneşin Doğuşuna ve Batışına Tanıklık Eden Dev Heykeller',
      provinceKey: '07_GuneydoguAnadolu/Adiyaman',
      year: 1987,
      type: 'cultural',
      criteria: 'i, iii, iv',
      era: 'Kommagene Krallığı (M.Ö. 1. yy)',
      description:
        'Kommagene Kralı I. Antiochos\'un Doğu ile Batı panteonunu buluşturduğu anıtsal tümülüs ve 8–10 metrelik kireçtaşı tanrı heykelleri, Anadolu\'nun en görkemli yüksek irtifa kutsal alanıdır.',
      highlights: ['Doğu & Batı Terasları', 'I. Antiochos Tümülüsü', 'Aslanlı Horoskop', 'Gündoğumu']
    },
    {
      id: 'hierapolis-pamukkale',
      name: 'Hierapolis - Pamukkale',
      subtitle: 'Bembeyaz Kalsiyum Travertenlerinin Üstündeki Kutsal Şifa Kenti',
      provinceKey: '02_Ege/Denizli',
      year: 1988,
      type: 'mixed',
      criteria: 'iii, iv, vii',
      era: 'Helenistik · Roma · Doğa Harikası',
      description:
        'Sıcak termal kaynakların binlerce yılda oluşturduğu pamuk beyazı traverten terasları ile hemen üstünde yükselen Hierapolis Antik Tiyatrosu, Antik Havuz ve Nekropol, doğa ile antik mimariyi bütünleştirir.',
      highlights: ['Pamukkale Travertenleri', 'Hierapolis Tiyatrosu', 'Kleopatra Antik Havuzu', 'Plutonium']
    },
    {
      id: 'xanthos-letoon',
      name: 'Xanthos - Letoon',
      subtitle: 'Özgürlüğüne Düşkün Likya Birliği\'nin Başkenti ve Kutsal Merkezi',
      provinceKey: '03_Akdeniz/Antalya',
      year: 1988,
      type: 'cultural',
      criteria: 'ii, iii',
      era: 'Likya Uygarlığı (M.Ö. 8. yy)',
      description:
        'Likya medeniyetinin idari merkezi Xanthos ile dini başkenti Letoon; özgün kaya mezarları, Harpyler Anıtı ve üç dilli yazıtlarıyla Anadolu\'nun yerel kültürü ile Helen sanatının eşsiz sentezini sunar.',
      highlights: ['Xanthos Kaya Mezarları', 'Letoon Tapınakları', 'Harpyler Anıtı', 'Likya Yazıtları'],
      relatedProvinces: [
        { key: '02_Ege/Mugla', label: 'Muğla (Letoon)' }
      ]
    },
    {
      id: 'safranbolu-sehri',
      name: 'Safranbolu Şehri',
      subtitle: 'Kervan Yollarının Yaşayan Osmanlı Konakları Müzesi',
      provinceKey: '05_Karadeniz/Karabuk',
      year: 1994,
      type: 'cultural',
      criteria: 'ii, iv, v',
      era: 'Osmanlı Dönemi (17–19. yy)',
      description:
        'Arnavut kaldırımlı sokakları, ahşap cumbalı konakları, Cinci Hanı ve Köprülü Mehmet Paşa Camii ile Safranbolu, geleneksel Türk şehir dokusunu ve komşuluk mimarisini bozulmadan günümüze taşır.',
      highlights: ['Tarihi Osmanlı Konakları', 'Cinci Hanı', 'Yemeniciler Arastası', 'Hıdırlık Tepesi']
    },
    {
      id: 'troya-antik-kenti',
      name: 'Troya Antik Kenti',
      subtitle: 'Homeros\'un İlyada Destanına İlham Veren 9 Katmanlı Efsane Şehir',
      provinceKey: '01_Marmara/Canakkale',
      year: 1998,
      type: 'cultural',
      criteria: 'ii, iii, vi',
      era: 'Tunç Çağı · Roma (M.Ö. 3000–M.S. 500)',
      description:
        'Çanakkale Boğazı\'nın girişinde 4.000 yılı aşan kesintisiz yerleşim tabakalarıyla Troya, Anadolu ile Ege dünyası arasındaki kültürel köprünün ve dünya edebiyatının en ünlü destanının arkeolojik kalbidir.',
      highlights: ['9 Arkeolojik Katman', 'Troya Müzesi', 'Rampa & Sur Duvarları', 'İlyada Mirası']
    },
    {
      id: 'selimiye-camii',
      name: 'Selimiye Camii ve Külliyesi',
      subtitle: 'Mimar Sinan\'ın "Ustalık Eserim" Dediği Kubbe Senfonisi',
      provinceKey: '01_Marmara/Edirne',
      year: 2011,
      type: 'cultural',
      criteria: 'i, iv',
      era: 'Klasik Osmanlı (1568–1575)',
      description:
        'Sekiz fil ayağına oturan muazzam tek kubbesi, göğe uzanan dört ince minaresi, İznik çinileri ve ters lale motifiyle Selimiye, Osmanlı klasik mimarisinin mekân ve ışık ustalığındaki doruk noktasıdır.',
      highlights: ['31,3 m Dev Kubbe', 'Mimar Sinan', 'İznik Çinileri', 'Arasta Çarşısı']
    },
    {
      id: 'catalhoyuk',
      name: 'Çatalhöyük Neolitik Kenti',
      subtitle: '9.000 Yıl Öncesinin Sokaksız, Çatıdan Girilen İlk Kent Modeli',
      provinceKey: '04_IcAnadolu/Konya',
      year: 2012,
      type: 'cultural',
      criteria: 'iii, iv',
      era: 'Neolitik Çağ (M.Ö. 7400–6200)',
      description:
        'Konya Ovası\'ndaki iki höyükten oluşan Çatalhöyük; bitişik kerpiç evleri, duvar resimleri, boğa başı kabartmaları ve eşitlikçi toplumsal yapısıyla insanlığın yerleşik hayata ve şehirleşmeye geçişini belgeler.',
      highlights: ['Neolitik Duvar Resimleri', 'Kerpiç Evler', 'Ana Tanrıça Heykelcikleri', 'Doğu & Batı Höyük']
    },
    {
      id: 'bursa-cumalikizik',
      name: 'Bursa ve Cumalıkızık',
      subtitle: 'Osmanlı İmparatorluğu\'nun Doğuşu: Külliyeler ve Vakıf Köyü',
      provinceKey: '01_Marmara/Bursa',
      year: 2014,
      type: 'cultural',
      criteria: 'i, ii, iv, vi',
      era: 'Erken Osmanlı (14–15. yy)',
      description:
        'Hanlar Bölgesi, Sultan Külliyeleri (Orhangazi, Hüdavendigar, Yıldırım, Yeşil, Muradiye) ve Uludağ eteklerindeki 700 yıllık Cumalıkızık Vakıf Köyü ile bir cihan devletinin şehircilik manifestosudur.',
      highlights: ['Hanlar Bölgesi & Koza Han', 'Cumalıkızık Köyü', 'Yeşil Külliye', 'Muradiye Külliyesi']
    },
    {
      id: 'bergama-kulturel-peyzaji',
      name: 'Bergama Çok Katmanlı Kültürel Peyzajı',
      subtitle: 'Helenistik Akropol, Parşömen Kütüphanesi ve Asklepion Şifa Merkezi',
      provinceKey: '02_Ege/Izmir',
      year: 2014,
      type: 'cultural',
      criteria: 'i, ii, iii, iv, vi',
      era: 'Helenistik · Roma · Bizans · Osmanlı',
      description:
        'Dünyanın en dik antik tiyatrosuna ev sahipliği yapan Pergamon Akropolü, 200 bin ruloluk antik kütüphane geleneği, Kızıl Avlu ve tıp tarihinin öncüsü Asklepion ile katman katman yaşayan bir kültür mirasıdır.',
      highlights: ['Pergamon Akropolü', 'Asklepion', 'Kızıl Avlu', 'Parşömen Kütüphanesi']
    },
    {
      id: 'diyarbakir-kalesi-hevsel',
      name: 'Diyarbakır Kalesi ve Hevsel Bahçeleri',
      subtitle: '5,8 Kilometrelik Bazalt Surlar ve 8.000 Yıllık Dicle Bereketi',
      provinceKey: '07_GuneydoguAnadolu/Diyarbakir',
      year: 2015,
      type: 'cultural',
      criteria: 'iv',
      era: 'Roma · Artuklu · Osmanlı · Tarım Peyzajı',
      description:
        'Siyah bazalt taşından yükselen görkemli surlar, Keçi Burcu ve Ulu Beden ile Dicle kıyısında kesintisiz tarım yapılan Hevsel Bahçeleri, Mezopotamya\'nın en kadim kent-doğa birlikteliğini sergiler.',
      highlights: ['Diyarbakır Surları', 'Hevsel Bahçeleri', 'İçkale & Keçi Burcu', 'On Gözlü Köprü Havzası']
    },
    {
      id: 'efes-antik-kenti',
      name: 'Efes Antik Kenti',
      subtitle: 'Celsus Kütüphanesi, Artemis Tapınağı ve Antik Dünyanın Metropolü',
      provinceKey: '02_Ege/Izmir',
      year: 2015,
      type: 'cultural',
      criteria: 'iii, iv, vi',
      era: 'Neolitik · Helenistik · Roma · Erken Hristiyanlık',
      description:
        'Çukuriçi Höyük\'ten Ayasuluk Tepesi\'ne, Celsus Kütüphanesi ve 24 bin kişilik Büyük Tiyatro\'dan Meryem Ana Evi\'ne kadar Efes, Akdeniz dünyasının en iyi korunmuş mermer metropollerinden biridir.',
      highlights: ['Celsus Kütüphanesi', 'Büyük Tiyatro', 'Artemis Tapınağı', 'Meryem Ana Evi']
    },
    {
      id: 'ani-arkeolojik-alani',
      name: 'Ani Arkeolojik Alanı',
      subtitle: 'İpek Yolu\'nun Bozkırda Yükselen "Binbir Kiliseli" Ortaçağ Metropolü',
      provinceKey: '06_DoguAnadolu/Kars',
      year: 2016,
      type: 'cultural',
      criteria: 'ii, iii, iv',
      era: 'Ortaçağ · Bagratlı · Selçuklu (10–13. yy)',
      description:
        'Arpaçay Kanyonu kıyısında 4,5 kilometrelik surlarla çevrili Ani; Anadolu\'daki ilk Türk camisi Ebu\'l Manuçehr Camii, Ani Katedrali ve Tigran Honents Kilisesi ile çok kültürlü Ortaçağ mimarisinin açık hava ansiklopedisidir.',
      highlights: ['Ani Katedrali', 'Ebu\'l Manuçehr Camii', 'Tigran Honents Kilisesi', 'Arpaçay Kanyonu']
    },
    {
      id: 'aphrodisias',
      name: 'Aphrodisias',
      subtitle: 'Antik Dünyanın Mermer Heykeltraşlık Okulu ve Aşk Tanrıçası Kenti',
      provinceKey: '02_Ege/Aydin',
      year: 2017,
      type: 'cultural',
      criteria: 'ii, iii, iv, vi',
      era: 'Helenistik · Roma (M.Ö. 2 – M.S. 6. yy)',
      description:
        'Yakınındaki mermer ocakları sayesinde antik çağın en ünlü heykeltıraşlarını yetiştiren Aphrodisias; Tetrapylon kapısı, Sebasteion kabartmaları ve 30 bin kişilik muazzam stadyumuyla mermerin sanata dönüştüğü kenttir.',
      highlights: ['Tetrapylon', '30.000 Kişilik Stadyum', 'Sebasteion', 'Afrodit Tapınağı']
    },
    {
      id: 'gobeklitepe',
      name: 'Göbeklitepe',
      subtitle: 'M.Ö. 9600: İnsanlık Tarihinin ve Anıtsal İnancın Sıfır Noktası',
      provinceKey: '07_GuneydoguAnadolu/Sanliurfa',
      year: 2018,
      type: 'cultural',
      criteria: 'i, ii, iv',
      era: 'Çanak Çömleksiz Neolitik (12.000 Yıl Önce)',
      description:
        'Avcı-toplayıcı topluluklar tarafından tarımdan bile önce inşa edilen T biçimli kireçtaşı dikilitaşlar ve stilize yaban hayvanı kabartmalarıyla Göbeklitepe, uygarlık tarihini kökten yeniden yazan devrimsel bir mirastır.',
      highlights: ['T-Biçimli Dikilitaşlar', 'D Yapısı', '12.000 Yıllık Tapınaklar', 'Taş Tepeler']
    },
    {
      id: 'arslantepe-hoyugu',
      name: 'Arslantepe Höyüğü',
      subtitle: 'İlk Devlet Bürokrasisi, Mühürler ve Dünyanın En Eski Kılıçlarının Yurdu',
      provinceKey: '06_DoguAnadolu/Malatya',
      year: 2021,
      type: 'cultural',
      criteria: 'iii',
      era: 'Kalkolitik · Erken Tunç · Geç Hitit (M.Ö. 6000–712)',
      description:
        'Fırat havzasında 5.000 yıl önce yükselen kerpiç saray kompleksi, binlerce kil mühür baskısı ve aristokratik yönetim izleriyle Arslantepe, devlet toplumunun doğuşuna ışık tutan eşsiz bir arkeolojik höyüktür.',
      highlights: ['M.Ö. 3300 Kerpiç Saray', 'Kil Mühür Arşivi', 'Kral Tarhunza Heykeli', 'Aslan Kabartmaları']
    },
    {
      id: 'gordion',
      name: 'Gordion Antik Kenti',
      subtitle: 'Kral Midas\'ın Efsanevi Frig Başkenti ve Büyük Tümülüs',
      provinceKey: '04_IcAnadolu/Ankara',
      year: 2023,
      type: 'cultural',
      criteria: 'iii',
      era: 'Frig Krallığı · Demir Çağı (M.Ö. 12–7. yy)',
      description:
        'Polatlı yakınlarında Sakarya ve Porsuk nehirlerinin buluştuğu noktada kurulan Gordion; 53 metre yüksekliğindeki Kral Midas Tümülüsü, ahşap mezar odası ve renkli çakıl mozaikleriyle Frig medeniyetinin kalbidir.',
      highlights: ['Midas Tümülüsü (MM)', 'Frig Kalesi', 'Çakıl Taşı Mozaikler', 'Gordion Düğümü']
    },
    {
      id: 'ahsap-hipostil-camileri',
      name: "Anadolu'nun Ortaçağ Dönemi Ahşap Hipostil Camileri",
      subtitle: 'Çivisiz Kündekâri ve Ahşap Sütun Ormanlarıyla Beş Eşsiz Cami',
      provinceKey: '04_IcAnadolu/Konya',
      year: 2023,
      type: 'cultural',
      criteria: 'ii, iv',
      era: 'Anadolu Selçuklu & Beylikler (13–14. yy)',
      description:
        'Beyşehir Eşrefoğlu, Sivrihisar Ulu, Kastamonu Mahmut Bey, Ankara Ahi Şerafettin (Arslanhane) ve Afyonkarahisar Ulu Camii\'nden oluşan bu seri miras; ahşap sütunlu hipostil planı ve kalemişi tavan işçiliğiyle Anadolu ahşap mimarisinin zirvesidir.',
      highlights: [
        'Eşrefoğlu Camii (Konya)',
        'Sivrihisar Ulu Camii (Eskişehir)',
        'Mahmut Bey Camii (Kastamonu)',
        'Ahi Şerafettin Camii (Ankara)',
        'Afyon Ulu Camii (Afyonkarahisar)'
      ],
      relatedProvinces: [
        { key: '04_IcAnadolu/Eskisehir', label: 'Eskişehir' },
        { key: '05_Karadeniz/Kastamonu', label: 'Kastamonu' },
        { key: '04_IcAnadolu/Ankara', label: 'Ankara' },
        { key: '02_Ege/Afyonkarahisar', label: 'Afyonkarahisar' }
      ]
    }
  ];

  // Persistent module UI state
  const UNESCO_CHECKED_STORAGE_KEY = 'dijital_seyyah_unesco_checked_v1';

  const uiState = {
    filter: 'all', // 'all' | 'visited' | 'pending' | 'stamped' | 'unstamped' | 'cultural' | 'mixed'
    search: '',
    sort: 'year-asc' // 'year-asc' | 'year-desc' | 'visited-first' | 'stamped-first' | 'alpha'
  };

  function loadCheckedUnescoIds() {
    try {
      if (typeof localStorage === 'undefined') return new Set();
      const raw = localStorage.getItem(UNESCO_CHECKED_STORAGE_KEY);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? new Set(parsed) : new Set();
    } catch (_) {
      return new Set();
    }
  }

  function saveCheckedUnescoIds(setObj) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(UNESCO_CHECKED_STORAGE_KEY, JSON.stringify(Array.from(setObj)));
    } catch (_) {}
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

  function injectStyles() {
    if (document.getElementById('unesco-showcase-styles')) return;
    const style = document.createElement('style');
    style.id = 'unesco-showcase-styles';
    style.textContent = `
      /* ======================================================================
         TÜRKİYE UNESCO DÜNYA MİRASI VİTRİNİ — MUSEUM-GRADE SHOWCASE
         ====================================================================== */
      .unesco-shell {
        display: flex;
        flex-direction: column;
        gap: 20px;
        animation: unescoFadeIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      }

      @keyframes unescoFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Hero & Live Progress Panel */
      .unesco-hero {
        position: relative;
        overflow: hidden;
        padding: 26px 28px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 92% 14%, rgba(245, 158, 11, 0.22) 0%, transparent 45%),
          radial-gradient(circle at 8% 92%, rgba(0, 242, 254, 0.14) 0%, transparent 45%),
          var(--bg-glass, rgba(15, 23, 42, 0.85));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(245, 158, 11, 0.28);
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.5));
      }

      .unesco-hero-top {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 20px;
      }

      .unesco-hero-kicker {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.32);
        padding: 4px 12px;
        border-radius: var(--radius-full, 9999px);
        margin-bottom: 10px;
      }

      .unesco-hero-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.75rem;
        font-weight: 800;
        line-height: 1.2;
        letter-spacing: -0.01em;
        background: linear-gradient(135deg, #ffffff 0%, #fde68a 55%, #f59e0b 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 6px;
      }

      .unesco-hero-subtitle {
        color: var(--text-secondary, #94a3b8);
        font-size: 0.92rem;
        max-width: 680px;
      }

      .unesco-kpi-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .unesco-kpi-pill {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 92px;
        padding: 10px 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        text-align: center;
      }

      .unesco-kpi-val {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.1;
      }

      .unesco-kpi-val.gold { color: var(--accent-gold, #f59e0b); }
      .unesco-kpi-val.emerald { color: var(--accent-emerald, #10b981); }
      .unesco-kpi-val.cyan { color: var(--accent-cyan, #00f2fe); }

      .unesco-kpi-label {
        font-size: 0.7rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 3px;
        white-space: nowrap;
      }

      /* Live UNESCO Progress Bar */
      .unesco-progress-box {
        background: rgba(10, 15, 29, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-md, 12px);
        padding: 14px 18px;
      }

      .unesco-progress-meta {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        font-size: 0.85rem;
      }

      .unesco-progress-label {
        font-weight: 600;
        color: var(--text-primary, #f8fafc);
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .unesco-progress-stat {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-weight: 700;
        color: var(--accent-gold, #f59e0b);
      }

      .unesco-progress-track {
        width: 100%;
        height: 12px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(148, 163, 184, 0.16);
        overflow: hidden;
        position: relative;
      }

      .unesco-progress-fill {
        height: 100%;
        border-radius: var(--radius-full, 9999px);
        background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 45%, #10b981 100%);
        box-shadow: 0 0 18px rgba(245, 158, 11, 0.45);
        transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .unesco-progress-foot {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 8px;
        margin-top: 8px;
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* Filter & Search Toolbar */
      .unesco-toolbar {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px 18px;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-glass, rgba(15, 23, 42, 0.85));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .unesco-filter-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .unesco-filter-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-secondary, #94a3b8);
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .unesco-filter-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(245, 158, 11, 0.45);
        transform: translateY(-1px);
      }

      .unesco-filter-btn.active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.24) 0%, rgba(16, 185, 129, 0.22) 100%);
        border-color: var(--accent-gold, #f59e0b);
        color: #ffffff;
        box-shadow: 0 0 16px rgba(245, 158, 11, 0.22);
      }

      .unesco-filter-count {
        font-size: 0.72rem;
        padding: 1px 7px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(255, 255, 255, 0.08);
        color: inherit;
      }

      .unesco-controls-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
      }

      .unesco-search-wrap {
        position: relative;
        flex: 1 1 260px;
      }

      .unesco-search-icon {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.9rem;
        pointer-events: none;
        opacity: 0.75;
      }

      .unesco-search-input {
        width: 100%;
        padding: 10px 36px 10px 38px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.72);
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, sans-serif);
        font-size: 0.86rem;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .unesco-search-input:focus {
        outline: none;
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18);
      }

      .unesco-search-clear {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        color: var(--text-secondary, #94a3b8);
        font-size: 1rem;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 6px;
        display: none;
      }

      .unesco-search-clear.visible {
        display: inline-flex;
      }

      .unesco-search-clear:hover {
        color: var(--text-primary, #f8fafc);
        background: rgba(255, 255, 255, 0.08);
      }

      .unesco-sort-select {
        padding: 10px 14px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.72);
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, sans-serif);
        font-size: 0.84rem;
        cursor: pointer;
      }

      .unesco-sort-select:focus {
        outline: none;
        border-color: var(--accent-gold, #f59e0b);
      }

      .unesco-result-summary {
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
        margin-left: auto;
        white-space: nowrap;
      }

      /* Magazine-Style Cards Grid */
      .unesco-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
        gap: 20px;
      }

      .unesco-card {
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-lg, 20px);
        overflow: hidden;
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.45));
        cursor: pointer;
        transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.28s, box-shadow 0.28s;
      }

      .unesco-card:hover,
      .unesco-card:focus-visible {
        transform: translateY(-5px);
        border-color: rgba(245, 158, 11, 0.55);
        box-shadow: 0 18px 36px -10px rgba(0, 0, 0, 0.6), 0 0 24px rgba(245, 158, 11, 0.18);
        outline: none;
      }

      .unesco-card.is-visited {
        border-color: rgba(16, 185, 129, 0.28);
      }

      .unesco-card.is-visited:hover {
        border-color: rgba(16, 185, 129, 0.65);
        box-shadow: 0 18px 36px -10px rgba(0, 0, 0, 0.6), 0 0 24px rgba(16, 185, 129, 0.2);
      }

      /* Card Media Header */
      .unesco-card-media {
        position: relative;
        height: 205px;
        overflow: hidden;
        background: #0f172a;
      }

      .unesco-card-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .unesco-card:hover .unesco-card-img {
        transform: scale(1.06);
      }

      .unesco-card-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(10, 15, 29, 0.52) 0%,
          rgba(10, 15, 29, 0.08) 42%,
          rgba(10, 15, 29, 0.88) 100%
        );
        pointer-events: none;
      }

      .unesco-card-top-badges {
        position: absolute;
        top: 12px;
        left: 12px;
        right: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      .unesco-year-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(10, 15, 29, 0.78);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(245, 158, 11, 0.55);
        color: #fde68a;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.04em;
      }

      .unesco-year-badge.mixed {
        border-color: rgba(16, 185, 129, 0.65);
        color: #a7f3d0;
      }

      .unesco-status-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.72rem;
        font-weight: 700;
        backdrop-filter: blur(8px);
      }

      .unesco-status-badge.visited {
        background: rgba(16, 185, 129, 0.88);
        color: #022c22;
        border: 1px solid rgba(167, 243, 208, 0.6);
      }

      .unesco-status-badge.pending {
        background: rgba(15, 23, 42, 0.78);
        color: #cbd5e1;
        border: 1px solid rgba(148, 163, 184, 0.35);
      }

      .unesco-card-bottom-meta {
        position: absolute;
        bottom: 12px;
        left: 14px;
        right: 14px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 8px;
      }

      .unesco-province-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.82rem;
        font-weight: 700;
        color: #ffffff;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
      }

      .unesco-plate-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 20px;
        padding: 0 5px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.16);
        border: 1px solid rgba(255, 255, 255, 0.28);
        font-size: 0.7rem;
        font-weight: 800;
      }

      .unesco-type-pill {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 3px 9px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(245, 158, 11, 0.22);
        color: #fde68a;
        border: 1px solid rgba(245, 158, 11, 0.42);
        backdrop-filter: blur(6px);
      }

      .unesco-type-pill.mixed {
        background: rgba(16, 185, 129, 0.24);
        color: #a7f3d0;
        border-color: rgba(16, 185, 129, 0.5);
      }

      /* Card Body */
      .unesco-card-body {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: 18px 20px 16px;
        gap: 10px;
      }

      .unesco-card-era {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--accent-cyan, #00f2fe);
        letter-spacing: 0.03em;
      }

      .unesco-criteria {
        color: var(--text-muted, #64748b);
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.7rem;
      }

      .unesco-card-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.15rem;
        font-weight: 800;
        line-height: 1.28;
        color: var(--text-primary, #f8fafc);
      }

      .unesco-card-subtitle {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--accent-gold, #f59e0b);
        line-height: 1.38;
        margin-top: -4px;
      }

      .unesco-card-desc {
        font-size: 0.84rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.58;
        flex: 1;
      }

      .unesco-highlights {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 2px;
      }

      .unesco-highlight-chip {
        font-size: 0.72rem;
        padding: 3px 9px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(148, 163, 184, 0.12);
        border: 1px solid rgba(148, 163, 184, 0.18);
        color: var(--text-primary, #f8fafc);
      }

      .unesco-related-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        padding-top: 6px;
        border-top: 1px dashed rgba(148, 163, 184, 0.2);
        font-size: 0.73rem;
        color: var(--text-secondary, #94a3b8);
      }

      .unesco-related-btn {
        background: rgba(0, 242, 254, 0.1);
        border: 1px solid rgba(0, 242, 254, 0.28);
        color: var(--accent-cyan, #00f2fe);
        border-radius: var(--radius-full, 9999px);
        padding: 2px 9px;
        font-size: 0.71rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s;
      }

      .unesco-related-btn:hover {
        background: rgba(0, 242, 254, 0.24);
        transform: translateY(-1px);
      }

      .unesco-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 12px;
        margin-top: 4px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .unesco-region-text {
        font-size: 0.76rem;
        color: var(--text-muted, #64748b);
      }

      .unesco-open-cta {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--accent-gold, #f59e0b);
        transition: transform 0.2s;
      }

      .unesco-card:hover .unesco-open-cta {
        transform: translateX(3px);
      }

      /* Empty State */
      .unesco-empty {
        grid-column: 1 / -1;
        text-align: center;
        padding: 48px 24px;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-card, rgba(30, 41, 59, 0.6));
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.18));
      }

      .unesco-empty-icon {
        font-size: 2.5rem;
        margin-bottom: 10px;
      }

      .unesco-empty-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 6px;
        color: var(--text-primary, #f8fafc);
      }

      .unesco-empty-desc {
        font-size: 0.86rem;
        color: var(--text-secondary, #94a3b8);
        margin-bottom: 16px;
      }

      .unesco-reset-btn {
        padding: 9px 18px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.16);
        color: #fde68a;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-weight: 700;
        font-size: 0.84rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .unesco-reset-btn:hover {
        background: rgba(245, 158, 11, 0.3);
      }

      /* Personal UNESCO Passport Stamp Tracker & Route Planner */
      .unesco-passport-panel {
        margin-top: 14px;
        background: rgba(10, 15, 29, 0.62);
        border: 1px solid rgba(16, 185, 129, 0.32);
        border-radius: var(--radius-md, 14px);
        padding: 15px 18px;
        display: flex;
        flex-direction: column;
        gap: 11px;
      }

      .unesco-passport-top {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      .unesco-passport-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.92rem;
        font-weight: 800;
        color: #a7f3d0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .unesco-passport-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .unesco-route-plan-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid rgba(0, 242, 254, 0.45);
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.22) 0%, rgba(16, 185, 129, 0.24) 100%);
        color: #ffffff;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .unesco-route-plan-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(0, 242, 254, 0.25);
        border-color: var(--accent-cyan, #00f2fe);
      }

      .unesco-sync-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 7px 12px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid rgba(245, 158, 11, 0.38);
        background: rgba(245, 158, 11, 0.14);
        color: #fde68a;
        font-size: 0.76rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .unesco-sync-btn:hover {
        background: rgba(245, 158, 11, 0.26);
      }

      .unesco-stamps-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .unesco-stamp-mini {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 0.71rem;
        font-weight: 700;
        border: 1px dashed rgba(148, 163, 184, 0.35);
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-secondary, #94a3b8);
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .unesco-stamp-mini.stamped {
        border-style: solid;
        border-color: rgba(16, 185, 129, 0.65);
        background: rgba(16, 185, 129, 0.2);
        color: #a7f3d0;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.18);
      }

      .unesco-stamp-toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 11px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: rgba(15, 23, 42, 0.65);
        color: #cbd5e1;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .unesco-stamp-toggle-btn:hover {
        border-color: rgba(245, 158, 11, 0.55);
        color: #ffffff;
      }

      .unesco-stamp-toggle-btn.is-stamped {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.28), rgba(245, 158, 11, 0.22));
        border-color: #10b981;
        color: #a7f3d0;
      }

      body.light-theme .unesco-passport-panel {
        background: rgba(241, 245, 249, 0.92);
        border-color: rgba(5, 150, 105, 0.32);
      }

      body.light-theme .unesco-passport-title {
        color: #065f46;
      }

      body.light-theme .unesco-route-plan-btn {
        background: linear-gradient(135deg, #0284c7 0%, #059669 100%);
        color: #ffffff;
        border-color: transparent;
      }

      body.light-theme .unesco-sync-btn {
        background: rgba(217, 119, 6, 0.12);
        color: #92400e;
        border-color: rgba(217, 119, 6, 0.35);
      }

      body.light-theme .unesco-stamp-mini {
        background: rgba(255, 255, 255, 0.9);
        color: #475569;
        border-color: rgba(15, 23, 42, 0.2);
      }

      body.light-theme .unesco-stamp-mini.stamped {
        background: rgba(16, 185, 129, 0.16);
        color: #065f46;
        border-color: #059669;
      }

      body.light-theme .unesco-stamp-toggle-btn {
        background: #f1f5f9;
        color: #334155;
        border-color: rgba(15, 23, 42, 0.16);
      }

      body.light-theme .unesco-stamp-toggle-btn.is-stamped {
        background: rgba(16, 185, 129, 0.18);
        color: #065f46;
        border-color: #059669;
      }

      /* Light Theme Overrides */
      body.light-theme .unesco-hero {
        background:
          radial-gradient(circle at 92% 14%, rgba(245, 158, 11, 0.16) 0%, transparent 45%),
          radial-gradient(circle at 8% 92%, rgba(14, 165, 233, 0.1) 0%, transparent 45%),
          rgba(255, 255, 255, 0.92);
        border-color: rgba(217, 119, 6, 0.28);
      }

      body.light-theme .unesco-hero-title {
        background: linear-gradient(135deg, #0f172a 0%, #b45309 65%, #d97706 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .unesco-kpi-pill,
      body.light-theme .unesco-progress-box {
        background: rgba(241, 245, 249, 0.85);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .unesco-toolbar {
        background: rgba(255, 255, 255, 0.9);
      }

      body.light-theme .unesco-filter-btn,
      body.light-theme .unesco-search-input,
      body.light-theme .unesco-sort-select {
        background: rgba(248, 250, 252, 0.95);
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .unesco-filter-btn.active {
        background: linear-gradient(135deg, #d97706 0%, #059669 100%);
        color: #ffffff;
        border-color: transparent;
      }

      body.light-theme .unesco-card {
        background: rgba(255, 255, 255, 0.94);
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 10px 24px -10px rgba(15, 23, 42, 0.16);
      }

      body.light-theme .unesco-card-era {
        color: #0284c7;
      }

      body.light-theme .unesco-card-subtitle {
        color: #b45309;
      }

      body.light-theme .unesco-highlight-chip {
        background: rgba(15, 23, 42, 0.06);
        border-color: rgba(15, 23, 42, 0.12);
        color: #1e293b;
      }

      body.light-theme .unesco-related-btn {
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.28);
        color: #0369a1;
      }

      body.light-theme .unesco-open-cta {
        color: #b45309;
      }

      body.light-theme .unesco-reset-btn {
        color: #92400e;
      }

      /* Responsive Breakpoints */
      @media (max-width: 960px) {
        .unesco-hero {
          padding: 20px;
        }
        .unesco-hero-title {
          font-size: 1.45rem;
        }
        .unesco-grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
      }

      @media (max-width: 540px) {
        .unesco-hero {
          padding: 16px;
        }
        .unesco-hero-title {
          font-size: 1.25rem;
        }
        .unesco-kpi-strip {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }
        .unesco-grid {
          grid-template-columns: 1fr;
        }
        .unesco-result-summary {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function enrichSites(provinces, checkedSet) {
    const safeChecked = checkedSet || new Set();
    return UNESCO_SITES.map(function (site) {
      const prov = (provinces && provinces[site.provinceKey]) || null;
      const visited = Boolean(prov && prov.visited);
      const personalChecked = safeChecked.has(site.id);
      const bannerSrc =
        prov && prov.has_banner && prov.banner_rel
          ? prov.banner_rel
          : 'assets/banner.jpg';
      const provinceName = prov ? prov.name : site.provinceKey.split('/').pop();
      const plate = prov && prov.plate != null ? String(prov.plate).padStart(2, '0') : '--';
      const regionName = prov ? prov.region : '';

      return Object.assign({}, site, {
        visited: visited,
        personalChecked: personalChecked,
        bannerSrc: bannerSrc,
        provinceName: provinceName,
        plate: plate,
        regionName: regionName
      });
    });
  }

  function computeMetrics(enrichedSites) {
    const total = enrichedSites.length;
    let visitedCount = 0;
    let personalCheckedCount = 0;
    let culturalCount = 0;
    let mixedCount = 0;
    const uniqueProvinces = new Set();
    const visitedUniqueProvinces = new Set();

    enrichedSites.forEach(function (s) {
      uniqueProvinces.add(s.provinceKey);
      if (s.visited) {
        visitedCount++;
        visitedUniqueProvinces.add(s.provinceKey);
      }
      if (s.personalChecked) {
        personalCheckedCount++;
      }
      if (s.type === 'mixed') mixedCount++;
      else culturalCount++;
    });

    const pendingCount = total - visitedCount;
    const unstampedCount = total - personalCheckedCount;
    const pct = total > 0 ? Math.round((visitedCount / total) * 1000) / 10 : 0;
    const personalPct = total > 0 ? Math.round((personalCheckedCount / total) * 1000) / 10 : 0;

    return {
      total: total,
      visitedCount: visitedCount,
      pendingCount: pendingCount,
      personalCheckedCount: personalCheckedCount,
      unstampedCount: unstampedCount,
      culturalCount: culturalCount,
      mixedCount: mixedCount,
      uniqueProvinceCount: uniqueProvinces.size,
      visitedProvinceCount: visitedUniqueProvinces.size,
      pct: pct,
      personalPct: personalPct
    };
  }

  function filterAndSortSites(enrichedSites, normalizeFn) {
    const query = normalizeFn(uiState.search || '');

    const filtered = enrichedSites.filter(function (site) {
      if (uiState.filter === 'visited' && !site.visited) return false;
      if (uiState.filter === 'pending' && site.visited) return false;
      if (uiState.filter === 'stamped' && !site.personalChecked) return false;
      if (uiState.filter === 'unstamped' && site.personalChecked) return false;
      if (uiState.filter === 'cultural' && site.type !== 'cultural') return false;
      if (uiState.filter === 'mixed' && site.type !== 'mixed') return false;

      if (query) {
        const haystack = normalizeFn(
          [
            site.name,
            site.subtitle,
            site.provinceName,
            site.regionName,
            site.era,
            site.year,
            site.description,
            site.highlights.join(' '),
            site.type === 'mixed' ? 'karma dogal kulturel' : 'kulturel'
          ].join(' ')
        );
        if (haystack.indexOf(query) === -1) return false;
      }

      return true;
    });

    const sorted = filtered.slice();
    if (uiState.sort === 'year-desc') {
      sorted.sort(function (a, b) {
        return b.year - a.year || a.name.localeCompare(b.name, 'tr');
      });
    } else if (uiState.sort === 'visited-first') {
      sorted.sort(function (a, b) {
        return (b.visited ? 1 : 0) - (a.visited ? 1 : 0) || a.year - b.year;
      });
    } else if (uiState.sort === 'stamped-first') {
      sorted.sort(function (a, b) {
        return (b.personalChecked ? 1 : 0) - (a.personalChecked ? 1 : 0) || a.year - b.year;
      });
    } else if (uiState.sort === 'alpha') {
      sorted.sort(function (a, b) {
        return a.name.localeCompare(b.name, 'tr');
      });
    } else {
      // default: year-asc
      sorted.sort(function (a, b) {
        return a.year - b.year || a.name.localeCompare(b.name, 'tr');
      });
    }

    return sorted;
  }

  function buildCardHtml(site, escapeHtml, provinces) {
    const isMixed = site.type === 'mixed';
    const typeBadgeText = isMixed ? '🌿 Karma' : '🏛️ Kültürel';
    const statusBadgeText = site.visited ? '✅ İl Gezildi' : '⏳ Bekliyor';
    const statusClass = site.visited ? 'visited' : 'pending';
    const isStamped = Boolean(site.personalChecked);

    const highlightsHtml = site.highlights
      .map(function (h) {
        return '<span class="unesco-highlight-chip">' + escapeHtml(h) + '</span>';
      })
      .join('');

    let relatedHtml = '';
    if (site.relatedProvinces && site.relatedProvinces.length > 0 && provinces) {
      const validRelated = site.relatedProvinces.filter(function (rp) {
        return Boolean(provinces[rp.key]);
      });
      if (validRelated.length > 0) {
        relatedHtml =
          '<div class="unesco-related-row">' +
          '<span>Diğer İller:</span>' +
          validRelated
            .map(function (rp) {
              const rpVisited = provinces[rp.key] && provinces[rp.key].visited;
              return (
                '<button type="button" class="unesco-related-btn" data-city-key="' +
                escapeHtml(rp.key) +
                '" title="' +
                escapeHtml(rp.label) +
                ' rehberini aç">' +
                (rpVisited ? '✓ ' : '') +
                escapeHtml(rp.label) +
                '</button>'
              );
            })
            .join('') +
          '</div>';
      }
    }

    return (
      '<article class="unesco-card ' +
      (site.visited || isStamped ? 'is-visited' : '') +
      '" role="button" tabindex="0" data-city-key="' +
      escapeHtml(site.provinceKey) +
      '" aria-label="' +
      escapeHtml(site.name + ' - ' + site.provinceName + ' şehir rehberini aç') +
      '">' +
      '<div class="unesco-card-media">' +
      '<img class="unesco-card-img" src="' +
      escapeHtml(site.bannerSrc) +
      '" alt="' +
      escapeHtml(site.name + ' (' + site.provinceName + ')') +
      '" loading="lazy" onerror="this.onerror=null;this.src=\'assets/banner.jpg\';" />' +
      '<div class="unesco-card-scrim"></div>' +
      '<div class="unesco-card-top-badges">' +
      '<span class="unesco-year-badge ' +
      (isMixed ? 'mixed' : '') +
      '">🏛️ UNESCO ' +
      escapeHtml(site.year) +
      '</span>' +
      '<span class="unesco-status-badge ' +
      statusClass +
      '">' +
      statusBadgeText +
      '</span>' +
      '</div>' +
      '<div class="unesco-card-bottom-meta">' +
      '<span class="unesco-province-tag">' +
      '<span class="unesco-plate-chip">' +
      escapeHtml(site.plate) +
      '</span>' +
      escapeHtml(site.provinceName) +
      '</span>' +
      '<span class="unesco-type-pill ' +
      (isMixed ? 'mixed' : '') +
      '">' +
      typeBadgeText +
      '</span>' +
      '</div>' +
      '</div>' +
      '<div class="unesco-card-body">' +
      '<div class="unesco-card-era">' +
      '<span>' +
      escapeHtml(site.era) +
      '</span>' +
      '<span class="unesco-criteria" title="UNESCO Evrensel Değer Kriterleri">Kriter: ' +
      escapeHtml(site.criteria) +
      '</span>' +
      '</div>' +
      '<h3 class="unesco-card-title">' +
      escapeHtml(site.name) +
      '</h3>' +
      '<p class="unesco-card-subtitle">' +
      escapeHtml(site.subtitle) +
      '</p>' +
      '<p class="unesco-card-desc">' +
      escapeHtml(site.description) +
      '</p>' +
      '<div class="unesco-highlights">' +
      highlightsHtml +
      '</div>' +
      relatedHtml +
      '<div class="unesco-card-footer">' +
      '<button type="button" class="unesco-stamp-toggle-btn ' +
      (isStamped ? 'is-stamped' : '') +
      '" data-unesco-stamp-id="' +
      escapeHtml(site.id) +
      '" aria-pressed="' +
      (isStamped ? 'true' : 'false') +
      '" title="Kişisel UNESCO pasaport mührünü işaretle">' +
      (isStamped ? '🛂 Pasaport Mührü Basıldı' : '⬜ Pasaporta Mühür Bas') +
      '</button>' +
      '<span class="unesco-open-cta">Şehir Rehberi →</span>' +
      '</div>' +
      '</div>' +
      '</article>'
    );
  }

  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const safeCtx = ctx || {};
    const data = safeCtx.data || {};
    const provinces = data.provinces || {};
    const escapeHtml =
      typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const normalizeTurkish =
      typeof safeCtx.normalizeTurkish === 'function'
        ? safeCtx.normalizeTurkish
        : fallbackNormalizeTurkish;
    const selectCity =
      typeof safeCtx.selectCity === 'function' ? safeCtx.selectCity : function () {};

    let checkedUnescoSet = loadCheckedUnescoIds();

    function paintView() {
      const enrichedSites = enrichSites(provinces, checkedUnescoSet);
      const metrics = computeMetrics(enrichedSites);

      const filterDefs = [
        { id: 'all', label: 'Tümü', count: metrics.total },
        { id: 'stamped', label: '🛂 Pasaportta Mühürlü', count: metrics.personalCheckedCount },
        { id: 'unstamped', label: '🧭 Mühür Bekleyen', count: metrics.unstampedCount },
        { id: 'visited', label: '✅ Gezilen İller', count: metrics.visitedCount },
        { id: 'pending', label: '⏳ Bekleyen İller', count: metrics.pendingCount },
        { id: 'cultural', label: '🏛️ Kültürel', count: metrics.culturalCount },
        { id: 'mixed', label: '🌿 Karma (Doğal+Kültürel)', count: metrics.mixedCount }
      ];

      const filterButtonsHtml = filterDefs
        .map(function (f) {
          const isActive = uiState.filter === f.id;
          return (
            '<button type="button" class="unesco-filter-btn ' +
            (isActive ? 'active' : '') +
            '" data-unesco-filter="' +
            f.id +
            '" aria-pressed="' +
            (isActive ? 'true' : 'false') +
            '">' +
            '<span>' +
            escapeHtml(f.label) +
            '</span>' +
            '<span class="unesco-filter-count">' +
            f.count +
            '</span>' +
            '</button>'
          );
        })
        .join('');

      const miniStampsHtml = enrichedSites
        .map(function (s) {
          return (
            '<button type="button" class="unesco-stamp-mini ' +
            (s.personalChecked ? 'stamped' : '') +
            '" data-unesco-stamp-id="' +
            escapeHtml(s.id) +
            '" title="' +
            escapeHtml(s.name + ' (' + s.provinceName + ') mühür durumunu değiştir') +
            '">' +
            (s.personalChecked ? '🛂 ' : '○ ') +
            escapeHtml(s.name.split(':')[0].split(' - ')[0]) +
            '</button>'
          );
        })
        .join('');

      container.innerHTML =
        '<section class="unesco-shell" aria-label="Türkiye UNESCO Dünya Mirası Vitrini">' +
        // Hero + Live Progress Bar
        '<div class="unesco-hero">' +
        '<div class="unesco-hero-top">' +
        '<div>' +
        '<span class="unesco-hero-kicker">✨ İnsanlığın Ortak Mirası · 1985 – 2023</span>' +
        '<h2 class="unesco-hero-title">🏛️ Türkiye UNESCO Dünya Mirası Vitrini</h2>' +
        '<p class="unesco-hero-subtitle">' +
        'Göbeklitepe\'nin 12.000 yıllık dikilitaşlarından Anadolu\'nun ahşap hipostil camilerine uzanan 21 evrensel hazineyi keşfedin, kişisel UNESCO pasaport mühürlerinizi işaretleyin ve gezilmeyen alanlara tek tıkla rota planlayın.' +
        '</p>' +
        '</div>' +
        '<div class="unesco-kpi-strip">' +
        '<div class="unesco-kpi-pill">' +
        '<span class="unesco-kpi-val gold">' +
        metrics.total +
        '</span>' +
        '<span class="unesco-kpi-label">UNESCO Mirası</span>' +
        '</div>' +
        '<div class="unesco-kpi-pill">' +
        '<span class="unesco-kpi-val emerald">' +
        metrics.personalCheckedCount +
        ' / ' +
        metrics.total +
        '</span>' +
        '<span class="unesco-kpi-label">Pasaport Mührü</span>' +
        '</div>' +
        '<div class="unesco-kpi-pill">' +
        '<span class="unesco-kpi-val cyan">' +
        metrics.visitedProvinceCount +
        ' / ' +
        metrics.uniqueProvinceCount +
        '</span>' +
        '<span class="unesco-kpi-label">Miras İli</span>' +
        '</div>' +
        '<div class="unesco-kpi-pill">' +
        '<span class="unesco-kpi-val">' +
        metrics.culturalCount +
        ' · ' +
        metrics.mixedCount +
        '</span>' +
        '<span class="unesco-kpi-label">Kültürel · Karma</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="unesco-progress-box">' +
        '<div class="unesco-progress-meta">' +
        '<span class="unesco-progress-label">🧭 Dijital Seyyah İl Bazlı UNESCO İlerlemesi</span>' +
        '<span class="unesco-progress-stat">' +
        metrics.visitedCount +
        ' / ' +
        metrics.total +
        ' Miras Alanı (%' +
        metrics.pct.toFixed(1) +
        ')</span>' +
        '</div>' +
        '<div class="unesco-progress-track" role="progressbar" aria-valuenow="' +
        metrics.visitedCount +
        '" aria-valuemin="0" aria-valuemax="' +
        metrics.total +
        '">' +
        '<div class="unesco-progress-fill" style="width: ' +
        metrics.pct +
        '%;"></div>' +
        '</div>' +
        '<div class="unesco-progress-foot">' +
        '<span>✅ ' +
        metrics.visitedCount +
        ' miras alanı ziyaret edilen illerde</span>' +
        '<span>⏳ ' +
        metrics.pendingCount +
        ' miras alanı keşif bekliyor</span>' +
        '</div>' +
        '</div>' +
        // Personal UNESCO Checklist & Passport Stamp Tracker
        '<div class="unesco-passport-panel">' +
        '<div class="unesco-passport-top">' +
        '<span class="unesco-passport-title">🛂 Kişisel UNESCO Pasaportu &amp; Mühür Defteri (' +
        metrics.personalCheckedCount +
        ' / ' +
        metrics.total +
        ' Mühür · %' +
        metrics.personalPct.toFixed(1) +
        ')</span>' +
        '<div class="unesco-passport-actions">' +
        '<button type="button" class="unesco-sync-btn" id="unescoSyncVisitedBtn" title="Gezilen illerdeki UNESCO alanlarını pasaporta otomatik mühürle">🔄 Gezilen İllerle Eşitle</button>' +
        '<button type="button" class="unesco-route-plan-btn" id="unescoPlanUnvisitedBtn">🧭 Gezilmeyen UNESCO Alanlarına Rota Planla</button>' +
        '</div>' +
        '</div>' +
        '<div class="unesco-progress-track" role="progressbar" aria-label="Kişisel UNESCO pasaport ilerlemesi" aria-valuenow="' +
        metrics.personalCheckedCount +
        '" aria-valuemin="0" aria-valuemax="' +
        metrics.total +
        '">' +
        '<div class="unesco-progress-fill" style="width: ' +
        metrics.personalPct +
        '%; background: linear-gradient(90deg, #10b981 0%, #00f2fe 55%, #f59e0b 100%);"></div>' +
        '</div>' +
        '<div class="unesco-stamps-strip">' +
        miniStampsHtml +
        '</div>' +
        '</div>' +
        '</div>' +
        // Filter & Search Toolbar
        '<div class="unesco-toolbar">' +
        '<div class="unesco-filter-row" role="group" aria-label="UNESCO filtreleri">' +
        filterButtonsHtml +
        '</div>' +
        '<div class="unesco-controls-row">' +
        '<div class="unesco-search-wrap">' +
        '<span class="unesco-search-icon" aria-hidden="true">🔍</span>' +
        '<input type="search" class="unesco-search-input" id="unescoSearchInput" placeholder="Miras alanı, şehir, dönem veya anıt ara (örn: Efes, 1985, Kapadokya, Sinan)..." value="' +
        escapeHtml(uiState.search) +
        '" autocomplete="off" />' +
        '<button type="button" class="unesco-search-clear ' +
        (uiState.search ? 'visible' : '') +
        '" id="unescoSearchClear" aria-label="Aramayı temizle">✕</button>' +
        '</div>' +
        '<select class="unesco-sort-select" id="unescoSortSelect" aria-label="Sıralama">' +
        '<option value="year-asc"' +
        (uiState.sort === 'year-asc' ? ' selected' : '') +
        '>📅 Kayıt Yılı (1985 → 2023)</option>' +
        '<option value="year-desc"' +
        (uiState.sort === 'year-desc' ? ' selected' : '') +
        '>📅 Kayıt Yılı (2023 → 1985)</option>' +
        '<option value="stamped-first"' +
        (uiState.sort === 'stamped-first' ? ' selected' : '') +
        '>🛂 Önce Pasaportta Mühürlüler</option>' +
        '<option value="visited-first"' +
        (uiState.sort === 'visited-first' ? ' selected' : '') +
        '>✅ Önce Ziyaret Edilen İller</option>' +
        '<option value="alpha"' +
        (uiState.sort === 'alpha' ? ' selected' : '') +
        '>🔤 Alfabetik (A → Z)</option>' +
        '</select>' +
        '<span class="unesco-result-summary" id="unescoResultSummary"></span>' +
        '</div>' +
        '</div>' +
        // Cards Grid
        '<div class="unesco-grid" id="unescoCardsGrid"></div>' +
        '</section>';

      const gridEl = container.querySelector('#unescoCardsGrid');
      const summaryEl = container.querySelector('#unescoResultSummary');
      const searchInput = container.querySelector('#unescoSearchInput');
      const searchClearBtn = container.querySelector('#unescoSearchClear');
      const sortSelect = container.querySelector('#unescoSortSelect');
      const filterButtons = container.querySelectorAll('[data-unesco-filter]');
      const planUnvisitedBtn = container.querySelector('#unescoPlanUnvisitedBtn');
      const syncVisitedBtn = container.querySelector('#unescoSyncVisitedBtn');

      function toggleStamp(siteId) {
        if (!siteId) return;
        if (checkedUnescoSet.has(siteId)) {
          checkedUnescoSet.delete(siteId);
        } else {
          checkedUnescoSet.add(siteId);
        }
        saveCheckedUnescoIds(checkedUnescoSet);
        paintView();
      }

      if (syncVisitedBtn) {
        syncVisitedBtn.addEventListener('click', function () {
          enrichedSites.forEach(function (s) {
            if (s.visited) checkedUnescoSet.add(s.id);
          });
          saveCheckedUnescoIds(checkedUnescoSet);
          if (typeof safeCtx.showToast === 'function') {
            safeCtx.showToast('🛂 Gezilen illerdeki UNESCO alanları pasaportunuza mühürlendi!');
          }
          paintView();
        });
      }

      if (planUnvisitedBtn) {
        planUnvisitedBtn.addEventListener('click', function () {
          let targetSites = enrichedSites.filter(function (s) {
            return !s.personalChecked && !s.visited;
          });
          if (!targetSites.length) {
            targetSites = enrichedSites.filter(function (s) {
              return !s.personalChecked;
            });
          }
          if (!targetSites.length) {
            targetSites = enrichedSites.filter(function (s) {
              return !s.visited;
            });
          }
          if (!targetSites.length) {
            targetSites = enrichedSites;
          }
          const routeProvinceKeys = [];
          targetSites.forEach(function (s) {
            if (s.provinceKey && routeProvinceKeys.indexOf(s.provinceKey) === -1) {
              routeProvinceKeys.push(s.provinceKey);
            }
          });
          dispatchRouteCities(
            safeCtx,
            routeProvinceKeys,
            '🧭 ' + routeProvinceKeys.length + ' UNESCO miras ili rota planlayıcıya aktarıldı!'
          );
        });
      }

      container.querySelectorAll('.unesco-stamp-mini[data-unesco-stamp-id]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          toggleStamp(btn.getAttribute('data-unesco-stamp-id'));
        });
      });

      function updateGrid() {
        const list = filterAndSortSites(enrichedSites, normalizeTurkish);

        if (summaryEl) {
          summaryEl.textContent =
            list.length === metrics.total
              ? 'Toplam ' + metrics.total + ' UNESCO mirası listeleniyor'
              : list.length + ' / ' + metrics.total + ' miras alanı gösteriliyor';
        }

        if (!gridEl) return;

        if (list.length === 0) {
          gridEl.innerHTML =
            '<div class="unesco-empty">' +
            '<div class="unesco-empty-icon">🏛️</div>' +
            '<h3 class="unesco-empty-title">Aramanızla eşleşen UNESCO mirası bulunamadı</h3>' +
            '<p class="unesco-empty-desc">Farklı bir anahtar kelime deneyebilir veya aktif filtreleri sıfırlayabilirsiniz.</p>' +
            '<button type="button" class="unesco-reset-btn" id="unescoResetBtn">Filtreleri Sıfırla</button>' +
            '</div>';

          const resetBtn = gridEl.querySelector('#unescoResetBtn');
          if (resetBtn) {
            resetBtn.addEventListener('click', function () {
              uiState.filter = 'all';
              uiState.search = '';
              paintView();
            });
          }
          return;
        }

        gridEl.innerHTML = list
          .map(function (site) {
            return buildCardHtml(site, escapeHtml, provinces);
          })
          .join('');
      }

      // Filter button clicks
      filterButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const nextFilter = btn.getAttribute('data-unesco-filter') || 'all';
          uiState.filter = nextFilter;
          filterButtons.forEach(function (b) {
            const active = b.getAttribute('data-unesco-filter') === nextFilter;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
          updateGrid();
        });
      });

      // Live search input (no focus loss)
      if (searchInput) {
        searchInput.addEventListener('input', function () {
          uiState.search = searchInput.value;
          if (searchClearBtn) {
            searchClearBtn.classList.toggle('visible', Boolean(uiState.search));
          }
          updateGrid();
        });
      }

      if (searchClearBtn) {
        searchClearBtn.addEventListener('click', function () {
          uiState.search = '';
          if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
          }
          searchClearBtn.classList.remove('visible');
          updateGrid();
        });
      }

      // Sort select
      if (sortSelect) {
        sortSelect.addEventListener('change', function () {
          uiState.sort = sortSelect.value;
          updateGrid();
        });
      }

      // Event delegation for card & related-province clicks and keyboard navigation
      if (gridEl) {
        gridEl.addEventListener('click', function (e) {
          const stampBtn = e.target.closest('[data-unesco-stamp-id]');
          if (stampBtn) {
            e.stopPropagation();
            toggleStamp(stampBtn.getAttribute('data-unesco-stamp-id'));
            return;
          }
          const relatedBtn = e.target.closest('.unesco-related-btn');
          if (relatedBtn) {
            e.stopPropagation();
            const relKey = relatedBtn.getAttribute('data-city-key');
            if (relKey) selectCity(relKey);
            return;
          }
          const card = e.target.closest('.unesco-card');
          if (card) {
            const cityKey = card.getAttribute('data-city-key');
            if (cityKey) selectCity(cityKey);
          }
        });

        gridEl.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          const card = e.target.closest('.unesco-card');
          if (card && e.target === card) {
            e.preventDefault();
            const cityKey = card.getAttribute('data-city-key');
            if (cityKey) selectCity(cityKey);
          }
        });
      }

      // Initial grid population
      updateGrid();
    }

    paintView();
  }

  window.SEYYAH_MODULES.unesco = {
    render: render,
    SITES: UNESCO_SITES
  };
})();
