import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { characterViews } from '../src/character';
import { racketViews } from '../src/racket';
import { advanceFrames, walking, wrapFrame } from '../src/walking';

const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', { url: 'http://localhost' });
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document,
  HTMLElement: dom.window.HTMLElement, Event: dom.window.Event,
  innerWidth: 1200, innerHeight: 800,
  IS_REACT_ACT_ENVIRONMENT: true,
});
let hidden = false;
Object.defineProperty(document, 'hidden', { get: () => hidden, configurable: true });
let reduced = false;
const media = new dom.window.EventTarget();
const preference = Object.assign(media, { get matches() { return reduced; } });
Object.defineProperty(preference, 'matches', { get: () => reduced });
Object.assign(globalThis, { matchMedia: () => preference });
let nextRequest = 0;
const requests = new Map<number, FrameRequestCallback>();
Object.assign(globalThis, {
  requestAnimationFrame: (callback: FrameRequestCallback) => { requests.set(++nextRequest, callback); return nextRequest; },
  cancelAnimationFrame: (id: number) => requests.delete(id),
});
let draws: unknown[] = [];
dom.window.HTMLCanvasElement.prototype.getContext = (() => ({ clearRect() {}, drawImage(image: unknown) { draws.push(image); } })) as never;
let pending: MockImage[] = [];
class MockImage {
  onload: (() => Promise<void>) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = walking.width;
  naturalHeight = walking.height;
  url = '';
  decode = () => Promise.resolve();
  set src(value: string) { this.url = value; if (value) pending.push(this); }
  get src() { return this.url; }
}
Object.assign(globalThis, { Image: MockImage });
const { createRoot } = await import('react-dom/client');
const { default: MotionViewer } = await import('../src/MotionViewer');
const { default: App } = await import('../src/App');
const { nextBallPattern } = await import('../src/environment');
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
  root = createRoot(document.getElementById('root')!);
  hidden = false; reduced = false; pending = []; draws = []; requests.clear();
});
afterEach(async () => { await act(async () => root.unmount()); assert.equal(requests.size, 0, 'No orphan animation callbacks after unmount'); });
const render = async (active = true) => { await act(async () => root.render(<MotionViewer active={active}/>)); };
const decodeAll = async (list = pending.slice()) => { await act(async () => { await Promise.all(list.map(image => image.onload?.())); }); };
const tick = async (time: number) => { await act(async () => { const callbacks = [...requests.values()]; requests.clear(); callbacks.forEach(callback => callback(time)); }); };
const button = (label: string) => {
  const element = [...document.querySelectorAll<HTMLButtonElement>('button')].find(item => item.getAttribute('aria-label') === label || item.textContent === label);
  assert.ok(element, `Button ${label} exists`); return element;
};
const click = async (label: string) => { await act(async () => button(label).click()); };
const frame = () => Number((document.getElementById('motion-frame') as HTMLInputElement).value);
const visibility = async (value: boolean) => { await act(async () => { hidden = value; document.dispatchEvent(new Event('visibilitychange')); }); };

test('clock uses elapsed time, supports fractional speed and wraps both directions', () => {
  assert.equal(advanceFrames(0, 250, 16, 1, 16), 4);
  assert.equal(advanceFrames(0, 1000, 16, 0.5, 16), 8);
  assert.equal(advanceFrames(0, 1000, 16, 1.5, 16), 8);
  assert.equal(advanceFrames(15, 1000 / 16, 16, 1, 16), 0);
  assert.equal(wrapFrame(-1, 16), 15);
  assert.equal(advanceFrames(7, -100, 16, 1, 16), 7);
  assert.equal(walking.fps, 16);
  assert.equal(walking.frames.length, 16);
  assert.equal(advanceFrames(0, 1000, walking.fps, 1, walking.frames.length), 0);
  assert.equal(new Set(walking.frames).size, 16);
});

test('public image paths respect the configured deployment base', async () => {
  const characterAssets = [...characterViews, ...racketViews].map(view => view.src);
  assert.ok([...characterAssets, ...walking.frames].every(src => !src.startsWith('/')));
  assert.equal(walking.width, 960);
  assert.equal(walking.height, 960);
  assert.ok([...characterAssets, ...walking.frames].every(src => src.endsWith('.webp')));

  await act(async () => root.render(<App/>));
  const environmentAssets = [...document.querySelectorAll<HTMLImageElement>('.court-backdrop img, .stage-foreground img')]
    .map(image => image.getAttribute('src'));
  assert.ok(environmentAssets.every(src => src && !src.startsWith('/')));
  assert.ok(environmentAssets.every(src => src?.endsWith('.webp')));
});

