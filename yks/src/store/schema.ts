import type { Difficulty, Exam, QuestionType, SubjectId } from '../domain/types';
import type { DayKey } from '../utils/date';

/**
 * Kalıcı uygulama durumu. Şema değiştiğinde SCHEMA_VERSION artırılır ve
 * store/migrations.ts içine bir geçiş adımı eklenir.
 */
export const SCHEMA_VERSION = 3;

export type ThemePref = 'system' | 'light' | 'dark';
export type TopicStatus = 'baslanmadi' | 'calisiliyor' | 'tamamlandi';

export interface Profile {
  name: string;
  grade: string;
  field: string;
  dailyQuestionGoal: number;
  dailyStudyMinutes: number;
  tytTarget: number | null;
  aytTarget: number | null;
  hardestSubject: SubjectId | '';
  examDate: DayKey | '';
  onboarded: boolean;
}

export interface Settings {
  theme: ThemePref;
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
  teacherName: string;
  /** Öğretmen fotoğrafının dikey odak noktası (object-position %). */
  teacherPhotoFocusY: number;
  /** Yapay zekâ sunucusunun adresi (ör. https://iyiki-yks.onrender.com). Boşsa aynı alan adındaki /api denenir. */
  aiServerUrl: string;
  /** Bulut eşitleme (Firebase Firestore). Boş alanlar = kapalı. */
  cloud: CloudSettings;
  /** Panda arkadaşın adı, taktığı aksesuarlar ve yemek/su durumu. */
  pet: { name: string; items: string[]; care?: PetCare };
  /** Asistan karakterinin sayfalarda dolaşması. */
  companion: boolean;
}

/** Pandanın tokluk/su seviyesi (0–100, verilen zamandaki değer) ve harcanan bambu/su. */
export interface PetCare {
  food: number;
  foodAt: string;
  water: number;
  waterAt: string;
  spentBamboo: number;
  spentWater: number;
}

