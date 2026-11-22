/**
 * Anadolu Seyahatnamesi — Halvet & Tefekkür Odası (Sükûnet, Nefes & Hikmet Stüdyosu)
 * Immersive contemplation sanctuary featuring:
 *   1. Animated SVG Sacred Seljuk 8-Pointed Star (Selçuklu Yıldızı & Hendesesi) breathing guide
 *      with toggleable rhythm (default: 4 sn Nefes Al • 4 sn Tut • 6 sn Yavaşça Ver).
 *   2. 1-click "Tasavvufi Ney Taksimi Aç / Kapat" integrating with #btn-ambient / assets/ney_tasavvuf.mp3.
 *   3. Curated "Hikmet Külliyatı" rotator with 18 deep classical texts, citations & commentary.
 *   4. "Gemini AI ile Derin Tefekkür" streaming meditation across 5 themes + personal reflection
 *      persistence into localStorage ('dijital_seyyah_journal_entries').
 *
 * Registers on: window.SEYYAH_MODULES.halvet = { render(container, ctx), stop() }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-halvet-styles';
  const JOURNAL_ENTRIES_STORAGE = 'dijital_seyyah_journal_entries';
  const HALVET_MINUTES_STORAGE = 'dijital_seyyah_halvet_minutes_v1';
  const GEMINI_KEY_STORAGE = 'dijital_seyyah_gemini_api_key';
  const GEMINI_MODEL_STORAGE = 'dijital_seyyah_gemini_model';
  const NEY_AUDIO_SRC = 'assets/ney_tasavvuf.mp3';

  // ---------------------------------------------------------------------------
  // 3 Breathing Cadence Modes
  // ---------------------------------------------------------------------------
  const BREATH_RHYTHMS = [
    {
      id: 'kutu-4444',
      label: '4-4-4-4 Kutu Nefesi',
      tagline: '4 sn Nefes Al • 4 sn Tut • 4 sn Yavaşça Ver • 4 sn Sükûtta Kal',
      inhale: 4,
      hold: 4,
      exhale: 4,
      holdAfter: 4
    },
    {
      id: 'sukunet-478',
      label: '4-7-8 Sükûnet Nefesi',
      tagline: '4 sn Nefes Al • 7 sn Tut • 8 sn Yavaşça Ver',
      inhale: 4,
      hold: 7,
      exhale: 8,
      holdAfter: 0
    },
    {
      id: 'dergah-626',
      label: '6-2-6 Dergâh Ritim Nefesi',
      tagline: '6 sn Nefes Al • 2 sn Tut • 6 sn Yavaşça Ver',
      inhale: 6,
      hold: 2,
      exhale: 6,
      holdAfter: 0
    }
  ];

  // ---------------------------------------------------------------------------
  // Curated "Hikmet Külliyatı" (18 Classical Texts)
  // ---------------------------------------------------------------------------
  const HIKMET_CORPUS = [
    {
      id: 'ankabut-20',
      category: "Kur'an-ı Kerim",
      author: "Kur'an-ı Kerim",
      source: 'Ankebût Suresi • 20. Ayet',
      text: 'De ki: Yeryüzünde gezip dolaşın da Allah’ın yaratmaya nasıl başladığına bir bakın; sonra Allah ahiret hayatını da inşa edecektir. Şüphesiz Allah her şeye kadirdir.',
      commentary: 'Seyahat yalnızca mekân değiştirmek değil, kâinat kitabının sahifelerini ibret ve hayret nazarıyla okumaktır. Her şehir ve her coğrafya, yaratılışın başka bir imzasını taşır.'
    },
    {
      id: 'hacc-46',
      category: "Kur'an-ı Kerim",
      author: "Kur'an-ı Kerim",
      source: 'Hacc Suresi • 46. Ayet',
      text: 'Yeryüzünde hiç dolaşmadılar mı ki, kendileriyle akledecek kalpleri ve kendileriyle işitecek kulakları olsun! Gerçek şu ki gözler kör olmaz, fakat göğüslerin içindeki kalpler kör olur.',
      commentary: 'Yolculuğun asıl organı ayak değil kalptir. Kalp uyanık olmadıkça bin menzil aşmak sığ bir gezi kalır; kalp açık olduğunda ise tek bir taş avlu bütün bir tarihi fısıldar.'
    },
    {
      id: 'hadis-seyahat',
      category: 'Hadis-i Şerif',
      author: 'Hz. Muhammed (s.a.v.)',
      source: 'Hadis-i Şerif • Ahmed b. Hanbel, Müsned (Ebû Hüreyre r.a.)',
      text: 'Yolculuk ediniz ki sıhhat bulasınız (ve rızkınız genişlesin).',
      commentary: 'Hareket, bedendeki durgunluğu çözdüğü gibi zihindeki pası da siler. Yeni ufuklara açılmak, ülfet perdesini aralayarak ruha yeniden tazelik kazandırır.'
    },
    {
      id: 'hadis-tefekkur',
      category: 'Hadis-i Şerif',
      author: 'Hz. Muhammed (s.a.v.)',
      source: 'Hadis-i Şerif • Beyhakî, Şuabü’l-Îmân & Taberânî (İbn Abbas r.a.)',
      text: 'Allah’ın yarattığı nimet ve kudret eserleri üzerinde derin derin tefekkür ediniz; ancak O’nun zâtının mahiyetini kuşatmaya kalkışmayınız.',
      commentary: 'İslâm irfanında tefekkür, aklın sınırlarını bilerek varlığın inceliklerine eğilmesidir. Bir gölün sükûnetini, bir dağın heybetini veya bir kütüphane sessizliğini izlemek kalbî tefekkürün kapısıdır.'
    },
    {
      id: 'ibn-arabi-sefer',
      category: 'İrfan & Tasavvuf',
      author: 'Muhyiddîn İbnü’l-Arabî',
      source: 'Fütûhât-ı Mekkiyye • Sefer ve İsfâr Bahsi',
      text: '“Sefer” kelimesi, örtüyü açmak ve hakikati ortaya çıkarmak anlamındaki “isfâr” kökünden gelir; çünkü yolculuk, yolcunun kendi içindeki gizli ahlâk ve hakikatleri açığa çıkarır.',
      commentary: 'İnsanın alışkanlıklarından sıyrıldığı yol hâli, kendisiyle yüzleştiği en duru aynadır. Dışarıda aşılan her geçit, içerideki bir perdenin kalkmasına vesile olur.'
    },
    {
      id: 'ibn-arabi-kalp',
      category: 'İrfan & Tasavvuf',
      author: 'Muhyiddîn İbnü’l-Arabî',
      source: 'Fusûsu’l-Hikem • Şuayb Kelimesindeki Hikmet',
      text: 'Kalp, şekilden şekle ve hâlden hâle dönüp durduğu için “kalp” adını almıştır; hakikati arayan kişi onu tek bir kalıba hapsetmez, her tecellîde yeniden hayrete düşer.',
      commentary: 'Seyyahın kalbi ön yargılardan arındıkça her şehrin, her mevsime ve her sese özgü ayrı bir güzelliği taşıdığını idrak eder.'
    },
    {
      id: 'mevlana-ney',
      category: 'İrfan & Tasavvuf',
      author: 'Mevlânâ Celâleddîn-i Rûmî',
      source: 'Mesnevî-i Şerîf • Cilt I, Beyit 1–4',
      text: 'Dinle bu neyden, neler hikâyet eyler; ayrılıklardan nasıl şikâyet eyler: “Beni kamışlıktan kestiklerinden beri, feryadımdan kadın erkek herkes ağlayıp inledi.”',
      commentary: 'Neyin içi boşaltıldığı için ses verir; insan da kibir ve fazlalıklardan arındığı ölçüde hakikat nefesinin geçeceği berrak bir kamışa dönüşür.'
    },
    {
      id: 'mevlana-ic-alem',
      category: 'İrfan & Tasavvuf',
      author: 'Mevlânâ Celâleddîn-i Rûmî',
      source: 'Mesnevî-i Şerîf • Cilt IV & Dîvân-ı Kebîr',
      text: 'Dışarıdan bakınca küçük bir cüz gibi görünürsün; hâlbuki senin içinde en büyük âlem dürülmüştür. Düşüncen güldür, sen gül bahçesisin; diken olan ise sadece vehmindir.',
      commentary: 'Gurbet ve sükûnet anlarında zihin susup gönül dinlemeye başladığında, insan kendi içindeki geniş Anadolu’yu ve kâinatı keşfeder.'
    },
    {
      id: 'yunus-ilim',
      category: 'Anadolu İrfanı',
      author: 'Yunus Emre',
      source: 'Divân-ı Yunus Emre • İlim İlim Bilmektir',
      text: 'İlim ilim bilmektir, ilim kendin bilmektir; sen kendini bilmezsin, ya nice okumaktır.',
      commentary: 'Kütüphanelerde okunan her satır ve gidilen her belde, insanı kendi hakikatine yaklaştırdığı nispette ilim olur. Kendini bilmeyen seyyah yalnızca mesafe biriktirir.'
    },
    {
      id: 'yunus-gonul',
      category: 'Anadolu İrfanı',
      author: 'Yunus Emre',
      source: 'Divân-ı Yunus Emre • Ben Gelmedim Da’vî İçin',
      text: 'Ben gelmedim da’vî için, benim işim sevi için; dostun evi gönüllerdir, gönüller yapmaya geldim.',
      commentary: 'Anadolu’yu mayalayan derviş seyyahların yolu kavga ve tahakküm değil, gönül imarıdır. Bir şehri gerçekten tanımak, o şehrin insanının gönül kapısına incelikle dokunmaktır.'
    },
    {
      id: 'safii-bes-fayda',
      category: 'Hikmet & Şiir',
      author: 'İmam Şâfiî',
      source: 'Divân-ı Şâfiî • Tagarrüb (Gurbete Çıkış) Kasidesi',
      text: 'Yücelmek için yurdundan ayrılıp sefere çık; zira yolculukta beş büyük fayda vardır: kederin dağılması, geçim imkânı, ilim kazanmak, edep öğrenmek ve asil dostluklar kurmak.',
      commentary: 'Klasik İslâm düşüncesinde yolculuk bir kaçış değil, bir olgunlaşma mektebidir. Gurbet, insanın hem ufkunu genişletir hem de kime ve neye değer vermesi gerektiğini öğretir.'
    },
    {
      id: 'safii-akan-su',
      category: 'Hikmet & Şiir',
      author: 'İmam Şâfiî',
      source: 'Divân-ı Şâfiî • Su ve İzzet Metaforu',
      text: 'Ben suların durgun hâlini gördüm; yerinde kalıp duran su bozulur ve bulanır. Eğer akar giderse arınıp güzelleşir; yerinde kalırsa diriliğini kaybeder.',
      commentary: 'Taze nefes ve yeni menzil arayışı insan ruhunu diri tutar. Akış hâlindeki seyyah, zamanın ve mekânın içinde berraklaşan bir ırmak gibidir.'
    },
    {
      id: 'attar-simurg',
      category: 'İrfan & Tasavvuf',
      author: 'Ferîdüddin Attâr',
      source: 'Mantıku’t-Tayr • Yedi Vadi ve Otuz Kuş',
      text: 'Yedi çetin vadiyi aşmadan Kaf Dağı’ndaki Sîmurg’a varılmaz; fakat menzile ulaştıklarında anladılar ki aradıkları Sîmurg, o yolu aşan otuz kuşun bizzat kendisiymiş.',
      commentary: 'Yolun sonunda insanın bulduğu en büyük hazine, yol boyunca dönüştüğü kendi özüdür. Varmaktan çok, yolda pişmek esastır.'
    },
    {
      id: 'attar-sessizlik',
      category: 'İrfan & Tasavvuf',
      author: 'Ferîdüddin Attâr',
      source: 'Tezkiretü’l-Evliyâ • Sükût ve Murâkabe',
      text: 'Gönlünü dünyevî gürültü ve telâştan boşaltmayan kimse, sessizliğin derinliklerinden yükselen ince hikmet sesini işitemez.',
      commentary: 'Halvet, kalabalıktan nefret etmek değil; zihni dağıtan sesleri kısarak içsel işitme melekesini yeniden keskinleştirmektir.'
    },
    {
      id: 'ibn-haldun-cografya',
      category: 'Hikmet & Tarih',
      author: 'İbn Haldûn',
      source: 'Mukaddime • Üçüncü & Dördüncü Mukaddime (Umran ve İklim)',
      text: 'İklim, toprak ve coğrafya yalnızca insanın bedenini değil; mizacını, neşesini, şehirlerinin mimarisini ve medeniyet kurma biçimini de derinden şekillendirir.',
      commentary: 'Anadolu’nun yedi bölgesini gezen seyyah, dağ ile ovanın, deniz ile bozkırın insan karakterine nasıl yansıdığını doğrudan müşahede eder.'
    },
    {
      id: 'ibn-haldun-rihle',
      category: 'Hikmet & Tarih',
      author: 'İbn Haldûn',
      source: 'Mukaddime • Altıncı Bölüm (İlim İçin Yapılan Rıhle)',
      text: 'İlim tahsili için yolculuk yapmak (rıhle) ve farklı şehirlerin âlimleriyle görüşmek, kişinin bilgisini kemâle erdirir; zira insan tek bir çevrenin kalıbından kurtulup hakikati yerinde görür.',
      commentary: 'İl Halk Kütüphanelerinde geçirilen saatler ile şehirler arası yapılan rıhle birleştiğinde, kitaptaki bilgi yaşanmış tecrübeye dönüşür.'
    },
    {
      id: 'evliya-celebi',
      category: 'Seyahat Edebiyatı',
      author: 'Evliya Çelebi',
      source: 'Seyahatnâme • Cilt I (Rüya ve Seyahat Ahdi)',
      text: 'Heyecandan “Şefâat yâ Resûlallah!” diyecek yerde sehven “Seyahat yâ Resûlallah!” dedim. Bunun üzerine sıhhat ve âfiyetle yedi iklimi ibret ve muhabbetle gezip yazmak nasip oldu.',
      commentary: 'Evliya Çelebi’nin seyyahlığı merak ile edebî zarafetin, tarih ile gündelik hayatın birleşimidir. Bir şehrin taşını olduğu kadar duasını, türküsünü ve sofrasını da kayda geçirir.'
    },
    {
      id: 'niyazi-misri',
      category: 'Anadolu İrfanı',
      author: 'Niyâzî-i Mısrî',
      source: 'Divân-ı İlâhîyât • Deryâ İçre Mâhî',
      text: 'Deryâ içre mâhîler su nedir bilmediler; halk içinde bî-nişân ol, su içinde suyu ara ve kendi gönül deryâna dal.',
      commentary: 'İnsan çoğu kez aradığı huzuru uzak kıtalarda zanneder; oysa aranan sükûnet, tam da şu an nefes alıp verdiği ânın kalbinde gizlidir.'
    }
  ];

  // ---------------------------------------------------------------------------
  // 5 Gemini AI Contemplation Themes + Rich Offline Fallback Meditations
  // ---------------------------------------------------------------------------
  const TEFEKKUR_THEMES = [
    {
      id: 'gurbet-vatan',
      icon: '🌍',
      title: 'Gurbet ve Vatan',
      subtitle: 'İnsan nereye giderse gitsin içinde taşıdığı vatan ve yabancılaşmadan arınan gönül.',
      promptFocus: 'gurbet hissi, Anadolu topraklarında aidiyet, İbnü’l-Arabî’nin "sefer" anlayışı ve asıl vatanın kalp sükûneti olması',
      offlineText: `### 🌍 Gurbet ve Vatan Üzerine Bir Halvet Tefekkürü

İmam Şâfiî’nin dediği gibi, insan yurdundan yalnızca uzaklaşmak için değil; üzerindeki ülfet tozunu silkelemek ve kendi özüne yeni bir pencereden bakmak için yola çıkar. Yabancı bir şehrin taş sokağında akşam ezanını dinlerken duyulan o tatlı sızı, aslında ruhun kendi asıl vatanına duyduğu hasrettir.

- **Dış âlemde gurbet, iç âlemde vuslat:** Haritada katettiğin her kilometre, sana nerede olursan ol gökyüzünün aynı rahmetle üzerini örttüğünü hatırlatır.
- **Misafirlik bilinci:** Bu dünyada bir otel odasında, bir kütüphane köşesinde ya da bir dağ geçidinde konaklamak; hiçbir mekânı mülk edinmeden her mekânı emanet bilmektir.

> *"Vatan; ayaklarının bastığı yerden önce, kalbinin sükûnete erdiği ve hayretle nefes aldığı yerdir."*

Şimdi derin bir nefes al; bulunduğun şehir neresi olursa olsun, o anın sana emanet edilmiş bir menzil olduğunu hisset.`
    },
    {
      id: 'sessizlik-kalp',
      icon: '🕯️',
      title: 'Sessizlik ve Kalp',
      subtitle: 'Kelâmın sustuğu yerde başlayan ince işitme ve kalbin berraklaşması.',
      promptFocus: 'sükûtun hikmeti, nefesle zihni durultma, Attâr ve Mevlânâ geleneğinde kalbin ayna gibi parlaması',
      offlineText: `### 🕯️ Sessizlik ve Kalp Üzerine Bir Halvet Tefekkürü

Gündelik hayatın telaşı kalbin yüzeyini dalgalandırır; dalgalanan su ise gökyüzünü berrak yansıtamaz. Ferîdüddin Attâr’ın hatırlattığı gibi, gönlünü gürültüden boşaltmayan kişi, sessizliğin içindeki ince hikmet sesini duyamaz.

- **Sükût bir eksiklik değil, doluluktur:** Konuşmayı bıraktığın anda etrafındaki rüzgârın, bir sayfanın çevrilişinin ve kendi nabzının ritmini fark edersin.
- **Kalbin aynası:** Dört saniyede aldığın her nefesle zihnindeki dağınık düşünceleri topla; altı saniyede verirken kaygılarını toprağa bırak.

> *"Söz gümüşse sükût altındır; fakat tefekkürle yoğrulan sükût, kalbin pırlantasıdır."*

Bir dakika boyunca hiçbir şeyi düzeltmeye veya yetiştirmeye çalışmadan sadece kalbinin sükûnunu dinle.`
    },
    {
      id: 'yol-zaman',
      icon: '⏳',
      title: 'Yol ve Zaman',
      subtitle: 'Geçip giden saatlerin içinde kalıcı olan iz ve "ibnü’l-vakt" (ânın çocuğu) bilinci.',
      promptFocus: 'zaman bilinci, tasavvufta "ibnü’l-vakt" kavramı, yolun bir varış değil oluş süreci olması',
      offlineText: `### ⏳ Yol ve Zaman Üzerine Bir Halvet Tefekkürü

Modern çağ zamanı tüketilecek bir yarış pisti gibi görür; oysa kadim Anadolu hikmetinde yolcu, zamanla yarışan değil zamanla hemhâl olandır. Evliya Çelebi’nin elli bir yılı aşan seyri, aceleyle tüketilmiş günler değil, her durağın hakkını veren bir hayret silsilesidir.

- **Ânın hakkını vermek:** Geçmişin keşkeleriyle geleceğin endişeleri arasında sıkışmak yerine, şu anki nefesin içinde tam olarak var olabilmek gerçek hürriyettir.
- **İz ve süreklilik:** Şehirlerin taş kemerleri yüzlerce yılı sessizce taşır; insan da sabır ve istikametle yürüdüğünde zamanın yıpratıcılığına karşı içsel bir vakar kazanır.

> *"Yol uzunsa acele etme; menzil, adımlarının hızında değil niyetinin berraklığında gizlidir."*

Şu an elindeki saati bir anlığına unut ve yalnızca nefesinin açtığı geniş zamanı hisset.`
    },
    {
      id: 'kutuphane-ilim',
      icon: '📚',
      title: 'Kütüphane ve İlim',
      subtitle: 'Satırlardan sadırlara geçen hikmet, rıhle geleneği ve kendini bilmek.',
      promptFocus: 'kütüphane sessizliği, İbn Haldûn’un rıhle anlayışı, Yunus Emre’nin "ilim kendin bilmektir" dizesi',
      offlineText: `### 📚 Kütüphane ve İlim Üzerine Bir Halvet Tefekkürü

Anadolu’nun hangi şehrine gidersen git, bir İl Halk Kütüphanesi’nin kapısından içeri adım attığında dışarıdaki telaş yerini asırlık bir vakara bırakır. İbn Haldûn’un *Mukaddime*’de işaret ettiği gibi, ilim için yapılan yolculuk yalnızca bilgi toplamak değil, aklı tek bir çevrenin sınırlarından azat etmektir.

- **Satırdan sadıra:** Yunus Emre’nin uyarısı her okurun başucunda asılıdır: *“İlim ilim bilmektir, ilim kendin bilmektir.”* Okunan her sayfa kalbi yumuşatmıyor, merhameti ve hayreti büyütmüyorsa eksik kalmıştır.
- **Sessiz dostluk:** Bir kütüphane masasında yüzyıllar önce yaşamış bir müellifle kurulan sessiz sohbet, insanı zamanın ötesinde büyük bir irfan sofrasına oturtur.

> *"Gerçek ilim, insanın bildiğiyle övünmesi değil; bilmediklerinin enginliği karşısında tevazuyla eğilmesidir."*

Önündeki açık sayfaya ya da zihnindeki soruya şefkatle yaklaş; öğrenmek, ruhun en zarif ibadetlerinden biridir.`
    },
    {
      id: 'az-esya-hurriyet',
      icon: '🎒',
      title: 'Az Eşya ve Hürriyet',
      subtitle: 'Sırt çantası hafifledikçe açılan gönül ufku ve sadeleşmenin getirdiği ferahlık.',
      promptFocus: 'sade yaşam, az eşya ile seyahat etmenin verdiği zihinsel hafiflik, istiğna ve kanaat felsefesi',
      offlineText: `### 🎒 Az Eşya ve Hürriyet Üzerine Bir Halvet Tefekkürü

Seyyahı yoran yolun yokuşu değil, sırtında taşıdığı lüzumsuz yüktür. İnsanın elindeki eşya çoğaldıkça onu koruma kaygısı artar; oysa az eşyayla yola çıkabilen kimse, rüzgârla dost olan hafif bir yelkenli gibi her limana zarafetle yanaşır.

- **Sahip oldukların mı, senin sahip oldukların mı?** İhtiyacın ötesindeki her eşya zihinde küçük bir yer işgal eder; sadeleşmek, o yeri yeniden tefekküre ve sevgiye açmaktır.
- **İstiğna hürriyeti:** Azla yetinebilen gönül, kimseye minnet etmeden ve hiçbir konfora esir düşmeden yeryüzünde başı dik yürür.

> *"Sırt çantan ne kadar hafifse, gökyüzüne bakmak için başını kaldırman o kadar kolaylaşır."*

Bugün hayatından veya zihninden bırakabileceğin tek bir fazlalığı düşün ve onu sessizce serbest bırak.`
    }
  ];

  // ---------------------------------------------------------------------------
  // Module Lifecycle State
  // ---------------------------------------------------------------------------
  let activeCtx = null;
  let containerRef = null;
  let breathTimerId = null;
  let rotateTimerId = null;
  let sessionTimerId = null;
  let ambientObserver = null;
  let fallbackAudio = null;
  let streamAbortController = null;
  let fullscreenHandler = null;

  const ui = {
    // Breathing state
    rhythmIndex: 0,
    breathingRunning: false,
    phase: 'idle', // 'idle' | 'inhale' | 'hold' | 'exhale'
    phaseRemaining: 4,
    phaseTotal: 4,
    breathCycles: 0,
    starAngle: 0,

    // Hikmet state
    hikmetIndex: 0,
    autoRotate: true,
    hikmetProgress: 0,

    // AI & Reflection state
    selectedThemeId: TEFEKKUR_THEMES[0].id,
    intentionText: '',
    aiStreaming: false,
    aiOutput: '',
    aiSource: '',
    reflectionText: '',
    zenDim: false,
    sessionSeconds: 0,
    streamRunId: 0
  };

  // ---------------------------------------------------------------------------
  // Safe Helpers
  // ---------------------------------------------------------------------------
  function esc(str) {
    if (activeCtx && typeof activeCtx.escapeHtml === 'function') {
      return activeCtx.escapeHtml(str);
    }
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normTr(str) {
    if (activeCtx && typeof activeCtx.normalizeTurkish === 'function') {
      return activeCtx.normalizeTurkish(str);
    }
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

  function notify(msg) {
    if (activeCtx && typeof activeCtx.showToast === 'function') {
      activeCtx.showToast(msg);
    }
  }

  function renderMdSafe(text) {
    if (window.SEYYAH_AI && typeof window.SEYYAH_AI.renderMarkdown === 'function') {
      return window.SEYYAH_AI.renderMarkdown(text);
    }
    const lines = String(text || '').split('\n');
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (line.startsWith('### ')) {
        out.push(`<h4>${esc(line.slice(4))}</h4>`);
      } else if (line.startsWith('> ')) {
        out.push(`<blockquote>${esc(line.slice(2))}</blockquote>`);
      } else if (line.startsWith('- ')) {
        out.push(`<p>• ${esc(line.slice(2)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`);
      } else {
        out.push(`<p>${esc(line).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')}</p>`);
      }
    }
    return out.join('\n');
  }

  function formatMMSS(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // ---------------------------------------------------------------------------
  // Journal Storage (dijital_seyyah_journal_entries)
  // ---------------------------------------------------------------------------
  function readJournalEntries() {
    try {
      const raw = localStorage.getItem(JOURNAL_ENTRIES_STORAGE);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function writeJournalEntries(entries) {
    try {
      localStorage.setItem(JOURNAL_ENTRIES_STORAGE, JSON.stringify(entries));
      return true;
    } catch (_) {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Halvet Session Minutes Log (dijital_seyyah_halvet_minutes_v1)
  // ---------------------------------------------------------------------------
  function readHalvetLog() {
    try {
      const raw = localStorage.getItem(HALVET_MINUTES_STORAGE);
      if (!raw) return { totalMinutes: 0, lastDate: '' };
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'number' && Number.isFinite(parsed)) {
        return { totalMinutes: Math.max(0, Math.floor(parsed)), lastDate: '' };
      }
      if (parsed && typeof parsed === 'object') {
        return {
          totalMinutes: Math.max(0, Math.floor(Number(parsed.totalMinutes) || 0)),
          lastDate: typeof parsed.lastDate === 'string' ? parsed.lastDate : ''
        };
      }
      return { totalMinutes: 0, lastDate: '' };
    } catch (_) {
      return { totalMinutes: 0, lastDate: '' };
    }
  }

  function incrementHalvetMinute() {
    const log = readHalvetLog();
    log.totalMinutes += 1;
    log.lastDate = new Date().toLocaleDateString('tr-TR');
    try {
      localStorage.setItem(HALVET_MINUTES_STORAGE, JSON.stringify(log));
    } catch (_) {}
    return log;
  }

  function matchProvinceFromText(text) {
    const provinces = activeCtx && activeCtx.data && activeCtx.data.provinces;
    if (!provinces || !text) return null;
    const nText = normTr(text);
    const keys = Object.keys(provinces);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const p = provinces[k];
      if (!p || !p.name) continue;
      const nName = normTr(p.name);
      if (nName && nText.includes(nName)) {
        return { key: k, province: p };
      }
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Ney Audio Integration (#btn-ambient + assets/ney_tasavvuf.mp3)
  // ---------------------------------------------------------------------------
  function isNeyPlaying() {
    if (fallbackAudio && !fallbackAudio.paused) return true;
    if (activeCtx && activeCtx.state && activeCtx.state.soundIndex === 0) return true;
    const neyPresetBtn = document.querySelector('.ambient-preset-btn[data-sound-id="ney"]');
    if (neyPresetBtn && neyPresetBtn.classList.contains('active')) return true;
    return false;
  }

  function stopFallbackNey() {
    if (fallbackAudio) {
      try {
        fallbackAudio.pause();
        fallbackAudio.currentTime = 0;
      } catch (_) {}
      fallbackAudio = null;
    }
  }

  function toggleNeyTaksimi() {
    const neyPresetBtn = document.querySelector('.ambient-preset-btn[data-sound-id="ney"]');
    const headerAmbientBtn = document.getElementById('btn-ambient');
    const currentlyPlaying = isNeyPlaying();

    // If our fallback audio was playing, stop it cleanly
    if (fallbackAudio && !fallbackAudio.paused) {
      stopFallbackNey();
      notify('🔇 Tasavvufi Ney Taksimi kapatıldı');
      return false;
    }

    // Prefer host app's ambient controller via .ambient-preset-btn[data-sound-id="ney"]
    if (neyPresetBtn) {
      // Gently cap volume for soft meditation if slider is very high when starting
      const volSlider = document.getElementById('ambient-volume-slider');
      if (!currentlyPlaying && volSlider && Number(volSlider.value) > 55) {
        volSlider.value = '42';
        volSlider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      neyPresetBtn.click();
      // Keep header ambient popover closed if it was closed
      const pop = document.getElementById('ambient-popover');
      if (pop && pop.classList.contains('open') && headerAmbientBtn) {
        headerAmbientBtn.click();
      }
      return !currentlyPlaying;
    }

    // Fallback: trigger #btn-ambient click if present and no preset button, or play assets/ney_tasavvuf.mp3 directly
    if (headerAmbientBtn && typeof activeCtx?.cycleAmbientSound === 'function') {
      // Also start direct soft Ney audio so 1-click guarantees playback
    }

    try {
      const audio = new Audio(NEY_AUDIO_SRC);
      audio.loop = true;
      audio.volume = 0.32;
      fallbackAudio = audio;
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          notify('⚠️ Ney sesi tarayıcı tarafından engellendi; tekrar tıklayın.');
        });
      }
      notify('🎶 Tasavvufi Ney Taksimi usulca açıldı');
      return true;
    } catch (_) {
      notify('⚠️ Ney ses dosyası başlatılamadı.');
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // AI Streaming Meditation (window.SEYYAH_AI + Direct Gemini + Offline Fallback)
  // ---------------------------------------------------------------------------
  async function streamWordsSmoothly(fullText, onUpdate, signal) {
    const words = String(fullText || '').split(/(\s+)/);
    let acc = '';
    for (let i = 0; i < words.length; i++) {
      if (signal && signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      acc += words[i];
      if (i % 3 === 0 || i === words.length - 1) {
        onUpdate(acc);
        await new Promise((resolve) => setTimeout(resolve, 26));
      }
    }
  }

  function buildMeditationPrompts(theme, intention, currentHikmet) {
    const systemPrompt =
      'Sen Anadolu irfanı, tasavvuf felsefesi ve klasik İslâm düşüncesiyle yoğrulmuş bilge, sakin ve zarif bir "Halvet Rehberi"sin. ' +
      'Kullanıcıya "Halvet & Tefekkür Odası" içinde dingin, derin, felsefî ve kalbe dokunan bir tefekkür metni sunuyorsun. ' +
      'Türkçe yaz. Üslubun şiirsel ama sade, vakur, aceleci olmayan ve derinlikli olsun. ' +
      'Markdown kullan: 1 adet zarif alt başlık (### ...), 2 kısa tefekkür paragrafı, 2 adet düşündürücü madde (- **...**), 1 adet özlü hikmet cümlesi (> *...*) ve sonunda nefesle bağlantılı kısa bir kapanış daveti ekle. Toplam ~170-230 kelime civarında tut.';

    const extra = intention && intention.trim()
      ? `Kullanıcının gönlündeki niyet veya bulunduğu menzil: "${intention.trim()}". Bunu tefekkürün içine incelikle ör.`
      : 'Kullanıcı şu an sakin bir nefes ve tefekkür molasında.';

    const userPrompt =
      `Tema: "${theme.title}"\n` +
      `Odak çerçevesi: ${theme.promptFocus}\n` +
      `Şu an odada açık olan klasik hikmet metni: "${currentHikmet.text}" (${currentHikmet.source})\n` +
      `${extra}\n\n` +
      'Bu temayı Anadolu yolculuğu, içsel sükûnet ve insanın kendi kalbine yaptığı sefer ekseninde derin bir tefekkür metnine dönüştür.';

    return { systemPrompt, userPrompt };
  }

  async function runGeminiMeditation({ theme, intention, currentHikmet, onUpdate, signal }) {
    const { systemPrompt, userPrompt } = buildMeditationPrompts(theme, intention, currentHikmet);
    const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;
    const ai = window.SEYYAH_AI;

    if (isOnline && ai && typeof ai.hasKey === 'function' && ai.hasKey()) {
      try {
        if (typeof ai.stream === 'function') {
          const res = await ai.stream({
            prompt: userPrompt,
            system: systemPrompt,
            temperature: 0.78,
            maxTokens: 900,
            onChunk: (_delta, full) => {
              if (signal && signal.aborted) return;
              if (full) onUpdate(full);
            }
          });
          if (res && res.text && res.text.trim()) {
            return {
              text: res.text.trim(),
              source: `⚡ Gemini AI (${res.model || ai.getModel?.() || 'flash'})`
            };
          }
        } else if (typeof ai.ask === 'function') {
          const res = await ai.ask({
            prompt: userPrompt,
            system: systemPrompt,
            temperature: 0.78,
            maxTokens: 900
          });
          if (res && res.text && res.text.trim()) {
            await streamWordsSmoothly(res.text.trim(), onUpdate, signal);
            return {
              text: res.text.trim(),
              source: `⚡ Gemini AI (${res.model || 'flash'})`
            };
          }
        }
      } catch (err) {
        if (err && err.name === 'AbortError') throw err;
        // Fall through to direct fetch or offline contemplative fallback
      }
    }

    // Direct Gemini fallback if SEYYAH_AI unavailable but localStorage key exists
    if (isOnline) {
      let apiKey = '';
      let model = 'gemini-flash-lite-latest';
      try {
        apiKey = String(localStorage.getItem(GEMINI_KEY_STORAGE) || '').trim();
        const storedModel = String(localStorage.getItem(GEMINI_MODEL_STORAGE) || '').trim();
        if (storedModel && !/^gemini-2\.[05]/i.test(storedModel)) model = storedModel;
      } catch (_) {}

      if (apiKey) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const resp = await fetch(url, {
            method: 'POST',
            signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              generationConfig: { temperature: 0.78, maxOutputTokens: 900 }
            })
          });
          if (resp.ok) {
            const json = await resp.json();
            const text = json?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim();
            if (text) {
              await streamWordsSmoothly(text, onUpdate, signal);
              return { text, source: `⚡ Gemini AI (${model})` };
            }
          }
        } catch (err) {
          if (err && err.name === 'AbortError') throw err;
        }
      }
    }

    // Graceful Offline Contemplation Fallback
    let offline = theme.offlineText;
    if (intention && intention.trim()) {
      offline += `\n\n---\n**Niyetiniz Üzerine:** *"${intention.trim()}"* niyetiyle açılan bu menzil, kalbinizde hayırlı bir sükûnete vesile olsun.`;
    }
    await streamWordsSmoothly(offline, onUpdate, signal);
    return {
      text: offline,
      source: isOnline
        ? '🕯️ Halvet Külliyatı Tefekkürü (Gemini API Anahtarı Eklenebilir)'
        : '🕯️ Çevrimdışı Halvet Tefekkürü'
    };
  }

  // ---------------------------------------------------------------------------
  // Scoped CSS (Dark Cyber-Sufi & Light Alabaster Compatible)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .hlv-root {
        --hlv-bg-surface: rgba(15, 23, 42, 0.72);
        --hlv-bg-card: rgba(20, 30, 52, 0.78);
        --hlv-bg-soft: rgba(255, 255, 255, 0.04);
        --hlv-border: rgba(255, 255, 255, 0.1);
        --hlv-border-gold: rgba(245, 158, 11, 0.34);
        --hlv-gold: #f59e0b;
        --hlv-gold-soft: rgba(245, 158, 11, 0.14);
        --hlv-cyan: #00f2fe;
        --hlv-emerald: #10b981;
        --hlv-text: #f8fafc;
        --hlv-text-muted: #94a3b8;
        --hlv-text-subtle: #64748b;
        --hlv-shadow: 0 22px 50px -14px rgba(0, 0, 0, 0.65);

        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 1240px;
        margin: 0 auto;
        padding: 4px 4px 36px;
        color: var(--hlv-text);
        animation: hlvFadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .hlv-root.hlv-zen-dim {
        position: relative;
      }
      .hlv-root.hlv-zen-dim::before {
        content: '';
        position: fixed;
        inset: 0;
        background: radial-gradient(circle at 50% 35%, rgba(245, 158, 11, 0.06), rgba(4, 7, 15, 0.72) 72%);
        pointer-events: none;
        z-index: 1;
      }
      .hlv-root.hlv-zen-dim > * {
        position: relative;
        z-index: 2;
      }

      @keyframes hlvFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Hero Banner */
      .hlv-hero {
        position: relative;
        overflow: hidden;
        border-radius: 20px;
        padding: 24px 26px;
        background:
          radial-gradient(circle at 88% 18%, rgba(245, 158, 11, 0.16), transparent 46%),
          radial-gradient(circle at 12% 85%, rgba(0, 242, 254, 0.11), transparent 48%),
          linear-gradient(145deg, rgba(15, 23, 42, 0.92), rgba(10, 15, 29, 0.96));
        border: 1px solid var(--hlv-border-gold);
        box-shadow: var(--hlv-shadow);
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 18px;
      }

      .hlv-hero-info {
        max-width: 680px;
      }

      .hlv-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--hlv-gold);
        background: var(--hlv-gold-soft);
        border: 1px solid var(--hlv-border-gold);
        padding: 5px 12px;
        border-radius: 999px;
        margin-bottom: 10px;
      }

      .hlv-hero h2 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.45rem, 2.5vw, 2rem);
        font-weight: 800;
        line-height: 1.2;
        margin-bottom: 6px;
        background: linear-gradient(135deg, #fff8eb 0%, #fbbf24 55%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .hlv-hero-sub {
        font-size: 0.92rem;
        color: var(--hlv-text-muted);
        line-height: 1.55;
      }

      .hlv-hero-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
      }

      .hlv-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: 12px;
        font-size: 0.86rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        border: 1px solid var(--hlv-border);
        background: var(--hlv-bg-soft);
        color: var(--hlv-text);
        transition: all 0.22s ease;
      }
      .hlv-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        border-color: rgba(245, 158, 11, 0.55);
        background: rgba(245, 158, 11, 0.12);
      }
      .hlv-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .hlv-btn-ney {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(16, 185, 129, 0.16));
        border-color: var(--hlv-border-gold);
        color: #fde68a;
        padding: 11px 18px;
      }
      .hlv-btn-ney.playing {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.28), rgba(0, 242, 254, 0.18));
        border-color: rgba(16, 185, 129, 0.65);
        color: #a7f3d0;
        box-shadow: 0 0 22px rgba(16, 185, 129, 0.26);
      }

      .hlv-btn-primary {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        border-color: transparent;
        color: #0b1120;
        font-weight: 700;
        box-shadow: 0 8px 20px -6px rgba(245, 158, 11, 0.45);
      }
      .hlv-btn-primary:hover:not(:disabled) {
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        color: #0b1120;
      }

      .hlv-btn-teal {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.16), rgba(16, 185, 129, 0.18));
        border-color: rgba(0, 242, 254, 0.35);
        color: #cffafe;
      }

      .hlv-eq {
        display: inline-flex;
        align-items: flex-end;
        gap: 2px;
        height: 12px;
      }
      .hlv-eq span {
        width: 2.5px;
        background: currentColor;
        border-radius: 2px;
        animation: hlvEqBar 0.9s infinite ease-in-out;
      }
      .hlv-eq span:nth-child(2) { animation-delay: 0.2s; }
      .hlv-eq span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes hlvEqBar {
        0%, 100% { height: 4px; }
        50% { height: 12px; }
      }

      .hlv-session-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: 12px;
        font-size: 0.8rem;
        color: var(--hlv-text-muted);
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--hlv-border);
      }

      /* Main 2-Col Grid */
      .hlv-grid {
        display: grid;
        grid-template-columns: minmax(320px, 1fr) minmax(340px, 1.18fr);
        gap: 20px;
        align-items: stretch;
      }

      .hlv-card {
        background: var(--hlv-bg-card);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--hlv-border);
        border-radius: 20px;
        padding: 22px;
        box-shadow: var(--hlv-shadow);
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .hlv-card-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        flex-wrap: wrap;
      }
      .hlv-card-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.08rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .hlv-card-sub {
        font-size: 0.8rem;
        color: var(--hlv-text-muted);
        margin-top: 2px;
      }

      /* Sacred Seljuk Star Breathing Stage */
      .hlv-breath-stage {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 14px 10px 10px;
        border-radius: 16px;
        background: radial-gradient(circle at center, rgba(245, 158, 11, 0.08), rgba(10, 15, 29, 0.5) 70%);
        border: 1px solid rgba(245, 158, 11, 0.18);
      }

      .hlv-star-wrap {
        position: relative;
        width: 244px;
        height: 244px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .hlv-star-aura {
        position: absolute;
        width: 190px;
        height: 190px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(0, 242, 254, 0.1) 48%, transparent 72%);
        filter: blur(10px);
        transform: scale(0.84);
        opacity: 0.5;
        transition: transform 0.8s ease, opacity 0.8s ease;
        pointer-events: none;
      }

      .hlv-seljuk-svg {
        width: 230px;
        height: 230px;
        overflow: visible;
        will-change: transform;
        transform-origin: center center;
      }

      .hlv-star-rotator {
        transform-origin: 120px 120px;
        transition: transform 1.2s cubic-bezier(0.37, 0, 0.63, 1);
      }

      .hlv-star-center-readout {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        pointer-events: none;
      }

      .hlv-phase-label {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.88rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #fde68a;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
      }
      .hlv-phase-timer {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 2rem;
        font-weight: 800;
        line-height: 1.05;
        color: #ffffff;
        text-shadow: 0 2px 14px rgba(0, 0, 0, 0.75);
      }

      .hlv-breath-tagline {
        margin-top: 8px;
        font-size: 0.83rem;
        font-weight: 600;
        color: var(--hlv-gold);
        text-align: center;
      }

      .hlv-rhythm-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
      }

      .hlv-pill {
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 600;
        border: 1px solid var(--hlv-border);
        background: var(--hlv-bg-soft);
        color: var(--hlv-text-muted);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }
      .hlv-pill:hover {
        color: var(--hlv-text);
        border-color: rgba(245, 158, 11, 0.45);
      }
      .hlv-pill.active {
        background: var(--hlv-gold-soft);
        border-color: var(--hlv-gold);
        color: #fde68a;
      }

      .hlv-breath-controls {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 10px;
      }

      .hlv-cycle-stat {
        font-size: 0.8rem;
        color: var(--hlv-text-muted);
        padding: 6px 12px;
        border-radius: 10px;
        background: var(--hlv-bg-soft);
        border: 1px solid var(--hlv-border);
      }

      /* Hikmet Külliyatı Rotator */
      .hlv-hikmet-box {
        position: relative;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 14px;
        padding: 20px;
        border-radius: 16px;
        background:
          radial-gradient(circle at 95% 5%, rgba(0, 242, 254, 0.08), transparent 45%),
          rgba(10, 15, 29, 0.56);
        border: 1px solid rgba(255, 255, 255, 0.09);
      }

      .hlv-hikmet-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .hlv-hikmet-cat {
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.3);
        color: #67e8f9;
      }

      .hlv-hikmet-counter {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--hlv-text-muted);
      }

      .hlv-hikmet-quote {
        font-size: 1.07rem;
        line-height: 1.72;
        font-weight: 500;
        color: #f8fafc;
        border-left: 3px solid var(--hlv-gold);
        padding-left: 16px;
        margin: 4px 0;
      }

      .hlv-hikmet-source {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--hlv-gold);
      }

      .hlv-hikmet-commentary {
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.07);
        font-size: 0.86rem;
        line-height: 1.6;
        color: var(--hlv-text-muted);
      }
      .hlv-hikmet-commentary strong {
        color: var(--hlv-text);
      }

      .hlv-hikmet-dots {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        align-items: center;
      }
      .hlv-dot-btn {
        width: 22px;
        height: 22px;
        border-radius: 7px;
        border: 1px solid var(--hlv-border);
        background: var(--hlv-bg-soft);
        color: var(--hlv-text-muted);
        font-size: 0.68rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
        font-family: inherit;
      }
      .hlv-dot-btn:hover {
        border-color: var(--hlv-gold);
        color: var(--hlv-text);
      }
      .hlv-dot-btn.active {
        background: var(--hlv-gold);
        border-color: var(--hlv-gold);
        color: #0b1120;
      }

      .hlv-hikmet-nav {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      /* Gemini AI & Personal Reflection Section */
      .hlv-ai-card {
        gap: 18px;
      }

      .hlv-themes-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
        gap: 10px;
      }

      .hlv-theme-btn {
        text-align: left;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid var(--hlv-border);
        background: var(--hlv-bg-soft);
        color: var(--hlv-text);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .hlv-theme-btn:hover {
        border-color: rgba(0, 242, 254, 0.45);
        transform: translateY(-1px);
      }
      .hlv-theme-btn.active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(0, 242, 254, 0.11));
        border-color: var(--hlv-gold);
        box-shadow: 0 0 18px rgba(245, 158, 11, 0.16);
      }
      .hlv-theme-title {
        font-weight: 700;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .hlv-theme-desc {
        font-size: 0.75rem;
        line-height: 1.4;
        color: var(--hlv-text-muted);
      }

      .hlv-ai-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
      }

      .hlv-input,
      .hlv-textarea {
        width: 100%;
        border-radius: 12px;
        border: 1px solid var(--hlv-border);
        background: rgba(10, 15, 29, 0.55);
        color: var(--hlv-text);
        font-family: inherit;
        font-size: 0.88rem;
        padding: 11px 14px;
        outline: none;
        transition: border-color 0.2s ease;
      }
      .hlv-input:focus,
      .hlv-textarea:focus {
        border-color: var(--hlv-gold);
      }
      .hlv-input-flex {
        flex: 1 1 280px;
      }
      .hlv-textarea {
        min-height: 110px;
        resize: vertical;
        line-height: 1.6;
      }

      .hlv-ai-split {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 18px;
      }

      .hlv-ai-stream-box {
        border-radius: 16px;
        padding: 18px 20px;
        background: rgba(10, 15, 29, 0.62);
        border: 1px solid rgba(0, 242, 254, 0.2);
        min-height: 220px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .hlv-ai-stream-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 0.78rem;
        color: var(--hlv-text-muted);
        border-bottom: 1px solid var(--hlv-border);
        padding-bottom: 8px;
      }
      .hlv-ai-body {
        font-size: 0.92rem;
        line-height: 1.7;
        color: var(--hlv-text);
        flex: 1;
      }
      .hlv-ai-body h3,
      .hlv-ai-body h4 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        color: #fde68a;
        margin-bottom: 8px;
      }
      .hlv-ai-body p {
        margin-bottom: 10px;
      }
      .hlv-ai-body ul {
        padding-left: 18px;
        margin-bottom: 10px;
      }
      .hlv-ai-body li {
        margin-bottom: 5px;
      }
      .hlv-ai-body blockquote {
        border-left: 3px solid var(--hlv-gold);
        padding: 8px 14px;
        margin: 10px 0;
        background: rgba(245, 158, 11, 0.08);
        border-radius: 0 10px 10px 0;
        color: #fef3c7;
      }
      .hlv-cursor {
        display: inline-block;
        width: 8px;
        height: 1em;
        background: var(--hlv-gold);
        vertical-align: middle;
        margin-left: 4px;
        animation: hlvBlink 0.8s infinite;
      }
      @keyframes hlvBlink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }

      .hlv-reflection-box {
        border-radius: 16px;
        padding: 18px;
        background: rgba(10, 15, 29, 0.5);
        border: 1px solid var(--hlv-border);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .hlv-saved-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 6px;
        max-height: 220px;
        overflow-y: auto;
      }
      .hlv-saved-item {
        padding: 11px 14px;
        border-radius: 12px;
        background: var(--hlv-bg-soft);
        border: 1px solid var(--hlv-border);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }
      .hlv-saved-meta {
        font-size: 0.74rem;
        color: var(--hlv-gold);
        font-weight: 700;
        margin-bottom: 4px;
      }
      .hlv-saved-text {
        font-size: 0.83rem;
        color: var(--hlv-text-muted);
        line-height: 1.5;
        white-space: pre-wrap;
      }

      /* ---------------------------------------------------------------------
       * Light Theme Overrides (body.light-theme)
       * --------------------------------------------------------------------- */
      body.light-theme .hlv-root {
        --hlv-bg-surface: rgba(255, 255, 255, 0.88);
        --hlv-bg-card: rgba(255, 255, 255, 0.92);
        --hlv-bg-soft: rgba(15, 23, 42, 0.04);
        --hlv-border: rgba(15, 23, 42, 0.12);
        --hlv-border-gold: rgba(180, 83, 9, 0.28);
        --hlv-gold: #b45309;
        --hlv-gold-soft: rgba(217, 119, 6, 0.12);
        --hlv-text: #0f172a;
        --hlv-text-muted: #475569;
        --hlv-text-subtle: #64748b;
        --hlv-shadow: 0 14px 36px -12px rgba(15, 23, 42, 0.14);
      }

      body.light-theme .hlv-root.hlv-zen-dim::before {
        background: radial-gradient(circle at 50% 35%, rgba(217, 119, 6, 0.06), rgba(226, 232, 240, 0.72) 75%);
      }

      body.light-theme .hlv-hero {
        background:
          radial-gradient(circle at 88% 18%, rgba(217, 119, 6, 0.12), transparent 46%),
          radial-gradient(circle at 12% 85%, rgba(14, 116, 144, 0.09), transparent 48%),
          linear-gradient(145deg, #ffffff, #f8fafc);
      }

      body.light-theme .hlv-hero h2 {
        background: linear-gradient(135deg, #0f172a 0%, #b45309 60%, #0e7490 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .hlv-btn-ney {
        color: #92400e;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(16, 185, 129, 0.12));
      }
      body.light-theme .hlv-btn-ney.playing {
        color: #065f46;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(14, 165, 233, 0.14));
      }
      body.light-theme .hlv-btn-teal {
        color: #0e7490;
        background: rgba(14, 116, 144, 0.08);
        border-color: rgba(14, 116, 144, 0.28);
      }

      body.light-theme .hlv-breath-stage {
        background: radial-gradient(circle at center, rgba(217, 119, 6, 0.08), rgba(241, 245, 249, 0.9) 72%);
      }
      body.light-theme .hlv-phase-label {
        color: #92400e;
        text-shadow: none;
      }
      body.light-theme .hlv-phase-timer {
        color: #0f172a;
        text-shadow: none;
      }
      body.light-theme .hlv-pill.active {
        color: #92400e;
      }

      body.light-theme .hlv-hikmet-box,
      body.light-theme .hlv-ai-stream-box,
      body.light-theme .hlv-reflection-box {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.1);
      }
      body.light-theme .hlv-hikmet-quote {
        color: #0f172a;
      }
      body.light-theme .hlv-hikmet-cat {
        background: rgba(14, 116, 144, 0.1);
        border-color: rgba(14, 116, 144, 0.26);
        color: #0e7490;
      }
      body.light-theme .hlv-hikmet-commentary {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.08);
      }
      body.light-theme .hlv-input,
      body.light-theme .hlv-textarea {
        background: #ffffff;
        color: #0f172a;
      }
      body.light-theme .hlv-ai-body h3,
      body.light-theme .hlv-ai-body h4 {
        color: #92400e;
      }
      body.light-theme .hlv-ai-body blockquote {
        color: #78350f;
        background: rgba(245, 158, 11, 0.1);
      }

      /* Live Visual Phase Cues & Total Halvet Log */
      .hlv-phase-cues {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 2px;
      }
      .hlv-phase-cue {
        font-size: 0.74rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--hlv-border);
        color: var(--hlv-text-muted);
        transition: all 0.25s ease;
      }
      .hlv-phase-cue.active-inhale {
        background: rgba(0, 242, 254, 0.18);
        border-color: rgba(0, 242, 254, 0.55);
        color: #67e8f9;
        transform: scale(1.06);
      }
      .hlv-phase-cue.active-hold,
      .hlv-phase-cue.active-holdAfter {
        background: rgba(245, 158, 11, 0.2);
        border-color: rgba(245, 158, 11, 0.55);
        color: #fde68a;
        transform: scale(1.06);
      }
      .hlv-phase-cue.active-exhale {
        background: rgba(16, 185, 129, 0.2);
        border-color: rgba(16, 185, 129, 0.55);
        color: #6ee7b7;
        transform: scale(1.06);
      }

      .hlv-total-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 9px 13px;
        border-radius: 12px;
        font-size: 0.82rem;
        font-weight: 700;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid var(--hlv-border-gold);
        color: var(--hlv-gold);
      }

      .hlv-root:fullscreen,
      .hlv-root:-webkit-full-screen {
        max-width: none;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        padding: 24px 28px 40px;
        background: radial-gradient(circle at 50% 20%, #0f1c34 0%, #070d19 72%);
      }
      body.light-theme .hlv-root:fullscreen,
      body.light-theme .hlv-root:-webkit-full-screen {
        background: radial-gradient(circle at 50% 20%, #f8fafc 0%, #e2e8f0 85%);
      }
      body.light-theme .hlv-phase-cue {
        background: rgba(15, 23, 42, 0.05);
        border-color: rgba(15, 23, 42, 0.12);
        color: #475569;
      }
      body.light-theme .hlv-phase-cue.active-inhale {
        color: #0369a1;
      }
      body.light-theme .hlv-phase-cue.active-hold,
      body.light-theme .hlv-phase-cue.active-holdAfter {
        color: #92400e;
      }
      body.light-theme .hlv-phase-cue.active-exhale {
        color: #047857;
      }
      body.light-theme .hlv-total-pill {
        color: #92400e;
        background: rgba(245, 158, 11, 0.14);
      }

      @media (max-width: 960px) {
        .hlv-grid,
        .hlv-ai-split {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Cleanup Helper
  // ---------------------------------------------------------------------------
  function clearTimers() {
    if (breathTimerId) {
      clearInterval(breathTimerId);
      breathTimerId = null;
    }
    if (rotateTimerId) {
      clearInterval(rotateTimerId);
      rotateTimerId = null;
    }
    if (sessionTimerId) {
      clearInterval(sessionTimerId);
      sessionTimerId = null;
    }
    if (ambientObserver) {
      ambientObserver.disconnect();
      ambientObserver = null;
    }
    if (fullscreenHandler) {
      document.removeEventListener('fullscreenchange', fullscreenHandler);
      document.removeEventListener('webkitfullscreenchange', fullscreenHandler);
      fullscreenHandler = null;
    }
    if (streamAbortController) {
      try { streamAbortController.abort(); } catch (_) {}
      streamAbortController = null;
    }
  }

  function stop() {
    clearTimers();
    ui.breathingRunning = false;
    ui.aiStreaming = false;
    stopFallbackNey();
  }

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    activeCtx = ctx || activeCtx || {};
    containerRef = container;

    injectStyles();
    clearTimers();

    const currentRhythm = BREATH_RHYTHMS[ui.rhythmIndex] || BREATH_RHYTHMS[0];
    const currentHikmet = HIKMET_CORPUS[ui.hikmetIndex] || HIKMET_CORPUS[0];
    const currentTheme = TEFEKKUR_THEMES.find(t => t.id === ui.selectedThemeId) || TEFEKKUR_THEMES[0];
    const halvetLog = readHalvetLog();

    container.innerHTML = `
      <div class="hlv-root ${ui.zenDim ? 'hlv-zen-dim' : ''}" id="hlv-root">
        <!-- Hero Sanctuary Header -->
        <section class="hlv-hero">
          <div class="hlv-hero-info">
            <div class="hlv-eyebrow">🕯️ Halvet &amp; Tefekkür Odası • Uzlet ve İrfan Meclisi</div>
            <h2>🕯️ Halvet &amp; Tefekkür Odası (Sükûnet, Nefes &amp; Hikmet Stüdyosu)</h2>
            <p class="hlv-hero-sub">
              Anadolu’nun seksen bir menzili arasında gönlü dinlendiren sessiz bir durak.
              Selçuklu hendesesi eşliğinde nefesini dengele, kadim hikmet külliyatını tefekkür et ve ilhamını seyir defterine nakşet.
            </p>
          </div>
          <div class="hlv-hero-actions">
            <button type="button" class="hlv-btn hlv-btn-ney" id="hlv-btn-ney"></button>
            <button type="button" class="hlv-btn" id="hlv-btn-zen-dim">
              ${ui.zenDim ? '☀️ Işığı Aç' : '🕯️ Halvet Işığı'}
            </button>
            <button type="button" class="hlv-btn" id="hlv-btn-fullscreen">
              ⛶ Tam Ekran Halvet Modu
            </button>
            <div class="hlv-session-pill" title="Bu oturumda Halvet odasında geçirilen süre">
              ⏳ <span id="hlv-session-clock">${formatMMSS(ui.sessionSeconds)}</span>
            </div>
            <div class="hlv-total-pill" title="Tarayıcıda kayıtlı toplam Halvet tefekkür süresi (dijital_seyyah_halvet_minutes_v1)">
              🕯️ Toplam: <span id="hlv-total-minutes">${halvetLog.totalMinutes}</span> dk
            </div>
          </div>
        </section>

        <!-- Primary 2-Column Sanctuary -->
        <div class="hlv-grid">
          <!-- 1. Selçuklu Yıldızı Nefes Rehberi -->
          <section class="hlv-card" aria-label="Selçuklu Yıldızı Nefes Rehberi">
            <div class="hlv-card-head">
              <div>
                <h3 class="hlv-card-title">✡️ Selçuklu Yıldızı &amp; Hendesesi Nefes Rehberi</h3>
                <p class="hlv-card-sub">Sekiz köşeli kadim Selçuklu yıldızıyla senkronize sükûnet nefesi</p>
              </div>
              <span class="hlv-cycle-stat" id="hlv-cycle-stat">Döngü: <strong>${ui.breathCycles}</strong></span>
            </div>

            <div class="hlv-breath-stage">
              <div class="hlv-star-wrap">
                <div class="hlv-star-aura" id="hlv-star-aura"></div>
                <svg class="hlv-seljuk-svg" id="hlv-seljuk-svg" viewBox="0 0 240 240" aria-hidden="true">
                  <defs>
                    <linearGradient id="hlvGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#fde68a" />
                      <stop offset="50%" stop-color="#f59e0b" />
                      <stop offset="100%" stop-color="#00f2fe" />
                    </linearGradient>
                    <linearGradient id="hlvTealGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#00f2fe" />
                      <stop offset="100%" stop-color="#10b981" />
                    </linearGradient>
                    <radialGradient id="hlvCoreGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stop-color="rgba(245, 158, 11, 0.34)" />
                      <stop offset="70%" stop-color="rgba(0, 242, 254, 0.12)" />
                      <stop offset="100%" stop-color="rgba(16, 185, 129, 0)" />
                    </radialGradient>
                  </defs>

                  <!-- Outer Celestial Hendese Ring -->
                  <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(245, 158, 11, 0.22)" stroke-width="1" stroke-dasharray="4 6" />
                  <circle cx="120" cy="120" r="96" fill="url(#hlvCoreGrad)" stroke="rgba(0, 242, 254, 0.25)" stroke-width="1.2" />

                  <!-- Rotating Sacred Seljuk 8-Pointed Star (Two Overlapping Squares + Rosette) -->
                  <g class="hlv-star-rotator" id="hlv-star-rotator">
                    <!-- Square 1 (0 deg) -->
                    <rect x="52" y="52" width="136" height="136" rx="3"
                      fill="rgba(245, 158, 11, 0.06)"
                      stroke="url(#hlvGoldGrad)"
                      stroke-width="2.4" />
                    <!-- Square 2 (45 deg) -->
                    <rect x="52" y="52" width="136" height="136" rx="3"
                      transform="rotate(45 120 120)"
                      fill="rgba(0, 242, 254, 0.05)"
                      stroke="url(#hlvTealGrad)"
                      stroke-width="2.4" />
                    <!-- Inner Octagon Knotwork -->
                    <polygon points="120,64 160,80 176,120 160,160 120,176 80,160 64,120 80,80"
                      fill="rgba(15, 23, 42, 0.28)"
                      stroke="rgba(253, 230, 138, 0.55)"
                      stroke-width="1.4" />
                    <!-- 8 Radiating Hendese Axis Lines -->
                    <g stroke="rgba(245, 158, 11, 0.32)" stroke-width="1">
                      <line x1="120" y1="26" x2="120" y2="214" />
                      <line x1="26" y1="120" x2="214" y2="120" />
                      <line x1="53" y1="53" x2="187" y2="187" />
                      <line x1="187" y1="53" x2="53" y2="187" />
                    </g>
                    <!-- Inner Medallion -->
                    <circle cx="120" cy="120" r="46" fill="rgba(10, 15, 29, 0.45)" stroke="url(#hlvGoldGrad)" stroke-width="1.5" />
                  </g>
                </svg>

                <div class="hlv-star-center-readout">
                  <span class="hlv-phase-label" id="hlv-phase-label">Hazır</span>
                  <span class="hlv-phase-timer" id="hlv-phase-timer">${currentRhythm.inhale}</span>
                </div>
              </div>

              <div class="hlv-breath-tagline" id="hlv-breath-tagline">${esc(currentRhythm.tagline)}</div>
              <div class="hlv-phase-cues" id="hlv-phase-cues"></div>
            </div>

            <div class="hlv-rhythm-pills" id="hlv-rhythm-pills">
              ${BREATH_RHYTHMS.map((r, idx) => `
                <button type="button" class="hlv-pill ${idx === ui.rhythmIndex ? 'active' : ''}" data-rhythm-idx="${idx}">
                  ${esc(r.label)}
                </button>
              `).join('')}
            </div>

            <div class="hlv-breath-controls">
              <button type="button" class="hlv-btn hlv-btn-primary" id="hlv-btn-breath-toggle">
                ${ui.breathingRunning ? '⏸ Nefesi Duraklat' : '▶ Nefes Rehberini Başlat'}
              </button>
              <button type="button" class="hlv-btn" id="hlv-btn-breath-reset">↺ Sıfırla</button>
            </div>
          </section>

          <!-- 2. Hikmet Külliyatı Rotator (18 Texts) -->
          <section class="hlv-card" aria-label="Hikmet Külliyatı">
            <div class="hlv-card-head">
              <div>
                <h3 class="hlv-card-title">📜 Hikmet Külliyatı (18 Kadim Metin)</h3>
                <p class="hlv-card-sub">Âyet, Hadis, Tasavvuf ve Seyahat Edebiyatından seçme irfan metinleri</p>
              </div>
              <button type="button" class="hlv-pill ${ui.autoRotate ? 'active' : ''}" id="hlv-btn-autorotate">
                ${ui.autoRotate ? '⏯ Otomatik Akış: Açık' : '⏸ Otomatik Akış: Kapalı'}
              </button>
            </div>

            <div class="hlv-hikmet-box" id="hlv-hikmet-box">
              <div class="hlv-hikmet-meta">
                <span class="hlv-hikmet-cat" id="hlv-hikmet-cat">${esc(currentHikmet.category)}</span>
                <span class="hlv-hikmet-counter" id="hlv-hikmet-counter">1 / ${HIKMET_CORPUS.length}</span>
              </div>

              <blockquote class="hlv-hikmet-quote" id="hlv-hikmet-quote">
                “${esc(currentHikmet.text)}”
              </blockquote>

              <div class="hlv-hikmet-source" id="hlv-hikmet-source">
                — ${esc(currentHikmet.author)} • ${esc(currentHikmet.source)}
              </div>

              <div class="hlv-hikmet-commentary" id="hlv-hikmet-commentary">
                <strong>Felsefî &amp; İrfânî Şerh:</strong> ${esc(currentHikmet.commentary)}
              </div>

              <div class="hlv-hikmet-dots" id="hlv-hikmet-dots">
                ${HIKMET_CORPUS.map((h, i) => `
                  <button type="button" class="hlv-dot-btn ${i === ui.hikmetIndex ? 'active' : ''}" data-hikmet-idx="${i}" title="${esc(h.author)} — ${esc(h.source)}">${i + 1}</button>
                `).join('')}
              </div>

              <div class="hlv-hikmet-nav">
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  <button type="button" class="hlv-btn" id="hlv-hikmet-prev">← Önceki</button>
                  <button type="button" class="hlv-btn" id="hlv-hikmet-next">Sonraki →</button>
                  <button type="button" class="hlv-btn" id="hlv-hikmet-random">🔀 Rastgele</button>
                </div>
                <button type="button" class="hlv-btn" id="hlv-hikmet-copy">📋 Kopyala</button>
              </div>
            </div>
          </section>
        </div>

        <!-- 3. Gemini AI ile Derin Tefekkür & Şahsî Seyir Defteri -->
        <section class="hlv-card hlv-ai-card" aria-label="Gemini AI ile Derin Tefekkür">
          <div class="hlv-card-head">
            <div>
              <h3 class="hlv-card-title">✨ Gemini AI ile Derin Tefekkür &amp; Şahsî Halvet Defteri</h3>
              <p class="hlv-card-sub">Bir tefekkür teması seç, sakin bir felsefî metin akışı başlat ve kendi tefekkür notunu Seyir Defterine kaydet</p>
            </div>
            <span class="hlv-cycle-stat" id="hlv-journal-count">Seyir Defteri: <strong>${readJournalEntries().length}</strong> kayıt</span>
          </div>

          <div class="hlv-themes-row" id="hlv-themes-row">
            ${TEFEKKUR_THEMES.map(t => `
              <button type="button" class="hlv-theme-btn ${t.id === ui.selectedThemeId ? 'active' : ''}" data-theme-id="${t.id}">
                <span class="hlv-theme-title">${t.icon} ${esc(t.title)}</span>
                <span class="hlv-theme-desc">${esc(t.subtitle)}</span>
              </button>
            `).join('')}
          </div>

          <div class="hlv-ai-controls">
            <input type="text" class="hlv-input hlv-input-flex" id="hlv-intention-input"
              value="${esc(ui.intentionText)}"
              placeholder="İsteğe bağlı: Bulunduğunuz şehir (örn. Konya, Mardin) veya kalbinizdeki niyet..." />
            <button type="button" class="hlv-btn hlv-btn-primary" id="hlv-btn-ai-start">
              ✨ Derin Tefekkür Başlat
            </button>
            <button type="button" class="hlv-btn" id="hlv-btn-ai-stop" style="display:none;">
              ⏹ Akışı Durdur
            </button>
          </div>

          <div class="hlv-ai-split">
            <!-- AI Meditation Stream Output -->
            <div class="hlv-ai-stream-box">
              <div class="hlv-ai-stream-head">
                <span id="hlv-ai-status">
                  ${ui.aiSource ? esc(ui.aiSource) : `${currentTheme.icon} Seçili Tema: ${esc(currentTheme.title)}`}
                </span>
                <div style="display:flex; gap:6px;">
                  <button type="button" class="hlv-pill" id="hlv-btn-ai-copy">📋 Kopyala</button>
                  <button type="button" class="hlv-pill" id="hlv-btn-ai-to-note">🖋️ Notuma Aktar</button>
                </div>
              </div>
              <div class="hlv-ai-body" id="hlv-ai-body">
                ${ui.aiOutput
                  ? renderMdSafe(ui.aiOutput)
                  : `<p style="color:var(--hlv-text-muted);">Yukarıdan bir tefekkür teması seçip <strong>“✨ Derin Tefekkür Başlat”</strong> butonuna tıklayın. Yapay zekâ rehberimiz seçtiğiniz tema ve o anki hikmet metni ışığında dingin bir tefekkür metni akıtacaktır.</p>`
                }
              </div>
            </div>

            <!-- Personal Reflection & Save to localStorage -->
            <div class="hlv-reflection-box">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <strong style="font-size:0.92rem;">🖋️ Şahsî Tefekkür Notum</strong>
                <button type="button" class="hlv-pill" id="hlv-btn-quote-hikmet" title="Aktif hikmeti notuma ekle">+ Hikmeti Ekle</button>
              </div>
              <textarea class="hlv-textarea" id="hlv-reflection-textarea"
                placeholder="Bu sükûnet anında kalbinden geçenleri, fark ettiklerini veya bir duayı buraya yaz...">${esc(ui.reflectionText)}</textarea>
              <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:space-between;">
                <button type="button" class="hlv-btn hlv-btn-teal" id="hlv-btn-save-reflection">
                  💾 Seyir Defterine Kaydet
                </button>
                <span style="font-size:0.74rem; color:var(--hlv-text-muted);">
                  Kayıt yeri: <code>dijital_seyyah_journal_entries</code>
                </span>
              </div>

              <div class="hlv-saved-list" id="hlv-saved-list"></div>
            </div>
          </div>
        </section>
      </div>
    `;

    bindEvents(container);
    syncNeyButtonUI();
    paintBreathingVisuals();
    paintHikmet();
    paintSavedReflections();
    startSessionClock();
    startHikmetAutoRotate();
    observeAmbientState();
  }

  // ---------------------------------------------------------------------------
  // UI Painting & Timers
  // ---------------------------------------------------------------------------
  function syncNeyButtonUI() {
    if (!containerRef || !containerRef.isConnected) return;
    const btn = containerRef.querySelector('#hlv-btn-ney');
    if (!btn) return;
    const playing = isNeyPlaying();
    btn.classList.toggle('playing', playing);
    if (playing) {
      btn.innerHTML = '🔊 Tasavvufi Ney Taksimi Kapat <span class="hlv-eq"><span></span><span></span><span></span></span>';
    } else {
      btn.innerHTML = '🎶 Tasavvufi Ney Taksimi Aç / Kapat';
    }
  }

  function observeAmbientState() {
    const target = document.getElementById('btn-ambient');
    if (!target || typeof MutationObserver === 'undefined') return;
    ambientObserver = new MutationObserver(() => {
      syncNeyButtonUI();
    });
    ambientObserver.observe(target, { attributes: true, childList: true });
  }

  function startSessionClock() {
    sessionTimerId = setInterval(() => {
      if (!containerRef || !containerRef.isConnected) {
        stop();
        return;
      }
      ui.sessionSeconds += 1;
      const el = containerRef.querySelector('#hlv-session-clock');
      if (el) el.textContent = formatMMSS(ui.sessionSeconds);
      if (ui.sessionSeconds > 0 && ui.sessionSeconds % 60 === 0) {
        const updatedLog = incrementHalvetMinute();
        const totEl = containerRef.querySelector('#hlv-total-minutes');
        if (totEl) totEl.textContent = String(updatedLog.totalMinutes);
      }
    }, 1000);
  }

  function paintBreathingVisuals() {
    if (!containerRef) return;
    const svg = containerRef.querySelector('#hlv-seljuk-svg');
    const rotator = containerRef.querySelector('#hlv-star-rotator');
    const aura = containerRef.querySelector('#hlv-star-aura');
    const phaseLbl = containerRef.querySelector('#hlv-phase-label');
    const phaseTmr = containerRef.querySelector('#hlv-phase-timer');
    const cycleEl = containerRef.querySelector('#hlv-cycle-stat');
    const toggleBtn = containerRef.querySelector('#hlv-btn-breath-toggle');
    const taglineEl = containerRef.querySelector('#hlv-breath-tagline');
    const cuesEl = containerRef.querySelector('#hlv-phase-cues');

    const rhythm = BREATH_RHYTHMS[ui.rhythmIndex] || BREATH_RHYTHMS[0];
    if (taglineEl) taglineEl.textContent = rhythm.tagline;
    if (cycleEl) cycleEl.innerHTML = `Döngü: <strong>${ui.breathCycles}</strong>`;
    if (toggleBtn) {
      toggleBtn.textContent = ui.breathingRunning ? '⏸ Nefesi Duraklat' : '▶ Nefes Rehberini Başlat';
    }

    if (cuesEl) {
      const steps = [
        { key: 'inhale', label: `↑ Nefes Al (${rhythm.inhale}s)` },
        { key: 'hold', label: `◎ Tut (${rhythm.hold}s)` },
        { key: 'exhale', label: `↓ Yavaşça Ver (${rhythm.exhale}s)` }
      ];
      if (rhythm.holdAfter && rhythm.holdAfter > 0) {
        steps.push({ key: 'holdAfter', label: `◌ Sükûtta Kal (${rhythm.holdAfter}s)` });
      }
      cuesEl.innerHTML = steps
        .map((st) => `<span class="hlv-phase-cue ${ui.phase === st.key ? 'active-' + st.key : ''}">${esc(st.label)}</span>`)
        .join('');
    }

    let label = 'Hazır';
    let scale = 0.88;
    let auraScale = 0.85;
    let auraOpacity = 0.45;
    let transitionSec = 0.7;

    if (ui.phase === 'inhale') {
      label = 'Nefes Al';
      scale = 1.13;
      auraScale = 1.24;
      auraOpacity = 0.92;
      transitionSec = rhythm.inhale;
    } else if (ui.phase === 'hold') {
      label = 'Tut';
      scale = 1.13;
      auraScale = 1.28;
      auraOpacity = 1;
      transitionSec = 0.6;
    } else if (ui.phase === 'exhale') {
      label = 'Yavaşça Ver';
      scale = 0.84;
      auraScale = 0.82;
      auraOpacity = 0.4;
      transitionSec = rhythm.exhale;
    } else if (ui.phase === 'holdAfter') {
      label = 'Sükûtta Kal';
      scale = 0.84;
      auraScale = 0.78;
      auraOpacity = 0.35;
      transitionSec = 0.6;
    }

    if (phaseLbl) phaseLbl.textContent = label;
    if (phaseTmr) phaseTmr.textContent = String(ui.phase === 'idle' ? rhythm.inhale : ui.phaseRemaining);

    if (svg) {
      svg.style.transition = `transform ${transitionSec}s cubic-bezier(0.4, 0, 0.2, 1)`;
      svg.style.transform = `scale(${scale})`;
    }
    if (rotator) {
      rotator.style.transition = `transform ${Math.max(1.2, transitionSec)}s cubic-bezier(0.37, 0, 0.63, 1)`;
      rotator.style.transform = `rotate(${ui.starAngle}deg)`;
    }
    if (aura) {
      aura.style.transition = `transform ${transitionSec}s ease, opacity ${transitionSec}s ease`;
      aura.style.transform = `scale(${auraScale})`;
      aura.style.opacity = String(auraOpacity);
    }
  }

  function advanceBreathPhase(nextPhase) {
    const rhythm = BREATH_RHYTHMS[ui.rhythmIndex] || BREATH_RHYTHMS[0];
    ui.phase = nextPhase;
    if (nextPhase === 'inhale') {
      ui.phaseTotal = rhythm.inhale;
      ui.phaseRemaining = rhythm.inhale;
      ui.starAngle += 22.5;
    } else if (nextPhase === 'hold') {
      ui.phaseTotal = rhythm.hold;
      ui.phaseRemaining = rhythm.hold;
    } else if (nextPhase === 'exhale') {
      ui.phaseTotal = rhythm.exhale;
      ui.phaseRemaining = rhythm.exhale;
      ui.starAngle += 22.5;
    } else if (nextPhase === 'holdAfter') {
      ui.phaseTotal = rhythm.holdAfter || 4;
      ui.phaseRemaining = rhythm.holdAfter || 4;
    }
    paintBreathingVisuals();
  }

  function startBreathing() {
    if (breathTimerId) clearInterval(breathTimerId);
    ui.breathingRunning = true;
    if (ui.phase === 'idle') {
      advanceBreathPhase('inhale');
    } else {
      paintBreathingVisuals();
    }

    breathTimerId = setInterval(() => {
      if (!containerRef || !containerRef.isConnected) {
        stop();
        return;
      }
      if (!ui.breathingRunning) return;

      const rhythm = BREATH_RHYTHMS[ui.rhythmIndex] || BREATH_RHYTHMS[0];
      ui.phaseRemaining -= 1;
      if (ui.phaseRemaining <= 0) {
        if (ui.phase === 'inhale') {
          advanceBreathPhase('hold');
        } else if (ui.phase === 'hold') {
          advanceBreathPhase('exhale');
        } else if (ui.phase === 'exhale' && rhythm.holdAfter && rhythm.holdAfter > 0) {
          advanceBreathPhase('holdAfter');
        } else {
          ui.breathCycles += 1;
          advanceBreathPhase('inhale');
        }
        return;
      }

      const phaseTmr = containerRef.querySelector('#hlv-phase-timer');
      if (phaseTmr) phaseTmr.textContent = String(ui.phaseRemaining);
    }, 1000);
  }

  function pauseBreathing() {
    ui.breathingRunning = false;
    if (breathTimerId) {
      clearInterval(breathTimerId);
      breathTimerId = null;
    }
    paintBreathingVisuals();
  }

  function resetBreathing() {
    pauseBreathing();
    const rhythm = BREATH_RHYTHMS[ui.rhythmIndex] || BREATH_RHYTHMS[0];
    ui.phase = 'idle';
    ui.phaseRemaining = rhythm.inhale;
    ui.starAngle = 0;
    paintBreathingVisuals();
  }

  function paintHikmet() {
    if (!containerRef) return;
    const item = HIKMET_CORPUS[ui.hikmetIndex] || HIKMET_CORPUS[0];
    const catEl = containerRef.querySelector('#hlv-hikmet-cat');
    const cntEl = containerRef.querySelector('#hlv-hikmet-counter');
    const qEl = containerRef.querySelector('#hlv-hikmet-quote');
    const srcEl = containerRef.querySelector('#hlv-hikmet-source');
    const comEl = containerRef.querySelector('#hlv-hikmet-commentary');

    if (catEl) catEl.textContent = item.category;
    if (cntEl) cntEl.textContent = `${ui.hikmetIndex + 1} / ${HIKMET_CORPUS.length}`;
    if (qEl) qEl.textContent = `“${item.text}”`;
    if (srcEl) srcEl.textContent = `— ${item.author} • ${item.source}`;
    if (comEl) comEl.innerHTML = `<strong>Felsefî &amp; İrfânî Şerh:</strong> ${esc(item.commentary)}`;

    containerRef.querySelectorAll('.hlv-dot-btn').forEach((btn) => {
      const idx = Number(btn.getAttribute('data-hikmet-idx'));
      btn.classList.toggle('active', idx === ui.hikmetIndex);
    });
  }

  function startHikmetAutoRotate() {
    if (rotateTimerId) clearInterval(rotateTimerId);
    if (!ui.autoRotate) return;
    rotateTimerId = setInterval(() => {
      if (!containerRef || !containerRef.isConnected) {
        stop();
        return;
      }
      if (!ui.autoRotate) return;
      ui.hikmetIndex = (ui.hikmetIndex + 1) % HIKMET_CORPUS.length;
      paintHikmet();
    }, 24000);
  }

  function paintSavedReflections() {
    if (!containerRef) return;
    const listEl = containerRef.querySelector('#hlv-saved-list');
    const countEl = containerRef.querySelector('#hlv-journal-count');
    const allEntries = readJournalEntries();
    if (countEl) countEl.innerHTML = `Seyir Defteri: <strong>${allEntries.length}</strong> kayıt`;
    if (!listEl) return;

    const halvetEntries = allEntries.filter(e => e && e.source === 'halvet');
    if (halvetEntries.length === 0) {
      listEl.innerHTML = `<div style="font-size:0.78rem; color:var(--hlv-text-subtle);">Henüz Halvet odasından kaydedilmiş şahsî tefekkür notu yok.</div>`;
      return;
    }

    listEl.innerHTML = halvetEntries.slice(0, 6).map(entry => {
      const d = entry.createdAt ? new Date(entry.createdAt) : null;
      const dateLabel = d && !Number.isNaN(d.getTime())
        ? d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';
      const preview = String(entry.notes || entry.content || '').trim();
      return `
        <div class="hlv-saved-item">
          <div style="flex:1; min-width:0;">
            <div class="hlv-saved-meta">${esc(entry.theme || entry.title || 'Halvet Notu')} ${dateLabel ? `• ${esc(dateLabel)}` : ''}</div>
            <div class="hlv-saved-text">${esc(preview)}</div>
          </div>
          <button type="button" class="hlv-pill" data-delete-id="${esc(entry.id)}" title="Bu notu sil">✕</button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-delete-id');
        const next = readJournalEntries().filter(item => item && item.id !== targetId);
        writeJournalEntries(next);
        paintSavedReflections();
        notify('🗑️ Halvet tefekkür notu silindi.');
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Event Wiring
  // ---------------------------------------------------------------------------
  function bindEvents(container) {
    // 1. Ney Toggle
    const btnNey = container.querySelector('#hlv-btn-ney');
    if (btnNey) {
      btnNey.addEventListener('click', () => {
        toggleNeyTaksimi();
        setTimeout(syncNeyButtonUI, 60);
      });
    }

    // Zen Dim Light Toggle
    const btnZenDim = container.querySelector('#hlv-btn-zen-dim');
    if (btnZenDim) {
      btnZenDim.addEventListener('click', () => {
        ui.zenDim = !ui.zenDim;
        const root = container.querySelector('#hlv-root');
        if (root) root.classList.toggle('hlv-zen-dim', ui.zenDim);
        btnZenDim.textContent = ui.zenDim ? '☀️ Işığı Aç' : '🕯️ Halvet Işığı';
      });
    }

    // Fullscreen Halvet Mode Toggle (requestFullscreen)
    const btnFullscreen = container.querySelector('#hlv-btn-fullscreen');
    if (btnFullscreen) {
      const updateFsBtn = () => {
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
        btnFullscreen.textContent = fsEl ? '✕ Tam Ekrandan Çık' : '⛶ Tam Ekran Halvet Modu';
      };
      fullscreenHandler = updateFsBtn;
      document.addEventListener('fullscreenchange', updateFsBtn);
      document.addEventListener('webkitfullscreenchange', updateFsBtn);
      updateFsBtn();

      btnFullscreen.addEventListener('click', () => {
        const root = container.querySelector('#hlv-root');
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
        if (fsEl) {
          const exitFn = document.exitFullscreen || document.webkitExitFullscreen;
          if (exitFn) {
            Promise.resolve(exitFn.call(document)).catch(() => {});
          }
        } else if (root) {
          const reqFn = root.requestFullscreen || root.webkitRequestFullscreen;
          if (reqFn) {
            Promise.resolve(reqFn.call(root))
              .then(() => notify('⛶ Tam Ekran Halvet Modu açıldı (ESC ile çıkabilirsiniz)'))
              .catch(() => notify('⚠️ Tam ekran modu tarayıcı tarafından desteklenmiyor veya engellendi.'));
          } else {
            notify('⚠️ Tarayıcınız tam ekran modunu desteklemiyor.');
          }
        }
      });
    }

    // 2. Breathing Rhythm & Controls
    container.querySelectorAll('[data-rhythm-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-rhythm-idx'));
        if (!Number.isFinite(idx) || !BREATH_RHYTHMS[idx]) return;
        ui.rhythmIndex = idx;
        container.querySelectorAll('[data-rhythm-idx]').forEach(b => {
          b.classList.toggle('active', Number(b.getAttribute('data-rhythm-idx')) === idx);
        });
        const wasRunning = ui.breathingRunning;
        resetBreathing();
        if (wasRunning) startBreathing();
      });
    });

    const btnBreathToggle = container.querySelector('#hlv-btn-breath-toggle');
    if (btnBreathToggle) {
      btnBreathToggle.addEventListener('click', () => {
        if (ui.breathingRunning) {
          pauseBreathing();
        } else {
          startBreathing();
        }
      });
    }

    const btnBreathReset = container.querySelector('#hlv-btn-breath-reset');
    if (btnBreathReset) {
      btnBreathReset.addEventListener('click', resetBreathing);
    }

    // 3. Hikmet Rotator Controls
    const btnPrev = container.querySelector('#hlv-hikmet-prev');
    const btnNext = container.querySelector('#hlv-hikmet-next');
    const btnRand = container.querySelector('#hlv-hikmet-random');
    const btnCopyHikmet = container.querySelector('#hlv-hikmet-copy');
    const btnAutoRotate = container.querySelector('#hlv-btn-autorotate');

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        ui.hikmetIndex = (ui.hikmetIndex - 1 + HIKMET_CORPUS.length) % HIKMET_CORPUS.length;
        paintHikmet();
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        ui.hikmetIndex = (ui.hikmetIndex + 1) % HIKMET_CORPUS.length;
        paintHikmet();
      });
    }
    if (btnRand) {
      btnRand.addEventListener('click', () => {
        if (HIKMET_CORPUS.length > 1) {
          let next = Math.floor(Math.random() * HIKMET_CORPUS.length);
          if (next === ui.hikmetIndex) next = (next + 1) % HIKMET_CORPUS.length;
          ui.hikmetIndex = next;
          paintHikmet();
        }
      });
    }
    if (btnCopyHikmet) {
      btnCopyHikmet.addEventListener('click', () => {
        const h = HIKMET_CORPUS[ui.hikmetIndex];
        const text = `“${h.text}”\n— ${h.author} (${h.source})`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => notify('📋 Hikmet metni kopyalandı!')).catch(() => {});
        }
      });
    }
    if (btnAutoRotate) {
      btnAutoRotate.addEventListener('click', () => {
        ui.autoRotate = !ui.autoRotate;
        btnAutoRotate.classList.toggle('active', ui.autoRotate);
        btnAutoRotate.textContent = ui.autoRotate ? '⏯ Otomatik Akış: Açık' : '⏸ Otomatik Akış: Kapalı';
        if (ui.autoRotate) {
          startHikmetAutoRotate();
        } else if (rotateTimerId) {
          clearInterval(rotateTimerId);
          rotateTimerId = null;
        }
      });
    }
    container.querySelectorAll('.hlv-dot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-hikmet-idx'));
        if (Number.isFinite(idx) && HIKMET_CORPUS[idx]) {
          ui.hikmetIndex = idx;
          paintHikmet();
        }
      });
    });

    // 4. Gemini AI Theme Selection & Stream
    container.querySelectorAll('[data-theme-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tid = btn.getAttribute('data-theme-id');
        if (!tid) return;
        ui.selectedThemeId = tid;
        container.querySelectorAll('[data-theme-id]').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-theme-id') === tid);
        });
        const th = TEFEKKUR_THEMES.find(x => x.id === tid);
        const statusEl = container.querySelector('#hlv-ai-status');
        if (statusEl && th && !ui.aiStreaming) {
          statusEl.textContent = `${th.icon} Seçili Tema: ${th.title}`;
        }
      });
    });

    const intentionInput = container.querySelector('#hlv-intention-input');
    if (intentionInput) {
      intentionInput.addEventListener('input', (e) => {
        ui.intentionText = e.target.value;
      });
    }

    const btnAiStart = container.querySelector('#hlv-btn-ai-start');
    const btnAiStop = container.querySelector('#hlv-btn-ai-stop');
    const aiBody = container.querySelector('#hlv-ai-body');
    const aiStatus = container.querySelector('#hlv-ai-status');

    async function triggerAiMeditation() {
      if (ui.aiStreaming) return;
      const theme = TEFEKKUR_THEMES.find(t => t.id === ui.selectedThemeId) || TEFEKKUR_THEMES[0];
      const currentHikmet = HIKMET_CORPUS[ui.hikmetIndex] || HIKMET_CORPUS[0];

      ui.streamRunId += 1;
      const myRun = ui.streamRunId;
      ui.aiStreaming = true;
      ui.aiOutput = '';

      if (streamAbortController) {
        try { streamAbortController.abort(); } catch (_) {}
      }
      streamAbortController = new AbortController();

      if (btnAiStart) btnAiStart.disabled = true;
      if (btnAiStop) btnAiStop.style.display = 'inline-flex';
      if (aiStatus) aiStatus.textContent = `✨ “${theme.title}” üzerine tefekkür hazırlanıyor...`;
      if (aiBody) aiBody.innerHTML = `<p style="color:var(--hlv-text-muted);">Sükûnetle dinleniyor... <span class="hlv-cursor"></span></p>`;

      try {
        const result = await runGeminiMeditation({
          theme,
          intention: ui.intentionText,
          currentHikmet,
          signal: streamAbortController.signal,
          onUpdate: (partial) => {
            if (myRun !== ui.streamRunId || !container.isConnected) return;
            ui.aiOutput = partial;
            if (aiBody) {
              aiBody.innerHTML = renderMdSafe(partial) + '<span class="hlv-cursor"></span>';
            }
          }
        });

        if (myRun !== ui.streamRunId || !container.isConnected) return;
        ui.aiOutput = result.text;
        ui.aiSource = result.source;
        if (aiBody) aiBody.innerHTML = renderMdSafe(result.text);
        if (aiStatus) aiStatus.textContent = `${theme.icon} ${theme.title} • ${result.source}`;
      } catch (err) {
        if (err && err.name === 'AbortError') {
          if (aiStatus) aiStatus.textContent = '⏹ Tefekkür akışı durduruldu.';
          if (aiBody && ui.aiOutput) aiBody.innerHTML = renderMdSafe(ui.aiOutput);
        } else {
          if (aiStatus) aiStatus.textContent = '⚠️ Tefekkür alınırken bir kesinti oldu.';
        }
      } finally {
        if (myRun === ui.streamRunId) {
          ui.aiStreaming = false;
          if (btnAiStart) btnAiStart.disabled = false;
          if (btnAiStop) btnAiStop.style.display = 'none';
        }
      }
    }

    if (btnAiStart) btnAiStart.addEventListener('click', triggerAiMeditation);
    if (btnAiStop) {
      btnAiStop.addEventListener('click', () => {
        if (streamAbortController) {
          try { streamAbortController.abort(); } catch (_) {}
        }
      });
    }

    const btnAiCopy = container.querySelector('#hlv-btn-ai-copy');
    if (btnAiCopy) {
      btnAiCopy.addEventListener('click', () => {
        if (!ui.aiOutput) {
          notify('Önce bir tefekkür metni oluşturun.');
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(ui.aiOutput).then(() => notify('📋 AI tefekkür metni kopyalandı!')).catch(() => {});
        }
      });
    }

    // 5. Personal Reflection & localStorage Save
    const reflectionEl = container.querySelector('#hlv-reflection-textarea');
    if (reflectionEl) {
      reflectionEl.addEventListener('input', (e) => {
        ui.reflectionText = e.target.value;
      });
    }

    const btnAiToNote = container.querySelector('#hlv-btn-ai-to-note');
    if (btnAiToNote) {
      btnAiToNote.addEventListener('click', () => {
        if (!ui.aiOutput) {
          notify('Önce bir AI tefekkür metni başlatın.');
          return;
        }
        const plain = ui.aiOutput.replace(/^#{1,4}\s+/gm, '').trim();
        ui.reflectionText = ui.reflectionText ? `${ui.reflectionText}\n\n${plain}` : plain;
        if (reflectionEl) reflectionEl.value = ui.reflectionText;
        notify('🖋️ AI tefekkürü not alanına aktarıldı.');
      });
    }

    const btnQuoteHikmet = container.querySelector('#hlv-btn-quote-hikmet');
    if (btnQuoteHikmet) {
      btnQuoteHikmet.addEventListener('click', () => {
        const h = HIKMET_CORPUS[ui.hikmetIndex];
        const snippet = `“${h.text}” (${h.author} — ${h.source})`;
        ui.reflectionText = ui.reflectionText ? `${ui.reflectionText}\n\n${snippet}` : snippet;
        if (reflectionEl) reflectionEl.value = ui.reflectionText;
        notify('📜 Hikmet metni notunuza eklendi.');
      });
    }

    const btnSaveReflection = container.querySelector('#hlv-btn-save-reflection');
    if (btnSaveReflection) {
      btnSaveReflection.addEventListener('click', () => {
        const note = (reflectionEl ? reflectionEl.value : ui.reflectionText).trim();
        const aiText = (ui.aiOutput || '').trim();
        if (!note && !aiText) {
          notify('✍️ Kaydetmek için şahsî tefekkür notunuzu yazın veya bir AI tefekkürü oluşturun.');
          return;
        }

        const theme = TEFEKKUR_THEMES.find(t => t.id === ui.selectedThemeId) || TEFEKKUR_THEMES[0];
        const h = HIKMET_CORPUS[ui.hikmetIndex] || HIKMET_CORPUS[0];
        const matched = matchProvinceFromText(ui.intentionText) || matchProvinceFromText(note);

        const combinedContent = [
          note ? `### 🖋️ Şahsî Tefekkürüm\n${note}` : '',
          aiText ? `### ✨ Derin Tefekkür (${theme.title})\n${aiText}` : '',
          `> 📜 *${h.text}* — ${h.author} (${h.source})`
        ].filter(Boolean).join('\n\n');

        const entry = {
          id: `halvet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          cityKey: matched ? matched.key : null,
          cityName: matched ? matched.province.name : 'Halvet Odası',
          plate: matched ? (matched.province.plate || null) : null,
          region: matched ? (matched.province.region || '') : 'İçsel Yolculuk',
          mode: 'halvet',
          styleLabel: `🕯️ Halvet • ${theme.title}`,
          notes: note || aiText.slice(0, 240),
          title: `Halvet Tefekkürü — ${theme.title}`,
          content: combinedContent,
          model: ui.aiSource || 'Halvet & Hikmet',
          source: 'halvet',
          theme: `${theme.icon} ${theme.title}`,
          hikmetSource: `${h.author} • ${h.source}`,
          breathCycles: ui.breathCycles,
          createdAt: new Date().toISOString()
        };

        const entries = readJournalEntries();
        entries.unshift(entry);
        const ok = writeJournalEntries(entries);
        if (ok) {
          ui.reflectionText = '';
          if (reflectionEl) reflectionEl.value = '';
          paintSavedReflections();
          notify(`🕯️ Tefekkür notunuz Seyir Defterine kaydedildi! (Toplam ${entries.length} kayıt)`);
        } else {
          notify('⚠️ Tarayıcı depolama alanına kaydedilemedi.');
        }
      });
    }
  }

  window.SEYYAH_MODULES.halvet = {
    render: render,
    stop: stop
  };
})();
