# Academia do Caos

Plataforma de cursos de cibersegurança com site institucional, painel administrativo e área do aluno.

## Acessos

- `/index.html`: apresentação, cursos e certificação.
- `/admin.html`: pessoas, matrículas, grades, suporte, avisos e auditoria.
- `/aluno.html`: cursos liberados, última aula, fórum, suporte, perfil e certificados.
- `/certificado.html?id=...`: consulta de um registro de conclusão.
- `/certificado.html?modelo=1`: modelo demonstrativo do certificado.
- `/piloto.html`: demonstração original de conscientização, preservada.

## Recursos

Administrador: cadastro e atualização de nome, contato, perfil e situação; RA automático; liberação/revogação de matrículas; gestão de professores. Professores: edição de conteúdos, avisos e respostas no suporte. Alunos: conteúdos matriculados, retomada do vídeo, progressão sequencial e certificados.

Cursos organizados por pasta e ordem, com níveis Básico, Intermediário e Difícil. Cada módulo tem carga horária explícita para o certificado e aulas com descrição, vídeo e avaliação. A aprovação exige 75%. As aulas e os cursos da mesma pasta são liberados em sequência entre os cursos matriculados. Vídeos avançam ao terminar quando não há avaliação pendente; a reprodução automática seguinte depende da política do navegador.

Os oito módulos da trilha Segurança Digital na Prática têm selos personalizados. Após a confirmação da conclusão de todas as aulas de um módulo, o aluno vê sua conquista antes de continuar. Os selos ficam no painel Meu aprendizado e na sala de aula, derivados do progresso salvo no servidor; não exigem novas tabelas. Rever uma aula não repete a janela de conquista. A edição piloto usa o mesmo visual com seu progresso local. As imagens WebP em `public/assets/badges/` correspondem aos oito crachás gerados; o catálogo e a apresentação estão em `public/module-badges.js` e `public/module-badges.css`.

O fórum suporta mensagens, respostas, imagens, vídeos, áudio, documentos e gravação de voz quando o navegador permite acesso ao microfone. O suporte é privado entre aluno e equipe docente. Notificações são consultadas a cada 30 segundos enquanto o portal está em uso.

Os certificados usam um registro persistente com dados de conclusão congelados: nome, RA, curso, módulo, carga horária, nível, data e identificador. Podem ser impressos ou salvos em PDF pelo navegador. A consulta respeita as permissões de acesso do Site.

## Arquitetura

- Vinext, Vite e Cloudflare Workers, preservando a integração Sites.
- Interface institucional e portal em HTML/CSS/JavaScript, sem bibliotecas de interface no cliente.
- D1 para pessoas, matrículas, conteúdos, progresso, conversas, atendimentos, notificações, certificados e auditoria.
- R2 para arquivos; streaming com contagem de bytes, tipos permitidos e respostas Range para vídeos.
- API em `lib/lms.mjs`, interceptada pelo Worker em `build/sites-worker.ts`.
- Schema Drizzle e migrações versionadas em `db/` e `drizzle/`.
- Testes de autorização, regras de progressão, certificados e arquivos em `tests/lms.test.mjs`.

## Identidade e segurança

O login é gerenciado pelo Sites/ChatGPT. O servidor utiliza os cabeçalhos autenticados fornecidos pela plataforma, nunca uma identidade informada pelo JavaScript do navegador. Alunos e professores devem ser previamente cadastrados com o mesmo e-mail utilizado no login. Nome e e-mail de contato podem ser atualizados. Senhas são alteradas no provedor de identidade; a academia não armazena nem redefine senhas pessoais. Após o primeiro vínculo, o e-mail de login não pode ser transferido para outra conta pelo painel.

O primeiro acesso administrativo é permitido às contas verificadas de Elizeu Santos e do proprietário original do Site; outros administradores podem ser cadastrados pelo painel. Essa lista inicial está em `lib/lms.mjs`. A política de compartilhamento do Site é uma camada adicional: cadastrar um aluno no banco não altera automaticamente os visitantes autorizados no Sites. Preserve ou ajuste essa política no ambiente de hospedagem conforme a distribuição da academia.

Todas as operações de escrita validam origem e permissões no servidor. IDs de arquivos são opacos; a entrega exige autorização. Cursos com histórico são arquivados; aulas já concluídas não podem ser removidas da grade. Certificados preservam seus dados originais mesmo após alterações de cadastro.

## Primeiro uso

Entre em `/admin.html` com a conta autorizada. Se o catálogo estiver vazio, a interface importa a trilha existente, Segurança Digital na Prática. A carga horária inicial desse material é de **0,25 h por módulo (2 h no total)**, configurável pelo administrador; revise-a de acordo com a programação adotada. Cadastre professores/alunos, crie matrículas e ajuste a grade antes da distribuição.

Para novos vídeos, salve primeiro o curso como rascunho, envie o arquivo na aula e salve novamente a grade. Limite de vídeo: 90 MB por arquivo. Fotos, áudios e documentos: 20 MB por arquivo. Formatos aceitos incluem MP4/WebM, JPG/PNG/WebP, áudio, PDF, TXT e Office. Fotos de perfil: JPG, PNG ou WebP.

## Tutor com IA

O suporte humano funciona sem integração externa. A API do tutor está preparada para a Responses API da OpenAI, usando os materiais do curso como contexto. Para ativar o modo robô, configure `OPENAI_API_KEY` como segredo do ambiente de hospedagem por uma conexão autorizada e então ative a opção no painel. Sem esse segredo, a opção informa que a integração está pendente. Nunca coloque a chave no Git, no HTML ou em arquivos públicos. Não há respostas simuladas apresentadas como IA.

## Desenvolvimento e validação

Node.js 22.13 ou superior; gerenciador indicado no `package.json` e `pnpm-lock.yaml`.

