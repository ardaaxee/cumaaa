import type { Question } from '../domain/types';
import { getTopicRef } from '../data/curriculum';
import { OPTION_LETTERS } from '../utils/ids';
import { SourceBadge, toast } from './ui';
import { toggleFavorite } from '../store/actions';
import { update, useSelector } from '../store/store';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export const DIFFICULTY_LABEL: Record<string, string> = {
  kolay: 'Kolay',
  orta: 'Orta',
  zor: 'Zor',
  'yeni-nesil': 'Yeni Nesil',
};

export const TYPE_LABEL: Record<string, string> = {
  bilgi: 'Bilgi',
  islem: 'İşlem',
  yorum: 'Yorum',
  grafik: 'Grafik',
  tablo: 'Tablo',
  deney: 'Deney',
  onculu: 'Öncüllü',
  problem: 'Problem',
  'cok-adimli': 'Çok adımlı',
  'yeni-nesil': 'Yeni nesil',
};

export function QuestionMeta({ q, topicName }: { q: Question; topicName?: string }) {
  const ref = getTopicRef(q.topic);
  const subtopic = q.subtopic ? ref?.topic.subtopics.find((s) => s.id === q.subtopic) : undefined;
  return (
    <div className="question-meta">
      <div className="row gap-4">
        <SourceBadge type="ozgun-pratik" />
        <span className="badge">{q.exam}</span>
        {topicName && <span className="badge">{topicName}</span>}
        <span className="badge outline">{DIFFICULTY_LABEL[q.difficulty]}</span>
        <span className="badge outline">{TYPE_LABEL[q.type]}</span>
        <FavoriteButton id={q.id} />
      </div>
      {subtopic && <div className="question-subtopic">{subtopic.name}</div>}
    </div>
  );
}

/** Soruyu "Kaydettiğim sorular"a ekler / çıkarır. */
export function FavoriteButton({ id }: { id: string }) {
  const saved = useSelector((s) => !!s.favorites[id]);
  return (
    <button
      type="button"
      className={`fav-btn${saved ? ' on' : ''}`}
      aria-pressed={saved}
      aria-label={saved ? 'Kaydedilenlerden çıkar' : 'Soruyu kaydet'}
      title={saved ? 'Kaydedilenlerden çıkar' : 'Soruyu kaydet'}
      onClick={(e) => {
        e.stopPropagation();
        update((s) => toggleFavorite(s, id));
        if (!saved) toast('Soru kaydedildi ⭐');
      }}
    >
      {saved ? '★' : '☆'} {saved ? 'Kaydedildi' : 'Kaydet'}
    </button>
  );
}

export function QuestionBody({ q }: { q: Question }) {
  return (
    <div className="question-body">
      <div className="question-text">{q.question}</div>
      {q.premises && q.premises.length > 0 && (
        <ol className="premises" aria-label="Öncüller">
          {q.premises.map((p, i) => (
            <li key={i}>
              <b>{ROMAN[i] ?? i + 1}.</b>
              <span>{p}</span>
            </li>
          ))}
        </ol>
      )}
      {q.table && (
        <div className="q-table-wrap">
          <table className="q-table">
            {q.table.caption && <caption>{q.table.caption}</caption>}
            <thead>
              <tr>
                {q.table.headers.map((h, i) => (
                  <th key={i} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function Options({
  q,
  selected,
  onSelect,
  reveal,
  disabled,
}: {
  q: Question;
  selected: number | null | undefined;
  onSelect?: (i: number) => void;
  /** Doğru/yanlış renklendirmesi gösterilsin mi? */
  reveal?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="options" role="group" aria-label="Seçenekler">
      {q.options.map((opt, i) => {
        const isSel = selected === i;
        let cls = 'option';
        if (reveal && i === q.correctAnswer) cls += ' correct';
        else if (reveal && isSel) cls += ' wrong';
        const state = reveal ? (i === q.correctAnswer ? ' (doğru cevap)' : isSel ? ' (senin cevabın, yanlış)' : '') : '';
        return (
          <button
            key={i}
            type="button"
            className={cls}
            aria-pressed={isSel}
            disabled={disabled}
            onClick={() => onSelect?.(i)}
            aria-label={`${OPTION_LETTERS[i]} seçeneği: ${opt}${state}`}
          >
            <span className="letter" aria-hidden="true">
              {OPTION_LETTERS[i]}
            </span>
            <span className="opt-text">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SolutionBlock({ q }: { q: Question }) {
  const steps = q.solution.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  return (
    <div className="stack solution-block">
      <div className="solution-main">
        <div className="eyebrow">Çözüm yolu</div>
        {steps.length > 1 ? (
          <ol className="solution-steps">
            {steps.map((step, i) => <li key={i} className="pre-line">{step.replace(/^\d+[.)]\s*/, '')}</li>)}
          </ol>
        ) : (
          <div className="pre-line">{q.solution}</div>
        )}
      </div>
      <div className="solution-learning-grid">
        <div className="callout solution-hint">
          <b>Bu soruda ana fikir: </b>
          {q.hint}
        </div>
        <div className="callout warn">
          <b>Sık yapılan hata: </b>
          {q.commonMistake}
        </div>
      </div>
      {q.teacherNote && (
        <div className="callout">
          <b>Öğretmen notu: </b>
          {q.teacherNote}
        </div>
      )}
      <div className="solution-outcome">
        <span>Ölçülen kazanım</span>
        <b>{q.outcome}</b>
      </div>
    </div>
  );
}
