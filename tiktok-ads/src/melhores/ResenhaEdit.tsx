import {Audio, Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../shared/anim';
import {handwriting, montserrat, serif} from '../shared/fonts';
import edl from './edl_resenha.json';
import {DateStamp, dateFor, Grain, LightLeak, PhotoView} from './MelhoresMomentos';

/* ------------------------------------------------------------------ */
/* Beat grid measured from the song (140 BPM, first beat at 0.081 s)   */
/* ------------------------------------------------------------------ */

type Clip = {id: string; beats: number; src?: string; photo?: string; aspect?: string; audio?: boolean; bw?: 'none' | 'full' | 'out' | 'in'; note?: string};

const FPS = 30;
const {period, offset, beatsPerBar} = edl.grid;
const beatFrame = (beat: number) => Math.round((offset + period * beat) * FPS);
const barFrame = (bar: number) => beatFrame(bar * beatsPerBar);

const clips = edl.clips as Clip[];
const timeline = clips.reduce<{clip: Clip; beat: number; from: number; dur: number}[]>((acc, clip) => {
  const prev = acc[acc.length - 1];
  const beat = prev ? prev.beat + prev.clip.beats : 0;
  const from = beat === 0 ? 0 : beatFrame(beat);
  const to = beatFrame(beat + clip.beats);
  acc.push({clip, beat, from, dur: to - from});
  return acc;
}, []);
const END = timeline[timeline.length - 1].from + timeline[timeline.length - 1].dur;
const TAIL = 24;
export const RESENHA_DURATION = END + TAIL;

const sectionAtBeat = (beat: number) => {
  const bar = beat / beatsPerBar;
  return edl.sections.find((s) => bar >= s.fromBar && bar < s.fromBar + s.bars)?.name ?? 'final';
};
const ENERGY = new Set(['subida', 'dia', 'noite', 'fotos', 'mix', 'rapido', 'resenha', 'resenha2', 'hit', 'energia']);
const CALM = new Set(['pausa', 'pausa2', 'final', 'abertura']);
// Frames where a clip plays its own sound and the song steps back.
const AUDIO_RANGES = timeline.filter((t) => t.clip.audio).map((t) => [t.from, t.from + t.dur] as const);
const inAudio = (f: number) => AUDIO_RANGES.some(([a, b]) => f >= a && f < b);
const DROP_FRAMES = edl.drops.map(barFrame);

/* ------------------------------------------------------------------ */
/* One shot                                                            */
/* ------------------------------------------------------------------ */

const Shot: React.FC<{readonly clip: Clip; readonly section: string; readonly index: number}> = ({clip, section, index}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const gray =
    clip.bw === 'full'
      ? 1
      : clip.bw === 'out'
        ? interpolate(frame, [durationInFrames * 0.35, durationInFrames * 0.85], [1, 0], clamp)
        : 0;
  const grade = `grayscale(${gray}) contrast(${1.04 + gray * 0.12}) sepia(${0.12 * (1 - gray)}) saturate(${1 + 0.15 * (1 - gray)})`;

  const energetic = ENERGY.has(section);
  const rapid = clip.beats === 1;
  const punch = energetic ? interpolate(frame, [0, 6], [rapid ? 1.14 : 1.08, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const flash =
    rapid
      ? interpolate(frame, [0, 4], [0.75, 0], clamp)
      : section === 'subida'
        ? interpolate(frame, [0, 5], [0.25 + index * 0.08, 0], clamp)
        : 0;
  const dip =
    CALM.has(section)
      ? Math.max(interpolate(frame, [0, 10], [section === 'abertura' ? 1 : 0.8, 0], clamp), interpolate(frame, [durationInFrames - 5, durationInFrames], [0, 0.5], clamp))
      : 0;
  const drift = energetic ? 1 : interpolate(frame, [0, durationInFrames], [1, 1.07]);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{scale: punch * drift, filter: grade}}>
        {clip.src ? (
          <Video src={staticFile(`melhores/${edl.clipsDir}/${clip.id}.mp4`)} muted objectFit="cover" style={{width: '100%', height: '100%'}} />
        ) : (
          <PhotoView file={clip.photo!} aspect={clip.aspect} />
        )}
      </AbsoluteFill>
      {clip.audio ? <Audio name={`Som: ${clip.note ?? clip.id}`} src={staticFile(`melhores/${edl.clipsDir}/${clip.id}.wav`)} volume={(f) => interpolate(f, [0, 3, durationInFrames - 4, durationInFrames], [0, 1, 1, 0], clamp)} /> : null}
      {!rapid ? <DateStamp text={dateFor((clip.src ?? clip.photo)!)} /> : null}
      {flash > 0 ? <AbsoluteFill style={{background: '#fff', opacity: flash}} /> : null}
      {dip > 0 ? <AbsoluteFill style={{background: '#000', opacity: dip}} /> : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Music-driven motion: bar pulse and drop shake/flash                 */
/* ------------------------------------------------------------------ */

const lastAtOrBefore = (list: number[], f: number) => {
  let r = -Infinity;
  for (const x of list) if (x <= f) r = x;
  return r;
};
const TOTAL_BEATS = timeline[timeline.length - 1].beat + timeline[timeline.length - 1].clip.beats;
const BAR_FRAMES = Array.from({length: TOTAL_BEATS / beatsPerBar + 1}, (_, i) => barFrame(i));

const Groove: React.FC<{readonly children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const beat = (frame / FPS - offset) / period;
  const energetic = ENERGY.has(sectionAtBeat(Math.max(0, beat)));
  const sinceBar = frame - lastAtOrBefore(BAR_FRAMES, frame);
  const pulse = energetic && !inAudio(frame) ? 1 + 0.035 * Math.exp(-sinceBar / 3) : 1;
  const sinceDrop = frame - lastAtOrBefore(DROP_FRAMES, frame);
  const shaking = sinceDrop >= 0 && sinceDrop < 10;
  const amp = shaking ? 22 * (1 - sinceDrop / 10) : 0;
  const dx = shaking ? (random(`x${frame}`) - 0.5) * amp : 0;
  const dy = shaking ? (random(`y${frame}`) - 0.5) * amp : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{scale: pulse, translate: `${dx}px ${dy}px`}}>{children}</AbsoluteFill>
      {shaking ? <AbsoluteFill style={{background: '#fff', opacity: interpolate(sinceDrop, [0, 6], [0.85, 0], clamp)}} /> : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Titles                                                              */
/* ------------------------------------------------------------------ */

const IntroTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], clamp);
  const a = interpolate(frame, [10, 40], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
  const b = interpolate(frame, [36, 70], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <div style={{fontFamily: handwriting, fontWeight: 700, fontSize: 120, color: '#ffd9a8', rotate: '-4deg', opacity: a, translate: `0 ${(1 - a) * 30}px`, textShadow: '0 6px 30px rgba(0,0,0,0.7)'}}>
        melhores
      </div>
      <div style={{fontFamily: serif, fontSize: 150, color: '#fff', lineHeight: 0.9, letterSpacing: 2, opacity: b, filter: `blur(${(1 - b) * 12}px)`, textShadow: '0 8px 40px rgba(0,0,0,0.75)'}}>
        MOMENTOS
      </div>
      <div style={{fontFamily: montserrat, fontWeight: 700, fontSize: 34, letterSpacing: 14, color: 'rgba(255,255,255,0.85)', marginTop: 26, opacity: b}}>2025 · 2026</div>
    </AbsoluteFill>
  );
};

const OutroTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const a = interpolate(frame, [20, 45], [0, 1], clamp);
  const b = interpolate(frame, [55, 75], [0, 1], clamp);
  const black = interpolate(frame, [durationInFrames - 34, durationInFrames - 4], [0, 1], clamp);
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

export const ResenhaEdit: React.FC<{readonly withMusic?: boolean}> = ({withMusic = true}) => {
  const {durationInFrames} = useVideoConfig();
  const last = timeline[timeline.length - 1];
  let subidaIndex = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Groove>
        {timeline.map(({clip, beat, from, dur}) => {
          const section = sectionAtBeat(beat);
          const idx = section === 'subida' ? subidaIndex++ : 0;
          return (
            <Sequence key={clip.id} name={`${clip.id} ${clip.note ?? clip.photo ?? ''}`} from={from} durationInFrames={dur}>
              <Shot clip={clip} section={section} index={idx} />
            </Sequence>
          );
        })}
      </Groove>
      <LightLeak />
      <Grain />
      <Sequence name="Título" durationInFrames={barFrame(5)}>
        <IntroTitle />
      </Sequence>
      <Sequence name="Encerramento" from={last.from} durationInFrames={last.dur + TAIL}>
        <OutroTitle />
      </Sequence>
      {withMusic ? (
        <Audio
          name="Resenha do Arrocha"
          src={staticFile(edl.song)}
          volume={(f) => {
            const fade = interpolate(f, [0, 4, durationInFrames - 70, durationInFrames - 4], [0, 1, 1, 0], clamp);
            // duck under the clips that play their own sound, with short ramps on the beat
            const duck = AUDIO_RANGES.reduce((v, [a, b]) => Math.min(v, interpolate(f, [a - 4, a + 2, b - 3, b + 3], [1, 0.18, 0.18, 1], clamp)), 1);
            return fade * duck;
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
