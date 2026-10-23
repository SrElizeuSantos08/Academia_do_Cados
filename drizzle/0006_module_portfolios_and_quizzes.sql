-- Extend the seven existing pilot lessons without changing IDs, videos or history.
-- Match IDs rather than positions. Customized assessments are preserved.
-- Each update is idempotent: only the original one-question quiz is extended.
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m2'
   AND json_extract(l.value,'$.id')='pilot-l2'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.quiz',
    json_insert(json_extract(body, (SELECT path FROM target) || '.quiz'),
      '$[#]', json('{"question":"Uma cobrança inesperada contém um arquivo ZIP com senha. O que a senha comprova?","options":["Que o remetente foi verificado pelo Outlook.","Que todos os arquivos dentro dele são seguros.","Ela não comprova a legitimidade nem a segurança do conteúdo."],"answer":2}'),
      '$[#]', json('{"question":"Qual é a melhor forma de confirmar a cobrança antes de abrir o anexo?","options":["Usar um contato conhecido da organização, obtido fora da mensagem recebida.","Ligar apenas para o telefone informado no e-mail suspeito.","Abrir o ZIP para descobrir se a empresa é conhecida."],"answer":0}'),
      '$[#]', json('{"question":"O arquivo pede para desativar a proteção ou habilitar conteúdo inesperado. Como agir?","options":["Permitir, pois o documento precisa funcionar.","Interromper e consultar a equipe responsável pelo canal conhecido.","Pedir a um colega que execute primeiro."],"answer":1}'),
      '$[#]', json('{"question":"Você executou um arquivo do anexo e depois desconfiou. Qual informação ajuda a TI?","options":["Somente dizer que o computador parece normal.","Encaminhar o arquivo para toda a equipe experimentar.","Informar horário, mensagem, nome do arquivo e quais ações realizou."],"answer":2}'))), updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND json_array_length(json_extract(body, (SELECT path FROM target) || '.quiz'))=1
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].question')='O nome do remetente parece conhecido. Isso basta?'
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].answer')=2
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].options')=json('["Sim, o nome identifica a pessoa.","Sim, se não houver erros de português.","Não. Preciso conferir o contexto e confirmar a cobrança por outro canal."]');
--> statement-breakpoint
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m2'
   AND json_extract(l.value,'$.id')='pilot-l2'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.materials',
 json_insert(COALESCE(json_extract(body, (SELECT path FROM target) || '.materials'),'[]'), '$[#]', json('{"title":"Portfólio didático · Anexos e ZIP sem surpresas (PDF)","url":"/materials/portfolio-anexos-zip-2026.pdf"}'))),
 updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND (json_type(body, (SELECT path FROM target) || '.materials') IS NULL OR json_type(body, (SELECT path FROM target) || '.materials')='array')
 AND NOT EXISTS (SELECT 1 FROM json_each(json_extract(body, (SELECT path FROM target) || '.materials')) r
                 WHERE json_extract(r.value,'$.url')='/materials/portfolio-anexos-zip-2026.pdf');
