# Academia do Caos

Plataforma de cursos de cibersegurança com site institucional, painel administrativo e área do aluno.

**Domínio oficial:** https://academiadocaos.bbsone.com.br

**Remetente:** Academia do Caos <academiadocaos@bbsone.com.br>

Veja a configuração de DNS, HTTPS e ambiente em [Domínio de produção](docs/dominio-producao.md). A ativação depende da validação na hospedagem; o commit não altera o DNS automaticamente.

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

Cada aula concluída registra o progresso e libera um selo digital. O certificado de módulo exige todas as aulas concluídas e aproveitamento mínimo de 75% em cada avaliação; informa tema, carga horária e aproveitamento ponderado pela quantidade de perguntas. O certificado final exige também uma avaliação de fechamento, com uma decisão de cada módulo e mínimo de 75%. A aprovação final libera uma conquista visual personalizada.

Os certificados usam um registro persistente com dados de conclusão congelados: nome e RA do cadastro no momento da emissão, curso, módulo, carga horária, aproveitamento, nível, data e identificador. A emissão permite baixar diretamente o PDF A4 horizontal ou imprimir pelo navegador. O código e o link permitem consultar o registro com autenticação no portal. Registros emitidos anteriormente são preservados. Os resultados de fechamento usam chaves reservadas em `progress`, separadas das aulas e excluídas dos contadores de aulas; não exigem uma nova tabela. Alterações nas perguntas de fechamento exigem uma nova aprovação para futuras emissões, sem invalidar certificados já emitidos.

A trilha intermediária **Segurança Digital no Trabalho** tem seis módulos com cenário empresarial, portfólio PDF de oito páginas, decisão prática e cinco perguntas comentadas. Os vídeos ainda estão em preparação; as aulas podem ser concluídas por leitura e avaliação. A carga inicial é de 15 minutos por módulo (1h30 total). O conteúdo está em `content/intermediate-course.json`, com catálogo em `lib/catalog.mjs`. Na administração, abra Cursos e escolha **Importar Segurança Digital no Trabalho**, depois libere as matrículas. A importação é idempotente e preserva cursos existentes.

Cada módulo intermediário tem um selo próprio: Negociação Verificada, Compartilhamento Consciente, Identidade Protegida, Suporte Validado, IA com Critério e Incidente Comunicado. As imagens WebP transparentes ficam em `public/assets/badges/intermediario-*`; o catálogo compartilhado distingue os módulos das duas trilhas. Após a conclusão confirmada no servidor, o aluno recebe o selo, consulta os comentários da avaliação e só então avança. Os selos também aparecem no painel e na sala de aula e permanecem disponíveis ao retornar. Os certificados usam o mesmo fluxo da básica: seis certificados de módulo de 0,25 h e um certificado final de 1,5 h após aprovação no fechamento, com nome/RA do cadastro, aproveitamento e identificação para validação, sem duplicação na reemissão.

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
node tests/assigned-registration.test.mjs
node tests/intermediate-course.test.mjs
node tests/certification.test.mjs
python tests/portfolios.test.py  # opcional: validação dos PDFs com pypdf/pdfplumber no Python de autoria
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

Testes automatizados de API, sintaxe JavaScript, tipos TypeScript, PDFs e build de produção. O fluxo de fechamento, conquista, emissão e download foi validado em navegador com uma base local isolada. O build pode informar que o Vinext não classifica automaticamente algumas rotas dinâmicas; a compilação termina com sucesso. Não foram inseridos alunos fictícios no banco de produção.

Para testar em outra máquina, instale as dependências com o lockfile e execute `pnpm run preview:academy`. Os PDFs, selos e vídeos utilizados pelo portal estão versionados; Python e Remotion não são necessários para executar o portal. As ferramentas de autoria têm dependências próprias. A base de demonstração, usuários cadastrados localmente, progresso e uploads em `outputs/local-preview/` não são enviados pelo Git. O preview cria perfis fictícios e importa as duas trilhas sem substituir cursos já existentes.

Antes da publicação em produção, valide a integração em um ambiente de teste, aplique somente as migrações ainda pendentes e importe a trilha intermediária pelo painel administrativo. Publicar o código não transfere a base local nem cria automaticamente matrículas. Preserve a identidade do Site e suas configurações de acesso e armazenamento. O envio da branch e a abertura de um Pull Request não publicam o site.

