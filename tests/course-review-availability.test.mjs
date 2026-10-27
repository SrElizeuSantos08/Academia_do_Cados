import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import {env,call,admin,student,other,sql,course,p} from './lms.test.mjs';
import './enhancements.test.mjs';
import {handleLms} from '../lib/lms.mjs';
const rows=table=>sql.prepare('SELECT * FROM '+table+' ORDER BY rowid').all();
const baseline=rows('progress'),certificates=rows('certificates');
const review=await call('lesson-review?course='+course.id+'&lesson=pilot-l1','GET',null,student);
assert.equal(review.score,100);assert.equal(review.questions.length,5);assert.equal(review.questions[0].answer,course.modules[0].lessons[0].quiz[0].answer);
await call('lesson-review?course='+course.id+'&lesson=unknown','GET',null,student,404);
await call('lesson-review?course='+course.id+'&lesson=pilot-l1','GET',null,other,403);
await call('lesson-review?course='+course.id+'&lesson=pilot-l1','GET',null,null,401);
assert.deepEqual(rows('progress'),baseline);assert.deepEqual(rows('certificates'),certificates);

await call('seed','POST',{course:'cyber-intermediate'});const intermediate=(await call('bootstrap')).courses.find(c=>c.id==='cyber-intermediate');
const original=sql.prepare('SELECT * FROM courses WHERE id=?').get(intermediate.id);
const journal=JSON.parse(readFileSync(new URL('./fixtures/site-drizzle/meta/_journal.json',import.meta.url),'utf8'));
const migration=journal.entries.find(e=>e.tag.endsWith('_intermediate_development')).tag;
sql.exec(readFileSync(new URL('./fixtures/site-drizzle/'+migration+'.sql',import.meta.url),'utf8'));
sql.exec(readFileSync(new URL('./fixtures/site-drizzle/'+migration+'.sql',import.meta.url),'utf8'));
// Even without enrollment, students see only a locked outline of the developing track.
let boot=await call('bootstrap','GET',null,student),teaser=boot.courses.find(c=>c.id===intermediate.id);
assert(teaser.development&&teaser.locked);assert.equal(teaser.modules.length,6);assert.equal(teaser.certification,null);
assert(teaser.modules.every(m=>m.lessons.every(l=>!l.description&&!l.video&&!l.quiz.length&&!l.materials&&!l.scenario&&!l.decision)));
assert.equal((await call('bootstrap')).courses.find(c=>c.id===intermediate.id).modules[0].lessons[0].quiz.length,5);
assert(!(await call('auth/courses')).courses.some(c=>c.id===intermediate.id));
sql.exec('CREATE TABLE IF NOT EXISTS auth_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,started INTEGER NOT NULL)');
await call('auth/register','POST',{name:'Cadastro bloqueado',email:'not-created@example.test',course:intermediate.id},admin,400);
assert.equal(sql.prepare('SELECT id FROM people WHERE login_email=?').get('not-created@example.test'),undefined);
await call('enrollments','POST',{user:p.id,course:intermediate.id});
for(const [endpoint,method,body] of [
 ['progress','POST',{course:intermediate.id,lesson:'intermediate-l1',position:3}],
 ['lesson-review?course='+intermediate.id+'&lesson=intermediate-l1','GET',null],
 ['forum?course='+intermediate.id,'GET',null],
 ['course-assessment?course='+intermediate.id,'GET',null],
 ['certificates','POST',{course:intermediate.id,module:'intermediate-m1'}],
 ['courses/'+intermediate.id+'/availability','PATCH',{development:false}],
])await call(endpoint,method,body,student,403);
assert.deepEqual(sql.prepare('SELECT * FROM courses WHERE id=?').get(intermediate.id),original);
assert.deepEqual(rows('progress'),baseline);assert.deepEqual(rows('certificates'),certificates);

