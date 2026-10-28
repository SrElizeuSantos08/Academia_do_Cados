import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const tests=readdirSync(new URL('../tests/',import.meta.url)).filter(name=>name.endsWith('.test.mjs')).sort();
const failed=[];
for(const test of tests){
  console.log('\nTEST '+test);
  const result=spawnSync(process.execPath,['tests/'+test],{stdio:'inherit'});
  if(result.error)console.error(result.error.message);
  if(result.status!==0)failed.push(test);
}
console.log('\n'+(tests.length-failed.length)+'/'+tests.length+' test files passed.');
if(failed.length){console.error('Failed: '+failed.join(', '));process.exitCode=1;}
