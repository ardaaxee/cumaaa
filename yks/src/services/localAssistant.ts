import { allTopics, type TopicRef } from '../data/curriculum';
import { loadLesson } from '../data/content';
import type { LessonSeed, Question } from '../domain/types';
import type { AppState } from '../store/schema';
import { weakTopics } from '../utils/analysis';
import { dayKey, diffDays, formatMinutes } from '../utils/date';
import { optionLetter } from '../utils/ids';
import { calcNet, formatNet } from '../utils/net';
import { dueReviews } from '../utils/srs';
import { dashboard } from '../utils/stats';
import type { TeacherAction } from './ai';
import { lookup } from './lookup';
import { buildRecommendations } from './recommendations';

/**
 * Yerel asistan: gerçek bir AI bağlantısı yokken çalışır. Yanıtlarını yalnızca
 * uygulamadaki gerçek veriden üretir — konu anlatımları, öğrencinin kendi
 * istatistikleri, yanlışları ve planı. Bilmediği bir şeyi uydurmaz.
 */

export interface AssistantInput {
  action: TeacherAction;
  message: string;
  state: AppState;
  /** Sayfada seçili konu (varsa). */
  topic?: TopicRef;
  lesson?: LessonSeed | null;
  question?: Question | null;
  studentAnswer?: number | null;
}

const trLower = (s: string) => s.toLocaleLowerCase('tr-TR');

