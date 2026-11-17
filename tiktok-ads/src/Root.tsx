import {Composition, Folder} from 'remotion';
import {Frigideira} from './frigideira/Frigideira';
import {frigideiraVoice} from './generated/frigideira';
import {inversorVoice} from './generated/inversor';
import {skincareVoice} from './generated/skincare';
import {Inversor} from './inversor/Inversor';
import {MELHORES_DURATION, MelhoresMomentos} from './melhores/MelhoresMomentos';
import {
  calculateRetrospectivaMetadata,
  Retrospectiva,
  retrospectivaSchema,
} from './retrospectiva/Retrospectiva';
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
      <Composition
        id="Retrospectiva2026"
        component={Retrospectiva}
        schema={retrospectivaSchema}
        calculateMetadata={calculateRetrospectivaMetadata}
        durationInFrames={1391}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          ano: '2026',
          subtitulo: 'um ano para guardar',
          memorias: [
            {arquivo: '', mes: 'Janeiro', legenda: 'o começo de tudo'},
            {arquivo: '', mes: 'Fevereiro', legenda: 'carnaval com quem eu amo'},
            {arquivo: '', mes: 'Março', legenda: 'dias de sol'},
            {arquivo: '', mes: 'Abril', legenda: 'pequenas conquistas'},
            {arquivo: '', mes: 'Maio', legenda: 'risadas sem fim'},
            {arquivo: '', mes: 'Junho', legenda: 'festa junina!'},
            {arquivo: '', mes: 'Julho', legenda: 'pé na estrada'},
            {arquivo: '', mes: 'Agosto', legenda: 'um novo desafio'},
            {arquivo: '', mes: 'Setembro', legenda: 'de volta pra casa'},
            {arquivo: '', mes: 'Outubro', legenda: 'noites inesquecíveis'},
            {arquivo: '', mes: 'Novembro', legenda: 'gratidão'},
            {arquivo: '', mes: 'Dezembro', legenda: 'até logo, 2026'},
          ],
          despedida: 'Obrigado, 2026.',
          recado: 'que venha 2027',
        }}
      />
      <Composition
        id="MelhoresMomentos"
        component={MelhoresMomentos}
        durationInFrames={MELHORES_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </Folder>
  );
};
