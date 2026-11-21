/* ==========================================================================
   Dijital Seyyah — Accessibility, PWA Resilience & Pro Tools
   File: js/accessibility-pwa-pro.js
   Registers: window.SEYYAH_MODULES.proTools = {
     init(ctx),
     openShortcutsModal(),
     exportPersonalBackup()
   }
   Features:
     1. Live Online/Offline Connection Monitor (window online/offline -> toast)
     2. Keyboard Shortcuts Cheat-Sheet Modal (? key, glassmorphism, dark/light)
     3. Safe Personal Backup & Restore (strict allowlist, secret keys excluded)
   ========================================================================== */

(function () {
  'use strict';

  window.SEYYAH_MODULES = window.SEYYAH_MODULES || {};

  const STYLE_ID = 'seyyah-pro-tools-styles';
  const MODAL_ID = 'seyyah-pro-shortcuts-modal';
  const FILE_INPUT_ID = 'seyyah-pro-backup-file-input';
  const BACKUP_FORMAT = 'seyyah-personal-backup-v1';

  const OFFLINE_MSG = '📡 Çevrimdışı moda geçildi — 81 il arşivi önbellekten çalışıyor';
  const ONLINE_MSG = '🟢 İnternet bağlantısı geri geldi';

  // Strict allowlist of non-secret personal localStorage keys
  const ALLOWED_BACKUP_KEYS = Object.freeze([
    'dijital_seyyah_favorites',
    'dijital_seyyah_theme',
    'dijital_seyyah_journal_entries',
    'dijital_seyyah_bucket_list',
    'dijital_seyyah_pomodoro_stats',
    'dijital_seyyah_packing_state'
  ]);

  // Explicit denylist to guarantee secrets are never exported or imported
  const EXCLUDED_SECRET_KEYS = new Set([
    'dijital_seyyah_gemini_api_key',
    'dijital_seyyah_admin_github_cfg',
    'dijital_seyyah_admin_auth_ok'
  ]);

  const SHORTCUT_ITEMS = Object.freeze([
    {
      keys: ['Ctrl', 'K'],
      label: 'Arama Paleti',
      desc: 'Komut ve hızlı arama paletini aç veya kapat'
    },
    {
      keys: ['/'],
      label: 'İl Ara',
      desc: 'Kenar çubuğundaki il arama kutusuna odaklan'
    },
    {
      keys: ['?'],
      label: 'Kısayollar',
      desc: 'Klavye kısayolları ve kişisel yedekleme panelini aç'
    },
    {
      keys: ['Alt', 'Shift', 'M'],
      label: 'Yönetici',
      desc: 'Seyyah yönetici panelini aç'
    },
    {
      keys: ['Esc'],
      label: 'Kapat',
      desc: 'Açık pencere, galeri veya komut paletini kapat'
    },
    {
      keys: ['←', '→'],
      label: 'Galeri',
      desc: 'Fotoğraf galerisinde önceki / sonraki görsele geç'
    }
  ]);

  let _ctx = null;
  let _initialized = false;
  let _eventsBound = false;
  let _modalEl = null;
  let _statusEl = null;
  let _backupStatusEl = null;
  let _fileInputEl = null;
  let _lastFocusedEl = null;

  function notify(message) {
    if (_ctx && typeof _ctx.showToast === 'function') {
      _ctx.showToast(message);
      return;
    }
    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(message);
    }
  }

  function isOnline() {
    if (typeof navigator === 'undefined' || typeof navigator.onLine !== 'boolean') {
      return true;
    }
    return navigator.onLine;
  }

  function isTypingTarget(target) {
    if (!target || typeof Element === 'undefined' || !(target instanceof Element)) {
      return false;
    }
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      return true;
    }
    if (target.isContentEditable) {
      return true;
    }
    return Boolean(target.closest('[contenteditable="true"]'));
  }

  function isSafePersonalKey(key) {
    return (
      typeof key === 'string' &&
      ALLOWED_BACKUP_KEYS.includes(key) &&
      !EXCLUDED_SECRET_KEYS.has(key)
    );
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${MODAL_ID} {
        position: fixed;
        inset: 0;
        z-index: 1250;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(2, 6, 23, 0.72);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.2s ease, visibility 0.2s ease;
        font-family: var(--font-body, 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif);
      }

      #${MODAL_ID}.active {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }

      #${MODAL_ID} .seyyah-pro-dialog {
        width: 100%;
        max-width: 580px;
        max-height: calc(100vh - 32px);
        display: flex;
        flex-direction: column;
        background: var(--bg-glass, rgba(15, 23, 42, 0.88));
        backdrop-filter: blur(22px) saturate(150%);
        -webkit-backdrop-filter: blur(22px) saturate(150%);
        color: var(--text-primary, #f8fafc);
        border: 1px solid var(--border-glow, rgba(0, 242, 254, 0.35));
        border-radius: var(--radius-lg, 20px);
        box-shadow:
          0 24px 64px rgba(0, 0, 0, 0.58),
          0 0 32px rgba(0, 242, 254, 0.14),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);
        overflow: hidden;
        transform: translateY(10px) scale(0.97);
        transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      }

      #${MODAL_ID}.active .seyyah-pro-dialog {
        transform: translateY(0) scale(1);
      }

      #${MODAL_ID} .seyyah-pro-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        background: rgba(15, 23, 42, 0.55);
      }

      #${MODAL_ID} .seyyah-pro-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        min-width: 0;
      }

      #${MODAL_ID} .seyyah-pro-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--accent-cyan, #00f2fe);
      }

      #${MODAL_ID} .seyyah-pro-net-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 10px;
        border-radius: 9999px;
        font-size: 0.72rem;
        font-weight: 600;
        border: 1px solid rgba(16, 185, 129, 0.35);
        background: rgba(16, 185, 129, 0.12);
        color: var(--accent-emerald, #10b981);
      }

      #${MODAL_ID} .seyyah-pro-net-pill.is-offline {
        border-color: rgba(245, 158, 11, 0.4);
        background: rgba(245, 158, 11, 0.14);
        color: var(--accent-gold, #f59e0b);
      }

      #${MODAL_ID} .seyyah-pro-close {
        width: 34px;
        height: 34px;
        flex-shrink: 0;
        border-radius: var(--radius-sm, 8px);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
        background: transparent;
        color: var(--text-secondary, #94a3b8);
        font-size: 1.35rem;
        line-height: 1;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease;
      }

      #${MODAL_ID} .seyyah-pro-close:hover,
      #${MODAL_ID} .seyyah-pro-close:focus-visible {
        color: var(--text-primary, #f8fafc);
        border-color: var(--accent-cyan, #00f2fe);
        background: rgba(0, 242, 254, 0.1);
        outline: none;
      }

      #${MODAL_ID} .seyyah-pro-body {
        padding: 16px 20px 18px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      #${MODAL_ID} .seyyah-pro-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
      }

      #${MODAL_ID} .seyyah-pro-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 10px 14px;
        border-radius: var(--radius-md, 12px);
        background: var(--bg-card, rgba(30, 41, 59, 0.65));
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
      }

      #${MODAL_ID} .seyyah-pro-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      #${MODAL_ID} .seyyah-pro-name {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      #${MODAL_ID} .seyyah-pro-desc {
        font-size: 0.76rem;
        color: var(--text-secondary, #94a3b8);
      }

      #${MODAL_ID} .seyyah-pro-keys {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }

      #${MODAL_ID} .seyyah-pro-kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 26px;
        padding: 0 8px;
        border-radius: 6px;
        background: var(--bg-primary, #0a0f1d);
        border: 1px solid var(--border-glow, rgba(0, 242, 254, 0.35));
        box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.35);
        color: var(--accent-cyan, #00f2fe);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.76rem;
        font-weight: 700;
        line-height: 1;
      }

      #${MODAL_ID} .seyyah-pro-sep {
        font-size: 0.74rem;
        color: var(--text-muted, #64748b);
        margin: 0 1px;
      }

      #${MODAL_ID} .seyyah-pro-backup-box {
        padding: 14px;
        border-radius: var(--radius-md, 12px);
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      #${MODAL_ID} .seyyah-pro-backup-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
      }

      #${MODAL_ID} .seyyah-pro-backup-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--text-primary, #f8fafc);
      }

      #${MODAL_ID} .seyyah-pro-backup-note {
        font-size: 0.74rem;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.45;
      }

      #${MODAL_ID} .seyyah-pro-backup-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      #${MODAL_ID} .seyyah-pro-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 9px 14px;
        border-radius: var(--radius-sm, 8px);
        font-family: var(--font-body, sans-serif);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid var(--border-glow, rgba(0, 242, 254, 0.35));
        background: rgba(0, 242, 254, 0.12);
        color: var(--accent-cyan, #00f2fe);
        transition: transform 0.15s ease, background 0.18s ease, box-shadow 0.18s ease;
      }

      #${MODAL_ID} .seyyah-pro-btn:hover,
      #${MODAL_ID} .seyyah-pro-btn:focus-visible {
        background: rgba(0, 242, 254, 0.22);
        box-shadow: 0 0 16px rgba(0, 242, 254, 0.2);
        transform: translateY(-1px);
        outline: none;
      }

      #${MODAL_ID} .seyyah-pro-btn-secondary {
        border-color: var(--border-glass, rgba(255, 255, 255, 0.18));
        background: rgba(255, 255, 255, 0.06);
        color: var(--text-primary, #f8fafc);
      }

      #${MODAL_ID} .seyyah-pro-btn-secondary:hover,
      #${MODAL_ID} .seyyah-pro-btn-secondary:focus-visible {
        border-color: var(--accent-emerald, #10b981);
        background: rgba(16, 185, 129, 0.14);
        box-shadow: 0 0 14px rgba(16, 185, 129, 0.18);
      }

      #${MODAL_ID} .seyyah-pro-backup-feedback {
        font-size: 0.76rem;
        color: var(--accent-emerald, #10b981);
        display: none;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        padding: 8px 10px;
        border-radius: 8px;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.28);
      }

      #${MODAL_ID} .seyyah-pro-backup-feedback.visible {
        display: flex;
      }

      #${MODAL_ID} .seyyah-pro-backup-feedback.is-error {
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.12);
        border-color: rgba(239, 68, 68, 0.35);
      }

      #${MODAL_ID} .seyyah-pro-reload-btn {
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid rgba(16, 185, 129, 0.45);
        background: rgba(16, 185, 129, 0.18);
        color: inherit;
        font-size: 0.74rem;
        font-weight: 700;
        cursor: pointer;
      }

      #${MODAL_ID} .seyyah-pro-footer {
        padding-top: 10px;
        border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 0.75rem;
        color: var(--text-secondary, #94a3b8);
      }

      /* Light Theme Overrides */
      body.light-theme #${MODAL_ID} {
        background: rgba(15, 23, 42, 0.38);
      }

      body.light-theme #${MODAL_ID} .seyyah-pro-dialog {
        background: rgba(255, 255, 255, 0.94);
        color: #0f172a;
        border-color: rgba(2, 132, 199, 0.3);
        box-shadow:
          0 24px 56px rgba(15, 23, 42, 0.18),
          0 0 24px rgba(2, 132, 199, 0.1);
      }

      body.light-theme #${MODAL_ID} .seyyah-pro-header {
        background: rgba(241, 245, 249, 0.9);
        border-bottom-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme #${MODAL_ID} .seyyah-pro-row {
        background: rgba(241, 245, 249, 0.88);
        border-color: rgba(15, 23, 42, 0.09);
      }

      body.light-theme #${MODAL_ID} .seyyah-pro-kbd {
        background: #ffffff;
        color: #0284c7;
        border-color: rgba(2, 132, 199, 0.35);
        box-shadow: inset 0 -2px 0 rgba(15, 23, 42, 0.1);
      }

      body.light-theme #${MODAL_ID} .seyyah-pro-backup-box {
        background: rgba(241, 245, 249, 0.78);
        border-color: rgba(15, 23, 42, 0.1);
      }

      body.light-theme #${MODAL_ID} .seyyah-pro-btn {
        background: rgba(2, 132, 199, 0.1);
        color: #0369a1;
        border-color: rgba(2, 132, 199, 0.32);
      }

      body.light-theme #${MODAL_ID} .seyyah-pro-btn-secondary {
        background: #ffffff;
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.16);
      }

      body.light-theme #${MODAL_ID} .seyyah-pro-backup-feedback.is-error {
        color: #b91c1c;
      }

      @media (max-width: 640px) {
        #${MODAL_ID} .seyyah-pro-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        #${MODAL_ID} .seyyah-pro-backup-actions {
          flex-direction: column;
        }
        #${MODAL_ID} .seyyah-pro-btn {
          width: 100%;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #${MODAL_ID},
        #${MODAL_ID} .seyyah-pro-dialog,
        #${MODAL_ID} .seyyah-pro-btn {
          transition: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function renderKeyGroup(keys) {
    const useSlashSep = keys.includes('←');
    return keys
      .map((key, idx) => {
        const sep =
          idx > 0
            ? `<span class="seyyah-pro-sep">${useSlashSep ? '/' : '+'}</span>`
            : '';
        return `${sep}<kbd class="seyyah-pro-kbd">${key}</kbd>`;
      })
      .join('');
  }

  function updateConnectionBadge() {
    if (!_statusEl) return;
    const online = isOnline();
    _statusEl.classList.toggle('is-offline', !online);
    _statusEl.textContent = online ? '🟢 Çevrimiçi' : '📡 Çevrimdışı (Önbellek)';
  }

  function showBackupFeedback(message, isError, showReload) {
    if (!_backupStatusEl) return;
    _backupStatusEl.innerHTML = '';
    _backupStatusEl.classList.toggle('is-error', Boolean(isError));
    _backupStatusEl.classList.add('visible');

    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    _backupStatusEl.appendChild(textSpan);

    if (showReload) {
      const reloadBtn = document.createElement('button');
      reloadBtn.type = 'button';
      reloadBtn.className = 'seyyah-pro-reload-btn';
      reloadBtn.textContent = '🔄 Sayfayı Yenile';
      reloadBtn.addEventListener('click', () => {
        window.location.reload();
      });
      _backupStatusEl.appendChild(reloadBtn);
    }
  }

  function collectSafePersonalData() {
    const data = {};
    let count = 0;

    for (let i = 0; i < ALLOWED_BACKUP_KEYS.length; i += 1) {
      const key = ALLOWED_BACKUP_KEYS[i];
      if (!isSafePersonalKey(key)) continue;
      try {
        const val = window.localStorage.getItem(key);
        if (val !== null) {
          data[key] = val;
          count += 1;
        }
      } catch (_) {
        // Ignore storage read errors in restricted contexts
      }
    }

    return { data, count };
  }

  function exportPersonalBackup() {
    const { data, count } = collectSafePersonalData();
    const payload = {
      app: 'Dijital Seyyah',
      format: BACKUP_FORMAT,
      exportedAt: new Date().toISOString(),
      excludedSecrets: Array.from(EXCLUDED_SECRET_KEYS),
      data
    };

    const jsonText = JSON.stringify(payload, null, 2);
    const dateStamp = new Date().toISOString().slice(0, 10);
    const filename = `dijital-seyyah-yedek-${dateStamp}.json`;

    try {
      const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      notify('⚠️ Yedek dosyası oluşturulamadı');
      showBackupFeedback('Yedek dosyası indirilemedi.', true, false);
      return null;
    }

    const msg = `💾 Kişisel veri yedeği indirildi (${count} kayıt)`;
    notify(msg);
    showBackupFeedback(`${msg} — gizli anahtarlar hariç tutuldu.`, false, false);
    return payload;
  }

  function extractBackupMap(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    if (parsed.data && typeof parsed.data === 'object' && !Array.isArray(parsed.data)) {
      return parsed.data;
    }
    if (parsed.keys && typeof parsed.keys === 'object' && !Array.isArray(parsed.keys)) {
      return parsed.keys;
    }
    const hasKnownKey = ALLOWED_BACKUP_KEYS.some((k) => Object.prototype.hasOwnProperty.call(parsed, k));
    return hasKnownKey ? parsed : null;
  }

  function restorePersonalBackupObject(parsed) {
    const sourceMap = extractBackupMap(parsed);
    if (!sourceMap) {
      notify('⚠️ Geçersiz yedek dosyası formatı');
      showBackupFeedback('Geçersiz yedek dosyası formatı.', true, false);
      return 0;
    }

    let restoredCount = 0;

    for (let i = 0; i < ALLOWED_BACKUP_KEYS.length; i += 1) {
      const key = ALLOWED_BACKUP_KEYS[i];
      if (!isSafePersonalKey(key)) continue;
      if (!Object.prototype.hasOwnProperty.call(sourceMap, key)) continue;

      const rawVal = sourceMap[key];
      if (rawVal === undefined || rawVal === null) continue;

      const serialized = typeof rawVal === 'string' ? rawVal : JSON.stringify(rawVal);
      try {
        window.localStorage.setItem(key, serialized);
        restoredCount += 1;

        if (key === 'dijital_seyyah_theme' && (serialized === 'light' || serialized === 'dark')) {
          document.body.classList.toggle('light-theme', serialized === 'light');
        }
      } catch (_) {
        // Ignore individual storage quota/security error
      }
    }

    if (restoredCount === 0) {
      notify('ℹ️ Yedek dosyasında geri yüklenecek kişisel kayıt bulunamadı');
      showBackupFeedback('Geri yüklenecek geçerli kişisel kayıt bulunamadı.', true, false);
      return 0;
    }

    const successMsg = `📂 Yedek yüklendi (${restoredCount} kişisel kayıt geri getirildi)`;
    notify(successMsg);
    showBackupFeedback(successMsg, false, true);
    return restoredCount;
  }

  function handleBackupFileChange(event) {
    const input = event.target;
    const file = input && input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        restorePersonalBackupObject(parsed);
      } catch (_) {
        notify('⚠️ Yedek JSON dosyası okunamadı');
        showBackupFeedback('JSON dosyası ayrıştırılamadı.', true, false);
      } finally {
        input.value = '';
      }
    };
    reader.onerror = () => {
      notify('⚠️ Yedek dosyası okunurken hata oluştu');
      showBackupFeedback('Dosya okuma hatası.', true, false);
      input.value = '';
    };
    reader.readAsText(file, 'utf-8');
  }

  function createModal() {
    _modalEl = document.getElementById(MODAL_ID);
    if (_modalEl) {
      _statusEl = _modalEl.querySelector('.seyyah-pro-net-pill');
      _backupStatusEl = _modalEl.querySelector('.seyyah-pro-backup-feedback');
      _fileInputEl = _modalEl.querySelector(`#${FILE_INPUT_ID}`);
      return;
    }

    _modalEl = document.createElement('div');
    _modalEl.id = MODAL_ID;
    _modalEl.setAttribute('role', 'dialog');
    _modalEl.setAttribute('aria-modal', 'true');
    _modalEl.setAttribute('aria-labelledby', 'seyyah-pro-shortcuts-title');
    _modalEl.setAttribute('aria-hidden', 'true');

    const rowsHtml = SHORTCUT_ITEMS.map((item) => `
      <li class="seyyah-pro-row">
        <div class="seyyah-pro-info">
          <span class="seyyah-pro-name">${item.label}</span>
          <span class="seyyah-pro-desc">${item.desc}</span>
        </div>
        <div class="seyyah-pro-keys" aria-label="${item.keys.join(' ')}">
          ${renderKeyGroup(item.keys)}
        </div>
      </li>
    `).join('');

    _modalEl.innerHTML = `
      <div class="seyyah-pro-dialog">
        <div class="seyyah-pro-header">
          <div class="seyyah-pro-header-left">
            <h2 class="seyyah-pro-title" id="seyyah-pro-shortcuts-title">
              <span aria-hidden="true">⌨️</span>
              <span>Klavye Kısayolları &amp; Pro Araçlar</span>
            </h2>
            <span class="seyyah-pro-net-pill" aria-live="polite"></span>
          </div>
          <button type="button" class="seyyah-pro-close" aria-label="Kısayollar penceresini kapat">&times;</button>
        </div>
        <div class="seyyah-pro-body">
          <ul class="seyyah-pro-list">
            ${rowsHtml}
          </ul>

          <section class="seyyah-pro-backup-box" aria-label="Kişisel veri yedekleme ve geri yükleme">
            <div class="seyyah-pro-backup-head">
              <span class="seyyah-pro-backup-title">🛡️ Güvenli Kişisel Veri Yedeği</span>
            </div>
            <p class="seyyah-pro-backup-note">
              Favoriler, tema, günlük notları, hedef listesi, pomodoro ve çanta verilerini dışa aktarır. API ve yönetici gizli anahtarları güvenlik gereği asla yedeklenmez.
            </p>
            <div class="seyyah-pro-backup-actions">
              <button type="button" class="seyyah-pro-btn" data-pro-action="export">
                💾 Kişisel Veri Yedeği Al (JSON)
              </button>
              <button type="button" class="seyyah-pro-btn seyyah-pro-btn-secondary" data-pro-action="import">
                📂 Yedek Yükle
              </button>
              <input id="${FILE_INPUT_ID}" type="file" accept=".json,application/json" hidden />
            </div>
            <div class="seyyah-pro-backup-feedback" aria-live="polite"></div>
          </section>

          <div class="seyyah-pro-footer">
            <span>İstediğiniz zaman <kbd class="seyyah-pro-kbd">?</kbd> ile açıp kapatabilirsiniz.</span>
            <span><kbd class="seyyah-pro-kbd">Esc</kbd> Kapat</span>
          </div>
        </div>
      </div>
    `;

    _statusEl = _modalEl.querySelector('.seyyah-pro-net-pill');
    _backupStatusEl = _modalEl.querySelector('.seyyah-pro-backup-feedback');
    _fileInputEl = _modalEl.querySelector(`#${FILE_INPUT_ID}`);

    const closeBtn = _modalEl.querySelector('.seyyah-pro-close');
    const exportBtn = _modalEl.querySelector('[data-pro-action="export"]');
    const importBtn = _modalEl.querySelector('[data-pro-action="import"]');

    if (closeBtn) closeBtn.addEventListener('click', closeShortcutsModal);
    if (exportBtn) exportBtn.addEventListener('click', exportPersonalBackup);
    if (importBtn && _fileInputEl) {
      importBtn.addEventListener('click', () => _fileInputEl.click());
    }
    if (_fileInputEl) {
      _fileInputEl.addEventListener('change', handleBackupFileChange);
    }

    _modalEl.addEventListener('click', (e) => {
      if (e.target === _modalEl) {
        closeShortcutsModal();
      }
    });

    document.body.appendChild(_modalEl);
    updateConnectionBadge();
  }

  function isShortcutsModalOpen() {
    return Boolean(_modalEl && _modalEl.classList.contains('active'));
  }

  function openShortcutsModal() {
    injectStyles();
    if (!_modalEl) {
      createModal();
    }
    if (!_modalEl || isShortcutsModalOpen()) return;

    // Close legacy pwaUx modal if active to avoid overlapping cheat-sheets
    const legacyPwa = window.SEYYAH_MODULES && window.SEYYAH_MODULES.pwaUx;
    if (legacyPwa && typeof legacyPwa.closeShortcutsModal === 'function') {
      try {
        legacyPwa.closeShortcutsModal();
      } catch (_) {}
    }

    updateConnectionBadge();
    _lastFocusedEl = document.activeElement;
    _modalEl.classList.add('active');
    _modalEl.setAttribute('aria-hidden', 'false');

    const closeBtn = _modalEl.querySelector('.seyyah-pro-close');
    if (closeBtn && typeof closeBtn.focus === 'function') {
      closeBtn.focus();
    }
  }

  function closeShortcutsModal() {
    if (!_modalEl || !isShortcutsModalOpen()) return;

    _modalEl.classList.remove('active');
    _modalEl.setAttribute('aria-hidden', 'true');

    if (_lastFocusedEl && typeof _lastFocusedEl.focus === 'function') {
      try {
        _lastFocusedEl.focus();
      } catch (_) {}
    }
    _lastFocusedEl = null;
  }

  function handleOffline() {
    updateConnectionBadge();
    notify(OFFLINE_MSG);
  }

  function handleOnline() {
    updateConnectionBadge();
    notify(ONLINE_MSG);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape' && isShortcutsModalOpen()) {
      e.preventDefault();
      e.stopPropagation();
      closeShortcutsModal();
      return;
    }

    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    if (isTypingTarget(e.target)) {
      return;
    }

    if (e.key === '?') {
      e.preventDefault();
      e.stopPropagation();
      if (isShortcutsModalOpen()) {
        closeShortcutsModal();
      } else {
        openShortcutsModal();
      }
    }
  }

  function bindEvents() {
    if (_eventsBound) return;
    _eventsBound = true;

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    // Capture phase prevents duplicate bubble-phase '?' modal handlers from also firing
    document.addEventListener('keydown', handleKeyDown, true);
  }

  function init(ctx) {
    if (ctx) {
      _ctx = ctx;
    }
    if (_initialized) {
      updateConnectionBadge();
      return;
    }
    _initialized = true;

    injectStyles();
    createModal();
    bindEvents();
  }

  window.SEYYAH_MODULES.proTools = {
    init,
    openShortcutsModal,
    closeShortcutsModal,
    exportPersonalBackup
  };
})();
