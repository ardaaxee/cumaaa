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
  hatam: 'Öğrencinin verdiği yanlış cevabı öğretici bir toparlanma akışına çevir: (1) hata türünü somut olarak söyle, (2) o eksiği kapatan yaklaşık 60 saniyelik mini ders ver, (3) doğru düşünme yolunu adım adım göster, (4) benzer hatayı önleyen tek kontrol alışkanlığı ver, (5) aynı kazanımı ölçen kısa ve özgün bir kontrol sorusu sor. Kontrol sorusunun cevabını hemen verme; öğrencinin denemesini bekle.',
  benzer: 'Bağlamdaki soruyla aynı kazanımı ölçen, özgün ve farklı sayılarla yeni bir soru yaz (5 seçenekli, cevabı ve çözümü en sonda ayrı başlıkla).',
  quiz: 'Seçili konudan 5 soruluk özgün mini quiz hazırla (her soru 5 seçenekli). Cevap anahtarını ve kısa çözümleri en sona koy.',
  yanlislar: 'Öğrencinin yanlışlar listesine bakarak ortak hata kalıplarını bul ve somut bir çalışma önerisi ver.',
  bugun: 'Öğrencinin verilerine bakarak bugün ne çalışması gerektiğini somut bir plan halinde öner. Veri yoksa bunu açıkça söyle.',
  serbest: 'Öğrencinin sorusunu cevapla.',
  foto: 'Fotoğraftaki soruyu oku; önce soruyu kısaca yaz, çözümden önce kısa bir ipucu ver, sonra kullanılan konu ve kuralları açıklayarak adım adım çöz ve doğru seçeneği belirt. Sonunda aynı kazanımı ölçen özgün bir benzer soru oluştur; benzer sorunun cevabını kullanıcı istemeden verme. Fotoğraf okunaksızsa bunu söyle ve tahmin yürütme.',
};

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
/** base64 karakter sınırı (~5 MB görüntü). */
const MAX_IMAGE_B64 = 7_000_000;

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
  const teacherName = clip(body.teacherName, 40).trim() || 'Cuma';
  let image = null;
  if (body.image != null) {
    const mediaType = body.image && typeof body.image.mediaType === 'string' ? body.image.mediaType : '';
    const data = body.image && typeof body.image.data === 'string' ? body.image.data : '';
    if (!IMAGE_TYPES.has(mediaType) || !data || data.length > MAX_IMAGE_B64 || !/^[A-Za-z0-9+/=]+$/.test(data)) {
      return { error: 'Fotoğraf okunamadı (JPEG/PNG/WebP, en fazla ~5 MB).' };
    }
    image = { mediaType, data };
  }
  if (action === 'foto' && !image) return { error: 'Çözülecek fotoğraf eklenmedi.' };
  return { value: { action, message, context, history, teacherName, image } };
}

export function buildSystemPrompt(teacherName, studentName = '') {
  const her = studentName || 'sevgilin';
  return [
    `Sen ${teacherName}sın: ${her} adlı, YKS'ye (TYT + AYT Sayısal) hazırlanan 12. sınıf öğrencisinin erkek arkadaşısın ve ona bu uygulamada ders çalıştırıyorsun.`,
    `${her} ile sıcak, sevgi dolu ve esprili konuş (ara sıra "${her}cim", "canım" gibi hitaplar ve ♡ kullanabilirsin), onu motive et; ama ders anlatırken deneyimli bir öğretmen kadar net, doğru ve adım adım ol.`,
    'Türkçe konuş. Aşırı tatlılık, uzun iltifat ve dolgu cümlesi yok; önce konu, sonra kısa bir sevgi/moral cümlesi.',
    'Ezberletme: her kuralın "neden"ini açıkla. Öğretim sırası mümkünse: 1) kavramı kısa tanımla, 2) nedenini/sezgisini açıkla, 3) adım adım uygula, 4) öğrencinin kendini kontrol edeceği tek kısa soru sor, 5) 1–2 cümlelik özet ver.',
    'Matematik ifadelerini düz metin/Unicode ile yaz (x², √, π, ≤, logₐ). LaTeX kullanma.',
    'Yazdığın soruların özgün olduğunu belirt; hiçbir soruyu "ÖSYM sorusu" veya "çıkmış soru" olarak sunma, gerçek ÖSYM sorularını kopyalama.',
    'Emin olmadığın bilgiyi uydurma; emin değilsen bunu söyle ve öğrenciyi resmî kaynağa (MEB ders kitabı, ÖSYM) yönlendir.',
    'Öğrenci verisi (istatistik, yanlışlar) verilmişse yalnız o veriye dayan; veri yoksa varsayım yapma.',
    'Bir yanlış cevap verilmişse öğrenciyi küçümseme; önce hatanın türünü somutlaştır, kısa mini dersle eksik kavramı kapat, doğru yöntemi göster, benzer hatayı önlemek için tek kontrol alışkanlığı öner ve en sonda cevabını vermediğin kısa bir kontrol sorusu sor.',
    'Fotoğraflı soruda okunamayan sayı/sembol varsa tahmin etme; hangi kısmın okunamadığını açıkça iste.',
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

export function buildUserContent({ action, message, context, image }) {
  const lines = [`Görev: ${TEACHER_ACTIONS[action]}`];
  const ctxLines = Object.entries(context).map(([k, v]) => `### ${CONTEXT_LABELS[k] ?? k}\n${v}`);
  if (ctxLines.length) lines.push('', '## Bağlam', ...ctxLines);
  if (message) lines.push('', '## Öğrencinin mesajı', message);
  const text = lines.join('\n');
  if (!image) return text;
  // Görsel, metinden önce verilir.
  return [
    { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
    { type: 'text', text },
  ];
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
