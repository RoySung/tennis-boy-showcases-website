# Reusable single-asset prompt

Replace all `{{PLACEHOLDERS}}`. Omit action-specific instructions for a static pose. Attach the actual references named below.

```text
TASK
Create ONE isolated, full-body asset of {{CHARACTER_NAME}}.
Output filename: {{OUTPUT_FILENAME}}.
Purpose: {{STATIC_TURNTABLE_OR_ACTION_FRAME}}.

REFERENCE ROLES
{{IDENTITY_REFERENCE}} defines identity, proportions, outfit and materials.
{{POSE_MASTER_REFERENCE}} defines the approved pose, scale and framing.
{{NEIGHBOR_REFERENCES}} define adjacent angles or action phases.
Do not copy labels, panels or backgrounds from reference images.

IDENTITY — KEEP FIXED
{{ANATOMY_AND_PROPORTIONS}}
{{FACE_HAIR_AND_DISTINCTIVE_FEATURES}}
{{CLOTHING_ACCESSORIES_AND_COLORS}}
{{MATERIALS_AND_RENDERING_STYLE}}
Preserve physical placement of logos and asymmetric details.
Do not mirror another view or relocate details to make them visible.
Do not add, remove or redesign features unless explicitly requested below.

POSE / ACTION
{{PRECISE_POSE_DESCRIPTION}}
{{ALLOWED_CHANGES_FOR_THIS_ASSET}}
For a static turntable, rotate the whole posed character as one object.
Keep limb positions, expression, stance and head orientation relative to
its torso unchanged. Do not make the head follow the camera.
For an action frame, follow the specified phase and root/prop anchors;
do not invent a different action or phase.

VIEW
Intended yaw: {{YAW_DEGREES}}.
{{PLAIN_LANGUAGE_VIEW_DESCRIPTION}}
Convention: 0° faces camera; 90° faces screen-left; 180° faces away;
270° faces screen-right; 360° returns to front.
Use natural occlusion. Do not force hidden eyes or accessories into view.

CAMERA AND ALIGNMENT
Use the same orthographic-style camera, elevation and scale as the master.
No camera orbit, zoom change, pitch, roll or wide-angle distortion.
Canvas: {{CANVAS_SIZE}}.
Alignment anchor: {{BODY_OR_ROOT_ANCHOR}}.
Vertical reference: {{BASELINE_OR_SUPPORT_ANCHOR}}.
Scale reference: {{MASTER_SCALE_REFERENCE}}.
Align the body/root axis, not the visible silhouette's bounding box.
Do not recenter to compensate for projecting features or accessories.
Do not distort body parts to satisfy framing.
Keep the complete subject and required props within transparent padding.

TRANSPARENCY AND EDGES
Output PNG with a real RGBA alpha channel.
Pixels outside the subject must have alpha = 0.
No painted checkerboard or white, gray, black or colored backdrop.
Keep white subject details opaque; preserve real gaps between body parts.
Clean antialiased silhouette, without fringe, halo, color spill or stray pixels.

LIGHTING
{{LIGHTING_REFERENCE}}
Keep light direction and exposure consistent relative to the camera.
Internal shading is allowed. No baked-in ground shadow or external cast
shadow, floor, platform, environment, scenery or reflections.

DELIVERY
Exactly ONE individual PNG containing ONE subject at the requested view
and pose/phase. No collage, grid, contact sheet, labels, captions or borders.
```

## Separate-file batch wrapper

Append this only when requesting multiple outputs, replacing the list:

```text
BATCH DELIVERY OVERRIDE
Produce one independent PNG for EACH entry below:
{{ANGLE_OR_PHASE_AND_FILENAME_LIST}}
Do not combine entries into a single canvas, sprite sheet or model sheet.
Do not regenerate these completed entries: {{EXCLUSION_LIST}}.
All outputs must share the approved identity, pose-specific scale,
camera settings and alignment anchors.
```
