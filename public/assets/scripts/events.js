window.CanopyEvents=(()=>{
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let events=[],canManage=false,error='',allEvents=[],stops=[],opener=null,editing=null,saving=false;
 let scrollBusy=false,storyMoving=false,pointer=null;
 const scrollSubscribers=new Set();
 // A shared invalidation counter keeps pointer events free of layout reads.
 let geometryEpoch=0;
 document.addEventListener('scroll',()=>{geometryEpoch++;},{capture:true,passive:true});
 window.addEventListener('resize',()=>{geometryEpoch++;},{passive:true});
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),coarse=matchMedia('(hover:none), (pointer:coarse)');
 // Parse at local noon so a calendar date never shifts to the previous day.
 const dateParts=value=>{const [y,m,d]=value.split('-').map(Number),date=new Date(y,m-1,d,12);return {day:String(d).padStart(2,'0'),month:date.toLocaleDateString('en-US',{month:'long'}),weekday:date.toLocaleDateString('en-US',{weekday:'short'}),full:date.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}),group:date.toLocaleDateString('en-US',{month:'long',year:'numeric'})};};
 async function api(action,payload={}){const r=await fetch('/api/events',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...payload}),signal:AbortSignal.timeout(15000)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Couldn’t save this event.');return data;}
 async function load(){try{const r=await fetch('/api/events',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();const data=await r.json();if(!Array.isArray(data.events))throw Error();events=data.events;canManage=data.canManage;error='';}catch{error='Events couldn’t load.';}}
 const ready=load();
 function reveal(e,content,permanent=false){
  return `<div class="event-reveal" aria-hidden="true">${e.image?`<img ${permanent?'src':'data-event-src'}="${esc(e.image)}" alt="" decoding="async" loading="lazy" style="object-position:${e.imageX}% ${e.imageY}%"><div class="event-image-shade"></div>`:''}${content}</div>`;
 }
 function row(e,home=false,featured=false){
  const d=dateParts(e.date),tag='a',arrow='<span class="event-action" aria-hidden="true">↗</span>';
  let copy,layout;
  if(home&&featured){
   return `<a data-event-id="${esc(e.id)}" class="event-entry event-home-feature event-poster-feature has-link" href="#event-${encodeURIComponent(e.id)}"><figure>${e.image?`<img src="${esc(e.image)}" alt="${esc(e.title)} event poster" width="900" height="1200" loading="lazy">`:''}</figure><div class="event-poster-caption"><p class="event-poster-date">${d.full}</p><h3>${esc(e.title)}</h3>${e.description?`<p>${esc(e.description)}</p>`:''}<span class="text-link">View event ↗</span></div></a>`;

  }
  if(home){layout='gathering-next';copy=`<span class="next-date">${d.day}<small>${d.month.slice(0,3).toUpperCase()}</small></span><div><h3>${esc(e.title)}</h3>${e.description?`<p>${esc(e.description)}</p>`:''}</div>${arrow}`;}
  else{layout='event-typesetting';copy=`<div class="event-date"><strong>${d.day}</strong><span>${esc(d.month)} · ${d.weekday}</span></div><div class="event-copy"><h3>${esc(e.title)}</h3>${e.description?`<p>${esc(e.description)}</p>`:''}</div>${arrow}`;}
  return `<${tag} data-event-date="${e.date}" data-event-id="${esc(e.id)}" class="event-entry${home?(featured?' event-home-feature':' event-home-next'):''}${e.image?' has-image':''} has-link" href="#event-${encodeURIComponent(e.id)}" aria-label="${esc(e.title+', '+d.full)}"><div class="${layout}">${copy}</div>${reveal(e,`<div class="${layout}">${copy}</div>`)}</${tag}>`;
 }
 function schedule(home=false){
  if(error)return `<div class="event-empty"><p>${error}</p><button type="button" data-event-action="retry">Try again ↗</button></div>`;
  if(!events.length)return '<div class="event-empty"><p>Nothing on the calendar yet.</p></div>';
  if(home){const {featured,next}=CanopyEventDates.home(events,CanopyEventDates.today());return (featured?row(featured,true,true):'')+(next?agendaRow(next,true):'');}
  const timeline=CanopyEventDates.program(events,CanopyEventDates.today());
  return `<div class="event-program" data-current-month="${CanopyEventDates.today().slice(0,7)}" role="region" aria-label="Monthly calendar">${monthGroups(timeline.events)}</div>`;
 }
 function monthGroups(items){
  const current=CanopyEventDates.today().slice(0,7),groups=new Map([[current,[]]]);
  for(const e of items){const key=e.date.slice(0,7);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e);}
  const months=[...groups.keys()].sort();
  const label=key=>dateParts(key+'-01').group;
  return months.map((key,i)=>{const d=dateParts(key+'-01'),isCurrent=key===current;
   return `<section class="agenda-month" data-month="${key}" aria-label="${label(key)}">
    <header class="agenda-month-header"><h2><time datetime="${key}">${d.month} <span>${key.slice(0,4)}</span></time></h2>
     <nav class="agenda-month-controls" aria-label="Browse months"><button type="button" class="agenda-today" data-agenda-month="${current}"${isCurrent?' disabled aria-current="date"':''}>${isCurrent?'This month':'Back to this month'}</button><button type="button" data-agenda-month="${months[i-1]||''}" aria-label="${i?'Previous month with activities: '+label(months[i-1]):'No earlier activities'}"${i?'':' disabled'}>←</button><button type="button" data-agenda-month="${months[i+1]||''}" aria-label="${i<months.length-1?'Next month with activities: '+label(months[i+1]):'No later activities'}"${i<months.length-1?'':' disabled'}>→</button></nav>
    </header><div class="agenda-month-events">${groups.get(key).map(e=>agendaRow(e)).join('')||'<p class="agenda-month-empty">No dates announced yet.</p>'}</div></section>`;
  }).join('');
 }
 function agendaRow(e,home=false){
  const d=dateParts(e.date),tag='a';
  const copy=()=>`${e.image?`<img class="agenda-poster" src="${esc(e.image)}" alt="${esc(e.title)} event poster" width="150" height="180" loading="lazy">`: '<span class="agenda-poster agenda-poster-empty" aria-hidden="true"></span>'}<div class="event-date"><strong>${d.day}</strong><span>${home?d.month.slice(0,3)+' · ':''}${d.weekday}</span></div><div class="event-copy"><h3>${esc(e.title)}</h3>${e.description?`<p>${esc(e.description)}</p>`:''}${e.sample?'<small>Sample event</small>':''}${e.image?'<span class="agenda-poster-link">View full poster ↗</span>':''}</div><span class="event-action" aria-hidden="true">↗</span>`;
  return `<div class="agenda-row"><${tag} data-event-date="${e.date}" data-event-id="${esc(e.id)}" class="event-entry agenda-entry${home?' event-home-next':''}${e.image?' has-image':''} has-link" href="#event-${encodeURIComponent(e.id)}" aria-label="${esc(e.title+', '+d.full)}"><div class="event-typesetting">${copy()}</div></${tag}></div>`;
 }
 function bindScrollGate(){
  const controller=new AbortController(),options={signal:controller.signal,passive:true};let timer=0;
  scrollBusy=false;storyMoving=false;
  const notify=busy=>{if(scrollBusy===busy)return;scrollBusy=busy;const hit=!busy&&pointer?document.elementFromPoint(pointer.clientX,pointer.clientY):null;scrollSubscribers.forEach(fn=>fn(busy,hit));};
  const settle=()=>{clearTimeout(timer);if(!storyMoving)timer=setTimeout(()=>notify(false),140);};
  const begin=()=>{notify(true);settle();};
  const remember=e=>{if(e.pointerType!=='touch')pointer={clientX:e.clientX,clientY:e.clientY};};
  document.addEventListener('pointermove',remember,options);
  document.addEventListener('pointerout',e=>{if(!e.relatedTarget)pointer=null;},options);
  document.addEventListener('wheel',e=>{if(e.ctrlKey||e.target.closest?.('dialog'))return;remember(e);begin();},{...options,capture:true});
  document.addEventListener('scroll',e=>{
   if(e.target===document||e.target===document.documentElement||e.target.closest?.('#main'))begin();
  },{...options,capture:true});
  document.addEventListener('canopy-story-motion',e=>{storyMoving=e.detail.moving;if(storyMoving)begin();else settle();},options);
  stops.push(()=>{clearTimeout(timer);controller.abort();scrollBusy=false;storyMoving=false;});
 }
 function mount(){
  stops.forEach(stop=>stop());stops=[];
  document.body.classList.toggle('events-page',!!document.querySelector('#main [data-event-list=all]'));
  document.querySelectorAll('#main [data-event-list]').forEach(host=>host.innerHTML=schedule(host.dataset.eventList==='home'));
  document.querySelectorAll('#main [data-event-admin]').forEach(host=>host.innerHTML=canManage?'<button type="button" data-event-action="manage">Manage events ↗</button>':'');
  const revealRows=[...document.querySelectorAll('#main .event-entry')].filter(row=>row.querySelector('.event-reveal')&&!row.classList.contains('event-static'));
  if(revealRows.some(row=>!row.classList.contains('agenda-entry')))bindScrollGate();
  revealRows.forEach(bindReveal);
  document.querySelectorAll('#main .event-program').forEach(bindProgram);
 }
 function bindProgram(program){
  const controller=new AbortController(),options={signal:controller.signal},scroller=program.closest('main'),heading=scroller.querySelector('.page-intro');
  const months=[...program.querySelectorAll('.agenda-month')],current=months.find(month=>month.dataset.month===program.dataset.currentMonth);
  if(!current)return;
  let headerHeight=0;
  const topOf=month=>Math.max(0,month.getBoundingClientRect().top+window.scrollY-headerHeight);
  function resize(){
   const mobileRail=document.querySelector('body>.rail');
   const railHeight=innerWidth<=600?mobileRail.getBoundingClientRect().height:0;
   headerHeight=heading.getBoundingClientRect().height+railHeight;
   scroller.style.setProperty('--agenda-rail-height',railHeight+'px');
   scroller.style.setProperty('--agenda-header-height',headerHeight+'px');
  }
  program.addEventListener('click',event=>{
   const button=event.target.closest('[data-agenda-month]');if(!button||button.disabled)return;
   const month=months.find(month=>month.dataset.month===button.dataset.agendaMonth);if(!month)return;
   // Move focus with the calendar so keyboard navigation continues in the new month.
   month.querySelector('h2').setAttribute('tabindex','-1');month.querySelector('h2').focus({preventScroll:true});
   window.scrollTo({top:topOf(month),behavior:reduced.matches?'instant':'smooth'});
  },options);
  resize();const observer=new ResizeObserver(resize);observer.observe(heading);observer.observe(document.querySelector('body>.rail'));
  stops.push(()=>{controller.abort();observer.disconnect();});
 }
 function bindReveal(row){
  const focusTarget=row;if(row.classList.contains('event-home-feature'))row=row.querySelector('.event-home-window');
  const liquid=row.classList.contains('agenda-entry'),layer=row.querySelector('.event-reveal'),img=layer.querySelector('img');let split=0,digitTop=0,digitBottom=0,fill=0,fillTarget=0,fillVelocity=0,flowOrigin=.5,flowTarget=.5;const liquidOffsets=new Float64Array(25);let frame=0,progress=0,velocity=0,target=0,last=0,hover=false,x=.5,y=.5,tx=.5,ty=.5,w=0,h=0,lastClip=null;
  const controller=new AbortController(),options={signal:controller.signal};
  let cachedRect=null,cachedEpoch=-1;
  const rect=()=>{if(!cachedRect||cachedEpoch!==geometryEpoch){cachedRect=row.getBoundingClientRect();cachedEpoch=geometryEpoch;}return cachedRect;};
  const measure=()=>{cachedRect=null;const r=rect();w=r.width;h=r.height;
   if(liquid){const day=row.querySelector('.event-date strong'),range=document.createRange();range.selectNodeContents(day);const full=range.getBoundingClientRect();range.setStart(day.firstChild,1);split=range.getBoundingClientRect().left-r.left+Math.min(6,full.height*.06);digitTop=full.top-r.top;digitBottom=full.bottom-r.top;}
   return r;
  };
  const point=e=>{const r=(!w||!h)?measure():rect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))];};
  const clip=value=>{if(value!==lastClip){layer.style.clipPath=value;lastClip=value;}};
  function drawLiquid(){
   if(fill>.9995){clip('none');return;}
   const surge=Math.sin(Math.PI*fill);
   const points=Array.from(liquidOffsets,(offset,i)=>{
    const v=i/(liquidOffsets.length-1),py=v*h;
    // The contact point leads; the shoulders follow instead of sliding as one flat wipe.
    const reach=Math.exp(-Math.pow((v-flowOrigin)/.30,2));
    const local=Math.max(0,Math.min(1,fill+surge*(.46*reach-.18)));
    const remaining=1-local;
    const protect=1-.65*Math.exp(-Math.pow((py-(digitTop+digitBottom)/2)/Math.max(1,(digitBottom-digitTop)*.30),2));
    // Broad shoulder, pulled waist, lower pool — the same silhouette language as Room.
    const wave=26*Math.sin(v*Math.PI*2+.2)*Math.sin(Math.PI*v)+8*Math.exp(-Math.pow((v-.60)/.18,2));
    const roll=18*surge*Math.sin((v-flowOrigin)*Math.PI*2.2)*Math.sin(Math.PI*v);
    return [Math.max(-2,split*remaining+(wave*protect+offset*.8+roll)*remaining),py];
   }).reverse();
   let d=`M${points.at(-1)[0]},0L${w},0L${w},${h}L${points[0].join(',')}`;
   for(let i=0;i<points.length-1;i++){
    const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],e=points[Math.min(points.length-1,i+2)];
    d+=`C${b[0]+(c[0]-a[0])/6},${b[1]+(c[1]-a[1])/6} ${c[0]-(e[0]-b[0])/6},${c[1]-(e[1]-b[1])/6} ${c.join(',')}`;
   }
   clip(`path('${d}Z')`);
  }
  function draw(){
   if(liquid){drawLiquid();return;}
   if(coarse.matches||reduced.matches){clip(target?'none':'inset(0 100% 0 0)');return;}
   if(progress<.0005){clip('inset(0 100% 0 0)');return;}
   if(progress>.9995){clip('none');return;}
   const cx=x*w,cy=y*h,reach=Math.hypot(Math.max(cx,w-cx),Math.max(cy,h-cy))*1.12;
   const pts=Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,r=reach*progress*(1+Math.sin(Math.PI*progress)*(.055*Math.sin(a*3-progress*4)+.025*Math.cos(a*5)));return [cx+Math.cos(a)*r,cy+Math.sin(a)*r];});
   let d=`M${pts[0].join(',')}`;for(let i=0;i<12;i++){const a=pts[(i+11)%12],b=pts[i],c=pts[(i+1)%12],e=pts[(i+2)%12];d+=`C${b[0]+(c[0]-a[0])/6},${b[1]+(c[1]-a[1])/6} ${c[0]-(e[0]-b[0])/6},${c[1]-(e[1]-b[1])/6} ${c.join(',')}`;}clip(`path('${d}Z')`);
  }
  if(liquid){
   // Rest at half the date; hovering extends the same surface across the row.
   let disposed=false,edgeFrame=0,edgeLast=0,cursor=null,impulse=0;
   const edgeVelocity=new Float64Array(liquidOffsets.length);
   const paint=()=>{if(disposed||!row.isConnected)return;measure();drawLiquid();};
   paint();row.classList.add('reveal-ready','is-revealed','event-always-visible');
   const animate=now=>{
    edgeFrame=0;if(disposed||!row.isConnected||document.hidden)return;
    const elapsed=edgeLast?Math.min(32,now-edgeLast):16.667;edgeLast=now;
    const steps=Math.max(1,Math.ceil(elapsed/8.333)),dt=elapsed/16.667/steps;
    const influence=cursor?Math.pow(Math.max(0,1-Math.abs(cursor.x-split)/160),2):0;
    let energy=0;
    for(let k=0;k<steps;k++){
     for(let i=1;i<liquidOffsets.length-1;i++){
      const v=i/(liquidOffsets.length-1),distance=cursor?(v*h-cursor.y)/Math.min(65,h*.22):0;
      const local=cursor?Math.exp(-distance*distance/2)*influence*Math.sin(Math.PI*v):0;
      const aim=cursor?local*Math.max(-14,Math.min(22,(cursor.x-split)*.45+12)):0;
      const tension=(liquidOffsets[i-1]+liquidOffsets[i+1]-2*liquidOffsets[i])*.22;
      edgeVelocity[i]+=(aim-liquidOffsets[i])*.045*dt+tension*dt;
      if(k===0)edgeVelocity[i]+=local*impulse;
      edgeVelocity[i]*=Math.pow(.9,dt);
     }
     for(let i=1;i<liquidOffsets.length-1;i++){
      liquidOffsets[i]=Math.max(-18,Math.min(26,liquidOffsets[i]+edgeVelocity[i]*dt));energy+=Math.abs(edgeVelocity[i]);
     }
    }
    const seconds=elapsed/1000;flowOrigin+=(flowTarget-flowOrigin)*(1-Math.exp(-seconds*8));fillVelocity+=(105*(fillTarget-fill)-19*fillVelocity)*seconds;fill=Math.max(0,Math.min(1,fill+fillVelocity*seconds));
    if(Math.abs(fill-fillTarget)<.0005&&Math.abs(fillVelocity)<.006){fill=fillTarget;fillVelocity=0;}
    impulse=0;drawLiquid();
    if(energy>.008||Math.abs(fill-fillTarget)>.0005||Math.abs(fillVelocity)>.006)edgeFrame=requestAnimationFrame(animate);else edgeLast=0;
   };
   const wake=(whileClosing=false)=>{if(document.hidden||(!whileClosing&&document.body.classList.contains('event-detail-open')))return;if(reduced.matches){fill=fillTarget;fillVelocity=0;drawLiquid();return;}if(!edgeFrame&&!coarse.matches){edgeLast=0;edgeFrame=requestAnimationFrame(animate);}};
   row.addEventListener('pointerenter',e=>{
    if(e.pointerType==='touch'||coarse.matches)return;
    cachedRect=null;const r=rect();flowTarget=Math.max(.12,Math.min(.88,(e.clientY-r.top)/r.height));if(fill<.001)flowOrigin=flowTarget;
    cursor={x:e.clientX-r.left,y:e.clientY-r.top,time:e.timeStamp};impulse=-2.4;fillTarget=1;wake();
   },options);
   row.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch'||coarse.matches||reduced.matches)return;
    const r=rect(),previous=cursor;cursor={x:e.clientX-r.left,y:e.clientY-r.top,time:e.timeStamp};
    flowTarget=Math.max(.12,Math.min(.88,cursor.y/Math.max(1,h)));
    if(previous){const dt=Math.max(8,cursor.time-previous.time),speed=(Math.abs(cursor.y-previous.y)+(cursor.x-previous.x)*.7)/dt;impulse=Math.max(-3,Math.min(4,impulse+speed*.9));}
    wake();
   },{...options,passive:true});
   row.addEventListener('pointerleave',()=>{cursor=null;impulse=0;fillTarget=0;wake();},options);
   const settle=()=>{cancelAnimationFrame(edgeFrame);edgeFrame=0;edgeLast=0;cursor=null;fill=fillTarget=fillVelocity=0;liquidOffsets.fill(0);edgeVelocity.fill(0);paint();};
   if(img){img.loading='lazy';img.addEventListener('error',()=>{img.hidden=true;},options);img.src=img.dataset.eventSrc;}
   const observer=new ResizeObserver(paint);observer.observe(row);observer.observe(row.querySelector('.event-date strong'));
   document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();},options);
   document.addEventListener('canopy-event-cover-open',()=>{cancelAnimationFrame(edgeFrame);edgeFrame=0;edgeLast=0;cursor=null;},options);
   // Resume the existing spring beneath the closing page; never snap its pose.
   const returnToRest=()=>{cursor=null;impulse=0;fillTarget=0;wake(true);};
   document.addEventListener('canopy-event-cover-closing',returnToRest,options);
   document.addEventListener('canopy-event-cover-closed',()=>{measure();wake();},options);
   document.fonts.ready.then(paint);reduced.addEventListener('change',settle,options);coarse.addEventListener('change',settle,options);
   stops.push(()=>{disposed=true;cancelAnimationFrame(edgeFrame);controller.abort();observer.disconnect();});
   return;
  }
  function tick(now){frame=0;if(!row.isConnected)return;const dt=Math.min(.032,(now-(last||now-16))/1000);last=now;
   velocity+=(185*(target-progress)-27*velocity)*dt;progress=Math.max(0,Math.min(1,progress+velocity*dt));x+=(tx-x)*(1-Math.exp(-dt*11));y+=(ty-y)*(1-Math.exp(-dt*11));
   if(Math.abs(target-progress)<.0005&&Math.abs(velocity)<.008&&(!liquid||(Math.abs(tx-x)<.001&&Math.abs(ty-y)<.001))){progress=target;velocity=0;draw();last=0;return;}draw();frame=requestAnimationFrame(tick);
  }
  function update(){const next=!scrollBusy&&!document.body.classList.contains('event-detail-open')&&hover?1:0;if(next===target&&(frame||progress===next))return;target=next;if(target&&(!w||!h))measure();row.classList.toggle('is-revealed',!!target);if(!row.classList.contains('reveal-ready'))return;if(coarse.matches||reduced.matches){cancelAnimationFrame(frame);frame=0;progress=target;velocity=0;draw();return;}if(!frame){last=0;frame=requestAnimationFrame(tick);}}
  row.addEventListener('pointerenter',e=>{if(e.pointerType==='touch'||coarse.matches||document.body.classList.contains('event-detail-open'))return;pointer={clientX:e.clientX,clientY:e.clientY};focusTarget.removeAttribute('data-event-pointer-return');[tx,ty]=point(e);if(progress<.001){x=tx;y=ty;}hover=true;update();},options);
  if(liquid)row.addEventListener('pointermove',e=>{
   if(e.pointerType==='touch'||coarse.matches||reduced.matches||scrollBusy||!hover||!target)return;
   [tx,ty]=point(e);if(!frame){last=0;frame=requestAnimationFrame(tick);}
  },{...options,passive:true});
  row.addEventListener('pointerleave',e=>{if(e.pointerType==='touch')return;[tx,ty]=point(e);hover=false;update();},options);
  focusTarget.addEventListener('pointerdown',()=>focusTarget.setAttribute('data-event-pointer-return',''),options);
  focusTarget.addEventListener('keydown',()=>focusTarget.removeAttribute('data-event-pointer-return'),options);
  const clearReveal=()=>{cancelAnimationFrame(frame);frame=0;hover=false;target=0;progress=0;velocity=0;last=0;row.classList.remove('is-revealed');draw();};
  const scrollChanged=(busy,hit)=>{
   if(busy){clearReveal();return;}
   if(coarse.matches||document.body.classList.contains('event-detail-open')||!pointer)return;
   hover=!!hit&&row.contains(hit);
   if(hover){[tx,ty]=point(pointer);x=tx;y=ty;}
   update();
  };
  scrollSubscribers.add(scrollChanged);
  document.addEventListener('canopy-event-cover-open',clearReveal,options);
  document.addEventListener('canopy-event-cover-closed',()=>{if(focusTarget.hasAttribute('data-event-pointer-return'))clearReveal();else update();},options);
  let imageObserver=null;
  let disposed=false;
  const ready=()=>{if(disposed)return;row.classList.add('reveal-ready');update();};
  const decoded=()=>{if(img.decode)img.decode().catch(()=>{}).then(ready);else ready();};
  if(img){
   imageObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){img.src=img.dataset.eventSrc;imageObserver.disconnect();}},{root:row.closest('.event-program')?row.closest('main'):null,rootMargin:'250px'});imageObserver.observe(row);
   img.addEventListener('load',()=>{if(img.naturalWidth)decoded();},options);
   img.addEventListener('error',()=>{img.hidden=true;ready();},options);
   if(img.complete&&img.naturalWidth)decoded();
  }else ready();
  const reset=()=>{w=0;h=0;cancelAnimationFrame(frame);frame=0;progress=target;velocity=0;if(liquid&&target)measure();draw();};window.addEventListener('resize',reset,options);reduced.addEventListener('change',reset,options);coarse.addEventListener('change',reset,options);
  stops.push(()=>{disposed=true;scrollSubscribers.delete(scrollChanged);controller.abort();imageObserver?.disconnect();cancelAnimationFrame(frame);});
 }
 const dialog=document.createElement('dialog');dialog.id='event-manager';dialog.setAttribute('aria-labelledby','event-manager-title');document.body.append(dialog);
 const frame=(title,body)=>`<button type="button" class="event-manager-close" aria-label="Close event manager" data-event-action="close">×</button><h2 id="event-manager-title" tabindex="-1">${title}</h2>${body}`;
 const focusTitle=()=>dialog.querySelector('h2')?.focus({preventScroll:true});
 async function manage(){opener=document.activeElement;dialog.innerHTML=frame('Events.','<p role="status">Loading…</p>');if(!dialog.open)dialog.showModal();focusTitle();try{allEvents=(await api('listEvents')).events;managerList();}catch(e){dialog.innerHTML=frame('Manage events.',`<form id="event-signin"><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><p class="event-form-error" role="alert">${esc(e.message)}</p><button class="button" type="submit">Sign in</button></form>`);}}
 function managerList(){editing=null;dialog.innerHTML=frame('Events.',`<div class="event-manager-toolbar"><button class="button" data-event-action="new">Add event +</button><span>${allEvents.length} events</span></div><div class="event-manager-list">${allEvents.map(e=>`<button data-event-action="edit" data-event-id="${esc(e.id)}"><span><strong>${esc(e.title)}</strong><small>${dateParts(e.date).full}</small></span><span>${esc(e.status)}${e.sample?' · Sample':''} ↗</span></button>`).join('')||'<p>No events yet.</p>'}</div><p class="event-form-error" role="alert"></p>`);focusTitle();}
 function detailBlock(b={type:'text'}){return `<fieldset class="event-detail-block"><div class="event-block-toolbar"><select aria-label="Section layout" data-block-field="type">${[['text','Text'],['image','Full-width image'],['split','Image & text'],['quote','Quote']].map(([value,label])=>`<option value="${value}"${b.type===value?' selected':''}>${label}</option>`).join('')}</select><button type="button" data-event-action="block-up" aria-label="Move section up">↑</button><button type="button" data-event-action="block-down" aria-label="Move section down">↓</button><button type="button" data-event-action="block-remove" aria-label="Remove section">×</button></div><label>Heading<input data-block-field="heading" value="${esc(b.heading)}" maxlength="160"></label><label>Text<textarea data-block-field="body" rows="4" maxlength="4000">${esc(b.body)}</textarea></label><label>Image link<input data-block-field="image" value="${esc(b.image)}" maxlength="2000" placeholder="https://… or /assets/…"></label><label>Caption / credit<input data-block-field="caption" value="${esc(b.caption)}" maxlength="300"></label></fieldset>`;}
 function detailFields(e){const d=e.details||{};return `<details class="event-page-editor"><summary>Detail page</summary><label>Cover layout<select name="detailLayout"><option value="cover"${d.layout!=='editorial'?' selected':''}>Title at the bottom</option><option value="editorial"${d.layout==='editorial'?' selected':''}>Centered title</option></select></label><div class="event-fields"><label>Time <span>optional</span><input name="detailTime" maxlength="100" value="${esc(d.time)}"></label><label>Location <span>optional</span><input name="detailVenue" maxlength="240" value="${esc(d.venue)}"></label></div><div class="event-detail-blocks">${(d.blocks||[]).map(detailBlock).join('')}</div><button type="button" class="event-add-section" data-event-action="block-add">Add section +</button></details>`;}
 function syncBlock(block){const type=block.querySelector('[data-block-field=type]').value;block.querySelector('[data-block-field=heading]').closest('label').hidden=['image','quote'].includes(type);block.querySelector('[data-block-field=body]').closest('label').hidden=type==='image';block.querySelector('[data-block-field=image]').closest('label').hidden=!['image','split'].includes(type);block.querySelector('[data-block-field=caption]').closest('label').hidden=type==='text';}
 function editor(item){editing=item||null;const e=item||{date:'',title:'',imageX:50,imageY:50};dialog.innerHTML=frame(item?'Edit event.':'New event.',`<button class="event-editor-back" data-event-action="back">← All events</button><form id="event-editor"><div class="event-fields"><label>Date<input type="date" name="date" value="${esc(e.date)}" required></label><label>Name<input name="title" value="${esc(e.title)}" maxlength="160" required></label></div><label>Introduction <span>optional</span><textarea name="description" rows="2" maxlength="600">${esc(e.description)}</textarea></label><label>Link <span>optional</span><input name="url" type="url" placeholder="https://" value="${esc(e.url)}" maxlength="2000"></label><label>Image link <span>optional</span><input name="image" placeholder="https://… or /assets/…" value="${esc(e.image)}" maxlength="2000"></label><div class="event-image-editor" ${e.image?'':'hidden'}><img alt="Image crop preview"><div class="event-image-controls"><label>Horizontal focus<input name="imageX" type="range" min="0" max="100" value="${e.imageX}"></label><label>Vertical focus<input name="imageY" type="range" min="0" max="100" value="${e.imageY}"></label></div><p class="event-image-error" role="status" hidden>Image couldn’t load. Check the link.</p></div>${detailFields(e)}<p class="event-form-error" role="alert"></p><div class="event-editor-actions"><button type="submit" name="status" value="draft">Save draft</button>${item?'<button type="submit" name="status" value="archived">Archive</button>':''}<button class="button" type="submit" name="status" value="published">${item?.status==='published'?'Save changes':'Publish'}</button></div></form>`);updateImage();dialog.querySelectorAll('.event-detail-block').forEach(syncBlock);focusTitle();}
 function updateImage(){const f=dialog.querySelector('#event-editor');if(!f)return;const box=f.querySelector('.event-image-editor'),img=box.querySelector('img'),url=f.elements.image.value.trim();box.hidden=!url;
  if(url!==img.dataset.source){img.dataset.source=url;const allowed=/^https?:\/\//i.test(url)||/^\/assets\/[a-zA-Z0-9_.-]+$/.test(url);box.querySelector('.event-image-error').hidden=true;img.onload=()=>box.querySelector('.event-image-error').hidden=true;img.onerror=()=>box.querySelector('.event-image-error').hidden=false;if(allowed)img.src=url;else img.removeAttribute('src');}
  img.style.objectPosition=f.elements.imageX.value+'% '+f.elements.imageY.value+'%';
 }
 document.addEventListener('click',async e=>{const b=e.target.closest('[data-event-action]');if(!b||b.closest('.route-ghost'))return;const act=b.dataset.eventAction;
  if(act.startsWith('block-')){const block=b.closest('.event-detail-block'),list=dialog.querySelector('.event-detail-blocks');if(act==='block-add'&&list.children.length<12){list.insertAdjacentHTML('beforeend',detailBlock());syncBlock(list.lastElementChild);list.lastElementChild.querySelector('select').focus();}if(act==='block-remove')block.remove();if(act==='block-up'&&block.previousElementSibling)list.insertBefore(block,block.previousElementSibling);if(act==='block-down'&&block.nextElementSibling)list.insertBefore(block.nextElementSibling,block);return;}
  if(act==='manage')manage();else if(act==='retry'){await load();mount();}else if(act==='close')dialog.close();else if(!saving){if(act==='new')editor();if(act==='edit')editor(allEvents.find(e=>e.id===b.dataset.eventId));if(act==='back')managerList();}
 });
 dialog.addEventListener('close',()=>opener?.isConnected&&opener.focus({preventScroll:true}));
 dialog.addEventListener('change',e=>{if(e.target.matches('[data-block-field=type]'))syncBlock(e.target.closest('.event-detail-block'));});
 dialog.addEventListener('input',e=>{if(e.target.matches('[name=image],[type=range]'))updateImage();});
 dialog.addEventListener('submit',async e=>{if(!['event-editor','event-signin'].includes(e.target.id))return;e.preventDefault();if(saving)return;saving=true;const form=e.target,values=Object.fromEntries(new FormData(form)),message=form.querySelector('.event-form-error'),buttons=[...form.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);message.textContent='';try{
  if(form.id==='event-signin'){await api('signin',values);allEvents=(await api('listEvents')).events;await load();mount();managerList();}
  else{const details={layout:values.detailLayout,time:values.detailTime,venue:values.detailVenue,blocks:[...form.querySelectorAll('.event-detail-block')].map(block=>Object.fromEntries([...block.querySelectorAll('[data-block-field]')].map(input=>[input.dataset.blockField,input.value]))).filter(b=>b.heading||b.body||b.image||b.caption)};await api('saveEvent',{...values,details,imageX:Number(values.imageX),imageY:Number(values.imageY),status:e.submitter?.value||'draft',...(editing?{id:editing.id,revision:editing.revision}:{})});allEvents=(await api('listEvents')).events;await load();mount();managerList();}
 }catch(err){message.textContent=err.name==='TimeoutError'?'The request timed out. Your changes are still here.':err.message||'Couldn’t save. Try again.';}finally{saving=false;buttons.forEach(b=>b.disabled=false);}});
 return {ready,mount,manage,get:id=>events.find(e=>e.id===id),all:()=>events.slice()};
})();
