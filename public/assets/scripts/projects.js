(() => {
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const states = new WeakMap(), active = new Set();
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  function state(reel) {
    if (!states.has(reel)) states.set(reel,{reel,frame:0,time:0,last:reel.scrollLeft,velocity:0,lag:0,lean:0,target:null,position:null});
    return states.get(reel);
  }
  function reset(s) {
    cancelAnimationFrame(s.frame);s.frame=0;s.target=null;s.position=null;s.velocity=0;s.lag=0;s.lean=0;
    s.reel.style.removeProperty('--project-lag');s.reel.style.removeProperty('--project-lean');
    s.reel.classList.remove('is-moving');active.delete(s);
  }
  function start(s) {
    if (s.frame || reduced.matches) return;
    s.time=performance.now();active.add(s);s.reel.classList.add('is-moving');
    s.frame=requestAnimationFrame(time=>tick(s,time));
  }
  function tick(s,time) {
    if (!s.reel.isConnected || reduced.matches) return reset(s);
    const dt=clamp(time-s.time,1,40);s.time=time;
    if (s.target!==null) {
      s.target=clamp(s.target,0,s.reel.scrollWidth-s.reel.clientWidth);
      // Keep subpixel progress independent of browser scroll-position rounding.
      // Reading scrollLeft back on every frame can stall forever at 120+ Hz.
      s.position=clamp(s.position??s.reel.scrollLeft,0,s.reel.scrollWidth-s.reel.clientWidth);
      const distance=s.target-s.position;
      s.position+=distance*(1-Math.exp(-dt/85));
      s.reel.scrollLeft=s.position;
      if (Math.abs(s.target-s.position)<=.75) {s.reel.scrollLeft=s.target;s.target=null;s.position=null;}
    } else {
      s.position=null;
    }
    const left=s.reel.scrollLeft, speed=(left-s.last)*1000/dt;s.last=left;
    s.velocity+=(speed-s.velocity)*(1-Math.exp(-dt/65));
    const force=Math.tanh(s.velocity/1150);
    s.lag+=(force*18-s.lag)*(1-Math.exp(-dt/95));
    s.lean+=(-force*4.5-s.lean)*(1-Math.exp(-dt/85));
    s.reel.style.setProperty('--project-lag',s.lag.toFixed(3)+'px');
    s.reel.style.setProperty('--project-lean',s.lean.toFixed(3)+'deg');
    if (s.target===null && Math.abs(speed)<1 && Math.abs(s.velocity)<2 && Math.abs(s.lag)<.05 && Math.abs(s.lean)<.03) return reset(s);
    s.frame=requestAnimationFrame(next=>tick(s,next));
  }
  // The homepage owns gesture detection; the reel owns horizontal motion.
  window.CanopyProjects = {
    enter(reel,direction) {
      const s=state(reel);reset(s);
      reel.scrollLeft=direction>0?0:Math.max(0,reel.scrollWidth-reel.clientWidth);
      s.last=reel.scrollLeft;
    },
    stop(reel) {reset(state(reel));},
    step(reel,direction) {
      const s=state(reel),max=Math.max(0,reel.scrollWidth-reel.clientWidth);
      if(max<=1)return false;
      const origin=reel.getBoundingClientRect().left;
      const stops=[...new Set([0,...[...reel.children].map(slide=>
        clamp(slide.getBoundingClientRect().left-origin+reel.scrollLeft,0,max)),max])].sort((a,b)=>a-b);
      const position=s.target??reel.scrollLeft;
      const target=direction>0?stops.find(x=>x>position+3):stops.findLast(x=>x<position-3);
      // The selected destination owns navigation, even while the visual settles.
      // A fresh gesture beyond the last project must reach the next chapter.
      if(target===undefined)return false;
      if(reduced.matches){reset(s);reel.scrollLeft=target;s.last=target;}
      else{s.target=target;start(s);}
      return true;
    }
  };
  document.addEventListener('scroll',event=>{
    if (!event.target.matches?.('.project-reel'))return;
    const s=state(event.target);start(s);
  },true);
  document.addEventListener('wheel',event=>{
    const reel=event.target.closest('.project-reel');
    if (!reel || event.ctrlKey)return;
    const s=state(reel);
    // Touchpads keep their native momentum and horizontal direction.
    if (event.shiftKey || Math.abs(event.deltaX)>=Math.abs(event.deltaY)){s.target=null;return;}
    // Homepage chapter navigation routes vertical gestures through step().
    if(reel.closest('.home-story-mode'))return;
    const delta=event.deltaY*(event.deltaMode===1?24:event.deltaMode===2?reel.clientWidth:1);
    const max=reel.scrollWidth-reel.clientWidth, position=s.target??reel.scrollLeft;
    if(max<=0 || (delta>0&&position>=max-1) || (delta<0&&position<=1))return;
    event.preventDefault();
    if(reduced.matches){reel.scrollLeft+=delta;return;}
    s.target=clamp((s.target??reel.scrollLeft)+delta,0,max);start(s);
  },{passive:false});
  document.addEventListener('pointerdown',event=>{
    const reel=event.target.closest('.project-reel');if(reel)state(reel).target=null;
  },{passive:true});
  document.addEventListener('keydown',event=>{
    const reel=event.target.closest('.project-reel');
    if(!reel||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const s=state(reel);s.target=null;
    const step=reel.firstElementChild.getBoundingClientRect().width+parseFloat(getComputedStyle(reel).columnGap);
    const left=event.key==='Home'?0:event.key==='End'?reel.scrollWidth:reel.scrollLeft+(event.key==='ArrowRight'?step:-step);
    reel.scrollTo({left,behavior:reduced.matches?'auto':'smooth'});
  });
  reduced.addEventListener('change',()=>{if(reduced.matches)for(const s of active)reset(s);});
})();
