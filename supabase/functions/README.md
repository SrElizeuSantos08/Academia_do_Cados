# Verificações das Edge Functions

As funções Supabase executam em Deno; o site executa em Workers. Cada ambiente usa seus próprios tipos, sem declarar um Deno fictício no projeto web nem desativar a tipagem estrita.

- Site: executar `pnpm typecheck` na raiz.
- Edge Functions: com Deno 2 instalado, executar `pnpm typecheck:edge` na raiz. A configuração em deno.json fornece os tipos nativos Deno e verifica o ponto de entrada github-site-update.
- Autenticação GitHub: executar `node tests/github-site-update-oidc.test.mjs`.

As verificações não iniciam o servidor, não publicam funções e não precisam de credenciais de produção.
