# Product

## Register
brand

## Users
Character creators reviewing the visual viability of a 2.5D character, its standing views and walking motion on phones and desktop.

## Product Purpose
A focused, directly manipulable proof of concept, based on the supplied Tennis Boy sheet. Success is convincing restrained depth, consistent identity, and reliable touch drag.

## Brand Personality
Quiet, playful, precise. Japanese collectible display, with the character taking precedence.

## Anti-references
Full marketing sites, tennis courts, particles, noisy dashboards, true 3D modeling, skeletal animation.

## Design Principles
- Keep the supplied character's identity.
- Touch interaction comes first.
- Separate standing and Motion character assets from the environment; both use transparent keyframes.
- Use the eleven supplied transparent views for a focused 360-degree standing showcase.
- Separate 360° View and Motion within the same exhibit. Motion locks the camera at the existing 36° left-front view and plays a natural, empty-handed walk in place.
- Use sixteen transparent PNG frames at 16 fps, covering two alternating steps in one second. Head, neck and torso follow the weight transfer: descend during acceptance and rise before the next contact. Preserve a relaxed gait and near-ground support feet.

## Accessibility & Inclusion
Keyboard view controls and range input; visible focus; reduced-motion support; meaningful image descriptions. Accessibility choices are implementation defaults.

## Current delivery status
Motion plays sixteen transparent 1254 × 1254 frames at 16 fps. The earlier gait refinement revised seven poses to reduce abrupt support-foot travel, align left/right low-swing poses and soften the final pre-contact body transition. A subsequent color-consistency pass replaced frames 006, 011, 012, 014 and 016 with closely matched color edits. Head and torso rise and fall together in the artwork. No runtime image translation, warping or crossfading is used. Background-extraction masks remove the near-white backdrop while the original character RGB pixels remain intact. See `docs/walking-assets.json` for provenance and `docs/qa/walking-color-consistency-2026-09-14.md` for the latest verification.
