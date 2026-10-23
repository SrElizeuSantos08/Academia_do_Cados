import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';

const sharedSource = readFileSync(new URL('../public/module-badges.js', import.meta.url), 'utf8');
const portalSource = readFileSync(new URL('../public/portal.js', import.meta.url), 'utf8');
const shared = {window: {}};
vm.runInNewContext(sharedSource, shared);
const badges = shared.window.AcademyBadges;

const names = ['Mente Fria', 'Guardião dos Anexos', 'Identidade Confirmada', 'Dupla Proteção', 'Caçador de Ciladas', 'Fonte Confiável', 'Acesso sob Controle', 'Resposta Rápida'];
for (let i = 0; i < names.length; i++) {
  const badge = badges.forModule('cyber-pilot', 'pilot-m' + (i + 1));
  assert.equal(badge.name, names[i]);
  assert.equal(badges.forIndex(i), badge);
  assert(existsSync(new URL('../public' + badge.image, import.meta.url)));
}
assert.equal(badges.forModule('other-course', 'pilot-m1'), undefined);
assert.equal(badges.forModule('cyber-pilot', 'unknown'), undefined);
assert.equal(badges.isComplete({lessons: []}, () => ({done: 1})), false);
assert.equal(badges.isComplete({lessons: [{id: 'a'}, {id: 'b'}]}, id => id === 'a' ? {done: 1} : undefined), false);

// Execute the actual completion function with a controlled API and refreshed server progress.
const completeSource = portalSource.slice(portalSource.indexOf('async function completeLesson('), portalSource.indexOf('\nasync function renderForum('));
const helperSource = portalSource.slice(portalSource.indexOf('function moduleComplete('), portalSource.indexOf('function renderEarnedBadges('));
async function scenario({alreadyDone = false, passed = true, serverDone = true, incompleteSibling = false, refreshFails = false, auto = true} = {}) {
  const courseModule = {id: 'pilot-m1', lessons: [{id: 'pilot-l1'}, ...(incompleteSibling ? [{id: 'sibling'}] : [])]};
  const course = {id: 'cyber-pilot', modules: [courseModule, {id: 'pilot-m2', lessons: [{id: 'pilot-l2'}]}]};
  let modal, calls = 0, renders = 0, focused = 0;
  const result = {textContent: ''};
  const context = {
    S: {courses: [course], progress: alreadyDone ? [{course: course.id, lesson: 'pilot-l1', done: 1}] : []},
    courseId: course.id, lessonId: 'pilot-l1', videoEnded: true, completingLesson: false,
    moduleBadges: {...badges, celebrate: (badge, options) => {modal = {badge, ...options};}},
    $: selector => selector === '#autoplayNext' ? {checked: auto} : selector === '#lessonVideo' ? null : selector === '#lessonResult' ? result : {focus() {focused++;}},
    lessons: c => c.modules.flatMap(m => m.lessons),
    api: async () => {calls++; return {passed, score: passed ? 100 : 0};},
    refresh: async () => {if (refreshFails) throw Error('Offline'); context.S.progress = serverDone ? [{course: course.id, lesson: 'pilot-l1', done: 1}] : [];},
    toast() {}, renderClassroom() {renders++;},
  };
  context.progress = (c, l) => context.S.progress.find(p => p.course === c && p.lesson === l);
  vm.createContext(context);
  vm.runInContext(helperSource + '\n' + completeSource, context);
  let error;
  try {await context.completeLesson([1]);} catch (e) {error = e;}
  return {context, result, error, get modal() {return modal;}, get calls() {return calls;}, get renders() {return renders;}, get focused() {return focused;}};
}

const completed = await scenario();
assert.equal(completed.modal.badge.name, 'Mente Fria');
assert.equal(completed.context.lessonId, 'pilot-l1', 'Do not advance behind the achievement dialog');
completed.modal.onDismiss();
assert.equal(completed.context.lessonId, 'pilot-l1', 'Dismissal must stay on the completed lesson');
completed.modal.onContinue();
assert.equal(completed.context.lessonId, 'pilot-l2');
assert(completed.focused > 0);

const manual = await scenario({auto: false});
manual.modal.onContinue();
assert.equal(manual.context.lessonId, 'pilot-l1', 'Respect disabled automatic advancement');

const failed = await scenario({passed: false});
assert.equal(failed.modal, undefined);
assert.match(failed.result.textContent, /75%/);
assert.equal((await scenario({incompleteSibling: true})).modal, undefined, 'All module lessons are required');
assert.equal((await scenario({alreadyDone: true})).modal, undefined, 'No repeated celebration for completed modules');
assert.equal((await scenario({serverDone: false})).modal, undefined, 'A successful response alone is insufficient');
const offline = await scenario({refreshFails: true});
assert(offline.error);
assert.equal(offline.modal, undefined);
assert.equal(offline.context.completingLesson, false);

