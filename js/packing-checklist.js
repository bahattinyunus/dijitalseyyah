/**
 * Anadolu Seyahatnamesi — Sırt Çantası & Sefer Hazırlık Listesi Modülü
 * Dijital Seyyah için etkileşimli ekipman kontrol listesi, canlı ağırlık telemetrisi,
 * mevsime duyarlı giyim önerileri, özel eşya ekleme ve Markdown dışa aktarma.
 * Registers on window.SEYYAH_MODULES.packing = { render(container, ctx) }
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'dijital_seyyah_packing_v1';
  const STYLE_ID = 'seyyah-packing-styles';

  const SEASONS = [
    { id: 'yaz', icon: '☀️', label: 'Yaz', desc: 'Sıcak & hafif sefer' },
    { id: 'bahar', icon: '🍂', label: 'Sonbahar/İlkbahar', desc: 'Katmanlı geçiş havası' },
    { id: 'kis', icon: '❄️', label: 'Kış', desc: 'Soğuk & karlı Anadolu' }
  ];

  const REGION_PROFILES = [
    {
      id: 'karadeniz',
      icon: '🌲',
      label: 'Karadeniz',
      tip: 'Ani sağanak ve yayla sisi için su geçirmez yağmurluk, yedek çorap ve hızlı kuruyan mikrofiber havlu hayati önem taşır.',
      essentialIds: ['health-raincoat', 'gsb-towel', 'gsb-thermos', 'cloth-bahar-4', 'cloth-bahar-3', 'cloth-kis-4', 'cloth-yaz-5']
    },
    {
      id: 'dogu',
      icon: '🏔️',
      label: 'Doğu Anadolu',
      tip: 'Yüksek rakım ve gece ayazı nedeniyle termal içlik, katmanlı polar, bere-eldiven ve sıcak içecek termosu olmazsa olmazdır.',
      essentialIds: ['cloth-kis-1', 'cloth-kis-2', 'cloth-kis-4', 'cloth-kis-5', 'cloth-bahar-3', 'cloth-bahar-6', 'gsb-thermos', 'health-firstaid']
    },
    {
      id: 'guneydogu',
      icon: '🏜️',
      label: 'Güneydoğu Anadolu',
      tip: 'Mezopotamya güneşi ve taş sokak yürüyüşleri için yüksek koruyuculu güneş kremi, şapka, katlanabilir su matarası ve hafif katmanlar önceliklidir.',
      essentialIds: ['health-sunscreen', 'gsb-bottle', 'cloth-yaz-4', 'cloth-yaz-1', 'cloth-yaz-6', 'cloth-bahar-1', 'health-id']
    },
    {
      id: 'icanadolu',
      icon: '🌾',
      label: 'İç Anadolu',
      tip: 'Bozkırın gündüz-gece sıcaklık farkına karşı katmanlı giyim, rüzgarlık ve uzun otobüs/YHT geçişleri için powerbank kritik önemdedir.',
      essentialIds: ['cloth-bahar-4', 'cloth-bahar-3', 'cloth-kis-1', 'cloth-yaz-5', 'gsb-thermos', 'tech-powerbank']
    },
    {
      id: 'akdeniz',
      icon: '☀️',
      label: 'Akdeniz',
      tip: 'Nemli sahil sıcağı ve antik kent yürüyüşleri için nefes alan tişört, güneş kremi, matara ve hafif yürüyüş ayakkabısı şarttır.',
      essentialIds: ['health-sunscreen', 'gsb-bottle', 'cloth-yaz-1', 'cloth-yaz-4', 'cloth-yaz-6', 'cloth-bahar-1']
    },
    {
      id: 'ege',
      icon: '🌊',
      label: 'Ege',
      tip: 'Antik ören yerleri ve kıyı rüzgarı için güneş koruması, MüzeKart, hafif yürüyüş ayakkabısı ve akşam esintisine ince gömlek önerilir.',
      essentialIds: ['health-id', 'health-sunscreen', 'cloth-yaz-4', 'cloth-yaz-5', 'cloth-yaz-6', 'gsb-bottle']
    },
    {
      id: 'marmara',
      icon: '🏰',
      label: 'Marmara',
      tip: 'Yoğun toplu taşıma, vapur ve şehir içi yürüyüş temposu için hafif çanta, kulaklık, yağmurluk ve kimlik/MüzeKart her an el altında olmalıdır.',
      essentialIds: ['health-raincoat', 'health-id', 'tech-headphones', 'tech-powerbank', 'cloth-bahar-4', 'cloth-yaz-6']
    }
  ];

  const LIBRARY_CODING_IDS = ['tech-laptop', 'tech-gan', 'tech-powerbank', 'tech-headphones', 'tech-powerstrip'];

  const SEASONAL_CLOTHING = {
    yaz: [
      { id: 'cloth-yaz-1', name: 'Nefes Alan Tişört (4 Adet)', weightG: 560, note: 'Pamuk / hızlı kuruyan' },
      { id: 'cloth-yaz-2', name: 'Hafif Şort / Keten Pantolon (2 Adet)', weightG: 520, note: 'Sıcak günler için' },
      { id: 'cloth-yaz-3', name: 'İç Çamaşırı & İnce Çorap (5\'li Set)', weightG: 350, note: 'Günlük rotasyon' },
      { id: 'cloth-yaz-4', name: 'Şapka & Güneş Gözlüğü', weightG: 120, note: 'UV koruması' },
      { id: 'cloth-yaz-5', name: 'İnce Uzun Kollu Gömlek', weightG: 240, note: 'Serin akşam & cami ziyareti' },
      { id: 'cloth-yaz-6', name: 'Hafif Yürüyüş Ayakkabısı / Sandalet', weightG: 580, note: 'Şehir içi yürüyüş' }
    ],
    bahar: [
      { id: 'cloth-bahar-1', name: 'Katmanlı Tişört & Uzun Kollu (4 Adet)', weightG: 720, note: 'Değişken hava için' },
      { id: 'cloth-bahar-2', name: 'Outdoor / Kot Pantolon (2 Adet)', weightG: 920, note: 'Dayanıklı yolculuk' },
      { id: 'cloth-bahar-3', name: 'İnce Polar / Hırka', weightG: 410, note: 'Sabah & akşam serinliği' },
      { id: 'cloth-bahar-4', name: 'Rüzgarlık / Softshell Ceket', weightG: 480, note: 'Yağmur & rüzgar koruması' },
      { id: 'cloth-bahar-5', name: 'İç Çamaşırı & Pamuklu Çorap (5\'li Set)', weightG: 420, note: 'Günlük rotasyon' },
      { id: 'cloth-bahar-6', name: 'Boyunluk / İnce Bere', weightG: 80, note: 'Yayla & gece yolculuğu' }
    ],
    kis: [
      { id: 'cloth-kis-1', name: 'Termal İçlik Takımı (Üst & Alt)', weightG: 440, note: 'Doğu & İç Anadolu soğuğu' },
      { id: 'cloth-kis-2', name: 'Kalın Kazak / Polar (2 Adet)', weightG: 860, note: 'Yüksek ısı yalıtımı' },
      { id: 'cloth-kis-3', name: 'Kışlık Pantolon (2 Adet)', weightG: 1080, note: 'Kalın dokulu' },
      { id: 'cloth-kis-4', name: 'Katlanabilir Şişme Mont', weightG: 750, note: 'Hafif & sıcak tutan' },
      { id: 'cloth-kis-5', name: 'Bere, Eldiven & Atkı Seti', weightG: 290, note: 'Rüzgarlı yürüyüşler' },
      { id: 'cloth-kis-6', name: 'Yün Çorap & İç Çamaşırı (5\'li Set)', weightG: 540, note: 'Kışlık konfor' }
    ]
  };

  const CATEGORIES = [
    {
      id: 'tech',
      icon: '💻',
      title: 'Teknoloji & Kütüphane Ofisi',
      accent: 'cyan',
      items: [
        { id: 'tech-laptop', name: 'Laptop (14" Ultrabook)', weightG: 1350, note: 'Mobil çalışma istasyonu' },
        { id: 'tech-gan', name: 'GaN 65W Şarj Aleti & Kablo', weightG: 180, note: 'Tek adaptörle tüm cihazlar' },
        { id: 'tech-powerbank', name: 'Powerbank 20.000mAh', weightG: 420, note: 'Uzun otobüs & tren seferi' },
        { id: 'tech-headphones', name: 'Kulaklık (ANC / Kablosuz)', weightG: 240, note: 'Kütüphane odaklanması' },
        { id: 'tech-powerstrip', name: 'Çoklu Priz / Uzatma (Kompakt)', weightG: 260, note: 'Kütüphane & KYK kurtarıcısı' },
        { id: 'tech-hub', name: 'USB-C Hub & Adaptör', weightG: 75, note: 'HDMI, SD & USB bağlantısı' },
        { id: 'tech-notebook', name: 'Not Defteri & Kalem', weightG: 210, note: 'Hızlı eskiz & fikir notları' }
      ]
    },
    {
      id: 'gsb',
      icon: '⛺',
      title: 'GSB Seyahatsever (KYK Kervansaray)',
      accent: 'emerald',
      items: [
        { id: 'gsb-slippers', name: 'Terlik (Hafif EVA)', weightG: 190, note: 'Yurt odası & duş için' },
        { id: 'gsb-towel', name: 'Mikrofiber Havlu', weightG: 220, note: 'Hızlı kuruyan & az yer kaplayan' },
        { id: 'gsb-padlock', name: 'Asma Kilit', weightG: 130, note: 'KYK dolap güvenliği' },
        { id: 'gsb-sleep', name: 'Göz Bandı & Kulak Tıkacı', weightG: 35, note: 'Ortak odada kaliteli uyku' },
        { id: 'gsb-bottle', name: 'Katlanabilir Su Matarası', weightG: 110, note: 'Boşken sıfır hacim' },
        { id: 'gsb-thermos', name: 'Termos (500 ml)', weightG: 320, note: 'Kütüphane çayı & kahvesi' }
      ]
    },
    {
      id: 'clothing',
      icon: '🧥',
      title: 'Giyim & Yolculuk',
      accent: 'gold',
      dynamicSeason: true,
      items: []
    },
    {
      id: 'reflection',
      icon: '🕌',
      title: 'Tefekkür & Okuma',
      accent: 'purple',
      items: [
        { id: 'ref-prayer-mat', name: 'Seyahat Seccadesi', weightG: 120, note: 'Cep tipi su geçirmez' },
        { id: 'ref-quran-book', name: 'Cep Kur\'an / Yol Kitabı', weightG: 280, note: 'Vakit & yolculuk okumaları' },
        { id: 'ref-tesbih', name: 'Tesbih', weightG: 45, note: 'Yol zikri & tefekkür' },
        { id: 'ref-journal', name: 'Seyir Defteri', weightG: 230, note: 'Anadolu hatıratı & günlük' }
      ]
    },
    {
      id: 'health',
      icon: '🚑',
      title: 'Sağlık & Güvenlik',
      accent: 'rose',
      items: [
        { id: 'health-firstaid', name: 'İlk Yardım Kiti', weightG: 180, note: 'Yara bandı, ağrı kesici, antiseptik' },
        { id: 'health-sunscreen', name: 'Güneş Kremi (SPF 50+)', weightG: 85, note: 'Açık hava & antik kent gezisi' },
        { id: 'health-raincoat', name: 'Yağmurluk / Panço', weightG: 210, note: 'Karadeniz & ani sağanaklar' },
        { id: 'health-id', name: 'Kimlik & MüzeKart', weightG: 30, note: 'GSB giriş & müze erişimi' },
        { id: 'health-cash', name: 'Yedek Nakit', weightG: 50, note: 'Acil durum & yerel esnaf' }
      ]
    }
  ];

  // Fallback helpers
  function defaultEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatWeightGrams(grams) {
    const g = Math.max(0, Math.round(Number(grams) || 0));
    if (g >= 1000) {
      return `${(g / 1000).toFixed(2).replace('.', ',')} kg`;
    }
    return `${g} g`;
  }

  function formatKg(grams) {
    const kg = Math.max(0, Number(grams) || 0) / 1000;
    return kg.toFixed(2).replace('.', ',');
  }

  function getWeightTier(grams) {
    const kg = (Number(grams) || 0) / 1000;
    if (kg < 7) {
      return { key: 'light', label: 'Hafif', range: '< 7 kg', icon: '🪶' };
    }
    if (kg <= 10) {
      return { key: 'ideal', label: 'İdeal', range: '7–10 kg', icon: '⚖️' };
    }
    return { key: 'heavy', label: 'Ağır', range: '> 10 kg', icon: '🏋️' };
  }

  function getSeasonMeta(seasonId) {
    return SEASONS.find((s) => s.id === seasonId) || SEASONS[1];
  }

  function getRegionProfile(regionId) {
    return REGION_PROFILES.find((r) => r.id === regionId) || REGION_PROFILES[0];
  }

  function computeRecommendations(state) {
    const profile = getRegionProfile(state.region);
    const activeItemsById = new Map();
    CATEGORIES.forEach((cat) => {
      getCategoryItems(cat, state).forEach((item) => {
        activeItemsById.set(item.id, { ...item, categoryIcon: cat.icon, categoryTitle: cat.title });
      });
    });

    const recommendedIds = new Set();
    const reasons = new Map();

    profile.essentialIds.forEach((id) => {
      if (activeItemsById.has(id)) {
        recommendedIds.add(id);
        reasons.set(id, `${profile.icon} ${profile.label}`);
      }
    });

    // Always highlight season-specific core clothing items
    if (state.season === 'kis') {
      ['cloth-kis-1', 'cloth-kis-4', 'cloth-kis-5'].forEach((id) => {
        if (activeItemsById.has(id)) {
          recommendedIds.add(id);
          if (!reasons.has(id)) reasons.set(id, '❄️ Kış Koruması');
        }
      });
    } else if (state.season === 'yaz') {
      ['cloth-yaz-4', 'health-sunscreen', 'gsb-bottle'].forEach((id) => {
        if (activeItemsById.has(id)) {
          recommendedIds.add(id);
          if (!reasons.has(id)) reasons.set(id, '☀️ Yaz Sıcakları');
        }
      });
    } else {
      ['cloth-bahar-3', 'cloth-bahar-4', 'health-raincoat'].forEach((id) => {
        if (activeItemsById.has(id)) {
          recommendedIds.add(id);
          if (!reasons.has(id)) reasons.set(id, '🍂 Geçiş Havası');
        }
      });
    }

    // 4-hour daily library coding essentials
    if (state.libraryFocus !== false) {
      LIBRARY_CODING_IDS.forEach((id) => {
        if (activeItemsById.has(id)) {
          recommendedIds.add(id);
          const prev = reasons.get(id);
          reasons.set(id, prev ? `${prev} · 💻 4sa Kütüphane` : '💻 4sa Kütüphane Kodlama');
        }
      });
    }

    const items = [];
    recommendedIds.forEach((id) => {
      const meta = activeItemsById.get(id);
      if (meta) {
        items.push({
          ...meta,
          reason: reasons.get(id) || profile.label,
          isChecked: Boolean(state.checked[id])
        });
      }
    });

    return {
      profile,
      recommendedIds,
      items,
      missingCount: items.filter((it) => !it.isChecked).length
    };
  }

  function getDefaultState() {
    return {
      season: 'bahar',
      region: 'karadeniz',
      libraryFocus: true,
      checked: {},
      customItems: []
    };
  }

  function loadState() {
    const fallback = getDefaultState();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return fallback;

      const validSeasonIds = new Set(SEASONS.map((s) => s.id));
      const validRegionIds = new Set(REGION_PROFILES.map((r) => r.id));
      const validCategoryIds = new Set(CATEGORIES.map((c) => c.id));

      const season = validSeasonIds.has(parsed.season) ? parsed.season : fallback.season;
      const region = validRegionIds.has(parsed.region) ? parsed.region : fallback.region;
      const libraryFocus = parsed.libraryFocus === undefined ? true : Boolean(parsed.libraryFocus);
      const checked = {};
      if (parsed.checked && typeof parsed.checked === 'object' && !Array.isArray(parsed.checked)) {
        Object.keys(parsed.checked).forEach((k) => {
          if (parsed.checked[k]) checked[k] = true;
        });
      } else if (Array.isArray(parsed.checked)) {
        parsed.checked.forEach((k) => {
          if (typeof k === 'string' && k) checked[k] = true;
        });
      }

      const customItems = [];
      if (Array.isArray(parsed.customItems)) {
        parsed.customItems.forEach((item) => {
          if (!item || typeof item !== 'object') return;
          const name = typeof item.name === 'string' ? item.name.trim() : '';
          const categoryId = validCategoryIds.has(item.categoryId) ? item.categoryId : 'tech';
          const weightG = Math.max(0, Math.min(50000, Math.round(Number(item.weightG) || 0)));
          const id = typeof item.id === 'string' && item.id.trim()
            ? item.id.trim()
            : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          if (name) {
            customItems.push({ id, name, categoryId, weightG, isCustom: true });
          }
        });
      }

      return { season, region, libraryFocus, checked, customItems };
    } catch (_) {
      return fallback;
    }
  }

  function saveState(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        season: state.season,
        region: state.region,
        libraryFocus: state.libraryFocus,
        checked: state.checked,
        customItems: state.customItems
      }));
    } catch (_) {
      // Ignore storage quota or private mode errors
    }
  }

  function getCategoryItems(category, state) {
    const baseItems = category.dynamicSeason
      ? (SEASONAL_CLOTHING[state.season] || SEASONAL_CLOTHING.bahar)
      : category.items;
    const customForCat = state.customItems.filter((item) => item.categoryId === category.id);
    return [...baseItems, ...customForCat];
  }

  function computeTelemetry(state) {
    let totalItems = 0;
    let checkedItems = 0;
    let checkedWeightG = 0;
    let totalWeightG = 0;

    CATEGORIES.forEach((cat) => {
      const items = getCategoryItems(cat, state);
      items.forEach((item) => {
        totalItems += 1;
        totalWeightG += item.weightG;
        if (state.checked[item.id]) {
          checkedItems += 1;
          checkedWeightG += item.weightG;
        }
      });
    });

    const readinessPct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
    const tier = getWeightTier(checkedWeightG);

    return {
      totalItems,
      checkedItems,
      readinessPct,
      checkedWeightG,
      totalWeightG,
      tier
    };
  }

  function buildMarkdown(state) {
    const telemetry = computeTelemetry(state);
    const seasonMeta = getSeasonMeta(state.season);
    const today = new Date().toISOString().slice(0, 10);

    const lines = [];
    lines.push('# 🎒 Sırt Çantası & Sefer Hazırlık Listesi');
    lines.push('');
    lines.push(`> **Anadolu Seyahatnamesi — Dijital Seyyah Sefer Kontrol Listesi**`);
    lines.push(`> Tarih: **${today}** | Mevsim: **${seasonMeta.icon} ${seasonMeta.label}**`);
    lines.push('');
    lines.push('## 📊 Çanta Telemetrisi');
    lines.push('');
    lines.push(`- **Hazırlık Durumu:** ${telemetry.checkedItems} / ${telemetry.totalItems} eşya (%${telemetry.readinessPct})`);
    lines.push(`- **Toplam Çanta Ağırlığı (İşaretli):** **${formatKg(telemetry.checkedWeightG)} kg** (${telemetry.checkedWeightG} g) — ${telemetry.tier.icon} **${telemetry.tier.label}** (${telemetry.tier.range})`);
    lines.push(`- **Tüm Liste Potansiyel Ağırlığı:** ${formatKg(telemetry.totalWeightG)} kg (${telemetry.totalWeightG} g)`);
    lines.push('');

    CATEGORIES.forEach((cat) => {
      const items = getCategoryItems(cat, state);
      const catChecked = items.filter((it) => state.checked[it.id]);
      const catWeightG = catChecked.reduce((sum, it) => sum + it.weightG, 0);
      const seasonTag = cat.dynamicSeason ? ` — ${seasonMeta.icon} ${seasonMeta.label}` : '';

      lines.push(`## ${cat.icon} ${cat.title}${seasonTag}`);
      lines.push(`*Hazır: ${catChecked.length}/${items.length} · Seçili Ağırlık: ${formatWeightGrams(catWeightG)}*`);
      lines.push('');

      items.forEach((item) => {
        const mark = state.checked[item.id] ? 'x' : ' ';
        const customTag = item.isCustom ? ' *(Özel)*' : '';
        const noteTag = item.note ? ` — ${item.note}` : '';
        lines.push(`- [${mark}] **${item.name}** (${formatWeightGrams(item.weightG)})${customTag}${noteTag}`);
      });
      lines.push('');
    });

    lines.push('---');
    lines.push('*Anadolu Seyahatnamesi · Dijital Seyyah Sırt Çantası Modülü ile oluşturuldu.*');
    return lines.join('\n');
  }

  function triggerDownload(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType || 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .packing-module {
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 20px 24px 36px;
        max-width: 1320px;
        margin: 0 auto;
        width: 100%;
        animation: modFadeSlideUp 0.28s ease-out;
      }

      .packing-hero {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 20px 24px;
        border-radius: var(--radius-lg, 20px);
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.78) 100%);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0, 0, 0, 0.5));
      }

      .packing-hero-title {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .packing-hero-icon {
        width: 50px;
        height: 50px;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.22), rgba(16, 185, 129, 0.25));
        border: 1px solid rgba(0, 242, 254, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.65rem;
        flex-shrink: 0;
      }

      .packing-hero-title h2 {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        margin: 0 0 3px;
      }

      .packing-hero-title p {
        font-size: 0.86rem;
        color: var(--text-secondary, #94a3b8);
        margin: 0;
      }

      .packing-season-switcher {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .packing-season-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.65);
        color: var(--text-secondary, #94a3b8);
        font-family: var(--font-heading, sans-serif);
        font-size: 0.83rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .packing-season-btn:hover {
        border-color: var(--border-glow, rgba(0, 242, 254, 0.4));
        color: var(--text-primary, #f8fafc);
        transform: translateY(-1px);
      }

      .packing-season-btn.active {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.24), rgba(0, 242, 254, 0.18));
        border-color: var(--accent-gold, #f59e0b);
        color: #ffffff;
        box-shadow: 0 0 16px rgba(245, 158, 11, 0.22);
      }

      /* Telemetry Bar */
      .packing-telemetry {
        display: grid;
        grid-template-columns: 1.35fr 1fr;
        gap: 16px;
        padding: 18px 22px;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(14px);
      }

      .packing-tele-block {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .packing-tele-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
      }

      .packing-tele-label {
        font-size: 0.82rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary, #94a3b8);
      }

      .packing-tele-value {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
      }

      .packing-progress-track {
        width: 100%;
        height: 11px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.08);
        overflow: hidden;
      }

      .packing-progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent-cyan, #00f2fe), var(--accent-emerald, #10b981));
        transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 0 12px rgba(0, 242, 254, 0.35);
      }

      .packing-weight-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .packing-weight-main {
        display: flex;
        align-items: baseline;
        gap: 8px;
      }

      .packing-weight-kg {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.65rem;
        font-weight: 800;
        line-height: 1;
      }

      .packing-weight-kg.tier-light { color: #10b981; }
      .packing-weight-kg.tier-ideal { color: #f59e0b; }
      .packing-weight-kg.tier-heavy { color: #ef4444; }

      .packing-weight-sub {
        font-size: 0.78rem;
        color: var(--text-secondary, #94a3b8);
      }

      .packing-weight-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 0.79rem;
        font-weight: 700;
        border: 1px solid transparent;
      }

      .packing-weight-badge.tier-light {
        background: rgba(16, 185, 129, 0.16);
        border-color: rgba(16, 185, 129, 0.42);
        color: #34d399;
      }

      .packing-weight-badge.tier-ideal {
        background: rgba(245, 158, 11, 0.16);
        border-color: rgba(245, 158, 11, 0.42);
        color: #fbbf24;
      }

      .packing-weight-badge.tier-heavy {
        background: rgba(239, 68, 68, 0.16);
        border-color: rgba(239, 68, 68, 0.45);
        color: #f87171;
      }

      .packing-weight-bar-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.35s ease, background 0.3s ease;
      }

      .packing-weight-bar-fill.tier-light {
        background: linear-gradient(90deg, #10b981, #34d399);
      }

      .packing-weight-bar-fill.tier-ideal {
        background: linear-gradient(90deg, #f59e0b, #fbbf24);
      }

      .packing-weight-bar-fill.tier-heavy {
        background: linear-gradient(90deg, #ef4444, #f87171);
      }

      /* Action Toolbar + Add Custom Item */
      .packing-controls-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .packing-action-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .packing-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 9px 15px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(30, 41, 59, 0.72);
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, sans-serif);
        font-size: 0.83rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .packing-btn:hover {
        border-color: var(--border-glow, rgba(0, 242, 254, 0.45));
        background: rgba(51, 65, 85, 0.85);
        transform: translateY(-1px);
      }

      .packing-btn-primary {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.24), rgba(16, 185, 129, 0.24));
        border-color: rgba(0, 242, 254, 0.5);
        color: #ffffff;
      }

      .packing-btn-primary:hover {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.36), rgba(16, 185, 129, 0.36));
        box-shadow: 0 0 18px rgba(0, 242, 254, 0.25);
      }

      .packing-btn.active-filter {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.16);
        color: var(--accent-cyan, #00f2fe);
      }

      /* Add Custom Item Card */
      .packing-add-form {
        display: grid;
        grid-template-columns: 1.6fr 1.2fr 0.7fr auto;
        gap: 10px;
        padding: 14px 16px;
        border-radius: var(--radius-md, 14px);
        background: rgba(15, 23, 42, 0.65);
        border: 1px dashed rgba(0, 242, 254, 0.3);
        align-items: center;
      }

      .packing-input,
      .packing-select {
        width: 100%;
        padding: 9px 12px;
        border-radius: var(--radius-sm, 8px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.85);
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, sans-serif);
        font-size: 0.85rem;
        outline: none;
        transition: border-color 0.2s ease;
      }

      .packing-input:focus,
      .packing-select:focus {
        border-color: var(--accent-cyan, #00f2fe);
      }

      .packing-input::placeholder {
        color: var(--text-muted, #64748b);
      }

      /* Categories Grid */
      .packing-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
        gap: 16px;
        align-items: start;
      }

      .packing-cat-card {
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-md, 16px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(12px);
        overflow: hidden;
        transition: border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .packing-cat-card:hover {
        border-color: rgba(0, 242, 254, 0.28);
      }

      .packing-cat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 14px 16px;
        background: rgba(15, 23, 42, 0.45);
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      .packing-cat-title-wrap {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
      }

      .packing-cat-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      .packing-cat-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 0.96rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
        margin: 0;
        line-height: 1.25;
      }

      .packing-cat-season-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 3px;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 700;
        background: rgba(245, 158, 11, 0.16);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.35);
      }

      .packing-cat-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      .packing-cat-stat {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.08);
        white-space: nowrap;
      }

      .packing-cat-toggle {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: var(--text-secondary, #94a3b8);
        border-radius: 8px;
        padding: 3px 8px;
        font-size: 0.72rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .packing-cat-toggle:hover {
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
      }

      .packing-item-list {
        list-style: none;
        padding: 8px 10px 10px;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .packing-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 9px 10px;
        border-radius: 10px;
        border: 1px solid transparent;
        background: rgba(15, 23, 42, 0.32);
        cursor: pointer;
        transition: all 0.18s ease;
        user-select: none;
      }

      .packing-item:hover {
        background: rgba(51, 65, 85, 0.45);
        border-color: rgba(255, 255, 255, 0.08);
      }

      .packing-item.is-checked {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.25);
      }

      .packing-item.is-recommended {
        border-color: rgba(245, 158, 11, 0.45);
        box-shadow: inset 3px 0 0 #f59e0b;
      }

      .packing-rec-badge {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        margin-left: 6px;
        padding: 1px 7px;
        border-radius: 999px;
        font-size: 0.66rem;
        font-weight: 700;
        background: rgba(245, 158, 11, 0.16);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.35);
        vertical-align: middle;
      }

      /* Smart Season & Region Optimizer Panel */
      .packing-optimizer {
        display: flex;
        flex-direction: column;
        gap: 13px;
        padding: 16px 20px;
        border-radius: var(--radius-lg, 18px);
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.82), rgba(30, 41, 59, 0.72));
        border: 1px solid rgba(0, 242, 254, 0.28);
        backdrop-filter: blur(12px);
      }

      .packing-opt-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .packing-opt-title {
        font-family: var(--font-heading, sans-serif);
        font-size: 1rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .packing-opt-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }

      .packing-region-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 11px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.58);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.77rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .packing-region-pill:hover {
        border-color: rgba(0, 242, 254, 0.45);
        color: var(--text-primary, #f8fafc);
      }

      .packing-region-pill.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(16, 185, 129, 0.18));
        border-color: var(--accent-cyan, #00f2fe);
        color: #ffffff;
      }

      .packing-opt-tip {
        font-size: 0.83rem;
        color: var(--text-secondary, #cbd5e1);
        line-height: 1.5;
        padding: 10px 13px;
        border-radius: 10px;
        background: rgba(0, 242, 254, 0.06);
        border-left: 3px solid var(--accent-cyan, #00f2fe);
      }

      .packing-opt-items {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .packing-opt-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1px solid rgba(245, 158, 11, 0.35);
        background: rgba(245, 158, 11, 0.12);
        color: #fde68a;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .packing-opt-chip.is-done {
        border-color: rgba(16, 185, 129, 0.4);
        background: rgba(16, 185, 129, 0.14);
        color: #6ee7b7;
      }

      .packing-opt-chip:hover {
        transform: translateY(-1px);
      }

      .packing-item-left {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        min-width: 0;
        flex: 1;
      }

      .packing-checkbox {
        width: 18px;
        height: 18px;
        margin-top: 2px;
        accent-color: var(--accent-emerald, #10b981);
        cursor: pointer;
        flex-shrink: 0;
      }

      .packing-item-text {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .packing-item-name {
        font-size: 0.87rem;
        font-weight: 600;
        color: var(--text-primary, #f8fafc);
        line-height: 1.3;
        word-break: break-word;
      }

      .packing-item.is-checked .packing-item-name {
        text-decoration: line-through;
        color: var(--text-secondary, #94a3b8);
      }

      .packing-item-note {
        font-size: 0.74rem;
        color: var(--text-muted, #64748b);
        margin-top: 1px;
      }

      .packing-item-right {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }

      .packing-weight-pill {
        font-size: 0.74rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.6);
        color: var(--text-secondary, #94a3b8);
        border: 1px solid rgba(255, 255, 255, 0.07);
        white-space: nowrap;
      }

      .packing-item.is-checked .packing-weight-pill {
        background: rgba(16, 185, 129, 0.16);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.3);
      }

      .packing-delete-btn {
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.28);
        color: #f87171;
        border-radius: 7px;
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.78rem;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .packing-delete-btn:hover {
        background: rgba(239, 68, 68, 0.28);
        color: #ffffff;
      }

      .packing-empty-note {
        padding: 14px 12px;
        text-align: center;
        font-size: 0.82rem;
        color: var(--text-muted, #64748b);
      }

      /* Light Theme Support */
      body.light-theme .packing-hero {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(241, 245, 249, 0.92) 100%);
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
      }

      body.light-theme .packing-telemetry,
      body.light-theme .packing-cat-card {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
      }

      body.light-theme .packing-cat-header {
        background: rgba(241, 245, 249, 0.85);
        border-bottom-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .packing-add-form {
        background: rgba(248, 250, 252, 0.92);
        border-color: rgba(2, 132, 199, 0.35);
      }

      body.light-theme .packing-input,
      body.light-theme .packing-select {
        background: #ffffff;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.16);
      }

      body.light-theme .packing-season-btn,
      body.light-theme .packing-btn {
        background: #ffffff;
        color: #1e293b;
        border-color: rgba(15, 23, 42, 0.14);
      }

      body.light-theme .packing-season-btn.active {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #ffffff;
        border-color: #d97706;
      }

      body.light-theme .packing-btn-primary {
        background: linear-gradient(135deg, #0284c7, #059669);
        color: #ffffff;
        border-color: transparent;
      }

      body.light-theme .packing-progress-track {
        background: rgba(15, 23, 42, 0.08);
        border-color: rgba(15, 23, 42, 0.08);
      }

      body.light-theme .packing-item {
        background: rgba(248, 250, 252, 0.85);
      }

      body.light-theme .packing-item:hover {
        background: rgba(226, 232, 240, 0.65);
      }

      body.light-theme .packing-item.is-checked {
        background: rgba(16, 185, 129, 0.12);
        border-color: rgba(16, 185, 129, 0.35);
      }

      body.light-theme .packing-weight-pill,
      body.light-theme .packing-cat-stat {
        background: rgba(15, 23, 42, 0.06);
        color: #334155;
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme .packing-item.is-checked .packing-weight-pill {
        background: rgba(16, 185, 129, 0.15);
        color: #047857;
      }

      body.light-theme .packing-weight-badge.tier-light { color: #047857; }
      body.light-theme .packing-weight-badge.tier-ideal { color: #b45309; }
      body.light-theme .packing-weight-badge.tier-heavy { color: #b91c1c; }

      body.light-theme .packing-optimizer {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(240, 249, 255, 0.94));
        border-color: rgba(2, 132, 199, 0.28);
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
      }

      body.light-theme .packing-opt-title {
        color: #0f172a;
      }

      body.light-theme .packing-region-pill {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.14);
        color: #334155;
      }

      body.light-theme .packing-region-pill.active {
        background: linear-gradient(135deg, #0284c7, #059669);
        border-color: #0284c7;
        color: #ffffff;
      }

      body.light-theme .packing-opt-tip {
        background: rgba(2, 132, 199, 0.07);
        border-left-color: #0284c7;
        color: #1e293b;
      }

      body.light-theme .packing-opt-chip {
        background: rgba(245, 158, 11, 0.14);
        border-color: rgba(217, 119, 6, 0.35);
        color: #92400e;
      }

      body.light-theme .packing-opt-chip.is-done {
        background: rgba(16, 185, 129, 0.14);
        border-color: rgba(5, 150, 105, 0.38);
        color: #065f46;
      }

      body.light-theme .packing-rec-badge {
        background: rgba(245, 158, 11, 0.15);
        color: #b45309;
        border-color: rgba(217, 119, 6, 0.35);
      }

      /* Responsive */
      @media (max-width: 860px) {
        .packing-module {
          padding: 14px 14px 28px;
        }
        .packing-telemetry {
          grid-template-columns: 1fr;
        }
        .packing-add-form {
          grid-template-columns: 1fr 1fr;
        }
        .packing-add-form button[type="submit"] {
          grid-column: 1 / -1;
        }
      }

      @media (max-width: 560px) {
        .packing-grid {
          grid-template-columns: 1fr;
        }
        .packing-add-form {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function render(container, ctx) {
    if (!container) return;
    injectStyles();

    const safeCtx = ctx && typeof ctx === 'object' ? ctx : {};
    const escapeHtml = typeof safeCtx.escapeHtml === 'function' ? safeCtx.escapeHtml : defaultEscapeHtml;
    const showToast = typeof safeCtx.showToast === 'function' ? safeCtx.showToast : function () {};

    const state = loadState();
    let showUncheckedOnly = false;

    function updateAndRender() {
      saveState(state);
      draw();
    }

    function draw() {
      const tele = computeTelemetry(state);
      const seasonMeta = getSeasonMeta(state.season);
      const rec = computeRecommendations(state);
      const weightBarPct = Math.min(100, Math.round((tele.checkedWeightG / 12000) * 100));

      const seasonButtonsHtml = SEASONS.map((s) => {
        const isActive = s.id === state.season;
        return `
          <button
            type="button"
            class="packing-season-btn${isActive ? ' active' : ''}"
            data-action="set-season"
            data-season="${escapeHtml(s.id)}"
            title="${escapeHtml(s.desc)}"
            aria-pressed="${isActive ? 'true' : 'false'}"
          >
            <span>${s.icon}</span>
            <span>${escapeHtml(s.label)}</span>
          </button>
        `;
      }).join('');

      const categoryOptionsHtml = CATEGORIES.map((c) => (
        `<option value="${escapeHtml(c.id)}">${c.icon} ${escapeHtml(c.title)}</option>`
      )).join('');

      const categoriesHtml = CATEGORIES.map((cat) => {
        const allItems = getCategoryItems(cat, state);
        const checkedCount = allItems.filter((it) => state.checked[it.id]).length;
        const checkedWeightG = allItems.reduce((sum, it) => sum + (state.checked[it.id] ? it.weightG : 0), 0);
        const allChecked = allItems.length > 0 && checkedCount === allItems.length;
        const visibleItems = showUncheckedOnly
          ? allItems.filter((it) => !state.checked[it.id])
          : allItems;

        const itemsHtml = visibleItems.length > 0
          ? visibleItems.map((item) => {
              const isChecked = !!state.checked[item.id];
              const isRec = rec.recommendedIds.has(item.id);
              return `
                <li class="packing-item${isChecked ? ' is-checked' : ''}${isRec ? ' is-recommended' : ''}" data-action="toggle-item" data-item-id="${escapeHtml(item.id)}">
                  <div class="packing-item-left">
                    <input
                      type="checkbox"
                      class="packing-checkbox"
                      data-item-id="${escapeHtml(item.id)}"
                      ${isChecked ? 'checked' : ''}
                      aria-label="${escapeHtml(item.name)}"
                    />
                    <div class="packing-item-text">
                      <span class="packing-item-name">${escapeHtml(item.name)}${isRec ? '<span class="packing-rec-badge">⭐ Önerilen</span>' : ''}</span>
                      ${item.note ? `<span class="packing-item-note">${escapeHtml(item.note)}</span>` : ''}
                      ${item.isCustom ? `<span class="packing-item-note">✨ Özel eşya</span>` : ''}
                    </div>
                  </div>
                  <div class="packing-item-right">
                    <span class="packing-weight-pill">${escapeHtml(formatWeightGrams(item.weightG))}</span>
                    ${item.isCustom ? `
                      <button
                        type="button"
                        class="packing-delete-btn"
                        data-action="delete-custom"
                        data-item-id="${escapeHtml(item.id)}"
                        title="Özel eşyayı sil"
                        aria-label="Özel eşyayı sil"
                      >✕</button>
                    ` : ''}
                  </div>
                </li>
              `;
            }).join('')
          : `<li class="packing-empty-note">🎉 Bu kategorideki tüm eşyalar hazır!</li>`;

        return `
          <section class="packing-cat-card" data-category="${escapeHtml(cat.id)}">
            <div class="packing-cat-header">
              <div class="packing-cat-title-wrap">
                <span class="packing-cat-icon">${cat.icon}</span>
                <div>
                  <h3 class="packing-cat-title">${escapeHtml(cat.title)}</h3>
                  ${cat.dynamicSeason ? `<span class="packing-cat-season-pill">${seasonMeta.icon} ${escapeHtml(seasonMeta.label)}</span>` : ''}
                </div>
              </div>
              <div class="packing-cat-meta">
                <span class="packing-cat-stat" title="Hazır eşya ve seçili ağırlık">
                  ${checkedCount}/${allItems.length} · ${escapeHtml(formatWeightGrams(checkedWeightG))}
                </span>
                <button
                  type="button"
                  class="packing-cat-toggle"
                  data-action="toggle-category"
                  data-category-id="${escapeHtml(cat.id)}"
                  title="${allChecked ? 'Kategoriyi temizle' : 'Tüm kategoriyi işaretle'}"
                >${allChecked ? 'Temizle' : 'Tümü'}</button>
              </div>
            </div>
            <ul class="packing-item-list">
              ${itemsHtml}
            </ul>
          </section>
        `;
      }).join('');

      container.innerHTML = `
        <div class="packing-module">
          <header class="packing-hero">
            <div class="packing-hero-title">
              <div class="packing-hero-icon">🎒</div>
              <div>
                <h2>Sırt Çantası &amp; Sefer Hazırlık Listesi</h2>
                <p>Dijital Seyyah ekipman, GSB Seyahatsever kervansaray ve mevsime göre akıllı çanta telemetrisi</p>
              </div>
            </div>
            <div class="packing-season-switcher" role="group" aria-label="Mevsim seçimi">
              ${seasonButtonsHtml}
            </div>
          </header>

          <section class="packing-telemetry" aria-label="Çanta Telemetrisi">
            <div class="packing-tele-block">
              <div class="packing-tele-header">
                <span class="packing-tele-label">Sefer Hazırlık Oranı</span>
                <span class="packing-tele-value">Hazır: ${tele.checkedItems} / ${tele.totalItems} eşya (%${tele.readinessPct})</span>
              </div>
              <div class="packing-progress-track" role="progressbar" aria-valuenow="${tele.readinessPct}" aria-valuemin="0" aria-valuemax="100">
                <div class="packing-progress-fill" style="width: ${tele.readinessPct}%"></div>
              </div>
              <span class="packing-weight-sub">
                ${tele.readinessPct === 100
                  ? '✅ Tüm sefer hazırlığı tamam! Yolun açık olsun seyyah.'
                  : `${tele.totalItems - tele.checkedItems} eşya daha çantaya eklenmeyi bekliyor.`}
              </span>
            </div>

            <div class="packing-tele-block">
              <div class="packing-tele-header">
                <span class="packing-tele-label">Toplam Çanta Ağırlığı</span>
                <span class="packing-weight-badge tier-${tele.tier.key}">
                  ${tele.tier.icon} ${escapeHtml(tele.tier.label)} (${escapeHtml(tele.tier.range)})
                </span>
              </div>
              <div class="packing-weight-row">
                <div class="packing-weight-main">
                  <span class="packing-weight-kg tier-${tele.tier.key}">${escapeHtml(formatKg(tele.checkedWeightG))} kg</span>
                  <span class="packing-weight-sub">/ ${escapeHtml(formatKg(tele.totalWeightG))} kg liste toplamı</span>
                </div>
              </div>
              <div class="packing-progress-track" title="Ağırlık göstergesi (12 kg ölçek)">
                <div class="packing-weight-bar-fill tier-${tele.tier.key}" style="width: ${weightBarPct}%"></div>
              </div>
            </div>
          </section>

          <section class="packing-optimizer" aria-label="Mevsime ve Bölgeye Göre Çanta Optimizasyonu">
            <div class="packing-opt-head">
              <div class="packing-opt-title">🧠 Mevsime &amp; Bölgeye Göre Çantayı Optimize Et</div>
              <div class="packing-action-group">
                <button
                  type="button"
                  class="packing-region-pill${state.libraryFocus !== false ? ' active' : ''}"
                  data-action="toggle-lib-focus"
                  aria-pressed="${state.libraryFocus !== false ? 'true' : 'false'}"
                >💻 4 Saat Kütüphane Kodlama</button>
                <button
                  type="button"
                  class="packing-btn packing-btn-primary"
                  data-action="check-recommended"
                  style="padding: 6px 12px; font-size: 0.77rem;"
                >✨ Önerilenleri İşaretle (${rec.items.length - rec.missingCount}/${rec.items.length})</button>
              </div>
            </div>

            <div class="packing-opt-pills" role="group" aria-label="Hedef Bölge Seçimi">
              ${REGION_PROFILES.map((r) => `
                <button
                  type="button"
                  class="packing-region-pill${r.id === state.region ? ' active' : ''}"
                  data-action="set-region"
                  data-region="${escapeHtml(r.id)}"
                  aria-pressed="${r.id === state.region ? 'true' : 'false'}"
                >${r.icon} ${escapeHtml(r.label)}</button>
              `).join('')}
            </div>

            <div class="packing-opt-tip">
              <strong>${seasonMeta.icon} ${escapeHtml(seasonMeta.label)} × ${rec.profile.icon} ${escapeHtml(rec.profile.label)} Tavsiyesi:</strong>
              ${escapeHtml(rec.profile.tip)}${state.libraryFocus !== false ? ' Günlük 4 saat İl Halk Kütüphanesi kodlama mesaisi için laptop, GaN şarj, powerbank, ANC kulaklık ve kompakt çoklu priz önceliklendirildi.' : ''}
            </div>

            <div class="packing-opt-items">
              ${rec.items.map((it) => `
                <button
                  type="button"
                  class="packing-opt-chip${it.isChecked ? ' is-done' : ''}"
                  data-action="toggle-item"
                  data-item-id="${escapeHtml(it.id)}"
                  title="${escapeHtml(it.reason)} — işaretlemek için tıklayın"
                >${it.isChecked ? '✅' : '⭐'} ${escapeHtml(it.name)}</button>
              `).join('')}
            </div>
          </section>

          <div class="packing-controls-row">
            <div class="packing-action-group">
              <button type="button" class="packing-btn" data-action="check-all">☑️ Tümünü İşaretle</button>
              <button type="button" class="packing-btn" data-action="uncheck-all">⬜ Tümünü Temizle</button>
              <button type="button" class="packing-btn${showUncheckedOnly ? ' active-filter' : ''}" data-action="toggle-filter">
                ${showUncheckedOnly ? '👁️ Tümünü Göster' : '🔍 Sadece Eksikler'}
              </button>
            </div>
            <div class="packing-action-group">
              <button type="button" class="packing-btn packing-btn-primary" data-action="export-md">
                📥 Markdown Olarak İndir
              </button>
            </div>
          </div>

          <form class="packing-add-form" data-role="add-custom-form">
            <input
              type="text"
              name="itemName"
              class="packing-input"
              placeholder="Özel eşya ekle (örn: Aksiyon Kamerası, Mini Tripod)..."
              maxlength="80"
              required
            />
            <select name="categoryId" class="packing-select" aria-label="Kategori seçin">
              ${categoryOptionsHtml}
            </select>
            <input
              type="number"
              name="weightG"
              class="packing-input"
              placeholder="Ağırlık (g)"
              min="0"
              max="50000"
              step="5"
              value="200"
              required
              aria-label="Ağırlık gram cinsinden"
            />
            <button type="submit" class="packing-btn packing-btn-primary">➕ Eşya Ekle</button>
          </form>

          <div class="packing-grid">
            ${categoriesHtml}
          </div>
        </div>
      `;
    }

    // Event delegation on container (bound once per render call via replacement wrapper)
    const root = document.createElement('div');
    container.innerHTML = '';
    container.appendChild(root);

    // Rebind container reference for draw() to render inside root
    const originalContainer = container;
    container = root;

    root.addEventListener('click', (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      // Delete custom item
      const deleteBtn = target.closest('[data-action="delete-custom"]');
      if (deleteBtn) {
        e.stopPropagation();
        const itemId = deleteBtn.getAttribute('data-item-id');
        const idx = state.customItems.findIndex((it) => it.id === itemId);
        if (idx !== -1) {
          const removed = state.customItems.splice(idx, 1)[0];
          delete state.checked[itemId];
          updateAndRender();
          showToast(`🗑️ "${removed.name}" listeden kaldırıldı`);
        }
        return;
      }

      // Season switcher
      const seasonBtn = target.closest('[data-action="set-season"]');
      if (seasonBtn) {
        const nextSeason = seasonBtn.getAttribute('data-season');
        if (nextSeason && nextSeason !== state.season) {
          state.season = nextSeason;
          const meta = getSeasonMeta(nextSeason);
          updateAndRender();
          showToast(`${meta.icon} Mevsim "${meta.label}" olarak güncellendi`);
        }
        return;
      }

      // Region switcher for optimizer
      const regionBtn = target.closest('[data-action="set-region"]');
      if (regionBtn) {
        const nextRegion = regionBtn.getAttribute('data-region');
        if (nextRegion && nextRegion !== state.region) {
          state.region = nextRegion;
          const prof = getRegionProfile(nextRegion);
          updateAndRender();
          showToast(`🧠 Çanta önerileri ${prof.icon} ${prof.label} için güncellendi`);
        }
        return;
      }

      // Library 4-hour coding focus toggle
      if (target.closest('[data-action="toggle-lib-focus"]')) {
        state.libraryFocus = state.libraryFocus === false;
        updateAndRender();
        showToast(state.libraryFocus ? '💻 4 saat kütüphane kodlama ekipmanları öne çıkarıldı' : '💻 Kütüphane kodlama vurgusu kapatıldı');
        return;
      }

      // Check all recommended essentials
      if (target.closest('[data-action="check-recommended"]')) {
        const rec = computeRecommendations(state);
        let added = 0;
        rec.recommendedIds.forEach((id) => {
          if (!state.checked[id]) {
            state.checked[id] = true;
            added += 1;
          }
        });
        updateAndRender();
        showToast(added > 0
          ? `✨ ${added} önerilen kritik eşya çantaya işaretlendi!`
          : '✅ Tüm önerilen kritik eşyalar zaten çantada hazır!');
        return;
      }

      // Check All
      if (target.closest('[data-action="check-all"]')) {
        CATEGORIES.forEach((cat) => {
          getCategoryItems(cat, state).forEach((item) => {
            state.checked[item.id] = true;
          });
        });
        updateAndRender();
        showToast('☑️ Tüm sefer eşyaları işaretlendi!');
        return;
      }

      // Uncheck All
      if (target.closest('[data-action="uncheck-all"]')) {
        CATEGORIES.forEach((cat) => {
          getCategoryItems(cat, state).forEach((item) => {
            delete state.checked[item.id];
          });
        });
        updateAndRender();
        showToast('⬜ Tüm işaretler temizlendi');
        return;
      }

      // Toggle unchecked filter
      if (target.closest('[data-action="toggle-filter"]')) {
        showUncheckedOnly = !showUncheckedOnly;
        draw();
        return;
      }

      // Export Markdown
      if (target.closest('[data-action="export-md"]')) {
        const md = buildMarkdown(state);
        triggerDownload('sefer_canta_listesi.md', md, 'text/markdown;charset=utf-8');
        showToast('📥 sefer_canta_listesi.md indirildi');
        return;
      }

      // Toggle entire category
      const catToggleBtn = target.closest('[data-action="toggle-category"]');
      if (catToggleBtn) {
        const catId = catToggleBtn.getAttribute('data-category-id');
        const cat = CATEGORIES.find((c) => c.id === catId);
        if (cat) {
          const items = getCategoryItems(cat, state);
          const allChecked = items.length > 0 && items.every((it) => state.checked[it.id]);
          items.forEach((it) => {
            if (allChecked) {
              delete state.checked[it.id];
            } else {
              state.checked[it.id] = true;
            }
          });
          updateAndRender();
          showToast(allChecked ? `⬜ ${cat.title} temizlendi` : `☑️ ${cat.title} tamamlandı`);
        }
        return;
      }

      // Toggle single item (clicking row or checkbox)
      const itemRow = target.closest('[data-action="toggle-item"]');
      if (itemRow) {
        const itemId = itemRow.getAttribute('data-item-id');
        if (!itemId) return;
        if (state.checked[itemId]) {
          delete state.checked[itemId];
        } else {
          state.checked[itemId] = true;
        }
        updateAndRender();
      }
    });

    root.addEventListener('submit', (e) => {
      const form = e.target;
      if (!form || !form.matches('[data-role="add-custom-form"]')) return;
      e.preventDefault();

      const nameInput = form.querySelector('[name="itemName"]');
      const catSelect = form.querySelector('[name="categoryId"]');
      const weightInput = form.querySelector('[name="weightG"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const categoryId = catSelect ? catSelect.value : 'tech';
      const weightG = Math.max(0, Math.min(50000, Math.round(Number(weightInput ? weightInput.value : 0) || 0)));

      if (!name) {
        showToast('⚠️ Lütfen bir eşya adı girin');
        return;
      }

      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      state.customItems.push({
        id,
        name,
        categoryId,
        weightG,
        isCustom: true
      });
      state.checked[id] = true;

      updateAndRender();
      showToast(`➕ "${name}" (${formatWeightGrams(weightG)}) çantaya eklendi`);
    });

    // Silence unused variable lint if any
    void originalContainer;
    draw();
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.packing = {
    render,
    STORAGE_KEY
  };
})();
