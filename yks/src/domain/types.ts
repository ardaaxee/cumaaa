/**
 * Çekirdek alan tipleri. İçerik dosyaları (müfredat, konu anlatımı, soru bankası)
 * ve uygulama durumu bu tiplere dayanır.
 */

export type Exam = 'TYT' | 'AYT';

export type SubjectId =
  | 'tyt-turkce'
  | 'tyt-matematik'
  | 'tyt-geometri'
  | 'tyt-fizik'
  | 'tyt-kimya'
  | 'tyt-biyoloji'
  | 'tyt-tarih'
  | 'tyt-cografya'
  | 'tyt-felsefe'
  | 'tyt-din'
  | 'ayt-matematik'
  | 'ayt-geometri'
  | 'ayt-fizik'
  | 'ayt-kimya'
  | 'ayt-biyoloji';

export type Difficulty = 'kolay' | 'orta' | 'zor' | 'yeni-nesil';

export type QuestionType =
  | 'bilgi'
  | 'islem'
  | 'yorum'
  | 'grafik'
  | 'tablo'
  | 'deney'
  | 'onculu'
  | 'problem'
  | 'cok-adimli'
  | 'yeni-nesil';

/**
 * İçerik kaynak etiketi. Birbirine karıştırılmaz:
 * - meb-program: MEB öğretim programı mantığıyla eşleştirilmiş müfredat içeriği
 * - ozgun-pratik: Uygulama için yazılmış özgün YKS tarzı pratik (ÖSYM sorusu değildir)
 * - osym-resmi: Resmî ÖSYM sayfasına bağlantı (içerik kopyalanmaz)
 * - kullanici: Kullanıcının kendi eklediği kaynak
 */
export type SourceType = 'meb-program' | 'ozgun-pratik' | 'osym-resmi' | 'kullanici';

// ---------- Müfredat ----------

export interface Outcome {
  id: string;
  text: string;
}

export interface Subtopic {
  id: string;
  name: string;
  outcomes: Outcome[];
}

export interface Topic {
  id: string;
  name: string;
  /** Konunun ağırlıklı olarak işlendiği sınıf düzeyi (MEB programı). */
  grade: 9 | 10 | 11 | 12;
  /** Uygulamada öncelikli/derin anlatılan konu. */
  priority?: boolean;
  subtopics: Subtopic[];
}

export interface Unit {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: SubjectId;
  exam: Exam;
  name: string;
  icon: string;
  /** Resmî sınavdaki yaklaşık soru sayısı (bilgi amaçlı). */
  examQuestionCount?: number;
  note?: string;
  units: Unit[];
}

// ---------- Konu anlatımı ----------

export interface Concept {
  term: string;
  definition: string;
}

export interface Formula {
  /** Düz metin / Unicode ile yazılmış bağıntı. Örn: "logₐ(x·y) = logₐx + logₐy" */
  expr: string;
  meaning: string;
}

export interface WorkedExample {
  level: 'kolay' | 'orta' | 'zor';
  problem: string;
  steps: string[];
  answer: string;
}

export interface LessonSeed {
  topicId: string;
  /** Konuya giriş: doğal öğrenci diliyle. Paragraflar "\n\n" ile ayrılır. */
  intro: string;
  prerequisites: string[];
  concepts: Concept[];
  formulas: Formula[];
  /** "Neden böyle?" — mantığı. Paragraflar "\n\n" ile ayrılır. */
  logic: string;
  examples: WorkedExample[];
  /** ÖSYM tarzında düşünme: soru nasıl gizlenir, neyi ölçer. */
  osymThinking: string;
  commonMistakes: string[];
  tips: string[];
  /** 1 dakikalık özet maddeleri. */
  summary: string[];
}

// ---------- Soru bankası ----------

export interface QuestionTable {
  caption?: string;
  headers: string[];
  rows: string[][];
}

/** İçerik dosyalarında yazılan soru. exam/subject/unit yükleme sırasında müfredattan türetilir. */
export interface QuestionSeed {
  id: string;
  topic: string;
  subtopic?: string;
  outcome: string;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  /** Öncüllü sorular için I, II, III ifadeleri (başlarına numara yazmadan). */
  premises?: string[];
  table?: QuestionTable;
  /** Tam olarak 5 seçenek (A–E). Başlarına harf yazılmaz. */
  options: string[];
  /** 0–4 arası doğru seçenek indeksi. */
  correctAnswer: number;
  solution: string;
  hint: string;
  commonMistake: string;
  /** Öğretmen açıklaması: sorunun ölçtüğü beceri ve kalıcı ders. */
  teacherNote?: string;
}

export interface Question extends QuestionSeed {
  exam: Exam;
  subject: SubjectId;
  unit: string;
  sourceType: 'ozgun-pratik';
  createdAt: string;
}
