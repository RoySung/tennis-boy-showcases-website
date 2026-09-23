import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import usePageVisibility from './usePageVisibility';
import { ballPatterns, nextBallPattern, WORLD_SCROLL_SECONDS } from './environment';

type StageForegroundProps = {
  motion?: boolean;
  moving?: boolean;
  active?: boolean;
  speed?: number;
};

const duration = (seconds: number) => `${Number(seconds.toFixed(3))}s`;

/** Camera-side decoration; all children remain inert for stage controls. */
export default function StageForeground({ motion = false, moving = false, active = true, speed = 1 }: StageForegroundProps) {
  const visible = usePageVisibility();
  const foreground = useRef<HTMLDivElement>(null);
  const ballFlight = useRef<HTMLDivElement>(null);
  const [ballPattern, setBallPattern] = useState(0);

  useEffect(() => {
    const flight = ballFlight.current;
    if (!flight) return;
    const rotatePattern = (event: AnimationEvent) => {
      if (event.target === flight) setBallPattern(value => nextBallPattern(value));
    };
    flight.addEventListener('animationiteration', rotatePattern);
    return () => flight.removeEventListener('animationiteration', rotatePattern);
  }, []);

  useLayoutEffect(() => {
    if (!motion || !foreground.current) return;
    const layer = foreground.current;
    const panorama = layer.parentElement?.querySelector<HTMLElement>('.court-panorama');
    if (!panorama) return;

    const updateLampDuration = () => {
      const panoramaSpeed = panorama.getBoundingClientRect().width / 2 / (WORLD_SCROLL_SECONDS / speed);
      const lampDistance = layer.getBoundingClientRect().width * 2;
      if (panoramaSpeed > 0 && lampDistance > 0) {
        // The lamp stays slightly closer than the panorama at every stage size.
        layer.style.setProperty('--lamp-duration', `${lampDistance / (panoramaSpeed * 1.2)}s`);
      }
    };

    updateLampDuration();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateLampDuration);
      return () => window.removeEventListener('resize', updateLampDuration);
    }
    const observer = new ResizeObserver(updateLampDuration);
    observer.observe(layer);
    observer.observe(panorama);
    return () => observer.disconnect();
  }, [motion, speed]);

  return <div ref={foreground} className={`stage-foreground${motion ? ' stage-foreground--motion' : ''}${moving && visible ? ' stage-foreground--moving' : ''}${active && visible ? ' stage-foreground--active' : ''}`}
    style={{ '--foreground-duration': `${12 / speed}s`, '--ball-flight-duration': duration((motion ? 2.4 : 3) / speed), '--ball-spin-duration': duration((motion ? .85 : 1.2) / speed), '--lamp-duration': `${30 / speed}s` } as React.CSSProperties} aria-hidden="true">
    <div className="stage-foreground__lamp-track">
      {[0, 1, 2, 3].map(index => <div className="stage-foreground__tile" key={index}>
        <img src="/environment/tennis-center-lamp-v2.png" alt="" draggable="false"/>
      </div>)}
    </div>
    <div className="stage-foreground__planters">
      {[0, 1, 2, 3].map(index => <div className="stage-foreground__tile" key={index}>
        <img src="/environment/tennis-center-planter-v2.png" alt="" draggable="false"/>
      </div>)}
    </div>
    <div ref={ballFlight} className="stage-foreground__ball-flight" data-ball-pattern={ballPatterns[ballPattern]}>
      <span className="stage-foreground__ball">
        <img src="/environment/tennis-center-ball-v2.png" alt="" draggable="false"/>
      </span>
    </div>
  </div>;
}
