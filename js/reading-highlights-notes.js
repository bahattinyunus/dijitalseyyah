/**
 * Anadolu Seyahatnamesi — 🔖 Hikmet & Alıntı Hazinesi (180+ Edebî İktibas, Fikir Kartları & Kişisel Seçki)
 * Registers on: window.SEYYAH_MODULES.quoteVault = { render(container, ctx) }
 *
 * Aggregates:
 *   - Classical travel wisdom quotes from ctx.data.quotes
 *   - All 81 provinces' main quotes (p.custom_quote || p.quote) from ctx.data.provinces
 *   - All provinces' literary_quotes from ctx.data.provinces (300+ total authentic quotes)
 *   - User's custom added quotes & bookmarked favorites persisted in localStorage (dijital_seyyah_quote_vault_v1)
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-quote-vault-styles';
  const STORAGE_KEY = 'dijital_seyyah_quote_vault_v1';
  const PAGE_STEP = 48;

  const REGIONS = [
    { code: 'all', label: 'Tüm Bölgeler (7 Bölge)', shortLabel: 'Tüm Bölgeler', icon: '🗺️' },
    { code: '01_Marmara', label: 'Marmara', shortLabel: 'Marmara', icon: '🌉' },
    { code: '02_Ege', label: 'Ege', shortLabel: 'Ege', icon: '🫒' },
    { code: '03_Akdeniz', label: 'Akdeniz', shortLabel: 'Akdeniz', icon: '☀️' },
    { code: '04_IcAnadolu', label: 'İç Anadolu', shortLabel: 'İç Anadolu', icon: '🌾' },
    { code: '05_Karadeniz', label: 'Karadeniz', shortLabel: 'Karadeniz', icon: '🌲' },
    { code: '06_DoguAnadolu', label: 'Doğu Anadolu', shortLabel: 'Doğu Anadolu', icon: '🏔️' },
    { code: '07_GuneydoguAnadolu', label: 'Güneydoğu Anadolu', shortLabel: 'Güneydoğu', icon: '🕌' }
  ];

  const CATEGORY_TABS = [
    { id: 'all', label: 'Tümü', icon: '📚' },
    { id: 'favorites', label: '⭐ Favori Hazinem', icon: '' },
    { id: 'klasik', label: '📜 Klasik Hikmetler', icon: '' },
    { id: 'ilRuhu', label: '🗺️ 81 İl Ruhu', icon: '' },
    { id: 'edebi', label: '🖋️ Edebî İktibaslar', icon: '' },
    { id: 'custom', label: '✍️ Kişisel Notlarım', icon: '' }
  ];

  const CATEGORY_META = {
    klasik: { label: '📜 Klasik Hikmet', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)' },
    ilRuhu: { label: '🗺️ 81 İl Ruhu', color: '#00f2fe', bg: 'rgba(0, 242, 254, 0.12)' },
    edebi: { label: '🖋️ Edebî İktibas', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.14)' },
    custom: { label: '✍️ Kişisel Not', color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)' }
  };

  const AI_TOPICS = [
    { id: 'yolculuk', label: 'Yolculuk & Sabır', icon: '🧭' },
    { id: 'kutuphane', label: 'Kütüphane & İlim', icon: '📚' },
    { id: 'gonul', label: 'Gönül & Tevazu', icon: '🕊️' },
    { id: 'zaman', label: 'Zaman & Mekân', icon: '⏳' },
    { id: 'anadolu', label: 'Anadolu & Hatıra', icon: '🏛️' },
    { id: 'tefekkur', label: 'Sessizlik & Tefekkür', icon: '🌙' }
  ];

  const OFFLINE_WISDOM_BANK = {
    yolculuk: [
      {
        text: 'Yol, yalnızca iki şehir arasındaki mesafe değildir; insanın kendi aceleciliğini geride bırakıp sükûnete yürüdüğü bir terbiye mektebidir.',
        author: 'Seyahatname Tefekkür Notu',
        note: 'Adım yavaşladıkça menzil derinleşir; yolun kendisi en kadim öğretmendir.'
      },
      {
        text: 'Harcı sabırla karılan sefer, ne kadar uzak olursa olsun yolcuyu yormaz; bilakis kalbe yeni bir ufuk penceresi açar.',
        author: 'Anadolu Menzil Hikmeti',
        note: 'Her durakta bir nefes duraklamak, görülenleri hatıraya değil hikmete dönüştürür.'
      },
      {
        text: 'Haritada çizilen çizgi toprağı böler; fakat gönülle atılan her adım şehirleri birbirine kardeş kılar.',
        author: 'Dijital Seyyah Özdeyişi',
        note: 'Coğrafya, sevgi ve merakla okunduğunda tek bir büyük kitaba dönüşür.'
      }
    ],
    kutuphane: [
      {
        text: 'Bir şehrin gerçek yüksekliği minareleri ve kuleleriyle değil, kütüphane raflarında sessizce nöbet bekleyen cümlelerle ölçülür.',
        author: 'Kütüphane Ofisi Tefekkürü',
        note: '5 gün kuralıyla bir şehirde okunan her sayfa, o beldenin taşını zihne nakşeder.'
      },
      {
        text: 'İlim bir çıra gibidir; yabancı bir şehrin masasında yakıldığında hem karanlığı dağıtır hem de o şehri senin evin kılar.',
        author: 'İrfan Meclisi Özdeyişi',
        note: 'Okuma ve çalışma disiplini, seyahati geçici bir gezintiden kalıcı bir inşaya çevirir.'
      },
      {
        text: 'Defterine tek bir hakikat cümlesi düşmeyen yolcu, bin fersah gitse de henüz kapı eşiğinden ayrılmamış sayılır.',
        author: 'Kadim Seyyah Tavsiyesi',
        note: 'Görmek gözün nasibi, kayda geçirmek ise aklın ve kalbin vefasıdır.'
      }
    ],
    gonul: [
      {
        text: 'Taşları yontan çekiç değil zamandır; insanı olgunlaştıran ise vardığı şehirlerde karşılaştığı gönüllerin tevazusudur.',
        author: 'Ahîlik & Yol Ahlâkı',
        note: 'Her kapıdan misafir edebiyle girmek, her şehirden zenginleşerek çıkmaktır.'
      },
      {
        text: 'Gönül bir kervansaraya benzer; içinde kibir değil hayret konakladıkça kapıları hakikate açık kalır.',
        author: 'Tasavvufi Sefer Notu',
        note: 'Hayretini diri tutan yolcu, en tanıdık sokakta bile yeni bir mucize görür.'
      },
      {
        text: 'Az eşya ile yola çıkanın sırtı hafif, çok dua ve selâm biriktirenin ise menzili bereketli olur.',
        author: 'Anadolu İrfan Özdeyişi',
        note: 'Sadelik, uzakları yakın eden en güvenilir azıktır.'
      }
    ],
    zaman: [
      {
        text: 'Eski bir şadırvanın mermerinde akan su, geçmiş ile bugünün aslında aynı anda ve aynı sükûnette aktığını fısıldar.',
        author: 'Zaman & Mimari Tefekkürü',
        note: 'Tarihî mekânlar geçmişte kalmaz; dikkatle bakan göze hâlâ konuşur.'
      },
      {
        text: 'Saatler dakikaları sayar, oysa bir ikindi gölgesi insana asırların sükûnetini tek bir bakışta bağışlar.',
        author: 'Beş Şehir İzinden',
        note: 'Takvim telaşını bıraktığımız yerde şehirlerin ikinci zamanı başlar.'
      },
      {
        text: 'İnsan yalnızca mekânı değiştirerek yenilenmez; zamanın ritmini yavaşlatıp anın içine yerleştiğinde sefer başlar.',
        author: 'Halvet & İklim Notu',
        note: 'Bir kahve veya çay molası bazen yüz kilometrelik yoldan daha fazla mesafe aldırır.'
      }
    ],
    anadolu: [
      {
        text: 'Anadolu, her tepesinde bir hatıra, her vadisinde bir türkü ve her taşında sabırla örülmüş bir medeniyet cümlesi saklar.',
        author: 'Sefer Der Vatan Defteri',
        note: 'Yedi bölgenin her biri aynı büyük hikâyenin farklı bir makamından ses verir.'
      },
      {
        text: 'Bozkırın ortasındaki bir tek söğüt gölgesi bile, Anadolu’da misafire açılan sessiz bir sofra gibidir.',
        author: 'Yol & Coğrafya Özdeyişi',
        note: 'İklim sertleştikçe insanın sözü ve ikramı daha da derinleşir.'
      },
      {
        text: '81 ilin her biri kendi lehçesiyle aynı sırrı söyler: Kökü derinde olan çınar, rüzgârdan korkmaz.',
        author: 'Anadolu Hafızası',
        note: 'Şehirleri tanımak, aynı toprağın farklı renklerdeki sabrını okumaktır.'
      }
    ],
    tefekkur: [
      {
        text: 'Gürültünün sustuğu yerde yalnızca sessizlik kalmaz; insanın kendi iç sesinin şehirle kurduğu ince musiki duyulur.',
        author: 'Tefekkür Odası Notu',
        note: 'Sükûnet, kalabalıkların arasında kaybettiğimiz dikkati geri çağırır.'
      },
      {
        text: 'Sabahın ilk ışığında henüz uyanmamış bir sokağı dinlemek, o şehrin en mahrem sırrına ortak olmaktır.',
        author: 'Seher Vakti Özdeyişi',
        note: 'Erken uyanan seyyah, şehrin telaşsız ve saf yüzüyle tanışır.'
      },
      {
        text: 'Tefekkür, gördüklerini çoğaltmak değil; gördüklerinin içindeki manayı tek bir berrak damlada toplamaktır.',
        author: 'Hikmet Defteri',
        note: 'Bazen tek bir cümle, bütün bir seyahatin özeti olmaya yeter.'
      }
    ]
  };

  // Module UI state (preserved across re-renders)
  const uiState = {
    category: 'all',
    region: 'all',
    search: '',
    pageLimit: PAGE_STEP,
    deckIndex: 0,
    deckInitializedForDate: '',
    focusOpen: false,
    addFormOpen: false,
    aiTopicId: 'yolculuk',
    aiCustomTopic: '',
    aiProvinceKey: '',
    aiLoading: false,
    aiResults: [],
    aiSourceLabel: '',
    aiSavedIds: {}
  };

  let activeFocusKeyHandler = null;

  // ---------------------------------------------------------------------------
  // Utilities & Safe Escaping / Turkish Normalization
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

  function formatPlate(plate) {
    const n = Number(plate);
    if (!Number.isFinite(n) || n <= 0) return '00';
    return n < 10 ? '0' + n : String(n);
  }

  function hashString(str) {
    let h = 2166136261;
    const s = String(str || '');
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }

  function hashInt(str) {
    let h = 2166136261;
    const s = String(str || '');
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function getTodayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatTrDate(dateKey) {
    const parts = String(dateKey || '').split('-');
    if (parts.length !== 3) return dateKey;
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const day = Number(parts[2]);
    const month = months[Number(parts[1]) - 1] || parts[1];
    return `${day} ${month} ${parts[0]}`;
  }

  function cleanQuoteText(raw) {
    let s = String(raw || '').trim();
    s = s.replace(/^\*+|\*+$/g, '').trim();
    // Strip balanced outer quotes to display uniform editorial styling
    if (
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith('“') && s.endsWith('”')) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      s = s.slice(1, -1).trim();
    }
    return s;
  }

  function cleanAuthorText(raw) {
    let s = String(raw || '').trim();
    s = s.replace(/^\*+|\*+$/g, '').replace(/^_+|_+$/g, '').trim();
    return s;
  }

  function parseLiteraryQuote(raw, fallbackAuthor) {
    const str = String(raw || '').trim();
    const emIdx = str.lastIndexOf('—');
    if (emIdx !== -1) {
      const text = cleanQuoteText(str.slice(0, emIdx));
      const author = cleanAuthorText(str.slice(emIdx + 1)) || fallbackAuthor;
      return { text: text, author: author };
    }
    const dashIdx = str.lastIndexOf(' - ');
    if (dashIdx !== -1) {
      const text = cleanQuoteText(str.slice(0, dashIdx));
      const author = cleanAuthorText(str.slice(dashIdx + 3)) || fallbackAuthor;
      return { text: text, author: author };
    }
    return { text: cleanQuoteText(str), author: fallbackAuthor };
  }

  function notify(ctx, message, type) {
    if (ctx && typeof ctx.showToast === 'function') {
      ctx.showToast(message, type);
      return;
    }
    const host = document.getElementById('toast-container');
    if (!host) return;
    const el = document.createElement('div');
    el.className = 'toast-item';
    el.textContent = message;
    host.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.25s ease';
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 260);
    }, 2600);
  }

  function copyToClipboard(text, ctx, okMsg) {
    const value = String(text || '');
    if (!value) return;
    if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard
        .writeText(value)
        .then(function () {
          notify(ctx, okMsg || '📋 Alıntı panoya kopyalandı!');
        })
        .catch(function () {
          fallbackCopy(value, ctx, okMsg);
        });
    } else {
      fallbackCopy(value, ctx, okMsg);
    }
  }

  function fallbackCopy(text, ctx, okMsg) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      notify(ctx, okMsg || '📋 Alıntı panoya kopyalandı!');
    } catch (_) {
      notify(ctx, '⚠️ Kopyalama tarayıcı tarafından engellendi.');
    }
  }

  function triggerMarkdownDownload(filename, content) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  }

  // ---------------------------------------------------------------------------
  // LocalStorage Persistence (dijital_seyyah_quote_vault_v1)
  // ---------------------------------------------------------------------------
  function readVaultStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { favorites: [], customQuotes: [] };
      const parsed = JSON.parse(raw);
      return {
        favorites: Array.isArray(parsed && parsed.favorites) ? parsed.favorites.filter(Boolean) : [],
        customQuotes: Array.isArray(parsed && parsed.customQuotes) ? parsed.customQuotes.filter(Boolean) : []
      };
    } catch (_) {
      return { favorites: [], customQuotes: [] };
    }
  }

  function writeVaultStorage(vaultData) {
    try {
      const payload = {
        favorites: Array.isArray(vaultData.favorites) ? vaultData.favorites : [],
        customQuotes: Array.isArray(vaultData.customQuotes) ? vaultData.customQuotes : []
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (_) {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Quote Catalog Aggregator (Classical + 81 Provinces + Literary + User Custom)
  // ---------------------------------------------------------------------------
  function buildQuoteCatalog(ctx, normFn) {
    const data = (ctx && ctx.data) || {};
    const rawQuotes = Array.isArray(data.quotes) ? data.quotes : [];
    const provinces = data.provinces && typeof data.provinces === 'object' ? data.provinces : {};
    const stored = readVaultStorage();
    const favSet = new Set(stored.favorites);

    const items = [];

    // 1. Classical travel wisdom quotes (ctx.data.quotes)
    rawQuotes.forEach(function (q, idx) {
      if (!q || !q.quote) return;
      const text = cleanQuoteText(q.quote);
      const author = cleanAuthorText(q.author || 'Kadim Seyyah Özdeyişi');
      const id = 'klasik_' + idx + '_' + hashString(text);
      items.push({
        id: id,
        category: 'klasik',
        text: text,
        author: author,
        provinceKey: '',
        provinceName: '',
        plate: null,
        regionCode: '',
        regionName: 'Evrensel Seyahat Hikmeti',
        isCustom: false,
        isAi: false,
        isFavorite: favSet.has(id),
        searchBlob: normFn([text, author, 'klasik hikmet evrensel'].join(' '))
      });
    });

    // 2. All 81 provinces sorted by plate
    const sortedKeys = Object.keys(provinces).sort(function (a, b) {
      const pa = Number(provinces[a] && provinces[a].plate) || 999;
      const pb = Number(provinces[b] && provinces[b].plate) || 999;
      if (pa !== pb) return pa - pb;
      return String((provinces[a] && provinces[a].name) || a).localeCompare(
        String((provinces[b] && provinces[b].name) || b),
        'tr'
      );
    });

    sortedKeys.forEach(function (key) {
      const p = provinces[key] || {};
      const cityName = p.name || key.split('/')[1] || key;
      const regionCode = p.region_code || key.split('/')[0] || '';
      const regionName = p.region || '';
      const plate = p.plate || null;
      const plateStr = formatPlate(plate);

      // 2a. Main province quote (p.custom_quote || p.quote)
      const mainRaw = (typeof p.custom_quote === 'string' && p.custom_quote.trim())
        ? p.custom_quote
        : (typeof p.quote === 'string' ? p.quote : '');

      if (mainRaw && mainRaw.trim()) {
        const mainText = cleanQuoteText(mainRaw);
        const mainAuthor = cityName + ' (' + plateStr + ') · Şehir Ruhu';
        const mainId = 'ilruhu_' + key;
        items.push({
          id: mainId,
          category: 'ilRuhu',
          text: mainText,
          author: mainAuthor,
          provinceKey: key,
          provinceName: cityName,
          plate: plate,
          regionCode: regionCode,
          regionName: regionName,
          isCustom: false,
          isAi: false,
          isFavorite: favSet.has(mainId),
          searchBlob: normFn([mainText, mainAuthor, cityName, plateStr, regionName].join(' '))
        });
      }

      // 2b. Literary quotes (p.literary_quotes)
      if (Array.isArray(p.literary_quotes)) {
        p.literary_quotes.forEach(function (lqRaw, lqIdx) {
          if (!lqRaw || !String(lqRaw).trim()) return;
          const parsed = parseLiteraryQuote(lqRaw, cityName + ' Edebî Kaydı');
          if (!parsed.text) return;
          const lqId = 'edebi_' + key + '_' + lqIdx;
          items.push({
            id: lqId,
            category: 'edebi',
            text: parsed.text,
            author: parsed.author,
            provinceKey: key,
            provinceName: cityName,
            plate: plate,
            regionCode: regionCode,
            regionName: regionName,
            isCustom: false,
            isAi: false,
            isFavorite: favSet.has(lqId),
            searchBlob: normFn([parsed.text, parsed.author, cityName, plateStr, regionName, 'edebi iktibas'].join(' '))
          });
        });
      }
    });

    // 3. User's custom added quotes (newest first)
    stored.customQuotes
      .slice()
      .reverse()
      .forEach(function (cq) {
        if (!cq || !cq.text) return;
        const p = cq.provinceKey && provinces[cq.provinceKey] ? provinces[cq.provinceKey] : null;
        const cityName = p ? p.name : (cq.provinceName || '');
        const regionCode = p ? (p.region_code || cq.provinceKey.split('/')[0] || '') : (cq.regionCode || '');
        const regionName = p ? (p.region || '') : (cq.regionName || '');
        const plate = p ? (p.plate || null) : (cq.plate || null);
        const text = cleanQuoteText(cq.text);
        const author = cleanAuthorText(cq.author || (cq.isAi ? 'Gemini AI Hikmet Üretimi' : 'Kişisel Seyahat Notu'));
        const id = cq.id || ('custom_' + hashString(text + author));

        items.unshift({
          id: id,
          category: 'custom',
          text: text,
          author: author,
          provinceKey: cq.provinceKey || '',
          provinceName: cityName,
          plate: plate,
          regionCode: regionCode,
          regionName: regionName || 'Kişisel Seçki',
          isCustom: true,
          isAi: Boolean(cq.isAi),
          createdAt: cq.createdAt || '',
          isFavorite: favSet.has(id),
          searchBlob: normFn([text, author, cityName, formatPlate(plate), regionName, 'kisisel not'].join(' '))
        });
      });

    return {
      items: items,
      sortedProvinceKeys: sortedKeys,
      provinces: provinces,
      stored: stored,
      favCount: items.filter(function (it) { return it.isFavorite; }).length
    };
  }

  // ---------------------------------------------------------------------------
  // AI Wisdom Generator (window.SEYYAH_AI.ask + Rich Offline Fallback)
  // ---------------------------------------------------------------------------
  function parseAiWisdomResponse(rawText, topicLabel, cityName) {
    const text = String(rawText || '').trim();
    if (!text) return [];

    // Try JSON block first if model followed structure
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const arr = JSON.parse(jsonMatch[0]);
        if (Array.isArray(arr) && arr.length > 0) {
          return arr
            .slice(0, 3)
            .map(function (entry) {
              return {
                text: cleanQuoteText(entry.quote || entry.soz || entry.text || ''),
                author: cleanAuthorText(entry.author || entry.mahlas || ('Gemini AI · ' + (cityName || topicLabel))),
                note: cleanAuthorText(entry.note || entry.tefekkur || entry.reflection || '')
              };
            })
            .filter(function (x) { return Boolean(x.text); });
        }
      } catch (_) {}
    }

    // Fallback: split numbered lines / bullet blocks
    const blocks = text
      .split(/\n(?=\s*(?:\d+[\.\)]|[-*•]))/)
      .map(function (b) { return b.trim(); })
      .filter(Boolean);

    const parsed = [];
    for (let i = 0; i < blocks.length && parsed.length < 3; i += 1) {
      const cleaned = blocks[i]
        .replace(/^\s*(?:\d+[\.\)]|[-*•])\s*/, '')
        .replace(/\*\*/g, '')
        .trim();
      if (!cleaned || cleaned.length < 15) continue;
      const lines = cleaned.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      const quoteLine = cleanQuoteText(lines[0] || cleaned);
      const noteLine = lines.slice(1).join(' ').replace(/^Tefekkür:\s*/i, '').trim();
      parsed.push({
        text: quoteLine,
        author: 'Gemini AI · ' + (cityName ? cityName + ' / ' + topicLabel : topicLabel),
        note: noteLine
      });
    }

    if (parsed.length === 0 && text.length >= 15) {
      parsed.push({
        text: cleanQuoteText(text.slice(0, 340)),
        author: 'Gemini AI · ' + (cityName ? cityName + ' / ' + topicLabel : topicLabel),
        note: ''
      });
    }
    return parsed;
  }

  function buildOfflineWisdom(topicId, customTopic, province) {
    const topicObj = AI_TOPICS.find(function (t) { return t.id === topicId; }) || AI_TOPICS[0];
    const basePool = OFFLINE_WISDOM_BANK[topicObj.id] || OFFLINE_WISDOM_BANK.yolculuk;
    const cityName = province && province.name ? province.name : '';
    const regionName = province && province.region ? province.region : '';
    const landmark = province && Array.isArray(province.landmarks) && province.landmarks[0] ? province.landmarks[0] : '';
    const customLabel = String(customTopic || '').trim();
    const subjectLabel = customLabel || topicObj.label;

    const results = basePool.map(function (item) {
      return {
        text: item.text,
        author: item.author,
        note: item.note
      };
    });

    if (cityName) {
      results[0] = {
        text:
          cityName +
          ' menzilinde ' +
          (landmark ? landmark + ' gölgesinde ' : '') +
          'düşünülen "' +
          subjectLabel +
          '" hakikati insana şunu fısıldar: Yol uzun olabilir, fakat niyeti berrak olanın gönlü her şehirde evindedir.',
        author: cityName + ' (' + (regionName || 'Anadolu') + ') · Çevrimdışı İrfan Derlemesi',
        note:
          (province.custom_quote || province.quote || '') +
          (landmark ? ' — Öne çıkan durak: ' + landmark : '')
      };
    } else if (customLabel) {
      results[0] = {
        text:
          '"' +
          customLabel +
          '" üzerine yürüyen seyyah için her durak bir ayna gibidir; dışarıda aradığı anlam, sabır ve dikkatle baktığı kendi gönlünde belirir.',
        author: 'Çevrimdışı İrfan Derlemesi · ' + customLabel,
        note: 'Konu odaklı tefekkür özdeyişi (Gemini API anahtarı eklendiğinde canlı üretim yapılır).'
      };
    }

    return results;
  }

  // ---------------------------------------------------------------------------
  // Scoped CSS Injection (Dark Obsidian + body.light-theme compatible)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .qv-studio {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-bottom: 40px;
        color: var(--text-primary, #f8fafc);
      }

      /* Hero Header */
      .qv-hero {
        position: relative;
        overflow: hidden;
        padding: 24px 26px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 88% 15%, rgba(245, 158, 11, 0.22), transparent 44%),
          radial-gradient(circle at 12% 85%, rgba(0, 242, 254, 0.16), transparent 46%),
          linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(30, 41, 59, 0.88));
        border: 1px solid rgba(245, 158, 11, 0.32);
        box-shadow: var(--shadow-subtle, 0 10px 28px -8px rgba(0, 0, 0, 0.5));
      }

      .qv-hero-top {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .qv-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 4px 12px;
        border-radius: 999px;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.34);
        margin-bottom: 10px;
      }

      .qv-hero h2 {
        font-family: var(--font-heading, sans-serif);
        font-size: clamp(1.3rem, 2.4vw, 1.85rem);
        font-weight: 800;
        line-height: 1.24;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #fef3c7 0%, #f59e0b 50%, #38bdf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .qv-hero-sub {
        max-width: 760px;
        font-size: 0.9rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.6;
      }

      .qv-hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
        align-items: center;
      }

      .qv-btn {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.72);
        color: var(--text-primary, #f8fafc);
        padding: 9px 14px;
        border-radius: 12px;
        font-size: 0.82rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .qv-btn:hover {
        border-color: rgba(0, 242, 254, 0.45);
        transform: translateY(-1px);
      }

      .qv-btn-gold {
        background: rgba(245, 158, 11, 0.18);
        border-color: rgba(245, 158, 11, 0.48);
        color: #fde68a;
      }

      .qv-btn-gold:hover {
        background: rgba(245, 158, 11, 0.3);
        border-color: #f59e0b;
      }

      .qv-btn-cyan {
        background: rgba(0, 242, 254, 0.15);
        border-color: rgba(0, 242, 254, 0.45);
        color: #67e8f9;
      }

      .qv-btn-cyan:hover {
        background: rgba(0, 242, 254, 0.26);
      }

      .qv-btn-emerald {
        background: rgba(16, 185, 129, 0.16);
        border-color: rgba(16, 185, 129, 0.45);
        color: #6ee7b7;
      }

      .qv-btn-emerald:hover {
        background: rgba(16, 185, 129, 0.28);
      }

      .qv-btn-purple {
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.26), rgba(0, 242, 254, 0.18));
        border-color: rgba(168, 85, 247, 0.5);
        color: #f3e8ff;
      }

      .qv-btn-purple:hover {
        border-color: #c084fc;
        box-shadow: 0 6px 20px -6px rgba(168, 85, 247, 0.45);
      }

      .qv-btn:disabled {
        opacity: 0.6;
        cursor: wait;
        transform: none;
      }

      .qv-stats-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(120px, 1fr));
        gap: 10px;
        margin-top: 18px;
      }

      .qv-stat-box {
        background: rgba(15, 23, 42, 0.62);
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 12px;
        padding: 11px 14px;
      }

      .qv-stat-val {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.26rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .qv-stat-lbl {
        font-size: 0.74rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* Reflection Deck Card (Günün Tefekkür Kartı) */
      .qv-deck-card {
        position: relative;
        border-radius: var(--radius-lg, 20px);
        padding: 24px 26px;
        background:
          radial-gradient(circle at 10% 10%, rgba(245, 158, 11, 0.12), transparent 44%),
          radial-gradient(circle at 92% 88%, rgba(168, 85, 247, 0.12), transparent 44%),
          var(--bg-card, rgba(30, 41, 59, 0.8));
        border: 1px solid rgba(245, 158, 11, 0.34);
        backdrop-filter: blur(14px);
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .qv-deck-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .qv-deck-title-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 9px;
      }

      .qv-deck-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .qv-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.73rem;
        font-weight: 700;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-secondary, #cbd5e1);
      }

      .qv-pill-btn {
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .qv-pill-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--accent-cyan, #00f2fe);
      }

      .qv-deck-quote-wrap {
        position: relative;
        padding: 18px 22px;
        border-radius: 16px;
        background: rgba(10, 15, 29, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-left: 4px solid var(--accent-gold, #f59e0b);
      }

      .qv-deck-mark {
        font-family: Georgia, serif;
        font-size: 2.6rem;
        line-height: 1;
        color: rgba(245, 158, 11, 0.45);
        margin-bottom: -8px;
        user-select: none;
      }

      .qv-deck-quote {
        font-size: clamp(1.06rem, 1.8vw, 1.32rem);
        line-height: 1.65;
        font-weight: 500;
        color: var(--text-primary, #f8fafc);
        font-style: italic;
      }

      .qv-deck-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: 12px;
      }

      .qv-deck-author {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--accent-gold, #fbbf24);
      }

      .qv-deck-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .qv-deck-btn-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .qv-deck-counter {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
      }

      /* Studio Panels (Custom Add Form & AI Generator) */
      .qv-studio-split {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
        gap: 16px;
      }

      .qv-panel {
        border-radius: var(--radius-lg, 18px);
        padding: 20px;
        background: var(--bg-card, rgba(30, 41, 59, 0.76));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .qv-panel.is-ai {
        border-color: rgba(168, 85, 247, 0.34);
        background:
          radial-gradient(circle at 95% 5%, rgba(168, 85, 247, 0.12), transparent 45%),
          var(--bg-card, rgba(30, 41, 59, 0.78));
      }

      .qv-panel.is-add {
        border-color: rgba(16, 185, 129, 0.32);
        background:
          radial-gradient(circle at 95% 5%, rgba(16, 185, 129, 0.1), transparent 45%),
          var(--bg-card, rgba(30, 41, 59, 0.78));
      }

      .qv-panel-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .qv-panel-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.04rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .qv-panel-sub {
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.5;
      }

      .qv-field-label {
        display: block;
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        margin-bottom: 6px;
      }

      .qv-input,
      .qv-select,
      .qv-textarea {
        width: 100%;
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        color: var(--text-primary, #f8fafc);
        border-radius: 11px;
        padding: 10px 12px;
        font-size: 0.86rem;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .qv-textarea {
        min-height: 84px;
        resize: vertical;
        line-height: 1.5;
      }

      .qv-input:focus,
      .qv-select:focus,
      .qv-textarea:focus {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.12);
      }

      .qv-form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .qv-checkbox-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.82rem;
        color: var(--text-secondary, #cbd5e1);
        cursor: pointer;
        user-select: none;
      }

      .qv-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .qv-chip {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.56);
        color: var(--text-secondary, #cbd5e1);
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 0.77rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.18s ease;
        font-family: inherit;
      }

      .qv-chip:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(0, 242, 254, 0.45);
      }

      .qv-chip.active {
        background: rgba(0, 242, 254, 0.18);
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
      }

      .qv-chip.is-gold.active {
        background: rgba(245, 158, 11, 0.2);
        border-color: var(--accent-gold, #f59e0b);
        color: #fef3c7;
      }

      .qv-chip.is-purple.active {
        background: rgba(168, 85, 247, 0.22);
        border-color: var(--accent-purple, #a855f7);
        color: #f3e8ff;
      }

      /* AI Results */
      .qv-ai-results {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .qv-ai-item {
        padding: 13px 15px;
        border-radius: 13px;
        background: rgba(10, 15, 29, 0.6);
        border: 1px solid rgba(168, 85, 247, 0.26);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .qv-ai-quote {
        font-size: 0.88rem;
        line-height: 1.55;
        font-style: italic;
        color: var(--text-primary, #f8fafc);
      }

      .qv-ai-note {
        font-size: 0.78rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.45;
      }

      .qv-ai-foot {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      /* Filter Toolbar */
      .qv-filter-bar {
        border-radius: var(--radius-lg, 18px);
        padding: 18px 20px;
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .qv-search-row {
        display: grid;
        grid-template-columns: minmax(220px, 1fr) minmax(190px, 260px);
        gap: 10px;
        align-items: center;
      }

      .qv-search-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .qv-search-wrap .qv-input {
        padding-left: 36px;
        padding-right: 34px;
      }

      .qv-search-icon {
        position: absolute;
        left: 12px;
        font-size: 0.9rem;
        opacity: 0.75;
        pointer-events: none;
      }

      .qv-search-clear {
        position: absolute;
        right: 9px;
        background: transparent;
        border: none;
        color: var(--text-secondary, #94a3b8);
        cursor: pointer;
        font-size: 0.95rem;
        padding: 3px 6px;
      }

      .qv-results-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .qv-results-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.02rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      /* Quote Cards Grid */
      .qv-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
        gap: 15px;
      }

      .qv-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        padding: 18px;
        border-radius: 16px;
        background: var(--bg-card, rgba(30, 41, 59, 0.74));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .qv-card:hover {
        transform: translateY(-2px);
        border-color: rgba(245, 158, 11, 0.45);
        box-shadow: 0 12px 26px -10px rgba(0, 0, 0, 0.45);
      }

      .qv-card.is-fav {
        border-color: rgba(245, 158, 11, 0.48);
        background:
          radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.09), transparent 46%),
          var(--bg-card, rgba(30, 41, 59, 0.78));
      }

      .qv-card-top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .qv-cat-badge {
        font-size: 0.71rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 999px;
        border: 1px solid currentColor;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .qv-card-quote {
        font-size: 0.92rem;
        line-height: 1.6;
        color: var(--text-primary, #f1f5f9);
        padding: 10px 12px;
        border-radius: 11px;
        background: rgba(15, 23, 42, 0.48);
        border-left: 3px solid rgba(245, 158, 11, 0.65);
        font-style: italic;
      }

      .qv-card-author {
        font-size: 0.81rem;
        font-weight: 700;
        color: var(--accent-gold, #fbbf24);
      }

      .qv-card-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .qv-mini-btn {
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.56);
        color: var(--text-secondary, #cbd5e1);
        padding: 5px 10px;
        border-radius: 9px;
        font-size: 0.75rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: all 0.18s ease;
        font-family: inherit;
      }

      .qv-mini-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(0, 242, 254, 0.45);
      }

      .qv-mini-btn.is-active {
        background: rgba(245, 158, 11, 0.22);
        border-color: rgba(245, 158, 11, 0.6);
        color: #fde68a;
      }

      .qv-mini-btn.is-danger:hover {
        border-color: rgba(244, 63, 94, 0.6);
        color: #fda4af;
      }

      .qv-pagination {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 8px 0;
      }

      .qv-empty {
        padding: 36px 20px;
        text-align: center;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.52);
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.16));
        color: var(--text-secondary, #94a3b8);
      }

      /* Fullscreen Focus Mode Overlay */
      .qv-focus-overlay {
        position: fixed;
        inset: 0;
        z-index: 3200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background:
          radial-gradient(circle at 20% 20%, rgba(245, 158, 11, 0.16), transparent 45%),
          radial-gradient(circle at 80% 80%, rgba(0, 242, 254, 0.14), transparent 45%),
          rgba(5, 8, 18, 0.94);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      .qv-focus-card {
        width: 100%;
        max-width: 820px;
        border-radius: 24px;
        padding: 34px 36px;
        background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
        border: 1px solid rgba(245, 158, 11, 0.42);
        box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.75);
        display: flex;
        flex-direction: column;
        gap: 22px;
        color: #f8fafc;
      }

      .qv-focus-top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .qv-focus-quote {
        font-size: clamp(1.25rem, 2.5vw, 1.72rem);
        line-height: 1.62;
        font-style: italic;
        color: #f8fafc;
        padding: 20px 24px;
        border-radius: 18px;
        background: rgba(10, 15, 29, 0.65);
        border-left: 5px solid #f59e0b;
      }

      .qv-focus-author {
        font-size: 1.04rem;
        font-weight: 800;
        color: #fbbf24;
      }

      .qv-focus-hints {
        font-size: 0.75rem;
        color: #94a3b8;
        text-align: center;
      }

      /* Light Theme (body.light-theme) Overrides */
      body.light-theme .qv-studio {
        color: var(--text-primary, #0f172a);
      }

      body.light-theme .qv-hero {
        background:
          radial-gradient(circle at 88% 15%, rgba(217, 119, 6, 0.14), transparent 45%),
          radial-gradient(circle at 12% 85%, rgba(2, 132, 199, 0.11), transparent 46%),
          rgba(255, 255, 255, 0.94);
        border-color: rgba(217, 119, 6, 0.28);
        box-shadow: 0 12px 30px -12px rgba(15, 23, 42, 0.14);
      }

      body.light-theme .qv-hero h2 {
        background: linear-gradient(135deg, #92400e 0%, #d97706 50%, #0369a1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      body.light-theme .qv-eyebrow {
        color: #b45309;
        background: rgba(217, 119, 6, 0.12);
        border-color: rgba(217, 119, 6, 0.3);
      }

      body.light-theme .qv-stat-box,
      body.light-theme .qv-pill {
        background: rgba(241, 245, 249, 0.9);
        border-color: rgba(15, 23, 42, 0.12);
        color: #334155;
      }

      body.light-theme .qv-stat-val,
      body.light-theme .qv-deck-title,
      body.light-theme .qv-panel-title,
      body.light-theme .qv-results-title {
        color: #0f172a;
      }

      body.light-theme .qv-deck-card,
      body.light-theme .qv-panel,
      body.light-theme .qv-filter-bar,
      body.light-theme .qv-card {
        background: rgba(255, 255, 255, 0.93);
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 10px 26px -14px rgba(15, 23, 42, 0.14);
      }

      body.light-theme .qv-card.is-fav {
        background:
          radial-gradient(circle at 100% 0%, rgba(217, 119, 6, 0.08), transparent 46%),
          rgba(255, 255, 255, 0.96);
        border-color: rgba(217, 119, 6, 0.45);
      }

      body.light-theme .qv-deck-quote-wrap,
      body.light-theme .qv-card-quote,
      body.light-theme .qv-ai-item {
        background: #fffbeb;
        border-color: rgba(217, 119, 6, 0.22);
      }

      body.light-theme .qv-deck-quote,
      body.light-theme .qv-card-quote,
      body.light-theme .qv-ai-quote {
        color: #1e293b;
      }

      body.light-theme .qv-deck-author,
      body.light-theme .qv-card-author {
        color: #b45309;
      }

      body.light-theme .qv-btn,
      body.light-theme .qv-chip,
      body.light-theme .qv-mini-btn {
        background: rgba(248, 250, 252, 0.95);
        border-color: rgba(15, 23, 42, 0.14);
        color: #334155;
      }

      body.light-theme .qv-btn:hover,
      body.light-theme .qv-chip:hover,
      body.light-theme .qv-mini-btn:hover {
        color: #0f172a;
        border-color: #0284c7;
      }

      body.light-theme .qv-btn-gold {
        background: rgba(217, 119, 6, 0.14);
        border-color: rgba(217, 119, 6, 0.45);
        color: #92400e;
      }

      body.light-theme .qv-btn-cyan {
        background: rgba(2, 132, 199, 0.12);
        border-color: rgba(2, 132, 199, 0.42);
        color: #0369a1;
      }

      body.light-theme .qv-btn-emerald {
        background: rgba(5, 150, 105, 0.12);
        border-color: rgba(5, 150, 105, 0.4);
        color: #047857;
      }

      body.light-theme .qv-btn-purple {
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.14), rgba(2, 132, 199, 0.12));
        border-color: rgba(124, 58, 237, 0.42);
        color: #5b21b6;
      }

      body.light-theme .qv-chip.active {
        background: rgba(2, 132, 199, 0.14);
        border-color: #0284c7;
        color: #0c4a6e;
      }

      body.light-theme .qv-chip.is-gold.active,
      body.light-theme .qv-mini-btn.is-active {
        background: rgba(217, 119, 6, 0.18);
        border-color: #d97706;
        color: #92400e;
      }

      body.light-theme .qv-chip.is-purple.active {
        background: rgba(124, 58, 237, 0.15);
        border-color: #7c3aed;
        color: #5b21b6;
      }

      body.light-theme .qv-input,
      body.light-theme .qv-select,
      body.light-theme .qv-textarea {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.18);
        color: #0f172a;
      }

      body.light-theme .qv-card-actions {
        border-top-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .qv-empty {
        background: rgba(241, 245, 249, 0.88);
        border-color: rgba(15, 23, 42, 0.16);
        color: #475569;
      }

      body.light-theme .qv-focus-overlay {
        background:
          radial-gradient(circle at 20% 20%, rgba(217, 119, 6, 0.12), transparent 45%),
          radial-gradient(circle at 80% 80%, rgba(2, 132, 199, 0.1), transparent 45%),
          rgba(248, 250, 252, 0.94);
      }

      body.light-theme .qv-focus-card {
        background: #fffdf8;
        border-color: rgba(217, 119, 6, 0.35);
        color: #0f172a;
        box-shadow: 0 28px 60px -18px rgba(15, 23, 42, 0.22);
      }

      body.light-theme .qv-focus-quote {
        background: #fef9ec;
        color: #1e293b;
        border-left-color: #d97706;
      }

      body.light-theme .qv-focus-author {
        color: #b45309;
      }

      body.light-theme .qv-focus-hints {
        color: #475569;
      }

      @media (max-width: 820px) {
        .qv-stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .qv-search-row,
        .qv-form-row,
        .qv-studio-split {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .qv-grid {
          grid-template-columns: 1fr;
        }
        .qv-focus-card {
          padding: 22px 18px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Main Render Function
  // ---------------------------------------------------------------------------
  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    // Clean up any leftover focus overlay from a previous view
    cleanupFocusOverlay();

    const esc = ctx && typeof ctx.escapeHtml === 'function' ? ctx.escapeHtml : defaultEscapeHtml;
    const norm = ctx && typeof ctx.normalizeTurkish === 'function' ? ctx.normalizeTurkish : defaultNormalizeTurkish;

    let catalog = buildQuoteCatalog(ctx, norm);

    // Deterministic daily card default for today's date
    const todayKey = getTodayKey();
    if (uiState.deckInitializedForDate !== todayKey && catalog.items.length > 0) {
      uiState.deckIndex = hashInt(todayKey + '_quoteVault') % catalog.items.length;
      uiState.deckInitializedForDate = todayKey;
    }

    function refreshCatalog() {
      catalog = buildQuoteCatalog(ctx, norm);
    }

    function getFilteredItems() {
      const qNorm = norm(uiState.search || '');
      return catalog.items.filter(function (item) {
        if (uiState.category === 'favorites' && !item.isFavorite) return false;
        if (uiState.category === 'klasik' && item.category !== 'klasik') return false;
        if (uiState.category === 'ilRuhu' && item.category !== 'ilRuhu') return false;
        if (uiState.category === 'edebi' && item.category !== 'edebi') return false;
        if (uiState.category === 'custom' && item.category !== 'custom') return false;

        if (uiState.region !== 'all') {
          if (!item.regionCode || item.regionCode !== uiState.region) return false;
        }

        if (qNorm && item.searchBlob.indexOf(qNorm) === -1) return false;
        return true;
      });
    }

    function getCategoryCounts() {
      const counts = {
        all: 0,
        favorites: 0,
        klasik: 0,
        ilRuhu: 0,
        edebi: 0,
        custom: 0
      };
      const qNorm = norm(uiState.search || '');
      catalog.items.forEach(function (item) {
        if (uiState.region !== 'all' && item.regionCode !== uiState.region) return;
        if (qNorm && item.searchBlob.indexOf(qNorm) === -1) return;
        counts.all += 1;
        if (item.isFavorite) counts.favorites += 1;
        if (counts[item.category] !== undefined) counts[item.category] += 1;
      });
      return counts;
    }

    function getDeckPool(filtered) {
      return filtered.length > 0 ? filtered : catalog.items;
    }

    function getCurrentDeckItem(filtered) {
      const pool = getDeckPool(filtered);
      if (!pool.length) return null;
      if (uiState.deckIndex < 0 || uiState.deckIndex >= pool.length) {
        uiState.deckIndex = ((uiState.deckIndex % pool.length) + pool.length) % pool.length;
      }
      return { item: pool[uiState.deckIndex], index: uiState.deckIndex, total: pool.length };
    }

    function toggleBookmark(quoteId) {
      const stored = readVaultStorage();
      const idx = stored.favorites.indexOf(quoteId);
      let added = false;
      if (idx === -1) {
        stored.favorites.push(quoteId);
        added = true;
      } else {
        stored.favorites.splice(idx, 1);
      }
      writeVaultStorage(stored);
      refreshCatalog();
      notify(
        ctx,
        added ? '⭐ Alıntı kişisel hazinene eklendi!' : '🔖 Alıntı favori hazinenden çıkarıldı.'
      );
      updateDynamicViews();
    }

    function deleteCustomQuote(quoteId) {
      const stored = readVaultStorage();
      const nextCustom = stored.customQuotes.filter(function (c) {
        return c && c.id !== quoteId;
      });
      const nextFav = stored.favorites.filter(function (fid) {
        return fid !== quoteId;
      });
      writeVaultStorage({ favorites: nextFav, customQuotes: nextCustom });
      refreshCatalog();
      notify(ctx, '🗑️ Kişisel alıntı notu silindi.');
      updateDynamicViews();
    }

    function saveNewCustomQuote(text, author, provinceKey, addToFav, isAi) {
      const cleanText = cleanQuoteText(text);
      if (!cleanText || cleanText.length < 4) {
        notify(ctx, '⚠️ Lütfen en az 4 karakterlik bir hikmet veya alıntı metni girin.');
        return null;
      }
      const p = provinceKey && catalog.provinces[provinceKey] ? catalog.provinces[provinceKey] : null;
      const entryId = 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      const entry = {
        id: entryId,
        text: cleanText,
        author: cleanAuthorText(author) || (isAi ? 'Gemini AI Hikmet Üretimi' : 'Kişisel Seyahat Notu'),
        provinceKey: p ? provinceKey : '',
        provinceName: p ? p.name : '',
        plate: p ? p.plate : null,
        regionCode: p ? (p.region_code || provinceKey.split('/')[0] || '') : '',
        regionName: p ? (p.region || '') : '',
        isAi: Boolean(isAi),
        createdAt: new Date().toISOString()
      };

      const stored = readVaultStorage();
      stored.customQuotes.push(entry);
      if (addToFav && stored.favorites.indexOf(entryId) === -1) {
        stored.favorites.push(entryId);
      }
      writeVaultStorage(stored);
      refreshCatalog();
      return entry;
    }

    function exportVaultMarkdown() {
      const favAndCustom = catalog.items.filter(function (it) {
        return it.isFavorite || it.isCustom;
      });
      const filtered = getFilteredItems();
      const exportList = favAndCustom.length > 0 ? favAndCustom : filtered;
      if (!exportList.length) {
        notify(ctx, '⚠️ Dışa aktarılacak alıntı bulunamadı.');
        return;
      }

      const modeTitle = favAndCustom.length > 0
        ? 'Kişisel Favori Hazinem & Seyahat Notlarım'
        : 'Aktif Filtre Seçkisi';

      const lines = [
        '# 🔖 Anadolu Seyahatnamesi — Hikmet & Alıntı Hazinesi',
        '',
        `- **Seçki Türü:** ${modeTitle}`,
        `- **Oluşturulma Tarihi:** ${formatTrDate(todayKey)}`,
        `- **Toplam Alıntı Sayısı:** ${exportList.length}`,
        '',
        '---',
        ''
      ];

      exportList.forEach(function (item, i) {
        const catLabel = (CATEGORY_META[item.category] && CATEGORY_META[item.category].label) || 'Hikmet';
        const cityTag = item.provinceName
          ? ` · 📍 ${item.provinceName} (${formatPlate(item.plate)}, ${item.regionName})`
          : (item.regionName ? ` · ${item.regionName}` : '');
        const starTag = item.isFavorite ? ' ⭐' : '';

        lines.push(`### ${i + 1}. ${catLabel}${starTag}${cityTag}`);
        lines.push('');
        lines.push(`> "${item.text}"`);
        lines.push(`> — **${item.author}**`);
        lines.push('');
      });

      const filename = `hikmet_hazinesi_${todayKey}.md`;
      triggerMarkdownDownload(filename, lines.join('\n'));
      notify(
        ctx,
        favAndCustom.length > 0
          ? `📥 ${exportList.length} seçkin alıntı (${filename}) indirildi!`
          : `📥 Henüz favori seçilmediği için aktif filtredeki ${exportList.length} alıntı indirildi!`
      );
    }

    function formatQuoteCopyText(item) {
      const cityPart = item.provinceName ? ` (${item.provinceName})` : '';
      return `"${item.text}"\n— ${item.author}${cityPart}`;
    }

    function cleanupFocusOverlay() {
      const existing = document.getElementById('qv-focus-overlay');
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
      if (activeFocusKeyHandler) {
        document.removeEventListener('keydown', activeFocusKeyHandler);
        activeFocusKeyHandler = null;
      }
      uiState.focusOpen = false;
    }

    function openFocusOverlay() {
      cleanupFocusOverlay();
      uiState.focusOpen = true;

      const overlay = document.createElement('div');
      overlay.id = 'qv-focus-overlay';
      overlay.className = 'qv-focus-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Tam Ekran Tefekkür Kartı Odak Modu');

      document.body.appendChild(overlay);
      renderFocusOverlayContent(overlay);

      activeFocusKeyHandler = function (e) {
        if (!document.body.contains(overlay)) {
          cleanupFocusOverlay();
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          cleanupFocusOverlay();
          return;
        }
        const filtered = getFilteredItems();
        const pool = getDeckPool(filtered);
        if (!pool.length) return;

        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          uiState.deckIndex = (uiState.deckIndex - 1 + pool.length) % pool.length;
          renderFocusOverlayContent(overlay);
          renderDeckSection();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          uiState.deckIndex = (uiState.deckIndex + 1) % pool.length;
          renderFocusOverlayContent(overlay);
          renderDeckSection();
        } else if (e.key === ' ') {
          e.preventDefault();
          shuffleDeck(pool);
          renderFocusOverlayContent(overlay);
          renderDeckSection();
        } else if (e.key === 'b' || e.key === 'B') {
          const curr = getCurrentDeckItem(filtered);
          if (curr && curr.item) {
            toggleBookmark(curr.item.id);
            renderFocusOverlayContent(overlay);
          }
        } else if (e.key === 'c' || e.key === 'C') {
          const curr = getCurrentDeckItem(filtered);
          if (curr && curr.item) {
            copyToClipboard(formatQuoteCopyText(curr.item), ctx);
          }
        }
      };

      document.addEventListener('keydown', activeFocusKeyHandler);
    }

    function renderFocusOverlayContent(overlay) {
      if (!overlay) return;
      const filtered = getFilteredItems();
      const deckInfo = getCurrentDeckItem(filtered);
      if (!deckInfo) {
        overlay.innerHTML = '';
        return;
      }
      const item = deckInfo.item;
      const cat = CATEGORY_META[item.category] || CATEGORY_META.klasik;

      overlay.innerHTML = `
        <div class="qv-focus-card">
          <div class="qv-focus-top">
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
              <span class="qv-cat-badge" style="color:${cat.color};background:${cat.bg};">${esc(cat.label)}</span>
              <span class="qv-pill">🎴 Kart ${deckInfo.index + 1} / ${deckInfo.total}</span>
              ${item.provinceName
                ? `<button type="button" class="qv-pill qv-pill-btn" data-focus-city="${esc(item.provinceKey)}">📍 ${esc(item.provinceName)} · ${formatPlate(item.plate)}</button>`
                : ''}
            </div>
            <button type="button" class="qv-btn" id="qv-focus-close">✕ Çıkış (Esc)</button>
          </div>

          <div class="qv-focus-quote">“${esc(item.text)}”</div>

          <div class="qv-deck-meta">
            <div class="qv-focus-author">— ${esc(item.author)}</div>
            ${item.regionName ? `<span class="qv-pill">🌍 ${esc(item.regionName)}</span>` : ''}
          </div>

          <div class="qv-deck-controls">
            <div class="qv-deck-btn-row">
              <button type="button" class="qv-btn" id="qv-focus-prev">◀ Önceki</button>
              <button type="button" class="qv-btn" id="qv-focus-next">Sonraki ▶</button>
              <button type="button" class="qv-btn qv-btn-cyan" id="qv-focus-shuffle">🔀 Rastgele</button>
            </div>
            <div class="qv-deck-btn-row">
              <button type="button" class="qv-btn" id="qv-focus-copy">📋 Kopyala</button>
              <button type="button" class="qv-btn qv-btn-gold" id="qv-focus-fav">
                ${item.isFavorite ? '★ Hazinemde' : '⭐ Hazineme Ekle'}
              </button>
            </div>
          </div>

          <div class="qv-focus-hints">
            Klavye Kısayolları: ← / → Gez &bull; Space Rastgele &bull; B Favoriye Ekle &bull; C Kopyala &bull; Esc Kapat
          </div>
        </div>
      `;

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          cleanupFocusOverlay();
        }
      });

      const closeBtn = overlay.querySelector('#qv-focus-close');
      const prevBtn = overlay.querySelector('#qv-focus-prev');
      const nextBtn = overlay.querySelector('#qv-focus-next');
      const shuffleBtn = overlay.querySelector('#qv-focus-shuffle');
      const copyBtn = overlay.querySelector('#qv-focus-copy');
      const favBtn = overlay.querySelector('#qv-focus-fav');
      const cityBtn = overlay.querySelector('[data-focus-city]');

      if (closeBtn) closeBtn.addEventListener('click', cleanupFocusOverlay);

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          const pool = getDeckPool(getFilteredItems());
          uiState.deckIndex = (uiState.deckIndex - 1 + pool.length) % pool.length;
          renderFocusOverlayContent(overlay);
          renderDeckSection();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          const pool = getDeckPool(getFilteredItems());
          uiState.deckIndex = (uiState.deckIndex + 1) % pool.length;
          renderFocusOverlayContent(overlay);
          renderDeckSection();
        });
      }

      if (shuffleBtn) {
        shuffleBtn.addEventListener('click', function () {
          shuffleDeck(getDeckPool(getFilteredItems()));
          renderFocusOverlayContent(overlay);
          renderDeckSection();
        });
      }

      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          copyToClipboard(formatQuoteCopyText(item), ctx);
        });
      }

      if (favBtn) {
        favBtn.addEventListener('click', function () {
          toggleBookmark(item.id);
          renderFocusOverlayContent(overlay);
        });
      }

      if (cityBtn) {
        cityBtn.addEventListener('click', function () {
          const key = cityBtn.getAttribute('data-focus-city');
          cleanupFocusOverlay();
          if (key && ctx && typeof ctx.selectCity === 'function') {
            ctx.selectCity(key);
          }
        });
      }
    }

    function shuffleDeck(pool) {
      if (!pool || pool.length <= 1) {
        uiState.deckIndex = 0;
        return;
      }
      let nextIdx = Math.floor(Math.random() * pool.length);
      if (nextIdx === uiState.deckIndex) {
        nextIdx = (nextIdx + 1) % pool.length;
      }
      uiState.deckIndex = nextIdx;
    }

    // -------------------------------------------------------------------------
    // Dynamic Section Renderers
    // -------------------------------------------------------------------------
    function renderStatsRow() {
      const host = container.querySelector('#qv-stats-host');
      if (!host) return;
      const klasikCount = catalog.items.filter(function (x) { return x.category === 'klasik'; }).length;
      const ilRuhuCount = catalog.items.filter(function (x) { return x.category === 'ilRuhu'; }).length;
      const edebiCount = catalog.items.filter(function (x) { return x.category === 'edebi'; }).length;
      const customCount = catalog.items.filter(function (x) { return x.category === 'custom'; }).length;

      host.innerHTML = `
        <div class="qv-stat-box">
          <div class="qv-stat-val">${catalog.items.length}</div>
          <div class="qv-stat-lbl">Toplam Hikmet &amp; İktibas</div>
        </div>
        <div class="qv-stat-box">
          <div class="qv-stat-val">${ilRuhuCount} İl + ${edebiCount} Edebî</div>
          <div class="qv-stat-lbl">81 İl Ruhu &amp; İktibas (${klasikCount} Klasik)</div>
        </div>
        <div class="qv-stat-box">
          <div class="qv-stat-val" style="color:var(--accent-gold, #f59e0b);">⭐ ${catalog.favCount}</div>
          <div class="qv-stat-lbl">Favori Hazinemdeki Seçki</div>
        </div>
        <div class="qv-stat-box">
          <div class="qv-stat-val" style="color:var(--accent-emerald, #10b981);">✍️ ${customCount}</div>
          <div class="qv-stat-lbl">Kişisel &amp; AI Hikmet Notum</div>
        </div>
      `;
    }

    function renderDeckSection() {
      const host = container.querySelector('#qv-deck-host');
      if (!host) return;
      const filtered = getFilteredItems();
      const deckInfo = getCurrentDeckItem(filtered);
      if (!deckInfo) {
        host.innerHTML = '';
        return;
      }
      const item = deckInfo.item;
      const cat = CATEGORY_META[item.category] || CATEGORY_META.klasik;

      host.innerHTML = `
        <div class="qv-deck-card">
          <div class="qv-deck-header">
            <div class="qv-deck-title-group">
              <span class="qv-deck-title">🎴 Günün Tefekkür Kartı</span>
              <span class="qv-pill">📅 ${esc(formatTrDate(todayKey))}</span>
              <span class="qv-cat-badge" style="color:${cat.color};background:${cat.bg};">${esc(cat.label)}</span>
              ${item.provinceName
                ? `<button type="button" class="qv-pill qv-pill-btn" data-deck-city="${esc(item.provinceKey)}">📍 ${esc(item.provinceName)} · #${formatPlate(item.plate)}</button>`
                : ''}
            </div>
            <button type="button" class="qv-btn qv-btn-gold" id="qv-open-focus-btn">
              ⛶ Tam Ekran Odak Modu
            </button>
          </div>

          <div class="qv-deck-quote-wrap">
            <div class="qv-deck-mark">“</div>
            <div class="qv-deck-quote">${esc(item.text)}</div>
            <div class="qv-deck-meta">
              <div class="qv-deck-author">— ${esc(item.author)}</div>
              ${item.regionName ? `<span class="qv-pill">🌍 ${esc(item.regionName)}</span>` : ''}
            </div>
          </div>

          <div class="qv-deck-controls">
            <div class="qv-deck-btn-row">
              <button type="button" class="qv-btn" id="qv-deck-prev">◀ Önceki</button>
              <button type="button" class="qv-btn" id="qv-deck-next">Sonraki ▶</button>
              <button type="button" class="qv-btn qv-btn-cyan" id="qv-deck-shuffle">🔀 Rastgele</button>
              <span class="qv-deck-counter">${deckInfo.index + 1} / ${deckInfo.total}</span>
            </div>
            <div class="qv-deck-btn-row">
              <button type="button" class="qv-btn" id="qv-deck-copy">📋 Kopyala</button>
              <button type="button" class="qv-btn qv-btn-gold" id="qv-deck-fav">
                ${item.isFavorite ? '★ Hazinemde' : '⭐ Hazineme Ekle'}
              </button>
            </div>
          </div>
        </div>
      `;

      const focusBtn = host.querySelector('#qv-open-focus-btn');
      const prevBtn = host.querySelector('#qv-deck-prev');
      const nextBtn = host.querySelector('#qv-deck-next');
      const shuffleBtn = host.querySelector('#qv-deck-shuffle');
      const copyBtn = host.querySelector('#qv-deck-copy');
      const favBtn = host.querySelector('#qv-deck-fav');
      const cityBtn = host.querySelector('[data-deck-city]');

      if (focusBtn) focusBtn.addEventListener('click', openFocusOverlay);

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          const pool = getDeckPool(getFilteredItems());
          uiState.deckIndex = (uiState.deckIndex - 1 + pool.length) % pool.length;
          renderDeckSection();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          const pool = getDeckPool(getFilteredItems());
          uiState.deckIndex = (uiState.deckIndex + 1) % pool.length;
          renderDeckSection();
        });
      }

      if (shuffleBtn) {
        shuffleBtn.addEventListener('click', function () {
          shuffleDeck(getDeckPool(getFilteredItems()));
          renderDeckSection();
        });
      }

      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          copyToClipboard(formatQuoteCopyText(item), ctx);
        });
      }

      if (favBtn) {
        favBtn.addEventListener('click', function () {
          toggleBookmark(item.id);
        });
      }

      if (cityBtn) {
        cityBtn.addEventListener('click', function () {
          const key = cityBtn.getAttribute('data-deck-city');
          if (key && ctx && typeof ctx.selectCity === 'function') {
            ctx.selectCity(key);
          }
        });
      }
    }

    function renderFilterChips() {
      const catHost = container.querySelector('#qv-cat-chips');
      const regHost = container.querySelector('#qv-region-chips');
      const counts = getCategoryCounts();

      if (catHost) {
        catHost.innerHTML = CATEGORY_TABS.map(function (tab) {
          const isActive = uiState.category === tab.id;
          const cnt = counts[tab.id] || 0;
          const cls = tab.id === 'favorites' ? 'qv-chip is-gold' : 'qv-chip';
          return `<button type="button" class="${cls}${isActive ? ' active' : ''}" data-qv-cat="${esc(tab.id)}">${esc(tab.label)} <span>(${cnt})</span></button>`;
        }).join('');

        catHost.querySelectorAll('[data-qv-cat]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            uiState.category = btn.getAttribute('data-qv-cat') || 'all';
            uiState.pageLimit = PAGE_STEP;
            uiState.deckIndex = 0;
            updateDynamicViews();
          });
        });
      }

      if (regHost) {
        regHost.innerHTML = REGIONS.map(function (r) {
          const isActive = uiState.region === r.code;
          return `<button type="button" class="qv-chip${isActive ? ' active' : ''}" data-qv-region="${esc(r.code)}">${r.icon} ${esc(r.shortLabel)}</button>`;
        }).join('');

        regHost.querySelectorAll('[data-qv-region]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            uiState.region = btn.getAttribute('data-qv-region') || 'all';
            uiState.pageLimit = PAGE_STEP;
            uiState.deckIndex = 0;
            updateDynamicViews();
          });
        });
      }
    }

    function renderAiResults() {
      const host = container.querySelector('#qv-ai-results-host');
      if (!host) return;

      if (uiState.aiLoading) {
        host.innerHTML = `
          <div class="qv-ai-item">
            <div style="font-size:0.86rem;font-weight:700;color:var(--accent-purple, #c084fc);">
              ✨ Tefekkür özdeyişleri derleniyor...
            </div>
            <div class="qv-ai-note">Seçili konu ve şehir ruhu harmanlanarak 3 hikmet cümlesi hazırlanıyor.</div>
          </div>
        `;
        return;
      }

      if (!uiState.aiResults.length) {
        host.innerHTML = '';
        return;
      }

      host.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <span class="qv-pill">✨ ${esc(uiState.aiSourceLabel || 'Hikmet Üretimi')}</span>
        </div>
        <div class="qv-ai-results">
          ${uiState.aiResults.map(function (resItem, idx) {
            const saved = Boolean(uiState.aiSavedIds[idx]);
            return `
              <div class="qv-ai-item">
                <div class="qv-ai-quote">“${esc(resItem.text)}”</div>
                ${resItem.note ? `<div class="qv-ai-note">💡 ${esc(resItem.note)}</div>` : ''}
                <div class="qv-ai-foot">
                  <span class="qv-card-author">— ${esc(resItem.author)}</span>
                  <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button type="button" class="qv-mini-btn" data-ai-copy="${idx}">📋 Kopyala</button>
                    <button type="button" class="qv-mini-btn${saved ? ' is-active' : ''}" data-ai-save="${idx}">
                      ${saved ? '★ Hazinede' : '⭐ Hazineye Ekle'}
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      host.querySelectorAll('[data-ai-copy]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const i = Number(btn.getAttribute('data-ai-copy'));
          const item = uiState.aiResults[i];
          if (item) {
            copyToClipboard(`"${item.text}"\n— ${item.author}`, ctx);
          }
        });
      });

      host.querySelectorAll('[data-ai-save]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const i = Number(btn.getAttribute('data-ai-save'));
          const item = uiState.aiResults[i];
          if (!item || uiState.aiSavedIds[i]) return;
          const saved = saveNewCustomQuote(item.text, item.author, uiState.aiProvinceKey, true, true);
          if (saved) {
            uiState.aiSavedIds[i] = saved.id;
            notify(ctx, '⭐ AI hikmet özdeyişi hazinene kaydedildi!');
            updateDynamicViews();
            renderAiResults();
          }
        });
      });
    }

    function renderGridSection() {
      const host = container.querySelector('#qv-grid-host');
      if (!host) return;
      const filtered = getFilteredItems();

      if (!filtered.length) {
        host.innerHTML = `
          <div class="qv-empty">
            <div style="font-size:1.8rem;margin-bottom:8px;">🔖</div>
            <div style="font-weight:700;font-size:0.98rem;margin-bottom:6px;">
              ${uiState.category === 'favorites'
                ? 'Favori hazinenizde henüz alıntı bulunmuyor.'
                : uiState.category === 'custom'
                  ? 'Henüz kişisel alıntı notu eklemediniz.'
                  : 'Seçili filtre ve arama kriterine uyan alıntı bulunamadı.'}
            </div>
            <div style="font-size:0.84rem;margin-bottom:12px;">
              ${uiState.category === 'favorites'
                ? 'Kartların üzerindeki "⭐" düğmesine tıklayarak kendi seçkinizi oluşturabilirsiniz.'
                : 'Aramayı temizleyebilir veya "+ Kendi Hikmet / Alıntı Notunu Ekle" formunu kullanabilirsiniz.'}
            </div>
            <button type="button" class="qv-btn qv-btn-cyan" id="qv-reset-filters-btn">🔄 Filtreleri Sıfırla</button>
          </div>
        `;
        const resetBtn = host.querySelector('#qv-reset-filters-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', function () {
            uiState.category = 'all';
            uiState.region = 'all';
            uiState.search = '';
            uiState.pageLimit = PAGE_STEP;
            const searchEl = container.querySelector('#qv-search-input');
            if (searchEl) searchEl.value = '';
            updateDynamicViews();
          });
        }
        return;
      }

      const visibleCount = filtered.length <= 60 ? filtered.length : Math.min(uiState.pageLimit, filtered.length);
      const visibleItems = filtered.slice(0, visibleCount);

      host.innerHTML = `
        <div class="qv-results-bar">
          <div class="qv-results-title">
            📖 Gösterilen Alıntılar: ${visibleItems.length} / ${filtered.length}
          </div>
          <div style="font-size:0.78rem;color:var(--text-secondary, #94a3b8);">
            Kartları "🎴 Odakla" ile tam ekran tefekkür destesine alabilirsiniz.
          </div>
        </div>

        <div class="qv-grid">
          ${visibleItems.map(function (item) {
            const cat = CATEGORY_META[item.category] || CATEGORY_META.klasik;
            return `
              <article class="qv-card${item.isFavorite ? ' is-fav' : ''}" data-quote-id="${esc(item.id)}">
                <div style="display:flex;flex-direction:column;gap:10px;">
                  <div class="qv-card-top">
                    <span class="qv-cat-badge" style="color:${cat.color};background:${cat.bg};">${esc(cat.label)}</span>
                    ${item.provinceName
                      ? `<button type="button" class="qv-pill qv-pill-btn" data-card-city="${esc(item.provinceKey)}" title="Şehir detayını aç">📍 ${esc(item.provinceName)} · ${formatPlate(item.plate)}</button>`
                      : (item.regionName ? `<span class="qv-pill">${esc(item.regionName)}</span>` : '')}
                  </div>
                  <div class="qv-card-quote">“${esc(item.text)}”</div>
                  <div class="qv-card-author">— ${esc(item.author)}</div>
                </div>

                <div class="qv-card-actions">
                  <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button type="button" class="qv-mini-btn" data-card-focus="${esc(item.id)}" title="Tefekkür Kartında Odakla">🎴 Odakla</button>
                    <button type="button" class="qv-mini-btn" data-card-copy="${esc(item.id)}" title="Panoya Kopyala">📋 Kopyala</button>
                  </div>
                  <div style="display:flex;gap:6px;align-items:center;">
                    ${item.isCustom
                      ? `<button type="button" class="qv-mini-btn is-danger" data-card-delete="${esc(item.id)}" title="Notu Sil">🗑️</button>`
                      : ''}
                    <button type="button" class="qv-mini-btn${item.isFavorite ? ' is-active' : ''}" data-card-fav="${esc(item.id)}">
                      ${item.isFavorite ? '★ Hazinemde' : '⭐ Hazineme Ekle'}
                    </button>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>

        ${visibleCount < filtered.length ? `
          <div class="qv-pagination">
            <button type="button" class="qv-btn qv-btn-cyan" id="qv-load-more-btn">
              ➕ ${Math.min(PAGE_STEP, filtered.length - visibleCount)} Alıntı Daha Göster
            </button>
            <button type="button" class="qv-btn" id="qv-show-all-btn">
              📚 Tümünü Göster (${filtered.length})
            </button>
          </div>
        ` : ''}
      `;

      // Bind card actions
      const itemMap = {};
      visibleItems.forEach(function (it) { itemMap[it.id] = it; });

      host.querySelectorAll('[data-card-city]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const key = btn.getAttribute('data-card-city');
          if (key && ctx && typeof ctx.selectCity === 'function') {
            ctx.selectCity(key);
          }
        });
      });

      host.querySelectorAll('[data-card-fav]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const id = btn.getAttribute('data-card-fav');
          if (id) toggleBookmark(id);
        });
      });

      host.querySelectorAll('[data-card-copy]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const id = btn.getAttribute('data-card-copy');
          if (id && itemMap[id]) {
            copyToClipboard(formatQuoteCopyText(itemMap[id]), ctx);
          }
        });
      });

      host.querySelectorAll('[data-card-focus]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const id = btn.getAttribute('data-card-focus');
          const pool = getDeckPool(getFilteredItems());
          const foundIdx = pool.findIndex(function (x) { return x.id === id; });
          if (foundIdx !== -1) {
            uiState.deckIndex = foundIdx;
          }
          renderDeckSection();
          openFocusOverlay();
        });
      });

      host.querySelectorAll('[data-card-delete]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const id = btn.getAttribute('data-card-delete');
          if (id) deleteCustomQuote(id);
        });
      });

      const loadMoreBtn = host.querySelector('#qv-load-more-btn');
      const showAllBtn = host.querySelector('#qv-show-all-btn');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
          uiState.pageLimit += PAGE_STEP;
          renderGridSection();
        });
      }
      if (showAllBtn) {
        showAllBtn.addEventListener('click', function () {
          uiState.pageLimit = filtered.length + PAGE_STEP;
          renderGridSection();
        });
      }
    }

    function updateDynamicViews() {
      renderStatsRow();
      renderDeckSection();
      renderFilterChips();
      renderGridSection();
    }

    // -------------------------------------------------------------------------
    // Build Province Options HTML
    // -------------------------------------------------------------------------
    const provinceOptionsHtml = catalog.sortedProvinceKeys.map(function (key) {
      const p = catalog.provinces[key] || {};
      return `<option value="${esc(key)}">${formatPlate(p.plate)} — ${esc(p.name || key)} (${esc(p.region || '')})</option>`;
    }).join('');

    // -------------------------------------------------------------------------
    // Initial Shell Render
    // -------------------------------------------------------------------------
    container.innerHTML = `
      <div class="qv-studio">
        <!-- Hero Banner -->
        <section class="qv-hero">
          <div class="qv-hero-top">
            <div>
              <div class="qv-eyebrow">🔖 Seyyah Kütüphanesi &bull; 300+ Özgün İktibas</div>
              <h2>🔖 Hikmet &amp; Alıntı Hazinesi (180+ Edebî İktibas, Fikir Kartları &amp; Kişisel Seçki)</h2>
              <p class="qv-hero-sub">
                Klasik seyahat hikmetleri, 81 ilin şehir ruhu özdeyişleri, Anadolu edebiyatından 200'ü aşkın iktibas
                ve kendi tefekkür notlarınız tek bir yaşayan hafıza hazinesinde buluşuyor.
              </p>
            </div>
            <div class="qv-hero-actions">
              <button type="button" class="qv-btn qv-btn-gold" id="qv-hero-focus-btn">🎴 Tam Ekran Odak Modu</button>
              <button type="button" class="qv-btn qv-btn-emerald" id="qv-export-md-btn">📥 Seçkimi Markdown Olarak İndir</button>
            </div>
          </div>
          <div class="qv-stats-grid" id="qv-stats-host"></div>
        </section>

        <!-- Daily Reflection Deck -->
        <section id="qv-deck-host"></section>

        <!-- Two-Column Studio: Add Custom Note + Gemini AI Generator -->
        <section class="qv-studio-split">
          <!-- Custom Quote Form -->
          <div class="qv-panel is-add">
            <div class="qv-panel-head">
              <div>
                <div class="qv-panel-title">✍️ + Kendi Hikmet / Alıntı Notunu Ekle</div>
                <div class="qv-panel-sub">Okuduğun bir kitaptan, kütüphane masasından veya yoldan kalıcı not ekle.</div>
              </div>
              <span class="qv-pill">💾 Yerel Kayıt</span>
            </div>

            <form id="qv-add-form" style="display:flex;flex-direction:column;gap:11px;">
              <div>
                <label class="qv-field-label" for="qv-note-text">Hikmet / Alıntı Metni *</label>
                <textarea id="qv-note-text" class="qv-textarea" required placeholder="Örn: Yolculuk, insanın hem coğrafyayı hem kendi iç derinliğini yeniden okuma sanatıdır..."></textarea>
              </div>

              <div class="qv-form-row">
                <div>
                  <label class="qv-field-label" for="qv-note-author">Müellif / Kaynak</label>
                  <input id="qv-note-author" class="qv-input" type="text" placeholder="Örn: İbn Battûta, Tanpınar, Kişisel Not" />
                </div>
                <div>
                  <label class="qv-field-label" for="qv-note-province">İl Bağlantısı (İsteğe Bağlı)</label>
                  <select id="qv-note-province" class="qv-select">
                    <option value="">Şehir Bağlantısı Yok (Genel)</option>
                    ${provinceOptionsHtml}
                  </select>
                </div>
              </div>

              <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
                <label class="qv-checkbox-row">
                  <input type="checkbox" id="qv-note-fav" checked />
                  <span>⭐ Favori hazineme de ekle</span>
                </label>
                <button type="submit" class="qv-btn qv-btn-emerald">🔖 Hazineye Kaydet</button>
              </div>
            </form>
          </div>

          <!-- Gemini AI Wisdom Generator -->
          <div class="qv-panel is-ai">
            <div class="qv-panel-head">
              <div>
                <div class="qv-panel-title">✨ Gemini AI Hikmet &amp; Tefekkür Atölyesi</div>
                <div class="qv-panel-sub">Seçili tema veya şehir ruhu üzerine yeni tefekkür özdeyişleri üret.</div>
              </div>
              <span class="qv-pill" id="qv-ai-mode-badge">
                ${window.SEYYAH_AI && typeof window.SEYYAH_AI.hasKey === 'function' && window.SEYYAH_AI.hasKey()
                  ? '⚡ Gemini AI Hazır'
                  : '🌿 Çevrimdışı Yedek Aktif'}
              </span>
            </div>

            <div>
              <span class="qv-field-label">Konu Seçimi</span>
              <div class="qv-chip-row" id="qv-ai-topic-chips">
                ${AI_TOPICS.map(function (t) {
                  const active = uiState.aiTopicId === t.id;
                  return `<button type="button" class="qv-chip is-purple${active ? ' active' : ''}" data-ai-topic="${esc(t.id)}">${t.icon} ${esc(t.label)}</button>`;
                }).join('')}
              </div>
            </div>

            <div class="qv-form-row">
              <div>
                <label class="qv-field-label" for="qv-ai-custom-topic">Özel Konu / Kavram (İsteğe Bağlı)</label>
                <input id="qv-ai-custom-topic" class="qv-input" type="text" value="${esc(uiState.aiCustomTopic)}" placeholder="Örn: Selçuklu taş işçiliği, şafak vakti, vefa..." />
              </div>
              <div>
                <label class="qv-field-label" for="qv-ai-province">Şehir Odağı (İsteğe Bağlı)</label>
                <select id="qv-ai-province" class="qv-select">
                  <option value="">Genel Anadolu Tefekkürü</option>
                  ${provinceOptionsHtml}
                </select>
              </div>
            </div>

            <div>
              <button type="button" class="qv-btn qv-btn-purple" id="qv-ai-generate-btn" style="width:100%;justify-content:center;">
                ✨ Gemini AI ile Seçili Konuda Yeni Hikmet &amp; Tefekkür Özdeyişi Üret
              </button>
            </div>

            <div id="qv-ai-results-host"></div>
          </div>
        </section>

        <!-- Filters & Turkish-Aware Search -->
        <section class="qv-filter-bar">
          <div class="qv-search-row">
            <div class="qv-search-wrap">
              <span class="qv-search-icon">🔍</span>
              <input id="qv-search-input" class="qv-input" type="search" value="${esc(uiState.search)}" placeholder="Türkçe uyumlu ara: yazar, şehir, plaka, kelime (ör. mevlana, şadırvan, konya)..." />
              <button type="button" class="qv-search-clear" id="qv-search-clear" title="Aramayı Temizle">✕</button>
            </div>
            <div style="font-size:0.79rem;color:var(--text-secondary, #94a3b8);text-align:right;">
              Türkçe karakter duyarsız arama aktif (ç/c, ğ/g, ı/i, ö/o, ş/s, ü/u)
            </div>
          </div>

          <div class="qv-chip-row" id="qv-cat-chips"></div>
          <div class="qv-chip-row" id="qv-region-chips"></div>
        </section>

        <!-- Quotes Catalog Grid -->
        <section id="qv-grid-host" style="display:flex;flex-direction:column;gap:14px;"></section>
      </div>
    `;

    // Wire Hero Actions
    const heroFocusBtn = container.querySelector('#qv-hero-focus-btn');
    const exportBtn = container.querySelector('#qv-export-md-btn');
    if (heroFocusBtn) heroFocusBtn.addEventListener('click', openFocusOverlay);
    if (exportBtn) exportBtn.addEventListener('click', exportVaultMarkdown);

    // Wire Search
    const searchInput = container.querySelector('#qv-search-input');
    const searchClear = container.querySelector('#qv-search-clear');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        uiState.search = searchInput.value || '';
        uiState.pageLimit = PAGE_STEP;
        uiState.deckIndex = 0;
        updateDynamicViews();
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', function () {
        uiState.search = '';
        if (searchInput) searchInput.value = '';
        uiState.pageLimit = PAGE_STEP;
        uiState.deckIndex = 0;
        updateDynamicViews();
      });
    }

    // Wire Custom Note Form
    const addForm = container.querySelector('#qv-add-form');
    if (addForm) {
      addForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const textEl = container.querySelector('#qv-note-text');
        const authorEl = container.querySelector('#qv-note-author');
        const provEl = container.querySelector('#qv-note-province');
        const favEl = container.querySelector('#qv-note-fav');

        const saved = saveNewCustomQuote(
          textEl ? textEl.value : '',
          authorEl ? authorEl.value : '',
          provEl ? provEl.value : '',
          favEl ? favEl.checked : true,
          false
        );

        if (saved) {
          if (textEl) textEl.value = '';
          if (authorEl) authorEl.value = '';
          if (provEl) provEl.value = '';
          uiState.deckIndex = 0;
          notify(ctx, '🔖 Kişisel hikmet notun hazineye eklendi!');
          updateDynamicViews();
        }
      });
    }

    // Wire AI Generator Controls
    const aiProvSelect = container.querySelector('#qv-ai-province');
    const aiCustomInput = container.querySelector('#qv-ai-custom-topic');
    const aiGenBtn = container.querySelector('#qv-ai-generate-btn');

    if (aiProvSelect) {
      aiProvSelect.value = uiState.aiProvinceKey || '';
      aiProvSelect.addEventListener('change', function () {
        uiState.aiProvinceKey = aiProvSelect.value || '';
      });
    }
    if (aiCustomInput) {
      aiCustomInput.addEventListener('input', function () {
        uiState.aiCustomTopic = aiCustomInput.value || '';
      });
    }

    container.querySelectorAll('[data-ai-topic]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        uiState.aiTopicId = btn.getAttribute('data-ai-topic') || 'yolculuk';
        container.querySelectorAll('[data-ai-topic]').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
      });
    });

    if (aiGenBtn) {
      aiGenBtn.addEventListener('click', async function () {
        if (uiState.aiLoading) return;
        const topicObj = AI_TOPICS.find(function (t) { return t.id === uiState.aiTopicId; }) || AI_TOPICS[0];
        const customTopic = (aiCustomInput ? aiCustomInput.value : uiState.aiCustomTopic).trim();
        const topicTitle = customTopic || topicObj.label;
        const provKey = aiProvSelect ? aiProvSelect.value : uiState.aiProvinceKey;
        const prov = provKey && catalog.provinces[provKey] ? catalog.provinces[provKey] : null;

        uiState.aiLoading = true;
        uiState.aiSavedIds = {};
        aiGenBtn.disabled = true;
        renderAiResults();

        const hasAi = Boolean(
          typeof window !== 'undefined' &&
          window.SEYYAH_AI &&
          typeof window.SEYYAH_AI.ask === 'function'
        );

        let produced = [];
        let sourceLabel = '';

        if (hasAi) {
          const cityContext = prov
            ? `Odak Şehir: ${prov.name} (${prov.region}, Plaka ${formatPlate(prov.plate)}). Şehir Özeti: ${prov.custom_quote || prov.quote || ''}. Önemli Duraklar: ${(prov.landmarks || []).slice(0, 3).join(', ')}.`
            : 'Odak: Anadolu seyahati, kütüphane çalışması ve içsel tefekkür.';

          const systemPrompt =
            'Sen Anadolu irfan geleneği, Ahmet Hamdi Tanpınar zarafeti ve Evliya Çelebi merakıyla yazan bilge bir mütefekkir ve seyyahsın. ' +
            'Türkçe, özlü, edebî derinliği yüksek hikmet ve tefekkür özdeyişleri üretirsin. Yanıtını yalnızca geçerli bir JSON dizisi olarak ver.';

          const userPrompt =
            `Konu: "${topicTitle}".\n${cityContext}\n\n` +
            'Bu konuda 3 adet özgün, derinlikli ve ilham verici Türkçe hikmet / tefekkür özdeyişi üret.\n' +
            'Yalnızca şu JSON dizisi formatında dön:\n' +
            '[{"quote":"Özdeyiş metni","author":"Kısa mahlas veya tema başlığı","note":"1 cümlelik tefekkür açıklaması"}]';

          try {
            const res = await window.SEYYAH_AI.ask({
              system: systemPrompt,
              prompt: userPrompt,
              temperature: 0.85,
              maxTokens: 900
            });
            produced = parseAiWisdomResponse(res && res.text, topicTitle, prov ? prov.name : '');
            if (produced.length > 0) {
              sourceLabel = res && res.model ? `Gemini AI (${res.model})` : 'Gemini AI';
            }
          } catch (_) {
            produced = [];
          }
        }

        if (!produced.length) {
          produced = buildOfflineWisdom(uiState.aiTopicId, customTopic, prov);
          sourceLabel = 'Çevrimdışı İrfan Derlemesi';
        }

        uiState.aiResults = produced;
        uiState.aiSourceLabel = sourceLabel;
        uiState.aiLoading = false;
        aiGenBtn.disabled = false;
        renderAiResults();
        notify(ctx, `✨ "${topicTitle}" konusunda ${produced.length} tefekkür özdeyişi hazır!`);
      });
    }

    updateDynamicViews();
    renderAiResults();
  }

  window.SEYYAH_MODULES.quoteVault = {
    render: render
  };
})();
