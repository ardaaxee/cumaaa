import type { AppState } from '../store/schema';
import { dueReviews } from '../utils/srs';
import { dayKey, diffDays } from '../utils/date';
import { formatNet } from '../utils/net';
import { needsMessage, petNeeds } from '../utils/petCare';
import { dashboard } from '../utils/stats';

/**
 * Sitede dolaşan Cuma'nın söyleyecekleri: bulunduğu sayfaya, saate ve
 * sevgilisinin gerçek çalışma verisine göre seçilir. Hiçbir sayı uydurulmaz.
 */
export function companionLines(path: string, state: AppState, now: Date = new Date()): string[] {
  const her = state.profile.name || 'Öğrenci';
  const today = dayKey(now);
  const d = dashboard(state, today);
  const hour = now.getHours();
  const section = path.split('/').filter(Boolean)[0] ?? '';
  const lines: string[] = [];
  const page: string[] = [];

  // Saat ve genel durum
  if (hour >= 0 && hour < 5) lines.push(`Gece çalışma hatırlatması: çalışma ve dinlenme süreni dengeli planlayabilirsin.`);
  else if (hour < 11) lines.push(`Günaydın ${her}. Günlük planını kontrol ederek çalışmaya başlayabilirsin.`);
  else if (hour >= 22) lines.push(`Akşam çalışma özeti: tamamladığın görevleri ve tekrarlarını kontrol edebilirsin.`);
  if (d.streak >= 3) lines.push(`Çalışma serin ${d.streak} güne ulaştı.`);
  if (d.todayQuestions >= state.profile.dailyQuestionGoal && state.profile.dailyQuestionGoal > 0) lines.push(`Günlük soru hedefin tamamlandı: ${d.todayQuestions} soru.`);
  else if (d.todayQuestions > 0) lines.push(`Bugün ${d.todayQuestions} soru çözüldü. Günlük hedefe ${Math.max(0, state.profile.dailyQuestionGoal - d.todayQuestions)} soru kaldı.`);
  if (state.profile.examDate) {
    const left = diffDays(today, state.profile.examDate);
    if (left >= 0) lines.push(`Hedef sınav tarihine ${left} gün kaldı. Çalışma planını gözden geçirebilirsin.`);
  }

  switch (section) {
    case '':
      page.push(`Hoş geldin ${her}. Günlük hedeflerin ve sıradaki çalışmaların ana sayfada.`);
      break;
    case 'dersler':
    case 'ders':
      page.push('Konunun kısa özetini inceleyip ardından ilgili soruları çözebilirsin.');
      break;
    case 'konu':
      page.push('Konu açıklaması için öğretmen bölümünü kullanabilirsin.', 'Konu sonu soruları öğrenmeni değerlendirmene yardımcı olur.');
      break;
    case 'testler':
      page.push('Test ayarlarından konu, zorluk ve soru sayısını seçebilirsin.');
      break;
    case 'sonuc': {
      const r = state.testResults[state.testResults.length - 1];
      if (r) {
        const ratio = r.questionIds.length ? r.correct / r.questionIds.length : 0;
        page.push(
          ratio >= 0.7
            ? `Test sonucun: ${formatNet(r.net)} net. Konu bazlı değerlendirmeyi inceleyebilirsin.`
            : `Yanlış ve boş soruların için konu tekrarı ve pekiştirme önerileri hazır.`,
        );
      }
      break;
    }
    case 'yanlislar':
      page.push('Yanlış sorularını inceleyip ilgili konu anlatımıyla pekiştirebilirsin.');
      break;
    case 'tekrar': {
      const due = dueReviews(state.reviews, today).length;
      page.push(due ? `Bugün ${due} konu için tekrar zamanı geldi.` : 'Bugün zamanı gelen tekrar bulunmuyor.');
      break;
    }
    case 'kartlar':
      page.push('Bilgi kartlarıyla kavramları ve formülleri tekrar edebilirsin.');
      break;
    case 'formuller':
      page.push('Formülleri kullanım koşulları ve örnekleriyle birlikte inceleyebilirsin.');
      break;
    case 'defterim':
      page.push('Notlarını başlıklar ve önemli kavramlarla düzenleyebilirsin.');
      break;
    case 'denemeler':
      page.push(d.lastMockNet != null ? `Son denemen: ${formatNet(d.lastMockNet)} net. Ders bazlı sonuçlarını karşılaştırabilirsin.` : 'Deneme sonuçlarını ekleyerek net değişimini takip edebilirsin.');
      break;
    case 'plan':
      page.push('Görevlerini süre ve konuya göre planlayabilirsin.');
      break;
    case 'gelisim':
    case 'karne':
      page.push('Çalışma geçmişin ve performans değişimin bu bölümde gösterilir.');
      break;
    case 'pandam':
      page.push(`${state.settings.pet.name} için bakım durumunu kontrol edebilirsin. Çalışma etkinlikleriyle bakım kaynakları kazanılır.`);
      break;
    case 'rozetler':
      page.push('Kazandığın rozetler ve tamamlanan çalışma hedefleri burada gösterilir.');
      break;
    default:
      break;
  }
  lines.push(`Yardım ve açıklama için öğretmen bölümünü açabilirsin.`, 'Düzenli aralarla kısa çalışma molaları planlayabilirsin.', 'Sıradaki görevini çalışma planından seçebilirsin.');
  // Panda aç/susuzsa Cuma önce bunu hatırlatır (panda sayfasında ve ana sayfada en başta).
  const need = needsMessage(state.settings.pet.name, petNeeds(state, now));
  if (need && (section === '' || section === 'pandam')) page.unshift(need);
  else if (need) lines.unshift(need);
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
