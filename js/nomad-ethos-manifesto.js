/**
 * Anadolu Seyahatnamesi — Modern Derviş & Dijital Seyyah Ahlâkı
 * Felsefe Külliyatı (7 Ahlâk İlkesi) & İnteraktif İrfan Lügatı (24 Kavram)
 * Registers on: window.SEYYAH_MODULES.ethos = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-ethos-manifesto-styles';
  const PLEDGE_STORAGE_KEY = 'dijital_seyyah_ethos_pledge_v1';
  const FAVORITES_STORAGE_KEY = 'dijital_seyyah_ethos_favs_v1';

  // =========================================================================
  // Section 1 Data: Dijital Seyyahın 7 Ahlâk İlkesi (Fütüvvet & Kervansaray)
  // =========================================================================
  const ETHOS_PRINCIPLES = [
    {
      id: 'ibret-nazari',
      num: '01',
      icon: '👁️',
      arabicTag: 'عِبْرَتْ نَظَرِي · İbret Nazarı',
      accent: 'cyan',
      title: '1. Tüketmek İçin Değil, Şahitlik Etmek İçin Gezmek (İbret Nazarı)',
      quote: '“Gez ki âlemde ibret alasın; her taş bir kelâm, her şehir bir ayna ola.”',
      quoteSource: 'Anadolu İrfan Geleneği',
      summary:
        'Seyahat, mekânları ve fotoğrafları biriktirilen bir tüketim nesnesine indirgemek değil; zamanın, tarihin ve tabiatın şehadetine kalben ortak olmaktır. Göz değil, gönül görür.',
      practices: [
        'Bir şehre vardığında ilk 30 dakika telefon kamerasını çantada tut; sokağın kokusunu, sesini ve ışığını çıplak gözle kaydet.',
        'Sadece popüler seyir teraslarını değil; eski bir çeşme kitabesini, bir mahalle esnafının tebessümünü de seyahatin ana durağı say.',
        'Gittiğin yeri “bitirilecekler listesi”nden düşmek yerine, o şehrin sana ne öğrettiğini tek cümleyle not al.'
      ],
      relatedConcepts: ['ibret', 'hayret-makami', 'tefekkur']
    },
    {
      id: 'mekanin-ruhu-edep',
      num: '02',
      icon: '🕌',
      arabicTag: 'أَدَبِ مَكَانْ · Edeb-i Mekân',
      accent: 'gold',
      title: '2. Mekânın Ruhu ve Edep (Taşa, Mabede ve İnsana Hürmet)',
      quote: '“Edep bir tâç imiş nûr-ı Hüdâ’dan; giy ol tâcı emîn ol her belâdan.”',
      quoteSource: 'Kadim Tasavvuf Beyti',
      summary:
        'Her şehrin, caminin, medresenin, antik tiyatronun ve sokağın bir manevî ağırlığı ve mahremiyeti vardır. Seyyah misafirdir; ev sahibinin sükûnetini bozmadan yürür.',
      practices: [
        'Ulu camilere, türbelere ve tarihi medreselere girerken ses tonunu düşür; ibadet edenlerin mahremiyetine kadraj sokma.',
        'Taş yapılara, kitabelere ve doğal dokulara dokunurken asırların emanetini taşıdığını hatırla; iz bırakma, izleri koru.',
        'Yerel halkla kurduğun ilk temasta aceleci turist dili yerine hal hatır soran misafir nezaketiyle konuş.'
      ],
      relatedConcepts: ['nazar-ber-kadem', 'sohbet', 'futuvvet']
    },
    {
      id: 'yolda-ilim-disiplini',
      num: '03',
      icon: '📚',
      arabicTag: 'طَلَبُ الْعِلْمِ · Yolda İlim',
      accent: 'purple',
      title: '3. Yolda İlim Disiplini (Her Şehirde Bir Kütüphane Köşesi)',
      quote: '“İlim rihle ile, yani yola düşüp ehlinin ve kitabın kapısını çalmakla kemâle erer.”',
      quoteSource: 'Rihle Geleneği',
      summary:
        'Klasik âlimler ve dervişler nasıl menzilden menzile medreseleri ziyaret ettiyse, modern dijital seyyah da her ilde İl Halk Kütüphanesi’nde bir masa açıp üretim ve okuma disiplinini korur.',
      practices: [
        'Girdiğin her ilde İl Halk Kütüphanesi’ni veya tarihi yazma eser kütüphanesini ziyaret edip en az 1 saat derin okuma/kodlama yap.',
        'O şehrin yerel tarihini, şairlerini ve âlimlerini yerinde — mümkünse o şehre ait bir kitaptan — okuyarak mekânla metni birleştir.',
        'Seyahati “çalışmaya ara” olarak değil, üretimin ve öğrenmenin yeni coğrafyalarda derinleşmesi olarak kurgula.'
      ],
      relatedConcepts: ['rihle', 'marifet', 'hikmet']
    },
    {
      id: 'az-esya-cok-hikmet',
      num: '04',
      icon: '🎒',
      arabicTag: 'تَجَرُّدْ · Tecerrüd',
      accent: 'emerald',
      title: '4. Az Eşya, Çok Hikmet (Tecerrüd ve Sırt Çantası Felsefesi)',
      quote: '“Yükü ağır olanın ufku daralır; sırtın hafifledikçe gönlün kanatlanır.”',
      quoteSource: 'Derviş Seyahat Kaidesi',
      summary:
        'Tecerrüd, lüzumsuz ağırlıklardan sıyrılıp öze dönmektir. Tek bir sırt çantasıyla yola çıkabilmek; hem fiziksel özgürlük hem de eşyaya bağımlılıktan azade olma talimidir.',
      practices: [
        'Çantana koyduğun her eşyaya “Bunun yokluğunda yolculuğum aksar mı?” diye sor; şüpheli olanı evde bırak.',
        'Kıyafet ve ekipmanda sadeleş; dikkatinin eşya korumaya değil, etrafı temaşaya yönelmesini sağla.',
        'Dijital çantanı da hafiflet: gereksiz bildirimleri kapat, çevrimdışı harita ve temel not araçlarıyla yetin.'
      ],
      relatedConcepts: ['tecerrud', 'istigna', 'menzil']
    },
    {
      id: 'modern-kervansaray-hukuku',
      num: '05',
      icon: '🏕️',
      arabicTag: 'حُقُوقُ الرِّبَاطْ · Kervansaray Hukuku',
      accent: 'gold',
      title: '5. Modern Kervansaray Hukuku (GSB Yurtlarında Paylaşım ve Şükür)',
      quote: '“Han bizim değil, yol bizim değil; bir gecelik gölgelikte kardeşlik bâkîdir.”',
      quoteSource: 'Ahîlik & Kervansaray Âdâbı',
      summary:
        'Selçuklu kervansaraylarında yolcuya üç gün ücretsiz aş ve barınak sunan vakıf medeniyetinin bugünkü izdüşümü gençlik yurtları ve misafirhanelerdir. Ortak alanı kendinden sonraki yolcuya tertemiz bırakmak hukuktur.',
      practices: [
        'GSB yurtları, misafirhaneler ve ortak odalarda temizlik, sessizlik ve sıra hukukuna en üst düzeyde riayet et.',
        'Yol arkadaşlarınla çayını, şarj prizini, şehir bilgisini ve güler yüzünü cömertçe paylaş; şikâyet yerine şükür dilini kuşan.',
        'Konakladığın mekânın çalışanlarına ve gönüllülerine teşekkürü ihmal etme; emaneti aldığından daha düzenli teslim et.'
      ],
      relatedConcepts: ['kervansaray', 'sukur', 'tevekkul']
    },
    {
      id: 'kesrette-vahdet',
      num: '06',
      icon: '🕊️',
      arabicTag: 'وَحْدَتْ دَرْ كَثْرَتْ · Kesrette Vahdet',
      accent: 'cyan',
      title: '6. Kesrette Vahdet (Kalabalık Şehirde İçsel Sükûneti Korumak)',
      quote: '“Halk içinde Hak ile olmak; kalabalığın ortasında kalbi dingin tutabilmektir.”',
      quoteSource: 'Nakşibendî Sülûk Esası',
      summary:
        'Büyük şehirlerin gürültüsü, otogar karmaşası ve bitmeyen uyaranlar arasında bile zihni dağıtmamak; çokluğun (kesret) içinde birliği (vahdet) ve içsel merkezini muhafaza etmektir.',
      practices: [
        'Kalabalık çarşılarda, trenlerde ve vapurlarda nefesini yavaşlat; aceleci ritme kapılmadan kendi iç temponda yürü.',
        'Her akşam gün batımında 10 dakikalık sessiz tefekkür (uzlet/halvet) molası verip zihnini günün gürültüsünden arındır.',
        'Farklı lehçeleri, kültürleri ve insan hikâyelerini “yabancı” olarak değil, aynı büyük Anadolu mozaiğinin parçası olarak gör.'
      ],
      relatedConcepts: ['halvet-der-encumen', 'vahdet', 'uzlet']
    },
    {
      id: 'evliya-celebi-sorumlulugu',
      num: '07',
      icon: '✍️',
      arabicTag: 'ضَبْطِ وَقَايِعْ · Evliya Çelebi Sorumluluğu',
      accent: 'purple',
      title: '7. Gördüğünü Kayıt Altına Almak (Evliya Çelebi Sorumluluğu)',
      quote: '“Söz uçar, hatıra silinir; yazılan ise gelecek seyyahlara ışık ve vefa olur.”',
      quoteSource: 'Seyahatnâme Geleneği',
      summary:
        'Evliya Çelebi gibi her menzilin suyunu, taşını, lehçesini, kitabesini ve ruhunu hakkaniyetle kayda geçirmek; hem kendi hafızana vefa hem de senden sonra yola çıkacaklara sadaka-i câriyedir.',
      practices: [
        'Her şehir dönüşü veya akşamı Seyir Defterine tarih, konum, kütüphane notu ve kalbe düşen bir cümle kaydet.',
        'Abartıdan ve klişe övgülerden kaçın; mekânın gerçek atmosferini, zorluklarını ve güzelliklerini dürüstçe aktar.',
        'Fotoğraflarını sadece ekranlarda hapsetme; hikâyesini ve kültürel bağlamını yanına yazarak yaşayan bir arşive dönüştür.'
      ],
      relatedConcepts: ['hafiz-i-anadolu', 'ibnul-vakt', 'salik']
    }
  ];

  // =========================================================================
  // Section 2 Data: 24 Kavramlık İrfan & Seyahat Lügatı
  // =========================================================================
  const CONCEPT_CATEGORIES = [
    { id: 'all', label: 'Tümü', icon: '✦' },
    { id: 'sefer', label: 'Sefer & Mekân', icon: '🧭' },
    { id: 'hal', label: 'İçsel Sükûnet & Hal', icon: '🕊️' },
    { id: 'ahlak', label: 'Ahlâk & Fütüvvet', icon: '⚖️' },
    { id: 'ilim', label: 'İlim & Basîret', icon: '📜' }
  ];

  const IRFAN_CONCEPTS = [
    {
      id: 'sefer-der-vatan',
      num: '01',
      name: 'Sefer der Vatan',
      category: 'sefer',
      categoryLabel: 'Sefer & Mekân',
      root: 'سفر در وطن · Arapça "sefer" (yolculuk) + Farsça "der" (içinde) + Arapça "vatan" (yurt)',
      classical:
        'Nakşibendî geleneğinin temel esaslarından biridir. Dış âlemde şehirleri gezerken aynı anda insanın kendi iç vatanına — yani beşerî zaaflardan kalbî olgunluğa — doğru yaptığı manevî yolculuğu ifade eder.',
      modern:
        'Anadolu’nun 81 ilini gezerken her kilometreyi bir iç muhasebeye dönüştürmektir. Tren penceresinden bozkıra bakarken “Dışarıda kaç il gezdim?” kadar “İçimde hangi önyargıyı aştım?” sorusunu sormaktır.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Sefer der Vatan** (*سفر در وطن*), Hâcegân ve Nakşibendî büyüklerinin “Kelimât-ı Kudsiyye” olarak sistematize ettiği sekiz temel prensibin ilkidir. Lafzen *“vatanda yolculuk”* anlamına gelir.\n\n### 2. İrfan Külliyatındaki Derinliği\nKlasik tasavvufta iki tür sefer vardır: **sefer-i âfâkî** (dış dünyada şehirler ve ülkeler aşmak) ve **sefer-i enfüsî** (insanın kendi nefsinden hakikate yürümesi). Sadece bedenen yer değiştirmek, kalp yerinde sayıyorsa hakiki sefer sayılmaz. Hakiki sâlik, kendi yurdunda otururken bile gönlünde menziller aşan; gurbete çıktığında ise gittiği her toprağı kendi öz vatanı bilen kimsedir.\n\n### 3. Anadolu Menzilinden Bir Misal\nKonya’dan Erzurum’a uzanan bir gece treninde kompartıman ışıkları söndüğünde dışarıdaki karlı bozkır ile içindeki sessizlik aynı anda akar. Şehir tabelaları değiştikçe kalbindeki acelecilik yerini vakarlı bir sükûnete bırakıyorsa, işte *sefer der vatan* gerçekleşmiştir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Giriş Niyeti:** Yeni bir ile adım attığında haritayı açmadan önce 30 saniye dur ve “Bu şehirde kendimden neyi bırakıp neyi öğreneceğim?” niyetini tazele.\n- **Çifte Harita:** Bir şehirde gezdiğin koordinatları kaydettiğin gibi, akşam defterine o gün kalbinde değişen bir düşünceyi de not düş.\n\n> **Tefekkür Sorusu:** *Şehir değiştirmek seni gerçekten dönüştürüyor mu, yoksa aynı telaşları yeni bir plaka koduna mı taşıyorsun?*'
    },
    {
      id: 'halvet-der-encumen',
      num: '02',
      name: 'Halvet der Encümen',
      category: 'hal',
      categoryLabel: 'İçsel Sükûnet & Hal',
      root: 'خلوت در انجمن · Arapça "halvet" (tenhada kalış) + Farsça "der" (içinde) + "encümen" (topluluk/meclis)',
      classical:
        'Halkın, çarşının ve kalabalığın tam ortasında bulunurken bile kalbin dağılmaması ve içsel huzurun/zikrin muhafaza edilmesi makamıdır. “El kârda, gönül yârda” düsturuyla özetlenir.',
      modern:
        'Eminönü’nün, Kızılay’ın veya kalabalık bir yurt odasının gürültüsü içinde kulaklık ya da kaçış aramadan zihinsel berraklığı koruyabilmektir. Odaklanma kasını kalabalık içinde eğitmektir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Halvet der Encümen** (*خلوت در انجمن*), Abdülhâlik Gücdüvânî Hazretleri’ne dayanan irfan prensiplerindendir. *Halvet* yalnız kalmayı, *encümen* ise kalabalık topluluğu ve hayatın akışını ifade eder.\n\n### 2. İrfan Külliyatındaki Derinliği\nMağaraya çekilip sükûneti korumak kolaydır; asıl hüner, çarşı-pazar gürültüsünün ortasında kalbin berraklığını kaybetmemektir. Tasavvuf büyükleri toplumu terk etmeyi değil, toplumun içinde hikmetli bir mesafe ve iç dinginlik kurmayı öğütlemiştir. Dışarıdan bakıldığında herkes gibi yürüyen, alışveriş yapan, sohbet eden dervişin iç âleminde sarsılmaz bir sükûnet kalesi vardır.\n\n### 3. Anadolu Menzilinden Bir Misal\nGaziantep Bakırcılar Çarşısı’nda çekiç sesleri yankılanırken veya İstanbul’da bir vapur güvertesinde martılar bağrışırken, ne acele ne de öfke duymadan tüm o canlılığı bir senfoni gibi izleyebilmek *halvet der encümen* halidir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Gürültüde Nefes:** Otogar veya kalabalık bir kütüphane koridorunda gerildiğini hissettiğinde omuzlarını gevşet ve dikkati telefon ekranından çekip nefes ritmine sabitle.\n- **Odak Kalesi:** Kalabalık bir kafede bile 25 dakikalık bir okuma/yazma bloğunu bölünmeden tamamlayarak içsel odağını test et.\n\n> **Tefekkür Sorusu:** *Huzurun dış şartların sessizliğine mi bağlı, yoksa kalabalığın içinde de kendi dingin merkezine dönebiliyor musun?*'
    },
    {
      id: 'nazar-ber-kadem',
      num: '03',
      name: 'Nazar ber Kadem',
      category: 'hal',
      categoryLabel: 'İçsel Sükûnet & Hal',
      root: 'نظر بر قدم · Arapça "nazar" (bakış) + Farsça "ber" (üzerine) + Arapça "kadem" (adım/ayak)',
      classical:
        'Yürürken bakışı lüzumsuz ve dikkat dağıtıcı şeylerden sakınıp önüne, bastığı yere ve o anki adımına vermektir. Hem mahremiyet edebi hem de zihinsel dağınıklığı önleyen bir dikkat disiplinidir.',
      modern:
        'Yolda yürürken ekrana gömülüp anı kaçırmamak, hem de etrafı meraklı ve rahatsız edici bir bakışla süzmeden her adımın hakkını vererek bilinçli (mindful) yürümektir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Nazar ber Kadem** (*نظر بر قدم*), kelime anlamıyla *“bakışın adım üzerinde olması”* demektir. Yürüyüşü hem fiziksel hem ruhsal bir disipline dönüştüren kadim bir edep ilkesidir.\n\n### 2. İrfan Külliyatındaki Derinliği\nİnsan nereye bakarsa kalbi de oraya meyleder. Bakışın sağa sola savrulması, zihni binbir hayale ve lüzumsuz kıyaslamaya sürükler. *Nazar ber kadem*, sadece yere bakmak demek değildir; kişinin kendi sınırını bilmesi, başkasının mahrem alanına göz dikmemesi ve şu an bastığı zemine — yani hakikate ve sorumluluğuna — tam dikkat kesilmesidir.\n\n### 3. Anadolu Menzilinden Bir Misal\nSafranbolu’nun veya Mardin’in dar taş sokaklarından yürürken insanların evlerinin pencerelerine değil, asırlık Arnavut kaldırımlarının işçiliğine ve kendi adımlarının ritmine odaklanmak mekâna duyulan en zarif saygıdır.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Ekran Detoksu Yürüyüşü:** Her şehirde günde en az 1 km telefonuna hiç bakmadan, sadece adımını ve çevrenin dokusunu hissederek yürü.\n- **Kadraj Edebi:** Fotoğraf çekerken insanların yüzünü ve ev içi mahremiyetini izinsiz kadraja almamaya özen göster.\n\n> **Tefekkür Sorusu:** *Adımların seni bir yerlere taşırken bakışların hangi lüzumsuz hedeflerde dağılıp yoruluyor?*'
    },
    {
      id: 'ibnul-vakt',
      num: '04',
      name: "İbnü'l-Vakt",
      category: 'hal',
      categoryLabel: 'İçsel Sükûnet & Hal',
      root: "ابن الوقت · Arapça \"ibn\" (oğlu/evladı) + \"el-vakt\" (şimdiki an/vakit)",
      classical:
        '“Vaktin oğlu” demektir. Geçmişin pişmanlığına veya geleceğin kaygısına saplanmadan, içinde bulunduğu anın (hâlin) gereğini tam bir teslimiyet ve farkındalıkla yerine getiren arif kişiyi tanımlar.',
      modern:
        'Otobüs rötar yaptığında, plan bozulduğunda veya yağmur bastırdığında “Keşke dün şurada kalsaydım” demek yerine, o bekleyiş anını bir kitap sayfasına veya sıcak bir sohbete dönüştürmektir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**İbnü’l-Vakt** (*ابن الوقت*), Arapça *“vaktin çocuğu”* anlamına gelir. Tasavvuf ıstılahında zamanın ruhunu ve o anın ilahi davetini okuyabilen kimse için kullanılır.\n\n### 2. İrfan Külliyatındaki Derinliği\nSûfîler der ki: *“Sûfî, vaktin oğludur.”* Geçmiş elden çıkmış bir gölge, gelecek ise henüz doğmamış bir ihtimaldir; hakikatle buluşabildiğimiz tek kapı **şimdi**dir. Ancak *ibnü’l-vakt* olmak, başıboş bir “anı yaşa” hedonizmi değil; içinde bulunulan vaktin bizden hangi ahlâkî görevi, şükrü veya sabrı istediğini bilmektir.\n\n### 3. Anadolu Menzilinden Bir Misal\nKars’tan dönerken kar nedeniyle yol kapandığında homurdanmak yerine, terminaldeki çay ocağında yanındaki yolcunun hikâyesini dinlemek ya da defterini açıp o kar fırtınasını satırlara dökmek vaktin hakkını vermektir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Plan Esnekliği:** Seyahat programında her gün mutlaka 2 saatlik “plansız vakit” bırak; anın getirdiği sürprizlere yer aç.\n- **Şimdi Çapası:** Zihnin bir sonraki şehrin biletine veya dünkü yorgunluğa kaydığında etrafındaki 3 sesi ve 3 rengi fark ederek bugüne dön.\n\n> **Tefekkür Sorusu:** *Şu an bulunduğun şehir ve elindeki imkân senden tam olarak ne yapmanı istiyor?*'
    },
    {
      id: 'rihle',
      num: '05',
      name: 'Rihle',
      category: 'sefer',
      categoryLabel: 'Sefer & Mekân',
      root: 'رحلة · Arapça r-h-l (ر ح ل) kökünden; deve semeri vurmak, ilim ve keşif amacıyla yola koyulmak',
      classical:
        'İslam medeniyetinde özellikle hadis, tarih, coğrafya ve hikmet tahsili için bilginlerin şehir şehir dolaşması geleneğidir. İbn Battûta’nın *Rihle*’si ve âlimlerin ilim yolculukları bu geleneğin zirvesidir.',
      modern:
        'Sadece tatil veya fotoğraf için değil; bir şehrin kütüphanesinde araştırma yapmak, müzesini okumak, yerel hafızasını dinlemek ve entelektüel ufkunu genişletmek niyetiyle çıkılan ilim seferidir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Rihle** (*رحلة*), Arapça *r-h-l* kökünden türemiştir ve başlangıçta binek hazırlayıp göç etmeyi ifade ederken, İslam medeniyetinde kurumsallaşarak *“ilim uğruna yapılan yolculuk”* manasını kazanmıştır.\n\n### 2. İrfan Külliyatındaki Derinliği\n“İlim Çin’de de olsa arayınız” hikmetiyle beslenen medeniyetimizde âlimler bir tek sahih bilgi veya bir büyük âlimle sohbet edebilmek için Bağdat’tan Buhara’ya, Konya’dan Şam’a aylar süren *rihleler* yapmıştır. Rihlede yolculuğun kendisi bir mekteptir; yolcunun yolda çektiği meşakkat, öğrendiği bilginin kalbe yerleşmesini sağlar.\n\n### 3. Anadolu Menzilinden Bir Misal\nSivas’a yalnızca fotoğraf çekmek için değil, Buruciye ve Gök Medrese’nin taş işçiliğindeki astronomi mirasını anlamak ve İl Halk Kütüphanesi’nde Sivaslı Âşık Veysel’in izlerini okumak için gitmek modern bir *rihle*dir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Şehir Tezi:** Gittiğin her şehir için tek bir merak sorusu belirle (Örn: “Bu şehrin su mimarisi nasıl şekillenmiş?”) ve gününü o sorunun peşinde geçir.\n- **Kütüphane Durağı:** Rota planına mutlaka yerel bir kütüphane veya sahaflar çarşısı ekle.\n\n> **Tefekkür Sorusu:** *Son yaptığın yolculuktan aklında kaç fotoğraf, kalbinde kaç yeni bilgi ve soru kaldı?*'
    },
    {
      id: 'umran',
      num: '06',
      name: 'Umran',
      category: 'sefer',
      categoryLabel: 'Sefer & Mekân',
      root: 'عمران · Arapça a-m-r (ع م ر) kökünden; mamur etmek, şenlendirmek, medeniyet ve toplumsal hayat',
      classical:
        'İbn Haldûn’un *Mukaddime*’de kurduğu medeniyet biliminin (ilm-i umran) merkez kavramıdır. Bir coğrafyanın insan emeği, adalet, zanaat, ilim ve dayanışma (asabiyet) ile yaşanır, şen ve mamur kılınmasını anlatır.',
      modern:
        'Bir şehri sadece binalarından ibaret görmeyip; coğrafyası, esnaf kültürü, tarımı, kütüphanesi ve insan dokusuyla bir medeniyet ekosistemi olarak okumaktır. Şehirleri sosyolojik bir gözle anlamaktır.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Umran** (*عمران*), Arapça *a-m-r* kökünden gelir; *ömrü bereketlendirmek, bir yeri imar ve ihya etmek, yaşanır kılmak* demektir. Büyük tarih filozofu İbn Haldûn bu kavramı sosyolojinin kurucu terimi yapmıştır.\n\n### 2. İrfan Külliyatındaki Derinliği\nİbn Haldûn’a göre insan tek başına yaşayamaz; şehirler (*umran-ı hadarî*) ve kırsal yaşam (*umran-ı bedevî*) birbirini besleyen iki damardır. Bir beldede adalet, üretim ve ilim varsa orada *umran* yükselir; israf ve zulüm baş gösterirse *umran* çöker. Seyyah, baktığı her şehirde bu yükseliş ve izlerin hikâyesini okur.\n\n### 3. Anadolu Menzilinden Bir Misal\nKayseri’nin Selçuklu darüşşifasından modern sanayi çarşısına, ya da Beypazarı’nın ahşap konaklarından el sanatları tezgâhlarına bakarken “Bu şehir yüzlerce yıldır nasıl ayakta kalıp üretmiş?” sorusunu sormak *umran* bilincidir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Şehir Okuması:** Bir şehrin tarihî çarşısı ile yeni mahallelerini kıyasla; su kaynaklarının, yolların ve üretim alanlarının yerleşimi nasıl belirlediğini gözlemle.\n- **Yerel Emeğe Destek:** Zincir markalar yerine o şehrin umranını ayakta tutan yerel zanaatkâr ve esnaftan alışveriş yap.\n\n> **Tefekkür Sorusu:** *Gezdiğin şehirlerde taş binaların ötesindeki emeği, adaleti ve toplumsal ruhu ne kadar görebiliyorsun?*'
    },
    {
      id: 'hayret-makami',
      num: '07',
      name: 'Hayret Makamı',
      category: 'hal',
      categoryLabel: 'İçsel Sükûnet & Hal',
      root: 'حيرت مقامی · Arapça "hayret" (şaşkınlık, kamaşma) + "makam" (durak/mertebe)',
      classical:
        'Ferîdüddîn Attâr’ın *Mantıku’t-Tayr* eserinde yedi vadinin altıncısıdır. Aklın alışılmış kalıplarının sustuğu, kâinattaki sanat ve kudret karşısında insanın “Bildim” iddiasından vazgeçip hayranlık ve tevazuyla eğildiği mertebedir.',
      modern:
        '“Burası da diğer şehirler gibi” diyen alaycı ve bıkkın turist bakışını kırıp; bir gölün rengine, bir taşın oymasına veya bir dağ geçidine ilk kez dünyayı gören bir çocuk gibi hayretle bakabilmektir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Hayret Makamı** (*حيرت مقامی*), tasavvuf edebiyatında bilhassa Attâr’ın *Mantıku’t-Tayr*’ında ve İbn Arabî’nin eserlerinde aklın sınırlarını aşan idrak durağı olarak geçer.\n\n### 2. İrfan Külliyatındaki Derinliği\nFelsefe hayretle başlar, irfan ise olgunlaşmış bir hayretle kemale erer. Kibirli zihin her şeyi “bildiğini” sanır ve hiçbir şeye şaşırmaz; bu da körlük doğurur. Arif ise bildikçe bilmediğinin büyüklüğünü görür. *“Rabbim, Senin hakkındaki hayretimi artır”* duası, kalbin canlı kalmasının ve hakikate karşı donuklaşmamasının sırrıdır.\n\n### 3. Anadolu Menzilinden Bir Misal\nNemrut Dağı’nda şafak sökerken ya da Divriği Ulu Camii’nin gölgede namaz kılan insan silüeti veren taş kapısının önünde kelimelerin tükendiğini hissetmek, modern çağda yaşanabilecek en sahici *hayret makamı*dır.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **İlk Kez Görüyormuş Gibi:** Defalarca fotoğrafını gördüğün bir yere bile “Ben bunu zaten biliyorum” demeden git; detaylarda gizli sürprizleri ara.\n- **Hayret Defteri:** Gün sonunda “Bugün beni en çok ne şaşırttı ve aciz bıraktı?” sorusunun cevabını yaz.\n\n> **Tefekkür Sorusu:** *Çok görmek ve çok okumak sende hayreti mi büyütüyor, yoksa her şeye karşı bir bıkkınlık mı üretiyor?*'
    },
    {
      id: 'tecerrud',
      num: '08',
      name: 'Tecerrüd',
      category: 'ahlak',
      categoryLabel: 'Ahlâk & Fütüvvet',
      root: 'تجرّد · Arapça c-r-d (ج ر د) kökünden; soyunmak, fazlalıklardan arınmak, sadeleşmek',
      classical:
        'Kalbi masivâdan (hakikat dışındaki bağlayıcı arzulardan), bedeni ise lüzumsuz eşya ve gösterişten arındırmaktır. Azla yetinmenin verdiği mutlak iç hürriyeti ifade eder.',
      modern:
        'Minimalist sırt çantası disiplini ve dijital sadeleşmedir. 81 ili tek bir çantayla gezebilmek; konfor bağımlılığı olmadan her şartta huzurlu ve üretken kalabilmektir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Tecerrüd** (*تجرّد*), Arapça *c-r-d* kökünden gelir; ağacın kabuğundan sıyrılması gibi insanın da lüzumsuz yüklerden, unvanlardan ve fazlalıklardan soyunup saf öze ulaşmasıdır.\n\n### 2. İrfan Külliyatındaki Derinliği\nDervişin elindeki asa ve sırtındaki aba, yoksulluğun değil **hürriyetin** sembolüdür. Çok şeye sahip olan kişi, farkında olmadan sahip olduklarının bekçisine dönüşür. *Tecerrüd*, eşyayı hayatın merkezinden çıkarıp araç konumuna indirmektir; böylece seyyah kaybetmekten korkmadan yola çıkabilir.\n\n### 3. Anadolu Menzilinden Bir Misal\nSadece 35 litrelik bir sırt çantasıyla Karadeniz yaylalarından Ege kıyılarına kadar haftalarca yolculuk yaparken, aslında ne kadar az şeye muhtaç olduğunu keşfetmek *tecerrüd*ün modern tecrübesidir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Tek Çanta Kuralı:** Eşyanı tek sırt çantasına sığdır; ellerin daima boş ve yardıma/not almaya hazır kalsın.\n- **Hafif Dijitalizm:** Seyahat boyunca gereksiz uygulamaları ve alışveriş bildirimlerini sustur.\n\n> **Tefekkür Sorusu:** *Yanında taşıdığın eşyalar ve alışkanlıklar yolunu kolaylaştırıyor mu, yoksa adımlarını ağırlaştıran birer zincire mi dönüşüyor?*'
    },
    {
      id: 'futuvvet',
      num: '09',
      name: 'Fütüvvet',
      category: 'ahlak',
      categoryLabel: 'Ahlâk & Fütüvvet',
      root: 'فتوّت · Arapça "fetâ" (yiğit, cömert genç) kökünden; yüksek ahlâk, diğerkâmlık ve Ahîlik şövalyeliği',
      classical:
        'Anadolu Ahîlik teşkilatının ahlâk omurgasıdır. “Kendin muhtaç iken bile kardeşini tercih etmek (îsâr), kusur örtmek, eline-beline-diline sahip olmak ve hakkından fazlasını istememek” olarak tarif edilir.',
      modern:
        'Yolda karşılaştığın yabancıya karşı güvenilir olmak, yurt ve kampüs ortamlarında centilmenlik göstermek, esnafın hakkını gözetmek ve gittiğin yere yük değil bereket taşımaktır.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Fütüvvet** (*فتوّت*), Arapça *fetâ* (genç, yiğit, cömert) kelimesinden türemiştir. Anadolu’da Ahi Evran öncülüğünde esnaf, zanaatkâr ve yolcu ahlâkının anayasasına (*Fütüvvetnâmeler*) dönüşmüştür.\n\n### 2. İrfan Külliyatındaki Derinliği\nFütüvvetnâmelere göre gerçek yiğitlik (*fetâ* olmak), kılıç sallamakta değil; **nefsine hâkim olup başkasına fayda vermekte**dir. “Elini, kapını ve sofranı açık tut; gözünü, dilini ve belini kapalı tut” düsturu, Anadolu şehirlerini yüzyıllar boyunca yolcular için güvenli birer liman haline getirmiştir.\n\n### 3. Anadolu Menzilinden Bir Misal\nKırşehir’deki Ahi Evran Külliyesi’nin avlusunda otururken, yoldaki bir yaşlıya yer vermek, otobüste tanıştığın öğrenciye çay ısmarlamak veya küçük esnaftan pazarlık kırıp gurur kırmamak *fütüvvet* ruhunu bugün yaşatmaktır.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Üç Açık, Üç Kapalı:** Yolda cömertliği, tebessümü ve yardımseverliği açık; dedikoduyu, öfkeyi ve kibri kapalı tut.\n- **Sessiz İyilik:** Konakladığın yerde kimse görmeden bir eksiği düzelt veya bir yol arkadaşının yükünü hafiflet.\n\n> **Tefekkür Sorusu:** *Gittiğin şehirlerde “Bu gençten kimseye zarar gelmez, aksine güven ve huzur yayılır” dedirten bir iz bırakabiliyor musun?*'
    },
    {
      id: 'tefekkur',
      num: '10',
      name: 'Tefekkür',
      category: 'ilim',
      categoryLabel: 'İlim & Basîret',
      root: 'تفكّر · Arapça f-k-r (ف ك ر) kökünden; derinlemesine düşünmek, ibretle muhasebe etmek',
      classical:
        'Yalnızca kuru bir zihinsel analiz değil; kalp ile aklın birleşerek varlıktaki düzeni, hikmeti, zamanın geçişini ve insanın yaratılış gayesini derinlemesine idrak etme eylemidir.',
      modern:
        'Bir müze gezisi veya doğa yürüyüşü sonrası hemen bir sonraki durağa koşmak yerine, bir park bankında ya da kütüphane penceresinde oturup gördüklerini sindirme ve anlamlandırma seansıdır.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Tefekkür** (*تفكّر*), Arapça *fikir* kökünden türemiş olup “bir konunun hakikatine ulaşmak için kalp ve akıl ile derinleşmek” anlamını taşır.\n\n### 2. İrfan Külliyatındaki Derinliği\nGazzâlî *İhyâ*’da tefekkürü ibadetin özü olarak anlatır. Çünkü insan yalnızca bakarsa unutur; ama **tefekkür** ederse gördüğü şeklin arkasındaki manaya ulaşır. Toprağın altından çıkan binbir renkli çiçekten yıkılmış bir kalenin sessiz taşlarına kadar her şey, tefekkür eden göz için açık birer kitaptır.\n\n### 3. Anadolu Menzilinden Bir Misal\nKapadokya’nın bir vadisinde güneş batarken peribacalarının milyonlarca yılda rüzgâr ve yağmurla nasıl sabırla yontulduğunu izleyip kendi hayatındaki aceleciliği sorgulamak tam bir *tefekkür* anıdır.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Sindirme Molası:** Her yoğun gezi gününün ardından 15 dakika ekransız otur ve o günün en çarpıcı sahnesini zihninde yeniden kur.\n- **Neden ve Nasıl:** Gördüğün her esere “Kim yaptı?” sorusunun yanında “Hangi ihtiyaç ve ruh haliyle yapıldı?” diye sor.\n\n> **Tefekkür Sorusu:** *Bugün zihninden binlerce görüntü geçti; peki hangisinin üzerinde beş dakika durup derinlemesine düşündün?*'
    },
    {
      id: 'hikmet',
      num: '11',
      name: 'Hikmet',
      category: 'ilim',
      categoryLabel: 'İlim & Basîret',
      root: 'حكمت · Arapça h-k-m (ح ك م) kökünden; sağlam kılmak, yerli yerine koymak, bilgelik',
      classical:
        'Doğru bilgiyi doğru ahlâk ve doğru eylemle birleştirip her şeyi yerli yerine koyabilme melekesidir. Malumat yığınından farklı olarak hayata yön veren yaşanmış bilgeliktir.',
      modern:
        'Şehirler hakkında ansiklopedik rakamları ezberlemek değil; o şehirlerin kültüründen, tarihindeki hatalardan ve başarılarından kendi hayatına ölçülü, dengeli ve faydalı dersler çıkarabilmektir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Hikmet** (*حكمت*), Arapça *h-k-m* kökünden gelir. Aslı “atın gemi” yani taşkınlığı dizginleyip doğru yöne sevk eden ölçü demektir; buradan “sağlamlık, adalet ve bilgelik” anlamı doğmuştur.\n\n### 2. İrfan Külliyatındaki Derinliği\nKlasik düşüncede ilim çok şey bilmektir; **hikmet** ise bildiğiyle amel etmek, nerede konuşup nerede susacağını, ne zaman yürüyüp ne zaman duracağını bilmektir. Hikmet, bilginin kalbe inip nezaket, merhamet ve denge olarak dışarı yansımasıdır.\n\n### 3. Anadolu Menzilinden Bir Misal\nBir eski Anadolu konağının avlusunda yazın serinlik, kışın sıcaklık sağlayan akıllı mimariyi gördüğünde “Ecdat sadece taş örmemiş, iklimle kavga etmeden yaşamayı bilmiş” diyebilmek hikmeti yakalamaktır.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Bilgiden Hâle:** Okuduğun her tarih veya kültür bilgisini “Bu benim bugünkü bir davranışıma nasıl ölçü katar?” diye süz.\n- **Dengeli Tempo:** Ne kendini tüketecek kadar hırslı gez ne de tembelliğe düş; ölçülü yol ritmi kur.\n\n> **Tefekkür Sorusu:** *Topladığın onca seyahat bilgisi seni daha bilge ve ölçülü biri yapıyor mu, yoksa sadece daha hızlı konuşan birine mi?*'
    },
    {
      id: 'marifet',
      num: '12',
      name: 'Marifet',
      category: 'ilim',
      categoryLabel: 'İlim & Basîret',
      root: 'معرفت · Arapça a-r-f (ع ر ف) kökünden; tanımak, sezgi ve yaşantı yoluyla bilmek',
      classical:
        'Kitaptan aktarılan teorik bilginin (*ilim*) ötesinde, yaşayarak, görerek ve kalple tadarak elde edilen doğrudan tanıma ve irfan bilgisidir. “Kendini bilen Rabbini bilir” sırrıyla özdeşleşir.',
      modern:
        'Bir şehri sadece haritadan ve rehber yazıdan tanımak (*malumat*) değil; yağmurunda ıslanarak, insanıyla çay içerek, sokağında kaybolarak ruhuyla tanışmaktır (*marifet*).',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Marifet** (*معرفت*), Arapça *a-r-f* kökünden gelir ve “yakından tanımak, aşina olmak, sezerek bilmek” manasını taşır. Yunus Emre’nin *“İlim ilim bilmektir / İlim kendin bilmektir”* dediği yer tam burasıdır.\n\n### 2. İrfan Külliyatındaki Derinliği\nBalın tatlılığını kimya formülüyle anlatmak **ilim**, bir kaşık balı tadıp lezzetini bilmek ise **marifet**tir. Bu yüzden ârifler sadece kâğıt üzerindeki bilgiyle yetinmez; bizzat menzile varıp mekânı, insanı ve kendi nefsini tecrübe ederek tanır.\n\n### 3. Anadolu Menzilinden Bir Misal\nTrabzon’un veya Rize’nin yayla sisini ekrandan izlemek bilgi verir; ama sabah serinliğinde o sisin içinden yürüyüp bir ahşap evde kuzine başında mısır ekmeği bölüşmek o coğrafyaya dair *marifet* kazandırır.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **İlk El Tecrübe:** Rehber listelerinin dışına çıkıp bir mahalle kahvesinde veya kütüphanede yerli bir insanla en az bir sohbet kur.\n- **Kendini Tanıma Aynası:** Yolculuğun zor anlarında (açlık, yorgunluk, gecikme) kendi sabır ve tepki sınırlarını dürüstçe tanı.\n\n> **Tefekkür Sorusu:** *Gezdiğin şehirler hakkında malumat sahibi misin, yoksa onların ruhuyla gerçekten tanıştın mı?*'
    },
    {
      id: 'istigna',
      num: '13',
      name: 'İstiğna',
      category: 'ahlak',
      categoryLabel: 'Ahlâk & Fütüvvet',
      root: 'استغنا · Arapça ğ-n-y (غ ن ي) kökünden; ihtiyaçsız olmak, tokgözlülük ve minnetsizlik',
      classical:
        'Kimseden beklentiye girmemek, menfaat ve gösteriş karşısında onurunu korumak, azla gönlü zengin kalabilmektir. Ferîdüddîn Attâr’ın *Mantıku’t-Tayr*’ındaki en çetin vadilerden biridir.',
      modern:
        'Lüks otel, pahalı ekipman veya sosyal medya beğenisi peşinde koşmadan; bir yurt ranzası, bir simit-çay ve temiz bir defterle bile kendini eksiksiz ve mutlu hissedebilmektir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**İstiğna** (*استغنا*), Arapça *ganî* (zengin) kökünden türemiştir ve *“gönül tokluğu, kimseye avuç açmama, lükse ve alkışa muhtaç olmama”* demektir.\n\n### 2. İrfan Külliyatındaki Derinliği\nGerçek zenginlik cüzdanın şişkinliğinde değil, **neye ihtiyaç duymadığındadır**. İstiğna sahibi seyyah ne makam sahiplerine yaranmak için eğilir ne de tüketim kültürünün dayattığı “şunsuz gezilmez” baskısına boyun eğer. Onun vakarı, aza kanaat edip kimseden minnet beklememesinden doğar.\n\n### 3. Anadolu Menzilinden Bir Misal\nPahalı turistik restoranların önünde sıra beklemek yerine, ara sokaktaki temiz bir esnaf lokantasında mercimek çorbasıyla şükredip kalkmak ve o akşam kütüphane merdivenlerinde notlarını düzenlemek tam bir *istiğna* duruşudur.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Beğeni Bağımsızlığı:** Bir manzarayı “paylaşırsam kaç beğeni alır?” diye değil, sadece kendi şahitliğin için seyret.\n- **Bütçe Onuru:** İmkanın dar olduğunda bile neşeni kaybetme; en kıymetli keşiflerin ücretsiz (yürüyüş, kütüphane, sohbet) olduğunu hatırla.\n\n> **Tefekkür Sorusu:** *Senin seyahat sevincin hangi pahalı şartlara veya kimlerin takdirine bağlı kalmış durumda?*'
    },
    {
      id: 'kervansaray',
      num: '14',
      name: 'Kervansaray',
      category: 'sefer',
      categoryLabel: 'Sefer & Mekân',
      root: 'كاروانسراي · Farsça "kârvân" (yolcu kafilesi) + "serây" (konak, büyük ev)',
      classical:
        'Selçuklu ve Osmanlı’da ticaret yolları üzerine bir günlük yürüyüş mesafesiyle (~30-40 km) inşa edilen; din, dil, statü farkı gözetmeden yolculara üç gün ücretsiz yemek, barınak ve bakım sunan vakıf tesisleridir.',
      modern:
        'Bugünün GSB gençlik yurtları, misafirhaneler, millet kıraathaneleri ve kütüphaneleridir. Yolcunun yorgunluğunu atan, ortak sofra ve bilgi paylaşımıyla yola yeniden güç topladığı güvenli duraklardır.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Kervansaray** (*كاروانسراي*), Farsça *kârvân* (yolcu topluluğu) ve *serây* (konak/saray) kelimelerinin birleşimidir. Anadolu Selçukluları bunlara **ribat** veya **han** da demiştir.\n\n### 2. İrfan Külliyatındaki Derinliği\nSultanhanı’ndan Ağzıkarahan’a kadar Anadolu yollarını nakış gibi işleyen kervansaraylar, dünyada eşi az bulunur bir sosyal devlet ve vakıf ahlâkının taşlaşmış halidir. İçerisinde mescidi, hamamı, şifahanesi ve ortak avlusuyla sadece bedeni değil, yolcunun güven duygusunu da korurdu. Üstelik dünya hayatının kendisi de büyük bir kervansaraydır: kimse hancı değildir, herkes gelip geçici birer yolcudur.\n\n### 3. Anadolu Menzilinden Bir Misal\nSeyahatin ortasında bir şehrin GSB yurdunda veya İl Halk Kütüphanesi’nin sıcak salonunda çantanı indirip başka şehirlerden gelmiş gençlerle selamlaşırken, yüzlerce yıllık kervansaray halkasının devam ettiğini hissedersin.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Hancı Değil Yolcu Bilinci:** Kaldığın odada veya çalıştığın masada “benden sonra gelen de huzurla otursun” diyerek düzen bırak.\n- **Tarihî Han Ziyareti:** Yolunun üzerindeki en az bir Selçuklu veya Osmanlı hanının avlusunda oturup geçmiş kervanları hayal et.\n\n> **Tefekkür Sorusu:** *Konakladığın bu dünya kervansarayında senden sonraki yolculara nasıl bir iz ve kolaylık bırakıyorsun?*'
    },
    {
      id: 'uzlet',
      num: '15',
      name: 'Uzlet',
      category: 'hal',
      categoryLabel: 'İçsel Sükûnet & Hal',
      root: 'عزلت · Arapça a-z-l (ع ز ل) kökünden; bir kenara çekilmek, yalnızlıkta arınmak',
      classical:
        'İnsanlardan küsmek veya kaçmak için değil; zihni boş sözden, dedikodudan ve kalabalıkların yıpratıcı rekabetinden korumak amacıyla bilinçli ve geçici olarak sessizliğe çekilmektir.',
      modern:
        'Seyahat sırasında telefonunu uçak moduna alıp bir dağ başında, göl kenarında veya kütüphanenin en sessiz köşesinde kimseyle konuşmadan sadece kendi düşüncelerinle baş başa kalma pratiğidir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Uzlet** (*عزلت*), Arapça *a-z-l* kökünden gelir ve *“kendini geçici olarak kenara çekmek, sükûnete çekilmek”* demektir.\n\n### 2. İrfan Külliyatındaki Derinliği\nTasavvufta uzlet, toplumdan ömür boyu kopuş (ruhbanlık) değildir; bilakis topluma daha sağlıklı, daha merhametli ve daha berrak dönebilmek için yapılan ruhsal bir nefeslenmedir. İmam Gazzâlî uzletin faydasını şöyle özetler: Kalabalık içinde insan başkalarının kusurlarını ve beklentilerini taşır; uzlette ise kendi hakikatiyle yüzleşir ve ilimle derinleşir.\n\n### 3. Anadolu Menzilinden Bir Misal\nBüyük şehir keşmekeşinin ardından Abant ya da Eğirdir Gölü’nün kıyısında bir bankta 1 saat konuşmadan, paylaşım yapmadan sadece suyun kıpırtısını dinlemek modern seyyahın şifalı *uzlet*idir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Haftalık Sessiz Saat:** Seyahat haftanda en az bir sabahı “konuşmasız ve bildirimsiz” geçir; sadece yürü, oku ve yaz.\n- **Zihin Boşaltma:** Uzlete çekildiğinde zihnini kaygılarla değil, tabiatı temaşayla dinlendir.\n\n> **Tefekkür Sorusu:** *Kalabalık sustuğunda ve ekran karardığında kendi iç sesinle baş başa kalmaktan korkuyor musun, yoksa orada huzur mu buluyorsun?*'
    },
    {
      id: 'sohbet',
      num: '16',
      name: 'Sohbet',
      category: 'ahlak',
      categoryLabel: 'Ahlâk & Fütüvvet',
      root: 'صحبت · Arapça s-h-b (ص ح ب) kökünden; arkadaşlık etmek, gönülden hemhal olmak',
      classical:
        'Yüzeysel laf kalabalığı değil; hikmet, edep ve muhabbet ekseninde iki kalbin birbirinden feyiz ve anlayış almasıdır. “Meclislerde aranan cevher, gönlü gönle değdiren sohbettir.”',
      modern:
        'Bir kahvehanede yaşlı bir amcanın memleket hatıralarını dinlemek, yurt kantininde farklı şehirden bir yol arkadaşıyla ufkunu paylaşmak; sadece konuşmak değil, gerçekten kulak verip dinlemektir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Sohbet** (*صحبت*), Arapça *sahâbe* (yol arkadaşlığı, dostluk) ile aynı kökten gelir. İnsanın hemhal olduğu dostluk meclisi demektir.\n\n### 2. İrfan Külliyatındaki Derinliği\nAnadolu irfanında bilgi tek başına kitaptan soğuk kalır; onu ısıtan ve canlı tutan **sohbet**tir. Şeyh Galib’in, Mevlânâ’nın (Şems ile) ve Yunus’un (Tapduk ile) hikâyesi hep bir sohbetin açtığı kapıdır. Hakiki sohbette kimse üstünlük taslamaz; biri konuşurken diğeri tüm varlığıyla dinler ve söz kalpten kalbe köprü kurar.\n\n### 3. Anadolu Menzilinden Bir Misal\nSafranbolu’da bir çay ocağında sobanın başında otururken, yetmiş yaşındaki bir ustanın mesleğini nasıl aşkla anlattığını telefonu elinden bırakıp gözlerinin içine bakarak dinlemek, müzelerden daha derin bir tarih dersi verir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Dinleme Sanatı:** Yolda tanıştığın insanların cümlelerini kesme; kendi şehrine dönüp kendini anlatmak yerine önce karşıdakinin hikâyesini sor.\n- **Kıymetli Dostluk:** Seyahatte kurduğun samimi bağları tek bir selam ve hatır sormayla canlı tut.\n\n> **Tefekkür Sorusu:** *Son yaptığın sohbetlerde karşındakini anlamak için mi dinledin, yoksa kendi sıranın gelmesini mi bekledin?*'
    },
    {
      id: 'ibret',
      num: '17',
      name: 'İbret',
      category: 'ilim',
      categoryLabel: 'İlim & Basîret',
      root: 'عبرت · Arapça a-b-r (ع ب ر) kökünden; bir kıyıdan karşı kıyıya geçmek, zahirden batına geçip ders almak',
      classical:
        'Görünen olay ve harabelerin yüzeyinde kalmayıp, onların arkasındaki ilahi ve tarihî yasaya “geçiş yapmak”tır. Medeniyetlerin yükseliş ve çöküşünden kendi hayatı için uyanış çıkarmaktır.',
      modern:
        'Bir antik kentin yıkık sütunlarına veya terk edilmiş bir köy evine bakarken “Ne güzel fotoğraf” demekle yetinmeyip zamanın geçiciliğini ve kalıcı olan değerin ne olduğunu idrak etmektir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**İbret** (*عبرت*), Arapça *ubûr* (köprüden veya sudan karşıya geçmek) kökünden gelir. Yani gördüğün şekilden, onun işaret ettiği hakikat kıyılarına **geçiş yapmaktır**.\n\n### 2. İrfan Külliyatındaki Derinliği\nKur’an-ı Kerim’de *“Yeryüzünde gezip dolaşın da öncekilerin sonu nice oldu görün”* buyrulurken işaret edilen bakış tam olarak **ibret**tir. İbretsiz bakış sadece taş ve toprak görür; ibretli bakış ise Efes’in mermerlerinde de Ani Harabeleri’nin kızıl taşlarında da insan kibrinin geçiciliğini, ancak ilim ve adaletin baki kaldığını okur.\n\n### 3. Anadolu Menzilinden Bir Misal\nKars’taki Ani Örenyeri’nde rüzgârın ıslığı eşliğinde boş kalmış kervansaray ve mabet kalıntılarına bakarken, bir zamanlar burada binlerce insanın telaşla koştuğunu düşünüp kendi telaşlarına tebessümle mesafe koymak *ibret*tir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Derin Okuma:** Tarihî bir harabeyi gezdikten sonra kendine şu soruyu sor: “Bunu kuranlar neye güvendi, neyi ihmal etti ve geriye ne kaldı?”\n- **Kalıcı İz:** Geçici hevesler yerine arkasında hayırla anılacak bir iş bırakmaya niyetlen.\n\n> **Tefekkür Sorusu:** *Yüzlerce yıllık harabelerin önünde dururken bugünkü küçük endişelerin gözünde hâlâ dev gibi mi görünüyor?*'
    },
    {
      id: 'tevekkul',
      num: '18',
      name: 'Tevekkül',
      category: 'ahlak',
      categoryLabel: 'Ahlâk & Fütüvvet',
      root: 'توكّل · Arapça v-k-l (و ك ل) kökünden; elinden geleni yaptıktan sonra neticeyi Hakka emanet etmek',
      classical:
        'Tedbiri terk etmek değil; bütün maddi hazırlığı, araştırmayı ve gayreti eksiksiz yaptıktan sonra kontrolümüz dışındaki belirsizlikler konusunda kalbi telaştan kurtarıp huzurla teslim olmaktır.',
      modern:
        'Biletini, rotanı, hava durumunu ve bütçeni titizlikle planlayıp; yola çıktıktan sonra çıkan aksiliklerde paniğe kapılmadan “Her gecikmede bir hayır ve yeni bir keşif vardır” diyebilmektir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Tevekkül** (*توكّل*), Arapça *vekil* kökünden gelir. “Önce deveyi sağlam bağla, sonra tevekkül et” hadisi bu kavramın değişmez sınırını çizer.\n\n### 2. İrfan Külliyatındaki Derinliği\nTembeleşip hazırlıksız yola çıkmak tevekkül değil, tedbirsizliktir. Hakiki tevekkül, sebeplere sarılmakta zirve yaptıktan sonra kalbi sonuç kaygısının pençesinden kurtarmaktır. Yolcu, bileğini ve aklını çalıştırır; ama yağmuru, rüzgârı ve yarını yönetemeyeceğini bilerek iç huzurunu korur.\n\n### 3. Anadolu Menzilinden Bir Misal\nTüm rota planını, GSB yurt rezervasyonunu ve bütçeni hazırlayıp yola çıktıktan sonra otobüsün kaçması üzerine sinir krizi geçirmek yerine, o iki saatlik boşlukta hiç hesapta olmayan tarihi bir camiye girip eşsiz bir huzur bulmak *tevekkül*ün meyvesidir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Tedbir + Teslimiyet:** Çantanı, yedek pilini ve haritanı eksiksiz hazırla; yola koyulunca da kontrol edemediğin şartları akışına bırak.\n- **Kaygı Filtresi:** Değiştiremeyeceğin bir aksilik olduğunda “Bu durumda şimdi yapabileceğim en iyi şey nedir?” sorusuna geç.\n\n> **Tefekkür Sorusu:** *Seyahatte hazırlığını mı eksik bırakıyorsun, yoksa her şeyi kontrol etme hırsıyla yolun tadını mı kaçırıyorsun?*'
    },
    {
      id: 'sabir',
      num: '19',
      name: 'Sabır',
      category: 'ahlak',
      categoryLabel: 'Ahlâk & Fütüvvet',
      root: 'صبر · Arapça s-b-r (ص ب ر) kökünden; direnmek, sebat etmek, zorlukta dağılmamak',
      classical:
        'Pasif bir boyun eğme veya çaresizlik değil; zorluk, yorgunluk ve gecikme anlarında karakteri ve hedefi koruyarak aktif bir sebat ve metanet göstermektir.',
      modern:
        '12 saatlik otobüs yolculuğunda, dik yokuş tırmanışında, yağmurda ıslanırken veya kütüphanede zor bir projeyi tamamlarken sızlanmayı bırakıp yolda olmanın tabiî bedelini olgunlukla karşılamaktır.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Sabır** (*صبر*), Arapça *s-b-r* kökünden türemiştir ve aslında *“kalbi sarsıntıdan tutup sağlamlaştırmak”* anlamındadır. Kur’an ve tasavvuf geleneğinde aydınlığın (*“Sabır aydınlıktır”*) kaynağıdır.\n\n### 2. İrfan Külliyatındaki Derinliği\nMevlânâ *Mesnevî*’de dikenden gül çıkmasını sabırla anlatır. Hızlı tüketim çağında her şeye anında ulaşmaya alışmış modern insan, en ufak beklemede hırçınlaşır. Oysa yol, insana beklemenin, yürümenin ve terlemenin kıymetini öğretir; çünkü sabır olmadan hiçbir derin eser ve hiçbir gerçek keşif olgunlaşmaz.\n\n### 3. Anadolu Menzilinden Bir Misal\nSümela Manastırı’na veya Nemrut’un zirvesine tırmanırken nefesin kesildiğinde geri dönmek yerine, adımını küçültüp nefesini düzenleyerek zirveye varmak ve o manzarayı hak etmek *sabır* terbiyesidir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Şikâyetsiz Gün:** Zorlu bir transfer gününde 24 saat boyunca hava, yol veya bekleme hakkında tek bir şikâyet cümlesi kurmamayı dene.\n- **Küçük Adım Sebatı:** Büyük bir projeyi veya uzun bir rotayı tek seferde bitirmeye çalışmak yerine sabırlı günlük etaplara böl.\n\n> **Tefekkür Sorusu:** *Hızın her şeyi çözdüğünü sandığın anlarda, beklemek ve terlemek sana hangi olgunluğu kazandırıyor?*'
    },
    {
      id: 'sukur',
      num: '20',
      name: 'Şükür',
      category: 'ahlak',
      categoryLabel: 'Ahlâk & Fütüvvet',
      root: 'شكر · Arapça ş-k-r (ش ك ر) kökünden; iyiliği görmek, kıymet bilmek ve karşılığını güzellikle ödemek',
      classical:
        'Nimetin kaynağını bilip kalple sevinmek, dille hamd etmek ve elde edilen imkânı (sağlık, vakit, ilim, rızık) hayır yolunda kullanarak fiilen teşekkür etmektir.',
      modern:
        'Sağlıklı ayaklarla Anadolu’yu gezebilmenin, ücretsiz kütüphanelerde ilim çalışabilmenin, bir tas sıcak çorbanın ve emniyetli bir yolun kıymetini bilip bunu üretim ve nezaketle çoğaltmaktır.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Şükür** (*شكر*), Arapça kökü itibarıyla *“açığa çıkarmak, iyiliğin izini göstermek”* demektir. Nankörlüğün (*küfrân-ı nimet*, yani nimeti örtmek) tam zıddıdır.\n\n### 2. İrfan Külliyatındaki Derinliği\nTasavvufta şükrün üç basamağı vardır: **Kalbin şükrü** (nimetin kendinden değil bir lütuftan geldiğini bilmek), **dilin şükrü** (teşekkür ve hamd etmek) ve **uzuvların şükrü** (verilen sağlığı, aklı ve imkânı iyilik ve ilim için kullanmak). Şükür, eldeki küçük imkânı bereketlendiren en büyük sırdır.\n\n### 3. Anadolu Menzilinden Bir Misal\nSabahın erken saatinde küçük bir kasaba fırınından aldığın sıcak ekmeği ve bir bardak çayı, dünyadaki milyonlarca insanın ulaşamadığı büyük bir lütuf olarak görebilmek kalbi anında zenginleştirir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Üç Şükür Notu:** Her akşam Seyir Defterine o gün yolda karşılaştığın 3 küçük nimeti (bir selam, temiz bir kütüphane masası, güzel bir gün batımı) yaz.\n- **Fiilî Teşekkür:** Sana yol gösteren birine veya güzel hizmet veren bir mekâna içtenlikle teşekkür et.\n\n> **Tefekkür Sorusu:** *Eksik olana odaklanıp şikâyet etmek yerine, bugün sahip olduğun hangi imkânların kıymetini fark ettin?*'
    },
    {
      id: 'vahdet',
      num: '21',
      name: 'Vahdet',
      category: 'hal',
      categoryLabel: 'İçsel Sükûnet & Hal',
      root: 'وحدت · Arapça v-h-d (و ح د) kökünden; birlik, bütünlük, çokluğun ardındaki tek hakikat',
      classical:
        'Farklı suretler, renkler, iklimler ve kültürler (*kesret*) arasında boğulmak yerine; bütün varlığı birbirine bağlayan derin birliği, ahengi ve ortak kaynağı görebilmektir.',
      modern:
        'Edirne’den Hakkâri’ye, Sinop’tan Hatay’a uzanan Anadolu coğrafyasında farklı şivelerin, yemeklerin ve taşların aslında aynı büyük insanlık ve medeniyet nehrinin kolları olduğunu hissetmektir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Vahdet** (*وحدت*), Arapça *vâhid* (bir, tek) kökünden gelir. Türkçemizde *“birlik, bütünlük”* manasıyla irfan ve sanat dilimizin merkez kavramıdır.\n\n### 2. İrfan Külliyatındaki Derinliği\nGüneş ışığı prizmadan geçince yedi ayrı renge ayrılır; ama kaynağı tek bir ışıktır. Anadolu’daki cami minaresi, taş köprü, halk türküsü, kilim deseni ve farklı ağızlar da aynı insan gönlünün ve aynı hakikat arayışının farklı renkleridir. *Vahdet* nazarına eren seyyah, farklılıkları çatışma sebebi değil, birliği süsleyen zenginlik olarak görür.\n\n### 3. Anadolu Menzilinden Bir Misal\nMardin’in taş sokaklarında ezan, çan ve rüzgâr sesinin birbirine karıştığı ikindi vaktinde ya da Karadeniz ile Güneydoğu’nun misafirperverliğinde aynı sıcak gönlü bulduğunda *vahdet* hakikatini bizzat yaşarsın.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Ortak Damarı Ara:** Gittiğin yabancı bir yörede farklılıklara takılmak yerine, kendi memleketinle ortak olan insanî duyguları ve değerleri keşfet.\n- **Bütünsel Bakış:** Bölgesel önyargıları kır; 81 ilin her birini aynı bedenin vazgeçilmez bir uzvu bil.\n\n> **Tefekkür Sorusu:** *Farklı şehirlerde dolaşırken ayrılıkları mı büyütüyorsun, yoksa insanları birleştiren ortak ruhu mu görüyorsun?*'
    },
    {
      id: 'menzil',
      num: '22',
      name: 'Menzil',
      category: 'sefer',
      categoryLabel: 'Sefer & Mekân',
      root: 'منزل · Arapça n-z-l (ن ز ل) kökünden; inilen yer, konaklama durağı, yolun aşaması',
      classical:
        'Kervanın gün batımında konaklayıp nefeslendiği durak ve aynı zamanda manevî yolculukta nefsin aştığı her bir bilinç aşamasıdır. Yolcu menzile bağlanıp kalmaz, bir sonraki hedef için hazırlanır.',
      modern:
        'Anadolu’daki her il ve ilçe durağıdır. Bir şehri “son nokta” sanıp rehavete kapılmadan, oradaki vazifeni ve öğrenmeni tamamlayıp vaktinde yeni menzile doğru yola çıkabilmektir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Menzil** (*منزل*), Arapça *nüzûl* (inmek, konaklamak) kökünden türetilmiş ism-i mekândır; *“yolcunun inip konakladığı durak”* anlamına gelir.\n\n### 2. İrfan Külliyatındaki Derinliği\nKlasik sefer edebiyatında yol, birbirini takip eden **menziller** zinciridir. İki büyük tehlike vardır: ya menzilin konforuna kapılıp yola devam etmeyi unutmak ya da bir sonraki menzile yetişme telaşından bulunduğun durağın bereketini hiç tatmamak. Kemâl, menzilde tam bulunmak ama oraya esir olmamaktır.\n\n### 3. Anadolu Menzilinden Bir Misal\nBugün senin menzilin Amasya’dır: Yeşilırmak kıyısındaki yalıboyu evlerini seyreder, kütüphanede işini tamamlar, defterini yazar ve yarın sabah Samsun menziline hafif bir gönülle yola çıkarsın.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Menzil Kapanışı:** Bir şehirden ayrılmadan önce kısa bir kapanış ritüeli yap: “Burada ne aldım, ne bıraktım?”\n- **Aşama Odaklılık:** 81 ilin tamamını tek seferde düşünerek bunalma; şu anki menzilin hakkını ver.\n\n> **Tefekkür Sorusu:** *Şu an durduğun menzilin hakkını veriyor musun, yoksa aklın çoktan sonraki duraklarda mı kayboldu?*'
    },
    {
      id: 'salik',
      num: '23',
      name: 'Sâlik',
      category: 'ilim',
      categoryLabel: 'İlim & Basîret',
      root: 'سالك · Arapça s-l-k (س ل ك) kökünden; bir yola giren, sülûk eden bilinçli yolcu',
      classical:
        'Rastgele savrulan bir gezgin (*serseri*) değil; belli bir edep, rehberlik, disiplin ve gaye ile hakikat yoluna (*tarîk*) adım atmış bilinçli yolcudur.',
      modern:
        'Plansız savrulan bir turistten farklı olarak; okuma listesi, bütçe disiplini, ahlâk ilkeleri ve kayıt sorumluluğuyla Anadolu’yu arşınlayan modern dijital seyyahın kimliğidir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Sâlik** (*سالك*), Arapça *sülûk* (bir yola girmek ve o yolun usulüne göre ilerlemek) kökünden ism-i fâildir; *“usullü yolcu”* demektir.\n\n### 2. İrfan Külliyatındaki Derinliği\nHer yürüyen *sâlik* değildir. Rüzgârın önüne kattığı yaprak da kilometrelerce gider ama bir yönü yoktur. Sâliki sâlik yapan şey; **niyeti, usulü ve istikametidir**. Yolda düşebilir, yorulabilir ama yönünü kaybetmez; her tecrübeyi kendi irfan binasına bir tuğla yapar.\n\n### 3. Anadolu Menzilinden Bir Misal\nSırtında çantası, cebinde küçük defteri, bilgisayarında ürettiği projeleri ve kalbinde 7 ahlâk ilkesiyle bir il halk kütüphanesinde sabahlayan genç, çağımızın modern bir *sâlik*idir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Pusula Kontrolü:** Ayda bir kez kendi kendine “Ben şu an neden ve nereye yürüyorum?” diye sorarak istikametini tazele.\n- **Usul Sadakati:** En yorgun günlerde bile küçük okuma ve not tutma rutininden taviz verme.\n\n> **Tefekkür Sorusu:** *Seni yola çıkaran şey geçici bir heves mi, yoksa seni adım adım inşa eden bilinçli bir sülûk mu?*'
    },
    {
      id: 'hafiz-i-anadolu',
      num: '24',
      name: 'Hâfız-ı Anadolu',
      category: 'sefer',
      categoryLabel: 'Sefer & Mekân',
      root: 'حافظِ آنادولو · Arapça "hâfız" (koruyan, ezberleyip yaşatan) + "Anadolu" (Ana/Doğu Yurdu)',
      classical:
        'Bir beldenin taşını, kitabesini, irfanını, sözlü tarihini ve kültürel mirasını unutulmaktan koruyup zihninde, kalbinde ve eserlerinde yaşatan sadık şahit ve kültür muhafızıdır.',
      modern:
        '81 ilin her birini ziyaret edip fotoğraflarıyla, kütüphane notlarıyla, yerel lezzet ve tarih kayıtlarıyla yaşayan bir “Dijital Anadolu Seyahatnamesi” meydana getiren modern Evliya Çelebi’dir.',
      offlineDeep:
        '### 1. Etimolojik & Tarihsel Kök\n**Hâfız-ı Anadolu** (*حافظِ آنادولو*), Arapça *h-f-z* (korumak, gözetmek, zihne ve kalbe nakşetmek) kökünden gelen *hâfız* sıfatıyla bu aziz coğrafyanın adının birleşimidir.\n\n### 2. İrfan Külliyatındaki Derinliği\nKur’an’ı satırlardan sadırlara (kalplere) nakşeden hâfızlar gibi, kültürün ve coğrafyanın da hâfızları vardır. Evliya Çelebi nasıl 17. yüzyılın şehirlerini, lehçelerini ve insanlarını yok olmaktan kurtarıp on ciltlik bir hafızaya emanet ettiyse; bugünün seyyahı da hızlı değişim çağında Anadolu’nun kaybolmaya yüz tutan zarafetini, sözünü ve mekân ruhunu kayıt altına alarak korur.\n\n### 3. Anadolu Menzilinden Bir Misal\n81 ili tek tek gezerken her şehrin iki özgün karesini, kütüphane köşesini, tarihî mirasını ve kalbe dokunan hikâyesini bu dijital seyahatnamede derlemek; bu topraklara duyulan vefanın en somut nişanesidir.\n\n### 4. Dijital Seyyah İçin Günlük Pratik\n- **Vefa Kaydı:** Her ilin sayfasında mutlaka kendi özgün gözlemini ve bir yerel inceliği (bir deyim, bir çeşme adı, bir usta hikâyesi) arşivle.\n- **Yaşayan Miras:** Öğrendiğin yerel hikâyeleri başkalarına da doğru ve saygılı bir dille aktar.\n\n> **Tefekkür Sorusu:** *Sen bu topraklardan gelip geçtikten sonra, Anadolu’nun hangi güzelliği senin sayende unutulmaktan kurtulmuş olacak?*'
    }
  ];

  // =========================================================================
  // Helpers
  // =========================================================================
  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fallbackNormalizeTr(str) {
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
      .replace(/['’`]/g, '')
      .trim();
  }

  function renderMarkdownSafe(md, escFn) {
    if (typeof window !== 'undefined' && window.SEYYAH_AI && typeof window.SEYYAH_AI.renderMarkdown === 'function') {
      return window.SEYYAH_AI.renderMarkdown(md, escFn);
    }
    if (!md) return '';
    const esc = typeof escFn === 'function' ? escFn : fallbackEscapeHtml;
    const lines = String(md).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let inUl = false;
    let pBuf = [];

    function inlineFmt(text) {
      let safe = esc(text);
      safe = safe.replace(/`([^`]+?)`/g, '<code>$1</code>');
      safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      safe = safe.replace(/(^|[^\w*])\*([^\s*](?:[^*]*?[^\s*])?)\*(?=[^\w*]|$)/g, '$1<em>$2</em>');
      return safe;
    }
    function flushP() {
      if (pBuf.length) {
        out.push(`<p class="seyyah-md-p">${pBuf.map(inlineFmt).join('<br />')}</p>`);
        pBuf = [];
      }
    }
    function closeUl() {
      if (inUl) {
        out.push('</ul>');
        inUl = false;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        flushP();
        closeUl();
        continue;
      }
      const h = line.match(/^(#{1,4})\s+(.+)$/);
      if (h) {
        flushP();
        closeUl();
        const lvl = h[1].length;
        out.push(`<h${lvl} class="seyyah-md-h${lvl}">${inlineFmt(h[2])}</h${lvl}>`);
        continue;
      }
      const q = line.match(/^>\s?(.*)$/);
      if (q) {
        flushP();
        closeUl();
        out.push(`<blockquote class="seyyah-md-quote">${inlineFmt(q[1])}</blockquote>`);
        continue;
      }
      const li = line.match(/^[-*•]\s+(.+)$/);
      if (li) {
        flushP();
        if (!inUl) {
          inUl = true;
          out.push('<ul class="seyyah-md-list">');
        }
        out.push(`<li>${inlineFmt(li[1])}</li>`);
        continue;
      }
      closeUl();
      pBuf.push(line);
    }
    flushP();
    closeUl();
    return out.join('\n');
  }

  function loadStringSet(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? new Set(parsed) : new Set();
    } catch (_) {
      return new Set();
    }
  }

  function saveStringSet(key, setObj) {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(setObj)));
    } catch (_) {}
  }

  function getTravelStats(ctx) {
    const provinces = (ctx && ctx.data && ctx.data.provinces) || {};
    const values = Object.values(provinces);
    const total = values.length || 81;
    let visited = 0;
    for (let i = 0; i < values.length; i++) {
      if (values[i] && values[i].visited) visited += 1;
    }
    return { visited, total };
  }

  // =========================================================================
  // Scoped Styles (Dark & Light Theme Compatible)
  // =========================================================================
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .ethos-studio {
        --ethos-surface: rgba(15, 23, 42, 0.72);
        --ethos-card: rgba(20, 30, 52, 0.76);
        --ethos-elevated: rgba(30, 41, 59, 0.85);
        --ethos-border: rgba(255, 255, 255, 0.1);
        --ethos-border-strong: rgba(0, 242, 254, 0.34);
        --ethos-gold: #f59e0b;
        --ethos-cyan: #00f2fe;
        --ethos-emerald: #10b981;
        --ethos-purple: #a855f7;
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-width: 1320px;
        margin: 0 auto;
        padding: 4px 2px 44px;
        color: var(--text-primary, #f8fafc);
        animation: ethosFadeIn 0.35s ease;
      }

      @keyframes ethosFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Hero Banner */
      .ethos-hero {
        position: relative;
        overflow: hidden;
        padding: 28px 30px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 8% 15%, rgba(245, 158, 11, 0.16) 0%, transparent 45%),
          radial-gradient(circle at 92% 18%, rgba(0, 242, 254, 0.14) 0%, transparent 44%),
          radial-gradient(circle at 50% 100%, rgba(168, 85, 247, 0.12) 0%, transparent 50%),
          var(--ethos-surface);
        border: 1px solid var(--ethos-border);
        box-shadow: var(--shadow-subtle, 0 12px 32px rgba(0, 0, 0, 0.45));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
      }

      .ethos-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image:
          linear-gradient(90deg, rgba(245, 158, 11, 0.08) 1px, transparent 1px),
          linear-gradient(0deg, rgba(0, 242, 254, 0.06) 1px, transparent 1px);
        background-size: 38px 38px;
        mask-image: radial-gradient(circle at 80% 25%, rgba(0,0,0,0.45), transparent 70%);
        -webkit-mask-image: radial-gradient(circle at 80% 25%, rgba(0,0,0,0.45), transparent 70%);
      }

      .ethos-hero-top {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 18px;
      }

      .ethos-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 5px 13px;
        border-radius: 9999px;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--ethos-gold);
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.34);
        margin-bottom: 10px;
      }

      .ethos-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.5rem, 2.7vw, 2.15rem);
        font-weight: 800;
        line-height: 1.2;
        letter-spacing: -0.02em;
        margin-bottom: 8px;
        background: linear-gradient(125deg, #f8fafc 0%, #fde68a 48%, #67e8f9 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .ethos-subtitle {
        max-width: 740px;
        font-size: 0.95rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.65;
      }

      .ethos-hero-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
      }

      .ethos-stat-pill {
        display: flex;
        flex-direction: column;
        min-width: 112px;
        padding: 10px 14px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid var(--ethos-border);
      }

      .ethos-stat-val {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--ethos-cyan);
      }

      .ethos-stat-lbl {
        font-size: 0.72rem;
        color: var(--text-secondary, #94a3b8);
      }

      .ethos-hero-nav {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--ethos-border);
      }

      .ethos-jump-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .ethos-jump-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 15px;
        border-radius: 9999px;
        border: 1px solid var(--ethos-border);
        background: rgba(30, 41, 59, 0.65);
        color: var(--text-primary, #f8fafc);
        font-size: 0.83rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ethos-jump-btn:hover {
        border-color: var(--ethos-cyan);
        background: rgba(0, 242, 254, 0.12);
        transform: translateY(-1px);
      }

      .ethos-jump-btn.is-gold {
        border-color: rgba(245, 158, 11, 0.35);
        color: #fcd34d;
      }

      .ethos-jump-btn.is-gold:hover {
        background: rgba(245, 158, 11, 0.16);
      }

      .ethos-pledge-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
      }

      .ethos-progress-track {
        width: 118px;
        height: 7px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }

      .ethos-progress-fill {
        height: 100%;
        border-radius: 9999px;
        background: linear-gradient(90deg, var(--ethos-gold), var(--ethos-emerald), var(--ethos-cyan));
        transition: width 0.35s ease;
      }

      /* Section Shells */
      .ethos-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px;
        border-radius: var(--radius-lg, 20px);
        background: var(--ethos-surface);
        border: 1px solid var(--ethos-border);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      }

      .ethos-section-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-end;
        gap: 12px;
      }

      .ethos-section-kicker {
        font-size: 0.74rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--ethos-cyan);
        margin-bottom: 4px;
      }

      .ethos-section-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.32rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .ethos-section-desc {
        font-size: 0.87rem;
        color: var(--text-secondary, #94a3b8);
        max-width: 680px;
      }

      /* Section 1: 7 Principles Grid */
      .ethos-principles-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .ethos-principle-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 20px 22px;
        border-radius: 16px;
        background: var(--ethos-card);
        border: 1px solid var(--ethos-border);
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .ethos-principle-card:hover {
        transform: translateY(-2px);
        border-color: var(--ethos-card-accent, rgba(0, 242, 254, 0.35));
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.3);
      }

      .ethos-principle-card.is-pledged {
        border-color: rgba(16, 185, 129, 0.48);
        box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.18), 0 10px 24px rgba(16, 185, 129, 0.08);
      }

      .ethos-principle-card[data-accent="cyan"] { --ethos-card-accent: rgba(0, 242, 254, 0.45); }
      .ethos-principle-card[data-accent="gold"] { --ethos-card-accent: rgba(245, 158, 11, 0.45); }
      .ethos-principle-card[data-accent="purple"] { --ethos-card-accent: rgba(168, 85, 247, 0.45); }
      .ethos-principle-card[data-accent="emerald"] { --ethos-card-accent: rgba(16, 185, 129, 0.45); }

      .ethos-principle-card.is-wide {
        grid-column: 1 / -1;
        background:
          radial-gradient(circle at 96% 12%, rgba(168, 85, 247, 0.12) 0%, transparent 45%),
          var(--ethos-card);
      }

      .ethos-p-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }

      .ethos-p-badges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .ethos-p-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 10px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.82rem;
        font-weight: 800;
        color: #061224;
        background: linear-gradient(135deg, #fde68a, #f59e0b);
      }

      .ethos-p-arabic {
        font-size: 0.76rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--ethos-border);
        color: var(--text-secondary, #94a3b8);
      }

      .ethos-p-icon {
        font-size: 1.45rem;
        line-height: 1;
      }

      .ethos-p-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.07rem;
        font-weight: 700;
        line-height: 1.38;
        color: var(--text-primary, #f8fafc);
      }

      .ethos-p-quote {
        padding: 10px 14px;
        border-left: 3px solid var(--ethos-gold);
        border-radius: 0 10px 10px 0;
        background: rgba(245, 158, 11, 0.08);
        font-size: 0.85rem;
        font-style: italic;
        color: #fde68a;
      }

      .ethos-p-quote-src {
        display: block;
        margin-top: 3px;
        font-style: normal;
        font-size: 0.73rem;
        color: var(--text-secondary, #94a3b8);
      }

      .ethos-p-summary {
        font-size: 0.88rem;
        line-height: 1.62;
        color: var(--text-secondary, #cbd5e1);
      }

      .ethos-p-practices {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 11px 13px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .ethos-p-practices li {
        position: relative;
        padding-left: 18px;
        font-size: 0.82rem;
        line-height: 1.5;
        color: var(--text-secondary, #94a3b8);
      }

      .ethos-p-practices li::before {
        content: '◆';
        position: absolute;
        left: 0;
        top: 1px;
        font-size: 0.65rem;
        color: var(--ethos-cyan);
      }

      .ethos-p-foot {
        margin-top: auto;
        padding-top: 8px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .ethos-concept-links {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .ethos-concept-chip {
        padding: 4px 9px;
        border-radius: 9999px;
        border: 1px solid rgba(0, 242, 254, 0.25);
        background: rgba(0, 242, 254, 0.08);
        color: #67e8f9;
        font-size: 0.73rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .ethos-concept-chip:hover {
        background: rgba(0, 242, 254, 0.2);
        transform: translateY(-1px);
      }

      .ethos-pledge-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 9999px;
        border: 1px solid var(--ethos-border);
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-secondary, #cbd5e1);
        font-size: 0.76rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ethos-pledge-btn:hover {
        border-color: var(--ethos-emerald);
        color: #6ee7b7;
      }

      .ethos-pledge-btn.active {
        background: rgba(16, 185, 129, 0.2);
        border-color: var(--ethos-emerald);
        color: #6ee7b7;
      }

      /* Section 2: Lügat Controls */
      .ethos-toolbar {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--ethos-border);
      }

      .ethos-search-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
      }

      .ethos-search-wrap {
        position: relative;
        flex: 1 1 280px;
      }

      .ethos-search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.95rem;
        opacity: 0.7;
        pointer-events: none;
      }

      .ethos-search-input {
        width: 100%;
        padding: 11px 38px 11px 40px;
        border-radius: 12px;
        border: 1px solid var(--ethos-border);
        background: rgba(10, 15, 29, 0.78);
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, sans-serif);
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .ethos-search-input:focus {
        border-color: var(--ethos-cyan);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .ethos-search-clear {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        border: none;
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-secondary, #94a3b8);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 0.78rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .ethos-search-clear[hidden] {
        display: none;
      }

      .ethos-count-badge {
        padding: 7px 12px;
        border-radius: 10px;
        background: rgba(0, 242, 254, 0.1);
        border: 1px solid rgba(0, 242, 254, 0.25);
        color: var(--ethos-cyan);
        font-size: 0.8rem;
        font-weight: 700;
        white-space: nowrap;
      }

      .ethos-filters-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .ethos-filter-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 13px;
        border-radius: 9999px;
        border: 1px solid var(--ethos-border);
        background: rgba(30, 41, 59, 0.65);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .ethos-filter-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(0, 242, 254, 0.35);
      }

      .ethos-filter-btn.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.2));
        border-color: var(--ethos-cyan);
        color: #f8fafc;
        box-shadow: 0 4px 14px rgba(0, 242, 254, 0.14);
      }

      /* 24 Concept Cards Grid */
      .ethos-concepts-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .ethos-concept-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 20px;
        border-radius: 16px;
        background: var(--ethos-card);
        border: 1px solid var(--ethos-border);
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .ethos-concept-card:hover {
        border-color: rgba(0, 242, 254, 0.32);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
      }

      .ethos-concept-card.is-highlighted {
        animation: ethosPulseHighlight 1.6s ease;
        border-color: var(--ethos-gold);
      }

      @keyframes ethosPulseHighlight {
        0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6); }
        70% { box-shadow: 0 0 0 12px rgba(245, 158, 11, 0); }
        100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
      }

      .ethos-concept-card.is-ai-open {
        grid-column: 1 / -1;
        border-color: rgba(168, 85, 247, 0.55);
        background:
          radial-gradient(circle at 12% 0%, rgba(168, 85, 247, 0.14) 0%, transparent 45%),
          radial-gradient(circle at 90% 10%, rgba(0, 242, 254, 0.1) 0%, transparent 45%),
          var(--ethos-card);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.42);
      }

      .ethos-c-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }

      .ethos-c-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 7px;
      }

      .ethos-c-num {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.74rem;
        font-weight: 800;
        padding: 3px 8px;
        border-radius: 8px;
        background: rgba(0, 242, 254, 0.14);
        color: var(--ethos-cyan);
        border: 1px solid rgba(0, 242, 254, 0.25);
      }

      .ethos-c-cat {
        font-size: 0.72rem;
        font-weight: 600;
        padding: 3px 9px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.06);
        color: var(--text-secondary, #94a3b8);
        border: 1px solid var(--ethos-border);
      }

      .ethos-fav-btn {
        border: 1px solid var(--ethos-border);
        background: rgba(255, 255, 255, 0.04);
        color: var(--text-secondary, #94a3b8);
        width: 32px;
        height: 32px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 0.92rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.18s ease;
        flex-shrink: 0;
      }

      .ethos-fav-btn:hover {
        border-color: var(--ethos-gold);
        color: var(--ethos-gold);
      }

      .ethos-fav-btn.active {
        background: rgba(245, 158, 11, 0.18);
        border-color: rgba(245, 158, 11, 0.55);
        color: #fbbf24;
      }

      .ethos-c-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.24rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.25;
      }

      .ethos-c-root {
        font-size: 0.8rem;
        padding: 7px 11px;
        border-radius: 10px;
        background: rgba(245, 158, 11, 0.09);
        border: 1px solid rgba(245, 158, 11, 0.22);
        color: #fcd34d;
        line-height: 1.45;
      }

      .ethos-c-blocks {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .ethos-c-block {
        padding: 11px 13px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.52);
        border: 1px solid rgba(255, 255, 255, 0.07);
      }

      .ethos-c-block.is-modern {
        background: rgba(16, 185, 129, 0.07);
        border-color: rgba(16, 185, 129, 0.22);
      }

      .ethos-c-block-lbl {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 5px;
        color: var(--ethos-cyan);
      }

      .ethos-c-block.is-modern .ethos-c-block-lbl {
        color: #34d399;
      }

      .ethos-c-block p {
        font-size: 0.86rem;
        line-height: 1.58;
        color: var(--text-secondary, #cbd5e1);
      }

      .ethos-c-actions {
        margin-top: auto;
        padding-top: 4px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .ethos-ai-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 10px 16px;
        border-radius: 12px;
        border: 1px solid rgba(168, 85, 247, 0.42);
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.22), rgba(0, 242, 254, 0.16));
        color: #f8fafc;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.86rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ethos-ai-btn:hover {
        transform: translateY(-1px);
        border-color: var(--ethos-cyan);
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.34), rgba(0, 242, 254, 0.25));
        box-shadow: 0 8px 20px rgba(168, 85, 247, 0.22);
      }

      .ethos-ai-btn.is-active {
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.36), rgba(0, 242, 254, 0.26));
        border-color: var(--ethos-cyan);
      }

      /* Inline AI Reflection Drawer */
      .ethos-ai-drawer {
        margin-top: 4px;
        padding: 18px 20px;
        border-radius: 14px;
        background: rgba(10, 15, 29, 0.82);
        border: 1px solid rgba(168, 85, 247, 0.36);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .ethos-ai-drawer-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .ethos-ai-status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        font-weight: 700;
        color: #e9d5ff;
      }

      .ethos-pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ethos-cyan);
        box-shadow: 0 0 10px var(--ethos-cyan);
        animation: ethosPulse 1.1s infinite ease-in-out;
      }

      @keyframes ethosPulse {
        0%, 100% { opacity: 0.35; transform: scale(0.9); }
        50% { opacity: 1; transform: scale(1.2); }
      }

      .ethos-ai-drawer-tools {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .ethos-mini-btn {
        padding: 5px 11px;
        border-radius: 8px;
        border: 1px solid var(--ethos-border);
        background: rgba(255, 255, 255, 0.06);
        color: var(--text-primary, #f8fafc);
        font-size: 0.76rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .ethos-mini-btn:hover {
        border-color: var(--ethos-cyan);
        background: rgba(0, 242, 254, 0.12);
      }

      .ethos-ai-note {
        padding: 8px 12px;
        border-radius: 10px;
        font-size: 0.78rem;
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.28);
        color: #fde68a;
      }

      .ethos-ai-body {
        font-size: 0.92rem;
        line-height: 1.72;
        color: var(--text-primary, #f1f5f9);
      }

      .ethos-ai-body .seyyah-md-h1,
      .ethos-ai-body .seyyah-md-h2,
      .ethos-ai-body .seyyah-md-h3,
      .ethos-ai-body .seyyah-md-h4 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        color: var(--ethos-cyan);
        margin: 14px 0 6px;
        font-size: 1rem;
      }

      .ethos-ai-body .seyyah-md-h1:first-child,
      .ethos-ai-body .seyyah-md-h2:first-child,
      .ethos-ai-body .seyyah-md-h3:first-child {
        margin-top: 0;
      }

      .ethos-ai-body .seyyah-md-p {
        margin-bottom: 10px;
      }

      .ethos-ai-body .seyyah-md-list {
        margin: 6px 0 12px 18px;
      }

      .ethos-ai-body .seyyah-md-list li {
        margin-bottom: 5px;
      }

      .ethos-ai-body .seyyah-md-quote {
        margin: 12px 0 2px;
        padding: 10px 14px;
        border-left: 3px solid var(--ethos-gold);
        border-radius: 0 10px 10px 0;
        background: rgba(245, 158, 11, 0.08);
        color: #fde68a;
      }

      .ethos-stream-cursor {
        display: inline-block;
        width: 8px;
        height: 1.05em;
        margin-left: 3px;
        vertical-align: text-bottom;
        background: var(--ethos-cyan);
        animation: ethosBlink 0.8s steps(2, start) infinite;
      }

      @keyframes ethosBlink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }

      .ethos-empty {
        grid-column: 1 / -1;
        text-align: center;
        padding: 36px 20px;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.45);
        border: 1px dashed var(--ethos-border);
        color: var(--text-secondary, #94a3b8);
      }

      /* Light Theme Overrides */
      body.light-theme .ethos-studio {
        --ethos-surface: rgba(255, 255, 255, 0.92);
        --ethos-card: rgba(255, 255, 255, 0.96);
        --ethos-elevated: #f8fafc;
        --ethos-border: rgba(15, 23, 42, 0.11);
        --ethos-border-strong: rgba(2, 132, 199, 0.35);
        --ethos-gold: #d97706;
        --ethos-cyan: #0284c7;
        --ethos-emerald: #059669;
        --ethos-purple: #7c3aed;
      }

      body.light-theme .ethos-hero {
        background:
          radial-gradient(circle at 8% 15%, rgba(217, 119, 6, 0.1) 0%, transparent 46%),
          radial-gradient(circle at 92% 18%, rgba(2, 132, 199, 0.1) 0%, transparent 44%),
          #ffffff;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
      }

      body.light-theme .ethos-title {
        background: linear-gradient(125deg, #0f172a 0%, #b45309 50%, #0284c7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .ethos-stat-pill,
      body.light-theme .ethos-toolbar {
        background: #f8fafc;
      }

      body.light-theme .ethos-jump-btn {
        background: #f1f5f9;
        color: #0f172a;
      }

      body.light-theme .ethos-jump-btn.is-gold {
        color: #b45309;
      }

      body.light-theme .ethos-progress-track {
        background: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .ethos-principle-card,
      body.light-theme .ethos-concept-card {
        box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
      }

      body.light-theme .ethos-principle-card:hover,
      body.light-theme .ethos-concept-card:hover {
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.1);
      }

      body.light-theme .ethos-p-arabic,
      body.light-theme .ethos-c-cat {
        background: #f1f5f9;
        color: #475569;
      }

      body.light-theme .ethos-p-quote {
        background: rgba(217, 119, 6, 0.09);
        color: #92400e;
      }

      body.light-theme .ethos-p-summary,
      body.light-theme .ethos-p-practices li,
      body.light-theme .ethos-c-block p {
        color: #334155;
      }

      body.light-theme .ethos-p-practices,
      body.light-theme .ethos-c-block {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .ethos-c-block.is-modern {
        background: rgba(5, 150, 105, 0.07);
        border-color: rgba(5, 150, 105, 0.22);
      }

      body.light-theme .ethos-c-block.is-modern .ethos-c-block-lbl {
        color: #047857;
      }

      body.light-theme .ethos-concept-chip {
        background: rgba(2, 132, 199, 0.09);
        border-color: rgba(2, 132, 199, 0.26);
        color: #0369a1;
      }

      body.light-theme .ethos-pledge-btn {
        background: #f1f5f9;
        color: #334155;
      }

      body.light-theme .ethos-pledge-btn.active {
        background: rgba(5, 150, 105, 0.14);
        color: #047857;
      }

      body.light-theme .ethos-search-input {
        background: #ffffff;
        color: #0f172a;
      }

      body.light-theme .ethos-filter-btn {
        background: #ffffff;
        color: #334155;
      }

      body.light-theme .ethos-filter-btn.active {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.14), rgba(37, 99, 235, 0.12));
        color: #0f172a;
      }

      body.light-theme .ethos-c-root {
        background: rgba(217, 119, 6, 0.09);
        border-color: rgba(217, 119, 6, 0.24);
        color: #92400e;
      }

      body.light-theme .ethos-ai-btn {
        color: #4c1d95;
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(2, 132, 199, 0.12));
        border-color: rgba(124, 58, 237, 0.32);
      }

      body.light-theme .ethos-ai-btn:hover,
      body.light-theme .ethos-ai-btn.is-active {
        color: #ffffff;
        background: linear-gradient(135deg, #7c3aed, #0284c7);
      }

      body.light-theme .ethos-ai-drawer {
        background: #f8fafc;
        border-color: rgba(124, 58, 237, 0.3);
      }

      body.light-theme .ethos-ai-drawer-head {
        border-bottom-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .ethos-ai-status {
        color: #5b21b6;
      }

      body.light-theme .ethos-mini-btn {
        background: #ffffff;
        color: #0f172a;
      }

      body.light-theme .ethos-ai-note {
        background: rgba(217, 119, 6, 0.1);
        color: #92400e;
      }

      body.light-theme .ethos-ai-body {
        color: #1e293b;
      }

      body.light-theme .ethos-ai-body .seyyah-md-quote {
        background: rgba(217, 119, 6, 0.08);
        color: #92400e;
      }

      body.light-theme .ethos-empty {
        background: #f8fafc;
      }

      /* Responsive */
      @media (max-width: 920px) {
        .ethos-principles-grid,
        .ethos-concepts-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .ethos-hero,
        .ethos-section {
          padding: 18px 16px;
        }
        .ethos-principle-card,
        .ethos-concept-card {
          padding: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // Main Studio Renderer
  // =========================================================================
  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const esc = (ctx && typeof ctx.escapeHtml === 'function') ? ctx.escapeHtml : fallbackEscapeHtml;
    const norm = (ctx && typeof ctx.normalizeTurkish === 'function')
      ? function (s) { return fallbackNormalizeTr(ctx.normalizeTurkish(s)); }
      : fallbackNormalizeTr;
    const notify = function (msg) {
      if (ctx && typeof ctx.showToast === 'function') {
        ctx.showToast(msg);
      }
    };

    const stats = getTravelStats(ctx);
    const pledgedSet = loadStringSet(PLEDGE_STORAGE_KEY);
    const favSet = loadStringSet(FAVORITES_STORAGE_KEY);

    const uiState = {
      searchQuery: '',
      activeCategory: 'all',
      onlyFavorites: false,
      activeAiConceptId: null,
      aiStreaming: false,
      aiMarkdown: '',
      aiSourceLabel: '',
      aiNote: '',
      streamRunId: 0,
      offlineTimerId: null
    };

    const conceptMap = new Map();
    for (let i = 0; i < IRFAN_CONCEPTS.length; i++) {
      conceptMap.set(IRFAN_CONCEPTS[i].id, IRFAN_CONCEPTS[i]);
    }

    function cancelOngoingStream() {
      uiState.streamRunId += 1;
      uiState.aiStreaming = false;
      if (uiState.offlineTimerId) {
        clearTimeout(uiState.offlineTimerId);
        uiState.offlineTimerId = null;
      }
    }

    function getFilteredConcepts() {
      const q = norm(uiState.searchQuery);
      return IRFAN_CONCEPTS.filter(function (c) {
        if (uiState.onlyFavorites && !favSet.has(c.id)) return false;
        if (uiState.activeCategory !== 'all' && c.category !== uiState.activeCategory) return false;
        if (!q) return true;
        const haystack = norm(
          c.name + ' ' + c.root + ' ' + c.categoryLabel + ' ' + c.classical + ' ' + c.modern
        );
        return haystack.indexOf(q) !== -1;
      });
    }

    function renderPrincipleCardHtml(p, index) {
      const isPledged = pledgedSet.has(p.id);
      const isWide = index === ETHOS_PRINCIPLES.length - 1 ? ' is-wide' : '';
      const relatedHtml = (p.relatedConcepts || [])
        .map(function (cid) {
          const c = conceptMap.get(cid);
          if (!c) return '';
          return `<button type="button" class="ethos-concept-chip" data-jump-concept="${esc(c.id)}">📖 ${esc(c.name)}</button>`;
        })
        .join('');

      const practicesHtml = p.practices
        .map(function (item) {
          return `<li>${esc(item)}</li>`;
        })
        .join('');

      return `
        <article class="ethos-principle-card${isWide}${isPledged ? ' is-pledged' : ''}" data-accent="${esc(p.accent)}" data-principle-id="${esc(p.id)}">
          <div class="ethos-p-head">
            <div class="ethos-p-badges">
              <span class="ethos-p-num">${esc(p.num)}</span>
              <span class="ethos-p-arabic">${esc(p.arabicTag)}</span>
            </div>
            <span class="ethos-p-icon" aria-hidden="true">${esc(p.icon)}</span>
          </div>
          <h3 class="ethos-p-title">${esc(p.title)}</h3>
          <blockquote class="ethos-p-quote">
            ${esc(p.quote)}
            <span class="ethos-p-quote-src">— ${esc(p.quoteSource)}</span>
          </blockquote>
          <p class="ethos-p-summary">${esc(p.summary)}</p>
          <ul class="ethos-p-practices">${practicesHtml}</ul>
          <div class="ethos-p-foot">
            <div class="ethos-concept-links">${relatedHtml}</div>
            <button type="button" class="ethos-pledge-btn${isPledged ? ' active' : ''}" data-toggle-pledge="${esc(p.id)}">
              ${isPledged ? '✓ Ahde Alındı' : '⚖️ İlkeyi Ahde Al'}
            </button>
          </div>
        </article>
      `;
    }

    function renderAiDrawerHtml(concept) {
      if (uiState.activeAiConceptId !== concept.id) return '';
      const cursor = uiState.aiStreaming ? '<span class="ethos-stream-cursor" aria-hidden="true"></span>' : '';
      const statusText = uiState.aiStreaming
        ? `${concept.name} üzerine tefekkür akışı sürüyor...`
        : `${uiState.aiSourceLabel || 'İrfan Şerhi'} • ${concept.name}`;

      return `
        <div class="ethos-ai-drawer" data-ethos-ai-drawer>
          <div class="ethos-ai-drawer-head">
            <div class="ethos-ai-status">
              ${uiState.aiStreaming ? '<span class="ethos-pulse-dot" aria-hidden="true"></span>' : '<span>✨</span>'}
              <span>${esc(statusText)}</span>
            </div>
            <div class="ethos-ai-drawer-tools">
              ${uiState.aiStreaming
                ? '<button type="button" class="ethos-mini-btn" data-ai-stop>⏹️ Durdur</button>'
                : `<button type="button" class="ethos-mini-btn" data-ai-regen="${esc(concept.id)}">🔄 Yeniden Derinleştir</button>`}
              <button type="button" class="ethos-mini-btn" data-ai-copy>📋 Kopyala</button>
              <button type="button" class="ethos-mini-btn" data-ai-close>✕ Kapat</button>
            </div>
          </div>
          ${uiState.aiNote ? `<div class="ethos-ai-note">ℹ️ ${esc(uiState.aiNote)}</div>` : ''}
          <div class="ethos-ai-body" data-ethos-ai-body>
            ${renderMarkdownSafe(uiState.aiMarkdown, esc)}${cursor}
          </div>
        </div>
      `;
    }

    function renderConceptCardHtml(c) {
      const isFav = favSet.has(c.id);
      const isAiOpen = uiState.activeAiConceptId === c.id;
      return `
        <article class="ethos-concept-card${isAiOpen ? ' is-ai-open' : ''}" id="ethos-concept-${esc(c.id)}" data-concept-card="${esc(c.id)}">
          <div class="ethos-c-top">
            <div class="ethos-c-meta">
              <span class="ethos-c-num">#${esc(c.num)}</span>
              <span class="ethos-c-cat">${esc(c.categoryLabel)}</span>
            </div>
            <button type="button" class="ethos-fav-btn${isFav ? ' active' : ''}" data-toggle-fav="${esc(c.id)}" title="${isFav ? 'Favoriden Çıkar' : 'Kalbe Not Et (Favori)'}" aria-label="Favori">
              ${isFav ? '★' : '☆'}
            </button>
          </div>
          <h3 class="ethos-c-name">${esc(c.name)}</h3>
          <div class="ethos-c-root">🌿 <strong>Köken:</strong> ${esc(c.root)}</div>
          <div class="ethos-c-blocks">
            <div class="ethos-c-block">
              <span class="ethos-c-block-lbl">📜 Klasik Tasavvuf &amp; Felsefe Tanımı</span>
              <p>${esc(c.classical)}</p>
            </div>
            <div class="ethos-c-block is-modern">
              <span class="ethos-c-block-lbl">🎒 Modern Dijital Seyyah Pratiği</span>
              <p>${esc(c.modern)}</p>
            </div>
          </div>
          <div class="ethos-c-actions">
            <button type="button" class="ethos-ai-btn${isAiOpen ? ' is-active' : ''}" data-deepen-concept="${esc(c.id)}">
              ${isAiOpen && uiState.aiStreaming
                ? '⏳ İrfan Şerhi Akıyor...'
                : (isAiOpen ? '✨ Şerhi Açık / Yenile' : '✨ Bu Kavramı AI ile Derinleştir')}
            </button>
          </div>
          ${renderAiDrawerHtml(c)}
        </article>
      `;
    }

    // Build static shell once so search input keeps focus seamlessly
    container.innerHTML = `
      <div class="ethos-studio" id="ethos-studio-root">
        <header class="ethos-hero">
          <div class="ethos-hero-top">
            <div>
              <div class="ethos-eyebrow">⚖️ Fütüvvet, Rihle &amp; Kervansaray Medeniyeti</div>
              <h1 class="ethos-title">⚖️ Modern Derviş &amp; Dijital Seyyah Ahlâkı</h1>
              <p class="ethos-subtitle">
                <strong>Felsefe Külliyatı &amp; İrfan Lügatı</strong> — Anadolu'yu sırt çantasıyla, ilim disipliniyle ve Evliya Çelebi sorumluluğuyla arşınlayan seyyahın 7 temel ahlâk yasası ile 24 kurucu tasavvuf ve seyahat kavramı.
              </p>
            </div>
            <div class="ethos-hero-stats">
              <div class="ethos-stat-pill">
                <span class="ethos-stat-val">7 İlke</span>
                <span class="ethos-stat-lbl">Fütüvvet Yasası</span>
              </div>
              <div class="ethos-stat-pill">
                <span class="ethos-stat-val">24 Kavram</span>
                <span class="ethos-stat-lbl">İrfan Lügatı</span>
              </div>
              <div class="ethos-stat-pill">
                <span class="ethos-stat-val">${stats.visited}/${stats.total}</span>
                <span class="ethos-stat-lbl">Gezilen Menzil</span>
              </div>
            </div>
          </div>
          <div class="ethos-hero-nav">
            <div class="ethos-jump-group">
              <button type="button" class="ethos-jump-btn" data-scroll-target="#ethos-sec-principles">📜 7 Ahlâk İlkesi</button>
              <button type="button" class="ethos-jump-btn" data-scroll-target="#ethos-sec-lexicon">📖 24 Kavramlık Lügat</button>
              <button type="button" class="ethos-jump-btn is-gold" data-random-concept>🎲 Günün Hikmetini Çek</button>
            </div>
            <div class="ethos-pledge-bar">
              <span data-ethos-pledge-label>Ahid Bilinci: ${pledgedSet.size}/7</span>
              <div class="ethos-progress-track">
                <div class="ethos-progress-fill" data-ethos-pledge-fill style="width: ${Math.round((pledgedSet.size / 7) * 100)}%;"></div>
              </div>
            </div>
          </div>
        </header>

        <!-- Section 1 -->
        <section class="ethos-section" id="ethos-sec-principles">
          <div class="ethos-section-head">
            <div>
              <div class="ethos-section-kicker">Bölüm 01 • Fütüvvet &amp; Kervansaray Yasası</div>
              <h2 class="ethos-section-title">Dijital Seyyahın 7 Ahlâk İlkesi</h2>
              <p class="ethos-section-desc">
                Yola çıkmadan önce niyeti, yolda iken edebi, durakta iken ilim ve şükür hukukunu koruyan yedi temel düstur. Uyguladığın ilkeleri ahde alarak kendi seyyah bilincini takip edebilirsin.
              </p>
            </div>
          </div>
          <div class="ethos-principles-grid" data-ethos-principles-grid>
            ${ETHOS_PRINCIPLES.map(renderPrincipleCardHtml).join('')}
          </div>
        </section>

        <!-- Section 2 -->
        <section class="ethos-section" id="ethos-sec-lexicon">
          <div class="ethos-section-head">
            <div>
              <div class="ethos-section-kicker">Bölüm 02 • Kadim Kökler &amp; Çağdaş Pratik</div>
              <h2 class="ethos-section-title">İnteraktif İrfan &amp; Seyahat Kavramları Lügatı (24 Kavram)</h2>
              <p class="ethos-section-desc">
                Kavram adına, Arapça/Farsça kökenine veya modern pratiğine göre ara; kategorilere göre süz ve dilediğin kavramı yapay zekâ destekli felsefî tefekkür ile derinleştir.
              </p>
            </div>
          </div>

          <div class="ethos-toolbar">
            <div class="ethos-search-row">
              <div class="ethos-search-wrap">
                <span class="ethos-search-icon" aria-hidden="true">🔍</span>
                <input
                  type="search"
                  class="ethos-search-input"
                  data-ethos-search
                  placeholder="Kavram, köken, tanım veya pratik ara... (ör. sefer, kervansaray, tecerrüd, edep)"
                  aria-label="İrfan lügatında ara"
                />
                <button type="button" class="ethos-search-clear" data-ethos-clear hidden aria-label="Aramayı temizle">✕</button>
              </div>
              <span class="ethos-count-badge" data-ethos-count>24 / 24 kavram</span>
            </div>
            <div class="ethos-filters-row" data-ethos-filters>
              ${CONCEPT_CATEGORIES.map(function (cat) {
                const count = cat.id === 'all'
                  ? IRFAN_CONCEPTS.length
                  : IRFAN_CONCEPTS.filter(function (c) { return c.category === cat.id; }).length;
                return `<button type="button" class="ethos-filter-btn${cat.id === 'all' ? ' active' : ''}" data-ethos-cat="${esc(cat.id)}">${esc(cat.icon)} ${esc(cat.label)} (${count})</button>`;
              }).join('')}
              <button type="button" class="ethos-filter-btn" data-ethos-fav-filter>★ Favoriler (<span data-ethos-fav-count>${favSet.size}</span>)</button>
            </div>
          </div>

          <div class="ethos-concepts-grid" data-ethos-concepts-grid>
            ${IRFAN_CONCEPTS.map(renderConceptCardHtml).join('')}
          </div>
        </section>
      </div>
    `;

    const rootEl = container.querySelector('#ethos-studio-root');
    const principlesGridEl = container.querySelector('[data-ethos-principles-grid]');
    const conceptsGridEl = container.querySelector('[data-ethos-concepts-grid]');
    const searchInputEl = container.querySelector('[data-ethos-search]');
    const clearBtnEl = container.querySelector('[data-ethos-clear]');
    const countBadgeEl = container.querySelector('[data-ethos-count]');
    const pledgeLabelEl = container.querySelector('[data-ethos-pledge-label]');
    const pledgeFillEl = container.querySelector('[data-ethos-pledge-fill]');
    const favCountEl = container.querySelector('[data-ethos-fav-count]');

    function refreshPledgeUi() {
      if (pledgeLabelEl) pledgeLabelEl.textContent = `Ahid Bilinci: ${pledgedSet.size}/7`;
      if (pledgeFillEl) pledgeFillEl.style.width = `${Math.round((pledgedSet.size / 7) * 100)}%`;
      if (principlesGridEl) {
        principlesGridEl.innerHTML = ETHOS_PRINCIPLES.map(renderPrincipleCardHtml).join('');
      }
    }

    function refreshFilterButtons() {
      const catBtns = rootEl.querySelectorAll('[data-ethos-cat]');
      for (let i = 0; i < catBtns.length; i++) {
        const btn = catBtns[i];
        btn.classList.toggle('active', btn.getAttribute('data-ethos-cat') === uiState.activeCategory && !uiState.onlyFavorites);
      }
      const favBtn = rootEl.querySelector('[data-ethos-fav-filter]');
      if (favBtn) favBtn.classList.toggle('active', uiState.onlyFavorites);
      if (favCountEl) favCountEl.textContent = String(favSet.size);
    }

    function refreshConceptsGrid() {
      const filtered = getFilteredConcepts();
      if (countBadgeEl) {
        countBadgeEl.textContent = `${filtered.length} / ${IRFAN_CONCEPTS.length} kavram`;
      }
      if (!conceptsGridEl) return;
      if (filtered.length === 0) {
        conceptsGridEl.innerHTML = `
          <div class="ethos-empty">
            <p style="font-size: 1.05rem; font-weight: 700; margin-bottom: 6px;">Aranan ölçüde kavram bulunamadı.</p>
            <p style="font-size: 0.86rem; margin-bottom: 12px;">Arama kelimesini değiştirebilir veya filtreyi sıfırlayabilirsin.</p>
            <button type="button" class="ethos-jump-btn" data-reset-filters>Tüm 24 Kavramı Göster</button>
          </div>
        `;
        return;
      }
      conceptsGridEl.innerHTML = filtered.map(renderConceptCardHtml).join('');
    }

    function updateAiBodyOnly() {
      const bodyEl = rootEl.querySelector('[data-ethos-ai-body]');
      if (!bodyEl) {
        refreshConceptsGrid();
        return;
      }
      const cursor = uiState.aiStreaming ? '<span class="ethos-stream-cursor" aria-hidden="true"></span>' : '';
      bodyEl.innerHTML = renderMarkdownSafe(uiState.aiMarkdown, esc) + cursor;
    }

    function streamOfflineReflection(concept, runId, noteMsg) {
      uiState.aiStreaming = true;
      uiState.aiMarkdown = '';
      uiState.aiSourceLabel = '📜 Yerleşik İrfan Külliyatı (Çevrimdışı)';
      uiState.aiNote = noteMsg || '';
      refreshConceptsGrid();

      const fullText = concept.offlineDeep;
      const tokens = fullText.match(/\S+\s*/g) || [fullText];
      let idx = 0;
      const stepSize = Math.max(2, Math.ceil(tokens.length / 75));

      function tick() {
        if (uiState.streamRunId !== runId || !document.body.contains(rootEl)) return;
        uiState.aiMarkdown += tokens.slice(idx, idx + stepSize).join('');
        idx += stepSize;
        updateAiBodyOnly();
        if (idx < tokens.length) {
          uiState.offlineTimerId = setTimeout(tick, 28);
        } else {
          uiState.offlineTimerId = null;
          uiState.aiStreaming = false;
          refreshConceptsGrid();
        }
      }

      uiState.offlineTimerId = setTimeout(tick, 24);
    }

    async function deepenConceptWithAi(conceptId, bypassCache) {
      const concept = conceptMap.get(conceptId);
      if (!concept) return;

      cancelOngoingStream();
      const runId = uiState.streamRunId;

      uiState.activeAiConceptId = concept.id;
      uiState.aiStreaming = true;
      uiState.aiMarkdown = '';
      uiState.aiNote = '';
      uiState.aiSourceLabel = '⚡ SEYYAH_AI Tefekkür Akışı';
      refreshConceptsGrid();

      // Scroll smoothly to the opened card
      const cardEl = document.getElementById(`ethos-concept-${concept.id}`);
      if (cardEl && typeof cardEl.scrollIntoView === 'function') {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      const ai = typeof window !== 'undefined' ? window.SEYYAH_AI : null;
      const hasAiStream = Boolean(ai && typeof ai.stream === 'function');
      const hasKey = Boolean(ai && typeof ai.hasKey === 'function' && ai.hasKey());

      if (!hasAiStream || !hasKey) {
        const note = !hasAiStream
          ? 'SEYYAH_AI motoru bulunamadığı için yerleşik irfan külliyatı şerhi akıtıldı.'
          : 'Gemini API anahtarı yapılandırılmadığı için yerleşik irfan külliyatı şerhi akıtıldı.';
        streamOfflineReflection(concept, runId, note);
        return;
      }

      const anatoliaSummary = typeof ai.buildAnatoliaContext === 'function'
        ? ai.buildAnatoliaContext(ctx)
        : `Seyahat İlerlemesi: ${stats.visited}/${stats.total} il gezildi.`;

      const systemPrompt = [
        'Sen Anadolu irfanını, tasavvuf felsefesini, Evliya Çelebi Seyahatnamesini ve modern dijital seyyahlık kültürünü derinden bilen bilge bir mütefekkirsin.',
        'Üslubun edebi, duru, hikmetli, sade Türkçe ile derinlikli ve asla yapay ya da klişe olmayan bir tonda olmalı.',
        'Yanıtını yalnızca geçerli Türkçe Markdown başlıklarıyla (###) yapılandır.'
      ].join(' ');

      const userPrompt = [
        `Lütfen "${concept.name}" kavramını modern bir Dijital Seyyah için derinlemesine şerh et.`,
        `Kavramın Kökeni: ${concept.root}`,
        `Klasik Tanım: ${concept.classical}`,
        `Modern Pratik: ${concept.modern}`,
        `Seyyahın Güncel Bağlamı: ${anatoliaSummary}`,
        '',
        'Şu 4 bölümle zengin bir felsefî tefekkür yaz (toplam 240-340 kelime):',
        '### 1. Köken & Tasavvufî Derinlik',
        '### 2. Anadolu Coğrafyasıyla Bağı (Somut bir şehir/menzil misali ver)',
        '### 3. Dijital Seyyahın Yoldaki Pratiği (2 somut alışkanlık)',
        '### 4. Kalbe Düşen Tefekkür Sorusu (blockquote > formatında tek vurucu soru)'
      ].join('\n');

      try {
        const res = await ai.stream({
          prompt: userPrompt,
          system: systemPrompt,
          cacheKey: bypassCache ? undefined : `ethos:concept:${concept.id}:v1`,
          temperature: 0.76,
          maxTokens: 1500,
          onChunk: function (_delta, fullText) {
            if (uiState.streamRunId !== runId || !document.body.contains(rootEl)) return;
            if (typeof fullText === 'string' && fullText.length > 0) {
              uiState.aiMarkdown = fullText;
              updateAiBodyOnly();
            }
          }
        });

        if (uiState.streamRunId !== runId || !document.body.contains(rootEl)) return;
        const finalText = (res && res.text) ? String(res.text).trim() : uiState.aiMarkdown.trim();
        if (!finalText) {
          streamOfflineReflection(concept, runId, 'AI boş yanıt döndürdüğü için yerleşik irfan külliyatına geçildi.');
          return;
        }
        uiState.aiMarkdown = finalText;
        uiState.aiStreaming = false;
        uiState.aiSourceLabel = res && res.model
          ? `⚡ SEYYAH_AI (${res.model}${res.cached ? ' • Önbellek' : ''})`
          : '⚡ SEYYAH_AI';
        refreshConceptsGrid();
      } catch (err) {
        if (uiState.streamRunId !== runId || !document.body.contains(rootEl)) return;
        const errMsg = err && err.message ? err.message : 'bağlantı hatası';
        streamOfflineReflection(
          concept,
          runId,
          `Canlı AI akışı kullanılamadı (${errMsg}); yerleşik irfan külliyatı akıtıldı.`
        );
      }
    }

    function jumpToConcept(conceptId) {
      if (!conceptMap.has(conceptId)) return;
      uiState.searchQuery = '';
      uiState.activeCategory = 'all';
      uiState.onlyFavorites = false;
      if (searchInputEl) searchInputEl.value = '';
      if (clearBtnEl) clearBtnEl.hidden = true;
      refreshFilterButtons();
      refreshConceptsGrid();

      const targetCard = document.getElementById(`ethos-concept-${conceptId}`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.remove('is-highlighted');
        void targetCard.offsetWidth;
        targetCard.classList.add('is-highlighted');
      }
    }

    // Event Listeners
    if (searchInputEl) {
      searchInputEl.addEventListener('input', function () {
        uiState.searchQuery = searchInputEl.value || '';
        if (clearBtnEl) clearBtnEl.hidden = uiState.searchQuery.length === 0;
        refreshConceptsGrid();
      });
    }

    if (clearBtnEl) {
      clearBtnEl.addEventListener('click', function () {
        uiState.searchQuery = '';
        if (searchInputEl) {
          searchInputEl.value = '';
          searchInputEl.focus();
        }
        clearBtnEl.hidden = true;
        refreshConceptsGrid();
      });
    }

    rootEl.addEventListener('click', function (e) {
      const target = e.target;
      if (!target || !target.closest) return;

      const scrollBtn = target.closest('[data-scroll-target]');
      if (scrollBtn) {
        const sel = scrollBtn.getAttribute('data-scroll-target');
        const el = sel ? rootEl.querySelector(sel) : null;
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      const randomBtn = target.closest('[data-random-concept]');
      if (randomBtn) {
        const pick = IRFAN_CONCEPTS[Math.floor(Math.random() * IRFAN_CONCEPTS.length)];
        if (pick) {
          jumpToConcept(pick.id);
          notify(`🎲 Günün Hikmeti: ${pick.name}`);
        }
        return;
      }

      const jumpBtn = target.closest('[data-jump-concept]');
      if (jumpBtn) {
        jumpToConcept(jumpBtn.getAttribute('data-jump-concept'));
        return;
      }

      const pledgeBtn = target.closest('[data-toggle-pledge]');
      if (pledgeBtn) {
        const pid = pledgeBtn.getAttribute('data-toggle-pledge');
        if (pledgedSet.has(pid)) {
          pledgedSet.delete(pid);
          notify('İlke ahid listesinden çıkarıldı.');
        } else {
          pledgedSet.add(pid);
          notify('⚖️ İlke Seyyah Ahdi olarak işaretlendi!');
        }
        saveStringSet(PLEDGE_STORAGE_KEY, pledgedSet);
        refreshPledgeUi();
        return;
      }

      const catBtn = target.closest('[data-ethos-cat]');
      if (catBtn) {
        uiState.onlyFavorites = false;
        uiState.activeCategory = catBtn.getAttribute('data-ethos-cat') || 'all';
        refreshFilterButtons();
        refreshConceptsGrid();
        return;
      }

      const favFilterBtn = target.closest('[data-ethos-fav-filter]');
      if (favFilterBtn) {
        uiState.onlyFavorites = !uiState.onlyFavorites;
        refreshFilterButtons();
        refreshConceptsGrid();
        return;
      }

      const resetBtn = target.closest('[data-reset-filters]');
      if (resetBtn) {
        uiState.searchQuery = '';
        uiState.activeCategory = 'all';
        uiState.onlyFavorites = false;
        if (searchInputEl) searchInputEl.value = '';
        if (clearBtnEl) clearBtnEl.hidden = true;
        refreshFilterButtons();
        refreshConceptsGrid();
        return;
      }

      const favToggleBtn = target.closest('[data-toggle-fav]');
      if (favToggleBtn) {
        const cid = favToggleBtn.getAttribute('data-toggle-fav');
        if (favSet.has(cid)) {
          favSet.delete(cid);
        } else {
          favSet.add(cid);
          notify('★ Kavram favorilerine kaydedildi.');
        }
        saveStringSet(FAVORITES_STORAGE_KEY, favSet);
        refreshFilterButtons();
        refreshConceptsGrid();
        return;
      }

      const deepenBtn = target.closest('[data-deepen-concept]');
      if (deepenBtn) {
        const cid = deepenBtn.getAttribute('data-deepen-concept');
        deepenConceptWithAi(cid, false);
        return;
      }

      const regenBtn = target.closest('[data-ai-regen]');
      if (regenBtn) {
        const cid = regenBtn.getAttribute('data-ai-regen');
        deepenConceptWithAi(cid, true);
        return;
      }

      const stopBtn = target.closest('[data-ai-stop]');
      if (stopBtn) {
        cancelOngoingStream();
        refreshConceptsGrid();
        notify('⏹️ Tefekkür akışı durduruldu.');
        return;
      }

      const copyBtn = target.closest('[data-ai-copy]');
      if (copyBtn) {
        const activeConcept = conceptMap.get(uiState.activeAiConceptId);
        const textToCopy = activeConcept
          ? `${activeConcept.name}\n\n${uiState.aiMarkdown}`
          : uiState.aiMarkdown;
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard.writeText(textToCopy).then(
            function () { notify('📋 Tefekkür metni panoya kopyalandı.'); },
            function () { notify('Kopyalama desteklenmedi.'); }
          );
        }
        return;
      }

      const closeBtn = target.closest('[data-ai-close]');
      if (closeBtn) {
        cancelOngoingStream();
        uiState.activeAiConceptId = null;
        uiState.aiMarkdown = '';
        uiState.aiNote = '';
        refreshConceptsGrid();
      }
    });
  }

  window.SEYYAH_MODULES.ethos = {
    render: render
  };
})();
