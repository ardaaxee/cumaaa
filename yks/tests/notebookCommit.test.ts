import { expect,it,vi } from 'vitest';
import { setPageImage } from '../src/services/notebookStore';
it('defter yazımı ancak işlem kesinleşince tamamlanır, iptalde hata döner',async()=>{
 const transaction:any={objectStore:()=>({put:()=>request}),error:new Error('Yazım iptal')};
 const request:any={result:'saved'};
 const opening:any={result:{transaction:()=>transaction,close:vi.fn()}};
 vi.stubGlobal('indexedDB',{open:()=>opening});
 try {
  let completed=false;
  const saving=setPageImage('page','data:image/png;base64,AA').then(()=>{completed=true;});
  opening.onsuccess();await Promise.resolve();
  request.onsuccess();await Promise.resolve();expect(completed).toBe(false);
  transaction.oncomplete();await saving;expect(completed).toBe(true);
  const cancelled=setPageImage('page','data:image/png;base64,AA');
  const rejected=expect(cancelled).rejects.toThrow('Yazım iptal');
  opening.onsuccess();await Promise.resolve();transaction.onabort();await rejected;
 } finally {vi.unstubAllGlobals();}
});
