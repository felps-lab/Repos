# Vídeo de teste (Remotion)

Duas versões, as duas com três cenas: abertura com a lua e o título, três cartões animados e encerramento.

| Composição      | Formato             | Duração | Som     |
| --------------- | ------------------- | ------- | ------- |
| `VideoTeste`    | 16:9 (1920×1080)    | 6 s     | sem som |
| `VideoVertical` | 9:16 (1080×1920)    | 8 s     | música  |

```bash
npm install
npm run studio           # abre o editor visual no navegador
npm run render           # gera out/video-teste.mp4
npm run render:vertical  # gera out/video-vertical.mp4
npm run musica           # gera de novo public/musica.wav
```

O título e o subtítulo ficam em `defaultProps`, no arquivo `src/Root.tsx`.
As cenas estão em `src/VideoTeste.tsx` e se ajustam sozinhas ao formato.

A música (`public/musica.wav`) é sintetizada por `scripts/gerar-musica.mjs`,
sem samples externos: 120 BPM, acordes Am–F–C–G, com pad, arpejo, baixo e batida.
Para usar outra música, troque o arquivo em `public/` e o nome em `staticFile(...)`.
