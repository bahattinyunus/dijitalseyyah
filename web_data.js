// Otomatik Üretilen Dijital Seyyah Veri Modülü
const TRAVEL_DATA = {
  "stats": {
    "total_cities": 81,
    "visited_cities": 39,
    "unvisited_cities": 42,
    "progress_pct": 48.1,
    "estimated_km": 10898,
    "visited_regions": 6,
    "total_regions": 7,
    "days_on_road": 195,
    "library_hours": 780,
    "total_photos": 162,
    "provinces_with_two_photos": 81,
    "regional_breakdown": {
      "01_Marmara": {
        "name": "Marmara Bölgesi",
        "icon": "🏰",
        "color": "#38bdf8",
        "desc": "Payitaht ve Tohum: Bir cihan imparatorluğunun mayalandığı iki kıtayı bağlayan kadim topraklar.",
        "total": 11,
        "visited": 3,
        "percentage": 27.3
      },
      "02_Ege": {
        "name": "Ege Bölgesi",
        "icon": "🌊",
        "color": "#34d399",
        "desc": "Zamanın Çizgileri & Zeytin Dalı: Antik mermerlerden turkuaz koylara uzanan bilgelik coğrafyası.",
        "total": 8,
        "visited": 3,
        "percentage": 37.5
      },
      "03_Akdeniz": {
        "name": "Akdeniz Bölgesi",
        "icon": "☀️",
        "color": "#f59e0b",
        "desc": "Sıcaklık & Antik Limanlar: Torosların heybetiyle kucaklaşan bin yıllık limanlar ve bereket ovaları.",
        "total": 8,
        "visited": 5,
        "percentage": 62.5
      },
      "04_IcAnadolu": {
        "name": "İç Anadolu Bölgesi",
        "icon": "🌾",
        "color": "#fbbf24",
        "desc": "Bozkırın Kalbi & İrfan Havzası: Mevlana'dan Yunus Emre'ye, Hacı Bektaş'tan Ahi Evran'a uzanan tevazu yurdu.",
        "total": 13,
        "visited": 8,
        "percentage": 61.5
      },
      "05_Karadeniz": {
        "name": "Karadeniz Bölgesi",
        "icon": "🌲",
        "color": "#10b981",
        "desc": "Zikir, Orman & Dalga: Hırçın dalgaların yemyeşil yaylalarla buluştuğu doğanın muazzam senfonisi.",
        "total": 18,
        "visited": 11,
        "percentage": 61.1
      },
      "06_DoguAnadolu": {
        "name": "Doğu Anadolu Bölgesi",
        "icon": "🏔️",
        "color": "#a855f7",
        "desc": "Zirvelerin İhtişamı & Kaleler: Zorlu iklimlerde pişen hayatların ve sarsılmaz kalelerin vakur duruşu.",
        "total": 14,
        "visited": 9,
        "percentage": 64.3
      },
      "07_GuneydoguAnadolu": {
        "name": "Güneydoğu Anadolu Bölgesi",
        "icon": "🏜️",
        "color": "#f97316",
        "desc": "Mezopotamya'nın Ninnisi & Medeniyet Beşiği: Göbeklitepe'den Harran'a, toprağın taşa, taşın efsaneye dönüştüğü masal.",
        "total": 9,
        "visited": 0,
        "percentage": 0.0
      }
    }
  },
  "achievements": {
    "rank": {
      "min_cities": 25,
      "title": "Anadolu Kâşifi",
      "icon": "🗺️",
      "desc": "Bölgeleri aşan, kadim şehirlerin ruhunu kayda geçiren seyyah."
    },
    "next_rank": {
      "min_cities": 41,
      "title": "Evliya Çelebi İzinde",
      "icon": "📜",
      "desc": "Anadolu'nun yarısını aşmış, seyahatnamesini olgunlaştırmış üstat."
    },
    "cities_to_next_rank": 2,
    "unlocked_count": 5,
    "total_badges": 8,
    "badges": [
      {
        "id": "first_step",
        "icon": "👣",
        "title": "İlk Adım",
        "desc": "İlk şehri adımla ve seyahatnameye işle",
        "current": 1,
        "target": 1,
        "unlocked": true
      },
      {
        "id": "ten_thousand_km",
        "icon": "🛣️",
        "title": "10.000 km Menzil",
        "desc": "Anadolu yollarında 10.000 km karayolu izi bırak",
        "current": 10000,
        "target": 10000,
        "unlocked": true
      },
      {
        "id": "library_scholar",
        "icon": "📚",
        "title": "Kütüphane Müdavimi",
        "desc": "30 farklı İl Halk Kütüphanesinde mesai yap",
        "current": 30,
        "target": 30,
        "unlocked": true
      },
      {
        "id": "karadeniz_explorer",
        "icon": "🌲",
        "title": "Karadeniz Kâşifi",
        "desc": "Karadeniz bölgesinde en az 10 il ziyaret et",
        "current": 10,
        "target": 10,
        "unlocked": true
      },
      {
        "id": "east_summits",
        "icon": "🏔️",
        "title": "Doğu Zirveleri",
        "desc": "Doğu Anadolu'da en az 8 il keşfet",
        "current": 8,
        "target": 8,
        "unlocked": true
      },
      {
        "id": "halfway_anatolia",
        "icon": "⭐",
        "title": "Yarı Yol Eşiğinde",
        "desc": "81 ilin yarısından fazlasını (41 il) adımla",
        "current": 39,
        "target": 41,
        "unlocked": false
      },
      {
        "id": "seven_regions",
        "icon": "🌍",
        "title": "Yedi İklim Fatihi",
        "desc": "Türkiye'nin 7 coğrafi bölgesinin tamamına ayak bas",
        "current": 6,
        "target": 7,
        "unlocked": false
      },
      {
        "id": "anatolia_master",
        "icon": "👑",
        "title": "Hâfız-ı Anadolu",
        "desc": "Türkiye'nin 81 ilinin tamamını keşfet",
        "current": 39,
        "target": 81,
        "unlocked": false
      }
    ]
  },
  "regions": {
    "01_Marmara": {
      "name": "Marmara Bölgesi",
      "icon": "🏰",
      "color": "#38bdf8",
      "desc": "Payitaht ve Tohum: Bir cihan imparatorluğunun mayalandığı iki kıtayı bağlayan kadim topraklar."
    },
    "02_Ege": {
      "name": "Ege Bölgesi",
      "icon": "🌊",
      "color": "#34d399",
      "desc": "Zamanın Çizgileri & Zeytin Dalı: Antik mermerlerden turkuaz koylara uzanan bilgelik coğrafyası."
    },
    "03_Akdeniz": {
      "name": "Akdeniz Bölgesi",
      "icon": "☀️",
      "color": "#f59e0b",
      "desc": "Sıcaklık & Antik Limanlar: Torosların heybetiyle kucaklaşan bin yıllık limanlar ve bereket ovaları."
    },
    "04_IcAnadolu": {
      "name": "İç Anadolu Bölgesi",
      "icon": "🌾",
      "color": "#fbbf24",
      "desc": "Bozkırın Kalbi & İrfan Havzası: Mevlana'dan Yunus Emre'ye, Hacı Bektaş'tan Ahi Evran'a uzanan tevazu yurdu."
    },
    "05_Karadeniz": {
      "name": "Karadeniz Bölgesi",
      "icon": "🌲",
      "color": "#10b981",
      "desc": "Zikir, Orman & Dalga: Hırçın dalgaların yemyeşil yaylalarla buluştuğu doğanın muazzam senfonisi."
    },
    "06_DoguAnadolu": {
      "name": "Doğu Anadolu Bölgesi",
      "icon": "🏔️",
      "color": "#a855f7",
      "desc": "Zirvelerin İhtişamı & Kaleler: Zorlu iklimlerde pişen hayatların ve sarsılmaz kalelerin vakur duruşu."
    },
    "07_GuneydoguAnadolu": {
      "name": "Güneydoğu Anadolu Bölgesi",
      "icon": "🏜️",
      "color": "#f97316",
      "desc": "Mezopotamya'nın Ninnisi & Medeniyet Beşiği: Göbeklitepe'den Harran'a, toprağın taşa, taşın efsaneye dönüştüğü masal."
    }
  },
  "quotes": [
    {
      "quote": "Dünya bir kitaptır ve seyahat etmeyenler onun sadece bir sayfasını okur.",
      "author": "Aurelius Augustinus"
    },
    {
      "quote": "İyi bir gezginin sabit planları ve varmak gibi bir amacı yoktur.",
      "author": "Lao Tzu"
    },
    {
      "quote": "Gerçek keşif yolculuğu yeni manzaralar bulmak değil, yeni gözlerle bakmaktır.",
      "author": "Marcel Proust"
    },
    {
      "quote": "Kıyıyı gözden kaybetmeye cesaret edemeyenler, yeni okyanuslar keşfedemezler.",
      "author": "Andre Gide"
    },
    {
      "quote": "Yollar, sadece ayakların değil, zihnin de özgürleştiği patikalardır.",
      "author": "Friedrich Nietzsche"
    },
    {
      "quote": "De ki: Yeryüzünde gezip dolaşın da Allah’ın yaratmaya nasıl başladığını görün...",
      "author": "Kur'an-ı Kerim (Ankebût, 20)"
    },
    {
      "quote": "Yolculuğa çıkın ki sıhhat bulasınız ve ganimet elde edesiniz.",
      "author": "Hz. Muhammed (s.a.v.)"
    },
    {
      "quote": "Dünyada tıpkı bir garip veya bir yolcu gibi ol.",
      "author": "Hz. Muhammed (s.a.v.)"
    },
    {
      "quote": "Su akar ve hareket ederse tatlanır ve temiz kalır; durursa bozulur ve kokar. İnsan da seyahat ettikçe kemale erer.",
      "author": "İmam Şâfiî"
    },
    {
      "quote": "Yolculuk; varlığın hakikatini, insanın acziyetini ve nefsin gizli köşelerini ortaya çıkaran en berrak aynadır.",
      "author": "Muhyiddin İbnü'l-Arabî"
    },
    {
      "quote": "Yola çık ki yol sana görünsün; kendini yola bırak ki menzile eresin.",
      "author": "Ferîdüddin Attar"
    },
    {
      "quote": "Yolculuk, önce seni sessizleştirir, sonra da iyi bir hikâye anlatıcısına dönüştürür.",
      "author": "İbn Battûta"
    },
    {
      "quote": "Seyahat Ya Resulallah! Niyetiyle düşülen yollar, bereketiyle menzile erdirir.",
      "author": "Evliya Çelebi"
    },
    {
      "quote": "Gezgin, vardığı yerdeki her taşı bir anı, her insanı bir öğretmen gibi selamlar.",
      "author": "Kadim Doğu Özdeyişi"
    }
  ],
  "provinces": {
    "01_Marmara/Balikesir": {
      "plate": 10,
      "name": "Balıkesir",
      "region": "Marmara",
      "region_code": "01_Marmara",
      "lat": 39.6484,
      "lng": 27.8826,
      "landmarks": [
        "Zağnos Paşa Camii",
        "Cunda Adası",
        "Kaz Dağları",
        "Manyas Kuş Cenneti"
      ],
      "specialties": [
        "Höşmerim",
        "Susurluk Tostu & Ayranı",
        "Balıkesir Kaymaklısı"
      ],
      "quote": "Kaz Dağları'nın oksijeni ile Marmara ve Ege'nin buluştuğu bereketli topraklar.",
      "library": "Balıkesir İl Halk Kütüphanesi - Geniş bahçesi ve sakin çalışma alanlarıyla verimli bir ortam.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "01_Marmara/Balikesir/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "01_Marmara/Balikesir/gallery.jpg",
      "images": [
        "01_Marmara/Balikesir/banner.jpg",
        "01_Marmara/Balikesir/gallery.jpg"
      ],
      "readme_rel": "01_Marmara/Balikesir/README.md",
      "slug": "Balikesir",
      "content_size": 5290,
      "custom_quote": "Kaz Dağları'nın oksijeni ile Marmara ve Ege'nin buluştuğu bereketli topraklar.",
      "history": "Hem Marmara hem de Ege Denizi'ne kıyısı olan nadir Anadolu illerinden Balıkesir, antik Mysia coğrafyasının bereketli ovaları üzerinde yükselir. Tarih sahnesinde Roma imparatoru Hadrianus'un kurduğu Hadrianutherae şehrinden, Anadolu Selçukluları sonrasında denizcilikte çığır açan Karesioğulları Beyliği'ne kadar köklü bir devlet geleneğine ev sahipliği yapmıştır. Karesioğulları'nın Osmanlı'ya katılmasıyla birlikte Türklerin Rumeli'ye geçişinin ve Osmanlı donanmasının temel taşı hâline gelen Balıkesir, Millî Mücadele yıllarında da \"Kuva-yı Milliye Şehri\" unvanını alnının akıyla kazanmıştır. Zeytinliklerle bezeli Edremit Körfezi, kuş cıvıltılarıyla dolup taşan Manyas Kuş Cenneti ve efsanelere konu olan Kaz Dağları ile tabiat ve tarih bu şehirde eşsiz bir ahenk içindedir.",
      "literary_quotes": [
        "\"Balıkesir, havası latif, suları şifalı, halkı misafirperver ve çarşıları mamur bir beldedir.\" — Evliya Çelebi",
        "\"Kaz Dağları'nın çam kokulu rüzgarında insan, yeryüzünün ilk yaratıldığı günkü ferahlığı hisseder.\" — Sabahattin Ali (Kuyucaklı Yusuf & Hasan Boğuldu izleğinden)",
        "\"Balıkesir, Kuva-yı Milliye'nin ilk ateşinin yakıldığı, düşmana karşı azmin ve birliğin sarsılmaz kalesidir.\" — Millî Mücadele Hatıratları"
      ],
      "spiritual_figures": [
        "**Zağnos Mehmet Paşa:** Fatih Sultan Mehmed'in sadrazamı ve İstanbul'un fethinin önde gelen komutanlarından; Balıkesir merkezde yaptırdığı Zağnos Paşa Camii ve Külliyesi şehrin hem manevi hem de Millî Mücadele dönemindeki hutbe hafızasının merkezidir.",
        "**Karesi Bey & Hacı İlbey:** Karesioğulları'nın kurucu iradesi ve Osmanlı'nın Rumeli fetihlerine öncülük eden alp gaziler; bölgenin denizcilik ve akıncılık ruhunu şekillendirmiştir.",
        "**Hasan Baba & Hasan Boğuldu Efsanesi:** Kaz Dağları'nın serin sularına ve yüksek yaylalarına sinmiş halk irfanı ve Sabahattin Ali'nin kalemiyle ölümsüzleşen Anadolu hikayeciliği.",
        "**Seyit Onbaşı (Havranlı Koca Seyit):** Çanakkale destanında 276 kiloluk mermiyi sırtlayarak tarihin akışını değiştiren Havranlı kahraman; Balıkesir toprağının vefa ve metanet timsalidir."
      ],
      "five_day_plan": [
        "**1. Gün — Kuruluş ve Kuva-yı Milliye Merkezi:** Balıkesir İl Halk Kütüphanesi mesaisi sonrası Zağnos Paşa Camii, Yıldırım Camii, Saat Kulesi ve Kuva-yı Milliye Müzesi ziyareti; akşam merkezde höşmerim tadımı.",
        "**2. Gün — Kuşların ve Gölün Sükuneti (Bandırma & Manyas):** Manyas Kuş Cenneti Milli Parkı'nda göçmen kuşların gözlemi, Kyzikos Antik Kenti kalıntıları ve Erdek kıyılarında Marmara rüzgarı eşliğinde yürüyüş.",
        "**3. Gün — Kaz Dağları'nın Oksijeni (Edremit & Hasan Boğuldu):** Kaz Dağları Milli Parkı, Sütüven Şelalesi, Hasan Boğuldu Göleti ve Tahtakuşlar Etnografya Müzesi'nde Yörük-Türkmen kültürünün izini sürme.",
        "**4. Gün — Taş Sokaklar ve Adalar (Ayvalık & Cunda):** Ayvalık'ın tarihi Rum ve Osmanlı taş evleri, Taksiyarhis Anıt Müzesi, Cunda Adası sokakları ve Şeytan Sofrası'nda Ege'ye karşı gün batımı tefekkürü.",
        "**5. Gün — Vefa ve Şifa Durağı (Havran & Bigadiç / Susurluk):** Havran'da Koca Seyit Anıtı ziyareti, dönüş güzergahında Susurluk'ta meşhur köpüklü ayran eşliğinde Balıkesir sefer defterinin notlarını temize çekme."
      ]
    },
    "01_Marmara/Bilecik": {
      "plate": 11,
      "name": "Bilecik",
      "region": "Marmara",
      "region_code": "01_Marmara",
      "lat": 40.1426,
      "lng": 29.9793,
      "landmarks": [
        "Şeyh Edebali Türbesi",
        "Söğüt Ertuğrul Gazi Türbesi",
        "Saat Kulesi"
      ],
      "specialties": [
        "Bilecik Güveci",
        "Pazaryeri Helvası",
        "Bıldırcın Kebabı"
      ],
      "quote": "Osmanlı Devleti'nin mayalandığı, Şeyh Edebali'nin 'İnsanı yaşat ki devlet yaşasın' nasihatinin yankılandığı kurucu menzil.",
      "library": "Bilecik İl Halk Kütüphanesi - Sakin ve odaklanmaya elverişli butik bir çalışma alanı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "01_Marmara/Bilecik/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "01_Marmara/Bilecik/gallery.jpg",
      "images": [
        "01_Marmara/Bilecik/banner.jpg",
        "01_Marmara/Bilecik/gallery.jpg"
      ],
      "readme_rel": "01_Marmara/Bilecik/README.md",
      "slug": "Bilecik",
      "content_size": 5018,
      "custom_quote": "Osmanlı Devleti'nin mayalandığı, Şeyh Edebali'nin 'İnsanı yaşat ki devlet yaşasın' nasihatinin yankılandığı kurucu menzil.",
      "history": "Marmara, Ege, İç Anadolu ve Karadeniz bölgelerinin dördünde de toprağı bulunan Türkiye'nin tek ili olan Bilecik, coğrafi bir kavşak olmanın ötesinde bir cihan devletinin tohumlarının atıldığı kutlu bir eşiktir. 13. yüzyılın sonlarında Ertuğrul Gazi liderliğindeki Kayı Boyu'nun Söğüt'ü kışlak, Domaniç'i yaylak edinmesiyle başlayan bu yürüyüş, 1299 yılında Osman Gazi'nin istiklalini ilan etmesiyle tarihin akışını değiştirmiştir. Sakarya Nehri'nin bereketli vadileri, derin kanyonları ve sarp tepeleri arasında kurulu olan Bilecik; Ahilik teşkilatının ahlakını, gaza ruhunu ve devlet hikmetini taşlarında saklar. Eski Bilecik vadisindeki Şeyh Edebali Türbesi, Orhan Gazi Camii ve Söğüt'teki Ertuğrul Gazi Otağı, bu şehri yalnızca bir gezi noktası değil, bir medeniyet muhasebesi durağı kılar.",
      "literary_quotes": [
        "\"Ey oğul! İnsanı yaşat ki devlet yaşasın. Geçmişini bilmeyen, geleceğini de bilemez.\" — Şeyh Edebali",
        "\"Söğüt'te bir çınar tohumu toprağa düştü; gölgesi üç kıtayı ve yedi denizi kapladı.\" — Tarık Buğra (Osmancık izleğinden)",
        "\"Bilecik ve Söğüt vadilerinde esen rüzgar, hâlâ kuruluş çağının samimiyetini ve tevazusunu taşır.\" — Anadolu Seyahat Notları"
      ],
      "spiritual_figures": [
        "**Şeyh Edebali:** Osmanlı Devleti'nin manevi kurucusu, Ahi teşkilatının önderi ve Osman Gazi'nin kayınpederi. \"Ey oğul! Beysin! Bundan sonra öfke bize, uysallık sana... İnsanı yaşat ki devlet yaşasın!\" vasiyetiyle altı asırlık bir adalet felsefesinin temelini atmıştır.",
        "**Ertuğrul Gazi:** Kayı Boyu'nun uç beyi, Osman Gazi'nin babası; Söğüt'teki türbesi her yıl Yörük ve Türkmenlerin vefa durağıdır.",
        "**Dursun Fakıh:** Şeyh Edebali'nin talebesi ve damadı; Osman Gazi adına ilk hutbeyi okuyarak Osmanlı'nın ilk kadısı ve hukuk mimarı olmuştur.",
        "**Kuyulu Mescit & Orhan Gazi Mirası:** Kuruluş döneminin sade, gösterişten uzak ama derin anlam yüklü erken Osmanlı mimari estetiği."
      ],
      "five_day_plan": [
        "**1. Gün — Manevi Kuruluşun Kalbi (Eski Bilecik Vadisi):** Kütüphane mesaisi sonrası Şeyh Edebali Türbesi, Orhan Gazi Camii, Osmanlı Padişahları Tarih Şeridi ve şehir merkezindeki Tarihi Saat Kulesi ziyareti.",
        "**2. Gün — Kayı'nın Otağı (Söğüt):** Ertuğrul Gazi Türbesi'nde alp nöbeti değişimini izleme, Kuyulu Mescit, Hamidiye Camii ve Söğüt Ertuğrul Gazi Müzesi'nde kuruluş asrının izlerini sürme.",
        "**3. Gün — İlk Hutbenin Tepesi ve Yaylalar (Bozüyük & Metristepe):** İnhisar-Söğüt hattından geçerek Dursun Fakıh Türbesi ziyareti, Bozüyük'te Kasımpaşa Camii ve Millî Mücadele'nin dönüm noktası Metristepe Anıtı.",
        "**4. Gün — Kanyonlar ve Su Sükuneti (Pazaryeri & Gölpazarı):** Harmankaya Kanyonu Tabiat Parkı'nda doğa yürüyüşü, Küçükelmalı Tabiat Parkı ve Pazaryeri'nde meşhur helva-boza molası.",
        "**5. Gün — Sakarya Kıyısında Tarihi Evler (Osmaneli):** Konakları ve Rüstem Paşa Camii ile ünlü Osmaneli (Lefke) sokaklarında yürüyüş, Sakarya Nehri kıyısında not derleme ve veda."
      ]
    },
    "01_Marmara/Bursa": {
      "plate": 16,
      "name": "Bursa",
      "region": "Marmara",
      "region_code": "01_Marmara",
      "lat": 40.1885,
      "lng": 29.061,
      "landmarks": [
        "Ulu Cami",
        "Yeşil Türbe",
        "Cumalıkızık",
        "Emir Sultan Camii",
        "Muradiye Külliyesi"
      ],
      "specialties": [
        "İskender Kebap",
        "Kestane Şekeri",
        "Muradiye Çorbası",
        "Cantık"
      ],
      "quote": "Bursa'da zaman, bir yeşil şadırvanda şırıldayan suyun musikisidir; Osmanlı'nın kurucu ve manevi payitahtı.",
      "library": "Bursa İl Halk Kütüphanesi - Geniş ve ferah salonları, zengin araştırma kaynakları ve huzurlu bahçesiyle ideal bir ilim yuvası.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "01_Marmara/Bursa/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "01_Marmara/Bursa/gallery.jpg",
      "images": [
        "01_Marmara/Bursa/banner.jpg",
        "01_Marmara/Bursa/gallery.jpg"
      ],
      "readme_rel": "01_Marmara/Bursa/README.md",
      "slug": "Bursa",
      "content_size": 5748,
      "custom_quote": "Yeşil Bursa, Osmanlı'nın ilk payitahtı, Uludağ'ın eteklerinde kurulmuş manevi bir sığınaktır.",
      "custom_library": "Bursa İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Osmanlı Devleti'nin ilk başkenti olan Bursa, imparatorluğun kurucu kodlarını barındırır. İpekyolu'nun en önemli ticaret merkezlerinden biri olarak tarih boyunca parlamıştır.",
      "literary_quotes": [
        "\"Bursa'da zaman, bir yeşil şadırvanda şırıldayan suyun musikisidir.\" — Ahmet Hamdi Tanpınar",
        "\"Bursa, Osmanlı'nın dip diri ve taptaze kökü, maneviyatın beşiğidir.\" — Evliya Çelebi",
        "\"Bursa'yı görmeyen, Osmanlı'nın ruhunu tam olarak anlayamaz.\" — Yahya Kemal Beyatlı"
      ],
      "reflection": "Ulu Cami'nin şadırvanından dökülen suyun sesinde zamanın ve mekanın ötesine geçer, sükuneti tefekkür edersiniz. Emir Sultan'ın ve Üftade'nin manevi huzurunda kalbinizi dinlendirirsiniz.",
      "spiritual_figures": [
        "**Osman Gazi & Orhan Gazi:** Osmanlı Cihan Devleti'nin kurucu iradesi ve Bursa'nın fatihi; Tophane sırtlarındaki türbeleriyle şehre vakur bir mühür vururlar.",
        "**Emir Sultan (Şemseddin Muhammed Buharî):** Buhara'dan Anadolu'ya uzanan irfan köprüsü, Yıldırım Bayezid'in damadı ve Bursa'nın en büyük manevi sığınaklarından biri.",
        "**Somuncu Baba (Şeyh Hamid-i Velî):** Ulu Cami'nin açılış hutbesinde Fatiha Suresi'ni yedi farklı vecihle tefsir eden, tevazunun ve gönül erliğinin simgesi.",
        "**Aziz Mahmud Hüdayî'nin Mürşidi Üftade Hazretleri:** Celvetiye tarikatının kurucusu, \"İlim amel ile, amel ihlas ile kemale erer\" düsturuyla Bursa irfanını besleyen büyük velî.",
        "**Molla Fenarî & İsmail Hakkı Bursevî:** Osmanlı'nın ilk şeyhülislamı Molla Fenarî ile *Ruhu'l-Beyan* tefsirinin müellifi İsmail Hakkı Bursevî, şehrin ilim ve tefekkür ufkunu temsil eder.",
        "**Süleyman Çelebi:** Ulu Cami'nin ilk imamı ve asırlardır gönüllerde yankılanan *Vesiletü'n-Necat (Mevlid)* eserinin müellifi."
      ],
      "five_day_plan": [
        "**1. Gün — Kuruluşun Kalbi (Hanlar Bölgesi & Tophane):** Sabah kütüphane mesaisi sonrası Ulu Cami'nin yirmi kubbesi altında tefekkür, Koza Han'da ipek dokusu eşliğinde çay molası, Kapalıçarşı ve gün batımında Osman Gazi ile Orhan Gazi türbelerinin bulunduğu Tophane Saat Kulesi seyri.",
        "**2. Gün — İrfan Tepeleri (Yeşil, Emir Sultan & Yıldırım):** Çelebi Mehmed'in mirası Yeşil Cami ve Yeşil Türbe'nin çinilerini temaşa, ardından Emir Sultan Külliyesi ve Yıldırım Bayezid Külliyesi'nde manevi duraklama; akşamüstü Irgandı Köprüsü'nde zanaat atölyeleri ziyareti.",
        "**3. Gün — Osmanlı Köy Dokusu ve Sultanlar (Cumalıkızık & Muradiye):** Sabah erken saatlerde UNESCO Mirası Cumalıkızık'ın Arnavut kaldırımlı dar sokaklarında yürüyüş; öğleden sonra Muradiye Külliyesi'ndeki şehzade türbeleri ve Üftade Hazretleri Dergâhı'nda sükunet.",
        "**4. Gün — Uludağ'ın Nefesi ve İnkaya:** Teleferik veya karayoluyla Uludağ'ın çam kokulu eteklerine çıkış, 600 yıllık İnkaya Çınarı gölgesinde okuma molası ve akşam Bursa kent merkezinde tarihi esnaf lokantasında yöresel lezzetler.",
        "**5. Gün — Marmara Kıyısında Veda (Mudanya & Tirilye):** Gündüz son kütüphane ve not derleme mesaisinin ardından Mudanya Mütareke Evi ve zeytin ağaçlarıyla çevrili tarihi Tirilye sokaklarında Marmara'ya karşı tefekkür dolu bir veda."
      ]
    },
    "01_Marmara/Canakkale": {
      "plate": 17,
      "name": "Çanakkale",
      "region": "Marmara",
      "region_code": "01_Marmara",
      "lat": 40.1553,
      "lng": 26.4142,
      "landmarks": [
        "Şehitler Abidesi",
        "Truva Antik Kenti",
        "Aynalı Çarşı",
        "Kilitbahir Kalesi"
      ],
      "specialties": [
        "Peynir Helvası",
        "Sardalya",
        "Ezine Peyniri"
      ],
      "quote": "Tarihin yazıldığı, bir milletin bağımsızlık destanını kanıyla mühürlediği manevi boğaz.",
      "library": "Çanakkale Mehmet Akif Ersoy İl Halk Kütüphanesi - Modern deniz manzaralı ferah çalışma ortamı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "01_Marmara/Canakkale/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "01_Marmara/Canakkale/gallery.jpg",
      "images": [
        "01_Marmara/Canakkale/banner.jpg",
        "01_Marmara/Canakkale/gallery.jpg"
      ],
      "readme_rel": "01_Marmara/Canakkale/README.md",
      "slug": "Canakkale",
      "content_size": 5194,
      "custom_quote": "Tarihin yazıldığı, bir milletin bağımsızlık destanını kanıyla mühürlediği manevi boğaz.",
      "history": "Asya ile Avrupa'yı dar bir su geçidiyle ayıran ve aynı zamanda ebediyen birbirine bağlayan Çanakkale, beş bin yıllık insanlık hafızasının en çarpıcı sahnelerinden biridir. Bir yakasında Homeros'un *İlyada* destanına ilham veren UNESCO Dünya Mirası Truva Antik Kenti ve Aristoteles'in felsefe okulu kurduğu Assos yükselirken; karşı yakasında, Gelibolu Yarımadası'nda 1915'te \"Çanakkale Geçilmez\" iradesini tarihe kazıyan eşsiz bir vatan müdafaası yatar. Fatih Sultan Mehmed'in boğazın kilidi olarak inşa ettirdiği Kilitbahir ve Çimenlik kaleleri, Osmanlı denizcilik tarihinin stratejik zekasını yansıtır. Bugün Bozcaada ve Gökçeada'nın rüzgarlı kıyıları, Kaz Dağları'nın serin etekleri ve boğazın serin feribot yolculuklarıyla Çanakkale; hem derin bir hüzün ve vefa hem de diri bir umut şehridir.",
      "literary_quotes": [
        "\"Vurulup tertemiz alnından, uzanmış yatıyor, / Bir hilâl uğruna, yâ Rab, ne güneşler batıyor!\" — Mehmet Akif Ersoy",
        "\"Çanakkale, bir milletin küllerinden doğuşunun ve 'insanlık onuru'nun taşa değil, göğe yazıldığı yerdir.\" — Tarih ve Tefekkür Notları",
        "\"Gelibolu ve Çanakkale boğazı, cihan denizlerinin kilidi ve gazi yiğitlerin karargâhıdır.\" — Evliya Çelebi"
      ],
      "spiritual_figures": [
        "**57. Alay Şehitleri & Gazi Mustafa Kemal Atatürk:** Conkbayırı, Arıburnu ve Anafartalar'da \"Ben size taarruzu emretmiyorum, ölmeyi emrediyorum!\" kararlılığıyla vatanın istikbalini koruyan kahramanlar.",
        "**Yahya Çavuş & Koca Seyit:** Ertuğrul Koyu'nda ve Rumeli Mecidiye Tabyası'nda imkânsızı aşan iman ve cesaretin sembol isimleri.",
        "**Yazıcızade Mehmed & Ahmed Bican Efendiler:** Gelibolu'da 15. yüzyılda kaleme aldıkları *Muhammediye* ve *Envarü'l-Aşıkîn* eserleriyle asırlarca Anadolu'nun manevi dünyasını besleyen gönül ve kalem erleri.",
        "**Piri Reis:** Gelibolu'da yetişip dünya haritasını ve *Kitab-ı Bahriye*'yi kaleme alan büyük Osmanlı amirali ve deniz bilimcisi.",
        "**Mehmet Akif Ersoy:** \"Şüheda fışkıracak toprağı sıksan, şüheda!\" mısralarıyla Çanakkale şehitlerine ebedî bir abide diken İstiklal Şairimiz."
      ],
      "five_day_plan": [
        "**1. Gün — Boğazın İki Kilidi (Merkez & Kilitbahir):** Mehmet Akif Ersoy İl Halk Kütüphanesi mesaisi sonrası Çimenlik Kalesi, Nusret Mayın Gemisi, Tarihi Aynalı Çarşı ve feribotla Kilitbahir Kalesi ziyareti.",
        "**2. Gün — Şüheda İzinde Tefekkür (Gelibolu Yarımadası):** Şehitler Abidesi, 57. Alay Şehitliği, Conkbayırı, Seyit Onbaşı Anıtı ve Yahya Çavuş Şehitliği boyunca sessiz, vefa dolu tam gün yürüyüş.",
        "**3. Gün — Beş Bin Yıllık Hafıza (Truva & Troya Müzesi):** UNESCO Dünya Mirası Truva Antik Kenti ve çağdaş müzeciliğin ödüllü örneği Troya Müzesi'nde Anadolu arkeolojisi yolculuğu.",
        "**4. Gün — Felsefenin ve Taşın Kıyısı (Assos / Behramkale):** Athena Tapınağı, Behramkale'nin taş sokakları, Hüdavendigar Camii ve Antik Liman'da Midilli'ye karşı gün batımı.",
        "**5. Gün — Rüzgarın Adası (Bozcaada veya Gökçeada):** Sabah feribotuyla adaya geçiş, tarihi kale, rüzgar gülleri, taş sokaklarda okuma molası ve Çanakkale seferinin peynir helvası eşliğinde uğurlanması."
      ]
    },
    "01_Marmara/Edirne": {
      "plate": 22,
      "name": "Edirne",
      "region": "Marmara",
      "region_code": "01_Marmara",
      "lat": 41.6772,
      "lng": 26.5557,
      "landmarks": [
        "Selimiye Camii",
        "II. Bayezid Külliyesi Sağlık Müzesi",
        "Meriç Köprüsü",
        "Eski Cami"
      ],
      "specialties": [
        "Edirne Tava Ciğeri",
        "Badem Ezmesi",
        "Kavala Kurabiyesi"
      ],
      "quote": "Mimar Sinan'ın 'Ustalık eserim' dediği Selimiye ile taçlanmış, Osmanlı'nın Avrupa kapısı payitaht.",
      "library": "Edirne İl Halk Kütüphanesi - Tarihi dokusu içinde sükunet dolu araştırma alanı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "01_Marmara/Edirne/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "01_Marmara/Edirne/gallery.jpg",
      "images": [
        "01_Marmara/Edirne/banner.jpg",
        "01_Marmara/Edirne/gallery.jpg"
      ],
      "readme_rel": "01_Marmara/Edirne/README.md",
      "slug": "Edirne",
      "content_size": 5062,
      "custom_quote": "Mimar Sinan'ın 'Ustalık eserim' dediği Selimiye ile taçlanmış, Osmanlı'nın Avrupa kapısı payitaht.",
      "history": "Meriç, Tunca ve Arda nehirlerinin kucaklaştığı bereketli Trakya ovasında kurulu olan Edirne, Roma İmparatoru Hadrianus'un \"Hadrianopolis\" adıyla ihya ettiği ve 1361'deki fethinden İstanbul'un fethine dek yaklaşık bir asır boyunca Osmanlı Devleti'ne başkentlik yapmış müstesna bir payitahttır. Fatih Sultan Mehmed'in doğduğu, İstanbul'un fethi için dev şahi toplarının döküldüğü ve imparatorluğun Rumeli ufkunun çizildiği bu şehir, mimari şaheserleriyle adeta açık hava bir külliye gibidir. Selimiye Camii'nin göğe yükselen dört zarif minaresi, Üç Şerefeli Cami'nin yenilikçi revakları, Eski Cami'nin dev hat yazıları ve Tunca kıyısındaki II. Bayezid Darüşşifası; Edirne'yi estetik, şifa ve medeniyetin zirvesine yerleştirir.",
      "literary_quotes": [
        "\"Bütün ömrümde yaptığım camiler içinde ustalık eserim Selimiye'dir.\" — Mimar Sinan",
        "\"Edirne, Rumeli'nin gül bahçesi, sultanların otağı ve su köprülerinin şehridir.\" — Evliya Çelebi",
        "\"Edirne'de Meriç'in sularına vuran ikindi güneşi, Osmanlı'nın en vakur hatırasını bugüne taşır.\" — Ahmet Hamdi Tanpınar izleğinden"
      ],
      "spiritual_figures": [
        "**Mimar Sinan:** 80 yaşını aşmışken \"Ustalık eserim\" diyerek inşa ettiği Selimiye Camii ile dünya mimarlık tarihine tek kubbeli mekanın en kusursuz zirvesini armağan etmiştir.",
        "**Fatih Sultan Mehmed Han:** Edirne Sarayı'nda dünyaya gelen, burada ilim ve devlet terbiyesiyle yetişip İstanbul fethinin stratejisini kuran büyük hükümdar.",
        "**Sultan II. Bayezid:** Tunca Nehri kıyısında kurduğu külliye ve darüşşifada ruh hastalıklarını su sesi, musiki ve güzel kokuyla tedavi ettirerek çağının çok ötesinde bir şifa medeniyeti inşa etmiştir.",
        "**Hasan Sezaî Hazretleri:** Gülşenî tarikatının önde gelen mürşidi ve divan şairi; Edirne'deki dergâhı asırlardır şehrin manevi iklimini besler.",
        "**Şükrü Paşa:** Balkan Savaşları sırasında Edirne'yi destansı bir direnişle savunan kahraman kumandan."
      ],
      "five_day_plan": [
        "**1. Gün — Üç Büyük Cami ve Payitaht Meydanı:** Kütüphane mesaisi sonrası UNESCO Dünya Mirası Selimiye Camii, dev hat levhalarıyla Eski Cami, Üç Şerefeli Cami ve Arasta Çarşısı gezisi.",
        "**2. Gün — Şifa ve Musiki Medeniyeti (Tunca Kıyısı):** Sultan II. Bayezid Külliyesi ve Avrupa Ödüllü Sağlık Müzesi, Tunca Köprüsü, Sarayiçi (Kırkpınar Er Meydanı) ve Adalet Kasrı ziyareti.",
        "**3. Gün — Meriç'in Ötesi (Karaağaç & Lozan Anıtı):** Tarihi Meriç Köprüsü'nden yürüyerek Karaağaç'a geçiş, eski Tren Garı (Trakya Üniversitesi yerleşkesi), Lozan Anıtı ve asırlık ağaçların altında çay molası.",
        "**4. Gün — Kaleiçi, Çarşılar ve Müdafaa Hatırası:** Ali Paşa Çarşısı, Rüstem Paşa Kervansarayı, Kaleiçi tarihi ahşap konakları, Büyük Sinagog ve Şükrü Paşa Anıtı (Balkan Savaşı Müzesi).",
        "**5. Gün — Trakya'nın Kıyısına Uzanan Veda (Enez veya Uzunköprü):** Dünyanın en uzun taş köprüsü olan tarihi Uzunköprü'yü veya Saros Körfezi kıyısındaki antik Enez'i ziyaret ederek Edirne seferini tamamlama."
      ]
    },
    "01_Marmara/Istanbul": {
      "plate": 34,
      "name": "İstanbul",
      "region": "Marmara",
      "region_code": "01_Marmara",
      "lat": 41.0082,
      "lng": 28.9784,
      "landmarks": [
        "Ayasofya-i Kebir",
        "Süleymaniye Camii",
        "Topkapı Sarayı",
        "Eyüp Sultan",
        "Galata Kulesi"
      ],
      "specialties": [
        "Sultanahmet Köftesi",
        "Balık Ekmek",
        "Boza",
        "Kanlıca Yoğurdu"
      ],
      "quote": "İki kıtanın secdesi, çağ açıp çağ kapatan ulu fethin emaneti ve medeniyetler başkenti.",
      "library": "Şemsipaşa İlçe Halk Kütüphanesi (Üsküdar) / Rami Kütüphanesi - Denize sıfır konumu ve asırlık atmosferiyle eşsiz bir çalışma sığınağı.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "01_Marmara/Istanbul/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "01_Marmara/Istanbul/gallery.jpg",
      "images": [
        "01_Marmara/Istanbul/banner.jpg",
        "01_Marmara/Istanbul/gallery.jpg"
      ],
      "readme_rel": "01_Marmara/Istanbul/README.md",
      "slug": "Istanbul",
      "content_size": 5734,
      "custom_quote": "Yedi tepenin üstünde yükselen camileriyle, iki kıtayı birbirine bağlayan boğazıyla dünya tarihinin kalbidir.",
      "custom_library": "Istanbul İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Roma, Bizans ve Osmanlı İmparatorluklarına başkentlik yapmış olan İstanbul, insanlık tarihinin en görkemli sahnesidir. Her caddesi, her taşı bir medeniyet vesikasıdır.",
      "literary_quotes": [
        "\"Eğer dünya tek bir devlet olsaydı, başkenti İstanbul olurdu.\" — Napolyon Bonapart",
        "\"İstanbul bir şâhâne şikâr yeridir ki, cihan mülkünde benzeri yoktur.\" — Evliya Çelebi",
        "\"Sana dün bir tepeden baktım aziz İstanbul! Görmedim gezmediğim, sevmediğim hiçbir yer.\" — Yahya Kemal Beyatlı",
        "\"İstanbul, Doğu ile Batı'nın, madde ile mananın nihai vuslat noktasıdır.\" — Cemil Meriç"
      ],
      "reflection": "Ayasofya ve Süleymaniye'nin kubbeleri altında, ilahi aşkın ve mimari dehanın harmanlanışını tefekkür edersiniz. Boğazın sularında iki kıtanın kucaklaşmasını izlerken, birliğin ve çokluğun sırrına erersiniz.",
      "spiritual_figures": [
        "**Ebu Eyyûb el-Ensarî (Eyüp Sultan):** Hz. Peygamber'in (s.a.v.) mihmandarı ve İstanbul'un asırlardır süren manevi muhafızı; Haliç kıyısındaki türbesi şehrin kalp atışıdır.",
        "**Fatih Sultan Mehmed Han:** 1453'te çağ açıp çağ kapatan, ilmi ve sanatı şehrin merkezine yerleştiren büyük cihangir ve banî.",
        "**Mimar Sinan:** Süleymaniye, Şehzadebaşı, Mihrimah Sultan ve Rüstem Paşa camileriyle İstanbul'un yedi tepesini taşla yazılmış bir senfoniye dönüştüren başmimar.",
        "**Aziz Mahmud Hüdayî:** Üsküdar sırtlarından Boğaz'ı selamlayan, \"Sağlığımızda bizi, vefatımızdan sonra kabrimizi ziyaret edenler denizde boğulmasın\" duasıyla gönüllerde yer eden büyük mürşid.",
        "**Merkez Efendi & Yahya Efendi:** Topkapı surları dışında ve Beşiktaş sırtlarında ilim, şifa ve gönül terbiyesi ocakları kuran İstanbul'un manevi direkleri.",
        "**Yahya Kemal Beyatlı & Ahmet Hamdi Tanpınar:** Aziz İstanbul'un semtlerini, Boğaziçi medeniyetini ve zaman estetiğini Türk edebiyatının zirvesine taşıyan fikir ve kalem ustaları."
      ],
      "five_day_plan": [
        "**1. Gün — Suriçi'nin Kalbi (Tarihi Yarımada):** Sabah kütüphane çalışmasının ardından Ayasofya-i Kebir Cami-i Şerifi, Sultanahmet Meydanı, Yerebatan Sarnıcı ve Topkapı Sarayı avlularında asırlar arası yürüyüş.",
        "**2. Gün — İlim, Ticaret ve Yedi Tepe:** Süleymaniye Külliyesi'nin Haliç'e bakan avlusunda tefekkür, Mimar Sinan'ın türbesine ziyaret, Beyazıt Sahaflar Çarşısı, Kapalıçarşı ve Mısır Çarşısı üzerinden Eminönü iskelesine iniş.",
        "**3. Gün — Haliç'in Maneviyatı ve Galata:** Sabah Eyüp Sultan Camii ve Türbesi ziyareti, Pierre Loti Tepesi'nden Altın Boynuz seyri; öğleden sonra Fener-Balat sokakları, Karaköy ve Galata Kulesi çevresinde akşam yürüyüşü.",
        "**4. Gün — Anadolu Yakası'nın Sükuneti (Üsküdar & Kuzguncuk):** Vapur eşliğinde Üsküdar'a geçiş, Şemsipaşa Kütüphanesi'nde deniz kenarında okuma mesaisi, Mihrimah Sultan ve Aziz Mahmud Hüdayî ziyaretleri, Kuzguncuk sokakları ve Kız Kulesi karşısında gün batımı.",
        "**5. Gün — Boğaziçi ve Veda:** Ortaköy, Beşiktaş Yahya Efendi Dergâhı, Emirgan Korusu ve Rumeli Hisarı hattında Boğaz'ın iki kıtayı birleştiren rüzgarıyla İstanbul defterini mühürleme."
      ]
    },
    "01_Marmara/Kirklareli": {
      "plate": 39,
      "name": "Kırklareli",
      "region": "Marmara",
      "region_code": "01_Marmara",
      "lat": 41.7355,
      "lng": 27.2244,
      "landmarks": [
        "İğneada Longoz Ormanları",
        "Dupnisa Mağarası",
        "Hızırbey Camii"
      ],
      "specialties": [
        "Kırklareli Köftesi",
        "Hardaliye",
        "Kaşar Peyniri"
      ],
      "quote": "Trakya'nın yeşil kalbi, Longoz Ormanları'nın büyüleyici biyoçeşitliliği ve huzurlu bozkırı.",
      "library": "Kırklareli İl Halk Kütüphanesi - Sakin ve odaklanmayı artıran kütüphane düzeni.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "01_Marmara/Kirklareli/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "01_Marmara/Kirklareli/gallery.jpg",
      "images": [
        "01_Marmara/Kirklareli/banner.jpg",
        "01_Marmara/Kirklareli/gallery.jpg"
      ],
      "readme_rel": "01_Marmara/Kirklareli/README.md",
      "slug": "Kirklareli",
      "content_size": 5135,
      "custom_quote": "Trakya'nın yeşil kalbi, Longoz Ormanları'nın büyüleyici biyoçeşitliliği ve huzurlu bozkırı.",
      "history": "Istranca (Yıldız) Dağları'nın gür kayın ve meşe ormanlarıyla Karadeniz'in hırçın kıyıları arasında uzanan Kırklareli, Trakya'nın hem en bakir doğasını hem de en derin kadim geçmişini barındırır. Aşağı Pınar ve Kanlıgeçit höyükleriyle Neolitik ve Tunç çağlarından bu yana kesintisiz yerleşime sahne olan bu topraklar, Trak kabilelerinin tümülüslerinden Bizans dönemi Vize surlarına ve 1363 sonrası Osmanlı'nın \"Kırk Kilise\" adıyla kurduğu vakıf şehrine uzanan çok katmanlı bir mirasa sahiptir. Avrupa'nın en büyük su basar ormanlarından biri olan İğneada Longoz Ormanları Milli Parkı, milyonlarca yıllık sarkıtlarıyla Dupnisa Mağarası ve sakin Trakya kasabalarıyla Kırklareli; kalabalıktan uzak, tefekkür ve tabiat dostu bir keşif durağıdır.",
      "literary_quotes": [
        "\"Kırklareli, bağları ve bahçeleri bol, havası hoş, suyu tatlı, gönlü geniş insanların yurdudur.\" — Evliya Çelebi",
        "\"Istranca ormanlarının derinliklerinde insan, zamanın hızını unutup tabiatın kendi musikisine kulak verir.\" — Trakya Seyahat Notları",
        "\"Lüleburgaz'daki Sokollu Külliyesi, Rumeli yolcularına hem bedenen hem ruhen nefes aldıran bir kervansaray şaheseridir.\" — Mimarlık Tarihi Kayıtları"
      ],
      "spiritual_figures": [
        "**Hızır Bey (Köpürlü / Hızırbey Külliyesi Banîsi):** 1383 yılında inşa ettirdiği Hızırbey Camii, hamamı ve arastasıyla Kırklareli'nin Osmanlı şehir kimliğinin temelini atan hayırsever devlet adamı.",
        "**Sokollu Mehmet Paşa & Mimar Sinan:** Lüleburgaz'da yükselen Sokollu Mehmet Paşa Külliyesi, Mimar Sinan'ın Trakya güzergâhındaki kervan yollarına vurduğu muhteşem mimari mühürdür.",
        "**Kırklar Şehitliği & Gazi Baba:** Şehre adını veren \"Kırklar\" rivayetinin hatırasını yaşatan ve Rumeli fetihlerinin manevi iklimini bugüne taşıyan ziyaret makamları.",
        "**Trakya'nın Kıyıköy ve Vize Kültürü:** Kaya manastırları, antik tiyatroları ve sakin kasaba yaşamıyla \"Cittaslow (Sakin Şehir)\" unvanını hak eden kadim yerleşim geleneği."
      ],
      "five_day_plan": [
        "**1. Gün — Kuruluşun İzleri (Merkez & Yayla Mahallesi):** Kütüphane mesaisi sonrası Hızırbey Camii ve Arastası, Kırklareli Müzesi, Aşağı Pınar Açık Hava Köy Müzesi ve tarihi Yayla Mahallesi konaklarında yürüyüş.",
        "**2. Gün — Su Basar Ormanların Büyüsü (İğneada Longoz Ormanları):** Mert Gölü'nde kano veya yürüyüş, Erikli Gölü, Limanköy Feneri ve Karadeniz kıyısında sakin bir tabiat günü.",
        "**3. Gün — Yeraltının Sarayı (Dupnisa Mağarası & Demirköy):** Trakya'nın turizme açık tek mağarası Dupnisa Mağarası ve Fatih Sultan Mehmed'in İstanbul fethi için top gülleleri döktürdüğü tarihi Demirköy Fatih Dökümhanesi ziyareti.",
        "**4. Gün — Sakin Şehir ve Kıyılar (Vize & Kıyıköy):** Cittaslow Vize'de Antik Tiyatro ve Gazi Süleyman Paşa Camii (Küçük Ayasofya); ardından Kıyıköy Aya Nikola Kaya Manastırı ve Pabuçdere kıyısında dinlenme.",
        "**5. Gün — Mimar Sinan'ın Rumeli Mührü (Lüleburgaz):** Lüleburgaz'da Sokollu Mehmet Paşa Külliyesi ve Taş Köprü ziyareti, hardaliye eşliğinde not derleme ve veda."
      ]
    },
    "01_Marmara/Kocaeli": {
      "plate": 41,
      "name": "Kocaeli",
      "region": "Marmara",
      "region_code": "01_Marmara",
      "lat": 40.7654,
      "lng": 29.9408,
      "landmarks": [
        "Saat Kulesi",
        "Sekapark",
        "Kandıra Kerpe Kayalıkları",
        "Gayret Gemi Müzesi"
      ],
      "specialties": [
        "Pişmaniye",
        "Kandıra Yoğurdu",
        "Dartı"
      ],
      "quote": "Körfezin sanayi ve lojistik damarı, Samanlı Dağları'nın yeşiliyle kucaklaşan kıyı kenti.",
      "library": "Kocaeli İl Halk Kütüphanesi - Modern iç tasarımı ve güçlü internet altyapısıyla kodlama mesaileri için son derece konforlu.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "01_Marmara/Kocaeli/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "01_Marmara/Kocaeli/gallery.jpg",
      "images": [
        "01_Marmara/Kocaeli/banner.jpg",
        "01_Marmara/Kocaeli/gallery.jpg"
      ],
      "readme_rel": "01_Marmara/Kocaeli/README.md",
      "slug": "Kocaeli",
      "content_size": 5190,
      "custom_quote": "Sanayinin gri çehresinin arkasında, asırlık çınarların ve körfezin mavi sularının fısıldadığı kadim bir tarih saklıdır.",
      "custom_library": "Kocaeli İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Antik dönemde Bithynia Krallığı'na başkentlik yapmış olan Nicomedia (Kocaeli), Osmanlı döneminde de payitahtın en önemli kapılarından biri olmuştur. Sanayi şehri kimliğinin gerisinde derin bir kültür barındırır.",
      "literary_quotes": [
        "\"Nicomedia, Roma'nın doğudaki en parlak tacı, asırların yorulmaz limanıdır.\" — Libanius",
        "\"Kocaeli, payitahtın bağ ve bahçe kapısı, körfezin sükunet bulduğu konaktır.\" — Evliya Çelebi"
      ],
      "reflection": "Körfezin dalgalarında, zamanın akışını ve emeğin kutsallığını tefekkür edersiniz. Tarihi saat kulesinin gölgesinde, geçip giden anların ebediyetle olan bağını idrak edersiniz.",
      "spiritual_figures": [
        "**Akçakoca Bey:** Osman Gazi ve Orhan Gazi döneminin alp gazisi, İzmit ve çevresini fethederek bölgeye \"Koca-ili\" adını kazandıran kurucu komutan.",
        "**Orhan Gazi & Süleyman Paşa:** İzmit'in fethinin ardından kılıç hakkı olarak camiye çevrilen Orhan Camii ile bölgede Osmanlı şehir kültürünü başlatan banîler.",
        "**Pertev Mehmet Paşa (Yeni Cuma Camii Banîsi):** Mimar Sinan'ın İzmit'e armağan ettiği zarif külliyenin hamisi ve Osmanlı devlet adamı.",
        "**Osman Hamdi Bey:** Türk müzeciliğinin ve çağdaş Türk resminin öncüsü; Eskihisar'daki köşkü bugün hâlâ sanat ve kültürün izlerini taşır.",
        "**Hannibal Barca:** Antik çağın efsanevi Kartacalı komutanı; ömrünün son yıllarını Gebze (Libyssa) topraklarında geçirmiş ve bölgenin kadim tarihine iz bırakmıştır."
      ],
      "five_day_plan": [
        "**1. Gün — Nicomedia'dan İzmit'e (Tarihi Merkez):** Sabah kütüphane mesaisi sonrası Kocaeli Saat Kulesi, Sultan Abdülaziz'in mirası Kasr-ı Hümayun, Orhan Camii ve Mimar Sinan eseri Pertev Mehmet Paşa (Yeni Cuma) Camii gezisi.",
        "**2. Gün — Körfez Kıyısı ve Denizcilik Mirası:** SEKA Kağıt Müzesi, Sekapark sahil yürüyüşü ve TCG Gayret Gemi Müzesi ziyareti; akşamüstü körfez gün batımında tefekkür.",
        "**3. Gün — Doğa ve Yayla Nefesi (Maşukiye & Kartepe):** Samanlı Dağları'nın eteklerindeki Maşukiye şelaleleri, Ormanya Doğal Yaşam Parkı ve Kartepe sırtlarından Sapanca ile İzmit Körfezi'nin çift manzaralı seyri.",
        "**4. Gün — Tarih ve Sanatın Batı Kapısı (Gebze & Eskihisar):** Fatih Sultan Mehmed'in son sefer menzili Hünkâr Çayırı, Eskihisar Kalesi, Osman Hamdi Bey Evi ve Müzesi ile Çoban Mustafa Paşa Külliyesi ziyareti.",
        "**5. Gün — Karadeniz'e Açılan Kıyı (Kandıra & Kerpe):** Son gün Kandıra üzerinden Karadeniz kıyısındaki Kerpe Kartal Kayalıkları ve Kefken Pembe Kayalar'da rüzgar eşliğinde veda yürüyüşü."
      ]
    },
    "01_Marmara/Sakarya": {
      "plate": 54,
      "name": "Sakarya",
      "region": "Marmara",
      "region_code": "01_Marmara",
      "lat": 40.7731,
      "lng": 30.4026,
      "landmarks": [
        "Sapanca Gölü",
        "Justinianus Köprüsü (Beşköprü)",
        "Acarlar Longozu",
        "Taraklı Evleri"
      ],
      "specialties": [
        "Islama Köfte",
        "Kabak Tatlısı",
        "Uğut Tatlısı"
      ],
      "quote": "Sakarya Türküsü'nün döküldüğü ırmak, bereketli ovaları ve kadim Osmanlı kasabalarıyla köklü bir durak.",
      "library": "Sakarya İl Halk Kütüphanesi - Geniş çalışma masaları ve ferah ortamıyla verimli çalışma imkanı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "01_Marmara/Sakarya/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "01_Marmara/Sakarya/gallery.jpg",
      "images": [
        "01_Marmara/Sakarya/banner.jpg",
        "01_Marmara/Sakarya/gallery.jpg"
      ],
      "readme_rel": "01_Marmara/Sakarya/README.md",
      "slug": "Sakarya",
      "content_size": 5266,
      "custom_quote": "Sakarya Türküsü'nün döküldüğü ırmak, bereketli ovaları ve kadim Osmanlı kasabalarıyla köklü bir durak.",
      "history": "Anadolu'yu boydan boya kat ederek Karadeniz'e dökülen kadim Sakarya Nehri'nin (Sangarios) hayat verdiği bu bereketli coğrafya, tarih boyunca Doğu ile Batı arasındaki ana geçiş koridorunun kilit noktası olmuştur. 6. yüzyılda Doğu Roma İmparatoru I. Justinianus tarafından yaptırılan ve bugün hâlâ ayakta duran görkemli Justinianus Köprüsü (Beşköprü), şehrin bin beş yüz yıllık mühendislik mirasına tanıklık eder. Osmanlı'nın kuruluş yıllarında Konuralp ve Samsa Çavuş gibi alp gazilerle Türk yurdu hâline gelen Sakarya; bir yanında dingin Sapanca Gölü, kuzeyinde Türkiye'nin en büyük tek parça su basar ormanı Acarlar Longozu, güneyinde ise yedi asırlık ahşap evleriyle Sakin Şehir Taraklı'yı barındırır. Kafkasya'dan Balkanlar'a, Karadeniz'den Anadolu'ya farklı kültürlerin kardeşçe harmanlandığı bu şehir, bereketin ve vefanın canlı bir mozaiğidir.",
      "literary_quotes": [
        "\"İnsan bu, su misali, kıvrım kıvrım akar ya; / Bir yanda akan benim, öbür yanda Sakarya.\" — Necip Fazıl Kısakürek",
        "\"Bir insanı sevmekle başlar her şey.\" — Sait Faik Abasıyanık (Adapazarı doğumlu büyük öykücü)",
        "\"Taraklı'nın ahşap cumbalı sokaklarında yürürken, Osmanlı'nın ilk asırlarındaki huzur ve kanaat iklimi hâlâ nefes alır.\" — Anadolu Kültür Notları"
      ],
      "spiritual_figures": [
        "**Orhan Gazi & Konuralp Bey:** Adapazarı ve Akyazı havzasını Osmanlı sancağı altına alarak bölgedeki ilk cami ve vakıf geleneğini başlatan kurucu gaziler.",
        "**Şeyh Muslihiddin (Büyük Esence) & Taraklı İrfanı:** Bölgede 14. yüzyıldan bu yana ayakta kalan çivisiz ahşap cami geleneği ve Taraklı'daki Yunus Paşa Camii (1517) ile Anadolu'nun zarif vakıf kültürü.",
        "**Sait Faik Abasıyanık:** Adapazarı doğumlu büyük hikâyeci; sıradan insanın kalbine ve tabiatın inceliklerine açılan duru Türkçesiyle edebiyatımızın unutulmaz ismidir.",
        "**Necip Fazıl Kısakürek (Sakarya Türküsü):** \"İnsan bu, su misali, kıvrım kıvrım akar ya; / Bir yanda akan benim, öbür yanda Sakarya.\" dizeleriyle bu ırmağı bir milletin tarihî şuurunun sembolü hâline getirmiştir."
      ],
      "five_day_plan": [
        "**1. Gün — Irmağın Hafızası (Adapazarı & Beşköprü):** Kütüphane mesaisi sonrası UNESCO Geçici Miras Listesi'ndeki Justinianus Köprüsü (Beşköprü), Sakarya Müzesi, Orhan Camii ve akşam meşhur Islama Köfte tadımı.",
        "**2. Gün — Gölün Sükuneti (Sapanca & Kırkpınar):** Sapanca Gölü sahil şeridi, Vecihi Kapısı, Rüstem Paşa Camii, Kırkpınar bahçeleri ve Maşukiye sınırındaki yaylalarda doğa yürüyüşü.",
        "**3. Gün — Su Basar Orman ve Karadeniz (Karasu & Acarlar Longozu):** Türkiye'nin en büyük tek parça longozu Acarlar Longozu'nda ahşap yürüyüş yolları ve nilüfer gözlemi; ardından Maden Deresi Şelalesi ve Karasu sahili.",
        "**4. Gün — Zamanın Durduğu Osmanlı Kasabası (Taraklı & Geyve):** Cittaslow Taraklı'nın üç asırlık ahşap konakları, Yunus Paşa Camii (Kurşunlu Cami), tarihi hamam ve Geyve Boğazı'ndan dönüş.",
        "**5. Gün — Doğal Miras ve Şifa (Poyrazlar Gölü & Kuzuluk):** Poyrazlar Gölü Tabiat Parkı'nda sabah okuma molası, Akyazı-Kuzuluk kaplıca bölgesi veya Pamukova bağlarında veda yürüyüşü."
      ]
    },
    "01_Marmara/Tekirdag": {
      "plate": 59,
      "name": "Tekirdağ",
      "region": "Marmara",
      "region_code": "01_Marmara",
      "lat": 40.9781,
      "lng": 27.5117,
      "landmarks": [
        "Namık Kemal Evi",
        "Rákóczi Müzesi",
        "Rüstem Paşa Camii",
        "Uçmakdere"
      ],
      "specialties": [
        "Tekirdağ Köftesi",
        "Hayrabolu Tatlısı",
        "Peynir Helvası"
      ],
      "quote": "Marmara'nın rüzgarlı kıyısı, vatan şairi Namık Kemal'in yurdu ve yamaç paraşütünün gözdesi.",
      "library": "Tekirdağ Namık Kemal İl Halk Kütüphanesi - Huzurlu deniz havası eşliğinde çalışma olanağı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "01_Marmara/Tekirdag/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "01_Marmara/Tekirdag/gallery.jpg",
      "images": [
        "01_Marmara/Tekirdag/banner.jpg",
        "01_Marmara/Tekirdag/gallery.jpg"
      ],
      "readme_rel": "01_Marmara/Tekirdag/README.md",
      "slug": "Tekirdag",
      "content_size": 5025,
      "custom_quote": "Marmara'nın rüzgarlı kıyısı, vatan şairi Namık Kemal'in yurdu ve yamaç paraşütünün gözdesi.",
      "history": "Marmara Denizi'nin kuzey kıyısında, Ganos (Işıklar) Dağları'nın denizle kucaklaştığı bereketli yamaçlarda uzanan Tekirdağ; antik çağda \"Bisanthe\" ve \"Rhaedestus\", Osmanlı döneminde ise \"Rodoscuk\" adıyla önemli bir liman ve tahıl ambarı olarak parlamıştır. 16. yüzyılda Mimar Sinan'ın inşa ettiği Rüstem Paşa Külliyesi ile estetik bir merkez kimliği kazanan şehir, 18. yüzyılda Macar özgürlük kahramanı II. Ferenc Rákóczi'ye kucak açarak Türk misafirperverliğinin Avrupa tarihine geçen en zarif örneklerinden birini sergilemiştir. Vatan ve hürriyet kavramlarını Türk edebiyatının merkezine yerleştiren Namık Kemal'in doğduğu bu rüzgarlı kıyı kenti; bugün uçsuz bucaksız ayçiçeği tarlaları, Şarköy bağları ve Uçmakdere'nin nefes kesen yamaçlarıyla gezginlere hem tarih hem ferahlık vadeder.",
      "literary_quotes": [
        "\"Vatanın bağrına düşman dayamış hançerini; / Yoğimiş kurtaracak bahtı kara mâderini.\" — Namık Kemal",
        "\"Tekirdağ, denize nazır geniş meydanları, bağları ve temiz havasıyla Rumeli kıyısının ferahlık veren limanıdır.\" — Evliya Çelebi",
        "\"Ganos yamaçlarından Marmara'ya bakarken rüzgar, insana hem hürriyetin hem de sükunetin dilini fısıldar.\" — Marmara Seyir Defteri"
      ],
      "spiritual_figures": [
        "**Namık Kemal (Vatan Şairi):** 1840'ta Tekirdağ'da doğan, *Vatan yahut Silistre* eseri ve hürriyet kasidesiyle nesillere vatan sevgisini aşılayan büyük edip ve mütefekkir; adına kurulan müze ev şehrin kültür kalbidir.",
        "**Mimar Sinan & Rüstem Paşa:** 1553 tarihli Rüstem Paşa Camii ve Külliyesi, Tekirdağ'ın silüetine klasik Osmanlı mimarisinin dingin zarafetini nakşetmiştir.",
        "**II. Ferenc Rákóczi:** Osmanlı'ya sığınarak ömrünün son 15 yılını Tekirdağ'da geçiren Macar prensi; bugün Rákóczi Müzesi olarak korunan konağı Türk-Macar dostluğunun yaşayan anıtıdır.",
        "**Yahya Kemal & Trakya Kültür Köprüsü:** Bölgenin Balkanlar'dan Anadolu'ya uzanan zengin türkü, göç ve edebiyat mirası."
      ],
      "five_day_plan": [
        "**1. Gün — Hürriyet ve Tarih Merkezi (Süleymanpaşa):** Kütüphane mesaisi sonrası Namık Kemal Evi, Rákóczi Müzesi, Mimar Sinan eseri Rüstem Paşa Camii ve Tekirdağ Arkeoloji ve Etnografya Müzesi ziyareti.",
        "**2. Gün — Gökyüzü ile Denizin Kesişimi (Uçmakdere & Ganos Dağları):** Nişantepe'den yamaç paraşütü manzaralarını ve Marmara Adası ufkunu seyir, asırlık çınarlar altındaki Uçmakdere köyünde çay ve okuma molası.",
        "**3. Gün — Kıyı ve Bağlar Rotası (Şarköy & Hoşköy):** Hora Feneri, Gaziköy ve Şarköy'ün uzun sahil şeridinde Marmara rüzgarı eşliğinde bisiklet veya yürüyüş.",
        "**4. Gün — Antik Liman ve Kıyı Sükuneti (Marmaraereğlisi / Perinthos):** Antik Perinthos kalıntıları, sahil kayalıkları ve dönüşte merkezde meşhur Tekirdağ köftesi ile Hayrabolu tatlısı ziyafeti.",
        "**5. Gün — Ayçiçeği Ovaları ve Veda (Hayrabolu & Malkara Hattı):** İç Trakya'nın geniş ovalarında son bir kültür turu, sahilde gün batımı eşliğinde Tekirdağ sefer notlarının derlenmesi."
      ]
    },
    "01_Marmara/Yalova": {
      "plate": 77,
      "name": "Yalova",
      "region": "Marmara",
      "region_code": "01_Marmara",
      "lat": 40.6549,
      "lng": 29.2842,
      "landmarks": [
        "Yürüyen Köşk",
        "Termal Kaplıcaları",
        "Sudüşen Şelalesi",
        "Karaca Arboretumu"
      ],
      "specialties": [
        "Yalova Köftesi",
        "Termal Tatlısı",
        "Kivi"
      ],
      "quote": "Yeşilin her tonunu saklayan şifalı sular diyarı ve çevrecilik sembolü Yürüyen Köşk'ün yurdu.",
      "library": "Yalova İl Halk Kütüphanesi - Şehir merkezinde butik, sakin ve odaklanmaya uygun bir mekan.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "01_Marmara/Yalova/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "01_Marmara/Yalova/gallery.jpg",
      "images": [
        "01_Marmara/Yalova/banner.jpg",
        "01_Marmara/Yalova/gallery.jpg"
      ],
      "readme_rel": "01_Marmara/Yalova/README.md",
      "slug": "Yalova",
      "content_size": 5215,
      "custom_quote": "Yeşilin her tonunu saklayan şifalı sular diyarı ve çevrecilik sembolü Yürüyen Köşk'ün yurdu.",
      "history": "Samanlı Dağları'nın gür ormanları ile Marmara Denizi'nin dingin kıyısı arasına zarifçe yerleşmiş olan Yalova, yüzölçümü bakımından Türkiye'nin en küçük ili olmasına rağmen tabiat zenginliği ve şifa tarihi açısından bir kıta kadar cömerttir. Antik çağda \"Pythia Therma\" adıyla şifalı sıcak sularıyla ün salan Termal havzası, Roma ve Bizans imparatorlarından Osmanlı padişahlarına kadar asırlar boyunca şifa arayanların uğrak noktası olmuştur. Cumhuriyet döneminde Gazi Mustafa Kemal Atatürk'ün \"Yalova benim kentimdir\" sözüyle özel bir değer verdiği şehir, 1930 yılında bir çınar ağacının tek bir dalı bile kesilmesin diye raylar üzerinde kaydırılan Yürüyen Köşk ile tüm dünyaya emsalsiz bir tabiat sevgisi ve çevre bilinci dersi vermiştir. Canlı ağaç müzesi Karaca Arboretumu, çağlayan Sudüşen Şelalesi ve serin Erikli Yaylası ile Yalova, metropollerin hemen yanı başında bir nefeslenme ve tefekkür vahasıdır.",
      "literary_quotes": [
        "\"Yalova benim kentimdir.\" — Gazi Mustafa Kemal Atatürk",
        "\"Bir çınar dalının hatırına koca bir köşkün yerinden yürütülmesi, insanoğlunun tabiata gösterebileceği en zarif vefadır.\" — Yürüyen Köşk Anı Defteri",
        "\"Termal vadisinde buharı tüten şifalı sular ve asırlık ağaçlar, yorgun yolcunun hem bedenine hem ruhuna dinginlik bağışlar.\" — Marmara Gezi Notları"
      ],
      "spiritual_figures": [
        "**Gazi Mustafa Kemal Atatürk & Yürüyen Köşk Hatırası:** \"Ağaç kesilmeyecek, bina kaydırılacak!\" talimatıyla doğaya saygının ebedî sembolü hâline gelen Yürüyen Köşk ve Termal Atatürk Köşkü'nün mirası.",
        "**Kara Kilise (Hersekzade Ahmed Paşa Külliyesi):** Altınova Hersek köyünde, II. Bayezid dönemi sadrazamlarından Hersekzade Ahmed Paşa'nın 1511'de yaptırdığı külliye; Anadolu'dan İstanbul'a uzanan hac ve kervan yolunun önemli bir menzilidir.",
        "**Hayrettin Karaca (Toprak Dede):** TEMA Vakfı'nın kurucusu ve Türkiye'nin ilk özel arboretumu olan Karaca Arboretumu'nun mimarı; Yalova topraklarında binlerce bitki türünü geleceğe emanet etmiştir.",
        "**Elmalık & Termal Şifa Geleneği:** Sultan Abdülmecid'in annesi Bezmiâlem Valide Sultan'ın şifa bulduğu ve ihya ettirdiği tarihi Valide Banyosu'nun asırlık vakıf kültürü."
      ],
      "five_day_plan": [
        "**1. Gün — Çınarın Gölgesinde Vefa (Merkez & Yürüyen Köşk):** Kütüphane mesaisi sonrası Yürüyen Köşk ziyareti, ulu çınarın gölgesinde çay ve tefekkür, Yalova Kent Müzesi ve sahil yürüyüşü.",
        "**2. Gün — Şifalı Sular Vadisi (Termal & Gökçedere):** Tarihi Termal Kaplıcaları, Kurşunlu Hamam, Valide Banyosu, Atatürk Köşkü ve rengârenk botanik yürüyüş parkurlarında huzurlu bir gün.",
        "**3. Gün — Canlı Ağaç Müzesi ve Çağlayanlar (Karaca Arboretumu & Sudüşen):** Hayrettin Karaca'nın mirası Karaca Arboretumu'nda dünya florasını keşif; ardından Üvezpınar üzerinden Sudüşen Şelalesi'ne doğa yürüyüşü.",
        "**4. Gün — Yayla Serinliği (Çınarcık, Teşvikiye & Erikli Yaylası):** Delmece Yaylası, Erikli Çifte Şelaleler ve Teşvikiye Kent Ormanı'nda çam kokulu patikalarda yürüyüş ve kamp ruhu.",
        "**5. Gün — Tarihî Menzil ve Veda (Altınova & Hersek):** Hersekzade Ahmed Paşa Camii ve Hersek Lagünü Kuş Gözlem Alanı ziyareti; feribot iskelesinde Marmara'ya karşı Yalova notlarını tamamlama."
      ]
    },
    "02_Ege/Afyonkarahisar": {
      "plate": 3,
      "name": "Afyonkarahisar",
      "region": "Ege",
      "region_code": "02_Ege",
      "lat": 38.7569,
      "lng": 30.5387,
      "landmarks": [
        "Afyon Kalesi",
        "Mevlevi Camii ve Türbesi",
        "Frig Vadisi",
        "Ulu Cami"
      ],
      "specialties": [
        "Afyon Sucuğu",
        "Kaymaklı Ekmek Kadayıfı",
        "Bükme",
        "Haşhaşlı Çörek"
      ],
      "quote": "Karahisar Kalesi'nin heybeti, Mevleviliğin ikinci büyük ocağı ve Anadolu'nun kavşak noktası.",
      "library": "Afyonkarahisar Gedik Ahmet Paşa İl Halk Kütüphanesi - Tarihi dokuda sakin çalışma alanı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "02_Ege/Afyonkarahisar/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "02_Ege/Afyonkarahisar/gallery.jpg",
      "images": [
        "02_Ege/Afyonkarahisar/banner.jpg",
        "02_Ege/Afyonkarahisar/gallery.jpg"
      ],
      "readme_rel": "02_Ege/Afyonkarahisar/README.md",
      "slug": "Afyonkarahisar",
      "content_size": 5910,
      "history": "İç Ege'nin kapısı ve Anadolu'nun en stratejik yol kavşağı olan Afyonkarahisar; Hititlerden (Hapanuwa) Friglere, Romalılardan Bizans'a, Selçuklulardan Sahipataoğulları'na ve Osmanlı'ya uzanan beş bin yıllık bir medeniyet katmanına sahiptir. Volkanik bir kaya kütlesinin tepesine 226 metre yükseklikte kurulan Karahisar Kalesi, yüzyıllar boyunca hem kervan yollarını hem de şehrin hafızasını gözetlemiştir. Kırk ahşap direkli Selçuklu şaheseri Ulu Cami, Konya'dan sonra Mevleviliğin en önemli ikinci merkezi sayılan Mevlevihane (Türbe Camii), UNESCO Dünya Mirası Geçici Listesi'ndeki gizemli Frig Vadisi (Ayazini, Aslantaş, Yılantaş) ve 1922 Büyük Taarruz'un başlangıç noktası Kocatepe ile Afyonkarahisar; hem tarih, hem tasavvuf, hem de termal şifa ve gastronomi başkentidir.",
      "literary_quotes": [
        "\"Karahisar-ı Sahib'in kalesi göklere baş çekmiş bir şahin yuvası gibidir; eteğinde kırk direkli ulu bir mabet ve gönülleri ısıtan şifalı ılıcalar uzanır.\" — Evliya Çelebi, Seyahatnâme",
        "\"Kocatepe'nin sisli şafağında bir milletin kaderi yeniden yazıldı; taş ve toprak şahittir ki bu dağlar istiklalin ilk nefesidir.\" — Millî Mücadele Hatıratları",
        "\"Frig Vadisi'nin kayalarına oyulmuş sessizlikte, rüzgâr hâlâ kadim medeniyetlerin ezgisini taşır.\" — Anadolu Gezi Notları"
      ],
      "spiritual_figures": [
        "**Sultan Divani (Mehmed Semâî Çelebi):** Hz. Mevlânâ'nın yedinci göbekten torunu; Afyonkarahisar Mevlevihanesi'ni kurarak şehri Konya'dan sonra Mevleviliğin ikinci büyük irfan ocağı haline getiren büyük mutasavvıf.",
        "**Sahip Ata Fahreddin Ali:** Anadolu Selçuklu veziri; Ulu Cami'den hamamlara, medreselerden vakıf eserlerine kadar Afyonkarahisar'ın imar ve ilim kimliğini şekillendiren devlet adamı.",
        "**Gedik Ahmet Paşa:** Fatih Sultan Mehmed döneminin kudretli sadrazamı; Afyon'da inşa ettirdiği Imaret Camii ve külliyesiyle şehrin klasik Osmanlı silüetini mühürleyen hayırsever.",
        "**Abdürrahim Mısrî (Mısrî Sultan):** Halvetî-Mısrî geleneğinin Anadolu'daki mühim temsilcilerinden, şehrin manevi koruyucularından biri.",
        "**Gazi Mustafa Kemal Atatürk ve Büyük Taarruz Kahramanları:** 26 Ağustos 1922 sabahı Kocatepe'den Büyük Taarruz'u yöneterek Anadolu'nun kurtuluşunu müjdeleyen komuta kademesi ve şehitler."
      ]
    },
    "02_Ege/Aydin": {
      "plate": 9,
      "name": "Aydın",
      "region": "Ege",
      "region_code": "02_Ege",
      "lat": 37.838,
      "lng": 27.8456,
      "landmarks": [
        "Aphrodisias Antik Kenti",
        "Didim Apollon Tapınağı",
        "Milet Antik Kenti",
        "Güvercinada Kalesi"
      ],
      "specialties": [
        "İncir",
        "Çine Köftesi",
        "Zeytinyağlı Börülce",
        "Kabak Tatlısı"
      ],
      "quote": "Gökyüzünün altındaki en güzel yeryüzü; bereketli Menderes Ovası ve antik mermerlerin zarafeti.",
      "library": "Aydın İl Halk Kütüphanesi - Üniversite ve şehir yaşamının kesiştiği ferah kütüphane.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "02_Ege/Aydin/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "02_Ege/Aydin/gallery.jpg",
      "images": [
        "02_Ege/Aydin/banner.jpg",
        "02_Ege/Aydin/gallery.jpg"
      ],
      "readme_rel": "02_Ege/Aydin/README.md",
      "slug": "Aydin",
      "content_size": 5689,
      "history": "Herodot'un \"Gökyüzünün altındaki en güzel yeryüzü\" sözüyle ölümsüzleştirdiği Aydın; Büyük Menderes Nehri'nin bereketli alüvyonları üzerinde yükselen, İyonya ve Karya uygarlıklarının en parlak bilim, felsefe ve sanat merkezlerini barındıran eşsiz bir Ege şehridir. Bilimin ve doğa felsefesinin öncüleri Thales, Anaksimandros ve Anaksimenes'in şehri Milet; heykeltıraşlık ekolüyle UNESCO Dünya Mirası Listesi'ne giren Aphrodisias; kehanet merkezi Didim Apollon Tapınağı; planlı kent mimarisinin ilk örneği Priene; Tralleis ve Nysa antik kentleri hep bu topraklardadır. Türk-İslam döneminde ise Aydınoğulları Beyliği'nin ilim ve gaza geleneğiyle yoğrulan şehir, zeytin ve incir ağaçlarının gölgesinde sükûnetle yaşamaya devam etmektedir.",
      "literary_quotes": [
        "\"Aydın ve çevresi, benim bildiğim kadarıyla gökyüzünün altındaki en güzel yeryüzüdür; havası mutedil, toprağı her türlü meyveye cömerttir.\" — Herodot",
        "\"Dağlarından yağ, ovalarından bal akar; zeytini şifa, inciri bereket, efesi yiğitliktir.\" — Ege Halk Deyişi",
        "\"Milet'in taşlarında insan aklının ilk kez evrene 'neden?' diye sorduğu o büyük uyanışın yankısı durur.\" — Anadolu Düşünce Tarihi Notları"
      ],
      "spiritual_figures": [
        "**Aydınoğlu Mehmed Bey ve Gazi Umur Bey:** 14. yüzyılda Batı Anadolu'da ilmi, ticareti ve denizciliği himaye eden, şehre adını veren Aydınoğulları Beyliği'nin kurucu ve kahraman beyleri.",
        "**Üveys Paşa ve Cihanoğlu Ailesi:** 16.–18. yüzyıllarda Aydın ve Koçarlı'da zarif külliyeler, medreseler, kütüphaneler ve hanlar inşa ederek bölgenin mimari hafızasını zenginleştiren Osmanlı banileri.",
        "**Yörük Ali Efe ve Çete Emir Ayşe:** Millî Mücadele yıllarında Malgaç Baskını ile Aydın cephesinde işgale karşı destansı bir direniş sergileyen Ege efeleri.",
        "**Thales, Anaksimandros ve Anaksimenes (Milet Okulu):** Milet topraklarında yetişerek matematik, astronomi ve doğa felsefesinin temellerini atan ilk filozoflar.",
        "**Adnan Menderes:** Aydın'ın Çakırbeyli köyünden çıkarak Türkiye'nin çok partili demokrasi tarihine damga vuran devlet adamı."
      ]
    },
    "02_Ege/Denizli": {
      "plate": 20,
      "name": "Denizli",
      "region": "Ege",
      "region_code": "02_Ege",
      "lat": 37.783,
      "lng": 29.0963,
      "landmarks": [
        "Pamukkale Travertenleri",
        "Hierapolis Antik Kenti",
        "Laodikeia",
        "Kaklık Mağarası"
      ],
      "specialties": [
        "Denizli Kebabı",
        "Zafer Gazozu",
        "Tavas Pidesi",
        "Çameli Fasulyesi"
      ],
      "quote": "Beyaz cennet travertenlerin şükür makamı ve antik Hierapolis'in şifalı termal havuzları.",
      "library": "Denizli İl Halk Kütüphanesi - Şehir merkezinde, sessiz çalışma salonları geniş, öğleden sonra kalabalık olabiliyor.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "02_Ege/Denizli/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "02_Ege/Denizli/gallery.jpg",
      "images": [
        "02_Ege/Denizli/banner.jpg",
        "02_Ege/Denizli/gallery.jpg"
      ],
      "readme_rel": "02_Ege/Denizli/README.md",
      "slug": "Denizli",
      "content_size": 5859,
      "custom_quote": "Pamukkale'nin beyaz travertenleriyle doğanın ve tarihin beyaz bir rüya gibi birleştiği şehir.",
      "custom_library": "Denizli İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Hierapolis ve Laodikeia antik kentlerine ev sahipliği yapan Denizli, tekstil geleneğini antik dönemden bugüne taşıyan, bereketli topraklara sahip bir Ege durağıdır. Büyük Menderes ve Çürüksu (Lykos) vadilerinin kesişiminde kurulan bu kadim coğrafya; Frig, Lidya, Hellenistik, Roma, Bizans, Selçuklu ve Osmanlı katmanlarını bir arada barındırır. Kaleiçi Çarşısı'ndan Buldan dokumalarına, Akhan Kervansarayı'ndan şifalı termal sularına kadar Denizli, hem ticaretin hem de şifanın tarih boyunca aktığı müstesna bir Anadolu menzilidir.",
      "literary_quotes": [
        "\"Denizli, suyun taşa can verdiği, beyaz travertenlerin göğe gülümsediği yerdir.\" — Evliya Çelebi",
        "\"Hierapolis, şifalı suların ve beyaz pamuk yığınlarının sinesinde uyuyan bir tarihtir.\" — Strabon",
        "\"Lykos Vadisi'nin ak suları, yünü de ruhu da arındıran bir bereket taşır.\" — Anadolu Seyahat Notları"
      ],
      "reflection": "Hierapolis antik havuzunun şifalı sularında, doğanın yaratılış harikalarını ve asırlar boyu süregelen şifa arayışını tefekkür edersiniz.",
      "spiritual_figures": [
        "**Server Gazi:** Denizli'nin fethi sırasında şehit düşen ve bugün şehre hâkim tepede türbesiyle manevi bir bekçi gibi duran Selçuklu komutanı ve gönül eri.",
        "**Mehmed Gazi:** Anadolu Selçukluları döneminde bölgenin Türk-İslam yurdu olmasında öncülük eden, Akhan ve çevresindeki fetih ruhunun simge isimlerinden.",
        "**Fatma Yıldız Hanım ve Denizli Ahi Geleneği:** Denizli'nin köklü dokumacılık ve debbağlık esnaf kültürünü asırlar boyu ahlak ve kardeşlik ekseninde yaşatan Ahi teşkilatı mirası.",
        "**Müftü Ahmet Hulusi Efendi:** 15 Mayıs 1919'da İzmir'in işgalinin hemen ardından Denizli'de Millî Mücadele fetvasını vererek Ege'de direniş ateşini yakan âlim ve vatansever.",
        "**Özay Gönlüm:** Yaren bağlaması ve Ege türküleriyle Denizli'nin sözlü hafızasını, mizahını ve insan sıcaklığını bütün Türkiye'ye taşıyan halk ozanı."
      ],
      "five_day_plan": [
        "**1. Gün – Şehir Merkezi, Kaleiçi ve Kütüphane Uyumu:** Sabah Denizli İl Halk Kütüphanesi'nde ilk mesai; öğleden sonra Tarihi Kaleiçi Çarşısı, Bayramyeri, Denizli Horozu Heykeli, Atatürk ve Etnografya Müzesi yürüyüşü ve akşam Kaleiçi'nde Denizli Kebabı.",
        "**2. Gün – Beyaz Cennet Pamukkale ve Hierapolis:** Sabah erken saatte Pamukkale Travertenleri'nde gün ışığı yürüyüşü, Hierapolis Antik Tiyatrosu, Antik Havuz (Kleopatra Havuzu), Nekropol ve Karahayıt'ın kızıl şifalı suları.",
        "**3. Gün – Lykos Vadisi'nin İncisi Laodikeia ve Akhan:** Sabah kütüphane mesaisi; öğleden sonra sütunlu caddeleriyle büyüleyen Laodikeia Antik Kenti ve 13. yüzyıl Selçuklu yadigârı Akhan Kervansarayı ziyareti.",
        "**4. Gün – Yeraltı Pamukkale ve Yayla Serinliği:** Honaz istikametinde Kaklık Mağarası'nın yeraltı travertenleri; ardından teleferikle Bağbaşı Yaylası'na çıkarak çam kokuları eşliğinde tefekkür ve okuma vakti.",
        "**5. Gün – Buldan Dokumaları, Server Gazi ve Veda:** Tarihi Buldan evleri ve el dokuması bez çarşısı turu; dönüşte Server Gazi Türbesi ziyareti ve şehre hâkim tepeden Lykos Vadisi'ne veda."
      ]
    },
    "02_Ege/Izmir": {
      "plate": 35,
      "name": "İzmir",
      "region": "Ege",
      "region_code": "02_Ege",
      "lat": 38.4192,
      "lng": 27.1287,
      "landmarks": [
        "Saat Kulesi",
        "Efes Antik Kenti",
        "Tarihi Kemeraltı Çarşısı",
        "Kadifekale",
        "Şirince"
      ],
      "specialties": [
        "İzmir Boyozu",
        "Kumru",
        "İzmir Bombası",
        "Tulum Peyniri",
        "Şambali"
      ],
      "quote": "Ege'nin incisi; Akdeniz rüzgarının özgürlük fısıldadığı, antik kütüphanelerin ve limanların şehri.",
      "library": "İzmir Milli Kütüphane / Atatürk İl Halk Kütüphanesi - Tarihi neoclassic mimarisi ve muazzam kitap koleksiyonuyla ilham kaynağı.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "02_Ege/Izmir/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "02_Ege/Izmir/gallery.jpg",
      "images": [
        "02_Ege/Izmir/banner.jpg",
        "02_Ege/Izmir/gallery.jpg"
      ],
      "readme_rel": "02_Ege/Izmir/README.md",
      "slug": "Izmir",
      "content_size": 5962,
      "custom_quote": "Ege'nin incisi İzmir, körfezin serin imbat rüzgarıyla yıkanan, hoşgörünün ve özgürlüğün simgesi kadim kent.",
      "custom_library": "Izmir İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası. (Ayrıca neoklasik mimarisiyle İzmir Milli Kütüphane ve Atatürk İl Halk Kütüphanesi de ayrı bir ilham kaynağıdır.)",
      "history": "Smyrna adıyla 8500 yıllık bir geçmişe sahip olan İzmir, İpekyolu'nun batıya açılan en büyük liman kenti olmuş, kozmopolit yapısıyla tarih boyunca ticaretin ve kültürün kalbi sayılmıştır. Yeşilova Höyüğü'nden Bayraklı (Eski Smyrna) kalıntılarına, Kadifekale'den Agora'ya, Efes ve Bergama gibi UNESCO Dünya Mirası harikalarından Kemeraltı'nın asırlık hanlarına uzanan bu kıyı medeniyeti; denizle bilginin, ticaret ahlakıyla sanatın buluşma noktasıdır.",
      "literary_quotes": [
        "\"İzmir, Akdeniz'in incisidir, suyun ve mermerin rüya gördüğü yerdir.\" — Victor Hugo",
        "\"Güzel İzmir! Körfezinin mavi sularında tarihin ve güneşin seviştiği şehir.\" — Halikarnas Balıkçısı",
        "\"İzmir, her sokağında denizin kokusunu ve özgürlüğün nefesini taşıyan şehirdir.\" — Atilla İlhan"
      ],
      "reflection": "Kordon boyunda batan güneşi izlerken, Akdeniz uygarlıklarının ortak ruhunu ve zamanın dalgalar halinde akışını tefekkür edersiniz. Efes'in mermer caddelerinde yürürken insanlığın geçici görkemini idrak edersiniz.",
      "spiritual_figures": [
        "**Çaka Bey:** 1081'de İzmir'i fethederek ilk Türk donanmasını kuran ve Ege'de Türk denizcilik tarihini başlatan öncü bey.",
        "**Umur Bey (Aydınoğlu Gazi Umur Bey):** İzmir ve çevresinde deniz gazalarının ve ilim himayesinin simgesi, Düstûrnâme'nin kahramanı.",
        "**Kızlarağası Hacı Beşir Ağa ve Hisar Camii Banileri:** Kemeraltı'nın ticari ve manevi merkezini hanlar, şadırvanlar ve camilerle nakış gibi ören Osmanlı vakıf medeniyeti temsilcileri.",
        "**Hasan Tahsin (Osman Nevres):** 15 Mayıs 1919'da Konak'ta işgale karşı ilk kurşunu sıkarak Millî Mücadele'nin kıvılcımını ateşleyen gazeteci ve şehit.",
        "**Homeros ve Herakleitos:** Meles Çayı kıyısında destanlar fısıldayan Homeros ile Efes'te \"Aynı nehirde iki kez yıkanılmaz\" diyerek zamanın akışını tefekkür eden filozof Herakleitos."
      ],
      "five_day_plan": [
        "**1. Gün – Konak, Kemeraltı ve Körfez Selamı:** Sabah kütüphane mesaisi; öğleden sonra Tarihi Saat Kulesi, Yalı Camii, Kemeraltı Çarşısı, Hisar Camii, Kızlarağası Hanı'nda kahve molası ve akşam Kordon Boyu'nda gün batımı.",
        "**2. Gün – Kadim Smyrna, Agora ve Tarihi Asansör:** Smyrna Agorası ve Kadifekale'den körfez panoraması; ardından Dario Moreno Sokağı, Tarihi Asansör ve vapurla Karşıyaka sahil yürüyüşü.",
        "**3. Gün – Efes, Celsus Kütüphanesi ve Şirince:** İZBAN ile Selçuk'a yolculuk; Efes Antik Kenti'nde Celsus Kütüphanesi ve Büyük Tiyatro tefekkürü, İsa Bey Camii ve akşamüstü zeytinlikler arasındaki Şirince köyü.",
        "**4. Gün – Bergama Akropolü ve Asklepion:** Sabah erken yola çıkarak parşömenin doğduğu Pergamon (Bergama) Akropolü, dünyanın ilk şifahanelerinden Asklepion ve Kızıl Avlu ziyareti.",
        "**5. Gün – Urla, Klazomenai ve Veda İmbatı:** Sabah kütüphane notlarının toparlanması; öğleden sonra Urla Sanat Sokağı, antik zeytinyağı işliği Klazomenai ve körfez vapurunda İzmir'e veda."
      ]
    },
    "02_Ege/Kutahya": {
      "plate": 43,
      "name": "Kütahya",
      "region": "Ege",
      "region_code": "02_Ege",
      "lat": 39.4244,
      "lng": 29.9833,
      "landmarks": [
        "Aizanoi Antik Kenti",
        "Kütahya Kalesi",
        "Dönenler Camii (Mevlevihane)",
        "Çini Müzesi"
      ],
      "specialties": [
        "Kütahya Güveci",
        "Cimcik Aşı",
        "Sini Mantısı"
      ],
      "quote": "Çininin nakış nakış işlendiği sabır şehri, Germiyanoğulları'nın yadigarı ve Mevlevi ocağı.",
      "library": "Kütahya Vahit Paşa İl Halk Kütüphanesi - Yazma eserler koleksiyonu ve huzurlu salonları.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "02_Ege/Kutahya/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "02_Ege/Kutahya/gallery.jpg",
      "images": [
        "02_Ege/Kutahya/banner.jpg",
        "02_Ege/Kutahya/gallery.jpg"
      ],
      "readme_rel": "02_Ege/Kutahya/README.md",
      "slug": "Kutahya",
      "content_size": 5826,
      "history": "Antik çağda \"Kotiaeion\" adıyla anılan Kütahya; Frig, Roma, Bizans, Anadolu Selçuklu, Germiyanoğulları ve Osmanlı medeniyetlerinin izlerini taşıyan, sanatla sükûnetin harmanlandığı kadim bir İç Ege şehridir. Çavdarhisar'da bulunan ve dünyanın ilk ticaret borsasını (Macellum) barındıran Aizanoi Antik Kenti ile antik çağın zarafetini; Germiyanoğulları'nın başkentliğini yaptığı asırlardan kalan Vacidiye Medresesi, Dönenler Camii (Mevlevihane) ve Ulu Cami ile Türk-İslam sanatının derinliğini yaşatır. Evliya Çelebi'nin ata yurdu, Osmanlı şehzadelerinin sancak şehri ve UNESCO Yaratıcı Şehirler Ağı'nda \"Zanaat ve Halk Sanatları\" şehri olan Kütahya; toprağı ateşle, sabrı firuze ve kobalt mavisiyle buluşturan çini ustalarının diyarıdır.",
      "literary_quotes": [
        "\"Kütahya'nın suyu ve havası latif, halkı garip dostu, çinisi ve kâsesi cihanda misilsizdir.\" — Evliya Çelebi, Seyahatnâme",
        "\"Çini, toprağın duasıdır; sabırla yoğrulur, fırında sınanır ve asırlarca solmayan bir maviye dönüşür.\" — Kütahya Zanaat Kültürü Notları",
        "\"Germiyan sokaklarında yürürken ahşap cumbaların gölgesinde bir şehzade sancağının vakarını hissedersiniz.\" — Anadolu Seyahat Defteri"
      ],
      "spiritual_figures": [
        "**Evliya Çelebi:** Büyük Türk seyyahının baba ocağı Kütahya'dır; Seyahatnâme'de şehre duyduğu derin sevgi ve gurur her satırda hissedilir.",
        "**Ergün Çelebi:** Hz. Mevlânâ'nın torunlarından, Kütahya Mevlevihanesi'ni (Dönenler Camii) kuran ve şehrin tasavvuf atmosferini besleyen büyük veli.",
        "**Germiyanoğlu II. Yakup Bey:** Türkçenin ve ilmin hamisi; kurduğu külliye (bugünkü Çini Müzesi) ve vakıflarıyla Kütahya'ya kalıcı bir medeniyet mührü vuran bilge bey.",
        "**Şeyhî (Yusuf Sinan):** Germiyan sarayında yetişen, *Harnâme* ve *Hüsrev ü Şîrîn* eserleriyle Türk edebiyatına yön veren büyük divan şairi ve hekim.",
        "**Sıtkı Olçar ve Ahmet Yakupoğlu:** Kütahya çini sanatını dünyaya tanıtan UNESCO Yaşayan İnsan Hazinesi Sıtkı Olçar ile şehrin silüetini fırçasına ve neyine taşıyan hezarfen sanatçı Ahmet Yakupoğlu.",
        "**Lajos Kossuth:** 1850-1851 yıllarında Osmanlı'ya sığınan Macar özgürlük önderi; Kütahya'daki evi bugün Türk-Macar dostluğunun müzesidir."
      ]
    },
    "02_Ege/Manisa": {
      "plate": 45,
      "name": "Manisa",
      "region": "Ege",
      "region_code": "02_Ege",
      "lat": 38.614,
      "lng": 27.4296,
      "landmarks": [
        "Muradiye Camii",
        "Sultan Camii",
        "Spil Dağı Milli Parkı",
        "Sardes Antik Kenti"
      ],
      "specialties": [
        "Manisa Kebabı",
        "Mesir Macunu",
        "Kula Güveci"
      ],
      "quote": "Şehzadeler şehri; Mimar Sinan'ın Muradiye'si ve Spil Dağı'nın şifalı rüzgarları.",
      "library": "Manisa İl Halk Kütüphanesi - Ferah çalışma salonları ve merkezi konumuyla verimli.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "02_Ege/Manisa/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "02_Ege/Manisa/gallery.jpg",
      "images": [
        "02_Ege/Manisa/banner.jpg",
        "02_Ege/Manisa/gallery.jpg"
      ],
      "readme_rel": "02_Ege/Manisa/README.md",
      "slug": "Manisa",
      "content_size": 5985,
      "history": "Spil Dağı'nın heybetli eteklerine yaslanan ve bereketli Gediz Ovası'na bakan Manisa (antik Magnesia ad Sipylum), insanlık tarihinin en köklü devlet ve ticaret geleneklerine ev sahipliği yapar. Tarihte madeni parayı ilk kez basan Lidya Krallığı'nın başkenti Sardes, Kral Yolu'nun başlangıç noktası olarak bugün hâlâ görkemini korur. Saruhanoğulları Beyliği'nin ardından Osmanlı İmparatorluğu'nun en gözde \"Şehzadeler Sancağı\" olan Manisa'da Fatih Sultan Mehmed, Kanuni Sultan Süleyman, II. Selim, III. Murad ve III. Mehmed gibi cihan padişahları devlet tecrübesi kazanmıştır. Mimar Sinan'ın Ege'deki tek eseri olan Muradiye Camii, UNESCO Küresel Jeoparkı Kula Volkanik Jeoparkı, Aigai Antik Kenti ve asırlık Mesir Macunu geleneğiyle Manisa, hem imparatorluk vakarı hem de tabiat harikaları barındıran müstesna bir menzildir.",
      "literary_quotes": [
        "\"Manisa, Spil Dağı'nın şifalı rüzgârlarıyla yıkanan, şehzadelerin devlet terbiyesi aldığı bağlık bahçelik bir cennettir.\" — Evliya Çelebi, Seyahatnâme",
        "\"Sardes'in altın taşıyan Paktolos sularında bir zamanlar dünyanın en zengin krallığı yükselirdi; geriye zamanın öğrettiği o büyük sükûnet kaldı.\" — Herodot'tan Mülhem",
        "\"Manisa lâlesi Spil'in kayalıklarında baharı müjdelerken, şehrin her taşında bir şehzadenin düşü uyanır.\" — Ege Kültür Notları"
      ],
      "spiritual_figures": [
        "**Saruhan Bey:** 14. yüzyılda Manisa ve çevresini fethederek Saruhanoğulları Beyliği'ni kuran ve bölgeyi ilimle imar eden öncü bey.",
        "**Merkez Efendi (Musa Muslihiddin):** Kanuni'nin annesi Hafsa Sultan'ın şifası için 41 çeşit baharattan **Mesir Macunu**'nu terkip eden, Sultan Külliyesi Darüşşifası'nın başhekimi ve büyük Halvetî mutasavvıfı.",
        "**Mimar Sinan:** Manisa'daki Muradiye Camii ve Külliyesi'nin tasarımını yaparak Ege topraklarına eşsiz bir mimari imza bırakan Koca Sinan.",
        "**Şehzade Mehmed (Fatih) ve Şehzade Süleyman (Kanuni):** Manisa Sarayı'nda ilim, sanat ve devlet yönetimi tahsil ederek cihan tarihine yön veren Osmanlı sultanları.",
        "**Ahmet Bedevi (Manisa Tarzanı):** Millî Mücadele'nin ardından Spil Dağı'nı ve Manisa'yı binlerce ağaçla yeşerten, sade ve doğa dostu yaşamıyla Türkiye'nin ilk çevre gönüllüsü."
      ]
    },
    "02_Ege/Mugla": {
      "plate": 48,
      "name": "Muğla",
      "region": "Ege",
      "region_code": "02_Ege",
      "lat": 37.2153,
      "lng": 28.3636,
      "landmarks": [
        "Ölüdeniz",
        "Kelebekler Vadisi",
        "Bodrum Kalesi",
        "Saklıkent Kanyonu",
        "Dalyan Kaunos Kral Mezarları"
      ],
      "specialties": [
        "Muğla Köftesi",
        "Çökertme Kebabı",
        "Kabak Çiçeği Dolması",
        "Börülce"
      ],
      "quote": "Turkuaz koyların antik Likya ve Karya ile kucaklaştığı, tabiatın cömertçe sergilendiği cennet köşe.",
      "library": "Muğla İl Halk Kütüphanesi - Üniversite bölgesine yakın, çalışma ortamı sessiz ve ferah, priz sayısı yeterli.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "02_Ege/Mugla/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "02_Ege/Mugla/gallery.jpg",
      "images": [
        "02_Ege/Mugla/banner.jpg",
        "02_Ege/Mugla/gallery.jpg"
      ],
      "readme_rel": "02_Ege/Mugla/README.md",
      "slug": "Mugla",
      "content_size": 5784,
      "custom_quote": "Turkuaz koyları, yeşil çam ormanları ve beyaz Muğla evleriyle doğanın en cömert davrandığı yeryüzü cenneti.",
      "custom_library": "Mugla İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Karya medeniyetinden bugüne uzanan Muğla, tarihi evleri, yaylaları ve dünyanın en güzel kıyıleriyle tarih boyunca seyyahların uğrak noktası olmuştur. Karya ve Likya uygarlıklarının kesiştiği bu coğrafya; Halikarnassos'tan Knidos'a, Stratonikeia'dan Kaunos'a kadar yüzlerce antik kente, Menteşeoğulları Beyliği'nin zarif cami ve medreselerine, karakteristik bacalarıyla ünlü Arasta ve Saburhane konaklarına ev sahipliği yapar.",
      "literary_quotes": [
        "\"Muğla, dağların denizle kucaklaştığı, insanın doğayla uyum içinde yaşadığı masaldır.\" — Halikarnas Balıkçısı",
        "\"Karya toprakları, güneşin ve denizin ebedi vatanıdır.\" — Heredot",
        "\"Mavi yolculuk, sadece bir deniz gezisi değil; insanın kendi iç sularına doğru açıldığı bir sükûnet seferidir.\" — Azra Erhat"
      ],
      "reflection": "Kayaköy'ün terk edilmiş hüzünlü sokaklarında zamanın geçiciliğini ve sessizliğin sesini tefekkür edersiniz. Saklıkent Kanyonu'nun serin sularında doğanın gücünü hissedersiniz.",
      "spiritual_figures": [
        "**Menteşe Bey ve İlyas Bey:** Muğla ve Güneybatı Anadolu'yu Türk-İslam yurdu yapan, Balat ve Beçin'de mimari şaheserler bırakan Menteşeoğulları Beyliği'nin öncüleri.",
        "**Şahidi İbrahim Dede:** Muğla'nın manevi mimarı, 16. yüzyıl Mevlevi şeyhi, *Tuhfe-i Şâhidî* adlı meşhur manzum sözlüğün müellifi; türbesi Muğla merkezde gönüllere huzur vermektedir.",
        "**Herodot (Halikarnassoslu):** Tarih ilminin babası sayılan ve Bodrum topraklarında doğup dünyayı gezen ilk büyük seyyah-tarihçi.",
        "**Cevat Şakir Kabaağaçlı (Halikarnas Balıkçısı):** Sürgün geldiği Bodrum'u dünya edebiyatına armağan eden, Anadolu'nun deniz kültürünü ve mavi hümanizmasını kaleme alan yazar.",
        "**Nail Çakırhan:** Geleneksel Ula/Akyaka ahşap mimarisini modern yaşamla buluşturarak Ağa Han Mimarlık Ödülü'nü kazanan ve bölgenin mimari kimliğini koruyan usta."
      ],
      "five_day_plan": [
        "**1. Gün – Menteşe, Saburhane ve Şahidi Dede:** Sabah Muğla İl Halk Kütüphanesi'nde çalışma; öğleden sonra Tarihi Muğla Evleri (Saburhane), Arasta Çarşısı, Kurşunlu Camii, Şahidi İbrahim Dede Türbesi ve Karabağlar Yaylası'nda serin akşam.",
        "**2. Gün – Akyaka, Azmak ve Gökova Körfezi:** Çam ormanları içinden Akyaka'ya iniş; buz gibi Azmak Nehri kıyısında yürüyüş, Nail Çakırhan mimarisi incelemesi ve Sedir Adası / Gökova seyri.",
        "**3. Gün – Dalyan, Kaunos ve İztuzu:** Sazlıklar arasından geçerek Kaunos Kaya Mezarları ve Antik Kenti'ne yolculuk, ardından caretta carettaların yuvası İztuzu Plajı'nda gün batımı tefekkürü.",
        "**4. Gün – Fethiye, Kayaköy ve Saklıkent:** Sabah erken saatte Kayaköy Hayalet Şehir'in sessiz sokakları, Ölüdeniz ve Babadağ manzarası; öğleden sonra Saklıkent Kanyonu'nun serin sularında yürüyüş.",
        "**5. Gün – Stratonikeia, Bodrum veya Datça Ufku:** \"Gladyatörler Şehri\" Stratonikeia ve Osmanlı köy dokusunun iç içe geçtiği ören yeri gezisi; vaktin elverdiğince Bodrum Kalesi ya da Knidos fenerinde Ege'ye veda."
      ]
    },
    "02_Ege/Usak": {
      "plate": 64,
      "name": "Uşak",
      "region": "Ege",
      "region_code": "02_Ege",
      "lat": 38.6735,
      "lng": 29.4059,
      "landmarks": [
        "Ulubey Kanyonu",
        "Blaundos Antik Kenti",
        "Clandras Köprüsü",
        "Uşak Arkeoloji Müzesi"
      ],
      "specialties": [
        "Tarhana Çorbası",
        "Döndürme Böreği",
        "Ebeli Köftesi"
      ],
      "quote": "Dünyanın en uzun ikinci kanyonuna sahip, Karun Hazineleri'nin saklandığı kadim halı ve kilim diyarı.",
      "library": "Uşak İl Halk Kütüphanesi - Sessiz, nezih ve çalışmaya elverişli ortam.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "02_Ege/Usak/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "02_Ege/Usak/gallery.jpg",
      "images": [
        "02_Ege/Usak/banner.jpg",
        "02_Ege/Usak/gallery.jpg"
      ],
      "readme_rel": "02_Ege/Usak/README.md",
      "slug": "Usak",
      "content_size": 5798,
      "history": "İç Ege ile İç Anadolu arasında doğal bir köprü kuran Uşak (antik Temenothyrai); Lidya, Frig, Pers, Roma, Germiyanoğulları ve Osmanlı katmanlarının sessiz ve vakur birleşimidir. Dünyaca ünlü **Karun Hazineleri**'ne (başta Kanatlı Denizatı Broşu olmak üzere) ev sahipliği yapan Uşak Arkeoloji Müzesi, insanlığın zenginlik ve fânilik üzerine binlerce yıllık ibretini gözler önüne serer. ABD'deki Büyük Kanyon'un ardından dünyanın en uzun ikinci kanyon sistemi olan **Ulubey Kanyonları**, derin vadilerin ortasındaki **Blaundos Antik Kenti** ve 2500 yıllık **Clandras Köprüsü** ile Uşak, henüz keşfedilmeyi bekleyen saklı bir tabiat ve tarih hazinesidir. Aynı zamanda \"Uşak Halısı\" ile Rönesans tablolarına kadar giren bu şehir, Cumhuriyet döneminin ilk şeker fabrikasını kuran müteşebbis ruhuyla \"İlkler Şehri\" olarak da anılır.",
      "literary_quotes": [
        "\"Uşak'ın halısı cihan saraylarını süsler, halkı misafirperver, toprağı bereketli ve havası hoş bir beldedir.\" — Evliya Çelebi, Seyahatnâme",
        "\"Karun'un hazineleri bir müze vitrininde sessizce dururken, insana asıl zenginliğin gönül tokluğu olduğunu fısıldar.\" — Anadolu Tefekkür Notları",
        "\"Ulubey Kanyonu'nun uçsuz bucaksız kıvrımlarına baktığınızda, suyun sabırla taşı nasıl bir sanat eserine dönüştürdüğüne şahit olursunuz.\" — Ege Doğa Günlükleri"
      ],
      "spiritual_figures": [
        "**Hacım Sultan:** Hacı Bektaş-ı Veli'nin halifelerinden; Uşak'ın Sivaslı ilçesine bağlı Hacım köyündeki zaviyesi ve türbesiyle bölgenin manevi hayatına asırlarca ışık tutan Anadolu ereni.",
        "**Halvetî-Uşşâkî Geleneği ve Hasan Hüsâmeddin Uşşâkî:** Uşşâkî tarikatının piri; ilmi ve tasavvufi mirasıyla Uşak'ın adını gönül coğrafyasına nakşeden büyük mutasavvıf.",
        "**Nuri Şeker:** Cumhuriyet'in ilk yıllarında halkın birikimiyle Türkiye'nin ilk şeker fabrikasını Uşak'ta kurarak yerli sanayi ve dayanışmanın sembolü olan vizyoner öncü.",
        "**Besim Atalay:** Uşak doğumlu dilbilimci ve müellif; *Dîvânu Lugâti't-Türk*'ü Türkçeye kazandırarak kültür tarihimize eşsiz bir hizmet sunan ilim insanı.",
        "**Halid Ziya Uşaklıgil:** Kökleri Uşak'a uzanan, modern Türk romanının kurucularından büyük edebiyatçı."
      ]
    },
    "03_Akdeniz/Adana": {
      "plate": 1,
      "name": "Adana",
      "region": "Akdeniz",
      "region_code": "03_Akdeniz",
      "lat": 37.0,
      "lng": 35.3213,
      "landmarks": [
        "Taşköprü",
        "Sabancı Merkez Camii",
        "Büyük Saat",
        "Varda Köprüsü",
        "Anavarza Antik Kenti"
      ],
      "specialties": [
        "Adana Kebap",
        "Şalgam Suyu",
        "Bici Bici",
        "Analı Kızlı Çorbası",
        "Halka Tatlı"
      ],
      "quote": "Seyhan'ın serinliğiyle Çukurova'nın cömert sıcağını harmanlayan, lezzetin ve samimiyetin başkenti.",
      "library": "Adana İl Halk Kütüphanesi - Şehir merkezinde yer alıyor, klimaları yaz sıcağında can kurtarıyor, priz imkanları iyi.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "03_Akdeniz/Adana/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "03_Akdeniz/Adana/gallery.jpg",
      "images": [
        "03_Akdeniz/Adana/banner.jpg",
        "03_Akdeniz/Adana/gallery.jpg"
      ],
      "readme_rel": "03_Akdeniz/Adana/README.md",
      "slug": "Adana",
      "content_size": 5054,
      "custom_quote": "Torosların gölgesinde, Seyhan Nehri'nin bereketli toprakları üzerinde yükselen, sıcakkanlı ve coşkulu şehir.",
      "custom_library": "Adana İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Kilikya bölgesinin en önemli kenti olan Adana, Hititlerden bugüne tarımın, ticaretin ve kültürün merkezi olmuştur. Çukurova'nın bereketli toprakları şehre hayat vermiştir.",
      "literary_quotes": [
        "\"Adana, Çukurova'nın altın kalbi, Seyhan'ın nazlı gelinidir.\" — Yaşar Kemal",
        "\"Taşköprü, nehrin üzerine kurulmuş taştan bir gerdanlık gibidir.\" — Evliya Çelebi"
      ],
      "reflection": "Seyhan kıyısında asırlık Taşköprü'nün üzerinde durup altından akan suya bakarken, nehirler gibi akıp giden insan ömrünü ve tarihin sabitliğini tefekkür edersiniz.",
      "spiritual_figures": [
        "**Ramazanoğlu Halil Bey ve Pîrî Mehmet Paşa:** Çukurova'da Ramazanoğulları Beyliği'nin mimari ve kültürel mührünü vuran; Adana Ulu Camii, Yağ Camii ve Ramazanoğlu Medresesi ile şehre Türk-İslam kimliği kazandıran baniler.",
        "**Karacaoğlan:** Toroslar'ın ve Çukurova'nın bağrından kopup gelen, doğayı ve insan sevgisini en duru Türkçe ile dile getiren büyük halk ozanı.",
        "**Yaşar Kemal & Orhan Kemal:** Çukurova'nın toprağını, ırgatların emeğini ve Adana sokaklarının nabzını dünya edebiyatına taşıyan iki büyük kalem.",
        "**Abidin Dino:** Çukurova'nın rengini, ışığını ve bereketini resim sanatına nakşeden usta sanatçı."
      ],
      "five_day_plan": [
        "**1. Gün – Seyhan'ın İki Yakası ve Tarihi Çekirdek:** Sabah İl Halk Kütüphanesi mesaisi; ikindi sonrası **Tarihi Taşköprü** üzerinden yürüyüş, **Sabancı Merkez Camii** ve Merkez Park'ta gün batımı tefekkürü.",
        "**2. Gün – Ramazanoğlu Mirası ve Çarşı Kültürü:** Kütüphane sonrası **Adana Ulu Camii**, **Ramazanoğlu Konağı**, **Büyük Saat Kulesi**, **Kazancılar Çarşısı** ve **Yağ Camii** rotasında asırlık esnaf dokusunu solumak.",
        "**3. Gün – Sinema, Müze ve Tepebağ Sokakları:** **Adana Arkeoloji Müzesi (Müze Kompleksi)**, **Adana Sinema Müzesi** ve tarihi **Tepebağ Evleri** arasında kültürel yürüyüş.",
        "**4. Gün – Torosların Kapısı (Varda Köprüsü & Kapıkaya Kanyonu):** Karaisalı yönünde **Varda (Alman) Köprüsü** ve **Kapıkaya Kanyonu** yürüyüşü ile Çukurova sıcağından Toros serinliğine geçiş.",
        "**5. Gün – Anavarza'nın İzinde ve Veda:** **Anavarza Antik Kenti** veya **Seyhan Baraj Gölü** kıyısında son okumalar, seyahatname notlarının temize çekilmesi ve bir sonraki Akdeniz menziline hazırlık."
      ]
    },
    "03_Akdeniz/Antalya": {
      "plate": 7,
      "name": "Antalya",
      "region": "Akdeniz",
      "region_code": "03_Akdeniz",
      "lat": 36.8969,
      "lng": 30.7133,
      "landmarks": [
        "Kaleiçi",
        "Yivli Minare",
        "Düden Şelalesi",
        "Aspendos Tiyatrosu",
        "Termessos",
        "Olympos"
      ],
      "specialties": [
        "Antalya Piyazı (Tahinli)",
        "Hibeş",
        "Yanık Dondurma",
        "Turunç Reçeli"
      ],
      "quote": "Torosların gölgesinde Akdeniz'in kadim kodlarını taşıyan sıcacık liman ve medeniyetler beşiği.",
      "library": "Antalya İl Halk Kütüphanesi - Yeşillikler içindeki bahçesi ve geniş okuma salonlarıyla Akdeniz sıcağında serin bir çalışma limanı.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "03_Akdeniz/Antalya/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "03_Akdeniz/Antalya/gallery.jpg",
      "images": [
        "03_Akdeniz/Antalya/banner.jpg",
        "03_Akdeniz/Antalya/gallery.jpg"
      ],
      "readme_rel": "03_Akdeniz/Antalya/README.md",
      "slug": "Antalya",
      "content_size": 5026,
      "custom_quote": "Akdeniz'in parlayan güneşi, antik limanları, heybetli surları ve eşsiz doğasıyla tarihin ve coğrafyanın zirvesi.",
      "custom_library": "Antalya İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Bergama Kralı Attalos tarafından kurulan Attaleia (Antalya), Bizans, Selçuklu ve Osmanlı dönemlerinde Akdeniz'in en stratejik liman kenti olmuştur.",
      "literary_quotes": [
        "\"Hiç şüphe yoktur ki Antalya, dünyanın en güzel yeridir.\" — Mustafa Kemal Atatürk",
        "\"Antalya'nın surları ve bahçeleri öyle bir süsle donanmıştır ki, giren kendini cennette sanır.\" — İbn Battûta"
      ],
      "reflection": "Kaleiçi'nin dar sokaklarında yürürken, asırlar boyu bu limana sığınmış gemicileri ve zamanın geçici limanlar olduğunu tefekkür edersiniz.",
      "spiritual_figures": [
        "**Sultan I. Gıyaseddin Keyhüsrev & I. Alâeddin Keykubad:** 1207'de Antalya'yı fethederek Anadolu Selçuklu Devleti'ni Akdeniz'e açan, **Yivli Minare** ve tersanelerle şehre kalıcı İslam mimarisi mührünü vuran sultanlar.",
        "**Ahi Yusuf (Yivli Minare Çevresi):** Antalya'nın fethinden sonra esnaf ahlakını ve fütüvvet kültürünü Kaleiçi sokaklarına yerleştiren manevi önder.",
        "**Elmalılı Muhammed Hamdi Yazır:** Antalya'nın Elmalı ilçesinde yetişmiş, *Hak Dini Kur'an Dili* tefsiriyle İslam ilim dünyasına silinmez bir eser bırakmış büyük müfessir.",
        "**Vahib-i Ümmî & Sinan-ı Ümmî:** Elmalı irfan geleneğinin kurucuları; Niyâzî-i Mısrî gibi gönül sultanlarının yetişmesine vesile olan tasavvuf büyükleri."
      ],
      "five_day_plan": [
        "**1. Gün – Kaleiçi ve Selçuklu Mirası:** Sabah İl Halk Kütüphanesi mesaisi; ikindi sonrası **Hadrian Kapısı (Üçkapılar)**, **Yivli Minare Külliyesi**, **Kesik Minare**, **Hıdırlık Kulesi** ve tarihi **Kaleiçi Yat Limanı** yürüyüşü.",
        "**2. Gün – Şelaleler ve Falezler:** Kütüphane sonrası **Yukarı ve Aşağı Düden Şelalesi**, Lara falezleri ve **Karaalioğlu Parkı**'nda Beydağları silüetini izleme.",
        "**3. Gün – Pamfilya'nın Görkemi (Perge & Aspendos):** **Antalya Arkeoloji Müzesi** ziyareti, ardından **Perge Antik Kenti** veya **Aspendos Tiyatrosu** ile antik Akdeniz tarihine yolculuk.",
        "**4. Gün – Torosların Serinliği (Termessos & Kurşunlu):** Güllük Dağı eteklerindeki **Termessos Antik Kenti** ve **Kurşunlu Şelalesi Tabiat Parkı**'nda doğa ve tarih tefekkürü.",
        "**5. Gün – Konyaaltı Kıyısı ve Seyahatname Notları:** Konyaaltı sahil bandında sabah yürüyüşü, kütüphanede haftalık çalışma kapanışı ve bir sonraki menzile doğru yola çıkış."
      ]
    },
    "03_Akdeniz/Burdur": {
      "plate": 15,
      "name": "Burdur",
      "region": "Akdeniz",
      "region_code": "03_Akdeniz",
      "lat": 37.7183,
      "lng": 30.2823,
      "landmarks": [
        "Salda Gölü",
        "Sagalassos Antik Kenti",
        "İnsuyu Mağarası",
        "Burdur Arkeoloji Müzesi"
      ],
      "specialties": [
        "Burdur Şiş",
        "Ceviz Ezmesi",
        "Testi Kebabı"
      ],
      "quote": "Göller Yöresi'nin incisi Salda'nın turkuaz suları ve Sagalassos'un Antoninler Çeşmesi'nde akan asırlık sular.",
      "library": "Burdur İl Halk Kütüphanesi - Göller yöresinin sükunetini yansıtan sessiz çalışma alanı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "03_Akdeniz/Burdur/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "03_Akdeniz/Burdur/gallery.jpg",
      "images": [
        "03_Akdeniz/Burdur/banner.jpg",
        "03_Akdeniz/Burdur/gallery.jpg"
      ],
      "readme_rel": "03_Akdeniz/Burdur/README.md",
      "slug": "Burdur",
      "content_size": 5460,
      "history": "Göller Yöresi'nin kalbinde yer alan Burdur, Neolitik çağın en önemli yerleşimlerinden **Hacılar** ve **Kuruçay Höyükleri** ile 9000 yılı aşan bir insanlık hafızasına sahiptir. Antik dönemde **Pisidya** uygarlığının göz bebeği olan coğrafya, Ağlasun sırtlarındaki **Sagalassos** ve Gölhisar'daki **Kibyra** antik kentleriyle Roma döneminin en görkemli dağ şehirlerini barındırır. Selçuklu ve Hamitoğulları dönemlerinde Türk-İslam kimliğine kavuşan Burdur, Teke Yöresi'nin sipsi, cura ve boğaz havalarıyla yoğrulmuş zengin Yörük kültürünün de canlı taşıyıcısıdır.",
      "literary_quotes": [
        "\"Sagalassos, bulutların arasında kurulu bir kartal yuvası; Antoninler Çeşmesi ise tarihin hiç susmayan berrak sesidir.\" — Gezgin Notları",
        "\"Teke Yöresi'nin sipsisi çaldığında, Toroslar'ın rüzgârı göllerin yüzeyine nakşolur.\" — Anadolu Folklor Mirası"
      ],
      "spiritual_figures": [
        "**Şeyhülislam Dürrizâde Abdullah Efendi & Burdurlu Derviş Mehmed Paşa:** Osmanlı ilmiye ve devlet geleneğinde Burdur'un adını temsil eden âlim ve devlet adamları.",
        "**Mehmet Akif Ersoy:** Millî Mücadele yıllarında Burdur Milletvekili olarak şehri Birinci Meclis'te temsil eden, hatırası bugün şehrin üniversitesinde ve kültür hayatında yaşayan İstiklal Şairi.",
        "**Hamitoğlu Dündar Bey:** 14. yüzyılda Burdur Ulu Camii'ni inşa ettirerek şehre kalıcı bir Beylikler Dönemi mührü vuran yönetici.",
        "**Teke Yöresi Halk Ozanları (Tepeli Hasan, Kadir Türen vb.):** Sipsi ve üç telli cura geleneğini kuşaktan kuşağa aktaran gönül insanları."
      ]
    },
    "03_Akdeniz/Hatay": {
      "plate": 31,
      "name": "Hatay",
      "region": "Akdeniz",
      "region_code": "03_Akdeniz",
      "lat": 36.2023,
      "lng": 36.1613,
      "landmarks": [
        "Habib-i Neccar Camii",
        "St. Pierre Kilisesi",
        "Titus Tüneli & Beşikli Mağara",
        "Arkeoloji Müzesi"
      ],
      "specialties": [
        "Künefe",
        "Tepsi Kebabı",
        "Humus",
        "Muhammara",
        "Oruk (İçli Köfte)"
      ],
      "quote": "Medeniyetlerin, dinlerin ve kadim lezzetlerin bir arada kardeşçe yaşadığı ibret ve vefa şehri.",
      "library": "Hatay İl Halk Kütüphanesi - Tarihi dokusuyla ilham verici, sessiz çalışma odaları tefekkür ve kodlama için çok uygun.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "03_Akdeniz/Hatay/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "03_Akdeniz/Hatay/gallery.jpg",
      "images": [
        "03_Akdeniz/Hatay/banner.jpg",
        "03_Akdeniz/Hatay/gallery.jpg"
      ],
      "readme_rel": "03_Akdeniz/Hatay/README.md",
      "slug": "Hatay",
      "content_size": 4864,
      "custom_quote": "Dinlerin ve dillerin kardeşçe kucaklaştığı, tarihin en eski yerleşim yerlerinden biri olan hoşgörü başkenti.",
      "custom_library": "Hatay İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Antik çağın en büyük metropollerinden biri olan Antakya (Hatay), ilk Hristiyanların toplandığı ve İslamiyet'in Anadolu'daki ilk camisinin inşa edildiği mukaddes bir şehirdir.",
      "literary_quotes": [
        "\"Hatay benim şahsi meselemdir.\" — Mustafa Kemal Atatürk",
        "\"Medeniyetlerin beşiği, dinlerin ve dillerin kardeşçe kucaklaştığı mukaddes toprak.\" — Cemil Meriç"
      ],
      "reflection": "Habib-i Neccar Camii'nin manevi ikliminde, inancın ve sevginin birleştirici gücünü tefekkür eder, Titus Tüneli'nin devasa kayalarında insan azmini görürsünüz.",
      "spiritual_figures": [
        "**Habib-i Neccar (r.a.):** Kur'an-ı Kerim'de Yâsîn Suresi'nde anılan, hakikat uğruna canını feda eden ve Anadolu'nun ilk camisinde kabri bulunan büyük mümin.",
        "**Ebû Ubeyde bin Cerrâh (r.a.):** Antakya'nın fethini gerçekleştiren, \"Ümmetin Emîni\" lakaplı sahabe komutan.",
        "**Cemil Meriç:** Reyhanlı doğumlu, Doğu ile Batı arasında köprü kuran *Bu Ülke* ve *Mağaradakiler* müellifi büyük mütefekkir.",
        "**Tayfur Sökmen:** Hatay Devleti'nin ilk ve tek Cumhurbaşkanı olarak şehrin anavatana katılış sürecine öncülük eden devlet adamı."
      ],
      "five_day_plan": [
        "**1. Gün – Kadim Antakya ve Manevi Çekirdek:** Sabah İl Halk Kütüphanesi mesaisi; ikindi sonrası **Habib-i Neccar Camii**, tarihi **Kurtuluş Caddesi** ve **Uzun Çarşı** rotasında medeniyet izlerini adımlamak.",
        "**2. Gün – Mozaikler ve İlk Mağara Kilise:** Kütüphane sonrası dünyanın en zengin mozaik koleksiyonlarından birini barındıran **Hatay Arkeoloji Müzesi** ve ardından **St. Pierre Kilisesi** ziyareti.",
        "**3. Gün – Samandağ ve Roma Mühendisliği:** **Titus Tüneli**, **Beşikli Mağara** ve **Vakıflı Köyü** rotasında Akdeniz rüzgarı eşliğinde tarih yolculuğu.",
        "**4. Gün – Harbiye Şelaleleri ve Payas Külliyesi:** **Harbiye (Defne) Şelaleleri**'nde doğa molası, kuzeyde ise Mimar Sinan eseri **Sokollu Mehmet Paşa Külliyesi (Payas)** ve **İskenderun Sahili**.",
        "**5. Gün – Cemil Meriç'in İzinde ve Veda:** Reyhanlı ve Amik Ovası ufkunda tefekkür, kütüphanede son okumalar ve seyahatname notlarının tamamlanması."
      ]
    },
    "03_Akdeniz/Isparta": {
      "plate": 32,
      "name": "Isparta",
      "region": "Akdeniz",
      "region_code": "03_Akdeniz",
      "lat": 37.7648,
      "lng": 30.5566,
      "landmarks": [
        "Eğirdir Gölü",
        "Kuyucak Lavanta Köyü",
        "Kovada Gölü Milli Parkı",
        "Firdevs Bey Camii"
      ],
      "specialties": [
        "Isparta Kebabı (Fırın Kebap)",
        "Gül Lokumu & Gül Reçeli",
        "Kabune Pilavı"
      ],
      "quote": "Güllerin ve lavantaların kokusuyla bezenmiş, Eğirdir Gölü'nün masmavi sükunetinde huzur bulunan diyar.",
      "library": "Isparta Halil Hamit Paşa İl Halk Kütüphanesi - Şehir merkezinde, sessiz çalışma alanları geniş ve ferah.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "03_Akdeniz/Isparta/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "03_Akdeniz/Isparta/gallery.jpg",
      "images": [
        "03_Akdeniz/Isparta/banner.jpg",
        "03_Akdeniz/Isparta/gallery.jpg"
      ],
      "readme_rel": "03_Akdeniz/Isparta/README.md",
      "slug": "Isparta",
      "content_size": 4809,
      "custom_quote": "Güllerin ve lavantaların kokusuyla bezenmiş, göller yöresinin incisi, doğa harikası şehir.",
      "custom_library": "Isparta İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Pisidya bölgesinde yer alan Isparta, Selçuklu ve Hamitoğulları beyliği dönemlerinde önemli bir kültür merkezi olmuş, günümüzde gül tarımıyla dünyaya açılmıştır.",
      "literary_quotes": [
        "\"Isparta, güllerin kokusunda cennet bahçelerinden bir esintidir.\" — Evliya Çelebi",
        "\"Eğirdir, dağların arasında mavi bir ayna gibidir.\" — Seyyah İbn Battûta"
      ],
      "reflection": "Eğirdir Gölü'nün sakin sularında, doğanın sunduğu huzuru ve yaratılışın estetiğini tefekkür edersiniz.",
      "spiritual_figures": [
        "**Şeyhülislam Burhaneddin-i Eğirdirî ve Pîrî Halife Sultan:** Eğirdir ve Isparta havalisinde ilim ve irfan halkaları kuran gönül sultanları.",
        "**Halil Hamit Paşa:** Osmanlı sadrazamı olarak Isparta'ya kendi adını taşıyan köklü kütüphaneyi ve vakıf eserlerini armağan eden devlet adamı.",
        "**Müftüzâde İsmail Efendi:** 19. yüzyıl sonunda Bulgaristan'dan getirdiği gül fidanlarıyla Isparta'yı \"Güller Diyarı\"na dönüştüren öncü isim.",
        "**Mimar Sinan'ın İzinde Firdevs Bey:** Isparta'nın en zarif klasik Osmanlı eseri olan **Firdevs Bey (Mimar Sinan) Camii**'nin banisi."
      ],
      "five_day_plan": [
        "**1. Gün – Şehir Merkezi ve Osmanlı Mirası:** Sabah İl Halk Kütüphanesi mesaisi; ikindi sonrası **Firdevs Bey (Mimar Sinan) Camii**, **Üzüm Pazarı**, **Kutlubey Ulu Camii** ve **Isparta Etnografya Halı Müzesi**.",
        "**2. Gün – Yedi Renkli Eğirdir Gölü:** Kütüphane sonrası **Eğirdir Kalesi**, **Hızırbey Camii**, **Dündar Bey Medresesi**, **Yeşilada** yürüyüşü ve gölde gün batımı tefekkürü.",
        "**3. Gün – Morun ve Gülün İzinde:** **Kuyucak Lavanta Köyü** (Keçiborlu) ve **Güneykent Gül Bahçeleri** rotasında Göller Yöresi'nin kokusunu ve kırsal yaşamını keşif.",
        "**4. Gün – Pisidya'nın Kanyonu ve Milli Park:** Sütçüler yönünde **Yazılı Kanyon Tabiat Parkı** (Epiktetos'un \"Hür İnsan\" yazıtı) ve **Kovada Gölü Milli Parkı** yürüyüşü.",
        "**5. Gün – Yalvaç Antiocheia ve Veda:** **Pisidia Antiocheia Antik Kenti** veya **Gökçay Mesireliği**'nde son okumalar, seyahatname notlarının tamamlanması."
      ]
    },
    "03_Akdeniz/Kahramanmaras": {
      "plate": 46,
      "name": "Kahramanmaraş",
      "region": "Akdeniz",
      "region_code": "03_Akdeniz",
      "lat": 37.5753,
      "lng": 36.9228,
      "landmarks": [
        "Maraş Kalesi",
        "Ulu Cami",
        "Taş Medrese",
        "Eshab-ı Kehf Külliyesi (Afşin)"
      ],
      "specialties": [
        "Maraş Dondurması",
        "Maraş Tarhanası",
        "Eli Böğründe",
        "Kelle Paça"
      ],
      "quote": "Yedi Güzel Adam'ın şiir ocağı, istiklalin kahraman kalesi ve Eshab-ı Kehf'in asırlık uykusunun mekanı.",
      "library": "Kahramanmaraş İl Halk Kütüphanesi - Edebiyat ve düşünce ikliminde verimli çalışma ortamı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "03_Akdeniz/Kahramanmaras/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "03_Akdeniz/Kahramanmaras/gallery.jpg",
      "images": [
        "03_Akdeniz/Kahramanmaras/banner.jpg",
        "03_Akdeniz/Kahramanmaras/gallery.jpg"
      ],
      "readme_rel": "03_Akdeniz/Kahramanmaras/README.md",
      "slug": "Kahramanmaras",
      "content_size": 5615,
      "history": "Ahir Dağı'nın eteklerine yaslanan Kahramanmaraş, Geç Hitit döneminin **Gurgum** krallığından Roma'nın **Germanicia** kentine, Anadolu Selçukluları'ndan **Dulkadiroğulları Beyliği**'ne kadar kesintisiz bir medeniyet mirası taşır. 1920'de kendi imkânlarıyla yürüttüğü direnişle İstiklal Madalyası alan ve \"Kahraman\" unvanını kazanan şehir, aynı zamanda modern Türk edebiyatının en güçlü damarlarından biri olan **Yedi Güzel Adam** geleneğinin doğduğu, UNESCO Edebiyat Şehri unvanlı bir kültür başkentidir.",
      "literary_quotes": [
        "\"Maraş, bir şehirden fazlasıdır; bir şiir iklimi, bir direniş ahlakı ve kalbin Anadolu'ya açılan kapısıdır.\" — Yedi Güzel Adam Mirası",
        "\"Bir de kuşlar var hâkim bey, her şeyin başı onlar; gökyüzü Maraş'ın üstünde başka türlü bir genişlik taşır.\" — Cahit Zarifoğlu'nun İzinde"
      ],
      "spiritual_figures": [
        "**Yedi Güzel Adam (Cahit Zarifoğlu, Erdem Bayazıt, Rasim Özdenören, Nuri Pakdil, Alaeddin Özdenören, Mehmet Akif İnan, Ali Kutlay):** Maraş Lisesi sıralarından başlayarak Türk düşünce, şiir ve öykü dünyasına yön veren edebiyat ve fikir çınarları.",
        "**Sütçü İmam & Rıdvan Hoca:** Maraş Millî Mücadelesi'nin kıvılcımını yakan, \"Hürriyeti olmayan bir milletin cuma namazı kılması caiz değildir\" diyerek bağımsızlık ruhunu ateşleyen öncüler.",
        "**Alâüddevle Bozkurt Bey (Dulkadiroğulları):** Kahramanmaraş Ulu Camii, Taş Medrese ve Hatuniye Camii ile şehre mimari kimliğini kazandıran beylik lideri.",
        "**Abdurrahim Karakoç & Âşık Mahzuni Şerif:** Elbistan ve Afşin topraklarından yükselip Anadolu'nun sevdasını, acısını ve hicvini dizelere döken büyük halk ozanları."
      ]
    },
    "03_Akdeniz/Mersin": {
      "plate": 33,
      "name": "Mersin",
      "region": "Akdeniz",
      "region_code": "03_Akdeniz",
      "lat": 36.8121,
      "lng": 34.6415,
      "landmarks": [
        "Kızkalesi",
        "Cennet-Cehennem Obrukları",
        "Kanlıdivane",
        "Tarsus Eshab-ı Kehf Mağarası",
        "St. Paul Kuyusu"
      ],
      "specialties": [
        "Tantuni",
        "Cezerye",
        "Kerebiç",
        "Tarsus Şalgamı"
      ],
      "quote": "Palmiyeli sahil şeridi, Torosların yaylaları ve Tarsus'un asırlara meydan okuyan manevi derinliği.",
      "library": "Mersin İl Halk Kütüphanesi - Sahile yakın, ferah çalışma masaları ve deniz manzaralı dinlenme alanlarıyla motivasyon verici.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "03_Akdeniz/Mersin/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "03_Akdeniz/Mersin/gallery.jpg",
      "images": [
        "03_Akdeniz/Mersin/banner.jpg",
        "03_Akdeniz/Mersin/gallery.jpg"
      ],
      "readme_rel": "03_Akdeniz/Mersin/README.md",
      "slug": "Mersin",
      "content_size": 4934,
      "custom_quote": "Akdeniz kıyısında uzanan palmiyeleri, Kızkalesi ve antik kentleriyle tarihin denizle buluştuğu liman kent.",
      "custom_library": "Mersin İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Yumuktepe höyüğüyle 9000 yıllık geçmişe sahip olan Mersin, Klikya'nın kapısı olmuş ve Osmanlı'nın son döneminde büyük bir ticaret limanına dönüşmüştür.",
      "literary_quotes": [
        "\"Mersin, Akdeniz'in parlayan yıldızı, tarihin denizle kucaklaştığı yerdir.\" — Özdemir İnce",
        "\"Kızkalesi, dalgaların ortasında yükselen bir efsane abidesidir.\" — Evliya Çelebi"
      ],
      "reflection": "Kizkalesi'nin açıklarında denizin dalgalarını dinlerken, insan yapısı kalelerin bile zamanın aşındırmasına karşı duramayacağını tefekkür edersiniz.",
      "spiritual_figures": [
        "**Hz. Danyal (a.s.) ve Lokman Hekim:** Tarsus'un kadim tarihinde makamı ve hikmet mirasıyla şehre manevi derinlik katan peygamber ve bilge.",
        "**Bilâl-i Habeşî (r.a.) Makamı ve Ashab-ı Kehf (Tarsus):** Kur'an kıssalarının ve erken İslam tarihinin Anadolu'daki en güçlü yankılarından biri olan Tarsus'un manevi mirası.",
        "**Halife Me'mûn:** Abbâsî halifesi olarak Tarsus'ta vefat edip defnedilen, ilim ve tercüme hareketlerinin öncüsü.",
        "**Karacaoğlan (Mut & Toros Yaylaları):** Mersin'in Mut ilçesi ve Toros yaylalarında sazının teli hâlâ çınlayan büyük halk şairi."
      ],
      "five_day_plan": [
        "**1. Gün – Mersin Merkez ve 9000 Yıllık Höyük:** Sabah İl Halk Kütüphanesi mesaisi; ikindi sonrası **Yumuktepe Höyüğü**, **Mersin Deniz Müzesi**, **Muğdat Camii** ve palmiyeli sahil yürüyüşü.",
        "**2. Gün – Tarsus'un Manevi ve Kadim Rotası:** **Tarsus Ulu Camii**, **Makam-ı Danyal Camii**, **Nusret Mayın Gemisi Parkı**, **Kleopatra Kapısı**, **St. Paul Kuyusu** ve **Tarsus Eshab-ı Kehf Mağarası**.",
        "**3. Gün – Kilikya'nın Kıyısında (Kızkalesi & Kanlıdivane):** Erdemli-Silifke hattında **Kanlıdivane Antik Kenti**, **Adamkayalar** ve gün batımında **Kızkalesi (Korykos)** seyri.",
        "**4. Gün – Yer Altı ve Gök Arasında (Cennet-Cehennem & Astım Mağarası):** **Cennet ve Cehennem Obrukları**, **Astım Mağarası** ve **Narlıkuyu Mozaik Müzesi** rotası.",
        "**5. Gün – Soli Pompeiopolis ve Veda:** Mezitli'deki **Soli Pompeiopolis Sütunlu Caddesi** ziyareti, kütüphanede çalışma haftasının kapatılması ve seyahatname notlarının güncellenmesi."
      ]
    },
    "03_Akdeniz/Osmaniye": {
      "plate": 80,
      "name": "Osmaniye",
      "region": "Akdeniz",
      "region_code": "03_Akdeniz",
      "lat": 37.0746,
      "lng": 36.2464,
      "landmarks": [
        "Kastabala Antik Kenti",
        "Toprakkale Kalesi",
        "Karatepe-Aslantaş Açık Hava Müzesi"
      ],
      "specialties": [
        "Osmaniye Yer Fıstığı",
        "Tırşık Çorbası",
        "Kömeç"
      ],
      "quote": "Çukurova'nın doğu kapısı, Hitit kalıntılarının ve kaleler kuşağının nöbet tuttuğu geçit.",
      "library": "Osmaniye Emine Keskiner İl Halk Kütüphanesi - Sessiz, düzenli çalışma ortamı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "03_Akdeniz/Osmaniye/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "03_Akdeniz/Osmaniye/gallery.jpg",
      "images": [
        "03_Akdeniz/Osmaniye/banner.jpg",
        "03_Akdeniz/Osmaniye/gallery.jpg"
      ],
      "readme_rel": "03_Akdeniz/Osmaniye/README.md",
      "slug": "Osmaniye",
      "content_size": 5612,
      "history": "Amanos (Nur) Dağları ile Ceyhan Nehri'nin bereketli ovası arasında uzanan Osmaniye, tarih boyunca Anadolu ile Suriye ve Mezopotamya'yı birbirine bağlayan stratejik geçitlerin bekçisi olmuştur. Kadirli yakınlarındaki **Karatepe-Aslantaş Açık Hava Müzesi**, M.Ö. 8. yüzyıldan kalma Fenike ve Luvi dillerindeki çift dilli yazıtlarıyla Hitit hiyerogliflerinin çözülmesini sağlayan dünya çapında bir arkeolojik hazinedir. \"Kaleler Diyarı\" olarak anılan şehirde **Toprakkale**, **Bodrumkale (Kastabala)** ve **Hemite Kalesi** ovaya hâkim tepelerde asırlardır nöbet tutar.",
      "literary_quotes": [
        "\"Karatepe'nin taşlarına kazınmış o çift dilli yazıtlar, Anadolu'nun unutulmuş dilini yeniden insanlığa konuşturmuştur.\" — Arkeoloji Tarihi Notları",
        "\"Hemite'nin sırtlarından Çukurova'ya bakınca, toprağın bereketi ile Toroslar'ın vakarı tek bir ufukta birleşir.\" — Çukurova Seyahat Notları"
      ],
      "spiritual_figures": [
        "**Prof. Dr. Halet Çambel:** Karatepe-Aslantaş kazılarını ömrü boyunca sürdürerek Türkiye'nin ilk açık hava müzesini kuran, bölgenin kilim ve kültür mirasını da koruyan öncü arkeolog.",
        "**Yaşar Kemal:** Osmaniye'nin Hemite (Gökçedam) köyünde doğup büyüyen, çocukluk hafızasındaki Çukurova'yı ve Toros efsanelerini *İnce Memed* ile dünya edebiyatına armağan eden büyük romancı.",
        "**Karacaoğlan:** Osmaniye, Düziçi ve Bahçe yaylalarında izleri ve şelalesiyle anılan, Akdeniz'in duru Türkçe şairi.",
        "**Kadirli Ala Cami Mirası:** Roma tapınağı, Bizans kilisesi ve Dulkadiroğlu camisi katmanlarını tek bünyede barındıran, medeniyet sürekliliğinin simgesi."
      ]
    },
    "04_IcAnadolu/Aksaray": {
      "plate": 68,
      "name": "Aksaray",
      "region": "İç Anadolu",
      "region_code": "04_IcAnadolu",
      "lat": 38.3687,
      "lng": 34.037,
      "landmarks": [
        "Ihlara Vadisi",
        "Somuncu Baba Türbesi",
        "Sultanhanı Kervansarayı",
        "Eğri Minare"
      ],
      "specialties": [
        "Aksaray Tava",
        "Şerbetsiz Şekerpare",
        "Köpük Helva"
      ],
      "quote": "Somuncu Baba'nın fırınındaki sır, Ihlara Vadisi'nin derin tefekkürü ve İpekyolu'nun ulu kervansarayları.",
      "library": "Aksaray İl Halk Kütüphanesi - Bozkırın ortasında modern ve sessiz bir çalışma alanı.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "04_IcAnadolu/Aksaray/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "04_IcAnadolu/Aksaray/gallery.jpg",
      "images": [
        "04_IcAnadolu/Aksaray/banner.jpg",
        "04_IcAnadolu/Aksaray/gallery.jpg"
      ],
      "readme_rel": "04_IcAnadolu/Aksaray/README.md",
      "slug": "Aksaray",
      "content_size": 6023,
      "custom_quote": "Ihlara Vadisi'nin dik yamaçları arasında, Melendiz Çayı'nın şırıltısıyla demlenen bozkırın mistik kapısı.",
      "custom_library": "Aksaray İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Kapadokya'nın batı kapısı olan Aksaray, Selçuklu döneminde İpekyolu'nun en güvenli ve zengin konaklama merkezlerinden biri olmuştur. Neolitik çağın Anadolu'daki en eski yerleşimlerinden Aşıklı Höyük'ten, Hititlerin ve Kapadokya Krallığı'nın izlerine, II. Kılıç Arslan'ın \"Şehr-i Süleha\" (Salihler Şehri) diye adlandırdığı ve imar ettiği Selçuklu kervansaraylarına kadar uzanan derin bir hafızaya sahiptir. Hasan Dağı'nın vakur gölgesinde şekillenen şehir, Sultanhanı Kervansarayı ile Anadolu ticaret ve ilim yollarının kalbi olmuş; taş işçiliği, vakıf kültürü ve tasavvuf geleneğiyle bozkırda sarsılmaz bir medeniyet kurmuştur.",
      "literary_quotes": [
        "\"Aksaray, Selçuklu'nun adil kalesi, bozkırın ortasındaki ilim yuvasıdır.\" — İbn Battûta",
        "\"Ihlara, yer altında akan nehrin ve kayalara oyulmuş mabetlerin vadisidir.\" — Evliya Çelebi"
      ],
      "reflection": "Ihlara Vadisi'nin derinliklerinde yürürken, doğanın sabırla kayayı nasıl oyduğunu ve ilk Hristiyanların sığındığı mağaralardaki tefekkür dünyasını hissedersiniz. Akşam ezanına doğru Somuncu Baba Külliyesi'nin avlusunda oturup Ervah Kabristanı'ndan şehrin ışıklarını seyrederken, \"şöhret afettir\" düsturuyla sırrını ekmek kokusuna gizleyen dervişlerin tevazusu kalbinize dokunur.",
      "spiritual_figures": [
        "**Somuncu Baba (Şeyh Hamid-i Veli Hazretleri):** Bursa Ulu Camii'nin açılış hutbesinin ardından şöhretten kaçarak Aksaray'a yerleşen, Hacı Bayram-ı Veli'nin mürşidi ve gönül mimarı. Ervah Kabristanı'nın sırtlarında yer alan külliyesi, şehrin en dingin manevi durağıdır.",
        "**Taptuk Emre:** Yunus Emre'nin dergâhında kırk yıl eğri odun dahi taşımadan piştiği büyük mutasavvıfın adı Aksaray'ın Ekecik bölgesindeki yerleşim ve rivayetlerde yaşatılır.",
        "**Cemaleddin Aksarayî:** XIV. yüzyılda Zinciriye Medresesi'nde dersler vererek Anadolu'da ilim geleneğini güçlendiren büyük müderris ve tabip; Molla Fenari'nin de hocasıdır.",
        "**II. Kılıç Arslan:** Aksaray'ı saraylar, medreseler ve kervansaraylarla donatarak şehre \"Darü'z-Zafer\" ve \"Darü'r-Ribat\" unvanlarını kazandıran Anadolu Selçuklu Sultanı."
      ],
      "five_day_plan": [
        "**1. Gün — Şehir Merkezi ve Selçuklu Mirası:** Sabah İl Halk Kütüphanesi'nde çalışma; öğleden sonra **Eğri Minare (Kızıl Minare)**, **Ulu Camii**, **Zinciriye Medresesi** ve tarihi çarşı yürüyüşü.",
        "**2. Gün — Somuncu Baba ve Manevi Tefekkür:** Sabah mesaisi sonrası **Somuncu Baba Külliyesi ve Türbesi**, **Ervah Kabristanı** ve **Cemaleddin Aksarayî Türbesi** ziyareti; gün batımında Hasan Dağı manzarası.",
        "**3. Gün — Ihlara Vadisi ve Belisırma:** Tüm gün doğa ve tarih yürüyüşü; **Ihlara Vadisi**'nden başlayarak Melendiz Çayı boyunca **Ağaçaltı ve Yılanlı Kiliseleri**, **Belisırma** molası ve **Selime Katedrali** keşfi.",
        "**4. Gün — İpekyolu'nun İncisi Sultanhanı:** Sabah kütüphane oturumu; öğleden sonra Anadolu'nun en görkemli Selçuklu hanı **Sultanhanı Kervansarayı**'na yolculuk ve taş işçiliği incelemesi.",
        "**5. Gün — Güzelyurt, Aşıklı Höyük ve Veda:** **Güzelyurt (Gelveri)** taş konakları, **Yüksek Kilise**, **Manastır Vadisi** ve insanlık tarihinin en eski yerleşimlerinden **Aşıklı Höyük** ziyaretiyle şehre veda."
      ]
    },
    "04_IcAnadolu/Ankara": {
      "plate": 6,
      "name": "Ankara",
      "region": "İç Anadolu",
      "region_code": "04_IcAnadolu",
      "lat": 39.9334,
      "lng": 32.8597,
      "landmarks": [
        "Hacı Bayram-ı Veli Camii",
        "Ankara Kalesi",
        "Anıtkabir",
        "Augustus Tapınağı",
        "Hamamönü"
      ],
      "specialties": [
        "Ankara Döneri",
        "Ankara Simidi",
        "Beypazarı Kurusu",
        "Çubuk Turşusu"
      ],
      "quote": "Bozkırın kalbinde Hacı Bayram-ı Veli'nin manevi muhafızlığında kurulan cumhuriyetin payitahtı.",
      "library": "Milli Kütüphane / Cumhurbaşkanlığı Millet Kütüphanesi - Türkiye'nin en görkemli ilim mabetleri; 7/24 çalışma, devasa kaynak arşivi ve üst düzey konsantrasyon.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "04_IcAnadolu/Ankara/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "04_IcAnadolu/Ankara/gallery.jpg",
      "images": [
        "04_IcAnadolu/Ankara/banner.jpg",
        "04_IcAnadolu/Ankara/gallery.jpg"
      ],
      "readme_rel": "04_IcAnadolu/Ankara/README.md",
      "slug": "Ankara",
      "content_size": 6036,
      "custom_quote": "Vakur ve tarihi Ankara, Türkiye Cumhuriyeti'nin kalbi, bozkırın ortasında yükselen azim ve kararlılık abidesi.",
      "custom_library": "Ankara İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası. (Ayrıca Milli Kütüphane ve Cumhurbaşkanlığı Millet Kütüphanesi de şehirdeki ilim mesaisi için eşsiz alternatiflerdir.)",
      "history": "Hititlerden Friglere, Romalılardan Selçuklulara uzanan tarihiyle Ankara, 1923'te Türkiye Cumhuriyeti'nin başkenti ilan edilerek modern tarihin dönüm noktası olmuştur. Roma döneminden kalma Augustus Tapınağı'nın hemen bitişiğinde Hacı Bayram-ı Veli Camii'nin yükselmesi, bu şehrin katmanlı medeniyet hafızasının en somut nişanesidir. Bir yanda Ahi Cumhuriyeti döneminin esnaf ahlakı ve Hamamönü'nün ahşap konakları, diğer yanda Ulus'taki Birinci ve İkinci Meclis binalarından Anıtkabir'e uzanan Milli Mücadele ruhu, Ankara'yı yalnızca idari bir merkez değil, derin bir tarih ve irfan başkenti kılar.",
      "literary_quotes": [
        "\"Ankara, bozkırın kalbinde yanan sönmez bir meşaledir.\" — Yahya Kemal Beyatlı",
        "\"Ankara Kalesi, asırlar boyu bozkırın ufkunu bekleyen vakur bir nöbetçidir.\" — Ahmet Hamdi Tanpınar"
      ],
      "reflection": "Anıtkabir'de kurucu iradenin büyüklüğünü ve milletin bağımsızlık aşkını tefekkür eder; Ankara Kalesi'nin surlarından bozkırın ufkunu izlerken geçmiş medeniyetleri düşünürsünüz. Taceddin Dergâhı'nın sessiz avlusunda İstiklal Marşı'nın yazıldığı odaya bakmak ve hemen ardından Hacı Bayram Camii'nin taş duvarlarına yaslanıp Augustus Tapınağı ile yan yana duran tarihe şahit olmak, Ankara'nın dışarıdan soğuk sanılan çehresinin ardındaki sıcak ruhu ortaya çıkarır.",
      "spiritual_figures": [
        "**Hacı Bayram-ı Veli Hazretleri:** Bayramiyye tarikatının kurucusu, Anadolu'da Türkçeyi, imeceyi ve gönül birliğini mayalayan büyük mutasavvıf; İstanbul'un fethini müjdeleyen Akşemseddin'in mürşidi.",
        "**Gazi Mustafa Kemal Atatürk:** Milli Mücadele'yi Ankara'dan yöneten ve Türkiye Cumhuriyeti'ni bozkırın kalbinde inşa eden kurucu lider; ebedi istirahatgâhı Anıtkabir, şehrin manevi ufkunu belirler.",
        "**Mehmet Âkif Ersoy:** İstiklal Marşı'nı Ankara'da, bugün müze olan **Taceddin Dergâhı**'nda kaleme alan milli şair.",
        "**Ahi Şerafeddin (Arslanhane):** XIV. yüzyılda Ankara'da Ahilik teşkilatının önderliğini yapan ve adını şehrin en eski ahşap direkli Selçuklu camilerinden Arslanhane Camii'ne veren gönül eri."
      ],
      "five_day_plan": [
        "**1. Gün — Cumhuriyetin Kalbi ve Ulus:** Sabah kütüphane mesaisi; öğleden sonra **Anıtkabir**, **I. ve II. TBMM (Kurtuluş Savaşı ve Cumhuriyet Müzeleri)** ve **Etnografya Müzesi** ziyareti.",
        "**2. Gün — Kadim Ankara ve Kale Yamaçları:** **Ankara Kalesi**, **Anadolu Medeniyetleri Müzesi**, **Arslanhane (Ahi Şerafeddin) Camii** ve **Rahmi M. Koç Müzesi** yürüyüşü.",
        "**3. Gün — Maneviyat ve Edebiyat Ekseni:** **Hacı Bayram-ı Veli Camii ve Türbesi**, **Augustus Tapınağı**, **Hamamönü Tarihi Evleri** ve Mehmet Âkif'in izinde **Taceddin Dergâhı**.",
        "**4. Gün — Doğa, Göller ve Modern Ankara:** Sabah Millet Kütüphanesi'nde verimli çalışma; öğleden sonra **Eymir Gölü**'nde bisiklet/yürüyüş, **Kuğulu Park** ve **Atakule** panoraması.",
        "**5. Gün — Beypazarı veya Gordion Kaçamağı:** Tarihi ipek yolu kasabası **Beypazarı** (İnözü Vadisi, Yaşayan Müze) ya da UNESCO listesindeki Frig başkenti **Gordion Antik Kenti** ziyaretiyle Ankara menzilinin tamamlanması."
      ]
    },
    "04_IcAnadolu/Cankiri": {
      "plate": 18,
      "name": "Çankırı",
      "region": "İç Anadolu",
      "region_code": "04_IcAnadolu",
      "lat": 40.6013,
      "lng": 33.6134,
      "landmarks": [
        "Tarihi Tuz Mağarası",
        "Çankırı Kalesi",
        "Taş Mescit (Şifahane)",
        "Çavundur Kaplıcaları"
      ],
      "specialties": [
        "Yaren Güveci",
        "Cimcik Hamuru",
        "Yumurta Tatlısı"
      ],
      "quote": "Yer altındaki devasa tuz şehri, Selçuklu Taş Mescidi ve yarenlik kültürünün kadim edep diyarı.",
      "library": "Çankırı İl Halk Kütüphanesi - Yarenler diyarında sakin ve samimi bir ilim yuvası.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "04_IcAnadolu/Cankiri/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "04_IcAnadolu/Cankiri/gallery.jpg",
      "images": [
        "04_IcAnadolu/Cankiri/banner.jpg",
        "04_IcAnadolu/Cankiri/gallery.jpg"
      ],
      "readme_rel": "04_IcAnadolu/Cankiri/README.md",
      "slug": "Cankiri",
      "content_size": 5766,
      "history": "İç Anadolu ile Batı Karadeniz'in kucaklaştığı eşikte, Acıçay ve Tatlıçay vadilerinin arasında yükselen Çankırı (kadim adıyla *Gangra*); Hititler, Paflagonyalılar, Romalılar, Danişmendliler, Anadolu Selçukluları, Candaroğulları ve Osmanlıların izlerini taşıyan vakur bir Anadolu kentidir. 1074 yılında Emir Karatekin Bey tarafından fethedilerek Anadolu'daki ilk Türk-İslam şehirlerinden biri olan Çankırı; XIII. yüzyılda inşa edilen **Taş Mescit (Cemaleddin Ferruh Darüşşifası ve Darülhadisi)** ile Selçuklu'nun şifa ve ilim geleneğini günümüze ulaştırır. Hititlerden bu yana işlenen devasa **Tuz Mağarası**, Kurtuluş Savaşı'nda İnebolu'dan Ankara'ya cephane taşıyan **İstiklal Yolu** üzerindeki stratejik konumu ve UNESCO Somut Olmayan Kültürel Miras Listesi'ndeki **Yaren Kültürü** ile Çankırı, keşfedilmeyi bekleyen sahici bir kültür hazinesidir.",
      "literary_quotes": [
        "\"Ilgaz, Anadolu'nun sen yüce bir dağısın; baharda yeryüzünde o cennetin bağısın.\" — Ahmet Cemil (Ilgaz Türküsü)",
        "\"Çankırı'da Yaren meclisine giren, yalnızca saz ve söz değil; dostluğun, adaletin ve Anadolu terbiyesinin canlı kitabını okur.\" — Anadolu Kültür Notları"
      ],
      "spiritual_figures": [
        "**Yaren Kültürü ve Ahilik Geleneği:** Ahilik teşkilatının İç Anadolu'daki en canlı sosyal uzantısı olan Çankırı Yaren meclisleri; Başağa, Küçük Başağa ve Reis öncülüğünde kış gecelerinde toplanan, edep, dayanışma, musiki, orta oyunu ve toplumsal ahlakı nesilden nesle aktaran eşsiz bir gönül mektebidir.",
        "**Emir Karatekin Bey:** Malazgirt sonrası Çankırı'yı fetheden ve şehrin kalesinde medfun bulunan ilk Türk fatihi; şehrin tarihi hafızasının kurucu ismidir.",
        "**Atabey Cemaleddin Ferruh:** 1235 yılında Taş Mescit Darüşşifası'nı yaptırarak Çankırı'yı Selçuklu tıp ve hadis eğitiminin merkezlerinden biri hâline getiren devlet adamı.",
        "**Ahmet Mecbur Efendi ve Hacı Murad-ı Veli (Eldivan):** Bölgenin tasavvuf hayatını ve irfan geleneğini şekillendiren, halkın gönlünde derin izler bırakmış manevi önderler."
      ]
    },
    "04_IcAnadolu/Eskisehir": {
      "plate": 26,
      "name": "Eskişehir",
      "region": "İç Anadolu",
      "region_code": "04_IcAnadolu",
      "lat": 39.7767,
      "lng": 30.5206,
      "landmarks": [
        "Odunpazarı Evleri",
        "Kurşunlu Külliyesi",
        "Porsuk Çayı & Adalar",
        "Yunus Emre Türbesi (Mihalıççık)",
        "Yazılıkaya Midas"
      ],
      "specialties": [
        "Çibörek",
        "Balaban Köfte",
        "Met Helvası",
        "Haşhaşlı Ekmek"
      ],
      "quote": "Yunus Emre'nin 'Gelin tanış olalım' davetinin yankılandığı, sanatla yıkanmış dinamik bir kültür kenti.",
      "library": "Eskişehir İl Halk Kütüphanesi - Genç nüfusun yoğun olduğu, dinamik, internet hızı yüksek ve priz imkanı bol olan modern kütüphane.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "04_IcAnadolu/Eskisehir/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "04_IcAnadolu/Eskisehir/gallery.jpg",
      "images": [
        "04_IcAnadolu/Eskisehir/banner.jpg",
        "04_IcAnadolu/Eskisehir/gallery.jpg"
      ],
      "readme_rel": "04_IcAnadolu/Eskisehir/README.md",
      "slug": "Eskisehir",
      "content_size": 5826,
      "custom_quote": "Porsuk Çayı'nın iki yakasında yükselen, gençliğin, sanatın ve Odunpazarı'nın tarihi evlerinin harmanlandığı kültür şehri.",
      "custom_library": "Eskisehir İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Frigya döneminin önemli yerleşimlerinden olan Eskişehir (Dorylaion), Selçuklu ve Osmanlı döneminde de stratejik bir geçiş noktası ve kültür merkezi olmuştur. Anadolu'da Türkçenin gönül diliyle mayalandığı Sivrihisar ve Mihalıççık havzası, Osmanlı'nın ilk hutbesinin okunduğu Karacahisar Kalesi, Kırım ve Balkan muhacirlerinin şehre kattığı zarif şehir kültürü ve Cumhuriyet döneminin demiryolu ile havacılık hamleleri Eskişehir'e kendine has bir kimlik kazandırmıştır. Bugün Porsuk Çayı boyunca uzanan modern yaşam ile Odunpazarı'nın cumbalı Osmanlı evleri aynı gökyüzü altında ahenkle yaşar.",
      "literary_quotes": [
        "\"Eskişehir, Porsuk'un suladığı modern bir vaha, Anadolu'nun gülen yüzüdür.\" — Yılmaz Büyükerşen",
        "\"Odunpazarı, ahşabın ve taşın en güzel komşuluk yaptığı tarihi mahalledir.\" — Evliya Çelebi"
      ],
      "reflection": "Odunpazarı'nın Arnavut kaldırımlı sokaklarında yürürken, geçmişin sıcak mahalle kültürünü ve ahşap konaklardaki yaşanmışlıkları tefekkür edersiniz. Kurşunlu Külliyesi'nin avlusunda lületaşı ustalarının sabrına şahit olurken, Porsuk kıyısında akşam serinliğinde yürümek; bir şehrin hem köklerine sadık kalıp hem de çağdaş, yaşanabilir bir sanat kentine dönüşebileceğini kanıtlar.",
      "spiritual_figures": [
        "**Yunus Emre:** Mihalıççık ilçesindeki Sarıköy (Yunus Emre) beldesinde medfun, \"Sevelim, sevilelim\" diyerek Anadolu irfanını Türkçe şiirin zirvesine taşıyan gönül sultanı.",
        "**Nasreddin Hoca:** Eskişehir'in Sivrihisar ilçesine bağlı Hortu köyünde doğan, ince mizahıyla Anadolu insanına hikmet ve tebessüm miras bırakan bilge.",
        "**Seyyid Battal Gazi:** Seyitgazi ilçesinde yer alan görkemli külliyesiyle Anadolu'nun fethinde ve alp-eren geleneğinde müstesna bir yere sahip destansı kahraman.",
        "**Şeyh Edebali ve Osman Gazi'nin İzleri:** Osmanlı Beyliği'nin ilk önemli fetihlerinden Karacahisar'da ilk cuma hutbesini okuyan Dursun Fakih ile erken Osmanlı hafızasının köşe taşları."
      ],
      "five_day_plan": [
        "**1. Gün — Odunpazarı ve Sanat Sokakları:** Sabah kütüphane çalışması; öğleden sonra **Odunpazarı Tarihi Evleri**, **Kurşunlu Camii ve Külliyesi**, **Lületaşı Müzesi**, **Atlıhan El Sanatları Çarşısı** ve **Odunpazarı Modern Müze (OMM)**.",
        "**2. Gün — Porsuk, Adalar ve Kent Kültürü:** **Porsuk Çayı** yürüyüşü ve gondol/bot turu, **Adalar**, **Haller Gençlik Merkezi**, **Devrim Arabası** (TÜRASAŞ) ve **Kentpark**.",
        "**3. Gün — Sazova ve Bilim:** Sabah ilim mesaisi; öğleden sonra **Sazova Bilim Kültür ve Sanat Parkı** (Masal Şatosu, Bilim Deney Merkezi, Türk Dünyası Bilim Kültür ve Sanat Merkezi).",
        "**4. Gün — Frig Vadisi ve Seyitgazi:** **Yazılıkaya (Midas Anıtı)**'nda Frig medeniyetinin kaya anıtları ve dönüşte **Seyyid Battal Gazi Külliyesi** ziyareti.",
        "**5. Gün — Yunus Emre ve Sivrihisar:** Mihalıççık'ta **Yunus Emre Türbesi ve Külliyesi**'nde manevi tefekkür; ardından ahşap direkli **Sivrihisar Ulu Camii** ve tarihi taş sokaklarla Eskişehir'e veda."
      ]
    },
    "04_IcAnadolu/Karaman": {
      "plate": 70,
      "name": "Karaman",
      "region": "İç Anadolu",
      "region_code": "04_IcAnadolu",
      "lat": 37.1759,
      "lng": 33.2287,
      "landmarks": [
        "Karaman Kalesi",
        "Hatuniye Medresesi",
        "Yunus Emre Camii",
        "Aktekke (Mader-i Mevlana) Camii",
        "Binbirkilise"
      ],
      "specialties": [
        "Karaman Guymak Tatlısı",
        "Calla Yemeği",
        "Batırık"
      ],
      "quote": "Türkçenin resmi dil ilan edildiği Karamanoğlu Mehmet Bey'in yurdu ve Mevlana'nın annesinin medfun olduğu topraklar.",
      "library": "Karaman İl Halk Kütüphanesi - Türk dilinin başkentinde sessiz çalışma salonu.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "04_IcAnadolu/Karaman/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "04_IcAnadolu/Karaman/gallery.jpg",
      "images": [
        "04_IcAnadolu/Karaman/banner.jpg",
        "04_IcAnadolu/Karaman/gallery.jpg"
      ],
      "readme_rel": "04_IcAnadolu/Karaman/README.md",
      "slug": "Karaman",
      "content_size": 5610,
      "history": "İç Anadolu bozkırının Toros Dağları'na yaslandığı bereketli eşikte kurulan Karaman (kadim adıyla *Larende*); Hitit, Frig, Roma ve Bizans dönemlerinin ardından XIII–XV. yüzyıllarda Anadolu Selçuklu'nun en güçlü varisi olan **Karamanoğulları Beyliği**'ne başkentlik yapmıştır. 13 Mayıs 1277'de Karamanoğlu Mehmet Bey'in *\"Bugünden sonra divanda, dergâhta, bargâhta, mecliste ve meydanda Türkçeden başka dil kullanılmayacaktır\"* fermanıyla tarihe **Türk Dilinin Başkenti** olarak geçen şehir; Hatuniye Medresesi'nin zarif taç kapısı, Aktekke'nin dingin avlusu, Karadağ'daki erken Hristiyanlık mirası **Binbirkilise** ve kayalara oyulmuş yüzlerce yıllık **Taşkale Tahıl Ambarları** ile keşfedilmeyi bekleyen eşsiz bir medeniyet merkezidir.",
      "literary_quotes": [
        "\"Bugünden sonra divanda, dergâhta, bargâhta, mecliste ve meydanda Türkçeden başka dil kullanılmayacaktır.\" — Karamanoğlu Mehmet Bey (13 Mayıs 1277)",
        "\"İlim ilim bilmektir / İlim kendin bilmektir / Sen kendini bilmezsin / Ya nice okumaktır.\" — Yunus Emre"
      ],
      "spiritual_figures": [
        "**Karamanoğlu Mehmet Bey:** Anadolu'da Türkçenin resmi ve edebi dil olarak kökleşmesini sağlayan büyük devlet adamı; kültür tarihimizin dönüm noktalarından biridir.",
        "**Yunus Emre:** Karaman'daki Kirişçi Mahallesi'nde bulunan **Yunus Emre Camii ve Türbesi** ile şehrin gönül hafızasında yaşayan, Türkçeyi ilahi aşkın ve insan sevgisinin dili kılan büyük mutasavvıf.",
        "**Mümine Hatun (Mâder-i Mevlânâ):** Hazreti Mevlânâ'nın Larende yıllarında burada vefat eden annesi; Karamanoğlu Alâeddin Bey tarafından yaptırılan **Aktekke (Mâder-i Mevlânâ) Camii**'nde medfundur.",
        "**Şeyh Edebali ve Piri Reis'in Kökleri:** Osmanlı'nın manevi kurucusu Şeyh Edebali'nin ve büyük denizci-kartograf Piri Reis'in ailesinin Larende (Karaman) bağlantıları, şehrin Anadolu tarihindeki merkezi rolünü gösterir."
      ]
    },
    "04_IcAnadolu/Kayseri": {
      "plate": 38,
      "name": "Kayseri",
      "region": "İç Anadolu",
      "region_code": "04_IcAnadolu",
      "lat": 38.7312,
      "lng": 35.4787,
      "landmarks": [
        "Erciyes Dağı",
        "Hunat Hatun Külliyesi",
        "Gevher Nesibe Tıp Medresesi",
        "Kayseri Kalesi",
        "Kapuzbaşı Şelaleleri"
      ],
      "specialties": [
        "Kayseri Mantısı",
        "Pastırma & Sucuk",
        "Yağlama (Şebit)",
        "Nevzine Tatlısı"
      ],
      "quote": "Erciyes'in beyaz karlı zirvesi altında Selçuklu şifahaneleri, Ahilik ahlakı ve ticaret zekasının harmanı.",
      "library": "Kayseri 75. Yıl İl Halk Kütüphanesi / Meryem Ana Şehir Kütüphanesi - Selçuklu esintili mekanlar.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "04_IcAnadolu/Kayseri/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "04_IcAnadolu/Kayseri/gallery.jpg",
      "images": [
        "04_IcAnadolu/Kayseri/banner.jpg",
        "04_IcAnadolu/Kayseri/gallery.jpg"
      ],
      "readme_rel": "04_IcAnadolu/Kayseri/README.md",
      "slug": "Kayseri",
      "content_size": 6009,
      "history": "İç Anadolu'nun en görkemli zirvesi **Erciyes Dağı**'nın (3.917 m) eteklerinde kurulan Kayseri (*Mazaka / Caesarea*); Anadolu'da yazılı tarihin başladığı **Kültepe (Kaniş-Karum)** çivi yazılı tabletlerinden (MÖ 2000) Hitit, Kapadokya, Roma ve Bizans dönemlerine, oradan da Anadolu Selçuklu Devleti'nin ikinci başkenti (\"Makarr-ı Ulema\" — Alimler Yurdu) olduğu altın çağa uzanan muazzam bir geçmişe sahiptir. 1206'da inşa edilen ve dünyanın en eski tıp fakültesi ve hastanesi kabul edilen **Gevher Nesibe Darüşşifası**, şehrin ortasında vakur bir nöbetçi gibi duran **Kayseri Kalesi**, **Hunat Hatun Külliyesi**, **Sahabiye Medresesi** ve Osmanlı ticaretinin nabzını tutan **Kapalı Çarşı** ile Kayseri, hem taş mimarinin hem de Anadolu girişimciliğinin başkentidir.",
      "literary_quotes": [
        "\"Kayseri, Erciyes'in beyaz başlığı altında ilmin, ticaretin ve taş işçiliğinin asırlık kalesidir.\" — Evliya Çelebi",
        "\"Gevher Nesibe'nin taş duvarlarında, Selçuklu'nun insanı merkeze alan merhamet ve bilim anlayışı hâlâ nefes alır.\" — Medeniyet Tarihi Notları"
      ],
      "spiritual_figures": [
        "**Seyyid Burhaneddin-i Veli (Muhakkik-i Tirmizî):** Hazreti Mevlânâ'nın dokuz yıl boyunca manevi eğitimini üstlenen büyük mürşit; Kayseri'deki türbesi şehrin en derin huzur ve tefekkür makamıdır.",
        "**Mimar Sinan (Koca Sinan):** Kayseri'nin **Ağırnas** köyünde doğan, Süleymaniye'den Selimiye'ye Osmanlı medeniyetinin gökyüzüne vurduğu taş mührün mimarı; Ağırnas'taki doğduğu ev ve yeraltı su tünelleri şehrin gururudur.",
        "**Gevher Nesibe Sultan ve Mahperi Hunat Hatun:** Biri tıp ve şifa tarihine adını altın harflerle yazdıran Selçuklu prensesi; diğeri Kayseri'ye Anadolu'nun ilk külliyelerinden birini armağan eden banidir.",
        "**Davud-i Kayserî ve Ahilik Geleneği:** Osmanlı'nın ilk medresesi İznik Medresesi'nin başmüderrisi Davud-i Kayserî bu topraklarda yetişmiş; Kayseri esnafı ise asırlardır Ahilik ahlakını ticaretin kalbine yerleştirmiştir."
      ]
    },
    "04_IcAnadolu/Kirikkale": {
      "plate": 71,
      "name": "Kırıkkale",
      "region": "İç Anadolu",
      "region_code": "04_IcAnadolu",
      "lat": 39.8468,
      "lng": 33.5153,
      "landmarks": [
        "Çeşnigir Köprüsü ve Kanyonu",
        "Silah Sanayi Müzesi",
        "Hasandede Camii ve Türbesi",
        "Nur Camii"
      ],
      "specialties": [
        "Kırıkkale Tavası",
        "Keskin Tavası",
        "Tuvalak"
      ],
      "quote": "Kızılırmak'ın süzüldüğü Çeşnigir Köprüsü ve savunma sanayiimizin bozkırdaki omurgası.",
      "library": "Kırıkkale İl Halk Kütüphanesi - Geniş ve aydınlık çalışma ortamı ile odaklanmayı kolaylaştıran düzen.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "04_IcAnadolu/Kirikkale/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "04_IcAnadolu/Kirikkale/gallery.jpg",
      "images": [
        "04_IcAnadolu/Kirikkale/banner.jpg",
        "04_IcAnadolu/Kirikkale/gallery.jpg"
      ],
      "readme_rel": "04_IcAnadolu/Kirikkale/README.md",
      "slug": "Kirikkale",
      "content_size": 5527,
      "custom_quote": "Bozkırın ortasında Kızılırmak'ın sularıyla hayat bulan, cumhuriyetin sanayi hamleleriyle gelişmiş mütevazı şehir.",
      "custom_library": "Kirikkale İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Tarih boyunca İpekyolu üzerinde önemli bir geçiş noktası olan Kırıkkale bölgesi, cumhuriyet döneminde kurulan savunma sanayi fabrikalarıyla şehirleşmiştir. Kızılırmak'ın bereketli vadisi boyunca Hitit, Roma, Selçuklu ve Osmanlı kervanlarına geçit veren bu topraklar, XIII. yüzyılda inşa edilen Çeşnigir Köprüsü ile Anadolu'nun doğusunu batısına bağlamıştır. 1920'lerde küçük bir köy iken Makine ve Kimya Endüstrisi (MKE) fabrikalarının kurulmasıyla Cumhuriyet Türkiye'sinin stratejik sanayi ve kavşak kentine dönüşen Kırıkkale, kırk üç ilin geçiş güzergâhında sessiz ama vakur bir duraktır.",
      "literary_quotes": [
        "\"Çeşnigir Köprüsü, Kızılırmak'ın hırçın sularına vurulmuş Selçuklu mührüdür.\" — Evliya Çelebi"
      ],
      "reflection": "Kızılırmak üzerindeki tarihi Çeşnigir Köprüsü'nden akan nehre bakarken, asırlar boyu bu kalede nöbet tutan askerleri ve tarihin nöbetleşe geçen doğasını düşünürsünüz. Büyük şehirlerin gürültüsünden uzak, gösterişsiz ama samimi bu Anadolu kentinde; bir yanda savunma sanayiinin alın terini, diğer yanda Keskin'in bozlak tınılarını ve Hasan Dede'nin sükûnetini aynı gün içinde hissetmek insana derin bir denge duygusu verir.",
      "spiritual_figures": [
        "**Hasan Dede Hazretleri:** XVI. yüzyılda yaşamış, Hacı Bektaş-ı Veli geleneğinden gelen büyük Anadolu ereni; kendi adını taşıyan köydeki camisi ve türbesi, Kırıkkale'nin en önemli manevi ziyaretgâhıdır.",
        "**Koçubaba (Koçu Baba):** Balışeyh ilçesine bağlı Koçubaba köyünde medfun, XIV–XV. yüzyıl Anadolu irfan geleneğinin izlerini taşıyan tasavvuf büyüğü.",
        "**Haydar Sultan (Haydar Dede):** Keskin ilçesinde külliyesi bulunan, Hoca Ahmed Yesevi ocağının Anadolu'daki temsilcilerinden kabul edilen Horasan ereni.",
        "**Hacı Taşan:** Keskinli büyük bozlak ustası; Orta Anadolu'nun yanık türkü geleneğini ve Abdal müziğini yaşatan gönül ozanı."
      ],
      "five_day_plan": [
        "**1. Gün — Şehir Merkezi ve Sanayi Hafızası:** Sabah kütüphane mesaisi; öğleden sonra **MKE Silah Sanayi Müzesi**, **Nur Camii** ve şehir merkezi yürüyüşü.",
        "**2. Gün — Kızılırmak ve Çeşnigir Kanyonu:** **Çeşnigir Köprüsü ve Kanyonu**'nda doğa yürüyüşü, cam seyir terasında gün batımı ve Kızılırmak kıyısında tefekkür.",
        "**3. Gün — Maneviyat Durakları:** **Hasandede Camii ve Türbesi** ziyareti; öğleden sonra **Celal Bayar Parkı**'nda Kızılırmak kenarında kitap okuma ve dinlenme.",
        "**4. Gün — Keskin, Rahmi Pehlivanlı ve Bozlak Kültürü:** Sabah kütüphane çalışması; öğleden sonra Keskin'de **Sulu Mağara**, **Rahmi Pehlivanlı Müzesi** (Kralların Ressamı) ve **Taş Mektep** ziyareti.",
        "**5. Gün — Balışeyh, Ceritkale ve Veda:** **Ballı Camii (Selçuklu eseri)**, **Ceritkale Kaya Mezarları** ve **Obaköy Yeşil Vadi** doğa gezisiyle Kırıkkale menzilinin tamamlanması."
      ]
    },
    "04_IcAnadolu/Kirsehir": {
      "plate": 40,
      "name": "Kırşehir",
      "region": "İç Anadolu",
      "region_code": "04_IcAnadolu",
      "lat": 39.1425,
      "lng": 34.1709,
      "landmarks": [
        "Ahi Evran Camii ve Türbesi",
        "Cacabey Medresesi (Gözlemevi)",
        "Neşet Ertaş Gönül Sultanları Evi",
        "Aşıkpaşa Türbesi"
      ],
      "specialties": [
        "Kırşehir Köftesi",
        "Çirleme",
        "Ahi Helvası"
      ],
      "quote": "Ahilik teşkilatının kurucusu Ahi Evran'ın ocağı, gökbilim medresesi Cacabey ve Bozkırın Tezenesi Neşet Ertaş'ın sazının sesi.",
      "library": "Kırşehir İl Halk Kütüphanesi - UNESCO Müzik Şehri'nde huzur dolu araştırma salonu.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "04_IcAnadolu/Kirsehir/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "04_IcAnadolu/Kirsehir/gallery.jpg",
      "images": [
        "04_IcAnadolu/Kirsehir/banner.jpg",
        "04_IcAnadolu/Kirsehir/gallery.jpg"
      ],
      "readme_rel": "04_IcAnadolu/Kirsehir/README.md",
      "slug": "Kirsehir",
      "content_size": 5757,
      "history": "İç Anadolu'nun tam ortasında, Kızılırmak yayının bereketli topraklarında kurulan Kırşehir (eski adıyla *Gülşehir / Mokissos*); Hititlerin Kaman Kalehöyük'teki katmanlarından Roma ve Bizans'a, özellikle XIII. yüzyılda Anadolu Selçuklu döneminin en parlak ilim, tasavvuf ve esnaf teşkilatlanması merkezine dönüşmüştür. 1272 yılında Kırşehir Emiri Nureddin Cibril bin Cacabey tarafından gökbilim (astronomi) eğitimi için inşa edilen **Cacabey Medresesi**, tarihin en eski rasathanelerinden biridir. Aynı asırda **Ahi Evran-ı Veli**'nin kurduğu Ahilik teşkilatı ve **Âşık Paşa**'nın Türkçe aşkı, Kırşehir'i \"Ozanlar, Alimler ve Ahiler Diyarı\" kılmış; UNESCO Yaratıcı Şehirler Ağı'na **Müzik Şehri** olarak adını yazdırmıştır.",
      "literary_quotes": [
        "\"Hak ile sabır dileyip bize gelen bizdendir; akıl ve ahlak ile çalışıp bizi geçen bizdendir.\" — Ahi Evran-ı Veli",
        "\"Gönül dağı yağmur yağmur boran olunca / Akar can özümden sel gizli gizli...\" — Neşet Ertaş",
        "\"Türk diline kimsene bakmaz idi / Türklere hergiz gönül akmaz idi...\" — Âşık Paşa (Garibnâme)"
      ],
      "spiritual_figures": [
        "**Ahi Evran-ı Veli Hazretleri:** Anadolu'da Ahilik teşkilatının kurucusu; *\"Eline, beline, diline sahip ol; alnın açık, kapın açık, sofran açık olsun\"* ilkeleriyle esnaf ahlakını, mesleki dayanışmayı ve sosyal adaleti asırlar boyu ayakta tutan büyük gönül mimarı.",
        "**Neşet Ertaş (Bozkırın Tezenesi) ve Muharrem Ertaş:** Abdal müzik geleneğini ve Orta Anadolu bozlaklarını tüm dünyaya duyuran, tevazusu ve *\"Kalpten kalbe bir yol vardır görülmez\"* diyen irfanıyla milletin gönlünde taht kuran büyük ozanlar.",
        "**Âşık Paşa:** 1330 yılında kaleme aldığı 12 bin beyitlik **Garibnâme** ile *\"Türk diline kimsene bakmaz idi\"* diyerek Anadolu'da Türkçenin edebi ve tasavvufi bayrağını yükselten büyük mutasavvıf; mermer türbesi şehrin en zarif anıtlarındandır.",
        "**Süleyman Türkmanî ve Yunus Emre / Hacı Bektaş Havzası:** Kırşehir, Hacı Bektaş-ı Veli ve Taptuk Emre manevi ikliminin hemen yanı başında Anadolu tasavvufunun en verimli kavşaklarından biri olmuştur."
      ]
    },
    "04_IcAnadolu/Konya": {
      "plate": 42,
      "name": "Konya",
      "region": "İç Anadolu",
      "region_code": "04_IcAnadolu",
      "lat": 37.8667,
      "lng": 32.4833,
      "landmarks": [
        "Mevlana Müzesi & Dergahı",
        "Alaaddin Camii & Tepesi",
        "İnce Minareli Medrese",
        "Karatay Medresesi",
        "Sille Köyü"
      ],
      "specialties": [
        "Etliekmek",
        "Fırın Kebabı",
        "Tirit",
        "Bamya Çorbası",
        "Mevlana Şekeri"
      ],
      "quote": "Hazreti Mevlana'nın 'Gel, ne olursan ol yine gel' nidasiyla dünyaya sevgi ve tevhid yayan Selçuklu payitahtı.",
      "library": "Konya İl Halk Kütüphanesi - Geniş ve ferah salonları var, Selçuklu mimarisinin esintilerini taşıyor, çalışma disiplini yüksek.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "04_IcAnadolu/Konya/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "04_IcAnadolu/Konya/gallery.jpg",
      "images": [
        "04_IcAnadolu/Konya/banner.jpg",
        "04_IcAnadolu/Konya/gallery.jpg"
      ],
      "readme_rel": "04_IcAnadolu/Konya/README.md",
      "slug": "Konya",
      "content_size": 6042,
      "custom_quote": "Hazreti Mevlana'nın hoşgörü ve aşk iklimiyle demlenmiş, Selçuklu'nun muhteşem payitahtı, irfan merkezi.",
      "custom_library": "Konya İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Anadolu Selçuklu Devleti'ne uzun yıllar başkentlik yapan Konya, yetiştirdiği alimler, sufiler ve bıraktığı eşsiz mimari eserlerle İslam medeniyetinin kurucu şehirlerindendir. İnsanlık tarihinin en eski kent yerleşimlerinden Çatalhöyük'ten (MÖ 7400) Hitit, Frig, Roma ve Bizans katmanlarına uzanan bu kadim ova, I. Alâeddin Keykubad döneminde \"Darü'l-Mülk\" (Saltanat Yurdu) olarak altın çağını yaşamıştır. Karatay'ın firuze çinileri, İnce Minare'nin taşa işlenen sülüs hatları ve Alaeddin Tepesi'nin vakur silüeti, Konya'yı bozkırın ortasında yükselen bir sanat ve hikmet şehrine dönüştürmüştür.",
      "literary_quotes": [
        "\"Gel, gel, ne olursan ol, yine gel...\" — Mevlânâ Celâleddîn-i Rûmî",
        "\"Konya, Selçuklu medeniyetinin ruhunu taşa nakşettiği mukaddes şehirdir.\" — Ahmet Hamdi Tanpınar",
        "\"Konya, maneviyatın göğe yükseldiği, dervişlerin sema ettiği huzur yurdudur.\" — Evliya Çelebi"
      ],
      "reflection": "Mevlana Türbesi'nin yeşil kubbesi altında, ilahi aşkı, 'hamdım, piştim, yandım' diyen dervişlerin sabrını tefekkür edersiniz. Sabahın erken saatlerinde Karatay Medresesi'nin çini kubbesine başınızı kaldırıp bakarken, Selçuklu ustalarının gökyüzünün yıldızlarını kubbeye nasıl nakşettiğini ve bir medeniyetin estetiği ibadet şuuruyla nasıl yoğurduğunu hissedersiniz.",
      "spiritual_figures": [
        "**Mevlânâ Celâleddîn-i Rûmî:** XIII. yüzyılda Mesnevi ve Divan-ı Kebir ile tüm insanlığa ilahi aşkı, tevazuyu ve merhameti öğreten büyük mutasavvıf; Kubbe-i Hadra (Yeşil Kubbe) şehrin manevi kalbidir.",
        "**Şems-i Tebrizî:** Mevlânâ'nın gönül dünyasında büyük bir uyanışa vesile olan meczup ve arif; şehir merkezindeki makamı derin bir hürmetle ziyaret edilir.",
        "**Sadreddin Konevî:** Muhyiddin İbnü'l-Arabî'nin manevi mirasını Anadolu'ya taşıyan, hadis ve tasavvuf ilminde zirve isim; Mevlânâ'nın yakın dostu ve cenaze namazını kıldıran büyük alim.",
        "**Nasreddin Hoca (Akşehir) ve I. Alâeddin Keykubad:** Biri Akşehir'deki türbesiyle Anadolu'nun hikmetli gülüşünü, diğeri ise medrese, han ve kervansaraylarıyla Selçuklu'nun imar dehasını temsil eder."
      ],
      "five_day_plan": [
        "**1. Gün — İrfan ve Payitaht Ekseni:** Sabah İl Halk Kütüphanesi'nde çalışma; öğleden sonra **Mevlana Müzesi ve Türbesi**, **Sultan Selim Camii**, **Şems-i Tebrizî Camii ve Türbesi** ve **Tarihi Bedesten Çarşısı**.",
        "**2. Gün — Selçuklu Medreseleri ve Alaeddin Tepesi:** **Alaeddin Camii**, **Karatay Medresesi (Çini Eserler Müzesi)**, **İnce Minareli Medrese**, **Sahip Ata Külliyesi** ve **Sadreddin Konevî Camii ve Türbesi**.",
        "**3. Gün — Kadim Tarih ve Sille:** Sabah kütüphane mesaisi; öğleden sonra beş bin yıllık **Sille Mahallesi** (Aya Elenia Kilisesi, taş köprüler) ve **Tropikal Kelebek Bahçesi**; akşam **Meram Bağları** yürüyüşü.",
        "**4. Gün — Çatalhöyük ve Bozkırın Mirası:** UNESCO Dünya Mirası **Çatalhöyük Neolitik Kenti** ziyareti; dönüşte **Konya Bilim Merkezi** veya **Zazadin Hanı** keşfi.",
        "**5. Gün — Beyşehir veya Tuz Gölü / Kilistra:** Ahşap direkli **Eşrefoğlu Camii** ve **Beyşehir Gölü** kıyısında gün batımı (ya da **Tuz Gölü** / **Meke Gölü** rotası) ile Konya menziline veda."
      ]
    },
    "04_IcAnadolu/Nevsehir": {
      "plate": 50,
      "name": "Nevşehir",
      "region": "İç Anadolu",
      "region_code": "04_IcAnadolu",
      "lat": 38.6244,
      "lng": 34.7144,
      "landmarks": [
        "Göreme Açık Hava Müzesi",
        "Uçhisar Kalesi",
        "Derinkuyu Yeraltı Şehri",
        "Hacı Bektaş-ı Veli Türbesi",
        "Paşabağları"
      ],
      "specialties": [
        "Testi Kebabı",
        "Kapadokya Şarabı/Üzüm Suyu",
        "Kabak Çekirdeği",
        "Nevşehir Tavası"
      ],
      "quote": "Peribacalarının masalsı vadilerinde zamanın durduğu, Hacı Bektaş-ı Veli'nin 'Bir olalım, iri olalım, diri olalım' irfanı.",
      "library": "Nevşehir İl Halk Kütüphanesi - Taş mimarisiyle huzurlu, sessiz odaları odağı artırmak için ideal.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "04_IcAnadolu/Nevsehir/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "04_IcAnadolu/Nevsehir/gallery.jpg",
      "images": [
        "04_IcAnadolu/Nevsehir/banner.jpg",
        "04_IcAnadolu/Nevsehir/gallery.jpg"
      ],
      "readme_rel": "04_IcAnadolu/Nevsehir/README.md",
      "slug": "Nevsehir",
      "content_size": 5914,
      "custom_quote": "Kapadokya'nın masalsı vadilerinde, peri bacalarının rüzgarla fısıldaştığı, zamanın ve mekanın ötesinde bir rüya coğrafyası.",
      "custom_library": "Nevsehir İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Hititlerden ilk Hristiyan sığınaklarına kadar uzanan Kapadokya, volkanik tüflerin aşınmasıyla oluşan peri bacalarıyla dünya miraslarının en özgün olanıdır. Erciyes, Hasan ve Güllüdağ'ın milyonlarca yıl önce püskürttüğü lav ve küllerin rüzgâr ve yağmurla yontulması sonucu ortaya çıkan bu eşsiz coğrafya; Kaymaklı ve Derinkuyu gibi kat kat yeraltı şehirlerine, Göreme'nin kaya oyma manastırlarına, Avanos'un Kızılırmak çamurundan doğan çömlekçilik geleneğine ve Selçuklu-Osmanlı külliyelerine kucak açmıştır. Eski adı Muşkara olan şehir, Lale Devri'nin ünlü sadrazamı Damat İbrahim Paşa'nın imar faaliyetleriyle \"Nevşehir\" (Yeni Şehir) adını alarak bugünkü kimliğine kavuşmuştur.",
      "literary_quotes": [
        "\"Kapadokya, taşın rüya gördüğü, rüzgarın ise o rüyayı fısıldadığı büyülü coğrafyadır.\" — Ahmet Hamdi Tanpınar",
        "\"Ürgüp ve Göreme vadileri, yeryüzünün en benzersiz yaratılış mucizeleridir.\" — Evliya Çelebi"
      ],
      "reflection": "Balonların gökyüzünde süzülüşünü izlerken, insan ruhunun özgürlük arayışını ve yeryüzünün eşsiz sanatını tefekkür edersiniz. Hacıbektaş Dergâhı'nın avlusunda \"Aslanlı Çeşme\" başında durup asırlarca aş kaynayan Kara Kazan'a bakarken, ya da Kızılçukur Vadisi'nde gün batımının kayaları kızıla boyadığı o sessiz dakikada, hem doğanın hem de Anadolu irfanının zamanı aşan nefesi kalbinizi sarar.",
      "spiritual_figures": [
        "**Hacı Bektaş-ı Veli Hazretleri:** XIII. yüzyılda Horasan'dan gelip Sulucakarahöyük'e (Hacıbektaş) yerleşen, \"Eline, beline, diline sahip ol\" ve \"İncinsen de incitme\" düsturlarıyla Anadolu birliğini ve hoşgörüsünü mayalayan büyük mutasavvıf.",
        "**Damat İbrahim Paşa:** XVIII. yüzyılda doğduğu Muşkara köyünü cami, medrese, hamam, han ve kütüphane içeren **Kurşunlu Külliyesi** ile baştan imar ederek Nevşehir'i kuran Osmanlı sadrazamı.",
        "**Büyük Basileios ve Kapadokyalı Kilise Babaları:** IV. yüzyılda Göreme ve çevresinde manastır yaşamını ve teoloji geleneğini şekillendiren kadim dönem düşünürleri."
      ],
      "five_day_plan": [
        "**1. Gün — Nevşehir Merkez ve Uçhisar:** Sabah kütüphane mesaisi; öğleden sonra **Damat İbrahim Paşa (Kurşunlu) Külliyesi**, **Nevşehir Kalesi**, **Uçhisar Kalesi** ve **Güvercinlik Vadisi** gün batımı.",
        "**2. Gün — Göreme ve Vadiler Yürüyüşü:** Şafakta balon seyri; **Göreme Açık Hava Müzesi**, **Paşabağları (Rahipler Vadisi)**, **Zelve Ören Yeri** ve **Kızılçukur / Güllüdere Vadisi** yürüyüşü.",
        "**3. Gün — Avanos ve Ürgüp:** Sabah kütüphane oturumu; öğleden sonra **Avanos** çömlek atölyeleri ve Kızılırmak sallanan köprü, **Devrent (Hayal) Vadisi**, **Ürgüp Üç Güzeller** ve **Mustafapaşa (Sinasos)** taş konakları.",
        "**4. Gün — Yeraltı Şehirleri ve Derin Tarih:** **Kaymaklı Yeraltı Şehri** ve **Derinkuyu Yeraltı Şehri** keşfi; öğleden sonra **Ortahisar Kalesi** ve **Sarıhan Kervansarayı**.",
        "**5. Gün — Hacıbektaş İrfan Ziyareti ve Veda:** **Hacı Bektaş-ı Veli Müzesi ve Külliyesi**, **Beştaşlar** ve **Çilehane (Deliklitaş)** ziyaretiyle manevi bir final."
      ]
    },
    "04_IcAnadolu/Nigde": {
      "plate": 51,
      "name": "Niğde",
      "region": "İç Anadolu",
      "region_code": "04_IcAnadolu",
      "lat": 37.9667,
      "lng": 34.6833,
      "landmarks": [
        "Niğde Kalesi ve Saat Kulesi",
        "Alaaddin Camii (Güneş Portali)",
        "Gümüşler Manastırı",
        "Aladağlar Milli Parkı"
      ],
      "specialties": [
        "Niğde Tavası",
        "Niğde Gazozu",
        "Elma Tatlısı"
      ],
      "quote": "Aladağlar'ın görkemi altında Selçuklu kadın motiflerinin taşa işlendiği ve 'Geçti Bor'un pazarı' deyişinin yurdu.",
      "library": "Niğde İl Halk Kütüphanesi - Sakin ve odaklanmaya elverişli ortam.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "04_IcAnadolu/Nigde/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "04_IcAnadolu/Nigde/gallery.jpg",
      "images": [
        "04_IcAnadolu/Nigde/banner.jpg",
        "04_IcAnadolu/Nigde/gallery.jpg"
      ],
      "readme_rel": "04_IcAnadolu/Nigde/README.md",
      "slug": "Nigde",
      "content_size": 5794,
      "history": "Kapadokya'nın güney kapısı, Torosların en görkemli uzantısı **Aladağlar** ile **Bolkar Dağları**'nın eteğinde kurulan Niğde (kadim adıyla *Nakita / Nahita*); Hititlerin **Tyana (Kemerhisar)** krallığından Roma döneminin görkemli su kemerlerine ve Roma Havuzu'na, Anadolu Selçukluları ve İlhanlılar döneminin ise en zarif taş mimari eserlerine ev sahipliği yapar. 1223'te inşa edilen **Alâeddin Camii**'nin doğu taç kapısında sabah güneşinin düşmesiyle ortaya çıkan \"taçlı kadın silüeti\", **Hüdavent Hatun Türbesi**'nin yüksek kabartma taş işçiliği, **Sungurbey Camii**'nin Gotik ve İslam mimarisini harmanlayan eşsiz üslubu ve **Gümüşler Manastırı**'ndaki Anadolu'da tek örnek olan \"Tebessüm Eden Meryem Ana\" freski, Niğde'yi keşfedilmemiş bir açık hava müzesi kılar.",
      "literary_quotes": [
        "\"Niğde, Selçuklu taş işçiliğinin en ince, en zarif ve en gizemli mücevherlerini saklayan sessiz bir payitahttır.\" — Sanat Tarihi Notları",
        "\"Aladağlar'ın eteklerinde, bozkırın sarısıyla karlı zirvelerin beyazı arasında Niğde, seyyaha hem dağın heybetini hem tarihin sükûnetini sunar.\" — Anadolu Gezi Defteri"
      ],
      "spiritual_figures": [
        "**Hüdavent Hatun:** Anadolu Selçuklu Sultanı IV. Kılıç Arslan'ın kızı; 1312'de Niğde'de kendi adına yaptırdığı sekizgen türbe, insan, kuş, sfenks ve bitkisel motifli taş oymalarıyla Türk-İslam sanat tarihinin başyapıtlarındandır.",
        "**Emir Seyfeddin Sungur Ağa (Sungurbey):** XIV. yüzyılda Niğde'ye adını veren camiyi inşa ettirerek şehrin mimari kimliğine unutulmaz bir zarafet kazandıran İlhanlı/Selçuklu valisi.",
        "**Üstad Sıddık ve Kardeşi Gazi:** Alâeddin Camii'nin taş işçiliğine ruh üfleyen ve taç kapıya güneşin açısıyla belirip kaybolan gölge sanatını işleyen Selçuklu mimarları.",
        "**Şehit Ömer Halisdemir ve Milli Mücadele Hafızası:** Bor ilçesine bağlı Çukurkuyu beldesinden yetişen kahramanlık mirası ve Anadolu'nun vatan savunmasındaki vakur duruşu şehrin manevi hafızasında derin bir yere sahiptir."
      ]
    },
    "04_IcAnadolu/Sivas": {
      "plate": 58,
      "name": "Sivas",
      "region": "İç Anadolu",
      "region_code": "04_IcAnadolu",
      "lat": 39.7477,
      "lng": 37.0179,
      "landmarks": [
        "Divriği Ulu Cami ve Darüşşifası",
        "Çifte Minareli Medrese",
        "Buruciye Medresesi",
        "Gök Medrese",
        "Atatürk Kongre ve Etnografya Müzesi"
      ],
      "specialties": [
        "Sivas Köftesi",
        "Sivas Katmeri",
        "Pezik Turşusu",
        "Madımak"
      ],
      "quote": "Selçuklu taş işçiliğinin şaheseri Divriği Ulu Camii ile taçlanmış, Âşık Veysel'in sazındaki hakikat arayışı.",
      "library": "Sivas Şems-i Sivasî İl Halk Kütüphanesi - Selçuklu esintileriyle bezeli geniş ve son derece düzenli çalışma salonları.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "04_IcAnadolu/Sivas/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "04_IcAnadolu/Sivas/gallery.jpg",
      "images": [
        "04_IcAnadolu/Sivas/banner.jpg",
        "04_IcAnadolu/Sivas/gallery.jpg"
      ],
      "readme_rel": "04_IcAnadolu/Sivas/README.md",
      "slug": "Sivas",
      "content_size": 6219,
      "custom_quote": "Selçuklu çinilerinde gökyüzünü arayan, bozkırın ortasında yükselen ulu medreseleriyle vakur ve tarihi şehir.",
      "custom_library": "Sivas İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Selçuklu döneminin en büyük eğitim ve kültür merkezlerinden biri olan Sivas, Cumhuriyetin temellerinin atıldığı Sivas Kongresi'ne de ev sahipliği yapmıştır. Hititlerden Danişmendlilere, Anadolu Selçuklularından Eretna ve Kadı Burhaneddin dönemlerine, Osmanlı'dan 4 Eylül 1919'un Milli Mücadele ruhuna kadar uzanan bu vakur şehir; Anadolu'nun tek bir meydanda (Kent Meydanı) üç büyük Selçuklu şaheserini —Çifte Minareli, Şifaiye ve Buruciye Medreselerini— bir arada barındıran nadir açık hava müzelerinden biridir. Mengücekoğulları'nın Divriği'de taşa işlediği UNESCO mirası Ulu Camii ve Darüşşifası ise İslam mimarisinin yeryüzündeki eşsiz taçlarındandır.",
      "literary_quotes": [
        "\"Sivas, Selçuklu çinilerinde gökyüzünü arayan, bozkırın asil şaheseridir.\" — Âşık Veysel",
        "\"Divriği Ulu Camii, mimarinin ve taş işçiliğinin yeryüzündeki nihai mucizesidir.\" — Evliya Çelebi",
        "\"Sivas, Selçuklu'nun taşa işlenmiş ruhu, bozkırın en vakur kalesidir.\" — Ahmet Hamdi Tanpınar"
      ],
      "reflection": "Divriği Ulu Camii'nin kapısındaki namaz kılan insan gölgesini izlerken, taş ustalarının ilahi aşkla mermere nasıl şekil verdiğini tefekkür edersiniz. Akşam serinliğinde Buruciye Medresesi'nin avlusunda oturup çifte minarelerin yıldızlara uzanan silüetine bakarken, bir yandan Şifaiye'de asırlar önce şifa arayan hastaları, bir yandan da hemen karşıdaki Kongre Binası'nda \"Manda ve himaye kabul olunamaz\" diyen kararlı iradeyi aynı meydanda hissetmek benzersiz bir tarih bilinci uyandırır.",
      "spiritual_figures": [
        "**Şemseddin-i Sivâsî Hazretleri:** XVI. yüzyılda yaşamış büyük Halvetî şeyhi, alim ve şair; Meydan Camii avlusundaki türbesi Sivas'ın en önemli manevi merkezlerindendir.",
        "**Âşık Veysel Şatıroğlu:** Şarkışla'nın Sivrialan köyünden tüm dünyaya \"Benim sadık yarim kara topraktır\" diye seslenen, gönül gözü açık büyük halk ozanı.",
        "**Pir Sultan Abdal:** Yıldızeli'nin Banaz köyünde yetişen, Anadolu âşıklık ve deyiş geleneğinin en gür seslerinden biri.",
        "**Kadı Burhaneddin ve İhramcızade İsmail Hakkı Toprak:** Biri XIV. yüzyılda ilim, siyaset ve divan şiirini birleştiren devlet adamı; diğeri XX. yüzyılda Sivas'ın manevi hayatına ve vakıf eserlerinin ihyasına öncülük eden gönül büyüğü."
      ],
      "five_day_plan": [
        "**1. Gün — Selçuklu Meydanı ve Kongre Hafızası:** Sabah kütüphane mesaisi; öğleden sonra **Atatürk Kongre ve Etnografya Müzesi**, **Çifte Minareli Medrese**, **Şifaiye Medresesi**, **Buruciye Medresesi** ve **Kale Camii**.",
        "**2. Gün — Gök Medrese, Ulu Camii ve Tarihi Çarşılar:** **Gök Medrese**, eğik minaresiyle **Sivas Ulu Camii**, **Şemseddin-i Sivâsî Türbesi (Meydan Camii)**, **Taşhan**, **Subaşı Hanı** ve **Behram Paşa Hanı**.",
        "**3. Gün — Divriği Mucizesi (Tam Gün):** Sabah erken tren veya araçla UNESCO Dünya Mirası **Divriği Ulu Camii ve Darüşşifası**, **Divriği Kalesi**, tarihi **Divriği Konakları** ve **Cam Seyir Terası** ziyareti.",
        "**4. Gün — Şarkışla ve Âşık Veysel'in İzinde:** Sabah kütüphane çalışması; öğleden sonra Şarkışla Sivrialan'da **Âşık Veysel Müzesi** ve mezarı ziyareti; dönüşte **Eğri Köprü** (Kızılırmak).",
        "**5. Gün — Doğa Harikaları (Gürün veya Hafik):** **Gökpınar Gölü**'nün turkuaz berraklığı ve **Şuğul Kanyonu** (ya da **Tödürge / Hafik Gölü** ve **Sıcak Çermik**) keşfiyle Sivas'a veda."
      ]
    },
    "04_IcAnadolu/Yozgat": {
      "plate": 66,
      "name": "Yozgat",
      "region": "İç Anadolu",
      "region_code": "04_IcAnadolu",
      "lat": 39.8181,
      "lng": 34.8147,
      "landmarks": [
        "Yozgat Çamlığı Milli Parkı",
        "Çapanoğlu Camii",
        "Tarihi Saat Kulesi",
        "Nizamoğlu Konağı",
        "Kazankaya Kanyonu"
      ],
      "specialties": [
        "Testi Kebabı",
        "Arabaşı Çorbası ve Hamuru",
        "Yozgat Parmak Çöreği"
      ],
      "quote": "Bozkırın ortasında serin bir nefes, Türkiye'nin ilk milli parkı Yozgat Çamlığı'nın gölgesinde samimi bir menzil.",
      "library": "Yozgat İl Halk Kütüphanesi - Sessiz, düzenli çalışma ortamı ve çam kokulu molalar için ideal mekan.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "04_IcAnadolu/Yozgat/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "04_IcAnadolu/Yozgat/gallery.jpg",
      "images": [
        "04_IcAnadolu/Yozgat/banner.jpg",
        "04_IcAnadolu/Yozgat/gallery.jpg"
      ],
      "readme_rel": "04_IcAnadolu/Yozgat/README.md",
      "slug": "Yozgat",
      "content_size": 6107,
      "custom_quote": "Bozkırın ortasında serin bir nefes, Yozgat Çamlığı'nın gölgesinde saklı kalan samimi bir Anadolu şehri.",
      "custom_library": "Yozgat İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "İç Anadolu bozkırının kalbinde, Bozok Yaylası'nın serin sırtlarında kurulan Yozgat; Hititlerin kadim yerleşimlerinden Kerkenes Harabeleri'ne (Pteria), Roma döneminin iki bin yıllık şifa kaynağı Sarıkaya Roma Hamamı'na (Basilica Therma) ve XVIII. yüzyılda Bozok Sancağı'nı imar eden Çapanoğlu ailesinin zarif Osmanlı mimarisine kadar köklü bir geçmişe sahiptir. 1958'de Türkiye'nin ilk milli parkı ilan edilen Yozgat Çamlığı, bozkırın ortasında asırlık karaçam ağaçlarıyla yükselen eşsiz bir ekolojik ve ruhani vahadır.",
      "literary_quotes": [
        "\"Yozgat'ta Çamlık'a çıktığınızda, bozkırın uçsuz bucaksız sükûneti ile çam kokusunun birleştiği o serin nefes insanın ruhunu dinlendirir.\" — Anadolu Seyahatnamesi Notlarından",
        "\"Çapanoğlu Camii, bozkırın ortasında zarafeti ve inceliğiyle parlayan bir Osmanlı mührüdür.\" — Sanat Tarihi Notları"
      ],
      "reflection": "Türkiye'nin ilk milli parkı olan Yozgat Çamlığı'nda yürüyüş yaparken doğanın zikrine şahit olmak ve bozkırın ortasındaki bu yeşil vahada tefekküre dalmak unutulmaz bir deneyimdi. Şehrin sakin ve vakur yapısı, modern dünyanın karmaşasından uzaklaşmak için ideal bir sığınak sundu. Saat Kulesi'nin gölgesinde çay yudumlayıp Çapanoğlu Camii'nin kalem işi kubbesini seyrederken, büyük metropollerin gürültüsünde unutulan samimi Anadolu misafirperverliğini yeniden hatırlarsınız.",
      "spiritual_figures": [
        "**Şeyhzade Ahmet Şevki Efendi:** XIX. yüzyılda Yozgat'ta ilim ve irfan halkaları kuran, şehrin manevi hafızasında derin izler bırakan alim ve mutasavvıf.",
        "**Çapanoğlu Mustafa Bey ve Süleyman Bey:** Yozgat'ı kuran, Anadolu'da Avrupa barok-ampir üslubunun Osmanlı cami mimarisiyle en özgün sentezlerinden **Çapanoğlu Büyük Camii**'ni inşa ettiren devlet adamları.",
        "**Nida Tüfekçi ve Bozok Aşıkları:** Akdağmadeni'nden doğup tüm Türkiye'ye \"Sürmeli\" türküsünü ve Orta Anadolu bozlak kültürünü armağan eden büyük halk müziği üstadı.",
        "**Bozoklu Osman Şakir Efendi ve Yozgatlı Hüzni:** Şehrin edebi ve kültürel mirasını mısralarla geleceğe taşıyan şair ve müellifler."
      ],
      "five_day_plan": [
        "**1. Gün — Şehir Merkezi ve Çapanoğlu Mirası:** Sabah İl Halk Kütüphanesi'nde çalışma; öğleden sonra **Saat Kulesi**, **Çapanoğlu Camii**, **Nizamoğlu Konağı (Yozgat Müzesi)** ve **Hayri İnal Konağı**.",
        "**2. Gün — Türkiye'nin İlk Milli Parkı:** Sabah mesaisi sonrası **Yozgat Çamlığı Milli Parkı**'nda uzun doğa yürüyüşü, **Fatih Tabiat Parkı** ve çam ağaçları altında kitap okuma.",
        "**3. Gün — İki Bin Yıllık Şifa (Sarıkaya):** **Sarıkaya Roma Hamamı (Basilica Therma)** —dünyada hâlâ sıcak termal suyu akan en eski Roma hamamlarından biri— ziyareti ve yöresel mutfak deneyimi.",
        "**4. Gün — Kadim Tarih ve Doğa (Sorgun & Kerkenes):** Sabah kütüphane oturumu; öğleden sonra antik Med/Kayıp Şehir **Kerkenes Harabeleri** ve **Kazankaya Kanyonu** (Aydıncık) keşfi.",
        "**5. Gün — Akdağmadeni veya Boğazlıyan ve Veda:** **Akdağmadeni Ormanları** ve tarihi taş kilise/konakları gezilerek Bozok Yaylası'na veda."
      ]
    },
    "05_Karadeniz/Amasya": {
      "plate": 5,
      "name": "Amasya",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 40.6501,
      "lng": 35.8353,
      "landmarks": [
        "Kral Kaya Mezarları",
        "Harşena Kalesi",
        "Yalıboyu Evleri",
        "Sultan II. Bayezid Külliyesi",
        "Ferhat ile Şirin Su Kanalı"
      ],
      "specialties": [
        "Amasya Elması",
        "Amasya Çöreği",
        "Baklalı Dolma",
        "Toyga Çorbası"
      ],
      "quote": "Yeşilırmak boyunca inci gibi dizilen Yalıboyu konakları, şehzadeler mektebi ve Ferhat ile Şirin'in efsanevi aşkı.",
      "library": "Amasya İl Halk Kütüphanesi - Yeşilırmak kıyısında, nehrin şırıltısı eşliğinde kod yazma deneyimi sunan eşsiz bir çalışma alanı.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Amasya/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Amasya/gallery.jpg",
      "images": [
        "05_Karadeniz/Amasya/banner.jpg",
        "05_Karadeniz/Amasya/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Amasya/README.md",
      "slug": "Amasya",
      "content_size": 6535,
      "custom_quote": "Kral Kaya Mezarları'nın gölgesinde, Yeşilırmak'ın iki yakasında yükselen Yalıboyu evleriyle tarihin secdesi.",
      "custom_library": "Amasya İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Pontus Krallığı'na başkentlik yapan ve Osmanlı döneminde Şehzadeler Şehri olarak parlayan Amasya, zengin kültürel birikimiyle Karadeniz'in incisidir. Harşena Dağı'nın eteklerine oyulmuş Hellenistik döneme ait Kral Kaya Mezarları ile Yeşilırmak kıyısındaki zarif Osmanlı konakları, şehirde binlerce yıllık medeniyet katmanlarını tek bir ufuk çizgisinde birleştirir. Roma, Selçuklu, İlhanlı ve Osmanlı dönemlerinde stratejik bir ilim ve idare merkezi olan Amasya; aynı zamanda 22 Haziran 1919'da yayımlanan Amasya Genelgesi ile Milli Mücadele'nin hukuki ve fikri temelinin atıldığı müstesna şehirlerden biridir.",
      "literary_quotes": [
        "\"Amasya, nehrin iki yakasında tarihin ve dağların secdesidir.\" — Evliya Çelebi",
        "\"Yeşilırmak, Amasya'nın içinden akan bir zaman şeridi gibidir.\" — Ahmet Hamdi Tanpınar",
        "\"Benim memleketim Amaseia, içinden İris (Yeşilırmak) nehrinin aktığı derin ve geniş bir vadide kurulmuştur; hem tabiat hem de sanat eliyle tahkim edilmiştir.\" — Strabon (*Geographika*)"
      ],
      "reflection": "Yeşilırmak'ın akışını izlerken, Amasya'da yetişen şehzadeleri ve taht kavgalarının geçiciliğini, dağları delen Ferhat'ın ilahi aşkını tefekkür edersiniz. Akşam ezanı vakti Harşena Dağı'nın yamacındaki Kral Kaya Mezarları ışıklandırıldığında, taşlara kazınan fani hükümdarlıklarla nehrin durmaksızın akan ebedî sesi arasındaki tezat insana derin bir huşu verir.",
      "spiritual_figures": [
        "**Strabon (MÖ 64 – MS 24):** Antik çağın en büyük coğrafyacısı ve tarihçisi olan Strabon Amasya'da doğmuş, 17 ciltlik *Geographika* eserinde memleketini hayranlıkla tasvir etmiştir.",
        "**Şehzade Bayezid (II. Bayezid) & Yavuz Sultan Selim:** Osmanlı'nın \"Dârü'l-İzz\" ve \"Şehzadeler Şehri\" olarak andığı Amasya'da sancak beyliği yapmış, devleti yönetecek ilmî ve idarî terbiyeyi bu vadide kazanmışlardır.",
        "**Pir İlyas (Şücâüddin İlyas) & Gümüşlüzâde Ailesi:** Halvetiyye tarikatının Anadolu'daki önemli temsilcilerinden Pir İlyas, Amasya'nın manevi iklimini asırlar boyunca besleyen irfan ocaklarının başındadır.",
        "**Şeyh Hamdullah (1429–1520):** \"Kıbletü'l-Küttâb\" (Hattatların Kıblesi) unvanıyla anılan, Osmanlı hat sanatına kimliğini kazandıran büyük üstat Amasya'da yetişmiştir.",
        "**Sabuncuoğlu Şerefeddin (1385–1468):** Osmanlı tıbbının öncü cerrahı, Amasya Bimarhanesi'nde 14 yıl başhekimlik yapmış ve *Cerrahiyyetü'l-Haniyye* adlı resimli tıp eserini burada kaleme almıştır."
      ],
      "five_day_plan": [
        "**1. Gün (Nehir Kıyısı ve Külliye):** Sabah Amasya İl Halk Kütüphanesi'nde çalışma mesaisi; öğleden sonra Sultan II. Bayezid Külliyesi, Alçak Köprü ve Yalıboyu Evleri boyunca yürüyüş; akşam Yeşilırmak kenarında tefekkür.",
        "**2. Gün (Harşena ve Kaya Mezarları):** Sabah mesaisi ardından Harşena Kalesi'ne tırmanış, Pontus Kral Kaya Mezarları ve Kızlar Sarayı kalıntılarının incelenmesi; gün batımında şehre panoramik bakış.",
        "**3. Gün (Tıp, İlim ve Müze Günü):** Sabuncuoğlu Tıp ve Cerrahi Tarihi Müzesi (Amasya Bimarhanesi), Amasya Arkeoloji Müzesi, Şehzadeler Müzesi ve Saraydüzü Kışla Binası ziyareti.",
        "**4. Gün (Aşkın ve Suyun İzinde):** Ferhat ile Şirin Su Kanalı ve Aşıklar Müzesi, Gökmedrese Camii, Burmalı Minare Camii ve Pir İlyas Türbesi'nde manevi durak.",
        "**5. Gün (Tabiat ve Veda):** Boraboy Gölü Tabiat Parkı'na yarım günlük doğa kaçamağı, dönüşte tarihi çarşıdan Amasya çöreği ve elması temini ile menzile veda."
      ]
    },
    "05_Karadeniz/Artvin": {
      "plate": 8,
      "name": "Artvin",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 41.1828,
      "lng": 41.8183,
      "landmarks": [
        "Borçka Karagöl",
        "Şavşat Karagöl",
        "Mençuna Şelalesi",
        "Çoruh Vadisi",
        "Atatepe"
      ],
      "specialties": [
        "Karalahana Sarması",
        "Laz Böreği",
        "Mısır Ekmeği",
        "Kuymak (Muhlama)"
      ],
      "quote": "Bulutların üzerinde saklı Karagöl'ün zümrüt suları, dik yamaçların inadı ve doğanın muazzam zikri.",
      "library": "Artvin İl Halk Kütüphanesi - Yamaçta kurulu, manzaralı, dik yokuşlardan sonra dinlenip kod yazmak için ideal sessiz sığınak.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Artvin/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Artvin/gallery.jpg",
      "images": [
        "05_Karadeniz/Artvin/banner.jpg",
        "05_Karadeniz/Artvin/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Artvin/README.md",
      "slug": "Artvin",
      "content_size": 6069,
      "custom_quote": "Karagöl'ün büyüleyici yansımasında yeşilin binbir tonunu barındıran, dik yamaçların ve sisli yaylaların şehri.",
      "custom_library": "Artvin İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Çoruh Nehrinin şekillendirdiği Artvin, Gürcü krallıklarından Osmanlı'ya uzanan tarihi kaleleri ve eşsiz tabiatıyla doğu sınırımızın en dik duruşlu şehridir. Antik çağlarda Kolhis ve Tao-Klarceti coğrafyasının kalbinde yer alan Artvin; Bagratlı döneminden kalma görkemli taş manastırları, sarp kayalıklara kondurulmuş gözetleme kaleleri ve Osmanlı döneminde Yavuz Sultan Selim'in Trabzon valiliği sırasında fethedilen stratejik geçitleriyle zengin bir tarih barındırır. Türkiye'nin UNESCO Biyosfer Rezerv Alanı olan Camili (Macahel) Havzası ile dünyanın en derin kanyon vadilerinden Çoruh havzasına ev sahipliği yapar.",
      "literary_quotes": [
        "\"Artvin, gökyüzüne komşu toprakların, bulutlarla oynaşan dağların vatanıdır.\" — Bedri Rahmi Eyüboğlu",
        "\"Karagöl, yeşil dağların ortasına düşmüş zümrüt bir damla gibidir.\" — Evliya Çelebi",
        "\"Artvin'de yollar göğe doğru kıvrılır; insan her dönemeçte tabiatın azameti karşısında kendi küçüklüğünü yeniden keşfeder.\" — Seyyah Notu"
      ],
      "reflection": "Karagöl'ün kenarında sessizce otururken, doğanın kusursuz dengesini ve yaratıcının 'Musavvir' esmasının tecellilerini hayranlıkla tefekkür edersiniz. Çoruh Vadisi'nin derinliklerinden göğe uzanan sarp yamaçlar, sisin bir perde gibi açılıp kapandığı ladin ormanları arasında insana dünyevî gürültüden tamamen arınmış bir inziva hissi sunar.",
      "spiritual_figures": [
        "**Âşık Zülâlî (1873–1956):** Artvin'in Posof-Şavşat kültür havzasının güçlü halk ozanlarından olup Anadolu âşıklık geleneğinde hikmetli deyişleriyle iz bırakmıştır.",
        "**İskender Paşa & Osmanlı Serhat Beyleri:** 16. yüzyılda Artvin ve Ardanuç havalisinin Osmanlı idaresine katılmasında öncülük eden, Ardanuç'ta kendi adını taşıyan cami ve türbeyi inşa ettiren tarihî şahsiyetlerdir.",
        "**Halk İrfanı ve Yayla Kültürü:** Kafkasör, Macahel ve Şavşat yaylalarında nesilden nesile aktarılan ahşap cami mimarisi (özellikle çivisiz ahşap işleme sanatıyla Maral ve Camili camileri) bölgenin estetik ve manevi zarafetinin yaşayan nişanesidir."
      ],
      "five_day_plan": [
        "**1. Gün (Şehir Merkezi ve Çoruh Panoraması):** Sabah Artvin İl Halk Kütüphanesi'nde çalışma; öğleden sonra Artvin Kalesi (Livana Kalesi), Kafkasör Yaylası ve şehri kuş bakışı gören Atatepe ziyareti.",
        "**2. Gün (Borçka Karagöl):** Sabah erken hareketle Borçka Karagöl Tabiat Parkı'na yolculuk; göl çevresinde tam tur yürüyüş, göl kenarında kitap okuma ve fotoğraf çekimi.",
        "**3. Gün (Arhavi ve Mençuna Şelalesi):** Çifte Köprü (Ortacalar) üzerinden Kamilet Vadisi'ne giriş; orman içi patikadan tırmanarak Mençuna Şelalesi'nin serinliğinde mola.",
        "**4. Gün (Şavşat ve Cittaslow Huzuru):** \"Sakin Şehir\" Şavşat'a uzanış; Şavşat Karagöl, Tibeti Kilisesi kalıntıları ve ahşap mimarili köylerde geleneksel Karadeniz dokusunu gözlemleme.",
        "**5. Gün (Ardanuç ve Cehennem Deresi Kanyonu):** Sabah kütüphane mesaisini tamamlama; öğleden sonra Cehennem Deresi Kanyonu ve İskender Paşa Camii ziyaretiyle Artvin menzilini tamamlama."
      ]
    },
    "05_Karadeniz/Bartin": {
      "plate": 74,
      "name": "Bartın",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 41.6344,
      "lng": 32.3375,
      "landmarks": [
        "Amasra Kalesi",
        "Kemere Köprüsü",
        "Güzelcehisar Lav Sütunları",
        "İnkumu Plajı"
      ],
      "specialties": [
        "Amasra Salatası",
        "Bartın Pompom Helvası",
        "Kabak Burması"
      ],
      "quote": "Fatih Sultan Mehmet'in 'Çeşm-i Cihan (Dünyanın Gözbebeği) burası mı ola?' dediği büyüleyici sahil kenti.",
      "library": "Bartın İl Halk Kütüphanesi - Karadeniz kıyısında huzurlu çalışma ortamı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Bartin/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Bartin/gallery.jpg",
      "images": [
        "05_Karadeniz/Bartin/banner.jpg",
        "05_Karadeniz/Bartin/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Bartin/README.md",
      "slug": "Bartin",
      "content_size": 5589,
      "history": "Antik çağlarda *Parthenios* (\"Sular Tanrısı / Bakireler Irmağı\") adıyla bilinen Bartın Çayı'nın etrafında kurulan Bartın, Batı Karadeniz'in en zarif tarih ve tabiat sentezlerinden biridir. MÖ 12. yüzyıldan itibaren Paflagonya, Fenike, Miletos, Roma, Bizans, Ceneviz ve Osmanlı medeniyetlerine ev sahipliği yapan bölge, özellikle 1460 yılında Fatih Sultan Mehmet'in savaşsız teslim aldığı Amasra Kalesi ile Osmanlı denizcilik ve sanat tarihinde özel bir yere sahiptir. Türkiye'de üzerinde gemi taşımacılığı yapılabilen tek akarsu olan Bartın Çayı, geleneksel ahşap Bartın evleri, 80 milyon yıllık Güzelcehisar Bazalt Lav Sütunları ve Küre Dağları Milli Parkı'nın bakir kanyonlarıyla Bartın, keşfedilmeyi bekleyen saklı bir hazinedir.",
      "literary_quotes": [
        "\"Lala, Lala! Çeşm-i Cihan bu m'ola?\" — Fatih Sultan Mehmet (Amasra'ya ilk bakışı, 1460)",
        "\"Amasra, bir yarımada üzerinde iki limanı kucaklayan, kalesi ve yeşiliyle gönülleri fetheden nadide bir beldedir.\" — Evliya Çelebi",
        "\"Bartın Çayı usulca akarken, eski ahşap konakların cumbaları suya kendi tarihini fısıldar.\" — Seyyah Beklentisi"
      ],
      "spiritual_figures": [
        "**Fatih Sultan Mehmet (1432–1481):** 1460'ta Amasra'ya tepeden baktığında hocası Lala'ya *\"Lala, Lala! Çeşm-i Cihan bu m'ola?\"* (Dünyanın göz bebeği burası mıdır?) diyerek şehrin güzelliğini tarihe mühürlemiştir.",
        "**Halil Bey & Bartın Vakıf Kültürü:** 18. ve 19. yüzyıllarda Bartın'da inşa edilen Şadırvan Camii, İbrahim Paşa Camii (Orta Cami) ve tarihî ahşap hanlar şehrin esnaf ve vakıf zarafetini yansıtır.",
        "**Barış Akarsu (1979–2007):** Amasra'nın yetiştirdiği sevilen sanatçı; ilçenin kültürel hafızasında ve sahilindeki heykelinde sevgiyle yaşatılmaktadır.",
        "**Tel Kırma Ustaları (Bartın Kadınları):** Yüzyıllardır gümüş ve altın tellerle tül üzerine işlenen coğrafi işaretli Bartın tel kırma sanatı, şehrin ince estetik ruhunu temsil eder."
      ],
      "five_day_plan": [
        "**1. Gün (Bartın Merkezi ve Çay Kıyısı):** Sabah kütüphane mesaisi; öğleden sonra Bartın Çayı kenarında yürüyüş, tarihî ahşap Bartın evleri, Kemal Samancıoğlu Etnografya Müzesi ve Tarihi Galla Pazarı (Kadınlar Pazarı).",
        "**2. Gün (Amasra – Çeşm-i Cihan):** Amasra Kalesi, Roma dönemi Kemere Köprüsü, Amasra Müzesi, Çekiciler Çarşısı, Fatih Camii ve Boztepe'de gün batımı; akşam Amasra salatası eşliğinde balık.",
        "**3. Gün (Güzelcehisar Lav Sütunları ve İnkumu):** 80 milyon yıllık volkanik Güzelcehisar Bazalt Lav Sütunları ahşap yürüyüş yolu, ardından İnkumu Plajı ve Seyir Terası'ndan Karadeniz ufku.",
        "**4. Gün (Ulus ve Küre Dağları Milli Parkı):** Ulus ilçesindeki Ulukaya Şelalesi ve Kanyonu'nda doğa yürüyüşü; Anadolu'nun en zengin orman ekosistemlerinden birinde oksijen ve tefekkür molası.",
        "**5. Gün (Kuşkayası Yol Anıtı ve Veda):** Roma İmparatoru Claudius döneminden kalma Anadolu'daki tek yol anıtı Kuşkayası'nı ve Bakacak Tepesi'ni ziyaret ederek Bartın dosyasını kapatma."
      ]
    },
    "05_Karadeniz/Bayburt": {
      "plate": 69,
      "name": "Bayburt",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 40.2552,
      "lng": 40.2249,
      "landmarks": [
        "Bayburt Kalesi",
        "Baksı Müzesi",
        "Kenan Yavuz Etnografya Müzesi",
        "Çoruh Nehri",
        "Saat Kulesi"
      ],
      "specialties": [
        "Bayburt Ketesi",
        "Tatlı Çorba",
        "Galaçoş",
        "Lor Dolması"
      ],
      "quote": "Çoruh Nehri'nin ikiye böldüğü kadim kale kenti ve bozkırın ortasında modern sanatın zirvesi Baksı Müzesi.",
      "library": "Bayburt İl Halk Kütüphanesi - Çoruh Nehri kıyısında, sessiz ve sakin bir çalışma ortamı.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Bayburt/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Bayburt/gallery.jpg",
      "images": [
        "05_Karadeniz/Bayburt/banner.jpg",
        "05_Karadeniz/Bayburt/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Bayburt/README.md",
      "slug": "Bayburt",
      "content_size": 6153,
      "custom_quote": "Baksı Müzesi ile modern sanatı bozkırın tepesinde buluşturan, Çoruh'un serinlettiği tarihi kale şehir.",
      "custom_library": "Bayburt İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "İpek Yolu üzerinde yer alan Bayburt, tarihi kalesi ve yetiştirdiği aşıklarla meşhur olup, Baksı Müzesi ile geleneksel ve moderni harmanlamıştır. Tarihî kaynaklarda \"Paypert\" adıyla anılan bu kadim şehir, Urartulardan Roma'ya, Saltuklulardan Danişmendlilere, Akkoyunlulardan Osmanlı'ya kadar Doğu Karadeniz ile Doğu Anadolu arasındaki en mühim geçiş kapısı olmuştur. Çoruh Nehri'nin ikiye böldüğü şehir merkezinde yükselen heybetli Bayburt Kalesi (Çinimaçin Kalesi), asırlar boyunca kervanların güvenliğini sağlayan sarsılmaz bir kale-şehir kimliği taşımıştır.",
      "literary_quotes": [
        "\"Bayburt Kalesi, Çoruh'un üzerinde yükselen ihtişamlı bir kartal yuvasıdır.\" — Evliya Çelebi",
        "\"Baksı, bozkırın tepesinde yükselen bir çağdaş sanat ve irfan vahasıdır.\" — Hüsamettin Koçan",
        "\"Vardım ki yurdundan ayağ göçürmüş, / Yavru gitmiş ıssız kalmış otağı...\" — Bayburtlu Zihni"
      ],
      "reflection": "Bayburt Kalesi'nin surlarından Çoruh Nehrini izlerken, asırlar boyu bu kalede nöbet tutan askerleri ve tarihin nöbetleşe geçen doğasını tefekkür edersiniz. Bozkırın ortasında yükselen Baksı Müzesi'nde ise insanın köklerinden kopmadan geleceğe nasıl köprü kurabileceğine dair derin bir ilham bulursunuz.",
      "spiritual_figures": [
        "**Dede Korkut:** Oğuz Türklerinin bilge atası Dede Korkut'un anlatılarında Bayburt (\"Bayburt Hisarı\") Bamsı Beyrek destanının merkezinde yer alır; şehir her yıl Dede Korkut Kültür ve Sanat Şölenleriyle bu mirası yaşatır.",
        "**Bayburtlu Zihni (1797–1859):** Türk halk ve divan edebiyatının usta şairi; *\"Vardım ki yurdundan ayağ göçürmüş...\"* koşmasıyla Anadolu'nun hüznünü ve vatan sevgisini mısralara dökmüştür.",
        "**Şair Celâlî (1845–1915):** Bayburt âşıklık geleneğinin en dokunaklı isimlerinden biri olup içli ağıtları ve deyişleriyle şehrin sözlü hafızasında yaşar.",
        "**İrşâdî Baba (1779–1884):** Bayburt'un manevi büyüklerinden, tasavvuf şairi ve gönül ehli.",
        "**Prof. Dr. Hüsamettin Koçan:** Doğduğu Bayraktar köyünün tepesinde Baksı Müzesi'ni kurarak çağdaş sanat ile Anadolu el sanatlarını buluşturmuş ve Bayburt'a Avrupa Konseyi Müze Ödülü'nü kazandırmıştır."
      ],
      "five_day_plan": [
        "**1. Gün (Kale ve Çoruh Kıyısı):** Sabah Bayburt İl Halk Kütüphanesi'nde çalışma; öğleden sonra Bayburt Kalesi'ne çıkış, Tarihi Saat Kulesi, Ulu Cami ve Çoruh Nehri kenarında yürüyüş.",
        "**2. Gün (Baksı Müzesi – Sanatın Zirvesi):** Bayraktar köyüne hareket ederek Baksı Müzesi'nin sergi salonlarını, yöresel el sanatları atölyelerini ve Çoruh vadisine bakan terasını keşif.",
        "**3. Gün (Aydıntepe Yeraltı Şehri):** Sabah mesaisi sonrası Aydıntepe ilçesine geçerek tüf kayalara oyulmuş binlerce yıllık Aydıntepe Yeraltı Şehri'ni ve Aydıntepe Yaylası'nı ziyaret.",
        "**4. Gün (Kenan Yavuz Etnografya Müzesi & Dede Korkut):** Beşpınar köyündeki ödüllü Kenan Yavuz Etnografya Müzesi'nde Anadolu köy hayatının canlı hafızasını deneyimleme; Masat köyünde Dede Korkut Türbesi'nde dua.",
        "**5. Gün (Kop Şehitliği ve Veda):** Sabah kütüphane çalışması; öğleden sonra Sırakayalar Şelalesi veya Kop Dağı Şehitliği ziyareti, yerel fırından Bayburt ketesi alarak yola devam."
      ]
    },
    "05_Karadeniz/Bolu": {
      "plate": 14,
      "name": "Bolu",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 40.7358,
      "lng": 31.6061,
      "landmarks": [
        "Abant Gölü",
        "Gölcük Tabiat Parkı",
        "Yedigöller Milli Parkı",
        "Göynük Tarihi Evleri"
      ],
      "specialties": [
        "Mengen Aşçı Yemekleri",
        "Abant Kebabı",
        "Bolu Çikolatası",
        "Saray Helvası"
      ],
      "quote": "Yedigöller'in tabiat paleti, Osmanlı kasabası Göynük ve Akşemseddin Hazretleri'nin manevi gölgesi.",
      "library": "Bolu İl Halk Kütüphanesi - Göller ve ormanlar diyarı Bolu'da verimli bir çalışma alanı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Bolu/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Bolu/gallery.jpg",
      "images": [
        "05_Karadeniz/Bolu/banner.jpg",
        "05_Karadeniz/Bolu/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Bolu/README.md",
      "slug": "Bolu",
      "content_size": 5434,
      "history": "Antik çağlarda *Claudiopolis* (Bithynium) adıyla bilinen Bolu, İstanbul ile Ankara arasındaki kadim geçiş yolunun tam kalbinde, %65'inden fazlası ormanlarla kaplı eşsiz bir tabiat ve irfan yurdudur. Roma, Bizans ve Osmanlı dönemlerinde stratejik bir konaklama ve ilim güzergâhı olan Bolu; Abant, Gölcük ve Yedigöller gibi masalsı krater/heyelan göllerinin yanı sıra Cittaslow (Sakin Şehir) unvanlı Göynük ve Mudurnu ilçeleriyle Osmanlı ahşap sivil mimarisinin en özgün örneklerini günümüze taşır. Aynı zamanda Mengen ilçesiyle Osmanlı saray mutfağından günümüze uzanan Türk aşçılık geleneğinin başkentidir.",
      "literary_quotes": [
        "\"Benden selam olsun Bolu Beyi'ne / Çıkıp şu dağlara yaslanmalıdır!\" — Köroğlu",
        "\"Bolu Dağları'nın ormanları öylesine gürdür ki gökyüzü yaprakların arasından güçlükle seçilir; havası ve suları cana şifadır.\" — Evliya Çelebi",
        "\"Göynük'ün ahşap konakları arasında yürürken, Akşemseddin'in dingin nefesi hâlâ vadide hissedilir.\" — Seyyah Beklentisi"
      ],
      "spiritual_figures": [
        "**Akşemseddin Hazretleri (1389–1459):** İstanbul'un manevi fatihi, Fatih Sultan Mehmet'in hocası, aynı zamanda tıp ve mikrobiyolojinin öncüsü büyük mutasavvıf; fetihten sonra Göynük'e yerleşmiş ve türbesi bugün Göynük'ün manevi kalbi olmuştur.",
        "**Köroğlu (16. yüzyıl):** *\"Benden selam olsun Bolu Beyi'ne!\"* diyerek haksızlığa karşı direnişin, yiğitliğin ve halk ozanlığının destansı sembolü olan efsanevi kahraman.",
        "**Şeyhülislam İbn-i Kemal & Mudurnu Ahileri:** Mudurnu'da asırlardır her Cuma günü süregelen \"Esnaf Duası\" geleneği, Anadolu Ahilik ahlakının yaşayan en köklü örneklerindendir.",
        "**İzzet Baysal (1907–2000):** \"Bolu'nun Babası\" olarak anılan büyük hayırsever; kurduğu vakıf aracılığıyla Bolu'ya üniversite, hastaneler ve yüzlerce eğitim kurumu kazandırarak vakıf medeniyetini modern çağda yaşatmıştır."
      ],
      "five_day_plan": [
        "**1. Gün (Bolu Merkez ve Gölcük):** Sabah Bolu İl Halk Kütüphanesi'nde çalışma; öğleden sonra Yıldırım Bayezid Camii, Tarihi Yukarı Taşhan, Bolu Müzesi ve akşamüstü kartpostallık Gölcük Tabiat Parkı yürüyüşü.",
        "**2. Gün (Yedigöller Milli Parkı):** Büyükgöl, Seringöl, Deringöl, Nazlıgöl, Küçükgöl, İncegöl ve Sazlıgöl'ü kapsayan tam günlük doğa yürüyüşü; Kapankaya Seyir Terası'ndan orman denizi.",
        "**3. Gün (Göynük – Akşemseddin Menzili):** Cittaslow Göynük'e yolculuk; Akşemseddin Türbesi ve Gazi Süleyman Paşa Camii'nde manevi durak, Zafer Kulesi'ne çıkış ve tarihî Osmanlı sokakları.",
        "**4. Gün (Abant Gölü ve Mudurnu):** Sabah Abant Gölü Milli Parkı çevresinde yürüyüş; öğleden sonra Mudurnu'nun ahşap konakları, Armutçular Konağı, Yıldırım Bayezid Camii ve Cuma Esnaf Duası kültürü.",
        "**5. Gün (Seben Kaya Evleri veya Kartalkaya/Aladağlar & Veda):** Sabah kütüphane mesaisi; öğleden sonra Seben Solaklar Kaya Evleri veya Aladağ Yaylaları'nda veda yürüyüşü ve saray helvası temini."
      ]
    },
    "05_Karadeniz/Corum": {
      "plate": 19,
      "name": "Çorum",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 40.5506,
      "lng": 34.9556,
      "landmarks": [
        "Hattuşaş (Boğazkale) Hitit Başkenti",
        "Alacahöyük",
        "Saat Kulesi",
        "Ulu Cami",
        "İncesu Kanyonu"
      ],
      "specialties": [
        "Çorum Leblebisi",
        "Çorum Mantısı",
        "İskilip Dolması"
      ],
      "quote": "3500 yıllık Hitit İmparatorluğu'nun başkenti Hattuşaş'ın aslanlı kapıları ve taş kabartmaları.",
      "library": "Çorum İl Halk Kütüphanesi - Sessiz ve düzenli çalışma odalarıyla odaklanmayı kolaylaştıran sakin bir Anadolu kütüphanesi.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Corum/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Corum/gallery.jpg",
      "images": [
        "05_Karadeniz/Corum/banner.jpg",
        "05_Karadeniz/Corum/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Corum/README.md",
      "slug": "Corum",
      "content_size": 6216,
      "custom_quote": "Hattuşaş antik kentinin binlerce yıllık mabet kalıntılarıyla Hitit uygarlığının gücünü fısıldayan kadim topraklar.",
      "custom_library": "Corum İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Hitit İmparatorluğu'nun başkenti olan Hattuşaş ve Alacahöyük gibi dünyanın en eski arkeolojik alanlarına sahip olan Çorum, insanlık tarihinin en önemli kapılarından biridir. UNESCO Dünya Mirası Listesi'nde yer alan Hattuşaş, tarihin bilinen ilk yazılı barış antlaşması olan Kadeş Antlaşması'nın kil tabletlerine ev sahipliği yapmıştır. Hititlerden Friglere, Roma'dan Danişmendlilere, Selçuklulardan Osmanlı'ya uzanan kesintisiz yerleşim tarihi; Kızılırmak ve Yeşilırmak havzalarının bereketiyle birleşerek Çorum'u hem arkeolojinin hem de Anadolu ahilik geleneğinin güçlü bir merkezine dönüştürmüştür.",
      "literary_quotes": [
        "\"Hattuşaş, taşın ve demirin Hitit ustaları eliyle şekillendiği, tarihin ilk büyük başkentidir.\" — Ekrem Akurgal",
        "\"Çorum, Hitit mirasının üzerinde yükselen bereketli bir Anadolu vahasıdır.\" — Evliya Çelebi",
        "\"Bin tanrılı Hitit ülkesinin taş kapılarından geçerken, dört bin yıl öncesinin diplomasi ve hukuk sesleri hâlâ rüzgârda yankılanır.\" — Seyyah Notu"
      ],
      "reflection": "Hattuşaş Yazılıkaya'daki kaya kabartmalarını incelerken, binlerce yıl önce yaşamış insanların inanç dünyasını ve zamanın acımasız akışını tefekkür edersiniz. Bir zamanlar koca bir imparatorluğa hükmeden surların bugün sessiz kır çiçeklerine ev sahipliği yapması, yeryüzünde kalıcı olanın yalnızca hakikat ve bırakılan hayırlı eserler olduğunu fısıldar.",
      "spiritual_figures": [
        "**Şeyhülislam Ebussuud Efendi (1490–1574):** Kanuni Sultan Süleyman döneminin büyük İslam hukukçusu ve Şeyhülislamı, İskilip kökenli olup Osmanlı hukuk sistemini şekillendiren eserler vermiştir.",
        "**Koyun Baba (15. yüzyıl):** Osmancık'ta türbesi bulunan, Anadolu'nun manevi fatihlerinden ve Horasan erenlerinden olan büyük veli; adına II. Bayezid tarafından görkemli bir köprü (Koyunbaba Köprüsü) inşa ettirilmiştir.",
        "**İskilipli Âtıf Hoca (1875–1926):** Osmanlı'nın son döneminde yetişmiş müderris ve âlim, Çorum'un İskilip ilçesinin ilmî birikimini temsil eden isimlerdendir.",
        "**Sahabeden Suheyb-i Rûmî ve Hıdırlık Makamları:** Çorum Hıdırlık mevkiinde yer alan sahabe makamları, şehrin asırlardır süregelen ziyaret ve maneviyat kültürünün merkezidir."
      ],
      "five_day_plan": [
        "**1. Gün (Şehir Merkezi ve Tarihi Çarşı):** Sabah Çorum İl Halk Kütüphanesi'nde çalışma; öğleden sonra 1896 yapımı Saat Kulesi, Ulu Cami (Murad-ı Rabi Camii), Velipaşa Hanı ve Hıdırlık ziyareti.",
        "**2. Gün (Hattuşaş ve Yazılıkaya – Hitit Başkenti):** Boğazkale'ye tam günlük keşif; Aslanlı Kapı, Yerkapı tüneli, Kral Kapısı, Büyük Tapınak, Yeşil Taş ve Yazılıkaya Açık Hava Tapınağı.",
        "**3. Gün (Alacahöyük ve Çorum Müzesi):** Sabah Alacahöyük Sfenksli Kapı ve Kral Mezarları; öğleden sonra Hitit vazoları ve Kadeş tablet kopyalarının sergilendiği Çorum Müzesi.",
        "**4. Gün (İncesu Kanyonu ve Ortaköy Şapinuva):** Ortaköy'deki kadim Hitit şehri Şapinuva kalıntıları ve Çekerek Irmağı boyunca uzanan görkemli İncesu Kanyonu'nda doğa yürüyüşü.",
        "**5. Gün (Osmancık veya İskilip Hattı):** Osmancık'ta Koyunbaba Köprüsü ve Kandiber Kalesi (veya İskilip'te tarihi konaklar ve İskilip dolması tadımı); dönüşte taze kavrulmuş Çorum leblebisiyle veda."
      ]
    },
    "05_Karadeniz/Duzce": {
      "plate": 81,
      "name": "Düzce",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 40.8438,
      "lng": 31.1565,
      "landmarks": [
        "Güzeldere Şelalesi",
        "Samandere Şelalesi",
        "Akçakoca Ceneviz Kalesi",
        "Fakıllı Mağarası"
      ],
      "specialties": [
        "Düzce Köftesi",
        "İsli Düzce Çerkes Peyniri",
        "Fındık"
      ],
      "quote": "Şelalelerin coşkusu, yaylaların serinliği ve 81. ilimizin bereketli toprakları.",
      "library": "Düzce İl Halk Kütüphanesi - Sakin ve ferah salonlar.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Duzce/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Duzce/gallery.jpg",
      "images": [
        "05_Karadeniz/Duzce/banner.jpg",
        "05_Karadeniz/Duzce/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Duzce/README.md",
      "slug": "Duzce",
      "content_size": 5345,
      "history": "Batı Karadeniz'in Marmara'ya açılan yeşil kapısı olan Düzce, antik çağda *Prusias ad Hypium* (bugünkü Konuralp) adıyla Bitinya Krallığı'nın ve Roma İmparatorluğu'nun en parlak şehirlerinden biriydi. 1323 yılında Osman Gazi'nin silah arkadaşı Konuralp Bey tarafından fethedilerek Osmanlı topraklarına katılan bölge, bereketli Düzce Ovası, 130 metreden dökülen Güzeldere Şelalesi, Türkiye'nin ilk tescilli Tabiat Anıtı Samandere Şelalesi, Efteni Gölü kuş cenneti ve Karadeniz'in incisi Akçakoca sahilleriyle zengin bir coğrafi çeşitlilik sunar. Kafkasya'dan Balkanlar'a, Doğu Karadeniz'den Orta Anadolu'ya pek çok kültürün bir arada yaşadığı Düzce, aynı zamanda eşsiz bir gastronomi ve misafirperverlik mozaiğidir.",
      "literary_quotes": [
        "\"Prusias ad Hypium, tiyatrosu, su kemerleri ve verimli ovasıyla Bitinya'nın en mamur kentlerinden biridir.\" — Antik Kaynaklar",
        "\"Düzce'nin dağlarından inen her şelale, kayın ve gürgen ormanlarının kalbinden kopup gelen bir ferahlık bestesidir.\" — Seyyah Beklentisi"
      ],
      "spiritual_figures": [
        "**Konuralp Bey (ö. 1328):** Osman Gazi ve Orhan Gazi döneminin büyük akıncı komutanı; Düzce ve Akyazı havalisini fethederek bölgenin Türk-İslam kimliğini kurmuştur.",
        "**Akça Koca (ö. 1326):** Kocaeli ve Batı Karadeniz sahillerinin fatihi; Düzce'nin Karadeniz kıyısındaki şirin ilçesi Akçakoca adını bu büyük alpten alır.",
        "**Hemşin Köyü ve Orhangazi Ahşap Camileri:** Çivisiz ahşap geçme (çantı) tekniğiyle inşa edilen 14. ve 19. yüzyıl tarihî ahşap camileri, Düzce'nin ormanla bütünleşen manevi mimarisinin nadide eserleridir."
      ],
      "five_day_plan": [
        "**1. Gün (Konuralp Antik Kenti ve Müze):** Sabah Düzce İl Halk Kütüphanesi'nde çalışma; öğleden sonra Konuralp'te 2.000 yıllık *Prusias ad Hypium* Antik Tiyatrosu, Roma Köprüsü, Atlı Kapı ve Konuralp Müzesi.",
        "**2. Gün (Güzeldere Şelalesi ve Efteni Gölü):** Gölyaka ilçesinde 130 metre yükseklikten dökülen Güzeldere Şelalesi Tabiat Parkı ve 150'den fazla kuş türünün uğrak noktası Efteni Gölü Yaban Hayatı Geliştirme Sahası.",
        "**3. Gün (Samandere Şelalesi ve Aydınpınar):** Türkiye'nin ilk Tabiat Anıtı Samandere Şelalesi'nde \"Cadı Kazanı\" ve ahşap köprüler boyunca yürüyüş; ardından Aydınpınar Şelaleleri ve Pürenli/Kardüz Yaylası havası.",
        "**4. Gün (Akçakoca – Deniz, Kale ve Mağara):** UNESCO Geçici Miras Listesi'ndeki Akçakoca Ceneviz Kalesi, tarihî Yukarı Mahalle sivil mimari evleri, Fakıllı Mağarası ve Aktaş Şelalesi.",
        "**5. Gün (Tarihi Ahşap Camiler ve Veda):** Sabah kütüphane mesaisi; öğleden sonra Cumayeri/Çilimli hattında tarihî ahşap cami ziyareti ve yerel pazardan isli peynir ile fındık temini."
      ]
    },
    "05_Karadeniz/Giresun": {
      "plate": 28,
      "name": "Giresun",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 40.9128,
      "lng": 38.3895,
      "landmarks": [
        "Giresun Kalesi",
        "Giresun Adası",
        "Kümbet Yaylası",
        "Mavi Göl & Kuzalan Şelalesi",
        "Zeytinlik Mahallesi"
      ],
      "specialties": [
        "Giresun Fındığı",
        "Giresun Pidesi",
        "Karalahana Diblesi",
        "Isırgan Otu Çorbası"
      ],
      "quote": "Karadeniz'in iki yaşanabilir adasından birine ev sahipliği yapan, zümrüt fındık bahçeleri ve Mavi Göl mucizesi.",
      "library": "Giresun İl Halk Kütüphanesi - Harşit Vadisi ve deniz esintileriyle serin, sakin çalışma masaları mevcut.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Giresun/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Giresun/gallery.jpg",
      "images": [
        "05_Karadeniz/Giresun/banner.jpg",
        "05_Karadeniz/Giresun/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Giresun/README.md",
      "slug": "Giresun",
      "content_size": 5853,
      "custom_quote": "Karadeniz'in tek yaşanabilir adasına sahip olan, fındığın ve yeşilin dalgalarla buluştuğu sahil şehri.",
      "custom_library": "Giresun İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Antik adı Kerasus olan Giresun, fındığın anavatanı kabul edilir. Tarihi kalesi ve adasıyla Karadeniz mitolojisinde önemli bir yer tutar. Kiraz meyvesinin dünyaya adını veren (Kerasus → Cerasus / Cherry) bu kadim kıyı kenti, Pontus Krallığı'ndan Roma'ya, Çepni Türkmenlerinin yerleşiminden Osmanlı'ya uzanan köklü bir kültürel harmana sahiptir. Doğu Karadeniz'in tek doğal adası olan Giresun Adası (Aretias), Argonotlar efsanesinden Bizans manastır kalıntılarına kadar binlerce yıllık denizcilik hafızasını korur.",
      "literary_quotes": [
        "\"Giresun Kalesi, denize tepeden bakan ve dalgaların sesini dinleyen bir bekçidir.\" — Evliya Çelebi",
        "\"Giresun, fındık bahçelerinin yeşilliğinde saklanmış bir deniz güzelidir.\" — Bedri Rahmi Eyüboğlu",
        "\"Kerasus'tan dünyaya yayılan kiraz ve fındık, bu bereketli sahilin insanlığa armağanıdır.\" — Antik Tarih Kaydı"
      ],
      "reflection": "Giresun Kalesi'nden Karadeniz'in sonsuz ufkuna bakarken, denizin azametini ve doğanın sunduğu sonsuz bereketi tefekkür edersiniz. Kuzalan'daki turkuaz Mavi Göl'ün sularında ve Kümbet Yaylası'nın serin sisinde, tabiatın insan ruhuna sunduğu şifayı derinden hissedersiniz.",
      "spiritual_figures": [
        "**Topal Osman Ağa (1883–1923):** Milli Mücadele yıllarında Giresun gönüllü alaylarını kurarak Sakarya ve Büyük Taarruz'da büyük kahramanlıklar gösteren, anıt mezarı Giresun Kalesi'nde yer alan tarihî kahraman.",
        "**Seyyid Vakkas:** Giresun'un fethi ve İslamlaşması sürecinde iz bırakan, şehrin merkezindeki türbesiyle anılan manevi öncülerden.",
        "**Can Akengin (1892–1942):** Giresun'un yetiştirdiği önemli şair, ressam ve fikir adamı; şehrin sanat ve edebiyat hayatına öncülük etmiştir.",
        "**Hacı Miktad & Tarihi Vakıf Banileri:** Giresun merkezindeki Hacı Miktad Camii ve Zeytinlik Mahallesi'nin tarihî dokusunu oluşturan hayır sahipleri."
      ],
      "five_day_plan": [
        "**1. Gün (Kale ve Zeytinlik Mahallesi):** Sabah Giresun İl Halk Kütüphanesi'nde mesai; öğleden sonra Giresun Kalesi, Topal Osman Ağa Anıt Mezarı, tarihî taş evlerin bulunduğu Zeytinlik Mahallesi ve Gogora Kilisesi (Giresun Müzesi).",
        "**2. Gün (Giresun Adası ve Sahil Şeridi):** Tekne turuyla Karadeniz'in tek adası Giresun Adası'na geçiş, Hamza Taşı ve antik sur kalıntılarını inceleme; akşam sahil parkında çay molası.",
        "**3. Gün (Kuzalan Şelalesi ve Mavi Göl):** Dereli ilçesi üzerinden Kuzalan Tabiat Parkı'na yolculuk; kireçtaşı ve sodalı suyun oluşturduğu turkuaz Mavi Göl ile Kuzalan Şelalesi'nde doğa yürüyüşü.",
        "**4. Gün (Kümbet Yaylası):** Yayla yolundan tırmanarak Giresun'un en meşhur yaylası Kümbet'te sisli çam ormanları arasında yürüyüş, yayla pazarı ve yöresel kahvaltı.",
        "**5. Gün (Tirebolu Kalesi ve Veda):** Sabah kütüphane çalışması; öğleden sonra sahil boyunca Tirebolu Kalesi'ne uğrayıp taze Giresun fındığı alarak Doğu Karadeniz rotasına devam."
      ]
    },
    "05_Karadeniz/Gumushane": {
      "plate": 29,
      "name": "Gümüşhane",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 40.46,
      "lng": 39.47,
      "landmarks": [
        "Karaca Mağarası",
        "Torul Cam Seyir Terası",
        "Tomara Şelalesi",
        "Süleymaniye Mahallesi",
        "Krom Vadisi"
      ],
      "specialties": [
        "Pestil & Köme",
        "Siron",
        "Kete",
        "Gümüşhane Elması"
      ],
      "quote": "Vadiler arasına gizlenmiş sarkıt cenneti Karaca Mağarası ve gümüş madenleriyle parlayan Süleymaniye.",
      "library": "Gümüşhane İl Halk Kütüphanesi - Vadinin serinliğinde, odaklanmayı kolaylaştıran butik ve huzurlu çalışma alanı.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Gumushane/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Gumushane/gallery.jpg",
      "images": [
        "05_Karadeniz/Gumushane/banner.jpg",
        "05_Karadeniz/Gumushane/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Gumushane/README.md",
      "slug": "Gumushane",
      "content_size": 5670,
      "custom_quote": "Karaca Mağarası'nın büyüleyici sarkıtlarıyla yeraltı saraylarını andıran, vadiler arasına gizlenmiş gümüş şehir.",
      "custom_library": "Gumushane İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Tarih boyunca gümüş madenleriyle bilinen ve İpek Yolu'nun güvenliğini sağlayan Gümüşhane, tarihi konakları ve mağaralarıyla ünlüdür. Antik çağlarda *Argyropolis* (Gümüş Şehir) olarak anılan şehir, Zigana Geçidi'nin hemen güneyinde Harşit Çayı vadisinde konumlanır. Kanuni Sultan Süleyman'ın emriyle kurulan ve darphanesiyle Osmanlı hazinesine gümüş akçeler basan tarihi Süleymaniye Mahallesi; camileri, kiliseleri, hamamları ve konaklarıyla asırlar boyunca çok kültürlü bir medeniyet mozaiğine ev sahipliği yapmıştır.",
      "literary_quotes": [
        "\"Gümüşhane, adı gibi gümüş madenleriyle parlayan, vadilerin arasına gizlenmiş hazinedir.\" — Evliya Çelebi",
        "\"Zigana'yı aşınca sisin yerini keskin bir dağ havası ve asırların gümüş hikâyeleri alır.\" — Seyyah Notu"
      ],
      "reflection": "Karaca Mağarası'nın derinliklerinde, binlerce yılda oluşan damlaların inşa ettiği sütunlara bakıp doğanın sabrını tefekkür edersiniz. Eski Süleymaniye Mahallesi'nin taş sokaklarında yürürken, bir zamanlar darphanenin çekiç sesleriyle yankılanan vadinin bugünkü dinginliğinde zamanın ve emeğin değerini hissedersiniz.",
      "spiritual_figures": [
        "**Ahmed Ziyâüddin Gümüşhânevî (1813–1893):** 19. yüzyıl Osmanlı ilim ve tasavvuf dünyasının en büyük âlimlerinden, *Râmûzü'l-Ehâdîs* müellifi ve hadis üstadı; Gümüşhane'nin manevi mirasının zirve ismidir.",
        "**Çağırgan Baba (15. yüzyıl):** Şiran ve Kelkit havzasının manevi mimarlarından olan Horasan ereni; tekkesi ve türbesiyle bölgenin gönül coğrafyasını aydınlatmıştır.",
        "**Kanuni Sultan Süleyman:** Eski Gümüşhane'nin (Süleymaniye Mahallesi) imarına öncülük ederek şehri önemli bir maden ve darphane merkezine dönüştürmüştür."
      ],
      "five_day_plan": [
        "**1. Gün (Eski Şehir Süleymaniye Mahallesi):** Sabah Gümüşhane İl Halk Kütüphanesi'nde çalışma; öğleden sonra Eski Gümüşhane (Süleymaniye) sokakları, Süleymaniye Camii, eski darphane kalıntıları ve tarihi konaklar.",
        "**2. Gün (Karaca Mağarası ve Torul Cam Teras):** Torul ilçesine hareket; damlataş oluşumlarıyla büyüleyen Karaca Mağarası ve 240 metre yükseklikteki Torul Kalesi Cam Seyir Terası.",
        "**3. Gün (Kromni Vadisi ve Santa Harabeleri):** Arkeolojik sit alanı olan Kromni Vadisi'ndeki tarihi taş yapılar, kiliseler ve yüksek dağ yaylalarının dingin atmosferi.",
        "**4. Gün (Limni Gölü ve Zigana):** Torul'un çam ormanları arasındaki Limni Gölü Tabiat Parkı'nda göl kenarında dinlenme ve Zigana Dağı geçidinde serin yayla havası.",
        "**5. Gün (Tomara Şelalesi ve Veda):** Sabah kütüphane mesaisi; öğleden sonra Şiran ilçesindeki 40 ayrı gözden fışkıran Tomara Şelalesi Tabiat Parkı ve merkezden pestil-köme alışverişiyle veda."
      ]
    },
    "05_Karadeniz/Karabuk": {
      "plate": 78,
      "name": "Karabük",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 41.2061,
      "lng": 32.6204,
      "landmarks": [
        "Safranbolu Tarihi Evleri",
        "Kristal Teras",
        "Tokatlı Kanyonu",
        "Bulak Mencilis Mağarası",
        "Yörük Köyü"
      ],
      "specialties": [
        "Safranbolu Lokumu",
        "Bükme Pide",
        "Kuyu Kebabı",
        "Safran Çayı"
      ],
      "quote": "UNESCO Dünya Mirası Safranbolu'nun asırlık ahşap konakları, taş sokakları ve safranın eşsiz kokusu.",
      "library": "Karabük İl Halk Kütüphanesi - Safranbolu'nun tarihi atmosferine yakın sessiz kütüphane.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Karabuk/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Karabuk/gallery.jpg",
      "images": [
        "05_Karadeniz/Karabuk/banner.jpg",
        "05_Karadeniz/Karabuk/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Karabuk/README.md",
      "slug": "Karabuk",
      "content_size": 5666,
      "history": "Karabük, bir yanda Türkiye'nin ilk ağır sanayi hamlesi olan 1937 tarihli Demir Çelik Fabrikaları'yla Cumhuriyet'in sanayi hafızasını, diğer yanda 1994'te UNESCO Dünya Mirası Listesi'ne giren Safranbolu ile Osmanlı şehir medeniyetinin en saf ve eksiksiz açık hava müzesini barındırır. Antik Paflagonya coğrafyasının kalbinde yer alan Eskipazar'daki *Hadrianopolis* Antik Kenti (\"Karadeniz'in Zeugma'sı\"), görkemli kilise mozaikleriyle erken Bizans sanatına ışık tutar. Safranbolu'nun 300 yıllık konakları, Cinci Hanı, Yemeniciler Arastası ve Yenice'nin UNESCO tarafından dünya çapında korunması gereken sıcak nokta ilan edilen anıt ormanlarıyla Karabük, tarih ile tabiatın baş döndürücü bir buluşmasıdır.",
      "literary_quotes": [
        "\"Safranbolu, zamanın durduğu değil, zamanın nezaketle muhafaza edildiği bir Osmanlı rüyasıdır.\" — Kültür ve Mimari Notu",
        "\"Bir şehrin ahlakını anlamak istersen evlerinin pencerelerine bak; Safranbolu'da hiçbir konak komşusunun güneşini ve manzarasını örtmez.\" — Seyyah Beklentisi",
        "\"Safranbolu'nun havası latif, suları leziz, bağ ve bahçeleri cennet misalidir.\" — Evliya Çelebi"
      ],
      "spiritual_figures": [
        "**Köprülü Mehmet Paşa (1578–1661):** Osmanlı'nın duraklama dönemine nefes aldıran büyük sadrazam; Safranbolu'da inşa ettirdiği Köprülü Mehmet Paşa Camii ve güneş saatli avlusu şehrin kalbidir.",
        "**Sadrazam İzzet Mehmet Paşa (1743–1812):** Safranbolu doğumlu Osmanlı sadrazamı; doğduğu şehre kendi adını taşıyan zarif külliyeyi, saat kulesini ve kütüphaneyi armağan etmiştir.",
        "**Safranbolu Ahileri ve Lonca Ustaları:** Yemeniciler Arastası, Demirciler Çarşısı ve Bakırcılar loncalarında \"komşusu siftah etmeden ikinci satışı yapmayan\" esnaf ahlakını yüzyıllar boyunca yaşatan gönül erleri.",
        "**Karabük Demir Çelik Emekçileri:** 3 Nisan 1937'de temeli atılan fabrikalarla \"Cumhuriyet kenti\" Karabük'ü yoktan var eden alın teri kahramanları."
      ],
      "five_day_plan": [
        "**1. Gün (Safranbolu Çarşı ve Konaklar):** Sabah kütüphane mesaisi; öğleden sonra Hıdırlık Tepesi'nden Safranbolu panoraması, Kaymakamlar Gezi Evi, Cinci Hanı, Köprülü Mehmet Paşa Camii (güneş saati), İzzet Paşa Camii ve Yemeniciler Arastası.",
        "**2. Gün (Kanyonlar, Teras ve Mağara):** Tokatlı Kanyonu yürüyüş parkuru, 80 metre yükseklikteki Kristal Cam Teras, İncekaya Su Kemeri ve 6 km uzunluğundaki Bulak Mencilis Mağarası.",
        "**3. Gün (Yörük Köyü ve Safran Tarlaları):** \"Safranbolu'nun küçük maketi\" olarak bilinen Türkmen yerleşimi Yörük Köyü, Sipahioğlu Konağı, Çamaşırhane ve Davutobası safran tarlaları.",
        "**4. Gün (Yenice Ormanları ve Şeker Kanyonu):** Biyoçeşitliliğiyle dünyaca ünlü Yenice Ormanları'nda doğa yürüyüşü, Ihlamur Teras ve Şeker Kanyonu'nun serin suları.",
        "**5. Gün (Eskipazar Hadrianopolis ve Veda):** \"Karadeniz'in Zeugma'sı\" Hadrianopolis Antik Kenti mozaikleri ziyareti; dönüşte Arasta'dan lokum ve safran alarak menzili tamamlama."
      ]
    },
    "05_Karadeniz/Kastamonu": {
      "plate": 37,
      "name": "Kastamonu",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 41.3887,
      "lng": 33.7827,
      "landmarks": [
        "Kastamonu Kalesi",
        "Nasrullah Camii ve Şadırvanı",
        "Valla Kanyonu",
        "Horma Kanyonu",
        "Şeyh Şaban-ı Veli Türbesi"
      ],
      "specialties": [
        "Kastamonu Pastırması",
        "Etli Ekmek",
        "Siyez Bulguru",
        "Çekme Helva",
        "Kuyu Kebabı"
      ],
      "quote": "Şeyh Şaban-ı Veli'nin manevi dergahı, İstiklal Yolu'nun kahraman kadınları ve Ilgaz Dağları'nın heybeti.",
      "library": "Kastamonu İl Halk Kütüphanesi - Tarihi şehir dokusunda ilham dolu çalışma noktası.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Kastamonu/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Kastamonu/gallery.jpg",
      "images": [
        "05_Karadeniz/Kastamonu/banner.jpg",
        "05_Karadeniz/Kastamonu/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Kastamonu/README.md",
      "slug": "Kastamonu",
      "content_size": 5827,
      "history": "\"Evliyalar Şehri\" ve Türk Dünyası Kültür Başkenti unvanlarıyla anılan Kastamonu, antik Paflagonya'nın başkenti olmasının ardından Danişmendliler, Çobanoğulları, Candaroğulları Beyliği ve Osmanlı dönemlerinde kesintisiz bir ilim, sanat ve devlet adamı yetiştirme merkezi olmuştur. UNESCO Dünya Mirası Listesi'ne giren 1366 tarihli **Kasaba Köyü Mahmut Bey Camii** (çivisiz ahşap direkli ve kalem işli şaheser), Kurtuluş Savaşı'nda İnebolu'dan Ankara'ya uzanan **İstiklal Yolu**'nun kalbi olması ve dünyanın en derin kanyonlarından Valla ile Horma kanyonlarına ev sahipliği yapmasıyla Kastamonu, Anadolu'nun en vakur kültür kalelerinden biridir.",
      "literary_quotes": [
        "\"Gelişiniz güle güle, gidişiniz güle güle, her işiniz güle güle...\" — Şeyh Şaban-ı Veli Hazretleri",
        "\"Nasrullah Şadırvanı'ndan su içen ya yedi yıl sonra yine gelir ya da Kastamonu'ya yerleşir.\" — Kadim Kastamonu Rivayeti",
        "\"Kastamonu, uleması, şairleri ve velileri bol; kalesi göğe baş uzatmış mübarek bir şehirdir.\" — Evliya Çelebi"
      ],
      "spiritual_figures": [
        "**Şeyh Şaban-ı Veli Hazretleri (1481–1569):** Anadolu'nun dört kutbundan (Hacı Bayram-ı Veli, Hacı Bektaş-ı Veli, Mevlânâ ve Şeyh Şaban-ı Veli) biri; Halvetî-Şabânî geleneğinin pîri. *\"Gelişiniz güle güle, gidişiniz güle güle, her işiniz güle güle...\"* duası asırlardır şehrin kapısında yankılanır.",
        "**Şerife Bacı (1900–1921):** İnebolu'dan cephane taşırken bebeğini ve mermileri ıslanmasın diye kazağıyla örtüp Kastamonu Kışlası önünde donarak şehit düşen Milli Mücadele'nin ölümsüz kahramanı.",
        "**Mehmet Âkif Ersoy (1873–1936):** 1920'de Kastamonu Nasrullah Camii kürsüsünden verdiği tarihî vaazlarla Anadolu halkını Milli Mücadele etrafında kenetlemiş, bu vaazlar *Sebîlürreşâd* ile tüm cephelere dağıtılmıştır.",
        "**Orhan Şaik Gökyay (1902–1994) & Rıfat Ilgaz (1911–1993):** *\"Bu Vatan Kimin?\"* şiirinin büyük edebiyatçısı Gökyay ile Cide'nin yetiştirdiği *Hababam Sınıfı* yazarı Rıfat Ilgaz Kastamonu'nun edebî mirasıdır."
      ],
      "five_day_plan": [
        "**1. Gün (Evliyalar ve Nasrullah Meydanı):** Sabah kütüphane mesaisi; öğleden sonra Şeyh Şaban-ı Veli Külliyesi ve Türbesi, Kastamonu Kalesi, Saat Kulesi, Nasrullah Camii ve Şadırvanı, Münire Medresesi ve Liva Paşa Konağı.",
        "**2. Gün (UNESCO Mirası Kasaba Köyü & Taşköprü):** Çivisiz ahşap mimarisiyle UNESCO Dünya Mirası olan 1366 tarihli Mahmut Bey Camii; ardından Taşköprü'de Pompeipolis Antik Kenti ve ünlü sarımsak çarşısı.",
        "**3. Gün (Pınarbaşı – Horma Kanyonu ve Ilıca Şelalesi):** Küre Dağları Milli Parkı'ndaki 3 km'lik ahşap yürüyüş platformuyla geçilen Horma Kanyonu, sonunda doğal havuzuyla büyüleyen Ilıca Şelalesi ve Valla Kanyonu Seyir Terası.",
        "**4. Gün (İnebolu – İstiklal Yolu ve Gideros Koyu):** Kurtuluş Savaşı'nın deniz kapısı İnebolu'nun aşı boyalı evleri ve Türk Ocağı binası; Cide sahilinde zümrüt yeşili Gideros Koyu.",
        "**5. Gün (Ilgaz Dağı veya Daday & Veda):** Sabah kütüphane mesaisi; öğleden sonra Ilgaz Dağı Milli Parkı'nda çam ormanları arasında yürüyüş, dönüşte çekme helva ve siyez bulguru teminiyle veda."
      ]
    },
    "05_Karadeniz/Ordu": {
      "plate": 52,
      "name": "Ordu",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 40.9839,
      "lng": 37.8764,
      "landmarks": [
        "Boztepe & Teleferik",
        "Yason Burnu & Kilisesi",
        "Perşembe Yaylası Menderesleri",
        "Kurul Kalesi",
        "Çambaşı Yaylası"
      ],
      "specialties": [
        "Ordu Pidesi",
        "Fındık",
        "Pancar Çorbası",
        "Melocan Kavurması"
      ],
      "quote": "Boztepe'den Karadeniz'in mavisine bakış ve Perşembe Yaylası'nın doğa harikası menderesleri.",
      "library": "Ordu İl Halk Kütüphanesi - Teleferik hattına yakın konumuyla mola vermeye uygun, çalışma salonları geniş.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Ordu/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Ordu/gallery.jpg",
      "images": [
        "05_Karadeniz/Ordu/banner.jpg",
        "05_Karadeniz/Ordu/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Ordu/README.md",
      "slug": "Ordu",
      "content_size": 5887,
      "custom_quote": "Boztepe'den Karadeniz'i ayaklar altına seren, mavi ile yeşilin en kusursuz birleştiği huzurlu sahil şehri.",
      "custom_library": "Ordu İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Antik dönemde Cotyora adıyla kurulan Ordu, Karadeniz'in en sakin ve gelişmiş kültür kentlerinden biridir. Yason Burnu'ndaki Argonotlar efsanesiyle bilinir. Ksenophon'un *Anabasis* (On Binlerin Dönüşü) eserinde ordusunu dinlendirdiği liman olarak kayda geçen Cotyora, yüzyıllar sonra Hacıemiroğulları Beyliği'nin ve Osmanlı'nın fındık bahçeleriyle bezeli bereketli kıyı şehrine dönüşmüştür. Kurul Kalesi'nde ortaya çıkarılan 2.100 yıllık Ana Tanrıça Kibele heykeli ile Perşembe Yaylası'nın eşsiz menderesleri, Ordu'nun hem arkeolojik hem de doğal zenginliğini gözler önüne serer.",
      "literary_quotes": [
        "\"Boztepe'ye çıkmalı ve Ordu'nun yeşilliğinde denizin nasıl eridiğini izlemeli.\" — Bedri Rahmi Eyüboğlu",
        "\"Yason Burnu, Karadeniz'in hırçın sularına uzanan tarihi ve sakin bir limandır.\" — Evliya Çelebi",
        "\"Ordu'nun dereleri aksa yukarı aksa...\" — Anonim Ordu Türküsü"
      ],
      "reflection": "Boztepe'den şehri ve denizi seyrederken, yeryüzünün güzelliğini ve gökyüzüyle bütünleşen ufuk çizgisini tefekkür edersiniz. Perşembe Yaylası'nın kıvrıla kıvrıla akan mendereslerini yukarıdan izlerken, suyun bile önüne çıkan engellere kızmadan zarafetle yolunu bulduğunu görüp sabrı yeniden öğrenirsiniz.",
      "spiritual_figures": [
        "**Şeyh Yunus (Yunus Emre Makamı – Ünye):** Ünye'de bulunan Yunus Emre türbesi/makamı, Anadolu'nun gönül dilinin Karadeniz sahillerindeki yankısıdır.",
        "**Emir Yakup & Hacıemiroğulları Beyliği:** 14. yüzyılda Ordu, Mesudiye ve Giresun havalisinde Türk-İslam kültürünü kökleştiren, Eskipazar ve Bayramlı yerleşimlerini kuran beylik önderleri.",
        "**Hamdullah Suphi Tanrıöver & Sıtkı Çebi:** Şehrin eğitim, kültür ve edebiyat hafızasına yön veren münevverler.",
        "**Perşembe (Vona) Sakin Şehir Kültürü:** Cittaslow unvanına sahip Perşembe ilçesi, denizle barışık, telaşsız Karadeniz yaşayışının yaşayan temsilcisidir."
      ],
      "five_day_plan": [
        "**1. Gün (Boztepe ve Sahil Yürüyüşü):** Sabah Ordu İl Halk Kütüphanesi'nde çalışma; öğleden sonra teleferikle 530 metre rakımlı Boztepe'ye çıkış, gün batımında Karadeniz manzarası eşliğinde çay ve Paşaoğlu Konağı Etnografya Müzesi.",
        "**2. Gün (Yason Burnu ve Perşembe Sakin Şehir):** Sahil yolundan Perşembe ilçesine uzanış; 1868 tarihli Yason Kilisesi, deniz feneri ve Hoynat Adası kuş cenneti.",
        "**3. Gün (Perşembe Yaylası Menderesleri):** Aybastı ilçesindeki Perşembe Yaylası'na tam günlük doğa rotası; dünyanın en estetik doğal mendereslerinin tepeden izlenmesi ve yayla gölü çevresinde yürüyüş.",
        "**4. Gün (Kurul Kalesi ve Ulugöl):** Sabah Kibele heykelinin bulunduğu antik Kurul Kalesi; öğleden sonra Gölköy'deki Ulugöl Tabiat Parkı'nın renk cümbüşünde sükunet molası.",
        "**5. Gün (Ünye ve Çambaşı / Veda):** Sabah kütüphane mesaisi sonrası Ünye Kalesi ve Çamlık sahilinde veda yürüyüşü, yerel fırından Ordu pidesiyle menzili tamamlama."
      ]
    },
    "05_Karadeniz/Rize": {
      "plate": 53,
      "name": "Rize",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 41.0201,
      "lng": 40.5234,
      "landmarks": [
        "Ayder Yaylası",
        "Pokut & Sal Yaylaları",
        "Zilkale",
        "Fırtına Vadisi",
        "Kaçkar Dağları Milli Parkı"
      ],
      "specialties": [
        "Rize Çayı",
        "Muhlama",
        "Rize Kavurması",
        "Laz Böreği",
        "Enişte Lokumu"
      ],
      "quote": "Kaçkarların sisli zirveleri, Fırtına Deresi'nin coşkusu ve dik yamaçlara serilmiş zümrüt çay bahçeleri.",
      "library": "Rize İl Halk Kütüphanesi - Çay tarlalarının yeşili eşliğinde, modern altyapısı ve güçlü internetiyle kodlama için ideal.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Rize/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Rize/gallery.jpg",
      "images": [
        "05_Karadeniz/Rize/banner.jpg",
        "05_Karadeniz/Rize/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Rize/README.md",
      "slug": "Rize",
      "content_size": 6102,
      "custom_quote": "Fırtına Deresi'nin coşkulu sesi, Zil Kale'nin sarp kayalıklardaki asil duruşu ve yeşilin vatanı Rize.",
      "custom_library": "Rize İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Çay tarımıyla özdeşleşen Rize, sarp vadileri, tarihi taş köprüleri ve geçit vermez kaleleriyle Karadeniz'in en karakteristik şehridir. Antik adı *Rhizus* (dağ eteği / kök) olan bu coğrafya; Kaçkar Dağları'nın 3.937 metrelik zirvelerinden Karadeniz'in hırçın dalgalarına dik inen vadileriyle dünyanın en yağışlı ve en yeşil ekosistemlerinden birini barındırır. 1461'de Trabzon'un fethiyle Osmanlı topraklarına katılan Rize, Cumhuriyet döneminde Zihni Derin'in öncülüğünde başlayan çay tarımıyla Türkiye'nin çay başkenti kimliğini kazanmış; kemer taş köprüleri, serenderleri ve bulut denizi üzerindeki yaylalarıyla eşsiz bir kültür havzası oluşturmuştur.",
      "literary_quotes": [
        "\"Zil Kale, bulutların arasında, sarp kayalarda yükselen manevi bir abide gibidir.\" — Evliya Çelebi",
        "\"Rize, çay yapraklarının yeşilliğinde her sabah yeniden doğan şehirdir.\" — Bedri Rahmi Eyüboğlu",
        "\"Kaçkarların tepesinde bulutlar ayaklarının altındayken, dünya gürültüsü çok uzaklarda bir fısıltıya dönüşür.\" — Seyyah Notu"
      ],
      "reflection": "Kaçkarların sisli zirvelerine bakarken, bulutların dağlarla yaptığı zikri izler, Zil Kale'nin yalnızlığında zamanın geçiciliğini düşünürsünüz. Yağmur damlalarının çay yapraklarından süzülürken çıkardığı ritmik ses, insanın içindeki telaşı yatıştıran ilahî bir musikiye dönüşür.",
      "spiritual_figures": [
        "**Zihni Derin (1880–1965):** \"Çayın Babası\" olarak anılan ziraat mühendisi; Rize'de çay tarımının kurumsallaşmasını sağlayarak bölge halkının kaderini değiştirmiştir.",
        "**Şeyh Mustafa Efendi & Rize Müderrisleri:** Osmanlı'dan Cumhuriyet'e Rize'nin cami ve medreselerinde (İslam Paşa / Kurşunlu Camii çevresinde) ilim ve irfan geleneğini yaşatan gönül insanları.",
        "**İslam Paşa (16. yüzyıl):** Rize merkezindeki tarihi İslam Paşa (Kurşunlu) Camii'ni inşa ettirerek şehrin Osmanlı dönemindeki mimari siluetini şekillendiren devlet adamı.",
        "**Ekrem Orhon (1911–1983):** \"Efsane Başkan\" olarak bilinen, Rize'nin modern şehircilik ve deniz dolgusu vizyonuna imza atan inşaat mühendisi ve belediye başkanı."
      ],
      "five_day_plan": [
        "**1. Gün (Şehir Merkezi, Çay Bahçesi ve Kale):** Sabah Rize İl Halk Kütüphanesi'nde çalışma; öğleden sonra Rize Kalesi, Ziraat Botanik Çay Bahçesi'nde çay tarlaları arasında mola ve Rize Müzesi (Sarı Ev).",
        "**2. Gün (Fırtına Vadisi, Zil Kale ve Palovit):** Çamlıhemşin'e uzanış; tarihi Osmanlı taş kemer köprüleri, sarp kayalıklar üzerindeki Zil Kale, Şimşir Ormanları ve gürül gürül akan Palovit Şelalesi.",
        "**3. Gün (Ayder Yaylası ve Gelintülü Şelalesi):** Kaçkar Dağları Milli Parkı sınırındaki Ayder Yaylası'nda yürüyüş, Gelintülü Şelalesi manzarası ve sisli yayla kahvesinde dinlenme.",
        "**4. Gün (Pokut ve Sal Yaylaları):** 2.000 metre rakımdaki Pokut ve Sal Yaylaları'na çıkarak bulut denizinin üzerinde otantik ahşap yayla evleri arasında unutulmaz bir gün.",
        "**5. Gün (Çayeli, Ağaran Şelalesi ve Veda):** Sabah kütüphane mesaisi; öğleden sonra Çayeli'nde kuru fasulye tadımı, Ağaran Şelalesi ve Rize Bezi (Feretiko) atölyesi ziyaretiyle veda."
      ]
    },
    "05_Karadeniz/Samsun": {
      "plate": 55,
      "name": "Samsun",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 41.2928,
      "lng": 36.3313,
      "landmarks": [
        "Bandırma Vapuru Müzesi",
        "Onur Anıtı",
        "Şahinkaya Kanyonu",
        "Kızılırmak Deltası Kuş Cenneti",
        "Amazon Köyü"
      ],
      "specialties": [
        "Samsun Pidesi (Bafra/Terme)",
        "Nokul",
        "Kaz Tiridi",
        "Mısır Çorbası"
      ],
      "quote": "Milli Mücadele'nin ilk adımının atıldığı istiklal limanı ve Şahinkaya Kanyonu'nun heybetli suları.",
      "library": "Samsun İl Halk Kütüphanesi - Karadeniz'in en modern kütüphanelerinden biri, priz ve internet altyapısı mükemmel.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Samsun/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Samsun/gallery.jpg",
      "images": [
        "05_Karadeniz/Samsun/banner.jpg",
        "05_Karadeniz/Samsun/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Samsun/README.md",
      "slug": "Samsun",
      "content_size": 6128,
      "custom_quote": "Milli Mücadele'nin ilk adımının atıldığı, kurtuluş meşalesinin yandığı vakur ve öncü sahil şehri.",
      "custom_library": "Samsun İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "19 Mayıs 1919'da Mustafa Kemal Atatürk'ün ayak basmasıyla Kurtuluş Savaşı'nın başlangıç noktası olan Samsun, Karadeniz'in en büyük limanı ve ticaret merkezidir. Antik çağlarda *Amisos* adıyla kurulan şehir, Kızılırmak ve Yeşilırmak gibi Anadolu'nun iki dev nehrinin oluşturduğu Bafra ve Çarşamba ovaları arasında bereketli bir coğrafyada yükselir. Danişmendliler ve Anadolu Selçukluları döneminde Karadeniz'e açılan en mühim Türk limanı olan Samsun; UNESCO Dünya Mirası Geçici Listesi'ndeki Kızılırmak Deltası Kuş Cenneti ve heybetli Şahinkaya Kanyonu ile hem tarihin hem de tabiatın görkemini bir arada sunar.",
      "literary_quotes": [
        "\"Samsun, vatanın kurtuluş meşalesinin tutuşturulduğu mübarek limandır.\" — Mustafa Kemal Atatürk",
        "\"Samsun limanı, Karadeniz'in en işlek ve bereketli iskelesidir.\" — Evliya Çelebi",
        "\"Bir Mayıs sabahı Tütün İskelesi'nde atılan o ilk adım, bütün bir milletin makûs talihini değiştirdi.\" — Tarih Notu"
      ],
      "reflection": "Bandırma Vapuru'nun önünde durup bağımsızlık mücadelesinin ilk günlerini tefekkür eder, özgürlüğün ne büyük bir nimet olduğunu düşünürsünüz. Kızılırmak Deltası'nda gün batarken gökyüzünü süsleyen yüzlerce göçmen kuşu izlemek, hem vatan toprağının hem de yaratılışın eşsiz dengesini kalbinize işler.",
      "spiritual_figures": [
        "**Gazi Mustafa Kemal Atatürk ve 19 Mayıs Ruhu:** 19 Mayıs 1919 sabahı Bandırma Vapuru ile Tütün İskelesi'ne çıkarak Türk milletinin bağımsızlık destanını Samsun'dan başlatmıştır.",
        "**Seyyid Kutbiddin (13. yüzyıl):** Abdülkadir Geylânî'nin torunlarından olduğu rivayet edilen, Samsun'un manevi banilerinden olan gönül sultanı; türbesi şehrin en kadim ziyaretgâhlarındandır.",
        "**Yaşar Doğu (1913–1961):** Samsun Kavak doğumlu, dünya ve olimpiyat şampiyonu efsanevi Türk güreşçisi; Türk spor tarihinin ahlak ve güç sembolüdür.",
        "**Çarşamba Göğceli Camii Ustaları (1206):** Çivi kullanılmadan (çantı tekniğiyle) inşa edilen ve 800 yılı aşkın süredir depremlere meydan okuyan Göğceli Camii, Anadolu ahşap mimarisinin şaheseridir."
      ],
      "five_day_plan": [
        "**1. Gün (19 Mayıs İzinde İlkadım):** Sabah Samsun İl Halk Kütüphanesi'nde çalışma; öğleden sonra Bandırma Vapuru ve Milli Mücadele Parkı, Tütün İskelesi, Onur Anıtı ve Gazi Müzesi.",
        "**2. Gün (Amisos Tepesi ve Arkeoloji):** Teleferikle Amisos Tepesi'ne çıkış, Pontus dönemi tümülüs mezarları, Samsun Arkeoloji ve Etnografya Müzesi ve Atakum sahilinde akşam yürüyüşü.",
        "**3. Gün (Kızılırmak Deltası Kuş Cenneti):** Bafra'ya hareket; 350'den fazla kuş türüne ve yılkı atlarına ev sahipliği yapan Kızılırmak Deltası'nda bisiklet/doğa turu, dönüşte Bafra pidesi ve nokulu.",
        "**4. Gün (Vezirköprü Şahinkaya Kanyonu):** Kızılırmak üzerindeki en dar ve en uzun geçit olan Şahinkaya Kanyonu'nda tekne turu ve Vezirköprü'nün tarihî Bedesten ve Taşhan sokakları.",
        "**5. Gün (Çarşamba Göğceli Camii ve Veda):** Sabah kütüphane mesaisi; öğleden sonra 1206 tarihli çivisiz ahşap şaheseri Göğceli Camii ve Seyyid Kutbiddin Türbesi ziyaretiyle Samsun'a veda."
      ]
    },
    "05_Karadeniz/Sinop": {
      "plate": 57,
      "name": "Sinop",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 42.0231,
      "lng": 35.1531,
      "landmarks": [
        "Tarihi Sinop Cezaevi",
        "İnceburun Feneri (Türkiye'nin En Kuzeyi)",
        "Erfelek Tatlıca Şelaleleri",
        "Hamsilos Koyu"
      ],
      "specialties": [
        "Sinop Mantısı (Cevizli)",
        "Nokul",
        "Palamut / Kalkan Balığı"
      ],
      "quote": "Türkiye'nin en kuzey ucu İnceburun, fiyort benzeri Hamsilos Koyu ve Diyojen'in 'Gölge etme başka ihsan istemez' dediği yer.",
      "library": "Sinop Rıza Nur İl Halk Kütüphanesi - Tarihi ve nostaljik ahşap binasıyla zamanda yolculuk hissi veriyor, huzurlu bir çalışma noktası.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Sinop/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Sinop/gallery.jpg",
      "images": [
        "05_Karadeniz/Sinop/banner.jpg",
        "05_Karadeniz/Sinop/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Sinop/README.md",
      "slug": "Sinop",
      "content_size": 6138,
      "custom_quote": "Karadeniz'in en uç noktasında, Hamsilos fiyordu ve tarihi cezaeviyle sükunet bulmuş sakin şehir.",
      "custom_library": "Sinop İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Diyojen'in doğum yeri olan Sinop, Karadeniz'in tek doğal limanıdır. Tarihi surları ve ünlü cezaeviyle derin bir geçmişe sahiptir. MÖ 7. yüzyılda Miletoslular tarafından kurulan ve Pontus Krallığı'na başkentlik yapan Sinop, 1214 yılında Anadolu Selçuklu Sultanı I. İzzeddin Keykâvus tarafından fethedilerek Türk denizciliğinin Karadeniz'deki ilk tersanesine ev sahipliği yapmıştır. Candaroğulları ve Osmanlı dönemlerinde de stratejik bir tersane ve liman kenti olan şehir; Türkiye'nin en kuzey ucu İnceburun, Erfelek Tatlıca Şelaleleri ve trafik lambasına dahi ihtiyaç duymayan dingin şehir kültürüyle \"Türkiye'nin en mutlu şehri\" unvanını hak eder.",
      "literary_quotes": [
        "\"Gölge etme, başka ihsan istemem.\" — Sinoplu Diyojen",
        "\"Sinop, Karadeniz'in en güvenli limanı, kaleli asil bir yarımadadır.\" — Evliya Çelebi",
        "\"Başın öne eğilmesin / Aldırma gönül aldırma / Ağladığın duyulmasın / Aldırma gönül aldırma...\" — Sabahattin Ali (Sinop Cezaevi, 1933)"
      ],
      "reflection": "Hamsilos Koyu'nun sakin sularında doğanın sunduğu benzersiz fiyort yapısını ve yaratılış estetiğini hayranlıkla tefekkür edersiniz. Tarihi Sinop Cezaevi'nin nemli taş koğuşlarından çıkıp hemen yanı başındaki masmavi limana baktığınızda ise, hürriyetin ve gönül genişliğinin değerini iliklerinize kadar hissedersiniz.",
      "spiritual_figures": [
        "**Sinoplu Diyojen (MÖ 412–323):** Kinik felsefenin kurucusu, Büyük İskender'e *\"Gölge etme, başka ihsan istemem\"* sözüyle kanaat ve özgürlük dersi veren antik çağ filozofu.",
        "**Seyyid İbrahim Bilâl (Seyyid Bilâl Hazretleri):** Sinop'un İslamlaşma döneminin manevi önderlerinden; denize hâkim tepedeki türbe ve camii şehrin en mühim manevi sığınağıdır.",
        "**Pervâne Muînüddin Süleyman:** 1262'de Sinop'u yeniden Selçuklu idaresine kazandırıp meşhur Pervâne Medresesi'ni ve Alaaddin Camii'ni imar eden devlet adamı.",
        "**Sabahattin Ali (1907–1948):** Tarihi Sinop Cezaevi'nde yattığı dönemde *\"Aldırma Gönül\"* (Hapishane Şarkısı) gibi unutulmaz şiirlerini kaleme alarak şehrin edebî hafızasına derin bir iz bırakmıştır."
      ],
      "five_day_plan": [
        "**1. Gün (Yarımada, Cezaevi ve Kale):** Sabah Sinop İl Halk Kütüphanesi'nde (Dr. Rıza Nur Kütüphanesi) çalışma; öğleden sonra Tarihi Sinop Cezaevi, Sinop Kalesi surları ve limanda Sinop mantısı tadımı.",
        "**2. Gün (Hamsilos Koyu ve İnceburun Feneri):** Karadeniz'in ria tipi doğal fiyordu Hamsilos Koyu ve Akliman'da yürüyüş; ardından Anadolu'nun en kuzey noktası İnceburun Deniz Feneri'nde gün batımı.",
        "**3. Gün (Erfelek Tatlıca Şelaleleri):** 28 irili ufaklı şelalenin basamaklar hâlinde aktığı Erfelek Tatlıca Tabiat Parkı'nda orman içi tırmanış ve serin mola.",
        "**4. Gün (Selçuklu Mirası ve Maneviyat):** Alaaddin Camii, Pervâne Medresesi (el sanatları çarşısı), Sinop Arkeoloji Müzesi, Balatlar Kilisesi ve Seyyid Bilâl Türbesi ziyareti.",
        "**5. Gün (Boyabat veya Gerze Rotası & Veda):** Sabah kütüphane mesaisi; öğleden sonra Cittaslow Gerze sahili veya Boyabat Bazalt Kayalıkları ziyareti ile kuzeyin sakin kentine veda."
      ]
    },
    "05_Karadeniz/Tokat": {
      "plate": 60,
      "name": "Tokat",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 40.3167,
      "lng": 36.55,
      "landmarks": [
        "Ballıca Mağarası",
        "Tokat Kalesi",
        "Taşhan",
        "Ali Paşa Camii",
        "Mahperi Hatun Kervansarayı",
        "Saat Kulesi"
      ],
      "specialties": [
        "Tokat Kebabı",
        "Tokat Yaprağı (Sarma)",
        "Zile Pekmezi",
        "Çökelekli Katmer"
      ],
      "quote": "Ballıca Mağarası'nın şifalı cüce sarkıtları, 900 adımda 900 yıllık tarihin adımlandığı kadim menzil.",
      "library": "Tokat İl Halk Kütüphanesi - Tarihi hanların gölgesinde huzurlu çalışma alanı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Tokat/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Tokat/gallery.jpg",
      "images": [
        "05_Karadeniz/Tokat/banner.jpg",
        "05_Karadeniz/Tokat/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Tokat/README.md",
      "slug": "Tokat",
      "content_size": 5841,
      "history": "Yeşilırmak'ın beslediği verimli Kazova ve Niksar ovalarında kurulan Tokat, Hititlerden Roma'ya (*Comana Pontica* ve Sezar'ın *\"Veni, Vidi, Vici\"* dediği Zile), Anadolu'nun ilk Türk medresesini (Yağıbasan Medresesi, 1151) kuran Danişmendlilerden Selçuklu ve Osmanlı'ya uzanan 6.000 yıllık bir tarih hazinesidir. Şehir merkezindeki Sulusokak'ta yalnızca 900 adımda 900 yıllık Türk-İslam mimarisinin (Garipler Camii, Gökmedrese, Taşhan, Yağıbasan Medresesi, Arastalı Bedesten, Ali Paşa Camii) tamamı görülebilir. 3,4 milyon yıllık oluşumu ve benzersiz soğan sarkıtlarıyla UNESCO Dünya Mirası Geçici Listesi'ndeki **Ballıca Mağarası**, Tokat Mevlevihanesi ve yazmacılık sanatıyla Tokat, Anadolu'nun gizli başkentlerinden biridir.",
      "literary_quotes": [
        "\"Tokat'a gitmek gerek; çünkü Tokat'ta insan da iklim de mutedildir.\" — Mevlânâ Celâleddîn-i Rûmî",
        "\"Tokat, âlimler ve fazıllar yurdu, bağlık bahçelik, suları bol, şirin ve mamur bir şehirdir.\" — Evliya Çelebi",
        "\"Veni, Vidi, Vici! (Geldim, Gördüm, Yendim!)\" — Jül Sezar (Zile / Zela Savaşı sonrası, MÖ 47)"
      ],
      "spiritual_figures": [
        "**Mevlânâ Celâleddîn-i Rûmî'nin Tokat Övgüsü:** Mevlânâ'nın *\"Tokat'a gitmek gerek, çünkü Tokat'ta insan ve iklim mutedildir\"* sözü şehrin zarif ve hoşgörülü ruhunu özetler. Tokat Mevlevihanesi bu muhabbetin mimari nişanesidir.",
        "**Gazi Osman Paşa (1832–1897):** Plevne Kahramanı, Osmanlı ordusunun efsanevi müşiri Tokat doğumludur; şehirde adını taşıyan müze ve üniversite bulunur.",
        "**İbn-i Kemal (Kemalpaşazâde, 1468–1534):** Osmanlı'nın en büyük Şeyhülislam ve tarihçilerinden biri olup Tokat'ın ilim geleneğinin zirve isimlerindendir.",
        "**Şeyhülislam Mustafa Sabri Efendi & Niksarlı Melik Danişmend Gazi:** Anadolu'nun ilk Türk beyliklerinden Danişmendlilerin başkentliğini yapan Niksar'da medfun Melik Gazi, bölgenin manevi ve tarihî kurucusudur.",
        "**Aşık Nuri & Cahit Külebi (1917–1997):** Zile doğumlu büyük Cumhuriyet şairi Cahit Külebi, Anadolu'nun sesini modern Türk şiirine taşımıştır."
      ],
      "five_day_plan": [
        "**1. Gün (900 Adımda 900 Yıl – Sulusokak):** Sabah Tokat İl Halk Kütüphanesi'nde çalışma; öğleden sonra Sulusokak boyunca Taşhan, Gökmedrese, Yağıbasan Medresesi, Tokat Mevlevihanesi, Latifoğlu Konağı, Ali Paşa Camii ve Saat Kulesi.",
        "**2. Gün (Ballıca Mağarası ve Kaz Gölü):** Pazar ilçesindeki 3,4 milyon yıllık Ballıca Mağarası'nın 8 salonunu keşif; ardından Selçuklu şaheseri Mahperi Hatun Kervansarayı ve Kaz Gölü kuş cenneti.",
        "**3. Gün (Tokat Kalesi ve Hıdırlık Köprüsü):** Selçuklu döneminden kalma Hıdırlık Köprüsü'nden geçiş, sarp kayalıklar üzerindeki Tokat Kalesi manzarası ve Gazi Osman Paşa Müzesi ile yazmacılık atölyesi ziyareti.",
        "**4. Gün (Niksar – Danişmendli Başkenti):** Anadolu'nun ilk medreselerinden Niksar Yağıbasan Medresesi, Niksar Kalesi, Melik Gazi Türbesi, Çamiçi Yaylası ve Leylekli Köprü.",
        "**5. Gün (Zile ve Veda):** Sezar'ın *\"Veni, Vidi, Vici\"* yazdığı Zile Kalesi, tarihî Zile evleri ve Amasya Caddesi'nde Zile pekmezi ile cevizli çörek alışverişi."
      ]
    },
    "05_Karadeniz/Trabzon": {
      "plate": 61,
      "name": "Trabzon",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 41.0027,
      "lng": 39.7168,
      "landmarks": [
        "Sümela Manastırı",
        "Ayasofya Camii Müzesi",
        "Uzungöl",
        "Atatürk Köşkü",
        "Boztepe",
        "Vazelon Manastırı"
      ],
      "specialties": [
        "Akçaabat Köftesi",
        "Kuymak",
        "Hamsiköy Sütlacı",
        "Trabzon Ekmeği",
        "Karalahana Çorbası"
      ],
      "quote": "Sarp kayalıklara asılı Sümela Manastırı'nın heybeti, zümrüt yaylalar ve Karadeniz'in hırçın dalgaları.",
      "library": "Trabzon İl Halk Kütüphanesi - Şehir merkezinde vakur bir bina, araştırma ve geliştirme için sessiz odalar sunuyor.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Trabzon/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Trabzon/gallery.jpg",
      "images": [
        "05_Karadeniz/Trabzon/banner.jpg",
        "05_Karadeniz/Trabzon/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Trabzon/README.md",
      "slug": "Trabzon",
      "content_size": 6302,
      "custom_quote": "Sümela Manastırı'nın dik yamacında yükselen mistik duruşu, Uzungöl'ün sisli doğası ve köklü geçmişiyle Karadeniz'in kalbi.",
      "custom_library": "Trabzon İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Trabzon İmparatorluğu'na başkentlik yapmış ve Fatih Sultan Mehmet tarafından fethedilmiş olan Trabzon, Osmanlı şehzadelerinin yetiştiği ulu bir şehirdir. MÖ 756'da *Trapezus* adıyla kurulan şehir, İpek Yolu'nun Karadeniz'e açılan en mühim kapısı olarak 2.800 yılı aşkın kesintisiz bir tarihî mirasa sahiptir. 1461'deki fethin ardından Yavuz Sultan Selim'in uzun yıllar sancak beyliği yaptığı ve cihan padişahı Kanuni Sultan Süleyman'ın dünyaya geldiği Trabzon; Altındere Vadisi'ndeki Sümela Manastırı, Trabzon Ayasofya Camii, Gülbahar Hatun Külliyesi ve sisli yaylalarıyla Doğu Karadeniz'in kültür ve tarih başkentidir.",
      "literary_quotes": [
        "\"Trabzon, Karadeniz'in gözbebeği, fırtınanın ve yeşilin yurdudur.\" — Evliya Çelebi",
        "\"Trabzon, koca bir tarihi sinesinde saklayan, Karadeniz'in serin rüzgarıyla yıkanan vakur şehirdir.\" — Bedri Rahmi Eyüboğlu",
        "\"Burası Trabzon'dur; Fatih'in fethettiği, Yavuz'un yönettiği, Kanuni'nin doğduğu ulu şehir.\" — Tarihi Levha"
      ],
      "reflection": "Sümela Manastırı'nın merdivenlerini tırmanırken, insan inancının sarp kayaları nasıl aştığını ve inzivanın manevi gücünü tefekkür edersiniz. Ortahisar'ın kadim taş sokaklarından Boztepe'ye çıktığınızda, bir yanda engin Karadeniz diğer yanda asırlık cami kubbeleri arasında tarihin sürekliliğini derinden hissedersiniz.",
      "spiritual_figures": [
        "**Fatih Sultan Mehmet, Yavuz Sultan Selim & Kanuni Sultan Süleyman:** Trabzon'u fetheden, yöneten ve burada doğan üç büyük Osmanlı padişahı şehrin tarihî vakarına mührünü vurmuştur.",
        "**Gülbahar Hatun:** Yavuz Sultan Selim'in annesi; Trabzon'da yaptırdığı Gülbahar Hatun Camii ve Külliyesi şehrin en zarif Osmanlı eserlerindendir.",
        "**Ahi Evren Dede (Boztepe):** Trabzon Boztepe'de medfun bulunan manevi büyük; fethin ardından şehrin esnaf ve ahilik ahlakını yeşerten irfan öncüsüdür.",
        "**Bedri Rahmi Eyüboğlu (1911–1975) & Sabahattin Eyüboğlu:** Trabzon'un sanat, edebiyat ve düşünce dünyasına armağan ettiği büyük kültür insanları.",
        "**İskender Paşa & Ortahisar Vakıfları:** Fethin ardından Trabzon'un imarında, su yollarında ve medreselerinde iz bırakan Osmanlı valileri."
      ],
      "five_day_plan": [
        "**1. Gün (Ortahisar, Ayasofya ve Boztepe):** Sabah Trabzon İl Halk Kütüphanesi'nde çalışma; öğleden sonra Trabzon Ayasofya Camii, Gülbahar Hatun Külliyesi, Ortahisar Fatih Camii, Tarihi Bedesten ve gün batımında Boztepe'de çay.",
        "**2. Gün (Maçka – Sümela Manastırı ve Hamsiköy):** Altındere Vadisi Milli Parkı içindeki Sümela Manastırı'na tırmanış; öğleden sonra Zigana yolundaki Hamsiköy'de hakiki Hamsiköy sütlacı tadımı.",
        "**3. Gün (Uzungöl ve Çaykara Yaylaları):** Çaykara ilçesindeki Uzungöl'e tam günlük rota; göl çevresinde yürüyüş, seyir terasından fotoğraf ve imkan dahilinde Haldizen/Demirkapı yayla havası.",
        "**4. Gün (Atatürk Köşkü, Sera Gölü ve Akçaabat):** Soğuksu sırtlarındaki zarif Atatürk Köşkü, ardından Akçaabat'ta Ortamahalle'nin tarihi Osmanlı evleri, Sera Gölü ve akşam Akçaabat köftesi.",
        "**5. Gün (Çal Mağarası veya Vazelon & Veda):** Sabah kütüphane mesaisi; öğleden sonra Düzköy'deki dünyanın en uzun ikinci mağarası Çal Mağarası (veya Vazelon Manastırı) ziyareti ve meydanda veda çayı."
      ]
    },
    "05_Karadeniz/Zonguldak": {
      "plate": 67,
      "name": "Zonguldak",
      "region": "Karadeniz",
      "region_code": "05_Karadeniz",
      "lat": 41.4564,
      "lng": 31.7987,
      "landmarks": [
        "Gökgöl Mağarası",
        "Maden Müzesi",
        "Filyos Kalesi & Antik Kenti",
        "Harmankaya Şelalesi"
      ],
      "specialties": [
        "Uğmaç Çorbası",
        "Malay",
        "Zonguldak Kestanesi"
      ],
      "quote": "Emeğin başkenti, yerin yüzlerce metre altından çıkarılan kara elmasın ve madencilerin vefası.",
      "library": "Zonguldak İl Halk Kütüphanesi - Karadeniz'in sarp kıyısında sakin bir çalışma ortamı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "05_Karadeniz/Zonguldak/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "05_Karadeniz/Zonguldak/gallery.jpg",
      "images": [
        "05_Karadeniz/Zonguldak/banner.jpg",
        "05_Karadeniz/Zonguldak/gallery.jpg"
      ],
      "readme_rel": "05_Karadeniz/Zonguldak/README.md",
      "slug": "Zonguldak",
      "content_size": 5637,
      "history": "\"Emeğin ve Karaelmas'ın Başkenti\" Zonguldak, Cumhuriyet'in ilk vilayeti (1924) olma onurunu taşır. 1829 yılında Ereğlili **Uzun Mehmet**'in taş kömürünü keşfetmesiyle kaderi değişen şehir, Osmanlı'nın son döneminden Cumhuriyet'in sanayileşme hamlesine kadar ülkenin enerji kalbi olmuştur. Ancak Zonguldak yalnızca maden ocaklarından ibaret değildir: MÖ 7. yüzyılda Miletosluların kurduğu **Tios (Filyos) Antik Kenti**, 350 milyon yıllık fosil izleri taşıyan **Gökgöl Mağarası**, mitolojide Herkül'ün yeraltı dünyasına indiği yer olarak anılan **Cehennemağzı Mağaraları** (Kdz. Ereğli) ve Devrek'in dünyaca ünlü baston ustalığı ile Zonguldak, derin bir tarih, sanat ve doğa zenginliği barındırır.",
      "literary_quotes": [
        "\"Siyah akar Zonguldak'ın deresi / Yüz karası değil, kömür karası / Böyle kazanılır ekmek parası.\" — Orhan Veli Kanık",
        "\"Zonguldak'ta deniz ile dağ birbirine yaslanır; yerin altında karaelmas, yerin üstünde yemyeşil kestane ormanları nefes alır.\" — Seyyah Beklentisi"
      ],
      "spiritual_figures": [
        "**Uzun Mehmet (ö. 1830):** 8 Kasım 1829'da Kdz. Ereğli Köseağzı mevkiinde taş kömürünü bularak Türkiye'nin madencilik tarihini başlatan halk kahramanı.",
        "**Şair Orhan Veli Kanık & Zonguldak Şairleri (Rüştü Onur, Muzaffer Tayyip Uslu):** 1940'lı yıllarda Zonguldak'ta veremle mücadele ederken Türk şiirine unutulmaz mısralar bırakan \"Kelebeğin Rüyası\" şairleri Rüştü Onur ve Muzaffer Tayyip Uslu, şehrin hüzünlü ve zarif edebî ruhudur.",
        "**Gazi Alemdar Gemisi Kahramanları (1921):** Milli Mücadele'nin tek deniz zaferini Ereğli açıklarında kazanan Alemdar Gemisi mürettebatı, Karadeniz'deki bağımsızlık direnişinin sembolüdür.",
        "**Devrek Baston Ustaları:** Kızılcık ağacını sabır ve ince oymacılıkla sanat eserine dönüştüren asırlık zanaatkârlar."
      ],
      "five_day_plan": [
        "**1. Gün (Karaelmas Mirası ve Fener Mahallesi):** Sabah Zonguldak İl Halk Kütüphanesi'nde çalışma; öğleden sonra Türkiye'nin ilk ve tek **Zonguldak Maden Müzesi** ve Eğitim Ocağı ziyareti, ardından tarihî Fener Mahallesi ve Varagel Tüneli yürüyüşü.",
        "**2. Gün (Gökgöl Mağarası ve Harmankaya Şelaleleri):** 350 milyon yıllık Gökgöl Mağarası'nın aydınlatılmış galerilerinde yürüyüş; öğleden sonra orman içi patikadan Harmankaya Şelaleleri'ne ulaşım.",
        "**3. Gün (Filyos – Tios Antik Kenti ve Kalesi):** Çaycuma üzerinden Filyos'a hareket; Karadeniz'in kazılabilen tek antik kenti Tios'un akropolü, antik tiyatrosu, Filyos Kalesi ve geniş kumsalında gün batımı.",
        "**4. Gün (Karadeniz Ereğli – Cehennemağzı ve Alemdar):** Mitolojik Cehennemağzı Mağaraları (Ayazma, Kilise ve Koca Yusuf mağaraları), Gazi Alemdar Gemi Müzesi ve Ereğli sahilinde Osmanlı çileği & pide molası.",
        "**5. Gün (Devrek Baston Atölyeleri ve Veda):** Sabah kütüphane mesaisi; öğleden sonra Devrek'te baston ustalarının atölyelerini ziyaret, Devrek simidi tadımı ve Batı Karadeniz'in emek şehrine veda."
      ]
    },
    "06_DoguAnadolu/Agri": {
      "plate": 4,
      "name": "Ağrı",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 39.7191,
      "lng": 43.0503,
      "landmarks": [
        "İshak Paşa Sarayı",
        "Ağrı Dağı (5137m)",
        "Meteor Çukuru",
        "Doğubayazıt Kalesi",
        "Balık Gölü"
      ],
      "specialties": [
        "Abdigör Köftesi",
        "Ağrı Balı",
        "Halis (Helise)"
      ],
      "quote": "Türkiye'nin çatısı Ağrı Dağı ve kartal yuvası gibi ovaya bakan masalsı İshak Paşa Sarayı.",
      "library": "Ağrı İl Halk Kütüphanesi - Ağrı Dağı'nın heybeti karşısında sakin çalışma alanı.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Agri/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Agri/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Agri/banner.jpg",
        "06_DoguAnadolu/Agri/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Agri/README.md",
      "slug": "Agri",
      "content_size": 5881,
      "custom_quote": "Türkiye'nin zirvesi Ağrı Dağı'nın heybeti, ovaya kartal yuvası gibi bakan İshak Paşa Sarayı'nın masalsı silüeti ve Doğubayazıt'ın kadim nefesi.",
      "custom_library": "Ağrı İl Halk Kütüphanesi - Sessiz, geniş çalışma masaları ve odaklanmayı artıran vakur bir çalışma ortamı.",
      "history": "Urartulardan Selçuklulara ve Osmanlı'ya uzanan tarihi İpekyolu kavşağı üzerinde kurulu olan Ağrı, Doğu Anadolu'nun en yüksek ve stratejik menzillerinden biridir. 17. yüzyılda inşa edilen ve Lale Devri'nin Doğu'daki en muhteşem eseri kabul edilen İshak Paşa Sarayı, saray mimarisi, camisi ve kalorifer sistemi benzeri taş ısıtma kanallarıyla mimarlık tarihinin şaheseridir. Tarihi boyunca Anadolu'ya giriş kapılarından biri olan Ağrı platosu, Nuh Tufanı rivayetleriyle kutsal metinlerde ve efsanelerde adı geçen 5.137 metrelik Büyük Ağrı Dağı'nın gölgesinde şekillenmiştir. Diyadin kaplıcalarından Türkiye'nin en yüksek rakımlı göllerinden biri olan Balık Gölü'ne, Urartu kaya mezarlarından Osmanlı serhat kalelerine kadar uzanan bu coğrafya, sert ikliminin ardında derin bir misafirperverlik ve kadim bir kültür barındırır.",
      "literary_quotes": [
        "\"Ağrı Dağı'nın doruğunda gökyüzü yeryüzüyle birleşir; insan kendi faniliğini ve Yaratıcı'nın celalini en derinden burada hisseder.\" — Seyyah Notu",
        "\"İshak Paşa Sarayı, Osmanlı taş işçiliğinin, Selçuklu motiflerinin ve Fars estetiğinin ovaya bakan taşlaşmış rüyasıdır.\" — Sanat Tarihçileri"
      ],
      "reflection": "Doğubayazıt ovasına hakim bir tepede yükselen İshak Paşa Sarayı'nın avlusunda durup Ahmed-i Hânî Hazretleri'nin türbesine doğru tefekküre daldığınızda, dünya saraylarının faniliğini ve ilmin kalıcılığını idrak edersiniz. 5137 metrelik Ağrı Dağı'nın karlı zirvesini seyrederken doğanın sessiz zikrine ortak olursunuz.",
      "spiritual_figures": [
        "**Ahmed-i Hânî (1651–1707):** Doğubayazıt'ta yaşamış büyük mütefekkir, şair, mutasavvıf ve astronom. *Mem û Zîn* ve *Nûbehara Biçûkan* gibi ölümsüz eserleriyle bölgenin ilim ve edebiyat hafızasını şekillendirmiştir. Türbesi, İshak Paşa Sarayı'nın hemen üst yamacında ovaya nazır vakur bir ziyaretgâhtır.",
        "**Çolak Abdi Paşa ve İshak Paşa:** 1685'te yapımına başlanıp 1784'te tamamlanan, 99 yıllık inşa serüveniyle Doğu'nun en görkemli külliyesi olan İshak Paşa Sarayı'nı bölgeye kazandıran Çıldır Beylerbeyleri.",
        "**Halife Yusuf (Yusuf-i Hânî) ve Bölge Müderrisleri:** Doğubayazıt medreselerinde yüzyıllar boyunca ilim halkaları kurarak serhat boyunun manevi direncini ayakta tutan âlimler."
      ],
      "five_day_plan": [
        "**1. Gün – Ağrı Merkez ve Şehir Dokusu:** KYK yurduna yerleşme, Ağrı İl Halk Kütüphanesi'nde ilk çalışma mesaisi, Merkez Camii çevresi, Murat Nehri kenarında akşam yürüyüşü ve yöresel Halise tadımı.",
        "**2. Gün – Doğubayazıt, İshak Paşa Sarayı ve Ahmed-i Hânî:** Sabah erken saatte Doğubayazıt'a geçiş; İshak Paşa Sarayı'nın harem, selamlık, cami ve taş ısıtma kanallarının incelenmesi; Ahmed-i Hânî Türbesi ziyareti ve Eski Bayazıt Camii ile Urartu Kalesi'nin keşfi.",
        "**3. Gün – Ağrı Dağı Etekleri, Nuh'un Gemisi İzi ve Meteor Çukuru:** Doğubayazıt ovasından Büyük ve Küçük Ağrı Dağı silüetlerinin fotoğraflanması, Telçeker köyü yakınlarındaki Nuh'un Gemisi doğal oluşum alanı ve Gürbulak sınır hattındaki Meteor Çukuru ziyareti; akşam Abdigör Köftesi molası.",
        "**4. Gün – Diyadin Kanyonu ve Kaplıcaları:** Kütüphane mesaisinin ardından Diyadin'e hareket; Murat Nehri'nin şekillendirdiği Diyadin Kanyonu yürüyüşü, Meya Mağaraları (Günbuldu) kaya yerleşimlerinin görülmesi ve şifalı kaplıca sularında dinlenme.",
        "**5. Gün – Balık Gölü ve Veda Tefekkürü:** 2.241 metre rakımlı Balık Gölü kıyısında sabah sessizliği ve alabalık molası; merkeze dönüşte kütüphane notlarının toparlanması ve Ağrı Dağı'na gün batımı vedası."
      ]
    },
    "06_DoguAnadolu/Ardahan": {
      "plate": 75,
      "name": "Ardahan",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 41.1105,
      "lng": 42.7022,
      "landmarks": [
        "Çıldır Gölü (Kışın Donan)",
        "Ardahan Kalesi",
        "Şeytan Kalesi",
        "Atatürk Silüeti (Damal)"
      ],
      "specialties": [
        "Kaşar Peyniri",
        "Ardahan Çiçek Balı",
        "Kaz Eti Yemeği",
        "Hengel"
      ],
      "quote": "Kışın atlı kızakların kaydığı buz tutmuş Çıldır Gölü ve sarp kayalıklara kurulu Şeytan Kalesi.",
      "library": "Ardahan İl Halk Kütüphanesi - Kışın sıcacık soba sıcaklığında, dışarıdaki dondurucu soğuğa inat sessizce kod yazma imkanı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Ardahan/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Ardahan/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Ardahan/banner.jpg",
        "06_DoguAnadolu/Ardahan/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Ardahan/README.md",
      "slug": "Ardahan",
      "content_size": 5270,
      "history": "Türkiye'nin kuzeydoğu sınırında, Doğu Anadolu ile Kafkasya'nın kesişim noktasında yer alan Ardahan, yüksek yaylaları, uçsuz bucaksız çayırları ve kadim kaleleriyle Anadolu'nun en vakur serhat şehirlerinden biridir. Urartular, İskitler, Kıpçaklar, Selçuklular ve Osmanlılar döneminde stratejik bir geçiş kapısı olan bölge, 1551'de Kanuni Sultan Süleyman zamanında Osmanlı topraklarına katılmış ve Kura Nehri kıyısında yükselen Ardahan Kalesi ile tahkim edilmiştir. 1878'den 1921'e kadar süren zorlu yılların ardından yeniden ana vatana kavuşan Ardahan, doğal güzellikleri bakımından bakir bir hazine niteliğindedir. Kış aylarında tamamen donarak üzerinde atlı kızaklarla gezilen **Çıldır Gölü**, buzun altından ağ çekilerek tutulan sarı balığı ve sarp kayalıklar üzerine kurulu **Şeytan Kalesi** ile benzersiz bir atmosfer sunar. Posof'un mikroklima vadilerinde yetişen içi kırmızı elmalar, Damal dağlarında her yıl haziran–temmuz aylarında oluşan Atatürk silüeti ve Yalnızçam ormanları şehrin çok katmanlı tabiatını tamamlar.",
      "literary_quotes": [
        "\"Can sağ iken yurt vermeniz düşmana!\" — Çıldırlı Âşık Şenlik",
        "\"Kura suyunun kenarında yükselen Ardahan Kalesi, serhat boyunun rüzgârına göğüs geren metin bir taş nöbetçidir.\" — Evliya Çelebi"
      ],
      "spiritual_figures": [
        "**Âşık Şenlik (1850–1913):** Çıldır'ın Suhara (Yakınsu) köyünde yetişmiş, 93 Harbi'nde \"Ehli İslam olan işitsin bilsin / Can sağ iken yurt vermeniz düşmana\" dizeleriyle Anadolu ve Kafkasya'ya ruh veren büyük halk ozanı.",
        "**Âşık Zülali ve Posof Âşıklık Geleneği:** Sözlü kültürün ve saz eşliğinde hikmet aktarımının Serhat boyundaki asırlık temsilcileri.",
        "**Halit Paşa (Deli Halit Paşa):** Milli Mücadele'de Doğu Cephesi'nde Ardahan ve çevresinin kurtuluşunda öncü rol oynayan kahraman komutan."
      ],
      "five_day_plan": [
        "**1. Gün – Ardahan Merkez ve Kura Boyu:** Şehre varış, kütüphane keşfi, Kanuni döneminde inşa edilen Ardahan Kalesi, Kura Nehri taş köprüleri ve tarihi Rus evlerinin adımlanması.",
        "**2. Gün – Çıldır Gölü ve Akçakale Adası:** Çıldır Gölü kıyısında yürüyüş, göl içindeki Akçakale Adası kalıntıları, göl kenarında sarı balık molası ve Âşık Şenlik'in doğduğu Yakınsu köyü ziyareti.",
        "**3. Gün – Şeytan Kalesi ve Karaçay Kanyonu:** Sarp kayalıkların tepesinde kartal yuvası gibi duran Orta Çağ eseri Şeytan Kalesi'ne çıkış ve kanyon manzarasında tefekkür.",
        "**4. Gün – Damal, Posof ve Ilgar Dağı Geçidi:** Damal'da geleneksel bebek sanatı ve yayla kültürü, Ilgar Dağı üzerinden Posof vadisine iniş, Mere Kalesi ve Posof'un meşhur içi kırmızı elma bahçeleri.",
        "**5. Gün – Yalnızçam Yaylaları ve Göle Ormanları:** Yalnızçam Kayak Merkezi çevresindeki çam ormanlarında doğa yürüyüşü, Göle yaylalarında taze kaşar ve bal tadımı, ardından rotaya veda."
      ]
    },
    "06_DoguAnadolu/Bingol": {
      "plate": 12,
      "name": "Bingöl",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 38.8854,
      "lng": 40.4983,
      "landmarks": [
        "Yüzen Adalar (Solhan)",
        "Hesarek Kayak Merkezi",
        "Kral Kızı Kalesi",
        "Zağ Mağaraları"
      ],
      "specialties": [
        "Bingöl Balı",
        "Gömme",
        "Mastuva",
        "Löl"
      ],
      "quote": "Turnalar Gölü'ndeki doğa harikası Yüzen Adalar ve dağların bağrında saklı kaynak suları.",
      "library": "Bingöl İl Halk Kütüphanesi - Samimi ve sessiz çalışma ortamı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Bingol/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Bingol/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Bingol/banner.jpg",
        "06_DoguAnadolu/Bingol/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Bingol/README.md",
      "slug": "Bingol",
      "content_size": 5230,
      "history": "Adını yüksek dağlarının zirvelerinde ve yaylalarında saklı sayısız buzul gölünden alan Bingöl (tarihi adıyla Çapakçur), Fırat'ın kollarından Murat ve Peri sularının beslediği yemyeşil vadilerle çevrili bir Doğu Anadolu şehridir. Urartular döneminden kalma **Kral Kızı Kalesi** ve **Zağ Mağaraları**, Roma ve Selçuklu izleri ile Osmanlı döneminde Süveydi Beyliği'nin yönetimindeki Çapakçur kültürü, şehrin derin tarihini bugüne taşır. Bingöl'ü Türkiye coğrafyasında benzersiz kılan tabiat harikalarının başında Solhan ilçesindeki **Yüzen Adalar** gelir; krater gölünün üzerinde birbirinden bağımsız üç kara parçası, tıpkı bir sal gibi suyun üstünde hareket eder. Şehir aynı zamanda Türkiye'nin en berrak gün doğumu manzaralarından birine sahne olan **Kale Tepesi (Güneşin Doğuşu Seyir Noktası)**, şifalı Kös Kaplıcaları, Hesarek Kayak Merkezi, Buban Bacaları ve dünyaca ödüllü Bingöl Balı ile doğa ve tefekkür gezginleri için saklı bir hazinedir.",
      "literary_quotes": [
        "\"Çapakçur, suları gürül gürül akan, yaylaları cennet misali serin ve insanı vefalı bir beldedir.\" — Evliya Çelebi",
        "\"Bingöl yaylalarında şafak sökerken dağların doruğundan süzülen ilk ışık, tabiatın uyanışına yazılmış sessiz bir kasidedir.\" — Seyyah Notu"
      ],
      "spiritual_figures": [
        "**Şeyh Ahmed-i Çapakçuri:** Bingöl ve çevresinde irşad faaliyetleriyle tanınan, bölge halkının gönlünde derin izler bırakan manevi önder.",
        "**İsfahan Bey ve Süveydi Beyleri:** Kiğı ve Çapakçur bölgesinde camiler, hanlar ve medreseler inşa ettirerek şehrin İslam mimarisi kimliğini şekillendiren tarihi beyler (Kiğı İsfahan Bey Camii).",
        "**Şeyh Ali Septi ve İlim Halkaları:** Bölgenin manevi eğitim geleneğini asırlar boyunca sürdüren müderris ve mutasavvıflar."
      ],
      "five_day_plan": [
        "**1. Gün – Bingöl Merkez ve Kös Kaplıcaları:** Şehre varış, İl Halk Kütüphanesi'nde çalışma mesaisi, şehir çarşısında Bingöl balı ve kavurması tadımı, akşam Kös Kaplıcaları çevresinde dinlenme.",
        "**2. Gün – Solhan Yüzen Adalar ve Turna Gölü:** Solhan ilçesine hareket; doğa harikası Yüzen Adalar'ın incelenmesi, göl kenarında tefekkür yürüyüşü ve çevredeki yayla köylerinin keşfi.",
        "**3. Gün – Karlıova Kale Tepesi (Gün Doğumu) ve Çır Şelalesi:** Şafak öncesi Karlıova Kale Tepesi'nde güneşin muazzam doğuşunun izlenmesi, dönüşte 50 metreden dökülen Çır Şelalesi ve Buban Bacaları gezisi.",
        "**4. Gün – Genç, Kral Kızı Kalesi ve Zağ Mağaraları:** Murat Nehri kıyısında yükselen Urartu eseri Kral Kızı Kalesi, kayalara oyulmuş çok katlı Zağ Mağaraları ve tarihi dokunun fotoğraflanması.",
        "**5. Gün – Kiğı Tarihi Mirası ve Hesarek Yaylası:** 15. yüzyıldan kalma Kiğı İsfahan Bey Camii, Peri Suyu vadisi manzaraları ve Hesarek Dağı eteklerinde veda yürüyüşü."
      ]
    },
    "06_DoguAnadolu/Bitlis": {
      "plate": 13,
      "name": "Bitlis",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 38.4006,
      "lng": 42.1095,
      "landmarks": [
        "Nemrut Krater Gölü & Kalderası",
        "Ahlat Selçuklu Mezarlığı",
        "Bitlis Kalesi",
        "İhlasiye Medresesi",
        "Tarihi Taş Evler"
      ],
      "specialties": [
        "Bitlis Büryan Kebabı",
        "Ahlat Elması",
        "Katıklı Dolma",
        "Karakovan Balı"
      ],
      "quote": "Kubbetü'l-İslam Ahlat'ın ulu mezar taşları ve dünyanın ikinci büyük kalderası Nemrut Krater Gölü.",
      "library": "Bitlis İl Halk Kütüphanesi - Tarihi taş binalar arasında tefekkür dolu araştırma ortamı.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Bitlis/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Bitlis/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Bitlis/banner.jpg",
        "06_DoguAnadolu/Bitlis/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Bitlis/README.md",
      "slug": "Bitlis",
      "content_size": 5611,
      "custom_quote": "Kubbetü'l-İslam Ahlat'ın ulu Selçuklu mezar taşları, Van Gölü'nün turkuaz kıyıları ve dünyanın doğa harikası Nemrut Krater Gölü.",
      "custom_library": "Bitlis İl Halk Kütüphanesi - Tarihi taş binalar arasında sükunet dolu, araştırmaya uygun ortam.",
      "history": "Bitlis, İslam medeniyetinin Horasan'dan Anadolu'ya akışındaki en önemli üç \"Kubbetü'l-İslam\" (İslam'ın Kubbesi) merkezinden biri olan Ahlat'a ev sahipliği yapar. Dünyanın en büyük Türk-İslam mezarlığı olan Ahlat Selçuklu Meydan Mezarlığı, her biri sanat eseri niteliğindeki yüzlerce yıllık abidevi mezar taşları ve kümbetleriyle tarihin taşa kazınmış tapu senedidir. Ayrıca sönmüş bir volkan olan Nemrut Dağı zirvesindeki kaldera ve krater gölleri eşsiz bir tabiat harikasıdır. Vadi tabanına kurulu tarihi Bitlis merkezi ise dik yamaçlara sıralanmış geleneksel kesme taş evleri, kemerli taş köprüleri, hanları ve türkülere konu olan beş minaresiyle adeta bir açık hava müzesidir. Büyük İskender'in komutanlarından Bedlis tarafından kurulduğu rivayet edilen Bitlis Kalesi'nin eteklerinde, asırlar boyunca Kürt, Türk ve Ermeni ustaların elinden çıkan taş işçiliği sanatı zirveye ulaşmıştır.",
      "literary_quotes": [
        "\"Ahlat, İslam dünyasının ilim, hikmet ve sanat kubbesidir; her taşında bir arifin, bir fatihin nefesi saklıdır.\" — Tarihi Kayıtlar",
        "\"Bitlis Kalesi ve vadideki taş medreseler, beş minarenin gölgesinde asırlardır nöbet tutar.\" — Evliya Çelebi"
      ],
      "reflection": "Ahlat Meydan Mezarlığı'nda 800 yıllık işlemeli şahidelerin arasında yürürken ölümün kaçınılmaz hakikatini, faniliğin ardındaki ebedi güzelliği ve ecdadın estetik anlayışını tefekkür edersiniz. Nemrut Krater Gölü'nün kıyısında buharı tüten sıcak sular ile masmavi soğuk gölün yan yana duruşunda doğanın muazzam dengesine şahit olursunuz.",
      "spiritual_figures": [
        "**İdris-i Bitlisî (1457–1520):** Osmanlı tarihçisi, devlet adamı ve âlim. *Heşt Behişt* adlı eseriyle Osmanlı tarih yazıcılığında çığır açmış, Doğu Anadolu'nun Osmanlı birliğine barışçıl katılımında kilit rol oynamıştır.",
        "**Şeref Han (1543–1603):** Bitlis Beyliği'nin ilim ve kültür hamisi hükümdarı, meşhur *Şerefname* eserinin müellifi; adını taşıyan Şerefiye Külliyesi şehrin kalbindedir.",
        "**Abdurrahman Gazi ve Ahlat Erenleri:** Ahlat'ın fethinden itibaren şehri bir ilim ve irfan kubbesine dönüştüren sahabe, mutasavvıf ve taş ustası sanatkârlar (Emir Bayındır, Ulu Kümbet banileri)."
      ],
      "five_day_plan": [
        "**1. Gün – Bitlis Merkez ve Beş Minare Vadisi:** KYK yurduna yerleşme, Bitlis İl Halk Kütüphanesi mesaisi, Bitlis Kalesi, Şerefiye Camii, İhlasiye Medresesi, Ulu Camii ve tarihi taş çarşıda Büryan Kebabı molası.",
        "**2. Gün – Tatvan ve Nemrut Krater Gölü Kalderası:** Tatvan sahilinde sabah yürüyüşü, ardından 2.935 metrelik Nemrut Kalderası'na çıkış; soğuk göl, sıcak göl, buhar bacası ve krater içi sessiz tefekkür.",
        "**3. Gün – Kubbetü'l-İslam Ahlat:** Dünyanın en büyük Türk-İslam mezarlığı olan Ahlat Selçuklu Meydan Mezarlığı, Emir Bayındır Kümbeti, Ulu Kümbet, Harabe Şehir mağaraları ve Ahlat Müzesi ziyareti.",
        "**4. Gün – Adilcevaz ve Süphan Dağı Etekleri:** Van Gölü'nün kuzey kıyısındaki Adilcevaz'a geçiş; Tuğrul Bey Camii, Kef Kalesi kalıntıları, Arin Gölü kuş cenneti ve Süphan Dağı silüeti karşısında gün batımı.",
        "**5. Gün – Hizan Vadisi, El-Aman Hanı ve Veda:** Tarihi İpekyolu üzerindeki devasa El-Aman Hanı'nın görülmesi, kütüphanede notların derlenmesi ve Van Gölü'ne karşı son bir demli çay ile veda."
      ]
    },
    "06_DoguAnadolu/Elazig": {
      "plate": 23,
      "name": "Elazığ",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 38.681,
      "lng": 39.2264,
      "landmarks": [
        "Harput Kalesi (Süt Kalesi)",
        "Harput Ulu Cami (Eğri Minare)",
        "Hazar Gölü",
        "Keban Baraj Gölü",
        "Meryem Ana Kilisesi"
      ],
      "specialties": [
        "Harput Köftesi",
        "Gömme",
        "Orcik (Cevizli Sucuk)",
        "Çedene Kahvesi"
      ],
      "quote": "Bin yıllık Harput kalesinin vakur duruşu, Gakgoşlar diyarının mertliği ve Hazar Gölü'nün batık şehri.",
      "library": "Elazığ İl Halk Kütüphanesi - Gakgoşlar diyarında modern ve konforlu çalışma odalarıyla geniş bir kütüphane.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Elazig/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Elazig/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Elazig/banner.jpg",
        "06_DoguAnadolu/Elazig/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Elazig/README.md",
      "slug": "Elazig",
      "content_size": 5101,
      "custom_quote": "Harput Kalesi'nin bin yıllık surları, Hazar Gölü'nün mavi sularıyla Doğu'nun köklü kültür havzası.",
      "custom_library": "Elazig İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Tarihi Harput kentinin devamı olan Elazığ, Urartulardan Selçuklu ve Osmanlıya uzanan zengin kültürü ve musikisiyle ünlüdür. MÖ 2000'lere uzanan geçmişiyle Yukarı Fırat Havzası'nın kalbinde yer alan Harput, Artuklular döneminde Anadolu'nun en önemli ilim, mimari ve edebiyat merkezlerinden biri olmuştur. Harput'un 19. yüzyılda ovaya (Mezra'ya) inmesiyle kurulan bugünkü Elazığ; Kürsübaşı musikisi, Çayda Çıra halk oyunu, Keban Baraj Gölü'nün serinliği ve tektonik bir mücevher olan Hazar Gölü ile köklü geleneği modern şehir yaşamıyla buluşturur.",
      "literary_quotes": [
        "\"Harput Kalesi, sinesinde bin yıllık efsaneleri saklayan Doğu'nun ulu nöbetçisidir.\" — Evliya Çelebi",
        "\"Hazar Gölü, dağların arasında gizlenmiş turkuaz bir doğa mucizesidir.\" — Bedri Rahmi Eyüboğlu"
      ],
      "reflection": "Eğri minaresiyle meşhur Harput Ulu Camii'nin avlusunda, asırlardır secdeye varan insanların manevi izlerini tefekkür edersiniz.",
      "spiritual_figures": [
        "**Arap Baba ve Mansur Baba:** Harput'un fethinden bu yana şehrin manevi muhafızları olarak kabul edilen ve türbeleri asırlardır ziyaret edilen ulu zatlar.",
        "**Belek Gazi (Balak Gazi):** Artuklu hükümdarı ve Haçlı seferlerine karşı Anadolu'nun savunulmasında büyük zaferler kazanan kahraman komutan; Harput Kalesi'nin hemen yanı başında hatırası yaşatılır.",
        "**Üryan Baba, Sara Hatun ve Harput Âlimleri:** Harput Ulu Camii ve Sara Hatun Camii etrafında asırlarca ilim ve irfan halkaları kuran mutasavvıf ve müderrisler."
      ],
      "five_day_plan": [
        "**1. Gün – Elazığ Merkez ve Kültür Park:** KYK yurduna yerleşme, Elazig İl Halk Kütüphanesi'nde ilk mesai, Kapalı Çarşı'da Orcik ve Ağın leblebisi keşfi, akşam Kültür Park yürüyüşü.",
        "**2. Gün – Kadim Harput Kenti:** Harput Kalesi (Süt Kalesi), eğri minaresiyle ünlü 12. yüzyıl Artuklu eseri Harput Ulu Camii, Sara Hatun Camii, Arap Baba Türbesi, Buzluk Mağarası ve Şefik Gül Kültür Evi.",
        "**3. Gün – Hazar Gölü ve Hazarbaba Zirvesi:** Sivrice ilçesindeki turkuaz Hazar Gölü kıyısında yürüyüş, Batık Şehir efsanesinin dinlenmesi, göl kenarında kitap okuma ve gün batımı.",
        "**4. Gün – Palu Kalesi ve Tarihi Köprü:** Murat Nehri kıyısındaki kadim Palu ilçesine geçiş; Urartu kitabesini barındıran Palu Kalesi, tarihi Palu Köprüsü, Alacalı Mescit ve Cemşit Bey Külliyesi.",
        "**5. Gün – Keban Baraj Gölü, Çırçır Şelalesi ve Veda:** Keban ilçesinde Fırat'ın birleşim noktası ve Çırçır Şelalesi ziyareti, alabalık molası, merkeze dönüşte kütüphane notlarının tamamlanması."
      ]
    },
    "06_DoguAnadolu/Erzincan": {
      "plate": 24,
      "name": "Erzincan",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 39.75,
      "lng": 39.5,
      "landmarks": [
        "Girlevik Şelalesi",
        "Karanlık Kanyon (Kemaliye)",
        "Kemaliye Tarihi Taş Evleri",
        "Ergan Dağı Kayak Merkezi",
        "Terzibaba Türbesi"
      ],
      "specialties": [
        "Erzincan Tulum Peyniri",
        "Kemaliye Lök Tatlısı",
        "Gözleme & Kete"
      ],
      "quote": "Karanlık Kanyon'un Fırat ile yarıştığı heybet, Girlevik Şelalesi'nin çağıltısı ve Terzibaba'nın teslimiyeti.",
      "library": "Erzincan İl Halk Kütüphanesi - Deprem sonrası yenilenen geniş caddelerin ortasında modern ve ferah bir kütüphane.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Erzincan/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Erzincan/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Erzincan/banner.jpg",
        "06_DoguAnadolu/Erzincan/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Erzincan/README.md",
      "slug": "Erzincan",
      "content_size": 5670,
      "custom_quote": "Girlevik Şelalesi'nin serin suları, Kemaliye Kanyonu'nun dik yamaçlarıyla depremlerden küllerinden doğan şehir.",
      "custom_library": "Erzincan İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "İpekyolu üzerinde yer alan Erzincan, yaşadığı büyük depremlere rağmen her seferinde yeniden kurulan dirayetli insanların şehridir. Kemaliye ilçesi özgün mimarisini korumuştur. Mengüceklilerin başkenti olan ve Altıntepe Urartu Kalesi ile binlerce yıllık bir yerleşim geleneğini omuzlayan Erzincan, Fırat'ın (Karasu) bereketli ovasını çevreleyen Munzur ve Keşiş Dağları'nın ortasında geniş, düzenli bulvarlarıyla nefes alır. Tarihi adıyla Eğin olarak bilinen Kemaliye ilçesi ise ahşap kapı tokmakları, taş konakları, 132 yılda insan emeğiyle oyulan Taş Yol ve dünyanın en derin kanyonlarından Karanlık Kanyon ile Anadolu'nun en özgün kültür hazinelerinden biridir.",
      "literary_quotes": [
        "\"Kemaliye, Fırat'ın kıyısında kayalara asılmış tarihi ve yemyeşil bir vaha gibidir.\" — Evliya Çelebi",
        "\"Girlevik, dağlardan dökülen suların en güzel zikridir.\" — Bedri Rahmi Eyüboğlu"
      ],
      "reflection": "Kemaliye Karanlık Kanyonu'nun devasa kayalıkları arasında süzülürken, Fırat'ın coşkusunu ve doğanın haşmetini tefekkür edersiniz.",
      "spiritual_figures": [
        "**Terzi Baba (Muhammed Vehbi Hayyat, 1779–1848):** Erzincan'ın manevi kutbu, Nakşibendi-Halidi geleneğinin büyük mürşidi. *Kenzü'l-Fütuh* adlı manzum eseriyle tasavvuf edebiyatına derin izler bırakmıştır.",
        "**Pîr-i Sâmî (Abdurrahman Sami Niyazi) ve Salih Baba:** 19. yüzyıl Erzincan irfan geleneğinin, hikmetli sohbetleri ve divanlarıyla gönüllere dokunan manevi rehberleri.",
        "**Mama Hatun (Saltuklu Hükümdarı):** Tercan'da inşa ettirdiği eşsiz kervansaray, hamam ve dairesel kümbet külliyesiyle Türk-İslam mimarisinin öncü kadın banisi.",
        "**Behram Şah (Mengücekli Hükümdarı):** Erzincan'ı 12. yüzyılda bilim, sanat ve edebiyat merkezi haline getiren, Nizâmî-i Gencevî'nin *Mahzenü'l-Esrar* eserini ithaf ettiği âlim dostu bey."
      ],
      "five_day_plan": [
        "**1. Gün – Erzincan Merkez ve Terzibaba Ziyareti:** KYK yurduna yerleşme, Erzincan İl Halk Kütüphanesi mesaisi, Terzibaba Camii ve Türbesi ziyareti, Bakırcılar Çarşısı'nda el işçiliği incelemesi ve akşam tulum peynirli döner molası.",
        "**2. Gün – Girlevik Şelalesi ve Ekşisu Mesire Alanı:** Dokuz farklı kaynaktan beslenip 40 metreden dökülen Girlevik Şelalesi yürüyüşü, ardından doğal maden sularıyla ünlü Ekşisu sazlıkları ve kuş gözlemi.",
        "**3. Gün – Kemaliye (Eğin), Karanlık Kanyon ve Taş Yol:** Sabah erken Kemaliye'ye hareket; Karanlık Kanyon tekne turu veya yürüyüşü, 38 tünelden oluşan efsanevi Taş Yol, Mani Yolu, tarihi Eğin konakları ve Prof. Dr. Ali Demirsoy Doğa Tarihi Müzesi.",
        "**4. Gün – Tercan Mama Hatun Külliyesi ve Altıntepe:** Urartu döneminin görkemli merkezi Altıntepe Ören Yeri'nin gezilmesi; ardından Tercan'da Saltuklu şaheseri Mama Hatun Kervansarayı ve Kümbeti ziyareti.",
        "**5. Gün – Ergan Dağı Etekleri, Otlukbeli Gölü ve Veda:** Dünyada nadir görülen traverten set gölü Otlukbeli Gölü (veya Ergan Dağı Ardıçlı Gölü) ziyareti, kütüphanede notların derlenmesi ve Cimin üzümü eşliğinde şehre veda."
      ]
    },
    "06_DoguAnadolu/Erzurum": {
      "plate": 25,
      "name": "Erzurum",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 39.9043,
      "lng": 41.2679,
      "landmarks": [
        "Çifte Minareli Medrese",
        "Yakutiye Medresesi",
        "Üç Kümbetler",
        "Erzurum Kalesi",
        "Tortum Şelalesi",
        "Palandöken"
      ],
      "specialties": [
        "Cağ Kebabı",
        "Kadayıf Dolması",
        "Erzurum Ketesi",
        "Aşotu Çorbası"
      ],
      "quote": "Dadaşlar diyarı; Selçuklu medreselerinin göğe uzanan çifte minareleri ve İbrahim Hakkı Hazretleri'nin 'Mevla görelim neyler, neylerse güzel eyler' teslimiyeti.",
      "library": "Erzurum Erzurumlu Emrah İl Halk Kütüphanesi - Tarihi dokusuyla dadaşların vakur çalışma disiplinini yansıtan sessiz çalışma limanı.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Erzurum/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Erzurum/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Erzurum/banner.jpg",
        "06_DoguAnadolu/Erzurum/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Erzurum/README.md",
      "slug": "Erzurum",
      "content_size": 5781,
      "custom_quote": "Palandöken Dağı'nın karlı zirveleri, Çifte Minareli Medrese'nin asil taş kapısıyla Doğu'nun kilit taşı vakur şehir.",
      "custom_library": "Erzurum İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Selçuklu ve İlhanlı dönemlerinde önemli bir ilim merkezi olan Erzurum, Milli Mücadele döneminde Erzurum Kongresi ile vatanın bölünmezliğini dünyaya ilan etmiştir. Anadolu'daki ilk Türk beyliklerinden Saltukluların başkenti olan bu 1.900 metre rakımlı yayla kenti; Ulu Camii, Üç Kümbetler, Çifte Minareli Medrese, Yakutiye Medresesi ve Rüstem Paşa Bedesteni (Taşhan) ile Selçuklu'dan Osmanlı'ya kesintisiz bir mimari şölen sunar. Aziziye Tabyaları'nda 93 Harbi'nin destansı direnişini, Tortum Şelalesi ve Narman Peribacaları'nda ise Doğu Anadolu ile Karadeniz'in kucaklaştığı eşsiz tabiat mucizelerini barındırır.",
      "literary_quotes": [
        "\"Erzurum, Anadolu'nun kilididir, soğuk iklimin sıcak kalpli yiğit insanlarıdır.\" — Evliya Çelebi",
        "\"Palandöken'in vakur duruşu, çift minarenin asil duruşu Erzurum'un ruhudur.\" — Ahmet Hamdi Tanpınar"
      ],
      "reflection": "Çifte Minareli Medrese'nin kapısındaki Selçuklu hayat ağacı motifini incelerken, medeniyetimizin köklerini ve ebediyet arayışını tefekkür edersiniz.",
      "spiritual_figures": [
        "**Erzurumlu İbrahim Hakkı Hazretleri (1703–1780):** Hasankale'de doğmuş, astronomi, tıp, psikoloji ve tasavvufu birleştiren *Marifetname* adlı ansiklopedik şaheserin müellifi büyük âlim ve mutasavvıf.",
        "**Alvarlı Efe (Muhammed Lütfi Efendi, 1868–1956):** *Hulâsatü'l-Hakâyık* divanının sahibi, merhamet ve hikmet dolu şiirleriyle Erzurum'un manevi ufkunu aydınlatan gönül sultanı.",
        "**Abdurrahman Gazi:** Erzurum'un manevi bekçisi olarak Palandöken eteklerinde medfun sahabe/gazi; şehri kuşbakışı gören türbesi asırlardır dua ve tefekkür makamıdır.",
        "**Nene Hatun (1857–1955):** 1877–1878 Osmanlı-Rus Harbi'nde Aziziye Tabyası'nı savunarak Türk kadınının cesaret ve vatan sevgisinin ebedi sembolü olmuş kahraman.",
        "**Erzurumlu Emrah ve Sümmani Baba:** Doğu Anadolu âşıklık geleneğinin ve saz eşliğinde hikmet söyleyişinin zirve isimleri."
      ],
      "five_day_plan": [
        "**1. Gün – Selçuklu ve Saltuklu Mirası (Tarihi Merkez):** KYK yurduna yerleşme, Erzurum İl Halk Kütüphanesi mesaisi, Çifte Minareli Medrese, Ulu Camii, Üç Kümbetler, Yakutiye Medresesi ve Erzurum Kalesi (Saat Kulesi) ziyareti.",
        "**2. Gün – Milli Mücadele Hafızası ve Taşhan:** Erzurum Kongre Binası Müzesi, Lala Mustafa Paşa Camii, Oltu taşı ustalarının bulunduğu Rüstem Paşa Bedesteni (Taşhan), Aziziye Tabyaları ve Nene Hatun Tarihi Milli Parkı; akşam Cağ Kebabı ve Kadayıf Dolması.",
        "**3. Gün – Palandöken ve Abdurrahman Gazi:** Sabah Abdurrahman Gazi Türbesi'nde şehre kuşbakışı tefekkür, ardından Palandöken Dağı eteklerinde yüksek irtifa yürüyüşü ve tarihi Erzurum Evleri'nde kıtlama çay molası.",
        "**4. Gün – Tortum Şelalesi, Öşvank ve Narman Peribacaları:** Kuzey rotasına günübirlik sefer; 48 metreden dökülen görkemli Tortum Şelalesi, Tortum Gölü, Orta Çağ eseri Öşvank Manastırı ve \"Kırmızı Periler Diyarı\" Narman Peribacaları.",
        "**5. Gün – Hasankale (Pasinler), Çobandede Köprüsü ve Veda:** Pasinler Kalesi ve 13. yüzyıl İlhanlı eseri Çobandede Köprüsü ziyareti; kütüphanede notların tamamlanması ve Dadaş diyarına veda."
      ]
    },
    "06_DoguAnadolu/Hakkari": {
      "plate": 30,
      "name": "Hakkari",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 37.5833,
      "lng": 43.7333,
      "landmarks": [
        "Cilo Sat Buzul Gölleri",
        "Meydan Medresesi",
        "Zap Vadisi",
        "Cennet-Cehennem Vadisi",
        "Merga Bütan"
      ],
      "specialties": [
        "Hakkari Çorti Aşı",
        "Doğaba",
        "Yüksekova Kebabı",
        "Cevizli Çörek"
      ],
      "quote": "Cilo Dağları'nın buzul gölleri, binlerce yıllık kaya resimleri ve Zap Suyu'nun hırçın yankısı.",
      "library": "Hakkari İl Halk Kütüphanesi - Zirvelerin gölgesinde sakin çalışma ortamı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Hakkari/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Hakkari/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Hakkari/banner.jpg",
        "06_DoguAnadolu/Hakkari/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Hakkari/README.md",
      "slug": "Hakkari",
      "content_size": 5436,
      "history": "Türkiye'nin güneydoğu ucunda, 4.135 metrelik **Uludoruk (Reşko)** zirvesiyle Anadolu'nun ikinci en yüksek noktasına ev sahipliği yapan Hakkari, doğa ve tarih meraklıları için eşsiz bir coğrafyadır. Urartular, Medler, Persler, Abbasiler ve Selçukluların izlerini taşıyan bölge, uzun yüzyıllar boyunca Hakkari Beyliği (Çölemerik) yönetiminde özgün bir kültür ve ilim havzası olarak yaşamıştır. Şehrin kalbinde yer alan 18. yüzyıl eseri **Meydan Medresesi**, iki katlı revaklı avlusu ve taş işçiliğiyle bölgenin kadim eğitim geleneğini yansıtır. Hakkari'nin 1998'de keşfedilen ve MÖ 2. binyıla tarihlenen **Hakkari Stelleri** ise Anadolu arkeolojisinin en gizemli buluntularındandır. Doğal miras bakımından **Cilo ve Sat Dağları Milli Parkı**, yazın ortasında bile erimeyen devasa buzulları, 3.000 metre rakımdaki buzul gölleri, endemik ters laleleri (Ağlayan Gelin), Cennet-Cehennem Vadisi ve derin Zap Vadisi ile Alpleri aratmayan bir ihtişam sunar.",
      "literary_quotes": [
        "\"Cilo'nun karlı zirveleri bulutları deler; eteklerindeki buzul gölleri gökyüzünün yere düşmüş parçalarıdır.\" — Dağcı ve Seyyah Notları",
        "\"Zap Suyu, sarp kayalıkların arasından çağlayarak Mezopotamya'ya dağların selamını taşır.\" — Bölge Folkloru"
      ],
      "spiritual_figures": [
        "**İbrahim Bey ve Hakkari Beyleri:** 1700'lü yıllarda Meydan Medresesi'ni ve tarihi taş köprüleri inşa ettirerek Çölemerik'i bir ilim ve mimari merkezine dönüştüren baniler.",
        "**Seyyid Taha-i Hakkâri (1792–1853):** Şemdinli'nin Nehri (Bağlar) köyünde yaşamış, Mevlânâ Hâlid-i Bağdâdî'nin önde gelen halifelerinden büyük mutasavvıf; Kayme Sarayı ve Kelat Sarayı çevresinde asırlık bir irfan ocağı kurmuştur.",
        "**Pertev Bey ve Bölge Müderrisleri:** Çölemerik ve Nehri medreselerinde ilim, edebiyat ve tasavvuf halkalarını nesiller boyu yaşatan âlimler."
      ],
      "five_day_plan": [
        "**1. Gün – Çölemerik (Merkez) ve Meydan Medresesi:** Şehre varış, İl Halk Kütüphanesi'nde çalışma mesaisi, tarihi Meydan Medresesi, Çölemerik Kalesi etekleri, Hakkari Kilim dokuma atölyeleri ve akşam Doğaba tadımı.",
        "**2. Gün – Cilo Dağları ve Cennet-Cehennem Vadisi:** Kırıkdağ üzerinden Cennet-Cehennem Vadisi'ne hareket; 20 bin yıllık Cilo buzulları, şelaleler ve dört mevsimin bir arada yaşandığı vadi yürüyüşü.",
        "**3. Gün – Yüksekova ve Sat Buzul Gölleri:** Yüksekova'ya geçiş ve 3.000 metre rakımlı Sat Buzul Gölleri'ne (Gelyano, Baygöl) çıkış; zümrüt göllerin kıyısında sessiz tefekkür ve fotoğrafçılık.",
        "**4. Gün – Şemdinli, Nehri ve Tarihi Taş Köprü:** Şemdinli'de Şemdinli Çayı üzerindeki 19. yüzyıl eseri Taş Köprü, Bağlar (Nehri) köyünde Seyyid Taha-i Hakkâri Türbesi ve Kayme Sarayı kalıntıları ziyareti.",
        "**5. Gün – Berçelan Yaylası, Merga Bütan ve Veda:** Göllerle bezeli Berçelan Yaylası veya Merga Bütan seyir noktasında serin yayla havası, Zap Vadisi boyunca dönüş yolculuğu ve notların derlenmesi."
      ]
    },
    "06_DoguAnadolu/Igdir": {
      "plate": 76,
      "name": "Iğdır",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 39.9196,
      "lng": 44.045,
      "landmarks": [
        "Tuzluca Tuz Mağaraları",
        "Ağrı Dağı Milli Parkı",
        "Ejder Kervansarayı",
        "Karakale Ören Yeri"
      ],
      "specialties": [
        "Bozbaş (Piti)",
        "Taş Köfte",
        "Iğdır Kayısısı",
        "Kete"
      ],
      "quote": "Üç ülkeye sınır, Doğu'nun Çukurova'sı mikroklima cenneti ve Tuzluca'nın yer altı mağaraları.",
      "library": "Iğdır İl Halk Kütüphanesi - Doğu sınırında sakin ve ferah bir çalışma mekanı.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Igdir/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Igdir/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Igdir/banner.jpg",
        "06_DoguAnadolu/Igdir/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Igdir/README.md",
      "slug": "Igdir",
      "content_size": 5533,
      "custom_quote": "Üç ülkeye sınır açan serhat ovası, Doğu'nun Çukurova'sı mikroklima cenneti ve Tuzluca'nın yer altı kristal mağaraları.",
      "custom_library": "Iğdır İl Halk Kütüphanesi - Şehir merkezinde sakin, aydınlık ve odaklanmayı kolaylaştıran ortam.",
      "history": "Türkiye'nin en doğu ucunda yer alan ve Ermenistan, Azerbaycan (Nahçıvan) ile İran'a komşu olan Iğdır, etrafı yüksek dağlarla çevrili korunaklı bir ovadır. Bu coğrafi yapısı sayesinde Doğu Anadolu'nun sert kış şartlarına tezat olarak mikroklima iklimi yaşar; kayısı bahçeleri, pamuk tarlaları ve bereketli tarım alanlarıyla \"Doğu'nun Çukurova'sı\" unvanını taşır. İlçelerindeki Tuzluca Tuz Mağaraları ise Hititlerden bu yana işletilen devasa yer altı galerileridir. Tarihi İpekyolu'nun Kafkasya ve İran kapısında yükselen 12. yüzyıl Selçuklu eseri **Ejder (Harmandöven) Kervansarayı**, yüzlerce yıl kervanların sığınağı olmuştur. Koç başlı Karakoyunlu mezar taşları, Aras Nehri kuş cenneti ve Gökkuşağı Tepeleri'nin (Tuzluca) mineral renkleriyle bezeli jeolojik oluşumları Iğdır'ı hem tarih hem de doğa açısından benzersiz kılar.",
      "literary_quotes": [
        "\"Iğdır Ovası, Aras Nehri'nin suladığı, Doğu'nun soğuğunda saklı sıcacık bir yeşil vahadır.\" — Seyyah Gözlemi",
        "\"Tuzluca'nın devasa kaya tuzu mağaralarında yankılanan sessizlik, asırların yer altındaki sabır anıtıdır.\" — Gezi Notları"
      ],
      "reflection": "Aras Nehri boyunda üç farklı devletin sınır çizgilerinin birleştiği noktada durup sınırların geçiciliğini, kardeşlik bağlarının ve aynı gökyüzü altında paylaşılan yeryüzünün birliğini tefekkür edersiniz. Tuzluca Mağaraları'nın devasa tavanları altında yürürken yerin yüzlerce metre altındaki şifayı ve nimeti düşünürsünüz.",
      "spiritual_figures": [
        "**Şerafeddin Ejder Bey:** 12. yüzyılda Sürmeli Emiri olarak İpekyolu ticaretini ve yolcuların emniyetini sağlamak üzere anıtsal Ejder Kervansarayı'nı inşa ettiren Selçuklu banisi.",
        "**Karakoyunlu ve Selçuklu Taş Ustaları:** Iğdır ovasındaki kadim mezarlıklarda yer alan koç başlı mezar taşlarıyla Orta Asya'dan Anadolu'ya uzanan kültürel hafızayı taşa nakşeden sanatkârlar.",
        "**Serhat Boyu Âlim ve Âşıkları:** Azerbaycan ve Anadolu kültür havzasının kesişiminde sözlü edebiyatı, deyişleri ve kardeşlik bağlarını yaşatan halk ozanları."
      ],
      "five_day_plan": [
        "**1. Gün – Iğdır Merkez ve Ağrı Dağı Silüeti:** KYK yurduna yerleşme, Iğdır İl Halk Kütüphanesi'nde ilk çalışma mesaisi, Soykırım Anıtı ve Müzesi ziyareti, akşam çarşıda Bozbaş (Piti) ve Taş Köfte tadımı.",
        "**2. Gün – Tuzluca Tuz Mağaraları ve Gökkuşağı Tepeleri:** Tuzluca'daki devasa Tuz Terapi Mağaraları'nda yer altı yürüyüşü, ardından kırmızı-sarı-yeşil mineral katmanlarıyla büyüleyen Gökkuşağı Tepeleri'nde gün batımı fotoğrafçılığı.",
        "**3. Gün – Ejder Kervansarayı ve Karakoyunlu Koç Başlı Mezarları:** 12. yüzyıl Selçuklu eseri Ejder Kervansarayı'nın incelenmesi, Karakoyunlu ve Melekli çevresindeki tarihi koç başlı mezar taşlarının ziyareti.",
        "**4. Gün – Aralık, Aras Kuş Cenneti ve Nahçıvan Sınır Hattı:** Aras Nehri boyunca ilerleyerek Aras Kuş Araştırma Merkezi'nin görülmesi, Dilucu sınır hattı ve Büyük Ağrı Dağı'nın kuzey yamaçlarındaki Korhan Yaylası seyir noktası.",
        "**5. Gün – Karakale Ören Yeri ve Veda:** Urartu ve Orta Çağ izlerini taşıyan Karakale Ören Yeri gezisi, kayısı bahçeleri arasında veda yürüyüşü ve kütüphane notlarının toparlanması."
      ]
    },
    "06_DoguAnadolu/Kars": {
      "plate": 36,
      "name": "Kars",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 40.6167,
      "lng": 43.1,
      "landmarks": [
        "Ani Harabeleri (Binbir Kiliseli Şehir)",
        "Kars Kalesi",
        "Harakani Türbesi",
        "Havariler Kilisesi (Kümbet Camii)",
        "Baltık Mimarisi Evleri"
      ],
      "specialties": [
        "Kars Kaşarı & Gravyeri",
        "Kars Kaz Eti Pilavı",
        "Hangel",
        "Piti (Bozbaş)"
      ],
      "quote": "Ebu'l Hasan Harakani'nin 'Her kim bu kapıya gelirse ekmeğini verin, inancını sormayın' felsefesi ve Ani Harabeleri'nin bin yıllık taşları.",
      "library": "Kars İl Halk Kütüphanesi - Rus döneminden kalma taş binaların mistik havasında, karlar altında kodlama mesaisi yapabileceğiniz sıcak sığınak.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Kars/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Kars/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Kars/banner.jpg",
        "06_DoguAnadolu/Kars/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Kars/README.md",
      "slug": "Kars",
      "content_size": 5788,
      "custom_quote": "Ani Harabeleri'nin hüzünlü ve görkemli kalıntıları, Rus mimarisi tarihi sokaklarıyla sınır boyunun asil şehri.",
      "custom_library": "Kars İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Bagratlı krallığından Selçuklu fethine, Rus işgali döneminden kurtuluşa kadar Kars, askeri ve kültürel tarihimizin en stratejik serhat kentidir. Sultan Alparslan'ın 1064'te fethettiği ve Anadolu'daki ilk Türk camisi olan **Ebu'l-Menuçehr Camii**'ni barındıran UNESCO Dünya Mirası **Ani Ören Yeri**, Arpaçay kanyonunun kıyısında bin yıllık bir medeniyetler geçidi olarak yükselir. 19. yüzyılın son çeyreğinde Hollandalı ve Baltık mimarlarca ızgara planla kurulan kesme bazalt taşlı konakları, Kars Kalesi'nin gölgesindeki Taş Köprü, Fethiye Camii (Alexander Nevski Kilisesi), Sarıkamış'ın kristal karlı sarıçam ormanları ve Çıldır Gölü'ne uzanan yaylalarıyla Kars, Türkiye'nin en özgün kimliğe sahip şehirlerindendir.",
      "literary_quotes": [
        "\"Ani bir dünya ama dünya bir Ani değil.\" — Tarihi Selçuklu Özdeyişi",
        "\"Kars Kalesi, doğu sınırımızın en dik duruşlu, en aşılmaz Selçuklu nöbetçisidir.\" — Evliya Çelebi"
      ],
      "reflection": "Ani Harabeleri'nde Bizans kiliseleri ile Selçuklu camilerinin yan yana duran kalıntılarında, tarihin çok sesliliğini ve medeniyetlerin faniliğini tefekkür edersiniz.",
      "spiritual_figures": [
        "**Ebu'l-Hasan Harakânî Hazretleri (963–1033):** Anadolu'nun manevi fatihlerinden, \"Her kim bu dergâha gelirse ekmeğini veriniz, inancını sormayınız\" düsturuyla insanlık tarihine merhamet dersi veren büyük Horasan ereni; türbesi Kars Kalesi eteklerindeki Evliya Camii külliyesindedir.",
        "**Sultan Alparslan ve Ebu'l-Menuçehr:** 1064 Ani fethiyle Anadolu'nun kapılarını aralayan ve Anadolu'daki ilk camiyi inşa ettiren tarih yapıcı liderler.",
        "**Gazi Ahmed Muhtar Paşa ve Kâzım Karabekir Paşa:** 93 Harbi ve Milli Mücadele'de Doğu Cephesi'nin ve Kars'ın kurtuluşunun unutulmaz komutanları.",
        "**Âşık Murat Çobanoğlu ve Kars Âşıkları:** Kars Âşıklar Evi geleneğini yaşatan, atışmalarıyla Doğu'nun sözlü kültürünü bugüne taşıyan büyük halk ozanları."
      ],
      "five_day_plan": [
        "**1. Gün – Kale İçi, Ebu'l-Hasan Harakânî ve Baltık Sokakları:** KYK yurduna yerleşme, Kars İl Halk Kütüphanesi mesaisi, Ebu'l-Hasan Harakânî Türbesi ve Evliya Camii ziyareti, Havariler Kilisesi (Kümbet Camii), Kars Kalesi'nden gün batımı ve Taş Köprü yürüyüşü.",
        "**2. Gün – UNESCO Mirası Ani Ören Yeri:** Sabah erken Ani'ye hareket; Aslanlı Kapı, Büyük Katedral (Fethiye Camii), Anadolu'nun ilk camisi Ebu'l-Menuçehr Camii, Tigran Honents Kilisesi ve Arpaçay kanyonu seyri.",
        "**3. Gün – Tarihi Merkez, Kafkas Cephesi ve Peynir Müzesi:** Fethiye Camii, Gazi Ahmet Muhtar Paşa Konağı, Kanlı Tabya (Kafkas Cephesi Harp Tarihi Müzesi), Türkiye'nin ilk Peynir Müzesi (Boğatepe / Süvari Tabyası) ve akşam Âşıklar Evi'nde saz dinletisi.",
        "**4. Gün – Sarıkamış Şehitliği ve Katerina Köşkü:** Sarıkamış Harekatı Şehitliği'nde dua ve tefekkür, sarıçam ormanları içinde yükselen tarihi Katerina Av Köşkü ziyareti ve yayla havasında yürüyüş.",
        "**5. Gün – Boğatepe Köyü, Kars Çarşısı ve Veda:** Gravyer peynirinin doğduğu Boğatepe köyü ziyareti, şehir merkezinde eski kaşar ve bal alışverişi, kütüphanede notların tamamlanmasıyla serhat şehrine veda."
      ]
    },
    "06_DoguAnadolu/Malatya": {
      "plate": 44,
      "name": "Malatya",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 38.3552,
      "lng": 38.3095,
      "landmarks": [
        "Arslantepe Höyüğü (UNESCO)",
        "Battalgazi Ulu Cami",
        "Silahtar Mustafa Paşa Kervansarayı",
        "Levent Vadisi Seyir Terası",
        "Günpınar Şelalesi"
      ],
      "specialties": [
        "Malatya Kayısısı",
        "Analı Kızlı",
        "Kayıslı Kavurma",
        "Kiraz Yaprağı Köftesi",
        "Kömbe"
      ],
      "quote": "Dünyanın ilk kerpiç sarayına ev sahipliği yapan Arslantepe, Battalgazi'nin yiğitliği ve kayısı bahçelerinin bereketi.",
      "library": "Malatya İl Halk Kütüphanesi - Şehir merkezinde yer alan, geniş araştırma kaynakları ve rahat çalışma alanları sunan yerleşke.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Malatya/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Malatya/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Malatya/banner.jpg",
        "06_DoguAnadolu/Malatya/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Malatya/README.md",
      "slug": "Malatya",
      "content_size": 5814,
      "custom_quote": "Arslantepe Höyüğü ile devletleşmenin ilk adımlarına tanıklık eden, kayısının ve bereketli ovaların şehri.",
      "custom_library": "Malatya İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "İnsanlık tarihinin en eski saray ve bürokrasi kalıntılarını barındıran Arslantepe'ye sahip olan Malatya, Fırat nehrinin suladığı en bereketli topraklardandır. UNESCO Dünya Mirası Listesi'nde yer alan 5.500 yıllık **Arslantepe Höyüğü**, dünyadaki ilk mühürlü bürokrasi, kerpiç saray kompleksi ve devlet örgütlenmesi izleriyle insanlık tarihinin dönüm noktalarından biridir. Eski Malatya (Battalgazi) ise Selçuklu döneminin görkemli eseri Battalgazi Ulu Camii, Silahtar Mustafa Paşa Kervansarayı ve surlarıyla Anadolu'nun kapısındaki kadim İslam kentidir. Batıda Darende'nin Tohma Kanyonu, Günpınar Şelalesi ve Somuncu Baba Külliyesi, kuzeyde Arapgir'in tarihi taş konakları ve Levent Vadisi'nin 65 milyon yıllık kaya oluşumları Malatya'ya derin bir coğrafi ve manevi zenginlik katar.",
      "literary_quotes": [
        "\"Malatya, Fırat'ın bereketiyle yoğrulmuş, kayısı bahçelerinin kokusunda dinlenen cennet köşesidir.\" — Evliya Çelebi",
        "\"Somuncu Baba Külliyesi, ruhların arındığı, gönüllerin şifa bulduğu manevi bir limandır.\" — Es-Seyyid Osman Hulusi Efendi"
      ],
      "reflection": "Somuncu Baba Külliyesi'nin huzurlu manevi atmosferinde kalbi bir sükunete erer, Tohma Çayı'nın sesinde dinginliği tefekkür edersiniz.",
      "spiritual_figures": [
        "**Şeyh Hâmid-i Velî (Somuncu Baba, 1331–1412):** Bursa Ulu Camii'nin açılış hutbesini okuyan, Hacı Bayram-ı Velî'nin mürşidi büyük mutasavvıf; ömrünün son yıllarını Darende'de geçirmiş olup türbesi ve Balıklı Gölü gönüllerin şifa durağıdır.",
        "**Es-Seyyid Osman Hulusi Efendi (1914–1990):** Darende'nin manevi mimarı, şair ve hayırsever; Somuncu Baba Külliyesi'nin ihyasına ve şehrin kültür hayatına büyük hizmetler sunmuştur.",
        "**Seyyid Battal Gazi:** Emeviler ve Abbasiler döneminde Anadolu gaza geleneğinin destansı kahramanı; kadim Malatya (Battalgazi) ilçesi onun adıyla anılır.",
        "**Niyâzî-i Mısrî (1618–1694):** Malatya'nın Soğanlı köyünde doğmuş, tasavvuf edebiyatının en lirik divan şairlerinden büyük âlim ve mutasavvıf."
      ],
      "five_day_plan": [
        "**1. Gün – UNESCO Mirası Arslantepe ve Battalgazi:** KYK yurduna yerleşme, Malatya İl Halk Kütüphanesi mesaisi, Arslantepe Höyüğü Açık Hava Müzesi, Battalgazi Ulu Camii, Silahtar Mustafa Paşa Kervansarayı ve Şire Pazarı'nda kayısı çeşitleri keşfi.",
        "**2. Gün – Darende, Somuncu Baba ve Tohma Kanyonu:** Darende'ye hareket; Somuncu Baba Türbesi ve Külliyesi, Balıklı Havuz, sarp kayalıklar arasındaki Tohma Kanyonu yürüyüşü ve üç kademeli Günpınar Şelalesi.",
        "**3. Gün – Akçadağ Levent Vadisi ve Seyir Terası:** 65 milyon yıllık jeolojik oluşumlarıyla Anadolu'nun Büyük Kanyonu sayılan Levent Vadisi'nin cam seyir terasından izlenmesi ve vadi içi kaya yerleşimlerinin keşfi.",
        "**4. Gün – Yeşilyurt Tarihi Konakları ve Arapgir:** Geleneksel kerpiç ve ahşap Yeşilyurt evleri, Çırmıktı sokakları ve vakit elverirse Cittaslow (Sakin Şehir) unvanlı Arapgir'in taş konakları ve Kayaarası Kanyonu.",
        "**5. Gün – Karakaya Baraj Gölü Kıyısı ve Veda:** Fırat'ın sularında sabah dinginliği, kütüphanede seyahat notlarının tamamlanması ve Kağıt Kebabı eşliğinde şehre veda."
      ]
    },
    "06_DoguAnadolu/Mus": {
      "plate": 49,
      "name": "Muş",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 38.7432,
      "lng": 41.5064,
      "landmarks": [
        "Tarihi Murat Köprüsü",
        "Muş Kalesi",
        "Arak Manastırı",
        "Malazgirt Zafer Anıtı (Meydan Muharebesi Tarihi Milli Parkı)"
      ],
      "specialties": [
        "Muş Köftesi",
        "Hafta Direği",
        "Tırşık",
        "Muş Çortisi"
      ],
      "quote": "1071 Malazgirt Zaferi ile Anadolu'nun kapılarının İslam'a ve Türklere açıldığı şanlı menzil ve Murat Nehri.",
      "library": "Muş İl Halk Kütüphanesi - Tarihin başladığı ovada sessiz ve sakin çalışma alanı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Mus/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Mus/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Mus/banner.jpg",
        "06_DoguAnadolu/Mus/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Mus/README.md",
      "slug": "Mus",
      "content_size": 5443,
      "history": "Doğu Anadolu'nun en geniş ve bereketli ovalarından birine kurulu olan Muş, Türk ve İslam tarihinin dönüm noktası olan **26 Ağustos 1071 Malazgirt Meydan Muharebesi**'ne ev sahipliği yapmasıyla Anadolu'nun tapu senedi sayılır. Urartular, Medler, Persler, Romalılar, Bizanslılar, Selçuklular ve Osmanlılar döneminde stratejik bir merkez olan şehir, her bahar ovasını baştan başa kırmızı bir halıya çeviren endemik **Muş Lalesi** ile şairlere ve türkülere ilham vermiştir. Muş'un mimari mirası, 13. yüzyılda Selçuklu döneminde temelleri atılan ve 12 kemerli görkemli yapısıyla Murat Nehri'ni kucaklayan **Tarihi Murat Köprüsü**, 14. yüzyıl eseri **Muş Ulu Camii**, Alaeddin Bey Camii ve Hacı Şeref Camii ile şekillenir. Varto yakınlarındaki sönmüş volkanik **Hamurpet (Akdoğan) Gölleri**, Kayalıdere Urartu Kalesi ve Arak (Kutsal Havariler) Manastırı kalıntıları ise şehrin tarih ve tabiat katmanlarını tamamlar.",
      "literary_quotes": [
        "\"Size öyle bir vatan aldım ki, ebediyen sizin olacaktır.\" — Sultan Alparslan (Malazgirt, 1071)",
        "\"Burası Muş'tur, yolu yokuştur; giden gelmiyor, acep ne iştir?\" — Anadolu'nun Yürek Yakan Kadim Türküsü"
      ],
      "spiritual_figures": [
        "**Sultan Alparslan (1029–1072):** 26 Ağustos 1071 Cuma günü kefenini giyerek çıktığı Malazgirt Ovası'nda Anadolu'nun kapılarını ebediyen açan Büyük Selçuklu Sultanı.",
        "**Şeyh Muhammed-i Mağribi:** Muş Ulu Camii'nin hemen yanında türbesi bulunan, şehrin manevi hafızasında derin bir yere sahip tasavvuf büyüğü.",
        "**Alaeddin Bey:** 18. yüzyılda Muş'ta inşa ettirdiği cami ve hayratlarla şehrin Osmanlı dönemindeki imar faaliyetlerine öncülük eden tarihi şahsiyet."
      ],
      "five_day_plan": [
        "**1. Gün – Muş Merkez ve Kadim Mahalleler:** Şehre varış, İl Halk Kütüphanesi mesaisi, Muş Kalesi Parkı'ndan ovaya bakış, Muş Ulu Camii, Alaeddin Bey Camii, Hacı Şeref Camii, Tarihi Yıldızlı Han ve akşam Muş Köftesi tadımı.",
        "**2. Gün – 1071 Malazgirt Ovası ve Milli Parkı:** Sabah Malazgirt'e hareket; Malazgirt Meydan Muharebesi Tarihi Milli Parkı, Malazgirt Kalesi surları, 1071 Zafer Anıtı ve tarihi savaş alanında derin tefekkür.",
        "**3. Gün – Tarihi Murat Köprüsü ve Muş Ovası Laleleri:** 12 kemerli Tarihi Murat Köprüsü'nde fotoğraf ve yürüyüş, bahar mevsimindeyse Muş Ovası'ndaki doğal lale tarlalarının seyri ve Arak Manastırı çevresi gezisi.",
        "**4. Gün – Varto, Hamurpet (Akdoğan) Gölleri ve Kayalıdere:** Varto ilçesine geçiş; 2.149 metre rakımlı Büyük ve Küçük Hamurpet Krater Gölleri'nin sakin kıyılarında doğa yürüyüşü ve Urartu eseri Kayalıdere Kalesi kalıntıları.",
        "**5. Gün – Bulanık, Haçlı Gölü ve Veda:** Kazan (Haçlı) Gölü çevresinde kuş gözlemi veya merkezde yerel çarşı gezisi, kütüphane notlarının toparlanması ve Anadolu'nun kapısı Muş'a veda."
      ]
    },
    "06_DoguAnadolu/Tunceli": {
      "plate": 62,
      "name": "Tunceli",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 39.1079,
      "lng": 39.5401,
      "landmarks": [
        "Munzur Vadisi Milli Parkı",
        "Munzur Gözeleri",
        "Pertek Kalesi",
        "Düzgün Baba Türbesi",
        "Pülümür Vadisi & Ağlayan Kayalar"
      ],
      "specialties": [
        "Şavak Tulum Peyniri",
        "Munzur Balı",
        "Zerefet (Babiko)",
        "Gömme"
      ],
      "quote": "Munzur Suyu'nun berrak gözeleri, doğaya ve canlıya hürmetle bakan irfan geleneği ve sarp kanyonlar.",
      "library": "Tunceli İl Halk Kütüphanesi - Munzur nehrinin esintisiyle serinleyen, sessiz çalışma ortamı ve güler yüzlü çalışanlarıyla butik kütüphane.",
      "visited": true,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Tunceli/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Tunceli/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Tunceli/banner.jpg",
        "06_DoguAnadolu/Tunceli/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Tunceli/README.md",
      "slug": "Tunceli",
      "content_size": 5718,
      "custom_quote": "Munzur Vadisi'nin hırçın suları, Ovacık Gözeleri'nin kutsal kaynaklarıyla doğanın en el değmemiş mistik coğrafyası.",
      "custom_library": "Tunceli İl Halk Kütüphanesi - Sessiz, çalışma disiplinine uygun, internet imkanı sunan verimli bir ilim yuvası.",
      "history": "Tarih boyunca sarp dağları sayesinde özgün kültürünü koruyan Tunceli (Dersim), Munzur efsaneleri ve el değmemiş doğasıyla Anadolu'nun gizemli coğrafyalarındandır. 3.000 metreyi aşan Munzur Dağları'nın eteklerinde kurulu şehir, Türkiye'nin en büyük ve biyolojik çeşitliliği en zengin milli parklarından biri olan **Munzur Vadisi Milli Parkı**'na ev sahipliği yapar. Urartu kaya mezarları, Mengücekli ve Akkoyunlu döneminden kalma **Pertek Kalesi**, Çemişgezek'in sarp kayalıklara oyulmuş İn Delikleri (Derviş Hücreleri), Uzun Hasan döneminin zarif eseri Elti Hatun Camii ve Keban Baraj Gölü'nün ortasında bir ada gibi yükselen kaleleriyle Tunceli, derin bir tarih ve tabiat sentezidir.",
      "literary_quotes": [
        "\"Munzur Vadisi, dağların arasından süzülen hırçın sularıyla doğanın en saf zikir alanıdır.\" — Bedri Rahmi Eyüboğlu",
        "\"Ovacık Gözeleri, toprağın altından fışkıran berrak sularıyla mistik bir yaratılış mucizesidir.\" — Evliya Çelebi"
      ],
      "reflection": "Munzur'un buz gibi berrak sularının yeryüzüne kaynadığı gözelerin başında durup, suyun hayat veren ilahi gücünü hayranlıkla tefekkür edersiniz.",
      "spiritual_figures": [
        "**Munzur Baba:** Rivayete göre ağasına Mekke'de sıcak helva götüren ve ardından süt bakracının döküldüğü kırk ayrı noktadan berrak suların fışkırdığına inanılan, Ovacık Gözeleri'nin manevi hatırasıyla özdeşleşen gönül eri.",
        "**Düzgün Baba (Şah Haydar):** Nazımiye dağlarındaki zirvede makamı bulunan, doğaya, dağ keçilerine ve insanlara duyulan sevginin sembolü kadim veli.",
        "**Elti Hatun:** Akkoyunlu hükümdarı Uzun Hasan'ın kız kardeşi; Mazgirt'te yaptırdığı cami, türbe ve çeşme ile bölgenin 13.–15. yüzyıl taş mimarisine zarif bir mühür vurmuştur.",
        "**Seyyid Baba Mansur ve Kureyşan Ocağı Erenleri:** Yüzyıllar boyunca barış, rızalık ve irfan geleneğini Anadolu'nun bu sarp vadilerinde yaşatan manevi önderler."
      ],
      "five_day_plan": [
        "**1. Gün – Tunceli Merkez ve Munzur Kıyısı:** KYK yurduna yerleşme, Tunceli İl Halk Kütüphanesi mesaisi, Tunceli Müzesi (tarihi kışla binası) gezisi, Munzur ve Pülümür çaylarının birleştiği Mameki Köprüsü çevresinde akşam yürüyüşü ve Babuko tadımı.",
        "**2. Gün – Munzur Vadisi Milli Parkı ve Ovacık Gözeleri:** Munzur Çayı boyunca ilerleyen eşsiz vadi yolundan Ovacık'a geçiş; kırk ayrı gözden kaynayan kutsal Munzur Gözeleri'nde tefekkür, Mercan Vadisi manzarası ve doğal yayla balı molası.",
        "**3. Gün – Pertek Kalesi ve Keban Gölü Feribotu:** Keban Baraj Gölü ortasında bir ada üzerinde yükselen Pertek Kalesi'ne tekneyle geçiş, tarihi Baysungur ve Çelebi Ağa camilerinin ziyareti ve göl kıyısında gün batımı.",
        "**4. Gün – Çemişgezek, Tağar Köprüsü ve İn Delikleri:** Tarihi Çemişgezek sokakları, Tağar (Yusuf Ziya Paşa) Köprüsü, sarp kayalara oyulmuş çok katlı İn Delikleri (Derviş Hücreleri) ve Süleymaniye Camii keşfi.",
        "**5. Gün – Pülümür Vadisi, Ağlayan Kayalar ve Veda:** Pülümür Çayı boyunca Ağlayan Kayalar ve Kutu Deresi'nde serin doğa yürüyüşü, kütüphanede notların derlenmesi ve Munzur'un berrak sularına veda."
      ]
    },
    "06_DoguAnadolu/Van": {
      "plate": 65,
      "name": "Van",
      "region": "Doğu Anadolu",
      "region_code": "06_DoguAnadolu",
      "lat": 38.4891,
      "lng": 43.4089,
      "landmarks": [
        "Akdamar Adası ve Kilisesi",
        "Van Kalesi",
        "Van Gölü (Van Denizi)",
        "Muradiye Şelalesi",
        "Hoşap Kalesi",
        "Çavuştepe Urartu Kalesi"
      ],
      "specialties": [
        "Van Kahvaltısı",
        "Otlu Peynir",
        "İnci Kefali",
        "Sengeser",
        "Kavut"
      ],
      "quote": "Urartu krallarının taht kurduğu Van Kalesi, sodalı masmavi Van Denizi ve Akdamar Adası'nın badem çiçekleri.",
      "library": "Van İl Halk Kütüphanesi - Van Gölü manzarasına yakın, geniş çalışma alanlarına sahip modern kütüphane.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "06_DoguAnadolu/Van/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "06_DoguAnadolu/Van/gallery.jpg",
      "images": [
        "06_DoguAnadolu/Van/banner.jpg",
        "06_DoguAnadolu/Van/gallery.jpg"
      ],
      "readme_rel": "06_DoguAnadolu/Van/README.md",
      "slug": "Van",
      "content_size": 6040,
      "history": "Türkiye'nin en büyük gölü ve dünyanın en büyük sodalı gölü olan **Van Gölü**'nün (halk dilinde Van Denizi) doğu kıyısında kurulu olan Van, MÖ 9. yüzyılda Urartu Krallığı'nın başkenti **Tuşpa** olarak tarih sahnesine çıkmıştır. Sarp bir kaya kütlesi üzerine kurulan **Van Kalesi**, çivi yazılı Urartu kitabeleri, kaya mezarları, Süleyman Han Camii ve hemen güneyindeki Eski Van Şehri kalıntılarıyla (Hüsrev Paşa Külliyesi, Kaya Çelebi Camii, Ulu Camii) Anadolu'nun en görkemli tarih sahnelerinden biridir. Van Gölü'nün turkuaz sularında bir inci gibi parlayan **Akdamar Adası** ve 10. yüzyılda Vaspurakan Kralı I. Gagik tarafından yaptırılan eşsiz taş kabartmalı **Akdamar Kilisesi**, özellikle nisan ayında badem ağaçları çiçek açtığında karlı Artos Dağı fonuyla büyüleyici bir tablo sunar. Gürpınar'da kartal yuvası gibi yükselen 17. yüzyıl eseri **Hoşap Kalesi**, Urartu şaheseri **Çavuştepe Kalesi**, Muradiye Şelalesi, Başkale'nin Vanadokya peribacaları ve kehribar-mavi gözlü sevimli **Van Kedisi**, bu kadim doğu başkentinin unutulmaz imzalarıdır.",
      "literary_quotes": [
        "\"Van Gölü, dağların ortasında gökyüzüne açılmış masmavi bir deniz, Tuşpa ise asırlara meydan okuyan bir taş tahttır.\" — Evliya Çelebi",
        "\"Dünyada Van, ahirette iman.\" — Kadim Doğu Anadolu Deyişi"
      ],
      "spiritual_figures": [
        "**Abdurrahman Gazi:** Van Kalesi'nin kuzeydoğu yamacında türbesi bulunan, şehrin manevi muhafızı kabul edilen kadim ziyaretgâh.",
        "**Seyyid Fehim-i Arvâsî (1825–1896):** Bahçesaray'ın Arvas köyünde ve Van'da irşad faaliyetleriyle Doğu Anadolu'nun ilim ve tasavvuf geleneğine derin izler bırakan büyük âlim.",
        "**Köstendilli Hüsrev Paşa ve Mimar Sinan:** 1567 yılında Eski Van'da inşa edilen ve Mimar Sinan'ın Doğu Anadolu'daki nadide eserlerinden olan Hüsrev Paşa Külliyesi'nin banisi ve mimarı.",
        "**Kral I. Sarduri ve Urartu Mühendisleri:** MÖ 9. yüzyılda Tuşpa Kalesi'ni ve 51 kilometrelik hâlâ işleyen Menua (Şamram) Sulama Kanalı'nı inşa eden antik medeniyet ustaları."
      ],
      "five_day_plan": [
        "**1. Gün – Tuşpa (Van Kalesi), Eski Van ve Van Müzesi:** Şehre varış, kütüphane mesaisi, dünyanın en zengin Urartu koleksiyonlarından birine sahip Van Müzesi, Van Kalesi zirvesinde gün batımı, Eski Van Şehri (Hüsrev Paşa Camii) ve Van Kedisi Villası.",
        "**2. Gün – Akdamar Adası ve Gevaş Selçuklu Mirası:** Gevaş'tan tekneyle Akdamar Adası'na geçiş, Akdamar Kilisesi kabartmalarının incelenmesi ve badem ağaçları arasında yürüyüş; dönüşte Gevaş Halime Hatun Kümbeti ve tarihi Selçuklu Mezarlığı.",
        "**3. Gün – Hoşap Kalesi ve Çavuştepe Urartu Kalesi:** Gürpınar rotasında 17. yüzyılda Mahmudi Süleyman Bey tarafından yaptırılan görkemli Hoşap Kalesi ve Urartu Kralı II. Sarduri'nin yaptırdığı Çavuştepe Kalesi (Sardurihinili) gezisi.",
        "**4. Gün – Muradiye Şelalesi ve Erciş İnci Kefali Göçü:** Kuzey kıyısı boyunca Erciş'te (mevsimindeyse) Deliçay İnci Kefali Tabiat Parkı'nda balıkların akıntıya karşı muhteşem göçünün izlenmesi, ardından Bend-i Mahi Çayı üzerindeki Muradiye Şelalesi ve Şeytan Köprüsü.",
        "**5. Gün – Edremit Sahili, Menua Kanalı ve Veda:** 2.800 yıldır akan Şamram (Menua) Sulama Kanalı'nın görülmesi, Edremit Kız Kalesi kıyısında son bir Van Kahvaltısı ve kütüphane notlarının derlenmesiyle Van Denizi'ne veda."
      ]
    },
    "07_GuneydoguAnadolu/Adiyaman": {
      "plate": 2,
      "name": "Adıyaman",
      "region": "Güneydoğu Anadolu",
      "region_code": "07_GuneydoguAnadolu",
      "lat": 37.7648,
      "lng": 38.2786,
      "landmarks": [
        "Nemrut Dağı Heykelleri (Gündoğumu/Batımı)",
        "Cendere Köprüsü",
        "Arsemia Ören Yeri",
        "Karakuş Tümülüsü",
        "Perre Antik Kenti"
      ],
      "specialties": [
        "Adıyaman Çiğ Köftesi",
        "Besni Tavası",
        "Meyir Çorbası",
        "Buhara Pilavı"
      ],
      "quote": "Kommagene Krallığı'nın tanrı heykelleriyle bezeli Nemrut Zirvesi ve güneşin en görkemli doğup battığı taht.",
      "library": "Adıyaman İl Halk Kütüphanesi - Nemrut'un gölgesinde huzurlu çalışma alanı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "07_GuneydoguAnadolu/Adiyaman/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "07_GuneydoguAnadolu/Adiyaman/gallery.jpg",
      "images": [
        "07_GuneydoguAnadolu/Adiyaman/banner.jpg",
        "07_GuneydoguAnadolu/Adiyaman/gallery.jpg"
      ],
      "readme_rel": "07_GuneydoguAnadolu/Adiyaman/README.md",
      "slug": "Adiyaman",
      "content_size": 5995,
      "literary_quotes": [
        "\"Ben, Büyük Kral Antiochos; bu kutsal mekânı, göksel tahtlara en yakın yerde, zamanın tahribatına meydan okusun diye inşa ettirdim.\" — *Kral I. Antiochos (Nemrut Yazıtı, MÖ 1. yy)*",
        "\"Nemrut'ta şafak sökerken taşlar konuşmaya başlar; insan, tarihin ne kadar kadim, kendi ömrünün ise bir nefes kadar kısa olduğunu orada idrak eder.\" — *Anadolu Seyyahları Güncesi*",
        "\"Hısn-ı Mansur bağları, suları ve misafirperver ahalisiyle Fırat boyunun bereketli bir konağıdır.\" — *Evliya Çelebi, Seyahatnâme*"
      ],
      "reflection": "Adıyaman'a doğru yola çıkmak, bir yandan 2.000 yıl önceki bir kralın ölümsüzlük arzusunu taşların sessizliğinde okumak, diğer yandan Fırat'ın sularına nazır bir sahabe kabrinin huzurunda fâniliği tefekkür etmektir. Nemrut Dağı'nın serin şafağında, ufuk çizgisi kızıla boyanırken doğan güneş, Mezopotamya seferinin ilk büyük uyanışı olacaktır. Kibirli tahtların zamanla nasıl toprağa karıştığını, buna karşılık hikmetin, duanın ve insan sevgisinin nasıl baki kaldığını bu zirvede derinlemesine hissetmeyi arzuluyorum."
    },
    "07_GuneydoguAnadolu/Batman": {
      "plate": 72,
      "name": "Batman",
      "region": "Güneydoğu Anadolu",
      "region_code": "07_GuneydoguAnadolu",
      "lat": 37.8812,
      "lng": 41.1294,
      "landmarks": [
        "Hasankeyf Tarihi Kenti",
        "Zeynel Bey Türbesi",
        "Malabadi Köprüsü",
        "Mor Kiryakus Manastırı"
      ],
      "specialties": [
        "Batman Kütülk (İçli Köfte)",
        "Şam Börek",
        "Tırşık",
        "Hevra Ekmeği"
      ],
      "quote": "Dicle Nehri'nin bağrından doğan 12 bin yıllık Hasankeyf mağaraları ve Zeynel Bey Türbesi'nin turkuaz çinileri.",
      "library": "Batman İl Halk Kütüphanesi - Dicle kıyısında modern çalışma salonları.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "07_GuneydoguAnadolu/Batman/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "07_GuneydoguAnadolu/Batman/gallery.jpg",
      "images": [
        "07_GuneydoguAnadolu/Batman/banner.jpg",
        "07_GuneydoguAnadolu/Batman/gallery.jpg"
      ],
      "readme_rel": "07_GuneydoguAnadolu/Batman/README.md",
      "slug": "Batman",
      "content_size": 6017,
      "literary_quotes": [
        "\"Malabadi Köprüsü'nün altına Ayasofya'nın kubbesi girer. Dünyada bunun gibi bir taş kemer daha görülmemiştir.\" — *Evliya Çelebi, Seyahatnâme*",
        "\"Hasankeyf'in kayalarında binlerce yılın rüzgârı uğuldar; Dicle, taşlara kazınmış medeniyetlerin hikâyesini denize taşır.\" — *Mezopotamya Gezi Notları*",
        "\"İnsan suyla yaşar, suyla hatırlanır; Dicle'nin aktığı her yerde tarih durmaksızın yeniden yazılır.\" — *Kadim Dicle Sözü*"
      ],
      "reflection": "Batman ve Hasankeyf durağı, bu seferde bana zamanın akışını ve medeniyetlerin suyla imtihanını düşündürecek. Zeynel Bey Türbesi'nin turkuaz çinilerine bakarken Semerkant'tan Dicle'ye uzanan sanat ruhunu, Hasankeyf'in yeni siluetinde ise kaybolanla korunan arasındaki ince çizgiyi tefekkür etmek istiyorum. Malabadi Köprüsü'nün kemerinin altında durup 900 yıldır zamana direnen Artuklu taş ustalığını selamlamak, bu yolculuğun en unutulmaz anlarından biri olacak."
    },
    "07_GuneydoguAnadolu/Diyarbakir": {
      "plate": 21,
      "name": "Diyarbakır",
      "region": "Güneydoğu Anadolu",
      "region_code": "07_GuneydoguAnadolu",
      "lat": 37.9144,
      "lng": 40.2306,
      "landmarks": [
        "Diyarbakır Surları (UNESCO)",
        "Hevsel Bahçeleri",
        "Ulu Cami (İslam'ın 5. Harem-i Şerifi)",
        "On Gözlü Köprü",
        "Dört Ayaklı Minare",
        "Cahit Sıtkı Tarancı Müzesi"
      ],
      "specialties": [
        "Diyarbakır Ciğeri",
        "Kaburga Dolması",
        "Burma Kadayıf",
        "Diyarbakır Karpuzu",
        "Meftune"
      ],
      "quote": "Kara bazalt taşlı asırlık surlar, sahabe mezarları ve İslam aleminin 5. Harem-i Şerifi sayılan Ulu Camii.",
      "library": "Diyarbakır İl Halk Kütüphanesi / Sur İlçe Kütüphanesi - Tarihi surların gölgesinde kadim bilgi ocağı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "07_GuneydoguAnadolu/Diyarbakir/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "07_GuneydoguAnadolu/Diyarbakir/gallery.jpg",
      "images": [
        "07_GuneydoguAnadolu/Diyarbakir/banner.jpg",
        "07_GuneydoguAnadolu/Diyarbakir/gallery.jpg"
      ],
      "readme_rel": "07_GuneydoguAnadolu/Diyarbakir/README.md",
      "slug": "Diyarbakir",
      "content_size": 6285,
      "literary_quotes": [
        "\"Diyarbakır Kalesi'nin etrafındaki surlar siyah taştan yapılmıştır; sağlamlığı ve heybeti bakımından dünyada eşi benzeri yoktur.\" — *İbn Battûta, Seyahatnâme (14. yy)*",
        "\"Memleket isterim, gök mavi, dal yeşil, tarla sarı olsun; kuşların çiçeklerin diyarı olsun.\" — *Cahit Sıtkı Tarancı*",
        "\"Bunlar, engerekler ve çıyanlardır; bunlar aşımıza, ekmeğimize göz koyanlardır... Tanı bunları, tanı da büyü!\" — *Ahmed Arif*"
      ],
      "reflection": "Diyarbakır'a girdiğimde önce Suriçi'nin dar bazalt sokaklarında sessizce yürümek, **Ulu Cami**'nin avlusunda ikindi güneşinin taşlara düşen gölgesinde oturmak istiyorum. İçkale'de 27 Sahabe'nin huzurunda fatiha okurken, Anadolu'nun İslam'la ilk tanıştığı o kutlu günlerin heyecanını hissetmek; akşamüstü ise **On Gözlü Köprü**'den Dicle'ye ve Hevsel'in yeşiline bakarak zamanın akışını dinlemek... Diyarbakır, hem keskin bir şiir hem derin bir dua gibi yüreğime işleyecek."
    },
    "07_GuneydoguAnadolu/Gaziantep": {
      "plate": 27,
      "name": "Gaziantep",
      "region": "Güneydoğu Anadolu",
      "region_code": "07_GuneydoguAnadolu",
      "lat": 37.0662,
      "lng": 37.3833,
      "landmarks": [
        "Zeugma Mozaik Müzesi (Çingene Kızı)",
        "Gaziantep Kalesi",
        "Bakırcılar Çarşısı",
        "Tahmis Kahvesi",
        "Rumkale"
      ],
      "specialties": [
        "Gaziantep Baklavası",
        "Ali Nazik",
        "Beyran Çorbası",
        "Katmer",
        "Küşleme",
        "Menengiç Kahvesi"
      ],
      "quote": "UNESCO Gastronomi Şehri; Zeugma'nın Çingene Kızı mozaiğinin derin bakışları ve asırlık hanların kahve kokusu.",
      "library": "Gaziantep İl Halk Kütüphanesi / Hasan Celal Güzel Kütüphanesi - Modern donanımlı ve dinamik çalışma atmosferi.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "07_GuneydoguAnadolu/Gaziantep/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "07_GuneydoguAnadolu/Gaziantep/gallery.jpg",
      "images": [
        "07_GuneydoguAnadolu/Gaziantep/banner.jpg",
        "07_GuneydoguAnadolu/Gaziantep/gallery.jpg"
      ],
      "readme_rel": "07_GuneydoguAnadolu/Gaziantep/README.md",
      "slug": "Gaziantep",
      "content_size": 6068,
      "literary_quotes": [
        "\"Ben Gazianteplilerin gözlerinden nasıl öpmem ki? Onlar yalnız Gaziantep'i değil, Türkiye'yi de kurtardılar.\" — *Gazi Mustafa Kemal Atatürk*",
        "\"Ayıntab şehri, bağları, bahçeleri, su kanalları (livasları), hanları ve hünerli sanatkârlarıyla âdeta bir dünya cennetidir.\" — *Evliya Çelebi, Seyahatnâme*",
        "\"Gaziantep mutfağı bir yemek listesi değil, yüzyılların sabrıyla işlenmiş bir medeniyet felsefesidir.\" — *Anadolu Gastronomi Güncesi*"
      ],
      "reflection": "Gaziantep, Mezopotamya seferinin en enerjik ve duyulara en çok hitap eden kapısı olacak. Sabahın ilk ışıklarıyla dumanı tüten bir beyranın ardından **Zeugma Mozaik Müzesi**'nde Çingene Kızı'nın gözlerinin içine bakmak, sonra **Bakırcılar Çarşısı**'nın ritmik çekiç sesleri arasında kaybolup **Tahmis Kahvesi**'nde menengiç yudumlamak... Tarihin, emeğin ve direnişin bu kadar canlı bir şehir hayatıyla iç içe geçtiği nadir yerlerden biri olarak Gaziantep'i her köşesiyle sindirerek yaşamak istiyorum."
    },
    "07_GuneydoguAnadolu/Kilis": {
      "plate": 79,
      "name": "Kilis",
      "region": "Güneydoğu Anadolu",
      "region_code": "07_GuneydoguAnadolu",
      "lat": 36.7184,
      "lng": 37.1212,
      "landmarks": [
        "Ravanda Kalesi",
        "Oylum Höyük",
        "Kilis Tarihi Taş Evleri ve Kabaltıları",
        "Ulu Cami"
      ],
      "specialties": [
        "Kilis Tavası",
        "Cennet Çamuru Tatlısı",
        "Kilis Katmeri",
        "Zeytinyağı"
      ],
      "quote": "Zeytin ağaçlarının gölgesinde kadim kabaltılı sokaklar, lezzetli Kilis Tavası ve sınır boyunun sıcak insanları.",
      "library": "Kilis İl Halk Kütüphanesi - Samimi ve sessiz çalışma ortamı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "07_GuneydoguAnadolu/Kilis/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "07_GuneydoguAnadolu/Kilis/gallery.jpg",
      "images": [
        "07_GuneydoguAnadolu/Kilis/banner.jpg",
        "07_GuneydoguAnadolu/Kilis/gallery.jpg"
      ],
      "readme_rel": "07_GuneydoguAnadolu/Kilis/README.md",
      "slug": "Kilis",
      "content_size": 6142,
      "literary_quotes": [
        "\"Kilis, bağları, zeytinlikleri, leziz üzümleri, camileri ve âlimleriyle Halep kapısının bereketli bir beldesidir.\" — *Evliya Çelebi, Seyahatnâme*",
        "\"Kabaltılı sokakların serinliğinde yürürken zaman yavaşlar; taş avludan yükselen yasemin ve zeytinyağlı sabun kokusu insana evinde olduğunu hissettirir.\" — *Kilis Kültür Defteri*",
        "\"Küçük görünen şehirler vardır ki toprağını kazdığınızda koca imparatorlukların nefesi çıkar.\" — *Anadolu Arkeoloji Notları*"
      ],
      "reflection": "Kilis, büyük metropollerin kalabalığından sıyrılıp nefes alacağım, taşın ve zeytin ağacının sessizliğini dinleyeceğim bir durak olacak. **Oylum Höyük**'ün tepesinden verimli Kilis ovasına bakarken binlerce yıl önceki kervan yollarını hayal etmek, ardından kabaltıların serin gölgesinde yürüyüp **Şurahbil bin Hasene** makamında dua etmek istiyorum. Sınır boyu şehirlerinin o kendine has hüzünlü ama sımsıcak insan ilişkilerini, bir fincan mırra veya zahter çayı eşliğinde dinlemek bu seferin en samimi hatıralarından biri olacak."
    },
    "07_GuneydoguAnadolu/Mardin": {
      "plate": 47,
      "name": "Mardin",
      "region": "Güneydoğu Anadolu",
      "region_code": "07_GuneydoguAnadolu",
      "lat": 37.3212,
      "lng": 40.7245,
      "landmarks": [
        "Mardin Taş Evleri",
        "Deyrulzafaran Manastırı",
        "Kasımiye Medresesi",
        "Mardin Ulu Cami",
        "Dara Antik Kenti",
        "Midyat Konukevi"
      ],
      "specialties": [
        "Mardin Kebabı",
        "Sembusek",
        "İrok (Mardin İçli Köftesi)",
        "Süryani Şarabı/Çöreği",
        "Mavi Badem Şekeri"
      ],
      "quote": "Gündüzü seyran, gecesi gerdanlık; Mezopotamya ovasına tepeden bakan sarı kalker taşlı masal diyarı.",
      "library": "Mardin İl Halk Kütüphanesi - Taş mimarisi ve Mezopotamya ovasına bakan avlusuyla seyyah yazılımcıya ilham kaynağı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "07_GuneydoguAnadolu/Mardin/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "07_GuneydoguAnadolu/Mardin/gallery.jpg",
      "images": [
        "07_GuneydoguAnadolu/Mardin/banner.jpg",
        "07_GuneydoguAnadolu/Mardin/gallery.jpg"
      ],
      "readme_rel": "07_GuneydoguAnadolu/Mardin/README.md",
      "slug": "Mardin",
      "content_size": 6385,
      "literary_quotes": [
        "\"Mardin, dağın eteğine kurulmuş İslam beldelerinin en güzel, en mükemmel, en sağlam ve çarşıları en süslü olanıdır.\" — *İbn Battûta, Seyahatnâme (14. yy)*",
        "\"Mardin gündüzü seyranlık, gecesi gerdanlıktır; Mezopotamya ovası bir deniz gibi ayaklarının altına serilir.\" — *Kadim Mardin Sözü*",
        "\"Taşın dile geldiği, zamanın bir eyvan gölgesinde durup dinlendiği şehirdir Mardin.\" — *Murathan Mungan (Mardin Hatıralarından)*"
      ],
      "reflection": "Mardin'i yıllardır fotoğraflardan ve kitaplardan izlerken hep şu anı hayal ettim: **Kasımiye Medresesi**'nin avlusunda ikindi güneşi Mezopotamya ovasına devrilirken o küçük su kanalının kenarına oturup hayatın hızla akışını seyretmek... Abbaraların serin gölgesinde yürürken taş ustalarının sabrına hayran kalmak, **Deyrulzafaran**'da binlerce yıllık dua seslerinin yankısını duymak ve akşam karanlığı çöktüğünde ovanın ışıklarını bir gerdanlık gibi izlemek. Mardin, Mezopotamya seferinin en şiirsel durağı olacak."
    },
    "07_GuneydoguAnadolu/Siirt": {
      "plate": 56,
      "name": "Siirt",
      "region": "Güneydoğu Anadolu",
      "region_code": "07_GuneydoguAnadolu",
      "lat": 37.9333,
      "lng": 41.95,
      "landmarks": [
        "İsmail Fakirullah & İbrahim Hakkı Türbesi (Işık Hadisesi - Tillo)",
        "Veysel Karani Türbesi",
        "Siirt Ulu Cami",
        "Rasıl Hacar (Delikli Taş)"
      ],
      "specialties": [
        "Büryan Kebabı",
        "Perde Pilavı",
        "Siirt Fıstığı",
        "Tayfi Üzümü"
      ],
      "quote": "İlim ve irfan beldesi Tillo'daki güneş hadisesi, Veysel Karani Hazretleri'nin aşkı ve sarp Botan Kanyonu.",
      "library": "Siirt İl Halk Kütüphanesi - Tillo'nun manevi atmosferinde sakin çalışma alanı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "07_GuneydoguAnadolu/Siirt/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "07_GuneydoguAnadolu/Siirt/gallery.jpg",
      "images": [
        "07_GuneydoguAnadolu/Siirt/banner.jpg",
        "07_GuneydoguAnadolu/Siirt/gallery.jpg"
      ],
      "readme_rel": "07_GuneydoguAnadolu/Siirt/README.md",
      "slug": "Siirt",
      "content_size": 6696,
      "literary_quotes": [
        "\"Hak şerleri hayreyler, zannetme ki gayreyler; ârif ânı seyreyler, Mevlâ görelim neyler, neylerse güzel eyler.\" — *Erzurumlu İbrahim Hakkı Hazretleri (Tefviznâme, Tillo)*",
        "\"Hocamın başucuna doğmayan güneşi neyleyeyim!\" — *İbrahim Hakkı Hazretleri (Işık Hadisesi'nin hikâyesi)*",
        "\"Veysel Karani'nin aşkı, görmeden sevmenin ve sadakatin en yüksek makamıdır.\" — *Anadolu Tasavvuf Geleneği*"
      ],
      "reflection": "Siirt durağı, bu uzun Mezopotamya yolculuğunda hem bir bilim tarihçisi hem de bir gönül yolcusu gibi kalbimin en çok titrediği menzillerden biri olacak. Tillo'da **İbrahim Hakkı Hazretleri**'nin kurduğu **Işık Hadisesi** duvarına çıkıp bir öğrencinin hocasına duyduğu o derin vefayı astronomi ve geometriyle nasıl ölümsüzleştirdiğini yerinde görmek istiyorum. Ardından **Veysel Karani** huzurunda bir fatiha okuyup, **Rasıl Hacar**'dan Botan Kanyonu'nun derinliğine bakarken *\"Mevlâ görelim neyler, neylerse güzel eyler\"* dizelerini sessizce tekrarlamak... Bu şehir zihnimi de ruhumu da tazeleyecek."
    },
    "07_GuneydoguAnadolu/Sanliurfa": {
      "plate": 63,
      "name": "Şanlıurfa",
      "region": "Güneydoğu Anadolu",
      "region_code": "07_GuneydoguAnadolu",
      "lat": 37.1674,
      "lng": 38.7938,
      "landmarks": [
        "Göbeklitepe (Tarihin Sıfır Noktası)",
        "Balıklıgöl (Halil-ür Rahman)",
        "Şanlıurfa Kalesi",
        "Harran Kümbet Evleri",
        "Karahantepe",
        "Gümrük Hanı"
      ],
      "specialties": [
        "Urfa Kebabı",
        "Çiğ Köfte",
        "Lahmacun",
        "Şıllık Tatlısı",
        "Mırra",
        "Borani"
      ],
      "quote": "Peygamberler şehri; Hz. İbrahim'in ateşinin gül bahçesine dönüştüğü Balıklıgöl ve insanlık tarihinin sıfır noktası Göbeklitepe.",
      "library": "Şanlıurfa İl Halk Kütüphanesi - Peygamberler şehrinde zengin araştırma kaynakları.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "07_GuneydoguAnadolu/Sanliurfa/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "07_GuneydoguAnadolu/Sanliurfa/gallery.jpg",
      "images": [
        "07_GuneydoguAnadolu/Sanliurfa/banner.jpg",
        "07_GuneydoguAnadolu/Sanliurfa/gallery.jpg"
      ],
      "readme_rel": "07_GuneydoguAnadolu/Sanliurfa/README.md",
      "slug": "Sanliurfa",
      "content_size": 6389,
      "literary_quotes": [
        "\"Sakın terk-i edebden kûy-i mahbûb-i Hudâ'dır bu, Nazargâh-ı İlâhî'dir, Makâm-ı Mustafâ'dır bu.\" — *Urfalı Şair Nâbî (17. yy)*",
        "\"Göbeklitepe, insanlığın önce tapınağı inşa edip sonra şehri kurduğunu kanıtlayarak tarihin bütün kitaplarını yeniden yazdırdı.\" — *Prof. Dr. Klaus Schmidt (Göbeklitepe Kazı Başkanı)*",
        "\"Urfa, peygamberlerin nefesiyle yoğrulmuş, taşı sıcağıyla, gönlü ise musikisiyle yanan bir bereket diyarıdır.\" — *Evliya Çelebi İzinden Mezopotamya Notları*"
      ],
      "reflection": "Şanlıurfa, 81 illik Anadolu Seyahatnamesi'nin en derin manevi ve tarihsel kırılma noktası olacak. Sabahın serinliğinde **Göbeklitepe**'nin 12.000 yıllık T sütunları arasında insanlığın ilk arayışına tanıklık etmek, öğlen **Gümrük Hanı**'nın asırlık taş avlusunda mırra yudumlamak, akşam ezanıyla birlikte ise **Balıklıgöl**'ün suyuna vuran kandil ışıkları altında Hz. İbrahim'in teslimiyetini ve Hz. Eyyüb'ün sabrını tefekkür etmek... Urfa, hem insanlığın başlangıcını hem de kalbin sükûnetini aynı günde yaşatacak."
    },
    "07_GuneydoguAnadolu/Sirnak": {
      "plate": 73,
      "name": "Şırnak",
      "region": "Güneydoğu Anadolu",
      "region_code": "07_GuneydoguAnadolu",
      "lat": 37.5164,
      "lng": 42.4594,
      "landmarks": [
        "Cudi Dağı (Hz. Nuh'un Gemisi)",
        "Kırmızı Medrese (Cizre)",
        "Mem û Zîn Türbesi",
        "İsmail Ebul-İz El-Cezeri Türbesi",
        "Kasrik Boğazı"
      ],
      "specialties": [
        "Kutlık",
        "Serbıdev",
        "Hekeheşandi",
        "Suryaz"
      ],
      "quote": "Hz. Nuh'un gemisinin oturduğu Cudi Dağı, sibernetiğin kurucusu El-Cezeri'nin memleketi ve Mem û Zîn destanı.",
      "library": "Şırnak İl Halk Kütüphanesi - Cudi eteklerinde sessiz ve düzenli çalışma alanı.",
      "visited": false,
      "has_banner": true,
      "banner_rel": "07_GuneydoguAnadolu/Sirnak/banner.jpg",
      "has_gallery": true,
      "gallery_rel": "07_GuneydoguAnadolu/Sirnak/gallery.jpg",
      "images": [
        "07_GuneydoguAnadolu/Sirnak/banner.jpg",
        "07_GuneydoguAnadolu/Sirnak/gallery.jpg"
      ],
      "readme_rel": "07_GuneydoguAnadolu/Sirnak/README.md",
      "slug": "Sirnak",
      "content_size": 6385,
      "literary_quotes": [
        "\"Ey yer suyunu yut ve ey gök suyunu tut! denildi. Su çekildi, iş bitirildi ve gemi Cûdî üzerine oturdu.\" — *Kur'an-ı Kerim (Hûd Suresi, 44)*",
        "\"Uygulamaya geçirilmeyen her teknik ilim, doğru ile yanlış arasında asılı kalır.\" — *İsmail Ebul-İz El-Cezeri (Kitâb-ül Hiyel, Cizre, 1206)*",
        "\"Aşk bir ateştir ki düşen yanar, fakat o ateşle pişen ruh ebediyete erer.\" — *Melayê Cizîrî (Kırmızı Medrese, Cizre)*"
      ],
      "reflection": "Bir yazılımcı ve mühendislik tutkunu olarak Şırnak/Cizre durağının kalbimdeki yeri bambaşka: Bundan tam 820 yıl önce ilk programlanabilir otomasyon sistemlerini ve robotik mekanizmaları tasarlayan **El-Cezeri**'nin kabri başında durup ona bir meslektaş ve talebe hürmetiyle selam vermek, bu 81 illik yolculuğun en özel anlarından biri olacak. Ardından **Cudi Dağı**'nın vakur siluetine bakarak Hz. Nuh'un tufandan sonraki ilk şükür duasını düşünmek, **Kırmızı Medrese**'nin kızıl tuğlaları arasında **Mem û Zîn**'in hüzünlü hikâyesini dinlemek... Şırnak, hem bilimin hem de maneviyatın zirve yaptığı bir son durak olacak."
    }
  }
};
