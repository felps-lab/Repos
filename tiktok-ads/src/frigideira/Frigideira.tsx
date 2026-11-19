import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {frigideiraVoice} from '../generated/frigideira';
import {AdShell, type Theme} from '../shared/AdShell';
import {clamp, ease, enter} from '../shared/anim';
import {montserrat} from '../shared/fonts';
import {Check, Clock, Cross, Drop, Flame, Hand, Leaf} from '../shared/Icons';
import {Chip, CtaButton, Headline, PriceTag} from '../shared/Layout';
import {Egg, Pan} from './Pan';

const ORANGE = '#ff7a1a';
const CREAM = '#fff4e6';

const theme: Theme = {
  bgFrom: '#ff9a3d',
  bgTo: '#c2261b',
  blobs: ['#ffd166', '#ff4d6d', '#ffb703'],
  accent: '#ffd23f',
};

/** Places a pan so that its round body is centered at (cx, cy). */
const PanAt: React.FC<{
  readonly cx?: number;
  readonly cy?: number;
  readonly size?: number;
  readonly rotate?: number;
  readonly scale?: number;
  readonly children?: React.ReactNode;
  readonly worn?: boolean;
  readonly heat?: number;
  readonly shine?: number;
}> = ({cx = 540, cy = 760, size = 560, rotate = 40, scale = 1, children, worn, heat, shine}) => (
  <div
    style={{
      position: 'absolute',
      left: cx - size / 2,
      top: cy - size / 2,
      width: size,
      height: size,
      transformOrigin: `${size / 2}px ${size / 2}px`,
      rotate: `${rotate}deg`,
      scale,
    }}
  >
    <Pan size={size} worn={worn} heat={heat} shine={shine} />
    <div style={{position: 'absolute', left: 0, top: 0, width: size, height: size}}>{children}</div>
  </div>
);

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const scrape = Math.sin(frame * 1.3) * 26;
  const x = enter(frame, 30, 12);
  return (
    <AbsoluteFill>
      <Headline text="Ovo grudado de novo?" highlight="grudado" top={190} size={104} />
      <PanAt worn rotate={30} scale={interpolate(enter(frame, 0, 20), [0, 1], [0.6, 1])}>
        <div style={{position: 'absolute', left: 170, top: 180}}>
          <Egg size={220} burnt />
        </div>
      </PanAt>
      {/* spatula scraping */}
      <div
        style={{
          position: 'absolute',
          left: 520 + scrape,
          top: 520,
          width: 70,
          height: 420,
          rotate: '-28deg',
          borderRadius: 20,
          background: 'linear-gradient(#e8e8e8, #8b8b8b)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{position: 'absolute', top: 260, left: 18, width: 34, height: 170, borderRadius: 14, background: '#222'}} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 700,
          top: 470,
          width: 170,
          height: 170,
          borderRadius: '50%',
          background: '#e0161b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          scale: interpolate(x, [0, 1], [0, 1]),
          rotate: `${interpolate(x, [0, 1], [-90, 0])}deg`,
          boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
        }}
      >
        <Cross size={100} />
      </div>
    </AbsoluteFill>
  );
};

