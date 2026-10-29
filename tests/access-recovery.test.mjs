import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {env,sql,admin,request,emailMock,currentAdminPassword} from './password-auth.test.mjs';
import {DatabaseSync} from 'node:sqlite';
// Recovery must use the emailed temporary password, never an identity header alone.
assert.equal((await request('auth/access')).data.emailReady,true);
const before=sql.prepare('SELECT * FROM auth_passwords ORDER BY user').all();
const active=await request('auth/login','POST',{identifier:admin.email,password:currentAdminPassword},'',admin);
for(const identity of [undefined,admin,{id:'other-id',email:admin.email}]){
 await request('auth/recover','POST',{identifier:admin.email,password:'Unauthorized replacement 2026!'},'',identity,400);
}
assert.deepEqual(sql.prepare('SELECT * FROM auth_passwords ORDER BY user').all(),before);
assert.equal((await request('bootstrap','GET',null,active.cookie,admin)).data.me.id,'admin');
await request('auth/recover','POST',{password:'Blocked origin 2026!'},'',admin,403,'https://evil.example');
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
console.log('PASS: email-only recovery, identity-header bypass rejected, permanent passwords and sessions preserved, reserved self-registration and backed-up RA migration with conflict protection.');
