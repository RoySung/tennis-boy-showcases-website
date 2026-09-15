import { useEffect, useRef, useState } from 'react';
import Geometry from './Geometry';
import StandingViewer from './StandingViewer';
import MotionViewer from './MotionViewer';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      try { if (['light', 'dark'].includes(localStorage.getItem('tennis-boy-theme') || '')) return; } catch {}
      setTheme(query.matches ? 'dark' : 'light');
    };
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#191c25' : '#fafafa');
  }, [theme]);
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try { localStorage.setItem('tennis-boy-theme', next); } catch {}
  };
  const [mode, setMode] = useState<'standing' | 'motion'>('standing');
  const [motionVisited, setMotionVisited] = useState(false);
  const tabs = useRef<HTMLDivElement>(null);
  const changeMode = (next: 'standing' | 'motion') => {
    if (next === 'motion') setMotionVisited(true);
    setMode(next);
  };
  return <main>
    <Geometry/>
    <header><a href="/" aria-label="Tennis Boy home"><span className="mark">t.</span>CHARACTER SHOWCASE</a>
      <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          {theme === 'light' ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></> : <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/>}
        </svg>
        <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
      </button>
    </header>
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

