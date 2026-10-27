# Consultar e validar a Academia do Caos

No projeto `snboppvknkqlremkwrjf`, abra Table Editor e selecione o schema **academia**. O schema public fica vazio porque os cadastros da escola estão no schema privado academia. As tabelas contêm a cópia importada do D1; o site ainda não grava suas novas alterações automaticamente neste banco.

## Consultas prontas

Abra SQL Editor e execute a consulta desejada com sua conta administrativa do projeto:

```sql
select * from academia.consulta_usuarios order by nome;
select * from academia.consulta_matriculas order by nome, curso;
select * from academia.consulta_cursos;
select * from academia.consulta_modulos order by curso_id, ordem;
select * from academia.consulta_aulas order by curso_id, ordem_modulo, ordem_aula;
select * from academia.consulta_questoes order by curso_id, modulo_id, aula_id, numero;
select * from academia.consulta_materiais;
select * from academia.consulta_progresso order by nome, curso, aula_id;
select * from academia.consulta_certificados;
select * from academia.consulta_arquivos;
select * from academia.consulta_colunas order by tabela, coluna;
```

São 11 views administrativas: consultas com colunas em português sobre as tabelas existentes. Não são cópias independentes. Quando os registros do Supabase mudarem, as consultas refletem esses registros. Isso não sincroniza o D1. A grade original permanece integral em courses.body; módulos, aulas, questões e materiais são extraídos dela sem truncamento. O campo dados_completos preserva os campos adicionais das aulas e dos materiais. O gabarito das questões é administrativo e não deve ser disponibilizado aos alunos.

## Cadastro e senha

`people` guarda nome, e-mails, RA, perfil, foto, ativação e data de cadastro. `auth_profiles` guarda os complementos de empresa e tipo de conta existentes. Campos não preenchidos na origem não foram inventados.

`auth_passwords` guarda o identificador do usuário, password_hash, salt, must_change e updated. A plataforma atual calcula PBKDF2-SHA256, com 100.000 iterações. A senha original não é armazenada nem recuperável. Não exportar hashes para planilhas nem incluí-los no GitHub. Para conferir o cadastro, use consulta_usuarios: senha_configurada, exige_troca_senha e senha_atualizada_em. Foram conferidos 7 cadastros e 7 registros de senha, sem exibir os hashes.

Não alterar password_hash manualmente. O fluxo da plataforma deve gerar nova senha e invalidar as sessões quando necessário. Estas contas pertencem à autenticação própria da academia; não foram convertidas em contas do Supabase Auth.

## Onde está cada recurso

| Recurso | Tabelas |
| --- | --- |
| Pessoas e empresas | people, auth_profiles |
| Senhas e acesso | auth_passwords, auth_sessions, auth_limits, auth_email_challenges |
| Cursos, módulos, aulas e avaliações | courses; views consulta_cursos, consulta_modulos, consulta_aulas, consulta_questoes |
| Matrículas e notas | enrollments, progress |
| Arquivos e materiais | assets; view consulta_materiais |
| Fórum e assuntos | messages, topics, message_topics |
| Denúncias e moderação | forum_reports, moderation |
| Suporte e respostas | tickets, replies |
| Notificações e leituras | notifications, reads |
| Certificados emitidos | certificates |
| Configurações, auditoria e tutor | settings, audit, tutor |

## Arquivos e limitações

O banco contém os metadados dos uploads e os endereços dos materiais. Os bytes de fotos, anexos e vídeos não foram transferidos para Supabase Storage. Continuam no R2 e nos arquivos estáticos da hospedagem/repositório. O código da aplicação permanece no GitHub. A view consulta_arquivos informa essa localização explicitamente.

Sessões, limites de autenticação e desafios temporários não foram copiados. As tabelas e views permanecem privadas, sem permissões para visitantes ou usuários comuns. As views usam security_invoker; a inspeção deve ocorrer com a conta administrativa do projeto.

Conferência em 27/10/2026: 23 tabelas, 130 colunas, 7 pessoas, 2 cursos, 14 módulos, 14 aulas, 70 questões, 14 referências de materiais, 5 matrículas, 19 registros de progresso e 2 certificados. Esta conferência não significa que houve uma troca do backend de produção.
