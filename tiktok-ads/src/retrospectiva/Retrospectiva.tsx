import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type CalculateMetadataFunction,
} from 'remotion';
import {z} from 'zod';
import {clamp} from '../shared/anim';
import {handwriting, montserrat, serif} from '../shared/fonts';

/* ------------------------------------------------------------------ */
/* Editable data (also editable in the Studio sidebar)                 */
/* ------------------------------------------------------------------ */

export const memoriaSchema = z.object({
  /** Path inside public/, e.g. "retrospectiva/memorias/janeiro.jpg" (jpg/png/webp or mp4/mov/webm). Empty = placeholder. */
  arquivo: z.string(),
  mes: z.string(),
  legenda: z.string(),
});

export const retrospectivaSchema = z.object({
  ano: z.string(),
  subtitulo: z.string(),
  memorias: z.array(memoriaSchema),
  despedida: z.string(),
  recado: z.string(),
});

export type RetrospectivaProps = z.infer<typeof retrospectivaSchema>;

/* ------------------------------------------------------------------ */
/* Timing (frames @ 30fps)                                             */
/* ------------------------------------------------------------------ */

export const FPS = 30;
const INTRO = 135; // 4.5s
const MEMORY = 108; // 3.6s each
const OVERLAP = 20; // cross-fade between memories
const OUTRO = 240; // 8s

const memoryStart = (i: number) => INTRO - OVERLAP + i * (MEMORY - OVERLAP);
const outroStart = (n: number) => memoryStart(n) - OVERLAP;

export const calculateRetrospectivaMetadata: CalculateMetadataFunction<RetrospectivaProps> = ({props}) => ({
  durationInFrames: outroStart(props.memorias.length) + OUTRO,
});

const CREAM = '#f6ecd9';
const AMBER = '#ffb26b';
const isVideo = (f: string) => /\.(mp4|mov|webm|m4v)$/i.test(f);

/* ------------------------------------------------------------------ */
/* Atmosphere: warm backdrop, light leaks, film grain, vignette        */
/* ------------------------------------------------------------------ */

