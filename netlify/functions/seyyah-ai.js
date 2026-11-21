/**
 * Netlify Serverless Function: Dijital Seyyah — Gemini AI Proxy
 * Reads GEMINI_API_KEY securely from Netlify Environment Variables (NEVER stored in GitHub).
 * Endpoint: /.netlify/functions/seyyah-ai
 */

const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash'
]);

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
    const requestedModel = String(payload.model || 'gemini-2.5-flash').trim();
    const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : 'gemini-2.5-flash';

    if (!prompt || prompt.length > 1500) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Geçersiz veya çok uzun soru.' })
      };
    }

    const history = Array.isArray(payload.history) ? payload.history.slice(-6) : [];
    const contents = history
      .filter((m) => m && (m.role === 'user' || m.role === 'model') && m.text)
      .map((m) => ({
        role: m.role,
        parts: [{ text: String(m.text).slice(0, 800) }]
      }));

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const systemInstruction = contextSummary
      ? `${DEFAULT_SYSTEM_PROMPT}\n\nGüncel Seyyah Verisi:\n${contextSummary}`
      : DEFAULT_SYSTEM_PROMPT;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 650
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'GEMINI_API_ERROR',
          message: (data && data.error && data.error.message) || 'Gemini API hatası'
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

    if (!reply) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'EMPTY_GEMINI_REPLY' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply, model, source: 'netlify' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'SERVER_ERROR', message: err.message })
    };
  }
};
