import { useEffect, useRef, useState } from 'react';
import StandingViewer from './StandingViewer';
import MotionViewer from './MotionViewer';
import { racketViews } from './racket';

export default function App() {
  const [character, setCharacter] = useState<'01' | '02'>('01');
  const [racketVisited, setRacketVisited] = useState(false);
  const [mode, setMode] = useState<'standing' | 'motion'>('standing');
  const [motionVisited, setMotionVisited] = useState(false);
  const [standingEntry, setStandingEntry] = useState(0);
  const [transitionFrom, setTransitionFrom] = useState<'standing' | 'motion' | null>(null);
  const [characterTransitionFrom, setCharacterTransitionFrom] = useState<'01' | '02' | null>(null);
  const tabs = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!transitionFrom) return;
    const fallback = window.setTimeout(() => setTransitionFrom(null), 500);
    return () => window.clearTimeout(fallback);
  }, [mode, transitionFrom]);
  useEffect(() => {
    if (!characterTransitionFrom) return;
    const fallback = window.setTimeout(() => setCharacterTransitionFrom(null), 500);
    return () => window.clearTimeout(fallback);
  }, [character, characterTransitionFrom]);
  const changeMode = (next: 'standing' | 'motion') => {
    if (next === mode) return;
    if (next === 'motion') setMotionVisited(true);
    if (next === 'standing') setStandingEntry(value => value + 1);
    setTransitionFrom(mode);
    setMode(next);
  };
  const changeCharacter = (next: '01' | '02') => {
    if (next === character) return;
    if (next === '02') setRacketVisited(true);
    setCharacterTransitionFrom(character);
    setCharacter(next);
    setTransitionFrom(null);
    setMode('standing');
  };
  return <main>
    <header>
      <a href="/" aria-label="Tennis Boy home"><span className="mark">t.</span>CHARACTER SHOWCASE</a>
      <fieldset className="character-switch">
        <legend className="visually-hidden">Choose character</legend>
        {(['01', '02'] as const).map(id => <label key={id}>
          <input type="radio" name="character" value={id} aria-label={id === '01' ? 'Tennis Boy 01 — Original' : 'Tennis Boy 02 — With racket'} checked={character === id} onChange={() => changeCharacter(id)}/>
          <span>{id}<span className="character-switch__name"> {id === '01' ? 'Original' : 'With racket'}</span></span>
        </label>)}
      </fieldset>
    </header>
    <section aria-labelledby="title">
      <div className="title"><h1 id="title">Tennis Boy <span>{character}.</span></h1><p>{character === '02' ? 'With racket' : mode === 'standing' ? 'Standing' : 'Walking · 36°'}</p></div>
      <div ref={tabs} className={`view-tabs${character === '02' ? ' view-tabs--single' : ''}`} data-mode={mode} role="tablist" aria-label="Showcase mode"
        onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const next = character === '02' || event.key === 'Home' ? 'standing' : event.key === 'End' ? 'motion' : mode === 'standing' ? 'motion' : 'standing';
          changeMode(next);
          tabs.current?.querySelector<HTMLButtonElement>(`#tab-${next}`)?.focus();
        }}>
        <button id="tab-standing" role="tab" aria-selected={mode === 'standing'} aria-controls="panel-standing" tabIndex={mode === 'standing' ? 0 : -1} onClick={() => changeMode('standing')}>360° View</button>
        {character === '01' ? <button id="tab-motion" role="tab" aria-selected={mode === 'motion'} aria-controls="panel-motion" tabIndex={mode === 'motion' ? 0 : -1} onClick={() => changeMode('motion')}>Motion</button> : null}
      </div>
      <div className="viewer-stack">
        <div id="panel-standing" className={`viewer-panel${transitionFrom && mode === 'standing' ? ' viewer-panel--incoming-backward' : transitionFrom === 'standing' ? ' viewer-panel--outgoing' : ''}`}
          role="tabpanel" aria-labelledby="tab-standing" aria-hidden={mode !== 'standing'} inert={mode !== 'standing'} hidden={mode !== 'standing' && transitionFrom !== 'standing'}
          onAnimationEnd={event => { if (event.target === event.currentTarget) setTransitionFrom(null); }}>
          <div data-character="01" className={`character-panel${characterTransitionFrom && character === '01' ? ' character-panel--incoming-backward' : characterTransitionFrom === '01' ? ' character-panel--outgoing' : ''}`}
            aria-hidden={character !== '01'} inert={character !== '01'} hidden={character !== '01' && characterTransitionFrom !== '01'}
            onAnimationEnd={event => { if (event.target === event.currentTarget) setCharacterTransitionFrom(null); }}>
            <StandingViewer active={character === '01' && mode === 'standing'} frontEntryKey={standingEntry}/>
          </div>
          {racketVisited ? <div data-character="02" className={`character-panel${characterTransitionFrom && character === '02' ? ' character-panel--incoming-forward' : characterTransitionFrom === '02' ? ' character-panel--outgoing' : ''}`}
            aria-hidden={character !== '02'} inert={character !== '02'} hidden={character !== '02' && characterTransitionFrom !== '02'}
            onAnimationEnd={event => { if (event.target === event.currentTarget) setCharacterTransitionFrom(null); }}>
            <StandingViewer active={character === '02' && mode === 'standing'} views={racketViews} label="Tennis Boy 02 standing with a racket in his right hand and a tennis ball in his left hand"/>
          </div> : null}
        </div>
        <div id="panel-motion" className={`viewer-panel${transitionFrom && mode === 'motion' ? ' viewer-panel--incoming-forward' : transitionFrom === 'motion' ? ' viewer-panel--outgoing' : ''}`}
          role="tabpanel" aria-labelledby="tab-motion" aria-hidden={mode !== 'motion'} inert={mode !== 'motion'} hidden={mode !== 'motion' && transitionFrom !== 'motion'}
          onAnimationEnd={event => { if (event.target === event.currentTarget) setTransitionFrom(null); }}>
          {motionVisited ? <MotionViewer active={character === '01' && mode === 'motion'}/> : null}
        </div>
      </div>
    </section>
    <footer>Created by <a href="https://roysung.notion.site/" target="_blank" rel="noopener noreferrer">RoySung</a></footer>
  </main>;
}
