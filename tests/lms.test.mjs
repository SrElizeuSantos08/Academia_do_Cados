import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {handleLms} from '../lib/lms.mjs';
const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../drizzle/0000_brainy_dreaming_celestial.sql',import.meta.url),'utf8'));sql.exec(readFileSync(new URL('../drizzle/0001_pilot_lesson_video.sql',import.meta.url),'utf8'));sql.exec(readFileSync(new URL('../drizzle/0002_pilot_phishing_material.sql',import.meta.url),'utf8'));sql.exec(readFileSync(new URL('../drizzle/0003_fix_phishing_material_path.sql',import.meta.url),'utf8'));sql.exec(readFileSync(new URL('../drizzle/0004_aula01_video_and_quiz.sql',import.meta.url),'utf8'));
sql.exec(readFileSync(new URL('../drizzle/0005_learning_community_tutor.sql',import.meta.url),'utf8'));
class Statement{constructor(q,args=[]){this.q=q;this.args=args}bind(...args){return new Statement(this.q,args)}async run(){const r=sql.prepare(this.q).run(...this.args);return {success:true,meta:{changes:r.changes}}}async first(){return sql.prepare(this.q).get(...this.args)||null}async all(){return {results:sql.prepare(this.q).all(...this.args)}}}
const env={BOOTSTRAP_ADMIN_EMAILS:'admin@example.com',DB:{prepare:q=>new Statement(q),batch:async stmts=>{sql.exec('BEGIN');try{const out=[];for(const s of stmts)out.push(await s.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}}};
const admin={id:'platform-admin',email:'admin@example.com'},student={id:'platform-student',email:'student@example.com'},other={id:'platform-other',email:'other@example.com'};
async function call(path,method='GET',body,user=admin,status=200,origin='https://academy.test'){
 const headers={origin};if(user){headers['oai-authenticated-user-id']=user.id;headers['oai-authenticated-user-email']=user.email}if(body)headers['content-type']='application/json';
 const r=await handleLms(new Request('https://academy.test/api/lms/'+path,{method,headers,body:body?JSON.stringify(body):undefined}),env);const data=await r.json();assert.equal(r.status,status,`${method} ${path}: ${JSON.stringify(data)}`);return data;
}
await call('bootstrap','GET',null,null,401);await call('bootstrap','GET',null,other,403);
let boot=await call('bootstrap');assert.equal(boot.me.role,'admin');const adminId=boot.me.id;
const p=await call('people','POST',{name:'Aluno de Teste',email:student.email,role:'student'},admin,201);await call('people','POST',{name:'Duplicado',email:student.email},admin,409);
boot=await call('bootstrap','GET',null,student);assert.equal(boot.me.id,p.id);assert.match(boot.me.ra,/^AC-/);assert.equal(boot.courses.length,0);
await call('people','POST',{name:'Intruso',email:'intruso@example.com'},student,403);
await call('people/'+adminId,'PATCH',{role:'student'},admin,400);
await call('seed','POST',{});await call('seed','POST',{});await call('courses','POST',{title:'Curso material não autorizado',folder:'Cyber',sort:3,published:0,modules:[{id:'unauth-m',title:'Módulo',hours:1,lessons:[{id:'unauth-l',title:'Aula',description:'',minutes:10,video:'',materials:[{title:'Link externo',url:'https://malicioso.example'}],quiz:[]}]}]},admin,400);boot=await call('bootstrap');assert.equal(boot.courses.length,1);assert.equal(boot.courses[0].modules.length,8);assert.equal(boot.courses[0].modules[0].lessons[0].video,'static:aula-01-calma-dedo-nervoso-v2.mp4');assert.equal(boot.courses[0].modules[0].lessons[0].quiz.length,5);assert.deepEqual(boot.courses[0].modules[0].lessons[0].materials,[{title:'Portfólio didático · Phishing nos dias atuais (PDF)',url:'/materials/portfolio-phishing-2026.pdf'}]);
// An existing one-question course is updated once without losing its first question.
const legacy=structuredClone(boot.courses[0].modules);legacy[0].lessons[0].quiz=legacy[0].lessons[0].quiz.slice(0,1);legacy[0].lessons[0].video='static:aula-01-calma-dedo-nervoso.mp4';
sql.prepare('UPDATE courses SET body=? WHERE id=?').run(JSON.stringify(legacy),'cyber-pilot');
const upgrade=readFileSync(new URL('../drizzle/0004_aula01_video_and_quiz.sql',import.meta.url),'utf8');sql.exec(upgrade);sql.exec(upgrade);
boot=await call('bootstrap');assert.equal(boot.courses[0].modules[0].lessons[0].quiz.length,5);assert.equal(boot.courses[0].modules[0].lessons[0].quiz[0].question,legacy[0].lessons[0].quiz[0].question);assert.equal(boot.courses[0].modules[0].lessons[0].video,'static:aula-01-calma-dedo-nervoso-v2.mp4');
const course=boot.courses[0];await call('progress','POST',{course:course.id,lesson:'pilot-l1',complete:true,answers:[1]},student,403);
await call('enrollments','POST',{user:p.id,course:course.id});
boot=await call('bootstrap','GET',null,student);assert.equal(boot.courses.length,1);assert.equal(boot.courses[0].modules[1].lessons[0].description,'');assert.equal(boot.courses[0].modules[0].lessons[0].quiz[0].answer,undefined);assert.equal(boot.courses[0].modules[0].lessons[0].materials[0].url,'/materials/portfolio-phishing-2026.pdf');
await call('progress','POST',{course:course.id,lesson:'pilot-l2',complete:true,answers:[2]},student,403);
await call('certificates','POST',{course:course.id,module:'pilot-m1'},student,403);
await call('progress','POST',{course:course.id,lesson:'pilot-l1',complete:true,answers:[1],videoEnded:true},student,400);
await call('progress','POST',{course:course.id,lesson:'pilot-l1',complete:true,answers:[1,2,0,2,1]},student,400);
const wrong=await call('progress','POST',{course:course.id,lesson:'pilot-l1',complete:true,answers:[1,2,0,0,0],videoEnded:true},student);assert.equal(wrong.passed,false);assert.equal(wrong.score,60);assert.deepEqual(wrong.incorrect,[3,4]);
const passed=await call('progress','POST',{course:course.id,lesson:'pilot-l1',complete:true,answers:[1,2,0,2,0],videoEnded:true},student);assert.equal(passed.score,80);assert.equal(passed.passed,true);
const cert=await call('certificates','POST',{course:course.id,module:'pilot-m1'},student);const again=await call('certificates','POST',{course:course.id,module:'pilot-m1'},student);assert.equal(cert.id,again.id);
const verified=await call('certificates/'+cert.id,'GET',null,student);assert.equal(verified.snapshot.name,'Aluno de Teste');assert.equal(verified.snapshot.hours,.25);assert.equal(verified.snapshot.course,course.title);
await call('people/'+p.id,'PATCH',{name:'Nome Atualizado',email:'contato@example.com'},student);assert.equal((await call('certificates/'+cert.id,'GET',null,student)).snapshot.name,'Aluno de Teste');
await call('people/'+p.id,'PATCH',{role:'admin'},student);assert.equal((await call('bootstrap','GET',null,student)).me.role,'student');
await call('people/'+p.id,'PATCH',{login_email:'newlogin@example.com'},admin,400);
await call('forum?course='+course.id,'POST',{text:'Minha dúvida sobre phishing.'},student,201);let messages=await call('forum?course='+course.id,'GET',null,student);assert.equal(messages.length,1);assert.equal(messages[0].name,'Nome Atualizado');
await call('forum?course='+course.id,'POST',{text:'Arquivo alheio',asset:'unknown'},student,400);
const ticket=await call('tickets','POST',{course:course.id,teacher:adminId,subject:'Preciso de ajuda',text:'Como continuar?'},student,201);await call('tickets/'+ticket.id,'POST',{text:'Revise o módulo de autenticação.'},admin);const ts=await call('tickets','GET',null,student);assert.equal(ts.replies.length,2);
const p2=await call('people','POST',{name:'Outro Aluno',email:other.email},admin,201);await call('tickets/'+ticket.id,'POST',{text:'Invasão'},other,403);await call('certificates/'+cert.id,'GET',null,other,403);
await call('progress','POST',{course:course.id,lesson:'pilot-l1',position:23},student);boot=await call('bootstrap','GET',null,student);assert.equal(boot.progress[0].position,23);assert.equal(boot.progress[0].done,1);assert(boot.notifications.length>0);
await call('notifications','POST',{},student);assert((await call('bootstrap','GET',null,student)).notifications.every(n=>n.read));
await call('courses','POST',{title:'Curso seguinte',folder:course.folder,sort:2,published:1,modules:[{id:'next-m',title:'Módulo',hours:2,lessons:[{id:'next-l',title:'Introdução',description:'Texto',minutes:20,quiz:[]}]}]},admin);boot=await call('bootstrap');const next=boot.courses.find(c=>c.title==='Curso seguinte');await call('enrollments','POST',{user:p.id,course:next.id});assert((await call('bootstrap','GET',null,student)).courses.find(c=>c.id===next.id).locked);await call('progress','POST',{course:next.id,lesson:'next-l',complete:true},student,403);
for(let i=1;i<8;i++){const l=course.modules[i].lessons[0];await call('progress','POST',{course:course.id,lesson:l.id,complete:true,answers:l.quiz.map(q=>q.answer)},student)}
assert.equal((await call('bootstrap','GET',null,student)).courses.find(c=>c.id===next.id).locked,false);await call('certificates','POST',{course:course.id,module:'course'},student);await call('progress','POST',{course:next.id,lesson:'next-l',complete:true},student);
const truncated=structuredClone(course);truncated.modules.splice(0,1);await call('courses/'+course.id,'PATCH',truncated,admin,409);
await call('robot','PATCH',{enabled:true},admin);
await call('people','POST',{name:'CSRF',email:'csrf@example.com'},admin,403,'https://attacker.test');
await call('enrollments','POST',{user:p.id,course:course.id,remove:true});await call('forum?course='+course.id,'GET',null,student,403);await call('courses/'+next.id,'DELETE',null,admin);assert.equal((await call('bootstrap','GET',null,student)).courses.length,0);
await call('people/'+p.id,'PATCH',{active:false},admin);await call('bootstrap','GET',null,student,403);
console.log('PASS: authentication, admin roles, roster, enrollment, ordered course/lesson release, quiz grading, resume, certificate eligibility/idempotency/snapshot, forum isolation, support privacy, notices, archiving, disabled users and CSRF.');
// File storage contract: raw streams, allowlisted types, author/course access and byte ranges.
class FixedLengthStreamMock{constructor(size){let received=0;const stream=new TransformStream({transform(chunk,controller){received+=chunk.byteLength;if(received>size)throw new Error('length');controller.enqueue(chunk)},flush(){if(received!==size)throw new Error('length')}});this.readable=stream.readable;this.writable=stream.writable}}
globalThis.FixedLengthStream=FixedLengthStreamMock;
const objects=new Map();env.BUCKET={async put(key,stream,options){const bytes=new Uint8Array(await new Response(stream).arrayBuffer());objects.set(key,{bytes,type:options.httpMetadata.contentType})},async delete(key){objects.delete(key)},async get(key,options){const o=objects.get(key);if(!o)return null;if(options?.range?.get('range')){const [,a,b]=options.range.get('range').match(/bytes=(\d+)-(\d+)/);return {body:o.bytes.slice(+a,+b+1),range:{offset:+a,length:+b-+a+1}}}return {body:o.bytes}}};
async function rawUpload(scope,course,type,contents,user=admin,expected=201,stated=contents.length){const r=await handleLms(new Request(`https://academy.test/api/lms/assets?scope=${scope}&course=${course}`,{method:'POST',headers:{origin:'https://academy.test','oai-authenticated-user-id':user.id,'oai-authenticated-user-email':user.email,'content-type':type,'x-file-name':'teste','x-file-size':String(stated)},body:contents}),env);const d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));return d}
await rawUpload('photo','','image/svg+xml','<svg/>',admin,400);
await rawUpload('photo','','image/png','123',admin,413,21*1024*1024);
await rawUpload('photo','','image/png','123',admin,400,4);
const photo=await rawUpload('photo','','image/png','1234');assert.equal(photo.size,4);
await call('people/'+adminId,'PATCH',{photo:photo.id});
await call('enrollments','POST',{user:p2.id,course:course.id});
const doc=await rawUpload('forum',course.id,'application/pdf','documento',other);assert.equal(doc.size,9);
const fileResponse=await handleLms(new Request('https://academy.test/api/lms/assets/'+doc.id,{headers:{'oai-authenticated-user-id':admin.id,'oai-authenticated-user-email':admin.email,range:'bytes=0-3'}}),env);assert.equal(fileResponse.status,206);assert.equal(await fileResponse.text(),'docu');assert.equal(fileResponse.headers.get('content-range'),'bytes 0-3/9');
await rawUpload('video',course.id,'video/mp4','1234',other,403);
const vid=await rawUpload('video',course.id,'video/mp4','1234');
await call('assets/'+vid.id,'GET',null,other,403);
await call('enrollments','POST',{user:p2.id,course:course.id,remove:true});const ownFile=await handleLms(new Request('https://academy.test/api/lms/assets/'+doc.id,{headers:{'oai-authenticated-user-id':other.id,'oai-authenticated-user-email':other.email}}),env);assert.equal(ownFile.status,200);assert.equal(await ownFile.text(),'documento'); // author retains access to their own attachment
console.log('PASS: streamed files, size/type validation, interrupted uploads, profile photos, attachment authorship, video authorization and range delivery.');

export {env,call,admin,student,other,sql,course,p,p2,cert,doc,rawUpload};