const LightLeaks: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
      {[
        {c: 'rgba(255,140,60,0.55)', x: -200, y: 200, s: 0.011},
        {c: 'rgba(255,90,90,0.35)', x: 700, y: 1200, s: 0.008},
        {c: 'rgba(255,210,140,0.4)', x: 400, y: -300, s: 0.013},
      ].map((l, i) => {
        const pulse = 0.55 + 0.45 * Math.sin(frame * l.s * 3 + i * 2);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: l.x + Math.sin(frame * l.s + i) * 220,
              top: l.y + Math.cos(frame * l.s * 0.8 + i) * 260,
              width: 900,
              height: 900,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${l.c} 0%, transparent 65%)`,
              opacity: pulse,
              filter: 'blur(40px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 12;
  const scratch = random(`scr${Math.floor(frame / 9)}`);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width="100%" height="100%" style={{position: 'absolute', opacity: 0.16, mixBlendMode: 'overlay'}}>
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
      </svg>
      {scratch > 0.72 ? (
        <div
          style={{
            position: 'absolute',
            left: `${random(`sx${Math.floor(frame / 9)}`) * 100}%`,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'rgba(255,240,220,0.18)',
          }}
        />
      ) : null}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(10,5,0,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Media (photo / video / placeholder)                                 */
/* ------------------------------------------------------------------ */

const Media: React.FC<{readonly arquivo: string; readonly mes: string; readonly blur?: boolean}> = ({arquivo, mes, blur}) => {
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: blur ? 'blur(40px) brightness(0.45) saturate(1.2) sepia(0.25)' : 'sepia(0.18) saturate(1.08) contrast(1.04)',
  };
  if (!arquivo) {
    return (
      <div
        style={{
          ...style,
          filter: blur ? 'brightness(0.5)' : undefined,
          background: 'linear-gradient(160deg, #d9b98f 0%, #a7745a 55%, #5c3b33 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,248,235,0.92)',
          fontFamily: montserrat,
          textAlign: 'center',
        }}
      >
        {blur ? null : (
          <>
            <svg width={120} height={120} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
              <rect x={3} y={6} width={18} height={14} rx={2.5} />
              <circle cx={12} cy={13} r={3.6} />
              <path d="M8.5 6l1.4-2.2h4.2L15.5 6" />
            </svg>
            <div style={{fontSize: 40, fontWeight: 800, letterSpacing: 4, marginTop: 24}}>SUA FOTO AQUI</div>
            <div style={{fontFamily: handwriting, fontSize: 60, fontWeight: 700, marginTop: 6}}>{mes}</div>
          </>
        )}
      </div>
    );
  }
  if (isVideo(arquivo)) {
    return <Video src={staticFile(arquivo)} muted objectFit="cover" style={style} />;
  }
  return <Img src={staticFile(arquivo)} style={style} />;
};

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

const Intro: React.FC<{readonly ano: string; readonly subtitulo: string}> = ({ano, subtitulo}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - OVERLAP, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <div style={{display: 'flex', gap: 6}}>
        {ano.split('').map((d, i) => {
          const p = interpolate(frame, [10 + i * 8, 40 + i * 8], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
          return (
            <span
              key={i}
              style={{
                fontFamily: serif,
                fontSize: 300,
                color: CREAM,
                lineHeight: 1,
                opacity: p,
                translate: `0 ${interpolate(p, [0, 1], [50, 0])}px`,
                filter: `blur(${interpolate(p, [0, 1], [14, 0])}px)`,
                textShadow: '0 0 60px rgba(255,170,90,0.45)',
              }}
            >
              {d}
            </span>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: handwriting,
          fontWeight: 700,
          fontSize: 92,
          color: AMBER,
          marginTop: 10,
          opacity: interpolate(frame, [55, 80], [0, 1], clamp),
          rotate: '-3deg',
        }}
      >
        {subtitulo}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 260,
          fontFamily: montserrat,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 14,
          color: 'rgba(246,236,217,0.6)',
          opacity: interpolate(frame, [70, 95], [0, 1], clamp),
        }}
      >
        RETROSPECTIVA
      </div>
    </AbsoluteFill>
  );
};

const PHOTO_W = 780;
const PHOTO_H = 960;

const Polaroid: React.FC<{readonly memoria: z.infer<typeof memoriaSchema>; readonly index: number}> = ({memoria, index}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const tilt = index % 2 === 0 ? -2.8 : 2.4;
  const enter = interpolate(frame, [0, 26], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
  // The next memory is drawn on top: its backdrop dissolves in while its polaroid lands over this one.
  const fadeIn = interpolate(frame, [0, OVERLAP], [0, 1], clamp);
  const kb = interpolate(frame, [0, durationInFrames], [1.04, 1.16]);
  const panX = (index % 3 - 1) * 18;

  return (
    <AbsoluteFill>
      {/* blurred copy fills the frame behind */}
      <AbsoluteFill style={{scale: 1.15, opacity: fadeIn}}>
        <Media arquivo={memoria.arquivo} mes={memoria.mes} blur />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          top: 170,
          width: '100%',
          textAlign: 'center',
          opacity: interpolate(frame, [8, 26], [0, 1], clamp),
          translate: `0 ${interpolate(enter, [0, 1], [-20, 0])}px`,
        }}
      >
        <div style={{fontFamily: montserrat, fontWeight: 700, fontSize: 40, letterSpacing: 14, color: 'rgba(246,236,217,0.8)'}}>
          {String(index + 1).padStart(2, '0')} / {memoria.mes.toUpperCase()}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 540 - (PHOTO_W + 60) / 2,
          top: 300,
          width: PHOTO_W + 60,
          padding: '30px 30px 0 30px',
          background: '#fbf7ee',
          borderRadius: 6,
          boxShadow: '0 40px 80px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.3)',
          opacity: interpolate(frame, [0, 6], [0, 1], clamp),
          rotate: `${interpolate(enter, [0, 1], [tilt * 3, tilt]) + Math.sin(frame / 40 + index) * 0.4}deg`,
          translate: `0 ${interpolate(enter, [0, 1], [260, 0])}px`,
          scale: interpolate(enter, [0, 1], [0.92, 1]),
        }}
      >
        <div style={{width: PHOTO_W, height: PHOTO_H, overflow: 'hidden', position: 'relative', background: '#222'}}>
          <div style={{width: '100%', height: '100%', scale: kb, translate: `${interpolate(frame, [0, durationInFrames], [-panX, panX])}px 0`}}>
            <Media arquivo={memoria.arquivo} mes={memoria.mes} />
          </div>
          {/* camera date stamp */}
          <div
            style={{
              position: 'absolute',
              right: 28,
              bottom: 22,
              fontFamily: montserrat,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: 3,
              color: '#ff9a3c',
              textShadow: '0 0 8px rgba(255,120,30,0.9)',
              opacity: 0.9,
            }}
          >
            {`'26 ${String(index + 1).padStart(2, '0')}`}
          </div>
        </div>
        <div
          style={{
            height: 190,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: handwriting,
            fontWeight: 700,
            fontSize: 70,
            lineHeight: 1,
            color: '#3b2a20',
            textAlign: 'center',
            padding: '0 20px',
          }}
        >
          <span style={{opacity: interpolate(frame, [24, 44], [0, 1], clamp)}}>{memoria.legenda}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{readonly memorias: RetrospectivaProps['memorias']; readonly despedida: string; readonly recado: string}> = ({
  memorias,
  despedida,
  recado,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const fadeIn = interpolate(frame, [0, OVERLAP], [0, 1], clamp);
  const toBlack = interpolate(frame, [durationInFrames - 45, durationInFrames - 5], [0, 1], clamp);
  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      {/* pile of mini polaroids */}
      {memorias.map((m, i) => {
        const d = i * 4;
        const p = interpolate(frame, [d, d + 22], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
        const x = 540 + (random(`px${i}`) - 0.5) * 640;
        const y = 760 + (random(`py${i}`) - 0.5) * 760;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 130,
              top: y - 160,
              width: 260,
              padding: '12px 12px 50px 12px',
              background: '#fbf7ee',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              rotate: `${(random(`pr${i}`) - 0.5) * 34}deg`,
              opacity: p * interpolate(frame, [90, 130], [1, 0.2], clamp),
              scale: interpolate(p, [0, 1], [1.6, 1]),
            }}
          >
            <div style={{width: 236, height: 270, overflow: 'hidden'}}>
              <Media arquivo={m.arquivo} mes={m.mes} />
            </div>
          </div>
        );
      })}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          background: `rgba(20,12,6,${interpolate(frame, [90, 130], [0, 0.7], clamp)})`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 118,
            color: CREAM,
            textAlign: 'center',
            lineHeight: 1.05,
            padding: '0 80px',
            opacity: interpolate(frame, [100, 135], [0, 1], clamp),
            filter: `blur(${interpolate(frame, [100, 135], [10, 0], clamp)}px)`,
            textShadow: '0 0 50px rgba(255,170,90,0.4)',
          }}
        >
          {despedida}
        </div>
        <div
          style={{
            fontFamily: handwriting,
            fontWeight: 700,
            fontSize: 96,
            color: AMBER,
            marginTop: 30,
            rotate: '-3deg',
            opacity: interpolate(frame, [140, 170], [0, 1], clamp),
          }}
        >
          {recado}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: toBlack}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */

