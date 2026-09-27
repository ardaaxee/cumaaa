/**
 * Öğretmen yapay zekâsı için istek doğrulama ve istem (prompt) üretimi.
 * API anahtarı yalnız sunucu ortam değişkeninden okunur; istemciye asla gönderilmez.
 */

export const TEACHER_ACTIONS = {
  anlat: 'Seçili konuyu bir öğretmen gibi, sıfırdan ve mantığıyla anlat.',
  basit: 'Seçili konuyu çok daha basit, günlük hayattan benzetmelerle anlat.',
  detayli: 'Seçili konuyu YKS düzeyinde ayrıntılı, tüm alt başlıklarıyla anlat.',
  ornek: 'Seçili konudan orta zorlukta bir örnek soru kur ve adım adım çöz.',
  ipucu: 'Bağlamdaki soru için çözümü vermeden, düşünmeyi yönlendiren kısa bir ipucu ver.',
  coz: 'Bağlamdaki soruyu adım adım çöz; her adımın gerekçesini yaz.',
  hatam: 'Öğrencinin verdiği yanlış cevaba bakarak büyük olasılıkla nerede hata yaptığını açıkla ve doğru düşünme yolunu göster.',
  benzer: 'Bağlamdaki soruyla aynı kazanımı ölçen, özgün ve farklı sayılarla yeni bir soru yaz (5 seçenekli, cevabı ve çözümü en sonda ayrı başlıkla).',
  quiz: 'Seçili konudan 5 soruluk özgün mini quiz hazırla (her soru 5 seçenekli). Cevap anahtarını ve kısa çözümleri en sona koy.',
  yanlislar: 'Öğrencinin yanlışlar listesine bakarak ortak hata kalıplarını bul ve somut bir çalışma önerisi ver.',
  bugun: 'Öğrencinin verilerine bakarak bugün ne çalışması gerektiğini somut bir plan halinde öner. Veri yoksa bunu açıkça söyle.',
  serbest: 'Öğrencinin sorusunu cevapla.',
};

const MAX_MESSAGE = 4000;
const MAX_CONTEXT_FIELD = 6000;
const MAX_HISTORY = 12;

const CONTEXT_FIELDS = ['subject', 'topic', 'lessonSummary', 'question', 'studentAnswer', 'correctAnswer', 'solution', 'wrongsSummary', 'statsSummary', 'studentName'];

function clip(value, max) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

/** Gövdeyi doğrular. Hatalıysa { error } döner. */
export function validateTeacherRequest(body) {
  if (!body || typeof body !== 'object') return { error: 'Geçersiz istek.' };
  const action = typeof body.action === 'string' && body.action in TEACHER_ACTIONS ? body.action : null;
  if (!action) return { error: 'Bilinmeyen öğretmen işlemi.' };
  const message = clip(body.message, MAX_MESSAGE).trim();
  if (action === 'serbest' && !message) return { error: 'Mesaj boş olamaz.' };
  const rawContext = body.context && typeof body.context === 'object' ? body.context : {};
  const context = {};
  for (const key of CONTEXT_FIELDS) {
    const v = clip(rawContext[key], MAX_CONTEXT_FIELD).trim();
    if (v) context[key] = v;
  }
  const history = Array.isArray(body.history)
    ? body.history
        .filter((m) => m && (m.role === 'user' || m.role === 'teacher') && typeof m.text === 'string')
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: clip(m.text, MAX_MESSAGE) }))
    : [];
  const teacherName = clip(body.teacherName, 40).trim() || 'Cuma Öğretmen';
  return { value: { action, message, context, history, teacherName } };
}

export function buildSystemPrompt(teacherName) {
  return [
    `Sen "${teacherName}" adında, YKS'ye (TYT + AYT Sayısal) hazırlanan 12. sınıf öğrencilerine ders veren deneyimli bir Türk öğretmensin.`,
    'Türkçe konuş. Sıcak ama net ol; gereksiz övgü ve dolgu cümlesi kullanma.',
    'Ezberletme: her kuralın "neden"ini açıkla, adım adım ilerle, sonunda 1–2 cümlelik özet ver.',
    'Matematik ifadelerini düz metin/Unicode ile yaz (x², √, π, ≤, logₐ). LaTeX kullanma.',
    'Yazdığın soruların özgün olduğunu belirt; hiçbir soruyu "ÖSYM sorusu" veya "çıkmış soru" olarak sunma, gerçek ÖSYM sorularını kopyalama.',
    'Emin olmadığın bilgiyi uydurma; emin değilsen bunu söyle ve öğrenciyi resmî kaynağa (MEB ders kitabı, ÖSYM) yönlendir.',
    'Öğrenci verisi (istatistik, yanlışlar) verilmişse yalnız o veriye dayan; veri yoksa varsayım yapma.',
    'Yanıtı en fazla ~450 kelimede tut; başlık ve madde işaretlerini ölçülü kullan.',
  ].join('\n');
}

const CONTEXT_LABELS = {
  studentName: 'Öğrencinin adı',
  subject: 'Seçili ders',
  topic: 'Seçili konu',
  lessonSummary: 'Uygulamadaki konu özeti',
  question: 'Soru',
  studentAnswer: 'Öğrencinin cevabı',
  correctAnswer: 'Doğru cevap',
  solution: 'Uygulamadaki çözüm',
  wrongsSummary: 'Öğrencinin yanlışları',
  statsSummary: 'Öğrencinin çalışma verisi',
};

export function buildUserContent({ action, message, context }) {
  const lines = [`Görev: ${TEACHER_ACTIONS[action]}`];
  const ctxLines = Object.entries(context).map(([k, v]) => `### ${CONTEXT_LABELS[k] ?? k}\n${v}`);
  if (ctxLines.length) lines.push('', '## Bağlam', ...ctxLines);
  if (message) lines.push('', '## Öğrencinin mesajı', message);
  return lines.join('\n');
}

/** Basit, bellek içi IP başına hız sınırı. */
export function createRateLimiter({ limit = 20, windowMs = 60_000 } = {}) {
  const hits = new Map();
  return function allow(key, now = Date.now()) {
    const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (list.length >= limit) {
      hits.set(key, list);
      return false;
    }
    list.push(now);
    hits.set(key, list);
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
    }
    return true;
  };
}
