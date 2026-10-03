import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Spinner } from './ui';
import { useSelector, update } from '../store/store';
import { addNotebookPage } from '../store/actions';
import type { SubjectId } from '../domain/types';
const Editor = lazy(()=>import('../pages/NotebookEditorPage'));
export function QuickNotebook({subject}:{subject?:SubjectId}) {
  const pages=useSelector(s=>s.notebookPages);
  const [open,setOpen]=useState(false);
  const [full,setFull]=useState(false);
  useEffect(()=>{document.body.classList.toggle('notebook-split-open',open&&!full);return ()=>document.body.classList.remove('notebook-split-open');},[open,full]);
  const [selected,setSelected]=useState('');
  const close=useCallback(()=>setOpen(false),[]);
  const active=pages.find(p=>p.id===selected) ?? pages.find(p=>p.subjectId===subject) ?? pages[0];
  const create=()=>{let id='';update(s=>{const result=addNotebookPage(s,'Çalışma notlarım',subject);id=result.id;return result.state;});setSelected(id);};
  return <><button type="button" className="quick-notebook-button" onClick={()=>setOpen(true)} aria-label="El yazısı defterini aç">✎ Defter</button>
    {open && <section className={`notebook-split-panel${full?' notebook-panel-full':''}`} role="region" aria-label="El yazısı defterim">
      <header className="notebook-split-head"><b>El yazısı defterim</b><button type="button" className="btn small" aria-pressed={full} onClick={()=>setFull(v=>!v)}>{full?'Çalışmayla birlikte':'Defteri büyüt'}</button><button type="button" className="icon-btn" aria-label="Defteri kapat" onClick={close}>×</button></header>
      <div className="quick-notebook">
        <p className="tiny muted">Çalışma ekranın açık kalır. Aynı defter sayfalarını her yerde kullanabilirsin.</p>
        <div className="nb-row"><label>Sayfa <select aria-label="Açılacak defter sayfası" value={active?.id ?? ''} onChange={e=>setSelected(e.target.value)}>{pages.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><button type="button" className="btn" onClick={create}>Yeni sayfa</button></div>
        {active ? <Suspense fallback={<Spinner/>}><Editor key={active.id} params={[active.id]} embedded/></Suspense> : <p>El yazısıyla not tutmak için yeni bir sayfa oluştur.</p>}
      </div>
    </section>}
  </>;
}
