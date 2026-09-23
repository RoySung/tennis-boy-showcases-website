import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { advanceFrames, walking, wrapFrame } from './walking';
import CourtBackdrop from './CourtBackdrop';
import StageForeground from './StageForeground';

export default function MotionViewer({ active }: { active: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useRef<HTMLImageElement[]>([]);
  const firstEntry = useRef(true);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loaded, setLoaded] = useState(0);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const position = useRef(0);
  const count = walking.frames.length;

  useEffect(() => {
    let cancelled = false;
    const disposers: (() => void)[] = [];
    setStatus('loading');
    setLoaded(0);
    setPlaying(false);
    const pending = walking.frames.map(src => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      let settled = false;
      const cleanup = () => {
        window.clearTimeout(timeout);
        image.onload = null;
        image.onerror = null;
      };
      const fail = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error(`Unable to decode ${src}`));
      };
      const timeout = window.setTimeout(fail, 60000);
      disposers.push(() => { fail(); image.src = ''; });
      image.onload = async () => {
        try {
          await image.decode();
          if (settled) return;
          if (image.naturalWidth !== walking.width || image.naturalHeight !== walking.height) { fail(); return; }
          settled = true;
          cleanup();
          if (!cancelled) setLoaded(value => value + 1);
          resolve(image);
        } catch { fail(); }
      };
      image.onerror = fail;
      image.src = attempt ? `${src}?retry=${attempt}` : src;
    }));
    Promise.all(pending).then(decoded => {
      if (cancelled) return;
      images.current = decoded;
      setStatus('ready');
    }).catch(() => {
      if (cancelled) return;
      cancelled = true;
      disposers.forEach(dispose => dispose());
      images.current = [];
      setStatus('error');
    });
    return () => {
      cancelled = true;
      disposers.forEach(dispose => dispose());
      images.current = [];
    };
  }, [attempt]);

  useEffect(() => {
    if (!active) {
      firstEntry.current = false;
      setPlaying(false);
    } else if (status === 'ready' && firstEntry.current) {
      firstEntry.current = false;
      setPlaying(!matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, [active, status]);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { if (preference.matches) setPlaying(false); };
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    if (!active || !playing || status !== 'ready') return;
    let request = 0;
    let previous: number | null = null;
    const tick = (time: number) => {
      if (document.hidden) { previous = null; request = 0; return; }
      if (previous !== null) {
        position.current = advanceFrames(position.current, time - previous, walking.fps, speed, count);
        setFrame(Math.floor(position.current));
      }
      previous = time;
      request = requestAnimationFrame(tick);
    };
    const visibility = () => {
      cancelAnimationFrame(request);
      request = 0;
      previous = null;
      if (!document.hidden) request = requestAnimationFrame(tick);
    };
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelAnimationFrame(request);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [active, playing, status, speed, count]);

  useLayoutEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, walking.width, walking.height);
    if (status === 'ready') context.drawImage(images.current[frame], 0, 0);
  }, [frame, status]);

  const seek = (value: number) => {
    setPlaying(false);
    position.current = wrapFrame(value, count);
    setFrame(position.current);
  };
  const ready = status === 'ready';
  return <>
    <div className="stage motion-stage" role="group" aria-label="Walking animation at 36 degrees" tabIndex={0}
      aria-describedby="motion-hint" aria-busy={status === 'loading'}
      onKeyDown={event => {
        if (event.target !== event.currentTarget || !ready) return;
        if (event.key === ' ') { event.preventDefault(); setPlaying(value => !value); }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault(); seek(frame + (event.key === 'ArrowLeft' ? -1 : 1));
        }
        if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault(); seek(event.key === 'Home' ? 0 : count - 1);
        }
      }}>
      <CourtBackdrop motion active={active} moving={playing && active && status === 'ready'} speed={speed}/>
      <div className="exhibit">
        <div className="figure motion-figure">
          <canvas ref={canvas} width={walking.width} height={walking.height} role="img" aria-label="Tennis Boy walking in place, viewed from 36 degrees"/>
        </div>
      </div>
      <StageForeground motion active={active} moving={playing && active && status === 'ready'} speed={speed}/>
      {status === 'loading' ? <p className="status" role="status">Loading motion… {loaded}/{count}</p> : null}
      {status === 'error' ? <div className="status motion-error"><p role="alert">Unable to load the walking animation.</p><button onClick={() => setAttempt(value => value + 1)}>Try again</button></div> : null}
    </div>
    <div className="controls motion-controls">
      <div className="playback-controls" role="group" aria-label="Playback controls">
        <button disabled={!ready} aria-label="Previous frame" onClick={() => seek(frame - 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14M18 5l-9 7 9 7Z"/></svg>
        </button>
        <button className="play-button" disabled={!ready} onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Pause animation' : 'Play animation'}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M8 5v14M16 5v14"/> : <path d="m8 5 11 7-11 7Z"/>}</svg>
          <span>{playing ? 'Pause' : 'Play'}</span>
        </button>
        <button disabled={!ready} aria-label="Next frame" onClick={() => seek(frame + 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 5v14M6 5l9 7-9 7Z"/></svg>
        </button>
      </div>
      <div className="frame-control">
        <label htmlFor="motion-frame">Frame</label>
        <input id="motion-frame" type="range" min="0" max={count - 1} step="1" value={frame} disabled={!ready}
          aria-valuetext={`Frame ${frame + 1} of ${count}`} onChange={event => seek(Number(event.target.value))}/>
        <span className="frame-count" aria-hidden="true">{String(frame + 1).padStart(2, '0')} / {count}</span>
      </div>
      <div className="speed-controls" role="group" aria-label="Playback speed">
        <span>Speed</span>
        {[0.5, 1, 1.5].map(value => <button key={value} disabled={!ready} aria-pressed={speed === value} aria-label={`${value}× speed`} onClick={() => setSpeed(value)}>{value}×</button>)}
      </div>
      <p id="motion-hint" className="motion-hint">Space to play · ← → to step</p>
    </div>
  </>;
}
