/**
 * Anadolu Dijital Kartpostal Stüdyosu (HTML5 Canvas)
 * 81 İl için 1200×675 HD PNG Kartpostal Tasarlama ve İndirme Modülü
 * Registers on window.SEYYAH_MODULES.postcard
 */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const CANVAS_W = 1200;
  const CANVAS_H = 675;
  const SIGNATURE_TEXT = 'Dijital Seyyah • Anadolu Seyahatnamesi';

  const THEMES = [
    {
      id: 'cyber-sufi',
      name: 'Cyber-Sufi Gece',
      icon: '🌌',
      desc: 'Derin gece gradyanı, turkuaz & altın vurgular',
      swatch: 'linear-gradient(135deg, #070d1c 0%, #0f2544 55%, #00f2fe 100%)'
    },
    {
      id: 'seljuk-gold',
      name: 'Altın Selçuklu',
      icon: '🏛️',
      desc: 'Bordo & kehribar çerçeve, Selçuklu yıldız köşeleri',
      swatch: 'linear-gradient(135deg, #2a0d16 0%, #6b1d2f 55%, #d4a34a 100%)'
    },
    {
      id: 'minimalist-editorial',
      name: 'Minimalist Editoryal',
      icon: '☀️',
      desc: 'Temiz beyaz polaroid çerçeve, keskin tipografi',
      swatch: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 60%, #1e293b 100%)'
    }
  ];

  const DEFAULT_REGIONS = {
    '01_Marmara': { name: 'Marmara Bölgesi', icon: '🏰', color: '#38bdf8' },
    '02_Ege': { name: 'Ege Bölgesi', icon: '🌊', color: '#34d399' },
    '03_Akdeniz': { name: 'Akdeniz Bölgesi', icon: '☀️', color: '#f59e0b' },
    '04_IcAnadolu': { name: 'İç Anadolu Bölgesi', icon: '🌾', color: '#fbbf24' },
    '05_Karadeniz': { name: 'Karadeniz Bölgesi', icon: '🌲', color: '#10b981' },
    '06_DoguAnadolu': { name: 'Doğu Anadolu Bölgesi', icon: '🏔️', color: '#a855f7' },
    '07_GuneydoguAnadolu': { name: 'Güneydoğu Anadolu Bölgesi', icon: '🏜️', color: '#f97316' }
  };

  // Module-scoped state
  const studioState = {
    cityKey: null,
    photoType: 'banner', // 'banner' | 'gallery'
    theme: 'cyber-sufi',
    quote: '',
    showBadge: true,
    showCoords: true,
    showSignature: true
  };

  // Cache loaded images: src -> { status: 'loaded'|'error', img?: HTMLImageElement, taintedRisk?: boolean }
  const imageCache = new Map();

  function fallbackEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
    return `${Math.abs(la).toFixed(4)}° ${ns}, ${Math.abs(ln).toFixed(4)}° ${ew}`;
  }

  function slugifyFilename(str) {
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
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'kartpostal';
  }

  function getProvincePhotoSrc(key, province, photoType) {
    if (!province) return '';
    if (photoType === 'gallery') {
      if (province.gallery_rel) return province.gallery_rel;
      if (Array.isArray(province.images) && province.images[1]) return province.images[1];
      return `${key}/gallery.jpg`;
    }
    if (province.banner_rel) return province.banner_rel;
    if (Array.isArray(province.images) && province.images[0]) return province.images[0];
    return `${key}/banner.jpg`;
  }

  function getRegionMeta(data, province) {
    const code = province && province.region_code;
    const regions = (data && data.regions) || {};
    const meta = regions[code] || DEFAULT_REGIONS[code];
    if (meta) return meta;
    return {
      name: (province && province.region) ? `${province.region} Bölgesi` : 'Anadolu',
      icon: '🗺️',
      color: '#38bdf8'
    };
  }

  function loadImageAsset(src) {
    if (!src) {
      return Promise.resolve({ status: 'error', img: null });
    }
    if (imageCache.has(src)) {
      return Promise.resolve(imageCache.get(src));
    }

    const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';

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
            // Retry without CORS so live preview still displays
            attemptLoad(false);
          } else {
            const entry = { status: 'error', img: null, taintedRisk: false };
            imageCache.set(src, entry);
            resolve(entry);
          }
        };
        img.src = src;
      };

      // Avoid setting crossOrigin on file:// because browsers reject file:// CORS loads
      attemptLoad(!isFileProtocol);
    });
  }

  // =========================================================================
  // Canvas Drawing Utilities
  // =========================================================================

  function drawRoundedRect(c, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
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

  function wrapText(c, text, maxWidth, maxLines) {
    const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
    if (!cleaned) return [];
    const words = cleaned.split(' ');
    const lines = [];
    let current = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const test = current ? `${current} ${word}` : word;
      if (c.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        if (current) {
          lines.push(current);
          current = word;
        } else {
          // Single very long word
          lines.push(word);
          current = '';
        }
        if (lines.length === maxLines) {
          break;
        }
      }
    }

    if (current && lines.length < maxLines) {
      lines.push(current);
    }

    // Add ellipsis if truncated
    const totalWordsUsed = lines.join(' ').split(' ').length;
    if (totalWordsUsed < words.length && lines.length > 0) {
      let last = lines[lines.length - 1];
      while (last.length > 3 && c.measureText(`${last}…`).width > maxWidth) {
        last = last.slice(0, -1).trim();
      }
      lines[lines.length - 1] = `${last}…`;
    }

    return lines;
  }

  function drawSeljukStar(c, cx, cy, r, strokeStyle, fillStyle) {
    c.save();
    c.translate(cx, cy);
    const half = r * 0.72;

    for (let rot = 0; rot < 2; rot++) {
      c.save();
      c.rotate((rot * Math.PI) / 4);
      c.beginPath();
      c.rect(-half, -half, half * 2, half * 2);
      if (fillStyle) {
        c.fillStyle = fillStyle;
        c.fill();
      }
      c.strokeStyle = strokeStyle;
      c.lineWidth = 1.6;
      c.stroke();
      c.restore();
    }

    c.beginPath();
    c.arc(0, 0, r * 0.22, 0, Math.PI * 2);
    c.fillStyle = strokeStyle;
    c.fill();
    c.restore();
  }

  function drawFallbackGradient(c, x, y, w, h, themeId, regionColor) {
    c.save();
    const grad = c.createLinearGradient(x, y, x + w, y + h);
    if (themeId === 'seljuk-gold') {
      grad.addColorStop(0, '#2a0d16');
      grad.addColorStop(0.5, '#591b2b');
      grad.addColorStop(1, '#9c6621');
    } else if (themeId === 'minimalist-editorial') {
      grad.addColorStop(0, '#e2e8f0');
      grad.addColorStop(0.5, '#cbd5e1');
      grad.addColorStop(1, '#94a3b8');
    } else {
      grad.addColorStop(0, '#070d1c');
      grad.addColorStop(0.52, '#0f2140');
      grad.addColorStop(1, '#153452');
    }
    c.fillStyle = grad;
    c.fillRect(x, y, w, h);

    // Subtle decorative orb using region color
    const orb = c.createRadialGradient(
      x + w * 0.75,
      y + h * 0.28,
      20,
      x + w * 0.75,
      y + h * 0.28,
      w * 0.45
    );
    orb.addColorStop(0, regionColor ? `${regionColor}44` : 'rgba(0, 242, 254, 0.22)');
    orb.addColorStop(1, 'rgba(0, 0, 0, 0)');
    c.fillStyle = orb;
    c.fillRect(x, y, w, h);

    // Subtle mountain silhouette
    c.beginPath();
    c.moveTo(x, y + h);
    c.lineTo(x + w * 0.18, y + h * 0.68);
    c.lineTo(x + w * 0.36, y + h * 0.78);
    c.lineTo(x + w * 0.58, y + h * 0.55);
    c.lineTo(x + w * 0.76, y + h * 0.72);
    c.lineTo(x + w * 0.92, y + h * 0.62);
    c.lineTo(x + w, y + h * 0.74);
    c.lineTo(x + w, y + h);
    c.closePath();
    c.fillStyle = themeId === 'minimalist-editorial'
      ? 'rgba(15, 23, 42, 0.12)'
      : 'rgba(255, 255, 255, 0.06)';
    c.fill();
    c.restore();
  }

  // =========================================================================
  // Theme Renderers (1200 x 675)
  // =========================================================================

  function renderCyberSufi(c, opts) {
    const { province, regionMeta, img, quote, showBadge, showCoords, showSignature } = opts;

    // 1. Photo or deep cosmic fallback
    if (img) {
      drawImageCover(c, img, 0, 0, CANVAS_W, CANVAS_H);
    } else {
      drawFallbackGradient(c, 0, 0, CANVAS_W, CANVAS_H, 'cyber-sufi', regionMeta.color);
    }

    // 2. Atmospheric dark cyber-sufi overlays
    const vGrad = c.createLinearGradient(0, 0, 0, CANVAS_H);
    vGrad.addColorStop(0, 'rgba(7, 13, 28, 0.58)');
    vGrad.addColorStop(0.42, 'rgba(10, 17, 34, 0.34)');
    vGrad.addColorStop(0.75, 'rgba(7, 13, 28, 0.80)');
    vGrad.addColorStop(1, 'rgba(5, 9, 20, 0.95)');
    c.fillStyle = vGrad;
    c.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Subtle cyan & gold radial auras
    const cyanGlow = c.createRadialGradient(140, 110, 10, 140, 110, 440);
    cyanGlow.addColorStop(0, 'rgba(0, 242, 254, 0.16)');
    cyanGlow.addColorStop(1, 'rgba(0, 242, 254, 0)');
    c.fillStyle = cyanGlow;
    c.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const goldGlow = c.createRadialGradient(1060, 560, 10, 1060, 560, 400);
    goldGlow.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
    goldGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    c.fillStyle = goldGlow;
    c.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Subtle sacred geometry watermark in upper right
    c.save();
    c.globalAlpha = 0.12;
    drawSeljukStar(c, CANVAS_W - 140, 160, 74, '#00f2fe', null);
    drawSeljukStar(c, CANVAS_W - 140, 160, 46, '#f59e0b', null);
    c.restore();

    // 3. Sleek cyan-to-gold outer frame
    const frameGrad = c.createLinearGradient(26, 26, CANVAS_W - 26, CANVAS_H - 26);
    frameGrad.addColorStop(0, 'rgba(0, 242, 254, 0.65)');
    frameGrad.addColorStop(0.5, 'rgba(79, 172, 254, 0.25)');
    frameGrad.addColorStop(1, 'rgba(245, 158, 11, 0.65)');
    drawRoundedRect(c, 26, 26, CANVAS_W - 52, CANVAS_H - 52, 18);
    c.strokeStyle = frameGrad;
    c.lineWidth = 2;
    c.stroke();

    // Corner L-accents
    const corners = [
      [26, 26, 1, 1, '#00f2fe'],
      [CANVAS_W - 26, 26, -1, 1, '#38bdf8'],
      [26, CANVAS_H - 26, 1, -1, '#38bdf8'],
      [CANVAS_W - 26, CANVAS_H - 26, -1, -1, '#f59e0b']
    ];
    corners.forEach(([cx, cy, dx, dy, color]) => {
      c.save();
      c.strokeStyle = color;
      c.lineWidth = 3.5;
      c.beginPath();
      c.moveTo(cx + dx * 38, cy);
      c.lineTo(cx, cy);
      c.lineTo(cx, cy + dy * 38);
      c.stroke();
      c.restore();
    });

    // 4. Top-Left: Plate & Region Badge
    if (showBadge) {
      const badgeText = `${formatPlate(province.plate)}  •  ${regionMeta.name.toUpperCase()}`;
      c.font = '700 17px "Outfit", "Segoe UI", system-ui, sans-serif';
      const tw = c.measureText(badgeText).width;
      const bw = tw + 40;
      const bh = 42;
      drawRoundedRect(c, 58, 56, bw, bh, 21);
      c.fillStyle = 'rgba(10, 18, 36, 0.78)';
      c.fill();
      c.strokeStyle = 'rgba(0, 242, 254, 0.55)';
      c.lineWidth = 1.5;
      c.stroke();

      c.fillStyle = '#00f2fe';
      c.textBaseline = 'middle';
      c.textAlign = 'left';
      c.fillText(badgeText, 78, 56 + bh / 2 + 1);
    }

    // 5. Top-Right: GPS Coordinates
    if (showCoords) {
      const coords = formatCoords(province.lat, province.lng);
      if (coords) {
        const label = `GPS  ${coords}`;
        c.font = '600 15px "JetBrains Mono", "Consolas", monospace';
        const tw = c.measureText(label).width;
        const bw = tw + 34;
        const bh = 38;
        const bx = CANVAS_W - 58 - bw;
        drawRoundedRect(c, bx, 58, bw, bh, 19);
        c.fillStyle = 'rgba(10, 18, 36, 0.72)';
        c.fill();
        c.strokeStyle = 'rgba(245, 158, 11, 0.48)';
        c.lineWidth = 1.3;
        c.stroke();

        c.fillStyle = '#fde68a';
        c.textBaseline = 'middle';
        c.textAlign = 'left';
        c.fillText(label, bx + 17, 58 + bh / 2 + 1);
      }
    }

    // 6. Bottom-Left: City Name + Accent Bar + Quote
    const leftX = 62;
    const quoteText = (quote || '').trim();
    c.font = '400 italic 24px "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif';
    const quoteLines = wrapText(c, quoteText ? `“${quoteText}”` : '', 860, 3);
    const quoteBlockHeight = quoteLines.length * 34;

    const baseBottomY = CANVAS_H - 64;
    const quoteStartY = baseBottomY - quoteBlockHeight - (showSignature ? 24 : 0);
    const dividerY = quoteLines.length > 0 ? quoteStartY - 22 : baseBottomY - 46;
    const titleY = dividerY - 26;

    // City Title
    c.save();
    c.font = '800 72px "Outfit", "Segoe UI", system-ui, sans-serif';
    c.textBaseline = 'alphabetic';
    c.textAlign = 'left';
    c.shadowColor = 'rgba(0, 0, 0, 0.65)';
    c.shadowBlur = 20;
    c.shadowOffsetY = 4;
    c.fillStyle = '#f8fafc';
    c.fillText(province.name || '', leftX, titleY);
    c.restore();

    // Cyan-Gold Gradient Rule
    const barGrad = c.createLinearGradient(leftX, dividerY, leftX + 150, dividerY);
    barGrad.addColorStop(0, '#00f2fe');
    barGrad.addColorStop(1, '#f59e0b');
    drawRoundedRect(c, leftX, dividerY, 150, 4, 2);
    c.fillStyle = barGrad;
    c.fill();

    // Quote Lines
    if (quoteLines.length > 0) {
      c.save();
      c.font = '400 italic 24px "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif';
      c.fillStyle = 'rgba(241, 245, 249, 0.92)';
      c.textBaseline = 'top';
      c.textAlign = 'left';
      c.shadowColor = 'rgba(0, 0, 0, 0.7)';
      c.shadowBlur = 10;
      quoteLines.forEach((line, idx) => {
        c.fillText(line, leftX, quoteStartY + idx * 34);
      });
      c.restore();
    }

    // 7. Bottom-Right Signature
    if (showSignature) {
      c.save();
      c.font = '600 15px "Outfit", "Segoe UI", system-ui, sans-serif';
      c.fillStyle = 'rgba(148, 163, 184, 0.92)';
      c.textAlign = 'right';
      c.textBaseline = 'alphabetic';
      c.fillText(`✦  ${SIGNATURE_TEXT}`, CANVAS_W - 60, CANVAS_H - 48);
      c.restore();
    }
  }

  function renderSeljukGold(c, opts) {
    const { province, regionMeta, img, quote, showBadge, showCoords, showSignature } = opts;

    // 1. Deep burgundy outer mat
    const bgGrad = c.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    bgGrad.addColorStop(0, '#230a12');
    bgGrad.addColorStop(0.5, '#3b111e');
    bgGrad.addColorStop(1, '#240b13');
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 2. Inner framed photo area
    const pad = 34;
    const innerX = pad;
    const innerY = pad;
    const innerW = CANVAS_W - pad * 2;
    const innerH = CANVAS_H - pad * 2;

    c.save();
    c.beginPath();
    c.rect(innerX, innerY, innerW, innerH);
    c.clip();

    if (img) {
      drawImageCover(c, img, innerX, innerY, innerW, innerH);
    } else {
      drawFallbackGradient(c, innerX, innerY, innerW, innerH, 'seljuk-gold', regionMeta.color);
    }

    // Warm amber-burgundy vignette overlay
    const warmGrad = c.createLinearGradient(0, innerY, 0, innerY + innerH);
    warmGrad.addColorStop(0, 'rgba(35, 10, 18, 0.56)');
    warmGrad.addColorStop(0.4, 'rgba(58, 22, 24, 0.25)');
    warmGrad.addColorStop(0.72, 'rgba(38, 12, 18, 0.78)');
    warmGrad.addColorStop(1, 'rgba(26, 7, 13, 0.95)');
    c.fillStyle = warmGrad;
    c.fillRect(innerX, innerY, innerW, innerH);

    // Subtle warm golden glow from center-bottom
    const goldAura = c.createRadialGradient(CANVAS_W / 2, CANVAS_H - 120, 30, CANVAS_W / 2, CANVAS_H - 120, 520);
    goldAura.addColorStop(0, 'rgba(212, 163, 74, 0.18)');
    goldAura.addColorStop(1, 'rgba(212, 163, 74, 0)');
    c.fillStyle = goldAura;
    c.fillRect(innerX, innerY, innerW, innerH);
    c.restore();

    // 3. Double ornate gold filigree border
    const goldGrad = c.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    goldGrad.addColorStop(0, '#f3d078');
    goldGrad.addColorStop(0.35, '#c89236');
    goldGrad.addColorStop(0.65, '#f5d78c');
    goldGrad.addColorStop(1, '#b67d28');

    c.strokeStyle = goldGrad;
    c.lineWidth = 3;
    c.strokeRect(18, 18, CANVAS_W - 36, CANVAS_H - 36);

    c.strokeStyle = 'rgba(243, 208, 120, 0.65)';
    c.lineWidth = 1.25;
    c.strokeRect(30, 30, CANVAS_W - 60, CANVAS_H - 60);

    // 4. Ornate Seljuk 8-pointed stars at all 4 corners
    const starOffset = 34;
    const starCorners = [
      [starOffset, starOffset],
      [CANVAS_W - starOffset, starOffset],
      [starOffset, CANVAS_H - starOffset],
      [CANVAS_W - starOffset, CANVAS_H - starOffset]
    ];
    starCorners.forEach(([sx, sy]) => {
      drawSeljukStar(c, sx, sy, 18, '#f3d078', '#2a0d16');
    });

    // 5. Top-Left Plate & Region Cartouche
    if (showBadge) {
      const badgeText = `${formatPlate(province.plate)}  |  ${regionMeta.name.toUpperCase()}`;
      c.font = '700 16px Georgia, "Times New Roman", serif';
      const tw = c.measureText(badgeText).width;
      const bw = tw + 42;
      const bh = 38;
      drawRoundedRect(c, 66, 62, bw, bh, 6);
      c.fillStyle = 'rgba(35, 10, 18, 0.85)';
      c.fill();
      c.strokeStyle = '#d4a34a';
      c.lineWidth = 1.5;
      c.stroke();

      c.fillStyle = '#f5d78c';
      c.textBaseline = 'middle';
      c.textAlign = 'left';
      c.fillText(badgeText, 87, 62 + bh / 2 + 1);
    }

    // 6. Top-Right GPS Coordinates
    if (showCoords) {
      const coords = formatCoords(province.lat, province.lng);
      if (coords) {
        c.font = '600 15px Georgia, "Times New Roman", serif';
        const tw = c.measureText(coords).width;
        const bw = tw + 34;
        const bh = 36;
        const bx = CANVAS_W - 66 - bw;
        drawRoundedRect(c, bx, 63, bw, bh, 6);
        c.fillStyle = 'rgba(35, 10, 18, 0.82)';
        c.fill();
        c.strokeStyle = 'rgba(212, 163, 74, 0.7)';
        c.lineWidth = 1.2;
        c.stroke();

        c.fillStyle = '#f3e1ba';
        c.textBaseline = 'middle';
        c.textAlign = 'left';
        c.fillText(coords, bx + 17, 63 + bh / 2 + 1);
      }
    }

    // 7. Bottom Centered Regal Typography
    const centerX = CANVAS_W / 2;
    const quoteText = (quote || '').trim();
    c.font = 'italic 23px Georgia, "Times New Roman", serif';
    const quoteLines = wrapText(c, quoteText ? `« ${quoteText} »` : '', 880, 3);
    const quoteBlockHeight = quoteLines.length * 33;

    const sigHeight = showSignature ? 36 : 8;
    const quoteStartY = CANVAS_H - 54 - sigHeight - quoteBlockHeight;
    const ornamentY = quoteLines.length > 0 ? quoteStartY - 22 : CANVAS_H - 108;
    const titleY = ornamentY - 26;

    // City Name in Regal Serif
    c.save();
    c.font = '700 68px Georgia, "Times New Roman", serif';
    c.textAlign = 'center';
    c.textBaseline = 'alphabetic';
    c.shadowColor = 'rgba(0, 0, 0, 0.75)';
    c.shadowBlur = 18;
    c.shadowOffsetY = 4;
    c.fillStyle = '#fdf3dc';
    c.fillText(province.name || '', centerX, titleY);
    c.restore();

    // Gold Ornament Divider with Center Diamond
    c.save();
    const lineHalf = 190;
    const lineGrad = c.createLinearGradient(centerX - lineHalf, ornamentY, centerX + lineHalf, ornamentY);
    lineGrad.addColorStop(0, 'rgba(212, 163, 74, 0)');
    lineGrad.addColorStop(0.5, '#f3d078');
    lineGrad.addColorStop(1, 'rgba(212, 163, 74, 0)');
    c.strokeStyle = lineGrad;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(centerX - lineHalf, ornamentY);
    c.lineTo(centerX + lineHalf, ornamentY);
    c.stroke();

    c.translate(centerX, ornamentY);
    c.rotate(Math.PI / 4);
    c.fillStyle = '#f3d078';
    c.fillRect(-5, -5, 10, 10);
    c.restore();

    // Wrapped Quote
    if (quoteLines.length > 0) {
      c.save();
      c.font = 'italic 23px Georgia, "Times New Roman", serif';
      c.fillStyle = '#f8ead0';
      c.textAlign = 'center';
      c.textBaseline = 'top';
      c.shadowColor = 'rgba(0, 0, 0, 0.65)';
      c.shadowBlur = 8;
      quoteLines.forEach((line, idx) => {
        c.fillText(line, centerX, quoteStartY + idx * 33);
      });
      c.restore();
    }

    // Signature
    if (showSignature) {
      c.save();
      c.font = '600 14px Georgia, "Times New Roman", serif';
      c.fillStyle = 'rgba(243, 208, 120, 0.88)';
      c.textAlign = 'center';
      c.textBaseline = 'alphabetic';
      c.fillText(`✦  ${SIGNATURE_TEXT.toUpperCase()}  ✦`, centerX, CANVAS_H - 52);
      c.restore();
    }
  }

  function renderMinimalistEditorial(c, opts) {
    const { province, regionMeta, img, quote, showBadge, showCoords, showSignature } = opts;

    // 1. Clean crisp white polaroid paper background
    c.fillStyle = '#fcfcfb';
    c.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Subtle outer hairline border
    c.strokeStyle = '#e2e8f0';
    c.lineWidth = 2;
    c.strokeRect(1, 1, CANVAS_W - 2, CANVAS_H - 2);

    // 2. Top Polaroid Photo Frame
    const photoX = 34;
    const photoY = 34;
    const photoW = CANVAS_W - 68;
    const photoH = 446;

    c.save();
    drawRoundedRect(c, photoX, photoY, photoW, photoH, 6);
    c.clip();
    if (img) {
      drawImageCover(c, img, photoX, photoY, photoW, photoH);
    } else {
      drawFallbackGradient(c, photoX, photoY, photoW, photoH, 'minimalist-editorial', regionMeta.color);
    }
    c.restore();

    // Crisp hairline around photo
    drawRoundedRect(c, photoX, photoY, photoW, photoH, 6);
    c.strokeStyle = 'rgba(15, 23, 42, 0.12)';
    c.lineWidth = 1.5;
    c.stroke();

    // 3. White Editorial Bottom Strip (y: 480..675)
    const stripTop = photoY + photoH + 22;
    const leftX = 40;
    const rightX = CANVAS_W - 40;

    // Right metadata column width
    const hasRightMeta = showBadge || showCoords || showSignature;
    const leftMaxWidth = hasRightMeta ? 760 : (CANVAS_W - 80);

    // City Name (Bold dark slate)
    c.save();
    c.font = '800 50px "Outfit", "Segoe UI", system-ui, sans-serif';
    c.fillStyle = '#0f172a';
    c.textAlign = 'left';
    c.textBaseline = 'top';
    c.fillText(province.name || '', leftX, stripTop);
    c.restore();

    // Quote under city name
    const quoteText = (quote || '').trim();
    if (quoteText) {
      c.save();
      c.font = '400 20px "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif';
      c.fillStyle = '#475569';
      c.textAlign = 'left';
      c.textBaseline = 'top';
      const lines = wrapText(c, quoteText, leftMaxWidth, 3);
      lines.forEach((line, idx) => {
        c.fillText(line, leftX, stripTop + 62 + idx * 28);
      });
      c.restore();
    }

    // Right Editorial Stamp / Metadata Stack
    if (hasRightMeta) {
      // Subtle vertical separator rule
      c.strokeStyle = '#e2e8f0';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(836, stripTop + 6);
      c.lineTo(836, CANVAS_H - 36);
      c.stroke();

      let curY = stripTop + 6;

      if (showBadge) {
        const badgeLabel = `NO. ${formatPlate(province.plate)}  •  ${regionMeta.name.toUpperCase()}`;
        c.font = '700 13px "Outfit", "Segoe UI", system-ui, sans-serif';
        const tw = c.measureText(badgeLabel).width;
        const bw = Math.min(tw + 28, 320);
        const bh = 32;
        const bx = rightX - bw;

        drawRoundedRect(c, bx, curY, bw, bh, 4);
        c.fillStyle = '#0f172a';
        c.fill();

        c.fillStyle = '#f8fafc';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(badgeLabel, bx + bw / 2, curY + bh / 2 + 0.5);
        curY += bh + 18;
      }

      if (showCoords) {
        const coords = formatCoords(province.lat, province.lng);
        if (coords) {
          c.font = '600 14px "JetBrains Mono", "Consolas", monospace';
          c.fillStyle = '#334155';
          c.textAlign = 'right';
          c.textBaseline = 'top';
          c.fillText(`GPS  ${coords}`, rightX, curY);
          curY += 28;
        }
      }

      if (showSignature) {
        c.font = '600 13px "Outfit", "Segoe UI", system-ui, sans-serif';
        c.fillStyle = '#64748b';
        c.textAlign = 'right';
        c.textBaseline = 'bottom';
        c.fillText(SIGNATURE_TEXT, rightX, CANVAS_H - 36);
      }
    }
  }

  function paintPostcard(canvas, opts) {
    if (!canvas) return;
    const c = canvas.getContext('2d');
    if (!c) return;

    c.clearRect(0, 0, CANVAS_W, CANVAS_H);

    if (opts.theme === 'seljuk-gold') {
      renderSeljukGold(c, opts);
    } else if (opts.theme === 'minimalist-editorial') {
      renderMinimalistEditorial(c, opts);
    } else {
      renderCyberSufi(c, opts);
    }
  }

  // =========================================================================
  // Scoped Styles Injection
  // =========================================================================

  function ensureStyles() {
    if (document.getElementById('seyyah-postcard-styles')) return;
    const style = document.createElement('style');
    style.id = 'seyyah-postcard-styles';
    style.textContent = `
      .pc-studio {
        max-width: 1320px;
        margin: 0 auto;
        padding: 4px 0 36px;
        animation: pcFadeIn 0.35s ease;
      }
      @keyframes pcFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .pc-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        padding: 20px 24px;
        margin-bottom: 20px;
        border-radius: var(--radius-lg, 20px);
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }
      .pc-header-title {
        font-family: var(--font-heading, inherit);
        font-size: 1.55rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .pc-header-sub {
        color: var(--text-secondary, #94a3b8);
        font-size: 0.92rem;
        margin-top: 4px;
      }
      .pc-res-pill {
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(0, 242, 254, 0.12);
        color: var(--accent-cyan, #00f2fe);
        border: 1px solid rgba(0, 242, 254, 0.3);
        white-space: nowrap;
      }
      .pc-grid {
        display: grid;
        grid-template-columns: minmax(310px, 380px) minmax(0, 1fr);
        gap: 20px;
        align-items: start;
      }
      @media (max-width: 980px) {
        .pc-grid {
          grid-template-columns: 1fr;
        }
      }
      .pc-panel {
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-lg, 20px);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .pc-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .pc-label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      .pc-label {
        font-size: 0.82rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary, #94a3b8);
      }
      .pc-reset-link {
        background: none;
        border: none;
        color: var(--accent-cyan, #00f2fe);
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        padding: 2px 4px;
      }
      .pc-reset-link:hover {
        text-decoration: underline;
      }
      .pc-select,
      .pc-textarea {
        width: 100%;
        padding: 10px 12px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: var(--bg-secondary, rgba(15, 23, 42, 0.85));
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-body, inherit);
        font-size: 0.92rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .pc-select:focus,
      .pc-textarea:focus {
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.15);
      }
      .pc-textarea {
        resize: vertical;
        min-height: 82px;
        line-height: 1.45;
      }
      .pc-segmented {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .pc-seg-btn {
        padding: 9px 10px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: var(--bg-secondary, rgba(15, 23, 42, 0.65));
        color: var(--text-secondary, #94a3b8);
        font-family: var(--font-body, inherit);
        font-size: 0.86rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .pc-seg-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(0, 242, 254, 0.35);
      }
      .pc-seg-btn.active {
        background: rgba(0, 242, 254, 0.14);
        color: var(--text-primary, #f8fafc);
        border-color: var(--accent-cyan, #00f2fe);
        box-shadow: 0 0 14px rgba(0, 242, 254, 0.16);
      }
      .pc-theme-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .pc-theme-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        text-align: left;
        padding: 10px 12px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: var(--bg-secondary, rgba(15, 23, 42, 0.65));
        color: var(--text-primary, #f8fafc);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .pc-theme-btn:hover {
        border-color: rgba(0, 242, 254, 0.35);
        transform: translateY(-1px);
      }
      .pc-theme-btn.active {
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.11);
        box-shadow: 0 0 16px rgba(0, 242, 254, 0.14);
      }
      .pc-theme-swatch {
        width: 34px;
        height: 34px;
        border-radius: 9px;
        flex-shrink: 0;
        border: 1px solid rgba(255, 255, 255, 0.22);
      }
      .pc-theme-meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .pc-theme-name {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }
      .pc-theme-desc {
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }
      .pc-checks {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .pc-check-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.88rem;
        color: var(--text-primary, #f8fafc);
        cursor: pointer;
        user-select: none;
      }
      .pc-check-item input[type="checkbox"] {
        width: 17px;
        height: 17px;
        accent-color: var(--accent-cyan, #00f2fe);
        cursor: pointer;
        flex-shrink: 0;
      }
      .pc-actions {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
        padding-top: 4px;
      }
      .pc-btn-primary {
        padding: 12px 16px;
        border-radius: var(--radius-md, 12px);
        border: none;
        background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
        color: #06101f;
        font-family: var(--font-heading, inherit);
        font-size: 0.95rem;
        font-weight: 800;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        box-shadow: 0 6px 20px rgba(0, 242, 254, 0.25);
      }
      .pc-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 26px rgba(0, 242, 254, 0.36);
      }
      .pc-btn-secondary {
        padding: 11px 16px;
        border-radius: var(--radius-md, 12px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.16));
        background: var(--bg-secondary, rgba(15, 23, 42, 0.72));
        color: var(--text-primary, #f8fafc);
        font-family: var(--font-heading, inherit);
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .pc-btn-secondary:hover {
        border-color: var(--accent-gold, #f59e0b);
        color: var(--accent-gold, #f59e0b);
      }
      .pc-stage-panel {
        background: var(--bg-card, rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        border-radius: var(--radius-lg, 20px);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .pc-stage-bar {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        font-size: 0.85rem;
        color: var(--text-secondary, #94a3b8);
      }
      .pc-stage-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        font-size: 0.78rem;
      }
      .pc-canvas-wrap {
        position: relative;
        width: 100%;
        border-radius: 14px;
        overflow: hidden;
        background: #070d1c;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.12);
      }
      .pc-canvas {
        display: block;
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 9;
      }
      .pc-hint {
        font-size: 0.8rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.5;
        padding: 10px 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.24);
      }
      .pc-quote-presets-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 2px;
      }
      .pc-quote-presets-label {
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--text-muted, #94a3b8);
        letter-spacing: 0.03em;
      }
      .pc-quote-presets {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .pc-quote-preset-btn {
        max-width: 100%;
        padding: 5px 10px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-secondary, #cbd5e1);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: all 0.18s ease;
      }
      .pc-quote-preset-btn:hover {
        border-color: var(--accent-cyan, #00f2fe);
        color: var(--text-primary, #f8fafc);
        background: rgba(0, 242, 254, 0.12);
      }
      .pc-quote-preset-btn.active {
        border-color: var(--accent-gold, #f59e0b);
        color: #fde68a;
        background: rgba(245, 158, 11, 0.15);
      }
      body.light-theme .pc-header,
      body.light-theme .pc-panel,
      body.light-theme .pc-stage-panel {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
      }
      body.light-theme .pc-select,
      body.light-theme .pc-textarea,
      body.light-theme .pc-seg-btn,
      body.light-theme .pc-theme-btn,
      body.light-theme .pc-btn-secondary,
      body.light-theme .pc-quote-preset-btn {
        background: rgba(248, 250, 252, 0.95);
        border-color: rgba(15, 23, 42, 0.14);
        color: #0f172a;
      }
      body.light-theme .pc-quote-preset-btn.active {
        background: #fef3c7;
        border-color: #d97706;
        color: #92400e;
      }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // Main Render Entry Point
  // =========================================================================

  function getProvinceQuotePresets(data, province) {
    const presets = [];
    const seen = new Set();
    const pushUnique = (label, text) => {
      const clean = String(text || '').replace(/\s+/g, ' ').trim();
      if (!clean || seen.has(clean)) return;
      seen.add(clean);
      presets.push({ label, text: clean });
    };

    if (province) {
      if (province.custom_quote) pushUnique('✨ Özel Şehir Sözü', province.custom_quote);
      if (province.quote) pushUnique('🏛️ Şehir Ruhu', province.quote);
      if (province.soul) pushUnique('💫 Şehir Özü', province.soul);
      if (province.motto) pushUnique('🧭 Şehir Şiarı', province.motto);
      if (Array.isArray(province.landmarks) && province.landmarks.length > 0) {
        pushUnique(
          '📍 Miras Notu',
          `${province.name} hatırası: ${province.landmarks.slice(0, 2).join(' ve ')} ışığında bir Anadolu durağı.`
        );
      }
    }

    const globalQuotes = Array.isArray(data && data.quotes) ? data.quotes : [];
    const provNameLower = province && province.name ? province.name.toLocaleLowerCase('tr-TR') : '';
    if (provNameLower) {
      globalQuotes.forEach((q) => {
        if (!q || !q.quote) return;
        if (String(q.quote).toLocaleLowerCase('tr-TR').includes(provNameLower)) {
          const full = q.author ? `${q.quote} — ${q.author}` : q.quote;
          pushUnique('📜 Edebi Alıntı', full);
        }
      });
    }

    // Add 1-2 general Anatolian literary presets if list is short
    const curatedFallback = [
      { label: '📜 Evliya Çelebi', text: 'Seyahat, şehirlerin taşında tarihi ve insanın gönlünde hikmeti okumaktır.' },
      { label: '🧭 Anadolu İzi', text: 'Her il yeni bir ufuk, her kütüphane yeni bir menzildir.' }
    ];
    for (let i = 0; i < globalQuotes.length && presets.length < 4; i++) {
      const q = globalQuotes[i];
      if (q && q.quote) {
        const full = q.author ? `${q.quote} — ${q.author}` : q.quote;
        pushUnique(`📖 ${q.author || 'Hikmet'}`, full);
      }
    }
    curatedFallback.forEach((c) => {
      if (presets.length < 4) pushUnique(c.label, c.text);
    });

    return presets.slice(0, 5);
  }

  function render(container, ctx) {
    if (!container) return;
    ensureStyles();

    const data = (ctx && ctx.data) || (typeof TRAVEL_DATA !== 'undefined' ? TRAVEL_DATA : null);
    const appState = (ctx && ctx.state) || {};
    const escapeHtml = (ctx && ctx.escapeHtml) || fallbackEscapeHtml;
    const showToast = (ctx && ctx.showToast) || function () {};

    const provinces = (data && data.provinces) || {};
    const entries = Object.entries(provinces).sort((a, b) =>
      String(a[1].name || '').localeCompare(String(b[1].name || ''), 'tr')
    );

    if (entries.length === 0) {
      container.innerHTML = `
        <div class="pc-studio">
          <div class="pc-header">
            <div>
              <div class="pc-header-title">📮 Anadolu Dijital Kartpostal Stüdyosu</div>
              <div class="pc-header-sub">İl verileri bulunamadı. Lütfen veri dosyasının yüklendiğinden emin olun.</div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Resolve initial province: current selected city -> Istanbul -> first sorted province
    if (!studioState.cityKey || !provinces[studioState.cityKey]) {
      if (appState.selectedCityKey && provinces[appState.selectedCityKey]) {
        studioState.cityKey = appState.selectedCityKey;
      } else if (provinces['01_Marmara/Istanbul']) {
        studioState.cityKey = '01_Marmara/Istanbul';
      } else {
        studioState.cityKey = entries[0][0];
      }
      const initProv = provinces[studioState.cityKey];
      studioState.quote = (initProv && (initProv.custom_quote || initProv.quote)) || '';
    } else if (appState.selectedCityKey && provinces[appState.selectedCityKey] && studioState._lastSyncedAppCity !== appState.selectedCityKey) {
      studioState.cityKey = appState.selectedCityKey;
      const initProv = provinces[studioState.cityKey];
      studioState.quote = (initProv && (initProv.custom_quote || initProv.quote)) || '';
    }
    studioState._lastSyncedAppCity = appState.selectedCityKey || null;

    const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';

    const provinceOptionsHtml = entries
      .map(([key, prov]) => {
        const selected = key === studioState.cityKey ? ' selected' : '';
        const mark = prov.visited ? ' ✓' : '';
        return `<option value="${escapeHtml(key)}"${selected}>${escapeHtml(prov.name)} (${formatPlate(prov.plate)})${mark}</option>`;
      })
      .join('');

    const themesHtml = THEMES.map((t) => {
      const active = studioState.theme === t.id ? ' active' : '';
      return `
        <button type="button" class="pc-theme-btn${active}" data-theme="${escapeHtml(t.id)}">
          <span class="pc-theme-swatch" style="background: ${t.swatch};"></span>
          <span class="pc-theme-meta">
            <span class="pc-theme-name">${t.icon} ${escapeHtml(t.name)}</span>
            <span class="pc-theme-desc">${escapeHtml(t.desc)}</span>
          </span>
        </button>
      `;
    }).join('');

    container.innerHTML = `
      <section class="pc-studio" aria-label="Anadolu Dijital Kartpostal Stüdyosu">
        <div class="pc-header">
          <div>
            <div class="pc-header-title">📮 Anadolu Dijital Kartpostal Stüdyosu</div>
            <div class="pc-header-sub">81 ilin fotoğrafları ve özlü sözleriyle 1200×675 HD dijital kartpostallar tasarla ve PNG olarak indir.</div>
          </div>
          <span class="pc-res-pill">HD 1200 × 675 PNG</span>
        </div>

        <div class="pc-grid">
          <div class="pc-panel">
            <div class="pc-field">
              <label class="pc-label" for="pc-province-select">Şehir Seçimi (81 İl)</label>
              <select id="pc-province-select" class="pc-select">
                ${provinceOptionsHtml}
              </select>
            </div>

            <div class="pc-field">
              <span class="pc-label">Fotoğraf Kaynağı</span>
              <div class="pc-segmented" role="group" aria-label="Fotoğraf Seçimi">
                <button type="button" class="pc-seg-btn${studioState.photoType === 'banner' ? ' active' : ''}" data-photo="banner">🖼️ Kapak (banner.jpg)</button>
                <button type="button" class="pc-seg-btn${studioState.photoType === 'gallery' ? ' active' : ''}" data-photo="gallery">📸 Vitrin (gallery.jpg)</button>
              </div>
            </div>

            <div class="pc-field">
              <span class="pc-label">Görsel Tema</span>
              <div class="pc-theme-list">
                ${themesHtml}
              </div>
            </div>

            <div class="pc-field">
              <div class="pc-label-row">
                <label class="pc-label" for="pc-quote-input">Kartpostal Mesajı / Sözü</label>
                <button type="button" id="pc-reset-quote" class="pc-reset-link">Varsayılana Dön</button>
              </div>
              <textarea id="pc-quote-input" class="pc-textarea" maxlength="220" placeholder="Şehir için özel mesajınızı veya alıntınızı yazın...">${escapeHtml(studioState.quote)}</textarea>
              <div class="pc-quote-presets-wrap">
                <span class="pc-quote-presets-label">⚡ Hızlı Şehir &amp; Edebiyat Alıntısı Seç</span>
                <div class="pc-quote-presets" id="pc-quote-presets"></div>
              </div>
            </div>

            <div class="pc-field">
              <span class="pc-label">Görünüm Katmanları</span>
              <div class="pc-checks">
                <label class="pc-check-item">
                  <input type="checkbox" id="pc-chk-badge"${studioState.showBadge ? ' checked' : ''}>
                  <span>Plaka &amp; Bölge Rozetini Göster</span>
                </label>
                <label class="pc-check-item">
                  <input type="checkbox" id="pc-chk-coords"${studioState.showCoords ? ' checked' : ''}>
                  <span>GPS Koordinatlarını Göster</span>
                </label>
                <label class="pc-check-item">
                  <input type="checkbox" id="pc-chk-signature"${studioState.showSignature ? ' checked' : ''}>
                  <span>"${escapeHtml(SIGNATURE_TEXT)}" İmzası</span>
                </label>
              </div>
            </div>

            <div class="pc-actions">
              <button type="button" id="pc-btn-download" class="pc-btn-primary">📥 PNG Kartpostal İndir</button>
              <button type="button" id="pc-btn-random" class="pc-btn-secondary">🎲 Rastgele İl Seç</button>
            </div>
          </div>

          <div class="pc-stage-panel">
            <div class="pc-stage-bar">
              <strong id="pc-stage-title">Canlı Önizleme</strong>
              <span id="pc-stage-status" class="pc-stage-status">⏳ Yükleniyor...</span>
            </div>

            <div class="pc-canvas-wrap">
              <canvas id="pc-canvas" class="pc-canvas" width="${CANVAS_W}" height="${CANVAS_H}"></canvas>
            </div>

            ${isFileProtocol ? `
              <div class="pc-hint">
                💡 <strong>Bilgi:</strong> Sayfayı doğrudan <code>file://</code> üzerinden açtınız. Önizleme fotoğrafla görünür; ancak tarayıcı güvenliği <code>toDataURL</code> işlemini engellerse indirme otomatik olarak tema gradyanı ile tamamlanır. Fotoğraflı indirme için yerel bir HTTP sunucusu (örn. <code>python -m http.server</code>) kullanabilirsiniz.
              </div>
            ` : ''}
          </div>
        </div>
      </section>
    `;

    // Bind DOM references
    const selectEl = container.querySelector('#pc-province-select');
    const photoBtns = container.querySelectorAll('.pc-seg-btn');
    const themeBtns = container.querySelectorAll('.pc-theme-btn');
    const quoteInput = container.querySelector('#pc-quote-input');
    const quotePresetsEl = container.querySelector('#pc-quote-presets');
    const resetQuoteBtn = container.querySelector('#pc-reset-quote');
    const chkBadge = container.querySelector('#pc-chk-badge');
    const chkCoords = container.querySelector('#pc-chk-coords');
    const chkSignature = container.querySelector('#pc-chk-signature');
    const btnDownload = container.querySelector('#pc-btn-download');
    const btnRandom = container.querySelector('#pc-btn-random');
    const canvas = container.querySelector('#pc-canvas');
    const stageTitle = container.querySelector('#pc-stage-title');
    const stageStatus = container.querySelector('#pc-stage-status');

    let renderToken = 0;

    async function updateCanvas() {
      const token = ++renderToken;
      const key = studioState.cityKey;
      const province = provinces[key];
      if (!province) return;

      const regionMeta = getRegionMeta(data, province);
      const photoSrc = getProvincePhotoSrc(key, province, studioState.photoType);

      if (stageTitle) {
        stageTitle.textContent = `${province.name} (${formatPlate(province.plate)}) — ${studioState.photoType === 'gallery' ? 'Vitrin' : 'Kapak'}`;
      }
      if (stageStatus) {
        stageStatus.textContent = '⏳ Fotoğraf yükleniyor...';
      }

      let asset = await loadImageAsset(photoSrc);

      // If requested photo failed, try the alternate photo once before falling back to gradient
      if (asset.status !== 'loaded') {
        const altType = studioState.photoType === 'gallery' ? 'banner' : 'gallery';
        const altSrc = getProvincePhotoSrc(key, province, altType);
        if (altSrc && altSrc !== photoSrc) {
          asset = await loadImageAsset(altSrc);
        }
      }

      if (token !== renderToken) return; // Superseded by a newer change

      const drawOpts = {
        province,
        regionMeta,
        img: asset.status === 'loaded' ? asset.img : null,
        theme: studioState.theme,
        quote: studioState.quote,
        showBadge: studioState.showBadge,
        showCoords: studioState.showCoords,
        showSignature: studioState.showSignature
      };

      paintPostcard(canvas, drawOpts);

      if (stageStatus) {
        stageStatus.textContent = drawOpts.img
          ? '✅ Canlı Önizleme Hazır'
          : '🎨 Gradyan Arka Plan Modu';
      }
    }

    function triggerPngDownload(dataUrl, filename) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function handleDownload() {
      const key = studioState.cityKey;
      const province = provinces[key];
      if (!province || !canvas) return;

      const filename = `kartpostal-${formatPlate(province.plate)}-${slugifyFilename(province.name)}.png`;

      try {
        const dataUrl = canvas.toDataURL('image/png');
        triggerPngDownload(dataUrl, filename);
        showToast(`📥 ${province.name} kartpostalı indirildi!`);
      } catch (err) {
        // Likely SecurityError (tainted canvas on file://)
        const regionMeta = getRegionMeta(data, province);
        const offscreen = document.createElement('canvas');
        offscreen.width = CANVAS_W;
        offscreen.height = CANVAS_H;

        paintPostcard(offscreen, {
          province,
          regionMeta,
          img: null, // Untainted fallback gradient
          theme: studioState.theme,
          quote: studioState.quote,
          showBadge: studioState.showBadge,
          showCoords: studioState.showCoords,
          showSignature: studioState.showSignature
        });

        try {
          const fallbackUrl = offscreen.toDataURL('image/png');
          triggerPngDownload(fallbackUrl, filename);
          showToast('⚠️ file:// güvenliği nedeniyle fotoğraf dışa aktarılamadı; tema gradyanlı kartpostal indirildi. Fotoğraflı indirme için http:// sunucusu kullanın.');
        } catch (fallbackErr) {
          showToast('❌ Tarayıcı PNG dışa aktarmayı engelledi. Lütfen yerel HTTP sunucusu üzerinden deneyin.');
        }
      }
    }

    function renderQuotePresets() {
      if (!quotePresetsEl) return;
      const prov = provinces[studioState.cityKey];
      const presets = getProvinceQuotePresets(data, prov);
      quotePresetsEl.innerHTML = presets
        .map((p, idx) => {
          const isActive = (studioState.quote || '').trim() === p.text;
          return `<button type="button" class="pc-quote-preset-btn${isActive ? ' active' : ''}" data-quote-idx="${idx}" title="${escapeHtml(p.text)}">${escapeHtml(p.label)}</button>`;
        })
        .join('');
      quotePresetsEl._presets = presets;
    }

    function selectProvince(newKey) {
      if (!provinces[newKey]) return;
      studioState.cityKey = newKey;
      const prov = provinces[newKey];
      studioState.quote = prov.custom_quote || prov.quote || '';
      if (selectEl) selectEl.value = newKey;
      if (quoteInput) quoteInput.value = studioState.quote;
      renderQuotePresets();
      updateCanvas();
    }

    if (quotePresetsEl) {
      quotePresetsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-quote-idx]');
        if (!btn) return;
        const idx = parseInt(btn.getAttribute('data-quote-idx'), 10);
        const list = quotePresetsEl._presets || [];
        const picked = list[idx];
        if (!picked) return;
        studioState.quote = picked.text;
        if (quoteInput) quoteInput.value = picked.text;
        renderQuotePresets();
        updateCanvas();
      });
    }

    // Event Listeners
    if (selectEl) {
      selectEl.addEventListener('change', () => {
        selectProvince(selectEl.value);
      });
    }

    photoBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-photo');
        if (!type || studioState.photoType === type) return;
        studioState.photoType = type;
        photoBtns.forEach((b) => b.classList.toggle('active', b === btn));
        updateCanvas();
      });
    });

    themeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const themeId = btn.getAttribute('data-theme');
        if (!themeId || studioState.theme === themeId) return;
        studioState.theme = themeId;
        themeBtns.forEach((b) => b.classList.toggle('active', b === btn));
        updateCanvas();
      });
    });

    if (quoteInput) {
      quoteInput.addEventListener('input', () => {
        studioState.quote = quoteInput.value;
        updateCanvas();
      });
    }

    if (resetQuoteBtn) {
      resetQuoteBtn.addEventListener('click', () => {
        const prov = provinces[studioState.cityKey];
        if (!prov) return;
        studioState.quote = prov.custom_quote || prov.quote || '';
        if (quoteInput) quoteInput.value = studioState.quote;
        updateCanvas();
      });
    }

    if (chkBadge) {
      chkBadge.addEventListener('change', () => {
        studioState.showBadge = chkBadge.checked;
        updateCanvas();
      });
    }

    if (chkCoords) {
      chkCoords.addEventListener('change', () => {
        studioState.showCoords = chkCoords.checked;
        updateCanvas();
      });
    }

    if (chkSignature) {
      chkSignature.addEventListener('change', () => {
        studioState.showSignature = chkSignature.checked;
        updateCanvas();
      });
    }

    if (btnDownload) {
      btnDownload.addEventListener('click', handleDownload);
    }

    if (btnRandom) {
      btnRandom.addEventListener('click', () => {
        if (entries.length <= 1) return;
        let pick = studioState.cityKey;
        for (let i = 0; i < 10 && pick === studioState.cityKey; i++) {
          pick = entries[Math.floor(Math.random() * entries.length)][0];
        }
        selectProvince(pick);
        showToast(`🎲 ${provinces[pick].name} seçildi!`);
      });
    }

    // Initial render
    renderQuotePresets();
    updateCanvas();
  }

  window.SEYYAH_MODULES.postcard = {
    render
  };
})();
