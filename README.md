# Tennis Boy 01. — Character Showcase

Minimal English character showcase built with React, TypeScript, and Vite. Created by RoySung.

## Development

```sh
npm install
npm run dev -- --port 5188 --strictPort
```

Open http://localhost:5188. To preview on a phone on the same network, use the Network URL printed by Vite.

```sh
npm run build
npm run preview
```

The build checks TypeScript and creates `dist/`. `npm test` runs focused tests with the Node.js test runner, tsx and jsdom (Node.js 22.13+). `npm run verify:assets` checks the full walking PNG set using Python 3 and Pillow; install Pillow with `python3 -m pip install Pillow` if needed. `npm run verify:gait` checks fixed image proxies for support-foot jumps and paired left/right body and swing heights. These regression checks supplement visual review; they are not anatomical tracking.

## Project structure

```text
src/
  main.tsx                   React entry point
  App.tsx                    Shared title and mode tabs
  CourtBackdrop.tsx          Shared panorama, clouds and atmosphere
  StageForeground.tsx        Floodlights, planters and bouncing ball
  environment.ts            Scene timing and ball-pattern helpers
  StandingViewer.tsx          Standing views, pointer input and rotation loop
  MotionViewer.tsx            Decoded-frame loading and motion playback
  walking.ts                 Motion configuration and fractional-frame clock
  character.ts               Ordered view assets and angle helpers
  style.css                  Responsive layout and frame compositing
public/character/turntable/   Eleven original transparent PNG assets
public/character/walking/036/ Sixteen transparent walking frames
public/environment/           Shared scene artwork and source reference
docs/environment-assets-v2.json Environment asset provenance and checksums
docs/walking-assets.json      Walking frame order, provenance, checksums and status
tests/motion.test.tsx         Playback, loading and mode-switch regression tests
docs/turntable-assets.json    Filename, angle, source and alpha metadata
index.html                   Page metadata and mount point
vite.config.ts               Vite React configuration
tsconfig.json                TypeScript configuration
PRODUCT.md                   Product scope and principles
DESIGN.md                    Visual direction
```

## Current behavior

- Mouse, touch and pen drag rotate through the full circle, in either direction.
- Front, Left, Back and Right shortcuts use shortest-path rotation. The Right shortcut uses the supplied 288° frame.
- Keyboard arrows and the native angle slider control rotation; Home/End and Reset return to front.
- Auto rotate defaults off and completes a turn in approximately 3 seconds. Drag temporarily pauses automatic advance; release resumes it. Hidden tabs suspend playback.
- Time-based easing and angle-driven smoothstep blending connect adjacent frames, including the wrap to front.
- Isolated `plus-lighter` compositing prevents background leakage through overlapping opaque regions during crossfades.
- Reduced-motion preferences disable easing and dissolves. Auto rotation requires explicit activation.
- Both viewers share a fixed warm-daylight tennis-center scene. Standing keeps the panorama still; Motion scrolls it with playback speed.
- Clouds, floodlights, planters and the bouncing tennis ball are separate layers. Reduced-motion preferences keep the environment still.
- Loading and error states are handled in the viewers.

## Asset maintenance

Configure views in `src/character.ts`, sorted by increasing angle. Filenames follow `tennis-boy-NNN-direction.png`.

Current angles: **0, 36, 60, 90, 108, 144, 180, 216, 252, 288, 324**.

All eleven supplied files are preserved as 1254 × 1254 RGBA PNGs with genuine transparency. Source mappings are recorded in `docs/turntable-assets.json`. To add or replace a view, update the image, configuration, and metadata together. Keep the same body axis, character scale, and shoe baseline.

Angles are visual estimates rather than measured camera yaw. This is a frame-based 2.5D preview, not a 3D model or geometric interpolation. Source pose, alignment, and edge differences can remain visible during rotation. No physical-device frame-rate guarantee is made.

## Reusable generation prompts

See [Character asset generation](docs/prompts/README.md) for tool settings, validation and reuse guidance, [the generic prompt template](docs/prompts/character-asset-template.md) for other characters/poses, and [Tennis Boy standing settings](docs/prompts/tennis-boy-standing.md) for the current references, angle conventions and a complete 324° example.


## Motion — sixteen frames with body motion

Switch from **360° View** to **Motion** to play the 36° walk in place: sixteen PNGs at 16 fps, one second per two-step cycle. Following the expansion from eight poses, seven frames were locally refined to reduce support-foot jumps and bring left/right passing, forward swing and body rhythm closer together. Nine frames from the previous sixteen-frame set remain.

Head, neck and torso rise and fall together in the artwork as the knees and ankles articulate. The player draws one transparent image at a time, without whole-sprite bobbing, warping or crossfading. The canvas uses the shared tennis-center scene without a pedestal or contact shadow. Background-extraction masks remove the near-white backdrop while preserving the original character RGB pixels.

Controls include play/pause, previous/next frame, a scrubber and 0.5×/1×/1.5× speed. Space and arrows work with the stage focused. Reduced-motion starts paused. Mode switches preserve position and stop playback; hidden tabs do not accumulate animation time.

[Gait refinement prompts](docs/prompts/tennis-boy-walking-gait-refinement.json) record the latest calls, rejected corrections and selected sources; [expansion prompts](docs/prompts/tennis-boy-walking-036.json) preserve the earlier sixteen-frame generation. [Asset metadata](docs/walking-assets.json) records order, phases, measurements and checksums. [Validation](docs/qa/walking-validation.md) and [16-frame overview](docs/qa/walking-keyframes.png) show the current result. The earlier eight-frame prompt set is retained for provenance and marked superseded.