// Native dialog behavior: continue invokes advancement, close/escape only dismisses.
function dialogScenario(proceed) {
  const elements = new Map();
  let closeListener, continued = 0, dismissed = 0, removed = false;
  const dialog = {
    returnValue: '', setAttribute() {},
    querySelector(selector) {if (!elements.has(selector)) elements.set(selector, {addEventListener(type, fn) {this[type] = fn;}}); return elements.get(selector);},
    addEventListener(type, fn) {if (type === 'close') closeListener = fn;},
    showModal() {this.open = true;},
    close(value = '') {this.returnValue = value; closeListener();},
    remove() {removed = true;},
  };
  const context = {window: {}, document: {createElement: () => dialog, body: {append() {}}}};
  vm.runInNewContext(sharedSource, context);
  context.window.AcademyBadges.celebrate(badges.forIndex(0), {onContinue: () => continued++, onDismiss: () => dismissed++});
  assert(dialog.open);
  if (proceed) elements.get('.ac-achievement-continue').click(); else dialog.close();
  assert(removed);
  assert.equal(continued, proceed ? 1 : 0);
  assert.equal(dismissed, proceed ? 0 : 1);
}
dialogScenario(true);
dialogScenario(false);

// Drive the real pilot script through all eight quizzes and completion callbacks.
function testPilot() {
  const nodes = new Map();
  let saved, modal, celebrations = 0;
  const makeNode = () => ({
    innerHTML: '', textContent: '', children: [], parentElement: {},
    classList: {add() {}, toggle() {}},
    replaceChildren() {this.children = [];},
    append(child) {this.children.push(child);},
    insertAdjacentHTML(position, html) {this.innerHTML += html;},
    querySelector() {return null;}, scrollIntoView() {}, focus() {},
  });
  const node = id => {if (!nodes.has(id)) nodes.set(id, makeNode()); return nodes.get(id);};
  const context = {
    window: {AcademyBadges: {...badges, celebrate(badge, options) {modal = {badge, ...options}; celebrations++;}}},
    document: {getElementById: node, createElement: makeNode, querySelector: () => node('caption'), querySelectorAll: () => []},
    localStorage: {getItem: () => null, setItem: (key, value) => {saved = JSON.parse(value);}},
    clearInterval() {}, setInterval() {}, confirm: () => true,
  };
  vm.createContext(context);
  vm.runInContext(readFileSync(new URL('../public/app.js', import.meta.url), 'utf8'), context);
  const firstAnswer = vm.runInContext('lessons[0].answer', context);
  node('answers').children[(firstAnswer + 1) % 3].onclick();
  node('complete').onclick();
  assert.equal(celebrations, 0, 'Wrong answers must not earn a pilot badge');
  for (let i = 0; i < 8; i++) {
    const answer = vm.runInContext('lessons[' + i + '].answer', context);
    node('answers').children[answer].onclick();
    node('complete').onclick();
    assert.equal(modal.badge.name, names[i]);
    assert(saved.done.includes(i));
    assert.equal(vm.runInContext('selected', context), i, 'Pilot also waits for Continue');
    assert(node('lessonText').innerHTML.includes('Selo ' + names[i]));
    modal.onContinue();
  }
  assert.equal(celebrations, 8);
  assert.equal(saved.done.length, 8);
  vm.runInContext('loadLesson(0)', context);
  assert(node('lessonText').innerHTML.includes('Mente Fria'), 'Earned cards survive revisiting a lesson');
  node('answers').children[firstAnswer].onclick();
  node('complete').onclick();
  assert.equal(celebrations, 8, 'Reviewing a pilot lesson must not celebrate again');
  node('reset').onclick();
  assert.equal(saved.done.length, 0);
  assert(!node('lessonText').innerHTML.includes('ac-badge-card'));
}
testPilot();

for (const name of ['aluno', 'admin', 'portal', 'piloto']) {
  const html = readFileSync(new URL('../public/' + name + '.html', import.meta.url), 'utf8');
  assert(html.includes('module-badges.css'));
  assert(html.indexOf('src="module-badges.js"') < html.indexOf('src="' + (name === 'piloto' ? 'app' : 'portal') + '.js"'));
}
console.log('PASS: eight badge assets, complete modules only, server confirmation, failed quizzes, replay, offline refresh, accessible dialog actions and controlled automatic advancement.');
