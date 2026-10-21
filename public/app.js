const lessons=[
  {
    "title": "Calma, dedo nervoso!",
    "topic": "Urgência e pressão",
    "intro": "Chegou um e-mail com mais urgência que o despertador de segunda-feira. Antes de clicar no susto, vamos conferir essa história.",
    "app": "Caixa de entrada",
    "from": "Central de atendimento <aviso@conta-exemplo.invalid>",
    "subject": "Sua conta será bloqueada hoje",
    "message": "Identificamos uma pendência. Regularize seus dados imediatamente para manter seu acesso.",
    "cta": "Regularizar agora",
    "risk": "Na pressa de evitar o bloqueio, o usuário clica e informa a senha sem confirmar a origem. O botão ganhou a corrida; a verificação ficou para trás. Em uma página falsa, os dados podem ser capturados.",
    "safe": "Acesse o serviço pelo aplicativo ou endereço oficial que você já conhece e confira se existe uma pendência. Se necessário, fale com o atendimento oficial.",
    "question": "Como verificar esse aviso de bloqueio?",
    "options": [
      "Abrir o link e conferir se a página parece profissional.",
      "Acessar o serviço por um canal oficial conhecido e verificar o aviso.",
      "Responder à mensagem com minha senha para confirmar a conta."
    ],
    "answer": 1,
    "explain": "A aparência pode ser copiada. A verificação precisa acontecer por um canal oficial acessado de forma independente.",
    "hook": "O e-mail está com pressa. Você não precisa estar."
  },
  {
    "title": "O anexo veio de brinde?",
    "topic": "Mensagens inesperadas",
    "intro": "Uma cobrança que você não esperava trouxe um anexo de acompanhante. Vamos descobrir se esse convidado deveria entrar.",
    "app": "Caixa de entrada",
    "from": "Financeiro Parceiro <cobranca@parceiro-exemplo.invalid>",
    "subject": "Pagamento pendente — comprovante anexo",
    "message": "Abra o arquivo cobranca.zip para consultar o valor e evitar multa. Não houve contato anterior sobre esta cobrança.",
    "cta": "cobranca.zip · Anexo simulado",
    "risk": "O usuário baixa e executa o arquivo inesperado. O nome parece importante, mas não funciona como crachá de confiança. Alguns anexos podem instalar programas maliciosos; o tipo do arquivo, sozinho, não comprova segurança.",
    "safe": "Confirme se a cobrança existe com a organização por um contato conhecido. Avalie remetente e contexto; não abra o arquivo enquanto houver dúvida.",
    "question": "O nome do remetente parece conhecido. Isso basta?",
    "options": [
      "Sim, o nome identifica a pessoa.",
      "Sim, se não houver erros de português.",
      "Não. Preciso conferir o contexto e confirmar a cobrança por outro canal."
    ],
    "answer": 2,
    "explain": "Nomes, logotipos e textos bem escritos podem ser imitados. Confirme a solicitação antes de interagir com anexos inesperados.",
    "hook": "Anexo inesperado não ganha passe livre só por chegar bem vestido."
  },
  {
    "title": "Sou eu! Só mudou o número…",
    "topic": "Identidade e confiança",
    "intro": "Foto conhecida, número novo e um pedido de dinheiro. Parece conversa de família, mas está faltando um detalhe: confirmar quem está falando.",
    "app": "Mensagens no navegador",
    "from": "Número desconhecido · Foto de uma pessoa conhecida",
    "subject": "Oi, troquei meu número!",
    "message": "Meu celular deu problema. Preciso que você pague uma conta agora. Depois te devolvo. Não consigo atender ligação.",
    "cta": "Ver dados para transferência",
    "risk": "O usuário acredita na foto e no nome e transfere o dinheiro. O perfil passou no teste da aparência, mas ninguém confirmou a identidade. Fotos podem ser copiadas e contas podem estar comprometidas.",
    "safe": "Ligue para o número que você já tinha ou confirme por outro canal confiável. Não compartilhe códigos de acesso recebidos por mensagem.",
    "question": "Qual é a melhor próxima ação?",
    "options": [
      "Confirmar com a pessoa pelo contato que eu já conhecia.",
      "Transferir um valor menor como teste.",
      "Pedir uma foto do perfil como prova."
    ],
    "answer": 0,
    "explain": "Verificar por um canal independente ajuda a confirmar quem está pedindo. Fotos e informações pessoais podem ter sido copiadas.",
    "hook": "Foto conhecida não é reconhecimento facial de confiança."
  },
  {
    "title": "Uma senha para governar tudo?",
    "topic": "Autenticação",
    "intro": "A mesma senha no e-mail, na loja e na rede social? Prático para lembrar, mas também pode facilitar a vida de quem a descobrir.",
    "app": "Configurações de conta",
    "from": "Conta demonstrativa · Proteção de acesso",
    "subject": "Fortaleça o acesso à sua conta",
    "message": "Situação inicial: uma senha reutilizada em vários serviços e autenticação multifator desativada.",
    "cta": "Revisar proteção da conta",
    "risk": "Uma senha foi reutilizada em vários serviços. Se ela vazar em um deles, alguém pode testar a mesma combinação nos demais. A praticidade acabou fazendo hora extra para a pessoa errada.",
    "safe": "Use senhas longas e únicas, considere um gerenciador de senhas confiável e ative a autenticação multifator disponível. Guarde os códigos de recuperação em local seguro.",
    "question": "Qual combinação protege melhor as contas?",
    "options": [
      "A mesma senha longa em todos os serviços.",
      "Uma senha única por serviço e autenticação multifator.",
      "Uma senha curta trocada toda semana."
    ],
    "answer": 1,
    "explain": "Senhas únicas reduzem o efeito de um vazamento. A autenticação multifator acrescenta uma camada de proteção. Nunca aprove um acesso que você não iniciou.",
    "hook": "Sua senha não precisa fazer carreira em todos os aplicativos."
  },
  {
    "title": "Promoção ou conto de fadas?",
    "topic": "Ofertas e destinatários",
    "intro": "Um produto caríssimo por um preço de lanche e uma oferta acabando em cinco minutos. Antes do final feliz, vamos conferir a loja e o pagamento.",
    "app": "Loja demonstrativa",
    "from": "Oferta recebida por anúncio",
    "subject": "Últimas unidades: oferta por tempo limitado",
    "message": "Um produto de alto valor está anunciado por um preço muito baixo. A loja exige pagamento imediato para um destinatário diferente do vendedor.",
    "cta": "Pagar oferta",
    "risk": "O usuário se empolga com o desconto e ignora a loja e o destinatário do pagamento. A oferta parecia um presente, mas o valor pode sair da conta sem que o produto chegue.",
    "safe": "Pesquise a reputação e os contatos da loja, verifique o endereço e confira o destinatário e o valor antes de confirmar. Um cadeado no navegador não comprova a honestidade da loja.",
    "question": "A página tem cadeado. A compra é confiável?",
    "options": [
      "Sim, o cadeado garante que a loja é legítima.",
      "Sim, se a oferta estiver acabando.",
      "O cadeado não basta; preciso verificar a loja e os dados do pagamento."
    ],
    "answer": 2,
    "explain": "Uma conexão protegida também pode existir em uma página fraudulenta. Verifique o vendedor e o pagamento, sem ceder à pressão.",
    "hook": "O desconto pode ser enorme. A pausa para conferir também vale muito."
  },
  {
    "title": "Baixou o app ou a mudança toda?",
    "topic": "Fontes e permissões",
    "intro": "Você queria um programa e o instalador ofereceu extensão, barra de busca e companhia. Vamos conferir quem foi convidado para o computador.",
    "app": "Navegador · Download demonstrativo",
    "from": "Página de terceiros",
    "subject": "Baixe seu programa gratuitamente",
    "message": "A página mostra anúncios com botões de download e um instalador que oferece uma extensão adicional.",
    "cta": "Baixar instalador",
    "risk": "O usuário clica no primeiro botão e aceita todas as etapas sem ler. Queria um programa, mas a instalação virou excursão. Pode acabar com aplicativos ou extensões que não pretendia usar.",
    "safe": "Procure o site oficial ou a loja oficial do sistema. Revise o nome do programa, as permissões e as opções de instalação. Mantenha sistema e aplicativos atualizados.",
    "question": "Como obter o programa com mais segurança?",
    "options": [
      "Usar a fonte oficial e revisar as opções e permissões.",
      "Clicar no maior botão da página.",
      "Desativar a proteção do computador para facilitar a instalação."
    ],
    "answer": 0,
    "explain": "A fonte do programa importa. Pedidos para desativar proteções ou instalar complementos inesperados merecem atenção.",
    "hook": "O botão maior não vem com diploma de confiabilidade."
  },
  {
    "title": "Seu arquivo virou celebridade?",
    "topic": "Quem pode acessar?",
    "intro": "O documento era para uma pessoa, mas o link ficou aberto para qualquer visitante. Vamos ajustar a lista de convidados antes que a plateia cresça.",
    "app": "Compartilhamento de arquivos",
    "from": "Documento demonstrativo · Dados pessoais fictícios",
    "subject": "Compartilhar documento",
    "message": "Permissão selecionada: qualquer pessoa com o link pode visualizar. O objetivo era compartilhar apenas com uma pessoa.",
    "cta": "Copiar link público",
    "risk": "O usuário compartilha um link com acesso amplo demais. Se ele for encaminhado, o arquivo pode ganhar uma plateia que não estava na lista. Informações podem chegar a pessoas que não deveriam acessá-las.",
    "safe": "Compartilhe apenas as informações necessárias, restrinja o acesso aos destinatários certos e escolha a menor permissão adequada. Revise acessos quando não forem mais necessários.",
    "question": "Como compartilhar com apenas um destinatário?",
    "options": [
      "Publicar o link e pedir que não encaminhem.",
      "Restringir o acesso à pessoa e revisar sua permissão.",
      "Deixar público por alguns minutos."
    ],
    "answer": 1,
    "explain": "A configuração de acesso deve refletir quem realmente precisa do documento. Um pedido para não encaminhar não substitui as permissões.",
    "hook": "Documento pessoal não precisa de fã-clube."
  },
  {
    "title": "Cliquei. E agora, produção?",
    "topic": "Resposta e recuperação",
    "intro": "Percebeu que informou a senha em uma página falsa? Respire. Não existe botão de voltar no tempo, mas existem próximos passos que ajudam.",
    "app": "Alerta de segurança demonstrativo",
    "from": "Revisão da ação anterior",
    "subject": "Informei minha senha em um site suspeito",
    "message": "Você fechou a página, mas a senha já pode ter sido enviada. Não é preciso enfrentar a situação sozinho.",
    "cta": "Revisar o que aconteceu",
    "risk": "O usuário fecha a aba e espera que o problema desapareça com ela. O navegador fechou, mas os dados já podem ter sido enviados. É importante proteger a conta e procurar ajuda.",
    "safe": "De um dispositivo confiável, acesse o serviço oficial e altere a senha exposta. Troque-a também onde foi reutilizada, encerre sessões desconhecidas e revise a autenticação. Contate o suporte oficial; em ambiente de trabalho, avise o responsável pela segurança.",
    "question": "Qual atitude ajuda após expor uma senha?",
    "options": [
      "Esperar para ver se acontece algo.",
      "Apagar apenas o histórico do navegador.",
      "Proteger a conta pelo serviço oficial e buscar suporte quando necessário."
    ],
    "answer": 2,
    "explain": "A ação rápida pode limitar os danos. Se houve exposição financeira, procure também a instituição envolvida pelos canais oficiais.",
    "hook": "Sem julgamento: pedir ajuda faz parte da proteção."
  }
];
const $=id=>document.getElementById(id);let state={done:[],score:null};try{const saved=JSON.parse(localStorage.getItem('bbs-academy-pilot-v1'));if(saved&&Array.isArray(saved.done))state={done:saved.done.filter(n=>Number.isInteger(n)&&n>=0&&n<8),score:typeof saved.score==='number'?saved.score:null}}catch{}let selected=0,stage=0,timer=null,solved=false;
function persist(){try{localStorage.setItem('bbs-academy-pilot-v1',JSON.stringify(state))}catch{}renderProgress()}
function renderProgress(){const count=new Set(state.done).size;$('progress').value=count;$('percent').textContent=Math.round(count/8*100)+'%';$('progresslabel').textContent=`${count} de 8 módulos concluídos`;$('quizStatus').textContent=state.score===null?'Você pode revisar as aulas quantas vezes quiser.':`Último resultado: ${state.score}% de acertos. ${state.score>=75?'Critério de nota atingido nesta demonstração.':'Revise os temas e tente novamente.'}`;renderModules()}
function renderModules(){$('modules').replaceChildren();lessons.forEach((l,i)=>{const b=document.createElement('button');b.className='module'+(selected===i?' selected':'');b.innerHTML=`<span class="num">MÓDULO ${String(i+1).padStart(2,'0')} <span>${state.done.includes(i)?'✓':'↗'}</span></span><h3>${l.title}</h3><small>${state.done.includes(i)?'Concluído · Revisar':l.topic}</small>`;b.onclick=()=>{loadLesson(i);$('laboratorio').scrollIntoView({behavior:'smooth'})};$('modules').append(b)})}
function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ Reproduzir cena'}
function renderScene(){const l=lessons[selected];const recorded=selected===0||selected===1;const lessonNumber=String(selected+1).padStart(2,'0');const videoSrc=selected===0?'assets/videos/modulo-01-aula-01.mp4':'assets/videos/modulo-02-aula-01.mp4';$('play').parentElement.hidden=recorded;$('scene').classList.toggle('recorded-lesson',recorded);document.querySelector('.caption').textContent=recorded?'Vídeo da aula '+lessonNumber+' · Módulo '+lessonNumber:'Demonstração interativa de tela · Dados e serviços fictícios · Sem vídeo de professor';if(recorded){$('screenApp').textContent='Aula '+lessonNumber+' · '+l.title;$('scene').innerHTML=`<video controls preload="metadata" playsinline aria-label="Aula ${lessonNumber}" src="${videoSrc}">Seu navegador não suporta vídeo HTML5. <a href="${videoSrc}">Abrir vídeo da aula ${lessonNumber}</a>.</video>`;return;}$('stepcount').textContent=`Etapa ${stage+1} de 3`;$('scene').innerHTML=`<div class="mailfrom">${l.from}</div><h3>${stage===0?l.subject:stage===1?'1. O clique foi mais rápido que a checagem':'2. Agora, com o radar ligado'}</h3><p>${stage===0?l.message:stage===1?l.risk:l.safe}</p>${stage===0?`<span class="fakebutton">${l.cta}</span>`:`<div class="scenehint">${stage===1?'Pausa na cena: vamos entender o risco.':'Boa pausa, boa escolha. Pratique ao lado.'}</div>`}`}
function loadLesson(i){stop();selected=i;stage=0;solved=false;const l=lessons[i];$('lessonTitle').textContent=l.title;$('lessonIntro').textContent=l.intro;$('screenApp').textContent=l.app+' · Ambiente simulado';$('lessonText').innerHTML=`<strong>${l.hook}</strong><p>${l.safe}</p>`;$('question').textContent=l.question;$('feedback').textContent='';$('complete').disabled=true;$('complete').textContent=state.done.includes(i)?'Módulo concluído · Continuar →':'Concluir módulo →';$('answers').replaceChildren();l.options.forEach((o,j)=>{const b=document.createElement('button');b.className='answer';b.textContent=o;b.onclick=()=>{if(solved)return;if(j===l.answer){solved=true;b.classList.add('correct');$('feedback').textContent='✓ Boa! Radar ligado. '+l.explain;$('complete').disabled=false}else{b.classList.add('wrong');$('feedback').textContent='Sem drama: vamos conferir juntos. '+l.explain}};$('answers').append(b)});renderScene();renderModules()}
$('play').onclick=()=>{if(timer){stop();return}stage=0;renderScene();$('play').textContent='Ⅱ Pausar cena';timer=setInterval(()=>{stage++;renderScene();if(stage===2)stop()},6500)};
$('complete').onclick=()=>{if(!solved)return;if(!state.done.includes(selected))state.done.push(selected);persist();if(selected<7)loadLesson(selected+1);else{$('feedback').textContent='✓ Trilha concluída. Você já pode fazer a avaliação final.';$('avaliacao').scrollIntoView({behavior:'smooth'})}};
let qi=0,qa=[],quizChecked=false;
function drawQuiz(){const l=lessons[qi];$('quizBody').replaceChildren();const meta=document.createElement('p');meta.className='small';meta.textContent=`Situação ${qi+1} de 8`;const h=document.createElement('h2');h.textContent=l.question;$('quizBody').append(meta,h);l.options.forEach((o,j)=>{const b=document.createElement('button');b.className='answer';b.textContent=o;b.onclick=()=>{qa[qi]=j;qi++;if(qi<8)drawQuiz();else finishQuiz()};$('quizBody').append(b)})}
function finishQuiz(){const correct=qa.filter((a,i)=>a===lessons[i].answer).length;state.score=correct/8*100;persist();$('quizBody').innerHTML=`<h2>${correct} de 8 acertos</h2><p>${state.score>=75?'Você atingiu a nota proposta para esta edição piloto.':'Continue praticando. Você pode revisar os módulos e tentar novamente.'}</p><p class="small">Resultado demonstrativo. A emissão oficial de certificado depende da validação da BBS One e de uma plataforma com registro de alunos e resultados.</p>`;lessons.forEach((l,i)=>{const p=document.createElement('p');p.className='small';p.textContent=`${qa[i]===l.answer?'✓':'↺'} ${l.title}: ${l.explain}`;$('quizBody').append(p)});const retry=document.createElement('button');retry.className='button';retry.textContent='Tentar novamente';retry.onclick=()=>{qi=0;qa=[];drawQuiz()};$('quizBody').append(retry)}
$('startQuiz').onclick=()=>{if(new Set(state.done).size<8){$('quizStatus').textContent='Conclua as situações práticas dos 8 módulos para iniciar a avaliação.';return}qi=0;qa=[];drawQuiz();$('quizDialog').showModal()};
$('showCert').onclick=()=>$('certDialog').showModal();$('learnerName').oninput=e=>{$('certName').textContent=e.target.value.trim()||'Nome do participante'};$('print').onclick=()=>window.print();document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());$('reset').onclick=()=>{if(confirm('Apagar o progresso desta edição piloto neste navegador?')){state={done:[],score:null};persist();loadLesson(0)}};renderProgress();loadLesson(0);
