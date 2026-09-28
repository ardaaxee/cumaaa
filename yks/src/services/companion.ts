import type { AppState } from '../store/schema';
import { dueReviews } from '../utils/srs';
import { dayKey, diffDays } from '../utils/date';
import { formatNet } from '../utils/net';
import { dashboard } from '../utils/stats';

/**
 * Sitede dolaşan Cuma'nın söyleyecekleri: bulunduğu sayfaya, saate ve
 * sevgilisinin gerçek çalışma verisine göre seçilir. Hiçbir sayı uydurulmaz.
 */
export function companionLines(path: string, state: AppState, now: Date = new Date()): string[] {
  const her = state.profile.name || 'canım';
  const today = dayKey(now);
  const d = dashboard(state, today);
  const hour = now.getHours();
  const section = path.split('/').filter(Boolean)[0] ?? '';
  const lines: string[] = [];
  const page: string[] = [];

  // Saat ve genel durum
  if (hour >= 0 && hour < 5) lines.push(`${her}, saat çok geç oldu… Biraz uyu, yarın daha verimli olursun ♡`);
  else if (hour < 11) lines.push(`Günaydın ${her} ☀ Kahvaltını yaptın mı? Sonra 10 soruyla güne başlayalım.`);
  else if (hour >= 22) lines.push(`İyi akşamlar ${her} ♡ Bugünü kısa bir tekrarla kapatalım mı?`);
  if (d.streak >= 3) lines.push(`${d.streak} gündür aralıksız çalışıyorsun, seninle çok gurur duyuyorum ♡`);
  if (d.todayQuestions >= state.profile.dailyQuestionGoal && state.profile.dailyQuestionGoal > 0) lines.push(`Bugünkü hedefini tutturdun! ${d.todayQuestions} soru 🎉 Şimdi biraz dinlenmeyi hak ettin.`);
  else if (d.todayQuestions > 0) lines.push(`Bugün ${d.todayQuestions} soru çözdün, harikasın. Hedefe ${Math.max(0, state.profile.dailyQuestionGoal - d.todayQuestions)} soru kaldı ♡`);
  if (state.profile.examDate) {
    const left = diffDays(today, state.profile.examDate);
    if (left >= 0) lines.push(`Sınava ${left} gün var. Birlikte hallederiz, merak etme ♡`);
  }

  switch (section) {
    case '':
      page.push(`Hoş geldin ${her} ♡ Bugün ne çalışmak istersin? Ben hep buradayım.`);
      break;
    case 'dersler':
    case 'ders':
      page.push('Hangi konuyu açarsan aç, önce 1 dakikalık özete bak; sonra birlikte soru çözeriz.');
      break;
    case 'konu':
      page.push('Bu konuyu birlikte hallederiz. Anlamadığın yer olursa bana sor ♡', 'Konunun sonundaki soruları çözmeyi unutma, ben de bakıyorum 👀');
      break;
    case 'testler':
      page.push('Test zamanı! Sakin ol, önce kolay soruları topla ♡');
      break;
    case 'sonuc': {
      const r = state.testResults[state.testResults.length - 1];
      if (r) {
        const ratio = r.questionIds.length ? r.correct / r.questionIds.length : 0;
        page.push(
          ratio >= 0.7
            ? `${formatNet(r.net)} net! Çok iyisin ${her} 🎉`
            : `Yanlışlar seni üzmesin; her yanlış, sınavda yapmayacağın bir hata demek. Birlikte bakalım mı?`,
        );
      }
      break;
    }
    case 'yanlislar':
      page.push('Yanlışlarına geri dönmen çok akıllıca. Her biri bir ders ♡');
      break;
    case 'tekrar': {
      const due = dueReviews(state.reviews, today).length;
      page.push(due ? `Bugün ${due} konunun tekrar günü. Kısa kısa geçelim ♡` : 'Bugün tekrar yok, süpersin!');
      break;
    }
    case 'kartlar':
      page.push('Kartları çevirmeye devam, ezber kendiliğinden gelecek ✨');
      break;
    case 'formuller':
      page.push('Formülü ezberlemek yerine anlamına bak, sınavda o kurtarır ♡');
      break;
    case 'defterim':
      page.push('Yazın çok tatlı 😊 Önemli yerleri renkli kalemle işaretle.');
      break;
    case 'denemeler':
      page.push(d.lastMockNet != null ? `Son denemen ${formatNet(d.lastMockNet)} net. Bir sonrakinde daha iyisi gelecek ♡` : 'İlk denemeni birlikte çözelim mi? Ben süreni tutarım ⏱');
      break;
    case 'plan':
      page.push('Plan yapman çok güzel. Küçük görevler, büyük başarı ♡');
      break;
    case 'gelisim':
    case 'karne':
      page.push('Gelişimine bakınca gözlerim doluyor, çok emek veriyorsun ♡');
      break;
    case 'pandam':
      page.push('Bambu seni çok seviyor, ben de ♡');
      break;
    case 'rozetler':
      page.push('Her rozet seninle gurur duyduğum bir an ♡');
      break;
    default:
      break;
  }
  lines.push(`Bir şeye takılırsan bana dokun, beraber bakarız ${her} ♡`, 'Su içmeyi unutma 💧', 'Seni seviyorum, çalışmaya devam ♡');
  // Sayfaya özel cümleler başta: Cuma bir sayfaya girince önce onu söyler.
  return [...page, ...lines];
}

/** Sayfaya girildiğinde söylenecek ilk cümle (sayfaya özel olan varsa o). */
export function firstLine(path: string, state: AppState, now: Date = new Date()): string {
  return companionLines(path, state, now)[0];
}

export function pickLine(lines: string[], seed: number): string {
  return lines[Math.abs(seed) % lines.length];
}
