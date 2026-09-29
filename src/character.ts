import { assetUrl } from './assetUrl';

// Angles are visual estimates, not measured camera yaw. Original PNGs are preserved.
// anchorX: median torso silhouette center at source rows 570–750 (1254px canvas).
export type CharacterView = { id: string; angle: number; anchorX: number; src: string };

export const characterViews = [
  { id: 'front', angle: 0, anchorX: 620, src: assetUrl('character/turntable/tennis-boy-000-front.png') },
  { id: 'front-left', angle: 36, anchorX: 638.5, src: assetUrl('character/turntable/tennis-boy-036-front-left.png') },
  { id: 'front-left-oblique', angle: 60, anchorX: 635.5, src: assetUrl('character/turntable/tennis-boy-060-front-left-oblique.png') },
  { id: 'left', angle: 90, anchorX: 628.5, src: assetUrl('character/turntable/tennis-boy-090-left.png') },
  { id: 'rear-left-oblique', angle: 108, anchorX: 645, src: assetUrl('character/turntable/tennis-boy-108-rear-left-oblique.png') },
  { id: 'rear-left', angle: 144, anchorX: 647.5, src: assetUrl('character/turntable/tennis-boy-144-rear-left.png') },
  { id: 'back', angle: 180, anchorX: 625, src: assetUrl('character/turntable/tennis-boy-180-back.png') },
  { id: 'rear-right', angle: 216, anchorX: 639, src: assetUrl('character/turntable/tennis-boy-216-rear-right.png') },
  { id: 'rear-right-oblique', angle: 252, anchorX: 637, src: assetUrl('character/turntable/tennis-boy-252-rear-right-oblique.png') },
  { id: 'front-right-oblique', angle: 288, anchorX: 618.5, src: assetUrl('character/turntable/tennis-boy-288-front-right-oblique.png') },
  { id: 'front-right', angle: 324, anchorX: 633, src: assetUrl('character/turntable/tennis-boy-324-front-right.png') },
 ] as const;
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
