/**
 * Anadolu Seyahatnamesi — Anadolu Bucket List & Sefer Hedefleri Modülü
 * 7 bölgeden 24 küratörlü Anadolu hedefi + 81 il destekli özel hedef ekleme,
 * localStorage kalıcılığı, animasyonlu SVG tamamlama halkası, konfeti efekti ve şehir bağlantısı.
 * Registers on window.SEYYAH_MODULES.bucketList = { render(container, ctx) }
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'dijital_seyyah_bucket_list';
  const STYLE_ID = 'seyyah-bucket-list-styles';

  const CATEGORIES = [
    { id: 'maneviyat', label: '🕌 Maneviyat', shortLabel: 'Maneviyat', icon: '🕌', color: '#a855f7' },
    { id: 'tarih', label: '🏛️ Tarih', shortLabel: 'Tarih', icon: '🏛️', color: '#f59e0b' },
    { id: 'doga', label: '🌲 Doğa', shortLabel: 'Doğa', icon: '🌲', color: '#10b981' },
    { id: 'lezzet', label: '🍽️ Lezzet', shortLabel: 'Lezzet', icon: '🍽️', color: '#f97316' },
    { id: 'kutuphane', label: '📚 Kütüphane', shortLabel: 'Kütüphane', icon: '📚', color: '#00f2fe' }
  ];

  const REGIONS = [
    { code: '01_Marmara', name: 'Marmara', fullName: 'Marmara Bölgesi', icon: '🏰', color: '#38bdf8' },
    { code: '02_Ege', name: 'Ege', fullName: 'Ege Bölgesi', icon: '🌊', color: '#34d399' },
    { code: '03_Akdeniz', name: 'Akdeniz', fullName: 'Akdeniz Bölgesi', icon: '☀️', color: '#f59e0b' },
    { code: '04_IcAnadolu', name: 'İç Anadolu', fullName: 'İç Anadolu Bölgesi', icon: '🌾', color: '#fbbf24' },
    { code: '05_Karadeniz', name: 'Karadeniz', fullName: 'Karadeniz Bölgesi', icon: '🌲', color: '#10b981' },
    { code: '06_DoguAnadolu', name: 'Doğu Anadolu', fullName: 'Doğu Anadolu Bölgesi', icon: '🏔️', color: '#a855f7' },
    { code: '07_GuneydoguAnadolu', name: 'Güneydoğu', fullName: 'Güneydoğu Anadolu Bölgesi', icon: '🏜️', color: '#f97316' }
  ];

  const CURATED_MISSIONS = [
    // 01_Marmara (4)
    {
      id: 'cur-istanbul-ayasofya',
      title: "Ayasofya ve Süleymaniye'de Sabah Tefekkürü",
      note: "Tarihi Yarımada'da sabah namazı sonrası Boğaz'a karşı gün doğumunu izlemek.",
      cityKey: '01_Marmara/Istanbul',
      cityName: 'İstanbul',
      regionCode: '01_Marmara',
      category: 'maneviyat'
    },
    {
      id: 'cur-bursa-ulucami',
      title: 'Ulu Cami Sonrası İskender & Kestane Şekeri',
      note: "Bursa'nın ilk Osmanlı hanları arasında yürüyüp tarihî çarşı lezzetlerini tatmak.",
      cityKey: '01_Marmara/Bursa',
      cityName: 'Bursa',
      regionCode: '01_Marmara',
      category: 'lezzet'
    },
    {
      id: 'cur-canakkale-gelibolu',
      title: "Gelibolu Şehitliği ve Troya'da Tarih Nöbeti",
      note: "Çanakkale Boğazı'nın iki yakasında binlerce yıllık destanlara tanıklık etmek.",
      cityKey: '01_Marmara/Canakkale',
      cityName: 'Çanakkale',
      regionCode: '01_Marmara',
      category: 'tarih'
    },
    {
      id: 'cur-edirne-selimiye',
      title: 'Selimiye Kubbesi Altında Huzur',
      note: "Mimar Sinan'ın ustalık eserinde ezan dinleyip Tunca kıyısında tava ciğeri yemek.",
      cityKey: '01_Marmara/Edirne',
      cityName: 'Edirne',
      regionCode: '01_Marmara',
      category: 'maneviyat'
    },

    // 02_Ege (3)
    {
      id: 'cur-izmir-efes',
      title: 'Efes Celsus Kütüphanesi ve Kemeraltı Yürüyüşü',
      note: "Antik mermer caddelerden İzmir'in tarihî pasajlarına uzanan kültür rotası.",
      cityKey: '02_Ege/Izmir',
      cityName: 'İzmir',
      regionCode: '02_Ege',
      category: 'tarih'
    },
    {
      id: 'cur-denizli-pamukkale',
      title: 'Pamukkale Travertenlerinde Gün Batımı',
      note: 'Beyaz traverten teraslarında yürüyüp Hierapolis antik tiyatrosundan vadiyi izlemek.',
      cityKey: '02_Ege/Denizli',
      cityName: 'Denizli',
      regionCode: '02_Ege',
      category: 'doga'
    },
    {
      id: 'cur-afyon-kaymak',
      title: 'Karahisar Kalesi Eteğinde Kaymaklı Ekmek Kadayıfı',
      note: 'Mevlevihane ziyareti sonrası taş fırından çıkan Afyon lezzetlerini keşfetmek.',
      cityKey: '02_Ege/Afyonkarahisar',
      cityName: 'Afyonkarahisar',
      regionCode: '02_Ege',
      category: 'lezzet'
    },

    // 03_Akdeniz (3)
    {
      id: 'cur-antalya-kaleici',
      title: 'Düden Şelalesi ve Kaleiçi Liman Rotası',
      note: "Toroslardan Akdeniz'e dökülen suların sesiyle antik limanda akşam yürüyüşü.",
      cityKey: '03_Akdeniz/Antalya',
      cityName: 'Antalya',
      regionCode: '03_Akdeniz',
      category: 'doga'
    },
    {
      id: 'cur-hatay-kunefe',
      title: 'Habib-i Neccar Sonrası Uzun Çarşı Künefesi',
      note: 'Kadim Antakya sokaklarında ortak yaşam izlerini sürüp közde künefe tatmak.',
      cityKey: '03_Akdeniz/Hatay',
      cityName: 'Hatay',
      regionCode: '03_Akdeniz',
      category: 'lezzet'
    },
    {
      id: 'cur-maras-edebiyat',
      title: 'Yedi Güzel Adam Müzesi ve Okuma Mesaisi',
      note: 'Şiirin başkentinde edebiyat müzesini gezip il halk kütüphanesinde notlar almak.',
      cityKey: '03_Akdeniz/Kahramanmaras',
      cityName: 'Kahramanmaraş',
      regionCode: '03_Akdeniz',
      category: 'kutuphane'
    },

    // 04_IcAnadolu (4)
    {
      id: 'cur-ankara-millet',
      title: "Millet Kütüphanesi'nde Tam Gün Odaklanma",
      note: "Cihannüma Salonu'nda kitaplar arasında derin çalışma ve akşam Hacı Bayram ziyareti.",
      cityKey: '04_IcAnadolu/Ankara',
      cityName: 'Ankara',
      regionCode: '04_IcAnadolu',
      category: 'kutuphane'
    },
    {
      id: 'cur-konya-mevlana',
      title: 'Hz. Mevlâna Dergâhı ve Şems-i Tebrizî Ziyareti',
      note: "Kubbe-i Hadra gölgesinde sükûnet bulup Sille'nin kadim taş sokaklarında yürümek.",
      cityKey: '04_IcAnadolu/Konya',
      cityName: 'Konya',
      regionCode: '04_IcAnadolu',
      category: 'maneviyat'
    },
    {
      id: 'cur-nevsehir-kapadokya',
      title: 'Kapadokya Vadilerinde Gün Doğumu Yürüyüşü',
      note: 'Kızılçukur ve Güvercinlik vadilerinde peribacaları arasında sabah seferi.',
      cityKey: '04_IcAnadolu/Nevsehir',
      cityName: 'Nevşehir',
      regionCode: '04_IcAnadolu',
      category: 'doga'
    },
    {
      id: 'cur-kirsehir-ahievran',
      title: 'Ahi Evran Külliyesi ve Âşık Paşa Kütüphanesi',
      note: 'Anadolu irfanının kalbinde Ahilik felsefesi üzerine okuma ve araştırma yapmak.',
      cityKey: '04_IcAnadolu/Kirsehir',
      cityName: 'Kırşehir',
      regionCode: '04_IcAnadolu',
      category: 'kutuphane'
    },

    // 05_Karadeniz (4)
    {
      id: 'cur-trabzon-sumela',
      title: 'Sümela Sisleri ve Uzungöl Sabahı',
      note: "Altındere Vadisi'nin dik yamaçlarından yayla göllerine uzanan yeşil yolculuk.",
      cityKey: '05_Karadeniz/Trabzon',
      cityName: 'Trabzon',
      regionCode: '05_Karadeniz',
      category: 'doga'
    },
    {
      id: 'cur-amasya-kralkaya',
      title: 'Yeşilırmak Yalıboyu ve Kral Kaya Mezarları',
      note: 'Şehzadeler şehrinde nehir kenarında gece ışıkları altında tarihî konakları gezmek.',
      cityKey: '05_Karadeniz/Amasya',
      cityName: 'Amasya',
      regionCode: '05_Karadeniz',
      category: 'tarih'
    },
    {
      id: 'cur-rize-pokut',
      title: "Pokut Yaylası'nda Bulut Denizi ve Çay Keyfi",
      note: 'Kaçkar eteklerindeki ahşap evlerde sislerin üstünden taze demli çay içmek.',
      cityKey: '05_Karadeniz/Rize',
      cityName: 'Rize',
      regionCode: '05_Karadeniz',
      category: 'doga'
    },
    {
      id: 'cur-kastamonu-kutuphane',
      title: 'Kastamonu İl Halk Kütüphanesi & Yazma Eserler',
      note: 'Nasrullah Meydanı çevresinde soluklanıp tarihî kütüphane raflarında çalışmak.',
      cityKey: '05_Karadeniz/Kastamonu',
      cityName: 'Kastamonu',
      regionCode: '05_Karadeniz',
      category: 'kutuphane'
    },

    // 06_DoguAnadolu (3)
    {
      id: 'cur-erzurum-cag',
      title: 'Çifte Minare Gölgesinde Cağ Kebabı',
      note: 'Yakutiye ve Oltu Taşı Çarşısı gezisi sonrası odun ateşinde Erzurum sofrası.',
      cityKey: '06_DoguAnadolu/Erzurum',
      cityName: 'Erzurum',
      regionCode: '06_DoguAnadolu',
      category: 'lezzet'
    },
    {
      id: 'cur-kars-ani',
      title: 'Ani Harabeleri ve Doğu Ekspresi Durağı',
      note: 'Arpaçay sınırındaki bin yıllık taş şehirde rüzgârı dinleyip Baltık mimarisini gezmek.',
      cityKey: '06_DoguAnadolu/Kars',
      cityName: 'Kars',
      regionCode: '06_DoguAnadolu',
      category: 'tarih'
    },
    {
      id: 'cur-van-kahvalti',
      title: 'Akdamar Manzaralı Serpme Van Kahvaltısı',
      note: "Van Gölü'nün turkuaz sularına karşı otlu peynir ve kavut eşliğinde sabah sofrası.",
      cityKey: '06_DoguAnadolu/Van',
      cityName: 'Van',
      regionCode: '06_DoguAnadolu',
      category: 'lezzet'
    },

    // 07_GuneydoguAnadolu (3)
    {
      id: 'cur-urfa-balikligol',
      title: 'Balıklıgöl Akşamı ve Göbeklitepe Keşfi',
      note: 'İnsanlık tarihinin sıfır noktasından Halil-ür Rahman avlusuna uzanan manevi sefer.',
      cityKey: '07_GuneydoguAnadolu/Sanliurfa',
      cityName: 'Şanlıurfa',
      regionCode: '07_GuneydoguAnadolu',
      category: 'maneviyat'
    },
    {
      id: 'cur-antep-baklava',
      title: 'Zeugma Mozaikleri ve Bakırcılar Çarşısı',
      note: 'Çingene Kızı mozaiğini görüp tarihî hanlarda fıstıklı baklava ve menengiç kahvesi içmek.',
      cityKey: '07_GuneydoguAnadolu/Gaziantep',
      cityName: 'Gaziantep',
      regionCode: '07_GuneydoguAnadolu',
      category: 'lezzet'
    },
    {
      id: 'cur-mardin-tas',
      title: 'Eski Mardin Teraslarından Mezopotamya',
      note: 'Kasımiye Medresesi ve Deyrulzafaran sonrası taş konak teraslarında gün batımı.',
      cityKey: '07_GuneydoguAnadolu/Mardin',
      cityName: 'Mardin',
      regionCode: '07_GuneydoguAnadolu',
      category: 'tarih'
    }
  ];

  // Safe Helpers (use ctx utilities with self-contained fallbacks)
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
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .trim();
  }

  function localToast(msg) {
    const existing = document.getElementById('toast-container');
    if (existing) {
      const item = document.createElement('div');
      item.className = 'toast-item';
      item.textContent = msg;
      existing.appendChild(item);
      setTimeout(() => {
        item.style.opacity = '0';
        item.style.transition = 'opacity 0.25s ease';
        setTimeout(() => item.remove(), 260);
      }, 2400);
      return;
    }
    const toast = document.createElement('div');
    toast.className = 'bl-fallback-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 260);
    }, 2200);
  }

  function getCategoryMeta(catId) {
    return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[0];
  }

  function getRegionMeta(regionCode) {
    return REGIONS.find((r) => r.code === regionCode) || REGIONS[0];
  }

  function getProvincesMap(ctx) {
    const raw = (ctx && ctx.data && ctx.data.provinces) ||
      (typeof TRAVEL_DATA !== 'undefined' && TRAVEL_DATA && TRAVEL_DATA.provinces) ||
      {};
    return raw;
  }

  function buildSortedProvinces(provincesMap) {
    return Object.entries(provincesMap)
      .map(([key, p]) => ({
        key,
        name: (p && p.name) || key.split('/').pop(),
        plate: (p && p.plate) || 0,
        regionCode: (p && p.region_code) || key.split('/')[0],
        regionName: (p && p.region) || '',
        visited: Boolean(p && p.visited)
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }

  // Storage Persistence
  function createDefaultStore(provincesMap) {
    const completed = {};
    CURATED_MISSIONS.forEach((m) => {
      const prov = provincesMap[m.cityKey];
      completed[m.id] = Boolean(prov && prov.visited);
    });
    return {
      version: 1,
      completed,
      customItems: []
    };
  }

  function loadStore(provincesMap) {
    const fallback = createDefaultStore(provincesMap);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        saveStore(fallback);
        return fallback;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return fallback;

      const validCategoryIds = new Set(CATEGORIES.map((c) => c.id));
      const completed = {};
      const rawCompleted = parsed.completed && typeof parsed.completed === 'object' ? parsed.completed : {};

      CURATED_MISSIONS.forEach((m) => {
        if (Object.prototype.hasOwnProperty.call(rawCompleted, m.id)) {
          completed[m.id] = Boolean(rawCompleted[m.id]);
        } else {
          const prov = provincesMap[m.cityKey];
          completed[m.id] = Boolean(prov && prov.visited);
        }
      });

      const customItems = [];
      if (Array.isArray(parsed.customItems)) {
        parsed.customItems.forEach((item) => {
          if (!item || typeof item !== 'object') return;
          const title = typeof item.title === 'string' ? item.title.trim() : '';
          const cityKey = typeof item.cityKey === 'string' ? item.cityKey : '';
          if (!title || !cityKey) return;
          const prov = provincesMap[cityKey];
          const regionCode = (prov && prov.region_code) || item.regionCode || cityKey.split('/')[0] || '04_IcAnadolu';
          const category = validCategoryIds.has(item.category) ? item.category : 'tarih';
          customItems.push({
            id: typeof item.id === 'string' && item.id ? item.id : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            title: title.slice(0, 140),
            note: typeof item.note === 'string' ? item.note.trim().slice(0, 220) : '',
            cityKey,
            cityName: (prov && prov.name) || item.cityName || cityKey.split('/').pop(),
            regionCode,
            category,
            completed: Boolean(item.completed),
            createdAt: Number(item.createdAt) || Date.now(),
            isCustom: true
          });
        });
      }

      return {
        version: 1,
        completed,
        customItems
      };
    } catch (e) {
      return fallback;
    }
  }

  function saveStore(store) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      // Ignore storage quota or private-mode errors
    }
  }

  // Confetti Burst Effect
  function triggerConfettiBurst(anchorEl) {
    if (!anchorEl || typeof document === 'undefined') return;
    const rect = anchorEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const colors = ['#00f2fe', '#10b981', '#f59e0b', '#a855f7', '#38bdf8', '#f43f5e', '#fbbf24'];
    const count = 24;

    const layer = document.createElement('div');
    layer.className = 'bl-confetti-layer';
    document.body.appendChild(layer);

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'bl-confetti-piece';
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
      const dist = 38 + Math.random() * 68;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 22;
      const rot = Math.round((Math.random() - 0.5) * 540);
      const size = 5 + Math.round(Math.random() * 5);
      const color = colors[i % colors.length];

      piece.style.left = `${originX}px`;
      piece.style.top = `${originY}px`;
      piece.style.width = `${size}px`;
      piece.style.height = `${i % 3 === 0 ? size : Math.max(4, Math.round(size * 0.6))}px`;
      piece.style.backgroundColor = color;
      piece.style.setProperty('--dx', `${dx.toFixed(1)}px`);
      piece.style.setProperty('--dy', `${dy.toFixed(1)}px`);
      piece.style.setProperty('--rot', `${rot}deg`);
      piece.style.animationDelay = `${(Math.random() * 0.06).toFixed(2)}s`;

      layer.appendChild(piece);
    }

    setTimeout(() => {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, 950);
  }

  // Scoped CSS Injection (Dark & Light Theme Compatible)
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .bl-studio {
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 20px 24px 40px;
        max-width: 1320px;
        margin: 0 auto;
        width: 100%;
        animation: blFadeSlideUp 0.28s ease-out;
      }

      @keyframes blFadeSlideUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Hero Summary Card */
      .bl-hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 24px;
        padding: 22px 26px;
        border-radius: var(--radius-lg, 20px);
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.5));
        position: relative;
        overflow: hidden;
      }

      .bl-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 12% 18%, rgba(0, 242, 254, 0.12), transparent 45%),
          radial-gradient(circle at 88% 82%, rgba(168, 85, 247, 0.12), transparent 45%);
        pointer-events: none;
      }

      .bl-hero-main {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 14px;
        min-width: 0;
      }

      .bl-hero-head {
        display: flex;
        align-items: flex-start;
        gap: 14px;
      }

      .bl-hero-icon {
        width: 52px;
        height: 52px;
        border-radius: 15px;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.22), rgba(168, 85, 247, 0.24));
        border: 1px solid rgba(0, 242, 254, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.65rem;
        flex-shrink: 0;
      }

      .bl-hero-titles h2 {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        margin: 0;
        line-height: 1.25;
      }

      .bl-hero-titles p {
        margin: 4px 0 0;
        font-size: 0.88rem;
        color: var(--text-secondary, #94a3b8);
      }

      .bl-hero-metrics {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .bl-metric-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 13px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        font-size: 0.82rem;
        color: var(--text-secondary, #94a3b8);
      }

      .bl-metric-pill strong {
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-heading, sans-serif);
        font-weight: 700;
        font-size: 0.92rem;
      }

      .bl-hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .bl-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(30, 41, 59, 0.65);
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, sans-serif);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .bl-btn:hover {
        border-color: rgba(0, 242, 254, 0.45);
        transform: translateY(-1px);
      }

      .bl-btn-primary {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.24));
        border-color: rgba(0, 242, 254, 0.45);
        color: #e0f2fe;
      }

      .bl-btn-primary:hover {
        box-shadow: 0 4px 16px rgba(0, 242, 254, 0.2);
      }

      /* Animated SVG Ring */
      .bl-ring-wrap {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      .bl-ring-box {
        position: relative;
        width: 128px;
        height: 128px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .bl-ring-svg {
        width: 128px;
        height: 128px;
        transform: rotate(-90deg);
        filter: drop-shadow(0 0 12px rgba(0, 242, 254, 0.22));
      }

      .bl-ring-track {
        fill: none;
        stroke: rgba(148, 163, 184, 0.18);
        stroke-width: 10;
      }

      .bl-ring-progress {
        fill: none;
        stroke-width: 10;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.75s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .bl-ring-center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        pointer-events: none;
      }

      .bl-ring-pct {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.55rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        line-height: 1.1;
      }

      .bl-ring-sub {
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--text-secondary, #94a3b8);
        margin-top: 2px;
      }

      .bl-ring-caption {
        font-size: 0.76rem;
        font-weight: 600;
        color: var(--accent-cyan, #00f2fe);
      }

      /* Add Custom Goal Card */
      .bl-add-card {
        padding: 16px 20px;
        border-radius: var(--radius-md, 14px);
        background: var(--bg-card, rgba(30, 41, 59, 0.7));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .bl-add-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .bl-add-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.96rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .bl-add-hint {
        font-size: 0.78rem;
        color: var(--text-muted, #64748b);
      }

      .bl-add-form {
        display: grid;
        grid-template-columns: minmax(220px, 2fr) minmax(170px, 1.1fr) minmax(150px, 0.9fr) auto;
        gap: 10px;
        align-items: center;
      }

      .bl-add-form.is-collapsed {
        display: none;
      }

      .bl-input,
      .bl-select {
        width: 100%;
        padding: 10px 13px;
        border-radius: 10px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, sans-serif);
        font-size: 0.85rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .bl-input:focus,
      .bl-select:focus {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .bl-input::placeholder {
        color: var(--text-muted, #64748b);
      }

      .bl-submit-btn {
        padding: 10px 18px;
        border-radius: 10px;
        border: 1px solid rgba(16, 185, 129, 0.5);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(0, 242, 254, 0.2));
        color: #ecfdf5;
        font-family: var(--font-heading, sans-serif);
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;
      }

      .bl-submit-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
      }

      /* Filter & Search Bar */
      .bl-controls {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px 20px;
        border-radius: var(--radius-md, 14px);
        background: var(--bg-card, rgba(30, 41, 59, 0.7));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }

      .bl-controls-top {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
        justify-content: space-between;
      }

      .bl-search-wrap {
        position: relative;
        flex: 1 1 260px;
        max-width: 440px;
      }

      .bl-search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.9rem;
        pointer-events: none;
        opacity: 0.75;
      }

      .bl-search-input {
        padding-left: 36px;
        padding-right: 34px;
      }

      .bl-search-clear {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: none;
        background: rgba(148, 163, 184, 0.2);
        color: var(--text-primary, #f8fafc);
        font-size: 0.75rem;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
      }

      .bl-search-clear.is-visible {
        display: inline-flex;
      }

      .bl-status-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .bl-filter-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 7px;
      }

      .bl-filter-label {
        font-size: 0.74rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted, #64748b);
        margin-right: 4px;
        min-width: 62px;
      }

      .bl-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 11px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(15, 23, 42, 0.5);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .bl-pill:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(0, 242, 254, 0.35);
      }

      .bl-pill.is-active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.24));
        border-color: rgba(0, 242, 254, 0.55);
        color: var(--text-primary, #f8fafc);
        box-shadow: 0 2px 10px rgba(0, 242, 254, 0.14);
      }

      .bl-pill-count {
        font-size: 0.7rem;
        padding: 1px 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: inherit;
      }

      /* Missions Grid */
      .bl-grid-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
        padding: 0 4px;
      }

      .bl-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
        gap: 14px;
      }

      .bl-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 18px;
        border-radius: var(--radius-md, 14px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        position: relative;
      }

      .bl-card:hover {
        transform: translateY(-2px);
        border-color: rgba(0, 242, 254, 0.32);
        box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.35);
      }

      .bl-card.is-completed {
        border-color: rgba(16, 185, 129, 0.38);
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.09), rgba(30, 41, 59, 0.72));
      }

      .bl-card-top {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .bl-check-btn {
        width: 26px;
        height: 26px;
        border-radius: 8px;
        border: 2px solid rgba(148, 163, 184, 0.45);
        background: rgba(15, 23, 42, 0.55);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        font-weight: 800;
        cursor: pointer;
        flex-shrink: 0;
        margin-top: 2px;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .bl-check-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        transform: scale(1.06);
      }

      .bl-card.is-completed .bl-check-btn {
        background: linear-gradient(135deg, #10b981, #059669);
        border-color: #10b981;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
      }

      .bl-card-body {
        flex: 1;
        min-width: 0;
      }

      .bl-card-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.98rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        line-height: 1.35;
        margin: 0;
        transition: color 0.2s ease;
      }

      .bl-card.is-completed .bl-card-title {
        text-decoration: line-through;
        text-decoration-color: rgba(16, 185, 129, 0.65);
        opacity: 0.85;
      }

      .bl-card-note {
        margin: 5px 0 0;
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.45;
      }

      .bl-delete-btn {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--text-muted, #64748b);
        font-size: 0.85rem;
        cursor: pointer;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.18s ease;
      }

      .bl-delete-btn:hover {
        background: rgba(244, 63, 94, 0.16);
        border-color: rgba(244, 63, 94, 0.35);
        color: #fb7185;
      }

      .bl-card-footer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
      }

      .bl-tags {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }

      .bl-cat-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 9px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-primary, #f8fafc);
      }

      .bl-region-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 9px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
        background: rgba(148, 163, 184, 0.12);
        color: var(--text-secondary, #94a3b8);
      }

      .bl-custom-badge {
        display: inline-flex;
        align-items: center;
        padding: 3px 8px;
        border-radius: 999px;
        font-size: 0.68rem;
        font-weight: 700;
        background: rgba(168, 85, 247, 0.18);
        border: 1px solid rgba(168, 85, 247, 0.35);
        color: #d8b4fe;
      }

      .bl-city-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid rgba(0, 242, 254, 0.32);
        background: rgba(0, 242, 254, 0.1);
        color: var(--accent-cyan, #00f2fe);
        font-size: 0.74rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .bl-city-pill:hover {
        background: rgba(0, 242, 254, 0.22);
        transform: translateX(1px);
      }

      .bl-empty {
        grid-column: 1 / -1;
        padding: 40px 20px;
        text-align: center;
        border-radius: var(--radius-md, 14px);
        background: var(--bg-card, rgba(30, 41, 59, 0.55));
        border: 1px dashed var(--border-glass, rgba(255, 255, 255, 0.15));
        color: var(--text-secondary, #94a3b8);
      }

      .bl-empty-icon {
        font-size: 2.2rem;
        margin-bottom: 8px;
      }

      /* Confetti Layer */
      .bl-confetti-layer {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      }

      .bl-confetti-piece {
        position: fixed;
        border-radius: 2px;
        animation: blConfettiFly 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes blConfettiFly {
        0% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1) rotate(0deg);
        }
        75% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy) + 32px)) scale(0.75) rotate(var(--rot));
        }
      }

      /* Fallback Toast */
      .bl-fallback-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 10px 16px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.94);
        color: #f8fafc;
        border: 1px solid rgba(0, 242, 254, 0.35);
        font-size: 0.84rem;
        font-weight: 600;
        z-index: 10000;
        opacity: 0;
        transform: translateY(8px);
        transition: all 0.22s ease;
      }

      .bl-fallback-toast.is-visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* Light Theme Overrides */
      body.light-theme .bl-hero {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.92) 100%);
        border-color: rgba(15, 23, 42, 0.12);
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
      }

      body.light-theme .bl-hero-titles h2,
      body.light-theme .bl-ring-pct,
      body.light-theme .bl-metric-pill strong,
      body.light-theme .bl-add-title,
      body.light-theme .bl-card-title {
        color: #0f172a;
      }

      body.light-theme .bl-metric-pill,
      body.light-theme .bl-pill,
      body.light-theme .bl-cat-badge {
        background: rgba(241, 245, 249, 0.9);
        border-color: rgba(15, 23, 42, 0.12);
        color: #334155;
      }

      body.light-theme .bl-pill.is-active {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.16), rgba(37, 99, 235, 0.16));
        border-color: rgba(2, 132, 199, 0.5);
        color: #0f172a;
      }

      body.light-theme .bl-pill-count {
        background: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .bl-btn {
        background: rgba(241, 245, 249, 0.95);
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      body.light-theme .bl-btn-primary {
        background: linear-gradient(135deg, #0284c7, #2563eb);
        border-color: #0284c7;
        color: #ffffff;
      }

      body.light-theme .bl-submit-btn {
        background: linear-gradient(135deg, #059669, #0284c7);
        border-color: #059669;
        color: #ffffff;
      }

      body.light-theme .bl-add-card,
      body.light-theme .bl-controls,
      body.light-theme .bl-card,
      body.light-theme .bl-empty {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
      }

      body.light-theme .bl-card.is-completed {
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.1), rgba(255, 255, 255, 0.95));
        border-color: rgba(5, 150, 105, 0.4);
      }

      body.light-theme .bl-card-footer {
        border-top-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .bl-input,
      body.light-theme .bl-select {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.15);
        color: #0f172a;
      }

      body.light-theme .bl-check-btn {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.3);
      }

      body.light-theme .bl-city-pill {
        background: rgba(2, 132, 199, 0.1);
        border-color: rgba(2, 132, 199, 0.3);
        color: #0284c7;
      }

      body.light-theme .bl-custom-badge {
        background: rgba(124, 58, 237, 0.12);
        border-color: rgba(124, 58, 237, 0.3);
        color: #6d28d9;
      }

      body.light-theme .bl-ring-caption {
        color: #0284c7;
      }

      /* Responsive */
      @media (max-width: 900px) {
        .bl-hero {
          grid-template-columns: 1fr;
          justify-items: start;
        }
        .bl-ring-wrap {
          flex-direction: row;
          gap: 16px;
        }
        .bl-add-form {
          grid-template-columns: 1fr 1fr;
        }
        .bl-add-form [name="title"] {
          grid-column: 1 / -1;
        }
        .bl-submit-btn {
          grid-column: 1 / -1;
        }
      }

      @media (max-width: 600px) {
        .bl-studio {
          padding: 14px 14px 32px;
        }
        .bl-add-form {
          grid-template-columns: 1fr;
        }
        .bl-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const escapeHtml = (ctx && typeof ctx.escapeHtml === 'function') ? ctx.escapeHtml : defaultEscapeHtml;
    const normalizeTurkish = (ctx && typeof ctx.normalizeTurkish === 'function') ? ctx.normalizeTurkish : defaultNormalizeTurkish;
    const showToast = (ctx && typeof ctx.showToast === 'function') ? ctx.showToast : localToast;
    const provincesMap = getProvincesMap(ctx);
    const sortedProvinces = buildSortedProvinces(provincesMap);

    const store = loadStore(provincesMap);

    const uiState = {
      regionFilter: 'all',
      categoryFilter: 'all',
      statusFilter: 'all', // 'all' | 'pending' | 'completed'
      searchQuery: '',
      formCollapsed: false
    };

    function getAllMissions() {
      const curated = CURATED_MISSIONS.map((m) => {
        const prov = provincesMap[m.cityKey];
        return {
          ...m,
          cityName: (prov && prov.name) || m.cityName,
          regionCode: (prov && prov.region_code) || m.regionCode,
          provinceVisited: Boolean(prov && prov.visited),
          completed: Boolean(store.completed[m.id]),
          isCustom: false
        };
      });
      const custom = store.customItems.map((item) => {
        const prov = provincesMap[item.cityKey];
        return {
          ...item,
          cityName: (prov && prov.name) || item.cityName,
          regionCode: (prov && prov.region_code) || item.regionCode,
          provinceVisited: Boolean(prov && prov.visited),
          isCustom: true
        };
      });
      return [...custom, ...curated];
    }

    function getStats(missions) {
      const total = missions.length;
      const completedCount = missions.filter((m) => m.completed).length;
      const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
      const customCount = missions.filter((m) => m.isCustom).length;
      const activeRegions = new Set(missions.filter((m) => m.completed).map((m) => m.regionCode)).size;
      return { total, completedCount, pct, remaining: total - completedCount, customCount, activeRegions };
    }

    function getFilteredMissions(missions) {
      const q = normalizeTurkish(uiState.searchQuery);
      return missions.filter((m) => {
        if (uiState.regionFilter !== 'all' && m.regionCode !== uiState.regionFilter) return false;
        if (uiState.categoryFilter !== 'all' && m.category !== uiState.categoryFilter) return false;
        if (uiState.statusFilter === 'completed' && !m.completed) return false;
        if (uiState.statusFilter === 'pending' && m.completed) return false;
        if (q) {
          const catMeta = getCategoryMeta(m.category);
          const regMeta = getRegionMeta(m.regionCode);
          const haystack = normalizeTurkish(`${m.title} ${m.note || ''} ${m.cityName} ${regMeta.fullName} ${catMeta.shortLabel}`);
          if (!haystack.includes(q)) return false;
        }
        return true;
      });
    }

    const RING_R = 50;
    const RING_C = 2 * Math.PI * RING_R;

    // Build initial studio shell once
    const provinceOptionsHtml = sortedProvinces
      .map((p) => {
        const plateStr = String(p.plate).padStart(2, '0');
        const reg = getRegionMeta(p.regionCode);
        return `<option value="${escapeHtml(p.key)}">${escapeHtml(plateStr)} · ${escapeHtml(p.name)} (${escapeHtml(reg.name)})</option>`;
      })
      .join('');

    const categoryOptionsHtml = CATEGORIES
      .map((c) => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.label)}</option>`)
      .join('');

    container.innerHTML = `
      <div class="bl-studio" data-module="bucket-list">
        <section class="bl-hero">
          <div class="bl-hero-main">
            <div class="bl-hero-head">
              <div class="bl-hero-icon" aria-hidden="true">🎯</div>
              <div class="bl-hero-titles">
                <h2>Anadolu Bucket List &amp; Sefer Hedefleri</h2>
                <p>7 bölgeden 24 ikonik Anadolu menzili ve kendi özel sefer hedefleriniz. İl rozetine tıklayarak şehir dosyasına geçebilirsiniz.</p>
              </div>
            </div>
            <div class="bl-hero-metrics" data-role="hero-metrics"></div>
            <div class="bl-hero-actions">
              <button type="button" class="bl-btn bl-btn-primary" data-action="toggle-form">➕ Yeni Sefer Hedefi Ekle</button>
              <button type="button" class="bl-btn" data-action="sync-visited" title="Ziyaret edilen illerdeki küratörlü hedefleri otomatik tamamla">🔄 Ziyaretlerle Eşitle</button>
            </div>
          </div>

          <div class="bl-ring-wrap">
            <div class="bl-ring-box">
              <svg class="bl-ring-svg" viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <linearGradient id="blRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#00f2fe" />
                    <stop offset="55%" stop-color="#4facfe" />
                    <stop offset="100%" stop-color="#10b981" />
                  </linearGradient>
                </defs>
                <circle class="bl-ring-track" cx="60" cy="60" r="${RING_R}"></circle>
                <circle
                  class="bl-ring-progress"
                  data-role="ring-progress"
                  cx="60"
                  cy="60"
                  r="${RING_R}"
                  stroke="url(#blRingGrad)"
                  stroke-dasharray="${RING_C.toFixed(2)}"
                  stroke-dashoffset="${RING_C.toFixed(2)}"
                ></circle>
              </svg>
              <div class="bl-ring-center">
                <span class="bl-ring-pct" data-role="ring-pct">%0</span>
                <span class="bl-ring-sub" data-role="ring-sub">0 / 24</span>
              </div>
            </div>
            <span class="bl-ring-caption" data-role="ring-caption">Sefer İlerlemesi</span>
          </div>
        </section>

        <section class="bl-add-card">
          <div class="bl-add-header">
            <div class="bl-add-title">+ Yeni Sefer Hedefi Ekle</div>
            <span class="bl-add-hint">81 ilden birini seçip kendi Anadolu hayalinizi kaydedin</span>
          </div>
          <form class="bl-add-form" data-role="add-goal-form">
            <input
              type="text"
              name="title"
              class="bl-input"
              maxlength="140"
              placeholder="Örn: Nemrut Dağı'nda gün doğumunu izlemek..."
              required
            />
            <select name="cityKey" class="bl-select" aria-label="İl Seçin">
              ${provinceOptionsHtml}
            </select>
            <select name="category" class="bl-select" aria-label="Kategori Seçin">
              ${categoryOptionsHtml}
            </select>
            <button type="submit" class="bl-submit-btn">✨ Hedef Ekle</button>
          </form>
        </section>

        <section class="bl-controls">
          <div class="bl-controls-top">
            <div class="bl-search-wrap">
              <span class="bl-search-icon" aria-hidden="true">🔍</span>
              <input
                type="text"
                class="bl-input bl-search-input"
                data-role="search-input"
                placeholder="Hedef, şehir, bölge veya kategori ara..."
                aria-label="Bucket list hedeflerinde ara"
              />
              <button type="button" class="bl-search-clear" data-action="clear-search" title="Aramayı temizle" aria-label="Aramayı temizle">✕</button>
            </div>
            <div class="bl-status-pills" data-role="status-pills"></div>
          </div>
          <div class="bl-filter-row" data-role="region-pills"></div>
          <div class="bl-filter-row" data-role="category-pills"></div>
        </section>

        <div class="bl-grid-meta" data-role="grid-meta"></div>
        <div class="bl-grid" data-role="missions-grid"></div>
      </div>
    `;

    const root = container.querySelector('.bl-studio');
    const heroMetricsEl = root.querySelector('[data-role="hero-metrics"]');
    const ringProgressEl = root.querySelector('[data-role="ring-progress"]');
    const ringPctEl = root.querySelector('[data-role="ring-pct"]');
    const ringSubEl = root.querySelector('[data-role="ring-sub"]');
    const ringCaptionEl = root.querySelector('[data-role="ring-caption"]');
    const addFormEl = root.querySelector('[data-role="add-goal-form"]');
    const searchInputEl = root.querySelector('[data-role="search-input"]');
    const clearSearchBtn = root.querySelector('[data-action="clear-search"]');
    const statusPillsEl = root.querySelector('[data-role="status-pills"]');
    const regionPillsEl = root.querySelector('[data-role="region-pills"]');
    const categoryPillsEl = root.querySelector('[data-role="category-pills"]');
    const gridMetaEl = root.querySelector('[data-role="grid-meta"]');
    const gridEl = root.querySelector('[data-role="missions-grid"]');

    function updateHeroAndRing(missions) {
      const stats = getStats(missions);
      const offset = RING_C * (1 - stats.pct / 100);
      ringProgressEl.style.strokeDashoffset = offset.toFixed(2);
      ringPctEl.textContent = `%${stats.pct}`;
      ringSubEl.textContent = `${stats.completedCount} / ${stats.total}`;

      if (stats.pct === 100 && stats.total > 0) {
        ringCaptionEl.textContent = '🏆 Tüm Hedefler Tamam!';
      } else if (stats.pct >= 65) {
        ringCaptionEl.textContent = '🔥 Büyük Menzil Yakın';
      } else {
        ringCaptionEl.textContent = `${stats.remaining} Hedef Kaldı`;
      }

      heroMetricsEl.innerHTML = `
        <span class="bl-metric-pill">✅ <strong>${stats.completedCount} / ${stats.total}</strong> Tamamlanan Hedef</span>
        <span class="bl-metric-pill">🗺️ <strong>${stats.activeRegions} / 7</strong> Bölgeden İz</span>
        <span class="bl-metric-pill">✨ <strong>${stats.customCount}</strong> Özel Hedef</span>
      `;
    }

    function renderFilterPills(missions) {
      const stats = getStats(missions);
      const statusDefs = [
        { id: 'all', label: 'Tümü', count: stats.total },
        { id: 'pending', label: 'Bekleyen', count: stats.remaining },
        { id: 'completed', label: 'Tamamlanan', count: stats.completedCount }
      ];

      statusPillsEl.innerHTML = statusDefs
        .map(
          (s) => `
          <button
            type="button"
            class="bl-pill ${uiState.statusFilter === s.id ? 'is-active' : ''}"
            data-action="filter-status"
            data-value="${s.id}"
          >${escapeHtml(s.label)} <span class="bl-pill-count">${s.count}</span></button>`
        )
        .join('');

      const regionCounts = {};
      REGIONS.forEach((r) => { regionCounts[r.code] = 0; });
      missions.forEach((m) => {
        if (Object.prototype.hasOwnProperty.call(regionCounts, m.regionCode)) {
          regionCounts[m.regionCode] += 1;
        }
      });

      regionPillsEl.innerHTML =
        `<span class="bl-filter-label">Bölge</span>` +
        `<button type="button" class="bl-pill ${uiState.regionFilter === 'all' ? 'is-active' : ''}" data-action="filter-region" data-value="all">🌍 Tümü <span class="bl-pill-count">${missions.length}</span></button>` +
        REGIONS.map(
          (r) => `
          <button
            type="button"
            class="bl-pill ${uiState.regionFilter === r.code ? 'is-active' : ''}"
            data-action="filter-region"
            data-value="${escapeHtml(r.code)}"
          >${r.icon} ${escapeHtml(r.name)} <span class="bl-pill-count">${regionCounts[r.code] || 0}</span></button>`
        ).join('');

      const catCounts = {};
      CATEGORIES.forEach((c) => { catCounts[c.id] = 0; });
      missions.forEach((m) => {
        if (Object.prototype.hasOwnProperty.call(catCounts, m.category)) {
          catCounts[m.category] += 1;
        }
      });

      categoryPillsEl.innerHTML =
        `<span class="bl-filter-label">Kategori</span>` +
        `<button type="button" class="bl-pill ${uiState.categoryFilter === 'all' ? 'is-active' : ''}" data-action="filter-category" data-value="all">✨ Tümü <span class="bl-pill-count">${missions.length}</span></button>` +
        CATEGORIES.map(
          (c) => `
          <button
            type="button"
            class="bl-pill ${uiState.categoryFilter === c.id ? 'is-active' : ''}"
            data-action="filter-category"
            data-value="${escapeHtml(c.id)}"
          >${escapeHtml(c.label)} <span class="bl-pill-count">${catCounts[c.id] || 0}</span></button>`
        ).join('');
    }

    function renderGrid(missions) {
      const filtered = getFilteredMissions(missions);
      const completedInView = filtered.filter((m) => m.completed).length;

      gridMetaEl.innerHTML = `
        <span>Gösterilen: <strong>${filtered.length}</strong> / ${missions.length} hedef</span>
        <span>Bu listede <strong>${completedInView}</strong> tamamlandı</span>
      `;

      if (!filtered.length) {
        gridEl.innerHTML = `
          <div class="bl-empty">
            <div class="bl-empty-icon">🧭</div>
            <p>Seçilen filtrelere veya arama sorgusuna uygun sefer hedefi bulunamadı.</p>
          </div>
        `;
        return;
      }

      gridEl.innerHTML = filtered
        .map((m) => {
          const cat = getCategoryMeta(m.category);
          const reg = getRegionMeta(m.regionCode);
          const plate = provincesMap[m.cityKey] && provincesMap[m.cityKey].plate
            ? String(provincesMap[m.cityKey].plate).padStart(2, '0')
            : '';

          return `
            <article class="bl-card ${m.completed ? 'is-completed' : ''}" data-mission-id="${escapeHtml(m.id)}">
              <div class="bl-card-top">
                <button
                  type="button"
                  class="bl-check-btn"
                  data-action="toggle-mission"
                  data-mission-id="${escapeHtml(m.id)}"
                  aria-label="${escapeHtml(m.title)} hedefini ${m.completed ? 'tamamlanmadı olarak işaretle' : 'tamamlandı olarak işaretle'}"
                  aria-pressed="${m.completed ? 'true' : 'false'}"
                >${m.completed ? '✓' : ''}</button>
                <div class="bl-card-body">
                  <h3 class="bl-card-title">${escapeHtml(m.title)}</h3>
                  ${m.note ? `<p class="bl-card-note">${escapeHtml(m.note)}</p>` : ''}
                </div>
                ${
                  m.isCustom
                    ? `<button type="button" class="bl-delete-btn" data-action="delete-mission" data-mission-id="${escapeHtml(m.id)}" title="Özel hedefi sil" aria-label="Özel hedefi sil">🗑️</button>`
                    : ''
                }
              </div>

              <div class="bl-card-footer">
                <div class="bl-tags">
                  <span class="bl-cat-badge">${escapeHtml(cat.label)}</span>
                  <span class="bl-region-badge">${reg.icon} ${escapeHtml(reg.name)}</span>
                  ${m.isCustom ? '<span class="bl-custom-badge">Özel</span>' : ''}
                </div>
                <button
                  type="button"
                  class="bl-city-pill"
                  data-action="select-city"
                  data-city-key="${escapeHtml(m.cityKey)}"
                  title="${escapeHtml(m.cityName)} şehir detayına git"
                >📍 ${escapeHtml(m.cityName)}${plate ? ` · ${escapeHtml(plate)}` : ''} →</button>
              </div>
            </article>
          `;
        })
        .join('');
    }

    function refreshAll() {
      const missions = getAllMissions();
      updateHeroAndRing(missions);
      renderFilterPills(missions);
      renderGrid(missions);
    }

    // Event Delegation on Root
    root.addEventListener('click', (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;

      const toggleFormBtn = target.closest('[data-action="toggle-form"]');
      if (toggleFormBtn) {
        uiState.formCollapsed = !uiState.formCollapsed;
        addFormEl.classList.toggle('is-collapsed', uiState.formCollapsed);
        if (!uiState.formCollapsed) {
          const titleInput = addFormEl.querySelector('[name="title"]');
          if (titleInput) titleInput.focus();
        }
        return;
      }

      const syncBtn = target.closest('[data-action="sync-visited"]');
      if (syncBtn) {
        let syncedCount = 0;
        CURATED_MISSIONS.forEach((m) => {
          const isVisited = Boolean(provincesMap[m.cityKey] && provincesMap[m.cityKey].visited);
          if (isVisited && !store.completed[m.id]) {
            store.completed[m.id] = true;
            syncedCount += 1;
          }
        });
        saveStore(store);
        refreshAll();
        showToast(syncedCount > 0
          ? `🔄 Ziyaret edilen illerden ${syncedCount} hedef tamamlandı olarak eşitlendi`
          : '✅ Tüm ziyaret edilen il hedefleri zaten güncel');
        return;
      }

      const clearBtn = target.closest('[data-action="clear-search"]');
      if (clearBtn) {
        uiState.searchQuery = '';
        searchInputEl.value = '';
        clearSearchBtn.classList.remove('is-visible');
        renderGrid(getAllMissions());
        searchInputEl.focus();
        return;
      }

      const statusBtn = target.closest('[data-action="filter-status"]');
      if (statusBtn) {
        uiState.statusFilter = statusBtn.getAttribute('data-value') || 'all';
        const missions = getAllMissions();
        renderFilterPills(missions);
        renderGrid(missions);
        return;
      }

      const regionBtn = target.closest('[data-action="filter-region"]');
      if (regionBtn) {
        uiState.regionFilter = regionBtn.getAttribute('data-value') || 'all';
        const missions = getAllMissions();
        renderFilterPills(missions);
        renderGrid(missions);
        return;
      }

      const catBtn = target.closest('[data-action="filter-category"]');
      if (catBtn) {
        uiState.categoryFilter = catBtn.getAttribute('data-value') || 'all';
        const missions = getAllMissions();
        renderFilterPills(missions);
        renderGrid(missions);
        return;
      }

      const cityBtn = target.closest('[data-action="select-city"]');
      if (cityBtn) {
        const cityKey = cityBtn.getAttribute('data-city-key');
        if (cityKey && ctx && typeof ctx.selectCity === 'function') {
          ctx.selectCity(cityKey);
        }
        return;
      }

      const deleteBtn = target.closest('[data-action="delete-mission"]');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-mission-id');
        const idx = store.customItems.findIndex((item) => item.id === id);
        if (idx !== -1) {
          const [removed] = store.customItems.splice(idx, 1);
          saveStore(store);
          refreshAll();
          showToast(`🗑️ "${removed.title}" listeden silindi`);
        }
        return;
      }

      const toggleBtn = target.closest('[data-action="toggle-mission"]');
      if (toggleBtn) {
        const id = toggleBtn.getAttribute('data-mission-id');
        if (!id) return;

        let newState = false;
        let missionTitle = '';

        const customItem = store.customItems.find((item) => item.id === id);
        if (customItem) {
          customItem.completed = !customItem.completed;
          newState = customItem.completed;
          missionTitle = customItem.title;
        } else {
          const curated = CURATED_MISSIONS.find((m) => m.id === id);
          if (!curated) return;
          store.completed[id] = !store.completed[id];
          newState = store.completed[id];
          missionTitle = curated.title;
        }

        saveStore(store);
        if (newState) {
          triggerConfettiBurst(toggleBtn);
        }
        refreshAll();

        const stats = getStats(getAllMissions());
        if (newState && stats.pct === 100) {
          showToast(`🏆 Tebrikler! Tüm Anadolu hedefleri (%100) tamamlandı!`);
        } else if (newState) {
          showToast(`🎯 Tamamlandı: ${missionTitle}`);
        } else {
          showToast(`↩️ Beklemeye alındı: ${missionTitle}`);
        }
      }
    });

    searchInputEl.addEventListener('input', () => {
      uiState.searchQuery = searchInputEl.value;
      clearSearchBtn.classList.toggle('is-visible', Boolean(uiState.searchQuery.trim()));
      renderGrid(getAllMissions());
    });

    addFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleInput = addFormEl.querySelector('[name="title"]');
      const citySelect = addFormEl.querySelector('[name="cityKey"]');
      const catSelect = addFormEl.querySelector('[name="category"]');

      const title = titleInput ? titleInput.value.trim() : '';
      const cityKey = citySelect ? citySelect.value : '';
      const category = catSelect ? catSelect.value : 'tarih';

      if (!title) {
        showToast('⚠️ Lütfen bir hedef başlığı yazın');
        return;
      }
      if (!cityKey || !provincesMap[cityKey]) {
        showToast('⚠️ Lütfen geçerli bir il seçin');
        return;
      }

      const prov = provincesMap[cityKey];
      const newItem = {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: title.slice(0, 140),
        note: '',
        cityKey,
        cityName: prov.name,
        regionCode: prov.region_code || cityKey.split('/')[0],
        category,
        completed: false,
        createdAt: Date.now(),
        isCustom: true
      };

      store.customItems.unshift(newItem);
      saveStore(store);

      if (titleInput) titleInput.value = '';
      // Reset filters if active filters would hide the newly added item
      if (uiState.statusFilter === 'completed') uiState.statusFilter = 'all';
      if (uiState.regionFilter !== 'all' && uiState.regionFilter !== newItem.regionCode) uiState.regionFilter = 'all';
      if (uiState.categoryFilter !== 'all' && uiState.categoryFilter !== newItem.category) uiState.categoryFilter = 'all';

      refreshAll();
      showToast(`✨ "${newItem.title}" (${prov.name}) hedeflere eklendi`);
    });

    // Initial render: draw filters & grid immediately, animate SVG ring from 0 -> target on next frame
    const initialMissions = getAllMissions();
    renderFilterPills(initialMissions);
    renderGrid(initialMissions);

    const initialStats = getStats(initialMissions);
    heroMetricsEl.innerHTML = `
      <span class="bl-metric-pill">✅ <strong>${initialStats.completedCount} / ${initialStats.total}</strong> Tamamlanan Hedef</span>
      <span class="bl-metric-pill">🗺️ <strong>${initialStats.activeRegions} / 7</strong> Bölgeden İz</span>
      <span class="bl-metric-pill">✨ <strong>${initialStats.customCount}</strong> Özel Hedef</span>
    `;
    ringPctEl.textContent = `%${initialStats.pct}`;
    ringSubEl.textContent = `${initialStats.completedCount} / ${initialStats.total}`;
    ringCaptionEl.textContent = initialStats.pct === 100 && initialStats.total > 0
      ? '🏆 Tüm Hedefler Tamam!'
      : `${initialStats.remaining} Hedef Kaldı`;

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          updateHeroAndRing(getAllMissions());
        });
      });
    } else {
      updateHeroAndRing(initialMissions);
    }
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.bucketList = {
    render,
    STORAGE_KEY,
    CURATED_MISSIONS
  };
})();
