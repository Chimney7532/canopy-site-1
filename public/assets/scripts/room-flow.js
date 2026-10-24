/* The live destination is revealed by ink; there is no covered-screen swap. */
window.RoomFlow=(()=>{
  let running=null;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const NS='http://www.w3.org/2000/svg';
  function freezeScene(selectedRoots=null){
    const scene=document.createElement('div');scene.className='ink-scene';
    scene.setAttribute('aria-hidden','true');scene.inert=true;
    const roots=selectedRoots||[document.querySelector('.shell'),document.querySelector(document.body.classList.contains('in-room')?'#room-rail':'.rail'),...document.querySelectorAll('body>.route-ghost,body>.ink-route-stage')].filter(Boolean);
    // Attach once, before restoring nested scroll positions. Re-appending this
    // same scene resets its scroll containers and invalidates sticky offsets.
    document.body.append(scene);
    for(const root of roots){
      const copy=root.cloneNode(true),originals=[root,...root.querySelectorAll('*')],copies=[copy,...copy.querySelectorAll('*')];
      const ids=new Map(),sticky=[],scrolls=[];
      originals.forEach((el,i)=>{
        const target=copies[i],computed=getComputedStyle(el);
        const scrollTop=el.scrollTop,scrollLeft=el.scrollLeft;if(scrollTop||scrollLeft)scrolls.push({target,scrollTop,scrollLeft});
        // Freeze the outgoing theme and layout before the real document changes.
        target.style.cssText=Array.from(computed,key=>`${key}:${computed.getPropertyValue(key)} !important;`).join('');
        target.style.setProperty('animation','none','important');target.style.setProperty('transition','none','important');
        if(computed.position==='sticky'){
          sticky.push({target,rect:el.getBoundingClientRect()});
          // Keep its place in grid/flex flow. Fixed positioning would remove
          // month labels and shift the entire adjacent event column left.
          for(const [key,value] of Object.entries({position:'relative',top:'0',left:'0',right:'auto',bottom:'auto'}))target.style.setProperty(key,value,'important');
        }
        if(target.id){ids.set(target.id,'ink-copy-'+target.id);target.id='ink-copy-'+target.id;}
      });
      for(const target of copies){
        for(const attr of [...target.attributes]){
          let value=attr.value;
          if(!value.includes('url(#')&&!value.includes('url("#')&&!value.startsWith('#'))continue;
          for(const [id,replacement] of ids){value=value.replaceAll('url(#'+id+')','url(#'+replacement+')').replaceAll('url("#'+id+'")','url("#'+replacement+'")');if(value==='#'+id)value='#'+replacement;}
          if(value!==attr.value)target.setAttribute(attr.name,value);
        }
      }
      const rect=root.getBoundingClientRect();
      for(const [key,value] of Object.entries({position:'absolute',top:rect.top+'px',left:rect.left+'px',width:rect.width+'px',height:rect.height+'px',margin:'0',transform:'none'}))copy.style.setProperty(key,value,'important');
      scene.append(copy);
      // Scroll offsets aren't included in cloneNode or computed styles.
      // Measure only after attachment, then pin sticky content without reflow.
      scrolls.forEach(({target,scrollTop,scrollLeft})=>{target.scrollTop=scrollTop;target.scrollLeft=scrollLeft;});
      // Read all pinned positions before writing any corrections.
      const placements=sticky.map(({target,rect})=>({target,rect,placed:target.getBoundingClientRect()}));
      placements.forEach(({target,rect,placed})=>{
        target.style.setProperty('translate',`${rect.left-placed.left}px ${rect.top-placed.top}px`,'important');
      });
    }
    scene.style.background=getComputedStyle(document.body).backgroundColor;
    // Keep the outgoing Room entrance itself in the frozen public image.
    if(!selectedRoots&&!document.body.classList.contains('in-room')){
      const ink=document.querySelector('#liquid-rail svg')?.cloneNode(true);
      if(ink){Object.assign(ink.style,{position:'absolute',inset:'0',width:'100%',height:'100%'});scene.prepend(ink);}
    }
    return scene;
  }
  function start(commit){
    if(running)return;
    const surface=window.LiquidRail,leaving=document.body.classList.contains('in-room');
    const run={frame:0,deferred:null,done:false,scene:null};running=run;
    const motion=matchMedia('(prefers-reduced-motion:reduce)');
    let shape,svg,mask,started=null;
    function finish(){
      if(run.done)return;run.done=true;cancelAnimationFrame(run.frame);
      run.scene?.remove();svg?.remove();surface.end();
      document.body.classList.remove('ink-live-flow');
      window.removeEventListener('resize',finish);window.removeEventListener('pagehide',finish);window.removeEventListener('wheel',finish);
      motion.removeEventListener('change',finish);running=null;
      run.deferred?.();
    }
    try{
      run.scene=freezeScene();
      if(!leaving)shape=surface.revealShape();
      surface.begin();
      // Commit immediately while the outgoing image remains visible.
      document.body.classList.add('ink-live-flow');
      commit();window.scrollTo({top:0,behavior:'instant'});surface.end();
      if(leaving)shape=surface.revealShape();
      if(document.body.classList.contains('in-room')===leaving){finish();return;}
      const width=innerWidth,height=innerHeight;
      svg=document.createElementNS(NS,'svg');svg.classList.add('ink-clip-defs');svg.setAttribute('aria-hidden','true');
      const defs=document.createElementNS(NS,'defs'),clip=document.createElementNS(NS,'clipPath');
      clip.id='ink-scene-clip';clip.setAttribute('clipPathUnits','userSpaceOnUse');
      mask=document.createElementNS(NS,'path');mask.setAttribute('clip-rule','evenodd');mask.setAttribute('fill-rule','evenodd');
      clip.append(mask);defs.append(clip);svg.append(defs);document.body.append(svg);
      run.scene.style.clipPath='url(#ink-scene-clip)';
      const outside=`M -4 -4 H ${width+4} V ${height+4} H -4 Z `;
      const paint=p=>{
        // Zero velocity at both ends; acceleration peaks early, then settles gently.
        const eased=p*p*(6+p*(-8+3*p));
        const q=leaving?1-eased:eased;
        mask.setAttribute('d',(leaving?'':outside)+shape(q));
        // The final few pixels of the old Room dissolve back into its entrance.
        run.scene.style.opacity=leaving?String(clamp((1-p)/.14)):'1';
      };
      paint(0);document.body.classList.add('ink-live-flow');
      const duration=leaving?420:520;
      const tick=time=>{
        if(run.done)return;started??=time;
        const p=clamp((time-started)/duration);paint(p);
        if(p===1){finish();return;}run.frame=requestAnimationFrame(tick);
      };
      window.addEventListener('resize',finish,{once:true});window.addEventListener('pagehide',finish,{once:true});
      window.addEventListener('wheel',finish,{once:true,passive:true});motion.addEventListener('change',finish,{once:true});
      run.frame=requestAnimationFrame(tick);
    }catch(error){finish();throw error;}
  }
  function freezeView(root){
    const scene=freezeScene([root]);scene.classList.add('route-ghost');
    scene.style.background='transparent';scene.style.zIndex='50';scene.style.willChange='opacity';
    return scene;
  }
  return {start,freezeView,get active(){return !!running},defer(fn){if(running)running.deferred=fn;else fn();}};
})();
