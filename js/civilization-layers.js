/**
 * Anadolu Medeniyet Katmanları & Zaman Felsefesi (Taşın Hafızası)
 * 7 katmanlı arkeolojik & felsefi medeniyet kaşifi, 81 il eşleştirmesi,
 * banner.jpg şehir kartları ve window.SEYYAH_AI.stream destekli zaman felsefesi yorumcusu.
 * Registers on window.SEYYAH_MODULES.civLayers = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-civ-layers-styles';
  const THESIS_QUOTE =
    "Anadolu'da her taş bir medeniyetin mührü, her harabe zamanın faniliğine ve hakikatin bekasına bir şahittir.";

  // ---------------------------------------------------------------------------
  // Helpers (Turkish normalization, escaping, safe markdown, banner resolution)
  // ---------------------------------------------------------------------------
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

  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  function resolveBannerPath(p) {
    if (p && p.has_banner && p.banner_rel) return p.banner_rel;
    if (p && p.banner_rel) return p.banner_rel;
    if (p && Array.isArray(p.images) && p.images[0]) return p.images[0];
    return 'assets/banner.jpg';
  }

  function formatPlate(plate) {
    const n = Number(plate);
    if (!Number.isFinite(n) || n <= 0) return '--';
    return String(n).padStart(2, '0');
  }

  // ---------------------------------------------------------------------------
  // 7-Strata Civilization & Philosophy Definitions (covering all 81 provinces)
  // ---------------------------------------------------------------------------
  const STRATA = [
    {
      id: 'neolithic',
      depthNum: 'I',
      depthLabel: 'Katman I · En Derin Eşik',
      era: 'MÖ 10.000+',
      icon: '🪨',
      shortTitle: 'Neolitik & İlk Mabed',
      title: '🪨 Neolitik & İlk Mabed (MÖ 10.000+)',
      subtitle: 'Göbeklitepe, Çatalhöyük, Aşıklı Höyük — İnsanın anlam arayışının şafağı',
      accent: '#f59e0b',
      accentSoft: 'rgba(245, 158, 11, 0.16)',
      anchors: ['Göbeklitepe', 'Çatalhöyük', 'Aşıklı Höyük', 'Karahantepe', 'Çayönü'],
      epigraph: 'İnsan önce karnını doyurmak için değil, göğün altında anlam bulmak için taşı yonttu.',
      essay:
        'Anadolu’nun en alt katmanında zaman henüz saatlere, takvimlere ve imparatorluk sınırlarına bölünmemiştir. Göbeklitepe’nin T biçimli dikilitaşlarından Çatalhöyük’ün damdan girilen kerpiç odalarına kadar bu çağ, insanın avcı-toplayıcı göçebelikten çıkarak ilk kez "ben kimim ve kâinattaki yerim ne?" sorusunu taşa kazıdığı metafizik şafaktır. Mabet, yerleşimden önce doğmuş; taş, barınaktan önce duaya ev olmuştur.',
      philosophy: {
        time:
          'Döngüsel ve kozmik zaman: Mevsimlerin, göç yollarının ve yıldızların ritmiyle işleyen, henüz çizgisel ilerleme kaygısı taşımayan kutsal şimdiki zaman.',
        space:
          'Merkezi dikilitaşlar ve ocak başı: Gökyüzüyle yeryüzünü buluşturan dairevî tapınak halkaları; sokaksız, eşitlikçi, bitişik kerpiç komşuluklar.',
        humanity:
          'Anlam arayan insan (Homo Religiosus): Doğayı yalnızca tüketen değil, hayvan kabartmaları ve ata kafataslarıyla öte-âlemle bağ kuran ilk bilge topluluklar.'
      },
      provinces: {
        'Şanlıurfa': 'Göbeklitepe & Karahantepe — Tarihin sıfır noktasında T-dikilitaşlı ilk kutsal halkalar.',
        'Konya': 'Çatalhöyük & Boncuklu Höyük — Sokaksız kerpiç evlerde damlardan kurulan ilk şehir hafızası.',
        'Aksaray': 'Aşıklı Höyük — Orta Anadolu’da 10.000 yıllık yerleşik düzen ve ilk trepanasyon izleri.',
        'Diyarbakır': 'Çayönü & Körtiktepe — Yukarı Dicle kıyısında tarım ve bakırın ilk tanıklığı.',
        'Batman': 'Hallan Çemi & Hasankeyf Höyük — Dicle vadisinde avcılıktan yerleşik hayata geçiş eşiği.',
        'Mardin': 'Boncuklu Tarla — 12.000 yıllık kamu yapıları ve erken Neolitik taş işçiliği.',
        'Siirt': 'Gusir Höyük — Botan Vadisi’nde T-dikilitaş akrabası erken tapınak izleri.',
        'Kahramanmaraş': 'Direkli Mağarası & Domuztepe — Epipaleolitik mağaradan Halaf höyüğüne kesintisiz geçiş.',
        'Malatya': 'Cafer Höyük & Arslantepe erken tabakaları — Fırat kıyısında çanak-çömleksiz Neolitik izler.',
        'Mersin': 'Yumuktepe Höyüğü — Dokuz bin yıllık kesintisiz höyük stratigrafisi ve erken tarım.',
        'Antalya': 'Karain & Beldibi Mağaraları — Paleolitik taş aletlerden Neolitik kaya resimlerine şahitlik.',
        'Burdur': 'Hacılar & Kuruçay Höyükleri — Göller Yöresi boyalı seramik ve Ana Tanrıça figürinleri.',
        'Bursa': 'Ilıpınar & Barcın Höyük — Marmara havzasının Avrupa’ya uzanan ilk köy yerleşimleri.',
        'İstanbul': 'Yarımburgaz Mağarası & Yenikapı — Boğaz suları altında kalan 8.500 yıllık Neolitik ahşap ve mezarlar.',
        'Kırklareli': 'Aşağı Pınar — Trakya ve Balkanlar kapısında erken Neolitik tarım kültürü.'
      }
    },
    {
      id: 'bronze_iron',
      depthNum: 'II',
      depthLabel: 'Katman II · Kadim Krallıklar',
      era: 'MÖ 2000 – MÖ 550',
      icon: '🦁',
      shortTitle: 'Hitit, Urartu, Frig & Likya',
      title: '🦁 Hitit, Urartu, Frig & Likya',
      subtitle: 'Hattuşa, Tuşpa, Yazılıkaya, Patara — Anadolu’nun kadim devlet aklı',
      accent: '#eab308',
      accentSoft: 'rgba(234, 179, 8, 0.16)',
      anchors: ['Hattuşa', 'Tuşpa', 'Yazılıkaya', 'Patara', 'Gordion'],
      epigraph: 'Kılıç paslanır, taht devrilir; fakat kil tablete yazılan hukuk ve kayaya oyulan su kanalı baki kalır.',
      essay:
        'Bu katmanda Anadolu ilk kez yazılı hukukla, devlet arşivleriyle ve mühendislik iradesiyle tanışır. Hattuşa’nın binlerce kil tableti diplomasiyi (Kadeş), Tuşpa’nın sarp kayaları ve Şamram Kanalı zor coğrafyayı bayındır kılan azmi, Friglerin Yazılıkaya’sı doğa-inanç uyumunu, Likya’nın Patara Meclisi ise temsil fikrini taşa nakşeder. Her kale ve kaya anıtı, geçici iktidarların ardında kalıcı bir devlet aklı bırakma çabasıdır.',
      philosophy: {
        time:
          'Arşivlenen ve kayda geçen zaman: Kral yıllıklarının, antlaşma tarihlerinin ve hanedan kronolojilerinin kil tabletlere ve çivi yazılı kayalara emanet edilişi.',
        space:
          'Sarp kale, kutsal pınar ve birleşen kentler: Bozkırın kalbinde surlarla tahkim edilen başkentler, dağ geçitlerini aşan su kanalları ve federatif kent birlikleri.',
        humanity:
          'Yasa koyan ve söz veren insan: "Bin Tanrılı" Anadolu’da farklı inançları aynı devlet çatısında tutan hukuk, antlaşma ve sorumluluk bilinci.'
      },
      provinces: {
        'Çorum': 'Hattuşa & Alacahöyük — Hitit İmparatorluğu başkenti, Aslanlı Kapı ve Kadeş arşivi.',
        'Van': 'Tuşpa (Van Kalesi) & Şamram Kanalı — Urartu krallığının kaya surları ve 51 km’lik su mirası.',
        'Eskişehir': 'Yazılıkaya Midas Anıtı — Frig vadisinin göğe bakan anıtsal kaya cephesi.',
        'Ankara': 'Gordion & Frig Tümülüsleri — Kral Midas’ın başkenti ve erken Demir Çağı ahşap işçiliği.',
        'Afyonkarahisar': 'Ayazini & Aslankaya — Friglerin kayalara oyduğu kutsal tapınak ve aslan kabartmaları.',
        'Kütahya': 'Frig Vadisi Deliktaş & Seyitömer Höyük — Tunç Çağı mühürleri ve kaya kaleleri.',
        'Antalya': 'Patara, Xanthos & Letoon — Likya Birliği’nin tarihe ilham veren ilk meclis yapısı.',
        'Muğla': 'Kaunos & Tlos — Dik uçurumlara oyulmuş Likya ve Karya kral kaya mezarları.',
        'Osmaniye': 'Karatepe-Aslantaş — Geç Hitit ve Fenike dillerinde çift dilli yazıtlı açık hava kalesi.',
        'Kayseri': 'Kültepe (Kaniş-Karum) — Anadolu’nun en eski yazılı ticaret tabletleri ve sözleşme hukuku.',
        'Sivas': 'Kuşaklı (Sarissa) & Kayalıpınar — Hitit eyalet merkezleri ve çivi yazılı arşivler.',
        'Yozgat': 'Kerkenes Dağı (Pteria) & Alişar Höyük — Demir Çağı surları ve Tunç Çağı tabakaları.',
        'Kırşehir': 'Kaman-Kalehöyük — Hitit ve Demir Çağı stratigrafisinin kesintisiz laboratuvarı.',
        'Çankırı': 'İnandıktepe — Hitit tören vazosu ve kutsal tapınak kalıntıları.',
        'Kırıkkale': 'Büklükale — Kızılırmak geçidinde Hitit ve Kimmer katmanları.',
        'Nevşehir': 'Acemhöyük & Kaya Sığınakları — Asur ticaret kolonileri ve Hitit savunma geçitleri.',
        'Adıyaman': 'Nemrut Dağı & Arsameia — Kommagene Krallığının Doğu-Batı sentezli tanrı heykelleri.',
        'Gaziantep': 'Karkamış & Yesemek — Geç Hitit açık hava heykel atölyesi ve Fırat kalesi.',
        'Kilis': 'Oylum Höyük — Güneydoğu’da Tunç ve Demir Çağı şehir devleti merkezi.',
        'Elazığ': 'Harput & Norşuntepe — Hurri-Hitit ve Urartu kaya sarnıçları.',
        'Erzincan': 'Altıntepe — Urartu tapınak, apadana ve duvar freskleri kompleksi.',
        'Malatya': 'Arslantepe — İlk kılıçların ve devlet öncesi mühürlü sarayın bulunduğu höyük.',
        'Bitlis': 'Adilcevaz Kef Kalesi — Van Gölü kuzeyinde Urartu bazalt kabartmaları.',
        'Ağrı': 'Aznavurtepe (Patnos) — Urartu kral yazıtları ve kuzey sınır garnizonu.',
        'Muş': 'Kayalıdere — Murat Havzası’nda Urartu kalesi ve bronz eserleri.',
        'Bingöl': 'Kral Kızı Kalesi — Sarp dağ geçitlerinde Urartu karakol izleri.',
        'Iğdır': 'Karakale — Aras kıyısında Urartu devri taş kale temelleri.',
        'Tunceli': 'Mazgirt Kaleköy — Munzur ve Peri Vadisi’nde Urartu kaya kitabeleri.',
        'Hakkari': 'Hakkari Stelleri — Demir Çağı dağ beylerini tasvir eden 13 gizemli dikilitaş.',
        'Şırnak': 'Cudi & Finik Kaya Kabartmaları — Mezopotamya ve Anadolu geçidinde Asur-Urartu izleri.'
      }
    },
    {
      id: 'classical',
      depthNum: 'III',
      depthLabel: 'Katman III · Akıl & Mermer',
      era: 'MÖ 600 – MS 600',
      icon: '🏛️',
      shortTitle: 'Antik Çağ & Roma Mirası',
      title: '🏛️ Antik Çağ & Roma Mirası',
      subtitle: 'Efes, Afrodisias, Sagalassos, Zeugma — Taş ve su mühendisliği',
      accent: '#00f2fe',
      accentSoft: 'rgba(0, 242, 254, 0.15)',
      anchors: ['Efes', 'Afrodisias', 'Sagalassos', 'Zeugma', 'Aspendos'],
      epigraph: 'Mermer soğuktur ama suyu akıtan kemere, sesi büyüten tiyatroya ve aklı saklayan kütüphaneye dönüşünce canlanır.',
      essay:
        'İyonya kıyılarında "Her şey akar" (Panta Rhei) diyen Herakleitos’tan, Roma’nın kıtaları bağlayan taş yollarına ve su kemerlerine kadar bu katman, doğayı akıl ve geometriyle yorumlayan medeniyetin şahikasıdır. Efes’te Celsus Kütüphanesi’nin mermer cephesi bilgiye duyulan saygıyı, Aspendos’un akustiği sanatın matematiğini, Sagalassos’un hâlâ gürül gürül akan Antoninler Çeşmesi ise su mühendisliğinin ölümsüzlüğünü fısıldar.',
      philosophy: {
        time:
          'Logos ve ölçülü akış: Değişimin (oluş ve bozuluşun) ardındaki değişmez düzeni —Logos’u— felsefe, mimari oran ve kent takvimiyle yakalama arzusu.',
        space:
          'Polis, Agora ve Su Kemeri: İnsanın yalnızca barındığı değil; tartıştığı, tiyatroda arındığı, hamamda şifalandığı, limanlarla dünyaya açıldığı kamusal mekân.',
        humanity:
          'Düşünen ve inşa eden Yurttaş: Aklı merkeze alan filozof, mermeri konuşturan heykeltıraş (Afrodisias) ve suyu dağlardan şehre taşıyan mühendis.'
      },
      provinces: {
        'İzmir': 'Efes, Bergama & Agora — İyonya felsefesi, Celsus Kütüphanesi ve Asklepion şifa merkezi.',
        'Aydın': 'Afrodisias, Milet & Didim — Thales’in doğa felsefesi ve mermer heykeltıraşlık ekolü.',
        'Burdur': 'Sagalassos & Kibyra — 1.700 m rakımda 2.000 yıldır suyu akan Antoninler Çeşmesi.',
        'Gaziantep': 'Zeugma — Fırat kıyısında su kanalları ve Çingene Kızı mozaik estetiği.',
        'Denizli': 'Hierapolis & Laodikeia — Kutsal kaplıca suyu üzerinde yükselen Roma tiyatro ve caddeleri.',
        'Manisa': 'Sardes — Lidya sikke devrimi ve antik dünyanın en görkemli Roma gymnasiumlarından biri.',
        'Uşak': 'Blaundos & Clandras — Derin kanyon üzerinde kemerli su ve kent mühendisliği.',
        'Muğla': 'Knidos, Stratonikeia & Bodrum — Eudoxus’un gözlemevi ve antik bilim limanları.',
        'Çanakkale': 'Troya, Assos & Alexandria Troas — Homeros destanı ve Aristoteles’in felsefe okulu.',
        'Balıkesir': 'Kyzikos & Antandros — Marmara ve Kaz Dağı eteklerinde antik liman kentleri.',
        'Antalya': 'Aspendos, Perge & Side — Kusursuz akustikli tiyatro ve kilometrelerce su kemeri.',
        'Isparta': 'Pisidia Antiokheia — Göller bölgesinin su kemerli Roma eyalet başkenti.',
        'Mersin': 'Kanlıdivane, Uzuncaburç & Soli — Kilikya taş mimarisi ve sütunlu caddeler.',
        'Adana': 'Taşköprü & Anavarza — İki bin yıldır araç ve insan taşıyan Roma taş köprüsü.',
        'Hatay': 'Titus Tüneli & Antakya — Dağı el emeğiyle yararak seli yönlendiren Roma su mühendisliği.',
        'Kütahya': 'Aizanoi — Dünyanın ilk borsa yapısı, Zeus Tapınağı ve antik stadyum.',
        'Niğde': 'Tyana Su Kemerleri & Roma Havuzu — Bozkırda suyu kilometrelerce taşıyan kemer disiplini.',
        'Nevşehir': 'Göreme & Derinkuyu — Erken Hristiyanlık çağının kayalara oyulu manastır ve yeraltı şehirleri.',
        'Amasya': 'Pontus Kral Kaya Mezarları — Yeşilırmak vadisinin kayalara oyulmuş Hellenistik anıtları.',
        'Sakarya': 'Justinianus (Beşköprü) — 365 metrelik 12 kemerli Geç Roma köprü mühendisliği.',
        'Kocaeli': 'Nicomedia — Roma İmparatorluğu’nun Doğu başkenti ve antik su yolları.',
        'Tekirdağ': 'Perinthos — Marmara kuzeyinin Roma eyalet merkezi ve antik tiyatrosu.',
        'Yalova': 'Pythia Therma — Roma ve Bizans imparatorlarının şifalı termal külliyesi.',
        'Bolu': 'Claudiopolis (Bithynium) — Roma stadyumu ve Batı Karadeniz antik yolu.',
        'Düzce': 'Prusias ad Hypium (Konuralp) — Karadeniz’in ayakta kalan antik Roma tiyatrosu.',
        'Zonguldak': 'Tios (Filyos) — Karadeniz kıyısında kazısı süren eşsiz antik liman şehri.',
        'Bartın': 'Amastris & Kuşkayası Yol Anıtı — Roma lejyonlarının kaya nişli yol anıtı.',
        'Sinop': 'Sinope — Diyojen’in şehri ve antik Karadeniz deniz ticaret kolonisi.',
        'Samsun': 'Amisos & Asarkale — Pontus kraliyet hazineleri ve kaya mezarları.',
        'Ordu': 'Kurul Kalesi — Tanrıça Kibele heykelinin bulunduğu sarp Hellenistik akropol.',
        'Giresun': 'Kerasus & Giresun Adası — Kirazın dünyaya yayıldığı antik ada ve tapınak.',
        'Trabzon': 'Trapezus & Sümela Manastırı — Dağ yamacına asılı asırlık kaya manastırı.',
        'Rize': 'Rhizaeum & Fırtına Vadisi — Antik Kolhis-Roma geçiş yolları ve kaleleri.',
        'Artvin': 'Çoruh & Klarceti — Erken Ortaçağ taş kiliseleri ve kanyon köprüleri.',
        'Gümüşhane': 'Satala Antik Kenti — Roma XV. Lejyonu’nun Doğu sınır karargâhı ve su kemeri.',
        'Kars': 'Ani (Erken Katedral Katmanı) — İpek Yolu geçidinde görkemli taş katedral ve sur sanatı.'
      }
    },
    {
      id: 'seljuk',
      depthNum: 'IV',
      depthLabel: 'Katman IV · İrfan & Şifa',
      era: '1071 – 1308',
      icon: '🌙',
      shortTitle: 'Selçuklu Darüşşifa & Medrese',
      title: '🌙 Selçuklu Darüşşifa, Medrese & Kervansarayları',
      subtitle: 'Konya, Sivas Divriği, Erzurum, Aksaray Sultanhanı — İlim, şifa ve yol emniyeti medeniyeti',
      accent: '#10b981',
      accentSoft: 'rgba(16, 185, 129, 0.16)',
      anchors: ['Divriği', 'Sultanhanı', 'Gevher Nesibe', 'Karatay', 'Ahlat'],
      epigraph: 'Kervansarayda üç gün dil, din, rütbe sorulmaz; medresede akıl ile kalp aynı çini kubbenin altında buluşur.',
      essay:
        'Anadolu’nun İslam ve Türk irfanıyla mayalandığı Selçuklu asrında mekân artık fethedilecek bir arazi değil, "imar ve ihya edilecek bir emanet"tir. Bir menzil mesafesine (yaklaşık 40 km) kurulan kervansaraylar yolcunun can ve mal emniyetini devlet garantisine alırken; Kayseri Gevher Nesibe, Sivas Divriği ve Çankırı Taş Mescit darüşşifaları bedeni musiki, su sesi ve hekimlikle tedavi eder. Kırşehir’deki Cacabey Medresesi yıldızları gözler, Konya’da Mevlana ve Sadreddin Konevî varlığı aşkla tefsir eder.',
      philosophy: {
        time:
          'Ezel ile Ebed arasında "İbnü’l-Vakt" (Anın Çocuğu): Geçecek olan dünya zamanını sadaka-i cariye, vakıf ve kalıcı ilim eserleriyle ebediyete bağlama bilinci.',
        space:
          'Menzil, Taç Kapı ve Şifahane: Yolları güvenli hanlarla ören, taşa güneş ve gölge oyunları (Divriği) işleyen, merkezinde avlu ve şadırvan olan içe dönük huzur mekânı.',
        humanity:
          'Yolcu (Garib), Talebe ve Ârif: İnsanı "eşref-i mahlûkat" bilen; yolcusunu 3 gün ücretsiz ağırlayan, hastasına su ve ney sesiyle bakan merhamet medeniyeti.'
      },
      provinces: {
        'Konya': 'Alaaddin Tepesi, Karatay & İnce Minareli Medrese — Selçuklu payitahtı ve Mevlana irfan havzası.',
        'Sivas': 'Divriği Ulu Cami ve Darüşşifası, Gök Medrese & Çifte Minareli — Taşın dantele dönüştüğü şifa ve ilim şehri.',
        'Erzurum': 'Çifte Minareli Medrese, Yakutiye & Üç Kümbetler — Doğu Anadolu’nun anıtsal taş medrese kapısı.',
        'Aksaray': 'Sultanhanı Kervansarayı & Eğri Minare — İpek Yolu üzerinde 4.900 m²’lik mermer kervansaray.',
        'Kayseri': 'Gevher Nesibe Tıp Medresesi & Hunat Hatun — Dünyanın ilk uygulamalı tıp medresesi ve şifahanesi.',
        'Kırşehir': 'Cacabey Gökbilim Medresesi & Ahi Evran — 13. yüzyılda gözlem kuyulu astronomi ve ahilik merkezi.',
        'Karaman': 'Hatuniye Medresesi & Aktekke — Türkçeyi devlet ve ilim dili kılan beylik-Selçuklu havzası.',
        'Niğde': 'Alaaddin Camii (Güneş Portali) — Taş kapısında yılın belli saatlerinde beliren gölge mucizesi.',
        'Tokat': 'Gökmedrese, Yağıbasan Medresesi & Mahperi Hatun Hanı — Anadolu’nun en erken kubbeli medreseleri.',
        'Çankırı': 'Taş Mescit (Cemaleddin Ferruh Darüşşifası) — Yılan figürlü tıp kabartmalı Selçuklu şifahanesi.',
        'Bitlis': 'Ahlat Selçuklu Meydan Mezarlığı — 8.200’ü aşkın abideli taş mezarla Kubbetü’l-İslam hafızası.',
        'Antalya': 'Yivli Minare, Alara Han & Kırkgöz Han — Akdeniz kıyılarını bozkıra bağlayan kervansaray zinciri.',
        'Denizli': 'Akhan Kervansarayı — Menderes vadisinden iç Anadolu’ya uzanan ticaret menzili.',
        'Isparta': 'Eğirdir Ertokuş Kervansarayı & Dündar Bey Medresesi — Göl kıyısında ilim ve konaklama durağı.',
        'Afyonkarahisar': 'Ulu Cami (40 Ahşap Direkli) & Çay Taş Medrese — Selçuklu ahşap hipostil cami başyapıtı.',
        'Malatya': 'Battalgazi Ulu Camii & Silahtar Kervansarayı — Büyük Selçuklu tuğla ve çini geleneğinin Anadolu köprüsü.',
        'Mardin': 'Mardin Ulu Camii, Zinciriye & Kasımiye Medreseleri — Artuklu taş işçiliği ve yıldız-su alegorisi.',
        'Diyarbakır': 'Diyarbakır Ulu Camii & Mesudiye Medresesi — İslam’ın 5. Harem-i Şerifi ve erken medrese geleneği.',
        'Batman': 'Malabadi Köprüsü & Hasankeyf — 40.86 metrelik tek taş kemeriyle Artuklu mühendislik şaheseri.',
        'Siirt': 'Siirt Ulu Camii & Tillo İlim Havzası — Selçuklu çinili minaresi ve ışık hadiseli astronomi mirası.',
        'Şırnak': 'Cizre Ulu Camii & Kırmızı Medrese — El-Cezerî’nin robotik/sibernetik ilim mirası.',
        'Elazığ': 'Harput Ulu Camii (Eğri Minare) — Artuklu dönemi taş ve tuğla minare sanatı.',
        'Bayburt': 'Bayburt Ulu Camii & Kalesi — Saltuklu-Selçuklu kültür ve Dede Korkut otağı.',
        'Sinop': 'Alaaddin Camii & Pervane Medresesi — Karadeniz’de Selçuklu donanma ve ilim merkezi.',
        'Kastamonu': 'Atabeygazi Camii & Muzaffereddin Yavlak Arslan izleri — Çobanoğulları Selçuklu uç beyliği.',
        'Kars': 'Menuçehr Camii (Ani) & Ebu’l-Hasan Harakani — Anadolu’da inşa edilen ilk Türk-İslam camii.',
        'Iğdır': 'Ejder (Harmandöven) Kervansarayı — Ağrı Dağı eteklerinde Sürmeli Çukuru’nun Selçuklu hanı.',
        'Ardahan': 'Kura Boyu Kaleleri & Selçuklu uç geçişleri — Kafkasya kapısında taş savunma geleneği.',
        'Bingöl': 'Kiğı & Murat Nehri Boyu — Saltuklu ve Selçuklu devri taş köprü ve kale izleri.',
        'Tunceli': 'Pertek & Çemişgezek Köprüleri — Mengücekoğulları ve Saltuklu izlerini taşıyan vadi durakları.',
        'Hakkari': 'Meydan Medresesi — Yüksek dağların ortasında taş avlulu klasik medrese mirası.',
        'Kahramanmaraş': 'Afşin Eshab-ı Kehf Külliyesi — Selçuklu Emir Nusreddin Hasan’ın külliyesi ve kervansaray ruhu.'
      }
    },
    {
      id: 'ottoman',
      depthNum: 'V',
      depthLabel: 'Katman V · Kubbe & Vakıf',
      era: '1299 – 1918',
      icon: '🕌',
      shortTitle: 'Beylikler & Osmanlı Vakıf',
      title: '🕌 Beylikler & Osmanlı Vakıf Medeniyeti',
      subtitle: 'Bursa, Edirne Selimiye, İstanbul, Amasya — Kubbe, vakıf ve şehir estetiği',
      accent: '#a855f7',
      accentSoft: 'rgba(168, 85, 247, 0.16)',
      anchors: ['Selimiye', 'Süleymaniye', 'Bursa Ulu Cami', 'Safranbolu', 'İshak Paşa'],
      epigraph: 'Mimar Sinan taşı hafifletip göğe kaldırdığında, kubbe yalnızca bir çatı değil; şehirle gökyüzü arasında kurulan bir edep cümlesidir.',
      essay:
        'Söğüt’te Şeyh Edebali’nin "İnsanı yaşat ki devlet yaşasın" düsturuyla filizlenen beylik ruhu; Bursa’da Ulu Cami ve külliyelerle şehirleşir, İstanbul’da Süleymaniye ile kıtaları kucaklar, Edirne Selimiye’de tek bir büyük kubbenin altında vahdet estetiğine erişir. Bu medeniyetin sırrı Vakıf kurumundadır: Kuşlara ev, leyleklere hastane, talebeye aşhane, yolcuya sebil yapan bir incelik; sivil mimaride Safranbolu ve Amasya Yalıboyu konaklarıyla insan ölçeğini asla ezmeyen bir mahalle terbiyesi kurar.',
      philosophy: {
        time:
          'Teenni, Sabır ve Ebed-Müddet: Aceleci değil, asırlara yayılan; taş ustasının ömrünü bir taç kapıya, hattatın nefesini bir meşk sayfasına adadığı olgun zaman.',
        space:
          'Külliye ve Mahalle: Cami, medrese, şifahane, imaret, hamam ve kütüphaneyi aynı avluda toplayan; komşunun güneşini kesmeyen insan-odaklı şehir planı.',
        humanity:
          'Vakıf İnsanı ve Ehl-i Hırfet: Malı mülkü kendi tekeline almak yerine "sadaka-i cariye"ye dönüştüren, ahilik ve lonca ahlakıyla zanaatı ibadet bilen insan.'
      },
      provinces: {
        'Bursa': 'Ulu Cami, Yeşil Türbe, Muradiye & Cumalıkızık — Osmanlı’nın ilk payitahtı ve vakıf bahçesi.',
        'Edirne': 'Selimiye Camii & II. Bayezid Sağlık Müzesi — Mimar Sinan’ın ustalık kubbesi ve müzikle şifa külliyesi.',
        'İstanbul': 'Süleymaniye, Topkapı & Ayasofya — Cihan başkentinde kubbe, vakıf kütüphanesi ve Boğaz estetiği.',
        'Bilecik': 'Söğüt Ertuğrul Gazi & Şeyh Edebali — Kuruluş mayasının ve "İnsanı yaşat" öğüdünün ocağı.',
        'Amasya': 'II. Bayezid Külliyesi & Yalıboyu Evleri — Şehzadeler, hattatlar ve Yeşilırmak yansımaları.',
        'Karabük': 'Safranbolu Konakları & Cinci Hanı — Birbirinin ışığını ve manzarasını kesmeyen Osmanlı ahşap sivil mimarisi.',
        'Kastamonu': 'Nasrullah Külliyesi & Şeyh Şaban-ı Veli — Çivisiz ahşap camiler ve irfan dergâhları.',
        'Manisa': 'Muradiye Külliyesi & Sultan Camii — Şehzadeler sancağında Mimar Sinan imzası ve şifa vakfı.',
        'Eskişehir': 'Kurşunlu Külliyesi & Odunpazarı — Yunus Emre nefesli Osmanlı ahşap mahalle dokusu.',
        'Kütahya': 'Ulu Cami, Dönenler Mevlevihanesi & Çini — Germiyanoğlu-Osmanlı çini ve zanaat mirası.',
        'Balıkesir': 'Zağnos Paşa Külliyesi — Karesioğulları beyliğinden Osmanlı denizciliğine köprü.',
        'Tekirdağ': 'Rüstem Paşa Külliyesi — Mimar Sinan’ın Marmara kıyısındaki zarif vakıf eseri.',
        'Kırklareli': 'Hızırbey Külliyesi & Sokollu Külliyesi — Balkanlar yolu üzerindeki Osmanlı menzil şehirleşmesi.',
        'Sakarya': 'Taraklı Konakları & Yunus Paşa Camii — İpek Yolu üzerinde yaşayan Osmanlı ahşap kasabası.',
        'Bolu': 'Göynük & Mudurnu — Akşemseddin diyarı ve ahilik geleneğini koruyan Osmanlı çarşıları.',
        'Düzce': 'Akçakoca & Konuralp — Fetih dönemi ahşap camileri ve Batı Karadeniz taşra dokusu.',
        'Bartın': 'Tarihi Bartın Evleri & Amasra Fatih Camii — Ahşap oymacılığın ve denizci mahallelerin zarafeti.',
        'Zonguldak': 'Kdz. Ereğli & Devrek — Osmanlı taşkömürü emek tarihi ve ahşap baston zanaatı.',
        'Ağrı': 'İshak Paşa Sarayı — Sarp kayalıklarda merkezi ısıtmalı külliye ve taş oymacılığı şaheseri.',
        'Trabzon': 'Gülbahar Hatun Külliyesi & Atatürk Köşkü çevresi — Fatih’in fethettiği, Yavuz’un yönettiği sancak.',
        'Rize': 'Zilkale & Taş Kemer Köprüler — Kaçkar derelerini aşan zarif Osmanlı taş köprüleri.',
        'Ordu': 'Paşaoğlu Konağı & Çivisiz Ahşap Camiler — Karadeniz yayla ve sahil ahşap ustalığı.',
        'Giresun': 'Zeytinlik Mahallesi — Tarihî konaklar ve çok kültürlü Osmanlı liman mahallesi.',
        'Gümüşhane': 'Süleymaniye Mahallesi — Kanuni Sultan Süleyman’ın gümüş madeni ve vakıf şehri.',
        'Yozgat': 'Çapanoğlu Camii — Osmanlı barok taş işçiliğinin Anadolu bozkırındaki anıtsal örneği.',
        'Adana': 'Ramazanoğlu Medresesi & Ulu Camii — Beylikler devri siyah-beyaz taş ve çini sentezi.',
        'Kahramanmaraş': 'Dulkadiroğlu Ulu Camii & Taş Medrese — Beylik mirasını Osmanlı’ya taşıyan vakıf yapıları.',
        'Kilis': 'Canbolatoğlu & Tekke Camii — Kabaltılı taş sokaklar ve Halep yolu Osmanlı hanları.',
        'Şanlıurfa': 'Gümrük Hanı & Halil-ür Rahman Külliyesi — Seyyahların soluklandığı taş kemerli hanlar.',
        'Erzincan': 'Kemaliye (Eğin) Taş ve Ahşap Evleri — Fırat kanyonu kıyısında özgün Osmanlı konak mimarisi.'
      }
    },
    {
      id: 'republic',
      depthNum: 'VI',
      depthLabel: 'Katman VI · İstiklal & Diriliş',
      era: '1915 – 1938+',
      icon: '🇹🇷',
      shortTitle: 'Milli Mücadele & Cumhuriyet',
      title: '🇹🇷 Milli Mücadele & Cumhuriyet Hafızası',
      subtitle: 'Ankara, Samsun, Sivas, Erzurum, Çanakkale, Afyonkarahisar — İstiklal ve yeniden doğuş',
      accent: '#f43f5e',
      accentSoft: 'rgba(244, 63, 94, 0.16)',
      anchors: ['Anıtkabir', 'Bandırma Vapuru', 'Sivas Kongresi', 'Çanakkale', 'Kocatepe'],
      epigraph: 'Küllerin arasından doğan irade, yalnızca bir devleti değil; kendi kaderinin öznesi olan özgür yurttaşı yeniden inşa etti.',
      essay:
        'Tarihin en ağır kırılmalarından birinin ardından Anadolu, Çanakkale’nin siperlerinden Samsun iskelesine, Erzurum ve Sivas kongrelerinden Kocatepe’nin şafağına kadar topyekûn bir varoluş iradesi sergiledi. Bu katman, başkenti bozkırın kalbi Ankara’ya taşıyarak sadece siyasi bağımsızlığı değil; demiryolu, fabrika, köy enstitüsü, üniversite ve halkevleriyle akla, bilime ve eşit yurttaşlığa dayalı yeni bir medeniyet hamlesini başlatan dirilişin hafızasıdır.',
      philosophy: {
        time:
          'Krizden Doğuşa Atılan Tarihsel Sıçrama: Geçmişin muhasebesini yapıp geleceğe ("muasır medeniyetler") doğru hızlanan kurucu ve devrimci zaman.',
        space:
          'Kongre Salonu, Cephe ve Bozkır Başkenti: İşgal altındaki kıyıdan Anadolu’nun tam kalbine (Ankara) çekilen merkez; demiryolları ve fabrikalarla yeniden örülen vatan.',
        humanity:
          'Tebaa’dan Özgür Yurttaşa: Kendi kaderini mecliste belirleyen, cephede kağnıyla mermi taşıyan (Şerife Bacı), barışta bilim ve sanat üreten cumhuriyet insanı.'
      },
      provinces: {
        'Ankara': 'Anıtkabir, I. & II. TBMM — Milli egemenliğin kürsüsü ve Cumhuriyetin kurucu kalbi.',
        'Samsun': 'Bandırma Vapuru & Onur Anıtı — 19 Mayıs 1919’da istiklal meşalesinin yakıldığı iskele.',
        'Amasya': 'Saraydüzü Kışlası — "Milletin istiklalini yine milletin azim ve kararı kurtaracaktır" tamiminin şehri.',
        'Erzurum': 'Erzurum Kongre Binası — "Milli sınırlar içinde vatan bir bütündür, parçalanamaz" ahdi.',
        'Sivas': 'Atatürk Kongre ve Etnografya Müzesi — 108 gün Millî Mücadele’nin karargâhı ve Sivas Kongresi otağı.',
        'Çanakkale': 'Gelibolu Şehitler Abidesi & 57. Alay — "Çanakkale Geçilmez" iradesinin ebedi anıtı.',
        'Afyonkarahisar': 'Kocatepe & Zafer Müzesi — 26 Ağustos 1922 Büyük Taarruz’un şafak karargâhı.',
        'Kütahya': 'Dumlupınar Şehitliği — Başkomutanlık Meydan Muharebesi’nin zaferle mühürlendiği tepe.',
        'Uşak': 'İstiklal yürüyüşü karargâhları — Batı Anadolu’nun kurtuluş günlerinde dönüm noktası.',
        'İzmir': 'Hükümet Konağı & 9 Eylül — İlk kurşundan son zafere Millî Mücadele’nin taçlandığı şehir.',
        'Eskişehir': 'İnönü Savaşları Karargâhı — Düzenli ordunun ilk zaferleri ve Cumhuriyet demiryolu kavşağı.',
        'Kocaeli': 'İzmit Kasr-ı Hümayun & Gayret — Cumhuriyet fikrinin basınla paylaşıldığı tarihî buluşma.',
        'Yalova': 'Yürüyen Köşk — Bir çınar dalı için raylarla kaydırılan ev; doğaya saygılı Cumhuriyet simgesi.',
        'Kırıkkale': 'MKE Sanayi Mirası — Genç Cumhuriyetin öz savunma ve sanayi hamlesinin temeli.',
        'Gaziantep': 'Antep Savunması & "Gazi" Unvanı — Kuşatma altında sivil direnişin destanlaştığı şehir.',
        'Şanlıurfa': 'Onikiler & "Şanlı" Unvanı — Öz gücüyle işgali kıran direniş hafızası.',
        'Kahramanmaraş': 'Sütçü İmam & "Kahraman" Unvanı — İlk kurtuluş kıvılcımını yakan şehir.',
        'Hatay': 'Hatay Devleti Meclisi — 1939’da barışçı diplomasi ve iradeyle Anavatan’a kavuşma.',
        'Adana': 'Pozantı Kongresi & 5 Ocak — Çukurova direnişinin ve Cumhuriyet ziyaretlerinin durağı.',
        'Mersin': 'Tarsus & Kuvayı Milliye cephesi — Toros geçitlerinde milli direniş.',
        'Karabük': 'Kardemir Demir-Çelik (1937) — Cumhuriyetin ilk ağır sanayi ve emek kenti.',
        'Zonguldak': 'Cumhuriyetin İlk İli (1924) — Taşkömürü emeğiyle genç ekonominin enerji damarı.',
        'Kastamonu': 'İnebolu – Kastamonu İstiklal Yolu — Şerife Bacı’nın kağnısıyla cepheye umut taşıdığı güzergâh.',
        'Çankırı': 'Ilgaz İstiklal Yolu Menzili — Cephane kollarının Ankara’ya inen geçit durağı.',
        'Kars': 'Doğu Cephesi & Kazım Karabekir — Cumhuriyetin doğu sınırlarını güvene alan antlaşma şehri.',
        'Ardahan': 'Ardahan Kongreleri & Damal — Sınır boyunda milli birlik ve Atatürk silüeti.',
        'Artvin': '7 Mart Kurtuluşu — Çoruh vadisinde Cumhuriyetle bütünleşme hafızası.',
        'Muş': 'Malazgirt’ten Doğu Cephesi’ne — Anadolu kapısının sarsılmaz nöbetçisi.',
        'Tekirdağ': '57. Alay Karargâhı & Namık Kemal — Hürriyet düşüncesinden Çanakkale siperlerine uzanan kök.'
      }
    },
    {
      id: 'library',
      depthNum: 'VII',
      depthLabel: 'Katman VII · Bilginin Menzili',
      era: 'Günümüz & Gelecek',
      icon: '📚',
      shortTitle: 'Modern İlim & Kütüphane',
      title: '📚 Modern İlim & Kütüphane Menzilleri',
      subtitle: '81 İl Halk Kütüphanesi — Bilgi çağında seyyahın yeni medresesi',
      accent: '#38bdf8',
      accentSoft: 'rgba(56, 189, 248, 0.16)',
      anchors: ['81 İl Halk Kütüphanesi', 'Dijital Seyyah', 'Okuma Masası', 'Sessiz Tefekkür'],
      epigraph: 'Dünün seyyahı kervansarayın taş avlusunda soluklanırdı; bugünün seyyahı 81 ilin Halk Kütüphanesinde hikmeti ve kodu buluşturur.',
      essay:
        'Medeniyet katmanlarının en genç ve en canlı halkası, Türkiye’nin 81 iline yayılmış İl Halk Kütüphaneleridir. Bir şehirde taş medrese neyse, bilgi çağında da ücretsiz, herkese açık, sessiz bir okuma masası odur. Göbeklitepe’den Selimiye’ye uzanan bütün o binlerce yıllık birikimi anlamlandıran şey; bugün bir seyyahın elinde defteri ve bilgisayarıyla 81 ilin kütüphanelerinde o hafızayı okuyup geleceğe yeni satırlar eklemesidir.',
      philosophy: {
        time:
          'Sentezlenen ve Üreten Şimdiki Zaman: 12.000 yıllık geçmişin birikimini bugünün dikkat ekonomisine karşı derin odaklanmayla geleceğe aktaran yaratıcı zaman.',
        space:
          '81 İl Halk Kütüphanesi Ağı: Her şehirde kapısı herkese eşit açık, statü sormayan, çayın ve kitabın buluştuğu modern "ilim kervansarayı".',
        humanity:
          'Dijital Seyyah ve Okur-Yazar: Hem yolda yürüyen hem okuyan, kadim taşların sesini modern bilginin ışığıyla birleştiren bilinçli tanık.'
      },
      provinces: {} // Dynamically maps ALL 81 provinces from ctx.data.provinces
    }
  ];

  // ---------------------------------------------------------------------------
  // Scoped CSS (Dark & Light Theme Compatible)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .scl-shell {
        --scl-accent: #f59e0b;
        --scl-accent-soft: rgba(245, 158, 11, 0.16);
        max-width: 1200px;
        margin: 0 auto;
        padding: 8px 4px 48px;
        display: flex;
        flex-direction: column;
        gap: 22px;
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
      }

      /* Hero Section */
      .scl-hero {
        position: relative;
        overflow: hidden;
        border-radius: 24px;
        padding: 28px 28px 24px;
        background:
          radial-gradient(circle at 8% 12%, rgba(245, 158, 11, 0.2), transparent 46%),
          radial-gradient(circle at 90% 15%, rgba(0, 242, 254, 0.14), transparent 45%),
          radial-gradient(circle at 50% 100%, rgba(168, 85, 247, 0.14), transparent 55%),
          var(--bg-glass, rgba(15, 23, 42, 0.86));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        box-shadow: var(--shadow-subtle, 0 14px 36px rgba(0, 0, 0, 0.45));
      }

      .scl-hero-top {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 14px;
        margin-bottom: 14px;
      }

      .scl-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--accent-gold, #f59e0b);
        padding: 5px 13px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.32);
        margin-bottom: 10px;
      }

      .scl-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.5rem, 2.7vw, 2.2rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.2;
        margin: 0 0 8px;
        background: linear-gradient(125deg, #f8fafc 18%, #fbbf24 55%, #38bdf8 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .scl-thesis {
        margin: 12px 0 0;
        padding: 14px 18px;
        border-left: 3px solid var(--accent-gold, #f59e0b);
        border-radius: 0 14px 14px 0;
        background: rgba(15, 23, 42, 0.48);
        font-size: 0.98rem;
        font-style: italic;
        line-height: 1.6;
        color: var(--text-primary, #f8fafc);
      }

      .scl-hero-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .scl-stat-pill {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 7px 13px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 600;
        background: rgba(15, 23, 42, 0.56);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        color: var(--text-primary, #f8fafc);
        white-space: nowrap;
      }

      .scl-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent-emerald, #10b981);
        box-shadow: 0 0 10px var(--accent-emerald, #10b981);
      }

      .scl-dot.offline {
        background: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 10px var(--accent-gold, #f59e0b);
      }

      /* 7-Strata Interactive Explorer Rail */
      .scl-strata-section {
        border-radius: 22px;
        padding: 20px 22px;
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      }

      .scl-section-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
      }

      .scl-section-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.05rem;
        font-weight: 700;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .scl-section-hint {
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
      }

      .scl-strata-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 11px;
      }

      .scl-stratum-btn {
        position: relative;
        text-align: left;
        cursor: pointer;
        border-radius: 16px;
        padding: 14px 15px;
        background: rgba(15, 23, 42, 0.56);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        color: var(--text-primary, #f8fafc);
        display: flex;
        flex-direction: column;
        gap: 6px;
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
        font-family: inherit;
      }

      .scl-stratum-btn::before {
        content: '';
        position: absolute;
        left: 0;
        top: 12px;
        bottom: 12px;
        width: 3px;
        border-radius: 0 4px 4px 0;
        background: var(--stratum-accent, #f59e0b);
        opacity: 0.55;
        transition: opacity 0.2s ease, top 0.2s ease, bottom 0.2s ease;
      }

      .scl-stratum-btn:hover {
        transform: translateY(-2px);
        border-color: var(--stratum-accent, #f59e0b);
        background: rgba(30, 41, 59, 0.85);
      }

      .scl-stratum-btn.active {
        border-color: var(--stratum-accent, #f59e0b);
        background: linear-gradient(145deg, var(--stratum-soft, rgba(245, 158, 11, 0.18)), rgba(15, 23, 42, 0.85));
        box-shadow: 0 10px 26px -10px var(--stratum-accent, #f59e0b);
      }

      .scl-stratum-btn.active::before {
        opacity: 1;
        top: 8px;
        bottom: 8px;
      }

      .scl-stratum-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .scl-stratum-depth {
        font-size: 0.69rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--stratum-accent, #f59e0b);
      }

      .scl-stratum-era {
        font-size: 0.68rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-secondary, #94a3b8);
      }

      .scl-stratum-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.96rem;
        font-weight: 700;
        line-height: 1.3;
      }

      .scl-stratum-sub {
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .scl-stratum-meta {
        margin-top: auto;
        padding-top: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.73rem;
        color: var(--text-secondary, #94a3b8);
        border-top: 1px dashed rgba(255, 255, 255, 0.08);
      }

      /* Active Stratum Philosophical Essay Studio */
      .scl-essay-panel {
        border-radius: 22px;
        padding: 24px 26px;
        background:
          radial-gradient(circle at 95% 8%, var(--scl-accent-soft), transparent 46%),
          var(--bg-glass, rgba(15, 23, 42, 0.88));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        box-shadow: var(--shadow-subtle, 0 12px 32px rgba(0, 0, 0, 0.4));
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .scl-essay-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
      }

      .scl-essay-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.74rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--scl-accent);
        margin-bottom: 6px;
      }

      .scl-essay-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.25rem, 2.2vw, 1.7rem);
        font-weight: 800;
        margin: 0 0 6px;
        line-height: 1.25;
      }

      .scl-essay-subtitle {
        font-size: 0.9rem;
        color: var(--text-secondary, #94a3b8);
        margin: 0;
      }

      .scl-progress-box {
        min-width: 210px;
        padding: 12px 15px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .scl-progress-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.78rem;
        font-weight: 600;
      }

      .scl-progress-track {
        height: 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
      }

      .scl-progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--scl-accent), var(--accent-cyan, #00f2fe));
        transition: width 0.35s ease;
      }

      .scl-epigraph {
        padding: 12px 16px;
        border-radius: 14px;
        background: var(--scl-accent-soft);
        border-left: 3px solid var(--scl-accent);
        font-style: italic;
        font-size: 0.94rem;
        line-height: 1.55;
      }

      .scl-essay-body {
        font-size: 0.95rem;
        line-height: 1.75;
        color: var(--text-primary, #f8fafc);
      }

      .scl-pillars-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      @media (max-width: 860px) {
        .scl-pillars-grid {
          grid-template-columns: 1fr;
        }
      }

      .scl-pillar-card {
        border-radius: 16px;
        padding: 15px 16px;
        background: rgba(15, 23, 42, 0.52);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .scl-pillar-head {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--scl-accent);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .scl-pillar-text {
        font-size: 0.84rem;
        line-height: 1.6;
        color: var(--text-secondary, #cbd5e1);
      }

      .scl-anchors-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .scl-anchor-chip {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 4px 11px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        color: var(--text-primary, #f8fafc);
      }

      /* AI Interpretation Box */
      .scl-ai-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-top: 8px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .scl-ai-btn {
        cursor: pointer;
        border: none;
        border-radius: 14px;
        padding: 12px 20px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.92rem;
        font-weight: 700;
        color: #0b1120;
        background: linear-gradient(135deg, #fbbf24 0%, #38bdf8 100%);
        box-shadow: 0 8px 24px -6px rgba(251, 191, 36, 0.45);
        display: inline-flex;
        align-items: center;
        gap: 9px;
        transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
      }

      .scl-ai-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px -6px rgba(56, 189, 248, 0.55);
      }

      .scl-ai-btn:disabled {
        opacity: 0.7;
        cursor: wait;
      }

      .scl-ai-hint {
        font-size: 0.78rem;
        color: var(--text-secondary, #94a3b8);
      }

      .scl-ai-output {
        border-radius: 18px;
        padding: 18px 20px;
        background: rgba(15, 23, 42, 0.68);
        border: 1px solid rgba(56, 189, 248, 0.28);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .scl-ai-output-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .scl-ai-source-badge {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
      }

      .scl-ai-md {
        font-size: 0.92rem;
        line-height: 1.72;
        color: var(--text-primary, #f8fafc);
      }

      .scl-ai-md .seyyah-md-h1,
      .scl-ai-md .seyyah-md-h2,
      .scl-ai-md .seyyah-md-h3,
      .scl-ai-md .seyyah-md-h4 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        margin: 12px 0 6px;
        color: var(--scl-accent);
      }

      .scl-ai-md .seyyah-md-p {
        margin: 0 0 10px;
      }

      .scl-ai-md .seyyah-md-quote {
        margin: 10px 0;
        padding: 10px 14px;
        border-left: 3px solid var(--scl-accent);
        background: rgba(255, 255, 255, 0.04);
        border-radius: 0 10px 10px 0;
        font-style: italic;
      }

      .scl-ai-md .seyyah-md-list {
        margin: 6px 0 10px 18px;
      }

      .scl-spinner {
        width: 15px;
        height: 15px;
        border-radius: 50%;
        border: 2px solid rgba(11, 17, 32, 0.25);
        border-top-color: #0b1120;
        animation: sclSpin 0.8s linear infinite;
        display: inline-block;
      }

      @keyframes sclSpin {
        to { transform: rotate(360deg); }
      }

      /* Matching Provinces Gallery */
      .scl-provinces-section {
        border-radius: 22px;
        padding: 22px 24px;
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .scl-filter-toolbar {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      .scl-filter-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .scl-filter-btn {
        cursor: pointer;
        border-radius: 999px;
        padding: 6px 13px;
        font-size: 0.78rem;
        font-weight: 600;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        color: var(--text-secondary, #94a3b8);
        font-family: inherit;
        transition: all 0.2s ease;
      }

      .scl-filter-btn.active,
      .scl-filter-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: var(--scl-accent);
        background: var(--scl-accent-soft);
      }

      .scl-search-input {
        min-width: 220px;
        padding: 8px 13px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.84rem;
        outline: none;
      }

      .scl-search-input:focus {
        border-color: var(--scl-accent);
      }

      .scl-city-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(265px, 1fr));
        gap: 14px;
      }

      .scl-city-card {
        cursor: pointer;
        border-radius: 18px;
        overflow: hidden;
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        outline: none;
      }

      .scl-city-card:hover,
      .scl-city-card:focus-visible {
        transform: translateY(-4px);
        border-color: var(--scl-accent);
        box-shadow: 0 14px 28px -12px rgba(0, 0, 0, 0.65);
      }

      .scl-city-banner {
        position: relative;
        height: 138px;
        overflow: hidden;
        background: #0f172a;
      }

      .scl-city-banner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.45s ease;
      }

      .scl-city-card:hover .scl-city-banner img {
        transform: scale(1.06);
      }

      .scl-banner-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(10, 15, 29, 0.28) 0%, rgba(10, 15, 29, 0.88) 100%);
      }

      .scl-banner-top {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .scl-plate-badge {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.72rem;
        font-weight: 800;
        padding: 3px 9px;
        border-radius: 8px;
        background: rgba(15, 23, 42, 0.82);
        color: #f8fafc;
        border: 1px solid rgba(255, 255, 255, 0.18);
      }

      .scl-visited-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.82);
        color: #cbd5e1;
        border: 1px solid rgba(255, 255, 255, 0.16);
      }

      .scl-visited-badge.done {
        background: rgba(16, 185, 129, 0.24);
        color: #6ee7b7;
        border-color: rgba(16, 185, 129, 0.45);
      }

      .scl-banner-bottom {
        position: absolute;
        bottom: 10px;
        left: 12px;
        right: 12px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 8px;
      }

      .scl-city-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.05rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.15;
      }

      .scl-city-region {
        font-size: 0.72rem;
        color: #cbd5e1;
      }

      .scl-city-body {
        padding: 13px 14px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }

      .scl-city-note {
        font-size: 0.82rem;
        line-height: 1.5;
        color: var(--text-secondary, #cbd5e1);
      }

      .scl-city-footer {
        margin-top: auto;
        padding-top: 8px;
        border-top: 1px dashed rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.74rem;
        font-weight: 600;
        color: var(--scl-accent);
      }

      .scl-empty-box {
        padding: 28px 18px;
        text-align: center;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.4);
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.16));
        color: var(--text-secondary, #94a3b8);
        font-size: 0.9rem;
      }

      /* ------------------------------------------------------------------ */
      /* Light Theme Overrides                                              */
      /* ------------------------------------------------------------------ */
      body.light-theme .scl-hero {
        background:
          radial-gradient(circle at 8% 12%, rgba(217, 119, 6, 0.14), transparent 46%),
          radial-gradient(circle at 90% 15%, rgba(2, 132, 199, 0.12), transparent 45%),
          rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .scl-title {
        background: linear-gradient(125deg, #0f172a 18%, #b45309 55%, #0284c7 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .scl-thesis {
        background: rgba(248, 250, 252, 0.9);
        color: #1e293b;
      }

      body.light-theme .scl-stat-pill,
      body.light-theme .scl-progress-box,
      body.light-theme .scl-pillar-card,
      body.light-theme .scl-filter-btn,
      body.light-theme .scl-search-input,
      body.light-theme .scl-empty-box {
        background: rgba(241, 245, 249, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      body.light-theme .scl-stratum-btn {
        background: rgba(248, 250, 252, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      body.light-theme .scl-stratum-btn:hover {
        background: #ffffff;
      }

      body.light-theme .scl-stratum-btn.active {
        background: linear-gradient(145deg, var(--stratum-soft, rgba(245, 158, 11, 0.14)), #ffffff);
      }

      body.light-theme .scl-stratum-era,
      body.light-theme .scl-anchor-chip {
        background: rgba(15, 23, 42, 0.05);
        border-color: rgba(15, 23, 42, 0.12);
        color: #334155;
      }

      body.light-theme .scl-stratum-meta,
      body.light-theme .scl-city-footer {
        border-top-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .scl-essay-panel,
      body.light-theme .scl-strata-section,
      body.light-theme .scl-provinces-section {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .scl-pillar-text,
      body.light-theme .scl-city-note {
        color: #334155;
      }

      body.light-theme .scl-ai-output {
        background: rgba(248, 250, 252, 0.96);
        border-color: rgba(2, 132, 199, 0.25);
      }

      body.light-theme .scl-ai-output-head {
        border-bottom-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .scl-ai-source-badge {
        color: #0284c7;
      }

      body.light-theme .scl-ai-md .seyyah-md-quote {
        background: rgba(15, 23, 42, 0.04);
      }

      body.light-theme .scl-city-card {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.12);
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Province Mapping Builder (Maps all 81 provinces deterministically)
  // ---------------------------------------------------------------------------
  function buildStratumProvinces(stratum, provincesMap, normFn) {
    const entries = Object.entries(provincesMap || {});
    if (stratum.id === 'library') {
      return entries
        .map(function (entry) {
          const key = entry[0];
          const p = entry[1];
          const libText = (p && (p.custom_library || p.library)) || `${p.name} İl Halk Kütüphanesi`;
          return {
            key: key,
            province: p,
            note: libText
          };
        })
        .sort(function (a, b) {
          return Number(a.province.plate || 999) - Number(b.province.plate || 999);
        });
    }

    // Build normalized lookup of province name -> note for this stratum
    const targetNotes = new Map();
    const specMap = stratum.provinces || {};
    Object.keys(specMap).forEach(function (name) {
      targetNotes.set(normFn(name), specMap[name]);
    });

    const matched = [];
    entries.forEach(function (entry) {
      const key = entry[0];
      const p = entry[1];
      if (!p || !p.name) return;
      const nName = normFn(p.name);
      if (targetNotes.has(nName)) {
        matched.push({
          key: key,
          province: p,
          note: targetNotes.get(nName)
        });
      }
    });

    matched.sort(function (a, b) {
      return Number(a.province.plate || 999) - Number(b.province.plate || 999);
    });
    return matched;
  }

  function computeAtlasCoverage(provincesMap, normFn) {
    const coveredKeys = new Set();
    STRATA.forEach(function (st) {
      const items = buildStratumProvinces(st, provincesMap, normFn);
      items.forEach(function (item) {
        coveredKeys.add(item.key);
      });
    });
    return coveredKeys.size;
  }

  // ---------------------------------------------------------------------------
  // Offline Philosophical Commentary Fallback
  // ---------------------------------------------------------------------------
  function generateOfflinePhilosophicalEssay(stratum, matchedItems) {
    const total = matchedItems.length;
    const visited = matchedItems.filter(function (it) { return Boolean(it.province.visited); });
    const unvisited = matchedItems.filter(function (it) { return !it.province.visited; });

    const visitedSample = visited.slice(0, 4).map(function (it) { return it.province.name; }).join(', ');
    const nextSample = unvisited.slice(0, 4).map(function (it) { return it.province.name; }).join(', ');

    const progressSentence = visited.length > 0
      ? `Bu katmanda yer alan **${total} ilden ${visited.length} tanesini** (${visitedSample}${visited.length > 4 ? '…' : ''}) bizzat adımlamışsın; taşların hafızasına kendi ayak izini bırakmışsın.`
      : `Bu katmandaki **${total} il** seni henüz keşfedilmemiş birer taş yazıt gibi bekliyor.`;

    const nextSentence = unvisited.length > 0
      ? `Sıradaki derinleşme menzilleri için **${nextSample}** durakları, bu dönemin Zaman-Mekân ruhunu doğrudan tecrübe edeceğin eşiklerdir.`
      : `Bu katmandaki tüm illeri tamamlayarak bu çağın Anadolu hafızasını baştan sona okumuş durumdasın.`;

    return [
      `### ${stratum.icon} ${stratum.shortTitle} Katmanında Zamanın Felsefesi`,
      `> *"${THESIS_QUOTE}"*`,
      `**1. Fanilik ve Beka Diyalektiği (${stratum.era}):**`,
      `${stratum.essay}`,
      `**2. Zaman, Mekân ve İnsan Üçgeni:**`,
      `- **Zaman Tasavvuru:** ${stratum.philosophy.time}`,
      `- **Mekân Anlayışı:** ${stratum.philosophy.space}`,
      `- **İnsan & Hakikat:** ${stratum.philosophy.humanity}`,
      `**3. Seyyahın Kişisel Haritasıyla Buluşma:**`,
      `${progressSentence} ${nextSentence}`,
      `> *"${stratum.epigraph}"*`
    ].join('\n\n');
  }

  // ---------------------------------------------------------------------------
  // Module State
  // ---------------------------------------------------------------------------
  const uiState = {
    activeStratumId: STRATA[0].id,
    visitFilter: 'all', // 'all' | 'visited' | 'unvisited'
    searchQuery: '',
    aiStates: {}, // stratumId -> { status: 'idle'|'streaming'|'done'|'error', text: '', source: '', error: '' }
    activeRequestToken: 0
  };

  function getAiState(stratumId) {
    if (!uiState.aiStates[stratumId]) {
      uiState.aiStates[stratumId] = {
        status: 'idle',
        text: '',
        source: '',
        error: ''
      };
    }
    return uiState.aiStates[stratumId];
  }

  // ---------------------------------------------------------------------------
  // Main Render Function
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const safeCtx = ctx || {};
    const esc = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const normFn = typeof safeCtx.normalizeTurkish === 'function' ? safeCtx.normalizeTurkish : fallbackNormalizeTurkish;
    const provincesMap =
      (safeCtx.data && safeCtx.data.provinces) ||
      (typeof TRAVEL_DATA !== 'undefined' && TRAVEL_DATA && TRAVEL_DATA.provinces) ||
      {};

    const allEntries = Object.entries(provincesMap);
    const totalProvinces = allEntries.length || 81;
    const totalVisited = allEntries.filter(function (e) { return e[1] && e[1].visited; }).length;
    const coveredCount = computeAtlasCoverage(provincesMap, normFn);
    const hasAiEngine = Boolean(window.SEYYAH_AI && typeof window.SEYYAH_AI.stream === 'function');
    const hasLiveKey = Boolean(hasAiEngine && typeof window.SEYYAH_AI.hasKey === 'function' && window.SEYYAH_AI.hasKey());

    function getActiveStratum() {
      for (let i = 0; i < STRATA.length; i++) {
        if (STRATA[i].id === uiState.activeStratumId) return STRATA[i];
      }
      return STRATA[0];
    }

    function paint() {
      const stratum = getActiveStratum();
      const matchedItems = buildStratumProvinces(stratum, provincesMap, normFn);
      const visitedInStratum = matchedItems.filter(function (it) { return Boolean(it.province.visited); }).length;
      const pctStratum = matchedItems.length > 0 ? Math.round((visitedInStratum / matchedItems.length) * 100) : 0;

      const filteredItems = matchedItems.filter(function (item) {
        if (uiState.visitFilter === 'visited' && !item.province.visited) return false;
        if (uiState.visitFilter === 'unvisited' && item.province.visited) return false;
        if (uiState.searchQuery.trim()) {
          const q = normFn(uiState.searchQuery);
          const hay = normFn(
            `${item.province.name} ${item.province.region || ''} ${item.note} ${(item.province.landmarks || []).join(' ')}`
          );
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });

      const strataButtonsHtml = STRATA.map(function (st) {
        const list = buildStratumProvinces(st, provincesMap, normFn);
        const vis = list.filter(function (it) { return Boolean(it.province.visited); }).length;
        const isActive = st.id === stratum.id;
        return `
          <button
            type="button"
            class="scl-stratum-btn ${isActive ? 'active' : ''}"
            data-scl-stratum="${esc(st.id)}"
            style="--stratum-accent:${esc(st.accent)}; --stratum-soft:${esc(st.accentSoft)};"
          >
            <div class="scl-stratum-top">
              <span class="scl-stratum-depth">${esc(st.depthLabel)}</span>
              <span class="scl-stratum-era">${esc(st.era)}</span>
            </div>
            <div class="scl-stratum-name">${esc(st.icon)} ${esc(st.shortTitle)}</div>
            <div class="scl-stratum-sub">${esc(st.subtitle)}</div>
            <div class="scl-stratum-meta">
              <span>${list.length} İl Eşleşti</span>
              <span>✓ ${vis}/${list.length} Gezildi</span>
            </div>
          </button>
        `;
      }).join('');

      const anchorsHtml = stratum.anchors.map(function (a) {
        return `<span class="scl-anchor-chip">◈ ${esc(a)}</span>`;
      }).join('');

      const aiState = getAiState(stratum.id);
      const isStreaming = aiState.status === 'streaming';
      let aiOutputHtml = '';
      if (aiState.text || isStreaming) {
        aiOutputHtml = `
          <div class="scl-ai-output" id="scl-ai-output">
            <div class="scl-ai-output-head">
              <span class="scl-ai-source-badge">
                ${isStreaming ? '⏳ Gemini Canlı Felsefi Tefekkür Akıyor…' : esc(aiState.source || '✨ Zaman Felsefesi Yorumu')}
              </span>
              <span class="scl-ai-hint">${esc(stratum.shortTitle)} · ${esc(stratum.era)}</span>
            </div>
            <div class="scl-ai-md" id="scl-ai-md-body">${renderMdSafe(aiState.text || 'Düşünce dokunuyor…', esc)}</div>
          </div>
        `;
      }

      const cityCardsHtml = filteredItems.length > 0
        ? filteredItems.map(function (item) {
            const p = item.province;
            const bannerSrc = resolveBannerPath(p);
            const plateStr = formatPlate(p.plate);
            const visitedDone = Boolean(p.visited);
            return `
              <article
                class="scl-city-card"
                data-scl-city="${esc(item.key)}"
                tabindex="0"
                role="button"
                aria-label="${esc(p.name)} şehir detayını aç"
              >
                <div class="scl-city-banner">
                  <img
                    src="${esc(bannerSrc)}"
                    alt="${esc(p.name)} medeniyet görünümü"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='assets/banner.jpg';"
                  >
                  <div class="scl-banner-scrim"></div>
                  <div class="scl-banner-top">
                    <span class="scl-plate-badge">${esc(plateStr)}</span>
                    <span class="scl-visited-badge ${visitedDone ? 'done' : ''}">
                      ${visitedDone ? '✓ Gezildi' : '✦ Keşfedilecek'}
                    </span>
                  </div>
                  <div class="scl-banner-bottom">
                    <div>
                      <div class="scl-city-name">${esc(p.name)}</div>
                      <div class="scl-city-region">${esc(p.region || '')} Bölgesi</div>
                    </div>
                  </div>
                </div>
                <div class="scl-city-body">
                  <div class="scl-city-note">${esc(item.note)}</div>
                  <div class="scl-city-footer">
                    <span>${esc(stratum.icon)} ${esc(stratum.shortTitle)}</span>
                    <span>Şehri Aç →</span>
                  </div>
                </div>
              </article>
            `;
          }).join('')
        : `<div class="scl-empty-box">Seçilen filtreye uygun il bulunamadı. Filtreyi veya arama terimini temizleyerek tüm katman illerini görebilirsiniz.</div>`;

      container.innerHTML = `
        <section class="scl-shell" style="--scl-accent:${esc(stratum.accent)}; --scl-accent-soft:${esc(stratum.accentSoft)};">
          <header class="scl-hero">
            <div class="scl-hero-top">
              <div>
                <div class="scl-eyebrow">🏛️ TAŞIN HAFIZASI · 7 MEDENİYET KATMASI</div>
                <h2 class="scl-title">Anadolu Medeniyet Katmanları &amp; Zaman Felsefesi</h2>
              </div>
              <div class="scl-hero-badges">
                <span class="scl-stat-pill">🗺️ ${coveredCount} / ${totalProvinces} İl Haritalandı</span>
                <span class="scl-stat-pill">👣 ${totalVisited} / ${totalProvinces} İl Gezildi</span>
                <span class="scl-stat-pill">
                  <span class="scl-dot ${hasLiveKey ? '' : 'offline'}"></span>
                  ${hasLiveKey ? 'Gemini AI Canlı Akış Hazır' : 'Çevrimdışı Felsefe Arşivi Hazır'}
                </span>
              </div>
            </div>
            <blockquote class="scl-thesis">“${esc(THESIS_QUOTE)}”</blockquote>
          </header>

          <section class="scl-strata-section" aria-label="7 Katmanlı Medeniyet Seçici">
            <div class="scl-section-head">
              <h3 class="scl-section-title">🪨 Arkeolojik &amp; Tarihî Katman Kazısı (7 Çağ)</h3>
              <span class="scl-section-hint">Bir katman seçerek zaman tasavvurunu ve ilgili illeri inceleyin</span>
            </div>
            <div class="scl-strata-grid">${strataButtonsHtml}</div>
          </section>

          <article class="scl-essay-panel" aria-live="polite">
            <div class="scl-essay-header">
              <div>
                <div class="scl-essay-kicker">${esc(stratum.depthLabel)} · ${esc(stratum.era)}</div>
                <h3 class="scl-essay-title">${esc(stratum.title)}</h3>
                <p class="scl-essay-subtitle">${esc(stratum.subtitle)}</p>
              </div>
              <div class="scl-progress-box">
                <div class="scl-progress-row">
                  <span>Katman İzi</span>
                  <span>${visitedInStratum} / ${matchedItems.length} İl (%${pctStratum})</span>
                </div>
                <div class="scl-progress-track">
                  <div class="scl-progress-fill" style="width:${pctStratum}%"></div>
                </div>
              </div>
            </div>

            <div class="scl-epigraph">“${esc(stratum.epigraph)}”</div>
            <div class="scl-essay-body">${esc(stratum.essay)}</div>

            <div class="scl-pillars-grid">
              <div class="scl-pillar-card">
                <div class="scl-pillar-head">⏳ Zaman Tasavvuru</div>
                <div class="scl-pillar-text">${esc(stratum.philosophy.time)}</div>
              </div>
              <div class="scl-pillar-card">
                <div class="scl-pillar-head">🏛️ Mekân Anlayışı</div>
                <div class="scl-pillar-text">${esc(stratum.philosophy.space)}</div>
              </div>
              <div class="scl-pillar-card">
                <div class="scl-pillar-head">🕊️ İnsan &amp; Hakikat</div>
                <div class="scl-pillar-text">${esc(stratum.philosophy.humanity)}</div>
              </div>
            </div>

            <div class="scl-anchors-row">${anchorsHtml}</div>

            <div class="scl-ai-bar">
              <button type="button" class="scl-ai-btn" id="scl-ai-trigger" ${isStreaming ? 'disabled' : ''}>
                ${isStreaming ? '<span class="scl-spinner" aria-hidden="true"></span> Yorumlanıyor…' : '✨ Bu Katmanın Zaman Felsefesini AI ile Yorumla'}
              </button>
              <span class="scl-ai-hint">
                ${hasLiveKey
                  ? 'Gemini AI ile seyyah verilerinize göre canlı akış yorumu üretir.'
                  : 'API anahtarı yoksa katmana özel derin çevrimdışı felsefi analiz sunar.'}
              </span>
            </div>

            ${aiOutputHtml}
          </article>

          <section class="scl-provinces-section" aria-label="Katmana Ait İller">
            <div class="scl-section-head">
              <h3 class="scl-section-title">${esc(stratum.icon)} Bu Katmandaki Anadolu İlleri (${filteredItems.length} / ${matchedItems.length})</h3>
              <span class="scl-section-hint">Şehir sayfasını açmak için bir karta tıklayın</span>
            </div>

            <div class="scl-filter-toolbar">
              <div class="scl-filter-pills">
                <button type="button" class="scl-filter-btn ${uiState.visitFilter === 'all' ? 'active' : ''}" data-scl-filter="all">Tümü (${matchedItems.length})</button>
                <button type="button" class="scl-filter-btn ${uiState.visitFilter === 'visited' ? 'active' : ''}" data-scl-filter="visited">✓ Gezilen (${visitedInStratum})</button>
                <button type="button" class="scl-filter-btn ${uiState.visitFilter === 'unvisited' ? 'active' : ''}" data-scl-filter="unvisited">✦ Keşfedilecek (${matchedItems.length - visitedInStratum})</button>
              </div>
              <input
                type="search"
                id="scl-province-search"
                class="scl-search-input"
                placeholder="Bu katmanda il veya eser ara…"
                value="${esc(uiState.searchQuery)}"
                aria-label="Bu katmanda il veya eser ara"
              >
            </div>

            <div class="scl-city-grid">${cityCardsHtml}</div>
          </section>
        </section>
      `;

      bindEvents(stratum, matchedItems);
    }

    function bindEvents(stratum, matchedItems) {
      const stratumBtns = container.querySelectorAll('[data-scl-stratum]');
      stratumBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const nextId = btn.getAttribute('data-scl-stratum');
          if (nextId && nextId !== uiState.activeStratumId) {
            uiState.activeStratumId = nextId;
            uiState.searchQuery = '';
            uiState.visitFilter = 'all';
            paint();
          }
        });
      });

      const filterBtns = container.querySelectorAll('[data-scl-filter]');
      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          uiState.visitFilter = btn.getAttribute('data-scl-filter') || 'all';
          paint();
        });
      });

      const searchInput = container.querySelector('#scl-province-search');
      if (searchInput) {
        searchInput.addEventListener('input', function (e) {
          const cursorPos = e.target.selectionStart;
          uiState.searchQuery = e.target.value || '';
          paint();
          const reInput = container.querySelector('#scl-province-search');
          if (reInput) {
            reInput.focus();
            if (typeof cursorPos === 'number') {
              try { reInput.setSelectionRange(cursorPos, cursorPos); } catch (_) {}
            }
          }
        });
      }

      const cityCards = container.querySelectorAll('[data-scl-city]');
      cityCards.forEach(function (card) {
        function openCity() {
          const key = card.getAttribute('data-scl-city');
          if (key && typeof safeCtx.selectCity === 'function') {
            safeCtx.selectCity(key);
          }
        }
        card.addEventListener('click', openCity);
        card.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            openCity();
          }
        });
      });

      const aiBtn = container.querySelector('#scl-ai-trigger');
      if (aiBtn) {
        aiBtn.addEventListener('click', function () {
          triggerAiInterpretation(stratum, matchedItems);
        });
      }
    }

    async function triggerAiInterpretation(stratum, matchedItems) {
      const aiState = getAiState(stratum.id);
      if (aiState.status === 'streaming') return;

      const reqToken = ++uiState.activeRequestToken;
      aiState.status = 'streaming';
      aiState.error = '';
      aiState.text = '';
      aiState.source = '';
      paint();

      const visitedNames = matchedItems
        .filter(function (it) { return it.province.visited; })
        .map(function (it) { return it.province.name; });
      const sampleProvinces = matchedItems
        .slice(0, 12)
        .map(function (it) { return `${it.province.name} (${it.note})`; })
        .join('\n- ');

      const canUseLiveAi =
        window.SEYYAH_AI &&
        typeof window.SEYYAH_AI.stream === 'function' &&
        typeof window.SEYYAH_AI.hasKey === 'function' &&
        window.SEYYAH_AI.hasKey();

      if (!canUseLiveAi) {
        aiState.status = 'done';
        aiState.text = generateOfflinePhilosophicalEssay(stratum, matchedItems);
        aiState.source = '📜 Çevrimdışı Zaman Felsefesi Arşivi';
        paint();
        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast('📜 Katmanın zaman felsefesi çevrimdışı arşivden yorumlandı.');
        }
        return;
      }

      const anatoliaCtx = typeof window.SEYYAH_AI.buildAnatoliaContext === 'function'
        ? window.SEYYAH_AI.buildAnatoliaContext(safeCtx)
        : '';

      const systemPrompt = [
        'Sen Anadolu tarihini, arkeolojisini, mimarisini ve tasavvuf/zaman felsefesini derinlemesine bilen bilge bir seyyah ve kültür filozofusun.',
        `Ana tezin: "${THESIS_QUOTE}"`,
        'Üslubun edebi, berrak, felsefi derinliği yüksek, klişelerden uzak ve somut Anadolu duraklarına dayalı olsun. Markdown başlıkları, madde işaretleri ve alıntı blokları kullan.'
      ].join('\n');

      const userPrompt = [
        `Seçili Medeniyet Katmanı: ${stratum.title}`,
        `Dönem: ${stratum.era}`,
        `Katman Özeti: ${stratum.essay}`,
        `Zaman: ${stratum.philosophy.time}`,
        `Mekân: ${stratum.philosophy.space}`,
        `İnsan: ${stratum.philosophy.humanity}`,
        `Seyyahın Bu Katmandaki Gezdikleri (${visitedNames.length}/${matchedItems.length}): ${visitedNames.join(', ') || 'Henüz yok'}`,
        `Katmandan Örnek İller ve İzler:\n- ${sampleProvinces}`,
        anatoliaCtx ? `Genel Seyahat Bağlamı:\n${anatoliaCtx}` : '',
        '',
        'Lütfen bu katmanın Zaman (fanilik/beka), Mekân (taşın hafızası) ve İnsan anlayışını derin felsefi bir deneme olarak yorumla; seyyahın bu katmandaki gezilen ve gezilmeyi bekleyen şehirlerine özel bir tefekkür rotası öner.'
      ].filter(Boolean).join('\n');

      try {
        const res = await window.SEYYAH_AI.stream({
          prompt: userPrompt,
          system: systemPrompt,
          temperature: 0.75,
          maxTokens: 1600,
          cacheKey: `civlayers:${stratum.id}:v${visitedNames.length}`,
          onChunk: function (_delta, fullText) {
            aiState.text = fullText;
            if (uiState.activeStratumId === stratum.id) {
              const mdBody = container.querySelector('#scl-ai-md-body');
              if (mdBody) {
                mdBody.innerHTML = renderMdSafe(fullText, esc);
              } else {
                paint();
              }
            }
          }
        });

        aiState.status = 'done';
        aiState.text = (res && res.text) || aiState.text || generateOfflinePhilosophicalEssay(stratum, matchedItems);
        aiState.source = res && res.model
          ? `⚡ Gemini AI (${res.model})${res.cached ? ' · Önbellek' : ''}`
          : '⚡ Gemini AI Canlı Yorum';
        if (uiState.activeStratumId === stratum.id || reqToken === uiState.activeRequestToken) {
          paint();
        }
      } catch (err) {
        aiState.status = 'done';
        aiState.error = (err && err.message) || 'AI yanıt vermedi';
        aiState.text = generateOfflinePhilosophicalEssay(stratum, matchedItems);
        aiState.source = '📜 Çevrimdışı Felsefe Arşivi (AI Yedeği)';
        paint();
        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast('⚠️ AI bağlantısı kurulamadı — Çevrimdışı felsefi yorum gösteriliyor.');
        }
      }
    }

    paint();
  }

  window.SEYYAH_MODULES.civLayers = {
    render: render,
    STRATA: STRATA
  };
})();
