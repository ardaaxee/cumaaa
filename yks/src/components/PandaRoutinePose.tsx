import {useId} from 'react';
import {RealisticPanda} from './RealisticPanda';
export function PandaRoutinePose({pose,eating,drinking,items}:{pose:'lying'|'seated';eating:boolean;drinking:boolean;items:string[]}){
 const id=useId().replace(/:/g,'');
 if(pose==='lying')return <svg className="panda-bed-pose" viewBox="0 0 440 230" aria-hidden="true">
  <defs><linearGradient id={id+'wood'}><stop stopColor="#755340"/><stop offset=".5" stopColor="#b18a65"/><stop offset="1" stopColor="#805c44"/></linearGradient><linearGradient id={id+'duvet'} x2="0" y2="1"><stop stopColor="#b6a8d0"/><stop offset="1" stopColor="#7c6b98"/></linearGradient><radialGradient id={id+'fur'}><stop stopColor="#fffdf5"/><stop offset="1" stopColor="#d9d4ca"/></radialGradient></defs>
  <ellipse cx="224" cy="210" rx="201" ry="13" fill="#12101b26"/>
  <path d="M21 59Q21 36 43 36H66V187H21ZM373 95H414V190H373Z" fill={'url(#'+id+'wood)'} stroke="#694c3b" strokeWidth="3"/>
  <path d="M38 167H401V199H38Z" fill={'url(#'+id+'wood)'}/><path d="M48 193V211M387 193V211" stroke="#674936" strokeWidth="13" strokeLinecap="round"/>
  <rect x="40" y="87" width="359" height="85" rx="25" fill="#e7dfd2" stroke="#b8afa4" strokeWidth="3"/>
  <path d="M47 77Q86 54 135 77L145 130Q95 150 46 129Z" fill="#fff8eb" stroke="#d5cbbc" strokeWidth="2"/>
  <g className="panda-sleep-breath"><ellipse cx="222" cy="113" rx="113" ry="41" fill={'url(#'+id+'fur)'}/>
   <ellipse cx="66" cy="65" rx="18" ry="17" fill="#232127"/><ellipse cx="123" cy="60" rx="18" ry="17" fill="#232127"/>
   <ellipse cx="93" cy="100" rx="55" ry="43" fill={'url(#'+id+'fur)'} transform="rotate(-9 93 100)"/>
   <ellipse cx="69" cy="98" rx="14" ry="19" fill="#27252b" transform="rotate(23 69 98)"/><ellipse cx="113" cy="90" rx="14" ry="19" fill="#27252b" transform="rotate(-21 113 90)"/>
   <path d="M61 97q9 7 17-2M104 90q9 7 17-2" fill="none" stroke="#e4ddd3" strokeWidth="3" strokeLinecap="round"/>
   <ellipse cx="95" cy="117" rx="24" ry="17" fill="#f8f2e8"/><path d="M87 111q9-7 16 0l-7 8z" fill="#242129"/><path d="M96 119q-2 6-9 5m9-5q4 5 10 1" stroke="#4d4145" fill="none" strokeWidth="2"/>
   <path d="M138 87Q210 77 270 98L323 153H142Z" fill={'url(#'+id+'duvet)'} stroke="#7a6b91" strokeWidth="2"/>
   <path d="M147 96Q229 109 275 130M169 119L157 155M221 118L215 160M274 132L295 156" stroke="#dacfea" strokeWidth="2" opacity=".48" fill="none"/>
   <ellipse cx="155" cy="124" rx="28" ry="13" fill="#242229" transform="rotate(15 155 124)"/>
   {items.includes('cicek')&&<text x="105" y="69" fontSize="20">🌸</text>}{items.includes('tac')&&<text x="70" y="55" fontSize="24">👑</text>}
  </g><path d="M44 165H396" stroke="#f7f0e6" strokeWidth="3" opacity=".7"/>
 </svg>;
 return <div className="panda-dining-pose" aria-hidden="true"><svg className="panda-dining-chair" viewBox="0 0 300 320"><rect x="75" y="83" width="150" height="159" rx="22" fill="#936d52" stroke="#6d4d39" strokeWidth="5"/><path d="M91 106H209M91 123H209M91 140H209" stroke="#bf9470" strokeWidth="8"/><path d="M83 230L75 306M217 230L225 306" stroke="#6f503b" strokeWidth="12"/><rect x="64" y="216" width="172" height="22" rx="8" fill="#bf9772"/></svg>
 <RealisticPanda size={230} eating={eating} drinking={drinking} items={items}/>
 <svg className="panda-dining-table" viewBox="0 0 340 165"><ellipse cx="170" cy="153" rx="144" ry="9" fill="#37251c25"/><path d="M60 59L52 150M280 59L288 150" stroke="#795638" strokeWidth="15"/><path d="M15 34Q170-2 325 34L318 66Q170 101 22 66Z" fill="#b2875f" stroke="#765235" strokeWidth="3"/><ellipse cx="170" cy="33" rx="153" ry="29" fill="#d7b28b" stroke="#a57b54" strokeWidth="3"/><path d="M39 32Q174 10 301 32M48 43Q175 22 287 43" stroke="#bb9167" strokeWidth="1" opacity=".6"/>
 <ellipse cx="162" cy="34" rx="52" ry="16" fill="#fcf6e7" stroke="#cdc6b8" strokeWidth="2"/><path d="M119 32Q124 66 162 67Q200 66 205 32Z" fill="#839b87" stroke="#526e56" strokeWidth="2"/><ellipse cx="162" cy="32" rx="43" ry="12" fill="#d7e4ca"/>
 {!drinking&&<g className={eating?'panda-plate-bamboo':''}><path d="M139 27L173 36M148 23L182 32M135 34L167 42" stroke="#73a155" strokeWidth="6" strokeLinecap="round"/><path d="M148 29L150 33M163 31L165 35" stroke="#446c39" strokeWidth="2"/></g>}
 <path d="M248 15H273L270 53H251Z" fill="#cfebf2" fillOpacity=".78" stroke="#92b8c2" strokeWidth="2"/><path d="M253 36H269" stroke="#87bfcd" strokeWidth="11" opacity=".7"/></svg></div>;
}
