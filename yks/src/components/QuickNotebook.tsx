import {contextPage,type NotebookContext} from '../utils/notebookContext';
import {useRoute,href} from '../hooks/useRoute';
import {getTopicRef} from '../data/curriculum';
import {getState} from '../store/store';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Spinner } from './ui';
import { useSelector, update } from '../store/store';
import { addNotebookPage } from '../store/actions';
import type { SubjectId } from '../domain/types';
const Editor = lazy(()=>import('../pages/NotebookEditorPage'));
export function QuickNotebook({subject}:{subject?:SubjectId}) {
  const route=useRoute();
  const topicId=(['konu','calis'].includes(route.segments[0])?route.segments[1]:route.query.get('konu'))??undefined;
  const [context,setContext]=useState<NotebookContext|undefined>();
  const pages=useSelector(s=>s.notebookPages);
  const [open,setOpen]=useState(false);
  const [full,setFull]=useState(false);
  useEffect(()=>{document.body.classList.toggle('notebook-split-open',open&&!full);return ()=>document.body.classList.remove('notebook-split-open');},[open,full]);
  const [selected,setSelected]=useState('');
  const saveRef=useRef<(()=>Promise<boolean>)|null>(null);
  const movingRef=useRef(false);
  const registerSave=useCallback((save:(()=>Promise<boolean>)|null)=>{saveRef.current=save;},[]);
  const close=useCallback(async()=>{if(!saveRef.current||await saveRef.current())setOpen(false);},[]);
  const selectPage=async(id:string)=>{if(!saveRef.current||await saveRef.current())setSelected(id);};
  const active=pages.find(p=>p.id===selected) ?? pages.find(p=>p.subjectId===subject) ?? pages[0];
  useEffect(()=>{
    const handler=async(event:Event)=>{
      const next=(event as CustomEvent<NotebookContext>).detail;
      if(!next?.title||movingRef.current)return;
      movingRef.current=true;
      try{
      if(saveRef.current&&!(await saveRef.current()))return;
      let id=contextPage(getState().notebookPages,next)?.id;
      if(!id)update(state=>{
        const result=addNotebookPage(state,next.title,next.subjectId);id=result.id;
        return {...result.state,notebookPages:result.state.notebookPages.map(p=>p.id===id?{...p,topicId:next.topicId,questionId:next.questionId}:p)};
      });
      setContext(next);setSelected(id!);setOpen(true);
      }finally{movingRef.current=false;}
    };
    window.addEventListener('iyiki:open-notebook',handler);
    return()=>window.removeEventListener('iyiki:open-notebook',handler);
  },[]);
  const openNotebook=()=>{
    if(topicId){
      const next={topicId,subjectId:subject,title:`${getTopicRef(topicId)?.topic.name??'Konu'} · notlarım`};
      window.dispatchEvent(new CustomEvent('iyiki:open-notebook',{detail:next}));
    }else{setContext(undefined);setOpen(true);}
  };
  const create=async()=>{if(saveRef.current&&!(await saveRef.current()))return;let id='';update(s=>{const result=addNotebookPage(s,context?.title??'Çalışma notlarım',context?.subjectId??subject);id=result.id;return {...result.state,notebookPages:result.state.notebookPages.map(p=>p.id===id?{...p,topicId:context?.topicId,questionId:context?.questionId}:p)};});setSelected(id);};
  return <><button type="button" className="quick-notebook-button" onClick={openNotebook} aria-label="El yazısı defterini aç">✎ Defter</button>
    {open && <section className={`notebook-split-panel${full?' notebook-panel-full':''}`} role="region" aria-label="El yazısı defterim">
      <header className="notebook-split-head"><b>El yazısı defterim</b><button type="button" className="btn small" aria-pressed={full} onClick={()=>setFull(v=>!v)}>{full?'Çalışmayla birlikte':'Defteri büyüt'}</button><button type="button" className="icon-btn" aria-label="Defteri kapat" onClick={close}>×</button></header>
      <div className="quick-notebook">
        {active?.questionId&&<a className="btn small" href={href('/ogretmen',{soru:active.questionId})}>Bağlı soruyu öğretmenle aç</a>}
        <p className="tiny muted">Çalışma ekranın açık kalır. Aynı defter sayfalarını her yerde kullanabilirsin.</p>
        <div className="nb-row"><label>Sayfa <select aria-label="Açılacak defter sayfası" value={active?.id ?? ''} onChange={e=>void selectPage(e.target.value)}>{pages.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><button type="button" className="btn" onClick={create}>Yeni sayfa</button></div>
        {active ? <Suspense fallback={<Spinner/>}><Editor key={active.id} params={[active.id]} embedded onPageChange={setSelected} onSaveReady={registerSave}/></Suspense> : <p>El yazısıyla not tutmak için yeni bir sayfa oluştur.</p>}
      </div>
    </section>}
  </>;
}
