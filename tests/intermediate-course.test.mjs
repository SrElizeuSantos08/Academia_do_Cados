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

await call('bootstrap');
const p=await call('people','POST',{name:'Intermediário',email:student.email,role:'student'},admin,201);
await call('seed','POST',{course:'cyber-intermediate'},student,403);
await call('seed','POST',{course:'unknown'},admin,400);
await call('seed','POST',{});
const basic=JSON.stringify((await call('bootstrap')).courses.find(c=>c.id==='cyber-pilot'));
await call('seed','POST',{course:'cyber-intermediate'});
await call('seed','POST',{course:'cyber-intermediate'});
const c=(await call('bootstrap')).courses.find(c=>c.id==='cyber-intermediate');
assert.equal(c.modules.length,6);
assert.equal(JSON.stringify((await call('bootstrap')).courses.find(c=>c.id==='cyber-pilot')),basic);
await call('courses/'+c.id,'PATCH',c);
const saved=(await call('bootstrap')).courses.find(x=>x.id===c.id);
assert.deepEqual(saved.modules,c.modules);
await call('enrollments','POST',{user:p.id,course:c.id});
let boot=await call('bootstrap','GET',null,student);
assert.equal(boot.courses[0].modules[1].lessons[0].locked,true);
assert.equal(boot.courses[0].modules[0].lessons[0].quiz[0].answer,undefined);
assert.equal(boot.courses[0].modules[0].lessons[0].quiz[0].explanation,undefined);
await call('certificates','POST',{course:c.id,module:'course'},student,403);
for(const m of c.modules){
 const l=m.lessons[0];assert.equal(l.video,'');assert.equal(l.quiz.length,5);assert(l.scenario&&l.decision&&l.materials.length===1);
 const answers=l.quiz.map(q=>q.answer),wrong=answers.map((a,i)=>i<2?(a+1)%3:a);
 const fail=await call('progress','POST',{course:c.id,lesson:l.id,complete:true,answers:wrong},student);
 assert.equal(fail.passed,false);assert.equal(fail.score,60);assert.equal(fail.feedback.length,5);assert.equal(fail.feedback[0].correct,false);
 const pass=await call('progress','POST',{course:c.id,lesson:l.id,complete:true,answers},student);assert(pass.passed);assert.equal(pass.feedback.length,5);
 const cert=await call('certificates','POST',{course:c.id,module:m.id},student);
 const issued=await call('certificates/'+cert.id,'GET',null,student);
 assert.equal(issued.snapshot.name,'Intermediário');assert.equal(issued.snapshot.course,c.title);
 assert.equal(issued.snapshot.module,m.title);assert.equal(issued.snapshot.hours,.25);
 assert.equal(issued.snapshot.level,'Intermediário');assert.equal(issued.snapshot.score,100);

 assert.equal((await call('certificates','POST',{course:c.id,module:m.id},student)).id,cert.id);
}
await call('certificates','POST',{course:c.id,module:'course'},student,403);
await call('course-assessment','POST',{course:c.id,answers:c.modules.map((m,i)=>m.lessons[0].quiz[i%5].answer)},student);
const cert=await call('certificates','POST',{course:c.id,module:'course'},student);
assert.equal((await call('certificates','POST',{course:c.id,module:'course'},student)).id,cert.id);
const finalRecord=await call('certificates/'+cert.id,'GET',null,student);
assert.equal(finalRecord.snapshot.name,'Intermediário');assert.equal(finalRecord.snapshot.course,c.title);
assert.equal(finalRecord.snapshot.module,'Formação completa');assert.equal(finalRecord.snapshot.hours,1.5);
assert.equal(finalRecord.snapshot.score,100);assert.equal(finalRecord.snapshot.level,'Intermediário');

assert.equal((await call('bootstrap','GET',null,student)).certificates.length,7);
sql.close();
console.log('PASS: intermediate import, permissions, basic preservation, editor roundtrip, sequential lessons, feedback, six module certificates and one final certificate without duplicates.');
