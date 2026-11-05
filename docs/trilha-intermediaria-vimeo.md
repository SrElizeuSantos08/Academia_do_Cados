# Vídeos da trilha intermediária

Atualização de 05/11/2026, publicada no Site como versão 51, fonte e5c29f98f2956df0539d17ba9c20d00606c73605. A sincronização GitHub foi preparada na Branch-Arakaki sobre a main b953526876f0e9b062fba0076bc172cdb1301cc4. A integração à main deverá ocorrer em etapa posterior.

## Correspondência das aulas

| Aula | Identificador interno | Vídeo Vimeo |
| --- | --- | --- |
| 01 | intermediate-l1 | https://vimeo.com/1243758673 |
| 02 | intermediate-l2 | https://vimeo.com/1243758644 |
| 03 | intermediate-l3 | https://vimeo.com/1243758674 |
| 04 | intermediate-l4 | https://vimeo.com/1243758641 |
| 05 | intermediate-l5 | https://vimeo.com/1243758640 |
| 06 | intermediate-l6 | https://vimeo.com/1243758642 |

O mapa fica em public/lesson-media.js e reutiliza o player do básico: início por ação do aluno, retomada da posição, salvamento de progresso, liberação das perguntas após o fim do vídeo e descarte do player ao navegar. Os oito vídeos e hashes de privacidade do básico permanecem intactos. As páginas admin.html, aluno.html e portal.html usam a referência lesson-media.js?v=20261105 para atualizar o cache.

## Disponibilidade e dados

Na produção, a configuração settings com chave course:cyber-intermediate:development foi alterada de on para off após a implantação. O curso cyber-intermediate já estava publicado. Essa liberação é estado do banco; enviar código ao GitHub não recria nem transporta essa configuração.

Não reaplicar a migração antiga que colocava a trilha em desenvolvimento. Em outro ambiente, um administrador deve conferir o curso e usar a ação de liberar a trilha no painel. As regras existentes de matrícula, sequência e acesso entre cursos foram preservadas. Nenhum aluno foi matriculado automaticamente por esta atualização.

Perguntas, portfólios, selos, certificados e registros de progresso não foram reescritos. Não houve alteração de schema, credenciais ou provedores.

## Validação

O teste vimeo-lesson confere as 14 associações de vídeo, isolamento entre cursos, links sem parâmetros de compartilhamento, títulos acessíveis, retomada e salvamento nas duas trilhas, cinco perguntas e portfólio preservados, pré-requisito do básico e ausência de conclusão automática. A suíte completa, TypeScript e build devem passar antes do envio.

Os seis links intermediários foram confirmados pela API pública de incorporação do Vimeo. A publicação foi verificada por HTTP com os seis IDs e a referência atualizada do script. A conferência visual automatizada no navegador não foi possível na sessão da publicação; não considerar esses testes como uma reprodução real assistida das seis aulas.
