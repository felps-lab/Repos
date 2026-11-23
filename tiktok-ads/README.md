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

---

# Retrospectiva 2026: modelo de vídeo de memórias

Composição `Retrospectiva2026`: vídeo vertical 9:16, cerca de 46 s, com clima nostálgico (grão de filme, luzes quentes, polaroids) e uma trilha original de despedida (piano, cordas e caixinha de música).

**Estrutura:** abertura "2026" → 12 memórias (uma por mês, 3,6 s cada, em polaroid com zoom lento) → pilha de fotos → "Obrigado, 2026." / "que venha 2027" → fade para preto.

## Como colocar suas lembranças

1. Copie suas fotos (jpg/png/webp) ou vídeos curtos (mp4/mov/webm) para `public/retrospectiva/memorias/`.
2. Rode `npm run dev` e abra a composição **Retrospectiva2026**. Na barra lateral, edite cada memória:
   - `arquivo`: por exemplo `retrospectiva/memorias/janeiro.jpg` (vazio mostra "Sua foto aqui")
   - `mes`: nome que aparece no topo
   - `legenda`: frase escrita à mão na polaroid
   - Dá para mudar também `ano`, `subtitulo`, `despedida` e `recado`.
   (Ou edite direto o `defaultProps` em `src/Root.tsx`.)
3. Renderize: `npx remotion render Retrospectiva2026 out/retrospectiva.mp4 --crf=18`

Se mudar a quantidade de memórias, a duração se ajusta sozinha. Para o acorde final da música cair junto com a despedida, regenere a trilha com a nova duração:
`python scripts/music_farewell.py <segundos>`. A duração é `11,2 + n × 2,93` segundos para `n` memórias (12 memórias = 46,4 s; a trilha padrão tem 47,5 s).

Fotos verticais (4:5 ou 9:16) ficam melhores. Vídeos tocam sem som, por baixo da trilha.
