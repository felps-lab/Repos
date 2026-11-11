import {Composition} from 'remotion';
import {VideoTeste} from './VideoTeste';

const props = {titulo: 'Boa Noite!', subtitulo: 'Meu primeiro vídeo com Remotion', musica: false};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Horizontal 16:9, sem som */}
      <Composition
        id="VideoTeste"
        component={VideoTeste}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={props}
      />
      {/* Vertical 9:16 para Reels, TikTok e Shorts, com música */}
      <Composition
        id="VideoVertical"
        component={VideoTeste}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{...props, musica: true}}
      />
    </>
  );
};
