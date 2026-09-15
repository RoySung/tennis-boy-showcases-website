# Walking color consistency — 2026-09-14

Frames 006, 011, 012, 014 and 016 were replaced with reviewed built-in imagegen color-only edits. Frame 008 was rejected because its shirt became too dark. The selected generated PNGs were copied byte-for-byte; there is no runtime filter or pose interpolation.

| Frame | Shirt median RGB before → after | Cap top before → after | Support sole Y before → after |
| --- | --- | --- | --- |
| 006 | (35, 87, 173) → (18, 78, 201) | 58 → 58 | 1197 → 1197 |
| 011 | (36, 85, 184) → (10, 75, 200) | 87 → 87 | 1202 → 1202 |
| 012 | (33, 82, 183) → (22, 78, 193) | 68 → 69 | 1201 → 1201 |
| 014 | (36, 87, 185) → (8, 75, 213) | 56 → 56 | 1199 → 1199 |
| 016 | (0, 74, 224) → (16, 71, 192) | 49 → 48 | 1194 → 1194 |

The shirt medians use a fixed blue-pixel threshold in the central body region, sampled every four pixels. The silhouette disagreement between each source and its selected edit was 0.26–0.76% at quarter resolution using a dark-pixel threshold. These are rough pixel proxies, not exact pose identity or perceptual color scores. Visual review of the complete 4×4 sequence found no new obvious pose or identity change. Frame 011's skin median also moved from (250, 200, 171) to (248, 194, 164), reducing its warm brightness relative to adjacent frames.

Verification after replacement: `npm run verify:assets` 16/16 pass; `npm run verify:gait` passes all six proxy thresholds; `npm test` 15/15 pass; `npm run build` passes. Physical-device playback was not retested. Generator paths and SHA-256 hashes are recorded in `docs/walking-assets.json`.

## Neighbor refinement — 2026-09-15

Full-speed browser playback showed that 006 still had a darker, flatter cap than 005/007, while 016 remained dark at the 015→016→001 loop seam. Both frames were replaced with a second color/material-only pass. At quarter resolution, dark-pixel silhouette disagreement from their prior versions was about 0.21%; gait landmarks stayed within one pixel. Frame 006's cap median moved from (45, 49, 75) to (59, 62, 92). Frame 016's cap moved from (43, 42, 66) to (56, 56, 81), skin from (251, 185, 150) to (253, 192, 158), and shirt from (16, 71, 192) to (12, 76, 203). These fixed-threshold medians overstate some visible highlight changes, so the selections were based on the rendered animation at its normal display size as well as landmark and silhouette checks.

After review found that the two revised caps still had different surface character, frames 006 and 016 were regenerated once more using frame 001 as their shared cap-material reference. Both now use the same deep-navy matte treatment, restrained texture, seam contrast and broad soft highlight. Gait landmarks changed by at most one pixel from the preceding versions. At quarter resolution, cap-region dark-pixel silhouette disagreement was 0.53% for 006 and 0.17% for 016; outside-cap disagreement was 1.10% and 0.40% respectively. Visual review remains the deciding criterion because the threshold also responds to highlight and antialiasing changes.

Frame 006 was subsequently reviewed directly beside 005 and 007. The shared frame-001 reference still left 006 too dark and blue within that local transition. Its cap was replaced with a neighbor-matched version using 005 and 007 together: a gray-navy midpoint with broader diffuse crown lighting and lower-contrast fabric texture. Frame 016 remains unchanged from the preceding shared-reference pass.

Frames 008 and 015 received the same neighbor-matched cap treatment. Frame 008 now bridges 007/009 instead of showing a dark saturated crown; frame 015 bridges 014/016 with reduced cloudy highlight contrast. Cap top, shirt top and support-sole landmarks changed by at most one pixel, except frame 015 support-bottom X moved 1.2px. Pose, frame order and playback timing are unchanged.

Frame 006 was then reduced approximately 8–10% in perceived cap brightness after review found the neighbor-matched version too bright. The replacement retains its softened matte texture while moving the crown closer to frame 005's depth. Cap-top changed from y59 to y58; support sole and swing sole remained at y1198 and y1116.

Frame 008 was revised again using frame 007 as its sole cap-material reference rather than averaging 007 and 009. Its cap now follows 007's dark gray-navy tone, matte texture and crown-highlight width. Measured cap top, shirt top and support-sole Y were unchanged; support-bottom X changed by 0.1px.
