import assert from 'node:assert/strict';
import {createSupabaseBucket,createSupabaseDatabase,configureSupabaseRuntime} from '../lib/supabase-d1-adapter.mjs';

const originalFetch=globalThis.fetch;
const env={SUPABASE_URL:'https://project.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'server-only-test-key'};
const sha=async value=>Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))).toString('hex');
try{
 const calls=[];
 globalThis.fetch=async(url,options={})=>{
  calls.push({url:String(url),options});
  if(String(url).includes('/rpc/academia_backend_batch')){
   const statements=JSON.parse(options.body);
   return Response.json(statements.map((statement,i)=>({success:true,results:i===0?[{id:'row-1',active:true}]:[],meta:{changes:i===0?1:0}})));
  }
  if(options.method==='GET')return new Response('photo-bytes',{status:206,headers:{'content-range':'bytes 2-5/10'}});
  return new Response('{}',{status:200});
 };
 const db=createSupabaseDatabase(env),sql='SELECT * FROM people WHERE id=?';
 assert.deepEqual((await db.prepare(sql).bind('student-1').all()).results,[{id:'row-1',active:true}]);
 assert.equal(JSON.parse(calls[0].options.body)[0].query,await sha(sql));
 assert.deepEqual(JSON.parse(calls[0].options.body)[0].params,['student-1']);
 assert.equal(await db.prepare(sql).bind('student-1').first('id'),'row-1');
 const results=await db.batch([db.prepare(sql).bind('student-1'),db.prepare('UPDATE people SET active=? WHERE id=?').bind(false,'student-1')]);
 assert.equal(results.length,2);assert.equal(results[1].meta.changes,0);
 assert.equal(calls.at(-1).options.headers.authorization,'Bearer server-only-test-key');
 assert.equal(configureSupabaseRuntime({DB:{legacy:true}}).DB.legacy,true);
 assert.throws(()=>configureSupabaseRuntime({SUPABASE_URL:env.SUPABASE_URL}),/not configured/);

 const bucket=createSupabaseBucket(env);
 await bucket.put('photo-id','photo-bytes',{httpMetadata:{contentType:'image/jpeg'}});
 assert.equal(calls.at(-1).options.headers['content-type'],'image/jpeg');
 const rangeHeaders=new Headers({range:'bytes=2-5'});
 const object=await bucket.get('photo-id',{range:rangeHeaders});
 assert.deepEqual(object.range,{offset:2,length:4});
 assert.equal(await new Response(object.body).text(),'photo-bytes');
 await bucket.delete('photo-id');
 assert.deepEqual(JSON.parse(calls.at(-1).options.body),{prefixes:['photo-id']});

 globalThis.fetch=async()=>new Response('sensitive database detail',{status:500});
 await assert.rejects(()=>db.prepare(sql).bind('x').all(),error=>!error.message.includes('sensitive'));
 console.log('PASS: Supabase query gateway, D1-compatible methods, server-only auth, Storage operations, range reads and sanitized errors.');
}finally{globalThis.fetch=originalFetch}
