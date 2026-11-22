/**
 * Anadolu Seyahatnamesi — AI Anadolu Gurme Şefi & Sofra Rehberi Stüdyosu
 * 81 ilin yöresel mutfak mirasını, tarihî lezzet kökenlerini, ideal yeme sırasını,
 * çay/kahve eşleşmesini ve bütçe tahminini canlı AI akışıyla (ve akıllı çevrimdışı
 * p.specialties yedeğiyle) sunan interaktif gastronomi rehberi.
 * Registers on window.SEYYAH_MODULES.aiChef = { render(container, ctx) }
 */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-ai-chef-styles';
  const LAST_CITY_STORAGE = 'dijital_seyyah_chef_last_city';
  const GEMINI_KEY_STORAGE = 'dijital_seyyah_gemini_api_key';
  const GEMINI_MODEL_STORAGE = 'dijital_seyyah_gemini_model';
  const DEFAULT_MODEL = 'gemini-flash-lite-latest';
  const FALLBACK_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];
  const RETIRED_MODELS = new Set([
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-pro'
  ]);

  const MEAL_TIMES = [
    {
      id: 'kahvalti',
      label: '☀️ Sabah Kahvaltısı',
      shortLabel: 'Sabah Kahvaltısı',
      icon: '☀️',
      hint: 'Güne zinde başlangıç, fırın & peynir-bal sofrası',
      promptHint: 'Sabah kahvaltısı, erken saatlerde açılan fırınlar, yöresel peynir/bal/hamur işi ve sıcak başlangıçlar'
    },
    {
      id: 'ogle',
      label: '🍲 Öğle Yemeği',
      shortLabel: 'Öğle Yemeği',
      icon: '🍲',
      hint: 'Esnaf lokantası, tencere yemeği & öğle molası',
      promptHint: 'Öğle yemeği, tarihi çarşı esnaf lokantaları, çorba-ana yemek dengesi ve kütüphane çalışma arası için pratik ama otantik lezzetler'
    },
    {
      id: 'aksam',
      label: '🌙 Akşam Ziyafeti',
      shortLabel: 'Akşam Ziyafeti',
      icon: '🌙',
      hint: 'Ağır ateşte pişen imza yemekler & uzun sofra',
      promptHint: 'Akşam ziyafeti, şehrin en köklü imza yemekleri, meze/salata eşlikçileri ve ağır ağır tadılan akşam sofrası ritüeli'
    },
    {
      id: 'tatli',
      label: '🍮 Tatlı & Kahve',
      shortLabel: 'Tatlı & Kahve',
      icon: '🍮',
      hint: 'Şerbetli/sütlü tatlılar, kahvehane & tefekkür',
      promptHint: 'Tatlı ve kahve molası, yöresel şerbetli veya sütlü tatlılar, tarihi kahvehaneler ve çay/kahve demleme kültürü'
    }
  ];

  const DIET_STYLES = [
    {
      id: 'geleneksel',
      label: '🏛️ Geleneksel Tam Deneyim',
      shortLabel: 'Geleneksel Tam Deneyim',
      icon: '🏛️',
      budgetMultiplier: 1.45,
      promptHint: 'Otantik taş fırın, tarihi ocakbaşı veya köklü konak mutfağında eksiksiz geleneksel tadım deneyimi'
    },
    {
      id: 'ekonomik',
      label: '🎒 Öğrenci / Ekonomik',
      shortLabel: 'Öğrenci / Ekonomik',
      icon: '🎒',
      budgetMultiplier: 0.55,
      promptHint: 'GSB Seyahatsever / öğrenci bütçesine dost esnaf lokantaları, büfe/fırın klasikleri ve yüksek fiyat-performans durakları'
    },
    {
      id: 'vejetaryen',
      label: '🥗 Hafif / Vejetaryen',
      shortLabel: 'Hafif / Vejetaryen',
      icon: '🥗',
      budgetMultiplier: 0.9,
      promptHint: 'Et içermeyen (veya son derece hafif) yöresel ot yemekleri, zeytinyağlılar, bakliyat çorbaları, peynirli/otlu hamur işleri ve tatlılar; şehrin et ağırlıklı yemekleri varsa bunların etsiz/hafif yöresel karşılıkları'
    }
  ];

  const REGIONAL_HERITAGE = {
    '01_Marmara': {
      roots: 'Osmanlı saray mutfağı, Balkan/Rumeli göçmen lezzetleri ve iki denizin bereketli kıyı sofraları',
      drink: 'Demli Tavşan Kanı Çay, Koruk Şerbeti veya Boza / Köpüklü Ayran',
      baseRange: [240, 420]
    },
    '02_Ege': {
      roots: 'Zeytinyağlı Anadolu-Akdeniz sentezi, şifalı yabani ot kavurmaları ve antik kıyı taş fırın geleneği',
      drink: 'Sakızlı Türk Kahvesi, Kekik Çayı veya Soğuk Sıkım Narenciye Şerbeti',
      baseRange: [250, 440]
    },
    '03_Akdeniz': {
      roots: 'Toros Yörük ateşinden yükselen zırh kıyma ve saç geleneği ile Çukurova-Amik ovasının narenciye bereketi',
      drink: 'Acılı/Acısız Şalgam Suyu, Süvari Kahvesi veya Taze Sıkılmış Nar-Turunç',
      baseRange: [230, 410]
    },
    '04_IcAnadolu': {
      roots: 'Selçuklu dergâh ve Ahi sofralarının bereketi; buğday, tandır, bulgur ve yavaş pişen güveç kültürü',
      drink: 'Közde Türk Kahvesi, Ihlamur-Adaçayı veya Yayık Ayranı',
      baseRange: [200, 360]
    },
    '05_Karadeniz': {
      roots: 'Sisli yaylaların sarı tereyağı, taş değirmen mısır unu, kara lahana ve hırçın denizin taze mahsulleri',
      drink: 'Taze Rize Siyah Çayı (İnce Bellide), Demirhindi veya Kızılcık Şerbeti',
      baseRange: [220, 390]
    },
    '06_DoguAnadolu': {
      roots: 'Yüksek yaylaların çiçek balı, olgunlaşmış otlu/tulum peynirleri ve uzun kışların şifalı tandır-çorba geleneği',
      drink: 'Semaver Çayı (Kıtlama Şekerli) veya Dağ Kekiği Demlemesi',
      baseRange: [210, 370]
    },
    '07_GuneydoguAnadolu': {
      roots: 'Mezopotamya’nın binlerce yıllık baharat yolu, taş dibek, zırh ustalığı, fıstık ve buğday medeniyeti',
      drink: 'Menengiç Kahvesi, Mırra, Meyan Şerbeti veya Bakır Maşrapada Yayık Ayranı',
      baseRange: [240, 430]
    }
  };

  const QUICK_GASTRO_PLATES = [27, 31, 63, 1, 42, 38, 16, 61, 35, 25];

  const uiState = {
    selectedKey: '',
    searchFilter: '',
    mealId: 'ogle',
    dietId: 'geleneksel',
    matchRegionFilter: 'selected',
    isStreaming: false,
    streamRunId: 0,
    abortController: null,
    offlineTimer: null,
    outputMarkdown: '',
    sourceMode: '', // 'seyyah-ai' | 'gemini-direct' | 'offline'
    sourceLabel: '',
    errorNote: '',
    generatedMeta: null
  };

  // ---------------------------------------------------------------------------
  // Safe Utility Helpers
  // ---------------------------------------------------------------------------
  function fallbackEscape(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fallbackNormalize(str) {
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

  function padPlate(plate) {
    const n = Number(plate) || 0;
    return n < 10 ? `0${n}` : String(n);
  }

  function getOption(list, id) {
    return list.find((item) => item.id === id) || list[0];
  }

  function isRetiredModel(modelName) {
    if (!modelName) return false;
    return RETIRED_MODELS.has(modelName) || /^gemini-2\.[05]($|-)/i.test(modelName);
  }

  function getStoredGeminiKey() {
    try {
      return (localStorage.getItem(GEMINI_KEY_STORAGE) || '').trim();
    } catch (e) {
      return '';
    }
  }

  function getCandidateModels() {
    let preferred = DEFAULT_MODEL;
    try {
      const raw = (localStorage.getItem(GEMINI_MODEL_STORAGE) || '').trim();
      if (raw && !isRetiredModel(raw)) preferred = raw;
    } catch (e) {}
    const all = [preferred].concat(FALLBACK_MODELS);
    return all.filter((m, idx) => m && all.indexOf(m) === idx);
  }

  function saveLastCityKey(key) {
    try {
      if (key) localStorage.setItem(LAST_CITY_STORAGE, key);
    } catch (e) {}
  }

  function loadLastCityKey() {
    try {
      return localStorage.getItem(LAST_CITY_STORAGE) || '';
    } catch (e) {
      return '';
    }
  }

  function buildProvincesList(ctx) {
    const raw = (ctx && ctx.data && ctx.data.provinces) || {};
    return Object.keys(raw)
      .map((key) => {
        const p = raw[key];
        if (!p || !p.name) return null;
        return {
          key,
          plate: Number(p.plate) || 0,
          name: p.name,
          region: p.region || 'Anadolu',
          region_code: p.region_code || '',
          specialties: Array.isArray(p.specialties) ? p.specialties.filter(Boolean) : [],
          landmarks: Array.isArray(p.landmarks) ? p.landmarks.filter(Boolean) : [],
          quote: p.quote || p.custom_quote || '',
          history: p.history || '',
          library: p.library || '',
          banner_rel: p.banner_rel || '',
          slug: p.slug || fallbackNormalize(p.name),
          visited: Boolean(p.visited)
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.plate - b.plate || a.name.localeCompare(b.name, 'tr'));
  }

  // ---------------------------------------------------------------------------
  // Markdown -> Safe HTML Renderer
  // ---------------------------------------------------------------------------
  function formatInlineMd(text, escFn) {
    let out = escFn(text);
    out = out.replace(/`([^`]+)`/g, '<code class="agc-inline-code">$1</code>');
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return out;
  }

  function renderMarkdownToHtml(markdown, escFn) {
    const src = String(markdown || '').replace(/\r\n/g, '\n');
    if (!src.trim()) return '';
    const lines = src.split('\n');
    const html = [];
    let inUl = false;
    let inOl = false;

    function closeLists() {
      if (inUl) {
        html.push('</ul>');
        inUl = false;
      }
      if (inOl) {
        html.push('</ol>');
        inOl = false;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        closeLists();
        continue;
      }

      if (/^---+$/.test(trimmed)) {
        closeLists();
        html.push('<hr class="agc-md-hr" />');
        continue;
      }

      if (trimmed.startsWith('### ')) {
        closeLists();
        html.push(`<h4 class="agc-md-h4">${formatInlineMd(trimmed.slice(4), escFn)}</h4>`);
        continue;
      }

      if (trimmed.startsWith('## ')) {
        closeLists();
        html.push(`<h3 class="agc-md-h3">${formatInlineMd(trimmed.slice(3), escFn)}</h3>`);
        continue;
      }

      if (trimmed.startsWith('# ')) {
        closeLists();
        html.push(`<h2 class="agc-md-h2">${formatInlineMd(trimmed.slice(2), escFn)}</h2>`);
        continue;
      }

      if (trimmed.startsWith('> ')) {
        closeLists();
        html.push(`<blockquote class="agc-md-quote">${formatInlineMd(trimmed.slice(2), escFn)}</blockquote>`);
        continue;
      }

      const ulMatch = /^[-*•]\s+(.+)$/.exec(trimmed);
      if (ulMatch) {
        if (inOl) {
          html.push('</ol>');
          inOl = false;
        }
        if (!inUl) {
          html.push('<ul class="agc-md-ul">');
          inUl = true;
        }
        html.push(`<li>${formatInlineMd(ulMatch[1], escFn)}</li>`);
        continue;
      }

      const olMatch = /^\d+[.)]\s+(.+)$/.exec(trimmed);
      if (olMatch) {
        if (inUl) {
          html.push('</ul>');
          inUl = false;
        }
        if (!inOl) {
          html.push('<ol class="agc-md-ol">');
          inOl = true;
        }
        html.push(`<li>${formatInlineMd(olMatch[1], escFn)}</li>`);
        continue;
      }

      closeLists();
      html.push(`<p class="agc-md-p">${formatInlineMd(trimmed, escFn)}</p>`);
    }

    closeLists();
    return html.join('\n');
  }

  // ---------------------------------------------------------------------------
  // Copy & Download Helpers
  // ---------------------------------------------------------------------------
  async function copyToClipboard(text) {
    const content = String(text || '');
    if (!content) return false;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(content);
        return true;
      } catch (e) {}
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = content;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return Boolean(ok);
    } catch (e) {
      return false;
    }
  }

  function downloadMarkdown(filename, content) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 150);
  }

  // ---------------------------------------------------------------------------
  // Prompt Builder (Uses Real Province Data & Specialties)
  // ---------------------------------------------------------------------------
  function buildChefPrompt(province, meal, diet) {
    const specs = province.specialties.length
      ? province.specialties.join(', ')
      : `${province.name} yöresel mutfağı`;
    const landmarks = province.landmarks.slice(0, 3).join(', ') || 'Tarihî şehir merkezi';
    const historySnippet = province.history
      ? province.history.slice(0, 320).trim() + (province.history.length > 320 ? '...' : '')
      : '';

    const systemPrompt = [
      'Sen "Dijital Seyyah: Anadolu Seyahatnamesi" projesinin usta gastronomi yazarı, kültür tarihçisi ve Anadolu Gurme Şefisin.',
      'Üslubun iştah açıcı, Evliya Çelebi zarafetine sahip, yerel mutfak tekniklerine hâkim ve gezginler için son derece pratiktir.',
      'Yanıtını mutlaka zengin ve düzenli Türkçe Markdown başlıklarıyla oluştur; abartısız ama ağız sulandıran duyusal tarifler (koku, doku, köz, tereyağı, baharat) kullan.'
    ].join('\n');

    const userPrompt = [
      `Lütfen **${province.name}** (${padPlate(province.plate)} • ${province.region} Bölgesi) için eksiksiz bir **Gurme Şefi & Sofra Rehberi** hazırla.`,
      '',
      '### Şehir Envanteri (Gerçek Veriler)',
      `- İlin Meşhur Lezzetleri (specialties): ${specs}`,
      `- Öne Çıkan Miras Durakları: ${landmarks}`,
      province.library ? `- Kütüphane Durağı: ${province.library}` : '',
      historySnippet ? `- Tarihî Arka Plan: ${historySnippet}` : '',
      '',
      '### Seçilen Sofra Tercihleri',
      `- Öğün Vakti: **${meal.label}** (${meal.promptHint})`,
      `- Beslenme & Bütçe Tarzı: **${diet.label}** (${diet.promptHint})`,
      '',
      '### Zorunlu Bölümler (Tamamı Türkçe Markdown)',
      `1. **## 🍽️ ${province.name} Sofrasının Başrol Lezzetleri**: Yukarıdaki gerçek \`specialties\` lezzetlerini merkeze alarak (ve ${diet.shortLabel} tarzına uyarlayarak) 3–4 otantik yemek/tatlı öner; her birinin nasıl piştiğini ve damakta bıraktığı hissi iştah açıcı biçimde anlat.`,
      '2. **## 📜 Lezzetlerin Tarihî ve Kültürel Kökeni**: Bu mutfağın Anadolu, Selçuklu/Osmanlı, Yörük veya yerel coğrafya tarihindeki kökenini ve malzeme hikâyesini anlat.',
      '3. **## 🧭 İdeal Yeme & Tadım Sırası**: Masaya oturulduğunda açılıştan son lokmaya kadar hangi sırayla yenmeli? (Başlangıç/Çorba ➔ Ana Lezzet ➔ Eşlikçi/Meze ➔ Tatlı Final).',
      '4. **## ☕ Çay, Kahve & İçecek Eşleşmesi**: Seçilen öğün vaktine ve yemeğin ağırlığına yakışacak yöresel çay, kahve, şerbet veya ayran eşleşmelerini belirt.',
      `5. **## 💰 Kişi Başı Bütçe Tahmini & Şef İpuçları**: **${diet.shortLabel}** tarzı için gerçekçi ₺ bütçe aralığı (kalem kalem: yemek + içecek/tatlı) ve doğru mekân seçimi (tarihî çarşı, esnaf lokantası, saat uyarısı) ipuçları ver.`
    ]
      .filter(Boolean)
      .join('\n');

    return { systemPrompt, userPrompt };
  }

  // ---------------------------------------------------------------------------
  // Offline Fallback Guide Builder (100% Grounded in p.specialties)
  // ---------------------------------------------------------------------------
  function classifySpecialties(specialties, normFn) {
    const sweets = [];
    const soups = [];
    const drinks = [];
    const pastries = [];
    const mains = [];

    const sweetRx = /\b(tatli|tatlisi|helva|helvasi|baklava|baklavasi|kunefe|kadayif|kadayifi|hosmerim|pismaniye|lokum|seker|sekeri|ezme|ezmesi|macun|kurabiye|pestil|kome|dondurma|sambali|bomba|bombasi|recel|sutlac|sutlaci|muhallebi|asure|tulumba|bici|katmer|katmeri|sillik|kaymakli|kaymaklisi|peynirli)\b/;
    const soupRx = /\b(corba|corbasi|asi|tarhana|yuvalama|beyran|keskek|paca|iskembe|ezogelin|tutmac|arabaşı|arabasi)\b/;
    const drinkRx = /\b(ayran|ayrani|salgam|kahve|kahvesi|mirra|menengic|serbet|boza|cay|cayi)\b/;
    const pastryRx = /\b(pide|pidesi|borek|boregi|manti|mantisi|gozleme|corek|coregi|boyoz|boyozu|simit|simidi|lavas|cantik|bukme|lahmacun|kumru|tost|tostu|bazlama|eriste|hingel|siron|ciborek|kete|ketesi|ekmek|ekmegi|peynir|peyniri|bal|bali|kaymak|kaymagi|mihlama|kuymak)\b/;

    for (const item of specialties) {
      const n = normFn(item);
      if (drinkRx.test(n)) drinks.push(item);
      else if (sweetRx.test(n)) sweets.push(item);
      else if (soupRx.test(n)) soups.push(item);
      else if (pastryRx.test(n)) pastries.push(item);
      else mains.push(item);
    }

    return { mains, pastries, soups, sweets, drinks };
  }

  function buildOfflineChefGuide(province, meal, diet, normFn) {
    const specs = province.specialties.length
      ? province.specialties
      : [`${province.name} Yöresel Sofrası`];
    const groups = classifySpecialties(specs, normFn);
    const heritage = REGIONAL_HERITAGE[province.region_code] || {
      roots: `${province.region} coğrafyasının yüzyıllardır taş fırın, bakır tencere ve mevsimsel mahsullerle yoğurduğu Anadolu mutfak mirası`,
      drink: 'Demli Türk Çayı, Közde Türk Kahvesi veya Ev Yapımı Yayık Ayranı',
      baseRange: [220, 380]
    };

    const mult = diet.budgetMultiplier || 1;
    const mealFactor = meal.id === 'kahvalti' ? 0.72 : meal.id === 'tatli' ? 0.48 : meal.id === 'aksam' ? 1.25 : 1.0;
    const minTl = Math.round((heritage.baseRange[0] * mult * mealFactor) / 10) * 10;
    const maxTl = Math.round((heritage.baseRange[1] * mult * mealFactor) / 10) * 10;

    const primaryHighlight =
      meal.id === 'tatli'
        ? groups.sweets[0] || groups.drinks[0] || specs[0]
        : meal.id === 'kahvalti'
        ? groups.pastries[0] || specs[0]
        : groups.mains[0] || groups.soups[0] || groups.pastries[0] || specs[0];

    const secondaryHighlight =
      specs.find((s) => s !== primaryHighlight) || `${province.name} Esnaf Usulü Eşlikçi`;
    const thirdHighlight =
      specs.find((s) => s !== primaryHighlight && s !== secondaryHighlight) ||
      groups.sweets[0] ||
      'Yöresel Tatlı Finali';

    const drinkChoice =
      groups.drinks[0] ||
      (meal.id === 'kahvalti'
        ? 'İnce belli bardakta taze demlenmiş Rize çayı'
        : meal.id === 'tatli'
        ? `Ağır ağır pişirilmiş ${heritage.drink.split(',')[0]}`
        : heritage.drink);

    const landmarkNote = province.landmarks[0]
      ? `**${province.landmarks[0]}** çevresindeki tarihî çarşı ve ara sokak esnafı`
      : `${province.name} tarihî çarşı meydanı`;

    const dietAdaptation =
      diet.id === 'vejetaryen'
        ? `\n> 🥗 **Hafif & Vejetaryen Uyarlaması:** ${province.name} mutfağındaki et ağırlıklı tarifler yerine aynı ocağın **mercimek/tarhana temelli çorbalarını, zeytinyağlı veya tereyağlı sebze-ot kavurmalarını, peynirli/ıspanaklı fırın pidelerini** ve **sütlü/şerbetli tatlılarını** tercih ederek yörenin baharat ruhunu hafif biçimde yaşayabilirsiniz.`
        : diet.id === 'ekonomik'
        ? `\n> 🎒 **Öğrenci / Ekonomik Şef Notu:** Turistik bulvarlar yerine esnafın ve öğrencilerin öğle arası uğradığı arka sokak lokantalarında çorba + ana lezzet + çay üçlüsünü yarı fiyatına, üstelik daha taze bulabilirsiniz.`
        : `\n> 🏛️ **Geleneksel Tam Deneyim Notu:** Odun veya taş fırının ilk çıktığı saatleri yakalamak, ${province.name} ustalığının çıtır ve sulu dengesini zirvede tatmanızı sağlar.`;

    const specBulletLines = specs.map((item, idx) => {
      const n = normFn(item);
      if (diet.id === 'vejetaryen' && /\b(kebap|kebabi|kofte|ciger|etli|kavurma|tandir|doner|sucuk|pastirma|kuzu|balik|hamsi|cag|tantuni)\b/.test(n)) {
        return `- **${item} *(Etsiz/Hafif Alternatif Önerisi)*:** Şehrin en meşhur imza tatlarından olan bu lezzetin yanında aynı ustaların fırınından çıkan **otlu/peynirli pide, közlenmiş sebze söğüş ve yöresel bakliyat-tahıl tabakları** ile hafif bir denge kurabilirsiniz.`;
      }
      if (idx === 0) {
        return `- **${item}:** ${province.name} sofrasının tartışmasız başrolü; yerel malzeme kalitesi ve usta eliyle şehrin damak hafızasını tek lokmada özetler.`;
      }
      if (idx === 1) {
        return `- **${item}:** İlk lezzetin aromasını tamamlayan, dokusu ve baharat dengesiyle sofraya karakter katan vazgeçilmez eşlikçi.`;
      }
      return `- **${item}:** ${province.name} menzilinden ayrılmadan önce mutlaka tadılması (ve mümkünse sevdiklerinize paket yaptırılması) gereken yöresel imza.`;
    });

    const eatingOrderLines =
      meal.id === 'kahvalti'
        ? [
            `1. **Sıcak Başlangıç & Ekmek:** Fırından yeni çıkmış yöresel ekmek/simit/hamur işi (${groups.pastries[0] || primaryHighlight}) ve taze demlenmiş çay ile mideyi uyandırın.`,
            `2. **Peynir, Tereyağı & Bal Dengesi:** Yöresel süt ürünleriyle tuzlu-tatlı dengesini kurun; ağır reçel ve kaymağı sona bırakın.`,
            `3. **Yöresel İmza Dokunuşu:** Masadaki sıcak lezzet (${secondaryHighlight}) soğumadan paylaşın.`,
            `4. **Tatlı Kapanış:** Son yudum çayla birlikte ${groups.sweets[0] || thirdHighlight} tadıp kütüphane ya da şehir yürüyüşüne enerjik çıkın.`
          ]
        : meal.id === 'tatli'
        ? [
            `1. **Damak Temizleme:** İlk olarak bir yudum soğuk su ile damağı nötrleyin; tatlıdan önce şekersiz sade kahve veya çay siparişi verin.`,
            `2. **Başrol Tatlı:** **${primaryHighlight}** sıcak veya oda sıcaklığında (şerbetli ise çıtırlığı kaybolmadan, sütlü ise serin biçimde) küçük lokmalarla tadın.`,
            `3. **İkinci Eşlikçi:** İmza tatlının yanında **${secondaryHighlight}** veya bir parça kaymak/fıstık ile aromayı derinleştirin.`,
            `4. **Tefekkür Kahvesi:** Tatlı sonrası içilen ${drinkChoice} ile şeker dengesini yumuşatıp seyahat defterine günün notlarını düşün.`
          ]
        : [
            `1. **Açılış (Sıcak Süzülüş):** Sofra başında ${groups.soups[0] || 'yöresel bir kâse sıcak çorba'} veya taze fırın pidesiyle damağı hazırlayın.`,
            `2. **Ana İmza Lezzet:** Yemeğin yıldızı **${primaryHighlight}** tabağını yanında közlenmiş biber, soğan söğüş veya yöresel salata ile acele etmeden tadın.`,
            `3. **Tamamlayıcı Tat:** **${secondaryHighlight}** ile bölgenin baharat ve hamur/et dengesini yakalayın.`,
            `4. **Tatlı & Kahve Finali:** Yemeğin hemen ardından ${groups.sweets[0] || thirdHighlight} ve üstüne ${drinkChoice} ile sofrayı zarifçe mühürleyin.`
          ];

    return [
      `# 🍽️ ${province.name} (${padPlate(province.plate)}) — ${meal.shortLabel} Gurme Rehberi`,
      '',
      `> *${province.quote || `${province.name} topraklarının bereketinden doğan kadim lezzetler.` }*`,
      '',
      `## 🍽️ Otantik Lezzetler & Sofra Seçkisi`,
      `${province.name} (${province.region}) mutfağı, **${meal.shortLabel}** vaktinde ve **${diet.shortLabel}** tercihinde size şu gerçek yöresel tatları sunar:`,
      '',
      ...specBulletLines,
      dietAdaptation,
      '',
      `## 📜 Lezzetlerin Tarihî ve Kültürel Kökeni`,
      `${province.name} sofrasının karakteri, **${heritage.roots}** ile şekillenmiştir. Tarih boyunca ${landmarkNote} etrafında kümelenen hanlar, fırınlar ve lonca çarşıları; sadece karın doyuran mekânlar değil, yolcuya ikram etmeyi ahlak bilen bir misafirperverlik okuludur. Özellikle **${specs[0]}** gibi coğrafi kimlik taşıyan lezzetler, bölgenin iklimini, yayla-ova döngüsünü ve sabırlı pişirme kültürünü tabağa taşır.`,
      '',
      `## 🧭 İdeal Yeme & Tadım Sırası`,
      ...eatingOrderLines,
      '',
      `## ☕ Çay, Kahve & İçecek Eşleşmesi`,
      `- **Ana Eşlikçi İçecek:** **${drinkChoice}** — ${meal.shortLabel.toLowerCase()} sırasında yöresel tatların aromasını bastırmadan damağı ferahlatır.`,
      `- **Mola Önerisi:** Sofra sonrası ${province.library ? `**${province.library.split('-')[0].trim()}**` : 'tarihî kahvehaneler'} civarında kısa bir yürüyüş ve ikinci bir çay/kahve molası, ${province.name} şehrinin ritmini hissetmek için idealdir.`,
      '',
      `## 💰 Kişi Başı Bütçe Tahmini & Şef İpuçları`,
      `- **Tahmini Kişi Başı Bütçe (${diet.shortLabel}):** **${minTl} ₺ – ${maxTl} ₺**`,
      `  - *Ana Lezzet & Eşlikçi:* ~${Math.round(minTl * 0.68)}–${Math.round(maxTl * 0.68)} ₺`,
      `  - *Tatlı / Çay & Kahve:* ~${Math.round(minTl * 0.32)}–${Math.round(maxTl * 0.32)} ₺`,
      `- **Şefin Mekân Kuralı:** Vitrininde büyük yazılı menü olan ana cadde noktaları yerine ${landmarkNote} içerisindeki tek veya iki üründe uzmanlaşmış köklü dükkânları seçin; gerçek ustalık az çeşit ama taze tezgâhta gizlidir.`
    ].join('\n');
  }

  // ---------------------------------------------------------------------------
  // Streaming Engines: window.SEYYAH_AI.stream -> Direct Gemini SSE -> Offline
  // ---------------------------------------------------------------------------
  function extractChunkText(chunk) {
    if (chunk == null) return '';
    if (typeof chunk === 'string') return chunk;
    if (typeof chunk === 'object') {
      if (typeof chunk.text === 'string') return chunk.text;
      if (typeof chunk.delta === 'string') return chunk.delta;
      if (typeof chunk.token === 'string') return chunk.token;
      if (typeof chunk.content === 'string') return chunk.content;
      if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta && typeof chunk.choices[0].delta.content === 'string') {
        return chunk.choices[0].delta.content;
      }
      if (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].content && Array.isArray(chunk.candidates[0].content.parts)) {
        return chunk.candidates[0].content.parts.map((pt) => pt.text || '').join('');
      }
    }
    return '';
  }

  async function trySeyyahAiStream(systemPrompt, userPrompt, cacheKey, signal, onChunk) {
    const ai = typeof window !== 'undefined' ? window.SEYYAH_AI : null;
    if (!ai) return null;

    // On file:// with no BYOK key, skip network call and let offline p.specialties fallback handle it cleanly
    if (
      typeof ai.hasKey === 'function' &&
      !ai.hasKey() &&
      typeof window !== 'undefined' &&
      window.location &&
      window.location.protocol === 'file:'
    ) {
      return null;
    }

    if (typeof ai.stream === 'function') {
      let accumulated = '';
      let receivedChunk = false;

      const handleChunk = (piece, fullSnapshot) => {
        if (signal && signal.aborted) return;
        if (typeof fullSnapshot === 'string' && fullSnapshot.length >= accumulated.length) {
          const delta = fullSnapshot.slice(accumulated.length);
          accumulated = fullSnapshot;
          if (delta) {
            receivedChunk = true;
            onChunk(delta);
          }
          return;
        }
        const text = extractChunkText(piece);
        if (!text) return;
        receivedChunk = true;
        if (accumulated && text.startsWith(accumulated) && text.length > accumulated.length) {
          const delta = text.slice(accumulated.length);
          accumulated = text;
          onChunk(delta);
        } else {
          accumulated += text;
          onChunk(text);
        }
      };

      const opts = {
        prompt: userPrompt,
        system: systemPrompt,
        systemPrompt,
        systemInstruction: systemPrompt,
        cacheKey,
        temperature: 0.78,
        maxTokens: 2200,
        maxOutputTokens: 2200,
        signal,
        onChunk: handleChunk,
        onToken: handleChunk,
        onDelta: handleChunk,
        onText: handleChunk,
        onUpdate: handleChunk
      };

      const fnSrc = Function.prototype.toString.call(ai.stream).slice(0, 160);
      const expectsOptionsFirst =
        /^\s*(?:async\s+)?(?:function\s*)?\(\s*\{/.test(fnSrc) ||
        /^\s*(?:async\s+)?(?:function\s*)?\(\s*(?:opts|options|cfg|config|params)\b/.test(fnSrc);
      const expectsCallbackSecond =
        ai.stream.length >= 2 &&
        /\(\s*[^,]+,\s*(?:onChunk|onToken|onDelta|cb|callback)\b/.test(fnSrc);

      let result;
      if (expectsOptionsFirst) {
        result = await ai.stream(opts);
      } else if (expectsCallbackSecond) {
        result = await ai.stream(userPrompt, handleChunk, opts);
      } else {
        try {
          result = await ai.stream(userPrompt, opts);
        } catch (firstErr) {
          if (signal && signal.aborted) throw firstErr;
          if (!receivedChunk) {
            result = await ai.stream(opts);
          } else {
            throw firstErr;
          }
        }
      }

      if (result && typeof result[Symbol.asyncIterator] === 'function') {
        for await (const part of result) {
          if (signal && signal.aborted) break;
          handleChunk(part);
        }
        return { text: accumulated, sourceLabel: '✨ SEYYAH_AI Canlı Akış' };
      }

      const finalText = extractChunkText(result);
      if (finalText && finalText.length > accumulated.length) {
        const missing = finalText.startsWith(accumulated)
          ? finalText.slice(accumulated.length)
          : (receivedChunk ? '' : finalText);
        if (missing) {
          accumulated += missing;
          onChunk(missing);
        }
      }

      if (accumulated.trim()) {
        const modelTag = result && result.model ? ` (${result.model}${result.cached ? ' • Önbellek' : ''})` : '';
        return { text: accumulated, sourceLabel: `✨ SEYYAH_AI Canlı Akış${modelTag}` };
      }
      throw new Error('SEYYAH_AI boş akış döndürdü');
    }

    // Support non-streaming ask/generate method on window.SEYYAH_AI if present
    const genFn = ai.ask || ai.generate || ai.chat;
    if (typeof genFn === 'function') {
      const res = await genFn.call(ai, {
        prompt: userPrompt,
        system: systemPrompt,
        systemPrompt,
        cacheKey,
        signal
      });
      const text = extractChunkText(res);
      if (text && text.trim()) {
        onChunk(text);
        const modelTag = res && res.model ? ` (${res.model})` : '';
        return { text, sourceLabel: `✨ SEYYAH_AI${modelTag}` };
      }
    }

    return null;
  }

  async function tryDirectGeminiStream(apiKey, systemPrompt, userPrompt, signal, onChunk) {
    const models = getCandidateModels();
    let lastError = null;

    for (let i = 0; i < models.length; i++) {
      if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const model = models[i];
      const sseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
      const payload = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.78, maxOutputTokens: 2400 }
      };

      const res = await fetch(sseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal
      });

      if (!res.ok) {
        let errMsg = `HTTP ${res.status}`;
        try {
          const errJson = await res.json();
          errMsg = (errJson && errJson.error && errJson.error.message) || errMsg;
        } catch (e) {}
        lastError = new Error(`${model}: ${errMsg}`);
        const retryable =
          res.status === 429 ||
          res.status === 404 ||
          res.status === 503 ||
          /quota|billing|limit|not found|high demand|overload|unavailable/i.test(errMsg);
        if (retryable && i < models.length - 1) continue;
        throw lastError;
      }

      if (res.body && typeof res.body.getReader === 'function') {
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let fullText = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;
            try {
              const obj = JSON.parse(jsonStr);
              const chunk = extractChunkText(obj);
              if (chunk) {
                fullText += chunk;
                onChunk(chunk);
              }
            } catch (e) {}
          }
        }

        if (fullText.trim()) {
          return { text: fullText, sourceLabel: `✨ Gemini Canlı Akış (${model})` };
        }
      }

      // Non-streaming fallback for environments without ReadableStream
      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const restRes = await fetch(restUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal
      });
      if (restRes.ok) {
        const data = await restRes.json();
        const text = extractChunkText(data);
        if (text && text.trim()) {
          onChunk(text);
          return { text, sourceLabel: `✨ Gemini AI (${model})` };
        }
      }

      lastError = new Error(`${model}: Boş yanıt döndü`);
    }

    throw lastError || new Error('Gemini API yanıt vermedi');
  }

  // ---------------------------------------------------------------------------
  // Scoped Styles (Dark + Light Theme Compatible)
  // ---------------------------------------------------------------------------
  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .agc-shell {
        max-width: 1140px;
        margin: 0 auto;
        padding: 8px 4px 42px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      /* Hero Banner */
      .agc-hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 14px;
        padding: 20px 24px;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(42, 24, 16, 0.72));
        border: 1px solid rgba(245, 158, 11, 0.3);
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.34);
        backdrop-filter: blur(16px);
      }

      body.light-theme .agc-hero {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(254, 243, 199, 0.72));
        border-color: rgba(217, 119, 6, 0.28);
        box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
      }

      .agc-hero-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .agc-hero-icon {
        width: 54px;
        height: 54px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        font-size: 1.7rem;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.24), rgba(234, 88, 12, 0.24));
        border: 1px solid rgba(245, 158, 11, 0.45);
        box-shadow: 0 0 24px rgba(245, 158, 11, 0.2);
        flex-shrink: 0;
      }

      .agc-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.42rem;
        font-weight: 800;
        margin: 0;
        background: linear-gradient(135deg, #ffffff 0%, #fbbf24 60%, #fb923c 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .agc-title {
        background: linear-gradient(135deg, #0f172a 0%, #b45309 65%, #ea580c 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .agc-subtitle {
        margin: 4px 0 0;
        font-size: 0.85rem;
        color: var(--text-secondary, #94a3b8);
      }

      .agc-hero-badges {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .agc-badge {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.14);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.32);
      }

      .agc-badge.is-ready {
        background: rgba(16, 185, 129, 0.14);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.32);
      }

      body.light-theme .agc-badge {
        background: rgba(217, 119, 6, 0.12);
        color: #b45309;
        border-color: rgba(217, 119, 6, 0.28);
      }

      body.light-theme .agc-badge.is-ready {
        background: rgba(5, 150, 105, 0.12);
        color: #047857;
        border-color: rgba(5, 150, 105, 0.28);
      }

      /* Studio Grid */
      .agc-studio-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
        gap: 16px;
        align-items: stretch;
      }

      .agc-card {
        padding: 20px 22px;
        border-radius: 18px;
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        box-shadow: var(--shadow-subtle, 0 12px 28px rgba(0, 0, 0, 0.28));
        backdrop-filter: blur(14px);
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      body.light-theme .agc-card {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
      }

      .agc-section-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--accent-gold, #f59e0b);
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .agc-province-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .agc-input-row {
        display: grid;
        grid-template-columns: 0.8fr 1.2fr;
        gap: 8px;
      }

      .agc-input,
      .agc-select {
        width: 100%;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.75);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.88rem;
        outline: none;
        transition: border-color 0.18s ease, box-shadow 0.18s ease;
      }

      .agc-input:focus,
      .agc-select:focus {
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18);
      }

      body.light-theme .agc-input,
      body.light-theme .agc-select {
        background: #f8fafc;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.16);
      }

      .agc-quick-cities {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .agc-quick-city-btn {
        font-size: 0.74rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(255, 255, 255, 0.04);
        color: var(--text-secondary, #94a3b8);
        cursor: pointer;
        transition: all 0.16s ease;
      }

      .agc-quick-city-btn:hover,
      .agc-quick-city-btn.active {
        background: rgba(245, 158, 11, 0.18);
        color: var(--accent-gold, #f59e0b);
        border-color: rgba(245, 158, 11, 0.45);
      }

      body.light-theme .agc-quick-city-btn {
        background: rgba(15, 23, 42, 0.04);
        color: #334155;
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .agc-quick-city-btn:hover,
      body.light-theme .agc-quick-city-btn.active {
        background: rgba(217, 119, 6, 0.14);
        color: #b45309;
        border-color: rgba(217, 119, 6, 0.42);
      }

      /* Pill Choice Grids */
      .agc-pill-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .agc-pill-grid.is-three {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .agc-choice-btn {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 3px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-primary, #f8fafc);
        cursor: pointer;
        text-align: left;
        transition: all 0.18s ease;
      }

      .agc-choice-btn:hover {
        border-color: rgba(245, 158, 11, 0.42);
        transform: translateY(-1px);
      }

      .agc-choice-btn.active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.16));
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.35), 0 8px 20px rgba(245, 158, 11, 0.14);
      }

      body.light-theme .agc-choice-btn {
        background: #f8fafc;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .agc-choice-btn.active {
        background: linear-gradient(135deg, rgba(254, 243, 199, 0.9), rgba(255, 237, 213, 0.9));
        border-color: #d97706;
        box-shadow: 0 0 0 1px rgba(217, 119, 6, 0.3), 0 6px 16px rgba(217, 119, 6, 0.12);
      }

      .agc-choice-title {
        font-size: 0.84rem;
        font-weight: 700;
      }

      .agc-choice-hint {
        font-size: 0.71rem;
        color: var(--text-muted, #64748b);
        line-height: 1.3;
      }

      /* Generate CTA Row */
      .agc-cta-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: auto;
      }

      .agc-btn-generate {
        flex: 1;
        min-width: 220px;
        padding: 12px 18px;
        border-radius: 13px;
        border: none;
        cursor: pointer;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.96rem;
        font-weight: 700;
        color: #0f172a;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 55%, #fb923c 100%);
        box-shadow: 0 10px 24px rgba(245, 158, 11, 0.28);
        transition: transform 0.16s ease, filter 0.16s ease, opacity 0.16s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .agc-btn-generate:hover:not(:disabled) {
        transform: translateY(-1px);
        filter: brightness(1.06);
      }

      .agc-btn-generate:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      .agc-btn-stop {
        padding: 11px 16px;
        border-radius: 13px;
        border: 1px solid rgba(239, 68, 68, 0.45);
        background: rgba(239, 68, 68, 0.14);
        color: #f87171;
        font-weight: 700;
        font-size: 0.86rem;
        cursor: pointer;
      }

      body.light-theme .agc-btn-stop {
        color: #dc2626;
        background: rgba(239, 68, 68, 0.1);
      }

      /* Live Province Specialties Preview Card */
      .agc-preview-header {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .agc-preview-thumb {
        width: 74px;
        height: 58px;
        border-radius: 12px;
        object-fit: cover;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        flex-shrink: 0;
      }

      .agc-preview-title-wrap {
        flex: 1;
        min-width: 0;
      }

      .agc-preview-city {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .agc-plate-pill {
        font-size: 0.72rem;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 8px;
        background: rgba(0, 242, 254, 0.14);
        color: var(--accent-cyan, #00f2fe);
        border: 1px solid rgba(0, 242, 254, 0.28);
      }

      body.light-theme .agc-plate-pill {
        background: rgba(2, 132, 199, 0.12);
        color: #0284c7;
        border-color: rgba(2, 132, 199, 0.28);
      }

      .agc-preview-meta {
        font-size: 0.78rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 3px;
      }

      .agc-preview-quote {
        font-size: 0.81rem;
        font-style: italic;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.45;
        padding: 9px 12px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.03);
        border-left: 3px solid var(--accent-gold, #f59e0b);
      }

      body.light-theme .agc-preview-quote {
        background: rgba(241, 245, 249, 0.9);
      }

      .agc-specialties-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .agc-specialty-tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 11px;
        border-radius: 999px;
        font-size: 0.79rem;
        font-weight: 600;
        background: rgba(245, 158, 11, 0.13);
        color: #fcd34d;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      body.light-theme .agc-specialty-tag {
        background: rgba(254, 243, 199, 0.95);
        color: #92400e;
        border-color: rgba(217, 119, 6, 0.34);
      }

      .agc-preview-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: auto;
        padding-top: 10px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .agc-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 13px;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.16));
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary, #f8fafc);
        font-size: 0.81rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.16s ease;
      }

      .agc-action-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.1);
      }

      .agc-action-btn.is-city {
        border-color: rgba(16, 185, 129, 0.38);
        background: rgba(16, 185, 129, 0.12);
        color: #34d399;
      }

      .agc-action-btn.is-city:hover {
        background: rgba(16, 185, 129, 0.22);
      }

      body.light-theme .agc-action-btn {
        background: #f1f5f9;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .agc-action-btn.is-city {
        background: rgba(5, 150, 105, 0.12);
        color: #047857;
        border-color: rgba(5, 150, 105, 0.32);
      }

      /* Output Card */
      .agc-output-card {
        padding: 22px 24px;
        border-radius: 20px;
        background: var(--bg-card, rgba(15, 23, 42, 0.82));
        border: 1px solid rgba(245, 158, 11, 0.24);
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(16px);
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      body.light-theme .agc-output-card {
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(217, 119, 6, 0.25);
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
      }

      .agc-output-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .agc-output-status {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .agc-source-pill {
        font-size: 0.74rem;
        font-weight: 700;
        padding: 5px 11px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.32);
      }

      .agc-source-pill.is-offline {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        border-color: rgba(245, 158, 11, 0.32);
      }

      body.light-theme .agc-source-pill {
        color: #047857;
      }

      body.light-theme .agc-source-pill.is-offline {
        color: #b45309;
      }

      .agc-output-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .agc-stream-body {
        font-size: 0.95rem;
        line-height: 1.72;
        color: var(--text-primary, #f8fafc);
      }

      .agc-stream-cursor {
        display: inline-block;
        width: 8px;
        height: 1.05em;
        margin-left: 4px;
        vertical-align: text-bottom;
        background: var(--accent-gold, #f59e0b);
        border-radius: 2px;
        animation: agcBlink 0.9s infinite;
      }

      @keyframes agcBlink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0.15; }
      }

      /* Markdown Typography inside Output */
      .agc-md-h2 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.28rem;
        font-weight: 800;
        margin: 0 0 12px;
        color: var(--accent-gold, #f59e0b);
      }

      .agc-md-h3 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.06rem;
        font-weight: 700;
        margin: 18px 0 8px;
        color: var(--accent-cyan, #00f2fe);
      }

      body.light-theme .agc-md-h3 {
        color: #0369a1;
      }

      .agc-md-h4 {
        font-size: 0.96rem;
        font-weight: 700;
        margin: 12px 0 6px;
        color: var(--text-primary, #f8fafc);
      }

      .agc-md-p {
        margin: 0 0 10px;
      }

      .agc-md-ul,
      .agc-md-ol {
        margin: 4px 0 12px;
        padding-left: 20px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .agc-md-quote {
        margin: 10px 0 14px;
        padding: 10px 14px;
        border-radius: 12px;
        background: rgba(245, 158, 11, 0.1);
        border-left: 3px solid var(--accent-gold, #f59e0b);
        color: var(--text-secondary, #cbd5e1);
        font-size: 0.9rem;
      }

      body.light-theme .agc-md-quote {
        background: rgba(254, 243, 199, 0.7);
        color: #334155;
      }

      .agc-md-hr {
        border: none;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        margin: 14px 0;
      }

      .agc-inline-code {
        font-family: monospace;
        font-size: 0.85em;
        padding: 2px 6px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.08);
      }

      body.light-theme .agc-inline-code {
        background: rgba(15, 23, 42, 0.08);
      }

      .agc-empty-output {
        text-align: center;
        padding: 28px 16px;
        color: var(--text-secondary, #94a3b8);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .agc-empty-icon {
        font-size: 2.2rem;
      }

      .agc-error-banner {
        font-size: 0.78rem;
        padding: 8px 12px;
        border-radius: 10px;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.3);
        color: var(--text-secondary, #cbd5e1);
      }

      /* Matching Real Flavor Cards Grid (TRAVEL_DATA) */
      .agc-flavors-section {
        padding: 20px 22px;
        border-radius: 20px;
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(14px);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      body.light-theme .agc-flavors-section {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
      }

      .agc-flavors-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
      }

      .agc-flavors-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.08rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        margin: 0;
      }

      .agc-region-filter-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .agc-region-chip {
        padding: 5px 11px;
        border-radius: 999px;
        font-size: 0.74rem;
        font-weight: 700;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.52);
        color: var(--text-secondary, #94a3b8);
        cursor: pointer;
        transition: all 0.16s ease;
      }

      .agc-region-chip:hover,
      .agc-region-chip.active {
        background: rgba(245, 158, 11, 0.2);
        border-color: var(--accent-gold, #f59e0b);
        color: var(--accent-gold, #fbbf24);
      }

      body.light-theme .agc-region-chip {
        background: #f1f5f9;
        color: #334155;
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .agc-region-chip.active {
        background: rgba(254, 243, 199, 0.95);
        color: #b45309;
        border-color: #d97706;
      }

      .agc-flavor-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
        gap: 12px;
      }

      .agc-flavor-card {
        border-radius: 14px;
        overflow: hidden;
        background: rgba(15, 23, 42, 0.64);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        transition: transform 0.18s ease, border-color 0.18s ease;
      }

      .agc-flavor-card:hover {
        transform: translateY(-3px);
        border-color: rgba(245, 158, 11, 0.45);
      }

      .agc-flavor-card.is-selected {
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.35);
      }

      body.light-theme .agc-flavor-card {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.1);
      }

      .agc-flavor-card-top {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 12px 8px;
      }

      .agc-flavor-thumb {
        width: 48px;
        height: 40px;
        border-radius: 9px;
        object-fit: cover;
        flex-shrink: 0;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
      }

      .agc-flavor-body {
        padding: 0 12px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }

      .agc-flavor-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .agc-flavor-tag {
        font-size: 0.73rem;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.13);
        color: #fcd34d;
        border: 1px solid rgba(245, 158, 11, 0.28);
      }

      .agc-flavor-tag.is-meal-hit {
        background: rgba(16, 185, 129, 0.16);
        color: #6ee7b7;
        border-color: rgba(16, 185, 129, 0.38);
      }

      body.light-theme .agc-flavor-tag {
        background: rgba(254, 243, 199, 0.9);
        color: #92400e;
      }

      body.light-theme .agc-flavor-tag.is-meal-hit {
        background: rgba(209, 250, 229, 0.95);
        color: #065f46;
      }

      .agc-flavor-actions {
        margin-top: auto;
        display: flex;
        gap: 6px;
        padding-top: 6px;
      }

      .agc-flavor-mini-btn {
        flex: 1;
        padding: 6px 8px;
        border-radius: 8px;
        font-size: 0.74rem;
        font-weight: 700;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary, #f8fafc);
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .agc-flavor-mini-btn:hover {
        border-color: var(--accent-gold, #f59e0b);
        color: var(--accent-gold, #fbbf24);
      }

      body.light-theme .agc-flavor-mini-btn {
        background: #ffffff;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.14);
      }

      @media (max-width: 900px) {
        .agc-studio-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .agc-input-row,
        .agc-pill-grid,
        .agc-pill-grid.is-three {
          grid-template-columns: 1fr;
        }
        .agc-hero,
        .agc-card,
        .agc-output-card {
          padding: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Module Main Renderer
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const safeCtx = ctx || {};
    const esc = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : fallbackEscape;
    const norm = typeof safeCtx.normalizeTurkish === 'function' ? safeCtx.normalizeTurkish : fallbackNormalize;
    const notify = (msg) => {
      if (typeof safeCtx.showToast === 'function') safeCtx.showToast(msg);
    };

    const provinces = buildProvincesList(safeCtx);
    if (!provinces.length) {
      container.innerHTML = `
        <div class="agc-shell">
          <div class="agc-card">
            <div class="agc-empty-output">
              <div class="agc-empty-icon">🍽️</div>
              <strong>İl verisi yüklenemedi</strong>
              <span>81 il gastronomi verisi bulunamadığı için şef stüdyosu başlatılamadı.</span>
            </div>
          </div>
        </div>`;
      return;
    }

    const provinceMap = new Map();
    provinces.forEach((p) => provinceMap.set(p.key, p));

    // Resolve initial selected province
    if (!uiState.selectedKey || !provinceMap.has(uiState.selectedKey)) {
      const ctxSelected = safeCtx.state && safeCtx.state.selectedCityKey;
      const savedKey = loadLastCityKey();
      const gaziantep = provinces.find((p) => p.plate === 27);
      if (ctxSelected && provinceMap.has(ctxSelected)) {
        uiState.selectedKey = ctxSelected;
      } else if (savedKey && provinceMap.has(savedKey)) {
        uiState.selectedKey = savedKey;
      } else if (gaziantep) {
        uiState.selectedKey = gaziantep.key;
      } else {
        uiState.selectedKey = provinces[0].key;
      }
    }

    const quickProvinces = QUICK_GASTRO_PLATES
      .map((plate) => provinces.find((p) => p.plate === plate))
      .filter(Boolean);

    function cancelActiveStream() {
      uiState.streamRunId += 1;
      if (uiState.abortController) {
        try {
          uiState.abortController.abort();
        } catch (e) {}
        uiState.abortController = null;
      }
      if (uiState.offlineTimer) {
        clearTimeout(uiState.offlineTimer);
        uiState.offlineTimer = null;
      }
      uiState.isStreaming = false;
    }

    function getSelectedProvince() {
      return provinceMap.get(uiState.selectedKey) || provinces[0];
    }

    function renderProvinceSelectOptions(selectedKey, filterText) {
      const q = norm(filterText || '');
      let list = provinces;
      if (q) {
        list = provinces.filter((p) => {
          const blob = norm(`${padPlate(p.plate)} ${p.name} ${p.region} ${p.specialties.join(' ')}`);
          return blob.includes(q);
        });
      }
      if (!list.length) {
        list = provinces;
      }
      return list
        .map((p) => {
          const sel = p.key === selectedKey ? ' selected' : '';
          return `<option value="${esc(p.key)}"${sel}>${esc(padPlate(p.plate))} • ${esc(p.name)} (${esc(p.region)})</option>`;
        })
        .join('');
    }

    function renderProvincePreviewHtml(prov) {
      const specsHtml = prov.specialties.length
        ? prov.specialties
            .map((sp) => `<span class="agc-specialty-tag">🍴 ${esc(sp)}</span>`)
            .join('')
        : `<span class="agc-specialty-tag">🍴 ${esc(prov.name)} Yöresel Mutfağı</span>`;

      const statusText = prov.visited ? '✅ Gezildi' : '⏳ Keşif Bekliyor';
      const thumbHtml = prov.banner_rel
        ? `<img class="agc-preview-thumb" src="${esc(prov.banner_rel)}" alt="${esc(prov.name)}" onerror="this.style.display='none'" />`
        : '';

      return `
        <div class="agc-section-label">
          <span>📍 Seçili İl &amp; Gerçek Yöresel Lezzetler</span>
          <span>${esc(statusText)}</span>
        </div>

        <div class="agc-preview-header">
          ${thumbHtml}
          <div class="agc-preview-title-wrap">
            <div class="agc-preview-city">
              <span class="agc-plate-pill">${esc(padPlate(prov.plate))}</span>
              <span>${esc(prov.name)}</span>
            </div>
            <div class="agc-preview-meta">${esc(prov.region)} Bölgesi • ${prov.specialties.length} tescilli lezzet etiketi</div>
          </div>
        </div>

        ${prov.quote ? `<div class="agc-preview-quote">“${esc(prov.quote)}”</div>` : ''}

        <div>
          <div class="agc-section-label" style="margin-bottom:8px;">
            <span>🏷️ İlin Gerçek Lezzet Etiketleri (specialties)</span>
          </div>
          <div class="agc-specialties-wrap">${specsHtml}</div>
        </div>

        <div class="agc-preview-footer">
          <span style="font-size:0.75rem; color:var(--text-muted, #64748b);">
            ${prov.landmarks[0] ? `🏛️ ${esc(prov.landmarks[0])}` : 'Anadolu Sofra Durağı'}
          </span>
          <button type="button" class="agc-action-btn is-city" data-agc-go-city="${esc(prov.key)}">
            📍 İlin Sayfasına Git
          </button>
        </div>
      `;
    }

    function renderOutputCardHtml() {
      const prov = getSelectedProvince();
      const hasOutput = Boolean(uiState.outputMarkdown && uiState.outputMarkdown.trim());

      if (!hasOutput && !uiState.isStreaming) {
        return `
          <div class="agc-output-card">
            <div class="agc-empty-output">
              <div class="agc-empty-icon">🥘</div>
              <strong style="color:var(--text-primary, #f8fafc); font-size:1rem;">
                ${esc(prov.name)} sofrası kurulmaya hazır
              </strong>
              <span style="max-width:560px; font-size:0.86rem; line-height:1.5;">
                Yukarıdan il, öğün vakti ve beslenme/bütçe tarzını seçip
                <strong>“✨ AI Gurme Rotası Oluştur”</strong> butonuna basın; otantik yemekler,
                tarihî köken, ideal tadım sırası, çay/kahve eşleşmesi ve bütçe tahmini anında hazırlansın.
              </span>
              <div class="agc-output-actions" style="margin-top:8px;justify-content:center;">
                <button type="button" class="agc-action-btn" data-agc-copy>
                  🧾 Gurme Tadım Menüsünü Kopyala
                </button>
                <button type="button" class="agc-action-btn" data-agc-download>
                  📥 Gurme Tadım Menüsünü İndir (.md)
                </button>
              </div>
            </div>
          </div>
        `;
      }

      const targetKey = (uiState.generatedMeta && uiState.generatedMeta.key) || prov.key;
      const isOffline = uiState.sourceMode === 'offline';
      const sourceText = uiState.isStreaming
        ? '⏳ Gurme Şef Sofrayı Hazırlıyor...'
        : uiState.sourceLabel || '✨ Hazır';

      return `
        <div class="agc-output-card">
          <div class="agc-output-toolbar">
            <div class="agc-output-status">
              <span class="agc-source-pill ${isOffline ? 'is-offline' : ''}">${esc(sourceText)}</span>
              ${
                uiState.generatedMeta
                  ? `<span style="font-size:0.76rem; color:var(--text-secondary, #94a3b8);">${esc(uiState.generatedMeta.cityName)} • ${esc(uiState.generatedMeta.mealLabel)} • ${esc(uiState.generatedMeta.dietLabel)}</span>`
                  : ''
              }
            </div>
            <div class="agc-output-actions">
              <button type="button" class="agc-action-btn" data-agc-copy ${!hasOutput ? 'disabled' : ''}>
                🧾 Gurme Tadım Menüsünü Kopyala
              </button>
              <button type="button" class="agc-action-btn" data-agc-download ${!hasOutput ? 'disabled' : ''}>
                📥 Gurme Tadım Menüsünü İndir
              </button>
              <button type="button" class="agc-action-btn is-city" data-agc-go-city="${esc(targetKey)}">
                📍 İlin Sayfasına Git
              </button>
            </div>
          </div>

          ${uiState.errorNote ? `<div class="agc-error-banner">ℹ️ ${esc(uiState.errorNote)}</div>` : ''}

          <div class="agc-stream-body" data-agc-stream-body>
            ${renderMarkdownToHtml(uiState.outputMarkdown, esc)}${uiState.isStreaming ? '<span class="agc-stream-cursor" aria-hidden="true"></span>' : ''}
          </div>
        </div>
      `;
    }

    function renderMatchingFlavorCardsHtml(selectedProv) {
      const meal = getOption(MEAL_TIMES, uiState.mealId);
      const regionCodes = [
        { id: 'selected', label: `📍 ${selectedProv.region}` },
        { id: 'all', label: '🇹🇷 Tüm 81 İl' },
        { id: '07_GuneydoguAnadolu', label: 'Güneydoğu' },
        { id: '03_Akdeniz', label: 'Akdeniz' },
        { id: '02_Ege', label: 'Ege' },
        { id: '04_IcAnadolu', label: 'İç Anadolu' },
        { id: '01_Marmara', label: 'Marmara' },
        { id: '05_Karadeniz', label: 'Karadeniz' },
        { id: '06_DoguAnadolu', label: 'Doğu Anadolu' }
      ];

      const activeRegionCode = uiState.matchRegionFilter === 'selected'
        ? selectedProv.region_code
        : uiState.matchRegionFilter;

      const filtered = provinces.filter((p) => {
        if (!p.specialties.length) return false;
        if (activeRegionCode === 'all' || !activeRegionCode) return true;
        return p.region_code === activeRegionCode;
      });

      const ranked = filtered
        .map((p) => {
          const g = classifySpecialties(p.specialties, norm);
          let mealHits = [];
          if (meal.id === 'kahvalti') mealHits = g.pastries.concat(g.drinks);
          else if (meal.id === 'tatli') mealHits = g.sweets.concat(g.drinks);
          else if (meal.id === 'ogle') mealHits = g.soups.concat(g.mains, g.pastries);
          else mealHits = g.mains.concat(g.soups, g.sweets);

          const hitSet = new Set(mealHits);
          const score = mealHits.length * 12 + p.specialties.length * 3 + (p.key === selectedProv.key ? 15 : 0);
          return { p, hitSet, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

      const cardsHtml = ranked.map(({ p, hitSet }) => {
        const orderedSpecs = p.specialties
          .slice()
          .sort((a, b) => (hitSet.has(b) ? 1 : 0) - (hitSet.has(a) ? 1 : 0))
          .slice(0, 4);

        return `
          <article class="agc-flavor-card ${p.key === selectedProv.key ? 'is-selected' : ''}">
            <div class="agc-flavor-card-top">
              <img
                class="agc-flavor-thumb"
                src="${esc(p.banner_rel || 'assets/banner.jpg')}"
                alt="${esc(p.name)}"
                loading="lazy"
                onerror="if(this.dataset.fb!=='1'){this.dataset.fb='1';this.src='assets/banner.jpg';}"
              />
              <div style="min-width:0;flex:1;">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <span class="agc-plate-pill">${esc(padPlate(p.plate))}</span>
                  <strong style="font-family:var(--font-heading);font-size:0.94rem;color:var(--text-primary);">${esc(p.name)}</strong>
                </div>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">${esc(p.region)} • ${p.specialties.length} lezzet</div>
              </div>
            </div>
            <div class="agc-flavor-body">
              <div class="agc-flavor-tags">
                ${orderedSpecs.map((sp) => `<span class="agc-flavor-tag ${hitSet.has(sp) ? 'is-meal-hit' : ''}">${hitSet.has(sp) ? '★ ' : '🍴 '}${esc(sp)}</span>`).join('')}
              </div>
              <div class="agc-flavor-actions">
                <button type="button" class="agc-flavor-mini-btn" data-agc-pick-city="${esc(p.key)}">👨‍🍳 Şehir Seç</button>
                <button type="button" class="agc-flavor-mini-btn" data-agc-go-city="${esc(p.key)}">📍 İncele</button>
              </div>
            </div>
          </article>
        `;
      }).join('');

      return `
        <section class="agc-flavors-section" aria-label="Şehirlerin Eşleşen Gerçek Lezzet Kartları">
          <div class="agc-flavors-head">
            <div>
              <h3 class="agc-flavors-title">🍽️ Şehirlerin Eşleşen Gerçek Lezzet Kartları</h3>
              <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">
                <strong>${esc(meal.shortLabel)}</strong> için TRAVEL_DATA envanterinden eşleşen gerçek yöresel tatlar (★ seçili öğünle birebir uyumlu)
              </div>
            </div>
            <div class="agc-region-filter-bar">
              ${regionCodes.map((rc) => `
                <button
                  type="button"
                  class="agc-region-chip ${uiState.matchRegionFilter === rc.id ? 'active' : ''}"
                  data-agc-region-filter="${esc(rc.id)}"
                >${esc(rc.label)}</button>
              `).join('')}
            </div>
          </div>
          <div class="agc-flavor-grid">
            ${cardsHtml || '<div style="font-size:0.84rem;color:var(--text-muted);">Bu filtrede eşleşen lezzet kartı bulunamadı.</div>'}
          </div>
        </section>
      `;
    }

    function updateStreamBodyOnly() {
      const bodyEl = container.querySelector('[data-agc-stream-body]');
      if (!bodyEl) {
        const outWrap = container.querySelector('[data-agc-output-wrap]');
        if (outWrap) outWrap.innerHTML = renderOutputCardHtml();
        return;
      }
      bodyEl.innerHTML =
        renderMarkdownToHtml(uiState.outputMarkdown, esc) +
        (uiState.isStreaming ? '<span class="agc-stream-cursor" aria-hidden="true"></span>' : '');
    }

    function runOfflineWordStream(fullText, runId, onDone) {
      const tokens = fullText.match(/\S+\s*/g) || [fullText];
      let idx = 0;
      const chunkStep = Math.max(2, Math.ceil(tokens.length / 85));

      function tick() {
        if (uiState.streamRunId !== runId) return;
        const slice = tokens.slice(idx, idx + chunkStep).join('');
        idx += chunkStep;
        uiState.outputMarkdown += slice;
        updateStreamBodyOnly();

        if (idx < tokens.length) {
          uiState.offlineTimer = setTimeout(tick, 18);
        } else {
          uiState.offlineTimer = null;
          onDone();
        }
      }

      tick();
    }

    async function handleGenerate() {
      if (uiState.isStreaming) {
        cancelActiveStream();
      }

      const prov = getSelectedProvince();
      const meal = getOption(MEAL_TIMES, uiState.mealId);
      const diet = getOption(DIET_STYLES, uiState.dietId);

      uiState.streamRunId += 1;
      const runId = uiState.streamRunId;
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      uiState.abortController = controller;
      uiState.isStreaming = true;
      uiState.outputMarkdown = '';
      uiState.errorNote = '';
      uiState.sourceMode = '';
      uiState.sourceLabel = '';
      uiState.generatedMeta = {
        key: prov.key,
        slug: prov.slug,
        cityName: prov.name,
        mealId: meal.id,
        mealLabel: meal.shortLabel,
        dietLabel: diet.shortLabel
      };

      renderFull();

      const { systemPrompt, userPrompt } = buildChefPrompt(prov, meal, diet);
      const signal = controller ? controller.signal : undefined;

      let rafPending = false;
      const scheduleDomRefresh = () => {
        if (rafPending || uiState.streamRunId !== runId) return;
        rafPending = true;
        const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (fn) => setTimeout(fn, 16);
        raf(() => {
          rafPending = false;
          if (uiState.streamRunId === runId) {
            updateStreamBodyOnly();
          }
        });
      };

      const onChunk = (delta) => {
        if (uiState.streamRunId !== runId) return;
        uiState.outputMarkdown += delta;
        scheduleDomRefresh();
      };

      try {
        let aiResult = null;
        const aiObj = typeof window !== 'undefined' ? window.SEYYAH_AI : null;
        const hasConfiguredKey = Boolean(
          (aiObj && typeof aiObj.hasKey === 'function' && aiObj.hasKey()) ||
          getStoredGeminiKey()
        );

        // Instant API-keyless local gourmet menu synthesis (zero network wait)
        if (!hasConfiguredKey) {
          const offlineMarkdown = buildOfflineChefGuide(prov, meal, diet, norm);
          uiState.outputMarkdown = offlineMarkdown;
          uiState.sourceMode = 'offline';
          uiState.sourceLabel = '⚡ Anlık Bilgi Grafiği Şefi (TRAVEL_DATA)';
          uiState.errorNote = '';
          uiState.isStreaming = false;
          uiState.abortController = null;
          renderFull();
          notify(`🍽️ ${prov.name} gurme tadım menüsü anında hazırlandı!`);
          return;
        }

        // 1. Primary Engine: window.SEYYAH_AI.stream
        if (aiObj) {
          const cacheKey = `aiChef:${prov.key}:${meal.id}:${diet.id}`;
          try {
            aiResult = await trySeyyahAiStream(systemPrompt, userPrompt, cacheKey, signal, onChunk);
            if (aiResult) {
              uiState.sourceMode = 'seyyah-ai';
              uiState.sourceLabel = aiResult.sourceLabel;
            }
          } catch (seyyahErr) {
            if (signal && signal.aborted) throw seyyahErr;
            // Reset partial output only if nothing substantial streamed before error
            if (uiState.outputMarkdown.trim().length < 40) {
              uiState.outputMarkdown = '';
              uiState.errorNote = `SEYYAH_AI akışı kullanılamadı (${seyyahErr.message || 'bağlantı'}), yedek motora geçildi.`;
            } else {
              aiResult = { text: uiState.outputMarkdown, sourceLabel: '✨ window.SEYYAH_AI (Kısmi)' };
              uiState.sourceMode = 'seyyah-ai';
              uiState.sourceLabel = aiResult.sourceLabel;
            }
          }
        }

        // 2. Secondary Engine: Direct Gemini BYOK Streaming if key exists in localStorage
        if (!aiResult && (!signal || !signal.aborted)) {
          const byokKey = getStoredGeminiKey();
          if (byokKey) {
            try {
              aiResult = await tryDirectGeminiStream(byokKey, systemPrompt, userPrompt, signal, onChunk);
              uiState.sourceMode = 'gemini-direct';
              uiState.sourceLabel = aiResult.sourceLabel;
              uiState.errorNote = '';
            } catch (gemErr) {
              if (signal && signal.aborted) throw gemErr;
              uiState.outputMarkdown = '';
              uiState.errorNote = `Canlı AI bağlantısı kurulamadı (${gemErr.message || 'API hatası'}); ilin gerçek specialties verileriyle Çevrimdışı Şef Rehberi hazırlandı.`;
            }
          }
        }

        if (uiState.streamRunId !== runId || (signal && signal.aborted)) return;

        if (aiResult && uiState.outputMarkdown.trim()) {
          uiState.isStreaming = false;
          uiState.abortController = null;
          renderFull();
          notify(`🍽️ ${prov.name} gurme rehberi hazır!`);
          return;
        }

        // 3. Clean Offline Fallback using p.specialties
        const offlineMarkdown = buildOfflineChefGuide(prov, meal, diet, norm);
        uiState.sourceMode = 'offline';
        uiState.sourceLabel = '📚 Çevrimdışı Şef Rehberi (p.specialties)';
        if (!uiState.errorNote && !getStoredGeminiKey()) {
          uiState.errorNote = 'Canlı Gemini API anahtarı bulunmadığı için ilin gerçek specialties envanteriyle Çevrimdışı Şef Rehberi akıtıldı.';
        }

        runOfflineWordStream(offlineMarkdown, runId, () => {
          if (uiState.streamRunId !== runId) return;
          uiState.isStreaming = false;
          uiState.abortController = null;
          renderFull();
          notify(`🍽️ ${prov.name} sofra rehberi oluşturuldu!`);
        });
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        if (uiState.streamRunId !== runId) return;
        uiState.isStreaming = false;
        uiState.abortController = null;
        const offlineMarkdown = buildOfflineChefGuide(prov, meal, diet, norm);
        uiState.outputMarkdown = offlineMarkdown;
        uiState.sourceMode = 'offline';
        uiState.sourceLabel = '📚 Çevrimdışı Şef Rehberi (p.specialties)';
        uiState.errorNote = 'Bağlantı kesildiği için ilin gerçek specialties verileriyle çevrimdışı rehber sunuldu.';
        renderFull();
      }
    }

    function bindEvents() {
      const searchInput = container.querySelector('[data-agc-search]');
      const selectEl = container.querySelector('[data-agc-province-select]');
      const genBtn = container.querySelector('[data-agc-generate]');
      const stopBtn = container.querySelector('[data-agc-stop]');
      const copyBtn = container.querySelector('[data-agc-copy]');
      const downloadBtn = container.querySelector('[data-agc-download]');

      if (searchInput && selectEl) {
        searchInput.addEventListener('input', (e) => {
          uiState.searchFilter = e.target.value;
          const q = norm(uiState.searchFilter);
          selectEl.innerHTML = renderProvinceSelectOptions(uiState.selectedKey, uiState.searchFilter);
          // Auto-select first match if current selection filtered out
          if (q) {
            const firstMatch = provinces.find((p) =>
              norm(`${padPlate(p.plate)} ${p.name} ${p.region} ${p.specialties.join(' ')}`).includes(q)
            );
            if (firstMatch && firstMatch.key !== uiState.selectedKey) {
              uiState.selectedKey = firstMatch.key;
              saveLastCityKey(firstMatch.key);
              selectEl.value = firstMatch.key;
              const previewBox = container.querySelector('[data-agc-preview-card]');
              if (previewBox) previewBox.innerHTML = renderProvincePreviewHtml(firstMatch);
              bindCityNavigationButtons();
            }
          }
        });
      }

      if (selectEl) {
        selectEl.addEventListener('change', (e) => {
          const nextKey = e.target.value;
          if (!provinceMap.has(nextKey)) return;
          uiState.selectedKey = nextKey;
          saveLastCityKey(nextKey);
          const prov = getSelectedProvince();
          const previewBox = container.querySelector('[data-agc-preview-card]');
          if (previewBox) previewBox.innerHTML = renderProvincePreviewHtml(prov);
          const flavorsWrap = container.querySelector('[data-agc-flavors-wrap]');
          if (flavorsWrap) {
            flavorsWrap.innerHTML = renderMatchingFlavorCardsHtml(prov);
            bindFlavorCardEvents();
          }
          container.querySelectorAll('[data-agc-quick-city]').forEach((btn) => {
            btn.classList.toggle('active', btn.getAttribute('data-agc-quick-city') === nextKey);
          });
          bindCityNavigationButtons();
        });
      }

      container.querySelectorAll('[data-agc-quick-city]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const nextKey = btn.getAttribute('data-agc-quick-city');
          if (!provinceMap.has(nextKey)) return;
          uiState.selectedKey = nextKey;
          uiState.searchFilter = '';
          saveLastCityKey(nextKey);
          renderFull();
        });
      });

      container.querySelectorAll('[data-agc-meal]').forEach((btn) => {
        btn.addEventListener('click', () => {
          uiState.mealId = btn.getAttribute('data-agc-meal');
          container.querySelectorAll('[data-agc-meal]').forEach((b) =>
            b.classList.toggle('active', b === btn)
          );
          const flavorsWrap = container.querySelector('[data-agc-flavors-wrap]');
          if (flavorsWrap) {
            flavorsWrap.innerHTML = renderMatchingFlavorCardsHtml(getSelectedProvince());
            bindFlavorCardEvents();
          }
        });
      });

      container.querySelectorAll('[data-agc-diet]').forEach((btn) => {
        btn.addEventListener('click', () => {
          uiState.dietId = btn.getAttribute('data-agc-diet');
          container.querySelectorAll('[data-agc-diet]').forEach((b) =>
            b.classList.toggle('active', b === btn)
          );
        });
      });

      if (genBtn) {
        genBtn.addEventListener('click', handleGenerate);
      }

      if (stopBtn) {
        stopBtn.addEventListener('click', () => {
          cancelActiveStream();
          renderFull();
          notify('⏹ Akış durduruldu.');
        });
      }

      function getExportableMenuMarkdown() {
        if (uiState.outputMarkdown && uiState.outputMarkdown.trim()) {
          return uiState.outputMarkdown;
        }
        const prov = getSelectedProvince();
        const meal = getOption(MEAL_TIMES, uiState.mealId);
        const diet = getOption(DIET_STYLES, uiState.dietId);
        return buildOfflineChefGuide(prov, meal, diet, norm);
      }

      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          const textToCopy = getExportableMenuMarkdown();
          if (!textToCopy.trim()) return;
          const ok = await copyToClipboard(textToCopy);
          if (ok) {
            const origText = copyBtn.textContent;
            copyBtn.textContent = '✅ Menü Kopyalandı';
            notify('🧾 Gurme tadım menüsü panoya kopyalandı!');
            setTimeout(() => {
              if (copyBtn.isConnected) copyBtn.textContent = origText;
            }, 1800);
          } else {
            notify('⚠️ Pano erişimi sağlanamadı.');
          }
        });
      }

      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          const textToSave = getExportableMenuMarkdown();
          if (!textToSave.trim()) return;
          const prov = getSelectedProvince();
          const m = uiState.generatedMeta || { slug: prov.slug, mealId: uiState.mealId };
          const filename = `gurme-tadim-menusu-${m.slug || 'anadolu'}-${m.mealId || 'sofra'}.md`;
          downloadMarkdown(filename, textToSave);
          notify(`🧾 ${filename} indirildi!`);
        });
      }

      bindFlavorCardEvents();
      bindCityNavigationButtons();
    }

    function bindFlavorCardEvents() {
      container.querySelectorAll('[data-agc-region-filter]').forEach((btn) => {
        btn.onclick = () => {
          uiState.matchRegionFilter = btn.getAttribute('data-agc-region-filter') || 'selected';
          const flavorsWrap = container.querySelector('[data-agc-flavors-wrap]');
          if (flavorsWrap) {
            flavorsWrap.innerHTML = renderMatchingFlavorCardsHtml(getSelectedProvince());
            bindFlavorCardEvents();
            bindCityNavigationButtons();
          }
        };
      });

      container.querySelectorAll('[data-agc-pick-city]').forEach((btn) => {
        btn.onclick = () => {
          const nextKey = btn.getAttribute('data-agc-pick-city');
          if (!provinceMap.has(nextKey)) return;
          uiState.selectedKey = nextKey;
          uiState.searchFilter = '';
          saveLastCityKey(nextKey);
          renderFull();
          notify(`👨‍🍳 ${provinceMap.get(nextKey).name} gurme stüdyosuna seçildi!`);
        };
      });
    }

    function bindCityNavigationButtons() {
      container.querySelectorAll('[data-agc-go-city]').forEach((btn) => {
        btn.onclick = () => {
          const key = btn.getAttribute('data-agc-go-city');
          if (key && typeof safeCtx.selectCity === 'function') {
            safeCtx.selectCity(key);
          } else {
            notify('⚠️ Şehir sayfası yönlendiricisi bulunamadı.');
          }
        };
      });
    }

    function renderFull() {
      const prov = getSelectedProvince();
      const aiObj = typeof window !== 'undefined' ? window.SEYYAH_AI : null;
      const hasAiCore = Boolean(aiObj && typeof aiObj.stream === 'function');
      const hasByokKey = Boolean(
        (aiObj && typeof aiObj.hasKey === 'function' ? aiObj.hasKey() : false) ||
        getStoredGeminiKey()
      );
      const isHttp = typeof window !== 'undefined' && window.location && /^https?:$/i.test(window.location.protocol);
      const engineReady = hasByokKey || (hasAiCore && isHttp);
      const badgeLabel = hasAiCore && hasByokKey
        ? '⚡ SEYYAH_AI Canlı Akış Aktif'
        : hasByokKey
          ? '⚡ Gemini BYOK Akış Hazır'
          : (hasAiCore && isHttp)
            ? '⚡ SEYYAH_AI Sunucu / Yedek Modu'
            : '📚 Çevrimdışı Şef Modu Hazır';

      container.innerHTML = `
        <section class="agc-shell" aria-label="AI Anadolu Gurme Şefi ve Sofra Rehberi">
          <header class="agc-hero">
            <div class="agc-hero-left">
              <div class="agc-hero-icon" aria-hidden="true">🍽️</div>
              <div>
                <h2 class="agc-title">🍽️ AI Anadolu Gurme Şefi &amp; Sofra Rehberi</h2>
                <p class="agc-subtitle">
                  81 ilin tescilli lezzetlerinden tarihî kökenine, ideal tadım sırasından çay-kahve eşleşmesine canlı gurme stüdyosu
                </p>
              </div>
            </div>
            <div class="agc-hero-badges">
              <span class="agc-badge ${engineReady ? 'is-ready' : ''}">
                ${esc(badgeLabel)}
              </span>
              <span class="agc-badge">81 İl • Gerçek Specialties</span>
            </div>
          </header>

          <div class="agc-studio-grid">
            <!-- Left Card: Controls -->
            <div class="agc-card">
              <div class="agc-province-controls">
                <div class="agc-section-label">
                  <span>1. İl Seçimi (81 İl)</span>
                  <span style="font-weight:500; text-transform:none; color:var(--text-muted, #64748b);">Plaka veya isimle ara</span>
                </div>
                <div class="agc-input-row">
                  <input
                    type="text"
                    class="agc-input"
                    data-agc-search
                    value="${esc(uiState.searchFilter)}"
                    placeholder="🔍 İl veya lezzet ara..."
                    aria-label="İl veya yöresel lezzet ara"
                  />
                  <select class="agc-select" data-agc-province-select aria-label="İl Seçici">
                    ${renderProvinceSelectOptions(uiState.selectedKey, uiState.searchFilter)}
                  </select>
                </div>
                <div class="agc-quick-cities" aria-label="Popüler Gastronomi Şehirleri">
                  ${quickProvinces
                    .map(
                      (qp) => `
                      <button
                        type="button"
                        class="agc-quick-city-btn ${qp.key === prov.key ? 'active' : ''}"
                        data-agc-quick-city="${esc(qp.key)}"
                      >${esc(qp.name)}</button>`
                    )
                    .join('')}
                </div>
              </div>

              <div>
                <div class="agc-section-label"><span>2. Öğün Vakti</span></div>
                <div class="agc-pill-grid">
                  ${MEAL_TIMES.map(
                    (m) => `
                    <button
                      type="button"
                      class="agc-choice-btn ${m.id === uiState.mealId ? 'active' : ''}"
                      data-agc-meal="${esc(m.id)}"
                    >
                      <span class="agc-choice-title">${esc(m.label)}</span>
                      <span class="agc-choice-hint">${esc(m.hint)}</span>
                    </button>`
                  ).join('')}
                </div>
              </div>

              <div>
                <div class="agc-section-label"><span>3. Sofra Tarzı &amp; Bütçe</span></div>
                <div class="agc-pill-grid is-three">
                  ${DIET_STYLES.map(
                    (d) => `
                    <button
                      type="button"
                      class="agc-choice-btn ${d.id === uiState.dietId ? 'active' : ''}"
                      data-agc-diet="${esc(d.id)}"
                    >
                      <span class="agc-choice-title">${esc(d.label)}</span>
                    </button>`
                  ).join('')}
                </div>
              </div>

              <div class="agc-cta-row">
                <button
                  type="button"
                  class="agc-btn-generate"
                  data-agc-generate
                  ${uiState.isStreaming ? 'disabled' : ''}
                >
                  ${uiState.isStreaming ? '⏳ Gurme Rotası Akıyor...' : '✨ AI Gurme Rotası Oluştur'}
                </button>
                ${
                  uiState.isStreaming
                    ? '<button type="button" class="agc-btn-stop" data-agc-stop>⏹ Durdur</button>'
                    : ''
                }
              </div>
            </div>

            <!-- Right Card: Live Province Specialties Preview -->
            <div class="agc-card" data-agc-preview-card>
              ${renderProvincePreviewHtml(prov)}
            </div>
          </div>

          <div data-agc-output-wrap>
            ${renderOutputCardHtml()}
          </div>

          <div data-agc-flavors-wrap>
            ${renderMatchingFlavorCardsHtml(prov)}
          </div>
        </section>
      `;

      bindEvents();
    }

    renderFull();
  }

  window.SEYYAH_MODULES.aiChef = { render };
})();