const FadeToBlack: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return <AbsoluteFill style={{background: '#000', opacity: interpolate(frame, [durationInFrames - 40, durationInFrames - 4], [0, 1], clamp)}} />;
};

export const Retrospectiva: React.FC<RetrospectivaProps> = ({ano, subtitulo, memorias, despedida, recado}) => {
  const {durationInFrames} = useVideoConfig();
  const n = memorias.length;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #3a2618 0%, #160d07 70%)'}}>
      <Sequence name="Abertura" durationInFrames={INTRO}>
        <Intro ano={ano} subtitulo={subtitulo} />
      </Sequence>
      {memorias.map((m, i) => (
        <Sequence key={i} name={`Memória ${i + 1}: ${m.mes}`} from={memoryStart(i)} durationInFrames={MEMORY}>
          <Polaroid memoria={m} index={i} />
        </Sequence>
      ))}
      <Sequence name="Despedida" from={outroStart(n)} durationInFrames={OUTRO}>
        <Outro memorias={memorias} despedida={despedida} recado={recado} />
      </Sequence>
      <LightLeaks />
      <FilmGrain />
      <FadeToBlack />
      <Audio
        name="Trilha de despedida"
        src={staticFile('retrospectiva/music.wav')}
        volume={(f) => interpolate(f, [0, 20, durationInFrames - 60, durationInFrames], [0, 0.9, 0.9, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
