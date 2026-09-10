import { useEffect, useRef } from 'react';

/** Decorative depth layers: pointer updates never trigger React renders. */
export default function Geometry() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current?.parentElement;
    if (!element) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0, last = 0;
    const draw = (time: number) => {
      const ease = 1 - Math.exp(-Math.min(last ? time - last : 16, 64) / 110);
      last = time;
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;
      element.style.setProperty('--pointer-x', x.toFixed(4));
      element.style.setProperty('--pointer-y', y.toFixed(4));
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > .001) frame = requestAnimationFrame(draw);
      else { frame = 0; last = 0; }
    };
    const wake = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const move = (event: PointerEvent) => {
      if (preference.matches || event.pointerType === 'touch') return;
      targetX = Math.max(-1, Math.min(1, event.clientX / innerWidth * 2 - 1));
      targetY = Math.max(-1, Math.min(1, event.clientY / innerHeight * 2 - 1));
      wake();
    };
    const reset = () => { targetX = targetY = 0; wake(); };
    const change = () => {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      x = y = targetX = targetY = 0;
      element.style.setProperty('--pointer-x', '0');
      element.style.setProperty('--pointer-y', '0');
    };
    const visibility = () => { if (document.hidden) change(); };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', visibility);
    preference.addEventListener('change', change);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', visibility);
      preference.removeEventListener('change', change);
    };
  }, []);
  return <div ref={root} className="geometry" aria-hidden="true">
    <div className="geo-object geo-sphere"><div className="sphere"/></div>
    <div className="geo-object geo-cube"><div className="cube">
      <i className="cube-front"/><i className="cube-back"/><i className="cube-left"/>
      <i className="cube-right"/><i className="cube-top"/><i className="cube-bottom"/>
    </div></div>
    <div className="geo-object geo-triangle"><svg className="triangle" viewBox="0 0 140 150">
      <path className="triangle-side" d="m65 12 51 116 14 13L79 25Z"/>
      <path className="triangle-bottom" d="m8 128 108 0 14 13H22Z"/>
      <path className="triangle-front" d="M65 12 8 128h108Z"/>
    </svg></div>
    <div className="geo-object geo-small"><div className="sphere"/></div>
  </div>;
}
