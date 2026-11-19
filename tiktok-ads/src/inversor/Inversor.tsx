import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {inversorVoice} from '../generated/inversor';
import {AdShell, type Theme} from '../shared/AdShell';
import {clamp, ease, enter} from '../shared/anim';
import {montserrat} from '../shared/fonts';
import {Bolt, Clock, Star} from '../shared/Icons';
import {Chip, CtaButton, Headline} from '../shared/Layout';

const LIME = '#c6ff3d';
const NAVY = '#07142b';

const theme: Theme = {
  bgFrom: '#0b2a55',
  bgTo: '#040b1a',
  blobs: ['#1f6feb', '#00c2a8', '#5b2bd9'],
  accent: LIME,
};

/** Wall-mounted hybrid inverter, 420 x 560. */
const InverterDevice: React.FC<{readonly kw: string; readonly glow?: number; readonly scale?: number; readonly top?: number}> = ({
  kw,
  glow = 1,
  scale = 1,
  top = 520,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - 210,
        top,
        width: 420,
        height: 560,
        scale,
        borderRadius: 48,
        background: 'linear-gradient(160deg, #ffffff 0%, #dfe6ef 60%, #b9c4d3 100%)',
        boxShadow: `0 40px 90px rgba(0,0,0,0.55), 0 0 ${90 * glow}px rgba(198,255,61,${0.35 * glow})`,
      }}
    >
      <div style={{position: 'absolute', left: 30, right: 30, top: 34, height: 6, borderRadius: 3, background: LIME, opacity: 0.9}} />
      <div
        style={{
          position: 'absolute',
          left: 50,
          right: 50,
          top: 90,
          height: 200,
          borderRadius: 26,
          background: 'linear-gradient(#0d1b33, #050c19)',
          boxShadow: 'inset 0 0 0 4px #1d2c47',
          color: LIME,
          fontFamily: montserrat,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{fontSize: 80, fontWeight: 900, letterSpacing: -2, whiteSpace: 'nowrap', textShadow: `0 0 20px ${LIME}`}}>{kw}</div>
        <div style={{fontSize: 26, fontWeight: 700, color: '#7fa0c9', letterSpacing: 4}}>GERANDO AGORA</div>
      </div>
      <div style={{position: 'absolute', left: 50, top: 320, display: 'flex', gap: 16}}>
        {['#2fe36a', LIME, '#33b5ff'].map((c, i) => (
          <div
            key={c}
            style={{width: 22, height: 22, borderRadius: '50%', background: c, opacity: 0.5 + 0.5 * Math.abs(Math.sin(frame / 10 + i)), boxShadow: `0 0 14px ${c}`}}
          />
        ))}
      </div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 380, fontFamily: montserrat, fontWeight: 900, fontSize: 44, color: NAVY, letterSpacing: -1}}>
        VoltSol <span style={{color: '#1f6feb'}}>H5</span>
      </div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 440, fontFamily: montserrat, fontWeight: 700, fontSize: 24, color: '#5b6b82', letterSpacing: 3}}>
        HYBRID INVERTER
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', left: 60 + i * 80, bottom: -26, width: 40, height: 30, borderRadius: 8, background: '#4a5668'}} />
      ))}
    </div>
  );
};

const SolarPanel: React.FC<{readonly left: number; readonly top: number; readonly width?: number; readonly delay?: number}> = ({left, top, width = 360, delay = 0}) => {
  const frame = useCurrentFrame();
  const p = enter(frame, delay, 16);
  const sweep = ((frame * 6) % 600) - 150;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height: width * 0.62,
        borderRadius: 14,
        background: '#0e2350',
        border: '8px solid #c9d3e2',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 4,
        padding: 4,
        rotate: '-8deg',
        scale: interpolate(p, [0, 1], [0.3, 1]),
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
      }}
    >
      {new Array(24).fill(0).map((_, i) => (
        <div key={i} style={{background: 'linear-gradient(135deg, #1d4fa8, #0b2a66)', borderRadius: 2}} />
      ))}
      <div
        style={{
          position: 'absolute',
          top: -100,
          left: sweep,
          width: 70,
          height: 500,
          rotate: '25deg',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
        }}
      />
    </div>
  );
};