export interface TopicProgress {
  status: TopicStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface QuestionAttempt {
  id: string;
  questionId: string;
  topicId: string;
  subjectId: SubjectId;
  difficulty: Difficulty;
  /** Seçilen şık (0–4) ya da boş için null. */
  answer: number | null;
  correct: boolean;
  timeMs: number;
  at: string; // ISO zaman damgası
  day: DayKey; // yerel gün
  sessionId: string;
}

export type TestMode = 'ogrenme' | 'sinav';

export interface TestConfig {
  exam: Exam | 'all';
  subjectId: SubjectId | 'all';
  topicId: string | 'all';
  subtopicId: string | 'all';
  difficulty: Difficulty | 'all';
  type: QuestionType | 'all';
  count: number;
  mode: TestMode;
  /** Testin nereden oluşturulduğu (bilgi amaçlı). */
  origin: 'filtre' | 'yanlislar' | 'konu-mini' | 'konu-normal' | 'tekrar' | 'tek-soru' | 'ogretmen' | 'plan' | 'deneme' | 'seviye' | 'adaptif';
  title?: string;
  /** Sınav modunda toplam süre (dk). Verilmezse soru başına 90 sn. */
  durationMin?: number;
}

export interface ActiveTest {
  id: string;
  config: TestConfig;
  questionIds: string[];
  answers: Record<string, number | null>;
  marked: Record<string, boolean>;
  /** Öğrenme modunda cevabı kilitlenmiş (geri bildirimi gösterilmiş) sorular. */
  revealed: Record<string, boolean>;
  timeSpent: Record<string, number>;
  current: number;
  startedAt: string;
  /** Sınav modunda süre sınırı (ms). */
  timeLimitMs: number | null;
  /** Sayfa arka plandayken geçen süreyi doğru saymak için: toplam aktif süre. */
  elapsedMs: number;
}

export interface TestResult {
  id: string;
  config: TestConfig;
  questionIds: string[];
  answers: Record<string, number | null>;
  marked: Record<string, boolean>;
  timeSpent: Record<string, number>;
  startedAt: string;
  finishedAt: string;
  day: DayKey;
  durationMs: number;
  correct: number;
  wrong: number;
  blank: number;
  net: number;
}

export interface WrongEntry {
  questionId: string;
  topicId: string;
  subjectId: SubjectId;
  lastAnswer: number | null;
  wrongCount: number;
  firstAt: string;
  lastAt: string;
  /** Yanlıştan sonra doğru çözme sayısı (arka arkaya). */
  correctStreak: number;
  learned: boolean;
  learnedAt?: string;
}

/** Bilgi kartı (Leitner kutusu) ilerlemesi. Kart id'si: `<topicId>:k<n>` (kavram) veya `<topicId>:f<n>` (formül). */
export interface CardState {
  /** 1..5 — kutu arttıkça tekrar aralığı uzar. */
  box: number;
  dueDay: DayKey;
  seen: number;
  lastDay: DayKey;
}

export interface CloudSettings {
  projectId: string;
  apiKey: string;
  /** Cihazları eşleştiren gizli kod (en az 20 karakter). */
  syncCode: string;
  /** Sevgilinle paylaşılan özet sayfasının kodu. */
  shareCode: string;
}

export interface ReviewItem {
  topicId: string;
  /** 0..4 → 1, 3, 7, 14, 30 gün aralıkları. 5 = tamamlandı. */
  stage: number;
  dueDay: DayKey;
  lastReviewedDay?: DayKey;
  history: DayKey[];
}

export type TaskType = 'konu' | 'test' | 'yanlis' | 'deneme' | 'video' | 'tekrar' | 'ozel';

export interface PlanTask {
  id: string;
  date: DayKey;
  time?: string;
  type: TaskType;
  title: string;
  subjectId?: SubjectId;
  topicId?: string;
  targetQuestions?: number;
  estMinutes?: number;
  done: boolean;
  doneAt?: string;
  carriedFrom?: DayKey;
  createdAt: string;
}

export interface MockSection {
  key: string;
  correct: number;
  wrong: number;
  blank: number;
}

export interface MockExam {
  id: string;
  exam: Exam;
  name: string;
  date: DayKey;
  sections: MockSection[];
  note?: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  day: DayKey;
  minutes: number;
  source: 'pomodoro' | 'manuel' | 'test' | 'calisma';
  subjectId?: SubjectId;
  at: string;
}

export interface VideoResource {
  id: string;
  title: string;
  channel: string;
  url: string;
  subjectId?: SubjectId;
  topicId?: string;
  watched: boolean;
  createdAt: string;
}

export interface PomodoroState {
  phase: 'odak' | 'mola' | 'uzun-mola';
  running: boolean;
  /** Çalışıyorsa bitiş zamanı (epoch ms). */
  endsAt: number | null;
  /** Duraklatılmışsa kalan süre (ms). */
  remainingMs: number;
  completedFocusCount: number;
  subjectId?: SubjectId;
  /** İsteğe bağlı: odak oturumunun bağlı olduğu plan görevi. */
  taskId?: string;
  /** Odak tamamlanınca bağlı görev otomatik tamamlanır. */
  completeTaskOnFinish?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'teacher';
  text: string;
  /** Cevabın kaynağı: gerçek AI modeli mi, uygulama içeriği mi? */
  source?: 'ai' | 'icerik' | 'sistem';
  at: string;
}

export interface NotebookPageMeta {
  id: string;
  title: string;
  subjectId?: SubjectId;
  /** Kağıt deseni; yoksa kareli. */
  paper?: NotebookPaper;
  createdAt: string;
  updatedAt: string;
}

export type NotebookPaper = 'kareli' | 'cizgili' | 'noktali' | 'duz';

export interface LegacyTotals {
  answered: number;
  correct: number;
  minutes: number;
}

export interface AppState {
  schemaVersion: number;
  profile: Profile;
  settings: Settings;
  topicProgress: Record<string, TopicProgress>;
  attempts: QuestionAttempt[];
  testResults: TestResult[];
  activeTest: ActiveTest | null;
  wrongs: Record<string, WrongEntry>;
  reviews: Record<string, ReviewItem>;
  tasks: PlanTask[];
  mocks: MockExam[];
  studyLog: StudySession[];
  videos: VideoResource[];
  pomodoro: PomodoroState;
  chat: ChatMessage[];
  /** Dijital defter sayfalarının bilgisi (çizim verisi IndexedDB'de saklanır). */
  notebookPages: NotebookPageMeta[];
  /** Bilgi kartlarının tekrar durumu. */
  cards: Record<string, CardState>;
  /** Silinen kayıtların izi (id → ISO zaman). Bulut eşitlemesinde silinenlerin geri gelmesini önler. */
  deleted: Record<string, string>;
  /** Kaydedilen (favori) sorular: soru id → kaydedilme zamanı. */
  favorites: Record<string, string>;
  /** Eski sürümden gelen, güne atanamayan toplamlar (yalnız toplam istatistiğe eklenir). */
  legacy: LegacyTotals | null;
}

export function defaultState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      name: '',
      grade: '12. sınıf',
      field: 'Sayısal',
      dailyQuestionGoal: 60,
      dailyStudyMinutes: 180,
      tytTarget: null,
      aytTarget: null,
      hardestSubject: '',
      examDate: '',
      onboarded: false,
    },
    settings: {
      theme: 'system',
      focusMinutes: 25,
      breakMinutes: 5,
      longBreakMinutes: 15,
      cyclesBeforeLongBreak: 4,
      teacherName: 'Cuma',
      teacherPhotoFocusY: 35,
      aiServerUrl: '',
      cloud: { projectId: '', apiKey: '', syncCode: '', shareCode: '' },
      pet: { name: 'Bambu', items: [] },
      companion: true,
    },
    topicProgress: {},
    attempts: [],
    testResults: [],
    activeTest: null,
    wrongs: {},
    reviews: {},
    tasks: [],
    mocks: [],
    studyLog: [],
    videos: [],
    pomodoro: {
      phase: 'odak',
      running: false,
      endsAt: null,
      remainingMs: 25 * 60_000,
      completedFocusCount: 0,
    },
    chat: [],
    notebookPages: [],
    cards: {},
    deleted: {},
    favorites: {},
    legacy: null,
  };
}
