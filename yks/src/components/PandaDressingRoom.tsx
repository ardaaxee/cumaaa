import {useEffect,useRef,useState} from 'react';
import {RealisticPanda} from './RealisticPanda';
import {PANDA_OUTFITS,PANDA_MAKEUP} from '../utils/pandaStyle';
export function PandaDressingRoom({kind,items,onChoose,onClose}:{kind:'outfit'|'makeup';items:string[];onChoose:(id:string)=>void;onClose:()=>void}){
 const [applying,setApplying]=useState(false);
 useEffect(()=>{if(!applying)return;const timer=window.setTimeout(()=>setApplying(false),1800);return()=>window.clearTimeout(timer);},[applying]);
 const panel=useRef<HTMLDivElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;panel.current?.focus({preventScroll:true});return()=>previous?.focus({preventScroll:true});},[]);
 const choices=kind==='outfit'?PANDA_OUTFITS:PANDA_MAKEUP;
 return <div className="panda-dressing-overlay" onPointerDown={e=>e.stopPropagation()}>
 <div ref={panel} tabIndex={-1} className="panda-dressing-panel" role="dialog" aria-modal="true" aria-label={kind==='outfit'?"Zeynep’in gardırobu":"Zeynep’in makyaj masası"} onKeyDown={e=>{if(e.key==='Escape'){onClose();}if(e.key==='Tab'){const buttons=[...e.currentTarget.querySelectorAll<HTMLButtonElement>('button')];const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===e.currentTarget)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}>
 <div className="panda-dressing-heading"><h2>{kind==='outfit'?"Zeynep’in gardırobu":"Zeynep’in makyaj masası"}</h2><button type="button" onClick={onClose} aria-label="Hazırlığı bitir">×</button></div>
 <p>{kind==='outfit'?'Bir kıyafet seç; Panda üzerine giysin.':'Yanak rengi veya hafif ışıltı seç; Panda aynada hazırlansın.'}</p>
 <div className="panda-dressing-preview"><RealisticPanda size={190} items={items}/>{kind==='makeup'&&applying&&<svg className="panda-makeup-brush" viewBox="0 0 100 100" aria-hidden="true"><path d="M80 81L28 27" stroke="#ac7494" strokeWidth="10" strokeLinecap="round"/><path d="M28 27L17 17" stroke="#b8aa99" strokeWidth="12"/><path d="M10 4Q-1 14 9 24L21 31Q32 26 31 19Z" fill="#ecd1c0" stroke="#c6a897" strokeWidth="2"/></svg>}</div><div className="panda-dressing-status" role="status">{applying?(kind==='makeup'?'Yanaklarına hafifçe uyguluyor…':'Yeni kıyafetini giyiyor…'):'Seçimin otomatik kaydedilir.'}</div>
 <div className="panda-dressing-options">{choices.map(c=><button type="button" key={c.id} aria-pressed={items.includes(c.id)} onClick={()=>{onChoose(c.id);setApplying(true);}}><span style={{background:c.color}}/>{c.label}{items.includes(c.id)?' ✓':''}</button>)}<button type="button" onClick={()=>onChoose('')}>{kind==='outfit'?'Kıyafeti çıkar':'Makyajı temizle'}</button></div>
 <button className="panda-dressing-done" type="button" onClick={onClose}>Hazırım · odaya dön</button>
 </div></div>;
}
