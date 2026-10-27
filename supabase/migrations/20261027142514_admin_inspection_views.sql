-- Consultas administrativas: não duplicam dados nem expõem credenciais.
CREATE VIEW academia.consulta_usuarios WITH (security_invoker=true) AS
SELECT p.id AS usuario_id,p.name AS nome,p.ra,p.login_email AS email_login,p.email AS email_contato,
p.role AS perfil,p.active=1 AS ativo,p.photo AS foto,p.created AS cadastrado_em,
ap.company AS empresa,ap.account_type AS tipo_conta,
(a."user" IS NOT NULL AND length(a.password_hash)>0 AND length(a.salt)>0) AS senha_configurada,
CASE WHEN a."user" IS NULL THEN NULL ELSE a.must_change=1 END AS exige_troca_senha,a.updated AS senha_atualizada_em
FROM academia.people p LEFT JOIN academia.auth_profiles ap ON ap."user"=p.id
LEFT JOIN academia.auth_passwords a ON a."user"=p.id;

CREATE VIEW academia.consulta_cursos WITH (security_invoker=true) AS
SELECT c.id AS curso_id,c.title AS titulo,c.description AS descricao,c.level AS nivel,c.folder AS pasta,
c.published=1 AS publicado,c.sort AS ordem,c.updated AS atualizado_em,
EXISTS(SELECT 1 FROM academia.settings s WHERE s.key='course:'||c.id||':development' AND s.value='on') AS em_desenvolvimento,
jsonb_array_length(c.body::jsonb) AS quantidade_modulos,
(SELECT count(*) FROM jsonb_array_elements(c.body::jsonb) m CROSS JOIN LATERAL jsonb_array_elements(m->'lessons') l) AS quantidade_aulas
FROM academia.courses c;

CREATE VIEW academia.consulta_modulos WITH (security_invoker=true) AS
SELECT c.id AS curso_id,c.title AS curso,m.value->>'id' AS modulo_id,m.value->>'title' AS titulo,
NULLIF(m.value->>'hours','')::numeric AS carga_horaria,m.ordinality AS ordem,
jsonb_array_length(m.value->'lessons') AS quantidade_aulas
FROM academia.courses c CROSS JOIN LATERAL jsonb_array_elements(c.body::jsonb) WITH ORDINALITY m(value,ordinality);

CREATE VIEW academia.consulta_aulas WITH (security_invoker=true) AS
SELECT c.id AS curso_id,m.value->>'id' AS modulo_id,l.value->>'id' AS aula_id,l.value->>'title' AS titulo,
l.value->>'description' AS descricao,NULLIF(l.value->>'minutes','')::numeric AS duracao_minutos,
l.value->>'video' AS video,l.value->>'scenario' AS cenario,l.value->>'decision' AS decisao,
NULLIF(l.value->>'plannedVideoMinutes','')::numeric AS video_planejado_minutos,
m.ordinality AS ordem_modulo,l.ordinality AS ordem_aula,
jsonb_array_length(coalesce(l.value->'quiz','[]'::jsonb)) AS quantidade_questoes,
jsonb_array_length(coalesce(l.value->'materials','[]'::jsonb)) AS quantidade_materiais,
l.value AS dados_completos
FROM academia.courses c CROSS JOIN LATERAL jsonb_array_elements(c.body::jsonb) WITH ORDINALITY m(value,ordinality)
CROSS JOIN LATERAL jsonb_array_elements(m.value->'lessons') WITH ORDINALITY l(value,ordinality);

CREATE VIEW academia.consulta_questoes WITH (security_invoker=true) AS
SELECT c.id AS curso_id,m->>'id' AS modulo_id,l->>'id' AS aula_id,q.ordinality AS numero,
q.value->>'question' AS pergunta,q.value->'options' AS alternativas,
NULLIF(q.value->>'answer','')::integer AS indice_resposta_correta,q.value->>'explanation' AS explicacao
FROM academia.courses c CROSS JOIN LATERAL jsonb_array_elements(c.body::jsonb) m
CROSS JOIN LATERAL jsonb_array_elements(m->'lessons') l
CROSS JOIN LATERAL jsonb_array_elements(coalesce(l->'quiz','[]'::jsonb)) WITH ORDINALITY q(value,ordinality);

