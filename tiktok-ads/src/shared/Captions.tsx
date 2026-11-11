import {createTikTokStyleCaptions, type Caption} from '@remotion/captions';
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, enter, msToFrames} from './anim';
import {montserrat} from './fonts';

type Props = {
  readonly captions: Caption[];
  readonly accent: string;
  /** Distance from the top of the frame to the caption block's center. */
  readonly top?: number;
};

const Page: React.FC<{
  page: ReturnType<typeof createTikTokStyleCaptions>['pages'][number];
  accent: string;
  top: number;
}> = ({page, accent, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;
  const pop = enter(frame, 0, 8);

  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top,
          width: 900,
          translate: '0 -50%',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 30,
          rowGap: 4,
          scale: interpolate(pop, [0, 1], [0.85, 1]),
          opacity: interpolate(frame, [0, 3], [0, 1], clamp),
          fontFamily: montserrat,
          fontWeight: 900,
          fontSize: 76,
          lineHeight: 1.12,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        {page.tokens.map((t) => {
          const active = nowMs >= t.fromMs && nowMs < t.toMs;
          const spoken = nowMs >= t.fromMs;
          const local = ((nowMs - t.fromMs) / 1000) * fps;
          return (
            <span
              key={t.fromMs}
              style={{
                display: 'inline-block',
                color: active ? accent : '#ffffff',
                opacity: spoken ? 1 : 0.8,
                scale: active ? interpolate(local, [0, 4], [1.18, 1.08], clamp) : 1,
                WebkitTextStroke: '12px rgba(0,0,0,0.92)',
                margin: '0 4px',
                paintOrder: 'stroke fill',
                textShadow: '0 8px 24px rgba(0,0,0,0.45)',
              }}
            >
              {t.text.trim()}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<Props> = ({captions, accent, top = 1390}) => {
  const {fps} = useVideoConfig();
  const {pages} = useMemo(() => {
    // Never let a caption page run across the end of a sentence.
    const withBreaks = captions.map((c) => (/[.?!:]$/.test(c.text) ? {...c, pageBreakAfter: true} : c));
    return createTikTokStyleCaptions({captions: withBreaks, combineTokensWithinMilliseconds: 750});
  }, [captions]);

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const endMs = next ? Math.min(next.startMs, page.startMs + page.durationMs + 600) : page.startMs + page.durationMs + 600;
        const from = msToFrames(page.startMs, fps);
        const duration = Math.max(1, msToFrames(endMs, fps) - from);
        return (
          <Sequence key={page.startMs} name={`Legenda: ${page.text.trim().slice(0, 24)}`} from={from} durationInFrames={duration} layout="none">
            <Page page={page} accent={accent} top={top} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
