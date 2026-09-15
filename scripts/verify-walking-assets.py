"""Validate the sixteen white walking frames. Requires Python 3 and Pillow."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageChops

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
            if image.format != 'PNG' or image.mode not in ('RGB', 'RGBA') or image.size != size:
                errors.append(f'{path.name}: expected 1254 × 1254 RGB or opaque RGBA PNG')
                continue
            if image.mode == 'RGBA' and image.getchannel('A').getextrema() != (255, 255):
                errors.append(f'{path.name}: white version must be fully opaque')
                continue
            if frame.get('mode') != image.mode or tuple(frame.get('size', [])) != image.size:
                errors.append(f'{path.name}: metadata does not match image')
                continue
            rgb = image.convert('RGB')
            width, height = size
            # Model output is visually white, with small near-white pixel noise.
            # Check a 16-pixel perimeter, allowing 0.1% outliers but no colored backdrop.
            border = []
            for box in [(0, 0, width, 16), (0, height - 16, width, height),
                        (0, 16, 16, height - 16), (width - 16, 16, width, height - 16)]:
                patch = rgb.crop(box)
                border.extend(patch.getpixel((x, y)) for y in range(patch.height) for x in range(patch.width))
            white = sum(min(pixel) >= 245 and max(pixel) - min(pixel) <= 8 for pixel in border)
            if white / len(border) < 0.999:
                errors.append(f'{path.name}: expected a near-white neutral perimeter')
                continue
            red, green, blue = rgb.split()
            darkest = ImageChops.darker(ImageChops.darker(red, green), blue)
            bbox = darkest.point(lambda value: 255 if value < 235 else 0).getbbox()
            if not bbox or bbox[0] <= 0 or bbox[1] <= 0 or bbox[2] >= width or bbox[3] >= height:
                errors.append(f'{path.name}: empty or clipped subject')
                continue
            digest = hashlib.sha256(rgb.tobytes()).hexdigest()
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
print(f'{valid}/{count} walking keyframes pass PNG, dimensions, opacity, near-white border, clipping, uniqueness and checksum checks.')
for error in errors:
    print(error)
print('Exact #FFFFFF background, interior background, identity, gait and seam require separate review; this check permits model pixel noise.')
raise SystemExit(1 if errors or valid != count else 0)
