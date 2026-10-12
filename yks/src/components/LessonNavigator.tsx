import { useState } from 'react';
import type { LessonSeed } from '../domain/types';
import { lessonOutline } from '../utils/studyTools';
import '../styles/study-tools.css';

export function LessonNavigator({ lesson }: { lesson: LessonSeed }) {
  const [expanded, setExpanded] = useState(false);
  const { sections, minutes } = lessonOutline(lesson);
  const go = (id: string) => {
    const target = document.getElementById(`sec-${id}`) as HTMLDetailsElement | null;
    if (!target) return;
    target.open = true;
    target.querySelector('summary')?.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };
  return <aside className="lesson-navigator" aria-label="Konu anlatımı rehberi">
    <div className="row between"><div><b>Konuya bir bakış</b><p className="small muted">Yaklaşık {minutes} dk okuma · {lesson.examples.length} çözümlü örnek · Kendi hızında ilerle</p></div>
      <button className="btn small" type="button" onClick={() => {
        sections.forEach(s => { const el = document.getElementById(`sec-${s.id}`) as HTMLDetailsElement | null; if (el) el.open = !expanded; });
        setExpanded(!expanded);
      }}>{expanded ? 'Bölümleri daralt' : 'Tüm bölümleri aç'}</button>
    </div>
    <nav className="lesson-section-links" aria-label="Anlatım bölümleri">{sections.map(s => <button type="button" className="btn small" key={s.id} onClick={() => go(s.id)}>{s.label}</button>)}</nav>
    <p className="small">İlk kez çalışıyorsan mantık ve örneklerle başla. Tekrar yapıyorsan özet ve sık hatalara göz at, sonra konu sonu testini çöz.</p>
  </aside>;
}
