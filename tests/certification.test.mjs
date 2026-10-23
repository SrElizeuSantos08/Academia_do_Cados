import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {handleLms} from '../lib/lms.mjs';
import {closingAssessment,moduleResult} from '../lib/certification.mjs';
const sql=new DatabaseSync(':memory:');
sql.exec(readFileSync(new URL('../drizzle/0000_brainy_dreaming_celestial.sql',import.meta.url),'utf8'));
class Statement{
 constructor(q,args=[]){this.q=q;this.args=args}bind(...args){return new Statement(this.q,args)}
 async run(){return {meta:{changes:sql.prepare(this.q).run(...this.args).changes}}}
 async first(){return sql.prepare(this.q).get(...this.args)||null}
 async all(){return {results:sql.prepare(this.q).all(...this.args)}}
}
const env={BOOTSTRAP_ADMIN_EMAILS:'elizeu.santos@bugbusters.com.br',DB:{prepare:q=>new Statement(q)}};
const admin={id:'admin',email:'elizeu.santos@bugbusters.com.br'},student={id:'student',email:'student@example.test'};
function request(path,method,body,user){return new Request('https://academy.test/api/lms/'+path,{method,headers:{origin:'https://academy.test','content-type':'application/json','oai-authenticated-user-id':user.id,'oai-authenticated-user-email':user.email},body:body?JSON.stringify(body):undefined})}
async function call(path,method='GET',body,user=admin,status=200){const r=await handleLms(request(path,method,body,user),env);const data=await r.json();assert.equal(r.status,status,JSON.stringify(data));return data}
await call('bootstrap');
const person=await call('people','POST',{name:'João da Silva Oliveira',email:student.email,role:'student'},admin,201);
const quiz=[{question:'Uma solicitação urgente exige acesso. O que fazer?',options:['Validar o pedido pelo canal oficial.','Emprestar o login.'],answer:0,explanation:'Urgência exige validação e não elimina as autorizações.'},{question:'Qual permissão deve ser concedida?',options:['Toda a pasta.','Apenas o necessário à tarefa.'],answer:1,explanation:'O acesso deve corresponder à necessidade.'}];
assert.equal(moduleResult({id:'m',lessons:[{id:'l',quiz}]},[{lesson:'l',done:1,score:74}]).eligible,false);
assert.equal(moduleResult({id:'m',lessons:[{id:'l',quiz}]},[{lesson:'l',done:1,score:75}]).eligible,true);
const created=await call('courses','POST',{title:'Segurança Digital na Prática',folder:'Teste',published:1,modules:[{id:'m1',title:'Proteção das informações',hours:.5,lessons:[{id:'a',title:'Aula A',quiz},{id:'b',title:'Aula B',quiz}]},{id:'m2',title:'Resposta a incidentes',hours:1,lessons:[{id:'c',title:'Aula C',quiz}]}]},admin);
const course=created.id;
await call('enrollments','POST',{user:person.id,course});
await call('course-assessment?course='+course,'GET',null,student,403);
await call('certificates','POST',{course,module:'m1'},student,403);
await call('progress','POST',{course,lesson:'a',complete:true,answers:[0,1]},student);
await call('certificates','POST',{course,module:'m1'},student,403);
await call('progress','POST',{course,lesson:'b',complete:true,answers:[0,1]},student);
// Old records marked done with insufficient grades must not authorize new certification.
sql.prepare('UPDATE progress SET score=50 WHERE user=? AND lesson=?').run(person.id,'b');
await call('certificates','POST',{course,module:'m1'},student,403);
await call('course-assessment?course='+course,'GET',null,student,403);
await call('progress','POST',{course,lesson:'b',complete:true,answers:[0,1]},student);
const moduleCert=await call('certificates','POST',{course,module:'m1',name:'Nome enviado pelo navegador'},student);
let cert=await call('certificates/'+moduleCert.id,'GET',null,student);
assert.equal(cert.snapshot.name,'João da Silva Oliveira');assert.equal(cert.snapshot.score,100);assert.equal(cert.snapshot.hours,.5);
await call('progress','POST',{course,lesson:'c',complete:true,answers:[0,1]},student);
await call('certificates','POST',{course,module:'course'},student,403);
const assessment=await call('course-assessment?course='+course,'GET',null,student);
assert.equal(assessment.questions.length,2);assert(assessment.questions.every(q=>!('answer'in q)&&!('explanation'in q)));
await call('course-assessment','POST',{course,answers:[0]},student,400);
await call('course-assessment','POST',{course,answers:[0,'1']},student,400);
await call('course-assessment','POST',{course,answers:[0,100]},student,400);
assert.equal((await call('course-assessment','POST',{course,answers:[1,0]},student)).passed,false);
await call('certificates','POST',{course,module:'course'},student,403);
assert.equal((await call('course-assessment','POST',{course,answers:[0,1]},student)).passed,true);
const finalCert=await call('certificates','POST',{course,module:'course'},student);
assert.equal((await call('certificates','POST',{course,module:'course'},student)).id,finalCert.id);
cert=await call('certificates/'+finalCert.id,'GET',null,student);
assert.equal(cert.snapshot.score,100);assert.equal(cert.snapshot.hours,1.5);assert.equal(cert.snapshot.ra,person.ra||'AC-2026-0007');
const snapshot=structuredClone(cert.snapshot);
const boot=await call('bootstrap','GET',null,student);
assert.equal(boot.progress.length,3);assert(boot.progress.every(p=>!p.lesson.startsWith('@final:')));assert(boot.courses[0].certification.passed);
await call('course-assessment','POST',{course,answers:[1,0]},student);
assert((await call('bootstrap','GET',null,student)).courses[0].certification.passed,'A later failed attempt cannot revoke an earned result.');
await call('people/'+person.id,'PATCH',{name:'Nome atualizado'},student);
assert.deepEqual((await call('certificates/'+finalCert.id,'GET',null,student)).snapshot,snapshot,'Issued records keep the name registered at issuance.');
const raw=await handleLms(request('certificates/'+finalCert.id+'/pdf','GET',null,student),env);
assert.equal(raw.status,200);assert.equal(raw.headers.get('content-type'),'application/pdf');
const pdf=await raw.text();assert(pdf.startsWith('%PDF-1.4'));assert(pdf.includes('startxref'));assert(!pdf.includes('[NOME DO ALUNO]'));
// Changed assessment content invalidates the closing result for future issuance, never existing records.
let c=(await call('bootstrap')).courses.find(c=>c.id===course),oldKey=(await closingAssessment({...c,body:JSON.stringify(c.modules)})).key;
c.modules[0].lessons[0].quiz[0].answer=1;await call('courses/'+course,'PATCH',c);
c=(await call('bootstrap')).courses.find(c=>c.id===course);
assert.notEqual((await closingAssessment({...c,body:JSON.stringify(c.modules)})).key,oldKey);
assert.equal((await call('bootstrap','GET',null,student)).courses[0].certification.passed,false);
assert.equal((await call('certificates','POST',{course,module:'course'},student)).id,finalCert.id);
const context={window:{},location:{origin:'https://academy.test'}};
vm.runInNewContext(readFileSync(new URL('../public/certificate.js',import.meta.url),'utf8'),context);
const html=context.window.CaosCertificate({...snapshot,name:'<script>invalid</script>'},finalCert.id);
assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));assert(html.includes('100%'));assert(html.includes('/certificado.html?id='));
sql.close();console.log('PASS: lesson/module grades, closing prerequisite, validation/redaction, failed attempts, immutable names/history, final idempotency, content-version invalidation, progress counts, safe certificate HTML and direct PDF.');