A migração `0007_assigned_registrations.sql` atribui `0001` a Elizeu, `0002` a Guilherme, `0003` a Osmar, `0004` a Alisson Pereira e `0005` a Erik Reis. O número `0006` está reservado para Bruna Oliveira (`bruna.oliveira@bugbusters.com.br`), e é atribuído quando esse e-mail for cadastrado. O cadastro distinto de Bruna Lima não é renomeado nem associado automaticamente a ela. Ocupantes anteriores dos números reservados são movidos para números livres, preservando seus IDs e históricos.

## Videoaula sobre phishing

O [projeto da videoaula](cursos/phishing-video-aula/README.md) inclui o [vídeo final legendado](cursos/phishing-video-aula/exports/Phishing%20-%20video%20aula.mp4), a gravação original, os dois áudios e as instruções de edição. A inclusão dos arquivos no repositório não cadastra automaticamente a aula no catálogo da plataforma.

O e-mail correto de Elizeu é `elizeu.santos@bugbusters.com.br`; somente esse endereço reserva o RA `AC-2026-0001` em novos cadastros. O endereço incorreto não é mais um alias de cadastro. A migração histórica `0007` foi preservada sem alterações: suas referências antigas serviram para atribuir RAs a cadastros existentes, não para criar contas ou atualizar e-mails. Esta correção no código não substitui os dados de um banco publicado.

A aula 03 da básica, **Sou eu! Só mudou o número…**, usa como vídeo padrão `public/assets/videos/modulo-03-aula-01.mp4` (2min02s, 1280×720, H.264/AAC), tanto no portal quanto na demonstração piloto. O arquivo fornecido foi preservado, com áudio, música e legendas incorporadas. O caso do falso contato da filha pedindo Pix está alinhado ao portfólio Identidade antes da confiança: número novo, pressão, confirmação pelo contato conhecido e atenção ao destinatário; a palavra de segurança aparece como proteção extra, sem substituir confirmação independente. O vídeo padrão é apresentado em cursos novos e existentes sem regravar suas grades; uploads personalizados têm prioridade. A API exige o término do vídeo e aprovação na avaliação antes da primeira conclusão desta aula, preservando conclusões anteriores. `node tests/lesson03-video.test.mjs` verifica esse fluxo, a vinculação ao portfólio e a preservação de uploads/histórico.

## Documentos e pausa do aluno

O certificado utiliza o modelo PDF fornecido pela academia, com nome, curso ou módulo, carga horária, data e código preenchidos pelo registro de conclusão. A emissão usa `src/student-documents.mjs`; o pacote de navegador é gerado por `scripts/build-documents.mjs` durante o build. Os arquivos `public/templates/` são modelos e fontes, sem dados de alunos. O documento de cada participante é gerado no navegador e não é gravado em diretórios públicos.

A página Minha carteirinha usa os dados e a foto do perfil, permite selecionar um curso liberado e exporta duas páginas de 85,6 × 54 mm, uma para a frente e outra para o verso, sem QR Code. Momento de distração abre a versão final do jogo em outra aba, preservando a aula aberta. O login existente foi mantido.

## Acompanhamento, fórum e player

A equipe docente encontra Acompanhamento no painel: progresso por matrícula, RA, notas médias das avaliações, horas curriculares proporcionais à carga do módulo, última atividade e CSV com os filtros atuais. Horas curriculares não equivalem a presença cronometrada.

O fórum oferece tópicos por curso, fixação e encerramento pela equipe, denúncias, ocultação/restauração com motivo e histórico. Arquivos de mensagens ocultadas também são bloqueados aos demais alunos.

O player mantém velocidade de 0,5× a 2×, posição ao mudar de qualidade, legendas WebVTT e variantes cadastradas pelo professor. A seleção de qualidade utiliza arquivos enviados, sem prometer transcodificação automática.

O assistente consulta apenas as aulas liberadas, descrições, o PDF didático e a transcrição da aula piloto. A integração de IA usa OPENAI_API_KEY no servidor e OPENAI_MODEL opcional (padrão gpt-4.1-mini), com fontes, limite de consultas e encaminhamento ao professor. Sem credencial, a interface informa explicitamente que a consulta é feita sem IA. A migração 0005 ativa o assistente; a IA requer configuração válida no ambiente de produção. Nunca colocar credenciais no código ou no navegador.