test('waits for every image to decode before autoplay and uses discrete canvas frames', async () => {
  await render();
  assert.equal(pending.length, 16);
  assert.equal(button('Play animation').disabled, true);
  await decodeAll(pending.slice(0, 15));
  assert.equal(button('Play animation').disabled, true);
  await decodeAll(pending.slice(15));
  assert.equal(button('Pause animation').disabled, false);
  assert.equal(draws.at(-1), pending[0]);
  await tick(0); await tick(62.5);
  assert.equal(frame(), 1);
  assert.equal(draws.at(-1), pending[1]);
});

test('frame stepping pauses, wraps last/first and preserves the frame on replay', async () => {
  await render(); await decodeAll();
  await click('Previous frame'); assert.equal(frame(), 15);
  assert.equal(requests.size, 0);
  await click('Next frame'); assert.equal(frame(), 0);
  await click('Next frame'); assert.equal(frame(), 1);
  await click('Play animation'); await tick(50); await tick(175);
  assert.equal(frame(), 3);
});

test('speed changes retain position and apply to elapsed time without a jump', async () => {
  await render(); await decodeAll();
  await tick(0); await tick(250); assert.equal(frame(), 4);
  await click('0.5× speed'); await tick(300); await tick(800); assert.equal(frame(), 8);
  assert.equal((document.querySelector('.stage-foreground') as HTMLElement).style.getPropertyValue('--ball-flight-duration'), '4.8s');
  await click('1.5× speed'); await tick(850); await tick(1350); assert.equal(frame(), 4);
  assert.equal((document.querySelector('.stage-foreground') as HTMLElement).style.getPropertyValue('--ball-flight-duration'), '1.6s');
});

test('random ball pattern always chooses one of the other two patterns', () => {
  assert.equal(nextBallPattern(0, () => 0), 1);
  assert.equal(nextBallPattern(0, () => .999), 2);
  assert.equal(nextBallPattern(1, () => 0), 0);
  assert.equal(nextBallPattern(1, () => .999), 2);
  assert.equal(nextBallPattern(2, () => 0), 0);
  assert.equal(nextBallPattern(2, () => .999), 1);
});

test('one crossing tennis ball is present in both standing and Motion and follows playback state', async () => {
  await act(async () => root.render(<App/>));
  assert.equal(document.querySelectorAll('.stage-foreground__ball-flight').length, 1);
  const standingFlight = document.querySelector<HTMLElement>('#panel-standing .stage-foreground__ball-flight')!;
  assert.equal(standingFlight.dataset.ballPattern, 'power');
  let previousPattern = standingFlight.dataset.ballPattern;
  await act(async () => standingFlight.dispatchEvent(new Event('animationiteration', { bubbles: true })));
  assert.notEqual(standingFlight.dataset.ballPattern, previousPattern);
  assert.ok(['power', 'skid', 'lob'].includes(standingFlight.dataset.ballPattern!));
  previousPattern = standingFlight.dataset.ballPattern;
  await act(async () => standingFlight.dispatchEvent(new Event('animationiteration', { bubbles: true })));
  assert.notEqual(standingFlight.dataset.ballPattern, previousPattern);
  previousPattern = standingFlight.dataset.ballPattern;
  await act(async () => standingFlight.querySelector('.stage-foreground__ball')!.dispatchEvent(new Event('animationiteration', { bubbles: true })));
  assert.equal(standingFlight.dataset.ballPattern, previousPattern);
  assert.ok(document.querySelector('.stage-foreground--active:not(.stage-foreground--motion)'));
  await click('Motion'); await decodeAll();
  assert.equal(document.querySelectorAll('#panel-standing .stage-foreground__ball-flight').length, 1);
  assert.equal(document.querySelectorAll('#panel-motion .stage-foreground__ball-flight').length, 1);
  assert.ok(document.querySelector('.stage-foreground--motion.stage-foreground--moving'));
  await click('Pause animation');
  assert.equal(document.querySelector('.stage-foreground--motion.stage-foreground--moving'), null);
});

test('hiding the browser suspends the clock and never catches up hidden time', async () => {
  await render(); await decodeAll(); await tick(0); await tick(250);
  await visibility(true); assert.equal(requests.size, 0);
  await visibility(false); await tick(100000); assert.equal(frame(), 4);
  await tick(100250); assert.equal(frame(), 8);
});

