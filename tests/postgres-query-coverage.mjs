import {DatabaseSync} from 'node:sqlite';
import catalogue from '../lib/postgres-catalogue.json' with {type:'json'};
import {normalizeSql} from '../lib/postgres-sql.mjs';
const known=new Set(catalogue.map(q=>q.sqlite)),original=DatabaseSync.prototype.prepare;
DatabaseSync.prototype.prepare=function(query,...args){
 const stack=new Error().stack.replaceAll('\\','/');
 if(/lib\/(lms|password-auth|registration|course-availability|database-export|basic-content-sync)\.mjs/.test(stack)&&/^(SELECT|INSERT|UPDATE|DELETE)\b/i.test(query.trim())&&!known.has(normalizeSql(query)))throw Error('Unregistered backend query: '+query);
 return original.call(this,query,...args);
};
