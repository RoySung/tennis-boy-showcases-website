# Tennis Boy 02 — verification

The user approved adding a second character and the three-view reference sheet before production.

## Scope

- Preserve Tennis Boy 01 and its eleven standing / sixteen walking PNGs.
- Add a separate, lazily mounted 02 standing viewer with twelve transparent angle assets.
- Preserve independent standing angles; stop automatic rotation and Motion when switching away.
- Use the same warm tennis-center environment and responsive stage.
- Angles are estimated 2.5D image views, not measured yaw from a 3D model.

## Provenance

All new artwork uses the built-in image_gen tool. No CLI/API fallback was used. The approved reference is `turnaround-preview-v1.png`; exact prompts and generated source paths are in `../../prompts/tennis-boy-02-turntable.json`. New source PNGs retain their generated alpha and pixels without post-processing. See `../../racket-assets.json` for dimensions, bounds, measured torso anchors and SHA-256 hashes.

## Verification results

- `npm test`: 22 passing tests, including independent character angles, lazy 02 mounting, Motion suspension, loading/failure controls, reduced-motion wraparound and simulated touch-pointer capture/cancellation.
- `npm run build`: TypeScript and Vite production build pass.
- `git diff --check`: pass. `git diff --name-only -- public/character/turntable public/character/walking` is empty: original 01 PNGs are unchanged.
- All twelve files are RGBA 1254 × 1254 with alpha spanning 0–255, inset silhouettes, and SHA-256 identical to their generated sources. Combined size: 9,230,041 bytes. Foot bounds vary by up to 19 source pixels (about 1.5% of canvas); no image scaling, warping or synthetic alignment edits were applied.
- Chrome at 390 × 844 and 1440 × 900: all twelve 02 sprites loaded, no horizontal overflow, full character and racket visible. Captures: `mobile.png`, `desktop.png`, `desktop-back.png`.
- Actual browser controls checked: drag settled at 120°, Home/Left wrapped to 348°, Right shortcut selected 270°, Back selected 180°, reset returned to 0°, native range keyboard input changed the angle, automatic rotation advanced and stopped on character switch.
- 01 Motion loaded its sixteen frames and autoplayed; frame stepping and switching back to 02 worked. Browser console error log was empty. Viewport override was reset afterward.
- Independent finish review: **ship** for the screenshot/source scope; no material visual regression in the addition. Documentation review found no mismatch in the extension. The existing design-system file format was preserved.

## Limits

This is the existing frame-based 2.5D viewer, not a continuous 3D mesh. Generated angles are estimates and adjacent frames can differ slightly in silhouette, equipment perspective and cloth details. Touch-pointer behavior and reduced-motion handling were exercised in automated tests; responsive layout and mouse/keyboard interactions were checked in Chrome, not on a physical phone. The impeccable detector did not run because its external engine cache could not initialize; screenshots and source received a separate bounded review.
