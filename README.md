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
pnpm exec tsc --noEmit
pnpm run build
```

No ambiente Sites, utilize os helpers oficiais de instalação, build e publicação. O manifesto `.openai/hosting.json` preserva o projeto existente e declara `DB` e `BUCKET`. Migrações de produção são aplicadas pelo fluxo de publicação. Não crie tabelas durante requisições.

Para preview local com D1, após o build, aplique cada migração pendente ao estado local do Wrangler conforme o README do starter Sites. Bancos locais e de produção são separados. Não publique o servidor de testes nem exponha cabeçalhos de autenticação aceitos de fontes não confiáveis.

## Verificação desta versão

Testes automatizados de API, sintaxe JavaScript, tipos TypeScript e build de produção. Revisão visual e testes em navegador real ainda precisam ser executados no ambiente autorizado. Não foram inseridos alunos fictícios no banco de produção.

## Documentos e pausa do aluno

O certificado utiliza o modelo PDF fornecido pela academia, com nome, curso ou módulo, carga horária, data e código preenchidos pelo registro de conclusão. A emissão usa `src/student-documents.mjs`; o pacote de navegador é gerado por `scripts/build-documents.mjs` durante o build. Os arquivos `public/templates/` são modelos e fontes, sem dados de alunos. O documento de cada participante é gerado no navegador e não é gravado em diretórios públicos.

A página Minha carteirinha usa os dados e a foto do perfil, permite selecionar um curso liberado e exporta duas páginas de 85,6 × 54 mm, uma para a frente e outra para o verso, sem QR Code. Momento de distração abre a versão final do jogo em outra aba, preservando a aula aberta. O login existente foi mantido.

## Acompanhamento, fórum e player

A equipe docente encontra Acompanhamento no painel: progresso por matrícula, RA, notas médias das avaliações, horas curriculares proporcionais à carga do módulo, última atividade e CSV com os filtros atuais. Horas curriculares não equivalem a presença cronometrada.

O fórum oferece tópicos por curso, fixação e encerramento pela equipe, denúncias, ocultação/restauração com motivo e histórico. Arquivos de mensagens ocultadas também são bloqueados aos demais alunos.

O player mantém velocidade de 0,5× a 2×, posição ao mudar de qualidade, legendas WebVTT e variantes cadastradas pelo professor. A seleção de qualidade utiliza arquivos enviados, sem prometer transcodificação automática.

O assistente consulta apenas as aulas liberadas, descrições, o PDF didático e a transcrição da aula piloto. A integração de IA usa OPENAI_API_KEY no servidor e OPENAI_MODEL opcional (padrão gpt-4.1-mini), com fontes, limite de consultas e encaminhamento ao professor. Sem credencial, a interface informa explicitamente que a consulta é feita sem IA. A migração 0005 ativa o assistente; a IA requer configuração válida no ambiente de produção. Nunca colocar credenciais no código ou no navegador.

## Videoaula sobre phishing

O [projeto da videoaula](cursos/phishing-video-aula/README.md) inclui o [vídeo final legendado](cursos/phishing-video-aula/exports/Phishing%20-%20video%20aula.mp4), a gravação original, os dois áudios e as instruções de edição. A inclusão dos arquivos no repositório não cadastra automaticamente a aula no catálogo da plataforma.

Administradores iniciais de um banco novo podem ser definidos no servidor em BOOTSTRAP_ADMIN_EMAILS, separados por vírgula. A ausência dessa configuração não altera os administradores já cadastrados. Novos acessos administrativos também podem ser cadastrados por um administrador existente no painel; não há mais e-mails pessoais fixos no código.
