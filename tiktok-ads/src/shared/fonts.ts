import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fonts are bundled in public/fonts (copied from @fontsource) so renders work offline.
export const montserrat = 'Montserrat';
export const serif = 'DM Serif Display';

for (const weight of ['500', '700', '800', '900']) {
  loadFont({family: montserrat, url: staticFile(`fonts/montserrat-latin-${weight}-normal.woff2`), weight});
}
loadFont({family: serif, url: staticFile('fonts/dm-serif-display-latin-400-normal.woff2'), weight: '400'});
