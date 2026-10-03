import {sanitizeRecoveryProgress} from '../utils/recoveryProgress';
import { useEffect, useState } from 'react';
import { PageHeader } from '../components/Layout';
import { InlineQuiz } from '../components/InlineQuiz';
import { Empty, LoadFailed, Spinner } from '../components/ui';
import { loadLesson, loadQuestionsByIds, loadTopicQuestions } from '../data/content';
import { getTopicRef } from '../data/curriculum';
import { href } from '../hooks/useRoute';
import { useLoad } from '../hooks/useLoad';
import { getState,update } from '../store/store';
import { recoveryQuestions } from '../utils/recoveryPractice';

export default function RecoveryPage({ params }: { params: string[] }) {
  const id = params[0] ?? '';
  const saved=sanitizeRecoveryProgress(getState().recoveryProgress)[id];
  const { data, failed, errorKind, retry } = useLoad(async () => {
    const source = (await loadQuestionsByIds([id])).get(id);
    if (!source) return null;
    const [lesson, pool] = await Promise.all([loadLesson(source.topic), loadTopicQuestions(source.topic)]);
    const previous=(saved?.questionIds??[]).map(qid=>pool.find(q=>q.id===qid&&q.id!==id)).filter((q):q is NonNullable<typeof q>=>!!q);
    return { source, lesson, practice: previous.length?previous:recoveryQuestions(source, pool, getState().attempts) };
  }, [id]);
  const [step, setStep] = useState(saved?.step??1);
  const [answers, setAnswers] = useState<Record<string, number>>(saved?.answers??{});
  const [verification, setVerification] = useState<Record<string, number>>(saved?.verification??{});
  const [exampleStep,setExampleStep]=useState(saved?.exampleStep??0);
  useEffect(()=>{
    if(!data)return;
    update(state=>({...state,recoveryProgress:{...state.recoveryProgress,[id]:{step,exampleStep,questionIds:data.practice.map(q=>q.id),answers,verification,updatedAt:new Date().toISOString()}}}));
  },[id,data,step,exampleStep,answers,verification]);
  if (failed) return <LoadFailed kind={errorKind} onRetry={retry} />;
  if (data === undefined) return <Spinner />;
  if (!data) return <Empty title="Soru bulunamadı">Yanlışlarım bölümünden başka bir soru seçebilirsin.</Empty>;
  const { source, lesson, practice } = data;
  const ref = getTopicRef(source.topic);
  const answered = practice.filter(q => answers[q.id] != null).length;
  const correct = practice.filter(q => answers[q.id] === q.correctAnswer).length;
  return <>
    <PageHeader title="Yanlışımı öğreniyorum" sub={ref?.topic.name ?? 'Konu pekiştirme'} />
    <nav className="learning-tabs" aria-label="Pekiştirme adımları">{['Bilgiyi tamamla','Yeni sorularla dene','İlk soruya dön'].map((label,i)=><button type="button" key={label} disabled={i===2&&answered<practice.length} aria-pressed={step===i+1} onClick={()=>setStep(i+1)}>{i+1}. {label}</button>)}</nav>
    <p className="muted">1. Bilgiyi tamamla → 2. Farklı sorularla pekiştir → 3. İlk soruyu yeniden çöz</p>
    {step === 1 && <section className="card">
      <h2>Bu sorunun ölçtüğü bilgi</h2>
      <p>{source.outcome}</p>
      <div className="callout"><b>Hatırlaman gereken</b><p>{source.hint}</p></div>
      <p><b>Sık yapılan hata:</b> {source.commonMistake}</p>
      {lesson && <><h3>Kısa konu özeti</h3><ul>{lesson.summary.map((item, i) => <li key={i}>{item}</li>)}</ul></>}
      {lesson?.examples[0]&&<section className="guided-recovery-example"><h3>Konudan çözümlü örnek</h3><p className="pre-line">{lesson.examples[0].problem}</p><ol>{lesson.examples[0].steps.slice(0,exampleStep).map((text,i)=><li key={i}>{text}</li>)}</ol>{exampleStep<lesson.examples[0].steps.length?<button className="btn" type="button" onClick={()=>setExampleStep(n=>n+1)}>Örneğin sonraki çözüm adımını göster</button>:<p className="callout">Sonuç: {lesson.examples[0].answer}</p>}</section>}
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
