/**
 * Anadolu Seyahatnamesi — Seyyah Yazılım Serisi Okuyucu (In-App Book Reader)
 * Registers on window.SEYYAH_MODULES.reader = { render(container, ctx) }
 */

(function () {
  'use strict';

  const STORAGE_PREFS_KEY = 'seyyah_reader_prefs_v1';
  const STORAGE_READ_KEY = 'seyyah_reader_completed_v1';
  const STORAGE_ACTIVE_KEY = 'seyyah_reader_active_chapter_v1';

  const DEFAULT_PREFS = {
    fontSize: 17,
    fontFamily: 'serif', // 'sans' | 'serif'
    widthMode: 'standard' // 'narrow' | 'standard' | 'wide'
  };

  const WIDTH_MODES = {
    narrow: { label: 'Dar', maxWidth: '620px' },
    standard: { label: 'Standart', maxWidth: '780px' },
    wide: { label: 'Geniş', maxWidth: '980px' }
  };

  const WIDTH_ORDER = ['narrow', 'standard', 'wide'];

  const CHAPTERS = [
    {
      id: '01',
      file: 'medium_yazilari/01_manifesto_v2.md',
      icon: '🧭',
      tag: 'Manifesto',
      readTime: '~5 dk okuma',
      title: 'Yarı Göçebe, Tam Seyyah: Dijital Keşif Manifestosu',
      shortTitle: 'Yarı Göçebe, Tam Seyyah',
      subtitle: "Anadolu'nun kadim yollarında laptop, sırt çantası ve 5 gün kuralıyla kurgulanan dijital keşif felsefesi.",
      fallbackMarkdown: `# Yarı Göçebe, Tam Seyyah: Anadolu'nun Kadim Yollarında Dijital Bir Keşif Manifestosu

> *"Kıyıyı gözden kaybetmeye cesaret edemeyenler, yeni okyanuslar keşfedemezler."* — **Andre Gide**

Bu manifesto, seyahati geçici bir tatil kaçışı olmaktan çıkarıp **sürdürülebilir bir yaşam ve üretim disiplinine** dönüştüren yarı göçebe yaklaşımı özetler. Yoğun odaklanma ("monk mode") döneminin ardından dört duvarı aşıp bir sırt çantası ve laptop ile Anadolu yollarına çıkma fikrinin temel ilkelerini ortaya koyar.

---

## 1. Sistemin Sınırlarını Özgürlüğe Çevirmek: 5 Günlük Demirleme

* **GSB Seyahatsever Sınırı:** KYK yurtlarında sunulan maksimum **5 günlük** konaklama süresi bir kısıtlama değil, şehri sindirmek için stratejik bir avantaja dönüştürülür.
* **Seyahat Yorgunluğunu Önleme:** Her iki günde bir şehir değiştirmek yerine 5 gün tek noktada kalarak yol maliyeti ve *travel fatigue* minimize edilir.
* **Kuluçka Evresi:** Kentin ritmiyle senkronize olmak ve bir sonraki rotaya taze bir zihinle geçmek için ideal denge kurulur.

## 2. Bütçesizliğin Şiirselliği

Konaklama maliyetinin KYK yurtlarıyla sıfıra inmesi, lüksün ağırlığından arınmış minimalist bir hareket kabiliyeti kazandırır. Komşu illeri zincirleme takip eden 45 günlük yaz rotalarında gerçek zenginlik cepteki varlıklarla değil, adımlanan koordinatlarla ölçülür.

## 3. İki Zamanlı Günlük Ritim

| Zaman Dilimi | Mekân | Odak Noktası |
| --- | --- | --- |
| **Sabah (Kök Salma)** | İl Halk Kütüphanesi | Derin odaklanma, kod yazma, öğrenme ve dijital üretim |
| **Öğleden Sonra (Yol Alma)** | Şehir Sokakları & Antik Kentler | Tarih, doğa, yerel kültür ve ruhsal beslenme |

## 4. Anadolu'dan Öğrenilenler

Marmara'nın tarihsel dokusu, İç Anadolu'nun bilge sükûneti, Karadeniz'in dirençli doğası ve Ege-Akdeniz'in kadim mermerleri birleşerek yaşayan bir coğrafi tefekkür günlüğü oluşturur.

> *"Yolculuk, önce seni sessizleştirir, sonra da iyi bir hikâye anlatıcısına dönüştürür."* — **İbn Battuta**

**Yol açık, ufuk geniş.**`
    },
    {
      id: '02',
      file: 'medium_yazilari/02_seyahatsever_rehberi_v2.md',
      icon: '🏛️',
      tag: 'Rehber',
      readTime: '~4 dk okuma',
      title: 'Bütçesizliğin Özgürlüğü: GSB Seyahatsever Rehberi',
      shortTitle: 'GSB Seyahatsever Rehberi',
      subtitle: '18–30 yaş arası gençler için KYK yurtlarında sıfır konaklama maliyetiyle Anadolu keşif rehberi.',
      fallbackMarkdown: `# Bütçesizliğin Özgürlüğü: GSB Seyahatsever ile Sürdürülebilir Keşif Rehberi

> *"Yolculuk, konfor alanının bittiği yerde başlar; gerçek keşifler ise bütçenin değil, cesaretin yettiği yerdedir."*

Modern seyahat anlayışı yüksek bütçeler dayatsa da **GSB Seyahatsever Projesi**, yaz aylarında 18–30 yaş arası gençlere Türkiye'nin dört bir yanındaki KYK yurtlarında **5 güne kadar ücretsiz konaklama** sunarak bu bariyeri ortadan kaldırır.

---

## Neden Seyahatsever?

1. **Sıfır Maliyet, Maksimum Menzil:** Konaklama gideri ortadan kalktığında bütçe doğrudan müzelere, yerel lezzetlere ve ulaşım biletlerine aktarılabilir.
2. **Güven ve Sükûnet:** Sırt çantasını güvenli bir dolaba bırakıp şehri ve kütüphaneleri hafifçe gezme konforu sunar.
3. **Merkezi Senkronizasyon:** Yurtlar genellikle ulaşım ağlarına yakın konumdadır; şehri turist değil yerli gibi deneyimlemeyi kolaylaştırır.

## Taktiksel Yol Haritası

* **Komşu İl Zinciri:** Rotalar komşu iller üzerinden planlanarak yol yorgunluğu azaltılır ve 5 gün kuralı verimli kullanılır.
* **Erken Rezervasyon:** Yola çıkmadan önce \`444 0 472\` numaralı hat üzerinden yer ayırtılarak plansız sürprizler önlenir.
* **Minimalist Ekipman:** Hızlı kuruyan, çok amaçlı ve hafif eşyalar yurt yaşamında hareket özgürlüğünü artırır.

| Kriter | Klasik Turistik Gezi | Seyahatsever Disiplini |
| --- | --- | --- |
| **Konaklama** | Yüksek otel maliyeti | Ücretsiz KYK yurdu (5 gün) |
| **Ekipman** | Ağır valiz | Minimalist sırt çantası |
| **Tempo** | Hızlı ve yorucu | Sürdürülebilir ve dengeli |

**En uzun yollar, ilk adımı "yokluktan" korkmadan atanlarla başlar.**`
    },
    {
      id: '03',
      file: 'medium_yazilari/03_kutuphane_ofisleri_v2.md',
      icon: '📚',
      tag: 'Üretkenlik',
      readTime: '~3 dk okuma',
      title: 'Zihinsel Kök Salma: Şehir Kütüphanelerini Dijital Ofise Dönüştürmek',
      shortTitle: 'Kütüphane Ofisleri',
      subtitle: 'Yolda üretken kalmanın sırrı: 09:00–13:00 arası İl Halk Kütüphanelerinde derin odaklanma ritüeli.',
      fallbackMarkdown: `# Zihinsel Kök Salma: Şehir Kütüphanelerini Dijital Ofise Dönüştürmek

> *"Seyahat etmek sadece bedenimizi değil, zihnimizi de yeni coğrafyalara taşımaktır. Gerçek özgürlük, her durakta kök salabilme yeteneğidir."*

Dijital göçebeliğin en zorlu sınavı, sürekli değişen çevre içinde **odaklanmayı** koruyabilmektir. Dijital Seyyah disiplininde bu sorunun çözümü her yeni şehirde ilk durak olarak **İl Halk Kütüphanesi'ne** demir atmaktır.

---

## Kütüphaneyi Eşsiz Kılan 3 Özellik

1. **Hyper-Focus (Derin Odaklanma):** Kütüphane sessizliği, yazılım geliştirme ve yeni teknolojiler öğrenme süreçlerinde ihtiyaç duyulan *flow* (akış) halini doğal olarak tetikler.
2. **Kültürel Çalışma Atmosferi:** Amasya Yazma Eser Kütüphanesi'nden modern şehir kütüphanelerine kadar her mekân üretime farklı bir tarihsel ruh katar.
3. **Sıfır Maliyetli Coworking:** Ücretsiz internet, priz, çalışma masası ve düzenli ortamıyla dünyanın en verimli çalışma alanıdır.

## 09:00 – 13:00: Zihinsel İnşa Vakti

Günün ilk yarısı kutsal bir \`upskilling\` bloğudur:

* Algoritma pratikleri ve Python kütüphaneleri (\`Folium\`, \`Pandas\`) üzerinde çalışmak
* Seyahat notlarını düzenlemek ve blog yazıları kaleme almak
* Öğleden sonra kütüphaneden tertemiz bir zihinle çıkıp şehrin sokaklarını ödül olarak keşfetmek

**En büyük keşif, kendi potansiyelinize yaptığınız yolculuktur.**`
    },
    {
      id: '04',
      file: 'medium_yazilari/04_bes_gun_kurali_v2.md',
      icon: '⏳',
      tag: 'Felsefe',
      readTime: '~3 dk okuma',
      title: 'Zamanın Sindirilmesi: Neden Her Şehirde En Az 5 Gün Kalmalısın?',
      shortTitle: '5 Gün Kuralı',
      subtitle: 'Hızlı tüketim turizmine karşı yavaş seyahat: Bir şehrin ruhunu hissetmek için 5 günlük kuluçka modeli.',
      fallbackMarkdown: `# Zamanın Sindirilmesi: Neden Her Şehirde En Az 5 Gün Kalmalısın?

> *"Hızlı gezen, sadece manzaraları görür; yavaşlayan, o manzaraların ardındaki ruhu anlar."*

Modern seyahat kültürü, kısıtlı zamanda maksimum "check-in" yapmaya dayalı bir hızlı tüketim tuzağıdır. **5 Gün Kuralı**, bu aceleciliğe karşı geliştirilmiş bir derinlik ve sabır manifestosudur.

---

## Neden 5 Gün?

1. **Turist Değil, Yerel Olmak:** İlk gün yabancısı olduğunuz şehirde 3. günden itibaren esnafı, ara sokakları ve sakin parkları tanımaya başlarsınız.
2. **Yol Yorgunluğuyla Savaş:** Sürekli bavul toplama ve otobüs aktarması yerine tek noktada 5 gün kalmak enerjiyi keşfe saklar.
3. **Maliyet Optimizasyonu:** Şehirler arası ulaşım masrafları seyreltilir, bütçe uzun vadeye yayılır.
4. **Üretken Yaşam Ritmi:** Sabah kütüphane, öğleden sonra keşif düzeni ancak çok günlük konaklamada oturur.

## Yavaş Gez, Çok Hisset

81 ili bir yılda hızla geçip hiçbirini hatırlamamaktansa, her yıl 15–20 ili derinlemesine sindirmek çok daha kalıcı bir birikim sunar. Şehir, orada 5 gün kalacağınızı bildiğinde sırlarını fısıldamaya başlar.

**Gerçek yolculuk, mesafelerle değil, derinlikle ölçülür.**`
    },
    {
      id: '05',
      file: 'medium_yazilari/05_kod_ve_yol_v2.md',
      icon: '💻',
      tag: 'Mühendislik',
      readTime: '~4 dk okuma',
      title: 'Kod ve Yol: Seyahatnamemi Nasıl Python ile Otomatize Ettim?',
      shortTitle: 'Kod ve Yol (Python)',
      subtitle: 'Kağıt defter yerine GitHub reposu: Python CLI, Folium haritaları ve CI/CD ile yaşayan dijital seyahatname.',
      fallbackMarkdown: `# Kod ve Yol: Seyahatnamemi Nasıl Python ile Otomatize Ettim?

> *"Bir yazılımcı için dünya, keşfedilmeyi bekleyen bir yer değil; veriye dökülmeyi bekleyen muazzam bir sistemdir."*

Kağıt defterler yıpranır, sosyal medya gönderileri algoritmalar arasında kaybolur. Bir **GitHub reposu** ise ömür boyu yaşayan, sürüm kontrollü ve sürekli gelişen bir dijital hafızadır.

---

## Teknik Mimari ve Otomasyon Ekosistemi

| Bileşen | Araç / Dosya | Görevi |
| --- | --- | --- |
| **CLI Komuta Merkezi** | \`dijital_seyyah.py\` | Yeni şehir klasörü, standart şablon ve koordinat girişini saniyeler içinde üretir |
| **İnteraktif Harita** | \`map_generator.py\` (Folium) | Gezilen her koordinatı canlı HTML haritasına işler |
| **Analitik Motoru** | \`travel_core.py\` | Bölgesel ilerleme ve 81 il yüzdesini otomatik hesaplar |
| **CI/CD Otomasyonu** | GitHub Actions | Yeni şehir eklendiğinde haritayı ve istatistikleri otomatik yeniler |

## Teknik Bir Seyyah Olmak

* Yolda karşılaşılan lojistik problemleri yazılım araçlarıyla çözmek
* Kod yazarken zihin yorulduğunda binlerce yıllık antik kentlerde soluklanmak
* Teknolojiyi bir yük değil, anıları ölümsüzleştiren bir köprü olarak kullanmak

**Her satır kod birer adımdır; her keşif ise o kodun içine işlenen bir hikâyedir.**`
    },
    {
      id: '06',
      file: 'medium_yazilari/06_yedi_bolge_yedi_ders_v2.md',
      icon: '🗺️',
      tag: 'Tefekkür',
      readTime: '~3 dk okuma',
      title: "Anadolu'nun Ruhu: 7 Bölge, 7 Farklı Yaşam Dersi",
      shortTitle: '7 Bölge, 7 Yaşam Dersi',
      subtitle: "Marmara'dan Güneydoğu'ya her coğrafyanın bir seyyahın zihnine fısıldadığı kadim yaşam dersleri.",
      fallbackMarkdown: `# Anadolu'nun Ruhu: 7 Bölge, 7 Farklı Yaşam Dersi

> *"Türkiye'yi gezmek, sadece bir ülkeyi değil; binlerce yıllık bir medeniyetler harmanını okumaktır. Her durak yeni bir hikâye, her şehir içsel bir tefekkürdür."*

Anadolu'da adımlanan her kilometre, yalnızca coğrafi bir mesafe değil; insanın kendi iç dünyasına yaptığı felsefi bir yolculuktur.

---

## 7 Bölgenin Felsefi İzdüşümleri

| Bölge | Tema | Yaşam Dersi |
| --- | --- | --- |
| **🌊 Marmara** | Tohum ve Cihan | Küçük bir tohumun çınara dönüşümü; sabır ve kök salma |
| **🏛️ Ege** | Zamanın Çizgileri | Suyun kayayı sabırla oyması; anlık değil sürekli başarı |
| **☀️ Akdeniz** | Sükûnet ve Güç | Toroslar ve deniz arasında ruhun kendi denge merkezini bulması |
| **🌾 İç Anadolu** | Bozkırın Kalbi | Dışta sadelik, içte engin hoşgörü; tevazu en büyük bilgeliktir |
| **🌲 Karadeniz** | Direnç ve Uyum | Doğayla savaşmak yerine uyumla direnme ve yenilenme |
| **🏔️ Doğu Anadolu** | Zirvelerin İhtişamı | Zorlu iklimlerde sarsılmaz irade; sabır zirvelerin anahtarıdır |
| **🏜️ Güneydoğu** | Mezopotamya'nın Ninnisi | İnsanlığın beşiğinde kökenlere saygı ve ortak hikâyemizi tanıma |

Anadolu'yu gezerken yalnızca yeni şehirler değil, kendinizin hiç bilmediğiniz kıyılarını da keşfedersiniz. **Yol açık, ruhunuz taze olsun.**`
    },
    {
      id: '07',
      file: 'medium_yazilari/07_rota_optimizasyonu_v2.md',
      icon: '⚡',
      tag: 'Lojistik',
      readTime: '~3 dk okuma',
      title: 'Enerji Ekonomisi: Sırt Çantalı Gezginler İçin Rota Optimizasyonu',
      shortTitle: 'Enerji & Rota Optimizasyonu',
      subtitle: '45 günlük kesintisiz bir rotayı tükenmeden, her gün daha dinç tamamlamanın lojistik ve enerji kuralları.',
      fallbackMarkdown: `# Enerji Ekonomisi: Sırt Çantalı Gezginler İçin Rota Optimizasyonu

> *"Seyahat etmek bir sprint değil, bir maratondur."*

45 günlük kesintisiz bir Anadolu rotasını tükenmeden, aksine her gün daha da dinçleşerek tamamlamanın sırrı **lojistik ve enerji yönetiminde** saklıdır.

---

## 4 Altın Enerji Kuralı

1. **Komşu İller Stratejisi:** Haritanın bir ucundan diğerine sıçramak yerine sıradaki komşu ili takip etmek hem bilet maliyetini hem de *travel fatigue* riskini düşürür.
2. **5 Gün Dinlen, 1 Gün Yol:** Beş gün aynı şehirde ritim kurduktan sonra birkaç saatlik kısa bir yolculukla yeni durağa geçmek seyahati koşturmadan akışa çevirir.
3. **Dijital Hafiflik (Minimalist Çanta):** Yalnızca bir laptop, temel kıyafetler, matara ve merak. Hafif bir çanta, hafif bir zihin demektir.
4. **Beslenme ve Uyku Düzeni:** GSB yurtlarının düzenli uyku ortamı ve yerel esnaf lokantaları, bedeni güçlü ve zihni berrak tutar.

## Son Söz

Amaç sadece bir noktaya varmak değil, her kilometrenin tadını çıkarmaktır. Enerjinizi doğru yönettiğinizde dünya bitmeyen bir oyun alanına dönüşür. **Yol sizi bekliyor!**`
    }
  ];

  // In-memory markdown fetch cache: { [chapterId]: { status: 'loaded'|'fallback', markdown: string, wordCount: number } }
  const chapterCache = {};

  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_PREFS_KEY);
      if (!raw) return Object.assign({}, DEFAULT_PREFS);
      const parsed = JSON.parse(raw);
      return {
        fontSize: Math.min(24, Math.max(13, Number(parsed.fontSize) || DEFAULT_PREFS.fontSize)),
        fontFamily: parsed.fontFamily === 'sans' ? 'sans' : 'serif',
        widthMode: WIDTH_MODES[parsed.widthMode] ? parsed.widthMode : DEFAULT_PREFS.widthMode
      };
    } catch (_) {
      return Object.assign({}, DEFAULT_PREFS);
    }
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
    } catch (_) {
      // Ignore storage quota / private mode errors
    }
  }

  function loadCompletedIds() {
    try {
      const raw = localStorage.getItem(STORAGE_READ_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (_) {
      return new Set();
    }
  }

  function saveCompletedIds(idSet) {
    try {
      localStorage.setItem(STORAGE_READ_KEY, JSON.stringify(Array.from(idSet)));
    } catch (_) {
      // Ignore storage errors
    }
  }

  function loadActiveChapterIndex() {
    try {
      const raw = localStorage.getItem(STORAGE_ACTIVE_KEY);
      const idx = parseInt(raw, 10);
      if (!isNaN(idx) && idx >= 0 && idx < CHAPTERS.length) return idx;
    } catch (_) {
      // Ignore
    }
    return 0;
  }

  function saveActiveChapterIndex(idx) {
    try {
      localStorage.setItem(STORAGE_ACTIVE_KEY, String(idx));
    } catch (_) {
      // Ignore
    }
  }

  function countWords(text) {
    if (!text) return 0;
    const cleaned = String(text)
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/[#>*_`|\-]/g, ' ')
      .trim();
    if (!cleaned) return 0;
    return cleaned.split(/\s+/).length;
  }

  function estimateReadTimeLabel(words) {
    const mins = Math.max(2, Math.ceil(words / 160));
    return `~${mins} dk okuma`;
  }

  /**
   * Safe inline Markdown formatter.
   * Escapes raw text first via escapeHtml, then transforms inline code, links, bold/italic.
   */
  function formatInlineMarkdown(rawText, esc) {
    // Extract inline code segments first so markdown symbols inside `...` are untouched
    const codeTokens = [];
    const withCodePlaceholders = String(rawText).replace(/`([^`]+)`/g, function (_, codeContent) {
      const idx = codeTokens.length;
      codeTokens.push('<code>' + esc(codeContent) + '</code>');
      return '\u0000CODE' + idx + '\u0000';
    });

    // Escape remaining text completely for XSS safety
    let safe = esc(withCodePlaceholders);

    // Safe links: [label](url) — allow only http:, https:, mailto:, or #
    safe = safe.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, label, url) {
      const cleanUrl = url.replace(/&amp;/g, '&').trim();
      const isAllowed = /^(https?:\/\/|mailto:|#)/i.test(cleanUrl);
      if (!isAllowed) return label;
      const isExternal = /^https?:\/\//i.test(cleanUrl);
      const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${esc(cleanUrl)}"${targetAttr}>${label}</a>`;
    });

    // Bold + Italic (***text***)
    safe = safe.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold (**text**)
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic (*text*)
    safe = safe.replace(/(^|[^\*])\*([^\s*](?:[^*]*[^\s*])?)\*(?!\*)/g, '$1<em>$2</em>');
    // Italic (_text_)
    safe = safe.replace(/(^|[\s(])_([^\s_](?:[^_]*[^\s_])?)_(?=[\s).,!?;:]|$)/g, '$1<em>$2</em>');

    // Restore inline code tokens
    safe = safe.replace(/\u0000CODE(\d+)\u0000/g, function (_, idx) {
      return codeTokens[Number(idx)] || '';
    });

    return safe;
  }

  /**
   * Lightweight, safe Markdown-to-HTML parser.
   * Supports: headings (h1-h4), blockquotes, bold/italic, unordered & ordered lists,
   * GFM tables, horizontal rules, fenced code blocks, inline code, paragraphs.
   */
  function parseMarkdownToHtml(markdown, esc) {
    if (!markdown) return '';
    const lines = String(markdown).replace(/\r\n?/g, '\n').split('\n');
    const html = [];
    let i = 0;

    function isTableSeparator(line) {
      return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
    }

    function splitTableRow(line) {
      let trimmed = line.trim();
      if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
      if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
      return trimmed.split('|').map(function (cell) {
        return cell.trim();
      });
    }

    function isHr(line) {
      return /^\s*(?:[-*_]\s*){3,}$/.test(line);
    }

    function isHeading(line) {
      return /^\s*(#{1,4})\s+(.*)$/.test(line);
    }

    function isUnorderedItem(line) {
      return /^\s*[-*+]\s+(.*)$/.test(line);
    }

    function isOrderedItem(line) {
      return /^\s*\d+\.\s+(.*)$/.test(line);
    }

    function isBlockquote(line) {
      return /^\s*>\s?(.*)$/.test(line);
    }

    function isFence(line) {
      return /^\s*```/.test(line);
    }

    while (i < lines.length) {
      const line = lines[i];

      // Skip blank lines
      if (!line.trim()) {
        i++;
        continue;
      }

      // Fenced code block
      if (isFence(line)) {
        const lang = line.trim().slice(3).trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !isFence(lines[i])) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++; // consume closing fence
        const langAttr = lang ? ` data-lang="${esc(lang)}"` : '';
        html.push(`<pre class="reader-code-block"${langAttr}><code>${esc(codeLines.join('\n'))}</code></pre>`);
        continue;
      }

      // Horizontal rule
      if (isHr(line)) {
        html.push('<hr class="reader-hr">');
        i++;
        continue;
      }

      // Heading (# to ####)
      const hMatch = line.match(/^\s*(#{1,4})\s+(.*)$/);
      if (hMatch) {
        const level = hMatch[1].length;
        const content = formatInlineMarkdown(hMatch[2].trim(), esc);
        html.push(`<h${level} class="reader-h${level}">${content}</h${level}>`);
        i++;
        continue;
      }

      // Blockquote
      if (isBlockquote(line)) {
        const quoteLines = [];
        while (i < lines.length && isBlockquote(lines[i])) {
          quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        const quoteHtml = quoteLines
          .filter(function (q) { return q.trim().length > 0; })
          .map(function (q) { return `<p>${formatInlineMarkdown(q.trim(), esc)}</p>`; })
          .join('');
        html.push(`<blockquote class="reader-blockquote">${quoteHtml}</blockquote>`);
        continue;
      }

      // Table (header row + separator row)
      if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
        const headers = splitTableRow(line);
        i += 2; // skip header and separator
        const bodyRows = [];
        while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
          bodyRows.push(splitTableRow(lines[i]));
          i++;
        }
        const thead = '<thead><tr>' + headers.map(function (h) {
          return `<th>${formatInlineMarkdown(h, esc)}</th>`;
        }).join('') + '</tr></thead>';
        const tbody = '<tbody>' + bodyRows.map(function (row) {
          return '<tr>' + headers.map(function (_, colIdx) {
            return `<td>${formatInlineMarkdown(row[colIdx] || '', esc)}</td>`;
          }).join('') + '</tr>';
        }).join('') + '</tbody>';
        html.push(`<div class="reader-table-wrap"><table class="reader-table">${thead}${tbody}</table></div>`);
        continue;
      }

      // Unordered list
      if (isUnorderedItem(line)) {
        const items = [];
        while (i < lines.length && isUnorderedItem(lines[i])) {
          const itemMatch = lines[i].match(/^\s*[-*+]\s+(.*)$/);
          items.push(`<li>${formatInlineMarkdown(itemMatch[1].trim(), esc)}</li>`);
          i++;
        }
        html.push(`<ul class="reader-list reader-ul">${items.join('')}</ul>`);
        continue;
      }

      // Ordered list
      if (isOrderedItem(line)) {
        const items = [];
        while (i < lines.length && isOrderedItem(lines[i])) {
          const itemMatch = lines[i].match(/^\s*\d+\.\s+(.*)$/);
          items.push(`<li>${formatInlineMarkdown(itemMatch[1].trim(), esc)}</li>`);
          i++;
        }
        html.push(`<ol class="reader-list reader-ol">${items.join('')}</ol>`);
        continue;
      }

      // Paragraph (accumulate consecutive plain lines)
      const paraLines = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !isFence(lines[i]) &&
        !isHr(lines[i]) &&
        !isHeading(lines[i]) &&
        !isBlockquote(lines[i]) &&
        !isUnorderedItem(lines[i]) &&
        !isOrderedItem(lines[i]) &&
        !(lines[i].includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
      ) {
        paraLines.push(lines[i].trim());
        i++;
      }
      if (paraLines.length > 0) {
        html.push(`<p class="reader-p">${formatInlineMarkdown(paraLines.join(' '), esc)}</p>`);
      }
    }

    return html.join('\n');
  }

  async function fetchChapterMarkdown(chapter, forceRetry) {
    if (!forceRetry && chapterCache[chapter.id]) {
      return chapterCache[chapter.id];
    }

    // Attempt live fetch of the real markdown file
    try {
      if (typeof fetch === 'function') {
        const response = await fetch(chapter.file, { cache: 'no-cache' });
        if (response && response.ok) {
          const text = await response.text();
          if (text && text.trim().length > 40) {
            const entry = {
              status: 'loaded',
              markdown: text,
              wordCount: countWords(text)
            };
            chapterCache[chapter.id] = entry;
            return entry;
          }
        }
      }
    } catch (_) {
      // Expected on file:// protocol or offline without SW cache — gracefully fall back
    }

    const fallbackEntry = {
      status: 'fallback',
      markdown: chapter.fallbackMarkdown,
      wordCount: countWords(chapter.fallbackMarkdown)
    };
    chapterCache[chapter.id] = fallbackEntry;
    return fallbackEntry;
  }

  function ensureStyles() {
    if (typeof document === 'undefined' || !document.head) return;
    if (document.getElementById('seyyah-reader-styles')) return;

    const style = document.createElement('style');
    style.id = 'seyyah-reader-styles';
    style.textContent = `
      .seyyah-reader-root {
        display: flex;
        flex-direction: column;
        gap: 18px;
        max-width: 1320px;
        margin: 0 auto;
        animation: modFadeSlideUp 0.28s ease-out;
      }

      /* Top Hero / Header */
      .reader-hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 14px;
        padding: 18px 22px;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-glass, rgba(15, 23, 42, 0.85));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .reader-hero-title-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .reader-hero-title {
        font-family: var(--font-heading);
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .reader-hero-sub {
        font-size: 0.86rem;
        color: var(--text-secondary);
      }

      .reader-series-progress {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
        min-width: 190px;
      }

      .reader-progress-text {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--accent-cyan);
        letter-spacing: 0.02em;
      }

      .reader-progress-track {
        width: 190px;
        height: 7px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.2);
        overflow: hidden;
      }

      .reader-progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald));
        transition: width 0.35s ease;
      }

      /* Main 2-column Reader Layout */
      .reader-layout {
        display: grid;
        grid-template-columns: 310px minmax(0, 1fr);
        gap: 20px;
        align-items: start;
      }

      /* Chapter Sidebar */
      .reader-sidebar {
        position: sticky;
        top: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 16px;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-glass, rgba(15, 23, 42, 0.85));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .reader-sidebar-heading {
        font-family: var(--font-heading);
        font-size: 0.76rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        padding: 0 4px 6px;
        border-bottom: 1px solid var(--border-glass);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .reader-chapter-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .reader-chapter-btn {
        display: flex;
        align-items: flex-start;
        gap: 11px;
        width: 100%;
        text-align: left;
        padding: 11px 12px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid transparent;
        background: rgba(30, 41, 59, 0.42);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--font-body);
      }

      .reader-chapter-btn:hover {
        background: rgba(51, 65, 85, 0.65);
        border-color: rgba(0, 242, 254, 0.28);
        color: var(--text-primary);
        transform: translateX(2px);
      }

      .reader-chapter-btn.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.18), rgba(79, 172, 254, 0.16));
        border-color: var(--accent-cyan);
        color: var(--text-primary);
        box-shadow: 0 4px 16px rgba(0, 242, 254, 0.16);
      }

      .reader-ch-num {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-heading);
        font-size: 0.78rem;
        font-weight: 800;
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid var(--border-glass);
        color: var(--accent-cyan);
      }

      .reader-chapter-btn.completed .reader-ch-num {
        background: rgba(16, 185, 129, 0.2);
        border-color: rgba(16, 185, 129, 0.5);
        color: var(--accent-emerald);
      }

      .reader-ch-info {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
        flex: 1;
      }

      .reader-ch-title {
        font-size: 0.85rem;
        font-weight: 700;
        line-height: 1.3;
        color: var(--text-primary);
      }

      .reader-ch-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.72rem;
        color: var(--text-muted);
      }

      .reader-ch-tag {
        color: var(--accent-gold);
        font-weight: 600;
      }

      /* Reader Main Stage */
      .reader-stage {
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-glass, rgba(15, 23, 42, 0.88));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        overflow: hidden;
      }

      /* Typography Controls Toolbar */
      .reader-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
        padding: 12px 20px;
        border-bottom: 1px solid var(--border-glass);
        background: rgba(15, 23, 42, 0.55);
      }

      .reader-toolbar-group {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .reader-ctrl-pill {
        display: inline-flex;
        align-items: center;
        border-radius: 10px;
        background: rgba(30, 41, 59, 0.72);
        border: 1px solid var(--border-glass);
        overflow: hidden;
      }

      .reader-ctrl-btn {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        padding: 6px 11px;
        font-family: var(--font-heading);
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .reader-ctrl-btn:hover:not(:disabled) {
        background: rgba(0, 242, 254, 0.14);
        color: var(--text-primary);
      }

      .reader-ctrl-btn.active {
        background: rgba(0, 242, 254, 0.22);
        color: var(--accent-cyan);
      }

      .reader-ctrl-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .reader-font-readout {
        padding: 0 8px;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-primary);
        border-left: 1px solid var(--border-glass);
        border-right: 1px solid var(--border-glass);
        user-select: none;
      }

      .reader-source-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .reader-source-badge.live {
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.4);
        color: var(--accent-emerald);
      }

      .reader-source-badge.fallback {
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.4);
        color: var(--accent-gold);
      }

      /* Article Canvas */
      .reader-article-shell {
        padding: 32px 28px 24px;
        display: flex;
        justify-content: center;
      }

      .reader-article {
        width: 100%;
        max-width: 780px;
        transition: max-width 0.28s ease;
        color: var(--text-primary);
        line-height: 1.82;
      }

      .reader-article.font-serif {
        font-family: 'Georgia', 'Cambria', 'Times New Roman', serif;
      }

      .reader-article.font-sans {
        font-family: var(--font-body);
      }

      .reader-meta-banner {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 18px;
        padding-bottom: 14px;
        border-bottom: 1px solid var(--border-glass);
        font-family: var(--font-body);
        font-size: 0.8rem;
        color: var(--text-secondary);
      }

      .reader-meta-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 10px;
        border-radius: 999px;
        background: rgba(30, 41, 59, 0.65);
        border: 1px solid var(--border-glass);
        font-weight: 600;
      }

      /* Rendered Markdown Typography */
      .reader-content .reader-h1 {
        font-family: var(--font-heading);
        font-size: 1.85em;
        line-height: 1.25;
        font-weight: 800;
        margin: 0 0 0.85em;
        background: linear-gradient(135deg, #f8fafc 20%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .reader-content .reader-h2 {
        font-family: var(--font-heading);
        font-size: 1.32em;
        line-height: 1.35;
        font-weight: 700;
        margin: 1.6em 0 0.65em;
        color: var(--accent-cyan);
      }

      .reader-content .reader-h3 {
        font-family: var(--font-heading);
        font-size: 1.12em;
        font-weight: 700;
        margin: 1.3em 0 0.5em;
        color: var(--accent-gold);
      }

      .reader-content .reader-h4 {
        font-family: var(--font-heading);
        font-size: 1em;
        font-weight: 700;
        margin: 1.1em 0 0.4em;
        color: var(--text-primary);
      }

      .reader-content .reader-p {
        margin: 0 0 1.15em;
        color: rgba(241, 245, 249, 0.92);
      }

      .reader-content .reader-blockquote {
        margin: 1.35em 0;
        padding: 16px 20px;
        border-left: 4px solid var(--accent-cyan);
        border-radius: 0 var(--radius-md, 12px) var(--radius-md, 12px) 0;
        background: rgba(0, 242, 254, 0.07);
        font-style: italic;
        color: var(--text-primary);
      }

      .reader-content .reader-blockquote p {
        margin: 0;
      }

      .reader-content .reader-blockquote p + p {
        margin-top: 0.6em;
      }

      .reader-content .reader-list {
        margin: 0.6em 0 1.25em;
        padding-left: 1.55em;
      }

      .reader-content .reader-list li {
        margin-bottom: 0.55em;
        color: rgba(241, 245, 249, 0.92);
      }

      .reader-content .reader-list li::marker {
        color: var(--accent-cyan);
        font-weight: 700;
      }

      .reader-content .reader-hr {
        border: none;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(0, 242, 254, 0.35), transparent);
        margin: 1.8em 0;
      }

      .reader-content code {
        font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
        font-size: 0.86em;
        padding: 2px 6px;
        border-radius: 6px;
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.22);
        color: var(--accent-cyan);
      }

      .reader-content .reader-code-block {
        margin: 1.25em 0;
        padding: 16px 18px;
        border-radius: var(--radius-md, 12px);
        background: rgba(2, 6, 23, 0.85);
        border: 1px solid var(--border-glass);
        overflow-x: auto;
        line-height: 1.55;
      }

      .reader-content .reader-code-block code {
        padding: 0;
        background: transparent;
        border: none;
        color: #e2e8f0;
      }

      .reader-content .reader-table-wrap {
        width: 100%;
        overflow-x: auto;
        margin: 1.3em 0;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass);
      }

      .reader-content .reader-table {
        width: 100%;
        border-collapse: collapse;
        font-family: var(--font-body);
        font-size: 0.88em;
      }

      .reader-content .reader-table th,
      .reader-content .reader-table td {
        padding: 10px 14px;
        text-align: left;
        border-bottom: 1px solid var(--border-glass);
      }

      .reader-content .reader-table th {
        background: rgba(0, 242, 254, 0.1);
        color: var(--accent-cyan);
        font-weight: 700;
      }

      .reader-content .reader-table tr:last-child td {
        border-bottom: none;
      }

      .reader-content a {
        color: var(--accent-cyan);
        text-decoration: underline;
        text-underline-offset: 3px;
      }

      .reader-content strong {
        color: #ffffff;
        font-weight: 700;
      }

      /* Loading State */
      .reader-loading {
        padding: 48px 16px;
        text-align: center;
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: 0.92rem;
      }

      /* Footer Navigation (Previous / Mark Complete / Next) */
      .reader-footer-nav {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 12px;
        align-items: center;
        padding: 18px 24px;
        border-top: 1px solid var(--border-glass);
        background: rgba(15, 23, 42, 0.55);
      }

      .reader-nav-btn {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 11px 15px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass);
        background: rgba(30, 41, 59, 0.6);
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--font-body);
      }

      .reader-nav-btn.prev {
        align-items: flex-start;
        text-align: left;
      }

      .reader-nav-btn.next {
        align-items: flex-end;
        text-align: right;
      }

      .reader-nav-btn:hover:not(:disabled) {
        border-color: var(--accent-cyan);
        background: rgba(0, 242, 254, 0.12);
        transform: translateY(-1px);
      }

      .reader-nav-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      .reader-nav-dir {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--accent-cyan);
      }

      .reader-nav-name {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .reader-complete-btn {
        padding: 10px 16px;
        border-radius: 999px;
        border: 1px solid rgba(16, 185, 129, 0.45);
        background: rgba(16, 185, 129, 0.12);
        color: var(--accent-emerald);
        font-family: var(--font-heading);
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .reader-complete-btn:hover {
        background: rgba(16, 185, 129, 0.24);
        transform: translateY(-1px);
      }

      .reader-complete-btn.is-done {
        background: var(--accent-emerald);
        color: #041310;
        border-color: var(--accent-emerald);
      }

      /* Light Theme Overrides */
      body.light-theme .reader-hero,
      body.light-theme .reader-sidebar,
      body.light-theme .reader-stage {
        background: rgba(255, 255, 255, 0.94);
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
      }

      body.light-theme .reader-toolbar,
      body.light-theme .reader-footer-nav {
        background: rgba(241, 245, 249, 0.88);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .reader-chapter-btn {
        background: rgba(241, 245, 249, 0.85);
        color: #334155;
      }

      body.light-theme .reader-chapter-btn:hover {
        background: #e2e8f0;
        color: #0f172a;
      }

      body.light-theme .reader-chapter-btn.active {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.14), rgba(37, 99, 235, 0.1));
        border-color: #0284c7;
        color: #0f172a;
      }

      body.light-theme .reader-ch-num {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.12);
        color: #0284c7;
      }

      body.light-theme .reader-ch-title,
      body.light-theme .reader-nav-name {
        color: #0f172a;
      }

      body.light-theme .reader-ctrl-pill,
      body.light-theme .reader-meta-chip,
      body.light-theme .reader-nav-btn {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      body.light-theme .reader-ctrl-btn {
        color: #334155;
      }

      body.light-theme .reader-ctrl-btn.active {
        background: rgba(2, 132, 199, 0.14);
        color: #0284c7;
      }

      body.light-theme .reader-content .reader-h1 {
        background: none;
        -webkit-text-fill-color: #0f172a;
        color: #0f172a;
      }

      body.light-theme .reader-content .reader-h2 {
        color: #0369a1;
      }

      body.light-theme .reader-content .reader-h3 {
        color: #b45309;
      }

      body.light-theme .reader-content .reader-p,
      body.light-theme .reader-content .reader-list li {
        color: #1e293b;
      }

      body.light-theme .reader-content strong {
        color: #0f172a;
      }

      body.light-theme .reader-content .reader-blockquote {
        background: rgba(2, 132, 199, 0.06);
        border-left-color: #0284c7;
        color: #0f172a;
      }

      body.light-theme .reader-content code {
        background: rgba(2, 132, 199, 0.09);
        border-color: rgba(2, 132, 199, 0.22);
        color: #0369a1;
      }

      body.light-theme .reader-content .reader-table th {
        background: rgba(2, 132, 199, 0.08);
        color: #0369a1;
      }

      body.light-theme .reader-progress-text,
      body.light-theme .reader-nav-dir {
        color: #0284c7;
      }

      /* Responsive Layout */
      @media (max-width: 960px) {
        .reader-layout {
          grid-template-columns: 1fr;
        }

        .reader-sidebar {
          position: static;
        }

        .reader-chapter-list {
          flex-direction: row;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: thin;
        }

        .reader-chapter-btn {
          min-width: 220px;
          max-width: 240px;
          flex-shrink: 0;
        }

        .reader-article-shell {
          padding: 22px 18px;
        }

        .reader-footer-nav {
          grid-template-columns: 1fr;
        }

        .reader-nav-btn.next {
          align-items: flex-start;
          text-align: left;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const esc = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscapeHtml;
    const toast = typeof safeCtx.showToast === 'function'
      ? safeCtx.showToast
      : function () {};

    let prefs = loadPrefs();
    let completedIds = loadCompletedIds();
    let activeIdx = loadActiveChapterIndex();
    let viewSummaryOnly = false;
    let renderToken = 0;

    container.innerHTML = `
      <div class="seyyah-reader-root">
        <div class="reader-hero">
          <div class="reader-hero-title-group">
            <h2 class="reader-hero-title">📖 Seyyah Yazılım Serisi Okuyucu</h2>
            <p class="reader-hero-sub">Dijital Seyyah'ın 7 bölümlük Anadolu felsefesi, kütüphane ofisleri ve rota mühendisliği serisi.</p>
          </div>
          <div class="reader-series-progress">
            <span class="reader-progress-text" id="reader-progress-label">0 / ${CHAPTERS.length} Bölüm Okundu</span>
            <div class="reader-progress-track">
              <div class="reader-progress-fill" id="reader-progress-fill" style="width: 0%"></div>
            </div>
          </div>
        </div>

        <div class="reader-layout">
          <aside class="reader-sidebar" aria-label="Bölüm Listesi">
            <div class="reader-sidebar-heading">
              <span>İçindekiler</span>
              <span>7 Bölüm</span>
            </div>
            <div class="reader-chapter-list" id="reader-chapter-list"></div>
          </aside>

          <section class="reader-stage" aria-label="Okuma Alanı">
            <div class="reader-toolbar">
              <div class="reader-toolbar-group">
                <div class="reader-ctrl-pill" role="group" aria-label="Yazı Boyutu">
                  <button type="button" class="reader-ctrl-btn" id="reader-font-dec" title="Yazı boyutunu küçült">A−</button>
                  <span class="reader-font-readout" id="reader-font-size-val">${prefs.fontSize}px</span>
                  <button type="button" class="reader-ctrl-btn" id="reader-font-inc" title="Yazı boyutunu büyült">A+</button>
                </div>

                <div class="reader-ctrl-pill" role="group" aria-label="Yazı Tipi">
                  <button type="button" class="reader-ctrl-btn ${prefs.fontFamily === 'sans' ? 'active' : ''}" data-font="sans">Sans</button>
                  <button type="button" class="reader-ctrl-btn ${prefs.fontFamily === 'serif' ? 'active' : ''}" data-font="serif">Serif</button>
                </div>

                <div class="reader-ctrl-pill" role="group" aria-label="Okuma Genişliği">
                  <button type="button" class="reader-ctrl-btn" id="reader-width-toggle" title="Okuma genişliğini değiştir">
                    ↔ Genişlik: <span id="reader-width-label">${esc(WIDTH_MODES[prefs.widthMode].label)}</span>
                  </button>
                </div>
              </div>

              <div class="reader-toolbar-group">
                <span class="reader-source-badge live" id="reader-source-badge">Yükleniyor…</span>
                <button type="button" class="reader-ctrl-btn" id="reader-mode-toggle" style="display:none; border: 1px solid var(--border-glass); border-radius: 8px;" title="Tam metin ile yönetici özeti arasında geçiş yap">
                  ⚡ Özet Modu
                </button>
              </div>
            </div>

            <div class="reader-article-shell" id="reader-article-shell">
              <article class="reader-article font-${esc(prefs.fontFamily)}" id="reader-article">
                <div class="reader-meta-banner" id="reader-meta-banner"></div>
                <div class="reader-content" id="reader-content">
                  <div class="reader-loading">Bölüm yükleniyor…</div>
                </div>
              </article>
            </div>

            <footer class="reader-footer-nav" id="reader-footer-nav">
              <button type="button" class="reader-nav-btn prev" id="reader-prev-btn">
                <span class="reader-nav-dir">← Önceki Bölüm</span>
                <span class="reader-nav-name" id="reader-prev-name">—</span>
              </button>

              <button type="button" class="reader-complete-btn" id="reader-complete-btn">
                ✓ Okundu Olarak İşaretle
              </button>

              <button type="button" class="reader-nav-btn next" id="reader-next-btn">
                <span class="reader-nav-dir">Sonraki Bölüm →</span>
                <span class="reader-nav-name" id="reader-next-name">—</span>
              </button>
            </footer>
          </section>
        </div>
      </div>
    `;

    const chapterListEl = container.querySelector('#reader-chapter-list');
    const progressLabelEl = container.querySelector('#reader-progress-label');
    const progressFillEl = container.querySelector('#reader-progress-fill');
    const articleEl = container.querySelector('#reader-article');
    const metaBannerEl = container.querySelector('#reader-meta-banner');
    const contentEl = container.querySelector('#reader-content');
    const sourceBadgeEl = container.querySelector('#reader-source-badge');
    const modeToggleBtn = container.querySelector('#reader-mode-toggle');
    const fontDecBtn = container.querySelector('#reader-font-dec');
    const fontIncBtn = container.querySelector('#reader-font-inc');
    const fontValEl = container.querySelector('#reader-font-size-val');
    const widthToggleBtn = container.querySelector('#reader-width-toggle');
    const widthLabelEl = container.querySelector('#reader-width-label');
    const prevBtn = container.querySelector('#reader-prev-btn');
    const prevNameEl = container.querySelector('#reader-prev-name');
    const nextBtn = container.querySelector('#reader-next-btn');
    const nextNameEl = container.querySelector('#reader-next-name');
    const completeBtn = container.querySelector('#reader-complete-btn');
    const fontFamilyBtns = container.querySelectorAll('[data-font]');

    function applyTypographyPrefs() {
      articleEl.style.fontSize = prefs.fontSize + 'px';
      articleEl.style.maxWidth = WIDTH_MODES[prefs.widthMode].maxWidth;
      articleEl.classList.toggle('font-serif', prefs.fontFamily === 'serif');
      articleEl.classList.toggle('font-sans', prefs.fontFamily === 'sans');
      fontValEl.textContent = prefs.fontSize + 'px';
      widthLabelEl.textContent = WIDTH_MODES[prefs.widthMode].label;
      fontDecBtn.disabled = prefs.fontSize <= 13;
      fontIncBtn.disabled = prefs.fontSize >= 24;
      fontFamilyBtns.forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-font') === prefs.fontFamily);
      });
    }

    function updateProgressUI() {
      const doneCount = completedIds.size;
      const pct = Math.round((doneCount / CHAPTERS.length) * 100);
      progressLabelEl.textContent = `${doneCount} / ${CHAPTERS.length} Bölüm Okundu (%${pct})`;
      progressFillEl.style.width = `${pct}%`;

      const currentChapter = CHAPTERS[activeIdx];
      const isDone = completedIds.has(currentChapter.id);
      completeBtn.classList.toggle('is-done', isDone);
      completeBtn.textContent = isDone ? '✓ Okundu (Geri Al)' : '✓ Okundu Olarak İşaretle';
    }

    function renderChapterSidebar() {
      chapterListEl.innerHTML = CHAPTERS.map(function (ch, idx) {
        const isActive = idx === activeIdx;
        const isDone = completedIds.has(ch.id);
        return `
          <button
            type="button"
            class="reader-chapter-btn ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}"
            data-chapter-idx="${idx}"
            aria-current="${isActive ? 'page' : 'false'}"
          >
            <span class="reader-ch-num">${isDone ? '✓' : esc(ch.id)}</span>
            <span class="reader-ch-info">
              <span class="reader-ch-title">${esc(ch.icon)} ${esc(ch.shortTitle)}</span>
              <span class="reader-ch-meta">
                <span class="reader-ch-tag">${esc(ch.tag)}</span>
                <span>•</span>
                <span>${esc(ch.readTime)}</span>
              </span>
            </span>
          </button>
        `;
      }).join('');
    }

    function updateFooterNav() {
      const prevCh = activeIdx > 0 ? CHAPTERS[activeIdx - 1] : null;
      const nextCh = activeIdx < CHAPTERS.length - 1 ? CHAPTERS[activeIdx + 1] : null;

      prevBtn.disabled = !prevCh;
      prevNameEl.textContent = prevCh ? `${prevCh.id}. ${prevCh.shortTitle}` : 'İlk Bölüm';

      nextBtn.disabled = !nextCh;
      nextNameEl.textContent = nextCh ? `${nextCh.id}. ${nextCh.shortTitle}` : 'Serinin Sonu';
    }

    async function loadAndDisplayChapter(idx, shouldScrollTop) {
      activeIdx = Math.max(0, Math.min(CHAPTERS.length - 1, idx));
      saveActiveChapterIndex(activeIdx);
      viewSummaryOnly = false;
      const token = ++renderToken;
      const chapter = CHAPTERS[activeIdx];

      renderChapterSidebar();
      updateFooterNav();
      updateProgressUI();

      sourceBadgeEl.className = 'reader-source-badge live';
      sourceBadgeEl.textContent = 'Yükleniyor…';
      modeToggleBtn.style.display = 'none';
      contentEl.innerHTML = '<div class="reader-loading">📖 Bölüm hazırlanıyor…</div>';

      const result = await fetchChapterMarkdown(chapter, false);
      if (token !== renderToken) return; // Stale async response

      const isLive = result.status === 'loaded';
      const liveReadTime = isLive ? estimateReadTimeLabel(result.wordCount) : chapter.readTime;

      function paintBody() {
        const showingLive = isLive && !viewSummaryOnly;
        const mdToRender = showingLive ? result.markdown : chapter.fallbackMarkdown;
        const words = showingLive ? result.wordCount : countWords(chapter.fallbackMarkdown);

        metaBannerEl.innerHTML = `
          <span class="reader-meta-chip">${esc(chapter.icon)} Bölüm ${esc(chapter.id)} / ${CHAPTERS.length}</span>
          <span class="reader-meta-chip">🏷️ ${esc(chapter.tag)}</span>
          <span class="reader-meta-chip">⏱️ ${esc(showingLive ? liveReadTime : estimateReadTimeLabel(words))}</span>
          <span class="reader-meta-chip">📝 ~${words} kelime</span>
        `;

        if (showingLive) {
          sourceBadgeEl.className = 'reader-source-badge live';
          sourceBadgeEl.textContent = '● Tam Metin (.md)';
          modeToggleBtn.style.display = 'inline-flex';
          modeToggleBtn.textContent = '⚡ Yönetici Özeti';
        } else if (isLive && viewSummaryOnly) {
          sourceBadgeEl.className = 'reader-source-badge fallback';
          sourceBadgeEl.textContent = '⚡ Yönetici Özeti';
          modeToggleBtn.style.display = 'inline-flex';
          modeToggleBtn.textContent = '📄 Tam Metne Dön';
        } else {
          sourceBadgeEl.className = 'reader-source-badge fallback';
          sourceBadgeEl.textContent = '⚡ Çevrimdışı Özet';
          modeToggleBtn.style.display = 'none';
        }

        contentEl.innerHTML = parseMarkdownToHtml(mdToRender, esc);
      }

      paintBody();

      modeToggleBtn.onclick = function () {
        if (!isLive) return;
        viewSummaryOnly = !viewSummaryOnly;
        paintBody();
        toast(viewSummaryOnly ? 'Yönetici özeti görünümüne geçildi.' : 'Tam Markdown metnine dönüldü.', 'info');
      };

      if (shouldScrollTop && typeof container.scrollIntoView === 'function') {
        try {
          container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (_) {
          // Ignore scroll errors in non-standard environments
        }
      }
    }

    // Event bindings
    chapterListEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.reader-chapter-btn');
      if (!btn) return;
      const idx = parseInt(btn.getAttribute('data-chapter-idx'), 10);
      if (!isNaN(idx) && idx !== activeIdx) {
        loadAndDisplayChapter(idx, true);
      }
    });

    fontDecBtn.addEventListener('click', function () {
      if (prefs.fontSize > 13) {
        prefs.fontSize -= 1;
        savePrefs(prefs);
        applyTypographyPrefs();
      }
    });

    fontIncBtn.addEventListener('click', function () {
      if (prefs.fontSize < 24) {
        prefs.fontSize += 1;
        savePrefs(prefs);
        applyTypographyPrefs();
      }
    });

    fontFamilyBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const nextFont = btn.getAttribute('data-font');
        if (nextFont === 'sans' || nextFont === 'serif') {
          prefs.fontFamily = nextFont;
          savePrefs(prefs);
          applyTypographyPrefs();
        }
      });
    });

    widthToggleBtn.addEventListener('click', function () {
      const currIdx = WIDTH_ORDER.indexOf(prefs.widthMode);
      prefs.widthMode = WIDTH_ORDER[(currIdx + 1) % WIDTH_ORDER.length];
      savePrefs(prefs);
      applyTypographyPrefs();
      toast(`Okuma genişliği: ${WIDTH_MODES[prefs.widthMode].label}`, 'info');
    });

    prevBtn.addEventListener('click', function () {
      if (activeIdx > 0) {
        loadAndDisplayChapter(activeIdx - 1, true);
      }
    });

    nextBtn.addEventListener('click', function () {
      if (activeIdx < CHAPTERS.length - 1) {
        loadAndDisplayChapter(activeIdx + 1, true);
      }
    });

    completeBtn.addEventListener('click', function () {
      const ch = CHAPTERS[activeIdx];
      if (completedIds.has(ch.id)) {
        completedIds.delete(ch.id);
        toast(`Bölüm ${ch.id} okundu işareti kaldırıldı.`, 'info');
      } else {
        completedIds.add(ch.id);
        toast(`Bölüm ${ch.id} tamamlandı! (${completedIds.size}/${CHAPTERS.length})`, 'success');
      }
      saveCompletedIds(completedIds);
      renderChapterSidebar();
      updateProgressUI();
    });

    // Initial paint
    applyTypographyPrefs();
    loadAndDisplayChapter(activeIdx, false);
  }

  // Register on global namespace
  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.reader = {
    render: render
  };
})();
