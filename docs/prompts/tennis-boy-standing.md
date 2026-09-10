# Tennis Boy 01. — Standing generation settings

This consolidates the prompts discussed during development. It is a reusable specification, not the exact provenance of the user-generated PNGs.

## Current references

- Identity: original user-supplied multi-view Tennis Boy sheet. It is not stored in this repository; attach it from your source archive when available.
- Pose master: `public/character/turntable/tennis-boy-000-front.png`.
- Neighbor views: choose the nearest relevant files from `public/character/turntable/`.
- Current source/filename mapping: `docs/turntable-assets.json`.

## Canvas and angle settings

Current accepted assets are **1254 × 1254 RGBA PNGs**. Match their master framing when extending this set. Earlier prompts proposed 2048 × 2048 with cap top y=164, shoe baseline y=1884 and axis x=1024; those were requested targets, not verified coordinates of the accepted assets. Do not mix those absolute coordinates into the current 1254px set.

Use 0° for front, rotate toward screen-left to 90°, back at 180°, screen-right at 270°, front again at 360°. Angles are intended/estimated orientation, not measured camera metadata.

| Current yaw | Orientation |
| --- | --- |
| 0 | Front |
| 36 | Front-left |
| 60 | Front-left oblique |
| 90 | Left profile |
| 108 | Rear-left oblique |
| 144 | Rear-left |
| 180 | Back |
| 216 | Rear-right |
| 252 | Rear-right oblique |
| 288 | Front-right oblique |
| 324 | Front-right |

The current set has eleven non-uniformly spaced views. The earlier 10-view plan used 36° increments; the accepted set differs. Do not generate an extra 360° duplicate. No new angle is requested by this document.

## Ready-to-use prompt: 324° example

Attach the identity sheet, approved 0° image and 288° image. **324° already exists**; this example is for revision or adaptation, not an instruction to regenerate it.

```text
Create ONE additional or revised frame of Tennis Boy 01 in the existing
standing turntable. Output filename: tennis-boy-324-front-right.png.

REFERENCE ROLES
Original character sheet: identity, outfit and physical detail placement.
Approved 0° image: master proportions, standing pose, scale and alignment.
Approved 288° image: right-facing side details and neighboring orientation.

TARGET VIEW — 324°
Generate a front three-quarter view facing toward SCREEN-RIGHT.
0° faces the camera; 90° faces screen-left; 180° faces away;
270° faces screen-right; 324° is 36° from front toward screen-right.
This image belongs between the supplied 288° frame and the 0° front frame.
It must be more front-facing than 288°. Both eyes should be visible with
natural foreshortening. The nose and brim point slightly toward screen-right.
Do not generate a left-facing view, mirror a frame, or repeat 288° or 0°.

CHARACTER CONSISTENCY
Preserve the exact chibi body proportions and head-to-body ratio.
Preserve the face, black oval eyes, peach skin and black hairstyle.
Keep the navy baseball cap, brim shape, rear opening, strap and existing
logo placement. Logos remain attached to their original physical locations;
only show details naturally visible from this angle.
Keep the royal-blue T-shirt, black shorts, black wristbands, navy socks,
and navy-and-white sneakers. White soles and logos must remain opaque.
Match the soft premium 3D-rendered collectible materials and style.
Do not redesign, recolor, add accessories or move logos.

FIXED STANDING POSE
Relaxed standing, arms naturally resting at the sides.
Rotate head, torso, arms, pelvis, legs and feet together as one object.
Do not turn the head independently or change expression, stance,
hand position or relative limb positions. No racket or ball.

CAMERA AND ALIGNMENT
Use the same orthographic-style camera as the supplied frames.
Keep elevation, framing and scale unchanged. No camera pitch, roll or zoom.
Use a 1254 × 1254 square canvas if supported; otherwise preserve the same
proportional framing on a square canvas for subsequent size normalization.
Use the approved 0° image as the alignment master:
match cap-top height, lowest shoe-sole baseline and overall character height.
Keep the pelvis/body rotation axis at the same horizontal coordinate.
Align the BODY AXIS, not the center of the silhouette or bounding box.
Do not shift the body to compensate for projecting brim, nose, hands or shoes.
Do not stretch body parts. Show the entire cap and both shoes with padding.

TRUE TRANSPARENCY
PNG with a real RGBA alpha channel. Outside the character, alpha must be 0.
No painted checkerboard, white, gray, black or colored background.
Keep white details opaque and preserve gaps between arms/torso and legs.
Clean antialiased edges without white fringe, gray halo, colored spill
or stray pixels. Preserve hair tips, fingers and shoe details.

LIGHTING
Match existing lighting direction, exposure, softness and material response.
Internal shading is allowed. No baked-in ground shadow, external cast
shadow, floor, platform, environment, scenery or reflections.

DELIVERY
Exactly ONE individual PNG containing ONE full-body standing character
at 324°. No collage, multiple views, labels, captions, borders or decoration.
```

## Adapting the example

- Change the output filename, numeric yaw, directional description and neighbors together.
- For back views, require the rear cap opening/strap and prohibit visible eyes.
- For near-profile views, allow the far eye to disappear naturally.
- For a different standing outfit, approve a revised front master and apply the same change across every view.
- For another pose, use `character-asset-template.md`; replace the standing constraints and establish a new pose master. Keep the character's physical scale rather than forcing all poses to standing height.
