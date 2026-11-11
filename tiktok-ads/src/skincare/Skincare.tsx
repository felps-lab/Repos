import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {skincareVoice} from '../generated/skincare';
import {AdShell, type Theme} from '../shared/AdShell';
import {clamp, ease, enter} from '../shared/anim';
import {montserrat, serif} from '../shared/fonts';
import {Check, Clock, Drop, Leaf, Star} from '../shared/Icons';
import {Chip, CtaButton, Headline, PriceTag} from '../shared/Layout';
import {Dropper, Jar, Tube} from './Products';

const PLUM = '#4a1033';
const ROSE = '#e8467c';

const theme: Theme = {
  bgFrom: '#ffe1ec',
  bgTo: '#f7b7cf',
  blobs: ['#ffffff', '#ffc8a8', '#d7c4ff'],
  accent: '#ff5fa2',
};

const Title: React.FC<{readonly text: string; readonly highlight?: string; readonly top?: number; readonly size?: number}> = ({text, highlight, top = 170, size = 120}) => (
  <Headline text={text} highlight={highlight} highlightColor={ROSE} color={PLUM} fontFamily={serif} top={top} size={size} />
);

const Sparkles: React.FC<{readonly count?: number; readonly area?: [number, number, number, number]}> = ({count = 14, area = [100, 400, 880, 800]}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const tw = Math.abs(Math.sin(frame / 12 + i * 1.7));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: area[0] + random(`sx${i}`) * area[2],
              top: area[1] + random(`sy${i}`) * area[3],
              scale: 0.4 + tw * 0.8,
              opacity: tw,
              rotate: `${frame * 2}deg`,
            }}
          >
            <Star color="#ffffff" size={36} />
          </div>
        );
      })}
    </>
  );
};

const StepBadge: React.FC<{readonly n: number; readonly label: string}> = ({n, label}) => {
  const frame = useCurrentFrame();
  const p = enter(frame, 0, 16);
  return (
    <div
      style={{
        position: 'absolute',
        top: 170,
        left: '50%',
        translate: '-50% 0',
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        scale: interpolate(p, [0, 1], [0.5, 1]),
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
      }}
    >
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: '50%',
          background: PLUM,
          color: '#fff',
          fontFamily: serif,
          fontSize: 96,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 18px 40px rgba(74,16,51,0.35)',
        }}
      >
        {n}
      </div>
      <div style={{fontFamily: serif, fontSize: 104, color: PLUM, whiteSpace: 'nowrap'}}>{label}</div>
    </div>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const ring = interpolate(frame, [20, durationInFrames], [0, 1], clamp);
  const C = 2 * Math.PI * 210;
  return (
    <AbsoluteFill>
      <Title text="3 passos. 3 minutos." highlight="minutos" size={120} />
      <div style={{position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40}}>
        {[1, 2, 3].map((n, i) => {
          const p = enter(frame, 4 + i * 8, 16);
          return (
            <div
              key={n}
              style={{
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: ['#7fd9c7', '#ffb366', '#f48fb1'][i],
                color: '#fff',
                fontFamily: serif,
                fontSize: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scale: p,
                boxShadow: '0 20px 40px rgba(74,16,51,0.25)',
              }}
            >
              {n}
            </div>
          );
        })}
      </div>
      <svg width={480} height={480} viewBox="0 0 480 480" style={{position: 'absolute', left: 300, top: 790}}>
        <circle cx={240} cy={240} r={210} stroke="rgba(255,255,255,0.7)" strokeWidth={28} fill="none" />
        <circle
          cx={240}
          cy={240}
          r={210}
          stroke={ROSE}
          strokeWidth={28}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - ring)}
          transform="rotate(-90 240 240)"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 300,
          top: 790,
          width: 480,
          height: 480,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: PLUM,
          fontFamily: montserrat,
          opacity: ease(frame, 15, 30),
        }}
      >
        <Clock color={PLUM} size={70} />
        <div style={{fontSize: 110, fontWeight: 900, letterSpacing: -4}}>3 MIN</div>
      </div>
    </AbsoluteFill>
  );
};

