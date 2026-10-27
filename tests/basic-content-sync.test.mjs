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
const stored=sql.prepare('SELECT * FROM courses WHERE id=?').get('cyber-pilot'),legacy=JSON.parse(stored.body);
for(const [i,m] of legacy.entries()){for(const l of m.lessons){if(i)l.quiz=l.quiz.slice(0,1);delete l.materials;}}
legacy[1].lessons[0].video='custom-upload-preserved';
sql.prepare('UPDATE courses SET body=? WHERE id=?').run(JSON.stringify(legacy),'cyber-pilot');
sql.prepare("INSERT INTO progress VALUES(?,?,?,?,?,?,?)").run(initial.me.id,'cyber-pilot','pilot-l1',35,1,100,'2026-10-01');
sql.prepare("INSERT INTO certificates VALUES(?,?,?,?,?,?)").run('existing-certificate',initial.me.id,'cyber-pilot','pilot-m1','{"name":"Original"}','2026-10-01');
const snapshot=()=>JSON.stringify([sql.prepare('SELECT * FROM progress').all(),sql.prepare('SELECT * FROM certificates').all()]);const history=snapshot();
await call('people','POST',{name:'Aluno de teste',email:student.email,role:'student'},admin,201);
await call('courses/cyber-pilot/local-content','GET',null,student,403);
await call('courses/cyber-pilot/local-content','POST',{confirmed:true,version:stored.updated},student,403);
const preview=await call('courses/cyber-pilot/local-content');assert.equal(preview.lessons.length,8);assert.equal(preview.conflicts.length,0);assert.equal(preview.lessons.filter(l=>l.quizUpdated).length,7);
await call('courses/cyber-pilot/local-content','POST',{confirmed:true,version:'stale'},admin,409);
await call('courses/cyber-pilot/local-content','POST',{version:preview.version},admin,400);
const done=await call('courses/cyber-pilot/local-content','POST',{confirmed:true,version:preview.version});assert(done.changed);assert(done.backup.startsWith('backup:basic-content:'));
const after=sql.prepare('SELECT * FROM courses WHERE id=?').get('cyber-pilot'),modules=JSON.parse(after.body);assert(modules.every(m=>m.lessons.every(l=>l.quiz.length===5&&l.materials.length===1)));assert.equal(modules[1].lessons[0].video,'custom-upload-preserved');assert.equal(snapshot(),history);
const backup=JSON.parse(sql.prepare('SELECT value FROM settings WHERE key=?').get(done.backup).value);assert.equal(backup.body,JSON.stringify(legacy));
const again=await call('courses/cyber-pilot/local-content','POST',{confirmed:true,version:after.updated});assert.equal(again.changed,false);assert.equal(sql.prepare("SELECT COUNT(*) n FROM settings WHERE key LIKE 'backup:basic-content:%'").get().n,1);
modules[1].lessons[0].quiz=[{question:'AvaliaÃ§Ã£o personalizada',options:['A','B','C'],answer:0}];const custom=JSON.stringify(modules);sql.prepare('UPDATE courses SET body=? WHERE id=?').run(custom,'cyber-pilot');
const conflict=await call('courses/cyber-pilot/local-content');assert.equal(conflict.conflicts.length,1);await call('courses/cyber-pilot/local-content','POST',{confirmed:true,version:conflict.version},admin,409);assert.equal(sql.prepare('SELECT body FROM courses WHERE id=?').get('cyber-pilot').body,custom);assert.equal(snapshot(),history);
console.log('PASS: admin-only basic content sync; 40 questions/8 portfolios; exact backup; custom quiz protection; stale-write guard; video/history preservation; idempotency.');
