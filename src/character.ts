// Angles are visual estimates, not measured camera yaw. Original PNGs are preserved.
export const characterViews = [
  { id: 'front', angle: 0, src: '/character/turntable/tennis-boy-000-front.png' },
  { id: 'front-left', angle: 36, src: '/character/turntable/tennis-boy-036-front-left.png' },
  { id: 'front-left-oblique', angle: 60, src: '/character/turntable/tennis-boy-060-front-left-oblique.png' },
  { id: 'left', angle: 90, src: '/character/turntable/tennis-boy-090-left.png' },
  { id: 'rear-left-oblique', angle: 108, src: '/character/turntable/tennis-boy-108-rear-left-oblique.png' },
  { id: 'rear-left', angle: 144, src: '/character/turntable/tennis-boy-144-rear-left.png' },
  { id: 'back', angle: 180, src: '/character/turntable/tennis-boy-180-back.png' },
  { id: 'rear-right', angle: 216, src: '/character/turntable/tennis-boy-216-rear-right.png' },
  { id: 'rear-right-oblique', angle: 252, src: '/character/turntable/tennis-boy-252-rear-right-oblique.png' },
  { id: 'front-right-oblique', angle: 288, src: '/character/turntable/tennis-boy-288-front-right-oblique.png' },
  { id: 'front-right', angle: 324, src: '/character/turntable/tennis-boy-324-front-right.png' },
 ] as const;
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
