# Autenticação em duas etapas por e-mail

A plataforma permite que cada pessoa ative a autenticação em duas etapas nas configurações do perfil. Para ativar, confirma a senha atual e informa o código enviado ao e-mail de acesso. Depois, cada login com senha exige outro código de seis dígitos enviado ao mesmo endereço.

Os códigos expiram em 10 minutos, podem ser usados uma única vez e admitem no máximo cinco tentativas. O banco guarda apenas um HMAC do código vinculado ao desafio aleatório; o código em texto claro existe somente durante o envio. Mensagens são enviadas pelo provedor institucional já configurado (Microsoft 365 ou Resend), com identidade visual da Academia do Caos.

A autenticação de contas externas permanece sob controle do provedor de identidade usado para entrar. A ativação por e-mail só fica disponível para contas com senha local e e-mail confirmado/acessível.

## Configuração e migração

O envio usa a configuração de e-mail do servidor (`ACADEMY_EMAIL_PROVIDER`, `ACADEMY_EMAIL_FROM`, `ACADEMY_PUBLIC_URL` e credenciais de Resend ou Microsoft 365). Não há chave de autenticador a instalar no navegador nem segredo TOTP para publicar.

Para D1, aplique `drizzle/0015_email_two_factor.sql` após `0014_totp_two_factor.sql`. Para Supabase, aplique `supabase/migrations/20261028160000_academia_email_two_factor.sql`; ela amplia os campos do desafio privado e atualiza o gateway SQL fixo do servidor. Os códigos e desafios devem permanecer em tabelas privadas, sem acesso de `anon` ou `authenticated`.
