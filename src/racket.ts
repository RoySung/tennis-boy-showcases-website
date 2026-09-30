import { assetUrl } from './assetUrl';
import type { CharacterView } from './character';

// Generated turntable views; angles are visual estimates, not measured camera yaw.
export const racketViews: readonly CharacterView[] = [
  { id: 'front', angle: 0, anchorX: 625.5, src: assetUrl('character/racket/tennis-boy-000-front.webp') },
  { id: 'front-left', angle: 30, anchorX: 627.5, src: assetUrl('character/racket/tennis-boy-030-front-left.webp') },
  { id: 'front-left-oblique', angle: 60, anchorX: 625.5, src: assetUrl('character/racket/tennis-boy-060-front-left-oblique.webp') },
  { id: 'left', angle: 90, anchorX: 643.5, src: assetUrl('character/racket/tennis-boy-090-left.webp') },
  { id: 'rear-left-oblique', angle: 120, anchorX: 645.5, src: assetUrl('character/racket/tennis-boy-120-rear-left-oblique.webp') },
  { id: 'rear-left', angle: 150, anchorX: 636.0, src: assetUrl('character/racket/tennis-boy-150-rear-left.webp') },
  { id: 'back', angle: 180, anchorX: 627.0, src: assetUrl('character/racket/tennis-boy-180-back.webp') },
  { id: 'rear-right', angle: 210, anchorX: 608.5, src: assetUrl('character/racket/tennis-boy-210-rear-right.webp') },
  { id: 'rear-right-oblique', angle: 240, anchorX: 615.5, src: assetUrl('character/racket/tennis-boy-240-rear-right-oblique.webp') },
  { id: 'right', angle: 270, anchorX: 631.0, src: assetUrl('character/racket/tennis-boy-270-right.webp') },
  { id: 'front-right-oblique', angle: 300, anchorX: 648.5, src: assetUrl('character/racket/tennis-boy-300-front-right-oblique.webp') },
  { id: 'front-right', angle: 330, anchorX: 638.0, src: assetUrl('character/racket/tennis-boy-330-front-right.webp') },
];
