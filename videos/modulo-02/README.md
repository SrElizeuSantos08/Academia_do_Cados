# Aula 02 — O anexo veio de brinde?

Vídeo Remotion com simulação de tela do Outlook em modo escuro, baseado na apresentação da aula 01. Usa mensagens fictícias, arquivo ZIP, cursor animado, zoom, alertas e verificação por contato conhecido. Não acessa contas de e-mail nem executa arquivos.

## Narração e legendas

- Fonte: `public/narracao-original.mp3`, cópia do áudio ElevenLabs fornecido pelo usuário.
- Os primeiros 2 segundos, com a instrução falada “Descontraído e curioso”, são cortados por uma `Sequence` comum às cenas, ao áudio e às legendas.
- Duração final: 4226 quadros a 30 fps, aproximadamente 2 min 21 s.
- Saída: 1280 × 720, H.264, áudio AAC e legendas incorporadas à imagem.
- Transcrição local em português com Whisper `small`, pelo pacote oficial `@remotion/whisper-webgpu`.
- `public/captions-original.json` mantém os tempos do áudio de origem; `public/aula-02.vtt` usa os tempos após o corte.
- O componente Basic Captions vem da documentação oficial do Remotion. A única adaptação de API é `Interactive.withSchema` com `wrapInSequence`, compatível com a versão 4.0.535 instalada.

## Edição e exportação

Nesta pasta:

```powershell
pnpm install --frozen-lockfile
pnpm run studio
pnpm run render
```

Abra a composição `Aula02Outlook`. A composição anterior `Modulo02` foi preservada. Os tempos de `src/outlook-timeline.jsx` são relativos à narração original, antes do corte.

`prepare-captions.mjs` recria a composição narrada a partir de `out/captions-original.json`. Para transcrever novamente, gere `out/narracao.wav` com o FFmpeg do Remotion (mono PCM, 16 kHz) e execute `node transcribe.mjs`. O modelo é baixado e guardado em `out/models/`; o áudio é processado localmente. `out/` contém arquivos temporários e está ignorado pelo Git.

O arquivo exportado em `out/modulo-02-aula-01.mp4` é copiado para `../../public/assets/videos/modulo-02-aula-01.mp4` após validação. O site o usa no módulo `pilot-m2`, aula `pilot-l2`, quando não existe outro vídeo cadastrado pelo painel. A demonstração pública também apresenta esse vídeo ao selecionar o módulo 02.

O projeto tem dependências próprias. Os arquivos de dependências e configuração do site principal não foram modificados.
