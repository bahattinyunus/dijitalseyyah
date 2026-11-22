/**
 * Dijital Seyyah - Route Tools, GPX 1.1 Exporter & Budget/CO2 Calculator
 * Companion module for the Route Planner.
 * Registers on window.SEYYAH_MODULES.routeTools
 */

(function () {
  'use strict';

  const DEFAULT_KYK_NIGHTLY_SAVING_TL = 1250; // Ortalama Anadolu butik otel / pansiyon gecelik bedeli
  const DAYS_PER_STOP = 5; // 5 Gün Kuralı (GSB Seyahatsever)
  const MAX_GMAPS_WAYPOINTS = 9;

  const TRANSPORT_MODES = {
    bus: {
      id: 'bus',
      label: '🚌 Otobüs (GSB Seyahatsever)',
      shortLabel: 'Otobüs',
      costPerKmTl: 2.4,
      co2KgPerKm: 0.027,
      usesFuel: false,
      note: 'Şehirlerarası otobüs (~2,40 ₺/km) • Ekonomik & düşük emisyon'
    },
    car: {
      id: 'car',
      label: '🚗 Araç (Yakıt Hesabı)',
      shortLabel: 'Özel Araç',
      defaultConsumption: 6.8, // L / 100 km
      defaultFuelPriceTl: 46.0, // TL / L
      co2KgPerLiter: 2.31,
      usesFuel: true,
      note: 'Ortalama binek araç yakıt tüketimi ve pompa fiyatı baz alınır'
    },
    motorcycle: {
      id: 'motorcycle',
      label: '🏍️ Motosiklet / Enduro Touring',
      shortLabel: 'Motosiklet / Enduro',
      defaultConsumption: 3.8, // L / 100 km
      defaultFuelPriceTl: 46.0, // TL / L
      co2KgPerLiter: 2.31,
      usesFuel: true,
      note: 'Anadolu virajları ve yayla geçitleri için çevik enduro/touring (~3,8 L/100km) • Düşük yakıt, yüksek özgürlük'
    },
    train: {
      id: 'train',
      label: '🚆 Tren / Karma',
      shortLabel: 'Tren / Karma',
      costPerKmTl: 1.65,
      co2KgPerKm: 0.019,
      usesFuel: false,
      note: 'YHT / TCDD + kısa aktarma (~1,65 ₺/km) • En çevreci seçenek'
    }
  };

  function defaultEscapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeXml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function getEscaper(ctx) {
    return ctx && typeof ctx.escapeHtml === 'function' ? ctx.escapeHtml : defaultEscapeHtml;
  }

  function notify(ctx, message) {
    if (ctx && typeof ctx.showToast === 'function') {
      ctx.showToast(message);
    }
  }

  function formatNumber(num, maxFrac) {
    const n = Number(num) || 0;
    return n.toLocaleString('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxFrac != null ? maxFrac : 0
    });
  }

  function getTotalKm(route) {
    if (!Array.isArray(route) || route.length === 0) return 0;
    const last = route[route.length - 1];
    if (last && Number.isFinite(Number(last.cumulativeKm))) {
      return Math.max(0, Math.round(Number(last.cumulativeKm)));
    }
    return route.reduce((acc, s, idx) => acc + (idx === 0 ? 0 : (Number(s.distFromPrev) || 0)), 0);
  }

  function formatStopLocation(stop) {
    if (!stop) return '';
    const lat = Number(stop.lat);
    const lng = Number(stop.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return `${lat.toFixed(5)},${lng.toFixed(5)}`;
    }
    return stop.name ? `${stop.name}, Türkiye` : '';
  }

  /**
   * Builds a valid Google Maps multi-stop directions URL.
   * Handles up to 9 intermediate waypoints cleanly (samples evenly if route has > 11 stops).
   * @param {Array} route
   * @returns {string}
   */
  function buildGoogleMapsUrl(route) {
    if (!Array.isArray(route) || route.length === 0) {
      return 'https://www.google.com/maps';
    }

    if (route.length === 1) {
      const dest = formatStopLocation(route[0]);
      const params = new URLSearchParams();
      params.set('api', '1');
      params.set('destination', dest);
      return `https://www.google.com/maps/dir/?${params.toString()}`;
    }

    const origin = formatStopLocation(route[0]);
    const destination = formatStopLocation(route[route.length - 1]);
    const middle = route.slice(1, -1);

    let selectedMiddle = middle;
    if (middle.length > MAX_GMAPS_WAYPOINTS) {
      selectedMiddle = [];
      for (let i = 0; i < MAX_GMAPS_WAYPOINTS; i++) {
        const idx = Math.round((i * (middle.length - 1)) / (MAX_GMAPS_WAYPOINTS - 1));
        selectedMiddle.push(middle[idx]);
      }
    }

    const params = new URLSearchParams();
    params.set('api', '1');
    params.set('origin', origin);
    params.set('destination', destination);
    if (selectedMiddle.length > 0) {
      params.set('waypoints', selectedMiddle.map(formatStopLocation).filter(Boolean).join('|'));
    }
    params.set('travelmode', 'driving');

    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  /**
   * Generates a valid GPX 1.1 XML string for the route.
   * @param {Array} route
   * @returns {string}
   */
  function buildGpxXml(route) {
    const validStops = Array.isArray(route)
      ? route.filter(s => s && Number.isFinite(Number(s.lat)) && Number.isFinite(Number(s.lng)))
      : [];

    const totalKm = getTotalKm(route);
    const firstCity = validStops.length > 0 ? validStops[0].name : 'Başlangıç';
    const lastCity = validStops.length > 1 ? validStops[validStops.length - 1].name : firstCity;
    const routeTitle = validStops.length > 1
      ? `Dijital Seyyah Rota: ${firstCity} - ${lastCity}`
      : `Dijital Seyyah Rota: ${firstCity}`;
    const routeDesc = `Anadolu Seyahatnamesi 81 İl Rota Planı (${validStops.length} durak, ${totalKm} km)`;
    const timestamp = new Date().toISOString();

    const rtePoints = validStops.map((stop, idx) => {
      const lat = Number(stop.lat).toFixed(6);
      const lon = Number(stop.lng).toFixed(6);
      const stopName = `${idx + 1}. ${stop.name || `Durak ${idx + 1}`}`;
      const distPrev = Number(stop.distFromPrev) || 0;
      const cumKm = Number(stop.cumulativeKm) || 0;
      const desc = idx === 0
        ? 'Başlangıç noktası • 0 km'
        : `Önceki duraktan +${distPrev} km • Toplam ${cumKm} km`;

      return [
        `    <rtept lat="${lat}" lon="${lon}">`,
        `      <name>${escapeXml(stopName)}</name>`,
        `      <desc>${escapeXml(desc)}</desc>`,
        '    </rtept>'
      ].join('\n');
    }).join('\n');

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<gpx version="1.1" creator="Dijital Seyyah - Anadolu Seyahatnamesi" xmlns="http://www.topografix.com/GPX/1/1">',
      '  <metadata>',
      `    <name>${escapeXml(routeTitle)}</name>`,
      `    <desc>${escapeXml(routeDesc)}</desc>`,
      `    <time>${timestamp}</time>`,
      '  </metadata>',
      '  <rte>',
      `    <name>${escapeXml(routeTitle)}</name>`,
      `    <desc>${escapeXml(routeDesc)}</desc>`,
      rtePoints,
      '  </rte>',
      '</gpx>'
    ].join('\n');
  }

  /**
   * Generates a valid GPX 1.1 route file (dijital_seyyah_rota.gpx) and triggers download.
   * @param {Array} route
   * @param {Object} [ctx]
   * @returns {string|null}
   */
  function downloadGpx(route, ctx) {
    if (!Array.isArray(route) || route.length === 0) {
      notify(ctx, '⚠️ GPX oluşturmak için rotada en az 1 durak olmalıdır.');
      return null;
    }

    const gpxXml = buildGpxXml(route);

    if (typeof Blob !== 'undefined' && typeof document !== 'undefined' && typeof URL !== 'undefined') {
      const blob = new Blob([gpxXml], { type: 'application/gpx+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dijital_seyyah_rota.gpx';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify(ctx, '📡 GPX 1.1 dosyası indirildi (dijital_seyyah_rota.gpx)');
    }

    return gpxXml;
  }

  function resolveProvinceData(stop, ctx) {
    if (!stop) return null;
    const data = (ctx && ctx.data) || (typeof window !== 'undefined' && window.TRAVEL_DATA) || null;
    const provinces = data && data.provinces ? data.provinces : null;
    if (!provinces) return stop;
    if (stop.key && provinces[stop.key]) return provinces[stop.key];
    if (stop.name) {
      const target = String(stop.name).toLocaleLowerCase('tr-TR').trim();
      const found = Object.values(provinces).find(
        p => p && p.name && String(p.name).toLocaleLowerCase('tr-TR').trim() === target
      );
      if (found) return found;
    }
    return stop;
  }

  /**
   * Formats the calculated route as shareable plain text summary.
   * @param {Array} route
   * @param {string} [mode]
   * @param {Object} [opts]
   * @returns {string}
   */
  function buildRouteText(route, mode, opts) {
    if (!Array.isArray(route) || route.length === 0) return '';

    const totalKm = getTotalKm(route);
    const estHours = (totalKm / 80).toFixed(1);
    const seferDays = Math.max(0, route.length - 1) * DAYS_PER_STOP;
    const gmapsUrl = buildGoogleMapsUrl(route);
    const calc = calculateBudget(route, mode || 'bus', opts);

    const lines = [
      '🧭 DİJİTAL SEYYAH — ANADOLU ROTA ÖZETİ',
      `📍 ${route.length} Durak • 🛣️ ${formatNumber(totalKm)} km • ⏱️ ~${estHours} saat sürüş • ⛺ ${seferDays} gün (5 Gün Kuralı)`,
      `💸 Ulaşım (${calc.modeSpec.shortLabel}): ~${formatNumber(calc.transportCostTl)} ₺${calc.fuelLiters != null ? ` (${formatNumber(calc.fuelLiters, 1)} L yakıt)` : ''} • 🌱 ${formatNumber(calc.co2Kg, 1)} kg CO₂`,
      `🏨 GSB KYK Tasarrufu: +${formatNumber(calc.kykSavingsTl)} ₺ (${formatNumber(calc.kykNights)} gece × 0 ₺)`,
      '----------------------------------------'
    ];

    route.forEach((stop, idx) => {
      const distPrev = Number(stop.distFromPrev) || 0;
      const cumKm = Number(stop.cumulativeKm) || 0;
      const distLabel = idx === 0
        ? 'BAŞLANGIÇ'
        : `+${formatNumber(distPrev)} km (Toplam ${formatNumber(cumKm)} km)`;
      lines.push(`${idx + 1}. ${stop.name} — ${distLabel}`);
    });

    lines.push('----------------------------------------');
    lines.push(`🗺️ Google Maps: ${gmapsUrl}`);

    return lines.join('\n');
  }

  /**
   * Generates a rich day-by-day 5 Gün Kuralı Markdown expedition itinerary.
   * @param {Array} route
   * @param {string} [mode]
   * @param {Object} [opts]
   * @param {Object} [ctx]
   * @returns {string}
   */
  function buildMarkdownItinerary(route, mode, opts, ctx) {
    if (!Array.isArray(route) || route.length === 0) return '';

    const totalKm = getTotalKm(route);
    const estHours = (totalKm / 80).toFixed(1);
    const overnightStops = Math.max(0, route.length - 1);
    const totalDays = overnightStops * DAYS_PER_STOP;
    const calc = calculateBudget(route, mode || 'bus', opts);
    const gmapsUrl = buildGoogleMapsUrl(route);
    const firstCity = route[0].name || 'Başlangıç';
    const lastCity = route[route.length - 1].name || firstCity;
    const todayStr = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const lines = [
      `# 🧭 Dijital Seyyah — Anadolu Sefer Planı (${firstCity} → ${lastCity})`,
      '',
      `> **Oluşturulma Tarihi:** ${todayStr}  `,
      `> **Metodoloji:** GSB Seyahatsever **5 Gün Kuralı** (Sabah Kütüphane Ofis + Öğleden Sonra Kültür Keşfi)  `,
      `> **Toplam Rota:** ${route.length} Durak • ${formatNumber(totalKm)} km • ~${estHours} saat sürüş • ${totalDays} Gün`,
      '',
      '## 💸 Bütçe, Yakıt & Karbon Özeti',
      '',
      '| Metrik | Değer |',
      '| --- | --- |',
      `| **Ulaşım Modu** | ${calc.modeSpec.label} |`,
      `| **Toplam Mesafe** | ${formatNumber(totalKm)} km |`,
      `| **Tahmini Ulaşım Bütçesi** | ${formatNumber(calc.transportCostTl)} ₺ (~${formatNumber(calc.costPerStopTl)} ₺/durak) |`,
      `| **Tahmini Yakıt** | ${calc.fuelLiters != null ? `${formatNumber(calc.fuelLiters, 1)} L` : '0 L (Toplu Taşıma)'} |`,
      `| **CO₂ Ayak İzi** | ${formatNumber(calc.co2Kg, 1)} kg (~${formatNumber(calc.treesEquivalent)} ağaç/yıl dengeleme) |`,
      `| **GSB KYK Tasarrufu** | +${formatNumber(calc.kykSavingsTl)} ₺ (${formatNumber(calc.kykNights)} gece × ${formatNumber(DEFAULT_KYK_NIGHTLY_SAVING_TL)} ₺) |`,
      '',
      `🗺️ **Google Maps Navigasyon:** [Rotayı Haritada Aç](${gmapsUrl})`,
      '',
      '---',
      '',
      '## 📅 Gün Gün 5 Gün Kuralı Sefer Programı',
      ''
    ];

    let dayCursor = 1;

    route.forEach((stop, idx) => {
      const prov = resolveProvinceData(stop, ctx) || stop;
      const distPrev = Number(stop.distFromPrev) || 0;
      const cumKm = Number(stop.cumulativeKm) || 0;
      const legHours = distPrev > 0 ? (distPrev / 80).toFixed(1) : '0.0';
      const landmarks = Array.isArray(prov.landmarks) && prov.landmarks.length > 0
        ? prov.landmarks
        : [`${stop.name} Tarihi Kent Merkezi`, `${stop.name} Müzesi`, `${stop.name} Kültür Rotası`];
      const specialties = Array.isArray(prov.specialties) && prov.specialties.length > 0
        ? prov.specialties
        : [`${stop.name} Yöresel Mutfağı`];
      const workOffice = (Array.isArray(prov.libraries) && prov.libraries[0])
        || (prov.kyk && prov.kyk.library)
        || `${stop.name} İl Halk Kütüphanesi / Gençlik Merkezi Çalışma Ofisi`;

      if (idx === 0) {
        lines.push(`### 🚩 Durak 1: ${stop.name} (Başlangıç Noktası • 0 km)`);
        lines.push('');
        lines.push(`- **Hazırlık & Hareket:** Sefer çantası, powerbank, GSB Seyahatsever rezervasyonu ve çevrimdışı harita kontrolü.`);
        lines.push(`- **Son Çalışma / Kahve Durağı:** ${workOffice}`);
        if (landmarks.length > 0) {
          lines.push(`- **Öne Çıkanlar:** ${landmarks.slice(0, 3).join(' • ')}`);
        }
        lines.push('');
        return;
      }

      const startDay = dayCursor;
      const endDay = dayCursor + DAYS_PER_STOP - 1;
      dayCursor += DAYS_PER_STOP;

      lines.push(`### 📍 Durak ${idx + 1}: ${stop.name} (Gün ${startDay}–${endDay})`);
      lines.push('');
      lines.push(`- **Etap Mesafesi:** +${formatNumber(distPrev)} km (~${legHours} saat) | **Kümülatif:** ${formatNumber(cumKm)} km`);
      lines.push(`- **Konaklama:** ⛺ GSB Seyahatsever KYK Yurdu (5 Gece • 0 ₺)`);
      lines.push(`- **Sabah Ofis (09:00–13:00):** 📚 ${workOffice}`);
      lines.push(`- **Yöresel Lezzetler:** 🍽️ ${specialties.slice(0, 4).join(', ')}`);
      lines.push('');

      for (let d = 0; d < DAYS_PER_STOP; d++) {
        const currentDay = startDay + d;
        const lm = landmarks[d % landmarks.length];
        const sp = specialties[d % specialties.length];
        if (d === 0) {
          lines.push(`  - **Gün ${currentDay} (Varış & Yerleşme):** ${stop.name} varış (+${formatNumber(distPrev)} km), KYK yurdu girişi, akşamüstü **${lm}** keşfi ve **${sp}** tadımı.`);
        } else if (d === DAYS_PER_STOP - 1) {
          lines.push(`  - **Gün ${currentDay} (Kapanış & Hazırlık):** Sabah odak bloğu (${workOffice}), öğleden sonra **${lm}** ziyareti, seyahatname günlüğü notları ve sonraki etaba hazırlık.`);
        } else {
          lines.push(`  - **Gün ${currentDay}:** Sabah 09:00–13:00 uzaktan çalışma (${workOffice}) → Öğleden sonra **${lm}** keşfi • Akşam: **${sp}**.`);
        }
      }
      lines.push('');
    });

    lines.push('---');
    lines.push('*Anadolu Seyahatnamesi — Dijital Seyyah Rota Planlayıcı tarafından oluşturuldu.*');

    return lines.join('\n');
  }

  /**
   * Downloads the Markdown expedition itinerary file (dijital_seyyah_sefer_plani.md).
   * @param {Array} route
   * @param {string} [mode]
   * @param {Object} [opts]
   * @param {Object} [ctx]
   * @returns {string|null}
   */
  function downloadMarkdown(route, mode, opts, ctx) {
    if (!Array.isArray(route) || route.length === 0) {
      notify(ctx, '⚠️ Sefer planı indirmek için rotada en az 1 durak olmalıdır.');
      return null;
    }

    const mdContent = buildMarkdownItinerary(route, mode, opts, ctx);

    if (typeof Blob !== 'undefined' && typeof document !== 'undefined' && typeof URL !== 'undefined') {
      const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dijital_seyyah_sefer_plani.md';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify(ctx, '📄 Markdown sefer planı indirildi (dijital_seyyah_sefer_plani.md)');
    }

    return mdContent;
  }

  /**
   * Computes budget, fuel liters (for car/motorcycle), CO2 footprint (kg), and GSB KYK 5-day savings.
   * @param {Array} route
   * @param {string} mode - 'bus' | 'car' | 'motorcycle' | 'train'
   * @param {Object} [opts]
   */
  function calculateBudget(route, mode, opts) {
    const modeKey = TRANSPORT_MODES[mode] ? mode : 'bus';
    const spec = TRANSPORT_MODES[modeKey];
    const totalKm = getTotalKm(route);
    const overnightStops = Array.isArray(route) ? Math.max(0, route.length - 1) : 0;
    const kykNights = overnightStops * DAYS_PER_STOP;
    const kykSavingsTl = kykNights * DEFAULT_KYK_NIGHTLY_SAVING_TL;

    let transportCostTl = 0;
    let fuelLiters = null;
    let co2Kg = 0;

    if (spec.usesFuel) {
      const consumption = Math.max(
        1,
        Number(opts && opts.consumption) || spec.defaultConsumption
      );
      const fuelPrice = Math.max(
        1,
        Number(opts && opts.fuelPrice) || spec.defaultFuelPriceTl
      );
      fuelLiters = (totalKm / 100) * consumption;
      transportCostTl = Math.round(fuelLiters * fuelPrice);
      co2Kg = fuelLiters * spec.co2KgPerLiter;
    } else {
      transportCostTl = Math.round(totalKm * spec.costPerKmTl);
      co2Kg = totalKm * spec.co2KgPerKm;
    }

    const treesEquivalent = co2Kg > 0 ? Math.max(1, Math.round(co2Kg / 21)) : 0;
    const costPerStopTl = overnightStops > 0 ? Math.round(transportCostTl / overnightStops) : transportCostTl;

    return {
      mode: modeKey,
      modeSpec: spec,
      totalKm,
      overnightStops,
      kykNights,
      kykSavingsTl,
      transportCostTl,
      costPerStopTl,
      fuelLiters,
      co2Kg,
      treesEquivalent
    };
  }

  function copyToClipboard(text) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) resolve();
        else reject(new Error('Clipboard copy failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  function renderMetricsHtml(calc, esc) {
    const fuelDisplay = calc.fuelLiters != null
      ? `${formatNumber(calc.fuelLiters, 1)} L`
      : '0 L (Toplu)';
    const fuelSub = calc.fuelLiters != null
      ? `~${formatNumber(calc.costPerStopTl)} ₺ / durak ortalaması`
      : `~${formatNumber(calc.costPerStopTl)} ₺ / durak • Yakıt yükü yok`;

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 10px;">
        <div style="padding: 12px 14px; border-radius: var(--radius-md); background: var(--bg-secondary, rgba(15, 23, 42, 0.55)); border: 1px solid var(--border-glass);">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Tahmini Ulaşım</div>
          <div style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: var(--accent-cyan); margin-top: 2px;">
            ${formatNumber(calc.transportCostTl)} ₺
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">
            ${esc(calc.modeSpec.shortLabel)} • ${formatNumber(calc.totalKm)} km
          </div>
        </div>

        <div style="padding: 12px 14px; border-radius: var(--radius-md); background: var(--bg-secondary, rgba(15, 23, 42, 0.55)); border: 1px solid var(--border-glass);">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">
            ${calc.fuelLiters != null ? 'Tahmini Yakıt' : 'Ulaşım Verimi'}
          </div>
          <div style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: var(--accent-gold); margin-top: 2px;">
            ${esc(fuelDisplay)}
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">
            ${esc(fuelSub)}
          </div>
        </div>

        <div style="padding: 12px 14px; border-radius: var(--radius-md); background: var(--bg-secondary, rgba(15, 23, 42, 0.55)); border: 1px solid var(--border-glass);">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">CO₂ Ayak İzi</div>
          <div style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: var(--accent-purple); margin-top: 2px;">
            ${formatNumber(calc.co2Kg, 1)} kg
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">
            🌱 ~${formatNumber(calc.treesEquivalent)} ağaç/yıl dengeleme
          </div>
        </div>

        <div style="padding: 12px 14px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.35);">
          <div style="font-size: 0.72rem; color: var(--accent-emerald); text-transform: uppercase; font-weight: 700;">GSB KYK Tasarrufu</div>
          <div style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: var(--accent-emerald); margin-top: 2px;">
            +${formatNumber(calc.kykSavingsTl)} ₺
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">
            ⛺ ${formatNumber(calc.kykNights)} gece × 0 ₺ konaklama (5 Gün Kuralı)
          </div>
        </div>
      </div>
      <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 8px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
        <span>ℹ️ ${esc(calc.modeSpec.note)}</span>
        <span>🏨 Konaklama kıyası: ${formatNumber(DEFAULT_KYK_NIGHTLY_SAVING_TL)} ₺/gece otel ortalaması</span>
      </div>
    `;
  }

  /**
   * Renders the Route Tools & Budget/CO2 Calculator HTML panel.
   * Call bindToolbarEvents(container, route, ctx) after injecting the returned HTML.
   * @param {Array} route
   * @param {Object} [ctx]
   * @returns {string}
   */
  function renderToolbar(route, ctx) {
    if (!Array.isArray(route) || route.length === 0) return '';

    const esc = getEscaper(ctx);
    const gmapsUrl = buildGoogleMapsUrl(route);
    const defaultCalc = calculateBudget(route, 'bus');
    const trimmedWaypoints = route.length > MAX_GMAPS_WAYPOINTS + 2;

    const modeButtonsHtml = Object.values(TRANSPORT_MODES).map(m => `
      <button type="button" class="filter-pill ${m.id === 'bus' ? 'active' : ''}" data-rt-mode="${esc(m.id)}">
        ${esc(m.label)}
      </button>
    `).join('');

    return `
      <div class="glass-card detail-card route-tools-panel" data-route-tools="1" style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.05rem; color: var(--accent-cyan); margin: 0;">
              🧰 Rota Araçları & Bütçe Hesaplayıcı
            </h3>
            <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 2px 0 0 0;">
              Rotayı navigasyona aktar, GPS cihazı için GPX 1.1 indir veya ulaşım bütçeni anlık hesapla.
            </p>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <a class="btn btn-primary" href="${esc(gmapsUrl)}" target="_blank" rel="noopener noreferrer" data-rt-action="gmaps" style="text-decoration: none;">
              🗺️ Google Maps'te Aç
            </a>
            <button type="button" class="btn btn-outline" data-rt-action="gpx">
              📡 GPX İndir (GPS)
            </button>
            <button type="button" class="btn btn-outline" data-rt-action="markdown">
              📄 Sefer Planını Markdown İndir
            </button>
            <button type="button" class="btn btn-outline" data-rt-action="copy">
              📋 Rota Özeti Kopyala
            </button>
          </div>
        </div>

        ${trimmedWaypoints ? `
          <div style="font-size: 0.74rem; color: var(--accent-gold); background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-sm); padding: 6px 10px;">
            ℹ️ Google Maps en fazla ${MAX_GMAPS_WAYPOINTS} ara durak desteklediği için ${route.length} duraklık rotanız başlangıç, bitiş ve dengeli seçilmiş ${MAX_GMAPS_WAYPOINTS} ara durakla açılır. Tüm duraklar için GPX 1.1 dosyasını kullanabilirsiniz.
          </div>
        ` : ''}

        <div style="border-top: 1px solid var(--border-glass); padding-top: 12px; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">
              💸 Yolculuk Bütçe & Karbon Hesaplayıcı
            </span>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;" data-rt-mode-group>
              ${modeButtonsHtml}
            </div>
          </div>

          <div data-rt-car-settings style="display: none; gap: 10px; flex-wrap: wrap; align-items: center; padding: 8px 12px; border-radius: var(--radius-sm); background: var(--bg-secondary, rgba(30, 41, 59, 0.5)); border: 1px solid var(--border-glass);">
            <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.76rem; color: var(--text-secondary);">
              <span>⛽ Tüketim (L/100km):</span>
              <input type="number" step="0.1" min="1.5" max="25" value="${TRANSPORT_MODES.car.defaultConsumption}" data-rt-input="consumption"
                style="width: 68px; padding: 4px 6px; border-radius: 6px; border: 1px solid var(--border-glass); background: var(--bg-primary, #0f172a); color: var(--text-primary); font-size: 0.78rem;" />
            </label>
            <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.76rem; color: var(--text-secondary);">
              <span>🏷️ Yakıt Fiyatı (₺/L):</span>
              <input type="number" step="0.5" min="10" max="200" value="${TRANSPORT_MODES.car.defaultFuelPriceTl}" data-rt-input="fuelPrice"
                style="width: 72px; padding: 4px 6px; border-radius: 6px; border: 1px solid var(--border-glass); background: var(--bg-primary, #0f172a); color: var(--text-primary); font-size: 0.78rem;" />
            </label>
          </div>

          <div data-rt-metrics>
            ${renderMetricsHtml(defaultCalc, esc)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Binds interactive events for the toolbar rendered by renderToolbar().
   * @param {HTMLElement} container
   * @param {Array} route
   * @param {Object} [ctx]
   */
  function bindToolbarEvents(container, route, ctx) {
    if (!container || !Array.isArray(route) || route.length === 0) return;

    const panel = container.querySelector('[data-route-tools="1"]') || container;
    const esc = getEscaper(ctx);

    let activeMode = 'bus';
    const carSettingsEl = panel.querySelector('[data-rt-car-settings]');
    const metricsEl = panel.querySelector('[data-rt-metrics]');
    const consumptionInput = panel.querySelector('[data-rt-input="consumption"]');
    const fuelPriceInput = panel.querySelector('[data-rt-input="fuelPrice"]');

    function getActiveOpts() {
      const spec = TRANSPORT_MODES[activeMode];
      if (!spec || !spec.usesFuel) return undefined;
      return {
        consumption: consumptionInput ? parseFloat(consumptionInput.value) : spec.defaultConsumption,
        fuelPrice: fuelPriceInput ? parseFloat(fuelPriceInput.value) : spec.defaultFuelPriceTl
      };
    }

    function refreshBudget() {
      if (!metricsEl) return;
      const calc = calculateBudget(route, activeMode, getActiveOpts());
      metricsEl.innerHTML = renderMetricsHtml(calc, esc);
    }

    const gmapsBtn = panel.querySelector('[data-rt-action="gmaps"]');
    if (gmapsBtn) {
      gmapsBtn.addEventListener('click', () => {
        notify(ctx, '🗺️ Rota Google Maps üzerinde açılıyor...');
      });
    }

    const gpxBtn = panel.querySelector('[data-rt-action="gpx"]');
    if (gpxBtn) {
      gpxBtn.addEventListener('click', () => {
        downloadGpx(route, ctx);
      });
    }

    const mdBtn = panel.querySelector('[data-rt-action="markdown"]');
    if (mdBtn) {
      mdBtn.addEventListener('click', () => {
        downloadMarkdown(route, activeMode, getActiveOpts(), ctx);
      });
    }

    const copyBtn = panel.querySelector('[data-rt-action="copy"]');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = buildRouteText(route, activeMode, getActiveOpts());
        copyToClipboard(text)
          .then(() => {
            notify(ctx, '📋 Rota özeti panoya kopyalandı!');
          })
          .catch(() => {
            notify(ctx, '⚠️ Pano erişimi engellendi; metin kopyalanamadı.');
          });
      });
    }

    const modeButtons = panel.querySelectorAll('[data-rt-mode]');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const nextMode = btn.getAttribute('data-rt-mode');
        if (!TRANSPORT_MODES[nextMode]) return;
        activeMode = nextMode;
        const spec = TRANSPORT_MODES[activeMode];

        modeButtons.forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-rt-mode') === activeMode);
        });

        if (spec.usesFuel) {
          if (consumptionInput) {
            consumptionInput.value = String(spec.defaultConsumption);
          }
          if (fuelPriceInput && !fuelPriceInput.value) {
            fuelPriceInput.value = String(spec.defaultFuelPriceTl);
          }
        }

        if (carSettingsEl) {
          carSettingsEl.style.display = spec.usesFuel ? 'flex' : 'none';
        }

        refreshBudget();
      });
    });

    if (consumptionInput) {
      consumptionInput.addEventListener('input', refreshBudget);
    }
    if (fuelPriceInput) {
      fuelPriceInput.addEventListener('input', refreshBudget);
    }
  }

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};
  window.SEYYAH_MODULES.routeTools = {
    renderToolbar,
    bindToolbarEvents,
    buildGoogleMapsUrl,
    downloadGpx,
    buildRouteText,
    buildMarkdownItinerary,
    downloadMarkdown,
    calculateBudget
  };
})();