```bash
pnpm install --frozen-lockfile
pnpm run db:generate  # somente após alterações no schema
node tests/lms.test.mjs
node tests/registration.test.mjs
node tests/published-content.test.mjs
node tests/module-learning.test.mjs
node tests/admin-panels.test.mjs
node tests/module-badges.test.mjs
pnpm exec tsc --noEmit
pnpm run build
```

No ambiente Sites, utilize os helpers oficiais de instalação, build e publicação. O manifesto `.openai/hosting.json` preserva o projeto existente e declara `DB` e `BUCKET`. Migrações de produção são aplicadas pelo fluxo de publicação. Não crie tabelas durante requisições.

Os RAs seguem a série `AC-2026-NNNN`, com no mínimo quatro dígitos. Os números `0001`, `0002` e `0003` ficam reservados, respectivamente, aos logins de Elizeu Santos, Guilherme Arakaki e Osmar Cabral (`osmar.cabral@bugbusters.com.br`). A reserva foi ampliada aos números `0001` a `0006`; novos cadastros sem número reservado começam em `0007`, com atribuição atômica no banco. A migração `0005_sequential_registration.sql` corrige os cadastros existentes pelo e-mail de acesso, preserva RAs sequenciais válidos dos demais usuários e converte os antigos RAs aleatórios em ordem de criação/ID. Ela preserva IDs, permissões, matrículas, progresso e os dados históricos dos certificados já emitidos. A série não muda automaticamente na virada do ano.

A integração com a versão publicada 9 (fonte `5f7f9aca352bad2a728349bbe98f56a20c5f5e5a`) inclui o portfólio PDF da aula 01 e suas cinco perguntas. O portal destaca respostas selecionadas/incorretas e corrige automaticamente após todas as respostas e o término do vídeo. Os selos continuam aparecendo antes do avanço. As referências antigas de vídeo da aula 01 apontam para o vídeo atualizado em `public/assets/videos/`; o vídeo próprio da aula 02 também é preservado. As migrações publicadas `0001` a `0004` foram mantidas, e a migração de RAs, ainda não publicada nesta branch, foi renumerada para `0005`. As perguntas dos módulos 02 a 08 eram iguais nas duas fontes e foram preservadas. Aplicar apenas migrações pendentes; a comparação e os testes não alteram o banco publicado.

Para preview local com D1, após o build, aplique cada migração pendente ao estado local do Wrangler conforme o README do starter Sites. Bancos locais e de produção são separados. Não publique o servidor de testes nem exponha cabeçalhos de autenticação aceitos de fontes não confiáveis.

Para demonstrar todos os painéis sem autenticação externa, execute `pnpm run preview:academy` e abra `http://127.0.0.1:5190/admin` ou `/aluno`. O servidor usa somente loopback, identidades fictícias e uma base própria em `outputs/local-preview/`, ignorada pelo Git. Os perfis de teste Administrador, Professor e Aluno aparecem no rodapé local. `/admin` abre a administração de teste; `?perfil=professor` e `?perfil=aluno` permitem conferir as restrições. Os arquivos enviados e os registros persistem entre reinícios. Na primeira execução, o servidor importa a fotografia disponível da prévia antiga para preservar seu progresso e suas conversas de teste. Ele não utiliza o banco, as contas ou o armazenamento do site publicado.

Na produção, os perfis continuam sendo os do cadastro autenticado: administradores gerenciam pessoas, matrículas, conteúdos, fórum, suporte, comunicados, certificados da academia, configurações e auditoria. Professores têm gestão de conteúdo e atendimento; alunos têm somente o espaço de aprendizado. Abrir `/admin` não promove contas. A visão geral oferece atalhos para cada gestão, o menu permite rolagem e a troca entre os espaços navega para `/admin.html` ou `/aluno.html`. Os certificados de outros participantes ficam na visão administrativa; a visão do aluno mantém apenas as conquistas do próprio usuário.

As aulas 02 a 08 também têm cinco perguntas e um portfólio próprio de oito páginas, seguindo a estrutura didática da aula 01. O conteúdo autoral editável está em `content/module-portfolios.json`; os PDFs são publicados em `public/materials/`. Para reproduzi-los, execute `scripts/generate-module-portfolios.py` com o Python do runtime que contém ReportLab e as fontes Arial do Windows. Isso não adiciona dependências ao site. A validação dos links restringe cada material ao seu curso e à sua aula.

A migração `0006_module_portfolios_and_quizzes.sql` amplia somente as avaliações originais de uma pergunta e acrescenta os materiais ausentes, identificando módulos/aulas pelos IDs. Avaliações personalizadas são preservadas para revisão administrativa. A execução repetida não duplica perguntas ou links. Vídeos, descrições, matrículas, progresso e certificados existentes são preservados; novos alunos precisam de quatro acertos em cinco perguntas. As conclusões anteriores continuam válidas.

## Verificação desta versão

Testes automatizados de API, sintaxe JavaScript, tipos TypeScript e build de produção. Revisão visual e testes em navegador real ainda precisam ser executados no ambiente autorizado. Não foram inseridos alunos fictícios no banco de produção.

A migração `0007_assigned_registrations.sql` atribui `0001` a Elizeu (incluindo o e-mail Jamaica Mangueiras usado localmente), `0002` a Guilherme, `0003` a Osmar, `0004` a Alisson Pereira e `0005` a Erik Reis. O número `0006` está reservado para Bruna Oliveira (`bruna.oliveira@bugbusters.com.br`), e é atribuído quando esse e-mail for cadastrado. O cadastro distinto de Bruna Lima não é renomeado nem associado automaticamente a ela. Ocupantes anteriores dos números reservados são movidos para números livres, preservando seus IDs e históricos.
