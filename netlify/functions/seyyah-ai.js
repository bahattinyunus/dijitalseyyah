/**
 * Netlify Serverless Function: Dijital Seyyah — Gemini AI Proxy
 * Reads GEMINI_API_KEY securely from Netlify Environment Variables (NEVER stored in GitHub).
 * Endpoint: /.netlify/functions/seyyah-ai
 */

const ALLOWED_MODELS = new Set([
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash'
]);

const FAILOVER_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash'
];

const RETIRED_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash'
]);

function buildModelCandidates(requestedModel) {
  const clean = String(requestedModel || '').trim();
  const primary =
    clean && ALLOWED_MODELS.has(clean) && !RETIRED_MODELS.has(clean)
      ? clean
      : 'gemini-flash-lite-latest';
  const list = [primary].concat(FAILOVER_MODELS);
  return list.filter((m, idx) => Boolean(m) && list.indexOf(m) === idx);
}

function isRetryableStatus(status, message) {
  if (status === 404 || status === 429 || status === 503) return true;
  return /quota|billing|limit|not found|high demand|no longer available|retired|overloaded|unavailable/i.test(
    String(message || '')
  );
}

const DEFAULT_SYSTEM_PROMPT = `Sen "Dijital Seyyah: Anadolu Seyahatnamesi" projesinin yapay zekâ destekli seyahat ve tefekkür rehberisin.
Görevlerin:
- Türkiye'nin 81 ili, 7 bölgesi, tarihî/manevi mirası, yöresel lezzetleri, İl Halk Kütüphanesi çalışma ofisleri ve 2-Opt rota planlaması hakkında doğru, samimi ve ilham verici Türkçe yanıtlar vermek.
- Evliya Çelebi ve İbn Battûta geleneğinin zarif üslubunu modern dijital göçebe pratikleriyle (5 Gün Kuralı, GSB Seyahatsever KYK yurtları, kütüphane ofisleri) harmanlamak.
- Cevaplarını kısa, net, okunabilir maddelerle ve **kalın** şehir adlarıyla yapılandırmak (en fazla 220 kelime).`;

exports.handler = async function (event) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: 'GEMINI_API_KEY_NOT_CONFIGURED',
        message: 'Netlify ortam değişkenlerinde GEMINI_API_KEY tanımlı değil.'
      })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const prompt = String(payload.prompt || '').trim();
    const contextSummary = String(payload.context || '').slice(0, 2500);
    const requestedModel = String(payload.model || 'gemini-flash-lite-latest').trim();
    const candidateModels = buildModelCandidates(requestedModel);

    if (!prompt || prompt.length > 1500) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Geçersiz veya çok uzun soru.' })
      };
    }

    const history = Array.isArray(payload.history) ? payload.history.slice(-6) : [];
    const alternating = [];
    for (const m of history) {
      if (!m || !m.text) continue;
      const role = m.role === 'assistant' || m.role === 'model' ? 'model' : m.role === 'user' ? 'user' : '';
      if (!role) continue;
      if (alternating.length === 0 && role !== 'user') continue;
      if (alternating.length > 0 && alternating[alternating.length - 1].role === role) continue;
      alternating.push({
        role,
        parts: [{ text: String(m.text).slice(0, 800) }]
      });
    }
    if (alternating.length > 0 && alternating[alternating.length - 1].role === 'user') {
      alternating.pop();
    }

    const contents = alternating.concat([
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ]);

    const systemInstruction = contextSummary
      ? `${DEFAULT_SYSTEM_PROMPT}\n\nGüncel Seyyah Verisi:\n${contextSummary}`
      : DEFAULT_SYSTEM_PROMPT;

    const requestBody = JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    });

    let lastStatus = 502;
    let lastErrorMessage = 'Gemini API yanıt vermedi';

    for (const tryModel of candidateModels) {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(tryModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

      let response;
      let data = null;
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody
        });
        data = await response.json().catch(() => null);
      } catch (netErr) {
        lastErrorMessage = netErr && netErr.message ? netErr.message : 'Ağ hatası';
        continue;
      }

      if (!response.ok) {
        const msg = (data && data.error && data.error.message) || `Gemini API hatası (HTTP ${response.status})`;
        lastStatus = response.status;
        lastErrorMessage = msg;
        if (isRetryableStatus(response.status, msg)) {
          continue;
        }
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({
            error: 'GEMINI_API_ERROR',
            message: msg,
            model: tryModel
          })
        };
      }

      const reply =
        data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts
          ? data.candidates[0].content.parts.map((p) => p.text || '').join('\n').trim()
          : '';

      if (reply) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ reply, model: tryModel, source: 'netlify' })
        };
      }

      lastStatus = 502;
      lastErrorMessage = 'EMPTY_GEMINI_REPLY';
    }

    return {
      statusCode: lastStatus,
      headers,
      body: JSON.stringify({
        error: 'GEMINI_API_ERROR',
        message: lastErrorMessage
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'SERVER_ERROR', message: err.message })
    };
  }
};
