/**
 * Ücretsiz seçenek: Google Gemini API (Google AI Studio'dan alınan ücretsiz kotalı anahtar).
 * Anahtar yalnız sunucu ortam değişkeninde (GEMINI_API_KEY) durur; istemciye gönderilmez.
 */

export class GeminiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Anthropic biçimindeki içerik bloklarını Gemini "parts" biçimine çevirir. */
export function toGeminiParts(content) {
  if (typeof content === 'string') return [{ text: content }];
  return content.map((b) =>
    b.type === 'image' ? { inline_data: { mime_type: b.source.media_type, data: b.source.data } } : { text: b.text },
  );
}

export function buildGeminiBody({ system, history, userContent, maxOutputTokens = 8192 }) {
  return {
    systemInstruction: { parts: [{ text: system }] },
    contents: [
      ...history.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      { role: 'user', parts: toGeminiParts(userContent) },
    ],
    generationConfig: { maxOutputTokens, temperature: 0.6 },
  };
}

export async function askGemini({ apiKey, model, system, history, userContent, signal }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(buildGeminiBody({ system, history, userContent })),
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new GeminiError(res.status, data?.error?.message || `Gemini hatası (${res.status})`);
  const cand = data.candidates?.[0];
  if (!cand || cand.finishReason === 'SAFETY' || data.promptFeedback?.blockReason) {
    return { text: 'Bu isteğe yanıt veremiyorum. Soruyu farklı bir şekilde sorabilir misin?', truncated: false };
  }
  const text = (cand.content?.parts ?? [])
    .map((p) => p.text ?? '')
    .join('')
    .trim();
  return { text: text || 'Yanıt üretilemedi.', truncated: cand.finishReason === 'MAX_TOKENS' };
}
