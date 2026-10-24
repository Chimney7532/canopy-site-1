/* Public reading is curated separately from the member-only Room. */
window.CanopyRead=(()=>{
 const content=window.CanopyReadContent||{featuredId:null,items:[]};
 const get=id=>content.items.find(item=>item.id===id)||null;
 const mediaUrl=value=>typeof value==='string'&&(/^(https?:)\/\//i.test(value)||/^\/(?!\/)/.test(value))?value:'';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const inkPath='M 9 24 C 230 -3 604 5 977 17 C 1002 22 994 69 984 107 C 976 139 999 177 976 201 C 711 222 284 213 15 202 C 2 155 0 73 9 24 Z';
 const fallback={featuredId:content.featuredId,items:content.items.slice()};
 function setPublished(item){content.items=fallback.items.filter(i=>i.id!==item?.id);if(item)content.items.push(item);content.featuredId=item?.id||fallback.featuredId;}
 function embedURL(src){try{const u=new URL(src),h=u.hostname.replace(/^www\./,'');if(u.protocol!=='https:')return '';if(['youtube.com','m.youtube.com','youtu.be','youtube-nocookie.com'].includes(h)){const id=h==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1];return /^[\w-]{11}$/.test(id||'')?'https://www.youtube-nocookie.com/embed/'+id:'';}if(h==='vimeo.com'||h==='player.vimeo.com'){const id=u.pathname.match(/(?:^\/|\/video\/)(\d+)(?:\/|$)/)?.[1];return id?'https://player.vimeo.com/video/'+id:'';}}catch{}return '';}
 function videoMarkup(item){const src=mediaUrl(item.video?.src),embed=embedURL(src),poster=mediaUrl(item.video?.poster);return embed?`<iframe src="${esc(embed)}" title="${esc(item.title||'Video preview')}" allow="fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`:src?`<video controls playsinline preload="metadata" aria-label="${esc(item.title)}" src="${esc(src)}"${poster?` poster="${esc(poster)}"`:''}></video>`:'<p>Add a video link to preview it.</p>';}
 function videoSlot(item){
  const playable=item?.format==='video'&&mediaUrl(item.video?.src);
  const heading='<span class="read-article-meta read-watch-meta"><strong>Most watched in Room</strong></span>';
  return heading+(playable?`<button type="button" class="read-video-launch" aria-label="${esc('Play '+item.title)}"><span class="read-video-symbol" aria-hidden="true">▶</span><span class="read-video-caption">${esc(item.title)}</span></button>`:'<div class="read-video-empty"><h3 class="read-statement-heading">Films &amp; <br>conversations.</h3><p>Coming soon.</p></div>');
 }
 function teaser(){
  const item=get(content.featuredId);if(!item)return '';
  const article=item.format==='article'?item:fallback.items.find(entry=>entry.format==='article'),video=item.format==='video',mode=video?'watch':'read',poster=video?mediaUrl(item.video?.poster):'';
  const title=esc(article.title),body=article.paragraphs?.[0]||article.excerpt||'';
  const preview=body;
  const words=[article.title,article.excerpt,...(article.paragraphs||[])].join(' ').trim().split(/\s+/).length;
  const readingTime=Math.max(1,Math.ceil(words/220));
  const roomPick=article.source?.type==='room'&&article.source?.selection==='most-read';
  const context=`<strong>Most read in Room</strong>${roomPick?'<span>'+readingTime+' min read</span>':''}`;
  return `<div class="read-statement" data-mode="${mode}"><span class="read-ink" aria-hidden="true"><svg viewBox="0 0 1000 220" preserveAspectRatio="none"><path fill="#171715" d="${inkPath}"/><defs><clipPath id="read-screen-clip" clipPathUnits="objectBoundingBox"><path transform="scale(.001 .00454545)" d="${inkPath}"/></clipPath></defs></svg></span>${poster?`<span class="read-media-cover" aria-hidden="true"><img src="${esc(poster)}" alt="" loading="lazy"></span>`:''}<div class="read-screen"><div class="read-article-panel" id="read-screen-article" role="tabpanel" aria-labelledby="read-tab-article"${video?' hidden':''}><a class="read-article-link" href="#read-${encodeURIComponent(article.id)}" data-read-id="${esc(article.id)}" aria-label="${esc('Read '+article.title)}"><span class="read-article-meta">${context}</span><h3 class="read-statement-heading">${title}</h3><p class="read-article-excerpt">${esc(preview)}</p><span class="read-article-action">Read article</span></a></div><div class="read-video-slot" id="read-screen-video" role="tabpanel" aria-labelledby="read-tab-video"${video?` data-video-id="${esc(item.id)}"`:' hidden'}>${videoSlot(item)}</div></div><div class="read-panel-footer"><div class="read-format-tabs" role="tablist" aria-label="Read or watch"><button type="button" id="read-tab-article" role="tab" aria-controls="read-screen-article" aria-selected="${!video}" tabindex="${video?-1:0}" data-read-mode="read">Read</button><button type="button" id="read-tab-video" role="tab" aria-controls="read-screen-video" aria-selected="${video}" tabindex="${video?0:-1}" data-read-mode="watch">Watch</button></div></div></div>`;
 }
 function markup(item,origin){
  const back=origin?.hash==='#home'?'Home':'Canopy';
  if(item?.format==='video'){
   return `<article class="reading-page video-reading-page"><header class="detail-nav"><button type="button" data-detail-back>← ${back}</button><a href="#home" aria-label="Canopy home">CANOPY</a></header><div class="reading-video-layout"><h1 id="event-page-title">${esc(item.title)}</h1>${videoMarkup(item)}${item.excerpt?`<p>${esc(item.excerpt)}</p>`:''}</div></article>`;
  }
  return `<article class="reading-page"><header class="detail-nav"><button type="button" data-detail-back>← ${back}</button><a href="#home" aria-label="Canopy home">CANOPY</a></header>${item?`<div class="reading-layout"><header class="reading-heading"><h1 id="event-page-title">${esc(item.title)}</h1></header><div class="reading-body"><p class="reading-lead">${esc(item.excerpt)}</p>${(item.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('')}<p class="reading-signature">${esc(item.author)}</p></div></div>`:'<div class="reading-layout"><h1 id="event-page-title">Story unavailable.</h1><p>This story is not available.</p></div>'}</article>`;
 }
 let cleanup=()=>{};
 function mount(root){
  cleanup();const el=root.querySelector('.read-statement');if(!el)return;
  const paths=[...el.querySelectorAll('.read-ink path')],abort=new AbortController();let frame=0,last=0,x=500,target=0,amount=0,velocity=0,box=null;
  const articleLink=el.querySelector('.read-article-link');
  articleLink?.addEventListener('pointerdown',()=>articleLink.setAttribute('data-event-pointer-return',''),{signal:abort.signal});
  articleLink?.addEventListener('keydown',()=>articleLink.removeAttribute('data-event-pointer-return'),{signal:abort.signal});
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const draw=()=>paths.forEach(path=>path.setAttribute('d',`M 9 24 C ${x*.55} ${-3+amount} ${500+x*.2} ${5-amount*.6} 977 17 C 1002 22 994 69 984 107 C 976 139 999 177 976 201 C ${600+x*.25} ${222+amount*.5} ${x*.5} ${213-amount*.65} 15 202 C 2 155 0 73 9 24 Z`));
  function tick(t){frame=0;if(!el.isConnected||document.hidden||document.body.classList.contains('event-detail-open'))return;const dt=Math.min(2,(t-last)/16.667||1);last=t;velocity+=(target-amount)*.06*dt;velocity*=Math.pow(.76,dt);amount+=velocity*dt;draw();if(Math.abs(velocity)+Math.abs(target-amount)>.03)frame=requestAnimationFrame(tick);else last=0;}
  const wake=()=>{if(!frame&&!reduced.matches&&!document.hidden&&!document.body.classList.contains('event-detail-open'))frame=requestAnimationFrame(tick)};
  el.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;box=el.getBoundingClientRect();},{signal:abort.signal});
  el.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduced.matches)return;box ||= el.getBoundingClientRect();x=Math.max(60,Math.min(940,(e.clientX-box.left)/box.width*1000));target=Math.max(-14,Math.min(14,((e.clientY-box.top)/box.height-.5)*32));wake();},{signal:abort.signal});
  el.addEventListener('pointerleave',()=>{target=0;box=null;wake();},{signal:abort.signal});
  const slot=el.querySelector('.read-video-slot'),item=get(slot?.dataset.videoId);
  const stopPlayer=()=>{if(!slot?.classList.contains('is-playing'))return;slot.querySelector('video')?.pause();slot.innerHTML=videoSlot(item);slot.classList.remove('is-playing');el.classList.remove('is-playing');};
  slot?.addEventListener('click',event=>{
   if(!event.target.closest('.read-video-launch')||!item)return;
   slot.innerHTML=videoMarkup(item);slot.classList.add('is-playing');el.classList.add('is-playing');
   const video=slot.querySelector('video');if(video){video.focus();video.play().catch(()=>{});}else slot.querySelector('iframe')?.focus();
  },{signal:abort.signal});
  const tabs=[...el.querySelectorAll('[data-read-mode]')];
  const switchMode=mode=>{
   if(el.dataset.mode===mode)return;
   if(mode==='watch')el.style.minHeight=el.getBoundingClientRect().height+'px';else el.style.minHeight='';
   stopPlayer();el.dataset.mode=mode;
   el.querySelector('.read-article-panel').hidden=mode!=='read';slot.hidden=mode!=='watch';
   tabs.forEach(tab=>{const active=tab.dataset.readMode===mode;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
  };
  tabs.forEach(tab=>{
   tab.addEventListener('click',()=>switchMode(tab.dataset.readMode),{signal:abort.signal});
   tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?tabs[0]:event.key==='End'?tabs[1]:tabs.find(t=>t!==tab);switchMode(next.dataset.readMode);next.focus();},{signal:abort.signal});
  });
  window.addEventListener('resize',()=>{el.style.minHeight='';box=null},{signal:abort.signal});
  const settleInk=()=>{cancelAnimationFrame(frame);frame=0;last=0;target=amount=velocity=0;box=null;draw();};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)settleInk();},{signal:abort.signal});
  document.addEventListener('canopy-event-cover-open',()=>{cancelAnimationFrame(frame);frame=0;last=0;box=null;stopPlayer();},{signal:abort.signal});
  cleanup=()=>{stopPlayer();abort.abort();cancelAnimationFrame(frame)};
 }
 return {teaser,markup,mount,get,setPublished,videoMarkup,get featuredId(){return content.featuredId}};
})();
