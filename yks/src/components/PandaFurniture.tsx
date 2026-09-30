import { useState } from 'react';
import type { HouseRoom } from '../utils/pandaLife';

/** Hafif vektör eşyalar; tüm etkileşimler kullanıcının dokunuşuyla başlar. */
export function PandaFurniture({room,onWater,onStudy,bamboo,drops}:{room:HouseRoom;onWater:()=>void;onStudy:()=>void;bamboo:number;drops:number}) {
 const [light,setLight]=useState(false);const [open,setOpen]=useState(false);const [reading,setReading]=useState(false);const [plant,setPlant]=useState(0);
 const garden=room==='garden'||room==='balcony';
 return <>
  {(room==='living'||room==='bedroom'||room==='study')&&<button type="button" className={`furniture-object furniture-light ${light?'lit':''}`} aria-label={light?'Okuma lambasını kapat':'Okuma lambasını aç'} aria-pressed={light} onClick={()=>setLight(!light)}>
   <svg viewBox="0 0 90 160" aria-hidden="true"><ellipse cx="45" cy="150" rx="31" ry="6" fill="#0003"/><path d="M42 52h6v91h-6z" fill="#9b8273"/><path d="M22 142h46l8 7H14z" fill="#715b50"/><path d="M27 9h36l17 47H10z" fill={light?'#ffe9aa':'#b4a18c'} stroke="#8a7661" strokeWidth="2"/><path d="M27 9h7L25 56H11z" fill="#fff3"/><ellipse cx="45" cy="56" rx="35" ry="5" fill={light?'#fff1c0':'#84715d'}/></svg>
   <span>{light?'Lamba açık':'Okuma lambası'}</span>
  </button>}
  {room==='study'&&<button type="button" className="furniture-object furniture-book" aria-label="Çalışma kitabını aç" aria-expanded={reading} onClick={()=>setReading(!reading)}>
   <svg viewBox="0 0 130 90" aria-hidden="true"><ellipse cx="65" cy="79" rx="58" ry="8" fill="#0003"/><path d="M8 25l51-14 63 19-6 43-52 10L9 64z" fill="#69538c"/><path d="M13 22l47-10 55 18-1 38-51 11-50-17z" fill="#e9dfc7"/><path d="M61 13l2 65M18 35l35-8M19 44l34-8M20 53l34-8M74 31l28 9M74 40l28 9M74 49l28 9" stroke="#b5a88e" strokeWidth="2"/></svg><span>Çalışma kitabı</span>
  </button>}
  {room==='kitchen'&&<button type="button" className={`furniture-object furniture-cabinet ${open?'open':''}`} aria-label={open?'Erzak dolabını kapat':'Erzak dolabını aç'} aria-expanded={open} onClick={()=>setOpen(!open)}>
   <svg viewBox="0 0 115 150" aria-hidden="true"><path d="M10 12l88-5 8 10v120l-93 6z" fill="#b39772"/><path d="M16 19h81v111H16z" fill={open?'#554337':'#d6ba94'}/>{open?<><path d="M16 50h81M16 87h81" stroke="#c7a780" strokeWidth="6"/><path d="M22 24h18v20H22zM58 57h22v23H58z" fill="#93a579"/><path d="M30 94h15v27H30z" fill="#9bbed0"/></>:<><path d="M55 19v111" stroke="#ae8d66"/><path d="M48 65v14M63 65v14" stroke="#71593f" strokeWidth="4"/></>}<path d="M18 137v8M92 134v9" stroke="#71593f" strokeWidth="6"/></svg><span>{open?`${bamboo} bambu · ${drops} su`:'Erzak dolabı'}</span>
  </button>}
  {room==='kitchen'&&<button type="button" className="furniture-object furniture-glass" onClick={onWater} aria-label="Su bardağıyla Panda’ya su ver">
   <svg viewBox="0 0 80 105" aria-hidden="true"><ellipse cx="40" cy="94" rx="24" ry="5" fill="#0003"/><path d="M15 13h50l-6 74q-19 12-38 0z" fill="#d8edf044" stroke="#b8d9e4" strokeWidth="3"/><path d="M19 45h42l-4 40q-17 10-34 0z" fill="#6dabceaa"/><ellipse cx="40" cy="45" rx="21" ry="4" fill="#b8e6fa"/><path d="M24 19l3 62" stroke="#fff9" strokeWidth="3"/></svg><span>Su bardağı</span>
  </button>}
  {garden&&<button type="button" className="furniture-object furniture-watering" aria-label="Çiçeği sula" disabled={plant>=3} onClick={()=>setPlant(Math.min(3,plant+1))}>
   <svg viewBox="0 0 150 130" aria-hidden="true"><path d="M23 48h57v51q-29 19-57 0z" fill="#6e9696" stroke="#416966" strokeWidth="3"/><path d="M25 51q-40 11-14 44l13-2" fill="none" stroke="#416966" strokeWidth="8"/><path d="M79 59l42-30 11 10-51 45z" fill="#8aafaa" stroke="#416966" strokeWidth="3"/><path d="M35 39h34v11H35z" fill="#aac8bf"/><path d="M121 49l12 15m-8-17 16 12" stroke="#93cce8" strokeWidth="3"/><path d="M116 96h27l-4 26h-19z" fill="#bf8460"/><path d="M129 98V71m0 15-13-9m13 4 12-11" stroke="#628557" strokeWidth="4"/>{plant>=3&&<><circle cx="129" cy="65" r="12" fill="#e4b8cc"/><circle cx="129" cy="65" r="4" fill="#ffe3a0"/></>}</svg><span>{plant>=3?'Çiçek açtı ✓':`Çiçeği sula · ${plant}/3`}</span>
  </button>}
  {reading&&room==='study'&&<div className="furniture-reading" role="region" aria-label="Açık çalışma kitabı"><b>Birlikte çalışma</b><p>Bir konunun özetini oku, çözümlü örneği incele, sonra birkaç soruyla pekiştir.</p><button type="button" onClick={onStudy}>Panda masaya geçsin</button><a href="#/dersler">Konu anlatımını aç</a><button type="button" onClick={()=>setReading(false)}>Kitabı kapat</button></div>}
 </>;
}