const Sun: React.FC<{readonly cx: number; readonly cy: number; readonly r?: number}> = ({cx, cy, r = 90}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: cx - r * 2, top: cy - r * 2, width: r * 4, height: r * 4}}>
      <div style={{position: 'absolute', inset: 0, rotate: `${frame}deg`}}>
        {new Array(12).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: r * 2 - 6,
              top: 0,
              width: 12,
              height: r * 0.7,
              borderRadius: 6,
              background: '#ffd23f',
              transformOrigin: `6px ${r * 2}px`,
              rotate: `${i * 30}deg`,
              opacity: 0.85,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: r,
          top: r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #fff6b0, #ffc400 60%, #ff9500)',
          boxShadow: '0 0 120px #ffb300',
        }}
      />
    </div>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const p = enter(frame, 0, 18);
  const shake = frame > 18 ? Math.sin(frame * 2.2) * 6 : 0;
  const value = Math.round(interpolate(frame, [8, 50], [180, 687], {...clamp}));
  return (
    <AbsoluteFill>
      <Headline text="Conta de luz alta?" highlight="alta?" highlightColor="#ff4d4d" top={190} size={110} />
      <div
        style={{
          position: 'absolute',
          left: 540 - 300,
          top: 480,
          width: 600,
          padding: '50px 54px',
          borderRadius: 30,
          background: '#fbfbf7',
          fontFamily: montserrat,
          color: '#1b2433',
          rotate: `${-4 + shake * 0.3}deg`,
          translate: `${shake}px ${interpolate(p, [0, 1], [900, 0])}px`,
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{fontSize: 34, fontWeight: 800, letterSpacing: 3, color: '#6b778a'}}>CONTA DE ENERGIA</div>
        <div style={{height: 4, background: '#e3e7ee', margin: '24px 0'}} />
        {['Consumo', 'Bandeira vermelha', 'Taxas'].map((l, i) => (
          <div key={l} style={{display: 'flex', justifyContent: 'space-between', fontSize: 32, fontWeight: 600, margin: '10px 0', color: '#4d596b'}}>
            <span>{l}</span>
            <span>{['R$ 512,10', 'R$ 98,30', 'R$ 77,00'][i]}</span>
          </div>
        ))}
        <div style={{height: 4, background: '#e3e7ee', margin: '24px 0'}} />
        <div style={{fontSize: 30, fontWeight: 700, color: '#6b778a'}}>TOTAL A PAGAR</div>
        <div style={{fontSize: 104, fontWeight: 900, color: '#e5383b', letterSpacing: -4, whiteSpace: 'nowrap'}}>R$ {value},40</div>
      </div>
    </AbsoluteFill>
  );
};

const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const p = ease(frame, 0, 24);
  return (
    <AbsoluteFill>
      <Headline text="VoltSol H5" highlight="H5" highlightColor={LIME} top={170} size={130} />
      <div
        style={{
          position: 'absolute',
          top: 330,
          width: '100%',
          textAlign: 'center',
          fontFamily: montserrat,
          fontWeight: 800,
          fontSize: 44,
          letterSpacing: 6,
          color: '#9fc3ff',
          opacity: ease(frame, 10, 25),
        }}
      >
        INVERSOR SOLAR HÍBRIDO
      </div>
      <AbsoluteFill style={{background: `radial-gradient(circle at 540px 800px, rgba(198,255,61,${0.25 * p}), transparent 45%)`}} />
      <InverterDevice kw="5.0 kW" top={interpolate(p, [0, 1], [700, 500])} scale={interpolate(p, [0, 1], [0.6, 1])} glow={p} />
      <Chip label="Sol" icon={<Star color="#ffd23f" size={40} />} delay={30} top={1110} side="left" bg="rgba(255,255,255,0.95)" color={NAVY} />
      <Chip label="Economia" icon={<Bolt color={LIME} size={40} />} delay={60} top={1110} side="right" bg={LIME} color={NAVY} />
    </AbsoluteFill>
  );
};

