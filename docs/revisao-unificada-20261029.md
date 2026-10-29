# Revisão unificada — 29/10/2026

Base: main 8ae435a7b29b244879dcceed838ea93f7e0dced7, trabalhada em cópia isolada na Branch-Arakaki. Fonte publicada comparada: 50240b14b5396f4d41f2ee8d3848499241d6aed2, versão 40 do Site.

## Alterações preparadas

- Corrigidos os caminhos das migrações de teste e a senha fictícia compartilhada entre os testes de autenticação e recuperação. Nenhuma senha real foi alterada.
- Incorporados os oito vídeos Vimeo de pilot-l1 a pilot-l8, com hashes de privacidade, retomada após Play, acompanhamento de progresso, liberação de perguntas ao terminar e limpeza do player ao navegar. O player nativo continua disponível para as outras aulas.
- Preservados a autenticação com códigos por e-mail, consentimentos, termos, suporte e fórum da main.
- Adicionada uma lista explícita das sete consultas legadas de autenticador ao gerador PostgreSQL. O catálogo contém 184 consultas fixas e mantém as permissões exclusivas de service_role.

Arquivos principais: tests/password-auth.test.mjs, tests/access-recovery.test.mjs, public/lesson-media.js, public/portal.js, public/portal.css, public/admin.html, public/aluno.html, public/portal.html, tests/vimeo-lesson.test.mjs, tests/postgres-compatibility.test.mjs, lib/postgres-compatibility.json, scripts/build-postgres-catalogue.mjs, lib/postgres-catalogue.json e supabase/backend-rpc.sql.

## Validação executada

- pnpm test: 33/33 arquivos passaram.
- pnpm typecheck: passou.
- pnpm build: passou, com aviso existente do vinext sobre classificação estática de rotas.
- git diff --check: sem erros de whitespace; avisos de normalização LF/CRLF do ambiente Windows.
- Deno 2.9.6: checagem da função github-site-update passou, executada pelo utilitário oficial via npx. Nenhuma dependência do projeto foi adicionada.
- Supabase: 184 consultas passaram por EXPLAIN sem executar suas gravações. As 177 consultas anteriores permanecem idênticas. A migração unified_auth_gateway_compatibility foi aplicada e a permissão de execução continua exclusiva de service_role, sem SECURITY DEFINER.
- Gateway remoto: leitura e escrita dos desafios antigos e por e-mail passaram em transação revertida; consulta desconhecida foi rejeitada. Nenhum usuário ou desafio fictício permaneceu.
- Navegador publicado: novo login confirmado, cursos, RA, progresso, selos e certificados carregaram. O Vimeo da Aula 02 reproduziu e pausou normalmente; portfólio e cinco perguntas estavam presentes, com envio da avaliação bloqueado antes de terminar. Nenhuma conclusão foi atribuída artificialmente.

Os arquivos gerados public/vendor/student-documents.js e sua licença foram alterados pelo build e não fazem parte da correção proposta. A pasta original e seus arquivos particulares foram preservados.

## Pendências antes de publicar

1. Revisar e enviar a Branch-Arakaki conforme autorização; confirmar o resultado real do GitHub Actions. Passar localmente não equivale a uma execução verde no GitHub.
2. Gateway já aplicado. O arquivo foi criado pelo Supabase CLI e alinhado ao timestamp confirmado no histórico remoto: 20261029134525_unified_auth_gateway_compatibility.sql. Contém o mesmo SQL aplicado. Não reaplicar a migração em produção como se fosse uma nova alteração.
3. Repetir a conferência de segundo fator: a leitura agregada desta revisão encontrou zero registros ativos. Se houver algum novo registro, avaliar sua transição antes de alterar o método de autenticação.
4. Conferir novamente a fonte publicada e a main para detectar alterações posteriores aos commits citados.
5. Após publicação autorizada, testar no navegador com conta de teste: login, recuperação e código por e-mail, cursos, avanço, Vimeo das oito aulas, perguntas, portfólio e certificados. Não considerar isso validado em produção pelos testes locais.

Esta preparação não troca o provedor do banco, não modifica dados de alunos, não publica o Site e não altera a main.