test('leaving and returning to Motion keeps position and resumes when it was playing', async () => {
  await render(); await decodeAll(); await tick(0); await tick(250);
  await render(false); assert.equal(requests.size, 0);
  await render(true); assert.equal(frame(), 4);
  assert.equal(button('Pause animation').disabled, false);
  assert.equal(requests.size, 1);
  await tick(1000); await tick(1250); assert.equal(frame(), 8);
});

test('leaving and returning to Motion preserves a manual pause', async () => {
  await render(); await decodeAll(); await click('Pause animation');
  await render(false); await render(true);
  assert.equal(button('Play animation').disabled, false);
  assert.equal(requests.size, 0);
});

test('leaving while loading prevents later background autoplay', async () => {
  await render(); await render(false); await decodeAll(); await render(true);
  assert.equal(button('Play animation').disabled, false);
  assert.equal(requests.size, 0);
});

test('reduced motion starts paused, allows explicit play, and pauses when enabled later', async () => {
  reduced = true; await render(); await decodeAll();
  assert.equal(requests.size, 0);
  await click('Play animation'); assert.equal(requests.size, 1);
  await act(async () => media.dispatchEvent(new Event('change')));
  assert.equal(requests.size, 0);
  assert.equal(button('Play animation').disabled, false);
});

test('image failure disables playback; retry discards old loads and decodes the complete new batch', async () => {
  await render(); const old = pending.slice();
  await act(async () => old[15].onerror?.());
  assert.match(document.body.textContent!, /Unable to load/);
  assert.equal(button('Play animation').disabled, true);
  assert.ok(old.every(image => image.onload === null));
  await click('Try again'); const fresh = pending.slice(16);
  assert.equal(fresh.length, 16); assert.ok(fresh.every(image => image.src.endsWith('?retry=1')));
  await decodeAll(fresh);
  assert.equal(button('Pause animation').disabled, false);
});

test('decode rejection and wrong canvas dimensions are load failures', async () => {
  await render(); pending[1].decode = () => Promise.reject(new Error('Invalid PNG'));
  await decodeAll(); assert.match(document.body.textContent!, /Unable to load/);
  await click('Try again'); const fresh = pending.slice(16); fresh[0].naturalWidth = 1024;
  await decodeAll(fresh); assert.match(document.body.textContent!, /Unable to load/);
  assert.equal(button('Play animation').disabled, true);
});

test('keyboard Space, arrows, Home and End control the stage', async () => {
  await render(); await decodeAll();
  const stage = document.querySelector('.motion-stage')!;
  const key = async (value: string) => { await act(async () => stage.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: value, bubbles: true }))); };
  await key(' '); assert.equal(requests.size, 0);
  await key('End'); assert.equal(frame(), 15);
  await key('ArrowRight'); assert.equal(frame(), 0);
  await key('ArrowLeft'); assert.equal(frame(), 15);
  await key('Home'); assert.equal(frame(), 0);
});

test('native range scrubbing pauses playback at the selected frame', async () => {
  await render(); await decodeAll();
  const input = document.getElementById('motion-frame') as HTMLInputElement;
  await act(async () => {
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value')!.set!.call(input, '13');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  assert.equal(frame(), 13); assert.equal(requests.size, 0);
  assert.equal(input.getAttribute('aria-valuetext'), 'Frame 14 of 16');
});

test('Strict Mode effect replay cancels stale loaders and still autoplays exactly once', async () => {
  await act(async () => root.render(<React.StrictMode><MotionViewer active/></React.StrictMode>));
  assert.equal(pending.length, 32);
  await decodeAll(pending.slice(16));
  assert.equal(button('Pause animation').disabled, false);
  assert.equal(requests.size, 1);
});

test('standing defaults to auto rotate and returns from Motion through 90 to 360 degrees', async () => {
  await act(async () => root.render(<App/>));
  assert.equal(pending.length, 0);
  await act(async () => document.querySelectorAll('img').forEach(image => image.dispatchEvent(new Event('load'))));
  assert.equal(button('Auto rotate').getAttribute('aria-checked'), 'true');
  await tick(0); await tick(250);
  assert.ok(Number(document.querySelector('.figure')!.getAttribute('data-angle')) > 0);
  await click('Motion');
  assert.equal(button('Auto rotate').getAttribute('aria-checked'), 'true');
  await decodeAll();
  await click('360° View');
  await tick(1000);
  assert.equal(document.querySelector('.figure')!.getAttribute('data-angle'), '90.0');
  await tick(1450);
  const halfway = Number(document.querySelector('.figure')!.getAttribute('data-angle'));
  assert.ok(halfway > 215 && halfway < 235);
  await tick(1900);
  assert.equal(document.querySelector('.figure')!.getAttribute('data-angle'), '0.0');
  await tick(1950);
  assert.ok(Number(document.querySelector('.figure')!.getAttribute('data-angle')) > 0);
});

test('standing keyboard rotation stops automatic rotation', async () => {
  await act(async () => root.render(<App/>));
  await act(async () => document.querySelectorAll('img').forEach(image => image.dispatchEvent(new Event('load'))));
  const stage = document.querySelector<HTMLElement>('#panel-standing .stage')!;
  await act(async () => stage.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
  assert.equal(button('Auto rotate').getAttribute('aria-checked'), 'false');
});

test('mode transition keeps the outgoing viewer visible until the incoming reveal finishes', async () => {
  await act(async () => root.render(<App/>));
  const standing = document.getElementById('panel-standing')!;
  await click('Motion');
  const motion = document.getElementById('panel-motion')!;
  assert.equal(standing.hidden, false);
  assert.equal(standing.getAttribute('aria-hidden'), 'true');
  assert.equal(motion.hidden, false);
  assert.match(motion.className, /viewer-panel--incoming-forward/);
  await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 520)); });
  assert.equal(standing.hidden, true);
  assert.equal(motion.hidden, false);
});

