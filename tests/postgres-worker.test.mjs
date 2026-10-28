import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const dependency=createRequire(import.meta.resolve('wrangler/package.json'));
const {Miniflare}=dependency('miniflare'),{build}=dependency('esbuild');
const env={SUPABASE_URL:'https://snboppvknkqlremkwrjf.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_worker_fixture'};
const entry=`import {SupabaseDatabase} from ${JSON.stringify(fileURLToPath(new URL('../lib/database.mjs',import.meta.url)))};
export default {async fetch(request){
 if(new URL(request.url).pathname==='/old-mode'){const old={transport:globalThis.fetch};try{await old.transport('https://example.test/');return Response.json({illegalInvocation:false})}catch(e){return Response.json({illegalInvocation:/Illegal invocation/.test(e.message)})}}
 try{const db=new SupabaseDatabase(${JSON.stringify(env)});return Response.json(await db.prepare('SELECT value FROM settings WHERE key=?').bind('robot').first())}catch(e){return Response.json({stage:e.databaseStage,reason:e.databaseReason},{status:e.status||500})}
}};`;
const compiled=await build({stdin:{contents:entry,resolveDir:process.cwd(),sourcefile:'postgres-worker-fixture.mjs'},bundle:true,write:false,format:'esm',platform:'browser'});
let calls=0;
const mf=new Miniflare({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-05-15',outboundService:async request=>{
 calls++;assert.equal(request.url,env.SUPABASE_URL+'/rest/v1/rpc/academia_backend_batch');assert.equal(request.method,'POST');assert.equal(request.headers.get('apikey'),env.SUPABASE_SECRET_KEY);assert.equal(request.headers.get('authorization'),null);
 const body=await request.json();assert.equal(body.statements.length,1);assert.deepEqual(body.statements[0].params,['robot']);return Response.json([{success:true,results:[{value:'off'}],meta:{changes:0}}]);
}});
try{
 assert.deepEqual(await (await mf.dispatchFetch('http://localhost/old-mode')).json(),{illegalInvocation:true});assert.equal(calls,0);
 const response=await mf.dispatchFetch('http://localhost/read');const body=await response.json();assert.equal(response.status,200,JSON.stringify(body));assert.deepEqual(body,{value:'off'});assert.equal(calls,1);
 console.log('PASS: real Workers runtime reproduces unbound fetch failure and validates bound Supabase transport without external requests or real credentials.');
}finally{await mf.dispose()}
