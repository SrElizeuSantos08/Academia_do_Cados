-- Published legal documents for the Academia do Caos site.
-- These public policy texts are versioned in the private schema for administration.
create table academia.documentos_legais (
  slug text primary key,
  versao text not null,
  titulo text not null,
  idioma text not null default 'pt-BR',
  conteudo_markdown text not null,
  publicado_em date not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
alter table academia.documentos_legais enable row level security;
revoke all on academia.documentos_legais from public, anon, authenticated;
grant select on academia.documentos_legais to service_role;
create policy documentos_legais_service_role_read
  on academia.documentos_legais for select to service_role using (true);

insert into academia.documentos_legais
  (slug, versao, titulo, idioma, conteudo_markdown, publicado_em, ativo)
values
  ('aviso-de-privacidade','2026-10-28-v1','Aviso de Privacidade','pt-BR',$academy_legal_0$# Aviso de Privacidade — Academia do Caos
Versão 2026-10-28-v1 · Vigência: 28 de outubro de 2026

## 1. Responsável e contato
A Academia do Caos é uma iniciativa da BBS ONE. O canal para dúvidas e solicitações de privacidade é academiadocaos@bbsone.com.br. A identificação empresarial completa da entidade responsável deve acompanhar as informações institucionais e eventuais ofertas comerciais.

## 2. Dados tratados
Conforme o uso da plataforma, podemos tratar: nome, e-mail, RA, empresa, perfil e foto; dados de cadastro, matrícula e aprovação; progresso, avaliações, notas e certificados; mensagens de fórum, suporte e moderação; arquivos enviados pelo usuário; registros de autenticação, sessão, data e hora, endereço IP e informações técnicas necessárias à segurança. Senhas são armazenadas como verificadores criptográficos com salt; a equipe não deve solicitar nem consultar sua senha em texto aberto.

Não envie dados pessoais sensíveis ou informações confidenciais de terceiros em mensagens, exercícios ou arquivos, salvo quando estritamente necessário e autorizado.

## 3. Finalidades e bases legais
Usamos esses dados para criar e proteger contas, liberar matrículas, prestar cursos e suporte, registrar progresso e certificados, moderar a comunidade, prevenir fraudes e incidentes e cumprir deveres legais. O tratamento pode se apoiar, conforme a finalidade, na execução de contrato ou de procedimentos preliminares solicitados por você, no cumprimento de obrigação legal, no exercício regular de direitos e em legítimo interesse após avaliação dos direitos e expectativas dos titulares.

Cookies ou tecnologias opcionais, se vierem a ser adotados, dependerão de escolha específica e poderão ser recusados sem impedir o uso das funções essenciais. A plataforma não usa atualmente cookies de publicidade ou análise de audiência.

## 4. Compartilhamento
Dados podem ser acessados por professores e administradores autorizados para matrícula, suporte e moderação. Também podem ser tratados por fornecedores de hospedagem, banco de dados, armazenamento, envio de e-mail e segurança, limitados às finalidades do serviço e às instruções aplicáveis. Podemos atender autoridades quando houver obrigação legal e proteger direitos em processos. Não vendemos dados pessoais.

Fornecedores de nuvem podem processar dados fora do Brasil. Quando isso ocorrer, serão observados os mecanismos e garantias exigidos pela LGPD e pelas regras da ANPD para transferência internacional.

## 5. Retenção e segurança
Mantemos os dados pelo período necessário para fornecer a plataforma, preservar histórico acadêmico, cumprir obrigações legais e proteger direitos. Depois, eliminamos ou anonimizamos os dados quando possível, salvo retenção permitida ou exigida por lei.

Adotamos controles de acesso, autenticação, proteção de credenciais, cópias de segurança e medidas técnicas e administrativas proporcionais ao risco. Nenhum serviço conectado à internet pode prometer risco zero. Se um incidente puder causar risco ou dano relevante, serão adotadas as comunicações e providências previstas na legislação e nas normas da ANPD.

## 6. Seus direitos
Você pode solicitar confirmação do tratamento, acesso, correção, informação sobre compartilhamentos, portabilidade quando aplicável, anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade, revisão de decisões automatizadas quando aplicável e informações sobre consentimento e sua revogação. A eliminação pode ser limitada por obrigações legais ou pela necessidade de defesa de direitos.

Envie a solicitação para academiadocaos@bbsone.com.br, informando como podemos localizar sua conta. Poderemos confirmar sua identidade para proteger os dados. Não envie senha nem documento completo por canais públicos.

## 7. Crianças e adolescentes
A plataforma não é direcionada a crianças. O cadastro de menores deve ocorrer com ciência e autorização do responsável legal e com observância do melhor interesse da criança ou adolescente, das regras da LGPD e do Estatuto da Criança e do Adolescente.

## 8. Cookies
O cookie essencial de sessão e as preferências do navegador estão descritos na Política de Cookies, disponível no rodapé e no aviso de privacidade do site. Você pode rever as preferências a qualquer momento pelo botão “Preferências de cookies”.

## 9. Alterações e contato
Atualizaremos este Aviso quando mudarem as operações de tratamento ou a legislação. A versão vigente e sua data estão no início da página. Canal de privacidade: academiadocaos@bbsone.com.br.
$academy_legal_0$,'2026-10-28',true),
  ('politica-de-cookies','2026-10-28-v1','Política de Cookies','pt-BR',$academy_legal_1$# Política de Cookies — Academia do Caos
Versão 2026-10-28-v1 · Vigência: 28 de outubro de 2026

## 1. O que são cookies
Cookies são pequenos arquivos que um site grava no navegador. Tecnologias semelhantes, como armazenamento local, também podem guardar preferências no próprio dispositivo.

## 2. O que a plataforma usa hoje
A aplicação usa o cookie estritamente necessário `__Host-academy_session` para manter a sessão autenticada e proteger o login. Ele é marcado como Secure e HttpOnly; a sessão padrão dura até 8 horas e uma sessão de senha temporária pode durar até 15 minutos. Sem esse cookie, as áreas autenticadas e o login não funcionam.

A escolha do aviso de cookies é guardada no armazenamento local do navegador como preferência, não como cookie. A aplicação não carrega atualmente cookies próprios de publicidade, remarketing ou medição de audiência. Provedores de hospedagem e segurança podem aplicar controles técnicos indispensáveis à entrega e proteção do site.

## 3. Escolha e alteração
Você pode continuar apenas com os recursos essenciais ou abrir “Preferências de cookies”. Como não há cookies opcionais ativos pela aplicação, não há finalidade opcional para autorizar neste momento. As preferências ficam no navegador e podem ser apagadas nas configurações de armazenamento do próprio navegador. Apagar os dados do site pode encerrar sua sessão.

Se forem introduzidos cookies opcionais no futuro, esta política será atualizada, eles permanecerão desativados até uma escolha específica e será oferecida uma opção clara para recusar e alterar a escolha.

## 4. Contato
Dúvidas sobre cookies e privacidade: academiadocaos@bbsone.com.br. Consulte também o Aviso de Privacidade e os Termos de Uso.
$academy_legal_1$,'2026-10-28',true),
  ('termos-de-uso','2026-10-28-v1','Termos de Uso','pt-BR',$academy_legal_2$# Termos de Uso — Academia do Caos
Versão 2026-10-28-v1 · Vigência: 28 de outubro de 2026

## 1. Quem oferece a plataforma
A Academia do Caos é uma iniciativa da BBS ONE para educação em cibersegurança. Para falar sobre estes Termos, use academiadocaos@bbsone.com.br. Quando houver contratação ou oferta paga, a identificação empresarial completa e as condições comerciais serão exibidas antes da confirmação.

## 2. Cadastro e acesso
Informe dados verdadeiros e mantenha seu e-mail atualizado. O acesso é individual: não compartilhe senha, RA, códigos temporários ou sessão. A Academia pode solicitar confirmação de identidade e pode exigir aprovação de professor ou administrador antes de liberar cursos ou áreas da plataforma. Avise a equipe se suspeitar de acesso indevido.

Menores de 18 anos devem usar a plataforma com ciência e autorização de seu responsável legal. O responsável deve acompanhar o uso e os dados fornecidos, observadas as regras legais aplicáveis a crianças e adolescentes.

## 3. Uso educacional responsável
Cursos, demonstrações, laboratórios e materiais servem para aprendizagem e defesa. Só teste sistemas, contas, redes, dispositivos ou dados que pertençam a você ou para os quais tenha autorização expressa. É proibido usar o conteúdo para invadir, interromper, fraudar, coletar dados sem autorização, instalar código malicioso, distribuir credenciais, executar phishing contra terceiros ou contornar controles de segurança.

Exercícios que simulem ataques devem ocorrer exclusivamente nos ambientes de laboratório identificados e autorizados pela Academia ou em ambiente próprio. Não direcione atividades a sistemas reais de terceiros sem autorização documentada. A violação pode levar à suspensão do acesso e às demais medidas cabíveis.

## 4. Convivência e conteúdo enviado
Respeite alunos, professores e equipe. Não publique ameaças, discriminação, assédio, dados pessoais de terceiros, arquivos ilegais, spam ou material que viole direitos. Use a denúncia do fórum para relatar conteúdo. A equipe pode ocultar conteúdo, moderar discussões e restringir contas para proteger a comunidade.

Ao enviar conteúdo, você declara que pode fazê-lo e concede à Academia uma licença limitada, não exclusiva e revogável enquanto necessário para exibir, armazenar e moderar esse conteúdo dentro da plataforma. Você continua titular dos direitos que possua. Não envie informação confidencial de sua empresa, cliente ou terceiro.

## 5. Cursos, progresso e certificados
A disponibilidade depende da matrícula e liberação do curso. Critérios de conclusão, avaliações e carga horária são os apresentados na grade. Certificados registram a conclusão conforme os dados do curso e não equivalem, salvo indicação expressa, a diploma reconhecido pelo MEC, licença profissional ou certificação de terceiro.

## 6. Materiais e propriedade intelectual
Textos, vídeos, avaliações, marcas, ilustrações e demais materiais pertencem aos respectivos titulares. A plataforma concede permissão pessoal, limitada e não transferível para uso educacional conforme a matrícula. Não copie, revenda, publique, grave ou redistribua materiais sem autorização do titular, exceto nos limites permitidos por lei.

## 7. Disponibilidade, suporte e segurança
A Academia pode atualizar materiais, realizar manutenção e adotar medidas de segurança. Busca manter o serviço disponível, sem garantir funcionamento ininterrupto. Procure o suporte pelo canal informado na plataforma. Nunca envie sua senha por e-mail ou fórum.

## 8. Ofertas, pagamento e direitos do consumidor
Quando houver oferta paga, preço, fornecedor, forma de pagamento, disponibilidade, prazo de acesso, cancelamento e demais condições serão informados antes da contratação. Os direitos previstos no Código de Defesa do Consumidor e na legislação de comércio eletrônico permanecem aplicáveis. Nada nestes Termos elimina direitos legais do consumidor.

## 9. Suspensão e encerramento
A Academia pode suspender ou encerrar acesso em caso de risco à segurança, fraude, violação destes Termos ou determinação legal. Sempre que possível, informará o motivo e o canal para contestação. Você pode pedir encerramento da conta e exercer direitos sobre seus dados pelo e-mail academiadocaos@bbsone.com.br, respeitadas obrigações legais e registros necessários.

## 10. Atualizações e legislação
Estes Termos podem mudar para refletir alterações do serviço ou da legislação. A versão vigente e a data aparecem no início desta página; mudanças relevantes serão comunicadas pelo site ou por e-mail. Aplicam-se as leis brasileiras, inclusive a LGPD, o Marco Civil da Internet, o Código de Defesa do Consumidor e a Lei de Direitos Autorais, quando pertinentes.

## 11. Contato
Dúvidas sobre a plataforma ou estes Termos: academiadocaos@bbsone.com.br.
$academy_legal_2$,'2026-10-28',true)
on conflict (slug) do update set
  versao=excluded.versao,
  titulo=excluded.titulo,
  idioma=excluded.idioma,
  conteudo_markdown=excluded.conteudo_markdown,
  publicado_em=excluded.publicado_em,
  ativo=excluded.ativo;
