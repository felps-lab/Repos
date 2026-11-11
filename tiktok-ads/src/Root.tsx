import {Composition, Folder} from 'remotion';
import {Frigideira} from './frigideira/Frigideira';
import {frigideiraVoice} from './generated/frigideira';
import {inversorVoice} from './generated/inversor';
import {skincareVoice} from './generated/skincare';
import {Inversor} from './inversor/Inversor';
import {Skincare} from './skincare/Skincare';

const FPS = 30;
const frames = (ms: number) => Math.ceil((ms / 1000) * FPS);

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="TikTok">
      <Composition
        id="Frigideira"
        component={Frigideira}
        durationInFrames={frames(frigideiraVoice.totalMs)}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="Inversor"
        component={Inversor}
        durationInFrames={frames(inversorVoice.totalMs)}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="Skincare"
        component={Skincare}
        durationInFrames={frames(skincareVoice.totalMs)}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </Folder>
  );
};
