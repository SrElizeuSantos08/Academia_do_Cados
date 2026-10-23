// Closing assessments use a separate progress key; lesson history is untouched.
export const FINAL_PREFIX='@final:';
export const MIN_SCORE=75;
export function moduleResult(module,progress){
 const byLesson=new Map(progress.map(p=>[p.lesson,p]));
 const assessed=module.lessons.filter(l=>l.quiz?.length);
 const eligible=Boolean(module.lessons.length&&module.lessons.every(l=>{
  const p=byLesson.get(l.id);return p?.done&&(!l.quiz?.length||(Number.isFinite(p.score)&&p.score>=MIN_SCORE));
 }));
 const count=assessed.reduce((n,l)=>n+l.quiz.length,0);
 const score=count?Math.round(assessed.reduce((n,l)=>n+(byLesson.get(l.id)?.score||0)*l.quiz.length,0)/count):null;
 return {id:module.id,eligible,score};
}
export async function closingAssessment(course){
 const modules=JSON.parse(course.body);
 // Review one decision per module, spanning the entire course.
 const questions=modules.map((m,i)=>{
  const bank=m.lessons.flatMap(l=>(l.quiz||[]).map(q=>({...q,topic:m.title})));
  return bank[i%(bank.length||1)]||{topic:m.title,question:'Ao aplicar o conteúdo de '+m.title+', qual conduta você deve adotar?',options:['Ignorar as regras quando houver urgência.','Considerar o contexto, seguir os procedimentos autorizados e comunicar dúvidas ao responsável.','Compartilhar dados e acessos para agilizar qualquer solicitação.'],answer:1,explanation:'A aplicação do conhecimento exige avaliar o contexto, respeitar as autorizações e buscar orientação pelo canal previsto.'};
 });
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(questions)));
 const key=FINAL_PREFIX+Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,32);
 return {key,questions};
}
export async function certificationState(course,progress){
 const results=JSON.parse(course.body).map(m=>moduleResult(m,progress));
 const assessment=await closingAssessment(course),record=progress.find(p=>p.lesson===assessment.key);
 const ready=Boolean(results.length&&results.every(m=>m.eligible));
 return {modules:results,ready,available:assessment.questions.length>0,
  passed:Boolean(record?.done&&record.score>=MIN_SCORE),score:record?.score??null,
  completedAt:record?.done?record.updated:null,minimumScore:MIN_SCORE,questions:assessment.questions.length};
}
