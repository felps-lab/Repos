import React from 'react';
import {random} from 'remotion';

type Props = {
  readonly size?: number;
  readonly worn?: boolean;
  readonly heat?: number; // 0..1 glow of heat rings
  readonly shine?: number; // rotation of the specular highlight, degrees
};

const speckles = new Array(70).fill(0).map((_, i) => {
  const a = random(`a${i}`) * Math.PI * 2;
  const r = Math.sqrt(random(`r${i}`)) * 205;
  return {x: 300 + Math.cos(a) * r, y: 300 + Math.sin(a) * r, s: 1.5 + random(`s${i}`) * 2.5};
});

/** Top-down frying pan drawn in SVG. viewBox 0 0 600 920 (handle points down). */
export const Pan: React.FC<Props> = ({size = 600, worn = false, heat = 0, shine = 0}) => {
  return (
    <svg width={size} height={(size * 920) / 600} viewBox="0 0 600 920" style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id={`inner-${worn}`} cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor={worn ? '#6b6b6b' : '#3a3d45'} />
          <stop offset="100%" stopColor={worn ? '#3b3632' : '#15161b'} />
        </radialGradient>
        <linearGradient id={`rim-${worn}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={worn ? '#9a948e' : '#ffd1a8'} />
          <stop offset="45%" stopColor={worn ? '#5f5a55' : '#d9772f'} />
          <stop offset="100%" stopColor={worn ? '#3d3935' : '#8a3a12'} />
        </linearGradient>
        <linearGradient id="handle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1b1b1f" />
          <stop offset="50%" stopColor="#3b3b42" />
          <stop offset="100%" stopColor="#141417" />
        </linearGradient>
        <radialGradient id="heat">
          <stop offset="0%" stopColor="#ffb347" stopOpacity={0.9} />
          <stop offset="60%" stopColor="#ff6a00" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#ff3d00" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* handle */}
      <rect x={262} y={560} width={76} height={340} rx={38} fill="url(#handle)" />
      <rect x={282} y={560} width={36} height={70} rx={10} fill={worn ? '#57524d' : '#c46a2b'} />
      <circle cx={300} cy={850} r={14} fill="#0b0b0d" />
      {/* drop shadow */}
      <ellipse cx={300} cy={318} rx={300} ry={300} fill="rgba(0,0,0,0.35)" />
      {/* body */}
      <circle cx={300} cy={300} r={290} fill={`url(#rim-${worn})`} />
      <circle cx={300} cy={300} r={250} fill={`url(#inner-${worn})`} />
      {!worn
        ? speckles.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="rgba(255,255,255,0.18)" />)
        : null}
      {worn ? (
        <g stroke="rgba(255,255,255,0.18)" strokeWidth={3} fill="none">
          <path d="M140 220 l120 40" />
          <path d="M330 150 l90 110" />
          <path d="M200 400 l160 -30" />
          <path d="M380 380 l40 70" />
          <circle cx={250} cy={300} r={60} stroke="rgba(60,30,10,0.6)" strokeWidth={22} />
        </g>
      ) : null}
      {heat > 0 ? <circle cx={300} cy={300} r={250} fill="url(#heat)" opacity={heat} /> : null}
      {/* specular highlight */}
      <g transform={`rotate(${shine} 300 300)`}>
        <path d="M120 170 A 230 230 0 0 1 300 72" stroke="rgba(255,255,255,0.35)" strokeWidth={16} strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};

/** Fried egg, viewBox 0 0 220 200. */
export const Egg: React.FC<{readonly size?: number; readonly burnt?: boolean}> = ({size = 220, burnt = false}) => (
  <svg width={size} height={(size * 200) / 220} viewBox="0 0 220 200">
    <path
      d="M30 100 C10 40 80 5 120 20 C170 0 215 50 200 100 C215 150 160 195 110 180 C60 200 10 160 30 100Z"
      fill={burnt ? '#e6d2b0' : '#fffdf7'}
      stroke={burnt ? '#7a4a1c' : 'rgba(0,0,0,0.06)'}
      strokeWidth={burnt ? 10 : 2}
    />
    <circle cx={110} cy={98} r={44} fill={burnt ? '#c97d1a' : '#ffb200'} />
    <circle cx={96} cy={84} r={12} fill="rgba(255,255,255,0.6)" />
  </svg>
);
