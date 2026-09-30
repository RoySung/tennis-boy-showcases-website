import { assetUrl } from './assetUrl';

export const walking = {
  id: 'walking-036-transparent-16-stable-gait',
  angle: 36,
  fps: 16,
  width: 960,
  height: 960,
  frames: Array.from({ length: 16 }, (_, index) =>
    assetUrl(`character/walking/036/tennis-boy-036-walking-${String(index + 1).padStart(3, '0')}.webp`)),
} as const;

export const wrapFrame = (frame: number, count: number) => ((frame % count) + count) % count;

// The clock stores fractional frames, so refresh rate and playback speed do not
// change the length of the cycle. Callers reset timestamps after visibility changes.
export const advanceFrames = (position: number, elapsed: number, fps: number, speed: number, count: number) =>
  wrapFrame(position + Math.max(0, elapsed) * fps * speed / 1000, count);
