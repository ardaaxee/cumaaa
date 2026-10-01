import { useState } from 'react';
import { PageHeader } from '../components/Layout';
import { InlineQuiz } from '../components/InlineQuiz';
import { Empty, LoadFailed, Spinner } from '../components/ui';
import { loadLesson, loadQuestionsByIds, loadTopicQuestions } from '../data/content';
import { getTopicRef } from '../data/curriculum';
import { href } from '../hooks/useRoute';
import { useLoad } from '../hooks/useLoad';
import { getState } from '../store/store';
import { recoveryQuestions } from '../utils/recoveryPractice';

export default function RecoveryPage({ params }: { params: string[] }) {
  const id = params[0] ?? '';
  const { data, failed, errorKind, retry } = useLoad(async () => {
    const source = (await loadQuestionsByIds([id])).get(id);
    if (!source) return null;
    const [lesson, pool] = await Promise.all([loadLesson(source.topic), loadTopicQuestions(source.topic)]);
    return { source, lesson, practice: recoveryQuestions(source, pool, getState().attempts) };
  }, [id]);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [verification, setVerification] = useState<Record<string, number>>({});
  if (failed) return <LoadFailed kind={errorKind} onRetry={retry} />;
  if (data === undefined) return <Spinner />;
  if (!data) return <Empty title="Soru bulunamadı">Yanlışlarım bölümünden başka bir soru seçebilirsin.</Empty>;
  const { source, lesson, practice } = data;
  const ref = getTopicRef(source.topic);
  const answered = practice.filter(q => answers[q.id] != null).length;
  const correct = practice.filter(q => answers[q.id] === q.correctAnswer).length;
  return <>
    <PageHeader title="Yanlışımı öğreniyorum" sub={ref?.topic.name ?? 'Konu pekiştirme'} />
    <p className="muted">1. Bilgiyi tamamla → 2. Farklı sorularla pekiştir → 3. İlk soruyu yeniden çöz</p>
    {step === 1 && <section className="card">
      <h2>Bu sorunun ölçtüğü bilgi</h2>
      <p>{source.outcome}</p>
      <div className="callout"><b>Hatırlaman gereken</b><p>{source.hint}</p></div>
      <p><b>Sık yapılan hata:</b> {source.commonMistake}</p>
      {lesson && <><h3>Kısa konu özeti</h3><ul>{lesson.summary.map((item, i) => <li key={i}>{item}</li>)}</ul></>}
      <div className="row mt-12">
        <a className="btn" href={href(`/konu/${source.topic}`)}>Konu anlatımının tamamı</a>
        <button className="btn primary" onClick={() => setStep(2)}>{practice.length ? `${practice.length} soruyla pekiştir` : 'İlk soruyu yeniden çöz'}</button>
      </div>
    </section>}
    {step === 2 && <section className="card">
      <h2>Farklı sorularla pekiştir</h2>
      <p>Önce aynı alt konudan sorular seçildi. Cevapların çalışma kaydına işlenir.</p>
      {practice.length < 3 && <p className="notice">Bu konuda ilk soru dışında {practice.length} farklı soru var. Mevcut sorularla çalışabilirsin.</p>}
      <InlineQuiz questions={practice} topicName={ref?.topic.name} savedAnswers={answers} onAnswersChange={setAnswers} />
      {answered === practice.length && <div className="mt-12">
        {practice.length > 0 && <p>{correct}/{practice.length} doğru. {correct < practice.length ? 'Yanlış yaptığın soruların açıklamalarını okuyup ilk soruya dön.' : 'Şimdi öğrendiklerini ilk soruda uygula.'}</p>}
        <button className="btn primary" onClick={() => setStep(3)}>İlk soruyu yeniden çöz</button>
      </div>}
    </section>}
    {step === 3 && <section className="card">
      <h2>İlk soruyu yeniden çöz</h2>
      <p>Çözümü açmadan cevapla. Bir sorunun öğrenilmiş sayılması için iki kez üst üste doğru çözülmesi gerekir.</p>
      <InlineQuiz questions={[source]} topicName={ref?.topic.name} savedAnswers={verification} onAnswersChange={setVerification} />
      {verification[source.id] != null && <div className="row mt-12">
        <a className="btn primary" href={href('/yanlislar', { konu: source.topic })}>Yanlışlarımdaki durumunu gör</a>
        <a className="btn" href={href(`/konu/${source.topic}`)}>Konuyu çalışmaya devam et</a>
      </div>}
    </section>}
  </>;
}
