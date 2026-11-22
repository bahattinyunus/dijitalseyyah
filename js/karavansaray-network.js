/**
 * Anadolu Kervansarayları, İpek Yolu & Modern GSB Menzil Atlası
 * XIII. yüzyıl Selçuklu/Saltuklu/Osmanlı Kervansarayları (Ribat & Sultan Hanları) ile
 * XXI. yüzyıl GSB Seyahatsever KYK Kervansarayları ve 81 İl Halk Kütüphanesi Ofislerini buluşturur.
 * Registers on window.SEYYAH_MODULES.caravanserai = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-karavansaray-network-styles';
  const NIGHTLY_RATE_TL = 2200;
  const FIVE_DAY_NIGHTS = 5;
  const FIVE_DAY_SAVING_TL = NIGHTLY_RATE_TL * FIVE_DAY_NIGHTS; // 11.000 ₺
  const VAKIF_PILLAR_QUOTE =
    '3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit — dünün Sultan Hanı, bugünün GSB Seyahatsever menzilidir.';

  // ---------------------------------------------------------------------------
  // Helpers (Escaping, Turkish Normalization, Markdown, Formatting)
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

  function formatTL(num) {
    const n = Number(num) || 0;
    try {
      return n.toLocaleString('tr-TR');
    } catch (_) {
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  }

  function formatPlate(plate) {
    const n = Number(plate);
    if (!Number.isFinite(n) || n <= 0) return '--';
    return String(n).padStart(2, '0');
  }

  function resolveBannerPath(p) {
    if (p && p.has_banner && p.banner_rel) return p.banner_rel;
    if (p && p.banner_rel) return p.banner_rel;
    if (p && Array.isArray(p.images) && p.images[0]) return p.images[0];
    return 'assets/banner.jpg';
  }

  function resolveProvincesMap(ctx) {
    if (ctx && ctx.data && ctx.data.provinces) return ctx.data.provinces;
    if (typeof TRAVEL_DATA !== 'undefined' && TRAVEL_DATA && TRAVEL_DATA.provinces) {
      return TRAVEL_DATA.provinces;
    }
    return {};
  }

  // ---------------------------------------------------------------------------
  // Section 1 Dataset: Historical Sultan Hans & Caravanserais (Real Province Keys)
  // ---------------------------------------------------------------------------
  const CARAVANSERAIS = [
    {
      id: 'aksaray-sultanhani',
      name: 'Aksaray Sultanhanı',
      provinceKey: '04_IcAnadolu/Aksaray',
      provinceName: 'Aksaray',
      district: 'Sultanhanı',
      era: 'Anadolu Selçuklu',
      eraGroup: 'selcuklu',
      year: '1229',
      patron: 'I. Alâeddin Keykubad',
      architect: 'Muhammed bin Havlan ed-Dımaşkî',
      corridor: 'Konya–Aksaray–Kayseri İpek Yolu',
      corridorGroup: 'orta-anadolu',
      architecture:
        'Yaklaşık 4.900 m² alanıyla Anadolu’nun en büyük Sultan Hanı; abidevî mermer mukarnaslı taçkapısı, ortasında köşk mescit yükselen revaklı yazlık avlusu, kalın pâyeli tonozlu kışlık holü ve kale görünümlü yarım burçlarıyla taş işçiliğinin şaheseridir.',
      vakifPhilosophy:
        '3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit düzeni: Sultan vakfiyesi gereği dil, din ve rütbe ayrımı gözetmeksizin her yolcuya ücretsiz aş, hamam, tabip, nalbant ve devlet garantili kervan sigortası sunulurdu.',
      modernBridge:
        'Bugün Aksaray GSB yurt menzilinde 5 gün kalarak İl Halk Kütüphanesi’nde çalışırken, bozkırın ortasındaki aynı menzil disiplini yaşatılır.'
    },
    {
      id: 'agzikara-han',
      name: 'Ağzıkara Han (Hoca Mesud Kervansarayı)',
      provinceKey: '04_IcAnadolu/Aksaray',
      provinceName: 'Aksaray',
      district: 'Ağzıkarahan',
      era: 'Anadolu Selçuklu',
      eraGroup: 'selcuklu',
      year: '1231–1239',
      patron: 'Hoca Mesud bin Abdullah',
      architect: 'Selçuklu Taş Ustaları Loncası',
      corridor: 'Aksaray–Nevşehir–Kayseri İpek Yolu',
      corridorGroup: 'orta-anadolu',
      architecture:
        'Yüksek savunma duvarları, poligonal dış burçları, geometrik geçmeli taş taçkapısı ve avlu merkezinde dört sivri kemer üzerine oturan zarif köşk mescidiyle kervan güvenliğinin en estetik örneğidir.',
      vakifPhilosophy:
        '3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit ilkesiyle; tüccar ve seyyahlara sadece yatacak yer değil, eşkıya ve kış fırtınalarına karşı zırhlı sığınak, şifa ve ilim sohbeti sağlardı.',
      modernBridge:
        'Hasandağı eteklerinden Kapadokya kapısına uzanan bu menzil, modern seyyahın tek sırt çantasıyla güvenli ve sade konaklama anlayışının atasıdır.'
    },
    {
      id: 'kayseri-karatay-han',
      name: 'Kayseri Karatay Han',
      provinceKey: '04_IcAnadolu/Kayseri',
      provinceName: 'Kayseri',
      district: 'Bünyan (Karadayı)',
      era: 'Anadolu Selçuklu',
      eraGroup: 'selcuklu',
      year: '1240–1241',
      patron: 'Vezir Celaleddin Karatay',
      architect: 'Selçuklu Başmimarlığı',
      corridor: 'Kayseri–Sivas–Malatya İpek Yolu',
      corridorGroup: 'orta-anadolu',
      architecture:
        'Ejder, aslan, boğa ve insan figürlü taş kabartmaları, süslü eyvanları, bağımsız hamam bölümü ve muazzam mukarnaslı taçkapısıyla Selçuklu ikonografisinin ve taş oyma sanatının zirve duraklarındandır.',
      vakifPhilosophy:
        'Celaleddin Karatay’ın meşhur vakfiyesi “3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit” hükmünü ayrıntıyla yazar: fakir yolcuya çarık, hastaya ilaç ve hekim, yolcu hayvanına yem verilmesi şart koşulmuştur.',
      modernBridge:
        'Kayseri GSB Seyahatsever konaklaması ve Kayseri Merkez İl Halk Kütüphanesi mesaisiyle Karatay Vakfiyesi’nin fırsat eşitliği ruhu 21. yüzyılda devam eder.'
    },
    {
      id: 'konya-zazadin-han',
      name: 'Konya Zazadin Han (Sadeddin Köpek Hanı)',
      provinceKey: '04_IcAnadolu/Konya',
      provinceName: 'Konya',
      district: 'Selçuklu (Tömek)',
      era: 'Anadolu Selçuklu',
      eraGroup: 'selcuklu',
      year: '1235–1236',
      patron: 'Emir Sadeddin Köpek',
      architect: 'Sadeddin Köpek (Kitabesinde bizzat mimar olarak anılır)',
      corridor: 'Konya–Aksaray Sultan Yolu',
      corridorGroup: 'orta-anadolu',
      architecture:
        'Siyah ve beyaz iki renkli kesme taşların ritmik uyumu (ablak örgü), cepheye özenle yerleştirilmiş Antik Roma-Bizans devşirme yazıtlı taşları ve avlu üstündeki mescidiyle çok katmanlı Anadolu hafızasını yansıtır.',
      vakifPhilosophy:
        'Başkent Konya’dan doğuya çıkan ilk büyük konaklama menzili olarak 3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit kültürünü şehrin hemen çıkışında yolcuya sunmuştur.',
      modernBridge:
        'Konya’daki GSB menzili ve İl Halk Kütüphanesi çalışma disiplini, Mevlânâ diyarına gelen her dijital seyyaha Zazadin’in ilk menzil sükunetini verir.'
    },
    {
      id: 'konya-obruk-han',
      name: 'Konya Obruk Han',
      provinceKey: '04_IcAnadolu/Konya',
      provinceName: 'Konya',
      district: 'Karatay (Kızören Obruğu)',
      era: 'Anadolu Selçuklu',
      eraGroup: 'selcuklu',
      year: 'XIII. Yüzyıl Ortası',
      patron: 'Selçuklu Ümerası (Sultan Yolu Vakfı)',
      architect: 'Selçuklu Menzil Mimarları',
      corridor: 'Konya–Aksaray Kızören Bozkır Hattı',
      corridorGroup: 'orta-anadolu',
      architecture:
        'Turkuaz renkli Kızören Obruğu krater gölünün hemen kıyısına kurulmuş; göle açılan kemerli pencereleri, kesme taş mescit bölümü ve sert bozkır rüzgarına direnen tonozlu holüyle tabiatla bütünleşen tek han örneğidir.',
      vakifPhilosophy:
        'Kurak bozkırda suyun ve bilginin kıymetini bilen vakıf anlayışıyla; 3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit hizmetini susuz kervanlara hayat suyu eşliğinde sunmuştur.',
      modernBridge:
        'Obruk gölü kenarında tefekkür eden dünün yolcusu gibi, bugünün seyyahı da Konya kütüphanelerinde zihnini berraklaştırıp GSB yurdunda güvenle konaklar.'
    },
    {
      id: 'antalya-alara-han',
      name: 'Antalya Alara Han',
      provinceKey: '03_Akdeniz/Antalya',
      provinceName: 'Antalya',
      district: 'Alanya (Alara Çayı)',
      era: 'Anadolu Selçuklu',
      eraGroup: 'selcuklu',
      year: '1231–1232',
      patron: 'I. Alâeddin Keykubad',
      architect: 'Selçuklu Saray Mimarlığı',
      corridor: 'Alanya–Antalya–Konya Toros İpek Yolu',
      corridorGroup: 'akdeniz',
      architecture:
        'Alara Kalesi’nin sarp kayalıkları eteğinde, Alara Çayı’nın kıyısında konumlanır; aslan başı taş çörtenleri, dış duvarlara yaslı tonozlu kervan dehlizleri ve ortadaki ışık fenerli tonozuyla Toros geçidinin kilit taşıdır.',
      vakifPhilosophy:
        'Akdeniz limanlarından Toroslar’ın sarp geçitlerine tırmanacak kafilelere 3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit imkânı tanıyarak denizle bozkır arasında köprü kurmuştur.',
      modernBridge:
        'Antalya’nın GSB Seyahatsever yurtları ve Tekelioğlu İl Halk Kütüphanesi, kıyıdan yaylaya uzanan seyyahlara aynı konuksever menzili sunar.'
    },
    {
      id: 'antalya-evdir-han',
      name: 'Antalya Evdir Han',
      provinceKey: '03_Akdeniz/Antalya',
      provinceName: 'Antalya',
      district: 'Döşemealtı',
      era: 'Anadolu Selçuklu',
      eraGroup: 'selcuklu',
      year: '1210–1219',
      patron: 'I. İzzeddin Keykavus',
      architect: 'Erken Selçuklu Ustaları',
      corridor: 'Antalya Limanı–Burdur–Isparta Kuzey Yolu',
      corridorGroup: 'akdeniz',
      architecture:
        'Kapalı kışlık holü yerine tamamen dört eyvanlı dev bir açık avlu ve çift sıra revaklardan oluşan nadir plan şemasıyla Anadolu’daki en erken tarihli Selçuklu sultan hanlarından biridir.',
      vakifPhilosophy:
        'Akdeniz sıcaklığına uyumlu serin revaklarında 3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit geleneğini yaşatarak liman tüccarını Anadolu içlerine hazırlardı.',
      modernBridge:
        'Döşemealtı’nın antik taş yolundan bugünün Antalya merkez kütüphanesine uzanan çizgi, iklimle dost mimari ve sade seyahat bilincini hatırlatır.'
    },
    {
      id: 'sivas-ciftlik-han',
      name: 'Sivas Çiftlik Han',
      provinceKey: '04_IcAnadolu/Sivas',
      provinceName: 'Sivas',
      district: 'Yıldızeli (Çiftlik)',
      era: 'Anadolu Selçuklu',
      eraGroup: 'selcuklu',
      year: 'XIII. Yüzyıl',
      patron: 'Anadolu Selçuklu Menzil Vakfı',
      architect: 'Sivas Taş İşçiliği Ekolü',
      corridor: 'Sivas–Tokat–Amasya Kuzey İpek Yolu',
      corridorGroup: 'orta-anadolu',
      architecture:
        'Çamlıbel ve Yıldızeli geçitlerinin sert kış şartlarına göre tasarlanmış üç nefli kapalı kışlık barınak, kesme taş kemerli avlu girişi ve sağlam payanda duvarlarıyla Anadolu bozkırının kar siperidir.',
      vakifPhilosophy:
        'Kar ve tipi altındaki yolcular için 3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit vazifesini yerine getirir; sönmeyen ocakta sıcak çorba ve yem ücretsiz dağıtılırdı.',
      modernBridge:
        'Sivas GSB Seyahatsever yurdu ve Şemsi Sivasi İl Halk Kütüphanesi, soğuk Anadolu gecelerinde seyyaha sıcak bir ocak ve ilim yuvası açar.'
    },
    {
      id: 'malatya-silahtar-mustafa-pasa',
      name: 'Malatya Silahtar Mustafa Paşa Kervansarayı',
      provinceKey: '06_DoguAnadolu/Malatya',
      provinceName: 'Malatya',
      district: 'Battalgazi (Eski Malatya)',
      era: 'Osmanlı',
      eraGroup: 'osmanli',
      year: '1637',
      patron: 'Silahtar Bosnalı Mustafa Paşa (IV. Murad Dönemi)',
      architect: 'Üstad Mehmed (Hassa Mimarları)',
      corridor: 'Malatya–Fırat–Bağdat Sefer & İpek Yolu',
      corridorGroup: 'dogu-anadolu',
      architecture:
        '68×76 m boyutlarında görkemli dikdörtgen plan, 780 m²’lik tonozlu kışlık hol, geniş açık avlu, ön cephede sıralanan esnaf dükkânları ve kesme taş işçiliğiyle Osmanlı menzil mimarisinin Doğu’daki anıtsal temsilcisidir.',
      vakifPhilosophy:
        'Osmanlı vakıf geleneğiyle 3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit hizmetini sürdürerek Fırat havzasındaki elçileri, dervişleri ve tüccarları emniyet içinde ağırlamıştır.',
      modernBridge:
        'Battalgazi surları ile Malatya İl Halk Kütüphanesi ve GSB yurtları arasında kurulan rota, asırlık menzil geleneğini modern şehir ofisine bağlar.'
    },
    {
      id: 'erzincan-mama-hatun',
      name: 'Erzincan Mama Hatun Kervansarayı',
      provinceKey: '06_DoguAnadolu/Erzincan',
      provinceName: 'Erzincan',
      district: 'Tercan',
      era: 'Saltuklu / Beylikler',
      eraGroup: 'beylikler',
      year: '1192 Civarı',
      patron: 'Saltuklu Melikesi Mama Hatun',
      architect: 'Ahlatlı Ebü’l-Nemâ Mufaddal',
      corridor: 'Erzurum–Erzincan–Sivas Doğu İpek Yolu',
      corridorGroup: 'dogu-anadolu',
      architecture:
        'Bir kadın hükümdar tarafından inşa ettirilen külliye; han, hamam, mescit ve dairesel sur duvarı içine alınmış eşsiz dilimli kümbetiyle İslam-Türk mimarlık tarihinin en özgün menzil komplekslerinden biridir.',
      vakifPhilosophy:
        'Anadolu’daki en erken büyük vakıf menzillerinden biri olarak; Fırat vadisinden geçen her yolcuya 3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit şefkatini sunmuştur.',
      modernBridge:
        'Erzincan’da GSB yurt konaklaması ve İl Halk Kütüphanesi mesaisi yapan seyyah, Tercan’da sekiz asır önce bir kadın baninin kurduğu vakıf merhametini selamlar.'
    },
    {
      id: 'edirne-rustem-pasa',
      name: 'Edirne Rüstem Paşa Kervansarayı',
      provinceKey: '01_Marmara/Edirne',
      provinceName: 'Edirne',
      district: 'Merkez',
      era: 'Osmanlı',
      eraGroup: 'osmanli',
      year: '1560–1561',
      patron: 'Sadrazam Damat Rüstem Paşa',
      architect: 'Mimar Sinan',
      corridor: 'İstanbul–Edirne–Balkanlar Rumeli Yolu',
      corridorGroup: 'bati-rumeli',
      architecture:
        'Mimar Sinan dehasının eseri; Büyük Han ve Deveci Hanı (Küçük Han) adlı iki bölümden oluşur. Taş ve tuğla almaşık duvar örgüsü, iki katlı revaklı odaları ve şadırvanlı ferah avlusuyla şehir içi kervansaray tasarımının doruğudur.',
      vakifPhilosophy:
        'Rumeli ile İstanbul arasında sefere çıkan ilim insanlarına, elçilere ve tüccarlara 3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit atmosferini payitaht zarafetiyle sunmuştur.',
      modernBridge:
        'Edirne GSB yurdunda kalıp Edirne İl Halk Kütüphanesi’nde çalışan seyyah, Mimar Sinan’ın taşlara işlediği nizam ve tefekkürü bugüne taşır.'
    },
    {
      id: 'bursa-koza-han',
      name: 'Bursa Koza Han',
      provinceKey: '01_Marmara/Bursa',
      provinceName: 'Bursa',
      district: 'Osmangazi (Hanlar Bölgesi)',
      era: 'Osmanlı',
      eraGroup: 'osmanli',
      year: '1491',
      patron: 'Sultan II. Bayezid',
      architect: 'Abdülâlâ bin Puladşah',
      corridor: 'İpek Yolu Batı Terminali (Bursa–Tebriz İpek Hattı)',
      corridorGroup: 'bati-rumeli',
      architecture:
        'İki katlı 95 odalı dikdörtgen avlu, alt katta ticaret odaları ve üst katta konaklama hücreleri ile ortasında şadırvan üstü sekizgen köşk mescidini barındıran canlı bir ticaret ve kültür merkezidir.',
      vakifPhilosophy:
        'İpek Yolu’nun batıdaki nihai pazarı olan Koza Han, Ahilik terbiyesi ile 3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit bilincini harmanlayarak geliriyle vakıf eserlerini yaşatmıştır.',
      modernBridge:
        'Bursa GSB yurtlarında konaklayan modern seyyah, gündüz İl Halk Kütüphanesi’nde üretip akşam Koza Han’ın çınarları altında İpek Yolu’nun nabzını tutar.'
    },
    {
      id: 'izmir-kizlaragasi-hani',
      name: 'İzmir Kızlarağası Hanı',
      provinceKey: '02_Ege/Izmir',
      provinceName: 'İzmir',
      district: 'Konak (Kemeraltı)',
      era: 'Osmanlı',
      eraGroup: 'osmanli',
      year: '1744',
      patron: 'Darüssaade Ağası Hacı Beşir Ağa',
      architect: 'XVIII. Yüzyıl Osmanlı Hassa Mimarları',
      corridor: 'Anadolu İpek Yolu Ege Liman Kapısı',
      corridorGroup: 'bati-rumeli',
      architecture:
        'Yaklaşık 4.000 m²’lik iki katlı büyük planı, içinde barındırdığı Cevahir Bedesteni, alt kattaki beşik tonozlu depoları ve üst kattaki konaklama odalarıyla deniz ticaretinin kervansaray mimarisiyle buluşmasıdır.',
      vakifPhilosophy:
        'Kervanların Ege Denizi’ne ulaştığı son menzilde 3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit ruhunu yaşatarak liman şehrine güvenli sığınak ve kültür kahvehanesi olmuştur.',
      modernBridge:
        'İzmir GSB Seyahatsever yurtları ve Atatürk İl Halk Kütüphanesi ile birleşen Kemeraltı rotası, deniz kokulu bir modern kervansaray deneyimi sunar.'
    }
  ];

  // Build quick provinceKey -> Caravanserai[] lookup
  const HAN_BY_PROVINCE = new Map();
  CARAVANSERAIS.forEach(function (han) {
    if (!HAN_BY_PROVINCE.has(han.provinceKey)) {
      HAN_BY_PROVINCE.set(han.provinceKey, []);
    }
    HAN_BY_PROVINCE.get(han.provinceKey).push(han);
  });

  // Fallback coordinates for Sultan Hans (used if province lacks lat/lon)
  const HAN_FALLBACK_COORDS = {
    'aksaray-sultanhani': [38.247, 33.547],
    'agzikara-han': [38.445, 34.142],
    'kayseri-karatay-han': [38.641, 35.948],
    'konya-zazadin-han': [38.015, 32.685],
    'konya-obruk-han': [38.175, 33.182],
    'antalya-alara-han': [36.692, 31.673],
    'antalya-evdir-han': [37.022, 30.601],
    'sivas-ciftlik-han': [39.965, 36.578],
    'malatya-silahtar-mustafa-pasa': [38.423, 38.367],
    'erzincan-mama-hatun': [39.777, 40.388],
    'edirne-rustem-pasa': [41.676, 26.556],
    'bursa-koza-han': [40.184, 29.062],
    'izmir-kizlaragasi-hani': [38.421, 27.133]
  };

  function getHanCoords(han, provincesMap) {
    if (han && HAN_FALLBACK_COORDS[han.id]) {
      return HAN_FALLBACK_COORDS[han.id];
    }
    const p = han && provincesMap ? provincesMap[han.provinceKey] : null;
    if (p) {
      if (Array.isArray(p.coords) && p.coords.length >= 2) return [Number(p.coords[0]), Number(p.coords[1])];
      if (Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon))) return [Number(p.lat), Number(p.lon)];
    }
    return [39.0, 35.0];
  }

  function calcRoadDistanceKm(coordA, coordB) {
    const toRad = function (d) { return (d * Math.PI) / 180; };
    const lat1 = toRad(coordA[0]);
    const lat2 = toRad(coordB[0]);
    const dLat = lat2 - lat1;
    const dLon = toRad(coordB[1] - coordA[1]);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const straightKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(straightKm * 1.24);
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

  // ---------------------------------------------------------------------------
  // Module-level State
  // ---------------------------------------------------------------------------
  const uiState = {
    eraFilter: 'all', // 'all' | 'selcuklu' | 'beylikler' | 'osmanli'
    corridorFilter: 'all', // 'all' | 'orta-anadolu' | 'akdeniz' | 'dogu-anadolu' | 'bati-rumeli'
    regionFilter: 'all',
    visitedFilter: 'all', // 'all' | 'visited' | 'unvisited' | 'han-only'
    searchQuery: '',
    calcFromId: 'konya-zazadin-han',
    calcToId: 'kayseri-karatay-han',
    aiFocusId: 'general', // 'general' | caravanserai.id | 'prov:<key>'
    aiStatus: 'idle', // 'idle' | 'streaming' | 'done'
    aiText: '',
    aiSource: '',
    aiError: '',
    aiRequestToken: 0
  };

  // ---------------------------------------------------------------------------
  // Scoped CSS Injection (Dark & body.light-theme compatible)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .skn-root {
        display: flex;
        flex-direction: column;
        gap: 22px;
        padding: 4px 2px 36px;
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
        --skn-amber: #f59e0b;
        --skn-amber-soft: rgba(245, 158, 11, 0.16);
        --skn-cyan: var(--accent-cyan, #00f2fe);
        --skn-emerald: var(--accent-emerald, #10b981);
      }

      /* Hero Banner */
      .skn-hero {
        position: relative;
        overflow: hidden;
        border-radius: 22px;
        padding: 26px 28px;
        background:
          radial-gradient(circle at 8% 12%, rgba(245, 158, 11, 0.2), transparent 46%),
          radial-gradient(circle at 92% 18%, rgba(0, 242, 254, 0.15), transparent 44%),
          radial-gradient(circle at 60% 100%, rgba(16, 185, 129, 0.12), transparent 45%),
          var(--bg-glass, rgba(15, 23, 42, 0.88));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        box-shadow: var(--shadow-subtle, 0 12px 32px rgba(0, 0, 0, 0.45));
      }

      .skn-hero-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--skn-amber);
        background: rgba(245, 158, 11, 0.13);
        border: 1px solid rgba(245, 158, 11, 0.34);
        padding: 5px 12px;
        border-radius: 999px;
        margin-bottom: 12px;
      }

      .skn-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.45rem, 2.5vw, 2.08rem);
        font-weight: 800;
        line-height: 1.2;
        margin: 0 0 10px;
        background: linear-gradient(125deg, #ffffff 15%, #fde68a 52%, #7dd3fc 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .skn-subtitle {
        font-size: 0.94rem;
        line-height: 1.6;
        color: var(--text-secondary, #cbd5e1);
        max-width: 920px;
        margin: 0 0 16px;
      }

      .skn-thesis-quote {
        padding: 13px 18px;
        border-left: 3px solid var(--skn-amber);
        border-radius: 0 14px 14px 0;
        background: rgba(15, 23, 42, 0.56);
        font-size: 0.92rem;
        font-style: italic;
        color: var(--text-primary, #f8fafc);
        margin-bottom: 18px;
      }

      .skn-kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }

      .skn-kpi-card {
        padding: 12px 15px;
        border-radius: 15px;
        background: rgba(15, 23, 42, 0.54);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .skn-kpi-label {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary, #94a3b8);
        font-weight: 700;
      }

      .skn-kpi-value {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.22rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .skn-kpi-sub {
        font-size: 0.74rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* Vakif <-> Modern Bridge Strip */
      .skn-bridge-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 10px;
      }

      .skn-bridge-item {
        padding: 11px 14px;
        border-radius: 14px;
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.24);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .skn-bridge-top {
        font-size: 0.78rem;
        font-weight: 700;
        color: #fcd34d;
      }

      .skn-bridge-arrow {
        font-size: 0.75rem;
        color: var(--text-secondary, #cbd5e1);
        line-height: 1.45;
      }

      /* Section Panels */
      .skn-section {
        border-radius: 22px;
        padding: 22px 24px;
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      }

      .skn-section-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
      }

      .skn-section-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.18rem;
        font-weight: 800;
        margin: 0 0 4px;
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .skn-section-desc {
        font-size: 0.84rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.5;
        max-width: 780px;
      }

      .skn-count-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 0.76rem;
        font-weight: 700;
        background: rgba(245, 158, 11, 0.15);
        color: #fcd34d;
        border: 1px solid rgba(245, 158, 11, 0.34);
        white-space: nowrap;
      }

      /* Gemini AI Caravanserai Studio */
      .skn-ai-panel {
        border-radius: 22px;
        padding: 20px 24px;
        background:
          radial-gradient(circle at 96% 8%, rgba(0, 242, 254, 0.14), transparent 46%),
          radial-gradient(circle at 4% 92%, rgba(245, 158, 11, 0.12), transparent 45%),
          var(--bg-glass, rgba(15, 23, 42, 0.88));
        border: 1px solid rgba(0, 242, 254, 0.28);
        box-shadow: var(--shadow-subtle, 0 10px 28px rgba(0, 0, 0, 0.4));
      }

      .skn-ai-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
      }

      .skn-ai-select-wrap {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 240px;
      }

      .skn-select,
      .skn-search-input {
        padding: 9px 13px;
        border-radius: 12px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.7);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.85rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .skn-select:focus,
      .skn-search-input:focus {
        border-color: var(--skn-cyan);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .skn-select {
        min-width: 220px;
        max-width: 100%;
      }

      .skn-ai-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: 12px;
        border: 1px solid rgba(0, 242, 254, 0.45);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(0, 242, 254, 0.24));
        color: #ffffff;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
      }

      .skn-ai-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(0, 242, 254, 0.24);
        filter: brightness(1.08);
      }

      .skn-ai-btn:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      .skn-ai-output {
        margin-top: 14px;
        border-radius: 16px;
        padding: 16px 18px;
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(0, 242, 254, 0.22);
      }

      .skn-ai-output-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding-bottom: 10px;
        margin-bottom: 12px;
        border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
      }

      .skn-ai-source {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--skn-cyan);
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }

      .skn-ai-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--skn-emerald);
        box-shadow: 0 0 8px var(--skn-emerald);
      }

      .skn-ai-dot.streaming {
        background: var(--skn-amber);
        box-shadow: 0 0 10px var(--skn-amber);
        animation: sknPulse 1s infinite ease-in-out;
      }

      @keyframes sknPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.45; transform: scale(0.8); }
      }

      .skn-ai-md {
        font-size: 0.9rem;
        line-height: 1.65;
        color: var(--text-primary, #f1f5f9);
      }

      .skn-ai-md .seyyah-md-h1,
      .skn-ai-md .seyyah-md-h2,
      .skn-ai-md .seyyah-md-h3,
      .skn-ai-md .seyyah-md-h4 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        margin: 12px 0 6px;
        color: #fde68a;
      }

      .skn-ai-md .seyyah-md-p {
        margin: 0 0 9px;
      }

      .skn-ai-md .seyyah-md-list {
        margin: 6px 0 10px 18px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .skn-ai-md .seyyah-md-quote {
        margin: 8px 0 10px;
        padding: 9px 13px;
        border-left: 3px solid var(--skn-amber);
        background: rgba(255, 255, 255, 0.04);
        border-radius: 0 10px 10px 0;
        font-style: italic;
      }

      .skn-ai-matches {
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px dashed rgba(255, 255, 255, 0.12);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .skn-ai-match-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: 999px;
        border: 1px solid rgba(0, 242, 254, 0.35);
        background: rgba(0, 242, 254, 0.1);
        color: var(--text-primary, #f8fafc);
        font-size: 0.77rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.18s ease, background 0.18s ease;
      }

      .skn-ai-match-chip:hover {
        transform: translateY(-1px);
        background: rgba(0, 242, 254, 0.22);
      }

      /* Filter Toolbar */
      .skn-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .skn-filter-group {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        align-items: center;
      }

      .skn-filter-btn {
        padding: 7px 13px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.56);
        color: var(--text-secondary, #cbd5e1);
        font-family: inherit;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .skn-filter-btn:hover {
        border-color: var(--skn-amber);
        color: var(--text-primary, #f8fafc);
      }

      .skn-filter-btn.active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.26), rgba(217, 119, 6, 0.16));
        border-color: var(--skn-amber);
        color: #fef3c7;
      }

      .skn-filter-btn.cyan.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.24), rgba(79, 172, 254, 0.16));
        border-color: var(--skn-cyan);
        color: #e0f2fe;
      }

      .skn-search-input {
        min-width: 240px;
        flex: 1 1 240px;
        max-width: 360px;
      }

      /* Historical Caravanserai Cards Grid */
      .skn-han-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
        gap: 16px;
      }

      .skn-han-card {
        display: flex;
        flex-direction: column;
        border-radius: 18px;
        overflow: hidden;
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        transition: transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease;
      }

      .skn-han-card:hover {
        transform: translateY(-3px);
        border-color: rgba(245, 158, 11, 0.55);
        box-shadow: 0 14px 30px -12px rgba(245, 158, 11, 0.35);
      }

      .skn-han-banner {
        position: relative;
        height: 136px;
        overflow: hidden;
        background: #0f172a;
      }

      .skn-han-banner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.45s ease;
      }

      .skn-han-card:hover .skn-han-banner img {
        transform: scale(1.06);
      }

      .skn-banner-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(10, 15, 29, 0.22) 0%, rgba(10, 15, 29, 0.92) 100%);
      }

      .skn-banner-top {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      .skn-era-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.88);
        color: #0f172a;
      }

      .skn-status-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.85);
        color: #cbd5e1;
        border: 1px solid rgba(255, 255, 255, 0.16);
      }

      .skn-status-badge.visited {
        background: rgba(16, 185, 129, 0.25);
        color: #6ee7b7;
        border-color: rgba(16, 185, 129, 0.45);
      }

      .skn-banner-bottom {
        position: absolute;
        bottom: 10px;
        left: 12px;
        right: 12px;
      }

      .skn-han-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.06rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.25;
        margin-bottom: 2px;
      }

      .skn-han-loc {
        font-size: 0.75rem;
        color: #e2e8f0;
      }

      .skn-han-body {
        padding: 14px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
      }

      .skn-han-meta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .skn-meta-chip {
        font-size: 0.72rem;
        padding: 3px 9px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-secondary, #cbd5e1);
      }

      .skn-han-block {
        font-size: 0.81rem;
        line-height: 1.5;
        color: var(--text-secondary, #cbd5e1);
      }

      .skn-han-block strong {
        color: var(--text-primary, #f8fafc);
      }

      .skn-vakif-box {
        padding: 9px 11px;
        border-radius: 11px;
        background: rgba(245, 158, 11, 0.09);
        border: 1px solid rgba(245, 158, 11, 0.24);
        font-size: 0.79rem;
        line-height: 1.48;
        color: var(--text-primary, #f8fafc);
      }

      .skn-card-actions {
        margin-top: auto;
        padding-top: 8px;
        border-top: 1px dashed rgba(255, 255, 255, 0.1);
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .skn-btn-primary,
      .skn-btn-ghost {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: 10px;
        font-family: inherit;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
      }

      .skn-btn-primary {
        flex: 1;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.2));
        border: 1px solid rgba(0, 242, 254, 0.4);
        color: #f8fafc;
      }

      .skn-btn-primary:hover {
        transform: translateY(-1px);
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.32), rgba(79, 172, 254, 0.3));
      }

      .skn-btn-ghost {
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.35);
        color: #fde68a;
      }

      .skn-btn-ghost:hover {
        transform: translateY(-1px);
        background: rgba(245, 158, 11, 0.24);
      }

      /* Section 2: 81-Province GSB & Library Matcher */
      .skn-summary-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        font-size: 0.81rem;
        color: var(--text-secondary, #cbd5e1);
        margin-bottom: 14px;
      }

      .skn-prov-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
        gap: 13px;
      }

      .skn-prov-card {
        display: flex;
        flex-direction: column;
        gap: 9px;
        padding: 14px 15px;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.58);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.11));
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .skn-prov-card:hover {
        transform: translateY(-2px);
        border-color: rgba(0, 242, 254, 0.4);
        box-shadow: 0 10px 24px -10px rgba(0, 242, 254, 0.28);
      }

      .skn-prov-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
      }

      .skn-prov-title-wrap {
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .skn-plate {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.8rem;
        font-weight: 800;
        padding: 4px 8px;
        border-radius: 9px;
        background: rgba(0, 242, 254, 0.14);
        border: 1px solid rgba(0, 242, 254, 0.34);
        color: #7dd3fc;
      }

      .skn-prov-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.2;
      }

      .skn-prov-region {
        font-size: 0.72rem;
        color: var(--text-secondary, #94a3b8);
      }

      .skn-han-link-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 4px 9px;
        border-radius: 8px;
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.32);
        color: #fcd34d;
      }

      .skn-gsb-box {
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.26);
        font-size: 0.77rem;
        line-height: 1.45;
        color: #a7f3d0;
      }

      .skn-lib-box {
        font-size: 0.78rem;
        line-height: 1.48;
        color: var(--text-secondary, #cbd5e1);
      }

      .skn-lib-box strong {
        color: var(--text-primary, #f8fafc);
      }

      .skn-landmarks-row {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .skn-landmark-chip {
        font-size: 0.7rem;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-secondary, #cbd5e1);
      }

      .skn-empty {
        padding: 28px 18px;
        text-align: center;
        border-radius: 14px;
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.16));
        color: var(--text-secondary, #94a3b8);
        font-size: 0.9rem;
      }

      /* ------------------------------------------------------------------ */
      /* Light Theme Overrides (body.light-theme)                           */
      /* ------------------------------------------------------------------ */
      body.light-theme .skn-root {
        color: #0f172a;
      }

      body.light-theme .skn-hero {
        background:
          radial-gradient(circle at 8% 12%, rgba(217, 119, 6, 0.14), transparent 46%),
          radial-gradient(circle at 92% 18%, rgba(2, 132, 199, 0.12), transparent 44%),
          rgba(255, 255, 255, 0.94);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .skn-title {
        background: linear-gradient(125deg, #0f172a 15%, #b45309 55%, #0284c7 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .skn-hero-eyebrow {
        color: #b45309;
        background: rgba(217, 119, 6, 0.12);
        border-color: rgba(217, 119, 6, 0.3);
      }

      body.light-theme .skn-subtitle,
      body.light-theme .skn-section-desc,
      body.light-theme .skn-kpi-label,
      body.light-theme .skn-kpi-sub,
      body.light-theme .skn-han-block,
      body.light-theme .skn-lib-box,
      body.light-theme .skn-prov-region,
      body.light-theme .skn-bridge-arrow {
        color: #334155;
      }

      body.light-theme .skn-thesis-quote,
      body.light-theme .skn-kpi-card,
      body.light-theme .skn-summary-bar {
        background: rgba(241, 245, 249, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      body.light-theme .skn-bridge-item,
      body.light-theme .skn-vakif-box {
        background: rgba(254, 243, 199, 0.65);
        border-color: rgba(217, 119, 6, 0.28);
        color: #1e293b;
      }

      body.light-theme .skn-bridge-top,
      body.light-theme .skn-count-pill,
      body.light-theme .skn-han-link-pill {
        color: #92400e;
      }

      body.light-theme .skn-count-pill,
      body.light-theme .skn-han-link-pill {
        background: rgba(254, 243, 199, 0.85);
        border-color: rgba(217, 119, 6, 0.32);
      }

      /* Menzil Distance Calculator & Silk Road Route CTA */
      .skn-calc-panel {
        border-radius: 22px;
        padding: 20px 24px;
        background:
          radial-gradient(circle at 8% 12%, rgba(245, 158, 11, 0.14), transparent 45%),
          radial-gradient(circle at 92% 88%, rgba(16, 185, 129, 0.12), transparent 45%),
          var(--bg-card, rgba(30, 41, 59, 0.78));
        border: 1px solid rgba(245, 158, 11, 0.3);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .skn-calc-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
      }

      .skn-calc-swap {
        appearance: none;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 1px solid rgba(245, 158, 11, 0.4);
        background: rgba(245, 158, 11, 0.14);
        color: #fde68a;
        font-size: 1rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .skn-calc-swap:hover {
        background: rgba(245, 158, 11, 0.28);
        transform: rotate(180deg);
      }

      .skn-calc-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
        gap: 10px;
      }

      .skn-calc-card {
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .skn-calc-card.accent {
        border-color: rgba(245, 158, 11, 0.38);
        background: rgba(245, 158, 11, 0.1);
      }

      .skn-calc-card.cyan {
        border-color: rgba(0, 242, 254, 0.34);
        background: rgba(0, 242, 254, 0.08);
      }

      .skn-calc-lbl {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary, #94a3b8);
        font-weight: 700;
      }

      .skn-calc-val {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.18rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .skn-calc-sub {
        font-size: 0.75rem;
        color: var(--text-secondary, #cbd5e1);
      }

      .skn-route-cta {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 9px 16px;
        border-radius: 999px;
        border: 1px solid rgba(16, 185, 129, 0.48);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.24), rgba(16, 185, 129, 0.24));
        color: #ffffff;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.84rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .skn-route-cta:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(16, 185, 129, 0.24);
        filter: brightness(1.08);
      }

      body.light-theme .skn-calc-panel {
        background: rgba(255, 255, 255, 0.94);
        border-color: rgba(217, 119, 6, 0.28);
      }

      body.light-theme .skn-calc-card {
        background: rgba(241, 245, 249, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .skn-calc-card.accent {
        background: rgba(254, 243, 199, 0.72);
        border-color: rgba(217, 119, 6, 0.34);
      }

      body.light-theme .skn-calc-card.cyan {
        background: rgba(224, 242, 254, 0.78);
        border-color: rgba(2, 132, 199, 0.32);
      }

      body.light-theme .skn-calc-val {
        color: #0f172a;
      }

      body.light-theme .skn-calc-lbl,
      body.light-theme .skn-calc-sub {
        color: #334155;
      }

      body.light-theme .skn-calc-swap {
        background: rgba(254, 243, 199, 0.9);
        color: #92400e;
        border-color: rgba(217, 119, 6, 0.4);
      }

      body.light-theme .skn-route-cta {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.18), rgba(5, 150, 105, 0.18));
        border-color: rgba(5, 150, 105, 0.42);
        color: #0f172a;
      }

      body.light-theme .skn-section,
      body.light-theme .skn-ai-panel {
        background: rgba(255, 255, 255, 0.94);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .skn-ai-output {
        background: rgba(248, 250, 252, 0.96);
        border-color: rgba(2, 132, 199, 0.25);
      }

      body.light-theme .skn-ai-output-head,
      body.light-theme .skn-ai-matches,
      body.light-theme .skn-card-actions {
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .skn-ai-source {
        color: #0284c7;
      }

      body.light-theme .skn-ai-md {
        color: #0f172a;
      }

      body.light-theme .skn-ai-md .seyyah-md-h1,
      body.light-theme .skn-ai-md .seyyah-md-h2,
      body.light-theme .skn-ai-md .seyyah-md-h3,
      body.light-theme .skn-ai-md .seyyah-md-h4 {
        color: #b45309;
      }

      body.light-theme .skn-ai-md .seyyah-md-quote {
        background: rgba(241, 245, 249, 0.9);
      }

      body.light-theme .skn-select,
      body.light-theme .skn-search-input,
      body.light-theme .skn-filter-btn {
        background: rgba(241, 245, 249, 0.95);
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      body.light-theme .skn-filter-btn.active {
        background: rgba(254, 243, 199, 0.95);
        border-color: #d97706;
        color: #92400e;
      }

      body.light-theme .skn-filter-btn.cyan.active {
        background: rgba(224, 242, 254, 0.95);
        border-color: #0284c7;
        color: #075985;
      }

      body.light-theme .skn-ai-btn {
        background: linear-gradient(135deg, #d97706, #0284c7);
        border-color: #0284c7;
        color: #ffffff;
      }

      body.light-theme .skn-han-card,
      body.light-theme .skn-prov-card {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .skn-meta-chip,
      body.light-theme .skn-landmark-chip {
        background: rgba(15, 23, 42, 0.05);
        border-color: rgba(15, 23, 42, 0.11);
        color: #334155;
      }

      body.light-theme .skn-han-block strong,
      body.light-theme .skn-lib-box strong,
      body.light-theme .skn-prov-name,
      body.light-theme .skn-kpi-value {
        color: #0f172a;
      }

      body.light-theme .skn-plate {
        background: rgba(2, 132, 199, 0.12);
        border-color: rgba(2, 132, 199, 0.3);
        color: #0369a1;
      }

      body.light-theme .skn-gsb-box {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(5, 150, 105, 0.28);
        color: #065f46;
      }

      body.light-theme .skn-btn-primary {
        background: rgba(2, 132, 199, 0.12);
        border-color: rgba(2, 132, 199, 0.35);
        color: #0369a1;
      }

      body.light-theme .skn-btn-primary:hover {
        background: rgba(2, 132, 199, 0.2);
      }

      body.light-theme .skn-btn-ghost {
        background: rgba(217, 119, 6, 0.12);
        border-color: rgba(217, 119, 6, 0.35);
        color: #92400e;
      }

      body.light-theme .skn-ai-match-chip {
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.3);
        color: #0f172a;
      }

      body.light-theme .skn-status-badge.visited {
        background: rgba(16, 185, 129, 0.18);
        color: #065f46;
        border-color: rgba(5, 150, 105, 0.4);
      }

      body.light-theme .skn-prov-card .skn-status-badge {
        background: rgba(15, 23, 42, 0.06);
        color: #475569;
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .skn-prov-card .skn-status-badge.visited {
        background: rgba(16, 185, 129, 0.16);
        color: #065f46;
        border-color: rgba(5, 150, 105, 0.35);
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Offline Fallback Essay Generator
  // ---------------------------------------------------------------------------
  function generateOfflineEssay(focusId, provincesMap, visitedList) {
    const totalCount = Object.keys(provincesMap).length || 81;
    const savedTotal = visitedList.length * FIVE_DAY_SAVING_TL;

    if (focusId && focusId.indexOf('prov:') === 0) {
      const pKey = focusId.slice(5);
      const prov = provincesMap[pKey];
      if (prov) {
        const lib = prov.custom_library || prov.library || `${prov.name} İl Halk Kütüphanesi`;
        const landmarks = Array.isArray(prov.landmarks) && prov.landmarks.length
          ? prov.landmarks.slice(0, 4).join(', ')
          : 'şehir merkezi ve tarihi çarşılar';
        const linkedHans = HAN_BY_PROVINCE.get(pKey) || [];
        const hanNote = linkedHans.length
          ? `Bu ilde yer alan **${linkedHans.map(function (h) { return h.name; }).join(' ve ')}**, İpek Yolu’nun kadim taş hafızasını bugüne taşır.`
          : `${prov.name}, Anadolu’nun birbirine kırk kilometrelik menzillerle eklemlenen büyük seyahat ağının (${prov.region}) önemli bir durağıdır.`;

        return [
          `## 🏰 ${prov.name} Menzil Hikayesi & Modern Kervansaray Rotası`,
          `> "3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit" — Vakıf medeniyeti, 21. yüzyılda **GSB Seyahatsever 5 Gün Kuralı** ile yeniden nefes alıyor.`,
          '',
          `### 1. İpek Yolu Hafızası & Şehir Ruhu`,
          `${hanNote} Seyyah bu şehre adım attığında yalnızca durakları gezmez; aynı zamanda bin yıllık Anadolu menzil nizamının içine girer.`,
          '',
          `### 2. GSB Seyahatsever & İl Halk Kütüphanesi Dengesi`,
          `- **Konaklama Menzili:** GSB KYK yurdunda 5 günlük ücretsiz konaklama ile **5 gece × 2.200 ₺ = 11.000 ₺** tasarruf sağlanır.`,
          `- **İlim Ofisi:** Gündüz mesaisi için **${lib}** sakin bir tefekkür ve çalışma masası sunar.`,
          `- **Keşif Halkaları:** Mesai sonrası **${landmarks}** durakları yürüyerek gezilebilir.`,
          '',
          `### 3. Seyyahın Durumu`,
          prov.visited
            ? `✅ **${prov.name}** menzili gezilmiş iller defterine mühürlenmiş (${visitedList.length}/${totalCount} il · toplam ${formatTL(savedTotal)} ₺ GSB tasarrufu).`
            : `🗺️ **${prov.name}** henüz gidilmeyi bekleyen bir menzil! 5 Gün Kuralı ile sıradaki rotaya eklenebilir.`
        ].join('\n');
      }
    }

    const han = CARAVANSERAIS.find(function (h) { return h.id === focusId; });
    if (han) {
      const prov = provincesMap[han.provinceKey];
      const lib = (prov && (prov.custom_library || prov.library)) || `${han.provinceName} İl Halk Kütüphanesi`;
      return [
        `## 🏰 ${han.name} (${han.year}) — Taşın & Misafirperverliğin Hikayesi`,
        `> "${han.vakifPhilosophy}"`,
        '',
        `### 1. İpek Yolu Üzerindeki Konum & Mimari`,
        `**${han.patron}** tarafından **${han.corridor}** üzerinde inşa ettirilen bu abidevî yapı (${han.architect}), Selçuklu/Osmanlı kervansaray ağının kilit menzillerindendir.`,
        `- **Mimari İmza:** ${han.architecture}`,
        '',
        `### 2. Dünün Sultan Hanından Bugünün GSB Menziline`,
        `- **Tarihi Vakıf Kuralı:** 3 gün ücretsiz aş, yatak, darüşşifa, kütüphane ve mescit hizmeti.`,
        `- **Modern GSB Kuralı:** **${han.provinceName}** GSB Seyahatsever yurtlarında **5 gece × 2.200 ₺ = 11.000 ₺** konaklama tasarrufu.`,
        `- **Kütüphane Ofisi:** ${lib}`,
        '',
        `### 3. Önerilen Sefer Ritmi`,
        `${han.modernBridge} Sabahları İl Halk Kütüphanesi’nde derin çalışma, ikindi vakti kervansaray avlusunda tarih tefekkürü ve akşam sade bir esnaf sofrası bu menzilin ruhunu tamamlar.`
      ].join('\n');
    }

    const nextTargets = Object.entries(provincesMap)
      .filter(function (entry) {
        return entry[1] && !entry[1].visited && HAN_BY_PROVINCE.has(entry[0]);
      })
      .slice(0, 4)
      .map(function (entry) {
        const hans = HAN_BY_PROVINCE.get(entry[0]).map(function (h) { return h.name; }).join(', ');
        return `- **${entry[1].name}** (${hans}) — 11.000 ₺ GSB tasarrufu`;
      });

    return [
      `## 🧭 İpek Yolu Sultan Hanlarından 81 İl GSB Menzillerine`,
      `> "${VAKIF_PILLAR_QUOTE}"`,
      '',
      `### 1. Kervansaray Medeniyetinin Sırrı: 40 Kilometrede Bir Merhamet`,
      `Anadolu Selçukluları kervanların bir günde yürüyebileceği ortalama **30–40 km** mesafelere Sultan Hanları ve ribatlar kurdu. Bu yapılarda zengin-fakir, yerli-yabancı ayrımı olmaksızın **3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane ve mescit** hizmeti verilir, tüccarın malı devlet güvencesiyle korunurdu.`,
      '',
      `### 2. XXI. Yüzyılın Dijital Seyyahı: GSB Seyahatsever + İl Halk Kütüphanesi`,
      `- **Modern Barınak:** GSB yurtlarında uygulanan **5 Gün Kuralı**, il başına **5 gece × 2.200 ₺ = 11.000 ₺** konaklama tasarrufu sağlar.`,
      `- **Mevcut İlerleme:** Şu ana kadar **${visitedList.length}/${totalCount}** il gezildi (**${formatTL(savedTotal)} ₺** konaklama tasarrufu eşdeğeri).`,
      `- **İlim & Mesai:** Her şehirde İl Halk Kütüphanesi ücretsiz çalışma ofisi, tarihi han avluları ise nefes alma durağıdır.`,
      '',
      `### 3. Önerilen Sıradaki Tarihi Kervansaray Menzilleri`,
      nextTargets.length
        ? nextTargets.join('\n')
        : '- Tüm tarihi Sultan Hanı illeri tamamlanmış! Tebrikler seyyah; şimdi 81 ilin tamamında GSB + Kütüphane zincirini genişletebilirsiniz.'
    ].join('\n');
  }

  // ---------------------------------------------------------------------------
  // Render Entry Point: window.SEYYAH_MODULES.caravanserai.render(container, ctx)
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const safeCtx = ctx || {};
    const esc = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const normFn = typeof safeCtx.normalizeTurkish === 'function' ? safeCtx.normalizeTurkish : fallbackNormalizeTurkish;
    const provincesMap = resolveProvincesMap(safeCtx);

    const allProvinceEntries = Object.entries(provincesMap)
      .filter(function (entry) { return entry[1] && entry[1].name; })
      .sort(function (a, b) {
        return Number(a[1].plate || 999) - Number(b[1].plate || 999);
      });

    const totalProvinces = allProvinceEntries.length || 81;
    const visitedEntries = allProvinceEntries.filter(function (entry) { return Boolean(entry[1].visited); });
    const visitedCount = visitedEntries.length;
    const realizedSavingTL = visitedCount * FIVE_DAY_SAVING_TL;
    const potentialTotalTL = totalProvinces * FIVE_DAY_SAVING_TL;

    // Count how many historical caravanserais belong to visited provinces
    const visitedHanCount = CARAVANSERAIS.filter(function (han) {
      const p = provincesMap[han.provinceKey];
      return Boolean(p && p.visited);
    }).length;

    const regions = [];
    allProvinceEntries.forEach(function (entry) {
      const r = entry[1].region;
      if (r && regions.indexOf(r) === -1) regions.push(r);
    });

    function getFilteredHans() {
      return CARAVANSERAIS.filter(function (han) {
        if (uiState.eraFilter !== 'all' && han.eraGroup !== uiState.eraFilter) return false;
        if (uiState.corridorFilter !== 'all' && han.corridorGroup !== uiState.corridorFilter) return false;
        return true;
      });
    }

    function getFilteredProvinces() {
      const q = normFn(uiState.searchQuery);
      return allProvinceEntries.filter(function (entry) {
        const key = entry[0];
        const p = entry[1];
        if (uiState.regionFilter !== 'all' && p.region !== uiState.regionFilter) return false;
        if (uiState.visitedFilter === 'visited' && !p.visited) return false;
        if (uiState.visitedFilter === 'unvisited' && p.visited) return false;
        if (uiState.visitedFilter === 'han-only' && !HAN_BY_PROVINCE.has(key)) return false;

        if (q) {
          const libText = p.custom_library || p.library || '';
          const landmarksText = Array.isArray(p.landmarks) ? p.landmarks.join(' ') : '';
          const hansText = (HAN_BY_PROVINCE.get(key) || []).map(function (h) { return h.name; }).join(' ');
          const haystack = normFn(
            `${formatPlate(p.plate)} ${p.name} ${p.region || ''} ${libText} ${landmarksText} ${hansText}`
          );
          if (haystack.indexOf(q) === -1) return false;
        }
        return true;
      });
    }

    function buildMenzilCalcResultHtml() {
      const fromHan = CARAVANSERAIS.find(function (h) { return h.id === uiState.calcFromId; }) || CARAVANSERAIS[3];
      const toHan = CARAVANSERAIS.find(function (h) { return h.id === uiState.calcToId; }) || CARAVANSERAIS[2];
      const same = fromHan.id === toHan.id;
      const roadKm = same ? 0 : Math.max(25, calcRoadDistanceKm(getHanCoords(fromHan, provincesMap), getHanCoords(toHan, provincesMap)));
      const menzilExact = roadKm / 35;
      const caravanDays = same ? 0 : Math.max(1, Math.ceil(menzilExact));
      const drivingTotalMins = same ? 0 : Math.round((roadKm / 85) * 60);
      const driveH = Math.floor(drivingTotalMins / 60);
      const driveM = drivingTotalMins % 60;
      const driveText = same ? '0 dk' : (driveH > 0 ? `${driveH} sa ${driveM} dk` : `${driveM} dk`);
      const caravanHours = caravanDays * 9; // ~9 saatlik günlük kervan yürüyüşü
      const speedRatio = drivingTotalMins > 0 ? Math.max(1, Math.round((caravanHours * 60) / drivingTotalMins)) : 1;

      return `
        <div class="skn-calc-metrics">
          <div class="skn-calc-card">
            <span class="skn-calc-lbl">🛣️ Tahmini İpek Yolu Mesafesi</span>
            <span class="skn-calc-val">${formatTL(roadKm)} km</span>
            <span class="skn-calc-sub">${esc(fromHan.provinceName)} → ${esc(toHan.provinceName)}</span>
          </div>
          <div class="skn-calc-card accent">
            <span class="skn-calc-lbl">🐪 Kervan Menzili (~35 km / gün)</span>
            <span class="skn-calc-val">${same ? 'Aynı Menzil' : `${caravanDays} Gün (${menzilExact.toFixed(1)} menzil)`}</span>
            <span class="skn-calc-sub">${same ? 'Başlangıç ve bitiş için farklı han seçin' : `~${caravanDays > 1 ? caravanDays - 1 : 0} ara kervansaray konaklaması`}</span>
          </div>
          <div class="skn-calc-card cyan">
            <span class="skn-calc-lbl">🚗 Modern Karayolu (~85 km/sa)</span>
            <span class="skn-calc-val">${esc(driveText)}</span>
            <span class="skn-calc-sub">${same ? 'Sürüş gerekmiyor' : `Geleneksel kervana göre ~${speedRatio}× daha hızlı`}</span>
          </div>
          <div class="skn-calc-card">
            <span class="skn-calc-lbl">🏕️ İki Uçta GSB 5 Gün Tasarrufu</span>
            <span class="skn-calc-val">${fromHan.provinceKey === toHan.provinceKey ? formatTL(FIVE_DAY_SAVING_TL) : formatTL(FIVE_DAY_SAVING_TL * 2)} ₺</span>
            <span class="skn-calc-sub">${fromHan.provinceKey === toHan.provinceKey ? '1 il × 5 gece GSB menzili' : '2 il × 5 gece GSB menzili'}</span>
          </div>
        </div>
      `;
    }

    function buildHanCardsHtml(hans) {
      if (!hans.length) {
        return '<div class="skn-empty">Seçili dönem veya İpek Yolu koridoru için eşleşen tarihi kervansaray bulunamadı.</div>';
      }
      return hans.map(function (han) {
        const p = provincesMap[han.provinceKey] || {};
        const bannerSrc = resolveBannerPath(p);
        const isVisited = Boolean(p.visited);
        const plateText = p.plate ? formatPlate(p.plate) : '--';
        return `
          <article class="skn-han-card">
            <div class="skn-han-banner">
              <img src="${esc(bannerSrc)}" alt="${esc(han.name)}" loading="lazy" />
              <div class="skn-banner-scrim"></div>
              <div class="skn-banner-top">
                <span class="skn-era-badge">${esc(han.era)} · ${esc(han.year)}</span>
                <span class="skn-status-badge ${isVisited ? 'visited' : ''}">
                  ${isVisited ? '✅ Menzil Gezildi' : '🧭 Keşif Bekliyor'}
                </span>
              </div>
              <div class="skn-banner-bottom">
                <div class="skn-han-title">${esc(han.name)}</div>
                <div class="skn-han-loc">📍 ${esc(han.provinceName)} / ${esc(han.district)} · Plaka ${esc(plateText)}</div>
              </div>
            </div>
            <div class="skn-han-body">
              <div class="skn-han-meta-row">
                <span class="skn-meta-chip">👑 Bâni: ${esc(han.patron)}</span>
                <span class="skn-meta-chip">🛣️ ${esc(han.corridor)}</span>
              </div>
              <div class="skn-han-block">
                <strong>🏛️ Mimari Kimlik:</strong> ${esc(han.architecture)}
              </div>
              <div class="skn-vakif-box">
                <strong>🕌 Vakıf Felsefesi:</strong> ${esc(han.vakifPhilosophy)}
              </div>
              <div class="skn-han-block">
                <strong>🎒 Modern GSB Köprüsü:</strong> ${esc(han.modernBridge)}
              </div>
              <div class="skn-card-actions">
                <button type="button" class="skn-btn-primary" data-skn-goto="${esc(han.provinceKey)}">
                  📍 Menzile Git
                </button>
                <button type="button" class="skn-btn-ghost" data-skn-ai-han="${esc(han.id)}">
                  ✨ Hikaye & Rota
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }

    function buildProvinceCardsHtml(filteredProvs) {
      if (!filteredProvs.length) {
        return '<div class="skn-empty">Arama veya bölge filtresine uyan il bulunamadı.</div>';
      }
      return filteredProvs.map(function (entry) {
        const key = entry[0];
        const p = entry[1];
        const isVisited = Boolean(p.visited);
        const libText = p.custom_library || p.library || `${p.name} İl Halk Kütüphanesi`;
        const landmarks = Array.isArray(p.landmarks) ? p.landmarks.slice(0, 4) : [];
        const linkedHans = HAN_BY_PROVINCE.get(key) || [];
        const hanNames = linkedHans.map(function (h) { return h.name; }).join(' • ');

        return `
          <article class="skn-prov-card">
            <div class="skn-prov-head">
              <div class="skn-prov-title-wrap">
                <span class="skn-plate">${esc(formatPlate(p.plate))}</span>
                <div>
                  <div class="skn-prov-name">${esc(p.name)}</div>
                  <div class="skn-prov-region">${esc(p.region || '')}</div>
                </div>
              </div>
              <span class="skn-status-badge ${isVisited ? 'visited' : ''}">
                ${isVisited ? '✅ Gezildi' : '🗺️ Hedef'}
              </span>
            </div>
            ${linkedHans.length ? `<div class="skn-han-link-pill">🏰 Tarihi Han: ${esc(hanNames)}</div>` : ''}
            <div class="skn-gsb-box">
              <strong>🏕️ Modern Kervansaray (GSB Seyahatsever):</strong><br />
              5 Gün Kuralı · <strong>5 gece × ${formatTL(NIGHTLY_RATE_TL)} ₺ = ${formatTL(FIVE_DAY_SAVING_TL)} ₺ tasarruf</strong>
              (${isVisited ? 'Gerçekleşen menzil' : 'Planlanan menzil'})
            </div>
            <div class="skn-lib-box">
              <strong>📚 İl Halk Kütüphanesi Ofisi:</strong> ${esc(libText)}
            </div>
            ${landmarks.length ? `
              <div class="skn-landmarks-row">
                ${landmarks.map(function (lm) {
                  return `<span class="skn-landmark-chip">✦ ${esc(lm)}</span>`;
                }).join('')}
              </div>
            ` : ''}
            <div class="skn-card-actions">
              <button type="button" class="skn-btn-primary" data-skn-goto="${esc(key)}">
                📍 Menzile Git
              </button>
              <button type="button" class="skn-btn-ghost" data-skn-ai-prov="${esc(key)}">
                ✨ AI Rota
              </button>
            </div>
          </article>
        `;
      }).join('');
    }

    function buildAiOutputHtml() {
      if (uiState.aiStatus === 'idle' && !uiState.aiText) return '';
      const isStreaming = uiState.aiStatus === 'streaming';
      const hasAiKey = Boolean(window.SEYYAH_AI && typeof window.SEYYAH_AI.hasKey === 'function' && window.SEYYAH_AI.hasKey());
      const sourceLabel = uiState.aiSource || (isStreaming
        ? (hasAiKey ? '⚡ Gemini AI Kervansaray Hikayesi Yazılıyor...' : '📜 Çevrimdışı Arşiv Hazırlanıyor...')
        : '📜 Kervansaray & Menzil Yorumu');

      let matchedProvs = [];
      if (!isStreaming && uiState.aiText && window.SEYYAH_AI && typeof window.SEYYAH_AI.extractProvinceMatches === 'function') {
        matchedProvs = window.SEYYAH_AI.extractProvinceMatches(uiState.aiText, safeCtx, 6) || [];
      }

      return `
        <div class="skn-ai-output" id="skn-ai-output">
          <div class="skn-ai-output-head">
            <span class="skn-ai-source">
              <span class="skn-ai-dot ${isStreaming ? 'streaming' : ''}"></span>
              <span>${esc(sourceLabel)}</span>
            </span>
            ${uiState.aiError ? `<span style="font-size:0.74rem;color:var(--skn-amber);">⚠️ ${esc(uiState.aiError)}</span>` : ''}
          </div>
          <div class="skn-ai-md" id="skn-ai-md-body">
            ${uiState.aiText
              ? renderMdSafe(uiState.aiText, esc)
              : '<p class="seyyah-md-p">İpek Yolu menzil hikayesi hazırlanıyor...</p>'}
          </div>
          ${matchedProvs.length ? `
            <div class="skn-ai-matches">
              <span style="font-size:0.74rem;font-weight:700;color:var(--text-secondary);">Yorumda Geçen Menziller:</span>
              ${matchedProvs.map(function (mp) {
                return `<button type="button" class="skn-ai-match-chip" data-skn-goto="${esc(mp.key)}">📍 ${esc(mp.name)}</button>`;
              }).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    function paint() {
      const filteredHans = getFilteredHans();
      const filteredProvs = getFilteredProvinces();
      const filteredVisitedCount = filteredProvs.filter(function (e) { return Boolean(e[1].visited); }).length;

      const aiOptionsHtml = [
        `<option value="general" ${uiState.aiFocusId === 'general' ? 'selected' : ''}>🧭 Genel İpek Yolu & 81 İl GSB Sentezi</option>`,
        '<optgroup label="🏰 Tarihi Sultan Hanları & Kervansaraylar">',
        CARAVANSERAIS.map(function (h) {
          return `<option value="${esc(h.id)}" ${uiState.aiFocusId === h.id ? 'selected' : ''}>${esc(h.name)} (${esc(h.provinceName)})</option>`;
        }).join(''),
        '</optgroup>',
        '<optgroup label="🏕️ 81 İl Modern GSB Menzilleri">',
        allProvinceEntries.map(function (entry) {
          const val = 'prov:' + entry[0];
          return `<option value="${esc(val)}" ${uiState.aiFocusId === val ? 'selected' : ''}>${esc(formatPlate(entry[1].plate))} · ${esc(entry[1].name)}</option>`;
        }).join(''),
        '</optgroup>'
      ].join('');

      container.innerHTML = `
        <div class="skn-root" id="skn-root">
          <!-- Hero & Civilization Bridge -->
          <section class="skn-hero">
            <div class="skn-hero-eyebrow">🏰 İPEK YOLU RİBATLARI &amp; XXI. YÜZYIL SEYYAH AĞI</div>
            <h2 class="skn-title">🏰 Anadolu Kervansarayları, İpek Yolu &amp; Modern GSB Menzil Atlası</h2>
            <p class="skn-subtitle">
              XIII. yüzyıl Anadolu Selçuklu, Saltuklu ve Osmanlı kervansaraylarının 40 kilometrede bir kurduğu
              dayanışma ağını; günümüzün <strong>GSB Seyahatsever KYK yurtları (5 Gün Kuralı)</strong> ve
              <strong>81 İl Halk Kütüphanesi çalışma ofisleri</strong> ile buluşturan canlı menzil rehberi.
            </p>
            <div class="skn-thesis-quote">
              “${esc(VAKIF_PILLAR_QUOTE)}”
            </div>

            <div class="skn-kpi-grid">
              <div class="skn-kpi-card">
                <span class="skn-kpi-label">Tarihi Kervansaray &amp; Sultan Hanı</span>
                <span class="skn-kpi-value">${CARAVANSERAIS.length} Anıtsal Menzil</span>
                <span class="skn-kpi-sub">${visitedHanCount}/${CARAVANSERAIS.length} han ili gezildi</span>
              </div>
              <div class="skn-kpi-card">
                <span class="skn-kpi-label">81 İl Modern GSB Menzili</span>
                <span class="skn-kpi-value">${visitedCount} / ${totalProvinces} İl</span>
                <span class="skn-kpi-sub">İl Halk Kütüphanesi + KYK Yurdu eşleşmesi</span>
              </div>
              <div class="skn-kpi-card">
                <span class="skn-kpi-label">Gerçekleşen GSB Tasarrufu</span>
                <span class="skn-kpi-value">${formatTL(realizedSavingTL)} ₺</span>
                <span class="skn-kpi-sub">${visitedCount} il × 5 gece × ${formatTL(NIGHTLY_RATE_TL)} ₺</span>
              </div>
              <div class="skn-kpi-card">
                <span class="skn-kpi-label">81 İl Tam Menzil Tasarrufu</span>
                <span class="skn-kpi-value">${formatTL(potentialTotalTL)} ₺</span>
                <span class="skn-kpi-sub">İl başına 5 gece = ${formatTL(FIVE_DAY_SAVING_TL)} ₺</span>
              </div>
            </div>

            <div class="skn-bridge-grid">
              <div class="skn-bridge-item">
                <span class="skn-bridge-top">🛏️ 3 Gün Vakıf Misafirperverliği</span>
                <span class="skn-bridge-arrow">↔ Modern GSB Seyahatsever: Her ilde 5 gün ücretsiz konaklama (11.000 ₺ tasarruf)</span>
              </div>
              <div class="skn-bridge-item">
                <span class="skn-bridge-top">📚 Kervansaray Kütüphanesi &amp; Sohbet</span>
                <span class="skn-bridge-arrow">↔ 81 İl Halk Kütüphanesi: Seyyahın ücretsiz derin çalışma ve üretim ofisi</span>
              </div>
              <div class="skn-bridge-item">
                <span class="skn-bridge-top">🏥 Darüşşifa, Hamam &amp; İaşe</span>
                <span class="skn-bridge-arrow">↔ Sade Sefer Ritmi: Tek sırt çantası, dengeli yürüyüş ve yerel esnaf sofrası</span>
              </div>
              <div class="skn-bridge-item">
                <span class="skn-bridge-top">🕌 Köşk Mescit &amp; 40 km Menzil</span>
                <span class="skn-bridge-arrow">↔ Manevî &amp; Coğrafi Bağ: Doğudan batıya kesintisiz Anadolu tefekkür rotası</span>
              </div>
            </div>
          </section>

          <!-- Gemini AI Caravanserai Storyteller -->
          <section class="skn-ai-panel" id="skn-ai-panel">
            <div class="skn-section-head">
              <div>
                <h3 class="skn-section-title">✨ Kervansaray &amp; İpek Yolu Yapay Zekâ Anlatıcısı</h3>
                <p class="skn-section-desc">
                  Seçtiğiniz tarihi Sultan Hanı veya modern GSB şehri için mimari hikaye, vakıf felsefesi ve
                  5 Gün Kuralı + İl Halk Kütüphanesi rota yorumu üretin.
                </p>
              </div>
            </div>
            <div class="skn-ai-controls">
              <div class="skn-ai-select-wrap">
                <select class="skn-select" id="skn-ai-focus" aria-label="AI Yorum Odağı">
                  ${aiOptionsHtml}
                </select>
                <button
                  type="button"
                  class="skn-ai-btn"
                  id="skn-ai-trigger"
                  ${uiState.aiStatus === 'streaming' ? 'disabled' : ''}
                >
                  ${uiState.aiStatus === 'streaming'
                    ? '⏳ Hikaye &amp; Rota Hazırlanıyor...'
                    : '✨ Gemini AI ile Kervansaray Hikayesi &amp; Rota Yorumu'}
                </button>
              </div>
            </div>
            ${buildAiOutputHtml()}
          </section>

          <!-- Menzil Distance Calculator & Silk Road Route Loader -->
          <section class="skn-calc-panel" id="skn-calc-panel" aria-label="Tarihi Sultan Hanları Menzil Mesafe Hesaplayıcı">
            <div class="skn-section-head" style="margin-bottom:0;">
              <div>
                <h3 class="skn-section-title">🐪 Tarihi Sultan Hanları Menzil Mesafe Hesaplayıcı</h3>
                <p class="skn-section-desc">
                  XIII. yüzyıl kervanlarının günde ortalama <strong>~35 km (1 menzil)</strong> yürüdüğü İpek Yolu etaplarını modern karayolu sürüş saatleriyle karşılaştırın.
                </p>
              </div>
              <button type="button" class="skn-route-cta" id="skn-load-silkroad-btn">
                🧭 Selçuklu Kervansaray Rotasını Yükle
              </button>
            </div>

            <div class="skn-calc-controls">
              <select class="skn-select" id="skn-calc-from" aria-label="Başlangıç Sultan Hanı">
                ${CARAVANSERAIS.map(function (h) {
                  return `<option value="${esc(h.id)}" ${uiState.calcFromId === h.id ? 'selected' : ''}>🚩 ${esc(h.name)} (${esc(h.provinceName)})</option>`;
                }).join('')}
              </select>
              <button type="button" class="skn-calc-swap" id="skn-calc-swap" title="Başlangıç ve varış hanlarını değiştir" aria-label="Hanları değiştir">⇄</button>
              <select class="skn-select" id="skn-calc-to" aria-label="Varış Sultan Hanı">
                ${CARAVANSERAIS.map(function (h) {
                  return `<option value="${esc(h.id)}" ${uiState.calcToId === h.id ? 'selected' : ''}>🏁 ${esc(h.name)} (${esc(h.provinceName)})</option>`;
                }).join('')}
              </select>
            </div>

            <div id="skn-calc-output">
              ${buildMenzilCalcResultHtml()}
            </div>
          </section>

          <!-- Section 1: Historical Sultan Hans & Caravanserais -->
          <section class="skn-section">
            <div class="skn-section-head">
              <div>
                <h3 class="skn-section-title">🏰 Bölüm 1: 12 Tarihi Sultan Hanı &amp; Kervansaray Rehberi</h3>
                <p class="skn-section-desc">
                  Aksaray Sultanhanı ve Ağzıkara Han’dan Kayseri Karatay’a, Konya Zazadin &amp; Obruk’tan Antalya Alara &amp; Evdir’e,
                  Sivas Çiftlik, Malatya Silahtar Mustafa Paşa, Erzincan Mama Hatun, Edirne Rüstem Paşa, Bursa Koza Han ve
                  İzmir Kızlarağası Hanı’na uzanan <strong>${CARAVANSERAIS.length} tarihi İpek Yolu durağı</strong>.
                </p>
              </div>
              <span class="skn-count-pill" id="skn-han-count">${filteredHans.length} / ${CARAVANSERAIS.length} Tarihi Han</span>
            </div>

            <div class="skn-toolbar">
              <div class="skn-filter-group" role="group" aria-label="Dönem Filtresi">
                <button type="button" class="skn-filter-btn ${uiState.eraFilter === 'all' ? 'active' : ''}" data-skn-era="all">Tümü</button>
                <button type="button" class="skn-filter-btn ${uiState.eraFilter === 'selcuklu' ? 'active' : ''}" data-skn-era="selcuklu">Anadolu Selçuklu</button>
                <button type="button" class="skn-filter-btn ${uiState.eraFilter === 'beylikler' ? 'active' : ''}" data-skn-era="beylikler">Saltuklu / Beylikler</button>
                <button type="button" class="skn-filter-btn ${uiState.eraFilter === 'osmanli' ? 'active' : ''}" data-skn-era="osmanli">Osmanlı</button>
              </div>
              <div class="skn-filter-group" role="group" aria-label="İpek Yolu Kolu Filtresi">
                <button type="button" class="skn-filter-btn cyan ${uiState.corridorFilter === 'all' ? 'active' : ''}" data-skn-corridor="all">Tüm Kollar</button>
                <button type="button" class="skn-filter-btn cyan ${uiState.corridorFilter === 'orta-anadolu' ? 'active' : ''}" data-skn-corridor="orta-anadolu">Orta Anadolu Hattı</button>
                <button type="button" class="skn-filter-btn cyan ${uiState.corridorFilter === 'akdeniz' ? 'active' : ''}" data-skn-corridor="akdeniz">Akdeniz Hattı</button>
                <button type="button" class="skn-filter-btn cyan ${uiState.corridorFilter === 'dogu-anadolu' ? 'active' : ''}" data-skn-corridor="dogu-anadolu">Doğu İpek Yolu</button>
                <button type="button" class="skn-filter-btn cyan ${uiState.corridorFilter === 'bati-rumeli' ? 'active' : ''}" data-skn-corridor="bati-rumeli">Batı &amp; Rumeli</button>
              </div>
            </div>

            <div class="skn-han-grid" id="skn-han-grid">
              ${buildHanCardsHtml(filteredHans)}
            </div>
          </section>

          <!-- Section 2: 81 Provinces Modern GSB & Public Library Matcher -->
          <section class="skn-section">
            <div class="skn-section-head">
              <div>
                <h3 class="skn-section-title">🏕️ Bölüm 2: 81 İl Modern Kervansaray (GSB Seyahatsever) &amp; İl Halk Kütüphanesi Eşleştirici</h3>
                <p class="skn-section-desc">
                  81 ilin tamamını bölge, ziyaret durumu veya tarihi han bağına göre filtreleyin; her ilin İl Halk Kütüphanesi
                  ofis notunu, <strong>5 Gün Kuralı (5 gece × 2.200 ₺ = 11.000 ₺ tasarruf)</strong> hesabını ve öne çıkan duraklarını inceleyin.
                </p>
              </div>
              <span class="skn-count-pill" id="skn-prov-count">${filteredProvs.length} / ${totalProvinces} İl</span>
            </div>

            <div class="skn-toolbar">
              <input
                type="search"
                class="skn-search-input"
                id="skn-prov-search"
                placeholder="İl, plaka, kütüphane veya tarihi durak ara..."
                value="${esc(uiState.searchQuery)}"
                aria-label="81 İl Menzil Arama"
              />
              <div class="skn-filter-group" role="group" aria-label="Ziyaret Durumu">
                <button type="button" class="skn-filter-btn ${uiState.visitedFilter === 'all' ? 'active' : ''}" data-skn-vfilter="all">Tümü (${totalProvinces})</button>
                <button type="button" class="skn-filter-btn ${uiState.visitedFilter === 'visited' ? 'active' : ''}" data-skn-vfilter="visited">✅ Gezildi (${visitedCount})</button>
                <button type="button" class="skn-filter-btn ${uiState.visitedFilter === 'unvisited' ? 'active' : ''}" data-skn-vfilter="unvisited">🗺️ Hedef (${totalProvinces - visitedCount})</button>
                <button type="button" class="skn-filter-btn ${uiState.visitedFilter === 'han-only' ? 'active' : ''}" data-skn-vfilter="han-only">🏰 Tarihi Han İlleri (${HAN_BY_PROVINCE.size})</button>
              </div>
            </div>

            <div class="skn-toolbar" style="margin-top:-6px;">
              <div class="skn-filter-group" role="group" aria-label="Bölge Filtresi">
                <button type="button" class="skn-filter-btn cyan ${uiState.regionFilter === 'all' ? 'active' : ''}" data-skn-region="all">Tüm Bölgeler</button>
                ${regions.map(function (reg) {
                  return `<button type="button" class="skn-filter-btn cyan ${uiState.regionFilter === reg ? 'active' : ''}" data-skn-region="${esc(reg)}">${esc(reg)}</button>`;
                }).join('')}
              </div>
            </div>

            <div class="skn-summary-bar" id="skn-prov-summary">
              <span>Gösterilen: <strong>${filteredProvs.length}</strong> il (${filteredVisitedCount} gezildi)</span>
              <span>Bu görünümdeki 5 Gün Kuralı toplam potansiyeli: <strong>${formatTL(filteredProvs.length * FIVE_DAY_SAVING_TL)} ₺</strong></span>
            </div>

            <div class="skn-prov-grid" id="skn-prov-grid">
              ${buildProvinceCardsHtml(filteredProvs)}
            </div>
          </section>
        </div>
      `;

      bindEvents();
    }

    function updateProvinceListOnly() {
      const filteredProvs = getFilteredProvinces();
      const filteredVisitedCount = filteredProvs.filter(function (e) { return Boolean(e[1].visited); }).length;
      const grid = container.querySelector('#skn-prov-grid');
      const countEl = container.querySelector('#skn-prov-count');
      const summaryEl = container.querySelector('#skn-prov-summary');
      if (grid) grid.innerHTML = buildProvinceCardsHtml(filteredProvs);
      if (countEl) countEl.textContent = `${filteredProvs.length} / ${totalProvinces} İl`;
      if (summaryEl) {
        summaryEl.innerHTML = `
          <span>Gösterilen: <strong>${filteredProvs.length}</strong> il (${filteredVisitedCount} gezildi)</span>
          <span>Bu görünümdeki 5 Gün Kuralı toplam potansiyeli: <strong>${formatTL(filteredProvs.length * FIVE_DAY_SAVING_TL)} ₺</strong></span>
        `;
      }
    }

    function updateHanListOnly() {
      const filteredHans = getFilteredHans();
      const grid = container.querySelector('#skn-han-grid');
      const countEl = container.querySelector('#skn-han-count');
      if (grid) grid.innerHTML = buildHanCardsHtml(filteredHans);
      if (countEl) countEl.textContent = `${filteredHans.length} / ${CARAVANSERAIS.length} Tarihi Han`;
    }

    async function runAiInterpretation(customFocusId) {
      if (customFocusId) {
        uiState.aiFocusId = customFocusId;
      }
      if (uiState.aiStatus === 'streaming') return;

      const reqToken = ++uiState.aiRequestToken;
      uiState.aiStatus = 'streaming';
      uiState.aiError = '';
      uiState.aiText = '';
      uiState.aiSource = '';
      paint();

      const focusId = uiState.aiFocusId || 'general';
      const canUseLiveAi =
        window.SEYYAH_AI &&
        typeof window.SEYYAH_AI.stream === 'function' &&
        typeof window.SEYYAH_AI.hasKey === 'function' &&
        window.SEYYAH_AI.hasKey();

      if (!canUseLiveAi) {
        uiState.aiStatus = 'done';
        uiState.aiText = generateOfflineEssay(focusId, provincesMap, visitedEntries);
        uiState.aiSource = '📜 Çevrimdışı Kervansaray & Menzil Arşivi';
        paint();
        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast('📜 Kervansaray hikayesi çevrimdışı arşivden hazırlandı.');
        }
        return;
      }

      const anatoliaCtx = typeof window.SEYYAH_AI.buildAnatoliaContext === 'function'
        ? window.SEYYAH_AI.buildAnatoliaContext(safeCtx)
        : '';

      const systemPrompt = [
        'Sen Anadolu Selçuklu ve Osmanlı kervansaray mimarisini, İpek Yolu tarihini, vakıf medeniyetini ve modern "Dijital Seyyah" (GSB Seyahatsever 5 Gün Kuralı + 81 İl Halk Kütüphanesi) felsefesini bilen bilge bir tarihçi ve seyyahsın.',
        `Ana tez: "${VAKIF_PILLAR_QUOTE}"`,
        'Anlatımın edebi, somut mimari/tarihi bilgilere dayalı ve pratik rota tavsiyeleri içeren Markdown formatında olsun (başlıklar, alıntı ve madde işaretleri kullan).'
      ].join('\n');

      let focusPrompt = '';
      if (focusId.indexOf('prov:') === 0) {
        const pKey = focusId.slice(5);
        const prov = provincesMap[pKey];
        if (prov) {
          const lib = prov.custom_library || prov.library || '';
          const landmarks = Array.isArray(prov.landmarks) ? prov.landmarks.join(', ') : '';
          const linkedHans = HAN_BY_PROVINCE.get(pKey) || [];
          focusPrompt = [
            `Odak İl: ${prov.name} (Plaka ${formatPlate(prov.plate)}, Bölge: ${prov.region}, Durum: ${prov.visited ? 'Gezildi' : 'Gezilmedi'})`,
            `Kütüphane Ofisi: ${lib}`,
            `Önemli Duraklar: ${landmarks}`,
            linkedHans.length
              ? `İl Sınırlarındaki Tarihi Hanlar: ${linkedHans.map(function (h) { return `${h.name} (${h.year}, ${h.patron})`; }).join('; ')}`
              : 'Bu ilin tarihi İpek Yolu/Anadolu menzil zincirindeki yerini vurgula.',
            'Görev: Bu il için 13. yüzyıl kervansaray ruhunu (3 gün ücretsiz misafirperverlik, darüşşifa, kütüphane, mescit) 21. yüzyıl GSB Seyahatsever 5 Gün Kuralı (5 gece × 2.200 ₺ = 11.000 ₺ tasarruf) ve İl Halk Kütüphanesi mesaisiyle birleştiren etkileyici bir Kervansaray Hikayesi ve 5 günlük rota yorumu yaz.'
          ].join('\n');
        }
      } else {
        const han = CARAVANSERAIS.find(function (h) { return h.id === focusId; });
        if (han) {
          const prov = provincesMap[han.provinceKey];
          const lib = (prov && (prov.custom_library || prov.library)) || `${han.provinceName} İl Halk Kütüphanesi`;
          focusPrompt = [
            `Odak Tarihi Kervansaray: ${han.name} (${han.provinceName} / ${han.district}, ${han.era}, ${han.year})`,
            `Bânisi & Mimarı: ${han.patron} / ${han.architect}`,
            `İpek Yolu Kolu: ${han.corridor}`,
            `Mimari Özeti: ${han.architecture}`,
            `Vakıf Felsefesi: ${han.vakifPhilosophy}`,
            `İl Halk Kütüphanesi: ${lib}`,
            'Görev: Bu kervansarayın taşlarına sinmiş hikayeyi, 3 gün ücretsiz misafirperverlik/darüşşifa/kütüphane/mescit düzenini anlat ve günümüzde aynı şehirde GSB Seyahatsever (5 gece × 2.200 ₺ = 11.000 ₺ tasarruf) ile İl Halk Kütüphanesi odaklı modern bir seyyah rotası kurgula.'
          ].join('\n');
        }
      }

      if (!focusPrompt) {
        focusPrompt = [
          `Tarihi Kervansaray Ağı: ${CARAVANSERAIS.map(function (h) { return `${h.name} (${h.provinceName})`; }).join(', ')}.`,
          `Seyyahın İlerlemesi: ${visitedCount}/${totalProvinces} il gezildi (${formatTL(realizedSavingTL)} ₺ GSB tasarrufu sağlandı).`,
          'Görev: 13. yüzyıl Selçuklu/Osmanlı kervansaraylarının vakıf medeniyetini (40 km’de bir menzil, 3 gün ücretsiz konaklama, darüşşifa, kütüphane, mescit) modern GSB Seyahatsever 5 Gün Kuralı ve 81 İl Halk Kütüphanesi seyyahlığıyla sentezleyen ilham verici bir hikaye ve sonraki menziller için rota yorumu yaz.'
        ].join('\n');
      }

      const fullUserPrompt = [
        focusPrompt,
        anatoliaCtx ? `\nGenel Seyahat Bağlamı:\n${anatoliaCtx}` : ''
      ].filter(Boolean).join('\n');

      try {
        const res = await window.SEYYAH_AI.stream({
          prompt: fullUserPrompt,
          system: systemPrompt,
          temperature: 0.75,
          maxTokens: 1600,
          cacheKey: `karavansaray:${focusId}:v${visitedCount}`,
          onChunk: function (_delta, fullText) {
            if (reqToken !== uiState.aiRequestToken) return;
            uiState.aiText = fullText;
            const mdBody = container.querySelector('#skn-ai-md-body');
            if (mdBody) {
              mdBody.innerHTML = renderMdSafe(fullText, esc);
            }
          }
        });

        if (reqToken !== uiState.aiRequestToken) return;
        uiState.aiStatus = 'done';
        uiState.aiText = (res && res.text) || uiState.aiText || generateOfflineEssay(focusId, provincesMap, visitedEntries);
        uiState.aiSource = res && res.model
          ? `⚡ Gemini AI (${res.model})${res.cached ? ' · Önbellek' : ''}`
          : '⚡ Gemini AI Canlı Anlatım';
        paint();
      } catch (err) {
        if (reqToken !== uiState.aiRequestToken) return;
        uiState.aiStatus = 'done';
        uiState.aiError = (err && err.message) || 'AI bağlantısı kurulamadı';
        uiState.aiText = generateOfflineEssay(focusId, provincesMap, visitedEntries);
        uiState.aiSource = '📜 Çevrimdışı Kervansaray Arşivi (AI Yedeği)';
        paint();
        if (typeof safeCtx.showToast === 'function') {
          safeCtx.showToast('⚠️ Gemini AI yanıt veremedi — Çevrimdışı kervansaray arşivi gösteriliyor.');
        }
      }
    }

    function bindEvents() {
      const root = container.querySelector('#skn-root');
      if (!root) return;

      // Menzil Distance Calculator selects & swap
      function updateCalcOnly() {
        const out = root.querySelector('#skn-calc-output');
        if (out) out.innerHTML = buildMenzilCalcResultHtml();
      }

      const calcFromSel = root.querySelector('#skn-calc-from');
      if (calcFromSel) {
        calcFromSel.addEventListener('change', function (e) {
          uiState.calcFromId = e.target.value || CARAVANSERAIS[0].id;
          updateCalcOnly();
        });
      }

      const calcToSel = root.querySelector('#skn-calc-to');
      if (calcToSel) {
        calcToSel.addEventListener('change', function (e) {
          uiState.calcToId = e.target.value || CARAVANSERAIS[2].id;
          updateCalcOnly();
        });
      }

      const calcSwapBtn = root.querySelector('#skn-calc-swap');
      if (calcSwapBtn) {
        calcSwapBtn.addEventListener('click', function () {
          const tmp = uiState.calcFromId;
          uiState.calcFromId = uiState.calcToId;
          uiState.calcToId = tmp;
          if (calcFromSel) calcFromSel.value = uiState.calcFromId;
          if (calcToSel) calcToSel.value = uiState.calcToId;
          updateCalcOnly();
        });
      }

      // Selçuklu Kervansaray / Silk Road Route Loader
      const loadSilkRoadBtn = root.querySelector('#skn-load-silkroad-btn');
      if (loadSilkRoadBtn) {
        loadSilkRoadBtn.addEventListener('click', function () {
          const activeHans = getFilteredHans();
          const sourceList = activeHans.length ? activeHans : CARAVANSERAIS;
          // Prioritize historical Silk Road sequence
          const orderedPreferred = [
            '03_Akdeniz/Antalya',
            '04_IcAnadolu/Konya',
            '04_IcAnadolu/Aksaray',
            '04_IcAnadolu/Kayseri',
            '04_IcAnadolu/Sivas',
            '06_DoguAnadolu/Erzincan',
            '06_DoguAnadolu/Malatya',
            '01_Marmara/Bursa',
            '01_Marmara/Edirne',
            '02_Ege/Izmir'
          ];
          const presentSet = new Set(sourceList.map(function (h) { return h.provinceKey; }).filter(Boolean));
          const routeKeys = orderedPreferred.filter(function (k) { return presentSet.has(k); });
          sourceList.forEach(function (h) {
            if (h.provinceKey && routeKeys.indexOf(h.provinceKey) === -1) {
              routeKeys.push(h.provinceKey);
            }
          });
          if (routeKeys.length) {
            dispatchRouteCities(
              safeCtx,
              routeKeys,
              '🧭 ' + routeKeys.length + ' illik Selçuklu & İpek Yolu Kervansaray rotası yüklendi!'
            );
          }
        });
      }

      // Search input (updates grid in-place to preserve cursor & IME)
      const searchInput = root.querySelector('#skn-prov-search');
      if (searchInput) {
        searchInput.addEventListener('input', function (e) {
          uiState.searchQuery = e.target.value || '';
          updateProvinceListOnly();
        });
      }

      // AI Focus select
      const aiSelect = root.querySelector('#skn-ai-focus');
      if (aiSelect) {
        aiSelect.addEventListener('change', function (e) {
          uiState.aiFocusId = e.target.value || 'general';
        });
      }

      // AI Trigger button
      const aiBtn = root.querySelector('#skn-ai-trigger');
      if (aiBtn) {
        aiBtn.addEventListener('click', function () {
          runAiInterpretation();
        });
      }

      // Delegated clicks for filters, city navigation, and card AI shortcuts
      root.addEventListener('click', function (ev) {
        const target = ev.target;
        if (!target || typeof target.closest !== 'function') return;

        const gotoBtn = target.closest('[data-skn-goto]');
        if (gotoBtn) {
          const cityKey = gotoBtn.getAttribute('data-skn-goto');
          if (cityKey && typeof safeCtx.selectCity === 'function') {
            safeCtx.selectCity(cityKey);
          }
          return;
        }

        const aiHanBtn = target.closest('[data-skn-ai-han]');
        if (aiHanBtn) {
          const hanId = aiHanBtn.getAttribute('data-skn-ai-han');
          if (hanId) {
            const aiPanel = container.querySelector('#skn-ai-panel');
            if (aiPanel && typeof aiPanel.scrollIntoView === 'function') {
              aiPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            runAiInterpretation(hanId);
          }
          return;
        }

        const aiProvBtn = target.closest('[data-skn-ai-prov]');
        if (aiProvBtn) {
          const provKey = aiProvBtn.getAttribute('data-skn-ai-prov');
          if (provKey) {
            const aiPanel = container.querySelector('#skn-ai-panel');
            if (aiPanel && typeof aiPanel.scrollIntoView === 'function') {
              aiPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            runAiInterpretation('prov:' + provKey);
          }
          return;
        }

        const eraBtn = target.closest('[data-skn-era]');
        if (eraBtn) {
          uiState.eraFilter = eraBtn.getAttribute('data-skn-era') || 'all';
          root.querySelectorAll('[data-skn-era]').forEach(function (b) {
            b.classList.toggle('active', b.getAttribute('data-skn-era') === uiState.eraFilter);
          });
          updateHanListOnly();
          return;
        }

        const corridorBtn = target.closest('[data-skn-corridor]');
        if (corridorBtn) {
          uiState.corridorFilter = corridorBtn.getAttribute('data-skn-corridor') || 'all';
          root.querySelectorAll('[data-skn-corridor]').forEach(function (b) {
            b.classList.toggle('active', b.getAttribute('data-skn-corridor') === uiState.corridorFilter);
          });
          updateHanListOnly();
          return;
        }

        const vfilterBtn = target.closest('[data-skn-vfilter]');
        if (vfilterBtn) {
          uiState.visitedFilter = vfilterBtn.getAttribute('data-skn-vfilter') || 'all';
          root.querySelectorAll('[data-skn-vfilter]').forEach(function (b) {
            b.classList.toggle('active', b.getAttribute('data-skn-vfilter') === uiState.visitedFilter);
          });
          updateProvinceListOnly();
          return;
        }

        const regionBtn = target.closest('[data-skn-region]');
        if (regionBtn) {
          uiState.regionFilter = regionBtn.getAttribute('data-skn-region') || 'all';
          root.querySelectorAll('[data-skn-region]').forEach(function (b) {
            b.classList.toggle('active', b.getAttribute('data-skn-region') === uiState.regionFilter);
          });
          updateProvinceListOnly();
        }
      });
    }

    paint();
  }

  window.SEYYAH_MODULES.caravanserai = {
    render: render,
    CARAVANSERAIS: CARAVANSERAIS
  };
})();
