import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {handleLms} from '../lib/lms.mjs';
const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('./fixtures/local-drizzle/0000_brainy_dreaming_celestial.sql',import.meta.url),'utf8'));
sql.exec(readFileSync(new URL('./fixtures/local-drizzle/0008_learning_community_tutor.sql',import.meta.url),'utf8'));sql.exec('CREATE TABLE auth_profiles(user TEXT PRIMARY KEY,company TEXT NOT NULL DEFAULT \"\",account_type TEXT NOT NULL DEFAULT \"student\")');
class Statement{constructor(q,args=[]){this.q=q;this.args=args}bind(...args){return new Statement(this.q,args)}async run(){const r=sql.prepare(this.q).run(...this.args);return {success:true,meta:{changes:r.changes}}}async first(){return sql.prepare(this.q).get(...this.args)||null}async all(){return {results:sql.prepare(this.q).all(...this.args)}}}
const env={MFA_ENCRYPTION_KEY:'b'.repeat(64),BOOTSTRAP_ADMIN_EMAILS:'admin@example.test',DB:{prepare:q=>new Statement(q),batch:async stmts=>{sql.exec('BEGIN');try{const out=[];for(const s of stmts)out.push(await s.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}}};
const admin={id:'platform-admin',email:'admin@example.test'},student={id:'platform-student',email:'student@example.com'},other={id:'platform-other',email:'other@example.com'};
async function call(path,method='GET',body,user=admin,status=200,origin='https://academy.test'){
 const headers={origin};if(user){headers['oai-authenticated-user-id']=user.id;headers['oai-authenticated-user-email']=user.email}if(body)headers['content-type']='application/json';
 const r=await handleLms(new Request('https://academy.test/api/lms/'+path,{method,headers,body:body?JSON.stringify(body):undefined}),env);const data=await r.json();assert.equal(r.status,status,`${method} ${path}: ${JSON.stringify(data)}`);return data;
}
await call('bootstrap','GET',null,null,401);await call('bootstrap','GET',null,other,403);
let boot=await call('bootstrap');assert.equal(boot.me.role,'admin');assert.equal(boot.me.ra,'AC-2026-0007');const adminId=boot.me.id;
const p=await call('people','POST',{name:'Aluno de Teste',email:student.email,role:'student'},admin,201);await call('people','POST',{name:'Duplicado',email:student.email},admin,409);
boot=await call('bootstrap','GET',null,student);assert.equal(boot.me.id,p.id);assert.equal(boot.me.ra,'AC-2026-0008');assert.equal(boot.courses.length,0);
await call('people','POST',{name:'Intruso',email:'intruso@example.com'},student,403);
await call('people/'+adminId,'PATCH',{role:'student'},admin,400);
await call('seed','POST',{});await call('seed','POST',{});boot=await call('bootstrap');assert.equal(boot.courses.length,1);assert.equal(boot.courses[0].modules.length,8);
const course=boot.courses[0];const savedMaterial=course.modules[0].lessons[0].materials[0];
const malicious=structuredClone(course);malicious.modules[0].lessons[0].materials[0].url='javascript:alert(1)';await call('courses/'+course.id,'PATCH',malicious,admin,400);
await call('courses/'+course.id,'PATCH',course);assert.deepEqual((await call('bootstrap')).courses[0].modules[0].lessons[0].materials[0],savedMaterial);
await call('progress','POST',{course:course.id,lesson:'pilot-l1',complete:true,answers:[1]},student,403);
const teacher={id:'platform-teacher',email:'approval-teacher@example.com'};const teacherRow=await call('people','POST',{name:'Professor de Teste',email:teacher.email,role:'teacher'},admin,201);const companyRow=await call('people','POST',{name:'Empresa Solicitante',email:'company@example.com',role:'student'},admin,201);sql.prepare('INSERT INTO auth_profiles(user,company,account_type) VALUES(?,?,?)').run(companyRow.id,'Empresa Teste','company');const studentRequest={id:'request-student',user:p.id,category:'student',course:course.id,status:'pending',created:new Date().toISOString()};const companyRequest={id:'request-company',user:companyRow.id,category:'company',course:course.id,status:'pending',created:new Date().toISOString()};sql.prepare('INSERT INTO settings(key,value) VALUES(?,?)').run('registration:'+p.id,JSON.stringify(studentRequest));sql.prepare('INSERT INTO settings(key,value) VALUES(?,?)').run('registration:'+companyRow.id,JSON.stringify(companyRequest));let queue=await call('registration-requests','GET',null,teacher);assert.deepEqual(queue.map(r=>r.category),['student']);await call('registration-requests/request-student','PATCH',{status:'approved'},teacher);await call('registration-requests/request-company','PATCH',{status:'approved',role:'teacher'},teacher,403);queue=await call('registration-requests');assert(queue.some(r=>r.category==='company'&&r.id===companyRow.id));await call('registration-requests/request-company','PATCH',{status:'approved',role:'teacher'});assert.equal((await call('bootstrap','GET',null,teacher)).me.role,'teacher');
boot=await call('bootstrap','GET',null,student);assert.equal(boot.courses.length,1);assert.equal(boot.courses[0].modules[1].lessons[0].description,'');assert.equal(boot.courses[0].modules[0].lessons[0].quiz[0].answer,undefined);
await call('progress','POST',{course:course.id,lesson:'pilot-l2',complete:true,answers:[2]},student,403);
await call('certificates','POST',{course:course.id,module:'pilot-m1'},student,403);
const firstLesson=course.modules[0].lessons[0];assert.equal(firstLesson.quiz.length,5);assert.equal(firstLesson.materials[0].url,'/materials/portfolio-phishing-2026.pdf');
await call('progress','POST',{course:course.id,lesson:'pilot-l1',complete:true,answers:[1]},student,400);
const wrong=await call('progress','POST',{course:course.id,lesson:'pilot-l1',complete:true,answers:[0,0,1,0,0]},student);assert.equal(wrong.passed,false);assert.deepEqual(wrong.incorrect,[0,1,2,3,4]);
assert.equal((await call('bootstrap','GET',null,student)).progress.some(p=>p.done),false);
await call('progress','POST',{course:course.id,lesson:'pilot-l1',complete:true,answers:firstLesson.quiz.map(q=>q.answer)},student);
const cert=await call('certificates','POST',{course:course.id,module:'pilot-m1'},student);const again=await call('certificates','POST',{course:course.id,module:'pilot-m1'},student);assert.equal(cert.id,again.id);
const verified=await call('certificates/'+cert.id,'GET',null,student);assert.equal(verified.snapshot.name,'Aluno de Teste');assert.equal(verified.snapshot.hours,.25);assert.equal(verified.snapshot.course,course.title);
await call('people/'+p.id,'PATCH',{name:'Nome Atualizado',email:'contato@example.com'},student);assert.equal((await call('certificates/'+cert.id,'GET',null,student)).snapshot.name,'Aluno de Teste');
await call('people/'+p.id,'PATCH',{role:'admin'},student);assert.equal((await call('bootstrap','GET',null,student)).me.role,'student');
await call('people/'+p.id,'PATCH',{login_email:'newlogin@example.com'},admin,400);
await call('forum?course='+course.id,'POST',{text:'Minha dúvida sobre phishing.'},student,201);let messages=await call('forum?course='+course.id,'GET',null,student);assert.equal(messages.length,2);assert.equal(messages[0].name,'Nome Atualizado');assert(messages.some(m=>m.role==='assistant'&&m.parent));
await call('forum?course='+course.id,'POST',{text:'Arquivo alheio',asset:'unknown'},student,400);
const ticket=await call('tickets','POST',{course:course.id,teacher:adminId,subject:'Preciso de ajuda',text:'Como continuar?'},student,201);await call('tickets/'+ticket.id,'POST',{text:'Revise o módulo de autenticação.'},admin);const ts=await call('tickets','GET',null,student);assert.equal(ts.replies.length,3);assert(ts.replies.some(r=>r.role==='assistant'));
const p2=await call('people','POST',{name:'Outro Aluno',email:other.email},admin,201);await call('tickets/'+ticket.id,'POST',{text:'Invasão'},other,403);
await call('progress','POST',{course:course.id,lesson:'pilot-l1',position:23},student);boot=await call('bootstrap','GET',null,student);assert.equal(boot.progress[0].position,23);assert.equal(boot.progress[0].done,1);assert(boot.notifications.length>0);
await call('notifications','POST',{},student);assert((await call('bootstrap','GET',null,student)).notifications.every(n=>n.read));
await call('courses','POST',{title:'Curso seguinte',folder:course.folder,sort:2,published:1,modules:[{id:'next-m',title:'Módulo',hours:2,lessons:[{id:'next-l',title:'Introdução',description:'Texto',minutes:20,quiz:[]}]}]},admin);boot=await call('bootstrap');const next=boot.courses.find(c=>c.title==='Curso seguinte');await call('enrollments','POST',{user:p.id,course:next.id});assert((await call('bootstrap','GET',null,student)).courses.find(c=>c.id===next.id).locked);await call('progress','POST',{course:next.id,lesson:'next-l',complete:true},student,403);
for(let i=1;i<8;i++){const l=course.modules[i].lessons[0];assert.equal(l.quiz.length,5);assert.equal(l.materials.length,1);const answers=l.quiz.map(q=>q.answer);await call('progress','POST',{course:course.id,lesson:l.id,complete:true,answers:[answers[0]]},student,400);const below=[...answers];below[0]=(below[0]+1)%3;below[1]=(below[1]+1)%3;const failed=await call('progress','POST',{course:course.id,lesson:l.id,complete:true,answers:below},student);assert.equal(failed.passed,false);assert.equal(failed.score,60);const sufficient=[...answers];sufficient[0]=(sufficient[0]+1)%3;const passed=await call('progress','POST',{course:course.id,lesson:l.id,complete:true,answers:sufficient,videoEnded:true},student);assert.equal(passed.passed,true);assert.equal(passed.score,80);await call('progress','POST',{course:course.id,lesson:l.id,complete:true,answers,videoEnded:true},student)}
assert.equal((await call('bootstrap','GET',null,student)).courses.find(c=>c.id===next.id).locked,false);await call('certificates','POST',{course:course.id,module:'course'},student,403);await call('course-assessment','POST',{course:course.id,answers:course.modules.map((m,i)=>m.lessons[0].quiz[i%5].answer)},student);await call('certificates','POST',{course:course.id,module:'course'},student);await call('progress','POST',{course:next.id,lesson:'next-l',complete:true},student);
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
