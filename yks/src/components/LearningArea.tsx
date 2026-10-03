import { getState, update } from '../store/store';
import { sanitizeLearningProgress } from '../utils/learningProgress';
import { useEffect, useState } from 'react';
import type { LessonSeed, Question, Topic } from '../domain/types';
import { RecoveryPractice } from './RecoveryPractice';
import { InlineQuiz } from './InlineQuiz';

/** Her konunun kendi içeriğiyle çalışan öğretim tahtası. */
export function LearningArea({ lesson, topic, questions }: {lesson:LessonSeed;topic:Topic;questions:Question[]}) {
 const saved=sanitizeLearningProgress(getState().learningProgress)[topic.id];
 const [phase,setPhase]=useState(saved?.phase??0);
 const [example,setExample]=useState(Math.min(saved?.example??0,Math.max(0,lesson.examples.length-1)));
 const [step,setStep]=useState(Math.min(saved?.step??0,lesson.examples[Math.min(saved?.example??0,lesson.examples.length-1)]?.steps.length??0));
 const [subtopic,setSubtopic]=useState(topic.subtopics.some(s=>s.id===saved?.subtopic)?saved!.subtopic:'');
 const [answers,setAnswers]=useState<Record<string,number>>(saved?.answers??{});
 useEffect(()=>{update(s=>({...s,learningProgress:{...s.learningProgress,[topic.id]:{phase,example,step,subtopic,answers,updatedAt:new Date().toISOString()}}}));},[topic.id,phase,example,step,subtopic,answers]);
 const ex=lesson.examples[example];
 const practice=questions.filter(q=>!subtopic||q.subtopic===subtopic).slice(0,3);
 const visibleAnswers=Object.fromEntries(practice.filter(q=>answers[q.id]!=null).map(q=>[q.id,answers[q.id]]));
 const result={answered:Object.keys(visibleAnswers).length,correct:practice.filter(q=>answers[q.id]===q.correctAnswer).length};
 const phases=['Öğren','Birlikte çöz','Sen uygula','Özetle'];
 return <section className="card section learning-area" aria-label={`${topic.name} öğrenme alanı`}>
  <header><div className="eyebrow">ÖĞRENME ALANI</div><h2>{topic.name} · öğretim tahtası</h2><p>Önce fikri anla, örneği adım adım çöz, ardından kendi cevabını sınayarak öğren.</p></header>
  <nav aria-label="Öğrenme adımları" className="learning-tabs">{phases.map((label,i)=><button key={label} type="button" aria-pressed={phase===i} onClick={()=>setPhase(i)}>{i+1}. {label}</button>)}</nav>
  <div className="learning-board">
   {phase===0&&<><h3>Bu konuda ne öğreneceksin?</h3><ul>{topic.subtopics.flatMap(s=>s.outcomes).map(o=><li key={o.id}>{o.text}</li>)}</ul><h3>Temel fikir</h3><p className="pre-line">{lesson.intro}</p><details><summary>Ön bilgileri kontrol et</summary><ul>{lesson.prerequisites.map(p=><li key={p}>{p}</li>)}</ul></details><dl className="concept">{lesson.concepts.map(c=><div key={c.term}><dt>{c.term}</dt><dd>{c.definition}</dd></div>)}</dl><h3>Neden böyle?</h3><p className="pre-line">{lesson.logic}</p>{lesson.formulas.map(f=><div className="formula" key={f.expr}><code>{f.expr}</code><p>{f.meaning}</p></div>)}</>}
   {phase===1&&<><h3>Birlikte çözelim</h3><label className="field"><span>Çözümlü örnek seç</span><select value={example} onChange={e=>{setExample(Number(e.target.value));setStep(0);}}>{lesson.examples.map((e,i)=><option key={i} value={i}>Örnek {i+1} · {e.level}</option>)}</select></label>{ex?<><p className="learning-problem pre-line">{ex.problem}</p><p className="small muted">Çözümü açmadan önce verilenleri ve isteneni belirle. Hangi kavram veya bağıntıyı kullanırsın?</p><ol>{ex.steps.slice(0,step).map((s,i)=><li key={i} className="pre-line">{s}</li>)}</ol>{step<ex.steps.length?<button className="btn primary" type="button" onClick={()=>setStep(s=>s+1)}>{step===0?'İlk çözüm adımını göster':'Sonraki adımı göster'} · {step}/{ex.steps.length}</button>:<div className="callout ok" role="status"><b>Sonuç: {ex.answer}</b><p>Bu sonuca nasıl ulaşıldığını kendi cümlenle açıkla; ardından uygulama sorusuna geç.</p></div>}<button className="btn ghost" type="button" onClick={()=>setStep(0)}>Çözümü yeniden dene</button></>:<p>Bu konunun çözümlü örneği henüz hazır değil. Uygulama sorularından devam edebilirsin.</p>}</>}
   {phase===2&&<><h3>Şimdi sen uygula</h3><label className="field"><span>Çalışacağın alt konu</span><select value={subtopic} onChange={e=>{setSubtopic(e.target.value);}}><option value="">Konunun tamamı</option>{topic.subtopics.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><p>Önce kendin çöz. İhtiyaç duyarsan ipucunu aç; cevabından sonra çözüm yolunu ve hata açıklamasını incele.</p>{practice.length?<InlineQuiz key={subtopic} questions={practice} topicName={topic.name} savedAnswers={visibleAnswers} onAnswersChange={next=>setAnswers(previous=>({...previous,...next}))}/>:<p>Bu alt konu için uygulama sorusu henüz hazır değil.</p>}{practice.filter(q=>answers[q.id]!=null&&answers[q.id]!==q.correctAnswer).map(q=><RecoveryPractice key={q.id} question={q} selected={answers[q.id]} questions={questions.filter(candidate=>!practice.some(shown=>shown.id===candidate.id))} answers={answers} onAnswersChange={next=>setAnswers(previous=>({...previous,...next}))} topicName={topic.name}/>)}{result.answered>0&&<p role="status">{result.answered} cevap · {result.correct} doğru. {result.correct===result.answered?'Çözüm yolunu açıklayarak bilgini pekiştir.':'Yanlış yaptığın sorunun açıklamasını oku; ilgili örneğe dönerek tekrar çalış.'}</p>}</>}
   {phase===3&&<><h3>Hatırlaman gerekenler</h3><ul>{lesson.summary.map(s=><li key={s}>{s}</li>)}</ul><h3>Sık hataları önle</h3><ul>{lesson.commonMistakes.map(s=><li key={s}>{s}</li>)}</ul><h3>Sınavda nasıl düşünmelisin?</h3><p className="pre-line">{lesson.osymThinking}</p><div className="callout"><b>Kendine anlat</b><p>Kitaba bakmadan ana fikri söyle, bir örneğin çözüm yolunu açıkla ve hangi hatadan kaçınacağını belirt. Zorlandığın adıma geri dön.</p></div></>}
  </div>
  <footer className="row between"><button className="btn" type="button" disabled={phase===0} onClick={()=>setPhase(p=>p-1)}>← Önceki adım</button><span>{phase+1} / 4</span><button className="btn primary" type="button" disabled={phase===3} onClick={()=>setPhase(p=>p+1)}>Sonraki adım →</button></footer>
 </section>;
}