--> statement-breakpoint
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m3'
   AND json_extract(l.value,'$.id')='pilot-l3'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.quiz',
    json_insert(json_extract(body, (SELECT path FROM target) || '.quiz'),
      '$[#]', json('{"question":"Uma foto conhecida e detalhes da sua rotina garantem que o contato é verdadeiro?","options":["Não. Esses dados podem ser copiados; é preciso confirmar por um canal conhecido.","Sim. Só a pessoa verdadeira conhece esses detalhes.","Sim, quando o contato demonstra urgência."],"answer":0}'),
      '$[#]', json('{"question":"O contato diz que mudou de número e não pode atender ligação. O que fazer?","options":["Enviar um valor pequeno para testar a identidade.","Pausar e procurar a pessoa pelo número antigo ou por outro contato confiável.","Aceitar a justificativa porque a foto é igual."],"answer":1}'),
      '$[#]', json('{"question":"Um suposto suporte pede seu código de verificação. Qual é a resposta segura?","options":["Enviar apenas metade do código.","Compartilhar se o perfil tiver o logotipo do serviço.","Não compartilhar e procurar o atendimento pelo canal oficial."],"answer":2}'),
      '$[#]', json('{"question":"Uma mensagem com a voz do gestor pede pagamento fora do procedimento. Como agir?","options":["Confirmar por outro canal e seguir as aprovações previstas.","Pagar, pois uma voz conhecida dispensa confirmação.","Encaminhar o código de acesso da empresa para provar disponibilidade."],"answer":0}'))), updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND json_array_length(json_extract(body, (SELECT path FROM target) || '.quiz'))=1
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].question')='Qual é a melhor próxima ação?'
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].answer')=0
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].options')=json('["Confirmar com a pessoa pelo contato que eu já conhecia.","Transferir um valor menor como teste.","Pedir uma foto do perfil como prova."]');
--> statement-breakpoint
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m3'
   AND json_extract(l.value,'$.id')='pilot-l3'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.materials',
 json_insert(COALESCE(json_extract(body, (SELECT path FROM target) || '.materials'),'[]'), '$[#]', json('{"title":"Portfólio didático · Identidade antes da confiança (PDF)","url":"/materials/portfolio-identidade-confianca-2026.pdf"}'))),
 updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND (json_type(body, (SELECT path FROM target) || '.materials') IS NULL OR json_type(body, (SELECT path FROM target) || '.materials')='array')
 AND NOT EXISTS (SELECT 1 FROM json_each(json_extract(body, (SELECT path FROM target) || '.materials')) r
                 WHERE json_extract(r.value,'$.url')='/materials/portfolio-identidade-confianca-2026.pdf');
--> statement-breakpoint
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m4'
   AND json_extract(l.value,'$.id')='pilot-l4'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.quiz',
    json_insert(json_extract(body, (SELECT path FROM target) || '.quiz'),
      '$[#]', json('{"question":"Por que reutilizar uma senha é arriscado?","options":["Porque uma senha longa só funciona em um aplicativo.","Porque a exposição em um serviço permite tentativas com a mesma senha nos demais.","Porque impede o uso de autenticação multifator."],"answer":1}'),
      '$[#]', json('{"question":"Você recebe pedidos MFA que não iniciou. Qual é a ação adequada?","options":["Aprovar um deles para os avisos pararem.","Enviar o código para quem disser ser do suporte.","Rejeitar os pedidos e procurar o canal oficial ou a TI."],"answer":2}'),
      '$[#]', json('{"question":"Como tratar os códigos de recuperação de uma conta?","options":["Guardá-los em local protegido e usá-los apenas no fluxo oficial de recuperação.","Deixá-los em uma pasta pública para não perdê-los.","Compartilhá-los com qualquer atendente que pedir."],"answer":0}'),
      '$[#]', json('{"question":"Um gerenciador de senhas confiável e autorizado ajuda principalmente a quê?","options":["Repetir a mesma senha em todos os serviços.","Criar e guardar senhas diferentes sem depender da memorização de todas.","Dispensar qualquer revisão de acessos ou segundo fator."],"answer":1}'))), updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND json_array_length(json_extract(body, (SELECT path FROM target) || '.quiz'))=1
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].question')='Qual combinação protege melhor as contas?'
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].answer')=1
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].options')=json('["A mesma senha longa em todos os serviços.","Uma senha única por serviço e autenticação multifator.","Uma senha curta trocada toda semana."]');
--> statement-breakpoint
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m4'
   AND json_extract(l.value,'$.id')='pilot-l4'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.materials',
 json_insert(COALESCE(json_extract(body, (SELECT path FROM target) || '.materials'),'[]'), '$[#]', json('{"title":"Portfólio didático · Senhas únicas e autenticação (PDF)","url":"/materials/portfolio-autenticacao-2026.pdf"}'))),
 updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND (json_type(body, (SELECT path FROM target) || '.materials') IS NULL OR json_type(body, (SELECT path FROM target) || '.materials')='array')
 AND NOT EXISTS (SELECT 1 FROM json_each(json_extract(body, (SELECT path FROM target) || '.materials')) r
                 WHERE json_extract(r.value,'$.url')='/materials/portfolio-autenticacao-2026.pdf');
