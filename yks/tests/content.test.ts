import { describe, expect, it } from 'vitest';
import type { LessonSeed, QuestionSeed } from '../src/domain/types';
import { SUBJECTS, getTopicRef } from '../src/data/curriculum';

/**
 * İçerik bütünlüğü testleri. CHECK_SUBJECTS=ayt-kimya,ayt-biyoloji ile
 * yalnız belirli derslerin tamlık kontrolü yapılabilir.
 */

const lessonMods = import.meta.glob<{ lessons: LessonSeed[] }>('../src/data/lessons/*.ts', { eager: true });
const questionMods = import.meta.glob<{ questions: QuestionSeed[] }>('../src/data/questions/*.ts', { eager: true });

const only = process.env.CHECK_SUBJECTS?.split(',').map((s) => s.trim()).filter(Boolean);
const inScope = (subjectId: string) => !only || only.includes(subjectId);

const lessons = Object.values(lessonMods).flatMap((m) => m.lessons);
const questions = Object.values(questionMods).flatMap((m) => m.questions);

const DIFFICULTIES = ['kolay', 'orta', 'zor', 'yeni-nesil'];
const TYPES = ['bilgi', 'islem', 'yorum', 'grafik', 'tablo', 'deney', 'onculu', 'problem', 'cok-adimli', 'yeni-nesil'];

