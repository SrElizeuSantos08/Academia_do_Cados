import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const dependency=createRequire(import.meta.resolve('wrangler/package.json'));
const {Miniflare}=dependency('miniflare'),{build}=dependency('esbuild');
const env={ACADEMY_EMAIL_PROVIDER:'resend',ACADEMY_PUBLIC_URL:'https://academy.test',ACADEMY_EMAIL_FROM:'Academia <sender@example.test>',RESEND_API_KEY:'fixture-not-a-secret'};
const data={email:'student@example.test',name:'Aluno',password:'temporary-fixture',space:'student',id:'test-worker'};
const entry=`import {sendAccessEmail} from ${JSON.stringify(fileURLToPath(new URL('../lib/auth-email.mjs',import.meta.url)))};
export default {async fetch(request){
 if(new URL(request.url).pathname==='/old-mode'){try{new Request('https://api.resend.com/emails',{redirect:'error'});return Response.json({rejected:false})}catch{return Response.json({rejected:true})}}
 try{return Response.json(await sendAccessEmail(${JSON.stringify(env)},${JSON.stringify(data)}))}catch(e){return Response.json({code:e.code},{status:e.status||500})}
}};`;
const compiled=await build({stdin:{contents:entry,resolveDir:process.cwd(),sourcefile:'email-worker-fixture.mjs'},bundle:true,write:false,format:'esm',platform:'browser'});
let calls=0,redirect=false;
const mf=new Miniflare({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-05-15',outboundService:async request=>{
 calls++;assert.equal(request.url,'https://api.resend.com/emails');assert.equal(request.method,'POST');assert.equal(request.headers.get('authorization'),'Bearer fixture-not-a-secret');
 const body=await request.json();assert.equal(body.to[0],data.email);
 return redirect?new Response(null,{status:302,headers:{location:'https://must-not-follow.example.test'}}):Response.json({id:'fixture-email'});
}});
try{
 assert.deepEqual(await (await mf.dispatchFetch('http://localhost/old-mode')).json(),{rejected:true});assert.equal(calls,0);
 const ok=await mf.dispatchFetch('http://localhost/send');assert.equal(ok.status,200);assert.deepEqual(await ok.json(),{accepted:true});assert.equal(calls,1);
 redirect=true;const refused=await mf.dispatchFetch('http://localhost/send');assert.equal(refused.status,502);assert.equal((await refused.json()).code,'EMAIL_DELIVERY_FAILED');assert.equal(calls,2,'Redirects must never be followed or retried');
 console.log('PASS: real Workers runtime reproduces unsupported redirect:error, sends with manual mode, rejects redirects, no external network or real email.');
}finally{await mf.dispose()}