--> statement-breakpoint
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m5'
   AND json_extract(l.value,'$.id')='pilot-l5'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.quiz',
    json_insert(json_extract(body, (SELECT path FROM target) || '.quiz'),
      '$[#]', json('{"question":"Uma promoção muito abaixo do preço habitual termina em poucos minutos. O que fazer?","options":["Pagar antes de conferir para garantir o desconto.","Pausar e verificar a oferta e a loja por fontes independentes.","Confiar porque o anúncio tem muitas imagens."],"answer":1}'),
      '$[#]', json('{"question":"O destinatário do pagamento diverge do vendedor e você não confirmou o motivo. Como agir?","options":["Pagar um valor menor para testar.","Aceitar qualquer explicação do chat do anúncio.","Não confirmar até esclarecer os dados por um canal oficial conhecido."],"answer":2}'),
      '$[#]', json('{"question":"O vendedor pede para concluir o pagamento fora da plataforma por um link no chat. Qual é o cuidado adequado?","options":["Verificar a solicitação com a plataforma e manter o fluxo de pagamento conhecido.","Abrir o link e informar os dados para descobrir se é real.","Compartilhar o código de autenticação como garantia."],"answer":0}'),
      '$[#]', json('{"question":"Você identificou uma fraude depois de pagar. Qual é a próxima ação?","options":["Enviar a taxa adicional prometida pelo suspeito para recuperar o valor.","Procurar imediatamente o banco pelo canal oficial e preservar os registros.","Apagar todos os comprovantes para encerrar o assunto."],"answer":1}'))), updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND json_array_length(json_extract(body, (SELECT path FROM target) || '.quiz'))=1
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].question')='A página tem cadeado. A compra é confiável?'
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].answer')=2
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].options')=json('["Sim, o cadeado garante que a loja é legítima.","Sim, se a oferta estiver acabando.","O cadeado não basta; preciso verificar a loja e os dados do pagamento."]');
--> statement-breakpoint
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m5'
   AND json_extract(l.value,'$.id')='pilot-l5'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.materials',
 json_insert(COALESCE(json_extract(body, (SELECT path FROM target) || '.materials'),'[]'), '$[#]', json('{"title":"Portfólio didático · Ofertas e pagamentos seguros (PDF)","url":"/materials/portfolio-ofertas-pagamentos-2026.pdf"}'))),
 updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND (json_type(body, (SELECT path FROM target) || '.materials') IS NULL OR json_type(body, (SELECT path FROM target) || '.materials')='array')
 AND NOT EXISTS (SELECT 1 FROM json_each(json_extract(body, (SELECT path FROM target) || '.materials')) r
                 WHERE json_extract(r.value,'$.url')='/materials/portfolio-ofertas-pagamentos-2026.pdf');