const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = (d: number) => enter(frame, d, 22);
  return (
    <AbsoluteFill>
      <Title text="Kit Pura Pele" highlight="Pura Pele" size={124} />
      <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', fontFamily: montserrat, fontWeight: 800, fontSize: 42, letterSpacing: 6, color: PLUM, opacity: ease(frame, 12, 26)}}>
        ROTINA COMPLETA
      </div>
      <Sparkles />
      {/* products rising from the box */}
      <div style={{position: 'absolute', left: 150, top: 560, translate: `0 ${interpolate(rise(10), [0, 1], [380, 0])}px`}}>
        <Tube scale={0.95} />
      </div>
      <div style={{position: 'absolute', left: 430, top: 500, translate: `0 ${interpolate(rise(18), [0, 1], [440, 0])}px`}}>
        <Dropper scale={1} />
      </div>
      <div style={{position: 'absolute', left: 680, top: 760, translate: `0 ${interpolate(rise(26), [0, 1], [400, 0])}px`}}>
        <Jar scale={0.85} />
      </div>
      {/* box front */}
      <div
        style={{
          position: 'absolute',
          left: 100,
          right: 100,
          top: 960,
          height: 260,
          borderRadius: 30,
          background: 'linear-gradient(160deg,#ffffff,#ffe9f1)',
          boxShadow: '0 30px 70px rgba(74,16,51,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: serif,
          fontSize: 92,
          color: PLUM,
          scale: interpolate(enter(frame, 0, 18), [0, 1], [0.6, 1]),
        }}
      >
        Pura Pele
      </div>
    </AbsoluteFill>
  );
};

const Bubbles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(16).fill(0).map((_, i) => {
        const speed = 0.6 + random(`bs${i}`) * 0.8;
        const y = (1150 - ((frame * 6 * speed + random(`by${i}`) * 700) % 800));
        const size = 30 + random(`bz${i}`) * 70;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 120 + random(`bx${i}`) * 840 + Math.sin(frame / 10 + i) * 20,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(180,240,230,0.35) 60%, rgba(255,255,255,0.1))',
              border: '2px solid rgba(255,255,255,0.8)',
            }}
          />
        );
      })}
    </>
  );
};

const Step1: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill>
      <StepBadge n={1} label="Limpeza" />
      <Bubbles />
      <div style={{position: 'absolute', left: 700, top: 420, rotate: `${Math.sin(frame / 15) * 5}deg`, scale: enter(frame, 0, 18)}}>
        <Tube scale={1.15} />
      </div>
      <Chip label="Tira a oleosidade" icon={<Drop color="#fff" size={40} />} delay={Math.round(durationInFrames * 0.3)} top={620} side="left" bg="#ffffff" color="#0f5c50" />
      <Chip label="Sem ressecar" icon={<Check color="#fff" />} delay={Math.round(durationInFrames * 0.6)} top={800} side="left" bg="#0f5c50" color="#7fd9c7" />
    </AbsoluteFill>
  );
};

const Step2: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const lift = interpolate(frame, [10, 30], [0, 70], clamp);
  return (
    <AbsoluteFill>
      <StepBadge n={2} label="Vitamina C" />
      <AbsoluteFill style={{background: `radial-gradient(circle at 540px 760px, rgba(255,180,90,${0.55 * ease(frame, 0, 30)}), transparent 45%)`}} />
      <div style={{position: 'absolute', left: 430, top: 430, scale: enter(frame, 0, 18)}}>
        <Dropper scale={1.1} lift={lift} />
      </div>
      {[0, 1, 2].map((i) => {
        const t = ((frame - 30 - i * 15 + 300) % 45) / 45;
        return frame > 30 + i * 15 ? (
          <div key={i} style={{position: 'absolute', left: 523, top: interpolate(t, [0, 1], [430, 1000]), opacity: interpolate(t, [0, 0.8, 1], [1, 1, 0])}}>
            <Drop color="#ff9a2e" size={46} />
          </div>
        ) : null;
      })}
      <Chip label="Uniforme" icon={<Check color="#fff" />} delay={Math.round(durationInFrames * 0.45)} top={1080} side="left" bg="#ffffff" color="#d9640c" />
      <Chip label="Iluminada" icon={<Star color="#fff" size={40} />} delay={Math.round(durationInFrames * 0.65)} top={1080} side="right" bg="#ffffff" color="#d9640c" />
    </AbsoluteFill>
  );
};

