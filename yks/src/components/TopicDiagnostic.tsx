import {useState} from 'react';
import type {Question} from '../domain/types';
import {InlineQuiz} from './InlineQuiz';
import {diagnosticQuestions,diagnosticResult} from '../utils/diagnostic';
export function TopicDiagnostic({questions,answers,onAnswersChange,onContinue}:{questions:Question[];answers:Record<string,number>;onAnswersChange:(a:Record<string,number>)=>void;onContinue:(weak:string)=>void}){
 const [open,setOpen]=useState(false);
 const checks=diagnosticQuestions(questions);const result=diagnosticResult(checks,answers);
 if(!checks.length)return null;
 return <section className="diagnostic-check" aria-label="Konu seviye kontrolü"><h3>Nereden başlamalısın?</h3><p>{checks.length} kısa soru ile başlangıç noktanı belirle. Bu kontrol bütün konuyu bildiğini tek başına göstermez.</p>
 {!open&&!result.complete&&<button className="btn" type="button" onClick={()=>setOpen(true)}>Seviyemi kontrol et</button>}
 {open&&<InlineQuiz questions={checks} savedAnswers={answers} onAnswersChange={onAnswersChange}/>}
 {result.complete&&<div className="callout" role="status"><b>{result.correct}/{checks.length} doğru</b><p>{result.weakSubtopics.length?'Zorlandığın alt konunun anlatımı ve çözümlü örneğiyle başlayalım.':'Başlangıç sorularını doğru çözdün. Yeni uygulama sorularıyla devam edebilirsin.'}</p><button className="btn primary" type="button" onClick={()=>onContinue(result.weakSubtopics[0]??'')}>{result.weakSubtopics.length?'Eksik olduğum yerden öğren':'Uygulamaya geç'}</button><button className="btn ghost" type="button" onClick={()=>setOpen(v=>!v)}>{open?'Soruları kapat':'Cevaplarımı incele'}</button></div>}
 </section>;
}
