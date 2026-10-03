// @vitest-environment jsdom
import {act,createElement} from 'react';
import {createRoot} from 'react-dom/client';
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import {getState,update} from '../src/store/store';
import TeacherPage from '../src/pages/TeacherPage';
import {assistantReply} from '../src/services/localAssistant';
import {loadLesson} from '../src/data/content';
const routeDetails=vi.hoisted(()=>({query:new URLSearchParams()}));
vi.mock('../src/hooks/useRoute',()=>({useRoute:()=>routeDetails,navigate:vi.fn()}));
vi.mock('../src/services/ai',()=>({checkAiStatus:()=>new Promise(()=>{}),askTeacher:vi.fn()}));
vi.mock('../src/services/localAssistant',()=>({assistantReply:vi.fn()}));
vi.mock('../src/data/content',()=>({loadLesson:vi.fn(),loadQuestionsByIds:vi.fn()}));
let host:HTMLDivElement;let root:ReturnType<typeof createRoot>;
beforeEach(()=>{routeDetails.query=new URLSearchParams();vi.useFakeTimers();Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});HTMLElement.prototype.scrollTo=vi.fn();update(s=>({...s,chat:[]}));host=document.createElement('div');document.body.append(host);root=createRoot(host);vi.mocked(loadLesson).mockResolvedValue({summary:['Konu özeti']} as never);});
afterEach(async()=>{await act(()=>root.unmount());host.remove();vi.useRealTimers();vi.clearAllMocks();});
it('allows local teaching while the AI check is pending and prevents double sends',async()=>{
 let finish!:(value:string)=>void;vi.mocked(assistantReply).mockReturnValue(new Promise(resolve=>{finish=resolve;}));
 await act(()=>root.render(createElement(TeacherPage)));
 const button=[...host.querySelectorAll('button')].find(b=>b.textContent==='Sıfırdan anlat')!;
 expect(button.disabled).toBe(false);
 await act(()=>{button.click();button.click();});
 expect(assistantReply).toHaveBeenCalledTimes(1);expect(getState().chat.filter(m=>m.role==='user')).toHaveLength(1);
 await act(async()=>{finish('Örnek yanıt');await Promise.resolve();await vi.advanceTimersByTimeAsync(500);});
 expect(getState().chat.filter(m=>m.role==='teacher')).toHaveLength(1);
});
it('keeps failed requests recoverable without duplicating the user message',async()=>{
 vi.mocked(assistantReply).mockRejectedValueOnce(new Error('Geçici hata')).mockResolvedValueOnce('Kurtarıldı');
 await act(()=>root.render(createElement(TeacherPage)));
 await act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='Sıfırdan anlat')!.click());
 expect(host.querySelector('[role="alert"]')?.textContent).toContain('Geçici hata');
 await act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='Tekrar dene')!.click());
 await act(()=>vi.advanceTimersByTimeAsync(500));
 expect(getState().chat.filter(m=>m.role==='user')).toHaveLength(1);
 expect(getState().chat.find(m=>m.role==='teacher')?.text).toBe('Kurtarıldı');
});

it('waits for the selected lesson before starting an automatic explanation',async()=>{
 routeDetails.query=new URLSearchParams('konu=aytkim-elektrokimya&eylem=anlat');
 let finish!:(value:never)=>void;vi.mocked(loadLesson).mockReturnValue(new Promise(resolve=>{finish=resolve;}));
 vi.mocked(assistantReply).mockResolvedValue('Konu hazır');
 await act(()=>root.render(createElement(TeacherPage)));
 await act(()=>vi.advanceTimersByTimeAsync(1000));
 expect(assistantReply).not.toHaveBeenCalled();
 const lesson={summary:['Tam konu özeti']};
 await act(async()=>{finish(lesson as never);await Promise.resolve();});
 await act(()=>vi.advanceTimersByTimeAsync(500));
 await act(()=>vi.advanceTimersByTimeAsync(500));
 expect(assistantReply).toHaveBeenCalledTimes(1);
 expect(vi.mocked(assistantReply).mock.calls[0][0].lesson).toEqual(lesson);
});
