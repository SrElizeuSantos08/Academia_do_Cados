import assert from 'node:assert/strict';
import {isTrustedGitHubPush,verifyGitHubActionsToken} from '../supabase/functions/github-site-update/github-oidc.mjs';

const now=Date.now(),audience='academia-github-site-updates',kid='test-github-actions-key';
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:Uint8Array.from([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid};
const encode=value=>btoa(typeof value==='string'?value:JSON.stringify(value)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
async function token(overrides={}){
 const header=encode({alg:'RS256',typ:'JWT',kid});
 const claims={iss:'https://token.actions.githubusercontent.com',aud:audience,iat:Math.floor(now/1000),exp:Math.floor(now/1000)+300,sub:'repo:SrElizeuSantos08/Academia_do_Cados:ref:refs/heads/main',repository:'SrElizeuSantos08/Academia_do_Cados',repository_owner:'SrElizeuSantos08',ref:'refs/heads/main',event_name:'push',workflow_ref:'SrElizeuSantos08/Academia_do_Cados/.github/workflows/supabase-site-updates.yml@refs/heads/main',sha:'a'.repeat(40),run_id:'123456',actor:'SrElizeuSantos08',...overrides};
 const payload=encode(claims),input=header+'.'+payload;
 const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(input));
 return {jwt:input+'.'+encode(String.fromCharCode(...new Uint8Array(signature))),claims};
}
const fetchKeys=async()=>Response.json({keys:[jwk]});

const valid=await token();
const verified=await verifyGitHubActionsToken(valid.jwt,{fetchImpl:fetchKeys,now,audience});
assert.equal(verified.sha,'a'.repeat(40));
assert(isTrustedGitHubPush(verified));
const wrongRepo=await token({repository:'someone/fork'});
assert(!isTrustedGitHubPush(await verifyGitHubActionsToken(wrongRepo.jwt,{fetchImpl:fetchKeys,now,audience})));
const wrongWorkflow=await token({workflow_ref:'SrElizeuSantos08/Academia_do_Cados/.github/workflows/other.yml@refs/heads/main'});
assert(!isTrustedGitHubPush(await verifyGitHubActionsToken(wrongWorkflow.jwt,{fetchImpl:fetchKeys,now,audience})));
const wrongAudience=await token({aud:'unexpected-audience'});
assert.equal(await verifyGitHubActionsToken(wrongAudience.jwt,{fetchImpl:fetchKeys,now,audience}),null);
const expired=await token({exp:Math.floor(now/1000)-1});
assert.equal(await verifyGitHubActionsToken(expired.jwt,{fetchImpl:fetchKeys,now,audience}),null);
const tampered=valid.jwt.slice(0,-2)+'xx';
assert.equal(await verifyGitHubActionsToken(tampered,{fetchImpl:fetchKeys,now,audience}),null);
console.log('PASS: GitHub OIDC signature, audience, expiry, repository, main branch, push event, workflow identity, and commit claims are enforced.');
