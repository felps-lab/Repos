import {Composition} from 'remotion';
import {VideoTeste} from './VideoTeste';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VideoTeste"
      component={VideoTeste}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{titulo: 'Boa Noite!', subtitulo: 'Meu primeiro vídeo com Remotion'}}
    />
  );
};