--> statement-breakpoint
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m6'
   AND json_extract(l.value,'$.id')='pilot-l6'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.quiz',
    json_insert(json_extract(body, (SELECT path FROM target) || '.quiz'),
      '$[#]', json('{"question":"O maior botão de download pertence a um anúncio. Como escolher a origem do programa?","options":["Clicar porque o botão é mais visível.","Escolher o primeiro resultado sem conferir.","Procurar a fonte oficial e conferir o nome e o desenvolvedor."],"answer":2}'),
      '$[#]', json('{"question":"O instalador oferece uma extensão que você não precisa. Qual é a melhor ação?","options":["Revisar as opções e recusar os componentes desnecessários.","Aceitar tudo para evitar erro na instalação.","Instalar e enviar suas senhas para ativar a extensão."],"answer":0}'),
      '$[#]', json('{"question":"Um aplicativo pede permissões sem relação clara com sua função. O que fazer?","options":["Permitir todas, pois a loja já garante qualquer uso dos dados.","Pausar, avaliar a necessidade e seguir a orientação da TI no ambiente de trabalho.","Conceder acesso e esquecer a configuração."],"answer":1}'),
      '$[#]', json('{"question":"Uma página pede para desligar a proteção para concluir a instalação. Como agir?","options":["Desligar enquanto o download acontece.","Instalar uma segunda ferramenta indicada pelo pop-up.","Não contornar o alerta; verificar a origem e procurar orientação autorizada."],"answer":2}'))), updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND json_array_length(json_extract(body, (SELECT path FROM target) || '.quiz'))=1
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].question')='Como obter o programa com mais segurança?'
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].answer')=0
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].options')=json('["Usar a fonte oficial e revisar as opções e permissões.","Clicar no maior botão da página.","Desativar a proteção do computador para facilitar a instalação."]');
--> statement-breakpoint
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m6'
   AND json_extract(l.value,'$.id')='pilot-l6'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.materials',
 json_insert(COALESCE(json_extract(body, (SELECT path FROM target) || '.materials'),'[]'), '$[#]', json('{"title":"Portfólio didático · Downloads e permissões (PDF)","url":"/materials/portfolio-downloads-permissoes-2026.pdf"}'))),
 updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND (json_type(body, (SELECT path FROM target) || '.materials') IS NULL OR json_type(body, (SELECT path FROM target) || '.materials')='array')
 AND NOT EXISTS (SELECT 1 FROM json_each(json_extract(body, (SELECT path FROM target) || '.materials')) r
                 WHERE json_extract(r.value,'$.url')='/materials/portfolio-downloads-permissoes-2026.pdf');
--> statement-breakpoint
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m7'
   AND json_extract(l.value,'$.id')='pilot-l7'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.quiz',
    json_insert(json_extract(body, (SELECT path FROM target) || '.quiz'),
      '$[#]', json('{"question":"A pessoa precisa apenas consultar o documento. Qual permissão é mais adequada?","options":["Edição para qualquer pessoa com o link.","Visualização para o destinatário correto, se suficiente para a tarefa.","Administração de toda a pasta."],"answer":1}'),
      '$[#]', json('{"question":"O que pode acontecer ao compartilhar uma pasta inteira para enviar só um arquivo?","options":["A pasta sempre oculta os outros arquivos automaticamente.","Apenas o arquivo citado no e-mail pode ser aberto.","Outros arquivos podem ficar acessíveis, conforme as permissões da pasta."],"answer":2}'),
      '$[#]', json('{"question":"Apagar a mensagem que continha o link revoga o acesso ao documento?","options":["Não. É preciso revisar e retirar o acesso no próprio serviço.","Sim. O serviço apaga a permissão junto com a mensagem.","Sim, se o destinatário ainda não respondeu."],"answer":0}'),
      '$[#]', json('{"question":"Ao encerrar uma colaboração, qual é a boa prática?","options":["Manter todos os links por conveniência, sem revisão.","Revisar links, grupos e permissões, retirando acessos desnecessários conforme a política.","Tornar a pasta pública para evitar pedidos de acesso."],"answer":1}'))), updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND json_array_length(json_extract(body, (SELECT path FROM target) || '.quiz'))=1
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].question')='Como compartilhar com apenas um destinatário?'
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].answer')=1
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].options')=json('["Publicar o link e pedir que não encaminhem.","Restringir o acesso à pessoa e revisar sua permissão.","Deixar público por alguns minutos."]');
--> statement-breakpoint
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m7'
   AND json_extract(l.value,'$.id')='pilot-l7'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.materials',
 json_insert(COALESCE(json_extract(body, (SELECT path FROM target) || '.materials'),'[]'), '$[#]', json('{"title":"Portfólio didático · Compartilhamento e controle de acesso (PDF)","url":"/materials/portfolio-compartilhamento-2026.pdf"}'))),
 updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND (json_type(body, (SELECT path FROM target) || '.materials') IS NULL OR json_type(body, (SELECT path FROM target) || '.materials')='array')
 AND NOT EXISTS (SELECT 1 FROM json_each(json_extract(body, (SELECT path FROM target) || '.materials')) r
                 WHERE json_extract(r.value,'$.url')='/materials/portfolio-compartilhamento-2026.pdf');
