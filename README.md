# Tennis Boy 01. — Standing

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

The build checks TypeScript and creates `dist/`. There is currently no test suite or test dependency.

## Project structure

```text
src/
  main.tsx                   React entry point
  App.tsx                    Showcase UI, pointer input and rotation loop
  character.ts               Ordered view assets and angle helpers
  style.css                  Responsive layout and frame compositing
public/character/turntable/   Eleven original transparent PNG assets
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
- A separate CSS shadow grounds the character. Loading and error states are handled in the viewer.

## Asset maintenance

Configure views in `src/character.ts`, sorted by increasing angle. Filenames follow `tennis-boy-NNN-direction.png`.

Current angles: **0, 36, 60, 90, 108, 144, 180, 216, 252, 288, 324**.

All eleven supplied files are preserved as 1254 × 1254 RGBA PNGs with genuine transparency. Source mappings are recorded in `docs/turntable-assets.json`. To add or replace a view, update the image, configuration, and metadata together. Keep the same body axis, character scale, and shoe baseline.

Angles are visual estimates rather than measured camera yaw. This is a frame-based 2.5D preview, not a 3D model or geometric interpolation. Source pose, alignment, and edge differences can remain visible during rotation. No physical-device frame-rate guarantee is made.

## Reusable generation prompts

See [Character asset generation](docs/prompts/README.md) for tool settings, validation and reuse guidance, [the generic prompt template](docs/prompts/character-asset-template.md) for other characters/poses, and [Tennis Boy standing settings](docs/prompts/tennis-boy-standing.md) for the current references, angle conventions and a complete 324° example.
