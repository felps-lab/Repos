import {Easing, interpolate} from 'remotion';

export const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

/** 0 → 1 springy entrance starting at `delay` frames. */
export const enter = (frame: number, delay = 0, duration = 18) =>
  interpolate(frame, [delay, delay + duration], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });

/** Smooth 0 → 1 without overshoot. */
export const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

export const msToFrames = (ms: number, fps: number) => Math.round((ms / 1000) * fps);
