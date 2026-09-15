# Sixteen-frame walking validation — 2026-09-13

The latest five-frame color-consistency pass and its fresh verification are recorded in [walking-color-consistency-2026-09-14.md](walking-color-consistency-2026-09-14.md). The measurements below describe the earlier gait-refinement state.

## Latest: support stability and paired gait refinement

Replaced **005, 006, 011, 012, 013, 014 and 016** with reviewed built-in imagegen outputs; retained the other nine frames. All selected PNGs are copied byte-for-byte without pixel processing. The player remains a single-image canvas at 16 fps, with the same one-second, two-step cycle and controls.

The previous sequence showed abrupt support-foot movement after passing, a floating outsole in 011/012, unequal passing/forward-swing knee lift, and a large final body-height change. The revisions bring the support shoes closer under the hips during passing/early swing, lower the floating support soles, reduce the high passing knee and pair the low forward-swing phases. Frame 016 bridges the up pose back toward contact with a more gradual body descent.

Read-only measurements on the old and selected images, using the same fixed pixel masks:

| Pixel proxy | Before | After |
| --- | ---: | ---: |
| Largest stance-to-stance outsole horizontal step | 165.1 px | 109.6 px |
| Largest stance-to-stance outsole vertical step | 25 px | 10 px |
| Largest paired cap-top difference, frames eight apart | 16 px | 8 px |
| Largest paired blue-shirt-top difference | 13 px | 7 px |
| Forward-swing shoe-bottom difference, 006 versus 014 | 51 px | 14 px |
| Largest adjacent cap-top change, including wrap | 29 px | 24 px |

`npm run verify:gait` failed on the pre-change assets and passes on the selected set. Its search regions are specific to this framing and pose order. Outsole-bottom means and color thresholds are approximate image proxies: changes in shoe tilt, occlusion and perspective influence them. Contact transfers are excluded from stance deltas. This is improved continuity, not exact physical foot locking or a mathematically mirrored gait. Review both half-cycles and the wrap visually after future asset changes.

Current verification:

- `npm test`: **15/15 pass**.
- `npm run build`: TypeScript and Vite pass.
- `npm run verify:assets`: **16/16 pass**, including dimensions, opacity, near-white perimeter, uniqueness and manifest checksums.
- `npm run verify:gait`: all six discontinuity/paired-phase thresholds pass.
- Chromium at **1440 × 900** and **390 × 844** mobile emulation, both themes: all sixteen frames play in order and wrap repeatedly; keyboard stepping, mode preservation, standing mouse/touch drag, reduced-motion start, explicit playback and actual image-failure retry pass; no page exceptions.
- Half speed: **1988.9 ms** between measured wraps, within the two-second timing tolerance; actual canvas cap positions match all sixteen current manifest entries.
- Inspected the regenerated full sequence overview and desktop/mobile screenshots. The support and low-swing corrections are visible in the selected frames, with no new framing or UI overlap. Nine unchanged frames preserve the surrounding poses and both contact endpoints.
- All **11 standing PNGs** match the pre-task Git index byte checksums.

Evidence: [before/after measurements](walking-gait-refinement.json), [exact prompts and attempt selections](../prompts/tennis-boy-walking-gait-refinement.json), [current sequence overview](walking-keyframes.png), [browser checks](walking-browser-checks.json), [half-speed canvas check](walking-half-speed-check.json), [standing checksums](walking-gait-standing-checksums.json).

The sections below describe the earlier sixteen-frame expansion and frame-012 revision. Their historical numeric observations are retained for provenance; the current measurements and selected source mappings are above and in `walking-assets.json`.

## Historical: initial sixteen-frame delivery

Sixteen 1254 × 1254 RGB PNGs at 16 fps, one second per two-step cycle. Expanded the eight-frame prototype with eight added poses and two revised up poses generated directly using the built-in image model; six original images remain. Former down poses are rephased as weight acceptance, followed by the newly generated lower poses. The previous eight-frame prompt record is retained as provenance and marked superseded.

Head, neck, shoulders and pelvis move together within the artwork; knees and ankles articulate to accommodate the rise/fall. The player does not translate, scale, warp or crossfade images. Images are copied byte-for-byte from original model outputs. All eleven standing PNGs match their pre-change checksums.

## Head and body evidence

The original eight-frame cap-top positions were `65, 79, 65, 65, 65, 71, 65, 65`: six frames held the head at the same height. The revised sixteen-frame sequence is `65, 79, 86, 70, 65, 42, 36, 45, 65, 71, 87, 68, 65, 56, 32, 62`.

