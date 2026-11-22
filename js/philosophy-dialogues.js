/**
 * Anadolu Seyahatnamesi — 📜 Hikmet Meclisi: Kadim Seyyah ve Bilgelerle Felsefi Diyalog
 * Interactive philosophical dialogue studio powered by window.SEYYAH_AI.stream
 * featuring 5 historical sages/travelers + "Beşli Meclis — Ortak Hikmet",
 * 81-province context injection, quick philosophical prompts, and rich offline wisdom.
 *
 * Registers on: window.SEYYAH_MODULES.hikmetMeclisi = { render(container, ctx) }
 */
(function (global) {
  'use strict';

  global.SEYYAH_MODULES = global.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-hikmet-meclisi-styles';

  // ---------------------------------------------------------------------------
  // 5 Historical Sages + Council of Five
  // ---------------------------------------------------------------------------
  const SAGES = [
    {
      id: 'evliya',
      icon: '📜',
      name: 'Evliya Çelebi',
      era: '1611–1682',
      work: 'Seyahatnâme',
      shortTitle: 'Evliya Çelebi',
      roleBadge: 'Hayret Makamının Seyyahı',
      accent: '#f59e0b',
      accentSoft: 'rgba(245, 158, 11, 0.16)',
      motto: '“Seyahat-i pür-ibret ile âlemi temaşa edenin gönül gözü açılır.”',
      traits: ['Hayret Makamı', 'Şehirlerin Ruhu', 'Nüktedan Üslup'],
      greeting:
        'Esselâmü aleyküm ey azîz refîk-i sefer! Ben ki Seyyâh-ı Âlem, Nedîm-i Benî Âdem Evliya-yı bî-riyâ… Elli yıl at sırtında, kâh Diyar-ı Rum’un taş köprülerinde kâh kervansaray avlularında ömür tüketip gördüklerimi on cilt *Seyahatnâme*’ye nakşettim.\n\n' +
        'Gel, diz çök meclisimize. İster bir Anadolu beldesinin âb u havasını, çarşı-pazarının bereketini ve halkının zarafetini sor; ister yolun insana öğrettiği *hayret makamını* konuşalım. Kalemim mürekkepli, gönlüm sefere âmâdedir!',
      systemPrompt:
        'Sen 17. yüzyıl büyük Osmanlı seyyahı Evliya Çelebi’sin (1611–1682), on ciltlik Seyahatnâme’nin müellifisin. ' +
        'Üslubun: zarif, nüktedan, meraklı, müşfik ve canlıdır. "Ey azîz kârî", "ey refîk-i sefer", "âb u havası latîf", "hayret makamı", "ni’met-i nefîse", "dârü’l-kütüb", "seyahat-i pür-ibret" gibi Osmanlı seyahatname deyişlerini günümüz Türkçesiyle ahenkli, anlaşılır ve edebî biçimde harmanlarsın. ' +
        'Şehirleri anlatırken sadece taşını toprağını değil; suyunun tadını, çarşısının zanaatını, cami ve kütüphane huzurunu, halkının meşrebini ve ince mizahını hissederek tasvir edersin. ' +
        'Yanıtlarını Markdown ile yapılandır; gerektiğinde kısa alıntılar (blockquote) ve madde başlıkları kullan. Asla modern bir yapay zekâ asistanı gibi konuşma, bütünüyle Evliya Çelebi’nin ruhuyla cevap ver.'
    },
    {
      id: 'ibn_battuta',
      icon: '🌍',
      name: 'İbn Battûta',
      era: '1304–1369',
      work: 'Rihle (Tuhfetü’n-Nüzzâr)',
      shortTitle: 'İbn Battûta',
      roleBadge: '120.000 km Yol Tecrübesi',
      accent: '#00f2fe',
      accentSoft: 'rgba(0, 242, 254, 0.15)',
      motto: '“Yolculuk insana önce susmayı, sonra dinlemeyi, en sonunda da herkeste bir kardeş görmeyi öğretir.”',
      traits: ['Rihle & Gurbet', 'Kervansaray Kardeşliği', 'İlim Meclisleri'],
      greeting:
        'Merhabâ ey yola revân olan dost! Ben Tancalı Ebû Abdullah Muhammed ibn Battûta. Yirmi bir yaşımda çıktığım *Rihle*’den tam yirmi dokuz yıl sonra, yüz yirmi bin kilometre yol katederek döndüm. Anadolu’yu da karış karış gezip Ahî tekkelerinde konakladım.\n\n' +
        'Gurbette insanı ayakta tutan şey menzilin uzaklığı değil; Ahî sofrasında paylaşılan bir tas sıcak çorba, ilim meclislerinde kurulan muhabbet ve kervansaray kardeşliğidir. Yolculuğuna, yalnızlığına veya merak ettiğin bir beldeye dair ne sormak istersen sor; heybedeki tecrübeyi paylaşalım.',
      systemPrompt:
        'Sen 14. yüzyılın büyük seyyahı Tancalı İbn Battûta’sın (1304–1369), meşhur Rihle’nin (Tuhfetü’n-Nüzzâr) sahibisin. ' +
        'Yaklaşık 29 yıl boyunca 120.000 km yol katettin; Anadolu Beylikleri dönemini bizzat gezdin ve Anadolu’daki Ahî zaviyelerinin misafirperverliğine hayran kaldın. ' +
        'Üslubun: dünyayı görmüş, bilge, gözlemci, insan sıcaklığı taşıyan, gurbette kardeşliği ve ilim meclislerini yücelten bir seyyah üslubudur. ' +
        'Kervansaraylar, Ahî fütüvveti, farklı coğrafyalardan âlimlerle sohbetler, yol yorgunluğunun olgunlaştırıcı gücü ve "bir yerde birkaç gün konaklayıp şehrin nabzını tutma" tecrübesi üzerinden derin, samimi ve akıcı Türkçe ile yanıt ver. Markdown biçimlendirmesi kullan.'
    },
    {
      id: 'ibn_arabi',
      icon: '🕯️',
      name: "Muhyiddin İbnü'l-Arabî",
      era: '1165–1240',
      work: "el-Fütûhât & Kitâbü'l-İsfâr",
      shortTitle: "İbnü'l-Arabî",
      roleBadge: 'Seferlerin Batıni Sırrı',
      accent: '#a855f7',
      accentSoft: 'rgba(168, 85, 247, 0.16)',
      motto: '“Varlık baştan başa bir sefer hâlindedir; kâmil seyyah dışta yürürken içinde durur.”',
      traits: ['Kitâbü’l-İsfâr', 'Sefer Der Vatan', 'Halvet & Hakikat'],
      greeting:
        'Selâm olsun kalbini hakikate açan yolcuya… Ben Muhyiddin İbnü’l-Arabî. Endülüs’ün Mürsiye şehrinden yola çıkıp Anadolu’da — Malatya’dan Konya’ya, Sivas’tan Şam’a — ilim ve irfan izleri sürerken *Kitâbü’l-İsfâr an Netâici’l-Esfâr*’da (Seferlerin Sırrı) yolculuğun hakikatini yazdım.\n\n' +
        'Bilesin ki zahirdeki her adım, batındaki bir hâle tekabül eder. Mekânları adımlarken kendi iç âleminde hangi menzile vardığını tefekkür edelim. Gönlüne düşen suali arz eyle.',
      systemPrompt:
        'Sen Şeyh-i Ekber Muhyiddin İbnü’l-Arabî’sin (1165–1240); el-Fütûhâtü’l-Mekkiyye ve Kitâbü’l-İsfâr an Netâici’l-Esfâr (Seferlerin Meyveleri/Sırrı) eserlerinin müellifisin. ' +
        'Anadolu’da Konya, Malatya, Sivas gibi şehirlerde bulunmuş bir irfan üstadısın. ' +
        'Üslubun: derin, tefekkürlü, sembolik ama berrak; zahiri yolculukla (sefer-i âfâkî) içsel yolculuğu (sefer-i enfüsî / sefer der vatan) birleştiren tasavvuf felsefesi dilindedir. ' +
        '"İsfâr" kelimesinin hem yolculuk hem de örtünün kalkıp hakikatin aydınlanması anlamına geldiğini, "halvet der encümen" (kalabalık içinde Hakk ile baş başa kalma) sırrını, mekânın kalple ilişkisini derinlikli fakat anlaşılır bir Türkçe ile anlat. Markdown kullan.'
    },
    {
      id: 'yunus',
      icon: '🌾',
      name: 'Yunus Emre',
      era: '1240–1320',
      work: 'Dîvân & Risâletü’n-Nushiyye',
      shortTitle: 'Yunus Emre',
      roleBadge: 'Anadolu’nun Gönül Mimarı',
      accent: '#10b981',
      accentSoft: 'rgba(16, 185, 129, 0.16)',
      motto: '“Yol odur ki doğru vara, göz odur ki Hakk’ı göre; er odur alçakta dura, yüceden bakan göz değil.”',
      traits: ['Tevazu & Muhabbet', 'Duru Anadolu Türkçesi', 'Gönül Yapmak'],
      greeting:
        'Hoş geldin canım kardeşim, gönlümüzün konuğu… Ben Taptuk Emre’nin eşiğinde kırk yıl odun taşıyan derviş Yunus. Gezdiğim bunca dağda, bozkırda, pınar başında anladım ki asıl sefer bir şehirden bir şehre değil, bir gönülden bir gönüle varmaktır.\n\n' +
        '> *“Bir kez gönül yıktın ise, bu kıldığın namaz değil…”*\n\n' +
        'Sor bakalım dervişim; bu gurbet ellerde yol neyi terbiye eder, azık nedir, şehirlerin toprağında hangi muhabbet saklıdır? Söyleşelim duru sözle.',
      systemPrompt:
        'Sen Anadolu’nun gönül mimarı ve Türkçenin büyük ozanı Yunus Emre’sin (1240–1320). ' +
        'Üslubun: son derece duru, samimi, mütevazı, sıcak, sevgi ve hikmet dolu bir Anadolu Türkçesi taşır. ' +
        'Ağdalı terkiplerden uzak dur; halkın kalbine dokunan deyişler, sade benzetmeler (su, toprak, buğday, dergâh, yol, gönül) ve zaman zaman kendi nefeslerinden / beyitlerinden (ör. "Yol odur ki doğru vara, göz odur ki Hakk’ı göre", "İlim ilim bilmektir, ilim kendin bilmektir", "Sevelim sevilelim") veciz dizeler serpiştir. ' +
        'Yolculuğun kibirden arınıp tevazu kuşanmak olduğunu vurgula. Markdown formatında yaz.'
    },
    {
      id: 'ibn_haldun',
      icon: '📐',
      name: 'İbn Haldûn',
      era: '1332–1406',
      work: 'Mukaddime & Kitâbü’l-İber',
      shortTitle: 'İbn Haldûn',
      roleBadge: 'Umran İlmi & Tarih Filozofu',
      accent: '#4facfe',
      accentSoft: 'rgba(79, 172, 254, 0.16)',
      motto: '“Coğrafya kaderdir; zira iklim, toprak ve su, insanın tabiatını ve medeniyetin ömrünü dokur.”',
      traits: ['Umran İlmi', 'Bedevîlik & Hadarîlik', 'Asabiyet & Şehir'],
      greeting:
        'Selâm ve hikmetle… Ben Tunuslu tarihçi ve toplum bilginî Abdurrahman İbn Haldûn. *Mukaddime*’de devletlerin, şehirlerin ve insan topluluklarının (umrânın) yükseliş ve çöküş yasalarını inceledim.\n\n' +
        'Bir şehri sadece manzarasıyla değil; coğrafyasının, suyunun, ticaret yollarının, *bedevî* (kırsal/hareketli) dinamizmi ile *hadarî* (şehirli/kurumsal) birikimi arasındaki gerilimiyle okumak gerekir. İstediğin Anadolu vilayetini yahut yolculuk felsefesini umran ilminin terazisinde tartalım.',
      systemPrompt:
        'Sen 14. yüzyıl büyük tarih filozofu ve sosyolojinin öncüsü İbn Haldûn’sun (1332–1406), meşhur Mukaddime’nin müellifisin. ' +
        'Üslubun: analitik, berrak, neden-sonuç ilişkisi kuran, sosyolojik ve tarihsel derinliği yüksek bir bilge üslubudur. ' +
        'Umran ilmi, asabiyet (toplumsal dayanışma ruhu), bedevîlik (hareketlilik, dayanıklılık, yol hâli) ve hadarîlik (şehirleşme, zanaat, ilim, konfor), "coğrafya ve iklimin insan mizacına etkisi" kavramlarını kullanırsın. ' +
        'Seçilen şehrin coğrafi konumunu, ticaret ve ilim kültürünü, kütüphanelerini ve seyahat disiplini içindeki yerini keskin bir sosyolojik nazarla çözümle. Markdown kullan.'
    }
  ];

  const COUNCIL_SAGE = {
    id: 'council',
    icon: '🌟',
    name: 'Beşli Meclis — Ortak Hikmet',
    era: 'Kadim Heyet',
    work: '5 Bilge Ortak İstişaresi',
    shortTitle: 'Beşli Meclis',
    roleBadge: '5 Bilge Aynı Sofrada',
    accent: '#fbbf24',
    accentSoft: 'rgba(251, 191, 36, 0.16)',
    motto: '“Beş ayrı iklimden gelen beş nazar, aynı şehre ve aynı kalbe başka bir pencere açar.”',
    traits: ['Çok Sesli İstişare', 'Tarih & İrfan', 'Sentez Hikmet'],
    greeting:
      'Hoş geldin ey seyyah! Şu an **Beşli Hikmet Meclisi**’ndesin. Aynı halının çevresinde **Evliya Çelebi**, **İbn Battûta**, **İbnü’l-Arabî**, **Yunus Emre** ve **İbn Haldûn** senin sualini beklemekte.\n\n' +
      'Burada soracağın her soruya beş bilge kendi meşrebince kısa ama özlü bir nazarla cevap verecek; böylece bir meselenin hem *seyahatname lezzetini*, hem *yol kardeşliğini*, hem *batıni sırrını*, hem *gönül sıcaklığını*, hem de *umran/medeniyet çözümlemesini* bir arada işiteceksin.',
    systemPrompt:
      'Sen 5 kadim bilgeden oluşan "Beşli Hikmet Meclisi"ni yöneten edebî bir meclis anlatıcısısın. Kullanıcının her sorusuna şu 5 bilgenin HER BİRİ ayrı başlık altında, kendi özgün üslubu ve felsefi kavramlarıyla 1 güçlü paragraf (3-4 cümle) hâlinde cevap vermeli:\n' +
      '1. **📜 Evliya Çelebi** (hayret makamı, zarif ve nüktedan Seyahatnâme dili)\n' +
      '2. **🌍 İbn Battûta** (120.000 km Rihle tecrübesi, Ahîlik ve kervansaray kardeşliği)\n' +
      '3. **🕯️ Muhyiddin İbnü’l-Arabî** (Kitâbü’l-İsfâr, zahiri yolun batıni hakikati)\n' +
      '4. **🌾 Yunus Emre** (duru Anadolu Türkçesi, tevazu ve gönül nazarı)\n' +
      '5. **📐 İbn Haldûn** (Mukaddime, umran ilmi, coğrafya ve bedevîlik-hadarîlik dengesi)\n' +
      'Sonunda **🌟 Meclisin Ortak Hülâsası** başlığıyla 2 cümlelik bir sentez hikmet ekle. Markdown kullan.'
  };

  const ALL_PERSONAS = SAGES.concat([COUNCIL_SAGE]);

  // ---------------------------------------------------------------------------
  // Quick Philosophical Prompt Chips
  // ---------------------------------------------------------------------------
  const QUICK_PROMPTS = [
    {
      id: 'nefs',
      icon: '🧭',
      label: 'Yolculuk insanın nefsini nasıl terbiye eder?',
      prompt: 'Yolculuk insanın nefsini nasıl terbiye eder?'
    },
    {
      id: 'five_days',
      icon: '⏳',
      label: 'Bir şehirde 5 gün kalmanın hikmeti nedir?',
      prompt: 'Bir şehirde 5 gün kalmanın hikmeti nedir?'
    },
    {
      id: 'halvet',
      icon: '🕯️',
      label: 'Modern çağda kalabalık içinde yalnızlık (Halvet der Encümen) nasıl korunur?',
      prompt: 'Modern çağda kalabalık içinde yalnızlık (Halvet der Encümen) nasıl korunur?'
    },
    {
      id: 'city_soul',
      icon: '🏛️',
      label: 'Seçili şehrin ruhunu kendi üslubunla anlat',
      isCityPrompt: true
    }
  ];

  // ---------------------------------------------------------------------------
  // Module UI State (persists smoothly across re-renders)
  // ---------------------------------------------------------------------------
  const uiState = {
    activeSageId: 'evliya',
    selectedCityKey: '',
    cityFilter: '',
    draftText: '',
    isStreaming: false,
    streamRunId: 0,
    conversations: {},
    musavereMode: false,
    musavereQuestion: '',
    musavereLoading: false,
    musavereResult: null // { question, cityLabel, source, cards: { [sageId]: md }, hulasa: md }
  };

  function getPersona(sageId) {
    for (let i = 0; i < ALL_PERSONAS.length; i++) {
      if (ALL_PERSONAS[i].id === sageId) return ALL_PERSONAS[i];
    }
    return SAGES[0];
  }

  function ensureConversation(sageId) {
    if (!Array.isArray(uiState.conversations[sageId]) || uiState.conversations[sageId].length === 0) {
      const persona = getPersona(sageId);
      uiState.conversations[sageId] = [
        {
          id: 'greet_' + sageId,
          role: 'model',
          text: persona.greeting,
          isGreeting: true,
          source: 'archive',
          timestamp: formatClock(new Date())
        }
      ];
    }
    return uiState.conversations[sageId];
  }

  // ---------------------------------------------------------------------------
  // Safe Helpers
  // ---------------------------------------------------------------------------
  function defaultEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function esc(ctx, str) {
    if (ctx && typeof ctx.escapeHtml === 'function') {
      return ctx.escapeHtml(str);
    }
    return defaultEscapeHtml(str);
  }

  function defaultNormalizeTurkish(str) {
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

  function normTr(ctx, str) {
    if (ctx && typeof ctx.normalizeTurkish === 'function') {
      return defaultNormalizeTurkish(ctx.normalizeTurkish(str));
    }
    return defaultNormalizeTurkish(str);
  }

  function formatPlate(plate) {
    const n = Number(plate);
    if (!Number.isFinite(n) || n <= 0) return '00';
    return n < 10 ? '0' + n : String(n);
  }

  function formatClock(dateObj) {
    try {
      const d = dateObj instanceof Date ? dateObj : new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    } catch (_) {
      return '';
    }
  }

  function stripMdInline(str) {
    return String(str || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/[*_`]/g, '').trim();
  }

  function notify(ctx, message, type) {
    if (ctx && typeof ctx.showToast === 'function') {
      ctx.showToast(message, type);
      return;
    }
    const toastHost = document.getElementById('toast-container');
    if (!toastHost) return;
    const item = document.createElement('div');
    item.className = 'toast-item';
    item.textContent = message;
    toastHost.appendChild(item);
    setTimeout(() => {
      item.style.opacity = '0';
      item.style.transition = 'opacity 0.25s ease';
      setTimeout(() => item.remove(), 260);
    }, 2400);
  }

  async function copyToClipboard(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return Boolean(ok);
    } catch (_) {
      return false;
    }
  }

  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  }

  function getProvincesMap(ctx) {
    if (ctx && ctx.data && ctx.data.provinces) return ctx.data.provinces;
    if (typeof TRAVEL_DATA !== 'undefined' && TRAVEL_DATA && TRAVEL_DATA.provinces) {
      return TRAVEL_DATA.provinces;
    }
    return {};
  }

  function getSortedProvinces(ctx) {
    const map = getProvincesMap(ctx);
    return Object.entries(map)
      .map(([key, prov]) => Object.assign({}, prov, { key: prov.key || key }))
      .filter((p) => p && p.name)
      .sort((a, b) => Number(a.plate || 999) - Number(b.plate || 999));
  }

  function renderMdSafe(md, ctx) {
    const escFn = (s) => esc(ctx, s);
    if (global.SEYYAH_AI && typeof global.SEYYAH_AI.renderMarkdown === 'function') {
      return global.SEYYAH_AI.renderMarkdown(md, escFn);
    }
    // Minimal safe fallback
    return escFn(String(md || ''))
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n\n+/g, '</p><p class="seyyah-md-p">')
      .replace(/\n/g, '<br />')
      .replace(/^/, '<p class="seyyah-md-p">')
      .replace(/$/, '</p>');
  }

  function buildCityContextSummary(prov) {
    if (!prov) return '';
    const landmarks = Array.isArray(prov.landmarks) && prov.landmarks.length
      ? prov.landmarks.join(', ')
      : 'Belirtilmemiş';
    const specialties = Array.isArray(prov.specialties) && prov.specialties.length
      ? prov.specialties.join(', ')
      : 'Belirtilmemiş';
    const spiritual = Array.isArray(prov.spiritual_figures) && prov.spiritual_figures.length
      ? prov.spiritual_figures.slice(0, 3).map(stripMdInline).join(' | ')
      : '';
    const litQuotes = Array.isArray(prov.literary_quotes) && prov.literary_quotes.length
      ? prov.literary_quotes.slice(0, 2).join(' / ')
      : '';
    const library = prov.custom_library || prov.library || 'İl Halk Kütüphanesi';
    const quote = prov.custom_quote || prov.quote || '';

    return [
      `Seçili Vilayet: ${prov.name} (Plaka: ${formatPlate(prov.plate)}, Bölge: ${prov.region || 'Anadolu'})`,
      `Seyyah Durumu: ${prov.visited ? 'Gezildi (Seyahatnamede kaydı düşülmüş)' : 'Henüz gezilmedi (Ufuktaki menzil)'}`,
      `Öne Çıkan Duraklar: ${landmarks}`,
      `Yöresel Sofrası: ${specialties}`,
      `Kütüphane Durağı: ${library}`,
      quote ? `Şehir Özdeyişi: "${quote}"` : '',
      spiritual ? `Şehrin Manevî İzleri: ${spiritual}` : '',
      litQuotes ? `Edebî İzler: ${litQuotes}` : '',
      prov.history ? `Tarihî Hülâsa: ${String(prov.history).slice(0, 420)}` : ''
    ].filter(Boolean).join('\n');
  }

  // ---------------------------------------------------------------------------
  // Rich Persona-Accurate Offline Philosophical Responses
  // ---------------------------------------------------------------------------
  function buildCitySoulOffline(persona, prov) {
    const cityName = prov.name;
    const plate = formatPlate(prov.plate);
    const region = prov.region || 'Anadolu';
    const landmarks = Array.isArray(prov.landmarks) && prov.landmarks.length
      ? prov.landmarks.slice(0, 3)
      : ['Tarihî Merkez', 'Ulu Camii Çevresi'];
    const specialties = Array.isArray(prov.specialties) && prov.specialties.length
      ? prov.specialties.slice(0, 2)
      : ['yöresel sofra', 'sıcak çorba'];
    const spiritualFirst = Array.isArray(prov.spiritual_figures) && prov.spiritual_figures.length
      ? stripMdInline(prov.spiritual_figures[0])
      : '';
    const libName = stripMdInline(prov.custom_library || prov.library || `${cityName} İl Halk Kütüphanesi`);
    const statusNote = prov.visited
      ? `Sen bu güzel beldeyi zaten adımlamış, hatıra defterine izini bırakmışsın.`
      : `Bu mübarek menzil henüz önünde duran taze bir sefer vaadidir.`;
    const historySnippet = prov.history
      ? String(prov.history).split('.')[0] + '.'
      : `${cityName}, ${region} toprağının kadim bir durağıdır.`;

    switch (persona.id) {
      case 'evliya':
        return (
          `### 📜 ${cityName} (${plate}) Medhinde Seyahatnâme Varakı\n\n` +
          `Ey azîz refîk-i sefer! Kalemimi elime alıp ${region} ikliminin mümtaz beldesi **${cityName}**’i yâd edince, seyahat defterimin sayfalarına taze bir seher yeli eser. ${statusNote}\n\n` +
          `> *“${prov.custom_quote || prov.quote || `${cityName}, âb u havası latîf, çarşıları mamur ve misafirperveri bol bir Anadolu beldesidir.`}”*\n\n` +
          `- **Temaşâ Durakları:** Bu şehrin alnına mühür vurulmuş nice eser vardır; bilhassa **${landmarks.join(', ')}** civarında ikindi vakti yürümek insana hayret makamı bahşeder.\n` +
          `- **Ni’met-i Nefîse:** Seyyahın dizi taş kaldırımda yorulunca gönlünü şenlendiren lokması **${specialties.join(' ve ')}** olur; Allah bereketini dâim kılsın.\n` +
          `- **Dârü’l-Kütüb Huzuru:** İlim talibinin sığınağı olan **${libName}** kapısından girip bir köşede notlarını temize çekmek, seferin en makbul ibadetidir.\n\n` +
          (spiritualFirst ? `Hele şehrin manevî ikliminde adı anılan *${spiritualFirst.slice(0, 180)}* izi, taşa toprağa ruh üfler. ` : '') +
          `Hasılı ey dost, ${cityName} sadece haritada bir nokta değil; gören göze ibret, dinleyen kulağa hikâyedir!`
        );

      case 'ibn_battuta':
        return (
          `### 🌍 ${cityName} (${plate}) Menzilinde Rihle Notları\n\n` +
          `Yirmi dokuz yıllık *Rihle*’mde öğrendim ki bir şehri tanımak, o şehrin sabah ezanıyla uyanan sokaklarında ilk selâmı vermektir. **${cityName}**, ${region} coğrafyasının yolcuları bağrına basan köklü duraklarından biridir. ${statusNote}\n\n` +
          `- **Şehrin Nabzı:** ${historySnippet} Tarih katmanları arasında **${landmarks.join(', ')}** gibi nişangâhlar, dünden bugüne uzanan kervan yollarının sessiz şahitleridir.\n` +
          `- **Ahî Sofrası ve İkram:** Ben Anadolu’da hangi zaviyeye misafir olduysam önce sıcak bir sofra kuruldu. ${cityName}’de de **${specialties.join(' ile ')}** tatmak, o şehrin insanıyla aynı hikâyeye ortak olmaktır.\n` +
          `- **İlim Meclisi:** Seyyah yalnız yürümez; kitapla ve kalemle dostluk kurar. **${libName}** masalarında geçireceğin birkaç saat, gurbetteki en vefalı ilim meclisi olacaktır.\n\n` +
          `> *“Yabancı bir şehirde seni karşılayan ilk kütüphane ve ilk sıcak çorba, gurbeti vatan eyler.”*`
        );

      case 'ibn_arabi':
        return (
          `### 🕯️ ${cityName}’in Zahiri Sureti ve Batıni Manası\n\n` +
          `Bil ki ey yolcu, her belde İlâhî bir ismin yeryüzündeki tecelligâhıdır. **${cityName}** (${region}), zahirde taş, su ve gökyüzünden ibaret görünse de hakikatte kalbin bir durağıdır. ${statusNote}\n\n` +
          `1. **Mekânın Aynası:** **${landmarks[0]}** önünde durduğunda sadece dışarıdaki mimariyi seyretme; kendi içindeki sabrı, hayreti ve zamanın akışını gör. *Kitâbü’l-İsfâr*’da söylediğimiz gibi sefer, perdelerin kalkmasıdır.\n` +
          `2. **Kalbin Halveti:** **${libName}** içinde sükûnete çekildiğinde, dışarıdaki şehrin uğultusu kalbinde bir berraklığa dönüşür. Kalabalık içindeki halvet işte budur.\n` +
          `3. **Bereket ve Şükür:** Toprağın sunduğu **${specialties[0]}** nimetini tadarken rızkı vereni tefekkür etmek, maddeyi manaya bağlar.\n\n` +
          (spiritualFirst ? `Bu beldeye sinmiş manevî nefes (*${spiritualFirst.slice(0, 140)}*) sana şunu fısıldar: ` : '') +
          `> *“Şehri dışarıda arayan yorulur; şehri kalbinde bulan ise menzile ermiş olur.”*`
        );

      case 'yunus':
        return (
          `### 🌾 ${cityName} Toprağından Gönle Düşen Söz\n\n` +
          `Gel canım kardeşim, **${cityName}**’den söz açtın, yüreğimize ${region} rüzgârı esti. ${statusNote} Dervişin gözüyle bir şehre bakınca taş duvarlardan önce o duvarları ören ellerin emeği, o sokaklardan geçenlerin duası görünür.\n\n` +
          `> *“Dağlar ile taşlar ile çağırayım Mevlâm seni / Seherlerde kuşlar ile çağırayım Mevlâm seni…”*\n\n` +
          `- **Şehrin İzi:** **${landmarks.join(', ')}** dedikleri o güzel yerlerde bir an dur, toprağa tevazu ile bas. Nice erenler, nice garip yolcular geçti o yollardan.\n` +
          `- **Aş ve Muhabbet:** Akşam olup bir köşede **${specialties.join(' veya ')}** ikram edildiğinde bir lokmayı bölüşmek, bin nasihatten yeğdir.\n` +
          `- **Okuma Köşesi:** **${libName}** içinde kitapların arasında sessizce otururken şunu unutma: *“İlim ilim bilmektir, ilim kendin bilmektir; sen kendini bilmezsen, ya nice okumaktır.”*\n\n` +
          `Gönül kırmadan, acele etmeden, muhabbetle yürü ${cityName} sokaklarında; o zaman şehir de sana kalbini açar.`
        );

      case 'ibn_haldun':
        return (
          `### 📐 Umran İlmi Gözüyle ${cityName} (${plate}) Çözümlemesi\n\n` +
          `*Mukaddime*’de ortaya koyduğum temel ilke şudur: **Coğrafya, bir beldenin kaderini ve insanının mizacını şekillendirir.** **${cityName}**’i (${region}) anlamak için önce toprağının sunduğu imkânlara ve tarihsel sürekliliğine bakmalıyız. ${statusNote}\n\n` +
          `1. **Tarihî ve Coğrafî Zemin:** ${historySnippet} Şehirdeki **${landmarks.join(', ')}** yapıları, döneminin kurumsal gücünü, savunma veya ibadet/ticaret ihtiyacını yansıtan somut umran belgeleridir.\n` +
          `2. **Hadarî Birikim (Sanat ve Mutfak):** Bir şehirde **${specialties.join(' ve ')}** gibi köklü bir mutfak zanaatı oluşmuşsa, orada yerleşik kültür, sabır ve toplumsal aktarım (asabiyet) güçlü demektir.\n` +
          `3. **İlim Müessesesi:** Bugün **${libName}** gibi bir mekânın şehir hayatında canlı kalması, hadarî medeniyetin en yüksek mertebesi olan ilim ve tedvin geleneğinin sürdüğünü gösterir.\n\n` +
          `> *“Bir beldede beş gün kalıp kütüphanesinde çalışmak, sadece turistçe bakmak değil; o şehrin umran ritmine bizzat dâhil olmaktır.”*`
        );

      case 'council':
      default:
        return (
          `### 🌟 ${cityName} (${plate}) İçin Beşli Hikmet Meclisi\n\n` +
          `#### 📜 Evliya Çelebi\n` +
          `Ey azîz refîk! ${region} diyarının güzide beldesi **${cityName}**, **${landmarks[0]}** ile gözü, **${specialties[0]}** ile damağı şenlendiren mübarek bir duraktır. Havasını teneffüs edenin kalemine bereket gelir.\n\n` +
          `#### 🌍 İbn Battûta\n` +
          `Yol tecrübemle derim ki; ${cityName}’de bir şehri tanımanın yolu çarşı esnafıyla selâmlaşmak ve **${libName}** çatısı altında ilim ehline komşu olmaktır. ${statusNote}\n\n` +
          `#### 🕯️ Muhyiddin İbnü’l-Arabî\n` +
          `${cityName}’in taşlarında gördüğün her nakış, kendi iç âlemindeki sabır ve hikmetin bir aksidir. Zahirdeki bu menzilde biraz durup kalbini dinle ki hakikatin örtüsü kalksın.\n\n` +
          `#### 🌾 Yunus Emre\n` +
          `Canım kardeşim, taşında toprağında bunca hatıra biriken bu şehirde önemli olan kaç bina gördüğün değil; kaç gönle selâm verdiğin, ne kadar tevazu ile yürüdüğündür.\n\n` +
          `#### 📐 İbn Haldûn\n` +
          `${historySnippet} Umran ilmi açısından ${cityName}, ${region} coğrafyasının üretim, dayanışma ve yerleşik kültür dengesini okutan canlı bir tarih sahnesidir.\n\n` +
          `#### 🌟 Meclisin Ortak Hülâsası\n` +
          `**${cityName}**, gözle seyredilince tarih ve coğrafya, gönülle dinlenince irfan ve muhabbet olan bir Anadolu aynasıdır.`
        );
    }
  }

  function buildTopicOfflineResponse(persona, question, cityObj, ctx) {
    const qNorm = normTr(ctx, question);

    // 1) City-specific prompt or explicit city inquiry
    if (cityObj && (qNorm.includes('secili sehr') || qNorm.includes('kendi uslubun') || qNorm.includes(normTr(ctx, cityObj.name)))) {
      return buildCitySoulOffline(persona, cityObj);
    }

    // 2) "Yolculuk insanın nefsini nasıl terbiye eder?"
    if (qNorm.includes('nefs') || qNorm.includes('terbiye') || qNorm.includes('yolculuk insani')) {
      switch (persona.id) {
        case 'evliya':
          return (
            `### 📜 Seyahatnâme Gözüyle: Yolun Nefsi Terbiyesi\n\n` +
            `Ey azîz refîk-i sefer! Elli yıllık ömrümü yollara vakfetmiş biri olarak derim ki; insan kendi konağının rahatında kendini sultan sanır, lakin **yola çıkınca haddini ve aczini bilir**.\n\n` +
            `- **Konforun Kırılması:** Kâh kervansarayın sert minderinde yatarsın, kâh yağmur altında sığınacak bir çatı ararsın. İşte o demde nefsin şımarıklığı dökülür, yerine *şükür* gelir.\n` +
            `- **Hayret Makamı:** Her yeni şehirde başka bir lehçe, başka bir ekmek, başka bir çeşme suyu gördükçe insan “Demek ki âlem benim mahallemden ibaret değilmiş!” der; kibir erir, hayret büyür.\n` +
            `- **Zarafet ve Sabır:** Yolda aksilik eksik olmaz; lakin ârif seyyah sıkıntıyı bile tatlı bir hikâyeye çevirmesini bilendir.\n\n` +
            `> *“Evinde oturan tek bir ömür yaşar; ibretle seyahat eden ise her menzilde yeniden doğar.”*`
          );
        case 'ibn_battuta':
          return (
            `### 🌍 Rihle Tecrübesiyle: Yolda Pişen İrade\n\n` +
            `Yirmi dokuz yıl boyunca çöller, denizler ve dağ geçitleri aşarken şunu gördüm: **Yolculuk, insanın üzerindeki sahte zırhları teker teker söker.**\n\n` +
            `1. **Muhtaçlığı Öğrenmek:** Kendi şehrinde unvanın ve çevren seni korur. Gurbette ise bir yabancının ikram ettiği sıcak çorbaya ve gösterdiği doğru yola muhtaçsın. Bu, nefsi tevazuya alıştırır.\n` +
            `2. **Farklılığa Tahammül:** Yüz bin kilometreyi aşan yolda başka mezhepler, başka âdetler ve başka iklimler gördüm. Yol, insana peşin hükmü bırakıp dinlemeyi öğretir.\n` +
            `3. **Güven ve Tevekkül:** Yarın nerede konaklayacağını bilmeden yola devam etmek, nefsin aşırı kontrol arzusunu kırar; kalbe sarsılmaz bir metanet verir.`
          );
        case 'ibn_arabi':
          return (
            `### 🕯️ Kitâbü’l-İsfâr’dan: Sefer ve Nefsin Arınması\n\n` +
            `Bil ki sefer kelimesi (s-f-r) Arapçada *“örtüyü açmak, sabahın aydınlanması”* demektir. Yolculuk, nefsin alışkanlıklarla ördüğü kalın perdeleri aralar.\n\n` +
            `- **Alışkanlık Putunu Kırmak:** Nefis, bildiği mekânlara ve tekrarlara yaslanarak uyuşur. Yolculuk mekânı değiştirince nefis uyanır; insan kendisiyle ilk kez baş başa kalır.\n` +
            `- **Zahirden Batına Geçiş:** Taşları ve mesafeleri aşarken asıl aşman gereken şey, içindeki korku, acele ve benlik iddiasıdır.\n\n` +
            `> *“Dışarıdaki sefer, içerideki perdeleri kaldırıyorsa hakiki seferdir; yoksa sadece bedeni bir yerden bir yere taşımaktır.”*`
          );
        case 'yunus':
          return (
            `### 🌾 Yunus’un Diliyle: Yol ve Nefis\n\n` +
            `Canım kardeşim, yol dediğin ayağın bastığı toprak değil, **gönlün eğildiği eşiktir**. İnsan kendi nefsini terbiye etmek isterse yola revân olsun ama gözünü yere, gönlünü insana indirsin.\n\n` +
            `> *“Yol odur ki doğru vara, göz odur ki Hakk’ı göre / Er odur alçakta dura, yüceden bakan göz değil.”*\n\n` +
            `- Yolda açlık da olur, yorgunluk da. Nefis “Ben büyüğüm” derken yol ona “Sen de bir garip yolcusun” der.\n` +
            `- Bir köylüden içtiğin bir tas ayran, bir dergâhta dinlediğin bir güzel söz, nefsinin katılığını yumuşatır; seni hamlıktan pişkinliğe geçirir.`
          );
        case 'ibn_haldun':
          return (
            `### 📐 Mukaddime Perspektifinden: Hareket ve İrade\n\n` +
            `Umran ilminde temel bir kanun vardır: **Aşırı yerleşik konfor (*hadarîlik*), zamanla insanın iradesini ve dayanıklılığını gevşetir.** Yolculuk ise insana yeniden *bedevî* (dinamik, tedbirli, dirençli) bir ruh kazandırır.\n\n` +
            `1. **Uyum Yeteneği:** Sürekli yeni iklimlere ve toplumsal yapılara giren bireyin aklı keskinleşir; dar çevre kalıplarından kurtulur.\n` +
            `2. **Nefis Disiplini:** Belirsizliği yönetmek, bütçeyi, zamanı ve enerjiyi planlamak nefsi hevâdan çıkarıp akıl ve irade disiplinine sokar.`
          );
        case 'council':
        default:
          return (
            `### 🌟 Beşli Meclis: Yolculuk Nefsi Nasıl Terbiye Eder?\n\n` +
            `#### 📜 Evliya Çelebi\n` +
            `Konak rahatını terk edip yolun meşakkatine talip olanın kibri dökülür; her menzilde gördüğü yeni güzelliklerle kalbinde *hayret makamı* uyanır.\n\n` +
            `#### 🌍 İbn Battûta\n` +
            `Gurbette insan kendi unvanından soyunur; bir yudum suya, bir kervansaray kapısına muhtaç kaldıkça kardeşliği ve şükrü iliklerine kadar öğrenir.\n\n` +
            `#### 🕯️ Muhyiddin İbnü’l-Arabî\n` +
            `Alışkanlıkların uyuşturduğu nefis, seferle uyanır. Zahiri mesafeler, insanın kendi içindeki benlik perdesini kaldırmak için birer vesiledir.\n\n` +
            `#### 🌾 Yunus Emre\n` +
            `Yol, ham gönlü pişiren ocaktır kardeşim. İnsan yolda “ben” demeyi unutur, “biz” ve “dost” demeyi öğrenir.\n\n` +
            `#### 📐 İbn Haldûn\n` +
            `Konforun uyuşturduğu irade, seyahatin gerektirdiği tedbir, sabır ve hareketlilik sayesinde yeniden bilenir; insan hem dayanıklı hem mütefekkir olur.\n\n` +
            `#### 🌟 Meclisin Ortak Hülâsası\n` +
            `Yolculuk, nefsin alışkanlıklarını kırarak onu **tevazu, sabır, hayret ve irade** ile yeniden yoğuran büyük bir mekteptir.`
          );
      }
    }

    // 3) "Bir şehirde 5 gün kalmanın hikmeti nedir?"
    if (qNorm.includes('5 gun') || qNorm.includes('bes gun') || qNorm.includes('kalmanin hikmeti')) {
      switch (persona.id) {
        case 'evliya':
          return (
            `### 📜 Bir Şehirde 5 Gün Kalmanın Seyahatnâme Hikmeti\n\n` +
            `Ey azîz dost! Bir şehirden rüzgâr gibi geçip bir günde resim çekip gidenler, o şehrin yalnızca taş duvarını görür; ruhuna nazar edemezler. **Beş gün ise tam kıvamında bir müşahede müddetidir:**\n\n` +
            `1. **İlk Gün:** Şehre varış, abdest alıp büyük camiin avlusunda soluklanma ve sokakların kokusunu duyma günüdür.\n` +
            `2. **İkinci ve Üçüncü Gün:** Şehrin *dârü’l-kütüb*’ünde (İl Halk Kütüphanesi) zihni derleyip toparlama, ikindi vakti çarşı esnafıyla hasbihâl etme vaktidir.\n` +
            `3. **Dördüncü Gün:** Artık yabancı değil, şehrin tanıdık bir yüzü olursun; sabah çorbasını aynı dükkânda içersin.\n` +
            `4. **Beşinci Gün:** Kalbinde ve defterinde demlenenleri yazıya döküp şehre veda etme zamanıdır. Ne bıkkınlık verecek kadar uzun, ne sığ kalacak kadar kısadır!`
          );
        case 'ibn_battuta':
          return (
            `### 🌍 Rihle’de Konaklama Usulü: Neden 5 Gün?\n\n` +
            `Yolculuklarımda bir kervansarayda tek gece kalıp göçenlerle ilim meclisine oturup birkaç gün soluklananlar arasındaki farkı çok gördüm. İslâm seyahat âdâbında bile misafirliğin hakkı en az üç gündür; **beş gün ise şehrin nabzını tutmanın sırrıdır.**\n\n` +
            `- Birinci gün yol yorgunluğunu atarsın.\n` +
            `- Orta günlerde o şehrin kütüphanesinde, çarşısında ve meydanında yaşayanların ritmine katılırsın.\n` +
            `- Beşinci gün ayrılırken arkanda sadece ayak izi değil, selâm verdiğin insanlar ve yazılmış sağlam notlar bırakırsın.`
          );
        case 'ibn_arabi':
          return (
            `### 🕯️ Beş Günün Sırrı: Hızdan Sükûnete Geçiş\n\n` +
            `Modern zamanın en büyük hastalığı *acele*dir; acele eden ise gördüğünün sırrına eremez. Bir şehirde **beş gün** kalmak, gözün aceleci bakışını kalbin derin tefekkürüne çevirir.\n\n` +
            `- İlk gün zihin yeni görüntülerin şaşkınlığı içindedir.\n` +
            `- Günler ilerledikçe dışarıdaki yenilik alışkanlığa değil, **aşinalığa** dönüşür. O vakit şehrin kütüphanesinde veya taş bir avluda kendi iç sesini işitmeye başlarsın.\n` +
            `- Beş vakit gibi beş gün de bir şehri devredip manasını devşirmenin ölçülü bir dairesidir.`
          );
        case 'yunus':
          return (
            `### 🌾 Beş Gün: Şehre Misafir Değil, Aşina Olmak\n\n` +
            `Kardeşim, bir gün kalıp geçersen **seyirci** olursun; beş gün kalırsan **konuk** olursun. Bir şehrin ekmeğini beş sabah bölüşen, artık o şehrin türküsüne kulak vermiş demektir.\n\n` +
            `- İlk gün bakarsın, ikinci gün tanırsın, üçüncü gün ısınırsın, dördüncü gün dertleşirsin, beşinci gün helâlleşip yola düşersin.\n` +
            `- Ne hızlı koş ki güzelliği çiğneyesin, ne de bir yerde çakılıp yolculuğu unutasın. Beş gün tam gönül kararıdır!`
          );
        case 'ibn_haldun':
          return (
            `### 📐 Umran Açısından 5 Gün Kuralı\n\n` +
            `Bir yerleşimi sosyolojik olarak kavramak için tek günlük yüzeysel temas yanıltıcıdır; zira ilk izlenim daima istisnalara takılır. **Beş gün** ise bir şehrin gündelik döngüsünü gözlemlemek için rasyonel bir eşiktir:\n\n` +
            `1. Haftalık ticaret, çalışma ve sosyal akış ritmini görürsün.\n` +
            `2. Kendi üretim/çalışma disiplinini (örneğin günde birkaç saat kütüphane mesaisini) bozmadan şehre entegre olursun.\n` +
            `3. *Tüketici turist* konumundan çıkıp, o şehrin imkânlarıyla *üreten misafir* mertebesine yükselirsin.`
          );
        case 'council':
        default:
          return (
            `### 🌟 Beşli Meclis: Bir Şehirde 5 Gün Kalmanın Hikmeti\n\n` +
            `#### 📜 Evliya Çelebi\n` +
            `Bir günde geçilen şehrin sadece adı yazılır; beş günde ise suyunun tadı, çarşısının sedası ve halkının letafeti Seyahatnâme’ye işlenir.\n\n` +
            `#### 🌍 İbn Battûta\n` +
            `Yol yorgunluğunu atıp şehrin insanıyla selâmlaşmak ve ilim meclisinde soluklanmak için üç gün başlangıç, beş gün kemâldir.\n\n` +
            `#### 🕯️ Muhyiddin İbnü’l-Arabî\n` +
            `Beş gün, zahiri merakın durulup batıni tefekkürün başladığı süredir; aceleci bakışı kalbin sükûnetine dönüştürür.\n\n` +
            `#### 🌾 Yunus Emre\n` +
            `Bir gün duran yabancı kalır, beş gün kalan o şehrin çorbasından içip gönlüne aşina olur.\n\n` +
            `#### 📐 İbn Haldûn\n` +
            `Beş günlük konaklama, şehri bir tüketim nesnesi olmaktan çıkarır; hem şehrin sosyal dokusunu hem kendi çalışma disiplinini birleştiren verimli bir umran modeli kurar.\n\n` +
            `#### 🌟 Meclisin Ortak Hülâsası\n` +
            `5 Gün Kuralı; **yavaşlamak, derinleşmek, kütüphanede üretmek ve şehre yüzeysel değil kalpten dokunmak** demektir.`
          );
      }
    }

    // 4) "Modern çağda kalabalık içinde yalnızlık (Halvet der Encümen) nasıl korunur?"
    if (qNorm.includes('halvet') || qNorm.includes('kalabalik') || qNorm.includes('yalnizlik') || qNorm.includes('modern')) {
      switch (persona.id) {
        case 'evliya':
          return (
            `### 📜 Kalabalık Çarşıda Gönül Halveti\n\n` +
            `Ey azîz refîk! Ben ki İstanbul’un Bedesten’inden Kahire’nin kalabalık sokaklarına kadar nice mahşerî çarşılarda gezdim; şunu gördüm ki **kalabalık bedene değer, lâkin gönül kapısını içeriden kilitlemek senin elindedir.**\n\n` +
            `- Çarşının sesini seyret ama gürültüsünü içine alma; tıpkı bir nehrin kenarında oturup akışı temaşa eden arif gibi.\n` +
            `- Gün içinde mutlaka bir *dârü’l-kütüb* (kütüphane) köşesine yahut tenha bir cami şadırvanına çekilip kaleminle baş başa kal. O bir saatlik halvet, bütün günün gürültüsünü yıkar.`
          );
        case 'ibn_battuta':
          return (
            `### 🌍 Yabancı Kalabalıklar İçinde İçsel Denge\n\n` +
            `On binlerce fersah yolda bazen kalabalık kervanların, bazen liman şehirlerinin ortasında tek başımaydım. Gördüm ki insanın en sahici sığınağı, **gittiği her yerde taşıdığı günlük ritüelidir.**\n\n` +
            `- Sabah erken saatte herkes uyanmadan yola veya okumaya oturmak.\n` +
            `- Gürültü arttığında gözünü elindeki kitaba veya seyahat defterine çevirmek.\n` +
            `- Kalabalıkla nezaketle selâmlaşıp, iç dünyandaki sessiz odayı kimseye çiğnetmemek.`
          );
        case 'ibn_arabi':
          return (
            `### 🕯️ Halvet der Encümen: Kalabalık İçinde Hak ile Baş Başa\n\n` +
            `Bu kadim düstur, *“El kârda, gönül yârda”* sırrının ta kendisidir. Mağaraya çekilip susmak kolaydır; asıl hüner, **çarşının ve ekranların uğultusu ortasında kalbin mihrabını temiz tutabilmektir.**\n\n` +
            `1. **Dikkat Bekçiliği:** Her sese ve her habere gönül kapısını açan, içeride dağılır. Gerekli olana bak, lüzumsuz olanı sükûtla geç.\n` +
            `2. **Niyet Bütünlüğü:** İster kod yaz, ister oku, ister yürü; yaptığın işi dağınık bir telaşla değil, *huzur* bilinciyle yap.\n\n` +
            `> *“Hakiki halvet duvarların arasında değil, dikkatin ve kalbin toplandığı yerdedir.”*`
          );
        case 'yunus':
          return (
            `### 🌾 Kalabalıkta Gönlü Duru Tutmak\n\n` +
            `Canım kardeşim, bugün herkesin elinde bir gürültü kutusu, herkesin zihninde bin türlü telaş var. Ama su bulanınca dibi görünmez olur; durulmak gerek.\n\n` +
            `> *“Bir ben vardır bende benden içeru…”*\n\n` +
            `- Kalabalığın içinde yürü ama yüreğini öfkeye, yarışa, gösterişe kaptırma.\n` +
            `- Her gün kendine bir sessiz köşe ayır; bir bardak çay, birkaç satır hakikatli söz ve şükür nefesi, dünyanın bütün kalabalığını dinginleştirir.`
          );
        case 'ibn_haldun':
          return (
            `### 📐 Bilgi Çağında Dikkat Ekonomisi ve Halvet\n\n` +
            `Hadarî (şehirli ve yoğun iletişimli) toplumların en büyük riski, bireyin **zihinsel özerkliğini** kalabalıkların akıntısına kaptırmasıdır. *Halvet der encümen*, modern çağda bilişsel disiplini koruma sanatıdır.\n\n` +
            `1. **Mekân ve Zaman Sınırı:** Kalabalık şehirde çalışırken kütüphane gibi odak kurumlarını bilinçli olarak seçmek.\n` +
            `2. **Derin Üretim:** Sürekli tüketen kalabalığın aksine, sakin bir masada okuyup yazarak ve not tutarak kendi fikrî omurganı korumak.`
          );
        case 'council':
        default:
          return (
            `### 🌟 Beşli Meclis: Modern Çağda *Halvet der Encümen*\n\n` +
            `#### 📜 Evliya Çelebi\n` +
            `Çarşıların gürültüsünü dışarıda seyret, lâkin her gün bir kütüphane köşesinde kaleminle baş başa kalacağın sakin bir vaha kur.\n\n` +
            `#### 🌍 İbn Battûta\n` +
            `Kalabalık şehirlerde seni koruyan şey sabah disiplinin ve günlük not defterindir; ritmini koruyan seyyah kalabalıkta kaybolmaz.\n\n` +
            `#### 🕯️ Muhyiddin İbnü’l-Arabî\n` +
            `Halvet mağaraya kaçmak değil, dikkatin dağınıklığını toplayıp her ânı huzur bilinciyle yaşamaktır.\n\n` +
            `#### 🌾 Yunus Emre\n` +
            `Dışın halkla sohbet ederken için Hakk ile sükûnet bulsun; yarıştan ve gürültüden çekilip kendi iç pınarını temiz tut.\n\n` +
            `#### 📐 İbn Haldûn\n` +
            `Modern şehrin en kıymetli sermayesi odaklanmış akıldır; kalabalık içinde kütüphane ve tefekkür disiplini kuran birey çağını aşar.\n\n` +
            `#### 🌟 Meclisin Ortak Hülâsası\n` +
            `*Halvet der Encümen*; dünyaya sırt dönmeden, **dikkatini, mekânını ve niyetini koruyarak kalabalık içinde berrak kalabilmektir.**`
          );
      }
    }

    // 5) General / Custom user question fallback (incorporating city context if chosen!)
    const cityAddition = cityObj
      ? `\n\n*(Bu sözü bilhassa **${cityObj.name} [${formatPlate(cityObj.plate)}]** menzilinin hatırasıyla söyledim; oradaki **${(cityObj.landmarks && cityObj.landmarks[0]) || 'kadim sokaklar'}** ve **${stripMdInline(cityObj.custom_library || cityObj.library || 'İl Halk Kütüphanesi')}** bu tefekkürün canlı şahididir.)*`
      : '';

    switch (persona.id) {
      case 'evliya':
        return (
          `### 📜 Evliya Çelebi’nin Cevabı\n\n` +
          `Ey azîz refîk-i sefer! Sorduğun **“${question}”** suali, seyahat defterimin en mühim varaklarına dokunur. ` +
          `Ben nice diyarlar gezdim; gördüm ki insan ne kadar uzağa giderse gitsin, aradığı hikmet aslında **dikkatle bakmakta** gizlidir. ` +
          `Bir çeşmenin kitabesini okumak, bir kütüphanede diz çöküp çalışmak ve akşam bir garip sofrasında hal hatır sormak; işte ömrü bereketlendiren asıl hazine budur.` +
          cityAddition
        );
      case 'ibn_battuta':
        return (
          `### 🌍 İbn Battûta’nın Rihle Nazarından\n\n` +
          `Güzel bir sual sordun yol arkadaşım: **“${question}”**. ` +
          `Yirmi dokuz yıllık seferimde öğrendim ki, insanın karşısına çıkan her mesele yolda sabırla ve danışmayla çözülür. ` +
          `Gurbette acele etmeyen, ilim meclisini ve Ahî muhabbetini arayan kişi hem yolunu bulur hem de gönlünü zenginleştirir.` +
          cityAddition
        );
      case 'ibn_arabi':
        return (
          `### 🕯️ İbnü’l-Arabî’nin İrfan Meclisinden\n\n` +
          `Sualin (**“${question}”**) zahirden batına açılan bir kapıdır ey yolcu. ` +
          `*Kitâbü’l-İsfâr*’da işaret ettiğimiz üzere, dışarıda aradığın cevabın bir benzeri kendi kalbinin içinde zaten yazılıdır. ` +
          `Sükûnetle dinle, gördüğün her mekânı bir işaret (âyet) bilerek oku; o zaman yolun kendisi sana muallim olur.` +
          cityAddition
        );
      case 'yunus':
        return (
          `### 🌾 Yunus Emre’nin Gönül Sözü\n\n` +
          `Canım kardeşim, **“${question}”** diye sorarsın; güzel sorarsın. ` +
          `Bizim kapıda uzun söz gerekmez: niyetin halis, dilin tatlı, gönlün alçak olursa her adımın ibadettir. ` +
          `> *“Sevelim, sevilelim; bu dünya kimseye kalmaz.”* ` +
          `Yürüdüğün yollarda hem kendi içine bak hem de rastladığın her cana tebessüm et.` +
          cityAddition
        );
      case 'ibn_haldun':
        return (
          `### 📐 İbn Haldûn’un Umran Çözümlemesi\n\n` +
          `**“${question}”** meselesini *Mukaddime* metodolojisiyle ele alırsak, bireyin tecrübesi ile coğrafya ve tarihî birikim birbirinden ayrı düşünülemez. ` +
          `Bir seyyah için en sağlıklı yol; gezdiği mekânların maddî koşullarını gözlemlerken, kendi ilim ve çalışma disiplinini (hadarî düzenini) istikrarlı biçimde sürdürmesidir.` +
          cityAddition
        );
      case 'council':
      default:
        return (
          `### 🌟 Beşli Meclis’ten “${question}” Üzerine\n\n` +
          `#### 📜 Evliya Çelebi\n` +
          `Her meseleye hayret ve zarafet gözüyle bakmalı; yolun güzelliğini de meşakkatini de hikmetle kayda geçirmelidir.\n\n` +
          `#### 🌍 İbn Battûta\n` +
          `Tecrübe, farklı beldelerden insanların hikmetini dinleyip kendi yol azığına katmakla olgunlaşır.\n\n` +
          `#### 🕯️ Muhyiddin İbnü’l-Arabî\n` +
          `Dışarıdaki her soru, insanı kendi içindeki hakikate uyandırmak için sorulur; cevap kalbin berraklığındadır.\n\n` +
          `#### 🌾 Yunus Emre\n` +
          `Sözün özü sevgidir, tevazudur; hangi şehre gidersen git gönül yapmaya bak kardeşim.\n\n` +
          `#### 📐 İbn Haldûn\n` +
          `Coğrafya ve tarihî koşullar zemini hazırlar; insan ise akıl, emek ve sebatla bu zeminden medeniyet ve anlam üretir.` +
          cityAddition
        );
    }
  }

  // ---------------------------------------------------------------------------
  // Scoped CSS (Dark Cyber-Sufi Glassmorphism + Light Theme Support)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .hm-root {
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding-bottom: 32px;
        animation: hmFadeIn 0.35s ease;
      }

      @keyframes hmFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Hero Banner */
      .hm-hero {
        position: relative;
        overflow: hidden;
        border-radius: 22px;
        padding: 24px 26px;
        background:
          radial-gradient(circle at 6% 12%, rgba(245, 158, 11, 0.16), transparent 44%),
          radial-gradient(circle at 92% 18%, rgba(168, 85, 247, 0.14), transparent 46%),
          radial-gradient(circle at 55% 100%, rgba(0, 242, 254, 0.1), transparent 50%),
          var(--bg-card, rgba(15, 23, 42, 0.85));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        box-shadow: var(--shadow-subtle, 0 12px 32px rgba(0, 0, 0, 0.42));
      }

      .hm-hero-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .hm-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 0.74rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.32);
        margin-bottom: 10px;
      }

      .hm-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: clamp(1.42rem, 2.5vw, 2.02rem);
        font-weight: 800;
        line-height: 1.2;
        color: var(--text-primary, #f8fafc);
        margin: 0 0 8px 0;
      }

      .hm-subtitle {
        font-size: 0.94rem;
        line-height: 1.55;
        color: var(--text-secondary, #94a3b8);
        max-width: 780px;
      }

      .hm-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: 999px;
        font-size: 0.79rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        white-space: nowrap;
      }

      .hm-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.75);
      }

      .hm-status-dot.offline {
        background: #f59e0b;
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.7);
      }

      /* Sage Selector Grid */
      .hm-sage-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 10px;
      }

      .hm-sage-card {
        position: relative;
        cursor: pointer;
        text-align: left;
        padding: 13px 13px 12px;
        border-radius: 16px;
        background: var(--bg-card, rgba(15, 23, 42, 0.78));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.11));
        color: var(--text-primary, #f8fafc);
        display: flex;
        flex-direction: column;
        gap: 6px;
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      }

      .hm-sage-card:hover {
        transform: translateY(-2px);
        border-color: var(--hm-accent, #f59e0b);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
      }

      .hm-sage-card.active {
        background:
          linear-gradient(155deg, var(--hm-accent-soft, rgba(245, 158, 11, 0.18)) 0%, rgba(15, 23, 42, 0.92) 78%);
        border-color: var(--hm-accent, #f59e0b);
        box-shadow: 0 0 0 1px var(--hm-accent, #f59e0b), 0 12px 26px rgba(0, 0, 0, 0.35);
      }

      .hm-sage-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .hm-sage-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
        background: var(--hm-accent-soft, rgba(245, 158, 11, 0.16));
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .hm-sage-era {
        font-size: 0.69rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        padding: 2px 7px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .hm-sage-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.88rem;
        font-weight: 800;
        line-height: 1.22;
        color: var(--text-primary, #f8fafc);
      }

      .hm-sage-work {
        font-size: 0.74rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.3;
      }

      /* Main 2-Column Studio Workspace */
      .hm-workspace {
        display: grid;
        grid-template-columns: 330px minmax(0, 1fr);
        gap: 18px;
        align-items: start;
      }

      .hm-sidebar {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .hm-panel {
        border-radius: 18px;
        padding: 16px;
        background: var(--bg-card, rgba(15, 23, 42, 0.82));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.11));
        box-shadow: var(--shadow-subtle, 0 10px 26px rgba(0, 0, 0, 0.34));
      }

      .hm-panel-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.92rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        margin-bottom: 10px;
      }

      .hm-sage-bio-motto {
        font-size: 0.84rem;
        line-height: 1.52;
        font-style: italic;
        color: var(--text-primary, #f8fafc);
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.45);
        border-left: 3px solid var(--hm-accent, #f59e0b);
        margin-bottom: 10px;
      }

      .hm-trait-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .hm-trait-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 4px 9px;
        border-radius: 999px;
        background: var(--hm-accent-soft, rgba(245, 158, 11, 0.14));
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-primary, #f8fafc);
      }

      /* 81-Province Context Selector */
      .hm-city-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .hm-input,
      .hm-select {
        width: 100%;
        border-radius: 11px;
        padding: 9px 11px;
        font-family: inherit;
        font-size: 0.84rem;
        color: var(--text-primary, #f8fafc);
        background: rgba(10, 15, 29, 0.72);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        outline: none;
        transition: border-color 0.2s ease;
      }

      .hm-input:focus,
      .hm-select:focus {
        border-color: var(--accent-cyan, #00f2fe);
      }

      .hm-city-btn-row {
        display: flex;
        gap: 7px;
      }

      .hm-mini-btn {
        flex: 1;
        cursor: pointer;
        border-radius: 10px;
        padding: 7px 10px;
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        transition: all 0.18s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }

      .hm-mini-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
      }

      .hm-city-preview {
        margin-top: 10px;
        border-radius: 13px;
        padding: 11px 12px;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid rgba(0, 242, 254, 0.22);
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .hm-city-preview-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .hm-city-preview-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-weight: 800;
        font-size: 0.92rem;
        color: var(--text-primary, #f8fafc);
      }

      .hm-city-status {
        font-size: 0.69rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.15);
        color: var(--text-secondary, #94a3b8);
      }

      .hm-city-status.visited {
        background: rgba(16, 185, 129, 0.16);
        color: #34d399;
      }

      .hm-city-preview-meta {
        font-size: 0.77rem;
        line-height: 1.45;
        color: var(--text-secondary, #94a3b8);
      }

      .hm-city-open-btn {
        cursor: pointer;
        border: 1px solid rgba(0, 242, 254, 0.32);
        background: rgba(0, 242, 254, 0.1);
        color: var(--accent-cyan, #00f2fe);
        border-radius: 9px;
        padding: 6px 10px;
        font-size: 0.76rem;
        font-weight: 700;
        text-align: center;
        transition: all 0.18s ease;
      }

      .hm-city-open-btn:hover {
        background: rgba(0, 242, 254, 0.22);
      }

      /* Quick Prompt Chips */
      .hm-prompts-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .hm-prompt-chip {
        cursor: pointer;
        text-align: left;
        border-radius: 12px;
        padding: 9px 11px;
        font-size: 0.8rem;
        line-height: 1.4;
        font-weight: 600;
        color: var(--text-primary, #f8fafc);
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        align-items: flex-start;
        gap: 8px;
        transition: all 0.18s ease;
      }

      .hm-prompt-chip:hover:not(:disabled) {
        border-color: var(--hm-accent, #f59e0b);
        background: var(--hm-accent-soft, rgba(245, 158, 11, 0.14));
        transform: translateX(2px);
      }

      .hm-prompt-chip:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      /* Dialogue / Chat Panel */
      .hm-chat-panel {
        display: flex;
        flex-direction: column;
        border-radius: 20px;
        background: var(--bg-card, rgba(15, 23, 42, 0.84));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        box-shadow: var(--shadow-subtle, 0 14px 34px rgba(0, 0, 0, 0.38));
        overflow: hidden;
        min-height: 580px;
      }

      .hm-chat-header {
        padding: 14px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(10, 15, 29, 0.48);
      }

      .hm-chat-persona {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .hm-chat-avatar {
        width: 42px;
        height: 42px;
        border-radius: 13px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        background: var(--hm-accent-soft, rgba(245, 158, 11, 0.16));
        border: 1px solid var(--hm-accent, #f59e0b);
      }

      .hm-chat-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .hm-chat-role {
        font-size: 0.77rem;
        color: var(--text-secondary, #94a3b8);
      }

      .hm-chat-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .hm-action-btn {
        cursor: pointer;
        border-radius: 10px;
        padding: 7px 11px;
        font-size: 0.77rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        transition: all 0.18s ease;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .hm-action-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
      }

      .hm-action-btn.stop {
        border-color: rgba(239, 68, 68, 0.45);
        background: rgba(239, 68, 68, 0.14);
        color: #fca5a5;
      }

      .hm-messages {
        flex: 1;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-height: 540px;
        overflow-y: auto;
      }

      .hm-msg {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-width: 90%;
      }

      .hm-msg.user {
        align-self: flex-end;
        align-items: flex-end;
      }

      .hm-msg.model {
        align-self: flex-start;
        align-items: flex-start;
        width: 100%;
        max-width: 94%;
      }

      .hm-msg-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.73rem;
        color: var(--text-secondary, #94a3b8);
      }

      .hm-msg-source {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 999px;
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.25);
        color: var(--accent-cyan, #00f2fe);
      }

      .hm-msg-source.offline {
        background: rgba(245, 158, 11, 0.14);
        border-color: rgba(245, 158, 11, 0.3);
        color: var(--accent-gold, #f59e0b);
      }

      .hm-bubble {
        border-radius: 16px;
        padding: 14px 16px;
        font-size: 0.91rem;
        line-height: 1.66;
        color: var(--text-primary, #f8fafc);
        word-break: break-word;
      }

      .hm-msg.user .hm-bubble {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.18), rgba(79, 172, 254, 0.2));
        border: 1px solid rgba(0, 242, 254, 0.32);
        border-bottom-right-radius: 5px;
      }

      .hm-msg.model .hm-bubble {
        width: 100%;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.11));
        border-left: 3px solid var(--hm-accent, #f59e0b);
        border-top-left-radius: 5px;
      }

      /* Markdown Typography Inside Bubbles */
      .hm-bubble .seyyah-md-h1,
      .hm-bubble .seyyah-md-h2,
      .hm-bubble .seyyah-md-h3,
      .hm-bubble .seyyah-md-h4 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        margin: 10px 0 6px;
        color: var(--text-primary, #f8fafc);
        line-height: 1.3;
      }

      .hm-bubble .seyyah-md-h3:first-child,
      .hm-bubble .seyyah-md-h4:first-child {
        margin-top: 0;
      }

      .hm-bubble .seyyah-md-p {
        margin: 0 0 9px;
      }

      .hm-bubble .seyyah-md-p:last-child {
        margin-bottom: 0;
      }

      .hm-bubble .seyyah-md-quote {
        margin: 8px 0 10px;
        padding: 8px 12px;
        border-radius: 10px;
        border-left: 3px solid var(--hm-accent, #f59e0b);
        background: rgba(255, 255, 255, 0.04);
        font-style: italic;
        color: var(--text-primary, #f8fafc);
      }

      .hm-bubble .seyyah-md-list {
        margin: 6px 0 10px 18px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .hm-bubble code {
        padding: 1px 5px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.08);
        font-size: 0.85em;
      }

      .hm-stream-cursor {
        display: inline-block;
        width: 8px;
        height: 15px;
        margin-left: 4px;
        vertical-align: middle;
        border-radius: 2px;
        background: var(--hm-accent, #f59e0b);
        animation: hmBlink 0.9s infinite;
      }

      @keyframes hmBlink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0.15; }
      }

      .hm-msg-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        width: 100%;
      }

      .hm-mentioned-cities {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
      }

      .hm-city-tag-btn {
        cursor: pointer;
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.1);
        border: 1px solid rgba(0, 242, 254, 0.28);
        transition: all 0.18s ease;
      }

      .hm-city-tag-btn:hover {
        background: rgba(0, 242, 254, 0.22);
      }

      .hm-copy-msg-btn {
        cursor: pointer;
        border-radius: 8px;
        padding: 3px 9px;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.18s ease;
      }

      .hm-copy-msg-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: var(--border-glow, rgba(0, 242, 254, 0.35));
      }

      /* Composer */
      .hm-composer {
        padding: 14px 16px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(10, 15, 29, 0.5);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .hm-composer-context-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      .hm-composer-row {
        display: flex;
        gap: 10px;
        align-items: flex-end;
      }

      .hm-textarea {
        flex: 1;
        min-height: 52px;
        max-height: 140px;
        resize: vertical;
        border-radius: 13px;
        padding: 11px 13px;
        font-family: inherit;
        font-size: 0.89rem;
        line-height: 1.48;
        color: var(--text-primary, #f8fafc);
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        outline: none;
        transition: border-color 0.2s ease;
      }

      .hm-textarea:focus {
        border-color: var(--hm-accent, #f59e0b);
      }

      .hm-send-btn {
        cursor: pointer;
        height: 48px;
        padding: 0 20px;
        border-radius: 13px;
        border: none;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.88rem;
        font-weight: 800;
        color: #061224;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 55%, #00f2fe 100%);
        box-shadow: 0 8px 22px rgba(245, 158, 11, 0.26);
        transition: transform 0.18s ease, opacity 0.18s ease;
        white-space: nowrap;
      }

      .hm-send-btn:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      .hm-send-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      /* Light Theme Overrides */
      body.light-theme .hm-hero {
        background:
          radial-gradient(circle at 8% 12%, rgba(217, 119, 6, 0.1), transparent 44%),
          radial-gradient(circle at 92% 18%, rgba(124, 58, 237, 0.08), transparent 46%),
          rgba(255, 255, 255, 0.96);
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.07);
      }

      body.light-theme .hm-status-pill {
        background: #f1f5f9;
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      body.light-theme .hm-sage-card {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.11);
        color: #0f172a;
      }

      body.light-theme .hm-sage-card.active {
        background: linear-gradient(155deg, var(--hm-accent-soft, rgba(245, 158, 11, 0.16)) 0%, #ffffff 78%);
        box-shadow: 0 0 0 1px var(--hm-accent, #d97706), 0 12px 24px rgba(15, 23, 42, 0.09);
      }

      body.light-theme .hm-sage-era {
        background: #f1f5f9;
        border-color: rgba(15, 23, 42, 0.1);
        color: #475569;
      }

      body.light-theme .hm-panel,
      body.light-theme .hm-chat-panel {
        background: rgba(255, 255, 255, 0.96);
        border-color: rgba(15, 23, 42, 0.11);
        box-shadow: 0 10px 26px rgba(15, 23, 42, 0.07);
      }

      body.light-theme .hm-sage-bio-motto {
        background: #f8fafc;
        color: #0f172a;
      }

      body.light-theme .hm-trait-badge {
        border-color: rgba(15, 23, 42, 0.1);
        color: #0f172a;
      }

      body.light-theme .hm-input,
      body.light-theme .hm-select,
      body.light-theme .hm-textarea {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      body.light-theme .hm-mini-btn,
      body.light-theme .hm-action-btn,
      body.light-theme .hm-prompt-chip {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      body.light-theme .hm-city-preview {
        background: #f8fafc;
        border-color: rgba(2, 132, 199, 0.25);
      }

      body.light-theme .hm-city-open-btn {
        color: #0284c7;
        background: rgba(2, 132, 199, 0.08);
        border-color: rgba(2, 132, 199, 0.28);
      }

      body.light-theme .hm-chat-header,
      body.light-theme .hm-composer {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.09);
      }

      body.light-theme .hm-msg.user .hm-bubble {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.12), rgba(37, 99, 235, 0.1));
        border-color: rgba(2, 132, 199, 0.28);
        color: #0f172a;
      }

      body.light-theme .hm-msg.model .hm-bubble {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.1);
        color: #0f172a;
      }

      body.light-theme .hm-bubble .seyyah-md-h1,
      body.light-theme .hm-bubble .seyyah-md-h2,
      body.light-theme .hm-bubble .seyyah-md-h3,
      body.light-theme .hm-bubble .seyyah-md-h4,
      body.light-theme .hm-bubble .seyyah-md-quote {
        color: #0f172a;
      }

      body.light-theme .hm-bubble .seyyah-md-quote {
        background: #f8fafc;
      }

      body.light-theme .hm-bubble code {
        background: #f1f5f9;
        color: #0f172a;
      }

      body.light-theme .hm-msg-source {
        color: #0284c7;
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.25);
      }

      body.light-theme .hm-msg-source.offline {
        color: #b45309;
        background: rgba(217, 119, 6, 0.1);
        border-color: rgba(217, 119, 6, 0.25);
      }

      body.light-theme .hm-city-tag-btn {
        color: #0284c7;
        background: rgba(2, 132, 199, 0.08);
        border-color: rgba(2, 132, 199, 0.26);
      }

      body.light-theme .hm-copy-msg-btn {
        border-color: rgba(15, 23, 42, 0.14);
        color: #475569;
      }

      body.light-theme .hm-action-btn.stop {
        color: #b91c1c;
        background: rgba(239, 68, 68, 0.1);
      }

      /* Meclis Müşaveresi (5 Bilge Ortak Divanı) */
      .hm-musavere-toggle {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 15px;
        border-radius: 12px;
        font-family: inherit;
        font-size: 0.84rem;
        font-weight: 700;
        color: #0f172a;
        background: linear-gradient(135deg, #fbbf24, #00f2fe);
        border: none;
        box-shadow: 0 8px 20px rgba(245, 158, 11, 0.22);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .hm-musavere-toggle:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 24px rgba(0, 242, 254, 0.28);
      }
      .hm-musavere-toggle.active {
        background: rgba(245, 158, 11, 0.18);
        color: #fde68a;
        border: 1px solid rgba(245, 158, 11, 0.48);
        box-shadow: none;
      }

      .hm-musavere-studio {
        border-radius: 20px;
        padding: 20px 22px;
        background: var(--bg-card, rgba(20, 30, 52, 0.78));
        border: 1px solid rgba(245, 158, 11, 0.32);
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .hm-musavere-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
      }

      .hm-musavere-head h2 {
        margin: 0 0 4px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.2rem;
        font-weight: 800;
      }

      .hm-musavere-head p {
        margin: 0;
        font-size: 0.86rem;
        color: var(--text-secondary, #94a3b8);
      }

      .hm-musavere-form {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .hm-musavere-form .hm-input {
        flex: 1 1 320px;
        min-height: 44px;
      }

      .hm-musavere-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .hm-musavere-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 14px;
      }

      .hm-musavere-card {
        border-radius: 16px;
        padding: 15px 16px;
        background: rgba(15, 23, 42, 0.56);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-top: 3px solid var(--hm-card-accent, #f59e0b);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .hm-musavere-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .hm-musavere-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-weight: 700;
        font-size: 0.96rem;
      }

      .hm-musavere-card-body {
        font-size: 0.86rem;
        line-height: 1.62;
        color: var(--text-secondary, #cbd5e1);
      }

      .hm-musavere-hulasa {
        border-radius: 16px;
        padding: 16px 18px;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(0, 242, 254, 0.1));
        border: 1px solid rgba(245, 158, 11, 0.38);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .hm-musavere-hulasa-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-weight: 800;
        font-size: 0.98rem;
      }

      body.light-theme .hm-musavere-toggle.active {
        color: #92400e;
        background: rgba(245, 158, 11, 0.16);
      }

      body.light-theme .hm-musavere-studio {
        background: #ffffff;
        border-color: rgba(180, 83, 9, 0.25);
        color: #0f172a;
      }

      body.light-theme .hm-musavere-card {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.1);
        color: #0f172a;
      }

      body.light-theme .hm-musavere-card-head {
        border-bottom-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .hm-musavere-card-body {
        color: #334155;
      }

      body.light-theme .hm-musavere-hulasa {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(2, 132, 199, 0.08));
        color: #0f172a;
      }

      /* Responsive Breakpoints */
      @media (max-width: 1180px) {
        .hm-sage-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      @media (max-width: 920px) {
        .hm-workspace {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .hm-sage-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .hm-hero {
          padding: 18px 16px;
        }
        .hm-composer-row {
          flex-direction: column;
          align-items: stretch;
        }
        .hm-send-btn {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Streaming Runner (Live Gemini SSE via SEYYAH_AI.stream + Offline Fallback)
  // ---------------------------------------------------------------------------
  function hasLiveAiKey() {
    return Boolean(
      global.SEYYAH_AI &&
      typeof global.SEYYAH_AI.hasKey === 'function' &&
      global.SEYYAH_AI.hasKey() &&
      typeof global.SEYYAH_AI.stream === 'function'
    );
  }

  async function streamOfflineWords(fullText, runId, onProgress) {
    const tokens = String(fullText || '').split(/(\s+)/);
    let acc = '';
    const batchSize = 3;
    for (let i = 0; i < tokens.length; i += batchSize) {
      if (uiState.streamRunId !== runId || !uiState.isStreaming) {
        return { aborted: true, text: acc };
      }
      acc += tokens.slice(i, i + batchSize).join('');
      onProgress(acc);
      await new Promise((resolve) => setTimeout(resolve, 22));
    }
    return { aborted: false, text: fullText };
  }

  // ---------------------------------------------------------------------------
  // Meclis Müşaveresi (5 Bilge Ortak Divanı) — Offline Synthesis & Live Parser
  // ---------------------------------------------------------------------------
  function buildMusavereOfflineResponses(question, cityObj, ctx) {
    const cards = {};
    SAGES.forEach((sage) => {
      cards[sage.id] = buildTopicOfflineResponse(sage, question, cityObj, ctx);
    });
    const citySuffix = cityObj ? ` (${cityObj.name} bağlamında)` : '';
    const hulasa =
      `Beş kadim bilge **“${question}”** sualine${citySuffix} kendi meşreplerinden bakarak ortak bir pusula çizdi:\n\n` +
      `- **Evliya Çelebi** gözlemin hayretini ve şehirlerin canlı ruhunu;\n` +
      `- **İbn Battûta** gurbette kardeşliği, kervansaray adabını ve ilim meclislerini;\n` +
      `- **İbnü’l-Arabî** zahirî adımın batınî sırrını ve perdelerin kalkışını (*isfâr*);\n` +
      `- **Yunus Emre** tevazuyu, duru dili ve gönül yapmayı;\n` +
      `- **İbn Haldûn** ise coğrafya, umran ve irade disiplinini öne çıkardı.\n\n` +
      `> *Ortak Hülâsa: Hakiki sefer; gözle ibret almak, kalple derinleşmek ve akılla medeniyeti okumak arasında kurulan ahenktir.*`;
    return {
      question: question,
      cityLabel: cityObj ? `${cityObj.name} (${formatPlate(cityObj.plate)})` : 'Anadolu Geneli',
      source: 'archive',
      model: '',
      cards: cards,
      hulasa: hulasa
    };
  }

  function parseMusavereAiResponse(rawText, fallbackObj) {
    const tags = [
      { id: 'evliya', marker: '===EVLIYA===' },
      { id: 'ibn_battuta', marker: '===IBN_BATTUTA===' },
      { id: 'ibn_arabi', marker: '===IBN_ARABI===' },
      { id: 'yunus', marker: '===YUNUS===' },
      { id: 'ibn_haldun', marker: '===IBN_HALDUN===' },
      { id: 'hulasa', marker: '===HULASA===' }
    ];
    const text = String(rawText || '');
    const positions = tags
      .map((t) => ({ id: t.id, marker: t.marker, idx: text.indexOf(t.marker) }))
      .filter((p) => p.idx >= 0)
      .sort((a, b) => a.idx - b.idx);

    const cards = Object.assign({}, fallbackObj.cards);
    let hulasa = fallbackObj.hulasa;

    for (let i = 0; i < positions.length; i++) {
      const cur = positions[i];
      const start = cur.idx + cur.marker.length;
      const end = i + 1 < positions.length ? positions[i + 1].idx : text.length;
      const slice = text.slice(start, end).trim();
      if (slice) {
        if (cur.id === 'hulasa') {
          hulasa = slice;
        } else {
          cards[cur.id] = slice;
        }
      }
    }
    return { cards: cards, hulasa: hulasa };
  }

  // ---------------------------------------------------------------------------
  // Main Studio Renderer
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const provincesList = getSortedProvinces(ctx);
    const provincesMap = getProvincesMap(ctx);

    // Ensure selected city key still exists
    if (uiState.selectedCityKey && !provincesMap[uiState.selectedCityKey]) {
      uiState.selectedCityKey = '';
    }

    const activePersona = getPersona(uiState.activeSageId);
    const messages = ensureConversation(uiState.activeSageId);
    const selectedCity = uiState.selectedCityKey ? provincesMap[uiState.selectedCityKey] : null;
    const liveKeyReady = hasLiveAiKey();

    function getFilteredProvinces() {
      const q = normTr(ctx, uiState.cityFilter);
      if (!q) return provincesList;
      return provincesList.filter((p) => {
        const nameMatch = normTr(ctx, p.name).includes(q);
        const regionMatch = normTr(ctx, p.region).includes(q);
        const plateMatch = formatPlate(p.plate).includes(q);
        return nameMatch || regionMatch || plateMatch;
      });
    }

    function buildMusavereHtml(cityPromptLabel) {
      const res = uiState.musavereResult;
      const sampleQuestions = [
        'Yolculuk insanın nefsini nasıl terbiye eder?',
        'Bir şehirde 5 gün kalmanın hikmeti nedir?',
        'Modern çağda kalabalık içinde yalnızlık (Halvet der Encümen) nasıl korunur?',
        selectedCity ? `${selectedCity.name} şehrinin ruhunu kendi üslubunla anlat` : cityPromptLabel
      ];

      return `
        <section class="hm-musavere-studio" aria-label="Meclis Müşaveresi — 5 Bilge Ortak Divanı">
          <div class="hm-musavere-head">
            <div>
              <h2>🤝 Meclis Müşaveresi (5 Bilge Ortak Divanı)</h2>
              <p>
                Tek bir sual sor; <strong>Evliya Çelebi</strong>, <strong>İbn Battûta</strong>, <strong>İbnü’l-Arabî</strong>,
                <strong>Yunus Emre</strong> ve <strong>İbn Haldûn</strong> yan yana kendi meşreplerinden cevaplasın.
                ${selectedCity ? ` · 📍 Aktif Şehir Bağlamı: <strong>${esc(ctx, selectedCity.name)}</strong>` : ''}
              </p>
            </div>
            <span class="hm-msg-source ${liveKeyReady ? '' : 'offline'}">
              ${liveKeyReady ? '⚡ Canlı Gemini Müşaveresi' : '📜 Çevrimdışı Klasik Sentez Motoru'}
            </span>
          </div>

          <div class="hm-musavere-form">
            <input
              type="text"
              id="hm-musavere-input"
              class="hm-input"
              placeholder="Beş bilgenin aynı anda istişare etmesini istediğin soruyu yaz..."
              value="${esc(ctx, uiState.musavereQuestion)}"
              ${uiState.musavereLoading ? 'disabled' : ''}
            />
            <button
              type="button"
              id="hm-musavere-submit"
              class="hm-send-btn"
              ${uiState.musavereLoading ? 'disabled' : ''}
            >
              ${uiState.musavereLoading ? '⏳ 5 Bilge İstişare Ediyor...' : '🤝 5 Bilgeye Sor'}
            </button>
          </div>

          <div class="hm-musavere-chips">
            ${sampleQuestions.map((q) => `
              <button
                type="button"
                class="hm-prompt-chip"
                data-hm-musavere-sample="${esc(ctx, q)}"
                ${uiState.musavereLoading ? 'disabled' : ''}
              >✨ ${esc(ctx, q)}</button>
            `).join('')}
          </div>

          ${
            uiState.musavereLoading
              ? `<div class="hm-musavere-hulasa"><strong>⏳ Beş kadim bilge sorunuzu tefekkür ediyor...</strong></div>`
              : res
                ? `
                  <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
                    <div style="font-size:0.88rem;">
                      <strong>Sual:</strong> “${esc(ctx, res.question)}”
                      <span style="opacity:0.75;">(${esc(ctx, res.cityLabel)})</span>
                    </div>
                    <button type="button" class="hm-mini-btn" id="hm-musavere-copy">📋 Tüm Müşavereyi Kopyala</button>
                  </div>

                  <div class="hm-musavere-grid">
                    ${SAGES.map((sage) => `
                      <article class="hm-musavere-card" style="--hm-card-accent:${esc(ctx, sage.accent)};">
                        <div class="hm-musavere-card-head">
                          <span class="hm-musavere-card-title">${sage.icon} ${esc(ctx, sage.shortTitle)}</span>
                          <span class="hm-sage-era">${esc(ctx, sage.era)}</span>
                        </div>
                        <div class="hm-musavere-card-body">
                          ${renderMdSafe(res.cards[sage.id] || '', ctx)}
                        </div>
                      </article>
                    `).join('')}
                  </div>

                  <div class="hm-musavere-hulasa">
                    <div class="hm-musavere-hulasa-head">
                      <span>🌟 Meclisin Ortak Hülâsası</span>
                      <span class="hm-msg-source ${res.source === 'gemini' ? '' : 'offline'}">
                        ${res.source === 'gemini' ? `⚡ Gemini AI${res.model ? ' · ' + esc(ctx, res.model) : ''}` : '📜 Kadim Külliyat Sentezi'}
                      </span>
                    </div>
                    <div class="hm-musavere-card-body">
                      ${renderMdSafe(res.hulasa, ctx)}
                    </div>
                  </div>
                `
                : `
                  <div class="hm-musavere-grid">
                    ${SAGES.map((sage) => `
                      <article class="hm-musavere-card" style="--hm-card-accent:${esc(ctx, sage.accent)};">
                        <div class="hm-musavere-card-head">
                          <span class="hm-musavere-card-title">${sage.icon} ${esc(ctx, sage.shortTitle)}</span>
                          <span class="hm-sage-era">${esc(ctx, sage.era)}</span>
                        </div>
                        <div class="hm-musavere-card-body">
                          <em>${esc(ctx, sage.motto)}</em>
                        </div>
                      </article>
                    `).join('')}
                  </div>
                `
          }
        </section>
      `;
    }

    function buildFullHtml() {
      const filteredProvs = getFilteredProvinces();
      const cityPromptLabel = selectedCity
        ? `${selectedCity.name} şehrinin ruhunu kendi üslubunla anlat`
        : 'Seçili şehrin ruhunu kendi üslubunla anlat';

      return `
        <div class="hm-root" style="--hm-accent:${esc(ctx, activePersona.accent)}; --hm-accent-soft:${esc(ctx, activePersona.accentSoft)};">
          <section class="hm-hero">
            <div class="hm-hero-top">
              <div>
                <div class="hm-eyebrow">📜 İrfan &amp; Seyahat Felsefesi Stüdyosu</div>
                <h1 class="hm-title">📜 Hikmet Meclisi: Kadim Seyyah ve Bilgelerle Felsefi Diyalog</h1>
                <p class="hm-subtitle">
                  Anadolu’nun 81 iline uzanan yolculuğunda 5 kadim bilgeden biriyle yahut Beşli Meclis ile sohbet et;
                  seçtiğin şehrin tarihini, kütüphane sükûnetini ve yolun hikmetini kendi özgün üsluplarından dinle.
                </p>
              </div>
              <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                <button
                  type="button"
                  class="hm-musavere-toggle ${uiState.musavereMode ? 'active' : ''}"
                  id="hm-toggle-musavere"
                >
                  ${uiState.musavereMode ? '← Tekil Bilge Sohbetine Dön' : '🤝 Meclis Müşaveresi (5 Bilge Ortak Divanı)'}
                </button>
                <div class="hm-status-pill" title="${liveKeyReady ? 'Gemini API anahtarı aktif' : 'API anahtarı bulunamadı — Kadim Külliyat çevrimdışı modu aktif'}">
                  <span class="hm-status-dot ${liveKeyReady ? '' : 'offline'}"></span>
                  <span>${liveKeyReady ? 'Canlı AI Akışı Hazır' : 'Çevrimdışı Hikmet Modu'}</span>
                </div>
              </div>
            </div>
          </section>

          ${uiState.musavereMode ? buildMusavereHtml(cityPromptLabel) : `
          <!-- 5 Sages + Council of Five Selector -->
          <section class="hm-sage-grid" aria-label="Bilge Seçimi">
            ${ALL_PERSONAS.map((sage) => {
              const isActive = sage.id === activePersona.id;
              return `
                <button
                  type="button"
                  class="hm-sage-card ${isActive ? 'active' : ''}"
                  data-hm-sage="${esc(ctx, sage.id)}"
                  style="--hm-accent:${esc(ctx, sage.accent)}; --hm-accent-soft:${esc(ctx, sage.accentSoft)};"
                >
                  <div class="hm-sage-head">
                    <span class="hm-sage-icon">${sage.icon}</span>
                    <span class="hm-sage-era">${esc(ctx, sage.era)}</span>
                  </div>
                  <div class="hm-sage-name">${esc(ctx, sage.shortTitle)}</div>
                  <div class="hm-sage-work">${esc(ctx, sage.work)}</div>
                </button>
              `;
            }).join('')}
          </section>

          <div class="hm-workspace">
            <!-- Left Sidebar: Sage Dossier + 81-Province Selector + Quick Prompts -->
            <aside class="hm-sidebar">
              <div class="hm-panel">
                <div class="hm-panel-title">
                  <span>${activePersona.icon} ${esc(ctx, activePersona.name)}</span>
                  <span class="hm-sage-era">${esc(ctx, activePersona.era)}</span>
                </div>
                <div class="hm-sage-bio-motto">${esc(ctx, activePersona.motto)}</div>
                <div class="hm-trait-list">
                  ${activePersona.traits.map((t) => `<span class="hm-trait-badge">${esc(ctx, t)}</span>`).join('')}
                </div>
              </div>

              <div class="hm-panel">
                <div class="hm-panel-title">
                  <span>🗺️ İl Bağlamı (Opsiyonel · 81 İl)</span>
                  <span class="hm-sage-era">${selectedCity ? formatPlate(selectedCity.plate) : 'Genel'}</span>
                </div>
                <div class="hm-city-controls">
                  <input
                    type="search"
                    class="hm-input"
                    id="hm-city-filter"
                    placeholder="İl, plaka veya bölge ara (ör. Konya, 27)..."
                    value="${esc(ctx, uiState.cityFilter)}"
                  />
                  <select class="hm-select" id="hm-city-select" aria-label="Şehir bağlamı seç">
                    <option value="">— Anadolu Geneli (Şehir Seçilmedi) —</option>
                    ${filteredProvs.map((p) => {
                      const plate = formatPlate(p.plate);
                      const mark = p.visited ? '✓ ' : '';
                      return `<option value="${esc(ctx, p.key)}" ${p.key === uiState.selectedCityKey ? 'selected' : ''}>${plate} · ${mark}${esc(ctx, p.name)} (${esc(ctx, p.region || '')})</option>`;
                    }).join('')}
                  </select>
                  <div class="hm-city-btn-row">
                    <button type="button" class="hm-mini-btn" id="hm-random-city">🎲 Rastgele İl</button>
                    <button type="button" class="hm-mini-btn" id="hm-clear-city" ${selectedCity ? '' : 'disabled'}>🧹 Temizle</button>
                  </div>
                </div>

                ${selectedCity ? `
                  <div class="hm-city-preview">
                    <div class="hm-city-preview-head">
                      <span class="hm-city-preview-title">${formatPlate(selectedCity.plate)} · ${esc(ctx, selectedCity.name)}</span>
                      <span class="hm-city-status ${selectedCity.visited ? 'visited' : ''}">${selectedCity.visited ? '✓ Gezildi' : 'Planlanan Menzil'}</span>
                    </div>
                    <div class="hm-city-preview-meta">
                      <strong>Bölge:</strong> ${esc(ctx, selectedCity.region || 'Anadolu')}<br />
                      <strong>Duraklar:</strong> ${esc(ctx, (selectedCity.landmarks || []).slice(0, 3).join(', ') || 'Belirtilmemiş')}
                    </div>
                    <button type="button" class="hm-city-open-btn" id="hm-open-city-detail">🔍 ${esc(ctx, selectedCity.name)} Dosyasını Aç</button>
                  </div>
                ` : ''}
              </div>

              <div class="hm-panel">
                <div class="hm-panel-title">
                  <span>✨ Hazır Hikmet Soruları</span>
                </div>
                <div class="hm-prompts-list">
                  ${QUICK_PROMPTS.map((qp) => {
                    const text = qp.isCityPrompt ? cityPromptLabel : qp.label;
                    return `
                      <button
                        type="button"
                        class="hm-prompt-chip"
                        data-hm-quick="${esc(ctx, qp.id)}"
                        ${uiState.isStreaming ? 'disabled' : ''}
                      >
                        <span>${qp.icon}</span>
                        <span>${esc(ctx, text)}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </aside>

            <!-- Right Main Chat Studio -->
            <section class="hm-chat-panel" aria-label="Felsefi Diyalog Akışı">
              <header class="hm-chat-header">
                <div class="hm-chat-persona">
                  <div class="hm-chat-avatar">${activePersona.icon}</div>
                  <div>
                    <div class="hm-chat-name">${esc(ctx, activePersona.name)}</div>
                    <div class="hm-chat-role">${esc(ctx, activePersona.roleBadge)}${selectedCity ? ` · 📍 ${esc(ctx, selectedCity.name)} Bağlamı Aktif` : ''}</div>
                  </div>
                </div>
                <div class="hm-chat-actions">
                  ${uiState.isStreaming ? `<button type="button" class="hm-action-btn stop" id="hm-stop-stream">⏹️ Durdur</button>` : ''}
                  <button type="button" class="hm-action-btn" id="hm-export-md">📥 Diyaloğu İndir</button>
                  <button type="button" class="hm-action-btn" id="hm-reset-chat">🗑️ Meclisi Sıfırla</button>
                </div>
              </header>

              <div class="hm-messages" id="hm-messages-list">
                ${messages.map((m) => renderMessageHtml(m)).join('')}
              </div>

              <div class="hm-composer">
                <div class="hm-composer-context-bar">
                  <span>
                    ${selectedCity
                      ? `📍 Aktif Şehir Bağlamı: <strong>${esc(ctx, selectedCity.name)} (${formatPlate(selectedCity.plate)})</strong>`
                      : '🌐 Bağlam: <strong>Anadolu Geneli</strong> (İstersen soldan 81 ilden birini seçebilirsin)'}
                  </span>
                  <span>Enter ile gönder · Shift+Enter yeni satır</span>
                </div>
                <div class="hm-composer-row">
                  <textarea
                    id="hm-prompt-input"
                    class="hm-textarea"
                    placeholder="${esc(ctx, `${activePersona.shortTitle} huzuruna sualini arz et...`)}"
                    ${uiState.isStreaming ? 'disabled' : ''}
                  >${esc(ctx, uiState.draftText)}</textarea>
                  <button
                    type="button"
                    id="hm-send-btn"
                    class="hm-send-btn"
                    ${uiState.isStreaming ? 'disabled' : ''}
                  >${uiState.isStreaming ? 'Yazıyor...' : 'Meclise Sor ✨'}</button>
                </div>
              </div>
            </section>
          </div>
          `}
        </div>
      `;
    }

    function renderMessageHtml(msg) {
      const isUser = msg.role === 'user';
      const sourceBadge = !isUser
        ? (msg.source === 'gemini'
            ? `<span class="hm-msg-source">⚡ Gemini Akışı${msg.model ? ` · ${esc(ctx, msg.model)}` : ''}</span>`
            : `<span class="hm-msg-source offline">📜 Kadim Külliyat</span>`)
        : '';

      const mentioned = !isUser && !msg.loading && !msg.isGreeting && global.SEYYAH_AI && typeof global.SEYYAH_AI.extractProvinceMatches === 'function'
        ? global.SEYYAH_AI.extractProvinceMatches(msg.text, ctx, 4)
        : [];

      const bodyHtml = isUser
        ? esc(ctx, msg.text).replace(/\n/g, '<br />')
        : `${renderMdSafe(msg.text, ctx)}${msg.loading ? '<span class="hm-stream-cursor" aria-hidden="true"></span>' : ''}`;

      return `
        <article class="hm-msg ${isUser ? 'user' : 'model'}" data-hm-msg-id="${esc(ctx, msg.id)}">
          <div class="hm-msg-meta">
            <strong>${isUser ? '🧭 Seyyah (Sen)' : `${activePersona.icon} ${esc(ctx, activePersona.shortTitle)}`}</strong>
            ${msg.timestamp ? `<span>${esc(ctx, msg.timestamp)}</span>` : ''}
            ${sourceBadge}
          </div>
          <div class="hm-bubble" data-hm-bubble="${esc(ctx, msg.id)}">${bodyHtml}</div>
          ${!isUser && !msg.loading ? `
            <div class="hm-msg-footer">
              <div class="hm-mentioned-cities">
                ${mentioned.map((p) => `
                  <button type="button" class="hm-city-tag-btn" data-hm-jump-city="${esc(ctx, p.key)}">
                    📍 ${formatPlate(p.plate)} ${esc(ctx, p.name)}
                  </button>
                `).join('')}
              </div>
              <button type="button" class="hm-copy-msg-btn" data-hm-copy-msg="${esc(ctx, msg.id)}">📋 Kopyala</button>
            </div>
          ` : ''}
        </article>
      `;
    }

    function scrollMessagesToBottom() {
      const list = container.querySelector('#hm-messages-list');
      if (list) {
        list.scrollTop = list.scrollHeight;
      }
    }

    function updateStreamingBubble(msg) {
      const bubble = container.querySelector(`[data-hm-bubble="${msg.id}"]`);
      if (bubble) {
        bubble.innerHTML = `${renderMdSafe(msg.text, ctx)}${msg.loading ? '<span class="hm-stream-cursor" aria-hidden="true"></span>' : ''}`;
        scrollMessagesToBottom();
      }
    }

    async function handleSend(rawPrompt) {
      const text = String(rawPrompt || '').trim();
      if (!text || uiState.isStreaming) return;

      const persona = getPersona(uiState.activeSageId);
      const conv = ensureConversation(persona.id);
      const cityKeyAtSend = uiState.selectedCityKey;
      const cityObj = cityKeyAtSend ? provincesMap[cityKeyAtSend] : null;

      // Capture clean prior history before appending new turns
      const priorHistory = conv
        .filter((m) => !m.isGreeting && !m.loading && m.text)
        .map((m) => ({ role: m.role, text: m.text }));

      const userMsg = {
        id: 'u_' + Date.now(),
        role: 'user',
        text: text,
        timestamp: formatClock(new Date())
      };

      const aiMsgId = 'a_' + (Date.now() + 1);
      const aiMsg = {
        id: aiMsgId,
        role: 'model',
        text: '',
        loading: true,
        source: hasLiveAiKey() ? 'gemini' : 'archive',
        model: '',
        timestamp: formatClock(new Date())
      };

      conv.push(userMsg, aiMsg);
      uiState.draftText = '';
      uiState.isStreaming = true;
      uiState.streamRunId += 1;
      const runId = uiState.streamRunId;

      paint();
      scrollMessagesToBottom();

      // Build rich system instruction & Anatolia + Province prompt context
      const anatoliaCtx = global.SEYYAH_AI && typeof global.SEYYAH_AI.buildAnatoliaContext === 'function'
        ? global.SEYYAH_AI.buildAnatoliaContext(ctx)
        : '';
      const cityCtxBlock = cityObj ? buildCityContextSummary(cityObj) : '';

      const systemParts = [
        persona.systemPrompt,
        'Kullanıcı Anadolu’nun 81 ilini gezen, her şehirde 5 gün kalıp İl Halk Kütüphanelerinde çalışan modern bir Dijital Seyyahtır.',
        anatoliaCtx ? `[Seyyahın Genel Yolculuk Durumu]\n${anatoliaCtx}` : '',
        cityCtxBlock ? `[Kullanıcının Şu An Seçtiği Şehir Bağlamı — Yanıtında bu şehre özellikle değin]\n${cityCtxBlock}` : ''
      ].filter(Boolean);

      const fullSystem = systemParts.join('\n\n');
      const enrichedPrompt = cityObj
        ? `[Seçili Şehir: ${cityObj.name} (${formatPlate(cityObj.plate)}, ${cityObj.region || 'Anadolu'})]\nKullanıcı Sorusu: ${text}`
        : text;

      try {
        if (hasLiveAiKey()) {
          let rafPending = false;
          const res = await global.SEYYAH_AI.stream({
            prompt: enrichedPrompt,
            system: fullSystem,
            history: priorHistory,
            temperature: 0.78,
            maxTokens: 1600,
            onChunk: (_delta, full) => {
              if (uiState.streamRunId !== runId || !uiState.isStreaming) return;
              aiMsg.text = full;
              if (!rafPending) {
                rafPending = true;
                const schedule = typeof requestAnimationFrame === 'function'
                  ? requestAnimationFrame
                  : (fn) => setTimeout(fn, 16);
                schedule(() => {
                  rafPending = false;
                  if (uiState.streamRunId === runId) {
                    updateStreamingBubble(aiMsg);
                  }
                });
              }
            }
          });

          if (uiState.streamRunId !== runId) return;
          aiMsg.text = (res && res.text) || aiMsg.text || buildTopicOfflineResponse(persona, text, cityObj, ctx);
          aiMsg.model = (res && res.model) || '';
          aiMsg.source = 'gemini';
          aiMsg.loading = false;
        } else {
          const offlineText = buildTopicOfflineResponse(persona, text, cityObj, ctx);
          aiMsg.source = 'archive';
          await streamOfflineWords(offlineText, runId, (partial) => {
            aiMsg.text = partial;
            updateStreamingBubble(aiMsg);
          });
          if (uiState.streamRunId !== runId) return;
          aiMsg.text = offlineText;
          aiMsg.loading = false;
        }
      } catch (err) {
        if (uiState.streamRunId !== runId) return;
        const fallbackText = buildTopicOfflineResponse(persona, text, cityObj, ctx);
        aiMsg.source = 'archive';
        await streamOfflineWords(fallbackText, runId, (partial) => {
          aiMsg.text = partial;
          updateStreamingBubble(aiMsg);
        });
        if (uiState.streamRunId !== runId) return;
        aiMsg.text = fallbackText;
        aiMsg.loading = false;
        if (err && err.code !== 'NO_API_KEY') {
          notify(ctx, 'Canlı AI bağlantısı aksadı; Kadim Külliyat yanıtı sunuldu.', 'warning');
        }
      } finally {
        if (uiState.streamRunId === runId) {
          uiState.isStreaming = false;
          paint();
          scrollMessagesToBottom();
        }
      }
    }

    function stopStreaming() {
      if (!uiState.isStreaming) return;
      uiState.streamRunId += 1;
      uiState.isStreaming = false;
      const conv = ensureConversation(uiState.activeSageId);
      const last = conv[conv.length - 1];
      if (last && last.loading) {
        last.loading = false;
        if (!last.text) {
          last.text = '*(Meclis sohbeti duraklatıldı.)*';
        }
      }
      paint();
    }

    async function handleMusavereSend(rawQuestion) {
      const q = String(rawQuestion || '').trim();
      if (!q || uiState.musavereLoading) return;

      const cityObj = uiState.selectedCityKey ? provincesMap[uiState.selectedCityKey] : null;
      uiState.musavereQuestion = q;
      uiState.musavereLoading = true;
      paint();

      const offlineFallback = buildMusavereOfflineResponses(q, cityObj, ctx);

      if (hasLiveAiKey()) {
        try {
          const cityCtxBlock = cityObj ? buildCityContextSummary(cityObj) : '';
          const musavereSystem =
            'Sen Anadolu Seyahatnamesi "Meclis Müşaveresi (5 Bilge Ortak Divanı)" yöneticisisin. ' +
            'Kullanıcının sorusunu 5 kadim bilgenin HER BİRİ kendi özgün tarihî üslubuyla (3-4 yoğun, edebî Türkçe cümle) yanıtlamalı, ardından ortak bir hülâsa yazılmalı. ' +
            'Çıktıyı TAM OLARAK şu ayraçlarla böl (başka ayraç veya önsöz ekleme):\n' +
            '===EVLIYA===\n(Evliya Çelebi yanıtı)\n' +
            '===IBN_BATTUTA===\n(İbn Battûta yanıtı)\n' +
            '===IBN_ARABI===\n(Muhyiddin İbnü’l-Arabî yanıtı)\n' +
            '===YUNUS===\n(Yunus Emre yanıtı)\n' +
            '===IBN_HALDUN===\n(İbn Haldûn yanıtı)\n' +
            '===HULASA===\n(2-3 cümlelik ortak sentez hikmet)';

          const musaverePrompt =
            (cityCtxBlock ? `[Şehir Bağlamı]\n${cityCtxBlock}\n\n` : '') +
            `Kullanıcının Meclis Müşaveresi Suali: ${q}`;

          const aiCall = typeof global.SEYYAH_AI.ask === 'function'
            ? global.SEYYAH_AI.ask({ prompt: musaverePrompt, system: musavereSystem, temperature: 0.78, maxTokens: 1800 })
            : global.SEYYAH_AI.stream({ prompt: musaverePrompt, system: musavereSystem, temperature: 0.78, maxTokens: 1800 });

          const res = await aiCall;
          const rawText = res && res.text ? res.text : '';
          if (rawText.trim()) {
            const parsed = parseMusavereAiResponse(rawText, offlineFallback);
            uiState.musavereResult = {
              question: q,
              cityLabel: offlineFallback.cityLabel,
              source: 'gemini',
              model: (res && res.model) || '',
              cards: parsed.cards,
              hulasa: parsed.hulasa
            };
          } else {
            uiState.musavereResult = offlineFallback;
          }
        } catch (_) {
          uiState.musavereResult = offlineFallback;
          notify(ctx, 'Canlı Gemini müşaveresi aksadı; Klasik Sentez Motoru sunuldu.', 'warning');
        }
      } else {
        await new Promise((r) => setTimeout(r, 220));
        uiState.musavereResult = offlineFallback;
      }

      uiState.musavereLoading = false;
      paint();
    }

    function bindEvents() {
      // Toggle Meclis Müşaveresi (5 Bilge Ortak Divanı)
      const toggleMusavereBtn = container.querySelector('#hm-toggle-musavere');
      if (toggleMusavereBtn) {
        toggleMusavereBtn.addEventListener('click', () => {
          if (uiState.isStreaming) stopStreaming();
          uiState.musavereMode = !uiState.musavereMode;
          paint();
        });
      }

      // Meclis Müşaveresi Controls
      const musavereInput = container.querySelector('#hm-musavere-input');
      const musavereSubmit = container.querySelector('#hm-musavere-submit');
      if (musavereInput) {
        musavereInput.addEventListener('input', () => {
          uiState.musavereQuestion = musavereInput.value;
        });
        musavereInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleMusavereSend(musavereInput.value);
          }
        });
      }
      if (musavereSubmit) {
        musavereSubmit.addEventListener('click', () => {
          handleMusavereSend(musavereInput ? musavereInput.value : uiState.musavereQuestion);
        });
      }
      container.querySelectorAll('[data-hm-musavere-sample]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const sampleQ = btn.getAttribute('data-hm-musavere-sample');
          if (sampleQ) handleMusavereSend(sampleQ);
        });
      });
      const musavereCopyBtn = container.querySelector('#hm-musavere-copy');
      if (musavereCopyBtn) {
        musavereCopyBtn.addEventListener('click', async () => {
          const res = uiState.musavereResult;
          if (!res) return;
          const compiled =
            `# 🤝 Meclis Müşaveresi: ${res.question}\n\n` +
            SAGES.map((s) => `## ${s.icon} ${s.name}\n\n${res.cards[s.id] || ''}`).join('\n\n---\n\n') +
            `\n\n---\n\n## 🌟 Meclisin Ortak Hülâsası\n\n${res.hulasa}`;
          const ok = await copyToClipboard(compiled);
          notify(ctx, ok ? '📋 5 Bilge müşaveresi panoya kopyalandı!' : 'Panoya kopyalanamadı.');
        });
      }

      // Sage selection
      container.querySelectorAll('[data-hm-sage]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const nextId = btn.getAttribute('data-hm-sage');
          if (!nextId || nextId === uiState.activeSageId) return;
          if (uiState.isStreaming) stopStreaming();
          uiState.activeSageId = nextId;
          paint();
          scrollMessagesToBottom();
        });
      });

      // Province filter input (updates select options without stealing input focus)
      const filterInput = container.querySelector('#hm-city-filter');
      const citySelect = container.querySelector('#hm-city-select');
      if (filterInput && citySelect) {
        filterInput.addEventListener('input', () => {
          uiState.cityFilter = filterInput.value;
          const filtered = getFilteredProvinces();
          const currentVal = uiState.selectedCityKey;
          const opts = ['<option value="">— Anadolu Geneli (Şehir Seçilmedi) —</option>']
            .concat(filtered.map((p) => {
              const plate = formatPlate(p.plate);
              const mark = p.visited ? '✓ ' : '';
              return `<option value="${esc(ctx, p.key)}" ${p.key === currentVal ? 'selected' : ''}>${plate} · ${mark}${esc(ctx, p.name)} (${esc(ctx, p.region || '')})</option>`;
            }));
          citySelect.innerHTML = opts.join('');
        });
      }

      if (citySelect) {
        citySelect.addEventListener('change', () => {
          uiState.selectedCityKey = citySelect.value;
          paint();
        });
      }

      const randomBtn = container.querySelector('#hm-random-city');
      if (randomBtn) {
        randomBtn.addEventListener('click', () => {
          if (!provincesList.length) return;
          const pick = provincesList[Math.floor(Math.random() * provincesList.length)];
          uiState.selectedCityKey = pick.key;
          uiState.cityFilter = '';
          paint();
          notify(ctx, `📍 ${pick.name} (${formatPlate(pick.plate)}) meclis bağlamına alındı.`);
        });
      }

      const clearCityBtn = container.querySelector('#hm-clear-city');
      if (clearCityBtn) {
        clearCityBtn.addEventListener('click', () => {
          uiState.selectedCityKey = '';
          uiState.cityFilter = '';
          paint();
        });
      }

      const openCityDetailBtn = container.querySelector('#hm-open-city-detail');
      if (openCityDetailBtn) {
        openCityDetailBtn.addEventListener('click', () => {
          if (uiState.selectedCityKey && ctx && typeof ctx.selectCity === 'function') {
            ctx.selectCity(uiState.selectedCityKey);
          }
        });
      }

      // Quick Philosophical Prompt Chips
      container.querySelectorAll('[data-hm-quick]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const qpId = btn.getAttribute('data-hm-quick');
          const qp = QUICK_PROMPTS.find((item) => item.id === qpId);
          if (!qp) return;
          let promptText = qp.prompt;
          if (qp.isCityPrompt) {
            if (uiState.selectedCityKey && provincesMap[uiState.selectedCityKey]) {
              const c = provincesMap[uiState.selectedCityKey];
              promptText = `${c.name} (${formatPlate(c.plate)}) şehrinin ruhunu, tarihini ve seyyaha fısıldadığı manayı kendi üslubunla anlat.`;
            } else {
              promptText = 'Seçili bir şehir belirlemeden evvel Anadolu şehirlerinin genel ruhunu ve bir beldeye nasıl nazar etmek gerektiğini kendi üslubunla anlat.';
            }
          }
          handleSend(promptText);
        });
      });

      // Composer textarea & Send
      const textarea = container.querySelector('#hm-prompt-input');
      const sendBtn = container.querySelector('#hm-send-btn');
      if (textarea) {
        textarea.addEventListener('input', () => {
          uiState.draftText = textarea.value;
        });
        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(textarea.value);
          }
        });
      }
      if (sendBtn) {
        sendBtn.addEventListener('click', () => {
          handleSend(textarea ? textarea.value : uiState.draftText);
        });
      }

      // Stop stream
      const stopBtn = container.querySelector('#hm-stop-stream');
      if (stopBtn) {
        stopBtn.addEventListener('click', stopStreaming);
      }

      // Reset conversation
      const resetBtn = container.querySelector('#hm-reset-chat');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (uiState.isStreaming) stopStreaming();
          delete uiState.conversations[uiState.activeSageId];
          ensureConversation(uiState.activeSageId);
          paint();
          notify(ctx, `${activePersona.shortTitle} meclisi tazelendi.`);
        });
      }

      // Export Markdown
      const exportBtn = container.querySelector('#hm-export-md');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          const conv = ensureConversation(uiState.activeSageId);
          const header = `# 📜 Hikmet Meclisi — ${activePersona.name} (${activePersona.era})\n` +
            (selectedCity ? `> Bağlam: ${selectedCity.name} (${formatPlate(selectedCity.plate)}, ${selectedCity.region || ''})\n\n` : '\n');
          const body = conv.map((m) => {
            const who = m.role === 'user' ? '### 🧭 Seyyah' : `### ${activePersona.icon} ${activePersona.name}`;
            return `${who}\n\n${m.text}`;
          }).join('\n\n---\n\n');
          downloadTextFile(`hikmet-meclisi-${activePersona.id}.md`, header + body);
          notify(ctx, 'Diyalog Markdown dosyası olarak indirildi.');
        });
      }

      // Copy single message
      container.querySelectorAll('[data-hm-copy-msg]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const msgId = btn.getAttribute('data-hm-copy-msg');
          const conv = ensureConversation(uiState.activeSageId);
          const found = conv.find((m) => m.id === msgId);
          if (!found) return;
          const ok = await copyToClipboard(found.text);
          notify(ctx, ok ? 'Hikmet notu panoya kopyalandı.' : 'Panoya kopyalanamadı.');
        });
      });

      // Jump to mentioned province card
      container.querySelectorAll('[data-hm-jump-city]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-hm-jump-city');
          if (key && ctx && typeof ctx.selectCity === 'function') {
            ctx.selectCity(key);
          }
        });
      });
    }

    function paint() {
      container.innerHTML = buildFullHtml();
      bindEvents();
    }

    paint();
    scrollMessagesToBottom();
  }

  global.SEYYAH_MODULES.hikmetMeclisi = {
    render: render
  };
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
