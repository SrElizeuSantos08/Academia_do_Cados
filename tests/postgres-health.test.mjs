import assert from 'node:assert/strict';
import {env,call,admin,other} from './lms.test.mjs';
const before=env.DB,original=globalThis.fetch;
await call('database-health','GET',null,other,403);
const missing=await call('database-health','GET',null,admin,503);assert.equal(missing.stage,'configuration');assert.equal(missing.reason,'INVALID_URL');assert.equal(missing.configuration.keyPresent,false);
env.SUPABASE_URL='https://snboppvknkqlremkwrjf.supabase.co';env.SUPABASE_SECRET_KEY='sb_secret_private_fixture';
try{
 let calls=0;globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,env.SUPABASE_URL+'/rest/v1/rpc/academia_backend_batch');assert.equal(options.redirect,'manual');return Response.json([{success:true,results:[{id:'one'},{id:'two'}],meta:{changes:0}}])};
 const result=await call('database-health');assert.deepEqual(result,{active:'d1',target:'supabase',connected:true,courses:2,productionSwitchPerformed:false});assert.equal(calls,1);assert.equal(env.DB,before);assert(!JSON.stringify(result).includes(env.SUPABASE_SECRET_KEY));
 env.SUPABASE_SECRET_KEY='sb_publishable_fixture_only';
 const publicKey=await call('database-health','GET',null,admin,503);assert.equal(publicKey.reason,'PUBLIC_KEY_REJECTED');assert.equal(publicKey.configuration.keyType,'publishable');assert.equal(calls,1);assert(!JSON.stringify(publicKey).includes(env.SUPABASE_SECRET_KEY));
 env.SUPABASE_SECRET_KEY='sb_secret_private_fixture';
 globalThis.fetch=async()=>new Response('private provider response',{status:401});
 const rejected=await call('database-health','GET',null,admin,503);assert.equal(rejected.stage,'provider');assert.equal(rejected.providerStatus,401);assert(!JSON.stringify(rejected).includes('private provider response'));
 globalThis.fetch=async()=>{throw Error('private credential detail')};
 const failed=await call('database-health','GET',null,admin,503);assert.equal(failed.stage,'transport');assert.equal(failed.reason,'REQUEST_FAILED');assert(!JSON.stringify(failed).includes('private credential detail'));
 console.log('PASS: administrator-only connection check exercises the HTTP adapter without switching the active D1 backend or exposing credentials.');
}finally{globalThis.fetch=original;delete env.SUPABASE_URL;delete env.SUPABASE_SECRET_KEY}
