/**
 * Anadolu Seyahatnamesi — Şehrin Metafiziği, Umran Okuması ve İrfan Kitabesi
 * Automatic in-page philosophical enhancer for all 81 province detail pages.
 * Registers on: window.SEYYAH_MODULES.citySoul = { init(ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-soul-inscription-styles';
  const VIEWPORT_ID = 'viewport-content';
  const CARD_CLASS = 'seyyah-soul-inscription';

  let activeCtx = null;
  let observer = null;
  let initialized = false;
  let isInjecting = false;
  let activeStreamToken = 0;

  // Per-session essay cache keyed by cityKey
  const essayCache = new Map();

  // ---------------------------------------------------------------------------
  // Utilities & Safe Escaping
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

  function esc(str) {
    if (activeCtx && typeof activeCtx.escapeHtml === 'function') {
      return activeCtx.escapeHtml(str);
    }
    return defaultEscapeHtml(str);
  }

  function normTr(str) {
    if (activeCtx && typeof activeCtx.normalizeTurkish === 'function') {
      return activeCtx.normalizeTurkish(String(str || ''));
    }
    return String(str || '')
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

  function notify(msg) {
    if (activeCtx && typeof activeCtx.showToast === 'function') {
      activeCtx.showToast(msg);
      return;
    }
    const container = document.getElementById('toast-container');
    if (!container) return;
    const item = document.createElement('div');
    item.className = 'toast-item';
    item.textContent = msg;
    container.appendChild(item);
    setTimeout(() => {
      item.style.opacity = '0';
      item.style.transition = 'opacity 0.25s ease';
      setTimeout(() => item.remove(), 260);
    }, 2400);
  }

  function stripMarkdownSyntax(text) {
    return String(text || '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .trim();
  }

  function renderSafeMarkdown(mdText) {
    if (
      typeof window !== 'undefined' &&
      window.SEYYAH_AI &&
      typeof window.SEYYAH_AI.renderMarkdown === 'function'
    ) {
      return window.SEYYAH_AI.renderMarkdown(mdText);
    }

    const lines = String(mdText || '').split(/\r?\n/);
    const out = [];
    let inList = false;

    function inlineFmt(raw) {
      let s = esc(raw);
      s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
      return s;
    }

    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (!t) {
        if (inList) {
          out.push('</ul>');
          inList = false;
        }
        continue;
      }
      const h = t.match(/^(#{1,4})\s+(.+)$/);
      if (h) {
        if (inList) {
          out.push('</ul>');
          inList = false;
        }
        const lvl = Math.min(4, Math.max(2, h[1].length));
        out.push(`<h${lvl} class="seyyah-soul-md-h">${inlineFmt(h[2])}</h${lvl}>`);
        continue;
      }
      const q = t.match(/^>\s?(.*)$/);
      if (q) {
        if (inList) {
          out.push('</ul>');
          inList = false;
        }
        out.push(`<blockquote class="seyyah-soul-md-quote">${inlineFmt(q[1])}</blockquote>`);
        continue;
      }
      const li = t.match(/^[-*•]\s+(.+)$/);
      if (li) {
        if (!inList) {
          out.push('<ul class="seyyah-soul-md-list">');
          inList = true;
        }
        out.push(`<li>${inlineFmt(li[1])}</li>`);
        continue;
      }
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<p>${inlineFmt(t)}</p>`);
    }
    if (inList) out.push('</ul>');
    return out.join('\n');
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return Promise.resolve(ok);
    } catch (_) {
      return Promise.resolve(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Quote & Literary Citation Parsing
  // ---------------------------------------------------------------------------
  function parseLiteraryQuote(raw) {
    const cleaned = stripMarkdownSyntax(raw);
    const sepIdx = cleaned.lastIndexOf('—');
    if (sepIdx > 0) {
      const body = cleaned.slice(0, sepIdx).trim().replace(/^["“]+|["”]+$/g, '').trim();
      const author = cleaned.slice(sepIdx + 1).trim();
      return { body, author };
    }
    return {
      body: cleaned.replace(/^["“]+|["”]+$/g, '').trim(),
      author: ''
    };
  }

  // ---------------------------------------------------------------------------
  // İbn Haldûn Umran & Coğrafya Okuması Synthesizer
  // ---------------------------------------------------------------------------
  const REGION_UMRAN_PROFILES = {
    '01_Marmara': {
      temperament: 'Geçit, Boğaz ve Deniz-Kara Dengesi (İtidal Kuşağı)',
      civilizationAxis: 'İmparatorluk mayası, liman ticareti ve Rumeli-Anadolu köprüsü',
      rhythm: 'Suyun akışkanlığı ile payitaht vakarını birleştiren ölçülü tefekkür',
      asabiyyahNote: 'Yumuşak iklimin ve deniz yollarının sağladığı hadarî incelik, uç beyliği disipliniyle dengelenir.'
    },
    '02_Ege': {
      temperament: 'Ilıman Kıyı, Zeytinlik Vadi ve Mermer Ufuk',
      civilizationAxis: 'Antik polis bilgeliği, liman agoraları ve Batı Anadolu irfanı',
      rhythm: 'Zeytin gölgesinde berraklaşan akıl ve denize açılan dinginlik',
      asabiyyahNote: 'Verimli kıyı ovaları ile iç kesimlerin yörük metaneti arasında zarif bir umran sürekliliği kurulur.'
    },
    '03_Akdeniz': {
      temperament: 'Toros Sarpı ile Sıcak Liman İkliminin Karşılaşması',
      civilizationAxis: 'Likya-Kilikya liman hafızası, Yörük yaylacılığı ve bereketli deltalara hükmeden geçitler',
      rhythm: 'Gün ortası güneşinin sıcağından yayla serinliğine çekilen dikey tefekkür',
      asabiyyahNote: 'Dağların koruduğu dirayet ile sahilin kozmopolit hadarîliği aynı coğrafi eksende yoğrulur.'
    },
    '04_IcAnadolu': {
      temperament: 'Bozkır Ufku, Geniş Plato ve Tevazu İklimi',
      civilizationAxis: 'Selçuklu başkentliği, Ahilik ahlakı ve tasavvufî irfan havzası',
      rhythm: 'Gözün sonsuz ufukta dinlendiği, sözün azalıp mananın derinleştiği bozkır sükûneti',
      asabiyyahNote: 'Gösterişten uzak bozkır coğrafyası, İbn Haldûn’un tarif ettiği özlü ve dayanıklı umran ruhunu besler.'
    },
    '05_Karadeniz': {
      temperament: 'Dik Yamaç, Yağmur Sisi ve Hırçın Kıyı',
      civilizationAxis: 'Kuzey deniz ticareti, orman-yayla yerleşimi ve yüksek direnç kültürü',
      rhythm: 'Sis perdesinin ardından açılan yeşil vadilerde zikir ve sabır temposu',
      asabiyyahNote: 'Zorlu topoğrafya insan iradesini biler; dağ ile dalga arasındaki dar şeritte derin bir dayanışma doğar.'
    },
    '06_DoguAnadolu': {
      temperament: 'Yüksek Yayla, Volkanik Zirve ve Sert İklim Metaneti',
      civilizationAxis: 'Serhat kaleleri, Urartu-Selçuklu taş işçiliği ve vakur sınır muhafızlığı',
      rhythm: 'Kışın beyaz sessizliğinde içe dönen, yazın serin yaylalarda göğe yaklaşan ağırbaşlı tefekkür',
      asabiyyahNote: 'İbn Haldûn’un iklim ve tabiat teorisinde olduğu gibi çetin yükselti, sarsılmaz bir vakuriyet ve misafirperverlik üretir.'
    },
    '07_GuneydoguAnadolu': {
      temperament: 'Bereketli Hilal Eşiği, Sıcak Taş ve Kadim Nehir Havzası',
      civilizationAxis: 'İnsanlık tarihinin ilk mabetleri, Mezopotamya medeniyet katmanları ve ilim-hikmet medreseleri',
      rhythm: 'Fırat ve Dicle’nin kadim nabzına eşlik eden, sarı taş duvarlarda yankılanan zamansız tefekkür',
      asabiyyahNote: 'Toprağın ilk tarım ve şehir tecrübesine şahitlik eden bu havza, hadarî hafızanın en eski katmanlarını taşır.'
    }
  };

  function detectTerrainCharacter(province, regionProfile) {
    const landmarksText = normTr((province.landmarks || []).join(' '));
    const historyText = normTr(province.history || '');
    const quoteText = normTr(province.custom_quote || province.quote || '');
    const combined = `${landmarksText} ${historyText} ${quoteText}`;

    const hasMountain = /(dag|zirve|yayla|tepe|kanyon|vadi|bozdag|uludag|erciyes|agri|nemrut|cudi|palandoken|kaz dag)/.test(combined);
    const hasWater = /(deniz|korfez|bogaz|ada|liman|gol|nehir|irmak|selale|firat|dicle|sakarya|kizilirmak|plaj|sahil)/.test(combined);
    const hasSteppe = /(bozkir|ova|plato|tuz|hoyuk|bozkir)/.test(combined);

    const tags = [];
    if (hasMountain) tags.push('Dağ & Yayla');
    if (hasWater) tags.push('Su & Kıyı/Nehir');
    if (hasSteppe) tags.push('Ova & Bozkır');
    if (tags.length === 0) {
      tags.push(
        province.region_code === '04_IcAnadolu'
          ? 'Bozkır & Plato'
          : (province.region_code === '06_DoguAnadolu' ? 'Yüksek Yayla' : 'Anadolu Eşiği')
      );
    }

    const lat = Number(province.lat);
    const lng = Number(province.lng);
    const latBand = Number.isFinite(lat)
      ? (lat >= 40.3 ? 'Kuzey enlemlerinin serin ve nemli rüzgar hattında' : lat <= 37.6 ? 'Güney kuşağının aydınlık ve sıcak güneş ekseninde' : 'Orta Anadolu enlemlerinin dört mevsimi belirgin denge kuşağında')
      : 'Anadolu’nun merkezî iklim kuşağında';
    const lngBand = Number.isFinite(lng)
      ? (lng <= 29.5 ? 'batı geçitlerinin denizlere açılan ufkunda' : lng >= 39.0 ? 'doğu yükseltilerinin vakur doruk kuşağında' : 'iç geçitlerin kervan ve kavşak ekseninde')
      : 'tarihî yolların kesişiminde';

    const geoSummary = `${province.name}, ${latBand} ve ${lngBand} konumlanır. ${regionProfile.asabiyyahNote}`;

    return {
      tags,
      geoSummary
    };
  }

  function detectCivilizationLayers(province, regionProfile) {
    const combined = normTr([
      (province.landmarks || []).join(' '),
      province.history || '',
      province.custom_quote || province.quote || '',
      (province.literary_quotes || []).join(' ')
    ].join(' '));

    const layers = [];
    if (/selcuklu|alaeddin|ulu cami|medrese|kumbet|divrigi/.test(combined)) layers.push('Selçuklu taş ve ilim mührü');
    if (/osmanli|padisah|fatih|beylik|kulliye|han|konak|sogut/.test(combined)) layers.push('Osmanlı şehir ve vakıf nizamı');
    if (/hitit|frig|urartu|likya|antik|roma|bizans|kommagene|zeugma|efes|troya|gobeklitepe|hoyuk/.test(combined)) layers.push('Kadim Anadolu ve antik medeniyet katmanı');
    if (/kale|sur|hisar|tabya|milli mucadele|kuva-yi|istiklal/.test(combined)) layers.push('Serhat, kale ve istiklal hafızası');
    if (/ahi|carsi|bedesten|bakircilar|ipek yolu|kervansaray/.test(combined)) layers.push('Ahilik ve kervan ticareti terbiyesi');

    const picked = layers.slice(0, 3);
    const layerText = picked.length > 0
      ? `Şehrin umran dokusunda ${picked.join(', ')} iç içe geçmiştir.`
      : `${regionProfile.civilizationAxis} ekseninde şekillenmiş köklü bir yerleşme hafızası taşır.`;

    const landmarkSample = Array.isArray(province.landmarks) && province.landmarks.length
      ? province.landmarks.slice(0, 2).join(' ve ')
      : province.name;

    return `${layerText} Özellikle ${landmarkSample} çevresinde taş ile insan iradesinin kurduğu denge, hadarî birikimi bugüne taşır.`;
  }

  function synthesizeContemplationRhythm(province, regionProfile) {
    const library = stripMarkdownSyntax(province.custom_library || province.library || '');
    const libName = library ? library.split('-')[0].split('—')[0].trim() : `${province.name} İl Halk Kütüphanesi`;
    const lng = Number(province.lng);
    const solarNote = Number.isFinite(lng)
      ? (lng >= 38
          ? 'Güneşin Anadolu’ya erken doğduğu bu doğu ufkunda sabah vaktinin berraklığı tefekkürü keskinleştirir.'
          : lng <= 29
            ? 'Günün batı ufkunda ağır ağır çekildiği saatlerde taş ve su üzerine düşen ışık dingin bir muhasebe davetidir.'
            : 'Orta enlemin dengeli gün ışığı, şehrin meydanları ile sükûnet köşeleri arasında uyumlu bir seyir kurar.')
      : 'Günün ışığı şehrin kadim dokusunda ölçülü bir tefekkür ritmi kurar.';

    return `${regionProfile.rhythm}. ${solarNote} Yolcunun ${libName} durağında defterine düşeceği notlar, şehrin dış gürültüsünü içsel berraklığa dönüştürür.`;
  }

  function buildUmranReading(province) {
    const profile = REGION_UMRAN_PROFILES[province.region_code] || REGION_UMRAN_PROFILES['04_IcAnadolu'];
    const terrain = detectTerrainCharacter(province, profile);
    const civilization = detectCivilizationLayers(province, profile);
    const rhythm = synthesizeContemplationRhythm(province, profile);
    const lat = Number(province.lat);
    const lng = Number(province.lng);
    const coordLabel = (Number.isFinite(lat) && Number.isFinite(lng))
      ? `${lat.toFixed(2)}° K · ${lng.toFixed(2)}° D`
      : 'Anadolu Koordinatı';

    return {
      temperamentTitle: profile.temperament,
      tags: terrain.tags,
      coordLabel,
      mizaçText: terrain.geoSummary,
      civilizationText: civilization,
      rhythmText: rhythm
    };
  }

  // ---------------------------------------------------------------------------
  // Gönül Mimarları (Province Spiritual Figures + Regional Spiritual Heritage)
  // ---------------------------------------------------------------------------
  const REGIONAL_SPIRITUAL_HERITAGE = {
    '01_Marmara': [
      { name: 'Şeyh Edebali & Kuruluş İrfanı', role: 'Bölgesel Manevi Miras', detail: '“İnsanı yaşat ki devlet yaşasın” düsturuyla Marmara havzasında adalet, tevazu ve vakıf medeniyetinin manevi temelini atan irfan geleneği.' },
      { name: 'Emir Sultan & Bursa Meşayıhı', role: 'Bölgesel Manevi Miras', detail: 'Anadolu’dan Balkanlara uzanan gönül köprülerini kuran, şehir estetiğini merhametle yoğuran derviş-alperen geleneği.' }
    ],
    '02_Ege': [
      { name: 'Tapduk Emre & Yunus Emre İzleği', role: 'Bölgesel Manevi Miras', detail: 'Batı Anadolu vadilerinde “Bir ben vardır bende benden içeru” hakikatini sade Türkçe ile kalplere nakşeden irfan nefesi.' },
      { name: 'Birgivî Mehmed Efendi & Ege İlim Halkaları', role: 'Bölgesel Manevi Miras', detail: 'Zeytinlikler arasındaki medreselerde ahlak, ilim ve ölçülü yaşayışı öğütleyen köklü alim geleneği.' }
    ],
    '03_Akdeniz': [
      { name: 'Abdâl Mûsâ & Toros İrfan Ocakları', role: 'Bölgesel Manevi Miras', detail: 'Elmalı’dan Toros yaylalarına uzanan, misafirperverliği ve gönül birliğini dağ geçitlerinde diri tutan derviş ocakları.' },
      { name: 'Şeyh Hamid-i Velî (Somuncu Baba) İzi', role: 'Bölgesel Manevi Miras', detail: 'Gösterişten uzak emeği ve sessiz hizmeti kutsayan, Akdeniz-İç Anadolu hattında mayalanan hikmet geleneği.' }
    ],
    '04_IcAnadolu': [
      { name: 'Hz. Mevlânâ, Hacı Bektaş-ı Velî & Yunus Emre', role: 'Bozkırın İrfan Üçgeni', detail: 'Bozkırın kalbinde aşkı, hoşgörüyü ve insan-ı kâmil idealini evrensel bir medeniyet diline dönüştüren büyük gönül mimarları.' },
      { name: 'Ahi Evran-ı Velî & Hacı Bayram-ı Velî', role: 'Bölgesel Manevi Miras', detail: 'El emeğini doğrulukla, şehir esnafını ahlakla buluşturan Ahilik ve Bayramîlik terbiyesi.' }
    ],
    '05_Karadeniz': [
      { name: 'Şeyh Şaban-ı Velî & Kuzey İrfan Halkaları', role: 'Bölgesel Manevi Miras', detail: '“Gelişiniz güle güle, gidişiniz güle güle” hikmetiyle Kastamonu’dan bütün Karadeniz dağlarına yayılan sabır ve edep mektebi.' },
      { name: 'Süleyman Çelebi & Hızır İlyas Geleneği', role: 'Bölgesel Manevi Miras', detail: 'Yeşil vadilerin ve hırçın kıyıların ortasında duayı, musikiyi ve ortak hafızayı yaşatan manevi iklim.' }
    ],
    '06_DoguAnadolu': [
      { name: 'Ahmed-i Hânî & Alperen Serhat Erenleri', role: 'Bölgesel Manevi Miras', detail: 'Yüksek yaylaların çetin ikliminde ilmi, edebiyatı ve gönül dirayetini muhafaza eden serhat bilginleri.' },
      { name: 'Alvarlı Efe & Erzurum-Harput Meşayıhı', role: 'Bölgesel Manevi Miras', detail: 'Zirvelerin vakarını zarif gazellerle ve dergâh adabıyla birleştiren Doğu Anadolu irfan geleneği.' }
    ],
    '07_GuneydoguAnadolu': [
      { name: 'Hz. İbrahim (Halilullah) & Peygamberler İklimi', role: 'Bölgesel Manevi Miras', detail: 'Tevhid, teslimiyet ve cömertliğin sembolü; Mezopotamya düzlüğünden insanlığa uzanan kadim rahmet ve misafirperverlik geleneği.' },
      { name: 'Veysel Karânî & Tillo İlim Geleneği', role: 'Bölgesel Manevi Miras', detail: 'İhlaslı muhabbetin timsali Veysel Karânî ile Tillo’da astronomi ve tasavvufu birleştiren İsmail Fakirullah – İbrahim Hakkı mirası.' },
      { name: 'İsmail Ebul-İz El-Cezerî & Medrese Alimleri', role: 'Bölgesel Manevi Miras', detail: 'Cizre’den Mardin ve Diyarbakır’a uzanan taş medreselerde fen, hikmet ve sanatla insanlığa yön veren mütefekkirler.' }
    ]
  };

  function parseSpiritualFigureEntry(raw, fallbackRole) {
    const str = String(raw || '').trim();
    const boldMatch = str.match(/^\*\*(.+?)\*\*\s*:?\s*(.*)$/);
    if (boldMatch) {
      const name = boldMatch[1].replace(/:\s*$/, '').trim();
      const detail = stripMarkdownSyntax(boldMatch[2]).trim();
      return {
        name,
        role: fallbackRole || 'Şehrin Gönül Mimarı',
        detail: detail || `${name}, bu şehrin manevi hafızasında derin iz bırakmış müstesna şahsiyetlerdendir.`
      };
    }
    const colonIdx = str.indexOf(':');
    if (colonIdx > 2 && colonIdx < 65) {
      const name = stripMarkdownSyntax(str.slice(0, colonIdx)).trim();
      const detail = stripMarkdownSyntax(str.slice(colonIdx + 1)).trim();
      return {
        name,
        role: fallbackRole || 'Şehrin Gönül Mimarı',
        detail: detail || name
      };
    }
    const clean = stripMarkdownSyntax(str);
    return {
      name: clean.slice(0, 42) + (clean.length > 42 ? '…' : ''),
      role: fallbackRole || 'Manevi İz',
      detail: clean
    };
  }

  function buildCitySpecificFallbackFigures(province) {
    const landmarksNorm = normTr((province.landmarks || []).join(' ') + ' ' + (province.quote || ''));
    const extras = [];

    if (/ibrahim|baliklikol|gobeklitepe|harran/.test(landmarksNorm)) {
      extras.push({
        name: 'Hz. İbrahim & Halilullah Makamı',
        role: `${province.name} Manevi Odağı`,
        detail: 'Ateşi gül bahçesine çeviren teslimiyetin ve sofrası herkese açık cömertliğin şehre nakşettiği kadim peygamber mirası.'
      });
    }
    if (/tillo|fakirullah|ibrahim hakki|veysel karani/.test(landmarksNorm)) {
      extras.push({
        name: 'İsmail Fakirullah & Erzurumlu İbrahim Hakkı',
        role: `${province.name} İlim & İrfan Odağı`,
        detail: 'Tillo’da ışık hadisesiyle hocasına vefayı astronomi ilmine dönüştüren, Marifetname hikmetiyle gönülleri aydınlatan üstat-talebe silsilesi.'
      });
      extras.push({
        name: 'Veysel Karânî Hazretleri',
        role: `${province.name} Muhabbet Makamı`,
        detail: 'Görmeden imanın, anneye hürmetin ve sessiz dervişliğin Anadolu’daki en duru nişanesi.'
      });
    }
    if (/cudi|nuh|cezeri|mem u zin/.test(landmarksNorm)) {
      extras.push({
        name: 'İsmail Ebul-İz El-Cezerî & Hz. Nuh İzleği',
        role: `${province.name} Hikmet & Fen Mirası`,
        detail: 'Sibernetiğin öncüsü El-Cezerî’nin mühendislik dehası ile Cudi Dağı’na sinen kadim yeniden başlama hikmeti.'
      });
    }
    if (/kasimiye|deyrulzafaran|ulu cami|diyarbakir|hasankeyf|zeynel bey/.test(landmarksNorm)) {
      extras.push({
        name: `${province.name} Taş Medrese & Cami Hafızası`,
        role: 'Bölgesel İlim & Tasavvuf Mirası',
        detail: `${(province.landmarks || [])[0] || province.name} etrafında yüzyıllarca süren kıraat, musiki ve farklı kültürlerin bir arada yaşama irfanı.`
      });
    }
    if (/nemrut|kommagene/.test(landmarksNorm)) {
      extras.push({
        name: 'Safvan Bin Muattal & Kommagene Tefekkürü',
        role: `${province.name} Tarihî-Manevi Eşik`,
        detail: 'Nemrut zirvesinin ihtişamlı taş heykelleri karşısında fâniliği hatırlatan doğu-batı sentezi ve sahabe hatırası.'
      });
    }
    if (/zeugma|bakircilar|tahmis|kilis|kabalti/.test(landmarksNorm)) {
      extras.push({
        name: `${province.name} Çarşı & Ahilik Geleneği`,
        role: 'Zanaat & Muhabbet Mirası',
        detail: 'Asırlık hanlarda, kahvehanelerde ve taş kabaltılarda emeği duayla birleştiren şehirli arifler geleneği.'
      });
    }

    const regional = REGIONAL_SPIRITUAL_HERITAGE[province.region_code] || REGIONAL_SPIRITUAL_HERITAGE['04_IcAnadolu'];
    return [...extras, ...regional].slice(0, 4);
  }

  function getSpiritualArchitects(province) {
    const rawList = Array.isArray(province.spiritual_figures)
      ? province.spiritual_figures
      : (province.spiritual_figures ? [province.spiritual_figures] : []);

    if (rawList.length > 0) {
      return {
        isRegionalFallback: false,
        items: rawList.map(item => parseSpiritualFigureEntry(item, `${province.name} Gönül Mimarı`))
      };
    }

    return {
      isRegionalFallback: true,
      items: buildCitySpecificFallbackFigures(province)
    };
  }

  // ---------------------------------------------------------------------------
  // AI Essay Prompt + Offline Philosophical Essay Fallback
  // ---------------------------------------------------------------------------
  function buildAiEssayPrompts(province, umran, architects) {
    const landmarks = (province.landmarks || []).join(', ') || province.name;
    const specialties = (province.specialties || []).join(', ') || 'Yöresel bereket';
    const quote = province.custom_quote || province.quote || '';
    const spiritualNames = architects.items.map(a => a.name).join(', ');
    const library = stripMarkdownSyntax(province.custom_library || province.library || '');

    const system = [
      'Sen İbn Haldûn’un umran nazariyesi, Ahmet Hamdi Tanpınar’ın şehir estetiği ve Anadolu tasavvuf irfanıyla konuşan derinlikli bir Türk mütefekkir ve gezgin yazarısın.',
      'Üslubun edebi, şiirsel ama berrak ve somut detaylara yaslanan bir tefekkür denemesi olmalı.',
      'Klişelerden uzak dur; şehrin gerçek coğrafyasını, mimari taşını, manevi şahsiyetlerini ve sessizliğinin insana öğrettiği dersi işle.',
      'Yanıtı Türkçe Markdown olarak başlıklar ve kısa paragraflar hâlinde yaz (yaklaşık 320-450 kelime).'
    ].join(' ');

    const prompt = [
      `${province.name} (${province.region} Bölgesi, Plaka ${String(province.plate || '').padStart(2, '0')}) şehrinin felsefi ruhu üzerine derin bir tefekkür metni kaleme al.`,
      `Koordinatlar: ${umran.coordLabel}`,
      `Öne Çıkan Mimari ve Doğal Duraklar: ${landmarks}`,
      `Şehir Sözü: "${quote}"`,
      `Gönül Mimarları / Manevi Miras: ${spiritualNames}`,
      `Umran Karakteri: ${umran.temperamentTitle}`,
      library ? `Kütüphane Durağı: ${library}` : '',
      province.history ? `Tarihsel Zemin: ${String(province.history).slice(0, 360)}` : '',
      `Yöresel Kültür: ${specialties}`,
      '',
      'Lütfen şu dört ekseni örgüleyerek yaz:',
      '1. **Şehrin Metafizik Ruhu ve İklim Mizacı**',
      '2. **Taşın, Mimarinin ve Hafızanın Dili** (somut duraklardan hareketle)',
      '3. **Yolcunun Bu Şehrin Sessizliğinden Öğrendiği Hakikat**',
      '4. **Seyyahın Defterine Son Hikmet Cümlesi** (alıntı bloğu olarak)'
    ].filter(Boolean).join('\n');

    return { system, prompt };
  }

  function buildOfflinePhilosophicalEssay(province, umran, architects) {
    const landmarks = Array.isArray(province.landmarks) && province.landmarks.length
      ? province.landmarks
      : [province.name];
    const primaryLandmark = landmarks[0];
    const secondaryLandmark = landmarks[1] || primaryLandmark;
    const figure = architects.items[0] ? architects.items[0].name : `${province.name} erenleri`;
    const quote = province.custom_quote || province.quote || `${province.name}, taşında zamanı saklayan kadim bir duraktır.`;
    const library = stripMarkdownSyntax(province.custom_library || province.library || `${province.name} İl Halk Kütüphanesi`).split('-')[0].trim();

    return [
      `### I. ${province.name}’in Metafizik Mizacı: ${umran.tags.join(' ve ')}`,
      `${province.name}, yalnızca haritada ${umran.coordLabel} noktasında işaretlenen bir yer adı değildir; ${province.region} ikliminin insan ruhuna verdiği terbiyenin somutlaşmış hâlidir. İbn Haldûn’un umran ölçüsüyle bakıldığında, bu şehrin mizacı aceleci bir gösterişten ziyade vakar ve süreklilik üzerine kuruludur. "${quote}" sözü, aslında bu coğrafyanın kendi kendine fısıldadığı iç cümledir.`,
      '',
      `### II. Taşın ve Mimarinin Hafızası`,
      `${primaryLandmark} eşiğinde duran bir yolcu, taşın yalnızca barınmak veya sınır çizmek için yontulmadığını görür; burada her kemer, avlu ve geçit bir dünya görüşünün geometrisidir. ${secondaryLandmark} çevresinde ise geçmiş asırların emeğiyle bugünün nefesi aynı gökkubbenin altında buluşur. ${figure} gibi gönül ve hikmet öncülerinin bıraktığı mana, bu mekânları soğuk birer müze olmaktan çıkarıp yaşayan birer irfan mektebine dönüştürür.`,
      '',
      `### III. Yolcunun ${province.name} Sessizliğinden Öğrendiği`,
      `Her şehrin gürültüsü turistlere, sessizliği ise seyyaha konuşur. ${province.name}’in sabah serinliğinde veya akşam gölgelerinde yükselen sükûneti insana şunu hatırlatır: *Kökü derin olan şey telâş etmez.* ${library} masasında açılan bir defterde kelimeler ağırlaşır, yeryüzü hızını kaybeder ve insan kendi iç haritasını yeniden okuma imkânı bulur.`,
      '',
      `> *"${province.name}’i gerçekten görmek isteyen, önce adımlarını yavaşlatmalı; çünkü bu şehrin en derin kitabesi, taşların arasındaki sessizlikte yazılıdır."*`
    ].join('\n');
  }

  // ---------------------------------------------------------------------------
  // Scoped CSS (Dark Cyber-Sufi & Light Editorial Theme Compatible)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .seyyah-soul-inscription {
        position: relative;
        margin: 18px 0 22px;
        padding: 24px 24px 22px;
        border-radius: 18px;
        background:
          radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.11) 0%, transparent 45%),
          radial-gradient(circle at 0% 100%, rgba(0, 242, 254, 0.07) 0%, transparent 48%),
          var(--bg-card, rgba(15, 23, 42, 0.82));
        border: 1px solid rgba(245, 158, 11, 0.34);
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        color: var(--text-primary, #f8fafc);
        overflow: hidden;
      }

      .seyyah-soul-inscription::before {
        content: "۞";
        position: absolute;
        top: 12px;
        right: 18px;
        font-size: 3.4rem;
        line-height: 1;
        color: rgba(245, 158, 11, 0.09);
        pointer-events: none;
        user-select: none;
      }

      .seyyah-soul-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        flex-wrap: wrap;
        margin-bottom: 18px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(245, 158, 11, 0.22);
      }

      .seyyah-soul-title-wrap {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .seyyah-soul-kicker {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 1.1px;
        text-transform: uppercase;
        color: var(--accent-gold, #f59e0b);
      }

      .seyyah-soul-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.22rem;
        font-weight: 800;
        line-height: 1.3;
        color: var(--text-primary, #f8fafc);
        margin: 0;
      }

      .seyyah-soul-badges {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .seyyah-soul-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.74rem;
        font-weight: 600;
        background: rgba(245, 158, 11, 0.13);
        border: 1px solid rgba(245, 158, 11, 0.34);
        color: #fbbf24;
      }

      .seyyah-soul-badge--cyan {
        background: rgba(0, 242, 254, 0.1);
        border-color: rgba(0, 242, 254, 0.28);
        color: var(--accent-cyan, #00f2fe);
      }

      .seyyah-soul-sections {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .seyyah-soul-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }

      .seyyah-soul-section-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.96rem;
        font-weight: 700;
        color: var(--accent-gold, #f59e0b);
        display: flex;
        align-items: center;
        gap: 7px;
        margin: 0;
      }

      .seyyah-soul-section-sub {
        font-size: 0.76rem;
        color: var(--text-muted, #94a3b8);
      }

      /* Seljuk Editorial Gold-Bordered Frame */
      .seyyah-soul-seljuk-frame {
        position: relative;
        padding: 18px 20px;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(15, 23, 42, 0.55));
        border: 1.5px solid rgba(245, 158, 11, 0.45);
        box-shadow: inset 0 0 0 4px rgba(245, 158, 11, 0.07);
      }

      .seyyah-soul-seljuk-frame::before,
      .seyyah-soul-seljuk-frame::after {
        content: "✦";
        position: absolute;
        font-size: 0.78rem;
        color: rgba(245, 158, 11, 0.72);
        line-height: 1;
      }

      .seyyah-soul-seljuk-frame::before {
        top: 7px;
        left: 9px;
      }

      .seyyah-soul-seljuk-frame::after {
        bottom: 7px;
        right: 9px;
      }

      .seyyah-soul-motto {
        margin: 0 0 12px;
        padding-left: 14px;
        border-left: 3px solid var(--accent-gold, #f59e0b);
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 1.05rem;
        font-style: italic;
        line-height: 1.65;
        color: var(--text-primary, #f8fafc);
      }

      .seyyah-soul-quotes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 10px;
      }

      .seyyah-soul-quote-tile {
        padding: 11px 13px;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.52);
        border: 1px solid rgba(245, 158, 11, 0.2);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 6px;
      }

      .seyyah-soul-quote-text {
        font-size: 0.85rem;
        line-height: 1.55;
        color: var(--text-secondary, #cbd5e1);
        font-style: italic;
        margin: 0;
      }

      .seyyah-soul-quote-author {
        font-size: 0.74rem;
        font-weight: 700;
        color: #fbbf24;
        text-align: right;
      }

      /* Umran Grid */
      .seyyah-soul-umran-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .seyyah-soul-umran-card {
        padding: 13px 14px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .seyyah-soul-umran-label {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        color: var(--accent-cyan, #00f2fe);
      }

      .seyyah-soul-umran-text {
        font-size: 0.85rem;
        line-height: 1.58;
        color: var(--text-secondary, #cbd5e1);
        margin: 0;
      }

      .seyyah-soul-terrain-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 4px;
      }

      .seyyah-soul-terrain-pill {
        font-size: 0.71rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #34d399;
      }

      /* Gönül Mimarları Interactive Chips */
      .seyyah-soul-chips-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .seyyah-soul-chip {
        appearance: none;
        border: 1px solid rgba(168, 85, 247, 0.35);
        background: rgba(168, 85, 247, 0.1);
        color: var(--text-primary, #f8fafc);
        padding: 7px 13px;
        border-radius: 999px;
        font-family: inherit;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .seyyah-soul-chip:hover {
        border-color: rgba(245, 158, 11, 0.65);
        background: rgba(245, 158, 11, 0.15);
        transform: translateY(-1px);
      }

      .seyyah-soul-chip.is-active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.26), rgba(168, 85, 247, 0.24));
        border-color: rgba(245, 158, 11, 0.85);
        box-shadow: 0 0 14px rgba(245, 158, 11, 0.2);
      }

      .seyyah-soul-figure-detail {
        margin-top: 10px;
        padding: 13px 15px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.54);
        border: 1px solid rgba(168, 85, 247, 0.28);
      }

      .seyyah-soul-figure-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 5px;
      }

      .seyyah-soul-figure-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.94rem;
        font-weight: 700;
        color: #fbbf24;
      }

      .seyyah-soul-figure-role {
        font-size: 0.72rem;
        font-weight: 600;
        color: #c084fc;
        background: rgba(168, 85, 247, 0.14);
        padding: 2px 9px;
        border-radius: 999px;
      }

      .seyyah-soul-figure-desc {
        font-size: 0.86rem;
        line-height: 1.6;
        color: var(--text-secondary, #cbd5e1);
        margin: 0;
      }

      /* AI Philosophical Essay Box */
      .seyyah-soul-ai-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }

      .seyyah-soul-ai-btn {
        appearance: none;
        border: 1px solid rgba(245, 158, 11, 0.65);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(0, 242, 254, 0.16));
        color: var(--text-primary, #f8fafc);
        padding: 10px 18px;
        border-radius: 12px;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.22s ease;
        box-shadow: 0 6px 18px rgba(245, 158, 11, 0.14);
      }

      .seyyah-soul-ai-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 8px 22px rgba(245, 158, 11, 0.26);
      }

      .seyyah-soul-ai-btn:disabled {
        opacity: 0.72;
        cursor: wait;
      }

      .seyyah-soul-ai-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .seyyah-soul-copy-btn {
        appearance: none;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.15));
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-secondary, #cbd5e1);
        padding: 7px 12px;
        border-radius: 10px;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .seyyah-soul-copy-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
      }

      .seyyah-soul-ai-status {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted, #94a3b8);
      }

      .seyyah-soul-essay-panel {
        margin-top: 12px;
        padding: 16px 18px;
        border-radius: 14px;
        background: rgba(10, 15, 29, 0.62);
        border: 1px solid rgba(245, 158, 11, 0.26);
        font-size: 0.9rem;
        line-height: 1.7;
        color: var(--text-secondary, #e2e8f0);
      }

      .seyyah-soul-essay-panel[hidden] {
        display: none;
      }

      .seyyah-soul-essay-panel h2,
      .seyyah-soul-essay-panel h3,
      .seyyah-soul-essay-panel h4,
      .seyyah-soul-md-h {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.98rem;
        font-weight: 700;
        color: #fbbf24;
        margin: 12px 0 6px;
      }

      .seyyah-soul-essay-panel > :first-child {
        margin-top: 0;
      }

      .seyyah-soul-essay-panel p {
        margin: 0 0 10px;
      }

      .seyyah-soul-essay-panel p:last-child {
        margin-bottom: 0;
      }

      .seyyah-soul-essay-panel blockquote,
      .seyyah-soul-md-quote {
        margin: 10px 0 0;
        padding: 10px 14px;
        border-left: 3px solid var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.08);
        border-radius: 0 8px 8px 0;
        font-style: italic;
        color: var(--text-primary, #f8fafc);
      }

      .seyyah-soul-essay-panel ul,
      .seyyah-soul-md-list {
        margin: 6px 0 10px 18px;
      }

      /* Light Theme Compatibility (body.light-theme) */
      body.light-theme .seyyah-soul-inscription {
        background:
          radial-gradient(circle at 100% 0%, rgba(217, 119, 6, 0.1) 0%, transparent 45%),
          radial-gradient(circle at 0% 100%, rgba(2, 132, 199, 0.07) 0%, transparent 48%),
          rgba(255, 255, 255, 0.94);
        border-color: rgba(217, 119, 6, 0.42);
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.09);
        color: #0f172a;
      }

      body.light-theme .seyyah-soul-inscription::before {
        color: rgba(217, 119, 6, 0.12);
      }

      body.light-theme .seyyah-soul-badge {
        background: rgba(217, 119, 6, 0.11);
        border-color: rgba(217, 119, 6, 0.36);
        color: #b45309;
      }

      body.light-theme .seyyah-soul-badge--cyan {
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.3);
        color: #0369a1;
      }

      body.light-theme .seyyah-soul-seljuk-frame {
        background: linear-gradient(135deg, rgba(254, 243, 199, 0.65), rgba(255, 251, 235, 0.92));
        border-color: rgba(217, 119, 6, 0.52);
        box-shadow: inset 0 0 0 4px rgba(217, 119, 6, 0.08);
      }

      body.light-theme .seyyah-soul-motto {
        color: #1e293b;
      }

      body.light-theme .seyyah-soul-quote-tile,
      body.light-theme .seyyah-soul-umran-card,
      body.light-theme .seyyah-soul-figure-detail {
        background: rgba(248, 250, 252, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .seyyah-soul-quote-tile {
        border-color: rgba(217, 119, 6, 0.26);
      }

      body.light-theme .seyyah-soul-quote-text,
      body.light-theme .seyyah-soul-umran-text,
      body.light-theme .seyyah-soul-figure-desc {
        color: #334155;
      }

      body.light-theme .seyyah-soul-quote-author,
      body.light-theme .seyyah-soul-figure-name,
      body.light-theme .seyyah-soul-essay-panel h2,
      body.light-theme .seyyah-soul-essay-panel h3,
      body.light-theme .seyyah-soul-essay-panel h4,
      body.light-theme .seyyah-soul-md-h {
        color: #b45309;
      }

      body.light-theme .seyyah-soul-terrain-pill {
        background: rgba(5, 150, 105, 0.1);
        border-color: rgba(5, 150, 105, 0.3);
        color: #047857;
      }

      body.light-theme .seyyah-soul-chip {
        background: rgba(124, 58, 237, 0.08);
        border-color: rgba(124, 58, 237, 0.28);
        color: #1e293b;
      }

      body.light-theme .seyyah-soul-chip.is-active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.24), rgba(124, 58, 237, 0.16));
        border-color: #d97706;
      }

      body.light-theme .seyyah-soul-figure-role {
        color: #6d28d9;
        background: rgba(124, 58, 237, 0.1);
      }

      body.light-theme .seyyah-soul-ai-btn {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(2, 132, 199, 0.12));
        border-color: #d97706;
        color: #0f172a;
      }

      body.light-theme .seyyah-soul-copy-btn {
        background: rgba(15, 23, 42, 0.05);
        border-color: rgba(15, 23, 42, 0.16);
        color: #334155;
      }

      body.light-theme .seyyah-soul-essay-panel {
        background: rgba(255, 251, 235, 0.72);
        border-color: rgba(217, 119, 6, 0.32);
        color: #1e293b;
      }

      body.light-theme .seyyah-soul-essay-panel blockquote,
      body.light-theme .seyyah-soul-md-quote {
        color: #0f172a;
        background: rgba(217, 119, 6, 0.1);
      }

      @media (max-width: 900px) {
        .seyyah-soul-umran-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .seyyah-soul-inscription {
          padding: 18px 15px;
        }
        .seyyah-soul-seljuk-frame {
          padding: 14px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Card DOM Builder & Interactive Wiring
  // ---------------------------------------------------------------------------
  function createSoulCard(province, cityKey) {
    const plate = province.plate ? String(province.plate).padStart(2, '0') : '--';
    const motto = stripMarkdownSyntax(province.custom_quote || province.quote || `${province.name}, Anadolu haritasında kendi hikmetini fısıldayan kadim bir duraktır.`);
    const literaryQuotes = Array.isArray(province.literary_quotes) ? province.literary_quotes : [];
    const parsedQuotes = literaryQuotes.map(parseLiteraryQuote).filter(q => q.body);

    const umran = buildUmranReading(province);
    const architects = getSpiritualArchitects(province);

    const card = document.createElement('section');
    card.className = CARD_CLASS;
    card.setAttribute('data-city-key', cityKey);
    card.setAttribute('aria-label', `${province.name} Şehrin Metafiziği ve İrfan Kitabesi`);

    const quotesHtml = parsedQuotes.length > 0
      ? `<div class="seyyah-soul-quotes-grid">
          ${parsedQuotes.map(q => `
            <article class="seyyah-soul-quote-tile">
              <p class="seyyah-soul-quote-text">“${esc(q.body)}”</p>
              ${q.author ? `<div class="seyyah-soul-quote-author">— ${esc(q.author)}</div>` : ''}
            </article>
          `).join('')}
        </div>`
      : '';

    const chipsHtml = architects.items.map((item, idx) => `
      <button
        type="button"
        class="seyyah-soul-chip${idx === 0 ? ' is-active' : ''}"
        data-figure-idx="${idx}"
        aria-pressed="${idx === 0 ? 'true' : 'false'}"
      >
        <span>🕌</span>
        <span>${esc(item.name)}</span>
      </button>
    `).join('');

    const firstFigure = architects.items[0];
    const cachedEssay = essayCache.get(cityKey) || null;

    card.innerHTML = `
      <header class="seyyah-soul-header">
        <div class="seyyah-soul-title-wrap">
          <span class="seyyah-soul-kicker">Anadolu Şehir Felsefesi & Umran Okuması</span>
          <h2 class="seyyah-soul-title">✒️ Şehrin Metafiziği, Umran Okuması ve İrfan Kitabesi</h2>
        </div>
        <div class="seyyah-soul-badges">
          <span class="seyyah-soul-badge">📍 ${esc(province.name)} · ${esc(plate)}</span>
          <span class="seyyah-soul-badge seyyah-soul-badge--cyan">${esc(umran.coordLabel)}</span>
        </div>
      </header>

      <div class="seyyah-soul-sections">
        <!-- 1. Hikmet Kitabesi -->
        <div class="seyyah-soul-section">
          <div class="seyyah-soul-section-head">
            <h3 class="seyyah-soul-section-title">📜 Hikmet Kitabesi</h3>
            <span class="seyyah-soul-section-sub">Selçuklu Bordürlü Şehir Sözü ve Edebi İzler</span>
          </div>
          <div class="seyyah-soul-seljuk-frame">
            <blockquote class="seyyah-soul-motto">“${esc(motto)}”</blockquote>
            ${quotesHtml}
          </div>
        </div>

        <!-- 2. İbn Haldûn Umran & Coğrafya Okuması -->
        <div class="seyyah-soul-section">
          <div class="seyyah-soul-section-head">
            <h3 class="seyyah-soul-section-title">📐 İbn Haldûn Umran & Coğrafya Okuması</h3>
            <span class="seyyah-soul-section-sub">${esc(umran.temperamentTitle)}</span>
          </div>
          <div class="seyyah-soul-umran-grid">
            <article class="seyyah-soul-umran-card">
              <div class="seyyah-soul-umran-label">⛰️ Coğrafi Mizaç</div>
              <p class="seyyah-soul-umran-text">${esc(umran.mizaçText)}</p>
              <div class="seyyah-soul-terrain-tags">
                ${umran.tags.map(t => `<span class="seyyah-soul-terrain-pill">${esc(t)}</span>`).join('')}
              </div>
            </article>
            <article class="seyyah-soul-umran-card">
              <div class="seyyah-soul-umran-label">🏛️ Medeniyet & Umran Rolü</div>
              <p class="seyyah-soul-umran-text">${esc(umran.civilizationText)}</p>
            </article>
            <article class="seyyah-soul-umran-card">
              <div class="seyyah-soul-umran-label">🕯️ Tefekkür Ritmi</div>
              <p class="seyyah-soul-umran-text">${esc(umran.rhythmText)}</p>
            </article>
          </div>
        </div>

        <!-- 3. Gönül Mimarları -->
        <div class="seyyah-soul-section">
          <div class="seyyah-soul-section-head">
            <h3 class="seyyah-soul-section-title">🕌 Gönül Mimarları</h3>
            <span class="seyyah-soul-section-sub">${architects.isRegionalFallback ? 'Bölgesel ve Mahallî İrfan Mirası (Detay için isme tıklayın)' : 'Şehrin Manevi Şahsiyetleri (Detay için isme tıklayın)'}</span>
          </div>
          <div class="seyyah-soul-chips-wrap" role="group" aria-label="${esc(province.name)} gönül mimarları">
            ${chipsHtml}
          </div>
          <div class="seyyah-soul-figure-detail" aria-live="polite">
            <div class="seyyah-soul-figure-head">
              <span class="seyyah-soul-figure-name" data-role="fig-name">${esc(firstFigure ? firstFigure.name : province.name)}</span>
              <span class="seyyah-soul-figure-role" data-role="fig-role">${esc(firstFigure ? firstFigure.role : 'Manevi Miras')}</span>
            </div>
            <p class="seyyah-soul-figure-desc" data-role="fig-desc">${esc(firstFigure ? firstFigure.detail : '')}</p>
          </div>
        </div>

        <!-- 4. AI Tefekkürü -->
        <div class="seyyah-soul-section">
          <div class="seyyah-soul-ai-bar">
            <button type="button" class="seyyah-soul-ai-btn" data-role="ai-btn">
              <span>${cachedEssay ? '🔄 Şehrin Felsefi Ruhu Üzerine Tefekkürü Yenile' : '✨ Şehrin Felsefi Ruhu Üzerine AI Tefekkürü Üret'}</span>
            </button>
            <div class="seyyah-soul-ai-actions">
              <span class="seyyah-soul-ai-status" data-role="ai-status">${cachedEssay ? esc(cachedEssay.sourceLabel) : 'Hazır'}</span>
              <button type="button" class="seyyah-soul-copy-btn" data-role="copy-btn" ${cachedEssay ? '' : 'hidden'}>📋 Kopyala</button>
            </div>
          </div>
          <div class="seyyah-soul-essay-panel" data-role="essay-panel" ${cachedEssay ? '' : 'hidden'}>
            ${cachedEssay ? renderSafeMarkdown(cachedEssay.markdown) : ''}
          </div>
        </div>
      </div>
    `;

    // Interactive Gönül Mimarları chips
    const chipButtons = card.querySelectorAll('.seyyah-soul-chip');
    const figNameEl = card.querySelector('[data-role="fig-name"]');
    const figRoleEl = card.querySelector('[data-role="fig-role"]');
    const figDescEl = card.querySelector('[data-role="fig-desc"]');

    chipButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-figure-idx'), 10);
        const target = architects.items[idx];
        if (!target) return;

        chipButtons.forEach(b => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        if (figNameEl) figNameEl.textContent = target.name;
        if (figRoleEl) figRoleEl.textContent = target.role;
        if (figDescEl) figDescEl.textContent = target.detail;
      });
    });

    // AI Philosophical Essay Streaming + Offline Fallback
    const aiBtn = card.querySelector('[data-role="ai-btn"]');
    const statusEl = card.querySelector('[data-role="ai-status"]');
    const copyBtn = card.querySelector('[data-role="copy-btn"]');
    const essayPanel = card.querySelector('[data-role="essay-panel"]');

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const current = essayCache.get(cityKey);
        const textToCopy = current ? current.markdown : (essayPanel ? essayPanel.innerText : '');
        if (!textToCopy) return;
        const ok = await copyText(textToCopy);
        notify(ok ? `📋 ${province.name} tefekkür metni kopyalandı.` : '⚠️ Kopyalama başarısız oldu.');
      });
    }

    if (aiBtn) {
      aiBtn.addEventListener('click', async () => {
        const reqToken = ++activeStreamToken;
        aiBtn.disabled = true;
        if (essayPanel) {
          essayPanel.hidden = false;
          essayPanel.innerHTML = '<p><em>Kitabe satırları derleniyor, şehrin sükûneti dinleniyor...</em></p>';
        }
        if (statusEl) statusEl.textContent = '✨ Tefekkür yazılıyor...';
        if (copyBtn) copyBtn.hidden = true;

        const ai = typeof window !== 'undefined' ? window.SEYYAH_AI : null;
        const canStream = Boolean(ai && typeof ai.stream === 'function');
        const hasKey = Boolean(ai && typeof ai.hasKey === 'function' && ai.hasKey());

        let finalMarkdown = '';
        let sourceLabel = '📜 Çevrimdışı İrfan Derlemesi';

        if (canStream && hasKey) {
          try {
            const prompts = buildAiEssayPrompts(province, umran, architects);
            const res = await ai.stream({
              prompt: prompts.prompt,
              system: prompts.system,
              temperature: 0.78,
              maxTokens: 1600,
              onChunk: (_delta, fullText) => {
                if (reqToken !== activeStreamToken || !card.isConnected) return;
                if (essayPanel && fullText) {
                  essayPanel.innerHTML = renderSafeMarkdown(fullText);
                }
              }
            });
            if (reqToken !== activeStreamToken || !card.isConnected) return;
            if (res && res.text && res.text.trim()) {
              finalMarkdown = res.text.trim();
              sourceLabel = res.model ? `⚡ SEYYAH_AI (${res.model})` : '⚡ SEYYAH_AI';
            }
          } catch (_) {
            // Fall back cleanly to offline essay
          }
        }

        if (!finalMarkdown) {
          const offlineMd = buildOfflinePhilosophicalEssay(province, umran, architects);
          const words = offlineMd.split(/(\s+)/);
          let acc = '';
          const stepSize = 10;
          for (let i = 0; i < words.length; i += stepSize) {
            if (reqToken !== activeStreamToken || !card.isConnected) return;
            acc += words.slice(i, i + stepSize).join('');
            if (essayPanel) {
              essayPanel.innerHTML = renderSafeMarkdown(acc);
            }
            if (i + stepSize < words.length) {
              await new Promise(resolve => setTimeout(resolve, 18));
            }
          }
          finalMarkdown = offlineMd;
          sourceLabel = hasKey ? '📜 İrfan Yedeği (Akış Kesildi)' : '📜 Çevrimdışı İrfan Derlemesi';
        }

        if (reqToken !== activeStreamToken || !card.isConnected) return;

        essayCache.set(cityKey, { markdown: finalMarkdown, sourceLabel });
        if (essayPanel) {
          essayPanel.hidden = false;
          essayPanel.innerHTML = renderSafeMarkdown(finalMarkdown);
        }
        if (statusEl) statusEl.textContent = sourceLabel;
        if (copyBtn) copyBtn.hidden = false;
        aiBtn.disabled = false;
        const labelSpan = aiBtn.querySelector('span');
        if (labelSpan) {
          labelSpan.textContent = '🔄 Şehrin Felsefi Ruhu Üzerine Tefekkürü Yenile';
        }
      });
    }

    return card;
  }

  // ---------------------------------------------------------------------------
  // Viewport Injection & MutationObserver
  // ---------------------------------------------------------------------------
  function resolveProvince(ctx, cityKey) {
    if (ctx && ctx.data && ctx.data.provinces && ctx.data.provinces[cityKey]) {
      return ctx.data.provinces[cityKey];
    }
    if (ctx && ctx.state && ctx.state.data && ctx.state.data.provinces && ctx.state.data.provinces[cityKey]) {
      return ctx.state.data.provinces[cityKey];
    }
    if (typeof TRAVEL_DATA !== 'undefined' && TRAVEL_DATA && TRAVEL_DATA.provinces && TRAVEL_DATA.provinces[cityKey]) {
      return TRAVEL_DATA.provinces[cityKey];
    }
    return null;
  }

  function tryInjectIntoViewport() {
    if (isInjecting) return;
    const ctx = activeCtx;
    if (!ctx || !ctx.state) return;
    if (ctx.state.currentView !== 'city' || !ctx.state.selectedCityKey) return;

    const viewport = document.getElementById(VIEWPORT_ID);
    if (!viewport) return;

    const detailView = viewport.querySelector('.city-detail-view');
    if (!detailView) return;
    if (detailView.querySelector(`.${CARD_CLASS}`)) return;

    const cityKey = ctx.state.selectedCityKey;
    const province = resolveProvince(ctx, cityKey);
    if (!province) return;

    isInjecting = true;
    try {
      const card = createSoulCard(province, cityKey);
      const conciergeEl = detailView.querySelector('.ai-city-concierge-box');
      const heroEl = detailView.querySelector('.city-hero');

      if (conciergeEl && conciergeEl.parentElement === detailView) {
        conciergeEl.insertAdjacentElement('afterend', card);
      } else if (heroEl && heroEl.parentElement === detailView) {
        heroEl.insertAdjacentElement('afterend', card);
      } else {
        detailView.insertAdjacentElement('afterbegin', card);
      }
    } finally {
      isInjecting = false;
    }
  }

  function init(ctx) {
    activeCtx = ctx || activeCtx;
    injectStyles();

    const viewport = document.getElementById(VIEWPORT_ID);
    if (!viewport) return;

    if (!initialized && typeof MutationObserver === 'function') {
      initialized = true;
      observer = new MutationObserver(() => {
        tryInjectIntoViewport();
      });
      observer.observe(viewport, { childList: true, subtree: true });
    }

    tryInjectIntoViewport();
  }

  window.SEYYAH_MODULES.citySoul = {
    init
  };
})();
