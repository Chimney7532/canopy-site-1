/* One ink surface. Pointer energy travels along a damped, elastic edge. */
window.LiquidRail=(()=>{
  const NS='http://www.w3.org/2000/svg',layer=document.createElement('div');
  layer.id='liquid-rail';layer.setAttribute('aria-hidden','true');
  const svg=document.createElementNS(NS,'svg'),path=document.createElementNS(NS,'path');
  path.setAttribute('fill','#171715');svg.append(path);layer.append(svg);document.body.append(layer);
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const count=41,position=new Float64Array(count),velocity=new Float64Array(count);
  let frame=0,travelling=false,last=0,width=innerWidth,height=innerHeight,held=null;
  let pointer=null,pendingImpulse=0,geometry=null,syncFrame=0;
  const rail=document.querySelector('.rail'),link=document.querySelector('.rail [data-route="members"]'),shell=document.querySelector('.shell');
  const phase=()=>0; // A resting surface does not run an unrelated looping animation.
  const room=()=>document.body.classList.contains('in-room');
  const mobile=()=>width<=600;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const wave=v=>Math.sin(v*5.7)+.23*Math.sin(v*10);
  function resize(){geometry=null;width=innerWidth;height=innerHeight;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('preserveAspectRatio','none');}
  function measure(){
    if(geometry)return geometry;
    // Read layout once after an actual layout change, never between SVG frame writes.
    const r=rail?.getBoundingClientRect(),l=link?.getBoundingClientRect();
    return geometry={edge:mobile()?Math.max(0,(l?.bottom||0)+4):(r?.width||180),
      ...(mobile()?{top:(l?.left||300)-10,bottom:(l?.right||350)+10,start:(l?.top||50)-6}
        :{top:(l?.top||299)-8,bottom:(l?.bottom||351)+10,start:8}),
      gutter:parseFloat(getComputedStyle(shell).paddingLeft)||30};
  }
  const edge=()=>measure().edge;
  function contour(v){
    // A broad shoulder, a pulled-in waist, and a rounded lower pool.
    return 10*Math.sin(v*Math.PI)-5*Math.exp(-Math.pow((v-.59)/.14,2))
      -92*Math.pow(Math.max(0,1-v/.16),2)-70*Math.pow(Math.max(0,(v-.86)/.14),2);
  }
  function draw(base,offsets,vertical=mobile()){
    const span=vertical?width:height;
    const limits=measure();
    const expansion=clamp((base-limits.edge)/((vertical?height:width)+3-limits.edge),0,1);
    const top=limits.top*(1-expansion)-2*expansion;
    const bottom=limits.bottom*(1-expansion)+(span+2)*expansion;
    const start=limits.start*(1-expansion)-2*expansion;
    const step=(bottom-top)/(offsets.length-1);
    const points=Array.from(offsets,(x,i)=>[base+x+contour(i/(count-1))*(vertical?.08:1)*(1-expansion),top+i*step]);
    let d=`M ${start} ${top+8*(1-expansion)} C ${start+(base-start)*.2} ${top-5*(1-expansion)} ${points[0][0]-(points[1][0]-points[0][0])/6} ${top-step/6} ${points[0][0]} ${top}`;
    for(let i=0;i<points.length-1;i++){
      const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],e=points[Math.min(points.length-1,i+2)];
      d+=` C ${b[0]+(c[0]-a[0])/6} ${b[1]+(c[1]-a[1])/6} ${c[0]-(e[0]-b[0])/6} ${c[1]-(e[1]-b[1])/6} ${c[0]} ${c[1]}`;
    }
    const end=points.at(-1);
    d+=` C ${end[0]+(end[0]-points.at(-2)[0])/6} ${bottom+step/6} ${start+(base-start)*.18} ${bottom+6*(1-expansion)} ${start} ${bottom-8*(1-expansion)} Q ${start-7*(1-expansion)} ${(top+bottom)/2} ${start} ${top+8*(1-expansion)} Z`;
    path.setAttribute('transform',vertical?'matrix(0 1 1 0 0 0)':'');
    path.setAttribute('d',d);
  }
  function paint(base,amplitude,t,vertical=mobile(),inherit=0){
    draw(base,Array.from({length:count},(_,i)=>amplitude*wave(i/(count-1))+(held?.[i]||0)*inherit),vertical);
  }
  function full(){path.removeAttribute('transform');path.setAttribute('d',`M -2 -2 H ${width+2} V ${height+2} H -2 Z`);}
  function idle(time){
    frame=0;if(travelling||document.hidden)return;
    if(room()){full();return;}
    const limits=measure(),e=limits.edge,span=mobile()?width:limits.bottom-limits.top;
    if(reduced.matches||mobile()){
      position.fill(0);velocity.fill(0);if(e>0)paint(e,reduced.matches?0:3,0);else path.setAttribute('d','');return;
    }
    const elapsed=last?Math.min(32,time-last):16.667;last=time;
    const steps=Math.max(1,Math.ceil(elapsed/8.333)),dt=elapsed/16.667/steps;
    const cursorEdge=e+contour(clamp(((pointer?.y||0)-limits.top)/span,0,1));
    const influence=pointer?Math.pow(Math.max(0,1-Math.abs(pointer.x-cursorEdge)/125),2):0;
    const gutter=limits.gutter;
    const outward=Math.max(10,Math.min(29,gutter-28)),inward=9;
    for(let k=0;k<steps;k++){
      for(let i=0;i<count;i++){
        const y=limits.top+span*i/(count-1),distance=pointer?(y-pointer.y)/Math.min(65,span*.22):0;
        const local=pointer?Math.exp(-distance*distance/2)*influence:0;
        const target=pointer?local*clamp((pointer.x-cursorEdge)*.65+20,-inward,outward):0;
        const tension=(position[Math.max(0,i-1)]+position[Math.min(count-1,i+1)]-2*position[i])*.22;
        velocity[i]+=(target-position[i])*.045*dt+tension*dt;
        if(k===0)velocity[i]+=local*pendingImpulse;
        velocity[i]*=Math.pow(.9,dt);
      }
      for(let i=0;i<count;i++){
        position[i]=clamp(position[i]+velocity[i]*dt,-inward,outward);
        if(position[i]===-inward||position[i]===outward)velocity[i]*=.5;
      }
    }
    pendingImpulse=0;
    draw(e,Array.from(position,(x,i)=>x+3*wave(i/(count-1))));
    const moving=velocity.some(v=>Math.abs(v)>.003);
    if(moving)frame=requestAnimationFrame(idle);else last=0;
  }
  function wake(){if(!frame&&!travelling&&!room()&&!document.hidden)frame=requestAnimationFrame(idle);}
  function release(){pointer=null;pendingImpulse=0;wake();}
  window.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||reduced.matches||mobile()||travelling||room())return;
    // Resting ink does no work for a pointer outside the Room interaction area.
    const b=measure();
    if(Math.abs(event.clientX-b.edge)>150||event.clientY<b.top-80||event.clientY>b.bottom+80){
      if(pointer)release();return;
    }
    const now=performance.now(),previous=pointer;
    pointer={x:event.clientX,y:event.clientY,time:now};
    if(previous){
      const delta=Math.max(8,now-previous.time),speed=(Math.abs(pointer.y-previous.y)+(pointer.x-previous.x)*.7)/delta;
      pendingImpulse=clamp(pendingImpulse+speed*.9,-3,4);
    }
    wake();
  },{passive:true});
  document.addEventListener('pointerleave',release);window.addEventListener('blur',release);
  function sync(){cancelAnimationFrame(syncFrame);syncFrame=0;if(travelling)return;cancelAnimationFrame(frame);frame=0;resize();last=0;idle(performance.now());}
  function scheduleSync(){geometry=null;if(!syncFrame&&!travelling&&!document.hidden)syncFrame=requestAnimationFrame(sync);}
  function begin(){cancelAnimationFrame(syncFrame);syncFrame=0;cancelAnimationFrame(frame);frame=0;travelling=true;resize();held=Array.from(position);pointer=null;pendingImpulse=0;layer.classList.add('travelling');return {width,height,mobile:mobile(),edge:edge(),phase:phase()};}
  function end(){travelling=false;held=null;position.fill(0);velocity.fill(0);layer.classList.remove('travelling');sync();}
  window.addEventListener('resize',()=>{pointer=null;scheduleSync()});
  window.addEventListener('scroll',()=>{if(mobile()&&!travelling)scheduleSync()},{passive:true});
  document.querySelector('.primary-nav')?.addEventListener('scroll',()=>{if(mobile())scheduleSync()},{passive:true});
  document.addEventListener('visibilitychange',()=>{release();sync()});reduced.addEventListener('change',()=>{release();sync()});
  function revealShape(seed){
    // Sample the actual resting/dragged silhouette, including its mobile transform.
    const length=seed?0:path.getTotalLength(),vertical=mobile(),points=seed?.points||Array.from({length:96},(_,i)=>{
      const point=path.getPointAtLength(length*i/96);
      return vertical?{x:point.y,y:point.x}:{x:point.x,y:point.y};
    });
    const box=points.reduce((b,p)=>({left:Math.min(b.left,p.x),right:Math.max(b.right,p.x),top:Math.min(b.top,p.y),bottom:Math.max(b.bottom,p.y)}),{left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity});
    const cx=seed?.center?.x??(box.left+box.right)/2,cy=seed?.center?.y??(box.top+box.bottom)/2;
    const screenWidth=seed?.width??width,screenHeight=seed?.height??height;
    const radius=Math.max(...[[0,0],[screenWidth,0],[0,screenHeight],[screenWidth,screenHeight]].map(([x,y])=>Math.hypot(x-cx,y-cy)))+60;
    const rays=points.map(point=>{
      const dx=point.x-cx,dy=point.y-cy,r=Math.hypot(dx,dy);
      return {r,angle:Math.atan2(dy,dx),x:dx/r,y:dy/r};
    });
    return (progress,shrink=1)=>{
      const q=clamp(progress,0,1),ripple=Math.sin(Math.PI*q);
      const expanded=rays.map(ray=>{
        const reach=(ray.r+(radius-ray.r)*q+Math.sin(ray.angle*3-q*5)*ripple*28)*clamp(shrink,0,1);
        return {x:cx+ray.x*reach,y:cy+ray.y*reach};
      });
      let d=`M ${expanded[0].x} ${expanded[0].y}`;
      for(let i=0;i<expanded.length;i++){
        const a=expanded[(i+expanded.length-1)%expanded.length],b=expanded[i],c=expanded[(i+1)%expanded.length],e=expanded[(i+2)%expanded.length];
        d+=` C ${b.x+(c.x-a.x)/6} ${b.y+(c.y-a.y)/6} ${c.x-(e.x-b.x)/6} ${c.y-(e.y-b.y)/6} ${c.x} ${c.y}`;
      }
      return d+' Z';
    };
  }
  if(typeof ResizeObserver!=='undefined'){
    const observer=new ResizeObserver(scheduleSync);[rail,link,shell].filter(Boolean).forEach(el=>observer.observe(el));
  }
  document.fonts?.ready.then(scheduleSync);
  sync();return {begin,end,paint,full,sync,edge,phase,revealShape};
})();
