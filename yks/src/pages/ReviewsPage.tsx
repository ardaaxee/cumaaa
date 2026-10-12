import { getTopicRef, subjectLabel } from '../data/curriculum';
import { PageHeader } from '../components/Layout';
import { QuickReview } from '../components/QuickReview';
import { recentTopicPerformance } from '../utils/analysis';
import { Empty, toast } from '../components/ui';
import { launchTest, makeConfig } from '../services/testLauncher';
import { markReviewDone } from '../store/actions';
import { update, useSelector } from '../store/store';
import { dayKey, formatDay } from '../utils/date';
import { REVIEW_DONE_STAGE, dueReviews, stageLabel, upcomingReviews } from '../utils/srs';

export default function ReviewsPage({ params = [] }: { params?: string[] }) {
  if (params[0]) return <QuickReview topicId={params[0]} />;
  return <ReviewList />;
}

function ReviewList() {
  const reviews = useSelector((s) => s.reviews);
  const attempts = useSelector((s) => s.attempts);
  const wrongs = useSelector((s) => s.wrongs);
  const today = dayKey();
  const due = dueReviews(reviews, today);
  const upcoming = upcomingReviews(reviews, today, 30);
  const mastered = Object.values(reviews).filter((r) => r.stage >= REVIEW_DONE_STAGE);

  const label = (id: string) => {
    const ref = getTopicRef(id);
    return ref ? { name: ref.topic.name, sub: subjectLabel(ref.subject) } : { name: id, sub: '' };
  };

  return (
    <>
      <PageHeader title="Tekrarlar" sub="Aralıklı tekrar: 1 · 3 · 7 · 14 · 30 gün" />
      <div className="notice">
        Bir konuyu tamamladığında tekrarları otomatik planlanır. O konuda yanlış yaparsan tekrar sıklığı artar (tekrar yarına çekilir).
      </div>

      <section className="card section" aria-labelledby="due-h">
        <div className="card-head">
          <h2 id="due-h">Bugün tekrar etmen gerekenler</h2>
          <span className="badge warn">{due.length}</span>
        </div>
        {due.length === 0 ? (
          <Empty title="Bugün için tekrar yok." />
        ) : (
          <ul className="list">
            {due.map((r) => {
              const l = label(r.topicId);
              return (
                <li key={r.topicId} className="list-item" style={{ alignItems: 'flex-start' }}>
                  <div className="grow">
                    <a href={`#/konu/${r.topicId}`}>
                      <b>{l.name}</b>
                    </a>
                    <div className="tiny muted">
                      {l.sub} · {stageLabel(r.stage)} · {r.dueDay < today ? `gecikti (${formatDay(r.dueDay)})` : 'bugün'}
                    </div>
                    <div className="review-facts tiny">
                      {(() => {
                        const perf = recentTopicPerformance(attempts, r.topicId, 3);
                        const open = Object.values(wrongs).filter((w) => w.topicId === r.topicId && !w.learned).length;
                        return (
                          <>
                            <span>Son başarı: {perf.accuracy != null ? `%${perf.accuracy}` : '—'}</span>
                            <span>Açık yanlış: {open}</span>
                            <span>Tahmini süre: ~5 dk</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="row">
                    <a className="btn small primary" href={`#/tekrar/${r.topicId}`}>
                      5 dk tekrar
                    </a>
                    <button
                      type="button"
                      className="btn small"
                      onClick={async () => {
                        const err = await launchTest(makeConfig({ topicId: r.topicId, count: 5, origin: 'tekrar', title: `${l.name} tekrar testi` }));
                        if (err) toast(err);
                      }}
                    >
                      5 soru
                    </button>
                    <button
                      type="button"
                      className="btn small ghost"
                      onClick={() => {
                        update((s) => markReviewDone(s, r.topicId));
                        toast('Tekrar kaydedildi; bir sonraki tarih planlandı.');
                      }}
                    >
                      Tekrar ettim
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card section" aria-labelledby="up-h">
        <div className="card-head">
          <h2 id="up-h">Yaklaşan tekrarlar (30 gün)</h2>
        </div>
        {upcoming.length === 0 ? (
          <div className="small muted">Yaklaşan tekrar yok.</div>
        ) : (
          <ul className="list">
            {upcoming.map((r) => (
              <li key={r.topicId}>
                <a className="link-row" href={`#/konu/${r.topicId}`}>
                  <span className="grow">{label(r.topicId).name}</span>
                  <span className="tiny muted">{stageLabel(r.stage)}</span>
                  <span className="badge">{formatDay(r.dueDay)}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {mastered.length > 0 && (
        <section className="card section" aria-labelledby="ms-h">
          <h2 id="ms-h" className="mb-8">
            Kalıcı hale gelen konular
          </h2>
          <div className="chips">
            {mastered.map((r) => (
              <a key={r.topicId} className="badge ok" href={`#/konu/${r.topicId}`}>
                {label(r.topicId).name}
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
