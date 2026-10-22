# Notas da edição aprovada

## Fontes recebidas

| Arquivo | Duração aproximada | Uso |
| --- | --- | --- |
| Gravando 2026-10-21 105341.mp4 | 74,53 s | Gravação da tela |
| colaborador 1.mp3 | 14,84 s | Primeira fala |
| narrador aviso.mp3 | 128,37 s | Alerta e explicação |

Os originais permanecem em `media/`. A trilha de áudio da gravação de tela não participa da exportação.

## Montagem

A fala do colaborador começa no início. O narrador entra em 15,05 s. A montagem usa uma pausa visual de 3,6 s no alerta e alonga o trecho seguinte da gravação para acompanhar a explicação. O último quadro é prolongado para completar a duração do áudio.

As imagens são ajustadas proporcionalmente dentro de uma área de 1280 × 600. A tela final mede 1280 × 720, com uma faixa inferior para as legendas. A fonte das legendas é Arial, tamanho 26.

O roteiro fornecido foi revisado para corrigir digitação e pontuação. A grafia “Academia do Caus” foi mantida conforme o texto recebido. O encerramento “Bom trabalho!” está incluído na legenda fornecida; não foi gerada uma nova fala para acrescentá-lo ao áudio original.

Os tempos das palavras foram obtidos com faster-whisper, modelo base em português, e alinhados ao roteiro. Os resultados intermediários estão incluídos em `transcripts/`; a reprodução da edição não depende dessa ferramenta.

## Verificação

A exportação aprovada teve duração de 144,120 s para vídeo e 144,116 s para áudio. A decodificação completa com FFmpeg terminou sem erros. Foi feita uma conferência visual de um quadro com a legenda na faixa inferior.

O projeto foi renderizado novamente em uma pasta de validação. O MP4 e o SRT reproduzidos tiveram hashes SHA-256 idênticos aos arquivos aprovados.

O manifesto registra hashes dos arquivos do projeto. A preparação para GitHub preserva o MP4 e o SRT aprovados, sem reexportá-los por cima.
