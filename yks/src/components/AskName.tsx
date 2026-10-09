import { useSelector } from '../store/store';

/** Türkçe yönelme eki: Cuma → Cuma'ya, Deniz → Deniz'e. */
export function dative(name: string): string {
  const n = name.trim();
  if (!n) return '';
  const vowels = n.toLocaleLowerCase('tr-TR').match(/[aeıioöuü]/g);
  const last = vowels?.[vowels.length - 1] ?? 'e';
  const back = 'aıou'.includes(last);
  const endsVowel = /[aeıioöuü]$/i.test(n);
  return `${n}’${endsVowel ? 'y' : ''}${back ? 'a' : 'e'}`;
}

/** "Cuma'ya sor" gibi, asistanın adıyla düğme metni. */
export function AskLabel() {
  const name = useSelector((s) => s.settings.teacherName) || 'Cuma';
  return <>{dative(name)} sor</>;
}
