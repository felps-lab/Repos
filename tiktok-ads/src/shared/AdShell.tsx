import type {Caption} from '@remotion/captions';
import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import {clamp, msToFrames} from './anim';
import {Captions} from './Captions';
import {Background, Flash, ProgressBar, SceneIn} from './Layout';

export type VoiceData = {
  totalMs: number;
  scenes: {id: string; startMs: number; endMs: number}[];
  captions: Caption[];
};

export type Theme = {
  bgFrom: string;
  bgTo: string;
  blobs: string[];
  accent: string;
};

type Props = {
  readonly folder: string;
  readonly voice: VoiceData;
  readonly theme: Theme;
  readonly scenes: Record<string, React.FC>;
  readonly captionTop?: number;
};

export const AdShell: React.FC<Props> = ({folder, voice, theme, scenes, captionTop}) => {
  const {fps} = useVideoConfig();
  const lastWordMs = voice.captions[voice.captions.length - 1].endMs;
  const speechStart = msToFrames(voice.captions[0].startMs, fps);
  const speechEnd = msToFrames(lastWordMs, fps);

  return (
    <AbsoluteFill style={{background: theme.bgTo}}>
      <Background from={theme.bgFrom} to={theme.bgTo} blobs={theme.blobs} />

      {voice.scenes.map((scene, i) => {
        const Scene = scenes[scene.id];
        const from = i === 0 ? 0 : msToFrames(scene.startMs, fps);
        const next = voice.scenes[i + 1];
        const to = next ? msToFrames(next.startMs, fps) : msToFrames(voice.totalMs, fps);
        return (
          <Sequence key={scene.id} name={`Cena: ${scene.id}`} from={from} durationInFrames={to - from}>
            <SceneIn>
              <Scene />
            </SceneIn>
            {i > 0 ? <Flash /> : null}
            {i > 0 ? <Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} /> : null}
          </Sequence>
        );
      })}

      <Captions captions={voice.captions} accent={theme.accent} top={captionTop} />
      <ProgressBar color={theme.accent} />

      <Audio name="Narração" src={staticFile(`${folder}/voice.wav`)} volume={1} />
      <Audio
        name="Trilha sonora"
        src={staticFile(`${folder}/music.wav`)}
        volume={(f) =>
          interpolate(f, [0, speechStart, speechStart + 8, speechEnd, speechEnd + 15], [0.32, 0.32, 0.13, 0.13, 0.34], clamp)
        }
      />
    </AbsoluteFill>
  );
};
