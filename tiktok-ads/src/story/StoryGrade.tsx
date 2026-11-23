import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

// Plain 1080x1920 story collage: white borders, no text, no decoration.
const B = 14; // border
const W = 1080 - 2 * B;
const HALF = (W - B) / 2;
const TOP = Math.round((HALF * 4) / 3); // 3:4 photos side by side
const MID = Math.round((W * 9) / 16); // 16:9 photo full width
const BOT = 1920 - 4 * B - TOP - MID;

type Props = {readonly border?: string; readonly hd?: boolean};

const Cell: React.FC<{readonly src: string; readonly w: number; readonly h: number; readonly pos?: string}> = ({src, w, h, pos = 'center'}) => (
  <div style={{width: w, height: h, overflow: 'hidden', flexShrink: 0}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
  </div>
);

export const StoryGrade: React.FC<Props> = ({border = '#ffffff', hd = false}) => {
  // hd: use the 2x AI-upscaled photos (render with --scale=2 for a 2160x3840 file)
  const img = (n: string) => `melhores/story/${n}${hd ? '_2x' : ''}.jpg`;
  return (
  <AbsoluteFill style={{background: border, padding: B, display: 'flex', flexDirection: 'column', gap: B}}>
    <div style={{display: 'flex', gap: B}}>
      <Cell src={img('f1')} w={HALF} h={TOP} />
      <Cell src={img('f3')} w={HALF} h={TOP} />
    </div>
    <Cell src={img('f2')} w={W} h={MID} />
    <Cell src={img('f4')} w={W} h={BOT} pos="50% 30%" />
  </AbsoluteFill>
  );
};
