import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import { pilotCourse } from '../lib/pilot.mjs';
import { validateModules } from '../lib/lms.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const journal = JSON.parse(read('drizzle/meta/_journal.json'));
assert.equal(new Set(journal.entries.map(e => e.idx)).size, journal.entries.length);
assert.equal(new Set(journal.entries.map(e => e.tag)).size, journal.entries.length);
const sql = new DatabaseSync(':memory:');
sql.exec(read('drizzle/' + journal.entries[0].tag + '.sql'));
const legacy = structuredClone(pilotCourse.modules);
for(const module of legacy)for(const lesson of module.lessons){lesson.quiz.splice(1);delete lesson.materials;}
sql.prepare('INSERT INTO courses(id,title,body,updated) VALUES(?,?,?,?)').run(pilotCourse.id, pilotCourse.title, JSON.stringify(legacy), '2026-10-15');
sql.prepare('INSERT INTO people(id,login_email,email,name,ra,created) VALUES(?,?,?,?,?,?)').run('original-user','osmar.cabral@bugbusters.com.br','osmar.cabral@bugbusters.com.br','Osmar Cabral','AC-OLD','2026-10-15');
sql.prepare('INSERT INTO enrollments VALUES(?,?,?)').run('original-user',pilotCourse.id,'2026-10-15');
sql.prepare('INSERT INTO progress VALUES(?,?,?,?,?,?,?)').run('original-user',pilotCourse.id,'pilot-l1',42,1,100,'2026-10-15');
sql.prepare('INSERT INTO certificates VALUES(?,?,?,?,?,?)').run('original-certificate','original-user',pilotCourse.id,'pilot-m1','{"ra":"AC-OLD"}','2026-10-15');
const history = ['enrollments','progress','certificates'].map(table => sql.prepare('SELECT * FROM ' + table).all());
for (const entry of journal.entries.slice(1)) sql.exec(read('drizzle/' + entry.tag + '.sql'));
const migrated = JSON.parse(sql.prepare('SELECT body FROM courses').get().body);
assert.deepEqual(migrated[0].lessons[0].quiz, pilotCourse.modules[0].lessons[0].quiz);
assert.deepEqual(migrated[0].lessons[0].materials, pilotCourse.modules[0].lessons[0].materials);
assert.deepEqual(migrated.slice(1), pilotCourse.modules.slice(1));
assert.deepEqual(['enrollments','progress','certificates'].map(table => sql.prepare('SELECT * FROM ' + table).all()), history);
assert.equal(sql.prepare('SELECT ra FROM people').get().ra,'AC-2026-0003');
assert.equal(validateModules(migrated, pilotCourse.id)[0].lessons[0].materials.length,1);
assert.throws(() => validateModules(migrated, 'other-course'), /Material não autorizado/);
sql.exec(read('drizzle/0004_aula01_video_and_quiz.sql'));
assert.equal(JSON.parse(sql.prepare('SELECT body FROM courses').get().body)[0].lessons[0].quiz.length,5);
assert(existsSync(new URL('../public/materials/portfolio-phishing-2026.pdf',import.meta.url)));
assert.equal(readFileSync(new URL('../public/materials/portfolio-phishing-2026.pdf',import.meta.url)).subarray(0,5).toString(),'%PDF-');
sql.close();

// Run the integrated UI submission helper: never grade partial answers or skip
// the video; expose server feedback and release the guard after a failed attempt.
const portal = read('public/portal.js');
const helper = portal.slice(portal.indexOf('let quizSubmitting='),portal.indexOf('function renderClassroom('));
let marked = 0, calls = 0, ended = false, highlighted = false;
const result = { textContent: '' }, button = { disabled: false };
const fields = Array.from({length:5},(_,i)=>({
  querySelector(selector) {
    if(selector==='input[type=radio]:checked')return i<marked?{closest:()=>({classList:{add:()=>{highlighted=true;}}})}:null;
    return null;
  }, querySelectorAll:()=>[],
}));
const form = {querySelectorAll:()=>fields,querySelector:()=>button};
const context = {
  S:{courses:[{id:'cyber-pilot',modules:pilotCourse.modules}]},courseId:'cyber-pilot',lessonId:'pilot-l1',
  lessons:c=>c.modules.flatMap(m=>m.lessons),
  $:selector=>selector==='#lessonVideo'?{}:result,
  FormData:class {get(){return '0';}},
  completeLesson:async()=>{calls++;return {passed:false,incorrect:[0]};},
};
Object.defineProperty(context,'videoEnded',{get:()=>ended});
vm.createContext(context);vm.runInContext(helper,context);
marked=4;await context.submitLessonQuiz(form);assert.equal(calls,0);
marked=5;await context.submitLessonQuiz(form);assert.equal(calls,0);assert.match(result.textContent,/terminar o vídeo/);
ended=true;await context.submitLessonQuiz(form);assert.equal(calls,1);assert(highlighted);assert.equal(button.disabled,false);
await context.submitLessonQuiz(form);assert.equal(calls,2);
assert(portal.includes("'static:aula-01-calma-dedo-nervoso-v2.mp4':'/assets/videos/modulo-01-aula-01.mp4'"));
assert(portal.includes('/assets/videos/modulo-02-aula-01.mp4'));
console.log('PASS: published content, complete migration chain, PDF, preserved history/videos, material restrictions and automatic quiz submission.');
