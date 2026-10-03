// @vitest-environment jsdom
import {beforeEach,it,expect,vi} from 'vitest';
import {defaultState} from '../src/store/schema';
import {getState,replaceState} from '../src/store/store';
import {syncNow,getCloudStatus} from '../src/services/cloud';
const files=vi.hoisted(()=>new Map<string,string>());
vi.mock('../src/services/notebookStore',()=>({getPageImage:async(id:string)=>files.get(id)??null,setPageImages:async(entries:Record<string,string>)=>{for(const [id,image]of Object.entries(entries))files.set(id,image);}}));
const docs=new Map<string,unknown>();
const code='abcdefghijkmnopqrstuvwxyz12345';
let failPart=false;
beforeEach(()=>{
 files.clear();docs.clear();localStorage.clear();failPart=false;
 const state=defaultState();state.settings.cloud={projectId:'test-project',apiKey:'test-key',syncCode:code,shareCode:''};replaceState(state);
 vi.stubGlobal('fetch',vi.fn(async(url:string,init?:RequestInit)=>{
  const key=new URL(url).pathname.split('/').pop()!;
  if(init?.method==='PATCH'){
   if(failPart&&key.includes('-p'))return new Response('{}',{status:503});
   docs.set(key,JSON.parse(init.body as string));return new Response('{}');
  }
  return docs.has(key)?new Response(JSON.stringify(docs.get(key))):new Response('{}',{status:404});
 }));
});
it('sync uploads actual ink and restores it together with linked page metadata on another device',async()=>{
 const state=getState();state.notebookPages=[{id:'note',title:'Soru notu',topicId:'topic',questionId:'q',createdAt:'2026-10-03',updatedAt:'2026-10-03'}];replaceState(state);
 const image='data:image/png;base64,AAAA';files.set('note',image);
 await syncNow();expect(getCloudStatus().error).toBeNull();
 const uploaded=JSON.parse((docs.get(code) as any).fields.part0.stringValue);
 expect(uploaded.notebookImages.note).toBe(image);
 const other=defaultState();other.settings.cloud=state.settings.cloud;files.clear();replaceState(other);
 await syncNow();expect(files.get('note')).toBe(image);expect(getState().notebookPages[0].questionId).toBe('q');
});
it('an interrupted chunk upload leaves the previous remote snapshot readable',async()=>{
 await syncNow();const previous=JSON.stringify(docs.get(code));
 const state=getState();state.notebookPages=[{id:'big',title:'Big',createdAt:'2026-10-03',updatedAt:'2026-10-03'}];replaceState(state);files.set('big','data:image/png;base64,'+'A'.repeat(400_000));
 failPart=true;await syncNow();expect(getCloudStatus().error).toContain('503');expect(JSON.stringify(docs.get(code))).toBe(previous);
});
it('legacy state-only snapshots remain compatible and never erase local ink',async()=>{
 const state=getState();state.notebookPages=[{id:'note',title:'legacy',createdAt:'2026-10-01',updatedAt:'2026-10-01'}];files.set('note','data:image/png;base64,AAAA');replaceState(state);
 docs.set(code,{fields:{part0:{stringValue:JSON.stringify(state)},parts:{stringValue:'1'},updatedAt:{stringValue:'2026-10-03'}}});
 await syncNow();expect(getCloudStatus().error).toBeNull();expect(files.get('note')).toBe('data:image/png;base64,AAAA');
});
