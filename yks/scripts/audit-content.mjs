import {readdirSync,writeFileSync,mkdirSync} from 'node:fs';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
async function modules(folder){const result=[];for(const file of readdirSync(join(root,'src/data',folder)).filter(f=>f.endsWith('.ts')&&f!=='index.ts').sort())result.push(await import(pathToFileURL(join(root,'src/data',folder,file)).href));return result;}
const subjects=(await modules('curriculum')).map(m=>m.subject).filter(Boolean);
const questions=(await modules('questions')).flatMap(m=>m.questions??[]);
const lessons=(await modules('lessons')).flatMap(m=>m.lessons??[]);
const issues=[];const ids=new Set();const topics=new Map(subjects.flatMap(s=>s.units.flatMap(u=>u.topics.map(t=>[t.id,{...t,subject:s.id}]))));
const normalize=s=>s.trim().replace(/\s+/g,' ');
for(const q of questions){
 if(ids.has(q.id))issues.push(`${q.id}: yinelenen kimlik`);ids.add(q.id);
 const topic=topics.get(q.topic);
 if(!topic)issues.push(`${q.id}: konu yok`);
 if(!topic?.subtopics.some(s=>s.id===q.subtopic))issues.push(`${q.id}: alt konu eşleşmiyor`);
 if(!Number.isInteger(q.correctAnswer)||q.correctAnswer<0||q.correctAnswer>4)issues.push(`${q.id}: cevap anahtarı geçersiz`);
 if(q.options.length!==5||q.options.some(o=>!o.trim()))issues.push(`${q.id}: seçenek eksik`);
 if(new Set(q.options.map(normalize)).size!==5)issues.push(`${q.id}: aynı seçenek tekrarlanıyor`);
 for(const key of ['question','solution','hint','commonMistake','outcome'])if(!q[key]?.trim()||/\bTODO\b|lorem ipsum|yer tutucu/i.test(q[key]))issues.push(`${q.id}: ${key} tamamlanmamış`);
}
const lessonIds=new Set();for(const lesson of lessons){if(lessonIds.has(lesson.topicId))issues.push(`${lesson.topicId}: yinelenen anlatım`);lessonIds.add(lesson.topicId);if(!topics.has(lesson.topicId))issues.push(`${lesson.topicId}: anlatımın konusu yok`);for(const ex of lesson.examples??[])if(!ex.problem?.trim()||!ex.answer?.trim()||!ex.steps?.length||ex.steps.some(s=>!s.trim()))issues.push(`${lesson.topicId}: örnek çözüm eksik`);}
for(const [id,t] of topics){if(!lessonIds.has(id))issues.push(`${id}: anlatım eksik`);for(const sub of t.subtopics)if(!questions.some(q=>q.subtopic===sub.id))issues.push(`${sub.id}: soru eksik`);}
const rows=subjects.map(s=>{const ids=s.units.flatMap(u=>u.topics.map(t=>t.id));return {subject:s.id,topics:ids.length,subtopics:s.units.flatMap(u=>u.topics.flatMap(t=>t.subtopics)).length,lessons:lessons.filter(l=>ids.includes(l.topicId)).length,questions:questions.filter(q=>ids.includes(q.topic)).length};});
const report={scope:'Tüm derslerde yapısal tutarlılık, konu/alt konu kapsaması, seçenek ve cevap indisi bütünlüğü, çözümlü örneklerin doluluğu.',limitation:'Bu denetim tüm cevapların bilimsel doğruluğunu kanıtlamaz. Bağımsız sayısal kontroller tests/numericalContent.test.ts içinde ayrı yürütülür; kalan içerik uzman incelemesi gerektirir.',totals:{subjects:subjects.length,topics:topics.size,lessons:lessons.length,questions:questions.length},subjects:rows,issues};
mkdirSync(join(root,'docs'),{recursive:true});writeFileSync(join(root,'docs/content-audit.json'),JSON.stringify(report,null,2)+'\n');console.table(rows);console.log(`İçerik denetimi: ${issues.length} yapısal sorun.`);if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}
