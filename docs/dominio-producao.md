# Domínio oficial da Academia do Caos

- Site: https://academiadocaos.bbsone.com.br
- Remetente aprovado: Academia do Caos <academiadocaos@bbsone.com.br>
- Hospedagem atual: Sites, com Worker, banco D1 e armazenamento R2.
- Projeto existente: `appgprj_6ad110d3547c8191b146bfa491d07235`.
- Código-fonte: https://github.com/SrElizeuSantos08/Academia_do_Cados

## DNS e HTTPS

O painel DNS fornecido pelo responsável em 26/10/2026 mostra:

| Tipo | Nome | Destino ou finalidade |
| --- | --- | --- |
| CNAME | academiadocaos.bbsone.com.br | custom-domains.chatgpt.site, somente DNS |
| TXT | _cf-custom-hostname.academiadocaos.bbsone.com.br | Validação do certificado; conservar o valor emitido pela hospedagem |
| TXT | _openai-site-verification.academiadocaos.bbsone.com.br | Validação do domínio; conservar o valor emitido pela hospedagem |

A imagem do painel comprova a configuração informada, mas não comprova propagação DNS nem emissão do certificado. Os tokens de validação não foram transcritos de campos truncados. Confira os valores completos na hospedagem e preserve os registros existentes.

Vincule ou confirme o hostname no mesmo projeto Sites e atualize o status da validação. Só considere o domínio publicado depois de confirmar o vínculo ativo, HTTPS válido e abertura do site. Não altere a audiência nem recrie o projeto para corrigir um erro de configuração.

## Variáveis de produção

O arquivo `.env.example` documenta o endereço oficial e o remetente. Ele não é aplicado automaticamente em produção. Configure na hospedagem:

```text
ACADEMY_PUBLIC_URL=https://academiadocaos.bbsone.com.br
ACADEMY_EMAIL_FROM=Academia do Caos <academiadocaos@bbsone.com.br>
```

Configure `RESEND_API_KEY` como segredo. Depois, publique uma versão salva para aplicar a revisão do ambiente. Não grave a chave em `.env.example`, arquivos públicos, commits, issues ou logs. Variáveis do GitHub Actions não são transferidas automaticamente ao Sites.

O envio usa o provedor selecionado em `ACADEMY_EMAIL_PROVIDER`. Para a caixa compartilhada Microsoft 365, use `microsoft365` e siga [a configuração do aplicativo e da caixa](microsoft365-email.md). O modo Resend permanece disponível e exige domínio autorizado nesse provedor. Estes arquivos não concedem permissões nem configuram o Exchange automaticamente.

## Verificação funcional

1. Abrir o endereço HTTPS oficial e conferir Home, login, cadastro e navegação.
2. Confirmar que a política Sites permite o acesso do participante de teste.
3. Solicitar um acesso com um e-mail de teste autorizado.
4. Conferir recebimento, nome, logo e botão apontando ao domínio oficial.
5. Confirmar troca obrigatória, expiração e impossibilidade de reutilizar a senha temporária.
6. Conferir acesso dos perfis aluno e empresa conforme as permissões cadastradas.

## Situação registrada em 26/10/2026

O domínio está documentado no repositório, o exemplo de ambiente usa o endereço oficial e Home/Sou Empresa possuem metadados canônicos para esse endereço. A consulta de domínios e a gravação de variáveis pela integração Sites retornaram `404 / project_not_found`, embora a consulta do próprio Site encontre o projeto. O vínculo ativo do domínio, o certificado e o envio de e-mail não foram confirmados nesta alteração; precisam de validação na hospedagem. Publicar este commit no GitHub não resolve automaticamente esse erro externo.

## Publicação

O projeto utiliza APIs, banco e arquivos protegidos. Preserve o fluxo de publicação Sites; GitHub Pages publica apenas conteúdo estático e não executa este backend. Não foi criado um arquivo `CNAME` de GitHub Pages, pois o DNS apresentado aponta para Sites. A alteração de domínio não exige trocar o identificador `.openai/hosting.json`, recriar o banco, alterar RAs ou remover certificados.