const Efficiency: React.FC = () => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [5, 60], [0, 98], {...clamp, easing: (t) => 1 - (1 - t) ** 3});
  const R = 250;
  const C = 2 * Math.PI * R;
  return (
    <AbsoluteFill>
      <Sun cx={850} cy={320} r={70} />
      <SolarPanel left={70} top={240} width={330} />
      {/* energy particles from panel to ring */}
      {new Array(10).fill(0).map((_, i) => {
        const t = ((frame + i * 9) % 45) / 45;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: interpolate(t, [0, 1], [240, 520]) + random(`x${i}`) * 30,
              top: interpolate(t, [0, 1], [460, 640]),
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: LIME,
              boxShadow: `0 0 16px ${LIME}`,
              opacity: interpolate(t, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
            }}
          />
        );
      })}
      <svg width={620} height={620} style={{position: 'absolute', left: 230, top: 520}} viewBox="0 0 620 620">
        <circle cx={310} cy={310} r={R} stroke="rgba(255,255,255,0.12)" strokeWidth={44} fill="none" />
        <circle
          cx={310}
          cy={310}
          r={R}
          stroke={LIME}
          strokeWidth={44}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - v / 100)}
          transform="rotate(-90 310 310)"
          style={{filter: `drop-shadow(0 0 18px ${LIME})`}}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 230,
          top: 520,
          width: 620,
          height: 620,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: montserrat,
          color: '#fff',
        }}
      >
        <div style={{fontSize: 190, fontWeight: 900, letterSpacing: -8, lineHeight: 1}}>
          {Math.round(v)}
          <span style={{fontSize: 100, color: LIME}}>%</span>
        </div>
        <div style={{fontSize: 44, fontWeight: 800, letterSpacing: 6, color: '#9fc3ff'}}>EFICIÊNCIA</div>
      </div>
    </AbsoluteFill>
  );
};

const House: React.FC<{readonly lit: number}> = ({lit}) => (
  <svg width={420} height={400} viewBox="0 0 420 400">
    <path d="M30 190 L210 40 L390 190" stroke="#e8eef7" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x={70} y={180} width={280} height={200} rx={16} fill="#e8eef7" />
    {[
      [105, 220],
      [245, 220],
    ].map(([x, y]) => (
      <rect key={x} x={x} y={y} width={70} height={70} rx={10} fill={lit > 0.5 ? '#ffd23f' : '#2a3a55'} style={{filter: lit > 0.5 ? 'drop-shadow(0 0 20px #ffd23f)' : undefined}} />
    ))}
    <rect x={180} y={300} width={60} height={80} rx={8} fill="#5b6b82" />
  </svg>
);

const Backup: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const cut = Math.round(durationInFrames * 0.25);
  const back = cut + 4;
  const lit = frame < cut || frame > back ? 1 : 0;
  const dark = frame >= cut && frame <= back + 6 ? interpolate(frame, [cut, back + 6], [0.75, 0], clamp) : 0;
  const charge = interpolate(frame, [back, durationInFrames], [0.55, 0.95], clamp);
  return (
    <AbsoluteFill>
      <Headline text="Faltou energia?" highlight="energia?" highlightColor="#ff4d4d" top={180} size={110} />
      <div style={{position: 'absolute', left: 80, top: 560}}>
        <House lit={lit} />
      </div>
      {/* battery */}
      <div style={{position: 'absolute', left: 620, top: 600, width: 300, height: 300}}>
        <div style={{position: 'absolute', left: 115, top: 0, width: 70, height: 26, borderRadius: 8, background: '#c9d3e2'}} />
        <div style={{position: 'absolute', left: 40, top: 22, width: 220, height: 300, borderRadius: 30, border: '12px solid #c9d3e2', padding: 12}}>
          <div style={{position: 'absolute', left: 12, right: 12, bottom: 12, height: `${charge * 252}px`, borderRadius: 14, background: `linear-gradient(${LIME}, #4cd137)`, boxShadow: `0 0 30px ${LIME}`}} />
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Bolt color={NAVY} size={110} />
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: 1040,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          fontFamily: montserrat,
          fontWeight: 900,
          fontSize: 58,
          color: NAVY,
          background: LIME,
          borderRadius: 999,
          padding: '24px 0',
          scale: enter(frame, back + 4, 14),
        }}
      >
        <Clock color={NAVY} size={60} /> TROCA EM 0,01 s
      </div>
      <AbsoluteFill style={{background: '#000', opacity: dark}} />
    </AbsoluteFill>
  );
};

