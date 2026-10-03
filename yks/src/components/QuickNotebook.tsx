import { lazy, Suspense, useCallback, useState } from 'react';
import { Modal, Spinner } from './ui';
import { useSelector, update } from '../store/store';
import { addNotebookPage } from '../store/actions';
import type { SubjectId } from '../domain/types';
const Editor = lazy(()=>import('../pages/NotebookEditorPage'));
export function QuickNotebook({subject}:{subject?:SubjectId}) {
  const pages=useSelector(s=>s.notebookPages);
  const [open,setOpen]=useState(false);
  const [selected,setSelected]=useState('');
  const close=useCallback(()=>setOpen(false),[]);
  const active=pages.find(p=>p.id===selected) ?? pages.find(p=>p.subjectId===subject) ?? pages[0];
  const create=()=>{let id='';update(s=>{const result=addNotebookPage(s,'Çalışma notlarım',subject);id=result.id;return result.state;});setSelected(id);};
  return <><button type="button" className="quick-notebook-button" onClick={()=>setOpen(true)} aria-label="El yazısı defterini aç">✎ Defter</button>
    {open && <Modal title="El yazısı defterim" onClose={close} labelledBy="quick-notebook-title">
      <div className="quick-notebook">
        <p className="tiny muted">Çalışma ekranın açık kalır. Aynı defter sayfalarını her yerde kullanabilirsin.</p>
        <div className="nb-row"><label>Sayfa <select aria-label="Açılacak defter sayfası" value={active?.id ?? ''} onChange={e=>setSelected(e.target.value)}>{pages.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><button type="button" className="btn" onClick={create}>Yeni sayfa</button></div>
        {active ? <Suspense fallback={<Spinner/>}><Editor key={active.id} params={[active.id]} embedded/></Suspense> : <p>El yazısıyla not tutmak için yeni bir sayfa oluştur.</p>}
      </div>
    </Modal>}
  </>;
}
