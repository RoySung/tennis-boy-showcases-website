export const walking = {
  id: 'walking-036-white-16-stable-gait',
  angle: 36,
  fps: 16,
  width: 1254,
  height: 1254,
  frames: Array.from({ length: 16 }, (_, index) =>
    `/character/walking/036/tennis-boy-036-walking-${String(index + 1).padStart(3, '0')}.png`),
} as const;

export const wrapFrame = (frame: number, count: number) => ((frame % count) + count) % count;

// The clock stores fractional frames, so refresh rate and playback speed do not
// change the length of the cycle. Callers reset timestamps after visibility changes.
export const advanceFrames = (position: number, elapsed: number, fps: number, speed: number, count: number) =>
  wrapFrame(position + Math.max(0, elapsed) * fps * speed / 1000, count);