const App: React.FC = () => {
  const frame = useCurrentFrame();
  const bars = [0.35, 0.55, 0.8, 1, 0.9, 0.6, 0.3];
  const p = enter(frame, 0, 20);
  const kwh = interpolate(frame, [10, 70], [0, 24.6], clamp);
  const money = Math.round(interpolate(frame, [20, 80], [0, 412], clamp));
  return (
    <AbsoluteFill>
      <Headline text="Tudo no app" highlight="app" highlightColor={LIME} top={170} size={110} />
      <div
        style={{
          position: 'absolute',
          left: 540 - 230,
          top: 360,
          width: 460,
          height: 900,
          borderRadius: 70,
          background: '#0b1324',
          border: '14px solid #1c2a44',
          boxShadow: '0 50px 100px rgba(0,0,0,0.6)',
          translate: `0 ${interpolate(p, [0, 1], [700, 0])}px`,
          overflow: 'hidden',
          fontFamily: montserrat,
          color: '#fff',
          padding: '70px 36px',
        }}
      >
        <div style={{position: 'absolute', top: 18, left: 160, width: 110, height: 28, borderRadius: 14, background: '#1c2a44'}} />
        <div style={{fontSize: 26, fontWeight: 700, color: '#7fa0c9', letterSpacing: 2}}>GERADO HOJE</div>
        <div style={{fontSize: 80, fontWeight: 900, color: LIME, letterSpacing: -2}}>{kwh.toFixed(1).replace('.', ',')} kWh</div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: 300, marginTop: 30}}>
          {bars.map((b, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${interpolate(frame, [10 + i * 4, 30 + i * 4], [0, b * 100], clamp)}%`,
                borderRadius: 12,
                background: i === 3 ? LIME : 'linear-gradient(#33b5ff, #1f6feb)',
              }}
            />
          ))}
        </div>
        <div style={{marginTop: 40, padding: 26, borderRadius: 30, background: '#13203a'}}>
          <div style={{fontSize: 26, fontWeight: 700, color: '#7fa0c9', letterSpacing: 2}}>ECONOMIA NO MÊS</div>
          <div style={{fontSize: 70, fontWeight: 900, letterSpacing: -2}}>R$ {money}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [5, 40], [0, 90], clamp));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 170, width: '100%', textAlign: 'center', fontFamily: montserrat, color: '#fff'}}>
        <div style={{fontSize: 60, fontWeight: 800, color: '#9fc3ff'}}>ECONOMIZE ATÉ</div>
        <div style={{fontSize: 260, fontWeight: 900, letterSpacing: -10, lineHeight: 1, color: LIME, textShadow: `0 0 60px rgba(198,255,61,0.5)`}}>
          {v}%
        </div>
        <div style={{fontSize: 60, fontWeight: 800}}>NA CONTA DE LUZ</div>
      </div>
      <InverterDevice kw="5.0 kW" top={680} scale={0.82} />
      <CtaButton label="PEÇA SEU ORÇAMENTO" bg={LIME} color={NAVY} delay={40} top={1520} />
    </AbsoluteFill>
  );
};

export const Inversor: React.FC = () => (
  <AdShell
    folder="inversor"
    voice={inversorVoice}
    theme={theme}
    scenes={{hook: Hook, reveal: Reveal, efficiency: Efficiency, backup: Backup, app: App, cta: Cta}}
  />
);
