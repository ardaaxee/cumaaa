import { isValidDayKey } from './date';
export type PandaMood = 'iyi' | 'yorgun' | 'kaygili';
export interface PandaMemory { day: string; mood: PandaMood; note: string }
export function sanitizePandaMemories(raw: unknown): PandaMemory[] {
  if (!Array.isArray(raw)) return [];
  const days = new Map<string, PandaMemory>();
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const x = item as Record<string, unknown>;
    if (typeof x.day !== 'string' || !isValidDayKey(x.day) || !['iyi','yorgun','kaygili'].includes(String(x.mood))) continue;
    days.set(x.day,{day:x.day,mood:x.mood as PandaMood,note:typeof x.note==='string'?x.note.trim().slice(0,300):''});
  }
  return [...days.values()].sort((a,b)=>b.day.localeCompare(a.day)).slice(0,60);
}
export function rememberPandaDay(memories: PandaMemory[], memory: PandaMemory): PandaMemory[] {
  return sanitizePandaMemories([...memories.filter(m=>m.day!==memory.day), memory]);
}
const LETTERS = [
  'Bugün her şeyi yetiştirmen gerekmiyor. Küçük bir adım da ilerlemektir. Ben molanda buradayım.',
  'Bir soru zor geldiğinde bu senin yapamayacağın anlamına gelmez. Bir nefes alıp başka bir yoldan deneyebilirsin.',
  'Bugün kendine söylediğin sözler biraz daha nazik olsun. Emek veriyorsun; bunu fark etmeye değer.',
  'Bazen en iyi çalışma, kısa bir moladan sonra başlar. Omuzlarını gevşet, sonra birlikte devam ederiz.',
  'Başarılarını yalnızca netlerle ölçme. Anladığın bir kavram ve düzelttiğin bir hata da değerli.',
  'Burada acele yok. İstersen birkaç dakika dinlen, istersen bana gününden küçük bir anı bırak.',
  'Bugün güzel geçen küçük bir şeyi hatırla. Bu anı saklayabilir, sonra yeniden okuyabilirsin.',
];
export function pandaLetter(day: string): string {
  let hash=0; for(const c of day) hash=(hash*31+c.charCodeAt(0))>>>0;
  return LETTERS[hash%LETTERS.length];
}
