import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, ease, enter} from './anim';
import {montserrat} from './fonts';

/** Animated gradient backdrop with slowly drifting light blobs. */
export const Background: React.FC<{
  readonly from: string;
  readonly to: string;
  readonly blobs: string[];
}> = ({from, to, blobs}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `linear-gradient(165deg, ${from} 0%, ${to} 100%)`, overflow: 'hidden'}}>
      {blobs.map((color, i) => {
        const t = frame / 90 + i * 2.1;
        return (
          <div
            key={color + i}
            style={{
              position: 'absolute',
              width: 900,
              height: 900,
              borderRadius: '50%',
              background: color,
              filter: 'blur(140px)',
              opacity: 0.55,
              left: 90 + Math.sin(t) * 260 + (i % 2) * 300 - 300,
              top: 200 + Math.cos(t * 0.8) * 300 + i * 520,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 2px, transparent 2px)',
          backgroundSize: '44px 44px',
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};

/** Thin progress bar across the top of the frame. */
export const ProgressBar: React.FC<{readonly color: string}> = ({color}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: 'rgba(255,255,255,0.18)'}}>
      <div style={{height: '100%', width: `${(frame / durationInFrames) * 100}%`, background: color}} />
    </div>
  );
};

/** Big headline near the top that pops in word by word. */
export const Headline: React.FC<{
  readonly text: string;
  readonly color?: string;
  readonly highlight?: string;
  readonly highlightColor?: string;
  readonly top?: number;
  readonly size?: number;
  readonly fontFamily?: string;
  readonly delay?: number;
}> = ({text, color = '#fff', highlight, highlightColor = '#ffd23f', top = 200, size = 96, fontFamily = montserrat, delay = 0}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 80,
        right: 80,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: size * 0.25,
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.05,
        color,
        textAlign: 'center',
        letterSpacing: fontFamily === montserrat ? -2 : 0,
      }}
    >
      {words.map((w, i) => {
        const p = enter(frame, delay + i * 3, 14);
        const isHi = highlight?.split(' ').includes(w.replace(/[.,!?]/g, ''));
        return (
          <span
            key={w + i}
            style={{
              display: 'inline-block',
              opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
              translate: `0 ${interpolate(p, [0, 1], [60, 0])}px`,
              color: isHi ? highlightColor : color,
              textShadow: '0 10px 30px rgba(0,0,0,0.35)',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Pill with an emoji-free icon dot and label, slides in from a side. */
export const Chip: React.FC<{
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly delay: number;
  readonly top: number;
  readonly side: 'left' | 'right';
  readonly bg: string;
  readonly color: string;
}> = ({label, icon, delay, top, side, bg, color}) => {
  const frame = useCurrentFrame();
  const p = enter(frame, delay, 16);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        [side]: 70,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '22px 34px 22px 22px',
        borderRadius: 999,
        background: bg,
        color,
        fontFamily: montserrat,
        fontWeight: 800,
        fontSize: 46,
        boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        translate: `${interpolate(p, [0, 1], [side === 'left' ? -500 : 500, 0])}px 0`,
      }}
    >
      <div style={{width: 72, height: 72, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {icon}
      </div>
      {label}
    </div>
  );
};

/** Quick white flash used at scene cuts. */
export const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: '#fff', opacity: interpolate(frame, [0, 6], [0.55, 0], clamp), pointerEvents: 'none'}} />;
};

/** Zoom-in entrance wrapper for each scene. */
export const SceneIn: React.FC<{readonly children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, 0, 12);
  return (
    <AbsoluteFill style={{scale: interpolate(p, [0, 1], [1.08, 1]), opacity: interpolate(p, [0, 0.4], [0, 1], clamp)}}>
      {children}
    </AbsoluteFill>
  );
};

/** End-card call to action button with a pulsing glow. */
export const CtaButton: React.FC<{
  readonly label: string;
  readonly bg: string;
  readonly color: string;
  readonly delay: number;
  readonly top: number;
}> = ({label, bg, color, delay, top}) => {
  const frame = useCurrentFrame();
  const p = enter(frame, delay, 18);
  const pulse = 1 + Math.sin((frame - delay) / 5) * 0.035 * (frame > delay + 18 ? 1 : 0);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: '50%',
        translate: '-50% 0',
        padding: '38px 80px',
        borderRadius: 999,
        background: bg,
        color,
        fontFamily: montserrat,
        fontWeight: 900,
        fontSize: 64,
        whiteSpace: 'nowrap',
        letterSpacing: -1,
        boxShadow: `0 0 ${40 + Math.sin(frame / 5) * 20}px ${bg}`,
        scale: interpolate(p, [0, 1], [0.4, 1]) * pulse,
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
      }}
    >
      {label}
    </div>
  );
};

/** Price tag badge with old/new price. */
export const PriceTag: React.FC<{
  readonly oldPrice: string;
  readonly price: string;
  readonly note: string;
  readonly delay: number;
  readonly top: number;
  readonly accent: string;
  readonly ink?: string;
}> = ({oldPrice, price, note, delay, top, accent, ink = '#111'}) => {
  const frame = useCurrentFrame();
  const p = enter(frame, delay, 18);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: '50%',
        translate: '-50% 0',
        rotate: `${interpolate(p, [0, 1], [-14, -3])}deg`,
        scale: interpolate(p, [0, 1], [0.3, 1]),
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        background: '#fff',
        borderRadius: 36,
        padding: '26px 54px',
        textAlign: 'center',
        fontFamily: montserrat,
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
        color: ink,
      }}
    >
      <div style={{fontSize: 40, fontWeight: 700, textDecoration: 'line-through', opacity: 0.5}}>{oldPrice}</div>
      <div style={{fontSize: 100, fontWeight: 900, color: accent, letterSpacing: -3, lineHeight: 1, whiteSpace: 'nowrap'}}>{price}</div>
      <div style={{fontSize: 34, fontWeight: 800, marginTop: 8}}>{note}</div>
    </div>
  );
};