const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const spin = ease(frame, 0, 30);
  const layers = ['#2d2f36', '#4a4d57', '#6b6f7b', '#d9772f', '#ffd1a8'];
  return (
    <AbsoluteFill>
      <Headline text="Vitta Chef" top={170} size={130} color="#fff" />
      <div
        style={{
          position: 'absolute',
          top: 320,
          width: '100%',
          textAlign: 'center',
          fontFamily: montserrat,
          fontWeight: 800,
          fontSize: 46,
          letterSpacing: 6,
          color: CREAM,
          opacity: ease(frame, 10, 25),
        }}
      >
        ANTIADERENTE CERÂMICA
      </div>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 540px 780px, rgba(255,230,160,${0.7 * spin}) 0%, transparent 45%)`,
        }}
      />
      <PanAt rotate={interpolate(spin, [0, 1], [-200, 40])} scale={interpolate(spin, [0, 1], [0.3, 1])} shine={frame * 2} cy={790} />
      {/* five-layer stack */}
      <div style={{position: 'absolute', right: 70, top: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6}}>
        {layers.map((c, i) => {
          const p = enter(frame, 40 + i * 5, 12);
          return (
            <div
              key={c}
              style={{
                width: 210,
                height: 22,
                borderRadius: 8,
                background: c,
                translate: `${interpolate(p, [0, 1], [300, 0])}px 0`,
                boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
              }}
            />
          );
        })}
        <div style={{fontFamily: montserrat, fontWeight: 900, fontSize: 40, color: '#fff', marginTop: 8, opacity: ease(frame, 65, 80)}}>
          5 CAMADAS
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Slide: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const tilt = Math.sin(frame / 14) * 8;
  const travel = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const eggX = 150 + Math.sin(travel * Math.PI * 2.2) * 120;
  const eggY = 140 + Math.cos(travel * Math.PI * 1.6) * 90;
  const third = durationInFrames / 3.4;
  return (
    <AbsoluteFill>
      <Headline text="Desliza sozinho" highlight="sozinho" top={180} size={110} />
      <PanAt rotate={40 + tilt} cy={780} shine={frame}>
        <div style={{position: 'absolute', left: eggX, top: eggY, rotate: `${frame * 3}deg`}}>
          <Egg size={230} />
        </div>
      </PanAt>
      <Chip label="Sem óleo" icon={<Drop color="#fff" />} delay={Math.round(third * 0.6)} top={1040} side="left" bg="#fff" color={ORANGE} />
      <Chip label="Sem esforço" icon={<Hand color="#fff" />} delay={Math.round(third * 1.3)} top={1040} side="right" bg="#fff" color={ORANGE} />
      <Chip label="Sem sujeira" icon={<Check color="#fff" />} delay={Math.round(third * 2)} top={440} side="left" bg="#1d1d1f" color={ORANGE} />
    </AbsoluteFill>
  );
};

const Heat: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const heat = interpolate(frame, [0, 40], [0, 1], clamp);
  const stoves = ['Gás', 'Elétrico', 'Indução', 'Vitro'];
  return (
    <AbsoluteFill>
      <Headline text="Calor por igual" highlight="igual" top={180} size={110} />
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 20) % 60) / 60;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 540 - 300,
              top: 720 - 300,
              width: 600,
              height: 600,
              borderRadius: '50%',
              border: '10px solid rgba(255,220,120,0.8)',
              scale: interpolate(t, [0, 1], [0.4, 1.35]),
              opacity: interpolate(t, [0, 0.2, 1], [0, 0.9, 0]) * heat,
            }}
          />
        );
      })}
      <PanAt rotate={40} cy={720} heat={heat * (0.75 + Math.sin(frame / 6) * 0.15)} size={520} />
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 400,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: montserrat,
          fontWeight: 900,
          fontSize: 54,
          color: '#fff',
          opacity: ease(frame, 15, 30),
        }}
      >
        <Clock size={58} /> SEGUNDOS
      </div>
      <div style={{position: 'absolute', top: 1040, left: 80, right: 80, display: 'flex', justifyContent: 'space-between'}}>
        {stoves.map((s, i) => {
          const p = enter(frame, Math.round(durationInFrames * 0.45) + i * 6, 14);
          const hi = s === 'Indução';
          return (
            <div
              key={s}
              style={{
                width: 200,
                padding: '22px 0',
                borderRadius: 28,
                background: hi ? '#ffd23f' : 'rgba(255,255,255,0.92)',
                color: '#7a1d0c',
                textAlign: 'center',
                fontFamily: montserrat,
                fontWeight: 800,
                fontSize: 34,
                scale: interpolate(p, [0, 1], [0.2, hi ? 1.08 : 1]),
                opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
                boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{display: 'flex', justifyContent: 'center', marginBottom: 6}}>
                {hi ? <Flame color="#e8590c" size={52} /> : <Flame color="#f08c00" size={44} />}
              </div>
              {s}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Features: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const items = [
    {label: 'Livre de PFOA', icon: <Leaf color={ORANGE} size={56} />},
    {label: 'Cabo que não esquenta', icon: <Hand color={ORANGE} size={56} />},
    {label: 'Lava em 10 segundos', icon: <Drop color={ORANGE} size={56} />},
  ];
  return (
    <AbsoluteFill>
      <Headline text="Feita pra durar" highlight="durar" top={180} size={110} />
      <div style={{position: 'absolute', top: 430, left: 80, right: 80, display: 'flex', flexDirection: 'column', gap: 34}}>
        {items.map((it, i) => {
          const d = Math.round((durationInFrames / 3.3) * i) + 4;
          const p = enter(frame, d, 16);
          const c = enter(frame, d + 10, 12);
          return (
            <div
              key={it.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                padding: '34px 40px',
                borderRadius: 40,
                background: '#fff',
                fontFamily: montserrat,
                fontWeight: 800,
                fontSize: 50,
                color: '#3b1206',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                translate: `${interpolate(p, [0, 1], [i % 2 ? 900 : -900, 0])}px 0`,
              }}
            >
              <div style={{width: 96, height: 96, borderRadius: 28, background: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {it.icon}
              </div>
              <div style={{flex: 1}}>{it.label}</div>
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: '#2fb344',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  scale: c,
                }}
              >
                <Check size={44} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Headline text="Cozinhar ficou fácil" highlight="fácil" top={170} size={104} />
      <PanAt rotate={40 + Math.sin(frame / 20) * 4} cy={700} size={470} shine={frame * 2}>
        <div style={{position: 'absolute', left: 120, top: 110}}>
          <Egg size={210} />
        </div>
      </PanAt>
      <PriceTag oldPrice="R$ 199,90" price="R$ 129,90" note="FRETE GRÁTIS" delay={20} top={880} accent="#e8590c" />
      <CtaButton label="TOQUE NO LINK" bg="#ffd23f" color="#7a1d0c" delay={45} top={1520} />
    </AbsoluteFill>
  );
};

export const Frigideira: React.FC = () => (
  <AdShell
    folder="frigideira"
    voice={frigideiraVoice}
    theme={theme}
    scenes={{hook: Hook, reveal: Reveal, slide: Slide, heat: Heat, features: Features, cta: Cta}}
  />
);
