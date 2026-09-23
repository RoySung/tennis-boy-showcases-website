import { useEffect, useRef, useState } from 'react';
import { characterViews as originalViews, normalizeAngle, clamp, type CharacterView } from './character';
import CourtBackdrop from './CourtBackdrop';
import StageForeground from './StageForeground';

export default function StandingViewer({ active, views: characterViews = originalViews, label = 'Tennis Boy 01 in a standing pose' }: {
  active: boolean;
  views?: readonly CharacterView[];
  label?: string;
}) {
  const enabled = useRef(active);
  const stage = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLOutputElement>(null);
  const motion = useRef({target:0,current:0,frame:0,last:0,reduced:false,blend:0,left:0});
  const drag = useRef<{id:number;x:number;angle:number;width:number}|null>(null);
  const [autoRotate,setAutoRotate]=useState(false);
  const auto=useRef(false);
  const [loaded,setLoaded]=useState(0);
  const [failed,setFailed]=useState(false);
  const ready=loaded>=characterViews.length&&!failed;
  const [selected,setSelected]=useState('front');
  const render = (time:number) => {
    const m=motion.current;
    if (!enabled.current || document.hidden) { m.frame=0; m.last=0; return; }
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
  const wake=()=>{if(enabled.current&&!document.hidden&&!motion.current.frame)motion.current.frame=requestAnimationFrame(render)};
  const select=(value:number)=>{
    const m=motion.current;
    m.target=m.current+normalizeAngle(value-normalizeAngle(m.current)+180)-180;
    wake();
  };
  useEffect(()=>{
    const q=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>{motion.current.reduced=q.matches;wake()};update();q.addEventListener('change',update);
    const visibility=()=>{cancelAnimationFrame(motion.current.frame);motion.current.frame=0;motion.current.last=0;if(!document.hidden)wake()};
    document.addEventListener('visibilitychange',visibility);wake();
    return()=>{cancelAnimationFrame(motion.current.frame);motion.current.frame=0;motion.current.last=0;q.removeEventListener('change',update);document.removeEventListener('visibilitychange',visibility)};
  },[]);
  const stop=(e:React.PointerEvent<HTMLDivElement>)=>{
    if(drag.current?.id!==e.pointerId)return;
    drag.current=null;e.currentTarget.classList.remove('dragging');
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  };
  useEffect(() => {
    enabled.current = active;
    if (active) { wake(); return; }
    auto.current = false;
    setAutoRotate(false);
    const m = motion.current;
    cancelAnimationFrame(m.frame);
    m.frame = 0;
    m.last = 0;
    m.target = m.current;
    const pointer = drag.current;
    drag.current = null;
    stage.current?.classList.remove('dragging');
    if (pointer && stage.current?.hasPointerCapture(pointer.id)) stage.current.releasePointerCapture(pointer.id);
  }, [active]);
  return <>
      <div ref={stage} className="stage" role="group" aria-label="Drag to rotate the character" tabIndex={0}
        onKeyDown={e=>{if(!ready)return;if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();if(e.key==='Home'||e.key==='End')select(0);else{motion.current.target+=e.key==='ArrowLeft'?-12:12;wake()}}}}
        onPointerDown={e=>{if(loaded<characterViews.length||failed||drag.current||(e.pointerType==='mouse'&&e.button!==0))return;drag.current={id:e.pointerId,x:e.clientX,angle:motion.current.current,width:e.currentTarget.getBoundingClientRect().width};e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.classList.add('dragging')}}
        onPointerMove={e=>{const d=drag.current;if(d&&d.id===e.pointerId){motion.current.target=d.angle-(e.clientX-d.x)/d.width*360;wake()}}}
        onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
        <CourtBackdrop active={active}/>
        <div className="exhibit">
        <div ref={figure} className="figure" data-angle="0" role="img" aria-label={label}>
          {characterViews.map((v,i)=><img key={v.id} src={v.src} alt="" draggable="false" style={{opacity:i===0?1:0}} onLoad={()=>setLoaded(n=>n+1)} onError={()=>setFailed(true)}/>)}
        </div>
        </div>
        <StageForeground active={active}/>
        {loaded<characterViews.length&&!failed?<p className="status" role="status">Loading character…</p>:null}
        {failed?<p className="status" role="alert">Unable to load character. Please refresh.</p>:null}
      </div>
      <div className="controls"><button className="auto-rotate" role="switch" aria-checked={autoRotate} disabled={loaded<characterViews.length||failed} onClick={()=>{auto.current=!auto.current;setAutoRotate(auto.current);motion.current.last=0;wake()}}><span className="switch-track" aria-hidden="true"><i/></span>Auto rotate</button><p className="hint">↔ <span>Drag to rotate</span></p>
        <div className="presets" role="group" aria-label="Character views">
          {characterViews.filter(v=>[0,90,180,270,288].includes(v.angle)).map(v=><button key={v.id} disabled={!ready} aria-pressed={selected===v.id} onClick={()=>select(v.angle)}>{v.angle===0?'Front':v.angle===90?'Left':v.angle===180?'Back':'Right'}</button>)}
          <button className="reset" aria-label="Reset view" disabled={!ready} onClick={()=>select(0)}>↺</button>
        </div>
        <div className="angle-control"><span>0°</span><input ref={slider} type="range" min="0" max="360" defaultValue="0" disabled={!ready} aria-label="Rotation angle" onChange={e=>select(Number(e.target.value))}/><span>360°</span><output ref={output} aria-label="Current angle">0°</output></div>
      </div>
  </>;
}