const Step3: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const lid = ease(frame, 15, 35);
  const meter = interpolate(frame, [30, durationInFrames - 10], [0.2, 1], clamp);
  return (
    <AbsoluteFill>
      <StepBadge n={3} label="Hidratação" />
      <div style={{position: 'absolute', left: 390, top: 580, scale: enter(frame, 0, 18)}}>
        <Jar scale={1.25} lidOpen={lid} />
      </div>
      {new Array(7).fill(0).map((_, i) => {
        const t = ((frame + i * 13) % 70) / 70;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 300 + random(`dx${i}`) * 480,
              top: interpolate(t, [0, 1], [700, 420]),
              opacity: interpolate(t, [0, 0.2, 1], [0, 0.9, 0]) * lid,
            }}
          >
            <Drop color="#7cc6ff" size={40 + random(`ds${i}`) * 20} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 120, right: 120, top: 1110, fontFamily: montserrat, color: PLUM}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 38, fontWeight: 800, marginBottom: 12}}>
          <span>HIDRATAÇÃO</span>
          <span>24H</span>
        </div>
        <div style={{height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.7)', overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${meter * 100}%`, borderRadius: 17, background: 'linear-gradient(90deg,#7cc6ff,#ff5fa2)'}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const badges = [
    {label: 'Vegano', icon: <Leaf color="#2f9e44" size={44} />},
    {label: 'Dermatologicamente testado', icon: <Check color="#2f9e44" size={44} />},
  ];
  return (
    <AbsoluteFill>
      <Sparkles count={10} area={[80, 300, 900, 600]} />
      <div style={{position: 'absolute', left: 70, top: 200, scale: 0.75, rotate: '-6deg'}}>
        <Tube />
      </div>
      <div style={{position: 'absolute', left: 430, top: 150, scale: 0.8}}>
        <Dropper />
      </div>
      <div style={{position: 'absolute', left: 700, top: 360, scale: 0.75, rotate: '5deg'}}>
        <Jar />
      </div>
      <div style={{position: 'absolute', top: 720, left: 80, right: 80, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center'}}>
        {badges.map((b, i) => {
          const p = enter(frame, 6 + i * 10, 14);
          return (
            <div
              key={b.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 34px',
                borderRadius: 999,
                background: '#fff',
                fontFamily: montserrat,
                fontWeight: 800,
                fontSize: 40,
                color: PLUM,
                scale: p,
                boxShadow: '0 12px 30px rgba(74,16,51,0.15)',
              }}
            >
              {b.icon}
              {b.label}
            </div>
          );
        })}
      </div>
      <PriceTag oldPrice="R$ 219,90" price="R$ 149,90" note="KIT COMPLETO" delay={30} top={950} accent={ROSE} ink={PLUM} />
      <CtaButton label="GARANTA O SEU" bg={PLUM} color="#fff" delay={50} top={1520} />
    </AbsoluteFill>
  );
};

export const Skincare: React.FC = () => (
  <AdShell
    folder="skincare"
    voice={skincareVoice}
    theme={theme}
    scenes={{hook: Hook, reveal: Reveal, step1: Step1, step2: Step2, step3: Step3, cta: Cta}}
  />
);