const w=new Window({url:'https://academy.test/aluno.html',settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableComputedStyleRendering:true}});
let writes=0;const until=async(fn,label)=>{for(let i=0;i<120;i++){if(fn())return;await new Promise(r=>setTimeout(r,15))}throw Error('Timeout: '+label)};
try{
 w.document.write(readFileSync(new URL('../public/portal.html',import.meta.url),'utf8'));w.structuredClone=structuredClone;w.confirm=()=>true;w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.play=async()=>{};
 w.fetch=async(input,options={})=>{if(String(input).includes('/progress'))writes++;const headers=new Headers(options.headers);headers.set('origin','https://academy.test');headers.set('oai-authenticated-user-id',student.id);headers.set('oai-authenticated-user-email',student.email);return handleLms(new Request(new URL(String(input),'https://academy.test'),{...options,headers}),env)};
 for(const script of ['navigation.js','module-badges.js','certificate.js','portal.js'])w.eval(readFileSync(new URL('../public/'+script,import.meta.url),'utf8'));
 const d=w.document;await until(()=>d.querySelector('.learning-map'),'dashboard');
 const pending=[...d.querySelectorAll('.map-stop')].find(c=>c.textContent.includes(intermediate.title));assert(pending.textContent.includes('EM DESENVOLVIMENTO'));assert(pending.querySelector('button').disabled);
 d.querySelector('[data-go="courses"]').click();await until(()=>d.querySelector('[data-action="review-course"]'),'course review entry');
 const card=[...d.querySelectorAll('.course-card')].find(c=>c.textContent.includes(intermediate.title));assert(card.textContent.includes('Em desenvolvimento'));assert(!card.querySelector('[data-action="open-course"]'));assert(card.querySelector('button').disabled);
 d.querySelector('[data-action="review-course"][data-id="cyber-pilot"]').click();await until(()=>d.querySelector('#lessonReview h3'),'review comments');
 assert.equal(d.querySelector('#lessonVideo').dataset.lesson,'pilot-l1');assert(!d.querySelector('#lessonQuiz'));assert(!d.querySelector('#autoplayNext'));assert(d.querySelector('.lesson-review-notice').textContent.includes('Aula concluída'));assert(d.querySelector('#lessonReview').textContent.includes('Resposta correta'));
 const video=d.querySelector('#lessonVideo');Object.defineProperty(video,'duration',{value:100});video.currentTime=27;video.dispatchEvent(new w.Event('loadedmetadata'));assert.equal(video.currentTime,0);
 video.dispatchEvent(new w.Event('ended'));video.dispatchEvent(new w.Event('pause'));video.dispatchEvent(new w.Event('timeupdate'));await new Promise(r=>setTimeout(r,30));assert.equal(writes,0);assert.equal(d.querySelector('#lessonVideo').dataset.lesson,'pilot-l1');
 assert(d.querySelector('[data-action="open-lesson"][data-id="pilot-l1"]').textContent.includes('Rever aula'));
 d.querySelector('[data-action="open-lesson"][data-id="pilot-l2"]').click();await until(()=>d.querySelector('#lessonVideo')?.dataset.lesson==='pilot-l2'&&d.querySelector('#lessonReview h3'),'second completed module review');assert.equal(writes,0);
 assert.deepEqual(rows('progress'),baseline);assert.deepEqual(rows('certificates'),certificates);
}finally{await w.happyDOM.abort();await w.close()}
await call('courses/'+intermediate.id+'/availability','PATCH',{development:false});
assert(!(await call('bootstrap','GET',null,student)).courses.find(c=>c.id===intermediate.id).development);
await call('courses/'+intermediate.id+'/availability','PATCH',{development:true});
assert((await call('bootstrap','GET',null,student)).courses.find(c=>c.id===intermediate.id).development);
assert.deepEqual(rows('progress'),baseline);assert.deepEqual(rows('certificates'),certificates);
console.log('PASS: completed lessons reopen with video/material/comments, no grading/progress writes or automatic advancement; developing track stays visible/redacted and rejects student activity; staff can edit/release; history preserved.');
