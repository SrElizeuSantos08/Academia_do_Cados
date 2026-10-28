# Backend PostgreSQL da Academia do Caos

## Atualização de produção — 28/10/2026
O Site foi implantado com ACADEMY_DATABASE_PROVIDER=supabase e credencial protegida, revisão de ambiente 16. A exportação D1 final foi reconciliada durante uma pausa de gravações: todos os registros das 20 tabelas exportadas corresponderam ao Supabase antes da ativação. Backups criptografados ficaram fora do Git. Arquivos binários permanecem no R2 e sessões antigas não foram migradas. A validação final com novo login no navegador permanece pendente.

Esta integração preserva as regras atuais de aprovação de cadastro e consentimento da main. O Worker usa lib/database.mjs para selecionar o gateway de consultas fixas academia_backend_batch. O adaptador anterior permanece no repositório para referência/compatibilidade, sem ser o caminho ativo do Worker. Não aplique seus procedimentos como uma segunda migração independente.

O transporte vincula fetch ao receptor global exigido por Workers. Os testes postgres-worker reproduzem a falha anterior e verificam a correção em Miniflare. ACADEMY_MIGRATION_READONLY=on bloqueia temporariamente métodos de gravação antes do acesso ao banco; permanece desligado quando ausente. O diagnóstico database-health exige administrador, não altera o provedor e nunca expõe a chave. productionSwitchPerformed=false indica que essa consulta de diagnóstico não executa uma troca.

As seções de preparação abaixo registram o procedimento e as verificações anteriores, não o estado atual de produção.

## Estado
A integração é opt-in. Sem ACADEMY_DATABASE_PROVIDER, o site continua usando D1. Os arquivos continuam no R2. A chave do Supabase não migra os dados nem sincroniza o retrato importado.

## Credenciais protegidas na hospedagem
- SUPABASE_URL: https://snboppvknkqlremkwrjf.supabase.co
- SUPABASE_SECRET_KEY: chave sb_secret_ do projeto, marcada como secreta. Nunca usar prefixo público, commit, print ou navegador. Alternativa de compatibilidade: SUPABASE_SERVICE_ROLE_KEY, somente no servidor.
- ACADEMY_DATABASE_PROVIDER: manter d1 durante a preparação. A opção supabase somente deve ser ativada após reconciliar o retrato com o D1 atual e concluir os testes.

## Transporte e permissões
O servidor usa HTTPS e uma função SECURITY INVOKER, public.academia_backend_batch(jsonb), com execução revogada para PUBLIC, anon e authenticated. Apenas service_role pode executá-la. As 23 tabelas permanecem privadas no schema academia; nenhuma política de acesso geral foi criada. Não é necessário expor esse schema na Data API nem trocar para Supabase Auth.

A função aceita somente IDs de 165 consultas previamente cadastradas e parâmetros escalares separados. Não recebe SQL arbitrário. O gerador usa as fontes locais e publicadas para manter compatibilidade. PostgreSQL format com %L faz o escape dos valores. Um lote inteiro usa a mesma transação; qualquer erro reverte todas as operações. Um advisory lock serializa os lotes da academia para proteger a alocação de RA e as leituras administrativas do mesmo gateway. Esse compromisso favorece integridade no volume atual; deve ser medido antes de aumentar a escala.

Não há fallback automático para D1 nem repetição automática após timeout de escrita: isso causaria divergências e poderia duplicar gravações. O fallback para D1 é uma decisão operacional, que requer conciliação se houver gravações depois da troca.

## Teste da conexão sem trocar produção
Após cadastrar os segredos e reimplantar, um administrador autenticado pode abrir:
https://academiadocaos.bbsone.com.br/api/lms/database-health

O resultado esperado é active=d1, target=supabase, connected=true. A rota faz uma leitura de cursos, retorna só o total, exige administrador e não muda o provedor. Não cria nem altera cadastros. Sem segredo ou permissão, devolve erro genérico. Um 401/403 exige autenticação com conta administrativa.

## Verificação já executada em 27/10/2026
- As 165 consultas foram validadas por EXPLAIN no PostgreSQL remoto, sem executar suas gravações.
- Leitura/gravação, caracteres especiais, rejeição de consulta não cadastrada, rollback integral, alocação de dois RAs, proteção de troca de senha contra replay e contador de tentativas foram testados com transações revertidas.
- As contagens originais permaneceram: 7 pessoas, 2 cursos, 5 matrículas, 19 registros de progresso e 2 certificados. Nenhum registro fictício permaneceu.
- A revisão de segurança manteve somente os avisos informativos já existentes sobre RLS sem políticas nas tabelas privadas. Elas continuam sem acesso por anon/authenticated: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- Os testes HTTP do adaptador utilizam respostas simuladas. A conexão HTTP real da hospedagem depende do segredo ainda não cadastrado; não foi anunciada como concluída.

## Manutenção e implantação
Antes de adicionar consultas ao backend, executar scripts/build-postgres-catalogue.mjs com o checkout publicado como argumento adicional. O JSON resultante e supabase/backend-rpc.sql devem ser revisados e versionados juntos. Atualizar a função remota por migração e validar o catálogo novamente antes de ativar código com novos IDs.

A migração 20261027191348_academy_backend_fixed_query_gateway.sql reproduz exatamente a migração já aplicada, cujo número foi consultado no Supabase. Não reaplicar como se fosse outra migração. As três migrações anteriores pertencem ao trabalho existente na main do Elizeu, em supabase/migrations.

## Antes de ativar supabase
1. Exportar o D1 completo pela rota administrativa existente, guardar fora do repositório e verificar checksum. Não usar leituras truncadas do painel para migrar grades, hashes ou arquivos.
2. Guardar uma cópia segura do banco Supabase e inventariar o R2. Os metadados assets não são os arquivos binários.
3. Validar as regras e o delta dos dados, inclusive aprovações novas, senhas alteradas e sessões. Sessões e desafios antigos não devem ser reutilizados.
4. Executar os testes de login, recuperação, matrículas, aprovação, avaliações, certificados, fórum, suporte, uploads e vídeo no ambiente de validação. Não provocar envios reais sem autorização do destinatário/teste.
5. Planejar a pausa de gravações, importar o delta final e comparar contagens/checksums. Só então trocar o provedor e implantar.
6. Acompanhar os logs. Se houver erro após novas gravações, não voltar cegamente ao retrato D1: primeiro reconciliar o que mudou.

## Arquivos da integração
Novos: lib/database.mjs, lib/postgres-sql.mjs, lib/postgres-catalogue.json, scripts/build-postgres-catalogue.mjs, supabase/backend-rpc.sql, sua migração e testes postgres-backend, postgres-health e postgres-query-coverage.
Modificados pontualmente: lib/lms.mjs e lib/password-auth.mjs para seleção explícita do provedor e diagnóstico administrativo. Nenhuma dependência nova foi instalada. Alterações locais preexistentes foram preservadas.
