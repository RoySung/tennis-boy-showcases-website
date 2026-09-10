import { useEffect, useRef, useState } from 'react';
import Geometry from './Geometry';
import { characterViews, normalizeAngle, clamp } from './character';

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
  const figure = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLOutputElement>(null);
  const motion = useRef({target:0,current:0,frame:0,last:0,reduced:false,blend:0,left:0});
  const drag = useRef<{id:number;x:number;angle:number;width:number}|null>(null);
  const [autoRotate,setAutoRotate]=useState(false);
  const auto=useRef(false);
  const [loaded,setLoaded]=useState(0);
  const [failed,setFailed]=useState(false);
  const [selected,setSelected]=useState('front');
  const render = (time:number) => {
    const m=motion.current;
    const dt=Math.min(50,m.last?time-m.last:16.7);m.last=time;
    if(auto.current&&!drag.current&&!document.hidden)m.target+=dt*0.12;
    const difference=m.target-m.current;
    m.current=m.reduced||Math.abs(difference)<.03?m.target:m.current+difference*(1-Math.exp(-dt/55));
    const a=normalizeAngle(m.current);
    let left=characterViews.length-1;
    for(let i=0;i<characterViews.length;i++)if(a>=characterViews[i].angle)left=i;
    const right=(left+1)%characterViews.length;
    const start=characterViews[left].angle,end=right===0?360:characterViews[right].angle;
    const progress=(a-start)/(end-start);
    // Keep overlap brief; translate whole frames toward a shared torso anchor.
    const t=clamp((progress-.44)/.12,0,1);
    const settled=Math.abs(m.target-m.current)<.03&&!auto.current;
    const selectionAngle=settled?normalizeAngle(m.target):a;
    const distance=(angle:number)=>Math.abs(normalizeAngle(selectionAngle-angle+180)-180);
    const nearest=distance(start)<distance(end)?0:1;
    const desired=m.reduced||settled?nearest:t*t*(3-2*t);
    // Finish a paused dissolve instead of leaving a permanent double contour.
    m.blend=m.reduced||!settled||m.left!==left?desired:
      m.blend+clamp(desired-m.blend,-dt/70,dt/70);
    m.left=left;
    const blend=m.blend;
    const shift=m.reduced?0:clamp(
      (characterViews[right].anchorX-characterViews[left].anchorX)/1254*100,-.6,.6);
    if(figure.current){
      figure.current.dataset.angle=a.toFixed(1);
      Array.from(figure.current.children).forEach((el,i)=>{
        const image=el as HTMLImageElement;
        const offset=i===left?shift*blend:i===right?-shift*(1-blend):0;
        image.style.opacity=String(i===left?1-blend:i===right?blend:0);
        image.style.transform=`translateX(${offset}%)`;
      });
    }
    if(slider.current)slider.current.value=String(a);
    if(output.current)output.current.value=`${Math.round(a)%360}°`;
    setSelected(characterViews[blend<.5?left:right].id);
    if(Math.abs(m.target-m.current)>.001 || Math.abs(desired-blend)>.001 || (auto.current&&!document.hidden))m.frame=requestAnimationFrame(render);
    else {m.frame=0;m.last=0;}
  };
  const wake=()=>{if(!motion.current.frame)motion.current.frame=requestAnimationFrame(render)};
  const select=(value:number)=>{
    const m=motion.current;
    m.target=m.current+normalizeAngle(value-normalizeAngle(m.current)+180)-180;
    wake();
  };
  useEffect(()=>{
    const q=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>{motion.current.reduced=q.matches;wake()};update();q.addEventListener('change',update);
    const visibility=()=>{motion.current.last=0;if(!document.hidden)wake()};
    document.addEventListener('visibilitychange',visibility);wake();
    return()=>{cancelAnimationFrame(motion.current.frame);q.removeEventListener('change',update);document.removeEventListener('visibilitychange',visibility)};
  },[]);
  const stop=(e:React.PointerEvent<HTMLDivElement>)=>{
    if(drag.current?.id!==e.pointerId)return;
    drag.current=null;e.currentTarget.classList.remove('dragging');
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
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
      <div className="title"><h1 id="title">Tennis Boy <span>01.</span></h1><p>Standing</p></div>
      <div className="stage" role="group" aria-label="Drag to rotate the character" tabIndex={0}
        onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();if(e.key==='Home'||e.key==='End')select(0);else{motion.current.target+=e.key==='ArrowLeft'?-12:12;wake()}}}}
        onPointerDown={e=>{if(loaded<characterViews.length||failed||drag.current||(e.pointerType==='mouse'&&e.button!==0))return;drag.current={id:e.pointerId,x:e.clientX,angle:motion.current.current,width:e.currentTarget.getBoundingClientRect().width};e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.classList.add('dragging')}}
        onPointerMove={e=>{const d=drag.current;if(d&&d.id===e.pointerId){motion.current.target=d.angle-(e.clientX-d.x)/d.width*360;wake()}}}
        onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
        <div className="exhibit">
        <div className="pedestal" aria-hidden="true"><div className="pedestal-top"/></div>
        <div className="shadow" aria-hidden="true"/>
        <div ref={figure} className="figure" data-angle="0" role="img" aria-label="Tennis Boy 01 in a standing pose">
          {characterViews.map((v,i)=><img key={v.id} src={v.src} alt="" draggable="false" style={{opacity:i===0?1:0}} onLoad={()=>setLoaded(n=>n+1)} onError={()=>setFailed(true)}/>)}
        </div>
        </div>
        {loaded<characterViews.length&&!failed?<p className="status" role="status">Loading character…</p>:null}
        {failed?<p className="status" role="alert">Unable to load character. Please refresh.</p>:null}
      </div>
      <div className="controls"><button className="auto-rotate" role="switch" aria-checked={autoRotate} disabled={loaded<characterViews.length||failed} onClick={()=>{auto.current=!auto.current;setAutoRotate(auto.current);motion.current.last=0;wake()}}><span className="switch-track" aria-hidden="true"><i/></span>Auto rotate</button><p className="hint">↔ <span>Drag to rotate</span></p>
        <div className="presets" role="group" aria-label="Character views">
          {characterViews.filter(v=>[0,90,180,288].includes(v.angle)).map(v=><button key={v.id} aria-pressed={selected===v.id} onClick={()=>select(v.angle)}>{v.angle===0?'Front':v.angle===90?'Left':v.angle===180?'Back':'Right'}</button>)}
          <button className="reset" aria-label="Reset view" onClick={()=>select(0)}>↺</button>
        </div>
        <div className="angle-control"><span>0°</span><input ref={slider} type="range" min="0" max="360" defaultValue="0" aria-label="Rotation angle" onChange={e=>select(Number(e.target.value))}/><span>360°</span><output ref={output} aria-label="Current angle">0°</output></div>
      </div>
    </section>
    <footer>Created by <a href="https://roysung.notion.site/" target="_blank" rel="noopener noreferrer">RoySung</a></footer>
  </main>;
}

