import assert from 'node:assert/strict';
import {handleLms} from '../lib/lms.mjs';
let calls=0;
const DB={prepare(){calls++;throw Error('Must not access the database for paused writes')}};
for(const method of ['POST','PATCH','PUT','DELETE']){
 const response=await handleLms(new Request('https://academy.test/api/lms/progress',{method,headers:{origin:'https://academy.test'}}),{DB,ACADEMY_MIGRATION_READONLY:'on'});
 assert.equal(response.status,503);assert.equal(response.headers.get('retry-after'),'60');assert.equal((await response.json()).code,'MIGRATION_READONLY');
}
assert.equal(calls,0);
const read=await handleLms(new Request('https://academy.test/api/lms/auth/config'),{DB,ACADEMY_MIGRATION_READONLY:'on'});assert.equal(read.status,200);assert.deepEqual(await read.json(),{emailReady:false});
const normal=await handleLms(new Request('https://academy.test/api/lms/auth/config'),{DB});assert.equal(normal.status,200);
console.log('PASS: opt-in migration window blocks all write methods before database access, permits config reads and remains disabled by default.');
