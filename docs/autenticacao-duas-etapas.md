# Autenticação em duas etapas (TOTP)

O perfil da plataforma permite que cada aluno, professor e administrador ative códigos TOTP usando um aplicativo autenticador compatível, como Aegis, Google Authenticator ou Microsoft Authenticator. Depois da ativação, o login pede a senha e um código de seis dígitos que muda aproximadamente a cada 30 segundos.

## Preparação do servidor

Gere uma chave aleatória de 32 bytes:

```sh
openssl rand -hex 32
```

Configure o resultado como segredo de servidor `MFA_ENCRYPTION_KEY` no ambiente de produção. No ambiente local, coloque o valor em `.dev.vars` (arquivo ignorado pelo Git), nunca em `NEXT_PUBLIC_*`, no código fonte ou no repositório. Não reutilize a chave entre ambientes. Se a chave for perdida, os segredos TOTP existentes não poderão ser descriptografados; usuários afetados precisarão recuperar a conta com apoio da equipe.

O armazenamento de TOTP depende da migração `drizzle/0011_totp_two_factor.sql` no D1. Para a configuração Supabase, a migração `supabase/migrations/20261028150000_academia_totp_two_factor.sql` cria as tabelas privadas, ativa RLS, remove acesso público e atualiza o gateway fixo usado pelo servidor. A aplicação precisa estar apontada para o provedor escolhido e a migração correspondente aplicada antes de habilitar o recurso.

## Como ativar

1. Acesse **Meu perfil → Autenticação em duas etapas**.
2. Confirme a senha atual.
3. No aplicativo autenticador, adicione uma conta usando a chave de configuração mostrada, ou abra o link `otpauth://` em um dispositivo compatível.
4. Digite o código atual para confirmar a configuração.
5. No próximo login, informe um novo código junto com a senha.

A chave TOTP é criptografada com AES-GCM antes de ser gravada no banco. O código recebido no login é limitado a uma única utilização, o desafio expira em cinco minutos e códigos incorretos são limitados. Recuperações por senha temporária também exigem o segundo fator antes de criar uma nova sessão quando o TOTP está habilitado.

Não há códigos de recuperação impressos nesta versão. Se alguém perder acesso ao aplicativo, o suporte administrativo deve validar a identidade e orientar o processo de recuperação da conta.
