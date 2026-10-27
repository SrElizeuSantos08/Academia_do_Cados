import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const guide=readFileSync(new URL('../public/guia-aluno.html',import.meta.url),'utf8');
const login=readFileSync(new URL('../public/login.html',import.meta.url),'utf8');
const home=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');

for(const heading of ['Preencha seus dados','Localize sua senha temporária','Entre e crie sua senha pessoal','Aguarde a aprovação da matrícula','Aguarde a liberação do professor.'])assert(guide.includes(heading),`Missing guide step: ${heading}`);
assert.equal((guide.match(/role="img"/g)||[]).length,5,'Guide illustrations have accessible image labels');
assert.match(guide,/15 minutos/);
assert.match(guide,/pelo menos 12 caracteres/);
assert.match(guide,/não poderá acessar as aulas/);
assert.match(login,/href="guia-aluno\.html"/);
assert.match(home,/href="guia-aluno\.html"/);
console.log('PASS: student access guide covers registration, temporary password, first login, teacher approval, and is linked from login and Home.');
