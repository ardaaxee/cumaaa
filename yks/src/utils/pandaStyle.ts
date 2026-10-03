export const PANDA_OUTFITS=[{id:'kiyafet-pembe',label:'Pembe tulum',color:'#d8a0bb'},{id:'kiyafet-mavi',label:'Mavi sweatshirt',color:'#88abc5'},{id:'kiyafet-pijama',label:'Yıldızlı pijama',color:'#a99acb'}];
export const PANDA_MAKEUP=[{id:'makyaj-pembe',label:'Pembe yanaklar',color:'#e996ad'},{id:'makyaj-isilti',label:'Hafif ışıltı',color:'#dfbf78'}];
export function equipPandaStyle(items:string[],id:string,kind:'outfit'|'makeup'):string[]{
 const choices=kind==='outfit'?PANDA_OUTFITS:PANDA_MAKEUP;
 const rest=items.filter(x=>!choices.some(c=>c.id===x));
 return id&&choices.some(c=>c.id===id)?[...rest,id]:rest;
}
