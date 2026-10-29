export const migrationTables=['people','courses','enrollments','progress','assets','messages','topics','message_topics','moderation','forum_reports','tickets','replies','notifications','reads','certificates','settings','audit','tutor','auth_profiles','auth_passwords','auth_email_events'];
export const excludedMigrationTables=['auth_sessions','auth_limits','auth_email_challenges','auth_totp','auth_totp_challenges'];
export async function databaseExport(db){
 const available=(await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()).results.map(r=>r.name);const names=migrationTables.filter(name=>available.includes(name));
 // One D1 batch supplies a consistent read snapshot, with full field values.
 const results=await db.batch(names.map(name=>db.prepare('SELECT * FROM "'+name+'"')));const tables=Object.fromEntries(names.map((name,i)=>[name,results[i].results]));
 if(Object.values(tables).some(rows=>!Array.isArray(rows)))throw Error('Exportação incompleta.');
 const bytes=new TextEncoder().encode(JSON.stringify(tables)),hash=await crypto.subtle.digest('SHA-256',bytes),checksum=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
 return {format:'academia-database-export',version:1,created:new Date().toISOString(),sha256:checksum,counts:Object.fromEntries(Object.entries(tables).map(([name,rows])=>[name,rows.length])),excluded:excludedMigrationTables,tables};
}
