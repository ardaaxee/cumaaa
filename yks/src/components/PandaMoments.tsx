import { useState } from 'react';
import { update, useAppState } from '../store/store';
import { dayKey, formatDay } from '../utils/date';
import { pandaLetter, rememberPandaDay, type PandaMood } from '../utils/pandaMoments';

const MOODS: {id:PandaMood;label:string;response:string}[] = [
 {id:'iyi',label:'İyiyim',response:'Güzel geçen bir anını saklamak ister misin? Küçük mutluluklar da hatırlanmaya değer.'},
 {id:'yorgun',label:'Yorgunum',response:'Kısa bir mola verebilirsin. Bugün yaptıkların yeterli gelmese bile dinlenmek de ihtiyaçtır.'},
 {id:'kaygili',label:'Biraz kaygılıyım',response:'Şu an yalnızca sıradaki küçük adıma odaklanabilirsin. İstersen önce bir nefes alıp omuzlarını gevşet.'},
];
export function PandaMoments({onMoment}:{onMoment:(kind:'hug'|'flower'|'rest',message:string)=>void}) {
 const state=useAppState();const today=dayKey();const memories=state.settings.pet.memories??[];
 const current=memories.find(m=>m.day===today);
 const [mood,setMood]=useState<PandaMood>(current?.mood??'iyi');
 const [note,setNote]=useState(current?.note??'');const [saved,setSaved]=useState(false);const [letterOpen,setLetterOpen]=useState(false);
 const [moment,setMoment]=useState<string|null>(null);
 const showMoment=(kind:'hug'|'flower'|'rest',message:string)=>{setMoment(message);onMoment(kind,message);};
 const person=state.profile.name.trim()||'Sen';const pet=state.settings.pet.name;
 const response=MOODS.find(m=>m.id===mood)!.response;
 const save=()=>{update(s=>({...s,settings:{...s.settings,pet:{...s.settings.pet,memories:rememberPandaDay(s.settings.pet.memories??[],{day:today,mood,note})}}}));setSaved(true);};
 return <section className="panda-moments card section" aria-labelledby="panda-moments-title">
  <div className="panda-moments-heading"><span aria-hidden="true">♡</span><div><small>KÜÇÜK MUTLULUKLAR</small><h2 id="panda-moments-title">{person} için Panda köşesi</h2></div></div>
  <p>{pet} ile kısa bir mola ver. Burada puan veya çalışma şartı yok.</p>
  <div className="panda-moment-actions">
   <button type="button" className="btn" onClick={()=>showMoment('hug',`${person}, ${pet} sana kocaman bir sarılma gönderiyor. Biraz dinlen, ben buradayım ♡`)}>♡ Sarıl</button>
   <button type="button" className="btn" onClick={()=>showMoment('flower',`${person}, bu küçük çiçek bugün yüzünü güldürsün. — ${pet} 🌼`)}>🌼 Bir çiçek al</button>
   <button type="button" className="btn" onClick={()=>showMoment('rest','Şimdi kısa bir mola. Omuzlarını gevşet, rahatça nefes al; hazır olduğunda devam edebilirsin.')}>☁ Sessiz mola</button>
  </div>
  {moment&&<p className="panda-letter" role="status">{moment}</p>}
  <button type="button" className="panda-letter-button" aria-expanded={letterOpen} onClick={()=>setLetterOpen(!letterOpen)}>✉ {letterOpen?'Bugünün mektubunu kapat':'Bugünün mektubunu aç'}</button>
  {letterOpen&&<div className="panda-letter"><b>{person},</b><p>{pandaLetter(today)}</p><span>Sevgiler, {pet} ♡</span></div>}
  <h3>Bugün nasıl hissediyorsun?</h3>
  <div className="panda-moment-actions" role="group" aria-label="Bugünkü ruh halin">{MOODS.map(m=><button key={m.id} type="button" className={`btn small ${mood===m.id?'primary':''}`} aria-pressed={mood===m.id} onClick={()=>{setMood(m.id);setSaved(false);}}>{m.label}</button>)}</div>
  <p className="panda-mood-response" role="status">{response}</p>
  <label className="field"><span>Bugünden saklamak istediğin küçük bir anı</span><textarea className="input" rows={3} maxLength={300} value={note} onChange={e=>{setNote(e.target.value);setSaved(false);}} placeholder="Bugün beni gülümseten şey…" /></label>
  <div className="row between"><small className="muted">{note.length}/300 · Aynı günün kaydı güncellenir.</small><button type="button" className="btn primary" disabled={saved} onClick={save}>{saved?'Kaydedildi ✓':'Bugünü sakla'}</button></div>
  {memories.length>0&&<details className="mt-12"><summary>Anı defterim · {memories.length} gün</summary><div className="panda-memory-list">{memories.map(m=><article key={m.day}><b>{formatDay(m.day)}</b><small>{MOODS.find(x=>x.id===m.mood)?.label}</small><p>{m.note||'Bu günün ruh hali kaydedildi.'}</p></article>)}</div></details>}
  <p className="tiny muted mt-12">Son 60 gün saklanır. Anılar kişisel çalışma yedeğine dahildir; bağlantıyı paylaşmak anılarını paylaşmaz.</p>
 </section>;
}
