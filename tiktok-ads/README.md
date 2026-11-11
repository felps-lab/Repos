# TikTok Ads: 3 vídeos de produto

Três anúncios verticais (1080×1920, 30 fps, cerca de 33 s cada), feitos com [Remotion](https://www.remotion.dev).
Todos têm narração, legendas palavra por palavra, trilha sonora e efeitos sonoros.

| Composição | Produto | Voz | Trilha |
|---|---|---|---|
| `Frigideira` | Frigideira antiaderente **Vitta Chef** | Feminina (pf_dora) | Pop funk, 116 BPM |
| `Inversor` | Inversor solar híbrido **VoltSol H5** | Masculina (pm_alex) | Eletrônica, 124 BPM |
| `Skincare` | Kit de limpeza de pele **Pura Pele** | Feminina (pf_dora) | Lo-fi suave, 96 BPM |

As marcas e os preços são fictícios, criados para demonstração.

Os vídeos finais ficam em [`videos/`](videos/).

## Estrutura

```
scripts/
  scripts.json    # roteiro de cada vídeo, cena por cena (texto da legenda + grafia para a voz)
  voiceover.py    # gera a narração (Kokoro TTS, roda local) e os tempos das legendas
  music.py        # sintetiza as trilhas originais e os efeitos (whoosh)
src/
  shared/         # AdShell (estrutura comum), Captions estilo TikTok, layout, ícones, fontes
  frigideira/     # cenas e ilustração da frigideira
  inversor/       # cenas e ilustração do inversor
  skincare/       # cenas e ilustração dos produtos de skincare
  generated/      # tempos das cenas e das palavras (gerados pelo voiceover.py)
public/
  <video>/voice.wav, music.wav, sfx/, fonts/
```

## Como editar

1. **Mudar o texto:** edite `scripts/scripts.json`. O campo `tts` serve para ajustar a pronúncia; a legenda usa `text`.
2. **Regenerar a narração e a trilha:**
   ```bash
   pip install kokoro-onnx soundfile scipy
   # modelo: kokoro-v1.0.onnx e voices-v1.0.bin (github.com/thewh1teagle/kokoro-onnx/releases)
   python scripts/voiceover.py kokoro-v1.0.onnx voices-v1.0.bin
   python scripts/music.py
   ```
   A duração de cada cena acompanha a narração automaticamente.
3. **Pré-visualizar:** `npm run dev` abre o Remotion Studio.
4. **Renderizar:**
   ```bash
   npx remotion render Frigideira out/Frigideira.mp4 --crf=18
   ```
