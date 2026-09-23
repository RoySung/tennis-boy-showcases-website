import { useRef, useState } from 'react';
import StandingViewer from './StandingViewer';
import MotionViewer from './MotionViewer';

export default function App() {
  const [mode, setMode] = useState<'standing' | 'motion'>('standing');
  const [motionVisited, setMotionVisited] = useState(false);
  const tabs = useRef<HTMLDivElement>(null);
  const changeMode = (next: 'standing' | 'motion') => {
    if (next === 'motion') setMotionVisited(true);
    setMode(next);
  };
  return <main>
    <header><a href="/" aria-label="Tennis Boy home"><span className="mark">t.</span>CHARACTER SHOWCASE</a></header>
    <section aria-labelledby="title">
      <div className="title"><h1 id="title">Tennis Boy <span>01.</span></h1><p>{mode === 'standing' ? 'Standing' : 'Walking · 36°'}</p></div>
      <div ref={tabs} className="view-tabs" role="tablist" aria-label="Showcase mode"
        onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === 'Home' ? 'standing' : event.key === 'End' ? 'motion' : mode === 'standing' ? 'motion' : 'standing';
          changeMode(next);
          tabs.current?.querySelector<HTMLButtonElement>(`#tab-${next}`)?.focus();
        }}>
        <button id="tab-standing" role="tab" aria-selected={mode === 'standing'} aria-controls="panel-standing" tabIndex={mode === 'standing' ? 0 : -1} onClick={() => changeMode('standing')}>360° View</button>
        <button id="tab-motion" role="tab" aria-selected={mode === 'motion'} aria-controls="panel-motion" tabIndex={mode === 'motion' ? 0 : -1} onClick={() => changeMode('motion')}>Motion</button>
      </div>
      <div id="panel-standing" className="viewer-panel" role="tabpanel" aria-labelledby="tab-standing" hidden={mode !== 'standing'}>
        <StandingViewer active={mode === 'standing'}/>
      </div>
      <div id="panel-motion" className="viewer-panel" role="tabpanel" aria-labelledby="tab-motion" hidden={mode !== 'motion'}>
        {motionVisited ? <MotionViewer active={mode === 'motion'}/> : null}
      </div>
    </section>
    <footer>Created by <a href="https://roysung.notion.site/" target="_blank" rel="noopener noreferrer">RoySung</a></footer>
  </main>;
}
