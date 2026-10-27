import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { pilotCourse } from '../lib/pilot.mjs';
import { validateModules } from '../lib/lms.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const content = JSON.parse(read('content/module-portfolios.json'));
const migration = read('tests/fixtures/local-drizzle/0006_module_portfolios_and_quizzes.sql');
const originalFirstLesson = JSON.stringify(pilotCourse.modules[0]);
assert.equal(content.length, 7);
const allQuestions = new Set();
for (const [index, module] of pilotCourse.modules.entries()) {
  const lesson = module.lessons[0];
  assert.equal(lesson.quiz.length, 5);
  assert.equal(lesson.materials.length, 1);
  for (const question of lesson.quiz) {
    assert.equal(question.options.length, 3);
    assert.equal(new Set(question.options).size, 3);
    assert(question.answer >= 0 && question.answer < question.options.length);
    assert(!allQuestions.has(question.question), 'Do not repeat the same question across modules');
    allQuestions.add(question.question);
  }
  const pdf = readFileSync(new URL('../public' + lesson.materials[0].url, import.meta.url));
  assert.equal(pdf.subarray(0,5).toString(), '%PDF-');
  if (index) {
    assert.deepEqual(lesson.quiz.slice(1), content[index - 1].questions);
    assert.equal(lesson.materials[0].url, '/materials/' + content[index - 1].file);
  }
}
assert.equal(allQuestions.size, 40);
assert.equal(validateModules(pilotCourse.modules, pilotCourse.id).flatMap(m => m.lessons).filter(l => l.materials.length === 1).length, 8);
const wrongMaterial = structuredClone(pilotCourse.modules);
wrongMaterial[1].lessons[0].materials = wrongMaterial[2].lessons[0].materials;
assert.throws(() => validateModules(wrongMaterial, pilotCourse.id), /Material não autorizado/);

function migrate({reorder = false, custom = false} = {}) {
  const sql = new DatabaseSync(':memory:');
  sql.exec(read('tests/fixtures/local-drizzle/0000_brainy_dreaming_celestial.sql'));
  const modules = structuredClone(pilotCourse.modules);
  for (const module of modules.slice(1)) {
    module.lessons[0].quiz.splice(1);
    delete module.lessons[0].materials;
    module.lessons[0].video = 'existing-upload-' + module.id;
  }
  if (custom) {
    modules[2].lessons[0].quiz[0].question = 'Pergunta personalizada preservada';
    modules[3].lessons[0].materials = [{title:'Material interno anterior',url:'/internal.pdf'}];
  }
  if (reorder) modules.reverse();
  const initial = JSON.stringify(modules);
  sql.prepare('INSERT INTO courses(id,title,body,updated) VALUES(?,?,?,?)').run(pilotCourse.id, pilotCourse.title, initial, 'before');
  sql.prepare('INSERT INTO courses(id,title,body,updated) VALUES(?,?,?,?)').run('other-course','Outro curso',initial,'before');
  sql.exec(migration);
  const after = JSON.parse(sql.prepare('SELECT body FROM courses WHERE id=?').get(pilotCourse.id).body);
  for (const module of after) {
    const lesson = module.lessons[0];
    if (module.id === 'pilot-m1') {assert.equal(JSON.stringify(module), originalFirstLesson); continue;}
    assert.equal(lesson.video, 'existing-upload-' + module.id);
    const expected = pilotCourse.modules.find(m => m.id === module.id).lessons[0];
    if (custom && module.id === 'pilot-m3') {
      assert.equal(lesson.quiz.length, 1);
      assert.equal(lesson.quiz[0].question, 'Pergunta personalizada preservada');
    } else assert.deepEqual(lesson.quiz, expected.quiz);
    assert(lesson.materials.some(r => r.url === expected.materials[0].url));
    if (custom && module.id === 'pilot-m4') assert(lesson.materials.some(r => r.url === '/internal.pdf'));
  }
  const once = sql.prepare('SELECT body FROM courses WHERE id=?').get(pilotCourse.id).body;
  sql.exec(migration);
  assert.equal(sql.prepare('SELECT body FROM courses WHERE id=?').get(pilotCourse.id).body, once);
  assert.equal(sql.prepare('SELECT body FROM courses WHERE id=?').get('other-course').body, initial);
  sql.close();
}
migrate();
migrate({reorder:true});
migrate({reorder:true,custom:true});
console.log('PASS: 40 distinct questions, eight PDFs, lesson-specific allowlist, migration by IDs, idempotency and preservation of custom content/videos.');
