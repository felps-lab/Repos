import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {handwriting, montserrat} from '../shared/fonts';

// Story 1080x1920: four polaroids taped onto a warm background, with room at the
// top and bottom for Instagram's own interface, stickers and @mentions.

type Props = {
  readonly showText: boolean;
  readonly title: string;
};

const Polaroid: React.FC<{
  readonly src: string;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly aspect: string;
  readonly rotate: number;
  readonly objectPosition?: string;
  readonly tape?: 'left' | 'right' | 'center';
  readonly z?: number;
}> = ({src, left, top, width, aspect, rotate, objectPosition = 'center', tape = 'center', z = 1}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width,
      padding: '18px 18px 70px',
      background: '#fdfaf3',
      rotate: `${rotate}deg`,
      boxShadow: '0 30px 60px rgba(60,20,0,0.35), 0 4px 10px rgba(60,20,0,0.25)',
      zIndex: z,
    }}
  >
    <div style={{width: '100%', aspectRatio: aspect, overflow: 'hidden', background: '#222'}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition, filter: 'saturate(1.08) contrast(1.03)'}} />
    </div>
    <div
      style={{
        position: 'absolute',
        top: -22,
        left: tape === 'left' ? 30 : tape === 'right' ? undefined : '50%',
        right: tape === 'right' ? 30 : undefined,
        translate: tape === 'center' ? '-50% 0' : undefined,
        width: 150,
        height: 46,
        background: 'rgba(255, 236, 170, 0.78)',
        rotate: `${tape === 'left' ? -12 : tape === 'right' ? 10 : -3}deg`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
      }}
    />
  </div>
);

const Confetti: React.FC = () => {
  const dots = [
    [90, 140, '#ffd23f'], [980, 190, '#ff6a8a'], [520, 120, '#ffffff'], [160, 1780, '#ffffff'],
    [930, 1760, '#ffd23f'], [600, 1830, '#ff6a8a'], [40, 820, '#ffd23f'], [1040, 980, '#ffffff'],
    [330, 1250, '#ff6a8a'], [760, 860, '#ffd23f'],
  ] as const;
  return (
    <>
      {dots.map(([x, y, c], i) => (
        <div
          key={i}
          style={{position: 'absolute', left: x, top: y, width: i % 2 ? 16 : 22, height: i % 2 ? 16 : 10, borderRadius: i % 2 ? '50%' : 3, background: c, rotate: `${i * 37}deg`, opacity: 0.9}}
        />
      ))}
    </>
  );
};

export const StoryAniversario: React.FC<Props> = ({showText, title}) => (
  <AbsoluteFill style={{background: 'linear-gradient(170deg, #ffb36b 0%, #ff7a6b 45%, #c2456e 100%)', overflow: 'hidden'}}>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 85% 90%, rgba(255,220,120,0.3), transparent 40%)'}} />
    <Confetti />

    <Polaroid src="melhores/story/f4.jpg" left={50} top={230} width={470} aspect="3 / 4" rotate={-6} objectPosition="50% 28%" tape="left" z={2} />
    <Polaroid src="melhores/story/f1.jpg" left={560} top={290} width={460} aspect="3 / 4" rotate={5} objectPosition="50% 40%" tape="right" z={1} />
    <Polaroid src="melhores/story/f2.jpg" left={170} top={880} width={740} aspect="16 / 9" rotate={-2.5} objectPosition="50% 50%" tape="center" z={3} />
    <Polaroid src="melhores/story/f3.jpg" left={590} top={1300} width={420} aspect="3 / 4" rotate={6} objectPosition="50% 55%" tape="right" z={4} />

    {showText ? (
      <div style={{position: 'absolute', left: 56, top: 1330, width: 540, zIndex: 5}}>
        <div
          style={{
            fontFamily: handwriting,
            fontWeight: 700,
            fontSize: 112,
            lineHeight: 0.95,
            color: '#fff',
            rotate: '-6deg',
            textShadow: '0 6px 24px rgba(90,20,30,0.45)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 26,
            marginLeft: 8,
            fontFamily: montserrat,
            fontWeight: 800,
            fontSize: 25,
            letterSpacing: 5,
            whiteSpace: 'nowrap',
            color: 'rgba(255,255,255,0.92)',
            rotate: '-6deg',
          }}
        >
          MUITOS ANOS DE RESENHA
        </div>
      </div>
    ) : null}
  </AbsoluteFill>
);