CREATE VIEW academia.consulta_materiais WITH (security_invoker=true) AS
SELECT c.id AS curso_id,m->>'id' AS modulo_id,l->>'id' AS aula_id,a.ordinality AS ordem,
a.value->>'title' AS titulo,a.value->>'url' AS endereco,a.value AS dados_completos
FROM academia.courses c CROSS JOIN LATERAL jsonb_array_elements(c.body::jsonb) m
CROSS JOIN LATERAL jsonb_array_elements(m->'lessons') l
CROSS JOIN LATERAL jsonb_array_elements(coalesce(l->'materials','[]'::jsonb)) WITH ORDINALITY a(value,ordinality);

CREATE VIEW academia.consulta_matriculas WITH (security_invoker=true) AS
SELECT e."user" AS usuario_id,p.name AS nome,p.ra,p.login_email AS email,e.course AS curso_id,
c.title AS curso,e.created AS matriculado_em
FROM academia.enrollments e JOIN academia.people p ON p.id=e."user" JOIN academia.courses c ON c.id=e.course;

CREATE VIEW academia.consulta_progresso WITH (security_invoker=true) AS
SELECT pr."user" AS usuario_id,p.name AS nome,p.ra,pr.course AS curso_id,c.title AS curso,
pr.lesson AS aula_id,a.titulo AS aula,pr.position AS posicao_player,pr.done=1 AS concluido,
pr.score AS nota,pr.updated AS atualizado_em
FROM academia.progress pr LEFT JOIN academia.people p ON p.id=pr."user"
LEFT JOIN academia.courses c ON c.id=pr.course
LEFT JOIN academia.consulta_aulas a ON a.curso_id=pr.course AND a.aula_id=pr.lesson;

CREATE VIEW academia.consulta_certificados WITH (security_invoker=true) AS
SELECT id AS certificado_id,"user" AS usuario_id,course AS curso_id,module AS modulo_id,
snapshot::jsonb->>'name' AS nome_emitido,snapshot::jsonb->>'ra' AS ra_emitido,
snapshot::jsonb->>'course' AS curso_emitido,snapshot::jsonb->>'module' AS modulo_emitido,
snapshot::jsonb->>'hours' AS carga_horaria,snapshot::jsonb->>'score' AS nota,
snapshot::jsonb->>'code' AS codigo,snapshot::jsonb->>'issuer' AS emissor,
created AS emitido_em,snapshot::jsonb AS dados_originais
FROM academia.certificates;

CREATE VIEW academia.consulta_arquivos WITH (security_invoker=true) AS
SELECT a.id AS arquivo_id,a."user" AS usuario_id,p.name AS enviado_por,a.course AS curso_id,
a.scope AS finalidade,a.name AS nome_arquivo,a.type AS tipo_mime,a.size AS tamanho_bytes,a.created AS enviado_em,
'R2 da hospedagem atual; conteúdo binário não migrado para Supabase Storage'::text AS local_conteudo
FROM academia.assets a LEFT JOIN academia.people p ON p.id=a."user";

CREATE VIEW academia.consulta_colunas WITH (security_invoker=true) AS
SELECT c.relname::text AS tabela,a.attname::text AS coluna,pg_catalog.format_type(a.atttypid,a.atttypmod) AS tipo,
NOT a.attnotnull AS aceita_nulo,pg_catalog.col_description(c.oid,a.attnum) AS descricao
FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
JOIN pg_catalog.pg_attribute a ON a.attrelid=c.oid
WHERE n.nspname='academia' AND c.relkind='r' AND a.attnum>0 AND NOT a.attisdropped;

REVOKE ALL ON academia.consulta_usuarios, academia.consulta_cursos, academia.consulta_modulos, academia.consulta_aulas, academia.consulta_questoes, academia.consulta_materiais, academia.consulta_matriculas, academia.consulta_progresso, academia.consulta_certificados, academia.consulta_arquivos, academia.consulta_colunas FROM PUBLIC, anon, authenticated;
GRANT SELECT ON academia.consulta_usuarios, academia.consulta_cursos, academia.consulta_modulos, academia.consulta_aulas, academia.consulta_questoes, academia.consulta_materiais, academia.consulta_matriculas, academia.consulta_progresso, academia.consulta_certificados, academia.consulta_arquivos, academia.consulta_colunas TO service_role;
