import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import catalogue from '../lib/postgres-catalogue.json' with {type:'json'};
import legacy from '../lib/postgres-compatibility.json' with {type:'json'};
import {normalizeSql} from '../lib/postgres-sql.mjs';
const registered=new Map(catalogue.map(query=>[query.sqlite,query]));
for(const sql of legacy)assert(registered.has(normalizeSql(sql)),'Missing published authenticator operation: '+sql);
for(const sql of [
 "INSERT INTO auth_totp_challenges(token_hash,user,expires,attempts,created,code_hash,purpose) VALUES(?,?,?,0,?,?,?)",
 "SELECT * FROM auth_totp_challenges WHERE token_hash=? AND purpose='login' AND expires>? AND attempts<5",
 "DELETE FROM auth_totp_challenges WHERE token_hash=? AND purpose='login' RETURNING user"
])assert(registered.has(normalizeSql(sql)),'Missing email MFA operation: '+sql);
const gateway=readFileSync(new URL('../supabase/backend-rpc.sql',import.meta.url),'utf8');
assert(gateway.includes('SECURITY INVOKER'));
assert(gateway.includes('FROM PUBLIC, anon, authenticated'));
assert(gateway.includes('TO service_role'));
for(const query of catalogue)assert(gateway.includes(query.id),'Gateway/catalogue mismatch');
console.log('PASS: published authenticator and email MFA queries coexist in the fixed server-only gateway.');
