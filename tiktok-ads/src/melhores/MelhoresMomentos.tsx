import {Audio, Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../shared/anim';
import {handwriting, montserrat, serif} from '../shared/fonts';
import dates from './dates.json';
import edl from './edl.json';

/* ------------------------------------------------------------------ */
/* Timeline from the EDL: 90 BPM at 30 fps = 20 frames per beat        */
/* ------------------------------------------------------------------ */

type Clip = {
  id: string;
  beats: number;
  src?: string;
  photo?: string;
  bw?: 'none' | 'full' | 'out' | 'in';
  note?: string;
};

export const FPS = 30;
const BEAT = (60 / edl.bpm) * FPS; // 20 frames
const TAIL = 30;

const clips = edl.clips as Clip[];
const timeline = clips.reduce<{clip: Clip; from: number; dur: number}[]>((acc, clip) => {
  const prev = acc[acc.length - 1];
  const from = prev ? prev.from + prev.dur : 0;
  acc.push({clip, from, dur: clip.beats * BEAT});
  return acc;
}, []);
const END = timeline[timeline.length - 1].from + timeline[timeline.length - 1].dur;
export const MELHORES_DURATION = END + TAIL;

const sectionOf = (frame: number) => {
  const bar = frame / (BEAT * 4);
  return edl.sections.find((s) => bar >= s.fromBar && bar < s.fromBar + s.bars)?.name ?? 'final';
};

export const dateFor = (file: string) => {
  const key = file.split('.')[0];
  const d = (dates as Record<string, string>)[key];
  return d ? d.split('/').join(' ') : '';
};

/* ------------------------------------------------------------------ */
/* Atmosphere                                                          */
/* ------------------------------------------------------------------ */

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 10;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width="100%" height="100%" style={{position: 'absolute', opacity: 0.14, mixBlendMode: 'overlay'}}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

export const LightLeak: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none', opacity: 0.55}}>
      <div
        style={{
          position: 'absolute',
          width: 1100,
          height: 1100,
          borderRadius: '50%',
          left: -500 + Math.sin(frame / 70) * 260,
          top: 200 + Math.cos(frame / 90) * 400,
          background: 'radial-gradient(circle, rgba(255,140,60,0.55), transparent 65%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          right: -420 + Math.cos(frame / 60) * 200,
          top: 1100 + Math.sin(frame / 80) * 300,
          background: 'radial-gradient(circle, rgba(255,80,110,0.35), transparent 65%)',
          filter: 'blur(50px)',
        }}
      />
    </AbsoluteFill>
  );
};

export const DateStamp: React.FC<{readonly text: string}> = ({text}) => (
  <div
    style={{
      position: 'absolute',
      left: 70,
      bottom: 330,
      fontFamily: '"DejaVu Sans Mono", "Courier New", monospace',
      fontWeight: 700,
      fontSize: 46,
      letterSpacing: 4,
      color: '#ff9a3c',
      textShadow: '0 0 10px rgba(255,120,30,0.9), 0 0 2px rgba(255,200,120,1)',
      opacity: 0.92,
    }}
  >
    {text}
  </div>
);

/* ------------------------------------------------------------------ */
/* One clip                                                            */
/* ------------------------------------------------------------------ */

const ClipView: React.FC<{readonly clip: Clip; readonly section: string}> = ({clip, section}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // Black & white: full, fade out of B&W (back to color), or fade into B&W.
  const gray =
    clip.bw === 'full'
      ? 1
      : clip.bw === 'out'
        ? interpolate(frame, [durationInFrames * 0.35, durationInFrames * 0.85], [1, 0], clamp)
        : clip.bw === 'in'
          ? interpolate(frame, [0, durationInFrames * 0.6], [0, 1], clamp)
          : 0;
  const grade = `grayscale(${gray}) contrast(${1 + gray * 0.12}) sepia(${0.14 * (1 - gray)}) saturate(${1 + 0.1 * (1 - gray)})`;

  // Cut style per section: beat "punch" by day, flash at night, soft dip in the slow part.
  const punch = section === 'dia' || section === 'noite' ? interpolate(frame, [0, 7], [1.07, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const flash = section === 'noite' ? interpolate(frame, [0, 5], [0.6, 0], clamp) : 0;
  const dip =
    section === 'saudade' || section === 'final'
      ? Math.max(interpolate(frame, [0, 10], [1, 0], clamp), interpolate(frame, [durationInFrames - 6, durationInFrames], [0, 0.6], clamp))
      : 0;
  const drift = section === 'saudade' || section === 'final' || section === 'abertura' ? interpolate(frame, [0, durationInFrames], [1.0, 1.06]) : 1;

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{scale: punch * drift, filter: grade}}>
        {clip.src ? (
          <Video src={staticFile(`melhores/clips/${clip.id}.mp4`)} muted objectFit="cover" style={{width: '100%', height: '100%'}} />
        ) : (
          <PhotoView file={clip.photo!} />
        )}
      </AbsoluteFill>
      {clip.src || clip.photo ? <DateStamp text={dateFor((clip.src ?? clip.photo)!)} /> : null}
      {flash > 0 ? <AbsoluteFill style={{background: '#fff', opacity: flash}} /> : null}
      {dip > 0 ? <AbsoluteFill style={{background: '#000', opacity: dip}} /> : null}
    </AbsoluteFill>
  );
};

