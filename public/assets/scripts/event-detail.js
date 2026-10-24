/* Event pages share a shell and transition; each event owns its content blocks. */
window.CanopyEventPage=(()=>{
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const panel=document.createElement('dialog');panel.id='event-page';panel.setAttribute('aria-labelledby','event-page-title');document.body.append(panel);
 let kind='event',current=null,origin=null,pending=null,serial=0,stopAnimation=()=>{},closing=null,oldTitle='',moving=null;
 const date=value=>new Date(value+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
 const paragraphs=value=>String(value||'').split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('');
 function block(b){
  const copy=`${b.heading?`<h2>${esc(b.heading)}</h2>`:''}${paragraphs(b.body)}`,picture=b.image?`<figure><img src="${esc(b.image)}" alt="${esc(b.caption||'')}" loading="lazy">${b.caption?`<figcaption>${esc(b.caption)}</figcaption>`:''}</figure>`:'';
  if(b.type==='image')return picture?`<section class="event-content-block block-image">${picture}</section>`:'';
  if(b.type==='quote')return b.body?`<blockquote class="event-content-block block-quote">${paragraphs(b.body)}${b.caption?`<cite>${esc(b.caption)}</cite>`:''}</blockquote>`:'';
  return copy||picture?`<section class="event-content-block block-${b.type==='split'?'split':'text'}">${b.type==='split'?picture:''}<div>${copy}</div></section>`:'';
 }
 function markup(e){
  if(kind==='person')return CanopyPeople.markup(e);
  if(kind==='project')return CanopyProjectPages.markup(e,origin);
  if(kind==='read')return CanopyRead.markup(e,origin);
  if(!e)return '<article class="event-detail-content"><header class="detail-nav"><button data-detail-back>← All events</button></header><section class="detail-hero"><h1 id="event-page-title">Event unavailable.</h1><p>This event is no longer published.</p></section></article>';
  const details=e.details||{};
  const photos=(details.blocks||[]).filter(b=>b.type==='image'&&b.image&&b.image!==e.image);
  return `<article class="event-detail-content poster-detail"><header class="detail-nav on-paper"><button type="button" data-detail-back>← All events</button><a href="#home" aria-label="Canopy home">CANOPY</a></header><div class="poster-layout"><figure class="poster-stage">${e.image?`<img src="${esc(e.image)}" alt="${esc(e.title)} event poster" width="900" height="1200">`:'<div class="poster-no-image">Coming together.</div>'}</figure><section class="poster-summary"><p class="poster-date"><time datetime="${esc(e.date)}">${date(e.date)}</time></p><h1 id="event-page-title">${esc(e.title)}</h1>${e.description?`<p class="poster-introduction">${esc(e.description)}</p>`:''}${details.venue?`<p class="poster-venue">${esc(details.venue)}</p>`:''}</section></div>${photos.length?`<section class="poster-gallery" aria-label="Event moments">${photos.map(p=>`<figure><img src="${esc(p.image)}" alt="${esc(p.caption||'Community conversation at the event')}" loading="lazy" width="1500" height="1000"></figure>`).join('')}</section>`:''}<footer class="detail-footer"><button type="button" data-detail-back>Back to all events ↖</button></footer></article>`;

 }
 document.addEventListener('click',event=>{
  const link=event.target.closest('a.event-entry[data-event-id],a.project-focus-cover[href^="#project-"],a[data-read-id],a[data-person-id]');if(!link||event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.closest('.route-ghost'))return;
  const box=(link.closest('.read-statement')||link.querySelector('.event-home-window')||link).getBoundingClientRect();
  pending={id:link.dataset.personId||link.dataset.readId||link.dataset.eventId||link.getAttribute('href').slice(9),kind:link.dataset.personId?'person':link.dataset.readId?'read':link.classList.contains('project-focus-cover')?'project':'event',el:link,hash:location.hash||'#home',fromClick:true,keyboard:event.detail===0,
   point:{u:event.detail?Math.max(.12,Math.min(.88,(event.clientX-box.left)/box.width)):.5,v:event.detail?Math.max(.15,Math.min(.85,(event.clientY-box.top)/box.height)):.5}};
 },true);
 function sourceRect(){
  if(kind==='person'&&origin&&!origin.el?.isConnected)origin.el=[...document.querySelectorAll('#main [data-person-id]')].find(el=>el.dataset.personId===origin.id);
  const el=origin?.el?.isConnected?(origin.el.closest('.read-statement')?.querySelector('.read-ink')||origin.el.querySelector('.read-article-action')||origin.el.querySelector('.event-home-window')||origin.el.querySelector('.atlas-dot')||origin.el):null,r=el?.getBoundingClientRect();
  return r&&r.bottom>0&&r.top<innerHeight?{x:r.x,y:r.y,w:r.width,h:r.height}:{x:innerWidth*.43,y:innerHeight*.43,w:innerWidth*.14,h:innerHeight*.14};
 }
 // The same radial liquid silhouette and easing used by Room, seeded at the event.
 function eventInkShape(){
  const r=sourceRect(),point=kind==='read'?{u:.5,v:.5}:origin?.point||{u:.5,v:.5};
  const center={x:r.x+r.w*point.u,y:r.y+r.h*point.v};
  if(kind==='person'&&origin?.el?.matches('.atlas-node')){const points=Array.from({length:96},(_,i)=>{const a=i*Math.PI*2/96;return {x:r.x+r.w/2+Math.cos(a)*r.w/2,y:r.y+r.h/2+Math.sin(a)*r.h/2};});return LiquidRail.revealShape({points,center:{x:r.x+r.w/2,y:r.y+r.h/2},width:innerWidth,height:innerHeight});}
  const ink=origin?.el?.closest('.read-statement')?.querySelector('.read-ink svg path');
  if(ink){
   const length=ink.getTotalLength();
   const points=Array.from({length:96},(_,i)=>{const p=ink.getPointAtLength(length*i/96);return {x:r.x+p.x*r.w/1000,y:r.y+p.y*r.h/220};});
   return LiquidRail.revealShape({points,center:{x:r.x+r.w/2,y:r.y+r.h/2},width:innerWidth,height:innerHeight});
  }
  // Sample the row boundary along rays from the click. As in Room, each ray
  // travels outwards independently, rounding the corners into a flowing pool.
  const points=Array.from({length:96},(_,i)=>{
   const angle=i*Math.PI*2/96,dx=Math.cos(angle),dy=Math.sin(angle);
   const horizontal=Math.abs(dx)<1e-8?Infinity:(dx>0?r.x+r.w-center.x:center.x-r.x)/Math.abs(dx);
   const vertical=Math.abs(dy)<1e-8?Infinity:(dy>0?r.y+r.h-center.y:center.y-r.y)/Math.abs(dy);
   const reach=Math.min(horizontal,vertical);
   return {x:center.x+dx*reach,y:center.y+dy*reach};
  });
  return LiquidRail.revealShape({points,center,width:innerWidth,height:innerHeight});
 }
 function motionPose(){return moving?{...moving,id:current?.id}:null;}
 function animate(opening,e,token,pose=null){
  const NS='http://www.w3.org/2000/svg';
  const shape=pose?.shape||eventInkShape(),startQ=pose?.q??(opening?0:1),endQ=opening?1:0;
  const readSeed=kind==='read'&&origin?.el?.isConnected&&origin.el.closest('.read-statement');
  const startShrink=pose?.shrink??1,endShrink=opening||readSeed?1:0;
  const duration=reduced.matches?0:(opening?480:360)*Math.max(.25,Math.abs(endQ-startQ));
  const svg=document.createElementNS(NS,'svg'),defs=document.createElementNS(NS,'defs'),clip=document.createElementNS(NS,'clipPath'),mask=document.createElementNS(NS,'path');
  svg.classList.add('event-liquid-defs');svg.setAttribute('aria-hidden','true');
  clip.id='event-liquid-clip';clip.setAttribute('clipPathUnits','userSpaceOnUse');clip.append(mask);defs.append(clip);svg.append(defs);panel.append(svg);
  let label=null;
  if(readSeed){
   const r=sourceRect();label=document.createElement('div');label.className='home-read read-transition-preview';label.setAttribute('aria-hidden','true');
   const copy=readSeed.cloneNode(true);copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));copy.querySelectorAll('.read-ink,.read-media-cover').forEach(el=>el.remove());
   copy.querySelectorAll('a,button').forEach(el=>el.tabIndex=-1);copy.style.height=r.h+'px';label.append(copy);
   Object.assign(label.style,{position:'fixed',zIndex:'8',pointerEvents:'none',left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});panel.append(label);
  }
  panel.classList.toggle('read-ink-flow',!!readSeed);
  let frame=0,started=null,settled=false;
  panel.classList.add('is-expanding');panel.style.clipPath='url(#event-liquid-clip)';
  const paint=(q,shrink)=>{
   moving={shape,q,shrink};mask.setAttribute('d',shape(q,shrink));
   if(kind==='person'){const t=Math.max(0,Math.min(1,(q-.15)/.65));panel.style.setProperty('--person-reveal',String(t*t*(3-2*t)));}
   if(readSeed){const t=Math.max(0,Math.min(1,(q-.18)/.6));panel.style.setProperty('--read-reveal',String(t*t*(3-2*t)));label.style.opacity=String(1-Math.min(1,q/.16));}
  };
  paint(startQ,startShrink);
  return new Promise(resolve=>{
   const finish=()=>{
    if(settled)return;settled=true;cancelAnimationFrame(frame);
    window.removeEventListener('resize',finish);window.removeEventListener('pagehide',finish);reduced.removeEventListener('change',finish);
    if(!opening&&token===serial)panel.close();
    panel.style.clipPath='';panel.classList.remove('is-expanding','read-ink-flow');panel.style.removeProperty('--read-reveal');panel.style.removeProperty('--person-reveal');label?.remove();svg.remove();moving=null;resolve();
   };
   stopAnimation=finish;window.addEventListener('resize',finish,{once:true});window.addEventListener('pagehide',finish,{once:true});reduced.addEventListener('change',finish,{once:true});
   const tick=now=>{
    if(token!==serial){finish();return;}started??=now;
    const p=duration?Math.min(1,(now-started)/duration):1;
    const eased=(1-(1+7*p)*Math.exp(-7*p))/(1-8*Math.exp(-7));
    paint(startQ+(endQ-startQ)*eased,startShrink+(endShrink-startShrink)*eased);
    if(p===1)finish();else frame=requestAnimationFrame(tick);
   };
   if(!duration){paint(endQ,endShrink);finish();}else frame=requestAnimationFrame(tick);
  });
 }
 function requestBack(){if(origin?.fromClick&&history.length>1)history.back();else location.replace(origin?.hash||(kind==='person'?'#people':kind==='read'?'#home':kind==='project'?'#projects':'#events'));}
 panel.addEventListener('click',event=>{if(event.target.closest('[data-detail-back]'))requestBack();if(event.target.closest('[data-detail-read]'))panel.querySelector('.detail-body')?.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});});
 panel.addEventListener('cancel',event=>{event.preventDefault();requestBack();});
 panel.addEventListener('pointerdown',()=>panel.classList.add('pointer-navigation'),{capture:true});
 panel.addEventListener('keydown',()=>panel.classList.remove('pointer-navigation'),{capture:true});
 panel.addEventListener('scroll',()=>{const nav=panel.querySelector('.detail-nav'),hero=panel.querySelector('.detail-hero');if(nav&&hero)nav.classList.toggle('on-paper',hero.getBoundingClientRect().bottom<nav.getBoundingClientRect().bottom);},{passive:true});
 function open(id,nextKind='event'){
  let decoded;try{decoded=decodeURIComponent(id);}catch{decoded=id;}
  const e=nextKind==='person'?CanopyPeople.get(decoded):nextKind==='read'?CanopyRead.get(decoded):nextKind==='project'?CanopyProjectPages.get(decoded):CanopyEvents.get(decoded)||CanopyEvents.get('sample-'+decoded);
  if(panel.open&&kind===nextKind&&current?.id===e?.id&&!closing)return;
  const pose=kind===nextKind?motionPose():null;serial++;stopAnimation();closing=null;kind=nextKind;
  if(!panel.open){
   oldTitle=document.title;
   const link=kind==='person'?[...document.querySelectorAll('#main [data-person-id]')].find(el=>el.dataset.personId===decoded):kind==='read'?[...document.querySelectorAll('#main [data-read-id]')].find(el=>el.dataset.readId===decoded):kind==='project'?[...document.querySelectorAll('#main .project-focus-cover')].find(el=>el.getAttribute('href')==='#project-'+decoded):[...document.querySelectorAll('#main .event-entry')].find(el=>el.dataset.eventId===e?.id);
   origin=pending?.kind===kind&&pending.id===e?.id?pending:origin?.kind===kind&&origin.id===e?.id&&origin.el?.isConnected?{...origin,fromClick:true}:{id:e?.id,kind,el:link,hash:kind==='person'?'#people':kind==='read'?'#home':kind==='project'?'#projects':'#events',fromClick:false};
  }
  pending=null;current=e||null;
  panel.classList.toggle('pointer-navigation',!origin?.keyboard);panel.classList.toggle('project-page',kind==='project');panel.classList.toggle('read-page',kind==='read');panel.classList.toggle('person-page',kind==='person');
  document.dispatchEvent(new Event('canopy-event-cover-open'));
  panel.innerHTML=markup(e);panel.scrollTop=0;
  panel.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.style.display='none';},{once:true}));
  if(!panel.open)panel.showModal();panel.scrollTo({top:0,behavior:'instant'});document.body.classList.add('event-detail-open');document.title=(e?.title||(kind==='read'?'Story unavailable':kind==='project'?'Project unavailable':'Event unavailable'))+' — Canopy';
  const token=serial;animate(true,e,token,pose?.id===e?.id?pose:null).then(()=>{if(token===serial){const heading=panel.querySelector('h1');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});}});
 }
 function close(){
  if(!panel.open)return Promise.resolve();if(closing)return closing;
  panel.querySelectorAll('video').forEach(video=>video.pause());
  panel.querySelectorAll('iframe').forEach(frame=>frame.remove());
  const pose=motionPose(),keyboardReturn=!panel.classList.contains('pointer-navigation');serial++;stopAnimation();const token=serial;
  document.dispatchEvent(new Event('canopy-event-cover-closing'));
  closing=animate(false,current,token,pose).then(()=>{if(token!==serial)return;panel.close();panel.innerHTML='';document.body.classList.remove('event-detail-open');document.title=oldTitle;if(origin?.el?.isConnected){origin.el.toggleAttribute('data-event-pointer-return',!keyboardReturn);origin.el.focus({preventScroll:true});}
   document.dispatchEvent(new Event('canopy-event-cover-closed'));current=null;closing=null;});return closing;
 }
 return {open,close,get active(){return panel.open;}};
})();
