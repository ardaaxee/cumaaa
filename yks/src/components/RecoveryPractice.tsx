import {useState} from 'react';
import type {Question} from '../domain/types';
import {InlineQuiz} from './InlineQuiz';
import {optionLetter} from '../utils/ids';
import {recoveryQuestion} from '../utils/recoveryQuestion';
export function RecoveryPractice({question,selected,questions,answers,onAnswersChange,topicName}:{question:Question;selected:number;questions:Question[];answers:Record<string,number>;onAnswersChange:(a:Record<string,number>)=>void;topicName:string}) {
 const [open,setOpen]=useState(false);
 const [next]=useState(()=>recoveryQuestion(question,questions,answers));
 return <section className="recovery-practice" aria-label="Yanlışa özel destek"><h3>Bu yanlışın üzerinden öğrenelim</h3><p><b>Senin cevabın:</b> {optionLetter(selected)}) {question.options[selected]}</p><p><b>Doğru cevap:</b> {optionLetter(question.correctAnswer)}) {question.options[question.correctAnswer]}</p><p><b>Ölçülen beceri:</b> {question.outcome}</p><p><b>Bu soruda dikkat et:</b> {question.commonMistake}</p><p className="pre-line">{question.teacherNote||question.solution}</p><p className="small muted">Bu açıklama sorunun kazanımına dayanır; düşünce yolunu kesin olarak belirlemek için çözümünü öğretmene yazabilirsin.</p>
 {next?<><button type="button" className="btn" onClick={()=>setOpen(true)}>Aynı alt konudan yeni soruyla dene</button>{open&&<InlineQuiz key={next.id} questions={[next]} topicName={topicName} savedAnswers={answers} onAnswersChange={onAnswersChange}/>}</>:<p>Bu alt konudaki soruları tamamladın. Örneğin çözümünü tekrar inceleyip konunun diğer sorularıyla devam et.</p>}
 </section>;
}
