# Envio automático pelo Microsoft 365

## O que foi verificado

Em 26/10/2026, um teste autorizado foi enviado pela caixa `academiadocaos@bbsone.com.br` à conta do solicitante e o recebimento foi confirmado. O remetente apresentado pelo Exchange foi `academiadocaosbbsone@bbsone.com.br`, endereço principal da caixa. O teste usou a conexão Outlook desta conversa, não a credencial de aplicativo do site.

A aplicação tem suporte a Microsoft Graph com `client_credentials`, HTML institucional e logo incorporada por CID. A conexão Outlook do ChatGPT não fornece ao servidor as credenciais de execução automática. Não copiar tokens dessa conexão para o projeto.

## Configuração no Microsoft Entra / Exchange

Estas etapas exigem acesso administrativo à organização e não foram executadas pela integração desta conversa:

1. Registrar um aplicativo dedicado, de um único tenant, para o envio transacional da Academia do Caos.
2. Registrar o Tenant ID, Application/Client ID e a credencial de aplicativo. A implementação atual aceita client secret; armazená-lo exclusivamente como segredo na hospedagem. Não é a senha da caixa compartilhada.
3. Autorizar somente envio à caixa da academia. Preferir Exchange Application RBAC com papel `Application Mail.Send` e escopo limitado a essa caixa, seguido de `Test-ServicePrincipalAuthorization`. Não conceder leitura, exclusão ou acesso geral a todas as caixas.
4. Revisar permissões globais pré-existentes: autorizações do Entra e do Exchange são cumulativas. Um escopo RBAC não limita uma permissão global independente já concedida.
5. Validar o endereço de envio. O UPN informado é `academiadocaos@bbsone.com.br`, mas o teste chegou com o endereço principal `academiadocaosbbsone@bbsone.com.br`. Para usar o primeiro como From, o administrador precisa validar o alias e as regras de envio do Exchange. Não alterar o remetente para o endereço principal sem aprovação do responsável.

Referências oficiais:
- https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0
- https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow
- https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac

## Variáveis na hospedagem

```text
ACADEMY_EMAIL_PROVIDER=microsoft365
ACADEMY_PUBLIC_URL=https://academiadocaos.bbsone.com.br
ACADEMY_EMAIL_FROM=Academia do Caos <academiadocaos@bbsone.com.br>
M365_MAILBOX_UPN=academiadocaos@bbsone.com.br
M365_TENANT_ID=<identificador real do tenant>
M365_CLIENT_ID=<identificador real do aplicativo>
M365_CLIENT_SECRET=<segredo real, inserido somente na hospedagem>
```

Os IDs devem ser GUIDs. O arquivo `.env.example` tem campos vazios para os valores que ainda não foram fornecidos; preenchê-lo no GitHub não aplica segredos ao ambiente de produção. Depois de configurar o ambiente, publicar uma versão salva para aplicar a revisão.

`RESEND_API_KEY` não é necessário ao selecionar explicitamente `microsoft365`. Sem seleção explícita, a compatibilidade com o provedor anterior, Resend, é mantida. Um provedor inválido ou credenciais incompletas bloqueia o envio; não há troca automática de provedor.

## Segurança e comportamento

Os endereços de autenticação e envio são fixos para Microsoft Entra/Graph, com redirecionamentos bloqueados. Credenciais, tokens e senhas temporárias não são registrados em logs nem devolvidos pela API. O servidor não aceita credenciais vindas do cadastro do aluno. O token é usado em memória na mesma operação de envio.

Graph retorna `202` sem corpo ao aceitar uma mensagem. A aplicação aceita esse retorno sem tentar decodificar JSON; isso não comprova entrega final na caixa. Não há repetição automática de envio após timeout ou resultado ambíguo, para evitar e-mails duplicados. O fluxo mantém validade de 15 minutos, login único e troca obrigatória da senha temporária.

## Verificação final após autorização

1. Conferir `GET /api/lms/auth/config` e o estado `emailReady`.
2. Fazer um cadastro de teste autorizado no domínio oficial.
3. Conferir recebimento, remetente real, logo, personalização e destino do botão.
4. Entrar com a senha temporária; verificar que apenas a troca de senha está disponível.
5. Definir senha pessoal e confirmar acesso correto de aluno/empresa, expiração e bloqueio de reutilização.

O teste real da caixa compartilhada foi concluído. O teste real do cadastro com credencial de aplicativo permanece pendente: faltam os IDs/segredo do aplicativo, autorização administrativa e gravação das variáveis. A API da hospedagem continua retornando `404 / project_not_found` para essas variáveis. Não foi possível ativar o envio automático em produção nesta etapa.
