import React from 'react';
import {montserrat} from '../shared/fonts';

const Label: React.FC<{readonly line1: string; readonly line2: string; readonly color: string; readonly size?: number}> = ({line1, line2, color, size = 1}) => (
  <div style={{textAlign: 'center', fontFamily: montserrat, color}}>
    <div style={{fontSize: 20 * size, fontWeight: 800, letterSpacing: 4 * size}}>PURA PELE</div>
    <div style={{height: 3 * size, width: 50 * size, background: color, margin: `${8 * size}px auto`, opacity: 0.6}} />
    <div style={{fontSize: 26 * size, fontWeight: 900, lineHeight: 1.05}}>{line1}</div>
    <div style={{fontSize: 18 * size, fontWeight: 700, opacity: 0.8, marginTop: 4 * size}}>{line2}</div>
  </div>
);

/** Squeeze tube for the cleansing gel. Box 200 x 520. */
export const Tube: React.FC<{readonly scale?: number}> = ({scale = 1}) => (
  <div style={{position: 'relative', width: 200, height: 520, scale}}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 200,
        height: 420,
        borderRadius: '24px 24px 60px 60px',
        background: 'linear-gradient(90deg, #7fd9c7 0%, #c9f5ea 40%, #8fe0cf 70%, #5cc2ad 100%)',
        boxShadow: '0 30px 60px rgba(40,80,70,0.3)',
        clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Label line1="GEL DE" line2="LIMPEZA" color="#0f5c50" />
    </div>
    <div style={{position: 'absolute', left: 50, top: 410, width: 100, height: 110, borderRadius: '10px 10px 24px 24px', background: 'linear-gradient(90deg,#e9eef0,#ffffff,#cfd8dc)'}} />
  </div>
);

/** Dropper bottle for the vitamin C serum. Box 220 x 520. */
export const Dropper: React.FC<{readonly scale?: number; readonly lift?: number}> = ({scale = 1, lift = 0}) => (
  <div style={{position: 'relative', width: 220, height: 520, scale}}>
    <div style={{position: 'absolute', left: 80, top: 0 - lift, width: 60, height: 120, borderRadius: '30px 30px 10px 10px', background: 'linear-gradient(90deg,#2b2b2b,#5a5a5a,#1d1d1d)'}} />
    <div style={{position: 'absolute', left: 70, top: 110 - lift, width: 80, height: 60, borderRadius: 10, background: 'linear-gradient(90deg,#c99a3c,#f4d27a,#b07f28)'}} />
    {lift > 0 ? <div style={{position: 'absolute', left: 104, top: 170 - lift, width: 12, height: lift + 40, borderRadius: 6, background: 'rgba(255,170,60,0.7)'}} /> : null}
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 165,
        width: 220,
        height: 355,
        borderRadius: 40,
        background: 'linear-gradient(90deg, #e86a10 0%, #ffb366 35%, #f28a2e 65%, #c95400 100%)',
        boxShadow: '0 30px 60px rgba(120,50,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{background: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: '18px 14px', width: 170}}>
        <Label line1="SÉRUM" line2="VITAMINA C" color="#a14000" />
      </div>
    </div>
  </div>
);

/** Moisturizer jar. Box 300 x 300. */
export const Jar: React.FC<{readonly scale?: number; readonly lidOpen?: number}> = ({scale = 1, lidOpen = 0}) => (
  <div style={{position: 'relative', width: 300, height: 300, scale}}>
    <div
      style={{
        position: 'absolute',
        left: 10,
        top: 0,
        width: 280,
        height: 90,
        borderRadius: 24,
        background: 'linear-gradient(90deg,#f3f3f3,#ffffff,#d9d9d9)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
        translate: `${lidOpen * 230}px ${-lidOpen * 50}px`,
        rotate: `${lidOpen * 20}deg`,
        zIndex: 2,
      }}
    />
    {lidOpen > 0 ? (
      <div style={{position: 'absolute', left: 30, top: 70, width: 240, height: 50, borderRadius: '50%', background: 'radial-gradient(#fff, #ffe3ee)'}} />
    ) : null}
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 85,
        width: 300,
        height: 215,
        borderRadius: '30px 30px 60px 60px',
        background: 'linear-gradient(90deg, #f48fb1 0%, #ffd1e1 40%, #f7a8c4 70%, #e57399 100%)',
        boxShadow: '0 30px 60px rgba(120,30,60,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Label line1="HIDRATANTE" line2="ÁCIDO HIALURÔNICO" color="#8a1f45" />
    </div>
  </div>
);
