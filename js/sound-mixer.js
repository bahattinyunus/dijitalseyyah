/**
 * Anadolu Seyahatnamesi — Sufi & Doğa Tefekkür Ses Stüdyosu
 * Multi-Channel Pure Web Audio API Synthesizer + Live Canvas Waveform/Spectrum Visualizer
 * Registers on window.SEYYAH_MODULES.soundMixer = { render(container, ctx), stopAll() }
 */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  // =========================================================================
  // Channel & Preset Definitions
  // =========================================================================

  const CHANNELS = [
    {
      id: 'ney',
      icon: '🎶',
      name: 'Ney & Rast Dem',
      subtitle: 'D3 / A3 sıcak dem & nefes LFO',
      accent: '#00f2fe',
      gainScale: 0.52
    },
    {
      id: 'rain',
      icon: '🌧️',
      name: 'Kütüphane Yağmuru',
      subtitle: 'Bandpass pembe gürültü yağışı',
      accent: '#4facfe',
      gainScale: 0.68
    },
    {
      id: 'wind',
      icon: '🌬️',
      name: 'Bozkır Rüzgarı',
      subtitle: 'Yavaş süpüren alçak geçiren esinti',
      accent: '#10b981',
      gainScale: 0.72
    },
    {
      id: 'waves',
      icon: '🌊',
      name: 'Sahil Dalgaları',
      subtitle: 'LFO modülasyonlu ritmik kıyı',
      accent: '#38bdf8',
      gainScale: 0.74
    },
    {
      id: 'fire',
      icon: '🔥',
      name: 'Kervansaray Ocağı',
      subtitle: 'Derin köz uğultusu & yumuşak çıtırtı',
      accent: '#f59e0b',
      gainScale: 0.78
    }
  ];

  const PRESETS = [
    {
      id: 'coding',
      icon: '💻',
      label: 'Derin Kodlama',
      desc: 'Yağmur %65 + Ney %25',
      volumes: { ney: 25, rain: 65, wind: 0, waves: 0, fire: 0 }
    },
    {
      id: 'steppe',
      icon: '🕌',
      label: 'Bozkır Tefekkürü',
      desc: 'Ney %60 + Rüzgar %45',
      volumes: { ney: 60, rain: 0, wind: 45, waves: 0, fire: 0 }
    },
    {
      id: 'coast',
      icon: '🌊',
      label: 'Ege & Karadeniz Sahili',
      desc: 'Dalgalar %70 + Rüzgar %25',
      volumes: { ney: 0, rain: 0, wind: 25, waves: 70, fire: 0 }
    },
    {
      id: 'caravanserai',
      icon: '⛺',
      label: 'Kervansaray Gecesi',
      desc: 'Ocak %65 + Yağmur %40 + Ney %20',
      volumes: { ney: 20, rain: 40, wind: 0, waves: 0, fire: 65 }
    }
  ];

  // =========================================================================
  // Persistent Module State (survives view switches cleanly)
  // =========================================================================

  const CUSTOM_MIX_STORAGE_KEY = 'dijital_seyyah_custom_sound_mix_v1';
  const SLEEP_OPTIONS = [0, 15, 30, 60];

  const state = {
    masterVolume: 80,
    isPaused: false,
    activePreset: null,
    vizMode: 'hybrid', // 'hybrid' | 'wave' | 'spectrum'
    sleepMinutes: 0,
    sleepEndTime: null,
    sleepIntervalId: null,
    sleepFading: false,
    channels: {}
  };

  CHANNELS.forEach(function (ch) {
    state.channels[ch.id] = { volume: 0, muted: false, solo: false };
  });

  // Audio Engine References
  const engine = {
    ctx: null,
    masterGain: null,
    compressor: null,
    analyser: null,
    channelGains: {},
    sources: [],
    suspendTimer: null,
    isBuilt: false
  };

  // Active UI / Visualizer References
  const ui = {
    container: null,
    canvas: null,
    canvasCtx: null,
    rafId: null,
    resizeObserver: null,
    idlePhase: 0,
    ctxHelpers: {
      escapeHtml: defaultEscapeHtml,
      showToast: function () {}
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

  // =========================================================================
  // Procedural Noise Buffer Generators (Zero External Audio Files)
  // =========================================================================

  function createPinkNoiseBuffer(audioCtx, durationSec) {
    const length = Math.floor(audioCtx.sampleRate * durationSec);
    const buffer = audioCtx.createBuffer(2, length, audioCtx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        data[i] = pink * 0.055;
      }
      applyLoopCrossfade(data, Math.floor(audioCtx.sampleRate * 0.08));
    }
    return buffer;
  }

  function createBrownNoiseBuffer(audioCtx, durationSec) {
    const length = Math.floor(audioCtx.sampleRate * durationSec);
    const buffer = audioCtx.createBuffer(2, length, audioCtx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let lastOut = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 2.6;
      }
      applyLoopCrossfade(data, Math.floor(audioCtx.sampleRate * 0.08));
    }
    return buffer;
  }

  function createCrackleBuffer(audioCtx, durationSec) {
    const length = Math.floor(audioCtx.sampleRate * durationSec);
    const buffer = audioCtx.createBuffer(2, length, audioCtx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let i = 0;
      while (i < length) {
        // Sparse organic wood-pop spacing
        const gap = Math.floor((0.025 + Math.random() * 0.24) * audioCtx.sampleRate);
        i += gap;
        if (i >= length) break;

        const amp = (0.18 + Math.random() * 0.72) * (Math.random() < 0.25 ? 1.0 : 0.45);
        const popLen = Math.min(length - i, Math.floor(18 + Math.random() * 55));
        for (let k = 0; k < popLen; k++) {
          const env = Math.exp(-k / (popLen * 0.28));
          data[i + k] += (Math.random() * 2 - 1) * amp * env;
        }
      }
    }
    return buffer;
  }

  function applyLoopCrossfade(channelData, fadeSamples) {
    const len = channelData.length;
    const count = Math.min(fadeSamples, Math.floor(len / 4));
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const startSample = channelData[i];
      const endSample = channelData[len - count + i];
      channelData[len - count + i] = endSample * (1 - t) + startSample * t;
    }
  }

  function makeLoopedBufferSource(audioCtx, buffer, playbackRate) {
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    if (playbackRate) src.playbackRate.value = playbackRate;
    src.start(0);
    engine.sources.push(src);
    return src;
  }

  // =========================================================================
  // Web Audio Synthesis Graph (5 Independent Channels)
  // =========================================================================

  function ensureAudioEngine() {
    if (engine.isBuilt && engine.ctx) return true;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      ui.ctxHelpers.showToast('Tarayıcınız Web Audio API desteklemiyor.', 'warning');
      return false;
    }

    const ctx = new AudioCtx();
    engine.ctx = ctx;

    // Master Chain: Channel Gains -> Master Gain -> Compressor -> Analyser -> Destination
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.0001;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.knee.value = 18;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.2;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.84;

    masterGain.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(ctx.destination);

    engine.masterGain = masterGain;
    engine.compressor = compressor;
    engine.analyser = analyser;

    // Shared Noise Buffers
    const pinkBuf = createPinkNoiseBuffer(ctx, 4.5);
    const brownBuf = createBrownNoiseBuffer(ctx, 4.5);
    const crackleBuf = createCrackleBuffer(ctx, 5.5);

    // Build all 5 channels
    buildNeyChannel(ctx, pinkBuf, masterGain);
    buildRainChannel(ctx, pinkBuf, masterGain);
    buildWindChannel(ctx, pinkBuf, masterGain);
    buildWavesChannel(ctx, pinkBuf, brownBuf, masterGain);
    buildFireChannel(ctx, pinkBuf, brownBuf, crackleBuf, masterGain);

    engine.isBuilt = true;
    return true;
  }

  // 1. Ney & Rast Dem (D3/A3 warm detuned sine/triangle drone + gentle LFO breath)
  function buildNeyChannel(ctx, pinkBuf, masterGain) {
    const chGain = ctx.createGain();
    chGain.gain.value = 0;
    chGain.connect(masterGain);
    engine.channelGains.ney = chGain;

    const neyFilter = ctx.createBiquadFilter();
    neyFilter.type = 'lowpass';
    neyFilter.frequency.value = 510;
    neyFilter.Q.value = 1.3;

    const breathGain = ctx.createGain();
    breathGain.gain.value = 0.78;

    neyFilter.connect(breathGain);
    breathGain.connect(chGain);

    // Warm detuned oscillators in D3 (146.83 Hz), A3 (220 Hz), subtle D4 (293.66 Hz)
    const partials = [
      { type: 'sine', freq: 146.83, gain: 0.30 },
      { type: 'triangle', freq: 147.28, gain: 0.14 },
      { type: 'sine', freq: 220.00, gain: 0.18 },
      { type: 'triangle', freq: 219.45, gain: 0.08 },
      { type: 'sine', freq: 293.66, gain: 0.055 }
    ];

    partials.forEach(function (p) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = p.type;
      osc.frequency.value = p.freq;
      g.gain.value = p.gain;
      osc.connect(g);
      g.connect(neyFilter);
      osc.start(0);
      engine.sources.push(osc);
    });

    // Subtle reed/air breath resonance on D5
    const airSrc = makeLoopedBufferSource(ctx, pinkBuf, 1.0);
    const airBp = ctx.createBiquadFilter();
    airBp.type = 'bandpass';
    airBp.frequency.value = 587.33;
    airBp.Q.value = 5.5;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.055;
    airSrc.connect(airBp);
    airBp.connect(airGain);
    airGain.connect(neyFilter);

    // Gentle LFO Breath (~0.11 Hz -> ~9 second meditative breath)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.11;

    const lfoFreqDepth = ctx.createGain();
    lfoFreqDepth.gain.value = 155;
    lfo.connect(lfoFreqDepth);
    lfoFreqDepth.connect(neyFilter.frequency);

    const lfoAmpDepth = ctx.createGain();
    lfoAmpDepth.gain.value = 0.15;
    lfo.connect(lfoAmpDepth);
    lfoAmpDepth.connect(breathGain.gain);

    lfo.start(0);
    engine.sources.push(lfo);
  }

  // 2. Kütüphane Yağmuru (Bandpass pink noise rainfall)
  function buildRainChannel(ctx, pinkBuf, masterGain) {
    const chGain = ctx.createGain();
    chGain.gain.value = 0;
    chGain.connect(masterGain);
    engine.channelGains.rain = chGain;

    const src = makeLoopedBufferSource(ctx, pinkBuf, 1.0);

    // Steady rain body
    const midBp = ctx.createBiquadFilter();
    midBp.type = 'bandpass';
    midBp.frequency.value = 1080;
    midBp.Q.value = 0.65;
    const midGain = ctx.createGain();
    midGain.gain.value = 0.62;

    // Fine window-pane rain droplets
    const highBp = ctx.createBiquadFilter();
    highBp.type = 'bandpass';
    highBp.frequency.value = 3150;
    highBp.Q.value = 1.05;
    const highGain = ctx.createGain();
    highGain.gain.value = 0.24;

    // Soft ambient low warmth
    const lowLp = ctx.createBiquadFilter();
    lowLp.type = 'lowpass';
    lowLp.frequency.value = 340;
    const lowGain = ctx.createGain();
    lowGain.gain.value = 0.18;

    src.connect(midBp);
    midBp.connect(midGain);
    midGain.connect(chGain);

    src.connect(highBp);
    highBp.connect(highGain);
    highGain.connect(chGain);

    src.connect(lowLp);
    lowLp.connect(lowGain);
    lowGain.connect(chGain);
  }

  // 3. Bozkır Rüzgarı (Slowly sweeping lowpass wind)
  function buildWindChannel(ctx, pinkBuf, masterGain) {
    const chGain = ctx.createGain();
    chGain.gain.value = 0;
    chGain.connect(masterGain);
    engine.channelGains.wind = chGain;

    const src = makeLoopedBufferSource(ctx, pinkBuf, 0.92);

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 360;
    windFilter.Q.value = 2.3;

    const windSwell = ctx.createGain();
    windSwell.gain.value = 0.65;

    src.connect(windFilter);
    windFilter.connect(windSwell);
    windSwell.connect(chGain);

    // Slow frequency sweep LFO (~15s cycle)
    const sweepLfo = ctx.createOscillator();
    sweepLfo.type = 'sine';
    sweepLfo.frequency.value = 0.066;
    const sweepDepth = ctx.createGain();
    sweepDepth.gain.value = 225;
    sweepLfo.connect(sweepDepth);
    sweepDepth.connect(windFilter.frequency);
    sweepLfo.start(0);
    engine.sources.push(sweepLfo);

    // Secondary organic gust amplitude LFO
    const gustLfo = ctx.createOscillator();
    gustLfo.type = 'sine';
    gustLfo.frequency.value = 0.097;
    const gustDepth = ctx.createGain();
    gustDepth.gain.value = 0.22;
    gustLfo.connect(gustDepth);
    gustDepth.connect(windSwell.gain);
    gustLfo.start(0);
    engine.sources.push(gustLfo);
  }

  // 4. Sahil Dalgaları (LFO-modulated rhythmic surf)
  function buildWavesChannel(ctx, pinkBuf, brownBuf, masterGain) {
    const chGain = ctx.createGain();
    chGain.gain.value = 0;
    chGain.connect(masterGain);
    engine.channelGains.waves = chGain;

    const pinkSrc = makeLoopedBufferSource(ctx, pinkBuf, 0.88);
    const brownSrc = makeLoopedBufferSource(ctx, brownBuf, 0.95);

    const foamGain = ctx.createGain();
    foamGain.gain.value = 0.44;
    const deepGain = ctx.createGain();
    deepGain.gain.value = 0.50;

    const surfFilter = ctx.createBiquadFilter();
    surfFilter.type = 'lowpass';
    surfFilter.frequency.value = 460;
    surfFilter.Q.value = 0.85;

    const surfGain = ctx.createGain();
    surfGain.gain.value = 0.52;

    pinkSrc.connect(foamGain);
    foamGain.connect(surfFilter);

    brownSrc.connect(deepGain);
    deepGain.connect(surfFilter);

    surfFilter.connect(surfGain);
    surfGain.connect(chGain);

    // Rhythmic surf swell LFO (~9.5s wave period)
    const waveLfo = ctx.createOscillator();
    waveLfo.type = 'sine';
    waveLfo.frequency.value = 0.105;

    const waveAmpDepth = ctx.createGain();
    waveAmpDepth.gain.value = 0.36;
    waveLfo.connect(waveAmpDepth);
    waveAmpDepth.connect(surfGain.gain);

    const waveFreqDepth = ctx.createGain();
    waveFreqDepth.gain.value = 310;
    waveLfo.connect(waveFreqDepth);
    waveFreqDepth.connect(surfFilter.frequency);

    waveLfo.start(0);
    engine.sources.push(waveLfo);
  }

  // 5. Kervansaray Ocağı (Warm low-frequency rumble + soft crackle)
  function buildFireChannel(ctx, pinkBuf, brownBuf, crackleBuf, masterGain) {
    const chGain = ctx.createGain();
    chGain.gain.value = 0;
    chGain.connect(masterGain);
    engine.channelGains.fire = chGain;

    // Warm hearth rumble
    const brownSrc = makeLoopedBufferSource(ctx, brownBuf, 0.85);
    const rumbleLp = ctx.createBiquadFilter();
    rumbleLp.type = 'lowpass';
    rumbleLp.frequency.value = 140;
    rumbleLp.Q.value = 0.85;
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.72;

    brownSrc.connect(rumbleLp);
    rumbleLp.connect(rumbleGain);
    rumbleGain.connect(chGain);

    // Gentle flame flicker on rumble
    const flickerLfo = ctx.createOscillator();
    flickerLfo.type = 'sine';
    flickerLfo.frequency.value = 0.34;
    const flickerDepth = ctx.createGain();
    flickerDepth.gain.value = 0.14;
    flickerLfo.connect(flickerDepth);
    flickerDepth.connect(rumbleGain.gain);
    flickerLfo.start(0);
    engine.sources.push(flickerLfo);

    // Warm mid flame body
    const pinkSrc = makeLoopedBufferSource(ctx, pinkBuf, 1.0);
    const flameBp = ctx.createBiquadFilter();
    flameBp.type = 'bandpass';
    flameBp.frequency.value = 420;
    flameBp.Q.value = 1.1;
    const flameGain = ctx.createGain();
    flameGain.gain.value = 0.16;
    pinkSrc.connect(flameBp);
    flameBp.connect(flameGain);
    flameGain.connect(chGain);

    // Soft wood crackle pops
    const crackleSrc = makeLoopedBufferSource(ctx, crackleBuf, 1.0);
    const crackleHp = ctx.createBiquadFilter();
    crackleHp.type = 'highpass';
    crackleHp.frequency.value = 1650;
    const crackleBp = ctx.createBiquadFilter();
    crackleBp.type = 'bandpass';
    crackleBp.frequency.value = 3500;
    crackleBp.Q.value = 0.85;
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.56;

    crackleSrc.connect(crackleHp);
    crackleHp.connect(crackleBp);
    crackleBp.connect(crackleGain);
    crackleGain.connect(chGain);
  }

  // =========================================================================
  // Audio Gain & Suspend / Resume Management
  // =========================================================================

  function hasAnyAudibleChannel() {
    if (state.isPaused || state.masterVolume <= 0) return false;
    const anySolo = CHANNELS.some(function (c) { return state.channels[c.id].solo; });
    return CHANNELS.some(function (c) {
      const ch = state.channels[c.id];
      return ch.volume > 0 && !ch.muted && (!anySolo || ch.solo);
    });
  }

  function getActiveAudibleCount() {
    const anySolo = CHANNELS.some(function (c) { return state.channels[c.id].solo; });
    return CHANNELS.filter(function (c) {
      const ch = state.channels[c.id];
      return ch.volume > 0 && !ch.muted && (!anySolo || ch.solo);
    }).length;
  }

  function syncAudioGains(allowCreate) {
    const shouldPlay = hasAnyAudibleChannel();

    if (engine.suspendTimer) {
      clearTimeout(engine.suspendTimer);
      engine.suspendTimer = null;
    }

    if (!engine.isBuilt) {
      if (!shouldPlay || !allowCreate) return;
      if (!ensureAudioEngine()) return;
    }

    const ctx = engine.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const anySolo = CHANNELS.some(function (c) { return state.channels[c.id].solo; });

    if (shouldPlay && ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }

    // Master gain
    const targetMaster = shouldPlay
      ? Math.pow(state.masterVolume / 100, 1.35)
      : 0;
    engine.masterGain.gain.setTargetAtTime(targetMaster, now, 0.06);

    // Individual channel gains
    CHANNELS.forEach(function (c) {
      const gainNode = engine.channelGains[c.id];
      if (!gainNode) return;
      const ch = state.channels[c.id];
      const isAudible = ch.volume > 0 && !ch.muted && (!anySolo || ch.solo);
      const target = isAudible
        ? Math.pow(ch.volume / 100, 1.45) * c.gainScale
        : 0;
      gainNode.gain.setTargetAtTime(target, now, 0.06);
    });

    // Cleanly suspend AudioContext when completely silent to conserve CPU/battery
    if (!shouldPlay && ctx.state === 'running') {
      engine.suspendTimer = setTimeout(function () {
        if (!hasAnyAudibleChannel() && engine.ctx && engine.ctx.state === 'running') {
          engine.ctx.suspend().catch(function () {});
        }
      }, 320);
    }
  }

  function stopAll(silentToast) {
    state.isPaused = false;
    state.activePreset = null;
    CHANNELS.forEach(function (c) {
      state.channels[c.id].volume = 0;
      state.channels[c.id].muted = false;
      state.channels[c.id].solo = false;
    });

    if (engine.ctx && engine.masterGain) {
      const now = engine.ctx.currentTime;
      engine.masterGain.gain.setTargetAtTime(0, now, 0.04);
      CHANNELS.forEach(function (c) {
        const g = engine.channelGains[c.id];
        if (g) g.gain.setTargetAtTime(0, now, 0.04);
      });
      if (engine.suspendTimer) clearTimeout(engine.suspendTimer);
      engine.suspendTimer = setTimeout(function () {
        if (!hasAnyAudibleChannel() && engine.ctx && engine.ctx.state === 'running') {
          engine.ctx.suspend().catch(function () {});
        }
      }, 220);
    }

    refreshUIControls();

    if (!silentToast && ui.container && document.body.contains(ui.container)) {
      ui.ctxHelpers.showToast('🔇 Tüm ses kanalları susturuldu.', 'info');
    }
  }

  // =========================================================================
  // Sleep / Fade-Out Timer & Personal Mix Slot (localStorage)
  // =========================================================================

  function loadCustomMix() {
    try {
      const raw = window.localStorage.getItem(CUSTOM_MIX_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.channels) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function saveCustomMix() {
    try {
      const payload = {
        masterVolume: state.masterVolume,
        savedAt: new Date().toISOString(),
        channels: {}
      };
      CHANNELS.forEach(function (c) {
        const ch = state.channels[c.id];
        payload.channels[c.id] = {
          volume: ch.volume,
          muted: Boolean(ch.muted),
          solo: Boolean(ch.solo)
        };
      });
      window.localStorage.setItem(CUSTOM_MIX_STORAGE_KEY, JSON.stringify(payload));
      refreshUIControls();
      ui.ctxHelpers.showToast('💾 Kişisel ses miksiniz tarayıcıya kaydedildi!', 'success');
    } catch (_) {
      ui.ctxHelpers.showToast('Kişisel miks kaydedilemedi (depolama erişimi kısıtlı).', 'warning');
    }
  }

  function applyCustomMix() {
    const saved = loadCustomMix();
    if (!saved) {
      ui.ctxHelpers.showToast('Henüz kaydedilmiş bir kişisel miks bulunmuyor.', 'info');
      return;
    }
    state.activePreset = null;
    state.isPaused = false;
    state.masterVolume = Math.max(0, Math.min(100, Number(saved.masterVolume) || 80));
    CHANNELS.forEach(function (c) {
      const src = saved.channels[c.id];
      state.channels[c.id].volume = src ? Math.max(0, Math.min(100, Number(src.volume) || 0)) : 0;
      state.channels[c.id].muted = Boolean(src && src.muted);
      state.channels[c.id].solo = Boolean(src && src.solo);
    });
    syncAudioGains(true);
    refreshUIControls();
    ui.ctxHelpers.showToast('📂 Kişisel ses miksiniz yüklendi!', 'success');
  }

  function formatSleepRemaining(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  function cancelSleepTimer(silent) {
    if (state.sleepIntervalId) {
      clearInterval(state.sleepIntervalId);
      state.sleepIntervalId = null;
    }
    state.sleepMinutes = 0;
    state.sleepEndTime = null;
    state.sleepFading = false;
    refreshUIControls();
    if (!silent) {
      ui.ctxHelpers.showToast('⏲️ Uyku zamanlayıcısı kapatıldı.', 'info');
    }
  }

  function setSleepTimer(minutes) {
    const mins = Number(minutes) || 0;
    if (mins <= 0) {
      cancelSleepTimer(false);
      return;
    }
    if (state.sleepIntervalId) {
      clearInterval(state.sleepIntervalId);
      state.sleepIntervalId = null;
    }
    state.sleepMinutes = mins;
    state.sleepEndTime = Date.now() + mins * 60 * 1000;
    state.sleepFading = false;

    const FADE_WINDOW_MS = 8000;
    state.sleepIntervalId = setInterval(function () {
      if (!state.sleepEndTime) return;
      const msLeft = state.sleepEndTime - Date.now();
      if (msLeft <= 0) {
        clearInterval(state.sleepIntervalId);
        state.sleepIntervalId = null;
        state.sleepMinutes = 0;
        state.sleepEndTime = null;
        state.sleepFading = false;
        state.isPaused = true;
        syncAudioGains(false);
        refreshUIControls();
        ui.ctxHelpers.showToast('🌙 Uyku zamanlayıcısı tamamlandı — sesler yumuşakça susturuldu.', 'info');
        return;
      }

      if (msLeft <= FADE_WINDOW_MS && !state.sleepFading) {
        state.sleepFading = true;
        if (engine.ctx && engine.masterGain && hasAnyAudibleChannel()) {
          const now = engine.ctx.currentTime;
          const curVal = engine.masterGain.gain.value;
          engine.masterGain.gain.cancelScheduledValues(now);
          engine.masterGain.gain.setValueAtTime(curVal, now);
          engine.masterGain.gain.linearRampToValueAtTime(0.0001, now + Math.max(0.5, msLeft / 1000));
        }
      }

      refreshUIControls();
    }, 500);

    refreshUIControls();
    ui.ctxHelpers.showToast('⏲️ Uyku zamanlayıcısı ' + mins + ' dk olarak ayarlandı.', 'success');
  }

  // =========================================================================
  // Live HTML5 Canvas Waveform & Spectrum Visualizer
  // =========================================================================

  function stopVisualizer() {
    if (ui.rafId) {
      cancelAnimationFrame(ui.rafId);
      ui.rafId = null;
    }
    if (ui.resizeObserver) {
      ui.resizeObserver.disconnect();
      ui.resizeObserver = null;
    }
  }

  function resizeCanvas() {
    const canvas = ui.canvas;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.floor(rect.width * dpr);
    const targetH = Math.floor(rect.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
  }

  function startVisualizer() {
    stopVisualizer();
    const canvas = ui.canvas;
    if (!canvas) return;

    ui.canvasCtx = canvas.getContext('2d');
    resizeCanvas();

    if (typeof ResizeObserver !== 'undefined') {
      ui.resizeObserver = new ResizeObserver(function () {
        resizeCanvas();
      });
      ui.resizeObserver.observe(canvas);
    }

    const timeData = new Uint8Array(1024);
    const freqData = new Uint8Array(512);

    function drawFrame() {
      // Auto-cleanup when unmounted from DOM
      if (!ui.canvas || !document.body.contains(ui.canvas)) {
        stopVisualizer();
        return;
      }

      ui.rafId = requestAnimationFrame(drawFrame);

      const ctx = ui.canvasCtx;
      if (!ctx) return;

      const w = ui.canvas.width;
      const h = ui.canvas.height;
      if (w === 0 || h === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const isPlaying = hasAnyAudibleChannel() && engine.analyser && engine.ctx && engine.ctx.state === 'running';
      ui.idlePhase += isPlaying ? 0.032 : 0.016;

      // Dark translucent glass background
      const isLight = document.body.classList.contains('light-theme');
      ctx.clearRect(0, 0, w, h);

      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      if (isLight) {
        bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.94)');
        bgGrad.addColorStop(0.5, 'rgba(18, 30, 52, 0.96)');
        bgGrad.addColorStop(1, 'rgba(12, 22, 38, 0.94)');
      } else {
        bgGrad.addColorStop(0, 'rgba(7, 12, 24, 0.92)');
        bgGrad.addColorStop(0.5, 'rgba(13, 23, 42, 0.88)');
        bgGrad.addColorStop(1, 'rgba(8, 15, 30, 0.92)');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle horizon grid lines
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.5);
      ctx.lineTo(w, h * 0.5);
      ctx.moveTo(0, h * 0.25);
      ctx.lineTo(w, h * 0.25);
      ctx.moveTo(0, h * 0.75);
      ctx.lineTo(w, h * 0.75);
      ctx.stroke();
      ctx.restore();

      if (isPlaying) {
        const analyser = engine.analyser;
        const tLen = Math.min(analyser.fftSize, timeData.length);
        const fLen = Math.min(analyser.frequencyBinCount, freqData.length);
        analyser.getByteTimeDomainData(timeData);
        analyser.getByteFrequencyData(freqData);

        // 1. Spectrum Bars (Cyan -> Emerald -> Gold)
        if (state.vizMode === 'hybrid' || state.vizMode === 'spectrum') {
          const barCount = 48;
          const step = Math.max(1, Math.floor((fLen * 0.65) / barCount));
          const barW = w / barCount;
          const maxBarH = state.vizMode === 'spectrum' ? h * 0.78 : h * 0.44;

          for (let i = 0; i < barCount; i++) {
            const val = freqData[i * step] / 255;
            const barH = Math.max(2 * dpr, val * maxBarH);
            const ratio = i / barCount;
            const x = i * barW + barW * 0.16;
            const bw = Math.max(2 * dpr, barW * 0.68);
            const y = h - barH;

            const barGrad = ctx.createLinearGradient(0, y, 0, h);
            if (ratio < 0.38) {
              barGrad.addColorStop(0, 'rgba(0, 242, 254, 0.72)');
              barGrad.addColorStop(1, 'rgba(0, 242, 254, 0.08)');
            } else if (ratio < 0.72) {
              barGrad.addColorStop(0, 'rgba(16, 185, 129, 0.72)');
              barGrad.addColorStop(1, 'rgba(16, 185, 129, 0.08)');
            } else {
              barGrad.addColorStop(0, 'rgba(245, 158, 11, 0.75)');
              barGrad.addColorStop(1, 'rgba(245, 158, 11, 0.08)');
            }

            ctx.fillStyle = barGrad;
            ctx.fillRect(x, y, bw, barH);
          }
        }

        // 2. Glowing Multi-Ribbon Time-Domain Waveform
        if (state.vizMode === 'hybrid' || state.vizMode === 'wave') {
          drawGlowingWave(ctx, timeData, tLen, w, h, dpr, 0, 1.0, [
            { stop: 0, color: '#00f2fe' },
            { stop: 0.5, color: '#10b981' },
            { stop: 1, color: '#f59e0b' }
          ], 2.6 * dpr, 14 * dpr);

          // Harmonic echo ribbon
          drawGlowingWave(ctx, timeData, tLen, w, h, dpr, 0.18, 0.55, [
            { stop: 0, color: 'rgba(245, 158, 11, 0.55)' },
            { stop: 0.5, color: 'rgba(0, 242, 254, 0.55)' },
            { stop: 1, color: 'rgba(16, 185, 129, 0.55)' }
          ], 1.4 * dpr, 6 * dpr);
        }
      } else {
        // Calm Sufi ambient idle wave when silent/paused
        drawIdleWave(ctx, w, h, dpr, ui.idlePhase, '#00f2fe', '#10b981', '#f59e0b', 1.0, 2.0 * dpr);
        drawIdleWave(ctx, w, h, dpr, ui.idlePhase * 0.72 + 1.4, 'rgba(245,158,11,0.45)', 'rgba(0,242,254,0.45)', 'rgba(16,185,129,0.45)', 0.55, 1.2 * dpr);
      }
    }

    ui.rafId = requestAnimationFrame(drawFrame);
  }

  function drawGlowingWave(ctx, data, len, w, h, dpr, phaseShift, ampScale, stops, lineW, blur) {
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    stops.forEach(function (s) { grad.addColorStop(s.stop, s.color); });

    ctx.strokeStyle = grad;
    ctx.lineWidth = lineW;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = blur;

    ctx.beginPath();
    const sliceW = w / (len - 1);
    const midY = h * 0.48;
    const verticalScale = h * 0.42 * ampScale;

    for (let i = 0; i < len; i++) {
      const idx = (i + Math.floor(phaseShift * len)) % len;
      const norm = (data[idx] - 128) / 128;
      // Gentle envelope at edges so wave tapers elegantly
      const edgeEnv = Math.sin((i / (len - 1)) * Math.PI);
      const y = midY + norm * verticalScale * (0.35 + 0.65 * edgeEnv);
      const x = i * sliceW;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
    ctx.restore();
  }

  function drawIdleWave(ctx, w, h, dpr, phase, c1, c2, c3, ampScale, lineW) {
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, c1);
    grad.addColorStop(0.5, c2);
    grad.addColorStop(1, c3);

    ctx.strokeStyle = grad;
    ctx.lineWidth = lineW;
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 10 * dpr;

    ctx.beginPath();
    const midY = h * 0.52;
    const points = 120;
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const x = t * w;
      const env = Math.sin(t * Math.PI);
      const wave =
        Math.sin(t * Math.PI * 3.5 + phase) * 0.55 +
        Math.sin(t * Math.PI * 6.0 - phase * 1.3) * 0.25;
      const y = midY + wave * (h * 0.12 * ampScale) * env;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // Scoped Styles Injection (Self-Contained, Cyber-Sufi Dark & Light Themes)
  // =========================================================================

  function injectStyles() {
    if (document.getElementById('seyyah-sound-mixer-styles')) return;

    const style = document.createElement('style');
    style.id = 'seyyah-sound-mixer-styles';
    style.textContent = `
      .sm-studio {
        max-width: 1120px;
        margin: 0 auto;
        padding: 4px 0 28px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        animation: smFadeIn 0.28s ease-out;
      }
      @keyframes smFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Header Banner */
      .sm-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 18px 22px;
        border-radius: var(--radius-lg, 20px);
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(30, 41, 59, 0.72));
        border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
        box-shadow: var(--shadow-subtle, 0 10px 25px -5px rgba(0,0,0,0.45));
      }
      body.light-theme .sm-header {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(241, 245, 249, 0.95));
        border-color: rgba(15, 23, 42, 0.12);
      }
      .sm-title-wrap h2 {
        font-family: var(--font-heading, sans-serif);
        font-size: 1.4rem;
        font-weight: 800;
        background: linear-gradient(90deg, var(--accent-cyan, #00f2fe), var(--accent-emerald, #10b981), var(--accent-gold, #f59e0b));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 4px;
      }
      .sm-title-wrap p {
        font-size: 0.88rem;
        color: var(--text-secondary, #94a3b8);
      }
      .sm-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 14px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid var(--border-glass, rgba(255,255,255,0.12));
        color: var(--text-secondary, #94a3b8);
      }
      body.light-theme .sm-status-pill {
        background: rgba(15, 23, 42, 0.06);
        color: #334155;
      }
      .sm-status-pill.is-live {
        border-color: rgba(16, 185, 129, 0.55);
        color: #10b981;
        box-shadow: 0 0 18px rgba(16, 185, 129, 0.22);
      }
      .sm-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #64748b;
      }
      .sm-status-pill.is-live .sm-status-dot {
        background: #10b981;
        box-shadow: 0 0 10px #10b981;
        animation: smPulse 1.6s infinite;
      }
      @keyframes smPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.35); opacity: 0.65; }
      }

      /* Visualizer Card */
      .sm-viz-card {
        position: relative;
        border-radius: var(--radius-lg, 20px);
        overflow: hidden;
        border: 1px solid rgba(0, 242, 254, 0.22);
        background: #070c18;
        box-shadow: 0 0 28px rgba(0, 242, 254, 0.1);
      }
      .sm-viz-canvas {
        display: block;
        width: 100%;
        height: 175px;
      }
      .sm-viz-overlay {
        position: absolute;
        top: 12px;
        left: 14px;
        right: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        pointer-events: none;
      }
      .sm-viz-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.09em;
        color: rgba(226, 232, 240, 0.72);
        background: rgba(15, 23, 42, 0.65);
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.08);
      }
      .sm-viz-modes {
        display: inline-flex;
        gap: 4px;
        background: rgba(15, 23, 42, 0.75);
        padding: 3px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.1);
        pointer-events: auto;
      }
      .sm-viz-mode-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 0.72rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 999px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .sm-viz-mode-btn:hover { color: #f8fafc; }
      .sm-viz-mode-btn.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.28), rgba(16, 185, 129, 0.28));
        color: #f8fafc;
        border: 1px solid rgba(0, 242, 254, 0.4);
      }

      /* Master Control Bar */
      .sm-master-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 14px 18px;
        border-radius: var(--radius-md, 14px);
        background: var(--bg-card, rgba(30, 41, 59, 0.7));
        border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
      }
      body.light-theme .sm-master-bar {
        background: rgba(255, 255, 255, 0.88);
        border-color: rgba(15, 23, 42, 0.1);
      }
      .sm-master-slider-wrap {
        flex: 1 1 240px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .sm-master-label {
        font-size: 0.86rem;
        font-weight: 700;
        white-space: nowrap;
        color: var(--text-primary, #f8fafc);
      }
      .sm-master-val {
        min-width: 42px;
        text-align: right;
        font-variant-numeric: tabular-nums;
        font-weight: 800;
        font-size: 0.88rem;
        color: var(--accent-cyan, #00f2fe);
      }
      .sm-master-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .sm-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: var(--radius-sm, 8px);
        font-size: 0.84rem;
        font-weight: 700;
        cursor: pointer;
        border: 1px solid var(--border-glass, rgba(255,255,255,0.14));
        background: rgba(15, 23, 42, 0.55);
        color: var(--text-primary, #f8fafc);
        transition: all 0.2s ease;
      }
      body.light-theme .sm-btn {
        background: #f1f5f9;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.14);
      }
      .sm-btn:hover {
        transform: translateY(-1px);
        border-color: rgba(0, 242, 254, 0.5);
        box-shadow: 0 4px 14px rgba(0, 242, 254, 0.16);
      }
      .sm-btn-danger {
        border-color: rgba(239, 68, 68, 0.4);
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.12);
      }
      body.light-theme .sm-btn-danger {
        color: #b91c1c;
        background: rgba(239, 68, 68, 0.1);
      }
      .sm-btn-danger:hover {
        border-color: rgba(239, 68, 68, 0.75);
        box-shadow: 0 4px 14px rgba(239, 68, 68, 0.22);
      }
      .sm-btn-primary {
        border-color: rgba(16, 185, 129, 0.5);
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.18), rgba(16, 185, 129, 0.22));
      }

      /* Mood Presets Grid */
      .sm-section-title {
        font-size: 0.8rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-secondary, #94a3b8);
        margin-bottom: 10px;
      }
      .sm-presets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: 12px;
      }
      .sm-preset-btn {
        text-align: left;
        padding: 14px 16px;
        border-radius: var(--radius-md, 14px);
        border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
        background: var(--bg-card, rgba(30, 41, 59, 0.65));
        color: var(--text-primary, #f8fafc);
        cursor: pointer;
        transition: all 0.22s ease;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      body.light-theme .sm-preset-btn {
        background: rgba(255, 255, 255, 0.9);
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.1);
      }
      .sm-preset-btn:hover {
        transform: translateY(-2px);
        border-color: rgba(0, 242, 254, 0.45);
        box-shadow: 0 8px 20px rgba(0, 242, 254, 0.14);
      }
      .sm-preset-btn.active {
        border-color: var(--accent-emerald, #10b981);
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.14), rgba(16, 185, 129, 0.18));
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.22);
      }
      .sm-preset-name {
        font-weight: 800;
        font-size: 0.94rem;
      }
      .sm-preset-desc {
        font-size: 0.77rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* Channels Grid */
      .sm-channels-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
        gap: 14px;
      }
      .sm-channel-card {
        padding: 16px 18px;
        border-radius: var(--radius-md, 14px);
        background: var(--bg-card, rgba(30, 41, 59, 0.7));
        border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
        display: flex;
        flex-direction: column;
        gap: 12px;
        transition: all 0.22s ease;
        position: relative;
        overflow: hidden;
      }
      body.light-theme .sm-channel-card {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(15, 23, 42, 0.1);
      }
      .sm-channel-card.is-audible {
        border-color: var(--ch-accent, #00f2fe);
        box-shadow: 0 6px 22px rgba(0, 242, 254, 0.12);
      }
      .sm-channel-card.is-dimmed {
        opacity: 0.62;
      }
      .sm-channel-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
      }
      .sm-channel-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .sm-channel-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid rgba(255,255,255,0.1);
        flex-shrink: 0;
      }
      body.light-theme .sm-channel-icon {
        background: #f1f5f9;
        border-color: rgba(15, 23, 42, 0.08);
      }
      .sm-channel-name {
        font-weight: 800;
        font-size: 0.95rem;
        color: var(--text-primary, #f8fafc);
        line-height: 1.25;
      }
      .sm-channel-sub {
        font-size: 0.75rem;
        color: var(--text-secondary, #94a3b8);
      }
      .sm-channel-toggles {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
      }
      .sm-toggle-btn {
        width: 30px;
        height: 28px;
        border-radius: 7px;
        border: 1px solid var(--border-glass, rgba(255,255,255,0.15));
        background: rgba(15, 23, 42, 0.5);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.74rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.18s ease;
      }
      body.light-theme .sm-toggle-btn {
        background: #f1f5f9;
        color: #475569;
        border-color: rgba(15, 23, 42, 0.14);
      }
      .sm-toggle-btn:hover {
        color: var(--text-primary, #f8fafc);
        border-color: rgba(255,255,255,0.35);
      }
      .sm-toggle-btn.is-mute-active {
        background: rgba(239, 68, 68, 0.24);
        border-color: #ef4444;
        color: #fecaca;
      }
      body.light-theme .sm-toggle-btn.is-mute-active {
        color: #b91c1c;
      }
      .sm-toggle-btn.is-solo-active {
        background: rgba(245, 158, 11, 0.26);
        border-color: #f59e0b;
        color: #fde68a;
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
      }
      body.light-theme .sm-toggle-btn.is-solo-active {
        color: #b45309;
      }

      /* Sliders */
      .sm-slider-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .sm-range {
        -webkit-appearance: none;
        appearance: none;
        flex: 1;
        height: 6px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.25);
        outline: none;
        cursor: pointer;
      }
      .sm-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 17px;
        height: 17px;
        border-radius: 50%;
        background: var(--ch-accent, #00f2fe);
        border: 2px solid #0f172a;
        box-shadow: 0 0 10px var(--ch-accent, #00f2fe);
        cursor: pointer;
        transition: transform 0.15s ease;
      }
      .sm-range::-webkit-slider-thumb:hover {
        transform: scale(1.18);
      }
      .sm-range::-moz-range-thumb {
        width: 17px;
        height: 17px;
        border-radius: 50%;
        background: var(--ch-accent, #00f2fe);
        border: 2px solid #0f172a;
        box-shadow: 0 0 10px var(--ch-accent, #00f2fe);
        cursor: pointer;
      }
      .sm-ch-val {
        min-width: 40px;
        text-align: right;
        font-size: 0.84rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: var(--ch-accent, #00f2fe);
      }

      /* Sleep Timer & Custom Mix Slot Bar */
      .sm-tools-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 13px 16px;
        border-radius: var(--radius-md, 14px);
        background: var(--bg-card, rgba(30, 41, 59, 0.68));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
      }
      body.light-theme .sm-tools-bar {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(15, 23, 42, 0.12);
      }
      .sm-tool-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }
      .sm-tool-label {
        font-size: 0.8rem;
        font-weight: 800;
        color: var(--text-primary, #f8fafc);
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .sm-sleep-countdown {
        font-size: 0.76rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.18);
        border: 1px solid rgba(245, 158, 11, 0.45);
        color: #fbbf24;
      }
      body.light-theme .sm-sleep-countdown {
        color: #b45309;
      }
      .sm-pill-btn {
        padding: 6px 11px;
        border-radius: 999px;
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.14));
        background: rgba(15, 23, 42, 0.5);
        color: var(--text-secondary, #94a3b8);
        font-size: 0.76rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
      }
      body.light-theme .sm-pill-btn {
        background: #f1f5f9;
        color: #334155;
        border-color: rgba(15, 23, 42, 0.14);
      }
      .sm-pill-btn:hover {
        border-color: rgba(0, 242, 254, 0.5);
        color: var(--text-primary, #f8fafc);
      }
      body.light-theme .sm-pill-btn:hover {
        color: #0f172a;
      }
      .sm-pill-btn.active {
        background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(16, 185, 129, 0.2));
        border-color: var(--accent-cyan, #00f2fe);
        color: #ffffff;
      }
      body.light-theme .sm-pill-btn.active {
        background: #e0f2fe;
        border-color: #0284c7;
        color: #0369a1;
      }
      .sm-pill-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      @media (max-width: 600px) {
        .sm-header { padding: 14px 16px; }
        .sm-viz-canvas { height: 145px; }
        .sm-channels-grid { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // UI Rendering & Event Binding
  // =========================================================================

  function render(container, ctx) {
    if (!container) return;

    injectStyles();
    stopVisualizer();

    ui.container = container;
    ui.ctxHelpers = {
      escapeHtml: (ctx && typeof ctx.escapeHtml === 'function') ? ctx.escapeHtml : defaultEscapeHtml,
      showToast: (ctx && typeof ctx.showToast === 'function') ? ctx.showToast : function () {}
    };

    const esc = ui.ctxHelpers.escapeHtml;

    const presetsHtml = PRESETS.map(function (p) {
      const activeCls = state.activePreset === p.id ? ' active' : '';
      return (
        '<button type="button" class="sm-preset-btn' + activeCls + '" data-preset="' + esc(p.id) + '">' +
          '<span class="sm-preset-name">' + esc(p.icon + ' ' + p.label) + '</span>' +
          '<span class="sm-preset-desc">' + esc(p.desc) + '</span>' +
        '</button>'
      );
    }).join('');

    const channelsHtml = CHANNELS.map(function (c) {
      const ch = state.channels[c.id];
      return (
        '<div class="sm-channel-card" data-channel-card="' + esc(c.id) + '" style="--ch-accent:' + esc(c.accent) + ';">' +
          '<div class="sm-channel-top">' +
            '<div class="sm-channel-info">' +
              '<div class="sm-channel-icon" aria-hidden="true">' + esc(c.icon) + '</div>' +
              '<div>' +
                '<div class="sm-channel-name">' + esc(c.name) + '</div>' +
                '<div class="sm-channel-sub">' + esc(c.subtitle) + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="sm-channel-toggles">' +
              '<button type="button" class="sm-toggle-btn" data-action="mute" data-channel="' + esc(c.id) + '" title="Sustur (Mute)" aria-label="' + esc(c.name) + ' sustur" aria-pressed="' + (ch.muted ? 'true' : 'false') + '">M</button>' +
              '<button type="button" class="sm-toggle-btn" data-action="solo" data-channel="' + esc(c.id) + '" title="Yalnız Çal (Solo)" aria-label="' + esc(c.name) + ' solo" aria-pressed="' + (ch.solo ? 'true' : 'false') + '">S</button>' +
            '</div>' +
          '</div>' +
          '<div class="sm-slider-row">' +
            '<input type="range" class="sm-range" min="0" max="100" step="1" value="' + ch.volume + '" data-slider="' + esc(c.id) + '" aria-label="' + esc(c.name) + ' ses seviyesi">' +
            '<span class="sm-ch-val" data-val="' + esc(c.id) + '">' + ch.volume + '%</span>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    container.innerHTML =
      '<section class="sm-studio" aria-label="Sufi ve Doğa Tefekkür Ses Stüdyosu">' +
        '<div class="sm-header">' +
          '<div class="sm-title-wrap">' +
            '<h2>🎧 Sufi &amp; Doğa Tefekkür Ses Stüdyosu</h2>' +
            '<p>%100 saf Web Audio API sentezi · 5 bağımsız kanal · Gerçek zamanlı dalga &amp; spektrum monitörü</p>' +
          '</div>' +
          '<div class="sm-status-pill" data-sm-status>' +
            '<span class="sm-status-dot"></span>' +
            '<span data-sm-status-text>BEKLEMEDE</span>' +
          '</div>' +
        '</div>' +

        '<div class="sm-viz-card">' +
          '<canvas class="sm-viz-canvas" data-sm-canvas aria-label="Canlı ses dalgası ve spektrum görselleştirici"></canvas>' +
          '<div class="sm-viz-overlay">' +
            '<span class="sm-viz-label">ANALYSER · LIVE DSP</span>' +
            '<div class="sm-viz-modes" role="group" aria-label="Görselleştirici modu">' +
              '<button type="button" class="sm-viz-mode-btn' + (state.vizMode === 'hybrid' ? ' active' : '') + '" data-viz-mode="hybrid">Hibrit</button>' +
              '<button type="button" class="sm-viz-mode-btn' + (state.vizMode === 'wave' ? ' active' : '') + '" data-viz-mode="wave">Dalga</button>' +
              '<button type="button" class="sm-viz-mode-btn' + (state.vizMode === 'spectrum' ? ' active' : '') + '" data-viz-mode="spectrum">Spektrum</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="sm-master-bar">' +
          '<div class="sm-master-slider-wrap" style="--ch-accent:#00f2fe;">' +
            '<span class="sm-master-label">🎚️ Ana Ses</span>' +
            '<input type="range" class="sm-range" min="0" max="100" step="1" value="' + state.masterVolume + '" data-master-slider aria-label="Ana ses seviyesi">' +
            '<span class="sm-master-val" data-master-val>' + state.masterVolume + '%</span>' +
          '</div>' +
          '<div class="sm-master-actions">' +
            '<button type="button" class="sm-btn sm-btn-primary" data-action="toggle-pause">' + (state.isPaused ? '▶️ Devam Et' : '⏸️ Duraklat') + '</button>' +
            '<button type="button" class="sm-btn sm-btn-danger" data-action="stop-all">🔇 Tümünü Sustur</button>' +
          '</div>' +
        '</div>' +

        '<div class="sm-tools-bar">' +
          '<div class="sm-tool-group" role="group" aria-label="Uyku Zamanlayıcısı">' +
            '<span class="sm-tool-label">⏲️ Uyku Zamanlayıcısı:</span>' +
            SLEEP_OPTIONS.map(function (mins) {
              const lbl = mins === 0 ? 'Kapalı' : (mins + ' dk');
              const act = state.sleepMinutes === mins ? ' active' : '';
              return '<button type="button" class="sm-pill-btn' + act + '" data-sleep-mins="' + mins + '">' + lbl + '</button>';
            }).join('') +
            '<span class="sm-sleep-countdown" data-sleep-countdown style="display:none;">00:00</span>' +
          '</div>' +
          '<div class="sm-tool-group" role="group" aria-label="Kişisel Miks Slotu">' +
            '<button type="button" class="sm-pill-btn" data-action="save-custom-mix">💾 Kişisel Miksi Kaydet</button>' +
            '<button type="button" class="sm-pill-btn" data-action="load-custom-mix"' + (loadCustomMix() ? '' : ' disabled') + '>📂 Kişisel Miksi Yükle</button>' +
          '</div>' +
        '</div>' +

        '<div>' +
          '<div class="sm-section-title">✨ Tek Tık Ruh Hali Ön Ayarları</div>' +
          '<div class="sm-presets-grid">' + presetsHtml + '</div>' +
        '</div>' +

        '<div>' +
          '<div class="sm-section-title">🎛️ Çok Kanallı Ses Mikseri (M: Sustur · S: Solo)</div>' +
          '<div class="sm-channels-grid">' + channelsHtml + '</div>' +
        '</div>' +
      '</section>';

    ui.canvas = container.querySelector('[data-sm-canvas]');
    const studioRoot = container.querySelector('.sm-studio');
    if (studioRoot) bindEvents(studioRoot);
    refreshUIControls();
    startVisualizer();
  }

  function bindEvents(rootEl) {
    // Master volume slider
    const masterSlider = rootEl.querySelector('[data-master-slider]');
    if (masterSlider) {
      masterSlider.addEventListener('input', function (e) {
        state.masterVolume = parseInt(e.target.value, 10) || 0;
        syncAudioGains(true);
        refreshUIControls();
      });
    }

    // Channel sliders
    rootEl.querySelectorAll('[data-slider]').forEach(function (slider) {
      slider.addEventListener('input', function (e) {
        const id = e.target.getAttribute('data-slider');
        const val = parseInt(e.target.value, 10) || 0;
        if (!state.channels[id]) return;

        state.channels[id].volume = val;
        state.activePreset = null;
        if (val > 0 && state.isPaused) {
          state.isPaused = false;
        }
        syncAudioGains(true);
        refreshUIControls();
      });
    });

    // Click delegation on newly mounted studio root (prevents listener accumulation across re-renders)
    rootEl.addEventListener('click', function (e) {
      const presetBtn = e.target.closest('[data-preset]');
      if (presetBtn) {
        applyPreset(presetBtn.getAttribute('data-preset'));
        return;
      }

      const vizBtn = e.target.closest('[data-viz-mode]');
      if (vizBtn) {
        state.vizMode = vizBtn.getAttribute('data-viz-mode') || 'hybrid';
        rootEl.querySelectorAll('[data-viz-mode]').forEach(function (b) {
          b.classList.toggle('active', b === vizBtn);
        });
        return;
      }

      const sleepBtn = e.target.closest('[data-sleep-mins]');
      if (sleepBtn) {
        setSleepTimer(parseInt(sleepBtn.getAttribute('data-sleep-mins'), 10) || 0);
        return;
      }

      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;

      const action = actionBtn.getAttribute('data-action');
      const channelId = actionBtn.getAttribute('data-channel');

      if (action === 'mute' && channelId && state.channels[channelId]) {
        state.channels[channelId].muted = !state.channels[channelId].muted;
        if (state.channels[channelId].muted) {
          state.channels[channelId].solo = false;
        }
        syncAudioGains(true);
        refreshUIControls();
      } else if (action === 'solo' && channelId && state.channels[channelId]) {
        state.channels[channelId].solo = !state.channels[channelId].solo;
        if (state.channels[channelId].solo) {
          state.channels[channelId].muted = false;
        }
        syncAudioGains(true);
        refreshUIControls();
      } else if (action === 'toggle-pause') {
        togglePause();
      } else if (action === 'stop-all') {
        cancelSleepTimer(true);
        stopAll(false);
      } else if (action === 'save-custom-mix') {
        saveCustomMix();
      } else if (action === 'load-custom-mix') {
        applyCustomMix();
      }
    });
  }

  function applyPreset(presetId) {
    const preset = PRESETS.find(function (p) { return p.id === presetId; });
    if (!preset) return;

    state.activePreset = preset.id;
    state.isPaused = false;
    if (state.masterVolume === 0) state.masterVolume = 80;

    CHANNELS.forEach(function (c) {
      state.channels[c.id].volume = preset.volumes[c.id] || 0;
      state.channels[c.id].muted = false;
      state.channels[c.id].solo = false;
    });

    syncAudioGains(true);
    refreshUIControls();
    ui.ctxHelpers.showToast(preset.icon + ' "' + preset.label + '" atmosferi başlatıldı.', 'success');
  }

  function togglePause() {
    const hasAnyNonZero = CHANNELS.some(function (c) { return state.channels[c.id].volume > 0; });
    if (!hasAnyNonZero) {
      // Friendly shortcut: start Derin Kodlama if user hits play with everything at 0
      applyPreset('coding');
      return;
    }

    state.isPaused = !state.isPaused;
    syncAudioGains(true);
    refreshUIControls();
  }

  function refreshUIControls() {
    const root = ui.container;
    if (!root || !document.body.contains(root)) return;

    const anySolo = CHANNELS.some(function (c) { return state.channels[c.id].solo; });
    const playing = hasAnyAudibleChannel();
    const activeCount = getActiveAudibleCount();

    // Status pill
    const statusPill = root.querySelector('[data-sm-status]');
    const statusText = root.querySelector('[data-sm-status-text]');
    if (statusPill && statusText) {
      statusPill.classList.toggle('is-live', playing);
      if (playing) {
        statusText.textContent = 'CANLI SENTEZ · ' + activeCount + ' KANAL';
      } else if (state.isPaused && activeCount > 0) {
        statusText.textContent = 'DURAKLATILDI';
      } else {
        statusText.textContent = 'BEKLEMEDE';
      }
    }

    // Master controls
    const masterSlider = root.querySelector('[data-master-slider]');
    const masterVal = root.querySelector('[data-master-val]');
    if (masterSlider) masterSlider.value = String(state.masterVolume);
    if (masterVal) masterVal.textContent = state.masterVolume + '%';

    const pauseBtn = root.querySelector('[data-action="toggle-pause"]');
    if (pauseBtn) {
      pauseBtn.textContent = state.isPaused ? '▶️ Devam Et' : '⏸️ Duraklat';
    }

    // Presets
    root.querySelectorAll('[data-preset]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-preset') === state.activePreset);
    });

    // Sleep timer controls & countdown
    root.querySelectorAll('[data-sleep-mins]').forEach(function (btn) {
      const m = parseInt(btn.getAttribute('data-sleep-mins'), 10) || 0;
      btn.classList.toggle('active', state.sleepMinutes === m);
    });
    const countdownEl = root.querySelector('[data-sleep-countdown]');
    if (countdownEl) {
      if (state.sleepEndTime && state.sleepMinutes > 0) {
        const msLeft = Math.max(0, state.sleepEndTime - Date.now());
        countdownEl.style.display = 'inline-flex';
        countdownEl.textContent = (state.sleepFading ? '🌙 Kısılıyor ' : '⏳ ') + formatSleepRemaining(msLeft);
      } else {
        countdownEl.style.display = 'none';
      }
    }

    // Personal Mix Load button enabled state
    const loadMixBtn = root.querySelector('[data-action="load-custom-mix"]');
    if (loadMixBtn) {
      loadMixBtn.disabled = !loadCustomMix();
    }

    // Channels
    CHANNELS.forEach(function (c) {
      const ch = state.channels[c.id];
      const card = root.querySelector('[data-channel-card="' + c.id + '"]');
      if (!card) return;

      const isAudible = !state.isPaused && state.masterVolume > 0 && ch.volume > 0 && !ch.muted && (!anySolo || ch.solo);
      const isDimmed = ch.muted || (anySolo && !ch.solo);

      card.classList.toggle('is-audible', isAudible);
      card.classList.toggle('is-dimmed', isDimmed);

      const slider = card.querySelector('[data-slider="' + c.id + '"]');
      const valEl = card.querySelector('[data-val="' + c.id + '"]');
      if (slider) slider.value = String(ch.volume);
      if (valEl) valEl.textContent = ch.volume + '%';

      const muteBtn = card.querySelector('[data-action="mute"]');
      const soloBtn = card.querySelector('[data-action="solo"]');
      if (muteBtn) {
        muteBtn.classList.toggle('is-mute-active', ch.muted);
        muteBtn.setAttribute('aria-pressed', ch.muted ? 'true' : 'false');
      }
      if (soloBtn) {
        soloBtn.classList.toggle('is-solo-active', ch.solo);
        soloBtn.setAttribute('aria-pressed', ch.solo ? 'true' : 'false');
      }
    });
  }

  // =========================================================================
  // Module Registration
  // =========================================================================

  window.SEYYAH_MODULES.soundMixer = {
    render: render,
    stopAll: function () {
      stopAll(true);
    }
  };
})();
