export function normalizeMenuQuery(value:string):string {
  return value.toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
}
export function filterMenu<T extends {label:string;path:string}>(items:T[], query:string):T[] {
  const terms=normalizeMenuQuery(query).split(/\s+/).filter(Boolean);
  return items.filter(item=>terms.every(term=>normalizeMenuQuery(item.label+' '+item.path).includes(term)));
}
export function menuGroup(path:string):string {
  if (['/','/dersler','/calis','/testler','/denemeler','/odak','/plan','/koc','/tekrar','/ogretmen','/cikmis'].includes(path)) return 'Çalışma';
  if (['/yanlislar','/gelisim','/karne','/rozetler','/kaydedilenler'].includes(path)) return 'Takip';
  return 'Araçlar';
}