test('character switch keeps the outgoing character visible until the directional reveal finishes', async () => {
  await act(async () => root.render(<App/>));
  const original = document.querySelector<HTMLElement>('[data-character="01"]')!;
  await chooseCharacter('02');
  const racket = document.querySelector<HTMLElement>('[data-character="02"]')!;
  assert.equal(original.hidden, false);
  assert.equal(original.getAttribute('aria-hidden'), 'true');
  assert.match(original.className, /character-panel--outgoing/);
  assert.equal(racket.hidden, false);
  assert.equal(racket.getAttribute('aria-hidden'), 'false');
  assert.match(racket.className, /character-panel--incoming-forward/);
  await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 520)); });
  assert.equal(original.hidden, true);
  await chooseCharacter('01');
  assert.match(original.className, /character-panel--incoming-backward/);
  assert.equal(racket.hidden, false);
});

test('a stalled image request times out with a retry action', async () => {
  const original = window.setTimeout;
  let timeout: (() => void) | undefined;
  window.setTimeout = ((callback: () => void) => { timeout = callback; return 1; }) as never;
  try {
    await render();
    await act(async () => timeout?.());
    assert.match(document.body.textContent!, /Unable to load/);
    assert.equal(button('Play animation').disabled, true);
    assert.equal(button('Try again').disabled, false);
  } finally { window.setTimeout = original; }
});

const chooseCharacter = async (id: string) => {
  const radio = document.querySelector<HTMLInputElement>(`input[name="character"][value="${id}"]`)!;
  await act(async () => radio.click());
};
const activeStanding = () => document.querySelector<HTMLElement>('.character-panel[aria-hidden="false"]')!;
const standingClick = async (label: string) => {
  const control = [...activeStanding().querySelectorAll<HTMLButtonElement>('button')].find(item => item.textContent === label || item.getAttribute('aria-label') === label)!;
  await act(async () => control.click());
};
const loadStanding = async () => {
  await act(async () => activeStanding().querySelectorAll('img').forEach(image => image.dispatchEvent(new Event('load'))));
};

test('character switch lazily mounts racket views and preserves independent angles with rotation stopped', async () => {
  await act(async () => root.render(<App/>));
  assert.equal(document.querySelectorAll('img[src*="/racket/"]').length, 0);
  await loadStanding(); await standingClick('Left');
  for (let time = 0; time <= 1500; time += 50) await tick(time);
  const originalFigure = activeStanding().querySelector('.figure')!;
  const originalAngle = originalFigure.getAttribute('data-angle');
  await chooseCharacter('02');
  assert.match(document.getElementById('title')!.textContent!, /02/);
  assert.equal(document.querySelectorAll('img[src*="/racket/"]').length, 12);
  assert.equal(document.querySelector('#tab-motion'), null);
  assert.match(activeStanding().querySelector('.figure')!.getAttribute('aria-label')!, /racket in his right hand/);
  await loadStanding(); await standingClick('Back');
  for (let time = 2000; time <= 3500; time += 50) await tick(time);
  const racketFigure = activeStanding().querySelector('.figure')!;
  const racketAngle = racketFigure.getAttribute('data-angle');
  assert.equal(racketAngle, '180.0');
  await standingClick('Auto rotate');
  await chooseCharacter('01');
  assert.equal(activeStanding().querySelector('.figure'), originalFigure);
  assert.equal(originalFigure.getAttribute('data-angle'), originalAngle);
  await tick(4000);
  assert.equal(racketFigure.getAttribute('data-angle'), racketAngle);
  await chooseCharacter('02');
  assert.equal(activeStanding().querySelector('.figure'), racketFigure);
  assert.equal(activeStanding().querySelector('[role="switch"]')!.getAttribute('aria-checked'), 'true');
  assert.equal(document.querySelectorAll('img[src*="/racket/"]').length, 12);
});

