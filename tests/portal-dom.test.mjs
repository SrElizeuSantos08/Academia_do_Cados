import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
import {env,call,admin,student,course,p} from './lms.test.mjs';
import {media} from './enhancements.test.mjs';
import {handleLms} from '../lib/lms.mjs';
const windows=[];
const tick=()=>new Promise(resolve=>setTimeout(resolve,20));
async function until(fn,label){for(let i=0;i<100;i++){if(fn())return;await tick()}throw Error('Timed out: '+label)}
async function portal(user,path){
 const window=new Window({url:'https://academy.test/'+path,settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableComputedStyleRendering:true}});windows.push(window);
 window.document.write(readFileSync(new URL('../public/portal.html',import.meta.url),'utf8'));
 window.structuredClone=structuredClone;window.confirm=()=>true;window.print=()=>{};window.HTMLElement.prototype.scrollIntoView=()=>{};
 window.HTMLDialogElement.prototype.showModal=function(){this.open=true};window.HTMLDialogElement.prototype.close=function(){this.open=false};
 window.HTMLMediaElement.prototype.load=function(){};window.HTMLMediaElement.prototype.pause=function(){};window.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};
 window.fetch=async(input,options={})=>{const headers=new Headers(options.headers);headers.set('origin','https://academy.test');headers.set('oai-authenticated-user-id',user.id);headers.set('oai-authenticated-user-email',user.email);return handleLms(new Request(new URL(String(input),'https://academy.test'),{...options,headers}),env)};
 window.eval(readFileSync(new URL('../public/module-badges.js',import.meta.url),'utf8'));window.eval(readFileSync(new URL('../public/certificate.js',import.meta.url),'utf8'));window.eval(readFileSync(new URL('../public/portal.js',import.meta.url),'utf8'));
 await until(()=>window.document.querySelector('#nav button'),'portal bootstrap');await until(()=>window.document.querySelector('#view h1')&&!window.document.querySelector('.loader'),'dashboard');return window;
}
try{
 const a=await portal(admin,'admin.html'),d=a.document;
 d.querySelector('[data-go="reports"]').click();await until(()=>d.querySelector('#reportBody tr'),'report table');assert(d.querySelector('#exportReport').href.includes('/reports/export'));
 const search=d.querySelector('#reportSearch');search.value='Nome Atualizado';search.dispatchEvent(new a.Event('input',{bubbles:true}));assert([...d.querySelectorAll('#reportBody tr')].every(r=>r.textContent.includes('Nome Atualizado')));
 d.querySelector('[data-go="moderation"]').click();await until(()=>d.querySelector('#view h1')?.textContent==='Moderação do fórum','moderation page');
 d.querySelector('[data-go="courses"]').click();await until(()=>d.querySelector('[data-action="edit-course"]'),'catalog');d.querySelector(`[data-action="edit-course"][data-id="${media.id}"]`).click();await until(()=>d.querySelector('#courseForm'),'course editor').catch(e=>{console.log('EDITOR TOAST:',d.querySelector('#toast').textContent);throw e});assert(d.querySelector('[data-upload="quality"]'));assert(d.querySelector('[data-upload="caption"]'));d.querySelector('.dialog-close').click();
 d.querySelector('[data-go="settings"]').click();await until(()=>d.querySelector('#view h1')?.textContent==='Configurações','settings page');assert(d.querySelector('#view').textContent.includes('sem IA'));
 const w=await portal(student,'aluno.html'),s=w.document;assert(!s.querySelector('[data-go="reports"]'));s.querySelector('[data-go="courses"]').click();await until(()=>s.querySelector(`[data-action="open-course"][data-id="${media.id}"]`),'student catalog');s.querySelector(`[data-action="open-course"][data-id="${media.id}"]`).click();await until(()=>s.querySelector('#lessonVideo'),'classroom');assert(s.querySelector('#playbackSpeed'));assert(s.querySelector('#qualitySelect option[value]'));assert.equal(s.querySelector('track').srclang,'pt');const speed=s.querySelector('#playbackSpeed');speed.value='1.5';speed.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(s.querySelector('#lessonVideo').playbackRate,1.5);
 s.querySelector('[data-go="dashboard"]').click();await until(()=>s.querySelector('.learning-map'),'learning map preserved');assert(s.querySelector('[data-game-link]'));assert(s.querySelector('[data-go="student-card"]'));s.querySelector('[data-go="forum"]').click();await until(()=>s.querySelector('#forumTopic'),'forum topics');assert(s.querySelector('[data-action="new-topic"]'));
 s.querySelector('[data-go="support"]').click();await until(()=>s.querySelector('#ticketForm'),'student support');assert(s.querySelector('#robotForm'));s.querySelector('#robotForm textarea').value='Como proteger uma senha?';s.querySelector('#robotForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await until(()=>s.querySelector('[data-action="tutor-handoff"]'),'tutor results');assert(s.querySelector('#robotAnswer').textContent.includes('sem IA'));
 console.log('PASS: emulated DOM navigation for staff and student, report filters/export, course media editor, player speed/captions, topic selector, material tutor and preserved student features.');
}finally{for(const w of windows)await w.happyDOM.abort();for(const w of windows)await w.close()}
