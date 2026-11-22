/**
 * Anadolu Seyahatnamesi — AI Evliya Çelebi Seyahatname Yazarı Stüdyosu
 * Live word-by-word streaming travelogue studio powered by window.SEYYAH_AI.stream
 * with graceful fallback to window.SEYYAH_AI.ask, direct Gemini SSE, and offline literary templates.
 * Registers on: window.SEYYAH_MODULES.aiWriter = { render(container, ctx) }
 */
(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-ai-writer-styles';
  const JOURNAL_ENTRIES_STORAGE = 'dijital_seyyah_journal_entries';
  const PERSONAL_JOURNAL_STORAGE = 'dijital_seyyah_personal_journal_v1';
  const GEMINI_KEY_STORAGE = 'dijital_seyyah_gemini_api_key';
  const GEMINI_MODEL_STORAGE = 'dijital_seyyah_gemini_model';
  const DEFAULT_GEMINI_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash'
  ];

  const WRITING_STYLES = [
    {
      id: 'evliya',
      icon: '📜',
      label: '📜 Evliya Çelebi Klasik Üslubu',
      shortTitle: 'Evliya Çelebi Klasik Üslubu',
      badge: '17. yy Seyahatname Geleneği',
      desc: 'Kadim seyir dili, zarif tasvirler ve hikmetli nazar',
      promptDirective:
        '17. yüzyıl Osmanlı seyyahı Evliya Çelebi\'nin Seyahatname geleneğinden ilham alan, günümüz okurunun da keyifle okuyabileceği zarif, akıcı ve edebî bir üslupla yaz. ' +
        '"Seyahat-i pür-ibret", "âb u havası latîf", "ey aziz kârî", "dârü\'l-kütüb", "ni\'met-i nefîse" gibi klasik deyişleri ölçülü ve estetik biçimde harmanla.'
    },
    {
      id: 'modern',
      icon: '✨',
      label: '✨ Modern Minimalist Gezi Blogu',
      shortTitle: 'Modern Minimalist Gezi Blogu',
      badge: 'Yavaş Seyahat & Editoryal',
      desc: 'Sade, duyusal, ışık ve mekân odaklı çağdaş anlatı',
      promptDirective:
        'Kinfolk veya Monocle tadında modern, minimalist, duyusal ayrıntılara (sabah ışığı, taş dokusu, kahve/çorba buharı, kütüphane sessizliği) odaklanan, ' +
        'kısa ve vurucu paragraflardan oluşan zarif bir çağdaş gezi blogu yazısı kaleme al.'
    },
    {
      id: 'sufi',
      icon: '🕊️',
      label: '🕊️ Tasavvufi Tefekkür Denemesi',
      shortTitle: 'Tasavvufi Tefekkür Denemesi',
      badge: 'Sefer Der Vatan',
      desc: 'İçsel sükûnet, kalp gözü ve Anadolu irfanı',
      promptDirective:
        '"Sefer der vatan" (vatanda/iç dünyada yolculuk) bakış açısıyla, şehrin dış coğrafyasını insanın iç âlemiyle buluşturan, ' +
        'sükûnet, şükür, hikmet ve derin tefekkür yüklü lirik bir deneme yaz.'
    },
    {
      id: 'social',
      icon: '📱',
      label: '📱 Sosyal Medya / LinkedIn Hikayesi',
      shortTitle: 'Sosyal Medya / LinkedIn Hikayesi',
      badge: 'İlham Veren Mikro Hikâye',
      desc: 'Güçlü açılış, akıcı ritim ve paylaşılabilir kapanış',
      promptDirective:
        'LinkedIn ve nitelikli sosyal medya okurları için çarpıcı bir ilk cümleyle başlayan, kısa ve okunaklı satır aralıklarına sahip, ' +
        '"5 Gün Kuralı" ve kütüphane çalışma disiplinini gerçekçi bir seyyah hikâyesiyle anlatan, sonunda düşündürücü bir soru ve en fazla 4 etiket bulunan paylaşım yaz.'
    }
  ];

  const UNIVERSAL_CHIPS = [
    'sabah çorbası',
    'kütüphane sessizliği',
    'taş köprüde gün batımı',
    'tarihî çarşıda ikindi çayı',
    'GSB yurt akşamı ve yol defteri',
    'yağmur sonrası serin sokaklar'
  ];

  const uiState = {
    selectedCityKey: '',
    searchQuery: '',
    styleId: 'evliya',
    notes: '',
    outputText: '',
    outputCityKey: '',
    outputStyleId: 'evliya',
    outputSource: '',
    isStreaming: false,
    streamRunId: 0,
    abortController: null
  };

  // ---------------------------------------------------------------------------
  // Safe Utility Helpers
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

  function stripMdSyntax(str) {
    return String(str || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/[*_`]/g, '').trim();
  }

  function countWords(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  }

  function countChars(text) {
    return String(text || '').trim().length;
  }

  function formatDurationMinutes(words) {
    if (!words) return '0 dk';
    const mins = Math.max(1, Math.round(words / 180));
    return `~${mins} dk okuma`;
  }

  function getBannerPath(province, cityKey) {
    if (province && province.banner_rel) return province.banner_rel;
    return `${cityKey}/banner.jpg`;
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
    }, 2600);
  }

  async function copyToClipboard(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {}
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
    } catch (e) {
      return false;
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
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  }

  function appendJournalEntry(entry) {
    let savedEntries = false;
    let count = 0;
    try {
      const raw = localStorage.getItem(JOURNAL_ENTRIES_STORAGE);
      let entries = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) entries = parsed;
      }
      entries.unshift(entry);
      localStorage.setItem(JOURNAL_ENTRIES_STORAGE, JSON.stringify(entries));
      savedEntries = true;
      count = entries.length;
    } catch (e) {}

    // Also save directly into personal journal (dijital_seyyah_personal_journal_v1) for the selected city
    let savedPersonal = false;
    try {
      const rawPJ = localStorage.getItem(PERSONAL_JOURNAL_STORAGE);
      let pj = rawPJ ? JSON.parse(rawPJ) : null;
      if (!pj || typeof pj !== 'object' || Array.isArray(pj)) {
        pj = { visited: [], notes: {}, dates: {}, ratings: {}, tags: {} };
      }
      if (!Array.isArray(pj.visited)) pj.visited = [];
      if (!pj.notes || typeof pj.notes !== 'object') pj.notes = {};
      if (!pj.dates || typeof pj.dates !== 'object') pj.dates = {};
      if (!pj.ratings || typeof pj.ratings !== 'object') pj.ratings = {};
      if (!pj.tags || typeof pj.tags !== 'object') pj.tags = {};

      const ck = entry.cityKey;
      if (ck) {
        const todayIso = new Date().toISOString().slice(0, 10);
        const stamp = `[AI Seyahatname · ${entry.styleLabel || entry.mode} · ${todayIso}]`;
        const prevNote = typeof pj.notes[ck] === 'string' ? pj.notes[ck].trim() : '';
        pj.notes[ck] = prevNote
          ? `${prevNote}\n\n---\n${stamp}\n${entry.content}`
          : `${stamp}\n${entry.content}`;
        if (!pj.dates[ck]) {
          pj.dates[ck] = todayIso;
        }
        const curTags = Array.isArray(pj.tags[ck]) ? pj.tags[ck] : [];
        if (!curTags.includes('kutuphane')) curTags.push('kutuphane');
        if (!curTags.includes('tarih')) curTags.push('tarih');
        pj.tags[ck] = curTags;
        localStorage.setItem(PERSONAL_JOURNAL_STORAGE, JSON.stringify(pj));
        savedPersonal = true;
      }
    } catch (e) {}

    return { saved: savedEntries || savedPersonal, count };
  }

  function getJournalEntryCount() {
    let entriesCount = 0;
    try {
      const raw = localStorage.getItem(JOURNAL_ENTRIES_STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) entriesCount = parsed.length;
      }
    } catch (e) {}
    try {
      const rawPJ = localStorage.getItem(PERSONAL_JOURNAL_STORAGE);
      if (rawPJ) {
        const pj = JSON.parse(rawPJ);
        if (pj && pj.notes && typeof pj.notes === 'object') {
          const noteCount = Object.keys(pj.notes).length;
          if (noteCount > entriesCount) return noteCount;
        }
      }
    } catch (e) {}
    return entriesCount;
  }

  function getSortedProvinceKeys(provinces) {
    return Object.keys(provinces || {}).sort((a, b) => {
      const pa = Number(provinces[a] && provinces[a].plate) || 999;
      const pb = Number(provinces[b] && provinces[b].plate) || 999;
      if (pa !== pb) return pa - pb;
      return String((provinces[a] && provinces[a].name) || a).localeCompare(
        String((provinces[b] && provinces[b].name) || b),
        'tr'
      );
    });
  }

  // ---------------------------------------------------------------------------
  // Markdown Renderer (with live blinking cursor inside last editorial element)
  // ---------------------------------------------------------------------------
  function formatInlineMd(text, esc) {
    return esc(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
  }

  function renderEditorialMarkdown(rawText, esc, showCursor) {
    const cursorHtml = showCursor
      ? '<span class="aiw-stream-cursor" aria-hidden="true"></span>'
      : '';
    const normalized = String(rawText || '').replace(/\r\n/g, '\n');
    if (!normalized.trim()) {
      return showCursor
        ? `<p class="aiw-md-para">${cursorHtml}</p>`
        : '';
    }

    const lines = normalized.split('\n');
    const blocks = [];
    let listType = null;
    let listItems = [];

    const flushList = () => {
      if (listType && listItems.length) {
        blocks.push({ type: listType, items: listItems.slice() });
      }
      listType = null;
      listItems = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        flushList();
        continue;
      }

      const hMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (hMatch) {
        flushList();
        blocks.push({
          type: 'heading',
          level: hMatch[1].length,
          text: hMatch[2]
        });
        continue;
      }

      const quoteMatch = line.match(/^>\s+(.+)$/);
      if (quoteMatch) {
        flushList();
        blocks.push({ type: 'quote', text: quoteMatch[1] });
        continue;
      }

      const ulMatch = line.match(/^[-*•]\s+(.+)$/);
      if (ulMatch) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listItems.push(ulMatch[1]);
        continue;
      }

      const olMatch = line.match(/^\d+[.)]\s+(.+)$/);
      if (olMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        listItems.push(olMatch[1]);
        continue;
      }

      if (/^---+$/.test(line)) {
        flushList();
        blocks.push({ type: 'hr' });
        continue;
      }

      flushList();
      blocks.push({ type: 'para', text: line });
    }
    flushList();

    let firstParaSeen = false;
    return blocks
      .map((blk, idx) => {
        const isLast = idx === blocks.length - 1;
        const tail = isLast ? cursorHtml : '';

        if (blk.type === 'heading') {
          const cls = blk.level === 1 ? 'aiw-md-title' : 'aiw-md-heading';
          return `<h4 class="${cls}">${formatInlineMd(blk.text, esc)}${tail}</h4>`;
        }
        if (blk.type === 'quote') {
          return `<blockquote class="aiw-md-quote">${formatInlineMd(blk.text, esc)}${tail}</blockquote>`;
        }
        if (blk.type === 'hr') {
          return `<div class="aiw-md-ornament" aria-hidden="true">⸻ ✦ ⸻</div>${tail}`;
        }
        if (blk.type === 'ul' || blk.type === 'ol') {
          const itemsHtml = blk.items
            .map((it, itemIdx) => {
              const itemTail = isLast && itemIdx === blk.items.length - 1 ? cursorHtml : '';
              return `<li>${formatInlineMd(it, esc)}${itemTail}</li>`;
            })
            .join('');
          return `<${blk.type} class="aiw-md-list">${itemsHtml}</${blk.type}>`;
        }

        const dropCapClass = !firstParaSeen ? ' is-lead' : '';
        firstParaSeen = true;
        return `<p class="aiw-md-para${dropCapClass}">${formatInlineMd(blk.text, esc)}${tail}</p>`;
      })
      .join('');
  }

  // ---------------------------------------------------------------------------
  // Prompt & Offline Literary Template Builders
  // ---------------------------------------------------------------------------
  function buildProvinceContextText(province, cityKey) {
    const landmarks = Array.isArray(province.landmarks) && province.landmarks.length
      ? province.landmarks.join(', ')
      : 'Şehir meydanı ve tarihî merkez';
    const specialties = Array.isArray(province.specialties) && province.specialties.length
      ? province.specialties.join(', ')
      : 'Yöresel Anadolu mutfağı';
    const library = province.custom_library || province.library || `${province.name} İl Halk Kütüphanesi`;
    const quote = province.custom_quote || province.quote || '';
    const spiritual = Array.isArray(province.spiritual_figures) && province.spiritual_figures.length
      ? province.spiritual_figures.slice(0, 2).map(stripMdSyntax).join(' | ')
      : '';
    const historySnippet = province.history ? String(province.history).slice(0, 320) : '';

    return [
      `Şehir: ${province.name} (Plaka: ${formatPlate(province.plate)}, Bölge: ${province.region || 'Anadolu'}, Anahtar: ${cityKey})`,
      `Durum: ${province.visited ? 'Ziyaret edilmiş menzil' : 'Planlanan / keşfedilecek menzil'}`,
      `Öne Çıkan Duraklar: ${landmarks}`,
      `Yöresel Lezzetler: ${specialties}`,
      `Kütüphane Ofisi: ${library}`,
      quote ? `Şehir Sözü: "${quote}"` : '',
      spiritual ? `Manevi İzler: ${spiritual}` : '',
      historySnippet ? `Tarihsel Arka Plan: ${historySnippet}` : ''
    ]
      .filter(Boolean)
      .join('\n');
  }

  function buildAiPrompts(province, cityKey, styleObj, notesText) {
    const cityBlock = buildProvinceContextText(province, cityKey);
    const cleanedNotes = String(notesText || '').trim();
    const systemPrompt =
      'Sen "Dijital Seyyah: Anadolu Seyahatnamesi" projesinin baş edebiyatçısı ve seyahatname yazarısın. ' +
      'Türkçeyi son derece zarif, imlâsı kusursuz, atmosferi güçlü biçimde kullanırsın. ' +
      styleObj.promptDirective +
      ' Yanıtını Markdown başlığı (# ...), akıcı paragraflar ve gerekiyorsa kısa bir alıntı (> ...) ile biçimlendir. Yaklaşık 240-360 kelime arasında yaz.';

    const userPrompt =
      `${province.name} şehri hakkında "${styleObj.shortTitle}" tarzında özgün bir seyahatname bölümü yaz.\n\n` +
      (cleanedNotes
        ? `Seyyahın Kısa Yol Notları (mutlaka metnin dokusuna yedir): ${cleanedNotes}\n\n`
        : 'Seyyahın Notları: Sabahın erken saatinde şehir uyanırken kütüphane masasında derin çalışma ve gün batımında şehrin ruhunu dinleme.\n\n') +
      `Şehir Künyesi:\n${cityBlock}`;

    return { systemPrompt, userPrompt };
  }

  function parseNotesList(notesText) {
    return String(notesText || '')
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function buildOfflineTemplate(province, styleObj, notesText) {
    const name = province.name || 'Anadolu';
    const plate = formatPlate(province.plate);
    const region = province.region || 'Anadolu';
    const landmarks = Array.isArray(province.landmarks) && province.landmarks.length
      ? province.landmarks
      : ['Tarihî Merkez', 'Ulu Cami Çevresi'];
    const specialties = Array.isArray(province.specialties) && province.specialties.length
      ? province.specialties
      : ['Yöresel Çorba', 'Esnaf Sofrası'];
    const rawLibrary = province.custom_library || province.library || `${name} İl Halk Kütüphanesi`;
    const libraryName = String(rawLibrary).split(' - ')[0].trim();
    const quote = province.custom_quote || province.quote || `${name}, sabırla yürüyene kalbini açan kadim bir menzildir.`;
    const noteItems = parseNotesList(notesText);
    const notesJoined = noteItems.length
      ? noteItems.join(', ')
      : 'sabahın duru sükûneti, kütüphane sayfaları arasında geçen saatler ve akşamüstü şehir yürüyüşü';
    const firstNote = noteItems[0] || 'sabahın serinliği';
    const secondNote = noteItems[1] || 'kütüphanenin vakur sessizliği';
    const thirdNote = noteItems[2] || 'gün batımında gökyüzüne düşen kızıllık';
    const historySent = province.history
      ? String(province.history).split(/(?<=[.!?])\s+/)[0]
      : `${name}, Anadolu'nun binlerce yıllık hafızasını sokaklarında yaşatan müstesna bir şehirdir.`;
    const spiritualName = Array.isArray(province.spiritual_figures) && province.spiritual_figures[0]
      ? stripMdSyntax(String(province.spiritual_figures[0]).split(':')[0])
      : '';
    const planDay1 = Array.isArray(province.five_day_plan) && province.five_day_plan[0]
      ? stripMdSyntax(province.five_day_plan[0])
      : '';

    switch (styleObj.id) {
      case 'modern':
        return [
          `# ${name}: Yavaş Bir Günün İzinde`,
          '',
          `${plate} numaralı bu ${region} durağına vardığınızda acele etmeyi kapıda bırakmanız gerekir. ${historySent} Şehrin ilk saatleri **${firstNote}** ile başlar; kalabalık henüz uyanmadan sokaklar size gerçek yüzünü gösterir.`,
          '',
          `Öğleye doğru rotayı **${libraryName}** masalarına kırmak, yolculuğa başka bir ritim katar. Dışarıda ${landmarks[0]} çevresindeki günlük telaş akarken, içeride **${secondNote}** zihni berraklaştırır. Bir şehri yalnızca gezmekle yetinmeyip orada üretmek, mekânla kurulan bağı derinleştirir.`,
          '',
          `Akşamüstü ${landmarks[1] || landmarks[0]} civarında yürürken **${thirdNote}** günün bütün yorgunluğunu alır.${spiritualName ? ` Şehrin manevi hafızasında iz bırakan **${spiritualName}** iklimi sokakların dinginliğinde hissedilir.` : ''} Masaya gelen **${specialties[0]}**${specialties[1] ? ` ve **${specialties[1]}**` : ''} ise bu sade günün en samimi ödülüdür.`,
          '',
          `> ${quote}`,
          '',
          `- **Duraklar:** ${landmarks.slice(0, 3).join(' · ')}`,
          planDay1 ? `- **5 Gün Planı Başlangıcı:** ${planDay1}` : '',
          `- **Yol Notları:** ${notesJoined}`
        ].filter(Boolean).join('\n');

      case 'sufi':
        return [
          `# ${name} Menzilinde Sefer Der Vatan`,
          '',
          `Yolcu bazen şehir şehir gezer, fakat hakiki sefer kalbin kendi iklimine yaptığı yolculuktur. ${region} coğrafyasının vakarlı şehri **${name}**, yolcusuna daha ilk adımda **${firstNote}** ile tevazuyu fısıldar. ${historySent}`,
          '',
          `${landmarks[0]} gölgesinde durup taşların hafızasını dinleyen insan, zamanın aslında geçmediğini; sadece insanın içinden aktığını fark eder.${spiritualName ? ` **${spiritualName}** nefesinin sindiği bu topraklarda her kubbe ve her taş avlu bir irfan dersidir.` : ''} Sonra **${libraryName}** kapısından içeri girildiğinde **${secondNote}**, dış dünyanın gürültüsünü susturan bir dergâh sükûnetine dönüşür.`,
          '',
          `Akşam vakti **${thirdNote}** ufku boyarken, şükür sofrasında tadılan **${specialties[0]}** bize her nimetin bir emanet olduğunu hatırlatır. Zira her menzil, insanı kendi özüne bir adım daha yaklaştırdığı ölçüde bereketlidir.`,
          '',
          `> "${quote}"`,
          '',
          `Yolun özeti: *${notesJoined}.*`
        ].join('\n');

      case 'social':
        return [
          `# ${name} (${plate}) Notları: 5 Gün Kuralı ve Bir Kütüphane Masası 🧭`,
          '',
          `Bir şehri 3 saatte fotoğraflayıp geçmek yerine 5 gün yaşamak nasıl hissettiriyor? Bugünkü durağım **${region}** kalbindeki **${name}** oldu. ${historySent}`,
          '',
          `Güne **${firstNote}** eşliğinde başladım. Ardından bilgisayarımı alıp **${libraryName}** köşesine geçtim; **${secondNote}** içinde derin odakla çalışmak bana bir kez daha şunu gösterdi: Yolda olmak üretmeye engel değil, aksine zihni tazeleyen en güçlü kaynak.`,
          '',
          `Öğleden sonra **${landmarks[0]}** ve **${landmarks[1] || landmarks[0]}** çevresinde yürüyüş, akşamına **${specialties[0]}** tadımı ve finalde **${thirdNote}**...`,
          '',
          `> ${quote}`,
          '',
          `Sizin bir şehirde en çok huzur bulduğunuz çalışma veya yürüyüş durağı neresi?`,
          '',
          `#DijitalSeyyah #AnadoluSeyahatnamesi #${name.replace(/\s+/g, '')} #5GunKurali`
        ].join('\n');

      case 'evliya':
      default:
        return [
          `# Seyahat-i ${name}-i Şerîf (${plate} — ${region})`,
          '',
          `Ey aziz kârî! Bu hakîr-i pür-taksîr, ${region} ikliminin müstesna beldelerinden **${name}** diyarına kadem bastıkta, daha seher vaktinde **${firstNote}** ile ruhumuz tazelendi. ${historySent} Âb u havası latîf, ahalisi mihmanperver ve sokakları dahi ibret-nümâ bir şehirdir.`,
          '',
          `Evvelâ şehrin dârü'l-kütübü olan **${libraryName}** makamına varıp kalem-i âcizânemizi elimize aldık. Anda hüküm süren **${secondNote}**, gönül aynamızı cilâlayıp ilim ve tefekkür meclisine kapı araladı. Ba'dehu **${landmarks[0]}** ve **${landmarks[1] || landmarks[0]}** misali âsâr-ı kadîmeyi temaşa eyledik ki her bir taşı ecdâd yadigârıdır.${spiritualName ? ` Husûsan **${spiritualName}** hazretlerinin mânevî feyzi bu beldenin üzerinde bir kubbe-i nur misali parıldar.` : ''}`,
          '',
          `Gurûb-ı şems vaktinde **${thirdNote}** manzarasına nazar kılıp, ni'met-i nefîseden **${specialties[0]}**${specialties[1] ? ' ve **' + specialties[1] + '**' : ''} ile şükür eyledik.`,
          '',
          `> "${quote}"`,
          '',
          `Bu menzilde deftere düşülen yâdigâr satırlar bunlardır: *${notesJoined}.*`
        ].join('\n');
    }
  }

  // ---------------------------------------------------------------------------
  // AI Streaming Engine (SEYYAH_AI.stream -> ask -> Gemini SSE -> Offline Template)
  // ---------------------------------------------------------------------------
  function normalizeChunkUpdate(prevText, arg1, arg2) {
    if (typeof arg2 === 'string' && arg2.length >= prevText.length) {
      return arg2;
    }
    if (arg1 && typeof arg1 === 'object') {
      if (typeof arg1.fullText === 'string') return arg1.fullText;
      if (typeof arg1.text === 'string') {
        return prevText && arg1.text.startsWith(prevText) ? arg1.text : prevText + arg1.text;
      }
      if (typeof arg1.delta === 'string') return prevText + arg1.delta;
      return prevText;
    }
    if (typeof arg1 === 'string') {
      if (!prevText) return arg1;
      if (arg1.length > prevText.length && arg1.startsWith(prevText)) {
        return arg1;
      }
      return prevText + arg1;
    }
    return prevText;
  }

  function waitMs(ms, signal) {
    return new Promise((resolve, reject) => {
      if (signal && signal.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      const timer = setTimeout(() => {
        if (signal) signal.removeEventListener('abort', onAbort);
        resolve();
      }, ms);
      function onAbort() {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      }
      if (signal) {
        signal.addEventListener('abort', onAbort, { once: true });
      }
    });
  }

  async function streamWordsSmoothly(fullText, onUpdate, signal) {
    const tokens = String(fullText || '').match(/\S+\s*|\n+/g) || [String(fullText || '')];
    let acc = '';
    for (let i = 0; i < tokens.length; i++) {
      if (signal && signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      acc += tokens[i];
      onUpdate(acc);
      const delay = tokens[i].includes('\n') ? 38 : 22 + Math.floor(Math.random() * 18);
      await waitMs(delay, signal);
    }
    return acc;
  }

  async function consumeStreamResult(ret, accRef, onUpdate, signal) {
    if (ret && typeof ret[Symbol.asyncIterator] === 'function') {
      for await (const part of ret) {
        if (signal && signal.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        accRef.text = normalizeChunkUpdate(accRef.text, part);
        onUpdate(accRef.text);
      }
      return { text: accRef.text, model: '' };
    }

    const resolved = await ret;
    const modelName = (resolved && typeof resolved.model === 'string') ? resolved.model : '';
    if (accRef.text && accRef.text.trim()) {
      return { text: accRef.text, model: modelName };
    }
    if (typeof resolved === 'string' && resolved.trim()) {
      const streamed = await streamWordsSmoothly(resolved.trim(), onUpdate, signal);
      return { text: streamed, model: modelName };
    }
    if (resolved && typeof resolved.text === 'string' && resolved.text.trim()) {
      const streamed = await streamWordsSmoothly(resolved.text.trim(), onUpdate, signal);
      return { text: streamed, model: modelName };
    }
    return { text: '', model: modelName };
  }

  async function trySeyyahAiStream(prompt, systemPrompt, onUpdate, signal) {
    const ai = window.SEYYAH_AI;
    if (!ai || typeof ai.stream !== 'function') {
      return { ok: false, reason: 'missing' };
    }
    if (typeof ai.hasKey === 'function' && !ai.hasKey()) {
      return { ok: false, reason: 'NO_API_KEY' };
    }

    const accRef = { text: '' };
    const handleChunk = (arg1, arg2) => {
      if (signal && signal.aborted) return;
      const next = normalizeChunkUpdate(accRef.text, arg1, arg2);
      if (next !== accRef.text) {
        accRef.text = next;
        onUpdate(accRef.text);
      }
    };

    const opts = {
      prompt,
      system: systemPrompt,
      systemPrompt,
      temperature: 0.85,
      maxTokens: 1600,
      signal,
      onChunk: handleChunk,
      onToken: handleChunk
    };

    const attempts = [
      () => ai.stream(opts),
      () => ai.stream(prompt, opts),
      () => ai.stream(prompt, handleChunk, opts)
    ];

    for (let i = 0; i < attempts.length; i++) {
      if (signal && signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      accRef.text = '';
      try {
        const res = await consumeStreamResult(attempts[i](), accRef, onUpdate, signal);
        if (res.text && res.text.trim()) {
          const badge = res.model ? `⚡ SEYYAH_AI (${res.model})` : '⚡ SEYYAH_AI.stream';
          return { ok: true, text: res.text.trim(), source: badge };
        }
      } catch (err) {
        if (err && err.name === 'AbortError') throw err;
        if (err && err.code === 'NO_API_KEY') {
          return { ok: false, reason: 'NO_API_KEY' };
        }
        const msg = err && err.message ? err.message : '';
        const isSignatureErr = err instanceof TypeError || /prompt|callback|function/i.test(msg);
        if (!accRef.text && isSignatureErr && i < attempts.length - 1) {
          continue;
        }
        if (accRef.text && accRef.text.trim()) {
          return { ok: true, text: accRef.text.trim(), source: '⚡ SEYYAH_AI.stream' };
        }
        return { ok: false, reason: msg || 'stream_failed' };
      }
    }

    return { ok: false, reason: 'empty' };
  }

  async function trySeyyahAiAsk(prompt, systemPrompt, onUpdate, signal) {
    const ai = window.SEYYAH_AI;
    if (!ai || typeof ai.ask !== 'function') {
      return { ok: false, reason: 'missing' };
    }
    if (typeof ai.hasKey === 'function' && !ai.hasKey()) {
      return { ok: false, reason: 'NO_API_KEY' };
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { ok: false, reason: 'offline' };
    }

    const opts = {
      prompt,
      system: systemPrompt,
      systemPrompt,
      temperature: 0.85,
      maxTokens: 1600,
      signal
    };

    const attempts = [
      () => ai.ask(opts),
      () => ai.ask(prompt, opts)
    ];

    for (let i = 0; i < attempts.length; i++) {
      if (signal && signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      try {
        const res = await attempts[i]();
        const text = typeof res === 'string'
          ? res.trim()
          : (res && typeof res.text === 'string' ? res.text.trim() : '');
        const modelName = res && typeof res.model === 'string' ? res.model : '';
        if (text) {
          await streamWordsSmoothly(text, onUpdate, signal);
          const badge = modelName ? `⚡ SEYYAH_AI (${modelName})` : '⚡ SEYYAH_AI.ask';
          return { ok: true, text, source: badge };
        }
      } catch (err) {
        if (err && err.name === 'AbortError') throw err;
        if (err && err.code === 'NO_API_KEY') {
          return { ok: false, reason: 'NO_API_KEY' };
        }
        const msg = err && err.message ? err.message : '';
        if (err instanceof TypeError && i < attempts.length - 1) {
          continue;
        }
        return { ok: false, reason: msg || 'ask_failed' };
      }
    }
    return { ok: false, reason: 'empty' };
  }

  async function tryDirectGeminiStream(prompt, systemPrompt, onUpdate, signal) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { ok: false, reason: 'offline' };
    }
    let apiKey = '';
    let storedModel = '';
    try {
      apiKey = (localStorage.getItem(GEMINI_KEY_STORAGE) || '').trim();
      storedModel = (localStorage.getItem(GEMINI_MODEL_STORAGE) || '').trim();
    } catch (e) {
      return { ok: false, reason: 'storage_error' };
    }
    if (!apiKey) return { ok: false, reason: 'no_key' };

    const models = [storedModel, ...DEFAULT_GEMINI_MODELS].filter(
      (m, idx, arr) => m && !/^gemini-2\.[05]/i.test(m) && arr.indexOf(m) === idx
    );

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.85, maxOutputTokens: 1600 }
          })
        });

        if (!res.ok || !res.body) continue;

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let acc = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || '';

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith('data:')) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;
            try {
              const payload = JSON.parse(jsonStr);
              const parts = payload?.candidates?.[0]?.content?.parts;
              if (Array.isArray(parts)) {
                const delta = parts.map((p) => p.text || '').join('');
                if (delta) {
                  acc += delta;
                  onUpdate(acc);
                }
              }
            } catch (e) {}
          }
        }

        if (acc.trim()) {
          return { ok: true, text: acc.trim(), source: `⚡ ${model}` };
        }
      } catch (err) {
        if (err && err.name === 'AbortError') throw err;
      }
    }

    return { ok: false, reason: 'gemini_failed' };
  }

  async function generateTravelogueStream({ province, cityKey, styleObj, notesText, onUpdate, signal }) {
    const { systemPrompt, userPrompt } = buildAiPrompts(province, cityKey, styleObj, notesText);
    const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;

    if (isOnline) {
      const viaStream = await trySeyyahAiStream(userPrompt, systemPrompt, onUpdate, signal);
      if (viaStream.ok) return viaStream;

      const viaAsk = await trySeyyahAiAsk(userPrompt, systemPrompt, onUpdate, signal);
      if (viaAsk.ok) return viaAsk;

      const viaGemini = await tryDirectGeminiStream(userPrompt, systemPrompt, onUpdate, signal);
      if (viaGemini.ok) return viaGemini;
    }

    const template = buildOfflineTemplate(province, styleObj, notesText);
    await streamWordsSmoothly(template, onUpdate, signal);
    return {
      ok: true,
      text: template,
      source: isOnline ? '🕯️ Atölye Şablonu (Anahtar/Bağlantı Yok)' : '🕯️ Çevrimdışı Atölye Modu'
    };
  }

  // ---------------------------------------------------------------------------
  // Scoped CSS Injection (Dark & Light Theme Compatible)
  // ---------------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .aiw-studio {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-bottom: 36px;
        animation: aiwFadeIn 0.35s ease;
      }

      @keyframes aiwFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Hero Banner */
      .aiw-hero {
        position: relative;
        overflow: hidden;
        padding: 24px 26px;
        border-radius: var(--radius-lg, 20px);
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.78) 100%);
        border: 1px solid rgba(245, 158, 11, 0.3);
        box-shadow: 0 18px 42px -14px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        flex-wrap: wrap;
      }

      .aiw-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at 8% 12%, rgba(245, 158, 11, 0.16), transparent 46%),
          radial-gradient(circle at 92% 88%, rgba(0, 242, 254, 0.14), transparent 46%);
      }

      .aiw-hero > * {
        position: relative;
        z-index: 1;
      }

      .aiw-hero-kicker {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--accent-gold, #f59e0b);
        margin-bottom: 6px;
      }

      .aiw-hero-title {
        font-family: var(--font-heading);
        font-size: clamp(1.32rem, 2.4vw, 1.85rem);
        font-weight: 800;
        color: var(--text-primary);
        margin: 0 0 6px;
        letter-spacing: -0.01em;
      }

      .aiw-hero-sub {
        font-size: 0.9rem;
        color: var(--text-secondary);
        max-width: 680px;
        margin: 0;
      }

      .aiw-hero-badges {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .aiw-engine-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 13px;
        border-radius: 9999px;
        font-size: 0.76rem;
        font-weight: 700;
        background: rgba(0, 242, 254, 0.12);
        border: 1px solid rgba(0, 242, 254, 0.3);
        color: var(--accent-cyan, #00f2fe);
        white-space: nowrap;
      }

      .aiw-engine-pill.is-offline {
        background: rgba(245, 158, 11, 0.14);
        border-color: rgba(245, 158, 11, 0.34);
        color: var(--accent-gold, #f59e0b);
      }

      .aiw-journal-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 13px;
        border-radius: 9999px;
        font-size: 0.76rem;
        font-weight: 600;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: var(--accent-emerald, #10b981);
        cursor: pointer;
        transition: transform 0.16s ease, background 0.16s ease;
      }

      .aiw-journal-pill:hover {
        transform: translateY(-1px);
        background: rgba(16, 185, 129, 0.22);
      }

      /* Main 2-Column Layout */
      .aiw-grid {
        display: grid;
        grid-template-columns: minmax(340px, 440px) minmax(0, 1fr);
        gap: 20px;
        align-items: start;
      }

      @media (max-width: 1040px) {
        .aiw-grid {
          grid-template-columns: 1fr;
        }
      }

      .aiw-controls-col {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .aiw-card {
        padding: 18px 20px;
        border-radius: var(--radius-lg, 18px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .aiw-section-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-family: var(--font-heading);
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .aiw-section-hint {
        font-family: var(--font-body);
        font-size: 0.74rem;
        font-weight: 500;
        color: var(--text-muted);
      }

      /* Province Selector & Banner Preview */
      .aiw-city-filter-row {
        display: flex;
        gap: 8px;
      }

      .aiw-input,
      .aiw-select,
      .aiw-textarea {
        width: 100%;
        font-family: var(--font-body);
        font-size: 0.88rem;
        color: var(--text-primary);
        background: rgba(10, 15, 29, 0.65);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        border-radius: var(--radius-md, 12px);
        padding: 10px 12px;
        outline: none;
        transition: border-color 0.18s ease, box-shadow 0.18s ease;
      }

      .aiw-input:focus,
      .aiw-select:focus,
      .aiw-textarea:focus {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.14);
      }

      .aiw-select {
        cursor: pointer;
        font-weight: 600;
      }

      .aiw-icon-btn {
        appearance: none;
        flex-shrink: 0;
        padding: 0 12px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.7);
        color: var(--text-primary);
        font-size: 0.84rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
      }

      .aiw-icon-btn:hover {
        border-color: var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.14);
        transform: translateY(-1px);
      }

      .aiw-city-preview {
        border-radius: var(--radius-md, 14px);
        overflow: hidden;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(10, 15, 29, 0.56);
      }

      .aiw-banner-wrap {
        position: relative;
        height: 158px;
        background: linear-gradient(135deg, #0f172a, #1e293b);
        overflow: hidden;
      }

      .aiw-banner-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.45s ease;
      }

      .aiw-city-preview:hover .aiw-banner-img {
        transform: scale(1.03);
      }

      .aiw-banner-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(10, 15, 29, 0.15) 0%, rgba(10, 15, 29, 0.88) 100%);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 12px 14px;
      }

      .aiw-banner-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      .aiw-plate-badge {
        font-family: var(--font-heading);
        font-size: 0.78rem;
        font-weight: 800;
        padding: 3px 9px;
        border-radius: 8px;
        background: rgba(10, 15, 29, 0.78);
        color: #f8fafc;
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-variant-numeric: tabular-nums;
      }

      .aiw-status-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 9999px;
        background: rgba(16, 185, 129, 0.22);
        color: #6ee7b7;
        border: 1px solid rgba(16, 185, 129, 0.4);
      }

      .aiw-status-badge.is-pending {
        background: rgba(245, 158, 11, 0.22);
        color: #fcd34d;
        border-color: rgba(245, 158, 11, 0.4);
      }

      .aiw-banner-bottom h3 {
        margin: 0;
        font-family: var(--font-heading);
        font-size: 1.18rem;
        font-weight: 800;
        color: #ffffff;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
      }

      .aiw-banner-region {
        font-size: 0.76rem;
        color: #cbd5e1;
      }

      .aiw-city-meta {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 0.8rem;
      }

      .aiw-meta-row {
        display: flex;
        gap: 6px;
        color: var(--text-secondary);
        line-height: 1.45;
      }

      .aiw-meta-row strong {
        color: var(--text-primary);
        flex-shrink: 0;
      }

      .aiw-meta-quote {
        font-style: italic;
        color: var(--accent-gold, #f59e0b);
        font-size: 0.79rem;
        border-left: 2px solid rgba(245, 158, 11, 0.45);
        padding-left: 9px;
        margin-top: 2px;
      }

      /* 4 Writing Style Cards */
      .aiw-styles-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 9px;
      }

      @media (max-width: 520px) {
        .aiw-styles-grid {
          grid-template-columns: 1fr;
        }
      }

      .aiw-style-btn {
        appearance: none;
        text-align: left;
        padding: 11px 12px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-primary);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
        transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
      }

      .aiw-style-btn:hover {
        transform: translateY(-1px);
        border-color: rgba(245, 158, 11, 0.45);
        background: rgba(245, 158, 11, 0.08);
      }

      .aiw-style-btn.is-active {
        border-color: var(--accent-gold, #f59e0b);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(0, 242, 254, 0.08));
        box-shadow: 0 8px 20px -10px rgba(245, 158, 11, 0.45);
      }

      .aiw-style-title {
        font-family: var(--font-heading);
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.3;
      }

      .aiw-style-desc {
        font-size: 0.72rem;
        color: var(--text-secondary);
        line-height: 1.35;
      }

      /* Notes & Chips */
      .aiw-textarea {
        min-height: 92px;
        resize: vertical;
        line-height: 1.55;
      }

      .aiw-chips-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .aiw-chip {
        appearance: none;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.58);
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: 0.73rem;
        font-weight: 600;
        padding: 5px 10px;
        border-radius: 9999px;
        cursor: pointer;
        transition: all 0.16s ease;
      }

      .aiw-chip:hover {
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary);
        background: rgba(0, 242, 254, 0.1);
      }

      .aiw-chip.is-city {
        border-color: rgba(245, 158, 11, 0.28);
        color: var(--accent-gold, #f59e0b);
      }

      .aiw-chip.is-city:hover {
        border-color: var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.14);
      }

      .aiw-cta-row {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .aiw-generate-btn {
        flex: 1;
        appearance: none;
        border: none;
        border-radius: var(--radius-md, 12px);
        padding: 13px 18px;
        font-family: var(--font-heading);
        font-size: 0.95rem;
        font-weight: 800;
        color: #0a0f1d;
        background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 45%, #00f2fe 100%);
        cursor: pointer;
        box-shadow: 0 12px 26px -10px rgba(245, 158, 11, 0.55);
        transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
      }

      .aiw-generate-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 16px 32px -10px rgba(245, 158, 11, 0.7);
      }

      .aiw-generate-btn:disabled {
        opacity: 0.7;
        cursor: wait;
      }

      .aiw-stop-btn {
        appearance: none;
        border: 1px solid rgba(239, 68, 68, 0.45);
        background: rgba(239, 68, 68, 0.14);
        color: #fca5a5;
        font-family: var(--font-body);
        font-size: 0.84rem;
        font-weight: 700;
        padding: 12px 14px;
        border-radius: var(--radius-md, 12px);
        cursor: pointer;
        transition: background 0.16s ease;
      }

      .aiw-stop-btn:hover {
        background: rgba(239, 68, 68, 0.25);
      }

      /* Editorial Reading Paper Card */
      .aiw-paper-card {
        position: relative;
        min-height: 540px;
        border-radius: var(--radius-lg, 20px);
        background:
          linear-gradient(180deg, rgba(20, 27, 45, 0.94) 0%, rgba(13, 19, 34, 0.96) 100%);
        border: 1px solid rgba(245, 158, 11, 0.28);
        box-shadow:
          0 24px 50px -18px rgba(0, 0, 0, 0.65),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);
        padding: 24px 28px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .aiw-paper-card::before {
        content: '';
        position: absolute;
        inset: 10px;
        border-radius: 14px;
        border: 1px solid rgba(245, 158, 11, 0.11);
        pointer-events: none;
      }

      .aiw-paper-card > * {
        position: relative;
        z-index: 1;
      }

      .aiw-paper-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(245, 158, 11, 0.18);
      }

      .aiw-paper-folio {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 1.4px;
        text-transform: uppercase;
        color: var(--accent-gold, #f59e0b);
        margin-bottom: 4px;
      }

      .aiw-paper-style-name {
        font-family: var(--font-heading);
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .aiw-live-tag {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 9999px;
        background: rgba(0, 242, 254, 0.14);
        color: var(--accent-cyan, #00f2fe);
        border: 1px solid rgba(0, 242, 254, 0.34);
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .aiw-live-tag.is-streaming {
        background: rgba(245, 158, 11, 0.16);
        color: var(--accent-gold, #f59e0b);
        border-color: rgba(245, 158, 11, 0.4);
      }

      .aiw-live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
        animation: aiwPulseDot 1s infinite ease-in-out;
      }

      @keyframes aiwPulseDot {
        0%, 100% { opacity: 0.35; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.2); }
      }

      .aiw-paper-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .aiw-action-btn {
        appearance: none;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.15));
        background: rgba(30, 41, 59, 0.72);
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 0.77rem;
        font-weight: 600;
        padding: 7px 12px;
        border-radius: 9px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.16s ease;
      }

      .aiw-action-btn:hover:not(:disabled) {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.12);
        transform: translateY(-1px);
      }

      .aiw-action-btn.is-save {
        border-color: rgba(16, 185, 129, 0.38);
        background: rgba(16, 185, 129, 0.14);
        color: var(--accent-emerald, #10b981);
      }

      .aiw-action-btn.is-save:hover:not(:disabled) {
        border-color: var(--accent-emerald, #10b981);
        background: rgba(16, 185, 129, 0.24);
      }

      .aiw-action-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      /* Editorial Typography */
      .aiw-paper-body {
        flex: 1;
        padding: 8px 4px;
        font-family: Georgia, 'Times New Roman', var(--font-body), serif;
        font-size: 1.03rem;
        line-height: 1.85;
        color: #e2e8f0;
      }

      .aiw-empty-paper {
        height: 100%;
        min-height: 350px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 12px;
        padding: 28px 18px;
        font-family: var(--font-body);
        color: var(--text-secondary);
      }

      .aiw-empty-quill {
        width: 58px;
        height: 58px;
        border-radius: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.65rem;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(0, 242, 254, 0.14));
        border: 1px solid rgba(245, 158, 11, 0.35);
      }

      .aiw-empty-paper h4 {
        margin: 0;
        font-family: var(--font-heading);
        font-size: 1.08rem;
        color: var(--text-primary);
      }

      .aiw-empty-paper p {
        margin: 0;
        max-width: 440px;
        font-size: 0.88rem;
        line-height: 1.6;
      }

      .aiw-md-title {
        font-family: var(--font-heading);
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--accent-gold, #f59e0b);
        margin: 0 0 14px;
        line-height: 1.3;
        letter-spacing: -0.01em;
      }

      .aiw-md-heading {
        font-family: var(--font-heading);
        font-size: 1.08rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
        margin: 18px 0 8px;
      }

      .aiw-md-para {
        margin: 0 0 14px;
        color: #e2e8f0;
      }

      .aiw-md-para.is-lead::first-letter {
        float: left;
        font-family: Georgia, serif;
        font-size: 2.85rem;
        line-height: 0.88;
        padding-right: 10px;
        padding-top: 4px;
        font-weight: 700;
        color: var(--accent-gold, #f59e0b);
      }

      .aiw-md-para strong,
      .aiw-md-list strong {
        color: #ffffff;
      }

      .aiw-md-quote {
        margin: 16px 0;
        padding: 12px 16px;
        border-left: 3px solid var(--accent-gold, #f59e0b);
        background: rgba(245, 158, 11, 0.08);
        border-radius: 0 10px 10px 0;
        font-style: italic;
        color: #fef3c7;
      }

      .aiw-md-list {
        margin: 8px 0 14px 20px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-family: var(--font-body);
        font-size: 0.92rem;
        color: var(--text-secondary);
      }

      .aiw-md-ornament {
        text-align: center;
        color: var(--accent-gold, #f59e0b);
        letter-spacing: 6px;
        margin: 14px 0;
        opacity: 0.7;
      }

      /* Blinking Streaming Cursor */
      .aiw-stream-cursor {
        display: inline-block;
        width: 2.5px;
        height: 1.1em;
        margin-left: 3px;
        vertical-align: -0.16em;
        border-radius: 2px;
        background: var(--accent-gold, #f59e0b);
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.8);
        animation: aiwBlinkCursor 0.8s steps(2, start) infinite;
      }

      @keyframes aiwBlinkCursor {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }

      .aiw-paper-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 0.76rem;
        color: var(--text-muted);
      }

      .aiw-paper-stats {
        display: flex;
        align-items: center;
        gap: 12px;
        font-variant-numeric: tabular-nums;
      }

      /* Light Theme Parity */
      html body.light-theme .aiw-hero {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.94) 100%);
        border-color: rgba(217, 119, 6, 0.28);
        box-shadow: 0 14px 32px -12px rgba(15, 23, 42, 0.12);
      }

      html body.light-theme .aiw-card {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.1);
        box-shadow: 0 10px 26px -12px rgba(15, 23, 42, 0.1);
      }

      html body.light-theme .aiw-input,
      html body.light-theme .aiw-select,
      html body.light-theme .aiw-textarea,
      html body.light-theme .aiw-icon-btn {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      html body.light-theme .aiw-city-preview {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.11);
      }

      html body.light-theme .aiw-style-btn {
        background: #f8fafc;
        border-color: rgba(15, 23, 42, 0.12);
        color: #0f172a;
      }

      html body.light-theme .aiw-style-btn.is-active {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(2, 132, 199, 0.08));
        border-color: #d97706;
      }

      html body.light-theme .aiw-chip {
        background: #f1f5f9;
        border-color: rgba(15, 23, 42, 0.12);
        color: #334155;
      }

      html body.light-theme .aiw-chip.is-city {
        color: #b45309;
        border-color: rgba(180, 83, 9, 0.28);
      }

      html body.light-theme .aiw-paper-card {
        background: linear-gradient(180deg, #fffdf8 0%, #fbf7ee 100%);
        border-color: rgba(180, 83, 9, 0.25);
        box-shadow: 0 20px 44px -18px rgba(15, 23, 42, 0.16), inset 0 1px 0 #ffffff;
      }

      html body.light-theme .aiw-paper-card::before {
        border-color: rgba(180, 83, 9, 0.12);
      }

      html body.light-theme .aiw-paper-body,
      html body.light-theme .aiw-md-para {
        color: #1e293b;
      }

      html body.light-theme .aiw-md-para strong,
      html body.light-theme .aiw-md-list strong {
        color: #0f172a;
      }

      html body.light-theme .aiw-md-title {
        color: #b45309;
      }

      html body.light-theme .aiw-md-heading {
        color: #0369a1;
      }

      html body.light-theme .aiw-md-quote {
        background: rgba(217, 119, 6, 0.09);
        color: #78350f;
      }

      html body.light-theme .aiw-action-btn {
        background: #ffffff;
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }

      html body.light-theme .aiw-action-btn.is-save {
        background: rgba(5, 150, 105, 0.1);
        border-color: rgba(5, 150, 105, 0.35);
        color: #047857;
      }

      html body.light-theme .aiw-paper-footer {
        border-top-color: rgba(15, 23, 42, 0.08);
      }

      @media (prefers-reduced-motion: reduce) {
        .aiw-studio,
        .aiw-live-dot,
        .aiw-stream-cursor {
          animation: none;
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

    const esc = ctx && typeof ctx.escapeHtml === 'function' ? ctx.escapeHtml : defaultEscapeHtml;
    const norm = ctx && typeof ctx.normalizeTurkish === 'function' ? ctx.normalizeTurkish : defaultNormalizeTurkish;
    const provinces = (ctx && ctx.data && ctx.data.provinces) || {};
    const allKeys = getSortedProvinceKeys(provinces);

    if (!allKeys.length) {
      container.innerHTML = `
        <div class="aiw-studio">
          <div class="aiw-card">
            <h3>Şehir Verisi Bulunamadı</h3>
            <p style="color: var(--text-secondary);">81 il verisi yüklenemediği için seyahatname yazarı başlatılamadı.</p>
          </div>
        </div>
      `;
      return;
    }

    if (!uiState.selectedCityKey || !provinces[uiState.selectedCityKey]) {
      const ctxCity = ctx && ctx.state && ctx.state.selectedCityKey;
      uiState.selectedCityKey = (ctxCity && provinces[ctxCity]) ? ctxCity : allKeys[0];
    }

    let hasGeminiKey = false;
    if (window.SEYYAH_AI && typeof window.SEYYAH_AI.hasKey === 'function') {
      hasGeminiKey = Boolean(window.SEYYAH_AI.hasKey());
    } else {
      try {
        hasGeminiKey = Boolean((localStorage.getItem(GEMINI_KEY_STORAGE) || '').trim());
      } catch (e) {}
    }
    const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;
    const aiReady = isOnline && hasGeminiKey;

    const stylesHtml = WRITING_STYLES.map((st) => `
      <button
        type="button"
        class="aiw-style-btn ${uiState.styleId === st.id ? 'is-active' : ''}"
        data-aiw-style="${esc(st.id)}"
        aria-pressed="${uiState.styleId === st.id ? 'true' : 'false'}"
      >
        <span class="aiw-style-title">${esc(st.label)}</span>
        <span class="aiw-style-desc">${esc(st.desc)}</span>
      </button>
    `).join('');

    container.innerHTML = `
      <section class="aiw-studio" aria-label="AI Evliya Çelebi Seyahatname Yazarı">
        <header class="aiw-hero">
          <div>
            <div class="aiw-hero-kicker">🖋️ Dijital Kalem &amp; Canlı Akış Stüdyosu</div>
            <h2 class="aiw-hero-title">✍️ AI Evliya Çelebi Seyahatname Yazarı</h2>
            <p class="aiw-hero-sub">
              81 ilin tarihî ruhunu, kütüphane sessizliğini ve kısa yol notlarınızı seçtiğiniz edebî üslupla kelime kelime canlı seyahatnameye dönüştürün.
            </p>
          </div>
          <div class="aiw-hero-badges">
            <span class="aiw-engine-pill ${aiReady ? '' : 'is-offline'}" data-aiw-engine-pill>
              ${aiReady ? '⚡ Canlı AI Akışı Hazır' : '🕯️ Çevrimdışı / Atölye Modu'}
            </span>
            <button type="button" class="aiw-journal-pill" data-aiw-open-journal title="Kayıtlı Seyir Defteri">
              📝 AI Kayıtları (<span data-aiw-journal-count>${getJournalEntryCount()}</span>)
            </button>
          </div>
        </header>

        <div class="aiw-grid">
          <!-- Left Controls Column -->
          <div class="aiw-controls-col">
            <div class="aiw-card">
              <div class="aiw-section-label">
                <span>1. Menzil (İl) Seçimi</span>
                <span class="aiw-section-hint">${allKeys.length} il hazır</span>
              </div>

              <div class="aiw-city-filter-row">
                <input
                  type="text"
                  class="aiw-input"
                  data-aiw-city-search
                  value="${esc(uiState.searchQuery)}"
                  placeholder="İl adı veya plaka ile süz..."
                  aria-label="İl ara"
                />
                <button type="button" class="aiw-icon-btn" data-aiw-random-city title="Rastgele bir il seç">
                  🎲 Rastgele
                </button>
              </div>

              <select class="aiw-select" data-aiw-city-select aria-label="İl seçin"></select>

              <div class="aiw-city-preview" data-aiw-city-preview></div>
            </div>

            <div class="aiw-card">
              <div class="aiw-section-label">
                <span>2. Yazım Üslubu</span>
                <span class="aiw-section-hint">4 edebî ton</span>
              </div>
              <div class="aiw-styles-grid" data-aiw-styles>
                ${stylesHtml}
              </div>
            </div>

            <div class="aiw-card">
              <div class="aiw-section-label">
                <span>3. Kısa Yol Notları</span>
                <span class="aiw-section-hint">İsteğe bağlı ipuçları</span>
              </div>

              <textarea
                class="aiw-textarea"
                data-aiw-notes
                placeholder="Örn: sabah çorbası, kütüphane sessizliği, taş köprüde gün batımı"
                aria-label="Kısa yol notları"
              >${esc(uiState.notes)}</textarea>

              <div class="aiw-chips-wrap" data-aiw-chips></div>

              <div class="aiw-cta-row">
                <button type="button" class="aiw-generate-btn" data-aiw-generate>
                  ✨ Seyahatnameyi Canlı Yaz
                </button>
                <button type="button" class="aiw-stop-btn" data-aiw-stop style="display: none;">
                  ⏹ Durdur
                </button>
              </div>
            </div>
          </div>

          <!-- Right Editorial Paper Column -->
          <div class="aiw-paper-col">
            <article class="aiw-paper-card" aria-label="Editoryal Seyahatname Okuma Kâğıdı">
              <div class="aiw-paper-head">
                <div>
                  <div class="aiw-paper-folio" data-aiw-folio>ANADOLU SEYAHATNAMESİ · VARAK</div>
                  <div class="aiw-paper-style-name">
                    <span data-aiw-paper-heading>Evliya Çelebi Klasik Üslubu</span>
                    <span class="aiw-live-tag" data-aiw-live-tag style="display: none;">
                      <span class="aiw-live-dot"></span>
                      <span data-aiw-live-label>Canlı Yazılıyor</span>
                    </span>
                  </div>
                </div>

                <div class="aiw-paper-actions">
                  <button type="button" class="aiw-action-btn" data-aiw-copy disabled>📋 Kopyala</button>
                  <button type="button" class="aiw-action-btn" data-aiw-download disabled>📥 Markdown İndir</button>
                  <button type="button" class="aiw-action-btn is-save" data-aiw-save disabled>📝 Seyir Defterim'e Kaydet</button>
                </div>
              </div>

              <div class="aiw-paper-body" data-aiw-paper-body aria-live="polite"></div>

              <div class="aiw-paper-footer">
                <div class="aiw-paper-stats">
                  <span data-aiw-word-count>0 kelime</span>
                  <span>·</span>
                  <span data-aiw-read-time>0 dk</span>
                </div>
                <span data-aiw-source-label>Kalem hazır</span>
              </div>
            </article>
          </div>
        </div>
      </section>
    `;

    // Query DOM references
    const studioEl = container.querySelector('.aiw-studio');
    const citySearchEl = container.querySelector('[data-aiw-city-search]');
    const randomCityBtn = container.querySelector('[data-aiw-random-city]');
    const citySelectEl = container.querySelector('[data-aiw-city-select]');
    const cityPreviewEl = container.querySelector('[data-aiw-city-preview]');
    const styleButtons = Array.from(container.querySelectorAll('[data-aiw-style]'));
    const notesEl = container.querySelector('[data-aiw-notes]');
    const chipsWrapEl = container.querySelector('[data-aiw-chips]');
    const generateBtn = container.querySelector('[data-aiw-generate]');
    const stopBtn = container.querySelector('[data-aiw-stop]');
    const journalCountEl = container.querySelector('[data-aiw-journal-count]');
    const openJournalBtn = container.querySelector('[data-aiw-open-journal]');

    const folioEl = container.querySelector('[data-aiw-folio]');
    const paperHeadingEl = container.querySelector('[data-aiw-paper-heading]');
    const liveTagEl = container.querySelector('[data-aiw-live-tag]');
    const liveLabelEl = container.querySelector('[data-aiw-live-label]');
    const paperBodyEl = container.querySelector('[data-aiw-paper-body]');
    const wordCountEl = container.querySelector('[data-aiw-word-count]');
    const readTimeEl = container.querySelector('[data-aiw-read-time]');
    const sourceLabelEl = container.querySelector('[data-aiw-source-label]');

    const copyBtn = container.querySelector('[data-aiw-copy]');
    const downloadBtn = container.querySelector('[data-aiw-download]');
    const saveBtn = container.querySelector('[data-aiw-save]');

    let pendingFrame = null;

    function getActiveStyle() {
      return WRITING_STYLES.find((s) => s.id === uiState.styleId) || WRITING_STYLES[0];
    }

    function populateCitySelect() {
      const q = norm(uiState.searchQuery);
      const filtered = q
        ? allKeys.filter((k) => {
            const p = provinces[k];
            const hay = norm(`${formatPlate(p.plate)} ${p.name} ${p.region || ''}`);
            return hay.includes(q);
          })
        : allKeys;

      const listToShow = filtered.length ? filtered : allKeys;
      if (!listToShow.includes(uiState.selectedCityKey) && filtered.length) {
        uiState.selectedCityKey = filtered[0];
      }

      citySelectEl.innerHTML = listToShow
        .map((k) => {
          const p = provinces[k];
          const mark = p.visited ? '✅' : '⏳';
          return `<option value="${esc(k)}">${esc(formatPlate(p.plate))} — ${esc(p.name)} (${esc(p.region || 'Anadolu')}) ${mark}</option>`;
        })
        .join('');

      citySelectEl.value = uiState.selectedCityKey;
    }

    function renderCityPreview() {
      const cityKey = uiState.selectedCityKey;
      const p = provinces[cityKey];
      if (!p) return;

      const plate = formatPlate(p.plate);
      const bannerSrc = getBannerPath(p, cityKey);
      const landmarks = Array.isArray(p.landmarks) && p.landmarks.length
        ? p.landmarks.slice(0, 3).join(' · ')
        : 'Şehir merkezi ve tarihî miras';
      const specialties = Array.isArray(p.specialties) && p.specialties.length
        ? p.specialties.slice(0, 3).join(' · ')
        : 'Yöresel lezzetler';
      const library = String(p.custom_library || p.library || `${p.name} İl Halk Kütüphanesi`).split(' - ')[0];
      const quote = p.custom_quote || p.quote || '';

      cityPreviewEl.innerHTML = `
        <div class="aiw-banner-wrap">
          <img
            class="aiw-banner-img"
            src="${esc(bannerSrc)}"
            alt="${esc(p.name)} manzarası"
            loading="lazy"
            onerror="this.style.display='none'"
          />
          <div class="aiw-banner-overlay">
            <div class="aiw-banner-top">
              <span class="aiw-plate-badge">PLAKA ${esc(plate)}</span>
              <span class="aiw-status-badge ${p.visited ? '' : 'is-pending'}">
                ${p.visited ? '✅ Ziyaret Edildi' : '⏳ Planlanan Menzil'}
              </span>
            </div>
            <div class="aiw-banner-bottom">
              <h3>${esc(p.name)}</h3>
              <div class="aiw-banner-region">${esc(p.region || 'Anadolu')} Bölgesi</div>
            </div>
          </div>
        </div>
        <div class="aiw-city-meta">
          <div class="aiw-meta-row"><strong>📚 Kütüphane:</strong> <span>${esc(library)}</span></div>
          <div class="aiw-meta-row"><strong>🕌 Duraklar:</strong> <span>${esc(landmarks)}</span></div>
          <div class="aiw-meta-row"><strong>🍽️ Lezzetler:</strong> <span>${esc(specialties)}</span></div>
          ${quote ? `<div class="aiw-meta-quote">“${esc(quote)}”</div>` : ''}
        </div>
      `;
    }

    function renderInspirationChips() {
      const p = provinces[uiState.selectedCityKey];
      const cityChips = [];
      if (p) {
        if (Array.isArray(p.landmarks) && p.landmarks[0]) cityChips.push(p.landmarks[0]);
        if (Array.isArray(p.specialties) && p.specialties[0]) cityChips.push(p.specialties[0]);
        const lib = String(p.custom_library || p.library || '').split(' - ')[0].trim();
        if (lib) cityChips.push(lib);
      }

      const cityHtml = cityChips
        .map((chip) => `<button type="button" class="aiw-chip is-city" data-aiw-chip="${esc(chip)}">+ ${esc(chip)}</button>`)
        .join('');
      const universalHtml = UNIVERSAL_CHIPS
        .map((chip) => `<button type="button" class="aiw-chip" data-aiw-chip="${esc(chip)}">+ ${esc(chip)}</button>`)
        .join('');

      chipsWrapEl.innerHTML = cityHtml + universalHtml;
    }

    function updatePaperHeaderAndStats() {
      const displayCityKey = uiState.outputCityKey || uiState.selectedCityKey;
      const displayProvince = provinces[displayCityKey] || provinces[uiState.selectedCityKey];
      const displayStyle = WRITING_STYLES.find((s) => s.id === (uiState.outputText ? uiState.outputStyleId : uiState.styleId)) || getActiveStyle();

      if (displayProvince) {
        folioEl.textContent = `ANADOLU SEYAHATNAMESİ · MENZİL ${formatPlate(displayProvince.plate)} (${displayProvince.name.toUpperCase()})`;
      }
      paperHeadingEl.textContent = displayStyle.shortTitle;

      const words = countWords(uiState.outputText);
      wordCountEl.textContent = `${words} kelime`;
      readTimeEl.textContent = formatDurationMinutes(words);

      const hasText = Boolean(uiState.outputText && uiState.outputText.trim()) && !uiState.isStreaming;
      copyBtn.disabled = !hasText;
      downloadBtn.disabled = !hasText;
      saveBtn.disabled = !hasText;
    }

    function renderPaperBody(streamingNow) {
      if (!uiState.outputText && !streamingNow) {
        const p = provinces[uiState.selectedCityKey];
        const st = getActiveStyle();
        paperBodyEl.innerHTML = `
          <div class="aiw-empty-paper">
            <div class="aiw-empty-quill" aria-hidden="true">🖋️</div>
            <h4>${esc(p ? p.name : 'Anadolu')} Varakı Boş</h4>
            <p>
              <strong>${esc(st.shortTitle)}</strong> seçili. İsterseniz yukarıdaki ilham etiketlerinden birkaçını notlarınıza ekleyin ve
              <strong>“✨ Seyahatnameyi Canlı Yaz”</strong> düğmesine basın; metin buraya kelime kelime akacaktır.
            </p>
          </div>
        `;
        updatePaperHeaderAndStats();
        return;
      }

      paperBodyEl.innerHTML = renderEditorialMarkdown(uiState.outputText, esc, streamingNow);
      updatePaperHeaderAndStats();
    }

    function schedulePaperPaint(streamingNow) {
      if (pendingFrame) return;
      pendingFrame = requestAnimationFrame(() => {
        pendingFrame = null;
        if (!studioEl.isConnected) return;
        renderPaperBody(streamingNow);
      });
    }

    function setStreamingUi(active) {
      uiState.isStreaming = active;
      generateBtn.disabled = active;
      generateBtn.textContent = active ? '🖋️ Mürekkep Akıyor...' : '✨ Seyahatnameyi Canlı Yaz';
      stopBtn.style.display = active ? 'inline-flex' : 'none';

      if (active) {
        liveTagEl.style.display = 'inline-flex';
        liveTagEl.classList.add('is-streaming');
        liveLabelEl.textContent = 'Canlı Yazılıyor';
      } else if (uiState.outputText) {
        liveTagEl.style.display = 'inline-flex';
        liveTagEl.classList.remove('is-streaming');
        liveLabelEl.textContent = 'Tamamlandı';
      } else {
        liveTagEl.style.display = 'none';
      }
      updatePaperHeaderAndStats();
    }

    function appendChipToNotes(chipText) {
      const current = notesEl.value.trim();
      const existing = parseNotesList(current).map(norm);
      if (existing.includes(norm(chipText))) {
        notify(ctx, `“${chipText}” zaten notlarınızda yer alıyor.`);
        return;
      }
      notesEl.value = current ? `${current}, ${chipText}` : chipText;
      uiState.notes = notesEl.value;
      notesEl.focus();
    }

    // Initial render
    populateCitySelect();
    renderCityPreview();
    renderInspirationChips();
    renderPaperBody(uiState.isStreaming);
    setStreamingUi(uiState.isStreaming);

    // Event bindings
    citySearchEl.addEventListener('input', () => {
      uiState.searchQuery = citySearchEl.value;
      const prevKey = uiState.selectedCityKey;
      populateCitySelect();
      if (uiState.selectedCityKey !== prevKey) {
        renderCityPreview();
        renderInspirationChips();
        if (!uiState.outputText) renderPaperBody(false);
      }
    });

    citySelectEl.addEventListener('change', () => {
      uiState.selectedCityKey = citySelectEl.value;
      renderCityPreview();
      renderInspirationChips();
      if (!uiState.outputText && !uiState.isStreaming) {
        renderPaperBody(false);
      }
    });

    randomCityBtn.addEventListener('click', () => {
      if (allKeys.length <= 1) return;
      let nextKey = uiState.selectedCityKey;
      for (let i = 0; i < 6 && nextKey === uiState.selectedCityKey; i++) {
        nextKey = allKeys[Math.floor(Math.random() * allKeys.length)];
      }
      uiState.selectedCityKey = nextKey;
      uiState.searchQuery = '';
      citySearchEl.value = '';
      populateCitySelect();
      renderCityPreview();
      renderInspirationChips();
      if (!uiState.outputText && !uiState.isStreaming) {
        renderPaperBody(false);
      }
      notify(ctx, `🎲 Menzil seçildi: ${provinces[nextKey].name}`);
    });

    styleButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const sid = btn.getAttribute('data-aiw-style');
        uiState.styleId = sid;
        styleButtons.forEach((b) => {
          const active = b.getAttribute('data-aiw-style') === sid;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        if (!uiState.outputText && !uiState.isStreaming) {
          renderPaperBody(false);
        }
      });
    });

    notesEl.addEventListener('input', () => {
      uiState.notes = notesEl.value;
    });

    chipsWrapEl.addEventListener('click', (e) => {
      const chipBtn = e.target.closest('[data-aiw-chip]');
      if (!chipBtn) return;
      appendChipToNotes(chipBtn.getAttribute('data-aiw-chip'));
    });

    stopBtn.addEventListener('click', () => {
      if (uiState.abortController) {
        uiState.abortController.abort();
      }
    });

    generateBtn.addEventListener('click', async () => {
      if (uiState.isStreaming) return;

      const cityKey = uiState.selectedCityKey;
      const province = provinces[cityKey];
      if (!province) return;

      const styleObj = getActiveStyle();
      const notesText = notesEl.value.trim();

      if (uiState.abortController) {
        uiState.abortController.abort();
      }
      const controller = new AbortController();
      uiState.abortController = controller;
      const runId = ++uiState.streamRunId;

      uiState.outputText = '';
      uiState.outputCityKey = cityKey;
      uiState.outputStyleId = styleObj.id;
      uiState.outputSource = '';
      saveBtn.textContent = '📝 Seyir Defterim\'e Kaydet';

      sourceLabelEl.textContent = `${province.name} için yazılıyor...`;
      setStreamingUi(true);
      renderPaperBody(true);

      try {
        const result = await generateTravelogueStream({
          province,
          cityKey,
          styleObj,
          notesText,
          signal: controller.signal,
          onUpdate: (partialText) => {
            if (runId !== uiState.streamRunId || !studioEl.isConnected) return;
            uiState.outputText = partialText;
            schedulePaperPaint(true);
          }
        });

        if (runId !== uiState.streamRunId || !studioEl.isConnected) return;
        if (pendingFrame) {
          cancelAnimationFrame(pendingFrame);
          pendingFrame = null;
        }
        uiState.outputText = result.text || uiState.outputText;
        uiState.outputSource = result.source || 'AI Atölye';
        sourceLabelEl.textContent = `Kaynak: ${uiState.outputSource}`;
        setStreamingUi(false);
        renderPaperBody(false);
      } catch (err) {
        if (runId !== uiState.streamRunId) return;
        if (pendingFrame) {
          cancelAnimationFrame(pendingFrame);
          pendingFrame = null;
        }
        if (err && err.name === 'AbortError') {
          sourceLabelEl.textContent = 'Akış kullanıcı tarafından durduruldu';
          setStreamingUi(false);
          renderPaperBody(false);
          notify(ctx, '⏹ Seyahatname akışı durduruldu.');
          return;
        }
        const fallback = buildOfflineTemplate(province, styleObj, notesText);
        uiState.outputText = fallback;
        uiState.outputSource = '🕯️ Çevrimdışı Atölye Modu';
        sourceLabelEl.textContent = `Kaynak: ${uiState.outputSource}`;
        setStreamingUi(false);
        renderPaperBody(false);
      } finally {
        if (uiState.abortController === controller) {
          uiState.abortController = null;
        }
      }
    });

    copyBtn.addEventListener('click', async () => {
      if (!uiState.outputText) return;
      const ok = await copyToClipboard(uiState.outputText);
      notify(ctx, ok ? '📋 Seyahatname metni panoya kopyalandı!' : '⚠️ Panoya kopyalanamadı.');
    });

    downloadBtn.addEventListener('click', () => {
      if (!uiState.outputText) return;
      const p = provinces[uiState.outputCityKey || uiState.selectedCityKey] || {};
      const st = WRITING_STYLES.find((s) => s.id === uiState.outputStyleId) || getActiveStyle();
      const slug = norm(p.slug || p.name || 'sehir').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const filename = `${slug || 'seyyah'}-seyahatname-${st.id}.md`;
      const header = `<!-- Dijital Seyyah · ${p.name || ''} (${formatPlate(p.plate)}) · ${st.shortTitle} -->\n\n`;
      triggerMarkdownDownload(filename, header + uiState.outputText + '\n');
      notify(ctx, `📥 ${filename} indirildi!`);
    });

    saveBtn.addEventListener('click', () => {
      if (!uiState.outputText) return;
      const cityKey = uiState.outputCityKey || uiState.selectedCityKey;
      const p = provinces[cityKey];
      if (!p) return;
      const st = WRITING_STYLES.find((s) => s.id === uiState.outputStyleId) || getActiveStyle();

      const entry = {
        id: `aiw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        cityKey,
        cityName: p.name,
        plate: p.plate || null,
        region: p.region || '',
        mode: st.id,
        styleLabel: st.shortTitle,
        notes: uiState.notes.trim(),
        title: `${p.name} — ${st.shortTitle}`,
        content: uiState.outputText,
        model: uiState.outputSource || 'SEYYAH_AI',
        source: 'aiWriter',
        createdAt: new Date().toISOString()
      };

      const res = appendJournalEntry(entry);
      if (res.saved) {
        if (journalCountEl) journalCountEl.textContent = String(res.count);
        saveBtn.textContent = '✓ Kaydedildi';
        notify(ctx, `📝 ${p.name} seyahatnamesi Seyir Defterim'e kaydedildi! (Toplam ${res.count} kayıt)`);
      } else {
        notify(ctx, '⚠️ Yerel depolamaya kaydedilemedi.');
      }
    });

    if (openJournalBtn) {
      openJournalBtn.addEventListener('click', () => {
        if (ctx && typeof ctx.openView === 'function') {
          ctx.openView('journal');
        }
      });
    }
  }

  window.SEYYAH_MODULES.aiWriter = {
    render
  };
})();
