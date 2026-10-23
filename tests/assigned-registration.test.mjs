import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {insertPerson} from '../lib/registration.mjs';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const db=new DatabaseSync(':memory:');db.exec(read('drizzle/0000_brainy_dreaming_celestial.sql'));
const rows=[
 ['demo-student','qa@example.test','Aluno de verificação','AC-2026-0004'],
 ['demo-admin','admin@example.test','Administração local','AC-2026-0005'],
 ['demo-teacher','teacher@example.test','Professor local','AC-2026-0006'],
 ['elizeu','elizeu.santos@jamaicamangueiras.com.br','Elizeu Santos','AC-2026-0007'],
 ['guilherme','guilherme.arakaki@bugbusters.com.br','Guilherme Kenji Arakaki','AC-2026-0002'],
 ['osmar','osmar.cabral@bugbusters.com.br','Osmar Cabral','AC-2026-0003'],
 ['alisson','alisson.pereira@bugbusters.com.br','Alisson Pereira','AC-2026-0008'],
 ['erik','erik.reis@bugbusters.com.br','Erik Reis','AC-2026-0009'],
 ['bruna','bruna.lima@bugbusters.com.br','Bruna Lima','AC-2026-0010'],
];
for(const [id,email,name,ra] of rows)db.prepare('INSERT INTO people(id,identity,login_email,email,name,ra,created) VALUES(?,?,?,?,?,?,?)').run(id,id,email,email,name,ra,'2026-10-22');
const before=db.prepare('SELECT id,identity,login_email,email,name,role,active,photo,created FROM people ORDER BY id').all();
const migration=read('drizzle/0007_assigned_registrations.sql');db.exec(migration);
for(const [index,id] of ['elizeu','guilherme','osmar','alisson','erik'].entries())assert.equal(db.prepare('SELECT ra FROM people WHERE id=?').get(id).ra,'AC-2026-000'+(index+1));
for(const id of ['demo-student','demo-admin','demo-teacher'])assert(Number(db.prepare('SELECT ra FROM people WHERE id=?').get(id).ra.slice(8))>10);
assert.equal(db.prepare('SELECT ra FROM people WHERE id=?').get('bruna').ra,'AC-2026-0010');
assert.deepEqual(db.prepare('SELECT id,identity,login_email,email,name,role,active,photo,created FROM people ORDER BY id').all(),before);
const once=db.prepare('SELECT id,ra FROM people ORDER BY id').all();db.exec(migration);assert.deepEqual(db.prepare('SELECT id,ra FROM people ORDER BY id').all(),once);
assert.equal(db.prepare('SELECT count(DISTINCT ra) AS n FROM people').get().n,rows.length);
db.prepare('UPDATE people SET name=?,login_email=? WHERE id=?').run('Bruna Oliveira','bruna.oliveira@bugbusters.com.br','bruna');
db.exec(migration);
assert.equal(db.prepare('SELECT ra FROM people WHERE id=?').get('bruna').ra,'AC-2026-0006');
db.close();
const fresh=new DatabaseSync(':memory:');fresh.exec(read('drizzle/0000_brainy_dreaming_celestial.sql'));
const adapter={prepare:query=>({bind:(...values)=>({run:async()=>fresh.prepare(query).run(...values)})})};
for(const [index,email] of ['elizeu.santos@jamaicamangueiras.com.br','guilherme.arakaki@bugbusters.com.br','osmar.cabral@bugbusters.com.br','alisson.pereira@bugbusters.com.br','erik.reis@bugbusters.com.br','bruna.oliveira@bugbusters.com.br'].entries()){
 await insertPerson(adapter,{id:String(index),login:email,email,name:email,role:'student',created:'2026-10-22'});
 assert.equal(fresh.prepare('SELECT ra FROM people WHERE id=?').get(String(index)).ra,'AC-2026-000'+(index+1));
}
await insertPerson(adapter,{id:'next',login:'next@example.test',email:'next@example.test',name:'Próximo aluno',role:'student',created:'2026-10-22'});
assert.equal(fresh.prepare('SELECT ra FROM people WHERE id=?').get('next').ra,'AC-2026-0007');fresh.close();
console.log('PASS: requested identities, reserved-number collisions, preserved profiles, idempotent RA assignment and future registrations.');
