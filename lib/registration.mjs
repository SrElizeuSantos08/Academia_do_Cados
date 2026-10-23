const reserved = new Map([
  ['elizeu.santos@bugbusters.com.br', 'AC-2026-0001'],
  ['elizeu.santos@jamaicamangueiras.com.br', 'AC-2026-0001'],
  ['guilherme.arakaki@bugbusters.com.br', 'AC-2026-0002'],
  ['osmar.cabral@bugbusters.com.br', 'AC-2026-0003'],
  ['alisson.pereira@bugbusters.com.br', 'AC-2026-0004'],
  ['erik.reis@bugbusters.com.br', 'AC-2026-0005'],
  ['bruna.oliveira@bugbusters.com.br', 'AC-2026-0006'],
]);

// Allocate and insert in one SQLite statement, so simultaneous registrations
// cannot read the same next number. The first six numbers remain reserved.
export async function insertPerson(db, person, ignore = false) {
  return db.prepare(`INSERT ${ignore ? 'OR IGNORE ' : ''}INTO people
    (id,identity,login_email,email,name,ra,role,active,created)
    SELECT ?,?,?,?,?,COALESCE(?, 'AC-2026-' || printf('%04d',
      MAX(6, COALESCE(MAX(CAST(substr(ra,9) AS INTEGER)),0)) + 1)),?,?,?
    FROM people WHERE ra GLOB 'AC-2026-[0-9]*'
      AND substr(ra,9) NOT GLOB '*[^0-9]*'`)
    .bind(person.id, person.identity ?? null, person.login, person.email,
      person.name, reserved.get(person.login.toLowerCase()) ?? null,
      person.role, 1, person.created).run();
}
