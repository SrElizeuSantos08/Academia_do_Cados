import assert from 'node:assert/strict';
import {databaseEnv,SupabaseDatabase} from '../lib/database.mjs';
import catalogue from '../lib/postgres-catalogue.json' with {type:'json'};
const env={SUPABASE_URL:'https://snboppvknkqlremkwrjf.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_fixture_not_real'};
const d1={DB:{prepare(){}}};assert.equal(databaseEnv(d1),d1);
assert.throws(()=>databaseEnv({...d1,ACADEMY_DATABASE_PROVIDER:'wrong'}),e=>e.status===503);
assert.throws(()=>databaseEnv({...d1,ACADEMY_DATABASE_PROVIDER:'supabase'}),e=>e.status===503);
assert.throws(()=>new SupabaseDatabase({...env,SUPABASE_SECRET_KEY:'sb_publishable_fixture'}));
let calls=[];const transport=async(url,options)=>{calls.push({url,options});return Response.json(JSON.parse(options.body).statements.map(s=>({success:true,results:[{value:s.params[0]}],meta:{changes:0}})))};
const db=new SupabaseDatabase(env,transport),value="x'; DELETE FROM people; -- %L $1";
assert.deepEqual(await db.prepare('SELECT value FROM settings WHERE key=?').bind(value).first(),{value});
assert.equal(calls[0].url,env.SUPABASE_URL+'/rest/v1/rpc/academia_backend_batch');assert.equal(calls[0].options.redirect,'manual');assert.equal(calls[0].options.headers.apikey,env.SUPABASE_SECRET_KEY);
const sent=JSON.parse(calls[0].options.body).statements[0];assert.equal(sent.params[0],value);assert.equal(sent.query,catalogue.find(q=>q.sqlite==='SELECT value FROM settings WHERE key=?').id);assert(!JSON.stringify(sent).includes('SELECT value'));
assert.throws(()=>db.prepare('DROP TABLE people'));assert.throws(()=>db.prepare('SELECT * FROM pg_authid'));
await assert.rejects(()=>db.prepare('SELECT value FROM settings WHERE key=?').all(),e=>e.status===503);
for(const status of [302,401,403,429,500]){let count=0;const failed=new SupabaseDatabase(env,async()=>{count++;return new Response('provider-sensitive-detail',{status})});await assert.rejects(()=>failed.prepare('SELECT value FROM settings WHERE key=?').bind('x').all(),e=>e.status===503&&!e.message.includes('sensitive'));assert.equal(count,1)}
for(const response of [null,[],[{success:true,results:'invalid',meta:{changes:0}}]]){const bad=new SupabaseDatabase(env,async()=>Response.json(response));await assert.rejects(()=>bad.prepare('SELECT value FROM settings WHERE key=?').bind('x').all())}
let attempts=0;const timed=new SupabaseDatabase(env,async()=>{attempts++;throw Error('secret fixture')});await assert.rejects(()=>timed.prepare('SELECT value FROM settings WHERE key=?').bind('x').run(),e=>!e.message.includes('secret fixture'));assert.equal(attempts,1);
console.log('PASS: explicit backend selection, no fallback, private RPC, exact catalogue, parameter isolation, response validation, redirect rejection, safe errors and no write retries.');