Administradores iniciais de um banco novo podem ser definidos no servidor em BOOTSTRAP_ADMIN_EMAILS, separados por vírgula. A ausência dessa configuração não altera os administradores já cadastrados. Novos acessos administrativos também podem ser cadastrados por um administrador existente no painel; não há mais e-mails pessoais fixos no código.

## Login da academia

A autenticação própria usa e-mail ou RA e senha pessoal, sobre a camada de acesso da hospedagem. A recuperação por identidade Sites verificada permanece disponível para contas já vinculadas.



## Acesso temporário por e-mail

O envio suporta Microsoft 365/Graph para a caixa compartilhada da academia e Resend para compatibilidade. Para Microsoft 365, siga [Configuração e validação](docs/microsoft365-email.md). O servidor precisa de credenciais próprias do aplicativo autorizado; a conexão Outlook do ChatGPT não é transferida à plataforma.

Para o modo Resend, configure no ambiente de produção, fora do Git:

- `RESEND_API_KEY`: segredo de API com permissão de envio e domínio verificado.
- `ACADEMY_EMAIL_FROM`: `Academia do Caos <academiadocaos@bbsone.com.br>`, após autorização no provedor de envio.
- `ACADEMY_PUBLIC_URL`: `https://academiadocaos.bbsone.com.br`.

Sem esses três valores válidos, o cadastro e a solicitação de senha por e-mail retornam 503 e informam que o envio precisa ser configurado. Não há envio simulado nem senha alternativa. Se o serviço falhar, retorna 502, descarta a credencial temporária e permite tentar novamente pela solicitação de acesso. Um cadastro pendente pode permanecer no banco; não tem credencial utilizável e pode repetir a solicitação. A aceitação pela API de e-mail não comprova entrega na caixa de entrada; monitore a entrega no provedor.

O e-mail tem logo institucional incorporada via CID, versão HTML e texto puro, saudação personalizada, conteúdo para aluno/empresa, botão de acesso e instruções. `public/email-exemplo.html` é somente uma demonstração com nome e senha fictícios, sem chamada de envio.

APIs (todas as escritas exigem JSON e origem válida):

| Rota | Uso |
| --- | --- |
| `GET /api/lms/auth/config` | Disponibilidade da configuração, sem expor credenciais |
| `POST /api/lms/auth/register` | Nome, e-mail, empresa, curso e `space` (`student`/`company`); sem senha fornecida pelo usuário |
| `POST /api/lms/auth/request-access` | Solicita credencial temporária para e-mail/RA; resposta genérica para reduzir enumeração |
| `POST /api/lms/auth/login` | E-mail/RA e senha; uma credencial temporária só abre sessão restrita |
| `POST /api/lms/auth/password` | Troca autenticada; encerra sessões e invalida credenciais temporárias |
| `POST /api/lms/auth/recover` | Recuperação por identidade Sites verificada, sem escolher outra conta pelo formulário |

As senhas temporárias são geradas por CSPRNG local (128 bits), têm validade de 15 minutos, consumo atômico de uso único e hash com salt no banco. Não são devolvidas pela API, exibidas na interface nem registradas em logs. A senha permanente não é alterada por uma solicitação de e-mail. A troca exige 12 a 128 caracteres e rejeita padrões comuns/repetidos. Solicitações e logins têm limites por IP e conta; e-mail e RA convergem para a mesma conta no limite de login. Cookies são Secure, HttpOnly e particionados; o prazo da sessão temporária nunca supera o da credencial.

A migração de segurança remove credenciais legadas marcadas para troca e suas sessões, preservando senhas pessoais, RAs, matrículas e progresso. Cadastro de empresa cria perfil sem privilégio administrativo, marcado como empresa em `auth_profiles.account_type`; a administração precisa autorizar o papel de professor/administrador em Alunos e equipe para liberar o painel. Enquanto isso a conta tem apenas os acessos de aluno matriculado.


## Envio Microsoft 365

O teste pela caixa compartilhada foi enviado e seu recebimento confirmado em 26/10/2026. O Exchange apresentou o endereço principal `academiadocaosbbsone@bbsone.com.br`. O suporte ao Microsoft Graph está implementado, com logo incorporada, HTML personalizado e troca obrigatória da senha temporária. O envio automático depende da autorização do aplicativo e da configuração na hospedagem. Consulte [o procedimento e as pendências](docs/microsoft365-email.md).
