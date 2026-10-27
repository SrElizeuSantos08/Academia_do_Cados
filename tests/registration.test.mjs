import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { insertPerson } from '../lib/registration.mjs';

const sql = new DatabaseSync(':memory:');
sql.exec(readFileSync(new URL('./fixtures/local-drizzle/0000_brainy_dreaming_celestial.sql', import.meta.url), 'utf8'));
const db = { prepare(query) { return { bind(...values) { return { async run() { return sql.prepare(query).run(...values); } }; } }; } };
const emails = ['elizeu.santos@bugbusters.com.br', 'guilherme.arakaki@bugbusters.com.br', 'osmar.cabral@bugbusters.com.br'];
const person = (id, login) => ({ id, login, email: login, name: id, role: 'student', created: '2026-10-22' });
const ra = id => sql.prepare('SELECT ra FROM people WHERE id=?').get(id).ra;
await insertPerson(db, person('early', 'early@example.com'));
assert.equal(ra('early'), 'AC-2026-0007');
for (const [i, login] of emails.entries()) {
  await insertPerson(db, person(String(i), login));
  assert.equal(ra(String(i)), `AC-2026-000${i + 1}`);
}
await Promise.all(Array.from({ length: 20 }, (_, i) => insertPerson(db, person(`new-${i}`, `new-${i}@example.com`))));
assert.equal(ra('new-19'), 'AC-2026-0027');
assert.equal(sql.prepare('SELECT COUNT(DISTINCT ra) AS n FROM people').get().n, 24);
// Simulate legacy IDs and a swap of the reserved numbers without touching users.
sql.exec("UPDATE people SET ra='old-' || id; UPDATE people SET ra='AC-2026-0002' WHERE id='0'; UPDATE people SET ra='AC-2026-0001' WHERE id='1'; UPDATE people SET ra='AC-2026-0040' WHERE id='early'");
const before = sql.prepare('SELECT id,identity,login_email,email,name,role,active,created FROM people ORDER BY id').all();
const migration = readFileSync(new URL('./fixtures/local-drizzle/0005_sequential_registration.sql', import.meta.url), 'utf8');
sql.exec(migration);
assert.deepEqual(sql.prepare('SELECT id,identity,login_email,email,name,role,active,created FROM people ORDER BY id').all(), before);
for (let i = 0; i < 3; i++) assert.equal(ra(String(i)), `AC-2026-000${i + 1}`);
assert.equal(ra('early'), 'AC-2026-0040');
assert.equal(sql.prepare('SELECT COUNT(DISTINCT ra) AS n FROM people').get().n, 24);
sql.exec(migration); // Reapplication preserves already assigned numbers.
await insertPerson(db, person('after', 'after@example.com'));
assert.equal(ra('after'), 'AC-2026-0061');
assert.equal(sql.prepare("SELECT COUNT(*) AS n FROM people WHERE role='admin'").get().n, 0);
sql.close();
console.log('PASS: reserved RAs, atomic allocation, migration collisions, stable IDs/roles, existing sequential RAs and next registration.');
