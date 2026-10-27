import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {env,sql,admin,request,emailMock} from './password-auth.test.mjs';
import {DatabaseSync} from 'node:sqlite';
const password='Senha recuperada exclusiva 2026!';
assert.equal((await request('auth/access')).data.account,null);
const before=sql.prepare('SELECT id,ra,role FROM people WHERE id=?').get('admin');
const active=await request('auth/login','POST',{identifier:admin.email,password:'Outra senha pessoal 2026!'},'',admin);
const account=(await request('auth/access','GET',null,'',admin)).data.account;assert.equal(account.name,'Admin Teste');assert.equal(account.hasPassword,true);
await request('auth/recover','POST',{identifier:admin.email,password},'',undefined,403);
await request('auth/recover','POST',{identifier:admin.email,password},'',{id:'other-id',email:admin.email},403);
await request('auth/recover','POST',{identifier:admin.email,password},'',{id:'other-id',email:'other@example.test'},403);
await request('auth/recover','POST',{password:'curta'},'',admin,400);
const recovered=await request('auth/recover','POST',{identifier:'student@example.test',password},'',admin);
assert(recovered.cookie);await request('bootstrap','GET',null,active.cookie,admin,401);
assert.deepEqual(sql.prepare('SELECT id,ra,role FROM people WHERE id=?').get('admin'),before);
await request('auth/login','POST',{identifier:admin.email,password:'Outra senha pessoal 2026!'},'',admin,401);
await request('auth/login','POST',{identifier:admin.email,password},'',admin);
assert.equal(sql.prepare('SELECT action FROM audit WHERE action=?').get('password-recovered-verified').action,'password-recovered-verified');
await request('auth/recover','POST',{password:'Bloqueada por origem 2026!'},'',admin,403,'https://evil.example');
// A registered student with no password can define the first password after identity verification.
sql.prepare('INSERT INTO people(id,login_email,email,name,ra,role,active,created) VALUES(?,?,?,?,?,?,1,?)').run('first','first@example.test','first@example.test','Primeiro Acesso','AC-FIRST','student',new Date().toISOString());
const firstIdentity={id:'first-verified',email:'first@example.test'};
assert.equal((await request('auth/access','GET',null,'',firstIdentity)).data.account.hasPassword,false);
await request('auth/recover','POST',{password,space:'company'},'',firstIdentity,403);
const first=await request('auth/recover','POST',{password,space:'student'},'',firstIdentity);
assert.equal((await request('bootstrap','GET',null,first.cookie,firstIdentity)).data.me.id,'first');
assert.equal(sql.prepare('SELECT identity FROM people WHERE id=?').get('first').identity,firstIdentity.id);
// Password registration uses the same reserved RA allocator as staff registration.
const originalFetch=globalThis.fetch;globalThis.fetch=emailMock;try{await request('auth/register','POST',{name:'Erik Reis',email:'erik.reis@bugbusters.com.br',course:'course'},'',undefined,202)}finally{globalThis.fetch=originalFetch}
assert.equal(sql.prepare('SELECT ra FROM people WHERE login_email=?').get('erik.reis@bugbusters.com.br').ra,'AC-2026-0005');
// Production migration keeps a restoration snapshot and never changes issued documents/progress.
const d=new DatabaseSync(':memory:');d.exec(readFileSync(new URL('./fixtures/site-drizzle/0000_brainy_dreaming_celestial.sql',import.meta.url),'utf8'));
for(const [id,email,ra] of [['e','elizeu.santos@bugbusters.com.br','AC-LEGACY'],['a','alisson.pereira@bugbusters.com.br','AC-2026-0007'],['b','bruna.oliveira@bugbusters.com.br','AC-2026-0008']])d.prepare('INSERT INTO people(id,login_email,email,name,ra,created) VALUES(?,?,?,?,?,?)').run(id,email,email,id,ra,'2026-10-26');
const original=d.prepare('SELECT id,login_email,email,name,created FROM people ORDER BY id').all();
const migration=readFileSync(new URL('./fixtures/site-drizzle/0007_confirmed_registration.sql',import.meta.url),'utf8');d.exec(migration);
assert.equal(d.prepare('SELECT ra FROM people WHERE id=?').get('e').ra,'AC-2026-0001');assert.equal(d.prepare('SELECT ra FROM people WHERE id=?').get('a').ra,'AC-2026-0004');assert.equal(d.prepare('SELECT ra FROM people WHERE id=?').get('b').ra,'AC-2026-0006');
assert.deepEqual(d.prepare('SELECT id,login_email,email,name,created FROM people ORDER BY id').all(),original);
const backup=d.prepare("SELECT value FROM settings WHERE key='backup:confirmed-ras:2026-10-26'").get().value;assert.equal(JSON.parse(backup).find(p=>p.id==='e').ra,'AC-LEGACY');d.exec(migration);assert.equal(d.prepare("SELECT value FROM settings WHERE key='backup:confirmed-ras:2026-10-26'").get().value,backup);
d.prepare('INSERT INTO people(id,login_email,email,name,ra,created) VALUES(?,?,?,?,?,?)').run('unknown','unknown@example.test','unknown@example.test','Outro','AC-2026-0005','2026-10-26');assert.throws(()=>{d.exec('BEGIN');try{d.exec(migration);d.exec('COMMIT')}catch(e){d.exec('ROLLBACK');throw e}},/CHECK constraint/);assert.equal(d.prepare('SELECT ra FROM people WHERE id=?').get('unknown').ra,'AC-2026-0005');d.close();
console.log('PASS: verified-only recovery, no account targeting, rejected identity conflicts, old sessions revoked, first access, reserved self-registration and backed-up RA migration with conflict protection.');
