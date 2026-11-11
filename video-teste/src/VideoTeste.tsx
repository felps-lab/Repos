import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Props = {titulo: string; subtitulo: string};

const fonte = 'Inter, "Helvetica Neue", Arial, sans-serif';

// Fundo em gradiente que gira lentamente durante todo o vídeo
const Fundo: React.FC = () => {
  const frame = useCurrentFrame();
  const angulo = interpolate(frame, [0, 180], [120, 240]);
  return (
    <AbsoluteFill
      style={{background: `linear-gradient(${angulo}deg, #0f172a, #312e81 55%, #7c3aed)`}}
    />
  );
};

// Estrelas piscando no fundo
const Estrelas: React.FC = () => {
  const frame = useCurrentFrame();
  const estrelas = Array.from({length: 60}, (_, i) => ({
    x: (i * 97) % 1920,
    y: (i * 53 + (i % 7) * 131) % 1080,
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
const Abertura: React.FC<Props> = ({titulo, subtitulo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lua = spring({frame, fps, config: {damping: 14}});
  const texto = spring({frame: frame - 15, fps, config: {damping: 200}});
  const sub = interpolate(frame, [35, 55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily: fonte}}>
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: '#fde68a',
          boxShadow: '0 0 120px 30px rgba(253,230,138,0.45), inset -40px -20px 0 0 #fbbf24',
          transform: `scale(${lua}) translateY(${(1 - lua) * 200}px)`,
          marginBottom: 60,
        }}
      />
      <h1
        style={{
          color: 'white',
          fontSize: 140,
          fontWeight: 800,
          margin: 0,
          opacity: texto,
          transform: `translateY(${(1 - texto) * 60}px)`,
        }}
      >
        {titulo}
      </h1>
      <p style={{color: '#c4b5fd', fontSize: 52, margin: '20px 0 0', opacity: sub}}>{subtitulo}</p>
    </AbsoluteFill>
  );
};

// Cena 2: três cartões entrando em sequência
const Cartoes: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const itens = [
    {emoji: '🎬', texto: 'Animações'},
    {emoji: '🎨', texto: 'Cores'},
    {emoji: '⚛️', texto: 'React'},
  ];
  return (
    <AbsoluteFill
      style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 60, fontFamily: fonte}}
    >
      {itens.map((item, i) => {
        const s = spring({frame: frame - i * 8, fps, config: {damping: 12}});
        return (
          <div
            key={item.texto}
            style={{
              width: 380,
              height: 380,
              borderRadius: 40,
              background: 'rgba(255,255,255,0.12)',
              border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${s}) rotate(${(1 - s) * -20}deg)`,
              color: 'white',
            }}
          >
            <div style={{fontSize: 140}}>{item.emoji}</div>
            <div style={{fontSize: 56, fontWeight: 700, marginTop: 20}}>{item.texto}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Cena 3: encerramento com fade
const Encerramento: React.FC = () => {
  const frame = useCurrentFrame();
  const entrada = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});
  const saida = interpolate(frame, [40, 60], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill
      style={{alignItems: 'center', justifyContent: 'center', fontFamily: fonte, opacity: entrada * saida}}
    >
      <h2 style={{color: 'white', fontSize: 110, fontWeight: 800, margin: 0}}>Teste concluído ✨</h2>
      <p style={{color: '#c4b5fd', fontSize: 44, marginTop: 24}}>Feito com Remotion + Claude</p>
    </AbsoluteFill>
  );
};

export const VideoTeste: React.FC<Props> = (props) => {
  return (
    <AbsoluteFill>
      <Fundo />
      <Estrelas />
      <Sequence durationInFrames={70}>
        <Abertura {...props} />
      </Sequence>
      <Sequence from={70} durationInFrames={50}>
        <Cartoes />
      </Sequence>
      <Sequence from={120} durationInFrames={60}>
        <Encerramento />
      </Sequence>
    </AbsoluteFill>
  );
};
