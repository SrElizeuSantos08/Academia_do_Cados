# Migração do banco para Supabase

## Estrutura

Os dados da Academia do Caos ficam no schema privado `academia`. As tabelas têm RLS habilitado; o acesso de aplicação é concedido somente ao `service_role`. O schema não deve ser exposto a `anon` ou `authenticated` no Data API.

O schema contém cadastros, cursos, matrículas, progresso, certificados, fórum, denúncias, suporte, notificações, configurações, auditoria, tutor, perfis e hashes de senha. As relações de aluno, curso, aula, conversa, suporte e certificado são declaradas com chaves estrangeiras. Índices cobrem as consultas do portal e as relações entre tabelas.

Tipos e estados de negócio permanecem como texto compatível com a aplicação, com `CHECK` constraints para valores que já têm domínio definido. Não há triggers de atualização porque o backend já grava os horários; não há enum inventado, nem habilitação de Realtime sem consumidor no portal. A publicação padrão `supabase_realtime` permanece sem tabelas da Academia.

## Dados

A migração inicial sincronizou as linhas atuais legíveis do D1, incluindo usuários, matrículas, progresso, mensagens, suporte, certificados, configurações não truncadas e os 43 registros de auditoria. As senhas permanecem em `auth_passwords` como hashes com salt; nenhuma senha em texto aberto foi gravada.

O registro `academia.data_migration_runs` acompanha o estado desta carga. Sessões, limites de tentativa e desafios temporários de e-mail foram excluídos por serem estado de curta duração. Depois de uma troca de banco, os usuários precisarão autenticar novamente.

Os cursos e a cópia longa de configuração já têm conteúdo completo no Supabase; os timestamps de revisão dos cursos coincidem com o D1. O leitor seguro do D1 limita valores longos e, por isso, não foi possível comparar os hashes integrais dessas duas colunas.

## Arquivos e runtime

A tabela `academia.assets` contém os metadados dos dois arquivos existentes (`Perfil.jpg` e `WhatsApp Image 2026-10-22 at 12.33.39 PM.jpeg`). O bucket privado `academia-assets` foi criado no Supabase Storage, com limite de 50 MB por arquivo e tipos permitidos para imagens, áudio, vídeo, documentos e legendas. Os bytes desses dois arquivos continuam no R2 e ainda precisam ser copiados para o bucket.

A aplicação hospedada ainda grava dados de produção no D1 e arquivos no R2. O adaptador `lib/supabase-d1-adapter.mjs` está preparado para usar o gateway de consultas fixas `public.academia_backend_batch` e o bucket Supabase quando as variáveis secretas `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estiverem configuradas no runtime. Sem essas variáveis, o portal continua usando D1/R2. A chave administrativa deve existir somente como segredo do servidor, nunca no navegador, no GitHub ou neste repositório.

O Sites Connector atualmente não consegue localizar o projeto ao consultar as variáveis de produção (`project_not_found`). Até que o proprietário libere o acesso à configuração do runtime, os dois arquivos sejam copiados e a chave secreta seja validada, a carga permanece parcial e o D1 continua sendo a origem operacional.

## Migrações SQL

- `academia_core`: tabelas iniciais privadas.
- `restrict_rls_trigger_execution`: restrições de execução de trigger.
- `admin_inspection_views`: visões de inspeção administrativa.
- `academy_backend_fixed_query_gateway`: gateway de consultas fixas do backend.
- `github_site_updates`: registro de commits na tabela `academia.site_updates`.
- `academia_database_management`: integridade referencial, índices, controles de domínio e registro da migração de dados.
