import { useMemo } from 'react';
import { PageHeader } from '../components/Layout';
import { ProgressBar } from '../components/ui';
import { useAppState } from '../store/store';
import { computeBadges } from '../utils/badges';

export default function BadgesPage() {
  const state = useAppState();
  const badges = useMemo(() => computeBadges(state), [state]);
  const earned = badges.filter((b) => b.earned);
  const next = badges.filter((b) => !b.earned).sort((a, b) => b.pct - a.pct);

  return (
    <>
      <PageHeader title="Rozetlerim" sub={`${earned.length} / ${badges.length} rozet kazanıldı`} />
      <section className="card hero" aria-label="Özet">
        <div className="row nowrap" style={{ gap: 14 }}>
          <div style={{ fontSize: '2.6rem' }} aria-hidden="true">
            {earned.length ? earned[earned.length - 1].icon : '🥚'}
          </div>
          <div className="grow">
            <b>{earned.length ? `Harika gidiyorsun! ${earned.length} rozetin var.` : 'İlk rozetin çok yakın!'}</b>
            <div className="small muted">Rozetler yalnızca gerçek çalışmandan hesaplanır: soru, test, konu, deneme, kart ve süre.</div>
            <ProgressBar value={(earned.length / badges.length) * 100} label="Rozet ilerlemesi" />
          </div>
        </div>
      </section>

      {next.length > 0 && (
        <section className="section" aria-labelledby="next-h">
          <h2 id="next-h" className="mb-8">
            Sıradaki rozetler
          </h2>
          <div className="badge-grid">
            {next.map((b) => (
              <article key={b.id} className="badge-card locked">
                <div className="badge-icon" aria-hidden="true">
                  {b.icon}
                </div>
                <b>{b.title}</b>
                <div className="tiny muted">{b.desc}</div>
                <ProgressBar value={b.pct} label={`${b.title} ilerlemesi`} />
                <div className="tiny muted">
                  {Math.min(b.current, b.target)} / {b.target}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {earned.length > 0 && (
        <section className="section" aria-labelledby="earned-h">
          <h2 id="earned-h" className="mb-8">
            Kazandıkların ♡
          </h2>
          <div className="badge-grid">
            {earned.map((b) => (
              <article key={b.id} className="badge-card">
                <div className="badge-icon" aria-hidden="true">
                  {b.icon}
                </div>
                <b>{b.title}</b>
                <div className="tiny muted">{b.desc}</div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