Read-only color-threshold landmark measurements on the source PNGs show:

- Cap-top travel: **55 px**, compared with **14 px** before.
- Blue-shirt collar/top travel: **51 px**.
- Head/torso height correlation: **0.979**, indicating coupled movement instead of an independently fixed head.
- Largest adjacent cap change: **30 px**; largest adjacent shirt change: **23 px**, including the wrap.

These are image measurements, not anatomical motion capture. Grounded-shoe and perspective differences remain a visual judgment. The selected poses preserve full-body framing and the same fixed left-front camera. Overly deep crouches, extreme high-knee attempts and incorrect height candidates were rejected; exact calls, outputs and selected frame mappings are recorded in the prompt file.

## Automated verification

- `npm test`: **15/15 pass**, updated for sixteen-frame decoding, 16 fps timing and one-second wrap. Includes stepping, speed, visibility, state preservation, reduced motion, load/decode/size errors, cancellation, keyboard, scrubber, Strict Mode and timeout.
- `npm run verify:assets`: **16/16 pass** PNG, dimensions, opacity, near-white perimeter, unclipped bounds, unique pixels and checksums. Directory contains exactly sixteen frames.
- `npm run build`: TypeScript and Vite production build pass.

## Browser and visual review

Actual local Chromium at **1440 × 900** desktop and **390 × 844** mobile emulation, both themes:

- Normal-speed sampling over 3.2 seconds sees all sixteen frames in order and at least three wraps on each viewport, with no console exceptions.
- Keyboard Home/Left/Right and last-to-first wrap work; changing modes preserves position and pauses.
- Actual frame-016 network failure disables playback. Retry successfully loads the full set.
- Reduced-motion starts paused; explicit Play works.
- Standing mouse and emulated touch drag still rotate the character; standing sources are unchanged.
- White canvas remains square, fits its viewport and does not overlap controls; desktop 509 × 509, mobile 342 × 342. No Motion pedestal or ground shadow.
- Inspected all selected source images, the 4 × 4 pose overview, desktop and mobile screenshots. The head/torso visibly rise in each up phase and settle on acceptance. Added poses bridge support/passing/reach/contact; 016 and 001 keep the same near-left forward leg and matching arm phase at the seam.

A separate half-speed browser check records a two-second cycle and checks the cap-top positions from the actual canvas pixels against the current asset manifest, ensuring the newly imported frames are rendered rather than a cached earlier sequence. See its JSON evidence below.

## Evidence

- [16-frame overview](walking-keyframes.png)
- [Desktop light](motion-desktop-light.png) / [dark](motion-desktop-dark.png)
- [Mobile light](motion-mobile-light.png) / [dark](motion-mobile-dark.png)
- [Browser measurements and observed order](walking-browser-checks.json)
- [Half-speed timing and rendered cap positions](walking-half-speed-check.json)
- [Head/torso landmark measurements](walking-body-motion.json)
- [Current prompts, all attempts and selections](../prompts/tennis-boy-walking-036.json)
- [Previous eight-frame prompts](../prompts/tennis-boy-walking-036-8-keyframes.json)
- [Current asset manifest](../walking-assets.json)

## Limits

Model output backgrounds are visually white with small near-white pixel variations, not guaranteed exact #FFFFFF. No background removal or pixel processing was applied. Independent generative poses retain minor drawing, stride and support-foot differences; this is a sixteen-frame refinement, not skeletal or physically exact motion. Mobile checks are emulated, not physical-device testing. Numeric landmark and timing checks support the review but do not certify a perfectly smooth gait.

## Frame 12 transition refinement

The user identified a large 011→012 jump. Old frame 012 was already close to frame 013: the near arm had reversed behind the body, the torso had turned, and the airborne leg was almost in passing. Frame 012 was regenerated from 011 and refined locally through the built-in image model. The near hand now returns beside the hip before swinging backward; the airborne knee advances under the pelvis before the forward passing pose in 013. Frames 011 and 013, frame count and playback speed remain unchanged.

The body-region mean absolute RGB change for 011→012 and 012→013 went from 53.48 / 21.44 to 39.53 / 44.90. This is a rough comparison proxy, not a perceptual smoothness score; the revised triplet was also visually inspected. See [before/after sequence](walking-11-13-comparison.png) and [revision measurements](walking-frame12-refinement.json).
