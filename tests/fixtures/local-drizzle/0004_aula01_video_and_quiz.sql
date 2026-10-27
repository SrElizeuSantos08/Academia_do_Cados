UPDATE courses
SET body = json_set(body, '$[0].lessons[0].video', 'static:aula-01-calma-dedo-nervoso-v2.mp4'), updated = CURRENT_TIMESTAMP
WHERE id = 'cyber-pilot' AND json_valid(body) AND json_extract(body, '$[0].lessons[0].id') = 'pilot-l1';
--> statement-breakpoint
UPDATE courses
SET body = json_insert(body,
      '$[0].lessons[0].quiz[#]', json('{"question":"O e-mail mostra um nome conhecido. Isso comprova que a mensagem é legítima?","options":["Sim. O nome exibido identifica o remetente com segurança.","Sim, desde que o texto não contenha erros de português.","Não. Preciso verificar o endereço completo e confirmar o contexto por um canal conhecido."],"answer":2}'),
      '$[0].lessons[0].quiz[#]', json('{"question":"O que o HTTPS informa sobre uma página de login?","options":["A conexão com aquele endereço é protegida, mas ainda preciso confirmar se o domínio é legítimo.","Que a empresa responsável pela página foi verificada e é confiável.","Que posso informar minha senha sem verificar o endereço."],"answer":0}'),
      '$[0].lessons[0].quiz[#]', json('{"question":"Você recebeu uma solicitação de autenticação que não iniciou. O que fazer?","options":["Aprovar para que o aviso pare de aparecer.","Enviar o código ao contato que se apresentou como suporte.","Rejeitar a solicitação e procurar orientação pelo canal oficial ou pela equipe responsável."],"answer":2}'),
      '$[0].lessons[0].quiz[#]', json('{"question":"Você informou sua senha em uma página suspeita. Qual é o próximo passo?","options":["Fechar a aba e esperar para ver se acontece algum problema.","Proteger a conta pelo serviço oficial, de um dispositivo confiável, e avisar a equipe responsável no trabalho.","Responder ao e-mail pedindo que apaguem sua senha."],"answer":1}')
    ), updated = CURRENT_TIMESTAMP
WHERE id = 'cyber-pilot' AND json_valid(body)
  AND json_extract(body, '$[0].lessons[0].id') = 'pilot-l1'
  AND json_array_length(json_extract(body, '$[0].lessons[0].quiz')) = 1;
