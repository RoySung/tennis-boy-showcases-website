# Character asset generation

Reusable image-generation prompts for the character showcase. These are documentation templates, not a required model/API integration or an automated generation pipeline.

## Files

- `character-asset-template.md`: reusable English prompt; replace every placeholder before use.
- `tennis-boy-standing.md`: current character settings, angle convention, reference roles, and a ready-to-use prompt.

## Workflow

1. Define character identity separately from pose and camera angle. Start a new character with an approved reference sheet and front asset.
2. Generate and approve one master pose. For Tennis Boy standing, use the current 0° PNG as the master.
3. Attach the reference sheet, master asset, and relevant neighboring views to each generation. Keep the same model and tool settings where possible.
4. Generate one angle per PNG. Batch requests must explicitly request separate files, never a contact sheet.
5. Verify real alpha, framing, identity, pose and edges before importing. A checkerboard preview is not proof of transparency.
6. Rename the accepted PNG, add its angle in `src/character.ts`, and record source/format metadata in `docs/turntable-assets.json`.

## Tool settings versus prompt requests

If the image tool exposes these controls, set them explicitly:

| Setting | Target |
| --- | --- |
| Format | PNG |
| Background | Transparent |
| Canvas | Square; match the master |
| Output | One independent image per requested angle |
| Reference images | Original sheet + approved pose master + neighboring views |
| Model/settings | Keep consistent within the asset set; record actual values |

A prompt cannot force an unsupported alpha channel, exact dimensions, exact yaw, or pixel-perfect alignment. The earlier built-in image-generation attempts produced RGB checkerboard images and were rejected. Current production assets were supplied by the user; their exact generating model, seed, and tool settings are unknown. Do not treat these templates as a reproducible record of their original generation.

## Validation before import

- PNG with RGBA and actual alpha=0 outside the character.
- Opaque white logos/soles; transparent gaps between body parts.
- No floor, backdrop, baked-in ground shadow, or painted checkerboard.
- No white fringe, colored spill or stray pixels; inspect on light and dark backgrounds.
- Same pose proportions, body axis, cap-top height and shoe baseline across views.
- Correct directional order. File angle is intended yaw; inspect the result rather than assuming compliance.
- Review the full loop, especially the last frame returning to front.

## Other characters

Replace identity details and reference assets, not just the character name. Explicitly define anatomy/proportions, face, hair, outfit, accessories, materials, logos and rendering style. Approve a new master before generating a turntable. Remove Tennis Boy-specific constraints when they do not apply.

## Other poses and actions

For a static pose (sitting, holding a racket, ready stance), generate one approved pose master first. Then keep that pose fixed while changing only yaw. Define a suitable anchor: pelvis/seat for sitting, support foot for a lunge, or a stable root for airborne poses. Do not force a bent or seated pose to have the standing character's silhouette height; preserve character scale instead.

For animated actions, angle and time are separate dimensions. Specify action name, phase/frame, camera yaw, root motion, limb positions, prop contact and loop endpoints. First approve the pose sequence at one camera angle. Independent images are not guaranteed temporally consistent or seamless; prompts alone do not provide skeletal animation or in-between frames.

Naming examples for future assets:

- Static: `<character>-<pose>-<yaw:03d>.png`
- Action: `<character>-<action>-<yaw:03d>-frame-<index:03d>.png`

Existing Tennis Boy assets retain their current `tennis-boy-NNN-direction.png` names.

## Record each accepted generation

Keep a record alongside the asset set:

```text
Character / pose:
Output filename:
Intended angle / action phase:
Reference filenames:
Exact prompt:
Tool and model (if known):
Tool settings / seed (if exposed):
Generation date:
Original output dimensions / color mode:
Postprocessing (if any):
Alpha / alignment / visual inspection notes:
```


## Tennis Boy walking at 36° — sixteen white frames

The latest [gait refinement](tennis-boy-walking-gait-refinement.json) replaces frames 005, 006, 011–014 and 016 with local built-in imagegen edits. Its selected attempt IDs identify the actual imported PNGs; other attempts were rejected or used only as intermediate references. It reduces discontinuous support-foot motion, pairs the passing/low-swing phases and adjusts the final pre-contact body height. Run `npm run verify:gait` and review both full- and half-speed loops. The [asset manifest](../walking-assets.json) is authoritative for current files and checksums; older generation records below are provenance.

The current action convention is `tennis-boy-036-walking-NNN.png` in `public/character/walking/036/`, numbered 001–016. The [current prompt record](tennis-boy-walking-036.json) preserves generation calls, endpoint references, selected sources and revised playback order. The [previous eight-frame prompts](tennis-boy-walking-036-8-keyframes.json) remain as provenance; their indices are not the current playback order.

The update adds eight intermediate poses and replaces both up poses; six original images are retained, including the former down poses rephased as weight acceptance. Direct built-in image-model edits introduce articulated pelvis/torso/head rise and fall while maintaining support-foot locations. Generated outputs are inspected and measured because numeric position requests are not reliably obeyed. Excessive crouches, high knees and incorrect height candidates are not imported.

Generate one independent 1254 × 1254 PNG per call. Request a plain opaque white background, fixed camera/scale, empty hands and no shadow. Transparency checks elsewhere in this document apply to standing assets, not this white-background walking version. Keep raw model pixels and record any near-white variation.

At 16 fps, contact/acceptance/down/rise/passing/swing/up/pre-contact for each side forms a one-second cycle. Inspect limb continuity, head/neck connection and 016→001 at normal and half speed. Update checksums and run `npm run verify:assets` after replacement. Historical September 11 logs and the eight-frame sequence are superseded and must not be resumed as current work.
