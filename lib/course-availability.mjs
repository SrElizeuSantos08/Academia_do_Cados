export const developmentKey = course => `course:${course}:development`;
export async function developmentCourses(db) {
  const {results} = await db.prepare("SELECT key FROM settings WHERE key LIKE 'course:%:development' AND value='on'").all();
  return new Set(results.map(row => row.key.slice(7, -12)));
}
export async function inDevelopment(db, course) {
  const setting = await db.prepare('SELECT value FROM settings WHERE key=?').bind(developmentKey(course)).first();
  return setting?.value === 'on';
}
