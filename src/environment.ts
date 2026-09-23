// Two 2:1 panorama tiles cross the stage in 36.4s: 80px/s at 650px tall.
export const WORLD_SCROLL_SECONDS = 36.4;

export const ballPatterns = ['power', 'skid', 'lob'] as const;

export const nextBallPattern = (current: number, random = Math.random) => {
  const candidates = ballPatterns.map((_, index) => index).filter(index => index !== current);
  return candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
};
