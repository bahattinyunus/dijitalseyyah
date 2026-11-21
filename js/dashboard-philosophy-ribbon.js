/**
 * Dijital Seyyah — Günün İrfan & Felsefe Şeridi (js/dashboard-philosophy-ribbon.js)
 * Registers on: window.SEYYAH_MODULES.philosophyRibbon = { init(ctx) }
 *
 * Features:
 *   1. MutationObserver on #viewport-content (plus immediate check on init):
 *      Mounts .seyyah-philosophy-ribbon right after .daily-spotlight-card
 *      (or .anadolu-stories-bar / top of #viewport-content) whenever
 *      ctx.state.currentView === 'dashboard'.
 *   2. 🌙 Günün İrfan Beyiti & Hikmeti: 14 curated classical couplets & aphorisms
 *      (Yunus Emre, Mevlânâ, Şeyh Galip, Fuzûlî, Niyâzî-i Mısrî, İbnü'l-Arabî,
 *      Hacı Bayram-ı Velî, İmam Şâfiî) with a 🔄 Yeni Beyit cycle button.
 *   3. 🧭 Sefer Merhalesi Göstergesi: Interactive 3-stage Sufi travel indicator
 *      (1. Sefer-i Sûrî • 2. Sefer-i Manevî • 3. Sefer der Vatan) with hover
 *      tooltips and detailed modal explanation.
 *   4. ✒️ Günün Muhasebe Sorusu: Daily philosophical self-reflection prompt with
 *      inline 1-line note input + "📝 Deftere İşle" saving to
 *      localStorage `dijital_seyyah_journal_entries` with toast feedback, plus
 *      quick jump buttons to 🕌 İrfan Atlası, 📜 Hikmet Meclisi, and 🕯️ Halvet Odası.
 *   5. Scoped CSS supporting both Dark Obsidian and Light (Alabaster) themes.
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-philosophy-ribbon-styles';
  const RIBBON_CLASS = 'seyyah-philosophy-ribbon';
  const MODAL_ID = 'spr-stage-modal';
  const JOURNAL_ENTRIES_STORAGE = 'dijital_seyyah_journal_entries';

  const COUPLETS = [
    {
      author: 'Yunus Emre',
      source: 'Dîvân • 13. Yüzyıl',
      text: 'İlim ilim bilmektir, ilim kendin bilmektir; sen kendini bilmezsin, ya nice okumaktır.',
      wisdom: 'Yolculuk ve okuyuş, insanın kendi hakikat aynasına yönelmedikçe yalnızca zahirî bir malumat olarak kalır.'
    },
    {
      author: 'Mevlânâ Celâleddîn-i Rûmî',
      source: 'Mesnevî-i Şerîf',
      text: 'Testinin içinde ne varsa dışına o sızar; gönlünde hikmet taşıyanın adımı da sükûnet taşır.',
      wisdom: 'Seyyahın gördüğü şehirler, kendi iç dünyasında taşıdığı nazarın berraklığı ölçüsünde dile gelir.'
    },
    {
      author: 'Şeyh Galip',
      source: 'Hüsn ü Aşk • Terci-i Bend',
      text: 'Hoşça bak zâtına kim zübde-i âlemsin sen; merdüm-i dîde-i ekvân olan âdemsin sen.',
      wisdom: 'Kâinatın özü ve göz bebeği olan insan, gezdiği her beldede aslında kendi bâtın haritasının izlerini okur.'
    },
    {
      author: 'Fuzûlî',
      source: 'Dîvân • Gazel',
      text: 'İlim kesbiyle pâye-i rif‘at arzu-yı muhâl imiş ancak; aşk imiş her ne var âlemde.',
      wisdom: 'Kuru bilgi tek başına ruhu kandırmaz; beldelere, kitaplara ve yollara mânâ katan cevher muhabbettir.'
    },
    {
      author: 'Niyâzî-i Mısrî',
      source: 'Dîvân-ı İlâhîyat',
      text: 'Kande baksam dopdolu gördüm seni; gönlümün şehrinde buldum ben seni.',
      wisdom: 'Âfâkı gezen göz ibretle baktığında, taşların ve kubbelerin ardında enfüsî bir şehre açılan kapıyı görür.'
    },
    {
      author: 'Muhyiddin İbnü’l-Arabî',
      source: 'Fütûhât-ı Mekkiyye',
      text: 'Varlık baştan başa bir seferdir; zira her zerre durmaksızın kemâline doğru yürümektedir.',
      wisdom: 'Yeryüzünde atılan her bilinçli adım, varlığın bitmeyen hayret ve tekâmül yolculuğuna katılmaktır.'
    },
    {
      author: 'Hacı Bayram-ı Velî',
      source: 'İrşad Nutukları • Ankara',
      text: 'Bilmek istersen seni, can içre ara canı; geç canından bul anı, sen seni bil sen seni.',
      wisdom: 'Anadolu’nun merkezinden yola çıkan seyyahın en uzun seferi, kendi nefsinden gönül merkezine yaptığı yolculuktur.'
    },
    {
      author: 'İmam Şâfiî',
      source: 'Dîvânü’ş-Şâfiî',
      text: 'Yola koyul; zira seferde beş haslet vardır: kederden kurtuluş, rızık, ilim, edep ve âriflerle sohbet.',
      wisdom: 'Yerinde saymanın ülfetini kıran yolculuk, insana yeni ufuklar kadar yeni bir edep ve dirilik kazandırır.'
    },
    {
      author: 'Yunus Emre',
      source: 'Dîvân • İlâhî',
      text: 'Bize dîdâr gerek dünyâ gerekmez; bize ma‘nâ gerek da‘vâ gerekmez.',
      wisdom: 'Hakiki seyyah sadece fotoğraf ve mesafe biriktirmez; her duraktan kalbine bir mânâ ve incelik devşirir.'
    },
    {
      author: 'Mevlânâ Celâleddîn-i Rûmî',
      source: 'Dîvân-ı Kebîr',
      text: 'Yürü; ayakların yoruluncaya değil, gönül gözün uyanıncaya kadar yürü.',
      wisdom: 'Haritada işaretlenen her menzil, insanın gafletten uyanışına vesile olduğunda gerçek değerine kavuşur.'
    },
    {
      author: 'Şeyh Galip',
      source: 'Dîvân',
      text: 'Bir şu‘lesi var ki şem‘-i cânın; fânûsuna sığmaz âsumânın.',
      wisdom: 'Ruhun hakikat ışığı hiçbir coğrafî sınıra sığmaz; sefer, o iç ışığın yeni ufuklarla buluşma vesilesidir.'
    },
    {
      author: 'Fuzûlî',
      source: 'Leylâ vü Mecnûn',
      text: 'Ne yanar kimse bana âteş-i dilden özge; ne açar kimse kapım bâd-ı sabâdan gayrı.',
      wisdom: 'Gurbet ve sükût anları, yolcuyu dünyevî kalabalıktan çekip özündeki sahici sesle baş başa bırakır.'
    },
    {
      author: 'Niyâzî-i Mısrî',
      source: 'Dîvân-ı İlâhîyat',
      text: 'Derman arardım derdime, derdim bana derman imiş; bürhan sorardım aslıma, aslım bana bürhan imiş.',
      wisdom: 'Dışarıda aranan hikmet ve cevapların çoğu, yolun sükûnetinde insanın kendi kalbinde beliriverir.'
    },
    {
      author: 'Muhyiddin İbnü’l-Arabî',
      source: 'Tercümânü’l-Eşvâk',
      text: 'Kalbim her sûreti kabule lâyık oldu; ceylanlara otlak, rahiplere manastır, âşıklara Kâbe kesildi.',
      wisdom: 'İrfan ehli, karşılaştığı her kültür katmanına ve kadim mirasa önyargısız bir hayret ve merhametle bakar.'
    }
  ];

  const SEFER_STAGES = [
    {
      id: 'suri',
      order: 1,
      shortTitle: '1. Sefer-i Sûrî',
      title: '1. Sefer-i Sûrî (Âfâkî / Mekânsal Yolculuk)',
      badge: 'Coğrafya & Müşahede',
      summary: 'Şehirleri, yolları, kütüphaneleri ve medeniyet izlerini bedenle adımlama merhalesi.',
      tooltip: 'Haritada ve yeryüzünde atılan ilk adım: şehirlerin tarihini, mimarisini ve insanını yerinde müşahede etmek.',
      detail:
        'Sefer-i Sûrî, yolcunun alıştığı konfor alanından çıkıp Anadolu’nun 81 ilini, hanlarını, camilerini, il halk kütüphanelerini ve tabiî dokusunu bizzat adımlamasıdır. Bu merhalede amaç yalnızca hızla mesafe katetmek değil; her beldenin “âb u havasını”, taşındaki hafızayı ve insanındaki hâli dikkatle okumaktır.',
      practice: 'Pratikte: Bir şehirde en az 5 gün kalarak acele etmeden sindirmek, kütüphanede notlar almak ve mekânın ruhunu dinlemek.'
    },
    {
      id: 'manevi',
      order: 2,
      shortTitle: '2. Sefer-i Manevî',
      title: '2. Sefer-i Manevî (Enfüsî / Kalbî Yolculuk)',
      badge: 'Tefekkür & Muhasebe',
      summary: 'Dışarıda görülen her ibretin kalpte anlam, incelik ve ahlâkî derinliğe dönüşmesi.',
      tooltip: 'Görülen mekânların ve okunan satırların insanın iç dünyasında hikmete, şükre ve muhasebeye inkılap etmesi.',
      detail:
        'Sefer-i Manevî, coğrafî hareketin içsel bir uyanışa dönüştüğü eşiktir. Bir türbenin avlusundaki sessizlik, bir kervansarayın yıpranmış taşı ya da sabah çorbasındaki bereket artık sıradan birer görüntü değil; fâniliği, vefayı ve hakikati hatırlatan birer “âyet-i âfâkî” olur. Seyyah burada dış dünyadan kendi kalbine doğru yürür.',
      practice: 'Pratikte: Gün sonunda muhasebe sorusuna cevap vermek, Halvet Odası’nda nefes ve sükûnetle günü tartmak.'
    },
    {
      id: 'vatan',
      order: 3,
      shortTitle: '3. Sefer der Vatan',
      title: '3. Sefer der Vatan (Vatanda / Özde Yolculuk)',
      badge: 'İrfan & Vuslat',
      summary: 'Yol ile yolcunun birleştiği, insanın her yerde kendi hakikat yurdunda olduğu merhale.',
      tooltip: 'Nakşî-tasavvuf geleneğindeki “kendi vatanında, yani insanî kemâl yurdunda yolculuk” sırrı.',
      detail:
        '“Sefer der Vatan”, tasavvuf irfanında mekân değiştirsin ya da değiştirmesin insanın beşerî zaaflardan arınıp ilâhî hakikat ve hikmet yurduna doğru kesintisiz ilerleyişidir. Bu merhalede seyyah için gurbet kalmaz; Ankara da, Konya da, kendi odasındaki çalışma masası da aynı mânâ vatanının birer köşesi hâline gelir.',
      practice: 'Pratikte: Öğrendiğin hikmeti günlük ahlâka, fütüvvet nezaketine ve üretken bir seyahatname mirasına dönüştürmek.'
    }
  ];

  const REFLECTION_QUESTIONS = [
    'Bugün gördüğün hangi mekân veya okuduğun hangi satır sana faniliği ve hakikati hatırlattı?',
    'Bugün yolunda veya zihninde aceleyle geçtiğin hangi ayrıntı, biraz yavaşlasan sana bir hikmet fısıldayabilirdi?',
    'Şu an hangi şehirde veya ruh hâlinde olursan ol, kalbinde taşıdığın en sahici şükür sebebi nedir?',
    'Bugün karşılaştığın bir insanın hâli ya da kadim bir söz, kendi içindeki hangi yönüne ayna tuttu?',
    'Yolculuğunun bugünkü durağında bıraktığın en güzel iz veya kendine verdiğin en dürüst söz ne oldu?'
  ];

  let activeCtx = null;
  let viewportObserver = null;
  let midnightTimerId = null;
  let coupletOffset = 0;
  let activeStageId = 'suri';
  let isRepositioning = false;
  let lastSavedCount = 0;

  // =========================================================================
  // Utilities
  // =========================================================================

  function fallbackEscapeHtml(str) {
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
    return fallbackEscapeHtml(str);
  }

  function getTodayDateKey() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatTurkishDate(dateKey) {
    const parts = String(dateKey || '').split('-');
    if (parts.length !== 3) return dateKey;
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const day = Number(parts[2]);
    const monthIdx = Number(parts[1]) - 1;
    const monthName = months[monthIdx] || parts[1];
    return `${day} ${monthName} ${parts[0]}`;
  }

  function hashDateKey(dateStr) {
    let h = 2166136261;
    for (let i = 0; i < dateStr.length; i += 1) {
      h ^= dateStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function notify(ctx, message) {
    if (ctx && typeof ctx.showToast === 'function') {
      ctx.showToast(message);
      return;
    }
    if (activeCtx && typeof activeCtx.showToast === 'function') {
      activeCtx.showToast(message);
      return;
    }
    const container = document.getElementById('toast-container');
    if (container) {
      const item = document.createElement('div');
      item.className = 'toast-item';
      item.textContent = message;
      container.appendChild(item);
      setTimeout(() => {
        if (item.parentNode) item.parentNode.removeChild(item);
      }, 3200);
    }
  }

  function readJournalEntries() {
    try {
      const raw = localStorage.getItem(JOURNAL_ENTRIES_STORAGE);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function appendJournalEntry(entry) {
    try {
      const entries = readJournalEntries();
      entries.unshift(entry);
      localStorage.setItem(JOURNAL_ENTRIES_STORAGE, JSON.stringify(entries));
      return { saved: true, count: entries.length };
    } catch (e) {
      return { saved: false, count: 0 };
    }
  }

  function getActiveStageByProgress(ctx) {
    const visitedCount =
      ctx && ctx.state && ctx.state.data && ctx.state.data.stats
        ? Number(ctx.state.data.stats.visited_cities || 0)
        : 0;
    if (visitedCount >= 40) return 'vatan';
    if (visitedCount >= 10) return 'manevi';
    return 'suri';
  }

  function getDailyModel() {
    const todayKey = getTodayDateKey();
    const baseHash = hashDateKey(todayKey);
    const coupletIdx = ((baseHash % COUPLETS.length) + coupletOffset) % COUPLETS.length;
    const questionIdx = hashDateKey(`muhasebe:${todayKey}`) % REFLECTION_QUESTIONS.length;
    const entries = readJournalEntries();
    const reflectionCount = entries.filter((e) => e && e.source === 'philosophyRibbon').length;

    return {
      dateKey: todayKey,
      dateLabel: formatTurkishDate(todayKey),
      couplet: COUPLETS[coupletIdx],
      coupletIndex: coupletIdx,
      coupletTotal: COUPLETS.length,
      isDailyCouplet: coupletOffset % COUPLETS.length === 0,
      question: REFLECTION_QUESTIONS[questionIdx],
      reflectionCount
    };
  }

  function openTargetView(ctx, viewName) {
    const safeCtx = ctx || activeCtx;
    if (safeCtx && typeof safeCtx.openView === 'function') {
      safeCtx.openView(viewName);
      return;
    }
    window.location.hash = `#${viewName}`;
  }

  // =========================================================================
  // Scoped CSS Injection (Dark Obsidian & Light Alabaster Compatible)
  // =========================================================================

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .${RIBBON_CLASS} {
        position: relative;
        max-width: 1100px;
        margin: 0 auto 24px auto;
        padding: 18px 20px;
        border-radius: var(--radius-lg, 20px);
        background:
          radial-gradient(circle at 6% 12%, rgba(245, 158, 11, 0.14), transparent 40%),
          radial-gradient(circle at 94% 85%, rgba(168, 85, 247, 0.12), transparent 42%),
          radial-gradient(circle at 52% 0%, rgba(16, 185, 129, 0.08), transparent 46%),
          var(--bg-card, rgba(15, 22, 39, 0.8));
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(245, 158, 11, 0.24);
        box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.56), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        color: var(--text-primary, #f8fafc);
        overflow: hidden;
        transition: border-color 0.25s ease, box-shadow 0.25s ease;
      }

      .${RIBBON_CLASS}:hover {
        border-color: rgba(245, 158, 11, 0.42);
      }

      body.light-theme .${RIBBON_CLASS},
      [data-theme="light"] .${RIBBON_CLASS} {
        background:
          radial-gradient(circle at 6% 12%, rgba(217, 119, 6, 0.1), transparent 44%),
          radial-gradient(circle at 94% 85%, rgba(124, 58, 237, 0.07), transparent 44%),
          rgba(255, 255, 255, 0.94);
        border-color: rgba(217, 119, 6, 0.24);
        box-shadow: 0 14px 32px -16px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.95);
        color: var(--text-primary, #0f172a);
      }

      .spr-top-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px 14px;
        padding-bottom: 13px;
        margin-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      body.light-theme .spr-top-bar,
      [data-theme="light"] .spr-top-bar {
        border-bottom-color: rgba(15, 23, 42, 0.08);
      }

      .spr-eyebrow-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .spr-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 11px;
        border-radius: 9999px;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: #fcd34d;
        background: rgba(245, 158, 11, 0.13);
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      body.light-theme .spr-eyebrow,
      [data-theme="light"] .spr-eyebrow {
        color: #b45309;
        background: rgba(245, 158, 11, 0.12);
        border-color: rgba(217, 119, 6, 0.28);
      }

      .spr-date-pill {
        font-size: 0.73rem;
        font-weight: 600;
        color: var(--text-secondary, #94a3b8);
      }

      body.light-theme .spr-date-pill,
      [data-theme="light"] .spr-date-pill {
        color: #475569;
      }

      /* 3 Sufi Travel Stages */
      .spr-stages {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }

      .spr-stage-label {
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        margin-right: 2px;
      }

      body.light-theme .spr-stage-label,
      [data-theme="light"] .spr-stage-label {
        color: #475569;
      }

      .spr-stage-btn {
        position: relative;
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.045);
        color: var(--text-secondary, #cbd5e1);
        font-family: inherit;
        font-size: 0.73rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .spr-stage-btn:hover,
      .spr-stage-btn:focus-visible {
        outline: none;
        color: #fef3c7;
        border-color: rgba(245, 158, 11, 0.55);
        background: rgba(245, 158, 11, 0.14);
        transform: translateY(-1px);
      }

      .spr-stage-btn.is-current {
        color: #fde68a;
        border-color: rgba(245, 158, 11, 0.45);
        background: rgba(245, 158, 11, 0.16);
        box-shadow: 0 0 14px rgba(245, 158, 11, 0.16);
      }

      body.light-theme .spr-stage-btn,
      [data-theme="light"] .spr-stage-btn {
        background: rgba(15, 23, 42, 0.04);
        border-color: rgba(15, 23, 42, 0.12);
        color: #334155;
      }

      body.light-theme .spr-stage-btn:hover,
      body.light-theme .spr-stage-btn:focus-visible,
      [data-theme="light"] .spr-stage-btn:hover,
      [data-theme="light"] .spr-stage-btn:focus-visible {
        color: #92400e;
        border-color: rgba(217, 119, 6, 0.45);
        background: rgba(245, 158, 11, 0.12);
      }

      body.light-theme .spr-stage-btn.is-current,
      [data-theme="light"] .spr-stage-btn.is-current {
        color: #92400e;
        border-color: rgba(217, 119, 6, 0.48);
        background: rgba(245, 158, 11, 0.16);
        box-shadow: none;
      }

      .spr-stage-sep {
        color: var(--text-muted, #64748b);
        font-size: 0.72rem;
        user-select: none;
      }

      /* Tooltip on hover/focus */
      .spr-stage-btn[data-spr-tooltip]::after {
        content: attr(data-spr-tooltip);
        position: absolute;
        left: 50%;
        bottom: calc(100% + 8px);
        transform: translateX(-50%) translateY(4px);
        width: max-content;
        max-width: 240px;
        padding: 7px 10px;
        border-radius: 10px;
        background: rgba(9, 14, 28, 0.96);
        border: 1px solid rgba(245, 158, 11, 0.35);
        color: #f8fafc;
        font-size: 0.71rem;
        font-weight: 500;
        line-height: 1.4;
        text-align: center;
        white-space: normal;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.18s ease, transform 0.18s ease;
        z-index: 30;
      }

      .spr-stage-btn:hover::after,
      .spr-stage-btn:focus-visible::after {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      body.light-theme .spr-stage-btn[data-spr-tooltip]::after,
      [data-theme="light"] .spr-stage-btn[data-spr-tooltip]::after {
        background: #0f172a;
        color: #f8fafc;
      }

      /* Main 2-column body */
      .spr-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
        gap: 18px;
        align-items: stretch;
      }

      .spr-panel {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 11px;
        padding: 14px 16px;
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.08);
        min-width: 0;
      }

      body.light-theme .spr-panel,
      [data-theme="light"] .spr-panel {
        background: rgba(248, 250, 252, 0.85);
        border-color: rgba(15, 23, 42, 0.08);
      }

      .spr-panel-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .spr-panel-title {
        margin: 0;
        font-family: var(--font-heading, inherit);
        font-size: 0.92rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      body.light-theme .spr-panel-title,
      [data-theme="light"] .spr-panel-title {
        color: #0f172a;
      }

      .spr-couplet-meta {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .spr-index-badge {
        padding: 2px 8px;
        border-radius: 9999px;
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.09);
      }

      body.light-theme .spr-index-badge,
      [data-theme="light"] .spr-index-badge {
        color: #475569;
        background: rgba(15, 23, 42, 0.05);
        border-color: rgba(15, 23, 42, 0.09);
      }

      .spr-btn-mini {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: 9999px;
        border: 1px solid rgba(245, 158, 11, 0.34);
        background: rgba(245, 158, 11, 0.12);
        color: #fde68a;
        font-family: inherit;
        font-size: 0.74rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .spr-btn-mini:hover {
        background: rgba(245, 158, 11, 0.22);
        border-color: rgba(245, 158, 11, 0.55);
        transform: translateY(-1px);
      }

      body.light-theme .spr-btn-mini,
      [data-theme="light"] .spr-btn-mini {
        color: #b45309;
        background: rgba(245, 158, 11, 0.12);
        border-color: rgba(217, 119, 6, 0.34);
      }

      body.light-theme .spr-btn-mini:hover,
      [data-theme="light"] .spr-btn-mini:hover {
        background: rgba(245, 158, 11, 0.2);
      }

      .spr-couplet-quote {
        margin: 0;
        padding: 10px 13px;
        border-left: 3px solid var(--accent-gold, #f59e0b);
        border-radius: 0 11px 11px 0;
        background: rgba(245, 158, 11, 0.06);
        font-size: 0.94rem;
        font-weight: 600;
        font-style: italic;
        line-height: 1.55;
        color: var(--text-primary, #f1f5f9);
      }

      body.light-theme .spr-couplet-quote,
      [data-theme="light"] .spr-couplet-quote {
        background: rgba(245, 158, 11, 0.08);
        color: #0f172a;
      }

      .spr-couplet-footer {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .spr-author-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        font-size: 0.78rem;
      }

      .spr-author-name {
        font-weight: 800;
        color: #fcd34d;
      }

      body.light-theme .spr-author-name,
      [data-theme="light"] .spr-author-name {
        color: #b45309;
      }

      .spr-author-source {
        font-size: 0.73rem;
        font-weight: 600;
        color: var(--text-muted, #94a3b8);
      }

      .spr-wisdom-note {
        margin: 0;
        font-size: 0.79rem;
        line-height: 1.48;
        color: var(--text-secondary, #cbd5e1);
      }

      body.light-theme .spr-wisdom-note,
      [data-theme="light"] .spr-wisdom-note {
        color: #475569;
      }

      /* Muhasebe Panel */
      .spr-question-text {
        margin: 0;
        font-size: 0.87rem;
        font-weight: 600;
        line-height: 1.5;
        color: var(--text-primary, #e2e8f0);
      }

      body.light-theme .spr-question-text,
      [data-theme="light"] .spr-question-text {
        color: #1e293b;
      }

      .spr-form {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .spr-input {
        flex: 1 1 auto;
        min-width: 0;
        padding: 9px 12px;
        border-radius: 11px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.83rem;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .spr-input::placeholder {
        color: var(--text-muted, #94a3b8);
      }

      .spr-input:focus {
        outline: none;
        border-color: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.16);
      }

      body.light-theme .spr-input,
      [data-theme="light"] .spr-input {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.16);
        color: #0f172a;
      }

      body.light-theme .spr-input::placeholder,
      [data-theme="light"] .spr-input::placeholder {
        color: #64748b;
      }

      .spr-btn-save {
        appearance: none;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 9px 14px;
        border-radius: 11px;
        border: 1px solid rgba(16, 185, 129, 0.45);
        background: linear-gradient(135deg, #10b981, #059669);
        color: #ffffff;
        font-family: inherit;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 8px 18px -10px rgba(16, 185, 129, 0.65);
        transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
      }

      .spr-btn-save:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 22px -10px rgba(16, 185, 129, 0.8);
      }

      /* Quick Jump Footer */
      .spr-jumps-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px dashed rgba(255, 255, 255, 0.1);
      }

      body.light-theme .spr-jumps-row,
      [data-theme="light"] .spr-jumps-row {
        border-top-color: rgba(15, 23, 42, 0.1);
      }

      .spr-jumps-group {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .spr-jump-btn {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 11px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.13);
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary, #e2e8f0);
        font-family: inherit;
        font-size: 0.76rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .spr-jump-btn:hover {
        border-color: rgba(168, 85, 247, 0.45);
        background: rgba(168, 85, 247, 0.14);
        color: #f3e8ff;
        transform: translateY(-1px);
      }

      body.light-theme .spr-jump-btn,
      [data-theme="light"] .spr-jump-btn {
        background: rgba(15, 23, 42, 0.045);
        border-color: rgba(15, 23, 42, 0.12);
        color: #1e293b;
      }

      body.light-theme .spr-jump-btn:hover,
      [data-theme="light"] .spr-jump-btn:hover {
        background: rgba(124, 58, 237, 0.1);
        border-color: rgba(124, 58, 237, 0.35);
        color: #5b21b6;
      }

      .spr-saved-count {
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--text-muted, #94a3b8);
      }

      /* Stage Explanation Modal */
      #${MODAL_ID} {
        position: fixed;
        inset: 0;
        z-index: 9500;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 18px;
        background: rgba(4, 8, 18, 0.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      #${MODAL_ID}.is-open {
        display: flex;
      }

      .spr-modal-card {
        width: 100%;
        max-width: 560px;
        border-radius: 20px;
        padding: 22px 24px;
        background: linear-gradient(155deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.94));
        border: 1px solid rgba(245, 158, 11, 0.35);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
        color: #f8fafc;
      }

      body.light-theme .spr-modal-card,
      [data-theme="light"] .spr-modal-card {
        background: #ffffff;
        border-color: rgba(217, 119, 6, 0.3);
        color: #0f172a;
        box-shadow: 0 24px 50px rgba(15, 23, 42, 0.2);
      }

      .spr-modal-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      .spr-modal-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 9999px;
        font-size: 0.72rem;
        font-weight: 700;
        color: #fcd34d;
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.32);
        margin-bottom: 6px;
      }

      body.light-theme .spr-modal-badge,
      [data-theme="light"] .spr-modal-badge {
        color: #b45309;
        background: rgba(245, 158, 11, 0.12);
      }

      .spr-modal-title {
        margin: 0;
        font-family: var(--font-heading, inherit);
        font-size: 1.15rem;
        font-weight: 800;
      }

      .spr-modal-close {
        appearance: none;
        width: 32px;
        height: 32px;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(255, 255, 255, 0.06);
        color: inherit;
        font-size: 1rem;
        cursor: pointer;
        flex-shrink: 0;
      }

      body.light-theme .spr-modal-close,
      [data-theme="light"] .spr-modal-close {
        border-color: rgba(15, 23, 42, 0.14);
        background: rgba(15, 23, 42, 0.05);
      }

      .spr-modal-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 14px;
      }

      .spr-modal-tab {
        appearance: none;
        padding: 6px 11px;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.04);
        color: inherit;
        font-family: inherit;
        font-size: 0.76rem;
        font-weight: 700;
        cursor: pointer;
      }

      .spr-modal-tab.is-active {
        border-color: rgba(245, 158, 11, 0.5);
        background: rgba(245, 158, 11, 0.18);
        color: #fde68a;
      }

      body.light-theme .spr-modal-tab,
      [data-theme="light"] .spr-modal-tab {
        border-color: rgba(15, 23, 42, 0.12);
        background: rgba(15, 23, 42, 0.04);
      }

      body.light-theme .spr-modal-tab.is-active,
      [data-theme="light"] .spr-modal-tab.is-active {
        color: #92400e;
        background: rgba(245, 158, 11, 0.16);
        border-color: rgba(217, 119, 6, 0.45);
      }

      .spr-modal-lead {
        margin: 0 0 10px 0;
        font-size: 0.9rem;
        font-weight: 600;
        line-height: 1.5;
      }

      .spr-modal-detail {
        margin: 0 0 12px 0;
        font-size: 0.85rem;
        line-height: 1.62;
        color: var(--text-secondary, #cbd5e1);
      }

      body.light-theme .spr-modal-detail,
      [data-theme="light"] .spr-modal-detail {
        color: #475569;
      }

      .spr-modal-practice {
        padding: 10px 13px;
        border-radius: 12px;
        border-left: 3px solid #10b981;
        background: rgba(16, 185, 129, 0.09);
        font-size: 0.81rem;
        line-height: 1.5;
      }

      @media (max-width: 820px) {
        .${RIBBON_CLASS} {
          padding: 15px;
          margin-bottom: 18px;
          border-radius: 16px;
        }

        .spr-grid {
          grid-template-columns: 1fr;
          gap: 13px;
        }
      }

      @media (max-width: 540px) {
        .spr-form {
          flex-direction: column;
          align-items: stretch;
        }

        .spr-btn-save {
          width: 100%;
        }

        .spr-stage-btn[data-spr-tooltip]::after {
          display: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // =========================================================================
  // Stage Explanation Modal
  // =========================================================================

  function ensureStageModal() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'spr-modal-title');
    modal.innerHTML = '<div class="spr-modal-card"></div>';

    modal.addEventListener('click', (e) => {
      if (e.target === modal || (e.target.closest && e.target.closest('[data-spr-modal-close]'))) {
        closeStageModal();
        return;
      }
      const tabBtn = e.target.closest ? e.target.closest('[data-spr-modal-stage]') : null;
      if (tabBtn) {
        openStageModal(tabBtn.getAttribute('data-spr-modal-stage'));
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeStageModal();
      }
    });

    document.body.appendChild(modal);
    return modal;
  }

  function openStageModal(stageId) {
    const stage = SEFER_STAGES.find((s) => s.id === stageId) || SEFER_STAGES[0];
    const modal = ensureStageModal();
    const card = modal.querySelector('.spr-modal-card');
    if (!card) return;

    const tabsHtml = SEFER_STAGES.map(
      (s) => `
        <button
          type="button"
          class="spr-modal-tab${s.id === stage.id ? ' is-active' : ''}"
          data-spr-modal-stage="${esc(s.id)}"
        >
          ${esc(s.shortTitle)}
        </button>
      `
    ).join('');

    card.innerHTML = `
      <div class="spr-modal-head">
        <div>
          <span class="spr-modal-badge">🧭 Tasavvufî Sefer Merhalesi • ${esc(stage.badge)}</span>
          <h3 class="spr-modal-title" id="spr-modal-title">${esc(stage.title)}</h3>
        </div>
        <button type="button" class="spr-modal-close" data-spr-modal-close aria-label="Kapat">✕</button>
      </div>
      <div class="spr-modal-tabs" role="tablist" aria-label="Sefer merhaleleri">
        ${tabsHtml}
      </div>
      <p class="spr-modal-lead">${esc(stage.summary)}</p>
      <p class="spr-modal-detail">${esc(stage.detail)}</p>
      <div class="spr-modal-practice">${esc(stage.practice)}</div>
    `;

    modal.classList.add('is-open');
    const closeBtn = card.querySelector('[data-spr-modal-close]');
    if (closeBtn) closeBtn.focus();
  }

  function closeStageModal() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) {
      modal.classList.remove('is-open');
    }
  }

  // =========================================================================
  // Ribbon Markup & Events
  // =========================================================================

  function buildRibbonMarkup(model, currentStageId) {
    const stageHtml = SEFER_STAGES.map((stage, idx) => {
      const isCurrent = stage.id === currentStageId;
      const sep = idx < SEFER_STAGES.length - 1 ? '<span class="spr-stage-sep" aria-hidden="true">•</span>' : '';
      return `
        <button
          type="button"
          class="spr-stage-btn${isCurrent ? ' is-current' : ''}"
          data-spr-stage="${esc(stage.id)}"
          data-spr-tooltip="${esc(stage.tooltip)}"
          title="${esc(stage.title)}"
        >
          <span>${esc(stage.shortTitle)}</span>
        </button>
        ${sep}
      `;
    }).join('');

    const countText =
      model.reflectionCount > 0
        ? `📓 ${model.reflectionCount} tefekkür notu`
        : '📓 İlk tefekkür notunu bırak';

    return `
      <div class="spr-top-bar">
        <div class="spr-eyebrow-group">
          <span class="spr-eyebrow">🌙 Günün İrfan &amp; Felsefe Şeridi</span>
          <span class="spr-date-pill">${esc(model.dateLabel)}</span>
        </div>
        <div class="spr-stages" aria-label="Sefer Merhalesi Göstergesi">
          <span class="spr-stage-label">🧭 Sefer Merhalesi:</span>
          ${stageHtml}
        </div>
      </div>

      <div class="spr-grid">
        <div class="spr-panel" aria-label="Günün İrfan Beyiti ve Hikmeti">
          <div class="spr-panel-head">
            <h4 class="spr-panel-title">🌙 Günün İrfan Beyiti &amp; Hikmeti</h4>
            <div class="spr-couplet-meta">
              <span class="spr-index-badge" data-spr-couplet-idx>${model.coupletIndex + 1} / ${model.coupletTotal}</span>
              <button type="button" class="spr-btn-mini" data-spr-action="next-couplet">🔄 Yeni Beyit</button>
            </div>
          </div>

          <blockquote class="spr-couplet-quote" data-spr-couplet-text>“${esc(model.couplet.text)}”</blockquote>

          <div class="spr-couplet-footer">
            <div class="spr-author-row">
              <span class="spr-author-name" data-spr-couplet-author>— ${esc(model.couplet.author)}</span>
              <span class="spr-author-source" data-spr-couplet-source>${esc(model.couplet.source)}</span>
            </div>
            <p class="spr-wisdom-note" data-spr-couplet-wisdom>${esc(model.couplet.wisdom)}</p>
          </div>
        </div>

        <div class="spr-panel" aria-label="Günün Muhasebe Sorusu">
          <div class="spr-panel-head">
            <h4 class="spr-panel-title">✒️ Günün Muhasebe Sorusu</h4>
            <span class="spr-saved-count" data-spr-saved-count>${esc(countText)}</span>
          </div>

          <p class="spr-question-text" data-spr-question>${esc(model.question)}</p>

          <form class="spr-form" data-spr-form>
            <input
              type="text"
              class="spr-input"
              data-spr-input
              maxlength="320"
              placeholder="Tefekkür notunu yaz..."
              aria-label="Günün muhasebe sorusu için tefekkür notu"
            />
            <button type="submit" class="spr-btn-save" data-spr-save-btn>📝 Deftere İşle</button>
          </form>

          <div class="spr-jumps-row">
            <div class="spr-jumps-group">
              <button type="button" class="spr-jump-btn" data-spr-view="irfanAtlas">🕌 İrfan Atlası</button>
              <button type="button" class="spr-jump-btn" data-spr-view="hikmetMeclisi">📜 Hikmet Meclisi</button>
              <button type="button" class="spr-jump-btn" data-spr-view="halvet">🕯️ Halvet Odası</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function updateCoupletDisplay(ribbon) {
    const model = getDailyModel();
    const idxEl = ribbon.querySelector('[data-spr-couplet-idx]');
    const textEl = ribbon.querySelector('[data-spr-couplet-text]');
    const authorEl = ribbon.querySelector('[data-spr-couplet-author]');
    const sourceEl = ribbon.querySelector('[data-spr-couplet-source]');
    const wisdomEl = ribbon.querySelector('[data-spr-couplet-wisdom]');

    if (idxEl) idxEl.textContent = `${model.coupletIndex + 1} / ${model.coupletTotal}`;
    if (textEl) textEl.textContent = `“${model.couplet.text}”`;
    if (authorEl) authorEl.textContent = `— ${model.couplet.author}`;
    if (sourceEl) sourceEl.textContent = model.couplet.source;
    if (wisdomEl) wisdomEl.textContent = model.couplet.wisdom;
  }

  function bindRibbonEvents(ribbon, ctx) {
    if (!ribbon || ribbon.dataset.sprBound === '1') return;
    ribbon.dataset.sprBound = '1';

    ribbon.addEventListener('click', (e) => {
      const stageBtn = e.target && e.target.closest ? e.target.closest('[data-spr-stage]') : null;
      if (stageBtn) {
        const stageId = stageBtn.getAttribute('data-spr-stage');
        activeStageId = stageId || activeStageId;
        ribbon.querySelectorAll('[data-spr-stage]').forEach((btn) => {
          btn.classList.toggle('is-current', btn.getAttribute('data-spr-stage') === activeStageId);
        });
        openStageModal(activeStageId);
        return;
      }

      const nextCoupletBtn = e.target && e.target.closest ? e.target.closest('[data-spr-action="next-couplet"]') : null;
      if (nextCoupletBtn) {
        coupletOffset += 1;
        updateCoupletDisplay(ribbon);
        return;
      }

      const jumpBtn = e.target && e.target.closest ? e.target.closest('[data-spr-view]') : null;
      if (jumpBtn) {
        const viewName = jumpBtn.getAttribute('data-spr-view');
        if (viewName) openTargetView(ctx, viewName);
      }
    });

    ribbon.addEventListener('submit', (e) => {
      const form = e.target && e.target.closest ? e.target.closest('[data-spr-form]') : null;
      if (!form) return;
      e.preventDefault();

      const input = ribbon.querySelector('[data-spr-input]');
      const saveBtn = ribbon.querySelector('[data-spr-save-btn]');
      const countEl = ribbon.querySelector('[data-spr-saved-count]');
      const noteText = input ? input.value.trim() : '';

      if (!noteText) {
        notify(ctx, '✒️ Lütfen önce kısa bir tefekkür notu yazın.');
        if (input) input.focus();
        return;
      }

      const model = getDailyModel();
      const entry = {
        id: `muhasebe_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        cityKey: '',
        cityName: 'Günün Muhasebesi',
        plate: null,
        region: 'Tefekkür & İrfan',
        mode: 'sufi',
        styleLabel: 'Günün Muhasebe Sorusu',
        question: model.question,
        notes: noteText,
        title: `✒️ Tefekkür Notu — ${model.dateLabel}`,
        content: `**Soru:** ${model.question}\n\n**Tefekkür Notu:** ${noteText}`,
        model: 'philosophyRibbon',
        source: 'philosophyRibbon',
        createdAt: new Date().toISOString()
      };

      const res = appendJournalEntry(entry);
      if (res.saved) {
        lastSavedCount = res.count;
        if (input) input.value = '';
        if (countEl) {
          const all = readJournalEntries().filter((item) => item && item.source === 'philosophyRibbon').length;
          countEl.textContent = `📓 ${all} tefekkür notu`;
        }
        if (saveBtn) {
          const prevLabel = saveBtn.textContent;
          saveBtn.textContent = '✓ Deftere İşlendi';
          setTimeout(() => {
            if (saveBtn.isConnected) saveBtn.textContent = prevLabel;
          }, 1800);
        }
        notify(ctx, `📝 Tefekkür notun Seyir Defterim'e işlendi! (Toplam ${res.count} kayıt)`);
      } else {
        notify(ctx, '⚠️ Not yerel depolamaya kaydedilemedi.');
      }
    });
  }

  // =========================================================================
  // Mounting & MutationObserver Lifecycle
  // =========================================================================

  function insertRibbonAtAnchor(viewport, ribbon) {
    const dailyCard = viewport.querySelector('.daily-spotlight-card');
    if (dailyCard) {
      dailyCard.insertAdjacentElement('afterend', ribbon);
      return;
    }
    const storiesBar = viewport.querySelector('.anadolu-stories-bar');
    if (storiesBar) {
      storiesBar.insertAdjacentElement('afterend', ribbon);
      return;
    }
    viewport.prepend(ribbon);
  }

  function ensureRibbonPosition(viewport, ribbon) {
    const dailyCard = viewport.querySelector('.daily-spotlight-card');
    if (dailyCard && dailyCard.nextElementSibling !== ribbon && !isRepositioning) {
      isRepositioning = true;
      try {
        dailyCard.insertAdjacentElement('afterend', ribbon);
      } finally {
        isRepositioning = false;
      }
    }
  }

  function mountRibbon(viewport, ctx) {
    if (!viewport || !ctx) return;
    if (viewport.querySelector(`.${RIBBON_CLASS}`)) return;

    activeStageId = activeStageId || getActiveStageByProgress(ctx);
    const model = getDailyModel();

    const ribbon = document.createElement('section');
    ribbon.className = RIBBON_CLASS;
    ribbon.setAttribute('aria-label', 'Günün İrfan ve Felsefe Şeridi');
    ribbon.setAttribute('data-spr-date', model.dateKey);
    ribbon.innerHTML = buildRibbonMarkup(model, activeStageId);
    bindRibbonEvents(ribbon, ctx);

    insertRibbonAtAnchor(viewport, ribbon);
  }

  function refreshRibbonIfDateChanged(viewport, ctx) {
    const existing = viewport ? viewport.querySelector(`.${RIBBON_CLASS}`) : null;
    if (!existing) return;
    const todayKey = getTodayDateKey();
    if (existing.getAttribute('data-spr-date') === todayKey) return;

    coupletOffset = 0;
    const model = getDailyModel();
    existing.setAttribute('data-spr-date', model.dateKey);
    existing.innerHTML = buildRibbonMarkup(model, activeStageId || getActiveStageByProgress(ctx));
  }

  function maybeMountOnDashboard(viewport, ctx) {
    const safeCtx = ctx || activeCtx;
    if (!viewport || !safeCtx || !safeCtx.state) return;
    if (safeCtx.state.currentView !== 'dashboard') return;

    const existing = viewport.querySelector(`.${RIBBON_CLASS}`);
    if (!existing) {
      mountRibbon(viewport, safeCtx);
    } else {
      ensureRibbonPosition(viewport, existing);
      refreshRibbonIfDateChanged(viewport, safeCtx);
    }
  }

  function scheduleMidnightRefresh() {
    if (midnightTimerId) {
      clearTimeout(midnightTimerId);
      midnightTimerId = null;
    }

    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      2,
      0
    );
    const delayMs = Math.max(1000, nextMidnight.getTime() - now.getTime());

    midnightTimerId = setTimeout(() => {
      coupletOffset = 0;
      const viewport = document.getElementById('viewport-content');
      if (viewport && activeCtx && activeCtx.state && activeCtx.state.currentView === 'dashboard') {
        refreshRibbonIfDateChanged(viewport, activeCtx);
      }
      scheduleMidnightRefresh();
    }, delayMs);
  }

  function initViewportObserver(ctx) {
    const viewport = document.getElementById('viewport-content');
    if (!viewport) return;

    if (viewportObserver) {
      viewportObserver.disconnect();
    }

    if (typeof MutationObserver === 'function') {
      viewportObserver = new MutationObserver(() => {
        if (isRepositioning) return;
        maybeMountOnDashboard(viewport, activeCtx || ctx);
      });
      viewportObserver.observe(viewport, { childList: true });
    }

    maybeMountOnDashboard(viewport, ctx);
  }

  function init(ctx) {
    activeCtx = ctx || {};
    activeStageId = getActiveStageByProgress(activeCtx);
    injectStyles();
    initViewportObserver(activeCtx);
    scheduleMidnightRefresh();
  }

  window.SEYYAH_MODULES.philosophyRibbon = {
    init
  };
})();
