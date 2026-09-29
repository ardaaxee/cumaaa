import { useEffect, useMemo, useState } from 'react';
import { SUBJECTS, getSubject, subjectLabel, subjectTopics } from '../data/curriculum';
import { subjectColorFor } from '../data/subjectColors';
import type { SubjectId } from '../domain/types';
import { PageHeader } from '../components/Layout';
import { Empty, ProgressBar, Spinner, Stat } from '../components/ui';
import { href, navigate, useRoute } from '../hooks/useRoute';
import { useIsDark } from '../hooks/useIsDark';
import { buildSession, deckStats, loadSubjectCards, type StudyCard } from '../services/cards';
import { gradeCard, type CardGrade } from '../store/actions';
import { update, useSelector } from '../store/store';
import { dayKey } from '../utils/date';

const LAST_KEY = 'iyikiYks.kartDers';

function initialSubject(q: string | null, hardest: string): SubjectId {
  if (q && getSubject(q)) return q as SubjectId;
  try {
    const last = localStorage.getItem(LAST_KEY);
    if (last && getSubject(last)) return last as SubjectId;
  } catch {
    /* tercih okunamasa da çalışır */
  }
  return (getSubject(hardest)?.id ?? SUBJECTS[0].id) as SubjectId;
}

export default function CardsPage() {
  const route = useRoute();
  const hardest = useSelector((s) => s.profile.hardestSubject);
  const states = useSelector((s) => s.cards);
  const isDark = useIsDark();
  const today = dayKey();
  const subjectId = initialSubject(route.query.get('ders'), hardest);
  const topicFilter = route.query.get('konu') ?? 'all';
  const [cards, setCards] = useState<StudyCard[] | null>(null);
  const [session, setSession] = useState<StudyCard[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState<Record<CardGrade, number>>({ bilmiyorum: 0, zor: 0, biliyorum: 0 });

  useEffect(() => {
    let alive = true;
    setCards(null);
    setSession(null);
    try {
      localStorage.setItem(LAST_KEY, subjectId);
    } catch {
      /* yok say */
    }
    loadSubjectCards(subjectId)
      .then((c) => alive && setCards(c))
      .catch(() => alive && setCards([]));
    return () => {
      alive = false;
    };
  }, [subjectId]);

  const deck = useMemo(() => (cards ?? []).filter((c) => topicFilter === 'all' || c.topicId === topicFilter), [cards, topicFilter]);
  const stats = deckStats(deck, states, today);
  const color = subjectColorFor(subjectId, isDark);

  const start = () => {
    setSession(buildSession(deck, states, today, 20));
    setIdx(0);
    setFlipped(false);
    setTally({ bilmiyorum: 0, zor: 0, biliyorum: 0 });
  };

  const grade = (g: CardGrade) => {
    if (!session) return;
    const card = session[idx];
    update((s) => gradeCard(s, card.id, g, today));
    setTally((t) => ({ ...t, [g]: t[g] + 1 }));
    // "Bilmiyorum" denen kart oturumun sonuna bir kez daha eklenir.
    if (g === 'bilmiyorum' && session.filter((c) => c.id === card.id).length < 2) setSession([...session, card]);
    setFlipped(false);
    setIdx((i) => i + 1);
  };

  useEffect(() => {
    if (!session || idx >= session.length) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'SELECT') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && e.key === '1') grade('bilmiyorum');
      else if (flipped && e.key === '2') grade('zor');
      else if (flipped && e.key === '3') grade('biliyorum');
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const setQuery = (patch: Record<string, string>) => {
    const q: Record<string, string> = { ders: subjectId, ...(topicFilter !== 'all' ? { konu: topicFilter } : {}), ...patch };
    if (q.konu === 'all') delete q.konu;
    navigate(href('/kartlar', q), { replace: true });
  };

  const inSession = session && idx < session.length;
  const finished = session && idx >= session.length;
  const card = inSession ? session[idx] : null;

  return (
    <>
      <PageHeader title="Bilgi Kartları" sub="Kavram ve formülleri aralıklı tekrarla ezberle" />

      {!session && (
        <section className="card" aria-label="Deste seçimi">
          <div className="form-grid two">
            <label className="field">
              <span>Ders</span>
              <select className="select" value={subjectId} onChange={(e) => setQuery({ ders: e.target.value, konu: 'all' })}>
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {subjectLabel(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Konu</span>
              <select className="select" value={topicFilter} onChange={(e) => setQuery({ konu: e.target.value })}>
                <option value="all">Tüm konular</option>
                {subjectTopics(subjectId).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!cards ? (
            <Spinner />
          ) : deck.length === 0 ? (
            <Empty title="Bu seçimde kart yok.">Konu anlatımında kavram veya formül bulunan konular karta dönüşür.</Empty>
          ) : (
            <>
              <div className="grid grid-4 mt-12">
                <Stat tint="lilac" label="Toplam kart" value={stats.total} />
                <Stat tint="peach" label="Tekrar zamanı" value={stats.due} />
                <Stat tint="sky" label="Yeni" value={stats.fresh} />
                <Stat tint="mint" label="Öğrenildi" value={stats.learned} />
              </div>
              <ProgressBar value={stats.total ? (stats.learned / stats.total) * 100 : 0} label="Öğrenilen kart oranı" />
              <button type="button" className="btn primary block mt-12" onClick={start} disabled={stats.due + stats.fresh === 0}>
                {stats.due + stats.fresh === 0 ? 'Bugünlük kart kalmadı ♡' : `Çalışmaya başla (${Math.min(20, stats.due + stats.fresh)} kart)`}
              </button>
              <p className="tiny muted mt-8">
                “Biliyorum” dediğin kart daha seyrek, “Bilmiyorum” dediğin kart yarın tekrar gelir (1 · 2 · 4 · 8 · 16 gün).
              </p>
            </>
          )}
        </section>
      )}

      {card && session && (
        <section className="section" aria-label="Kart çalışması">
          <div className="row between mb-8">
            <span className="small muted">
              {idx + 1} / {session.length} · {card.topicName}
            </span>
            <button type="button" className="btn small ghost" onClick={() => setSession(null)}>
              Bitir
            </button>
          </div>
          <ProgressBar value={(idx / session.length) * 100} label="Oturum ilerlemesi" />
          <button
            type="button"
            className={`flashcard${flipped ? ' flipped' : ''}`}
            style={{ ['--fc' as string]: color.fg, ['--fc-soft' as string]: color.soft }}
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? 'Kartın ön yüzüne dön' : 'Kartı çevir'}
          >
            <span className="fc-inner">
              <span className="fc-face fc-front">
                <span className="fc-kind">{card.kind === 'formul' ? '✦ Formül' : '✎ Kavram'}</span>
                <span className={`fc-text${card.kind === 'formul' ? ' formula' : ''}`}>{card.front}</span>
                <span className="fc-hint">Dokun, çevir</span>
              </span>
              <span className="fc-face fc-back">
                <span className="fc-kind">{card.kind === 'formul' ? 'Anlamı' : 'Tanımı'}</span>
                <span className="fc-text small">{card.back}</span>
              </span>
            </span>
          </button>
          {flipped ? (
            <div className="fc-grades">
              <button type="button" className="btn fc-no" onClick={() => grade('bilmiyorum')}>
                Bilmiyorum
              </button>
              <button type="button" className="btn fc-hard" onClick={() => grade('zor')}>
                Zorlandım
              </button>
              <button type="button" className="btn fc-yes" onClick={() => grade('biliyorum')}>
                Biliyorum
              </button>
            </div>
          ) : (
            <button type="button" className="btn primary block mt-12" onClick={() => setFlipped(true)}>
              Cevabı göster
            </button>
          )}
        </section>
      )}

      {finished && (
        <section className="card section center" aria-label="Oturum özeti">
          <div style={{ fontSize: '2.4rem' }} aria-hidden="true">
            🎉
          </div>
          <h2>Oturum bitti!</h2>
          <p className="muted">
            {tally.biliyorum} biliyorum · {tally.zor} zorlandım · {tally.bilmiyorum} bilmiyorum
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn primary" onClick={start}>
              Yeni oturum
            </button>
            <button type="button" className="btn" onClick={() => setSession(null)}>
              Desteye dön
            </button>
          </div>
        </section>
      )}
    </>
  );
}