/** Türkçe karakterleri sadeleştirip karşılaştırma için normalize eder. */
export function norm(s: string): string {
  return trLower(s)
    .replace(/[çc]/g, 'c')
    .replace(/[ğg]/g, 'g')
    .replace(/[ıi]/g, 'i')
    .replace(/[öo]/g, 'o')
    .replace(/[şs]/g, 's')
    .replace(/[üu]/g, 'u')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP = new Set(['ve', 'ile', 'bir', 'bu', 'da', 'de', 'mi', 'mu', 'ne', 'nedir', 'nasil', 'konu', 'konusu', 'anlat', 'bana', 'icin', 'olan', 'temel', 'giris']);

/** Öğrencilerin sık kullandığı adları müfredattaki konu adlarına bağlar. */
const SYNONYMS: [string, string][] = [
  ['kurtulus savasi', 'milli mucadele'],
  ['istiklal savasi', 'milli mucadele'],
  ['mitoz', 'hucre bolunmeleri'],
  ['mayoz', 'hucre bolunmeleri'],
  ['dna', 'nukleik asitler'],
  ['protein sentezi', 'nukleik asitler'],
  ['genetik', 'kalitimin genel ilkeleri'],
  ['kalitim', 'kalitimin genel ilkeleri'],
  ['ebob', 'ebob ve ekok'],
  ['ekok', 'ebob ve ekok'],
  ['problem', 'problemler'],
  ['yuzde', 'yuzde kar zarar'],
  ['kar zarar', 'yuzde kar zarar'],
  ['permutasyon', 'permutasyon kombinasyon'],
  ['kombinasyon', 'permutasyon kombinasyon'],
  ['newton', 'newtonin hareket yasalari'],
  ['elektrik', 'elektrik akimi ve devreler'],
  ['mercek', 'optik'],
  ['ayna', 'optik'],
  ['kirilma', 'optik'],
  ['asit', 'asitler bazlar ve tuzlar'],
  ['baz', 'asitler bazlar ve tuzlar'],
  ['periyodik', 'atom ve periyodik sistem'],
  ['iklim', 'iklim bilgisi'],
  ['harita', 'harita bilgisi'],
  ['fotosentez', 'fotosentez'],
  ['solunum', 'kemosentez ve hucresel solunum'],
];

/** Mesajda geçen en uygun konuyu bulur (konu adı ya da anlamlı kelimeleri üzerinden). */
export function findTopic(message: string): TopicRef | undefined {
  let base = norm(message);
  for (const [from, to] of SYNONYMS) if (` ${base} `.includes(` ${from}`)) base += ` ${to}`;
  const m = ` ${base} `;
  let best: { ref: TopicRef; score: number } | undefined;
  for (const ref of allTopics()) {
    const name = norm(ref.topic.name);
    let score = 0;
    if (m.includes(` ${name} `) || m.includes(` ${name}`)) score = 100 + name.length;
    else {
      const words = name.split(' ').filter((w) => w.length > 2 && !STOP.has(w));
      const hits = words.filter((w) => m.includes(` ${w.slice(0, Math.max(4, w.length - 2))}`));
      if (hits.length) score = (hits.length / words.length) * 50 + hits.join('').length;
      for (const st of ref.topic.subtopics) {
        const sn = norm(st.name);
        if (sn.length > 3 && m.includes(sn)) score = Math.max(score, 60 + sn.length);
      }
    }
    if (score > 0 && (!best || score > best.score)) best = { ref, score };
  }
  return best && best.score >= 30 ? best.ref : undefined;
}

const has = (m: string, ...words: string[]) => words.some((w) => m.includes(w));

function lessonReply(kind: 'anlat' | 'basit' | 'detayli' | 'ornek' | 'ipucu' | 'formul' | 'hata' | 'ozet' | 'osym', ref: TopicRef, l: LessonSeed): string {
  const title = `**${ref.topic.name}** (${ref.subject.exam} ${ref.subject.name})`;
  const firstPara = (s: string) => s.split('\n\n')[0];
  switch (kind) {
    case 'basit':
      return [title, firstPara(l.intro), `Kısaca mantığı: ${firstPara(l.logic)}`, `Aklında kalsın: ${l.summary[0] ?? ''}`].join('\n\n');
    case 'detayli':
      return [
        title,
        l.intro,
        ...l.concepts.slice(0, 5).map((c) => `• ${c.term}: ${c.definition}`),
        l.logic,
      ].join('\n\n');
    case 'ornek': {
      const ex = l.examples.find((e) => e.level === 'orta') ?? l.examples[0];
      if (!ex) return `${title}\n\nBu konu için kayıtlı çözümlü örnek yok.`;
      return [title, `Örnek: ${ex.problem}`, ...ex.steps.map((s, i) => `${i + 1}) ${s}`), `Cevap: ${ex.answer}`].join('\n');
    }
    case 'ipucu':
      return [title, ...l.tips.slice(0, 3).map((t) => `✦ ${t}`)].join('\n\n');
    case 'formul':
      return l.formulas.length
        ? [title, ...l.formulas.map((f) => `• ${f.expr} — ${f.meaning}`)].join('\n')
        : `${title}\n\nBu konuda ezberlenecek özel bir formül yok; mantığı daha önemli:\n\n${firstPara(l.logic)}`;
    case 'hata':
      return [title, 'En sık yapılan hatalar:', ...l.commonMistakes.slice(0, 4).map((c) => `• ${c}`)].join('\n');
    case 'ozet':
      return [title, '1 dakikalık özet:', ...l.summary.map((s) => `• ${s}`)].join('\n');
    case 'osym':
      return [title, `ÖSYM bu konuyu nasıl sorar: ${l.osymThinking}`].join('\n\n');
    default:
      return [title, l.intro, `Mantığı: ${firstPara(l.logic)}`, `Özet: ${l.summary.slice(0, 3).join(' ')}`].join('\n\n');
  }
}

function lessonKind(action: TeacherAction, m: string): Parameters<typeof lessonReply>[0] {
  if (action === 'basit' || has(m, 'basit', 'kolay anlat', 'anlamadim')) return 'basit';
  if (action === 'detayli' || has(m, 'detay', 'ayrinti', 'derin')) return 'detayli';
  if (action === 'ornek' || has(m, 'ornek', 'soru coz', 'coz')) return 'ornek';
  if (action === 'ipucu' || has(m, 'ipucu', 'puf', 'taktik')) return 'ipucu';
  if (has(m, 'formul')) return 'formul';
  if (has(m, 'hata', 'yanlis yap', 'dikkat')) return 'hata';
  if (has(m, 'ozet', 'kisaca', 'tekrar')) return 'ozet';
  if (has(m, 'osym', 'nasil sorar', 'cikar')) return 'osym';
  return 'anlat';
}

function netReply(m: string): string | null {
  const d = m.match(/(\d+)\s*d(ogru)?\b/);
  const y = m.match(/(\d+)\s*y(anlis)?\b/);
  if (!d && !y) return null;
  const dogru = Number(d?.[1] ?? 0);
  const yanlis = Number(y?.[1] ?? 0);
  const net = calcNet(dogru, yanlis);
  return `${dogru} doğru, ${yanlis} yanlış → net = ${dogru} − ${yanlis}/4 = **${formatNet(net)}**.\n\nHer 4 yanlış 1 doğruyu götürür; emin olmadığın soruda iki şıkkı eleyebiliyorsan işaretlemek genelde kârlıdır.`;
}

const CHEER = [
  'Yorulman çok normal, çünkü gerçekten emek veriyorsun. 10 dakika mola ver, su iç, sonra sadece 5 soru çözelim. Küçük adım yeter ♡',
  'Bir kötü gün seni tanımlamaz. Dün bilmediğin bir şeyi bugün öğrendiysen kazandın demektir.',
  'Kendini başkalarıyla değil, dünkü hâlinle kıyasla. Ben seninle gurur duyuyorum.',
  'Bugün sadece bir konu bitirsen bile bu, sınav gününe bir adım daha yakın olman demek. Hadi birlikte başlayalım.',
];

export async function assistantReply(input: AssistantInput): Promise<string> {
  const { action, state } = input;
  const raw = input.message.trim();
  const m = norm(raw);
  const name = state.profile.name ? `, ${state.profile.name}` : '';
  const today = dayKey();

  // 1) Seçili soruyla ilgili istekler
  if (input.question && (action === 'coz' || action === 'hatam' || action === 'ipucu' || has(m, 'bu soru', 'cozum', 'neden'))) {
    const q = input.question;
    const lines = [`Doğru cevap: **${optionLetter(q.correctAnswer)}) ${q.options[q.correctAnswer]}**`];
    if (input.studentAnswer != null && input.studentAnswer !== q.correctAnswer) {
      lines.push(`Sen ${optionLetter(input.studentAnswer)}) seçmişsin. Sık yapılan hata: ${q.commonMistake}`);
    }
    if (action === 'ipucu') return `İpucu: ${q.hint}`;
    lines.push(`Çözüm: ${q.solution}`);
    if (q.teacherNote) lines.push(`Not: ${q.teacherNote}`);
    return lines.join('\n\n');
  }

  // 2) Net hesabı ("35 doğru 8 yanlış", "net nasıl hesaplanır")
  const quickNet = netReply(m);
  if (quickNet) return quickNet;
  if (/\bnet\b/.test(m)) return 'Net = doğru − yanlış / 4. Örneğin “35 doğru 8 yanlış” yazarsan senin için hesaplarım.';

  // 3) Veriye dayalı istekler
  if (action === 'bugun' || has(m, 'ne calis', 'bugun ne', 'plan', 'nereden basla')) {
    const recs = buildRecommendations(state, lookup, today);
    if (!recs.length) return `Bugün için verine göre ek bir öneri yok${name}. Planındaki görevlere devam et; istersen Testler’den karışık 20 soru çöz, sonuçlara göre sana yol çizeyim.`;
    return [`Verine göre bugün şunları öneriyorum${name}:`, ...recs.slice(0, 4).map((r, i) => `${i + 1}) ${r.title} — ${r.detail}`)].join('\n');
  }
  if (action === 'yanlislar' || has(m, 'yanlis', 'hatam', 'hatalarim', 'zayif', 'eksik')) {
    const weak = weakTopics(state).slice(0, 5);
    if (!weak.length) return 'Henüz yanlış kaydın yok. Birkaç test çöz; hangi konularda zorlandığını buradan birlikte çıkaralım.';
    return [
      'Yanlışlarına göre en çok zorlandığın konular:',
      ...weak.map((w, i) => `${i + 1}) ${lookup.topicName(w.topicId)} — ${w.reasons.join(', ')}`),
      'Önerim: ilk konunun anlatımına 10 dk göz at, sonra aynı konudan 10 soruluk kolay-orta test çöz. Yanlışlarım sayfasından “benzer soru çöz” de diyebilirsin.',
    ].join('\n');
  }
  if (has(m, 'istatistik', 'durumum', 'kac soru', 'nasil gidiyor', 'ilerleme')) {
    const d = dashboard(state, today);
    return `Bugün ${d.todayQuestions} soru, ${formatMinutes(d.todayMinutes)} çalıştın. Bu hafta ${d.weekQuestions} soru çözdün. Doğruluğun ${d.accuracy != null ? `%${d.accuracy}` : 'henüz hesaplanmadı'}, serin ${d.streak} gün. ${d.completedTopics} konu tamamlandı.`;
  }
  if (has(m, 'tekrar')) {
    const due = dueReviews(state.reviews, today);
    if (due.length) return [`Bugün ${due.length} konunun tekrar günü:`, ...due.slice(0, 6).map((r) => `• ${lookup.topicName(r.topicId)}`)].join('\n');
  }
  if (has(m, 'kac gun', 'sinava ne kadar', 'sinav ne zaman')) {
    if (!state.profile.examDate) return 'Sınav tarihini Ayarlar’a girersen kaç gün kaldığını her gün söylerim.';
    return `Sınavına ${diffDays(today, state.profile.examDate)} gün var. Her gün biraz, çok şey eder ♡`;
  }

  // 4) Duygusal destek
  if (has(m, 'yoruldum', 'sikildim', 'uzgun', 'motivasyon', 'yapamiyorum', 'bunaldim', 'stres', 'kaygi', 'korkuyorum')) {
    return CHEER[(raw.length + today.length) % CHEER.length];
  }
  if (has(m, 'seni seviyorum', 'tesekkur', 'sagol', 'eyvallah')) return 'Ben de seninleyim ♡ Hadi bir soru daha çözelim mi?';
  if (/^(merhaba|selam|hey|gunaydin|iyi aksamlar|slm|mrb)\b/.test(m)) {
    return `Selam${name}! Ben senin çalışma asistanınım. Bir konu adı yaz (ör. “türev”, “mol kavramı”, “paragraf”), ya da “bugün ne çalışayım”, “yanlışlarım”, “35 doğru 8 yanlış net” gibi sor.`;
  }

  // 5) Konu anlatımı
  const ref = findTopic(raw) ?? input.topic;
  const wantsLesson = action !== 'serbest' || !!findTopic(raw);
  if (ref && wantsLesson) {
    const lesson = input.topic?.topic.id === ref.topic.id && input.lesson ? input.lesson : await loadLesson(ref.topic.id);
    if (!lesson) return `“${ref.topic.name}” için kayıtlı anlatım bulamadım. Dersler bölümünden konuyu açabilirsin.`;
    if (action === 'quiz' || action === 'benzer' || has(m, 'quiz', 'test', 'soru sor')) {
      return `${ref.topic.name} için konu sayfasının en altında “Konu sonu soruları” var; orada hemen 5 soru çözebilirsin. Daha fazlası için Testler’den bu konuyu seç.`;
    }
    return lessonReply(lessonKind(action, m), ref, lesson);
  }

  return 'Bunu tam anlayamadım. Bir konu adı yazabilirsin (ör. “logaritma”, “hücre”, “Kurtuluş Savaşı”), ya da “bugün ne çalışayım”, “yanlışlarım”, “durumum nasıl”, “40 doğru 10 yanlış” diyebilirsin.';
}
