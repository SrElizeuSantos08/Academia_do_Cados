# Sincronização da hospedagem com o GitHub — 29/10/2026

Origem publicada: versão 45, fonte c4930b342c5ce5e30a6ae003c1298aacadf89b7d. Base GitHub: main 0f7cd257900f6fc971631deca84486e1b6e2fe0c. O trabalho foi preparado em cópia isolada na Branch-Arakaki, com backup fora do repositório.

## Melhorias incorporadas

- Monitoramento administrativo de envios de acesso e segundo fator: destinatário mascarado, provedor, aceitação ou falha, código de erro e horário. A aceitação pelo provedor não comprova entrega na caixa do destinatário. O painel não armazena o conteúdo do e-mail, senha temporária ou código de autenticação.
- Nova tabela auth_email_events, retenção de 180 dias, exportação administrativa e quatro consultas adicionais no gateway fixo. O registro do evento não impede a autenticação se a gravação do próprio monitoramento falhar.
- Atalho e painel de e-mails com acesso exclusivo de administradores. O contato de suporte já existente na main foi mantido.
- Ajustes da página inicial, estilos e animações presentes nas versões 44 e 45.
- Testes e fixtures correspondentes, catálogo PostgreSQL e documentação do estado do Supabase.

## Migrações e diferenças deliberadamente preservadas

As entradas 0 a 15 do journal D1 da main e seus arquivos históricos não foram substituídos pelo histórico de outra numeração da hospedagem. A migração 0016_email_delivery_events foi acrescentada. As fixtures de teste receberam os ajustes publicados sem reescrever migrações já existentes.

A migração Supabase 20261029161140_email_delivery_events consta do histórico remoto e já está aplicada. Seu arquivo é versionado para reprodução e auditoria, sem nova execução em produção nesta sincronização. O catálogo gerado contém 188 consultas, incluindo as sete operações legadas de autenticador já preservadas.

O journal D1 da hospedagem tem nomes históricos diferentes. Antes de uma publicação futura pelo Sites, conferir a fonte hospedada atual e preservar suas migrações já aplicadas. Copiar todos os SQL da main para a pasta executável da hospedagem causa reaplicação de alterações antigas, mesmo que os arquivos não estejam no journal. O pacote deve conter somente o histórico da hospedagem e as migrações novas; as cópias alternativas devem permanecer fora da pasta executável. Esta sincronização não republica o Site nem troca seu banco.

## Validação

- 33/33 arquivos de teste passaram, incluindo envios aceitos e rejeitados, mascaramento, segundo fator, permissões do painel e os oito vídeos Vimeo.
- TypeScript, Deno e build passaram. Permanece o aviso existente do vinext sobre classificação estática de rotas.
- As migrações antigas da main permaneceram intactas. Nenhuma senha, segredo, exportação de usuários ou dado de produção foi adicionado ao Git.
- A aprovação dos testes locais deve ser complementada pelos resultados reais do GitHub Actions no Pull Request e após o merge.

O recebimento de e-mails reais em Outlook/Gmail não foi retestado nesta sincronização. Os testes de envio utilizam o provedor simulado e não disparam mensagens aos alunos.
