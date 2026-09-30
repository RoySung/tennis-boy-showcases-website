"""Generate runtime WebP assets from the preserved source PNGs. Requires Pillow."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CHARACTER_DIRS = (
    ROOT / 'public/character/turntable',
    ROOT / 'public/character/racket',
    ROOT / 'public/character/walking/036',
)
ENVIRONMENT_FILES = (
    ROOT / 'public/environment/tennis-center-backdrop-cloudless-v6.png',
    ROOT / 'public/environment/tennis-center-clouds-v2.png',
    ROOT / 'public/environment/tennis-center-lamp-v2.png',
    ROOT / 'public/environment/tennis-center-planter-v2.png',
    ROOT / 'public/environment/tennis-center-ball-v2.png',
)


def convert(source: Path, resize: bool) -> tuple[int, int]:
    with Image.open(source) as image:
        output = image.copy()
        if resize:
            output = output.resize((960, 960), Image.Resampling.LANCZOS)
        destination = source.with_suffix('.webp')
        output.save(destination, 'WEBP', quality=85, method=6, exact=True)
        return source.stat().st_size, destination.stat().st_size


sources = [path for directory in CHARACTER_DIRS for path in sorted(directory.glob('*.png'))]
sources.extend(ENVIRONMENT_FILES)
png_bytes = 0
webp_bytes = 0
for source in sources:
    source_size, output_size = convert(source, source.parent.name != 'environment')
    png_bytes += source_size
    webp_bytes += output_size

print(f'Generated {len(sources)} WebP assets: {png_bytes / 1048576:.2f} MiB -> {webp_bytes / 1048576:.2f} MiB')
