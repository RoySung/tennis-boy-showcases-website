"""Read-only pixel proxies for the fixed 1254px walking assets; requires Pillow.

These checks detect the observed jumps, not anatomical correctness. Screen-space
shoe ROIs were visually identified for this cycle. Contact frames are excluded
from stance deltas because weight switches feet and heel roll changes the outline.
Review the animation after any change to framing, perspective or pose ordering.
"""
import argparse
import json
from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]


def measure(path, index):
    with Image.open(path) as image:
        if image.size != (1254, 1254):
            raise ValueError(f'{path.name}: expected a 1254px square')
        pixels = image.convert('RGB').load()
    cap = min(y for y in range(20, 150) for x in range(400, 800)
              if max(pixels[x, y]) < 150)
    shirt = min(y for y in range(450, 650) for x in range(450, 750)
                if (lambda r, g, b: b > 90 and b > r * 1.6 and b > g * 1.2)(*pixels[x, y]))
    side = 'left' if index in (1, 2, 3, 4, 5, 10, 11, 12, 13) else 'right'
    x_range = (250, 680) if side == 'left' else (620, 950)
    sole = [(x, y) for y in range(1120, 1235) for x in range(*x_range)
            if max(pixels[x, y]) < 165]
    bottom = max(y for x, y in sole)
    low_x = [x for x, y in sole if y >= bottom - 7]
    result = {
        'index': index, 'capTop': cap, 'shirtTop': shirt,
        'supportScreenSide': side, 'supportSoleY': bottom,
        'supportBottomX': round(sum(low_x) / len(low_x), 1),
    }
    if index in (6, 14):
        result['swingSoleY'] = max(y for y in range(950, 1180) for x in range(250, 595)
                                     if max(pixels[x, y]) < 165)
    return result


def analyze(directory):
    frames = [measure(directory / f'tennis-boy-036-walking-{i:03d}.png', i)
              for i in range(1, 17)]
    # 002->008 and 010->016: the same support foot advances through each stance.
    transitions = [(frames[i - 1], frames[i]) for i in (*range(2, 8), *range(10, 16))]
    summary = {
        'maxStanceHorizontalStep': round(max(abs(b['supportBottomX'] - a['supportBottomX'])
                                            for a, b in transitions), 1),
        'maxStanceVerticalStep': max(abs(b['supportSoleY'] - a['supportSoleY']) for a, b in transitions),
        'maxPairedCapDifference': max(abs(frames[i]['capTop'] - frames[i + 8]['capTop']) for i in range(8)),
        'maxPairedShirtDifference': max(abs(frames[i]['shirtTop'] - frames[i + 8]['shirtTop']) for i in range(8)),
        'forwardSwingSoleDifference': abs(frames[5]['swingSoleY'] - frames[13]['swingSoleY']),
        'maxAdjacentCapStep': max(abs(frames[i]['capTop'] - frames[(i + 1) % 16]['capTop']) for i in range(16)),
    }
    limits = {
        'maxStanceHorizontalStep': 115, 'maxStanceVerticalStep': 12,
        'maxPairedCapDifference': 10, 'maxPairedShirtDifference': 10,
        'forwardSwingSoleDifference': 20, 'maxAdjacentCapStep': 25,
    }
    errors = [f'{name}: {summary[name]}px exceeds {limit}px' for name, limit in limits.items()
              if summary[name] > limit]
    return {'method': 'Fixed screen-space dark-outsole and cap / blue-shirt pixel proxies; not anatomical tracking.',
            'frames': frames, 'summary': summary, 'limitsPixels': limits, 'errors': errors}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', nargs='?', type=Path, default=ROOT / 'public/character/walking/036')
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()
    report = analyze(args.directory)
    if args.json:
        print(json.dumps(report, indent=2))
    else:
        for name, value in report['summary'].items():
            print(f'{name}: {value}px (limit {report["limitsPixels"][name]}px)')
        print('FAIL' if report['errors'] else 'PASS: walking gait pixel proxies; visual review still required.')
    raise SystemExit(1 if report['errors'] else 0)
