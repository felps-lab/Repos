import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

// Plain 1080x1920 story collage: white borders, no text, no decoration.
const B = 14; // border
const W = 1080 - 2 * B;
const HALF = (W - B) / 2;
const TOP = Math.round((HALF * 4) / 3); // 3:4 photos side by side
const MID = Math.round((W * 9) / 16); // 16:9 photo full width
const BOT = 1920 - 4 * B - TOP - MID;

const Cell: React.FC<{readonly src: string; readonly w: number; readonly h: number; readonly pos?: string}> = ({src, w, h, pos = 'center'}) => (
  <div style={{width: w, height: h, overflow: 'hidden', flexShrink: 0}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
  </div>
);

export const StoryGrade: React.FC = () => (
  <AbsoluteFill style={{background: '#ffffff', padding: B, display: 'flex', flexDirection: 'column', gap: B}}>
    <div style={{display: 'flex', gap: B}}>
      <Cell src="melhores/story/f1.jpg" w={HALF} h={TOP} />
      <Cell src="melhores/story/f3.jpg" w={HALF} h={TOP} />
    </div>
    <Cell src="melhores/story/f2.jpg" w={W} h={MID} />
    <Cell src="melhores/story/f4.jpg" w={W} h={BOT} pos="50% 30%" />
  </AbsoluteFill>
);