describe('müfredat', () => {
  it('tüm kimlikler benzersiz', () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    const add = (id: string) => (seen.has(id) ? dupes.push(id) : seen.add(id));
    for (const s of SUBJECTS) {
      add(s.id);
      for (const u of s.units) {
        add(u.id);
        for (const t of u.topics) {
          add(t.id);
          for (const st of t.subtopics) {
            add(st.id);
            st.outcomes.forEach((o) => add(o.id));
          }
        }
      }
    }
    expect(dupes).toEqual([]);
  });

  it('her konu alt konu ve kazanım içerir', () => {
    const problems: string[] = [];
    for (const s of SUBJECTS.filter((x) => inScope(x.id))) {
      if (!s.units.length) problems.push(`${s.id}: ünite yok`);
      for (const u of s.units) {
        if (!u.topics.length) problems.push(`${u.id}: konu yok`);
        for (const t of u.topics) {
          if (!t.subtopics.length) problems.push(`${t.id}: alt konu yok`);
          for (const st of t.subtopics) if (!st.outcomes.length) problems.push(`${st.id}: kazanım yok`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('konu anlatımları', () => {
  it('her anlatım var olan bir konuya bağlı ve benzersiz', () => {
    const ids = lessons.map((l) => l.topicId);
    expect(ids.filter((id) => !getTopicRef(id))).toEqual([]);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it('kapsamdaki her konunun anlatımı var ve yeterince dolu', () => {
    const byTopic = new Map(lessons.map((l) => [l.topicId, l]));
    const problems: string[] = [];
    for (const s of SUBJECTS.filter((x) => inScope(x.id))) {
      for (const u of s.units) {
        for (const t of u.topics) {
          const l = byTopic.get(t.id);
          if (!l) {
            problems.push(`${t.id}: anlatım yok`);
            continue;
          }
          const p = !!t.priority;
          if (l.intro.length < (p ? 400 : 200)) problems.push(`${t.id}: giriş kısa`);
          if (l.prerequisites.length < (p ? 3 : 2)) problems.push(`${t.id}: ön bilgi az`);
          if (l.concepts.length < (p ? 5 : 3)) problems.push(`${t.id}: kavram az`);
          if (l.logic.length < (p ? 300 : 150)) problems.push(`${t.id}: mantık kısa`);
          if (l.examples.length < (p ? 3 : 2)) problems.push(`${t.id}: örnek az`);
          if (p && !['kolay', 'orta', 'zor'].every((lv) => l.examples.some((e) => e.level === lv))) problems.push(`${t.id}: kolay/orta/zor örnek eksik`);
          if (l.examples.some((e) => e.steps.length < 2)) problems.push(`${t.id}: örnek adımları az`);
          if (l.osymThinking.length < 120) problems.push(`${t.id}: ÖSYM tarzı düşünme kısa`);
          if (l.commonMistakes.length < (p ? 4 : 3)) problems.push(`${t.id}: sık hata az`);
          if (l.tips.length < 2) problems.push(`${t.id}: püf noktası az`);
          if (l.summary.length < (p ? 5 : 3)) problems.push(`${t.id}: özet az`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('soru bankası', () => {
  it('soru kimlikleri benzersiz ve konu önekli', () => {
    const ids = questions.map((q) => q.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
    expect(questions.filter((q) => !q.id.startsWith(q.topic + '-q')).map((q) => q.id)).toEqual([]);
  });

  it('her soru şemaya uyar', () => {
    const problems: string[] = [];
    for (const q of questions) {
      const ref = getTopicRef(q.topic);
      if (!ref) {
        problems.push(`${q.id}: konu yok (${q.topic})`);
        continue;
      }
      if (q.subtopic && !ref.topic.subtopics.some((s) => s.id === q.subtopic)) problems.push(`${q.id}: alt konu bu konuya ait değil`);
      if (!Array.isArray(q.options) || q.options.length !== 5) problems.push(`${q.id}: 5 seçenek değil`);
      if (q.options.some((o) => !o || !String(o).trim())) problems.push(`${q.id}: boş seçenek`);
      if (new Set(q.options.map((o) => String(o).trim())).size !== q.options.length) problems.push(`${q.id}: tekrarlanan seçenek`);
      if (q.options.some((o) => /^[A-E][).]\s/.test(String(o)))) problems.push(`${q.id}: seçenekte harf önekli`);
      if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 4) problems.push(`${q.id}: correctAnswer geçersiz`);
      if (!DIFFICULTIES.includes(q.difficulty)) problems.push(`${q.id}: zorluk geçersiz`);
      if (!TYPES.includes(q.type)) problems.push(`${q.id}: tip geçersiz`);
      if (q.question.trim().length < 20) problems.push(`${q.id}: soru metni kısa`);
      if (q.solution.trim().length < 40) problems.push(`${q.id}: çözüm kısa`);
      if (!q.hint.trim()) problems.push(`${q.id}: ipucu yok`);
      if (!q.commonMistake.trim()) problems.push(`${q.id}: sık hata yok`);
      if (!q.outcome.trim()) problems.push(`${q.id}: kazanım yok`);
      if (/ÖSYM tarafından|resmî ÖSYM sorusu|çıkmış soru/i.test(q.question)) problems.push(`${q.id}: ÖSYM iddiası`);
      if (q.table && q.table.rows.some((r) => r.length !== q.table!.headers.length)) problems.push(`${q.id}: tablo sütun sayısı uyuşmuyor`);
    }
    expect(problems).toEqual([]);
  });

  it('kapsamdaki konular yeterli soru içerir', () => {
    const counts = new Map<string, number>();
    questions.forEach((q) => counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1));
    const problems: string[] = [];
    for (const s of SUBJECTS.filter((x) => inScope(x.id))) {
      for (const u of s.units) {
        for (const t of u.topics) {
          const need = t.priority ? 12 : 6;
          const have = counts.get(t.id) ?? 0;
          if (have < need) problems.push(`${t.id}: ${have}/${need} soru`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it('doğru cevaplar tek bir şıkta yığılmaz', () => {
    const problems: string[] = [];
    for (const s of SUBJECTS.filter((x) => inScope(x.id))) {
      const qs = questions.filter((q) => getTopicRef(q.topic)?.subject.id === s.id);
      if (qs.length < 10) continue;
      const dist = [0, 0, 0, 0, 0];
      qs.forEach((q) => dist[q.correctAnswer]++);
      if (Math.max(...dist) / qs.length > 0.35) problems.push(`${s.id}: ${dist.join('/')}`);
    }
    expect(problems).toEqual([]);
  });
});
