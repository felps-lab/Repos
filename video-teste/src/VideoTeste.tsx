import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Props = {titulo: string; subtitulo: string; musica: boolean};

const fonte = 'Inter, "Helvetica Neue", Arial, sans-serif';

// true quando o vídeo é mais alto do que largo (9:16)
const useVertical = () => {
  const {width, height} = useVideoConfig();
  return height > width;
};

// Fundo em gradiente que gira lentamente durante todo o vídeo
const Fundo: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const angulo = interpolate(frame, [0, durationInFrames], [120, 240]);
  return (
    <AbsoluteFill
      style={{background: `linear-gradient(${angulo}deg, #0f172a, #312e81 55%, #7c3aed)`}}
    />
  );
};

// Estrelas piscando no fundo, espalhadas pelo quadro inteiro
const Estrelas: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const estrelas = Array.from({length: 80}, (_, i) => ({
    x: (i * 97) % width,
    y: (i * 53 + (i % 7) * 131 + Math.floor((i * 97) / width) * 211) % height,
    r: 1.5 + (i % 3),
    fase: i * 0.7,
  }));
  return (
    <AbsoluteFill>
      {estrelas.map((e, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: e.x,
            top: e.y,
            width: e.r * 2,
            height: e.r * 2,
            borderRadius: '50%',
            background: 'white',
            opacity: 0.35 + 0.65 * Math.abs(Math.sin(frame / 12 + e.fase)),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Cena 1: lua surgindo + título
const Abertura: React.FC<Omit<Props, 'musica'>> = ({titulo, subtitulo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const vertical = useVertical();
  const lua = spring({frame, fps, config: {damping: 14}});
  const texto = spring({frame: frame - 15, fps, config: {damping: 200}});
  const sub = interpolate(frame, [35, 55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tamanhoLua = vertical ? 320 : 220;
  return (
    <AbsoluteFill
      style={{alignItems: 'center', justifyContent: 'center', fontFamily: fonte, padding: 60, textAlign: 'center'}}
    >
      <div
        style={{
          width: tamanhoLua,
          height: tamanhoLua,
          borderRadius: '50%',
          background: '#fde68a',
          boxShadow: `0 0 120px 30px rgba(253,230,138,0.45), inset -${tamanhoLua / 5.5}px -${tamanhoLua / 11}px 0 0 #fbbf24`,
          transform: `scale(${lua}) translateY(${(1 - lua) * 200}px)`,
          marginBottom: vertical ? 90 : 60,
        }}
      />
      <h1
        style={{
          color: 'white',
          fontSize: vertical ? 150 : 140,
          fontWeight: 800,
          margin: 0,
          lineHeight: 1.05,
          opacity: texto,
          transform: `translateY(${(1 - texto) * 60}px)`,
        }}
      >
        {titulo}
      </h1>
      <p style={{color: '#c4b5fd', fontSize: vertical ? 56 : 52, margin: '28px 0 0', opacity: sub}}>
        {subtitulo}
      </p>
    </AbsoluteFill>
  );
};

// Cena 2: três cartões entrando em sequência (em linha no 16:9, em coluna no 9:16)
const Cartoes: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const vertical = useVertical();
  const itens = [
    {emoji: '🎬', texto: 'Animações'},
    {emoji: '🎨', texto: 'Cores'},
    {emoji: '⚛️', texto: 'React'},
  ];
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: vertical ? 'column' : 'row',
        gap: vertical ? 50 : 60,
        fontFamily: fonte,
      }}
    >
      {itens.map((item, i) => {
        const s = spring({frame: frame - i * 8, fps, config: {damping: 12}});
        return (
          <div
            key={item.texto}
            style={{
              width: vertical ? 760 : 380,
              height: vertical ? 340 : 380,
              borderRadius: 40,
              background: 'rgba(255,255,255,0.12)',
              border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex',
              flexDirection: vertical ? 'row' : 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: vertical ? 50 : 20,
              transform: `scale(${s}) rotate(${(1 - s) * -20}deg)`,
              color: 'white',
            }}
          >
            <div style={{fontSize: 140}}>{item.emoji}</div>
            <div style={{fontSize: vertical ? 72 : 56, fontWeight: 700}}>{item.texto}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Cena 3: encerramento com fade
const Encerramento: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const vertical = useVertical();
  const entrada = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});
  const saida = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonte,
        textAlign: 'center',
        padding: 60,
        opacity: entrada * saida,
      }}
    >
      <h2 style={{color: 'white', fontSize: 110, fontWeight: 800, margin: 0, lineHeight: 1.1}}>
        Teste {vertical ? <br /> : null}concluído ✨
      </h2>
      <p style={{color: '#c4b5fd', fontSize: vertical ? 52 : 44, marginTop: 28}}>Feito com Remotion + Claude</p>
    </AbsoluteFill>
  );
};

export const VideoTeste: React.FC<Props> = ({musica, ...textos}) => {
  const {durationInFrames} = useVideoConfig();
  // Divide o vídeo nas três cenas, nas mesmas proporções em qualquer duração
  const fimAbertura = Math.round(durationInFrames * 0.39);
  const fimCartoes = Math.round(durationInFrames * 0.67);
  return (
    <AbsoluteFill>
      {musica ? <Audio src={staticFile('musica.wav')} /> : null}
      <Fundo />
      <Estrelas />
      <Sequence durationInFrames={fimAbertura}>
        <Abertura {...textos} />
      </Sequence>
      <Sequence from={fimAbertura} durationInFrames={fimCartoes - fimAbertura}>
        <Cartoes />
      </Sequence>
      <Sequence from={fimCartoes}>
        <Encerramento />
      </Sequence>
    </AbsoluteFill>
  );
};