test('switching from Motion to racket suspends walking and resumes it on returning to Motion', async () => {
  await act(async () => root.render(<App/>));
  await click('Motion'); await decodeAll(); await tick(0); await tick(250);
  assert.equal(frame(), 4);
  await chooseCharacter('02');
  assert.equal(document.getElementById('panel-motion')!.hidden, true);
  assert.equal(document.getElementById('tab-standing')!.getAttribute('aria-selected'), 'true');
  await tick(500);
  assert.equal(frame(), 4);
  await chooseCharacter('01'); await click('Motion');
  assert.equal(frame(), 4);
  assert.equal(button('Pause animation').disabled, false);
  assert.ok(document.querySelector('.stage-foreground--motion.stage-foreground--moving'));
  await tick(1000); await tick(1250);
  assert.equal(frame(), 8);
});

test('racket loading and failure states keep automatic rotation unavailable', async () => {
  await act(async () => root.render(<App/>)); await chooseCharacter('02');
  assert.match(activeStanding().textContent!, /Loading character/);
  assert.equal(activeStanding().querySelector<HTMLButtonElement>('[role="switch"]')!.disabled, true);
  assert.ok([...activeStanding().querySelectorAll<HTMLButtonElement>('.presets button')].every(control => control.disabled));
  assert.equal(activeStanding().querySelector<HTMLInputElement>('.angle-control input')!.disabled, true);
  const sprite = activeStanding().querySelector('img[src*="/racket/"]')!;
  await act(async () => sprite.dispatchEvent(new Event('error')));
  assert.match(activeStanding().querySelector('[role="alert"]')!.textContent!, /Unable to load/);
  assert.equal(activeStanding().querySelector<HTMLButtonElement>('[role="switch"]')!.disabled, true);
});

test('racket reduced-motion keyboard rotation wraps at 360 and shows one unshifted frame', async () => {
  reduced = true;
  await act(async () => root.render(<App/>)); await chooseCharacter('02'); await loadStanding();
  const stage = activeStanding().querySelector('.stage')!;
  await act(async () => stage.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })));
  await tick(0);
  assert.equal(activeStanding().querySelector('.figure')!.getAttribute('data-angle'), '348.0');
  const sprites = [...activeStanding().querySelectorAll<HTMLImageElement>('.figure img')];
  assert.equal(sprites.filter(image => image.style.opacity === '1').length, 1);
  assert.ok(sprites.every(image => image.style.transform === 'translateX(0%)'));
  await act(async () => stage.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Home', bubbles: true })));
  await tick(50);
  assert.equal(activeStanding().querySelector('.figure')!.getAttribute('data-angle'), '0.0');
});

test('racket touch dragging captures one pointer, wraps angles and releases on cancellation', async () => {
  reduced = true;
  await act(async () => root.render(<App/>)); await chooseCharacter('02'); await loadStanding();
  const stage = activeStanding().querySelector<HTMLDivElement>('.stage')!;
  let captured: number | null = null;
  stage.setPointerCapture = id => { captured = id; };
  stage.hasPointerCapture = id => captured === id;
  stage.releasePointerCapture = () => { captured = null; };
  stage.getBoundingClientRect = () => ({ width: 360 } as DOMRect);
  const pointer = async (type: string, x: number, id = 7) => {
    const event = new Event(type, { bubbles: true });
    Object.assign(event, { pointerId: id, pointerType: 'touch', clientX: x, button: 0 });
    await act(async () => stage.dispatchEvent(event));
  };
  await pointer('pointerdown', 200);
  assert.equal(captured, 7);
  await pointer('pointermove', 20, 8); await tick(0);
  assert.equal(activeStanding().querySelector('.figure')!.getAttribute('data-angle'), '0.0');
  await pointer('pointermove', 290); await tick(50);
  assert.equal(activeStanding().querySelector('.figure')!.getAttribute('data-angle'), '270.0');
  await pointer('pointercancel', 290);
  assert.equal(captured, null);
  assert.equal(stage.classList.contains('dragging'), false);
});
