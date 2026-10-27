import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {handleLms} from '../lib/lms.mjs';
const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('./fixtures/local-drizzle/0000_brainy_dreaming_celestial.sql',import.meta.url),'utf8'));
class Statement{constructor(q,args=[]){this.q=q;this.args=args}bind(...args){return new Statement(this.q,args)}async run(){const r=sql.prepare(this.q).run(...this.args);return {success:true,meta:{changes:r.changes}}}async first(){return sql.prepare(this.q).get(...this.args)||null}async all(){return {results:sql.prepare(this.q).all(...this.args)}}}
const env={BOOTSTRAP_ADMIN_EMAILS:'elizeu.santos@bugbusters.com.br',DB:{prepare:q=>new Statement(q),batch:async stmts=>{sql.exec('BEGIN');try{const out=[];for(const s of stmts)out.push(await s.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}}};
const admin={id:'platform-admin',email:'elizeu.santos@bugbusters.com.br'},student={id:'platform-student',email:'student@example.com'},other={id:'platform-other',email:'other@example.com'};
async function call(path,method='GET',body,user=admin,status=200,origin='https://academy.test'){
 const headers={origin};if(user){headers['oai-authenticated-user-id']=user.id;headers['oai-authenticated-user-email']=user.email}if(body)headers['content-type']='application/json';
 const r=await handleLms(new Request('https://academy.test/api/lms/'+path,{method,headers,body:body?JSON.stringify(body):undefined}),env);const data=await r.json();assert.equal(r.status,status,`${method} ${path}: ${JSON.stringify(data)}`);return data;
}

const initial=await call('bootstrap');await call('seed','POST',{});
let course=(await call('bootstrap')).courses.find(c=>c.id==='cyber-pilot');
const lesson3=course.modules[2].lessons[0];
assert.equal(lesson3.video,'static:modulo-03-aula-01.mp4');
assert.equal(lesson3.materials[0].url,'/materials/portfolio-identidade-confianca-2026.pdf');assert.equal(lesson3.quiz.length,5);
assert.equal(JSON.parse(sql.prepare('SELECT body FROM courses WHERE id=?').get(course.id).body)[2].lessons[0].video,'','Default video must work without rewriting stored courses.');
const p=await call('people','POST',{name:'Aluno vídeo 03',email:student.email,role:'student'},admin,201);
await call('enrollments','POST',{user:p.id,course:course.id});
assert((await call('bootstrap','GET',null,student)).courses[0].modules[2].lessons[0].locked);
for(const module of course.modules.slice(0,2)){
 const l=module.lessons[0];await call('progress','POST',{course:course.id,lesson:l.id,complete:true,answers:l.quiz.map(q=>q.answer),videoEnded:true},student);
}
assert.equal((await call('bootstrap','GET',null,student)).courses[0].modules[2].lessons[0].video,lesson3.video);
const answers=lesson3.quiz.map(q=>q.answer);
await call('progress','POST',{course:course.id,lesson:lesson3.id,complete:true,answers},student,400);
await call('certificates','POST',{course:course.id,module:'pilot-m3'},student,403);
assert(!(await call('bootstrap','GET',null,student)).progress.some(p=>p.lesson===lesson3.id&&p.done));
await call('progress','POST',{course:course.id,lesson:lesson3.id,complete:true,answers,videoEnded:true},student);
const cert=await call('certificates','POST',{course:course.id,module:'pilot-m3'},student);
assert.equal((await call('certificates/'+cert.id,'GET',null,student)).snapshot.module,'Identidade e confiança');
assert((await call('bootstrap','GET',null,student)).progress.some(p=>p.lesson===lesson3.id&&p.done));
await call('courses/'+course.id,'PATCH',course);
const wrong=structuredClone(course);wrong.modules[1].lessons[0].video=lesson3.video;await call('courses/'+course.id,'PATCH',wrong,admin,400);
sql.prepare('INSERT INTO assets VALUES(?,?,?,?,?,?,?,?)').run('custom-video-03',initial.me.id,course.id,'video','custom.mp4','video/mp4',123,'2026-10-23');
course.modules[2].lessons[0].video='custom-video-03';await call('courses/'+course.id,'PATCH',course);
await call('seed','POST',{});
assert.equal((await call('bootstrap')).courses.find(c=>c.id===course.id).modules[2].lessons[0].video,'custom-video-03','Never replace a custom upload.');
const file=readFileSync(new URL('../public/assets/videos/modulo-03-aula-01.mp4',import.meta.url));
assert(file.length<90*1024*1024);assert.equal(file.toString('ascii',4,8),'ftyp');
let at=0,moov=-1,mdat=-1;while(at+8<=file.length){const size=file.readUInt32BE(at),type=file.toString('ascii',at+4,at+8);if(type==='moov')moov=at;if(type==='mdat')mdat=at;if(size<8)break;at+=size;}
assert(moov>=0&&mdat>moov,'MP4 metadata precedes media for browser playback.');
sql.close();console.log('PASS: lesson 03 MP4, fast start, portfolio/quiz alignment, default for existing courses, video-end gate, certificate eligibility, editor allowlist, custom uploads and learning history.');
