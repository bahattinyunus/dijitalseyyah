/**
 * Dijital Seyyah — One-Click Social Share & High-DPI Story Card Generator
 * Registers on window.SEYYAH_MODULES.shareCard = { init(ctx) }
 *
 * Features:
 *   1. MutationObserver on #viewport-content to detect active city detail views
 *      (ctx.state.currentView === 'city' && ctx.state.selectedCityKey)
 *   2. Injects a sleek "📤 Hikaye Kartı İndir (PNG)" action bar (beside .voice-narrator-bar
 *      when present, or below .city-hero + quick trigger in .city-actions-bar)
 *   3. Renders a crisp 1080×1920 (9:16) Instagram Story / WhatsApp Status Canvas card
 *      with real banner.jpg (plus obsidian/region fallback gradient), cinematic vignette,
 *      gold/cyan accent border, plate badge, visited status, region, bold title, quote,
 *      top 3 landmarks, and "DİJİTAL SEYYAH • ANADOLU SEYAHATNAMESİ" footer
 *   4. Auto-downloads `${slug}_hikaye_karti.png` with toast confirmation
 *   5. Supports native navigator.share (file or text+url) with clipboard text copy fallback
 */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const CARD_W = 1080;
  const CARD_H = 1920;
  const FOOTER_TEXT = 'DİJİTAL SEYYAH • ANADOLU SEYAHATNAMESİ';

  const STYLE_ID = 'seyyah-share-card-styles';
  const BAR_CLASS = 'seyyah-share-card-bar';
  const BOTTOM_BTN_CLASS = 'seyyah-share-card-bottom-btn';

  const DEFAULT_REGIONS = {
    '01_Marmara': { name: 'Marmara Bölgesi', icon: '🏰', color: '#38bdf8' },
    '02_Ege': { name: 'Ege Bölgesi', icon: '🌊', color: '#34d399' },
    '03_Akdeniz': { name: 'Akdeniz Bölgesi', icon: '☀️', color: '#f59e0b' },
    '04_IcAnadolu': { name: 'İç Anadolu Bölgesi', icon: '🌾', color: '#fbbf24' },
    '05_Karadeniz': { name: 'Karadeniz Bölgesi', icon: '🌲', color: '#10b981' },
    '06_DoguAnadolu': { name: 'Doğu Anadolu Bölgesi', icon: '🏔️', color: '#a855f7' },
    '07_GuneydoguAnadolu': { name: 'Güneydoğu Anadolu Bölgesi', icon: '🏜️', color: '#f97316' }
  };

  const imageCache = new Map();

  let activeCtx = null;
  let initialized = false;
  let viewportObserver = null;
  let injectRafPending = false;
  let isRendering = false;

  // =========================================================================
  // Helpers
  // =========================================================================

  function getAppData(ctx) {
    return (
      (ctx && ctx.data) ||
      (ctx && ctx.state && ctx.state.data) ||
      (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null)
    );
  }

  function notifyToast(ctx, message) {
    if (ctx && typeof ctx.showToast === 'function') {
      ctx.showToast(message);
      return;
    }

    const container = document.getElementById('toast-container');
    if (!container) return;

    const item = document.createElement('div');
    item.className = 'toast-item';
    item.textContent = message;
    container.appendChild(item);

    window.setTimeout(() => {
      if (item.parentNode) item.parentNode.removeChild(item);
    }, 3400);
  }

  function formatPlate(plate) {
    const n = Number(plate);
    if (!Number.isFinite(n)) return '00';
    return String(n).padStart(2, '0');
  }

  function formatCoords(lat, lng) {
    const la = Number(lat);
    const ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) return '';
    const ns = la >= 0 ? 'K' : 'G';
    const ew = ln >= 0 ? 'D' : 'B';
    return `${Math.abs(la).toFixed(2)}°${ns} • ${Math.abs(ln).toFixed(2)}°${ew}`;
  }

  function slugify(str) {
    return String(str || 'anadolu')
      .replace(/İ/g, 'i')
      .replace(/I/g, 'i')
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'sehir';
  }

  function toTurkishUpper(str) {
    const s = String(str || '');
    try {
      return s.toLocaleUpperCase('tr-TR');
    } catch (_) {
      return s.toUpperCase();
    }
  }

  function getRegionMeta(data, province) {
    const code = province && province.region_code;
    const regions = (data && data.regions) || {};
    const meta = regions[code] || DEFAULT_REGIONS[code];
    if (meta) return meta;
    const regionLabel = (province && province.region) ? `${province.region} Bölgesi` : 'Anadolu';
    return {
      name: regionLabel,
      icon: '🗺️',
      color: '#38bdf8'
    };
  }

  function getProvinceBannerCandidates(cityKey, province) {
    const candidates = [];
    if (province) {
      if (province.has_banner !== false && province.banner_rel) {
        candidates.push(province.banner_rel);
      }
      if (Array.isArray(province.images)) {
        province.images.forEach((src) => {
          if (src && !candidates.includes(src)) candidates.push(src);
        });
      }
      if (province.gallery_rel && !candidates.includes(province.gallery_rel)) {
        candidates.push(province.gallery_rel);
      }
    }
    if (cityKey) {
      const fallbackRel = `${cityKey}/banner.jpg`;
      if (!candidates.includes(fallbackRel)) candidates.push(fallbackRel);
    }
    if (!candidates.includes('assets/banner.jpg')) {
      candidates.push('assets/banner.jpg');
    }
    return candidates;
  }

  function loadImageAsset(src) {
    if (!src) return Promise.resolve({ status: 'error', img: null });
    if (imageCache.has(src)) return Promise.resolve(imageCache.get(src));

    const isFileProtocol =
      typeof window !== 'undefined' &&
      window.location &&
      window.location.protocol === 'file:';

    return new Promise((resolve) => {
      const attemptLoad = (useCors) => {
        const img = new Image();
        if (useCors) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          const entry = { status: 'loaded', img, taintedRisk: !useCors };
          imageCache.set(src, entry);
          resolve(entry);
        };
        img.onerror = () => {
          if (useCors) {
            attemptLoad(false);
          } else {
            const entry = { status: 'error', img: null, taintedRisk: false };
            imageCache.set(src, entry);
            resolve(entry);
          }
        };
        img.src = src;
      };

      // Avoid CORS header on file:// because browsers block file:// CORS loads
      attemptLoad(!isFileProtocol);
    });
  }

  async function resolveBestBannerImage(cityKey, province) {
    const candidates = getProvinceBannerCandidates(cityKey, province);
    for (let i = 0; i < candidates.length; i++) {
      const asset = await loadImageAsset(candidates[i]);
      if (asset.status === 'loaded' && asset.img) {
        return asset.img;
      }
    }
    return null;
  }

  async function waitForFontsBriefly() {
    if (typeof document === 'undefined' || !document.fonts || !document.fonts.ready) return;
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => window.setTimeout(resolve, 450))
      ]);
    } catch (_) {
      // Proceed with system fallback fonts
    }
  }

  // =========================================================================
  // Canvas Drawing Primitives (1080×1920 Story Format)
  // =========================================================================

  function drawRoundedRect(c, x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath();
    c.moveTo(x + radius, y);
    c.arcTo(x + w, y, x + w, y + h, radius);
    c.arcTo(x + w, y + h, x, y + h, radius);
    c.arcTo(x, y + h, x, y, radius);
    c.arcTo(x, y, x + w, y, radius);
    c.closePath();
  }

  function drawImageCover(c, img, x, y, w, h) {
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    if (!imgW || !imgH) return;

    const targetRatio = w / h;
    const imgRatio = imgW / imgH;
    let sx = 0;
    let sy = 0;
    let sw = imgW;
    let sh = imgH;

    if (imgRatio > targetRatio) {
      sw = imgH * targetRatio;
      sx = (imgW - sw) / 2;
    } else {
      sh = imgW / targetRatio;
      sy = (imgH - sh) / 2;
    }

    c.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function truncateToWidth(c, text, maxWidth) {
    const raw = String(text || '').replace(/\s+/g, ' ').trim();
    if (!raw) return '';
    if (c.measureText(raw).width <= maxWidth) return raw;
    let trimmed = raw;
    while (trimmed.length > 2 && c.measureText(`${trimmed}…`).width > maxWidth) {
      trimmed = trimmed.slice(0, -1).trim();
    }
    return `${trimmed}…`;
  }

  function wrapText(c, text, maxWidth, maxLines) {
    const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
    if (!cleaned) return [];

    const words = cleaned.split(' ');
    const lines = [];
    let current = '';
    let consumedWords = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const test = current ? `${current} ${word}` : word;
      if (c.measureText(test).width <= maxWidth) {
        current = test;
        consumedWords = i + 1;
      } else {
        if (current) {
          lines.push(current);
          current = word;
          consumedWords = i + 1;
        } else {
          lines.push(truncateToWidth(c, word, maxWidth));
          current = '';
          consumedWords = i + 1;
        }
        if (lines.length === maxLines) {
          if (current) {
            consumedWords = i;
            current = '';
          }
          break;
        }
      }
    }

    if (current && lines.length < maxLines) {
      lines.push(current);
      consumedWords = words.length;
    }

    if (consumedWords < words.length && lines.length > 0) {
      let last = lines[lines.length - 1];
      while (last.length > 3 && c.measureText(`${last}…`).width > maxWidth) {
        last = last.slice(0, -1).trim();
      }
      lines[lines.length - 1] = `${last}…`;
    }

    return lines;
  }

  function drawSeljukWatermark(c, cx, cy, r, strokeColor) {
    c.save();
    c.translate(cx, cy);
    c.strokeStyle = strokeColor;
    c.lineWidth = 2;

    const half = r * 0.7;
    for (let rot = 0; rot < 2; rot++) {
      c.save();
      c.rotate((rot * Math.PI) / 4);
      c.strokeRect(-half, -half, half * 2, half * 2);
      c.restore();
    }

    c.beginPath();
    c.arc(0, 0, r * 0.96, 0, Math.PI * 2);
    c.stroke();

    c.beginPath();
    c.arc(0, 0, r * 0.28, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }

  function drawObsidianFallbackBackground(c, regionColor) {
    const bg = c.createLinearGradient(0, 0, CARD_W, CARD_H);
    bg.addColorStop(0, '#050811');
    bg.addColorStop(0.38, '#0c172b');
    bg.addColorStop(0.7, '#091224');
    bg.addColorStop(1, '#04070f');
    c.fillStyle = bg;
    c.fillRect(0, 0, CARD_W, CARD_H);

    // Region-tinted atmospheric glow
    const orb1 = c.createRadialGradient(CARD_W * 0.72, 420, 30, CARD_W * 0.72, 420, 620);
    orb1.addColorStop(0, regionColor || '#38bdf8');
    orb1.addColorStop(1, 'rgba(6, 9, 19, 0)');
    c.save();
    c.globalAlpha = 0.24;
    c.fillStyle = orb1;
    c.fillRect(0, 0, CARD_W, CARD_H);
    c.restore();

    const orb2 = c.createRadialGradient(220, 760, 20, 220, 760, 520);
    orb2.addColorStop(0, '#f59e0b');
    orb2.addColorStop(1, 'rgba(6, 9, 19, 0)');
    c.save();
    c.globalAlpha = 0.14;
    c.fillStyle = orb2;
    c.fillRect(0, 0, CARD_W, CARD_H);
    c.restore();

    // Subtle geometric Seljuk emblem in hero zone
    drawSeljukWatermark(c, CARD_W / 2, 520, 210, 'rgba(251, 191, 36, 0.14)');
  }

  function paintStoryCard(canvas, opts) {
    const c = canvas.getContext('2d');
    if (!c) return;

    const province = opts.province || {};
    const regionMeta = opts.regionMeta || { name: 'Anadolu', icon: '🗺️', color: '#38bdf8' };
    const img = opts.img || null;

    const plateStr = formatPlate(province.plate);
    const cityTitle = String(province.name || 'Anadolu');
    const regionLabel = toTurkishUpper(
      regionMeta.name || (province.region ? `${province.region} Bölgesi` : 'Anadolu')
    );
    const coordsLabel = formatCoords(province.lat, province.lng);
    const rawQuote = String(province.custom_quote || province.quote || '').trim();
    const landmarks = Array.isArray(province.landmarks)
      ? province.landmarks.filter(Boolean).slice(0, 3)
      : [];
    const isVisited = Boolean(province.visited);

    const fontHead = '"Outfit", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const fontBody = '"Plus Jakarta Sans", "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    c.clearRect(0, 0, CARD_W, CARD_H);

    // 1. Base Obsidian Canvas
    c.fillStyle = '#060913';
    c.fillRect(0, 0, CARD_W, CARD_H);

    // 2. Hero Photo (upper 1120px crop preserves landscape framing) or Fallback Gradient
    if (img) {
      c.save();
      drawImageCover(c, img, 0, 0, CARD_W, 1140);
      c.restore();
    } else {
      drawObsidianFallbackBackground(c, regionMeta.color);
    }

    // 3. Dark Obsidian Cinematic Vignette Overlays
    // Top fade for crisp badge legibility
    const topVignette = c.createLinearGradient(0, 0, 0, 360);
    topVignette.addColorStop(0, 'rgba(6, 9, 19, 0.84)');
    topVignette.addColorStop(0.55, 'rgba(6, 9, 19, 0.36)');
    topVignette.addColorStop(1, 'rgba(6, 9, 19, 0)');
    c.fillStyle = topVignette;
    c.fillRect(0, 0, CARD_W, 360);

    // Side & radial vignette around photo
    const radialVignette = c.createRadialGradient(CARD_W / 2, 520, 220, CARD_W / 2, 540, 880);
    radialVignette.addColorStop(0, 'rgba(6, 9, 19, 0)');
    radialVignette.addColorStop(1, 'rgba(6, 9, 19, 0.68)');
    c.fillStyle = radialVignette;
    c.fillRect(0, 0, CARD_W, 1200);

    // Deep obsidian lower melt from photo into content surface
    const lowerMelt = c.createLinearGradient(0, 480, 0, 1240);
    lowerMelt.addColorStop(0, 'rgba(6, 9, 19, 0)');
    lowerMelt.addColorStop(0.45, 'rgba(6, 9, 19, 0.62)');
    lowerMelt.addColorStop(0.78, 'rgba(6, 9, 19, 0.94)');
    lowerMelt.addColorStop(1, '#060913');
    c.fillStyle = lowerMelt;
    c.fillRect(0, 480, CARD_W, 760);

    // Solid obsidian lower canvas
    c.fillStyle = '#060913';
    c.fillRect(0, 1238, CARD_W, CARD_H - 1238);

    // Subtle ambient cyan/gold glow behind lower typography
    const glowCyan = c.createRadialGradient(900, 1320, 20, 900, 1320, 520);
    glowCyan.addColorStop(0, 'rgba(0, 242, 254, 0.11)');
    glowCyan.addColorStop(1, 'rgba(6, 9, 19, 0)');
    c.fillStyle = glowCyan;
    c.fillRect(0, 900, CARD_W, 1020);

    const glowGold = c.createRadialGradient(160, 1660, 20, 160, 1660, 480);
    glowGold.addColorStop(0, 'rgba(245, 158, 11, 0.10)');
    glowGold.addColorStop(1, 'rgba(6, 9, 19, 0)');
    c.fillStyle = glowGold;
    c.fillRect(0, 1100, CARD_W, 820);

    // 4. Gold / Cyan Accent Frame & Hairline Inner Border
    const borderGrad = c.createLinearGradient(36, 36, CARD_W - 36, CARD_H - 36);
    borderGrad.addColorStop(0, '#fbbf24');
    borderGrad.addColorStop(0.35, '#00f2fe');
    borderGrad.addColorStop(0.68, '#38bdf8');
    borderGrad.addColorStop(1, '#f59e0b');

    c.save();
    drawRoundedRect(c, 36, 36, CARD_W - 72, CARD_H - 72, 42);
    c.strokeStyle = borderGrad;
    c.lineWidth = 3.2;
    c.stroke();

    drawRoundedRect(c, 50, 50, CARD_W - 100, CARD_H - 100, 32);
    c.strokeStyle = 'rgba(255, 255, 255, 0.11)';
    c.lineWidth = 1.25;
    c.stroke();
    c.restore();

    // 5. Top Badges Row (Plate Badge + Visited Status Badge)
    const badgeY = 92;
    const badgeH = 56;
    const leftPad = 84;
    const rightEdge = CARD_W - 84;

    // Plate badge (left)
    const plateText = `PLAKA ${plateStr}`;
    c.font = `700 24px ${fontHead}`;
    const plateTextW = c.measureText(plateText).width;
    const platePillW = plateTextW + 70;

    c.save();
    drawRoundedRect(c, leftPad, badgeY, platePillW, badgeH, 28);
    c.fillStyle = 'rgba(6, 9, 19, 0.78)';
    c.fill();
    c.strokeStyle = 'rgba(251, 191, 36, 0.65)';
    c.lineWidth = 2;
    c.stroke();

    // Gold dot inside plate pill
    c.beginPath();
    c.arc(leftPad + 28, badgeY + badgeH / 2, 6, 0, Math.PI * 2);
    c.fillStyle = '#fbbf24';
    c.fill();

    c.fillStyle = '#fef3c7';
    c.textBaseline = 'middle';
    c.fillText(plateText, leftPad + 46, badgeY + badgeH / 2 + 1);
    c.restore();

    // Visited status badge (right)
    const statusText = isVisited ? '✓ ZİYARET EDİLDİ' : '⏳ GELECEK ROTA';
    c.font = `700 23px ${fontHead}`;
    const statusTextW = c.measureText(statusText).width;
    const statusPillW = statusTextW + 52;
    const statusX = rightEdge - statusPillW;

    c.save();
    drawRoundedRect(c, statusX, badgeY, statusPillW, badgeH, 28);
    c.fillStyle = isVisited ? 'rgba(16, 185, 129, 0.22)' : 'rgba(245, 158, 11, 0.20)';
    c.fill();
    c.strokeStyle = isVisited ? 'rgba(16, 185, 129, 0.85)' : 'rgba(245, 158, 11, 0.82)';
    c.lineWidth = 2;
    c.stroke();

    c.fillStyle = isVisited ? '#6ee7b7' : '#fcd34d';
    c.textBaseline = 'middle';
    c.fillText(statusText, statusX + 26, badgeY + badgeH / 2 + 1);
    c.restore();

    // 6. Region Eyebrow & Bold City Title
    const contentW = CARD_W - leftPad * 2; // 912px
    let cursorY = 900;

    // Region pill / eyebrow
    const regionPillText = `${regionMeta.icon || '🗺️'}  ${regionLabel}`;
    c.font = `700 24px ${fontHead}`;
    const regW = Math.min(contentW, c.measureText(regionPillText).width + 44);

    c.save();
    drawRoundedRect(c, leftPad, cursorY, regW, 48, 24);
    c.fillStyle = 'rgba(15, 23, 42, 0.82)';
    c.fill();
    c.strokeStyle = 'rgba(0, 242, 254, 0.50)';
    c.lineWidth = 1.6;
    c.stroke();

    c.fillStyle = '#38bdf8';
    c.textBaseline = 'middle';
    c.fillText(truncateToWidth(c, regionPillText, regW - 36), leftPad + 22, cursorY + 25);

    if (coordsLabel && regW + 240 < contentW) {
      c.font = `500 21px ${fontBody}`;
      c.fillStyle = '#94a3b8';
      c.textAlign = 'right';
      c.fillText(coordsLabel, rightEdge, cursorY + 25);
      c.textAlign = 'left';
    }
    c.restore();

    cursorY += 74;

    // Bold Title (auto-scaled to fit cleanly on 1 line)
    let titleSize = 96;
    while (titleSize > 58) {
      c.font = `800 ${titleSize}px ${fontHead}`;
      if (c.measureText(cityTitle).width <= contentW) break;
      titleSize -= 4;
    }

    c.save();
    c.font = `800 ${titleSize}px ${fontHead}`;
    c.textBaseline = 'top';
    c.shadowColor = 'rgba(0, 0, 0, 0.72)';
    c.shadowBlur = 24;
    c.shadowOffsetY = 6;
    c.fillStyle = '#f8fafc';
    c.fillText(truncateToWidth(c, cityTitle, contentW), leftPad, cursorY);
    c.restore();

    cursorY += titleSize + 20;

    // Gold-Cyan Accent Rule under Title
    const accentRule = c.createLinearGradient(leftPad, cursorY, leftPad + 220, cursorY);
    accentRule.addColorStop(0, '#fbbf24');
    accentRule.addColorStop(0.55, '#00f2fe');
    accentRule.addColorStop(1, 'rgba(0, 242, 254, 0)');
    c.save();
    drawRoundedRect(c, leftPad, cursorY, 220, 6, 3);
    c.fillStyle = accentRule;
    c.fill();
    c.restore();

    cursorY += 34;

    // 7. Quote Card
    const quoteDisplay = rawQuote ? `“${rawQuote}”` : '“Anadolu’nun kadim izlerinde bir tefekkür durağı.”';
    c.font = `italic 500 30px ${fontBody}`;
    const quoteLines = wrapText(c, quoteDisplay, contentW - 76, 3);
    const quoteLineH = 44;
    const quoteBoxH = Math.max(98, quoteLines.length * quoteLineH + 44);

    c.save();
    drawRoundedRect(c, leftPad, cursorY, contentW, quoteBoxH, 24);
    c.fillStyle = 'rgba(15, 23, 42, 0.76)';
    c.fill();
    c.strokeStyle = 'rgba(255, 255, 255, 0.11)';
    c.lineWidth = 1.5;
    c.stroke();

    // Vertical Gold-Cyan Accent Bar inside quote box
    const barGrad = c.createLinearGradient(leftPad + 24, cursorY + 20, leftPad + 24, cursorY + quoteBoxH - 20);
    barGrad.addColorStop(0, '#fbbf24');
    barGrad.addColorStop(1, '#00f2fe');
    drawRoundedRect(c, leftPad + 24, cursorY + 22, 6, quoteBoxH - 44, 3);
    c.fillStyle = barGrad;
    c.fill();

    c.font = `italic 500 30px ${fontBody}`;
    c.fillStyle = '#e2e8f0';
    c.textBaseline = 'top';
    quoteLines.forEach((line, idx) => {
      c.fillText(line, leftPad + 48, cursorY + 22 + idx * quoteLineH);
    });
    c.restore();

    cursorY += quoteBoxH + 38;

    // 8. Top 3 Landmarks
    if (landmarks.length > 0) {
      c.save();
      c.font = `700 22px ${fontHead}`;
      c.fillStyle = '#fbbf24';
      c.textBaseline = 'top';
      c.fillText('🏛️  ÖNE ÇIKAN MİRAS & DURAKLAR', leftPad, cursorY);
      c.restore();

      cursorY += 40;

      const rowH = 78;
      const rowGap = 14;
      landmarks.forEach((lm, idx) => {
        const ry = cursorY + idx * (rowH + rowGap);
        if (ry + rowH > 1755) return; // Never collide with footer

        c.save();
        drawRoundedRect(c, leftPad, ry, contentW, rowH, 20);
        c.fillStyle = 'rgba(15, 23, 42, 0.84)';
        c.fill();
        c.strokeStyle = idx === 0
          ? 'rgba(251, 191, 36, 0.36)'
          : 'rgba(56, 189, 248, 0.25)';
        c.lineWidth = 1.5;
        c.stroke();

        // Number badge
        const numBoxSize = 44;
        const numX = leftPad + 18;
        const numY = ry + (rowH - numBoxSize) / 2;
        drawRoundedRect(c, numX, numY, numBoxSize, numBoxSize, 12);
        c.fillStyle = idx === 0 ? 'rgba(245, 158, 11, 0.18)' : 'rgba(0, 242, 254, 0.14)';
        c.fill();
        c.strokeStyle = idx === 0 ? 'rgba(251, 191, 36, 0.55)' : 'rgba(0, 242, 254, 0.48)';
        c.lineWidth = 1.3;
        c.stroke();

        c.font = `700 21px ${fontHead}`;
        c.fillStyle = idx === 0 ? '#fcd34d' : '#38bdf8';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(`0${idx + 1}`, numX + numBoxSize / 2, ry + rowH / 2 + 1);

        // Landmark title
        c.textAlign = 'left';
        c.font = `600 28px ${fontBody}`;
        c.fillStyle = '#f1f5f9';
        const lmText = truncateToWidth(c, lm, contentW - 108);
        c.fillText(lmText, numX + numBoxSize + 20, ry + rowH / 2 + 1);
        c.restore();
      });
    }

    // 9. Footer ("DİJİTAL SEYYAH • ANADOLU SEYAHATNAMESİ")
    const footerLineY = 1776;
    const footerGrad = c.createLinearGradient(leftPad, footerLineY, rightEdge, footerLineY);
    footerGrad.addColorStop(0, 'rgba(251, 191, 36, 0)');
    footerGrad.addColorStop(0.25, 'rgba(251, 191, 36, 0.65)');
    footerGrad.addColorStop(0.75, 'rgba(0, 242, 254, 0.65)');
    footerGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');

    c.save();
    c.fillStyle = footerGrad;
    c.fillRect(leftPad, footerLineY, contentW, 2);

    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = `700 24px ${fontHead}`;
    const textGrad = c.createLinearGradient(leftPad + 120, 0, rightEdge - 120, 0);
    textGrad.addColorStop(0, '#fcd34d');
    textGrad.addColorStop(0.5, '#f8fafc');
    textGrad.addColorStop(1, '#38bdf8');
    c.fillStyle = textGrad;
    c.fillText(FOOTER_TEXT, CARD_W / 2, 1814);

    c.font = `500 17px ${fontBody}`;
    c.fillStyle = '#94a3b8';
    c.fillText('SEFER DER VATAN • 81 İL KEŞİF DEFTERİ', CARD_W / 2, 1846);
    c.restore();
  }

  // =========================================================================
  // Export, Download & Native Share / Clipboard Fallback
  // =========================================================================

  function canvasToPngBlob(canvas) {
    return new Promise((resolve, reject) => {
      if (typeof canvas.toBlob === 'function') {
        try {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas toBlob returned null'));
            }
          }, 'image/png');
        } catch (err) {
          reject(err);
        }
        return;
      }

      try {
        const dataUrl = canvas.toDataURL('image/png');
        const parts = dataUrl.split(',');
        const byteStr = atob(parts[1]);
        const arr = new Uint8Array(byteStr.length);
        for (let i = 0; i < byteStr.length; i++) {
          arr[i] = byteStr.charCodeAt(i);
        }
        resolve(new Blob([arr], { type: 'image/png' }));
      } catch (err) {
        reject(err);
      }
    });
  }

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function renderStoryCardCanvas(cityKey, ctx) {
    const safeCtx = ctx || activeCtx;
    const data = getAppData(safeCtx);
    const provinces = (data && data.provinces) || {};
    const province = provinces[cityKey];
    if (!province) {
      throw new Error(`Province not found: ${cityKey}`);
    }

    const regionMeta = getRegionMeta(data, province);
    const [, bannerImg] = await Promise.all([
      waitForFontsBriefly(),
      resolveBestBannerImage(cityKey, province)
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = CARD_W;
    canvas.height = CARD_H;

    paintStoryCard(canvas, { province, regionMeta, img: bannerImg });

    const slug = slugify(province.slug || province.name || cityKey);
    const filename = `${slug}_hikaye_karti.png`;

    try {
      const blob = await canvasToPngBlob(canvas);
      return { canvas, blob, filename, province, usedFallbackGradient: !bannerImg };
    } catch (_) {
      // SecurityError on file:// when local image taints canvas -> re-render cleanly with gradient
      const cleanCanvas = document.createElement('canvas');
      cleanCanvas.width = CARD_W;
      cleanCanvas.height = CARD_H;
      paintStoryCard(cleanCanvas, { province, regionMeta, img: null });
      const blob = await canvasToPngBlob(cleanCanvas);
      return { canvas: cleanCanvas, blob, filename, province, usedFallbackGradient: true };
    }
  }

  async function downloadStoryCard(cityKey, ctx, triggerBtn) {
    if (isRendering) return;
    const safeCtx = ctx || activeCtx;
    isRendering = true;

    const originalHtml = triggerBtn ? triggerBtn.innerHTML : '';
    if (triggerBtn) {
      triggerBtn.disabled = true;
      triggerBtn.innerHTML = '⏳ Kart Hazırlanıyor...';
    }

    try {
      const result = await renderStoryCardCanvas(cityKey, safeCtx);
      triggerBlobDownload(result.blob, result.filename);

      if (result.usedFallbackGradient) {
        notifyToast(
          safeCtx,
          `📤 ${result.province.name} hikaye kartı (${result.filename}) gradyan modunda indirildi!`
        );
      } else {
        notifyToast(
          safeCtx,
          `📤 ${result.province.name} hikaye kartı (${result.filename}) indirildi!`
        );
      }
    } catch (err) {
      notifyToast(safeCtx, '❌ Hikaye kartı oluşturulurken bir hata oluştu.');
    } finally {
      isRendering = false;
      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = originalHtml;
      }
    }
  }

  function buildShareText(cityKey, province, data) {
    const regionMeta = getRegionMeta(data, province);
    const plate = formatPlate(province.plate);
    const quote = String(province.custom_quote || province.quote || '').trim();
    const landmarks = Array.isArray(province.landmarks)
      ? province.landmarks.filter(Boolean).slice(0, 3)
      : [];
    const statusLabel = province.visited ? '✓ Ziyaret Edildi' : '⏳ Keşif Rotasında';
    const shareUrl = `${window.location.origin}${window.location.pathname}#city/${encodeURIComponent(cityKey)}`;

    const lines = [
      `📍 ${province.name} (${plate}) — ${regionMeta.name} [${statusLabel}]`
    ];
    if (quote) lines.push(`“${quote}”`);
    if (landmarks.length > 0) lines.push(`🏛️ Duraklar: ${landmarks.join(' • ')}`);
    lines.push(`${FOOTER_TEXT}`);
    lines.push(shareUrl);

    return {
      title: `${province.name} — Anadolu Seyahatnamesi`,
      text: lines.join('\n'),
      url: shareUrl
    };
  }

  async function copyTextWithFallback(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        // Continue to textarea fallback
      }
    }

    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(ta);
      return Boolean(copied);
    } catch (_) {
      return false;
    }
  }

  async function shareCityWithFallback(cityKey, ctx, triggerBtn) {
    const safeCtx = ctx || activeCtx;
    const data = getAppData(safeCtx);
    const province = data && data.provinces && data.provinces[cityKey];
    if (!province) return;

    const payload = buildShareText(cityKey, province, data);
    const originalHtml = triggerBtn ? triggerBtn.innerHTML : '';

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        if (triggerBtn) {
          triggerBtn.disabled = true;
          triggerBtn.innerHTML = '⏳ Paylaşılıyor...';
        }

        // Try sharing generated PNG story card file when supported
        if (typeof File === 'function' && typeof navigator.canShare === 'function') {
          try {
            const card = await renderStoryCardCanvas(cityKey, safeCtx);
            const file = new File([card.blob], card.filename, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: payload.title,
                text: payload.text,
                files: [file]
              });
              notifyToast(safeCtx, `📲 ${province.name} hikaye kartı paylaşıldı!`);
              return;
            }
          } catch (fileShareErr) {
            if (fileShareErr && fileShareErr.name === 'AbortError') return;
          }
        }

        await navigator.share({
          title: payload.title,
          text: payload.text,
          url: payload.url
        });
        notifyToast(safeCtx, `📲 ${province.name} hikaye özeti paylaşıldı!`);
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      } finally {
        if (triggerBtn) {
          triggerBtn.disabled = false;
          triggerBtn.innerHTML = originalHtml;
        }
      }
    }

    // Fallback: Copy formatted share text + link to clipboard
    const copied = await copyTextWithFallback(payload.text);
    if (copied) {
      notifyToast(safeCtx, `📋 ${province.name} hikaye özeti ve bağlantısı panoya kopyalandı!`);
    } else {
      notifyToast(safeCtx, '❌ Paylaşım metni kopyalanamadı.');
    }
  }

  // =========================================================================
  // Styles & DOM Injection (MutationObserver on #viewport-content)
  // =========================================================================

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .${BAR_CLASS} {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding: 12px 16px;
        border-radius: var(--radius-lg, 14px);
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.84) 0%, rgba(17, 29, 52, 0.78) 100%);
        border: 1px solid rgba(251, 191, 36, 0.28);
        box-shadow: 0 10px 26px rgba(2, 6, 23, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(12px);
      }

      body.light-theme .${BAR_CLASS} {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(241, 245, 249, 0.9) 100%);
        border-color: rgba(217, 119, 6, 0.32);
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
      }

      .seyyah-share-card-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .seyyah-share-card-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        font-family: var(--font-heading);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: #fcd34d;
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.38);
      }

      body.light-theme .seyyah-share-card-badge {
        color: #b45309;
        background: rgba(245, 158, 11, 0.14);
      }

      .seyyah-share-card-hint {
        font-size: 0.8rem;
        color: var(--text-secondary);
      }

      .seyyah-share-card-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .seyyah-share-card-cta {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: var(--radius-md, 10px);
        font-family: var(--font-heading);
        font-size: 0.84rem;
        font-weight: 700;
        cursor: pointer;
        border: 1px solid rgba(251, 191, 36, 0.55);
        background: linear-gradient(135deg, #fbbf24 0%, #38bdf8 100%);
        color: #04101c;
        box-shadow: 0 4px 16px rgba(251, 191, 36, 0.24), 0 4px 16px rgba(0, 242, 254, 0.18);
        transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
      }

      .seyyah-share-card-cta:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 22px rgba(251, 191, 36, 0.36), 0 6px 20px rgba(0, 242, 254, 0.28);
      }

      .seyyah-share-card-cta:disabled {
        opacity: 0.7;
        cursor: wait;
      }
    `;
    document.head.appendChild(style);
  }

  function createShareCardBar(cityKey, provinceName) {
    const bar = document.createElement('div');
    bar.className = BAR_CLASS;
    bar.setAttribute('data-city-key', cityKey);

    const meta = document.createElement('div');
    meta.className = 'seyyah-share-card-meta';

    const badge = document.createElement('span');
    badge.className = 'seyyah-share-card-badge';
    badge.textContent = '✨ 1080×1920 STORY PNG';

    const hint = document.createElement('span');
    hint.className = 'seyyah-share-card-hint';
    hint.textContent = `${provinceName} için Instagram & WhatsApp hikaye kartı hazır`;

    meta.appendChild(badge);
    meta.appendChild(hint);

    const actions = document.createElement('div');
    actions.className = 'seyyah-share-card-actions';

    const downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.id = 'seyyah-share-card-btn';
    downloadBtn.className = 'seyyah-share-card-cta';
    downloadBtn.textContent = '📤 Hikaye Kartı İndir (PNG)';
    downloadBtn.addEventListener('click', () => {
      downloadStoryCard(cityKey, activeCtx, downloadBtn);
    });

    const nativeShareBtn = document.createElement('button');
    nativeShareBtn.type = 'button';
    nativeShareBtn.id = 'seyyah-native-share-btn';
    nativeShareBtn.className = 'btn btn-outline';
    nativeShareBtn.textContent = '📲 Paylaş / Kopyala';
    nativeShareBtn.addEventListener('click', () => {
      shareCityWithFallback(cityKey, activeCtx, nativeShareBtn);
    });

    actions.appendChild(downloadBtn);
    actions.appendChild(nativeShareBtn);

    bar.appendChild(meta);
    bar.appendChild(actions);

    return bar;
  }

  function syncCityShareUI() {
    if (!activeCtx || !activeCtx.state) return;
    const state = activeCtx.state;
    if (state.currentView !== 'city' || !state.selectedCityKey) return;

    const cityKey = state.selectedCityKey;
    const data = getAppData(activeCtx);
    const province = data && data.provinces && data.provinces[cityKey];
    if (!province) return;

    const viewport = document.getElementById('viewport-content');
    if (!viewport) return;

    const detailView = viewport.querySelector('.city-detail-view');
    if (!detailView) return;

    const narratorBar = detailView.querySelector('.voice-narrator-bar');
    const heroEl = detailView.querySelector('.city-hero');
    const existingBar = detailView.querySelector(`.${BAR_CLASS}`);

    // If already injected for this city, reposition beside .voice-narrator-bar only if needed
    if (existingBar && existingBar.getAttribute('data-city-key') === cityKey) {
      if (narratorBar && narratorBar.nextElementSibling !== existingBar) {
        narratorBar.insertAdjacentElement('afterend', existingBar);
      }
      return;
    }

    // Remove any stale bar from previous city render
    detailView.querySelectorAll(`.${BAR_CLASS}`).forEach((el) => el.remove());
    detailView.querySelectorAll(`.${BOTTOM_BTN_CLASS}`).forEach((el) => el.remove());

    const bar = createShareCardBar(cityKey, province.name || cityKey);

    if (narratorBar && narratorBar.parentNode) {
      narratorBar.insertAdjacentElement('afterend', bar);
    } else if (heroEl && heroEl.parentNode === detailView) {
      heroEl.insertAdjacentElement('afterend', bar);
    } else {
      detailView.insertBefore(bar, detailView.firstChild);
    }

    // Also add a quick trigger inside the bottom .city-actions-bar right next to #city-share-btn
    const bottomActionsBar = detailView.querySelector('.city-actions-bar');
    if (bottomActionsBar) {
      const btnGroup = bottomActionsBar.lastElementChild || bottomActionsBar;
      const bottomBtn = document.createElement('button');
      bottomBtn.type = 'button';
      bottomBtn.className = `btn btn-outline ${BOTTOM_BTN_CLASS}`;
      bottomBtn.textContent = '📤 Hikaye Kartı (PNG)';
      bottomBtn.addEventListener('click', () => {
        downloadStoryCard(cityKey, activeCtx, bottomBtn);
      });

      const shareBtn = btnGroup.querySelector('#city-share-btn');
      if (shareBtn && shareBtn.parentNode === btnGroup) {
        shareBtn.insertAdjacentElement('afterend', bottomBtn);
      } else {
        btnGroup.appendChild(bottomBtn);
      }
    }
  }

  function scheduleSync() {
    if (injectRafPending) return;
    injectRafPending = true;
    const raf =
      typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame
        : (fn) => window.setTimeout(fn, 0);

    raf(() => {
      injectRafPending = false;
      syncCityShareUI();
    });
  }

  function observeViewport() {
    const viewport = document.getElementById('viewport-content');
    if (!viewport || typeof MutationObserver !== 'function') return;

    if (viewportObserver) {
      viewportObserver.disconnect();
    }

    viewportObserver = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i++) {
        const added = mutations[i].addedNodes;
        for (let j = 0; j < added.length; j++) {
          const node = added[j];
          if (
            node.nodeType === 1 &&
            !node.classList.contains(BAR_CLASS) &&
            !node.classList.contains(BOTTOM_BTN_CLASS)
          ) {
            scheduleSync();
            return;
          }
        }
      }
    });

    viewportObserver.observe(viewport, { childList: true, subtree: true });
    syncCityShareUI();
  }

  function init(ctx) {
    activeCtx = ctx || activeCtx;
    ensureStyles();

    if (initialized) {
      syncCityShareUI();
      return;
    }
    initialized = true;
    observeViewport();
  }

  window.SEYYAH_MODULES.shareCard = {
    init,
    renderStoryCardCanvas,
    downloadStoryCard,
    shareCityWithFallback
  };
})();
