# Supabase — Academia do Caos

Projeto: `snboppvknkqlremkwrjf` (Chaos Academy Project). URL da API: https://snboppvknkqlremkwrjf.supabase.co.
Repositório já vinculado no painel: SrElizeuSantos08/Academia_do_Cados.

## Estado em 27/10/2026

As migrações deste diretório foram aplicadas remotamente. O schema privado `academia` contém 23 tabelas com RLS. Não há permissões de schema/tabelas para PUBLIC, anon ou authenticated; somente o backend service_role pode operar os registros. A ausência de políticas de usuário é intencional nesta etapa: o frontend não acessa essas tabelas. A função de infraestrutura rls_auto_enable permanece ativa, mas teve a execução pública revogada.

Foi importada uma cópia consistente de 20 tabelas do D1, com as grades integrais, matrículas, progresso, certificados, fórum, suporte, configurações, perfis e hashes de senhas existentes. As contagens de todas as tabelas foram conferidas; os SHA-256 das grades coincidiram com a origem. Sessões, limites de autenticação e desafios temporários ficaram vazios. Este não é um cadastro de usuários no Supabase Auth.

Os arquivos binários de vídeos e anexos continuam no R2; os dois registros da tabela assets são metadados, não uma cópia dos arquivos. Os materiais estáticos continuam no repositório.

## Produção e pendências

O site em produção continua usando D1/R2. Esta importação é um retrato, sem sincronização contínua. A integração GitHub do painel não transforma automaticamente as consultas SQLite em PostgreSQL nem aplica migrações de dados.

O acesso às variáveis de ambiente do Sites retorna `Sites project not found` para o projeto existente. Sem um canal seguro para configurar os segredos do backend, não foi realizada a troca do banco de produção. Nunca colocar service_role, senha do banco ou exports em public/, no JavaScript do navegador ou neste repositório.

Para concluir a troca: resolver o acesso às variáveis do projeto Sites; adaptar as consultas SQLite e transações do backend para PostgreSQL; configurar o backend com segredos protegidos; transferir os arquivos do R2 para Storage (ou manter R2 explicitamente); validar login por e-mail/RA, permissões, cursos, progresso, fórum e certificados em ambiente de teste; suspender gravações por uma janela curta; importar o delta final; alterar o backend e conferir os dados. Não ativar um backend parcial nem prometer sincronização automática.

## Exportação administrativa

Em Empresa → Configurações → Cópia de segurança do banco, o administrador baixa o JSON integral autenticado. A rota exige administrador, usa no-store, registra auditoria e inclui SHA-256 e contagens. O arquivo contém dados privados e hashes: guardar fora do repositório, com acesso restrito. Não usar as projeções de leitura do painel para migrar grades, pois valores longos podem ser truncados.

As migrações PostgreSQL usam as versões remotas exatas. As migrações D1 existentes foram preservadas; as atualizações recentes foram acrescentadas no final da sequência D1. Os testes de diferenças históricas usam fixtures separados.
