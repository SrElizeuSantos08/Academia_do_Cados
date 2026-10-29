import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { startPreview } from '../scripts/preview-academy.mjs';

const source=readFileSync(new URL('../public/portal.js',import.meta.url),'utf8');
const helpers=source.slice(source.indexOf('function managementItems('),source.indexOf('function nav('));
const context={S:{me:{id:'me',role:'admin'},certificates:[{user:'me'},{user:'other'}]},roles:{admin:'Administrador',teacher:'Professor',student:'Aluno'},icon:()=>'<svg></svg>'};
let adminSpace=true;
context.isAdmin=()=>context.S.me.role==='admin';context.adminView=()=>adminSpace;
vm.createContext(context);vm.runInContext(helpers,context);
assert.deepEqual(Array.from(context.managementItems(),i=>i[0]),['dashboard','approvals','people','enrollments','reports','moderation','courses','forum','support','notifications','certificates','email','settings','audit']);
assert(context.managementOverview().includes('data-go="people"'));
assert.equal(context.visibleCertificates().length,2);
adminSpace=false;assert.equal(context.visibleCertificates().length,1);
context.S.me.role='teacher';adminSpace=true;
assert(!context.managementItems().some(i=>['people','enrollments','email','settings','audit'].includes(i[0])));
assert.equal(context.visibleCertificates().length,1);
assert(source.includes("location.assign(adminView()?'/aluno.html':'/admin.html')"));
assert(source.includes('if(requestedAdmin&&!isStaff()&&!S.registrationPending)'));

mkdirSync(resolve('outputs'),{recursive:true});
const stateDirectory=mkdtempSync(resolve('outputs/admin-panels-test-'));
let server=await startPreview({port:0,stateDirectory,restoreSnapshot:false});
let base='http://127.0.0.1:'+server.address().port;
const cookies={admin:'ac-preview-profile=admin',student:'ac-preview-profile=aluno',teacher:'ac-preview-profile=professor'};
async function call(path,method='GET',body,profile='admin',expected=200){
  const response=await fetch(base+'/api/lms/'+path,{method,headers:{cookie:cookies[profile],origin:base,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  const data=await response.json();assert.equal(response.status,expected,JSON.stringify(data));return data;
}
try{
  for(const route of ['/admin','/admin.html','/aluno','/aluno.html','/portal','/empresa']){
    const response=await fetch(base+route);assert.equal(response.status,200,route);
  }
  const html=await (await fetch(base+'/admin')).text();assert(html.includes('Painel da Empresa | Academia do Caos'));assert(html.includes('AMBIENTE LOCAL'));
  let boot=await call('bootstrap');assert.equal(boot.me.role,'admin');assert.equal(boot.people.length,3);
  const emailStatus=await call('email-events');assert.equal(typeof emailStatus.emailReady,'boolean');assert.deepEqual(emailStatus.events,[]);await call('email-events','GET',null,'student',403);
  const created=await call('people','POST',{name:'Pessoa de teste',email:'new-person@example.test',role:'student'},'admin',201);
  await call('people/'+created.id,'PATCH',{name:'Pessoa atualizada'});
  await call('people','POST',{name:'Sem permissão',email:'no-access@example.test'},'student',403);
  await call('enrollments','POST',{user:created.id,course:'cyber-pilot'});
  await call('enrollments','POST',{user:created.id,course:'cyber-pilot'},'teacher',403);
  await call('audit','GET',null,'student',403);
  const message=await call('forum?course=cyber-pilot','POST',{text:'Dúvida do aluno'},'student',201);
  const forum=await call('forum?course=cyber-pilot');assert(forum.some(m=>m.id===message.id));
  await call('forum?course=cyber-pilot','POST',{text:'Resposta da equipe',parent:message.id},'teacher',201);
  const ticket=await call('tickets','POST',{course:'cyber-pilot',subject:'Preciso de ajuda',text:'Como continuar?'},'student',201);
  await call('tickets/'+ticket.id,'POST',{text:'Orientação da administração.'});
  await call('notifications','POST',{broadcast:true,course:'cyber-pilot',title:'Comunicado',text:'Novo material disponível.'});
  const course=boot.courses.find(c=>c.id==='cyber-pilot'),lesson=course.modules[0].lessons[0];
  await call('progress','POST',{course:course.id,lesson:lesson.id,complete:true,answers:lesson.quiz.map(q=>q.answer),videoEnded:true},'student');
  const certificate=await call('certificates','POST',{course:course.id,module:'pilot-m1'},'student');
  boot=await call('bootstrap');assert(boot.certificates.some(c=>c.id===certificate.id));
  assert.equal((await call('bootstrap','GET',null,'teacher')).certificates.length,0);
  assert.equal((await call('bootstrap','GET',null,'student')).certificates.length,1);
  assert((await call('audit')).some(row=>row.action==='create-person'));
  const upload=await fetch(base+'/api/lms/assets?scope=forum&course=cyber-pilot',{method:'POST',headers:{cookie:cookies.student,origin:base,'Content-Type':'text/plain','X-File-Name':'teste.txt','X-File-Size':'4'},body:'test'});
  assert.equal(upload.status,201);const file=await upload.json();
  const downloaded=await fetch(base+'/api/lms/assets/'+file.id,{headers:{cookie:cookies.student}});assert.equal(await downloaded.text(),'test');
  await new Promise(resolveClose=>server.close(resolveClose));
  server=await startPreview({port:0,stateDirectory,restoreSnapshot:false});base='http://127.0.0.1:'+server.address().port;
  boot=await call('bootstrap');assert(boot.people.some(p=>p.id===created.id&&p.name==='Pessoa atualizada'));assert(boot.certificates.some(c=>c.id===certificate.id));
  assert((await call('forum?course=cyber-pilot')).some(m=>m.id===message.id));
}finally{await new Promise(resolveClose=>server.close(resolveClose));}
console.log('PASS: management shortcuts, role boundaries, panel aliases, people, enrollments, forum, support, notices, academy certificates, uploads and persisted local state.');
