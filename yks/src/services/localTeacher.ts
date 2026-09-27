import type { LessonSeed } from '../domain/types';
import type { TeacherAction } from './ai';

/**
 * AI sunucusu yapılandırılmadığında kullanılan "yerel konu rehberi".
 * Sahte bir AI yanıtı üretmez; uygulamadaki gerçek konu anlatımı verisinden
 * (varsa) derlenmiş, dürüst bir yanıt döner.
 */
export function localTeacherReply(action: TeacherAction, lesson: LessonSeed | null, topicName?: string): string {
  if (!lesson) {
    return topicName
      ? `“${topicName}” için henüz bu cihazda kayıtlı bir konu anlatımı bulamadım. Dersler bölümünden konuyu açarsan tam anlatımı görebilirsin.\n\n(Yerel konu rehberi modu: gerçek bir AI bağlantısı olmadığı için bu yanıt uygulama içindeki hazır içerikten derlenir.)`
      : 'Bir ders veya konu seçersen o konunun kayıtlı anlatımından bir özet çıkarabilirim. Sağdaki hızlı butonlar için önce Dersler’den bir konu aç.\n\n(Yerel konu rehberi modu: gerçek bir AI bağlantısı yok.)';
  }
  const parts: string[] = [`**${topicName}**`, lesson.intro.split('\n\n')[0]];
  if (action === 'basit' || action === 'anlat') {
    parts.push(`Mantığı: ${lesson.logic.split('\n\n')[0]}`);
  }
  if (action === 'ornek' && lesson.examples[0]) {
    const ex = lesson.examples[0];
    parts.push(`Örnek: ${ex.problem}`, ...ex.steps.map((s, i) => `${i + 1}. ${s}`), `Cevap: ${ex.answer}`);
  }
  if (action === 'ipucu' && lesson.tips[0]) parts.push(`Püf noktası: ${lesson.tips[0]}`);
  if (action === 'quiz') parts.push('Mini quiz için Dersler > bu konu > “Mini test” butonunu kullanabilirsin; gerçek AI olmadan soru üretemem.');
  if (action === 'yanlislar' || action === 'hatam') {
    parts.push(`Sık yapılan hata: ${lesson.commonMistakes[0] ?? 'Kayıtlı bir hata notu yok.'}`);
  }
  if (action === 'detayli') parts.push(...lesson.concepts.slice(0, 3).map((c) => `${c.term}: ${c.definition}`));
  parts.push(`1 dakikalık özet: ${lesson.summary.join(' ')}`);
  parts.push('\n(Yerel konu rehberi modu: bu yanıt uygulama içindeki hazır konu anlatımından derlenmiştir, üretken bir AI kullanılmamıştır.)');
  return parts.join('\n\n');
}