export const PhotoView: React.FC<{readonly file: string; readonly aspect?: string}> = ({file, aspect = '4 / 3'}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const tilt = (random(file) - 0.5) * 8;
  const p = interpolate(frame, [0, 10], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{scale: 1.2}}>
        <Img src={staticFile(`melhores/${file}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(45px) brightness(0.5)'}} />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: aspect === '4 / 3' ? 470 : 230,
          padding: '26px 26px 120px',
          background: '#fbf7ee',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          rotate: `${interpolate(p, [0, 1], [tilt * 3, tilt])}deg`,
          scale: interpolate(p, [0, 1], [1.25, 1]),
          opacity: interpolate(frame, [0, 3], [0, 1], clamp),
        }}
      >
        <div style={{width: '100%', aspectRatio: aspect, overflow: 'hidden', maxHeight: 1100}}>
          <Img
            src={staticFile(`melhores/${file}`)}
            style={{width: '100%', height: '100%', objectFit: 'cover', scale: interpolate(frame, [0, durationInFrames], [1, 1.08])}}
          />
        </div>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(frame, [0, 4], [0.7, 0], clamp)}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Titles                                                              */
/* ------------------------------------------------------------------ */

const IntroTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [120, 155], [1, 0], clamp);
  const a = interpolate(frame, [8, 35], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
  const b = interpolate(frame, [26, 55], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <div style={{fontFamily: handwriting, fontWeight: 700, fontSize: 120, color: '#ffd9a8', rotate: '-4deg', opacity: a, translate: `0 ${(1 - a) * 30}px`, textShadow: '0 6px 30px rgba(0,0,0,0.7)'}}>
        melhores
      </div>
      <div
        style={{
          fontFamily: serif,
          fontSize: 150,
          color: '#fff',
          lineHeight: 0.9,
          letterSpacing: 2,
          opacity: b,
          filter: `blur(${(1 - b) * 12}px)`,
          textShadow: '0 8px 40px rgba(0,0,0,0.75)',
        }}
      >
        MOMENTOS
      </div>
      <div style={{fontFamily: montserrat, fontWeight: 700, fontSize: 34, letterSpacing: 14, color: 'rgba(255,255,255,0.85)', marginTop: 26, opacity: b}}>
        2025 · 2026
      </div>
    </AbsoluteFill>
  );
};

const OutroTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const a = interpolate(frame, [30, 60], [0, 1], clamp);
  const b = interpolate(frame, [75, 100], [0, 1], clamp);
  const black = interpolate(frame, [durationInFrames - 40, durationInFrames - 8], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${0.3 * a})`}}>
        <div style={{fontFamily: handwriting, fontWeight: 700, fontSize: 104, color: '#fff', textAlign: 'center', lineHeight: 1.05, padding: '0 90px', opacity: a, rotate: '-3deg', textShadow: '0 6px 30px rgba(0,0,0,0.8)'}}>
          obrigado por cada momento
        </div>
        <div style={{fontFamily: montserrat, fontWeight: 700, fontSize: 34, letterSpacing: 10, color: '#ffd9a8', marginTop: 30, opacity: b}}>ツFELPS</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: black}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */

export const MelhoresMomentos: React.FC = () => {
  const {durationInFrames} = useVideoConfig();
  const last = timeline[timeline.length - 1];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {timeline.map(({clip, from, dur}) => (
        <Sequence key={clip.id} name={`${clip.id} ${clip.note ?? clip.photo ?? ''}`} from={from} durationInFrames={dur}>
          <ClipView clip={clip} section={sectionOf(from)} />
        </Sequence>
      ))}
      <LightLeak />
      <Grain />
      <Sequence name="Título" durationInFrames={160}>
        <IntroTitle />
      </Sequence>
      <Sequence name="Encerramento" from={last.from} durationInFrames={last.dur + TAIL}>
        <OutroTitle />
      </Sequence>
      <Audio
        name="Trilha"
        src={staticFile('trilhas/melhores-momentos.wav')}
        volume={(f) => interpolate(f, [0, 10, durationInFrames - 50, durationInFrames], [0, 0.95, 0.95, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
