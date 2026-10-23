import content from '../content/intermediate-course.json' with {type:'json'};

export const intermediateCourse={
  id:'cyber-intermediate',title:'Segurança Digital no Trabalho',
  description:'Seis decisões empresariais para avaliar contexto, permissões, procedimentos e consequências na segurança da informação.',
  level:'Intermediário',folder:'Conscientização',sort:1,
  modules:content.map(item=>({id:'intermediate-m'+item.number,title:item.moduleTitle,hours:0.25,lessons:[{
    id:'intermediate-l'+item.number,title:item.lessonTitle,
    description:'Foco prático: '+item.focus+'\n\nAnalise o cenário, estude o portfólio e compare sua decisão com a orientação. Em seguida, responda às cinco perguntas e confira os comentários.',
    scenario:item.scenario,decision:item.decision,plannedVideoMinutes:5,
    minutes:15,video:'',materials:[{title:'Portfólio intermediário · Módulo '+String(item.number).padStart(2,'0')+' (PDF)',url:'/materials/portfolio-intermediario-'+String(item.number).padStart(2,'0')+'-2026.pdf'}],
    quiz:item.questions,
  }]})),
};
