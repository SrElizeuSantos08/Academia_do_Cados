import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import {env,call,student,sql,p} from './lms.test.mjs';
import {handleLms} from '../lib/lms.mjs';
let w=new Window({url:'https://academy.test/aluno.html',settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableComputedStyleRendering:true}});
const players=[];
class Player{
 constructor(frame){this.frame=frame;this.events={};this.seeks=[];this.destroyed=false;players.push(this);}
 on(name,fn){this.events[name]=fn;} ready(){return Promise.resolve();}
 requestFullscreen(){this.fullscreens=(this.fullscreens||0)+1;return Promise.resolve();} getDuration(){return Promise.resolve(180);} setCurrentTime(n){this.seeks.push(n);return Promise.resolve(n);}
 destroy(){this.destroyed=true;return Promise.resolve();}
}
const tick=()=>new Promise(r=>setTimeout(r,15));
async function until(fn,label){for(let i=0;i<200;i++){if(fn())return;await tick();}throw Error('Timed out: '+label);}
try{
 w.document.write(readFileSync(new URL('../public/portal.html',import.meta.url),'utf8'));
 w.Vimeo={Player};w.structuredClone=structuredClone;w.confirm=()=>true;w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.eval(readFileSync(new URL('../public/lesson-media.js',import.meta.url),'utf8'));
 const media=w.AcademyLessonMedia;
 const expected=[['1244243146','2ab050e76e'],['1240759697','5209f45e77'],['1240759742','acd99189ac'],['1240759746','00d17b69d2'],['1240759756','1475053a38'],['1240759701','f61ec9af87'],['1240759699','dcaaaa4c6b'],['1240759698','a7469a7845']];
 for(const [i,[id,hash]] of expected.entries()){
  const lesson='pilot-l'+(i+1),entry=media.forLesson('cyber-pilot',lesson),url=new URL(entry.url);
  assert.equal(url.origin,'https://player.vimeo.com');assert.equal(url.pathname,'/video/'+id);assert.equal(url.searchParams.get('h'),hash);
  assert.equal(url.searchParams.get('dnt'),'1');assert(!url.searchParams.has('fl'));assert(!url.searchParams.has('fe'));
  const box=w.document.createElement('div');box.innerHTML=media.markup(entry,'cyber-pilot',lesson);
  assert.equal(box.querySelector('iframe').dataset.lesson,lesson);assert(box.querySelector('iframe').title.includes(String(i+1).padStart(2,'0')));
 }
 assert.equal(media.forLesson('cyber-pilot','pilot-l9'),null);assert.equal(media.forLesson('cyber-pilot','__proto__'),null);
 assert.equal(media.forLesson('cyber-intermediate','pilot-l1'),null);
 const intermediateIds=['1243758673','1243758644','1243758674','1243758641','1243758640','1243758642'];
 for(const [i,id] of intermediateIds.entries()){
  const lesson='intermediate-l'+(i+1),entry=media.forLesson('cyber-intermediate',lesson),url=new URL(entry.url);
  assert.equal(url.pathname,'/video/'+id);assert.equal(url.origin,'https://player.vimeo.com');assert.equal(url.searchParams.get('dnt'),'1');
  for(const tracking of ['h','share','autoplay'])assert(!url.searchParams.has(tracking));
  assert.equal(entry.publicUrl,'https://vimeo.com/'+id);assert(entry.title.includes('Segurança Digital no Trabalho'));
  assert(entry.title.includes(String(i+1).padStart(2,'0')));
 }
 assert.equal(media.forLesson('cyber-intermediate','__proto__'),null);assert.equal(media.forLesson('cyber-intermediate','intermediate-l7'),null);
 assert.equal(media.forLesson('cyber-pilot','intermediate-l1'),null);assert.equal(media.forLesson('unknown','intermediate-l1'),null);
 const trial=media.forLesson('cyber-pilot','pilot-l1');
 assert.equal(new URL(trial.url).origin,'https://player.vimeo.com');
 assert.equal(new URL(trial.url).searchParams.get('h'),'2ab050e76e');
 assert.equal(new URL(trial.url).searchParams.get('dnt'),'1');
 assert(!trial.url.includes('/manage/'));
 assert.equal(new URL(trial.url).searchParams.get('playsinline'),'0');
 assert.equal(new URL(trial.url).searchParams.get('fullscreen'),'1');
 const mobileBox=w.document.createElement('div');mobileBox.innerHTML=media.markup(trial,'cyber-pilot','pilot-l1');w.document.body.append(mobileBox);
 const mobileFrame=mobileBox.querySelector('iframe'),mobileButton=mobileBox.querySelector('[data-vimeo-fullscreen]');
 assert(mobileFrame.allow.includes('fullscreen'));assert(mobileFrame.hasAttribute('webkitallowfullscreen'));assert(mobileButton.disabled);
 let completedFromFullscreen=0;const mobile=media.mount(mobileFrame,{onEnded:()=>completedFromFullscreen++});await mobile.ready;
 assert.equal(mobileButton.disabled,false);const mobilePlayer=players.at(-1);mobileButton.click();await tick();
 assert.equal(mobilePlayer.fullscreens,1);assert.equal(completedFromFullscreen,0);assert.equal(mobilePlayer.seeks.length,0);
 mobilePlayer.requestFullscreen=()=>Promise.reject(Error('Unsupported'));mobileButton.click();await tick();
 assert.match(mobileBox.querySelector('#vimeoOrientationHint').textContent,/gire o celular/);
 mobile.destroy();mobileButton.click();assert.equal(mobilePlayer.fullscreens,1);mobileBox.remove();

 sql.prepare('DELETE FROM progress WHERE user=?').run(p.id);
 sql.prepare('UPDATE people SET active=1 WHERE id=?').run(p.id);
 sql.prepare('UPDATE courses SET published=1 WHERE id=?').run('cyber-pilot');
 sql.prepare('INSERT OR IGNORE INTO enrollments(user,course,created) VALUES(?,?,?)').run(p.id,'cyber-pilot',new Date().toISOString());
 await call('progress','POST',{course:'cyber-pilot',lesson:'pilot-l1',position:24},student);
 w.fetch=async(input,options={})=>{const headers=new Headers(options.headers);headers.set('origin','https://academy.test');headers.set('oai-authenticated-user-id',student.id);headers.set('oai-authenticated-user-email',student.email);return handleLms(new Request(new URL(String(input),'https://academy.test'),{...options,headers}),env);};
 for(const file of ['navigation.js','module-badges.js','certificate.js','portal.js'])w.eval(readFileSync(new URL('../public/'+file,import.meta.url),'utf8'));
 await until(()=>w.document.querySelector('[data-action="open-course"]'),'dashboard');
 w.document.querySelector('[data-action="open-course"][data-id="cyber-pilot"]').click();
 await until(()=>players.length&&w.document.querySelector('#lessonVimeo'),'Vimeo classroom');
 const frame=w.document.querySelector('#lessonVimeo'),player=players.at(-1);
 await until(()=>player.events.ended,'events attached');
 assert.equal(w.document.querySelector('#lessonVideo'),null);
 assert.equal(w.document.querySelectorAll('.quiz-question').length,5);
 assert(w.document.querySelector('.lesson-material'));
 const complete=w.document.querySelector('#completeLesson');
 assert(complete.disabled);
 assert.equal(Number(frame.dataset.position),24);
 await player.events.ended();assert(complete.disabled,'not finished before user playback');
 player.events.timeupdate({seconds:0});assert.equal(Number(frame.dataset.position),24,'loading must not erase resume');
 assert.equal(player.seeks.length,0,'no autoplay/seek before Play');
 await player.events.play();assert.deepEqual(player.seeks,[24]);
 player.events.timeupdate({seconds:37,duration:180});
 await until(()=>sql.prepare('SELECT position FROM progress WHERE user=? AND lesson=?').get(p.id,'pilot-l1')?.position===37,'progress saved');
 await player.events.ended();assert.equal(complete.disabled,false,'quiz released when Vimeo ends');
 assert.equal(sql.prepare('SELECT done FROM progress WHERE user=? AND lesson=?').get(p.id,'pilot-l1').done,0,'video end alone does not pass quiz');
 w.document.querySelector('[data-go="courses"]').click();await until(()=>player.destroyed,'player cleaned up');
 const before=Number(frame.dataset.position);player.events.timeupdate({seconds:99});assert.equal(Number(frame.dataset.position),before,'disposed events ignored');
 await call('seed','POST',{course:'cyber-intermediate'});
 sql.prepare('INSERT OR IGNORE INTO enrollments(user,course,created) VALUES(?,?,?)').run(p.id,'cyber-intermediate',new Date().toISOString());
 await call('courses/cyber-intermediate/availability','PATCH',{development:false});
 assert.equal((await call('bootstrap','GET',null,student)).courses.find(c=>c.id==='cyber-intermediate').locked,true,'basic prerequisite remains enforced');
 const basicModules=JSON.parse(sql.prepare('SELECT body FROM courses WHERE id=?').get('cyber-pilot').body);
 for(const l of basicModules.flatMap(m=>m.lessons))sql.prepare('INSERT OR REPLACE INTO progress VALUES(?,?,?,?,?,?,?)').run(p.id,'cyber-pilot',l.id,0,1,100,new Date().toISOString());
 const released=(await call('bootstrap','GET',null,student)).courses.find(c=>c.id==='cyber-intermediate');
 assert.equal(released.development,false);assert.equal(released.locked,false);assert.equal(released.modules[1].lessons[0].locked,true);
 const intermediateBody=sql.prepare('SELECT body FROM courses WHERE id=?').get('cyber-intermediate').body;
 await call('progress','POST',{course:'cyber-intermediate',lesson:'intermediate-l1',position:18},student);
 await w.happyDOM.abort();await w.close();
 w=new Window({url:'https://academy.test/aluno.html',settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableComputedStyleRendering:true}});
 w.document.write(readFileSync(new URL('../public/portal.html',import.meta.url),'utf8'));
 w.Vimeo={Player};w.structuredClone=structuredClone;w.confirm=()=>true;w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.fetch=async(input,options={})=>{const headers=new Headers(options.headers);headers.set('origin','https://academy.test');headers.set('oai-authenticated-user-id',student.id);headers.set('oai-authenticated-user-email',student.email);return handleLms(new Request(new URL(String(input),'https://academy.test'),{...options,headers}),env);};
 for(const file of ['lesson-media.js','navigation.js','module-badges.js','certificate.js','portal.js'])w.eval(readFileSync(new URL('../public/'+file,import.meta.url),'utf8'));
 await until(()=>w.document.querySelector('[data-action="open-course"][data-id="cyber-intermediate"]'),'released intermediate dashboard');
 w.document.querySelector('[data-action="open-course"][data-id="cyber-intermediate"]').click();
 await until(()=>w.document.querySelector('#lessonVimeo')?.dataset.course==='cyber-intermediate','intermediate Vimeo classroom');
 const intermediateFrame=w.document.querySelector('#lessonVimeo'),intermediatePlayer=players.at(-1);
 await until(()=>intermediatePlayer.events.ended,'intermediate SDK events');
 assert.equal(new URL(intermediateFrame.src).pathname,'/video/'+intermediateIds[0]);
 assert.equal(w.document.querySelectorAll('.quiz-question').length,5);assert(w.document.querySelector('.lesson-material').href.includes('portfolio-intermediario-01'));
 assert(w.document.querySelector('#completeLesson').disabled);
 await intermediatePlayer.events.play();assert.deepEqual(intermediatePlayer.seeks,[18]);
 intermediatePlayer.events.timeupdate({seconds:29});await intermediatePlayer.events.pause();
 await until(()=>sql.prepare('SELECT position FROM progress WHERE user=? AND course=? AND lesson=?').get(p.id,'cyber-intermediate','intermediate-l1')?.position===29,'intermediate progress saved');
 await intermediatePlayer.events.ended();assert.equal(w.document.querySelector('#completeLesson').disabled,false);
 assert.equal(sql.prepare('SELECT done FROM progress WHERE user=? AND course=? AND lesson=?').get(p.id,'cyber-intermediate','intermediate-l1').done,0,'intermediate video does not pass assessment');
 assert.equal(sql.prepare('SELECT body FROM courses WHERE id=?').get('cyber-intermediate').body,intermediateBody,'questions, portfolios and lesson content preserved');
 w.document.querySelector('[data-go="courses"]').click();await until(()=>intermediatePlayer.destroyed,'intermediate player cleaned up');
 console.log('PASS: fourteen correct Vimeo mappings, basic privacy hashes, accessible titles, no autoplay, both tracks resume/progress, quiz gating, unchanged portfolios, intermediate release/prerequisite and player cleanup.');
}finally{await w.happyDOM.abort();await w.close();}