--> statement-breakpoint
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m8'
   AND json_extract(l.value,'$.id')='pilot-l8'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.quiz',
    json_insert(json_extract(body, (SELECT path FROM target) || '.quiz'),
      '$[#]', json('{"question":"Depois de informar a senha em uma página falsa, fechar a aba resolve toda a exposição?","options":["Sim, o navegador retira automaticamente os dados enviados.","Não. É preciso comunicar e proteger a conta pelo fluxo oficial.","Sim, se não apareceu uma mensagem de erro."],"answer":1}'),
      '$[#]', json('{"question":"Qual relato ajuda mais a equipe responsável a avaliar o incidente?","options":["Somente dizer que está tudo normal agora.","Omitir as ações para evitar constrangimento.","Informar horário, origem e o que clicou, digitou, executou ou aprovou, incluindo dúvidas."],"answer":2}'),
      '$[#]', json('{"question":"De onde é mais adequado proteger uma conta após suspeita de comprometimento?","options":["De um dispositivo confiável, pelo aplicativo ou endereço oficial.","Do link enviado pelo contato suspeito para ''corrigir'' o problema.","De um programa desconhecido oferecido na conversa."],"answer":0}'),
      '$[#]', json('{"question":"Você abriu um arquivo suspeito no computador de trabalho. Como proceder?","options":["Executar novamente para descobrir o que o programa faz.","Avisar a TI imediatamente e seguir as orientações para o dispositivo e as evidências.","Apagar tudo antes de contar a alguém, mesmo sem orientação."],"answer":1}'))), updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND json_array_length(json_extract(body, (SELECT path FROM target) || '.quiz'))=1
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].question')='Qual atitude ajuda após expor uma senha?'
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].answer')=2
 AND json_extract(body, (SELECT path FROM target) || '.quiz[0].options')=json('["Esperar para ver se acontece algo.","Apagar apenas o histórico do navegador.","Proteger a conta pelo serviço oficial e buscar suporte quando necessário."]');
--> statement-breakpoint
WITH target AS (
 SELECT '$[' || m.key || '].lessons[' || l.key || ']' AS path
 FROM courses c, json_each(c.body) m, json_each(m.value,'$.lessons') l
 WHERE c.id='cyber-pilot' AND json_valid(c.body)
   AND json_extract(m.value,'$.id')='pilot-m8'
   AND json_extract(l.value,'$.id')='pilot-l8'
)
UPDATE courses
SET body=json_set(body, (SELECT path FROM target) || '.materials',
 json_insert(COALESCE(json_extract(body, (SELECT path FROM target) || '.materials'),'[]'), '$[#]', json('{"title":"Portfólio didático · Resposta e recuperação de incidentes (PDF)","url":"/materials/portfolio-resposta-recuperacao-2026.pdf"}'))),
 updated=CURRENT_TIMESTAMP
WHERE id='cyber-pilot' AND EXISTS (SELECT 1 FROM target)
 AND (json_type(body, (SELECT path FROM target) || '.materials') IS NULL OR json_type(body, (SELECT path FROM target) || '.materials')='array')
 AND NOT EXISTS (SELECT 1 FROM json_each(json_extract(body, (SELECT path FROM target) || '.materials')) r
                 WHERE json_extract(r.value,'$.url')='/materials/portfolio-resposta-recuperacao-2026.pdf');
