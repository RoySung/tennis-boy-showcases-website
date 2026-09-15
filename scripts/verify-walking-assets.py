"""Validate the sixteen transparent walking frames. Requires Python 3 and Pillow."""
import hashlib
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'docs/walking-assets.json').read_text())
errors = []
valid = 0
count = 16
size = (1254, 1254)
expected = [f'public/character/walking/036/tennis-boy-036-walking-{i:03d}.png' for i in range(1, count + 1)]
if [frame['file'] for frame in manifest['frames']] != expected:
    errors.append('Manifest must list exactly 16 unique frames in playback order.')
if manifest['frameCount'] != count or manifest['fps'] != 16 or manifest['durationSeconds'] != 1 or tuple(manifest['canvas']) != size:
    errors.append('Expected sixteen 1254 × 1254 frames at 16 fps for one second.')
actual = {str(path.relative_to(root)) for path in (root / 'public/character/walking/036').glob('*.png')}
if actual != set(expected):
    errors.append('Walking directory must contain only the current sixteen PNGs.')
seen = set()
for index, frame in enumerate(manifest['frames']):
    path = root / frame['file']
    if frame['index'] != index + 1 or frame['phase'] != index / count:
        errors.append(f'{path.name}: incorrect index or phase')
    if not path.is_file():
        errors.append(f'Missing: {path.name}')
        continue
    try:
        with Image.open(path) as image:
            if image.format != 'PNG' or image.mode != 'RGBA' or image.size != size:
                errors.append(f'{path.name}: expected 1254 × 1254 RGBA PNG')
                continue
            alpha = image.getchannel('A')
            if alpha.getextrema() != (0, 255):
                errors.append(f'{path.name}: expected transparent background and opaque subject pixels')
                continue
            if frame.get('mode') != image.mode or tuple(frame.get('size', [])) != image.size:
                errors.append(f'{path.name}: metadata does not match image')
                continue
            width, height = size
            # The subject must not touch the edge and the complete perimeter must
            # stay transparent so frames sit cleanly on either theme.
            border = []
            for box in [(0, 0, width, 16), (0, height - 16, width, height),
                        (0, 16, 16, height - 16), (width - 16, 16, width, height - 16)]:
                border.extend(alpha.crop(box).get_flattened_data())
            if max(border) != 0:
                errors.append(f'{path.name}: expected a fully transparent 16-pixel perimeter')
                continue
            bbox = alpha.getbbox()
            if not bbox or bbox[0] <= 0 or bbox[1] <= 0 or bbox[2] >= width or bbox[3] >= height:
                errors.append(f'{path.name}: empty or clipped subject')
                continue
            digest = hashlib.sha256(image.tobytes()).hexdigest()
            if digest in seen:
                errors.append(f'{path.name}: duplicate image pixels')
                continue
            seen.add(digest)
        if hashlib.sha256(path.read_bytes()).hexdigest() != frame.get('sha256'):
            errors.append(f'{path.name}: update manifest checksum after replacement')
            continue
        valid += 1
    except Exception as error:
        errors.append(f'{path.name}: {error}')
print(f'{valid}/{count} walking keyframes pass PNG, dimensions, transparency, clipping, uniqueness and checksum checks.')
for error in errors:
    print(error)
print('Edge quality, preserved interior whites, identity, gait and seam require separate visual review.')
raise SystemExit(1 if errors or valid != count else 0)
