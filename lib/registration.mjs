const reserved = new Map([
  ['elizeu.santos@bugbusters.com.br', 'AC-2026-0001'],
  ['guilherme.arakaki@bugbusters.com.br', 'AC-2026-0002'],
  ['osmar.cabral@bugbusters.com.br', 'AC-2026-0003'],
  ['alisson.pereira@bugbusters.com.br', 'AC-2026-0004'],
  ['erik.reis@bugbusters.com.br', 'AC-2026-0005'],
  ['bruna.oliveira@bugbusters.com.br', 'AC-2026-0006'],
]);

// Allocate and insert in one SQLite statement, so simultaneous registrations
// cannot read the same next number. The first six numbers remain reserved.
export function personStatement(db, person, ignore = false) {
  const year = new Date().getUTCFullYear(), prefix = `AC-${year}-`;
  return db.prepare(`INSERT ${ignore ? 'OR IGNORE ' : ''}INTO people
    (id,identity,login_email,email,name,ra,role,active,created)
    SELECT ?,?,?,?,?,COALESCE(?, ? || printf('%04d',
      MAX(?, COALESCE(MAX(CAST(substr(ra,9) AS INTEGER)),0)) + 1)),?,?,?
    FROM people WHERE ra GLOB ?
      AND substr(ra,9) NOT GLOB '*[^0-9]*'`)
    .bind(person.id, person.identity ?? null, person.login, person.email,
      person.name, reserved.get(person.login.toLowerCase()) ?? null, prefix, year === 2026 ? 6 : 0,
      person.role, 1, person.created, prefix + '[0-9]*');
}

export async function insertPerson(db, person, ignore = false, enrollBasic = false) {
  const account = personStatement(db, person, ignore);
  if (!enrollBasic || person.role !== 'student') return account.run();
  // Only onboarding grants the default course. Reads never restore revoked access.
  const enrollment = db.prepare(`INSERT OR IGNORE INTO enrollments (user,course,created)
    SELECT p.id,c.id,? FROM people p JOIN courses c ON c.id='cyber-pilot'
    WHERE p.id=? AND p.role='student' AND p.active=1 AND c.published=1
      AND NOT EXISTS (SELECT 1 FROM settings s
        WHERE s.key='course:'||c.id||':development' AND s.value='on')`)
    .bind(person.created, person.id);
  return (await db.batch([account, enrollment]))[0];
}
