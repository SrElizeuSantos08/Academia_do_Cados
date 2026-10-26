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

export async function insertPerson(db, person, ignore = false) {
  return personStatement(db, person, ignore).run();
}
