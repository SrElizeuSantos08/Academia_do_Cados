import {pilotCourse} from './pilot.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const quizKey=quiz=>(quiz||[]).map(({question,options,answer})=>({question,options,answer}));
export function planBasicContent(input){
 const modules=structuredClone(input),conflicts=[],lessons=[];
 for(const expectedModule of pilotCourse.modules){
  const module=modules.find(m=>m.id===expectedModule.id);
  for(const expected of expectedModule.lessons){
   const lesson=module?.lessons.find(l=>l.id===expected.id);
   if(!lesson){conflicts.push('Aula ausente: '+expected.title);continue}
   const current=quizKey(lesson.quiz),desired=quizKey(expected.quiz);
   const original=current.length===1&&same(current,desired.slice(0,1));
   const identical=same(current,desired);
   if(!original&&!identical){conflicts.push('Avaliação personalizada: '+lesson.title);continue}
   const quizUpdated=!identical;if(quizUpdated)lesson.quiz=structuredClone(expected.quiz);
   const materials=lesson.materials||[],missing=(expected.materials||[]).filter(m=>!materials.some(x=>x.url===m.url));
   if(missing.length)lesson.materials=[...materials,...structuredClone(missing)];
   lessons.push({id:lesson.id,title:lesson.title,questions:lesson.quiz.length,quizUpdated,materialsAdded:missing.length});
  }
 }
 return {modules,conflicts,lessons,changed:lessons.some(l=>l.quizUpdated||l.materialsAdded)};
}
